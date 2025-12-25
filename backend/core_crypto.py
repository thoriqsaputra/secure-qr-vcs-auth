import base64
import io
import math
import secrets
from typing import Tuple

import cv2
import numpy as np
import qrcode
from PIL import Image


def _pil_to_bytes(img: Image.Image, fmt: str = "PNG") -> bytes:
    buffer = io.BytesIO()
    img.save(buffer, format=fmt)
    return buffer.getvalue()


def generate_vcs(data: str) -> Tuple[Image.Image, Image.Image]:
    """
    Generate two VCS shares from the provided data string.
    Share A includes ArUco markers in corners for robust alignment at any rotation.
    """
    qr = qrcode.QRCode(border=4, box_size=4, error_correction=qrcode.constants.ERROR_CORRECT_H)
    qr.add_data(data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("1")

    # Upscale by integer factor to keep modules crisp and ensure even dimensions.
    w, h = qr_img.size
    scale = max(1, math.ceil(300 / max(w, h)))
    qr_img = qr_img.resize((w * scale, h * scale), resample=Image.NEAREST)

    if qr_img.size[0] % 2 != 0 or qr_img.size[1] % 2 != 0:
        arr = np.array(qr_img)
        pad_h = 0 if arr.shape[0] % 2 == 0 else 1
        pad_w = 0 if arr.shape[1] % 2 == 0 else 1
        arr = np.pad(arr, ((0, pad_h), (0, pad_w)), mode="constant", constant_values=255)
        qr_img = Image.fromarray(arr)

    qr_array = np.array(qr_img)
    is_black = qr_array == 0

    patterns = [
        np.array([[True, False], [False, True]], dtype=bool),
        np.array([[False, True], [True, False]], dtype=bool),
    ]

    height, width = is_black.shape
    share_a = np.zeros((height * 2, width * 2), dtype=bool)
    share_b = np.zeros_like(share_a)

    for y in range(height):
        for x in range(width):
            pattern = patterns[secrets.randbelow(len(patterns))]
            block_y, block_x = y * 2, x * 2
            share_a[block_y : block_y + 2, block_x : block_x + 2] = pattern
            if is_black[y, x]:
                share_b[block_y : block_y + 2, block_x : block_x + 2] = ~pattern
            else:
                share_b[block_y : block_y + 2, block_x : block_x + 2] = pattern

    share_a_img = Image.fromarray(np.where(share_a, 0, 255).astype(np.uint8), mode="L")
    share_b_img = Image.fromarray(np.where(share_b, 0, 255).astype(np.uint8), mode="L")

    # Add identical ArUco markers to BOTH shares for robust alignment
    # When XOR'd together, identical markers cancel out to white (no interference with QR)
    share_a_img = _add_aruco_markers(share_a_img)
    share_b_img = _add_aruco_markers(share_b_img)

    return share_a_img, share_b_img


def _add_aruco_markers(share_img: Image.Image) -> Image.Image:
    """
    Add ArUco markers in a BORDER around the VCS share (not overlapping).
    This preserves the VCS pattern integrity.

    Creates a white border with ArUco markers at corners:
    - Top-left: ID 0
    - Top-right: ID 1
    - Bottom-right: ID 2
    - Bottom-left: ID 3
    """
    # Convert to numpy for OpenCV manipulation
    vcs_array = np.array(share_img)
    h_vcs, w_vcs = vcs_array.shape

    # ArUco settings
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker_size = 80  # pixels
    border_width = 100  # white border around VCS

    # Create new image with border
    h_new = h_vcs + 2 * border_width
    w_new = w_vcs + 2 * border_width

    # White background
    img_with_border = np.full((h_new, w_new), 255, dtype=np.uint8)

    # Paste VCS share in center
    img_with_border[border_width:border_width+h_vcs, border_width:border_width+w_vcs] = vcs_array

    # Add ArUco markers in the border (corners)
    marker_ids = [0, 1, 2, 3]
    margin = 10  # pixels from edge of border

    positions = [
        (margin, margin),  # Top-left
        (w_new - marker_size - margin, margin),  # Top-right
        (w_new - marker_size - margin, h_new - marker_size - margin),  # Bottom-right
        (margin, h_new - marker_size - margin),  # Bottom-left
    ]

    for marker_id, (x, y) in zip(marker_ids, positions):
        # Generate marker
        marker = cv2.aruco.generateImageMarker(aruco_dict, marker_id, marker_size)
        # Place marker on border
        img_with_border[y:y+marker_size, x:x+marker_size] = marker

    return Image.fromarray(img_with_border)


def _load_cv_gray(image_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(array, cv2.IMREAD_GRAYSCALE)


def robust_stack(img_share_a_bytes: bytes, img_share_b_bytes: bytes) -> Tuple[Image.Image, Image.Image]:
    """
    Align share A to share B. Tries multiple strategies in order:
    1. ArUco marker detection (most robust, works at any rotation)
    2. Direct stacking (fast path for digital uploads)
    3. ORB + Homography alignment (fallback for scans without markers)
    Returns the best result (stacked_pil, aligned_share_a_pil).
    """
    share_a_gray = _load_cv_gray(img_share_a_bytes)
    share_b_gray = _load_cv_gray(img_share_b_bytes)
    if share_a_gray is None or share_b_gray is None:
        raise ValueError("Invalid image data for stacking")

    # Store original Share A for ArUco detection (don't crop yet!)
    share_a_original = share_a_gray.copy()

    # Crop Share A to Share B dimensions for direct stacking (Strategy 2)
    share_a_cropped = share_a_gray
    if share_a_gray.shape[0] > share_b_gray.shape[0]:
        share_a_cropped = share_a_gray[: share_b_gray.shape[0], : share_b_gray.shape[1]]

    def process_pair(img_a, img_b, mask_aruco=False):
        # Resize if needed (safety)
        if img_a.shape != img_b.shape:
             try:
                img_a = cv2.resize(img_a, (img_b.shape[1], img_b.shape[0]))
             except Exception:
                return Image.new("L", (1, 1)), Image.new("L", (1, 1))

        _, bin_a = cv2.threshold(img_a, 128, 255, cv2.THRESH_BINARY)
        _, bin_b = cv2.threshold(img_b, 128, 255, cv2.THRESH_BINARY)

        # If masking ArUco regions, fill them with white (255) before XOR
        if mask_aruco:
            marker_size = 80
            margin = 10
            h, w = bin_a.shape

            # Define marker regions (corners)
            marker_regions = [
                (margin, margin, margin + marker_size, margin + marker_size),  # Top-left
                (w - marker_size - margin, margin, w - margin, margin + marker_size),  # Top-right
                (w - marker_size - margin, h - marker_size - margin, w - margin, h - margin),  # Bottom-right
                (margin, h - marker_size - margin, margin + marker_size, h - margin),  # Bottom-left
            ]

            # Fill marker regions with white in both images
            for (x1, y1, x2, y2) in marker_regions:
                bin_a[y1:y2, x1:x2] = 255
                bin_b[y1:y2, x1:x2] = 255

        stacked = cv2.bitwise_not(cv2.bitwise_xor(bin_a, bin_b))

        # Downsample
        h, w = stacked.shape
        downsampled = stacked
        if h % 2 == 0 and w % 2 == 0:
            downsampled = cv2.resize(stacked, (w // 2, h // 2), interpolation=cv2.INTER_NEAREST)

        return Image.fromarray(downsampled), Image.fromarray(bin_a)

    # Strategy 1: ArUco Marker Detection (Robust for cardinal rotations)
    # Use simple array operations to de-rotate Share A
    # This preserves VCS pattern perfectly (no interpolation artifacts)
    aligned_a = share_a_cropped
    try:
        rotation_angle, border_width = _detect_aruco_homography(share_a_original, share_b_gray)
        if rotation_angle is not None and rotation_angle in [0, 90, 180, 270]:
            # Extract VCS portions (remove border from both shares)
            share_a_vcs = share_a_original[border_width:-border_width, border_width:-border_width]
            share_b_vcs = share_b_gray[border_width:-border_width, border_width:-border_width]

            # De-rotate using simple array operations (pixel-perfect)
            if rotation_angle == 90:
                # Was rotated 90° CW, undo by rotating 90° CCW
                share_a_vcs_aligned = np.rot90(share_a_vcs, k=1)
            elif rotation_angle == 180:
                share_a_vcs_aligned = np.rot90(share_a_vcs, k=2)
            elif rotation_angle == 270:
                # Was rotated 270° CW (90° CCW), undo by rotating 90° CW
                share_a_vcs_aligned = np.rot90(share_a_vcs, k=-1)
            else:  # rotation_angle == 0
                share_a_vcs_aligned = share_a_vcs

            # Stack VCS portions (no masking needed - ArUco markers are outside)
            aruco_stacked, aruco_aligned = process_pair(share_a_vcs_aligned, share_b_vcs, mask_aruco=False)
            if decode_qr_from_image(aruco_stacked):
                return aruco_stacked, aruco_aligned
    except Exception:
        pass  # Fallback to next strategy

    # Strategy 2: Direct Stacking (Fast path for digital uploads)
    direct_stacked, direct_aligned = process_pair(share_a_cropped, share_b_gray)
    if decode_qr_from_image(direct_stacked):
        return direct_stacked, direct_aligned

    # Strategy 3: ORB Alignment (Fallback for scans/photos without ArUco)
    try:
        orb = cv2.ORB_create(2000)
        kp_a, des_a = orb.detectAndCompute(share_a_cropped, None)
        kp_b, des_b = orb.detectAndCompute(share_b_gray, None)

        if des_a is not None and des_b is not None and len(kp_a) >= 4 and len(kp_b) >= 4:
            matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = matcher.match(des_a, des_b)
            matches = sorted(matches, key=lambda m: m.distance)
            if len(matches) >= 4:
                best_matches = matches[:50]
                src_pts = np.float32([kp_a[m.queryIdx].pt for m in best_matches]).reshape(-1, 1, 2)
                dst_pts = np.float32([kp_b[m.trainIdx].pt for m in best_matches]).reshape(-1, 1, 2)
                H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
                if H is not None:
                    h, w = share_b_gray.shape
                    aligned_a = cv2.warpPerspective(
                        share_a_cropped, H, (w, h), flags=cv2.INTER_NEAREST
                    )
    except Exception:
        pass # Fallback to original if alignment fails

    aligned_stacked, aligned_img_pil = process_pair(aligned_a, share_b_gray)

    # Return the aligned result (even if it fails to decode, it's our best bet for debug)
    return aligned_stacked, aligned_img_pil


def _detect_aruco_homography(share_a_gray: np.ndarray, share_b_gray: np.ndarray) -> tuple:
    """
    Detect ArUco markers in Share A and calculate rotation angle.

    Returns:
        Tuple of (rotation_angle, border_width) where rotation_angle is 0, 90, 180, 270, or None
    """
    # ArUco detector parameters
    aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    parameters = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)

    # Detect markers in Share A
    corners_a, ids_a, _ = detector.detectMarkers(share_a_gray)

    # Need at least 4 markers
    if ids_a is None or len(ids_a) < 4:
        return None, 0

    border_width = 100  # Border width used in _add_aruco_markers

    # Find where each marker ID is located in Share A
    detected_positions = {}
    for i, marker_id in enumerate(ids_a.flatten()):
        corner = corners_a[i][0]
        center = corner.mean(axis=0)
        detected_positions[marker_id] = center

    # Check if we have all 4 markers
    if len(detected_positions) < 4:
        return None, 0

    # Determine rotation by checking where marker 0 (should be top-left) ended up
    # Get image center
    h, w = share_a_gray.shape
    center_x, center_y = w / 2, h / 2

    # Get marker 0 position
    if 0 not in detected_positions:
        return None, 0

    m0_x, m0_y = detected_positions[0]

    # Determine which quadrant marker 0 is in relative to center
    # rotation_angle represents how much to rotate CCW to get back to 0°
    if m0_x < center_x and m0_y < center_y:
        # Top-left quadrant - no rotation
        rotation_angle = 0
    elif m0_x > center_x and m0_y < center_y:
        # Top-right quadrant - image was rotated 90° CW, need 90° CCW to undo
        rotation_angle = 90
    elif m0_x > center_x and m0_y > center_y:
        # Bottom-right quadrant - rotated 180°
        rotation_angle = 180
    elif m0_x < center_x and m0_y > center_y:
        # Bottom-left quadrant - image was rotated 90° CCW, need 90° CW to undo
        rotation_angle = 270
    else:
        rotation_angle = 0

    return rotation_angle, border_width


def decode_qr_from_image(img: Image.Image) -> str:
    """Decode QR using pyzbar if available, otherwise fallback to OpenCV."""
    try:
        from pyzbar.pyzbar import decode as qr_decode
    except ImportError:
        qr_decode = None

    if qr_decode:
        decoded = qr_decode(img)
        if decoded:
            return decoded[0].data.decode("utf-8")
        inverted = Image.fromarray(255 - np.array(img))
        decoded = qr_decode(inverted)
        if decoded:
            return decoded[0].data.decode("utf-8")

    # Fallback to OpenCV
    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(np.array(img))
    if data:
        return data
    data, _, _ = detector.detectAndDecode(255 - np.array(img))
    return data or ""


def image_to_base64(img: Image.Image) -> str:
    return base64.b64encode(_pil_to_bytes(img)).decode("utf-8")


def base64_to_bytes(encoded: str) -> bytes:
    return base64.b64decode(encoded)
