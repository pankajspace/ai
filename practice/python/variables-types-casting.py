# Variables
user_name = "Pankaj"
user_age = 30
user_height = 5.10
user_active = True
user_session = None
print(
    f"\nUser details are as follows: \nName: {user_name}, Age: {user_age}, Height: {user_height}\n"
)

# Types
print()
print(f"user_name: {type(user_name)}")  # user_name: <class 'str'>
print(f"user_age: {type(user_age)}")  # user_age: <class 'int'>
print(f"user_height: {type(user_height)}")  # user_height: <class 'float'>
print(f"user_active {user_active}")  # user_active: <class 'bool'>
print(f"user_session: {user_session}")  # user_session: <class 'NoneType'>
print()

# Type Conversion
print()
print(str(user_age), type(str(user_age)))
print(int(user_height), type(int(user_height)))
print(float(user_age), type(float(user_age)))
print(bool(user_session), type(bool(user_session)))
print()

# Question
# Given a mixed list of values containing numbers, numeric strings, and non-numeric strings, compute the sum of all valid integers.


# Solution
def sum_valid_integers(items: list) -> int:
    total = 0
    for item in items:
        try:
            # raise
            total += int(item)
        except (ValueError, TypeError):
            continue
    return total


# Test case 1
assert sum_valid_integers([10, "20", "abc", 5, None, "30"]) == 65
print("sum_valid_integers:", sum_valid_integers([10, "20", "abc", 5, None, "30"]))
# Test case 2
assert sum_valid_integers(["1", "2", "3"]) == 6
print("sum_valid_integers:", sum_valid_integers(["1", "2", "3"]))
