"""LangGraph ReAct Hello World Agent Service.

Demonstrates the LangGraph tool-calling ReAct agentic loop:
1. Defines a tool `greet(name: str)`.
2. Passes prompt to LangGraph ReAct agent.
3. Observes tool execution steps (calling greet for each person).
4. Synthesizes final response.

Run directly:
    python projects/ai-projects/server/services/12_hello_world_langgraph.py
"""

import json
import os
from typing import List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class LangGraphAgentRequest(BaseModel):
    """Input payload for LangGraph Hello World Agent."""

    prompt: str = Field(
        default="Please greet Alice and Bob.",
        description="User request for greeting individuals",
    )


class LangGraphAgentResponse(BaseModel):
    """Output payload from LangGraph Hello World Agent."""

    prompt: str
    response: str
    tool_calls: List[str]
    provider: str


def greet_tool(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}! Welcome to the world of AI agents."


def run_langgraph_agent(prompt: str = "Please greet Alice and Bob.") -> dict:
    """Run the LangGraph tool-enabled ReAct agent."""
    # ① Load AWS credentials and initialize the recorded tool call trace
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    tool_calls_recorded = []

    # ② Attempt LangGraph create_react_agent with Bedrock Converse if AWS keys are configured
    if aws_key and aws_secret:
        try:
            from langchain.chat_models import init_chat_model
            from langchain.tools import tool
            from langgraph.prebuilt import create_react_agent

            @tool
            def greet(name: str) -> str:
                """Greet someone by name."""
                res = greet_tool(name)
                tool_calls_recorded.append(f"greet('{name}') -> {res}")
                return res

            llm = init_chat_model(bedrock_model_id, model_provider="bedrock_converse")
            agent = create_react_agent(model=llm, tools=[greet])
            result = agent.invoke({"messages": [{"role": "user", "content": prompt}]})
            final_message = result["messages"][-1].content
            return {
                "prompt": prompt,
                "response": final_message,
                "tool_calls": tool_calls_recorded,
                "provider": f"LangGraph + Bedrock Converse ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Bedrock LangGraph failed ({exc}), falling back to OpenAI")

    # ③ Configure OpenAI client and greet tool schema for the fallback ReAct loop
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "greet",
                "description": "Greet someone by name.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "The name of the person to greet"}
                    },
                    "required": ["name"],
                },
            },
        }
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a friendly LangGraph ReAct agent. Use the greet tool for each person mentioned in the user prompt.",
        },
        {"role": "user", "content": prompt},
    ]

    # ④ Execute the iterative ReAct loop (Reason -> Act -> Observe) up to 5 turns
    for _ in range(5):
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_schema,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)

        # ⑤ Return final synthesis once the model finishes calling tools
        if not msg.tool_calls:
            return {
                "prompt": prompt,
                "response": msg.content or "",
                "tool_calls": tool_calls_recorded,
                "provider": f"LangGraph ReAct Pattern + OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
            }

        # ⑥ Execute each requested greet tool call and feed observations back into messages
        for tc in msg.tool_calls:
            fn_name = tc.function.name
            args = json.loads(tc.function.arguments or "{}")
            if fn_name == "greet":
                output = greet_tool(args.get("name", "Friend"))
                tool_calls_recorded.append(f"greet('{args.get('name')}') -> {output}")
            else:
                output = f"Unknown tool: {fn_name}"
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": output})

    return {
        "prompt": prompt,
        "response": messages[-1].get("content", "Completed greeting process."),
        "tool_calls": tool_calls_recorded,
        "provider": f"LangGraph ReAct Pattern + OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    test_res = run_langgraph_agent("Please greet Alice and Bob.")
    print("Tool calls:", test_res["tool_calls"])
    print("Response:", test_res["response"])

