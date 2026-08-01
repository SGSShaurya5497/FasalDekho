"""
Severity and Spread Estimation Service.

Uses OpenCV color-thresholding (HSV space) and contour analysis on leaf images
to estimate the percentage of leaf surface area affected by discoloration or lesions.
"""
import cv2
import numpy as np
from PIL import Image


def estimate_leaf_severity(image: Image.Image) -> float:
    """
    Estimates the percentage of leaf area affected by discoloration/lesions.

    Args:
        image (PIL.Image.Image): Uploaded plant leaf image.

    Returns:
        float: Percentage of affected leaf area (0.0 to 100.0).
    """
    # Convert PIL Image to OpenCV BGR format
    img_np = np.array(image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    # Convert to HSV color space for color-based segmentation
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    # 1. Isolate the Leaf (Plant background separation)
    # Plant leaves generally cover green to yellow HSV ranges (Hue 15 to 90)
    # Saturation > 25, Value > 25 to filter out dark background/shadows
    lower_leaf = np.array([15, 25, 25])
    upper_leaf = np.array([95, 255, 255])
    leaf_mask = cv2.inRange(hsv, lower_leaf, upper_leaf)

    # Clean mask using morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    leaf_mask = cv2.morphologyEx(leaf_mask, cv2.MORPH_CLOSE, kernel)
    leaf_mask = cv2.morphologyEx(leaf_mask, cv2.MORPH_OPEN, kernel)

    # Total leaf pixel count
    total_leaf_pixels = cv2.countNonZero(leaf_mask)

    if total_leaf_pixels == 0:
        # Fallback: if color masking didn't isolate leaf, use non-white/non-black pixel count
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        _, leaf_mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        total_leaf_pixels = cv2.countNonZero(leaf_mask)

    if total_leaf_pixels == 0:
        return 0.0

    # 2. Isolate Healthy Green Tissue
    # Healthy green foliage has Hue between 35 and 85, with sufficient saturation
    lower_healthy = np.array([35, 40, 40])
    upper_healthy = np.array([85, 255, 255])
    healthy_mask = cv2.inRange(hsv, lower_healthy, upper_healthy)
    healthy_mask = cv2.bitwise_and(healthy_mask, leaf_mask)

    # 3. Detect Discolored / Lesion Areas
    # Discolored areas within leaf = Leaf pixels that are NOT healthy green
    # (includes necrotic brown/black spots, chlorosis yellowing, rust, blight)
    lesion_mask = cv2.bitwise_and(leaf_mask, cv2.bitwise_not(healthy_mask))

    # Refine lesion mask for actual necrotic/brown/yellow spots
    # Necrotic/brown: Hue 0-20 or 160-180; Yellow chlorosis: Hue 20-35
    lower_brown = np.array([0, 30, 20])
    upper_brown = np.array([25, 255, 220])
    brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)

    lower_yellow = np.array([20, 40, 100])
    upper_yellow = np.array([35, 255, 255])
    yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)

    specific_lesion_mask = cv2.bitwise_or(brown_mask, yellow_mask)
    specific_lesion_mask = cv2.bitwise_and(specific_lesion_mask, leaf_mask)

    # Combine general non-healthy and specific lesion masks
    combined_lesion_mask = cv2.bitwise_or(lesion_mask, specific_lesion_mask)
    lesion_pixels = cv2.countNonZero(combined_lesion_mask)

    severity_percent = (lesion_pixels / float(total_leaf_pixels)) * 100.0
    return float(round(min(severity_percent, 100.0), 2))
