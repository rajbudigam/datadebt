from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import scan, generate

app = FastAPI(title="DataDebt API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://refactored-space-trout-jjr7qqg6qv9v3q9w5-3000.app.github.dev"],  # adjust to your frontend URL
    allow_credentials=False,                  # or True with explicit origins
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router, prefix="/scan", tags=["scan"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/cors-test")
def cors_test():
    return {"message": "CORS is working", "status": "ok"}
