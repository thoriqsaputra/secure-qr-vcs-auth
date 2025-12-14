import io
import logging
import os
import secrets
import string
import time
import uuid
from datetime import datetime
from hashlib import sha256
from hmac import compare_digest, new as hmac_new
from typing import Optional

import numpy as np
import qrcode
import cv2
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel, EmailStr
from pyzbar.pyzbar import decode as qr_decode

import models
from core_crypto import decode_qr_from_image, generate_vcs, image_to_base64, robust_stack
from database import Base, engine, get_session


def _pil_to_bytes(img) -> bytes:
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


app = FastAPI(title="Secure QR VCS Ticketing")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TicketCreateRequest(BaseModel):
    name: str
    email: EmailStr


class TicketCreateResponse(BaseModel):
    user_uuid: str
    check_in_code: str
    code_qr_base64: str
    share_a_base64: str
    original_payload: str


class TicketVerifyResponse(BaseModel):
    valid: bool
    original_data: Optional[str]
    debug_image: str
    aligned_share_a: str
    status: str


@app.on_event("startup")
def on_startup():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
    Base.metadata.create_all(bind=engine)


SIGNING_SECRET = os.getenv("SIGNING_SECRET", "dev-secret-change-me").encode("utf-8")
TICKET_TTL_SECONDS = int(os.getenv("TICKET_TTL_SECONDS", "86400"))  # 24h default
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "3"))
_verify_attempts: dict[str, float] = {}


def _sign_payload(payload_str: str) -> str:
    sig = hmac_new(SIGNING_SECRET, payload_str.encode("utf-8"), sha256).hexdigest()
    return sig


def _build_payload(
    name: str, email: str, user_uuid: str, check_in_code: str, expires_at: float
) -> str:
    payload = f"{name}|{email}|{user_uuid}|{check_in_code}|{int(expires_at)}"
    sig = _sign_payload(payload)
    return f"{payload}|{sig}"


def _verify_payload(payload: str) -> tuple[bool, Optional[str], Optional[dict]]:
    parts = payload.split("|")
    if len(parts) != 6:
        return False, "Malformed payload", None
    name, email, user_uuid, check_in_code, exp_str, sig = parts
    try:
        exp = int(exp_str)
    except ValueError:
        return False, "Invalid expiry", None

    body = f"{name}|{email}|{user_uuid}|{check_in_code}|{exp}"
    expected_sig = _sign_payload(body)
    if not compare_digest(expected_sig, sig):
        return False, "Signature mismatch", None

    now = int(time.time())
    if exp < now:
        return False, "Ticket expired", None
    return True, None, {
        "name": name,
        "email": email,
        "user_uuid": user_uuid,
        "check_in_code": check_in_code,
        "exp": exp,
    }


def _generate_check_in_code(session) -> str:
    digits = string.digits
    while True:
        code = "".join(secrets.choice(digits) for _ in range(8))
        exists = (
            session.query(models.Ticket)
            .filter(models.Ticket.check_in_code == code)
            .one_or_none()
        )
        if not exists:
            return code


