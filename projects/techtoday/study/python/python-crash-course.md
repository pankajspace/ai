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

Python is an **interpreted** language: there is no compile step you run yourself. The interpreter reads your `.py` file, turns it into bytecode, and executes it — which is why the edit-run cycle is instant, and why a type error surfaces only when the offending line actually runs.

Its most visible difference from C-family languages is that **indentation is syntax**. There are no `{ }` braces; a block is defined by being indented under the line that introduces it, and it ends when the indentation returns. Four spaces, consistently, is the convention.

Two ways to run code, used for different things:

1. **The REPL** (`python` with no arguments) evaluates one statement at a time and prints each result. State persists for the session, so it is your scratchpad — check what a method returns, inspect an object with `dir(obj)` or `help(obj)`, test an idea before committing it to a file.
2. **Script mode** (`python script.py`) runs a fresh interpreter over the whole file, top to bottom. `def` and `class` are themselves statements that execute in order, so nothing is hoisted — you cannot call a function defined further down the file.

Note also that `#` comments are stripped by the tokenizer and vanish, whereas a triple-quoted string is a real expression; when it is the first statement in a module, function, or class, Python keeps it as that object's `__doc__` — which is what `help()` reads.

> Don't have Python installed yet? See [Installing Python](python-detailed-course.md#installing-python) for Windows/macOS/Linux setup steps.

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

The mental model that explains almost everything else: **a Python variable is a name, not a box**. `x = 5` does not reserve a slot and write `5` into it — it creates an integer object on the heap and binds the label `x` to it. Reassigning `x = "hello"` leaves the integer untouched and simply re-points the label.

Three consequences follow directly:

1. **Types belong to objects, not names.** That is what "dynamically typed" means — a name can hold an `int` now and a `list` later, and the type check happens when you attempt an operation, not when you assign.
2. **Assignment never copies.** `b = a` gives a second name for the *same* object, so mutating through `b` is visible through `a`.
3. **Mutability is the property that matters.** `str`, `int`, `float`, `tuple`, `bool`, and `None` are immutable and safe to share; `list`, `dict`, and `set` are mutable, so sharing them must be deliberate.

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

Prefer `isinstance()` over `type()`, because it means "this type **or a subclass**" — which matters more often than you would expect, since `bool` is genuinely a subclass of `int`. The conversion functions are **constructors**: they build a new object rather than reinterpreting memory, and they raise `ValueError` on malformed input (`int("abc")`), which is what makes them a natural validation point for user input.

The truthiness rule is worth memorising because it silently drives every `if` statement: empty containers, zero of any numeric type, and `None` are **falsy**; everything else is **truthy**. That is why `if not my_list:` is the idiomatic emptiness check — and why you must write `if x is None:` when `0` or `""` are legitimate values.

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

Every operator in Python is a call to a **dunder method** in disguise: `a + b` runs `type(a).__add__(a, b)`. That single mechanism is why `+` adds numbers, concatenates strings, and merges lists — each type supplies its own implementation, and your own classes can too.

Four behaviours are worth pinning down before you write anything real:

1. **Two divisions.** `/` is true division and always returns a `float` (`4 / 2` is `2.0`); `//` is floor division and rounds *toward negative infinity*, so `-7 // 2` is `-4`, not `-3`. `%` follows that rule, so its result carries the sign of the divisor — which makes it reliable for wrapping indices and clock arithmetic.
2. **`and` / `or` do not return booleans.** They return one of their operands and **short-circuit**, stopping as soon as the answer is known. `user and user.name` therefore yields `None` instead of raising, and `port or 8080` supplies a fallback (careful: `0` is falsy).
3. **`==` versus `is`.** `==` compares *values* and is customisable; `is` compares *object identity* and can never be overridden. Reserve `is` for `None`, `True`, and `False`. It appears to work for small integers only because CPython caches them, then breaks silently for larger ones.
4. **Comparisons chain.** `0 < x < 10` is real syntax, evaluated as `0 < x and x < 10` with `x` computed once.

Also note that assignment is a **statement**, not an expression — `if (x = 5)` is a syntax error by design, which is exactly why the walrus operator `:=` exists as a separate spelling.

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

Two words define Python strings, and both have consequences.

**Unicode**: a `str` is a sequence of *code points*, not bytes, so `len("café")` is `4` no matter how it is stored on disk. Bytes are a separate type (`bytes`), and you convert explicitly with `.encode()` / `.decode()` — which is why you should pass `encoding="utf-8"` at every I/O boundary.

