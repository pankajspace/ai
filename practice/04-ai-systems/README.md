# AI Systems Practice

Sequential progression covering fundamental prompting strategies, multi-turn behavioral vulnerabilities, and multi-judge dispute resolution.

## 1. Set up API keys

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # configure OPENAI_API_KEY (and optional GEMINI_API_KEY / GROQ_API_KEY for 03)
```

## 2. Run with Docker Compose (Recommended)

From the `practice/04-ai-systems` folder:

```bash
# Run Strategy benchmark
docker compose run --rm 01_prompting_strategies

# Run Sycophancy benchmark
docker compose run --rm 02_sycophancy_trap

# Run Refund Bench pipeline
docker compose run --rm 03_refund_bench
```

Key features:
1. All services share the same Docker image (`practice-04-ai-systems`) built from the common `Dockerfile` and `requirements.txt`.
2. Automatically reads the shared `.env` file.
3. Mounts each `.py` script directly so code edits take effect immediately without rebuilding the image.
4. To rebuild after dependency changes, pass `--build`:
   ```bash
   docker compose run --rm --build 01_prompting_strategies
   ```

## 3. Run with Docker directly

From the `practice/04-ai-systems` folder:

```bash
docker build -t practice-04-ai-systems .
docker run --rm --env-file .env practice-04-ai-systems python 01_prompting_strategies.py
```

## 4. Run locally (without Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_prompting_strategies.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The inputs live in step 2 (**"Sample Inputs"**) near the top of each `.py` script: a default configuration plus commented-out alternatives. To test a different scenario, change the value or uncomment another option, then run again:

```python
# Option 1: Full benchmark suite (default)
BENCHMARK_DATA = [ ... ]

# Option 2: Quick single test - transaction calculation
# BENCHMARK_DATA = [ { "question": "...", "answer": ["293"] } ]
```

In `02_sycophancy_trap.py`, you can also adjust `RUNS_PER_CASE` from 3 to 1 (for a quick pass) or 5 (for a thorough distribution test). In `03_refund_bench.py`, you can switch `SELECTED_BENCH` (`single`, `openai3`, `mixed3`, `mixed5`), `SELECTED_CAP`, and `COMPLAINT_INPUT`.

## 6. Scripts Overview

1. `01_prompting_strategies.py`: Evaluates Direct prompting vs. Zero-Shot Chain-of-Thought (CoT) vs. Few-Shot CoT on multi-step reasoning, measuring accuracy gains against token cost.
2. `02_sycophancy_trap.py`: Evaluates model capitulation under multi-turn user pressure, math gaslighting, authority pushback in code review, and emotional appeals.
3. `03_refund_bench.py`: Implements the 4-stage Refund Bench food dispute resolution pipeline (Evidence Snapshot, Grievance Extraction, Multi-Judge Voting Bench across OpenAI/Gemini/Groq, and Code-Driven Settlement).
