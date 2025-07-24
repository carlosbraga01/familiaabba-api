from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    name: str
    email: str = Field(index=True, unique=True)
    password: str
    role: str = Field(default="member")  # admin, member
    is_active: bool = Field(default=True)
    children: List["Child"] = Relationship(back_populates="user")
    donations: List["Donation"] = Relationship(back_populates="user")

class Child(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str
    birthdate: date
    user: Optional[User] = Relationship(back_populates="children")
    checkins: List["Checkin"] = Relationship(back_populates="child")

class Event(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str
    date: datetime
    category: str
    description: str
    checkins: List["Checkin"] = Relationship(back_populates="event")

class Checkin(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    child_id: uuid.UUID = Field(foreign_key="child.id")
    event_id: uuid.UUID = Field(foreign_key="event.id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    child: Optional[Child] = Relationship(back_populates="checkins")
    event: Optional[Event] = Relationship(back_populates="checkins")

class Announcement(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str
    content: str
    created_by: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrayerRequest(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    content: str
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    status: str = Field(default="pending")  # pending, praying, answered
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Donation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    amount: float
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[User] = Relationship(back_populates="donations")
