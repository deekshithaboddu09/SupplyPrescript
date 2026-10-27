# API Specification (v0.1)

- `GET /health` — service status.
- `GET /api/shipments` — returns `{count, items}`. Optional `status` and `search` query parameters.
- `GET /api/shipments/{shipment_id}` — one shipment, or HTTP 404.
- `POST /api/decisions/evaluate` — body contains `shipment_id`, `penalty`, `current_delay_days`, and an `options` array (`id`, `name`, `cost`, `delay_days`). Returns ranked options and a demo notice.

See FastAPI interactive docs at `/docs` while the backend is running.
