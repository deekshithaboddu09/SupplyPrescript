from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60


def get_jwt_secret():
    """Read the JWT secret from the environment."""
    secret = os.getenv("SUPPLYPRESCRIPT_JWT_SECRET")

    if not secret:
        raise RuntimeError(
            "SUPPLYPRESCRIPT_JWT_SECRET is not configured."
        )

    return secret


def hash_password(password: str) -> str:
    """Securely hash a password."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its stored hash."""
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int, role: str) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }

    return jwt.encode(
        payload,
        get_jwt_secret(),
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    """Verify and decode a JWT access token."""
    return jwt.decode(
        token,
        get_jwt_secret(),
        algorithms=[JWT_ALGORITHM],
    )
