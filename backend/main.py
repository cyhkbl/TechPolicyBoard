from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.tech import router as tech_router

app = FastAPI(title="TechPolicy Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(tech_router, prefix="/api")
