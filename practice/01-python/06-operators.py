# 1. Arithmetic, Division (/, //, %), Exponentiation (**), and divmod()
print(10 / 2)     # 5.0 (True division ALWAYS returns a float)
print(7 / 2)      # 3.5
print(7 // 2)     # 3   (Floor division truncates towards -infinity)
print(10 // 3)    # 3
print(-7 // 2)    # -4  (Rounds DOWN to -4, not -3!)

# Modulo operator (%) & Even/Odd checking
print(7 % 2)      # 1   (Remainder)
print(12 % 4)     # 0   (Evenly divisible)
number = 14
is_even = (number % 2 == 0)
print(is_even)    # True

# Exponentiation (**)
print(2 ** 8)     # 256 (Power operator)

# Practical 1: Pagination calculation with floor division
total_records = 23
per_page = 5
total_pages = (total_records + per_page - 1) // per_page
print(f"Total pages needed: {total_pages}")  # Total pages needed: 5

# Practical 2: Converting seconds into minutes and seconds
total_seconds = 145
minutes = total_seconds // 60   # 2 minutes
seconds = total_seconds % 60    # 25 seconds
print(f"Formatted time: {minutes}m {seconds}s")  # Formatted time: 2m 25s

# divmod() computes quotient and remainder together
mins, secs = divmod(total_seconds, 60)
print(mins, secs)  # 2 25

# Practical 3: Circular index wrapping
total_slides = 5
for current_slide in range(5):
    next_slide = (current_slide + 1) % total_slides
    # Wraps: 0->1, 1->2, 2->3, 3->4, 4->0

# 2. Identity operators (is, is not) vs Equality (==, !=)
list_a = [1, 2, 3]
list_b = [1, 2, 3]
list_c = list_a

print(list_a == list_b)  # True (same values)
print(list_a is list_b)  # False (different objects in memory)
print(list_a is list_c)  # True (exact same object)

# Checking None safely with is and is not
current_user = None
if current_user is None:
    print("User is not logged in.")  # User is not logged in.

active_session = "sess_xyz789"
if active_session is not None:
    print("Session is active.")      # Session is active.

# 3. Membership operators (in, not in) across collections
allowed_roles = {"admin", "editor", "moderator"}
if "editor" in allowed_roles:
    print("Authorized.")             # Authorized.

blocked_ips = ["192.168.1.10", "10.0.0.99"]
if "172.16.0.1" not in blocked_ips:
    print("IP connection allowed.")  # IP connection allowed.

# Dictionary key and string membership
user_dict = {"username": "alex", "tier": "gold"}
if "username" in user_dict:
    print("Key exists in user dict.")  # Key exists in user dict.

if "@" in "alex@example.com":
    print("Valid email marker found.")  # Valid email marker found.

# 4. Comparison operators (==, !=, <, >, <=, >=) & Chained comparisons
item_count = 10
print(item_count != 0)   # True
print(item_count >= 5)   # True

user_age = 28
if 18 <= user_age < 65:  # Chained inequality: evaluated as (18 <= age and age < 65)
    print("Working adult tier.")  # Working adult tier.

# 5. Innate Truthiness & Pythonic Emptiness Checking
# Innate falsy values: 0, 0.0, "", [], {}, set(), None
print(bool(0))        # False
print(bool(""))       # False
print(bool([]))       # False
print(bool({}))       # False
print(bool(None))     # False

# Innate truthy values: non-zero numbers, populated collections
print(bool(42))       # True
print(bool("text"))   # True
print(bool([1, 2]))   # True

# Clean emptiness checking (prefer 'if not items' over 'if len(items) == 0')
cart = []
if not cart:
    print("Shopping cart is empty.")  # Shopping cart is empty.

# 6. Logical operators (and, or, not) with Short-Circuit Evaluation
# 'and' stops at the first falsy operand and returns it; if all are truthy, returns the last
print([] and "python")         # [] (first operand is falsy, returns immediately)
print("apple" and "banana")    # banana (both truthy, returns last)

# 'or' stops at the first truthy operand and returns it (idiomatic fallback default)
default_theme = "" or "dark"   # "dark" (first operand is falsy, evaluates next)
print(default_theme)           # dark

raw_name = None
display_name = raw_name or "Guest"
print(display_name)            # Guest

# 'not' inverts boolean truthiness
is_admin = False
if not is_admin:
    print("Regular user permissions.")  # Regular user permissions.

# 7. Inline Ternary Conditional and Walrus operator (:=)
score = 82
result = "Pass" if score >= 60 else "Fail"
print(result)  # Pass

payload = "sensor_alpha_online"
if (length := len(payload)) > 10:
    print(f"Payload accepted with {length} characters.")  # Payload accepted with 19 characters.


# Given an integer, return "Fizz" if it's divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if divisible by both, or the number as a string otherwise.
def fizz_buzz(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    return str(n)

# Test cases
print(fizz_buzz(15))  # FizzBuzz
print(fizz_buzz(9))   # Fizz
print(fizz_buzz(10))  # Buzz
print(fizz_buzz(7))   # 7
print("FizzBuzz passed!")
