"""Python Fundamentals - Sequence Unpacking, Destructuring, and Dict Merging.

This script demonstrates Python's unpacking and destructuring idioms:
1. Multiple assignment and in-place variable swapping.
2. Catch-all starred unpacking (`*rest`) for variable-length sequences.
3. Ignoring unneeded values with the underscore (`_`) throwaway convention.
4. Nested sequence destructuring and dictionary merging with `**`.

Run directly:
    python practice/01-python/12-unpacking.py
"""

# ---------------------------------------------------------------------------
# 1. Multiple Assignment & Variable Swap
# ---------------------------------------------------------------------------
# Assign and swap variables simultaneously without a temporary variable
a, b = 10, 20
a, b = b, a
print(f"Swapped: a={a}, b={b}")  # Swapped: a=20, b=10


# ---------------------------------------------------------------------------
# 2. Starred Unpacking (*rest) & Throwaway Variables (_)
# ---------------------------------------------------------------------------
# ① Capture boundary values and pack all middle elements into a list using `*`
scores = [98, 85, 91, 78, 88]
highest, *others, lowest = sorted(scores, reverse=True)
print(f"Top: {highest}, Rest: {others}, Lowest: {lowest}")
# Top: 98, Rest: [91, 88, 85], Lowest: 78

# ② Use `_` by convention to discard positional values that are not needed
name, _, email = ("Bob Smith", "Accountant", "bob@example.com")
print(f"{name} <{email}>")  # Bob Smith <bob@example.com>


# ---------------------------------------------------------------------------
# 3. Nested Unpacking & Dictionary Merging (**)
# ---------------------------------------------------------------------------
# ① Destructure nested tuple structures directly in the assignment target
user_payload = ("admin_user", ("us-east", "cluster-1"))
username, (region, cluster) = user_payload
print(f"User {username} deployed to {region}/{cluster}")
# User admin_user deployed to us-east/cluster-1

# ② Merge dictionaries using `**` (later keys override earlier keys)
default_settings = {"theme": "light", "notifications": True, "timeout": 30}
user_settings = {"theme": "dark", "timeout": 60}
active_settings = {**default_settings, **user_settings}
print(active_settings)  # {'theme': 'dark', 'notifications': True, 'timeout': 60}


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of transaction records, use destructuring to calculate total
# amount spent per currency for COMPLETED transactions.
def extract_successful_totals(transactions: list[tuple]) -> dict[str, float]:
    """Aggregate total transaction amounts per currency for COMPLETED records.

    Args:
        transactions: List of nested tuples in the form
            (tx_id, customer, (amount, currency), status).

    Returns:
        Dictionary mapping each currency code to its rounded total amount.
    """
    # ① Initialize per-currency totals dictionary
    totals = {}

    # ② Unpack nested transaction fields directly in the loop header
    for _tx_id, _customer, (amount, currency), status in transactions:
        # ③ Filter for completed transactions and accumulate rounded currency totals
        if status == "COMPLETED":
            totals[currency] = round(totals.get(currency, 0.0) + amount, 2)

    # ④ Return aggregated totals by currency
    return totals


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
records = [
    ("TX101", "Alice", (120.50, "USD"), "COMPLETED"),
    ("TX102", "Bob", (45.00, "EUR"), "PENDING"),
    ("TX103", "Charlie", (80.25, "USD"), "COMPLETED"),
    ("TX104", "Alice", (30.00, "EUR"), "COMPLETED"),
]
print(extract_successful_totals(records))  # {'USD': 200.75, 'EUR': 30.0}
print("Extract successful totals passed!")  # Extract successful totals passed!
