"""Python Fundamentals - Dictionaries (Hash Maps) and Frequency Counting.

This script demonstrates key-value storage and lookup operations using `dict`:
1. Direct key lookup (`d[k]`), O(1) key membership (`k in d`), and safe `.get()` defaults.
2. Inserting, updating, and deleting (`del`) dictionary entries.
3. Iterating over keys (`.keys()`), values (`.values()`), and pairs (`.items()`).
4. Tallying item frequencies in O(N) time using `.get(key, 0) + 1`.

Run directly:
    python practice/01-python/09-dictionaries.py
"""

# ---------------------------------------------------------------------------
# 1. Dictionary Creation, Lookup & Safe Access
# ---------------------------------------------------------------------------
user = {
    "name": "Sarah Connor",
    "role": "Engineer",
    "level": 3
}

# ① Direct key lookup (raises KeyError if missing) and O(1) key membership check
print(user["name"])        # Sarah Connor
print("role" in user)      # True

# ② Safe lookup with .get() returns a fallback default instead of raising KeyError
location = user.get("location", "Remote")
print(f"Location: {location}")  # Location: Remote


# ---------------------------------------------------------------------------
# 2. Mutating, Iterating & Deleting Entries
# ---------------------------------------------------------------------------
# ① Update an existing key and insert a new key-value pair
user["level"] = 4
user["team"] = "DevOps"

# ② Inspect dictionary views for keys and values
print(list(user.keys()))    # ['name', 'role', 'level', 'team']
print(list(user.values()))  # ['Sarah Connor', 'Engineer', 4, 'DevOps']

# ③ Unpack key-value pairs directly using .items()
for key, value in user.items():
    print(f"{key}: {value}")
# name: Sarah Connor
# role: Engineer
# level: 4
# team: DevOps

# ④ Remove a key-value entry in-place with `del`
del user["level"]
print("level" in user)  # False


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given a list of words, count how many times each word appears and return a
# dictionary of word counts.
def count_word_frequencies(words: list[str]) -> dict[str, int]:
    """Count the occurrences of each word in a list.

    Args:
        words: List of word strings to tally.

    Returns:
        Dictionary mapping each unique word to its total occurrence count.
    """
    # ① Initialize empty frequency map
    counts = {}

    # ② Increment count for each word using .get(word, 0) for unseen words
    for word in words:
        counts[word] = counts.get(word, 0) + 1

    # ③ Return the completed frequency dictionary
    return counts


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
result = count_word_frequencies(words)
print(result)  # {'apple': 3, 'banana': 2, 'orange': 1}
print("Word frequency passed!")  # Word frequency passed!
