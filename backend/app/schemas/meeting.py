from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.participant import ParticipantResponse


class MeetingCreate(BaseModel):
    title: Optional[str] = "Instant Meeting"
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    host_user_id: Optional[int] = 1


class MeetingSchedule(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    host_user_id: Optional[int] = 1


class MeetingResponse(BaseModel):
    id: int
    meeting_id: str
    title: str
    description: Optional[str] = None
    host_user_id: int
    host_name: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    invite_link: str
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    participants: List[ParticipantResponse] = []

    class Config:
        from_attributes = True

