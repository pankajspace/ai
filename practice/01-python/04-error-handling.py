def get_age(age: str) -> int | None:
    try:
        return int(age)
    except ValueError as e:
        # raise RuntimeError("Cant covert age to int")
        # raise e
        print("Cant covert age to int")

print(f"get_age: {get_age("40")}")
print(f"get_age: {get_age("fourty")}")


def get_retries(data: dict) -> int | None:
    try:
        return data["retries"]
    except KeyError:
        # defaults to 3 retries if not provided in data
        return 3

print(f"get_retries: {get_retries({'retries': 5})}")
print(f"get_retries: {get_retries({})}")


def safe_divide(a:int, b:int) -> float | None:
    try:
        return a / b
    except ZeroDivisionError as e:
        print("Cannot divide by zero")

print(f"safe_divide: {safe_divide(4, 2)}")
print(f"safe_divide: {safe_divide(2, 4)}")
print(f"safe_divide: {safe_divide(2, 0)}")
