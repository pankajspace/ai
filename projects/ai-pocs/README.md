# AI POCs: Multi-Container Suite of 31 AI Services

A unified, modular full-stack application hosting 31 production-grade AI services across 5 sequential practice domains using FastAPI, React + Vite, and Docker Compose.

Each interactive card in the React dashboard features a green `ⓘ` icon in its header linking to a dedicated `info/<demo>.html` explainer page under `client/public/info/` with two units: Unit 1 (Concept, Theory & Concepts, end-to-end Request Flow, and Mermaid `flowchart TD` Code Flow) and Unit 2 (complete, unedited Python source code).

---

## Architecture

1. **Multi-Container Orchestration**: Docker Compose orchestrates an isolated FastAPI backend (`ai-pocs-server` on port `8000`) and a React + Vite single-page application (`ai-pocs-client` on container port `5173`, mapped locally to `8091` and `5173`, and on EC2 to `5010`).
2. **Service Modularity**: Each service in `server/services/` is self-contained with Pydantic schemas, typed handlers, circled numeral step comments (`# ①`, `# ②`, ...), and a standalone CLI entrypoint (`python services/<filename>.py`). Each service keeps only the code its practice topic teaches (one provider, no fallbacks), mirroring the matching `practice/` script.
3. **Path-Prefix & Reverse Proxy Routing**: In production behind Nginx at `https://app.techtoday.click/ai-pocs/`, `VITE_BASE_PATH=/ai-pocs/` and `VITE_SERVER_URL=/ai-pocs` serve all frontend assets and explainer pages under `/ai-pocs/`, while Vite proxies `/ai-pocs/api/*` and `/ai-pocs/health` over the internal Docker Compose network to `http://server:8000`. The client image runs `npm run build` at image build time and serves the minified bundle with `vite preview`; local `docker compose` overrides this with the `npm run dev` hot-reload server. Never run the dev server in production — it ships the unbundled ~3 MB development build of React and makes the landing page take 15–20 s to load.

```text
Browser ──HTTPS (/ai-pocs/)──▶ Nginx (5010, gzip) ──▶ ai-pocs-client (vite preview :5173)
                                                     ├── Static UI & info/*.html
                                                     └── Proxy /ai-pocs/api/* ──▶ ai-pocs-server (FastAPI :8000)
                                                                                       └── 31 AI Services (OpenAI, Groq, Bedrock, FastMCP)
```

---

## Sequential Domain Overview (31 Services)

### Domain 1: AI Basics & LangChain (Services 01 - 10)

1. `01_chat_openai` (`info/travel-guide.html`): Direct OpenAI Chat Completion service providing travel suggestions.
2. `02_chat_groq` (`info/joke-generator.html`): High-throughput Groq LLM service generating domain jokes.
3. `03_langchain_summarizer` (`info/summarizer.html`): Text summarization service built using LangChain Expression Language (LCEL).
4. `04_langchain_memory_chat` (`info/memory-chat.html`): Multi-turn conversational memory retaining dialogue history.
5. `05_agent_one_tool` (`info/agent-one-tool.html`): Raw OpenAI tool-calling loop with one local tool (`get_price`).
6. `06_langchain_one_tool` (`info/langchain-one-tool.html`): LangChain `create_agent` on Groq with one tool (`get_weather`).
7. `07_langchain_multi_tools` (`info/multi-tool-agent.html`): LangChain agent on Groq choosing between `get_weather`, `add`, `multiply`, and `get_population`.
8. `08_chunking` (`info/chunking.html`): Document splitting service using overlapping sliding windows.
9. `09_embedding` (`info/embedding.html`): Sentence transformer vector embedding and cosine similarity service (`all-MiniLM-L6-v2`).
10. `10_rag` (`info/rag.html`): Paragraph Q&A pipeline: chunk, embed into an in-memory Chroma store, retrieve the top chunks, and answer from them with OpenAI.

### Domain 2: AWS Strands & Agent Workflows (Services 11 - 22)

