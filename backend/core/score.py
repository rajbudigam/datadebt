from typing import Dict, Any, Tuple
from .dcat_checks import check_metadata_presence
from .utils import clamp, days_since

DEFAULT_WEIGHTS = {
    "metadata": 0.25,
    "access": 0.15,
    "quality": 0.25,
    "timeliness": 0.15,
    "discoverability": 0.10,
    "compliance": 0.10
}

_PERIOD_TARGET = {
    "daily": 2, "weekly": 10, "monthly": 45, "quarterly": 130,
    "annual": 500, "yearly": 500
}

def score_dataset(meta: Dict[str, Any], fp: Dict[str, Any]) -> Tuple[float, Dict[str, float], Dict[str, Any]]:
    # --- Metadata completeness (DCAT/DCAT-AP presence) ---
    missing_required, missing_recommended = check_metadata_presence(meta)
    req_total = 6
    req_present = req_total - len(missing_required)
    # lighter penalty for recommended; presence ratio drives most of it
    metadata_score = clamp(100.0 * req_present / req_total - 3.0 * len(missing_recommended), 0, 100)

    # --- Access friction ---
    access_penalty = 0
    notes = []
    if not meta.get("api_available"):
        access_penalty += 25; notes.append("No API endpoint detected")
    if not meta.get("bulk_available"):
        access_penalty += 15; notes.append("No bulk download")
    if meta.get("login_required"):
        access_penalty += 30; notes.append("Login/CAPTCHA barrier for read")
    access_score = clamp(100 - access_penalty, 0, 100)

    # --- Quality & integrity ---
    # If profiler didn't run but dataset is clearly machine-readable, we assign a surrogate score
    errors = fp.get("errors", 0)
    # Map errors to score (gentler slope)
    quality_score = clamp(100 - min(100, errors * 1.0), 0, 100)

    # --- Timeliness (fair baseline with periodicity awareness) ---
    days = days_since(meta.get("modified"))
    if days is None:
        timeliness_score = 55  # unknown freshness, not a total fail
    else:
        period = (meta.get("accrual_periodicity") or "").lower()
        target = _PERIOD_TARGET.get(period, 730)  # default 2 years
        # 0 days -> 100; at target days -> ~0
        timeliness_score = clamp(100 - (100 * (days / target)), 0, 100)

    # --- Discoverability ---
    # Most portals lack JSON-LD; don't make it a death blow.
    discoverability_score = 85 if meta.get("jsonld_present") else 35

    # --- Compliance & interoperability (license clarity + API/bulk hints) ---
    compliance_score = 60
    comp_notes = []
    lic = (meta.get("license") or "").lower()
    if not lic:
        compliance_score -= 25; comp_notes.append("Missing license")
    elif any(x in lic for x in ["cc0","cc-by","odc","mit","apache","gpl","spdx:"]):
        compliance_score += 15
    if meta.get("api_available"): compliance_score += 5
    if meta.get("bulk_available"): compliance_score += 5
    compliance_score = clamp(compliance_score, 0, 100)

    buckets = {
        "metadata": metadata_score,
        "access": access_score,
        "quality": quality_score,
        "timeliness": timeliness_score,
        "discoverability": discoverability_score,
        "compliance": compliance_score
    }
    total = sum(buckets[k] * DEFAULT_WEIGHTS[k] for k in buckets)
    evidence = {
        "missing_fields": missing_required + missing_recommended,
        "access_notes": notes,
        "quality_summary": {"errors": errors},
        "timeliness_days": days,
        "discoverability_found": bool(meta.get("jsonld_present")),
        "compliance_notes": comp_notes
    }
    return total, buckets, evidence