**Immutable**: no string method modifies the original; every one returns a *new* string. `s.upper()` on its own line does nothing — you must assign the result. This is what makes strings hashable (usable as dict keys) and safe to share, at the cost of making `+=` in a loop quadratic, since each step copies everything accumulated so far. Build strings with `"".join(parts)` instead.

Slicing `s[start:stop:step]` follows three rules that apply to **every** sequence in Python, not just strings: `start` is inclusive and `stop` is exclusive (so `s[:3]` and `s[3:]` tile perfectly), negative indices count from the end, and out-of-range slice bounds are silently clamped rather than raising — unlike plain indexing, which does raise `IndexError`. A negative step walks backwards, which is the whole trick behind `s[::-1]`.

One method to read carefully: `strip("abc")` removes any leading/trailing characters *from that set*, not the substring `"abc"`. Use `removeprefix()` / `removesuffix()` when you mean a literal substring.

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

Picking the right container is the highest-leverage decision in everyday Python, because it fixes both what your code can express and how fast it runs. Four questions decide it:

1. **Does order matter?** Lists and tuples are ordered and indexable; sets are not; dicts preserve insertion order (guaranteed since Python 3.7) but are keyed rather than indexed.
2. **Will it change?** Mutable: `list`, `dict`, `set`. Immutable: `tuple`, `str`, `frozenset` — and immutability is what makes an object **hashable**, hence usable as a dict key or set member.
3. **How will you look things up?** Scanning a list is `O(n)`; a dict key lookup or set membership test is `O(1)` on average, because both are hash tables. Converting a list to a set before many `in` checks is the classic Python speedup.
4. **Same kind of thing, or fixed fields?** A list holds homogeneous items where position is incidental; a tuple holds a fixed number of heterogeneous fields where position is meaningful — which is why a tuple behaves like a lightweight record.

### Lists — ordered, mutable `[]`

Lists keep items in order and you can change them in place — append, insert, pop, sort. Use them whenever you need a growable sequence.

A list is a **dynamic array of references**, not a linked list. CPython over-allocates the underlying block, so `append()` is amortised `O(1)` — but `insert(0, x)`, `pop(0)`, and `remove(x)` are `O(n)`, because every following reference has to shift. Use `collections.deque` when you need speed at both ends.

One trap to internalise early: `lst.sort()` sorts **in place and returns `None`**, while `sorted(lst)` leaves the original alone and returns a new list. `x = lst.sort()` is a very common bug. The same convention applies to `reverse()`, `append()`, and every other in-place list method.

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

The difference is really about intent, not restriction: lists model *collections* of like items, tuples model *records* with a fixed shape where each position means something. Immutability then buys hashability, safe sharing without defensive copies, and a more compact representation.

Note that it is the **comma** that creates a tuple, not the parentheses — `1, 2` is already one, which is why a stray trailing comma (`x = 5,`) silently produces a one-element tuple. And immutability is *shallow*: a tuple's slots always point at the same objects, but a list inside one can still be mutated.

```python
point = (3, 4)
x, y = point             # x = 3, y = 4
single = (42,)           # trailing comma needed for a 1-item tuple!

point[0]                 # 3
# point[0] = 5           ❌ TypeError — immutable
```

### Dicts — key-value pairs `{}`

Dicts map unique keys to values with O(1) lookup. Access with `[]` (raises if missing) or `.get()` (safe default); iterate `.items()` for key and value together.

The dictionary is the most important structure in Python because the language itself runs on it: module namespaces, object attributes (`obj.__dict__`), and keyword arguments are all dicts. Learning to reach for one instead of parallel lists or a long `if`/`elif` ladder is a big step toward idiomatic code.

Each key is hashed to find its slot, which is why lookup cost does not grow with size — and why keys must be **hashable**, and therefore effectively immutable. A key whose hash changed after insertion could never be found again.

Match the access method to your intent: `d[key]` when a missing key is genuinely a bug, `d.get(key, default)` when absence is expected, and `d.setdefault(key, []).append(x)` when accumulating per key. Remember too that `.keys()`, `.values()`, and `.items()` return live **views**, so mutating the dict while iterating one raises `RuntimeError`.

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

