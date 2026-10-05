<!--
Source: python-my-course.html
Title: Python My Course | TechToday
Description: Fast-track Python essentials for everyday programming — variables, strings, lists, dictionaries, tuples, sets, loops, comprehensions, functions, and error handling.
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="python-my-course"></a>

# Python My Course

The high-yield Python course reference: common everyday syntax, core collections, functions, and practical problem solutions.

<a id="table-of-contents"></a>

## Table of Contents

1. [Variables, Types & Casting](#1-variables-types-and-casting)
2. [Everyday String Operations](#2-everyday-string-operations)
3. [Operators, Truthiness & Conditionals](#3-operators-truthiness-and-conditionals)
4. [Loops & Iteration](#4-loops-and-iteration)
5. [Lists & Slicing](#5-lists-and-slicing)
6. [Dictionaries](#6-dictionaries)
7. [Tuples & Sets](#7-tuples-and-sets)
8. [List Comprehensions](#8-list-comprehensions)
9. [Functions & Arguments](#9-functions-and-arguments)
10. [Everyday Error Handling](#10-everyday-error-handling)

---

<a id="unit-1"></a>

## Unit 1 — Daily Syntax & Logic

The daily syntax: declaring variables, converting types, manipulating text, evaluating conditions, and writing basic loops.

<a id="1-variables-types-and-casting"></a>

## 1. Variables, Types & Casting

- **Core Primitives** `str, int, float, bool, None` <!-- great -->
- **Type Conversion** `Explicit casting functions` <!-- great -->
- **Type Checking** `isinstance(val, type)` <!-- good -->

In Python, variables are names that point to values in memory. You don't specify variable types when declaring them; Python figures out the type automatically at runtime. Converting between types is done explicitly with functions like `str()`, `int()`, `float()`, and `bool()`.

> **Analogy** 🎬
>
> **Picture it — Sticky Notes on Jars**
>
> A variable is simply a sticky note label you slap onto a jar. If you write `count = 5`, the label `count` is stuck to a jar holding the number 5. You can move that label to another jar anytime (`count = "five"`).

Key everyday functions:
1. `type(x)`: Returns the type of variable `x`
2. `isinstance(x, int)`: Returns `True` if `x` is an integer (preferred over `type(x) == int`)
3. `int("42")`: Converts string to integer (throws `ValueError` if text is not numeric)
4. `float("3.14")`: Converts string to floating-point number
5. `str(100)`: Converts any value into its string representation
6. `bool(x)`: Converts value to `True` or `False`

```python
# Everyday variable assignment
user_name = "Alex"
user_age = 28
user_score = 94.5
is_active = True
session_token = None

# Type conversion
input_str = "150"
total = int(input_str) + 50
print(total)  # 200

# Recommended type checking
if isinstance(total, int):
    print("total is an integer")
```

- **Strength — Fast Prototyping** Dynamic typing lets you assign and manipulate values without repetitive type declarations.
- **Weakness — Runtime Type Mismatches** Adding incompatible types like `"Score: " + 10` raises a `TypeError` at runtime instead of converting automatically.

**Interview question**

*Given a mixed list of values containing numbers, numeric strings, and non-numeric strings, compute the sum of all valid integers.*

Iterate over the list, try converting each value to an integer using `int()`, and add valid integers to a running total while ignoring invalid inputs.

**Answer — Sum Valid Integers**

```python
def sum_valid_integers(items: list) -> int:
    total = 0
    for item in items:
        try:
            total += int(item)
        except (ValueError, TypeError):
            continue
    return total

# Test cases
assert sum_valid_integers([10, "20", "abc", 5, None, "30"]) == 65
assert sum_valid_integers(["1", "2", "3"]) == 6
print("Sum valid integers passed!")
```

> **Key idea**
>
> To check an object's type, always use `isinstance(obj, ExpectedType)` rather than comparing `type(obj) == ExpectedType`.

---

<a id="2-everyday-string-operations"></a>

## 2. Everyday String Operations

- **Formatting** `f"{variable}" interpolation` <!-- great -->
- **Whitespace Trim** `.strip(), .lstrip(), .rstrip()` <!-- great -->
- **Search & Replace** `.replace(), in keyword` <!-- good -->

Strings are one of the most commonly used data types in Python. Python strings are immutable (they cannot be changed in place; operations return a new string). Formatted string literals (f-strings) are the modern, standard way to embed variables and expressions inside text.

> **Analogy** 🎬
>
> **Picture it — A Template Letter with Fill-in Blanks**
>
> An f-string `f"Hello {name}, your total is ${price:.2f}"` is like a printed letter with blank brackets. Python reads the variables, formats them directly into the blanks, and produces the final letter in a single pass.

Most commonly used string methods:
1. `f"{name}"`: Embeds variable or expression inside text
2. `f"{price:.2f}"`: Formats float with 2 decimal places
3. `s.strip()`: Trims leading and trailing spaces or newlines
4. `s.split(",")`: Splits a string by delimiter into a list of strings
5. `", ".join(list_of_strings)`: Joins a list of strings into one string
6. `s.lower()` and `s.upper()`: Changes text casing
7. `s.replace(old, new)`: Replaces occurrences of a substring
8. `s.startswith(prefix)` and `s.endswith(suffix)`: Checks prefix or suffix

```python
# Modern f-strings
product = "Coffee Mug"
price = 12.994
print(f"Item: {product} | Cost: ${price:.2f}")  # Item: Coffee Mug | Cost: $12.99

# Cleaning user inputs
raw_email = "   Alex@Company.COM \n"
clean_email = raw_email.strip().lower()
print(clean_email)  # alex@company.com

# Splitting and joining
csv_row = "laptop,electronics,999"
parts = csv_row.split(",")
print(parts)  # ['laptop', 'electronics', '999']

joined = " -> ".join(parts)
print(joined)  # laptop -> electronics -> 999
```

- **Strength — Clean F-strings** F-strings can evaluate expressions inline (like `f"{total * 1.08:.2f}"`) cleanly and quickly.
- **Weakness — Passing None to String Methods** Calling `.strip()` or `.lower()` on a variable that happens to be `None` throws an `AttributeError`.

**Interview question**

*Write a function that normalizes a full name by removing extra spaces and capitalizing each word.*

Use `s.split()` to automatically split words by any amount of consecutive whitespace, title-case each word with `.capitalize()`, and re-join with a single space.

**Answer — Normalize Name**

```python
def normalize_name(raw_name: str) -> str:
    words = raw_name.split()
    return " ".join(word.capitalize() for word in words)

# Test cases
assert normalize_name("   john   DOE  ") == "John Doe"
assert normalize_name("alice") == "Alice"
assert normalize_name("  ") == ""
print("Normalize name passed!")
```

> **Key idea**
>
> When splitting on whitespace, use `s.split()` without arguments. It automatically strips outer spaces and collapses multiple spaces between words.

---

<a id="3-operators-truthiness-and-conditionals"></a>

## 3. Operators, Truthiness & Conditionals

- **Division** `/ returns float, // returns int floor` <!-- great -->
- **Truthiness** `Empty collections and 0 are False` <!-- great -->
- **Ternary** `val if condition else alt` <!-- good -->

Python uses standard comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) and logical operators (`and`, `or`, `not`). Every object in Python has a boolean value: empty lists, empty dictionaries, empty strings, `0`, and `None` evaluate to `False`; populated collections and non-zero numbers evaluate to `True`.

> **Analogy** 🎬
>
> **Picture it — An Empty Box vs A Packed Box**
>
> When Python asks `if items:`, it simply checks if the box has anything inside it. If the box is empty (`[]`, `""`, `{}`), Python sees it as empty (`False`). If there is even one item inside, it sees it as populated (`True`).

Common patterns:
1. Checking emptiness: `if not items:` (clean and Pythonic, no need for `len(items) == 0`)
2. Checking None: `if user is None:` (always use `is None`, not `== None`)
3. Inline ternary expression: `status = "Approved" if score >= 70 else "Rejected"`
4. Floor division vs true division: `7 / 2 == 3.5`, while `7 // 2 == 3`
5. Modulo (remainder): `10 % 3 == 1` (frequently used to check even/odd with `n % 2 == 0`)

```python
# Truthiness in if statements
cart = []
if not cart:
    print("Your cart is empty.")

# Checking None safely
current_user = None
if current_user is None:
    print("Please log in.")

# Ternary expression
score = 82
result = "Pass" if score >= 60 else "Fail"
print(result)  # Pass

# Checking membership
admin_users = ["alice", "bob"]
if "alice" in admin_users:
    print("Access granted.")
```

- **Strength — Idiomatic Emptiness Checks** `if items:` and `if not items:` work identically across strings, lists, tuples, and dictionaries.
- **Weakness — Default with or Trap** Using `x = val or 10` will override `0` because `0` is falsy (`0 or 10` returns `10`).

**Interview question**

*Given an integer, return "Fizz" if it's divisible by 3, "Buzz" if divisible by 5, "FizzBuzz" if divisible by both, or the number as a string otherwise.*

Check divisibility by both 3 and 5 first (using `% 15 == 0`), then check 3 and 5 individually.

**Answer — FizzBuzz**

```python
def fizz_buzz(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)

# Test cases
assert fizz_buzz(15) == "FizzBuzz"
assert fizz_buzz(9) == "Fizz"
assert fizz_buzz(10) == "Buzz"
assert fizz_buzz(7) == "7"
print("FizzBuzz passed!")
```

> **Key idea**
>
> If a value can legitimately be `0` or `False`, do not use `val = input_val or default`. Use `val = input_val if input_val is not None else default`.

---

<a id="4-loops-and-iteration"></a>

## 4. Loops & Iteration

- **Counting Loop** `for i in range(n):` <!-- great -->
- **Index & Item** `for idx, item in enumerate(seq):` <!-- great -->
- **Loop Control** `break (stop), continue (skip)` <!-- good -->

Python loops iterate directly over items in a collection, rather than keeping track of an incrementing index variable. When you need the index alongside the item, `enumerate()` gives you both cleanly.

> **Analogy** 🎬
>
> **Picture it — A Name Call at a Meeting**
>
> In older languages, running a loop is like saying: "Look at seat 0, who is there? Now look at seat 1, who is there?" In Python, the loop is like reading down the attendee roster directly: "Alice, Bob, Charlie."

Key iteration patterns:
1. `for item in items:`: Standard collection loop
2. `for i in range(5):`: Loops 5 times (producing numbers 0, 1, 2, 3, 4)
3. `for i in range(1, 10, 2):`: Loops from 1 up to 10 in steps of 2 (1, 3, 5, 7, 9)
4. `for idx, val in enumerate(items, start=1):`: Yields index and item together
5. `for a, b in zip(list_a, list_b):`: Iterates through two lists side by side
6. `break`: Immediately exits the loop
7. `continue`: Skips the remainder of the current iteration and jumps to the next

```python
fruits = ["apple", "banana", "orange"]

# Direct iteration
for fruit in fruits:
    print(fruit)

# Iteration with index
for rank, fruit in enumerate(fruits, start=1):
    print(f"{rank}. {fruit}")
# 1. apple
# 2. banana
# 3. orange

# Parallel iteration with zip
prices = [1.20, 0.50, 0.80]
for fruit, price in zip(fruits, prices):
    print(f"{fruit}: ${price:.2f}")

# While loop for conditions
count = 3
while count > 0:
    print(f"Countdown: {count}")
    count -= 1
```

- **Strength — Clean Syntax** Direct iteration prevents off-by-one errors and out-of-bounds indexing bugs.
- **Weakness — Modifying While Looping** Removing items from a list while iterating over it will cause the loop to skip subsequent elements.

**Interview question**

*Given a list of numbers, find the index of the first negative number, or return -1 if none exists.*

Use `enumerate()` to inspect both index and number, and `return idx` as soon as a negative value is encountered. If the loop finishes without returning, return `-1`.

**Answer — Find First Negative Index**

```python
def find_first_negative(numbers: list[int]) -> int:
    for idx, num in enumerate(numbers):
        if num < 0:
            return idx
    return -1

# Test cases
assert find_first_negative([3, 5, -2, 8]) == 2
assert find_first_negative([1, 2, 3]) == -1
assert find_first_negative([-10, 0, 10]) == 0
print("Find first negative passed!")
```

> **Key idea**
>
> Avoid writing `for i in range(len(items)): items[i]`. Instead, use `for item in items:` or `for i, item in enumerate(items):`.

---

<a id="unit-2"></a>

## Unit 2 — Core Data Collections

The primary data structures used every day: ordered lists, fast key-value dictionaries, unique sets, and readable list comprehensions.

<a id="5-lists-and-slicing"></a>

## 5. Lists & Slicing

- **Index Lookup** `O(1) instant access` <!-- great -->
- **Append** `list.append(item) adds to end` <!-- great -->
- **Slicing** `seq[start:stop:step]` <!-- good -->

A `list` is Python's standard ordered, mutable array. You can store any types of items in a list. You can access items by index (starting at `0` for the first item, or `-1` for the last item). Slicing allows you to extract sub-portions of a list.

> **Analogy** 🎬
>
> **Picture it — A Train of Storage Wagons**
>
> A list is a row of numbered wagons hooked together. Wagon `0` is the front, wagon `-1` is the caboose. Hooking an extra wagon to the end (`append()`) is quick and easy.

Common list operations:
1. `items[0]`: First item
2. `items[-1]`: Last item
3. `items[1:4]`: Slices elements from index 1 up to (excluding) index 4
4. `items[:3]`: First 3 elements
5. `items[-2:]`: Last 2 elements
6. `items[::-1]`: Returns a reversed copy of the list
7. `items.append(x)`: Adds item `x` to the end
8. `items.pop()`: Removes and returns the last item
9. `item in items`: Checks if item exists in list

```python
todos = ["buy groceries", "pay electric bill", "walk dog"]

# Modifying lists
todos.append("read book")       # Adds to end
completed = todos.pop()         # Removes "read book"
print(f"Finished: {completed}")

# Slicing
numbers = [10, 20, 30, 40, 50]
print(numbers[1:3])   # [20, 30]
print(numbers[:2])    # [10, 20]
print(numbers[-1])    # 50 (last item)
print(numbers[::-1])  # [50, 40, 30, 20, 10] (reversed)

# Membership check
if "buy groceries" in todos:
    print("Don't forget the milk!")
```

- **Strength — Flexible & General Purpose** Lists can grow, shrink, and hold mixed data types effortlessly.
- **Weakness — Linear Search Speed** Checking `item in my_list` scans elements one by one; if you have thousands of items, use a `set` for instant lookups.

**Interview question**

*Given a list of numbers, return a new list with all duplicate values removed while preserving the original order of first appearance.*

Keep a `seen` set to track items already added, and build a new list appending items only when they haven't been seen yet.

**Answer — Deduplicate While Preserving Order**

```python
def deduplicate_preserve_order(items: list) -> list:
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

# Test cases
assert deduplicate_preserve_order([1, 2, 2, 3, 1, 4]) == [1, 2, 3, 4]
assert deduplicate_preserve_order(["a", "b", "a"]) == ["a", "b"]
print("Deduplicate passed!")
```

> **Key idea**
>
> Slicing a list (`lst[:]`) creates a new shallow copy. Mutating the copy will not affect the original list.

---

<a id="6-dictionaries"></a>

## 6. Dictionaries

- **Key Lookup** `Instant O(1) hash access` <!-- great -->
- **Safe Retrieval** `d.get(key, default)` <!-- great -->
- **Iteration** `for k, v in d.items():` <!-- good -->

A `dict` (dictionary) stores data in key-value pairs. Looking up a value by its key is instant ($O(1)$) regardless of whether the dictionary has 10 items or 1,000,000 items. Keys must be unique and immutable (like strings, numbers, or tuples).

> **Analogy** 🎬
>
> **Picture it — A Contact Book on Your Phone**
>
> Instead of flipping through everyone's phone numbers in order, you type "Sarah" and her contact details appear immediately. The contact name is the key; the phone number and address are the values.

Common dictionary operations:
1. `d[key]`: Gets value (raises `KeyError` if key does not exist)
2. `d.get(key, default)`: Safely gets value, returning `default` (or `None`) if key is missing
3. `d[key] = value`: Adds or updates a key-value pair
4. `k in d`: Checks if a key exists in the dictionary
5. `d.items()`: Iterates over `(key, value)` pairs
6. `d.keys()` and `d.values()`: Iterates over keys or values
7. `del d[key]`: Removes key from dictionary

```python
user = {
    "name": "Sarah Connor",
    "role": "Engineer",
    "level": 3
}

# Safe lookup with .get()
location = user.get("location", "Remote")
print(f"Location: {location}")  # Remote

# Adding and updating
user["level"] = 4
user["team"] = "DevOps"

# Iterating over key-value pairs
for key, value in user.items():
    print(f"{key}: {value}")
```

- **Strength — Instant Key Lookups** Dictionaries are the fastest and most natural way to structure associated data and configuration mappings.
- **Weakness — Direct Bracket KeyError** Accessing `user["missing_key"]` directly crashes with a `KeyError`; use `user.get("missing_key")` when a key might be absent.

**Interview question**

*Given a list of words, count how many times each word appears and return a dictionary of word counts.*

Iterate over the words and update a frequency count dictionary using `.get(word, 0) + 1`.

**Answer — Word Frequency Counter**

```python
def count_word_frequencies(words: list[str]) -> dict[str, int]:
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts

# Test cases
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
result = count_word_frequencies(words)
assert result == {"apple": 3, "banana": 2, "orange": 1}
print("Word frequency passed!")
```

> **Key idea**
>
> Always use `d.get(key, fallback)` when reading optional fields or external data (like JSON APIs) to avoid unexpected `KeyError` crashes.

---

<a id="7-tuples-and-sets"></a>

## 7. Tuples & Sets

- **Tuples** `Immutable fixed records: (x, y)` <!-- great -->
- **Sets** `Unique values with fast in checks` <!-- great -->
- **Set Operations** `Union |, Intersection &` <!-- good -->

A `tuple` is an ordered, immutable sequence written with parentheses `(1, 2)`. Once created, you cannot add, remove, or modify items in a tuple. A `set` is an unordered collection of unique elements written with curly braces `{1, 2}`. Sets automatically eliminate duplicates and offer instant $O(1)$ membership checks.

> **Analogy** 🎬
>
> **Picture it — A GPS Coordinate vs A Unique Badge Scanner**
>
> A GPS location `(latitude, longitude)` is a tuple: latitude and longitude are permanently paired together; changing one without the other makes no sense. A security gate scanner is a set: it holds a list of authorized employee badge IDs; duplicate scans are ignored, and checking if an ID is valid takes a fraction of a second.

Key operations:
1. `point = (10, 20)`: Creates a tuple
2. `x, y = point`: Unpacks tuple into variables
3. `unique = set([1, 2, 2, 3, 3])`: Converts list to set `{1, 2, 3}`
4. `s.add("item")`: Adds item to set
5. `val in s`: Instant $O(1)$ check if `val` is in set
6. `set_a & set_b`: Intersection (items present in both)
7. `set_a | set_b`: Union (all items from either set)

```python
# Tuples for fixed records and unpacking
user_coordinate = (37.7749, -122.4194)
lat, lon = user_coordinate
print(f"Latitude: {lat}, Longitude: {lon}")

# Swapping two variables with tuple packing
a = 5
b = 10
a, b = b, a
print(a, b)  # 10 5

# Sets for unique elements
raw_roles = ["admin", "editor", "admin", "viewer", "editor"]
unique_roles = set(raw_roles)
print(unique_roles)  # {'admin', 'editor', 'viewer'}

# Fast membership check
if "admin" in unique_roles:
    print("Admin role found!")
```

- **Strength — Automatic Deduplication & Speed** Converting a list to a set strips duplicates instantly, and `val in set` is much faster than `val in list`.
- **Weakness — Unordered Sets** Sets do not preserve order; if you need both order and uniqueness, use a list alongside a set.

**Interview question**

*Given two lists of user IDs, return a list of all user IDs that appear in both lists.*

Convert both lists to sets and take their intersection using the `&` operator.

**Answer — Find Common Users**

```python
def find_common_users(group_a: list[str], group_b: list[str]) -> list[str]:
    return list(set(group_a) & set(group_b))

# Test cases
users_1 = ["alice", "bob", "charlie"]
users_2 = ["bob", "david", "alice"]
common = find_common_users(users_1, users_2)
assert set(common) == {"alice", "bob"}
print("Common users passed!")
```

> **Key idea**
>
> Writing `x = {}` creates an empty dictionary, not an empty set. To create an empty set, you must write `x = set()`.

---

<a id="8-list-comprehensions"></a>

## 8. List Comprehensions

- **Syntax** `[expression for item in iterable]` <!-- great -->
- **With Filter** `[expr for item in iterable if condition]` <!-- great -->
- **Readability** `Replaces 4 lines of loop with 1 line` <!-- good -->

A list comprehension provides a concise, readable way to create a new list by transforming or filtering elements from an existing collection. It replaces verbose multi-line `for` loops that append items one by one.

> **Analogy** 🎬
>
> **Picture it — A Filtering Sieve on a Production Line**
>
> A standard `for` loop is like an inspector inspecting each widget, deciding if it meets standards, and walking it over to place it into a bin. A list comprehension is a conveyor belt with a built-in filter: pieces that pass the filter drop directly into the box in one smooth motion.

Common patterns:
1. Basic transformation: `[x * 2 for x in numbers]`
2. Transformation with condition: `[x for x in numbers if x > 0]`
3. Cleaning strings: `[word.strip() for word in words]`
4. Inline ternary: `["Even" if x % 2 == 0 else "Odd" for x in numbers]`

```python
# Example 1: Squaring numbers
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# Example 2: Filtering even numbers
evens = [n for n in numbers if n % 2 == 0]
print(evens)  # [2, 4]

# Example 3: Cleaning strings
raw_tags = ["  python ", "FASTAPI", "  sql  "]
clean_tags = [tag.strip().lower() for tag in raw_tags]
print(clean_tags)  # ['python', 'fastapi', 'sql']
```

- **Strength — Clean & Expressive** Turns repetitive 4-line accumulator loops into a single self-explanatory statement.
- **Weakness — Avoid Overcomplicating** Don't write nested comprehensions spanning three lines with multiple `if` clauses; write a regular `for` loop when logic gets complex.

**Interview question**

*Given a list of file names, return a list containing only the `.csv` files converted to lowercase.*

Use a list comprehension filtering with `.endswith(".csv")` and transforming with `.lower()`.

**Answer — Filter CSV Files**

```python
def get_csv_files(filenames: list[str]) -> list[str]:
    return [name.lower() for name in filenames if name.lower().endswith(".csv")]

# Test cases
files = ["data.CSV", "report.pdf", "users.csv", "image.png"]
assert get_csv_files(files) == ["data.csv", "users.csv"]
print("Filter CSV files passed!")
```

> **Key idea**
>
> Only use list comprehensions when you intend to produce a new list. Never use a comprehension solely to produce side effects (like `[print(x) for x in items]`); use a normal `for` loop instead.

---

<a id="unit-3"></a>

## Unit 3 — Functions & Error Handling

Writing clean reusable functions, handling arguments, and catching runtime errors gracefully.

<a id="9-functions-and-arguments"></a>

## 9. Functions & Arguments

- **Definition** `def function_name(param1, param2=default):` <!-- great -->
- **Return Values** `return result` <!-- great -->
- **Default Arguments** `Clean fallbacks for optional params` <!-- good -->

Functions let you package code into reusable blocks. Functions take arguments, execute logic, and return values using the `return` statement. If a function doesn't include an explicit `return`, it returns `None` automatically.

> **Analogy** 🎬
>
> **Picture it — A Kitchen Blender**
>
> A function is like a blender with predefined settings. You drop ingredients into the top (arguments), press the blend button (execute function), and pour out the resulting smoothie (return value).

Key patterns:
1. Positional arguments: `def add(a, b): return a + b`
2. Default arguments: `def greet(name, greeting="Hello"): return f"{greeting}, {name}"`
3. Multiple return values: `return width, height` (returns a tuple that can be unpacked)
4. Calling with keyword arguments: `greet(name="Alex", greeting="Hi")`

```python
# Function with default parameters
def calculate_total(subtotal: float, tax_rate: float = 0.08) -> float:
    return round(subtotal * (1 + tax_rate), 2)

print(calculate_total(100.0))         # 108.0 (uses default 8% tax)
print(calculate_total(100.0, 0.05))   # 105.0 (overrides tax rate)

# Returning multiple values
def get_min_and_max(numbers: list[int]):
    return min(numbers), max(numbers)

lowest, highest = get_min_and_max([12, 45, 2, 89, 23])
print(f"Min: {lowest}, Max: {highest}")  # Min: 2, Max: 89
```

- **Strength — Reusability & Modularity** Breaking code into focused, well-named functions makes testing and debugging straightforward.
- **Weakness — Mutable Default Argument Trap** Never use a mutable list or dictionary as a default argument (like `def fn(items=[])`); use `items=None` and initialize inside the function.

**Interview question**

*Write a function that calculates a bill's tip amount based on bill total and a percentage, defaulting to 15% tip.*

Define a function taking `bill: float` and `percentage: float = 15.0`, computing `bill * (percentage / 100)`.

**Answer — Calculate Tip**

```python
def calculate_tip(bill: float, percentage: float = 15.0) -> float:
    if bill < 0:
        raise ValueError("Bill cannot be negative.")
    return round(bill * (percentage / 100), 2)

# Test cases
assert calculate_tip(100.0) == 15.0
assert calculate_tip(50.0, 20.0) == 10.0
assert calculate_tip(0.0) == 0.0
print("Calculate tip passed!")
```

> **Key idea**
>
> To use an optional list parameter in a function, write `def my_func(items=None): if items is None: items = []`.

---

<a id="10-everyday-error-handling"></a>

## 10. Everyday Error Handling

- **Try / Except** `Catch specific exceptions safely` <!-- great -->
- **Common Errors** `ValueError, KeyError, FileNotFoundError` <!-- great -->
- **Cleanup** `finally block always runs` <!-- good -->

Errors happen: an API returns bad text, a user types letters into a number field, or a file doesn't exist. Python uses `try / except` blocks so your program handles errors gracefully instead of crashing abruptly.

> **Analogy** 🎬
>
> **Picture it — A Gymnast's Safety Net**
>
> The code inside `try:` is the gymnast performing high on the trapeze. If they perform the routine smoothly, they finish and dismount. If they slip (an error occurs), the `except:` safety net catches them safely so nobody gets hurt.

Key patterns:
1. `try ... except ValueError as e:`: Catches specific conversion errors
2. `except (KeyError, IndexError):`: Catches multiple possible lookup errors
3. `except Exception as e:`: Fallback for unexpected errors
4. `finally:`: Code that is guaranteed to run (e.g. closing connections)
5. `raise ValueError("Invalid value")`: Manually triggers an error

```python
# Catching specific parsing errors
raw_input = "forty-two"

try:
    age = int(raw_input)
    print(f"Age is {age}")
except ValueError:
    print(f"Could not convert '{raw_input}' to an integer. Setting default age to 0.")
    age = 0

# Safe dictionary lookups
config = {"timeout": 30}
try:
    retries = config["retries"]
except KeyError:
    retries = 3

print(f"Using {retries} retries.")
```

- **Strength — Prevents Application Crashes** Catching specific errors lets services log failures and return fallback responses without taking down the server.
- **Weakness — Bare `except: pass` Anti-pattern** Writing `except: pass` silences every error, including keyboard interrupts and variable typos, making debugging impossible.

**Interview question**

*Write a function that safely divides two numbers and returns None if division by zero occurs.*

Wrap the division operation `a / b` inside a `try / except ZeroDivisionError` block.

**Answer — Safe Division**

```python
def safe_divide(a: float, b: float):
    try:
        return a / b
    except ZeroDivisionError:
        return None

# Test cases
assert safe_divide(10, 2) == 5.0
assert safe_divide(5, 0) is None
assert safe_divide(0, 5) == 0.0
print("Safe divide passed!")
```

> **Key idea**
>
> Always specify the error you expect to catch (such as `except ValueError:`, not just `except:`).

---

## Daily Python Cheat Sheet

A quick checklist of the most common daily syntax:

1. **Variables & None:** Python is dynamically typed. Check for emptiness with `if items:` or `if not items:`. Compare singletons with `if val is None:`.
2. **Strings:** Format with `f"Hello {name}"`. Clean with `.strip()`, split into lists with `.split()`, and join with `", ".join(list)`.
3. **Lists:** Access with `items[0]` and `items[-1]`. Append with `.append()`. Reverse with `[::-1]`.
4. **Dictionaries:** Use `.get(key, default)` for safe lookups that never crash with `KeyError`.
5. **Sets:** Use `set(items)` to instantly remove duplicates. Check membership with `item in my_set` in $O(1)$ time.
6. **Comprehensions:** Transform cleanly: `[x.lower() for x in names if x]`.
7. **Functions:** Define with `def fn(a, b=default):`. Return early to keep logic simple.
8. **Errors:** Catch expected issues with `try / except SpecificError:`. Never write bare `except: pass`.

---

© 2026 TechToday. Python Study Library.

