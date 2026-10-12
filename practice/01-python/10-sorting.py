# 1. Lists: in-place .sort() vs sorted()
scores = [45, 12, 89, 33, 70]
asc_scores = sorted(scores)
desc_scores = sorted(scores, reverse=True)
print(f"Original list: {scores}")        # Original list: [45, 12, 89, 33, 70]
print(f"Sorted asc: {asc_scores}")       # Sorted asc: [12, 33, 45, 70, 89]
print(f"Sorted desc: {desc_scores}")     # Sorted desc: [89, 70, 45, 33, 12]

# In-place list mutation
scores.sort()
print(f"In-place sorted: {scores}")      # In-place sorted: [12, 33, 45, 70, 89]

# 2. Tuples: immutable sequence
coords = (40, 10, 50, 20, 30)
asc_coords = tuple(sorted(coords))
desc_coords = tuple(sorted(coords, reverse=True))
print(f"Tuple asc: {asc_coords}")        # Tuple asc: (10, 20, 30, 40, 50)
print(f"Tuple desc: {desc_coords}")      # Tuple desc: (50, 40, 30, 20, 10)

# 3. Sets: unordered unique collection
unique_tags = {"golang", "python", "rust", "c"}
asc_tags = sorted(unique_tags)
desc_tags = sorted(unique_tags, reverse=True)
print(f"Set sorted asc: {asc_tags}")     # Set sorted asc: ['c', 'golang', 'python', 'rust']
print(f"Set sorted desc: {desc_tags}")   # Set sorted desc: ['rust', 'python', 'golang', 'c']

# 4. Strings: sorting characters
word = "python"
asc_chars = "".join(sorted(word))
desc_chars = "".join(sorted(word, reverse=True))
print(f"String asc: '{asc_chars}'")      # String asc: 'hnopty'
print(f"String desc: '{desc_chars}'")    # String desc: 'ytponh'

# 5. Dictionaries: sorting by keys and values
inventory = {"banana": 30, "apple": 10, "orange": 25, "mango": 15}

# Sort by keys (asc and desc)
by_key_asc = dict(sorted(inventory.items()))
by_key_desc = dict(sorted(inventory.items(), reverse=True))
print(f"Dict by keys asc: {by_key_asc}")
# Dict by keys asc: {'apple': 10, 'banana': 30, 'mango': 15, 'orange': 25}
print(f"Dict by keys desc: {by_key_desc}")
# Dict by keys desc: {'orange': 25, 'mango': 15, 'banana': 30, 'apple': 10}

# Sort by values (asc and desc)
by_val_asc = dict(sorted(inventory.items(), key=lambda item: item[1]))
by_val_desc = dict(sorted(inventory.items(), key=lambda item: item[1], reverse=True))
print(f"Dict by values asc: {by_val_asc}")
# Dict by values asc: {'apple': 10, 'mango': 15, 'orange': 25, 'banana': 30}
print(f"Dict by values desc: {by_val_desc}")
# Dict by values desc: {'banana': 30, 'orange': 25, 'mango': 15, 'apple': 10}

# 6. Custom sorting: Sorting list of numbers by factors count
def count_factors(n: int) -> int:
    """Return the total number of positive divisors/factors of n."""
    count = 0
    for i in range(1, int(n ** 0.5) + 1):
        if n % i == 0:
            count += 1 if i * i == n else 2
    return count

numbers = [12, 7, 9, 10, 16]
# Factor breakdown:
# 12 -> 6 factors (1, 2, 3, 4, 6, 12)
# 7  -> 2 factors (1, 7)
# 9  -> 3 factors (1, 3, 9)
# 10 -> 4 factors (1, 2, 5, 10)
# 16 -> 5 factors (1, 2, 4, 8, 16)

asc_by_factors = sorted(numbers, key=count_factors)
desc_by_factors = sorted(numbers, key=count_factors, reverse=True)
print(f"Numbers sorted by factors (asc): {asc_by_factors}")
# Numbers sorted by factors (asc): [7, 9, 10, 16, 12]
print(f"Numbers sorted by factors (desc): {desc_by_factors}")
# Numbers sorted by factors (desc): [12, 16, 10, 9, 7]


# Interview question: Given a list of positive integers, sort the list in ascending order
# by their number of factors. If two numbers have the same number of factors, sort them by
# their numeric value in ascending order. Also support descending order.
def sort_by_factors(nums: list[int], reverse: bool = False) -> list[int]:
    """Sort numbers by their factor count; ties broken by numeric value."""
    return sorted(nums, key=lambda x: (count_factors(x), x), reverse=reverse)

# Test cases
test_list = [12, 10, 7, 16, 9, 8]
# 7  -> 2 factors
# 9  -> 3 factors
# 8  -> 4 factors
# 10 -> 4 factors (tie broken by 8 < 10)
# 16 -> 5 factors
# 12 -> 6 factors

asc_sorted = sort_by_factors(test_list)
print(asc_sorted)  # [7, 9, 8, 10, 16, 12]

desc_sorted = sort_by_factors(test_list, reverse=True)
print(desc_sorted)  # [12, 16, 10, 8, 9, 7]

print(sort_by_factors([2, 4, 6, 8, 1]))  # [1, 2, 4, 6, 8]
print("Sorting by factors passed!")      # Sorting by factors passed!

