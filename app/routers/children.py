from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.models import Child
from app.schemas import ChildCreate, ChildRead
from app.core.deps import get_current_active_user, get_db
from app.models import User

router = APIRouter(prefix="/children", tags=["children"])

@router.post("/", response_model=ChildRead, status_code=201)
async def create_child(
    child_in: ChildCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    child = Child(**child_in.dict(), user_id=current_user.id)
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child

@router.get("/me", response_model=List[ChildRead])
async def list_my_children(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Child).where(Child.user_id == current_user.id))
    return result.scalars().all()

@router.get("/{child_id}", response_model=ChildRead)
async def get_child(child_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    child = await db.get(Child, child_id)
    if not child or (child.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Filho não encontrado")
    return child

@router.put("/{child_id}", response_model=ChildRead)
async def update_child(child_id: str, child_in: ChildCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    child = await db.get(Child, child_id)
    if not child or (child.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Filho não encontrado")
    child.name = child_in.name
    child.birthdate = child_in.birthdate
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child

@router.delete("/{child_id}", status_code=204)
async def delete_child(child_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    child = await db.get(Child, child_id)
    if not child or (child.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="Filho não encontrado")
    await db.delete(child)
    await db.commit()
    return None
