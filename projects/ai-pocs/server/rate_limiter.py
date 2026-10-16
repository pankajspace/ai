"""IP-based rate limiter enforcing a strict sliding window quota.

Uses SQLite with WAL mode for lightweight, persistent, and concurrent tracking
across worker threads and container restarts without external dependencies.
"""

import sqlite3
import time
from pathlib import Path

DB_PATH = Path("/tmp/ai_rate_limit.db")


def get_db():
    conn = sqlite3.connect(str(DB_PATH), timeout=10)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS request_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            timestamp REAL NOT NULL
        );
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_ip_ts ON request_log (ip, timestamp);"
    )
    return conn


def get_client_ip(req):
    """Extract client IP address from Starlette/FastAPI Request or mock object."""
    if isinstance(req, str):
        return req
    headers = getattr(req, "headers", None)
    if headers:
        forwarded = headers.get("x-forwarded-for") or headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = headers.get("x-real-ip") or headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
    client = getattr(req, "client", None)
    if client and getattr(client, "host", None):
        return client.host
    return getattr(req, "remote_addr", "unknown")


def check_rate_limit(req, max_requests=30, window_seconds=3600):
    """Check if the requesting IP has exceeded max_requests in the sliding window.

    Returns:
        (is_blocked: bool, message: str or None, retry_after_seconds: int)
    """
    client_ip = get_client_ip(req)
    now = time.time()
    cutoff = now - window_seconds

    with get_db() as conn:
        # Purge entries older than the sliding window
        conn.execute("DELETE FROM request_log WHERE timestamp < ?", (cutoff,))
        # Count requests in the current window
        cur = conn.execute(
            "SELECT COUNT(*), MIN(timestamp) FROM request_log WHERE ip = ? AND timestamp >= ?",
            (client_ip, cutoff),
        )
        count, oldest = cur.fetchone()

        if count >= max_requests:
            remaining_seconds = int(window_seconds - (now - oldest))
            remaining_minutes = max(1, (remaining_seconds + 59) // 60)
            msg = (
                f"Rate limit exceeded (30 requests per hour). "
                f"Please try again in {remaining_minutes} minute{'s' if remaining_minutes != 1 else ''}."
            )
            return True, msg, remaining_seconds

        # Record this request
        conn.execute(
            "INSERT INTO request_log (ip, timestamp) VALUES (?, ?)",
            (client_ip, now),
        )
        return False, None, 0

