import importlib
import sys

# Dynamically import service modules with numeric filename prefixes
chat_openai = importlib.import_module(".01_chat_openai", package=__name__)
chat_groq = importlib.import_module(".02_chat_groq", package=__name__)
agent_one_tool = importlib.import_module(".03_agent_one_tool", package=__name__)

# Register module aliases in sys.modules for backwards-compatibility
sys.modules[f"{__name__}.chat_openai"] = chat_openai
sys.modules[f"{__name__}.chat_groq"] = chat_groq
sys.modules[f"{__name__}.agent_one_tool"] = agent_one_tool

# Re-export service models and handlers
TravelRequest = chat_openai.TravelRequest
TravelResponse = chat_openai.TravelResponse
get_travel_suggestion = chat_openai.get_travel_suggestion

JokeRequest = chat_groq.JokeRequest
JokeResponse = chat_groq.JokeResponse
get_groq_joke = chat_groq.get_groq_joke

AgentRequest = agent_one_tool.AgentRequest
AgentResponse = agent_one_tool.AgentResponse
run_agent_with_tool = agent_one_tool.run_agent_with_tool
agent = agent_one_tool.agent

__all__ = [
    "chat_openai",
    "chat_groq",
    "agent_one_tool",
    "TravelRequest",
    "TravelResponse",
    "get_travel_suggestion",
    "JokeRequest",
    "JokeResponse",
    "get_groq_joke",
    "AgentRequest",
    "AgentResponse",
    "run_agent_with_tool",
    "agent",
]

