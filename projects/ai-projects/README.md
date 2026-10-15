# AI Projects: Multi-Container Suite of 31 AI Services

A unified, modular full-stack application hosting 31 production-grade AI services across 5 sequential practice domains using FastAPI, React + Vite, and Docker Compose.

## Architecture

1. Multi-Container Orchestration: Docker Compose orchestrates an isolated FastAPI backend (`ai-projects-server` on port 8000) and a React + Vite single-page application (`ai-projects-client` on port 5173).
2. Service Modularity: Each service in `server/services/` is self-contained with Pydantic schemas, typed handlers, circled numeral step comments (`# ①`, `# ②`, ...), fallback support, and a standalone CLI entrypoint (`python services/<filename>.py`).
3. Frontend Dashboard & Explainer Pages: Every card in the React dashboard features a green `ⓘ` icon in its header linking to a dedicated `info/<demo>.html` explainer page with two units: Unit 1 (Concept, Theory & Concepts, end-to-end Request Flow, and Mermaid `flowchart TD` Code Flow) and Unit 2 (complete, unedited Python source code).

## Sequential Domain Overview

### Domain 1: AI Basics & LangChain (Services 01 - 10)

1. `01_chat_openai` (`info/travel-guide.html`): Direct OpenAI Chat Completion service providing travel suggestions.
2. `02_chat_groq` (`info/joke-generator.html`): High-throughput Groq LLM service generating domain jokes.
3. `03_langchain_summarizer` (`info/summarizer.html`): Text summarization service built using LangChain Expression Language (LCEL).
4. `04_langchain_memory_chat` (`info/memory-chat.html`): Multi-turn conversational memory retaining dialogue history.
5. `05_agent_one_tool` (`info/agent-one-tool.html`): Autonomous agent implementing local tool calling (`get_price`).
6. `06_langchain_one_tool` (`info/langchain-one-tool.html`): LangChain ReAct agent equipped with weather lookup capabilities.
7. `07_langchain_multi_tools` (`info/multi-tool-agent.html`): LangChain agent coordinating multiple math, word-stats, and weather tools.
8. `08_chunking` (`info/chunking.html`): Document splitting service using overlapping sliding windows.
9. `09_embedding` (`info/embedding.html`): Sentence transformer vector embedding and cosine similarity service (`all-MiniLM-L6-v2`).
10. `10_rag` (`info/rag.html`): Document Q&A pipeline combining sentence splitting, vector encoding, cosine ranking, and grounded generation.

### Domain 2: AWS Strands & Agent Workflows (Services 11 - 22)

11. `11_hello_world_agent` (`info/hello-world-agent.html`): Minimal Strands `Agent` loop processing a natural-language prompt in a single turn.
12. `12_hello_world_langgraph` (`info/langgraph-agent.html`): LangGraph ReAct tool loop demonstrating multi-entity tool calls (`greet`).
13. `13_function_to_tool` (`info/function-to-tool.html`): Turning standard Python HTTP health-check functions into tools (`check_server_status`).
14. `14_tip_calculator` (`info/tip-calculator.html`): Natural-language dining bill and tip calculation agent (`calculate_tip`).
15. `15_multi_tool_sales` (`info/multi-tool-sales.html`): Autonomous sales operations planner executing `get_sales_data` -> `analyze_sales` -> `send_email`.
16. `16_custom_tool_inventory` (`info/custom-inventory.html`): Explicit `TOOL_SPEC` store inventory lookup tool (`check_inventory`).
17. `17_prebuilt_tools` (`info/prebuilt-calculator.html`): Math assistant agent using safe AST mathematical expression evaluation (`calculator`).
18. `18_multi_prebuilt_tools` (`info/multi-prebuilt-tools.html`): Chained data pipeline combining `http_request`, `calculator`, and virtual `file_write`.
19. `19_use_aws` (`info/use-aws.html`): Natural language cloud resource manager executing read-only AWS operations (`use_aws`).
20. `20_class_based_tools` (`info/class-based-tools.html`): Class-based tools (`InventoryService`: `check_stock`, `update_stock`) sharing instance state across turns.
21. `21_async_tools` (`info/async-tools.html`): Parallel async tool execution across warehouses using `asyncio.gather`.
22. `22_travel_assistant` (`info/travel-assistant.html`): Capstone multi-tool planner chaining `get_weather_forecast`, `suggest_packing_list`, `calculate_trip_cost`, and `calculator`.

### Domain 3: AI Systems & Prompting (Services 23 - 24)

23. `23_prompting_strategies` (`info/prompting-strategies.html`): Benchmark measuring Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning questions.
24. `24_sycophancy_trap` (`info/sycophancy-trap.html`): Multi-turn pushback evaluator testing model resilience against gaslighting and authority pressure.

### Domain 4: AI Reliability & Calibration (Services 25 - 28)

25. `25_cot_vs_direct` (`info/cot-vs-direct.html`): Side-by-side reliability benchmark measuring CoT gains on complex state-tracking logic puzzles.
26. `26_variance_determinism` (`info/variance-determinism.html`): Evaluates output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced JSON modes.
27. `27_tool_schema_calibration` (`info/tool-schema-calibration.html`): Measures model routing sensitivity between tool names and docstrings via a 2x2 calibration matrix.
28. `28_tool_error_injection` (`info/tool-error-injection.html`): Simulates upstream API outages (HTTP 503) to test error transparency and hallucination prevention.

### Domain 5: Model Context Protocol & Evals (Services 29 - 31)

29. `29_mcp_client` (`info/mcp-client.html`): Raw FastMCP client demonstrating handshake, tool discovery, and direct tool calling without an LLM.
30. `30_mcp_agent` (`info/mcp-agent.html`): LLM-guided FastMCP cricket assistant routing questions to live match tools.
31. `31_mcp_evals` (`info/mcp-evals.html`): Automated assertion evaluation suite validating tool routing and factual ground-truth accuracy.

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

