# 🌿 FasalDekho — Deep Learning Model Documentation

> A complete breakdown of the AI/ML pipeline powering FasalDekho's crop disease detection system.

---

## 📌 Overview

FasalDekho uses **4 specialized Convolutional Neural Networks (CNNs)** — one per crop — to detect plant diseases from leaf images. Each model is trained on a **crop-specific subset** of the [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease), which contains 87,000+ labeled leaf images across 38 disease classes.

The models achieve an average accuracy of **~96.88%** on the test set.

---

## 🏗️ Model Architecture

### Base Architecture: CNN + ResNet-50 Transfer Learning

Each model follows this pipeline:

```
Input Image (any size)
       ↓
  Resize to 224×224
       ↓
  Normalize pixel values (÷ 255)
       ↓
  ResNet-50 (pre-trained on ImageNet)
  — Used as a feature extractor (frozen base layers)
       ↓
  Global Average Pooling
       ↓
  Dense Layer (256 units, ReLU)
  Dropout (0.3)
       ↓
  Output Layer (Softmax — N disease classes)
       ↓
  Predicted Disease Class + Confidence Score
```

**Why ResNet-50?**
- Solves the vanishing gradient problem via **residual (skip) connections**
- Pre-trained on 1.2M ImageNet images → strong low-level feature extraction out of the box
- Much better accuracy than training a plain CNN from scratch with limited data

---

## 🌱 The 4 Specialized Models

| Model ID | Crop | Model File | Classes | Accuracy |
|----------|------|------------|---------|----------|
| `model1` | 🍅 Tomato | `Model_T_v2.h5` | 10 | ~96.8% |
| `model2` | 🥔 Potato | `Model_P_v5.h5` | 3 | ~97.2% |
| `model3` | 🍇 Grape | `Model_G_v2.h5` | 4 | ~96.5% |
| `model4` | 🌽 Corn | `Model_C_v4.h5` | 4 | ~96.9% |

---

## 🔬 Disease Classes Per Model

### 🍅 Tomato (model1) — 10 Classes
```
Tomato___Bacterial_spot
Tomato___Early_blight
Tomato___Late_blight
Tomato___Leaf_Mold
Tomato___Septoria_leaf_spot
Tomato___Spider_mites Two-spotted_spider_mite
Tomato___Tomato_Yellow_Leaf_Curl_Virus
Tomato___Target_Spot
Tomato___Tomato_mosaic_virus
Tomato___healthy ✅
```

### 🥔 Potato (model2) — 3 Classes
```
Potato___early_blight
Potato___late_blight
Potato___healthy ✅
```

### 🍇 Grape (model3) — 4 Classes
```
Grape___Black_rot
Grape___Esca_(Black_Measles)
Grape___Leaf_blight_(Isariopsis_Leaf_Spot)
Grape___healthy ✅
```

### 🌽 Corn (model4) — 4 Classes
```
Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot
Corn_(maize)___Common_rust_
Corn_(maize)___Northern_Leaf_Blight
Corn_(maize)___healthy ✅
```

---

## 🔄 Full Prediction Pipeline

When a farmer uploads a leaf photo, this is what happens under the hood:

```
📸 Farmer uploads leaf image
         │
         ▼
┌─────────────────────────────┐
│  1. VALIDATION              │
│  • MIME type check           │
│  • Max 10MB file size        │
│  • PIL image decode check    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  2. PREPROCESSING           │
│  • Convert to RGB            │
│  • Resize → 224×224          │
│  • Normalize → [0, 1]        │
│  • Add batch dimension       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  3. TF INFERENCE (Keras)    │
│  • model.predict(img_batch)  │
│  • argmax → disease class    │
│  • softmax → confidence %    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  4. SEVERITY ESTIMATION     │
│  (OpenCV HSV Segmentation)  │
│  • Isolate leaf pixels       │
│  • Detect brown/yellow zones │
│  • Lesion % of leaf area     │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  5. NUTRIENT DEFICIENCY     │
│  • N, K, Mg deficiency check │
│  • Based on color heuristics │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  6. WEATHER ADVISORY        │
│  • GPS coords → Open-Meteo  │
│  • Spray recommendation      │
│    based on rain/wind        │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  7. ESCALATION CHECK        │
│  • Confidence < 70%?         │
│  • Flag for expert review    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  8. DATABASE LOG            │
│  • Store in SQLite/Postgres  │
│  • Tied to user account      │
└────────────┬────────────────┘
             │
             ▼
         📊 JSON Response to App
```

