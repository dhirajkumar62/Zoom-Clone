import random
import re
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingSchedule


def normalize_meeting_id(meeting_id_input: str) -> str:
    """Removes all whitespace and non-alphanumeric characters to get raw meeting ID."""
    return re.sub(r"\D", "", meeting_id_input)


def generate_unique_meeting_id(db: Session) -> str:
    """Generates a random 9-digit Meeting ID and ensures database uniqueness."""
    while True:
        candidate = f"{random.randint(100, 999)}{random.randint(100, 999)}{random.randint(100, 999)}"
        existing = db.query(Meeting).filter(Meeting.meeting_id == candidate).first()
        if not existing:
            return candidate


def create_instant_meeting(db: Session, meeting_data: MeetingCreate, host_user: User) -> Meeting:
    m_id = generate_unique_meeting_id(db)
    invite_link = f"/meeting/{m_id}"

    meeting = Meeting(
        meeting_id=m_id,
        title=meeting_data.title or "Instant Meeting",
        description=meeting_data.description,
        host_user_id=host_user.id,
        scheduled_at=None,
        duration_minutes=None,
        invite_link=invite_link,
        status="active",
        started_at=datetime.utcnow()
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def schedule_meeting(db: Session, meeting_data: MeetingSchedule, host_user: User) -> Meeting:
    m_id = generate_unique_meeting_id(db)
    invite_link = f"/meeting/{m_id}"

    meeting = Meeting(
        meeting_id=m_id,
        title=meeting_data.title,
        description=meeting_data.description,
        host_user_id=host_user.id,
        scheduled_at=meeting_data.scheduled_at,
        duration_minutes=meeting_data.duration_minutes,
        invite_link=invite_link,
        status="scheduled"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


def get_meeting_by_id(db: Session, raw_id_input: str) -> Meeting:
    clean_id = normalize_meeting_id(raw_id_input)
    meeting = db.query(Meeting).filter(Meeting.meeting_id == clean_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found"
        )
    return meeting


def join_meeting(
    db: Session,
    raw_id_input: str,
    current_user: User,
    custom_display_name: Optional[str] = None
) -> Participant:
    """Join a meeting with strict user authentication and automated role assignment."""
    meeting = get_meeting_by_id(db, raw_id_input)

    if meeting.status == "ended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This meeting has ended and is no longer accepting participants."
        )

    # Check if user was previously removed by host from this meeting
    removed = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.user_id == current_user.id,
        Participant.is_removed == True
    ).first()

    if removed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have been removed from this meeting by the host and cannot rejoin."
        )

    if meeting.status == "scheduled":
        meeting.status = "active"
        if not meeting.started_at:
            meeting.started_at = datetime.utcnow()
        db.commit()

    # Determine meeting role
    meeting_role = "HOST" if meeting.host_user_id == current_user.id else "PARTICIPANT"
    chosen_name = custom_display_name.strip() if custom_display_name and custom_display_name.strip() else current_user.name

    # Check for existing participant record
    existing = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.user_id == current_user.id,
        Participant.left_at.is_(None)
    ).first()

    if existing:
        existing.display_name = chosen_name
        existing.meeting_role = meeting_role
        db.commit()
        db.refresh(existing)
        return existing

    participant = Participant(
        meeting_id=meeting.id,
        user_id=current_user.id,
        display_name=chosen_name,
        meeting_role=meeting_role,
        joined_at=datetime.utcnow()
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)

    # Broadcast participant_joined event
    try:
        import asyncio
        from app.core.ws_manager import ws_manager
        clean_id = normalize_meeting_id(raw_id_input)
        asyncio.create_task(ws_manager.broadcast(clean_id, {
            "event": "participant_joined",
            "participant_id": participant.id,
            "user_id": participant.user_id,
            "display_name": participant.display_name,
            "meeting_role": participant.meeting_role
        }))
    except Exception:
        pass

    return participant


