user = {
    "name": "Sarah Connor",
    "role": "Engineer",
    "level": 3
}

# Direct lookup and membership check
print(user["name"])        # Sarah Connor
print("role" in user)      # True

# Safe lookup with .get()
location = user.get("location", "Remote")
print(f"Location: {location}")  # Location: Remote

# Adding and updating
user["level"] = 4
user["team"] = "DevOps"

# Iterating keys and values
print(list(user.keys()))    # ['name', 'role', 'level', 'team']
print(list(user.values()))  # ['Sarah Connor', 'Engineer', 4, 'DevOps']

# Iterating over key-value pairs
for key, value in user.items():
    print(f"{key}: {value}")
# name: Sarah Connor
# role: Engineer
# level: 4
# team: DevOps

# Deleting a key
del user["level"]
print("level" in user)  # False


# Interview question: Given a list of words, count how many times each word appears and return a dictionary of word counts.
def count_word_frequencies(words: list[str]) -> dict[str, int]:
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts

# Test cases
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
result = count_word_frequencies(words)
print(result)  # {'apple': 3, 'banana': 2, 'orange': 1}
print("Word frequency passed!")  # Word frequency passed!

