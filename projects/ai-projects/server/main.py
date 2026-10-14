from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services import (
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
)

# Load environment variables from root or local .env
load_dotenv(find_dotenv())

app = FastAPI(title="AI Projects API")

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
    return {"message": "AI Projects Server is running", "status": "ok"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


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
    message_text = (
        req.message.strip()
        if req.message
        else "What is the weather like in New York?"
    )
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
    message_text = (
        req.message.strip()
        if req.message
        else "What's the weather in Tokyo, and what is 12 times 12?"
    )
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
