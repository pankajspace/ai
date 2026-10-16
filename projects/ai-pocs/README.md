# AI POCs: Multi-Container Suite of 35 AI Services

A unified, modular full-stack application hosting 35 production-grade AI services across 7 sequential practice domains (`02-ai-basics` through `08-ai-mcp-evals`) using FastAPI, React + Vite, and Docker Compose.

Each interactive card in the React dashboard features a green `ⓘ` icon in its header linking to a dedicated `info/<demo>.html` explainer page under `client/public/info/` with two units: Unit 1 (Concept, Theory & Concepts, end-to-end Request Flow, and Mermaid `flowchart TD` Code Flow) and Unit 2 (complete Python source code).

---

## Architecture

1. **Multi-Container Orchestration**: Docker Compose orchestrates an isolated FastAPI backend (`ai-pocs-server` on port `8000`) and a React + Vite single-page application (`ai-pocs-client` on container port `5173`, mapped locally to `8091` and `5173`, and on EC2 to `5010`).
2. **Service Modularity**: Each service in `server/services/<domain>/` is self-contained with Pydantic schemas, typed handlers, and circled numeral step comments (`# ①`, `# ②`, ...), mirroring the matching `practice/` folder structure (`02-ai-basics` through `08-ai-mcp-evals`, ignoring `01-python`). Every route returns `400` for empty text input and `500` with the error detail if the service fails.
3. **Path-Prefix & Reverse Proxy Routing**: In production behind Nginx at `https://app.techtoday.click/ai-pocs/`, `VITE_BASE_PATH=/ai-pocs/` and `VITE_SERVER_URL=/ai-pocs` serve all frontend assets and explainer pages under `/ai-pocs/`, while Vite proxies `/ai-pocs/api/*` and `/ai-pocs/health` over the internal Docker Compose network to `http://server:8000`. The client image runs `npm run build` at image build time and serves the minified bundle with `vite preview`; local `docker compose` overrides this with the `npm run dev` hot-reload server.
4. **Rate Limiting & Abuse Prevention**: A sliding-window rate limiter (`server/rate_limiter.py`) enforces a strict 30 requests per hour limit per client IP across all 35 POST API endpoints, backed by SQLite in WAL mode (`/tmp/ai_rate_limit.db`) with automatic retry-after guidance and HTTP 429 response.

```text
Browser ──HTTPS (/ai-pocs/)──▶ Nginx (5010, gzip) ──▶ ai-pocs-client (vite preview :5173)
                                                     ├── Static UI & info/*.html
                                                     └── Proxy /ai-pocs/api/* ──▶ ai-pocs-server (FastAPI :8000)
                                                                                       └── 35 AI Services across 7 domain folders
```

---

## Sequential Domain Overview (35 Services across 7 Folders)

### Domain 1: `02-ai-basics` — AI Basics & LangChain (Services 01 - 07)

1. `02-ai-basics/01_chat_openai.py` (`info/travel-guide.html`): Direct OpenAI Chat Completion service providing travel suggestions.
2. `02-ai-basics/02_chat_groq.py` (`info/joke-generator.html`): High-throughput Groq LLM service generating domain jokes.
3. `02-ai-basics/03_langchain_summarizer.py` (`info/summarizer.html`): Text summarization service built using LangChain Expression Language (LCEL).
4. `02-ai-basics/04_langchain_memory_chat.py` (`info/memory-chat.html`): Multi-turn conversational memory retaining dialogue history.
5. `02-ai-basics/05_agent_one_tool.py` (`info/agent-one-tool.html`): Raw OpenAI tool-calling loop with one local tool (`get_price`).
6. `02-ai-basics/06_langchain_one_tool.py` (`info/langchain-one-tool.html`): LangChain `create_agent` on Groq with one tool (`get_weather`).
7. `02-ai-basics/07_langchain_multi_tools.py` (`info/multi-tool-agent.html`): LangChain agent on Groq choosing between `get_weather`, `add`, `multiply`, and `get_population`.

### Domain 2: `03-ai-rag-chroma` — Chunking, Embeddings & RAG (Services 08 - 10)

8. `03-ai-rag-chroma/01_chunking.py` (`info/chunking.html`): Document splitting service using overlapping sliding windows.
9. `03-ai-rag-chroma/02_embedding.py` (`info/embedding.html`): Sentence transformer vector embedding and cosine similarity service (`all-MiniLM-L6-v2`).
10. `03-ai-rag-chroma/03_rag.py` (`info/rag.html`): Paragraph Q&A pipeline: chunk, embed into an in-memory Chroma store, retrieve the top chunks, and answer from them with OpenAI.

