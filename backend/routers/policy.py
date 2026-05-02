from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "policies.json"


def _load() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


@router.get("/policies")
def list_policies(department: str | None = None) -> dict:
    payload = _load()
    items = payload.get("policies", [])
    if department and department != "all":
        items = [p for p in items if p.get("department") == department]
    return {"policies": items}


@router.get("/policies/{policy_id}")
def get_policy(policy_id: str) -> dict:
    for p in _load().get("policies", []):
        if p.get("id") == policy_id:
            return p
    raise HTTPException(status_code=404, detail="policy not found")