A set is a hash table storing only keys, so duplicates collapse automatically, elements must be hashable (no lists inside), and membership testing is `O(1)` rather than `O(n)`. It is the right structure whenever the problem is naturally phrased in set language — "which items are in A but not B?", "what are the distinct values?" — where the operators are both clearer and far faster than nested loops.

The trade-off is no order and no indexing (`s[0]` raises `TypeError`). Note also that `remove()` raises `KeyError` on a missing element while `discard()` quietly does nothing; pick according to whether absence is an error.

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

Branches are tested top to bottom and **the first true one wins** — every later branch is skipped even if it would also be true. That is why the grading ladder below must run from the highest threshold down; reversing it would classify everyone as the loosest grade.

The condition need not be a boolean: Python calls `bool()` on whatever you give it, so `if my_list:` reads as "if the list is non-empty". Keep the truthiness caveat in mind — use `if x is None:` when `0` or `""` are meaningful values.

`match`/`case` (Python 3.10+) is **not** a `switch`. A switch compares one value against constants; `match` destructures a value against a *shape*, binding the pieces as it goes — so `case (0, y)` means "a 2-tuple starting with 0; call the second element `y`". Patterns are tried in order and the first match wins, so specific cases must come before general ones, and `case _:` is the catch-all wildcard. One trap: a bare name in a pattern always *captures* rather than compares, so use a dotted name (`case Color.RED:`) when you mean to test against a constant.

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

Python has no C-style `for (i = 0; i < n; i++)`. Its `for` is a **for-each** loop built on the iterator protocol: it calls `iter()` on the object, then `next()` repeatedly until `StopIteration` is raised. Everything follows from that — you can loop over a list, a string, a dict (yielding keys), a file (yielding lines), a generator, or any class that implements `__iter__`.

Because iteration is protocol-driven, manual indexing is almost always the wrong tool. Three helpers cover nearly every case:

1. **`range(start, stop, step)`** generates integers lazily — it is not a list, so `range(10**9)` costs nothing in memory.
2. **`enumerate(seq, start=0)`** yields `(index, value)` pairs and replaces the `for i in range(len(seq))` anti-pattern.
3. **`zip(a, b)`** walks several iterables in lockstep, stopping at the **shortest**; pass `strict=True` (3.10+) to make a length mismatch an error rather than silent truncation.

Use `while` when the number of iterations is unknown and you are looping until a *condition* changes — making sure the body actually moves toward that condition. `break` leaves the loop entirely, `continue` skips to the next iteration, and both affect only the **innermost** loop, since Python has no labelled break.

One rule to internalise: never add to or remove from a collection while iterating over it. The iterator tracks a position, so mutation causes skipped elements or a `RuntimeError`. Iterate over a copy or build a new list with a comprehension.

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

A function in Python is a **first-class object**. `def greet(): ...` creates a function object at runtime and binds it to a name, exactly as `x = 5` binds an integer — so you can store functions in lists, pass them as arguments, and return them from other functions. That fact is what makes `sorted(key=...)`, callbacks, and decorators possible.

Argument passing is neither by value nor by reference but **call by object reference**: the function receives the *same objects* the caller holds. Rebinding a parameter (`x = 99`) affects only the local name; *mutating* the object (`lst.append(99)`) is visible to the caller. This one rule explains the mutable-default gotcha below and most "why did my list change?" bugs.

A few practical points. Every function returns something — `None` if you never write `return`. `return q, r` does not return two values; it builds one tuple that the call site unpacks. And keyword arguments are documentation at the call site: `create_user("Alice", is_admin=True)` beats `create_user("Alice", True)`. You can force that clarity with a bare `*` in the signature, which makes every following parameter keyword-only.

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

The "names and objects" model explains exactly why. Defaults are evaluated when the `def` statement runs, not on each call, and the resulting object is stored on the function itself — you can see it in `add_bad.__defaults__`. Every call that omits the argument therefore shares that one list, and each `append` accumulates into it.

The `None` sentinel fixes it because the `lst = []` line lives in the function *body*, which does run on every call. The same pattern applies to `{}`, `set()`, and any other mutable default — including subtler ones like `datetime.now()`, which would freeze the timestamp at import time.

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

A comprehension is a **declarative** way to build a collection: rather than describing the loop mechanics (make an empty list, iterate, test, append), you describe the result. Read `[f(x) for x in xs if cond(x)]` in the same order as the set-builder notation it was modelled on: *the set of f(x), for each x in xs, where cond(x) holds*.

