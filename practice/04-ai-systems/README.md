# AI Systems Practice

Sequential progression covering fundamental prompting strategies and multi-turn behavioral vulnerabilities.

## Progression (Easy to Hard)

1. `01_prompting_strategies`: Evaluates Direct prompting vs. Zero-Shot Chain-of-Thought (CoT) vs. Few-Shot CoT, measuring both accuracy gains and token cost overhead.
2. `02_sycophancy_trap`: Evaluates model resistance to conversational pressure, gaslighting, and authority-based pushback across escalating rounds.

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

