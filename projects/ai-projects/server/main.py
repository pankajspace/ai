import threading
from contextlib import asynccontextmanager
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services import (
    # 01 - 10
    AgentRequest,
    AgentResponse,
    ChatMessage,
    ChunkingRequest,
    ChunkingResponse,
    EmbeddingRequest,
    EmbeddingResponse,
    JokeRequest,
    JokeResponse,
    LangchainOneToolRequest,
    LangchainOneToolResponse,
    MemoryChatRequest,
    MemoryChatResponse,
    MultiToolAgentRequest,
    MultiToolAgentResponse,
    RagRequest,
    RagResponse,
    SummarizerRequest,
    SummarizerResponse,
    TravelRequest,
    TravelResponse,
    answer_rag,
    chat_with_memory,
    chunk_text,
    compute_similarity,
    get_groq_joke,
    get_travel_suggestion,
    run_agent_with_tool,
    run_langchain_one_tool,
    run_multi_tool_agent,
    summarize,
    # 11 - 22: AWS Strands
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
    # 23 - 24: AI Systems
    PromptingStrategiesRequest,
    PromptingStrategiesResponse,
    run_prompting_strategies,
    SycophancyTrapRequest,
    SycophancyTrapResponse,
    run_sycophancy_trap,
    # 25 - 28: AI Reliability
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
    # 29 - 31: MCP & Evals
    McpClientRequest,
    McpClientResponse,
    run_mcp_client,
    McpAgentRequest,
    McpAgentResponse,
    run_mcp_agent,
    McpEvalsRequest,
    McpEvalsResponse,
    run_mcp_evals_suite,
)

# Load environment variables
load_dotenv(find_dotenv())


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm SentenceTransformer in background
    def warmup_embedding():
        try:
            compute_similarity("warmup", "warmup")
        except Exception:
            pass

    threading.Thread(target=warmup_embedding, daemon=True).start()
    yield


app = FastAPI(title="AI Projects API", lifespan=lifespan)

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
    return {"message": "AI Projects Server is running (31 Integrated Services)", "status": "ok"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "total_services": 31}


# ==============================================================================
# SECTION 1: AI BASICS (01 - 10)
# ==============================================================================

@app.post("/api/travel", response_model=TravelResponse)
def travel_suggestion(req: TravelRequest):
    city_name = req.city.strip() if req.city else "Bangalore"
    if not city_name:
        raise HTTPException(status_code=400, detail="City cannot be empty")
    try:
        suggestion = get_travel_suggestion(city_name)
        return TravelResponse(city=city_name, suggestion=suggestion)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/joke", response_model=JokeResponse)