Besides reading better, comprehensions are **faster** than the equivalent loop with `.append()` — the append happens in optimised C instead of repeated attribute lookup — and they get their own scope, so the loop variable does not leak.

The placement of `if` confuses everyone once, and the reason is that there are two different constructs. A **trailing** `if` is a *filter*: it decides whether an item is included at all, so it can never have an `else`. A **leading** `a if cond else b` is a *ternary expression*: it decides what value to produce for an item already included, so it must always have one.

Swapping `[]` for `()` gives a **generator expression** — the same syntax, but nothing is computed up front and values are produced one at a time as you consume them. Memory use drops from `O(n)` to `O(1)`, which is why `sum(x**2 for x in range(1_000_000))` never builds the million-element list. The catch is that a generator is exhausted after one pass, so use a list comprehension when you need to index, re-iterate, or take `len()`.

The cost of comprehensions is compression: only *expressions* are allowed, and more than one condition plus a transformation — or more than two `for` clauses — is a signal to write an explicit loop.

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

A class is a **template that bundles state with the behaviour that operates on it**. The motivation is containment: instead of passing a dict of fields into a dozen loose functions and hoping every caller maintains the invariants, the data and its rules live behind one interface.

The mechanical detail that makes it work is `self`. Python does not hide the instance — `buddy.bark()` is literally `Dog.bark(buddy)`, which is why every method takes the instance as its explicit first parameter. Attribute lookup then checks the instance's own `__dict__` first and falls back to the class and its ancestors, which is exactly why **class attributes are shared** across all instances while **instance attributes shadow them** per object.

Python's take on the usual OOP pillars is distinctive:

1. **Encapsulation** — there is no `private` keyword. A leading `_` is a convention meaning "implementation detail", and `@property` lets you start with a plain public attribute and add validation later without changing a single call site.
2. **Polymorphism** — taken further than most languages through **duck typing**: `speak()` works on anything that defines `speak()`, related by inheritance or not. Interfaces are structural, not declared.
3. **Inheritance** — easy to overuse. If the relationship is really "has-a" rather than "is-a", prefer composition and delegate.

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

Inheritance models an **"is-a" relationship**, and substitutability is the real payoff: `for a in animals: print(a.speak())` works without knowing which concrete class each element is, and adding a new subclass requires no change to that loop. When a subclass defines a method the parent also defines, it **overrides** it — lookup walks the hierarchy and stops at the first match. Raising `NotImplementedError` in the parent, as `Animal.speak` does, is the informal way to declare a hook that subclasses must fill in.

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

Most languages forbid this because of the obvious question: if two parents define the same method, which one runs? Python answers with a fixed, computable ordering rather than a rule of thumb — every class carries a **Method Resolution Order**, a flat list of classes searched in sequence for any attribute. `Duck.move()` resolves to `Flyer.move` simply because `Flyer` comes earlier in `Duck.__mro__`.

In practice this works best when the extra parents are **mixins**: small, stateless classes adding one orthogonal capability. Inheriting from two full-featured, stateful classes is where the trouble starts.

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

Naive depth-first resolution would reach `Animal` through `Dog` before ever considering `Pet` — visiting a more general class before a more specific one, and potentially running the shared ancestor's `__init__` twice. C3 linearization avoids that by guaranteeing three properties: a class always precedes its own parents, the order in which parents were listed is preserved, and the result is consistent across the whole hierarchy. Hence `DomesticDog → Dog → Pet → Animal → object`, with the shared ancestor visited exactly once, at the end. If no consistent ordering exists, Python refuses to create the class and raises `TypeError` at definition time rather than misbehaving later.

```python
DomesticDog.__mro__
# (DomesticDog, Dog, Pet, Animal, object)

DomesticDog().speak()   # 'Woof!' — Dog comes before Pet in MRO
```

**Use `super()` to cooperate across the MRO chain:**

`super()` does not mean "my parent" — it means "the next class after me in the MRO of the actual instance's type". That value depends on the object at runtime, not on where the code was written, which is exactly why hard-coding `Animal.__init__(self, ...)` breaks the chain while `super().__init__(...)` keeps it intact. Passing `**kwargs` up the chain lets each class consume the arguments it understands and forward the rest, so every `__init__` runs exactly once regardless of how the classes are combined.

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

