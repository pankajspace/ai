import sqlite3
import os
from typing import Optional

DB_PATH = os.getenv("DB_PATH", "../db/inventory.db")

# schema.sql ships inside the image next to the backend code. The persistent
# volume (EFS on AWS) is mounted at a *different* path (/app/data) so the
# schema file is never hidden by the mount.
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db", "schema.sql")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    db_dir = os.path.dirname(os.path.abspath(DB_PATH))
    os.makedirs(db_dir, exist_ok=True)
    with open(SCHEMA_PATH) as f:
        sql = f.read()
    with _connect() as conn:
        conn.executescript(sql)


def get_inventory(sku_id: str) -> Optional[dict]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM inventory WHERE sku_id = ?", (sku_id,)
        ).fetchone()
    return dict(row) if row else None


def upsert_inventory(data: dict) -> None:
    fields = ["sku_id", "name", "current_inventory", "avg_demand", "lead_time", "safety_stock"]
    values = [data.get(f) for f in fields]
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO inventory (sku_id, name, current_inventory, avg_demand, lead_time, safety_stock)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(sku_id) DO UPDATE SET
                name = excluded.name,
                current_inventory = excluded.current_inventory,
                avg_demand = excluded.avg_demand,
                lead_time = excluded.lead_time,
                safety_stock = excluded.safety_stock,
                updated_at = datetime('now')
            """,
            values,
        )


def log_session(session_id: str, user_query: str, agent_response: str, sku_ref: Optional[str] = None) -> None:
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO sessions (session_id, user_query, agent_response, sku_ref)
            VALUES (?, ?, ?, ?)
            """,
            (session_id, user_query, agent_response, sku_ref),
        )


def seed_sample_data() -> None:
    """Insert sample SKUs only if they don't exist yet, so user edits survive restarts."""
    samples = [
        {"sku_id": "SKU001", "name": "Widget A", "current_inventory": 100, "avg_demand": 10.0, "lead_time": 7, "safety_stock": 20},
        {"sku_id": "SKU002", "name": "Widget B", "current_inventory": 40,  "avg_demand": 8.0,  "lead_time": 5, "safety_stock": 15},
        {"sku_id": "SKU003", "name": "Gadget X", "current_inventory": 200, "avg_demand": 5.0,  "lead_time": 10, "safety_stock": 10},
    ]
    fields = ["sku_id", "name", "current_inventory", "avg_demand", "lead_time", "safety_stock"]
    with _connect() as conn:
        for item in samples:
            conn.execute(
                """
                INSERT OR IGNORE INTO inventory (sku_id, name, current_inventory, avg_demand, lead_time, safety_stock)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [item[f] for f in fields],
            )
