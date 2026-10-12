todos = ["buy groceries", "pay electric bill", "walk dog"]

# Modifying lists
todos.append("read book")       # Adds to end
completed = todos.pop()         # Removes "read book"
print(f"Finished: {completed}")  # Finished: read book

# Slicing and indexing
numbers = [10, 20, 30, 40, 50]
print(numbers[0])     # 10 (first item)
print(numbers[1:3])   # [20, 30]
print(numbers[:2])    # [10, 20]
print(numbers[-2:])   # [40, 50] (last 2 items)
print(numbers[-1])    # 50 (last item)
print(numbers[::-1])  # [50, 40, 30, 20, 10] (reversed)

# Membership check
if "buy groceries" in todos:
    print("Don't forget the milk!")  # Don't forget the milk!


# Interview question: Given a list of numbers, return a new list with all duplicate values removed while preserving the original order of first appearance.
def deduplicate_preserve_order(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

# Test cases
print(deduplicate_preserve_order([1, 2, 2, 3, 1, 4]))  # [1, 2, 3, 4]
print(deduplicate_preserve_order(["a", "b", "a"]))      # ['a', 'b']
print("Deduplicate passed!")  # Deduplicate passed!

