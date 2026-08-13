from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserRoleUpdate(BaseModel):
    role: str


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(UserBase):
    id: int
    account_role: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

