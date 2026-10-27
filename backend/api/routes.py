import csv
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(tags=["shipments"])
DATA_FILE = Path(__file__).resolve().parents[2] / ".." / "data" / "raw" / "shipments.csv"

# Keep a reliable small seed set so the API runs even before CSV data is added.
SEED_SHIPMENTS = [
    {"id":"SHP-4092","product":"Microcontroller Chips","origin":"Shanghai, CN","destination":"Rotterdam, NL","supplier":"Semico Tech","status":"CRITICAL","delay_days":4.0,"penalty":180000},
    {"id":"SHP-1044","product":"Display Panels 12 inch","origin":"Seoul, KR","destination":"Long Beach, US","supplier":"Lumina Display","status":"CRITICAL","delay_days":3.0,"penalty":95000},
    {"id":"SHP-7703","product":"Power Supply Modules","origin":"Taipei, TW","destination":"Frankfurt, DE","supplier":"VoltDynamics","status":"MODERATE","delay_days":1.5,"penalty":45000},
    {"id":"SHP-8921","product":"Aluminum Enclosures","origin":"Shenzhen, CN","destination":"Long Beach, US","supplier":"PrecisionFab","status":"NORMAL","delay_days":0.0,"penalty":0},
    {"id":"SHP-5532","product":"Lithium Battery Cells","origin":"Nagoya, JP","destination":"Hamburg, DE","supplier":"EnergyTech Corp","status":"NORMAL","delay_days":0.0,"penalty":0},
]

def load_shipments():
    if not DATA_FILE.exists():
        return SEED_SHIPMENTS
    try:
        with DATA_FILE.open(newline="", encoding="utf-8") as file:
            return list(csv.DictReader(file))
    except (OSError, csv.Error):
        return SEED_SHIPMENTS

@router.get("/shipments")
def list_shipments(status: str | None = Query(default=None), search: str | None = Query(default=None)):
    rows = load_shipments()
    if status:
        rows = [row for row in rows if str(row.get("status", "")).upper() == status.upper()]
    if search:
        q = search.lower()
        rows = [row for row in rows if q in " ".join(str(v) for v in row.values()).lower()]
    return {"count": len(rows), "items": rows}

@router.get("/shipments/{shipment_id}")
def get_shipment(shipment_id: str):
    for row in load_shipments():
        if row.get("id") == shipment_id:
            return row
    raise HTTPException(status_code=404, detail="Shipment not found")
