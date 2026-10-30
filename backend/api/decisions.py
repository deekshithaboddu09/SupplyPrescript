from fastapi import APIRouter
from backend.models.shipment import DecisionRequest
from backend.services.prescriptive_engine import evaluate_options

router = APIRouter(tags=["decisions"])

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
        "notice": "Demo estimate based on supplied assumptions; validate with real operational data before business use.",
    }
