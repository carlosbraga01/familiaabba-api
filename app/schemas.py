from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    is_active: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# --- Children Schemas ---
class ChildBase(BaseModel):
    name: str
    birthdate: str  # ISO format

class ChildCreate(ChildBase):
    pass

class ChildRead(ChildBase):
    id: uuid.UUID
    user_id: uuid.UUID

# --- Event Schemas ---
class EventBase(BaseModel):
    title: str
    date: str  # ISO format
    category: str
    description: str

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    id: uuid.UUID

# --- Checkin Schemas ---
class CheckinBase(BaseModel):
    child_id: uuid.UUID
    event_id: uuid.UUID

class CheckinCreate(CheckinBase):
    pass

class CheckinRead(CheckinBase):
    id: uuid.UUID
    timestamp: str  # ISO format

# --- Announcement Schemas ---
class AnnouncementBase(BaseModel):
    title: str
    content: str

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementRead(AnnouncementBase):
    id: uuid.UUID
    created_by: uuid.UUID
    created_at: str  # ISO format

# --- Prayer Request Schemas ---
class PrayerRequestBase(BaseModel):
    content: str
    anonymous: bool = False

class PrayerRequestCreate(PrayerRequestBase):
    pass

class PrayerRequestRead(PrayerRequestBase):
    id: uuid.UUID
    user_id: str = None
    status: str
    created_at: str  # ISO format

# --- Donation Schemas ---
class DonationBase(BaseModel):
    amount: float
    category: str

class DonationCreate(DonationBase):
    pass

class DonationRead(DonationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: str  # ISO format
