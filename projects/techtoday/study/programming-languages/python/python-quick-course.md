<!--
Source: python-quick-course.html
Title: Python Quick Course | TechToday
Description: High-frequency Python essentials for everyday engineering — variables, strings, data structures, comprehensions, functions, OOP, dataclasses, generators, decorators, and gotchas.
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="python-quick-course"></a>

# Python Quick Course

The high-velocity Python quick reference: core syntax, everyday standard library tools, idiomatic patterns, and high-frequency problem solutions with Python implementations, test cases, and complexity analysis.

<a id="table-of-contents"></a>

## Table of Contents

1. [Variables, Types & Truthiness](#1-variables-types-and-truthiness)
2. [Strings & String Formatting](#2-strings-and-string-formatting)
3. [Numbers & Math Operations](#3-numbers-and-math-operations)
4. [Conditionals & Pattern Matching](#4-conditionals-and-pattern-matching)
5. [Lists & Slicing](#5-lists-and-slicing)
6. [Dictionaries & Mapping Essentials](#6-dictionaries-and-mapping-essentials)
7. [Tuples & Sets](#7-tuples-and-sets)
8. [Comprehensions (List, Dict, Set)](#8-comprehensions-list-dict-set)
9. [Loops & Iteration Helpers](#9-loops-and-iteration-helpers)
10. [Functions, Parameters & Scopes](#10-functions-parameters-and-scopes)
11. [Lambdas & Sorting with Custom Keys](#11-lambdas-and-sorting-with-custom-keys)
12. [Error & Exception Handling](#12-error-and-exception-handling)
13. [Classes & Object-Oriented Basics](#13-classes-and-object-oriented-basics)
14. [Dataclasses & Modern Structs](#14-dataclasses-and-modern-structs)
15. [Iterators & Generators](#15-iterators-and-generators)
16. [Decorators & Function Wrappers](#16-decorators-and-function-wrappers)
17. [File I/O & Pathlib](#17-file-io-and-pathlib)
18. [JSON Parsing & Serialization](#18-json-parsing-and-serialization)
19. [Standard Library Power Tools](#19-standard-library-power-tools)
20. [High-Frequency Pitfalls & Gotchas](#20-high-frequency-pitfalls-and-gotchas)

---

<a id="unit-1"></a>

## Unit 1 — Core Syntax & Data Foundations

The foundational mechanics of Python: variable names as object references, fundamental types, truthiness evaluation, string manipulation, numerical arithmetic, and branching logic.

<a id="1-variables-types-and-truthiness"></a>

## 1. Variables, Types & Truthiness

- **Memory Model** `Reference-based` <!-- great -->
- **Type System** `Dynamic & Strong` <!-- great -->
- **Empty Collection Truthiness** `False` <!-- good -->

Python does not declare variables as memory containers; instead, variables are lightweight names (sticky tags) bound to objects residing in heap memory. Python is dynamically typed because types belong to values rather than variable names, and strongly typed because implicit conversions between incompatible types (like string plus integer) raise a `TypeError` rather than coercing silently.

> **Analogy** 🎬
>
> **Picture it — Luggage Tags on Suitcases**
>
> In C or Java, a variable is a custom-sized rigid box that only holds one specific shape. In Python, an object is a suitcase sitting on an airport carousel, and the variable `x` is simply an adhesive luggage tag attached by a string. Executing `y = x` does not clone the suitcase; it merely attaches a second luggage tag `y` to the exact same physical piece of luggage.

Every Python object has an intrinsic truth value when evaluated in a boolean context (`if`, `while`, `bool()`). Values evaluated as falsy include:
1. Constants: `None` and `False`
2. Zero numeric values: `0`, `0.0`, `0j`, `Decimal(0)`, `Fraction(0, 1)`
3. Empty sequences and collections: `""`, `()`, `[]`, `{}`, `set()`, `range(0)`
4. Custom objects implementing `__bool__()` returning `False` or `__len__()` returning `0`

All other objects evaluate to truthy.

```python
# Variable names bind to objects
a = [1, 2, 3]
b = a          # Both names point to the same list object
b.append(4)
print(a)       # [1, 2, 3, 4] - mutated through b!

# Type inspection and conversion
val = "104"
num = int(val) # Explicit conversion
print(type(num), isinstance(num, int)) # <class 'int'> True

# Truthiness patterns in real code
items = []
if not items:
    print("List is empty - Pythonic check without len(items) == 0")
```

- **Strength — Clean Falsy Checks** Writing `if not sequence:` checks emptiness idiomatically across lists, strings, and dictionaries without calling `len()`.
- **Weakness — Accidental Aliasing** Assigning a mutable object to another name shares the underlying instance, causing unintended mutations across your codebase.

**Interview question**

*How does Python's `is` operator differ from `==`, and why can checking `if x == True:` introduce bugs?*

The `==` operator invokes `__eq__()` to check value equality (whether two objects hold equivalent contents), whereas `is` checks reference identity (whether both variables point to the exact same memory address `id(a) == id(b)`). In Python, `bool` is a subclass of `int`, meaning `True == 1` and `False == 0`. Checking `if x == True:` will mistakenly match `1`, whereas `if x is True:` checks strictly for the boolean singleton `True`. The standard Pythonic check for truthiness is simply `if x:`.

**Answer — Identity vs Equality and Truthiness Verification**

```python
x = [1, 2]
y = [1, 2]

print(x == y)      # True (same values)
print(x is y)      # False (distinct heap objects)

flag = 1
print(flag == True)  # True (because 1 == True)
print(flag is True)  # False (1 is an int, not the True singleton)

# Idiomatic check
if x:
    print("x has items and is truthy")
```

> **Key idea**
>
> Always compare singletons like `None` using the `is` operator (`if val is None:`), never `== None`. For checking truthiness, use direct evaluation (`if val:`).

---

<a id="2-strings-and-string-formatting"></a>

## 2. Strings & String Formatting

- **Immutability** `Guaranteed` <!-- great -->
- **Formatting Standard** `f-strings (PEP 498)` <!-- great -->
- **Index & Slice** `O(1) / O(K)` <!-- good -->

Strings in Python are immutable sequences of Unicode code points. Any operation that modifies a string (concatenation, replacing, casing) returns a brand-new string object rather than modifying the original in-place. Formatted string literals (f-strings) provide concise, readable string interpolation with full expression evaluation at runtime.

> **Analogy** 🎬
>
> **Picture it — Carved Stone Tablets**
>
> Once carved into granite, a sentence cannot be erased or amended. If you want to change one letter in a ten-word sentence, the mason must carve an entire new tablet containing the replacement. Similarly, repeated string concatenation with `+=` inside a loop carves tablet after tablet; using `''.join(parts)` acts as an industrial printing press that formats everything into one single tablet in linear time.

Commonly used string tools and expressions:
1. `f"{name=}"`: Debug formatting showing variable name and evaluated value
2. `f"{val:.2f}"`: Float formatting to 2 decimal places
3. `f"{num:>8}"`: Right-aligned padding to width 8
4. `s.strip()`, `s.lstrip()`, `s.rstrip()`: Trims whitespace or specific characters
5. `s.split(sep)` and `sep.join(iterable)`: High-performance tokenization and joining
6. `s.replace(old, new, count)`: Replaces occurrences cleanly
7. `s.startswith(prefix)` and `s.endswith(suffix)`: Multi-prefix checks via tuples `s.startswith(('http:', 'https:'))`

```python
# Modern f-string capabilities
user = "dev_alex"
score = 98.4271
rank = 4

print(f"User: {user.upper()} | Score: {score:.2f} | Rank: {rank:03d}")
# User: DEV_ALEX | Score: 98.43 | Rank: 004

# Self-documenting debug specifier (Python 3.8+)
delta = 0.042
print(f"{delta=}")  # delta=0.042

# String splitting and joining
raw_tags = "python, backend , fast-api , microservice"
clean_tags = [tag.strip() for tag in raw_tags.split(",")]
formatted = " | ".join(clean_tags)
print(formatted)    # python | backend | fast-api | microservice
```

- **Strength — Native Unicode & F-Strings** String literals handle international characters out of the box, and f-strings execute arbitrary Python expressions inline.
- **Weakness — O(N^2) Concatenation Loops** Using `s += char` repeatedly creates new strings on every step, degrading performance from linear O(N) to quadratic O(N^2).

**Interview question**

*Given a sentence string, reverse the order of the words while trimming extraneous whitespace between words without using external libraries.*

Split the sentence by whitespace using `s.split()` (which automatically collapses multiple adjacent spaces and ignores leading/trailing whitespace), reverse the resulting list of words using slicing `[::-1]`, and join them using a single space separator `" ".join(...)`.

**Answer — Reverse Words in String**

```python
def reverse_words(s: str) -> str:
    # s.split() without arguments splits on consecutive whitespace
    words = s.split()
    return " ".join(words[::-1])

# Test cases
assert reverse_words("  the sky   is blue  ") == "blue is sky the"
assert reverse_words("hello world") == "world hello"
assert reverse_words("    ") == ""
print("All test cases passed!")
```

> **Key idea**
>
> When tokenizing by whitespace, always use `s.split()` with no arguments. Passing `s.split(" ")` will retain empty string tokens when multiple consecutive spaces appear.

---

<a id="3-numbers-and-math-operations"></a>

## 3. Numbers & Math Operations

- **Integer Precision** `Arbitrary (no overflow)` <!-- great -->
- **Float Standard** `IEEE 754 (64-bit double)` <!-- ok -->
- **Division Default** `/ always returns float` <!-- good -->

Python features arbitrary-precision integers: unlike languages where 32-bit or 64-bit integers overflow into negative values at $2^{31}-1$ or $2^{63}-1$, Python integers grow dynamically to consume available RAM. Floating-point numbers are 64-bit IEEE 754 double-precision floats, subject to standard binary floating-point representation limits.

> **Analogy** 🎬
>
> **Picture it — Elastic Ruler vs Fixed Pocket Caliper**
>
> A fixed caliper (standard C `long long`) has a hard metal stop; push past it and the dial snaps or wraps around to negative numbers. Python integers are an elastic measuring tape that stretches indefinitely as numbers grow. Floats, however, are like measuring rounded ripples in water: tiny decimal fractions like $0.1$ cannot be represented cleanly in binary powers of two, leading to slight rounding deviations.

High-frequency mathematical operations:
1. Standard division `/`: Always produces a `float` (`7 / 2 == 3.5`)
2. Floor division `//`: Truncates toward negative infinity (`7 // 2 == 3`, `-7 // 2 == -4`)
3. Modulo `%`: Remainder of division (`7 % 2 == 1`, `-7 % 2 == 1`)
4. Combined quotient & remainder: `q, r = divmod(n, d)` in a single C-level operation
5. Exponentiation `**`: Power operation (`2 ** 10 == 1024`, modular `pow(base, exp, mod)`)
6. Safe float comparison: `math.isclose(a, b, rel_tol=1e-9)` avoids equality bugs

```python
import math

# Arbitrary precision integers
huge = 2 ** 100
print(f"2^100 has {len(str(huge))} digits")  # 31 digits, zero overflow

# Integer floor division vs regular division
print(7 / 2)    # 3.5 (float)
print(7 // 2)   # 3 (int floor)
print(-7 // 2)  # -4 (floored toward negative infinity!)

# The classic floating point trap
sum_val = 0.1 + 0.2
print(sum_val)                  # 0.30000000000000004
print(sum_val == 0.3)           # False!
print(math.isclose(sum_val, 0.3)) # True (safe comparison)

# Single-step quotient and remainder
quotient, remainder = divmod(29, 6)
print(f"29 / 6 = {quotient} with remainder {remainder}")
```

- **Strength — Built-in BigInts** Cryptography and combinatorics calculations can calculate massive factorial and modular exponentiation values natively without third-party BigInt libraries.
- **Weakness — Binary Float Equality** Comparing floating point values with `==` causes unpredictable bugs due to base-2 fraction rounding.

**Interview question**

*How do you compute the sum of digits of a non-negative integer without converting it to a string?*

Use a loop running integer floor division and modulo: extract the least significant digit with `n % 10`, accumulate it into a running total, and strip that digit using `n //= 10` until the number reaches zero.

**Answer — Sum of Digits**

```python
def sum_of_digits(n: int) -> int:
    total = 0
    while n > 0:
        n, digit = divmod(n, 10)
        total += digit
    return total

# Test cases
assert sum_of_digits(12345) == 15
assert sum_of_digits(0) == 0
assert sum_of_digits(999) == 27
print("Sum of digits passed!")
```

> **Key idea**
>
> In Python, `//` truncates downward toward negative infinity, not toward zero. For truncating toward zero across negative numbers, use `int(a / b)`.

---

<a id="4-conditionals-and-pattern-matching"></a>

## 4. Conditionals & Pattern Matching

- **Evaluation** `Short-circuiting (and, or)` <!-- great -->
- **Ternary Syntax** `val if condition else alt` <!-- good -->
- **Structural Pattern Matching** `match / case (Python 3.10+)` <!-- great -->

Python uses standard `if / elif / else` branching blocks with strict indentation. The logical operators `and` and `or` employ short-circuit evaluation: `a and b` evaluates `b` only if `a` is truthy, while `a or b` evaluates `b` only if `a` is falsy. Furthermore, `and` and `or` return the actual operand value that determined the result, not a raw boolean. Modern Python (3.10+) introduces structural pattern matching via `match / case`, allowing structural destructuring of sequences, dictionaries, and classes.

> **Analogy** 🎬
>
> **Picture it — A Railroad Switching Yard**
>
> Standard `if/elif` evaluates train signals one by one down a single track. Structural `match/case` is an automated yard scanner that checks both the train's cargo format (is it a 2-car passenger train, a freight car with a weight attribute, or an emergency locomotive?) and routes it immediately based on shape and contents.

Key patterns and syntax:
1. Chained comparisons: `10 <= score < 20` (evaluated cleanly without repeating `score`)
2. Ternary operator: `status = "passed" if score >= 50 else "failed"`
3. Default assignment: `user_name = input_name or "Anonymous"`
4. Structural matching with sequence patterns: `case [x, y]:`
5. Guards in pattern matching: `case int(n) if n > 0:`
6. Wildcard capture: `case _:` acts as the default fallback

```python
# Chained comparison & ternary expression
age = 22
category = "Adult" if age >= 18 else "Minor"
if 18 <= age <= 65:
    print(f"{category}: Working age")

# Short-circuit value return
config_port = None
port = config_port or 8080  # Returns 8080 because config_port is falsy
print(f"Running on port: {port}")

# Structural pattern matching (Python 3.10+)
def parse_command(command):
    match command.split():
        case ["quit"]:
            return "Exiting system"
        case ["load", filename]:
            return f"Loading file: {filename}"
        case ["move", ("left" | "right" | "up" | "down") as direction, steps]:
            return f"Moving {steps} steps {direction}"
        case _:
            return "Unknown command"

print(parse_command("move left 5"))  # Moving 5 steps left
print(parse_command("quit"))         # Exiting system
```

- **Strength — Expressive Destructuring** `match/case` validates types, shapes, and values simultaneously in API handlers and event routers without nested `isinstance()` spaghetti.
- **Weakness — Falsy Zero Overwrite** Using `value or default` mistakenly overrides valid zeros or empty strings (`0 or 10` returns `10`).

**Interview question**

*Write a function that parses a nested JSON-like dictionary representing an API response and returns a normalized status string using structural pattern matching.*

Use `match response:` with mapping patterns `{ "status": 200, "data": data }` and guard clauses to extract information cleanly without defensive `response.get("status")` checks.

**Answer — Pattern Matching on Dictionaries**

```python
def handle_response(response: dict) -> str:
    match response:
        case {"status": 200, "data": list(records)} if len(records) > 0:
            return f"Success with {len(records)} records"
        case {"status": 200, "data": []}:
            return "Success: empty dataset"
        case {"status": 404, "error": msg}:
            return f"Resource not found: {msg}"
        case {"status": int(code), "error": msg} if code >= 500:
            return f"Server failure ({code}): {msg}"
        case _:
            return "Unrecognized response payload"

# Test cases
assert handle_response({"status": 200, "data": [1, 2, 3]}) == "Success with 3 records"
assert handle_response({"status": 404, "error": "User missing"}) == "Resource not found: User missing"
assert handle_response({"status": 503, "error": "Gateway timeout"}) == "Server failure (503): Gateway timeout"
print("Pattern matching passed!")
```

> **Key idea**
>
> If a variable can legitimately be `0`, `False`, or `""`, avoid `val = input_val or default`. Use `val = input_val if input_val is not None else default`.
---

<a id="unit-2"></a>

## Unit 2 — Collections & Data Structures

Python's everyday data structures: dynamic arrays (lists), hash-map lookups (dictionaries), immutable records (tuples), mathematical unique collections (sets), and declarative comprehensions.

<a id="5-lists-and-slicing"></a>

## 5. Lists & Slicing

- **Index Lookup** `O(1)` <!-- great -->
- **Append (Right)** `O(1) amortized` <!-- great -->
- **Insert / Delete (Left/Middle)** `O(N)` <!-- bad -->

A Python `list` is a dynamically resizable array of pointers to objects stored contiguously in memory. Because elements are contiguous references, looking up any element by its integer index is an immediate $O(1)$ memory offset calculation. Appending to the end is $O(1)$ amortized because Python pre-allocates spare capacity; however, inserting or removing elements from the beginning or middle is $O(N)$ because all subsequent pointers must slide in memory.

> **Analogy** 🎬
>
> **Picture it — A Row of Reserved Parking Spots**
>
> A list is a numbered row of parking bays. Driving straight to bay #4 is instant ($O(1)$). Parking a new car at the open end bay is instant ($O(1)$). But if a driver decides to squeeze their car into spot #0 at the very front of the row, every single parked car behind it must back up by one slot ($O(N)$ displacement).

Common slice syntax and patterns:
1. `seq[start:stop]`: Extracts elements from `start` up to but excluding `stop`
2. `seq[start:stop:step]`: Steps through the sequence by `step` increments
3. `seq[::-1]`: Idiomatic full reversal of the sequence
4. `seq[:]`: Creates a shallow copy of the entire list
5. `list.append(x)` vs `list.extend(iterable)`: Appends single item vs unpacks elements
6. `list.pop()` vs `list.pop(0)`: $O(1)$ tail removal vs $O(N)$ head removal
7. `list.sort()` vs `sorted(list)`: In-place mutation vs returning a fresh sorted list

```python
nums = [10, 20, 30, 40, 50, 60]

# High-frequency slicing
print(nums[1:4])     # [20, 30, 40]
print(nums[:3])      # [10, 20, 30] (first 3 items)
print(nums[-2:])     # [50, 60] (last 2 items)
print(nums[::2])     # [10, 30, 50] (every 2nd item)
print(nums[::-1])    # [60, 50, 40, 30, 20, 10] (reversed copy)

# Mutating operations
nums.append(70)      # O(1) amortized
nums.extend([80, 90])# Appends multiple items
last_val = nums.pop()# O(1) removes and returns 90

# Slicing creates shallow copies
clone = nums[:]
clone[0] = 999
print(nums[0])       # Still 10 (nums unchanged!)
```

- **Strength — Versatile Resizing** Automatic memory over-allocation makes `list` the default general-purpose sequence for dynamic collections.
- **Weakness — O(N) Shifts on Head Operations** Using `nums.pop(0)` or `nums.insert(0, val)` turns loops into $O(N^2)$ slowdowns; use `collections.deque` for FIFO queues.

**Interview question**

*Given an array of integers, rotate the array to the right by $k$ steps in place with $O(1)$ extra memory.*

To rotate in-place without extra space: normalize $k = k \pmod n$. First reverse the entire array; next, reverse the first $k$ elements; finally, reverse the remaining $n - k$ elements. Python slice assignment `nums[:] = ...` allows clean in-place array buffer replacement.

**Answer — Rotate Array in Place**

```python
def rotate_array(nums: list[int], k: int) -> None:
    n = len(nums)
    if n <= 1:
        return
    k = k % n

    def reverse_range(left: int, right: int) -> None:
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1

    reverse_range(0, n - 1)      # Step 1: reverse entire array
    reverse_range(0, k - 1)      # Step 2: reverse first k items
    reverse_range(k, n - 1)      # Step 3: reverse rest

# Test cases
test_arr = [1, 2, 3, 4, 5, 6, 7]
rotate_array(test_arr, 3)
assert test_arr == [5, 6, 7, 1, 2, 3, 4]
print("Rotate array passed!")
```

> **Key idea**
>
> Slicing a list produces a new copy of that sub-array. Mutating elements inside the slice modifies only the copy unless you use slice assignment `nums[start:stop] = replacement`.

---

<a id="6-dictionaries-and-mapping-essentials"></a>

## 6. Dictionaries & Mapping Essentials

- **Lookup & Insertion** `O(1) average` <!-- great -->
- **Ordering** `Insertion order preserved (Python 3.7+)` <!-- great -->
- **Key Requirement** `Must be hashable (__hash__ & __eq__)` <!-- good -->

A Python `dict` is an open-addressing hash table that maps unique keys to values. Since Python 3.6/3.7, dictionaries maintain the exact insertion order of their keys while consuming 20–25% less memory through a split-table architecture (a sparse hash array pointing into a dense array of `(hash, key, value)` entries). Looking up, adding, or deleting a key runs in $O(1)$ amortized average time.

> **Analogy** 🎬
>
> **Picture it — A Digital Coat Check Room**
>
> When you hand your jacket to a coat check attendant, you receive a claim number. When you return, the attendant doesn't search through thousands of jackets one by one ($O(N)$); they walk directly to the numbered hook corresponding to your ticket ($O(1)$). In Python, your key is passed to `hash(key)`, producing the exact slot index in nanoseconds.

High-frequency dictionary methods:
1. `d.get(key, default)`: Retrieves value without throwing `KeyError` if key is absent
2. `d.setdefault(key, default)`: Returns existing value, or inserts and returns default
3. `d.items()`, `d.keys()`, `d.values()`: Dynamic view objects reflecting dictionary state
4. `d.pop(key, default)`: Removes key and returns its value
5. `d1 | d2` and `d1 |= d2`: Dictionary merge operators (Python 3.9+)
6. `collections.defaultdict`: Automatically initializes missing keys on first access
7. `collections.Counter`: High-speed item frequency counter with `.most_common(n)`

```python
# Modern dictionary creation & merging
base_config = {"env": "production", "debug": False, "timeout": 30}
override = {"debug": True, "host": "0.0.0.0"}

# Python 3.9+ dictionary union operator
active_config = base_config | override
print(active_config["debug"])  # True (overridden)

# Safe lookups with .get()
retries = active_config.get("retries", 3)
print(f"Retries: {retries}")   # 3 (fallback used)

# High-frequency grouping pattern with setdefault
groups = {}
users = [("admin", "Alice"), ("guest", "Bob"), ("admin", "Charlie")]
for role, name in users:
    groups.setdefault(role, []).append(name)
print(groups)  # {'admin': ['Alice', 'Charlie'], 'guest': ['Bob']}
```

- **Strength — Blazing O(1) Key Lookups** Dictionaries turn slow linear scans into instantaneous hash lookups, serving as Python's primary data backbone.
- **Weakness — Memory Footprint** Hash tables require spare bucket capacity to avoid collision storms, using more RAM than packed arrays or tuples.

**Interview question**

*Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` in $O(N)$ time.*

Maintain a hash map storing `{number_value: index}`. As you iterate through the list with `enumerate()`, compute the needed complement `target - num`. If the complement already exists in the dictionary, return the complement's index and current index. Otherwise, record the current number in the dictionary.

**Answer — Two Sum with Hash Map**

```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for idx, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], idx]
        seen[num] = idx
    return []

# Test cases
assert two_sum([2, 7, 11, 15], 9) == [0, 1]
assert two_sum([3, 2, 4], 6) == [1, 2]
assert two_sum([3, 3], 6) == [0, 1]
print("Two Sum passed in O(N) time!")
```

> **Key idea**
>
> A dictionary key must be hashable and implement consistent `__hash__()` and `__eq__()`. Lists, sets, and un-frozen dicts are mutable and cannot be dictionary keys; use `tuple` or `frozenset` instead.

---

<a id="7-tuples-and-sets"></a>

## 7. Tuples & Sets

- **Tuple Immutability** `Fixed size & contents` <!-- great -->
- **Set Membership** `O(1) average lookup` <!-- great -->
- **Set Uniqueness** `Duplicates automatically purged` <!-- good -->

A `tuple` is an ordered, immutable sequence of elements. Because tuples cannot change size or contents after creation, Python optimizes their memory layout and reuses small tuple allocations internally. A `set` is an unordered collection of distinct hashable items implemented as a hash table with keys but no values, providing $O(1)$ deduplication and mathematical set operations.

> **Analogy** 🎬
>
> **Picture it — Sealed Birth Certificate vs VIP Guest List**
>
> A tuple is a sealed birth certificate: once issued, the name, date, and town are permanently bound together in that exact sequence; nobody can append extra stamps or reorder the dates. A set is a security guard's VIP checklist: you cannot be on the list twice, the order people arrive doesn't matter, and checking if your name is on the clipboard takes a split-second glance.

High-frequency operations:
1. Tuple unpacking: `x, y = point` or `first, *middle, last = seq`
2. Single-element tuple: `item = (42,)` (the trailing comma is mandatory)
3. Set creation: `unique_ids = set(raw_list)`
4. Set union `a | b`: All items in either set
5. Set intersection `a & b`: Items present in both sets
6. Set difference `a - b`: Items in `a` but not in `b`
7. Set symmetric difference `a ^ b`: Items in either `a` or `b`, but not both

```python
# Tuple packing and extended unpacking
record = ("ENG-402", "API Gateway", "critical", 500, "down")
code, title, *meta, status = record
print(code, title, meta, status)
# ENG-402 API Gateway ['critical', 500] down

# Fast variable swapping via tuple packing
a, b = 10, 20
a, b = b, a  # Swapped cleanly without temporary variable
print(a, b)  # 20 10

# Set operations in practice
team_backend = {"Alice", "Bob", "Charlie", "David"}
team_cloud = {"Charlie", "David", "Eve", "Frank"}

print(team_backend & team_cloud) # {'Charlie', 'David'} (in both)
print(team_backend - team_cloud) # {'Alice', 'Bob'} (backend only)
print(team_backend ^ team_cloud) # {'Alice', 'Bob', 'Eve', 'Frank'}
```

- **Strength — O(1) Membership Testing** Checking `if item in my_set:` takes $O(1)$ time, whereas checking `if item in my_list:` scans all elements in $O(N)$ time.
- **Weakness — Tuple with Mutable Items Trap** A tuple cannot be rebound, but if it contains a list `t = (1, [2, 3])`, mutating `t[1].append(4)` succeeds, violating intuitive immutability.

**Interview question**

*Given two integer arrays `nums1` and `nums2`, return an array of their intersection where each element is unique, in any order.*

Convert one array to a `set` to allow $O(1)$ membership checks, then iterate through the other array or perform a native set intersection `set(nums1) & set(nums2)`.

**Answer — Intersection of Two Arrays**

```python
def intersection(nums1: list[int], nums2: list[int]) -> list[int]:
    # Set intersection runs in O(len(nums1) + len(nums2))
    return list(set(nums1) & set(nums2))

# Test cases
assert set(intersection([1, 2, 2, 1], [2, 2])) == {2}
assert set(intersection([4, 9, 5], [9, 4, 9, 8, 4])) == {4, 9}
print("Intersection test passed!")
```

> **Key idea**
>
> Writing `s = {}` creates an empty dictionary, NOT a set! To instantiate an empty set, you must write `s = set()`.

---

<a id="8-comprehensions-list-dict-set"></a>

## 8. Comprehensions (List, Dict, Set)

- **Execution Speed** `Optimized bytecode (LIST_APPEND in C)` <!-- great -->
- **Readability** `Declarative mapping & filtering` <!-- great -->
- **Syntax Variants** `List [], Dict {}, Set {}` <!-- good -->

Comprehensions provide a concise, declarative syntax to construct a new collection by transforming and filtering an iterable. Under the hood, Python compiles comprehensions into specialized bytecode that avoids the overhead of repeated attribute lookups like `list.append()`, executing at compiled C speeds.

> **Analogy** 🎬
>
> **Picture it — An Automated Sorter Conveyor**
>
> Building a list via a manual `for` loop with `res.append()` is like an operator picking up parts one by one, examining them, and manually walking them to a storage shelf. A comprehension is a factory sorting machine: raw materials stream past optical filters, get stamped and transformed in one swift motion, and drop straight into the packing box.

Syntactic forms:
1. List comprehension: `[expr for item in iterable if condition]`
2. Dictionary comprehension: `{key_expr: val_expr for item in iterable if condition}`
3. Set comprehension: `{expr for item in iterable if condition}`
4. Conditional expressions inside transformation: `[x if x > 0 else 0 for x in items]`
5. Flattening 2D sequences: `[item for row in matrix for item in row]`

```python
# List comprehension with filtering & transformation
prices = [12.50, 4.99, 99.00, 3.20, 45.00]
discounted = [round(p * 0.9, 2) for p in prices if p > 10.0]
print(discounted)  # [11.25, 89.1, 40.5]

# Dictionary comprehension
users = [("u1", "active"), ("u2", "inactive"), ("u3", "active")]
active_lookup = {uid: status for uid, status in users if status == "active"}
print(active_lookup)  # {'u1': 'active', 'u3': 'active'}

# Set comprehension (clean deduplication & casing)
raw_emails = ["Alex@work.com", "ALEX@work.com", "Dev@Work.com"]
unique_domains = {email.split("@")[1].lower() for email in raw_emails}
print(unique_domains)  # {'work.com'}

# Flattening a 2D matrix
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [val for row in matrix for val in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

- **Strength — Expressive and Fast** Comprehensions replace verbose multi-line loop setups with clean single-expression transformations that run faster than manual `.append()` loops.
- **Weakness — Over-nesting Trap** Nesting more than two `for` clauses or multiple nested conditions in a comprehension turns readable code into unmaintainable cognitive friction.

**Interview question**

*Given a list of words, group words of identical lengths into a dictionary where the key is the word length and the value is a list of words.*

Use a dictionary comprehension with `setdefault` or `collections.defaultdict(list)`: iterate through words and group them cleanly.

**Answer — Group Words by Length**

```python
from collections import defaultdict

def group_by_length(words: list[str]) -> dict[int, list[str]]:
    grouped = defaultdict(list)
    for word in words:
        grouped[len(word)].append(word)
    return dict(grouped)

# Test cases
words_input = ["cat", "dog", "apple", "bear", "banana"]
result = group_by_length(words_input)
assert result[3] == ["cat", "dog"]
assert result[5] == ["apple"]
assert result[6] == ["banana"]
print("Group by length passed!")
```

> **Key idea**
>
> In nested list comprehensions like `[val for row in matrix for val in row]`, read the `for` clauses in the exact order you would write nested `for` loops: outer loop first (`for row in matrix`), inner loop second (`for val in row`).
---

<a id="unit-3"></a>

## Unit 3 — Functions & Control Patterns

Mastering execution flow: idiomatic iteration with `enumerate` and `zip`, flexible function parameters (`*args`, `**kwargs`), multi-level variable scope (LEGB), custom sorting with lambdas, and resilient exception handling.

<a id="9-loops-and-iteration-helpers"></a>

## 9. Loops & Iteration Helpers

- **Index Traversal** `enumerate(seq, start=0)` <!-- great -->
- **Parallel Iteration** `zip(seq1, seq2, strict=True)` <!-- great -->
- **Loop Else Clause** `Executes only if no break occurred` <!-- good -->

Iterating in Python is built on iterables rather than manual C-style index counters (`for (int i=0; i < n; i++)`). Instead of writing `for i in range(len(items)):`, idiomatic Python iterates directly over items. When indices are needed, `enumerate()` yields `(index, item)` pairs with zero manual bookkeeping. When coordinating multiple sequences, `zip()` pairs corresponding items concurrently.

> **Analogy** 🎬
>
> **Picture it — A Cash Register Tape & A Zipper**
>
> `enumerate()` is like a cash register printing transaction receipt numbers: every time an item passes the scanner, the register stamps a sequential counter beside it automatically. `zip()` is an actual jacket zipper: teeth from the left flap interlock with teeth from the right flap one pair at a time, moving upward in unison.

High-frequency loop helpers:
1. `enumerate(iterable, start=0)`: Yields index and item tuple
2. `zip(seq_a, seq_b, strict=True)`: Pairs elements, raising `ValueError` in Python 3.10+ if lengths differ
3. `reversed(seq)`: Iterates backward without allocating an inverted copy
4. `range(start, stop, step)`: Lazy sequence generator producing integers on demand
5. `for ... else`: The `else` block executes after the loop finishes normally, but is skipped if terminated by `break`
6. `itertools.zip_longest`: Pairs uneven sequences with a designated fill value

```python
names = ["Alice", "Bob", "Charlie"]
scores = [95, 88, 92]

# Idiomatic index traversal
for rank, name in enumerate(names, start=1):
    print(f"Rank {rank}: {name}")

# Parallel pairing with strict validation
for name, score in zip(names, scores, strict=True):
    print(f"{name} scored {score}")

# The loop else clause: search pattern
target = "Bob"
for name in names:
    if name == target:
        print(f"Found {target}!")
        break
else:
    print(f"{target} was not in the roster.")
```

- **Strength — Eliminates Off-by-One Errors** Native iterator loops completely eradicate boundary condition mistakes common in index-manipulated while loops.
- **Weakness — Modifying Collection While Iterating Trap** Appending or deleting elements from a `list` while actively iterating over it results in skipped items or infinite loops.

**Interview question**

*Given two lists of strings, determine if one list is a strict permutation of the other without using external libraries.*

If lengths differ, return `False`. You can sort both lists and compare ($O(N \log N)$), or count character frequencies into a dictionary ($O(N)$). Using `collections.Counter` or a dictionary map allows linear time validation.

**Answer — Check Permutation**

```python
def is_permutation(list_a: list[str], list_b: list[str]) -> bool:
    if len(list_a) != len(list_b):
        return False
    counts = {}
    for item in list_a:
        counts[item] = counts.get(item, 0) + 1
    for item in list_b:
        if item not in counts:
            return False
        counts[item] -= 1
        if counts[item] == 0:
            del counts[item]
    return len(counts) == 0

# Test cases
assert is_permutation(["a", "b", "c"], ["c", "a", "b"]) is True
assert is_permutation(["a", "b"], ["a", "b", "c"]) is False
assert is_permutation(["x", "x", "y"], ["x", "y", "y"]) is False
print("Permutation check passed!")
```

> **Key idea**
>
> If you must modify a list during a loop, iterate over a shallow copy of it (`for item in items[:]:`) or construct a filtered list via comprehension.

---

<a id="10-functions-parameters-and-scopes"></a>

## 10. Functions, Parameters & Scopes

- **Argument Types** `Positional, Keyword, *args, **kwargs` <!-- great -->
- **Scope Lookup Order** `LEGB (Local, Enclosing, Global, Built-in)` <!-- great -->
- **Keyword-Only Guard** `def f(*, key_only_param):` <!-- good -->

Functions are first-class citizens in Python: they can be passed as arguments, returned from other functions, assigned to variables, and stored in collections. Python provides parameter definitions ranging from positional arguments to arbitrary positional collectors (`*args` packing into a tuple) and arbitrary keyword collectors (`**kwargs` packing into a dictionary). Variable lookup follows the strict LEGB rule: Local $\to$ Enclosing (closures) $\to$ Global (module) $\to$ Built-in.

> **Analogy** 🎬
>
> **Picture it — A Search Party Expanding Outward**
>
> When Python looks up a variable name, imagine searching for your keys: first check your own room (Local scope). If not found, check the living room of your flat (Enclosing closure). If still missing, check the building lobby (Global module). Finally, check the municipal lost-and-found (Python Built-ins like `len`, `int`, `print`). Python looks outward; it never searches into someone else's closed room.

Parameter mechanics:
1. Positional and keyword args: `def fn(a, b=10):`
2. Variable positional tuple: `def fn(*args):` (packs remaining positional arguments)
3. Variable keyword dictionary: `def fn(**kwargs):` (packs remaining named arguments)
4. Keyword-only parameters: `def fn(data, *, timeout=30, retries=3):` (enforces explicit parameter naming)
5. `global` declaration: Binds variable assignment to the module-level scope
6. `nonlocal` declaration: Binds variable assignment to the nearest enclosing function scope (closures)

```python
# Flexible function signature with keyword-only arguments
def configure_client(host: str, port: int = 443, *tags, timeout: int = 10, **headers) -> dict:
    return {
        "endpoint": f"{host}:{port}",
        "tags": tags,
        "timeout": timeout,
        "headers": headers,
    }

client = configure_client(
    "api.techtoday.io", 8443, "prod", "v2",
    timeout=5, Authorization="Bearer token123"
)
print(client["endpoint"]) # api.techtoday.io:8443
print(client["tags"])     # ('prod', 'v2')
print(client["headers"])  # {'Authorization': 'Bearer token123'}

# Enclosing scope and nonlocal in closures
def make_counter(start: int = 0):
    count = start
    def step() -> int:
        nonlocal count
        count += 1
        return count
    return step

counter = make_counter(10)
print(counter())  # 11
print(counter())  # 12
```

- **Strength — Clean API Contracts** Using `*` to enforce keyword-only arguments prevents silent bugs where callers pass numbers in the wrong positional order.
- **Weakness — Mutable Default Argument Trap** Defining `def fn(items=[])` reuses the same list instance across every call; always use `items=None` and initialize inside the function.

**Interview question**

*Write a function wrapper that accepts any callable with arbitrary arguments and logs its execution time and return value.*

Accept `func`, `*args`, and `**kwargs`. Capture the timestamp before and after calling `result = func(*args, **kwargs)`, log the duration, and return `result`.

**Answer — Dynamic Function Dispatch Wrapper**

```python
import time
from typing import Callable, Any

def execute_with_metrics(func: Callable, *args: Any, **kwargs: Any) -> tuple[Any, float]:
    start = time.perf_counter()
    result = func(*args, **kwargs)
    elapsed = time.perf_counter() - start
    return result, elapsed

# Test cases
def sample_work(n: int, factor: int = 2) -> int:
    return sum(i * factor for i in range(n))

res, duration = execute_with_metrics(sample_work, 100_000, factor=3)
assert res == sum(i * 3 for i in range(100_000))
assert duration >= 0.0
print("Metrics wrapper passed!")
```

> **Key idea**
>
> Default parameter expressions are evaluated once when the function is defined (at import/compile time), not each time the function is called!

---

<a id="11-lambdas-and-sorting-with-custom-keys"></a>

## 11. Lambdas & Sorting with Custom Keys

- **Syntax** `lambda arguments: expression` <!-- great -->
- **Sorting Algorithm** `Timsort (Adaptive O(N log N))` <!-- great -->
- **Custom Keys** `key=lambda x: (x.priority, -x.score)` <!-- good -->

A `lambda` is an anonymous, single-expression inline function. Lambdas cannot contain statements (such as `assert`, `while`, or `return`); they evaluate a single expression and return its result implicitly. In modern Python, lambdas are most commonly used as key extractors for `sorted()`, `list.sort()`, `min()`, and `max()`. Python uses Timsort—a stable, adaptive sorting algorithm running in $O(N \log N)$ worst-case and $O(N)$ best-case on partially sorted data.

> **Analogy** 🎬
>
> **Picture it — Sorting Mail by Zip Code and Weight**
>
> Imagine sorting postal packages. Instead of physically rearranging packages each time you compare them, you hand each package to an assistant who slaps a sticky label on it reading `(ZipCode, -Weight)`. You then sort the packages strictly by reading those lightweight sticky labels. That extraction function is the `key=` callable.

Key sorting patterns:
1. Basic sorting: `sorted(nums, reverse=True)`
2. Sorting dictionaries by value: `sorted(d.items(), key=lambda item: item[1])`
3. Sorting complex objects by attribute: `sorted(users, key=lambda u: u.age)`
4. Multi-criteria sorting with tuples: `sorted(tasks, key=lambda t: (t.priority, -t.score))`
5. Case-insensitive string sorting: `sorted(names, key=str.lower)`
6. `operator.itemgetter` and `operator.attrgetter`: High-performance C-level key extractors

```python
# Multi-criteria sorting with lambdas
students = [
    {"name": "Alice", "grade": 92, "age": 20},
    {"name": "Bob", "grade": 85, "age": 22},
    {"name": "Charlie", "grade": 92, "age": 19},
    {"name": "David", "grade": 85, "age": 20},
]

# Sort by highest grade first (-grade), then youngest age (age)
ranked = sorted(students, key=lambda s: (-s["grade"], s["age"]))
for student in ranked:
    print(f"{student['name']}: Grade {student['grade']}, Age {student['age']}")
# Charlie: Grade 92, Age 19
# Alice: Grade 92, Age 20
# David: Grade 85, Age 20
# Bob: Grade 85, Age 22

# Using min and max with custom key functions
oldest = max(students, key=lambda s: s["age"])
print(f"Oldest student: {oldest['name']}")  # Bob
```

- **Strength — Stability in Timsort** Python sorting is guaranteed stable: items with equal keys maintain their original relative order.
- **Weakness — Heavy Lambdas Hurt Readability** When a key function requires multiple conditions or logic branches, define a named `def sort_key(item):` function instead of writing an unreadable lambda.

**Interview question**

*Given a list of words, sort them such that words are ordered by length ascending, and words of equal length are sorted alphabetically in reverse order.*

Use `sorted(words, key=...)`. In Python, you cannot simply negate a string `-s` to reverse alphabetical order. Instead, take advantage of Timsort's stability: first sort alphabetically descending (`words.sort(reverse=True)`), then sort by length ascending (`words.sort(key=len)`).

**Answer — Two-Pass Stable Sort**

```python
def sort_words_by_len_and_reverse_alpha(words: list[str]) -> list[str]:
    # Pass 1: sort alphabetically in reverse
    # Pass 2: stable sort by length preserves reverse-alpha for equal lengths
    res = sorted(words, reverse=True)
    res.sort(key=len)
    return res

# Test cases
words = ["cat", "apple", "bat", "zoo", "banana", "ant"]
sorted_words = sort_words_by_len_and_reverse_alpha(words)
assert sorted_words == ["zoo", "cat", "bat", "ant", "apple", "banana"]
print("Stable custom sort passed!")
```

> **Key idea**
>
> The `key=` function is called exactly once per item during sorting (not on every pair comparison), making key-based sorting in Python remarkably fast.

---

<a id="12-error-and-exception-handling"></a>

## 12. Error & Exception Handling

- **EAFP Philosophy** `Easier to Ask for Forgiveness than Permission` <!-- great -->
- **Exception Chaining** `raise NewError from err` <!-- great -->
- **Cleanup Guarantee** `finally block always executes` <!-- good -->

Python emphasizes the EAFP paradigm ("Easier to Ask for Forgiveness than Permission"): assume an operation will succeed and handle any exception if it fails, rather than running extensive defensive pre-checks (LBYL: "Look Before You Leap"). The `try / except / else / finally` block provides structured error management: `else` runs only if no exception occurred, and `finally` is guaranteed to execute even if an unhandled error or `return` statement interrupts execution.

> **Analogy** 🎬
>
> **Picture it — Automatic Circuit Breakers**
>
> In an electrical grid, a fuse or circuit breaker doesn't inspect every electron before letting it enter your house. It allows power to flow directly; if a sudden surge or short occurs, the breaker trips cleanly (`except`), preventing a house fire. When the incident resolves, the diagnostic logs are recorded and backup generators safely spin down (`finally`).

Key handling constructs:
1. Catching specific exceptions: `except (ValueError, TypeError) as err:`
2. `else` clause: Runs only when the `try` block completes without errors
3. `finally` clause: Runs unconditionally for critical resource cleanup
4. Re-raising exceptions: Bare `raise` re-propagates the current active exception
5. Exception chaining: `raise DatabaseError("Query failed") from original_err`
6. Custom exceptions: Inherit from built-in `Exception`, never `BaseException`

```python
class InsufficientFundsError(Exception):
    """Raised when an account transaction exceeds current balance."""
    def __init__(self, balance: float, amount: float):
        super().__init__(f"Cannot withdraw ${amount:.2f}; balance is only ${balance:.2f}")
        self.balance = balance
        self.amount = amount

def process_withdrawal(balance: float, amount: float) -> float:
    if amount <= 0:
        raise ValueError("Withdrawal amount must be positive.")
    if amount > balance:
        raise InsufficientFundsError(balance, amount)
    return balance - amount

try:
    current_balance = process_withdrawal(100.0, 150.0)
except InsufficientFundsError as err:
    print(f"Transaction declined: {err}")
    print(f"Deficit: ${err.amount - err.balance:.2f}")
except ValueError as err:
    print(f"Input validation error: {err}")
else:
    print("Withdrawal approved!")
finally:
    print("Transaction session closed.")
```

- **Strength — Rich Exception Context** `raise CustomError from err` preserves the full original traceback (`__cause__`), simplifying root-cause debugging across service boundaries.
- **Weakness — Bare `except:` Anti-pattern** Catching `except:` or `except Exception:` blindly silences `KeyboardInterrupt`, memory errors, and typos, masking critical bugs.

**Interview question**

*Write a function that safely parses a string into an integer, returning a specified default value if conversion fails, without crashing on invalid inputs.*

Wrap `int(value)` inside a `try/except ValueError` block. Catch `(ValueError, TypeError)` so passing `None` or invalid types returns the fallback value cleanly.

**Answer — Safe Integer Parser**

```python
def safe_int(value: any, default: int = 0) -> int:
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

# Test cases
assert safe_int("42") == 42
assert safe_int("-10") == -10
assert safe_int("abc", default=-1) == -1
assert safe_int(None, default=0) == 0
assert safe_int([1, 2, 3], default=100) == 100
print("Safe integer parser passed!")
```

> **Key idea**
>
> Never write a bare `except: pass` or `except Exception: pass`. Always catch the specific exception class you expect and know how to handle.
---

<a id="unit-4"></a>

## Unit 4 — Pythonic Data Modeling & OOP

Structured object design: class mechanics and property descriptors, modern `@dataclass` state modeling, memory-efficient lazy streams via generators, and behavior extension with decorators.

<a id="13-classes-and-object-oriented-basics"></a>

## 13. Classes & Object-Oriented Basics

- **Method Dispatch** `Explicit self parameter` <!-- great -->
- **Class vs Instance** `Class vars shared; instance vars per-object` <!-- great -->
- **Encapsulation Standard** `@property getters and setters` <!-- good -->

In Python, everything is an object, and classes are instances of `type`. When an instance method is called (`obj.method(arg)`), Python automatically transforms the invocation into `Class.method(obj, arg)`, passing the instance explicitly as the first argument, conventionally named `self`. Python supports single and multiple inheritance, method resolution order (MRO via the C3 linearization algorithm), and encapsulation via `@property` descriptors.

> **Analogy** 🎬
>
> **Picture it — Architectural Blueprint vs Constructed Homes**
>
> A class is an architectural blueprint. An instance is an actual physical house built from that blueprint. A class variable (like `neighborhood_name = "Sunset Ridge"`) is a signpost planted at the subdivision entrance—every homeowner shares the exact same sign. An instance variable (like `self.wall_color = "blue"`) is painted exclusively inside that specific home.

Method types and patterns:
1. Instance method: Receives `self`; operates on specific instance state
2. `@classmethod`: Receives `cls`; commonly used as alternative constructors (e.g. `from_dict()`, `from_json()`)
3. `@staticmethod`: Receives neither `self` nor `cls`; acts as a plain function placed inside the class namespace
4. `@property` and `@prop.setter`: Transparent attribute access with validation logic behind the scenes
5. Inheritance and `super()`: Invokes parent class methods cleanly without hardcoding base class names

```python
class BankAccount:
    interest_rate: float = 0.05  # Class variable shared across all accounts

    def __init__(self, owner: str, initial_balance: float = 0.0):
        self.owner = owner
        self._balance = max(0.0, initial_balance)  # Protected instance variable

    @property
    def balance(self) -> float:
        """Transparent getter for account balance."""
        return self._balance

    @balance.setter
    def balance(self, value: float) -> None:
        if value < 0:
            raise ValueError("Balance cannot be negative.")
        self._balance = value

    @classmethod
    def from_csv_line(cls, csv_text: str):
        """Alternative constructor parsing a CSV record."""
        owner, balance_str = csv_text.strip().split(",")
        return cls(owner.strip(), float(balance_str.strip()))

    @staticmethod
    def is_valid_account_number(acc_no: str) -> bool:
        return len(acc_no) == 10 and acc_no.isdigit()

# Testing class mechanics
acc = BankAccount.from_csv_line("Alice Smith, 1250.75")
print(f"Owner: {acc.owner} | Balance: ${acc.balance:.2f}")  # Uses @property getter
acc.balance = 1500.0  # Uses @balance.setter
print(f"Account check: {BankAccount.is_valid_account_number('1234567890')}")
```

- **Strength — Clean Alternative Constructors** `@classmethod` enables readable factory methods without bloating `__init__` with branching type checks.
- **Weakness — Accidental Class Variable Mutation** Reassigning `self.class_var = new_val` creates a shadow instance variable rather than updating the shared class variable.

**Interview question**

*Design a class representing an LRU Cache with `get(key)` and `put(key, value)` running in $O(1)$ average time using Python's standard library.*

Use `collections.OrderedDict`. In `get(key)`: if present, call `self.move_to_end(key)` and return value. In `put(key, value)`: if key exists, update and move to end; if new and capacity exceeded, call `self.popitem(last=False)` to evict the oldest item.

**Answer — LRU Cache via OrderedDict**

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)  # FIFO eviction of oldest

# Test cases
lru = LRUCache(2)
lru.put(1, 1)
lru.put(2, 2)
assert lru.get(1) == 1      # Cache state: [2, 1]
lru.put(3, 3)               # Evicts key 2! Cache state: [1, 3]
assert lru.get(2) == -1     # 2 was evicted
assert lru.get(3) == 3
print("LRU Cache passed in O(1)!")
```

> **Key idea**
>
> In Python, prefixing an attribute with a single underscore `_attr` signals internal use by convention. A double underscore `__attr` invokes name mangling (`_ClassName__attr`) to prevent subclass accidental collisions, not for security.

---

<a id="14-dataclasses-and-modern-structs"></a>

## 14. Dataclasses & Modern Structs

- **Standard Library** `dataclasses module (PEP 557)` <!-- great -->
- **Boilerplate Reduction** `Auto __init__, __repr__, __eq__` <!-- great -->
- **Immutability & Hashing** `frozen=True` <!-- good -->

Python 3.7 introduced `@dataclass`, eliminating verbose boilerplate when writing classes whose primary responsibility is storing data attributes. By annotating fields with type hints, Python automatically generates `__init__()`, readable `__repr__()`, and structural equality `__eq__()`. Setting `frozen=True` creates immutable data classes that automatically implement `__hash__()`, allowing them to be used as dictionary keys and set elements.

> **Analogy** 🎬
>
> **Picture it — A Printed ID Badge Form**
>
> Writing a standard Python class for data is like hand-drawing an ID badge from scratch: drawing borders, cutting paper, and rewriting the wearer's name five times. `@dataclass` is a pre-printed corporate ID template: you list the fields (`name: str`, `badge_id: int`), and the press automatically generates the laminated card, photo frame, and magnetic strip.

Key dataclass capabilities:
1. Automatic equality: Compares instances by field values, not memory addresses
2. Default values and factories: `field(default_factory=list)` prevents shared mutable defaults
3. `frozen=True`: Enforces read-only fields and enables hashing
4. Conversion helpers: `dataclasses.asdict(instance)` and `dataclasses.astuple(instance)`
5. Post-initialization validation: `def __post_init__(self):` runs after `__init__`
6. `kw_only=True` (Python 3.10+): Forces keyword-only arguments when instantiating

```python
from dataclasses import dataclass, field, asdict
from typing import Optional

@dataclass(frozen=True)
class APIEndpoint:
    path: str
    method: str = "GET"
    requires_auth: bool = True
    rate_limit: int = 100

@dataclass
class ServiceHealth:
    service_name: str
    status: str
    latency_ms: float
    tags: list[str] = field(default_factory=list)
    incident_id: Optional[str] = None

    def __post_init__(self):
        if self.latency_ms < 0:
            raise ValueError("Latency cannot be negative.")

# Immutable endpoint can be used as a set element or dictionary key
ep1 = APIEndpoint("/api/v1/users")
ep2 = APIEndpoint("/api/v1/users")
endpoint_set = {ep1, ep2}
print(f"Set size: {len(endpoint_set)}")  # 1 (deduplicated via automatic __hash__ and __eq__!)

# Service health with dynamic default factory
health = ServiceHealth("AuthService", "healthy", 14.2, tags=["core", "prod"])
health_dict = asdict(health)
print(health_dict["tags"])  # ['core', 'prod']
```

- **Strength — Eliminates Duplication** Replaces 30+ lines of repetitive `__init__`, `__repr__`, and `__eq__` implementations with 5 clean, typed declarations.
- **Weakness — Default Mutable Trap** Writing `tags: list = []` in a dataclass raises a `ValueError` at class creation; you must use `field(default_factory=list)`.

**Interview question**

*Design an immutable, hashable GeoCoordinate dataclass representing a latitude/longitude pair that validates that latitude is between -90 and 90 and longitude is between -180 and 180.*

Use `@dataclass(frozen=True)` and implement `__post_init__()`. Because frozen dataclasses prevent direct attribute assignment `self.lat = ...`, use `object.__setattr__(self, 'lat', value)` inside `__post_init__()` or perform validation checks before assignment.

**Answer — Validated Immutable GeoCoordinate**

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class GeoCoordinate:
    latitude: float
    longitude: float

    def __post_init__(self):
        if not (-90.0 <= self.latitude <= 90.0):
            raise ValueError(f"Invalid latitude: {self.latitude}. Must be between -90 and 90.")
        if not (-180.0 <= self.longitude <= 180.0):
            raise ValueError(f"Invalid longitude: {self.longitude}. Must be between -180 and 180.")

# Test cases
point = GeoCoordinate(37.7749, -122.4194)
assert point.latitude == 37.7749

# Test hashability in dictionary
places = {point: "San Francisco"}
assert places[GeoCoordinate(37.7749, -122.4194)] == "San Francisco"

# Test validation
try:
    GeoCoordinate(120.0, 50.0)
    assert False, "Should have raised ValueError"
except ValueError:
    pass
print("GeoCoordinate dataclass passed!")
```

> **Key idea**
>
> Prefer dataclasses over tuples or dictionaries for structured domain objects; they offer auto-complete, strict typing, and readable representations with zero extra runtime cost.

---

<a id="15-iterators-and-generators"></a>

## 15. Iterators & Generators

- **Memory Usage** `O(1) streaming / lazy evaluation` <!-- great -->
- **Protocol** `__iter__() and __next__() returning values or StopIteration` <!-- great -->
- **Generator Syntax** `yield keyword or (x for x in ...)` <!-- good -->

An iterable is any object that can return an iterator (implements `__iter__()`). An iterator is a stateful stream producer implementing `__next__()`, yielding values sequentially until it raises `StopIteration`. A generator is a special function that uses the `yield` keyword to pause execution, saving its stack frame and local variables, and resuming immediately when `next()` is called again. Generators process arbitrarily large or infinite datasets with $O(1)$ memory consumption.

> **Analogy** 🎬
>
> **Picture it — A Water Reservoir vs A Flowing Tap**
>
> A list is a massive water reservoir: to inspect 10 million integers, you must fill an Olympic swimming pool of RAM all at once before touching a single byte. A generator is a kitchen water tap: turn the handle (`next()`), and a single glass of water flows out. When you stop, zero water sits wasted in holding tanks.

Core generator mechanisms:
1. Generator function: Contains `yield`; calling it returns a generator iterator immediately without running the body
2. Generator expression: `(x * 2 for x in huge_sequence)` produces a lazy generator
3. `next(gen, default)`: Advances generator by one step, with optional default fallback
4. Generator pipelines: Chaining multiple generator functions into a memory-efficient transformation pipeline
5. `itertools.islice`: Slices an iterator lazily without converting it into a list
6. `yield from sub_iterable`: Delegated iteration forwarding values and exceptions directly

```python
# Streaming large sequences with O(1) memory
def fibonacci_sequence(limit: int):
    """Yields Fibonacci numbers up to limit without creating a list."""
    a, b = 0, 1
    while a <= limit:
        yield a
        a, b = b, a + b

# Consuming on demand
fib_stream = fibonacci_sequence(100)
first_three = [next(fib_stream) for _ in range(3)]
print(first_three)  # [0, 1, 1]

# Generator expressions vs List comprehensions
import sys
list_mem = sys.getsizeof([x * 2 for x in range(100_000)])
gen_mem = sys.getsizeof((x * 2 for x in range(100_000)))
print(f"List: {list_mem} bytes | Generator: {gen_mem} bytes")
# List: ~800,000+ bytes | Generator: ~100-200 bytes!

# Pipelining generators
def filter_even(stream):
    for num in stream:
        if num % 2 == 0:
            yield num

def square(stream):
    for num in stream:
        yield num ** 2

pipeline = square(filter_even(range(10)))
print(list(pipeline))  # [0, 4, 16, 36, 64]
```

- **Strength — Constant O(1) Memory Footprint** Stream gigabytes of log files or continuous event queues without exceeding server memory limits.
- **Weakness — Single-Pass Exhaustion** Generators are one-way streams: once exhausted, they cannot be rewound, sliced by index, or iterated a second time.

**Interview question**

*Implement a generator function `chunked(iterable, n)` that takes any iterable and yields successive tuples of length $n$, with the final chunk containing any leftover items.*

Iterate through the incoming iterable using an internal chunk accumulator list. Each time the list reaches size $n$, yield `tuple(chunk)` and reset the accumulator. After the loop terminates, yield any non-empty leftover chunk.

**Answer — Chunked Iterator**

```python
from typing import Iterable, Generator, Any

def chunked(iterable: Iterable[Any], n: int) -> Generator[tuple, None, None]:
    if n <= 0:
        raise ValueError("Chunk size must be positive.")
    chunk = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) == n:
            yield tuple(chunk)
            chunk = []
    if chunk:
        yield tuple(chunk)

# Test cases
items = range(10)
chunks = list(chunked(items, 3))
assert chunks == [(0, 1, 2), (3, 4, 5), (6, 7, 8), (9,)]
assert list(chunked([], 3)) == []
print("Chunked generator passed!")
```

> **Key idea**
>
> If you only need to iterate over a collection once (such as passing items to `sum()`, `any()`, `all()`, or `min()`), always use a generator expression without square brackets: `sum(x for x in data)` rather than `sum([x for x in data])`.

---

<a id="16-decorators-and-function-wrappers"></a>

## 16. Decorators & Function Wrappers

- **Core Concept** `Higher-order function taking and returning callables` <!-- great -->
- **Metadata Preservation** `@functools.wraps(func)` <!-- great -->
- **Standard Library Cache** `@functools.lru_cache(maxsize=128)` <!-- good -->

A decorator is a callable that accepts another function as an argument, extends or modifies its behavior, and returns a replacement callable. Writing `@my_decorator` above a function definition is syntactic sugar for `func = my_decorator(func)`. Decorators are universally used in production for authentication checks, input validation, execution timing, rate limiting, and memoization.

> **Analogy** 🎬
>
> **Picture it — A Security Checkpoint at an Office Building**
>
> Imagine a conference room where an executive holds meetings (`my_function`). Rather than rebuilding the executive's brain to check badges and log timestamps, a security checkpoint (`decorator`) is placed right outside the doorway. The guard checks incoming visitors (`args`, `kwargs`), stamps the sign-in book (`logs`), lets them enter the room, and records departure times (`metrics`).

Key decorator patterns:
1. Basic wrapper pattern: `def decorator(func): ... return wrapper`
2. Metadata preservation: Always apply `@functools.wraps(func)` on the inner wrapper to preserve `__name__` and `__doc__`
3. Decorators with arguments: Requires three nested functions (`def repeat(num): def decorator(func): def wrapper(*args): ...`)
4. Built-in memoization: `@functools.lru_cache(maxsize=None)` caches function results based on arguments
5. Class decorators: Decorating an entire class to inject attributes or register instances

```python
import functools
import time

def timing_decorator(func):
    """Measures and logs function execution time."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start_time
        print(f"[TIMING] {func.__name__} completed in {duration:.6f}s")
        return result
    return wrapper

@timing_decorator
def compute_heavy_task(n: int) -> int:
    """Calculates sum of squares."""
    return sum(i * i for i in range(n))

print(compute_heavy_task(100_000))
print(f"Function name is preserved: {compute_heavy_task.__name__}") # compute_heavy_task

# Built-in memoization with lru_cache
@functools.lru_cache(maxsize=128)
def fib_memoized(n: int) -> int:
    if n < 2:
        return n
    return fib_memoized(n - 1) + fib_memoized(n - 2)

print(f"Fib(50) = {fib_memoized(50)}")  # Instantaneous O(N) evaluation instead of exponential O(2^N)!
```

- **Strength — Clean Cross-Cutting Concerns** Eliminates copy-pasted logging, authentication, and retry logic from core business algorithms.
- **Weakness — Forgetting `@wraps`** Omitting `@functools.wraps(func)` overrides the decorated function's `__name__` to `'wrapper'`, breaking introspection, logging, and documentation tools.

**Interview question**

*Write a decorator `@retry(max_attempts=3, delay=0.1)` that retries a failed function up to `max_attempts` times if an exception is raised, sleeping for `delay` seconds between attempts.*

Construct a decorator factory accepting `max_attempts` and `delay`. Return a decorator that wraps the target function with a loop catching exceptions and sleeping until attempts are exhausted.

**Answer — Configurable Retry Decorator**

```python
import functools
import time

def retry(max_attempts: int = 3, delay: float = 0.05):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_err = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as err:
                    last_err = err
                    if attempt < max_attempts:
                        time.sleep(delay)
            raise last_err
        return wrapper
    return decorator

# Test cases
call_count = 0

@retry(max_attempts=3, delay=0.01)
def unstable_network_call():
    global call_count
    call_count += 1
    if call_count < 3:
        raise ConnectionError("Network timeout")
    return "Connected!"

assert unstable_network_call() == "Connected!"
assert call_count == 3
print("Retry decorator passed!")
```

> **Key idea**
>
> If a decorator takes arguments (e.g. `@retry(max_attempts=3)`), you are calling a decorator factory that returns the actual decorator function, requiring 3 levels of nested functions.
---

<a id="unit-5"></a>

## Unit 5 — Practical Everyday Utilities & Gotchas

Production utilities: robust file operations and `pathlib`, JSON serialization, indispensable standard library modules (`collections`, `datetime`, `re`), and the top gotchas every Python developer must recognize and avoid.

<a id="17-file-io-and-pathlib"></a>

## 17. File I/O & Pathlib

- **File Resource Management** `with open(...) context manager` <!-- great -->
- **Object-Oriented Paths** `pathlib.Path (cross-platform / operator)` <!-- great -->
- **Encoding Default** `Explicit encoding="utf-8" mandatory` <!-- good -->

Handling files in Python should always use the `with` statement (context manager). When execution exits the `with` block, Python guarantees that the file descriptor is closed and OS buffers are flushed, even if an unhandled exception or early `return` interrupts execution. Modern Python replaces older string-based `os.path` operations with the object-oriented `pathlib.Path` library.

> **Analogy** 🎬
>
> **Picture it — A Revolving Bank Vault Door**
>
> Using raw `f = open()` without `with` is like walking into a bank vault and hoping you remember to lock the steel door on your way out. If you get distracted or slip (`exception`), the vault stays wide open, leaking file descriptors. A `with open()` block is a timed revolving airlock: stepping into the room unlocks the vault; the instant you leave the doorway for any reason, magnetic locks snap shut automatically.

Essential file and path patterns:
1. Safe reading: `with open("data.txt", "r", encoding="utf-8") as f:`
2. Streaming lines: `for line in f:` reads one line at a time with $O(1)$ memory
3. Pathlib creation and composition: `path = Path.cwd() / "logs" / "app.log"`
4. Direct path reads/writes: `path.read_text(encoding="utf-8")` and `path.write_text(content)`
5. Pattern searching: `for file in Path("src").glob("**/*.py"):`
6. File inspection: `path.exists()`, `path.is_file()`, `path.stem`, `path.suffix`

```python
from pathlib import Path
import tempfile

# Working with pathlib.Path
temp_dir = Path(tempfile.gettempdir())
test_file = temp_dir / "quick_sample.txt"

# Modern atomic write and read
test_file.write_text("Hello TechToday\nSecond line of text\n", encoding="utf-8")
print(f"File exists: {test_file.exists()}")
print(f"File size: {test_file.stat().st_size} bytes")

# Line-by-line streaming through context manager
with test_file.open("r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, start=1):
        print(f"L{line_num}: {line.strip()}")

# Cleanup
test_file.unlink()
```

- **Strength — Clean Cross-Platform Paths** `pathlib.Path` seamlessly abstracts slash directions between Windows (`\`) and POSIX (`/`), eliminating brittle string concatenation bugs.
- **Weakness — Implicit OS Encoding Trap** Omitting `encoding="utf-8"` defaults to Windows-1252 on some Windows machines, causing random `UnicodeDecodeError` crashes in production.

**Interview question**

*Write a function that counts the total number of words across all `.log` files in a given directory and its subdirectories using `pathlib`.*

Use `Path(dir_path).rglob("*.log")` to recursively find all matching log files. Open each file with `encoding="utf-8"`, iterate through each line, and sum the number of words using `len(line.split())`.

**Answer — Recursive Word Count via Pathlib**

```python
from pathlib import Path

def count_words_in_logs(directory_path: str) -> int:
    target_dir = Path(directory_path)
    if not target_dir.is_dir():
        return 0

    total_words = 0
    for log_file in target_dir.rglob("*.log"):
        if log_file.is_file():
            with log_file.open("r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    total_words += len(line.split())
    return total_words

# Test using a temporary directory
import tempfile
with tempfile.TemporaryDirectory() as tmp_dir:
    d = Path(tmp_dir)
    (d / "a.log").write_text("one two three", encoding="utf-8")
    sub = d / "nested"
    sub.mkdir()
    (sub / "b.log").write_text("four five", encoding="utf-8")
    (d / "ignore.txt").write_text("should not count", encoding="utf-8")

    assert count_words_in_logs(tmp_dir) == 5
print("Recursive log word count passed!")
```

> **Key idea**
>
> Always specify `encoding="utf-8"` explicitly when opening text files in Python. Never rely on the operating system's default encoding.

---

<a id="18-json-parsing-and-serialization"></a>

## 18. JSON Parsing & Serialization

- **String Conversion** `json.dumps() / json.loads()` <!-- great -->
- **File Streaming** `json.dump() / json.load()` <!-- great -->
- **Type Compatibility** `dict, list, str, int, float, bool, None` <!-- good -->

Python's built-in `json` module provides standard serialization and deserialization between Python data structures and JSON text format. Methods with an **s** suffix (`loads`, `dumps`) operate on in-memory strings, whereas methods without the suffix (`load`, `dump`) stream directly to and from file-like descriptor objects. Types without a direct JSON equivalent (like `datetime.datetime`, `set`, and custom class instances) require a custom serializer function or `default=` parameter.

> **Analogy** 🎬
>
> **Picture it — Flat-Pack Furniture Export**
>
> A living Python object in memory is an assembled bookshelf with dynamic references and methods. Calling `json.dumps()` is taking the bookshelf apart into flat-pack planks and screws labeled with universal instructions (standard JSON text) that any foreign program (browser, Java microservice, Go daemon) can unpack into their own internal furniture.

High-frequency patterns:
1. Parsing JSON strings: `data = json.loads(json_string)`
2. Serializing to formatted JSON: `json.dumps(obj, indent=2, sort_keys=True)`
3. Reading JSON file directly: `with open("config.json") as f: data = json.load(f)`
4. Writing JSON file directly: `with open("out.json", "w") as f: json.dump(data, f, indent=2)`
5. Custom type encoding: `json.dumps(payload, default=str)` converts dates/decimals to strings
6. Handling JSON decoding errors: Catching `json.JSONDecodeError`

```python
import json
from datetime import datetime

payload = {
    "service": "billing-api",
    "version": 2.1,
    "active": True,
    "endpoints": ["/charges", "/refunds"],
    "created_at": datetime(2026, 10, 5, 12, 0, 0),
    "metadata": None
}

# Custom serializer for types like datetime
def custom_json_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

json_text = json.dumps(payload, default=custom_json_serializer, indent=2)
print(json_text)

# Parsing back to Python dictionary
parsed = json.loads(json_text)
print(f"Service: {parsed['service']} | Endpoints: {len(parsed['endpoints'])}")
```

- **Strength — Ubiquitous Standard Data Interchange** Integrated directly into Python's core with high-performance C-accelerated parsers.
- **Weakness — Lossy Type Conversions** In JSON, tuple keys in dictionaries and sets are not supported; JSON keys must be strings, and tuples deserialize into standard lists.

**Interview question**

*Write a function that flattens a nested dictionary into a single-level dictionary where keys are concatenated using dot notation (e.g. `{"user": {"address": {"city": "Boston"}}}` becomes `{"user.address.city": "Boston"}`).*

Use a recursive helper taking the current nested mapping and a parent key prefix. Iterate through items: if the value is a dictionary, recurse with the new prefix; otherwise, assign the value to the flattened output map.

**Answer — Flatten Nested Dictionary**

```python
def flatten_dict(d: dict, parent_key: str = "", sep: str = ".") -> dict:
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else str(k)
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

# Test cases
nested = {
    "service": "auth",
    "db": {
        "host": "localhost",
        "port": 5432
    },
    "flags": {
        "cache": {"enabled": True}
    }
}
flat = flatten_dict(nested)
assert flat["service"] == "auth"
assert flat["db.host"] == "localhost"
assert flat["db.port"] == 5432
assert flat["flags.cache.enabled"] is True
print("Dictionary flattening passed!")
```

> **Key idea**
>
> Remember the naming rule: `load` / `dump` accept file pointers; `loads` / `dumps` accept and return strings (the **s** stands for **s**tring).

---

<a id="19-standard-library-power-tools"></a>

## 19. Standard Library Power Tools

- **collections** `Counter, defaultdict, deque` <!-- great -->
- **itertools** `chain, islice, cycle` <!-- great -->
- **datetime & re** `ISO formatting & regex matching` <!-- good -->

Python's philosophy of "batteries included" means the standard library contains battle-tested, C-accelerated modules for everyday engineering problems. Relying on these tools prevents reinventing data structures from scratch and ensures optimal runtime performance.

> **Analogy** 🎬
>
> **Picture it — A Swiss Army Engineering Toolkit**
>
> Writing custom frequency-counting loops or manually managing queue indices is like carving a screwdriver out of raw wood every time you need to turn a screw. Modules like `collections` and `itertools` are pre-sharpened titanium tools in your belt: reaching for `Counter` or `deque` completes the task in one clean, tested motion.

Indispensable modules:
1. `collections.Counter`: Counts hashable objects with `.most_common(k)` and multiset arithmetic
2. `collections.deque`: Double-ended queue with $O(1)$ appends and pops from both ends (`maxlen` support)
3. `collections.defaultdict`: Hash map that invokes a factory function for missing keys
4. `itertools.chain(*iterables)`: Chains multiple collections into a single continuous stream
5. `datetime.datetime` & `datetime.timedelta`: Date arithmetic, ISO 8601 formatting, and parsing
6. `re.search` and `re.findall`: Regular expression pattern matching with compiled regexes

```python
from collections import Counter, deque, defaultdict
import itertools
from datetime import datetime, timedelta
import re

# 1. Counter for frequency analysis
words = ["python", "go", "python", "rust", "go", "python"]
counts = Counter(words)
print(counts.most_common(2))  # [('python', 3), ('go', 2)]

# 2. Deque for sliding window and queues
dq = deque(maxlen=3)
for i in range(5):
    dq.append(i)
print(list(dq))  # [2, 3, 4] (oldest evicted automatically!)

# 3. Defaultdict for grouping
dept_staff = defaultdict(list)
dept_staff["Engineering"].append("Sarah")
dept_staff["Engineering"].append("Mark")
print(dict(dept_staff))

# 4. Date arithmetic
now = datetime(2026, 10, 5, 12, 0)
deadline = now + timedelta(days=7, hours=4)
print(f"Deadline: {deadline.strftime('%Y-%m-%d %H:%M')}")

# 5. Regular expressions
log_line = "2026-10-05 [ERROR] 503 Service Unavailable in 142ms"
match = re.search(r"\[(\w+)\]\s+(\d+)", log_line)
if match:
    level, code = match.groups()
    print(f"Log Level: {level}, Status: {code}")
```

- **Strength — Zero Dependency Overhead** Standard library modules ship with Python everywhere, require no `pip install`, and carry zero supply-chain security risks.
- **Weakness — Regex Re-compilation Overhead** In tight loops, calling `re.search(pattern, ...)` repeatedly wastes CPU time; compile once using `pattern = re.compile(...)`.

**Interview question**

*Given a non-empty list of integers, return the $k$ most frequent elements in $O(N)$ time.*

Count frequencies using `collections.Counter(nums)`. Then call `counts.most_common(k)` (which uses a min-heap running in $O(N \log k)$), or use bucket sort where index represents frequency to achieve strictly linear $O(N)$ time.

**Answer — Top K Frequent Elements**

```python
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    counts = Counter(nums)
    # most_common(k) extracts top k using a heap
    return [item for item, freq in counts.most_common(k)]

# Test cases
assert top_k_frequent([1, 1, 1, 2, 2, 3], 2) == [1, 2]
assert top_k_frequent([1], 1) == [1]
assert top_k_frequent([4, 4, 4, 6, 6, 9, 9, 9, 9], 2) == [9, 4]
print("Top K frequent passed!")
```

> **Key idea**
>
> When implementing BFS algorithms or fixed-size sliding history buffers, always use `collections.deque` instead of `list`. Popping from index 0 on a `list` is $O(N)$; on a `deque`, it is $O(1)$.

---

<a id="20-high-frequency-pitfalls-and-gotchas"></a>

## 20. High-Frequency Pitfalls & Gotchas

- **Mutable Default Arguments** `def fn(items=[]) shares state across calls` <!-- bad -->
- **Identity vs Equality** `is checks memory address; == checks value` <!-- great -->
- **Late Binding Closures** `Functions bind variable name, not current value` <!-- ok -->

Every Python developer eventually encounters a specific set of language behaviors that produce subtle, difficult-to-trace bugs. Understanding how Python manages references, default parameters, closures, and collection mutability allows you to diagnose and prevent these issues before they reach production.

> **Analogy** 🎬
>
> **Picture it — A Communal Restaurant Order Pad**
>
> Creating a mutable default parameter `def take_order(order=[])` is like a restaurant waiter keeping one single slip of paper for all tables in the restaurant. When Table 1 orders soup, it's written down. When Table 2 arrives and says "I'll take the default order", the waiter hands them the old slip that already has Table 1's soup written on it.

The top high-frequency Python gotchas:
1. Mutable default arguments: Default expressions execute once at function definition time, reusing the identical object across all invocations
2. Equality `==` vs Identity `is`: Small integers (-5 to 256) and short strings are interned, causing `a is b` to succeed unexpectedly for small numbers but fail for larger ones
3. Modifying a list during iteration: Deleting or inserting items shifts remaining elements, causing the iterator to skip items
4. Shallow copy vs deep copy: Slicing `lst[:]` or calling `dict.copy()` copies only the top-level container; nested mutable objects remain shared
5. Late binding in closures: Lambdas inside loops bind the variable name; when called later, they all see the loop's final value
6. Variable shadowing: Naming a variable `list`, `dict`, `str`, or `id` shadows Python's built-in types

```python
# Gotcha 1: The Mutable Default Argument Bug
def bad_append(val, target=[]):
    target.append(val)
    return target

print(bad_append(1))  # [1]
print(bad_append(2))  # [1, 2] - Oops! Reused the old list!

# The Idiomatic Fix:
def good_append(val, target=None):
    if target is None:
        target = []
    target.append(val)
    return target

print(good_append(1))  # [1]
print(good_append(2))  # [2] - Clean, independent list!

# Gotcha 2: Late Binding in Closures
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])  # [2, 2, 2] - All evaluate final i=2!

# The Idiomatic Fix (Default Argument Capture):
fixed_funcs = [lambda i=i: i for i in range(3)]
print([fixed_funcs[0](), fixed_funcs[1](), fixed_funcs[2]()])  # [0, 1, 2]!

# Gotcha 3: Shallow Copy vs Deep Copy
import copy
original = [[1, 2], [3, 4]]
shallow = original[:]
shallow[0].append(999)
print(original[0])  # [1, 2, 999] - Inner list was mutated!

deep = copy.deepcopy(original)
deep[0].append(777)
print(original[0])  # Still [1, 2, 999] (deep copy is fully isolated)
```

- **Strength — Transparent Reference Semantics** Once you master Python's object model and reference semantics, unexpected mutations vanish.
- **Weakness — Implicit Sharing Bugs** Shared mutable state between functions or default parameters creates intermittent bugs that pass unit tests but fail under load.

**Interview question**

*Explain why the following code prints `[2, 2, 2]` instead of `[0, 1, 2]`, and provide two distinct ways to fix it.*

Python closures bind variables by reference (name lookup), not by value. When the loop finishes, the variable `i` in the enclosing scope has value `2`. When the lambdas are executed afterwards, they all look up `i` in that scope and find `2`. Fix 1: Bind `i` at definition time via a default argument `lambda i=i: i`. Fix 2: Use `functools.partial` or a helper factory function that creates a fresh local scope for each value.

**Answer — Fixing Late-Binding Closures**

```python
from functools import partial

# Approach 1: Default argument binding
handlers_1 = [lambda x=i: x for i in range(3)]
assert [h() for h in handlers_1] == [0, 1, 2]

# Approach 2: Helper factory function creating fresh scope
def make_handler(val):
    return lambda: val

handlers_2 = [make_handler(i) for i in range(3)]
assert [h() for h in handlers_2] == [0, 1, 2]

# Approach 3: functools.partial
handlers_3 = [partial(lambda val: val, i) for i in range(3)]
assert [h() for h in handlers_3] == [0, 1, 2]

print("All closure fixes validated successfully!")
```

> **Key idea**
>
> Remember the golden rule of Python functions: never use a mutable object (`[]`, `{}`, `set()`) as a default parameter value. Always use `None` and initialize inside the function body.

---

## Python Quick Reference Summary

A consolidated checklist of high-frequency Python idioms and runtime characteristics:

1. **Variables & Identity:** Variable assignment binds a name to an object reference. Use `==` for value equality, and `is` strictly for singleton identity checks (`is None`).
2. **Strings:** Strings are immutable. Use f-strings for all modern formatting. Use `''.join(parts)` for linear concatenation instead of `+=` in loops.
3. **Lists vs Deques:** `list.append()` and `list.pop()` are $O(1)$ amortized; `list.insert(0)` and `list.pop(0)` are $O(N)$. For queues and sliding windows, always use `collections.deque`.
4. **Dictionaries & Sets:** Lookups, insertions, and deletions run in $O(1)$ average time. Keys must be immutable and hashable.
5. **Comprehensions:** Use list, dict, and set comprehensions for clean, fast transformations. For large or infinite streams, drop the brackets to create a lazy $O(1)$ memory generator expression.
6. **Functions:** Avoid mutable default parameters (`def fn(x=None)`). Enforce clean parameter contracts with keyword-only arguments (`*`).
7. **Classes & Dataclasses:** Use `@dataclass` for data-heavy domain models to automatically generate `__init__`, `__repr__`, and `__eq__`. Use `frozen=True` for hashable records.
8. **Generators & Decorators:** Use `yield` to stream data lazily. Wrap decorators with `@functools.wraps(func)` to preserve function introspection metadata.
9. **Files & Serialization:** Always open files inside a `with` block with explicit `encoding="utf-8"`. Use `pathlib.Path` for cross-platform path handling.
10. **Error Handling:** Follow the EAFP philosophy ("Easier to Ask for Forgiveness than Permission") with specific exception types. Never write bare `except: pass`.

---

© 2026 TechToday. Python Study Library.
