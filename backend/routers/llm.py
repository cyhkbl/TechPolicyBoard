"""Thin LLM proxy to bypass browser CORS for user-supplied OpenAI-compatible endpoints."""

import asyncio
import logging
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


logger = logging.getLogger("llm_proxy")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/llm", tags=["llm"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    baseURL: str = Field(..., description="OpenAI-compatible base URL, no trailing /chat/completions")
    apiKey: str
    model: str
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.3
    response_format: Optional[Dict[str, Any]] = None


# Longer timeout so big JSON payloads (policy lists, chain maps) finish generating.
# Connect/write are short; read is long because the model is "thinking".
_TIMEOUT = httpx.Timeout(connect=15.0, read=300.0, write=30.0, pool=15.0)
_MAX_ATTEMPTS = 3
_RETRY_BACKOFF_SEC = 1.5


@router.post("/chat")
async def chat(req: ChatRequest):
    if not req.apiKey:
        raise HTTPException(status_code=400, detail="apiKey is required")
    if not req.baseURL:
        raise HTTPException(status_code=400, detail="baseURL is required")
    if not req.model:
        raise HTTPException(status_code=400, detail="model is required")

    url = req.baseURL.rstrip("/") + "/chat/completions"
    payload: Dict[str, Any] = {
        "model": req.model,
        "temperature": req.temperature,
        "stream": False,
        "messages": [m.model_dump() for m in req.messages],
    }
    if req.response_format:
        payload["response_format"] = req.response_format

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {req.apiKey}",
    }

    last_err: Optional[str] = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, json=payload, headers=headers)
        except httpx.TimeoutException as e:
            last_err = f"timeout on attempt {attempt}/{_MAX_ATTEMPTS}: {e!s}"
            logger.warning("upstream timeout: %s (url=%s)", last_err, url)
        except httpx.RequestError as e:
            last_err = f"network error on attempt {attempt}/{_MAX_ATTEMPTS}: {type(e).__name__}: {e!s}"
            logger.warning("upstream request error: %s (url=%s)", last_err, url)
        else:
            if resp.status_code >= 500:
                # Upstream 5xx is worth retrying; 4xx is not (bad key, bad payload).
                last_err = f"upstream {resp.status_code} on attempt {attempt}/{_MAX_ATTEMPTS}: {resp.text[:400]}"
                logger.warning("upstream 5xx: %s", last_err)
            elif resp.status_code >= 400:
                body_preview = resp.text[:2000]
                logger.info("upstream 4xx (not retrying): status=%s body=%s", resp.status_code, body_preview)
                raise HTTPException(
                    status_code=resp.status_code,
                    detail={"upstream_status": resp.status_code, "body": body_preview},
                )
            else:
                try:
                    return resp.json()
                except ValueError:
                    raise HTTPException(status_code=502, detail="upstream returned non-JSON body")

        if attempt < _MAX_ATTEMPTS:
            await asyncio.sleep(_RETRY_BACKOFF_SEC * attempt)

    raise HTTPException(
        status_code=502,
        detail={"message": "upstream unreachable after retries", "last_error": last_err},
    )
