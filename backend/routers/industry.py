from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "industries.json"


def _load() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


@router.get("/industries")
def list_industries() -> dict:
    return _load()


@router.get("/industries/{industry_id}")
def get_industry(industry_id: str) -> dict:
    for ind in _load().get("industries", []):
        if ind.get("id") == industry_id:
            return ind
    raise HTTPException(status_code=404, detail="industry not found")
