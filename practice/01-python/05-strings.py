"""Python Fundamentals - String Formatting, Manipulation, and Normalization.

This script demonstrates essential string operations for data processing:
1. Modern f-strings with numeric format specifiers and string repetition/concatenation (+, *).
2. Substring membership checks using `in` and `not in`.
3. Sanitizing raw user input with `.strip()` and `.lower()`.
4. Tokenizing and reassembling strings with `.split()` and `.join()`.
5. Distinguishing identity checks (`is None`) from value equality (`==`).

Run directly:
    python practice/01-python/05-strings.py
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# 1. Modern f-Strings & String Operators (+, *)
# ---------------------------------------------------------------------------
# ① Format floating-point values to 2 decimal places inside an f-string
product = "Coffee Mug"
price = 12.994
print(f"Item: {product} | Cost: ${price:.2f}")  # Item: Coffee Mug | Cost: $12.99

# ② Repeat characters with `*` and concatenate strings with `+`
divider = "=" * 30
header = "[ " + product.upper() + " ]"
print(f"{header}\n{divider}")
# [ COFFEE MUG ]
# ==============================


# ---------------------------------------------------------------------------
# 2. Substring Membership Operators (in, not in)
# ---------------------------------------------------------------------------
# Check for required or restricted substrings within an email address
user_email = "alex@company.com"
if "@" in user_email and "." in user_email:
    print("Valid email structure.")  # Valid email structure.

if "admin" not in user_email:
    print("Standard user account.")  # Standard user account.


# ---------------------------------------------------------------------------
# 3. Cleaning & Normalizing User Input
# ---------------------------------------------------------------------------
# Strip leading/trailing whitespace (including newlines) and normalize case
raw_email = "   Alex@Company.COM \n"
clean_email = raw_email.strip().lower()
print(clean_email)  # alex@company.com


# ---------------------------------------------------------------------------
# 4. Splitting & Joining Strings
# ---------------------------------------------------------------------------
# ① Split a delimiter-separated string into a list of tokens
csv_row = "laptop,electronics,999"
parts = csv_row.split(",")
print(parts)  # ['laptop', 'electronics', '999']

# ② Join a list of strings back into a single formatted string using a separator
joined = " -> ".join(parts)
print(joined)  # laptop -> electronics -> 999


# ---------------------------------------------------------------------------
# 5. Safe None Identity Check vs Value Equality
# ---------------------------------------------------------------------------
# ① Always use `is None` / `is not None` when checking for None singleton identity
user_input = None
if user_input is None:
    print("No input provided.")  # No input provided.

# ② Always use `==` to compare string values for equality
status = "active"
print(status == "active")  # True (always use == for string comparisons)


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Write a function that normalizes a full name by removing extra spaces and
# capitalizing each word. Safely handle None input.
def normalize_name(raw_name: str | None) -> str:
    """Normalize a raw name string into title-cased words separated by single spaces.

    Args:
        raw_name: Input name string (potentially containing extra spaces) or None.

    Returns:
        Cleaned, capitalized full name string, or an empty string if None/whitespace.
    """
    # ① Guard against None input immediately
    if raw_name is None:
        return ""
    # ② .split() without arguments collapses all consecutive whitespace and trims edges
    words = raw_name.split()
    # ③ Capitalize each word token and join with a single space
    return " ".join(w.capitalize() for w in words)


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
print(normalize_name("  alex   MORGAN  "))  # Alex Morgan
print(normalize_name("john"))                # John
print(repr(normalize_name("   ")))           # ''
print(repr(normalize_name(None)))            # ''
print("Normalize name passed!")              # Normalize name passed!