### Domain 3: `04-ai-model-training-chromadb` — ML Training, ChromaDB & Redis Memory (Services 11 - 13)

11. `04-ai-model-training-chromadb/01_model_training.py` (`info/model-training.html`): Trains a scikit-learn `RandomForestRegressor` on synthetic food delivery data, saves `eta_model.joblib`, and predicts delivery ETA in minutes.
12. `04-ai-model-training-chromadb/02_chromadb.py` (`info/chromadb.html`): Chunks markdown notes in `docs/*.md`, embeds them with OpenAI `text-embedding-3-small`, indexes into ChromaDB, and answers questions with source citations.
13. `04-ai-model-training-chromadb/03_redis.py` (`info/redis.html`): Persists multi-turn conversation history per `session_id` with TTL expiry (Redis or in-memory fallback) and runs an OpenAI tool-calling support agent.

### Domain 4: `05-ai-aws-strands` — AWS Strands & Agent Workflows (Services 14 - 25)

14. `05-ai-aws-strands/01_hello_world_agent.py` (`info/hello-world-agent.html`): Minimal Strands `Agent` on Amazon Bedrock (Nova Lite) answering one prompt.
15. `05-ai-aws-strands/02_hello_world_langgraph.py` (`info/langgraph-agent.html`): LangGraph `create_react_agent` on Bedrock Converse calling `greet` once per name.
16. `05-ai-aws-strands/03_function_to_tool.py` (`info/function-to-tool.html`): Turning standard Python HTTP health-check functions into tools (`check_server_status`).
17. `05-ai-aws-strands/04_tip_calculator.py` (`info/tip-calculator.html`): Natural-language dining bill and tip calculation agent (`calculate_tip`).
18. `05-ai-aws-strands/05_multi_tool_sales.py` (`info/multi-tool-sales.html`): Autonomous sales operations planner executing `get_sales_data` -> `analyze_sales` -> `send_email`.
19. `05-ai-aws-strands/06_custom_tool_inventory.py` (`info/custom-inventory.html`): Custom `@tool` wrapping a mock stock table (`check_inventory`).
20. `05-ai-aws-strands/07_prebuilt_tools.py` (`info/prebuilt-calculator.html`): Math assistant using the prebuilt `strands_tools.calculator` and a system prompt.
21. `05-ai-aws-strands/08_multi_prebuilt_tools.py` (`info/multi-prebuilt-tools.html`): Chained data pipeline combining the prebuilt `http_request` and `calculator`.
22. `05-ai-aws-strands/09_use_aws.py` (`info/use-aws.html`): Natural language AWS assistant using the prebuilt `use_aws` tool against the real account (read-only permissions).
23. `05-ai-aws-strands/10_class_based_tools.py` (`info/class-based-tools.html`): Class-based tools (`InventoryTools`: `check_stock`, `update_stock`) sharing instance state across requests.
24. `05-ai-aws-strands/11_async_tools.py` (`info/async-tools.html`): Async Strands tool run with `agent.invoke_async`, so three 2-second warehouse lookups run in parallel.
25. `05-ai-aws-strands/12_travel_assistant.py` (`info/travel-assistant.html`): Capstone multi-tool planner chaining `get_weather_forecast`, `suggest_packing_list`, `estimate_trip_cost`, and `calculator`.

### Domain 5: `06-ai-systems` — AI Systems & Multi-Turn Pressure (Services 26 - 28)

26. `06-ai-systems/01_prompting_strategies.py` (`info/prompting-strategies.html`): Benchmark measuring Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning questions.
27. `06-ai-systems/02_sycophancy_trap.py` (`info/sycophancy-trap.html`): Multi-turn pushback evaluator testing model resilience against gaslighting and authority pressure.
28. `06-ai-systems/03_refund_bench.py` (`info/refund-bench.html`): 4-stage multi-judge food dispute adjudication pipeline with code-driven pricing.

### Domain 6: `07-ai-reliability` — AI Reliability & Calibration (Services 29 - 32)

