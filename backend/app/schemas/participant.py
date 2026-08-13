from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class ParticipantCreate(BaseModel):
    display_name: Optional[str] = None


class ParticipantRoleUpdate(BaseModel):
    role: str


class ParticipantResponse(BaseModel):
    id: int
    meeting_id: int
    user_id: int
    display_name: str
    meeting_role: str
    joined_at: datetime
    left_at: Optional[datetime] = None
    email: Optional[EmailStr] = None

    class Config:
        from_attributes = True


class JoinMeetingResponse(BaseModel):
    meeting_id: str
    participant_id: int
    user_id: int
    display_name: str
    meeting_role: str
    joined_at: datetime

