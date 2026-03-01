"""
routers/metrics.py — Cognitive metrics and dashboard aggregation.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from services.cognitive_tracker import cognitive_tracker
from config import settings

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.get("/cognitive")
async def get_cognitive_metrics(db: AsyncSession = Depends(get_db)):
    return await cognitive_tracker.get_total(DEMO_USER_ID, db if not settings.DEMO_MODE else None)


@router.get("/activity")
async def get_activity_log(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {
            "activities": [
                {"agent": "health", "action": "prescription_ocr_processed", "summary": "Metformin 500mg + Vitamin D3 extracted from prescription", "minutes_saved": 15, "timestamp": "2026-03-01T10:23:00+05:30"},
                {"agent": "relationship", "action": "gift_suggestion_generated", "summary": "3 gift ideas generated for Rohan Verma's birthday (₹2000 budget)", "minutes_saved": 12, "timestamp": "2026-03-01T09:15:00+05:30"},
                {"agent": "school", "action": "circular_parsed", "summary": "Annual Sports Day details extracted — deadline March 10", "minutes_saved": 10, "timestamp": "2026-02-28T14:30:00+05:30"},
                {"agent": "relationship", "action": "whatsapp_draft_generated", "summary": "Birthday message drafted for Meera Sharma (Sister)", "minutes_saved": 5, "timestamp": "2026-02-27T08:00:00+05:30"},
                {"agent": "health", "action": "refill_alert_sent", "summary": "Atorvastatin 10mg — 5 days remaining. Refill by March 6.", "minutes_saved": 6, "timestamp": "2026-02-26T08:00:00+05:30"},
            ]
        }
    return {"activities": []}


@router.get("/dashboard")
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    cognitive = await cognitive_tracker.get_total(DEMO_USER_ID, db if not settings.DEMO_MODE else None)

    if settings.DEMO_MODE:
        return {
            "cognitive": cognitive,
            "family": {"total_persons": 5, "upcoming_birthdays_30days": 3, "next_birthday_days": 3},
            "health": {"active_medicines": 3, "refills_needed": 1, "prescriptions_processed": 2},
            "school": {"active_events": 2, "fees_pending": 1, "circulars_processed": 2},
            "reminders": {"total_pending": 4, "high_priority": 2},
        }

    return {"cognitive": cognitive}
