import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import TensorFlow
import tensorflow as tf

from config import MODEL_PATHS
from services.severity import estimate_leaf_severity
from services.deficiency import differentiate_nutrient_deficiency

def run_diagnostic_check():
    print("TensorFlow version:", tf.__version__)
    print("Loading models from paths:")
    for key, path in MODEL_PATHS.items():
        print(f" - {key}: {path} (exists: {os.path.exists(path) if path else False})")

    # Create a synthetic image representing a leaf (mostly green with some yellow/brown spots)
    # Dimension 224x224
    img_np = np.zeros((224, 224, 3), dtype=np.uint8)
    # Set background/leaf pixels to green (Hue 60 approx in HSV)
    # BGR green: (0, 150, 0)
    img_np[:, :] = [0, 150, 0]
    
    # Let's add some necrotic brown/yellow spots (lesions)
    img_np[50:80, 50:80] = [30, 80, 120]  # Brown spot
    img_np[120:150, 120:150] = [0, 200, 200]  # Yellow chlorosis spot

    # Convert to PIL Image
    pil_img = Image.fromarray(img_np, "RGB")
    
    # 1. Test Severity estimation service
    severity = estimate_leaf_severity(pil_img)
    print(f"\n--- OpenCV Severity Analysis ---")
    print(f"Calculated Leaf Severity: {severity}%")

    # 2. Test Nutrient Deficiency differentiator service
    deficiency = differentiate_nutrient_deficiency(pil_img, disease_confidence=0.65)
    print(f"\n--- Heuristic Deficiency Check ---")
    print(f"Deficiency Suspected: {deficiency['is_deficiency_suspected']}")
    print(f"Suspected Type: {deficiency['suspected_deficiency']}")
    print(f"Confidence: {deficiency['deficiency_confidence']}")
    print(f"Explanation: {deficiency['explanation']}")

    # 3. Test TensorFlow model loads and runs prediction
    for model_id in ["model1", "model2", "model3", "model4"]:
        path = MODEL_PATHS[model_id]
        if path and os.path.exists(path):
            try:
                print(f"\n--- Testing TensorFlow Inference for {model_id} ---")
                model = tf.keras.models.load_model(path)
                print(f"Successfully loaded {model_id}.")
                
                # Preprocess
                resized_img = pil_img.resize((224, 224))
                img_array = np.array(resized_img) / 255.0
                img_batch = np.expand_dims(img_array, axis=0)
                
                # Predict
                preds = model.predict(img_batch)
                pred_idx = np.argmax(preds[0])
                confidence = preds[0][pred_idx]
                print(f"Prediction index: {pred_idx}, Confidence: {confidence:.4f}")
            except Exception as e:
                print(f"Error during inference on {model_id}: {e}")
        else:
            print(f"\n[Warning] {model_id} model file not found. Skipping TF check.")

if __name__ == "__main__":
    run_diagnostic_check()
