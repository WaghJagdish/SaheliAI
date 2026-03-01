"""
agents/relationship_agent.py — Handles birthday reminders, gift suggestions, and WhatsApp drafts.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import date


class RelationshipAgent:
    """
    Domain agent for the Relationship Loop.
    Handles:
    - Person management (birthdays, family members)
    - Gift idea generation via LLM
    - WhatsApp birthday message drafting
    - Cross-loop: alerts if person also has medicine schedule
    """

    def __init__(self):
        from services.llm_service import llm_service
        from services.whatsapp_service import whatsapp_service
        from services.cognitive_tracker import cognitive_tracker
        self.llm = llm_service
        self.whatsapp = whatsapp_service
        self.cognitive = cognitive_tracker

    async def execute(self, event, context, db=None):
        from agents.orchestrator import AgentResponse

        if event.type == "gift_suggestions_requested":
            return await self._generate_gift_suggestions(event, db)
        elif event.type == "birthday_message_requested":
            return await self._generate_birthday_message(event, db)
        elif event.type == "birthday_3day_prep":
            return await self._three_day_birthday_prep(event, db)
        elif event.type == "birthday_today":
            return await self._birthday_today(event, db)

        return AgentResponse(success=True, domain="relationship", action=event.type, result={})

    async def _generate_gift_suggestions(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload
        suggestions = await self.llm.generate_gift_suggestions(
            person_name=p.get("person_name", ""),
            relation=p.get("relation", ""),
            budget=p.get("budget", 3000),
        )
        mins = await self.cognitive.record("gift_suggestion_generated", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="relationship",
            action="gift_suggestion_generated",
            result={"suggestions": suggestions},
            cognitive_minutes_saved=mins,
        )

    async def _generate_birthday_message(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload
        message = await self.llm.generate_birthday_message(
            person_name=p.get("person_name", ""),
            relation=p.get("relation", ""),
            sender_name=p.get("sender_name", "Priya"),
        )
        whatsapp_link = self.whatsapp.format_for_whatsapp_web(p.get("phone", ""), message)
        mins = await self.cognitive.record("whatsapp_draft_generated", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="relationship",
            action="birthday_message_generated",
            result={"message": message, "whatsapp_link": whatsapp_link},
            cognitive_minutes_saved=mins,
        )

    async def _three_day_birthday_prep(self, event, db):
        from agents.orchestrator import AgentResponse
        # Triggers both gift suggestions and message draft for upcoming birthday
        p = event.payload
        suggestions = await self.llm.generate_gift_suggestions(
            person_name=p.get("person_name", ""),
            relation=p.get("relation", ""),
            budget=p.get("budget", 3000),
        )
        message = await self.llm.generate_birthday_message(
            person_name=p.get("person_name", ""),
            relation=p.get("relation", ""),
            sender_name=p.get("sender_name", "Priya"),
        )
        mins = await self.cognitive.record("birthday_reminder_created", event.user_id, db)
        mins += await self.cognitive.record("gift_suggestion_generated", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="relationship",
            action="three_day_prep_completed",
            result={"suggestions": suggestions, "message": message},
            cognitive_minutes_saved=mins,
        )

    async def _birthday_today(self, event, db):
        from agents.orchestrator import AgentResponse
        p = event.payload
        message = await self.llm.generate_birthday_message(
            person_name=p.get("person_name", ""),
            relation=p.get("relation", ""),
            sender_name=p.get("sender_name", "Priya"),
        )
        mins = await self.cognitive.record("whatsapp_draft_generated", event.user_id, db)
        return AgentResponse(
            success=True,
            domain="relationship",
            action="birthday_today_handled",
            result={"message": message},
            cognitive_minutes_saved=mins,
        )
