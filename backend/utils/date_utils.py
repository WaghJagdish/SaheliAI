"""utils/date_utils.py — Date calculation helpers."""
from datetime import date, datetime, timezone
from typing import Optional


def days_until_birthday(birthday: date, reference: Optional[date] = None) -> int:
    """Returns how many days until the next occurrence of a birthday."""
    today = reference or date.today()
    this_year = birthday.replace(year=today.year)
    if this_year < today:
        this_year = birthday.replace(year=today.year + 1)
    return (this_year - today).days


def next_birthday(birthday: date, reference: Optional[date] = None) -> date:
    today = reference or date.today()
    this_year = birthday.replace(year=today.year)
    if this_year < today:
        return birthday.replace(year=today.year + 1)
    return this_year


def format_date_indian(d: date) -> str:
    """Format date as '15 March 2026' (Indian preference)."""
    return d.strftime("%-d %B %Y") if hasattr(d, "strftime") else str(d)


def medicine_end_date(start: date, duration_days: int) -> date:
    from datetime import timedelta
    return start + timedelta(days=duration_days)


def days_until_refill(end_date: date, alert_days: int = 5) -> int:
    """Returns number of days until the refill alert should be sent."""
    from datetime import timedelta
    alert_date = end_date - timedelta(days=alert_days)
    return (alert_date - date.today()).days
