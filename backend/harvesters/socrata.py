import httpx
from typing import Optional, Dict
from core.models import DatasetRef, DistributionRef

def fetch_socrata_dataset(domain: str, four_by_four: str, app_token: Optional[str]=None) -> Optional[DatasetRef]:
    """
    Socrata SODA API basics:
    https://dev.socrata.com/docs/endpoints.html
    """
    meta_url = f"https://{domain}/api/views/{four_by_four}.json"
    headers = {"X-App-Token": app_token} if app_token else {}
    r = httpx.get(meta_url, headers=headers, timeout=20)
    if r.status_code >= 400:
        return None
    m = r.json()
    title = m.get("name")
    description = m.get("description")
    license = (m.get("licenseUrl") or m.get("license") or "")
    updated_at = m.get("rowsUpdatedAt") or m.get("publicationDate")
    landing = m.get("permalink") or m.get("link")
    csv_url = f"https://{domain}/resource/{four_by_four}.csv"
    dist = [DistributionRef(url=csv_url, format="CSV", media_type="text/csv")]
    return DatasetRef(
        id=f"{domain}/{four_by_four}",
        title=title,
        description=description,
        portal=f"https://{domain}",
        landing_page=landing,
        license=license,
        keywords=m.get("tags") or [],
        modified=str(updated_at) if updated_at else None,
        accrual_periodicity=None,
        publisher=m.get("owner", {}).get("displayName") if m.get("owner") else None,
        contact=m.get("owner", {}).get("email") if m.get("owner") else None,
        distributions=dist
    )
