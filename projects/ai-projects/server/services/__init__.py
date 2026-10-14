import importlib
import sys

# Dynamically import service modules with numeric filename prefixes
chat_openai = importlib.import_module(".01_chat_openai", package=__name__)
chat_groq = importlib.import_module(".02_chat_groq", package=__name__)
langchain_summarizer = importlib.import_module(".03_langchain_summarizer", package=__name__)
langchain_memory_chat = importlib.import_module(".04_langchain_memory_chat", package=__name__)
agent_one_tool = importlib.import_module(".05_agent_one_tool", package=__name__)
langchain_one_tool = importlib.import_module(".06_langchain_one_tool", package=__name__)
langchain_multi_tools = importlib.import_module(".07_langchain_multi_tools", package=__name__)
chunking = importlib.import_module(".08_chunking", package=__name__)
embedding = importlib.import_module(".09_embedding", package=__name__)
rag = importlib.import_module(".10_rag", package=__name__)

# Register canonical module paths in sys.modules
sys.modules[f"{__name__}.chat_openai"] = chat_openai
sys.modules[f"{__name__}.chat_groq"] = chat_groq
sys.modules[f"{__name__}.langchain_summarizer"] = langchain_summarizer
sys.modules[f"{__name__}.langchain_memory_chat"] = langchain_memory_chat
sys.modules[f"{__name__}.agent_one_tool"] = agent_one_tool
sys.modules[f"{__name__}.langchain_one_tool"] = langchain_one_tool
sys.modules[f"{__name__}.langchain_multi_tools"] = langchain_multi_tools
sys.modules[f"{__name__}.chunking"] = chunking
sys.modules[f"{__name__}.embedding"] = embedding
sys.modules[f"{__name__}.rag"] = rag

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

LangchainOneToolRequest = langchain_one_tool.LangchainOneToolRequest
LangchainOneToolResponse = langchain_one_tool.LangchainOneToolResponse
run_langchain_one_tool = langchain_one_tool.run_langchain_one_tool

MultiToolAgentRequest = langchain_multi_tools.MultiToolAgentRequest
MultiToolAgentResponse = langchain_multi_tools.MultiToolAgentResponse
run_multi_tool_agent = langchain_multi_tools.run_multi_tool_agent

ChunkingRequest = chunking.ChunkingRequest
ChunkingResponse = chunking.ChunkingResponse
chunk_text = chunking.chunk_text

EmbeddingRequest = embedding.EmbeddingRequest
EmbeddingResponse = embedding.EmbeddingResponse
compute_similarity = embedding.compute_similarity

RagRequest = rag.RagRequest
RagResponse = rag.RagResponse
answer_rag = rag.answer_rag

__all__ = [
    "chat_openai",
    "chat_groq",
    "langchain_summarizer",
    "langchain_memory_chat",
    "agent_one_tool",
    "langchain_one_tool",
    "langchain_multi_tools",
    "chunking",
    "embedding",
    "rag",
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
    "LangchainOneToolRequest",
    "LangchainOneToolResponse",
    "run_langchain_one_tool",
    "MultiToolAgentRequest",
    "MultiToolAgentResponse",
    "run_multi_tool_agent",
    "ChunkingRequest",
    "ChunkingResponse",
    "chunk_text",
    "EmbeddingRequest",
    "EmbeddingResponse",
    "compute_similarity",
    "RagRequest",
    "RagResponse",
    "answer_rag",
]
