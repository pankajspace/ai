"""Step 1 — Direct MCP Client.

Talks to the FastMCP server WITHOUT any LLM.
Demonstrates the fundamental MCP client protocol flow:
  1. Handshake (initialize)
  2. List available tools (tools/list)
  3. Call a tool directly with arguments (tools/call)

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 01_mcp_client .
    docker run --rm 01_mcp_client
"""

import asyncio
import json
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# 1. MCP Server process configuration
# Start cricket_server.py (found next to this script) with the same Python that runs this script
server_script = str(Path(__file__).with_name("cricket_server.py"))
server = StdioServerParameters(command=sys.executable, args=[server_script])

# 2. Inputs - tool name and arguments to test direct tool invocation
#    Uncomment another option below to test different calls:

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


async def main():
    print(f"Connecting to MCP server: {server_script}...\n")
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            # 1. Handshake
            await session.initialize()
            print("STEP 1: Handshake done\n")

            # 2. Tools listing
            tools = (await session.list_tools()).tools
            print("STEP 2: Server says it has these tools:")
            for t in tools:
                print(f"\n  Tool name   : {t.name}")
                print(f"  Description : {t.description}")
                print(f"  Input schema: {json.dumps(t.inputSchema)}")

            # 3. Direct Tool Call (no LLM required!)
            print(f"\nSTEP 3: Calling '{tool_name}' directly with args {tool_args} (no LLM!):")
            result = await session.call_tool(tool_name, tool_args)
            if result.content:
                print(f"Result:\n{result.content[0].text}")
            else:
                print("(empty response)")


if __name__ == "__main__":
    asyncio.run(main())

