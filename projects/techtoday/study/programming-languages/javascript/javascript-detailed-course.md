<!--
Source: javascript-detailed-course.html
Title: JavaScript Detailed Course | TechToday
Description: A complete JavaScript course from first principles — engines and runtimes, types and coercion, scope and closures, prototypes and classes, iterators and generators, the event loop, promises, modules, memory, regular expressions, the DOM, Node and tooling.
Theme-color: #0b0d10
Stylesheets: javascript-study.css, ../../../site-header.css
Scripts: javascript-study.js
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="javascript-detailed-course"></a>

# JavaScript

The whole language, section by section, each one depending only on the ones before it. This is the reference course: not just what a feature does, but what problem it was added to solve, how the engine implements it, and where it goes wrong. Press **Play** on any animation to watch a mechanism run step by step, and use the language tabs to compare JavaScript with Python where the contrast is instructive.

> **Key idea**
>
> New to the language, or here to fill gaps quickly? Start with the [JavaScript Crash Course](javascript-crash-course.html) — it covers the dozen ideas you touch weekly, in about a tenth of the reading. Come back here for the parts it deliberately skips: property descriptors, symbols, iterators, the memory model, regular expressions and the details of the runtimes.

<a id="table-of-contents"></a>

## Table of Contents

1. [What JavaScript Is — Engines, Runtimes & ECMAScript](#1-what-javascript-is)
2. [Running JavaScript — Scripts, Modules & Strict Mode](#2-running-javascript)
3. [Syntax, Statements & Automatic Semicolon Insertion](#3-syntax-and-asi)
4. [Primitive Types & `typeof`](#4-primitive-types)
5. [Numbers, BigInt & Floating Point](#5-numbers)
6. [Strings & Template Literals](#6-strings)
7. [Truthiness, Coercion & the Two Equalities](#7-coercion)
8. [Variables — `var`, `let`, `const` & the TDZ](#8-variables)
9. [Operators & Short-Circuit Evaluation](#9-operators)
10. [Control Flow & Loops](#10-control-flow)
11. [Functions — Declarations, Expressions & Arrows](#11-functions)
12. [Parameters, Defaults, Rest & Spread](#12-parameters)
13. [Scope & the Scope Chain](#13-scope)
14. [Closures](#14-closures)
15. [`this` — the Four Binding Rules](#15-this)
16. [Objects & Property Descriptors](#16-objects)
17. [Prototypes & the Prototype Chain](#17-prototypes)
18. [Classes, Inheritance & Private Fields](#18-classes)
19. [Arrays & the Iteration Methods](#19-arrays)
20. [Destructuring](#20-destructuring)
21. [Map, Set, WeakMap & WeakSet](#21-collections)
22. [Symbols & Well-Known Symbols](#22-symbols)
23. [Iterators & Generators](#23-iterators)
24. [Errors & Exception Handling](#24-errors)
25. [The Call Stack & Execution Contexts](#25-call-stack)
26. [The Event Loop — Tasks & Microtasks](#26-event-loop)
27. [Callbacks & Inversion of Control](#27-callbacks)
28. [Promises in Depth](#28-promises)
29. [`async` / `await`](#29-async-await)
30. [Concurrency Patterns & Async Iteration](#30-concurrency)
31. [Modules — ESM vs CommonJS](#31-modules)
32. [Memory, Garbage Collection & Leaks](#32-memory)
33. [Copying & Immutability](#33-copying)
34. [Regular Expressions](#34-regex)
35. [Dates, JSON & Intl](#35-dates-json-intl)
36. [The DOM & the Browser Event Model](#36-dom)
37. [Fetch, HTTP & AbortController](#37-fetch)
38. [Node.js Essentials](#38-node)
39. [Tooling — npm, Bundlers & Types](#39-tooling)
40. [Performance Patterns & Pitfalls](#40-performance)
41. [Cheat Sheet](#41-cheat-sheet)
42. [Pattern-Recognition Playbook](#42-playbook)
43. [Practice Roadmap](#43-roadmap)

<a id="unit-1"></a>

## Unit 1 — Getting Started

What JavaScript is, where it runs, and how the parser reads your code.

<a id="1-what-javascript-is"></a>

## 1. What JavaScript Is — Engines, Runtimes & ECMAScript

JavaScript was written in ten days in May 1995 by Brendan Eich at Netscape, to add small interactive touches to web pages. It was named after Java for marketing reasons and resembles it almost not at all; its real ancestors are Scheme (first-class functions, closures), Self (prototypes rather than classes) and Java (only the surface syntax). Understanding that lineage explains the language's strange combination of a very good core — functions as values, closures, objects as open maps — with a set of early mistakes that can never be removed because the web must not break.

Three words get used interchangeably and should not be:

- **ECMAScript** — The *specification*, maintained by TC39 and published annually (ES2015 through ES2026). It defines syntax, semantics and the standard library — objects, functions, promises, `Math`, `JSON`. It defines nothing about I/O.
- **Engine** — An implementation: V8 (Chrome, Edge, Node, Deno), SpiderMonkey (Firefox), JavaScriptCore (Safari, Bun). It parses, compiles and executes, and manages the heap and garbage collector.
- **Runtime / host** — The environment wrapped around the engine, supplying everything the spec does not: `document`, `fetch`, `setTimeout` and the event loop in a browser; `fs`, `http`, `process` in Node.

This is why `setTimeout` is not in the ECMAScript specification at all, why `console.log` is not either, and why identical language code behaves differently in a browser and in Node. When something is missing, the first question is always: *is that a language feature or a host feature?*

<a id="1-1-how-the-engine-executes"></a>

### How the engine actually executes your code

JavaScript is often described as "interpreted", which has not been true for over a decade. V8 uses a **tiered JIT**: your source is parsed to an AST, compiled to bytecode by an interpreter called Ignition, and executed. While it runs, V8 records which functions are hot and what types they receive. Hot functions are recompiled by the optimising compiler (TurboFan) into machine code that *assumes* those types keep arriving. If an assumption is later violated, the optimised code is discarded and execution falls back to bytecode — a **deoptimisation**.

```text
source ──▶ parser ──▶ AST ──▶ Ignition ──▶ bytecode ──▶ execute
                │
                profiling: types + call counts
                │ function is "hot"
                ▼
                TurboFan: optimised machine code
                │ a type assumption breaks
                ▼
                deoptimise, back to bytecode

                Hidden classes: V8 gives every object a shape descriptor.
                { x: 1, y: 2 } and { x: 3, y: 4 } → SAME hidden class → fast property access
                { x: 1, y: 2 } and { y: 4, x: 3 } → DIFFERENT (key order) → slower
                adding a property later → transitions to a new hidden class
```

Two practical consequences follow, and they are the only "performance advice" in this course that is about the engine rather than about algorithms. First, **construct objects with the same properties in the same order**, so they share a hidden class and property access stays a fixed offset lookup. Second, **keep function parameters monomorphic** — a function that is sometimes called with numbers and sometimes with strings cannot be specialised. Neither matters until you are in a hot loop, and neither should distort ordinary code.

> **Tip**
>
> Everything in this section is observable. In Chrome, `node --allow-natives-syntax` exposes `%GetOptimizationStatus(fn)`, and the Performance panel shows deoptimisation events. Reach for them only when a profile already points at a specific function; guessing about JIT behaviour is a reliable way to waste an afternoon.

<a id="2-running-javascript"></a>

## 2. Running JavaScript — Scripts, Modules & Strict Mode

The same source text can be evaluated in three different ways, and they differ in scoping, strictness and timing. Knowing which one you are in resolves a surprising number of "why is this undefined" questions.

| Mode | Top-level scope | Strict? | Timing |
| --- | --- | --- | --- |
| `<script>` (classic) | Global — `var` lands on `window` | No, unless `'use strict'` | Parsed and run immediately, blocking the parser |
| `<script defer>` | Global | No | Downloaded in parallel, run in order after parsing |
| `<script type="module">` | Module — nothing leaks out | **Always** | Deferred by default; `import`s resolved first |
| Node CommonJS (`.cjs`) | Module wrapper function | No | `require` executes synchronously |
| Node ESM (`.mjs` / `"type": "module"`) | Module | **Always** | Graph linked, then evaluated; top-level `await` allowed |

<a id="2-1-strict-mode"></a>

### Strict mode

Strict mode was introduced in ES5 as an opt-in that turns a set of silent failures into errors. Modules and class bodies are strict automatically, so most modern code never writes the directive — but you should know what it changes, because reading old code without it is confusing.

**What strict mode changes**

```javascript
'use strict';   // must be the FIRST statement of a file or function

undeclared = 5;        // sloppy: creates a global. strict: ReferenceError

function f() { return this; }
f();                   // sloppy: globalThis. strict: undefined

const frozen = Object.freeze({ a: 1 });
frozen.a = 2;          // sloppy: silently ignored. strict: TypeError

function dup(a, a) {}  // sloppy: allowed. strict: SyntaxError
delete Object.prototype; // strict: TypeError instead of returning false

// octal literals, `with`, and arguments/eval aliasing are all banned
```

```python
# Python has no equivalent switch because it never had the lax behaviour:
undeclared = 5      # always creates a name in the CURRENT scope, never global

def f():
    return self    # NameError - there is no implicit receiver at all

# Assigning to a name inside a function always makes it local unless you
# declare `global` or `nonlocal`. JavaScript's strict mode is essentially
# retrofitting that discipline onto a language that shipped without it.
```

> **Warning**
>
> The one thing strict mode does *not* fix is that a classic `<script>` shares one global scope with every other classic script on the page. Two files both declaring `const config` at top level throw a redeclaration error. Use `type="module"` and the problem disappears entirely — each file gets its own scope.

<a id="3-syntax-and-asi"></a>

## 3. Syntax, Statements & Automatic Semicolon Insertion

JavaScript's grammar is C-like: statements end in semicolons, blocks use braces, and expressions can appear almost anywhere. The one genuinely surprising rule is **automatic semicolon insertion** — the parser will insert a semicolon for you when a line break makes the program otherwise invalid. This mostly works, which is why "semicolons are optional" is half true, and it fails in a small number of cases that produce baffling errors.

**The ASI cases that actually bite**

```javascript
// 1. return with a value on the next line - the classic
function bad() {
  return
    { ok: true };     // ASI inserts a semicolon after `return`
}
bad();                // undefined, and the object literal is dead code

// 2. a line starting with ( or [ continues the previous line
const a = value
(function () {})()    // parsed as value(function(){})()  -> TypeError

const b = list
[0].forEach(fn)       // parsed as list[0].forEach(fn)

// the defensive habit if you omit semicolons: prefix the line
;[1, 2, 3].forEach(fn)

// 3. ++ / -- never attach across a newline
let x = 1
let y = 2
x
++y                   // x; ++y  - not x++ ; y
```

```python
# Python makes the newline itself significant, so the ambiguity cannot
# arise - but it has the mirror-image rule: continuation requires
# either brackets or a backslash.

total = (1 +
         2 +
         3)          # fine - inside parentheses

total = 1 + \
        2            # explicit continuation

def bad():
    return \
        {"ok": True}  # Python needs the backslash; JS needs the value on
                      # the SAME line as `return`.
```

The practical answer is not "always use semicolons" or "never use them" but **let a formatter decide**. Prettier and the equivalent tools handle every ASI edge case correctly, and once formatting is automated the debate stops being a debate.

<a id="3-1-expressions-vs-statements"></a>

### Expressions versus statements

An **expression** produces a value; a **statement** performs an action. The distinction matters because only expressions can be passed as arguments, put in an array, or returned. `if`, `for` and `switch` are statements — which is exactly why the ternary operator exists, and why JSX and template literals lean on it so heavily.

**Where the distinction shows up**

```javascript
// statement - cannot be used as a value
if (ok) { label = 'yes'; } else { label = 'no'; }

// expression - can
const label = ok ? 'yes' : 'no';
const rows = items.map((i) => i.active ? render(i) : null);

// a function DECLARATION is a statement; a function EXPRESSION is a value
function named() {}                    // statement, hoisted
const fn = function named() {};        // expression, not hoisted
(function () { /* IIFE */ })();        // parens make it an expression

// blocks vs object literals - the same braces mean different things
{ a: 1 }          // a block containing a label. Not an object!
({ a: 1 })        // an object literal
```

```python
# Python draws the same line, and solves it the same way
label = "yes" if ok else "no"       # conditional EXPRESSION

rows = [render(i) if i.active else None for i in items]

# `lambda` is Python's function expression, limited to one expression;
# JavaScript's arrow has no such limit, which is why JS leans on
# expressions far more heavily than Python does.
```

<a id="unit-2"></a>

## Unit 2 — Values, Types & Control Flow

Primitives, coercion, variables, operators and the statements that direct a program.

<a id="4-primitive-types"></a>

## 4. Primitive Types & `typeof`

There are seven primitive types and one object type. That is the complete list, and it is worth learning it as a list because the rest of the type system is consequences of it.

| Type | `typeof` | Notes |
| --- | --- | --- |
| `number` | `'number'` | IEEE-754 double. Includes `NaN`, `Infinity`, `-0` |
| `string` | `'string'` | UTF-16 code units, immutable |
| `boolean` | `'boolean'` | Two values |
| `undefined` | `'undefined'` | "No value has been assigned" — the language's default |
| `null` | `'object'` ⚠ | "Deliberately empty" — a 1995 bug that cannot be fixed |
| `symbol` | `'symbol'` | Unique, non-colliding property keys (ES2015) |
| `bigint` | `'bigint'` | Arbitrary-precision integers, written `10n` (ES2020) |
| `object` | `'object'` / `'function'` | Arrays, functions, dates, `Map`, class instances — everything else |

Primitives are **immutable and compared by value**; objects are **mutable and compared by reference**. That single sentence predicts most of the behaviour you will meet. `'abc'.toUpperCase()` returns a new string rather than modifying one; `a === b` for two strings is a content comparison, but for two objects it is an identity comparison.

<a id="4-1-null-vs-undefined"></a>

### null versus undefined

Having two empty values is a wart, but the intended distinction is real and worth honouring: **`undefined` means the language has not given this a value; `null` means a programmer deliberately set it to nothing.** Missing parameters, absent properties and functions without a `return` all produce `undefined`. `null` only appears if someone wrote it — or if it came from JSON, which has `null` but no `undefined`.

**Where each one comes from**

```javascript
let a;                       // undefined - declared, never assigned
({}).missing;                // undefined - absent property
(function () {})();          // undefined - no return
[1, 2][5];                   // undefined - out of range

const b = null;              // null - an explicit "nothing"
JSON.parse('{"x": null}').x; // null - JSON has no undefined
document.querySelector('#nope'); // null - DOM APIs return null for "not found"

// the checks
value === undefined;   // strictly undefined
value === null;        // strictly null
value == null;         // either - the one blessed use of ==
value ?? fallback;     // default on either, but not on 0 or ''

// JSON drops undefined entirely - a real serialisation trap
JSON.stringify({ a: undefined, b: null }); // '{"b":null}'
JSON.stringify([undefined]);               // '[null]'  - arrays get null
```

```python
# Python has exactly one empty value, which is simpler
a = None
{}.get("missing")          # None
def f(): pass
f()                        # None - no return means None

import json
json.loads('{"x": null}')["x"]   # None - null maps to None

# The absence of a key is distinguished by the operation, not the value
d = {}
d.get("k")                 # None       - "not found"
d["k"]                     # KeyError   - explicit failure
"k" in d                   # False      - the honest check

# JavaScript conflates these: obj.missing and obj.present === undefined
# are indistinguishable without Object.hasOwn().
```

> **Warning**
>
> **Do not use `typeof` as a general type check.** It returns `'object'` for `null`, arrays, dates and `Map` alike. Its two legitimate uses are testing primitives (`typeof x === 'string'`) and safely probing a name that may not exist at all — `typeof maybeGlobal === 'undefined'` is the only expression in the language that does not throw on an undeclared identifier.

<a id="5-numbers"></a>

## 5. Numbers, BigInt & Floating Point

Every JavaScript `number` is a 64-bit IEEE-754 double: one sign bit, eleven exponent bits and fifty-two mantissa bits. There is no integer type. This is unusual — most languages give you both — and it has three consequences you must know.

- **Max safe integer** `2⁵³−1`
- **Mantissa bits** `52`
- **0.1 + 0.2** `≠ 0.3`
- **BigInt limit** `memory`

**One: integers are exact only up to 2⁵³−1.** Beyond `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991) consecutive integers stop being representable, so `2**53 === 2**53 + 1` is `true`. Database IDs, Twitter snowflakes and nanosecond timestamps all exceed this, which is why APIs return large IDs as *strings*.

**Two: decimals are approximations.** `0.1` cannot be written exactly in binary any more than `1/3` can in decimal. `0.1 + 0.2` is `0.30000000000000004`. Never store money in a float — use integer minor units (cents) or a decimal library.

**Three: there are two zeros and one non-number.** `0` and `-0` are distinct values that compare equal under `===`. `NaN` is a number that equals nothing, including itself, and it propagates silently through every subsequent calculation.

**Working with numbers safely**

```javascript
// --- comparing decimals: never use === ---
0.1 + 0.2 === 0.3;                          // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON; // true - the correct test

// --- money: integers only ---
const cents = Math.round(price * 100);
const display = (cents / 100).toFixed(2);   // toFixed returns a STRING

// --- parsing input ---
Number('42');        // 42        - strict, whole string must be numeric
Number('42px');      // NaN
Number('');          // 0         ⚠ empty string becomes zero
parseInt('42px', 10); // 42       - stops at the first non-digit
parseFloat('3.9kg'); // 3.9
+'42';               // 42        - terse unary plus, same as Number()

// --- the guards ---
Number.isNaN(x);            // no coercion. isNaN('a') is true - avoid it
Number.isFinite(x);         // rejects NaN and Infinity
Number.isInteger(5.0);      // true
Number.isSafeInteger(2 ** 53); // false

// --- rounding: know which direction ---
Math.round(-2.5);   // -2   ⚠ rounds toward +Infinity, not away from zero
Math.trunc(-2.9);   // -2   drops the fraction
Math.floor(-2.1);   // -3
(1234.5678).toFixed(2);              // '1234.57' (string)
(1234.5678).toLocaleString('en-US'); // '1,234.568'

// --- BigInt for exact large integers ---
const big = 9007199254740993n;
big + 1n;            // 9007199254740994n
big + 1;             // TypeError - cannot mix BigInt and Number
Number(big);         // lossy conversion back
```

```python
# Python's integers are arbitrary precision by default - no BigInt needed
2 ** 53 + 1              # 9007199254740993, exact
type(2 ** 200)           # <class 'int'>

# but floats are the same IEEE-754 doubles, with the same problem
0.1 + 0.2 == 0.3         # False
import math
math.isclose(0.1 + 0.2, 0.3)   # True - the equivalent of the EPSILON test

# money has a first-class answer in the standard library
from decimal import Decimal
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")   # True

# rounding differs! Python uses banker's rounding
round(2.5)      # 2   - ties go to even
round(3.5)      # 4
# JavaScript's Math.round(2.5) is 3. Porting numeric code between the
# two languages requires checking this explicitly.
```

> **Tip**
>
> Bitwise operators (`|`, `&`, `<<`) convert their operands to **32-bit signed integers** first. That is why the old trick `x | 0` truncates to an integer — and why it silently breaks for values above 2³¹. Use `Math.trunc`, which says what it means and has no range limit.

<a id="6-strings"></a>

## 6. Strings & Template Literals

Strings are **immutable sequences of UTF-16 code units**. Every method that appears to modify a string returns a new one. The UTF-16 detail leaks: characters outside the Basic Multilingual Plane — emoji, many CJK extensions, mathematical symbols — are stored as two code units, so `'😀'.length` is `2` and indexing into the middle of one gives you half a character.

**Strings — the methods worth knowing**

```javascript
const s = '  Hello, World  ';

// template literals: interpolation, multi-line, expressions
const name = 'Ada';
`Hi ${name}, you have ${count} ${count === 1 ? 'message' : 'messages'}`;
`line one
line two`;                          // newlines are literal

// searching
s.includes('World');    // true
s.indexOf('World');     // 9, or -1
s.startsWith('  He');   // true
s.at(-1);               // ' '  - negative indexing (ES2022)

// slicing
s.slice(2, 7);          // 'Hello'  - supports negative indices
s.substring(2, 7);      // same, but negatives clamp to 0
s.trim(); s.trimStart(); s.trimEnd();

// transforming - all return new strings
s.toUpperCase();
s.replace('World', 'there');       // FIRST occurrence only
s.replaceAll('l', 'L');            // every occurrence (ES2021)
'5'.padStart(3, '0');              // '005'
'ab'.repeat(3);                    // 'ababab'

// splitting and joining
'a,b,c'.split(',');                // ['a','b','c']
['a','b'].join('-');               // 'a-b'

// unicode: length lies, iteration does not
'😀'.length;                        // 2  - UTF-16 code units
[...'😀'].length;                   // 1  - iteration yields code points
'café'.normalize('NFC') === 'café'.normalize('NFC'); // compare safely
```

```python
s = "  Hello, World  "

name = "Ada"
f"Hi {name}, you have {count} {'message' if count == 1 else 'messages'}"

"""line one
line two"""

"World" in s            # the `includes` equivalent, and more idiomatic
s.find("World")         # 9, or -1
s.startswith("  He")
s[-1]                   # native negative indexing

s[2:7]                  # slicing is syntax, not a method
s.strip(), s.lstrip(), s.rstrip()

s.upper()
s.replace("World", "there")     # replaces ALL by default - opposite of JS!
"5".zfill(3)                    # '005'
"ab" * 3                        # 'ababab'

"a,b,c".split(",")
"-".join(["a", "b"])

# Python 3 strings are sequences of CODE POINTS, not UTF-16 units,
# so len("😀") is 1. This is the single most common source of
# off-by-one bugs when porting text handling between the two.
```

<a id="6-1-tagged-templates"></a>

### Tagged templates

A template literal preceded by a function calls that function with the static string parts and the interpolated values kept *separate*. That separation is the point: the function can escape, validate or parameterise the interpolations before they are combined, which is how libraries build safe SQL and HTML.

**A tagged template that escapes HTML**

```javascript
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// strings: the literal parts. values: everything interpolated.
const html = (strings, ...values) =>
  strings.reduce((out, str, i) =>
    out + str + (i < values.length ? escapeHtml(values[i]) : ''), '');

const userInput = '<img onerror=alert(1)>';
html`<p>${userInput}</p>`;
// '<p>&lt;img onerror=alert(1)&gt;</p>' - the markup is inert

// the same idea powers parameterised SQL in libraries like postgres.js:
sql`SELECT * FROM users WHERE id = ${id}`   // id becomes a bound parameter
```

```python
# Python has no tagged templates; the equivalent safety comes from
# passing values separately to an API that knows how to escape them.
import html
html.escape("<img onerror=alert(1)>")

# parameterised SQL - values are never interpolated into the string
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# f-strings interpolate eagerly and CANNOT be made safe this way, which
# is exactly why f-strings must never be used to build SQL or HTML.
```

> **Warning**
>
> String concatenation in a loop used to be a performance sin. Modern engines optimise it with rope representations, so `out += x` is fine for thousands of iterations. The real reason to prefer `arr.push(x)` then `arr.join('')` is readability — and it remains faster for very large numbers of fragments.

<a id="7-coercion"></a>

## 7. Truthiness, Coercion & the Two Equalities

JavaScript is **dynamically and weakly typed**. Dynamic means a variable can hold any type and the type is checked at runtime. Weak means the language will silently *convert* a value to a different type when an operation demands it. Dynamic typing is a design choice shared with Python; weak typing is the part that produces the memes.

Every conversion goes through one of three abstract operations: `ToPrimitive`, `ToNumber`, or `ToString`. Learning where each is triggered turns coercion from folklore into a lookup.

| Context | Conversion applied | Example |
| --- | --- | --- |
| `if`, `&&`, `!`, ternary | `ToBoolean` | `if ([])` → truthy |
| `-`, `*`, `/`, `%`, unary `+` | `ToNumber` | `'6' * '7'` → `42` |
| `+` with any string operand | `ToString` | `1 + '2'` → `'12'` |
| Template literal, `String(x)` | `ToString` | `` `${[1,2]}` `` → `'1,2'` |
| Object property key | `ToPropertyKey` | `o[1]` is `o['1']` |
| `==` across types | Whole coercion algorithm | `[] == false` → `true` |

The `+` operator is the one that catches people, because it is overloaded: it means addition *unless* either operand is a string after `ToPrimitive`, in which case it means concatenation. Every other arithmetic operator is unambiguous — `-` always converts to number. Step through the comparison algorithm and the truthiness table:

> **Interactive animation:** `coercion` — rendered by the page script in the HTML version.

**The conversions, systematically**

```javascript
// + is overloaded; everything else is not
1 + '2';       // '12'   string wins
1 - '2';       // -1     ToNumber
'6' * '7';     // 42
[] + {};       // '[object Object]'
[] + [];       // ''     both stringify to ''
'5' - - '2';   // 7      double negation, both become numbers

// objects convert via ToPrimitive: valueOf() then toString()
const money = {
  amount: 5,
  valueOf() { return this.amount; },     // used by arithmetic
  toString() { return `$${this.amount}`; }, // used by string contexts
};
money + 1;         // 6      - valueOf
`${money}`;        // '$5'   - toString
money + '';        // '5'    ⚠ + prefers valueOf even in a string context

// Symbol.toPrimitive takes precedence over both
const explicit = {
  [Symbol.toPrimitive](hint) {           // hint: 'number' | 'string' | 'default'
    return hint === 'string' ? 'five' : 5;
  },
};

// the equality rules, condensed
0 == '0';           // true   - string converted to number
0 == '';            // true   - '' becomes 0
0 == false;         // true   - false becomes 0
null == undefined;  // true   - special-cased
null == 0;          // false  - null is NOT converted to a number
NaN == NaN;         // false  - NaN equals nothing
[] == false;        // true   - [] -> '' -> 0, false -> 0
'0' == false;       // true
'0' === false;      // false  - different types, done
```

```python
# Python is dynamically but STRONGLY typed: it refuses most conversions
1 + "2"           # TypeError: unsupported operand type(s)
"6" * "7"         # TypeError
"ab" * 3          # 'ababab'  - * IS overloaded for str * int

# you must convert explicitly, which is the whole design philosophy
1 + int("2")      # 3
str(1) + "2"      # '12'

# there is only one equality operator, and it does not coerce across
# unrelated types
0 == "0"          # False
0 == False        # True   - bool IS a subclass of int, the one exception
None == 0         # False

# objects customise it explicitly rather than through coercion hooks
class Money:
    def __init__(self, amount): self.amount = amount
    def __add__(self, other): return Money(self.amount + other)
    def __str__(self): return f"${self.amount}"
```

> **Key idea**
>
> The rules that survive into real code: **use `===` always**, with the single exception `x == null`; **convert explicitly** with `Number()`, `String()` and `Boolean()` rather than relying on an operator's side effect; and **default with `??`, not `||`**, so a legitimate `0` or `''` survives.

<a id="8-variables"></a>

## 8. Variables — `var`, `let`, `const` & the TDZ

Before a single statement of a scope executes, the engine performs a **creation phase**: it scans the scope, creates a binding for every declaration it finds, and initialises some of them. Only then does execution begin. Hoisting is not code moving — it is the fact that bindings exist before the lines that declare them.

|   | `var` | `let` | `const` |
| --- | --- | --- | --- |
| Scope | Function | Block | Block |
| Hoisted? | Yes, to `undefined` | Yes, uninitialised (TDZ) | Yes, uninitialised (TDZ) |
| Redeclare in same scope | Allowed | SyntaxError | SyntaxError |
| Reassign | Yes | Yes | TypeError |
| Creates a property on `globalThis` | Yes (at top level of a script) | No | No |
| New binding per loop iteration | No | Yes | Yes (`for…of`) |

> **Interactive animation:** `hoisting` — rendered by the page script in the HTML version.

The **temporal dead zone** is the region between the start of a block and the line that initialises a `let` or `const`. The binding exists — which is why it shadows an outer variable of the same name — but reading it throws `ReferenceError`. This is a feature: it converts a silent `undefined` into an error at the exact line of the mistake.

**Hoisting edge cases you will meet in real code**

```javascript
// the TDZ shadows, which produces a confusing error
const x = 'outer';
{
  console.log(x);   // ReferenceError - NOT 'outer'
  const x = 'inner'; // the inner binding already exists here
}

// function declarations are hoisted whole; expressions are not
hoisted();          // works
function hoisted() {}
notHoisted();       // TypeError: notHoisted is not a function
var notHoisted = function () {};

// var ignores blocks entirely
if (true) { var leaked = 1; }
console.log(leaked);   // 1 - visible outside the block

// const in a for..of gets a fresh binding each iteration
for (const item of items) { /* item is const AND different each time */ }

// but a classic for loop needs let - const would throw on i++
for (let i = 0; i < 3; i++) { /* fresh `i` per iteration */ }

// class declarations are hoisted but stay in the TDZ - unlike functions
new Foo();          // ReferenceError
class Foo {}
```

```python
# Python has no hoisting and no block scope: only module, function
# and class scopes exist.
if True:
    leaked = 1
print(leaked)        # 1 - same result as JS `var`, different reason
                     # (the `if` never created a scope at all)

# Python's closest analogue to the TDZ
x = "outer"
def f():
    print(x)         # UnboundLocalError - Python decided x is local
    x = "inner"      # ...because of THIS line, anywhere in the function
f()

# Same lesson, same fix: declare before first use.
```

> **Tip**
>
> **The rule, without exceptions:** `const` everywhere; switch to `let` only when you actually reassign; never write `var`. The payoff is not stylistic — a `const` tells every future reader that this name means the same thing for the rest of the block, which removes an entire category of "where does this change?" reading.

<a id="9-operators"></a>

## 9. Operators & Short-Circuit Evaluation

Two properties of the logical operators do most of the work in idiomatic JavaScript. First, they **short-circuit**: the right operand is not evaluated if the left one already determines the answer. Second, they **return an operand, not a boolean** — `a || b` is "`a` if it is truthy, otherwise `b`", which is why it works as a default.

**The operators that shape modern code**

```javascript
// short-circuit: guard an expensive or unsafe call
user && user.save();               // only calls save if user is truthy
isReady || initialise();           // only initialises if not ready

// they return operands
'a' || 'b';        // 'a'
0 || 'b';          // 'b'
'a' && 'b';        // 'b'
null && 'b';       // null

// nullish coalescing: falls back ONLY on null/undefined
0 || 100;          // 100   ⚠ a valid zero is discarded
0 ?? 100;          // 0     ✓
'' ?? 'default';   // ''    ✓

// optional chaining: undefined instead of a TypeError
user?.address?.city;        // undefined if either is nullish
user.getName?.();           // only calls if the method exists
list?.[0];                  // safe index access
// note: it stops the whole chain, it does not just skip one link

// logical assignment (ES2021)
opts.retries ??= 3;         // assign only if null/undefined
cache[key] ||= compute();   // assign only if falsy
flags.debug &&= isDev;      // assign only if currently truthy

// the comma operator - evaluates both, returns the last. Rare, and
// almost always a mistake outside of a for-loop header.
for (let i = 0, j = 10; i < j; i++, j--) { }

// precedence trap: ?? cannot be mixed with || or && without parens
const v = a ?? b || c;      // SyntaxError - be explicit
const v = (a ?? b) || c;    // fine
```

```python
# Python's `and`/`or` behave identically - short-circuit, return operands
user and user.save()
is_ready or initialise()

"a" or "b"        # 'a'
0 or "b"          # 'b'
"a" and "b"       # 'b'

# but there is no ?? - and Python's falsy set differs, so `or` has the
# same zero problem
port = user_port if user_port is not None else 3000   # the ?? equivalent

# no optional chaining either; the idiomatic forms are
city = (user or {}).get("address", {}).get("city")
getattr(user, "get_name", lambda: None)()

# Python DOES have chained comparison, which JavaScript lacks entirely
if 0 < x < 10:              # in JS this parses as (0 < x) < 10  ⚠
    ...
```

> **Warning**
>
> **Chained comparison does not exist in JavaScript.** `0 < x < 10` parses as `(0 < x) < 10`, which is `true < 10`, which is `1 < 10`, which is always `true`. Write `0 < x && x < 10`. This is a genuine, silent, ships-to-production bug.

<a id="10-control-flow"></a>

## 10. Control Flow & Loops

The control structures are unremarkable, with two exceptions worth being precise about: the difference between `for…in` and `for…of`, and the fall-through behaviour of `switch`.

**Choosing the right loop**

```javascript
// for..of iterates VALUES of any iterable. This is the default choice.
for (const item of items) { }
for (const ch of 'héllo') { }              // code points, not UTF-16 units
for (const [k, v] of Object.entries(o)) { }
for (const [k, v] of map) { }
for (const [i, item] of items.entries()) { } // index and value

// for..in iterates KEYS of an object - INCLUDING inherited ones,
// in an unreliable order, as strings. Rarely what you want.
for (const key in obj) {
  if (!Object.hasOwn(obj, key)) continue;   // the mandatory guard
}
for (const i in [10, 20]) console.log(i);   // '0', '1' - STRINGS ⚠

// classic for: when you need the index arithmetic or an unusual step
for (let i = items.length - 1; i >= 0; i--) { }

// labelled break escapes nested loops
outer:
for (const row of rows) {
  for (const cell of row) {
    if (cell === target) break outer;
  }
}

// switch compares with === and FALLS THROUGH without break
switch (kind) {
  case 'a':
  case 'b':                 // deliberate fall-through: a and b share code
    handleAB();
    break;
  case 'c': {
    const local = 1;        // braces needed for a block-scoped declaration
    break;
  }
  default:
    handleRest();
}

// often an object lookup is clearer than a switch
const handlers = { a: handleA, b: handleB };
(handlers[kind] ?? handleRest)();
```

```python
for item in items: ...
for ch in "héllo": ...
for k, v in o.items(): ...
for i, item in enumerate(items): ...

# Python's `for k in obj` over a dict gives keys, like for..in, but only
# OWN keys and in insertion order - so it has none of the JS caveats.

for i in range(len(items) - 1, -1, -1): ...

# no labelled break; the idiomatic escape is a flag, a function, or
# for/else
for row in rows:
    for cell in row:
        if cell == target:
            break
    else:
        continue
    break

# match/case (3.10+) is structural, not fall-through
match kind:
    case "a" | "b":
        handle_ab()
    case _:
        handle_rest()
```

> **Warning**
>
> **Never use `for…in` on an array.** It yields indices as *strings*, includes any enumerable properties added to the array or its prototype, and gives no ordering guarantee. Use `for…of` for values, `.entries()` when you need the index, or a classic `for` when you need arithmetic.

<a id="unit-3"></a>

## Unit 3 — Functions & Scope

Functions in all their forms, scope, closures and the rules for this.

<a id="11-functions"></a>

## 11. Functions — Declarations, Expressions & Arrows

Functions are **first-class objects**. They have properties (`name`, `length`), can be assigned, passed and returned, and can carry state. Everything from array methods to promise callbacks to module patterns rests on this.

There are four syntaxes and they are not interchangeable:

|   | Hoisted | Own `this` | `arguments` | `new` | Use for |
| --- | --- | --- | --- | --- | --- |
| `function f() {}` | Whole body | Yes | Yes | Yes | Top-level helpers |
| `const f = function () {}` | No | Yes | Yes | Yes | Conditional definitions |
| `const f = () => {}` | No | **No** | No | No | Callbacks, anything nested |
| `{ f() {} }` | n/a | Yes | Yes | No | Object and class methods |

An arrow function is not "a shorter function". It is a function with **no `this`, no `arguments`, no `prototype` and no `new`**. Those absences are the reason to choose it: inside a callback, `this` resolves lexically to the enclosing method instead of being reset by the caller.

**Function forms and the closures they create**

```javascript
// arrow bodies: expression (implicit return) vs block (explicit)
const double = (n) => n * 2;
const build  = (id) => ({ id });          // object literal needs parens
const log    = (msg) => { console.log(msg); };  // block: no return

// functions have properties
double.name;      // 'double' - inferred from the assignment
double.length;    // 1 - declared parameters before the first default/rest

// IIFE - a scope with no name leaked, the pre-module pattern
const counter = (function () {
  let n = 0;
  return { next: () => ++n };
})();

// higher-order functions: take or return functions
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
const pipe    = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const slugify = pipe(String.prototype.trim.call.bind(String.prototype.trim),
                     (s) => s.toLowerCase(),
                     (s) => s.replace(/\s+/g, '-'));

// recursion: a named function expression can call itself safely
const fact = function f(n) { return n <= 1 ? 1 : n * f(n - 1); };
// `f` is visible only inside the function, so reassigning `fact` is safe
```

```python
double = lambda n: n * 2          # single expression only
def log(msg):                     # anything longer needs def
    print(msg)

double.__name__                   # '<lambda>' - not inferred
double.__code__.co_argcount       # 1

# the IIFE has no direct equivalent; Python uses a function + call,
# or simply a module, since every file already has its own scope
def _make_counter():
    n = 0
    def nxt():
        nonlocal n
        n += 1
        return n
    return nxt
counter_next = _make_counter()

from functools import reduce
def compose(*fns):
    return lambda x: reduce(lambda v, f: f(v), reversed(fns), x)

def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)
```

<a id="12-parameters"></a>

## 12. Parameters, Defaults, Rest & Spread

JavaScript never checks arity. Call a two-parameter function with five arguments and the extras are dropped; call it with none and both parameters are `undefined`. Everything in this section exists to make that flexibility manageable.

**Parameter handling**

```javascript
// defaults - evaluated at CALL time, left to right, only on undefined
function connect(host, port = 5432, opts = {}) { }
connect('db', undefined, { ssl: true });   // port becomes 5432
connect('db', null);                       // port is null - defaults skip null

// a default may reference earlier parameters and call functions
function slice(arr, start = 0, end = arr.length) { }
function log(msg, ts = Date.now()) { }     // fresh timestamp per call

// rest: collects the remainder into a REAL array
function sum(first, ...others) { return others.reduce((a, b) => a + b, first); }

// spread: expands an iterable into arguments or elements
Math.max(...numbers);
const merged = [...a, ...b];
const copy   = { ...original, override: 1 };

// named parameters via destructuring - the standard for 3+ options
function createUser({ name, role = 'user', active = true } = {}) { }
createUser({ name: 'Ada', role: 'admin' });   // order-free, self-documenting

// `arguments` - array-LIKE, not an array, and absent in arrows
function old() {
  const args = Array.from(arguments);   // convert before using array methods
}
// prefer rest parameters in all new code

// pass-by-sharing: reassigning a parameter is local, mutating is not
function f(obj, num) {
  num = 99;          // caller unaffected
  obj.x = 99;        // caller SEES this
  obj = {};          // caller unaffected - only the local binding moved
}
```

```python
def connect(host, port=5432, opts=None):
    opts = {} if opts is None else opts     # the mutable-default guard

# ⚠ Python's defaults are evaluated ONCE at definition time - the single
# biggest difference from JavaScript, and a classic bug:
def bad(items=[]):        # the SAME list is reused across all calls
    items.append(1)
    return items
bad(); bad()              # [1, 1]  - JavaScript's `= []` is per-call

def total(first, *others):
    return first + sum(others)

max(*numbers)
merged = [*a, *b]
copy = {**original, "override": 1}

def create_user(*, name, role="user", active=True):   # keyword-only
    ...

# Python's argument passing is also "by sharing" - identical semantics
def f(obj, num):
    num = 99          # caller unaffected
    obj["x"] = 99     # caller sees it
    obj = {}          # caller unaffected
```

> **Tip**
>
> A pleasant asymmetry: JavaScript evaluates default expressions *on every call*, so `function f(list = [])` gives each call a fresh array. Python evaluates them *once*, at definition, which is why `def f(list=[])` is a famous bug. If you move between the languages, this is worth memorising in both directions.

<a id="13-scope"></a>

## 13. Scope & the Scope Chain

A scope is a mapping from names to bindings. JavaScript has four kinds — global, module, function and block — and they nest according to **where the code is written**. When a name is referenced, the engine searches the current scope, then each enclosing scope in turn, and throws `ReferenceError` if it reaches the top without a match.

> **Interactive animation:** `scope-chain` — rendered by the page script in the HTML version.

The word to hold onto is **lexical**. The chain is determined by the source text at the moment the function is created, not by the call stack at the moment it runs. A function passed three layers deep still resolves its free variables against the scope it was written in — that is precisely what makes closures predictable, and it is the opposite of dynamic scoping, which `this` (confusingly) does use.

**Lexical scope, shadowing and the global object**

```javascript
const scope = 'module';

function outer() {
  const scope = 'outer';     // shadows the module binding
  function inner() {
    return scope;            // resolved lexically -> 'outer'
  }
  return inner;
}

function caller() {
  const scope = 'caller';    // irrelevant - not in inner's chain
  return outer()();          // 'outer'
}

// blocks create scopes for let/const/class/function, not for var
{
  let blockOnly = 1;
  var functionWide = 2;
}
typeof blockOnly;     // 'undefined' (and referencing it throws)
functionWide;         // 2

// globalThis works in every environment: window, self, global
globalThis.appConfig = { }; // an explicit global, if you truly need one

// in a classic script, top-level var/function become global properties
var a = 1;       // window.a === 1
let b = 2;       // window.b === undefined - let never does this
```

```python
scope = "module"

def outer():
    scope = "outer"
    def inner():
        return scope        # lexical, exactly like JavaScript
    return inner

def caller():
    scope = "caller"        # irrelevant
    return outer()()        # 'outer'

# Python scopes: Local -> Enclosing -> Global -> Builtins ("LEGB").
# Same outward search; the difference is that Python has NO block scope,
# so an `if` or `for` body shares the function scope.
for i in range(3):
    pass
print(i)          # 2 - the loop variable survives

# Assignment makes a name local for the WHOLE function, which is why
# these keywords exist:
counter = 0
def bump():
    global counter        # JS needs no equivalent - assignment finds
    counter += 1          # the nearest existing binding automatically
```

<a id="14-closures"></a>

## 14. Closures

A closure is a function together with the environment it was created in. Every function in JavaScript is technically a closure; the term is used when the environment **outlives the call that created it**. Mechanically: scopes are allocated on the heap, a function object holds a reference to the scope it was created in, and the garbage collector keeps that scope alive as long as the function is reachable.

> **Interactive animation:** `closure` — rendered by the page script in the HTML version.

The crucial detail — the one interviews probe for — is that a closure captures the **binding, not the value**. Two functions created in the same call share one environment and see each other's writes. Two functions created in different calls have separate environments.

**Closure patterns, from simplest to most useful**

```javascript
// 1. private state (the module pattern)
const store = (() => {
  const data = new Map();                 // unreachable from outside
  return {
    get: (k) => data.get(k),
    set: (k, v) => { data.set(k, v); return v; },
    get size() { return data.size; },
  };
})();

// 2. partial application - bake in an argument now, supply the rest later
const curry = (fn) => (a) => (b) => fn(a, b);
const add = (a, b) => a + b;
const inc = curry(add)(1);
inc(5);                                   // 6

// 3. memoisation with a bounded cache
const memoize = (fn, limit = 100) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const value = fn(...args);
    cache.set(key, value);
    if (cache.size > limit) cache.delete(cache.keys().next().value);
    return value;
  };
};

// 4. a stateful generator of ids, with no globals anywhere
const nextId = ((n = 0) => () => ++n)();

// 5. the shared-vs-separate distinction, demonstrated
function pair() {
  let n = 0;
  return [() => ++n, () => n];            // SHARE one `n`
}
const [bump, read] = pair();
bump(); bump();
read();                                   // 2

const [bump2] = pair();                   // a different call -> different `n`
```

```python
# 1. private state
def _make_store():
    data = {}
    def get(k): return data.get(k)
    def set_(k, v):
        data[k] = v
        return v
    return type("Store", (), {"get": staticmethod(get),
                              "set": staticmethod(set_)})()
store = _make_store()

# 2. partial application has a standard-library form
from functools import partial
add = lambda a, b: a + b
inc = partial(add, 1)
inc(5)          # 6

# 3. memoisation, batteries included
from functools import lru_cache

@lru_cache(maxsize=100)
def slow(n): ...

# 4/5. same capture-the-binding semantics, but writing to a captured
# name requires `nonlocal` - JavaScript needs no such declaration
def pair():
    n = 0
    def bump():
        nonlocal n
        n += 1
        return n
    return bump, lambda: n
```

- **Strength** — Encapsulation with no class, no naming convention and no way to reach the state from outside. Every hook, middleware factory and event handler in modern JavaScript is a closure.
- **Weakness** — A closure retains its *entire* environment, not only the variables it reads. A long-lived callback declared next to a large array keeps that array alive — a leak that profilers report as "closure" retainers.

> **Interview**
>
> **The standard follow-up:** "how would you write a function that can only be called once?" — a closure holding a boolean. The follow-up to *that* is usually the `var` loop, and the answer is that `var` creates one binding for the whole function while `let` creates one per iteration, by specification.

<a id="15-this"></a>

## 15. `this` — the Four Binding Rules

`this` is the one part of JavaScript that is **dynamically scoped**. Everything else resolves lexically, from the source text; `this` is resolved at the call site, from how the function was invoked. A function body is a template that gets a different receiver each time.

> **Interactive animation:** `this-binding` — rendered by the page script in the HTML version.

Evaluate the rules in priority order and any `this` question becomes mechanical:

1. **`new` binding.** `new Fn()` creates a fresh object, links it to `Fn.prototype`, runs the body with `this` set to it, and returns it.
2. **Explicit binding.** `fn.call(o)`, `fn.apply(o)` and `fn.bind(o)` set the receiver directly. A bound function ignores every later attempt to rebind it.
3. **Implicit binding.** `o.fn()` — whatever sits immediately before the dot becomes `this`. Only the last link matters: in `a.b.c()`, `this` is `b`.
4. **Default binding.** A plain `fn()` gets `undefined` in strict mode (and therefore in every module and class), or `globalThis` in sloppy mode.

Arrow functions are outside this list. They have no `this` binding at all, so the name is resolved through the scope chain like any ordinary variable — and cannot be changed by `call`, `apply`, `bind` or `new`.

**Losing and restoring the receiver**

```javascript
class Counter {
  count = 0;

  // ordinary method: `this` depends on the call site
  incrementLoose() { this.count++; }

  // class field arrow: `this` captured at construction, permanently
  incrementBound = () => { this.count++; };
}

const c = new Counter();
const loose = c.incrementLoose;
loose();                       // TypeError - `this` is undefined
const bound = c.incrementBound;
bound();                       // works

// the three repairs, in order of preference
button.addEventListener('click', () => c.incrementLoose());   // wrapper
button.addEventListener('click', c.incrementLoose.bind(c));   // bind
// class field arrow (above) - simplest, but one function per instance

// implicit binding only looks at the LAST link
const app = { db: { name: 'main', show() { return this.name; } } };
app.db.show();                 // 'main'  - `this` is db, not app

// borrowing a method with call
Array.prototype.slice.call(arguments);        // array-like -> array
Object.prototype.hasOwnProperty.call(o, 'k'); // safe even if o overrides it

// what `this` is at the top level
// - module:          undefined
// - CommonJS:        module.exports
// - classic script:  globalThis
// - class field/body: the instance / the class
```

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):        # `self` is an explicit parameter
        self.count += 1

c = Counter()
loose = c.increment             # a BOUND method - self is already attached
loose()                         # works. Python has no `this` loss problem.

unbound = Counter.increment     # the plain function
unbound(c)                      # you pass the receiver yourself

# Python solved this by making the receiver explicit in the signature
# and binding it at attribute-access time. JavaScript resolves it at
# call time, which is why `obj.method` and `obj.method()` differ so much.

# the equivalent of .call is just a normal call
Counter.increment(c)
```

> **Warning**
>
> **Never write an object method as an arrow.** `{ name: 'x', get: () => this.name }` has no enclosing method to inherit from, so `this` is the module scope's `this` — `undefined` in ESM. The mirror mistake is writing a callback as a `function` expression inside a method and then wondering where the receiver went.

<a id="unit-4"></a>

## Unit 4 — Objects, Collections & Iteration

Objects, prototypes and classes, the built-in collections, iteration protocols and errors.

<a id="16-objects"></a>

## 16. Objects & Property Descriptors

An object is an ordered collection of properties keyed by strings or symbols. "Ordered" is specified precisely: integer-like keys first in ascending numeric order, then string keys in insertion order, then symbols. That is why `{ 2: 'b', 1: 'a' }` enumerates as `1, 2`.

Every property is not just a value — it is a **descriptor**, a record with attributes that control whether it can be changed, deleted or enumerated. Most of the time the defaults are invisible, but they explain why built-in properties behave differently from yours.

**Descriptors and object plumbing**

```javascript
const o = { a: 1 };
Object.getOwnPropertyDescriptor(o, 'a');
// { value: 1, writable: true, enumerable: true, configurable: true }

// properties defined this way default to FALSE for all three flags
Object.defineProperty(o, 'id', { value: 7 });
o.id = 9;                 // silently ignored (TypeError in strict mode)
Object.keys(o);           // ['a'] - `id` is not enumerable
delete o.id;              // false - not configurable

// accessors: a property backed by functions
const temp = {
  _c: 0,
  get f() { return this._c * 9 / 5 + 32; },
  set f(v) { this._c = (v - 32) * 5 / 9; },
};
temp.f = 212;             // looks like assignment, runs the setter
temp._c;                  // 100

// enumeration - four functions, four different answers
Object.keys(o);                        // own, enumerable, string keys
Object.getOwnPropertyNames(o);         // own strings, enumerable or not
Object.getOwnPropertySymbols(o);       // own symbols
for (const k in o) { }                 // own AND INHERITED enumerable strings

// membership
'a' in o;                 // true - includes inherited
Object.hasOwn(o, 'a');    // true - own only (replaces hasOwnProperty)

// levels of immutability, weakest to strongest
Object.preventExtensions(o);  // no new properties
Object.seal(o);               // + no deletions, no reconfiguration
Object.freeze(o);             // + no writes. SHALLOW - nested objects are free

// a prototype-less object: a safe dictionary with no inherited keys
const dict = Object.create(null);
dict.toString;            // undefined - no collision with Object.prototype
// or, since ES2022:
const dict2 = { __proto__: null };
```

```python
o = {"a": 1}

# Python separates the two roles JavaScript objects play:
#   dict  -> a keyed collection (what {} usually means in JS)
#   class -> attributes, descriptors, properties

class Temp:
    def __init__(self):
        self._c = 0

    @property                     # the getter
    def f(self):
        return self._c * 9 / 5 + 32

    @f.setter                     # the setter
    def f(self, v):
        self._c = (v - 32) * 5 / 9

t = Temp()
t.f = 212
t._c        # 100.0

# descriptors exist too, and are how @property itself is implemented
class ReadOnly:
    def __get__(self, obj, cls): return 7
    def __set__(self, obj, v): raise AttributeError("read-only")

"a" in o                     # dict membership - no inheritance involved
o.keys()
frozen = types.MappingProxyType(o)   # the closest thing to Object.freeze
```

> **Tip**
>
> `Object.freeze` is shallow, and there is no built-in deep freeze. If you need one, walk the object recursively — but consider whether you need it at all: in practice, the discipline of always producing new objects (section 33) prevents mutation more reliably than trying to forbid it at runtime.

<a id="17-prototypes"></a>

## 17. Prototypes & the Prototype Chain

JavaScript's inheritance is **delegation between objects**. Each object has an internal slot, `[[Prototype]]`, pointing at another object. Reading a property that is not present follows that link, repeatedly, until it finds the key or reaches `null`.

> **Interactive animation:** `prototype-chain` — rendered by the page script in the HTML version.

Two rules make the whole system predictable:

- **Reads delegate** — A miss walks the chain. This is what makes methods shared: one `Array.prototype.map` serves every array in the program.
- **Writes do not**`obj.x = 1` always creates or updates an *own* property, shadowing anything inherited — even if the prototype had a value there. (The exception: an inherited *setter* is invoked rather than shadowed.)

The naming is genuinely confusing and worth stating once, carefully. `Fn.prototype` is a property on a *function*, and it is the object that will become the prototype of instances created with `new Fn()`. It is *not* the function's own prototype. The function's own prototype is `Function.prototype`. Use `Object.getPrototypeOf(x)` when you mean "the prototype of this object".

**Building and inspecting chains**

```javascript
// the three ways to create a link
const a = Object.create(protoObj);        // explicit, clearest
const b = new Ctor();                     // b's prototype is Ctor.prototype
const c = { __proto__: protoObj };        // literal syntax (ES2015+)

// inspecting
Object.getPrototypeOf(a) === protoObj;    // true
protoObj.isPrototypeOf(a);                // true
a instanceof Ctor;                        // walks the chain looking for
                                          // Ctor.prototype

// a full chain, printed
let node = [];
while (node) { console.log(node.constructor?.name); node = Object.getPrototypeOf(node); }
// Array -> Object -> (null)

// delegation in action: shared methods, per-instance data
const proto = {
  greet() { return `hi ${this.name}`; },  // `this` is the CALLING object
};
const x = Object.create(proto); x.name = 'Ada';
const y = Object.create(proto); y.name = 'Bob';
x.greet();       // 'hi Ada' - one function, two receivers

// shadowing
x.greet = () => 'override';   // own property, only affects x
delete x.greet;               // the inherited one is visible again

// ⚠ never do this in hot code: changing a prototype after creation
// deoptimises every object that used it
Object.setPrototypeOf(x, otherProto);
```

```python
class Proto:
    def greet(self):
        return f"hi {self.name}"

x = Proto(); x.name = "Ada"
y = Proto(); y.name = "Bob"
x.greet()          # 'hi Ada' - one function object, two receivers

# Python looks attributes up through the MRO - a linearised list of
# classes computed at class-creation time (C3 linearisation).
Proto.__mro__          # (Proto, object)
type(x).__mro__        # the equivalent of walking [[Prototype]]

isinstance(x, Proto)   # like instanceof
x.__class__            # like .constructor

# shadowing works identically
x.greet = lambda: "override"    # instance attribute hides the class one
del x.greet

# The key difference: JavaScript's chain is made of ORDINARY MUTABLE
# OBJECTS, so it can be rewired at runtime. Python's is a class list,
# fixed unless you reassign __class__.
```

<a id="18-classes"></a>

## 18. Classes, Inheritance & Private Fields

`class` is syntax over the prototype machinery of the previous section — but it is not *only* syntax. Class bodies are always strict, methods are non-enumerable, calling a class without `new` throws, and private fields have no prototype-based equivalent at all.

**The full class surface**

```javascript
class Account {
  // public field - assigned per instance, before the constructor body
  currency = 'USD';

  // private field - genuinely inaccessible, enforced by the engine
  #balance = 0;

  // static members live on the class, not on instances
  static #count = 0;
  static MIN = 0;
  static { /* static initialisation block, runs once */ }

  constructor(owner) {
    this.owner = owner;
    Account.#count++;
  }

  // prototype method - one copy, shared by all instances
  deposit(amount) {
    if (amount <= 0) throw new RangeError('amount must be positive');
    this.#balance += amount;
    return this;                      // enables chaining
  }

  get balance() { return this.#balance; }   // read-only from outside

  static create(owner) { return new Account(owner); }  // named constructor

  // brand check - the only reliable "is this really one of mine?"
  static isAccount(o) { return #balance in o; }
}

class Savings extends Account {
  #rate;
  constructor(owner, rate) {
    super(owner);            // MUST come before any use of `this`
    this.#rate = rate;
  }
  deposit(amount) {
    return super.deposit(amount * (1 + this.#rate));   // extend, don't replace
  }
}

// extending built-ins works properly since ES2015
class ValidationError extends Error {
  constructor(field) {
    super(`invalid ${field}`);
    this.name = 'ValidationError';
    this.field = field;
  }
}
```

```python
class Account:
    MIN = 0                      # class attribute, like `static`
    _count = 0

    def __init__(self, owner):
        self.owner = owner
        self.currency = "USD"
        self.__balance = 0       # name-mangled to _Account__balance
        Account._count += 1      # a convention, NOT enforced privacy

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.__balance += amount
        return self

    @property
    def balance(self):
        return self.__balance

    @classmethod
    def create(cls, owner):
        return cls(owner)

class Savings(Account):
    def __init__(self, owner, rate):
        super().__init__(owner)
        self._rate = rate

    def deposit(self, amount):
        return super().deposit(amount * (1 + self._rate))

class ValidationError(Exception):
    def __init__(self, field):
        super().__init__(f"invalid {field}")
        self.field = field

# Python allows MULTIPLE inheritance and mixins directly; JavaScript
# has single inheritance only, and emulates mixins with functions that
# take a base class and return a subclass.
```

<a id="18-1-composition-over-inheritance"></a>

### Composition over inheritance

JavaScript supports single inheritance only. Deep hierarchies are the usual mistake — three levels in, changing a base class breaks subclasses nobody remembers. Two alternatives cover almost everything: **mixins** (a function that takes a class and returns an extended one) and, more often, **plain composition** — hold a collaborator as a field rather than inheriting from it.

**Mixins and composition**

```javascript
// mixin: a class factory
const Serializable = (Base) => class extends Base {
  toJSON() { return { ...this }; }
};
const Timestamped = (Base) => class extends Base {
  createdAt = Date.now();
};

class Document extends Serializable(Timestamped(Object)) {}

// composition - usually the better answer
class Report {
  constructor(formatter, storage) {
    this.formatter = formatter;   // swap either one without touching Report
    this.storage = storage;
  }
  async save(data) {
    return this.storage.put(this.formatter.format(data));
  }
}

// and remember: a closure is often lighter than either
const makeReport = (formatter, storage) => ({
  save: (data) => storage.put(formatter.format(data)),
});
```

```python
# Python does mixins natively via multiple inheritance
class Serializable:
    def to_json(self): return vars(self)

class Timestamped:
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.created_at = time.time()

class Document(Serializable, Timestamped): ...

# composition reads the same in both languages
class Report:
    def __init__(self, formatter, storage):
        self.formatter = formatter
        self.storage = storage

    async def save(self, data):
        return await self.storage.put(self.formatter.format(data))
```

<a id="19-arrays"></a>

## 19. Arrays & the Iteration Methods

An array is an object with integer-like keys and a `length` that updates automatically. Engines optimise arrays with contiguous storage as long as they stay "packed" — dense, single-typed, no holes. Creating holes (`arr[1000] = 1` on a short array, or `delete arr[0]`) switches the array to dictionary mode and makes every access slower.

> **Interactive animation:** `array-methods` — rendered by the page script in the HTML version.

The methods divide cleanly into three groups, and knowing which group a method belongs to is most of what you need:

| Group | Methods | Returns |
| --- | --- | --- |
| Mutating | `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` | Varies — changes the original |
| Non-mutating | `slice`, `concat`, `map`, `filter`, `flat`, `toSorted`, `toReversed`, `with` | A new array |
| Reducing / searching | `reduce`, `find`, `some`, `every`, `includes`, `indexOf`, `join` | A single value |

**The array vocabulary in full**

```javascript
// creating
Array.from({ length: 5 }, (_, i) => i * i);   // [0,1,4,9,16]
Array.from('abc');                            // ['a','b','c']
Array.from(nodeList);                         // any iterable or array-like
Array.of(7);                                  // [7]  - unlike Array(7)
new Array(3).fill(0);                         // [0,0,0]
[...Array(3).keys()];                         // [0,1,2]

// ⚠ Array(3) creates HOLES, and map skips them
new Array(3).map((_, i) => i);                // [ , , ] - still empty

// searching
arr.indexOf(x);            // === comparison, -1 if absent
arr.includes(NaN);         // true - uses SameValueZero, unlike indexOf
arr.find((o) => o.id === 1);
arr.findLast((o) => o.ok); // from the end (ES2023)
arr.at(-1);                // last element, no length arithmetic

// transforming
arr.map(fn); arr.filter(fn); arr.flatMap(fn);
arr.flat(Infinity);                     // fully flatten
arr.reduce((acc, v) => acc + v, 0);     // ALWAYS pass the seed
arr.reduceRight(fn, seed);

// sorting: the comparator returns a NUMBER, not a boolean
arr.sort((a, b) => a - b);                       // ascending numbers
arr.sort((a, b) => a.name.localeCompare(b.name)); // correct for text
arr.toSorted(cmp);                                // non-mutating (ES2023)
// sort is stable since ES2019 - equal elements keep their relative order

// splice: remove and/or insert in place
arr.splice(1, 2);              // remove 2 items from index 1
arr.splice(1, 0, 'x', 'y');    // insert without removing

// grouping (ES2024)
Object.groupBy(people, (p) => p.dept);
Map.groupBy(people, (p) => p.dept);   // when keys are objects
```

```python
[i * i for i in range(5)]           # comprehensions replace map/filter
list("abc")
[0] * 3
list(range(3))

# Python lists have no holes - the concept does not exist
nums = [3, 1, 2]

nums.index(1)                       # ValueError if absent, not -1
1 in nums
next((o for o in objs if o.id == 1), None)      # the `find` equivalent
nums[-1]                                        # native negative indexing

[fn(x) for x in nums]
[x for x in nums if pred(x)]
from functools import reduce
reduce(lambda a, v: a + v, nums, 0)

sorted(nums)                        # numeric by default
sorted(objs, key=lambda o: o.name)  # a KEY function, not a comparator -
                                    # simpler and faster than JS's comparator
nums.sort()                         # in place; sorted() returns a new list

del nums[1:3]                       # the splice-remove equivalent
nums[1:1] = ["x", "y"]              # the splice-insert equivalent

from itertools import groupby       # ⚠ requires the input to be sorted
```

> **Warning**
>
> **Three array traps, in order of frequency.** (1) `sort()` with no comparator sorts as strings — `[1, 10, 9].sort()` is `[1, 10, 9]`. (2) `forEach` cannot be stopped and ignores the callback's return value and any promise it returns; use `for…of` when you need `break` or `await`. (3) Copying with `slice` or spread is *shallow*: the elements are still shared references.

<a id="20-destructuring"></a>

## 20. Destructuring

Destructuring is pattern matching for binding: you write a picture of the shape you expect on the left, and the matching values are pulled out. Object patterns match **by key**; array patterns match **by position**, and work on any iterable.

> **Interactive animation:** `destructuring` — rendered by the page script in the HTML version.

**Every form, in one place**

```javascript
// object: rename, default, rest
const { id, name: label = 'anon', ...rest } = user;

// nested, with a guard so a missing parent does not throw
const { data: { items = [] } = {} } = response;

// array: skip, default, rest
const [first, , third = 0, ...others] = list;

// swap without a temporary
[a, b] = [b, a];

// in a function signature - named parameters
function draw({ x = 0, y = 0, color = 'red' } = {}) { }

// in a for..of over pairs
for (const [key, value] of Object.entries(config)) { }
for (const { id, name } of users) { }

// in a catch, and in a promise result
try { } catch ({ message }) { }
const [{ value: a }, { value: b }] = await Promise.allSettled([p1, p2]);

// destructuring an assignment (not a declaration) needs parens
({ a, b } = source);

// works on strings, Sets, Maps, generators - anything iterable
const [x, y] = new Set([1, 2, 3]);
const [head, ...tail] = 'hello';
```

```python
# Python unpacks sequences, not mappings
first, second, *others = [1, 2, 3, 4]
a, b = b, a                          # the same swap idiom

# dict "destructuring" has no syntax; the idioms are
id_ = user["id"]
label = user.get("name", "anon")
rest = {k: v for k, v in user.items() if k not in ("id", "name")}

for key, value in config.items(): ...

# structural pattern matching (3.10+) is the closest analogue, and it
# is far more powerful - it matches on shape AND value
match response:
    case {"data": {"items": items}}:
        ...
    case {"error": msg}:
        ...
    case _:
        ...

def draw(*, x=0, y=0, color="red"):   # keyword-only args replace the
    ...                               # destructured options object
```

> **Warning**
>
> Defaults fire on `undefined` only, never on `null`. If an API returns `{ name: null }`, then `const { name = 'anon' } = data` gives you `null`. And destructuring `undefined` itself throws — always give a nested pattern its own `= {}` fallback.

<a id="21-collections"></a>

## 21. Map, Set, WeakMap & WeakSet

Plain objects were used as dictionaries for two decades, and they are bad at it: keys are coerced to strings, inherited keys can collide with yours, there is no size, and deletion is slow. ES2015 added purpose-built collections.

|   | Object | `Map` | `Set` | `WeakMap`/`WeakSet` |
| --- | --- | --- | --- | --- |
| Key type | string / symbol | **any value** | n/a (values) | objects only |
| Order | Integers first, then insertion | Insertion | Insertion | Not iterable |
| Size | `Object.keys(o).length` | `.size` | `.size` | Unavailable |
| Holds keys | Strongly | Strongly | Strongly | **Weakly** — collectable |
| Best for | Records with known fields | Dynamic keyed data | Uniqueness, membership | Metadata attached to objects |

**Using the collections well**

```javascript
const m = new Map([['a', 1], ['b', 2]]);
m.get('a'); m.set('c', 3); m.has('a'); m.delete('a'); m.size;
for (const [k, v] of m) { }        // insertion order, guaranteed
Object.fromEntries(m);             // -> a plain object
new Map(Object.entries(o));        // <- from one

// object keys work, and are compared by identity
const meta = new Map();
meta.set(domNode, { clicks: 0 });  // impossible with a plain object

const s = new Set([1, 2, 2, 3]);
s.size;                            // 3
[...new Set(array)];               // deduplicate in one expression
s.has(x);                          // O(1) - an array's includes is O(n)

// set operations (ES2025); trivially hand-written before that
a.union(b); a.intersection(b); a.difference(b); a.isSubsetOf(b);

// WeakMap: the entry disappears when the key is collected
const cache = new WeakMap();
cache.set(element, expensiveResult);
// element removed from the DOM and dereferenced -> the entry is freed.
// A plain Map here is a textbook memory leak.

// choosing
// - fixed, known field names, needs JSON     -> object
// - keys are dynamic, or not strings         -> Map
// - "have I seen this?"                      -> Set
// - metadata that must not extend a lifetime -> WeakMap
```

```python
m = {"a": 1, "b": 2}          # dict IS the Map equivalent, and keys can
m[("tuple", "key")] = 3       # be any hashable value - no coercion
len(m)
for k, v in m.items(): ...    # insertion-ordered since 3.7

s = {1, 2, 3}                 # set literal
len(set(array))               # deduplicate
x in s                        # O(1)
a | b, a & b, a - b, a <= b   # union, intersection, difference, subset

# the weak equivalents
import weakref
cache = weakref.WeakKeyDictionary()
cache[element] = expensive_result

# One notable difference: Python dict keys must be HASHABLE, so a list
# cannot be a key. JavaScript Map keys are compared by identity, so any
# object works - including two structurally identical objects, which
# will be two DIFFERENT keys.
```

<a id="22-symbols"></a>

## 22. Symbols & Well-Known Symbols

A symbol is a primitive whose only property is that it is **unique**. Two symbols created with the same description are still different values. That makes them collision-proof property keys: you can attach a symbol-keyed property to an object you do not own without any risk of clashing with a present or future string key.

Symbols are also how the language exposes its own internal protocols. The **well-known symbols** are hooks: implement one on your object and built-in syntax starts working with it.

**Symbols as keys and as protocol hooks**

```javascript
const id = Symbol('id');           // the string is a label for debugging only
Symbol('x') === Symbol('x');       // false - always unique

const o = { [id]: 7, name: 'Ada' };
o[id];                             // 7
Object.keys(o);                    // ['name'] - symbols are skipped
JSON.stringify(o);                 // '{"name":"Ada"}' - and dropped
Object.getOwnPropertySymbols(o);   // [Symbol(id)] - findable if you look

// the global registry: same key -> same symbol, across realms
Symbol.for('app.id') === Symbol.for('app.id');   // true

// --- well-known symbols: opting into language syntax ---

// Symbol.iterator makes an object work with for..of and spread
class Range {
  constructor(from, to) { this.from = from; this.to = to; }
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  }
}
[...new Range(1, 4)];              // [1, 2, 3, 4]

// Symbol.asyncIterator makes it work with for await..of
// Symbol.toPrimitive controls coercion (see section 7)
// Symbol.toStringTag customises Object.prototype.toString
class Money { get [Symbol.toStringTag]() { return 'Money'; } }
Object.prototype.toString.call(new Money());   // '[object Money]'

// Symbol.hasInstance customises instanceof
class Even {
  static [Symbol.hasInstance](n) { return n % 2 === 0; }
}
4 instanceof Even;                 // true
```

```python
# Python has no symbols. Its equivalent of "collision-proof key" is a
# private name-mangled attribute, or simply a module-scoped sentinel:
_ID = object()          # unique by identity, like Symbol()
o = {_ID: 7, "name": "Ada"}

# The well-known symbols correspond to Python's DUNDER METHODS - the
# same idea, spelled with reserved names instead of unique keys.
class Range:
    def __init__(self, frm, to):
        self.frm, self.to = frm, to

    def __iter__(self):             # ~ Symbol.iterator
        yield from range(self.frm, self.to + 1)

    def __aiter__(self): ...        # ~ Symbol.asyncIterator
    def __int__(self): ...          # ~ Symbol.toPrimitive
    def __repr__(self): ...         # ~ Symbol.toStringTag
    def __instancecheck__(self): ...# ~ Symbol.hasInstance

list(Range(1, 4))       # [1, 2, 3, 4]

# The trade-off: dunder names are fixed and could theoretically collide
# with a user's attribute; symbols cannot collide at all, at the cost of
# being invisible in normal enumeration.
```

> **Tip**
>
> You will rarely create symbols in application code — but you will implement `Symbol.iterator`, and you will meet symbols when reading library source. Treat them as "the extension points of the language": if you want your object to work with `for…of`, spread, `await` or `instanceof`, there is a symbol for it.

<a id="23-iterators"></a>

## 23. Iterators & Generators

The **iteration protocol** is a small contract that unlocks a lot of syntax. An object is *iterable* if it has a `[Symbol.iterator]()` method returning an *iterator*: an object with a `next()` method that returns `{ value, done }`. That is all. `for…of`, spread, destructuring, `Array.from`, `Promise.all` and `yield*` all speak this protocol and nothing else.

**The protocol, written by hand**

```javascript
const countdown = {
  from: 3,
  [Symbol.iterator]() {
    let n = this.from;
    return {
      next: () => (n > 0 ? { value: n--, done: false } : { value: undefined, done: true }),
      return: () => { /* called on break - clean up here */ return { done: true }; },
      [Symbol.iterator]() { return this; },   // iterators should be iterable
    };
  },
};

[...countdown];                 // [3, 2, 1]
for (const n of countdown) { }  // works
const [a] = countdown;          // works - destructuring uses the protocol
```

```python
class Countdown:
    def __init__(self, frm): self.frm = frm

    def __iter__(self):              # ~ [Symbol.iterator]
        n = self.frm
        while n > 0:
            yield n
            n -= 1

list(Countdown(3))               # [3, 2, 1]
a, *_ = Countdown(3)

# The protocol is the same shape: __iter__ returns an object with
# __next__, which raises StopIteration instead of returning done: true.
```

Writing that by hand is tedious, which is what generators are for. A `function*` returns an iterator automatically, and `yield` suspends the function with its locals intact until the next `next()`.

> **Interactive animation:** `generator` — rendered by the page script in the HTML version.

**Generators in practice**

```javascript
function* range(from, to, step = 1) {
  for (let i = from; i < to; i += step) yield i;
}

// infinite sequences are safe, because nothing is computed until asked
function* naturals() { let n = 0; while (true) yield n++; }

// delegation: yield* forwards to another iterable
function* alphabet() { yield* 'abc'; yield* range(0, 3); }

// lazy pipeline - no intermediate arrays, constant memory
function* map(iter, fn) { for (const v of iter) yield fn(v); }
function* filter(iter, fn) { for (const v of iter) if (fn(v)) yield v; }
function* take(iter, n) { for (const v of iter) { if (n-- <= 0) return; yield v; } }

[...take(filter(map(naturals(), (n) => n * n), (n) => n % 2 === 0), 4)];
// [0, 4, 16, 36]

// two-way communication: next(value) becomes the result of `yield`
function* dialogue() {
  const name = yield 'what is your name?';
  yield `hello ${name}`;
}
const d = dialogue();
d.next();          // { value: 'what is your name?', done: false }
d.next('Ada');     // { value: 'hello Ada', done: false }

// cleanup runs on break, thanks to the implicit return()
function* withFile(path) {
  const handle = open(path);
  try { yield* readLines(handle); }
  finally { handle.close(); }      // runs even if the consumer breaks
}

// async generators + for await..of: streaming without buffering
async function* pages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const { items, nextUrl } = await res.json();
    yield* items;
    next = nextUrl;
  }
}
for await (const item of pages('/api/items')) { process(item); }
```

```python
def rng(frm, to, step=1):
    i = frm
    while i < to:
        yield i
        i += step

def naturals():
    n = 0
    while True:
        yield n
        n += 1

def alphabet():
    yield from "abc"            # identical to yield*
    yield from rng(0, 3)

# Python's itertools already provides the lazy pipeline
from itertools import islice
list(islice((n * n for n in naturals() if (n * n) % 2 == 0), 4))

# two-way communication uses .send() rather than .next(value)
def dialogue():
    name = yield "what is your name?"
    yield f"hello {name}"

d = dialogue()
next(d)          # 'what is your name?'
d.send("Ada")    # 'hello Ada'

def with_file(path):
    handle = open(path)
    try:
        yield from handle
    finally:
        handle.close()

async def pages(url): ...
async for item in pages("/api/items"):
    process(item)
```

<a id="24-errors"></a>

## 24. Errors & Exception Handling

A `throw` unwinds the stack until it finds a `catch`, exactly like every other language with exceptions. JavaScript's peculiarity is that you may throw *any* value — a string, a number, `undefined`. Do not: throwing a non-`Error` loses the stack trace and breaks every handler that expects `err.message`.

**Errors done properly**

```javascript
// the built-in hierarchy - all extend Error
// TypeError      wrong type, or calling a non-function
// RangeError     a value outside the allowed range
// ReferenceError an undeclared name (or a TDZ access)
// SyntaxError    unparseable code, including bad JSON
// AggregateError several errors at once (Promise.any)

// custom errors: subclass, set name, keep the cause
class HttpError extends Error {
  constructor(status, url, options) {
    super(`HTTP ${status} for ${url}`, options);   // options: { cause }
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

try {
  await load();
} catch (err) {
  // rethrow with context, preserving the original as `cause`
  throw new HttpError(500, url, { cause: err });
} finally {
  release();          // runs on success, on throw, and on early return
}

// optional catch binding when you do not need the error
try { risky(); } catch { fallback(); }

// narrowing: check the type before assuming a shape
catch (err) {
  if (err instanceof HttpError && err.status === 404) return null;
  if (err instanceof SyntaxError) return report('bad json');
  throw err;          // anything you cannot handle must go up
}

// finally can swallow errors - a real trap
function bad() {
  try { throw new Error('x'); }
  finally { return 1; }   // ⚠ the return DISCARDS the exception
}

// async errors: await turns a rejection into a throw
try { await mightReject(); } catch (err) { }

// but a promise you never await cannot be caught by try/catch
try { mightReject(); } catch { }         // ⚠ never fires

// global safety nets - for logging, not for control flow
window.addEventListener('unhandledrejection', (e) => report(e.reason));
process.on('uncaughtException', (err) => { report(err); process.exit(1); });
```

```python
class HttpError(Exception):
    def __init__(self, status, url):
        super().__init__(f"HTTP {status} for {url}")
        self.status = status
        self.url = url

try:
    load()
except HttpError as err:
    if err.status == 404:
        result = None
    else:
        raise HttpError(500, url) from err    # `from` == { cause }
except (ValueError, TypeError):
    report("bad input")
else:
    commit()          # runs only if NO exception - JS has no equivalent
finally:
    release()

# Python can only raise instances of BaseException - the JS "throw
# anything" problem cannot occur.

# ExceptionGroup (3.11+) is the AggregateError equivalent
try:
    ...
except* ValueError as eg:
    ...
```

> **Key idea**
>
> **The discipline that keeps error handling sane:** catch only what you can actually handle, rethrow everything else with `cause` so the original stack survives, never use exceptions for ordinary control flow, and never leave an empty `catch` — a swallowed error is a bug that will be reported to you as "it just does nothing".

<a id="unit-5"></a>

## Unit 5 — Asynchronous JavaScript

The call stack and event loop, from callbacks to promises, async/await and concurrency patterns.

<a id="25-call-stack"></a>

## 25. The Call Stack & Execution Contexts

Every function call creates an **execution context**: a record holding the arguments, the local bindings, a reference to the lexical environment (the scope chain), the value of `this`, and where to return to. Contexts are pushed onto a stack; the one on top is running, everything below it is frozen.

> **Interactive animation:** `call-stack` — rendered by the page script in the HTML version.

The stack has a fixed size — roughly ten thousand frames in V8, though it varies with frame size. Exceed it and you get `RangeError: Maximum call stack size exceeded`. Engines do not implement proper tail calls (they are in the specification; only JavaScriptCore ships them), so recursion depth is a real constraint.

**Escaping stack depth**

```javascript
// recursive - fails around 10k
const sumTo = (n) => (n === 0 ? 0 : n + sumTo(n - 1));
sumTo(100000);                     // RangeError

// 1. rewrite as a loop - always the first choice
const sumToLoop = (n) => { let t = 0; for (let i = 1; i <= n; i++) t += i; return t; };

// 2. an explicit stack, for tree/graph walks that are naturally recursive
function walk(root) {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    visit(node);
    stack.push(...node.children);   // depth-first, no call stack used
  }
}

// 3. yield to the event loop, so the stack drains between chunks
async function processAll(items) {
  for (let i = 0; i < items.length; i++) {
    process(items[i]);
    if (i % 500 === 0) await new Promise((r) => setTimeout(r, 0));
  }
}

// reading a stack trace: top frame = where it surfaced, below = callers
new Error().stack;
Error.captureStackTrace(this, MyError);   // V8: hide constructor frames
```

```python
import sys
sys.setrecursionlimit(20000)     # Python lets you raise the limit;
                                 # JavaScript gives you no such knob
def sum_to(n):
    return 0 if n == 0 else n + sum_to(n - 1)

# the same three escapes apply
def sum_to_loop(n):
    return sum(range(1, n + 1))

def walk(root):
    stack = [root]
    while stack:
        node = stack.pop()
        visit(node)
        stack.extend(node.children)

import traceback
traceback.print_exc()            # ~ err.stack
```

<a id="26-event-loop"></a>

## 26. The Event Loop — Tasks & Microtasks

JavaScript has one thread and one stack, yet it handles thousands of concurrent connections and never blocks on a network request. The resolution: **the waiting is not done by JavaScript**. Asynchronous APIs hand work to the host — the browser's networking threads, or Node's libuv thread pool — and register a callback. When the host finishes, it enqueues the callback. The event loop takes callbacks off queues and runs them, one at a time, whenever the stack is empty.

Four parts, one circular path. Every asynchronous surprise in the language is this picture read in order:

*Diagram labels:* the JavaScript thread — one thing at a time · call stack · console.log · render() · main() · <script> · LIFO · push / pop · heap · objects · closures · promises · values live here — · the stack holds frames · the host — browser / Node, many threads · timers — setTimeout / setInterval · network — fetch, XHR, WebSocket · DOM events — click, key, scroll · disk & OS I/O — libuv pool · the waiting happens here, off your thread · ① hand off work · returns at once · ② a promise · settles · ② the host · finishes · MICROTASK QUEUE — jumps the line · .then / .catch / .finally · await resume · queueMicrotask · drained COMPLETELY, every turn · TASK QUEUE — macrotasks · timer fired · I/O complete · click handler · MessageChannel · exactly ONE taken per turn · ③ served first · ③ one per turn · THE EVENT LOOP — one turn, repeated forever · 1 · take ONE · macrotask · 2 · drain ALL · microtasks · 3 · render · rAF → layout → paint · 4 · repeat · only if stack empty · ④ pushed onto the empty stack · step 2 also runs microtasks queued during step 2 — an endless chain there never reaches step 3, and the tab freezes

*The complete circuit. Nothing here runs in parallel with your code except the host's own threads on the right; every callback you write comes back through the same single stack. The colours match the animation below — running now, queued microtask, queued macrotask, rendered.*

> **Interactive animation:** `event-loop` — rendered by the page script in the HTML version.

There are two queues with different priorities, and the interaction between them explains every ordering question:

- **Macrotasks (tasks)**`setTimeout`, `setInterval`, `setImmediate`, I/O completions, DOM events, `MessageChannel`. One is taken per turn of the loop.
- **Microtasks** — Promise reactions, `await` resumptions, `queueMicrotask`, `MutationObserver`. The *entire* queue is drained after each macrotask — including microtasks added while draining.

```text
one turn of the loop
                ─────────────────────────────────────────────────────────
                1. take ONE macrotask from the task queue and run it to completion
                2. drain the ENTIRE microtask queue (newly added ones included)
                3. (browser) run animation frame callbacks, then style/layout/paint
                4. go to 1

                consequences
                • setTimeout(fn, 0) runs after every pending promise callback
                • an await resumption jumps ahead of a timer registered earlier
                • a microtask that queues a microtask forever freezes the page:
                rendering (step 3) is never reached
                • long synchronous work in step 1 blocks steps 2 and 3 entirely
```

**Ordering, and the tools to control it**

```javascript
console.log('1');
setTimeout(() => console.log('5'), 0);
queueMicrotask(() => console.log('3'));
Promise.resolve().then(() => console.log('4'));
console.log('2');
// 1 2 3 4 5

// Node adds two of its own, with a defined position
process.nextTick(fn);   // runs BEFORE promise microtasks - Node only
setImmediate(fn);       // the check phase, after I/O callbacks

// timers are a floor, not a promise: 0 is clamped to ~4ms when nested,
// and a busy stack delays everything
setTimeout(fn, 100);    // "no sooner than 100ms", possibly much later

// splitting long work so the loop can breathe
const chunked = async (items, fn) => {
  for (let i = 0; i < items.length; i++) {
    fn(items[i]);
    if ((i & 1023) === 0) await new Promise((r) => setTimeout(r));
  }
};

// truly parallel work needs another thread
const worker = new Worker('./heavy.js', { type: 'module' });
worker.postMessage(data);          // structured-cloned, not shared
worker.onmessage = (e) => render(e.data);
```

```python
import asyncio

async def main():
    print("1")
    loop = asyncio.get_running_loop()
    loop.call_soon(lambda: print("4"))       # a "task"
    asyncio.create_task(micro())
    print("2")
    await asyncio.sleep(0)                   # yield to the loop

async def micro():
    print("3")

asyncio.run(main())

# asyncio has a SINGLE ready queue - no macrotask/microtask split - so
# ordering is simpler but the priority guarantee JavaScript gives to
# promises does not exist.

# and Python's real parallelism story is different: threads exist but
# share the GIL, so CPU-bound work goes to multiprocessing.
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor() as pool:
    result = await loop.run_in_executor(pool, heavy, data)
```

<a id="27-callbacks"></a>

## 27. Callbacks & Inversion of Control

Before promises, every asynchronous API took a function to call on completion. The pattern works, and you will still meet it in older Node code and event APIs, but it has three specific defects that promises were designed to fix.

**Why callbacks were replaced**

```javascript
// Node's convention: error first, result second
fs.readFile(path, (err, data) => {
  if (err) return handle(err);      // the guard is manual, every time
  parse(data, (err, json) => {
    if (err) return handle(err);
    save(json, (err) => {           // 1. nesting grows with each step
      if (err) return handle(err);
      done();
    });
  });
});

// 2. errors do not propagate - a throw inside a callback escapes any
//    try/catch around the CALL, because the stack has already unwound
try {
  fs.readFile(path, (err, data) => { throw new Error('boom'); });
} catch (e) { /* never runs */ }

// 3. inversion of control: you hand your continuation to code you do
//    not own. It may call you twice, never, or synchronously.
thirdParty.onDone(finish);   // no guarantee finish runs exactly once

// the modern bridge: wrap once, then use promises everywhere
import { promisify } from 'node:util';
const readFile = promisify(fs.readFile);
// or use the promise APIs directly
import { readFile } from 'node:fs/promises';

const data = await readFile(path);
const json = await parse(data);
await save(json);
```

```python
# Python never went through a callback era for I/O - the blocking APIs
# were always synchronous, and asyncio arrived with coroutines already
# in the language.
with open(path) as f:
    data = f.read()

# callbacks do appear in event-driven code, with the same caveats
loop.call_soon(finish)
future.add_done_callback(lambda f: handle(f.result()))

# and the same bridge exists: wrap a callback API into an awaitable
def wrap(api, *args):
    fut = asyncio.get_running_loop().create_future()
    api(*args, callback=lambda err, res:
        fut.set_exception(err) if err else fut.set_result(res))
    return fut
```

> **Tip**
>
> Callbacks are still the right tool for anything that happens *more than once* — `addEventListener`, streams, observers. A promise settles exactly once, so it cannot model a stream of events. When you need many values over time, the choice is a callback, an async generator, or an observable.

<a id="28-promises"></a>

## 28. Promises in Depth

A promise is an object with an internal state (`pending`, `fulfilled`, `rejected`), an internal value, and a list of reactions to run when it settles. It settles at most once, and every reaction is scheduled as a **microtask** — never called synchronously, even if the promise was already settled when you attached the handler.

> **Interactive animation:** `promise-states` — rendered by the page script in the HTML version.

**Creating, chaining and combining**

```javascript
// creating - the executor runs SYNCHRONOUSLY, immediately
const p = new Promise((resolve, reject) => {
  const t = setTimeout(() => resolve('done'), 100);
  if (impossible) reject(new Error('nope'));
});

// already-settled shortcuts
Promise.resolve(v);   Promise.reject(new Error('x'));

// only wrap a CALLBACK api - never wrap a promise in a promise
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// chaining: every .then returns a NEW promise
fetchUser()
  .then((u) => u.id)              // value  -> next promise fulfils with it
  .then((id) => fetchOrders(id))  // promise-> next promise ADOPTS it
  .then((orders) => { throw new Error('x'); })  // throw -> rejects
  .catch((err) => null)           // handles anything above; returning a
                                  // value RESUMES the chain as fulfilled
  .finally(() => hideSpinner());  // no arguments, passes through

// the combinators
Promise.all([a, b]);         // all fulfil, or reject on the FIRST failure
Promise.allSettled([a, b]);  // never rejects; [{status, value|reason}]
Promise.race([a, b]);        // first to SETTLE, success or failure
Promise.any([a, b]);         // first to FULFIL; AggregateError if all fail
```

```python
import asyncio

# a Future is the closest analogue; a coroutine is NOT a promise
fut = asyncio.get_running_loop().create_future()
fut.set_result("done")

async def wait(ms):
    await asyncio.sleep(ms / 1000)

# the combinators
await asyncio.gather(a, b)                        # ~ Promise.all
await asyncio.gather(a, b, return_exceptions=True) # ~ allSettled
done, pending = await asyncio.wait(
    [a, b], return_when=asyncio.FIRST_COMPLETED)   # ~ race

# THE key difference: a Python coroutine does nothing until awaited or
# wrapped in a Task. A JavaScript promise starts its work the instant
# it is created. So this runs sequentially in Python:
#     await a(); await b()
# and so does the JS equivalent - but in JS, `const pa = a(); const pb = b();`
# has ALREADY started both.
```

> **Interactive animation:** `promise-concurrency` — rendered by the page script in the HTML version.

> **Warning**
>
> **Four promise mistakes worth naming.** (1) The `new Promise` executor runs synchronously — putting slow work in it blocks. (2) Wrapping an existing promise in `new Promise` (the "deferred antipattern") loses rejections. (3) Forgetting to `return` inside a `.then` breaks the chain, so the next step receives `undefined`. (4) An unhandled rejection terminates a Node process by default since Node 15.

<a id="29-async-await"></a>

## 29. `async` / `await`

`async`/`await` is syntax over promises. An `async` function always returns a promise; `await` suspends the function, returns control to its caller, and schedules the remainder of the body as a microtask to run when the awaited promise settles. Nothing is blocked and no thread waits.

> **Interactive animation:** `async-await` — rendered by the page script in the HTML version.

Notice in that animation that the function body *starts synchronously* — everything before the first `await` runs immediately, on the caller's stack. Only at the `await` does the function detach.

**Async patterns, right and wrong**

```javascript
// ✗ sequential when it need not be - latency adds up
const user = await fetchUser(id);
const posts = await fetchPosts(id);       // did not need the user

// ✓ overlap independent work
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);

// ✗ forEach ignores the returned promise: `done` prints first,
//   and errors become unhandled rejections
items.forEach(async (i) => { await save(i); });
console.log('done');

// ✓ sequential when order matters
for (const i of items) await save(i);
// ✓ parallel when it does not
await Promise.all(items.map((i) => save(i)));

// ✓ bounded parallelism - the usual real-world requirement
async function pool(items, limit, fn) {
  const running = new Set();
  const results = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    running.add(p);
    p.finally(() => running.delete(p));
    if (running.size >= limit) await Promise.race(running);
  }
  return Promise.all(results);
}

// ✗ awaiting inside a try you did not mean to widen
try {
  const data = await load();
  render(data);            // a render error is now caught as a load error
} catch (e) { showLoadError(e); }

// ✓ keep the try tight
let data;
try { data = await load(); } catch (e) { return showLoadError(e); }
render(data);

// top-level await - ESM modules only
const config = await loadConfig();
```

```python
user = await fetch_user(uid)
posts = await fetch_posts(uid)                # sequential

user, posts = await asyncio.gather(           # overlapped
    fetch_user(uid), fetch_posts(uid))

# Python has no forEach trap, because a bare coroutine call produces a
# "never awaited" RuntimeWarning rather than running silently.

for i in items:
    await save(i)                             # sequential

await asyncio.gather(*(save(i) for i in items))  # parallel

# bounded parallelism, idiomatically
sem = asyncio.Semaphore(5)
async def limited(i):
    async with sem:
        return await save(i)
await asyncio.gather(*(limited(i) for i in items))

# top-level await requires asyncio.run() or an async REPL
```

<a id="30-concurrency"></a>

## 30. Concurrency Patterns & Async Iteration

Concurrency in JavaScript is **interleaving, not parallelism**. One thread makes progress on many operations by suspending at every `await`. That is enough for I/O-bound work, which is most of what JavaScript does. For CPU-bound work you need a second thread: a `Worker` in the browser, a `worker_thread` in Node.

**Cancellation, timeouts, retries and streams**

```javascript
// --- cancellation: AbortController is the standard mechanism ---
const ac = new AbortController();
const res = await fetch(url, { signal: ac.signal });
ac.abort();          // the fetch rejects with an AbortError

// it composes: one signal cancels many operations
element.addEventListener('click', fn, { signal: ac.signal });
await setTimeout(1000, null, { signal: ac.signal });   // node:timers/promises

// built-in timeouts
AbortSignal.timeout(5000);
AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);

// --- retry with exponential backoff and jitter ---
async function retry(fn, { attempts = 3, base = 200 } = {}) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (err) {
      if (i >= attempts - 1 || !isRetryable(err)) throw err;
      const delay = base * 2 ** i * (0.5 + Math.random());
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// --- deduplicate concurrent identical requests ---
const inFlight = new Map();
const dedupe = (key, fn) => {
  if (!inFlight.has(key)) {
    inFlight.set(key, fn().finally(() => inFlight.delete(key)));
  }
  return inFlight.get(key);
};

// --- async iteration: process a stream without buffering it ---
for await (const chunk of response.body) { hash.update(chunk); }

async function* lines(stream) {
  let buf = '';
  for await (const chunk of stream) {
    buf += chunk;
    const parts = buf.split('\n');
    buf = parts.pop();
    yield* parts;
  }
  if (buf) yield buf;
}

// --- true parallelism ---
const worker = new Worker(new URL('./hash.js', import.meta.url), { type: 'module' });
```

```python
# cancellation is built into tasks
task = asyncio.create_task(fetch(url))
task.cancel()                       # raises CancelledError inside

async with asyncio.timeout(5):      # 3.11+ - the AbortSignal.timeout twin
    await fetch(url)

# retry with backoff
async def retry(fn, attempts=3, base=0.2):
    for i in range(attempts):
        try:
            return await fn()
        except RetryableError:
            if i == attempts - 1:
                raise
            await asyncio.sleep(base * 2 ** i * (0.5 + random.random()))

# structured concurrency - JavaScript has no equivalent yet
async with asyncio.TaskGroup() as tg:
    tg.create_task(a())
    tg.create_task(b())
# every task is awaited, and a failure cancels the siblings

async for chunk in response.aiter_bytes():
    hasher.update(chunk)

# true parallelism needs processes, because of the GIL
from concurrent.futures import ProcessPoolExecutor
```

> **Key idea**
>
> The mental model worth carrying: **a promise is a value that arrives later; concurrency is just having several of them in flight at once.** Start the work early, await it as late as possible, bound the parallelism so you do not overwhelm the far end, and attach an `AbortSignal` to anything a user can navigate away from.

<a id="unit-6"></a>

## Unit 6 — Modules, Runtimes & Practice

Modules, memory, the standard built-ins, the browser and Node, tooling and performance, plus the revision material.

<a id="31-modules"></a>

## 31. Modules — ESM vs CommonJS

A module is a file with its own scope, evaluated once and cached. Two systems coexist: **ES modules**, the language standard, and **CommonJS**, Node's original design. They differ in more than syntax — the loading model itself is different, which is why they cannot be freely mixed.

> **Interactive animation:** `module-graph` — rendered by the page script in the HTML version.

ESM loading has three phases. **Construction** finds and parses every module in the graph (possible because `import` is static). **Instantiation** allocates the exports and wires each import to the exporting module's *binding*. **Evaluation** runs the bodies, deepest first. Because imports are bindings rather than copies, an exporter that reassigns a variable is seen by every importer — *live bindings*.

**The two systems side by side**

```javascript
// ===== ESM =====
export const TAX = 0.2;
export function total(items) { }
export default class Cart { }
export { internal as public };
export * from './other.js';               // re-export

import Cart, { total, TAX as VAT } from './cart.js';
import * as cart from './cart.js';
import './side-effects.js';
const mod = await import('./lazy.js');    // dynamic, returns a promise

// live bindings: reassignment is visible to importers
// counter.js
export let count = 0;
export const bump = () => count++;
// main.js
import { count, bump } from './counter.js';
bump(); console.log(count);   // 1 - NOT a stale copy

// ===== CommonJS =====
const { total } = require('./cart');      // runs the file right here
module.exports = { total };               // a value, snapshotted on require
exports.total = total;                    // ⚠ reassigning `exports` breaks it

// interop
// ESM can import CJS:  import cjs from './old.cjs'  (default only)
// CJS cannot require ESM - use await import('./new.mjs')
```

```python
# cart.py
TAX = 0.2
def total(items): ...

# main.py
from cart import total, TAX as VAT
import cart
import importlib
lazy = importlib.import_module("lazy")

# Python imports are dynamic like CommonJS (they execute the module
# when reached) but bind NAMES like ESM - `from x import y` copies the
# current value, so reassigning x.y later is NOT seen by the importer.
# Importing the module itself preserves the live view:
import counter
counter.bump()
print(counter.count)     # 1 - the ESM behaviour

# Modules are cached in sys.modules, exactly like the ESM module map.
```

|   | ESM | CommonJS |
| --- | --- | --- |
| Resolution | Static, before evaluation | Runtime, when `require` runs |
| Conditional import | Only via `await import()` | Any `require` in an `if` |
| Bindings | Live | Value snapshots |
| Tree shaking | Possible | Not reliably |
| Top-level `await` | Yes | No |
| Strict mode | Always | Opt-in |
| Circular imports | Bindings exist but may be in the TDZ | Partially-filled `exports` object |

> **Tip**
>
> Write ESM for anything new: add `"type": "module"` to `package.json`. In ESM you lose `__dirname` and `require`, replaced by `import.meta.url` and `createRequire`. Prefer **named exports** over default: they are refactor-safe, autocomplete correctly, and cannot be silently renamed at the import site.

<a id="32-memory"></a>

## 32. Memory, Garbage Collection & Leaks

Values live in two places. The **stack** holds execution contexts and primitive values, and is freed automatically when a frame pops. The **heap** holds every object, array, function and closure environment, and is reclaimed by the garbage collector.

V8's collector is **generational**. New objects go into a small "young generation" that is collected very frequently with a cheap copying algorithm — most objects die young, so almost nothing gets copied. Survivors are promoted to the "old generation", which is collected less often using mark-and-sweep with incremental and concurrent phases so that pauses stay short.

> **Interactive animation:** `garbage-collection` — rendered by the page script in the HTML version.

The rule the collector actually applies is **reachability**, not usage. Starting from the roots — the global object and every live stack frame — it marks everything reachable and frees the rest. Nothing is freed because you finished with it; it is freed because nothing can reach it. Every leak is therefore the same bug: a reference from a root that nobody dropped.

**The four leaks, and their fixes**

```javascript
// 1. an unbounded cache
const cache = new Map();
cache.set(user, heavyData);        // ⚠ `user` can never be collected
const cache = new WeakMap();       // ✓ the entry dies with the key
// for string keys, bound the size instead (LRU)

// 2. listeners that outlive their target
el.addEventListener('scroll', onScroll);
// ✓ remove explicitly, or use a signal
const ac = new AbortController();
el.addEventListener('scroll', onScroll, { signal: ac.signal });
ac.abort();                        // removes every listener at once

// 3. timers that are never cleared
const t = setInterval(poll, 1000);
clearInterval(t);                  // ✓ in teardown

// 4. a closure retaining more than it needs
function setup() {
  const huge = new Array(1e6).fill(0);
  const small = huge.length;
  return () => small;              // ⚠ the WHOLE scope is retained,
}                                  //   including `huge`
function setupFixed() {
  const small = (() => new Array(1e6).fill(0).length)();  // huge is scoped
  return () => small;              // ✓ nothing large survives
}

// diagnosing: take two heap snapshots, do the suspect action between
// them, and compare. A growing retained size with a stable workload is
// a leak; the retainer path names the culprit.
performance.memory;                     // Chrome, coarse
process.memoryUsage().heapUsed;         // Node
new FinalizationRegistry((k) => log(k)); // observe collection (debug only)
```

```python
# CPython uses REFERENCE COUNTING plus a cycle collector - a different
# design with a visible consequence: objects are freed the instant the
# last reference disappears, so __del__ is far more predictable than
# a JavaScript FinalizationRegistry.
import sys
sys.getrefcount(obj)

import weakref
cache = weakref.WeakKeyDictionary()      # ~ WeakMap

import gc
gc.collect()                             # force a cycle collection
gc.get_referrers(obj)                     # ~ the retainer path

import tracemalloc                        # ~ heap snapshots
tracemalloc.start()
snapshot1 = tracemalloc.take_snapshot()
# ... suspect action ...
snapshot2 = tracemalloc.take_snapshot()
for stat in snapshot2.compare_to(snapshot1, "lineno")[:10]:
    print(stat)

# The leak CAUSES are identical: caches, listeners, timers, closures,
# and module-level collections that only ever grow.
```

<a id="33-copying"></a>

## 33. Copying & Immutability

Because objects are references, "copy" is ambiguous until you say how deep. There are three answers, and choosing the wrong one is the source of a whole genre of state bugs.

> **Interactive animation:** `copy-depth` — rendered by the page script in the HTML version.

**Copying, at each depth**

```javascript
// 1. reference copy - no copy at all
const b = a;

// 2. shallow copy - a new top level, shared insides
const b = { ...a };
const b = Object.assign({}, a);
const b = [...arr];  const b = arr.slice();
// ⚠ Object.assign triggers setters and skips the prototype;
//   spread copies own enumerable properties only

// 3. deep copy
const b = structuredClone(a);       // built in; handles Map/Set/Date/cycles
// throws on functions, DOM nodes, and loses class identity
const b = JSON.parse(JSON.stringify(a));   // ⚠ legacy: drops undefined,
                                           // functions, Symbol; turns Date
                                           // into a string; dies on cycles

// --- immutable updates: copy only the path you change ---
const next = {
  ...state,
  user: { ...state.user, name },              // one level
  items: state.items.map((i) =>               // arrays too
    i.id === id ? { ...i, done: true } : i),
};

// non-mutating array methods make this much shorter (ES2023)
state.items.toSpliced(index, 1);
state.items.with(index, newItem);
state.items.toSorted(cmp);

// enforcing it at runtime, if you must
Object.freeze(obj);                 // shallow, silent unless strict mode
```

```python
b = a                       # reference

import copy
b = copy.copy(a)            # shallow
b = {**a}                   # shallow, for dicts
b = a[:]                    # shallow, for lists
b = copy.deepcopy(a)        # deep, and handles cycles

# immutable updates
next_state = {
    **state,
    "user": {**state["user"], "name": name},
    "items": [{**i, "done": True} if i["id"] == id_ else i
              for i in state["items"]],
}

# Python offers real immutable types, which JavaScript lacks
from types import MappingProxyType
frozen = MappingProxyType(d)        # read-only view
t = (1, 2, 3)                       # tuples are genuinely immutable
frozenset({1, 2})

from dataclasses import dataclass, replace
@dataclass(frozen=True)
class User:
    name: str
    age: int

replace(user, name="new")           # the ergonomic immutable update
```

> **Key idea**
>
> Immutability is not about forbidding writes — it is about **never changing a value someone else may be holding**. Produce a new object and let the old one be collected. This is what makes React's re-render check, Redux's time travel and any `===`-based memoisation work: if the reference is unchanged, the content is guaranteed unchanged.

<a id="34-regex"></a>

## 34. Regular Expressions

Regular expressions are a first-class literal in JavaScript, written between slashes. They are the right tool for validating and extracting from *structured text* — and the wrong tool for parsing nested formats such as HTML or JSON, which are not regular languages.

**Regex, from syntax to the traps**

```javascript
const re = /(\d{4})-(\d{2})-(\d{2})/;      // literal
const dyn = new RegExp(`^${escaped}$`, 'i'); // from a string - escape it!

// flags: g global, i ignore case, m multiline ^$, s dotAll,
//        u unicode, y sticky, d indices
// testing and extracting
re.test('2024-01-15');                     // boolean
'2024-01-15'.match(re);                    // ['2024-01-15','2024','01','15']
[...text.matchAll(/\w+/g)];                // every match, with groups

// named groups make the result readable
const m = '2024-01-15'.match(/(?<y>\d{4})-(?<mo>\d{2})-(?<d>\d{2})/);
m.groups.y;                                // '2024'

// replacing, with a function for anything conditional
text.replace(/(\w+)@(\w+)/g, '$2 at $1');
text.replace(/\d+/g, (n) => String(Number(n) * 2));
text.replaceAll('a', 'b');                 // literal, no regex needed

// lookaround: assert without consuming
/(?<=\$)\d+/.exec('$42')[0];               // '42' - lookbehind
/\d+(?= USD)/.exec('42 USD')[0];           // '42' - lookahead
/^(?!admin)/.test('user');                 // negative lookahead

// ⚠ the lastIndex trap: a /g regex is STATEFUL across .test() calls
const g = /a/g;
g.test('a');    // true
g.test('a');    // false - lastIndex moved past the match
// fix: no /g for test(), or reset g.lastIndex = 0

// ⚠ catastrophic backtracking - nested quantifiers on similar patterns
/^(a+)+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaX');   // exponential time
// fix: avoid nesting, anchor early, or use a real parser

// escaping user input before building a regex
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

```python
import re

pattern = re.compile(r"(\d{4})-(\d{2})-(\d{2})")   # r-strings, not literals

bool(pattern.search("2024-01-15"))
pattern.search("2024-01-15").groups()     # ('2024', '01', '15')
[m.group() for m in re.finditer(r"\w+", text)]

m = re.search(r"(?P<y>\d{4})-(?P<mo>\d{2})", "2024-01")   # named groups
m.group("y")

re.sub(r"(\w+)@(\w+)", r"\2 at \1", text)
re.sub(r"\d+", lambda m: str(int(m.group()) * 2), text)

re.search(r"(?<=\$)\d+", "$42")           # lookbehind - FIXED width only
re.search(r"\d+(?= USD)", "42 USD")

re.escape(user_input)                     # built in, unlike JavaScript

# Python has no lastIndex statefulness - compiled patterns are
# stateless, which removes JavaScript's most surprising regex bug.
# Catastrophic backtracking exists in both; the `regex` package offers
# possessive quantifiers as a mitigation.
```

<a id="35-dates-json-intl"></a>

## 35. Dates, JSON & Intl

`Date` is the worst-designed part of the standard library: months are zero-based, parsing is implementation-dependent, and every instance is mutable. Its replacement, **Temporal**, is shipping now and is worth adopting where available.

**Dates, serialisation and formatting**

```javascript
// --- Date: the survival kit ---
new Date();                        // now
new Date(2024, 0, 15);             // ⚠ month 0 = January, in LOCAL time
new Date('2024-01-15');            // ISO date -> parsed as UTC
new Date('2024-01-15T00:00:00');   // ISO datetime -> parsed as LOCAL ⚠
Date.now();                        // epoch milliseconds - use for arithmetic

d.toISOString();                   // '2024-01-15T00:00:00.000Z' - always UTC
d.getTime();                       // ms since epoch
d.getMonth();                      // 0-11 ⚠

// ⚠ mutable: setDate modifies in place and returns a number
const d2 = new Date(d); d2.setDate(d.getDate() + 1);   // copy first

// --- Temporal: the fix (ES2026 / polyfillable today) ---
Temporal.Now.plainDateISO();            // 2024-01-15 - no time, no zone
Temporal.PlainDate.from('2024-01-15').add({ days: 1 });   // immutable
Temporal.ZonedDateTime.from({ /* explicit zone, always */ });

// --- JSON ---
JSON.stringify(o, null, 2);             // pretty print
JSON.stringify(o, ['a', 'b']);          // allow-list of keys
JSON.stringify(o, (k, v) => typeof v === 'bigint' ? String(v) : v);
JSON.parse(s, (k, v) => k === 'date' ? new Date(v) : v);   // reviver

// what JSON silently loses
JSON.stringify({ a: undefined, b: () => {}, c: Symbol(), d: NaN, e: 1n });
// '{"d":null}'  - undefined/function/symbol dropped, NaN -> null,
//                 BigInt THROWS
// Dates become strings; Map and Set become {}
// an object with a toJSON() method controls its own serialisation

// --- Intl: never format dates or numbers by hand ---
new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(d);
new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(9.9);
new Intl.RelativeTimeFormat('en').format(-3, 'day');   // '3 days ago'
new Intl.ListFormat('en').format(['a', 'b', 'c']);     // 'a, b, and c'
new Intl.Collator('sv').compare('ä', 'z');             // locale-correct sort
```

```python
from datetime import datetime, date, timedelta, timezone

datetime.now(timezone.utc)          # ALWAYS pass a tz - naive datetimes
date(2024, 1, 15)                   # months are 1-based, unlike JS
datetime.fromisoformat("2024-01-15T00:00:00+00:00")
d.isoformat()
d + timedelta(days=1)               # immutable, like Temporal

from zoneinfo import ZoneInfo
datetime.now(ZoneInfo("Europe/Berlin"))

import json
json.dumps(o, indent=2)
json.dumps(o, default=str)          # ~ the replacer function
json.loads(s, object_hook=fn)       # ~ the reviver

# Python's json raises on unserialisable values rather than silently
# dropping them - stricter, and usually what you want.

import locale
from babel.numbers import format_currency   # the Intl equivalent lives
format_currency(9.9, "EUR", locale="de_DE") # in a third-party package
```

> **Warning**
>
> **Store and transmit UTC; format at the edge.** Almost every date bug is a value that was stored in a local timezone, or formatted on the server for a user in another one. Keep ISO-8601 with an explicit offset in your database and on the wire, and call `Intl.DateTimeFormat` only at the moment of display.

<a id="36-dom"></a>

## 36. The DOM & the Browser Event Model

The DOM is a live tree of objects representing the parsed document. It is not part of JavaScript — it is a host API — and it is slow relative to plain object work, because reading certain properties forces the browser to recompute layout.

> **Interactive animation:** `dom-events` — rendered by the page script in the HTML version.

An event travels in three phases: **capture** from the window down to the target, **target**, then **bubble** back up. Ordinary listeners fire during bubbling, which is what makes *delegation* possible: one listener on a container serves every descendant, including elements added later.

**DOM work that stays fast**

```javascript
// building: never concatenate HTML strings with user data
const li = document.createElement('li');
li.textContent = name;             // ✓ inert
li.innerHTML = name;               // ✗ executes markup - XSS
li.dataset.id = id;                // -> data-id attribute

// batch inserts through a fragment: one reflow instead of n
const frag = document.createDocumentFragment();
for (const item of items) frag.append(render(item));
list.append(frag);

// ⚠ layout thrashing: read, write, read, write...
for (const el of els) el.style.height = el.offsetHeight * 2 + 'px';
// ✓ batch: all reads, then all writes
const heights = els.map((el) => el.offsetHeight);
els.forEach((el, i) => { el.style.height = heights[i] * 2 + 'px'; });

// events
list.addEventListener('click', (e) => {
  const row = e.target.closest('[data-id]');   // e.target: what was clicked
  if (row) select(row.dataset.id);             // e.currentTarget: the listener
});
el.addEventListener('click', fn, { once: true, passive: true, capture: false });
// passive: true promises you will not preventDefault - lets scrolling stay
// on the compositor thread

e.preventDefault();     // cancel the browser's default action
e.stopPropagation();    // stop other elements from seeing it - unrelated!

// custom events for component communication
el.dispatchEvent(new CustomEvent('itemSelected', {
  detail: { id }, bubbles: true,
}));

// observers: react to the DOM without polling
new IntersectionObserver(onVisible).observe(el);   // lazy loading
new ResizeObserver(onResize).observe(el);
new MutationObserver(onMutate).observe(el, { childList: true });

// scheduling visual work
requestAnimationFrame(update);          // before the next paint
requestIdleCallback(lowPriorityWork);   // when the browser is free
```

```python
# There is no DOM on the server. The equivalent operations are
# templating (build) and parsing (read).
from jinja2 import Template
Template("<li>{{ name }}</li>").render(name=user_input)
# Jinja2 autoescapes by default - the textContent equivalent

from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
soup.select_one("#list")
soup.select("li.active")
[li.get_text() for li in soup.select("li")]

import html
html.escape(user_input)

# For driving a real browser DOM from Python:
from playwright.async_api import async_playwright
# page.click(), page.text_content() - the same tree, remote-controlled
```

The final DOM concern is the rate at which events arrive. Scroll, resize, mousemove and input can fire dozens of times per second, far more often than any handler needs to run:

> **Interactive animation:** `debounce-throttle` — rendered by the page script in the HTML version.

<a id="37-fetch"></a>

## 37. Fetch, HTTP & AbortController

`fetch` returns a promise that fulfils as soon as the response *headers* arrive — the body is streamed separately. The single most important thing to know is that it **rejects only on network failure**. A 404 or a 500 is a successful HTTP exchange, so the promise fulfils and you must check `res.ok` yourself.

**A fetch wrapper worth reusing**

```javascript
async function api(path, { method = 'GET', body, signal, timeout = 10000 } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeout)].filter(Boolean)),
  });

  if (!res.ok) {                            // ⚠ never omit this
    const detail = await res.text().catch(() => '');
    throw new HttpError(res.status, path, { cause: detail });
  }
  return res.status === 204 ? null : res.json();
}

// the body can be read ONCE - clone if you need it twice
const copy = res.clone();

// streaming a large response instead of buffering it
for await (const chunk of res.body) { process(chunk); }

// uploads: FormData sets its own Content-Type boundary - do not set it
const fd = new FormData();
fd.append('file', fileInput.files[0]);
await fetch('/upload', { method: 'POST', body: fd });

// cancellation on navigation or a new keystroke
let ac;
async function search(q) {
  ac?.abort();                      // cancel the previous request
  ac = new AbortController();
  try {
    return await api(`/search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
  } catch (e) {
    if (e.name === 'AbortError') return;   // expected, not an error
    throw e;
  }
}

// CORS in one line: the browser blocks cross-origin reads unless the
// SERVER sends Access-Control-Allow-Origin. It is not something you can
// fix in client code - and a "CORS error" in the console is usually a
// failed preflight OPTIONS request.
```

```python
import httpx

async def api(path, method="GET", body=None, timeout=10.0):
    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.request(
            method, path,
            json=body,                     # sets Content-Type automatically
        )
        res.raise_for_status()             # DOES raise on 4xx/5xx,
        return res.json() if res.content else None   # unlike fetch

# streaming
async with client.stream("GET", url) as res:
    async for chunk in res.aiter_bytes():
        process(chunk)

# uploads
files = {"file": open("photo.jpg", "rb")}
await client.post("/upload", files=files)

# cancellation
task = asyncio.create_task(api("/search"))
task.cancel()

# CORS does not apply - it is a browser security policy, and server-to
# -server requests are never subject to it.
```

<a id="38-node"></a>

## 38. Node.js Essentials

Node is V8 plus **libuv**, a library providing the event loop, a thread pool and asynchronous file and network I/O. Your JavaScript still runs on one thread; libuv does the blocking work elsewhere and enqueues callbacks. Node's loop has named phases, which matters when you need to reason about `setImmediate` versus `setTimeout`.

```text
Node event loop phases (one iteration)
                ┌───────────────┐
                │ timers │ setTimeout / setInterval callbacks
                ├───────────────┤
                │ pending │ some system callbacks (e.g. TCP errors)
                ├───────────────┤
                │ poll │ retrieve new I/O events; execute I/O callbacks.
                │ │ BLOCKS here when there is nothing else to do.
                ├───────────────┤
                │ check │ setImmediate callbacks
                ├───────────────┤
                │ close │ 'close' events (socket.on('close'))
                └───────────────┘
                between every phase: process.nextTick queue, then promise microtasks
```

**The Node API surface you need**

```javascript
// prefer the promise APIs, and the node: prefix
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { EventEmitter } from 'node:events';

// ESM has no __dirname
const dir = path.dirname(new URL(import.meta.url).pathname);

// environment and arguments
process.env.NODE_ENV;
process.argv.slice(2);
process.exitCode = 1;                  // safer than process.exit()

// EventEmitter - Node's callback backbone
class Queue extends EventEmitter {
  push(job) { this.emit('job', job); }
}
q.on('job', handle);           // many listeners, many times
q.once('ready', start);
// ⚠ an 'error' event with no listener CRASHES the process

// streams: constant memory over unbounded data
import { pipeline } from 'node:stream/promises';
await pipeline(
  createReadStream('in.csv'),
  createGzip(),
  createWriteStream('out.csv.gz'),
);   // pipeline handles errors and cleanup; .pipe() does not

// CPU-bound work off the main thread
import { Worker } from 'node:worker_threads';
new Worker('./hash.js', { workerData: buf });

// graceful shutdown - always, in every server
process.on('SIGTERM', async () => {
  server.close();
  await db.end();
  process.exitCode = 0;
});
```

```python
import os, sys, asyncio
from pathlib import Path

Path(__file__).parent                  # ~ __dirname, always available
os.environ.get("ENV")
sys.argv[1:]
sys.exit(1)

# Python's threading model is the big divergence: threads exist but the
# GIL serialises bytecode execution, so CPU-bound work needs processes.
from concurrent.futures import ProcessPoolExecutor

# the EventEmitter equivalent is usually a simple callback registry,
# or blinker/pyee
from pyee.asyncio import AsyncIOEventEmitter
q = AsyncIOEventEmitter()
q.on("job", handle)

# streaming with constant memory
import gzip, shutil
with open("in.csv", "rb") as fin, gzip.open("out.csv.gz", "wb") as fout:
    shutil.copyfileobj(fin, fout)

# graceful shutdown
import signal
loop.add_signal_handler(signal.SIGTERM, shutdown)
```

<a id="39-tooling"></a>

## 39. Tooling — npm, Bundlers & Types

No language has a larger tooling surface, and most of it exists to solve two problems: JavaScript had no module system for its first twenty years, and browsers only run what they can parse today.

**The commands and files that matter**

```bash
# packages
npm install lodash              # adds to dependencies + lockfile
npm install -D vitest           # devDependencies - not shipped
npm ci                          # install EXACTLY the lockfile; use in CI
npm run build                   # run a script from package.json
npx tsc --noEmit                # run a binary without installing globally
npm audit fix                   # known vulnerabilities
npm outdated                    # what has moved on

# semver ranges in package.json
# "^1.2.3"  -> >=1.2.3 <2.0.0   (default; minor + patch)
# "~1.2.3"  -> >=1.2.3 <1.3.0   (patch only)
# "1.2.3"   -> exactly that version

# COMMIT package-lock.json. NEVER commit node_modules.
```

```javascript
// package.json - the fields that matter
{
  "name": "app",
  "type": "module",              // ESM by default
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "exports": {                   // controls what consumers may import
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  },
  "dependencies": {},            // needed at runtime
  "devDependencies": {}          // needed only to build/test
}

// what a bundler does
//  - resolve the module graph from an entry point
//  - TREE SHAKE: drop exports nobody imported (needs ESM)
//  - CODE SPLIT: a dynamic import() becomes a separate chunk
//  - transpile newer syntax down to a chosen browser target
//  - minify, hash filenames for cache busting, emit source maps

// types without TypeScript: JSDoc gives you editor checking
/** @param {string} name @returns {Promise<User>} */
export async function findUser(name) { }
```

> **Tip**
>
> The one tooling decision with a large payoff is **adding types**, whether through TypeScript or JSDoc annotations checked by `tsc`. Most of the traps in this course — `undefined` where an object was expected, a missing `await`, a typo'd property — are caught at the keystroke rather than in production. Everything else (which bundler, which test runner) matters far less than picking one and moving on.

<a id="40-performance"></a>

## 40. Performance Patterns & Pitfalls

Performance work has a strict order: **measure, find the dominant cost, fix that, measure again**. In practice the dominant cost is almost never the language — it is an O(n²) algorithm, a blocked main thread, or a network waterfall.

**The wins, in order of size**

```javascript
// 1. ALGORITHMS - the only order-of-magnitude win
// O(n²): for each item, scan the whole other array
const matched = a.filter((x) => b.some((y) => y.id === x.id));
// O(n): index once, then look up
const ids = new Set(b.map((y) => y.id));
const matched = a.filter((x) => ids.has(x.id));

// 2. DO NOT BLOCK THE MAIN THREAD
// chunk long work, or move it to a Worker
// anything over ~50ms is a visible stall

// 3. NETWORK: parallelise, cache, and do not waterfall
const [a, b] = await Promise.all([getA(), getB()]);   // not two awaits
// dedupe identical in-flight requests; add HTTP caching headers

// 4. RENDERING: batch reads and writes, virtualise long lists,
//    and use requestAnimationFrame for anything visual

// 5. LAZY LOADING: split the bundle at route boundaries
const Chart = await import('./Chart.js');

// 6. ENGINE-LEVEL, and only inside a proven hot path
//    - keep object shapes consistent (same keys, same order)
//    - keep arrays packed and monomorphic
//    - avoid delete on hot objects; assign undefined or use a Map
//    - avoid try/catch in the innermost loop of a hot function

// measuring, not guessing
console.time('parse'); parse(); console.timeEnd('parse');
performance.mark('a'); performance.measure('work', 'a');
// browser: Performance panel + Lighthouse
// node:    node --cpu-prof, or --inspect with the Chrome profiler
```

```python
# The priority order is identical; only the tools differ.
ids = {y.id for y in b}
matched = [x for x in a if x.id in ids]

results = await asyncio.gather(get_a(), get_b())

import cProfile, pstats
cProfile.run("main()", "out.prof")
pstats.Stats("out.prof").sort_stats("cumulative").print_stats(20)

from timeit import timeit
timeit("parse()", globals=globals(), number=1000)

import line_profiler        # per-line timings
# and for CPU-bound hot paths: numpy, Cython, or a native extension -
# Python's equivalent of "move it to a Worker".
```

> **Warning**
>
> **Micro-optimisation is where time goes to die.** "Is `for` faster than `forEach`?" has an answer, and it is irrelevant next to a single unnecessary network round trip. Optimise the algorithm and the waterfall first; touch engine-level details only when a profile names the exact function.

<a id="41-cheat-sheet"></a>

## 41. Cheat Sheet

<a id="41-1-syntax"></a>

### Syntax you should not have to look up

```text
DECLARATIONS
                const x = 1 block scoped, no reassignment (value still mutable)
                let x = 1 block scoped, reassignable
                var x = 1 function scoped — do not use

                FUNCTIONS
                function f() {} hoisted whole, own `this`
                const f = () => {} no `this`, no `arguments`, no `new`
                { f() {} } method shorthand — use for object/class methods
                (a, b = 1, ...rest) default and rest parameters
                f(...args) spread at the call site

                OBJECTS & ARRAYS
                { ...a, b: 1 } shallow copy with an override
                { [key]: v } computed key
                a?.b?.c optional chaining
                a ?? b nullish coalescing (null/undefined only)
                a ||= b a ??= b logical assignment
                const { a, b: c = 1 } destructure, rename, default
                const [x, , y] positional destructure with a skip

                CLASSES
                class A extends B {} single inheritance
                #private hard-private field, engine enforced
                static x / static {} class-level field / init block
                get x() / set x(v) accessors
                super(...) / super.m() parent constructor / parent method

                ASYNC
                async function f() {} always returns a promise
                await p suspend; resume in a microtask
                for await (const x of s) async iteration
                Promise.all / allSettled / race / any
                new AbortController() cancellation for fetch, listeners, timers

                MODULES
                export const / default named (preferred) / default
                import x, { y as z } default + named with rename
                await import('./m.js') dynamic, lazy, code-splittable
```

<a id="41-2-decisions"></a>

### Decision table

| Need | Reach for | Not |
| --- | --- | --- |
| Compare values | `===` | `==` (except `x == null`) |
| Default a value | `??` | `\|\|` — kills `0` and `''` |
| Keyed data with dynamic keys | `Map` | Plain object |
| Membership test | `Set.has` — O(1) | `arr.includes` — O(n) |
| Metadata on an object | `WeakMap` | `Map` — leaks |
| Find one element | `find` | `filter(...)[0]` |
| Loop with `break` or `await` | `for…of` | `forEach` |
| Iterate object keys | `Object.entries` | `for…in` |
| Independent async work | `Promise.all` | Sequential `await`s |
| Deep copy | `structuredClone` | `JSON.parse(JSON.stringify(x))` |
| Insert user text into the DOM | `textContent` | `innerHTML` |
| Cancel in-flight work | `AbortController` | A boolean flag |
| Format a date or number | `Intl.*` | Manual string building |
| Money | Integer minor units | `number` with decimals |

<a id="41-3-gotchas"></a>

### The gotchas, one line each

```text
0.1 + 0.2 !== 0.3 IEEE-754 — compare with Number.EPSILON
                NaN !== NaN use Number.isNaN, or arr.includes(NaN)
                typeof null === 'object' a 1995 bug; use x === null
                [10, 9, 1].sort() sorts as strings; pass (a, b) => a - b
                sort/reverse/splice mutate; use toSorted/toReversed/slice
                [] and {} are truthy check .length or Object.keys().length
                0 || 100 === 100 use ?? when 0 is valid
                new Date(y, 0, d) months are ZERO-based
                fetch does not reject on 404 always check res.ok
                forEach ignores async use for…of or Promise.all(map(...))
                obj.method as a callback loses `this`; wrap in an arrow or bind
                {...a} is shallow nested objects are still shared
                0 < x < 10 parses as (0 < x) < 10 — always true
                /g regex .test() stateful via lastIndex — reset or drop /g
                var in a loop one binding for all iterations; use let
```

<a id="42-playbook"></a>

## 42. Pattern-Recognition Playbook

Debugging JavaScript is mostly pattern matching: a symptom maps to one of a handful of mechanisms. This table is the shortcut.

| Symptom | Almost always | Check |
| --- | --- | --- |
| `Cannot read properties of undefined` | A value earlier in the chain is missing | Log the parent; add `?.` only once you know why |
| `x is not a function` | A typo, a wrong import, or a lost `this` | Is it a default vs named export? Was the method detached? |
| `Cannot access 'x' before initialization` | Temporal dead zone | Move the `const` above first use; check for shadowing |
| `this is undefined` in a callback | The method was passed, not called on its object | Wrap in an arrow, or `bind` |
| State "changes by itself" | A shared reference | Who else holds this object? Spread before mutating |
| Logs print in the wrong order | Microtask vs macrotask | Sync first, then all microtasks, then one timer |
| A value is `undefined` right after an async call | A missing `await` | Did the function return a promise? Is it inside a `forEach`? |
| The `catch` never runs | The promise is not awaited, or `fetch` got a 404 | Check `res.ok`; check the `await` is inside the `try` |
| Loop closures all see the last value | `var` — one shared binding | Switch to `let` |
| Memory grows without bound | Cache, listener, timer or closure retained | Two heap snapshots; read the retainer path |
| The page freezes | Long synchronous work, or a microtask loop | Profile the main thread; chunk or move to a Worker |
| Works locally, fails deployed | CORS, env vars, or a case-sensitive filesystem | Network tab first; then the exact import casing |
| Sorting is wrong | No comparator, or a locale issue | `(a, b) => a - b`, or `localeCompare` |
| Numbers are slightly off | Float arithmetic on money | Move to integer cents |

<a id="42-1-reading-unfamiliar-code"></a>

### Reading unfamiliar JavaScript

1. **Is it a module or a script?** That tells you the scope rules and whether strict mode is on.
2. **Find the async boundaries.** Every `await`, `.then` and callback is a point where other code can run.
3. **Follow the references.** For any object that seems to change unexpectedly, ask who else holds it.
4. **Check each `this` against the call site**, not the definition.
5. **Identify what is shared.** Module-level state is a singleton; closure state is per-call.

<a id="43-roadmap"></a>

## 43. Practice Roadmap

Reading this page will not make you fluent. Building these will. Each project is chosen because it forces a specific mechanism from the course into your hands.

<a id="43-1-week-one"></a>

### Foundations — small, self-contained

- **Reimplement the array methods** — Write `map`, `filter`, `reduce`, `find` and `flat` from scratch on `Array.prototype`. Forces: callbacks, `this`, holes, early exit.
- **Write `deepEqual` and `deepClone`** — Handle cycles, `Map`, `Set`, `Date` and `NaN`. Forces: references, recursion, the type system's edges.
- **Build `debounce`, `throttle`, `once`, `memoize`** All four in fewer than forty lines. Forces: closures, timers, argument forwarding.
- **Implement a promise**`MyPromise` with `then`, `catch`, `all` and correct microtask timing. The single most educational exercise here.

<a id="43-2-applied"></a>

### Applied — a real thing that runs

- **A search-as-you-type UI** — Debounced input, request cancellation with `AbortController`, request deduplication, a loading state and error handling. Touches almost every async section at once.
- **A virtualised list of 100,000 rows** — Render only what is visible, using `IntersectionObserver` and event delegation. Forces: DOM cost, batching, the frame budget.
- **A tiny state store** — Subscribe, dispatch, immutable updates, and structural sharing. Forces: closures, copying, `===`-based change detection.
- **A CLI in Node** — Read a large file as a stream, transform it, write it out, handle `SIGTERM`. Forces: modules, streams, back-pressure, graceful shutdown.

<a id="43-3-depth"></a>

### Depth — go and read the primary sources

1. [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — the reference to keep open. Accurate, versioned, and the source most other sites paraphrase.
2. [The ECMAScript specification](https://tc39.es/ecma262/) — read the sections on abstract equality and on Job queues once. They are shorter than you expect and they settle arguments permanently.
3. [javascript.info](https://javascript.info/) — a well-sequenced tutorial with exercises; the best complement to a reference.
4. [You Don't Know JS Yet](https://github.com/getify/You-Dont-Know-JS) — book-length treatment of scope, closures, `this` and types.
5. [The V8 blog](https://v8.dev/blog) — for hidden classes, inline caches and garbage collection, from the people who wrote them.

<a id="43-4-checklist"></a>

### A self-check before you call it learned

You can explain, without notes, each of the following. If one of them is fuzzy, the section it comes from is linked from the table of contents.

1. Why `0.1 + 0.2 !== 0.3`, and what you would do about money.
2. What the temporal dead zone is and why it is an improvement over `var`.
3. What a closure captures, and why a `var` loop prints the last value three times.
4. The four `this` binding rules in priority order, and where arrows sit.
5. What happens when you read a property that an object does not have.
6. The exact output order of a script mixing `setTimeout`, a promise and a `console.log`.
7. What `await` does to the call stack.
8. The difference between `Promise.all`, `allSettled`, `race` and `any`.
9. Why `{...a}` is not enough, and what `structuredClone` adds.
10. Four ways to leak memory, and the fix for each.

> **Key idea**
>
> The through-line of this entire course: **JavaScript is small and consistent underneath a surface that is neither.** Values are either primitives or references. Names resolve lexically. Objects delegate to other objects. `this` comes from the call site. And everything asynchronous resumes through a queue after the stack empties. Five mechanisms — every feature and every bug in the language is one of them wearing a costume.

---

TechToday Study Library — JavaScript
