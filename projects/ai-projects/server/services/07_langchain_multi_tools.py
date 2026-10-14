"""
Langchain Version V1 - Agents (multiple tools + visible tool calls)

Teaching idea: give the agent SEVERAL tools, then SHOW what it does internally.
For each question the agent: reads the tools -> decides which to call ->
calls it -> reads the result -> writes a final answer. The step trace below
makes that loop visible so students can see the function calls happen.

NOTE on the OpenAI 429 ('insufficient_quota'): billing state, not a bug.
PROVIDER="groq" (free) keeps you teaching without OpenAI credits.

Run directly:
    python projects/ai-projects/server/services/07_langchain_multi_tools.py
"""

import os
from typing import Any, List
from dotenv import find_dotenv, load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

try:
    import langchain
    from langchain.agents import create_agent

    print("LangChain version:", langchain.__version__)
except ImportError:
    langchain = None  # type: ignore[assignment]
    create_agent = None  # type: ignore[assignment]

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
    MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    REQUIRED_KEY = os.getenv("GROQ_API_KEY")
elif PROVIDER == "gemini":
    MODEL = os.getenv("GEMINI_MODEL") or os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
    BASE_URL = os.getenv(
        "GEMINI_BASE_URL",
        "https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    REQUIRED_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
else:  # openai
    MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    REQUIRED_KEY = os.getenv("OPENAI_API_KEY")


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class ToolStep(BaseModel):
    """Single step in the agent's tool-execution trace."""

    type: str = Field(
        description="Step type: 'tool_call' or 'tool_result'",
    )
    name: str = Field(
        default="",
        description="Name of the tool invoked",
    )
    args: dict[str, Any] = Field(
        default_factory=dict,
        description="Arguments passed to the tool (for tool_call steps)",
    )
    content: str = Field(
        default="",
        description="Formatted step text or tool output",
    )


class MultiToolAgentRequest(BaseModel):
    """Input payload for multi-tool LangChain agent queries."""

    message: str = Field(
        default="What's the weather in Tokyo, and what is 12 times 12?",
        description="Question for the multi-tool LangChain agent",
    )


class MultiToolAgentResponse(BaseModel):
    """Output payload containing the final response and intermediate tool steps."""

    message: str
    response: str
    steps: List[ToolStep] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Tools
#   1. Type hints (city: str)  -> tell the model what arguments to pass
#   2. The docstring           -> tells the model WHEN to use this tool
# ---------------------------------------------------------------------------
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is sunny, 28 degrees C."


def add(a: float, b: float) -> float:
    """Add two numbers together."""
    return a + b


def multiply(a: float, b: float) -> float:
    """Multiply two numbers together."""
    return a * b


def get_population(city: str) -> str:
    """Get the approximate population of a major city."""
    data = {
        "new york": "8.5 million",
        "london": "9 million",
        "bangalore": "13 million",
        "tokyo": "14 million",
    }
    return data.get(city.lower(), f"Sorry, I don't have population data for {city}.")


TOOLS = [get_weather, add, multiply, get_population]
TOOL_MAP = {fn.__name__: fn for fn in TOOLS}

SYSTEM_PROMPT = (
    "You are a helpful assistant. Use the available tools when needed. "
    "Always state the final result clearly and completely in your answer."
)


# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
def _build_llm() -> ChatOpenAI:
    """Construct the ChatOpenAI client configured for the chosen provider."""
    if not REQUIRED_KEY:
        raise ValueError(
            f"API key not configured in .env for provider '{PROVIDER}'."
        )

    return ChatOpenAI(
        model=MODEL,
        api_key=REQUIRED_KEY,
        base_url=BASE_URL if BASE_URL else None,
        temperature=0,
        timeout=20.0,
    )


def _run_messages_loop(llm: ChatOpenAI, question: str) -> List[Any]:
    """Run the LangChain agent loop (uses create_agent when available, or bind_tools)."""
    if create_agent is not None:
        agent = create_agent(
            model=llm,
            tools=TOOLS,
            system_prompt=SYSTEM_PROMPT,
        )
        result = agent.invoke({"messages": [{"role": "user", "content": question}]})
        return list(result["messages"])

    # Fallback using langchain_core + ChatOpenAI.bind_tools when container only has langchain-core
    llm_with_tools = llm.bind_tools(TOOLS)
    messages: List[Any] = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=question),
    ]
    for _ in range(5):
        ai_msg = llm_with_tools.invoke(messages)
        messages.append(ai_msg)
        tool_calls = getattr(ai_msg, "tool_calls", None)
        if not tool_calls:
            break
        for tc in tool_calls:
            tc_name = tc.get("name", "")
            tc_args = tc.get("args", {}) or {}
            tc_id = tc.get("id", tc_name)
            tool_fn = TOOL_MAP.get(tc_name)
            tool_output = tool_fn(**tc_args) if tool_fn else f"Unknown tool: {tc_name}"
            messages.append(
                ToolMessage(
                    content=str(tool_output),
                    name=tc_name,
                    tool_call_id=tc_id,
                )
            )
    return messages


# ---------------------------------------------------------------------------
# Core Service Logic: Run a question and return answer + visible tool steps
# ---------------------------------------------------------------------------
def run_multi_tool_agent(
    question: str = "What's the weather in Tokyo, and what is 12 times 12?",
) -> tuple[str, List[ToolStep]]:
    """Run a user question through the multi-tool LangChain agent.

    Args:
        question: Natural language prompt from the user.

    Returns:
        Tuple of (final_answer, list_of_tool_steps).
    """
    llm = _build_llm()
    messages = _run_messages_loop(llm, question)

    steps: List[ToolStep] = []
    for msg in messages:
        # The AI decided to call one or more tools
        if msg.type == "ai" and getattr(msg, "tool_calls", None):
            for tc in msg.tool_calls:
                tc_name = tc.get("name", "")
                tc_args = tc.get("args", {}) or {}
                steps.append(
                    ToolStep(
                        type="tool_call",
                        name=tc_name,
                        args=tc_args,
                        content=f"{tc_name}({tc_args})",
                    )
                )
        # A tool returned its result
        elif msg.type == "tool":
            steps.append(
                ToolStep(
                    type="tool_result",
                    name=getattr(msg, "name", "") or "",
                    content=str(msg.content),
                )
            )

    final_msg = messages[-1]
    answer = str(final_msg.content) if hasattr(final_msg, "content") else str(final_msg)
    return answer, steps


# ---------------------------------------------------------------------------
# Run a question and (optionally) show every tool call + tool result in CLI.
# ---------------------------------------------------------------------------
def ask(question: str, show_steps: bool = True) -> None:
    answer, steps = run_multi_tool_agent(question)
    print(f"\nQ: {question}")

    if show_steps:
        for step in steps:
            if step.type == "tool_call":
                print(f"   [tool call]   {step.content}")
            elif step.type == "tool_result":
                print(f"   [tool result] {step.content}")

    print(f"A: {answer}")


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")          # -> get_weather
    ask("What is 25 multiplied by 4?")                     # -> multiply
    ask("What is 137 plus 568?")                           # -> add
    ask("What is the population of Bangalore?")            # -> get_population
    ask("What's the weather in Tokyo, and what is 12 times 12?")  # -> two tools
    ask("Who wrote the play Romeo and Juliet?")   # -> no tool needed