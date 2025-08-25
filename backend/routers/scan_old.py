from fastapi import APIRouter, HTTPException
from typing import Optional, List
from core.models import PortalScanResult, DatasetScore
from core.discoverability import has_schema_org_dataset_jsonld
from core.frictionless_profile import profile_resource
from core.score import score_dataset
from harvesters.ckan import fetch_ckan_datasets
from harvesters.socrata import fetch_socrata_dataset

router = APIRouter()

@router.post("/ckan", response_model=PortalScanResult)
async def scan_ckan(portal: str, query: Optional[str] = "", rows: int = 25):
    ds = fetch_ckan_datasets(portal, query, rows=rows)
    if not ds:
        raise HTTPException(404, "No datasets found")
    results: List[DatasetScore] = []
    for d in ds:
        # signals for access friction
        meta = {
            "title": d.title,
            "description": d.description,
            "publisher": None, "contact": None,  # CKAN mapping left minimal
            "license": d.license,
            "distributions": [r.model_dump() for r in d.distributions],
            "keywords": d.keywords,
            "modified": d.modified,
            "accrual_periodicity": d.accrual_periodicity,
            "api_available": True,  # CKAN portal implies API availability
            "bulk_available": any((x.url or "").lower().endswith((".zip",".7z",".tar",".tgz")) for x in d.distributions),
            "login_required": False,
            "landing_page": d.landing_page,
        }
        meta["jsonld_present"] = has_schema_org_dataset_jsonld(d.landing_page) if d.landing_page else False

        # simple quality profiling on first CSV-like resource
        csv_like = None
        for r in d.distributions:
            url = (r.url or "").lower()
            if url.endswith((".csv",".tsv",".txt")):
                csv_like = r.url; break
        fp = profile_resource(csv_like) if csv_like else {"errors": 200}  # penalize if no machine-readable CSV

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
        "bulk_available": True,  # SODA + CSV
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
