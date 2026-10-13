import importlib
import sys

# Dynamically import service modules with numeric filename prefixes
chat_openai = importlib.import_module(".01_chat_openai", package=__name__)
chat_groq = importlib.import_module(".02_chat_groq", package=__name__)

# Register module aliases in sys.modules for backwards-compatibility
sys.modules[f"{__name__}.chat_openai"] = chat_openai
sys.modules[f"{__name__}.chat_groq"] = chat_groq

# Re-export service models and handlers
TravelRequest = chat_openai.TravelRequest
TravelResponse = chat_openai.TravelResponse
get_travel_suggestion = chat_openai.get_travel_suggestion

JokeRequest = chat_groq.JokeRequest
JokeResponse = chat_groq.JokeResponse
get_groq_joke = chat_groq.get_groq_joke

__all__ = [
    "chat_openai",
    "chat_groq",
    "TravelRequest",
    "TravelResponse",
    "get_travel_suggestion",
    "JokeRequest",
    "JokeResponse",
    "get_groq_joke",
]

