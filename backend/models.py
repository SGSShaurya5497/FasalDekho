"""
SQLAlchemy models for Plant Disease Detection system.
Includes User authentication schema, Detection logs, and indexes for spatial heatmap queries.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from datetime import datetime
from database import Base


class User(Base):
    """Model representing an authenticated user (farmer, agronomist, admin)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Detection(Base):
    """Model representing a plant disease detection log with geolocation metadata."""
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String, nullable=True, index=True)
    crop_type = Column(String, index=True, nullable=False)
    disease_class = Column(String, index=True, nullable=False)
    confidence = Column(Float, nullable=False)
    severity_percent = Column(Float, default=0.0)
    deficiency_flag = Column(String, nullable=True)
    latitude = Column(Float, index=True, nullable=True)
    longitude = Column(Float, index=True, nullable=True)
    spray_advisory = Column(String, nullable=True)
    status = Column(String, index=True, default="completed")  # "completed" or "needs_review"
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Composite indexes for fast heatmap cluster aggregation queries
    __table_args__ = (
        Index("idx_detections_lat_lon", "latitude", "longitude"),
        Index("idx_detections_crop_created", "crop_type", "created_at"),
    )
