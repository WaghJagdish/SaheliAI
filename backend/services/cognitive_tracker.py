"""
services/cognitive_tracker.py — Minutes saved engine.
Records every automation event and accumulates cognitive load reduction.
"""
from datetime import datetime, timezone
from config import COGNITIVE_MINUTES_MAP


class CognitiveTracker:
    """
    Tracks cognitive minutes saved per user.
    In demo mode, operates with in-memory accumulation.
    In production, persists to database.
    """

    def __init__(self):
        self._demo_totals: dict[str, int] = {}

    async def record(
        self,
        event_type: str,
        user_id: str,
        db=None,
    ) -> int:
        """Record a cognitive savings event and return minutes saved."""
        minutes = COGNITIVE_MINUTES_MAP.get(event_type, 0)
        if minutes == 0:
            return 0

        from config import settings
        if settings.DEMO_MODE or db is None:
            self._demo_totals[user_id] = self._demo_totals.get(user_id, 0) + minutes
            return minutes

        from sqlalchemy import text
        try:
            await db.execute(
                text("""
                    INSERT INTO cognitive_events (user_id, event_type, minutes_saved, created_at)
                    VALUES (:uid, :etype, :mins, :now)
                """),
                {"uid": user_id, "etype": event_type, "mins": minutes, "now": datetime.now(timezone.utc)},
            )
            await db.execute(
                text("""
                    UPDATE users SET cognitive_minutes_saved = cognitive_minutes_saved + :mins
                    WHERE id = :uid
                """),
                {"mins": minutes, "uid": user_id},
            )
        except Exception:
            pass  # Non-critical — don't crash the request

        return minutes

    async def get_total(self, user_id: str, db=None) -> dict:
        """Get total minutes saved and per-event breakdown for a user."""
        from config import settings

        if settings.DEMO_MODE or db is None:
            demo_minutes = settings.DEMO_COGNITIVE_MINUTES + self._demo_totals.get(user_id, 0)
            return {
                "total_minutes": demo_minutes,
                "reminders_count": 34,
                "tasks_handled": 18,
                "messages_drafted": 9,
                "breakdown": [
                    {"event_type": "prescription_ocr_processed", "total": 60, "count": 4},
                    {"event_type": "birthday_reminder_created", "total": 56, "count": 7},
                    {"event_type": "gift_suggestion_generated", "total": 60, "count": 5},
                    {"event_type": "whatsapp_draft_generated", "total": 25, "count": 5},
                    {"event_type": "circular_parsed", "total": 20, "count": 2},
                    {"event_type": "school_event_calendared", "total": 14, "count": 2},
                    {"event_type": "refill_alert_sent", "total": 12, "count": 2},
                ],
            }

        from sqlalchemy import text
        total_row = await db.execute(
            text("SELECT cognitive_minutes_saved FROM users WHERE id = :uid"),
            {"uid": user_id},
        )
        total = (total_row.fetchone() or [0])[0]

        breakdown_row = await db.execute(
            text("""
                SELECT event_type, SUM(minutes_saved) AS total, COUNT(*) AS count
                FROM cognitive_events WHERE user_id = :uid
                GROUP BY event_type
            """),
            {"uid": user_id},
        )
        breakdown = [{"event_type": r[0], "total": r[1], "count": r[2]} for r in breakdown_row.fetchall()]
        return {"total_minutes": total, "breakdown": breakdown}


cognitive_tracker = CognitiveTracker()