11. `11_hello_world_agent` (`info/hello-world-agent.html`): Minimal Strands `Agent` on Amazon Bedrock (Nova Lite) answering one prompt.
12. `12_hello_world_langgraph` (`info/langgraph-agent.html`): LangGraph `create_react_agent` on Bedrock Converse calling `greet` once per name.
13. `13_function_to_tool` (`info/function-to-tool.html`): Turning standard Python HTTP health-check functions into tools (`check_server_status`).
14. `14_tip_calculator` (`info/tip-calculator.html`): Natural-language dining bill and tip calculation agent (`calculate_tip`).
15. `15_multi_tool_sales` (`info/multi-tool-sales.html`): Autonomous sales operations planner executing `get_sales_data` -> `analyze_sales` -> `send_email`.
16. `16_custom_tool_inventory` (`info/custom-inventory.html`): Custom `@tool` wrapping a mock stock table (`check_inventory`).
17. `17_prebuilt_tools` (`info/prebuilt-calculator.html`): Math assistant using the prebuilt `strands_tools.calculator` and a system prompt.
18. `18_multi_prebuilt_tools` (`info/multi-prebuilt-tools.html`): Chained data pipeline combining the prebuilt `http_request` and `calculator`; the summary is shown in the UI instead of being saved with `file_write` as in practice.
19. `19_use_aws` (`info/use-aws.html`): Natural language AWS assistant using the prebuilt `use_aws` tool against the real account (give its credentials read-only permissions).
20. `20_class_based_tools` (`info/class-based-tools.html`): Class-based tools (`InventoryTools`: `check_stock`, `update_stock`) sharing instance state across requests.
21. `21_async_tools` (`info/async-tools.html`): Async Strands tool run with `agent.invoke_async`, so three 2-second warehouse lookups run in parallel.
22. `22_travel_assistant` (`info/travel-assistant.html`): Capstone multi-tool planner chaining `get_weather_forecast`, `suggest_packing_list`, `estimate_trip_cost`, and `calculator`.

### Domain 3: AI Systems & Prompting (Services 23 - 24)

23. `23_prompting_strategies` (`info/prompting-strategies.html`): Benchmark measuring Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning questions.
24. `24_sycophancy_trap` (`info/sycophancy-trap.html`): Multi-turn pushback evaluator testing model resilience against gaslighting and authority pressure.

### Domain 4: AI Reliability & Calibration (Services 25 - 28)

25. `25_cot_vs_direct` (`info/cot-vs-direct.html`): Side-by-side reliability benchmark measuring CoT gains on complex state-tracking logic puzzles.
26. `26_variance_determinism` (`info/variance-determinism.html`): Evaluates output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced JSON modes.
27. `27_tool_schema_calibration` (`info/tool-schema-calibration.html`): Measures model routing sensitivity between tool names and docstrings via a 2x2 calibration matrix.
28. `28_tool_error_injection` (`info/tool-error-injection.html`): Simulates upstream API outages (HTTP 503) to test error transparency and hallucination prevention.

### Domain 5: Model Context Protocol & Evals (Services 29 - 31)

29. `29_mcp_client` (`info/mcp-client.html`): MCP client that starts `cricket_server.py` over stdio and runs the handshake, tool discovery, and a direct tool call without an LLM.
30. `30_mcp_agent` (`info/mcp-agent.html`): Groq LLM agent that discovers the MCP server's tools and calls them over stdio.
31. `31_mcp_evals` (`info/mcp-evals.html`): 5-case eval suite that runs the service 30 agent and asserts tool routing and ground-truth facts.

---

## Project Details

