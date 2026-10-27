# Local User Guide

1. Start the FastAPI backend in one terminal with `python -m uvicorn backend.main:app --reload --port 8000`.
2. Start the frontend static server in a second terminal with `python -m http.server 5500 --directory frontend`.
3. Visit `http://localhost:5500`.
4. Use `/docs` on port 8000 to inspect API endpoints.
5. Run tests with `python -m pytest backend/tests -q`.

Note: Frontend-to-backend wiring is a separate next step; running both services does not yet mean every UI action is API-backed.
