"""Run this once to initialize the database and seed sample data."""
import db_client

db_client.init_db()
db_client.seed_sample_data()
print("Database initialized and seeded at:", db_client.DB_PATH)