def get_active_meeting_participants(db: Session, raw_id_input: str) -> List[Dict[str, Any]]:
    """Retrieve currently active (non-left) participants for a specific meeting."""
    meeting = get_meeting_by_id(db, raw_id_input)
    participants = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.left_at.is_(None)
    ).order_by(Participant.joined_at.asc()).all()

    results = []
    for p in participants:
        user_email = p.user.email if p.user else None
        results.append({
            "id": p.id,
            "meeting_id": p.meeting_id,
            "user_id": p.user_id,
            "display_name": p.display_name,
            "meeting_role": p.meeting_role,
            "is_muted": p.is_muted,
            "is_removed": p.is_removed,
            "joined_at": p.joined_at,
            "left_at": p.left_at,
            "email": user_email,
        })
    return results


def update_participant_role(
    db: Session,
    raw_id_input: str,
    participant_id: int,
    new_role: str,
    current_user: User
) -> Participant:
    """Promote or demote a participant within a meeting."""
    meeting = get_meeting_by_id(db, raw_id_input)
    target_role = new_role.upper()

    if target_role not in ["HOST", "CO_HOST", "PARTICIPANT"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid meeting role. Allowed roles: HOST, CO_HOST, PARTICIPANT."
        )

    # Check caller authorization: Must be Host, Admin, or Owner
    is_host = meeting.host_user_id == current_user.id
    is_admin = current_user.account_role in ["ADMIN", "OWNER"]

    if not is_host and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the meeting host or an administrator can modify participant roles."
        )

    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.meeting_id == meeting.id
    ).first()

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant record not found in this meeting."
        )

    participant.meeting_role = target_role
    db.commit()
    db.refresh(participant)
    return participant


def mute_all_participants(
    db: Session,
    raw_id_input: str,
    current_user: User
) -> Dict[str, Any]:
    """Mute all active participants in a meeting room."""
    meeting = get_meeting_by_id(db, raw_id_input)
    is_host = meeting.host_user_id == current_user.id
    is_admin = current_user.account_role in ["ADMIN", "OWNER"]

    co_host = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.user_id == current_user.id,
        Participant.meeting_role == "CO_HOST",
        Participant.left_at.is_(None)
    ).first()

    if not is_host and not is_admin and not co_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only meeting hosts, co-hosts, or administrators can mute all participants."
        )

    active_participants = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.left_at.is_(None)
    ).all()

    for p in active_participants:
        p.is_muted = True

    db.commit()

    clean_id = normalize_meeting_id(raw_id_input)
    try:
        import asyncio
        from app.core.ws_manager import ws_manager
        asyncio.create_task(ws_manager.broadcast(clean_id, {
            "event": "mute_all",
            "requested_by_user_id": current_user.id,
            "host_name": current_user.name
        }))
    except Exception:
        pass

    return {"message": "All participants muted successfully", "muted_count": len(active_participants)}


def remove_participant(
    db: Session,
    raw_id_input: str,
    participant_id: int,
    current_user: User
) -> Participant:
    """Remove a participant from an active meeting (sets left_at and is_removed)."""
    meeting = get_meeting_by_id(db, raw_id_input)

    # Check caller authorization: Must be Host, Co-Host, Admin, or Owner
    is_host = meeting.host_user_id == current_user.id
    is_admin = current_user.account_role in ["ADMIN", "OWNER"]

    # Check if current user is Co-Host
    co_host = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.user_id == current_user.id,
        Participant.meeting_role == "CO_HOST",
        Participant.left_at.is_(None)
    ).first()

    if not is_host and not is_admin and not co_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only meeting hosts, co-hosts, or administrators can remove participants."
        )

    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.meeting_id == meeting.id
    ).first()

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant record not found."
        )

    participant.is_removed = True
    participant.left_at = datetime.utcnow()
    db.commit()
    db.refresh(participant)

    clean_id = normalize_meeting_id(raw_id_input)
    try:
        import asyncio
        from app.core.ws_manager import ws_manager
        asyncio.create_task(ws_manager.broadcast(clean_id, {
            "event": "participant_removed",
            "participant_id": participant.id,
            "target_user_id": participant.user_id,
            "display_name": participant.display_name
        }))
    except Exception:
        pass

    return participant


