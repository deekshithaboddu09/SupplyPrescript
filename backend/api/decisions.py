
from fastapi import APIRouter, Depends, HTTPException

from backend.models.shipment import (
    DecisionRequest,
    DecisionSubmissionRequest,
)
from backend.services.prescriptive_engine import evaluate_options
from backend.database.db import get_connection
from backend.api.dependencies import get_current_user

router = APIRouter(tags=["decisions"])


# Existing endpoint: Evaluate decision options
@router.post("/decisions/evaluate")
def evaluate_decision(request: DecisionRequest):
    results = evaluate_options(
        request.penalty,
        request.current_delay_days,
        request.options
    )

    return {
        "shipment_id": request.shipment_id,
        "method": "linear_delay_penalty_demo_rule",
        "recommendation": results[0].model_dump() if results else None,
        "options": [result.model_dump() for result in results],
        "notice": (
            "Demo estimate based on supplied assumptions; "
            "validate with real operational data before business use."
        ),
    }


# New endpoint: Submit a decision for Admin approval
@router.post("/decisions/submit")
def submit_decision(
    request: DecisionSubmissionRequest,
    current_user=Depends(get_current_user),
):
    results = evaluate_options(
        request.penalty,
        request.current_delay_days,
        [request.selected_option]
    )

    if not results:
        raise HTTPException(
            status_code=400,
            detail="Unable to evaluate the selected decision option"
        )

    result = results[0]

    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO decisions (
                user_id,
                shipment_id,
                option_id,
                option_name,
                cost,
                delay_days,
                penalty,
                penalty_avoided,
                net_benefit,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            """,
            (
                current_user["id"],
                request.shipment_id,
                request.selected_option.id,
                request.selected_option.name,
                request.selected_option.cost,
                request.selected_option.delay_days,
                request.penalty,
                result.penalty_avoided,
                result.net_benefit,
            ),
        )

        decision_id = cursor.lastrowid
        connection.commit()

        saved_decision = connection.execute(
            """
            SELECT *
            FROM decisions
            WHERE id = ?
            """,
            (decision_id,),
        ).fetchone()

        return {
            "message": "Decision submitted successfully. Waiting for Admin approval.",
            "decision": dict(saved_decision),
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


# New endpoint: Get decisions submitted by the logged-in user
@router.get("/decisions/my")
def get_my_decisions(
    current_user=Depends(get_current_user),
):
    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT *
            FROM decisions
            WHERE user_id = ?
            ORDER BY submitted_at DESC
            """,
            (current_user["id"],),
        ).fetchall()

        return {
            "decisions": [dict(row) for row in rows]
        }

    finally:
        connection.close()
