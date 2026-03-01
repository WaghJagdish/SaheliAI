"""
models/school_event.py — School loop database models.
"""
import uuid
from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class Child(Base):
    __tablename__ = "children"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String(255), nullable=False)
    class_name = Column(String(50))
    school_name = Column(String(255))
    section = Column(String(10))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    circulars = relationship("Circular", back_populates="child", cascade="all, delete-orphan")
    events = relationship("SchoolEvent", back_populates="child")


class Circular(Base):
    __tablename__ = "circulars"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    image_url = Column(Text)
    raw_ocr_text = Column(Text)
    upload_date = Column(DateTime(timezone=True), default=datetime.utcnow)
    processed = Column(Boolean, default=False)

    child = relationship("Child", back_populates="circulars")
    events = relationship("SchoolEvent", back_populates="circular")


class SchoolEvent(Base):
    __tablename__ = "school_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    circular_id = Column(UUID(as_uuid=True), ForeignKey("circulars.id"))
    child_id = Column(UUID(as_uuid=True), ForeignKey("children.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    event_name = Column(String(255), nullable=False)
    event_date = Column(Date)
    deadline_date = Column(Date)
    fee_amount = Column(Integer)
    fee_paid = Column(Boolean, default=False)
    special_instructions = Column(Text)
    whatsapp_reply_draft = Column(Text)
    calendar_added = Column(Boolean, default=False)
    reminder_sent = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    child = relationship("Child", back_populates="events")
    circular = relationship("Circular", back_populates="events")
