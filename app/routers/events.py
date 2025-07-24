from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from app.models import Event
from app.schemas import EventCreate, EventRead
from app.core.deps import get_current_active_user, get_current_admin_user, get_db
from datetime import datetime

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=EventRead, status_code=201)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    _: str = Depends(get_current_admin_user)
):
    event = Event(**event_in.dict(), date=datetime.fromisoformat(event_in.date))
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.get("/", response_model=List[EventRead])
async def list_events(
    db: AsyncSession = Depends(get_db),
    date: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    query = select(Event)
    if date:
        query = query.where(Event.date >= datetime.fromisoformat(date))
    if category:
        query = query.where(Event.category == category)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return event

@router.put("/{event_id}", response_model=EventRead)
async def update_event(event_id: str, event_in: EventCreate, db: AsyncSession = Depends(get_db), _: str = Depends(get_current_admin_user)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    event.title = event_in.title
    event.date = datetime.fromisoformat(event_in.date)
    event.category = event_in.category
    event.description = event_in.description
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str, db: AsyncSession = Depends(get_db), _: str = Depends(get_current_admin_user)):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    await db.delete(event)
    await db.commit()
    return None
