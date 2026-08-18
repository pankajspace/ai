[<- README](../../README.md)

# Python Course

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

## 1. Getting Started

Python is an **interpreted**, **high-level**, **general-purpose** language, and each of those words has a practical consequence.

1. **Interpreted** — you never compile to a machine-code binary. The interpreter (CPython, written in C) parses your `.py` file, compiles it to intermediate *bytecode* (cached in `__pycache__/*.pyc`), and executes that bytecode on a virtual machine. This is why a syntax error is caught immediately but a `TypeError` only appears when the offending line actually runs.
2. **High-level** — memory allocation, garbage collection, and pointer arithmetic are handled for you. You describe *what* you want, not how the machine should move bytes.
3. **General-purpose** — the same language runs web servers, trains models, and automates spreadsheets, which is why the standard library is described as "batteries included".

Python also uses **significant whitespace**: indentation is syntax, not style. Where C-family languages use `{ }` to delimit a block, Python uses the indentation level itself. Badly indented Python is not ugly Python — it is *broken* Python.

### Installing Python

**Windows**
1. Download the installer from [python.org](https://www.python.org/downloads/).
2. Run it and **check "Add Python to PATH"** before clicking Install.
3. Verify:
   ```powershell
   python --version
   pip --version
   ```

**macOS**
```bash
brew install python
python3 --version
pip3 --version
```

**Linux (Debian/Ubuntu)**
```bash
sudo apt update && sudo apt install python3 python3-pip
python3 --version
pip3 --version
```

> On macOS/Linux the commands are `python3`/`pip3` unless you've aliased `python`/`pip` to point at Python 3.

The `python3` vs `python` split is historical: macOS and most Linux distributions shipped Python 2 as `/usr/bin/python` for years, so Python 3 was installed alongside it under a different name. Never `pip install` into that system interpreter — the operating system itself depends on it. Always work inside a virtual environment (section 31).

### Running Python Code

The REPL (`python`) evaluates lines immediately — great for trying snippets. `python my_script.py` runs a saved file from top to bottom.

The two modes serve genuinely different purposes. The **REPL** (Read–Eval–Print Loop) keeps state alive across statements, so it is your laboratory: check what a method returns, inspect an object with `dir(obj)` or `help(obj)`, test a one-liner before committing it. **Script mode** starts a fresh interpreter and executes every module-level statement in order — including `def` and `class`, which are themselves statements that bind a name to an object. Nothing is "hoisted": you cannot call a function on line 3 that is defined on line 10.

```bash
# Interactive REPL
python

# Run a script
python my_script.py
```

### Your First Program

`print()` sends text to the console. This is the smallest complete Python program.

This one line already shows three things. `print` is a **built-in function**, not a keyword — you can pass it around or rebind it. The parentheses form a **call expression** applied to that function object. And `"Hello, World!"` is a `str` **literal**, an immutable sequence of Unicode code points. There is no `main()`, no class wrapper, and no semicolon: Python favours the shortest path from intent to running code.

```python
print("Hello, World!")    # Hello, World!
```

### Comments

`#` comments out the rest of the line. Triple-quoted strings (`"""..."""`) are often used as documentation (docstrings), not as multi-line comments.

The two forms are not equivalent under the hood. A `#` comment is discarded by the tokenizer and never reaches the bytecode. A triple-quoted string is a **real expression** that is evaluated and then discarded — unless it is the first statement in a module, function, or class, in which case Python stores it as that object's `__doc__` attribute. That is exactly how `help()` and IDE tooltips work. Use `#` for commentary; reserve triple quotes for docstrings.

```python
# This is a single-line comment

"""
This is a multi-line string,
often used as a docstring or block comment.
"""
```

## 2. Variables & Data Types

The key insight is that **Python variables are names, not boxes**. In C, `int x = 5` reserves a slot of memory and writes `5` into it; assigning again overwrites that slot. In Python, `x = 5` creates an integer *object* on the heap and binds the name `x` to it in a namespace dictionary. Reassigning `x = "hello"` does not change the integer — it re-points the label at a different object, leaving the old one to be reclaimed once nothing references it.

This "names and objects" model explains most of Python's surprising behaviour:

1. **Types belong to objects, not to names.** A name can point at an `int` today and a `list` tomorrow. This is what *dynamic typing* means — the type check happens when an operation is attempted, not when the name is bound.
2. **Assignment never copies.** `b = a` gives you a second name for the *same* object. If that object is mutable, changes made through `b` are visible through `a`.
3. **Mutability is the property that really matters.** `int`, `float`, `str`, `tuple`, `bool`, `frozenset`, and `None` are **immutable**: no operation changes them in place, so they are safe to share freely and are hashable. `list`, `dict`, `set`, and most user-defined classes are **mutable**, so sharing them is a decision, not an accident.
4. **Everything is an object**, including functions, classes, and modules. That uniformity is why decorators, higher-order functions, and introspection work so naturally.

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

The built-ins divide naturally into **scalars** (a single value), **sequences** (ordered and indexable), and **hash-based containers** (sets and mappings). Two properties are worth knowing up front. `int` has **arbitrary precision** — it grows to fit any number and never overflows, unlike the fixed 32/64-bit integers of most languages, so factorials and cryptographic keys need no special type. `float` is an IEEE-754 double, which is why `0.1 + 0.2` famously evaluates to `0.30000000000000004`; reach for `decimal.Decimal` when exact base-10 arithmetic matters, such as money.

1. `int` — `42`, `-7`, `0b1010` — immutable
2. `float` — `3.14`, `-0.001`, `1e10` — immutable
3. `complex` — `3 + 4j` — immutable
4. `bool` — `True`, `False` — immutable
5. `str` — `"hello"`, `'world'` — immutable
6. `list` — `[1, 2, 3]` — **mutable**
7. `tuple` — `(1, 2, 3)` — immutable
8. `set` — `{1, 2, 3}` — **mutable**
9. `dict` — `{"a": 1, "b": 2}` — **mutable**
10. `None` — `None` — immutable

### Type Checking & Conversion

`type()` reports the class; `isinstance()` is the preferred check (it respects subclasses). Casting (`int("42")`) fails with `ValueError` if the string isn’t a valid number.

Use `type()` only when you need the *exact* class; use `isinstance()` when you mean "this type **or a subclass of it**". The distinction matters because `bool` is genuinely a subclass of `int` in Python, so `isinstance(True, int)` is `True` while `type(True) is int` is `False`.

The conversion functions are **constructors**, not casts — they build a brand-new object rather than reinterpreting existing memory. `bool()` deserves special attention because it silently drives every `if` statement: empty containers (`""`, `[]`, `{}`, `set()`), zero of any numeric type, and `None` are **falsy**; everything else is **truthy**. That rule is what makes `if not my_list:` the idiomatic emptiness check.

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

## 3. Operators

Operators in Python are **syntactic sugar over dunder methods**. When you write `a + b`, the interpreter calls `type(a).__add__(a, b)`; if that returns `NotImplemented`, it falls back to `type(b).__radd__(b, a)`. This single mechanism is why `+` concatenates strings, merges lists, and adds numbers — each type supplies its own implementation, and section 12 shows how to give your own classes the same abilities.

One structural point: in Python, **assignment is a statement, not an expression**. `x = 5` produces no value and cannot appear inside an `if` or a function call. That deliberate restriction eliminates the classic C bug of typing `if (x = 5)` when you meant `if (x == 5)` — and it is exactly why the walrus operator `:=` had to be introduced separately when an expression-form assignment was genuinely needed.

### Arithmetic

`+ - * /` work as expected; `//` floors, `%` is remainder, `**` is power. Mixing `int` and `float` promotes to `float`.

The two division operators exist for a reason. `/` is **true division** and always returns a `float`, even when the result is exact (`4 / 2` is `2.0`). `//` is **floor division**, which rounds *toward negative infinity* rather than toward zero — so `-7 // 2` is `-4`, not `-3`. The modulo operator `%` is defined to stay consistent with that rule, meaning its result always carries the sign of the *divisor* (`-7 % 2` is `1`). This is what makes `%` reliable for cyclic arithmetic such as wrapping array indices or computing clock positions, and it is a real difference from C and Java.

```python
5 + 3     # 8    Addition
5 - 3     # 2    Subtraction
5 * 3     # 15   Multiplication
5 / 3     # 1.6666666666666667  True division (always float)
5 // 3    # 1    Floor division (integer)
5 % 3     # 2    Modulo (remainder)
5 ** 3    # 125  Exponentiation
```

### Comparison

Comparisons return `True` or `False`. You can chain them (`0 < x < 10`) instead of writing `and`.

**Chaining** is a genuine Python feature, not a formatting trick: `0 < x < 10` is evaluated as `0 < x and x < 10` except that `x` is computed only once. It works for any mix of comparison operators and any number of terms, and it is both faster and more readable than the explicit `and` form.

```python
5 == 5    # True    Equal
5 != 3    # True    Not equal
5 > 3     # True    Greater than
5 < 3     # False   Less than
5 >= 5    # True    Greater than or equal
5 <= 3    # False   Less than or equal
```

### Logical

`and` / `or` / `not` combine booleans. They short-circuit: `and` stops at the first falsy value, `or` at the first truthy one — so they can return the actual operand, not only `True`/`False`.

This is the subtlety that trips up newcomers: `and` and `or` do **not** return booleans, they return *one of their operands*. `and` walks left to right and yields the first falsy value it finds, or the last value if none are falsy; `or` yields the first truthy value, or the last value if none are truthy. Because evaluation stops as soon as the answer is determined, the right-hand side may never run at all — which makes these operators safe guards: `user and user.name` returns `None` instead of raising `AttributeError`, and `config.get("port") or 8080` supplies a fallback. Be careful with that second pattern when `0` or `""` are legitimate values, since they are falsy and would be replaced by the fallback.

```python
True and False   # False
True or False    # True
not True         # False

# Short-circuit evaluation
0 and "hello"    # 0      (stops at first falsy)
0 or "hello"     # "hello" (returns first truthy)
```

### Identity & Membership

`is` asks “same object?”; `==` asks “same value?”. `in` tests membership in strings, lists, dict keys, and sets.

`==` is customisable through `__eq__` and expresses *equivalence*; `is` compares the underlying `id()` values, can never be overridden, and expresses *identity*. Reserve `is` for singletons — `x is None`, `x is True`, `x is SENTINEL` — because CPython guarantees there is exactly one such object. Using `is` for value comparison appears to work for small integers and short strings only because CPython **interns** (caches) them, and then silently breaks for larger values: `256 is 256` is `True`, but `257 is 257` may not be.

Membership with `in` also has very different costs depending on the container: scanning a list or tuple is `O(n)`, while checking a `set` or a `dict` key is `O(1)` on average.

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

`+=`, `*=`, and friends update a name in place. For lists, `+=` is like `extend` — it mutates the existing list.

That list behaviour is not a quirk; it follows from the dunder protocol. Augmented assignment first tries the *in-place* method (`__iadd__`), and only falls back to `__add__` plus a rebind if the type does not provide one. Mutable types like `list` implement `__iadd__`, so `lst += [1]` mutates the object every other name is also pointing at. Immutable types cannot, so `x += 1` on an integer always creates a new object and rebinds the name. The practical difference:

```python
a = [1, 2]; b = a
a += [3]        # mutates in place -> b is also [1, 2, 3]

a = [1, 2]; b = a
a = a + [3]     # builds a new list  -> b is still [1, 2]
```

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

Assigns and returns a value in one expression. It exists precisely because plain `=` is a statement: the walrus restores the *expression* form for the narrow cases where it improves readability, while its deliberately different spelling keeps the `=`/`==` typo hazard out. Reach for it when you would otherwise compute a value twice, or when a loop condition needs the value it is testing — and avoid it when it merely crams unrelated work into a condition.

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

A one-line if/else that **returns a value**: `a if condition else b`. Use it for simple choices, not for long branches.

The ordering reads oddly at first because the *value* comes before the *test*; read it as "give me `a`, if `condition` holds, otherwise `b`". Being an expression is the whole point — it can appear anywhere a value is expected: inside an f-string, as a function argument, as a default, or in a comprehension. It also short-circuits, so only the selected branch is ever evaluated.

```python
age = 20
status = "adult" if age >= 18 else "minor"
status    # 'adult'
```

## 4. Strings In Depth

Two words define Python strings: **Unicode** and **immutable**, and both have far-reaching consequences.

A Python 3 `str` is a sequence of **code points**, not bytes. `len("café")` is `4` no matter how many bytes that takes on disk. Bytes are a separate type, `bytes`, and you move between the two explicitly with `.encode()` and `.decode()`. This strict separation is the biggest change from Python 2 and it eliminates an entire category of mojibake bugs — the price is that you must choose an encoding (almost always UTF-8) at every I/O boundary.

**Immutable** means no string method ever modifies the original; every one of them returns a *new* string. Calling `s.upper()` on its own line accomplishes nothing — you must assign the result. Immutability is what makes strings hashable (so they can be dict keys) and safe to share between threads, at the cost of making repeated concatenation in a loop quadratic, since each `+=` copies the whole accumulated string. That is why `"".join(parts)` is the idiomatic way to build a string from many pieces.

```python
s = "Hello, World!"
s = 'Hello, World!'        # single or double quotes
s = """Multi
line string"""
```

### Indexing & Slicing

Indexes start at `0`; negative indexes count from the end. A slice `[start:stop:step]` never includes `stop`. `[::-1]` reverses a sequence.

Slicing follows three rules that, once internalised, apply to **every** sequence in Python — lists, tuples, `range`, `bytes`:

1. **`start` is inclusive, `stop` is exclusive.** This half-open convention means `len(s[a:b]) == b - a`, and that adjacent slices such as `s[:3]` and `s[3:]` tile the sequence perfectly with no overlap and no gap.
2. **Negative indices count from the end**, with `-1` as the last element — so `s[-3:]` means "the last three items" without needing the length.
3. **Slicing never raises `IndexError`.** Out-of-range bounds are silently clamped, so `"ab"[:100]` is just `"ab"`. Plain indexing (`s[100]`) *does* raise. That asymmetry is intentional and frequently useful.

A negative `step` walks backwards, which is the whole trick behind `s[::-1]`. A slice of a string or tuple produces a new immutable object; a slice of a list produces a **shallow copy** — handy as `lst[:]` for "copy this list".

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

Methods return **new** strings (immutability). `split`/`join` convert between strings and lists; `find` returns `-1` if missing, `index` raises.

Rather than memorising the list, group the methods by purpose: **trimming** (`strip`, `lstrip`, `rstrip`), **case** (`lower`, `upper`, `title`, `capitalize`), **searching** (`find`, `index`, `count`, `startswith`, `endswith`), **splitting and joining** (`split`, `rsplit`, `splitlines`, `join`), and **classification** (`isalpha`, `isdigit`, `isspace`, …).

Two pairs are worth calling out. `find()` returns `-1` when the substring is absent while `index()` raises `ValueError` — choose based on whether "not found" is a normal outcome or a bug. And `strip("abc")` does **not** remove the substring `"abc"`; it strips any leading and trailing characters belonging to that *set* of characters, so `"cabbage".strip("abc")` gives `"ge"`. Use `removeprefix()` / `removesuffix()` (Python 3.9+) when you mean a literal substring.

Note also that `"a b".split()` with no argument splits on **any run of whitespace** and discards empties, whereas `split(" ")` splits on each single space and can produce empty strings.

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

You cannot assign to `s[0]`. Build a new string instead (`"H" + s[1:]`) or use a list of characters if you need many edits.

```python
s = "hello"
# s[0] = "H"   # ❌ TypeError — strings can't be modified in place
s = "H" + s[1:]  # ✅ creates a new string: "Hello"
```

## 5. Data Structures

Choosing the right container is the highest-leverage design decision in everyday Python, because it determines both correctness and performance. Four questions decide it:

1. **Does order matter?** Lists and tuples preserve order and support indexing. Sets do not. Dictionaries preserve *insertion* order (a language guarantee since Python 3.7) but are keyed, not indexed.
2. **Will it change after creation?** Mutable containers (`list`, `dict`, `set`) can be modified in place. Immutable ones (`tuple`, `frozenset`, `str`) cannot — which makes them **hashable** and therefore usable as dictionary keys or set members.
3. **How will you look things up?** Scanning a list for a value is `O(n)`; a dict key lookup or set membership test is `O(1)` on average, because both are backed by hash tables. Converting a list to a set before doing many `in` checks is one of the most common real-world speedups.
4. **Are the elements the same kind of thing?** A list usually holds *homogeneous* items where position is incidental; a tuple usually holds a fixed number of *heterogeneous* fields where position is meaningful — which is why a tuple behaves like a lightweight record.

### Lists — Ordered, Mutable

The default sequence type. Index, slice, and mutate with `append`/`insert`/`pop`. Mixing types is allowed but usually a smell.

A Python list is a **dynamic array of pointers**, not a linked list. The elements live in a contiguous block of references that CPython over-allocates, which is why repeated `append()` is amortised `O(1)`. The whole cost model follows from that layout: indexing and appending are cheap, while `insert(0, x)`, `pop(0)`, and `remove(x)` are `O(n)` because every following pointer has to shift. When you need fast operations at *both* ends, use `collections.deque` (section 26).

Because a list stores references rather than values, it can hold mixed types, and `lst.copy()` or `lst[:]` gives a **shallow** copy — the outer list is new, but the inner objects are still shared. Note also the `sort()` / `sorted()` distinction: `lst.sort()` mutates in place and returns `None` (so `x = lst.sort()` is a classic bug), while `sorted(lst)` leaves the original alone and returns a new list. Both are stable, meaning equal elements keep their relative order — which lets you sort by several keys with successive passes.

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

Fixed-length records. A one-item tuple needs a trailing comma `(42,)`. Tuples can be dict keys because they are hashable (if their contents are too).

A tuple is not merely "a list you can't change" — it signals different *intent*. Lists model collections of like items; tuples model records with a fixed shape where position carries meaning, such as `(x, y)` or `(host, port)`. Immutability then buys three concrete things: the object is hashable so it can key a dict, it is safe to share without defensive copying, and CPython stores it more compactly.

Two details catch people out. First, it is the **comma**, not the parentheses, that creates a tuple — `1, 2` is already a tuple, and a stray trailing comma (`x = 5,`) silently produces a one-element tuple instead of an int. Second, immutability is **shallow**: a tuple guarantees its slots always point at the same objects, but if one of those objects is a list, that list can still be mutated (and the tuple then stops being hashable in practice).

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

Fast membership tests and set algebra. Duplicates are dropped; order is not guaranteed. Use `set()` not `{}` for an empty set.

A set is a hash table that stores only keys, and its two defining properties fall straight out of that: every element must be **hashable** (so no lists or dicts inside a set), and duplicates collapse automatically. Membership testing, insertion, and deletion are all `O(1)` on average versus `O(n)` for a list.

Sets shine whenever a problem is naturally phrased in the language of set theory — "which users are in group A but not group B?", "which tags do these two articles share?", "give me the distinct values". Expressing that with `|`, `&`, `-`, and `^` is clearer *and* dramatically faster than nested loops. The trade-offs are that sets carry no order and no indexing (`s[0]` is a `TypeError`), and that `remove()` raises `KeyError` on a missing element while `discard()` quietly does nothing — pick according to whether absence is an error.

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

An immutable set — hashable, so it can be a dict key or nested inside another set.

```python
fs = frozenset([1, 2, 3])
# fs.add(4)   # ❌ AttributeError — frozensets are immutable
# Can be used as dict keys or set members (hashable)
```

### Dictionaries — Key-Value Pairs

The core mapping type. Keys must be hashable (strings, numbers, tuples). Prefer `.get(key, default)` when a missing key is normal.

The dictionary is the most important data structure in Python, because the language itself is built on it: module namespaces, object attributes (`obj.__dict__`), keyword arguments, and class bodies are all dictionaries under the hood. Learning to reach for a dict instead of parallel lists or a long `if`/`elif` ladder is a major step toward idiomatic Python.

Mechanically, each key is passed through `hash()` to compute a slot in an internal table, so lookup cost does not grow with the number of items — it is `O(1)` on average. This is precisely why keys must be **hashable**, and therefore effectively immutable: if a key's hash changed after insertion, the dict could never find it again. Since Python 3.7 dictionaries also **preserve insertion order** as a guaranteed behaviour, which makes `collections.OrderedDict` rarely necessary.

Three access habits are worth forming: use `d[key]` when a missing key genuinely is a bug, `d.get(key, default)` when absence is expected, and `d.setdefault(key, []).append(x)` (or `collections.defaultdict`) when you are accumulating values per key. Also remember that `.keys()`, `.values()`, and `.items()` return **views**, not lists — they are live windows onto the dict, which is why mutating a dict while iterating over one of them raises `RuntimeError`.

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

# Iteration  (after popitem, only 'name' remains)
for key in person:                     # iterates over keys
    print(key, person[key])
# name Alice

for key, value in person.items():      # key-value pairs
    print(f"{key}: {value}")
# name: Alice

for value in person.values():          # just values
    print(value)
# Alice

# Useful methods — start from a fresh dict
person = {"name": "Alice", "age": 30, "hobbies": ["reading", "chess"]}
person.keys()              # dict_keys(['name', 'age', 'hobbies'])
person.values()            # dict_values(['Alice', 30, ['reading', 'chess']])
person.items()             # dict_items([('name', 'Alice'), ('age', 30), ('hobbies', ['reading', 'chess'])])
person.update({"age": 32, "city": "NYC"})
person                     # {'name': 'Alice', 'age': 32, 'hobbies': ['reading', 'chess'], 'city': 'NYC'}

# Check membership
"name" in person           # True (checks keys)

# Merge dicts (Python 3.9+)
merged = {"a": 1} | {"b": 2}   # {"a": 1, "b": 2}
```

### Nested Data Structures

Lists, dicts, and tuples nest freely (JSON-shaped data). Drill in with chained indexes: `users[0]["name"]`.

```python
students = [
    {"name": "Alice", "grades": [90, 85, 92]},
    {"name": "Bob", "grades": [78, 88, 95]},
]

students[0]["grades"][2]   # 92
```

## 6. Control Flow

Control flow is where Python's whitespace rule becomes concrete: a block belongs to its `if` because it is *indented under* it, and it ends when the indentation returns. Choose 4 spaces, never mix tabs with spaces (Python 3 rejects the mixture outright), and let your editor enforce it.

The other idea running through this section is **truthiness**. A condition need not be a boolean: Python calls `bool()` on whatever you give it, so `if my_list:` reads as "if the list is non-empty". This keeps conditions short, but it is also why you must write `if x is None:` rather than `if not x:` when `0`, `""`, or `[]` are legitimate values distinct from "missing".

### if / elif / else

Conditions are any truthy/falsy value. Only the first matching branch runs. Indentation is the block delimiter.

The branches are tested top to bottom and **the first true one wins** — every remaining branch is skipped, even if it would also be true. That is why the grading ladder below must run from the most restrictive threshold downward; reversing the order would classify everyone as `"C"`. Only one `else` is allowed and it must come last. When a chain grows past three or four branches, that is usually a signal to replace it with a dictionary lookup or a `match` statement.

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

`match` compares a subject against patterns (literals, sequences, mappings, classes). `_` is the wildcard “anything else” case.

This is **not** a `switch` statement. A `switch` compares one value against constants; `match` destructures a value against a *shape*, and when a pattern matches, its variables are bound to the corresponding pieces of the subject — matching and unpacking happen in a single step. That is what makes it so effective on nested JSON-like data and on abstract syntax trees.

The pattern vocabulary is worth learning explicitly:

1. **Literal patterns** — `case "quit":` compares with `==`.
2. **Or-patterns** — `case "quit" | "exit":` matches any of several alternatives.
3. **Capture patterns** — a bare name such as `y` matches anything and *binds* it, which is why `case (0, y)` means "a 2-tuple whose first element is 0; call the second one `y`".
4. **Class patterns** — `case str(cmd)` matches only when the subject is a `str`, then binds it.
5. **Guards** — `if cmd.startswith("open")` adds an arbitrary extra condition that must also hold.
6. **Wildcard** — `case _:` matches anything and binds nothing; it is the default branch.

Cases are tried in order and the first match wins, so specific patterns must precede general ones — writing `case (x, y)` above `case (0, y)` makes the second one unreachable. Beware the capture rule: a bare name always *binds* rather than compares, so `case RED:` does not test against a constant named `RED`; you need a dotted name such as `case Color.RED:` for that.

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

## 7. Loops

Python has no C-style `for (i = 0; i < n; i++)`. Its `for` is a **for-each** loop built on the *iterator protocol*: it calls `iter()` on the object to obtain an iterator, then calls `next()` repeatedly until `StopIteration` is raised, at which point the loop ends. Everything else follows from that one mechanism — you can loop over a file (yielding lines), a dict (yielding keys), a generator (yielding computed values), a database cursor, or your own class, provided it implements `__iter__`. Section 16 covers the protocol itself.

The practical rule of thumb: `for` when you are walking a collection of known extent, `while` when you are repeating until a *condition* changes.

### for Loop

Python's `for` iterates over **any iterable** (lists, strings, ranges, etc.).

Because iteration is protocol-driven, manual indexing is almost always the wrong tool. Four helpers cover nearly every case:

1. **`range(start, stop, step)`** produces integers lazily — it is not a list but an object that computes values on demand, so `range(10**9)` costs essentially nothing in memory.
2. **`enumerate(seq, start=0)`** yields `(index, value)` pairs and replaces the `for i in range(len(seq))` anti-pattern.
3. **`zip(a, b, ...)`** walks several iterables in lockstep and stops at the **shortest**; pass `strict=True` (Python 3.10+) to make a length mismatch an error instead of silent truncation.
4. **Dict iteration** yields *keys* by default — use `.items()` for pairs and `.values()` for values.

One rule to internalise: never add to or delete from a collection while iterating over it. The iterator holds a position into the underlying structure, so mutation causes skipped elements or a `RuntimeError`. Iterate over a copy (`for x in lst[:]`) or build a new collection with a comprehension instead.

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

Use `while` when you don’t know how many times you’ll loop (wait until a flag, drain a queue). Guard against infinite loops.

The condition is re-tested before every iteration, so whatever it depends on must actually change inside the body — and every path through the body must make progress toward termination. When the loop must run at least once before the test (Python has no `do...while`), the idiom is an unconditional `while True:` with a `break` at the point where the exit condition becomes known.

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

### Loop Control

`break` exits the nearest loop; `continue` skips to the next iteration; `else` on a loop runs only if it **didn’t** `break` — useful for “search failed” logic.

Four keywords shape loop execution, and the third is unique to Python:

1. **`break`** abandons the loop immediately, skipping all remaining iterations.
2. **`continue`** abandons only the current iteration and jumps to the next — useful as an early-exit guard that keeps the main body un-indented.
3. **`else` on a loop** runs only if the loop finished *without* hitting `break`. Read it as "no break", not as "otherwise". It is the natural way to express search-then-report-failure without a `found = False` flag.
4. **`pass`** is a no-op that satisfies the parser where a block is syntactically required but you have nothing to say yet.

One important limitation: `break` and `continue` affect only the **innermost** enclosing loop. Python has no labelled break, so to escape nested loops you either extract them into a function and `return`, or track a flag.

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

## 8. Functions

A function in Python is a **first-class object**. `def greet(): ...` does not merely declare a routine — it creates a function object at runtime and binds it to the name `greet`, exactly as `x = 5` binds an integer. You can therefore store functions in lists, pass them as arguments, return them from other functions, and attach attributes to them. Decorators, callbacks, and key functions such as `sorted(..., key=len)` all rest on this fact.

The other idea to get right is Python's argument passing model, which is neither "by value" nor "by reference" but **call by object reference** (sometimes called call by sharing). The function receives the *same objects* the caller holds. Rebinding a parameter inside the function (`x = 99`) affects only the local name; *mutating* the object it points at (`lst.append(99)`) is visible to the caller. Understanding this single rule explains both the mutable-default gotcha below and most "why did my list change?" bugs.

### Basic Functions

`def` creates a function object. Call it with `()`; without parentheses you just pass the function around.

Every function returns something: if you never write `return`, Python returns `None` implicitly. `return` also exits immediately, which makes early returns a clean way to handle edge cases before the main logic.

```python
def greet(name):
    """Greet a person by name."""   # docstring
    return f"Hello, {name}!"

message = greet("Alice")
print(message)   # Hello, Alice!
```

### Parameters & Arguments

Positional args follow definition order; keyword args (`name=value`) can be in any order. Defaults must come after required parameters.

Keyword arguments are not just a convenience — they are documentation at the call site. `create_user("Alice", True, False)` is unreadable; `create_user("Alice", is_admin=True, send_email=False)` is self-explanatory. You can *force* that clarity: a bare `*` in the signature makes every parameter after it keyword-only (`def f(a, *, verbose=False)`), and a `/` makes everything before it positional-only.

The **mutable default argument** is the most famous Python gotcha, and the "names and objects" model explains it precisely. Default values are evaluated **once**, when the `def` statement runs — not on each call. So `lst=[]` creates a single list that is stored on the function object (visible as `func.__defaults__`) and reused by every call that omits the argument. Each `append` therefore accumulates into that one shared list. The fix is the `None` sentinel: default to `None`, then create a fresh list inside the body, where the code runs on every call.

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
def append_to_bad(value, lst=[]):   # ❌ BAD — shared across calls!
    lst.append(value)
    return lst

append_to_bad(1)    # [1]
append_to_bad(2)    # [1, 2]  leftover from the previous call!

# ✅ FIX: Use None as default
def append_to(value, lst=None):
    if lst is None:
        lst = []
    lst.append(value)
    return lst

append_to(1)        # [1]
append_to(2)        # [2]  fresh list each time
```

### Return Values

`return` exits immediately. No `return` (or `return` with nothing) yields `None`. Comma-separated returns pack a tuple you can unpack at the call site.

Python has no true multiple-return-value mechanism — `return q, r` builds a single tuple, and `q, r = divide(17, 5)` unpacks it again. That is why the number of names on the left must match the tuple's length. For more than two or three values, returning a `NamedTuple` or a dataclass (section 27) keeps call sites readable, since `result.remainder` beats `result[1]`.

A function that both mutates state and returns a value is usually a design smell; Python's own library follows the convention that in-place operations return `None` (`lst.sort()`, `lst.append()`), which is why chaining them silently yields `None`.

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

The first string in a function/class/module is its docstring — `help(fn)` and IDEs read it. Describe **what** the function does, not how.

A docstring is not a comment: it is stored on the object as `__doc__`, which means it is available at runtime to `help()`, to IDE tooltips, to documentation generators such as Sphinx, and to the `doctest` module — which can actually *execute* the `>>>` examples inside a docstring as tests. Describe the contract (arguments, return value, exceptions raised) rather than the implementation, because the implementation is already visible right below and the contract is what callers depend on.

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

## 9. Scope & Closures

A **scope** is the region of code in which a name is visible, and Python decides which scope a name belongs to at *compile* time, not at runtime. That detail explains one of the language's most confusing errors: if a function assigns to a name anywhere in its body, that name is treated as local for the *whole* function — so reading it before the assignment raises `UnboundLocalError` rather than falling back to the global value.

Scopes in Python are created by **functions, modules, and comprehensions** — but *not* by `if`, `for`, or `while` blocks. A variable assigned inside a `for` loop is still visible after the loop ends, which differs sharply from C, Java, and JavaScript's `let`.

### LEGB Rule

Python resolves names in this order: **L**ocal → **E**nclosing → **G**lobal → **B**uilt-in.

The search stops at the first scope that defines the name, and it only ever looks *outward*, never inward. **Local** is the current function body; **Enclosing** covers any outer functions when definitions are nested; **Global** means module level (not program-wide — each module has its own); **Built-in** is the namespace holding `len`, `print`, `range`, and friends. This last layer is why shadowing a builtin (`list = [1, 2]`) is legal but dangerous: your local name wins, and calling `list(...)` later fails with `TypeError`.

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

`global` writes to a module-level name; `nonlocal` writes to an enclosing function’s name. Prefer returning values over mutating outer scope.

These keywords exist because *reading* an outer name works automatically but *assigning* to one does not — assignment always creates a local binding unless you say otherwise. `global x` tells the compiler that every assignment to `x` in this function targets the module namespace; `nonlocal x` targets the nearest enclosing *function* scope (and fails at compile time if no such binding exists).

Both should be rare. A function that reaches out and rewrites state elsewhere is hard to test and hard to reason about, and in threaded code it invites race conditions. Prefer returning a new value, or encapsulating the mutable state in a class or a closure.

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

The important part is *how* it remembers. When `make_multiplier` returns, its local frame is normally destroyed — but because `multiply` still refers to `factor`, Python keeps that binding alive in a **cell object**, reachable through `multiply.__closure__`. The inner function therefore carries a piece of private, persistent state with it, and each call to the factory produces an independent copy: `double` and `triple` do not share a `factor`.

That makes a closure the lightweight alternative to a class with a single method — the same idea behind decorators (section 17), callbacks, and function factories. The classic trap is **late binding**: a closure captures the *variable*, not its value at capture time, so `[lambda: i for i in range(3)]` yields three functions that all return `2`. Bind the value explicitly with a default argument (`lambda i=i: i`) when you need the value frozen.

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

## 10. List Comprehensions & Generator Expressions

A comprehension is a **declarative** way to build a collection: instead of describing the loop mechanics (create an empty list, iterate, test, append), you describe the result — "the squares of the even numbers in this range". Read `[f(x) for x in xs if cond(x)]` in the same order as the mathematical set-builder notation it was modelled on: *the set of f(x), for each x in xs, where cond(x) holds*.

Beyond readability there are two concrete benefits. Comprehensions are **faster** than the equivalent `for` loop with `.append()`, because the append happens in optimised C rather than through repeated attribute lookup and method calls. And they get their **own scope** (since Python 3), so the loop variable does not leak into the surrounding function.

The cost is that comprehensions compress logic. The moment you need more than one condition plus a transformation — or any statement at all, since only *expressions* are allowed — an explicit loop is the more maintainable choice. Nesting more than two `for` clauses is almost always a mistake.

### List Comprehensions

Syntax: `[expr for item in iterable if condition]`. Put the `if/else` **in the expression** (`a if cond else b`), not after `for`.

That placement rule confuses everyone once, and the reason is that the two `if`s are different constructs. A trailing `if` is a **filter** — it decides whether an item is included at all. A leading `a if cond else b` is a **ternary expression** — it decides *what value* to produce for an item that is already included. Filters can therefore never have an `else`, and ternaries must always have one.

For nested comprehensions, the `for` clauses read **left to right in the same order you would write nested loops**: `[num for row in matrix for num in row]` corresponds to `for row in matrix:` then `for num in row:`.

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

`{k: v for ...}` builds a dict; `{x for ...}` builds a set. Same filter/`if` rules as list comprehensions.

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

Swapping `[]` for `()` changes the result from a *collection* into a *recipe*. Nothing is computed when the generator expression is created; each value is produced on demand as you iterate, and then discarded. Memory use is therefore `O(1)` instead of `O(n)`, and work stops early if you stop consuming — which is what lets a generator represent an infinite sequence.

Use a generator expression whenever the results are consumed exactly once and immediately, most commonly as the sole argument to a reducing function: `sum(x**2 for x in data)` needs no enclosing parentheses and never materialises the list. Use a list comprehension instead when you need to index the result, iterate more than once, or take its `len()` — a generator is exhausted after a single pass and quietly yields nothing thereafter.

```python
# Use () instead of []
gen = (x ** 2 for x in range(1_000_000))  # no list in memory!

# Consume one at a time
next(gen)    # 0
next(gen)    # 1

# Often used directly in functions
total = sum(x ** 2 for x in range(1000))
```

## 11. Object-Oriented Programming (OOP)

A class is a **template that bundles state with the behaviour that operates on it**. The motivation is not the syntax but the containment: instead of passing a dictionary of fields into a dozen loose functions and hoping every caller maintains the invariants, you put the data and its rules behind one interface.

Four ideas underpin the model, and Python's take on each is distinctive:

1. **Encapsulation** — grouping data with its methods. Python has no `private` keyword; it uses convention (`_name` means "internal, don't touch") and offers `@property` (below) when you later need to add validation without changing the public interface. The double-underscore prefix triggers *name mangling*, which prevents accidental clashes in subclasses rather than providing real privacy.
2. **Inheritance** — deriving a specialised class from a general one, reusing and selectively overriding behaviour.
3. **Polymorphism** — different classes responding to the same call in their own way. Python takes this further with **duck typing**: `speak()` works on anything that defines `speak()`, whether or not it shares an ancestor. Interfaces are structural, not declared.
4. **Abstraction** — exposing a stable interface while hiding the implementation, formalised by abstract base classes.

The mechanical detail that makes it all work is `self`. Python does not hide the instance: calling `buddy.bark()` is literally `Dog.bark(buddy)`, so every method takes the instance as its explicit first parameter. Attribute lookup then searches the instance's own `__dict__` first and falls back to the class (and its ancestors), which is exactly why class attributes are shared across all instances while instance attributes shadow them per object.

### Classes & Objects

`__init__` constructs; `self` is the instance. Class attributes are shared; instance attributes are per object.

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

Write shared behavior once on a parent. Subclasses override methods; `isinstance` still sees the parent type.

Inheritance models an **"is-a" relationship**: a `Dog` *is an* `Animal`, so anywhere the program expects an `Animal` a `Dog` will do. That substitutability is the real payoff — `for a in animals: print(a.speak())` works without knowing or caring which concrete class each element is, and adding a new `Bird` subclass requires no change to that loop.

When a subclass defines a method with the same name as its parent, it **overrides** it: attribute lookup walks the class hierarchy and stops at the first match. The parent's `speak()` here raises `NotImplementedError`, a common way to declare "this is a hook subclasses must fill in" — section 11's abstract base classes make the same requirement enforceable at instantiation time rather than at call time.

Inheritance is easy to overuse. If the relationship is really "has-a" rather than "is-a", prefer **composition** — hold the other object as an attribute and delegate to it. Deep hierarchies couple classes together and make behaviour hard to trace.

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

`super()` calls the next class in the MRO — not “the parent by name”. That keeps multiple inheritance cooperative.

The distinction is easy to miss with a single parent, where `super().__init__(...)` and `Animal.__init__(self, ...)` do the same thing. They diverge the moment multiple inheritance is involved: hard-coding the parent name pins the call to one specific class, which breaks the chain and can execute a shared ancestor twice. `super()` instead looks up *the class that follows the current one in the MRO of the actual instance's type* — a value that depends on the object at runtime, not on where the code was written.

The practical rule for `__init__`: call `super().__init__(...)` **before** using inherited attributes, so the parent's state exists by the time you rely on it.

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
print(dog.name, dog.sound, dog.breed)   # Buddy Woof Golden Retriever
```

### Multiple Inheritance & MRO

Python supports **multiple inheritance** — a class can inherit from more than one parent.

Most languages forbid this because it raises an obvious question: if two parents define the same method, which one runs? Python answers it with a fixed, computable ordering rather than a rule of thumb. Every class carries a **Method Resolution Order** — a flat list of classes to search, in order, for any attribute — and `Duck.move()` resolves to `Flyer.move` simply because `Flyer` appears earlier in `Duck.__mro__`.

In practice, multiple inheritance works best when the extra parents are **mixins**: small, stateless classes that add one orthogonal capability (`JSONSerializableMixin`, `LoggingMixin`) and are not meant to be instantiated on their own. Inheriting from two full-featured, stateful classes is where the trouble starts.

```python
class Flyer:
    def move(self):
        return "Flying"

class Swimmer:
    def move(self):
        return "Swimming"

class Duck(Flyer, Swimmer):    # inherits from both
    pass

Duck().move()   # "Flying" — Flyer is listed first, so it wins
```

### The Diamond Problem

Occurs when a class inherits from two classes that share a common ancestor.

The name comes from the shape of the graph: `D` inherits from `B` and `C`, both of which inherit from `A`. Two questions have no obvious answer. Which `greet()` does `D` get — `B`'s or `C`'s? And when `D.__init__` chains upward, does `A.__init__` run once or twice? Naive depth-first resolution would reach `A` through `B` before ever considering `C`, which is both surprising and wrong: a more specific class would be skipped in favour of a more general one.

Python's answer is **C3 linearization**, an algorithm that flattens the graph into a single ordering guaranteeing three properties: a class always precedes its own parents, the order in which parents were listed is preserved, and the result is consistent across the whole hierarchy. For `class D(B, C)` that yields `D → B → C → A → object` — note that `A` comes *after* `C`, so the shared ancestor is visited exactly once, at the end. If no such consistent ordering exists, Python refuses to create the class and raises `TypeError` at definition time rather than misbehaving later.

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

class D(B, C):   # 💎 Diamond: both parents share A
    pass

#       A
#      / \
#     B   C
#      \ /
#       D
```

**Python's fix: MRO (Method Resolution Order)** — uses **C3 linearization** to create a deterministic, left-to-right, depth-first order that respects the hierarchy.

```python
d = D()
print(d.greet())   # "Hello from B" — B comes before C in MRO
print(D.__mro__)   # (D, B, C, A, object)
```

### Cooperative super() with **kwargs

When using multiple inheritance, use `super()` with `**kwargs` so every class in the MRO chain gets its arguments correctly — no class is called twice.

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
# ✅ All __init__ methods run exactly once, no duplicates

print(d.name, d.breed, d.owner)   # Rex Lab Alice
print(DomesticDog.__mro__)
# (DomesticDog, Dog, Pet, Animal, object)
```

> **Key rules:**
> - MRO goes **left-to-right**, then **up** — inspect with `ClassName.__mro__` or `ClassName.mro()`
> - Always use `super()` (not parent class name) to cooperate with MRO
> - Pass `**kwargs` through `__init__` chains to handle varying constructor signatures
> - Python raises `TypeError` if it can't compute a consistent MRO (e.g., conflicting orderings)

### Properties (Getters & Setters)

`@property` exposes a method as an attribute. Add `.setter` to validate writes; omit it for a read-only computed field.

Properties solve a problem that other languages solve with mandatory boilerplate. In Java you write `getX()`/`setX()` from the start, because retrofitting them later would break every caller. Python lets you start with a plain public attribute and *upgrade it in place* the day you need validation, logging, laziness, or a computed value — `c.radius` keeps working unchanged while the implementation quietly becomes a method call. This is why "just use a public attribute until you need more" is idiomatic Python rather than sloppiness.

Mechanically, `@property` installs a **descriptor** on the class: an object defining `__get__`/`__set__` that the attribute lookup machinery consults before falling back to the instance dictionary. Two consequences follow. The backing store must have a different name (the `_radius` convention) or the setter would recurse forever. And a read-only property like `area` is recomputed on every access — use `functools.cached_property` when the computation is expensive and the inputs do not change.

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

`@classmethod` receives the class (`cls`) — use it for alternate constructors. `@staticmethod` is a namespaced function with no `self`/`cls`.

The three method kinds differ purely in what implicit first argument they receive: an instance method gets the object, a class method gets the class, and a static method gets nothing.

That makes `@classmethod` the natural home for **alternative constructors**, since `cls(...)` builds an instance of whatever class the call was made on. If `PremiumDate` subclasses `Date`, then `PremiumDate.from_string(...)` returns a `PremiumDate` — which would not happen had the method hard-coded `Date(...)`. The same pattern appears throughout the standard library: `dict.fromkeys()`, `datetime.fromtimestamp()`, `Path.cwd()`.

`@staticmethod` is for functions that are logically part of the class but need none of its state. Their real value is namespacing and discoverability; if a static method never grows to reference the class, a plain module-level function is often the simpler choice.

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

An ABC marks methods that subclasses **must** implement. You cannot instantiate the ABC itself — it is an interface plus shared code.

The key benefit is **when** the error arrives. Raising `NotImplementedError` from a stub reports the mistake only if and when that method is finally called — possibly in production. An ABC moves the check to instantiation time: the moment anyone tries to create an incomplete subclass, Python raises `TypeError` and names the missing methods. That converts a latent runtime bug into an immediate, obvious failure.

An ABC is more than an interface, though: unlike a pure interface it may also contain **concrete** methods and shared state, letting you define a template where the base class implements the algorithm and abstract methods supply the varying steps. Combine `@abstractmethod` with `@property` or `@classmethod` (abstract decorator innermost) to require those too.

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

## 12. Magic / Dunder Methods

Dunder ("double underscore") methods are the hooks of Python's **data model** — the protocol by which the interpreter delegates built-in syntax to your objects. Nearly every operator and built-in function is a thin wrapper over one: `len(x)` calls `x.__len__()`, `x + y` calls `x.__add__(y)`, `x[0]` calls `x.__getitem__(0)`, `for i in x` calls `x.__iter__()`, `with x:` calls `x.__enter__()`.

This is what people mean by "Pythonic" design. Rather than inventing method names like `vector.add(other)` or `collection.getSize()`, you implement the standard protocol and your class immediately works with the entire language and standard library — `sorted()`, `sum()`, `in`, unpacking, f-strings, and `with` all cooperate for free. You never call these methods directly; you define them and let the syntax invoke them.

A few rules keep implementations correct:

1. **`__repr__` vs `__str__`** — `__repr__` is for developers and should ideally be unambiguous enough to recreate the object (`Vector(1, 2)`); `__str__` is for end users. If you write only one, write `__repr__`, because `__str__` falls back to it (but not vice versa) and it is what the REPL, debuggers, and container printing use.
2. **`__eq__` and `__hash__` travel together.** Defining `__eq__` sets `__hash__` to `None`, making instances unhashable — sensible, since two objects that compare equal must hash equal. Define `__hash__` explicitly (over an immutable tuple of fields) if the object should live in sets or dict keys, and only for objects you will not mutate.
3. **Return `NotImplemented`, not `False`,** from arithmetic and comparison methods when the other operand's type is unsupported. That signals Python to try the reflected operation (`__radd__`) before giving up with a `TypeError`.
4. **`__bool__` falls back to `__len__`.** If neither exists, every instance is truthy — which is why an empty custom container can silently behave as `True`.

Defining `functools.total_ordering` on top of `__eq__` and `__lt__` fills in the remaining comparison operators automatically.

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

1. `__init__` — triggered by `ClassName()` — Constructor
2. `__str__` — triggered by `str(obj)`, `print()` — Human-readable string
3. `__repr__` — triggered by `repr(obj)`, REPL — Developer string
4. `__len__` — triggered by `len(obj)` — Length
5. `__getitem__` — triggered by `obj[key]` — Index/key access
6. `__setitem__` — triggered by `obj[key] = val` — Index/key assignment
7. `__contains__` — triggered by `x in obj` — Membership test
8. `__iter__` — triggered by `for x in obj` — Iteration
9. `__next__` — triggered by `next(obj)` — Next value in iteration
10. `__call__` — triggered by `obj()` — Make instance callable
11. `__enter__` / `__exit__` — triggered by `with obj:` — Context manager
12. `__eq__`, `__lt__`, etc. — triggered by `==`, `<`, etc. — Comparisons
13. `__add__`, `__mul__`, etc. — triggered by `+`, `*`, etc. — Arithmetic
14. `__hash__` — triggered by `hash(obj)` — Hashing (for sets/dicts)

## 13. Modules & Packages

A **module** is simply a `.py` file, and a **package** is a directory of modules. Both exist to give names a home: every module has its own global namespace, so `utils.parse` and `network.parse` never collide, and the import system is what lets you compose a program out of many such namespaces.

The mechanics are worth knowing because they explain most import errors. When you write `import utils`, Python searches `sys.path` in order — the script's own directory first, then `PYTHONPATH`, then the installed site-packages — and takes the **first** match. This is why naming your file `random.py` or `json.py` breaks the standard library import of the same name. Once found, the module is **executed top to bottom exactly once**, and the resulting module object is cached in `sys.modules`; every later `import` of the same name reuses that cached object rather than re-running the file. Consequently, any side effect at module level (opening a connection, printing, reading a file) happens at import time, which is a strong argument for keeping module bodies to definitions and constants.

### Importing

`import pkg` vs `from pkg import name` vs aliases (`as`). Import modules at the top; avoid `from module import *`.

The two forms differ in what lands in your namespace. `import math` binds one name, `math`, and every use is explicitly qualified — which keeps the origin of `math.sqrt` obvious and makes circular imports far more survivable. `from math import sqrt` binds `sqrt` directly, which is shorter but hides where it came from and can silently shadow a local name.

`from module import *` is the form to avoid: it imports an unknown set of names decided by the module (or by its `__all__`), so it can overwrite your own definitions without warning and makes it impossible for a reader — or a linter — to tell where any given name originated.

```python
# Import entire module
import math
print(math.sqrt(16))     # 4.0

# Import specific items
from math import sqrt, pi
print(sqrt(16))           # 4.0
print(pi)                 # 3.141592653589793

# Import with alias
import numpy as np
from collections import defaultdict as dd

# Import everything (avoid in production code)
from math import *
```

### Creating Your Own Module

Any `.py` file on `sys.path` (including the current directory) can be imported by its filename without `.py`.

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

`__name__` is `"__main__"` only when the file is the entry point. Put script behavior under that `if` so imports stay side-effect free.

Every module gets a `__name__` variable. When Python imports a file it sets `__name__` to the module's own name (`"utils"`); when Python *runs* a file directly it sets `__name__` to `"__main__"` instead. The guard therefore distinguishes "someone is using me as a library" from "someone is running me as a program", letting one file serve both roles.

Without it, importing a module would execute its demo code, its CLI parsing, or its server startup as a side effect — and it would also break `multiprocessing` on Windows and macOS, where child processes re-import the main module and would otherwise spawn processes recursively.

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

Makes a directory a package and runs on `import package`. Keep it light — re-export public names, don’t do heavy work.

Its real job is to define the package's **public interface**. Re-exporting from submodules (`from .math_ops import multiply`) lets users write `from helpers import multiply` without knowing or depending on your internal file layout — so you can reorganise the modules later without breaking callers. Pair it with `__all__ = ["multiply", "clean"]` to state explicitly which names are public.

Because the file executes on first import of the package, anything slow or side-effecting in it is paid by every user of any submodule. Since Python 3.3, a directory without `__init__.py` still imports as an implicit *namespace package*, but including the file remains the clearer default.

```python
# helpers/__init__.py
# Controls what's available when you "import helpers"
from .math_ops import multiply
from .string_ops import clean

# Now you can do: from helpers import multiply, clean
```

## 14. Error Handling

An exception is a **control-flow mechanism**, not just an error report. When one is raised, Python abandons the current expression and unwinds the call stack, frame by frame, until it finds a matching `except` — or reaches the top and terminates the program with a traceback. This is why a deeply nested failure can be handled in one place far up the stack, instead of every intermediate function checking and forwarding return codes.

Python leans on exceptions far more heavily than most languages, and the guiding philosophy is **EAFP** — *Easier to Ask Forgiveness than Permission*. Rather than testing preconditions first ("look before you leap"), you attempt the operation and handle the failure. `d[key]` inside a `try` is preferred to `if key in d`, because the check-then-act version does the lookup twice and, in concurrent code, leaves a window in which the state can change between the check and the use.

The discipline that makes this work is **catching narrowly**. `except Exception:` swallows typos, logic bugs, and genuine failures alike, turning a loud crash into silent wrong behaviour. Catch the specific exceptions you know how to recover from, and let everything else propagate — a traceback is a feature. Never write a bare `except:`, which also captures `KeyboardInterrupt` and `SystemExit` and prevents you from stopping your own program.

### try / except / else / finally

`except` handles failure; `else` runs only if nothing was raised; `finally` always runs (close files, release locks).

The four clauses divide responsibility cleanly. Keep the `try` block as **small as possible** — ideally the single risky call — so you do not accidentally catch an exception raised by unrelated code that happens to sit nearby. Put the follow-up work that depends on success in `else`, which runs only when no exception occurred and is not itself protected by the handlers. Put cleanup in `finally`, which executes on every path out of the block: normal completion, a handled exception, an unhandled one, and even a `return` or `break` inside the `try`.

`except` clauses are tested in order and the first matching one wins, and matching respects inheritance — so `except Exception` catches almost everything and must come last. Bind the exception object with `as e` when you need its message or attributes; the name is deleted when the block ends, so copy anything you need to keep.

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

These are arranged in a hierarchy rooted at `BaseException`, and the shape of that tree is what makes targeted catching possible. Almost everything you want to catch lives under `Exception`; `KeyboardInterrupt` and `SystemExit` deliberately sit outside it so that `except Exception:` cannot trap them. Some useful relationships: `KeyError` and `IndexError` both derive from `LookupError`, so one handler can cover both; `FileNotFoundError` and `PermissionError` derive from `OSError`; and `ValueError` versus `TypeError` encodes a real distinction — the *type* was right but the *value* was not, versus the type itself was wrong.

1. `ValueError` — Wrong value (e.g., `int("abc")`)
2. `TypeError` — Wrong type (e.g., `"a" + 1`)
3. `KeyError` — Missing dict key
4. `IndexError` — List index out of range
5. `AttributeError` — Missing attribute/method
6. `FileNotFoundError` — File doesn't exist
7. `ZeroDivisionError` — Division by zero
8. `ImportError` — Failed import
9. `StopIteration` — Iterator exhausted
10. `RuntimeError` — Generic runtime error
11. `NameError` — Undefined variable

### Raising Exceptions

`raise ValueError("...")` signals a problem to the caller. Bare `raise` inside `except` re-raises the original with its traceback.

Raise as early as possible and be specific about which class you use, since the class is the part callers actually branch on — the message is for humans. A bare `raise` is the correct way to log-and-propagate, because `raise e` would reset the traceback to the current line and hide where the problem really started.

When you translate a low-level failure into a domain-level one, use `raise MyError(...) from err`. That sets `__cause__` and produces a chained traceback ("The above exception was the direct cause of…"), preserving the original diagnosis instead of discarding it. Use `from None` when the underlying cause is genuinely noise.

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("Age must be an integer")
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age

# Re-raise an exception
import logging

def risky_operation():
    raise RuntimeError("disk full")

try:
    risky_operation()
except Exception:
    logging.error("Something went wrong")
    raise   # re-raises the original exception
```

### Custom Exceptions

Subclass `Exception` for domain errors (`InsufficientFundsError`) so callers can catch **your** failure without swallowing unrelated bugs.

A custom exception is not just a renamed error — it is part of your API. The class name gives callers something precise to catch, and any attributes you attach (`e.balance`, `e.amount`) give them structured data to act on rather than a string they would have to parse. Contrast that with raising a bare `ValueError`: the caller cannot distinguish your business rule from a malformed `int()` conversion happening somewhere else in the same `try` block.

In a larger codebase, give each package a single base exception (`class PaymentError(Exception)`) and derive the specific ones from it. Callers can then catch broadly or narrowly as they prefer, and you can add new error types later without breaking existing handlers.

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

## 15. File I/O

`open()` returns a **file object**, which is best understood as a cursor over a stream of data. It holds a position that advances as you read, so calling `f.read()` twice returns the whole file and then an empty string — a common source of confusion. The operating system limits how many files a process may hold open, and buffered writes are not guaranteed to reach disk until the file is closed, which is why closing reliably matters.

That is exactly what `with open(...) as f:` provides. It is a **context manager** (section 18) whose exit step closes the file on every path out of the block, including exceptions and early `return`. Manual `f.close()` is skipped whenever an exception fires between open and close, so `with` should be treated as the only correct form.

The other decision at every `open()` is **text versus binary**. Text mode decodes bytes into `str` using an encoding and normalises line endings; binary mode gives you raw `bytes`. Since the default encoding is platform-dependent, always pass `encoding="utf-8"` explicitly for text files, and use `"rb"`/`"wb"` for images, archives, and anything that is not text.

### Reading Files

`read()` is the whole file; iterate the file object line by line for large files. Default mode is text (`"r"`).

The three approaches differ in memory profile. `f.read()` and `f.readlines()` both load the entire file into memory — fine for a config file, fatal for a multi-gigabyte log. Iterating the file object directly (`for line in f:`) is lazy: the file object is its own iterator, yielding one buffered line at a time, so memory use stays constant regardless of file size. Note that each line retains its trailing `\n`, hence the customary `.strip()`.

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

`"w"` truncates; `"a"` appends. `write()` does not add a newline unless you include `\n`.

`"w"` truncates the file to zero length **the moment it is opened**, before you write anything — so an exception later still leaves you with an empty file. When overwriting data you care about, write to a temporary file and rename it over the original, since rename is atomic on most filesystems. Use `"x"` when the file must not already exist and you want an error rather than silent destruction.

Unlike `print()`, `write()` adds nothing: no newline, no separator, and no `str()` conversion — passing a non-string raises `TypeError`. `writelines()` is likewise a misnomer; it writes an iterable of strings back to back without inserting newlines.

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

1. `r` — Read (default)
2. `w` — Write (creates/overwrites)
3. `a` — Append
4. `x` — Exclusive creation (fails if exists)
5. `b` — Binary mode (e.g., `rb`, `wb`)
6. `+` — Read and write (e.g., `r+`)

### Working with JSON

`json.dump`/`load` talk to files; `dumps`/`loads` talk to strings. JSON keys are strings; Python tuples become lists.

The `s` in `dumps`/`loads` stands for *string* — that is the only difference between the pairs. JSON is the lingua franca of web APIs and config files because it is language-independent, but that independence means the mapping is **lossy in one direction**: tuples come back as lists, non-string dict keys are coerced to strings, and `set`, `datetime`, `Decimal`, and custom classes are not serialisable at all without a `default=` hook or a `cls=` encoder. Round-tripping is therefore not guaranteed to give you the same objects you started with.

Two practical notes: pass `indent=2` for files a human will read and omit it for network payloads, and be aware that `json.load` parses the whole document into memory at once, so very large files call for a streaming parser instead.

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

`csv.reader`/`writer` handle quoting and commas. `DictReader`/`DictWriter` map rows to dicts using the header row.

CSV looks trivial enough to parse with `line.split(",")`, and that is precisely the trap: real files contain commas inside quoted fields, embedded newlines, and doubled quotes as escapes. The `csv` module implements the full dialect rules, so use it even for "simple" data.

Two details matter in practice. Always pass `newline=""` to `open()` when reading or writing CSV — the module handles line endings itself, and omitting this produces blank rows on Windows. And remember that CSV has **no type system**: every value comes back as a string, so `"30"` must be converted explicitly. `DictReader` is usually the better choice for real data, since `row["Age"]` survives a column being reordered while `row[1]` does not.

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

`Path` objects join with `/` and work on Windows and Unix. Prefer `Path.read_text()` / `write_text()` over manual `open` for simple cases.

The older `os.path` module treats a path as a **string** and provides a pile of loose functions to manipulate it (`os.path.join`, `os.path.dirname`, `os.path.splitext`). `pathlib` makes the path an **object** that knows how to operate on itself, so those functions become properties and methods: `p.parent`, `p.stem`, `p.suffix`, `p.exists()`, `p.read_text()`.

Overloading `/` for joining is not merely cosmetic — it removes the whole class of separator bugs, because `Path` renders the correct separator for the host platform on output while accepting either on input. The objects also compare and hash by path, so they work directly as dict keys and set members, and every standard-library function that accepts a filename accepts a `Path` (they implement `os.PathLike`). For pattern matching, `glob("*.py")` searches one directory while `rglob("*.py")` (equivalently `glob("**/*.py")`) recurses.

```python
from pathlib import Path

# Create path objects
p = Path("data") / "subfolder" / "file.txt"   # cross-platform
p = Path.home() / "Documents"
p = Path.cwd()                                 # current directory

# Check existence
p = Path("data") / "subfolder" / "file.txt"
p.exists()      # False until that path is created
p.is_file()     # False
p.is_dir()      # False

# Read/write shortcuts
Path("data.txt").write_text("Hello!")
content = Path("data.txt").read_text()
content         # 'Hello!'

# File info
p.name          # 'file.txt'
p.stem          # 'file'
p.suffix        # '.txt'
p.parent        # PosixPath('data/subfolder')

# List directory
for item in Path(".").iterdir():
    print(item)

# Glob patterns
for py_file in Path(".").glob("**/*.py"):   # recursive
    print(py_file)

# Create directories
Path("new/nested/dir").mkdir(parents=True, exist_ok=True)
```

## 16. Iterators & Generators

This section explains the machinery that every `for` loop in Python quietly relies on. Two roles are involved, and keeping them apart clears up most confusion:

1. An **iterable** is anything that can produce an iterator — it implements `__iter__`. Lists, strings, dicts, files, and ranges are iterables, and they can be traversed repeatedly because each `for` loop asks for a fresh iterator.
2. An **iterator** is the cursor doing the walking — it implements `__next__` (and returns itself from `__iter__`). It is **single-use and stateful**: once it raises `StopIteration`, it stays exhausted forever.

That distinction explains behaviour that otherwise looks arbitrary: you can loop over a list twice but a generator only once, and `zip`, `map`, and `enumerate` return iterators, so consuming them once leaves them empty.

The payoff of the protocol is **laziness**. An iterator computes each value on demand rather than materialising the whole sequence, which means constant memory regardless of length, the ability to start producing results before all input is available, support for genuinely infinite sequences, and the option to stop early without paying for the rest.

### Iterators

Any object with `__iter__()` and `__next__()` methods.

Writing one by hand shows the contract explicitly: `__iter__` returns the object that will do the iterating, and `__next__` either returns the next value or raises `StopIteration` to signal the end. A `for` loop is essentially sugar for calling `iter()` once and then `next()` in a `try` block until that exception fires — and because the exception is part of the protocol rather than an error, it is caught silently.

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

A single `yield` anywhere in a function body changes what `def` produces. Calling the function no longer runs it — it returns a **generator object** and executes nothing at all. The body starts running only on the first `next()`, proceeds to the first `yield`, hands back that value, and then *freezes*: local variables, the instruction pointer, and even the position inside loops and `try` blocks are preserved in the frame. The next `next()` resumes exactly where it left off. When the function finally returns, `StopIteration` is raised automatically.

That suspend-and-resume ability is why generators can express infinite sequences such as `fibonacci()`: the `while True:` loop never completes, but it also never runs longer than the consumer asks for. It is also why a generator replaces the whole `Countdown` class above with three lines — Python writes the `__iter__`/`__next__`/`StopIteration` boilerplate for you.

Two caveats. A generator is exhausted after one pass, so store the results in a list if you need them twice. And because a paused generator holds an open frame, any `with` block inside it stays open until the generator is fully consumed or closed.

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

`yield from iterable` delegates to another iterable/generator — flattening nested yields without a manual loop.

It replaces `for item in sub: yield item`, but it is more than shorthand: `yield from` establishes a transparent **two-way channel** between the caller and the sub-generator, forwarding values out and forwarding `send()`, `throw()`, and `close()` back in, and it makes the sub-generator's `return` value available to the delegating generator. That is what allows clean recursive generators like the `flatten` example, where each level delegates to the next without the intermediate levels having to re-yield anything manually.

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

Composability is the point that is easiest to miss and most valuable in practice. Because each generator both consumes an iterable and produces one, they snap together like Unix pipes: `read_large_file` → `filter_errors` → the final `for` loop. No intermediate list is ever created, so a 50 GB log file is processed in constant memory, and nothing is read at all until the last loop starts pulling. Each stage stays small enough to test on its own, and reordering or inserting a stage is a one-line change.

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

## 17. Decorators

A decorator is a **function that takes a function and returns a replacement for it**. It works only because functions are first-class objects (section 8): you can accept one as an argument, define a new one that closes over it, and return that instead.

The `@` syntax is pure sugar. This:

```python
@timer
def slow_function(): ...
```

means exactly this:

```python
def slow_function(): ...
slow_function = timer(slow_function)
```

The name `slow_function` now refers to the wrapper, which closes over the original and can run code before it, after it, instead of it, or around it in a `try`/`finally`.

What decorators buy you is separation of **cross-cutting concerns** — timing, caching, retries, logging, authentication, input validation — from the business logic they surround. Those concerns would otherwise be copy-pasted into every function that needs them, which is both noisy and easy to get subtly wrong in one place. You already meet decorators as consumers: `@property`, `@staticmethod`, `@classmethod`, `@functools.lru_cache`, `@dataclass`, `@pytest.fixture`, and every web framework's route decorator.

### Function Decorators

A decorator is `f = deco(f)` written as `@deco` above `def`. The wrapper typically takes `*args, **kwargs`, calls the original, and returns its result. Use `@functools.wraps` to keep the name/docstring.

The `*args, **kwargs` signature matters because the wrapper must accept *whatever* the decorated function accepts — the decorator has no idea what that is — and pass it straight through. Forgetting to `return` the inner call's result is the single most common decorator bug: the function suddenly returns `None`.

`@functools.wraps(func)` copies `__name__`, `__doc__`, `__module__`, and `__wrapped__` from the original onto the wrapper. Without it, the decorated function reports itself as `wrapper`, its docstring disappears from `help()`, and tools that rely on introspection — debuggers, documentation generators, `pytest` fixtures, framework routers — misbehave. Treat it as mandatory.

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

`@deco(x)` is a decorator **factory**: it returns the actual decorator. Three nested functions: factory → decorator → wrapper.

The extra layer exists because `@` always applies whatever expression follows it to the function below. With `@timer`, that expression is the decorator itself. With `@repeat(3)`, the expression is a **call** — it is evaluated first, and whatever it returns is then used as the decorator. So `repeat(3)` must hand back a one-argument function, which is the middle layer.

Unrolled, `@repeat(3)` above `def say_hello` means `say_hello = repeat(3)(say_hello)`. Each layer owns one thing: the factory closes over the decorator's *configuration* (`n`), the decorator closes over the *function*, and the wrapper handles the *call*. A common refinement is to accept both forms — `@deco` and `@deco(...)` — by checking whether the first argument is callable.

```python
import functools

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

Closest decorator runs first at definition time; at call time the **top** `@` is the outermost wrapper. Read them bottom-up for “what wraps what”.

Two different orderings are in play, which is why this trips people up. **Application** happens bottom-up: `decorator_b` wraps the raw function first, then `decorator_a` wraps that result. **Execution** is therefore top-down, like the layers of an onion — the outermost wrapper `A` runs its "before" code first and its "after" code last, with `B` nested inside it.

The practical consequence is that order changes behaviour. A caching decorator placed above an authentication decorator would serve cached results without ever checking permissions; swap them and every request is authenticated first. Framework decorators such as route registration usually belong at the top, so they register the fully wrapped function.

```python
def decorator_b(func):
    def wrapper():
        print("B before")
        func()
        print("B after")
    return wrapper

def decorator_a(func):
    def wrapper():
        print("A before")
        func()
        print("A after")
    return wrapper

@decorator_a
@decorator_b
def func():
    print("body")

func()
# A before
# B before
# body
# B after
# A after

# Equivalent to: func = decorator_a(decorator_b(func))
# decorator_b is applied first, then decorator_a wraps the result
```

### Class Decorators

Same idea, but they take and return a class. Useful for registering classes or adding methods in one place.

Because a class is just another object, the same mechanism applies: `@singleton class Database` means `Database = singleton(Database)`. A class decorator can return the class unchanged after recording it in a registry, return the class with extra methods or attributes attached, or — as here — return something else entirely that happens to be callable.

This is the lightweight alternative to metaclasses, and it covers most of the same needs with far less machinery: `@dataclass` and `@functools.total_ordering` are both class decorators. Note the trade-off in the `singleton` example: `Database` is now a function, so `isinstance(db1, Database)` no longer works and the original class is only reachable through the closure.

```python
import functools

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

## 18. Context Managers

A context manager is the answer to a question every program faces: *how do I guarantee that this cleanup runs, no matter how the block is left?* Files must be closed, locks released, transactions committed or rolled back, temporary directories deleted — and any of those blocks might exit through an exception, a `return`, or a `break`.

`try`/`finally` solves it, but it pushes the burden onto every caller and separates the setup from the teardown by however many lines the body happens to be. The `with` statement moves that responsibility into the resource itself. The protocol is two dunder methods: `__enter__()` runs on entry and its return value is what `as` binds; `__exit__(exc_type, exc_value, traceback)` runs on the way out and receives details of the exception if one occurred, or three `None`s if not.

One subtlety worth knowing: `__exit__` can **suppress** an exception by returning a truthy value, which is how `contextlib.suppress(FileNotFoundError)` works. Returning `False` (or `None`, the default) lets the exception continue propagating after cleanup, which is what you almost always want.

### Using `with`

`with` enters a context (`__enter__`) and always exits it (`__exit__`) — files, locks, and timers all use this protocol.

```python
# File handling — file is always closed, even on error
with open("file.txt") as f:
    data = f.read()
# f is automatically closed here
```

### Custom Context Manager (Class)

Implement `__enter__` (setup, return the resource) and `__exit__` (cleanup). `__exit__` receives exception info so it can swallow or re-raise.

Note what `__enter__` returns, because that is what `as` binds — and it need not be `self`. A file's `__enter__` returns the file object; a database connection's might return a cursor. Returning `self` (as `Timer` does) is convenient when the manager itself carries the results you want to inspect afterwards, since the object outlives the block.

The three parameters of `__exit__` are `None, None, None` on a clean exit and carry the exception class, instance, and traceback otherwise — which lets one implementation branch on success versus failure, the pattern behind commit-or-rollback transaction managers. Choose the class form when the manager needs to hold state, expose methods, or be reusable across multiple `with` blocks.

```python
import time

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

`@contextmanager`: code before `yield` is enter; after `yield` is exit. Wrap the body in `try`/`finally` so cleanup still runs on error.

This reuses the suspend-and-resume behaviour of generators from section 16. The decorator drives the generator to its single `yield` when the block is entered, hands the yielded value to `as`, and resumes it when the block exits. Setup and teardown therefore sit next to each other in one readable function instead of being split across two methods.

The `try`/`finally` is not optional in real code. If the `with` body raises, `@contextmanager` throws that exception *into* the generator at the `yield` point — so without `finally`, everything after the `yield` is skipped and your cleanup never runs. That is precisely the bug in the simple `timer()` above, which prints nothing when the block fails. Catching the exception around the `yield` and choosing not to re-raise it is how a generator-based manager suppresses errors.

```python
from contextlib import contextmanager
import time

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

## 19. Type Hints

Type hints add an **optional, gradual** static type layer on top of a dynamically typed language. The word to hold onto is *optional*: the interpreter parses annotations, stores them in `__annotations__`, and then ignores them completely. Passing an `int` where the hint says `str` raises nothing at runtime. Checking is a separate step performed by a tool such as `mypy`, `pyright`, or your editor's language server.

Given that they do nothing at runtime, why write them? Three reasons carry most of the value:

1. **They catch a real class of bugs before the code runs** — typos in attribute names, a function that can return `None` being used without a check, an argument order silently swapped.
2. **They are documentation that cannot go stale**, because the checker verifies it. A signature reading `def find(id: int) -> Optional[str]` tells you the failure mode without reading the body.
3. **They power tooling** — accurate autocomplete, safe automated renames, and go-to-definition all depend on knowing types.

*Gradual* means you can annotate one function, one module, or one package and leave the rest untyped; anything unannotated is treated as `Any` and simply not checked. That makes hints practical to introduce into an existing codebase incrementally, starting with public interfaces where they pay off most.

A few syntax notes: since Python 3.9 the builtin generics work directly (`list[str]`, `dict[str, int]`) so the old `typing.List` is unnecessary; since 3.10 `str | None` is the preferred spelling of `Optional[str]`; and `Callable[[int, int], int]` reads as "takes two ints, returns an int".

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
    users = {1: "Alice", 2: "Bob"}
    return users.get(user_id)

find_user(1)     # 'Alice'
find_user(99)    # None

def process(value: Union[str, int]) -> None:
    """Accepts str or int."""    # Python 3.10+: str | int
    print(f"got {value!r}")

process("ok")    # got 'ok'
process(3)       # got 3

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

## 20. Lambda, Map, Filter, Reduce

These four tools come from functional programming, where computation is expressed by applying functions to data rather than by mutating state in loops. Python supports the style without adopting it wholesale — and in most cases a comprehension is the more Pythonic expression of the same idea, which is precisely why `reduce` was moved out of the builtins into `functools`.

Still, the underlying concept matters: `map` and `filter` are **higher-order functions**, meaning they take another function as an argument. Once you see functions as values, whole categories of design open up — `sorted(key=...)`, callbacks, decorators, and plugin registries are all the same idea.

The rule of thumb: use a comprehension when you are writing the transformation inline, and use `map`/`filter` when you already have a *named* function to apply (`map(str.strip, lines)` reads better than the comprehension). Both `map` and `filter` return lazy iterators, so wrap them in `list()` if you need a concrete sequence.

### Lambda — Anonymous Functions

`lambda args: expr` is a single-expression function. Common as a `key=` for `sort`/`min`/`max`.

A lambda is an ordinary function object; the only differences are that it has no name (`__name__` is `"<lambda>"`) and that its body must be a **single expression** whose value is returned implicitly. No statements are allowed — no assignment, no `if`/`else` blocks (though the ternary expression works), no loops, no `try`.

That restriction is deliberate: lambdas are meant for small throwaway callbacks passed to something else, most often a `key=` function. `sorted(people, key=lambda p: p.age)` is clearer than defining a two-line helper. Conversely, `square = lambda x: x**2` is an anti-pattern flagged by PEP 8 — if the function deserves a name, it deserves a `def`, which also gives it a real name in tracebacks and room for a docstring.

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

`map(fn, iterable)` is lazy — wrap in `list()` to see values. A list comprehension is usually clearer.

```python
nums = [1, 2, 3, 4, 5]

squared = list(map(lambda x: x ** 2, nums))
# [1, 4, 9, 16, 25]

# Equivalent list comprehension (preferred in most cases)
squared = [x ** 2 for x in nums]
```

### filter() — Keep Items That Match

`filter(pred, iterable)` keeps items where `pred` is truthy. Equivalent to `[x for x in xs if pred(x)]`.

```python
nums = [1, 2, 3, 4, 5, 6, 7, 8]

evens = list(filter(lambda x: x % 2 == 0, nums))
# [2, 4, 6, 8]

# Equivalent list comprehension
evens = [x for x in nums if x % 2 == 0]
```

### reduce() — Accumulate Values

`functools.reduce` folds a sequence into one value (sum, product). For sums, just use `sum()`.

A *fold* applies a two-argument function cumulatively: it takes the running accumulator and the next element, and its result becomes the accumulator for the following step. `reduce(add, [1,2,3,4])` therefore computes `((1+2)+3)+4`. Supplying an initial value both seeds the accumulator and makes the call safe on an empty sequence — without one, `reduce` raises `TypeError` on empty input.

Guido van Rossum deliberately removed `reduce` from the builtins because a plain loop is almost always clearer, and because the common cases already have dedicated builtins: `sum()`, `max()`, `min()`, `any()`, `all()`, and `math.prod()`. Reach for `reduce` only when the accumulation is genuinely custom, and prefer `itertools.accumulate` when you want the intermediate results as well.

```python
from functools import reduce

nums = [1, 2, 3, 4, 5]

total = reduce(lambda acc, x: acc + x, nums)      # 15
product = reduce(lambda acc, x: acc * x, nums)     # 120
maximum = reduce(lambda a, b: a if a > b else b, nums)  # 5

# With initial value
total = reduce(lambda acc, x: acc + x, nums, 100)  # 115
```

## 21. *args & **kwargs

The names are pure convention — only the `*` and `**` are syntax. What they express is **variadic** behaviour: a function that accepts an arbitrary number of arguments.

Crucially, the same two symbols mean opposite things depending on where they appear. In a **function definition** they *collect*: `*args` gathers leftover positional arguments into a tuple, `**kwargs` gathers leftover keyword arguments into a dict. In a **function call** they *spread*: `f(*lst)` explodes a sequence into separate positional arguments, `f(**d)` explodes a dict into keyword arguments. Packing and unpacking are exact inverses, which is what makes transparent forwarding possible.

That forwarding is the real workhorse. Any wrapper that must relay arguments it cannot know in advance — a decorator, a subclass `__init__`, an adapter, a retry helper — is written as `def wrapper(*args, **kwargs): return func(*args, **kwargs)`. The cost is a loss of signature clarity, so use explicit parameters whenever the interface is actually known.

### *args — Variable Positional Arguments

A `*` parameter slurps leftover positional arguments. Inside the function it is a tuple.

It must come after all ordinary positional parameters, and any parameter declared *after* it becomes **keyword-only** — which is why a bare `*` (as in `def f(a, *, verbose=False)`) is the idiom for forcing callers to name an option. The collected value is always a tuple, empty rather than `None` when no extra arguments were passed.

```python
def add(*args):
    """Accept any number of positional arguments."""
    print(type(args))   # <class 'tuple'>
    return sum(args)

add(1, 2, 3)        # 6
add(1, 2, 3, 4, 5)  # 15
```

### **kwargs — Variable Keyword Arguments

A `**` parameter slurps leftover keyword arguments into a dict. Iterate `.items()` to see names and values.

It must be the **last** parameter in the signature, and it captures only keyword arguments that no named parameter already claimed — so in `def f(a, **kw)`, calling `f(a=1, b=2)` binds `a` normally and leaves `kw` as `{"b": 2}`. The dict is freshly built on every call, so mutating it is safe. Beyond forwarding, `**kwargs` is how you write APIs that accept open-ended configuration, and it is essential to cooperative `super().__init__(**kwargs)` chains under multiple inheritance (section 11).

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

Order is: positional, `*args`, keyword-only (after `*`), `**kwargs`. Mixing them lets a function be both strict and flexible.

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

`fn(*list)` expands a sequence into positional args; `fn(**dict)` expands keys into keywords. The lengths/keys must match the signature.

```python
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
add(*args)           # 6  (unpacks list into positional args)

kwargs = {"a": 1, "b": 2, "c": 3}
add(**kwargs)        # 6  (unpacks dict into keyword args)
```

## 22. Unpacking & Destructuring

Unpacking lets the **left-hand side of an assignment mirror the shape of the data**. Instead of `x = point[0]; y = point[1]`, you write `x, y = point` — the structure is stated once and the names fall out of it, which is both shorter and self-documenting.

The mechanism is general: Python iterates the right-hand side and binds each produced value to the corresponding target, so it works with any iterable, not just tuples and lists. Two rules govern it. Without a star, the counts must match exactly or you get `ValueError: not enough values to unpack`. With a **starred target**, exactly one is allowed, and it greedily absorbs everything the fixed targets do not claim — always producing a `list`, even when the source was a tuple.

This also explains `a, b = b, a`: the right side is evaluated *first*, building a temporary tuple, which is then unpacked into the targets. No temporary variable is needed because the language already made one. The same idea extends to `for key, value in d.items()`, to nested shapes, and — through `*` and `**` — to function calls and dict merging.

```python
# Tuple/list unpacking
a, b, c = [1, 2, 3]                   # a = 1, b = 2, c = 3

# Star unpacking
first, *rest = [1, 2, 3, 4, 5]        # first = 1, rest = [2, 3, 4, 5]
first, *middle, last = [1, 2, 3, 4]   # first = 1, middle = [2, 3], last = 4
*head, tail = [1, 2, 3]               # head = [1, 2], tail = 3

# Swap variables
a, b = b, a                           # a = 2, b = 1

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

## 23. String Formatting

All three styles below solve the same problem — interpolating values into text — and Python accumulated them over decades: `%` formatting inherited from C, `str.format()` added in 2.6, and **f-strings** in 3.6. Use f-strings for new code.

An f-string is not a runtime template but a **compile-time construct**: the interpreter parses the expressions inside the braces and compiles them directly into the bytecode, which is why f-strings are the fastest option and why the expressions can be arbitrary Python (`f"{a + b}"`, `f"{obj.method()}"`, `f"{'yes' if x else 'no'}"`).

The part worth learning properly is the **format specification** after the colon, which follows the mini-language `[[fill]align][sign][#][0][width][,][.precision][type]`:

1. **Alignment** — `<` left, `>` right, `^` centre, with an optional fill character before it (`{x:*^20}`).
2. **Precision** — `.2f` fixes two decimal places, `.3g` gives three significant digits, `.1%` multiplies by 100 and appends `%`.
3. **Grouping** — `,` or `_` inserts thousands separators.
4. **Type** — `d`, `f`, `e`, `x`, `b`, `o`; prefix `#` adds `0x`/`0b`.
5. **Conversions** — `!r` calls `repr()` instead of `str()`, invaluable in debug output because it shows quotes and escapes.

One debugging shortcut is worth memorising: `f"{value=}"` prints both the expression text and its value, as in `x=42`.

Two cautions. Never build SQL with f-strings — use parameterised queries, or you have written an injection vulnerability. And prefer `logging.info("user %s", name)` over an f-string in logging calls, so the formatting cost is skipped when the message is filtered out.

```python
name = "Alice"
age = 30
pi = 3.14159

# f-strings (Python 3.6+ — preferred)
f"Hello, {name}! You're {age} years old."       # "Hello, Alice! You're 30 years old."
f"Pi is approximately {pi:.2f}"                 # '3.14'
f"{'hello':>20}"                                # '               hello'
f"{'hello':^20}"                                # '       hello        '
f"{1000000:,}"                                  # '1,000,000'
f"{0.85:.1%}"                                   # '85.0%'
f"{255:#x}"                                     # '0xff'
f"{'yes' if age >= 18 else 'no'}"               # 'yes'
f"{name!r}"                                     # "'Alice'"

# .format() method
"Hello, {}! Age: {}".format(name, age)          # 'Hello, Alice! Age: 30'
"Hello, {n}! Age: {a}".format(n=name, a=age)    # 'Hello, Alice! Age: 30'

# % formatting (old style — avoid in new code)
"Hello, %s! Age: %d" % (name, age)              # 'Hello, Alice! Age: 30'
```

### Multi-line f-strings

Adjacent f-string literals concatenate. Split long messages across lines instead of one huge `f"..."`.

```python
message = (
    f"Name: {name}\n"
    f"Age:  {age}\n"
    f"Pi:   {pi:.4f}"
)
```

## 24. Regular Expressions

A regular expression is a **miniature declarative language for describing text patterns**. Instead of writing a loop that walks characters and tracks state, you describe the shape of what you want — "three digits, a hyphen, three digits, a hyphen, four digits" — and the engine compiles that into a state machine that does the scanning.

Always write patterns as **raw strings** (`r"\d+"`). Without the `r`, Python's own string escaping runs first and consumes the backslashes before the regex engine ever sees them, so `"\b"` becomes a backspace character rather than a word-boundary assertion. This is the most common source of regexes that mysteriously never match.

The main entry points differ in ways that matter: `search()` finds the first match **anywhere**, `match()` anchors at the **start** of the string, and `fullmatch()` requires the entire string to match. `findall()` returns a list of strings (or of tuples, if the pattern has groups), while `finditer()` yields match objects lazily and is what you want for large inputs. `re.compile()` pre-builds the state machine — useful for readability with `re.VERBOSE` and for patterns used in hot loops, though the module already caches recent patterns.

Two behaviours cause most real bugs. Quantifiers are **greedy** by default: `.*` matches as much as it can and backtracks, so `<.*>` swallows an entire line of HTML — append `?` for the lazy form `<.*?>`. And unbounded nested quantifiers such as `(a+)+` can trigger **catastrophic backtracking**, an exponential blow-up that an attacker can use as a denial-of-service vector against user-supplied input.

Finally, know when to stop: regexes are the wrong tool for nested or recursive structures. Do not parse HTML, JSON, or source code with them — use a real parser.

```python
import re

text = "My email is alice@example.com and phone is 555-123-4567"

# Search — find first match
match = re.search(r"\d{3}-\d{3}-\d{4}", text)
if match:
    print(match.group())    # 555-123-4567
    print(match.start())    # 43
    print(match.span())     # (43, 55)

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

These building blocks combine into three categories: **character classes** describe *what* may appear, **quantifiers** describe *how many*, and **anchors** describe *where*. Anchors like `^`, `$`, and `\b` are zero-width — they assert a position without consuming a character, which is why `\bcat\b` matches the word "cat" but not the "cat" inside "category". Capture groups `(...)` both group for quantification *and* record the matched text for later retrieval; use the non-capturing form `(?:...)` when you only need the grouping, and named groups `(?P<name>...)` when a pattern has more than two or three captures.

1. `.` — Any character (except newline)
2. `\d` — Digit `[0-9]`
3. `\w` — Word character `[a-zA-Z0-9_]`
4. `\s` — Whitespace
5. `\b` — Word boundary
6. `^` / `$` — Start / end of string
7. `*` — 0 or more
8. `+` — 1 or more
9. `?` — 0 or 1
10. `{n,m}` — Between n and m times
11. `[abc]` — Character class
12. `[^abc]` — Negated character class
13. `(...)` — Capture group
14. `(?:...)` — Non-capturing group
15. `a|b` — Alternation (a or b)

## 25. Date & Time

The `datetime` module distinguishes several types, and picking the right one prevents most date bugs: `date` (calendar day, no time), `time` (clock time, no day), `datetime` (both), and `timedelta` (a *duration*, not a point in time).

The most important distinction, though, is **naive versus aware**. A naive `datetime` has no `tzinfo` and therefore does not identify a real moment — "14:30 on 15 June" means different instants in Tokyo and New York. An aware `datetime` carries a timezone and does. Mixing the two raises `TypeError` on comparison or subtraction, which is Python protecting you from a silent error. The durable rule for any system that crosses machines or users: **store and compute in UTC, convert to local time only for display**. Note that `datetime.utcnow()` is a trap and is deprecated — it returns a *naive* object holding UTC values, so it looks correct and behaves wrongly; use `datetime.now(timezone.utc)` instead.

Arithmetic follows naturally from the type split: `datetime - datetime` yields a `timedelta`, and `datetime + timedelta` yields a `datetime`. Calendar-aware offsets that `timedelta` cannot express — "one month later", "the next business day" — need `dateutil.relativedelta` or the `calendar` module.

For conversion, `strftime` **f**ormats a datetime into a string and `strptime` **p**arses a string into a datetime, both driven by the `%` codes below. Prefer `.isoformat()` / `.fromisoformat()` for machine-to-machine exchange, since ISO 8601 is unambiguous and sorts correctly as plain text.

```python
from datetime import datetime, date, time, timedelta, timezone
import time as time_module

# Current date/time
now = datetime.now()                              # local time
utc_now = datetime.now(timezone.utc)              # timezone-aware UTC
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

1. `%Y` — 4-digit year — e.g. `2024`
2. `%m` — Month (01-12) — e.g. `06`
3. `%d` — Day (01-31) — e.g. `15`
4. `%H` — Hour (00-23) — e.g. `14`
5. `%M` — Minute (00-59) — e.g. `30`
6. `%S` — Second (00-59) — e.g. `00`
7. `%B` — Full month — e.g. `June`
8. `%A` — Full weekday — e.g. `Saturday`
9. `%I` — Hour (01-12) — e.g. `02`
10. `%p` — AM/PM — e.g. `PM`

## 26. Collections Module

Each type in `collections` exists because a specific pattern kept being reimplemented badly with the builtins. Learning them is less about new capability than about deleting boilerplate:

1. **`Counter`** is a dict subclass for tallying. It replaces the `if item in counts: counts[item] += 1 else: ...` dance, returns `0` rather than `KeyError` for unseen keys, ranks with `most_common(n)`, and supports arithmetic between counters (`c1 + c2`, `c1 - c2`) for combining or diffing tallies.
2. **`defaultdict`** takes a zero-argument **factory** and calls it whenever a missing key is *accessed*, inserting the result. `defaultdict(list)` turns grouping into a single `dd[key].append(x)`. The catch to remember: merely reading `dd[missing]` creates the entry, so it silently grows if you use it for lookups.
3. **`namedtuple`** generates a tuple subclass with named fields — immutable, memory-efficient (no per-instance `__dict__`), and still unpackable and indexable. It upgrades `p[0]` into `p.x` for the price of one line. For anything with defaults, methods, or mutability, prefer a dataclass (section 27); for typed fields, `typing.NamedTuple`.
4. **`deque`** ("deck", double-ended queue) is implemented as a doubly-linked list of blocks, giving `O(1)` `append`/`pop` at **both** ends where a list's `insert(0, x)` and `pop(0)` are `O(n)`. It is the correct structure for queues, BFS frontiers, and — with `maxlen` — fixed-size rolling buffers that discard from the far end automatically.
5. **`ChainMap`** presents several dicts as one, searching them in order without copying or merging. This is exactly the layered-configuration pattern: CLI flags, then environment, then file, then defaults — and because it holds references, updating an underlying dict is reflected immediately.

`OrderedDict` is largely historical now that plain dicts preserve insertion order, though it still offers `move_to_end()` and order-sensitive equality.

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

## 27. Dataclasses

`@dataclass` is a **code generator**. At class-definition time it reads the class's annotated attributes and synthesises the methods you would otherwise hand-write: `__init__`, `__repr__`, and `__eq__` by default, plus ordering comparisons and `__hash__` on request. A five-field record shrinks from roughly thirty lines of mechanical, easy-to-desync boilerplate to five declarations.

Note that the **type annotations are what drive it** — an attribute without one is not treated as a field at all. The annotations are still not enforced at runtime (section 19); the decorator only uses their presence and order.

The options encode real design decisions rather than convenience:

1. **`field(default_factory=list)`** is how you give a field a mutable default. A plain `= []` is rejected outright, because it would be the shared-mutable-default bug from section 8; the factory is called fresh for each instance.
2. **`frozen=True`** makes instances immutable by generating a `__setattr__` that raises, and in exchange makes them hashable — so they can be dict keys or set members. This is the right default for value objects.
3. **`order=True`** generates `<`, `<=`, `>`, `>=` that compare instances as if they were tuples of their fields **in declaration order**, which is why `Version(1, 2, 3) < Version(2, 0, 0)` behaves correctly.
4. **`__post_init__`** runs immediately after the generated `__init__` and is the place for validation or derived fields; pair it with `field(init=False)` for attributes that are computed rather than supplied.
5. **`slots=True`** (Python 3.10+) generates `__slots__`, cutting memory use and speeding attribute access at the cost of dynamic attributes.

Choose a dataclass when the class is primarily *data with a few behaviours*; a `NamedTuple` when you want immutability plus tuple semantics; and a plain class when behaviour dominates. For validation and parsing at system boundaries, `pydantic` builds on the same declarative style but does enforce types.

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

## 28. Enums

An enum turns a set of related constants into a **type**. Compare `status = "actve"` — a typo that fails silently, possibly far from its origin — with `status = Status.ACTVE`, which raises `AttributeError` immediately. That shift from "any string is accepted" to "only these values exist" is the whole point, and it brings along self-documenting names in tracebacks and logs, autocomplete, exhaustiveness checking from type checkers, and iteration over all valid values.

Enum members are **singletons**: `Color.RED` is the same object everywhere, which is why `is` comparison works and is preferred. They are also hashable, so they make excellent dict keys and `match`/`case` subjects — and in a `case`, the dotted form `case Color.RED:` compares, whereas a bare name would capture (section 6).

The variants differ in how strictly they separate the enum from its underlying value. A plain `Enum` is deliberately *not* comparable to its value, so `Color.RED == 1` is `False` — preventing accidental mixing. `IntEnum` relaxes that, making members usable anywhere an `int` is expected, which is what you want for wire protocols and HTTP status codes. `StrEnum` (Python 3.11+) does the same for strings, and `Flag`/`IntFlag` support bitwise combination for permission masks. `auto()` simply assigns sequential values when the specific numbers carry no meaning.

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
direction = Direction.NORTH
match direction:
    case Direction.NORTH:
        print("Going north!")    # Going north!
```

## 29. Async / Await (Asyncio)

Async solves one specific problem: **a program that spends most of its time waiting**. A web scraper fetching 100 URLs is idle almost the entire run, blocked on the network. Sequential code waits 100 times in a row; async code issues all the requests and processes each response as it arrives.

The model is **cooperative multitasking on a single thread**. An **event loop** keeps a set of coroutines and runs one at a time; every `await` on something not-yet-ready is a coroutine voluntarily yielding control back to the loop, which then runs another coroutine until the first one's data arrives. Two consequences follow directly:

1. **Concurrency, not parallelism.** Only one line of Python executes at any instant, so async gives no speedup for CPU-bound work — that needs `multiprocessing` (section 30).
2. **One blocking call freezes everything.** Because the scheduling is cooperative, a coroutine that calls `time.sleep()`, `requests.get()`, or a heavy computation never yields, and the whole loop stalls. Async requires async-aware libraries throughout (`asyncio.sleep`, `aiohttp`, `asyncpg`), or offloading the blocking call via `asyncio.to_thread()`.

The vocabulary is small but precise. `async def` defines a **coroutine function**; calling it returns a **coroutine object** and runs *nothing* — forgetting to `await` it is the classic beginner bug, and Python warns "coroutine was never awaited". `await` suspends the current coroutine until the awaited thing completes. `asyncio.run(main())` starts the event loop and is the single entry point from synchronous code.

Crucially, awaiting one coroutine after another is still sequential. Concurrency comes from scheduling several at once: `asyncio.gather(...)` runs a collection and returns their results in order, while `asyncio.TaskGroup` (Python 3.11+) does the same with better failure semantics — if one task fails, the rest are cancelled and errors are reported together. Prefer `TaskGroup` in new code.

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

`async for` consumes async iterators (`__aiter__` / `__anext__`); `async with` is the async `with` (`__aenter__` / `__aexit__`). You must be inside an `async def`.

The async protocols exist because the ordinary ones cannot await. A regular `__next__` must return a value immediately, so it has no way to pause for a network round trip; `__anext__` is a coroutine and can. The same reasoning gives us `__aenter__`/`__aexit__`: opening a database connection or acquiring a distributed lock is itself I/O, and setup that must await cannot happen in a synchronous `__enter__`.

The practical payoff is streaming. An async generator such as `fetch_pages()` can yield each page of a paginated API as it arrives, letting the caller start processing before the last page is fetched — while other coroutines continue to run during each wait.

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

## 30. Concurrency: Threading & Multiprocessing

The first thing to separate is **concurrency** from **parallelism**. Concurrency means several tasks are *in progress* over the same period, interleaved; parallelism means they are *executing simultaneously* on different cores. Async and threading give Python concurrency; only multiprocessing gives it true parallelism for Python code.

The reason is the **GIL** (Global Interpreter Lock) — a single mutex inside CPython that permits only one thread to execute Python bytecode at a time. It exists because CPython's memory management uses non-atomic reference counting, and a global lock is a simple, fast way to keep that correct. The consequence is stark: two threads running pure-Python loops on an 8-core machine finish no faster than one, and can even be slower due to lock contention.

Threads are still useful, because the GIL is **released during I/O**. While a thread waits on a socket, a file, or `time.sleep()`, another thread runs. It is also released inside many C extensions, which is why NumPy and similar libraries do achieve real parallelism from threads.

That gives a clean decision rule: **I/O-bound work → `asyncio` or threads; CPU-bound work → processes.** The cost of processes is that they share no memory, so arguments and results are pickled and copied across a boundary — which makes them a poor fit for small, frequent tasks and for objects that cannot be pickled.

### Threading — For I/O-bound Tasks

Start a `Thread` for work that spends time waiting (network, disk). Protect shared data with a `Lock`.

Because threads share one memory space, they can corrupt it. `counter += 1` looks atomic but compiles to read, add, and store — and the GIL may switch threads between those steps, so two threads can read the same value and one increment is lost. That is a **race condition**, and a `Lock` fixes it by ensuring only one thread executes the critical section at a time.

Use `with lock:` rather than manual `acquire()`/`release()`, so the lock is released even if the block raises. Keep critical sections as small as possible, since everything inside them is serialised, and always acquire multiple locks in a consistent global order to avoid **deadlock**. `t.join()` blocks until that thread finishes, which is how you wait for results.

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

A pool of worker threads with `submit`/`map`. Prefer this over managing `Thread` objects yourself.

The executor separates *what* to run from *how many workers* run it. A fixed pool bounds resource use — spawning a thread per item works fine for 10 URLs and collapses for 10,000 — and the `with` block joins every worker on exit, so you cannot forget to wait.

`submit()` returns a **`Future`**: a handle to a result that does not exist yet. Calling `.result()` blocks until it does and re-raises any exception the worker raised, which is how errors cross the thread boundary instead of vanishing. `as_completed()` yields futures in **completion** order rather than submission order, letting you process fast responses without waiting for slow ones — mapping each future back to its input via a dict, as above, is the standard idiom. Use `executor.map()` instead when you want results in input order and do not need per-item control.

`ProcessPoolExecutor` exposes the identical interface backed by processes, so switching strategies for CPU-bound work is usually a one-word change.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def fetch(url):
    time.sleep(1)
    return f"Data from {url}"

urls = ["url1", "url2", "url3"]
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(fetch, url): url for url in urls}

    for future in as_completed(futures):
        url = futures[future]
        result = future.result()
        print(f"{url}: {result}")
# url2: Data from url2
# url1: Data from url1
# url3: Data from url3
```

### Multiprocessing — For CPU-bound Tasks

Separate processes bypass the GIL. Use a `ProcessPoolExecutor` for parallel CPU work; data is copied/pickled between processes.

Each worker is a **separate OS process with its own interpreter and its own GIL**, so `Pool(4)` genuinely saturates four cores. The trade-offs all follow from the absence of shared memory: starting a process is far more expensive than starting a thread, every argument and return value must be **picklable** (which rules out lambdas, local functions, and open file handles), and globals mutated in a worker are invisible to the parent. Share state deliberately through `multiprocessing.Queue`, `Value`/`Array`, or `shared_memory` rather than by assignment.

Because the copying overhead is fixed per task, multiprocessing pays off only when each task does substantial work — parallelising a trivial function across a million tiny items is usually slower than the serial version. On Windows and macOS, workers *re-import* the main module, so the code that creates the pool must sit under `if __name__ == "__main__":` or you will fork-bomb yourself.

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

1. Network I/O — use `asyncio` or `threading` — Waiting, not computing
2. File I/O — use `threading` — Blocked on disk
3. CPU-heavy — use `multiprocessing` — Bypass GIL, use multiple cores
4. Simple scripts — use `asyncio` — Clean, modern, no race conditions

> **The GIL (Global Interpreter Lock):** Python threads can't run Python code truly in parallel (only one thread executes Python bytecode at a time). For CPU-bound work, use `multiprocessing` to spin up separate processes.

## 31. Virtual Environments & Dependency Management

### Why Virtual Environments?

Each project gets its own isolated set of dependencies — no conflicts between projects.

The problem they solve is unavoidable in a shared installation: project A needs `django==3.2`, project B needs `django==4.2`, and a single global `site-packages` directory can hold only one of them. Installing B's requirements silently breaks A. Worse, your operating system's own tooling depends on the system Python, so `sudo pip install` can break the machine itself.

A virtual environment is simply a directory containing its own `site-packages` and a link to a base interpreter. "Activating" it prepends its `bin/` to your `PATH`, so `python` and `pip` resolve to the project's copies — nothing magical, which is why deleting the folder is a complete uninstall. The discipline that follows is worth stating plainly: **one environment per project, never installed globally, never committed to version control.** What you commit is the *declaration* of dependencies, so the environment can be rebuilt anywhere.

### venv (Built-in)

`python -m venv .venv` creates an isolated interpreter. Activate it so `pip` and `python` point at that folder, not the system install.

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

`pip install` fetches from PyPI. Pin versions in `requirements.txt` so teammates and servers install the same stack.

The distinction that matters is between the dependencies you **declare** and the ones you **lock**. Your direct requirements are a small list with deliberately loose bounds (`requests>=2.28`), expressing what your code needs. `pip freeze` produces something different: the exact version of every package currently installed, including transitive dependencies you never asked for. That output is a *lock file* — ideal for reproducing a deployment exactly, and a poor way to record intent, since it makes upgrades opaque. Keeping the two in separate files (`requirements.in` and `requirements.txt`, for instance) is the common resolution.

Also note that pip's dependency resolution is best-effort and installation order can matter, and that `pip install` executes code from the package at build time — so typo-squatted package names are a genuine supply-chain risk. Verify names, and pin versions in anything that reaches production.

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

It replaces the older scattering of `setup.py`, `setup.cfg`, `requirements.txt`, and per-tool config files with **one declarative file**, standardised by PEP 518 and PEP 621. Two parts do the work. `[project]` describes *what* your package is — name, version, supported Python versions, dependencies, and optional extras such as `dev` (installable with `pip install -e ".[dev]"`). `[build-system]` describes *how* to build it, which is what lets pip create an isolated build environment instead of executing an arbitrary `setup.py` first.

Because it is declarative rather than executable, tools can read your metadata without running your code — and most modern tooling (`ruff`, `mypy`, `pytest`, `black`) also reads its own configuration from `[tool.*]` sections of the same file.

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

## 32. Testing

A test is code that runs your code and asserts something about the result. Its purpose is less about proving correctness today than about **making change safe tomorrow** — a test suite is what lets you refactor, upgrade a dependency, or accept a contribution without manually re-verifying everything.

Good tests share a structure usually called **Arrange–Act–Assert**: set up the inputs, perform the single operation under test, then assert on the outcome. Keeping to one logical assertion per test means a failure names the problem precisely instead of telling you "something in this function broke".

Three properties separate a useful suite from a burdensome one. Tests must be **isolated** — no shared mutable state, no dependence on execution order, no reliance on a real database or network. They must be **fast**, because a suite that takes ten minutes stops being run. And they must be **deterministic**: a test that fails intermittently trains everyone to ignore failures.

The most valuable tests are the ones that cover behaviour you would otherwise get wrong — boundaries (empty input, one element, maximum size), error paths, and any bug you have previously fixed. Aim to test the **public interface** rather than private helpers, so that refactoring the implementation does not require rewriting the tests.

### unittest (Built-in)

Subclass `TestCase`, name methods `test_*`, assert with `self.assertEqual` and friends. Run with `python -m unittest`.

It is a Python port of JUnit, which explains its class-based, camelCase style. Its advantage is that it ships with the standard library, so it needs no installation — useful for scripts and for libraries that want zero test dependencies. Each `test_*` method runs on a **fresh instance** of the `TestCase`, which is how isolation is enforced, with `setUp()`/`tearDown()` running before and after each one.

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

Plain `assert` is enough. Name files `test_*.py`. `pytest` discovers tests and gives readable failure diffs.

The headline convenience is that plain `assert` works: pytest rewrites the assertion bytecode at import time so a failure reports the actual operand values rather than just "assertion failed", removing the need for dozens of `assertEqual`-style methods.

Two features do most of the heavy lifting. **Fixtures** replace `setUp`/`tearDown` with dependency injection — a test simply names `sample_list` as a parameter and pytest calls the matching fixture to supply it. Fixtures compose (one can request another), can be scoped per function, module, or session to control how often setup runs, and can use `yield` to provide teardown in the context-manager style of section 18. **Parametrization** turns one test into many: `@pytest.mark.parametrize` runs the body once per row of data, each reported separately, so adding a new case is one line rather than one function.

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

## 33. Useful Standard Library Modules

Python's "batteries included" philosophy means the answer to a surprising number of problems is already installed. Knowing what is in the box is a practical skill: every third-party dependency you avoid is one fewer version conflict, security advisory, and installation step.

A short guide to the modules below and what each is actually *for*:

1. **`os` / `sys`** — the boundary with the operating system and the interpreter. `os.environ` is the standard way to read configuration and secrets; `sys.argv` carries command-line arguments (use `argparse` once there is more than one). For path manipulation, prefer `pathlib` (section 15) over `os.path`.
2. **`math`** — float mathematics implemented in C. Note `math.isclose()` for comparing floats, since `==` on floats is unreliable.
3. **`random`** — a Mersenne Twister PRNG: fast, statistically good, and **not cryptographically secure**. Anything involving passwords, tokens, or session IDs must use the `secrets` module instead.
4. **`itertools`** — lazy, composable iterator building blocks. `chain` flattens, `islice` slices any iterable, `groupby` groups *consecutive* runs (so sort first), and `product`/`permutations`/`combinations` generate combinatorial sequences without materialising them.
5. **`functools`** — tools for working with functions. `@lru_cache` memoises results keyed by arguments, which is what turns exponential recursion like naive Fibonacci into linear time — valid only for pure functions with hashable arguments. `partial` pre-fills arguments to produce a new callable, a cleaner alternative to a wrapper lambda.
6. **`hashlib`** — cryptographic digests for checksums and integrity. It is *not* for passwords: use a deliberately slow, salted algorithm such as `bcrypt` or `argon2` for those.
7. **`logging`** — the replacement for `print` in anything that runs unattended. Levels let you filter by severity, `getLogger(__name__)` gives per-module control, handlers route output to files or services, and `exc_info=True` records the full traceback.
8. **`subprocess`** — running external commands. Pass the command as a **list**, never as a string with `shell=True` and interpolated user input, which is a shell-injection vulnerability. `check=True` turns a non-zero exit code into an exception.

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
math.pi              # 3.141592653589793
math.inf             # infinity
math.gcd(12, 8)      # 4

# random — random number generation
import random
random.random()              # float in [0, 1)
random.randint(1, 10)        # int in [1, 10]
random.choice(["a", "b"])    # 'a' or 'b'
my_list = [1, 2, 3]
random.shuffle(my_list)      # e.g. [3, 1, 2]  (in place)
random.sample(range(100), 5) # 5 unique random items, e.g. [41, 8, 72, 3, 19]

# itertools — iterator building blocks
import itertools
list(itertools.chain([1, 2], [3, 4]))             # [1, 2, 3, 4]
list(itertools.product("AB", "12"))               # [('A', '1'), ('A', '2'), ('B', '1'), ('B', '2')]
list(itertools.permutations("ABC", 2))            # [('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')]
list(itertools.combinations("ABCD", 2))           # [('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'C'), ('B', 'D'), ('C', 'D')]
list(itertools.islice(range(100), 5, 10))         # [5, 6, 7, 8, 9]
list(itertools.accumulate([1, 2, 3, 4]))          # [1, 3, 6, 10]

# functools — higher-order functions
from functools import lru_cache, partial, reduce

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

fibonacci(10)            # 55

def multiply(a, b):
    return a * b

double = partial(multiply, 2)   # pre-fill first argument
double(5)                # 10

# hashlib — hashing
import hashlib
hashlib.sha256(b"hello").hexdigest()
# '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'

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

## 34. Pythonic Idioms & Best Practices

"Pythonic" is not a synonym for clever or short. It means solving a problem the way the language was designed to solve it — using its protocols and idioms rather than transliterating patterns from another language. Non-Pythonic code usually still works; it is just longer, slower, and harder for the next reader.

The idioms below are individual expressions of a few underlying principles: **prefer iteration protocols to manual index arithmetic**, **let objects manage their own resources** via context managers, **express intent declaratively** with comprehensions and built-ins like `any`/`all`, and **make the common case short while keeping the exceptional case explicit**. Consistency matters more than any individual rule, which is why PEP 8 exists and why automated formatters and linters (`black`, `ruff`) are near-universal — they end style debates so review can focus on behaviour.

### The Zen of Python

`import this` — 19 aphorisms (readability counts, explicit is better than implicit). Use them as a taste check, not a law.

Tim Peters wrote them as guiding tensions rather than rules, and several deliberately pull against each other — "simple is better than complex" sits next to "complex is better than complicated", and "special cases aren't special enough to break the rules" is immediately followed by "although practicality beats purity". The most consequential line is "there should be one— and preferably only one —obvious way to do it", which explains why Python resists adding redundant syntax and why the community converges hard on single idioms.

```python
import this    # prints the Zen of Python
```

Key principles: *Beautiful is better than ugly. Simple is better than complex. Readability counts.*

### Common Idioms

Patterns you’ll see everywhere: `enumerate`, `zip`, `with`, `dict.get`, comprehensions, and swapping with `a, b = b, a`.

```python
my_list = []
x = None
key = "age"
my_dict = {"age": 30}
default = 0
items = ["a", "b"]
names = ["Alice", "Bob"]
scores = [95, 70]
condition = True
words = ["hello", "python"]

# ✅ Check for empty collections
if not my_list:         # instead of: if len(my_list) == 0
    print("Empty!")     # Empty!

# ✅ Check for None specifically
if x is None:           # instead of: if x == None
    print("missing")    # missing

# ✅ Use 'in' for membership
if key in my_dict:      # instead of: if my_dict.has_key(key)
    print(my_dict[key]) # 30

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
value                   # 30

# ✅ Use enumerate instead of range(len(...))
for i, item in enumerate(items):
    print(i, item)
# 0 a
# 1 b

# ✅ Use zip for parallel iteration
for name, score in zip(names, scores):
    print(name, score)
# Alice 95
# Bob 70

# ✅ Use with for resource management
with open("file.txt", "w") as f:
    f.write("ok")
with open("file.txt") as f:
    data = f.read()
data                    # 'ok'

# ✅ Chained comparisons
x = 5
if 0 < x < 10:         # instead of: if x > 0 and x < 10
    print("in range")  # in range

# ✅ Conditional assignment
result = value if condition else default
result                  # 30

# ✅ Use any() and all()
if any(score > 90 for score in scores):
    print("At least one A!")     # At least one A!

if all(score >= 60 for score in scores):
    print("Everyone passed!")    # Everyone passed!

# ✅ Dictionary setdefault
graph = {}
graph.setdefault("A", []).append("B")
graph                   # {'A': ['B']}

# ✅ Underscore for unused variables
for _ in range(3):
    print("tick")
# tick
# tick
# tick

# ✅ String joining (not concatenation in loops)
# ❌ Slow
result = ""
for word in words:
    result += word + " "

# ✅ Fast
result = " ".join(words)
result                  # 'hello python'
```

### PEP 8 — Style Guide Highlights

A **PEP** is a Python Enhancement Proposal, and PEP 8 is the style guide the entire ecosystem converged on. Its value is not that any single rule is optimal but that everyone follows the same ones, so unfamiliar code reads like your own. The guide itself opens with the caveat that *"a foolish consistency is the hobgoblin of little minds"* — match the surrounding code when a project already differs.

Two naming conventions have real semantics behind them rather than being purely cosmetic. A single leading underscore (`_internal`) is a **convention** meaning "implementation detail, may change without notice"; nothing enforces it, but it is also excluded from `from module import *`. A double leading underscore (`__really_private`) triggers **name mangling**: the attribute is rewritten to `_ClassName__really_private`, which exists to stop a subclass from accidentally clobbering a base class's attribute — not to provide security, since the mangled name is still reachable.

In practice, delegate the mechanical parts to tooling: `black` or `ruff format` normalises layout, and `ruff` or `flake8` catches the rest. That leaves you to decide only what the guide cannot — good names.

1. Snake_case functions — `my_function()`
2. PascalCase classes — `MyClass`
3. UPPER_CASE constants — `MAX_RETRIES = 3`
4. 4-space indentation — always (never tabs)
5. Max line length — 79–120 characters
6. `_private` attributes — `self._internal_state`
7. `__name_mangling` — `self.__really_private`

### Common Gotchas

Mutable defaults, late-binding closures in loops, `is` vs `==`, and modifying a list while iterating it — learn these once to save hours.

What unites these is that each follows logically from a rule you already know — they only surprise because the rule's consequence is non-obvious:

1. **Mutable defaults** follow from defaults being evaluated once, at `def` time, and then stored on the function object (section 8).
2. **Late-binding closures** follow from closures capturing the *variable*, not its value; by the time the lambdas are called, the loop has finished and `i` holds its final value (section 9).
3. **Modifying while iterating** follows from the iterator tracking a position by index: removing an element shifts everything down, so the iterator skips the next one. Build a new list instead.
4. **Integer caching** follows from CPython pre-allocating small integers (`-5` to `256`) as shared singletons — an implementation detail, not a language guarantee, which is why `is` must never be used for value comparison.
5. **Shallow versus deep copy** follows from containers holding *references*: `.copy()`, `list(x)`, and `x[:]` all duplicate the outer container while leaving the inner objects shared. Reach for `copy.deepcopy()` only when you genuinely need independent nested data — it is slow, and it fails on objects holding file handles or sockets.

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
my_list = [1, 2, 3, 4, 5]

# ❌
for item in my_list:
    if item % 2 == 0:
        my_list.remove(item)   # skips elements!

# ✅
my_list = [item for item in my_list if item % 2 != 0]
my_list    # [1, 3, 5]

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

## 35. What's Next?

This section maps your next learning steps by domain so you can move from fundamentals to applied practice. Use it to choose frameworks, tooling, and problem sets that align with your goals and keep progressing intentionally.

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

> *"Python is a language that lets you work quickly and integrate systems more effectively."* — python.org
