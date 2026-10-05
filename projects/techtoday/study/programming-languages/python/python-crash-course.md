<!--
Source: python-crash-course.html
Title: Python Crash Course | TechToday
Theme-color: #0b0d10
Stylesheets: python-study.css, ../../../site-header.css
Scripts: python-study.js
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="python-crash-course"></a>

# Python Crash Course

<a id="table-of-contents"></a>

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
22. [22. Concurrency: Threading (Quick Intro)](#22-concurrency-threading-quick-intro)
23. [23. Pythonic Tips](#23-pythonic-tips)
24. [24. Quick Reference Card](#quick-reference-card)

<a id="unit-1"></a>

## Unit 1 — Python Basics

The building blocks: values, operators, strings, collections and control flow.

<a id="1-hello-python"></a>

## 1. Hello Python

Python is an **interpreted** language (meaning there is no separate compile step you run yourself). The interpreter reads your `.py` file, turns it into **bytecode** (a simplified set of instructions Python can execute quickly), and runs it immediately. This is why you can test your code instantly after editing, and why a type error (like trying to add a word to a number) only shows up when Python actually reaches that specific line of code.

Its most visible difference from C-family languages (like C++, Java, or JavaScript) is that **indentation is syntax** (the way you space your code actually tells the computer what to do). There are no `{ }` braces; a block of code (like the inside of a function) is defined simply by being indented under the line that introduces it. When the indentation returns to normal, the block ends. Four spaces, consistently, is the standard convention.

There are two ways to run code, and each is used for different things:

1. **The REPL** (Read-Eval-Print Loop, which is the interactive prompt you get when you run `python` with no arguments) evaluates one statement at a time and prints each result. Your variables and functions stick around for the session, so think of it as your scratchpad — you can check what a method returns, inspect an object with `dir(obj)` or `help(obj)`, and test an idea before saving it to a file.
2. **Script mode** (running `python script.py`) runs a fresh interpreter over your whole file from top to bottom. Statements like `def` (which creates a function) and `class` execute in order. Nothing is **hoisted** (loaded ahead of time) — so you cannot call a function at the top of the file if it is defined further down.

Note also that `#` comments are stripped by the tokenizer (the part of Python that first reads your code) and vanish completely. But a triple-quoted string (`"""like this"""`) is a real object in memory; when you put one as the very first line in a module, function, or class, Python keeps it as that object's `__doc__` (short for documentation string) — which is what the `help()` function reads when someone asks for help on your code.

> Don't have Python installed yet? See [Installing Python](python-detailed-course.html#installing-python) for Windows/macOS/Linux setup steps.

```
python --version          # check installation (macOS/Linux: python3 --version)
python script.py          # run a file (macOS/Linux: python3 script.py)
python                    # interactive REPL (macOS/Linux: python3)
```

```
print("Hello, World!")    # Hello, World!

# Single-line comment
"""Multi-line comment / docstring"""
```

<a id="2-variables--types"></a>

## 2. Variables & Types

The mental model that explains almost everything else: **a Python variable is a name (a reference or sticky label), not a box**. `x = 5` does not reserve a physical slot in memory and write `5` into it — it creates an integer object on the **heap** (a large pool of memory) and binds the label `x` to it. Reassigning `x = "hello"` leaves the integer untouched and simply moves the label to point at the string instead.

There are three consequences that follow directly from this:

1. **Types belong to objects, not names.** That is what "dynamically typed" means — the label `x` can hold an `int` (integer) now and a `list` later. The type check only happens when you attempt an operation (like adding them together), not when you assign the label.
2. **Assignment never copies.** Writing `b = a` just gives a second name for the *same* object. So if the object is something you can change (mutating it) through `b`, that change is instantly visible when you look at `a`.
3. **Mutability is the property that matters.** Types like `str` (text), `int` (whole numbers), `float` (decimals), `tuple`, `bool` (True/False), and `None` are **immutable** (they cannot be changed once created) and are always safe to share. Collections like `list`, `dict`, and `set` are **mutable** (changeable in place), so sharing them must be deliberate or you might accidentally change data meant for somewhere else.

**Figure 2.1: Python Reference Binding & PyObject Heap Architecture — Names → Heap PyObject**

*Variables in Python are simply pointers bound to rich C-level PyObject structures allocated on the heap. Assignment never clones an object.*

*Diagram labels:* LOCAL NAMESPACE · a = 42 · b = a (alias) · x = "hello" · CPYTHON HEAP MEMORY · PyLongObject (int) · ob_refcnt: 2 (shared!) · ob_type: <class 'int'> · ob_digit[0]: 42 · PyUnicodeObject (str) · refcnt: 1 | val: "hello" · Key Insight · • b = a does NOT copy. · • Both point to same 42. · • ob_refcnt increments. · • When refcnt=0 → GC frees. · id(a) == id(b) is True

```
name = "Alice"        # str
age = 30              # int
height = 5.7          # float
active = True         # bool  (capital T/F)
nothing = None        # NoneType

x, y, z = 1, 2, 3     # x = 1, y = 2, z = 3
print(name, age)      # Alice 30
```

<a id="type-checking--casting"></a>

### Type Checking & Casting

`type()` and `isinstance()` let you inspect a value to see what kind of data it is. Constructors like `int()`, `str()`, and `bool()` convert data between types (this is called **casting**). Keep in mind that empty values (like `0`, `""`, empty lists `[]`, and `None`) are considered **falsy** (they evaluate to False in a true/false check).

It is best practice to prefer `isinstance()` over `type()`, because it checks for "this type **or a subclass** (a type derived from it)". This matters more often than you would expect, since `bool` is genuinely a subclass of `int` in Python. The conversion functions (like `int()`) are **constructors**: they build a brand new object in memory rather than just reinterpreting the bytes. If you give them malformed input, they raise a `ValueError` (an error saying the value is wrong), which makes them a natural place to validate user input.

The **truthiness** rule (what is considered True vs False) is worth memorising because it silently drives every `if` statement. Empty containers, zero of any numeric type, and `None` are **falsy**; everything else is **truthy**. That is why `if not my_list:` is the standard, idiomatic way to check if a list is empty. However, this is also why you must explicitly write `if x is None:` when a value of `0` or `""` is a valid, meaningful answer for your program.

```
age = 30
type(age)             # <class 'int'>
isinstance(age, int)  # True

int("42")             # 42
int(3.9)              # 3      (truncates toward zero)
int("ff", 16)         # 255    (parse in base 16)
str(100)              # '100'
float("3.14")         # 3.14
bool(0)               # False  (0, "", [], None → falsy)
bool("hi")            # True
# int("abc")          ❌ ValueError: invalid literal for int()
```

<a id="3-operators"></a>

## 3. Operators

Every operator in Python secretly calls a **dunder method** (short for "double underscore" method, like `__add__`) on the object. So `a + b` actually runs `type(a).__add__(a, b)` behind the scenes. This single mechanism is why `+` can add numbers, concatenate (join) strings, and merge lists — each data type supplies its own custom version of the addition behavior, and your own classes can do this too.

There are four fundamental behaviours that are worth pinning down before you write anything real:

1. **There are two types of division in Python.** A single slash `/` is true division and always returns a `float` (a decimal), so `4 / 2` is `2.0`. A double slash `//` is **floor division** (it chops off the decimal) and rounds *toward negative infinity*. This means `-7 // 2` rounds down to `-4`, not `-3`. The modulo operator `%` (which gets the remainder) follows that same rule, so its result carries the sign of the divisor, making it reliable for math that "wraps around", like clocks or list indices.
2. **`and` / `or` do not return booleans (True/False).** They actually return one of their operands (the items they are checking) and **short-circuit**, meaning they stop checking as soon as the answer is known. `user and user.name` will safely yield `None` if `user` is empty instead of crashing. Similarly, `port or 8080` is a great trick to supply a fallback value (but be careful: if `port` is `0`, it is considered falsy, so it will fall back to `8080`).
3. **You must distinguish between `==` and `is`.** `==` compares *values* (do these look the same?) and is customisable by the object. `is` compares *object identity* (are these exactly the same object in memory?) and can never be overridden. You should reserve `is` for checking against `None`, `True`, and `False`. Because CPython (the standard Python interpreter) caches small integers to save memory, `is` might appear to work for small numbers but will silently break for larger ones.
4. **Comparisons chain.** `0 < x < 10` is real syntax in Python. It is evaluated as `0 < x and x < 10`, but it calculates `x` only once, making it both cleaner and slightly faster.

Also note that variable assignment (using `=`) is a **statement** (an action), not an expression (a value). Writing `if (x = 5):` is a syntax error by design to prevent accidental typos. If you really need to assign and test a value at the same time, Python has a separate **walrus operator** `:=` for exactly that.

```
# Arithmetic
5 + 3     # 8
5 - 3     # 2
5 * 3     # 15
5 / 3     # 1.6666666666666667  (always float)
5 // 3    # 1                   (floor div)
5 % 3     # 2                   (modulo)
5 ** 3    # 125                 (power)
-7 // 2   # -4                  (floors toward -infinity)
-7 % 2    # 1                   (sign follows the divisor)

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

<a id="4-strings"></a>

## 4. Strings

Two key concepts define Python strings, and both have major consequences for how you use them.

**The first concept is Unicode**: a `str` (string) is a sequence of *code points* (abstract characters), not just raw bytes of memory. Because of this, `len("café")` is always `4` characters no matter how those letters are stored on disk. Bytes are a completely separate type (`bytes`), and you convert explicitly back and forth with `.encode()` and `.decode()`. This is why you should always specify `encoding="utf-8"` whenever you read or write a file (an I/O boundary).

**The second concept is that strings are immutable**: no string method ever modifies the original string; every operation returns a brand *new* string. Writing `s.upper()` on its own line does nothing at all — you must assign the result to a variable to save it. This immutability is what makes strings **hashable** (able to be used as keys in a dictionary) and safe to share across your program. The downside is that using `+=` to add text inside a loop is quadratic (gets slower and slower), since each step forces Python to copy everything accumulated so far. Instead, you should build a list of parts and merge them all at once with `"".join(parts)`.

**Slicing** (grabbing a piece of a string with `s[start:stop:step]`) follows three rules that apply to **every** sequence in Python, not just strings. First, the `start` index is inclusive and the `stop` index is exclusive (so `s[:3]` and `s[3:]` fit together perfectly). Second, negative indices count backward from the end of the string. Third, if your slice boundaries are out of range, Python silently clamps them to the string's length rather than raising an error (unlike plain indexing like `s[100]`, which will raise an `IndexError`). A negative `step` value walks backwards, which is the secret behind `s[::-1]` to reverse a string!

There is one method that you should read carefully: `strip("abc")` removes any leading or trailing characters *from that specific set of letters* (a, b, or c), not the exact word `"abc"`. If you mean to remove a literal substring word, use `removeprefix()` or `removesuffix()`.

```
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
"cabbage".strip("abc")         # 'ge'  (strips any of a, b, c from both ends)
"test_login".removeprefix("test_")  # 'login'  (Python 3.9+)
"report.csv".removesuffix(".csv")   # 'report'

# str ↔ bytes
"café".encode("utf-8")         # b'caf\xc3\xa9'  (5 bytes)
b"caf\xc3\xa9".decode("utf-8") # 'café'
len("café")                    # 4  (characters, not bytes)

# f-strings (formatted strings — use these!)
name, age = "Alice", 30
f"Hi {name}, you're {age}"     # "Hi Alice, you're 30"
f"{3.14159:.2f}"               # '3.14'
f"{1000000:,}"                 # '1,000,000'

# Strings are IMMUTABLE
# s[0] = "h"   ❌ TypeError
s = "h" + s[1:]                # 'hello, World!'
```

<a id="5-data-structures"></a>

## 5. Data Structures

Picking the right container is the highest-leverage decision in everyday Python, because it fixes both what your code can express and how fast it runs. There are four questions that decide this choice:

1. **Does order matter?** Lists and tuples are ordered and indexable (you can ask for the 1st, 2nd, or 10th item); sets are not; dicts preserve insertion order (guaranteed since Python 3.7) but are keyed (you look things up by a name) rather than indexed.
2. **Will the container change?** The `list`, `dict`, and `set` types are **mutable** (changeable after creation). Conversely, `tuple`, `str`, and `frozenset` are **immutable** (they cannot be changed once made) — and this immutability is what makes an object **hashable** (able to be converted into a fixed ID number behind the scenes), making it usable as a dict key or set member.
3. **How will you look things up?** Scanning a list is **O(n)** (meaning the time it takes grows linearly with the number of items, because it has to check each one); a dict key lookup or set membership test is **O(1)** on average (meaning it's a super-fast lookup that takes the same amount of time no matter how big it gets), because both are **hash tables** (data structures optimized for instant retrieval). Converting a list to a set before doing many `in` checks is a classic Python speedup trick.
4. **Does it hold the same kind of thing, or fixed fields?** A list usually holds homogeneous items (all the same type) where their exact position doesn't have a special meaning; a tuple holds a fixed number of heterogeneous fields (mixed types) where position is meaningful — which is why a tuple behaves like a lightweight record or row in a spreadsheet.

<a id="lists--ordered-mutable-"></a>

### Lists — ordered, mutable `[]`

Lists keep items in a specific order, and you can change them in place using methods like append, insert, pop, and sort. You should use them whenever you need a growable sequence.

A list is a **dynamic array of references** (a continuous block of memory that points to your objects and automatically grows when needed), not a linked list. CPython over-allocates the underlying block, so `append()` is **amortised O(1)** (very fast in practice because it rarely needs to resize) — but `insert(0, x)`, `pop(0)`, and `remove(x)` are **O(n)** (slower), because every following item has to shift over to make room. Use `collections.deque` when you need fast inserts or removals at both ends of the list.

There is one trap you need to internalise early: `lst.sort()` sorts **in place and returns `None`**, while `sorted(lst)` leaves the original alone and returns a brand new list. Writing `x = lst.sort()` is a very common bug because `x` will end up being `None`! The same rule applies to `reverse()`, `append()`, and every other method that changes a list in place.

```
# Create
empty = []                # or list()
list("abc")               # ['a', 'b', 'c']
list(range(5))            # [0, 1, 2, 3, 4]
list((1, 2, 3))           # [1, 2, 3]  (from a tuple)
[0] * 3                   # [0, 0, 0]

nums = [1, 2, 3, 4, 5]
backup = nums.copy()      # shallow copy (same as nums[:] or list(nums))

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

<a id="tuples--ordered-immutable-"></a>

### Tuples — ordered, immutable `()`

Tuples are like lists that you cannot mutate (change). You should use them for fixed records (like GPS coordinates or pairs of values) and when you need a **hashable** sequence to use as a dictionary key.

The difference is really about intent, not restriction: lists model *collections* of like items, while tuples model *records* with a fixed shape where each position means something specific. **Immutability** (the inability to change) then buys hashability, safe sharing without needing defensive copies, and a more compact memory representation.

Note that it is the **comma** that actually creates a tuple, not the parentheses — writing `1, 2` is already a tuple, which is why a stray trailing comma (like `x = 5,`) silently produces a one-element tuple instead of an integer. And immutability is *shallow*: a tuple's slots always point at the exact same objects, but if one of those objects is a list, the list inside the tuple can still be mutated.

```
point = (3, 4)
x, y = point             # x = 3, y = 4
single = (42,)           # trailing comma needed for a 1-item tuple!

# Create
empty = ()               # or tuple()
tuple([1, 2, 3])         # (1, 2, 3)  (from a list)
tuple("abc")             # ('a', 'b', 'c')
pair = 1, 2              # (1, 2)  — the comma makes the tuple
oops = 5,                # (5,)    — a stray comma, not an int!

point[0]                 # 3
point.count(3)           # 1
point.index(4)           # 1
# point[0] = 5           ❌ TypeError — immutable
```

<a id="dicts--key-value-pairs-"></a>

### Dicts — key-value pairs `{}`

Dicts (dictionaries) map unique keys to values with **O(1) lookup** (instant retrieval no matter how big the dictionary gets). You can access items with `[]` (which raises an error if the key is missing) or `.get()` (which safely returns a default value); you can also iterate over `.items()` to get both the key and the value together.

The dictionary is the most important structure in Python because the language itself runs on it: module **namespaces** (how Python tracks variable names), object attributes (the data stored inside objects, kept in `obj.__dict__`), and keyword arguments are all secretly dicts. Learning to reach for a dict instead of two parallel lists or a long ladder of `if`/`elif` statements is a big step toward writing clean, idiomatic Python.

Each key is **hashed** (scrambled into a unique number) to find its exact slot in memory, which is why lookup cost does not grow with size — and why keys must be **hashable**, and therefore effectively immutable. If a key's hash changed after insertion, the dictionary would never be able to find it again!

Match the access method to your intent: use `d[key]` when a missing key is genuinely a bug that should crash your program, use `d.get(key, default)` when absence is expected and normal, and use `d.setdefault(key, []).append(x)` when you are building lists per key. Remember too that `.keys()`, `.values()`, and `.items()` return live **views** (windows into the dictionary's current state), so mutating (changing) the dict while looping through one of these views will raise a `RuntimeError`.

```
# Create
empty = {}                                  # or dict()
dict(name="Alice", age=30)                  # {'name': 'Alice', 'age': 30}
dict([("name", "Alice"), ("age", 30)])      # same — from (key, value) pairs
dict(zip(["name", "age"], ["Alice", 30]))   # same — from two parallel lists
dict.fromkeys(["a", "b"], 0)                # {'a': 0, 'b': 0}

person = {"name": "Alice", "age": 30}

# Access
person["name"]                 # 'Alice'
person.get("email", "N/A")     # 'N/A'  (safe access)

# Modify
person["age"] = 31             # update
person["email"] = "a@b.com"    # add new key
person                         # {'name': 'Alice', 'age': 31, 'email': 'a@b.com'}
person.keys()                  # dict_keys(['name', 'age', 'email'])
person.values()                # dict_values(['Alice', 31, 'a@b.com'])

# Build lists per key
groups = {}
groups.setdefault("admins", []).append("Alice")
groups                         # {'admins': ['Alice']}

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

<a id="sets--unordered-unique-"></a>

### Sets — unordered, unique `{}`

Sets store unique items and support mathematical operations like union `|`, intersection `&`, and difference `-`. Note that writing `{}` creates an empty dict — you must use `set()` to create an empty set.

A set is a **hash table** storing only keys (optimized for instant lookups), so duplicates collapse automatically, elements must be **hashable** (no lists or mutable items inside), and membership testing is **O(1)** (instant) rather than **O(n)** (checking one-by-one). It is the right structure whenever the problem is naturally phrased in set language — "which items are in A but not B?", "what are the distinct values?" — where the built-in operators are both easier to read and far faster than writing nested loops.

The trade-off is no order and no indexing (trying to do `s[0]` raises a `TypeError`). Note also that `remove()` raises a `KeyError` on a missing element while `discard()` quietly does nothing; pick the one that matches whether absence is considered an error in your program.

```
s = {1, 2, 3}
empty = set()             # NOT {} — that's an empty dict!
set([1, 2, 2, 3])         # {1, 2, 3}  (from a list)
set("hello")              # {'h', 'e', 'l', 'o'}  (order varies)
frozenset([1, 2])         # frozenset({1, 2})  — immutable, hashable

s.add(4)
s.discard(2)              # no error if missing
s.remove(3)               # KeyError if missing
s                         # {1, 4}

# Set math
a = {1, 2, 3}
b = {3, 4, 5}
a | b                     # {1, 2, 3, 4, 5}  union
a & b                     # {3}              intersection
a - b                     # {1, 2}           difference
a ^ b                     # {1, 2, 4, 5}     symmetric difference
{1, 2} <= a               # True             subset

# Deduplicate a list
unique = list(set([1, 1, 2, 2, 3]))
unique                    # [1, 2, 3]  (order not guaranteed)
```

<a id="6-control-flow"></a>

## 6. Control Flow

Branches (like `if` and `elif`) are tested top to bottom and **the first true one wins** — every later branch is completely skipped even if it would also be true. That is why a grading ladder (checking for A, then B, then C) must run from the highest threshold down; reversing it would classify everyone with a passing score as the lowest grade!

The condition you check does not need to be a strict boolean (True or False): Python automatically checks the **truthiness** (calling `bool()` on whatever you give it), so writing `if my_list:` simply reads as "if the list is non-empty". Keep the truthiness caveat in mind — you must use `if x is None:` when `0` or `""` (an empty string) are meaningful values in your program, because they would otherwise act like False.

`match`/`case` (introduced in Python 3.10) is **not** just a simple `switch` statement. A basic switch compares one value against constants; `match` actually **destructures** (breaks apart) a value against a *shape* or pattern, binding the pieces as it goes — so `case (0, y):` means "if this is a 2-item tuple starting with 0, call the second element `y`". Patterns are tried in order and the first match wins, so specific cases must always come before general ones, and `case _:` is the catch-all wildcard (like "else"). One trap to watch out for: a bare name in a pattern always *captures* the value rather than comparing against it, so use a dotted name (like `case Color.RED:`) when you mean to test against a specific constant.

```
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

<a id="7-loops"></a>

## 7. Loops

Python has no C-style loop like `for (i = 0; i < n; i++)`. Its `for` loop is a **for-each** loop built on the **iterator protocol** (a standard way objects hand out their items one by one). It secretly gets an iterator object, then asks for the `next()` item repeatedly until it signals it is empty. Everything follows from this rule — you can loop over a list, a string, a dict (which hands out its keys), a file (which hands out its lines), a generator, or any class that implements this protocol.

Because iteration is protocol-driven (handling the stepping for you), manual indexing (using a counter variable) is almost always the wrong tool. There are three built-in helpers that cover nearly every case:

1. **`range(start, stop, step)`** generates integers **lazily** (creating each number only when asked) — it is not a giant list, so `range(10**9)` costs almost nothing in memory.
2. **`enumerate(seq, start=0)`** hands you both the `(index, value)` pairs as you loop. This replaces the `for i in range(len(seq))` **anti-pattern** (a common but bad way of writing code).
3. **`zip(a, b)`** walks through several collections in lockstep (item 1 from A with item 1 from B, etc.), stopping as soon as it hits the end of the **shortest** one. You can pass `strict=True` (in Python 3.10+) to make a length mismatch crash with an error rather than silently stopping.

Use `while` loops when the number of iterations is unknown and you are looping until a *condition* changes — making sure the code inside the loop actually moves toward that condition! The `break` keyword leaves the loop entirely, `continue` skips the rest of the current step and moves to the next one, and both affect only the **innermost** loop (the one they are immediately inside), since Python has no labelled breaks to jump out of multiple loops at once.

There is one important rule you must internalise: you should never add to or remove from a collection while iterating over it. The iterator tracks a position, so **mutation** (changing the collection) causes skipped elements or a `RuntimeError`. Instead, iterate over a copy of the collection, or build a brand new list using a comprehension.

```
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

<a id="unit-2"></a>

## Unit 2 — Functions, Classes & Modules

Structuring programs: functions, comprehensions, classes, errors, modules and files.

<a id="8-functions"></a>

## 8. Functions

A function in Python is a **first-class object** (meaning it can be treated just like any other piece of data). `def greet(): ...` creates a function object in memory and binds it to the name "greet", exactly as `x = 5` binds the name "x" to an integer. Because of this, you can store functions in lists, pass them as arguments to other functions, and return them! That fact is what makes **callbacks** (passing a function to run later) and **decorators** (wrapping a function with another function) possible.

Argument passing is neither "by value" (copying the data) nor strictly "by reference" (passing a pointer) but **call by object reference**: the function receives the *exact same objects* the caller holds. Rebinding a parameter inside the function (like `x = 99`) only changes the local label; but *mutating* the object (like `lst.append(99)`) is instantly visible to the caller! This one rule explains the mutable-default gotcha below and most "why did my list mysteriously change?" bugs.

There are a few practical points to keep in mind. Every function returns something — if you never write `return`, it returns `None` automatically. Writing `return q, r` does not technically return two values; it builds one **tuple** (a fixed group of items) that the calling code immediately unpacks. And keyword arguments are great for readability: `create_user("Alice", is_admin=True)` is much clearer than `create_user("Alice", True)`. You can even force people to use keyword arguments by putting a bare `*` in the signature, which makes every parameter after it keyword-only.

```
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

<a id="-mutable-default-gotcha"></a>

### ⚠️ Mutable Default Gotcha

Default argument values are created **only once** when the function is defined, not every time it's called! Never use a **mutable default** (like an empty list `[]` or dictionary `{}`) — instead, use `None` as the default and create a new empty list inside the function.

The "names and objects" model explains exactly why this happens. Default values are evaluated the moment Python reads the `def` line, and the resulting object is attached directly to the function itself (you can even see it in `add_bad.__defaults__`). Every call that omits the argument therefore ends up sharing that one exact same list in memory, and each `.append()` adds to it permanently.

Using `None` as a sentinel (a placeholder) fixes it because the `lst = []` line lives inside the function *body*, which does run fresh on every call. The same pattern applies to `{}`, `set()`, and any other mutable default — including sneaky ones like `datetime.now()`, which would calculate the time once when the script starts and then freeze that timestamp forever!

```
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

<a id="9-list-comprehensions"></a>

## 9. List Comprehensions

A comprehension is a **declarative** way to build a collection (meaning you describe what you want the result to look like, instead of giving step-by-step instructions on how to build it). Rather than describing the loop mechanics (make an empty list, iterate, test the condition, append the item), you just describe the result in one line. Read `[f(x) for x in xs if cond(x)]` like plain English: *the result of f(x), for each x in the list xs, provided that the condition holds true*.

Besides reading better, comprehensions are **faster** than writing out a loop with `.append()` — the adding happens in highly optimised C code behind the scenes instead of looking up the `append` method every time — and they get their own variable scope, so the loop variable (like `x`) doesn't leak out into the rest of your code.

The placement of the `if` confuses everyone at first, and the reason is that there are two different constructs at play. A **trailing** `if` (at the end) is a *filter*: it decides whether an item is included in the new list at all, so it never has an `else`. A **leading** `a if cond else b` is a **ternary expression** (an inline if-statement): it decides what value to produce for an item that is *already* included, so it must always have an `else` fallback.

Swapping the square brackets `[]` for parentheses `()` gives you a **generator expression** — it uses the exact same syntax, but nothing is computed up front. Instead, the values are generated **lazily** (one at a time as you ask for them). Memory use drops from **O(n)** (storing everything at once) to **O(1)** (only remembering the current item), which is why `sum(x**2 for x in range(1_000_000))` is lightning fast and never actually builds a million-element list in memory. The catch is that a generator is exhausted (used up) after one pass, so stick to a list comprehension when you need to use an index, loop over it multiple times, or ask for its `len()`.

The cost of comprehensions is that they must be simple: only simple *expressions* (values) are allowed, not statements. If you need more than one condition, a complex transformation, or more than two `for` clauses, it's a signal to just write a normal loop so it stays readable.

```
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

<a id="10-classes-oop"></a>

## 10. Classes (OOP)

A class is a **template that bundles state (data) with the behaviour (functions) that operates on it**. The motivation is containment: instead of passing a dictionary of fields into a dozen loose functions and hoping every piece of code respects the rules, the data and its rules live safely behind one unified interface.

The mechanical detail that makes it work in Python is `self`. Python does not magically hide the instance of the object from you — calling `buddy.bark()` is literally just a shortcut for `Dog.bark(buddy)`, which is exactly why every method must take the instance as its explicit first parameter (usually named `self`). When you ask for an attribute, Python checks the instance's own memory (its `__dict__`) first and falls back to the class and its ancestors if it's missing. This explains why **class attributes** are shared across all instances, while **instance attributes** belong to the specific object and shadow (hide) the class ones.

Python's take on the usual OOP (Object-Oriented Programming) pillars is distinctive:

1. **The first pillar is encapsulation** (hiding internal state). In Python, there is no strict `private` keyword that locks data away. A leading underscore (like `_radius`) is a gentle convention meaning "this is an implementation detail, please don't touch it". Features like `@property` let you start with a plain public attribute and add validation logic later without breaking any existing code.
2. **The second pillar is polymorphism** (using different objects the same way). Python takes this further than most languages through **duck typing** (if it walks like a duck and quacks like a duck, it's a duck!): `speak()` works on absolutely anything that has a `speak()` method, whether the objects are related by inheritance or not. Interfaces are structural (based on what methods exist), not declared ahead of time.
3. **The third pillar is inheritance** (basing a class on another class). This is easy to overuse; if the relationship is really "has-a" (a car has an engine) rather than "is-a" (a car is a vehicle), prefer **composition** (giving the car an engine attribute) and delegating tasks to it.

```
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

<a id="inheritance"></a>

### Inheritance

A subclass reuses a parent’s behavior and can override methods. The `isinstance(obj, Parent)` check is True for subclasses — this is how you share an interface across different types of objects.

Inheritance models an **"is-a" relationship** (like a Dog is an Animal), and **substitutability** (the ability to swap one object for another without breaking the code) is the real payoff. For example, `for a in animals: print(a.speak())` works perfectly without you needing to know which specific animal class each element is, and adding a new animal subclass later requires zero changes to that loop. When a subclass defines a method the parent also defines, it **overrides** (replaces) it — Python walks up the family tree and stops at the very first match it finds. Raising a `NotImplementedError` in the parent class, as `Animal.speak` does below, is the informal way to declare a hook (a placeholder) that subclasses must fill in with their own code.

```
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

<a id="multiple-inheritance--the-diamond-problem"></a>

### Multiple Inheritance & The Diamond Problem

Python supports **multiple inheritance** — a class can inherit from more than one parent at the same time.

Most programming languages forbid this because of an obvious question: if two parents define the same method, which one runs? Python answers with a fixed, strictly computable order rather than a rule of thumb — every class carries a **Method Resolution Order** (MRO, a flat list of classes telling Python exactly who to check first). `Duck.move()` below resolves to `Flyer.move` simply because `Flyer` comes earlier in the list at `Duck.__mro__`.

In practice, this works best when the extra parents are **mixins** (small, stateless helper classes that just add one specific capability). Inheriting from two full-featured classes with complex data is usually where the trouble starts.

```
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

**The Diamond Problem** occurs when a class inherits from two classes that both share the same grandparent:

```
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

**Python's fix: MRO (Method Resolution Order)** uses **C3 linearization** (a specific math algorithm) to create a predictable, left-to-right order that respects the whole family tree without surprises.

A naive resolution might reach `Animal` by going straight up through `Dog` before ever considering `Pet` — visiting a very general class before a more specific one, and potentially running the shared grandparent's `__init__` twice! C3 linearization avoids that by guaranteeing three common-sense rules: a class is always checked before its own parents, the order in which you listed the parents is preserved, and the result makes sense for the whole tree. Hence `DomesticDog → Dog → Pet → Animal → object`, with the shared grandparent visited exactly once, at the very end. If no consistent order is mathematically possible, Python refuses to create the class at all rather than misbehaving later.

```
DomesticDog.__mro__
# (DomesticDog, Dog, Pet, Animal, object)

DomesticDog().speak()   # 'Woof!' — Dog comes before Pet in MRO
```

**Use `super()` to cooperate across the MRO chain:**

The keyword `super()` does not simply mean "my parent" — it means "the next class after me in the MRO list". That value actually depends on how the object was built when the code runs, not where you wrote the code! This is exactly why hard-coding `Animal.__init__(self, ...)` breaks multiple inheritance, while using `super().__init__(...)` smartly delegates to whoever is next in line. Passing `**kwargs` up the chain lets each class consume the arguments it cares about and forward the rest, so every `__init__` runs exactly once regardless of how crazy the family tree gets.

```
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

> **Key rules:** - MRO goes **left-to-right**, then **up** — check with `ClassName.__mro__` - Always use `super()` (not parent name) to play nice with MRO - Pass `**kwargs` through `__init__` chains to handle varying signatures

<a id="properties"></a>

### Properties

The `@property` decorator lets you access a method exactly like a plain attribute (like `c.area`) while secretly running a function to validate or compute the value. Use it to hide internal messy details (like `_radius`) behind a clean API.

This solves a problem that other languages solve with lots of mandatory **boilerplate** (repetitive setup code). In Java, you must write `getX()` and `setX()` methods from day one, because trying to add them later breaks every piece of code that was using the variable. Python lets you start with a plain public variable and *upgrade it invisibly* the day you need validation, lazy loading, or a computed value — `c.radius` keeps working exactly as before, even though it's now secretly calling a method. That is why "just use a public variable until you need more" is idiomatic in Python rather than seen as sloppy.

Two mechanics to note: the secret backing variable must have a different name (we use the `_radius` convention) or the setter function would **recurse forever** (call itself endlessly until it crashes). Also, a read-only property like `area` is recomputed from scratch every single time you ask for it — use `functools.cached_property` when that math is expensive and you only want to do it once.

```
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

<a id="dataclasses-python-37"></a>

### Dataclasses (Python 3.7+)

Dataclasses auto-generate boring methods like `__init__`, `__repr__`, and `__eq__` for you — use them for classes that mostly just hold data.

The `@dataclass` decorator is a **code generator** (a tool that writes code for you behind the scenes): at the moment the class is defined, it reads your variable names and synthesises all the methods you would normally hand-write, turning thirty lines of tedious boilerplate into five simple lines. The **type annotations** (like `: float`) are what drive it — if you leave the annotation off a variable, the dataclass ignores it completely (even though Python itself still doesn't enforce those types at runtime).

Three options cover most needs: use `field(default_factory=list)` for mutable defaults (writing a plain `= []` is explicitly rejected to protect you from the shared-default bug from Section 8), set `frozen=True` to make the objects immutable (and therefore hashable), and set `order=True` to generate sorting methods that compare the objects field-by-field.

```
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

<a id="11-error-handling"></a>

## 11. Error Handling

An exception is a **control-flow mechanism** (a way to jump out of deep code safely), not just a red error report. When one is raised, Python instantly abandons what it's doing and unwinds back up the chain of functions until it finds a matching `except` block — or reaches the top and crashes with a **traceback** (the detailed printout showing exactly where things failed). That is why a deeply nested failure can be handled gracefully in one spot far up the chain, instead of every single function needing to check and pass along error codes.

Python leans on exceptions more than most languages, guided by the philosophy of **EAFP** — *Easier to Ask Forgiveness than Permission*. Rather than meticulously checking every condition first, you just attempt the operation and handle the failure if it happens: trying `d[key]` inside a `try` block is preferred to writing `if key in d:`, which does the lookup twice and leaves a tiny split-second window where the data could change in between.

The discipline that makes this work safely is **catching narrowly**. Writing `except Exception:` swallows typos and logical bugs alongside genuine failures, turning a loud obvious crash into silent wrong behaviour — and writing a totally bare `except:` even traps the user's Ctrl+C (`KeyboardInterrupt`), meaning you cannot even stop your own program! Catch only the specific exceptions you know how to fix, and let the rest crash; a traceback is a helpful feature, not a failure.

The four clauses divide the work: keep the `try` block as small as possible (ideally just the one risky line), put success-dependent follow-up steps in `else`, and put cleanup (like closing files) in `finally`, which is guaranteed to run on absolutely every path out — normal completion, an error, or even a `return` statement inside the `try`. `except` handlers are tested in order and respect inheritance, so you must always put broad catch-alls at the bottom.

```
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

<a id="common-exceptions"></a>

### Common Exceptions

Here are some of the most common exceptions you will encounter: `ValueError`, `TypeError`, `KeyError`, `IndexError`, `FileNotFoundError`, `AttributeError`, `ZeroDivisionError`, `ImportError`, and `NameError`.

These sit in a family tree rooted at `BaseException`, and the shape of that tree is what makes targeted catching possible. `KeyError` and `IndexError` both come from `LookupError`, so one handler covers both; `FileNotFoundError` and `PermissionError` both come from `OSError`. The `ValueError` / `TypeError` split encodes a real distinction — the *type* of the data was right but the actual *value* was broken, versus the type itself being wrong. `KeyboardInterrupt` and `SystemExit` deliberately sit outside the main `Exception` tree so that `except Exception:` cannot accidentally trap them.

<a id="12-modules--imports"></a>

## 12. Modules & Imports

A **module** is simply any `.py` file, and a **package** is just a directory full of them. Both exist to give names a safe home: each module has its own global **namespace** (a clean room for variables), so a function called `utils.parse` and one called `network.parse` will never collide.

The mechanics behind this explain most import errors. `import utils` searches a list called `sys.path` in order — checking the script's own directory first, then standard libraries, then installed packages — and it simply takes the **first** match it finds. This is why accidentally naming your test file `random.py` breaks things by shadowing (hiding) the real built-in `random` module. Once found, the module is **executed from top to bottom exactly once** and the result is cached; every later import just reuses that cached object. So any code sitting loose at the module level runs immediately at import time, which is a strong reason to keep module bodies strictly to definitions and constants.

On import style: writing `import math` binds one name and forces you to use `math.sqrt()`, which makes it obvious where the function came from. Writing `from math import sqrt` is shorter but hides origins. Using `from module import *` is a bad habit to avoid entirely — it blindly pulls in an unknown set of names that can silently overwrite your own variables.

The infamous `if __name__ == "__main__":` guard follows from this same machinery: Python automatically sets the special variable `__name__` to the module's own name when importing it, but sets it to the string `"__main__"` when you run the file directly from the terminal. Therefore, this check distinguishes "this file was imported as a library" from "this file was run as a program". Without it, simply importing a module would accidentally execute all its script logic.

```
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

<a id="13-file-io"></a>

## 13. File I/O

The `open()` function returns a **file object** — best understood as a cursor pointing to a specific spot in a file stream. It holds a position that advances as you read, which is exactly why calling `f.read()` a second time returns an empty string (the cursor is at the end!). The operating system also strictly limits how many files your program may hold open at once, and buffered writes (data waiting in memory) are not guaranteed to actually reach the hard drive until the file is properly closed.

That cleanup is exactly what `with open(...) as f:` guarantees. It is a **context manager** (an object that knows how to properly clean up after itself), and its exit step automatically closes the file on every possible path out of the block — including crashes and early `return` statements. By contrast, a manual `f.close()` is completely skipped whenever an error crashes the code above it. Treat the `with` block as the only correct way to open files.

The other decision at every `open()` is **text versus binary** mode. Text mode (the default) automatically decodes raw computer bytes into a `str` and normalises different line endings across operating systems. Binary mode (`"rb"`, `"wb"`) gives you the raw `bytes` directly. Since the default text encoding depends on what computer you are running on, always pass `encoding="utf-8"` explicitly so your file works everywhere.

Two practical notes. Calling `f.read()` and `f.readlines()` loads the entire file into memory at once, while iterating the file object in a loop (`for line in f:`) is lazy — it reads one line at a time and stays fast and memory-efficient even for huge files. Note that each line keeps its trailing newline character (`\n`), which is why you'll constantly see people write `line.strip()`. Also, opening a file with `"w"` truncates (deletes) the file the split-second it is opened, so a crash right after leaves you with a totally empty file; if the data matters, write to a temporary file first and rename it.

JSON is the usual format for saving data, but the translation is **lossy** (information is lost during conversion) in one direction: tuples come back as lists, integer dictionary keys are silently turned into strings, and `set`s, `datetime`s, and custom classes are simply impossible to save without writing a custom encoder. For handling file paths, the modern `pathlib` library treats a path as a smart object rather than a dumb string, giving you helpers like `p.parent` or `p.suffix` and overloading the `/` operator for joining paths, which fixes an entire class of bugs across Windows and Mac.

```
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

<a id="unit-3"></a>

## Unit 3 — Pythonic Power Tools

The features that make code idiomatic: generators, decorators, context managers, type hints and unpacking.

<a id="14-iterators--generators"></a>

## 14. Iterators & Generators

This is the secret machinery every `for` loop relies on, and there are two roles involved. An **iterable** (a collection that can be looped over, like a list) can produce an iterator because it implements the `__iter__` method, and it can be traversed repeatedly since each new loop asks for a fresh cursor. An **iterator** (the internal cursor that does the walking) implements the `__next__` method and is **single-use**: once it reaches the end and raises a `StopIteration` error, it stays exhausted (empty) forever. That distinction explains why you can loop over a list twice but a generator only once, and why tools like `zip`, `map`, and `enumerate` give you empty results if you try to loop over them a second time.

A **generator** (a function that pauses itself) is the easy way to build an iterator. Putting a single `yield` keyword anywhere inside a function body completely changes how it works: calling the function no longer runs the code inside it — it just returns a generator object and waits. The body starts running on the first `next()` call, runs until it hits the first `yield`, hands back that value, and then *freezes* (suspends its state), perfectly preserving all its local variables and its exact position inside loops. The next time you call `next()`, it wakes up and resumes right where it left off. When the function finally reaches the end, a `StopIteration` is raised automatically.

That suspend-and-resume ability is exactly why `fibonacci()` below can be infinite — the `while True:` loop never completes, but it also never runs longer than you ask it to. And because each generator can both consume an iterable and produce one, generators compose like Unix pipes (meaning you can connect them together so data flows through them): a reading stage feeding a filtering stage feeding a final loop can process a 50 GB file in constant, tiny memory, with nothing actually computed until the final loop starts pulling the data.

```
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

<a id="15-decorators"></a>

## 15. Decorators

A decorator is a **function that takes another function and returns a replacement for it**. It works only because functions in Python are **first-class objects** (meaning they can be treated exactly like any other variable): you can accept one as an argument, define a new wrapper function around it, and return that wrapper instead.

The `@` syntax is just pure sugar (a convenient shortcut for typing) — writing `@timer` directly above `def slow_func` means exactly the same thing as writing `slow_func = timer(slow_func)`. The name now refers to the wrapper, which closes over (wraps around) the original function and can run code before it, after it, or around it in a `try`/`finally` block.

What this buys you is the ability to separate **cross-cutting concerns** (features that lots of different functions need, like timing, caching, retries, logging, authentication, or validation) from the actual logic they surround, instead of copy-pasting that extra code into every single function. You actually already use decorators as a consumer: `@property`, `@staticmethod`, `@dataclass`, and every web framework's routing tools are all decorators.

There are three details that make the difference between a working decorator and a broken one:

1. **You must use `*args, **kwargs`** — the wrapper must accept whatever arguments the decorated function accepts (since the decorator cannot know its signature in advance) and pass them straight through.
2. **You must remember to `return` the result** — forgetting to return the inner call's result is the most common bug; if you forget, the function suddenly starts returning `None`.
3. **You should apply `@functools.wraps(func)`** — this copies the original function's name and documentation onto the wrapper. Without it, the function reports its name as `wrapper`, its docstring vanishes, and tools get confused. You should treat this step as mandatory.

When multiple decorators are stacked, application happens bottom-up and execution is therefore top-down, like layers of an onion — so order changes behaviour! (For example, putting a cache decorator above an authentication decorator would serve cached results without checking if the user is logged in).

```
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

<a id="16-context-managers"></a>

## 16. Context Managers

A **context manager** (an object that automatically handles setup and cleanup) answers a question every program faces: *how do I guarantee this cleanup runs, no matter how the block is left?* Files must be closed, locks released, databases committed or rolled back — and the block might exit through a crash, a `return`, or a `break`.

Using `try`/`finally` solves it, but pushes the burden onto every caller and separates the setup from the teardown. The `with` statement moves that responsibility into the resource itself! The protocol (the set of required methods) involves two things: `__enter__()` runs on entry and its return value is what `as` binds; `__exit__(exc_type, exc_value, traceback)` runs on the way out and receives the exception details if one occurred, or three `None`s if not. Returning a truthy value from `__exit__` **suppresses** (hides) the exception — which is how `contextlib.suppress()` works — while the usual `False`/`None` lets the error propagate (continue bubbling up) after the cleanup is done.

The `@contextmanager` decorator reuses the suspend-and-resume behaviour of generators from Section 14: code before the `yield` is the setup, code after it is the teardown, and both live elegantly in one readable function. You must wrap the `yield` in a `try`/`finally` block in real code — if the `with` body crashes, the exception is thrown *into* the generator at the `yield` line, so without `finally` everything after it is skipped and your cleanup never runs! That is precisely the flaw in the simple `timer()` below, which prints nothing when the block fails.

```
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

<a id="17-type-hints"></a>

## 17. Type Hints

Type hints add an **optional, gradual static type layer** (hints that tools can read but Python itself mostly ignores) to a dynamically typed language. *Optional* is literal: the interpreter parses your annotations and stores them, but then ignores them entirely when running. Passing an integer where the hint says `str` raises no error at runtime — the checking is a completely separate step performed by tools like `mypy`, `pyright`, or your code editor.

So why write them? Three reasons carry the value: they catch a real class of bugs before the code ever runs (like a function that might return `None` being used without a check, or arguments silently swapped); they act as documentation that **cannot go stale** (outdated) because the checker verifies it; and they power accurate autocomplete, safe renames, and go-to-definition in your editor.

*Gradual* means you can annotate one function or one module and leave the rest alone — anything unannotated is treated as `Any` and simply not checked, which is what makes hints practical to add to an existing codebase.

Syntax notes: since Python 3.9, the built-in generics (types that hold other types) work directly (like `list[str]` or `dict[str, int]`), so the old `typing.List` is unnecessary. Since 3.10, `str | None` is the preferred, cleaner way to write `Optional[str]`.

```
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

<a id="18-unpacking--useful-patterns"></a>

## 18. Unpacking & Useful Patterns

Unpacking lets the **left-hand side of an assignment mirror the exact shape of the data**. Instead of writing `x = point[0]` and `y = point[1]`, you just write `x, y = point` — the structure is stated once and the names fall neatly out of it. Python iterates the right-hand side and binds each value to the matching target, so it works with any iterable. Without a star, the counts must match exactly; with a **starred target** (a variable with a `*`, at most one allowed), it greedily gathers up any leftover items the fixed targets do not claim, always producing a `list`.

This also explains the magic of `a, b = b, a`: the right side is evaluated first into a temporary background tuple, which is then unpacked — the language essentially makes the temporary variable for you.

The `*` and `**` symbols mean opposite things depending on position. In a **definition** they *collect* (`def f(*args, **kwargs)` gathers extra variables into a tuple and a dictionary); in a **call** they *spread* (`f(*lst)` explodes a list into positional arguments, `f(**d)` explodes a dict into keyword arguments). Packing and unpacking being exact inverses of each other is what makes transparent forwarding — the basis of decorators and wrappers — possible.

The built-ins listed here are worth internalising because they replace hand-written loops with a single readable expression. `any()` and `all()` also **short-circuit** (stop running as soon as they know the answer), and combining them with a generator expression means no intermediate list is ever built.

```
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
len(nums)                              # 4
abs(-5)                                # 5
round(3.14159, 2)                      # 3.14
divmod(17, 5)                          # (3, 2)  → (quotient, remainder)
list(reversed(nums))                   # [-2, 3, 7, 1]

items = [{"name": "b"}, {"name": "a"}]
sorted(items, key=lambda x: x["name"]) # [{'name': 'a'}, {'name': 'b'}]
list(map(str.upper, ["a", "b"]))       # ['A', 'B']
list(filter(lambda n: n > 0, nums))    # [1, 7, 3]
```

<a id="unit-4"></a>

## Unit 4 — Ecosystem & Beyond

The standard library, packaging, concurrency, and the habits of idiomatic Python.

<a id="19-common-standard-library"></a>

## 19. Common Standard Library

Python's "batteries included" philosophy (it comes with almost everything you need out of the box) means the answer to a surprising number of problems is already installed — and every third-party dependency you avoid is one fewer version conflict, security advisory, and install step. Here is what each module below is actually for:

1. **`os` / `sys`** — these define the boundary with the operating system and interpreter. `os.environ` is the standard place to read configuration and secrets; `sys.argv` carries command-line arguments (graduate to `argparse` once there is more than one).
2. **`math`** — this provides float mathematics written in C. Note `math.isclose()` for comparing floats, since `==` on floats is unreliable.
3. **`random`** — this generates random numbers that are fast and statistically good, but they are **not cryptographically secure**. Anything involving passwords, tokens, or session IDs must use the `secrets` module instead.
4. **`datetime`** — this handles dates and times. The critical distinction is naive versus timezone-aware. A naive `datetime` does not identify a real moment, so store and compute in UTC and convert only for display.
5. **`re`** — this gives you regular expressions. You should always write patterns as raw strings (`r"\d+"`), or Python's own escaping consumes the backslashes first. Quantifiers are **greedy** by default (they grab as much text as possible), so `.*` swallows more than you expect — use `.*?` for the lazy form.
6. **`logging`** — this is the replacement for `print` in anything that runs unattended: severity levels let you filter, `getLogger(__name__)` gives per-module control, and handlers route output to files or services.
7. **`collections`** — this provides specialised containers that delete boilerplate. For example, `Counter` tallies and ranks; `defaultdict(list)` turns grouping into a single `dd[key].append(x)` by calling a factory for missing keys; `deque` gives `O(1)` operations at *both* ends where a list's `pop(0)` is `O(n)`.

```
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

<a id="20-virtual-environments--packages"></a>

## 20. Virtual Environments & Packages

The problem is unavoidable in a shared installation: project A needs `django==3.2`, project B needs `django==4.2`, and a single global packages folder can hold only one version. Installing B's requirements silently breaks A — and since your operating system's own tooling often depends on the system Python, running `sudo pip install` can break the machine itself.

A **virtual environment** (an isolated sandbox folder for your project's packages) is nothing magical: it is just a directory with its own packages folder and a link to a base interpreter. "Activating" it simply points your computer to this local folder first, so `python` and `pip` use the project's copies. This is why deleting the folder is a complete uninstall! The golden rules are: **one environment per project, never installed globally, and never committed to version control (like Git).** What you commit is the *declaration* of dependencies (a text file listing them), so the environment can be perfectly rebuilt anywhere.

On that declaration, note the big difference between what you **declare** and what you **lock**. Your direct requirements are a short list with deliberately loose bounds (like `requests>=2.28`), expressing your general intent. Running `pip freeze` produces something else entirely — the exact version of every single installed package, including **transitive ones** (the hidden dependencies that your direct dependencies secretly installed). That is a **lock file** (an exact snapshot of all package versions): perfect for reproducing a deployment exactly, but poor as a record of intent. Modern projects declare dependencies in a `pyproject.toml` file and generate the lock separately; `uv` is a fast, increasingly standard tool for both.

```
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

<a id="uv-fast-alternative"></a>

### uv (Fast Alternative)

`uv` is a fast modern tool for creating environments and installing packages. It can use the exact same `.venv` folder layout as `venv`, but resolves and installs packages much faster than the traditional `pip` workflow.

```
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

Use `uv` when you want one lightning-fast tool for environment creation, dependency resolution, and repeatable installs. The existing `venv` and `pip` commands remain perfectly valid and are useful when you want only Python's built-in tooling without extra downloads.

<a id="21-asyncawait-quick-intro"></a>

## 21. Async/Await (Quick Intro)

Async solves one specific problem: **a program that spends most of its time waiting**. A script fetching 100 URLs is idle almost the entire run, blocked waiting on the network. Sequential code waits 100 times in a row; async code issues all the requests at once and handles each response as it arrives.

The model is **cooperative multitasking on a single thread** (meaning tasks take turns running on one processor core, voluntarily pausing to let others run). An **event loop** (the central traffic controller) holds a set of coroutines and runs one at a time; every `await` on something not-yet-ready is a coroutine voluntarily handing control back, letting the loop run another task until the first one's data arrives. Two consequences follow immediately:

1. **Async provides concurrency, not parallelism.** Concurrency means juggling multiple tasks, but only doing one thing at any exact millisecond. Only one line of Python runs at any instant, so async gives absolutely zero speedup for heavy CPU-bound math work — that needs `multiprocessing`.
2. **One blocking call freezes everything.** Because scheduling is cooperative, a coroutine that calls `time.sleep()` or `requests.get()` never yields, stalling the whole loop. Async requires async-aware libraries throughout (like `asyncio.sleep` or `aiohttp`), or offloading heavy tasks via `asyncio.to_thread()`.

The vocabulary is small: `async def` defines a **coroutine function** (a special async function); calling it returns a coroutine object and runs *nothing* — forgetting to actually `await` it is the classic beginner bug. `await` suspends until the awaited thing completes. `asyncio.run(main())` starts the loop and is the single entry point from synchronous code.

Crucially, awaiting one coroutine after another is still strictly sequential. Concurrency comes from scheduling several at once, which is what `asyncio.gather()` does — hence ~2s rather than 3s in the example below. In Python 3.11+, `asyncio.TaskGroup` is preferred: it safely cancels the remaining tasks when one fails instead of accidentally leaving them running in the background.

```
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

<a id="22-concurrency-threading-quick-intro"></a>

## 22. Concurrency: Threading (Quick Intro)

Threading allows Python to handle multiple I/O-bound tasks concurrently. Because of the **Global Interpreter Lock** (GIL, a rule that prevents multiple threads from running Python code at the exact same time), multiple threads cannot execute Python bytecode simultaneously. However, the GIL is released during slow I/O operations (like network requests or file reads), making threads highly effective for programs that spend time waiting.

Use the `threading` module to create threads manually, or `concurrent.futures.ThreadPoolExecutor` for a simpler, higher-level pool API.

```
import threading
import time

def fetch_data(url):
    print(f"Fetching {url}...")
    time.sleep(2)  # Simulate network I/O
    print(f"Done: {url}")

# Run multiple tasks concurrently
threads = []
for u in ["url1", "url2", "url3"]:
    t = threading.Thread(target=fetch_data, args=(u,))
    t.start()
    threads.append(t)

# Wait for all threads to complete
for t in threads:
    t.join()

print("All tasks finished!")
```

<a id="23-pythonic-tips"></a>

## 23. Pythonic Tips

"**Pythonic**" (writing code the way Python was designed for) is not just a synonym for clever or short. It means solving a problem using Python's specific protocols and idioms, rather than transliterating (translating word-for-word) patterns from another language like Java or C++. Non-Pythonic code usually still works; it is just longer, slower, and harder for the next reader to understand.

The tips below are individual expressions of a few underlying principles: **prefer iteration protocols to manual index arithmetic**, **let objects manage their own resources** through context managers, **express intent declaratively** (saying what you want, not how to do it) with comprehensions and built-ins, and **keep the common case short while making the exceptional case explicit**.

Two of them are worth an extra sentence. Writing `if not my_list:` relies on truthiness, so you should use `if x is None:` instead whenever `0`, `""`, or `[]` are legitimate actual values distinct from "missing". And writing `" ".join(words)` is not merely tidier than using `+=` in a loop — because strings are immutable, each `+=` copies everything accumulated so far, making the loop extremely slow (quadratic time) while `join` is lightning fast (linear time).

Consistency matters more than any single rule, which is exactly why PEP 8 exists and why automated formatters and linters (like `black` or `ruff`) are near-universal: they settle style arguments automatically so code review can focus on actual behaviour.

```
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

<a id="naming-conventions-pep-8"></a>

### Naming Conventions (PEP 8)

| What | Convention | Example |
| --- | --- | --- |
| Variables | `snake_case` | `user_name` |
| Functions | `snake_case` | `get_user()` |
| Classes | `PascalCase` | `UserAccount` |
| Constants | `UPPER_CASE` | `MAX_RETRIES = 3` |
| Private | `_prefix` | `self._internal` |

<a id="quick-reference-card"></a>

## Quick Reference Card

Here is a handy one-screen cheat sheet of the syntax and patterns used throughout this crash course. Think of it as a quick reference guide — use it for fast recall, and jump back to the earlier sections if you ever need a refresher on how they work!

```
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

> 🐍 **Next steps:** Looking for high-frequency daily patterns and interview cheat sheets? Check out the [Python My Course](python-my-course.html). For deeper coverage of OOP, generators, async, testing, and more — see the full [Python Detailed Course](python-detailed-course.html) or browse all languages in the [Language Courses catalog](../programming-languages.html).

---

TechToday Python Study Library
