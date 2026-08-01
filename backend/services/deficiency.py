"""
Nutrient Deficiency Differentiator Service.

Provides secondary pattern analysis (color distribution and spatial heuristics)
to differentiate common crop nutrient deficiencies (Nitrogen, Potassium, Magnesium)
from infectious fungal/bacterial/viral disease symptoms.
"""
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Optional


def differentiate_nutrient_deficiency(image: Image.Image, disease_confidence: float) -> Dict[str, Any]:
    """
    Analyzes an image for visual signatures of Nitrogen (N), Potassium (K), and Magnesium (Mg) deficiencies.

    Args:
        image (PIL.Image.Image): Uploaded plant leaf image.
        disease_confidence (float): Confidence level from the primary CNN disease classifier.

    Returns:
        Dict[str, Any]: Dictionary containing deficiency suspicion status, type, confidence score, and explanation.
    """
    img_np = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Segment Leaf
    lower_leaf = np.array([15, 25, 25])
    upper_leaf = np.array([95, 255, 255])
    leaf_mask = cv2.inRange(hsv, lower_leaf, upper_leaf)
    leaf_area = cv2.countNonZero(leaf_mask)

    if leaf_area == 0:
        return {
            "is_deficiency_suspected": False,
            "suspected_deficiency": None,
            "deficiency_confidence": 0.0,
            "explanation": "Unable to segment leaf for nutrient deficiency analysis."
        }

    # 1. Nitrogen (N) Deficiency Test: Uniform Pale Yellowing / Chlorosis
    # HSV Hue 22-38 (yellow-green), high brightness
    n_mask = cv2.inRange(hsv, np.array([20, 30, 120]), np.array([38, 180, 255]))
    n_pixels = cv2.countNonZero(cv2.bitwise_and(n_mask, leaf_mask))
    n_ratio = n_pixels / float(leaf_area)

    # 2. Potassium (K) Deficiency Test: Marginal Leaf Margin Scorching / Browning
    # Brown necrotic spots: Hue 0-22
    k_brown_mask = cv2.inRange(hsv, np.array([0, 40, 30]), np.array([22, 255, 200]))
    k_brown_mask = cv2.bitwise_and(k_brown_mask, leaf_mask)
    
    # Distance from leaf margin using distance transform
    contours, _ = cv2.findContours(leaf_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    margin_k_ratio = 0.0
    if contours:
        c = max(contours, key=cv2.contourArea)
        dist_transform = cv2.distanceTransform(leaf_mask, cv2.DIST_L2, 5)
        # Margin region = inner pixels close to boundary (distance < max_dist * 0.3)
        max_dist = np.max(dist_transform)
        if max_dist > 0:
            margin_mask = (dist_transform > 0) & (dist_transform < max_dist * 0.35)
            margin_mask = margin_mask.astype(np.uint8) * 255
            margin_brown_pixels = cv2.countNonZero(cv2.bitwise_and(k_brown_mask, margin_mask))
            total_brown_pixels = cv2.countNonZero(k_brown_mask)
            if total_brown_pixels > 0:
                margin_k_ratio = margin_brown_pixels / float(total_brown_pixels)

    # 3. Magnesium (Mg) Deficiency Test: Interveinal Chlorosis (High local variance between veins & tissue)
    laplacian_var = cv2.Laplacian(cv2.bitwise_and(gray, gray, mask=leaf_mask), cv2.CV_64F).var()

    # Rule-Based Decision Logic
    suspected_type: Optional[str] = None
    deficiency_score = 0.0
    explanation = "No strong nutrient deficiency patterns detected."

    if n_ratio > 0.45 and disease_confidence < 0.85:
        suspected_type = "Nitrogen Deficiency (N)"
        deficiency_score = float(round(min(n_ratio * 1.1, 0.95), 2))
        explanation = f"High uniform leaf chlorosis detected ({round(n_ratio*100, 1)}% yellow-green area). Visual pattern aligns with Nitrogen deficiency."

    elif margin_k_ratio > 0.60 and cv2.countNonZero(k_brown_mask) > (leaf_area * 0.05) and disease_confidence < 0.85:
        suspected_type = "Potassium Deficiency (K)"
        deficiency_score = float(round(min(margin_k_ratio * 0.9, 0.92), 2))
        explanation = f"Browning is heavily concentrated along leaf margins ({round(margin_k_ratio*100, 1)}% marginal concentration). Aligns with Potassium edge-scorching."

    elif n_ratio > 0.25 and laplacian_var > 400 and disease_confidence < 0.75:
        suspected_type = "Magnesium Deficiency (Mg)"
        deficiency_score = float(round(min(n_ratio * 1.2, 0.88), 2))
        explanation = "Interveinal chlorosis pattern observed with high contrast between green leaf veins and yellow tissue."

    # Secondary check: If disease confidence is very low (< 0.70) and any deficiency score was found
    is_suspected = (suspected_type is not None) and (disease_confidence < 0.75 or deficiency_score > 0.70)

    return {
        "is_deficiency_suspected": is_suspected,
        "suspected_deficiency": suspected_type,
        "deficiency_confidence": deficiency_score if is_suspected else 0.0,
        "explanation": explanation if is_suspected else "Primary diagnosis is disease-driven."
    }
