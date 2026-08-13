from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    display_name = Column(String, nullable=False)
    meeting_role = Column(String, nullable=False, default="PARTICIPANT")  # HOST, CO_HOST, PARTICIPANT
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime, nullable=True)

    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User", back_populates="participants")

