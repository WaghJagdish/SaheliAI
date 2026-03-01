"""
models/audit_log.py — Audit trail and cognitive metrics models.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    agent = Column(String(50))
    action = Column(String(100))
    input_summary = Column(Text)
    output_summary = Column(Text)
    llm_tokens_used = Column(Integer)
    cognitive_minutes_saved = Column(Integer, default=0)
    success = Column(Boolean, default=True)
    error_message = Column(Text)
    duration_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class CognitiveEvent(Base):
    __tablename__ = "cognitive_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    event_type = Column(String(100))
    minutes_saved = Column(Integer)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
