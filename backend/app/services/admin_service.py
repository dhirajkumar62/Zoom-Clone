from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User
from app.models.meeting import Meeting
from app.models.participant import Participant


def get_admin_dashboard_stats(db: Session) -> Dict[str, int]:
    """Calculate system-wide statistics from real database queries."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_meetings = db.query(Meeting).count()
    active_meetings = db.query(Meeting).filter(Meeting.status == "active").count()
    scheduled_meetings = db.query(Meeting).filter(Meeting.status == "scheduled").count()
    total_participants = db.query(Participant).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_meetings": total_meetings,
        "active_meetings": active_meetings,
        "scheduled_meetings": scheduled_meetings,
        "total_participants": total_participants,
    }


def get_admin_users(
    db: Session,
    query: Optional[str] = None,
    role_filter: Optional[str] = None,
    is_active_filter: Optional[bool] = None,
) -> List[User]:
    """Fetch users with search and filter capabilities."""
    q = db.query(User)

    if query:
        term = f"%{query.strip()}%"
        q = q.filter(or_(User.name.ilike(term), User.email.ilike(term)))

    if role_filter:
        q = q.filter(User.account_role == role_filter.upper())

    if is_active_filter is not None:
        q = q.filter(User.is_active.is_(is_active_filter))

    return q.order_by(User.created_at.desc()).all()


def update_user_role(db: Session, current_user: User, target_user_id: int, new_role: str) -> User:
    """Update a user's account role adhering strictly to hierarchy rules."""
    target_role = new_role.upper()
    if target_role not in ["OWNER", "ADMIN", "MEMBER"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid account role. Must be OWNER, ADMIN, or MEMBER.",
        )

    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    # Security hierarchy enforcement
    if current_user.account_role == "ADMIN":
        # Admin cannot alter an Owner
        if target_user.account_role == "OWNER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrators cannot modify the system Owner's role.",
            )
        # Admin cannot promote anyone (or self) to OWNER
        if target_role == "OWNER":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrators cannot grant Owner permissions.",
            )

    target_user.account_role = target_role
    db.commit()
    db.refresh(target_user)
    return target_user


def update_user_status(db: Session, current_user: User, target_user_id: int, is_active: bool) -> User:
    """Enable or disable a user account."""
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found",
        )

    # Cannot disable yourself
    if current_user.id == target_user.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    # Admin cannot disable Owner
    if current_user.account_role == "ADMIN" and target_user.account_role == "OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrators cannot deactivate the system Owner.",
        )

    target_user.is_active = is_active
    db.commit()
    db.refresh(target_user)
    return target_user


def get_admin_meetings(
    db: Session,
    query: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Fetch all meetings system-wide with host information."""
    q = db.query(Meeting)

    if query:
        term = f"%{query.strip()}%"
        q = q.filter(or_(Meeting.title.ilike(term), Meeting.meeting_id.ilike(term)))

    if status_filter:
        q = q.filter(Meeting.status == status_filter.lower())

    meetings = q.order_by(Meeting.created_at.desc()).all()
    results = []
    for m in meetings:
        res = {
            "id": m.id,
            "meeting_id": m.meeting_id,
            "title": m.title,
            "description": m.description,
            "host_user_id": m.host_user_id,
            "host_name": m.host.name if m.host else "Unknown",
            "scheduled_at": m.scheduled_at,
            "duration_minutes": m.duration_minutes,
            "invite_link": m.invite_link,
            "status": m.status,
            "created_at": m.created_at,
            "started_at": m.started_at,
            "ended_at": m.ended_at,
            "participants_count": len(m.participants),
        }
        results.append(res)
    return results


def get_admin_participants(
    db: Session,
    meeting_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Fetch all participants across meetings with user details."""
    q = db.query(Participant)

    if meeting_id:
        clean_id = meeting_id.replace("-", "").replace(" ", "")
        m = db.query(Meeting).filter(Meeting.meeting_id == clean_id).first()
        if m:
            q = q.filter(Participant.meeting_id == m.id)

    participants = q.order_by(Participant.joined_at.desc()).all()
    results = []
    for p in participants:
        user_email = p.user.email if p.user else None
        results.append({
            "id": p.id,
            "meeting_id": p.meeting_id,
            "user_id": p.user_id,
            "display_name": p.display_name,
            "meeting_role": p.meeting_role,
            "joined_at": p.joined_at,
            "left_at": p.left_at,
            "email": user_email,
        })
    return results
