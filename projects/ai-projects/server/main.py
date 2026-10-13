from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services import (
    AgentRequest,
    AgentResponse,
    ChatMessage,
    JokeRequest,
    JokeResponse,
    MemoryChatRequest,
    MemoryChatResponse,
    SummarizerRequest,
    SummarizerResponse,
    TravelRequest,
    TravelResponse,
    chat_with_memory,
    get_groq_joke,
    get_travel_suggestion,
    run_agent_with_tool,
    summarize,
)

# Load environment variables from root .env
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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
