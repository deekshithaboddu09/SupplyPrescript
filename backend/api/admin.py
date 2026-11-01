
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
class ReviewDecision(BaseModel):
    note: str | None = Field(default=None, max_length=500)


@router.get("/decisions/pending")
def get_pending_decisions():
    """List decisions waiting for Admin approval."""

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                d.id,
                d.user_id,
                u.name AS user_name,
                u.email AS user_email,
                d.shipment_id,
                d.option_id,
                d.option_name,
                d.cost,
                d.delay_days,
                d.penalty,
                d.penalty_avoided,
                d.net_benefit,
                d.submitted_at,
                d.status
            FROM decisions d
            JOIN users u ON d.user_id = u.id
            WHERE d.status = 'pending'
            ORDER BY d.submitted_at ASC
            """
        ).fetchall()

    return {
        "count": len(rows),
        "items": [dict(row) for row in rows],
    }


@router.post("/decisions/{decision_id}/approve")
def approve_decision(
    decision_id: int,
    current_admin=Depends(require_admin),
):
    """Approve a pending user decision."""

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE decisions
            SET status = 'approved',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = ?
            WHERE id = ? AND status = 'pending'
            """,
            (current_admin["id"], decision_id),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Pending decision not found",
            )

        connection.execute(
            """
            INSERT INTO audit_logs
            (actor_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_admin["id"],
                "DECISION_APPROVED",
                "decision",
                str(decision_id),
                "Admin approved user decision",
            ),
        )

    return {
        "message": "Decision approved successfully",
        "decision_id": decision_id,
        "status": "approved",
    }


@router.post("/decisions/{decision_id}/reject")
def reject_decision(
    decision_id: int,
    request: ReviewDecision,
    current_admin=Depends(require_admin),
):
    """Reject a pending user decision."""

    with get_connection() as connection:
        cursor = connection.execute(
            """
            UPDATE decisions
            SET status = 'rejected',
                reviewed_at = CURRENT_TIMESTAMP,
                reviewed_by = ?,
                review_note = ?
            WHERE id = ? AND status = 'pending'
            """,
            (
                current_admin["id"],
                request.note,
                decision_id,
            ),
        )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Pending decision not found",
            )

        connection.execute(
            """
            INSERT INTO audit_logs
            (actor_user_id, action, entity_type, entity_id, details)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_admin["id"],
                "DECISION_REJECTED",
                "decision",
                str(decision_id),
                request.note or "Admin rejected user decision",
            ),
        )

    return {
        "message": "Decision rejected successfully",
        "decision_id": decision_id,
        "status": "rejected",
    }