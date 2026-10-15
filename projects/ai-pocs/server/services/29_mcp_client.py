"""Direct FastMCP Client Service.

Demonstrates the core Model Context Protocol (MCP) plumbing without an LLM:
1. Starts `cricket_server.py` as a subprocess and talks to it over stdio.
2. Performs the MCP protocol handshake (`session.initialize()`).
3. Lists all registered tools and their JSON schemas from the server (`tools/list`).
4. Invokes an MCP tool directly (`get_live_score` or `get_player_stats`) with structured arguments (`tools/call`).

Run directly:
    python projects/ai-pocs/server/services/29_mcp_client.py
"""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import BaseModel, Field


class McpClientRequest(BaseModel):
    """Input payload for Direct MCP Client."""

    tool_name: str = Field(
        default="get_live_score",
        description="Name of tool to call directly: 'get_live_score' or 'get_player_stats'",
    )
    tool_args: Dict[str, Any] = Field(
        default_factory=lambda: {"teams": "India vs West Indies"},
        description="Dictionary of arguments matching tool schema",
    )


class McpToolDescriptor(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]


class McpClientResponse(BaseModel):
    """Output payload from Direct MCP Client."""

    handshake_status: str
    server_tools: List[McpToolDescriptor]
    invoked_tool: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]
    protocol_transport: str


# ① Start cricket_server.py (found next to this file) over stdio using the active Python interpreter
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])


async def run_mcp_client(
    tool_name: str = "get_live_score",
    tool_args: Optional[Dict[str, Any]] = None,
) -> dict:
    """Execute the 3-step MCP client protocol flow (no LLM involved)."""
    tool_args = tool_args or {"teams": "India vs West Indies"}

    # ② Open an MCP stdio transport pipe to the server subprocess
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            # ③ STEP 1: Perform the MCP protocol handshake
            init = await session.initialize()

            # ④ STEP 2: Discover all available tools and their JSON input schemas
            tools = (await session.list_tools()).tools

            # ⑤ STEP 3: Call one tool directly with structured arguments
            result = await session.call_tool(tool_name, tool_args)

    # ⑥ The server returns the tool's dict as JSON text (or an error message)
    text = result.content[0].text if result.content else "{}"

    return {
        "handshake_status": f"Handshake done with {init.serverInfo.name} (protocol {init.protocolVersion})",
        "server_tools": [
            {"name": t.name, "description": t.description or "", "input_schema": t.inputSchema}
            for t in tools
        ],
        "invoked_tool": tool_name,
        "arguments": tool_args,
        "result": {"error": text} if result.isError else json.loads(text),
        "protocol_transport": "stdio",
    }


if __name__ == "__main__":
    out = asyncio.run(run_mcp_client())
    print(out["handshake_status"])
    print("Tools:", [t["name"] for t in out["server_tools"]])
    print("Result:", json.dumps(out["result"], indent=2))
