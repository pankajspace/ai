fruits = ["apple", "banana", "orange"]

# Direct iteration
for fruit in fruits:
    print(fruit)
# apple
# banana
# orange

# Iteration with index
for rank, fruit in enumerate(fruits, start=1):
    print(f"{rank}. {fruit}")
# 1. apple
# 2. banana
# 3. orange

# range() forms:
# 1. Single argument: stop [0, 5)
for i in range(3):
    print(f"Step {i}")
# Step 0
# Step 1
# Step 2

# 2. Two arguments: start and stop [2, 6)
for i in range(2, 6):
    print(f"Offset {i}")
# Offset 2
# Offset 3
# Offset 4
# Offset 5

# 3. Three arguments: start, stop, step
evens = list(range(0, 10, 2))
print(f"Evens: {evens}")  # Evens: [0, 2, 4, 6, 8]

# 4. Counting backwards with negative step
countdown = list(range(3, 0, -1))
print(f"Countdown: {countdown}")  # Countdown: [3, 2, 1]

# 5. O(1) membership check
print(50 in range(0, 100, 5))  # True (instant arithmetic check)

# Parallel iteration with zip
prices = [1.20, 0.50, 0.80]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: ${price:.2f}")
# apple: $1.20
# banana: $0.50
# orange: $0.80

# Loop control: break and continue
for n in [1, 2, 3, 4, 5]:
    if n == 2:
        continue  # Skip 2
    if n == 4:
        break     # Stop loop
    print(f"Number: {n}")
# Number: 1
# Number: 3

# While loop for conditions
count = 3
while count > 0:
    print(f"Countdown: {count}")
    count -= 1
# Countdown: 3
# Countdown: 2
# Countdown: 1


# Interview question: Given a list of numbers, find the index of the first negative number, or return -1 if none exists.
def find_first_negative(numbers: list[int]) -> int:
    for idx, num in enumerate(numbers):
        if num < 0:
            return idx
    return -1

# Test cases
print(find_first_negative([3, 5, -2, 8]))  # 2
print(find_first_negative([1, 2, 3]))       # -1
print(find_first_negative([-10, 0, 10]))   # 0
print("Find first negative passed!")

