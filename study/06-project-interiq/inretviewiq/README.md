# InterviewIQ -- Starter Kit

## Setup
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then paste your GROQ_API_KEY inside
```
Get a free Groq key at https://console.groq.com

## Running in Browser
Start the FastAPI web server:
```bash
python app.py
```
Then open your browser and navigate to:
```
http://localhost:7860
```
The app serves a custom dark-theme single-page interface at that URL.

> **Note:** The server binds to `0.0.0.0:7860` by default. If port 7860 is already in use, you can launch uvicorn directly on a different port:
> ```bash
> uvicorn app:app --host 0.0.0.0 --port 8000 --reload
> ```
> then visit `http://localhost:8000`.

Available API endpoints (useful for testing independently):
1. `GET  /api/questions` — fetch all interview questions
2. `POST /api/evaluate`  — submit an answer for evaluation
3. `POST /api/coach`     — ask a meta-question mid-session
4. `GET  /api/scorecard` — live session scorecard and weakest area
5. `GET  /api/report`    — final aggregated performance report
6. `POST /api/reset`     — reset the current session

## What to do
Read `Problem_Statement_and_Milestones.md` (in the project root, one level
up) for the full problem statement and the asks. In short:
1. `tools.py` -- implement the three evaluation functions (each returns a dict).
2. `agent.py` -- wire those tools into a tool-calling agent, add session
   memory, and build a final report that names the weakest area, not just
   a flat recap. Add `ask_agent` so meta-questions ("how am I doing?") work
   mid-session, not only at the end.
3. Check your memory actually works:
```bash
python memory_check.py
```
4. `app.py` -- wrap it all in the (mandatory) Gradio interface.
5. (Optional, ungraded) `python run_multi_agent.py` -- a bonus two-agent version, given fully worked. Read `interviewer_agent.py` to see how a second, specialized agent gets handed off to your Evaluator.

This is an intermediate-level project: the setup, the tool "menu", the
Gradio layout, and the test harnesses (`main.py`, `memory_check.py`) are
given. The tool logic, the agent loop, the memory/aggregation design, and
the UI's event handlers are yours to build.

## Files
| File | What it is |
|---|---|
| `interview_bank.py` | Sample interview questions + expected keywords. Given -- add your own if you like. |
| `tools.py` | **Your task.** Three evaluation functions. |
| `agent.py` | **Your task.** The tool-calling agent, session memory, weakest-area report, and the meta-question entry point. |
| `app.py` | **Your task.** Gradio interface -- required, not optional. Layout is given; the handler functions are yours. |
| `main.py` | CLI runner. Given -- handy for quick terminal testing while you build. |
| `memory_check.py` | Given -- a scripted mini-session that checks your memory/aggregation actually works. Run it once Ask 1 and Ask 2 are done. |
| `requirements.txt` | Python packages needed (`pip install -r requirements.txt`). |
| `.env.example` | Copy to `.env` and add your API key. Never commit the real `.env`. |
| `.gitignore` | Keeps your venv, `.env`, and cache files out of git. |
| `interviewer_agent.py`, `run_multi_agent.py` | Optional bonus, given fully worked (not a TODO) -- a second "Interviewer" agent + a small orchestrator, since multi-agent wasn't actually taught hands-on in these classes. Run `python run_multi_agent.py`. Nothing to build here unless you want to extend it. |
