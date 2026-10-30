from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router as shipment_router
from backend.api.decisions import router as decision_router
from backend.api.auth import router as auth_router
from backend.api.admin import router as admin_router
from backend.api.user import router as user_router

app = FastAPI(
    title="SupplyPrescript API",
    version="0.1.0",
    description="Local demo API for shipment risk and prescriptive decision evaluation.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shipment_router, prefix="/api")
app.include_router(decision_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(user_router, prefix="/api")
@app.get("/health")
def health():
    return {"status": "ok", "service": "SupplyPrescript API", "version": "0.1.0"}
