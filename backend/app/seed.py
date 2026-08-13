from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Meeting, Participant
from app.core.security import hash_password


def seed_database(db: Session):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


    # 1. Owner User
    owner_user = db.query(User).filter(User.email == "owner@example.com").first()
    if not owner_user:
        owner_user = User(
            name="System Owner",
            email="owner@example.com",
            password_hash=hash_password("admin123"),
            account_role="OWNER",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(owner_user)
        db.commit()
        db.refresh(owner_user)

    # 2. Admin User
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            name="Administrator",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            account_role="ADMIN",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
    else:
        if admin_user.account_role != "ADMIN":
            admin_user.account_role = "ADMIN"
            db.commit()

    # 3. Standard Member User (Dhiraj Kumar)
    member_user = db.query(User).filter(User.email == "dhiraj@example.com").first()
    if not member_user:
        member_user = User(
            name="Dhiraj Kumar",
            email="dhiraj@example.com",
            password_hash=hash_password("password123"),
            account_role="MEMBER",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(member_user)
        db.commit()
        db.refresh(member_user)

    else:
        if member_user.account_role != "MEMBER":
            member_user.account_role = "MEMBER"
            db.commit()

    # 4. Secondary Member User (Member Demo)
    member_demo = db.query(User).filter(User.email == "member@example.com").first()
    if not member_demo:
        member_demo = User(
            name="Member User",
            email="member@example.com",
            password_hash=hash_password("member123"),
            account_role="MEMBER",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(member_demo)
        db.commit()
        db.refresh(member_demo)

    existing_meetings_count = db.query(Meeting).count()
    if existing_meetings_count == 0:
        now = datetime.utcnow()
        tomorrow_10am = (now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
        tomorrow_3pm = (now + timedelta(days=1)).replace(hour=15, minute=0, second=0, microsecond=0)
        day_after_2pm = (now + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)

        yesterday_9am = (now - timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        yesterday_4pm = (now - timedelta(days=1)).replace(hour=16, minute=0, second=0, microsecond=0)

        upcoming_seed_data = [
            {
                "meeting_id": "482719365",
                "title": "Product Strategy & Architecture Review",
                "description": "Quarterly roadmap alignment and engineering review with leadership.",
                "scheduled_at": tomorrow_10am,
                "duration_minutes": 60,
                "invite_link": "/meeting/482719365",
                "status": "scheduled",
                "created_at": now - timedelta(hours=2),
                "host": member_user
            },
            {
                "meeting_id": "719482301",
                "title": "Frontend & UX Design Sync",
                "description": "Reviewing new design tokens, glassmorphism UI components, and mobile layout.",
                "scheduled_at": tomorrow_3pm,
                "duration_minutes": 45,
                "invite_link": "/meeting/719482301",
                "status": "scheduled",
                "created_at": now - timedelta(hours=1),
                "host": admin_user
            },
            {
                "meeting_id": "905123847",
                "title": "Sprint Planning & Backlog Grooming",
                "description": "Assigning upcoming user stories and technical tasks for Sprint 24.",
                "scheduled_at": day_after_2pm,
                "duration_minutes": 90,
                "invite_link": "/meeting/905123847",
                "status": "scheduled",
                "created_at": now,
                "host": owner_user
            }
        ]

        recent_seed_data = [
            {
                "meeting_id": "314159265",
                "title": "Engineering Standup & Bug Triage",
                "description": "Daily team sync to review active pull requests and blocker issues.",
                "scheduled_at": yesterday_9am,
                "duration_minutes": 30,
                "invite_link": "/meeting/314159265",
                "status": "ended",
                "created_at": yesterday_9am - timedelta(minutes=10),
                "started_at": yesterday_9am,
                "ended_at": yesterday_9am + timedelta(minutes=32),
                "host": member_user
            },
            {
                "meeting_id": "271828182",
                "title": "Client Onboarding & Demo",
                "description": "Live demonstration of Zoom Clone core features for prospective enterprise client.",
                "scheduled_at": yesterday_4pm,
                "duration_minutes": 60,
                "invite_link": "/meeting/271828182",
                "status": "ended",
                "created_at": yesterday_4pm - timedelta(minutes=15),
                "started_at": yesterday_4pm,
                "ended_at": yesterday_4pm + timedelta(minutes=55),
                "host": admin_user
            }
        ]

        for data in upcoming_seed_data:
            m = Meeting(
                meeting_id=data["meeting_id"],
                title=data["title"],
                description=data["description"],
                host_user_id=data["host"].id,
                scheduled_at=data["scheduled_at"],
                duration_minutes=data["duration_minutes"],
                invite_link=data["invite_link"],
                status=data["status"],
                created_at=data["created_at"]
            )
            db.add(m)

        for data in recent_seed_data:
            m = Meeting(
                meeting_id=data["meeting_id"],
                title=data["title"],
                description=data["description"],
                host_user_id=data["host"].id,
                scheduled_at=data["scheduled_at"],
                duration_minutes=data["duration_minutes"],
                invite_link=data["invite_link"],
                status=data["status"],
                created_at=data["created_at"],
                started_at=data.get("started_at"),
                ended_at=data.get("ended_at")
            )
            db.add(m)
            db.flush()

            p1 = Participant(
                meeting_id=m.id,
                user_id=data["host"].id,
                display_name=data["host"].name,
                meeting_role="HOST",
                joined_at=data["started_at"],
                left_at=data["ended_at"]
            )
            p2 = Participant(
                meeting_id=m.id,
                user_id=member_demo.id,
                display_name=member_demo.name,
                meeting_role="PARTICIPANT",
                joined_at=data["started_at"] + timedelta(minutes=2),
                left_at=data["ended_at"]
            )
            db.add_all([p1, p2])

        db.commit()



if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
        print("Database seeded successfully.")
    finally:
        db.close()
