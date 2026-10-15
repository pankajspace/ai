"""
Langchain Version V1 - Agents (single tool)

Teaching idea: give the agent ONE tool (get_weather), and show how LangChain's
`create_agent` automatically inspects tool signatures, triggers the tool
when needed (e.g. weather queries), and answers general queries directly.

Run directly:
    python projects/ai-pocs/server/services/06_langchain_one_tool.py
"""

import os
from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GEMINI_API_KEY / GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = os.getenv("GROQ_MODEL") or "openai/gpt-oss-20b"
    BASE_URL = os.getenv("GROQ_BASE_URL") or "https://api.groq.com/openai/v1"
    REQUIRED_KEY = os.getenv("GROQ_API_KEY") or "missing-key"
elif PROVIDER == "gemini":
    MODEL = os.getenv("GEMINI_MODEL") or os.getenv("GOOGLE_MODEL") or "gemini-3.8-flash"
    BASE_URL = os.getenv("GEMINI_BASE_URL") or "https://generativelanguage.googleapis.com/v1beta/openai/"
    REQUIRED_KEY = os.getenv("GEMINI_API_KEY") or "missing-key"
else:  # openai
    MODEL = os.getenv("OPENAI_MODEL") or "gpt-4o-mini"
    BASE_URL = os.getenv("OPENAI_BASE_URL") or "https://api.openai.com/v1"
    REQUIRED_KEY = os.getenv("OPENAI_API_KEY") or "missing-key"


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class LangchainOneToolRequest(BaseModel):
    """Input payload for single-tool LangChain agent queries."""

    message: str = Field(
        default="What is the weather like in New York?",
        description="Question for the single-tool LangChain agent",
    )


class LangchainOneToolResponse(BaseModel):
    """Output payload containing the final response and tool call indicator."""

    message: str
    response: str
    tool_called: bool = False


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."


TOOLS = [get_weather]

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
# ① Initialize the LLM client pointed at the configured provider
llm = ChatOpenAI(
    model=MODEL,
    api_key=REQUIRED_KEY,
    base_url=BASE_URL if BASE_URL else None,
    temperature=0,
    timeout=20.0,
)

# ② Create the LangChain tool-calling agent with get_weather and system instructions
agent = create_agent(
    model=llm,
    tools=TOOLS,
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def run_langchain_one_tool(
    question: str = "What is the weather like in New York?",
) -> tuple[str, bool]:
    """Run a user question through the single-tool LangChain agent."""
    # ① Invoke the LangChain agent with the user's question
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    messages = response["messages"]
    # ② Check whether any tool message appears in the trace
    tool_called = any(msg.type == "tool" for msg in messages)
    # ③ Extract and return the final assistant reply alongside the tool flag
    final_msg = messages[-1]
    answer = str(final_msg.content) if hasattr(final_msg, "content") else str(final_msg)
    return answer, tool_called


def ask(question: str) -> None:
    answer, tool_called = run_langchain_one_tool(question)
    print(f"\nQ: {question}")
    print(f"Tool called: {'Yes' if tool_called else 'No'}")
    print(f"A: {answer}")


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")
    ask("What is scaler company?")