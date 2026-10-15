"""Python Fundamentals - List Comprehensions for Mapping and Filtering.

This script demonstrates concise, Pythonic list transformation and filtering:
1. Mapping an expression across every element (`[expr for x in iterable]`).
2. Filtering elements with a trailing predicate (`[x for x in iterable if cond]`).
3. Chaining string normalization methods inside a comprehension.
4. Conditional value selection using an inline ternary (`[a if cond else b for x in iterable]`).

Run directly:
    python practice/01-python/13-list-comprehensions.py
"""

# ---------------------------------------------------------------------------
# 1. Mapping & Filtering with List Comprehensions
# ---------------------------------------------------------------------------
# ① Example 1: Squaring numbers (pure mapping)
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# ② Example 2: Filtering even numbers (trailing `if` predicate)
evens = [n for n in numbers if n % 2 == 0]
print(evens)  # [2, 4]


# ---------------------------------------------------------------------------
# 2. String Cleaning & Inline Ternary Expressions
# ---------------------------------------------------------------------------
# ① Example 3: Cleaning and normalizing strings in a single pass
raw_tags = ["  python ", "FASTAPI", "  sql  "]
clean_tags = [tag.strip().lower() for tag in raw_tags]
print(clean_tags)  # ['python', 'fastapi', 'sql']

# ② Example 4: Inline ternary conditional (transforms every element without changing length)
labels = ["Even" if n % 2 == 0 else "Odd" for n in numbers]
print(labels)  # ['Odd', 'Even', 'Odd', 'Even', 'Odd']


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of file names, return a list containing only the .csv files
# converted to lowercase.
def get_csv_files(filenames: list[str]) -> list[str]:
    """Filter a list of filenames for .csv files (case-insensitive) and normalize to lowercase.

    Args:
        filenames: List of raw file name strings.

    Returns:
        List of lowercase file names that end with '.csv'.
    """
    # ① Filter for names ending with '.csv' (case-insensitive) and lowercase each match
    return [name.lower() for name in filenames if name.lower().endswith(".csv")]


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
files = ["data.CSV", "report.pdf", "users.csv", "image.png"]
print(get_csv_files(files))  # ['data.csv', 'users.csv']
print("Filter CSV files passed!")  # Filter CSV files passed!
