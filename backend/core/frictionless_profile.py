from typing import Dict, Any
from frictionless import Resource, validate

def profile_resource(url: str, sample_size_rows: int = 5000) -> Dict[str, Any]:
    # Download/stream is handled by Frictionless; we keep to a reasonable sample size.
    out = {"errors": 0, "warnings": 0, "stats": {}}
    try:
        resource = Resource(url)
        # validate returns a Report with table/row errors (format/type/duplicate etc.)
        report = validate(resource)
        out["errors"] = len(report.flatten(["type"]))
        # basic stats: field count, row count (if available)
        try:
            resource.infer()
            out["stats"]["fields"] = len(resource.schema.fields) if resource.schema else 0
        except Exception:
            pass
    except Exception as e:
        out["errors"] = 1_000_000  # heavy penalty for unreachable/invalid
    return out
