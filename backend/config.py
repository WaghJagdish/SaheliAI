"""
config.py — Saheli-AI settings loaded from environment variables.
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

    # Application
    APP_NAME: str = "Saheli-AI"
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True
    SECRET_KEY: str = "change-me-in-production"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/saheli_ai"

    # LLM
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""

    # OCR
    OCR_PROVIDER: str = "tesseract"  # tesseract | google_vision
    TESSERACT_PATH: str = "tesseract"
    GOOGLE_VISION_CREDENTIALS_PATH: str = ""

    # File Storage
    STORAGE_PROVIDER: str = "local"
    LOCAL_UPLOAD_PATH: str = "./uploads"

    # Scheduler
    SCHEDULER_TIMEZONE: str = "Asia/Kolkata"
    DAILY_CHECK_HOUR: int = 8

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 3600

    # Demo seed data
    DEMO_COGNITIVE_MINUTES: int = 247

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


# ── Demo cache — pre-computed LLM responses for zero-latency presentations ──

DEMO_GIFT_SUGGESTIONS = {
    "mother": [
        {"name": "Mysore Silk Saree", "description": "Handwoven pure silk, deep burgundy", "price": 3500, "where_to_buy": "Amazon India"},
        {"name": "Kama Ayurveda Skincare Set", "description": "Luxury herbal skincare kit", "price": 2800, "where_to_buy": "Flipkart"},
        {"name": "Gold-plated Temple Jewellery Set", "description": "Traditional Kemp stone necklace set", "price": 4200, "where_to_buy": "Tanishq"},
    ],
    "father": [
        {"name": "Titan Edge Slim Watch", "description": "Classic dress watch for daily wear", "price": 4500, "where_to_buy": "Amazon India"},
        {"name": "Himalaya Herbal Health Kit", "description": "Curated wellness pack", "price": 1800, "where_to_buy": "Flipkart"},
        {"name": "Bluetooth Neck Speaker", "description": "Wearable speaker for walks & calls", "price": 2200, "where_to_buy": "Amazon India"},
    ],
    "default": [
        {"name": "Personalised Photo Book", "description": "Hardcover 40-page photo story", "price": 1200, "where_to_buy": "Canvera"},
        {"name": "Spa Day Voucher", "description": "Luxury spa experience", "price": 2500, "where_to_buy": "BookMyShow"},
        {"name": "Premium Dry Fruits Hamper", "description": "Assorted nuts & dried fruits tin", "price": 1600, "where_to_buy": "Amazon India"},
    ],
}

DEMO_BIRTHDAY_MESSAGES = {
    "mother": "Happy Birthday Maa! 🌸 Thank you for being the warmth in every moment of our lives. Wishing you joy, good health, and all the love you so generously give. Aapko bahut pyaar! ❤️",
    "father": "Happy Birthday Dad! 🎉 Your strength and wisdom inspire me every day. Here's to celebrating you today and always. Love you so much!",
    "default": "Wishing you a very Happy Birthday! 🎂 May this year bring you health, happiness, and everything your heart desires. With lots of love!",
}

COGNITIVE_MINUTES_MAP = {
    "prescription_ocr_processed": 15,
    "birthday_reminder_created": 8,
    "gift_suggestion_generated": 12,
    "whatsapp_draft_generated": 5,
    "circular_parsed": 10,
    "school_event_calendared": 7,
    "refill_alert_sent": 6,
}
