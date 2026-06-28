[<- README](../README.md)

# Python Course

A fast-paced, comprehensive guide to Python. Every section builds on the last — by the end, you'll have a solid foundation to write real-world Python code.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Variables & Data Types](#2-variables--data-types)
3. [Operators](#3-operators)
4. [Strings In Depth](#4-strings-in-depth)
5. [Data Structures](#5-data-structures)
6. [Control Flow](#6-control-flow)
7. [Loops](#7-loops)
8. [Functions](#8-functions)
9. [Scope & Closures](#9-scope--closures)
10. [List Comprehensions & Generator Expressions](#10-list-comprehensions--generator-expressions)
11. [Object-Oriented Programming (OOP)](#11-object-oriented-programming-oop)
12. [Magic / Dunder Methods](#12-magic--dunder-methods)
13. [Modules & Packages](#13-modules--packages)
14. [Error Handling](#14-error-handling)
15. [File I/O](#15-file-io)
16. [Iterators & Generators](#16-iterators--generators)
17. [Decorators](#17-decorators)
18. [Context Managers](#18-context-managers)
19. [Type Hints](#19-type-hints)
20. [Lambda, Map, Filter, Reduce](#20-lambda-map-filter-reduce)
21. [args & kwargs](#21-args--kwargs)
22. [Unpacking & Destructuring](#22-unpacking--destructuring)
23. [String Formatting](#23-string-formatting)
24. [Regular Expressions](#24-regular-expressions)
25. [Date & Time](#25-date--time)
26. [Collections Module](#26-collections-module)
27. [Dataclasses](#27-dataclasses)
28. [Enums](#28-enums)
29. [Async / Await (Asyncio)](#29-async--await-asyncio)
30. [Concurrency: Threading & Multiprocessing](#30-concurrency-threading--multiprocessing)
31. [Virtual Environments & Dependency Management](#31-virtual-environments--dependency-management)
32. [Testing](#32-testing)
33. [Useful Standard Library Modules](#33-useful-standard-library-modules)
34. [Pythonic Idioms & Best Practices](#34-pythonic-idioms--best-practices)
35. [What's Next?](#35-whats-next)

---

## 1. Getting Started

### Installing Python

Download from [python.org](https://www.python.org/downloads/). On install, **check "Add Python to PATH"**.

Verify installation:

```bash
python --version   # or python3 --version on macOS/Linux
pip --version
```

### Running Python Code

```bash
# Interactive REPL
python

# Run a script
python my_script.py
```

### Your First Program

```python
print("Hello, World!")
```

### Comments

```python
# This is a single-line comment

"""
This is a multi-line string,
often used as a docstring or block comment.
"""
```

---

## 2. Variables & Data Types

Python is **dynamically typed** — you don't declare types, the interpreter figures it out.

```python
# Variable assignment (no keyword needed)
name = "Alice"          # str
age = 30                # int
height = 5.7            # float
is_student = True       # bool
nothing = None          # NoneType

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0           # all point to 0
```

### Core Data Types

| Type      | Example                        | Mutable? |
|-----------|--------------------------------|----------|
| `int`     | `42`, `-7`, `0b1010`          | No       |
| `float`   | `3.14`, `-0.001`, `1e10`     | No       |
| `complex` | `3 + 4j`                      | No       |
| `bool`    | `True`, `False`               | No       |
| `str`     | `"hello"`, `'world'`         | No       |
| `list`    | `[1, 2, 3]`                  | **Yes**  |
| `tuple`   | `(1, 2, 3)`                  | No       |
| `set`     | `{1, 2, 3}`                  | **Yes**  |
| `dict`    | `{"a": 1, "b": 2}`           | **Yes**  |
| `None`    | `None`                        | No       |

### Type Checking & Conversion

```python
type(42)            # <class 'int'>
isinstance(42, int) # True

# Casting
int("42")           # 42
float("3.14")       # 3.14
str(100)            # "100"
bool(0)             # False  (0, "", [], None are falsy)
bool(1)             # True   (everything else is truthy)
list("abc")         # ['a', 'b', 'c']
```

---

## 3. Operators

### Arithmetic

```python
5 + 3     # 8    Addition
5 - 3     # 2    Subtraction
5 * 3     # 15   Multiplication
5 / 3     # 1.66 True division (always float)
5 // 3    # 1    Floor division (integer)
5 % 3     # 2    Modulo (remainder)
5 ** 3    # 125  Exponentiation
```

### Comparison

```python
5 == 5    # True    Equal
5 != 3    # True    Not equal
5 > 3     # True    Greater than
5 < 3     # False   Less than
5 >= 5    # True    Greater than or equal
5 <= 3    # False   Less than or equal
```

### Logical

```python
True and False   # False
True or False    # True
not True         # False

# Short-circuit evaluation
0 and "hello"    # 0      (stops at first falsy)
0 or "hello"     # "hello" (returns first truthy)
```

### Identity & Membership

```python
# Identity — checks if same object in memory
a = [1, 2]
b = a
a is b           # True  (same object)
a is not b       # False

c = [1, 2]
a is c           # False (equal value, different object)
a == c           # True  (equal value)

# Membership
3 in [1, 2, 3]       # True
"x" not in "hello"   # True
```

### Assignment Shortcuts

```python
x = 10
x += 5    # x = 15
x -= 3    # x = 12
x *= 2    # x = 24
x /= 4    # x = 6.0
x //= 2   # x = 3.0
x **= 2   # x = 9.0
x %= 4    # x = 1.0
```

### Walrus Operator `:=` (Python 3.8+)

Assigns and returns a value in one expression.

```python
# Without walrus
data = input("Enter: ")
if len(data) > 5:
    print(f"Too long: {len(data)} chars")

# With walrus
if (n := len(input("Enter: "))) > 5:
    print(f"Too long: {n} chars")

# Useful in while loops
while (line := input(">>> ")) != "quit":
    print(f"You said: {line}")
```

### Ternary (Conditional Expression)

```python
age = 20
status = "adult" if age >= 18 else "minor"
```

---

## 4. Strings In Depth

Strings are **immutable sequences** of Unicode characters.

```python
s = "Hello, World!"
s = 'Hello, World!'        # single or double quotes
s = """Multi
line string"""
```

### Indexing & Slicing

```python
s = "Python"
s[0]       # 'P'     first character
s[-1]      # 'n'     last character
s[1:4]     # 'yth'   index 1 up to (not including) 4
s[:3]      # 'Pyt'   first 3
s[3:]      # 'hon'   from index 3 to end
s[::2]     # 'Pto'   every 2nd character
s[::-1]    # 'nohtyP' reversed
```

### Common String Methods

```python
s = "  Hello, World!  "

s.strip()               # "Hello, World!"     remove whitespace
s.lstrip()              # "Hello, World!  "
s.rstrip()              # "  Hello, World!"
s.lower()               # "  hello, world!  "
s.upper()               # "  HELLO, WORLD!  "
s.title()               # "  Hello, World!  "
s.capitalize()          # "  hello, world!  "

s.replace("World", "Python")  # "  Hello, Python!  "
s.split(",")            # ['  Hello', ' World!  ']
",".join(["a", "b"])    # "a,b"

s.find("World")         # 9   (index, or -1 if not found)
s.index("World")        # 9   (raises ValueError if not found)
s.count("l")            # 3

s.startswith("  He")    # True
s.endswith("!  ")       # True

"hello123".isalnum()    # True
"hello".isalpha()       # True
"123".isdigit()         # True
"  ".isspace()          # True
```

### String Immutability

```python
s = "hello"
# s[0] = "H"   # ❌ TypeError — strings can't be modified in place
s = "H" + s[1:]  # ✅ creates a new string: "Hello"
```

---

## 5. Data Structures

### Lists — Ordered, Mutable

```python
nums = [1, 2, 3, 4, 5]
mixed = [1, "two", 3.0, True, [5, 6]]  # can mix types

# Access
nums[0]          # 1
nums[-1]         # 5
nums[1:3]        # [2, 3]

# Modify
nums[0] = 10                # [10, 2, 3, 4, 5]
nums.append(6)              # [10, 2, 3, 4, 5, 6]
nums.insert(1, 99)          # [10, 99, 2, 3, 4, 5, 6]
nums.extend([7, 8])         # [10, 99, 2, 3, 4, 5, 6, 7, 8]
nums += [9]                 # same as extend for single list

# Remove
nums.remove(99)             # removes first occurrence
popped = nums.pop()         # removes & returns last item
popped = nums.pop(0)        # removes & returns item at index 0
del nums[0]                 # delete by index
nums.clear()                # empty the list

# Other operations
nums = [3, 1, 4, 1, 5]
nums.sort()                 # [1, 1, 3, 4, 5]  in-place
nums.sort(reverse=True)     # [5, 4, 3, 1, 1]
sorted_copy = sorted(nums)  # returns new sorted list
nums.reverse()              # in-place reverse
nums.index(4)               # index of first occurrence
nums.count(1)               # 2
len(nums)                   # 5
```

### Tuples — Ordered, Immutable

```python
point = (3, 4)
single = (42,)            # trailing comma needed for single-element tuple
empty = ()

x, y = point              # unpacking: x=3, y=4

point[0]                   # 3
# point[0] = 5            # ❌ TypeError — tuples are immutable

# Tuples are great for:
# - Returning multiple values from functions
# - Dictionary keys (lists can't be keys)
# - Data that shouldn't change
```

### Sets — Unordered, Unique Elements

```python
fruits = {"apple", "banana", "cherry"}
empty_set = set()          # NOT {} — that's an empty dict!

fruits.add("date")
fruits.discard("banana")   # no error if missing
fruits.remove("apple")     # KeyError if missing

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a | b          # {1, 2, 3, 4, 5, 6}   union
a & b          # {3, 4}               intersection
a - b          # {1, 2}               difference
a ^ b          # {1, 2, 5, 6}         symmetric difference

a.issubset(b)      # False
a.issuperset(b)    # False

# Deduplicate a list
nums = [1, 2, 2, 3, 3, 3]
unique = list(set(nums))   # [1, 2, 3] (order not guaranteed)
```

### Frozensets — Immutable Sets

```python
fs = frozenset([1, 2, 3])
# fs.add(4)   # ❌ AttributeError — frozensets are immutable
# Can be used as dict keys or set members (hashable)
```

### Dictionaries — Key-Value Pairs

```python
person = {
    "name": "Alice",
    "age": 30,
    "hobbies": ["reading", "chess"]
}

# Access
person["name"]                 # "Alice"
person.get("email", "N/A")    # "N/A"  (default if key missing)

# Modify
person["age"] = 31             # update existing
person["email"] = "a@b.com"   # add new key

# Remove
del person["email"]
popped = person.pop("age")    # removes & returns value
person.popitem()               # removes & returns last pair

# Iteration
for key in person:                     # iterates over keys
    print(key, person[key])

for key, value in person.items():      # key-value pairs
    print(f"{key}: {value}")

for value in person.values():          # just values
    print(value)

# Useful methods
person.keys()              # dict_keys([...])
person.values()            # dict_values([...])
person.items()             # dict_items([(k,v), ...])
person.update({"age": 32, "city": "NYC"})

# Check membership
"name" in person           # True (checks keys)

# Merge dicts (Python 3.9+)
merged = {"a": 1} | {"b": 2}   # {"a": 1, "b": 2}
```

### Nested Data Structures

```python
students = [
    {"name": "Alice", "grades": [90, 85, 92]},
    {"name": "Bob", "grades": [78, 88, 95]},
]

students[0]["grades"][2]   # 92
```

---

## 6. Control Flow

### if / elif / else

```python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(grade)   # B
```

> **Note:** Python uses **indentation** (4 spaces by convention) instead of braces `{}` to define blocks.

### match / case (Python 3.10+) — Structural Pattern Matching

```python
command = "quit"

match command:
    case "quit" | "exit":
        print("Goodbye!")
    case "help":
        print("Available commands: quit, help, status")
    case str(cmd) if cmd.startswith("open"):
        print(f"Opening: {cmd[5:]}")
    case _:
        print(f"Unknown command: {command}")

# Pattern matching with data structures
point = (0, 5)

match point:
    case (0, 0):
        print("Origin")
    case (0, y):
        print(f"On Y-axis at y={y}")
    case (x, 0):
        print(f"On X-axis at x={x}")
    case (x, y):
        print(f"Point at ({x}, {y})")
```

---

## 7. Loops

### for Loop

Python's `for` iterates over **any iterable** (lists, strings, ranges, etc.).

```python
# Iterate over a list
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)

# range(start, stop, step)
for i in range(5):            # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 3):    # 2, 5, 8
    print(i)

# enumerate — get index + value
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

for i, fruit in enumerate(fruits, start=1):  # start index at 1
    print(f"{i}: {fruit}")

# zip — iterate over multiple sequences in parallel
names = ["Alice", "Bob"]
scores = [90, 85]
for name, score in zip(names, scores):
    print(f"{name}: {score}")

# Iterate over dict
person = {"name": "Alice", "age": 30}
for key, value in person.items():
    print(f"{key}: {value}")

# Nested loops
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()  # newline
```

### while Loop

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

### Loop Control

```python
# break — exit the loop entirely
for i in range(10):
    if i == 5:
        break        # stops at 5
    print(i)

# continue — skip to next iteration
for i in range(10):
    if i % 2 == 0:
        continue     # skip even numbers
    print(i)         # 1, 3, 5, 7, 9

# else on loops — runs if loop completes WITHOUT break
for i in range(5):
    if i == 10:
        break
else:
    print("Loop completed normally")  # this prints

for i in range(5):
    if i == 3:
        break
else:
    print("Won't print")  # skipped because of break

# pass — placeholder for empty blocks
for i in range(5):
    pass   # do nothing (useful during development)
```

---

## 8. Functions

### Basic Functions

```python
def greet(name):
    """Greet a person by name."""   # docstring
    return f"Hello, {name}!"

message = greet("Alice")
print(message)   # Hello, Alice!
```

### Parameters & Arguments

```python
# Positional arguments
def add(a, b):
    return a + b

add(3, 5)    # 8

# Default values
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")            # "Hello, Alice!"
greet("Alice", "Hey")     # "Hey, Alice!"

# Keyword arguments
greet(greeting="Hi", name="Bob")   # "Hi, Bob!"

# ⚠️ GOTCHA: Mutable default arguments
def append_to(value, lst=[]):   # ❌ BAD — shared across calls!
    lst.append(value)
    return lst

# ✅ FIX: Use None as default
def append_to(value, lst=None):
    if lst is None:
        lst = []
    lst.append(value)
    return lst
```

### Return Values

```python
# Return multiple values (as a tuple)
def divide(a, b):
    quotient = a // b
    remainder = a % b
    return quotient, remainder

q, r = divide(17, 5)   # q=3, r=2

# Return None implicitly if no return statement
def do_nothing():
    pass

result = do_nothing()   # None
```

### Docstrings

```python
def calculate_bmi(weight_kg, height_m):
    """
    Calculate Body Mass Index (BMI).

    Args:
        weight_kg: Weight in kilograms.
        height_m: Height in meters.

    Returns:
        BMI as a float.

    Raises:
        ValueError: If height is zero or negative.
    """
    if height_m <= 0:
        raise ValueError("Height must be positive")
    return weight_kg / (height_m ** 2)

# Access docstring
print(calculate_bmi.__doc__)
help(calculate_bmi)
```

---

## 9. Scope & Closures

### LEGB Rule

Python resolves names in this order: **L**ocal → **E**nclosing → **G**lobal → **B**uilt-in.

```python
x = "global"            # Global scope

def outer():
    x = "enclosing"     # Enclosing scope

    def inner():
        x = "local"     # Local scope
        print(x)        # "local"

    inner()
    print(x)            # "enclosing"

outer()
print(x)                # "global"
```

### global & nonlocal

```python
count = 0

def increment():
    global count          # modify the global variable
    count += 1

increment()
print(count)              # 1

def outer():
    x = 10
    def inner():
        nonlocal x        # modify the enclosing variable
        x += 1
    inner()
    print(x)              # 11

outer()
```

### Closures

A closure is a function that remembers values from its enclosing scope.

```python
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # 'factor' is captured from enclosing scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

double(5)    # 10
triple(5)    # 15
```

---

## 10. List Comprehensions & Generator Expressions

### List Comprehensions

```python
# Basic: [expression for item in iterable]
squares = [x ** 2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition: [expression for item in iterable if condition]
evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

# With if/else (note: the if/else goes BEFORE for)
labels = ["even" if x % 2 == 0 else "odd" for x in range(5)]
# ['even', 'odd', 'even', 'odd', 'even']

# Nested
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [num for row in matrix for num in row]
# [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Dict & Set Comprehensions

```python
# Dict comprehension
squares = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Set comprehension
unique_lengths = {len(word) for word in ["hello", "hi", "hey", "world"]}
# {2, 3, 5}
```

### Generator Expressions

Like list comprehensions but **lazy** — values are produced one at a time, saving memory.

```python
# Use () instead of []
gen = (x ** 2 for x in range(1_000_000))  # no list in memory!

# Consume one at a time
next(gen)    # 0
next(gen)    # 1

# Often used directly in functions
total = sum(x ** 2 for x in range(1000))
```

---

## 11. Object-Oriented Programming (OOP)

### Classes & Objects

```python
class Dog:
    # Class attribute (shared by all instances)
    species = "Canis familiaris"

    def __init__(self, name, age):
        """Constructor — called when creating an instance."""
        # Instance attributes (unique per instance)
        self.name = name
        self.age = age

    def bark(self):
        """Instance method."""
        return f"{self.name} says Woof!"

    def __str__(self):
        """Human-readable string representation."""
        return f"{self.name}, {self.age} years old"

    def __repr__(self):
        """Developer-friendly representation."""
        return f"Dog(name='{self.name}', age={self.age})"

# Create instances
buddy = Dog("Buddy", 5)
print(buddy.name)      # Buddy
print(buddy.bark())    # Buddy says Woof!
print(buddy)           # Buddy, 5 years old  (calls __str__)
```

### Inheritance

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("Subclasses must implement speak()")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

dog = Dog("Buddy")
cat = Cat("Whiskers")
print(dog.speak())     # Buddy says Woof!
print(cat.speak())     # Whiskers says Meow!

# Check inheritance
isinstance(dog, Animal)    # True
issubclass(Dog, Animal)    # True
```

### super()

```python
class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name, sound="Woof")   # call parent __init__
        self.breed = breed

dog = Dog("Buddy", "Golden Retriever")
print(dog.name, dog.sound, dog.breed)
```

### Multiple Inheritance & MRO

```python
class A:
    def greet(self):
        return "Hello from A"

class B(A):
    def greet(self):
        return "Hello from B"

class C(A):
    def greet(self):
        return "Hello from C"

class D(B, C):   # inherits from both B and C
    pass

d = D()
print(d.greet())   # "Hello from B" — follows MRO (Method Resolution Order)
print(D.__mro__)   # D -> B -> C -> A -> object
```

### Properties (Getters & Setters)

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius    # convention: _ prefix = "private"

    @property
    def radius(self):
        """Getter."""
        return self._radius

    @radius.setter
    def radius(self, value):
        """Setter with validation."""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def area(self):
        """Computed property (read-only)."""
        return 3.14159 * self._radius ** 2

c = Circle(5)
print(c.radius)       # 5        (uses getter)
print(c.area)         # 78.539   (computed)
c.radius = 10         # uses setter
# c.radius = -1       # ❌ ValueError
```

### Class Methods & Static Methods

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_string):
        """Alternative constructor — receives the class, not instance."""
        year, month, day = map(int, date_string.split("-"))
        return cls(year, month, day)

    @staticmethod
    def is_valid(date_string):
        """Utility — no access to class or instance."""
        parts = date_string.split("-")
        return len(parts) == 3 and all(p.isdigit() for p in parts)

d = Date.from_string("2024-01-15")
print(d.year)                       # 2024
print(Date.is_valid("2024-01-15"))  # True
```

### Abstract Base Classes

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        """Subclasses MUST implement this."""
        pass

    @abstractmethod
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

# shape = Shape()        # ❌ TypeError — can't instantiate abstract class
rect = Rectangle(4, 5)   # ✅
print(rect.area())       # 20
```

---

## 12. Magic / Dunder Methods

These special methods let you customize how your objects behave with built-in operations.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # String representations
    def __str__(self):         return f"({self.x}, {self.y})"
    def __repr__(self):        return f"Vector({self.x}, {self.y})"

    # Arithmetic
    def __add__(self, other):  return Vector(self.x + other.x, self.y + other.y)
    def __sub__(self, other):  return Vector(self.x - other.x, self.y - other.y)
    def __mul__(self, scalar): return Vector(self.x * scalar, self.y * scalar)

    # Comparison
    def __eq__(self, other):   return self.x == other.x and self.y == other.y
    def __lt__(self, other):   return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    # Container behavior
    def __len__(self):         return 2
    def __getitem__(self, i):  return [self.x, self.y][i]

    # Make it hashable (needed for sets/dict keys)
    def __hash__(self):        return hash((self.x, self.y))

    # Boolean
    def __bool__(self):        return self.x != 0 or self.y != 0

v1 = Vector(1, 2)
v2 = Vector(3, 4)

print(v1 + v2)       # (4, 6)
print(v1 * 3)         # (3, 6)
print(v1 == v2)       # False
print(len(v1))        # 2
print(v1[0])          # 1
```

### Common Dunder Methods Reference

| Method            | Trigger                | Purpose                    |
|-------------------|------------------------|----------------------------|
| `__init__`        | `ClassName()`          | Constructor                |
| `__str__`         | `str(obj)`, `print()`  | Human-readable string      |
| `__repr__`        | `repr(obj)`, REPL      | Developer string           |
| `__len__`         | `len(obj)`             | Length                     |
| `__getitem__`     | `obj[key]`             | Index/key access           |
| `__setitem__`     | `obj[key] = val`       | Index/key assignment       |
| `__contains__`    | `x in obj`             | Membership test            |
| `__iter__`        | `for x in obj`         | Iteration                  |
| `__next__`        | `next(obj)`            | Next value in iteration    |
| `__call__`        | `obj()`                | Make instance callable     |
| `__enter__/__exit__` | `with obj:`         | Context manager            |
| `__eq__`, `__lt__`, etc. | `==`, `<`, etc.  | Comparisons               |
| `__add__`, `__mul__`, etc. | `+`, `*`, etc. | Arithmetic                |
| `__hash__`        | `hash(obj)`            | Hashing (for sets/dicts)   |

---

## 13. Modules & Packages

### Importing

```python
# Import entire module
import math
print(math.sqrt(16))     # 4.0

# Import specific items
from math import sqrt, pi
print(sqrt(16))           # 4.0
print(pi)                 # 3.14159...

# Import with alias
import numpy as np
from collections import defaultdict as dd

# Import everything (avoid in production code)
from math import *
```

### Creating Your Own Module

```
my_project/
├── main.py
├── utils.py            ← module (any .py file)
└── helpers/
    ├── __init__.py     ← makes this directory a package
    ├── math_ops.py
    └── string_ops.py
```

```python
# utils.py
def add(a, b):
    return a + b

PI = 3.14159

# main.py
from utils import add, PI
from helpers.math_ops import multiply
```

### `__name__` Guard

```python
# utils.py
def main():
    print("Running utils directly")

if __name__ == "__main__":
    # Only runs when this file is executed directly,
    # NOT when imported as a module
    main()
```

### `__init__.py`

```python
# helpers/__init__.py
# Controls what's available when you "import helpers"
from .math_ops import multiply
from .string_ops import clean

# Now you can do: from helpers import multiply, clean
```

---

## 14. Error Handling

### try / except / else / finally

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Can't divide by zero!")
except (TypeError, ValueError) as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")  # catch-all (use sparingly)
else:
    print(f"Result: {result}")       # runs only if NO exception
finally:
    print("This always runs")        # cleanup code
```

### Common Built-in Exceptions

| Exception            | When It Occurs                        |
|----------------------|---------------------------------------|
| `ValueError`         | Wrong value (e.g., `int("abc")`)      |
| `TypeError`          | Wrong type (e.g., `"a" + 1`)         |
| `KeyError`           | Missing dict key                      |
| `IndexError`         | List index out of range               |
| `AttributeError`     | Missing attribute/method              |
| `FileNotFoundError`  | File doesn't exist                    |
| `ZeroDivisionError`  | Division by zero                      |
| `ImportError`        | Failed import                         |
| `StopIteration`      | Iterator exhausted                    |
| `RuntimeError`       | Generic runtime error                 |
| `NameError`          | Undefined variable                    |

### Raising Exceptions

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("Age must be an integer")
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

# Re-raise an exception
try:
    risky_operation()
except Exception:
    logging.error("Something went wrong")
    raise   # re-raises the original exception
```

### Custom Exceptions

```python
class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the balance."""
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(
            f"Cannot withdraw ${amount}. Balance: ${balance}"
        )

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount

try:
    account = BankAccount(100)
    account.withdraw(150)
except InsufficientFundsError as e:
    print(e)           # Cannot withdraw $150. Balance: $100
    print(e.balance)   # 100
```

---

## 15. File I/O

### Reading Files

```python
# Best practice: use 'with' (auto-closes file)
with open("data.txt", "r") as f:
    content = f.read()           # entire file as string

with open("data.txt", "r") as f:
    lines = f.readlines()        # list of lines (includes \n)

with open("data.txt", "r") as f:
    for line in f:               # memory-efficient line-by-line
        print(line.strip())
```

### Writing Files

```python
# Write (overwrites file)
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")

# Append
with open("output.txt", "a") as f:
    f.write("Appended line\n")

# Write multiple lines
lines = ["line 1\n", "line 2\n", "line 3\n"]
with open("output.txt", "w") as f:
    f.writelines(lines)
```

### File Modes

| Mode | Description                               |
|------|-------------------------------------------|
| `r`  | Read (default)                            |
| `w`  | Write (creates/overwrites)                |
| `a`  | Append                                    |
| `x`  | Exclusive creation (fails if exists)      |
| `b`  | Binary mode (e.g., `rb`, `wb`)            |
| `+`  | Read and write (e.g., `r+`)              |

### Working with JSON

```python
import json

# Write JSON
data = {"name": "Alice", "scores": [90, 85, 92]}
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON
with open("data.json", "r") as f:
    loaded = json.load(f)

# String conversion
json_str = json.dumps(data, indent=2)   # dict → JSON string
parsed = json.loads(json_str)           # JSON string → dict
```

### Working with CSV

```python
import csv

# Write CSV
with open("data.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age", "City"])
    writer.writerow(["Alice", 30, "NYC"])
    writer.writerow(["Bob", 25, "LA"])

# Read CSV
with open("data.csv", "r") as f:
    reader = csv.reader(f)
    header = next(reader)            # skip header
    for row in reader:
        print(row)                   # ['Alice', '30', 'NYC']

# DictReader / DictWriter — uses column names
with open("data.csv", "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["Name"], row["Age"])
```

### pathlib — Modern Path Handling

```python
from pathlib import Path

# Create path objects
p = Path("data") / "subfolder" / "file.txt"   # cross-platform
p = Path.home() / "Documents"
p = Path.cwd()                                 # current directory

# Check existence
p.exists()
p.is_file()
p.is_dir()

# Read/write shortcuts
content = Path("data.txt").read_text()
Path("output.txt").write_text("Hello!")

# File info
p.name          # "file.txt"
p.stem          # "file"
p.suffix        # ".txt"
p.parent        # Path("data/subfolder")

# List directory
for item in Path(".").iterdir():
    print(item)

# Glob patterns
for py_file in Path(".").glob("**/*.py"):   # recursive
    print(py_file)

# Create directories
Path("new/nested/dir").mkdir(parents=True, exist_ok=True)
```

---

## 16. Iterators & Generators

### Iterators

Any object with `__iter__()` and `__next__()` methods.

```python
# Lists, strings, etc. are iterable — they produce iterators
nums = [1, 2, 3]
it = iter(nums)        # get an iterator
next(it)               # 1
next(it)               # 2
next(it)               # 3
# next(it)             # ❌ StopIteration

# Custom iterator
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        val = self.current
        self.current -= 1
        return val

for num in Countdown(5):
    print(num)   # 5, 4, 3, 2, 1
```

### Generators — Easy Iterators

Use `yield` instead of `return`. The function's state is saved between calls.

```python
def countdown(n):
    while n > 0:
        yield n       # pause here, return value, resume on next call
        n -= 1

for num in countdown(5):
    print(num)         # 5, 4, 3, 2, 1

# Generator to produce infinite sequence
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
[next(fib) for _ in range(10)]   # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### yield from

```python
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)   # delegate to sub-generator
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))   # [1, 2, 3, 4, 5, 6]
```

### Why Generators?

- **Memory efficient** — values are produced one at a time, not stored in memory
- **Lazy evaluation** — only compute when needed
- **Composable** — chain generators together for pipelines

```python
# Processing a huge file line by line
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

def filter_errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

# Pipeline — processes one line at a time, constant memory
lines = read_large_file("huge.log")
errors = filter_errors(lines)
for error in errors:
    print(error)
```

---

## 17. Decorators

A decorator wraps a function to add behavior before/after it runs.

### Function Decorators

```python
import functools
import time

def timer(func):
    """Measure execution time of a function."""
    @functools.wraps(func)    # preserves original function's metadata
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"

slow_function()   # slow_function took 1.0012s
```

### Decorators with Arguments

```python
def repeat(n):
    """Decorator that calls the function n times."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def say_hello():
    print("Hello!")

say_hello()
# Hello!
# Hello!
# Hello!
```

### Stacking Decorators

```python
@decorator_a
@decorator_b
def func():
    pass

# Equivalent to: func = decorator_a(decorator_b(func))
# decorator_b is applied first, then decorator_a wraps the result
```

### Class Decorators

```python
def singleton(cls):
    """Ensure only one instance of a class exists."""
    instances = {}
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self):
        print("Connecting to database...")

db1 = Database()   # "Connecting to database..."
db2 = Database()   # (no print — same instance returned)
print(db1 is db2)  # True
```

---

## 18. Context Managers

Ensure setup/teardown code always runs (like `try/finally` but cleaner).

### Using `with`

```python
# File handling — file is always closed, even on error
with open("file.txt") as f:
    data = f.read()
# f is automatically closed here
```

### Custom Context Manager (Class)

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {self.elapsed:.4f}s")
        return False   # don't suppress exceptions

with Timer() as t:
    time.sleep(1)
# Elapsed: 1.0010s
```

### Custom Context Manager (Generator — easier)

```python
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.perf_counter()
    yield                            # code in the 'with' block runs here
    elapsed = time.perf_counter() - start
    print(f"Elapsed: {elapsed:.4f}s")

with timer():
    time.sleep(1)

# Handle exceptions in generator-based context managers
@contextmanager
def managed_resource(name):
    print(f"Acquiring {name}")
    try:
        yield name
    finally:
        print(f"Releasing {name}")
```

---

## 19. Type Hints

Python is dynamically typed, but type hints add **optional static typing** for documentation and IDE support.

```python
# Variable annotations
name: str = "Alice"
age: int = 30
scores: list[int] = [90, 85, 92]

# Function annotations
def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! " * times).strip()

# Common types
from typing import Optional, Union

def find_user(user_id: int) -> Optional[str]:
    """Returns username or None."""
    ...

def process(value: Union[str, int]) -> None:
    """Accepts str or int."""    # Python 3.10+: str | int
    ...

# Collections (Python 3.9+, use typing module for older versions)
names: list[str] = ["Alice", "Bob"]
scores: dict[str, int] = {"Alice": 90}
coordinates: tuple[float, float] = (1.0, 2.0)
unique_ids: set[int] = {1, 2, 3}

# Callable
from typing import Callable

def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# TypeAlias (Python 3.10+)
type Vector = list[float]   # Python 3.12+ syntax
# or
from typing import TypeAlias
Vector: TypeAlias = list[float]
```

> **Note:** Type hints are **not enforced** at runtime. Use tools like `mypy` for static checking: `pip install mypy && mypy your_script.py`

---

## 20. Lambda, Map, Filter, Reduce

### Lambda — Anonymous Functions

```python
# lambda arguments: expression
square = lambda x: x ** 2
square(5)    # 25

add = lambda x, y: x + y
add(3, 5)    # 8

# Useful for short callbacks
points = [(1, 2), (3, 1), (5, 0)]
points.sort(key=lambda p: p[1])   # sort by y coordinate
# [(5, 0), (3, 1), (1, 2)]
```

### map() — Apply Function to Every Item

```python
nums = [1, 2, 3, 4, 5]

squared = list(map(lambda x: x ** 2, nums))
# [1, 4, 9, 16, 25]

# Equivalent list comprehension (preferred in most cases)
squared = [x ** 2 for x in nums]
```

### filter() — Keep Items That Match

```python
nums = [1, 2, 3, 4, 5, 6, 7, 8]

evens = list(filter(lambda x: x % 2 == 0, nums))
# [2, 4, 6, 8]

# Equivalent list comprehension
evens = [x for x in nums if x % 2 == 0]
```

### reduce() — Accumulate Values

```python
from functools import reduce

nums = [1, 2, 3, 4, 5]

total = reduce(lambda acc, x: acc + x, nums)      # 15
product = reduce(lambda acc, x: acc * x, nums)     # 120
maximum = reduce(lambda a, b: a if a > b else b, nums)  # 5

# With initial value
total = reduce(lambda acc, x: acc + x, nums, 100)  # 115
```

---

## 21. *args & **kwargs

### *args — Variable Positional Arguments

```python
def add(*args):
    """Accept any number of positional arguments."""
    print(type(args))   # <class 'tuple'>
    return sum(args)

add(1, 2, 3)        # 6
add(1, 2, 3, 4, 5)  # 15
```

### **kwargs — Variable Keyword Arguments

```python
def print_info(**kwargs):
    """Accept any number of keyword arguments."""
    print(type(kwargs))   # <class 'dict'>
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="NYC")
# name: Alice
# age: 30
# city: NYC
```

### Combining All Parameter Types

```python
def func(a, b, *args, key="default", **kwargs):
    print(f"a={a}, b={b}")
    print(f"args={args}")
    print(f"key={key}")
    print(f"kwargs={kwargs}")

func(1, 2, 3, 4, key="custom", x=10, y=20)
# a=1, b=2
# args=(3, 4)
# key=custom
# kwargs={'x': 10, 'y': 20}
```

### Spreading / Unpacking into Function Calls

```python
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
add(*args)           # 6  (unpacks list into positional args)

kwargs = {"a": 1, "b": 2, "c": 3}
add(**kwargs)        # 6  (unpacks dict into keyword args)
```

---

## 22. Unpacking & Destructuring

```python
# Tuple/list unpacking
a, b, c = [1, 2, 3]

# Star unpacking
first, *rest = [1, 2, 3, 4, 5]       # first=1, rest=[2,3,4,5]
first, *middle, last = [1, 2, 3, 4]   # first=1, middle=[2,3], last=4
*head, tail = [1, 2, 3]               # head=[1,2], tail=3

# Swap variables
a, b = b, a

# Ignore values
_, b, _ = (1, 2, 3)     # only care about b

# Nested unpacking
(a, b), (c, d) = [1, 2], [3, 4]

# Dict unpacking / merging
defaults = {"color": "blue", "size": 10}
custom = {"size": 20, "weight": 5}
merged = {**defaults, **custom}
# {"color": "blue", "size": 20, "weight": 5}
```

---

## 23. String Formatting

```python
name = "Alice"
age = 30
pi = 3.14159

# f-strings (Python 3.6+ — preferred)
f"Hello, {name}! You're {age} years old."
f"Pi is approximately {pi:.2f}"             # "3.14"
f"{'hello':>20}"                            # right-align in 20 chars
f"{'hello':^20}"                            # center in 20 chars
f"{1000000:,}"                              # "1,000,000"
f"{0.85:.1%}"                               # "85.0%"
f"{255:#x}"                                 # "0xff"
f"{'yes' if age >= 18 else 'no'}"           # expressions in f-strings
f"{name!r}"                                 # repr: "'Alice'"

# .format() method
"Hello, {}! Age: {}".format(name, age)
"Hello, {n}! Age: {a}".format(n=name, a=age)

# % formatting (old style — avoid in new code)
"Hello, %s! Age: %d" % (name, age)
```

### Multi-line f-strings

```python
message = (
    f"Name: {name}\n"
    f"Age:  {age}\n"
    f"Pi:   {pi:.4f}"
)
```

---

## 24. Regular Expressions

```python
import re

text = "My email is alice@example.com and phone is 555-123-4567"

# Search — find first match
match = re.search(r"\d{3}-\d{3}-\d{4}", text)
if match:
    print(match.group())    # "555-123-4567"
    print(match.start())    # start index
    print(match.span())     # (start, end) tuple

# Find all matches
emails = re.findall(r"[\w.]+@[\w.]+", text)
# ['alice@example.com']

# Match — only matches at the START of the string
match = re.match(r"My", text)   # matches
match = re.match(r"email", text)  # None (not at start)

# Sub — find and replace
cleaned = re.sub(r"\d{3}-\d{3}-\d{4}", "[REDACTED]", text)
# "My email is alice@example.com and phone is [REDACTED]"

# Split
parts = re.split(r"[,;]\s*", "a, b; c,  d")
# ['a', 'b', 'c', 'd']

# Compile for reuse (performance optimization)
pattern = re.compile(r"\b[A-Z][a-z]+\b")
names = pattern.findall("Alice met Bob at the Park")
# ['Alice', 'Bob', 'Park']

# Groups — capture parts of a match
match = re.search(r"(\w+)@(\w+)\.(\w+)", "alice@example.com")
match.group(0)     # "alice@example.com"   (full match)
match.group(1)     # "alice"
match.group(2)     # "example"
match.group(3)     # "com"
match.groups()     # ("alice", "example", "com")

# Named groups
match = re.search(r"(?P<user>\w+)@(?P<domain>\w+\.\w+)", "alice@example.com")
match.group("user")     # "alice"
match.group("domain")   # "example.com"
```

### Common Regex Patterns

| Pattern     | Matches                          |
|-------------|----------------------------------|
| `.`         | Any character (except newline)   |
| `\d`        | Digit `[0-9]`                    |
| `\w`        | Word character `[a-zA-Z0-9_]`   |
| `\s`        | Whitespace                       |
| `\b`        | Word boundary                    |
| `^` / `$`   | Start / end of string            |
| `*`         | 0 or more                        |
| `+`         | 1 or more                        |
| `?`         | 0 or 1                           |
| `{n,m}`     | Between n and m times            |
| `[abc]`     | Character class                  |
| `[^abc]`    | Negated character class          |
| `(...)      | Capture group                    |
| `(?:...)`   | Non-capturing group              |
| `a\|b`      | Alternation (a or b)             |

---

## 25. Date & Time

```python
from datetime import datetime, date, time, timedelta
import time as time_module

# Current date/time
now = datetime.now()              # local time
utc_now = datetime.utcnow()      # UTC time
today = date.today()

# Create specific dates
d = date(2024, 6, 15)
dt = datetime(2024, 6, 15, 14, 30, 0)

# Access components
dt.year       # 2024
dt.month      # 6
dt.day        # 15
dt.hour       # 14
dt.minute     # 30

# Formatting (datetime → string)
dt.strftime("%Y-%m-%d %H:%M:%S")   # "2024-06-15 14:30:00"
dt.strftime("%B %d, %Y")           # "June 15, 2024"
dt.strftime("%I:%M %p")            # "02:30 PM"

# Parsing (string → datetime)
dt = datetime.strptime("2024-06-15", "%Y-%m-%d")

# ISO format
dt.isoformat()                     # "2024-06-15T14:30:00"
datetime.fromisoformat("2024-06-15T14:30:00")

# Time deltas (arithmetic)
tomorrow = today + timedelta(days=1)
next_week = today + timedelta(weeks=1)
diff = datetime(2024, 12, 31) - datetime(2024, 1, 1)
print(diff.days)                    # 365

# Timestamps
timestamp = time_module.time()           # seconds since epoch
dt = datetime.fromtimestamp(timestamp)

# Sleep
time_module.sleep(2)                     # pause for 2 seconds
```

### Common Format Codes

| Code | Meaning         | Example  |
|------|-----------------|----------|
| `%Y` | 4-digit year   | 2024     |
| `%m` | Month (01-12)  | 06       |
| `%d` | Day (01-31)    | 15       |
| `%H` | Hour (00-23)   | 14       |
| `%M` | Minute (00-59) | 30       |
| `%S` | Second (00-59) | 00       |
| `%B` | Full month     | June     |
| `%A` | Full weekday   | Saturday |
| `%I` | Hour (01-12)   | 02       |
| `%p` | AM/PM          | PM       |

---

## 26. Collections Module

Advanced container types beyond the built-in ones.

```python
from collections import (
    Counter, defaultdict, OrderedDict, namedtuple, deque, ChainMap
)

# Counter — count occurrences
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = Counter(words)
counter                     # Counter({'apple': 3, 'banana': 2, 'cherry': 1})
counter.most_common(2)      # [('apple', 3), ('banana', 2)]
counter["apple"]            # 3
counter["grape"]            # 0  (no KeyError!)

# Can also count characters
Counter("mississippi")      # Counter({'s': 4, 'i': 4, 'p': 2, 'm': 1})

# defaultdict — dict with default values for missing keys
dd = defaultdict(list)
dd["fruits"].append("apple")
dd["fruits"].append("banana")
dd["veggies"].append("carrot")
# {'fruits': ['apple', 'banana'], 'veggies': ['carrot']}

dd_int = defaultdict(int)    # default 0
dd_int["count"] += 1

# namedtuple — tuple with named fields
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x          # 3
p.y          # 4
p[0]         # 3  (still works like a tuple)
x, y = p     # unpacking works

# deque — double-ended queue (fast append/pop from both ends)
d = deque([1, 2, 3])
d.appendleft(0)      # deque([0, 1, 2, 3])
d.append(4)           # deque([0, 1, 2, 3, 4])
d.popleft()           # 0
d.pop()               # 4
d.rotate(1)           # rotate right by 1

# ChainMap — search multiple dicts as one
defaults = {"color": "blue", "size": 10}
user_prefs = {"color": "red"}
config = ChainMap(user_prefs, defaults)
config["color"]       # "red"   (first dict wins)
config["size"]        # 10      (falls through to defaults)
```

---

## 27. Dataclasses

Reduce boilerplate for data-holding classes. Available since **Python 3.7**.

```python
from dataclasses import dataclass, field, asdict, astuple

@dataclass
class Point:
    x: float
    y: float

# Auto-generates __init__, __repr__, __eq__
p1 = Point(1.0, 2.0)
p2 = Point(1.0, 2.0)
print(p1)            # Point(x=1.0, y=2.0)
print(p1 == p2)      # True

# Default values & mutable defaults
@dataclass
class Student:
    name: str
    age: int = 18
    grades: list[int] = field(default_factory=list)  # ✅ for mutable defaults

# Frozen (immutable)
@dataclass(frozen=True)
class Color:
    r: int
    g: int
    b: int

c = Color(255, 0, 0)
# c.r = 128          # ❌ FrozenInstanceError

# Ordering
@dataclass(order=True)
class Version:
    major: int
    minor: int
    patch: int

v1 = Version(1, 2, 3)
v2 = Version(2, 0, 0)
v1 < v2              # True

# Convert to dict/tuple
asdict(p1)           # {'x': 1.0, 'y': 2.0}
astuple(p1)          # (1.0, 2.0)

# Post-init processing
@dataclass
class Rectangle:
    width: float
    height: float
    area: float = field(init=False)   # not in __init__

    def __post_init__(self):
        self.area = self.width * self.height

r = Rectangle(4, 5)
r.area               # 20.0
```

---

## 28. Enums

Define named constants with `enum`.

```python
from enum import Enum, auto, IntEnum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

# Usage
c = Color.RED
c.name           # "RED"
c.value          # 1
Color(1)         # Color.RED  (lookup by value)
Color["RED"]     # Color.RED  (lookup by name)

# Iteration
for color in Color:
    print(color)   # Color.RED, Color.GREEN, Color.BLUE

# Comparison
Color.RED == Color.RED      # True
Color.RED is Color.RED      # True
Color.RED == 1              # False  (Enum != int)

# auto() — auto-assign values
class Direction(Enum):
    NORTH = auto()    # 1
    SOUTH = auto()    # 2
    EAST = auto()     # 3
    WEST = auto()     # 4

# IntEnum — allows comparison with integers
class Status(IntEnum):
    OK = 200
    NOT_FOUND = 404
    ERROR = 500

Status.OK == 200      # True
Status.OK < Status.NOT_FOUND  # True

# Use in match/case
match direction:
    case Direction.NORTH:
        print("Going north!")
```

---

## 29. Async / Await (Asyncio)

For **I/O-bound** concurrency (network requests, file I/O, databases).

```python
import asyncio

# Define a coroutine
async def fetch_data(url: str, delay: float) -> str:
    print(f"Fetching {url}...")
    await asyncio.sleep(delay)        # simulate network request
    return f"Data from {url}"

# Run a single coroutine
async def main():
    result = await fetch_data("https://api.example.com", 2)
    print(result)

asyncio.run(main())

# Run multiple coroutines concurrently
async def main():
    # gather — run all concurrently, collect results
    results = await asyncio.gather(
        fetch_data("url1", 2),
        fetch_data("url2", 1),
        fetch_data("url3", 3),
    )
    # Takes ~3s total (not 6s), because they run concurrently
    for r in results:
        print(r)

asyncio.run(main())

# TaskGroup (Python 3.11+ — preferred over gather)
async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("url1", 2))
        task2 = tg.create_task(fetch_data("url2", 1))

    print(task1.result(), task2.result())

asyncio.run(main())
```

### Async Iterators & Context Managers

```python
# Async for
async def fetch_pages():
    for i in range(5):
        await asyncio.sleep(0.5)
        yield f"Page {i}"

async def main():
    async for page in fetch_pages():
        print(page)

# Async context manager
class AsyncDB:
    async def __aenter__(self):
        print("Connecting...")
        await asyncio.sleep(1)
        return self

    async def __aexit__(self, *args):
        print("Disconnecting...")
        await asyncio.sleep(0.5)

async def main():
    async with AsyncDB() as db:
        print("Using database")
```

---

## 30. Concurrency: Threading & Multiprocessing

### Threading — For I/O-bound Tasks

```python
import threading
import time

def download(url):
    print(f"Downloading {url}...")
    time.sleep(2)    # simulate I/O
    print(f"Done: {url}")

# Create and start threads
threads = []
for url in ["url1", "url2", "url3"]:
    t = threading.Thread(target=download, args=(url,))
    threads.append(t)
    t.start()

# Wait for all threads to finish
for t in threads:
    t.join()

print("All downloads complete!")

# Thread-safe access with Lock
counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100_000):
        with lock:
            counter += 1
```

### ThreadPoolExecutor — Higher-level API

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(url):
    time.sleep(1)
    return f"Data from {url}"

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(fetch, url): url for url in urls}

    for future in as_completed(futures):
        url = futures[future]
        result = future.result()
        print(f"{url}: {result}")
```

### Multiprocessing — For CPU-bound Tasks

```python
from multiprocessing import Pool

def square(n):
    return n ** 2

# Process pool
with Pool(processes=4) as pool:
    results = pool.map(square, range(10))
    print(results)   # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

### When to Use What

| Scenario      | Use                     | Why                                  |
|---------------|-------------------------|--------------------------------------|
| Network I/O   | `asyncio` or `threading` | Waiting, not computing              |
| File I/O      | `threading`             | Blocked on disk                      |
| CPU-heavy     | `multiprocessing`       | Bypass GIL, use multiple cores       |
| Simple scripts | `asyncio`              | Clean, modern, no race conditions    |

> **The GIL (Global Interpreter Lock):** Python threads can't run Python code truly in parallel (only one thread executes Python bytecode at a time). For CPU-bound work, use `multiprocessing` to spin up separate processes.

---

## 31. Virtual Environments & Dependency Management

### Why Virtual Environments?

Each project gets its own isolated set of dependencies — no conflicts between projects.

### venv (Built-in)

```bash
# Create virtual environment
python -m venv .venv

# Activate
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install packages
pip install requests flask

# Save dependencies
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Deactivate
deactivate
```

### pip — Package Manager

```bash
pip install package_name           # latest version
pip install package_name==1.2.3    # specific version
pip install package_name>=1.2      # minimum version
pip install -U package_name        # upgrade
pip uninstall package_name
pip list                            # installed packages
pip show package_name              # package info
```

### pyproject.toml (Modern Standard)

The modern way to define project metadata and dependencies:

```toml
[project]
name = "my-project"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28",
    "flask>=3.0",
]

[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff"]

[build-system]
requires = ["setuptools>=70.0"]
build-backend = "setuptools.backends._legacy:_Backend"
```

### Other Tools Worth Knowing

- **`uv`** — Extremely fast package manager and virtualenv tool (Rust-based)
- **`poetry`** — Dependency management + packaging
- **`conda`** — Popular in data science (manages Python versions too)

---

## 32. Testing

### unittest (Built-in)

```python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_negative(self):
        self.assertEqual(add(-1, -1), -2)

    def test_zero(self):
        self.assertEqual(add(0, 0), 0)

    def test_type_error(self):
        with self.assertRaises(TypeError):
            add("a", 1)

if __name__ == "__main__":
    unittest.main()
```

### pytest (Recommended — install with `pip install pytest`)

```python
# test_math.py
import pytest

def add(a, b):
    return a + b

def test_add_positive():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, -1) == -2

def test_add_type_error():
    with pytest.raises(TypeError):
        add("a", 1)

# Parameterized tests
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, 1, 0),
    (0, 0, 0),
    (100, 200, 300),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected

# Fixtures — setup/teardown
@pytest.fixture
def sample_list():
    return [1, 2, 3, 4, 5]

def test_sum(sample_list):
    assert sum(sample_list) == 15

def test_length(sample_list):
    assert len(sample_list) == 5
```

```bash
# Run tests
pytest                     # discover and run all tests
pytest -v                  # verbose output
pytest test_math.py        # specific file
pytest -k "test_add"       # run tests matching pattern
pytest --tb=short          # shorter tracebacks
```

---

## 33. Useful Standard Library Modules

```python
# os — operating system interface
import os
os.getcwd()                        # current working directory
os.listdir(".")                    # list directory contents
os.environ.get("HOME")            # environment variables
os.path.join("dir", "file.txt")   # path joining

# sys — system-specific parameters
import sys
sys.argv                           # command-line arguments
sys.path                           # module search paths
sys.exit(1)                        # exit with error code

# math — mathematical functions
import math
math.sqrt(16)        # 4.0
math.ceil(4.2)       # 5
math.floor(4.7)      # 4
math.log(100, 10)    # 2.0
math.pi              # 3.14159...
math.inf             # infinity
math.gcd(12, 8)      # 4

# random — random number generation
import random
random.random()              # float in [0, 1)
random.randint(1, 10)        # int in [1, 10]
random.choice(["a", "b"])    # random element
random.shuffle(my_list)      # shuffle in place
random.sample(range(100), 5) # 5 unique random items

# itertools — iterator building blocks
import itertools
itertools.chain([1,2], [3,4])             # 1, 2, 3, 4
itertools.product("AB", "12")             # A1, A2, B1, B2
itertools.permutations("ABC", 2)          # AB, AC, BA, BC, CA, CB
itertools.combinations("ABCD", 2)         # AB, AC, AD, BC, BD, CD
itertools.islice(range(100), 5, 10)       # 5, 6, 7, 8, 9
list(itertools.accumulate([1,2,3,4]))     # [1, 3, 6, 10]

# functools — higher-order functions
from functools import lru_cache, partial, reduce

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2: return n
    return fibonacci(n-1) + fibonacci(n-2)

double = partial(multiply, 2)   # pre-fill first argument

# hashlib — hashing
import hashlib
hashlib.sha256(b"hello").hexdigest()

# logging — proper logging (use instead of print)
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Application started")
logger.warning("Low disk space")
logger.error("Connection failed", exc_info=True)

# subprocess — run external commands
import subprocess
result = subprocess.run(
    ["ls", "-la"],
    capture_output=True,
    text=True,
    check=True
)
print(result.stdout)

# typing — type hint utilities (covered in section 19)
# dataclasses — covered in section 27
# enum — covered in section 28
# collections — covered in section 26
```

---

## 34. Pythonic Idioms & Best Practices

### The Zen of Python

```python
import this    # prints the Zen of Python
```

Key principles: *Beautiful is better than ugly. Simple is better than complex. Readability counts.*

### Common Idioms

```python
# ✅ Check for empty collections
if not my_list:         # instead of: if len(my_list) == 0
    print("Empty!")

# ✅ Check for None specifically
if x is None:           # instead of: if x == None
    pass

# ✅ Use 'in' for membership
if key in my_dict:      # instead of: if my_dict.has_key(key)
    pass

# ✅ EAFP over LBYL (Easier to Ask Forgiveness than Permission)
# ❌ LBYL (Look Before You Leap)
if key in my_dict:
    value = my_dict[key]

# ✅ EAFP
try:
    value = my_dict[key]
except KeyError:
    value = default

# Even simpler:
value = my_dict.get(key, default)

# ✅ Use enumerate instead of range(len(...))
for i, item in enumerate(items):
    print(i, item)

# ✅ Use zip for parallel iteration
for name, score in zip(names, scores):
    print(name, score)

# ✅ Use with for resource management
with open("file.txt") as f:
    data = f.read()

# ✅ Chained comparisons
if 0 < x < 10:         # instead of: if x > 0 and x < 10
    pass

# ✅ Conditional assignment
result = value if condition else default

# ✅ Use any() and all()
if any(score > 90 for score in scores):
    print("At least one A!")

if all(score >= 60 for score in scores):
    print("Everyone passed!")

# ✅ Dictionary setdefault
graph = {}
graph.setdefault("A", []).append("B")

# ✅ Underscore for unused variables
for _ in range(5):
    do_something()

# ✅ String joining (not concatenation in loops)
# ❌ Slow
result = ""
for word in words:
    result += word + " "

# ✅ Fast
result = " ".join(words)
```

### PEP 8 — Style Guide Highlights

| Rule                  | Example                        |
|-----------------------|--------------------------------|
| Snake_case functions  | `my_function()`                |
| PascalCase classes    | `MyClass`                      |
| UPPER_CASE constants  | `MAX_RETRIES = 3`              |
| 4-space indentation   | Always (never tabs)            |
| Max line length       | 79–120 characters              |
| `_private` attributes | `self._internal_state`         |
| `__name_mangling`     | `self.__really_private`        |

### Common Gotchas

```python
# ⚠️ Mutable default arguments (covered in section 8)
def bad(lst=[]):    # ❌ shared across calls
    lst.append(1)
    return lst

# ⚠️ Late binding closures
funcs = [lambda: i for i in range(5)]
[f() for f in funcs]   # [4, 4, 4, 4, 4] — all reference same 'i'

# ✅ Fix with default argument
funcs = [lambda i=i: i for i in range(5)]
[f() for f in funcs]   # [0, 1, 2, 3, 4]

# ⚠️ Modifying a list while iterating
# ❌
for item in my_list:
    if condition(item):
        my_list.remove(item)   # skips elements!

# ✅
my_list = [item for item in my_list if not condition(item)]

# ⚠️ Integer caching
a = 256
b = 256
a is b    # True  (Python caches -5 to 256)

a = 257
b = 257
a is b    # May be False! Always use == for value comparison

# ⚠️ Shallow vs deep copy
import copy
original = [[1, 2], [3, 4]]
shallow = original.copy()          # nested lists are shared!
deep = copy.deepcopy(original)     # fully independent copy
```

---

## 35. What's Next?

You now have a solid foundation in Python. Here are recommended paths depending on your interests:

| Goal                   | Libraries / Frameworks to Learn         |
|------------------------|-----------------------------------------|
| **Web Development**    | Flask, Django, FastAPI                  |
| **Data Science**       | NumPy, Pandas, Matplotlib, Jupyter      |
| **Machine Learning**   | scikit-learn, TensorFlow, PyTorch       |
| **Automation**         | Selenium, Beautiful Soup, Scrapy        |
| **CLI Tools**          | Click, Typer, argparse                  |
| **Desktop Apps**       | Tkinter, PyQt, Kivy                     |
| **Game Development**   | Pygame                                  |
| **DevOps / Scripting** | Fabric, Invoke, subprocess              |
| **API Development**    | FastAPI, Flask-RESTful                  |

### Resources

- 📖 [Official Python Docs](https://docs.python.org/3/)
- 📖 [Real Python](https://realpython.com/)
- 📖 [Python Cookbook (O'Reilly)](https://www.oreilly.com/library/view/python-cookbook-3rd/9781449357337/)
- 🧠 [LeetCode](https://leetcode.com/) — practice problem solving
- 🧠 [Project Euler](https://projecteuler.net/) — math + programming challenges

---

> *"Python is a language that lets you work quickly and integrate systems more effectively."* — python.org
