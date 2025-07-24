from fastapi import FastAPI
from app.routers import auth, users, children, events, checkins, announcements, prayers, donations
from app.core.database import init_db
import asyncio

app = FastAPI(title="Igreja API", version="0.1.0")

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(children.router)
app.include_router(events.router)
app.include_router(checkins.router)
app.include_router(announcements.router)
app.include_router(prayers.router)
app.include_router(donations.router)

@app.get("/")
def root():
    return {"msg": "API da Igreja - Online"}
