"""
main.py — FastAPI application entrypoint.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers import family, health, school, reminders, metrics, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler."""
    print(f"🌸 Saheli-AI starting up — DEMO_MODE={settings.DEMO_MODE}")
    os.makedirs(settings.LOCAL_UPLOAD_PATH, exist_ok=True)

    # Start scheduler only in production (APScheduler not needed in demo)
    if not settings.DEMO_MODE:
        try:
            from scheduler.cron_jobs import scheduler
            scheduler.start()
            print("⏰ APScheduler started")
        except Exception as e:
            print(f"⚠️  Scheduler failed to start: {e}")

    yield

    # Shutdown
    if not settings.DEMO_MODE:
        try:
            from scheduler.cron_jobs import scheduler
            if scheduler.running:
                scheduler.shutdown()
        except Exception:
            pass
    print("🌸 Saheli-AI shut down gracefully")


app = FastAPI(
    title="Saheli-AI",
    description="Cognitive Load Assistant for Indian Households",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────

origins = settings.allowed_origins_list
allow_all = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────

app.include_router(family.router)
app.include_router(health.router)
app.include_router(school.router)
app.include_router(reminders.router)
app.include_router(metrics.router)
app.include_router(chat.router)


# ── Health check ─────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Saheli-AI",
        "demo_mode": settings.DEMO_MODE,
        "version": "1.0.0",
    }


@app.get("/")
async def root():
    return {
        "message": "🌸 Saheli-AI — Cognitive Load Assistant for Indian Homes",
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE,
    }


# ── Global error handler ─────────────────────────────────────

@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "type": type(exc).__name__},
    )
