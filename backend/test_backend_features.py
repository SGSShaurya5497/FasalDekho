"""
Integration test script to verify all 6 backend features end-to-end:
1. Severity / spread estimation
2. Nutrient deficiency differentiator
3. Weather spray advisory (Open-Meteo API)
4. Outbreak heatmap data layer (SQLite / GET /outbreaks)
5. Economic threshold calculator (POST /economic-threshold)
6. Confidence-based expert escalation (GET /admin/reviews)
"""
import io
import os
import sys
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

from main import app
from database import Base, engine, SessionLocal
from models import Detection
from routers.predict import load_all_models

client = TestClient(app)


def create_synthetic_leaf_image() -> bytes:
    """Creates a synthetic plant leaf image with a discolored lesion spot."""
    # 300x300 canvas
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    # Green leaf background
    img[50:250, 50:250] = [34, 139, 34]  # Green
    # Add necrotic spot (brown/yellow)
    img[120:170, 120:170] = [139, 69, 19]  # Saddle Brown
    img[140:190, 140:190] = [218, 165, 32] # Goldenrod / Chlorosis

    pil_img = Image.fromarray(img)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="JPEG")
    buffer.seek(0)
    return buffer.getvalue()


def run_all_tests():
    load_all_models()
    print("\n==========================================")
    print("RUNNING PLANT DISEASE DETECTION BACKEND TESTS")
    print("==========================================\n")

    # 1. Ping Health Check
    res = client.get("/ping")
    assert res.status_code == 200, f"Ping failed: {res.text}"
    print("[OK] [1/6] GET /ping successful:", res.json())

    # 2. Prediction Endpoint with Severity, Weather Advisory, Deficiency Check & DB Escalation
    image_bytes = create_synthetic_leaf_image()
    files = {"file": ("test_leaf.jpg", image_bytes, "image/jpeg")}
    data = {"lat": 37.77, "lon": -122.41, "user_id": "test_farmer_123"}

    res = client.post("/predict/model2", files=files, data=data)
    print("Prediction status:", res.status_code)
    assert res.status_code == 200, f"Prediction failed: {res.text}"
    pred_data = res.json()
    print("[OK] [2/6] POST /predict/model2 response:")
    print("   - Diagnosis:", pred_data.get("class"))
    print("   - Confidence:", pred_data.get("confidence"))
    print("   - Severity %:", pred_data.get("severity_percent"))
    print("   - Nutrient Deficiency:", pred_data.get("nutrient_deficiency"))
    print("   - Weather Spray Advisory:", pred_data.get("spray_advisory"))
    print("   - Escalated Needs Review:", pred_data.get("needs_review"))
    print("   - Detection ID:", pred_data.get("detection_id"))

    assert "severity_percent" in pred_data, "Missing severity_percent"
    assert "nutrient_deficiency" in pred_data, "Missing nutrient_deficiency"
    assert "spray_advisory" in pred_data, "Missing spray_advisory"
    assert "needs_review" in pred_data, "Missing needs_review"

    # 3. Outbreak Heatmap Endpoint
    res = client.get("/outbreaks")
    assert res.status_code == 200, f"GET /outbreaks failed: {res.text}"
    outbreaks = res.json()
    print("\n[OK] [3/6] GET /outbreaks heatmap layer response:")
    print("   Found aggregated location clusters:", outbreaks)
    assert len(outbreaks) > 0, "Expected at least 1 outbreak cluster"

    # 4. Economic Threshold Calculator Endpoint
    econ_payload = {
        "crop_type": "Potato",
        "growth_stage": "fruiting",
        "disease_class": "Potato___early_blight",
        "severity_percent": 25.0,
        "treatment_cost_per_acre": 40.0,
        "expected_market_price_per_unit": 2.5,
        "expected_yield_per_acre": 800.0
    }
    res = client.post("/economic-threshold", json=econ_payload)
    assert res.status_code == 200, f"POST /economic-threshold failed: {res.text}"
    econ_res = res.json()
    print("\n[OK] [4/6] POST /economic-threshold response:")
    print("   - Recommendation:", econ_res.get("recommendation"))
    print("   - Est. Yield Loss %:", econ_res.get("estimated_yield_loss_percent"))
    print("   - Net Benefit per Acre ($):", econ_res.get("net_benefit_per_acre"))
    print("   - Rationale:", econ_res.get("rationale"))
    assert "recommendation" in econ_res, "Missing recommendation in response"

    # 5. Expert Escalation Admin Review Endpoint
    res = client.get("/admin/reviews")
    assert res.status_code == 200, f"GET /admin/reviews failed: {res.text}"
    reviews = res.json()
    print("\n[OK] [5/6] GET /admin/reviews response:")
    print(f"   Total flagged reviews: {len(reviews)}")

    # Update review status
    if reviews:
        target_id = reviews[0]["id"]
        patch_res = client.patch(f"/admin/reviews/{target_id}?status=reviewed")
        assert patch_res.status_code == 200
        print(f"[OK] Updated review status for detection ID {target_id}: {patch_res.json()}")

    print("\n==========================================")
    print("ALL 6 BACKEND FEATURES TESTED SUCCESSFULLY!")
    print("==========================================\n")


if __name__ == "__main__":
    run_all_tests()
