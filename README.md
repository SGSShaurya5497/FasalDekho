# 🌿 FasalDekho AI: Plant Disease Detection & Crop Advisory SaaS

FasalDekho AI is a state-of-the-art, production-ready SaaS application designed to help farmers, agronomists, and crop-consulting professionals diagnose plant diseases, estimate infection severity, identify nutrient deficiencies, and receive weather-linked spray recommendations in real time.

---

## 1. Project Overview & Problem Statement

### The Problem
Farming communities worldwide face severe crop yield losses (averaging 20% to 40% annually) due to pathogens, insect pests, and nutrient deficiencies. Early-stage detection is critical, but access to professional agronomists is often slow, expensive, or entirely unavailable in remote agricultural areas. Furthermore, farmers frequently struggle to decide:
*   **Is the leaf damage infectious (fungal, bacterial, viral) or simply a nutritional deficiency (nitrogen, potassium, magnesium)?**
*   **How severely is the leaf affected, and is it economically viable to purchase and apply pesticides (economic treatment threshold)?**
*   **Is the current localized weather safe for spraying treatments, or will wind and rain wash the inputs away, wasting capital and harming the environment?**

### The Solution
FasalDekho AI addresses these questions with an integrated platform:
1.  **AI Diagnostics:** Classifies diseases across major crops (Tomato, Potato, Grape, Corn) with high precision.
2.  **Computer Vision Severity Analysis:** Isolates leaf boundaries and quantifies the exact percentage of affected surface area.
3.  **Nutrient Deficiency Filtering:** Separates low-confidence infectious disease detections from nutritional markers using spatial edge-scoring and color heuristics.
4.  **Economic Threshold Calculator:** Determines whether treatment is financially justified based on local crop prices, treatment costs, and expected yields.
5.  **Weather-Linked Action Plan:** Automatically fetches localized meteorology to deliver optimal spray window advisories.

---

## 2. Feature List

*   **🔒 JWT Authentication:** Fully secure user registration, token-based login, and HTTP-Only cookie storage. All crop logs and financial calculations are securely bound to individual user profiles.
*   **⚡ High-Speed TensorFlow Inference:** Uses specialized convolutional networks trained on agricultural datasets to identify plant diseases in milliseconds.
*   **🎨 Dynamic OpenCV Image Processing:** Runs concurrent color-segmentation in HSV space to extract leaves, count necrotic lesion pixels, and calculate exact percentage severity.
*   **🍂 Heuristic Nutrient deficiency Check:** Flags Nitrogen (N), Potassium (K), and Magnesium (Mg) deficiencies using color density and distance transform border detection.
*   **🌤️ Open-Meteo API Weather Integration:** Real-time localized telemetry checks wind speed, precipitation, and temperature to calculate spray advisories.
*   **📊 Economic Treatment Calculator:** Formulates a localized treatment analysis showing net protection benefits in Indian Rupees (₹) per acre.
*   **📝 Automated Expert Escalation:** Instantly flags low-confidence predictions ($<70\%$ confidence) for automated queuing and human expert reviews.
*   **🐳 Multi-Stage Docker Containerization:** Complete multi-stage build configuration orchestrating React, FastAPI, PostgreSQL, and Nginx reverse proxy.

---

## 3. Tech Stack & Architecture

### Tech Stack
*   **Frontend:** React 18, Tailwind CSS, Framer Motion (premium light-mode agri-tech theme), Lucide Icons, React Router.
*   **Backend:** FastAPI (Python 3.10), Uvicorn, SQLAlchemy ORM, SlowAPI (rate-limiting), Pydantic v2 (input validation).
*   **Database:** PostgreSQL (with indexed location and timestamp querying).
*   **Machine Learning / CV:** TensorFlow 2.x, OpenCV (headless), NumPy, Pillow.
*   **Deployment/Infra:** Docker, Docker Compose, Nginx (reverse proxy, SSL termination, static file serving).

### System Architecture & Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as User/Farmer
    participant Web as React Frontend
    participant Nginx as Nginx Reverse Proxy
    participant API as FastAPI Backend
    participant DB as PostgreSQL Database
    participant WeatherAPI as Open-Meteo External API

    Farmer->>Web: Upload leaf photo & select crop type
    Web->>Nginx: POST /predict/{model_id} (includes Lat/Lon & JWT Cookie)
    Nginx->>API: Forward prediction request
    API->>API: Validate file size (<10MB) & MIME type (JPEG/PNG/WEBP)
    API->>API: Run TensorFlow Classify (Predict disease class + confidence)
    API->>API: Run OpenCV Severity (Segment leaf, count lesion pixels)
    API->>API: Run Nutrient Deficiency Check (Spatial & HSV heuristics)
    API->>WeatherAPI: GET /v1/forecast (Fetch precipitation & wind speed)
    WeatherAPI-->>API: Return local weather data
    API->>API: Run Spray Suitability Formula & Escalation Rule
    API->>DB: INSERT into detections (User ID, crop details, telemetry)
    DB-->>API: Return recorded DB entry ID
    API-->>Nginx: Return integrated JSON payload
    Nginx-->>Web: Forward payload to client
    Web->>Farmer: Render animated results card, advisory alert, and cost summary
