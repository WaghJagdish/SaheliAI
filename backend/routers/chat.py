"""
chat.py — Saheli AI conversational chat router.
Supports Google Gemini (default), OpenAI (fallback), and keyword-based demo mode.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])


# ────────────────────────── Schemas ──────────────────────────

class HistoryMessage(BaseModel):
    role: str   # "user" | "ai"
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[HistoryMessage] = []


class ChatResponse(BaseModel):
    reply: str
    minutes_saved: int = 2


# ────────────────── Saheli system prompt ─────────────────────

SYSTEM_PROMPT = """You are Saheli, a warm and caring AI assistant designed specifically for Indian families.
Your purpose is to reduce cognitive load by helping manage:
- 💊 Medicines: tracking doses, refill alerts, prescription management
- 🎂 Family & Birthdays: reminders, gift ideas, WhatsApp message drafts  
- 🏫 School: circular parsing, event tracking, fee reminders, teacher reply drafts
- 🧠 Insights: reporting time/cognitive load saved by the app

Persona guidelines:
- Speak warmly and naturally, like a caring friend or elder sister (didi)
- Use Hindi words occasionally (e.g., "Namaste", "Ji", "Didi", "Maa", "Bhai")
- Reference Indian brands, cities, festivals, and cultural context naturally
- Use relevant emojis sparingly to make responses feel friendly
- Keep responses concise and actionable — avoid unnecessary verbosity
- Format key info as bullet points for easy mobile reading
- Always end with a helpful follow-up question or suggestion

