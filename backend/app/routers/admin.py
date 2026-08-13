from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserRoleUpdate, UserStatusUpdate
from app.schemas.meeting import MeetingResponse
from app.schemas.participant import ParticipantResponse
from app.services import admin_service, meeting_service
from app.core.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Retrieve real system statistics for admin dashboard."""
    return admin_service.get_admin_dashboard_stats(db)


@router.get("/users", response_model=List[UserResponse])
def get_users(
    query: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by account role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """List all registered users with search and filter capabilities."""
    return admin_service.get_admin_users(db, query=query, role_filter=role, is_active_filter=is_active)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Update a user's account role (OWNER, ADMIN, MEMBER)."""
    return admin_service.update_user_role(db, admin_user, user_id, payload.role)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Enable or disable a user account."""
    return admin_service.update_user_status(db, admin_user, user_id, payload.is_active)


@router.get("/meetings")
def get_meetings(
    query: Optional[str] = Query(None, description="Search by title or meeting ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Retrieve all meetings in the system with host details."""
    return admin_service.get_admin_meetings(db, query=query, status_filter=status)


@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting_details(
    meeting_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Get full details of any meeting by Meeting ID."""
    return meeting_service.get_meeting_by_id(db, meeting_id)


@router.post("/meetings/{meeting_id}/end", response_model=MeetingResponse)
def end_meeting_admin(
    meeting_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Administratively end any active meeting."""
    return meeting_service.end_meeting(db, meeting_id, admin_user)


@router.get("/participants", response_model=List[ParticipantResponse])
def get_participants(
    meeting_id: Optional[str] = Query(None, description="Filter by Meeting ID"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Retrieve all meeting participants across the platform."""
    return admin_service.get_admin_participants(db, meeting_id=meeting_id)
