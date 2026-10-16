import asyncio

from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from rate_limiter import check_rate_limit

from services import (
    # 02-ai-basics (01 - 07)
    AgentRequest,
    AgentResponse,
    ChatMessage,
    JokeRequest,
    JokeResponse,
    LangchainOneToolRequest,
    LangchainOneToolResponse,
    MemoryChatRequest,
    MemoryChatResponse,
    MultiToolAgentRequest,
    MultiToolAgentResponse,
    SummarizerRequest,
    SummarizerResponse,
    TravelRequest,
    TravelResponse,
    chat_with_memory,
    get_groq_joke,
    get_travel_suggestion,
    run_agent_with_tool,
    run_langchain_one_tool,
    run_multi_tool_agent,
    summarize,
    # 03-ai-rag-chroma (01 - 03)
    ChunkingRequest,
    ChunkingResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    RagRequest,
    RagResponse,
    answer_rag,
    chunk_text,
    compute_similarity,
    # 04-ai-model-training-chromadb (01 - 03)
    ModelTrainingRequest,
    ModelTrainingResponse,
    predict_delivery_eta,
    ChromaDbRequest,
    ChromaDbResponse,
    ask_chromadb_notes,
    RedisAgentRequest,
    RedisAgentResponse,
    run_redis_agent,
    # 05-ai-aws-strands (01 - 12)
    HelloWorldAgentRequest,
    HelloWorldAgentResponse,
    run_hello_world_agent,
    LangGraphAgentRequest,
    LangGraphAgentResponse,
    run_langgraph_agent,
    FunctionToToolRequest,
    FunctionToToolResponse,
    run_function_to_tool_agent,
    TipCalculatorRequest,
    TipCalculatorResponse,
    run_tip_calculator_agent,
    MultiToolSalesRequest,
    MultiToolSalesResponse,
    run_multi_tool_sales_agent,
    CustomInventoryRequest,
    CustomInventoryResponse,
    run_custom_inventory_agent,
    PrebuiltCalculatorRequest,
    PrebuiltCalculatorResponse,
    run_prebuilt_calculator_agent,
    MultiPrebuiltToolsRequest,
    MultiPrebuiltToolsResponse,
    run_multi_prebuilt_tools_agent,
    UseAwsRequest,
    UseAwsResponse,
    run_use_aws_agent,
    ClassBasedToolsRequest,
    ClassBasedToolsResponse,
    run_class_based_tools_agent,
    AsyncToolsRequest,
    AsyncToolsResponse,
    run_async_tools_agent,
    TravelAssistantRequest,
    TravelAssistantResponse,
    run_travel_assistant_agent,
    # 06-ai-systems (01 - 03)
    PromptingStrategiesRequest,
    PromptingStrategiesResponse,
    run_prompting_strategies,
    SycophancyTrapRequest,
    SycophancyTrapResponse,
    run_sycophancy_trap,
    RefundBenchRequest,
    RefundBenchResponse,
    run_refund_bench,
    # 07-ai-reliability (01 - 04)
    CotVsDirectRequest,
    CotVsDirectResponse,
    run_cot_vs_direct_benchmark,
    VarianceDeterminismRequest,
    VarianceDeterminismResponse,
    run_variance_determinism_benchmark,
    ToolSchemaCalibrationRequest,
    ToolSchemaCalibrationResponse,
    run_tool_schema_calibration,
    ToolErrorInjectionRequest,
    ToolErrorInjectionResponse,
    run_tool_error_injection,
    # 08-ai-mcp-evals (01 - 03)
    McpClientRequest,
    McpClientResponse,
    run_mcp_client,
    McpAgentRequest,
    McpAgentResponse,
    run_mcp_agent,
    McpEvalsResponse,
    run_mcp_evals_suite,
)

# Load environment variables
load_dotenv(find_dotenv())

app = FastAPI(title="AI POCs API")

