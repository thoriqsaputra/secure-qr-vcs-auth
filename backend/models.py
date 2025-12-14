import datetime as dt

from sqlalchemy import Column, DateTime, Integer, LargeBinary, String

from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_uuid = Column(String(64), unique=True, nullable=False, index=True)
    check_in_code = Column(String(16), unique=True, nullable=False, index=True)
    share_b_blob = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="active", nullable=False)
    redeemed_at = Column(DateTime, nullable=True)
