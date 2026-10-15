# AI POCs Server (FastAPI)

FastAPI backend service hosting 31 modular AI services across 5 sequential domains in a multi-container architecture.

## Overview

1. Service: FastAPI application serving HTTP endpoints across OpenAI `gpt-4o-mini`, Groq, LangChain, AWS Bedrock / Strands, LangGraph, and FastMCP.
2. Architecture: Multi-container setup where the FastAPI backend runs alongside a Vite + React client container.
3. Development mode: Supports hot-reload both locally and via Docker volume mounts.

## File Structure

1. `main.py`: FastAPI app with CORS middleware, health check, and 31 route endpoints.
2. `services/__init__.py`: Package entrypoint dynamically loading numbered services and exporting schemas.
3. `services/01_chat_openai.py`: OpenAI travel guide chat completion service.
4. `services/02_chat_groq.py`: Groq joke generator chat completion service.
5. `services/03_langchain_summarizer.py`: LangChain LCEL text summarizer service.
6. `services/04_langchain_memory_chat.py`: LangChain conversational memory chat service.
7. `services/05_agent_one_tool.py`: Autonomous agent with local tool calling (`get_price`).
8. `services/06_langchain_one_tool.py`: LangChain single-tool agent (`get_weather`).
9. `services/07_langchain_multi_tools.py`: LangChain multi-tool agent (`get_weather`, arithmetic, population).
10. `services/08_chunking.py`: Document chunking service using RecursiveCharacterTextSplitter.
11. `services/09_embedding.py`: Sentence similarity computation via all-MiniLM-L6-v2 embeddings.
12. `services/10_rag.py`: Paragraph retrieval-augmented generation service.
13. `services/11_hello_world_agent.py`: Minimal Strands agent on Amazon Bedrock Nova Lite.
14. `services/12_hello_world_langgraph.py`: LangGraph ReAct agent loop on Bedrock Converse with a greeting tool.
15. `services/13_function_to_tool.py`: Converting Python functions to agent tools via `@tool`, type hints, and docstrings.
16. `services/14_tip_calculator.py`: Natural language intent-driven bill and tip calculator agent.
17. `services/15_multi_tool_sales.py`: Autonomous sales pipeline orchestration (`get_data` -> `analyze` -> `email`).
18. `services/16_custom_tool_inventory.py`: Domain-specific catalog stock lookup tool (`check_inventory`).
19. `services/17_prebuilt_tools.py`: Math assistant agent using the prebuilt `strands_tools.calculator`.
20. `services/18_multi_prebuilt_tools.py`: Multi-step pipeline with the prebuilt `http_request`, `calculator`, and `file_write` (writes real files; sets `BYPASS_TOOL_CONSENT=true`).
21. `services/19_use_aws.py`: Natural language AWS assistant using the prebuilt `use_aws` tool (real API calls; use read-only credentials).
22. `services/20_class_based_tools.py`: Class-based tools sharing state/connection pool to prevent DB connection bloat.
23. `services/21_async_tools.py`: Async Strands tool run with `agent.invoke_async`, so warehouse lookups run in parallel.
24. `services/22_travel_assistant.py`: Capstone travel agent combining weather forecasts, packing lists, and cost estimation.
25. `services/23_prompting_strategies.py`: Benchmarks Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning.
26. `services/24_sycophancy_trap.py`: 4-round escalating pushback evaluator testing model sycophancy and integrity.
27. `services/25_cot_vs_direct.py`: Side-by-side reliability benchmark measuring CoT reasoning gains on logic puzzles.
28. `services/26_variance_determinism.py`: Evaluates structured output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced modes.
29. `services/27_tool_schema_calibration.py`: Measures routing sensitivity on function names vs docstrings via 2x2 matrix.
30. `services/28_tool_error_injection.py`: Simulates upstream API outages (HTTP 503) to benchmark error transparency and hallucination prevention.
31. `services/29_mcp_client.py`: MCP client over stdio without an LLM (handshake, tool discovery, direct tool call).
32. `services/30_mcp_agent.py`: Groq agent that discovers and calls the MCP server's tools over stdio.
33. `services/31_mcp_evals.py`: 5-case eval suite running the service 30 agent and asserting tool routing and facts.
34. `services/cricket_server.py`: FastMCP stdio server (demo live scores and player stats) started as a subprocess by services 29-31.
35. `requirements.txt`: Python package dependencies.
36. `Dockerfile`: Container image build instructions using Python 3.12-slim and `uv`.
37. `.env.example`: Configuration variables for port, host, and API keys.

