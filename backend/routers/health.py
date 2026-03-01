"""
routers/health.py — Health Loop API routes (prescriptions, medicines, intake tracking).
"""
import os
import uuid
import shutil
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.medicine import Prescription, Medicine, MedicineIntakeLog
from agents.orchestrator import orchestrator, AgentEvent
from config import settings

router = APIRouter(prefix="/api/health", tags=["health"])

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
UPLOAD_DIR = settings.LOCAL_UPLOAD_PATH


DEMO_MEDICINES = [
    {
        "id": "m1",
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "schedule_times": ["08:00", "21:00"],
        "pills_remaining": 24,
        "total_pills": 60,
        "prescribed_for": "Lakshmi Devi (Mother)",
        "start_date": "2026-02-01",
        "end_date": "2026-03-03",
        "is_active": True,
        "today_status": [{"time": "08:00", "status": "taken"}, {"time": "21:00", "status": "pending"}],
    },
    {
        "id": "m2",
        "name": "Vitamin D3",
        "dosage": "60000 IU",
        "frequency": "Once weekly",
        "schedule_times": ["08:00"],
        "pills_remaining": 8,
        "total_pills": 13,
        "prescribed_for": "Priya (Self)",
        "start_date": "2026-01-05",
        "end_date": "2026-04-05",
        "is_active": True,
        "today_status": [],
    },
    {
        "id": "m3",
        "name": "Atorvastatin",
        "dosage": "10mg",
        "frequency": "Once daily at night",
        "schedule_times": ["21:00"],
        "pills_remaining": 5,
        "total_pills": 30,
        "prescribed_for": "Lakshmi Devi (Mother)",
        "start_date": "2026-02-01",
        "end_date": "2026-03-03",
        "is_active": True,
        "refill_needed": True,
        "today_status": [{"time": "21:00", "status": "pending"}],
    },
]

DEMO_PRESCRIPTIONS = [
    {
        "id": "rx1",
        "doctor_name": "Dr. Ramesh Sharma",
        "prescribed_for": "Lakshmi Devi (Mother)",
        "prescription_date": "2026-02-01",
        "medicine_count": 2,
        "processed": True,
    },
    {
        "id": "rx2",
        "doctor_name": "Dr. Anita Kaur",
        "prescribed_for": "Priya (Self)",
        "prescription_date": "2026-01-05",
        "medicine_count": 1,
        "processed": True,
    },
]


@router.get("/medicines")
async def list_medicines(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"medicines": DEMO_MEDICINES, "refills_needed": [m for m in DEMO_MEDICINES if m.get("refill_needed")]}
    result = await db.execute(
        select(Medicine).where(Medicine.user_id == DEMO_USER_ID, Medicine.is_active == True)
    )
    return {"medicines": [m.__dict__ for m in result.scalars().all()]}


@router.get("/prescriptions")
async def list_prescriptions(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"prescriptions": DEMO_PRESCRIPTIONS}
    result = await db.execute(
        select(Prescription).where(Prescription.user_id == DEMO_USER_ID)
    )
    return {"prescriptions": [p.__dict__ for p in result.scalars().all()]}


@router.post("/prescriptions/upload")
async def upload_prescription(
    file: UploadFile = File(...),
    prescribed_for: str = Form(""),
    db: AsyncSession = Depends(get_db),
):
    # Save uploaded image
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"rx_{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Process through orchestrator
    event = AgentEvent(
        type="prescription_uploaded",
        domain="health",
        user_id=DEMO_USER_ID,
        payload={
            "image_path": file_path,
            "prescribed_for": prescribed_for,
        },
    )
    response = await orchestrator.process_event(event, db)
    return {
        "success": response.success,
        "prescription_id": str(uuid.uuid4()),
        "image_path": file_path,
        "cognitive_minutes_saved": response.cognitive_minutes_saved,
        **response.result,
    }


@router.put("/medicines/{medicine_id}/taken")
async def mark_medicine_taken(medicine_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": f"Medicine {medicine_id} marked as taken"}
    result = await db.execute(select(Medicine).where(Medicine.id == medicine_id))
    medicine = result.scalar_one_or_none()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    if medicine.pills_remaining:
        medicine.pills_remaining = max(0, medicine.pills_remaining - 1)
    log = MedicineIntakeLog(
        medicine_id=medicine.id,
        taken_at=datetime.utcnow(),
        status="taken",
    )
    db.add(log)
    await db.commit()
    return {"message": "Medicine marked as taken"}


@router.put("/medicines/{medicine_id}/skip")
async def skip_medicine(medicine_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": f"Medicine {medicine_id} skipped"}
    result = await db.execute(select(Medicine).where(Medicine.id == medicine_id))
    medicine = result.scalar_one_or_none()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    log = MedicineIntakeLog(
        medicine_id=medicine.id,
        taken_at=datetime.utcnow(),
        status="skipped",
    )
    db.add(log)
    await db.commit()
    return {"message": "Medicine skipped"}


@router.get("/refills/upcoming")
async def upcoming_refills(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"refills": [m for m in DEMO_MEDICINES if m.get("refill_needed")]}
    return {"refills": []}


@router.get("/history")
async def health_history(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"history": DEMO_PRESCRIPTIONS, "medicines": DEMO_MEDICINES}
    return {"history": []}
