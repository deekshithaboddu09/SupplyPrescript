# Architecture (initial implementation)

```text
Browser (frontend HTML/CSS/JS)
        | HTTP JSON API (integration step)
        v
FastAPI backend
  |-- Shipment API: list/filter/detail
  |-- Decision API: evaluate candidate actions
  |-- Prescriptive service: transparent baseline cost/penalty calculation
        |
        v
Synthetic CSV dataset (data/raw/shipments.csv)
```

## Boundaries
- Current UI reference script uses client-side sample data; it is not yet calling FastAPI.
- The backend API is separately runnable and testable.
- Baseline recommendations are rule-based calculations, not machine learning.
- CSV records are synthetic demo data.
