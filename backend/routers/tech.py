from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "technologies.json"


def _load_tree() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


@router.get("/technologies")
def get_technologies_tree() -> dict:
    return _load_tree()


@router.get("/technologies/{tech_id}")
def get_technology_detail(tech_id: str) -> dict:
    tree = _load_tree()
    for category in tree.get("categories", []):
        for child in category.get("children", []):
            if child.get("id") == tech_id:
                return {
                    **child,
                    "categoryId": category.get("id"),
                    "categoryName": category.get("name"),
                }
    raise HTTPException(status_code=404, detail="technology not found")