def _code_qr_base64(code: str) -> str:
    qr = qrcode.QRCode(border=2, box_size=6)
    qr.add_data(code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    return image_to_base64(img)


def _compose_share_a_with_label(share_a: Image.Image, code: str, uuid_str: str) -> Image.Image:
    """Overlay a larger code QR and readable code/uuid text below the share."""
    base = share_a.convert("RGB")
    label_height = 140
    canvas = Image.new("RGB", (base.width, base.height + label_height), color=(255, 255, 255))
    canvas.paste(base, (0, 0))

    # Larger QR for auto-read reliability with high contrast
    qr_img = qrcode.make(code, box_size=8, border=2).convert("RGB")
    qr_size = min(label_height - 16, 140)
    qr_img = qr_img.resize((qr_size, qr_size), resample=Image.NEAREST)
    qr_x = 12
    qr_y = base.height + (label_height - qr_size) // 2
    canvas.paste(qr_img, (qr_x, qr_y))

    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    text = f"Code: {code}  UUID: {uuid_str}"
    text_x = qr_x + qr_size + 12
    text_y = base.height + label_height // 2 - 10
    draw.text((text_x, text_y), text, fill=(20, 20, 20), font=font)
    return canvas


def _extract_check_in_code(img_bytes: bytes) -> Optional[str]:
    """Try to read the code QR overlaid on Share A using pyzbar then OpenCV."""
    try:
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        return None

    def try_decode_pyzbar(pil_img):
        decoded = qr_decode(pil_img)
        for d in decoded:
            data = d.data.decode("utf-8")
            if data.isdigit() and 6 <= len(data) <= 12:
                return data
        return None

    def try_decode_cv(pil_img):
        arr = np.array(pil_img)
        detector = cv2.QRCodeDetector()
        data, _, _ = detector.detectAndDecode(arr)
        if data and data.isdigit() and 6 <= len(data) <= 12:
            return data
        return None

    w, h = img.size
    band_height = min(200, h)
    label_band = img.crop((0, h - band_height, w, h))

    for attempt in (
        lambda: try_decode_pyzbar(label_band),
        lambda: try_decode_pyzbar(Image.fromarray(255 - np.array(label_band))),
        lambda: try_decode_cv(label_band),
        lambda: try_decode_cv(Image.fromarray(255 - np.array(label_band))),
    ):
        code = attempt()
        if code:
            return code
    return None


@app.post("/api/tickets/create", response_model=TicketCreateResponse)
def create_ticket(payload: TicketCreateRequest):
    user_uuid = str(uuid.uuid4())
    expires_at = int(time.time()) + TICKET_TTL_SECONDS
    with get_session() as session:
        check_in_code = _generate_check_in_code(session)
        combined_data = _build_payload(
            payload.name, payload.email, user_uuid, check_in_code, expires_at
        )

        code_qr_b64 = _code_qr_base64(check_in_code)
        share_a_img, share_b_img = generate_vcs(combined_data)
        composed_share_a = _compose_share_a_with_label(share_a_img, check_in_code, user_uuid)
        share_b_bytes = _pil_to_bytes(share_b_img)
        share_a_b64 = image_to_base64(composed_share_a)

        ticket = models.Ticket(
            user_uuid=user_uuid,
            check_in_code=check_in_code,
            share_b_blob=share_b_bytes,
            expires_at=datetime.utcfromtimestamp(expires_at),
            status="active",
        )
        session.add(ticket)
        session.commit()

    return TicketCreateResponse(
        user_uuid=user_uuid,
        check_in_code=check_in_code,
        code_qr_base64=code_qr_b64,
        share_a_base64=share_a_b64,
        original_payload=combined_data,
    )


@app.post("/api/tickets/verify", response_model=TicketVerifyResponse)
async def verify_ticket(check_in_code: Optional[str] = Form(None), file: UploadFile = File(...)):
    now_ts = time.time()

    share_a_bytes = await file.read()

    code_used = check_in_code or _extract_check_in_code(share_a_bytes)
    if not code_used:
        raise HTTPException(status_code=400, detail="Missing check-in code (could not read from image).")

    last_attempt = _verify_attempts.get(code_used)
    if last_attempt and now_ts - last_attempt < RATE_LIMIT_WINDOW:
        raise HTTPException(
            status_code=429,
            detail="Too many verification attempts. Please wait a few seconds.",
        )

    with get_session() as session:
        ticket = (
            session.query(models.Ticket)
            .filter(models.Ticket.check_in_code == code_used)
            .one_or_none()
        )
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == "redeemed":
        raise HTTPException(status_code=400, detail="Ticket already redeemed")

    if ticket.expires_at:
        try:
            exp_ts = int(ticket.expires_at.timestamp())
        except AttributeError:
            exp_ts = None
        if exp_ts and exp_ts < now_ts:
            ticket.status = "expired"
            with get_session() as session:
                session.merge(ticket)
                session.commit()
            raise HTTPException(status_code=400, detail="Ticket expired")

    _verify_attempts[code_used] = now_ts
    share_b_bytes = ticket.share_b_blob

    try:
        stacked_img, aligned_img = robust_stack(share_a_bytes, share_b_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    decoded_data = decode_qr_from_image(stacked_img)
    valid = bool(decoded_data)
    status = ticket.status

    if decoded_data:
        sig_ok, err_msg, parsed = _verify_payload(decoded_data)
        if not sig_ok:
            raise HTTPException(status_code=400, detail=err_msg or "Invalid payload")
        if parsed and parsed["check_in_code"] != ticket.check_in_code:
            raise HTTPException(status_code=400, detail="Check-in code mismatch")
        status = "redeemed"
        ticket.status = "redeemed"
        ticket.redeemed_at = datetime.utcfromtimestamp(now_ts)
        with get_session() as session:
            session.merge(ticket)
            session.commit()

    return TicketVerifyResponse(
        valid=valid,
        original_data=decoded_data if decoded_data else None,
        debug_image=image_to_base64(stacked_img),
        aligned_share_a=image_to_base64(aligned_img),
        status=status,
    )
