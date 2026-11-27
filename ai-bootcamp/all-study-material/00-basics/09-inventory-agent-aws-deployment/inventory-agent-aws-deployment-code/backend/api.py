import os
import uuid
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel

import db_client
import agent as agent_module

load_dotenv()

API_KEY = os.getenv("API_KEY", "dev-secret")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

app = FastAPI(title="Inventory Planning Agent API")


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def verify_api_key(key: str = Security(api_key_header)) -> str:
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
def startup():
    db_client.init_db()
    db_client.seed_sample_data()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    sku_id: Optional[str] = None
    history: Optional[list[dict]] = None  # [{"role": "user"|"assistant", "content": "..."}]


class ChatResponse(BaseModel):
    session_id: str
    response: str


class InventoryItem(BaseModel):
    sku_id: str
    name: Optional[str] = None
    current_inventory: int
    avg_demand: float
    lead_time: int
    safety_stock: int = 0


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse, dependencies=[Depends(verify_api_key)])
def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    # Prepend SKU context to query if provided
    query = req.query
    if req.sku_id:
        query = f"[SKU: {req.sku_id}] {query}"

    try:
        response = agent_module.chat(query, history=req.history or [])
    except Exception as e:  # surface LLM/tool errors to the caller instead of a bare 500
        raise HTTPException(status_code=502, detail=f"Agent error ({type(e).__name__}): {e}")

    db_client.log_session(
        session_id=session_id,
        user_query=req.query,
        agent_response=response,
        sku_ref=req.sku_id,
    )

    return ChatResponse(session_id=session_id, response=response)


@app.get("/inventory/{sku_id}", dependencies=[Depends(verify_api_key)])
def get_inventory(sku_id: str):
    row = db_client.get_inventory(sku_id.upper())
    if not row:
        raise HTTPException(status_code=404, detail=f"SKU '{sku_id}' not found")
    return row


@app.post("/inventory", dependencies=[Depends(verify_api_key)])
def upsert_inventory(item: InventoryItem):
    db_client.upsert_inventory(item.model_dump())
    return {"status": "ok", "sku_id": item.sku_id}
