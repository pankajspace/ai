CREATE TABLE IF NOT EXISTS inventory (
    sku_id          TEXT PRIMARY KEY,
    name            TEXT,
    current_inventory INTEGER NOT NULL DEFAULT 0,
    avg_demand      REAL NOT NULL DEFAULT 0,   -- units per day
    lead_time       INTEGER NOT NULL DEFAULT 0, -- days
    safety_stock    INTEGER NOT NULL DEFAULT 0,
    updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id      TEXT NOT NULL,
    timestamp       TEXT DEFAULT (datetime('now')),
    user_query      TEXT NOT NULL,
    agent_response  TEXT NOT NULL,
    sku_ref         TEXT
);
