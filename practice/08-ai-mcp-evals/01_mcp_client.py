"""Step 1 — Direct FastMCP Client.

Demonstrates the core Model Context Protocol (MCP) plumbing without an LLM:
1. Performs MCP protocol handshake initialization (`session.initialize()`).
2. Lists all registered tools and their JSON schemas from the server (`tools/list`).
3. Invokes an MCP tool directly (`get_live_score` or `get_player_stats`) with structured arguments (`tools/call`).

Run locally (from this folder):
    pip install -r requirements.txt
    python 01_mcp_client.py

Run with Docker Compose (from this folder):
    docker compose run --rm 01_mcp_client
"""

import asyncio
import json
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# ---------------------------------------------------------------------------
# Configuration & MCP Server Setup
# ---------------------------------------------------------------------------
# Start cricket_server.py (found next to this script) over stdio using the active Python interpreter
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])

# ---------------------------------------------------------------------------
# Sample Inputs (Direct Tool Invocation Parameters)
# ---------------------------------------------------------------------------
# Uncomment another option below to test different direct MCP calls:

# Option 1: Live match score for India vs West Indies (default)
tool_name = "get_live_score"
tool_args = {"teams": "India vs West Indies"}

# Option 2: Player batting stats for Shubman Gill
# tool_name = "get_player_stats"
# tool_args = {"player_name": "Shubman Gill"}

# Option 3: Player batting stats for Shai Hope
# tool_name = "get_player_stats"
# tool_args = {"player_name": "Shai Hope"}

# Option 4: Non-existent match (error handling test)
# tool_name = "get_live_score"
# tool_args = {"teams": "Australia vs England"}


# ---------------------------------------------------------------------------
# Core MCP Execution Flow
# ---------------------------------------------------------------------------
async def main():
    """Spawn the FastMCP server subprocess and run the 3-step MCP client protocol flow."""
    print(f"Connecting to MCP server: {server_script}...\n")
    # ① Open an MCP stdio transport pipe to the server subprocess
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            # ② Perform MCP protocol handshake initialization
            await session.initialize()
            print("STEP 1: Handshake done\n")

            # ③ Discover all available tools and inspect their JSON input schemas
            tools = (await session.list_tools()).tools
            print("STEP 2: Server says it has these tools:")
            for t in tools:
                print(f"\n  Tool name   : {t.name}")
                print(f"  Description : {t.description}")
                print(f"  Input schema: {json.dumps(t.inputSchema)}")

            # ④ Dispatch a direct MCP tool call with structured arguments (no LLM involved)
            print(f"\nSTEP 3: Calling '{tool_name}' directly with args {tool_args} (no LLM!):")
            result = await session.call_tool(tool_name, tool_args)
            # ⑤ Extract and print the text payload returned by the MCP server
            if result.content:
                print(f"Result:\n{result.content[0].text}")
            else:
                print("(empty response)")


if __name__ == "__main__":
    asyncio.run(main())


