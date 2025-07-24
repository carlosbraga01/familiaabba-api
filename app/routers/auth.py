from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.core.database import async_session
from app.models import User
from app.schemas import UserCreate, UserLogin, Token, UserRead
from app.core.security import get_password_hash, verify_password, create_access_token
from typing import Any

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_db():
    async with async_session() as session:
        yield session

@router.post("/register", response_model=UserRead, status_code=201)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if user:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(name=user_in.name, email=user_in.email, password=hashed_pw)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
