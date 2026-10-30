
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from backend.api.dependencies import require_admin
from backend.database.db import get_connection

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


class ReviewRegistration(BaseModel):
    note: str | None = Field(default=None, max_length=500)


@router.get("/registrations/pending")
def get_pending_registrations():
    """List user registrations waiting for Admin review."""

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, name, email, created_at
            FROM users
            WHERE role = 'user' AND status = 'pending'
            ORDER BY created_at ASC
            """
        ).fetchall()

    return {
        "count": len(rows),
        "items": [dict(row) for row in rows],
    }


@router.post("/registrations/{user_id}/approve")
def approve_registration(
    user_id: int,
    current_admin=Depends(require_admin),
):
    """Approve a pending user registration."""

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE users
            SET status = 'approved',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = ?
            WHERE id = ? AND role = 'user' AND status = 'pending'
            """,
            (current_admin["id"], user_id),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Pending user registration not found",
            )

        connection.execute(
            """
            INSERT INTO audit_logs
            (actor_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_admin["id"],
                "USER_APPROVED",
                "user",
                str(user_id),
                "Admin approved user registration",
            ),
        )

    return {
        "message": "User registration approved",
        "user_id": user_id,
        "status": "approved",
    }


@router.post("/registrations/{user_id}/reject")
def reject_registration(
    user_id: int,
    request: ReviewRegistration,
    current_admin=Depends(require_admin),
):
    """Reject a pending user registration."""

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE users
            SET status = 'rejected',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = ?
            WHERE id = ? AND role = 'user' AND status = 'pending'
            """,
            (current_admin["id"], user_id),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Pending user registration not found",
            )

        connection.execute(
            """
            INSERT INTO audit_logs
            (actor_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_admin["id"],
                "USER_REJECTED",
                "user",
                str(user_id),
                request.note or "Admin rejected user registration",
            ),
        )

    return {
        "message": "User registration rejected",
        "user_id": user_id,
        "status": "rejected",
    }
