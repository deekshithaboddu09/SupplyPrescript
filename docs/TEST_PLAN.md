# Test Plan

## Automated checks
- Health endpoint returns 200 and `status=ok`.
- Shipment list contains at least five demo records.
- Unknown shipment returns 404.
- Decision endpoint ranks air-expedite above accepting a full delay for the supplied sample.
- Engine computes `180000 - 24500 = 155500` net benefit for SHP-4092's air option.

## Manual checks
1. Open frontend at `http://localhost:5500`.
2. Verify Overview, Shipments, Recommendations and Decision History navigation.
3. Search/filter shipment records and open shipment detail/decision UI.
4. Confirm browser console has no runtime errors.
5. Verify API separately at `http://127.0.0.1:8000/docs`.

Do not mark a test passed until it has actually been run.
