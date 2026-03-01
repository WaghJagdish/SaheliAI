"""
scheduler/reminder_engine.py — Reminder creation and delivery engine.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional


class ReminderEngine:
    """Creates and manages reminder scheduling for all event types."""

    def create_birthday_reminders(
        self, person_id: str, user_id: str, birthday: datetime
    ) -> list[dict]:
        """Create 3-day and day-of reminders for a birthday."""
        now = datetime.now(timezone.utc)
        three_day = birthday - timedelta(days=3)
        return [
            {
                "user_id": user_id,
                "type": "birthday",
                "entity_id": person_id,
                "trigger_at": three_day.isoformat(),
                "title": "Birthday in 3 days!",
                "body": "Time to prepare — gifts and messages ready.",
                "status": "pending",
                "channel": "in_app",
            },
            {
                "user_id": user_id,
                "type": "birthday",
                "entity_id": person_id,
                "trigger_at": birthday.isoformat(),
                "title": "Birthday today!",
                "body": "Send the birthday message now.",
                "status": "pending",
                "channel": "in_app",
            },
        ]

    def create_medicine_reminders(
        self, medicine_id: str, user_id: str, schedule_times: list[str]
    ) -> list[dict]:
        """Create daily medicine reminders based on schedule_times."""
        today = datetime.now(timezone.utc).date()
        reminders = []
        for t in schedule_times:
            hour, minute = map(int, t.split(":"))
            trigger = datetime(today.year, today.month, today.day, hour, minute, tzinfo=timezone.utc)
            reminders.append({
                "user_id": user_id,
                "type": "medicine",
                "entity_id": medicine_id,
                "trigger_at": trigger.isoformat(),
                "title": "Medicine reminder",
                "body": f"Time to take your medicine ({t})",
                "status": "pending",
                "channel": "in_app",
            })
        return reminders


reminder_engine = ReminderEngine()
