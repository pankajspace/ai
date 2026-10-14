# AI Projects: Multi-Container Suite of 31 AI Services

A unified, modular full-stack application hosting 31 production-grade AI services across 5 sequential practice domains using FastAPI, React + Vite, and Docker Compose.

## Architecture

1. Multi-Container Orchestration: Docker Compose orchestrates an isolated FastAPI backend (`ai-projects-server` on port 8000) and a React + Vite single-page application (`ai-projects-client` on port 5173).
2. Service Modularity: Each service in `server/services/` is self-contained with Pydantic schemas, typed handlers, fallback support, and a standalone CLI entrypoint (`python services/<filename>.py`).
3. Frontend Dashboard: React frontend organized with interactive category tabs, instant quick-pick presets, loading spinners, and result visualizations.

## Sequential Domain Overview

### Domain 1: AI Basics & LangChain (Services 01 - 10)

1. `01_chat_openai`: Direct OpenAI Chat Completion service providing witty travel suggestions.
2. `02_chat_groq`: High-throughput Groq LLM service generating domain jokes.
3. `03_langchain_summarizer`: Text summarization service built using LangChain Expression Language (LCEL).
4. `04_langchain_memory_chat`: Multi-turn conversational memory retaining dialogue history.
5. `05_agent_one_tool`: Autonomous agent implementing local tool calling (`get_price`).
6. `06_langchain_one_tool`: LangChain ReAct agent equipped with weather lookup capabilities.
7. `07_langchain_multi_tools`: LangChain agent coordinating multiple math and weather tools.
8. `08_chunking`: Document splitting service using `RecursiveCharacterTextSplitter`.
9. `09_embedding`: Sentence transformer vector embedding and cosine similarity service (`all-MiniLM-L6-v2`).
10. `10_rag`: Document Q&A pipeline combining chunking, Chroma vector storage, and contextual retrieval.

### Domain 2: AWS Strands & Agent Workflows (Services 11 - 22)

11. `11_hello_world_agent`: Minimal Strands agent running on Amazon Bedrock Nova Lite (with OpenAI fallback).
12. `12_hello_world_langgraph`: LangGraph ReAct tool loop demonstrating intent to act over direct answering.
13. `13_function_to_tool`: Turning standard Python functions into tools with `@tool`, type hints, and docstrings.
14. `14_tip_calculator`: Intent-driven dining bill and tip calculation agent.
15. `15_multi_tool_sales`: Autonomous sales operations planner executing `get_data` -> `analyze` -> `email`.
16. `16_custom_tool_inventory`: Domain-specific mock store inventory lookup tool (`check_inventory`).
17. `17_prebuilt_tools`: Math assistant agent using prebuilt mathematical execution tools.
18. `18_multi_prebuilt_tools`: Chained data pipeline combining HTTP requests, calculations, and file writes.
19. `19_use_aws`: Natural language cloud resource manager executing read-only AWS operations.
20. `20_class_based_tools`: Class-based tools sharing state/connection pool to prevent DB connection bloat.
21. `21_async_tools`: Parallel async tool execution across warehouses using `asyncio.gather`.
22. `22_travel_assistant`: Capstone agent chaining weather forecasts, packing lists, and trip cost estimation against budgets.

### Domain 3: AI Systems & Prompting (Services 23 - 24)

23. `23_prompting_strategies`: Benchmark measuring Direct vs Zero-Shot CoT vs Few-Shot CoT on tricky reasoning questions.
24. `24_sycophancy_trap`: Multi-turn pushback evaluator testing model resilience against gaslighting and authority pressure.

### Domain 4: AI Reliability & Calibration (Services 25 - 28)

25. `25_cot_vs_direct`: Side-by-side reliability benchmark measuring CoT gains on complex logic puzzles.
26. `26_variance_determinism`: Evaluates output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced modes.
27. `27_tool_schema_calibration`: Measures model routing sensitivity between tool names and docstrings via 2x2 matrix.
28. `28_tool_error_injection`: Simulates upstream API outages (HTTP 503) to test error transparency and hallucination prevention.

### Domain 5: Model Context Protocol & Evals (Services 29 - 31)

29. `29_mcp_client`: Raw FastMCP client demonstrating handshake, tool discovery, and direct tool calling without an LLM.
30. `30_mcp_agent`: LLM-guided FastMCP cricket assistant routing questions to live match tools.
31. `31_mcp_evals`: Automated assertion evaluation suite validating tool routing and factual accuracy.

## Quick Start

### 1. Configure Environment

Copy `.env.example` to `.env` in `projects/ai-projects/`:

```bash
cd projects/ai-projects
cp .env.example .env
```

Set your API keys:
1. `OPENAI_API_KEY`: Required for OpenAI services.
2. `GROQ_API_KEY`: Optional, used for high-speed Groq inference.
3. `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: Optional, used for live Amazon Bedrock and AWS operations.

### 2. Run with Docker Compose

From `projects/ai-projects/`:

```bash
docker compose up --build
```

Access points:
1. Web Client: `http://localhost:5173`
2. Backend API: `http://localhost:8000`
3. Swagger Documentation: `http://localhost:8000/docs`

