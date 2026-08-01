"""
Plant Disease Detection FastAPI Backend Application.

Production Entrypoint:
- JWT Authentication (/auth/signup, /auth/login, /auth/refresh, /auth/me)
- POST /predict/{model_id}: Disease classification, OpenCV severity, nutrient deficiency, weather advisory
- GET /outbreaks: Aggregated outbreak heatmap data layer
- POST /economic-threshold: Cost-benefit calculator
- GET /health: System health check (DB connectivity & model status)
- Structured JSON logging & slowapi rate limiting
"""
from fastapi import FastAPI, Request, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy import text
import time

from database import engine, Base, get_db
import routers.auth as auth_router
import routers.predict as predict_router
import routers.economic as economic_router
import routers.reviews as reviews_router
from config import APP_NAME, PREDICT_RATE_LIMIT
from logging_config import backend_logger

# Initialize database tables (User, Detection)
Base.metadata.create_all(bind=engine)

# Slowapi Rate Limiter initialization
limiter = Limiter(key_func=get_remote_address, default_limits=[PREDICT_RATE_LIMIT])

# Create FastAPI instance
app = FastAPI(
    title=APP_NAME,
    description="Production Plant Disease Detection API with JWT Authentication, PostgreSQL storage, OpenCV Severity Estimation, Weather Telemetry, and Health Checks.",
    version="2.1.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HTTP Request Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Exclude basic health/ping noise
    if request.url.path not in ["/ping", "/health"]:
        backend_logger.info(
            f"HTTP {request.method} {request.url.path} - {response.status_code}",
            extra={
                "event": "http_request",
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_ip": request.client.host if request.client else "unknown"
            }
        )
    return response


# Load TensorFlow models at startup
@app.on_event("startup")
def startup_event():
    backend_logger.info("Starting Plant Disease Detection API server...")
    predict_router.load_all_models()


# Health check endpoint
@app.get("/ping")
async def ping():
    return "Hello, I am alive"


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive system health check endpoint:
    Checks database connectivity and loaded TensorFlow models.
    """
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
        backend_logger.error(f"Health check DB error: {e}")

    model_status = {}
    for model_id in ["model1", "model2", "model3", "model4"]:
        model_status[model_id] = "loaded" if model_id in predict_router.MODELS else "not_loaded"

    overall_status = "healthy" if db_status == "ok" else "degraded"

    return {
        "status": overall_status,
        "app_name": APP_NAME,
        "database": db_status,
        "models": model_status,
        "timestamp": time.time()
    }


# Include routers
app.include_router(auth_router.router)
app.include_router(predict_router.router)
app.include_router(economic_router.router)
app.include_router(reviews_router.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
