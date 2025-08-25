import re, math, datetime as dt
from typing import Optional

def clamp(v: float, lo=0.0, hi=100.0) -> float:
    return max(lo, min(hi, v))

def days_since(date_str: Optional[str]) -> Optional[int]:
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            d = dt.datetime.strptime(date_str[:19], fmt)
            return (dt.datetime.utcnow() - d).days
        except Exception:
            continue
    return None
