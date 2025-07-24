from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import PrayerRequest, User
from app.schemas import PrayerRequestCreate, PrayerRequestRead
from app.core.deps import get_current_active_user, get_current_admin_user, get_db
from datetime import datetime

router = APIRouter(prefix="/prayers", tags=["prayers"])

@router.post("/", response_model=PrayerRequestRead, status_code=201)
async def create_prayer_request(
    prayer_in: PrayerRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_id = None if prayer_in.anonymous else current_user.id
    prayer = PrayerRequest(
        content=prayer_in.content,
        user_id=user_id,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(prayer)
    await db.commit()
    await db.refresh(prayer)
    return prayer

@router.get("/", response_model=List[PrayerRequestRead])
async def list_prayer_requests(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin_user)):
    result = await db.execute(select(PrayerRequest))
    return result.scalars().all()

@router.patch("/{prayer_id}", response_model=PrayerRequestRead)
async def update_prayer_status(prayer_id: str, status: str, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin_user)):
    prayer = await db.get(PrayerRequest, prayer_id)
    if not prayer:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    if status not in ["pending", "praying", "answered"]:
        raise HTTPException(status_code=400, detail="Status inválido")
    prayer.status = status
    db.add(prayer)
    await db.commit()
    await db.refresh(prayer)
    return prayer
