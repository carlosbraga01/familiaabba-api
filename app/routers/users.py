from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import User, Child
from app.schemas import UserRead, UserCreate
from app.core.deps import get_current_active_user, get_current_admin_user, get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserRead)
async def update_user_me(
    user_update: UserCreate,  # Só para exemplo, ideal seria um schema de update
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    current_user.name = user_update.name
    current_user.email = user_update.email
    # Não atualiza senha nem role aqui
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserRead])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin_user),
):
    result = await db.execute(select(User))
    return result.scalars().all()
