"""
routers/school.py — School Loop API routes (children, circulars, events).
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
from models.school_event import Child, Circular, SchoolEvent
from agents.orchestrator import orchestrator, AgentEvent
from config import settings

router = APIRouter(prefix="/api/school", tags=["school"])

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"
UPLOAD_DIR = settings.LOCAL_UPLOAD_PATH


class ChildCreate(BaseModel):
    name: str
    class_name: str
    school_name: str
    section: Optional[str] = None


DEMO_CHILDREN = [
    {"id": "c1", "name": "Arjun Sharma", "class_name": "Class 5", "school_name": "St. Mary's International School", "section": "B"},
]

DEMO_EVENTS = [
    {
        "id": "e1",
        "event_name": "Annual Sports Day",
        "event_date": "2026-03-15",
        "deadline_date": "2026-03-10",
        "fee_amount": 250,
        "fee_paid": False,
        "special_instructions": "Send P.E. kit and sports shoes",
        "child_name": "Arjun Sharma",
        "whatsapp_reply_draft": "Respected Ma'am, Thank you for informing about the Annual Sports Day. We have noted the details and Arjun will be prepared. Warm regards, Priya Sharma",
        "days_until": 14,
        "days_until_deadline": 9,
        "action_required": True,
    },
    {
        "id": "e2",
        "event_name": "Parent-Teacher Meeting",
        "event_date": "2026-03-20",
        "deadline_date": "2026-03-18",
        "fee_amount": None,
        "fee_paid": False,
        "special_instructions": "Bring previous term report card",
        "child_name": "Arjun Sharma",
        "whatsapp_reply_draft": "Respected Sir/Ma'am, Thank you for the reminder about the Parent-Teacher Meeting on March 20th. We will be present. Regards, Priya Sharma",
        "days_until": 19,
        "days_until_deadline": 17,
        "action_required": True,
    },
]


@router.get("/children")
async def list_children(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"children": DEMO_CHILDREN}
    result = await db.execute(select(Child).where(Child.user_id == DEMO_USER_ID))
    return {"children": [c.__dict__ for c in result.scalars().all()]}


@router.post("/children", status_code=status.HTTP_201_CREATED)
async def add_child(body: ChildCreate, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"id": str(uuid.uuid4()), **body.model_dump(), "message": "Child added (demo mode)"}
    child = Child(user_id=uuid.UUID(DEMO_USER_ID), **body.model_dump())
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child


@router.get("/events")
async def list_events(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"events": DEMO_EVENTS, "total": len(DEMO_EVENTS)}
    result = await db.execute(
        select(SchoolEvent).where(SchoolEvent.user_id == DEMO_USER_ID, SchoolEvent.completed == False)
    )
    return {"events": [e.__dict__ for e in result.scalars().all()]}


@router.post("/circulars/upload")
async def upload_circular(
    file: UploadFile = File(...),
    child_id: str = Form("c1"),
    db: AsyncSession = Depends(get_db),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"circ_{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    child = DEMO_CHILDREN[0] if settings.DEMO_MODE else {"name": "Arjun", "class_name": "Class 5", "school_name": "St. Mary's"}

    event = AgentEvent(
        type="circular_uploaded",
        domain="school",
        user_id=DEMO_USER_ID,
        payload={
            "image_path": file_path,
            "child_name": child.get("name", ""),
            "class_name": child.get("class_name", ""),
            "school_name": child.get("school_name", ""),
        },
    )
    response = await orchestrator.process_event(event, db)
    return {
        "success": response.success,
        "circular_id": str(uuid.uuid4()),
        "cognitive_minutes_saved": response.cognitive_minutes_saved,
        **response.result,
    }


@router.put("/events/{event_id}/fee-paid")
async def mark_fee_paid(event_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": f"Fee marked as paid for event {event_id}"}
    return {"message": "Fee marked as paid"}


@router.post("/events/{event_id}/generate-reply")
async def generate_teacher_reply(event_id: str, db: AsyncSession = Depends(get_db)):
    event_data = next((e for e in DEMO_EVENTS if e["id"] == event_id), DEMO_EVENTS[0])
    event = AgentEvent(
        type="teacher_reply_requested",
        domain="school",
        user_id=DEMO_USER_ID,
        entity_id=event_id,
        payload={
            "event_name": event_data.get("event_name", ""),
            "child_name": event_data.get("child_name", "Arjun Sharma"),
            "class_name": "Class 5",
            "parent_name": "Priya Sharma",
        },
    )
    response = await orchestrator.process_event(event, db)
    return response.result


@router.put("/events/{event_id}/complete")
async def mark_event_complete(event_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": f"Event {event_id} marked as complete"}
    return {"message": "Event marked as complete"}
