<!--
Source: python-my-course.html
Title: Python My Course | TechToday
Description: Fast-track Python essentials for everyday programming — variables, type hints, keywords, strings, operators, loops, lists, dictionaries, tuples, sets, unpacking & destructuring, comprehensions, functions, async/await, OOP, error handling, modules & imports, and virtual environments.
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="python-my-course"></a>

# Python My Course

The high-yield Python course reference: common everyday syntax, type hints, keywords, core collections, functions, async/await concurrency, practical OOP solutions, error handling, modules & imports, and virtual environments.

<a id="table-of-contents"></a>

## Table of Contents

1. [Variables, Types & Casting](#1-variables-types-and-casting)
2. [Type Hints](#2-type-hints)
3. [Keywords in Python](#3-keywords-in-python)
4. [Everyday String Operations](#4-everyday-string-operations)
5. [Operators, Truthiness & Conditionals](#5-operators-truthiness-and-conditionals)
6. [Loops & Iteration](#6-loops-and-iteration)
7. [Lists & Slicing](#7-lists-and-slicing)
8. [Dictionaries](#8-dictionaries)
9. [Tuples & Sets](#9-tuples-and-sets)
10. [Unpacking & Destructuring](#10-unpacking-and-destructuring)
11. [List Comprehensions](#11-list-comprehensions)
12. [Functions & Arguments](#12-functions-and-arguments)
13. [Async / Await](#13-async-and-await)
14. [Object-Oriented Programming (OOP)](#14-object-oriented-programming)
15. [Everyday Error Handling](#15-everyday-error-handling)
16. [Modules & Imports](#16-modules-and-imports)
17. [Virtual Environments](#17-virtual-environments)

---

<a id="unit-1"></a>

## Unit 1 — Daily Syntax & Logic

The daily syntax: declaring variables, type hints, reserved keywords, strings, operators, truthiness, and loops.

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

<a id="2-type-hints"></a>

## 2. Type Hints

- **Variable & Return Hints** `x: int = 1, def fn() -> str:` <!-- great -->
- **Built-in Generics (3.9+)** `list[str], dict[str, int]` <!-- great -->
- **Union & Optional (3.10+)** `str | None, int | float` <!-- good -->

Python is dynamically typed, but modern Python (PEP 484 and Python 3.9+) supports **type hints** (type annotations). Type hints do not change runtime behavior—Python will not throw an error if types don't match—but they make code self-documenting, provide rich IDE autocomplete, and allow static analysis tools like `mypy` or `pyright` to catch bugs before runtime.

> **Analogy** 🎬
>
> **Picture it — Blueprint Annotations on Plumbing Pipes**
>
> Without type hints, all pipes in a building look identical from the outside; water, gas, or electrical wiring could be routed through any pipe until something leaks or sparks at runtime. Adding type hints is like stenciling labels on the pipes ("Cold Water Only", "Natural Gas", "Max 120V"). The pipes still carry whatever is pumped through them, but inspectors (static type checkers) and technicians (your IDE) immediately catch dangerous mismatches before opening the valve.

Key everyday concepts and syntax:
1. Basic variable annotations: `name: str = "Alice"`, `age: int = 30`, `is_active: bool = True`
2. Function parameter and return types: `def greet(name: str) -> str:` and `def process() -> None:`
3. Built-in generic collections (Python 3.9+): `list[str]`, `dict[str, int]`, `set[int]`, `tuple[str, int]` directly without importing from `typing`
4. Modern Union and Optional syntax (Python 3.10+): `int | float` replaces legacy `Union[int, float]`, and `str | None` replaces `Optional[str]`
5. Specialized types from `typing`: `Any` (opts out of type checking), `Callable[[int], bool]` (function arguments), `Literal["json", "csv"]` (exact allowed values)
6. Type Aliases (Python 3.12+): `type Point = tuple[float, float]` to give meaningful names to complex composite types

```python
from typing import Callable, Any

# 1. Variables and modern built-in generics (Python 3.9+)
user_id: int = 101
tags: list[str] = ["python", "backend"]
metadata: dict[str, Any] = {"version": 1.2, "active": True}

# 2. Modern union and optional syntax (Python 3.10+)
def find_user(user_id: int) -> dict[str, str] | None:
    if user_id == 101:
        return {"name": "Alice", "role": "engineer"}
    return None

# 3. Callable parameter type hints
def apply_operation(values: list[int], operation: Callable[[int], int]) -> list[int]:
    return [operation(x) for x in values]

squared = apply_operation([1, 2, 3], lambda x: x ** 2)
print(squared)  # [1, 4, 9]

user = find_user(101)
if user is not None:
    print(f"Found: {user['name']}")
```

- **Strength — Catch Bugs Early & Instant IDE Autocomplete** Static analysis tools catch `NoneType` errors, wrong argument counts, and invalid types before code runs, while IDEs provide instant auto-completion and safe refactoring.
- **Weakness — No Runtime Validation by Default** Type hints are ignored by Python's runtime interpreter; passing an integer where a string is annotated will not raise an exception unless explicitly checked with `isinstance()` or Pydantic.

**Interview question**

*Write a type-annotated function `parse_record(raw: dict[str, Any]) -> tuple[str, int, float] | None` that safely validates and extracts a user's name (`str`), age (`int`), and account balance (`float`). If any key is missing or conversion fails, return `None`.*

Access required dictionary keys inside a `try / except (KeyError, ValueError, TypeError)` block, cast each field to its expected type, and return the validated tuple. Return `None` if an exception occurs.

**Answer — Validate and Parse Record**

```python
from typing import Any

def parse_record(raw: dict[str, Any]) -> tuple[str, int, float] | None:
    try:
        name = str(raw["name"])
        age = int(raw["age"])
        balance = float(raw["balance"])
        return (name, age, balance)
    except (KeyError, ValueError, TypeError):
        return None

# Test cases
record_ok = {"name": "Charlie", "age": "29", "balance": "150.50"}
parsed = parse_record(record_ok)
assert parsed == ("Charlie", 29, 150.5)

record_bad = {"name": "Bob", "balance": "invalid"}
assert parse_record(record_bad) is None

empty_record = {}
assert parse_record(empty_record) is None
print("Parse record with type hints passed!")
```

> **Key idea**
>
> Type hints do not enforce types at runtime. Use tools like `mypy` or `ruff` in your CI pipeline, and use validation libraries like Pydantic when handling untrusted user input.

---

<a id="3-keywords-in-python"></a>

## 3. Keywords in Python

- **Core Reserved Words** `35 keywords in keyword.kwlist` <!-- great -->
- **Control & Logic** `if, for, while, def, return, and, or` <!-- great -->
- **Inspection & Testing** `import keyword; keyword.iskeyword()` <!-- good -->

Keywords in Python are reserved words that define the language's fundamental syntax, grammar, and control flow. You cannot use keywords as variable names, function names, or identifiers. Python provides 35 keywords that govern literals (`True`, `False`, `None`), conditional branching (`if`, `elif`, `else`), loops (`for`, `while`, `break`, `continue`, `pass`), functions and generators (`def`, `return`, `lambda`, `yield`), logic, identity and membership (`is`, `in`, `not`, `and`, `or`), and error handling (`try`, `except`, `finally`, `raise`).

> **Analogy** 🎬
>
> **Picture it — Traffic Control Signs on City Roads**
>
> Keywords are like official municipal traffic signs: STOP, ONE WAY, DO NOT ENTER, SPEED LIMIT, YIELD. A resident cannot paint their mailbox to look like a STOP sign or use traffic sign words as a street name because the traffic system relies on them having fixed, unambiguous rules. When Python's parser sees `def`, `if`, `while`, or `return`, it knows exactly what grammar rule to enforce without hesitation.

Key everyday keyword categories:
1. **Literals & Singletons (`True`, `False`, `None`):** Capitalized constants representing boolean truth and the absence of a value.
2. **Branching & Decisions (`if`, `elif`, `else`):** Directs program execution based on boolean conditions.
3. **Iteration & Loop Control (`for`, `while`, `break`, `continue`, `pass`):** `for` iterates sequences; `while` loops until a condition fails; `break` exits immediately; `continue` skips to next iteration; `pass` acts as a no-op placeholder.
4. **Functions & Generators (`def`, `return`, `lambda`, `yield`):** `def` defines a function; `return` outputs a result; `lambda` creates an inline anonymous function; `yield` produces values lazily in a generator stream.
5. **Logic, Identity & Membership (`and`, `or`, `not`, `is`, `in`):** Short-circuit logic, object identity checks (`x is None`), and containment tests (`item in sequence`).
6. **Error Handling (`try`, `except`, `finally`, `raise`):** Catches and recovers from exceptions gracefully, guarantees cleanup (`finally`), and raises errors.

```python
import keyword

# 1. Checking reserved keywords dynamically
print(f"Total Python keywords: {len(keyword.kwlist)}")
print(f"Is 'def' a keyword? {keyword.iskeyword('def')}")            # True
print(f"Is 'variable' a keyword? {keyword.iskeyword('variable')}")  # False

# 2. Literals and conditional branching (True, False, None, if, elif, else)
user_status = "active"
is_admin = False
token = None

if user_status == "active" and (is_admin or token is None):
    access = "standard"
elif user_status == "banned":
    access = "denied"
else:
    access = "guest"
print(f"Access granted: {access}")

# 3. Loops, break, continue, and pass (placeholder)
valid_numbers = []
for n in [1, 2, -5, 4, 10]:
    if n < 0:
        continue  # Skip negatives
    if n > 8:
        break     # Stop processing
    valid_numbers.append(n)
print(f"Valid numbers: {valid_numbers}")  # [1, 2, 4]

def placeholder_service():
    pass  # Syntactically valid empty function

# 4. Functions, return, lambda, and yield (generators)
def calculate_tax(amount: float) -> float:
    return amount * 0.08

multiplier = lambda x, factor=2: x * factor
print(f"Tax: {calculate_tax(100):.2f}, Double: {multiplier(5)}")

def stream_batches(items: list, batch_size: int):
    for i in range(0, len(items), batch_size):
        yield items[i:i + batch_size]  # Generates batches lazily

batches = list(stream_batches([1, 2, 3, 4, 5], 2))
print(f"Batches: {batches}")  # [[1, 2], [3, 4], [5]]
```

- **Strength — Compact, Readable Grammar** Python's small keyword vocabulary (only 35 words) reads like structured English, making control flow instantly recognizable.
- **Weakness — SyntaxError on Keyword Identifiers** Attempting to name a variable or JSON key after a keyword (e.g. `class = "math"` or `def = 5`) causes a fatal `SyntaxError`. In such cases, append a trailing underscore by convention (e.g. `class_ = "math"`).

**Interview question**

*Write a function `validate_identifier_name(name: str) -> tuple[bool, str]` that checks if a proposed variable name is valid in Python. Return `(False, "Reserved keyword")` if it matches a Python keyword, `(False, "Invalid identifier syntax")` if it's not a valid Python identifier, and `(True, "Valid identifier")` if it is safe to use.*

Verify the input is a non-empty string, check `keyword.iskeyword(name)`, and verify `name.isidentifier()`.

**Answer — Validate Identifier Name**

```python
import keyword

def validate_identifier_name(name: str) -> tuple[bool, str]:
    if not isinstance(name, str) or not name:
        return (False, "Invalid identifier syntax")
    if keyword.iskeyword(name):
        return (False, "Reserved keyword")
    if not name.isidentifier():
        return (False, "Invalid identifier syntax")
    return (True, "Valid identifier")

# Test cases
assert validate_identifier_name("user_id") == (True, "Valid identifier")
assert validate_identifier_name("total_count") == (True, "Valid identifier")
assert validate_identifier_name("for") == (False, "Reserved keyword")
assert validate_identifier_name("class") == (False, "Reserved keyword")
assert validate_identifier_name("2nd_place") == (False, "Invalid identifier syntax")
assert validate_identifier_name("my-var") == (False, "Invalid identifier syntax")
assert validate_identifier_name("") == (False, "Invalid identifier syntax")
print("Validate identifier name passed!")
```

> **Key idea**
>
> Python has only 35 reserved keywords that cannot be used as variable or function names. Use `keyword.iskeyword(name)` to verify programmatically, and use a trailing underscore (such as `class_` or `type_`) if you must represent a domain concept named after a keyword.

---

<a id="4-everyday-string-operations"></a>

## 4. Everyday String Operations

- **Formatting & Operators** `f"{var}", +, *, in, not in` <!-- great -->
- **Whitespace & Cleaning** `.strip(), .split(), .join()` <!-- great -->
- **Search & Inspection** `.replace(), .startswith(), in` <!-- good -->

Strings are one of the most commonly used data types in Python. Python strings are immutable (they cannot be changed in place; operations return a new string). Formatted string literals (f-strings) are the modern, standard way to embed variables and expressions inside text. Python also provides native string operators like `+` for concatenation, `*` for repetition, and the membership operators `in` and `not in` to test for substrings.

> **Analogy** 🎬
>
> **Picture it — A Template Letter with Fill-in Blanks**
>
> An f-string `f"Hello {name}, your total is ${price:.2f}"` is like a printed letter with blank brackets. Python reads the variables, formats them directly into the blanks, and produces the final letter in a single pass. The `in` operator is like using Ctrl+F on the document to quickly see if a keyword appears anywhere on the page.

Most commonly used string methods and operators:
1. `f"{name}"`: Embeds variable or expression inside text (f-strings)
2. `f"{price:.2f}"`: Formats float with 2 decimal places
3. Membership operators `in` and `not in`: Substring checks (`"@" in email`, `"admin" not in roles`)
4. String operators `+` and `*`: Concatenation (`first + " " + last`) and repetition (`"=" * 30`)
5. Safe identity check: `if text is None:` or `if text is not None:` (never use `text is ""` or `text is "hello"`)
6. `s.strip()`: Trims leading and trailing spaces or newlines
7. `s.split(",")`: Splits a string by delimiter into a list of strings
8. `", ".join(list_of_strings)`: Joins a list of strings into one string
9. `s.lower()` and `s.upper()`: Changes text casing
10. `s.replace(old, new)`: Replaces occurrences of a substring
11. `s.startswith(prefix)` and `s.endswith(suffix)`: Checks prefix or suffix

```python
# 1. Modern f-strings and string operators (+, *)
product = "Coffee Mug"
price = 12.994
print(f"Item: {product} | Cost: ${price:.2f}")  # Item: Coffee Mug | Cost: $12.99

divider = "=" * 30
header = "[ " + product.upper() + " ]"
print(f"{header}
{divider}")

# 2. Membership operators (in and not in)
user_email = "alex@company.com"
if "@" in user_email and "." in user_email:
    print("Valid email structure.")

if "admin" not in user_email:
    print("Standard user account.")

# 3. Cleaning user inputs
raw_email = "   Alex@Company.COM \n"
clean_email = raw_email.strip().lower()
print(clean_email)  # alex@company.com

# 4. Splitting and joining
csv_row = "laptop,electronics,999"
parts = csv_row.split(",")
print(parts)  # ['laptop', 'electronics', '999']

joined = " -> ".join(parts)
print(joined)  # laptop -> electronics -> 999

# 5. Safe None check vs value equality
user_input = None
if user_input is None:
    print("No input provided.")

# Value equality vs identity
status = "active"
print(status == "active")  # True (always use == for string comparisons)
```

- **Strength — Clean F-strings & Native Operators** F-strings and operators like `in`, `+`, and `*` make text formatting, substring search, and visual dividers clean and readable without helper functions.
- **Weakness — Passing None to String Methods** Calling `.strip()` or `.lower()` on a variable that happens to be `None` throws an `AttributeError`. Always check `if val is not None:` first.

**Interview question**

*Write a function that normalizes a full name by removing extra spaces and capitalizing each word.*

Use `s.split()` to automatically split words by any amount of consecutive whitespace, title-case each word with `.capitalize()`, and re-join with a single space.

**Answer — Normalize Name**

```python
def normalize_name(raw_name: str) -> str:
    if raw_name is None:
        return ""
    words = raw_name.split()
    return " ".join(w.capitalize() for w in words)

# Test cases
assert normalize_name("  alex   MORGAN  ") == "Alex Morgan"
assert normalize_name("john") == "John"
assert normalize_name("   ") == ""
assert normalize_name(None) == ""
print("Normalize name passed!")
```

> **Key idea**
>
> Use the `in` and `not in` operators for fast substring membership checks (`"@" in email`). When checking whether a string variable is missing, always check `if s is None:`. For comparing string values, always use `==` and `!=` (never `is` or `is not`).

---

<a id="5-operators-truthiness-and-conditionals"></a>

## 5. Operators, Truthiness & Conditionals

- **Division & Remainder** `/, //, %, divmod()` <!-- great -->
- **Identity & Membership** `is, is not, in, not in` <!-- great -->
- **Logic & Chaining** `and, or, not, 18 <= age < 65` <!-- good -->

Python features rich, expressive operators across several key categories:
- **True Division (`/`), Floor Division (`//`), and Modulo (`%`):** `/` always produces a floating-point result (`10 / 2 == 5.0`). `//` divides and truncates down towards negative infinity (`7 // 2 == 3`). `%` computes the integer remainder (`7 % 2 == 1`).
- **Identity operators (`is`, `is not`):** Test if two variables point to the exact same object in memory (`id(a) == id(b)`).
- **Membership operators (`in`, `not in`):** Test whether an item exists inside a sequence or collection (strings, lists, tuples, sets, dictionaries).
- **Comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`):** Compare values, including Python's intuitive comparison chaining (`18 <= age < 65`).
- **Logical operators (`and`, `or`, `not`):** Combine boolean conditions with short-circuit evaluation.
- **Assignment expressions (Walrus `:=`):** Assign a variable inline within an expression.

Every object in Python also has an innate truth value: empty collections (`[]`, `""`, `{}`), `0`, and `None` evaluate to `False`; populated collections and non-zero numbers evaluate to `True`.

> **Analogy** 🎬
>
> **Picture it — Checking ID Badges vs Checking Outfits**
>
> The equality operator `==` is like checking if two people are wearing identical outfits: if both shirts and shoes match, `a == b` is `True`. The identity operator `is` is like checking their government ID numbers: even if identical twins wear the exact same clothes, they are two separate people in memory (`a is b` is `False`). You only use `is` when checking if two references point to the exact same unique individual in memory (most notably `x is None`).

Key everyday operators and patterns:
1. **True division (`/`):** Always returns a float, even with evenly divisible integers (e.g. `10 / 2 == 5.0`, `7 / 2 == 3.5`).
2. **Floor division (`//`):** Divides and rounds down to the nearest integer floor (e.g. `7 // 2 == 3`, `10 // 3 == 3`, `-7 // 2 == -4`). Ideal for pagination calculations: `total_pages = (total_items + per_page - 1) // per_page`.
3. **Modulo remainder (`%`):** Returns the remainder after integer division (e.g. `7 % 2 == 1`, `10 % 3 == 1`). Common for checking even/odd (`n % 2 == 0`) and wrapping circular array indices (`(idx + 1) % len(items)`).
4. **Combined quotient and remainder (`divmod(a, b)`):** Returns a tuple `(a // b, a % b)` in a single operation. Perfect for time unit conversions (`mins, secs = divmod(total_seconds, 60)`).
5. **Identity operators (`is`, `is not`):** Tests exact object identity (`id(a) == id(b)`). Always use `is None` and `is not None` to test for `None`.
6. **Identity vs Equality (`is` vs `==`):** `==` checks value equality; `is` checks memory address. Two lists `[1, 2] == [1, 2]` are equal (`True`), but `[1, 2] is [1, 2]` is `False`.
7. **Membership operators (`in`, `not in`):** Tests if an item exists inside a container (`"admin" in roles`, `404 not in status_codes`, `"username" in user_dict`).
8. **Chained comparisons:** Python evaluates chained inequalities naturally: `18 <= age < 65` (evaluates `age >= 18 and age < 65` with single evaluation).
9. **Logical short-circuiting:** `and` stops at the first falsy operand; `or` stops at the first truthy operand and returns that value.
10. **Emptiness checking:** `if not items:` (clean and Pythonic, no need for `len(items) == 0`).
11. **Exponentiation (`**`):** `2 ** 8 == 256` (power operator).
12. **Inline ternary conditional:** `status = "Approved" if score >= 70 else "Rejected"`.
13. **Walrus operator (`:=`):** Assigns a variable inline within an expression, e.g. `if (n := len(data)) > 0:`.

```python
# 1. Division (/), Floor Division (//), and Modulo (%)
print(10 / 2)     # 5.0 (True division ALWAYS returns a float)
print(7 / 2)      # 3.5
print(7 // 2)     # 3   (Floor division truncates towards -infinity)
print(10 // 3)    # 3
print(-7 // 2)    # -4  (Rounds DOWN to -4, not -3!)

# Modulo operator (%)
print(7 % 2)      # 1   (Remainder)
print(12 % 4)     # 0   (Evenly divisible)

# Practical 1: Pagination calculation with floor division
total_records = 23
per_page = 5
total_pages = (total_records + per_page - 1) // per_page
print(f"Total pages needed: {total_pages}")  # 5

# Practical 2: Converting seconds into minutes and seconds
total_seconds = 145
minutes = total_seconds // 60   # 2 minutes
seconds = total_seconds % 60    # 25 seconds
print(f"Formatted time: {minutes}m {seconds}s")  # 2m 25s

# Bonus: divmod() computes quotient and remainder together
mins, secs = divmod(total_seconds, 60)
assert (mins, secs) == (2, 25)

# Practical 3: Circular index wrapping
total_slides = 5
for current_slide in range(5):
    next_slide = (current_slide + 1) % total_slides
    # Wraps: 0->1, 1->2, 2->3, 3->4, 4->0

# 2. Identity operators (is, is not) vs Equality (==, !=)
list_a = [1, 2, 3]
list_b = [1, 2, 3]
list_c = list_a

print(list_a == list_b)  # True (same values)
print(list_a is list_b)  # False (different objects in memory)
print(list_a is list_c)  # True (exact same object)

# Checking None safely
current_user = None
if current_user is None:
    print("User is not logged in.")

# 3. Membership operators (in, not in)
allowed_roles = {"admin", "editor", "moderator"}
if "editor" in allowed_roles:
    print("Authorized.")

blocked_ips = ["192.168.1.10", "10.0.0.99"]
if "172.16.0.1" not in blocked_ips:
    print("IP connection allowed.")

# 4. Chained comparisons
user_age = 28
if 18 <= user_age < 65:
    print("Working adult tier.")

# 5. Ternary conditional and Walrus operator (:=)
score = 82
result = "Pass" if score >= 60 else "Fail"

payload = "sensor_alpha_online"
if (length := len(payload)) > 10:
    print(f"Payload accepted with {length} characters.")
```

- **Strength — Rich Mathematical & Expressive Operators** The distinction between `/` (float) and `//` (integer floor), combined with `%` and `divmod()`, makes arithmetic, pagination, and circular indexing explicit and concise.
- **Weakness — Confusing is with ==** Using `is` for value equality (`if name is "alice":`) is dangerous because Python string and integer caching creates subtle, intermittent bugs that fail unpredictably.

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
> Remember the three division operators: `/` always returns a float (`7 / 2 == 3.5`), `//` performs floor division (`7 // 2 == 3`), and `%` returns the remainder (`7 % 2 == 1`). Use `divmod(a, b)` when you need both quotient and remainder. For object identity, use `is` and `is not` only with singletons like `None`. Use `in` and `not in` for clean membership testing.

---

<a id="6-loops-and-iteration"></a>

## 6. Loops & Iteration

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

### Understanding `range()` in Depth

In Python, `range()` generates an immutable arithmetic sequence of integers on demand. Rather than creating and storing an entire list of numbers in memory, `range` is an immutable sequence type that produces each number lazily when requested by the loop.

Key features and signatures of `range()`:
1. **Single Argument `range(stop)`:** Generates numbers from `0` up to `stop - 1`. For example, `range(5)` yields `0, 1, 2, 3, 4`.
2. **Two Arguments `range(start, stop)`:** Generates numbers starting from `start` up to `stop - 1` (a half-open interval `[start, stop)`). For example, `range(2, 6)` yields `2, 3, 4, 5`.
3. **Three Arguments `range(start, stop, step)`:** Increments by `step` on each iteration. For example, `range(0, 10, 2)` produces even numbers `0, 2, 4, 6, 8`.
4. **Negative Step (Counting Down):** If `step` is negative, `range()` counts backwards (provided `start > stop`). For example, `range(5, 0, -1)` yields `5, 4, 3, 2, 1`.
5. **Lazy Evaluation & $O(1)$ Memory:** `range()` stores only the `start`, `stop`, and `step` values. Because numbers are calculated on the fly, `range(1_000_000_000)` consumes the same tiny, constant memory ($O(1)$ space, ~48 bytes) as `range(5)`.
6. **Converting to a List:** Because `range` computes values lazily, `print(range(5))` displays `range(0, 5)`. To materialize the numbers into an explicit list, pass it to `list(range(5))` which produces `[0, 1, 2, 3, 4]`.
7. **Fast $O(1)$ Membership Testing:** Checking `x in range(...)` runs in $O(1)$ constant time because Python checks bounds and step divisibility with arithmetic instead of scanning elements sequentially.

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

# range() forms:
# 1. Single argument: stop [0, 5)
for i in range(3):
    print(f"Step {i}")  # 0, 1, 2

# 2. Two arguments: start and stop [2, 6)
for i in range(2, 6):
    print(f"Offset {i}")  # 2, 3, 4, 5

# 3. Three arguments: start, stop, step
evens = list(range(0, 10, 2))
print(f"Evens: {evens}")  # [0, 2, 4, 6, 8]

# 4. Counting backwards with negative step
countdown = list(range(3, 0, -1))
print(f"Countdown: {countdown}")  # [3, 2, 1]

# 5. O(1) membership check
print(50 in range(0, 100, 5))  # True (instant arithmetic check)

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

- **Strength — Clean Syntax & O(1) Memory** Direct iteration prevents off-by-one errors, while `range()` generates sequences of any size without allocating memory for elements upfront.
- **Weakness — Modifying While Looping & Exclusive Stop** Removing items from a list while iterating over it skips elements. In `range(start, stop)`, remember that `stop` is exclusive (`range(1, 5)` stops at 4).

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
> Avoid writing `for i in range(len(items)): items[i]`. Instead, use `for item in items:` or `for i, item in enumerate(items):`. When you do need numeric sequences, `range(start, stop, step)` generates them with $O(1)$ memory. Remember that `stop` is exclusive: `range(1, 5)` generates 1, 2, 3, 4 (not 5).

---

<a id="unit-2"></a>

## Unit 2 — Core Data Collections

The primary data structures used every day: ordered lists, fast key-value dictionaries, unique sets, and readable list comprehensions.

<a id="7-lists-and-slicing"></a>

## 7. Lists & Slicing

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

<a id="8-dictionaries"></a>

## 8. Dictionaries

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

<a id="9-tuples-and-sets"></a>

## 9. Tuples & Sets

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

<a id="10-unpacking-and-destructuring"></a>

## 10. Unpacking & Destructuring

- **Multiple Assignment** `a, b = [10, 20]` <!-- great -->
- **Starred Unpacking** `first, *rest = items` <!-- great -->
- **Dict Merging** `{**defaults, **custom}` <!-- good -->

Unpacking (often called destructuring) allows you to extract elements from iterables (tuples, lists, dictionaries, or strings) and assign them directly to multiple variables in a single, clean statement. Python inspects the shape of the data on the right and distributes each element to the corresponding variable on the left.

> **Analogy** 🎬
>
> **Picture it — A Card Dealer Distributing Hands**
>
> Imagine a card dealer laying out cards onto labelled player mats. Instead of picking up the deck, finding card 0, and walking it over to Player A, then finding card 1 and handing it to Player B, the dealer deals the cards across the table in one swift motion (`player_a, player_b = deal()`). With a starred variable (`*bench`), any remaining cards are collected into a single pile automatically.

Common unpacking patterns:
1. Sequence unpacking: `x, y = (10, 20)` or `a, b, c = [1, 2, 3]`
2. In-place swapping: `a, b = b, a` (evaluates right-hand side first into a temporary tuple, then unpacks)
3. Starred leftovers: `first, *middle, last = [1, 2, 3, 4, 5]` (`first=1, middle=[2, 3, 4], last=5`)
4. Discarding unused values: `user, _, email = ("Alice", 28, "alice@example.com")` or `head, *_ = items`
5. Unpacking in iterations: `for key, value in config.items():` or `for idx, val in enumerate(items):`
6. Nested data destructuring: `name, (lat, lon) = ("Warehouse", (37.77, -122.42))`
7. Dictionary unpacking & merging: `merged = {**defaults, **custom}` (keys on the right overwrite earlier ones)

```python
# 1. Multiple assignment and variable swap
a, b = 10, 20
a, b = b, a
print(f"Swapped: a={a}, b={b}")  # Swapped: a=20, b=10

# 2. Starred unpacking for flexible lengths
scores = [98, 85, 91, 78, 88]
highest, *others, lowest = sorted(scores, reverse=True)
print(f"Top: {highest}, Rest: {others}, Lowest: {lowest}")

# 3. Discarding unneeded elements
name, _, email = ("Bob Smith", "Accountant", "bob@example.com")
print(f"{name} <{email}>")

# 4. Nested unpacking and dictionary merging
user_payload = ("admin_user", ("us-east", "cluster-1"))
username, (region, cluster) = user_payload
print(f"User {username} deployed to {region}/{cluster}")

default_settings = {"theme": "light", "notifications": True, "timeout": 30}
user_settings = {"theme": "dark", "timeout": 60}
active_settings = {**default_settings, **user_settings}
print(active_settings)  # {'theme': 'dark', 'notifications': True, 'timeout': 60}
```

- **Strength — Expressive & Clean Syntax** Eliminates clunky temporary variables, index lookups like `row[0]`, and verbose slice assignments.
- **Weakness — ValueError on Shape Mismatch** Unpacking without `*` requires the exact number of variables to match the elements (`too many values to unpack` or `not enough values to unpack`).

**Interview question**

*Given a list of transaction records where each record is a tuple formatted as `(transaction_id, customer_name, (amount, currency), status)`, write a function `extract_successful_totals(transactions: list[tuple]) -> dict[str, float]` that uses destructuring to calculate the total amount spent per currency for all `"COMPLETED"` transactions.*

Loop through transactions using nested destructuring `for _tx_id, _customer, (amount, currency), status in transactions:`. If status is `"COMPLETED"`, accumulate `amount` into the dictionary for that `currency`.

**Answer — Extract Successful Totals with Destructuring**

```python
def extract_successful_totals(transactions: list[tuple]) -> dict[str, float]:
    totals = {}
    for _tx_id, _customer, (amount, currency), status in transactions:
        if status == "COMPLETED":
            totals[currency] = round(totals.get(currency, 0.0) + amount, 2)
    return totals

# Test cases
records = [
    ("TX101", "Alice", (120.50, "USD"), "COMPLETED"),
    ("TX102", "Bob", (45.00, "EUR"), "PENDING"),
    ("TX103", "Charlie", (80.25, "USD"), "COMPLETED"),
    ("TX104", "Alice", (30.00, "EUR"), "COMPLETED"),
]
expected = {"USD": 200.75, "EUR": 30.00}
assert extract_successful_totals(records) == expected
print("Extract successful totals passed!")
```

> **Key idea**
>
> In Python, unpacking requires an exact count match. Writing `x, y = [1, 2, 3]` raises `ValueError: too many values to unpack (expected 2)`. Use a starred variable like `x, y, *rest = [1, 2, 3]` or `x, *_, y = ...` when iterable length varies.

---

<a id="11-list-comprehensions"></a>

## 11. List Comprehensions

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

## Unit 3 — Functions & Asynchronous Programming

Writing clean reusable functions, argument packing, and non-blocking asynchronous coroutines.

<a id="12-functions-and-arguments"></a>

## 12. Functions & Arguments

- **Definition & Defaults** `def fn(param=default):` <!-- great -->
- **Variable Positional** `*args (packed as tuple)` <!-- great -->
- **Variable Keyword** `**kwargs (packed as dict)` <!-- great -->
- **Unpacking Calls** `fn(*items, **options)` <!-- good -->

Functions let you package code into reusable, modular blocks. Functions accept arguments, execute logic, and return values using the `return` statement (or `None` if omitted).

Beyond fixed positional and default arguments, Python provides `*args` and `**kwargs` for handling arbitrary numbers of inputs:
- `*args` collects any extra positional arguments into a `tuple`.
- `**kwargs` collects any extra keyword arguments into a `dict`.
- The `*` and `**` operators also work in reverse: when calling a function, `*iterable` unpacks sequence items into positional arguments, while `**dictionary` unpacks key-value pairs into named keyword arguments.

> **Analogy** 🎬
>
> **Picture it — A Blender with an Open Hopper and Labeled Spice Rack**
>
> Standard parameters are the fixed measuring cup slots on top of a blender. `*args` is an open hopper where you can drop in as many loose fruit pieces as you want (they all land inside a basket together as a tuple). `**kwargs` is a spice rack where every ingredient arrives labeled with its own name tag (stored neatly inside a dictionary).

Key everyday patterns:
1. Positional arguments: `def add(a, b): return a + b`
2. Default arguments: `def greet(name, greeting="Hello"): return f"{greeting}, {name}"`
3. Collecting variable positional arguments with `*args`: Packed into a `tuple` inside the function (e.g. `def total(*numbers): return sum(numbers)`).
4. Collecting variable keyword arguments with `**kwargs`: Packed into a `dict` inside the function (e.g. `def configure(**settings): ...`).
5. Standard parameter ordering: Positional first, then `*args`, then keyword defaults, then `**kwargs` (`def fn(x, y=10, *args, flag=True, **kwargs):`).
6. Unpacking arguments at call time: `fn(*my_list)` expands items as positional arguments, while `fn(**my_dict)` expands keys and values as keyword arguments.
7. Forwarding arguments in wrappers: `def wrapper(*args, **kwargs): return original_func(*args, **kwargs)` passes all arguments through unchanged.
8. Multiple return values: `return width, height` (returns a tuple that can be unpacked).

```python
# 1. Default parameters and multiple return values
def calculate_total(subtotal: float, tax_rate: float = 0.08) -> float:
    return round(subtotal * (1 + tax_rate), 2)

print(calculate_total(100.0))         # 108.0 (default 8% tax)
print(calculate_total(100.0, 0.05))   # 105.0 (overrides tax rate)

# 2. Variable positional arguments (*args -> tuple)
def calculate_average(*numbers: float) -> float:
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

print(calculate_average(10, 20, 30))  # 20.0
scores = [85, 90, 95]
print(calculate_average(*scores))     # 90.0 (unpacking list with *)

# 3. Variable keyword arguments (**kwargs -> dict)
def build_profile(username: str, **attributes) -> dict:
    profile = {"username": username}
    profile.update(attributes)
    return profile

user = build_profile("alex_dev", role="admin", active=True, theme="dark")
print(user)
# {'username': 'alex_dev', 'role': 'admin', 'active': True, 'theme': 'dark'}

# 4. Unpacking dictionary and forwarding arguments
extra_opts = {"retries": 3, "timeout": 15}
def connect(host: str, **opts):
    return f"Connecting to {host} with {opts}"

print(connect("db.internal", **extra_opts))
```

- **Strength — Maximum API Flexibility** `*args` and `**kwargs` let you create wrappers, middleware, and flexible helper utilities that pass arguments forward without needing to redefine every parameter.
- **Weakness — Reduced Self-Documentation When Overused** If a function signature only declares `def process(*args, **kwargs):`, callers lose IDE autocomplete, type checking, and clear documentation on what parameters are actually expected.

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

**Interview question**

*Write a URL builder function `build_query_url(base_url, *paths, **params)` that accepts a base URL, any number of path segments via `*paths`, and query parameters via `**params`, returning a cleanly formatted URL.*

Strip trailing slashes from `base_url`, join any non-empty `paths` with forward slashes, and format sorted `params` into a query string joined by `&` following a `?`.

**Answer — Build Query URL with *args and **kwargs**

```python
def build_query_url(base_url: str, *paths: str, **params: str) -> str:
    url = base_url.rstrip("/")
    if paths:
        url += "/" + "/".join(p.strip("/") for p in paths)
    if params:
        query = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        url += "?" + query
    return url

# Test cases
assert build_query_url("https://api.example.com", "v1", "users", page="1", sort="desc") == "https://api.example.com/v1/users?page=1&sort=desc"
assert build_query_url("https://api.example.com", status="active") == "https://api.example.com?status=active"
assert build_query_url("https://api.example.com/", "health") == "https://api.example.com/health"
print("Build query URL passed!")
```

> **Key idea**
>
> Remember the parameter order: regular positional arguments first, then `*args`, then keyword defaults, and finally `**kwargs` (`def func(pos, *args, kw_default='val', **kwargs):`). When forwarding arguments to another function, use `func(*args, **kwargs)`.

---

<a id="13-async-and-await"></a>

## 13. Async / Await

- **Coroutine Function** `async def fetch(): ...` <!-- great -->
- **Yield Control** `await coroutine()` <!-- great -->
- **Concurrent Execution** `asyncio.gather(*tasks)` <!-- good -->
- **Event Loop Runner** `asyncio.run(main())` <!-- good -->

Modern Python supports asynchronous programming via `async` and `await` and the built-in `asyncio` library. Unlike multi-threading which relies on the operating system to switch between threads, asynchronous programming uses **cooperative multitasking** on a single thread. When a coroutine reaches an I/O operation (such as waiting for an HTTP API response or database query), it uses `await` to yield control back to the **event loop**, allowing other tasks to run in the meantime.

> **Analogy** 🎬
>
> **Picture it — A Fast-Order Chef with Kitchen Timers**
>
> In synchronous code, a chef puts bread in the toaster and stares blankly at it for 3 minutes before starting to boil water for tea. In asynchronous code (`async/await`), the chef pushes the toaster lever down (`await toast()`), immediately turns around to start the kettle (`await boil_water()`), and chops vegetables. When a timer dings, the chef picks up the finished item. One chef (a single thread), zero idle waiting time.

Key async patterns and concepts:
1. `async def`: Declares an asynchronous coroutine function. Calling it does not run the code immediately; it returns a coroutine object.
2. `await`: Pauses execution of the coroutine until the awaited operation finishes, yielding the thread back to the event loop. `await` can only be used inside `async def` functions.
3. `asyncio.run(main())`: The modern entry point to run an async program. It creates a new event loop, executes the passed coroutine, and closes the loop upon completion.
4. `asyncio.gather(*tasks)`: Runs multiple coroutines concurrently and returns their aggregated results in the order the tasks were passed.
5. `asyncio.sleep(delay)`: A non-blocking asynchronous sleep. In contrast, `time.sleep()` freezes the entire thread and blocks all concurrent tasks.
6. `asyncio.create_task(coro)`: Schedules a coroutine to run immediately in the background on the event loop as an independent Task.
7. I/O-bound vs CPU-bound: Use `asyncio` for I/O-bound operations (network requests, API calls, database queries, file transfers). For CPU-intensive operations (heavy number crunching, image processing), use `multiprocessing` to run tasks on separate CPU cores.

```python
import asyncio
import time

# Asynchronous coroutine simulating non-blocking network I/O
async def fetch_service_data(service_name: str, delay: float) -> dict:
    await asyncio.sleep(delay)  # Non-blocking pause
    return {"service": service_name, "status": "online", "latency_ms": int(delay * 1000)}

async def main():
    # Running multiple coroutines concurrently
    start = time.perf_counter()
    results = await asyncio.gather(
        fetch_service_data("auth-service", 0.05),
        fetch_service_data("billing-service", 0.03),
        fetch_service_data("analytics-service", 0.01),
    )
    elapsed = time.perf_counter() - start

    for res in results:
        print(f"Service: {res['service']} | Status: {res['status']} ({res['latency_ms']}ms)")

    # Elapsed time is approximately max(delays) ~0.05s, not sum(delays) 0.09s
    print(f"Concurrent fetch completed in {elapsed:.3f}s")

# Entry point to execute top-level coroutine
if __name__ == "__main__":
    asyncio.run(main())
```

- **Strength — Massive I/O Concurrency with Low Overhead** A single process can easily manage tens of thousands of concurrent network connections without the high memory and context-switching overhead of OS threads.
- **Weakness — Blocking Calls Freeze the Entire Event Loop** If you execute synchronous blocking code (like `time.sleep()` or synchronous `requests.get()`) inside a coroutine, the entire event loop stops, stalling every other concurrent task.

**Interview question**

*Write an asynchronous function `check_all_services(endpoints: list[tuple[str, float]]) -> dict[str, str]` that queries multiple service endpoints concurrently using `asyncio.gather()`. Simulate network latency using `asyncio.sleep()`, and return a dictionary mapping each service name to its health status.*

Define a helper coroutine `ping_endpoint(name: str, delay: float) -> tuple[str, str]` that awaits `asyncio.sleep(delay)` and returns `(name, "healthy")`. In `check_all_services`, construct task coroutines for each endpoint, execute them concurrently with `await asyncio.gather(*tasks)`, and convert the returned list of tuples into a dictionary.

**Answer — Concurrent Service Health Checker**

```python
import asyncio

async def ping_endpoint(name: str, delay: float) -> tuple[str, str]:
    await asyncio.sleep(delay)
    return (name, "healthy")

async def check_all_services(endpoints: list[tuple[str, float]]) -> dict[str, str]:
    tasks = [ping_endpoint(name, delay) for name, delay in endpoints]
    results = await asyncio.gather(*tasks)
    return dict(results)

# Test cases
async def run_tests():
    services = [("auth", 0.02), ("db", 0.01), ("cache", 0.01)]
    status_map = await check_all_services(services)
    assert status_map == {
        "auth": "healthy",
        "db": "healthy",
        "cache": "healthy"
    }

    # Empty list test
    empty_res = await check_all_services([])
    assert empty_res == {}
    print("Service health checker passed!")

asyncio.run(run_tests())
```

> **Key idea**
>
> Never invoke synchronous blocking calls (such as `time.sleep()` or synchronous file/network I/O) inside coroutines. If you must run blocking legacy code, delegate it to a worker thread using `await asyncio.to_thread(blocking_func, arg)`.

---

<a id="unit-4"></a>

## Unit 4 — Object-Oriented Programming

Modeling real-world entities, encapsulating state, and writing clean maintainable classes with methods and inheritance.

<a id="14-object-oriented-programming"></a>

## 14. Object-Oriented Programming (OOP)

- **Class & Instance** `class BankAccount: / acc = BankAccount()` <!-- great -->
- **Initializer** `def __init__(self, ...):` <!-- great -->
- **Special Methods** `__str__, __repr__` <!-- good -->
- **Inheritance** `class Savings(BankAccount): super()` <!-- good -->

In Python, Object-Oriented Programming (OOP) is a programming paradigm that organizes code around objects rather than just isolated functions. A **class** is a blueprint defining attributes (data) and methods (behavior). An **object** (or instance) is a concrete realization of that blueprint with its own state.

Python passes the instance itself explicitly as the first parameter to methods, conventionally named `self`. The `__init__` constructor sets up initial instance state when an object is instantiated. Classes also support inheritance, allowing child classes to reuse, extend, or override parent methods using `super()`.

> **Analogy** 🎬
>
> **Picture it — An Architectural Blueprint vs Built Houses**
>
> A class is the architectural blueprint for a house: it specifies that every house has bedrooms, bathrooms, and a front door, and defines how the doorbell works. An object (instance) is an actual physical house built on a specific lot with its own address, wall color, and occupants. You can build dozens of unique houses (`house1`, `house2`) from the exact same blueprint.

Key everyday OOP concepts:
1. `class Name:`: Defines a class template. Class names conventionally use CapWords / PascalCase.
2. `def __init__(self, ...):`: The initializer method that runs automatically when creating a new object.
3. `self`: A reference to the current instance, used to read or modify its attributes (`self.balance = 0.0`).
4. Instance attributes vs Class attributes: Attributes assigned to `self` belong to that specific instance; attributes defined at the class level are shared across all instances.
5. Special dunder methods: `__str__` returns a friendly string for end users (used by `print()`), while `__repr__` returns an unambiguous representation for developers and debugging.
6. Inheritance and `super()`: `class Child(Parent):` inherits behavior from a parent class, and `super().__init__(...)` delegates initialization to the parent class.

```python
# 1. Defining a class with __init__ and methods
class BankAccount:
    bank_name = "TechBank"  # Class attribute (shared)

    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner          # Instance attribute
        self.balance = balance      # Instance attribute

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self.balance += amount
        return self.balance

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise ValueError("Insufficient funds.")
        self.balance -= amount
        return self.balance

    def __str__(self) -> str:
        return f"BankAccount(owner='{self.owner}', balance=${self.balance:.2f})"

# 2. Creating instances and invoking methods
acc = BankAccount("Alice", 100.0)
acc.deposit(50.0)
print(acc)  # BankAccount(owner='Alice', balance=$150.00)

# 3. Inheritance and super()
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: float = 0.0, interest_rate: float = 0.03):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def apply_interest(self) -> float:
        earned = self.balance * self.interest_rate
        self.balance += earned
        return self.balance

savings = SavingsAccount("Bob", 1000.0)
savings.apply_interest()
print(f"Savings balance: ${savings.balance:.2f}")  # $1030.00
```

- **Strength — Encapsulation & Cohesion** Bundling state and behavior together keeps related logic organized, avoids scattered helper functions, and protects data integrity.
- **Weakness — Avoid Over-Engineering** Don't create complex 5-level inheritance hierarchies or write classes for simple tasks where a plain dictionary, namedtuple, or pure function is simpler and faster.

**Interview question**

*Design an InventoryItem class that tracks product name, stock quantity, and price. Add methods to restock items, record sales (raising a ValueError if stock is insufficient), and calculate the total inventory valuation.*

Define an `InventoryItem` class initialized with `name: str`, `quantity: int = 0`, and `unit_price: float = 0.0`. Validate that quantity and price are non-negative. Provide `.restock(amount)` to increase quantity, `.sell(amount)` to decrease quantity (raising `ValueError` when `amount > self.quantity`), and `.total_value()` returning `round(quantity * unit_price, 2)`. Add `__repr__` for clear debugging.

**Answer — Inventory Item Class**

```python
class InventoryItem:
    def __init__(self, name: str, quantity: int = 0, unit_price: float = 0.0):
        if quantity < 0 or unit_price < 0:
            raise ValueError("Quantity and price must be non-negative.")
        self.name = name
        self.quantity = quantity
        self.unit_price = unit_price

    def restock(self, amount: int) -> int:
        if amount <= 0:
            raise ValueError("Restock amount must be positive.")
        self.quantity += amount
        return self.quantity

    def sell(self, amount: int) -> int:
        if amount <= 0:
            raise ValueError("Sale amount must be positive.")
        if amount > self.quantity:
            raise ValueError(f"Cannot sell {amount}; only {self.quantity} in stock.")
        self.quantity -= amount
        return self.quantity

    def total_value(self) -> float:
        return round(self.quantity * self.unit_price, 2)

    def __repr__(self) -> str:
        return f"InventoryItem(name='{self.name}', qty={self.quantity}, price={self.unit_price})"

# Test cases
item = InventoryItem("Mechanical Keyboard", quantity=10, unit_price=79.99)
assert item.total_value() == 799.90
item.restock(5)
assert item.quantity == 15
item.sell(3)
assert item.quantity == 12
assert item.total_value() == 959.88

try:
    item.sell(20)
    assert False, "Should have raised ValueError"
except ValueError:
    pass

print("Inventory item passed!")
```

> **Key idea**
>
> In Python, prefer composition over deep inheritance ("has-a" over "is-a"). Only inherit when a child genuinely is a specialized version of the parent, and always call `super().__init__(...)` so base classes are initialized properly.

---

<a id="unit-5"></a>

## Unit 5 — Error Handling, Modules & Environments

Catching runtime exceptions gracefully, structuring scripts, and managing isolated project environments.

<a id="15-everyday-error-handling"></a>

## 15. Everyday Error Handling

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

<a id="16-modules-and-imports"></a>

## 16. Modules & Imports

- **Import Syntax** `import mod / from mod import fn` <!-- great -->
- **Script Guard** `if __name__ == "__main__":` <!-- great -->
- **Standard Library** `math, os, sys, json, pathlib` <!-- good -->

A module in Python is simply a `.py` file containing functions, classes, and variables. A package is a directory containing multiple modules (often accompanied by an `__init__.py` file). Python's module system lets you organize code logically across files, reuse utilities, and avoid namespace pollution. The standard library provides dozens of battle-tested modules out of the box without needing third-party packages.

> **Analogy** 🎬
>
> **Picture it — A Professional Toolbox with Labeled Drawers**
>
> Instead of dumping every wrench, hammer, screwdriver, and nail onto your workbench all at once (which causes clutter and confusion), a workshop organizes tools into labeled drawers. When you need a measuring tape, you open the `math` drawer; when you need to serialize data, you open the `json` drawer. If you only need one specific screwdriver, you take just that tool (`from toolbox import screwdriver`) without cluttering your workbench.

Key import patterns and practices:
1. `import module_name`: Imports the entire module under its namespace (e.g. `import math; math.sqrt(16)`).
2. `from module_name import function_name`: Imports specific attributes directly into the local namespace (e.g. `from math import sqrt, pi`).
3. `import module_name as alias`: Aliases the module name for brevity or to avoid collisions (e.g. `import datetime as dt`).
4. Avoid `from module import *`: Wildcard imports pollute the local namespace, obscure where names originated, and can accidentally overwrite existing variables.
5. `if __name__ == "__main__":`: When a Python file is run directly (via `python script.py`), Python sets `__name__` to `"__main__"`. When imported as a module, `__name__` is set to the module's file name. This guard lets you write files that act as reusable libraries when imported, but execute scripts or tests when run directly.
6. Standard library powerhouses: `pathlib` for modern object-oriented filesystem paths, `json` for serializing and deserializing JSON, `datetime` for timestamps, and `math` for mathematical functions.

```python
import json
import math
from pathlib import Path

# 1. Standard library math functions
root = math.isqrt(49)
print(f"Square root: {root}")  # 7

# 2. JSON serialization and deserialization
user_data = {"username": "alex_dev", "role": "admin", "active": True}
json_string = json.dumps(user_data)
print(f"Serialized JSON: {json_string}")

parsed_data = json.loads(json_string)
print(f"Parsed username: {parsed_data['username']}")

# 3. Pathlib for filesystem path handling
config_path = Path("config/app.json")
print(f"Filename: {config_path.name}, Extension: {config_path.suffix}")

# 4. Entry point guard for standalone script execution
def run_app():
    print("Application initialized successfully.")

if __name__ == "__main__":
    run_app()
```

- **Strength — Clean Namespaces & Reusability** Modules separate concerns, prevent variable name collisions, and let teams share tested code across projects without duplication.
- **Weakness — Circular Imports** If module A imports module B and module B simultaneously imports module A at the top level, Python throws an `ImportError` or `AttributeError` because one module is accessed before it finishes executing.

**Interview question**

*Write a modular configuration loader function `load_config(raw_json: str, required_keys: list[str]) -> dict` that parses a JSON configuration string and verifies that all required keys are present. If the JSON is malformed or any required key is missing, raise a descriptive ValueError.*

Use `json.loads()` to deserialize the input string inside a `try / except json.JSONDecodeError` block, verify the parsed object is a dictionary, and check that each required key exists in the parsed data.

**Answer — Load and Validate Config**

```python
import json

def load_config(raw_json: str, required_keys: list[str]) -> dict:
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as err:
        raise ValueError(f"Invalid JSON format: {err}") from err

    if not isinstance(data, dict):
        raise ValueError("Configuration payload must be a JSON object.")

    missing = [k for k in required_keys if k not in data]
    if missing:
        missing_str = ", ".join(missing)
        raise ValueError(f"Missing required configuration keys: {missing_str}")

    return data

# Test cases
valid_payload = '{"host": "localhost", "port": 5432, "database": "analytics"}'
config = load_config(valid_payload, ["host", "port"])
assert config["host"] == "localhost"
assert config["port"] == 5432

# Test missing key raises ValueError
try:
    load_config(valid_payload, ["host", "api_key"])
    assert False, "Should have raised ValueError"
except ValueError as e:
    assert "Missing required configuration keys: api_key" in str(e)

# Test invalid JSON syntax raises ValueError
try:
    load_config("{invalid: json", ["host"])
    assert False, "Should have raised ValueError"
except ValueError as e:
    assert "Invalid JSON format" in str(e)

print("Load config passed!")
```

> **Key idea**
>
> Always wrap executable code in `if __name__ == "__main__":` so that importing the file from another module or test suite doesn't execute script entry logic. Avoid `from module import *` in production code to prevent naming collisions and hidden bugs.

---

<a id="17-virtual-environments"></a>

## 17. Virtual Environments

- **Environment Creation** `python3 -m venv .venv` <!-- great -->
- **Activation** `source .venv/bin/activate` <!-- great -->
- **Dependency Installation** `pip install -r requirements.txt` <!-- good -->

A virtual environment is a self-contained, isolated directory tree containing a Python installation for a specific version, along with its own independent set of packages in `site-packages`. Without a virtual environment, installing third-party libraries globally with `pip install` risks version conflicts across different projects and can corrupt system Python tools. Activating an environment temporarily modifies your shell's `PATH` so `python` and `pip` point directly to the project's local sandbox.

> **Analogy** 🎬
>
> **Picture it — A Dedicated Apartment Kitchen vs. A Shared Public Canteen**
>
> Imagine sharing one giant global kitchen with every tenant in a city. If project A needs Chef salt v1 and project B demands Chef salt v2, their conflicting ingredients ruin each other's recipes. A virtual environment is your project's private kitchen: you stock exactly the spices and utensils your specific recipe needs without interfering with anyone else. When you leave the project, you simply step outside or delete the kitchen folder without leaving any mess.

### Using

```bash
# Create a virtual environment named `.venv`
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`

# Install dependencies from `requirements.txt` if it exists
pip install -r requirements.txt
```

Key everyday commands and workflow:
1. `python3 -m venv .venv`: Uses Python's built-in `venv` module to create an isolated environment in a directory named `.venv`.
2. `source .venv/bin/activate`: Updates shell environment variables (`PATH` and `VIRTUAL_ENV`) so terminal commands resolve to `.venv/bin/python` and `.venv/bin/pip`. On Windows (PowerShell/Command Prompt), run `.venv\Scripts\activate`.
3. `pip install -r requirements.txt`: Reads the dependency specification and installs reproducible package versions into `.venv/lib/pythonX.Y/site-packages`.
4. `pip freeze > requirements.txt`: Exports currently installed packages and exact version pins to share with collaborators or deploy in CI/CD.
5. `deactivate`: Restores shell environment variables back to their previous system values.
6. Verify active environment in Python code: inspect `sys.prefix != sys.base_prefix` to confirm isolation at runtime.

```python
import sys
from pathlib import Path

# Verify whether the current script is running inside a virtual environment
def is_virtual_env() -> bool:
    # In a virtual environment, sys.prefix points to the .venv directory,
    # while sys.base_prefix points to the global system Python installation.
    return sys.prefix != sys.base_prefix

print(f"Python Executable: {sys.executable}")
print(f"Active Environment Path: {sys.prefix}")
print(f"Base System Python Path: {sys.base_prefix}")
print(f"Running inside virtual environment: {is_virtual_env()}")

# Check for requirements.txt in project root
req_file = Path("requirements.txt")
if req_file.exists():
    dependencies = [line.strip() for line in req_file.read_text().splitlines() if line.strip() and not line.startswith("#")]
    print(f"Project requirements ({len(dependencies)} packages): {dependencies}")
```

- **Strength — Clean Project Isolation & Reproducibility** Keeps conflicting package versions strictly separated per project and enables deterministic, zero-surprise builds across team members and CI/CD pipelines.
- **Weakness — Committing `.venv` to Git** The `.venv` folder is OS- and path-dependent and must never be committed to source control. Always add `.venv/` to `.gitignore` and commit `requirements.txt` instead.

**Interview question**

*Write a Python utility function `parse_requirements(requirements_content: str) -> dict[str, str]` that parses a standard `requirements.txt` file string and returns a dictionary mapping package names to their pinned version constraints (e.g. `{"fastapi": ">=0.110.0", "requests": "==2.31.0"}`). Ignore comments and empty lines.*

Iterate over the lines, strip whitespace, ignore empty lines and comment lines starting with `#`, then parse package names and version specifiers (such as `==`, `>=`, `<=`, `~=`).

**Answer — Parse Requirements File**

```python
import re

def parse_requirements(requirements_content: str) -> dict[str, str]:
    requirements = {}
    pattern = re.compile(r"^([A-Za-z0-9_.\-]+)\s*([<>=!~].*)?$")

    for line in requirements_content.splitlines():
        cleaned = line.strip()
        # Skip empty lines and comment lines
        if not cleaned or cleaned.startswith("#"):
            continue

        match = pattern.match(cleaned)
        if match:
            pkg_name = match.group(1).lower()
            specifier = (match.group(2) or "").strip()
            requirements[pkg_name] = specifier

    return requirements

# Test cases
sample_reqs = """
# Production dependencies
requests==2.31.0
fastapi>=0.110.0
uvicorn~=0.28.0
pytest
"""

parsed = parse_requirements(sample_reqs)
assert parsed["requests"] == "==2.31.0"
assert parsed["fastapi"] == ">=0.110.0"
assert parsed["uvicorn"] == "~=0.28.0"
assert parsed["pytest"] == ""
print("Parse requirements passed!")
```

> **Key idea**
>
> Always use a dedicated virtual environment for every Python project. Never install third-party dependencies into the global system interpreter, and never commit the `.venv` directory to Git — commit `requirements.txt` so anyone can recreate the environment in seconds.

---

## Daily Python Cheat Sheet

A quick checklist of the most common daily syntax:

1. **Variables & None:** Python is dynamically typed. Check for emptiness with `if items:` or `if not items:`. Compare singletons with `if val is None:`.
2. **Type Hints:** Annotate variables and functions: `def fn(x: int) -> str | None:`. Use `list[str]` and `dict[str, int]` for generic collections.
3. **Keywords:** Only 35 reserved words in Python (`keyword.kwlist`). Check with `keyword.iskeyword()`. Never name variables after keywords.
4. **Strings:** Format with `f"Hello {name}"`. Clean with `.strip()`, split into lists with `.split()`, join with `", ".join(list)`, and test substrings with `in` and `not in`.
5. **Conditionals & Operators:** Use `/` for float division, `//` for floor division, `%` for modulo, and `divmod()` for both. Use `is` and `is not` for identity (`val is None`), `==` and `!=` for values. Test membership with `in` and `not in`. Chain comparisons: `18 <= age < 65`.
6. **Loops:** Iterate cleanly with `for item in items:` or `for i, item in enumerate(items):`. Use `break`, `continue`, and `pass`.
7. **Lists:** Access with `items[0]` and `items[-1]`. Append with `.append()`. Reverse with `[::-1]`.
8. **Dictionaries:** Use `.get(key, default)` for safe lookups that never crash with `KeyError`.
9. **Tuples & Sets:** Use immutable tuples for fixed records. Use `set(items)` to instantly remove duplicates with $O(1)$ membership checks.
10. **Unpacking & Destructuring:** Multiple assignment (`a, b = b, a`), capture leftovers (`head, *tail = items`), ignore values (`first, *_ = items`), and merge dictionaries with `{**defaults, **custom}`.
11. **Comprehensions:** Transform cleanly: `[x.lower() for x in names if x]`.
12. **Functions & Arguments:** Define with `def fn(a, b=default, *args, **kwargs):`. `*args` captures extra positional arguments into a tuple, while `**kwargs` captures keyword arguments into a dictionary. Unpack with `*` and `**`.
13. **Async & Await:** Concurrency for I/O-bound tasks. Declare with `async def`, yield with `await`, run with `asyncio.run()`, and execute concurrently with `asyncio.gather()`. Never execute blocking synchronous code inside coroutines.
14. **Classes & OOP:** Define classes with `class Item:`, initialize attributes inside `def __init__(self, ...):`, and provide `__str__` or `__repr__` for clean display. Use `super().__init__(...)` in child classes to inherit parent state safely.
15. **Errors:** Catch expected issues with `try / except SpecificError:`. Never write bare `except: pass`.
16. **Modules & Imports:** Organize code into `.py` files. Use `from module import func` or `import module as alias`. Guard scripts with `if __name__ == "__main__":` and avoid `from module import *`.
17. **Virtual Environments:** Create isolated project environments with `python3 -m venv .venv`, activate with `source .venv/bin/activate` (or `.venv\Scripts\activate` on Windows), install dependencies from `requirements.txt` via `pip install -r requirements.txt`, and check with `sys.prefix != sys.base_prefix`. Never commit `.venv` to git.

---

© 2026 TechToday. Python Study Library.
