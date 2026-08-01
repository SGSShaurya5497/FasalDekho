"""
Expert Escalation Service.

Evaluates prediction confidence against the configured threshold.
Flags low-confidence disease detections for expert / administrator review.
"""
from config import CONFIDENCE_THRESHOLD


def evaluate_escalation(confidence: float, custom_threshold: float = CONFIDENCE_THRESHOLD) -> dict:
    """
    Evaluates whether a disease prediction should be escalated for expert review.

    Args:
        confidence (float): Prediction confidence score (0.0 to 1.0).
        custom_threshold (float): Configurable threshold (default 0.70 / 70%).

    Returns:
        dict: Escalation decision details.
    """
    needs_review = confidence < custom_threshold
    
    if needs_review:
        reason = f"Prediction confidence ({round(confidence * 100, 1)}%) is below threshold ({round(custom_threshold * 100, 1)}%). Flagged for expert review."
    else:
        reason = f"High confidence prediction ({round(confidence * 100, 1)}%). Expert review not required."

    return {
        "needs_review": needs_review,
        "status": "needs_review" if needs_review else "completed",
        "reason": reason,
        "threshold": custom_threshold
    }
