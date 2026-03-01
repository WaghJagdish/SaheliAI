"""
routers/family.py — Family / Relationship Loop API routes.
"""
import uuid
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from database import get_db
from models.person import Person, BirthdayEvent, GiftSuggestion
from agents.orchestrator import orchestrator, AgentEvent
from config import settings

router = APIRouter(prefix="/api/family", tags=["family"])

DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"


# ── Pydantic schemas ─────────────────────────────────────────

class PersonCreate(BaseModel):
    name: str
    relation: str
    birthday: date
    gift_budget: Optional[int] = 3000
    phone: Optional[str] = None
    notes: Optional[str] = None


class PersonUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    birthday: Optional[date] = None
    gift_budget: Optional[int] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


# ── Demo data ─────────────────────────────────────────────────

DEMO_PERSONS = [
    {"id": "p1", "name": "Lakshmi Devi", "relation": "Mother", "birthday": "1960-03-18", "gift_budget": 5000, "phone": "+919876543210", "days_until_birthday": 17},
    {"id": "p2", "name": "Rajesh Kumar", "relation": "Father", "birthday": "1958-08-12", "gift_budget": 4000, "phone": "+919876543211", "days_until_birthday": 163},
    {"id": "p3", "name": "Vikram Sharma", "relation": "Husband", "birthday": "1985-04-05", "gift_budget": 8000, "phone": "+919876543212", "days_until_birthday": 35},
    {"id": "p4", "name": "Meera Sharma", "relation": "Sister", "birthday": "1990-11-20", "gift_budget": 3000, "phone": "+919876543213", "days_until_birthday": 264},
    {"id": "p5", "name": "Rohan Verma", "relation": "Friend", "birthday": "1987-03-04", "gift_budget": 2000, "phone": "+919876543214", "days_until_birthday": 3},
]

DEMO_UPCOMING_BIRTHDAYS = [
    {"id": "b1", "person_name": "Rohan Verma", "relation": "Friend", "days_until": 3, "birthday": "March 4", "gift_budget": 2000, "has_suggestions": False},
    {"id": "b2", "person_name": "Lakshmi Devi", "relation": "Mother", "days_until": 17, "birthday": "March 18", "gift_budget": 5000, "has_suggestions": False},
    {"id": "b3", "person_name": "Vikram Sharma", "relation": "Husband", "days_until": 35, "birthday": "April 5", "gift_budget": 8000, "has_suggestions": False},
]


# ── Routes ────────────────────────────────────────────────────

@router.get("/persons")
async def list_persons(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"persons": DEMO_PERSONS, "total": len(DEMO_PERSONS)}
    result = await db.execute(
        select(Person).where(Person.user_id == DEMO_USER_ID, Person.is_active == True)
    )
    persons = result.scalars().all()
    return {"persons": [p.__dict__ for p in persons], "total": len(persons)}


@router.post("/persons", status_code=status.HTTP_201_CREATED)
async def add_person(body: PersonCreate, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"id": str(uuid.uuid4()), **body.model_dump(), "message": "Person added (demo mode)"}
    person = Person(user_id=uuid.UUID(DEMO_USER_ID), **body.model_dump())
    db.add(person)
    await db.commit()
    await db.refresh(person)
    return person


@router.get("/persons/{person_id}")
async def get_person(person_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        p = next((p for p in DEMO_PERSONS if p["id"] == person_id), None)
        if not p:
            raise HTTPException(status_code=404, detail="Person not found")
        return p
    result = await db.execute(select(Person).where(Person.id == person_id))
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


@router.delete("/persons/{person_id}")
async def delete_person(person_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"message": "Person deleted (demo mode)"}
    result = await db.execute(select(Person).where(Person.id == person_id))
    person = result.scalar_one_or_none()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    person.is_active = False
    await db.commit()
    return {"message": "Person deleted"}


@router.get("/birthdays/upcoming")
async def upcoming_birthdays(db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        return {"birthdays": DEMO_UPCOMING_BIRTHDAYS}
    # Production: query persons where birthday is within 30 days
    return {"birthdays": []}


@router.post("/birthdays/{person_id}/generate-suggestions")
async def generate_gift_suggestions(person_id: str, db: AsyncSession = Depends(get_db)):
    # Find person
    if settings.DEMO_MODE:
        p = next((p for p in DEMO_PERSONS if p["id"] == person_id), DEMO_PERSONS[0])
    else:
        result = await db.execute(select(Person).where(Person.id == person_id))
        person = result.scalar_one_or_none()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        p = {"name": person.name, "relation": person.relation, "gift_budget": person.gift_budget}

    event = AgentEvent(
        type="gift_suggestions_requested",
        domain="relationship",
        user_id=DEMO_USER_ID,
        entity_id=person_id,
        payload={
            "person_name": p.get("name"),
            "relation": p.get("relation"),
            "budget": p.get("gift_budget", 3000),
        },
    )
    response = await orchestrator.process_event(event, db)
    return response.result


@router.post("/birthdays/{person_id}/generate-message")
async def generate_birthday_message(person_id: str, db: AsyncSession = Depends(get_db)):
    if settings.DEMO_MODE:
        p = next((p for p in DEMO_PERSONS if p["id"] == person_id), DEMO_PERSONS[0])
    else:
        result = await db.execute(select(Person).where(Person.id == person_id))
        person = result.scalar_one_or_none()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        p = {"name": person.name, "relation": person.relation, "phone": person.phone or ""}

    event = AgentEvent(
        type="birthday_message_requested",
        domain="relationship",
        user_id=DEMO_USER_ID,
        entity_id=person_id,
        payload={
            "person_name": p.get("name"),
            "relation": p.get("relation"),
            "phone": p.get("phone", ""),
            "sender_name": "Priya",
        },
    )
    response = await orchestrator.process_event(event, db)
    return response.result
