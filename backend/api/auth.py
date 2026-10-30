
import hmac
import os
import sqlite3

from fastapi import APIRouter, HTTPException, status

from backend.database.db import get_connection
from backend.models.auth import UserRegister, UserLogin, AdminSetup
from backend.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["authentication"])


def add_audit_log(connection, actor_id, action, entity_type, entity_id, details):
    connection.execute(
        """
        INSERT INTO audit_logs
        (actor_user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?)
        """,
        (actor_id, action, entity_type, str(entity_id), details),
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegister):
    """Register a new user. All public registrations remain pending."""

    name = request.name.strip()
    email = request.email.strip().lower()

    if not name:
        raise HTTPException(status_code=422, detail="Name is required")

    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES (?, ?, ?, 'user', 'pending')
            """,
            (name, email, hash_password(request.password)),
        )

        user_id = cursor.lastrowid

        add_audit_log(
            connection,
            None,
            "USER_REGISTERED",
            "user",
            user_id,
            "New user registration submitted",
        )

        connection.commit()

        return {
            "message": "Registration submitted. Wait for Admin approval.",
            "user_id": user_id,
            "status": "pending",
        }

    except sqlite3.IntegrityError:
        connection.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )
    finally:
        connection.close()


@router.post("/login")
def login_user(request: UserLogin):
    """Authenticate an approved user or Admin."""

    email = request.email.strip().lower()

    connection = get_connection()

    try:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    finally:
        connection.close()

    if not user or not verify_password(
        request.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if user["status"] != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Account is {user['status']}. Contact Admin.",
        )

    token = create_access_token(user["id"], user["role"])

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "status": user["status"],
        },
    }


@router.post("/setup-admin", status_code=status.HTTP_201_CREATED)
def setup_admin(request: AdminSetup):
    """Create the first Admin account exactly once."""

    configured_token = os.getenv(
        "SUPPLYPRESCRIPT_ADMIN_SETUP_TOKEN"
    )

    if not configured_token or not hmac.compare_digest(
        request.setup_token, configured_token
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid Admin setup token",
        )

    name = request.name.strip()
    email = request.email.strip().lower()

    if not name or "@" not in email:
        raise HTTPException(
            status_code=422,
            detail="Enter a valid name and email",
        )

    connection = get_connection()

    try:
        # Prevent two simultaneous requests from creating first Admins.
        connection.execute("BEGIN IMMEDIATE")

        existing_admin = connection.execute(
            "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        ).fetchone()

        if existing_admin:
            connection.rollback()
            raise HTTPException(
                status_code=409,
                detail="Admin account has already been created",
            )

        cursor = connection.execute(
            """
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES (?, ?, ?, 'admin', 'approved')
            """,
            (name, email, hash_password(request.password)),
        )

        admin_id = cursor.lastrowid

        add_audit_log(
            connection,
            admin_id,
            "ADMIN_CREATED",
            "user",
            admin_id,
            "Initial Admin account created",
        )

        connection.commit()

        return {
            "message": "Initial Admin account created successfully",
            "user": {
                "id": admin_id,
                "name": name,
                "email": email,
                "role": "admin",
                "status": "approved",
            },
        }

    except sqlite3.IntegrityError:
        connection.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )
    finally:
        connection.close()
