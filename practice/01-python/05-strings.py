from __future__ import annotations

# 1. Modern f-strings and string operators (+, *)
product = "Coffee Mug"
price = 12.994
print(f"Item: {product} | Cost: ${price:.2f}")  # Item: Coffee Mug | Cost: $12.99

divider = "=" * 30
header = "[ " + product.upper() + " ]"
print(f"{header}\n{divider}")
# [ COFFEE MUG ]
# ==============================

# 2. Membership operators (in and not in)
user_email = "alex@company.com"
if "@" in user_email and "." in user_email:
    print("Valid email structure.")  # Valid email structure.

if "admin" not in user_email:
    print("Standard user account.")  # Standard user account.

# 3. Cleaning user inputs
raw_email = "   Alex@Company.COM \n"
clean_email = raw_email.strip().lower()
print(clean_email)  # alex@company.com

# 4. Splitting and joining
csv_row = "laptop,electronics,999"
parts = csv_row.split(",")
print(parts)  # ['laptop', 'electronics', '999']

joined = " -> ".join(parts)
print(joined)  # laptop -> electronics -> 999

# 5. Safe None check vs value equality
user_input = None
if user_input is None:
    print("No input provided.")  # No input provided.

# Value equality vs identity
status = "active"
print(status == "active")  # True (always use == for string comparisons)


# Interview question: Write a function that normalizes a full name by removing extra spaces and capitalizing each word. Safely handle None input.
def normalize_name(raw_name: str | None) -> str:
    if raw_name is None:
        return ""
    words = raw_name.split()
    return " ".join(w.capitalize() for w in words)

# Test cases
print(normalize_name("  alex   MORGAN  "))  # Alex Morgan
print(normalize_name("john"))                # John
print(repr(normalize_name("   ")))           # ''
print(repr(normalize_name(None)))            # ''
print("Normalize name passed!")              # Normalize name passed!