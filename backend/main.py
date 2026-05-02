from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.tech import router as tech_router
from routers.policy import router as policy_router
from routers.industry import router as industry_router
from routers.llm import router as llm_router

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
app.include_router(policy_router, prefix="/api")
app.include_router(industry_router, prefix="/api")
app.include_router(llm_router, prefix="/api")
