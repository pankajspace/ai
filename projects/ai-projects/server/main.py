from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.chat_gemini import JokeRequest, JokeResponse, get_gemini_joke
from services.chat_openai import TravelRequest, TravelResponse, get_travel_suggestion

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
        joke_text = get_gemini_joke(topic_name)
        return JokeResponse(topic=topic_name, joke=joke_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
