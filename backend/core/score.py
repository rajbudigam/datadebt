from typing import Dict, Any, Tuple
from .dcat_checks import check_metadata_presence
from .discoverability import has_schema_org_dataset_jsonld
from .utils import clamp, days_since

DEFAULT_WEIGHTS = {
    "metadata": 0.25,
    "access": 0.15,
    "quality": 0.25,
    "timeliness": 0.15,
    "discoverability": 0.10,
    "compliance": 0.10
}

def score_dataset(meta: Dict[str, Any], fp: Dict[str, Any]) -> Tuple[float, Dict[str, float], Dict[str, Any]]:
    # --- Metadata completeness (DCAT/DCAT-AP presence) ---
    missing_required, missing_recommended = check_metadata_presence(meta)
    req_total = 6  # from REQUIRED_FIELDS
    req_present = req_total - len(missing_required)
    metadata_score = clamp(100.0 * req_present / req_total - 5.0 * len(missing_recommended), 0, 100)

    # --- Access friction (API/bulk/login) ---
    access_penalty = 0
    notes = []
    if not meta.get("api_available"):
        access_penalty += 30; notes.append("No API endpoint detected")
    if not meta.get("bulk_available"):
        access_penalty += 20; notes.append("No bulk download")
    if meta.get("login_required"):
        access_penalty += 30; notes.append("Login/CAPTCHA barrier for read")
    access_score = clamp(100 - access_penalty, 0, 100)

    # --- Quality & integrity (Frictionless errors) ---
    errors = fp.get("errors", 0)
    # map error density to score: 0 errors→100, many errors→0
    quality_score = clamp(100 - min(100, errors * 2), 0, 100)

    # --- Timeliness (DWBP emphasis on freshness; DCAT modified) ---
    days = days_since(meta.get("modified"))
    if days is None:
        timeliness_score = 40  # unknown freshness
    else:
        timeliness_score = clamp(100 - (days * 0.5), 0, 100)  # 2 days = -1 point
        # penalty if declared update frequency violated (simple heuristic)
        if meta.get("accrual_periodicity") in {"daily","weekly","monthly"} and days is not None:
            target = {"daily": 2, "weekly": 10, "monthly": 40}[meta["accrual_periodicity"]]
            if days > target:
                timeliness_score = max(0, timeliness_score - 15)

    # --- Discoverability (schema.org/Dataset JSON-LD present?) ---
    discoverability_score = 100 if meta.get("jsonld_present") else 40

    # --- Compliance & interoperability (license clarity + DCAT-AP hints) ---
    compliance_score = 70
    comp_notes = []
    lic = (meta.get("license") or "").lower()
    if not lic:
        compliance_score -= 30; comp_notes.append("Missing license")
    elif any(x in lic for x in ["cc0","cc-by","odc","mit","gpl","spdx:"]):
        compliance_score += 10
    # DCAT-AP + HVD simple hint: API & bulk raise compliance perception
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
    # weighted score
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