# Rate limiting middleware enforcing 30 requests per hour on POST API endpoints
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # ① Apply rate limit to all mutating/action API requests (POST)
    if request.method == "POST":
        # ② Check rate limit against sliding window SQLite store
        blocked, msg, retry_after = check_rate_limit(
            request, max_requests=30, window_seconds=3600
        )
        if blocked:
            # ③ Return HTTP 429 with Retry-After and CORS headers
            return JSONResponse(
                status_code=429,
                content={"detail": msg, "error": msg},
                headers={
                    "Retry-After": str(retry_after),
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                },
            )
    return await call_next(request)


# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "AI POCs Server is running (35 Integrated Services)", "status": "ok"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "total_services": 35}


# ==============================================================================
# SECTION 1: AI BASICS (02-ai-basics: 01 - 07)
# ==============================================================================

@app.post("/api/travel", response_model=TravelResponse)
def travel_suggestion(req: TravelRequest):
    # ① Validate city input and delegate to OpenAI travel suggestion service
    if not req.city.strip():
        raise HTTPException(status_code=400, detail="City cannot be empty")
    try:
        # ② Invoke service and wrap in TravelResponse
        return TravelResponse(city=req.city, suggestion=get_travel_suggestion(req.city))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/joke", response_model=JokeResponse)
def joke_generator(req: JokeRequest):
    # ① Validate topic and call Groq joke generator service
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    try:
        return JokeResponse(topic=req.topic, joke=get_groq_joke(req.topic))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/summarize", response_model=SummarizerResponse)
def summarizer_service(req: SummarizerRequest):
    # ① Ensure input text is non-empty before summarizing via LangChain LCEL
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        return SummarizerResponse(text=req.text, summary=summarize(req.text))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/memory-chat", response_model=MemoryChatResponse)
def memory_chat_service(req: MemoryChatRequest):
    # ① Validate user message and pass conversation history to memory chat service
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, history = chat_with_memory(req.message, req.history)
        return MemoryChatResponse(message=req.message, response=reply, history=history)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/agent", response_model=AgentResponse)
def agent_service(req: AgentRequest):
    # ① Validate message and delegate to raw OpenAI single-tool agent
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        return AgentResponse(message=req.message, response=run_agent_with_tool(req.message))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/langchain-one-tool", response_model=LangchainOneToolResponse)
def langchain_one_tool_service(req: LangchainOneToolRequest):
    # ① Validate message and invoke LangChain single-tool agent
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, tool_called = run_langchain_one_tool(req.message)
        return LangchainOneToolResponse(message=req.message, response=reply, tool_called=tool_called)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-tool-agent", response_model=MultiToolAgentResponse)
def multi_tool_agent_service(req: MultiToolAgentRequest):
    # ① Validate message and invoke LangChain multi-tool agent
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, tool_called = run_multi_tool_agent(req.message)
        return MultiToolAgentResponse(message=req.message, response=reply, tool_called=tool_called)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 2: AI RAG & CHROMA (03-ai-rag-chroma: 01 - 03)
# ==============================================================================

