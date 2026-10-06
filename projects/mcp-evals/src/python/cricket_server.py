"""
cricket_server.py — a tiny MCP server
It exposes 2 tools. The data is MADE UP for class (no real API call).
"""
import sys
from pydantic import Field
from mcp.server.fastmcp import FastMCP

# ① create the MCP server; FastMCP handles the JSON-RPC protocol for us
mcp = FastMCP("Cricket-Score-Server")

# ② fake "third-party" data (pretend this came from a sports API)
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


@mcp.tool(description="Get the LIVE score of a cricket match. Use this for any question about the current score, who is winning, or runs required.")
def get_live_score(teams: str = Field(description="The two teams, e.g. 'India vs West Indies'")) -> dict:
    # ① log the call; logs go to stderr, NEVER stdout (stdout carries the MCP messages)
    print(f"[server] get_live_score called with teams={teams!r}", file=sys.stderr)
    # ② normalise the team names so "Windies" also matches
    key = teams.strip().lower().replace("windies", "west indies")
    # ③ return an error the model can read, or the match data
    if key not in LIVE_MATCHES:
        return {"error": f"No live match found for '{teams}'. Try 'India vs West Indies'."}
    return LIVE_MATCHES[key]


@mcp.tool(description="Get a player's batting stats for the current series. Use this for questions about a specific player's runs.")
def get_player_stats(player_name: str = Field(description="Full player name, e.g. 'Shubman Gill'")) -> dict:
    # ① log the call to stderr
    print(f"[server] get_player_stats called with player_name={player_name!r}", file=sys.stderr)
    # ② look the player up case-insensitively
    key = player_name.strip().lower()
    # ③ return an error the model can read, or the player's stats
    if key not in PLAYER_STATS:
        return {"error": f"No stats found for '{player_name}'."}
    return PLAYER_STATS[key]


if __name__ == "__main__":
    # ① serve over stdio: the client starts this file as a child process
    mcp.run(transport="stdio")
