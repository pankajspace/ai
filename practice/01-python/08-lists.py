"""Python Fundamentals - Lists, Indexing, Slicing, and Deduplication.

This script demonstrates core operations on Python's mutable dynamic array (`list`):
1. Mutating lists in-place with `.append()` and `.pop()`.
2. Positive/negative indexing, range slicing (`start:stop`), and reversing (`[::-1]`).
3. Linear O(N) membership checks using `in`.
4. Order-preserving deduplication combining a `list` with a `set` of seen items.

Run directly:
    python practice/01-python/08-lists.py
"""

# ---------------------------------------------------------------------------
# 1. Creating & Modifying Lists In-Place
# ---------------------------------------------------------------------------
todos = ["buy groceries", "pay electric bill", "walk dog"]

# ① Append an item to the end of the list in O(1) amortized time
todos.append("read book")       # Adds to end
# ② Remove and return the last item in O(1) time
completed = todos.pop()         # Removes "read book"
print(f"Finished: {completed}")  # Finished: read book


# ---------------------------------------------------------------------------
# 2. Indexing & Slicing
# ---------------------------------------------------------------------------
# Slice syntax: list[start:stop:step] where start is inclusive and stop is exclusive
numbers = [10, 20, 30, 40, 50]
print(numbers[0])     # 10 (first item)
print(numbers[1:3])   # [20, 30]
print(numbers[:2])    # [10, 20]
print(numbers[-2:])   # [40, 50] (last 2 items)
print(numbers[-1])    # 50 (last item)
print(numbers[::-1])  # [50, 40, 30, 20, 10] (reversed)


# ---------------------------------------------------------------------------
# 3. Membership Check
# ---------------------------------------------------------------------------
# Check whether a target value exists in the list (O(N) linear scan)
if "buy groceries" in todos:
    print("Don't forget the milk!")  # Don't forget the milk!


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of numbers, return a new list with all duplicate values removed
# while preserving the original order of first appearance.
def deduplicate_preserve_order(items: list) -> list:
    """Remove duplicate elements from a list while keeping first-appearance order.

    Args:
        items: Sequence of hashable elements (potentially containing duplicates).

    Returns:
        New list containing only the first occurrence of each unique element.
    """
    # ① Track seen elements in a set for O(1) membership lookups
    seen = set()
    result = []

    # ② Iterate through items in their original order
    for item in items:
        # ③ Append only when encountering an element for the first time
        if item not in seen:
            seen.add(item)
            result.append(item)

    # ④ Return the deduplicated list
    return result


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
print(deduplicate_preserve_order([1, 2, 2, 3, 1, 4]))  # [1, 2, 3, 4]
print(deduplicate_preserve_order(["a", "b", "a"]))      # ['a', 'b']
print("Deduplicate passed!")  # Deduplicate passed!
