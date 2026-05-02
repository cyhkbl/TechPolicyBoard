# Backend (FastAPI)

## Setup

```bash
cd backend
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\pip install -r requirements.txt
```

**macOS / Linux:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

**Windows:**
```bash
.venv\Scripts\uvicorn main:app --reload --port 8000
```

**macOS / Linux:**
```bash
uvicorn main:app --reload --port 8000
```

Endpoints:
- GET /api/health
- GET /api/technologies
- GET /api/policies
- GET /api/industries
