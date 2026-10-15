"""Python Fundamentals - Modules, Standard Library Imports, and __name__ Guard.

This script demonstrates importing and using Python's standard library modules:
1. Mathematical utilities with `math` (`math.isqrt`).
2. JSON serialization (`json.dumps`) and deserialization (`json.loads`).
3. Object-oriented filesystem path manipulation with `pathlib.Path`.
4. Date and time formatting with `datetime.datetime.strftime`.
5. Protecting script entry points using `if __name__ == "__main__":`.

Run directly:
    python practice/01-python/17-modules-imports.py
"""

import json
import math
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# 1. Standard Library Modules: math, json, pathlib, and datetime
# ---------------------------------------------------------------------------
# ① math: Compute exact integer square root
root = math.isqrt(49)
print(f"Square root: {root}")  # Square root: 7

# ② json: Serialize a Python dict to a JSON string and parse it back
user_data = {"username": "alex_dev", "role": "admin", "active": True}
json_string = json.dumps(user_data)
print(f"Serialized JSON: {json_string}")
# Serialized JSON: {"username": "alex_dev", "role": "admin", "active": true}

parsed_data = json.loads(json_string)
print(f"Parsed username: {parsed_data['username']}")  # Parsed username: alex_dev

# ③ pathlib.Path: Extract filename and extension cleanly across operating systems
config_path = Path("config/app.json")
print(f"Filename: {config_path.name}, Extension: {config_path.suffix}")
# Filename: app.json, Extension: .json

# ④ datetime: Format a datetime object into an ISO-8601 date string
sample_date = datetime(2026, 1, 1, 12, 0)
print(sample_date.strftime("%Y-%m-%d"))  # 2026-01-01


# ---------------------------------------------------------------------------
# 2. Entry Point Guard (__name__ == "__main__")
# ---------------------------------------------------------------------------
# Code inside `if __name__ == "__main__":` runs only when the file is executed
# directly, and is skipped when the file is imported as a module by another script.
def run_app():
    """Simulate application startup."""
    print("Application initialized successfully.")  # Application initialized successfully.


if __name__ == "__main__":
    run_app()


# ---------------------------------------------------------------------------
# Interview Question / Problem: Modular Configuration Loader
# ---------------------------------------------------------------------------
def load_config(raw_json: str, required_keys: list[str]) -> dict:
    """Parse a JSON configuration string and validate that all required keys exist.

    Args:
        raw_json: Raw JSON string containing configuration settings.
        required_keys: List of mandatory top-level keys that must be present.

    Returns:
        Validated configuration dictionary.

    Raises:
        ValueError: If JSON syntax is invalid, root is not an object, or keys are missing.
    """
    # ① Attempt to deserialize the raw JSON string, chaining any syntax error into ValueError
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as err:
        raise ValueError(f"Invalid JSON format: {err}") from err

    # ② Ensure the top-level JSON value is a dictionary/object
    if not isinstance(data, dict):
        raise ValueError("Configuration payload must be a JSON object.")

    # ③ Check for any missing required keys
    missing = [k for k in required_keys if k not in data]
    if missing:
        missing_str = ", ".join(missing)
        raise ValueError(f"Missing required configuration keys: {missing_str}")

    # ④ Return the validated configuration dictionary
    return data


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
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

print("Load config passed!")  # Load config passed!
