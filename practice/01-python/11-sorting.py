"""Python Fundamentals - Sorting Collections, Key Functions, and Comparators.

This script demonstrates Python's Timsort sorting mechanics across data structures:
1. Non-destructive `sorted()` vs in-place `list.sort()`, in ascending and descending order.
2. Sorting immutable tuples, unordered sets, and string characters.
3. Sorting dictionaries by keys or values using `lambda` key functions.
4. Custom multi-criteria key functions (e.g., sorting integers by factor count and tie-breaking).
5. Bridging pairwise comparator functions into key functions with `functools.cmp_to_key`.

Run directly:
    python practice/01-python/11-sorting.py
"""

# ---------------------------------------------------------------------------
# 1. Lists: Non-Destructive sorted() vs In-Place .sort()
# ---------------------------------------------------------------------------
# ① sorted() returns a new sorted list and leaves the original list unchanged
scores = [45, 12, 89, 33, 70]
asc_scores = sorted(scores)
desc_scores = sorted(scores, reverse=True)
print(f"Original list: {scores}")        # Original list: [45, 12, 89, 33, 70]
print(f"Sorted asc: {asc_scores}")       # Sorted asc: [12, 33, 45, 70, 89]
print(f"Sorted desc: {desc_scores}")     # Sorted desc: [89, 70, 45, 33, 12]

# ② .sort() mutates the list in-place and returns None
scores.sort()
print(f"In-place sorted: {scores}")      # In-place sorted: [12, 33, 45, 70, 89]


# ---------------------------------------------------------------------------
# 2. Sorting Tuples, Sets, and Strings
# ---------------------------------------------------------------------------
# ① Tuples: sorted() returns a list, so wrap with tuple() to restore tuple type
coords = (40, 10, 50, 20, 30)
asc_coords = tuple(sorted(coords))
desc_coords = tuple(sorted(coords, reverse=True))
print(f"Tuple asc: {asc_coords}")        # Tuple asc: (10, 20, 30, 40, 50)
print(f"Tuple desc: {desc_coords}")      # Tuple desc: (50, 40, 30, 20, 10)

# ② Sets: sorted() produces an ordered list from an unordered set
unique_tags = {"golang", "python", "rust", "c"}
asc_tags = sorted(unique_tags)
desc_tags = sorted(unique_tags, reverse=True)
print(f"Set sorted asc: {asc_tags}")     # Set sorted asc: ['c', 'golang', 'python', 'rust']
print(f"Set sorted desc: {desc_tags}")   # Set sorted desc: ['rust', 'python', 'golang', 'c']

# ③ Strings: sorted() yields a list of characters; join with "".join()
word = "python"
asc_chars = "".join(sorted(word))
desc_chars = "".join(sorted(word, reverse=True))
print(f"String asc: '{asc_chars}'")      # String asc: 'hnopty'
print(f"String desc: '{desc_chars}'")    # String desc: 'ytponh'


# ---------------------------------------------------------------------------
# 3. Sorting Dictionaries by Keys and Values
# ---------------------------------------------------------------------------
inventory = {"banana": 30, "apple": 10, "orange": 25, "mango": 15}

# ① Sort dictionary items by key (element 0 of each (key, value) tuple)
by_key_asc = dict(sorted(inventory.items()))
by_key_desc = dict(sorted(inventory.items(), reverse=True))
print(f"Dict by keys asc: {by_key_asc}")
# Dict by keys asc: {'apple': 10, 'banana': 30, 'mango': 15, 'orange': 25}
print(f"Dict by keys desc: {by_key_desc}")
# Dict by keys desc: {'orange': 25, 'mango': 15, 'banana': 30, 'apple': 10}

# ② Sort dictionary items by value using a lambda key function (item[1])
by_val_asc = dict(sorted(inventory.items(), key=lambda item: item[1]))
by_val_desc = dict(sorted(inventory.items(), key=lambda item: item[1], reverse=True))
print(f"Dict by values asc: {by_val_asc}")
# Dict by values asc: {'apple': 10, 'mango': 15, 'orange': 25, 'banana': 30}
print(f"Dict by values desc: {by_val_desc}")
# Dict by values desc: {'banana': 30, 'orange': 25, 'mango': 15, 'apple': 10}


