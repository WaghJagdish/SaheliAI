"""
services/llm_service.py — OpenAI / Claude wrapper with all Saheli-AI prompts.
All prompts are version-controlled and auditable.
"""
import json
import asyncio
from typing import Optional
from config import settings, DEMO_GIFT_SUGGESTIONS, DEMO_BIRTHDAY_MESSAGES


class LLMService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            if settings.LLM_PROVIDER == "openai":
                from openai import AsyncOpenAI
                self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def _call_llm(self, prompt: str, max_tokens: int = 1000) -> str:
        """Make an LLM API call with retry logic."""
        if not settings.OPENAI_API_KEY and not settings.ANTHROPIC_API_KEY:
            raise ValueError("No LLM API key configured. Set OPENAI_API_KEY in .env.local")

        client = self._get_client()
        for attempt in range(3):
            try:
                response = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=0.7,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                if attempt == 2:
                    raise
                await asyncio.sleep(2 ** attempt)

    # ── Gift Suggestions ──────────────────────────────────────────────────

    async def generate_gift_suggestions(
        self,
        person_name: str,
        relation: str,
        budget: int,
    ) -> list[dict]:
        """Generate 3 culturally-appropriate gift suggestions for Indian families."""

        if settings.DEMO_MODE:
            rel_key = relation.lower() if relation.lower() in DEMO_GIFT_SUGGESTIONS else "default"
            return DEMO_GIFT_SUGGESTIONS[rel_key]

        prompt = f"""
You are a thoughtful gift advisor for Indian families.

Person: {person_name}
Relation: {relation}
Budget: ₹{budget}

Suggest exactly 3 specific, purchasable gift ideas.
Make them culturally appropriate and available on Amazon India or Flipkart.

Return as JSON array:
[{{"name": str, "description": str, "price": int, "where_to_buy": str}}]

Return ONLY the JSON array. No explanation.
"""
        text = await self._call_llm(prompt, max_tokens=500)
        return json.loads(text)

    # ── Birthday Message ──────────────────────────────────────────────────

    async def generate_birthday_message(
        self,
        person_name: str,
        relation: str,
        sender_name: str,
    ) -> str:
        """Generate a warm WhatsApp birthday message."""

        if settings.DEMO_MODE:
            rel_key = relation.lower() if relation.lower() in DEMO_BIRTHDAY_MESSAGES else "default"
            return DEMO_BIRTHDAY_MESSAGES[rel_key]

        prompt = f"""
Write a warm, personal WhatsApp birthday message in English 
(with optional Hindi phrase) for:

Recipient: {person_name}
Relationship: {relation}
Sender: {sender_name}

Keep it under 4 lines. Warm, genuine, not corporate.
Include one relevant emoji. No hashtags.
Return ONLY the message text.
"""
        return await self._call_llm(prompt, max_tokens=200)

    # ── Prescription Extraction ───────────────────────────────────────────

    async def extract_prescription_data(self, ocr_text: str) -> dict:
        """Extract structured medicine information from prescription OCR text."""

        if settings.DEMO_MODE:
            return {
                "doctor_name": "Dr. Ramesh Sharma",
                "medicines": [
                    {
                        "name": "Metformin",
                        "dosage": "500mg",
                        "frequency": "twice daily",
                        "times_per_day": 2,
                        "schedule_times": ["08:00", "21:00"],
                        "duration_days": 30,
                    },
                    {
                        "name": "Vitamin D3",
                        "dosage": "60000 IU",
                        "frequency": "once weekly",
                        "times_per_day": 1,
                        "schedule_times": ["08:00"],
                        "duration_days": 90,
                    },
                ],
            }

        prompt = f"""
Extract structured medicine information from this prescription OCR text.

OCR TEXT:
{ocr_text}

Return JSON:
{{
  "doctor_name": str | null,
  "medicines": [
    {{
      "name": str,
      "dosage": str,
      "frequency": str,
      "times_per_day": int,
      "schedule_times": ["HH:MM"],
      "duration_days": int | null
    }}
  ]
}}

For schedule_times, use standard Indian meal times:
- morning: "08:00", afternoon: "13:00", night: "21:00"
- before meals = 30 mins earlier

Return ONLY the JSON. If uncertain, use null.
"""
        text = await self._call_llm(prompt, max_tokens=800)
        return json.loads(text)

    # ── School Circular Extraction ────────────────────────────────────────

    async def extract_circular_data(
        self,
        ocr_text: str,
        child_name: str,
        class_name: str,
        school_name: str,
    ) -> dict:
        """Extract structured event information from school circular OCR text."""

        if settings.DEMO_MODE:
            return {
                "event_name": "Annual Sports Day",
                "event_date": "2026-03-15",
                "deadline_date": "2026-03-10",
                "fee_amount": 250,
                "special_instructions": "Please send P.E. kit and sports shoes on the day.",
                "action_required": True,
            }

        prompt = f"""
Extract structured event information from this school circular OCR text.

Child: {child_name}, Class: {class_name}
School: {school_name}

OCR TEXT:
{ocr_text}

Return JSON:
{{
  "event_name": str,
  "event_date": "YYYY-MM-DD" | null,
  "deadline_date": "YYYY-MM-DD" | null,
  "fee_amount": int | null,
  "special_instructions": str | null,
  "action_required": bool
}}

Return ONLY the JSON.
"""
        text = await self._call_llm(prompt, max_tokens=400)
        return json.loads(text)

    # ── Teacher Reply Draft ───────────────────────────────────────────────

    async def draft_teacher_reply(
        self,
        event_name: str,
        child_name: str,
        class_name: str,
        parent_name: str,
    ) -> str:
        """Draft a polite WhatsApp reply to the teacher confirming receipt of circular."""

        if settings.DEMO_MODE:
            return (
                f"Respected Ma'am/Sir,\n\n"
                f"Thank you for informing us about the {event_name}. "
                f"We have noted the details and {child_name} will be prepared accordingly.\n\n"
                f"Warm regards,\n{parent_name}"
            )

        prompt = f"""
Draft a polite, brief WhatsApp reply to a school teacher confirming 
receipt of circular about: {event_name}

Parent name: {parent_name}
Child: {child_name}, Class: {class_name}

Keep it 2-3 lines. Formal but warm. Include confirmation of key details.
Return ONLY the message text.
"""
        return await self._call_llm(prompt, max_tokens=200)


llm_service = LLMService()
