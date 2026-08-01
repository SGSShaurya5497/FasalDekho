"""
Economic Threshold Calculator Router.

Provides POST /economic-threshold endpoint implementing cost-benefit formulas
to recommend economic action (treat, monitor, or not worth treating).
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from models import User
from routers.auth import get_optional_user

router = APIRouter(prefix="", tags=["Economic Threshold Calculator"])


class EconomicThresholdRequest(BaseModel):
    crop_type: str = Field(..., example="Tomato")
    growth_stage: str = Field(..., example="fruiting", description="seedling, vegetative, flowering, fruiting, harvest")
    disease_class: Optional[str] = Field("General Disease", example="Tomato___Late_blight")
    severity_percent: float = Field(15.0, ge=0.0, le=100.0, example=20.0)
    estimated_yield_loss_percent: Optional[float] = Field(None, ge=0.0, le=100.0, description="Optional explicit yield loss %")
    treatment_cost_per_acre: float = Field(..., gt=0.0, example=45.0, description="Cost of chemical/organic treatment per acre")
    expected_market_price_per_unit: float = Field(..., gt=0.0, example=2.5, description="Market price per unit (e.g. $ per kg or bushel)")
    expected_yield_per_acre: float = Field(..., gt=0.0, example=1000.0, description="Expected baseline harvest yield units per acre")


@router.post("/economic-threshold", response_model=Dict[str, Any])
def calculate_economic_threshold(
    payload: EconomicThresholdRequest,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Calculates cost-benefit analysis for crop disease treatment and returns recommendation.
    """
    stage_multipliers = {
        "seedling": 1.2,
        "vegetative": 1.0,
        "flowering": 1.3,
        "fruiting": 1.4,
        "harvest": 0.4
    }

    multiplier = stage_multipliers.get(payload.growth_stage.lower(), 1.0)

    # Estimate yield loss % if not explicitly provided
    if payload.estimated_yield_loss_percent is not None:
        yield_loss_pct = payload.estimated_yield_loss_percent
    else:
        yield_loss_pct = min(payload.severity_percent * 0.45 * multiplier, 95.0)

    expected_loss_units = payload.expected_yield_per_acre * (yield_loss_pct / 100.0)
    expected_loss_value = expected_loss_units * payload.expected_market_price_per_unit
    net_benefit = expected_loss_value - payload.treatment_cost_per_acre

    if expected_loss_value > (payload.treatment_cost_per_acre * 1.25):
        recommendation = "treat"
        rationale = (
            f"Treatment is strongly recommended. Estimated potential crop loss value (₹{round(expected_loss_value, 2)}) "
            f"significantly exceeds treatment cost (₹{round(payload.treatment_cost_per_acre, 2)}), "
            f"yielding an estimated net financial protection of ₹{round(net_benefit, 2)} per acre."
        )
    elif expected_loss_value >= (payload.treatment_cost_per_acre * 0.75):
        recommendation = "monitor"
        rationale = (
            f"Active monitoring recommended. Estimated loss value (₹{round(expected_loss_value, 2)}) is close "
            f"to treatment cost (₹{round(payload.treatment_cost_per_acre, 2)}). Delay spray application unless severity worsens."
        )
    else:
        recommendation = "not worth treating"
        rationale = (
            f"Treatment is not economically justified. Estimated crop loss value (₹{round(expected_loss_value, 2)}) "
            f"is lower than application cost (₹{round(payload.treatment_cost_per_acre, 2)})."
        )

    return {
        "recommendation": recommendation,
        "crop_type": payload.crop_type,
        "growth_stage": payload.growth_stage,
        "severity_percent": payload.severity_percent,
        "estimated_yield_loss_percent": round(yield_loss_pct, 2),
        "expected_loss_value_per_acre": round(expected_loss_value, 2),
        "treatment_cost_per_acre": round(payload.treatment_cost_per_acre, 2),
        "net_benefit_per_acre": round(net_benefit, 2),
        "rationale": rationale,
        "calculated_for": current_user.email if current_user else "guest"
    }
