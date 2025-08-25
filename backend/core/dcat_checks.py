from typing import Dict, List, Tuple

# Minimal DCAT/DCAT-AP core fields to check (presence-only here).
# DCAT v3 / DCAT-AP 3.0 anchors.
REQUIRED_FIELDS = [
    "title", "description", "publisher", "contact", "license", "distributions"
]
RECOMMENDED_FIELDS = [
    "keywords", "temporal", "spatial", "modified", "accrualPeriodicity"
]

def check_metadata_presence(meta: Dict) -> Tuple[List[str], List[str]]:
    missing_required = []
    missing_recommended = []
    for f in REQUIRED_FIELDS:
        if not meta.get(f):
            missing_required.append(f)
    for f in RECOMMENDED_FIELDS:
        if not meta.get(f):
            missing_recommended.append(f)
    return missing_required, missing_recommended
