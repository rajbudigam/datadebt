from fastapi import APIRouter, Response
from jinja2 import Template
from core.discoverability import generate_dataset_jsonld

router = APIRouter()

BADGE_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" width="180" height="28">
<linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#111"/><stop offset="1" stop-color="#222"/></linearGradient>
<rect rx="4" width="180" height="28" fill="url(#g)"/>
<text x="10" y="19" fill="#fff" font-family="Inter,Segoe UI,system-ui" font-size="12">DataDebt Score</text>
<rect x="115" width="65" height="28" fill="{{color}}" rx="4"/>
<text x="147" y="19" fill="#000" font-family="Inter,Segoe UI,system-ui" font-weight="700" font-size="12" text-anchor="middle">{{score}}</text>
</svg>"""

@router.post("/jsonld")
async def jsonld(meta: dict):
    return generate_dataset_jsonld(meta)

@router.get("/badge")
async def badge(score: float = 0):
    s = max(0, min(int(score), 100))
    color = "#98FB98" if s >= 85 else "#FFD700" if s >= 70 else "#FFA07A" if s >= 50 else "#FF6347"
    svg = Template(BADGE_TEMPLATE).render(score=s, color=color)
    return Response(content=svg, media_type="image/svg+xml")
