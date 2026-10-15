"""Python Fundamentals - Exception Handling with try/except.

This script demonstrates defensive error handling patterns in Python:
1. Catching ValueError when parsing invalid numeric strings.
2. Catching KeyError to provide fallback defaults for missing dictionary keys.
3. Handling ZeroDivisionError gracefully to prevent runtime crashes during arithmetic.

Run directly:
    python practice/01-python/04-error-handling.py
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# 1. Handling ValueError During Type Conversion
# ---------------------------------------------------------------------------
def get_age(age: str) -> int | None:
    """Convert an age string to an integer, logging an error if conversion fails.

    Args:
        age: Raw string representing a user's age.

    Returns:
        Parsed integer age, or None if the input is not a valid integer string.
    """
    try:
        # ① Attempt to parse the string into an integer
        return int(age)
    except ValueError as e:
        # ② Handle invalid numeric strings without crashing the caller
        # raise RuntimeError("Cant covert age to int")
        # raise e
        print("Cant covert age to int")  # Cant covert age to int


print(f"get_age: {get_age('40')}")       # get_age: 40
print(f"get_age: {get_age('fourty')}")   # get_age: None


# ---------------------------------------------------------------------------
# 2. Handling KeyError for Missing Dictionary Keys
# ---------------------------------------------------------------------------
def get_retries(data: dict) -> int | None:
    """Retrieve the 'retries' setting from a configuration dictionary with a fallback default.

    Args:
        data: Configuration dictionary that may contain a 'retries' key.

    Returns:
        Configured retry count, or 3 if the 'retries' key is absent.
    """
    try:
        # ① Attempt direct key lookup in the dictionary
        return data["retries"]
    except KeyError:
        # ② Fall back to 3 retries if the key is not provided in data
        return 3


print(f"get_retries: {get_retries({'retries': 5})}")  # get_retries: 5
print(f"get_retries: {get_retries({})}")               # get_retries: 3


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Write a function that safely divides two numbers and returns None if division by zero occurs.
def safe_divide(a: int, b: int) -> float | None:
    """Divide a by b safely, returning None when the divisor is zero.

    Args:
        a: Numerator integer.
        b: Denominator integer.

    Returns:
        Floating-point quotient a / b, or None if b is 0.
    """
    try:
        # ① Perform true division
        return a / b
    except ZeroDivisionError as e:
        # ② Catch division by zero, log a notice, and implicitly return None
        print("Cannot divide by zero", end=". ")  # Cannot divide by zero. 


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
print(f"safe_divide: {safe_divide(4, 2)}")  # safe_divide: 2.0
print(f"safe_divide: {safe_divide(2, 4)}")  # safe_divide: 0.5
print(f"safe_divide: {safe_divide(2, 0)}")  # Cannot divide by zero. safe_divide: None
print("Safe divide passed!")                # Safe divide passed!
