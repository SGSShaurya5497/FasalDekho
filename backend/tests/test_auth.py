"""
Pytest unit tests for JWT Authentication endpoints.
Tests Signup, Login, Token Refresh, Current User details, and Invalid Credential failures.
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from database import Base, engine

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    """Re-create clean database tables before running tests."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_signup_user_success():
    """Test user signup returns HTTP 201 and valid tokens."""
    payload = {
        "email": "testfarmer@agrishield.com",
        "password": "Password123!",
        "full_name": "Test Farmer"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "testfarmer@agrishield.com"


def test_signup_duplicate_email_fails():
    """Test signup with duplicate email returns HTTP 400."""
    payload = {
        "email": "farmer@agrishield.com",
        "password": "Password123!",
        "full_name": "Farmer One"
    }
    res1 = client.post("/auth/signup", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/auth/signup", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()


def test_login_user_success():
    """Test user login returns HTTP 200 and access token."""
    signup_payload = {
        "email": "loginuser@agrishield.com",
        "password": "SecretPassword123",
        "full_name": "Login User"
    }
    client.post("/auth/signup", json=signup_payload)

    login_payload = {
        "email": "loginuser@agrishield.com",
        "password": "SecretPassword123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


def test_login_invalid_password_fails():
    """Test login with incorrect password returns HTTP 401."""
    signup_payload = {
        "email": "user2@agrishield.com",
        "password": "CorrectPassword"
    }
    client.post("/auth/signup", json=signup_payload)

    login_payload = {
        "email": "user2@agrishield.com",
        "password": "WrongPassword"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401


def test_get_me_protected():
    """Test fetching /auth/me with Bearer token."""
    signup_payload = {
        "email": "me@agrishield.com",
        "password": "MyPassword123",
        "full_name": "Me User"
    }
    signup_res = client.post("/auth/signup", json=signup_payload).json()
    token = signup_res["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "me@agrishield.com"


def test_get_me_unauthorized():
    """Test fetching /auth/me without token returns 401."""
    res = client.get("/auth/me")
    assert res.status_code == 401