```
---

## 3.1 Dependencies

### Backend (Python — `requirements.txt`)
| Package | Purpose |
|---|---|
| `fastapi` | Core backend web framework |
| `uvicorn` | ASGI server to run FastAPI |
| `tensorflow` | CNN model loading & inference |
| `opencv-python-headless` | Severity estimation & deficiency image analysis (HSV segmentation, distance transform, Laplacian variance) |
| `numpy` | Numerical/array operations for image processing |
| `pillow` | Image loading/preprocessing |
| `sqlalchemy` | ORM for PostgreSQL (users, detections, outbreak data) |
| `psycopg2-binary` | PostgreSQL driver |
| `pydantic` (v2) | Request/response schema validation |
| `python-jose` / `pyjwt` | JWT token creation & verification |
| `passlib[bcrypt]` | Password hashing |
| `slowapi` | Rate limiting on prediction endpoint |
| `httpx` | Async HTTP calls to Open-Meteo weather API |
| `python-dotenv` | Environment variable management |
| `python-multipart` | Handling multipart form-data (image uploads) |

### Frontend (Node — `package.json`)
| Package | Purpose |
|---|---|
| `react` / `react-dom` | Core UI framework |
| `react-router-dom` | Client-side routing |
| `tailwindcss` | Styling |
| `framer-motion` | Animations and transitions |
| `lucide-react` | Icon set |
| `axios` | API requests to backend |
| `leaflet` / `react-leaflet` | Outbreak heatmap map rendering |

### Mobile (Android — Capacitor)
| Package | Purpose |
|---|---|
| `@capacitor/core` | Core native bridge |
| `@capacitor/cli` | Build/scaffolding tooling |
| `@capacitor/android` | Android platform wrapper |
| `@capacitor/camera` | Native camera access for leaf photo capture |
| `@capacitor/geolocation` | Native geolocation for weather advisory & outbreak data |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker / Docker Compose | Containerized multi-service orchestration |
| Nginx | Reverse proxy, SSL termination, static file serving |
| PostgreSQL | Production database |

---
---

## 4. Setup & Installation Instructions

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL
*   Docker & Docker Compose

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/AmazingMoaaz/Plant-Disease-Detection.git
cd "Plant-Disease-Detection"
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```env
APP_NAME="FasalDekho AI"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fasaldekho"
JWT_SECRET_KEY="super_secret_cryptographic_key_here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Start the backend:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

---

### Docker Deployment Setup

Deploy the entire production stack (Nginx, React static container, FastAPI backend, and PostgreSQL) with a single command:

```bash
docker-compose up --build -d
```
*   **Web App URL:** `http://localhost:80`
*   **Backend API Docs:** `http://localhost:8000/docs`

---

## 5. API Reference

### 🔐 Authentication Endpoints
#### `POST /auth/signup`
Creates a new user.
*   **Request Schema:**
    ```json
    {
      "email": "user@farm.com",
      "password": "strongpassword123",
      "full_name": "Rajesh Kumar"
    }
    ```

#### `POST /auth/login`
Authenticates a user and issues tokens (JWT cookie set to `HttpOnly`).
*   **Response Schema:**
    ```json
    {
      "access_token": "eyJhbGciOi...",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "email": "user@farm.com",
        "full_name": "Rajesh Kumar"
      }
    }
    ```

### 🌿 Disease Diagnostics & Advisory
#### `POST /predict/{model_id}`
Uploads leaf image and returns diagnosis.
*   **Path Parameter:** `model_id` (`model1`: Tomato, `model2`: Potato, `model3`: Grape, `model4`: Corn)
*   **Form-Data Parameter:**
    *   `file`: Binary file (image)
    *   `lat`: Float (Latitude)
    *   `lon`: Float (Longitude)
*   **Response Schema:**
    ```json
    {
      "class": "Tomato___Late_blight",
      "confidence": 0.9452,
      "severity_percent": 18.25,
      "nutrient_deficiency": {
        "is_deficiency_suspected": false,
        "suspected_deficiency": null,
        "deficiency_confidence": 0.0,
        "explanation": "Primary diagnosis is disease-driven."
      },
      "spray_advisory": {
        "temperature": 24.5,
        "wind_speed": 12.4,
        "precipitation": 0.0,
        "is_suitable": true,
        "warning": null
      },
      "needs_review": false,
      "escalation_reason": "Confidence is above 70% threshold.",
      "detection_id": 42,
      "crop_type": "Tomato"
    }
    ```

---

## 6. Machine Learning

