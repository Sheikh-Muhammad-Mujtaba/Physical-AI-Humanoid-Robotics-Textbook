import uuid
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

# BetterAuth session model (read-only, managed by BetterAuth)
class BetterAuthSession(Base):
    __tablename__ = "session"

    id = Column(String, primary_key=True)
    userId = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    expiresAt = Column(DateTime(timezone=True), nullable=False)
    ipAddress = Column(String, nullable=True)
    userAgent = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), nullable=False)
    updatedAt = Column(DateTime(timezone=True), nullable=False)

# BetterAuth user model (read-only, managed by BetterAuth)
class BetterAuthUser(Base):
    __tablename__ = "user"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    emailVerified = Column(Boolean, nullable=False)
    image = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), nullable=False)
    updatedAt = Column(DateTime(timezone=True), nullable=False)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    # Note: user_id column doesn't exist in current schema (see prompt.txt lines 106-145)
    # user_id = Column(String, nullable=False, index=True)  # Commented out - not in DB
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sender = Column(String, nullable=False)
    text = Column(Text, nullable=False)

class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("chat_history.message_id"), nullable=False)
    rating = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