@app.post("/api/chunk", response_model=ChunkingResponse)
def chunking_service(req: ChunkingRequest):
    # ① Validate text and split into overlapping chunks
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        chunks = chunk_text(req.text, req.chunk_size, req.chunk_overlap)
        return ChunkingResponse(
            total_chunks=len(chunks),
            chunk_size=req.chunk_size,
            chunk_overlap=req.chunk_overlap,
            chunks=chunks,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/embedding", response_model=EmbeddingResponse)
def embedding_service(req: EmbeddingRequest):
    # ① Validate both sentences and compute cosine similarity via SentenceTransformer
    if not req.text1.strip() or not req.text2.strip():
        raise HTTPException(status_code=400, detail="Both texts are required")
    try:
        return EmbeddingResponse(**compute_similarity(req.text1, req.text2))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/rag", response_model=RagResponse)
def rag_service(req: RagRequest):
    # ① Validate paragraph and question before running the 4-stage RAG pipeline
    if not req.paragraph.strip() or not req.question.strip():
        raise HTTPException(status_code=400, detail="Paragraph and question are required")
    try:
        return RagResponse(**answer_rag(req.paragraph, req.question))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 3: AI MODEL TRAINING, CHROMADB & REDIS (04-ai-model-training-chromadb: 01 - 03)
# ==============================================================================

@app.post("/api/model-training", response_model=ModelTrainingResponse)
def model_training_service(req: ModelTrainingRequest):
    # ① Validate order inputs and predict delivery ETA via trained RandomForestRegressor
    if req.distance_km <= 0 or req.prep_time_min <= 0:
        raise HTTPException(status_code=400, detail="Distance and prep time must be positive")
    try:
        return ModelTrainingResponse(
            **predict_delivery_eta(
                req.distance_km,
                req.prep_time_min,
                req.rider_available,
                req.is_raining,
            )
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/chromadb", response_model=ChromaDbResponse)
def chromadb_service(req: ChromaDbRequest):
    # ① Validate question, ingest markdown notes into ChromaDB if needed, and run RAG
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return ChromaDbResponse(**ask_chromadb_notes(req.question))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/redis", response_model=RedisAgentResponse)
def redis_agent_service(req: RedisAgentRequest):
    # ① Validate session_id and message and run DeskBuddy tool-calling agent with Redis memory
    if not req.session_id.strip() or not req.message.strip():
        raise HTTPException(status_code=400, detail="Session ID and message are required")
    try:
        return RedisAgentResponse(
            **run_redis_agent(req.session_id, req.message, req.reset_session)
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 4: AWS STRANDS & AGENT WORKFLOWS (05-ai-aws-strands: 01 - 12)
# ==============================================================================

@app.post("/api/hello-world-agent", response_model=HelloWorldAgentResponse)
def hello_world_agent_service(req: HelloWorldAgentRequest):
    # ① Validate prompt and invoke AWS Strands Hello World Agent
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return HelloWorldAgentResponse(**run_hello_world_agent(req.prompt))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/langgraph-agent", response_model=LangGraphAgentResponse)
def langgraph_agent_service(req: LangGraphAgentRequest):
    # ① Validate prompt and invoke LangGraph ReAct greeting agent
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return LangGraphAgentResponse(**run_langgraph_agent(req.prompt))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/function-to-tool", response_model=FunctionToToolResponse)
def function_to_tool_service(req: FunctionToToolRequest):
    # ① Validate question and invoke HTTP health-check tool agent
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return FunctionToToolResponse(**run_function_to_tool_agent(req.question))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tip-calculator", response_model=TipCalculatorResponse)
def tip_calculator_service(req: TipCalculatorRequest):
    # ① Validate query and run tip and bill-split agent
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return TipCalculatorResponse(**run_tip_calculator_agent(req.query))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-tool-sales", response_model=MultiToolSalesResponse)
def multi_tool_sales_service(req: MultiToolSalesRequest):
    # ① Validate task and execute chained 3-tool sales pipeline agent
    if not req.task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    try:
        return MultiToolSalesResponse(**run_multi_tool_sales_agent(req.task))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/custom-inventory", response_model=CustomInventoryResponse)
def custom_inventory_service(req: CustomInventoryRequest):
    # ① Validate question and query custom inventory tool agent
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return CustomInventoryResponse(**run_custom_inventory_agent(req.question))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/prebuilt-calculator", response_model=PrebuiltCalculatorResponse)
def prebuilt_calculator_service(req: PrebuiltCalculatorRequest):
    # ① Validate query and invoke safe AST math calculator agent
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return PrebuiltCalculatorResponse(**run_prebuilt_calculator_agent(req.query))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-prebuilt-tools", response_model=MultiPrebuiltToolsResponse)
def multi_prebuilt_tools_service(req: MultiPrebuiltToolsRequest):
    # ① Validate task and execute multi-prebuilt tools pipeline agent
    if not req.task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")
    try:
        return MultiPrebuiltToolsResponse(**run_multi_prebuilt_tools_agent(req.task))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/use-aws", response_model=UseAwsResponse)
def use_aws_service(req: UseAwsRequest):
    # ① Validate prompt and invoke AWS cloud assistant agent
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    try:
        return UseAwsResponse(**run_use_aws_agent(req.prompt))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/class-based-tools", response_model=ClassBasedToolsResponse)
def class_based_tools_service(req: ClassBasedToolsRequest):
    # ① Validate query and run stateful class-based inventory tools agent
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return ClassBasedToolsResponse(**run_class_based_tools_agent(req.query))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/async-tools", response_model=AsyncToolsResponse)
def async_tools_service(req: AsyncToolsRequest):
    # ① Validate query and run async parallel warehouse tools agent
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return AsyncToolsResponse(**asyncio.run(run_async_tools_agent(req.query)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/travel-assistant", response_model=TravelAssistantResponse)
def travel_assistant_service(req: TravelAssistantRequest):
    # ① Validate query and invoke 5-tool capstone travel planner agent
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return TravelAssistantResponse(**run_travel_assistant_agent(req.query))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 5: 06-AI-SYSTEMS (26 - 28)
# ==============================================================================

@app.post("/api/prompting-strategies", response_model=PromptingStrategiesResponse)
def prompting_strategies_service(req: PromptingStrategiesRequest):
    # ① Execute Direct, Zero-Shot CoT, and Few-Shot CoT benchmark
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return PromptingStrategiesResponse(
            **run_prompting_strategies(req.question, req.expected_answer, req.model, req.temperature)
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/sycophancy-trap", response_model=SycophancyTrapResponse)
def sycophancy_trap_service(req: SycophancyTrapRequest):
    # ① Execute multi-turn sycophancy resilience benchmark
    try:
        return SycophancyTrapResponse(
            **run_sycophancy_trap(req.case_type, req.model, req.temperature)
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/refund-bench", response_model=RefundBenchResponse)
def refund_bench_service(req: RefundBenchRequest):
    # ① Execute 4-stage multi-judge food dispute adjudication pipeline
    try:
        return RefundBenchResponse(
            **run_refund_bench(req.complaint_text, req.bench, req.cap)
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 6: 07-AI-RELIABILITY (29 - 32)
# ==============================================================================

@app.post("/api/cot-vs-direct", response_model=CotVsDirectResponse)
def cot_vs_direct_service(req: CotVsDirectRequest):
    # ① Run Chain-of-Thought vs Direct answer benchmark
    try:
        return CotVsDirectResponse(**run_cot_vs_direct_benchmark(req.problem_title))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/variance-determinism", response_model=VarianceDeterminismResponse)
def variance_determinism_service(req: VarianceDeterminismRequest):
    # ① Run Structured Output determinism benchmark across 3 JSON strategies
    if not req.review_text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty")
    try:
        return VarianceDeterminismResponse(**run_variance_determinism_benchmark(req.review_text))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tool-schema-calibration", response_model=ToolSchemaCalibrationResponse)
def tool_schema_calibration_service(req: ToolSchemaCalibrationRequest):
    # ① Run 2x2 tool schema routing calibration benchmark
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        return ToolSchemaCalibrationResponse(**run_tool_schema_calibration(req.query))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tool-error-injection", response_model=ToolErrorInjectionResponse)
def tool_error_injection_service(req: ToolErrorInjectionRequest):
    # ① Run HTTP 503 tool error injection and hallucination scoring benchmark
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return ToolErrorInjectionResponse(**run_tool_error_injection(req.question))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 7: 08-AI-MCP-EVALS (33 - 35)
# ==============================================================================

@app.post("/api/mcp-client", response_model=McpClientResponse)
def mcp_client_service(req: McpClientRequest):
    # ① Invoke a FastMCP tool directly over stdio, without an LLM
    try:
        return McpClientResponse(**asyncio.run(run_mcp_client(req.tool_name, req.tool_args)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/mcp-agent", response_model=McpAgentResponse)
def mcp_agent_service(req: McpAgentRequest):
    # ① Run LLM agent connected to FastMCP cricket tools
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        return McpAgentResponse(**asyncio.run(run_mcp_agent(req.question)))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/mcp-evals", response_model=McpEvalsResponse)
def mcp_evals_service():
    # ① Execute MCP agent evaluation suite and return assertion metrics
    try:
        return McpEvalsResponse(**asyncio.run(run_mcp_evals_suite()))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