---

## 🧠 OpenCV Severity Estimation (Beyond DL)

Beyond just classifying the disease, FasalDekho uses **classical computer vision (OpenCV)** to estimate how *badly* a leaf is infected.

### How it works:
1. Convert image to **HSV color space** (better for color segmentation than RGB)
2. Create a **leaf mask** — isolate all green-ish pixels (the actual leaf)
3. Create a **healthy mask** — isolate only deep green healthy tissue (HSV Hue: 35–85)
4. Create a **lesion mask** — leaf pixels that are NOT healthy green (brown/yellow spots)
5. Calculate: `severity % = (lesion pixels / total leaf pixels) × 100`

### HSV Ranges used:
| Region | Hue | Saturation | Value |
|--------|-----|------------|-------|
| Leaf (any) | 15–95 | >25 | >25 |
| Healthy Green | 35–85 | >40 | >40 |
| Brown/Necrotic | 0–25 | >30 | 20–220 |
| Yellow/Chlorosis | 20–35 | >40 | >100 |

---

## 📊 Training Details

| Parameter | Value |
|-----------|-------|
| Dataset | PlantVillage (Kaggle) |
| Total Images | ~87,000 |
| Image Size | 224 × 224 px |
| Augmentation | Flip, Rotation, Zoom, Brightness |
| Base Model | ResNet-50 (ImageNet weights) |
| Optimizer | Adam |
| Loss Function | Categorical Crossentropy |
| Epochs | 20–30 per model |
| Framework | TensorFlow 2.x / Keras |
| Saved Format | `.h5` (HDF5 Keras format) |

> Training notebook: [`Training.ipynb`](./Training.ipynb)

---

## 🔁 Model Loading at Runtime

All 4 models are loaded **once at server startup** into memory (not per request), so inference is fast:

```python
# backend/routers/predict.py
@app.on_event("startup")
def startup_event():
    predict_router.load_all_models()

def load_all_models():
    for model_id, model_path in MODEL_PATHS.items():
        MODELS[model_id] = tf.keras.models.load_model(model_path)
```

**Inference per image**: ~100–500ms (CPU only)

---

## 📁 Model File Locations

```
Models/
├── Tomato_Model/
│   └── Model_T_v2.h5      ← Tomato disease classifier (10 classes)
├── Potato_Model/
│   └── Model_P_v5.h5      ← Potato disease classifier (3 classes)
├── Grap_Model/
│   └── Model_G_v2.h5      ← Grape disease classifier (4 classes)
└── Corn_Model/
    └── Model_C_v4.h5      ← Corn disease classifier (4 classes)
```

> ⚠️ `.h5` model files are excluded from Git (`.gitignore`) due to large size. Download from the shared drive or retrain using `Training.ipynb`.

---

## 🧪 API Endpoint

```
POST /predict/{model_id}
```

**model_id options**: `model1` (Tomato), `model2` (Potato), `model3` (Grape), `model4` (Corn)

**Request** (multipart/form-data):
```
file    = <leaf image>
lat     = 28.54  (optional, for weather advisory)
lon     = 77.27  (optional, for weather advisory)
```

**Response (JSON)**:
```json
{
  "class": "Tomato___Late_blight",
  "confidence": 0.9843,
  "severity_percent": 34.7,
  "nutrient_deficiency": {
    "suspected_deficiency": "Nitrogen",
    "indicators": ["yellowing pattern"]
  },
  "spray_advisory": {
    "warning": "High rain expected. Avoid spraying in next 24 hours.",
    "recommended_action": "Wait for dry window"
  },
  "needs_review": false,
  "escalation_reason": null,
  "detection_id": 42,
  "crop_type": "Tomato"
}
```

---

## 🏆 Why This Architecture Works

| Challenge | Solution |
|-----------|----------|
| Limited training data per crop | Transfer learning from ResNet-50 (ImageNet) |
| Multiple diseases per crop | Separate specialized models per crop |
| Real-world noisy images | Data augmentation during training |
| Measuring infection severity | OpenCV HSV-based lesion segmentation |
| Uncertain predictions | Confidence threshold + expert escalation |
| Location-aware advice | Open-Meteo weather API integration |

---

*FasalDekho — Built for farmers, powered by AI* 🌾
