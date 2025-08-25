# DataDebt — the credit score for public datasets

DataDebt audits any open-data portal (CKAN today; single Socrata datasets too), computes a 0–100 **DataDebt Score** across 6 buckets (**Metadata, Access, Quality, Timeliness, Discoverability, Compliance**), and auto-generates **JSON-LD (schema.org/Dataset)** and **Frictionless Table Schema** snippets to erase debt fast.

## Why this matters (standards-aligned)
- **DCAT v3 (W3C Rec, 2024)** for catalog metadata.  
- **Data on the Web Best Practices (W3C)** for publishing & usage.  
- **Google/Dataset & schema.org** for discoverability.  
- **CKAN & Socrata APIs** for harvesting.  
- **Frictionless** validation for quality.  
- **ISO/IEC 25012 & 25024** as data-quality anchors.

See sources: DCAT v3, DWBP, Google Dataset guidance, CKAN API, SODA, Frictionless docs, ISO 25012/25024.

## Quick start (local)
```bash
# Terminal A
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal B
cd frontend
npm install
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000

## Docker (optional)

```bash
docker compose up --build
```

## Demo flow
1. On Home, keep portal https://catalog.data.gov and query water (or anything) → Scan CKAN.
2. See Avg score, badge, cards with bucket scores.
3. Click a dataset → see evidence and one-click fixes (JSON-LD + Table Schema).

## API (examples)
- POST /scan/ckan?portal=https://catalog.data.gov&query=water&rows=25
- POST /scan/socrata?domain=data.cityofchicago.org&dataset_id=abcd-1234&app_token=YOUR_TOKEN
- GET /generate/badge?score=83 → SVG badge

## Limitations
- We sample only the first CSV-like distribution for Frictionless validation (speed).
- publisher/contact mapping in CKAN is minimal; you can extend from organization/maintainer fields.
- For Socrata, this demo targets single dataset IDs (4x4). Portal-wide scans can be added later.

## License

MIT