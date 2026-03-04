# Saheli — AI Family Assistant 🌸
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F56606?style=flat-square)](https://groq.com/)
> **Saheli** (companion/didi in Hindi) is a mobile-first AI family assistant built for Indian households. It eliminates the invisible **cognitive load** on parents by centralizing health tracking, school schedules, family events and relationship reminders — guided by a context-aware conversational AI.
---
## 🚀 The Problem
Modern parents silently juggle hundreds of micro-tasks every day:
- *Has Maa taken her Metformin today? How many pills are left?*
- *Is Arjun's PTM next week or the week after?*
- *Bhai's birthday is coming — what to get within ₹1,500?*
This **invisible mental workload** is exhausting and unsupported by technology. **Saheli solves this** — acting as your digital *Didi*, always organized and always ready.
---
## ✨ Features
| Module | Description |
|:---|:---|
| **🏠 Dashboard** | Cognitive minutes saved, urgent alerts, quick-action cards |
| **💊 Health Hub** | Tracks family medicines; auto-alert when stock < 5 pills |
| **🏫 School Tracker** | PTMs, fee deadlines, school events with urgency tags |
| **👨‍👩‍👧 Family Space** | Birthday/anniversary tracker with budget tags + AI WhatsApp drafts |
| **🤖 Saheli AI Chat** | Groq Llama-3.3-70b reads your live DB context to respond in < 1 second |
---
## 🛠️ Tech Stack
| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 14, React 18, TypeScript, Mobile-First CSS (430px native feel) |
| **Backend** | FastAPI (Python 3.13), Pydantic v2, SQLAlchemy 2.0 Async |
| **Database** | PostgreSQL via Supabase (asyncpg driver) |
| **AI / LLM** | Groq API — Llama-3.3-70b-versatile (via OpenAI SDK) |
| **State** | Zustand |
| **Scheduler** | APScheduler — daily family reminders & digest |
---
## 📁 Project Structure
saheli/ ├── frontend/ │ ├── app/ │ │ ├── page.tsx # Dashboard │ │ ├── chat/ # AI Chat screen │ │ ├── health/ # Health Hub │ │ ├── family/ # Family Space │ │ └── school/ # School Tracker │ └── components/ │ └── Navigation.tsx # Mobile bottom tab bar │ ├── backend/ │ ├── routers/ # API endpoints │ ├── models/ # SQLAlchemy models │ ├── agents/ # AI agent logic │ ├── services/ # Business logic │ ├── main.py # App entry point │ └── config.py # Settings │ └── database/ ├── schema.sql # DB schema └── seed_demo.sql # Demo family data

---
## ⚙️ How to Run
### Prerequisites
- Node.js v18+
- Python v3.11+
- Git
### 1. Clone
```bash
git clone https://github.com/WaghJagdish/SaheliAI.git
cd SaheliAI
2. Install Dependencies
bash
# Frontend
cd frontend && npm install
# Backend
cd ../backend && pip install -r requirements.txt
3. Set Up Environment
Create 

backend/.env.local
:

env
DEMO_MODE=true
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[password]@pooler.supabase.com:6543/postgres
💡 Set DEMO_MODE=true to skip database setup — the app runs on built-in demo data! Get a free Groq key at console.groq.com/keys

4. Initialize Database (skip if DEMO_MODE=true)
bash
cd backend
python init_supabase.py
5. Start Both Servers
Terminal 1 — Backend:

bash
cd backend
uvicorn main:app --reload --port 8000
Terminal 2 — Frontend:

bash
cd frontend
npm run dev
Open http://localhost:3000

📱 Best viewed in Chrome DevTools → Device Toolbar → iPhone 14 Pro

👨‍💻 Author
Jagdish Wagh — github.com/WaghJagdish

Built with ❤️ to reduce the invisible cognitive load on every Indian parent.
