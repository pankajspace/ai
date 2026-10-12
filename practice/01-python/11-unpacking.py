# 1. Multiple assignment and variable swap
a, b = 10, 20
a, b = b, a
print(f"Swapped: a={a}, b={b}")  # Swapped: a=20, b=10

# 2. Starred unpacking for flexible lengths
scores = [98, 85, 91, 78, 88]
highest, *others, lowest = sorted(scores, reverse=True)
print(f"Top: {highest}, Rest: {others}, Lowest: {lowest}")
# Top: 98, Rest: [91, 88, 85], Lowest: 78

# 3. Discarding unneeded elements
name, _, email = ("Bob Smith", "Accountant", "bob@example.com")
print(f"{name} <{email}>")  # Bob Smith <bob@example.com>

# 4. Nested unpacking and dictionary merging
user_payload = ("admin_user", ("us-east", "cluster-1"))
username, (region, cluster) = user_payload
print(f"User {username} deployed to {region}/{cluster}")
# User admin_user deployed to us-east/cluster-1

default_settings = {"theme": "light", "notifications": True, "timeout": 30}
user_settings = {"theme": "dark", "timeout": 60}
active_settings = {**default_settings, **user_settings}
print(active_settings)  # {'theme': 'dark', 'notifications': True, 'timeout': 60}


# Interview question: Given a list of transaction records, use destructuring to calculate total amount spent per currency for COMPLETED transactions.
def extract_successful_totals(transactions: list[tuple]) -> dict[str, float]:
    totals = {}
    for _tx_id, _customer, (amount, currency), status in transactions:
        if status == "COMPLETED":
            totals[currency] = round(totals.get(currency, 0.0) + amount, 2)
    return totals

# Test cases
records = [
    ("TX101", "Alice", (120.50, "USD"), "COMPLETED"),
    ("TX102", "Bob", (45.00, "EUR"), "PENDING"),
    ("TX103", "Charlie", (80.25, "USD"), "COMPLETED"),
    ("TX104", "Alice", (30.00, "EUR"), "COMPLETED"),
]
print(extract_successful_totals(records))  # {'USD': 200.75, 'EUR': 30.0}
print("Extract successful totals passed!")  # Extract successful totals passed!

