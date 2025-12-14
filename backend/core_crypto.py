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
    return share_a_img, share_b_img


def _load_cv_gray(image_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(array, cv2.IMREAD_GRAYSCALE)


def robust_stack(img_share_a_bytes: bytes, img_share_b_bytes: bytes) -> Tuple[Image.Image, Image.Image]:
    """
    Align share A to share B. Tries two strategies:
    1. Direct stacking (assuming digital upload/perfect alignment).
    2. ORB + Homography alignment (for scans/photos).
    Returns the best result (stacked_pil, aligned_share_a_pil).
    """
    share_a_gray = _load_cv_gray(img_share_a_bytes)
    share_b_gray = _load_cv_gray(img_share_b_bytes)
    if share_a_gray is None or share_b_gray is None:
        raise ValueError("Invalid image data for stacking")

    # If share A has a label/footer, crop to Share B's dimensions
    if share_a_gray.shape[0] > share_b_gray.shape[0]:
        share_a_gray = share_a_gray[: share_b_gray.shape[0], : share_b_gray.shape[1]]

    def process_pair(img_a, img_b):
        # Resize if needed (safety)
        if img_a.shape != img_b.shape:
             try:
                img_a = cv2.resize(img_a, (img_b.shape[1], img_b.shape[0]))
             except Exception:
                return Image.new("L", (1, 1)), Image.new("L", (1, 1))
        
        _, bin_a = cv2.threshold(img_a, 128, 255, cv2.THRESH_BINARY)
        _, bin_b = cv2.threshold(img_b, 128, 255, cv2.THRESH_BINARY)
        stacked = cv2.bitwise_not(cv2.bitwise_xor(bin_a, bin_b))
        
        # Downsample
        h, w = stacked.shape
        downsampled = stacked
        if h % 2 == 0 and w % 2 == 0:
            downsampled = cv2.resize(stacked, (w // 2, h // 2), interpolation=cv2.INTER_NEAREST)
            
        return Image.fromarray(downsampled), Image.fromarray(bin_a)

    # Strategy 1: Direct Stacking (Fast path for digital uploads)
    # This avoids ORB noise if the user just uploaded the file they downloaded.
    direct_stacked, direct_aligned = process_pair(share_a_gray, share_b_gray)
    if decode_qr_from_image(direct_stacked):
        return direct_stacked, direct_aligned

    # Strategy 2: ORB Alignment (Robust path for scans/photos)
    aligned_a = share_a_gray
    try:
        orb = cv2.ORB_create(2000)
        kp_a, des_a = orb.detectAndCompute(share_a_gray, None)
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
                        share_a_gray, H, (w, h), flags=cv2.INTER_NEAREST
                    )
    except Exception:
        pass # Fallback to original if alignment fails

    aligned_stacked, aligned_img_pil = process_pair(aligned_a, share_b_gray)
    
    # Return the aligned result (even if it fails to decode, it's our best bet for debug)
    return aligned_stacked, aligned_img_pil


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
