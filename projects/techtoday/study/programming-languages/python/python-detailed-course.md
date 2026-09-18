<!--
Source: python-detailed-course.html
Title: Python Detailed Course | TechToday
Theme-color: #0b0d10
Stylesheets: python-study.css, ../../../site-header.css, ../../diagram-style.css
Scripts: python-study.js, ../../diagram-modal.js
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="python-detailed-course"></a>

# Python Detailed Course

<a id="table-of-contents"></a>

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

<a id="1-getting-started"></a>

## 1. Getting Started

Python is an **interpreted**, **high-level**, **general-purpose** language, and each of those words has a practical consequence. (Think of it as a great first language that gives you a lot of power without making you micromanage the computer!)

1. **Interpreted** — you never compile (build) to a machine-code binary beforehand. The interpreter (CPython, the standard program written in C that runs Python) parses your `.py` file, compiles it to intermediate *bytecode* (a simplified set of internal instructions Python can execute quickly, cached in `__pycache__/*.pyc`), and executes that bytecode on a virtual machine. This means you just save and run! However, this is also why a syntax error is caught immediately, but a `TypeError` only appears when the offending line actually runs.
2. **High-level** — memory allocation, garbage collection (Python automatically cleans up unused data so you don't run out of memory), and pointer arithmetic are handled for you. You describe *what* you want to do, not exactly how the machine should move bytes around.
3. **General-purpose** — the same language runs web servers, trains AI models, and automates spreadsheets, which is why the standard library (the tools you get out of the box) is described as "batteries included".

**Figure 1.1: CPython Compilation & Virtual Machine (PVM) Architecture — CPYTHON RUNTIME**

*CPython execution lifecycle: Source code is tokenized and parsed into an AST, then compiled into stack-based bytecode instructions cached in .pyc files. The PVM evaluation loop executes opcodes while protected by the Global Interpreter Lock (GIL).*

*Diagram labels:* 1. SOURCE (.py) · def calc(x): · return x * 2 · # utf-8 script · Human-Readable Code · 2. PARSER & AST · ast.FunctionDef · • Name: 'calc' · • BinOp(Mult, x, 2) · PEG Parser (3.9+) · Syntax Validation · 3. BYTECODE (.pyc) · LOAD_FAST 0 (x) · LOAD_CONST 1 (2) · BINARY_OP 5 (*) · __pycache__ on disk · PyCodeObject in RAM · 4. CPYTHON VIRTUAL MACHINE (PVM) · _PyEval_EvalFrameDefault() · C dispatch loop: pops & pushes stack · PyFrameObject • f_locals, f_globals · GLOBAL INTERPRETER LOCK (GIL) · Mutex ensuring only 1 native OS thread executes bytecode · Py_BEGIN_ALLOW_THREADS · Releases GIL during I/O & C-extensions · • CPython Execution Dynamics & Specialization (PEP 659): · Python is an interpreted language that compiles to bytecode automatically. In Python 3.11+, the Specializing Adaptive Interpreter · dynamically rewrites generic bytecodes into specialized fast opcodes (e.g. BINARY_OP_MULTIPLY_INT) based on runtime types.

Python also uses **significant whitespace** (meaningful spacing): indentation is syntax, not style. Where C-family languages use curly braces `{ }` to delimit a block of code, Python uses the indentation level itself (how far from the left margin your text is). Badly indented Python is not just ugly Python — it is *broken* Python that will crash!

<a id="installing-python"></a>

### Installing Python

**Windows** 1. Download the installer from [python.org](https://www.python.org/downloads/). 2. Run it and **check "Add Python to PATH"** before clicking Install. 3. Verify: `powershell python --version pip --version`

**macOS**

```
brew install python
python3 --version
pip3 --version
```

**Linux (Debian/Ubuntu)**

```
sudo apt update && sudo apt install python3 python3-pip
python3 --version
pip3 --version
```

> On macOS/Linux the commands are `python3`/`pip3` unless you've aliased `python`/`pip` to point at Python 3.

The `python3` vs `python` split is historical: macOS and most Linux distributions shipped Python 2 as `/usr/bin/python` for years, so Python 3 was installed alongside it under a different name. Never `pip install` into that system interpreter — the operating system itself depends on it. Always work inside a **virtual environment** (an isolated folder for your project's dependencies, covered in section 31).

<a id="running-python-code"></a>

### Running Python Code

The **REPL** (`python`) evaluates lines immediately — great for trying snippets. Running `python my_script.py` runs a saved file from top to bottom.

The two modes serve genuinely different purposes. The **REPL** (Read–Eval–Print Loop) keeps state alive across statements, so it is your laboratory: you can check what a method returns, inspect an object with `dir(obj)` or `help(obj)`, and test a one-liner before committing it. **Script mode** starts a fresh interpreter and executes every module-level statement in order — including `def` (functions) and `class` (objects), which are themselves statements that bind a name to an object. Nothing is "hoisted" (moved to the top automatically): you cannot call a function on line 3 that is defined on line 10.

```
# Interactive REPL
python

# Run a script
python my_script.py
```

<a id="your-first-program"></a>

### Your First Program

`print()` simply shows text on your screen. This single line is a complete, working Python program.

This simple example teaches us three things. First, `print` is a **built-in function** — a tool Python gives you for free to do a specific job. Second, the parentheses `()` tell Python to actually perform that job right now. Third, `"Hello, World!"` is a **string literal**, which is just programmer jargon for "text surrounded by quotes". Notice how clean it is: there's no complicated setup code and no semicolons at the end of the line. Python likes to keep things simple.

```
print("Hello, World!")    # Hello, World!
```

<a id="comments"></a>

### Comments

The `#` symbol creates a comment. Python ignores anything after the `#` on that line. You can also use three quotes (`"""like this"""`) for long, multi-line notes, but these are special and usually used to document how a tool works.

There's actually a difference between the two! A `#` comment is completely invisible to Python. But a triple-quoted string is real text that Python reads. If you put it right at the top of a file or a tool, Python saves it as official "help text" for that tool. So, use `#` for your own personal notes, and reserve the triple quotes for explaining what a section of code is meant to do.

```
# This is a single-line comment

"""
This is a multi-line string,
often used as a docstring or block comment.
"""
```

<a id="2-variables--data-types"></a>

## 2. Variables & Data Types

The key insight is that **Python variables are names, not boxes**. In older languages like C, `int x = 5` reserves a fixed memory slot and writes `5` into it. In Python, `x = 5` creates an integer **object** (think of an object as a self-contained piece of data) and **binds** the name `x` to it in a **namespace** (a dictionary that maps names to objects, like a room's directory). Reassigning `x = "hello"` simply re-points that label to a new string object — think of peeling a sticky note off one thing and putting it on another. The old integer is left to be reclaimed by **garbage collection** (Python's automatic system for deleting unused data).

This "names and objects" model explains most of Python's surprising behaviour:

1. **Types belong to objects, not to names.** A name can point at an `int` today and a `list` tomorrow. This is what **dynamic typing** means — the type check happens when an operation is attempted, not when the name is created.
2. **Assignment never copies.** `b = a` gives you a second name for the *same* object. If that object is **mutable** (able to be changed in place), changes made through `b` are visible through `a`.
3. **Mutability is the property that really matters.** Types like `int`, `float`, `str`, `tuple`, and `bool` are **immutable** (unchangeable): no operation changes them in place, so they are safe to share freely and are **hashable** (meaning they can be converted to a fixed value for fast lookups). Types like `list`, `dict`, and `set` are **mutable**, so sharing them means changes in one place affect everywhere the object is used.
4. **Everything is an object**, including functions, classes, and modules. That uniformity is why passing functions around as data works so naturally.

```
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

**Figure 2.1: Python Memory Model: PyObject, Reference Counting & Cyclic GC — MEMORY & GC**

*Python Memory Management: Variables are pointers to PyObject heap structures. Reference counting reclaims memory the exact moment a count drops to 0. A 3-generation cyclic garbage collector resolves isolated circular references.*

*Diagram labels:* PYOBJECT ANATOMY • IMMEDIATE REFCOUNT DEALLOCATION • 3-GENERATION CYCLIC GC · 1. PyObject & NAME BINDING · a · b · PyListObject (Heap) · ob_refcnt: 2 · ob_type: &PyList · ob_item: [•, •] · → [1, 2] in RAM · "Variables are sticky notes, not boxes" · 2. REFCOUNT LIFECYCLE & DEALLOC · Py_INCREF(op): · b = a, passing as argument · Py_DECREF(op): · del a, scope exit, rebind · ob_refcnt == 0 → INSTANT FREE · • Calls tp_dealloc • PyObject_Free() · • Returned to pymalloc arena · 3. REFERENCE CYCLES & GENERATIONAL GC · Cycle: nodeA ↔ nodeB · del nodeA, nodeB → refcount stays 1! · Gen 0: New Objects (thresh: 700) · Scanned frequently on alloc delta · Gen 1: Survivors (thresh: 10) · Intermediate persistence · Gen 2: Long-lived (thresh: 10) · Full collection • Trial deletion walk · • How Python Manages Memory Under the Hood: · 99% of objects die via reference counting immediately without GC pauses. The cyclic garbage collector (gc module) · only steps in to break circular references across its 3 generations using double-linked PyGC_Head headers.

<a id="core-data-types"></a>

### Core Data Types

The built-ins divide naturally into **scalars** (a single value), **sequences** (ordered items you can look up by position), and **hash-based containers** (sets and mappings that use a super-fast lookup trick). Two properties are worth knowing up front. `int` has **arbitrary precision** (it grows to fit any number and never overflows), unlike the fixed-size integers of most languages. `float` is an IEEE-754 double (a standard way computers represent decimals), which is why `0.1 + 0.2` famously evaluates to `0.30000000000000004` due to tiny binary rounding errors; reach for `decimal.Decimal` when exact base-10 math matters, such as money.

1. The `int` type represents immutable whole numbers like `42`, `-7`, or `0b1010`.
2. The `float` type represents immutable decimal numbers like `3.14`, `-0.001`, or `1e10`.
3. The `complex` type represents immutable complex numbers like `3 + 4j`.
4. The `bool` type represents immutable true/false values: `True` and `False`.
5. The `str` type represents immutable text like `"hello"` or `'world'`.
6. The `list` type represents a **mutable** sequence of items like `[1, 2, 3]`.
7. The `tuple` type represents an immutable sequence of items like `(1, 2, 3)`.
8. The `set` type represents a **mutable** collection of unique items like `{1, 2, 3}`.
9. The `dict` type represents a **mutable** map of keys to values like `{"a": 1, "b": 2}`.
10. The `None` type represents a single immutable value that means "nothing" (`None`).

<a id="type-checking--conversion"></a>

### Type Checking & Conversion

`type()` reports the class; `isinstance()` is the preferred check (it respects subclasses, or child categories). Casting (like `int("42")` to turn a string into a number) fails with a `ValueError` if the string isn’t a valid number.

Use `type()` only when you need the *exact* class; use `isinstance()` when you mean "this type **or a subclass of it**". The distinction matters because `bool` is genuinely a subclass of `int` in Python, so `isinstance(True, int)` is `True` while `type(True) is int` is `False`.

The conversion functions are **constructors**, not casts — they build a brand-new object rather than reinterpreting existing memory. `bool()` deserves special attention because it silently drives every `if` statement: empty containers (`""`, `[]`, `{}`, `set()`), zero of any numeric type, and `None` are **falsy** (treated as false); everything else is **truthy** (treated as true). That rule is what makes `if not my_list:` the standard way to check if a list is empty.

```
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

<a id="3-operators"></a>

## 3. Operators

Operators in Python are **syntactic sugar** (a convenient shorthand) over **dunder methods** (special methods whose names start and end with double underscores, like `__add__`). When you write `a + b`, Python calls `type(a).__add__(a, b)` behind the scenes; if that returns `NotImplemented`, it falls back to `type(b).__radd__(b, a)`. This single mechanism is why `+` concatenates (joins) strings, merges lists, and adds numbers — each type supplies its own custom implementation.

One structural point: in Python, **assignment is a statement, not an expression**. This means `x = 5` produces no value and cannot appear inside an `if` condition or a function call. That deliberate restriction eliminates the classic bug of accidentally typing `if (x = 5)` when you meant `if (x == 5)`. It is exactly why the **walrus operator** `:=` was introduced separately for when you really need assignment to act as a value-producing expression.

<a id="arithmetic"></a>

### Arithmetic

The standard math operators `+ - * /` work exactly as you would expect. There are also special operators: `//` performs floor division (rounding down), `%` calculates the remainder (modulo), and `**` raises a number to a power (exponentiation). If you ever mix an `int` and a `float` in an equation, Python will automatically promote the final result to a `float`.

The two division operators exist for a reason. `/` is **true division** and always returns a `float` (a decimal), even when the result is exact (so `4 / 2` is `2.0`). `//` is **floor division**, which rounds *toward negative infinity* rather than toward zero — so `-7 // 2` is `-4`, not `-3`. The modulo operator `%` is defined to stay consistent with that rule, meaning its result always carries the sign of the *divisor*. This is what makes `%` reliable for cyclic math, like wrapping around an array or calculating clock positions.

```
5 + 3     # 8    Addition
5 - 3     # 2    Subtraction
5 * 3     # 15   Multiplication
5 / 3     # 1.6666666666666667  True division (always float)
5 // 3    # 1    Floor division (integer)
5 % 3     # 2    Modulo (remainder)
5 ** 3    # 125  Exponentiation
```

<a id="comparison"></a>

### Comparison

Comparisons return `True` or `False`. You can chain them (`0 < x < 10`) instead of writing `and`.

**Chaining** is a genuine Python feature, not a formatting trick: `0 < x < 10` is evaluated as `0 < x and x < 10` except that `x` is computed only once. It works for any mix of comparison operators and any number of terms, and it is both faster and more readable than the explicit `and` form.

```
5 == 5    # True    Equal
5 != 3    # True    Not equal
5 > 3     # True    Greater than
5 < 3     # False   Less than
5 >= 5    # True    Greater than or equal
5 <= 3    # False   Less than or equal
```

<a id="logical"></a>

### Logical

`and` / `or` / `not` combine booleans. They **short-circuit** (stop evaluating as soon as they know the answer): `and` stops at the first falsy value, `or` at the first truthy one — so they can actually return the final value they looked at, not just `True` or `False`.

This is a subtlety that trips up newcomers: `and` and `or` do **not** guarantee a boolean result, they return *one of their operands* (the actual values you gave them). `and` walks left to right and yields the first falsy value it finds, or the last value if none are falsy; `or` yields the first truthy value, or the last value if none are truthy. Because evaluation stops early, the right-hand side may never run at all — which makes these operators safe guards: `user and user.name` returns `None` instead of crashing with an `AttributeError` if `user` is missing, and `config.get("port") or 8080` easily supplies a fallback. Be careful with that second pattern when `0` or `""` are legitimate values, since they are falsy and would be accidentally replaced by the fallback!

```
True and False   # False
True or False    # True
not True         # False

# Short-circuit evaluation
0 and "hello"    # 0      (stops at first falsy)
0 or "hello"     # "hello" (returns first truthy)
```

<a id="identity--membership"></a>

### Identity & Membership

`is` asks “are these the exact same object in memory?”; `==` asks “do these have the same value?”. `in` tests membership in strings, lists, dict keys, and sets.

`==` is customisable through the `__eq__` dunder method and expresses *equivalence* (they look the same); `is` compares the underlying memory address (`id()` values), can never be overridden, and expresses *identity* (they actually are the exact same sticky note). Reserve `is` for singletons (objects that only ever exist once) — like `x is None` or `x is True` — because CPython guarantees there is exactly one such object. Using `is` for value comparison appears to work for small integers only because CPython **interns** (caches and reuses) them, and then it silently breaks for larger values: `256 is 256` is `True`, but `257 is 257` may not be.

Membership with `in` also has very different costs depending on the container: scanning a list or tuple is **O(n)** (the time it takes grows linearly with the number of items — double the list, double the time), while checking a `set` or a `dict` key is **O(1)** (constant time — it takes the same time whether there are 10 or 10 million items, because it uses a **hash table** to instantly compute the location).

```
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

<a id="assignment-shortcuts"></a>

### Assignment Shortcuts

`+=`, `*=`, and friends update a name in place. For lists, `+=` is like `extend` — it mutates the existing list.

That list behaviour is not a quirk; it follows from the dunder protocol. Augmented assignment first tries the *in-place* method (`__iadd__`), and only falls back to `__add__` plus a rebind if the type does not provide one. Mutable types like `list` implement `__iadd__`, so `lst += [1]` mutates the object every other name is also pointing at. Immutable types cannot, so `x += 1` on an integer always creates a new object and rebinds the name. The practical difference:

```
a = [1, 2]; b = a
a += [3]        # mutates in place -> b is also [1, 2, 3]

a = [1, 2]; b = a
a = a + [3]     # builds a new list  -> b is still [1, 2]
```

```
x = 10
x += 5    # x = 15
x -= 3    # x = 12
x *= 2    # x = 24
x /= 4    # x = 6.0
x //= 2   # x = 3.0
x **= 2   # x = 9.0
x %= 4    # x = 1.0
```

<a id="walrus-operator--python-38"></a>

### Walrus Operator `:=` (Python 3.8+)

The walrus operator assigns and returns a value in a single expression. It exists precisely because plain `=` is a statement: the walrus restores the *expression* form for the narrow cases where it improves readability, while its deliberately different spelling keeps the `=`/`==` typo hazard out. Reach for it when you would otherwise compute a value twice, or when a loop condition needs the value it is testing — and avoid it when it merely crams unrelated work into a condition.

```
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

<a id="ternary-conditional-expression"></a>

### Ternary (Conditional Expression)

A conditional expression (often called a ternary operator) is a one-line if/else statement that **returns a value**, written like `a if condition else b`. You should use it for simple, clear choices, but avoid it for long or complex branches.

The ordering reads oddly at first because the *value* comes before the *test*; read it as "give me `a`, if `condition` holds, otherwise `b`". Being an expression is the whole point — it can appear anywhere a value is expected: inside an f-string, as a function argument, as a default, or in a comprehension. It also short-circuits, so only the selected branch is ever evaluated.

```
age = 20
status = "adult" if age >= 18 else "minor"
status    # 'adult'
```

<a id="4-strings-in-depth"></a>

## 4. Strings In Depth

Two words define Python strings: **Unicode** and **immutable** (unchangeable), and both have far-reaching consequences.

A Python 3 `str` is a sequence of **code points** (characters), not raw bytes on disk. This means `len("café")` is exactly `4`, no matter how many bytes that word takes up when saved. Bytes are a separate type, `bytes`, and you move between the two explicitly with `.encode()` (turning text into bytes) and `.decode()` (turning bytes into text). This strict separation is the biggest change from Python 2 and it eliminates an entire category of bugs where text looks like scrambled garbage (mojibake) — the price is that you must choose an encoding (almost always UTF-8) whenever you save to a file or send data over a network.

**Immutable** means no string method ever modifies the original string; every one of them creates and returns a *new* string. Calling `s.upper()` on its own line accomplishes nothing — you must assign the result to a variable (like `s = s.upper()`). Immutability is what makes strings **hashable** (so they can be safely used as dict keys) and safe to share between multiple parts of your program running at once (threads). The trade-off is that repeated string concatenation in a loop (using `+=`) gets slower and slower (quadratic time), since each `+=` has to copy the whole accumulated string into a new object. That is why using `"".join(parts)` is the standard, fast way to build a long string from many pieces.

```
s = "Hello, World!"
s = 'Hello, World!'        # single or double quotes
s = """Multi
line string"""
```

<a id="indexing--slicing"></a>

### Indexing & Slicing

Indexes start at `0` (the first item is at position 0); negative indexes count backward from the end. A slice `[start:stop:step]` never includes the `stop` position itself. A step of -1, like `[::-1]`, neatly reverses a sequence.

Slicing follows three rules that, once internalised, apply to **every** sequence in Python — lists, tuples, `range`, and `bytes`:

1. **`start` is inclusive, `stop` is exclusive.** This half-open convention (meaning it includes the beginning but not the end) guarantees that `len(s[a:b])` is exactly `b - a`. It also means that adjacent slices such as `s[:3]` and `s[3:]` tile the sequence perfectly with no overlap and no gap.
2. **Negative indices count from the end**, with `-1` as the last element — so `s[-3:]` means "give me the last three items" without you needing to manually calculate the length first.
3. **Slicing never raises an `IndexError`.** Out-of-range bounds are silently clamped (adjusted to the nearest edge), so asking for `"ab"[:100]` safely returns just `"ab"`. However, plain single indexing (like `s[100]`) *does* raise an error if the item doesn't exist. That asymmetry is intentional and frequently useful!

A negative `step` walks backwards, which is the whole trick behind how `s[::-1]` works. A slice of a string or tuple produces a new immutable object; a slice of a list produces a **shallow copy** (a new outer list, but the items inside are the same) — making `lst[:]` a very handy shortcut for "copy this entire list".

```
s = "Python"
s[0]       # 'P'     first character
s[-1]      # 'n'     last character
s[1:4]     # 'yth'   index 1 up to (not including) 4
s[:3]      # 'Pyt'   first 3
s[3:]      # 'hon'   from index 3 to end
s[::2]     # 'Pto'   every 2nd character
s[::-1]    # 'nohtyP' reversed
```

<a id="common-string-methods"></a>

### Common String Methods

Methods always return **new** strings (because of immutability). `split` and `join` are your main tools for converting between strings and lists. `find` returns `-1` if the text is missing, whereas `index` crashes with an error.

Rather than memorising the huge list of methods, group them by purpose: **trimming** (`strip`, `lstrip`, `rstrip`), **case** (`lower`, `upper`, `title`, `capitalize`), **searching** (`find`, `index`, `count`, `startswith`, `endswith`), **splitting and joining** (`split`, `rsplit`, `splitlines`, `join`), and **classification** (`isalpha`, `isdigit`, `isspace`, etc.).

Two pairs are worth calling out. `find()` returns `-1` when the substring is absent while `index()` raises a `ValueError` — choose based on whether "not found" is a normal outcome (use `find`) or a bug (use `index`). And `strip("abc")` does **not** remove the literal word `"abc"`; it strips any leading and trailing characters belonging to that *set* of characters, so `"cabbage".strip("abc")` gives `"ge"`. Use `removeprefix()` or `removesuffix()` (available in Python 3.9+) when you mean to remove an exact word.

Note also that `"a b".split()` with no argument splits on **any run of whitespace** and discards empty spaces, whereas `split(" ")` splits on each single space character exactly and can produce empty strings in the resulting list.

```
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

<a id="string-immutability"></a>

### String Immutability

You cannot assign to a single character like `s[0] = "H"`. You must build a new string instead (like `"H" + s[1:]`), or convert the string into a list of characters if you need to make many complex edits at once.

```
s = "hello"
# s[0] = "H"   # ❌ TypeError — strings can't be modified in place
s = "H" + s[1:]  # ✅ creates a new string: "Hello"
```

<a id="5-data-structures"></a>

## 5. Data Structures

Choosing the right container is one of the most important decisions when writing Python, because it determines both how correct and how fast your program will be. Four questions usually decide it:

1. **Does order matter?** Lists and tuples preserve the exact order you put items in, and let you look them up by their number position. Sets do not have any set order. Dictionaries preserve *insertion* order (the order you added them) but are looked up by custom keys, not numbered positions.
2. **Will it change after creation?** **Mutable** (changeable) containers like `list`, `dict`, and `set` can be modified in place after you create them. **Immutable** (unchangeable) ones like `tuple`, `frozenset`, and `str` cannot — which makes them **hashable** and therefore safe to use as dictionary keys or set members.
3. **How will you look things up?** Scanning a list to find a value is **O(n)** (it gets slower as the list gets longer); looking up a dictionary key or checking if a set has an item is **O(1)** on average (it takes the same time whether there are 10 or 10 million items, because both are backed by **hash tables**). Converting a slow list to a fast set before checking "is this item inside?" is one of the most common ways to speed up real-world code.
4. **Are the elements the same kind of thing?** A list usually holds *homogeneous* items (all the same type, like a list of names) where position doesn't mean much on its own; a tuple usually holds a fixed number of *heterogeneous* fields (different types, like a name and an age) where the position tells you what the data is — which is why a tuple behaves like a lightweight record.

<a id="lists--ordered-mutable"></a>

### Lists — Ordered, Mutable

A list is the default sequence type in Python. You can look up items by their index position, grab chunks using a slice, and mutate (change) it with methods like `append`, `insert`, or `pop`. Mixing different data types in the same list is allowed, but it is usually a sign of messy code.

A Python list is a **dynamic array of pointers** (a flexible list of memory references). The elements live in a contiguous block of references that CPython over-allocates (reserves extra space for), which is why repeatedly adding items with `append()` is **amortised O(1)** (very fast in practice). The whole cost model follows from that layout: getting an item by its index and adding to the end are cheap, while `insert(0, x)` (adding to the front), `pop(0)` (removing the first item), and `remove(x)` are **O(n)** (slower as the list grows) because every single item after it has to shift over. When you need fast operations at *both* ends, use `collections.deque` (a special double-ended queue covered in section 26).

Because a list stores references (pointers to objects) rather than the values themselves, it can hold mixed types, and `lst.copy()` or `lst[:]` gives a **shallow copy** — the outer list is new, but the inner objects inside it are still the exact same shared objects. Note also the difference between `sort()` and `sorted()`: `lst.sort()` mutates (changes) the list in place and returns `None` (so writing `x = lst.sort()` is a classic bug that makes `x` equal to `None`), while `sorted(lst)` leaves the original list alone and returns a brand-new sorted list. Both are stable, meaning equal elements keep their relative order.

```
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

<a id="tuples--ordered-immutable"></a>

### Tuples — Ordered, Immutable

Tuples are fixed-length records. To make a one-item tuple, you must include a trailing comma, like `(42,)`. Tuples can be safely used as dictionary keys because they are **hashable** (as long as all their contents are also hashable).

A tuple is not merely "a list you can't change" — it signals different *intent* to anyone reading your code. Lists model collections of similar items; tuples model records with a fixed shape where the position carries meaning, such as `(x, y)` coordinates or `(host, port)`. Immutability (not being changeable) buys three concrete things: the object is hashable so it can be a dict key, it is safe to share across your program without worrying about it changing unexpectedly, and CPython stores it more compactly in memory.

Two details catch people out. First, it is the **comma**, not the parentheses, that actually creates a tuple — `1, 2` is already a valid tuple, and a stray trailing comma (like `x = 5,`) silently produces a one-element tuple instead of a regular integer! Second, immutability is **shallow**: a tuple guarantees its slots always point at the same objects, but if one of those objects happens to be a mutable list, that list can still be changed (and the tuple then stops being hashable in practice).

```
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

<a id="sets--unordered-unique-elements"></a>

### Sets — Unordered, Unique Elements

Sets are perfect for fast membership tests and performing set algebra. Duplicates are dropped automatically when you add them, and the order is never guaranteed. Always use `set()` to make an empty set; using `{}` creates an empty dictionary instead!

A set is essentially a **hash table** that stores only keys, and its two defining properties fall straight out of that: every element must be **hashable** (so you cannot put mutable lists or dicts inside a set), and duplicates collapse automatically because keys must be unique. Membership testing, insertion, and deletion are all **O(1)** (constant time) on average, versus **O(n)** (linear time) for a list.

Sets shine whenever a problem is naturally phrased in the language of set theory — "which users are in group A but not group B?", "which tags do these two articles share?", "give me the distinct values". Expressing that with `|` (union), `&` (intersection), `-` (difference), and `^` (symmetric difference) is clearer *and* dramatically faster than writing nested loops. The trade-offs are that sets carry no order and no indexing (asking for `s[0]` raises a `TypeError`), and that `remove()` raises a `KeyError` if the element is missing, while `discard()` quietly does nothing — pick according to whether absence is an error.

```
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

<a id="frozensets--immutable-sets"></a>

### Frozensets — Immutable Sets

A frozenset is simply an immutable set. Because it can never change, it is **hashable**, so it can safely be used as a dictionary key or even nested inside another set.

```
fs = frozenset([1, 2, 3])
# fs.add(4)   # ❌ AttributeError — frozensets are immutable
# Can be used as dict keys or set members (hashable)
```

<a id="dictionaries--key-value-pairs"></a>

### Dictionaries — Key-Value Pairs

A dictionary is the core mapping type in Python. Your keys must be **hashable** (like strings, numbers, or tuples). You should prefer using `.get(key, default)` instead of `[key]` whenever a missing key is a normal, expected possibility.

The dictionary is the most important data structure in Python, because the language itself is built on it: module **namespaces** (directories of names), object attributes (`obj.__dict__`), keyword arguments, and class bodies are all dictionaries under the hood. Learning to reach for a dict instead of parallel lists or a long `if`/`elif` ladder is a major step toward writing "Pythonic" code.

Mechanically, each key is passed through `hash()` to compute a specific slot in an internal **hash table**, so the lookup cost does not grow with the number of items — it is **O(1)** on average. This is precisely why keys must be **hashable**, and therefore effectively immutable: if a key's hash changed after you inserted it, the dict could never find it again! Since Python 3.7, dictionaries also **preserve insertion order** as a guaranteed built-in behaviour (meaning they remember the order you added things in), which makes the older `collections.OrderedDict` rarely necessary anymore.

Three access habits are worth forming: use `d[key]` when a missing key genuinely means something is broken (a bug), use `d.get(key, default)` when absence is expected, and use `d.setdefault(key, []).append(x)` (or `collections.defaultdict`) when you are accumulating values per key. Also remember that `.keys()`, `.values()`, and `.items()` return **views**, not lists — they are live windows looking at the dict's current state, which is why modifying a dict while you are looping over one of its views raises a `RuntimeError`.

```
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

<a id="nested-data-structures"></a>

### Nested Data Structures

Lists, dicts, and tuples nest freely inside each other (giving you JSON-shaped data). You can drill down into them by chaining indexes together, like `users[0]["name"]`.

```
students = [
    {"name": "Alice", "grades": [90, 85, 92]},
    {"name": "Bob", "grades": [78, 88, 95]},
]

students[0]["grades"][2]   # 92
```

<a id="6-control-flow"></a>

## 6. Control Flow

Control flow is where Python's whitespace rule becomes concrete: a block of code belongs to its `if` statement because it is *indented under* it, and the block ends when the indentation returns to normal. Choose 4 spaces, never mix tabs with spaces (Python 3 rejects the mixture outright and will crash), and let your code editor enforce it for you.

The other idea running through this section is **truthiness** (the concept that any value can act like True or False). A condition doesn't have to be a strict boolean: Python calls `bool()` on whatever you give it, so `if my_list:` simply reads as "if the list is non-empty". This keeps your conditions short, but it is also why you must write `if x is None:` rather than just `if not x:` if you know that `0`, `""`, or `[]` are legitimate values distinct from "missing".

<a id="if--elif--else"></a>

### if / elif / else

Conditions are any truthy or falsy value. Only the very first matching branch runs. Indentation acts as the block delimiter.

The branches are tested from top to bottom and **the first true one wins** — every remaining branch is skipped completely, even if it would also have been true. That is why the grading ladder below must run from the highest, most restrictive threshold downward; reversing the order would mistakenly classify everyone as a `"C"`. Only one `else` is allowed per block and it must come last. When a chain grows past three or four branches, that is usually a signal to replace it with a dictionary lookup or a `match` statement.

```
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

<a id="match--case-python-310--structural-pattern-matching"></a>

### match / case (Python 3.10+) — Structural Pattern Matching

`match` compares a subject value against various patterns (like plain numbers, lists, dictionaries, or custom objects). The underscore `_` is the wildcard pattern meaning "anything else" (the default case).

This is **not** just a simple `switch` statement like in other languages. A `switch` usually just compares one single value against a few constants. `match` actually destructures (takes apart) a value to check its *shape*, and when a pattern matches, it can automatically assign the pieces to new variables — meaning matching and unpacking happen in a single, clean step. That is what makes it so amazingly useful for handling complex, nested JSON-like data or taking apart abstract data structures.

The vocabulary of patterns is worth learning explicitly:

1. **Literal patterns** — `case "quit":` simply checks for an exact match using `==`.
2. **Or-patterns** — `case "quit" | "exit":` matches if *any* of the alternatives are true.
3. **Capture patterns** — a bare variable name like `y` matches anything at all and *binds* it (saves it into the variable `y`), which is why `case (0, y)` means "a 2-item tuple where the first element is 0; capture whatever the second one is and call it `y`".
4. **Class patterns** — `case str(cmd)` checks if the subject is a `str` (string), and if so, binds it to `cmd`.
5. **Guards** — adding an `if cmd.startswith("open")` at the end adds an extra custom condition that must also be true.
6. **Wildcard** — `case _:` matches absolutely anything but doesn't save it; it serves as the fallback default branch.

Cases are tried strictly in order from top to bottom, and the very first match wins. Because of this, you must put specific patterns *before* general ones — putting a general `case (x, y)` above a specific `case (0, y)` would mean the specific one never gets a chance to run. Also beware of the capture rule: a bare name always *binds* rather than comparing, so `case RED:` does not check if the value equals a constant named `RED`; it just captures the value into a new variable called `RED`! If you want to check against a constant, you need a dotted name like `case Color.RED:`.

```
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

<a id="7-loops"></a>

## 7. Loops

Python has no old-school C-style `for (i = 0; i < n; i++)` loop. Instead, its `for` is a **for-each** loop built on something called the **iterator protocol** (a standard way Python objects provide items one by one). Under the hood, Python calls `iter()` on the object to get an iterator, then calls `next()` repeatedly to fetch the next item until a special `StopIteration` signal is raised, which gracefully ends the loop. Everything else flows naturally from that one single mechanism — you can loop over a file (yielding it line by line), a dictionary (yielding its keys), a generator (yielding computed values on the fly), a database cursor, or even your own custom class, as long as it has an `__iter__` **dunder method** (special double-underscore method). Section 16 covers this protocol in more detail.

The practical rule of thumb: use `for` when you are walking through a collection of items, and use `while` when you are repeating an action until a specific *condition* changes.

<a id="for-loop"></a>

### for Loop

Python's `for` iterates (loops) over **any iterable** (things that can be looped over, like lists, strings, ranges, etc.).

Because looping is based on fetching items directly (the iterator protocol), manually tracking an index number is almost always the wrong approach in Python. These four built-in helpers cover nearly every situation:

1. **`range(start, stop, step)`** produces numbers lazily — it doesn't build a massive list of numbers in memory, but instead computes the next value only when asked. This means `range(10**9)` (a billion) costs practically zero memory!
2. **`enumerate(seq, start=0)`** gives you both the `(index, value)` pairs as you loop. It completely replaces the clunky `for i in range(len(seq))` anti-pattern.
3. **`zip(a, b, ...)`** lets you loop over multiple lists side-by-side in lockstep, automatically stopping when the **shortest** list runs out. If you pass `strict=True` (available in Python 3.10+), it will instead raise an error if the lists are different lengths.
4. **Dict iteration:** When iterating over a dictionary, you get just the keys by default. If you need both keys and values, use `for k, v in my_dict.items():`.

One golden rule to internalise: never add to or delete items from a collection while you are looping over it. The iterator just holds a blind position pointer, so if you modify the structure underneath it, you will get skipped elements or a crash (`RuntimeError`). If you must change things, loop over a copy instead (like `for x in lst[:]`), or better yet, build a brand new collection.

```
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

<a id="while-loop"></a>

### while Loop

Use `while` when you don’t know exactly how many times you’ll need to loop (like waiting for a flag to change, or processing items in a queue until empty). But watch out for infinite loops!

The condition is checked again before every single loop, so whatever that condition depends on must actually change inside the loop body — and every path through your loop must make some progress toward terminating the loop. When you need the loop to run at least once before checking the test (because Python doesn't have a `do...while` loop like C or Java), the standard pattern is to write an endless `while True:` loop and put a `break` statement inside it at the point where you know you should stop.

```
count = 0
while count < 5:
    print(count)
    count += 1
```

<a id="loop-control"></a>

### Loop Control

`break` immediately exits the nearest loop; `continue` skips the rest of this turn and goes straight to the next iteration; an `else` attached to a loop runs only if the loop finished naturally **without** hitting a `break` — which is very useful for “search failed” logic.

Four keywords shape how a loop executes, and the third one is quite unique to Python:

1. **`break`** abandons the loop immediately, skipping all remaining turns.
2. **`continue`** abandons only the current turn and jumps straight to the next one — great for an early-exit check at the top of a loop so you don't have to indent the rest of your code.
3. **`else` on a loop** runs only if the loop completely finished *without* ever hitting a `break` statement. Think of it as "no break happened", not as "otherwise". It is the natural, built-in way to say "I searched for something in the loop, didn't find it, so do this instead" without needing a separate `found = False` tracking variable.
4. **`pass`** is a completely silent placeholder that does absolutely nothing. Use it when Python syntax demands a block of code but you aren't ready to write anything there yet.

One important limit to keep in mind: `break` and `continue` only affect the **innermost** loop they are sitting inside. Python doesn't have labelled breaks (like `break outer_loop`), so to completely escape from multiple nested loops, you should either put them in a function and use `return`, or use a tracking variable to know when to stop.

```
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

<a id="8-functions"></a>

## 8. Functions

A function in Python is a **first-class object** (meaning it acts just like any regular piece of data). Writing `def greet(): ...` doesn't just declare a routine in the background — it creates a real function object while the program is running and attaches it to the name `greet`, exactly the same way `x = 5` attaches a number. Because of this, you can store functions inside lists, pass them as arguments to other functions, return them, and even attach custom properties to them. Decorators, callbacks, and passing a custom sorting rule like `sorted(..., key=len)` all rely entirely on this fact.

The other crucial idea is Python's unique way of passing arguments, which is **call by object reference** (sometimes known as call by sharing). When you give a variable to a function, the function receives a reference to the *exact same object* you had. If you re-assign that name inside the function (like `x = 99`), you only change the local label. But if you *mutate* the object it points at (like `lst.append(99)`), that change modifies the original object and is permanently visible outside the function! Understanding this single rule explains the famous "mutable default gotcha" and almost every bug where your lists or dictionaries seem to magically change.

<a id="basic-functions"></a>

### Basic Functions

Use `def` to create a function object. You run it by adding parentheses `()`; if you leave the parentheses off, you are just passing the function object itself around like a variable.

Every function in Python secretly returns something: if you never write a `return` statement, Python automatically returns `None` for you. A `return` statement also stops the function immediately, which makes "early returns" (returning right away if something is wrong) a very clean way to handle bad inputs before getting to the main logic.

```
def greet(name):
    """Greet a person by name."""   # docstring
    return f"Hello, {name}!"

message = greet("Alice")
print(message)   # Hello, Alice!
```

<a id="parameters--arguments"></a>

### Parameters & Arguments

Positional arguments are matched up in the exact order you defined them. Keyword arguments (written as `name=value`) can be provided in any order. If you define default values, they must always come *after* the required parameters.

Using keyword arguments isn't just a handy shortcut — it acts as built-in documentation for anyone reading the code. A call like `create_user("Alice", True, False)` is confusing; `create_user("Alice", is_admin=True, send_email=False)` is perfectly clear. You can even *force* people to use keyword arguments for clarity: putting a lone `*` in the definition forces every parameter after it to be keyword-only (like `def f(a, *, verbose=False)`), and putting a `/` makes everything before it strict positional-only.

The **mutable default argument** is the most famous trap in Python, and the "call by object reference" rule explains why it happens. Default values are created exactly **once**, the moment Python first reads the `def` statement — they are not recreated every time you call the function. So if you write `lst=[]`, Python creates a single empty list and attaches it permanently to the function. Every time you call the function without providing your own list, it reuses that exact same hidden list, meaning all your `append` calls will pile up together! The standard fix is to use a `None` sentinel value: default to `None`, and then create a brand new empty list *inside* the function body, because code inside the body runs fresh on every single call.

```
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

<a id="return-values"></a>

### Return Values

`return` exits the function immediately. If you don't write `return` (or just write `return` with nothing after it), the function secretly yields `None`. If you return multiple values separated by commas, Python packs them into a single tuple that you can easily unpack when you call the function.

Python doesn't actually have a true "multiple return value" trick — `return q, r` simply builds a single tuple, and `q, r = divide(17, 5)` unpacks that tuple again. That is why the number of variables on the left must exactly match the tuple's length. If you need to return more than two or three values, returning a `NamedTuple` or a dataclass (covered in section 27) keeps your code readable, since writing `result.remainder` is much clearer than remembering what `result[1]` is.

A function that both mutates (changes) an object and also returns a value is usually considered a bad design pattern; Python's own standard library follows the rule that in-place operations always return `None` (like `lst.sort()` or `lst.append()`). That is exactly why trying to chain them together (like `lst.append(1).sort()`) will crash because `append` returned `None`.

```
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

<a id="docstrings"></a>

### Docstrings

The very first string written inside a function, class, or module is its docstring (documentation string) — commands like `help(fn)` and your code editor read it to show you tooltips. Use it to describe **what** the function does and what it needs, not the nitty-gritty of how it does it.

A docstring is not a regular ignored comment: it is saved on the function object as `__doc__`. This means it is available while your code is running for `help()`, IDE tooltips, documentation generators like Sphinx, and even the `doctest` module — which can actually run the little `>>>` examples you type inside a docstring as automatic tests! You should describe the "contract" (what arguments it expects, what it returns, what errors it might throw) rather than explaining the code line-by-line, because the code is already right there for developers to read, but callers just want to know how to use it.

```
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

<a id="9-scope--closures"></a>

## 9. Scope & Closures

A **scope** is simply the region of your code where a specific variable name can be seen and used. Python decides which scope a name belongs to at *compile* time (when it first reads your code), not at runtime. That tiny detail explains one of Python's most confusing errors: if a function assigns a value to a variable anywhere inside its body, Python treats that name as a local variable for the *entire* function — so if you try to read it before that assignment happens, it will crash with an `UnboundLocalError` instead of falling back to looking for a global variable with the same name.

Scopes in Python are created by **functions, modules, and comprehensions** — but *not* by `if`, `for`, or `while` blocks! A variable created inside a `for` loop is still perfectly visible and usable after the loop ends, which is a big surprise if you are coming from languages like C, Java, or JavaScript where loops have their own private scope.

<a id="legb-rule"></a>

### LEGB Rule

Python searches for variable names in this exact order: **L**ocal → **E**nclosing → **G**lobal → **B**uilt-in.

The search stops at the first scope that actually has the name, and it only ever looks *outward* to bigger scopes, never inward. **Local** is the current function's body; **Enclosing** covers any outer functions if you have a function inside a function; **Global** means the module (file) level (not your entire program — each file has its own globals); **Built-in** is the deepest fallback namespace holding built-in tools like `len`, `print`, and `range`. This last layer is exactly why naming a variable `list = [1, 2]` is totally legal but very dangerous: your local name wins the search, so if you try to use the built-in `list(...)` tool later, it will crash with a `TypeError` because it found your variable instead!

```
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

<a id="global--nonlocal"></a>

### global & nonlocal

`global` tells Python to write to a module-level variable; `nonlocal` tells Python to write to an enclosing function’s variable. In general, prefer returning values rather than magically changing variables outside your function.

These keywords exist because *reading* an outer variable works automatically, but *assigning* a new value does not — assignment always creates a new local variable unless you explicitly say otherwise. `global x` tells Python that any time you assign to `x` in this function, it should target the main file's namespace; `nonlocal x` targets the nearest enclosing *function* scope (and will crash your program at compile time if there is no such variable to be found).

Both should be used rarely. A function that reaches out and secretly rewrites state somewhere else is very hard to test and hard to understand, and in programs running multiple threads, it invites chaotic bugs called race conditions. It is almost always better to return a new value, or to bundle the changing state up inside a class.

```
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

<a id="closures"></a>

### Closures

A closure is a function that remembers the values from its enclosing scope even after that outer scope has finished running.

The fascinating part is *how* it remembers. When `make_multiplier` finishes and returns, its local variables would normally be destroyed. But because the inner `multiply` function still needs to use `factor`, Python safely packages that variable into a special **cell object**, keeping it alive. The inner function carries this piece of private, persistent state with it forever, and each time you call the factory, it produces an independent copy: meaning `double` and `triple` do not step on each other's `factor`.

That makes a closure a fantastic, lightweight alternative to writing a whole class if you only need a single method — it's the exact same idea behind decorators (section 17), callbacks, and function factories. The classic trap to watch out for is **late binding**: a closure captures the *variable itself*, not the value it had at the moment it was captured. So, `[lambda: i for i in range(3)]` actually creates three functions that all return `2`, because by the time you call them, the loop has already finished and `i` is 2! To fix this and freeze the value immediately, bind it explicitly with a default argument like `lambda i=i: i`.

```
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # 'factor' is captured from enclosing scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

double(5)    # 10
triple(5)    # 15
```

<a id="10-list-comprehensions--generator-expressions"></a>

## 10. List Comprehensions & Generator Expressions

A comprehension is a **declarative** way to build a collection. Instead of writing out the mechanical steps to build a list (create an empty list, write a loop, check a condition, append the item), you simply describe what the final result should be — like saying "give me the squares of the even numbers in this range". Read the syntax `[f(x) for x in xs if cond(x)]` exactly like the mathematical set-builder notation it was based on: *the set of f(x), for each x in xs, where cond(x) is true*.

Beyond being very readable, there are two huge benefits. Comprehensions are **faster** than writing out a `for` loop with `.append()`, because the appending happens deep inside Python's fast C code rather than looking up the append tool over and over. They also get their **own scope** (since Python 3), meaning the loop variable you use inside the brackets won't accidentally overwrite a variable with the same name outside.

The only downside is that comprehensions compress your logic. The moment you need more than one `if` condition plus a transformation — or if you need to actually do something complex rather than just calculating a value (since only *expressions* are allowed) — you should switch back to a normal loop. Nesting more than two `for` clauses inside a comprehension is almost always a mistake because it becomes impossible to read.

<a id="list-comprehensions"></a>

### List Comprehensions

The standard syntax is `[expression for item in iterable if condition]`. If you need an `if/else` choice for the values, you must put it **at the very front** in the expression part (like `a if cond else b`), not after the `for` part.

That rule confuses everyone at first! The reason is that the two `if`s are completely different tools. An `if` at the end is a **filter** — it decides whether an item makes it into the list at all. An `a if cond else b` at the beginning is a **ternary expression** (a mini if/else statement) — it decides *what value* to output for an item that is already definitely going into the list. Because of this, filters at the end can never have an `else`, and ternaries at the beginning must *always* have one.

For nested comprehensions, read the `for` clauses **left to right in the exact same order you would write normal nested loops**: `[num for row in matrix for num in row]` is the exact equivalent of writing `for row in matrix:` on line 1, then `for num in row:` on line 2.

```
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

<a id="dict--set-comprehensions"></a>

### Dict & Set Comprehensions

`{k: v for ...}` builds a dictionary; `{x for ...}` builds a set. The exact same filtering and `if/else` rules from list comprehensions apply here too.

```
# Dict comprehension
squares = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Set comprehension
unique_lengths = {len(word) for word in ["hello", "hi", "hey", "world"]}
# {2, 3, 5}
```

<a id="generator-expressions"></a>

### Generator Expressions

Generator expressions are just like list comprehensions but they are **lazy** — they produce one value at a time, saving a massive amount of memory.

Simply swapping the square brackets `[]` for parentheses `()` changes the result from a finished *collection* into a *recipe*. When you write a generator expression, absolutely nothing is calculated yet; each value is produced on-demand only when you ask for it, and then it is immediately discarded. This means memory usage stays perfectly flat (known as `O(1)`) instead of growing with the size of the data (known as `O(n)`). It also means the work stops immediately if you stop asking for numbers — which is how a generator can actually represent an endless, infinite sequence without crashing your computer!

Use a generator expression whenever you only need to use the results exactly once, usually by feeding it straight into another function: `sum(x**2 for x in data)` doesn't even need extra parentheses, and it calculates the sum without ever building a giant list in memory. However, you should stick to a list comprehension `[]` if you need to jump to a specific index, loop over the results more than once, or check its length with `len()` — because once a generator finishes its single pass, it is completely empty and will silently give you nothing if you try to use it again.

```
# Use () instead of []
gen = (x ** 2 for x in range(1_000_000))  # no list in memory!

# Consume one at a time
next(gen)    # 0
next(gen)    # 1

# Often used directly in functions
total = sum(x ** 2 for x in range(1000))
```

<a id="11-object-oriented-programming-oop"></a>

## 11. Object-Oriented Programming (OOP)

A class is basically a **blueprint that bundles data together with the specific actions that use that data**. The real benefit isn't the fancy syntax, it's about organization: instead of passing a dictionary of random data into a dozen separate functions and hoping you don't mess up, you lock the data and the rules for changing it together in one safe package.

Four big ideas make up Object-Oriented Programming, and Python handles each of them in a unique way:

1. **Encapsulation** — grouping data with its methods. Python doesn't have a strict `private` lock to hide data. Instead, it relies on a gentlemen's agreement (putting a single underscore `_name` means "this is internal, please don't touch") and offers the `@property` tool (explained below) for when you later need to add strict validation rules. Using a double-underscore prefix triggers something called *name mangling* (scrambling the name behind the scenes), but this is meant to prevent accidental naming collisions in complex families of classes, not to provide true privacy.
2. **Inheritance** — creating a new, specialized class based on a general one, so you can reuse code and override specific behaviors.
3. **Polymorphism** — letting different types of objects respond to the exact same command in their own way. Python takes this to the extreme with **duck typing** (if it walks like a duck and quacks like a duck, it's a duck!): calling `speak()` will work on *any* object that has a `speak()` method, regardless of whether it's related to an Animal class. Python checks what an object can *do*, not what it *is*.
4. **Abstraction** — providing a simple, reliable interface while hiding the messy internal details, which Python formalises using abstract base classes.

The mechanical secret that makes all of this work is the word `self`. Python doesn't hide the object from you: when you type `buddy.bark()`, Python literally translates it to `Dog.bark(buddy)` behind the scenes. This is why every single method inside a class must take the object itself (`self`) as its explicit first parameter. When Python looks for an attribute, it checks the object's personal storage (its `__dict__`) first, and if it's empty, it falls back to checking the class blueprint itself. That simple rule is exactly why class-level attributes are shared across all instances, while object-level attributes can override them on a per-object basis.

<a id="classes--objects"></a>

### Classes & Objects

The `__init__` special method acts as the constructor to set up a new object; `self` represents the specific object being created. Class attributes are shared by all objects of that class; instance attributes belong only to that specific object.

```
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

<a id="inheritance"></a>

### Inheritance

Write shared behaviour once on a parent class. Subclasses can override methods with their own versions; the `isinstance` check will still correctly recognize that they belong to the parent's family.

Inheritance models an **"is-a" relationship**: a `Dog` *is an* `Animal`, so anywhere your program expects an `Animal`, a `Dog` will work perfectly. That kind of swap-ability is the real payoff — a loop like `for a in animals: print(a.speak())` works magically without needing to know which specific animal each one is, and adding a new `Bird` class later requires zero changes to that loop.

When a subclass creates a method with the exact same name as its parent, it **overrides** it: Python walks up the family tree and stops at the very first matching name it finds. In the example below, the parent's `speak()` raises a `NotImplementedError`. This is a common way to say "this is a blank template method that subclasses are absolutely required to fill in."

Inheritance is very easy to overuse. If the relationship is actually "has-a" rather than "is-a" (like a Car has an Engine, but a Car is not an Engine), you should use **composition** instead — just save the other object as an attribute and use it. Deep, complicated family trees tie your code up in knots and make it incredibly hard to trace what is actually happening.

```
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

<a id="super"></a>

### super()

`super()` automatically calls the next class in the family tree (the MRO) — it does not just mean “the parent class by name”. This smart behavior is what keeps multiple inheritance working smoothly without crashing.

The difference is easy to miss when you only have one parent, because `super().__init__(...)` and `Animal.__init__(self, ...)` do exactly the same thing. They only act differently the moment multiple inheritance is involved: hard-coding the parent's name locks the call to one specific class, which breaks the chain and can accidentally run a shared ancestor's code twice. `super()` instead acts like a smart pointer that looks up *whatever class happens to come next in the family tree of the actual object at runtime*.

The golden rule for using `__init__`: always call `super().__init__(...)` **before** you try to use any inherited attributes. That way, you guarantee the parent's setup is fully complete before you rely on it.

```
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

<a id="multiple-inheritance--mro"></a>

### Multiple Inheritance & MRO

Python fully supports **multiple inheritance** — meaning a single class can inherit from more than one parent at the same time.

Most programming languages ban this entirely because it raises an obvious headache: if two different parents define the exact same method, which one runs? Python answers this cleanly by using a strict, predictable order rather than guessing. Every class carries a hidden list called the **Method Resolution Order (MRO)** — a flat, ordered list of classes to search through whenever you call a method. So, `Duck.move()` runs the `Flyer.move` code simply because `Flyer` happens to be listed earlier in `Duck.__mro__`.

In the real world, multiple inheritance is safest and most useful when the extra parents are **mixins**: small, simple classes that just add one specific extra feature (like a `JSONSerializableMixin` or a `LoggingMixin`) and aren't meant to exist on their own. Trying to inherit from two massive, complex classes at once is usually where nightmares begin.

```
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

<a id="the-diamond-problem"></a>

### The Diamond Problem

This happens when a class inherits from two different classes that both share the same grandparent.

It's named after the diamond shape the family tree makes: `D` inherits from `B` and `C`, and both `B` and `C` inherit from `A`. This creates two huge problems. First, if `B` and `C` both have a `greet()` method, which one does `D` get? Second, when `D` runs its setup and asks its parents to run their setups, does the grandparent `A` get set up once or twice? A naive system would just trace up through `B` to `A` before ever looking at `C`, which is wrong because it means it skipped a direct parent (`C`) in favor of a distant grandparent (`A`).

Python solves this gracefully with an algorithm called **C3 linearization**. This algorithm flattens the diamond into a single straight line guaranteeing three things: a class always comes before its parents, the order you listed the parents in is respected, and the entire tree makes logical sense. For `class D(B, C)`, Python builds the path `D → B → C → A → object`. Notice that the grandparent `A` correctly comes *after* `C`, meaning it is only visited exactly once at the very end. If a family tree is so messed up that a logical order is impossible, Python will crash immediately with a `TypeError` when you try to write the class, rather than letting unpredictable bugs happen later.

```
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

**Python's fix is the MRO (Method Resolution Order)** — it uses the **C3 linearization** algorithm to automatically build a fair, logical order to check classes in.

```
d = D()
print(d.greet())   # "Hello from B" — B comes before C in MRO
print(D.__mro__)   # (D, B, C, A, object)
```

<a id="cooperative-super-with-kwargs"></a>

### Cooperative super() with **kwargs

When you use multiple inheritance, you should always use `super()` together with `**kwargs` (which captures any leftover keyword arguments). This ensures every class in the MRO chain gets the specific arguments it needs without crashing, and guarantees no class's setup runs twice.

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
# ✅ All __init__ methods run exactly once, no duplicates

print(d.name, d.breed, d.owner)   # Rex Lab Alice
print(DomesticDog.__mro__)
# (DomesticDog, Dog, Pet, Animal, object)
```

> **Key rules:** - MRO goes **left-to-right**, then **up** — inspect with `ClassName.__mro__` or `ClassName.mro()` - Always use `super()` (not parent class name) to cooperate with MRO - Pass `**kwargs` through `__init__` chains to handle varying constructor signatures - Python raises `TypeError` if it can't compute a consistent MRO (e.g., conflicting orderings)

<a id="properties-getters--setters"></a>

### Properties (Getters & Setters)

The `@property` decorator lets you take a method and disguise it so it looks and acts like a simple variable attribute. If you want to allow people to change it, add a `.setter` to run validation checks; if you don't add a setter, it acts as a read-only value.

Properties are brilliant because they save you from having to write annoying boilerplate code. In languages like Java, you are forced to write `getX()` and `setX()` methods from the very beginning, because if you started with a plain variable and later realized you needed to check the value before saving it, you'd break the code of everyone using your class. Python lets you start simple with a plain public variable like `c.radius = 5`. Later, if you suddenly need to validate it or log changes, you just swap it for a `@property`. The magic is that `c.radius` keeps working exactly like before for all your users, but behind the scenes it is now running your custom method!

Mechanically, `@property` installs a **descriptor**. This tells Python to intercept anyone trying to read or write to that variable and run your methods (`__get__` or `__set__`) instead. Because of this, the actual secret variable holding the data needs a different name (conventionally with an underscore, like `_radius`), otherwise the setter would try to set itself and get stuck in an endless loop. Also, note that a read-only property (like calculating `area`) runs its math every single time you ask for it — if the math is slow, you can use `functools.cached_property` to do the math once and remember the answer.

```
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

<a id="class-methods--static-methods"></a>

### Class Methods & Static Methods

A `@classmethod` receives the class itself (usually named `cls`) as its first argument — use this when you want to create an alternative way to build an object. A `@staticmethod` is basically just a normal function that lives inside a class for neatness; it receives no special `self` or `cls` argument.

The three types of methods differ only in what special hidden argument Python hands them: an instance method gets the object itself, a class method gets the blueprint (the class), and a static method gets nothing.

That makes a `@classmethod` the perfect home for **alternative constructors** (different ways to build your object), because calling `cls(...)` builds a new object using whatever class you called it on. If `PremiumDate` inherits from `Date`, then calling `PremiumDate.from_string(...)` correctly returns a `PremiumDate`. If you had just hard-coded `Date(...)`, you would incorrectly get a basic Date back! This smart pattern is used all over Python's built-in tools: `dict.fromkeys()`, `datetime.fromtimestamp()`, and `Path.cwd()`.

A `@staticmethod` is just a regular function that makes sense to store alongside the class, but doesn't actually need to look at any of the class's data. Its real value is just keeping your code organized; if a static method never touches the class, you could easily just pull it out and make it a normal function in the file.

```
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

<a id="abstract-base-classes"></a>

### Abstract Base Classes

An Abstract Base Class (ABC) is a way to mark methods that any child class **absolutely must** implement. You cannot create an object directly from an ABC — it serves strictly as a template and a place to put shared code.

The biggest benefit is **when** you catch an error. If a parent class just raises a `NotImplementedError` for a method, you won't discover someone forgot to write that method until the exact moment your code tries to run it — which could happen in front of a user! An ABC shifts the error to the exact moment you try to create the object: if a subclass is missing a required method, Python crashes instantly with a `TypeError` and tells you exactly what is missing. That turns a sneaky hidden bug into a loud, obvious warning.

An ABC is more powerful than a simple interface though: it can also hold **concrete** (fully written) methods and shared variables. This lets you build a template where the parent handles the main logic, and the children just fill in the specific varying pieces. You can even combine `@abstractmethod` with `@property` or `@classmethod` to force children to implement those too.

```
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

<a id="12-magic--dunder-methods"></a>

## 12. Magic / Dunder Methods

Dunder ("double underscore") methods are the secret hooks into Python's built-in behaviors. Almost every operator and built-in function in Python is just a thin wrapper that calls one of these: `len(x)` secretly calls `x.__len__()`, `x + y` secretly calls `x.__add__(y)`, `x[0]` calls `x.__getitem__(0)`, `for i in x` calls `x.__iter__()`, and using `with x:` calls `x.__enter__()`.

This is what programmers mean by "Pythonic" design. Instead of making up your own method names like `vector.add(other)` or `collection.getSize()`, you implement the standard dunder methods. Suddenly, your class magically works with the rest of Python — tools like `sorted()`, `sum()`, the `in` keyword, unpacking, f-strings, and `with` all cooperate automatically for free. You never call these dunder methods directly yourself; you just define them and let Python's syntax trigger them.

A few rules keep things working correctly:

1. **`__repr__` vs `__str__`** — `__repr__` is meant for developers and should ideally be clear enough that you could copy-paste it to recreate the object (like `Vector(1, 2)`); `__str__` is a friendly display meant for end users. If you only write one, always write `__repr__`, because `__str__` will fall back to using it (but not the other way around). `__repr__` is also what prints out when you print a list of your objects.
2. **`__eq__` and `__hash__` travel together.** If you define `__eq__` (to let objects be compared with `==`), Python automatically sets `__hash__` to `None`, meaning your object can no longer be put in a set or used as a dictionary key. This is a good thing, because two objects that compare as equal must have the same hash! Only define `__hash__` explicitly if your object is totally immutable (unchangeable) and needs to live in sets or dicts.
3. **Return `NotImplemented`, not `False`,** when you write math or comparison methods and you don't recognize the other object's type. This signals Python to ask the *other* object if it knows how to do the math (by trying its `__radd__` method) before finally giving up and throwing a `TypeError`.
4. **`__bool__` falls back to `__len__`.** If your class doesn't have either, every single instance will be considered truthy — which is why an empty custom list might mistakenly act like `True` in an `if` statement.

If you use the `functools.total_ordering` decorator and just define `__eq__` and `__lt__` (less than), Python will do the heavy lifting and fill in all the other comparison operators for you automatically.

```
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

<a id="common-dunder-methods-reference"></a>

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

<a id="13-modules--packages"></a>

## 13. Modules & Packages

A **module** is literally just a single `.py` file, and a **package** is just a folder containing several modules. They exist so that names have a safe home: every file has its own private global area, meaning a `parse` function in `utils.py` and a `parse` function in `network.py` will never crash into each other. The `import` system is what lets you safely snap all these separate files together into one big program.

It's important to understand how importing works so you can avoid common errors. When you write `import utils`, Python searches a list of folders (called `sys.path`) in a specific order — it checks your script's folder first, then some system variables, and finally the installed libraries — and takes the very **first** match it finds. This is why if you accidentally name your file `random.py` or `json.py`, you will break Python, because it will load your file instead of the built-in library! Once Python finds a module, it **runs the file from top to bottom exactly once** and caches the result. Any time you try to `import` it again, Python just hands you the cached version rather than running the code twice. Because of this, anything that actually *does work* (like opening a connection or printing a message) happens the instant the file is imported. That's a huge reason to only put definitions and constants at the top level of a file, and hide the actual work inside functions.

<a id="importing"></a>

### Importing

You can `import module`, pull specific things with `from module import name`, or give them a nickname using `as`. Always put imports at the top of your file, and try to avoid using `from module import *`.

The two forms do different things to your file's namespace. `import math` gives you the whole toolbox under the name `math`, so you have to type `math.sqrt`. This is great because it makes it incredibly obvious where the tool came from, and helps prevent circular import crashes. On the other hand, `from math import sqrt` dumps the tool directly into your file so you can just type `sqrt`. It's shorter, but it hides where the tool came from and could accidentally overwrite a variable you already named `sqrt`.

You should almost never use `from module import *`: it blindly dumps an unknown pile of names directly into your file. This can silently overwrite your own variables without any warning, and makes it impossible for you (or a code checker) to figure out where a specific tool came from.

```
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

<a id="creating-your-own-module"></a>

### Creating Your Own Module

Any `.py` file in a folder Python knows about (like your current project folder) can be imported just by using its filename without the `.py` part.

```
my_project/
├── main.py
├── utils.py            ← module (any .py file)
└── helpers/
    ├── __init__.py     ← makes this directory a package
    ├── math_ops.py
    └── string_ops.py
```

```
# utils.py
def add(a, b):
    return a + b

PI = 3.14159

# main.py
from utils import add, PI
from helpers.math_ops import multiply
```

<a id="__name__-guard"></a>

### `__name__` Guard

The variable `__name__` will equal `"__main__"` only when you run the file directly. Put your script's main code inside an `if __name__ == "__main__":` block so that simply importing the file doesn't accidentally run everything.

Every module automatically gets a `__name__` variable assigned to it. When Python *imports* a file, it sets `__name__` to the file's name (like `"utils"`). But when Python *runs* a file directly from the command line, it sets `__name__` to `"__main__"` instead. This clever trick lets the file figure out if someone is just trying to use it as a library, or if someone is actually running it as a program. This means one file can safely do both!

Without this `if` check, importing your module would instantly run any code sitting at the bottom — meaning it might accidentally print out tests, start a web server, or parse command line arguments just because you tried to `import utils`. It also breaks multiprocessing (running code on multiple CPU cores) on Windows and Mac, because child processes try to re-import the file and end up creating an endless loop of new processes.

```
# utils.py
def main():
    print("Running utils directly")

if __name__ == "__main__":
    # Only runs when this file is executed directly,
    # NOT when imported as a module
    main()
```

<a id="__init__py"></a>

### `__init__.py`

Adding an `__init__.py` file magically turns a normal folder into a Python package, and it runs automatically when someone types `import package`. Keep this file very lightweight — mostly just use it to organize what functions you want to share with the outside world.

Its real job is to build a clean **public menu** for your package. By importing things from your messy inner files (like `from .math_ops import multiply`), you let other programmers simply type `from helpers import multiply` without having to know how your folders are structured inside. This means you can totally reorganize your internal files later without breaking anyone else's code! You can also use a special list called `__all__ = ["multiply", "clean"]` to explicitly tell Python exactly which names are meant to be public.

Because this file runs the very first time *anyone* imports the package, if you put slow code in here, it will slow down every single person who imports even a tiny piece of your package. (Note: Since Python 3.3, you don't *strictly* need an `__init__.py` file to make a package, but having one is still considered the cleanest and most professional way to do it.)

```
# helpers/__init__.py
# Controls what's available when you "import helpers"
from .math_ops import multiply
from .string_ops import clean

# Now you can do: from helpers import multiply, clean
```

<a id="14-error-handling"></a>

## 14. Error Handling

In Python, an exception is actually a brilliant **control-flow tool**, not just an error message. When an exception triggers (or "raises"), Python immediately drops whatever it's doing and jumps backwards through the code, function by function, until it finds an `except` block that knows how to handle it. If it never finds one, it crashes the program and prints a traceback. This is amazing because a deep, hidden function can fail, and you can handle the error in one clean place way up at the top, instead of forcing every single function in between to constantly check for error codes.

Python loves using exceptions much more than other languages, following a philosophy called **EAFP** — *Easier to Ask Forgiveness than Permission*. Instead of nervously checking if something is safe before you do it ("look before you leap"), you just boldly try it and handle the failure if it blows up. For example, doing `d[key]` inside a `try` block is highly preferred over writing `if key in d:`. The nervous "check first" version is slower because it searches the dictionary twice, and in complex programs, the data might even change in the split-second between your check and your action!

The golden rule that keeps this safe is **catching narrowly**. If you write `except Exception:`, you are essentially catching *everything* — including typos, massive logic bugs, and genuine failures. This turns a loud, helpful crash into silent, broken behavior that is impossible to debug. Only catch the specific errors you actually know how to fix, and let the rest crash the program — a traceback is a helpful feature, not an enemy. Never write a completely blank `except:`, because that will even block you from stopping the program with Ctrl+C!

<a id="try--except--else--finally"></a>

### try / except / else / finally

`except` is where you handle the failure; `else` runs only if the code worked perfectly; `finally` always runs no matter what (perfect for closing files or cleaning up).

These four pieces split up the work beautifully. Keep the `try` block as **tiny as possible** — ideally just the one single line of code you think might fail. If you put too much code in the `try` block, you might accidentally catch an error from a totally unrelated line of code! Put any follow-up work that depends on success in the `else` block, which runs only if everything went perfectly and is completely safe from accidentally triggering the `except` block. Put cleanup work in the `finally` block, because Python guarantees it will run no matter what happens: whether it succeeds, fails, crashes, or even hits a `return` or `break` statement!

If you have multiple `except` blocks, Python checks them from top to bottom and stops at the first match. Because of this, you must put specific errors first, and general errors (like `except Exception`) at the very bottom. If you want to actually look at the error message, add `as e` (like `except ValueError as e:`). Just remember that Python deletes the `e` variable the second the block ends, so if you need to remember the error for later, save it to a different variable!

```
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

<a id="common-built-in-exceptions"></a>

### Common Built-in Exceptions

These errors are arranged in a family tree, and understanding that tree is how you catch errors effectively. Almost all normal errors are children of the `Exception` class. Things like `KeyboardInterrupt` (when you press Ctrl+C) and `SystemExit` (when the program finishes) sit completely outside of it, which is exactly why catching `Exception` won't accidentally trap your attempt to quit the program. Some other helpful family ties: `KeyError` and `IndexError` are both children of `LookupError`, so you can catch both at once by just catching `LookupError`. And Python draws a clear line between a `ValueError` (the type is right, but the actual data is wrong, like `int("apple")`) and a `TypeError` (the type itself is wrong, like `"a" + 1`).

1. A `ValueError` occurs when you provide the wrong value, like trying to run `int("abc")`.
2. A `TypeError` occurs when you try to combine or use the wrong data type, like `"a" + 1`.
3. A `KeyError` happens when you ask for a dictionary key that does not exist.
4. An `IndexError` happens when you ask for a list index that is outside the range of the list.
5. An `AttributeError` is raised when you try to use a method or property that an object does not actually have.
6. A `FileNotFoundError` means the file path you provided does not exist.
7. A `ZeroDivisionError` happens when you attempt to divide a number by zero.
8. An `ImportError` triggers when Python cannot find or load the module you asked for.
9. A `StopIteration` is raised behind the scenes to signal that a loop or iterator has run out of items.
10. A `RuntimeError` is a generic fallback error for anything that does not fit neatly into another category.
11. A `NameError` happens when you try to use a variable name before you actually defined it.

<a id="raising-exceptions"></a>

### Raising Exceptions

You can use `raise ValueError("...")` to shout that something went wrong and hand the problem back up to whoever called your function. If you use the word `raise` all by itself inside an `except` block, it simply throws the exact same error again so it can keep traveling up the chain.

You should raise an error the second you realize something is wrong, and try to pick the most specific error class you can. Other programmers will write their `except` blocks based on the class (like `ValueError`), while the actual text message is just there to help humans reading the logs. If you just want to log an error and then let it crash anyway, using a bare `raise` is perfect — if you wrote `raise e` instead, Python would accidentally erase the original crash location and pretend the crash started on your exact line of code!

If you catch a low-level error (like a database failing) and want to change it into a high-level error (like a `UserSaveError`), you should write `raise UserSaveError(...) from err`. This attaches the original database error to your new error ("The above exception was the direct cause of..."), so when someone is debugging, they can see the full story instead of losing the original clue. If the original error is just distracting noise, you can use `from None` to hide it completely.

```
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

<a id="custom-exceptions"></a>

### Custom Exceptions

Create your own error by inheriting from `Exception` (like `class InsufficientFundsError(Exception):`). This lets other programmers catch **your specific business error** without accidentally swallowing other unrelated bugs.

A custom exception isn't just a fancy name — it's a real tool for whoever uses your code. Creating a specific name gives them something exact to target in their `except` block. Even better, you can attach custom data to it (like `e.balance` or `e.amount`) so they can use that data in their error-handling logic, instead of forcing them to try and extract numbers from a messy string message. Think about what happens if you just raised a plain `ValueError` instead: if the programmer catches it, they have no idea if it was your specific banking rule that failed, or if an `int()` conversion just failed somewhere else nearby.

In large projects, the best practice is to create one single "base" error for your whole package (like `class PaymentError(Exception)`), and then make all your specific errors inherit from that base. That way, users have a choice: they can catch the broad `PaymentError` if they want to handle all payment issues at once, or they can catch a specific `InsufficientFundsError` if they need to do something special.

```
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

<a id="15-file-io"></a>

## 15. File I/O

Using `open()` gives you a **file object**, which you can think of as a cursor reading through a stream of data. As you read, the cursor moves forward. Because of this, if you call `f.read()` twice, the first call gets the whole file, but the second call gives you an empty string because the cursor is already at the very end — this is a super common trap! The operating system also limits how many files a program can hold open at once, and when you write data, it doesn't always hit the hard drive immediately until the file is closed. This is why closing files reliably is incredibly important.

That is exactly the problem that `with open(...) as f:` solves. It uses something called a **context manager** (explained in section 18) to guarantee that the file gets closed the moment you finish the block of code, no matter what — even if the code crashes with an error or hits a `return` early. If you try to manually write `f.close()`, an error in the middle of your code might stop that line from ever running, leaving the file open forever. Therefore, using `with` is considered the only correct way to open a file.

The other big choice when opening a file is **text versus binary**. Text mode automatically decodes the computer bytes into a readable Python `str` (string) and handles line-endings for you; binary mode just hands you the raw unformatted `bytes`. Because different computers guess text encodings differently, you should always explicitly write `encoding="utf-8"` for text files. For non-text things like images, zip files, or audio, always use `"rb"` (read binary) or `"wb"` (write binary).

<a id="reading-files"></a>

### Reading Files

Use `read()` to grab the whole file at once; for giant files, loop over the file line-by-line instead. The default mode is always text (`"r"`).

The three ways to read a file have very different memory impacts. Both `f.read()` and `f.readlines()` load the entire file into your computer's RAM at once — which is perfectly fine for a tiny settings file, but will instantly crash your computer on a 5-gigabyte server log. Looping over the file directly (`for line in f:`) is smart and lazy: it acts as its own iterator, handing you just one line at a time. This means the memory usage stays tiny no matter how massive the file is. Just remember that each line you get still has the invisible "newline" character (`\n`) attached to the end, which is why you almost always want to call `.strip()` on it to clean it up.

```
# Best practice: use 'with' (auto-closes file)
with open("data.txt", "r") as f:
    content = f.read()           # entire file as string

with open("data.txt", "r") as f:
    lines = f.readlines()        # list of lines (includes \n)

with open("data.txt", "r") as f:
    for line in f:               # memory-efficient line-by-line
        print(line.strip())
```

<a id="writing-files"></a>

### Writing Files

Use `"w"` to completely overwrite a file; use `"a"` to add to the end of it. Remember that `write()` is dumb — it doesn't add newlines automatically, so you must explicitly add `\n` yourself.

Using `"w"` wipes the file totally clean **the exact millisecond you open it**, long before you even write a single piece of data. This means if your code crashes halfway through, you will be left with an empty file and your data is permanently gone! If you are overwriting important data, the safest trick is to write your new data to a temporary file first, and then rename the temporary file so it replaces the old one. If you want to make absolutely sure you never accidentally overwrite something, use `"x"` instead of `"w"` — it creates a new file, but throws an error if a file with that name already exists.

Unlike the friendly `print()` function, `write()` adds absolutely nothing for you: no newlines, no spaces, and it won't magically convert numbers to strings — if you try to write an integer, Python will crash with a `TypeError`. The `writelines()` function is also terribly named; it writes a list of strings mashed together back-to-back, but it still won't add any newlines between them!

```
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

<a id="file-modes"></a>

### File Modes

1. The `"r"` mode is for reading, which is the default behavior.
2. The `"w"` mode is for writing, which creates a new file or completely erases an existing one.
3. The `"a"` mode is for appending data to the very bottom of an existing file.
4. The `"x"` mode is for exclusive creation; it creates a new file but deliberately crashes if one already exists.
5. The `"b"` mode stands for binary, which you combine with other modes (like `"rb"`) to read non-text files like images or audio.
6. The `"+"` mode allows you to read and write at the exact same time (like `"r+"`).

<a id="working-with-json"></a>

### Working with JSON

Use `json.dump` and `json.load` to talk directly to files; use `json.dumps` and `json.loads` to talk to string variables. Note that JSON only allows strings as dictionary keys, and any Python tuples will silently be turned into normal lists.

The little `s` in `dumps`/`loads` just stands for *string* — that's the only difference between the tools. JSON is the universal language of the internet because almost every programming language can read it. However, because it has to be simple enough for everyone, translating Python to JSON is a **lossy process**: tuples are flattened into lists, integer dictionary keys are forcefully turned into strings, and advanced Python objects like `set`, `datetime`, or your custom classes simply crash the converter unless you write custom instructions for them. This means you can't assume that saving a Python object to JSON and loading it back will give you the exact same object.

Two practical tips: if a human needs to read the file, always add `indent=2` to format it nicely; if you are sending it across the internet, leave `indent` out to save space. Also, remember that `json.load` sucks the entire file into memory at once, so if you are trying to parse a massive 10GB JSON dataset, you'll need to use a special streaming tool instead.

```
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

<a id="working-with-csv"></a>

### Working with CSV

Use `csv.reader` and `csv.writer` to handle annoying commas and quotes properly. Even better, use `DictReader` and `DictWriter` to automatically turn each row into a dictionary based on the header row.

Reading a CSV looks so easy that people often try to do it manually with `line.split(",")`. This is a huge trap! Real files have commas hidden *inside* quoted text, weird newlines, and confusing escape characters. The built-in `csv` tool handles all of this nightmare logic for you, so you should always use it, even for "simple" files.

Two practical tips: first, always add `newline=""` when opening a CSV file — the CSV tool prefers to handle line endings its own way, and if you forget this, it will randomly insert blank rows on Windows computers. Second, remember that CSV files have **no idea what a number is**. Everything comes back as a string, so you have to manually turn `"30"` into the integer `30` yourself. When possible, always use `DictReader` instead of normal `reader`, because asking for `row["Age"]` will still work perfectly even if someone rearranges the columns, while asking for `row[1]` will suddenly break.

```
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

<a id="pathlib--modern-path-handling"></a>

### pathlib — Modern Path Handling

`Path` objects let you join folders together using the `/` symbol, and they magically work on both Windows and Mac. For quick jobs, use `Path("file.txt").read_text()` instead of a clunky `open()` block.

The old-school way of handling paths (`os.path`) just treated file paths as dumb **strings** of text, meaning you had to pass them through clunky functions like `os.path.join(a, b)`. The modern `pathlib` tool turns the path into a smart **object** that knows all about itself. So instead of passing it to a function, you just ask it questions directly: `p.parent`, `p.stem`, `p.suffix`, or ask it to do things like `p.exists()` and `p.read_text()`.

Being able to use the division slash `/` to stick folders together is more than just a neat party trick — it totally eliminates the nightmare of mixing up Windows backslashes (`\`) and Mac/Linux forward slashes (`/`). A `Path` object automatically outputs the correct slash for whatever computer it's running on! Also, `Path` objects can be used directly as dictionary keys, and almost every modern Python tool that asks for a filename will happily accept a `Path` object instead. If you need to search for files, use `p.glob("*.py")` to search one folder, or `p.rglob("*.py")` to search that folder and every folder inside it.

```
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

<a id="16-iterators--generators"></a>

## 16. Iterators & Generators

This section explains the invisible gears that make every single `for` loop in Python tick. There are two different actors involved, and keeping them straight will solve almost all confusion about looping:

1. An **iterable** is any object that can *create* a loop cursor — technically, it has an `__iter__` method. Lists, strings, dictionaries, and files are all iterables. You can loop over a list a hundred times because every time you start a `for` loop, the list hands you a brand-new cursor.
2. An **iterator** is the actual cursor that walks through the data — technically, it has a `__next__` method. An iterator is **single-use and remembers where it is**: once it walks to the end and throws a `StopIteration` error, it is permanently empty and useless forever.

Knowing this difference explains things that usually confuse beginners: this is exactly why you can loop over a list twice, but you can only loop over a generator once. Tools like `zip`, `map`, and `enumerate` actually give you single-use iterators, not lists, which is why they seem to mysteriously empty themselves after you look at them!

The huge reward for all this complexity is **laziness**. An iterator calculates each value right at the split-second you ask for it, rather than building a giant list in advance. Because of this, it uses almost zero memory, it can start handing you results before it has finished calculating the rest, it can represent literally infinite sequences (like counting forever), and you can stop it early without wasting any computer power calculating things you didn't need.

<a id="iterators"></a>

### Iterators

An iterator is simply any object that has both an `__iter__()` and a `__next__()` method.

If you build an iterator yourself, you can see exactly how it works: `__iter__` just returns the object doing the walking, and `__next__` either hands back the next piece of data or screams `StopIteration` to signal it's done. A standard `for` loop is just Python hiding this ugly machinery for you: behind the scenes, it calls `iter()` to get the cursor, then repeatedly calls `next()` inside a secret `try` block until it catches that `StopIteration` error. Because that error is an expected part of the design, Python quietly hides the crash from you and just ends the loop.

```
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

<a id="generators--easy-iterators"></a>

### Generators — Easy Iterators

Generators are just an incredibly easy way to write an iterator. Just use the word `yield` instead of `return`, and Python will automatically save the function's progress between calls.

Putting a single `yield` anywhere inside a function completely changes how it works. When you call the function, it doesn't actually run your code — instead, it hands you back a **generator object** and waits. The code inside only starts running when you ask it for the first value (using `next()`). It runs down to the `yield`, hands you the value, and then *freezes time*! All of your variables, your exact place in the code, and even loops are frozen perfectly in place. The next time you ask for a value, it thaws out, picks up exactly where it left off, and runs until it hits another `yield`. When the function finally hits the end of the file or a `return` statement, it automatically throws the `StopIteration` error to signal it is empty.

This amazing pause-and-play superpower is why a generator can create infinite lists like a Fibonacci sequence: even if you write a `while True:` loop that runs forever, it freezes every single time it yields a number, so it only works exactly as fast as you ask for numbers. It's also why writing a tiny generator function can totally replace writing a massive, ugly custom Iterator class — Python writes all the messy `__iter__` and `__next__` stuff for you behind the scenes.

There are two "gotchas" to remember. First, like all iterators, a generator is empty after a single pass — if you need the data twice, you must save it into a list first. Second, if you pause a generator in the middle of a `with open(...)` block, that file stays open in the background until the generator finally finishes!

```
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

<a id="yield-from"></a>

### yield from

Writing `yield from some_list` automatically loops over the list and yields every item for you, so you don't have to write a manual `for item in some_list: yield item` loop.

But it's actually much more powerful than just a shortcut. `yield from` creates a transparent **two-way tunnel** between the person asking for data and the inner generator creating the data. This allows special pause/resume commands to travel directly down the tunnel, and allows a final `return` value to travel back up. This superpower is what makes it incredibly easy to write recursive generators (like the `flatten` example below), where a function calls itself over and over to dig through nested lists without messing up the data flow.

```
def flatten(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten(item)   # delegate to sub-generator
        else:
            yield item

list(flatten([1, [2, [3, 4], 5], 6]))   # [1, 2, 3, 4, 5, 6]
```

<a id="why-generators"></a>

### Why Generators?

- **Extremely memory efficient:** A generator only ever holds one single value in memory at a time, instead of thousands.
- **Lazy evaluation:** A generator doesn't do any math or processing until the exact second you ask for the answer.
- **Lego-block composability:** You can easily snap multiple generators together into a pipeline.

That last point (composability) is the most valuable trick in the real world. Because every generator can take in an iterator and spit out an iterator, you can snap them together like pipes: `read_huge_file` → `filter_for_errors` → `print_results`. Because everything is lazy, it never builds a giant list anywhere in the middle. You could process a massive 50 GB log file this way, and your computer would use almost zero RAM, because it's only ever looking at one line of text at a time! Breaking a big task into these small, lazy pipes also makes your code incredibly easy to test and rearrange.

```
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

<a id="17-decorators"></a>

## 17. Decorators

A decorator is quite literally just a **function that swallows another function, modifies it, and spits out a replacement**. This is only possible because in Python, functions are treated as regular objects (just like numbers or strings): you can pass a function into a variable, put it inside another function, and return it.

The `@` symbol you see is just a visual shortcut. Writing this:

```
@timer
def slow_function(): ...
```

...is exactly the same as writing this:

```
def slow_function(): ...
slow_function = timer(slow_function)
```

When you use a decorator, the name `slow_function` no longer points to your original code. Instead, it points to a new "wrapper" function that the decorator built for you. This wrapper still runs your original code eventually, but it can now sneakily run extra code before or after it, or wrap it in a `try/except` block.

Decorators are incredibly useful for separating **background chores** (like measuring time, logging, checking passwords, or retrying a network failure) from the actual work a function is trying to do. Without decorators, you would have to copy-paste the exact same messy password-checking code at the top of a hundred different functions! You actually use built-in decorators all the time without realizing it, like `@property`, `@staticmethod`, and `@classmethod`.

<a id="function-decorators"></a>

### Function Decorators

A decorator is just `f = deco(f)` written politely as `@deco` above your `def`. When you build one, the inner "wrapper" function usually takes `*args, **kwargs` (which means "accept absolutely any arguments"), calls the original function, and returns the result. You must also use `@functools.wraps` to prevent the decorator from accidentally erasing the function's name and documentation.

Using `*args, **kwargs` is critical because a decorator has no idea what specific arguments the original function expects, so it just acts as a dumb mailman and forwards everything straight through. The most common bug people make when writing their first decorator is forgetting to actually `return` the result of the inner function, which causes their decorated function to silently return `None` instead of the correct answer!

The `@functools.wraps(func)` line is also highly important. It copies the original function's name and helpful docstring onto the new wrapper. If you forget it, Python will think your function is literally named `wrapper`, and any help menus, debuggers, or web-framework tools that try to read the function's name will get extremely confused. Always use it.

```
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

<a id="decorators-with-arguments"></a>

### Decorators with Arguments

When you see `@deco(x)`, you are actually looking at a decorator **factory**: it's a function that uses your arguments to build a custom decorator on the spot. This requires three layers of functions nested inside each other: the factory, the decorator, and the wrapper.

This confusing extra layer exists because of how Python reads the `@` symbol. When you type `@timer`, Python just applies the `timer` function directly. But when you type `@repeat(3)`, Python sees parentheses and **runs that function first**. Whatever that `repeat(3)` function spits out is what actually becomes the decorator! Therefore, `repeat(3)` has to return a function, which then returns the final wrapper.

If you unroll the math, `@repeat(3)` on top of `def say_hello` translates to: `say_hello = repeat(3)(say_hello)`. Each layer has a single job to remember: the outer factory remembers the setting (`n=3`), the middle decorator remembers which `function` it is targeting, and the inner wrapper actually runs the `call` when the user finally asks for it.

```
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

<a id="stacking-decorators"></a>

### Stacking Decorators

If you stack decorators like a pancake tower, they wrap the function from the bottom-up. But when you finally *run* the function, the code executes from the top-down, just like peeling an onion.

This tricks a lot of people! The decorator closest to the `def` line grabs the function first, and then the next decorator up grabs *that* result, and so on. But because they are wrapped like nested boxes, the outer box (the top decorator) is the first one that runs when you call the function. It runs its "before" code, then opens the inner box (the bottom decorator), which runs *its* "before" code, and then the original function finally runs. Then they finish in reverse order.

This means the order you stack them changes how they behave! If you put an `@cache` decorator above an `@authenticate` decorator, the cache checks if it knows the answer first. If it does, it returns the answer instantly without ever asking the `@authenticate` decorator to check the password! If you swap them around, the password is checked first. Usually, big framework tools like registering web routes should go at the very top of the stack.

```
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

<a id="class-decorators"></a>

### Class Decorators

A class decorator is the exact same concept, except it swallows a whole `class` instead of a `def`. This is a great way to add hidden superpowers or extra methods to a class without making the class itself look messy.

Because a class is just an object in Python, writing `@singleton` on top of `class Database` is just a shortcut for saying `Database = singleton(Database)`. The decorator might just record the class in a list somewhere and hand it back unchanged, or it might attach a bunch of new custom methods to it before handing it back. It can even replace the class entirely with something else!

This is how built-in magic like `@dataclass` works — you write a few simple variables, and the decorator quietly adds all the messy `__init__` and `__repr__` methods for you behind the scenes. Just be careful: if your decorator returns a function instead of a class (like the `singleton` example below), things like `isinstance()` might stop working the way you expect, because Python thinks your class is now a function!

```
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

<a id="18-context-managers"></a>

## 18. Context Managers

A context manager exists to answer one very stressful question: *how do I guarantee my cleanup code runs, even if my program crashes?* Things like files, internet connections, and database transactions absolutely must be closed when you are done. But if your code hits an error, hits a `return`, or uses `break` inside a loop, it might skip right past your `close()` command.

You *could* solve this by wrapping everything in a giant `try/finally` block, but that's ugly and easy to forget. The `with` statement solves this beautifully by making the resource clean up after itself automatically. To do this, an object just needs two special dunder methods: `__enter__()` (which runs when the block starts, and hands you the variable for the `as` part), and `__exit__()` (which runs the split-second the block ends). The `__exit__` method even gets handed the details of any error that happened, so it can decide how to handle it!

A cool secret: if your `__exit__` method returns `True`, Python will completely swallow and hide whatever error just happened (which is how the built-in `contextlib.suppress` tool works). But normally, it just returns `None` or `False`, letting the error bubble up normally so you can see the crash report.

<a id="using-with"></a>

### Using `with`

The `with` block automatically runs the `__enter__` setup code at the beginning, and guarantees it will run the `__exit__` cleanup code at the end — whether it succeeded, failed, or crashed.

```
# File handling — file is always closed, even on error
with open("file.txt") as f:
    data = f.read()
# f is automatically closed here
```

<a id="custom-context-manager-class"></a>

### Custom Context Manager (Class)

To build your own, write a class with an `__enter__` method (to set things up and return the object) and an `__exit__` method (to clean things up). The `__exit__` method automatically receives info about any crashes so it can choose to ignore them or raise them.

Pay close attention to what `__enter__` returns, because whatever it spits out is what gets assigned to the variable after the word `as`. When you open a file, `__enter__` gives you the actual file cursor. Sometimes, like in the timer example below, it just returns `self` so you can look at the timer's properties after the block is finished.

If the block finishes perfectly, the `__exit__` method receives three `None`s. But if something crashes, it receives the exact details of the error. This lets you write smart code that says "if everything is fine, save to the database, but if there's an error, undo everything!" Writing a whole class like this is best when your tool needs to remember complex information or be used over and over again in different places.

```
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

Use the `@contextmanager` decorator on a generator function: the code before the `yield` is the setup, and the code after the `yield` is the cleanup. Always wrap the `yield` in a `try/finally` block to make sure the cleanup actually happens!

This trick uses the pause-and-play superpower of generators we learned about earlier. When the `with` block starts, Python runs your function until it hits the `yield`, pauses it, and hands whatever you yielded to the `as` variable. When the block ends, Python unpauses your function so it can finish the cleanup code. It is so much easier to read because your setup and cleanup code sit right next to each other in one tiny function!

But beware: if you don't use `try/finally`, you will create a terrible bug! If the code inside the user's `with` block crashes, Python actually throws that crash *into* your generator right at the `yield` line. If you don't have a `finally` block to catch it, your generator will just crash too, meaning all the cleanup code below the `yield` will be permanently skipped! That's why the `finally` block is totally mandatory.

```
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

<a id="19-type-hints"></a>

## 19. Type Hints

Type hints are a totally **optional** way to label what kind of data your variables and functions expect. The most important thing to know is that Python completely ignores them when your code runs! If you write a hint that says a variable is an `int`, but you pass a `str` (string) when you run the program, Python will happily allow it without crashing. To actually check the hints, you have to run a separate tool (like `mypy` or `pyright`) that scans your code before you run it, sort of like a spell-checker for types.

If they don't actually do anything when the program runs, why bother writing them? Three huge reasons:

1. **They catch embarrassing bugs early:** Type hints can help you spot mistakes like making a typo in a variable name, forgetting to pass a required argument, or accidentally trying to add a number to a string.
2. **They act as bulletproof documentation:** If a function signature says `def find(id: int) -> str | None`, you instantly know it takes a number and might fail and return `None`. And unlike standard text comments, type hints can't lie to you because the checker tool will yell at the programmer if they don't match the code!
3. **They make your code editor incredibly smart:** Autocomplete, instant error squiggles, and the ability to click a function to jump to its definition all rely heavily on type hints to figure out what is going on.

Because they are optional, you don't have to add them everywhere at once. You can just add them to the one important function you are working on today, and leave the rest of your files untouched. If you don't write a type hint, the tools just assume the type is `Any` and leave you alone.

Modern Python has made hints much cleaner. Since Python 3.9, you can just use standard types like `list[str]` instead of importing special uppercase types. Since Python 3.10, you can use the `|` symbol to mean "or" — so `str | None` means "this will be a string, or it will be None".

```
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

<a id="20-lambda-map-filter-reduce"></a>

## 20. Lambda, Map, Filter, Reduce

These four tools come from a style of coding called "functional programming," which loves to pass data through functions instead of using traditional `for` loops. In Python, you can use these tools, but honestly, a standard list comprehension (like `[x * 2 for x in items]`) is usually considered more "Pythonic" and easier to read.

But the concept behind these tools is incredibly important for beginners to learn: `map` and `filter` are **higher-order functions**. That scary term just means they are functions that take *another function* as an argument! Realizing that you can pass a function into a variable just like you pass a number into a variable unlocks huge superpowers in Python, like building decorators or making custom sorting rules.

A good rule of thumb: if you are writing the math directly on the spot, use a list comprehension. If you already have a pre-written, named function (like `str.strip`), using `map(str.strip, lines)` is cleaner. Just remember that both `map` and `filter` are lazy iterators (they don't do the work until you ask), so if you want to print the results, you have to wrap them in a `list()` first!

<a id="lambda--anonymous-functions"></a>

### Lambda — Anonymous Functions

A `lambda` is just a tiny, nameless function written on a single line. They are most commonly used to give quick custom sorting instructions to tools like `sort()` or `max()`.

A lambda is a real function, exactly like one made with `def`, but with two big rules: it has no name, and the body can only be a **single expression**. You cannot put statements like assignments (`x = 5`), full `if/else` blocks, or `for` loops inside a lambda. It just calculates one thing and automatically returns the answer.

This limitation is on purpose! Lambdas are meant to be quick, throwaway helpers. For example, if you have a list of dictionaries and want to sort them by age, writing `key=lambda person: person["age"]` right inside the `sort()` command is much faster than writing a whole separate `def get_age()` function. However, you should never assign a lambda to a variable (like `square = lambda x: x * x`). If a function is important enough to need a permanent name, just use a normal `def` — it makes error messages much easier to read when things crash!

```
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

<a id="map--apply-function-to-every-item"></a>

### map() — Apply Function to Every Item

`map(function, list)` runs that function on every single item in the list. It is lazy, so you must wrap it in `list()` to actually see the results. Using a list comprehension is usually easier to read.

```
nums = [1, 2, 3, 4, 5]

squared = list(map(lambda x: x ** 2, nums))
# [1, 4, 9, 16, 25]

# Equivalent list comprehension (preferred in most cases)
squared = [x ** 2 for x in nums]
```

<a id="filter--keep-items-that-match"></a>

### filter() — Keep Items That Match

`filter(function, list)` only keeps items where the function answers `True`. It is exactly the same as writing an `if` statement inside a list comprehension.

```
nums = [1, 2, 3, 4, 5, 6, 7, 8]

evens = list(filter(lambda x: x % 2 == 0, nums))
# [2, 4, 6, 8]

# Equivalent list comprehension
evens = [x for x in nums if x % 2 == 0]
```

<a id="reduce--accumulate-values"></a>

### reduce() — Accumulate Values

`reduce` smashes a whole list of items together into one single answer (like multiplying them all together). If you just want to add things, use the built-in `sum()` tool instead.

It works by keeping a "running total". It takes your function, applies it to the first two items, takes the answer, applies it to the next item, and so on. For example, reducing a list with addition turns `[1, 2, 3, 4]` into `((1+2)+3)+4`. It is usually smart to provide a starting value (like `0` or `1`), because if you try to reduce an empty list without a starting value, the program will crash.

The creator of Python actually removed `reduce` from the main tools because it is notoriously hard to read, and most common tasks already have dedicated, easy-to-read tools: `sum()` for adding, `max()` for finding the biggest, and `math.prod()` for multiplying. You should almost never use `reduce` unless you are doing some highly unusual custom math.

```
from functools import reduce

nums = [1, 2, 3, 4, 5]

total = reduce(lambda acc, x: acc + x, nums)      # 15
product = reduce(lambda acc, x: acc * x, nums)     # 120
maximum = reduce(lambda a, b: a if a > b else b, nums)  # 5

# With initial value
total = reduce(lambda acc, x: acc + x, nums, 100)  # 115
```

<a id="21-args--kwargs"></a>

## 21. *args &**kwargs

The names `args` and `kwargs` are just a popular habit among programmers — the only things that actually matter are the little `*` and `**` stars! These stars allow a function to accept **any number of arguments** instead of a strict, fixed amount.

The trickiest part is that these stars act like a vacuum cleaner or a bomb, depending entirely on where you put them. When you put them in a **function definition** (like `def add(*args):`), they act like a vacuum cleaner: `*args` sucks up all the extra positional arguments into a tuple, and `**kwargs` sucks up all the extra keyword arguments into a dictionary. But when you use them in a **function call** (like `add(*my_list)`), they act like a bomb: `*my_list` explodes the list into separate, individual items before handing them to the function!

Because the "vacuuming" and "exploding" perfectly reverse each other, they are the ultimate tool for passing data through middle-man functions. If you are writing a decorator or an adapter that needs to accept *any* data and just pass it straight through to another function, you just write `def wrapper(*args, **kwargs): return func(*args, **kwargs)`. You don't have to know what the data is; you just vacuum it all up, and immediately explode it all back out!

<a id="args--variable-positional-arguments"></a>

### *args — Variable Positional Arguments

A single `*` parameter sucks up all leftover positional arguments. By the time you use it inside the function, it has turned into a standard `tuple`.

You must place it after all your normal, required arguments. Here's a cool trick: any specific parameters you declare *after* the `*` become **keyword-only** arguments, meaning the person calling the function is forced to write out their names. This is why you sometimes see functions defined with a bare star, like `def save(data, *, force=False)` — it forces people to explicitly type `force=True` instead of just blindly passing `True`! Finally, note that if someone passes zero extra arguments, your `args` variable will just be an empty tuple `()`, never `None`.

```
def add(*args):
    """Accept any number of positional arguments."""
    print(type(args))   # <class 'tuple'>
    return sum(args)

add(1, 2, 3)        # 6
add(1, 2, 3, 4, 5)  # 15
```

<a id="kwargs--variable-keyword-arguments"></a>

### **kwargs — Variable Keyword Arguments

A double `**` parameter sucks up all leftover keyword arguments (like `name="Alice"`) and packs them into a dictionary. You can then use `.items()` to loop through them.

Because it sweeps up absolutely everything left over, it must be the **very last** thing in your function's definition. It only grabs keyword arguments that haven't already been claimed by your other parameters. So if you write `def f(a, **kw)`, and call it with `f(a=1, b=2)`, the `a` goes to its normal spot, and `kw` just becomes a dictionary holding `{"b": 2}`. This is the perfect tool for writing functions that can accept endless optional configuration settings!

```
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

<a id="combining-all-parameter-types"></a>

### Combining All Parameter Types

If you use all of them, they must go in this exact order: normal positional arguments, then `*args`, then keyword-only arguments, and finally `**kwargs` at the very end.

```
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

<a id="spreading--unpacking-into-function-calls"></a>

### Spreading / Unpacking into Function Calls

When you call a function, typing `fn(*my_list)` explodes the list into separate positional arguments, and `fn(**my_dict)` explodes a dictionary into separate keyword arguments. The number of items inside must perfectly match what the function expects, or it will crash.

```
def add(a, b, c):
    return a + b + c

args = [1, 2, 3]
add(*args)           # 6  (unpacks list into positional args)

kwargs = {"a": 1, "b": 2, "c": 3}
add(**kwargs)        # 6  (unpacks dict into keyword args)
```

<a id="22-unpacking--destructuring"></a>

## 22. Unpacking & Destructuring

Unpacking is a beautiful trick that lets you **assign multiple variables at exactly the same time, based on the shape of your data**. Instead of writing two boring lines like `x = point[0]` and `y = point[1]`, you just write `x, y = point`. Python automatically looks at the list on the right, and deals out the values to the variables on the left like a dealer handing out playing cards.

This works on any iterable (tuples, lists, strings, generators). There are only two rules to remember. First, the number of variables on the left must exactly match the number of items on the right, otherwise Python will throw an error. Second, you can use a single `*` variable on the left side (like `first, *rest = my_list`) to greedily scoop up all the "leftover" items into a brand-new list.

Because Python always fully evaluates the right side before assigning anything to the left side, you can swap two variables in a single line: `a, b = b, a`! This exact same trick is what makes loops like `for key, value in d.items()` work so cleanly.

```
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

<a id="23-string-formatting"></a>

## 23. String Formatting

Python has three different ways to inject variables into text, because the language evolved over time: the very old `%` style, the slightly older `str.format()`, and the modern **f-strings** (added in Python 3.6). You should almost exclusively use f-strings in new code.

An f-string is unbelievably fast because Python literally reads the code inside the curly braces `{}` and bakes it into the underlying bytecode before the program even runs. Because of this, you can put literally any valid Python code inside the braces: math like `f"{a + b}"`, function calls like `f"{user.get_name()}"`, or even `if/else` statements!

The secret superpower of f-strings is the mini-language you can trigger by typing a colon `:` inside the braces. This lets you format numbers beautifully:

1. **Alignment:** You can use `<` to push text left, `>` for right, or `^` to center it.
2. **Decimals:** Typing `:.2f` instantly rounds a messy number to exactly two decimal places.
3. **Commas:** Adding `:,` automatically turns `1000000` into the readable `1,000,000`.
4. **Percentages:** Using `:.1%` automatically multiplies by 100 and adds the % sign.
5. **Debugging:** If you add a `!r`, it shows the exact raw text with quotes around it, which is incredibly helpful when debugging invisible spaces or weird characters. An even better trick is typing `f"{my_var=}"`, which prints exactly `my_var=42`!

Two quick warnings: **never** use f-strings to write SQL database queries (it creates a massive security hole called SQL injection), and avoid using them in the standard `logging` module if the log message might be hidden, because it forces the computer to do the math to build the string even when it won't be printed.

```
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

<a id="multi-line-f-strings"></a>

### Multi-line f-strings

If you put multiple string chunks next to each other inside parentheses, Python automatically glues them together. This is the cleanest way to format a massive message without making one insanely long line of code.

```
message = (
    f"Name: {name}\n"
    f"Age:  {age}\n"
    f"Pi:   {pi:.4f}"
)
```

<a id="24-regular-expressions"></a>

## 24. Regular Expressions

A regular expression (regex) is a **tiny, highly specific coding language used just for finding text patterns**. Instead of writing a messy loop to check if a string looks like a phone number, you just write a formula like "three digits, a dash, three digits, a dash, four digits", and the regex engine instantly hunts for it.

Rule number one of Python regex: always put an `r` outside your quotes to make it a **raw string** (like `r"\d+"`). If you forget the `r`, Python's normal string rules will try to read the backslashes first, meaning a `\b` meant to symbolize a "word boundary" gets accidentally turned into the "backspace" keyboard character! This is the #1 cause of broken regexes.

The `re` tool gives you several ways to hunt: `search()` finds the first match anywhere in the text, `match()` only looks at the absolute beginning of the string, and `findall()` returns a list of every match it can find. If you have a massive block of text, use `finditer()`, which is a lazy iterator that hands you the matches one by one without freezing your computer. If you plan to use the exact same pattern in a massive loop, you can use `re.compile()` to pre-load it, though Python is usually smart enough to cache it for you automatically.

Watch out for the "greedy" trap! By default, regex tries to match as much text as physically possible. If you use `.*` to grab everything inside HTML tags like `<.*>`, it won't stop at the first `>`; it will swallow your entire document until it hits the final `>` at the end of the file! You have to add a question mark `<.*?>` to make it lazy so it stops early. Also, remember that regex is basically a very fast text-scanner — you should never, ever use it to parse complex nested things like HTML, JSON, or real code.

```
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

<a id="common-regex-patterns"></a>

### Common Regex Patterns

Regex blocks come in three types: **character classes** say *what* to look for (like a digit or letter), **quantifiers** say *how many* to look for, and **anchors** say *where* to look. Anchors like `^` (start of string) and `\b` (word boundary) are weird because they don't actually consume any characters — they just check if you are standing in the right spot! Finally, wrapping parts of your pattern in parentheses `(...)` creates a "capture group", which lets you extract just that specific part of the text later.

1. The `.` character matches any single character (except a newline).
2. The `\d` character matches any digit, equivalent to `[0-9]`.
3. The `\w` character matches any word character, which includes letters, numbers, and underscores.
4. The `\s` character matches any whitespace, like spaces or tabs.
5. The `\b` character checks for a word boundary to make sure you are at the edge of a word.
6. The `^` and `$` symbols match the very start or the very end of the entire string.
7. The `*` symbol means the previous item can appear 0 or more times.
8. The `+` symbol means the previous item must appear 1 or more times.
9. The `?` symbol means the previous item is optional, appearing 0 or 1 time.
10. The `{n,m}` syntax means the previous item must appear between n and m times.
11. The `[abc]` syntax creates a character class that matches any one of the letters inside it.
12. The `[^abc]` syntax creates a negated class that matches anything *except* the letters inside it.
13. The `(...)` syntax creates a capture group to save a specific part of the match.
14. The `(?:...)` syntax creates a non-capturing group when you need parentheses for grouping but don't want to save the result.
15. The `a|b` syntax is an alternation that matches either "a" or "b".

<a id="25-date--time"></a>

## 25. Date & Time

The `datetime` module has a few different tools, and picking the right one will save you massive headaches: `date` is just a calendar day, `time` is just a clock time, `datetime` is both combined, and `timedelta` is a duration (like "3 hours" or "5 days").

The biggest danger in all of programming is the difference between "naive" and "aware" times. A "naive" time has no idea what time zone it is in. So if it says "2:00 PM", it's meaningless because that happens at totally different moments in Tokyo and New York! An "aware" time has a specific time zone attached. Python will actually throw an error if you try to subtract a naive time from an aware time, to stop you from making a terrible mistake. The golden rule for every programmer is: **save all your times in UTC, and only convert to a local time zone right before you show it to the user.**

You can do basic math with times: a `datetime` minus a `datetime` gives you a `timedelta` (how much time passed between them), and a `datetime` plus a `timedelta` gives you a new future `datetime`.

To convert back and forth to strings, use `strftime` (**f**ormat into a string) and `strptime` (**p**arse from a string), using special `%` codes. However, if you are saving a date for another computer to read, always use `.isoformat()` instead, because it creates a perfectly standard string that is impossible to misunderstand.

```
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

<a id="common-format-codes"></a>

### Common Format Codes

1. Use `%Y` for a 4-digit year, like `2024`.
2. Use `%m` for the month number (01-12), like `06`.
3. Use `%d` for the day of the month (01-31), like `15`.
4. Use `%H` for the hour in a 24-hour clock (00-23), like `14`.
5. Use `%M` for the minute (00-59), like `30`.
6. Use `%S` for the second (00-59), like `00`.
7. Use `%B` for the full month name, like `June`.
8. Use `%A` for the full weekday name, like `Saturday`.
9. Use `%I` for the hour in a 12-hour clock (01-12), like `02`.
10. Use `%p` for the AM/PM label, like `PM`.

<a id="26-collections-module"></a>

## 26. Collections Module

The `collections` module gives you specialized, high-powered versions of standard lists and dictionaries. You don't always need them, but they can delete huge blocks of messy code:

1. **`Counter`** is a dictionary built specifically for counting things. Instead of writing messy `if item not in dict: dict[item] = 1` loops, you just feed it a list and it does all the counting instantly. It even has a handy `most_common(n)` tool.
2. **`defaultdict`** is a dictionary that never crashes with a `KeyError`. When you try to look up a key that doesn't exist, it instantly creates it using a default you provided (like an empty list `[]` or a `0`) and then gives it to you.
3. **`namedtuple`** makes a tiny, lightweight object that acts like a tuple, but lets you use names instead of index numbers (so `point.y` instead of `point[1]`). They use very little memory, but if you want something with default values or methods, you should look at `dataclasses` instead.
4. **`deque`** (pronounced "deck") is a super-charged list that is incredibly fast at adding or removing things from the **front**. A normal Python list is fast at the end, but terribly slow if you try to `insert(0, x)`. A `deque` is lightning fast at both ends!
5. **`ChainMap`** takes a bunch of different dictionaries and glues them together into one giant "virtual" dictionary without actually copying any data. This is perfect for reading application settings where you want to check command-line flags first, then an environment file, then default settings.

You might also see `OrderedDict` in older code, but standard Python dictionaries actually remember the order you put things in now, so it is rarely needed anymore.

```
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

<a id="27-dataclasses"></a>

## 27. Dataclasses

The `@dataclass` decorator is a **code-writing robot**. You just tell it what variables your class should have, and it instantly writes all the boring background code for you (like the `__init__`, `__repr__`, and `__eq__` methods). A class that would normally take thirty lines of messy code to write properly shrinks down to just five lines!

The catch is that you **must** use type hints (like `name: str`) for it to work. If you forget the type hint and just write `name = "Alice"`, the robot completely ignores it. Note that Python still doesn't strictly enforce these types while the program is running; the dataclass just uses them as a checklist of what fields to create.

You can also give the robot special instructions:

1. **`field(default_factory=list)`:** Use this when you want a default list or dictionary. If you just type `[]`, Python will accidentally share that same exact list with every single object you create! The factory makes sure every object gets its own fresh, empty list.
2. **`frozen=True`:** This locks the object so no one can ever change its values after it is created. As a bonus, it makes the object hashable, meaning you can now use it as a dictionary key!
3. **`order=True`:** This automatically creates the math for less-than and greater-than (`<`, `>`) comparisons. It compares fields in the exact order you wrote them.
4. **`__post_init__`:** If you need to do extra math or setup right *after* the object is created (like calculating a rectangle's area from its width and height), put that code in this special method.
5. **`slots=True`:** In newer Python versions, this tells the computer to pack the object as tightly as possible in memory, making it run much faster.

Rule of thumb: use a dataclass when you are mostly storing data, use a `NamedTuple` when you want something totally unchangeable, and use a regular old class if you are writing a lot of complex behavior and logic.

```
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

<a id="28-enums"></a>

## 28. Enums

An enum (short for enumeration) is a way to turn a bunch of related choices into a strict, official list. Imagine you track user status with a string like `status = "active"`. If you make a typo and write `status = "actve"`, your code won't complain, but it will break later! But if you use an enum like `status = Status.ACTIVE`, a typo instantly crashes the program to warn you. It changes your code from "accept any random string" to "only accept these specific, approved options."

Behind the scenes, `Color.RED` is a unique, one-of-a-kind object. That's why you can safely use the `is` keyword to check it (`if color is Color.RED:`). It also makes them perfect for using in `match/case` statements.

A standard `Enum` is very strict: it refuses to pretend it is a number, so `Color.RED == 1` is always False. But sometimes you *do* want them to act like numbers (for example, web status codes like 404). For that, you can use `IntEnum`, which acts just like a regular integer. If you don't actually care what the underlying value is at all, you can just type `auto()` and Python will assign numbers for you automatically.

```
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

<a id="29-async--await-asyncio"></a>

## 29. Async / Await (Asyncio)

Async solves one massive problem: **waiting for things on the internet**. If you try to download 100 webpages using a normal `for` loop, your computer downloads the first one, then sits totally frozen, doing nothing at all while it waits for the data to arrive. Then it does the second one. Async lets you start all 100 downloads at the exact same time, and as soon as any of them finish, your code jumps over to handle it!

The system is basically an "event loop" that juggles multiple tasks on a single thread. It picks up a task, runs it until the task says "I need to wait for a network response", and instead of freezing, the loop sets that task down and picks up another one.

1. **It doesn't speed up math.** Because async only uses one brain (core) of your computer, it doesn't make CPU-heavy tasks like image processing any faster. It is *only* for things that involve waiting (like network requests or reading massive files).
2. **One bad apple spoils the bunch.** If you accidentally use a normal, "blocking" tool like `time.sleep()` or a regular `requests.get()` inside async code, the event loop stops completely. You must use special async versions of libraries for everything.

To use async, you add the word `async` in front of your function (`async def`). Inside that function, whenever you want to do something that takes time, you type `await` before it. The word `await` is a signal saying "I am pausing this function, go do other work until my data gets here!" Finally, you kick off the whole process by using `asyncio.run()`.

To actually run multiple things at once, you can't just await them one by one. You use `asyncio.gather()` or `asyncio.TaskGroup()` to bundle a bunch of tasks together and launch them all simultaneously.

**Figure 29.1: Python Asyncio Event Loop & Coroutine Scheduling — ASYNCIO ENGINE**

*Python Asyncio event loop architecture: Coroutines execute cooperatively on a single thread until an await expression suspends their generator frame and registers their file descriptor with the OS kernel (epoll / kqueue). Upon I/O readiness, the task is re-enqueued onto the runnable loop.*

*Diagram labels:* ASYNCIO READY QUEUE · Task-1: fetch_data() · Active coroutine frame · Task-2: process_order() · Runnable • Scheduled · Task-3: write_audit() · Runnable • Scheduled · ✓ Single OS Thread (0 Locks) · ASYNCIO EVENT LOOP · coro.send(None) Execution · Runs python bytecode synchronously until: · await sock.recv() → Yields control! · Future & Suspension Handler · Freezes coroutine frame in memory · Registers socket FD with OS selector · Loop immediately picks next ready task! · 100,000+ coroutines multiplexed on 1 CPU thread · OS SELECTOR (epoll / kqueue) · Socket FD: 14 (api.example.com) · EPOLLIN • Waiting for packets · Timer FD: sleep(2.0s) · timerfd_create • 0.82s left · ✓ Kernel Hardware Wait · Zero CPU wasted polling · • Cooperative Multitasking Flow: · When the kernel signals an FD is readable via epoll_wait(), the Event Loop wakes the Future, restores the coroutine frame, · and re-enqueues it on the Ready Queue — achieving high-throughput concurrency with minimal memory overhead.

```
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

<a id="async-iterators--context-managers"></a>

### Async Iterators & Context Managers

Sometimes you need to loop through data that is arriving slowly over the network. You can use `async for` to loop over the data, which tells Python to pause and work on other tasks while waiting for the next piece of data to arrive. Similarly, `async with` lets you connect to a database or server, pausing while the connection actually happens.

A great example is fetching a paginated API (where you have to download page 1, then page 2, then page 3). With an async generator, you can yield Page 1 as soon as it arrives, process it, and then yield Page 2 when it arrives, all without freezing your entire application.

```
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

<a id="30-concurrency-threading--multiprocessing"></a>

## 30. Concurrency: Threading & Multiprocessing

First, we need to clear up two words: **concurrency** and **parallelism**. Concurrency is like one chef cooking three meals at once by running back and forth between stoves. Parallelism is like having three chefs cooking three meals at exactly the same time. Async and Threads are like the single fast chef (concurrency), while Multiprocessing gives you multiple chefs (parallelism).

Why doesn't Python just use multiple chefs all the time? Because of a built-in safety rule called the **GIL** (Global Interpreter Lock). The GIL is like a talking stick — only the thread holding the stick is allowed to run Python code. Python uses this because it is an incredibly safe and easy way to manage computer memory, but it means that even if you have 8 computer cores, multiple threads will just patiently wait in line, passing the stick back and forth.

However, threads are incredibly smart about one thing: **waiting**. If a thread needs to wait to download a file, it immediately hands the talking stick to another thread! That's why threads are amazing for network downloads (I/O-bound tasks).

So the golden rule is: **If you are waiting for data, use Async or Threads. If you are doing heavy math or processing, use Processes.**

**Figure 30.1: Python Concurrency: Threading (GIL) vs Multiprocessing vs Asyncio — CONCURRENCY ARCHITECTURE**

*Python Concurrency Tradeoffs: Threading shares memory under the GIL; Multiprocessing bypasses the GIL by launching independent OS processes; Asyncio cooperatively multiplexes thousands of I/O tasks on a single OS thread.*

*Diagram labels:* PARADIGM COMPARISON: MEMORY FOOTPRINT • CPU PARALLELISM • SCHEDULING · 1. THREADING (GIL BOUND) · 1 Process • 1 Memory Heap · Threads share state • Race conditions! · GIL BOTTLENECK (MUTEX) · 1 active thread running bytecode at a time · ✓ Great for: I/O (Sockets, Disks) · ✗ Bad for: CPU math (GIL contention) · Requires: threading.Lock / RLock · 2. MULTIPROCESSING · N Processes • N Distinct GILs · Complete memory isolation per process · TRUE MULTI-CORE PARALLELISM · 100% CPU utilization across all cores · ✓ Great for: CPU math & ML · ✗ High RAM & process spawn cost · IPC: Queues / Pipes (Pickle) · 3. ASYNCIO (EVENT LOOP) · 1 Process • 1 Thread • Loop · Cooperative multitasking via await · SINGLE-THREAD MULTIPLEXING · epoll/kqueue kernel hardware interrupts · ✓ 100,000+ connections per GB RAM · ✗ Blocked if code does sync CPU work · Zero locks: synchronous interleaving · • Architecture Decision Rule: · Asyncio: High-concurrency I/O • Threading: I/O with blocking C-libs • Multiprocessing: CPU-heavy · Tip: Use ProcessPoolExecutor to bypass the GIL for heavy numerical compute

<a id="threading--for-io-bound-tasks"></a>

### Threading — For I/O-bound Tasks

Use a `Thread` when you need to run background tasks that spend a lot of time waiting on the network or the hard drive.

Because all threads share the same memory, they can accidentally trip over each other. Imagine if two threads try to do `counter += 1` at the exact same millisecond. They might both read `5`, both add `1`, and both save `6` — accidentally erasing one of the counts! This is called a **race condition**. To stop it, you create a `Lock`.

You use a lock by writing `with lock:` before the dangerous code. This acts like a bathroom door: one thread goes in and locks it, and all the other threads must wait patiently outside until it finishes and unlocks the door. Always make the code inside the lock as small as possible, or you will slow down your entire program!

```
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

<a id="threadpoolexecutor--higher-level-api"></a>

### ThreadPoolExecutor — Higher-level API

Usually, creating threads manually is messy. Instead, use a `ThreadPoolExecutor`, which is like a manager who hires a specific number of workers for you.

You tell the manager "Here is a list of 10,000 URLs to download, but only hire 4 workers." The manager will start 4 workers, hand them the first 4 URLs, and as soon as one finishes, it hands that worker the next URL. This prevents you from accidentally starting 10,000 threads and crashing your computer.

When you give the manager a task using `submit()`, it hands you back a "future" — a little tracking ticket for data that doesn't exist yet. You can use `as_completed()` to grab the finished data the exact second each worker finishes, which means you don't have to wait for the slow downloads to finish before looking at the fast downloads.

The best part? If you realize your tasks are actually CPU-heavy, you can literally just change the word `ThreadPoolExecutor` to `ProcessPoolExecutor` and Python will magically switch from using threads to using full processes!

```
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

<a id="multiprocessing--for-cpu-bound-tasks"></a>

### Multiprocessing — For CPU-bound Tasks

When you have heavy math to do, you need to completely bypass the Python GIL. You do this by starting entirely new Python programs running in the background, called "processes."

Each process gets its very own GIL, so a 4-core computer can run 4 tasks at exactly the same time. The catch? Because they are totally separate programs, they do not share any memory. If the main program wants to give a background process a list, it has to pack the list into a text string ("pickling"), send it through a tube to the background process, and the background process has to unpack it. This takes a lot of time!

Because of this packing and unpacking time, you should only use Multiprocessing when the background task takes a long time to run. If the task takes 0.001 seconds, the time spent packing and unpacking the data will actually make your program *slower* than if you just did it normally.

```
from multiprocessing import Pool

def square(n):
    return n ** 2

# Process pool
with Pool(processes=4) as pool:
    results = pool.map(square, range(10))
    print(results)   # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

<a id="when-to-use-what"></a>

### When to Use What

1. **Network Downloads:** You should use `asyncio` or `threading` because you are mostly just waiting for data.
2. **Reading/Writing Files:** You should use `threading` since you are mostly waiting on the hard drive.
3. **Heavy Math / Image Processing:** You should use `multiprocessing` because you actually need multiple CPU cores.
4. **Simple, fast scripts:** You should use `asyncio` if possible, because it has no race conditions to worry about.

> **The GIL (Global Interpreter Lock):** Python threads can't run Python code truly in parallel (only one thread executes Python bytecode at a time). For CPU-bound work, use `multiprocessing` to spin up separate processes.

<a id="31-virtual-environments--dependency-management"></a>

## 31. Virtual Environments & Dependency Management

<a id="why-virtual-environments"></a>

### Why Virtual Environments?

A virtual environment makes sure every single project you build gets its own completely isolated, private set of dependencies.

Imagine if your computer only had one global folder for Python packages. Project A needs Django version 3, but Project B needs Django version 4. If you install Django 4 for Project B, you instantly break Project A! Worse, your Mac or Linux operating system relies on its own hidden Python packages to function, and if you accidentally overwrite them, you can break your entire computer.

A virtual environment fixes this. It is literally just a hidden folder (usually called `.venv`) inside your project directory. It holds a totally private copy of Python and a private folder for downloaded packages. When you "activate" the environment, your computer temporarily promises to only use the Python inside that specific folder. The golden rule is: **one virtual environment per project, and never share them.**

<a id="venv-built-in"></a>

### venv (Built-in)

To use the standard tool built directly into Python, open your terminal and type `python -m venv .venv`. This creates the hidden folder. Then, you must "activate" it so your terminal knows to use it instead of the system Python.

```
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

<a id="uv-fast-environment-and-package-manager"></a>

### uv (Fast Environment and Package Manager)

`uv` is an incredibly fast, modern tool written in Rust. It does everything the normal `venv` tool does, but it runs almost instantly and handles creating environments and installing packages all at once.

Once you install `uv` on your computer, you can use it to build environments like this:

```
# Install uv (choose one)
curl -LsSf https://astral.sh/uv/install.sh | sh
brew install uv                    # macOS alternative

# Create and activate an environment
uv venv .venv
source .venv/bin/activate           # macOS/Linux
# .venv\\Scripts\\activate          # Windows

# Install packages into the environment
uv pip install requests flask

# Install an existing requirements file
uv pip install -r requirements.txt

# Resolve and lock declared dependencies from pyproject.toml
uv lock
uv sync
```

The coolest part about `uv` is how it perfectly freezes your project. When you run `uv lock`, it writes down the exact, to-the-millisecond version of every package your project uses. If a teammate clones your project a year later, `uv sync` will install those exact same versions, guaranteeing the code will run flawlessly for them too.

<a id="pip--package-manager"></a>

### pip — Package Manager

`pip` is the classic Python tool for downloading packages from the internet (specifically from a giant database called PyPI). You should always save a list of your packages in a `requirements.txt` file so others can install them easily.

When you write your requirements, you usually just ask for general things like "requests". But when `pip` actually installs things, it installs dozens of hidden background packages that "requests" needs to run. If you type `pip freeze`, it prints out the massive, exact list of every single package and its exact version number. This exact list is called a "lock file", and it is highly recommended to save this list so you can replicate your server perfectly later.

One warning: anyone can upload code to PyPI. If you want to install a package called `requests` but you accidentally type `pip install requsts`, you might download a malicious virus uploaded by a hacker hoping someone would make a typo! Always double-check your spelling.

```
pip install package_name           # latest version
pip install package_name==1.2.3    # specific version
pip install package_name>=1.2      # minimum version
pip install -U package_name        # upgrade
pip uninstall package_name
pip list                            # installed packages
pip show package_name              # package info
```

<a id="pyprojecttoml-modern-standard"></a>

### pyproject.toml (Modern Standard)

A `pyproject.toml` file is the modern, standard way to describe your project to the world.

In the old days, a Python project would have five different configuration files scattered everywhere. Now, almost everything lives in this one file. The `[project]` section acts like a nametag: it lists your project's name, version, and the packages it needs to run. The `[build-system]` section tells tools like `pip` exactly how to bundle your code up so others can install it.

Because it is the new gold standard, almost all modern Python tools (like code formatters and test runners) will look inside this file for their settings, keeping your project incredibly clean and organized.

```
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

<a id="other-tools-worth-knowing"></a>

### Other Tools Worth Knowing

- **`uv`** is an extremely fast package manager and virtual environment tool written in Rust.
- **`poetry`** is a popular tool for dependency management and publishing packages.
- **`conda`** is a package manager popular in data science, and it can also manage different versions of Python itself.

<a id="32-testing"></a>

## 32. Testing

A test is just a small script that runs your code and double-checks that the output is correct. You don't write tests to prove your code works today; you write tests to **make sure you don't accidentally break it tomorrow**! A good test suite lets you change a huge part of your application and instantly know if you broke anything, without having to click around your app manually.

Most good tests follow a three-step pattern called **Arrange–Act–Assert**. First, you set up the fake data (Arrange). Second, you run the single function you want to test (Act). Third, you check if the result matches what you expected (Assert). You should only have one logical check per test, so if it fails, you know exactly what went wrong.

Good tests must have three qualities. They must be **isolated**, meaning they don't depend on each other and don't talk to a real external database. They must be **fast**, because if your tests take 20 minutes to run, you will stop running them. Finally, they must be **deterministic**, meaning they never fail randomly. If a test randomly fails even when the code is fine, developers will just start ignoring it.

The most important things to test are edge cases (like what happens if someone passes an empty list?), error handling, and any bug you have ever had to fix in the past. You should only test the **public interface** (the main functions people actually use), rather than the tiny helper functions hidden inside, so you are free to change how the helper functions work without breaking all your tests.

<a id="unittest-built-in"></a>

### unittest (Built-in)

To use the built-in `unittest` framework, you must subclass `TestCase`, start all your test method names with `test_`, and check your results using built-in methods like `self.assertEqual`. You can run all your tests from the terminal by typing `python -m unittest`.

This tool is based on an old Java testing framework, which is why it uses so many classes and camelCase method names. The biggest advantage is that it comes pre-installed with Python, so you don't need to download anything. To keep tests totally isolated, Python actually builds a brand-new instance of your test class for every single test, and it automatically runs your `setUp()` and `tearDown()` methods before and after each one.

```
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

<a id="pytest-recommended--install-with-pip-install-pytest"></a>

### pytest (Recommended — install with `pip install pytest`)

With `pytest`, a plain `assert` statement is all you need to check results. You simply name your files starting with `test_`, and `pytest` will automatically find and run them, printing out beautifully readable error messages if anything fails.

The best feature of `pytest` is that you don't have to memorize a hundred different assertion methods like `assertEqual` or `assertTrue`. You just write normal Python math like `assert a == b`, and if it fails, `pytest` does some deep magic to print out the exact values of both variables so you can see why they didn't match.

There are two huge superpowers in `pytest`. The first is **fixtures**, which let you automatically hand data to your tests just by putting a variable name in the test function's arguments. The second is **parametrization**, which lets you write a single test, give it a list of ten different inputs and expected outputs, and `pytest` will automatically run it ten separate times and report on each one individually.

```
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

```
# Run tests
pytest                     # discover and run all tests
pytest -v                  # verbose output
pytest test_math.py        # specific file
pytest -k "test_add"       # run tests matching pattern
pytest --tb=short          # shorter tracebacks
```

<a id="33-useful-standard-library-modules"></a>

## 33. Useful Standard Library Modules

Python's "batteries included" philosophy means that a massive amount of incredibly useful code is already installed on your computer. It is a vital skill to know what is already built-in, because every time you use a built-in tool instead of downloading a package from the internet, you avoid potential version conflicts, security risks, and download time.

Here is a short guide to the most important built-in modules and what they are actually used for:

1. **`os` / `sys`** — These let you talk to your operating system. You use `os.environ` to read secure passwords from the server, and `sys.argv` to read commands typed into the terminal. If you need to work with file paths, though, you should always use `pathlib` instead of `os.path`.
2. **`math`** — This gives you access to fast math functions like square roots. It is very useful for its `math.isclose()` function, because checking if two decimals are exactly equal with `==` often fails due to tiny computer rounding errors.
3. **`random`** — This lets you pick random numbers or shuffle lists. However, it is **not cryptographically secure**. If you are generating a password or a security token, you must use the `secrets` module instead, or hackers can guess the numbers!
4. **`itertools`** — This provides a toolkit for looping over data in clever ways without loading everything into memory at once. It has tools to chain lists together, slice through them, group them, and even generate every possible combination of items.
5. **`functools`** — This provides tools for modifying functions. The coolest one is `@lru_cache`, which you put on top of a function to instantly memorize its answers. If you ask the function the exact same question twice, it just gives you the memorized answer instantly instead of doing the math again!
6. **`hashlib`** — This lets you generate digital fingerprints (hashes) for files to make sure they haven't been tampered with. It is *not* meant for saving user passwords — for passwords, you need to download a slow, specialized tool like `bcrypt`.
7. **`logging`** — This is the professional replacement for the `print` command. It lets you tag messages with severity levels (like "INFO" or "ERROR"), and makes it easy to route all your errors into a text file instead of just dumping them on the screen.
8. **`subprocess`** — This allows Python to run other terminal programs. You must always pass your commands as a list of strings, never as one giant string, to prevent hackers from tricking your program into running dangerous commands.

```
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

<a id="34-pythonic-idioms--best-practices"></a>

## 34. Pythonic Idioms & Best Practices

When Python programmers say code is "Pythonic", they do not mean it is extremely clever or short. They mean the code solves a problem exactly the way the Python language was designed to solve it. Code that isn't Pythonic will usually still run, but it will be slower, longer, and much harder for other people to read.

The rules below all boil down to a few core ideas. You should use built-in looping tools instead of doing math to find the right index. You should let objects clean up after themselves by using `with` blocks. You should use tools like `any` or `all` to make your code read like plain English. And finally, you should use standard tools like `black` or `ruff` to automatically format your code, so you never have to waste time arguing about spaces or tabs!

<a id="the-zen-of-python"></a>

### The Zen of Python

If you type `import this` in your terminal, Python will print out 19 poetic rules known as the Zen of Python. These are meant to be a rough guide for good taste, not strict laws you must always follow.

Many of these rules actually contradict each other! For example, "simple is better than complex" is immediately followed by "complex is better than complicated." The most famous and important rule is "there should be one— and preferably only one —obvious way to do it", which explains why Python programmers all tend to solve common problems in the exact same way.

```
import this    # prints the Zen of Python
```

The core philosophy is: *Beautiful is better than ugly. Simple is better than complex. Readability counts.*

<a id="common-idioms"></a>

### Common Idioms

Here are several extremely common patterns that you will see in almost every professional Python codebase.

```
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

<a id="pep-8--style-guide-highlights"></a>

### PEP 8 — Style Guide Highlights

PEP 8 is the official style guide for Python code. The most important thing about PEP 8 is not that its rules are perfect, but that **everyone uses them**. Because everyone uses the same rules, you can look at a stranger's code and instantly understand it. Remember, consistency is more important than personal preference!

There are two naming rules that actually change how your code works. If you start a variable with a single underscore (like `_secret`), you are telling other programmers "please don't use this, it's private." But it is just a polite request; Python won't actually stop them. If you start a variable with a double underscore (like `__super_secret`), Python actually mangles the name in memory to make it harder to accidentally overwrite when subclassing (though a determined hacker can still access it).

Honestly, you shouldn't memorize these rules. Just use a free tool like `black` or `ruff format` and it will automatically fix your spacing and capitalization every time you save your file.

1. You should use `snake_case` for all function and variable names (e.g., `my_function()`).
2. You should use `PascalCase` for all class names (e.g., `MyClass`).
3. You should use `UPPER_CASE` for all constants that never change (e.g., `MAX_RETRIES = 3`).
4. You must always use 4 spaces for indentation, and you should never use tabs.
5. You should try to keep your lines of code shorter than 79 to 120 characters so they fit on a screen.
6. You should use a single leading underscore for internal, private attributes (e.g., `self._internal_state`).
7. You should use a double leading underscore when you specifically need name mangling (e.g., `self.__really_private`).

<a id="common-gotchas"></a>

### Common Gotchas

There are a few classic traps in Python that catch almost every beginner. Learning them now will save you hours of debugging later.

All of these traps happen because Python tries to be extremely efficient with computer memory. Usually this is great, but sometimes it leads to very surprising results!

1. **Mutable defaults:** If you use a list as a default argument (like `def bad(lst=[]):`), Python only creates that list once when the program starts. That means every single time you call the function, it accidentally shares the exact same list! Always use `None` instead.
2. **Late-binding closures:** If you create a bunch of lambda functions inside a `for` loop, they don't lock in the loop's variable immediately. By the time they actually run, the loop has already finished, so every single lambda will use the very last number from the loop.
3. **Modifying while iterating:** Never delete items from a list while you are looping through it! Because a list is just a numbered line of items, deleting item #2 makes item #3 slide down into its spot. The loop will then completely skip over it. Instead, just build a brand new list.
4. **Integer caching:** Python tries to save memory by reusing small numbers (from -5 to 256). Because of this trick, `256 is 256` might be True, but `257 is 257` might be False! This is why you must **never** use `is` to compare numbers; always use `==`.
5. **Shallow versus deep copy:** When you copy a list full of dictionaries using `.copy()`, Python only copies the outer list. Both lists are still sharing the exact same dictionaries inside! If you want a truly independent copy, you must use `copy.deepcopy()` (but beware, it is very slow).

```
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

<a id="35-whats-next"></a>

## 35. What's Next?

This table maps out your next learning steps based on what you want to build. You can use it to choose the exact tools and frameworks you need to reach your specific programming goals!

| Goal | Libraries / Frameworks to Learn |
| --- | --- |
| **Web Development** | Flask, Django, FastAPI |
| **API Development** | FastAPI, Flask-RESTful |
| **Data Science** | NumPy, Pandas, Matplotlib, Jupyter |
| **Machine Learning** | scikit-learn, TensorFlow, PyTorch |
| **Automation** | Selenium, Beautiful Soup, Scrapy |
| **CLI Tools** | Click, Typer, argparse |
| **Desktop Apps** | Tkinter, PyQt, Kivy |
| **Game Development** | Pygame |
| **DevOps / Scripting** | Fabric, Invoke, subprocess |

<a id="resources"></a>

### Resources

- 📚 Browse all languages in the [Language Courses catalog](../programming-languages.html).
- 📖 You can read the [Official Python Docs](https://docs.python.org/3/) for the ultimate source of truth.
- 📖 You can visit [Real Python](https://realpython.com/) for fantastic, in-depth tutorials on almost every topic.
- 🧠 You can try [Project Euler](https://projecteuler.net/) for fun math and programming challenges to test your skills.

> *"Python is a language that lets you work quickly and integrate systems more effectively."* — python.org

---

TechToday Python Study Library
