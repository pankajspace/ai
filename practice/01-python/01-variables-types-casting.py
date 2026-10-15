"""Python Fundamentals - Variables, Data Types, and Type Casting.

This script demonstrates foundational variable assignment and type system mechanics in Python:
1. Dynamic variable declaration across primitive types (str, int, float, bool, NoneType).
2. Runtime type inspection using the built-in type() function.
3. Explicit type casting (str(), int(), float(), bool()) and truncation/truthiness rules.
4. Safe integer parsing and aggregation over heterogeneous collections using try/except.

Run directly:
    python practice/01-python/01-variables-types-casting.py
"""

# ---------------------------------------------------------------------------
# 1. Variable Declaration & Dynamic Typing
# ---------------------------------------------------------------------------
# ① Assign values of different primitive types without explicit type declarations
user_name = "Pankaj"
user_age = 30
user_height = 5.10
user_active = True
user_session = None

# ② Format and display variable values using an f-string
print(f"\nUser details are as follows: \nName: {user_name}, Age: {user_age}, Height: {user_height}\n")
# User details are as follows: 
# Name: Pankaj, Age: 30, Height: 5.1


# ---------------------------------------------------------------------------
# 2. Runtime Type Inspection
# ---------------------------------------------------------------------------
# Inspect the underlying class of each variable at runtime using type()
print()
print(f"user_name: {type(user_name)}")  # user_name: <class 'str'>
print(f"user_age: {type(user_age)}")  # user_age: <class 'int'>
print(f"user_height: {type(user_height)}")  # user_height: <class 'float'>
print(f"user_active: {type(user_active)}")  # user_active: <class 'bool'>
print(f"user_session: {type(user_session)}")  # user_session: <class 'NoneType'>
print()


# ---------------------------------------------------------------------------
# 3. Explicit Type Conversion (Casting)
# ---------------------------------------------------------------------------
# Convert between primitive types using built-in constructor functions:
# - str() converts numbers to string representation
# - int() truncates floating-point decimals toward zero
# - float() adds decimal precision to integers
# - bool() evaluates truthiness (None evaluates to False)
print()
print(str(user_age), type(str(user_age))) # "30" <class 'str'>
print(int(user_height), type(int(user_height))) # 5 <class 'int'>
print(float(user_age), type(float(user_age))) # 30.0 <class 'float'>
print(bool(user_session), type(bool(user_session))) # False <class 'bool'>
print()


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a mixed list of values containing numbers, numeric strings, and
# non-numeric strings, compute the sum of all valid integers.
def sum_valid_integers(items: list) -> int:
    """Compute the sum of all elements in a list that can be safely cast to int.

    Args:
        items: A heterogeneous list of values (e.g., ints, numeric strings, None).

    Returns:
        The integer sum of all valid convertible elements.
    """
    # ① Initialize running accumulator
    total = 0

    # ② Iterate through each raw element and attempt integer conversion
    for item in items:
        try:
            # raise
            # ③ Convert item to int and add to total
            total += int(item)
        except (ValueError, TypeError):
            # ④ Ignore unparseable strings (ValueError) or unsupported types like None (TypeError)
            continue

    # ⑤ Return the final accumulated sum
    return total


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
## Test case 1
print("sum_valid_integers:", sum_valid_integers([10, "20", "abc", 5, None, "30"])) # 65
## Test case 2
print("sum_valid_integers:", sum_valid_integers(["1", "2", "3"])) # 6
print("Sum valid integers passed!")  # Sum valid integers passed!
