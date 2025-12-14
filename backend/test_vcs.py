import io
import os

import cv2
import numpy as np

from core_crypto import decode_qr_from_image, generate_vcs, robust_stack

# NOTE: _build_payload/_verify_payload pick up SIGNING_SECRET at import time.
from main import _build_payload, _verify_payload


def decode_with_cv(img):
    arr = np.array(img)
    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(arr)
    return data


def save_artifacts(share_a, share_b, aligned, stacked):
    share_a.save("share_a.png")
    share_b.save("share_b.png")
    aligned.save("aligned.png")
    stacked.save("stacked.png")


def round_trip():
    """Generate shares, stack, decode, and validate signature/expiry."""
    payload = _build_payload("test", "user@example.com", "123", "87654321", 4102444800)  # far future expiry
    share_a, share_b = generate_vcs(payload)

    buf_a = io.BytesIO(); share_a.save(buf_a, format="PNG")
    buf_b = io.BytesIO(); share_b.save(buf_b, format="PNG")

    stacked, aligned = robust_stack(buf_a.getvalue(), buf_b.getvalue())
    pyzbar_decoded = decode_qr_from_image(stacked)
    cv_decoded = decode_with_cv(stacked)

    pyzbar_valid, pyzbar_err, _ = _verify_payload(pyzbar_decoded) if pyzbar_decoded else (False, "empty", None)
    cv_valid, cv_err, _ = _verify_payload(cv_decoded) if cv_decoded else (False, "empty", None)

    save_artifacts(share_a, share_b, aligned, stacked)

    print("=== Round-trip ===")
    print("stacked size:", stacked.size)
    print("pyzbar decoded:", pyzbar_decoded)
    print("opencv decoded:", cv_decoded)
    print("pyzbar payload valid:", pyzbar_valid, pyzbar_err)
    print("opencv payload valid:", cv_valid, cv_err)

    assert pyzbar_valid or cv_valid, "Payload did not validate via pyzbar or OpenCV"
    return pyzbar_decoded or cv_decoded


def tamper_check(decoded_payload: str):
    """Ensure signature verification fails if payload is tampered."""
    if not decoded_payload:
        print("Skipping tamper check: no decoded payload")
        return
    parts = decoded_payload.split("|")
    if len(parts) != 6:
        print("Skipping tamper check: malformed payload parts")
        return
    parts[0] = "mallory"  # change name
    tampered = "|".join(parts)
    ok, err, _ = _verify_payload(tampered)
    print("=== Tamper check ===")
    print("tampered payload valid:", ok, err)
    assert not ok, "Tampered payload unexpectedly verified"


def main():
    os.environ.setdefault("SIGNING_SECRET", "test-secret")
    decoded_payload = round_trip()
    tamper_check(decoded_payload)
    print("Artifacts saved: share_a.png, share_b.png, aligned.png, stacked.png")


if __name__ == "__main__":
    main()
