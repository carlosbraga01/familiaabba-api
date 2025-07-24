from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import Checkin, Child, Event
from app.schemas import CheckinCreate, CheckinRead
from app.core.deps import get_current_active_user, get_current_admin_user, get_db
from app.models import User
from datetime import datetime

router = APIRouter(prefix="/checkins", tags=["checkins"])

@router.post("/", response_model=CheckinRead, status_code=201)
async def register_checkin(
    checkin_in: CheckinCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    child = await db.get(Child, checkin_in.child_id)
    event = await db.get(Event, checkin_in.event_id)
    if not child or not event:
        raise HTTPException(status_code=404, detail="Filho ou evento não encontrado")
    if child.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Sem permissão para registrar check-in deste filho")
    checkin = Checkin(child_id=child.id, event_id=event.id, timestamp=datetime.utcnow())
    db.add(checkin)
    await db.commit()
    await db.refresh(checkin)
    return checkin

@router.get("/by_event/{event_id}", response_model=List[CheckinRead])
async def list_checkins_by_event(event_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin_user)):
    result = await db.execute(select(Checkin).where(Checkin.event_id == event_id))
    return result.scalars().all()

@router.get("/by_child/{child_id}", response_model=List[CheckinRead])
async def list_checkins_by_child(child_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    child = await db.get(Child, child_id)
    if not child or (child.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Filho não encontrado")
    result = await db.execute(select(Checkin).where(Checkin.child_id == child_id))
    return result.scalars().all()