Current demo context (pretend you know this user's data):
- User: Priya Sharma, working mother in Delhi
- Family: Husband Raj, Son Arjun (age 8), Mother-in-law Lakshmi Devi
- Medicines tracked: Metformin 500mg (Lakshmi Devi, 5 pills left — low!), Vitamin D3 (Priya, 12 left)
- Upcoming birthdays: Maa (Mar 14, 12 days away, budget ₹3500), Brother Raj (Mar 28)
- School events: Sports Day Mar 10 (action needed), Science Fair Mar 25 (₹250 fee due)
- Time saved this month: 247 minutes (4.1 hours)"""


# ────────────────── Demo keyword responder ───────────────────

DEMO_RESPONSES = {
    "refill": (
        "Based on your current medicines:\n\n"
        "💊 **Metformin 500mg** (for Maa) — only **5 pills left**. Please refill by Mar 8.\n"
        "💊 **Vitamin D3** (for you) — 12 pills remaining, refill by Mar 15.\n\n"
        "Shall I draft a WhatsApp message to send to your chemist? 🏪"
    ),
    "medicine": (
        "You have **3 active medicines** tracked:\n\n"
        "1. 🩺 Metformin 500mg — Maa, twice daily\n"
        "2. 🩺 Vitamin D3 — You, once daily\n"
        "3. 🩺 Calpol 650 — Arjun, as needed\n\n"
        "⚠️ Metformin needs a refill soon. Want me to set a pharmacy reminder?"
    ),
    "birthday": (
        "Upcoming birthdays:\n\n"
        "🎂 **Maa (Lakshmi Devi)** — Mar 14 (12 days away) · Budget ₹3,500\n"
        "🎂 **Bhai Raj** — Mar 28 · Budget ₹1,500\n\n"
        "Want me to generate gift ideas for Maa, or draft a WhatsApp message? 🎁"
    ),
    "gift": (
        "Gift ideas for Maa (Budget ₹3,500):\n\n"
        "🛍️ **Mysore Silk Saree** — ₹3,500 (Amazon India)\n"
        "🛍️ **Kama Ayurveda Skincare Set** — ₹2,800 (Flipkart)\n"
        "🛍️ **Gold-plated Temple Jewellery** — ₹4,200 (Tanishq)\n\n"
        "Want me to draft a birthday message to go along with the gift? 💬"
    ),
    "message": (
        "Here's a birthday message for Maa:\n\n"
        "_\"Happy Birthday Maa! 🌸 Thank you for being the warmth in every moment of "
        "our lives. Wishing you joy, good health, and all the love you so generously give. "
        "Aapko bahut pyaar! ❤️\"_\n\n"
        "Tap to copy! 📋"
    ),
    "school": (
        "Arjun's upcoming school events:\n\n"
        "🏫 **Annual Sports Day** — Mar 10 · ⚠️ Action required\n"
        "🏫 **PTM** — Mar 20\n"
        "🏫 **Science Fair** — Mar 25 · ₹250 fee due\n\n"
        "I've already drafted a reply to the Sports Day circular. Show it? ✏️"
    ),
    "fee": (
        "Pending school fees:\n\n"
        "📚 Science Fair — **₹250** due by Mar 22 (Arjun)\n\n"
        "Want me to mark it as paid or set a payment reminder? ✅"
    ),
    "time": (
        "This month Saheli saved you **247 minutes** of cognitive load! 🧠✨\n\n"
        "⚡ 18 tasks automated\n"
        "💊 3 refill alerts sent\n"
        "🎁 4 birthday messages drafted\n"
        "📄 2 school circulars parsed\n\n"
        "That's **4.1 hours** returned to you — time well spent with family 💜"
    ),
    "hello": "Namaste Priya ji! 🌸 How can I help you today? Ask me about medicines, birthdays, or school events.",
    "hi":    "Hi there! 👋 What would you like to know? Ask me about refills, upcoming birthdays, or school events.",
    "help": (
        "Here's what I can help with:\n\n"
        "💊 **Health** — Medicine tracking, refill alerts, prescription OCR\n"
        "🎂 **Family** — Birthday reminders, gift ideas, messages\n"
        "🏫 **School** — Event tracking, fee reminders, teacher replies\n"
        "🧠 **Insights** — How much time Saheli has saved you\n\n"
        "Just ask me anything! 😊"
    ),
}


def demo_respond(message: str) -> str:
    msg = message.lower()
    for keyword, response in DEMO_RESPONSES.items():
        if keyword in msg:
            return response
    return (
        f"I heard you: *\"{message}\"*\n\n"
        "In demo mode, backend is not connected. Try asking:\n"
        "- *\"What refills are due?\"*\n"
        "- *\"Upcoming birthdays?\"*\n"
        "- *\"Any school events this week?\"*\n\n"
        "Start the backend with `uvicorn main:app --reload` to enable full AI. 🌸"
    )


# ─────────────────── Groq API responder ────────────────────────

async def groq_respond(message: str, history: List[HistoryMessage]) -> str:
    """Call Groq API using the OpenAI Python SDK (full compatibility)."""
    try:
        import openai as _openai  # type: ignore
        
        # Groq uses the exact same interface as OpenAI
        client = _openai.AsyncOpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history[-14:]:
            msgs.append({"role": "user" if m.role == "user" else "assistant", "content": m.text})
        msgs.append({"role": "user", "content": message})
        
        resp = await client.chat.completions.create(
            model=settings.GROQ_MODEL, 
            messages=msgs, 
            max_tokens=600, 
            temperature=0.8,
        )
        return resp.choices[0].message.content or "Sorry, no response generated."
        
    except Exception as e:
        err = str(e)
        if "API_KEY" in err.upper() or "api key" in err.lower() or "INVALID" in err.upper() or "AUTHENTICATION" in err.upper():
            return (
                "⚠️ **Invalid Groq API key.**\n\n"
                "Please check `GROQ_API_KEY` in `backend/.env.local` and save the file.\n\n"
                "Get a valid key at [console.groq.com/keys](https://console.groq.com/keys) 🔑"
            )
        return demo_respond(message) + f"\n\n_(Groq unavailable: {err[:80]})_"


# ─────────────────── OpenAI fallback ─────────────────────────

async def openai_respond(message: str, history: List[HistoryMessage]) -> str:
    try:
        import openai as _openai  # type: ignore
        client = _openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in history[-10:]:
            msgs.append({"role": "user" if m.role == "user" else "assistant", "content": m.text})
        msgs.append({"role": "user", "content": message})
        resp = await client.chat.completions.create(
            model=settings.OPENAI_MODEL, messages=msgs, max_tokens=400, temperature=0.7,
        )
        return resp.choices[0].message.content or "Sorry, no response generated."
    except Exception as e:
        return demo_respond(message) + f"\n\n_(OpenAI unavailable: {str(e)[:80]})_"


# ───────────────────────── Endpoint ──────────────────────────

@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Chat routing logic (independent of DEMO_MODE — rest of app can stay in demo):
    1. GROQ_API_KEY is set   → Groq API (super fast & free)  ✅
    2. OPENAI_API_KEY is set → OpenAI fallback
    3. Neither key set       → helpful keyword-based demo responder
    """
    if settings.GROQ_API_KEY:
        reply = await groq_respond(req.message, req.history)
    elif settings.OPENAI_API_KEY:
        reply = await openai_respond(req.message, req.history)
    else:
        reply = (
            "🔑 **No AI API key configured yet.**\n\n"
            "We switched to **Groq** for a much better free tier! Add your key to `backend/.env.local`:\n"
            "```\nGROQ_API_KEY=your_key_here\n```\n\n"
            "Get a free key in 10 seconds at [console.groq.com/keys](https://console.groq.com/keys) 🌟\n\n"
            "---\n\n"
            + demo_respond(req.message)
        )

    return ChatResponse(reply=reply, minutes_saved=2)
