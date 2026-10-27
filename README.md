# SupplyPrescript — Closed-Loop Prescriptive Analytics

A student-built demo for shipment risk monitoring and cost-aware decision recommendations. The frontend is based on the provided reference UI and has been separated into HTML, CSS, and JavaScript. A local FastAPI backend provides shipment endpoints and a transparent baseline decision-evaluation API.

## Project status

- Frontend reference UI: included in `frontend/`.
- Backend API: local demo endpoints implemented.
- Decision engine: baseline rule-based calculation, not a trained ML model.
- Data: five sample shipments in `data/raw/shipments.csv` (synthetic demo data).
- Automated tests: included in `backend/tests/`; run them locally before claiming they pass.
- Frontend-to-backend integration: next implementation step; current reference UI still uses its own client-side sample data.

## Run the backend (Windows PowerShell)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Open API docs at `http://127.0.0.1:8000/docs` and health at `http://127.0.0.1:8000/health`.

## Run the frontend

Open a second terminal in the repository root:

```powershell
python -m http.server 5500 --directory frontend
```

Then open `http://localhost:5500`. Keep the terminal running while using the site.

## Run tests

```powershell
python -m pytest backend/tests -q
```

## Decision calculation

For a proposed option, the demo calculates residual penalty from the remaining-delay ratio, then:

`net benefit = penalty avoided - extra intervention cost`

This is an explainable baseline assumption for learning/demo use. It is not a trained predictive model and must not be used for real shipment decisions without validation.

## Team

- Boddu Deekshitha — Team Lead; frontend, backend, integration
- Sikili Avinash — data collection and data cleaning
- Atul Bhosale — data processing and prescriptive analytics
- Pranjal Patil — testing and documentation

## Collaboration

Work on assigned member branches, commit focused changes, push to origin, and open pull requests for review. Do not commit credentials or `.env` files.