# ---------------------------------------------------------------------------
# 4. Custom Key Function: Sorting Numbers by Factor Count
# ---------------------------------------------------------------------------
def count_factors(n: int) -> int:
    """Return the total number of positive divisors/factors of n.

    Args:
        n: Positive integer to inspect.

    Returns:
        Total count of positive divisors of n in O(sqrt(n)) time.
    """
    # ① Initialize divisor counter
    count = 0
    # ② Test divisors up to sqrt(n) and count complementary pairs
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


# ---------------------------------------------------------------------------
# 5. Pairwise Comparators in Python 3: functools.cmp_to_key
# ---------------------------------------------------------------------------
# In Python 2, sorted() had a direct `cmp` parameter: cmp(a, b) -> -1, 0, 1.
# In Python 3, `cmp` was removed in favor of `key` because `key` is called once per element O(N),
# whereas a comparator is called O(N log N) times during pairwise comparisons.
# However, Python 3 provides functools.cmp_to_key() to bridge two-argument comparators into key functions.
from functools import cmp_to_key


# Comparator contract:
# - return negative (e.g. -1) if a < b (a precedes b)
# - return 0 if a == b (equal rank)
# - return positive (e.g. 1) if a > b (a follows b)
def factor_comparator(a: int, b: int) -> int:
    """Compare two numbers by factor count; break ties by numeric value.

    Args:
        a: First integer in pairwise comparison.
        b: Second integer in pairwise comparison.

    Returns:
        -1 if a precedes b, 1 if a follows b, or 0 if equal.
    """
    # ① Compare primary criterion: number of factors
    fa, fb = count_factors(a), count_factors(b)
    if fa != fb:
        return -1 if fa < fb else 1
    # ② Tie-breaker: compare natural numeric value
    if a != b:
        return -1 if a < b else 1
    return 0


numbers_by_cmp = sorted(numbers, key=cmp_to_key(factor_comparator))
print(f"Numbers sorted with comparator: {numbers_by_cmp}")
# Numbers sorted with comparator: [7, 9, 10, 16, 12]


# Pairwise comparator example: Largest Number concatenation (LeetCode 179)
# Why comparators are indispensable:
# When determining whether "9" or "34" comes first in ["3", "30", "34", "5", "9"],
# we compare relative combinations: "9"+"34" ("934") vs "34"+"9" ("349").
# Since "934" > "349", "9" precedes "34".
# This relative pairwise rule cannot be expressed with an isolated scalar key without comparing pairs.
def largest_number_comparator(a: str, b: str) -> int:
    """Order string digits so that their concatenation forms the largest possible number."""
    # ① Compare concatenated orderings a+b vs b+a
    if a + b > b + a:
        return -1  # a should come first
    elif a + b < b + a:
        return 1   # b should come first
    return 0


str_nums = ["3", "30", "34", "5", "9"]
largest_num = "".join(sorted(str_nums, key=cmp_to_key(largest_number_comparator)))
print(f"Largest number arrangement: {largest_num}")
# Largest number arrangement: 9534330


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of positive integers, sort the list in ascending order
# by their number of factors. If two numbers have the same number of factors, sort them by
# their numeric value in ascending order. Also support descending order.
def sort_by_factors(nums: list[int], reverse: bool = False) -> list[int]:
    """Sort numbers by their factor count; ties broken by numeric value.

    Args:
        nums: List of positive integers to sort.
        reverse: If True, sort in descending order instead of ascending.

    Returns:
        New sorted list of integers.
    """
    # ① Return a composite tuple key (factor_count, value) for automatic lexicographical tie-breaking
    return sorted(nums, key=lambda x: (count_factors(x), x), reverse=reverse)


def sort_by_factors_comparator(nums: list[int], reverse: bool = False) -> list[int]:
    """Alternative comparator-based solution using functools.cmp_to_key."""
    return sorted(nums, key=cmp_to_key(factor_comparator), reverse=reverse)


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
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

assert sort_by_factors_comparator(test_list) == asc_sorted
assert sort_by_factors_comparator(test_list, reverse=True) == desc_sorted

print(sort_by_factors([2, 4, 6, 8, 1]))  # [1, 2, 4, 6, 8]
print("Sorting by factors passed!")      # Sorting by factors passed!
