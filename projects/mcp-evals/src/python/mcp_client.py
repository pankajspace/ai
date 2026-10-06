"""Step 1 — talk to the MCP server WITHOUT any LLM.

Shows the raw MCP plumbing: handshake (initialize) -> list tools (tools/list)
-> call a tool (tools/call). Adapted from the class script ``step1_client.py``.
No API key is needed.
"""

import asyncio
import json
import sys
import tempfile

from mcp import ClientSession
from mcp.client.stdio import stdio_client

from config import SERVER

# Tools the UI may call directly. "get_live_score" is the class default.
TOOL_CHOICES = ("get_live_score", "get_player_stats")


def _argument_name(tool) -> str:
    """Return the first input parameter from the tool's auto-generated schema."""
    schema = tool.inputSchema or {}
    required = schema.get("required") or list((schema.get("properties") or {}).keys())
    return required[0]


async def _plumbing(argument: str, tool_name: str) -> str:
    lines = []
    # The server logs to stderr; capture it so the report shows the server side too.
    with tempfile.TemporaryFile(mode="w+", encoding="utf-8") as errlog:
        # ① start cricket_server.py as a child process and connect over stdio
        async with stdio_client(SERVER, errlog=errlog) as (read, write):
            async with ClientSession(read, write) as session:
                # ② handshake: agree on a protocol version and exchange capabilities
                init = await session.initialize()
                lines.append("STEP 1: Handshake done  (initialize)")
                lines.append(f"  Server  : {init.serverInfo.name} {init.serverInfo.version}")
                lines.append(f"  Protocol: {init.protocolVersion}\n")

                # ③ ask the server for its menu cards (tool names, descriptions, schemas)
                tools = (await session.list_tools()).tools
                lines.append("STEP 2: Server says it has these tools  (tools/list)")
                for t in tools:
                    lines.append(f"\n  Tool name   : {t.name}")
                    lines.append(f"  Description : {t.description}")
                    lines.append(f"  Input schema: {json.dumps(t.inputSchema)}")

                # ④ call one tool ourselves; no LLM decides anything here
                tool = next(t for t in tools if t.name == tool_name)
                args = {_argument_name(tool): argument}
                lines.append(f"\nSTEP 3: Calling {tool_name} ourselves, no LLM!  (tools/call)")
                lines.append(f"  Arguments: {json.dumps(args)}")
                result = await session.call_tool(tool_name, args)
                lines.append(f"  Result   : {result.content[0].text if result.content else '(empty)'}")

        errlog.seek(0)
        server_log = errlog.read().strip()
    if server_log:
        lines.append(f"\nServer log (stderr):\n{server_log}")
    return "\n".join(lines)


def run_plumbing(argument: str, tool: str = "get_live_score") -> str:
    """Run handshake -> tools/list -> tools/call and return a text report."""
    return asyncio.run(_plumbing(argument, tool))


if __name__ == "__main__":
    # docker compose run --rm plumbing  ->  the class default call
    print(run_plumbing("India vs West Indies", "get_live_score"), file=sys.stdout)