29. `07-ai-reliability/01_cot_vs_direct.py` (`info/cot-vs-direct.html`): Side-by-side reliability benchmark measuring CoT gains on complex state-tracking logic puzzles.
30. `07-ai-reliability/02_variance_determinism.py` (`info/variance-determinism.html`): Evaluates output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced JSON modes.
31. `07-ai-reliability/03_tool_schema_calibration.py` (`info/tool-schema-calibration.html`): Measures model routing sensitivity between tool names and docstrings via a 2x2 calibration matrix.
32. `07-ai-reliability/04_tool_error_injection.py` (`info/tool-error-injection.html`): Simulates upstream API outages (HTTP 503) to test error transparency and hallucination prevention.

### Domain 7: `08-ai-mcp-evals` — Model Context Protocol & Evals (Services 33 - 35)

33. `08-ai-mcp-evals/01_mcp_client.py` (`info/mcp-client.html`): MCP client that starts `cricket_server.py` over stdio and runs the handshake, tool discovery, and a direct tool call without an LLM.
34. `08-ai-mcp-evals/02_mcp_agent.py` (`info/mcp-agent.html`): Groq LLM agent that discovers the MCP server's tools and calls them over stdio.
35. `08-ai-mcp-evals/03_mcp_evals.py` (`info/mcp-evals.html`): 5-case eval suite that runs the `02_mcp_agent.py` agent and asserts tool routing and ground-truth facts.

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
2. `GET /health` — FastAPI healthcheck returning `{"status": "healthy", "total_services": 35}`.
3. `GET /info/<demo>.html` — serves the 35 explainer pages from `client/public/info/`, along with `client/public/css/info.css` and `client/public/js/info.js`.
4. `POST /api/travel` — OpenAI travel suggestion (`{"city": "Bangalore"}`).
5. `POST /api/joke` — Groq joke generator (`{"topic": "programming"}`).
6. `POST /api/summarize` — LangChain LCEL summarizer (`{"text": "..."}`).
7. `POST /api/memory-chat` — Multi-turn memory chat (`{"message": "...", "history": [...]}`).
8. `POST /api/agent` — Single-tool price agent (`{"message": "How much are the shoes?"}`).
9. `POST /api/langchain-one-tool` — LangChain weather agent (`{"message": "..."}`).
10. `POST /api/multi-tool-agent` — LangChain multi-tool agent (`{"message": "..."}`).
11. `POST /api/chunk` — Sliding-window document chunker (`{"text": "...", "chunk_size": 250, "chunk_overlap": 40}`).
12. `POST /api/embedding` — Sentence embedding cosine similarity (`{"text1": "...", "text2": "..."}`).
13. `POST /api/rag` — 4-stage RAG Q&A (`{"paragraph": "...", "question": "..."}`).
14. `POST /api/model-training` — scikit-learn `RandomForestRegressor` delivery ETA training & prediction (`{"distance_km": 6.5, "items_count": 4, "is_peak_hour": 1, "traffic_level": 3}`).
15. `POST /api/chromadb` — ChromaDB study notes RAG Q&A (`{"question": "...", "n_results": 3}`).
16. `POST /api/redis` — Redis-backed stateful multi-turn support agent (`{"session_id": "demo-user-1", "message": "...", "clear_session": false}`).
17. `POST /api/hello-world-agent` — AWS Strands single-turn agent (`{"prompt": "..."}`).
18. `POST /api/langgraph-agent` — LangGraph ReAct greeting agent (`{"prompt": "..."}`).
19. `POST /api/function-to-tool` — HTTP healthcheck function tool (`{"question": "..."}`).
20. `POST /api/tip-calculator` — Dining bill and tip calculator agent (`{"query": "..."}`).
21. `POST /api/multi-tool-sales` — 3-tool sales pipeline agent (`{"task": "..."}`).
22. `POST /api/custom-inventory` — Custom `@tool` inventory lookup (`{"question": "..."}`).
23. `POST /api/prebuilt-calculator` — Prebuilt `strands_tools.calculator` math agent (`{"query": "..."}`).
24. `POST /api/multi-prebuilt-tools` — Chained HTTP fetch and calculator pipeline (`{"task": "..."}`).
25. `POST /api/use-aws` — `use_aws` AWS assistant (real API calls; use read-only credentials) (`{"prompt": "..."}`).
26. `POST /api/class-based-tools` — Stateful class-based inventory tools (`{"query": "..."}`).
27. `POST /api/async-tools` — Parallel async warehouse lookups via `agent.invoke_async` (`{"query": "..."}`).
28. `POST /api/travel-assistant` — 5-tool capstone travel planner (`{"query": "..."}`).
29. `POST /api/prompting-strategies` — Direct vs Zero-Shot CoT vs Few-Shot CoT (`{"question": "...", "expected_answer": "293"}`).
30. `POST /api/sycophancy-trap` — Multi-turn pushback resilience benchmark (`{"case_type": "Math Gaslight"}`).
31. `POST /api/refund-bench` — 4-stage multi-judge food dispute adjudication pipeline (`{"complaint_text": "...", "bench": "mixed3", "cap": 2000.0}`).
32. `POST /api/cot-vs-direct` — CoT vs Direct puzzle benchmark (`{"problem_title": "Spatial Navigation (Grid)"}`).
33. `POST /api/variance-determinism` — Unconstrained vs Prompt-Constrained vs Schema-Enforced JSON (`{"review_text": "..."}`).
34. `POST /api/tool-schema-calibration` — 2x2 tool name vs docstring routing calibration (`{"query": "..."}`).
35. `POST /api/tool-error-injection` — HTTP 503 error injection and hallucination test (`{"question": "..."}`).
36. `POST /api/mcp-client` — Direct FastMCP tool invocation without an LLM (`{"tool_name": "get_live_score", "tool_args": {...}}`).
37. `POST /api/mcp-agent` — LLM-guided FastMCP cricket agent (`{"question": "..."}`).
38. `POST /api/mcp-evals` — Automated assertion eval suite for the FastMCP agent (no request body needed).

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
│   │   └── info/               # 35 "How it works" explainer HTML pages (one per demo card)
│   └── src/
│       ├── App.tsx             # 7 domain accordions and 35 service cards
│       ├── App.css             # Component and layout styles
│       ├── config.ts           # Runtime API_BASE resolution
│       └── components/         # 35 interactive React card components
└── server/
    ├── Dockerfile              # Python 3.12-slim + uv + CPU PyTorch + FastAPI Uvicorn
    ├── requirements.txt        # FastAPI, OpenAI, LangChain, scikit-learn, ChromaDB, Redis, Strands, MCP
    ├── rate_limiter.py         # IP-based sliding window rate limiter (30 req/hr)
    ├── main.py                 # FastAPI app, CORS, rate-limit middleware, healthcheck, and 35 POST routes
    └── services/
        ├── __init__.py                         # Dynamic service loader across 7 domain folders
        ├── 02-ai-basics/                       # 01_chat_openai.py .. 07_langchain_multi_tools.py
        ├── 03-ai-rag-chroma/                   # 01_chunking.py .. 03_rag.py
        ├── 04-ai-model-training-chromadb/      # 01_model_training.py, 02_chromadb.py, 03_redis.py, docs/
        ├── 05-ai-aws-strands/                  # 01_hello_world_agent.py .. 12_travel_assistant.py
        ├── 06-ai-systems/                      # 01_prompting_strategies.py .. 03_refund_bench.py
        ├── 07-ai-reliability/                  # 01_cot_vs_direct.py .. 04_tool_error_injection.py
        └── 08-ai-mcp-evals/                    # 01_mcp_client.py .. 03_mcp_evals.py, cricket_server.py
