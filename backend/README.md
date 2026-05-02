# Backend (FastAPI)

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

Endpoints:
- GET /api/health
- GET /api/technologies
- GET /api/policies
- GET /api/industries
