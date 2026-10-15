"""Python Fundamentals - Functions, Default Parameters, *args, and **kwargs.

This script demonstrates flexible function signatures and argument forwarding in Python:
1. Default parameter values and overriding defaults positionally or by keyword.
2. Variable positional arguments (`*args` packed as a `tuple`) and sequence unpacking (`*list`).
3. Variable keyword arguments (`**kwargs` packed as a `dict`) and dict unpacking (`**dict`).
4. Returning multiple values as an implicit tuple and transparent wrapper forwarding.

Run directly:
    python practice/01-python/14-functions.py
"""

# ---------------------------------------------------------------------------
# 1. Default Parameters & Variable Positional Arguments (*args)
# ---------------------------------------------------------------------------
# ① Function with a default parameter value (tax_rate defaults to 8%)
def calculate_total(subtotal: float, tax_rate: float = 0.08) -> float:
    """Compute the final total after applying a tax rate, rounded to 2 decimal places."""
    return round(subtotal * (1 + tax_rate), 2)


print(calculate_total(100.0))         # 108.0 (default 8% tax)
print(calculate_total(100.0, 0.05))   # 105.0 (overrides tax rate)


# ② Variable positional arguments (*numbers packs all arguments into a tuple)
def calculate_average(*numbers: float) -> float:
    """Return the arithmetic mean of any number of numeric arguments, or 0.0 if empty."""
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)


print(calculate_average(10, 20, 30))  # 20.0
scores = [85, 90, 95]
print(calculate_average(*scores))     # 90.0 (unpacking list with *)


# ---------------------------------------------------------------------------
# 2. Variable Keyword Arguments (**kwargs) & Unpacking
# ---------------------------------------------------------------------------
# ① **attributes captures arbitrary keyword arguments as a dictionary
def build_profile(username: str, **attributes) -> dict:
    """Construct a user profile dictionary merging a required username with arbitrary attributes."""
    profile = {"username": username}
    profile.update(attributes)
    return profile


user = build_profile("alex_dev", role="admin", active=True, theme="dark")
print(user)
# {'username': 'alex_dev', 'role': 'admin', 'active': True, 'theme': 'dark'}

# ② Unpack a dictionary into keyword arguments at the call site using `**`
extra_opts = {"retries": 3, "timeout": 15}


def connect(host: str, **opts):
    """Format a connection summary string with host and keyword options."""
    return f"Connecting to {host} with {opts}"


print(connect("db.internal", **extra_opts))
# Connecting to db.internal with {'retries': 3, 'timeout': 15}


# ---------------------------------------------------------------------------
# 3. Multiple Return Values & Transparent Argument Forwarding
# ---------------------------------------------------------------------------
# ① Returning comma-separated values automatically packs them into a tuple
def get_dimensions() -> tuple[int, int]:
    """Return screen width and height as a (width, height) tuple."""
    return 1920, 1080


width, height = get_dimensions()
print(f"Width: {width}, Height: {height}")  # Width: 1920, Height: 1080


# ② Forward arbitrary positional and keyword arguments through a higher-order wrapper
def log_call(fn, *args, **kwargs):
    """Invoke a target callable by forwarding all positional and keyword arguments."""
    return fn(*args, **kwargs)


print(log_call(calculate_total, 200.0, 0.10))  # 220.0


# ---------------------------------------------------------------------------
# Interview Question 1 / Problem: Calculate Tip Amount
# ---------------------------------------------------------------------------
def calculate_tip(bill: float, percentage: float = 15.0) -> float:
    """Calculate the tip amount for a bill given a tip percentage.

    Args:
        bill: Non-negative bill subtotal.
        percentage: Tip percentage to apply (defaults to 15.0).

    Returns:
        Tip amount rounded to 2 decimal places.
    """
    # ① Validate that the bill amount is non-negative
    if bill < 0:
        raise ValueError("Bill cannot be negative.")
    # ② Compute tip from percentage and round to cents
    return round(bill * (percentage / 100), 2)


# ---------------------------------------------------------------------------
# Verification / Test Cases (Question 1)
# ---------------------------------------------------------------------------
print(calculate_tip(100.0))        # 15.0
print(calculate_tip(50.0, 20.0))   # 10.0
print(calculate_tip(0.0))          # 0.0
print("Calculate tip passed!")     # Calculate tip passed!


# ---------------------------------------------------------------------------
# Interview Question 2 / Problem: Build Query URL with *args and **kwargs
# ---------------------------------------------------------------------------
def build_query_url(base_url: str, *paths: str, **params: str) -> str:
    """Assemble a full URL from a base URL, variable path segments, and query parameters.

    Args:
        base_url: Root domain/endpoint string.
        *paths: Variable number of URL path segments to append.
        **params: Key-value query string parameters (sorted alphabetically).

    Returns:
        Formatted URL string with normalized slashes and optional query string.
    """
    # ① Strip any trailing slash from the base URL
    url = base_url.rstrip("/")
    # ② Append normalized path segments if provided
    if paths:
        url += "/" + "/".join(p.strip("/") for p in paths)
    # ③ Format and append sorted query parameters if provided
    if params:
        query = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        url += "?" + query
    # ④ Return the assembled URL
    return url


# ---------------------------------------------------------------------------
# Verification / Test Cases (Question 2)
# ---------------------------------------------------------------------------
print(build_query_url("https://api.example.com", "v1", "users", page="1", sort="desc"))
# https://api.example.com/v1/users?page=1&sort=desc
print(build_query_url("https://api.example.com", status="active"))
# https://api.example.com?status=active
print(build_query_url("https://api.example.com/", "health"))
# https://api.example.com/health
print("Build query URL passed!")   # Build query URL passed!
