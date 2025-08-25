from fastapi import APIRouter, HTTPException
from typing import Optional, List
from core.models import PortalScanResult, DatasetScore
from core.discoverability import has_schema_org_dataset_jsonld
from core.frictionless_profile import profile_resource
from core.score import score_dataset
from harvesters.ckan import fetch_ckan_datasets
from harvesters.socrata import fetch_socrata_dataset

router = APIRouter()

_MACHINE_READABLE_EXTS = (
    ".csv",".tsv",".txt",".json",".geojson",".xlsx",".xls",".parquet"
)
_BULK_HINTS = (".zip",".7z",".tar",".tgz",".gz",".bz2",".gpkg",".shp",".parquet")

def _pick_profile_candidate(distributions) -> Optional[str]:
    # Prefer CSV/TSV/TXT, then JSON/GeoJSON/XLSX, else None
    best = None
    for r in distributions or []:
        url = (r.get("url") or "").lower()
        if url.endswith((".csv",".tsv",".txt")):
            return r.get("url")
        if best is None and url.endswith((".json",".geojson",".xlsx",".xls",".parquet")):
            best = r.get("url")
    return best

@router.post("/ckan", response_model=PortalScanResult)
async def scan_ckan(portal: str, query: Optional[str] = "", rows: int = 25):
    ds = fetch_ckan_datasets(portal, query, rows=rows)
    if not ds:
        raise HTTPException(404, "No datasets found")
    results: List[DatasetScore] = []
    for d in ds:
        bulk_available = any(((x.url or "").lower().endswith(_BULK_HINTS)) for x in d.distributions)
        api_available = True  # CKAN portal implies API endpoints for metadata/resources

        meta = {
            "title": d.title,
            "description": d.description,
            "publisher": d.publisher,
            "contact": d.contact,
            "license": d.license,
            "distributions": [r.model_dump() for r in d.distributions],
            "keywords": d.keywords,
            "modified": d.modified,
            "accrual_periodicity": d.accrual_periodicity,
            "api_available": api_available,
            "bulk_available": bulk_available,
            "login_required": False,
            "landing_page": d.landing_page,
        }
        meta["jsonld_present"] = has_schema_org_dataset_jsonld(d.landing_page) if d.landing_page else False

        # QUALITY: try to profile something machine-readable. If none, assign a surrogate instead of bombing to 0.
        candidate = _pick_profile_candidate([r.model_dump() for r in d.distributions])
        if candidate:
            fp = profile_resource(candidate)
        else:
            # if we saw any machine-readable/ext hints (json, parquet, shapefile zip), give a gentle baseline
            mr = any(((x.url or "").lower().endswith(_MACHINE_READABLE_EXTS + _BULK_HINTS)) for x in d.distributions)
            fp = {"errors": 15 if mr else 200}

        total, buckets, evidence = score_dataset(meta, fp)
        results.append(DatasetScore(
            dataset=d, score=round(total,2),
            buckets=buckets, evidence=evidence
        ))
    avg = round(sum(x.score for x in results)/len(results), 2)
    return PortalScanResult(portal=portal, query=query, total=len(results), avg_score=avg, results=results)

@router.post("/socrata", response_model=PortalScanResult)
async def scan_socrata(domain: str, dataset_id: str, app_token: str = ""):
    d = fetch_socrata_dataset(domain, dataset_id, app_token or None)
    if not d:
        raise HTTPException(404, "Dataset not found")
    meta = {
        "title": d.title,
        "description": d.description,
        "publisher": None, "contact": None,
        "license": d.license,
        "distributions": [r.model_dump() for r in d.distributions],
        "keywords": d.keywords,
        "modified": d.modified,
        "accrual_periodicity": None,
        "api_available": True,
        "bulk_available": True,
        "login_required": False,
        "landing_page": d.landing_page,
    }
    meta["jsonld_present"] = has_schema_org_dataset_jsonld(d.landing_page) if d.landing_page else False
    fp = {"errors": 0}
    if d.distributions and d.distributions[0].url:
        fp = profile_resource(d.distributions[0].url)
    total, buckets, evidence = score_dataset(meta, fp)
    res = DatasetScore(dataset=d, score=round(total,2), buckets=buckets, evidence=evidence)
    return PortalScanResult(portal=f"https://{domain}", query=dataset_id, total=1, avg_score=res.score, results=[res])
