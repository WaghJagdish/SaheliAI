"""
models/reminder.py — Unified reminder model.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    type = Column(String(50), nullable=False)         # birthday, medicine, school_event, refill
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    entity_type = Column(String(50))
    trigger_at = Column(DateTime(timezone=True), nullable=False)
    title = Column(Text, nullable=False)
    body = Column(Text)
    status = Column(String(20), default="pending")    # pending, sent, failed, dismissed
    channel = Column(String(20), default="in_app")   # in_app, whatsapp, sms
    retry_count = Column(Integer, default=0)
    sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
