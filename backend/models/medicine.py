"""
models/medicine.py — Health loop database models.
"""
import uuid
from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    image_url = Column(Text)
    raw_ocr_text = Column(Text)
    doctor_name = Column(String(255))
    prescribed_for = Column(String(255))
    prescription_date = Column(Date)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    medicines = relationship("Medicine", back_populates="prescription", cascade="all, delete-orphan")


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"))
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100))
    frequency = Column(String(100))
    times_per_day = Column(Integer)
    schedule_times = Column(JSONB)  # ["08:00", "20:00"]
    duration_days = Column(Integer)
    start_date = Column(Date)
    end_date = Column(Date)
    total_pills = Column(Integer)
    pills_remaining = Column(Integer)
    refill_alert_sent = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    prescription = relationship("Prescription", back_populates="medicines")
    intake_logs = relationship("MedicineIntakeLog", back_populates="medicine", cascade="all, delete-orphan")


class MedicineIntakeLog(Base):
    __tablename__ = "medicine_intake_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_id = Column(UUID(as_uuid=True), ForeignKey("medicines.id"))
    scheduled_time = Column(DateTime(timezone=True))
    taken_at = Column(DateTime(timezone=True))
    status = Column(String(20), default="pending")  # pending, taken, skipped, missed
    notes = Column(Text)

    medicine = relationship("Medicine", back_populates="intake_logs")