1. **Project type**: Multi-container app (React + Vite frontend + FastAPI backend + Docker Compose).
2. **Project folder**: `projects/ai-pocs/`.
3. **Local Web URL**: http://localhost:8091 (also accessible at http://localhost:5173).
4. **Local API & Swagger URL**: http://localhost:8000 and http://localhost:8000/docs.
5. **Production URL**: https://app.techtoday.click/ai-pocs/.
6. **Local ports**: `8091` and `5173` → `client` container `5173`; `8000` → `server` container `8000`.
7. **EC2 host port**: `5010` → `client` container `5173` (which proxies `/ai-pocs/api/*` to `server:8000` internally).
8. **ECR repositories**: `techtoday/ai-pocs-client` and `techtoday/ai-pocs-server`.
9. **Production service names**: `client` (`ai-pocs-client`) and `server` (`ai-pocs-server`).
10. **Production Compose file**: `~/apps/ai-pocs/docker-compose.yml`.
11. **Path prefix**: `/ai-pocs` (`VITE_BASE_PATH=/ai-pocs/`, `VITE_SERVER_URL=/ai-pocs`).
12. **Workflow file**: `.github/workflows/deploy-ai-pocs.yml`.
13. **Trigger paths**: `projects/ai-pocs/**` and `.github/workflows/deploy-ai-pocs.yml`.

### Routes

1. `GET /` — serves the React dashboard (`client`) or FastAPI status JSON (`server`).
2. `GET /health` — FastAPI healthcheck returning `{"status": "healthy", "total_services": 31}`.
3. `GET /info/<demo>.html` — serves the 31 explainer pages from `client/public/info/`, along with `client/public/css/info.css` and `client/public/js/info.js`.
4. `POST /api/travel` — OpenAI travel suggestion (`{"city": "Bangalore"}`).
5. `POST /api/joke` — Groq joke generator (`{"topic": "programming"}`).
6. `POST /api/summarize` — LangChain LCEL summarizer (`{"text": "..."}`).
7. `POST /api/memory-chat` — Multi-turn memory chat (`{"message": "...", "history": [...]}`).
8. `POST /api/agent` — Single-tool price agent (`{"message": "How much are the shoes?"}`).
9. `POST /api/langchain-one-tool` — LangChain weather agent (`{"message": "..."}`).
10. `POST /api/multi-tool-agent` — LangChain multi-tool agent (`{"message": "..."}`).
11. `POST /api/chunk` — Sliding-window document chunker (`{"text": "...", "chunk_size": 120, "chunk_overlap": 30}`).
12. `POST /api/embedding` — Sentence embedding cosine similarity (`{"text1": "...", "text2": "..."}`).
13. `POST /api/rag` — 4-stage RAG Q&A (`{"paragraph": "...", "question": "..."}`).
14. `POST /api/hello-world-agent` — AWS Strands single-turn agent (`{"prompt": "..."}`).
15. `POST /api/langgraph-agent` — LangGraph ReAct greeting agent (`{"prompt": "..."}`).
16. `POST /api/function-to-tool` — HTTP healthcheck function tool (`{"question": "..."}`).
17. `POST /api/tip-calculator` — Dining bill and tip calculator agent (`{"query": "..."}`).
18. `POST /api/multi-tool-sales` — 3-tool sales pipeline agent (`{"task": "..."}`).
19. `POST /api/custom-inventory` — Custom `@tool` inventory lookup (`{"question": "..."}`).
20. `POST /api/prebuilt-calculator` — Prebuilt `strands_tools.calculator` math agent (`{"query": "..."}`).
21. `POST /api/multi-prebuilt-tools` — Chained HTTP fetch and calculator pipeline (`{"task": "..."}`).
22. `POST /api/use-aws` — `use_aws` AWS assistant (real API calls; use read-only credentials) (`{"prompt": "..."}`).
23. `POST /api/class-based-tools` — Stateful class-based inventory tools (`{"query": "..."}`).
24. `POST /api/async-tools` — Parallel async warehouse lookups via `agent.invoke_async` (`{"query": "..."}`).
25. `POST /api/travel-assistant` — 5-tool capstone travel planner (`{"query": "..."}`).
26. `POST /api/prompting-strategies` — Direct vs Zero-Shot CoT vs Few-Shot CoT (`{"question": "...", "expected_answer": "293"}`).
27. `POST /api/sycophancy-trap` — Multi-turn pushback resilience benchmark (`{"case_type": "Math Gaslight", "custom_question": "..."}`; `custom_question` is optional).
28. `POST /api/cot-vs-direct` — CoT vs Direct puzzle benchmark (`{"problem_title": "Spatial Navigation (Grid)", "custom_question": "..."}`; `custom_question` is optional).
29. `POST /api/variance-determinism` — Unconstrained vs Prompt-Constrained vs Schema-Enforced JSON (`{"review_text": "..."}`).
30. `POST /api/tool-schema-calibration` — 2x2 tool name vs docstring routing calibration (`{"query": "..."}`).
31. `POST /api/tool-error-injection` — HTTP 503 error injection and hallucination test (`{"question": "..."}`).
32. `POST /api/mcp-client` — Direct FastMCP tool invocation without an LLM (`{"tool_name": "get_live_score", "tool_args": {...}}`).
33. `POST /api/mcp-agent` — LLM-guided FastMCP cricket agent (`{"question": "..."}`).
34. `POST /api/mcp-evals` — Automated assertion eval suite for the FastMCP agent (no request body needed).

