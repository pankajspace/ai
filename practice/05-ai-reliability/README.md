# AI Reliability Practice

A sequential suite measuring reliability levers across prompt designs, structured output constraints, tool schemas, and error handling.

## Progression (Easy to Hard)

1. `01_cot_vs_direct`: Demonstrates that Chain-of-Thought (step-by-step reasoning) is a reliability lever for multi-step tasks, benchmarking accuracy and latency trade-offs against direct answers.
2. `02_variance_determinism`: Evaluates output consistency and schema adherence across 15 iterations under Unconstrained, Prompt-Constrained, and API Schema-Enforced modes.
3. `03_tool_schema_calibration`: Evaluates whether LLMs route on tool function names versus docstring descriptions using a 2x2 matrix (Descriptive/Opaque names x Loose/Tight descriptions).
4. `04_tool_error_injection`: Simulates upstream API failures (HTTP 503) to test agent transparency, error propagation, and hallucinated data prevention across different prompt instructions.

## 1. Set up API keys

Each project has its own `.env` file inside its directory.

To set up keys:

```bash
cd 01_cot_vs_direct
cp .env.example .env    # configure OPENAI_API_KEY
```

## 2. Run with Docker Compose (Recommended)

From the `practice/05-ai-reliability` root folder:

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
1. Automatically loads the corresponding `.env` file.
2. Mounts `main.py` directly into the container so your code changes take effect immediately without rebuilding the image.
3. To rebuild after dependency updates, pass `--build`:
   ```bash
   docker compose run --rm --build 01_cot_vs_direct
   ```

## 3. Run with Docker directly

From inside any project folder:

```bash
cd 01_cot_vs_direct
docker build -t 01_cot_vs_direct .
docker run --rm --env-file .env 01_cot_vs_direct
```

## 4. Run locally (without Docker)

```bash
cd 01_cot_vs_direct
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

