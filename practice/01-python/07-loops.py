"""Python Fundamentals - Loops, Iteration Helpers, and Control Flow.

This script demonstrates idiomatic iteration patterns in Python:
1. Direct sequence iteration (`for item in items`) and indexed iteration (`enumerate`).
2. Numeric sequences and O(1) range membership checks using `range(start, stop, step)`.
3. Parallel sequence iteration using `zip()`.
4. Loop flow control with `continue` (skip iteration) and `break` (exit early).
5. Condition-driven `while` loops.

Run directly:
    python practice/01-python/07-loops.py
"""

# ---------------------------------------------------------------------------
# 1. Direct & Indexed Iteration (enumerate)
# ---------------------------------------------------------------------------
fruits = ["apple", "banana", "orange"]

# ① Direct iteration over list elements
for fruit in fruits:
    print(fruit)
# apple
# banana
# orange

# ② Iteration with 1-based index using enumerate()
for rank, fruit in enumerate(fruits, start=1):
    print(f"{rank}. {fruit}")
# 1. apple
# 2. banana
# 3. orange


# ---------------------------------------------------------------------------
# 2. Numeric Sequences with range()
# ---------------------------------------------------------------------------
# ① Single argument: range(stop) generates [0, stop)
for i in range(3):
    print(f"Step {i}")
# Step 0
# Step 1
# Step 2

# ② Two arguments: range(start, stop) generates [start, stop)
for i in range(2, 6):
    print(f"Offset {i}")
# Offset 2
# Offset 3
# Offset 4
# Offset 5

# ③ Three arguments: range(start, stop, step) with custom stride
evens = list(range(0, 10, 2))
print(f"Evens: {evens}")  # Evens: [0, 2, 4, 6, 8]

# ④ Counting backwards using a negative step
countdown = list(range(3, 0, -1))
print(f"Countdown: {countdown}")  # Countdown: [3, 2, 1]

# ⑤ O(1) mathematical membership check on a range object
print(50 in range(0, 100, 5))  # True (instant arithmetic check)


# ---------------------------------------------------------------------------
# 3. Parallel Iteration with zip()
# ---------------------------------------------------------------------------
# Pair corresponding elements from multiple iterables together
prices = [1.20, 0.50, 0.80]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: ${price:.2f}")
# apple: $1.20
# banana: $0.50
# orange: $0.80


# ---------------------------------------------------------------------------
# 4. Loop Control Statements (break & continue) and while Loops
# ---------------------------------------------------------------------------
# ① Use `continue` to skip a single iteration and `break` to terminate the loop early
for n in [1, 2, 3, 4, 5]:
    if n == 2:
        continue  # Skip 2
    if n == 4:
        break     # Stop loop
    print(f"Number: {n}")
# Number: 1
# Number: 3

# ② While loop repeats as long as the condition remains truthy
count = 3
while count > 0:
    print(f"Countdown: {count}")  # Countdown: 3, 2, 1
    count -= 1
# Countdown: 3
# Countdown: 2
# Countdown: 1


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of numbers, find the index of the first negative number,
# or return -1 if none exists.
def find_first_negative(numbers: list[int]) -> int:
    """Return the 0-based index of the first negative integer in a list, or -1 if absent.

    Args:
        numbers: List of integers to inspect.

    Returns:
        Index of the first negative element, or -1 if all elements are non-negative.
    """
    # ① Iterate with both index and value using enumerate()
    for idx, num in enumerate(numbers):
        # ② Return immediately upon encountering the first negative value
        if num < 0:
            return idx
    # ③ Fallback when no negative number is found
    return -1


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
print(find_first_negative([3, 5, -2, 8]))  # 2
print(find_first_negative([1, 2, 3]))       # -1
print(find_first_negative([-10, 0, 10]))   # 0
print("Find first negative passed!")       # Find first negative passed!
