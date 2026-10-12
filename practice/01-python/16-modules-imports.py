import json
import math
from datetime import datetime
from pathlib import Path

# 1. Standard library math functions
root = math.isqrt(49)
print(f"Square root: {root}")  # Square root: 7

# 2. JSON serialization and deserialization
user_data = {"username": "alex_dev", "role": "admin", "active": True}
json_string = json.dumps(user_data)
print(f"Serialized JSON: {json_string}")
# Serialized JSON: {"username": "alex_dev", "role": "admin", "active": true}

parsed_data = json.loads(json_string)
print(f"Parsed username: {parsed_data['username']}")  # Parsed username: alex_dev

# 3. Pathlib for filesystem path handling
config_path = Path("config/app.json")
print(f"Filename: {config_path.name}, Extension: {config_path.suffix}")
# Filename: app.json, Extension: .json

# 4. Datetime handling
sample_date = datetime(2026, 1, 1, 12, 0)
print(sample_date.strftime("%Y-%m-%d"))  # 2026-01-01

# 5. Entry point guard for standalone script execution
def run_app():
    print("Application initialized successfully.")  # Application initialized successfully.

if __name__ == "__main__":
    run_app()


# Interview question: Modular configuration loader
def load_config(raw_json: str, required_keys: list[str]) -> dict:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as err:
        raise ValueError(f"Invalid JSON format: {err}") from err

    if not isinstance(data, dict):
        raise ValueError("Configuration payload must be a JSON object.")

    missing = [k for k in required_keys if k not in data]
    if missing:
        missing_str = ", ".join(missing)
        raise ValueError(f"Missing required configuration keys: {missing_str}")

    return data

# Test cases
valid_payload = '{"host": "localhost", "port": 5432, "database": "analytics"}'
config = load_config(valid_payload, ["host", "port"])
print(config["host"])  # localhost
print(config["port"])  # 5432

# Test missing key raises ValueError
try:
    load_config(valid_payload, ["host", "api_key"])
except ValueError as e:
    print(e)  # Missing required configuration keys: api_key

# Test invalid JSON syntax raises ValueError
try:
    load_config("{invalid: json", ["host"])
except ValueError as e:
    print("Invalid JSON caught")  # Invalid JSON caught

print("Load config passed!")

