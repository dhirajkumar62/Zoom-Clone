from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    account_role = Column(String, nullable=False, default="MEMBER")  # OWNER, ADMIN, MEMBER
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meetings = relationship("Meeting", back_populates="host")
    participants = relationship("Participant", back_populates="user")

    @property
    def role(self) -> str:
        return self.account_role

    @role.setter
    def role(self, value: str):
        if value:
            # Map legacy 'user' or 'admin' strings
            val_upper = value.upper()
            if val_upper == "USER":
                self.account_role = "MEMBER"
            else:
                self.account_role = val_upper