This solves a problem other languages solve with mandatory boilerplate. In Java you write `getX()`/`setX()` from day one, because retrofitting them later breaks every caller. Python lets you start with a plain public attribute and *upgrade it in place* the day you need validation, laziness, or a computed value — `c.radius` keeps working unchanged while the implementation quietly becomes a method call. That is why "just use a public attribute until you need more" is idiomatic here rather than sloppy.

Two mechanics to note: the backing field must have a different name (the `_radius` convention) or the setter would recurse forever, and a read-only property like `area` is recomputed on every access — use `functools.cached_property` when that computation is expensive.

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

`@dataclass` is a **code generator**: at class-definition time it reads the annotated attributes and synthesises the methods you would otherwise hand-write, turning thirty lines of mechanical boilerplate into five declarations. The **type annotations are what drive it** — an attribute without one is not treated as a field at all (though the annotations are still not enforced at runtime).

Three options cover most needs: `field(default_factory=list)` for mutable defaults (a plain `= []` is rejected outright, precisely because of the shared-default bug from section 8), `frozen=True` to make instances immutable and therefore hashable, and `order=True` to generate comparisons that treat the fields as a tuple in declaration order.

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

An exception is a **control-flow mechanism**, not just an error report. When one is raised, Python abandons the current expression and unwinds the call stack until it finds a matching `except` — or reaches the top and prints a traceback. That is why a deeply nested failure can be handled in one place far up the stack, instead of every intermediate function checking and forwarding return codes.

Python leans on exceptions more than most languages, guided by **EAFP** — *Easier to Ask Forgiveness than Permission*. Rather than testing preconditions first, you attempt the operation and handle the failure: `d[key]` inside a `try` is preferred to `if key in d`, which does the lookup twice and leaves a window for state to change in between.

The discipline that makes this work is **catching narrowly**. `except Exception:` swallows typos and logic bugs alongside genuine failures, turning a loud crash into silent wrong behaviour — and a bare `except:` also traps `KeyboardInterrupt`, so you cannot even stop your own program. Catch the specific exceptions you know how to recover from and let the rest propagate; a traceback is a feature.

The four clauses divide the work: keep `try` as small as possible (ideally the one risky call), put success-dependent follow-up in `else`, and put cleanup in `finally`, which runs on every path out — normal completion, handled exception, unhandled exception, even a `return` inside the `try`. Handlers are tested in order and matching respects inheritance, so broad ones must come last.

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

These sit in a hierarchy rooted at `BaseException`, and the shape of that tree is what makes targeted catching possible. `KeyError` and `IndexError` both derive from `LookupError`, so one handler covers both; `FileNotFoundError` and `PermissionError` derive from `OSError`. The `ValueError` / `TypeError` split encodes a real distinction — the *type* was right but the *value* was not, versus the type itself was wrong. `KeyboardInterrupt` and `SystemExit` deliberately sit outside `Exception` so that `except Exception:` cannot trap them.

## 12. Modules & Imports

A **module** is simply a `.py` file and a **package** is a directory of them. Both exist to give names a home: each module has its own global namespace, so `utils.parse` and `network.parse` never collide.

The mechanics explain most import errors. `import utils` searches `sys.path` in order — the script's own directory first, then `PYTHONPATH`, then installed packages — and takes the **first** match, which is why naming your file `random.py` shadows the standard library module of the same name. Once found, the module is **executed top to bottom exactly once** and cached in `sys.modules`; every later import reuses that cached object. So any side effect at module level happens at import time, which is a strong reason to keep module bodies to definitions and constants.

On import style: `import math` binds one name and keeps every use explicitly qualified, which makes origins obvious and circular imports survivable. `from math import sqrt` is shorter but hides where the name came from. `from module import *` is the form to avoid entirely — it pulls in an unknown set of names that can silently overwrite your own.

The `__name__` guard follows from the same machinery: Python sets `__name__` to the module's own name when importing and to `"__main__"` when running the file directly, so `if __name__ == "__main__":` distinguishes "used as a library" from "run as a program". Without it, importing a module would execute its demo code as a side effect — and `multiprocessing` on Windows and macOS would spawn processes recursively.

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

`open()` returns a **file object** — best understood as a cursor over a stream. It holds a position that advances as you read, which is why calling `f.read()` twice returns the whole file and then an empty string. The operating system also limits how many files a process may hold open, and buffered writes are not guaranteed to reach disk until the file is closed.

That is exactly what `with open(...) as f:` guarantees. It is a **context manager** whose exit step closes the file on every path out of the block — including exceptions and early `return` — whereas a manual `f.close()` is skipped whenever something raises in between. Treat `with` as the only correct form.

