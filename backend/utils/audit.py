"""utils/audit.py — Audit logging helpers."""
import uuid
from datetime import datetime, timezone


async def audit_log_error(agent: str, action: str, error: str, db=None):
    """Log an error to the audit trail."""
    if db is None:
        return
    from sqlalchemy import text
    try:
        await db.execute(text("""
            INSERT INTO audit_logs
                (id, agent, action, success, error_message, created_at)
            VALUES
                (:id, :agent, :action, false, :err, :now)
        """), {
            "id": str(uuid.uuid4()),
            "agent": agent,
            "action": action,
            "err": error[:2000],
            "now": datetime.now(timezone.utc),
        })
    except Exception:
        pass  # Don't let audit failures cascade
