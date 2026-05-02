from pathlib import Path
import json

from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "technologies.json"


def _load() -> dict:
    return json.loads(DATA_FILE.read_text(encoding="utf-8"))


@router.get("/technologies")
def list_technologies() -> dict:
    """Return the list of top-level technology trees (embodied-ai, bci, quantum, fusion)."""
    return _load()


@router.get("/technologies/{tech_id}")
def get_technology_detail(tech_id: str) -> dict:
    """Look up a top-level tech tree, or a sub-component by ID across all trees."""
    payload = _load()
    trees = payload.get("technologies", [])

    for tree in trees:
        if tree.get("id") == tech_id:
            return tree

    for tree in trees:
        for category in tree.get("categories", []):
            for child in category.get("children", []):
                if child.get("id") == tech_id:
                    return {
                        **child,
                        "technologyId": tree.get("id"),
                        "technologyName": tree.get("name"),
                        "categoryId": category.get("id"),
                        "categoryName": category.get("name"),
                    }

    raise HTTPException(status_code=404, detail="technology not found")
