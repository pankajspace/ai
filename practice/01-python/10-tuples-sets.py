"""Python Fundamentals - Tuples and Sets.

This script demonstrates fixed-record tuples and unique-element sets:
1. Immutable `tuple` records, positional unpacking, and in-place variable swapping.
2. Deduplicating collections and performing O(1) membership lookups with `set`.
3. Algebraic set operations: intersection (`&`) and union (`|`).

Run directly:
    python practice/01-python/10-tuples-sets.py
"""

# ---------------------------------------------------------------------------
# 1. Tuples for Fixed Records & Variable Swapping
# ---------------------------------------------------------------------------
# ① Represent a fixed coordinate pair and unpack into named variables
user_coordinate = (37.7749, -122.4194)
lat, lon = user_coordinate
print(f"Latitude: {lat}, Longitude: {lon}")  # Latitude: 37.7749, Longitude: -122.4194

# ② Swap two variables without a temporary variable via tuple packing/unpacking
a = 5
b = 10
a, b = b, a
print(a, b)  # 10 5


# ---------------------------------------------------------------------------
# 2. Sets for Unique Elements & Fast Membership
# ---------------------------------------------------------------------------
# ① Convert a list with duplicates into a set of unique values
raw_roles = ["admin", "editor", "admin", "viewer", "editor"]
unique_roles = set(raw_roles)
print(unique_roles)  # {'admin', 'editor', 'viewer'}

# ② Add a new element to the set (duplicates are ignored automatically)
unique_roles.add("manager")
print("manager" in unique_roles)  # True

# ③ O(1) average-case hash table membership check
if "admin" in unique_roles:
    print("Admin role found!")  # Admin role found!


# ---------------------------------------------------------------------------
# 3. Set Operations: Intersection (&) and Union (|)
# ---------------------------------------------------------------------------
dev_team = {"alice", "bob", "charlie"}
ops_team = {"bob", "david"}
# ① Intersection (&): elements present in BOTH sets
print(dev_team & ops_team)  # {'bob'}
# ② Union (|): elements present in EITHER set
print(dev_team | ops_team)  # {'alice', 'bob', 'charlie', 'david'}


# ---------------------------------------------------------------------------
# Interview Question / Problem
# ---------------------------------------------------------------------------
# Given two lists of user IDs, return a list of all user IDs that appear in both lists.
def find_common_users(group_a: list[str], group_b: list[str]) -> list[str]:
    """Find all user IDs present in both input lists using set intersection.

    Args:
        group_a: First list of user ID strings.
        group_b: Second list of user ID strings.

    Returns:
        List of unique user IDs shared between group_a and group_b.
    """
    # ① Convert both lists to sets, compute their intersection (&), and convert back to list
    return list(set(group_a) & set(group_b))


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
users_1 = ["alice", "bob", "charlie"]
users_2 = ["bob", "david", "alice"]
common = find_common_users(users_1, users_2)
print(sorted(common))  # ['alice', 'bob']
print("Common users passed!")  # Common users passed!
