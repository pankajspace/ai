import importlib
import sys

# Dynamically import service modules with numeric filename prefixes
chat_openai = importlib.import_module(".01_chat_openai", package=__name__)
chat_groq = importlib.import_module(".02_chat_groq", package=__name__)
langchain_summarizer = importlib.import_module(".03_langchain_summarizer", package=__name__)
langchain_memory_chat = importlib.import_module(".04_langchain_memory_chat", package=__name__)
agent_one_tool = importlib.import_module(".05_agent_one_tool", package=__name__)

# Register canonical module paths in sys.modules
sys.modules[f"{__name__}.chat_openai"] = chat_openai
sys.modules[f"{__name__}.chat_groq"] = chat_groq
sys.modules[f"{__name__}.langchain_summarizer"] = langchain_summarizer
sys.modules[f"{__name__}.langchain_memory_chat"] = langchain_memory_chat
sys.modules[f"{__name__}.agent_one_tool"] = agent_one_tool

# Re-export service models and handlers
TravelRequest = chat_openai.TravelRequest
TravelResponse = chat_openai.TravelResponse
get_travel_suggestion = chat_openai.get_travel_suggestion

JokeRequest = chat_groq.JokeRequest
JokeResponse = chat_groq.JokeResponse
get_groq_joke = chat_groq.get_groq_joke

SummarizerRequest = langchain_summarizer.SummarizerRequest
SummarizerResponse = langchain_summarizer.SummarizerResponse
summarize = langchain_summarizer.summarize

ChatMessage = langchain_memory_chat.ChatMessage
MemoryChatRequest = langchain_memory_chat.MemoryChatRequest
MemoryChatResponse = langchain_memory_chat.MemoryChatResponse
chat_with_memory = langchain_memory_chat.chat_with_memory

AgentRequest = agent_one_tool.AgentRequest
AgentResponse = agent_one_tool.AgentResponse
run_agent_with_tool = agent_one_tool.run_agent_with_tool

__all__ = [
    "chat_openai",
    "chat_groq",
    "langchain_summarizer",
    "langchain_memory_chat",
    "agent_one_tool",
    "TravelRequest",
    "TravelResponse",
    "get_travel_suggestion",
    "JokeRequest",
    "JokeResponse",
    "get_groq_joke",
    "SummarizerRequest",
    "SummarizerResponse",
    "summarize",
    "ChatMessage",
    "MemoryChatRequest",
    "MemoryChatResponse",
    "chat_with_memory",
    "AgentRequest",
    "AgentResponse",
    "run_agent_with_tool",
]