The other decision at every `open()` is **text versus binary**. Text mode decodes bytes into `str` and normalises line endings; binary mode (`"rb"`, `"wb"`) gives you raw `bytes`. Since the default encoding is platform-dependent, always pass `encoding="utf-8"` explicitly for text.

Two practical notes. `f.read()` and `f.readlines()` load the entire file into memory, while iterating the file object (`for line in f:`) is lazy and stays constant-memory regardless of size — each line keeps its trailing `\n`, hence the customary `.strip()`. And `"w"` truncates the file the moment it is opened, before you write anything, so an exception later leaves you with an empty file; write to a temporary file and rename when the data matters.

JSON is the usual interchange format, but the mapping is **lossy in one direction**: tuples come back as lists, non-string dict keys are coerced to strings, and `set`, `datetime`, and custom classes are not serialisable without a custom encoder. For paths, `pathlib` treats a path as an *object* that knows how to operate on itself (`p.parent`, `p.suffix`, `p.read_text()`) and overloads `/` for joining, which removes the whole class of separator bugs across platforms.

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

This is the machinery every `for` loop quietly relies on, and two roles are involved. An **iterable** can produce an iterator (it implements `__iter__`) and can be traversed repeatedly, since each loop asks for a fresh one. An **iterator** is the cursor doing the walking (it implements `__next__`) and is **single-use**: once it raises `StopIteration` it stays exhausted forever. That distinction explains why you can loop over a list twice but a generator only once, and why `zip`, `map`, and `enumerate` are empty the second time around.

A **generator** is the easy way to build an iterator. A single `yield` anywhere in a function body changes what `def` produces: calling the function no longer runs it — it returns a generator object and executes nothing. The body starts on the first `next()`, runs to the first `yield`, hands back that value, and then *freezes*, preserving local variables and the exact position inside loops. The next `next()` resumes there. When the function finally returns, `StopIteration` is raised automatically.

That suspend-and-resume ability is why `fibonacci()` can be infinite — the `while True:` loop never completes, but it also never runs longer than the consumer asks for. And because each generator both consumes an iterable and produces one, generators compose like Unix pipes: a read stage feeding a filter stage feeding a final loop processes a 50 GB file in constant memory, with nothing computed until the last loop starts pulling.

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

A decorator is a **function that takes a function and returns a replacement for it**. It works only because functions are first-class objects (section 8): you can accept one as an argument, define a new one that closes over it, and return that instead.

The `@` syntax is pure sugar — `@timer` above `def slow_func` means exactly `slow_func = timer(slow_func)`. The name now refers to the wrapper, which closes over the original and can run code before it, after it, or around it in a `try`/`finally`.

What this buys you is separating **cross-cutting concerns** — timing, caching, retries, logging, authentication, validation — from the logic they surround, instead of copy-pasting them into every function that needs them. You already use decorators as a consumer: `@property`, `@staticmethod`, `@dataclass`, `@functools.lru_cache`, and every web framework's route decorator.

Three details make the difference between a working decorator and a broken one:

1. **`*args, **kwargs`** — the wrapper must accept whatever the decorated function accepts, since the decorator cannot know its signature, and pass it straight through.
2. **`return`** — forgetting to return the inner call's result is the most common bug; the function suddenly returns `None`.
3. **`@functools.wraps(func)`** — copies `__name__`, `__doc__`, and friends onto the wrapper. Without it the function reports itself as `wrapper`, its docstring vanishes from `help()`, and introspection-based tools misbehave. Treat it as mandatory.

When decorators are stacked, application happens bottom-up and execution is therefore top-down, like layers of an onion — so order changes behaviour (a cache above an auth check would serve results without checking permissions).

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

A context manager answers a question every program faces: *how do I guarantee this cleanup runs, no matter how the block is left?* Files must be closed, locks released, transactions committed or rolled back — and the block might exit through an exception, a `return`, or a `break`.

`try`/`finally` solves it, but pushes the burden onto every caller and separates setup from teardown by however many lines the body happens to be. `with` moves that responsibility into the resource itself. The protocol is two methods: `__enter__()` runs on entry and its return value is what `as` binds; `__exit__(exc_type, exc_value, traceback)` runs on the way out and receives the exception details if one occurred, or three `None`s if not. Returning a truthy value from `__exit__` **suppresses** the exception — which is how `contextlib.suppress()` works — while the usual `False`/`None` lets it propagate after cleanup.