```

---

## Environment Variables

1. **`OPENAI_API_KEY`** (required) — OpenAI API key used by the OpenAI, LangChain, ChromaDB, Redis Agent, Systems, and Reliability services. Obtain from https://platform.openai.com/api-keys.
2. **`GROQ_API_KEY`** (optional) — Groq API key used by the Joke Generator (`02-ai-basics/02_chat_groq.py`), LangChain agents (`06`, `07`), and MCP agent and evals (`08-ai-mcp-evals`). Obtain from https://console.groq.com/keys.
3. **`GEMINI_API_KEY`** (optional) — Google Gemini API key for Gemini-compatible endpoints. Obtain from https://aistudio.google.com/app/apikey.
4. **`AWS_ACCESS_KEY_ID`**, **`AWS_SECRET_ACCESS_KEY`**, **`AWS_DEFAULT_REGION`** (required for `05-ai-aws-strands`) — AWS credentials for Amazon Bedrock (Nova Lite).
5. **`VITE_BASE_PATH`** (optional) — Frontend base URL path; defaults to `/` locally and `/ai-pocs/` in production.
6. **`VITE_SERVER_URL`** (optional) — Browser API base URL; defaults to `http://localhost:8000` in local Compose and `/ai-pocs` in production.
7. `.env` is gitignored and must never be committed.
