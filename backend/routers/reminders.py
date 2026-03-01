"""
routers/reminders.py — Unified reminders API.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

DEMO_REMINDERS = [
    {
        "id": "r1",
        "type": "birthday",
        "title": "🎂 Rohan Verma's Birthday in 3 days!",
        "body": "Consider ordering a gift. Budget: ₹2,000. Gift suggestions ready.",
        "status": "pending",
        "trigger_at": "2026-03-04T08:00:00+05:30",
        "entity_type": "person",
        "priority": "high",
    },
    {
        "id": "r2",
        "type": "medicine",
        "title": "💊 Atorvastatin — Refill needed",
        "body": "Lakshmi Devi (Mother) has only 5 pills remaining. Refill by March 6.",
        "status": "pending",
        "trigger_at": "2026-03-01T08:00:00+05:30",
        "entity_type": "medicine",
        "priority": "high",
    },
    {
        "id": "r3",
        "type": "school_event",
        "title": "🏫 Sports Day fee due in 9 days",
        "body": "₹250 to be paid by March 10 for Arjun's Annual Sports Day.",
        "status": "pending",
        "trigger_at": "2026-03-05T08:00:00+05:30",
        "entity_type": "school_event",
        "priority": "medium",
    },
    {
        "id": "r4",
        "type": "medicine",
        "title": "💊 Metformin — Evening dose",
        "body": "Lakshmi Devi (Mother) — 500mg after dinner",
        "status": "pending",
        "trigger_at": "2026-03-01T21:00:00+05:30",
        "entity_type": "medicine",
        "priority": "medium",
    },
]


@router.get("")
async def list_reminders(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"reminders": DEMO_REMINDERS, "total": len(DEMO_REMINDERS)}
    return {"reminders": []}


@router.get("/today")
async def today_reminders(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        today_str = "2026-03-01"
        today_rems = [r for r in DEMO_REMINDERS if r["trigger_at"].startswith(today_str)]
        return {"reminders": today_rems, "date": today_str}
    return {"reminders": []}


@router.put("/{reminder_id}/dismiss")
async def dismiss_reminder(reminder_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": f"Reminder {reminder_id} dismissed"}
    return {"message": "Reminder dismissed"}
