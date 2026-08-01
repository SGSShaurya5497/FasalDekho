"""
Authentication Router & User Management.
Provides endpoints for Signup, Login, Token Refresh, Logout, and Current User Profile.
Supports HTTP-Only cookies (`access_token`, `refresh_token`) and Bearer headers.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict
from typing import Optional
from database import get_db
from models import User
from security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from logging_config import backend_logger

router = APIRouter(prefix="/auth", tags=["Authentication & User Management"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# --- Pydantic Schemas ---
class UserSignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Auth Helper Dependencies ---
def get_token_from_request(request: Request, bearer_token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Extracts access token from HTTP-only cookie or Authorization header."""
    if bearer_token:
        return bearer_token
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    return None


def get_current_user(token: Optional[str] = Depends(get_token_from_request), db: Session = Depends(get_db)) -> User:
    """Dependency verifying access token and returning current active User object."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise credentials_exception

    return user


def get_optional_user(token: Optional[str] = Depends(get_token_from_request), db: Session = Depends(get_db)) -> Optional[User]:
    """Optional dependency returning User if authenticated, or None if unauthenticated."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload and payload.get("type") == "access":
            user_id = payload.get("sub")
            if user_id:
                return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        pass
    return None


# --- Endpoints ---
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignupRequest, response: Response, db: Session = Depends(get_db)):
    """Registers a new user account and returns JWT tokens."""
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        backend_logger.warning("Signup attempt failed - email already registered", extra={"email": payload.email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    refresh_token = create_refresh_token({"sub": str(new_user.id)})

    # Set HTTP-Only cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    backend_logger.info("User registered successfully", extra={"user_id": new_user.id, "email": new_user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticates user with email & password, returning JWT access & refresh tokens."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        backend_logger.warning("Failed login attempt", extra={"email": payload.email})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Set HTTP-Only cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")

    backend_logger.info("User logged in successfully", extra={"user_id": user.id, "email": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Issues new access token using a valid refresh token."""
    raw_refresh = request.cookies.get("refresh_token")
    if not raw_refresh:
        # Fallback to Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_refresh = auth_header.split(" ")[1]

    if not raw_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing.")

    payload = decode_token(raw_refresh)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")

    new_access_token = create_access_token({"sub": str(user.id), "email": user.email})
    response.set_cookie(key="access_token", value=new_access_token, httponly=True, samesite="lax")

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response):
    """Logs out user by clearing HTTP-Only access and refresh token cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile information for the currently authenticated user."""
    return current_user
