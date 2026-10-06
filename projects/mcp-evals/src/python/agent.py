"""Step 2 — the LLM decides WHICH tool to call and WITH WHAT arguments.

Our code does the actual calling via MCP: the model is the doctor that writes
the prescription, our app is the chemist that hands over the medicine.
Adapted from the class script ``step2_agent.py`` (Groq, OpenAI-compatible API).
"""

import asyncio
import json
import re
import sys
import tempfile

from mcp import ClientSession
from mcp.client.stdio import stdio_client

from config import CHAT_MODEL, SERVER, get_groq_client, parallel_map

# "on" is the class default (tools given); "off" is the --no-tools run.
TOOLS_CHOICES = ("on", "off", "both")

# Safety limit on agent loop turns.
MAX_TURNS = 5


def to_openai_format(mcp_tools):
    """MCP tool list -> the format OpenAI's API expects."""
    return [{
        "type": "function",
        "function": {"name": t.name, "description": t.description or "", "parameters": t.inputSchema},
    } for t in mcp_tools]


def call_llm(llm, kwargs, retries=2):
    """Call the model. Returns (message, None) or (None, error_text).

    Some models (like gpt-oss) were trained with their own built-in browser tool
    and sometimes try to call it even though we never offered it. Groq rejects
    that with 'tool_use_failed'. We retry a couple of times, then explain.
    """
    # ① try the call, retrying only the "tool_use_failed" rejection
    last = None
    for _ in range(retries + 1):
        try:
            return llm.chat.completions.create(**kwargs).choices[0].message, None
        except Exception as e:
            last = str(e)
            if "tool_use_failed" not in last:
                return None, f"API ERROR: {last[:300]}"
    # ② still failing: name the tool the model invented and explain it
    m = re.search(r'"name":\s*"([^"]+)"', last or "")
    tool = m.group(1) if m else "a tool"
    return None, (f"MODEL TRIED TO CALL A TOOL WE NEVER GAVE IT ({tool}). "
                  "It knows it needs live data, but it has no way to get it. Try running again.")


async def run_agent(question: str, use_tools: bool = True, temperature: float = 0.0) -> dict:
    """Answer ``question`` with (or without) the cricket MCP tools.

    Returns ``{"answer": str, "trace": [{"tool", "args"}], "log": [str]}``.
    ``trace`` feeds the evals; ``log`` is the step-by-step output for the UI.
    """
    # ① build the Groq client and pick the system prompt for tools ON or OFF
    llm = get_groq_client()
    trace = []      # every tool call the LLM asked for, kept for evals later
    log = []
    if use_tools:
        system = ("You are a cricket assistant. Use ONLY the functions provided to get live data. "
                  "Do not use any browser or code tools. Be brief.")
    else:
        system = ("You are a cricket assistant. You have NO tools, NO browser and NO internet access. "
                  "Never try to call a tool. Answer only from your own knowledge, in 1-2 sentences.")
    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": question},
    ]

    with tempfile.TemporaryFile(mode="w+", encoding="utf-8") as errlog:
        # ② start the MCP server and complete the handshake
        async with stdio_client(SERVER, errlog=errlog) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                # ③ translate MCP menu cards into OpenAI tool format (only when tools are ON)
                tools = to_openai_format((await session.list_tools()).tools) if use_tools else None

                for _ in range(MAX_TURNS):
                    # ④ send the conversation (+ tool menu) to the model
                    kwargs = {"model": CHAT_MODEL, "messages": messages, "temperature": temperature}
                    if tools:
                        kwargs["tools"] = tools
                    reply, error = await asyncio.to_thread(call_llm, llm, kwargs)
                    if error:
                        log.append(error)
                        return {"answer": f"({error})", "trace": trace, "log": log}

                    # ⑤ no tool requested -> this is the final answer
                    if not reply.tool_calls:
                        log.append(f"FINAL ANSWER: {reply.content}")
                        return {"answer": reply.content, "trace": trace, "log": log}

                    # ⑥ record the model's "prescription" in the conversation
                    messages.append({
                        "role": "assistant",
                        "content": reply.content or "",
                        "tool_calls": [{"id": c.id, "type": "function",
                                        "function": {"name": c.function.name, "arguments": c.function.arguments}}
                                       for c in reply.tool_calls],
                    })
                    # ⑦ OUR code calls each requested tool via MCP and returns the result
                    for call in reply.tool_calls:
                        try:
                            args = json.loads(call.function.arguments or "{}")
                        except json.JSONDecodeError:
                            args = {}
                        trace.append({"tool": call.function.name, "args": args})
                        log.append(f"LLM SAYS: please call {call.function.name} with {args}")
                        offset = errlog.tell()
                        result = await session.call_tool(call.function.name, args)
                        errlog.seek(offset)
                        log.extend(line for line in errlog.read().splitlines() if line.startswith("[server]"))
                        text = result.content[0].text if result.content else "(empty)"
                        log.append(f"TOOL RETURNED: {text}")
                        messages.append({"role": "tool", "tool_call_id": call.id, "content": text})

    log.append("(stopped: too many steps)")
    return {"answer": "(stopped: too many steps)", "trace": trace, "log": log}


def run_agent_sync(question: str, use_tools: bool = True, temperature: float = 0.0) -> dict:
    """Blocking wrapper so Flask routes and thread pools can call the agent."""
    return asyncio.run(run_agent(question, use_tools, temperature))


def run_agent_report(question: str, tools: str = "on", temperature: float = 0.0) -> str:
    """Run the agent with tools ON, OFF, or both, and return a text report."""
    # ① run one agent per selected mode, in parallel
    modes = {"on": [True], "off": [False], "both": [False, True]}[tools]
    results = parallel_map(lambda use: run_agent_sync(question, use, temperature), modes)

    # ② print each run's step-by-step log under its own header

    sections = []
    for use_tools, result in zip(modes, results):
        header = f"QUESTION: {question}   (tools {'ON' if use_tools else 'OFF'})"
        sections.append("\n".join([header, *result["log"]]))
    # ③ suggest the side-by-side comparison when only one mode ran
    report = ("\n\n" + "─" * 40 + "\n\n").join(sections)
    if tools != "both":
        report += "\n\nTip: pick 'Both' to compare the same question with and without MCP tools."
    return report


if __name__ == "__main__":
    # docker compose run --rm agent "How many runs has Shubman Gill scored this series?"
    # docker compose run --rm agent --no-tools "What is the live score of India vs West Indies?"
    argv = sys.argv[1:]
    use = "--no-tools" not in argv
    q = " ".join(a for a in argv if a != "--no-tools") or "What is the score in India vs West Indies?"
    print(run_agent_report(q, "on" if use else "off"))
