"""
Offline round-trip tester for the VCS pipeline without hitting the API/DB.

Run:
  SIGNING_SECRET=test-secret uv run python demo_roundtrip.py

Outputs:
  - share_a_labeled.png (what the user gets)
  - share_b.png (server-side share)
  - aligned.png (aligned Share A after homography)
  - stacked.png (reconstructed QR)
Prints decode + validation results to stdout.
"""

import io
import os
import uuid

from PIL import Image

from core_crypto import decode_qr_from_image, generate_vcs, robust_stack
from main import (
    _build_payload,
    _compose_share_a_with_label,
    _extract_check_in_code,
    _verify_payload,
)


def main():
    # Synthetic ticket data
    user_uuid = str(uuid.uuid4())
    check_in_code = "12345678"
    payload = _build_payload("Test User", "user@example.com", user_uuid, check_in_code, 4102444800)

    # Generate shares
    share_a, share_b = generate_vcs(payload)
    labeled_share_a = _compose_share_a_with_label(share_a, check_in_code, user_uuid)

    # Bytes for stacking
    buf_a = io.BytesIO()
    labeled_share_a.save(buf_a, format="PNG")
    buf_b = io.BytesIO()
    share_b.save(buf_b, format="PNG")

    # Stack and decode
    stacked, aligned = robust_stack(buf_a.getvalue(), buf_b.getvalue())
    pyzbar_decoded = decode_qr_from_image(stacked)
    code_extracted = _extract_check_in_code(buf_a.getvalue())
    valid, err, parsed = _verify_payload(pyzbar_decoded) if pyzbar_decoded else (False, "empty", None)

    # Save artifacts
    labeled_share_a.save("share_a_labeled.png")
    share_b.save("share_b.png")
    aligned.save("aligned.png")
    stacked.save("stacked.png")

    print("=== Demo Round-trip ===")
    print("UUID:", user_uuid)
    print("Check-in code:", check_in_code)
    print("Extracted code from Share A label:", code_extracted)
    print("Decoded payload:", pyzbar_decoded)
    print("Payload valid:", valid, err)
    print("Parsed:", parsed)
    print("Saved: share_a_labeled.png, share_b.png, aligned.png, stacked.png")


if __name__ == "__main__":
    # Allow reproducible secret in env; default is dev secret from main.py
    if "SIGNING_SECRET" not in os.environ:
        os.environ["SIGNING_SECRET"] = "test-secret"
    main()