## Running the Server

### Option 1: Multi-Container via Docker Compose (Recommended)

From the project root (`projects/ai-pocs/`):

1. Start all services (client and server):
   ```bash
   docker compose up --build
   ```
2. Access the server at `http://localhost:8000`.
3. Access interactive Swagger documentation at `http://localhost:8000/docs`.
4. Access the React client at `http://localhost:5173`.

### Option 2: Standalone Container

From the `projects/ai-pocs/server` directory:

1. Build the Docker image:
   ```bash
   docker build -t ai-pocs-server .
   ```
2. Run the container:
   ```bash
   docker run -p 8000:8000 -e OPENAI_API_KEY="$OPENAI_API_KEY" ai-pocs-server
   ```

### Option 3: Local Python Execution

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure API keys are configured in `.env`.
4. Run the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Endpoints

1. `GET /`: Basic service status check.
2. `GET /health`: Healthcheck endpoint reporting status and total service count (31).
3. `POST /api/travel`: OpenAI travel suggestions.
4. `POST /api/joke`: Groq joke generator.
5. `POST /api/summarize`: LangChain LCEL text summarizer.
6. `POST /api/memory-chat`: Conversational memory chat.
7. `POST /api/agent`: Autonomous single-tool price lookup agent.
8. `POST /api/langchain-one-tool`: LangChain single-tool weather agent.
9. `POST /api/multi-tool-agent`: LangChain multi-tool agent.
10. `POST /api/chunk`: Text chunking service.
11. `POST /api/embedding`: Sentence similarity embedding service.
12. `POST /api/rag`: Paragraph vector RAG QA service.
13. `POST /api/hello-world-agent`: Strands Bedrock Hello World agent.
14. `POST /api/langgraph-agent`: LangGraph tool-enabled ReAct agent.
15. `POST /api/function-to-tool`: Python function-to-tool server health checker.
16. `POST /api/tip-calculator`: Natural language tip and bill split agent.
17. `POST /api/multi-tool-sales`: Multi-tool sales operations planner.
18. `POST /api/custom-inventory`: Custom inventory catalog lookup agent.
19. `POST /api/prebuilt-calculator`: Math assistant using pre-built mathematical tool.
20. `POST /api/multi-prebuilt-tools`: Chained HTTP, math, and file write workflow agent.
21. `POST /api/use-aws`: Natural language AWS cloud management interface.
22. `POST /api/class-based-tools`: Class-based tools sharing state/connection pool.
23. `POST /api/async-tools`: Parallel async warehouse lookup agent.
24. `POST /api/travel-assistant`: Capstone weather, packing, and cost planner agent.
25. `POST /api/prompting-strategies`: Benchmarking Direct vs Zero-Shot CoT vs Few-Shot CoT.
26. `POST /api/sycophancy-trap`: Multi-turn pushback and capitulation evaluator.
27. `POST /api/cot-vs-direct`: CoT vs Direct reasoning reliability benchmark.
28. `POST /api/variance-determinism`: Structured output determinism evaluator.
29. `POST /api/tool-schema-calibration`: 2x2 tool schema routing calibration matrix.
30. `POST /api/tool-error-injection`: Upstream API error injection and hallucination test.
31. `POST /api/mcp-client`: Direct FastMCP protocol client.
32. `POST /api/mcp-agent`: LLM-guided FastMCP cricket assistant.
33. `POST /api/mcp-evals`: Automated assertion evaluation suite for FastMCP agent.
