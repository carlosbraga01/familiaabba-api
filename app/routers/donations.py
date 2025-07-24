from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import Donation, User
from app.schemas import DonationCreate, DonationRead
from app.core.deps import get_current_active_user, get_current_admin_user, get_db
from datetime import datetime

router = APIRouter(prefix="/donations", tags=["donations"])

@router.post("/", response_model=DonationRead, status_code=201)
async def create_donation(
    donation_in: DonationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    donation = Donation(
        user_id=current_user.id,
        amount=donation_in.amount,
        category=donation_in.category,
        created_at=datetime.utcnow()
    )
    db.add(donation)
    await db.commit()
    await db.refresh(donation)
    return donation

@router.get("/me", response_model=List[DonationRead])
async def list_my_donations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(Donation).where(Donation.user_id == current_user.id))
    return result.scalars().all()

@router.get("/", response_model=List[DonationRead])
async def list_all_donations(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin_user)):
    result = await db.execute(select(Donation))
    return result.scalars().all()
