"""
agents/school_agent.py — Processes school circulars, creates calendar events, drafts teacher replies.
"""
from __future__ import annotations


class SchoolAgent:
    """
    Domain agent for the School Loop.
    Handles:
    - Circular image → OCR → LLM extraction pipeline
    - School event creation with deadlines
    - WhatsApp teacher reply drafting
    - Fee tracking
    """

    def __init__(self):
        from services.llm_service import llm_service
        from services.ocr_service import ocr_service
        from services.cognitive_tracker import cognitive_tracker
        self.llm = llm_service
        self.ocr = ocr_service
        self.cognitive = cognitive_tracker

    async def execute(self, event, context, db=None):
        from agents.orchestrator import AgentResponse

        if event.type == "circular_uploaded":
            return await self._process_circular(event, db)
        elif event.type == "teacher_reply_requested":
            return await self._draft_teacher_reply(event, db)
        elif event.type == "school_deadline_alert":
            return await self._deadline_alert(event, db)

        return AgentResponse(success=True, domain="school", action=event.type, result={})

    async def _process_circular(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload

        ocr_result = await self.ocr.extract_text(p.get("image_path", ""))
        extracted = await self.llm.extract_circular_data(
            ocr_text=ocr_result.text,
            child_name=p.get("child_name", ""),
            class_name=p.get("class_name", ""),
            school_name=p.get("school_name", ""),
        )
        mins = await self.cognitive.record("circular_parsed", event.user_id, db)
        mins += await self.cognitive.record("school_event_calendared", event.user_id, db)

        return AgentResponse(
            success=True,
            domain="school",
            action="circular_processed",
            result={
                "ocr_text": ocr_result.text,
                "extracted_data": extracted,
            },
            cognitive_minutes_saved=mins,
        )

    async def _draft_teacher_reply(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload
        message = await self.llm.draft_teacher_reply(
            event_name=p.get("event_name", ""),
            child_name=p.get("child_name", ""),
            class_name=p.get("class_name", ""),
            parent_name=p.get("parent_name", "Priya"),
        )
        mins = await self.cognitive.record("whatsapp_draft_generated", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="school",
            action="teacher_reply_drafted",
            result={"message": message},
            cognitive_minutes_saved=mins,
        )

    async def _deadline_alert(self, event, db):
        from agents.orchestrator import AgentResponse
        return AgentResponse(
            success=True,
            domain="school",
            action="deadline_alert_sent",
            result={"event_id": event.entity_id},
        )
