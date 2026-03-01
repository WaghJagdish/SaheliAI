"""
models/person.py — Relationship loop database models.
"""
import uuid
from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String(255), nullable=False)
    relation = Column(String(100), nullable=False)
    birthday = Column(Date, nullable=False)
    gift_budget = Column(Integer)
    phone = Column(String(20))
    notes = Column(Text)
    photo_url = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    birthday_events = relationship("BirthdayEvent", back_populates="person", cascade="all, delete-orphan")


class BirthdayEvent(Base):
    __tablename__ = "birthday_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id", ondelete="CASCADE"))
    year = Column(Integer, nullable=False)
    reminder_sent_3days = Column(Boolean, default=False)
    reminder_sent_day_of = Column(Boolean, default=False)
    gift_suggestions = Column(JSONB)
    whatsapp_draft = Column(Text)
    message_sent = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    cognitive_minutes_saved = Column(Integer, default=0)

    person = relationship("Person", back_populates="birthday_events")
    gift_suggestion_records = relationship("GiftSuggestion", back_populates="birthday_event", cascade="all, delete-orphan")


class GiftSuggestion(Base):
    __tablename__ = "gift_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    birthday_event_id = Column(UUID(as_uuid=True), ForeignKey("birthday_events.id"))
    suggestion_text = Column(Text, nullable=False)
    estimated_price = Column(Integer)
    purchase_url = Column(Text)
    selected = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    birthday_event = relationship("BirthdayEvent", back_populates="gift_suggestion_records")
