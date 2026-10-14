"""Cricket MCP Server.

Provides Model Context Protocol (MCP) tool endpoints for cricket matches and player statistics:
1. `get_live_score(teams)`: Fetches live scorecard and match situation.
2. `get_player_stats(player_name)`: Fetches series stats and high scores.

Run directly:
    python projects/ai-projects/server/services/mcp/cricket_server.py
"""

import sys
from pydantic import Field

LIVE_MATCHES = {
    "india vs west indies": {
        "series": "India vs West Indies ODI Series, Sep-Oct 2026 (DEMO DATA)",
        "match": "2nd ODI",
        "status": "LIVE",
        "india": "287/6 (50 overs)",
        "west_indies": "198/5 (38.2 overs)",
        "target": 288,
        "required": "90 runs from 70 balls",
        "series_score": "India lead 1-0",
    }
}

PLAYER_STATS = {
    "shubman gill": {"team": "India", "series_runs": 164, "innings": 3, "highest": 150},
    "shai hope": {"team": "West Indies", "series_runs": 131, "innings": 2, "highest": 78},
}


def get_live_score(teams: str) -> dict:
    """Get the LIVE score of a cricket match."""
    # ① Normalize team names and look up the live match scorecard
    key = teams.strip().lower().replace("windies", "west indies")
    if key not in LIVE_MATCHES:
        return {"error": f"No live match found for '{teams}'. Try 'India vs West Indies'."}
    return LIVE_MATCHES[key]


def get_player_stats(player_name: str) -> dict:
    """Get a player's batting stats for the current series."""
    # ① Normalize player name and return series batting statistics
    key = player_name.strip().lower()
    if key not in PLAYER_STATS:
        return {"error": f"No stats found for '{player_name}'."}
    return PLAYER_STATS[key]


# If FastMCP is available, register tools
try:
    from mcp.server.fastmcp import FastMCP

    mcp = FastMCP("Cricket-Score-Server")

    @mcp.tool(description="Get the LIVE score of a cricket match. Use this for questions about the current score or runs required.")
    def mcp_get_live_score(teams: str = Field(description="The two teams, e.g. 'India vs West Indies'")) -> dict:
        return get_live_score(teams)

    @mcp.tool(description="Get a player's batting stats for the current series. Use this for questions about a specific player's runs.")
    def mcp_get_player_stats(player_name: str = Field(description="Full player name, e.g. 'Shubman Gill'")) -> dict:
        return get_player_stats(player_name)

    if __name__ == "__main__":
        mcp.run(transport="stdio")
except ImportError:
    if __name__ == "__main__":
        print("FastMCP not installed, direct functions available.")

