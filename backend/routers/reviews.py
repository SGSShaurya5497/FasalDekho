"""
Admin / Expert Reviews Router.

Provides GET /admin/reviews and PATCH /admin/reviews/{id} endpoints to list
and manage low-confidence predictions flagged for expert escalation.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from database import get_db
from models import Detection

router = APIRouter(prefix="/admin", tags=["Admin & Expert Panel Escalation"])


@router.get("/reviews", response_model=List[Dict[str, Any]])
def get_escalated_reviews(
    status: str = Query("needs_review", description="Status filter: 'needs_review' or 'completed'"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns list of detections flagged for expert panel review due to low prediction confidence.
    """
    records = db.query(Detection).filter(Detection.status == status).order_by(Detection.created_at.desc()).limit(limit).all()

    output = []
    for rec in records:
        output.append({
            "id": rec.id,
            "user_id": rec.user_id,
            "crop_type": rec.crop_type,
            "disease_class": rec.disease_class,
            "confidence": rec.confidence,
            "severity_percent": rec.severity_percent,
            "deficiency_flag": rec.deficiency_flag,
            "latitude": rec.latitude,
            "longitude": rec.longitude,
            "status": rec.status,
            "created_at": rec.created_at.isoformat() if rec.created_at else None
        })
    return output


@router.patch("/reviews/{detection_id}")
def update_review_status(
    detection_id: int,
    status: str = Query(..., description="New status, e.g. 'reviewed' or 'completed'"),
    verified_class: Optional[str] = Query(None, description="Expert verified disease class"),
    db: Session = Depends(get_db)
):
    """
    Updates status and optional expert-verified class of an escalated detection.
    """
    record = db.query(Detection).filter(Detection.id == detection_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Detection record not found.")

    record.status = status
    if verified_class:
        record.disease_class = verified_class

    db.commit()
    db.refresh(record)

    return {
        "message": f"Record {detection_id} updated successfully.",
        "status": record.status,
        "disease_class": record.disease_class
    }
