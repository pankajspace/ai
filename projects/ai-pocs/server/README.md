# AI POCs Server (FastAPI)

FastAPI backend service hosting 35 modular AI services organized into 7 sequential domain folders matching `practice/` (`02-ai-basics` through `08-ai-mcp-evals`).

## Overview

1. Service: FastAPI application serving HTTP endpoints across OpenAI `gpt-4o-mini`, Groq, LangChain, scikit-learn, ChromaDB, Redis, AWS Bedrock / Strands, LangGraph, and FastMCP.
2. Architecture: Multi-container setup where the FastAPI backend runs alongside a Vite + React client container.
3. Development mode: Supports hot-reload both locally and via Docker volume mounts.

## File Structure

1. `main.py`: FastAPI app with CORS middleware, rate-limiting middleware, health check, and 35 route endpoints.
2. `services/__init__.py`: Package entrypoint dynamically loading all 35 numbered services from the 7 domain subfolders and exporting schemas.
3. `services/02-ai-basics/01_chat_openai.py`: OpenAI travel guide chat completion service.
4. `services/02-ai-basics/02_chat_groq.py`: Groq joke generator chat completion service.
5. `services/02-ai-basics/03_langchain_summarizer.py`: LangChain LCEL text summarizer service.
6. `services/02-ai-basics/04_langchain_memory_chat.py`: LangChain conversational memory chat service.
7. `services/02-ai-basics/05_agent_one_tool.py`: Autonomous agent with local tool calling (`get_price`).
8. `services/02-ai-basics/06_langchain_one_tool.py`: LangChain single-tool agent (`get_weather`).
9. `services/02-ai-basics/07_langchain_multi_tools.py`: LangChain multi-tool agent (`get_weather`, arithmetic, population).
10. `services/03-ai-rag-chroma/01_chunking.py`: Document chunking service using `RecursiveCharacterTextSplitter`.
11. `services/03-ai-rag-chroma/02_embedding.py`: Sentence similarity computation via `all-MiniLM-L6-v2` embeddings.
12. `services/03-ai-rag-chroma/03_rag.py`: Paragraph retrieval-augmented generation service.
13. `services/04-ai-model-training-chromadb/01_model_training.py`: scikit-learn `RandomForestRegressor` delivery ETA model training and inference (`joblib`).
14. `services/04-ai-model-training-chromadb/02_chromadb.py`: Multi-file markdown notes (`docs/*.md`) chunking, OpenAI embedding, and ChromaDB Q&A.
15. `services/04-ai-model-training-chromadb/03_redis.py`: Redis-backed (with in-memory fallback) stateful multi-turn customer support agent with 3 order/refund tools.
16. `services/05-ai-aws-strands/01_hello_world_agent.py`: Minimal Strands agent on Amazon Bedrock Nova Lite.
17. `services/05-ai-aws-strands/02_hello_world_langgraph.py`: LangGraph ReAct agent loop on Bedrock Converse with a greeting tool.
18. `services/05-ai-aws-strands/03_function_to_tool.py`: Converting Python functions to agent tools via `@tool`, type hints, and docstrings.
19. `services/05-ai-aws-strands/04_tip_calculator.py`: Natural language intent-driven bill and tip calculator agent.
20. `services/05-ai-aws-strands/05_multi_tool_sales.py`: Autonomous sales pipeline orchestration (`get_data` -> `analyze` -> `email`).
21. `services/05-ai-aws-strands/06_custom_tool_inventory.py`: Domain-specific catalog stock lookup tool (`check_inventory`).
22. `services/05-ai-aws-strands/07_prebuilt_tools.py`: Math assistant agent using the prebuilt `strands_tools.calculator`.
23. `services/05-ai-aws-strands/08_multi_prebuilt_tools.py`: Multi-step pipeline with the prebuilt `http_request` and `calculator`.
24. `services/05-ai-aws-strands/09_use_aws.py`: Natural language AWS assistant using the prebuilt `use_aws` tool.
25. `services/05-ai-aws-strands/10_class_based_tools.py`: Class-based tools sharing state/connection pool.
26. `services/05-ai-aws-strands/11_async_tools.py`: Async Strands tool run with `agent.invoke_async` for parallel warehouse lookups.
27. `services/05-ai-aws-strands/12_travel_assistant.py`: Capstone travel agent combining weather forecasts, packing lists, and cost estimation.
28. `services/06-ai-systems/01_prompting_strategies.py`: Benchmarks Direct vs Zero-Shot CoT vs Few-Shot CoT on multi-step reasoning.
29. `services/06-ai-systems/02_sycophancy_trap.py`: 4-round escalating pushback evaluator testing model sycophancy and integrity.
30. `services/06-ai-systems/03_refund_bench.py`: 4-stage multi-judge food dispute adjudication pipeline with code-driven pricing.
31. `services/07-ai-reliability/01_cot_vs_direct.py`: Side-by-side reliability benchmark measuring CoT reasoning gains on logic puzzles.
32. `services/07-ai-reliability/02_variance_determinism.py`: Evaluates structured output consistency across Unconstrained, Prompt-Constrained, and Schema-Enforced modes.
33. `services/07-ai-reliability/03_tool_schema_calibration.py`: Measures routing sensitivity on function names vs docstrings via 2x2 matrix.
34. `services/07-ai-reliability/04_tool_error_injection.py`: Simulates upstream API outages (HTTP 503) to benchmark error transparency and hallucination prevention.
35. `services/08-ai-mcp-evals/01_mcp_client.py`: MCP client over stdio without an LLM (handshake, tool discovery, direct tool call).
36. `services/08-ai-mcp-evals/02_mcp_agent.py`: Groq agent that discovers and calls the MCP server's tools over stdio.
37. `services/08-ai-mcp-evals/03_mcp_evals.py`: 5-case eval suite running the MCP agent and asserting tool routing and facts.
38. `services/08-ai-mcp-evals/cricket_server.py`: FastMCP stdio server (demo live scores and player stats) started as a subprocess by `08-ai-mcp-evals` services.
39. `requirements.txt`: Python package dependencies.
40. `Dockerfile`: Container image build instructions using Python 3.12-slim and `uv`.
41. `.env.example`: Configuration variables for port, host, and API keys.

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
2. `GET /health`: Healthcheck endpoint reporting status and total service count (35).
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
13. `POST /api/model-training`: scikit-learn `RandomForestRegressor` delivery ETA training & prediction.
14. `POST /api/chromadb`: ChromaDB study notes RAG QA service.
15. `POST /api/redis`: Redis-backed stateful multi-turn support agent.
16. `POST /api/hello-world-agent`: Strands Bedrock Hello World agent.
17. `POST /api/langgraph-agent`: LangGraph tool-enabled ReAct agent.
18. `POST /api/function-to-tool`: Python function-to-tool server health checker.
19. `POST /api/tip-calculator`: Natural language tip and bill split agent.
20. `POST /api/multi-tool-sales`: Multi-tool sales operations planner.
21. `POST /api/custom-inventory`: Custom inventory catalog lookup agent.
22. `POST /api/prebuilt-calculator`: Math assistant using pre-built mathematical tool.
23. `POST /api/multi-prebuilt-tools`: Chained HTTP and math workflow agent.
24. `POST /api/use-aws`: Natural language AWS cloud management interface.
25. `POST /api/class-based-tools`: Class-based tools sharing state/connection pool.
26. `POST /api/async-tools`: Parallel async warehouse lookup agent.
27. `POST /api/travel-assistant`: Capstone weather, packing, and cost planner agent.
28. `POST /api/prompting-strategies`: Benchmarking Direct vs Zero-Shot CoT vs Few-Shot CoT.
29. `POST /api/sycophancy-trap`: Multi-turn pushback and capitulation evaluator.
30. `POST /api/refund-bench`: Multi-judge dispute adjudication pipeline.
31. `POST /api/cot-vs-direct`: CoT vs Direct reasoning reliability benchmark.
32. `POST /api/variance-determinism`: Structured output determinism evaluator.
33. `POST /api/tool-schema-calibration`: 2x2 tool schema routing calibration matrix.
34. `POST /api/tool-error-injection`: Upstream API error injection and hallucination test.
35. `POST /api/mcp-client`: Direct FastMCP protocol client.
36. `POST /api/mcp-agent`: LLM-guided FastMCP cricket assistant.
37. `POST /api/mcp-evals`: Automated assertion evaluation suite for FastMCP agent.
