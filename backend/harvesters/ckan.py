import httpx
from typing import Dict, List
from core.models import DatasetRef, DistributionRef

def fetch_ckan_datasets(base_url: str, query: str, rows: int = 50) -> List[DatasetRef]:
    """
    CKAN Action API - package_search
    https://docs.ckan.org/en/2.9/api/
    """
    base = base_url.rstrip("/")
    url = f"{base}/api/3/action/package_search"
    params = {"q": query or "", "rows": rows}
    r = httpx.get(url, params=params, timeout=30)
    r.raise_for_status()
    js = r.json()
    datasets = []
    if js.get("success") and js["result"].get("results"):
        for pkg in js["result"]["results"]:
            dists = []
            for res in pkg.get("resources", []):
                dists.append(DistributionRef(
                    url=res.get("url"),
                    format=res.get("format"),
                    media_type=res.get("mimetype") or res.get("mimetype_inner"),
                    size=res.get("size")
                ))
            datasets.append(DatasetRef(
                id=pkg.get("id"),
                title=pkg.get("title") or pkg.get("name",""),
                description=pkg.get("notes"),
                portal=base_url,
                landing_page=pkg.get("url") or pkg.get("url_html") or pkg.get("ckan_url"),
                license=pkg.get("license_title") or pkg.get("license_id"),
                keywords=pkg.get("tags") and [t.get("name") for t in pkg["tags"]] or [],
                modified=pkg.get("metadata_modified"),
                accrual_periodicity=(pkg.get("frequency") or pkg.get("update_frequency") or None),
                distributions=dists
            ))
    return datasets
