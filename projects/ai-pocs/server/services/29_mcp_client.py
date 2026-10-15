"""Direct FastMCP Client Service.

Demonstrates the core Model Context Protocol (MCP) plumbing without an LLM:
1. Starts `cricket_server.py` as a subprocess and talks to it over stdio.
2. Performs the MCP protocol handshake (`session.initialize()`).
3. Lists all registered tools and their JSON schemas from the server (`tools/list`).
4. Invokes an MCP tool directly (`get_live_score` or `get_player_stats`) with structured arguments (`tools/call`).
"""

import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import BaseModel


class McpClientRequest(BaseModel):
    """Input payload for Direct MCP Client."""

    tool_name: str = "get_live_score"
    tool_args: dict = {"teams": "India vs West Indies"}


class McpToolDescriptor(BaseModel):
    name: str
    description: str
    input_schema: dict


class McpClientResponse(BaseModel):
    """Output payload from Direct MCP Client."""

    server_tools: list[McpToolDescriptor]
    result: str


# ① Start cricket_server.py (found next to this file) over stdio using the active Python interpreter
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])


async def run_mcp_client(tool_name: str, tool_args: dict) -> dict:
    """Execute the 3-step MCP client protocol flow (no LLM involved)."""
    # ② Open an MCP stdio transport pipe to the server subprocess
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            # ③ STEP 1: Perform the MCP protocol handshake
            await session.initialize()

            # ④ STEP 2: Discover all available tools and their JSON input schemas
            tools = (await session.list_tools()).tools

            # ⑤ STEP 3: Call one tool directly with structured arguments (no LLM involved)
            result = await session.call_tool(tool_name, tool_args)

    # ⑥ The server returns the tool's dict as JSON text (or an error message); pass that text back as-is
    return {
        "server_tools": [
            {"name": t.name, "description": t.description or "", "input_schema": t.inputSchema}
            for t in tools
        ],
        "result": result.content[0].text if result.content else "(empty response)",
    }
