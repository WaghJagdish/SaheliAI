"""
agents/orchestrator.py — Master routing agent.
The brain of Saheli-AI: routes events, coordinates agents, manages global state.
"""
from __future__ import annotations
import time
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AgentEvent:
    type: str           # birthday_3day_prep, prescription_uploaded, circular_uploaded, etc.
    domain: str         # relationship, health, school
    user_id: str
    entity_id: Optional[str] = None
    payload: dict = field(default_factory=dict)


@dataclass
class AgentResponse:
    success: bool
    domain: str
    action: str
    result: dict = field(default_factory=dict)
    cognitive_minutes_saved: int = 0
    errors: list[str] = field(default_factory=list)


class OrchestratorAgent:
    """
    The Orchestrator is the brain. It:
    - Receives all incoming events (user actions, scheduled triggers, uploads)
    - Routes to the correct domain agent
    - Handles cross-agent dependencies
    - Logs all decisions to audit trail
    - Updates cognitive metrics
    """

    def __init__(self):
        from services.knowledge_graph import knowledge_graph
        from services.cognitive_tracker import cognitive_tracker
        from agents.relationship_agent import RelationshipAgent
        from agents.health_agent import HealthAgent
        from agents.school_agent import SchoolAgent
        from agents.scheduler_agent import SchedulerAgent

        self.agents = {
            "relationship": RelationshipAgent(),
            "health": HealthAgent(),
            "school": SchoolAgent(),
            "scheduler": SchedulerAgent(),
        }
        self.knowledge_graph = knowledge_graph
        self.cognitive_tracker = cognitive_tracker

    async def process_event(self, event: AgentEvent, db=None) -> AgentResponse:
        start_ms = int(time.time() * 1000)

        # 1. Enrich with knowledge graph context
        context = self.knowledge_graph.get_context(event.user_id)

        # 2. Route to correct agent
        agent = self.agents.get(event.domain)
        if not agent:
            return AgentResponse(success=False, domain=event.domain, action=event.type, errors=[f"Unknown domain: {event.domain}"])

        # 3. Execute with full context
        try:
            result = await agent.execute(event, context, db)
        except Exception as e:
            await self._log_audit(event, None, start_ms, success=False, error=str(e), db=db)
            return AgentResponse(success=False, domain=event.domain, action=event.type, errors=[str(e)])

        # 4. Update knowledge graph
        self.knowledge_graph.update(result.result)

        # 5. Log to audit trail
        elapsed = int(time.time() * 1000) - start_ms
        await self._log_audit(event, result, start_ms, db=db)

        return result

    async def _log_audit(
        self,
        event: AgentEvent,
        result: Optional[AgentResponse],
        start_ms: int,
        success: bool = True,
        error: str = "",
        db=None,
    ):
        if db is None:
            return
        elapsed = int(time.time() * 1000) - start_ms
        from sqlalchemy import text
        import uuid, datetime
        try:
            await db.execute(text("""
                INSERT INTO audit_logs
                    (id, user_id, agent, action, input_summary, output_summary,
                     cognitive_minutes_saved, success, error_message, duration_ms, created_at)
                VALUES
                    (:id, :uid, :agent, :action, :inp, :out, :mins, :ok, :err, :dur, :now)
            """), {
                "id": str(uuid.uuid4()),
                "uid": event.user_id,
                "agent": event.domain,
                "action": event.type,
                "inp": str(event.payload)[:500],
                "out": str(result.result)[:500] if result else "",
                "mins": result.cognitive_minutes_saved if result else 0,
                "ok": success,
                "err": error[:1000] if error else None,
                "dur": elapsed,
                "now": datetime.datetime.utcnow(),
            })
        except Exception:
            pass


orchestrator = OrchestratorAgent()