### Project Structure

```text
projects/ai-pocs/
├── docker-compose.yml          # Multi-container orchestration (client + server + healthchecks)
├── deploy.yml.template         # Source template for .github/workflows/deploy-ai-pocs.yml
├── .env.example                # Environment variable template
├── .gitignore                  # Ignores .env, node_modules, dist, __pycache__, .DS_Store
├── README.md                   # Self-contained project runbook
├── client/
│   ├── Dockerfile              # Node 20 Alpine image: builds the bundle, serves it with vite preview
│   ├── package.json            # React 19 + Vite + TypeScript dependencies
│   ├── vite.config.ts          # Base path, allowedHosts, and /api + /ai-pocs/api proxy rules
│   ├── index.html              # SPA HTML shell
│   ├── public/
│   │   ├── css/info.css        # Shared explainer page stylesheet
│   │   ├── js/info.js          # Shared explainer page scripts (accordions, copy, Mermaid)
│   │   └── info/               # 31 "How it works" explainer HTML pages (one per demo card)
│   └── src/
│       ├── App.tsx             # Category tabs and 31 service cards across 5 domains
│       ├── App.css             # Component and layout styles
│       ├── config.ts           # Runtime API_BASE resolution
│       └── components/         # 31 interactive React card components
└── server/
    ├── Dockerfile              # Python 3.12-slim + uv + CPU PyTorch + FastAPI Uvicorn
    ├── requirements.txt        # FastAPI, OpenAI, LangChain, LangGraph, Strands, SentenceTransformers, MCP
    ├── main.py                 # FastAPI app, CORS, healthcheck, and 31 POST routes
    └── services/
        ├── __init__.py         # Dynamic service loader and schema exports
        ├── 01_chat_openai.py .. 31_mcp_evals.py  # 31 modular AI service implementations
        └── cricket_server.py                     # FastMCP stdio server started by services 29-31
```

---

## Environment Variables

1. **`OPENAI_API_KEY`** (required) — OpenAI API key used by the OpenAI and LangChain services (`01`, `03`–`05`, `10`) and the benchmarks (`23`–`28`). Obtain from https://platform.openai.com/api-keys.
2. **`GROQ_API_KEY`** (optional) — Groq API key used by the Joke Generator (`02`), the LangChain agents (`06`, `07`), and the MCP agent and evals (`30`, `31`). Obtain from https://console.groq.com/keys.
3. **`GEMINI_API_KEY`** (optional) — Google Gemini API key for Gemini-compatible endpoints. Obtain from https://aistudio.google.com/app/apikey.
4. **`AWS_ACCESS_KEY_ID`**, **`AWS_SECRET_ACCESS_KEY`**, **`AWS_DEFAULT_REGION`** (required for `11`–`22`) — AWS credentials for Amazon Bedrock (Nova Lite), used by the Strands and LangGraph services (`11`–`22`). There is no fallback: without Bedrock access those tiles return an error. When the variables are empty, boto3 uses the next credential source (the EC2 instance role in production, or `~/.aws` when you run the server outside Docker); the local Compose container has no `~/.aws`, so set the keys in `.env` for local Docker runs. The identity needs `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` on the Nova Lite model; because `19_use_aws` can call any AWS API with it, keep everything else read-only (`use_aws` asks for confirmation before mutating calls and secret reads such as `secretsmanager.get_secret_value`, and the server refuses those prompts because it has no terminal). **In production, do not add AWS keys to `techtoday/secrets`**: that secret is copied into every project's env file, so the keys would replace the instance role in every container. Like `projects/aws-strands`, production uses the EC2 instance role (`ec2-techtoday-server-role`), which must grant the Bedrock actions above.
5. **`VITE_BASE_PATH`** (optional) — Frontend base URL path; defaults to `/` locally and `/ai-pocs/` in production. Also a client Docker build arg (default `/ai-pocs/`) because it is baked into the production bundle.
6. **`VITE_SERVER_URL`** (optional) — Browser API base URL; defaults to `http://localhost:8000` in local Compose and `/ai-pocs` in production. Also a client Docker build arg (default `/ai-pocs`).
7. `.env` is gitignored and must never be committed.

