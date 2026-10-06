# InterviewIQ — Instructor Class Script (2-Hour Session)

## Class objective
By the end of this session, learners will have built a tool-calling AI agent — InterviewIQ — that evaluates a candidate's interview answers using rule-based tools, tracks a running scorecard across a session using memory, aggregates that memory into a report that names a weakest area, answers meta-questions mid-session, and exposes all of it through a required Gradio interface. This is a deliberately harder, more complete build than a first agent project — appropriate six classes in — while still avoiding RAG, AWS, and MCP.

## Audience & prerequisites
Learners should already be comfortable with: making an LLM API call (Class 1), writing a basic tool-calling agent loop (Class 2), agents choosing between multiple tools (Class 3), and building a simple Gradio UI (Class 1/2). No new framework is introduced here — this project reuses the plain OpenAI-style tool-calling loop and Gradio's `Blocks` API so the focus stays on agent design, not new tooling.

## Setup before class
- Confirm every learner has a Groq API key (free) — https://console.groq.com. An OpenAI key is optional as a fallback, matching the PROVIDER pattern from Class 3.
- Distribute the `starter_kit/` folder ahead of time so nobody is downloading during class.
- Keep the `solution/` folder ready but hidden from screen-share until the reveal at the end.
- This class is tighter than a first-agent session — consider trimming live-coding narration on parts learners have already done before (the provider switch, the tool schema shape) to protect time for the new material (aggregation, meta-questions, the UI).

## Timing breakdown (120 minutes)

**00:00–00:10 — Kickoff & problem framing (10 min)**
- Frame the real-world hook: "Hiring teams get hundreds of interview transcripts. What if an agent could give first-pass feedback instantly — and let the candidate ask it how they're doing?"
- State the asks clearly (see `Problem_Statement_and_Milestones.md`), and be explicit that the Gradio UI is required this time, not a bonus.
- Show the target end state: open `app.py` in a browser, answer a few questions, ask the coach "what's my weakest area?", get a real answer, pull the final report.

**00:10–00:20 — Milestones 1 & 2: setup + first LLM call (10 min)**
- Walk through `starter_kit/README.md`: create a venv, `pip install -r requirements.txt` (now includes `gradio`), copy `.env.example` to `.env`, add `GROQ_API_KEY`.
- Sanity check: everyone gets a plain LLM response before moving on. Move quickly here — it's a repeat of earlier classes.

**00:20–00:40 — Milestones 3–5: build the three tools (20 min)**
- Live-code (or let learners code with hints) `detect_filler_words` in `tools.py`.
- Point out the one hard constraint: each tool now returns a **dict**, not a formatted string — because `generate_final_report` will need the raw numbers later to work out the weakest area.
- Repeat for `check_star_structure` and `score_relevance`. Checkpoint: test each function directly before wiring it to the agent.

**00:40–01:00 — Milestone 6: wire tools to the agent (20 min)**
- Walk through `agent.py`'s `TOOLS_SCHEMA` — same idea as Class 2, just four tools instead of one.
- New wrinkle vs earlier classes: since tools now return dicts, the tool-result message sent back to the model must be a JSON **string** — `json.dumps()` the dict first. This is a common bug source; flag it early.
- Run one full turn end-to-end via `main.py`.

**01:00–01:20 — Milestones 7–9: memory, aggregation, and meta-questions (20 min)**
- Introduce `session_log` as before, but this time `generate_final_report` needs to do real work: average relevance score, and finding the **weakest area** (lowest-scoring question) — not just listing every tool result flatly.
- Add `ask_agent` — a second entry point (alongside `run_turn`) for free-form questions like "how am I doing?" that reuses the same tools and memory. This is the piece that makes meta-questions possible mid-session, not just at the end.
- Key discussion point: why does this need its own function rather than reusing `run_turn`? (`run_turn` always evaluates a *specific answer to a specific question*; a meta-question isn't an answer to evaluate — it's a question *about* the session so far.)

**01:20–01:30 — Milestone 10: prove memory works (10 min)**
- Run `python memory_check.py` — a scripted session (one strong answer, one deliberately weak one, then a meta-question). If the agent correctly names the weak answer's question as the weakest area, memory and aggregation are genuinely working. If it names the most recent question regardless of which was weaker, that's a bug to fix before moving on.
- This is a good moment to have learners swap and run each other's `memory_check.py` as a mini peer-check.

**01:30–01:50 — Milestone 11: the Gradio interface (20 min)**
- The `gr.Blocks` layout in `app.py` is given; the four handler functions (`format_scorecard`, `on_submit`, `ask_coach`, `final_report`) are the learners' job, and every one of them should just call into the `agent.py` they already built — no new agent logic belongs in `app.py`.
- Demo the finished flow: answer a question, watch the scorecard update, ask the coach a meta-question, pull the final report — all in the browser.

**01:50–02:00 — Wrap-up, reveal solution, assign stretch goal (10 min)**
- Compare learner implementations against `solution/agent.py` and `solution/app.py`.
- Mention Ask 4: `interviewer_agent.py` / `run_multi_agent.py` are already included, fully worked -- a second "Interviewer" agent handed off to the Evaluator by a small orchestrator. This is a deliberate exception: none of the six classes built multi-agent hands-on, so frame it explicitly as "beyond what we've covered, but here it is running" rather than something to grade. If time allows, run `python run_multi_agent.py` live; otherwise point learners to it as a take-home read.
- Q&A.

## Common pitfalls & FAQs
- **"The model errors on the tool result message."** Tool message `content` must be a string — `json.dumps()` your dict before sending it back.
- **"My final report always says the most recent question is weakest."** The aggregation is probably re-deriving from the last tool call instead of scanning the full `session_log`. Point them at `memory_check.py` — it's designed to catch exactly this.
- **"`ask_agent` doesn't call `generate_final_report`."** Check the system prompt reaches this code path too — if `ask_agent` builds its own `messages` list, make sure it still includes `SYSTEM_PROMPT` and `TOOLS_SCHEMA`.
- **"My Gradio app doesn't update the scorecard."** `on_submit`'s outputs list order must exactly match the values it returns — double-check both against the `submit_btn.click(...)` wiring in `app.py`.
- **"Groq gives a model-not-found error."** Model IDs change over time; point learners to console.groq.com for the current ID.

## Instructor delivery notes
- Live-code where possible; use the `starter_kit` for on-screen coding and the `solution` folder only for verification and the final reveal.
- This class has less slack than a first-agent session — if a group is behind by milestone 9, it's better to let them finish `memory_check.py` for homework and see the Gradio wrap-up live than to rush the aggregation logic.
