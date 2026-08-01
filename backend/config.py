import os
from dotenv import load_dotenv

load_dotenv()

# Base directory of the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def resolve_path(env_path: str) -> str:
    """Helper to resolve relative paths relative to backend directory or workspace root."""
    if not env_path:
        return ""
    if os.path.isabs(env_path):
        return env_path
    
    # Try relative to backend dir
    path_from_backend = os.path.abspath(os.path.join(BASE_DIR, env_path))
    if os.path.exists(path_from_backend):
        return path_from_backend
    
    # Try relative to parent of backend (workspace root)
    path_from_root = os.path.abspath(os.path.join(BASE_DIR, "..", env_path))
    if os.path.exists(path_from_root):
        return path_from_root
        
    return path_from_backend

# Application Metadata
APP_NAME = os.getenv("APP_NAME", "AgriShield AI API")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# JWT Authentication Config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "agrishield-agri-tech-secret-key-production-2026-secure")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# File Upload & Rate Limiting Controls
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
PREDICT_RATE_LIMIT = os.getenv("PREDICT_RATE_LIMIT", "15/minute")

# Model paths
MODEL_PATHS = {
    "plant_classifier": resolve_path(os.getenv("MODEL_PATH_PLANT_CLASSIFIER", "")),
    "model1": resolve_path(os.getenv("TOMATO_MODEL", "../Models/Tomato_Model/Model_T_v2.h5")),
    "model2": resolve_path(os.getenv("POTATO_MODEL", "../Models/Potato_Model/Model_P_v5.h5")),
    "model3": resolve_path(os.getenv("GRAPE_MODEL", "../Models/Grap_Model/Model_G_v2.h5")),
    "model4": resolve_path(os.getenv("CORN_MODEL", "../Models/Corn_Model/Model_C_v4.h5")),
}

# Confidence threshold for expert escalation (default 70%)
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.70"))

# Database configuration (Postgres default, falls back to local SQLite)
DEFAULT_DB_URL = f"sqlite:///{os.path.join(BASE_DIR, 'plant_disease.db')}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
