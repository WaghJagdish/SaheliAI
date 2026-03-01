"""
agents/health_agent.py — Processes prescriptions, manages medicine schedules, sends refill alerts.
"""
from __future__ import annotations


class HealthAgent:
    """
    Domain agent for the Health Loop.
    Handles:
    - Prescription image → OCR → LLM extraction pipeline
    - Medicine schedule creation and tracking
    - Refill alert detection (5 days before end)
    - Medicine intake logging
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

        if event.type == "prescription_uploaded":
            return await self._process_prescription(event, db)
        elif event.type == "medicine_refill_alert":
            return await self._refill_alert(event, db)

        return AgentResponse(success=True, domain="health", action=event.type, result={})

    async def _process_prescription(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload
        image_path = p.get("image_path", "")
        prescribed_for = p.get("prescribed_for", "")

        # 1. OCR
        ocr_result = await self.ocr.extract_text(image_path)

        # 2. LLM extraction
        extracted = await self.llm.extract_prescription_data(ocr_result.text)

        # 3. Track cognitive savings
        mins = await self.cognitive.record("prescription_ocr_processed", event.user_id, db)

        return AgentResponse(
            success=True,
            domain="health",
            action="prescription_processed",
            result={
                "ocr_text": ocr_result.text,
                "ocr_confidence": ocr_result.confidence,
                "extracted_data": extracted,
                "prescribed_for": prescribed_for,
            },
            cognitive_minutes_saved=mins,
        )

    async def _refill_alert(self, event, db):
        from agents.orchestrator import AgentResponse
        mins = await self.cognitive.record("refill_alert_sent", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="health",
            action="refill_alert_sent",
            result={"medicine_id": event.entity_id},
            cognitive_minutes_saved=mins,
        )