### 🧠 Base Classification Architecture
FasalDekho AI employs custom Convolutional Neural Networks (CNNs) built using `keras.Sequential`. The model inputs are standardized to $224 \times 224 \times 3$ RGB channels.

```
Input: (224, 224, 3) Image
  ├── Conv2D (64 filters, 7x7 kernel, stride 3, ReLU) ──> MaxPool2D (3x3)
  ├── Conv2D (128 filters, 3x3 kernel, padding 'same', ReLU) ──> MaxPool2D (2x2)
  ├── Conv2D (128 filters, 3x3 kernel, padding 'same', ReLU) ──> MaxPool2D (2x2)
  ├── Conv2D (256 filters, 3x3 kernel, padding 'same', ReLU) ──> MaxPool2D (2x2)
  ├── Conv2D (256 filters, 3x3 kernel, padding 'same', ReLU) ──> MaxPool2D (2x2)
  ├── Flatten
  ├── Dense (512 units, ReLU)
  ├── Dense (512 units, ReLU)
  └── Dense (N Classes, Softmax Output)
```

### 📊 Dataset & Preprocessing
*   **Dataset:** Preprocessed versions of the **PlantVillage** dataset.
*   **Splits:** 70% Training, 10% Validation, and 20% Testing.
*   **Preprocessing Pipeline:**
    1.  Image resizing to $224 \times 224$.
    2.  Pixel intensity normalization to the range $[0.0, 1.0]$ via $x_{norm} = \frac{x}{255.0}$.
    3.  Batched validation generation via `ImageDataGenerator`.

### 🔬 OpenCV Severity Estimation
The severity estimation pipeline calculates the percentage of affected leaf area by segmenting the leaf from the background and isolating the necrotic/discolored tissue:
1.  **Leaf Segmentation:** The image is converted to the **HSV** color space. A broad mask covering Hue values $15$ to $95$, Saturation $>25$, and Value $>25$ separates the leaf from dark backgrounds and shadows. Morphological closing and opening filter noise.
2.  **Healthy Green Tissue Isolation:** A green filter isolating Hues between $35$ and $85$, and Saturation $>40$ identifies healthy tissue.
3.  **Lesion / Discoloration Detection:** Discolored tissue is calculated as `leaf_mask & ~healthy_mask`. It is further combined with custom color range masks:
    *   *Brown/Necrotic:* Hue $[0, 25]$, Saturation $[30, 255]$, Value $[20, 220]$
    *   *Yellow/Chlorosis:* Hue $[20, 35]$, Saturation $[40, 255]$, Value $[100, 255]$
4.  **Severity Ratio:**
    $$\text{Severity \%} = \left(\frac{\text{Lesion Pixels}}{\text{Total Leaf Pixels}}\right) \times 100$$

### 🍂 Nutrient Deficiency Differentiator
To prevent misdiagnosing nutrient deficiencies as infectious plant diseases during periods of low confidence, the application runs a secondary heuristic analysis:
*   **Nitrogen (N) Deficiency:** Checks for uniform chlorosis. Identified when pale yellow-green pixels (Hue $20$–$38$, Saturation $30$–$180$, Value $120$–$255$) occupy $>45\%$ of the segmented leaf area.
*   **Potassium (K) Deficiency:** Checks for edge browning (marginal necrosis). Applies a **Distance Transform** on the leaf mask. Edge areas are identified where distance to boundary is $<35\%$ of the maximum leaf radius. If $>60\%$ of the brown necrotic pixels are in this margin, Potassium deficiency is flagged.
*   **Magnesium (Mg) Deficiency:** Checks for interveinal chlorosis. A **Laplacian variance** check is performed on the grayscale leaf image. High contrast variance ($>400$) combined with elevated yellow chlorosis points to Mg deficiency.

### 📈 Training Metrics
The model was trained for 100 epochs using the **Adam** optimizer and **Categorical Crossentropy** loss.
*   **Final Training Accuracy:** 95.91%
*   **Final Validation Accuracy:** 96.63%
*   **Final Test Accuracy:** 96.88%

### ⚠️ Known Limitations
*   **Controlled Environment Bias:** The models are trained on the PlantVillage dataset which features leaf specimens photographed under flat, controlled studio lighting against uniform backdrops. Performance may degrade on field photos containing complex background foliage, weed leaves, and direct sunlight glare.
*   **Leaf Edge Occlusions:** Extreme leaf curling or overlapping leaves can distort the OpenCV distance transform boundary checking for Potassium deficiency.

---

## 7. Contributing & License

### Contributing Guidelines
1.  Fork the Repository.
2.  Create a Feature Branch (`git checkout -b feature/AmazingNewFeature`).
3.  Commit changes with descriptive messages.
4.  Push to the branch (`git push origin feature/AmazingNewFeature`).
5.  Open a Pull Request.

### License
Distributed under the **MIT License**. See `LICENSE` for more information.
