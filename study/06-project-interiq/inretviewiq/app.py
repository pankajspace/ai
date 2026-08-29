"""InterviewIQ Web Application Server.

FastAPI application serving the custom dark-theme HTML/CSS/JS frontend
and providing REST API endpoints for evaluation, session memory, meta-Q&A coaching,
and aggregated assessment reports.
"""

from __future__ import annotations

import os
from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from agent import EvaluatorAgent, InterviewSessionMemory
from interview_bank import QUESTIONS, get_all_questions, get_question_by_id

# Initialize state
session_memory = InterviewSessionMemory()
agent = EvaluatorAgent(memory=session_memory)

app = FastAPI(title="InterviewIQ - AI Mock Interview Coach")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")


class EvaluateRequest(BaseModel):
    question_id: int
    answer: str


class CoachRequest(BaseModel):
    query: str


@app.get("/")
async def get_index():
    """Serve the single-page HTML application."""
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="index.html not found in static/")


@app.get("/api/questions")
async def get_questions():
    """Retrieve all questions from the question bank."""
    return get_all_questions()


@app.post("/api/evaluate")
async def evaluate_answer(payload: EvaluateRequest):
    """Evaluate candidate's answer using the tool-calling agent."""
    q_data = get_question_by_id(payload.question_id)
    if not q_data:
        raise HTTPException(status_code=404, detail=f"Question ID {payload.question_id} not found")

    result = agent.evaluate_answer(q_data, payload.answer)
    return result


@app.post("/api/coach")
async def ask_coach(payload: CoachRequest):
    """Handle candidate meta-questions mid-session using session memory."""
    response = agent.ask_agent(payload.query)
    return {"response": response}


@app.get("/api/scorecard")
async def get_scorecard():
    """Return live session scorecard and running average."""
    return {
        "scorecard": session_memory.get_scorecard(),
        "average_relevance": session_memory.get_average_relevance(),
        "total_questions": session_memory.get_total_questions(),
        "weakest_area": session_memory.get_weakest_area(),
    }


@app.get("/api/report")
async def get_final_report():
    """Generate final aggregated performance report."""
    return session_memory.generate_final_report()


@app.post("/api/reset")
async def reset_session():
    """Reset session memory."""
    session_memory.reset()
    return {"status": "ok", "message": "Session reset successfully."}


if __name__ == "__main__":
    print("🚀 Starting InterviewIQ Dark Theme Server on http://0.0.0.0:7860 ...")
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=False)
