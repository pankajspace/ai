[<- README](../../README.md)

# Python Crash Course

## Table of Contents

1. [1. Hello Python](#1-hello-python)
2. [2. Variables & Types](#2-variables--types)
3. [3. Operators](#3-operators)
4. [4. Strings](#4-strings)
5. [5. Data Structures](#5-data-structures)
6. [6. Control Flow](#6-control-flow)
7. [7. Loops](#7-loops)
8. [8. Functions](#8-functions)
9. [9. List Comprehensions](#9-list-comprehensions)
10. [10. Classes (OOP)](#10-classes-oop)
11. [11. Error Handling](#11-error-handling)
12. [12. Modules & Imports](#12-modules--imports)
13. [13. File I/O](#13-file-io)
14. [14. Iterators & Generators](#14-iterators--generators)
15. [15. Decorators](#15-decorators)
16. [16. Context Managers](#16-context-managers)
17. [17. Type Hints](#17-type-hints)
18. [18. Unpacking & Useful Patterns](#18-unpacking--useful-patterns)
19. [19. Common Standard Library](#19-common-standard-library)
20. [20. Virtual Environments & Packages](#20-virtual-environments--packages)
21. [21. Async/Await (Quick Intro)](#21-asyncawait-quick-intro)
22. [22. Pythonic Tips](#22-pythonic-tips)
23. [23. Quick Reference Card](#quick-reference-card)

## 1. Hello Python

Python is a readable, dynamically typed language where indentation defines code blocks and programs run top-to-bottom. This section covers how to verify your Python setup, the difference between running scripts and using the REPL, and the fundamentals of output and comments. You will also learn why `print()` is central for quick debugging and exploration.

> Don't have Python installed yet? See [Installing Python](python-course.md#installing-python) for Windows/macOS/Linux setup steps.

```bash
python --version          # check installation (macOS/Linux: python3 --version)
python script.py          # run a file (macOS/Linux: python3 script.py)
python                    # interactive REPL (macOS/Linux: python3)
```

```python
print("Hello, World!")    # Hello, World!

# Single-line comment
"""Multi-line comment / docstring"""
```

## 2. Variables & Types

Python variables are names bound to objects, not fixed memory slots with declared types. This section introduces dynamic typing, common built-in types (`str`, `int`, `float`, `bool`, `None`), multiple assignment, and truthy/falsy behavior. It also explains type inspection and safe type conversion for real-world input handling.

```python
name = "Alice"        # str
age = 30              # int
height = 5.7          # float
active = True         # bool  (capital T/F)
nothing = None        # NoneType

x, y, z = 1, 2, 3     # x = 1, y = 2, z = 3
print(name, age)      # Alice 30
```

### Type Checking & Casting

`type()` and `isinstance()` inspect a value; constructors like `int()`, `str()`, and `bool()` convert between types. Empty values (`0`, `""`, `[]`, `None`) are falsy.

```python
age = 30
type(age)             # <class 'int'>
isinstance(age, int)  # True

int("42")             # 42
str(100)              # '100'
float("3.14")         # 3.14
bool(0)               # False  (0, "", [], None → falsy)
bool("hi")            # True
```

## 3. Operators

Operators are the building blocks for calculations, comparisons, and control decisions. This section covers arithmetic, comparison, logical, identity, membership, and conditional expressions, plus common pitfalls like `==` versus `is`. You will also see how operator behavior affects branching, filtering, and expression readability.

```python
# Arithmetic
5 + 3     # 8
5 - 3     # 2
5 * 3     # 15
5 / 3     # 1.6666666666666667  (always float)
5 // 3    # 1                   (floor div)
5 % 3     # 2                   (modulo)
5 ** 3    # 125                 (power)

# Comparison → returns bool
5 == 5    # True
5 != 3    # True
5 > 3     # True
5 < 3     # False
5 >= 5    # True
5 <= 3    # False

# Logical
True and False   # False
True or False    # True
not True         # False

# Identity vs Equality
a = [1, 2]
b = a
c = [1, 2]
a == c           # True   (same value)
a is b           # True   (same object in memory)
a is c           # False  (equal value, different object)

# Membership
"x" in "hello"       # False
3 in [1, 2, 3]       # True

# Ternary
age = 30
status = "adult" if age >= 18 else "minor"
status               # 'adult'
```

## 4. Strings

Strings are immutable Unicode sequences, which makes them predictable and safe to reuse across operations. This section explains indexing, slicing, common transformation methods, and search operations, along with practical formatting using f-strings. It also highlights immutability so you understand when operations create new strings instead of modifying existing ones.

```python
s = "Hello, World!"
s = 'Hello, World!'          # single or double — same thing
s = """multi
line"""                      # 'multi\nline'

s = "Hello, World!"

# Indexing & Slicing
s[0]       # 'H'
s[-1]      # '!'
s[0:5]     # 'Hello'
s[:5]      # 'Hello'
s[7:]      # 'World!'
s[::-1]    # '!dlroW ,olleH'

# Common methods
s.lower()                      # 'hello, world!'
s.upper()                      # 'HELLO, WORLD!'
s.strip()                      # 'Hello, World!'  (no extra whitespace here)
"  hi  ".strip()               # 'hi'
s.split(", ")                  # ['Hello', 'World!']
", ".join(["a", "b"])          # 'a, b'
s.replace("World", "Python")   # 'Hello, Python!'
s.startswith("Hello")          # True
s.find("World")                # 7  (-1 if not found)
s.count("l")                   # 3

# f-strings (formatted strings — use these!)
name, age = "Alice", 30
f"Hi {name}, you're {age}"     # "Hi Alice, you're 30"
f"{3.14159:.2f}"               # '3.14'
f"{1000000:,}"                 # '1,000,000'

# Strings are IMMUTABLE
# s[0] = "h"   ❌ TypeError
s = "h" + s[1:]                # 'hello, World!'
```

## 5. Data Structures

Python collections model different access patterns: sequence access, key-based lookup, uniqueness, and fixed records. This section compares lists, tuples, dictionaries, and sets with an emphasis on mutability, ordering, lookup cost, and common operations. Choosing the right structure here is one of the biggest productivity and performance wins in Python.

### Lists — ordered, mutable `[]`

Lists keep items in order and you can change them in place — append, insert, pop, sort. Use them whenever you need a growable sequence.

```python
nums = [1, 2, 3, 4, 5]

# Access
nums[0]          # 1
nums[-1]         # 5
nums[1:3]        # [2, 3]

# Modify
nums.append(6)
nums             # [1, 2, 3, 4, 5, 6]
nums.insert(0, 0)
nums             # [0, 1, 2, 3, 4, 5, 6]
nums.extend([7, 8])
nums             # [0, 1, 2, 3, 4, 5, 6, 7, 8]
nums[0] = 99
nums             # [99, 1, 2, 3, 4, 5, 6, 7, 8]

# Remove
nums.remove(99)          # by value (first match)
last = nums.pop()        # 8
at_index = nums.pop(0)   # 1
del nums[0]              # delete by index
nums                     # [2, 3, 4, 5, 6, 7]

# Other
nums = [3, 1, 4, 1, 5]
nums.sort()
nums                     # [1, 1, 3, 4, 5]
sorted(nums, reverse=True)  # [5, 4, 3, 1, 1]  (new list)
nums.reverse()
nums                     # [5, 4, 3, 1, 1]
len(nums)                # 5
3 in nums                # True
nums.index(3)            # 2
nums.count(1)            # 2
```

### Tuples — ordered, immutable `()`

Tuples are like lists you cannot mutate. Use them for fixed records (coordinates, pairs) and when you need a hashable sequence as a dict key.

```python
point = (3, 4)
x, y = point             # x = 3, y = 4
single = (42,)           # trailing comma needed for a 1-item tuple!

point[0]                 # 3
# point[0] = 5           ❌ TypeError — immutable
```

### Dicts — key-value pairs `{}`

Dicts map unique keys to values with O(1) lookup. Access with `[]` (raises if missing) or `.get()` (safe default); iterate `.items()` for key and value together.

```python
person = {"name": "Alice", "age": 30}

# Access
person["name"]                 # 'Alice'
person.get("email", "N/A")     # 'N/A'  (safe access)

# Modify
person["age"] = 31             # update
person["email"] = "a@b.com"    # add new key
person                         # {'name': 'Alice', 'age': 31, 'email': 'a@b.com'}

# Remove
del person["email"]
age = person.pop("age")        # 31
person                         # {'name': 'Alice'}

# Iterate
for key, value in person.items():
    print(f"{key}: {value}")
# name: Alice

# Check
"name" in person               # True  (checks keys)

# Merge (Python 3.9+)
merged = {"a": 1} | {"b": 2}
merged                         # {'a': 1, 'b': 2}
```

### Sets — unordered, unique `{}`

Sets store unique items and support union `|`, intersection `&`, and difference `-`. `{}` is an empty dict — use `set()` for an empty set.

```python
s = {1, 2, 3}
empty = set()             # NOT {} — that's an empty dict!

s.add(4)
s.discard(2)              # no error if missing
s                         # {1, 3, 4}

# Set math
a = {1, 2, 3}
b = {3, 4, 5}
a | b                     # {1, 2, 3, 4, 5}  union
a & b                     # {3}              intersection
a - b                     # {1, 2}           difference

# Deduplicate a list
unique = list(set([1, 1, 2, 2, 3]))
unique                    # [1, 2, 3]  (order not guaranteed)
```

## 6. Control Flow

Control flow determines which code path executes based on conditions and patterns. This section covers `if`/`elif`/`else` for boolean logic and `match`/`case` for structural branching in Python 3.10+. It also reinforces indentation-driven block structure, which is essential for writing correct Python.

```python
score = 85

# if / elif / else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "F"

grade                     # 'B'

# match / case (Python 3.10+)
command = "help"
match command:
    case "quit":
        print("Bye!")
    case "help":
        print("Commands: quit, help")
    case _:
        print("Unknown")
# Commands: quit, help
```

> Python uses **indentation** (4 spaces) instead of `{}` braces!

## 7. Loops

Loops let you process data repeatedly without duplicating code. This section explains iteration with `for` over any iterable, sequence generation with `range`, index pairing via `enumerate`, and parallel traversal with `zip`. It also covers `while`, `break`, and `continue` so you can control termination and flow safely.

```python
# for — iterate over anything
for item in [1, 2, 3]:
    print(item)
# 1
# 2
# 3

for i in range(5):            # 0, 1, 2, 3, 4
    print(i)
# 0
# 1
# 2
# 3
# 4

for i in range(2, 10, 2):     # 2, 4, 6, 8
    print(i)
# 2
# 4
# 6
# 8

# enumerate — index + value
for i, val in enumerate(["a", "b", "c"]):
    print(i, val)
# 0 a
# 1 b
# 2 c

# zip — parallel iteration
names = ["Alice", "Bob"]
scores = [90, 85]
for name, score in zip(names, scores):
    print(name, score)
# Alice 90
# Bob 85

# while
count = 0
while count < 5:
    count += 1
count                         # 5

# break / continue
for i in range(10):
    if i == 3:
        continue              # skip 3
    if i == 7:
        break                 # stop at 7
    print(i)
# 0
# 1
# 2
# 4
# 5
# 6
```

## 8. Functions

Functions encapsulate reusable behavior and make code easier to test, maintain, and compose. This section covers parameters, default arguments, return values, tuple unpacking, variadic arguments (`*args`, `**kwargs`), and lambdas for short callbacks. It also includes the mutable-default-argument pitfall, one of the most important function gotchas in Python.

```python
def greet(name, greeting="Hello"):
    """Greet someone."""
    return f"{greeting}, {name}!"

greet("Alice")                    # 'Hello, Alice!'
greet("Bob", greeting="Hey")      # 'Hey, Bob!'

# Return multiple values
def divide(a, b):
    return a // b, a % b          # returns a tuple

q, r = divide(17, 5)              # q = 3, r = 2

# *args and **kwargs
def flexible(*args, **kwargs):
    print(args)        # tuple of positional args
    print(kwargs)      # dict of keyword args

flexible(1, 2, name="Alice")
# (1, 2)
# {'name': 'Alice'}

# Lambda (anonymous function)
square = lambda x: x ** 2
square(4)                         # 16

points = [(1, 2), (3, 1), (5, 0)]
points.sort(key=lambda p: p[1])   # sort by 2nd element
points                            # [(5, 0), (3, 1), (1, 2)]
```

### ⚠️ Mutable Default Gotcha

Default argument values are created **once** when the function is defined. Never use a mutable default (`[]`, `{}`) — use `None` and create a new object inside the function.

```python
# ❌ BAD — list is shared across calls
def add_bad(val, lst=[]):
    lst.append(val)
    return lst

add_bad(1)                        # [1]
add_bad(2)                        # [1, 2]  leftover from the previous call!

# ✅ FIX
def add(val, lst=None):
    if lst is None:
        lst = []
    lst.append(val)
    return lst

add(1)                            # [1]
add(2)                            # [2]  fresh list each time
```

## 9. List Comprehensions

Comprehensions provide concise syntax for transforming and filtering iterables while keeping intent clear. This section covers list, dict, and set comprehensions plus generator expressions for lazy evaluation. You will learn when comprehensions improve readability and when a regular loop is a better choice.

```python
# [expression for item in iterable]
squares = [x**2 for x in range(10)]
squares    # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With filter
evens = [x for x in range(20) if x % 2 == 0]
evens      # [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With if/else
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
labels     # ['even', 'odd', 'even', 'odd', 'even']

# Dict comprehension
sq = {x: x**2 for x in range(6)}
sq         # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Set comprehension
lengths = {len(w) for w in ["hi", "hello", "hey"]}
lengths    # {2, 3, 5}

# Generator expression (lazy — saves memory)
total = sum(x**2 for x in range(1_000_000))
total      # 333332833333500000
```

## 10. Classes (OOP)

Object-oriented programming organizes code around objects that combine state and behavior. This section explains class design, instance versus class attributes, method types, inheritance, method overriding, `super()`, and MRO in multiple inheritance scenarios. It also introduces properties and dataclasses for cleaner, safer object APIs.

```python
class Dog:
    species = "Canis familiaris"     # class attribute (shared)

    def __init__(self, name, age):   # constructor
        self.name = name             # instance attribute
        self.age = age

    def bark(self):                  # method
        return f"{self.name} says Woof!"

    def __str__(self):               # print(dog) calls this
        return f"{self.name}, age {self.age}"

buddy = Dog("Buddy", 5)
print(buddy.bark())                  # Buddy says Woof!
print(buddy)                         # Buddy, age 5
print(Dog.species)                   # Canis familiaris
```

### Inheritance

A subclass reuses a parent’s behavior and can override methods. `isinstance(obj, Parent)` is True for subclasses — this is how you share an interface across types.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return f"{self.name}: Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name}: Meow!"

Dog("Rex").speak()                   # 'Rex: Woof!'
isinstance(Dog("Rex"), Animal)       # True
```

### Multiple Inheritance & The Diamond Problem

Python supports **multiple inheritance** — a class can inherit from more than one parent.

```python
class Flyer:
    def move(self):
        return "Flying"

class Swimmer:
    def move(self):
        return "Swimming"

class Duck(Flyer, Swimmer):    # inherits from both
    pass

Duck().move()   # 'Flying' — Flyer is listed first, so it wins
```

**The Diamond Problem** occurs when a class inherits from two classes that share a common ancestor:

```python
class Animal:
    def speak(self):
        return "generic sound"

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Pet(Animal):
    def speak(self):
        return "I'm a pet!"

class DomesticDog(Dog, Pet):   # 💎 Diamond: both parents share Animal
    pass

#       Animal
#       /    \
#     Dog    Pet
#       \    /
#    DomesticDog
```

**Python's fix: MRO (Method Resolution Order)** — uses **C3 linearization** to create a deterministic, left-to-right, depth-first order that respects the hierarchy.

```python
DomesticDog.__mro__
# (DomesticDog, Dog, Pet, Animal, object)

DomesticDog().speak()   # 'Woof!' — Dog comes before Pet in MRO
```

**Use `super()` to cooperate across the MRO chain:**

```python
class Animal:
    def __init__(self, name, **kwargs):
        super().__init__(**kwargs)      # pass remaining args up
        self.name = name

class Dog(Animal):
    def __init__(self, breed, **kwargs):
        super().__init__(**kwargs)
        self.breed = breed

class Pet(Animal):
    def __init__(self, owner, **kwargs):
        super().__init__(**kwargs)
        self.owner = owner

class DomesticDog(Dog, Pet):
    pass

d = DomesticDog(name="Rex", breed="Lab", owner="Alice")
# super().__init__() follows MRO: DomesticDog → Dog → Pet → Animal
# ✅ All __init__ methods run, no duplicates
print(d.name, d.breed, d.owner)   # Rex Lab Alice
```

> **Key rules:**
> - MRO goes **left-to-right**, then **up** — check with `ClassName.__mro__`
> - Always use `super()` (not parent name) to play nice with MRO
> - Pass `**kwargs` through `__init__` chains to handle varying signatures

### Properties

`@property` lets you access a method like an attribute (`c.area`) while still running validation in a setter. Use it to hide internal fields (`_radius`) behind a clean API.

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Must be positive")
        self._radius = value

    @property
    def area(self):                  # computed, read-only
        return 3.14159 * self._radius ** 2

c = Circle(5)
c.radius = 10         # uses setter
print(c.area)         # 314.159
```

### Dataclasses (Python 3.7+)

Auto-generates `__init__`, `__repr__`, `__eq__` — use for data-holding classes.

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"

p = Point(1.0, 2.0)
print(p)              # Point(x=1.0, y=2.0, label='origin')
print(p == Point(1.0, 2.0))  # True
```

## 11. Error Handling

Error handling turns runtime failures into predictable control paths instead of abrupt crashes. This section covers `try`/`except`/`else`/`finally`, targeted exception catching, re-raising, and custom exceptions for domain-specific errors. You will learn how to fail clearly and recover safely in production-style code.

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Can't divide by zero!")
except (TypeError, ValueError) as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected: {e}")       # catch-all (use sparingly)
else:
    print(f"Result: {result}")      # only if NO exception
finally:
    print("Always runs")            # cleanup
# Can't divide by zero!
# Always runs

# Raise your own
age = -1
if age < 0:
    # raise ValueError("Age can't be negative")
    print("ValueError: Age can't be negative")
# ValueError: Age can't be negative

# Custom exception
class AppError(Exception):
    pass
```

### Common Exceptions

`ValueError` · `TypeError` · `KeyError` · `IndexError` · `FileNotFoundError` · `AttributeError` · `ZeroDivisionError` · `ImportError` · `NameError`

## 12. Modules & Imports

Modules and packages are Python's unit of code organization and reuse. This section explains import styles, aliases, namespace management, package layout, and the `__name__ == "__main__"` guard for script entry points. These concepts are key to scaling from single-file scripts to maintainable projects.

```python
import math
from math import sqrt, pi
import numpy as np                    # alias (third-party)
from collections import defaultdict

print(math.sqrt(16))                  # 4.0
print(sqrt(9), pi)                    # 3.0 3.141592653589793

# Your own modules — any .py file is a module
# utils.py → from utils import my_func

def main():
    print("Running as a script")

# Only run when executed directly (not imported)
if __name__ == "__main__":
    main()
# Running as a script
```

## 13. File I/O

File I/O is about safely reading and writing persistent data. This section covers context-managed file access with `with`, text and write modes, and structured formats like JSON. It also introduces `pathlib` for cross-platform path handling and cleaner file manipulation code.

```python
# Read
with open("data.txt", "r") as f:
    content = f.read()                # whole file as a string
    # or: lines = f.readlines()       # list of lines
    # or: for line in f:              # line by line (memory efficient)

# Write
with open("output.txt", "w") as f:    # 'w' = overwrite, 'a' = append
    f.write("Hello!\n")

# JSON
import json
with open("data.json", "w") as f:
    json.dump({"key": "value"}, f, indent=2)

with open("data.json", "r") as f:
    data = json.load(f)
data                                  # {'key': 'value'}

# pathlib (modern path handling)
from pathlib import Path
p = Path("data") / "file.txt"         # data/file.txt  (cross-platform)
p.exists()                            # False until the file is created
p.write_text("hello")
p.read_text()                         # 'hello'
Path("new/dir").mkdir(parents=True, exist_ok=True)
list(Path(".").glob("**/*.py"))       # [PosixPath('...')]  all .py files
```

## 14. Iterators & Generators

Iterators and generators power Python's lazy data pipelines. This section explains the iterator protocol (`iter`, `next`, `StopIteration`) and generator functions using `yield` for memory-efficient processing. You will also see how infinite streams and one-pass computation become practical with this model.

```python
# Generator — uses yield, lazy evaluation, memory efficient
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for num in countdown(5):
    print(num)
# 5
# 4
# 3
# 2
# 1

# Infinite generator
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
[next(fib) for _ in range(8)]   # [0, 1, 1, 2, 3, 5, 8, 13]
```

## 15. Decorators

Decorators let you extend function behavior without changing the original implementation. This section covers wrapper functions, metadata preservation with `functools.wraps`, decorator factories (decorators with arguments), and stacking order. These patterns are widely used for logging, timing, caching, validation, and authorization.

```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__}: {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_func():
    time.sleep(1)
    return "done"

print(slow_func())
# slow_func: 1.0012s
# done
```

## 16. Context Managers

Context managers define setup/teardown boundaries for resources such as files, locks, and timers. This section shows how `with` guarantees cleanup, even during exceptions, and how to build custom managers with `contextlib.contextmanager`. Mastering this pattern prevents resource leaks and keeps code reliable.

```python
import time
from contextlib import contextmanager

# Built-in — file handling
with open("file.txt") as f:
    data = f.read()
# file auto-closed here, even on error

# Custom (easy way)
@contextmanager
def timer():
    start = time.perf_counter()
    yield
    print(f"Elapsed: {time.perf_counter() - start:.4f}s")

with timer():
    time.sleep(1)
# Elapsed: 1.0012s
```

## 17. Type Hints

Type hints add explicit contracts to Python code without changing runtime behavior. This section covers parameter and return annotations, common generic types, and optional values. It also shows how tools like mypy and IDEs use hints to catch errors early and improve navigation.

```python
from typing import Optional

def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}! " * times

print(greet("Ada", 2))                 # Hello, Ada! Hello, Ada!

names: list[str] = ["Alice", "Bob"]
scores: dict[str, int] = {"Alice": 90}

def find(user_id: int) -> Optional[str]:   # str or None
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)

find(1)     # 'Alice'
find(99)    # None

# Check with: pip install mypy && mypy script.py
```

## 18. Unpacking & Useful Patterns

Unpacking and argument expansion are core Python patterns for expressive data handling. This section covers sequence unpacking, starred targets, argument spreading with `*` and `**`, and dictionary merging. It also introduces high-value built-ins (`any`, `all`, `min`, `max`, `sum`) for concise aggregate logic.

```python
def greet(a, b, c=0):
    return a + b + c

# Unpacking
a, b, c = [1, 2, 3]                    # a = 1, b = 2, c = 3
first, *rest = [1, 2, 3, 4, 5]         # first = 1, rest = [2, 3, 4, 5]
a, b = b, a                            # swap → a = 2, b = 1

# Dict merge
dict1 = {"x": 1}
dict2 = {"y": 2}
merged = {**dict1, **dict2}
merged                                 # {'x': 1, 'y': 2}

# Spread into function
args = [1, 2, 3]
greet(*args)                           # 6  → greet(1, 2, 3)

kwargs = {"a": 1, "b": 2}
greet(**kwargs)                        # 3  → greet(a=1, b=2)

# Useful built-ins
nums = [1, 7, 3, -2]
any(x > 5 for x in nums)               # True
all(x > 0 for x in nums)               # False
min(nums)                              # -2
max(nums)                              # 7
sum(nums)                              # 9

items = [{"name": "b"}, {"name": "a"}]
sorted(items, key=lambda x: x["name"]) # [{'name': 'a'}, {'name': 'b'}]
list(map(str.upper, ["a", "b"]))       # ['A', 'B']
list(filter(lambda n: n > 0, nums))    # [1, 7, 3]
```

## 19. Common Standard Library

Python's standard library provides production-grade tools for most daily tasks without third-party dependencies. This section surveys environment access (`os`, `sys`), numeric and date utilities, regex processing, structured logging, and specialized containers from `collections`. Knowing these modules helps you write faster, cleaner, and dependency-light code.

```python
import os
print(os.getcwd())                     # current directory, e.g. '/home/you/project'
print(os.environ.get("HOME"))          # env variable or None

import sys
print(sys.argv)                        # CLI arguments, e.g. ['script.py']

import math
math.sqrt(16)                          # 4.0
math.pi                                # 3.141592653589793
math.ceil(4.2)                         # 5

import random
random.randint(1, 10)                  # random int from 1 to 10 inclusive
random.choice(["a", "b", "c"])         # 'a', 'b', or 'c'
my_list = [1, 2, 3]
random.shuffle(my_list)                # shuffles my_list in place

import datetime
datetime.datetime.now()                # datetime.datetime(2026, 8, 17, ...)
datetime.date.today()                  # datetime.date(2026, 8, 17)

import re
re.search(r"\d+", "abc123").group()    # '123'
re.findall(r"\w+", "hello world")      # ['hello', 'world']
re.sub(r"\d+", "X", "abc123")          # 'abcX'

import logging
logging.basicConfig(level=logging.INFO)
logging.info("Started")                # INFO:root:Started
logging.error("Failed")                # ERROR:root:Failed

from collections import Counter, defaultdict
Counter(["a", "b", "a"])               # Counter({'a': 2, 'b': 1})
dd = defaultdict(list)
dd["key"].append("val")
dd                                     # defaultdict(<class 'list'>, {'key': ['val']})
```

## 20. Virtual Environments & Packages

Virtual environments isolate project dependencies so different projects can safely use different versions of packages. This section covers creating and activating a venv, installing packages with pip, and pinning dependencies with `requirements.txt`. These practices are essential for reproducible setups across machines and deployments.

```bash
# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate              # Windows
source .venv/bin/activate           # macOS/Linux

# Install packages
pip install requests flask
pip freeze > requirements.txt       # save dependencies
pip install -r requirements.txt     # restore dependencies

deactivate                          # exit venv
```

## 21. Async/Await (Quick Intro)

`async`/`await` enables cooperative concurrency, especially for I/O-bound workloads such as APIs, sockets, and disk operations. This section introduces coroutines, non-blocking waits, and task orchestration with `asyncio.gather`. You will learn the mental model for running many waiting operations efficiently in one thread.

```python
import asyncio

async def fetch(url, delay):
    await asyncio.sleep(delay)       # non-blocking wait
    return f"Data from {url}"

async def main():
    results = await asyncio.gather(
        fetch("url1", 2),
        fetch("url2", 1),
    )
    print(results)                   # runs in ~2s, not 3s

asyncio.run(main())
# ['Data from url1', 'Data from url2']
```

## 22. Pythonic Tips

Pythonic code emphasizes clarity, readability, and language-native idioms over verbose patterns. This section highlights practical conventions such as truthiness checks, `is None`, context-managed files, chained comparisons, and efficient string assembly. Adopting these habits makes your code more maintainable and immediately recognizable to other Python developers.

```python
my_list = []
x = None
items = ["a", "b"]
data = "abcdefghijk"
d = {"key": 42}

# ✅ Check empty
if not my_list:              # instead of: len(my_list) == 0
    print("empty")           # empty

# ✅ Check None
if x is None:                # instead of: x == None
    print("missing")         # missing

# ✅ Use enumerate, not range(len(...))
for i, item in enumerate(items):
    print(i, item)
# 0 a
# 1 b

# ✅ Use with for files
with open("f.txt", "w") as f:
    f.write("ok")            # auto-closes

# ✅ Chained comparison
x = 5
if 0 < x < 10:               # instead of: x > 0 and x < 10
    print("in range")        # in range

# ✅ String join (not += in loops)
words = ["hello", "python"]
result = " ".join(words)
result                       # 'hello python'

# ✅ dict.get() for safe access
value = d.get("key", "default")
value                        # 42

# ✅ Walrus operator (Python 3.8+)
if (n := len(data)) > 10:
    print(f"Too long: {n}")  # Too long: 11
```

### Naming Conventions (PEP 8)

| What       | Convention        | Example            |
|------------|-------------------|--------------------|
| Variables  | `snake_case`      | `user_name`        |
| Functions  | `snake_case`      | `get_user()`       |
| Classes    | `PascalCase`      | `UserAccount`      |
| Constants  | `UPPER_CASE`      | `MAX_RETRIES = 3`  |
| Private    | `_prefix`         | `self._internal`   |

## Quick Reference Card

A one-screen cheat sheet of the syntax and patterns used throughout this crash course. Use it for quick recall of constructs, then jump back to the related topic sections for deeper explanation and conceptual context.

```python
# Variables
x = 42
x, y = 1, 2                          # x = 1, y = 2

# Strings
name = "Ada"
f"Hi {name}"                         # 'Hi Ada'
"hello".upper()                      # 'HELLO'

# Lists
nums = [1, 2, 3]
nums.append(4)                       # [1, 2, 3, 4]
nums.pop()                           # 4
nums.sort()                          # [1, 2, 3]

# Dicts
d = {"k": "v"}
d.get("k")                           # 'v'
list(d.items())                      # [('k', 'v')]
list(d.keys())                       # ['k']

# Sets
{1, 2, 3} | {3, 4}                   # {1, 2, 3, 4}  union
{1, 2, 3} & {3, 4}                   # {3}           intersect
{1, 2, 3} - {3, 4}                   # {1, 2}        difference

# Comprehension
[x**2 for x in range(10) if x > 3]   # [16, 25, 36, 49, 64, 81]

# Functions
def f(a, b=1):
    return a + b

f(2)                                 # 3
(lambda x: x**2)(4)                  # 16

# Classes
class C:
    def __init__(self, value):
        self.value = value

C(1).value                           # 1

# Error handling
try:
    int("x")
except ValueError as e:
    print(e)                         # invalid literal for int() with base 10: 'x'
finally:
    print("done")                    # done

# Files
with open("f.txt", "w") as f:
    f.write("hello")
with open("f.txt") as f:
    f.read()                         # 'hello'

# Imports
from math import sqrt
sqrt(9)                              # 3.0
```

> 🐍 **Next steps:** For deeper coverage of OOP, generators, async, testing, and more — see the full [Python Course](python-course.md).
