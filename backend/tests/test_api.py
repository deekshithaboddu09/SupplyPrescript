from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_list_shipments():
    response = client.get("/api/shipments")
    assert response.status_code == 200
    assert response.json()["count"] >= 5

def test_missing_shipment_is_404():
    assert client.get("/api/shipments/DOES-NOT-EXIST").status_code == 404

def test_decision_endpoint():
    payload = {
        "shipment_id": "SHP-4092", "penalty": 180000, "current_delay_days": 4,
        "options": [
            {"id":"air","name":"Air freight","cost":24500,"delay_days":0},
            {"id":"wait","name":"Accept delay","cost":0,"delay_days":4}
        ]
    }
    response = client.post("/api/decisions/evaluate", json=payload)
    assert response.status_code == 200
    assert response.json()["recommendation"]["net_benefit"] == 155500
