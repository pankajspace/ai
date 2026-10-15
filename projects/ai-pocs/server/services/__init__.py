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

# Practice 03: AWS Strands & Agent Workflows (11 - 22)
hello_world_agent = importlib.import_module(".11_hello_world_agent", package=__name__)
hello_world_langgraph = importlib.import_module(".12_hello_world_langgraph", package=__name__)
function_to_tool = importlib.import_module(".13_function_to_tool", package=__name__)
tip_calculator = importlib.import_module(".14_tip_calculator", package=__name__)
multi_tool_sales = importlib.import_module(".15_multi_tool_sales", package=__name__)
custom_tool_inventory = importlib.import_module(".16_custom_tool_inventory", package=__name__)
prebuilt_tools = importlib.import_module(".17_prebuilt_tools", package=__name__)
multi_prebuilt_tools = importlib.import_module(".18_multi_prebuilt_tools", package=__name__)
use_aws = importlib.import_module(".19_use_aws", package=__name__)
class_based_tools = importlib.import_module(".20_class_based_tools", package=__name__)
async_tools = importlib.import_module(".21_async_tools", package=__name__)
travel_assistant = importlib.import_module(".22_travel_assistant", package=__name__)

# Practice 04: AI Systems & Prompting Strategies (23 - 24)
prompting_strategies = importlib.import_module(".23_prompting_strategies", package=__name__)
sycophancy_trap = importlib.import_module(".24_sycophancy_trap", package=__name__)

# Practice 05: AI Reliability & Calibration (25 - 28)
cot_vs_direct = importlib.import_module(".25_cot_vs_direct", package=__name__)
variance_determinism = importlib.import_module(".26_variance_determinism", package=__name__)
tool_schema_calibration = importlib.import_module(".27_tool_schema_calibration", package=__name__)
tool_error_injection = importlib.import_module(".28_tool_error_injection", package=__name__)

# Practice 06: MCP & Evals (29 - 31)
mcp_client = importlib.import_module(".29_mcp_client", package=__name__)
mcp_agent = importlib.import_module(".30_mcp_agent", package=__name__)
mcp_evals = importlib.import_module(".31_mcp_evals", package=__name__)

# Register canonical module paths in sys.modules
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
    "cot_vs_direct": cot_vs_direct,
    "variance_determinism": variance_determinism,
    "tool_schema_calibration": tool_schema_calibration,
    "tool_error_injection": tool_error_injection,
    "mcp_client": mcp_client,
    "mcp_agent": mcp_agent,
    "mcp_evals": mcp_evals,
}

for name, mod in service_registry.items():
    sys.modules[f"{__name__}.{name}"] = mod

# Re-export service models and handlers
# 01 - 10
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

# 11 - 22: AWS Strands
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

# 23 - 24: AI Systems
PromptingStrategiesRequest = prompting_strategies.PromptingStrategiesRequest
PromptingStrategiesResponse = prompting_strategies.PromptingStrategiesResponse
run_prompting_strategies = prompting_strategies.run_prompting_strategies

SycophancyTrapRequest = sycophancy_trap.SycophancyTrapRequest
SycophancyTrapResponse = sycophancy_trap.SycophancyTrapResponse
run_sycophancy_trap = sycophancy_trap.run_sycophancy_trap

# 25 - 28: AI Reliability
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

# 29 - 31: MCP & Evals
McpClientRequest = mcp_client.McpClientRequest
McpClientResponse = mcp_client.McpClientResponse
run_mcp_client = mcp_client.run_mcp_client

McpAgentRequest = mcp_agent.McpAgentRequest
McpAgentResponse = mcp_agent.McpAgentResponse
run_mcp_agent = mcp_agent.run_mcp_agent

McpEvalsRequest = mcp_evals.McpEvalsRequest
McpEvalsResponse = mcp_evals.McpEvalsResponse
run_mcp_evals_suite = mcp_evals.run_mcp_evals_suite

__all__ = [
    # 01-10
    "TravelRequest", "TravelResponse", "get_travel_suggestion",
    "JokeRequest", "JokeResponse", "get_groq_joke",
    "SummarizerRequest", "SummarizerResponse", "summarize",
    "ChatMessage", "MemoryChatRequest", "MemoryChatResponse", "chat_with_memory",
    "AgentRequest", "AgentResponse", "run_agent_with_tool",
    "LangchainOneToolRequest", "LangchainOneToolResponse", "run_langchain_one_tool",
    "MultiToolAgentRequest", "MultiToolAgentResponse", "run_multi_tool_agent",
    "ChunkingRequest", "ChunkingResponse", "chunk_text",
    "EmbeddingRequest", "EmbeddingResponse", "compute_similarity",
    "RagRequest", "RagResponse", "answer_rag",
    # 11-22
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
    # 23-24
    "PromptingStrategiesRequest", "PromptingStrategiesResponse", "run_prompting_strategies",
    "SycophancyTrapRequest", "SycophancyTrapResponse", "run_sycophancy_trap",
    # 25-28
    "CotVsDirectRequest", "CotVsDirectResponse", "run_cot_vs_direct_benchmark",
    "VarianceDeterminismRequest", "VarianceDeterminismResponse", "run_variance_determinism_benchmark",
    "ToolSchemaCalibrationRequest", "ToolSchemaCalibrationResponse", "run_tool_schema_calibration",
    "ToolErrorInjectionRequest", "ToolErrorInjectionResponse", "run_tool_error_injection",
    # 29-31
    "McpClientRequest", "McpClientResponse", "run_mcp_client",
    "McpAgentRequest", "McpAgentResponse", "run_mcp_agent",
    "McpEvalsRequest", "McpEvalsResponse", "run_mcp_evals_suite",
]
