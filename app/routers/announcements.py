from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import Announcement, User
from app.schemas import AnnouncementCreate, AnnouncementRead
from app.core.deps import get_current_active_user, get_current_admin_user, get_db
from datetime import datetime

router = APIRouter(prefix="/announcements", tags=["announcements"])

@router.post("/", response_model=AnnouncementRead, status_code=201)
async def create_announcement(
    announcement_in: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    announcement = Announcement(
        **announcement_in.dict(),
        created_by=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement

@router.get("/", response_model=List[AnnouncementRead])
async def list_announcements(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()))
    return result.scalars().all()

@router.get("/{announcement_id}", response_model=AnnouncementRead)
async def get_announcement(announcement_id: str, db: AsyncSession = Depends(get_db)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")
    return announcement

@router.put("/{announcement_id}", response_model=AnnouncementRead)
async def update_announcement(announcement_id: str, announcement_in: AnnouncementCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")
    announcement.title = announcement_in.title
    announcement.content = announcement_in.content
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement

@router.delete("/{announcement_id}", status_code=204)
async def delete_announcement(announcement_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    announcement = await db.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Aviso não encontrado")
    await db.delete(announcement)
    await db.commit()
    return None
