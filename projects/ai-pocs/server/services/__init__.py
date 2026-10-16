import importlib.util
import sys
from pathlib import Path

_SERVICES_DIR = Path(__file__).resolve().parent


def _load_service(folder: str, filename: str, alias: str):
    """Load a numbered service module from its practice-aligned domain subfolder."""
    module_name = f"{__name__}.{alias}"
    file_path = _SERVICES_DIR / folder / filename
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load service module from {file_path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod


# Domain 01: AI Basics & LangChain (01-ai-basics)
chat_openai = _load_service("01-ai-basics", "01_chat_openai.py", "chat_openai")
chat_groq = _load_service("01-ai-basics", "02_chat_groq.py", "chat_groq")
langchain_summarizer = _load_service("01-ai-basics", "03_langchain_summarizer.py", "langchain_summarizer")
langchain_memory_chat = _load_service("01-ai-basics", "04_langchain_memory_chat.py", "langchain_memory_chat")
agent_one_tool = _load_service("01-ai-basics", "05_agent_one_tool.py", "agent_one_tool")
langchain_one_tool = _load_service("01-ai-basics", "06_langchain_one_tool.py", "langchain_one_tool")
langchain_multi_tools = _load_service("01-ai-basics", "07_langchain_multi_tools.py", "langchain_multi_tools")

# Domain 02: AI RAG & Chroma (02-ai-rag-chroma)
chunking = _load_service("02-ai-rag-chroma", "01_chunking.py", "chunking")
embedding = _load_service("02-ai-rag-chroma", "02_embedding.py", "embedding")
rag = _load_service("02-ai-rag-chroma", "03_rag.py", "rag")

# Domain 03: AI Model Training, ChromaDB & Redis (03-ai-model-training-chromadb)
model_training = _load_service("03-ai-model-training-chromadb", "01_model_training.py", "model_training")
chromadb_rag = _load_service("03-ai-model-training-chromadb", "02_chromadb.py", "chromadb_rag")
redis_agent = _load_service("03-ai-model-training-chromadb", "03_redis.py", "redis_agent")

# Domain 04: AWS Strands & Agent Workflows (04-ai-aws-strands)
hello_world_agent = _load_service("04-ai-aws-strands", "01_hello_world_agent.py", "hello_world_agent")
hello_world_langgraph = _load_service("04-ai-aws-strands", "02_hello_world_langgraph.py", "hello_world_langgraph")
function_to_tool = _load_service("04-ai-aws-strands", "03_function_to_tool.py", "function_to_tool")
tip_calculator = _load_service("04-ai-aws-strands", "04_tip_calculator.py", "tip_calculator")
multi_tool_sales = _load_service("04-ai-aws-strands", "05_multi_tool_sales.py", "multi_tool_sales")
custom_tool_inventory = _load_service("04-ai-aws-strands", "06_custom_tool_inventory.py", "custom_tool_inventory")
prebuilt_tools = _load_service("04-ai-aws-strands", "07_prebuilt_tools.py", "prebuilt_tools")
multi_prebuilt_tools = _load_service("04-ai-aws-strands", "08_multi_prebuilt_tools.py", "multi_prebuilt_tools")
use_aws = _load_service("04-ai-aws-strands", "09_use_aws.py", "use_aws")
class_based_tools = _load_service("04-ai-aws-strands", "10_class_based_tools.py", "class_based_tools")
async_tools = _load_service("04-ai-aws-strands", "11_async_tools.py", "async_tools")
travel_assistant = _load_service("04-ai-aws-strands", "12_travel_assistant.py", "travel_assistant")

# Domain 05: AI Systems & Prompting Strategies (05-ai-systems)
prompting_strategies = _load_service("05-ai-systems", "01_prompting_strategies.py", "prompting_strategies")
sycophancy_trap = _load_service("05-ai-systems", "02_sycophancy_trap.py", "sycophancy_trap")
refund_bench = _load_service("05-ai-systems", "03_refund_bench.py", "refund_bench")

# Domain 06: AI Reliability & Calibration (06-ai-reliability)
cot_vs_direct = _load_service("06-ai-reliability", "01_cot_vs_direct.py", "cot_vs_direct")
variance_determinism = _load_service("06-ai-reliability", "02_variance_determinism.py", "variance_determinism")
tool_schema_calibration = _load_service("06-ai-reliability", "03_tool_schema_calibration.py", "tool_schema_calibration")
tool_error_injection = _load_service("06-ai-reliability", "04_tool_error_injection.py", "tool_error_injection")

# Domain 07: MCP & Evals (07-ai-mcp-evals)
mcp_client = _load_service("07-ai-mcp-evals", "01_mcp_client.py", "mcp_client")
mcp_agent = _load_service("07-ai-mcp-evals", "02_mcp_agent.py", "mcp_agent")
mcp_evals = _load_service("07-ai-mcp-evals", "03_mcp_evals.py", "mcp_evals")

service_registry = {
    "chat_openai": chat_openai,
    "chat_groq": chat_groq,
    "langchain_summarizer": langchain_summarizer,
    "langchain_memory_chat": langchain_memory_chat,
    "agent_one_tool": agent_one_tool,
    "langchain_one_tool": langchain_one_tool,
    "langchain_multi_tools": langchain_multi_tools,
    "chunking": chunking,
    "embedding": embedding,
    "rag": rag,
    "model_training": model_training,
    "chromadb_rag": chromadb_rag,
    "redis_agent": redis_agent,
    "hello_world_agent": hello_world_agent,
    "hello_world_langgraph": hello_world_langgraph,
    "function_to_tool": function_to_tool,
    "tip_calculator": tip_calculator,
    "multi_tool_sales": multi_tool_sales,
    "custom_tool_inventory": custom_tool_inventory,
    "prebuilt_tools": prebuilt_tools,
    "multi_prebuilt_tools": multi_prebuilt_tools,
    "use_aws": use_aws,
    "class_based_tools": class_based_tools,
    "async_tools": async_tools,
    "travel_assistant": travel_assistant,
    "prompting_strategies": prompting_strategies,
    "sycophancy_trap": sycophancy_trap,
    "refund_bench": refund_bench,
    "cot_vs_direct": cot_vs_direct,
    "variance_determinism": variance_determinism,
    "tool_schema_calibration": tool_schema_calibration,
    "tool_error_injection": tool_error_injection,
    "mcp_client": mcp_client,
    "mcp_agent": mcp_agent,
    "mcp_evals": mcp_evals,
}

# Re-export service models and handlers
# 01-ai-basics (01 - 07)
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

# 02-ai-rag-chroma (01 - 03)
ChunkingRequest = chunking.ChunkingRequest
ChunkingResponse = chunking.ChunkingResponse
chunk_text = chunking.chunk_text

EmbeddingRequest = embedding.EmbeddingRequest
EmbeddingResponse = embedding.EmbeddingResponse
compute_similarity = embedding.compute_similarity

RagRequest = rag.RagRequest
RagResponse = rag.RagResponse
answer_rag = rag.answer_rag

# 03-ai-model-training-chromadb (01 - 03)
ModelTrainingRequest = model_training.ModelTrainingRequest
ModelTrainingResponse = model_training.ModelTrainingResponse
predict_delivery_eta = model_training.predict_delivery_eta

ChromaDbRequest = chromadb_rag.ChromaDbRequest
ChromaDbSource = chromadb_rag.ChromaDbSource
ChromaDbResponse = chromadb_rag.ChromaDbResponse
ask_chromadb_notes = chromadb_rag.ask_chromadb_notes

RedisAgentRequest = redis_agent.RedisAgentRequest
RedisAgentToolCall = redis_agent.RedisAgentToolCall
RedisAgentResponse = redis_agent.RedisAgentResponse
run_redis_agent = redis_agent.run_redis_agent

# 04-ai-aws-strands (01 - 12)
HelloWorldAgentRequest = hello_world_agent.HelloWorldAgentRequest
HelloWorldAgentResponse = hello_world_agent.HelloWorldAgentResponse
run_hello_world_agent = hello_world_agent.run_hello_world_agent

LangGraphAgentRequest = hello_world_langgraph.LangGraphAgentRequest
LangGraphAgentResponse = hello_world_langgraph.LangGraphAgentResponse
run_langgraph_agent = hello_world_langgraph.run_langgraph_agent

FunctionToToolRequest = function_to_tool.FunctionToToolRequest
FunctionToToolResponse = function_to_tool.FunctionToToolResponse
run_function_to_tool_agent = function_to_tool.run_function_to_tool_agent

TipCalculatorRequest = tip_calculator.TipCalculatorRequest
TipCalculatorResponse = tip_calculator.TipCalculatorResponse
run_tip_calculator_agent = tip_calculator.run_tip_calculator_agent

MultiToolSalesRequest = multi_tool_sales.MultiToolSalesRequest
MultiToolSalesResponse = multi_tool_sales.MultiToolSalesResponse
run_multi_tool_sales_agent = multi_tool_sales.run_multi_tool_sales_agent

CustomInventoryRequest = custom_tool_inventory.CustomInventoryRequest
CustomInventoryResponse = custom_tool_inventory.CustomInventoryResponse
run_custom_inventory_agent = custom_tool_inventory.run_custom_inventory_agent

PrebuiltCalculatorRequest = prebuilt_tools.PrebuiltCalculatorRequest
PrebuiltCalculatorResponse = prebuilt_tools.PrebuiltCalculatorResponse
run_prebuilt_calculator_agent = prebuilt_tools.run_prebuilt_calculator_agent

MultiPrebuiltToolsRequest = multi_prebuilt_tools.MultiPrebuiltToolsRequest
MultiPrebuiltToolsResponse = multi_prebuilt_tools.MultiPrebuiltToolsResponse
run_multi_prebuilt_tools_agent = multi_prebuilt_tools.run_multi_prebuilt_tools_agent

UseAwsRequest = use_aws.UseAwsRequest
UseAwsResponse = use_aws.UseAwsResponse
run_use_aws_agent = use_aws.run_use_aws_agent

ClassBasedToolsRequest = class_based_tools.ClassBasedToolsRequest
ClassBasedToolsResponse = class_based_tools.ClassBasedToolsResponse
run_class_based_tools_agent = class_based_tools.run_class_based_tools_agent

AsyncToolsRequest = async_tools.AsyncToolsRequest
AsyncToolsResponse = async_tools.AsyncToolsResponse
run_async_tools_agent = async_tools.run_async_tools_agent

TravelAssistantRequest = travel_assistant.TravelAssistantRequest
TravelAssistantResponse = travel_assistant.TravelAssistantResponse
run_travel_assistant_agent = travel_assistant.run_travel_assistant_agent

# 05-ai-systems (01 - 03)
PromptingStrategiesRequest = prompting_strategies.PromptingStrategiesRequest
PromptingStrategiesResponse = prompting_strategies.PromptingStrategiesResponse
run_prompting_strategies = prompting_strategies.run_prompting_strategies

SycophancyTrapRequest = sycophancy_trap.SycophancyTrapRequest
SycophancyTrapResponse = sycophancy_trap.SycophancyTrapResponse
run_sycophancy_trap = sycophancy_trap.run_sycophancy_trap

RefundBenchRequest = refund_bench.RefundBenchRequest
RefundBenchResponse = refund_bench.RefundBenchResponse
GrievanceRuling = refund_bench.GrievanceRuling
JudgedGrievance = refund_bench.JudgedGrievance
run_refund_bench = refund_bench.run_refund_bench
adjudicate_dispute = refund_bench.adjudicate_dispute

# 06-ai-reliability (01 - 04)
CotVsDirectRequest = cot_vs_direct.CotVsDirectRequest
CotVsDirectResponse = cot_vs_direct.CotVsDirectResponse
run_cot_vs_direct_benchmark = cot_vs_direct.run_cot_vs_direct_benchmark

VarianceDeterminismRequest = variance_determinism.VarianceDeterminismRequest
VarianceDeterminismResponse = variance_determinism.VarianceDeterminismResponse
run_variance_determinism_benchmark = variance_determinism.run_variance_determinism_benchmark

ToolSchemaCalibrationRequest = tool_schema_calibration.ToolSchemaCalibrationRequest
ToolSchemaCalibrationResponse = tool_schema_calibration.ToolSchemaCalibrationResponse
run_tool_schema_calibration = tool_schema_calibration.run_tool_schema_calibration

ToolErrorInjectionRequest = tool_error_injection.ToolErrorInjectionRequest
ToolErrorInjectionResponse = tool_error_injection.ToolErrorInjectionResponse
run_tool_error_injection = tool_error_injection.run_tool_error_injection

# 07-ai-mcp-evals (01 - 03)
McpClientRequest = mcp_client.McpClientRequest
McpClientResponse = mcp_client.McpClientResponse
run_mcp_client = mcp_client.run_mcp_client

McpAgentRequest = mcp_agent.McpAgentRequest
McpAgentResponse = mcp_agent.McpAgentResponse
run_mcp_agent = mcp_agent.run_mcp_agent

McpEvalsResponse = mcp_evals.McpEvalsResponse
run_mcp_evals_suite = mcp_evals.run_mcp_evals_suite

__all__ = [
    # 01-ai-basics
    "TravelRequest", "TravelResponse", "get_travel_suggestion",
    "JokeRequest", "JokeResponse", "get_groq_joke",
    "SummarizerRequest", "SummarizerResponse", "summarize",
    "ChatMessage", "MemoryChatRequest", "MemoryChatResponse", "chat_with_memory",
    "AgentRequest", "AgentResponse", "run_agent_with_tool",
    "LangchainOneToolRequest", "LangchainOneToolResponse", "run_langchain_one_tool",
    "MultiToolAgentRequest", "MultiToolAgentResponse", "run_multi_tool_agent",
    # 02-ai-rag-chroma
    "ChunkingRequest", "ChunkingResponse", "chunk_text",
    "EmbeddingRequest", "EmbeddingResponse", "compute_similarity",
    "RagRequest", "RagResponse", "answer_rag",
    # 03-ai-model-training-chromadb
    "ModelTrainingRequest", "ModelTrainingResponse", "predict_delivery_eta",
    "ChromaDbRequest", "ChromaDbSource", "ChromaDbResponse", "ask_chromadb_notes",
    "RedisAgentRequest", "RedisAgentToolCall", "RedisAgentResponse", "run_redis_agent",
    # 04-ai-aws-strands
    "HelloWorldAgentRequest", "HelloWorldAgentResponse", "run_hello_world_agent",
    "LangGraphAgentRequest", "LangGraphAgentResponse", "run_langgraph_agent",
    "FunctionToToolRequest", "FunctionToToolResponse", "run_function_to_tool_agent",
    "TipCalculatorRequest", "TipCalculatorResponse", "run_tip_calculator_agent",
    "MultiToolSalesRequest", "MultiToolSalesResponse", "run_multi_tool_sales_agent",
    "CustomInventoryRequest", "CustomInventoryResponse", "run_custom_inventory_agent",
    "PrebuiltCalculatorRequest", "PrebuiltCalculatorResponse", "run_prebuilt_calculator_agent",
    "MultiPrebuiltToolsRequest", "MultiPrebuiltToolsResponse", "run_multi_prebuilt_tools_agent",
    "UseAwsRequest", "UseAwsResponse", "run_use_aws_agent",
    "ClassBasedToolsRequest", "ClassBasedToolsResponse", "run_class_based_tools_agent",
    "AsyncToolsRequest", "AsyncToolsResponse", "run_async_tools_agent",
    "TravelAssistantRequest", "TravelAssistantResponse", "run_travel_assistant_agent",
    # 05-ai-systems
    "PromptingStrategiesRequest", "PromptingStrategiesResponse", "run_prompting_strategies",
    "SycophancyTrapRequest", "SycophancyTrapResponse", "run_sycophancy_trap",
    "RefundBenchRequest", "RefundBenchResponse", "GrievanceRuling", "JudgedGrievance",
    "run_refund_bench", "adjudicate_dispute",
    # 06-ai-reliability
    "CotVsDirectRequest", "CotVsDirectResponse", "run_cot_vs_direct_benchmark",
    "VarianceDeterminismRequest", "VarianceDeterminismResponse", "run_variance_determinism_benchmark",
    "ToolSchemaCalibrationRequest", "ToolSchemaCalibrationResponse", "run_tool_schema_calibration",
    "ToolErrorInjectionRequest", "ToolErrorInjectionResponse", "run_tool_error_injection",
    # 07-ai-mcp-evals
    "McpClientRequest", "McpClientResponse", "run_mcp_client",
    "McpAgentRequest", "McpAgentResponse", "run_mcp_agent",
    "McpEvalsResponse", "run_mcp_evals_suite",
]
