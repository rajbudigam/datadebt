import httpx
from bs4 import BeautifulSoup

def has_schema_org_dataset_jsonld(landing_url: str) -> bool:
    if not landing_url:
        return False
    try:
        resp = httpx.get(landing_url, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")
        for tag in soup.select('script[type="application/ld+json"]'):
            if '"@type"' in tag.text and "Dataset" in tag.text:
                return True
    except Exception:
        return False
    return False

def generate_dataset_jsonld(meta: dict) -> dict:
    # Minimal valid snippet per Google Dataset guidance
    # https://developers.google.com/search/docs/appearance/structured-data/dataset
    distributions = []
    for d in meta.get("distributions", []):
        if d.get("url"):
            distributions.append({
                "@type": "DataDownload",
                "contentUrl": d["url"],
                "encodingFormat": d.get("format") or d.get("media_type") or "text/csv"
            })
    jsonld = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": meta.get("title"),
        "description": meta.get("description"),
        "license": meta.get("license"),
        "keywords": meta.get("keywords") or [],
        "url": meta.get("landing_page"),
        "distribution": distributions
    }
    return jsonld
