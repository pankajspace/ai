# AI Reliability Practice

A sequential suite measuring reliability levers across prompt designs, structured output constraints, tool schemas, and error handling.

## 1. Set up API keys

All scripts in this folder share a single `.env` file and `requirements.txt`. All `.env` files are gitignored.

To set up your keys:

```bash
cp .env.example .env    # configure OPENAI_API_KEY
```

## 2. Run with Docker Compose (Recommended)

From the `practice/05-ai-reliability` folder:

```bash
# 1. CoT vs Direct comparison
docker compose run --rm 01_cot_vs_direct

# 2. Output variance and determinism benchmark
docker compose run --rm 02_variance_determinism

# 3. Tool schema routing calibration
docker compose run --rm 03_tool_schema_calibration

# 4. Tool error injection and transparency
docker compose run --rm 04_tool_error_injection
```

Key features:
1. All services share the same Docker image (`practice-05-ai-reliability`) built from the common `Dockerfile` and `requirements.txt`.
2. Automatically loads the shared `.env` file.
3. Mounts each `.py` script directly into the container so your code changes take effect immediately without rebuilding the image.
4. To rebuild after dependency updates, pass `--build`:
   ```bash
   docker compose run --rm --build 01_cot_vs_direct
   ```

## 3. Run with Docker directly

From the `practice/05-ai-reliability` folder:

```bash
docker build -t practice-05-ai-reliability .
docker run --rm --env-file .env practice-05-ai-reliability python 01_cot_vs_direct.py
```

## 4. Run locally (without Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python 01_cot_vs_direct.py
```

Locally, each script finds `.env` directly in this folder (`find_dotenv()` checks the current directory first).

## 5. Trying different inputs

Every input lives in step 2 (**"Sample Inputs"**) near the top of each `.py` script: a default configuration plus commented-out samples. To try different inputs or scenarios, change the value or uncomment another option, then run again:

```python
# Option 1: Smartphone review (default)
base_review = (
    "The new smartphone is amazing, the camera quality is top-notch but the "
    "battery life is a bit disappointing. I love the design though!"
)

# Option 2: Laptop review with mixed performance
# base_review = (
#     "The laptop has blazing performance and great build quality, but the "
#     "trackpad feels sticky and the battery lasts only 3 hours under load."
# )
```

In `01_cot_vs_direct.py` and `02_variance_determinism.py`, you can also adjust iteration counts (`RUNS_PER_PROBLEM` / `ITERATIONS`). In `03_tool_schema_calibration.py`, you can select the full 50-query suite or a rapid 6-query test subset. In `04_tool_error_injection.py`, you can switch `QUESTION` across different multi-city combinations.

## 6. Scripts Overview

1. `01_cot_vs_direct.py`: Demonstrates that Chain-of-Thought (step-by-step reasoning) is a reliability lever for multi-step tasks, benchmarking accuracy and latency trade-offs against direct answers.
2. `02_variance_determinism.py`: Evaluates output consistency and schema adherence across 15 iterations under Unconstrained, Prompt-Constrained, and API Schema-Enforced modes.
3. `03_tool_schema_calibration.py`: Evaluates whether LLMs route on tool function names versus docstring descriptions using a 2x2 matrix (Descriptive/Opaque names x Loose/Tight descriptions).
4. `04_tool_error_injection.py`: Simulates upstream API failures (HTTP 503) to test agent transparency, error propagation, and hallucinated data prevention across different prompt instructions.