---

## Prerequisites and First Run

Complete the one-time prerequisites in [../SETUP.md](../SETUP.md), then ensure Docker is running:

1. **macOS or Windows**: Start **Docker Desktop** and wait until it is running, then verify with `docker info`.
2. **Linux**: Run `sudo systemctl start docker`, then verify with `docker info`.

Build and start the stack from `projects/ai-pocs/`:

```bash
cd projects/ai-pocs
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (and optional GROQ_API_KEY)
docker compose up -d --build --wait
```

Access points:

1. **Web Client (TechToday port)**: http://localhost:8091
2. **Web Client (Vite port)**: http://localhost:5173
3. **Backend API**: http://localhost:8000
4. **Swagger Documentation**: http://localhost:8000/docs

---

## Daily Local Development

Source files under `./client` and `./server` are bind-mounted into their respective containers, so React edits hot-reload in the browser and Python edits trigger Uvicorn reload without rebuilding images. Rebuild only when `Dockerfile`, `package.json`, or `requirements.txt` changes.

1. **Start in background and wait for healthchecks**:
   ```bash
   docker compose up -d --wait
   ```
2. **Rebuild images after dependency changes**:
   ```bash
   docker compose build
   ```
3. **Follow logs**:
   ```bash
   docker compose logs -f
   docker compose logs -f server
   docker compose logs -f client
   ```
4. **Run an individual Python service CLI standalone inside the server container**:
   ```bash
   docker compose exec server python services/01_chat_openai.py
   docker compose exec server python services/29_mcp_client.py
   ```
5. **Open an interactive shell inside a container**:
   ```bash
   docker compose exec server /bin/sh
   docker compose exec client /bin/sh
   ```
6. **Check container health and status**:
   ```bash
   docker compose ps
   ```
7. **Stop and remove containers**:
   ```bash
   docker compose down
   ```

---

## Production Setup

The self-provisioning workflow at `.github/workflows/deploy-ai-pocs.yml` automatically provisions and updates all production resources on every push:

1. Creates the `techtoday/ai-pocs-client` and `techtoday/ai-pocs-server` Amazon ECR repositories if they do not exist.
2. Builds and pushes `:latest`, `:<git-sha>`, and `:<build-tag>` images for both `client` and `server`.
3. Writes `~/secrets/ai-pocs.env` (`chmod 600`) from the shared `techtoday/secrets` secret in AWS Secrets Manager.
4. Auto-ensures the Nginx `/etc/nginx/conf.d/app-locations/*.conf` include, `/etc/nginx/conf.d/00-rate-limit.conf`, and `/etc/nginx/conf.d/app-locations/00-rate-limit-response.conf` (for JSON HTTP 429 responses).
5. Writes `/etc/nginx/conf.d/app-locations/ai-pocs.conf` forwarding `/ai-pocs/` to `http://localhost:5010` with POST rate limiting enabled.
6. Writes `~/apps/ai-pocs/docker-compose.yml` and pulls/restarts both `client` and `server` services.

Only one manual step is ever needed if you introduce a brand-new secret key not yet in `techtoday/secrets`: update `techtoday/secrets` locally as the `techtoday` IAM user before deploying:

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['OPENAI_API_KEY']='your-key'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

---

## Commit and Automatic Deployment

Every branch deploys on push (see [../DEPLOYMENT.md](../DEPLOYMENT.md)). Push a feature branch to deploy and test live, then merge into `main`:

