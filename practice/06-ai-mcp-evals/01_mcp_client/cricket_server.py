"""Cricket FastMCP Server (`cricket_server.py`).

Provides Model Context Protocol (MCP) tool endpoints for live cricket matches and player statistics:
1. `get_live_score(teams)`: Fetches the live scorecard, target, and match situation.
2. `get_player_stats(player_name)`: Fetches series batting statistics and highest scores.
3. Communicates over standard input/output (`stdio`) transport so MCP clients can spawn it as a subprocess.

Note: The match and player data below is mock/demo data for classroom exercises (no external API key needed).

Run locally (from this folder):
    python cricket_server.py
"""

import sys
from pydantic import Field
from mcp.server.fastmcp import FastMCP

# ---------------------------------------------------------------------------
# FastMCP Server Initialization
# ---------------------------------------------------------------------------
mcp = FastMCP("Cricket-Score-Server")

# ---------------------------------------------------------------------------
# Mock Data Store (Simulated Third-Party Sports API Data)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# FastMCP Tool Definitions
# ---------------------------------------------------------------------------
@mcp.tool(description="Get the LIVE score of a cricket match. Use this for any question about the current score, who is winning, or runs required.")
def get_live_score(teams: str = Field(description="The two teams, e.g. 'India vs West Indies'")) -> dict:
    """Get the LIVE score of a cricket match."""
    # ① Log diagnostic trace to stderr (stdout is reserved strictly for MCP JSON-RPC frames)
    print(f"[server] get_live_score called with teams={teams!r}", file=sys.stderr)  # logs go to stderr, NEVER stdout
    # ② Normalize team names and look up the live match scorecard
    key = teams.strip().lower().replace("windies", "west indies")
    if key not in LIVE_MATCHES:
        return {"error": f"No live match found for '{teams}'. Try 'India vs West Indies'."}
    return LIVE_MATCHES[key]


@mcp.tool(description="Get a player's batting stats for the current series. Use this for questions about a specific player's runs.")
def get_player_stats(player_name: str = Field(description="Full player name, e.g. 'Shubman Gill'")) -> dict:
    """Get a player's batting stats for the current series."""
    # ① Log diagnostic trace to stderr
    print(f"[server] get_player_stats called with player_name={player_name!r}", file=sys.stderr)
    # ② Normalize player name and return series batting statistics
    key = player_name.strip().lower()
    if key not in PLAYER_STATS:
        return {"error": f"No stats found for '{player_name}'."}
    return PLAYER_STATS[key]


# ---------------------------------------------------------------------------
# Entry Point (Stdio Transport)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run(transport="stdio")

