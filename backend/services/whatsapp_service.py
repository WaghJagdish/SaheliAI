"""
services/whatsapp_service.py — WhatsApp draft generation and (optional) sending.
Draft generation works without API; actual sending requires WhatsApp Business API.
"""
from dataclasses import dataclass


@dataclass
class WhatsAppDraft:
    recipient_name: str
    phone: str
    message: str
    draft_id: str


class WhatsAppService:
    """
    Generates WhatsApp message drafts.
    All drafts are stored in the DB for user review before sending.
    Actual sending requires WhatsApp Business API credentials.
    """

    async def create_draft(
        self,
        recipient_name: str,
        phone: str,
        message: str,
    ) -> WhatsAppDraft:
        import uuid
        return WhatsAppDraft(
            recipient_name=recipient_name,
            phone=phone,
            message=message,
            draft_id=str(uuid.uuid4()),
        )

    def format_for_whatsapp_web(self, phone: str, message: str) -> str:
        """Generate a wa.me deep-link for opening WhatsApp Web with pre-filled message."""
        import urllib.parse
        clean_phone = phone.replace("+", "").replace("-", "").replace(" ", "")
        if not clean_phone.startswith("91"):
            clean_phone = "91" + clean_phone
        encoded = urllib.parse.quote(message)
        return f"https://wa.me/{clean_phone}?text={encoded}"


whatsapp_service = WhatsAppService()
