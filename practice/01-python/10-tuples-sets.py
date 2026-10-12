# Tuples for fixed records and unpacking
user_coordinate = (37.7749, -122.4194)
lat, lon = user_coordinate
print(f"Latitude: {lat}, Longitude: {lon}")  # Latitude: 37.7749, Longitude: -122.4194

# Swapping two variables with tuple packing
a = 5
b = 10
a, b = b, a
print(a, b)  # 10 5

# Sets for unique elements
raw_roles = ["admin", "editor", "admin", "viewer", "editor"]
unique_roles = set(raw_roles)
print(unique_roles)  # {'admin', 'editor', 'viewer'}

# Adding to a set
unique_roles.add("manager")
print("manager" in unique_roles)  # True

# Fast membership check
if "admin" in unique_roles:
    print("Admin role found!")  # Admin role found!

# Set operations: union and intersection
dev_team = {"alice", "bob", "charlie"}
ops_team = {"bob", "david"}
print(dev_team & ops_team)  # {'bob'}
print(dev_team | ops_team)  # {'alice', 'bob', 'charlie', 'david'}


# Interview question: Given two lists of user IDs, return a list of all user IDs that appear in both lists.
def find_common_users(group_a: list[str], group_b: list[str]) -> list[str]:
    return list(set(group_a) & set(group_b))

# Test cases
users_1 = ["alice", "bob", "charlie"]
users_2 = ["bob", "david", "alice"]
common = find_common_users(users_1, users_2)
print(sorted(common))  # ['alice', 'bob']
print("Common users passed!")  # Common users passed!

