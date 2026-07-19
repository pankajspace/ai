[<- README](../../README.md) | [Notes](ai-infused-learning-3.html)

# AI Infused Learning - 3

# Contact
- [Shivank](mailto:[shivank.agrawal_1@scaler.com])

# Links
1. [Class 3 Notes](https://scaler-content.github.io/class-3-AI-engg/)
2. [Pinecone](https://www.pinecone.io/)
3. [Chroma](https://www.trychroma.com/)

# Homework
Anki Notes Project

# My Notes

## Big Idea

LangChain agents let an LLM decide when to call Python functions, use the returned values, and then produce a final answer. The functions are called **tools**. A tool is usually just a normal Python function with:

1. Clear type hints, so the model knows what arguments to pass.
2. A useful docstring, so the model knows when to use it.
3. A predictable return value, so the model can include the result in its answer.

The important learning point is that the model does not run arbitrary Python by itself. It chooses from the tools we expose to it.

## Agent Flow

1. The user asks a question.
2. The agent reads the question, the system prompt, and the available tool descriptions.
3. If a tool is useful, the model emits a tool call with arguments.
4. LangChain runs the matching Python function.
5. The tool result is added back into the conversation.
6. The model writes the final answer using that result.

In the examples below, the `ask()` helper prints this hidden loop so the tool call and tool result are visible.

## Example 1: Agent With One Tool

This first version gives the agent only one tool: `get_weather`. Because the tool list is small, it is easy to see whether the model decides to use the function or answer from its own knowledge.

Try these questions:

1. `What is the weather like in New York?` should call `get_weather`.
2. `What is scaler company?` should not need the weather tool, so the model can answer directly.

```python
"""
Langchain Version V1 - Agents (single tool)
"""

import langchain
print("LangChain version:", langchain.__version__)

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = "groq:llama-3.3-70b-versatile"   # check console.groq.com for current IDs
    REQUIRED_KEY = "GROQ_API_KEY"
elif PROVIDER == "gemini":
    MODEL = "google_genai:gemini-2.0-flash"
    REQUIRED_KEY = "GOOGLE_API_KEY"
else:  # openai
    MODEL = "openai:gpt-4o-mini"
    REQUIRED_KEY = "OPENAI_API_KEY"

key = os.environ.get(REQUIRED_KEY)
if not key:
    raise SystemExit(
        f"{REQUIRED_KEY} not found in environment. "
        f"Add it to your .env for provider '{PROVIDER}'."
    )
print(f"Provider={PROVIDER}  Model={MODEL}  Key={key[:6]}...{key[-4:]}")

# ---------------------------------------------------------------------------
# One tool
# ---------------------------------------------------------------------------
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
from langchain.agents import create_agent

agent = create_agent(
    model=MODEL,
    tools=[get_weather],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# ---------------------------------------------------------------------------
# Run a question and show the tool call + tool result.
# ---------------------------------------------------------------------------
def ask(question: str, show_steps: bool = True) -> None:
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    print(f"\nQ: {question}")

    if show_steps:
        for msg in response["messages"]:
            if msg.type == "ai" and getattr(msg, "tool_calls", None):
                for tc in msg.tool_calls:
                    print(f"   [tool call]   {tc['name']}({tc['args']})")
            elif msg.type == "tool":
                print(f"   [tool result] {msg.content}")

    print(f"A: {response['messages'][-1].content}")

# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")
    ask("What is scaler company?")
```

Key observations:

1. The tool name, parameter name, type hint, and docstring all influence how the model calls the tool.
2. The model can choose not to call a tool when the tool is irrelevant.
3. The final answer depends on the system prompt. Here, the prompt asks the model to state the result clearly.

## Example 2: Agent With Multiple Tools

This version adds several tools so the agent has to choose between them. That makes the example closer to a real assistant, where different functions handle different tasks.

The available tools are:

1. `get_weather(city: str)` for weather questions.
2. `add(a: float, b: float)` for addition.
3. `multiply(a: float, b: float)` for multiplication.
4. `get_population(city: str)` for population lookups.

The interesting test is the combined question: `What's the weather in Tokyo, and what is 12 times 12?` A good agent should call two tools and then combine both results in one final answer.

```python
"""
Langchain Version V1 - Agents (multiple tools + visible tool calls)

Teaching idea: give the agent SEVERAL tools, then SHOW what it does internally.
For each question the agent: reads the tools -> decides which to call ->
calls it -> reads the result -> writes a final answer. The step trace below
makes that loop visible so students can see the function calls happen.

NOTE on the OpenAI 429 ('insufficient_quota'): billing state, not a bug.
PROVIDER="groq" (free) keeps you teaching without OpenAI credits.
"""

import langchain
print("LangChain version:", langchain.__version__)

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = "groq:llama-3.3-70b-versatile"   # check console.groq.com for current IDs
    REQUIRED_KEY = "GROQ_API_KEY"
elif PROVIDER == "gemini":
    MODEL = "google_genai:gemini-2.0-flash"
    REQUIRED_KEY = "GOOGLE_API_KEY"
else:  # openai
    MODEL = "openai:gpt-4o-mini"
    REQUIRED_KEY = "OPENAI_API_KEY"

key = os.environ.get(REQUIRED_KEY)
if not key:
    raise SystemExit(
        f"{REQUIRED_KEY} not found in environment. "
        f"Add it to your .env for provider '{PROVIDER}'."
    )
print(f"Provider={PROVIDER}  Model={MODEL}  Key={key[:6]}...{key[-4:]}")

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

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
from langchain.agents import create_agent

agent = create_agent(
    model=MODEL,
    tools=TOOLS,
    # Tighter prompt: force the model to actually state the result so we don't
    # get vague answers like "that's the current weather".
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)


# ---------------------------------------------------------------------------
# Run a question and (optionally) show every tool call + tool result.
# ---------------------------------------------------------------------------
def ask(question: str, show_steps: bool = True) -> None:
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    print(f"\nQ: {question}")

    if show_steps:
        for msg in response["messages"]:
            # The AI decided to call one or more tools
            if msg.type == "ai" and getattr(msg, "tool_calls", None):
                for tc in msg.tool_calls:
                    print(f"   [tool call]   {tc['name']}({tc['args']})")
            # A tool returned its result
            elif msg.type == "tool":
                print(f"   [tool result] {msg.content}")

    print(f"A: {response['messages'][-1].content}")


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
```

Key observations:

1. More tools mean the model must classify the user's intent more carefully.
2. A single user question can lead to multiple tool calls.
3. Tool descriptions should be specific. If two tools have vague or overlapping docstrings, the model may choose the wrong one.
4. The agent can still answer normal knowledge questions without tools.

## Practical Tips

1. Keep tool functions small and focused.
2. Use descriptive function names like `get_population` instead of generic names like `lookup`.
3. Write docstrings as instructions for the model, not just as comments for humans.
4. Return simple strings, numbers, or JSON-like dictionaries that are easy for the model to read.
5. Print tool calls while learning or debugging, because it shows whether the model's decision process matches your expectation.

## Common Mistakes

1. Assuming the tool runs automatically: the model must first decide that a tool is useful.
2. Weak docstrings: the model may ignore or misuse a tool if the purpose is unclear.
3. Too many unrelated tools: this can make tool selection noisy.
4. Expecting live data from fake tools: these examples return hardcoded values, so they are for learning the agent pattern, not real weather or population data.

## Practice Ideas

1. Add a `subtract(a: float, b: float)` tool and test subtraction questions.
2. Add a `divide(a: float, b: float)` tool and handle division by zero.
3. Replace the hardcoded weather tool with a real weather API.
4. Add a `get_company_info(company: str)` tool so the `scaler company` question can use a tool.
5. Ask one question that requires three tools and check whether the printed trace shows all three calls.