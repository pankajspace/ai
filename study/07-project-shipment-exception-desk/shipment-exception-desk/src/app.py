"""FastAPI web server for Northwind Logistics Shipment Exception Desk.

Serves custom HTML, CSS, and JS web interface and provides REST APIs for:
- /api/triage: Processing exception reports through the LangChain pipeline
- /api/log: Fetching the session's Daily Triage Log
- /api/summary: Fetching the real aggregated Daily Summary
- /api/reset: Clearing the current session ledger
"""

import sys
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Ensure src directory is in sys.path
src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from pipeline import process_exception
from session import get_triage_log, generate_daily_summary, clear_session

app = FastAPI(
    title="Northwind Logistics Exception Desk",
    description="Automated triage and compensation calculation system",
    version="1.0.0",
)

# Static directory
static_dir = src_dir / "static"
if not static_dir.exists():
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


class TriageRequest(BaseModel):
    report_text: str = Field(..., description="Customer exception report text")
    shipment_value: float = Field(..., ge=0.0, description="Shipment monetary value in USD")
    customer_tier: str = Field("standard", description="Account tier: standard or premium")


@app.get("/")
@app.head("/")
async def index():
    """Serve the single-page HTML application."""
    index_file = static_dir / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="index.html not found.")
    return FileResponse(str(index_file))


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "exceptiondesk"}


@app.post("/api/triage")
async def triage_report(req: TriageRequest):
    """Process an incoming shipment exception report."""
    if not req.report_text.strip():
        raise HTTPException(status_code=400, detail="Report text cannot be empty.")

    try:
        result = process_exception(
            report_text=req.report_text.strip(),
            shipment_value=req.shipment_value,
            customer_tier=req.customer_tier,
            log_to_session=True,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/log")
async def fetch_log():
    """Return all exception records logged in the current session."""
    return get_triage_log()


@app.get("/api/summary")
async def fetch_summary():
    """Return real daily aggregation summary and KPI metrics."""
    return generate_daily_summary()


@app.post("/api/reset")
async def reset_session():
    """Clear session records."""
    clear_session()
    return {"status": "session_cleared"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8080))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
