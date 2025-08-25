from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scan, generate


app = FastAPI(title="DataDebt API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/scan", tags=["scan"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])

@app.get("/health")
def health():
    return {"ok": True}