```bash
git checkout main && git pull origin main
git checkout -b feat/ai-pocs-update
git add projects/ai-pocs .github/workflows/deploy-ai-pocs.yml
git commit -m "feat(ai-pocs): integrate ai-pocs container project"
git push -u origin feat/ai-pocs-update
```

1. **Workflow triggered**: `.github/workflows/deploy-ai-pocs.yml`
2. **Trigger paths**: `projects/ai-pocs/**` and `.github/workflows/deploy-ai-pocs.yml`
3. **ECR repositories**: `techtoday/ai-pocs-client` and `techtoday/ai-pocs-server`
4. **Affected EC2 services**: `client` (`ai-pocs-client`) and `server` (`ai-pocs-server`) in `~/apps/ai-pocs/docker-compose.yml`

Once verified on the live URL, merge into `main`:

```bash
git checkout main
git pull origin main
git merge feat/ai-pocs-update
git push origin main
```

---

## Production Verification and Troubleshooting

1. **Verify the frontend and explainer pages over HTTPS**:
   ```bash
   curl -I https://app.techtoday.click/ai-pocs/
   curl -I https://app.techtoday.click/ai-pocs/info/travel-guide.html
   ```
2. **Verify the proxied backend health and API endpoint**:
   ```bash
   curl -s https://app.techtoday.click/ai-pocs/health
   curl -s -X POST https://app.techtoday.click/ai-pocs/api/chunk \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello world from AI POCs.", "chunk_size": 50, "chunk_overlap": 10}'
   ```
3. **Inspect container status and logs on EC2**:
   ```bash
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click \
     "docker compose -f ~/apps/ai-pocs/docker-compose.yml ps"
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click \
     "docker compose -f ~/apps/ai-pocs/docker-compose.yml logs --tail 100"
   ```
4. **Restart only this project on EC2**:
   ```bash
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click \
     "docker compose -f ~/apps/ai-pocs/docker-compose.yml up -d --force-recreate client server"
   ```

---

## Rollback

1. **Find the previous working build tag** in the GitHub Actions job summary for **Deploy ai-pocs** (format `YYYYMMDD-HHMMSS-<run>-<short-sha>`), or list tags in ECR (`techtoday/ai-pocs-client` and `techtoday/ai-pocs-server` in `us-east-1`):
   ```bash
   aws ecr describe-images --repository-name techtoday/ai-pocs-server --region us-east-1 \
     --query 'sort_by(imageDetails,& imagepushedAt)[-5:].imageTags' --output table
   ```
2. **Pin `~/apps/ai-pocs/docker-compose.yml` on EC2 to the working tag** and restart both services:
   ```bash
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click
   # Edit ~/apps/ai-pocs/docker-compose.yml and replace :latest with :<build-tag> on both client and server
   docker compose -f ~/apps/ai-pocs/docker-compose.yml pull client server
   docker compose -f ~/apps/ai-pocs/docker-compose.yml up -d --wait client server
   ```
3. **Verify rollback**:
   ```bash
   curl -I https://app.techtoday.click/ai-pocs/
   ```

---

## Manual Deployment

If GitHub Actions is unavailable, build and push `linux/amd64` images directly from your local machine and restart the stack on EC2:

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_URL

docker buildx build --platform linux/amd64 \
  -t $ECR_URL/techtoday/ai-pocs-client:latest \
  --push projects/ai-pocs/client

docker buildx build --platform linux/amd64 \
  -t $ECR_URL/techtoday/ai-pocs-server:latest \
  --push projects/ai-pocs/server

ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click "
  aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL &&
  docker image prune -af || true &&
  docker compose -f ~/apps/ai-pocs/docker-compose.yml pull client server &&
  docker compose -f ~/apps/ai-pocs/docker-compose.yml up -d --wait client server
"
```

---

## Deployment Status

Automated CI/CD deployment is **complete** via `.github/workflows/deploy-ai-pocs.yml` and covers both the `client` (`techtoday/ai-pocs-client`) and `server` (`techtoday/ai-pocs-server`) containers.
