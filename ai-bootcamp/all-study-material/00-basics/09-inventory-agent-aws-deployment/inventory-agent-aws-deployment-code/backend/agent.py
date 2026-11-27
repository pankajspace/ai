import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

from tools.reorder_calculator import calculate_reorder
from tools.inventory_lookup import lookup_inventory

load_dotenv()

SYSTEM_PROMPT = """You are an expert Inventory Planning Agent. Your job is to help users manage inventory and decide when and how much to reorder.

You have access to two tools:
1. lookup_inventory — retrieves live inventory data from the database for a given SKU.
2. calculate_reorder — computes whether a reorder is needed and the recommended quantity.

Guidelines:
- Always look up the SKU from the database first if the user mentions one.
- Use calculate_reorder with the actual numbers (from DB or user input).
- Explain your reasoning clearly and in plain English.
- If information is missing (e.g., demand, lead time), ask the user for it.
- Keep responses concise but actionable.
"""

TOOLS = [lookup_inventory, calculate_reorder]

# OpenAI model used by the agent. gpt-4o-mini is the cheapest model with
# reliable tool calling; set OPENAI_MODEL=gpt-4.1-mini for higher quality.
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def build_agent() -> AgentExecutor:
    llm = ChatOpenAI(
        model=OPENAI_MODEL,
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY"),
        timeout=45,
        max_retries=2,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    agent = create_tool_calling_agent(llm, TOOLS, prompt)
    return AgentExecutor(agent=agent, tools=TOOLS, verbose=True, max_iterations=6)


# Module-level singleton
_executor: AgentExecutor | None = None


def get_executor() -> AgentExecutor:
    global _executor
    if _executor is None:
        _executor = build_agent()
    return _executor


def chat(query: str, history: list[dict] | None = None) -> str:
    """
    Run the agent with optional conversation history.

    history: list of {"role": "user"|"assistant", "content": "..."} dicts
    """
    executor = get_executor()

    lc_history = []
    for msg in (history or []):
        if msg["role"] == "user":
            lc_history.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            lc_history.append(AIMessage(content=msg["content"]))

    result = executor.invoke({"input": query, "chat_history": lc_history})
    return result["output"]
