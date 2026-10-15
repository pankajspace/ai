"""Python Fundamentals - Static Type Hints and Annotations.

This script demonstrates modern Python type annotations for static analysis and readability:
1. Basic variable type annotations for primitive types.
2. Function parameter and return type annotations (including None returns).
3. Built-in generic collection annotations (list, dict, tuple, set).
4. Union types using the modern pipe operator (|) and optional values.
5. Type aliases for naming composite data structures.

Run directly:
    python practice/01-python/02-type-hints.py
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# 1. Basic Variable Annotations
# ---------------------------------------------------------------------------
# Annotate primitive variables with explicit types for static type checkers (mypy/pyright)
user_name: str = "Pankaj"
user_age: int = 30
user_height: float = 5.10
user_active: bool = True
user_session: None = None


# ---------------------------------------------------------------------------
# 2. Basic Function Annotations
# ---------------------------------------------------------------------------
# ① Function with typed string parameter and string return annotation
def greet(name: str) -> str:
    """Format a greeting message for the given user name.

    Args:
        name: Name of the person to greet.

    Returns:
        Formatted greeting string.
    """
    return f"Hello, {name}!"


print(greet("Pankaj"))  # Hello, Pankaj!


# ② Function that performs a side effect and returns None
def process() -> None:
    """Log a processing status message to the console with no return value."""
    print("Processing...")  # Processing...


process()


# ---------------------------------------------------------------------------
# 3. Built-In Collection & Generic Type Annotations
# ---------------------------------------------------------------------------
# Parameterize standard collections directly (Python 3.9+ syntax)
# list annotation
numbers: list[int] = [1, 2, 3, 4, 5]
# dictionary annotation
user_info: dict[str, str] = {"name": "Pankaj", "city": "New York"}
# tuple annotation
coordinates: tuple[float, float] = (40.7128, 74.0060)
# set annotation
unique_numbers: set[int] = {1, 2, 3, 4, 5}


# ---------------------------------------------------------------------------
# 4. Union Type Annotations & Optional Values
# ---------------------------------------------------------------------------
# Use the pipe operator (|) to allow multiple types or nullable (Optional) values
value: int | str = 42
value = "Hello"
optional_value: int | None = None


# ---------------------------------------------------------------------------
# 5. Type Aliases
# ---------------------------------------------------------------------------
# Define reusable type aliases to give domain-meaningful names to composite types
Point = tuple[float, float]
location: Point = (40.7128, 74.0060)


# ---------------------------------------------------------------------------
# Interview Question / Problem: Parse Record
# ---------------------------------------------------------------------------
ParsedRecord = tuple[str, int, float]


def parse_record(raw: dict[str, str]) -> ParsedRecord | None:
    """Parse a raw string dictionary into a strongly typed (name, age, balance) tuple.

    Args:
        raw: Dictionary mapping field names ('name', 'age', 'balance') to raw strings.

    Returns:
        A (str, int, float) tuple if all fields exist and parse cleanly, or None on error.
    """
    try:
        # ① Extract required string field directly
        name = raw["name"]
        # ② Cast numeric string fields to int and float respectively
        age = int(raw["age"])
        balance = float(raw["balance"])
        # ③ Return the structured tuple matching ParsedRecord
        return name, age, balance
    except (KeyError, ValueError):
        # ④ Return None if any required key is missing or numeric conversion fails
        return None


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
record_ok = {"name": "Charlie", "age": "29", "balance": "150.50"}
parsed = parse_record(record_ok)
print(parsed)  # ('Charlie', 29, 150.5)

record_bad = {"name": "Bob", "balance": "invalid"}
print(parse_record(record_bad))  # None

empty_record = {}
print(parse_record(empty_record))  # None
print("Parse record with type hints passed!")  # Parse record with type hints passed!