`@contextmanager` reuses the suspend-and-resume behaviour of generators from section 14: code before the `yield` is the setup, code after it is the teardown, and both live in one readable function. Wrap the `yield` in `try`/`finally` in real code — if the `with` body raises, the exception is thrown *into* the generator at the `yield`, so without `finally` everything after it is skipped and your cleanup never runs. That is precisely the flaw in the simple `timer()` above, which prints nothing when the block fails.

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

Type hints add an **optional, gradual** static type layer to a dynamically typed language. *Optional* is literal: the interpreter parses annotations, stores them in `__annotations__`, and then ignores them entirely. Passing an `int` where the hint says `str` raises nothing at runtime — checking is a separate step performed by `mypy`, `pyright`, or your editor's language server.

So why write them? Three reasons carry the value: they catch a real class of bugs before the code runs (a function that can return `None` used without a check, arguments silently swapped); they are documentation that **cannot go stale**, because the checker verifies it; and they power accurate autocomplete, safe renames, and go-to-definition.

*Gradual* means you can annotate one function or one module and leave the rest — anything unannotated is treated as `Any` and simply not checked, which is what makes hints practical to add to an existing codebase, starting with public interfaces.

Syntax notes: since Python 3.9 the builtin generics work directly (`list[str]`, `dict[str, int]`), so the old `typing.List` is unnecessary; since 3.10, `str | None` is the preferred spelling of `Optional[str]`.

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

Unpacking lets the **left-hand side of an assignment mirror the shape of the data**. Instead of `x = point[0]; y = point[1]`, you write `x, y = point` — the structure is stated once and the names fall out of it. Python iterates the right-hand side and binds each value to the matching target, so it works with any iterable. Without a star the counts must match exactly; with a **starred target** (at most one), it greedily absorbs whatever the fixed targets do not claim, always producing a `list`.

This also explains `a, b = b, a`: the right side is evaluated first into a temporary tuple, which is then unpacked — the language makes the temporary variable for you.

The `*` and `**` symbols mean opposite things depending on position. In a **definition** they *collect* (`def f(*args, **kwargs)` gathers extras into a tuple and a dict); in a **call** they *spread* (`f(*lst)` explodes a sequence into positional arguments, `f(**d)` into keyword arguments). Packing and unpacking being exact inverses is what makes transparent forwarding — the basis of decorators and wrappers — possible.

The built-ins listed here are worth internalising because they replace hand-written loops with a single readable expression. `any()` and `all()` also **short-circuit**, stopping at the first decisive element, and combining them with a generator expression means no intermediate list is ever built.

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

Python's "batteries included" philosophy means the answer to a surprising number of problems is already installed — and every dependency you avoid is one fewer version conflict, security advisory, and install step. What each module below is actually for:

1. **`os` / `sys`** — the boundary with the operating system and interpreter. `os.environ` is the standard place to read configuration and secrets; `sys.argv` carries command-line arguments (graduate to `argparse` once there is more than one).
2. **`math`** — float mathematics in C. Note `math.isclose()` for comparing floats, since `==` on floats is unreliable.
3. **`random`** — fast and statistically good, but **not cryptographically secure**. Anything involving passwords, tokens, or session IDs must use the `secrets` module instead.
4. **`datetime`** — the critical distinction is naive versus timezone-aware. A naive `datetime` does not identify a real moment, so store and compute in UTC and convert only for display.
5. **`re`** — always write patterns as raw strings (`r"\d+"`), or Python's own escaping consumes the backslashes first. Quantifiers are **greedy** by default, so `.*` swallows more than you expect — use `.*?` for the lazy form.
6. **`logging`** — the replacement for `print` in anything that runs unattended: severity levels let you filter, `getLogger(__name__)` gives per-module control, and handlers route output to files or services.
7. **`collections`** — specialised containers that delete boilerplate. `Counter` tallies and ranks; `defaultdict(list)` turns grouping into a single `dd[key].append(x)` by calling a factory for missing keys; `deque` gives `O(1)` operations at *both* ends where a list's `pop(0)` is `O(n)`.

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

The problem is unavoidable in a shared installation: project A needs `django==3.2`, project B needs `django==4.2`, and a single global `site-packages` can hold only one. Installing B's requirements silently breaks A — and since your operating system's own tooling depends on the system Python, `sudo pip install` can break the machine itself.

