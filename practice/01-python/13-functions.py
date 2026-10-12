# 1. Default parameters and multiple return values
def calculate_total(subtotal: float, tax_rate: float = 0.08) -> float:
    return round(subtotal * (1 + tax_rate), 2)

print(calculate_total(100.0))         # 108.0 (default 8% tax)
print(calculate_total(100.0, 0.05))   # 105.0 (overrides tax rate)

# 2. Variable positional arguments (*args -> tuple)
def calculate_average(*numbers: float) -> float:
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

print(calculate_average(10, 20, 30))  # 20.0
scores = [85, 90, 95]
print(calculate_average(*scores))     # 90.0 (unpacking list with *)

# 3. Variable keyword arguments (**kwargs -> dict)
def build_profile(username: str, **attributes) -> dict:
    profile = {"username": username}
    profile.update(attributes)
    return profile

user = build_profile("alex_dev", role="admin", active=True, theme="dark")
print(user)
# {'username': 'alex_dev', 'role': 'admin', 'active': True, 'theme': 'dark'}

# 4. Unpacking dictionary and forwarding arguments
extra_opts = {"retries": 3, "timeout": 15}
def connect(host: str, **opts):
    return f"Connecting to {host} with {opts}"

print(connect("db.internal", **extra_opts))
# Connecting to db.internal with {'retries': 3, 'timeout': 15}

# 5. Multiple return values (unpacked as a tuple)
def get_dimensions() -> tuple[int, int]:
    return 1920, 1080

width, height = get_dimensions()
print(f"Width: {width}, Height: {height}")  # Width: 1920, Height: 1080

# 6. Forwarding arguments through a wrapper function
def log_call(fn, *args, **kwargs):
    return fn(*args, **kwargs)

print(log_call(calculate_total, 200.0, 0.10))  # 220.0


# Interview question 1: Calculate tip amount
def calculate_tip(bill: float, percentage: float = 15.0) -> float:
    if bill < 0:
        raise ValueError("Bill cannot be negative.")
    return round(bill * (percentage / 100), 2)

# Test cases
print(calculate_tip(100.0))        # 15.0
print(calculate_tip(50.0, 20.0))   # 10.0
print(calculate_tip(0.0))          # 0.0
print("Calculate tip passed!")     # Calculate tip passed!


# Interview question 2: Build query URL with *args and **kwargs
def build_query_url(base_url: str, *paths: str, **params: str) -> str:
    url = base_url.rstrip("/")
    if paths:
        url += "/" + "/".join(p.strip("/") for p in paths)
    if params:
        query = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        url += "?" + query
    return url

# Test cases
print(build_query_url("https://api.example.com", "v1", "users", page="1", sort="desc"))
# https://api.example.com/v1/users?page=1&sort=desc
print(build_query_url("https://api.example.com", status="active"))
# https://api.example.com?status=active
print(build_query_url("https://api.example.com/", "health"))
# https://api.example.com/health
print("Build query URL passed!")   # Build query URL passed!

