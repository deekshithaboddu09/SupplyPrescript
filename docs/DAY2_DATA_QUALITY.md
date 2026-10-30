# SupplyPrescript - Day 2 Data Quality Report

## 1. Dataset Information
- File: data/raw/shipments.csv
- Dataset type: Synthetic shipment data
- Total records: 142
- Original shipment records preserved: 5
- Additional synthetic records: 137

## 2. Required Columns
- id
- product
- origin
- destination
- supplier
- status
- delay_days
- penalty

## 3. Validation Results

| Validation | Result |
|---|---|
| Total records | 142 |
| Unique shipment IDs | 142 |
| Duplicate shipment IDs | 0 |
| Missing required values | 0 |
| Invalid numeric records | 0 |
| Negative penalties | 0 |
| Negative delay values | 0 |

## 4. Shipment Status Distribution

| Status | Count |
|---|---:|
| CRITICAL | 2 |
| MODERATE | 1 |
| NORMAL | 139 |

## 5. Financial Exposure
- Total penalty exposure: $320,000
- SHP-4092: $180,000
- SHP-1044: $95,000
- SHP-7703: $45,000

## 6. Data Quality Conclusion
All executed validation checks passed.
All 142 shipment IDs are unique.
No missing required values, invalid numeric values,
negative penalties, or negative delays were found.

The dataset uses synthetic demonstration data.
It does not represent actual customer shipments.

## 7. Files
- data/raw/shipments.csv
- docs/DAY2_DATA_QUALITY.md

## 8. Backend Integration
The backend loads shipment records from the CSV file
through the /api/shipments endpoint.
The API returns 142 shipment records.
