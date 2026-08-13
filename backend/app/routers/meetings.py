from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.meeting import MeetingCreate, MeetingSchedule, MeetingResponse
from app.schemas.participant import (
    ParticipantCreate,
    ParticipantRoleUpdate,
    JoinMeetingResponse,
    ParticipantResponse
)
from app.services import meeting_service
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_instant(
    meeting_in: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.create_instant_meeting(db, meeting_in, current_user)


@router.post("/schedule", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def schedule(
    meeting_in: MeetingSchedule,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.schedule_meeting(db, meeting_in, current_user)


@router.get("/upcoming", response_model=List[MeetingResponse])
def list_upcoming(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.get_upcoming_meetings(db, current_user=current_user)


@router.get("/recent", response_model=List[MeetingResponse])
def list_recent(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.get_recent_meetings(db, current_user=current_user)


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.get_meeting_by_id(db, meeting_id)


@router.post("/{meeting_id}/join", response_model=JoinMeetingResponse)
def join(
    meeting_id: str,
    participant_in: ParticipantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    participant = meeting_service.join_meeting(
        db,
        meeting_id,
        current_user=current_user,
        custom_display_name=participant_in.display_name
    )
    clean_id = meeting_service.normalize_meeting_id(meeting_id)
    return JoinMeetingResponse(
        meeting_id=clean_id,
        participant_id=participant.id,
        user_id=participant.user_id,
        display_name=participant.display_name,
        meeting_role=participant.meeting_role,
        joined_at=participant.joined_at
    )


@router.get("/{meeting_id}/participants", response_model=List[ParticipantResponse])
def get_participants(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch active participants in a meeting."""
    return meeting_service.get_active_meeting_participants(db, meeting_id)


@router.patch("/{meeting_id}/participants/{participant_id}/role", response_model=ParticipantResponse)
def update_participant_role(
    meeting_id: str,
    participant_id: int,
    payload: ParticipantRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Promote or demote a participant (e.g. CO_HOST)."""
    return meeting_service.update_participant_role(
        db,
        meeting_id,
        participant_id,
        payload.role,
        current_user
    )


@router.delete("/{meeting_id}/participants/{participant_id}", response_model=ParticipantResponse)
def remove_participant(
    meeting_id: str,
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a participant from the meeting room."""
    return meeting_service.remove_participant(
        db,
        meeting_id,
        participant_id,
        current_user
    )


@router.post("/{meeting_id}/mute-all")
def mute_all(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mute all participants in a meeting room (Host/Co-Host/Admin action)."""
    return meeting_service.mute_all_participants(
        db,
        meeting_id,
        current_user
    )


@router.post("/{meeting_id}/leave", response_model=ParticipantResponse)
def leave(
    meeting_id: str,
    participant_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.leave_meeting(db, meeting_id, current_user, participant_id)


@router.post("/{meeting_id}/end", response_model=MeetingResponse)
def end(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return meeting_service.end_meeting(db, meeting_id, current_user)

