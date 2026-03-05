# Saheli — AI Family Assistant

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/) [![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://www.python.org/) [![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://supabase.com/) [![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F56606?style=flat-square)](https://groq.com/)

> **Saheli** (companion in Hindi) is a mobile-first, AI-powered family assistant built for Indian households. It eliminates the invisible cognitive load carried by parents by centralizing health tracking, school schedules, family events, and relationship reminders.

---

## The Problem

Modern parents silently manage hundreds of micro-tasks every day:

- Has Maa taken her Metformin today? How many pills are left?
- Is Arjun PTM next week or the week after?
- Bhai birthday is coming, what to get within 1500 rupees?

This invisible mental workload is exhausting and completely unsupported by technology. **Saheli solves this** acting as your digital Didi (elder sister), always organized and ready to help.

---

## Features

| Module | Description |
|:---|:---|
| Dashboard | Personalized home showing cognitive minutes saved, urgent alerts, quick action cards |
| Health Hub | Tracks medicines per family member, auto-alerts when stock drops below 5 pills |
| School Tracker | Monitors PTMs, fee deadlines, events with urgency classification |
| Family Space | Birthday and anniversary tracker with budget tags and WhatsApp draft generation via AI |
| Saheli AI Chat | Groq Llama-3.3-70b reading your live family context to respond naturally in seconds |

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | Next.js 14, React 18, TypeScript, Custom Mobile-First CSS |
| Backend | FastAPI (Python 3.13), Pydantic v2, SQLAlchemy 2.0 Async |
| Database | PostgreSQL via Supabase (asyncpg), raw SQL schema + seed |
| AI / LLM | Groq API, Llama-3.3-70b-versatile via OpenAI SDK |
| State | Zustand |
| Scheduler | APScheduler, daily reminders and digests |

---

## How to Run

### Prerequisites
- Node.js v18+
- Python v3.11+
- Git

### 1. Clone the Repository

`ash
git clone https://github.com/WaghJagdish/SaheliAI.git
cd SaheliAI
`

### 2. Install Dependencies

**Frontend:**
`ash
cd frontend
npm install
`

**Backend:**
`ash
cd backend
pip install -r requirements.txt
`

### 3. Configure Environment

Create the file ackend/.env.local with this content:

`env
DEMO_MODE=true
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=postgresql+asyncpg://postgres.[project]:[password]@pooler.supabase.com:6543/postgres
`

Set DEMO_MODE=true to skip database setup. The app runs on rich built-in demo data.

Get a free Groq key at https://console.groq.com/keys (takes 30 seconds).

### 4. Initialize Database (skip if DEMO_MODE=true)

`ash
cd backend
python init_supabase.py
`

### 5. Start Both Servers

**Terminal 1, Backend:**
`ash
cd backend
uvicorn main:app --reload --port 8000
`

**Terminal 2, Frontend:**
`ash
cd frontend
npm run dev
`

Open http://localhost:3000 in your browser.

Tip: For the best mobile experience open Chrome DevTools (F12) then Device Toolbar then iPhone 14 Pro.

---

## Author

**Jagdish Wagh** - https://github.com/WaghJagdish

---

Built with love to reduce the invisible cognitive load on every Indian parent.
