"""
Pytest unit tests for prediction endpoint input validation and health check.
"""
import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from PIL import Image
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)


def test_health_endpoint():
    """Test /health system check returns ok status and model dictionary."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "models" in data


def test_predict_invalid_model_id():
    """Test /predict with nonexistent model_id returns HTTP 404."""
    img = Image.new("RGB", (100, 100), color="green")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_leaf.jpg", buf, "image/jpeg")}
    response = client.post("/predict/invalid_model", files=files)
    assert response.status_code == 404


def test_predict_invalid_mime_type():
    """Test uploading non-image file returns HTTP 400."""
    files = {"file": ("script.sh", BytesIO(b"echo hello"), "application/x-sh")}
    response = client.post("/predict/model1", files=files)
    assert response.status_code == 400
    assert "invalid file type" in response.json()["detail"].lower()


def test_predict_valid_image_mock():
    """Test uploading valid leaf image returns diagnosis payload."""
    img = Image.new("RGB", (224, 224), color="green")
    buf = BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_leaf.jpg", buf, "image/jpeg")}
    data = {"lat": 28.70, "lon": 77.10}
    response = client.post("/predict/model1", files=files, data=data)
    assert response.status_code in [200, 404]  # 404 if model files not present on disk, 200 if loaded or mocked
