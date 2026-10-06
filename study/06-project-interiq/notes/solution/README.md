# InterviewIQ -- Solution (Instructor Reference)

This folder is the fully-worked reference implementation. Use it to:
- Verify learner implementations during/after class.
- Do the final reveal and walkthrough in the last part of class.
- Demo a full run if a group gets stuck.

## Setup (same as starter_kit)
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then paste your GROQ_API_KEY inside
```

## Ways to run it
```bash
python main.py            # CLI walkthrough
python memory_check.py    # scripted memory/aggregation check -- see below
python app.py              # the required Gradio interface, opens in your browser
python run_multi_agent.py  # optional bonus: two-agent (Interviewer + Evaluator) mode
```
See `sample_session_output.txt` for an example transcript (CLI run + the
memory_check.py meta-question) without needing to run anything live.

## Files
| File | What it is |
|---|---|
| `interview_bank.py` | Sample interview questions + expected keywords. |
| `tools.py` | Fully implemented: `detect_filler_words`, `check_star_structure`, `score_relevance` -- each returns a dict. |
| `agent.py` | Fully implemented tool-calling agent: session memory, a final report that aggregates and names the weakest area, and `ask_agent` for free-form meta-questions. |
| `main.py` | CLI runner. |
| `memory_check.py` | Scripted mini-session (one strong answer, one weak one, then a meta-question) that proves memory/aggregation is working -- the weakest area named should be the weak answer's question, not the most recent one. |
| `app.py` | The Gradio interface -- question flow, live scorecard, an "ask the coach" box for meta-questions, and a final-report button. |
| `sample_session_output.txt` | Example run transcript, for reference/demo without live API calls. |
| `interviewer_agent.py`, `run_multi_agent.py` | Optional bonus: a second "Interviewer" agent that picks the next question's category, handed off to the (unchanged) Evaluator agent by a small orchestrator loop. Goes beyond what was taught hands-on -- Class 6's guide only introduces multi-agent as vocabulary -- so it's included as a runnable, fully-worked extra, not a graded ask. |
| `requirements.txt`, `.env.example`, `.gitignore` | Same as starter_kit -- see the root `Problem_Statement_and_Milestones.md` for what each one does. |

## Notes for the instructor
- The core project (Asks 1-3) is a single agent, framework-light (plain OpenAI-style tool calling), but intentionally more involved than a first agent project: tools return structured data, the final report does real aggregation (average relevance, weakest area by lowest score), memory has to answer meta-questions mid-session (not just print a static end-of-session dump), and the Gradio UI is a required deliverable rather than a bonus.
- It intentionally does **not** use RAG, AWS/Bedrock, or MCP.
- `interviewer_agent.py` / `run_multi_agent.py` (Ask 4) are the one deliberate exception to "everything traces back to a class you covered": none of the six classes built a multi-agent system hands-on, so this is included fully worked and explicitly ungraded -- a light, honest taste of the next topic rather than a test of something never taught.
