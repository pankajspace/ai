# AI Systems Practice

Sequential progression covering fundamental prompting strategies and multi-turn behavioral vulnerabilities.

## 1. Set up API keys

Each project has its own `.env` file inside its directory.

To set up keys:

```bash
cd 01_prompting_strategies
cp .env.example .env    # configure OPENAI_API_KEY
```

## 2. Run with Docker Compose (Recommended)

From the `practice/04-ai-systems` root folder:

```bash
# Run Strategy benchmark
docker compose run --rm 01_prompting_strategies

# Run Sycophancy benchmark
docker compose run --rm 02_sycophancy_trap

# Run Refund Bench pipeline
docker compose run --rm 03_refund_bench
```

Key features:
1. Automatically reads the corresponding `.env` file.
2. Mounts `main.py` directly so code edits take effect immediately without rebuilding the image.
3. To rebuild after dependency changes, pass `--build`:
   ```bash
   docker compose run --rm --build 01_prompting_strategies
   ```

## 3. Run with Docker directly

From inside any project folder:

```bash
cd 01_prompting_strategies
docker build -t 01_prompting_strategies .
docker run --rm --env-file .env 01_prompting_strategies
```

## 4. Run locally (without Docker)

```bash
cd 01_prompting_strategies
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Locally, each script finds `.env` directly in its own folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

The inputs live in step 2 (**"Inputs"**) near the top of `main.py`: a default configuration plus commented-out alternatives. To test a different scenario, change the value or uncomment another option, then run again:

```python
# Option 1: Full benchmark suite (default)
BENCHMARK_DATA = [ ... ]

# Option 2: Quick single test - transaction calculation
# BENCHMARK_DATA = [ { "question": "...", "answer": ["293"] } ]
```

In `02_sycophancy_trap`, you can also adjust `RUNS_PER_CASE` from 3 to 1 (for a quick pass) or 5 (for a thorough distribution test). In `03_refund_bench`, you can switch `SELECTED_BENCH` (`single`, `openai3`, `mixed3`, `mixed5`), `SELECTED_CAP`, and `COMPLAINT_INPUT`.

## 6. Directory Overview

1. `01_prompting_strategies`: Evaluates Direct prompting vs. Zero-Shot Chain-of-Thought (CoT) vs. Few-Shot CoT on multi-step reasoning, measuring accuracy gains against token cost.
2. `02_sycophancy_trap`: Evaluates model capitulation under multi-turn user pressure, math gaslighting, authority pushback in code review, and emotional appeals.
3. `03_refund_bench`: Implements the 4-stage Refund Bench food dispute resolution pipeline (Evidence Snapshot, Grievance Extraction, Multi-Judge Voting Bench across OpenAI/Gemini/Groq, and Code-Driven Settlement).