def joke_generator(req: JokeRequest):
    topic_name = req.topic.strip() if req.topic else "programming"
    try:
        joke_text = get_groq_joke(topic_name)
        return JokeResponse(topic=topic_name, joke=joke_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/summarize", response_model=SummarizerResponse)
def summarizer_service(req: SummarizerRequest):
    text_content = req.text.strip() if req.text else ""
    if not text_content:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        summary_result = summarize(text_content)
        return SummarizerResponse(text=text_content, summary=summary_result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/memory-chat", response_model=MemoryChatResponse)
def memory_chat_service(req: MemoryChatRequest):
    message_text = req.message.strip() if req.message else ""
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, updated_history = chat_with_memory(message_text, req.history)
        return MemoryChatResponse(
            message=message_text,
            response=reply,
            history=updated_history,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/agent", response_model=AgentResponse)
def agent_service(req: AgentRequest):
    message_text = req.message.strip() if req.message else "How much are the shoes?"
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply = run_agent_with_tool(message_text)
        return AgentResponse(message=message_text, response=reply)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/langchain-one-tool", response_model=LangchainOneToolResponse)
@app.post("/api/langchain-agent", response_model=LangchainOneToolResponse)
def langchain_one_tool_service(req: LangchainOneToolRequest):
    message_text = req.message.strip() if req.message else "What is the weather like in New York?"
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, tool_called = run_langchain_one_tool(message_text)
        return LangchainOneToolResponse(
            message=message_text,
            response=reply,
            tool_called=tool_called,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-tool-agent", response_model=MultiToolAgentResponse)
def multi_tool_agent_service(req: MultiToolAgentRequest):
    message_text = req.message.strip() if req.message else "What's the weather in Tokyo, and what is 12 times 12?"
    if not message_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    try:
        reply, tool_called = run_multi_tool_agent(message_text)
        return MultiToolAgentResponse(
            message=message_text,
            response=reply,
            tool_called=tool_called,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/chunk", response_model=ChunkingResponse)
def chunking_service(req: ChunkingRequest):
    text_content = req.text.strip() if req.text else ""
    if not text_content:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        chunks = chunk_text(
            text=text_content,
            chunk_size=req.chunk_size,
            chunk_overlap=req.chunk_overlap,
        )
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
    text1 = req.text1.strip() if req.text1 else ""
    text2 = req.text2.strip() if req.text2 else ""
    if not text1 or not text2:
        raise HTTPException(status_code=400, detail="Both texts are required")
    try:
        res = compute_similarity(text1, text2)
        return EmbeddingResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/rag", response_model=RagResponse)
def rag_service(req: RagRequest):
    paragraph = req.paragraph.strip() if req.paragraph else ""
    question = req.question.strip() if req.question else ""
    if not paragraph:
        raise HTTPException(status_code=400, detail="Paragraph cannot be empty")
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        res = answer_rag(paragraph=paragraph, question=question)
        return RagResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 2: AWS STRANDS & AGENT WORKFLOWS (11 - 22)
# ==============================================================================

@app.post("/api/hello-world-agent", response_model=HelloWorldAgentResponse)
def hello_world_agent_service(req: HelloWorldAgentRequest):
    prompt_text = req.prompt.strip() if req.prompt else "Hello! Tell me a fun fact about AI agents."
    try:
        res = run_hello_world_agent(prompt_text)
        return HelloWorldAgentResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/langgraph-agent", response_model=LangGraphAgentResponse)
def langgraph_agent_service(req: LangGraphAgentRequest):
    prompt_text = req.prompt.strip() if req.prompt else "Please greet Alice and Bob."
    try:
        res = run_langgraph_agent(prompt_text)
        return LangGraphAgentResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/function-to-tool", response_model=FunctionToToolResponse)
def function_to_tool_service(req: FunctionToToolRequest):
    q = req.question.strip() if req.question else "Is the staging server running? Check https://httpbin.org/get"
    try:
        res = run_function_to_tool_agent(q)
        return FunctionToToolResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tip-calculator", response_model=TipCalculatorResponse)
def tip_calculator_service(req: TipCalculatorRequest):
    q = req.query.strip() if req.query else "The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?"
    try:
        res = run_tip_calculator_agent(q)
        return TipCalculatorResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-tool-sales", response_model=MultiToolSalesResponse)
def multi_tool_sales_service(req: MultiToolSalesRequest):
    task_text = req.task.strip() if req.task else "Pull last quarter's sales data and email a summary to the team"
    try:
        res = run_multi_tool_sales_agent(task_text)
        return MultiToolSalesResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/custom-inventory", response_model=CustomInventoryResponse)
def custom_inventory_service(req: CustomInventoryRequest):
    q = req.question.strip() if req.question else "Is PROD-123 in stock?"
    try:
        res = run_custom_inventory_agent(q)
        return CustomInventoryResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/prebuilt-calculator", response_model=PrebuiltCalculatorResponse)
def prebuilt_calculator_service(req: PrebuiltCalculatorRequest):
    q = req.query.strip() if req.query else "What's 42 raised to the power of 9?"
    try:
        res = run_prebuilt_calculator_agent(q)
        return PrebuiltCalculatorResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/multi-prebuilt-tools", response_model=MultiPrebuiltToolsResponse)
def multi_prebuilt_tools_service(req: MultiPrebuiltToolsRequest):
    t = req.task.strip() if req.task else "Fetch crypto data from https://api.coindesk.com/v1/bpi/currentprice.json, extract USD rate, and write a summary to crypto_summary.txt"
    try:
        res = run_multi_prebuilt_tools_agent(t)
        return MultiPrebuiltToolsResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/use-aws", response_model=UseAwsResponse)
def use_aws_service(req: UseAwsRequest):
    p = req.prompt.strip() if req.prompt else "List all S3 buckets in my account"
    try:
        res = run_use_aws_agent(p)
        return UseAwsResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/class-based-tools", response_model=ClassBasedToolsResponse)
def class_based_tools_service(req: ClassBasedToolsRequest):
    q = req.query.strip() if req.query else "Update PROD-456 stock to 25 units, then confirm the new level"
    try:
        res = run_class_based_tools_agent(q)
        return ClassBasedToolsResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/async-tools", response_model=AsyncToolsResponse)
def async_tools_service(req: AsyncToolsRequest):
    q = req.query.strip() if req.query else "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central."
    try:
        res = run_async_tools_agent(q)
        return AsyncToolsResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/travel-assistant", response_model=TravelAssistantResponse)
def travel_assistant_service(req: TravelAssistantRequest):
    q = req.query.strip() if req.query else "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. What should I pack, and does it fit my budget?"
    try:
        res = run_travel_assistant_agent(q)
        return TravelAssistantResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 3: AI SYSTEMS & PROMPTING STRATEGIES (23 - 24)
# ==============================================================================

@app.post("/api/prompting-strategies", response_model=PromptingStrategiesResponse)
def prompting_strategies_service(req: PromptingStrategiesRequest):
    try:
        res = run_prompting_strategies(
            question=req.question,
            expected_answer=req.expected_answer or "293",
        )
        return PromptingStrategiesResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/sycophancy-trap", response_model=SycophancyTrapResponse)
def sycophancy_trap_service(req: SycophancyTrapRequest):
    try:
        res = run_sycophancy_trap(
            case_type=req.case_type or "Math Gaslight",
            custom_question=req.custom_question,
            custom_pushbacks=req.custom_pushbacks,
            correct_answer=req.correct_answer,
            capitulation_markers=req.capitulation_markers,
        )
        return SycophancyTrapResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 4: AI RELIABILITY & CALIBRATION (25 - 28)
# ==============================================================================

@app.post("/api/cot-vs-direct", response_model=CotVsDirectResponse)
def cot_vs_direct_service(req: CotVsDirectRequest):
    try:
        res = run_cot_vs_direct_benchmark(
            problem_title=req.problem_title or "Spatial Navigation (Grid)",
            custom_question=req.custom_question,
            custom_correct_answers=req.custom_correct_answers,
        )
        return CotVsDirectResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/variance-determinism", response_model=VarianceDeterminismResponse)
def variance_determinism_service(req: VarianceDeterminismRequest):
    try:
        res = run_variance_determinism_benchmark(review_text=req.review_text)
        return VarianceDeterminismResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tool-schema-calibration", response_model=ToolSchemaCalibrationResponse)
def tool_schema_calibration_service(req: ToolSchemaCalibrationRequest):
    try:
        res = run_tool_schema_calibration(query=req.query)
        return ToolSchemaCalibrationResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/tool-error-injection", response_model=ToolErrorInjectionResponse)
def tool_error_injection_service(req: ToolErrorInjectionRequest):
    try:
        res = run_tool_error_injection(question=req.question)
        return ToolErrorInjectionResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ==============================================================================
# SECTION 5: MODEL CONTEXT PROTOCOL & EVALS (29 - 31)
# ==============================================================================

@app.post("/api/mcp-client", response_model=McpClientResponse)
def mcp_client_service(req: McpClientRequest):
    try:
        res = run_mcp_client(tool_name=req.tool_name, tool_args=req.tool_args)
        return McpClientResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/mcp-agent", response_model=McpAgentResponse)
def mcp_agent_service(req: McpAgentRequest):
    try:
        res = run_mcp_agent(question=req.question)
        return McpAgentResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/mcp-evals", response_model=McpEvalsResponse)
def mcp_evals_service(req: McpEvalsRequest):
    try:
        res = run_mcp_evals_suite(run_all=req.run_all)
        return McpEvalsResponse(**res)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