A virtual environment is nothing magical: it is a directory with its own `site-packages` and a link to a base interpreter. "Activating" it just prepends its `bin/` to your `PATH`, so `python` and `pip` resolve to the project's copies — which is why deleting the folder is a complete uninstall. The rules that follow: **one environment per project, never installed globally, never committed to version control.** What you commit is the *declaration* of dependencies, so the environment can be rebuilt anywhere.

On that declaration, note the difference between what you **declare** and what you **lock**. Your direct requirements are a short list with deliberately loose bounds (`requests>=2.28`), expressing intent. `pip freeze` produces something else entirely — the exact version of every installed package, including transitive ones you never asked for. That is a lock file: perfect for reproducing a deployment, poor as a record of intent. Modern projects declare dependencies in `pyproject.toml` and generate the lock separately; `uv` is a fast, increasingly standard tool for both.

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

### uv (Fast Alternative)

`uv` is a fast tool for creating environments and installing packages. It can use the same `.venv` layout as `venv`, but resolves and installs packages much faster than the traditional `pip` workflow.

```bash
# Install uv (choose one)
curl -LsSf https://astral.sh/uv/install.sh | sh
brew install uv                    # macOS alternative

# Create an environment
uv venv .venv
source .venv/bin/activate           # macOS/Linux
# .venv\\Scripts\\activate          # Windows

# Install packages
uv pip install requests flask
uv pip install -r requirements.txt

# For pyproject.toml projects
uv lock                              # resolve exact versions
uv sync                              # create/update the environment
```

Use `uv` when you want one fast tool for environment creation, dependency resolution, and repeatable installs. The existing `venv` and `pip` commands remain valid and are useful when you want only Python's built-in tooling.

## 21. Async/Await (Quick Intro)

Async solves one specific problem: **a program that spends most of its time waiting**. A script fetching 100 URLs is idle almost the entire run, blocked on the network. Sequential code waits 100 times in a row; async code issues all the requests and handles each response as it arrives.

The model is **cooperative multitasking on a single thread**. An **event loop** holds a set of coroutines and runs one at a time; every `await` on something not-yet-ready is a coroutine voluntarily handing control back, letting the loop run another until the first one's data arrives. Two consequences follow immediately:

1. **Concurrency, not parallelism.** Only one line of Python runs at any instant, so async gives no speedup for CPU-bound work — that needs `multiprocessing`.
2. **One blocking call freezes everything.** Because scheduling is cooperative, a coroutine that calls `time.sleep()` or `requests.get()` never yields and stalls the whole loop. Async requires async-aware libraries throughout (`asyncio.sleep`, `aiohttp`), or offloading via `asyncio.to_thread()`.

The vocabulary is small: `async def` defines a **coroutine function**; calling it returns a coroutine object and runs *nothing* — forgetting to `await` is the classic beginner bug. `await` suspends until the awaited thing completes. `asyncio.run(main())` starts the loop and is the single entry point from synchronous code.

Crucially, awaiting one coroutine after another is still sequential. Concurrency comes from scheduling several at once, which is what `asyncio.gather()` does — hence ~2s rather than 3s below. In Python 3.11+, `asyncio.TaskGroup` is preferred: it cancels the remaining tasks when one fails instead of leaving them running.

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

"Pythonic" is not a synonym for clever or short. It means solving a problem the way the language was designed to — using its protocols and idioms rather than transliterating patterns from another language. Non-Pythonic code usually still works; it is just longer, slower, and harder for the next reader.

The tips below are individual expressions of a few underlying principles: **prefer iteration protocols to manual index arithmetic**, **let objects manage their own resources** through context managers, **express intent declaratively** with comprehensions and built-ins, and **keep the common case short while making the exceptional case explicit**.

Two of them are worth the extra sentence. `if not my_list:` relies on truthiness, so use `if x is None:` instead whenever `0`, `""`, or `[]` are legitimate values distinct from "missing". And `" ".join(words)` is not merely tidier than `+=` in a loop — strings are immutable, so each `+=` copies everything accumulated so far, making the loop quadratic while `join` is linear.

Consistency matters more than any single rule, which is why PEP 8 exists and why automated formatters and linters (`black`, `ruff`) are near-universal: they settle style so review can focus on behaviour.

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

> 🐍 **Next steps:** For deeper coverage of OOP, generators, async, testing, and more — see the full [Python Detailed Course](python-detailed-course.md).
