"""
scheduler/cron_jobs.py — APScheduler cron jobs for daily reminders.
Runs in production only (disabled in DEMO_MODE).
"""
from datetime import date, datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler

TIMEZONE = "Asia/Kolkata"
scheduler = AsyncIOScheduler(timezone=TIMEZONE)


@scheduler.scheduled_job("cron", hour=8, minute=0)
async def daily_reminder_check():
    """Main daily scheduler. Runs at 8AM IST."""
    from agents.orchestrator import orchestrator, AgentEvent

    today = date.today()

    # 1. Birthday checks (would query DB in production)
    print(f"[Scheduler] Daily check running — {today}")

    # 2. School event deadline checks
    # upcoming_deadlines = await get_school_deadlines_in_next_2_days()

    # 3. Medicine refill checks
    # medicines_needing_refill = await get_medicines_running_low()


@scheduler.scheduled_job("cron", hour="8,13,21", minute=0)
async def medicine_reminder_check():
    """Runs 3x daily at Indian meal times for medicine reminders."""
    now = datetime.now()
    print(f"[Scheduler] Medicine reminder check — {now.strftime('%H:%M')}")