def leave_meeting(
    db: Session,
    raw_id_input: str,
    current_user: User,
    participant_id: Optional[int] = None
) -> Participant:
    """Record participant departure from meeting."""
    meeting = get_meeting_by_id(db, raw_id_input)

    q = db.query(Participant).filter(
        Participant.meeting_id == meeting.id,
        Participant.user_id == current_user.id,
        Participant.left_at.is_(None)
    )

    if participant_id:
        q = q.filter(Participant.id == participant_id)

    participant = q.order_by(Participant.joined_at.desc()).first()

    clean_id = normalize_meeting_id(raw_id_input)

    if participant and not participant.left_at:
        participant.left_at = datetime.utcnow()
        db.commit()
        db.refresh(participant)

        try:
            import asyncio
            from app.core.ws_manager import ws_manager
            asyncio.create_task(ws_manager.broadcast(clean_id, {
                "event": "participant_left",
                "participant_id": participant.id,
                "user_id": current_user.id,
                "display_name": current_user.name
            }))
        except Exception:
            pass

        return participant

    try:
        import asyncio
        from app.core.ws_manager import ws_manager
        asyncio.create_task(ws_manager.broadcast(clean_id, {
            "event": "participant_left",
            "user_id": current_user.id,
            "display_name": current_user.name
        }))
    except Exception:
        pass

    return Participant(
        meeting_id=meeting.id,
        user_id=current_user.id,
        display_name=current_user.name,
        meeting_role="PARTICIPANT",
        left_at=datetime.utcnow()
    )


def end_meeting(db: Session, raw_id_input: str, current_user: User) -> Meeting:
    """End an active meeting session."""
    meeting = get_meeting_by_id(db, raw_id_input)
    is_host = meeting.host_user_id == current_user.id
    is_admin_or_owner = current_user.account_role in ["ADMIN", "OWNER"]

    if not is_host and not is_admin_or_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the meeting host or an administrator can end this session."
        )

    meeting.status = "ended"
    meeting.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(meeting)
    return meeting


def get_upcoming_meetings(db: Session, current_user: Optional[User] = None) -> List[Meeting]:
    now = datetime.utcnow()
    q = db.query(Meeting).filter(
        Meeting.status == "scheduled",
        Meeting.scheduled_at >= now
    )
    # If normal user, filter by ownership or participation
    if current_user and current_user.account_role == "MEMBER":
        joined_meeting_ids = [
            p.meeting_id for p in db.query(Participant.meeting_id).filter(Participant.user_id == current_user.id).all()
        ]
        q = q.filter(or_(Meeting.host_user_id == current_user.id, Meeting.id.in_(joined_meeting_ids)))

    return q.order_by(Meeting.scheduled_at.asc()).all()


def get_recent_meetings(db: Session, current_user: Optional[User] = None) -> List[Meeting]:
    q = db.query(Meeting)
    if current_user and current_user.account_role == "MEMBER":
        joined_meeting_ids = [
            p.meeting_id for p in db.query(Participant.meeting_id).filter(Participant.user_id == current_user.id).all()
        ]
        q = q.filter(or_(Meeting.host_user_id == current_user.id, Meeting.id.in_(joined_meeting_ids)))

    return q.order_by(Meeting.created_at.desc()).limit(10).all()


def mark_participant_left_by_ws(
    db: Session,
    raw_id_input: str,
    user_id: Optional[int] = None,
    participant_id: Optional[int] = None,
    display_name: Optional[str] = None
) -> Optional[Participant]:
    """Marks a participant as left in DB when WebSocket disconnects or tab is closed."""
    try:
        clean_id = normalize_meeting_id(raw_id_input)
        meeting = db.query(Meeting).filter(Meeting.meeting_id == clean_id).first()
        if not meeting:
            return None

        q = db.query(Participant).filter(
            Participant.meeting_id == meeting.id,
            Participant.left_at.is_(None)
        )

        p = None
        if participant_id:
            try:
                p = q.filter(Participant.id == int(participant_id)).first()
            except Exception:
                pass
        if not p and user_id:
            try:
                p = q.filter(Participant.user_id == int(user_id)).first()
            except Exception:
                pass
        if not p and display_name:
            p = q.filter(Participant.display_name == str(display_name)).first()

        if p and not p.left_at:
            p.left_at = datetime.utcnow()
            db.commit()
            db.refresh(p)
            return p
    except Exception as err:
        print(f"Error marking participant left by ws: {err}")
    return None

