<!--
Source: javascript-crash-course.html
Title: JavaScript Crash Course | TechToday
Description: A visual crash course in JavaScript — types and coercion, scope and the temporal dead zone, references, closures, prototypes, the event loop, promises and async/await, modules and the DOM, each explained with a step-by-step animation.
Theme-color: #0b0d10
Stylesheets: javascript-study.css, ../../../site-header.css
Scripts: javascript-study.js
-->

Navigation: [TechToday](../../../index.html) · [← Programming Languages](../programming-languages.html)

<a id="javascript-crash-course"></a>

# JavaScript

JavaScript is easy to start and famously easy to be confused by, because a handful of its mechanisms — `this`, closures, coercion, the event loop — are invisible until they bite. This page teaches those mechanisms directly. Each section gives you a mental model, an animation of the machine actually doing the work, and the two or three lines you will type this week. Press **Play** on any animation and step through it; the language tabs let you compare the same idea in JavaScript and Python.

> **Key idea**
>
> Almost every JavaScript surprise comes from one of **four** mechanisms: values are compared by *reference* when they are objects; names are resolved *lexically*, up the scope chain; `this` is decided by the *call site*, not the definition; and anything asynchronous runs *after* the current script finishes, through a queue. Learn those four and the language stops being surprising.

<a id="table-of-contents"></a>

## Table of Contents

1. [What JavaScript Actually Is](#0-what-javascript-is)
2. [Values, Types & the Two Equalities](#1-values-and-types)
3. [Variables, Scope & the Temporal Dead Zone](#2-variables-and-scope)
4. [Objects, Arrays & References](#3-objects-and-references)
5. [Functions, Arrows & `this`](#4-functions-and-this)
6. [The Array Methods That Replace Loops](#5-array-methods)
7. [The Call Stack & the Single Thread](#6-the-call-stack)
8. [Closures](#7-closures)
9. [Prototypes & Classes](#8-prototypes-and-classes)
10. [The Event Loop](#9-the-event-loop)
11. [Promises & async/await](#10-promises-and-async)
12. [Modules & the Ecosystem](#11-modules)
13. [The Browser — DOM, Events & fetch](#12-the-browser)
14. [The Whole Thing on One Page](#13-the-whole-thing-on-one-page)

<a id="0-what-javascript-is"></a>

## What JavaScript Actually Is

Before any syntax, one distinction that clears up half the confusion beginners have: **JavaScript the language is tiny, and almost everything you actually use is not part of it**. The language gives you values, objects, functions, and a rule for when code runs. It has no way to read a file, draw a pixel, open a socket, or even print. Those come from whatever *host* is running the language.

- **Spec** `ECMAScript`
- **Engine** `V8, SpiderMonkey`
- **Runtime** `browser, Node`
- **Threads** `1`

> **Analogy** 🎹
>
> **Picture it — an engine, a chassis, a driver**
>
> The **specification** (ECMAScript) is the blueprint: what `+` means, how `this` is resolved, what a promise does. The **engine** (V8 in Chrome and Node, SpiderMonkey in Firefox, JavaScriptCore in Safari) is a concrete implementation of that blueprint — it parses your code, compiles it, and runs it. The **runtime** is everything bolted around the engine: in a browser that means the DOM, `fetch`, timers and the event loop; in Node it means the filesystem, HTTP servers and processes. Same engine, different chassis — which is exactly why `document` is undefined in Node and `fs` is undefined in a browser.

The second thing worth knowing early: JavaScript is **compiled, not interpreted line by line**, even though nothing looks compiled. V8 parses your whole file, generates bytecode, starts running it, watches which functions get hot, and then recompiles those to optimised machine code — while making guesses about the types you have been passing. If you later break a guess (a function that always got numbers suddenly gets a string), it throws the optimised version away and starts again. This is why "keep the shape of your objects consistent" is real performance advice and not folklore.

```text
 your source
                │
                ▼
                ┌────────┐ AST ┌───────────┐ bytecode ┌────────────┐
                │ parser │ ───────▶ │ Ignition │ ─────────▶ │ interpreter│──┐
                └────────┘ │(bytecode) │ └────────────┘ │
                └───────────┘ │ hot?
                ▼
                ┌───────────────────────────┐
                │ TurboFan: optimised machine│
                │ code + type assumptions │
                └───────────────────────────┘
                │ assumption broken
                ▼ (deoptimise)
                back to bytecode
```

> **Tip**
>
> Two settings decide how strict the language is with you, and modern code turns both on without you noticing. **Strict mode** (automatic inside modules and classes) makes silent failures throw — assigning to an undeclared variable, duplicate parameter names, `this` defaulting to the global object. **Module scope** means your top-level `const` is not a global. If you are writing a `<script type="module">` or a file in a `"type": "module"` package, you already have both.

<a id="unit-1"></a>

## Unit 1 — The Language in Your Hands

Five sections on the parts you type every day: values and how they compare, where names live, what a variable really holds, how functions bind `this`, and the array methods that make loops unnecessary. Nothing here is advanced — but each one has a sharp edge that costs people hours.

<a id="1-values-and-types"></a>

### Values, Types & the Two Equalities

- **Primitives** `7`
- **Falsy values** `8`
- **Number type** `float64 only`
- **Safe integers** `±2⁵³−1`

JavaScript has exactly seven primitive types — `number`, `string`, `boolean`, `null`, `undefined`, `symbol`, `bigint` — and one non-primitive: **object**. Arrays, functions, dates, regexes, `Map`, `Set` and class instances are all objects. That is the whole type system. There is no integer type, no char, no float versus double.

The consequence that catches everyone: **every number is a 64-bit float**. Integers up to 2⁵³−1 are exact, so day-to-day arithmetic is fine, but decimals are not — `0.1 + 0.2` really is `0.30000000000000004`, in every language with IEEE-754 doubles. Money belongs in integer cents or a decimal library, never in a float.

> **Analogy** 📏
>
> **Picture it — a ruler with binary ticks**
>
> A float can only land on ticks that are sums of powers of two. `0.5` and `0.25` are ticks; `0.1` falls between them, so the nearest tick is stored instead. Add two approximations and the error becomes visible in the last digits. Nothing is broken — you asked a binary ruler to measure a decimal length.

The other daily decision is which equality to use, and it is not a style question — the two operators run genuinely different algorithms. `===` asks "same type and same value?". `==` is allowed to *convert* the operands until the types match, following a specification algorithm nobody memorises. Step through it below and watch `[] == false` become true through three separate conversions.

> **Interactive animation:** `coercion` — rendered by the page script in the HTML version.

- **Strength — `===` is predictable** — One rule, no conversions, no surprises. Use it everywhere. Linters default to enforcing it precisely because the alternative is unpredictable.
- **Weakness — `==` is three algorithms deep** — The result depends on the types of both operands and on `valueOf`/`toString`. The one accepted use is `x == null`, deliberate shorthand for "null or undefined".

Related, and just as common: **truthiness**. `if (x)` does not ask "does `x` exist?" — it converts `x` to a boolean. Exactly eight values are falsy (`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`) and *everything* else is truthy, including `[]`, `{}` and the string `'0'`. That is why `count || 10` quietly replaces a legitimate `0`, and why `??` exists.

**Interview question**

*Why does `typeof null` return `'object'`, and how do you reliably tell an array from an object?*

`typeof null === 'object'` is a bug from 1995 that can never be fixed without breaking the web: values were tagged with a type in their low bits, and the null pointer's tag happened to collide with the object tag. Similarly `typeof []` is `'object'`, because an array *is* an object. So `typeof` is only trustworthy for primitives — for anything else use a purpose-built check: `Array.isArray` for arrays, `instanceof` for class instances, and `Object.prototype.toString.call(x)` when you need to distinguish a `Date` from a `Map` from a plain object.

**Answer — checking types honestly**

```javascript
typeof null;          // 'object'   <- historical bug
typeof [];            // 'object'   <- arrays ARE objects
typeof function () {}; // 'function' <- the one object typeof names
typeof NaN;           // 'number'   <- NaN is a number that isn't one

// what to use instead
Array.isArray([]);                 // true
value instanceof Date;             // true for dates (fails across iframes)
Object.prototype.toString.call(v); // '[object Map]' etc - works for everything

// the null/undefined check you actually want
const isNullish = (v) => v == null;        // true for null AND undefined
const isMissing = (v) => v === undefined;  // only undefined

Number.isNaN(NaN);        // true   - no coercion
isNaN('hello');           // true   - coerces first, almost never what you want
Number.isInteger(5.0);    // true
Number.isSafeInteger(2 ** 53); // false
```

```python
# Python's equivalents, for contrast
type(None)            # <class 'NoneType'>  - no historical accident
isinstance([], list)  # True
callable(lambda: 1)   # True

# Python has no truthiness surprises of the same depth, but shares one:
bool([]), bool({}), bool("")   # (False, False, False)  <- differs from JS!
# In JavaScript [] and {} are TRUTHY. This is the single biggest
# translation error when moving between the two languages.

0.1 + 0.2 == 0.3      # False - the same IEEE-754 float, same result
```

> **Warning**
>
> **The gotcha that ships bugs:** `NaN !== NaN`. Any arithmetic on a non-number produces `NaN`, which then silently poisons every calculation downstream, and comparing it to itself is false — so `arr.indexOf(NaN)` returns `-1` even when `NaN` is in the array. Guard at the boundary with `Number.isNaN`, and use `arr.includes(NaN)`, which uses a different comparison and does find it.

<a id="2-variables-and-scope"></a>

### Variables, Scope & the Temporal Dead Zone

- **Declarations** `const, let, var`
- **const scope** `block`
- **var scope** `function`
- **Lookup cost** `O(depth)`

The rule is short: **use `const` by default, `let` when you must reassign, and `var` never**. But the reason matters, because it explains a whole family of bugs in older code.

`var` is scoped to the enclosing *function*, ignoring blocks entirely — a `var` declared inside an `if` is visible after it. It is also *hoisted and initialised to `undefined`*, so reading it before the declaration gives you a value rather than an error. `let` and `const` are scoped to the enclosing **block**, and while they are hoisted too, they are left uninitialised: touching one before its declaration throws. That gap is the **temporal dead zone**, and it converts a silent `undefined` into a loud error.

> **Interactive animation:** `hoisting` — rendered by the page script in the HTML version.

> **Key idea**
>
> `const` makes the *binding* constant, not the value. `const user = {}` forbids `user = something` but permits `user.name = 'x'` all day. If you want the value frozen too, that is `Object.freeze(user)` — and even that is shallow.

Where a name is *looked up* is the second half of the story. When the engine meets a name, it searches the current scope, then the scope that *lexically encloses* it in the source, then the next one out, until it reaches global — and throws `ReferenceError` if it never finds it. Crucially this chain is fixed by **where the function was written**, not by who called it. Two functions calling the same helper see the same chain.

> **Interactive animation:** `scope-chain` — rendered by the page script in the HTML version.

**Interview question**

*Why does this loop print `3 3 3` with `var` but `0 1 2` with `let`?*

Because `var i` creates *one* binding for the whole function. All three callbacks close over that single variable, and by the time the timers fire the loop has finished and `i` is `3`. `let i` is different in a way that looks like magic but is specified explicitly: a `for` loop with `let` creates a **fresh binding per iteration** and copies the current value into it. Three iterations, three separate variables, three different captured values. This is the single best argument for `let` over `var`.

**Answer — the classic loop closure**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3 3 3  - one shared binding, read after the loop ended

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0 1 2  - a new binding per iteration

// the pre-2015 workaround: an IIFE to force a new scope
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 0);
  })(i);
}
// 0 1 2
```

```python
# Python has the identical trap, and no `let` to save you
fns = []
for i in range(3):
    fns.append(lambda: print(i))
for f in fns:
    f()          # 2 2 2 - late binding, one shared `i`

# the fix is the same idea: bind the value now, via a default argument
fns = []
for i in range(3):
    fns.append(lambda i=i: print(i))
for f in fns:
    f()          # 0 1 2
```

> **Warning**
>
> **Never assign to an undeclared name.** In sloppy mode `count = 5` silently creates a *global* variable, which then leaks across files and never gets garbage collected. Strict mode — which you get free in every module — turns it into a `ReferenceError`. This alone is a reason to write modules rather than plain scripts.

<a id="3-objects-and-references"></a>

### Objects, Arrays & References

- **Property access** `O(1)`
- **Key type** `string | symbol`
- **Copy cost (spread)** `O(n) shallow`
- **Equality** `by reference`

An object is a bag of key–value pairs where the keys are strings (or symbols) and the values are anything. An array is an object whose keys happen to be numeric and which carries a `length`. Both are **reference types**, and that one fact produces more confusing bugs than any other feature of the language.

A variable never contains an object. It contains a *reference* — an arrow pointing at one place in memory. Assigning copies the arrow, not the thing. So two variables can name the same object, and a change through one is visible through the other. Watch what each kind of copy actually duplicates:

> **Interactive animation:** `copy-depth` — rendered by the page script in the HTML version.

> **Analogy** 🏠
>
> **Picture it — a street address, not a house**
>
> Writing down a friend's address on a second slip of paper does not build a second house. Both slips lead to the same front door, so if one of you repaints it, the other sees fresh paint. Spread (`{...a}`) builds a genuinely new house — but it copies the *addresses* of the garage and the shed rather than rebuilding them, which is exactly what "shallow" means.

Everyday syntax you will use constantly, all of it built on this model:

**Objects and arrays — the daily vocabulary**

```javascript
const user = { id: 7, name: 'Ada', tags: ['js'] };

// read
user.name;              // dot notation - fixed key
user['na' + 'me'];      // bracket notation - computed key
user.address?.city;     // optional chaining: undefined instead of a throw
user.nickname ?? 'anon' // nullish default (0 and '' survive)

// write - all of these MUTATE
user.role = 'admin';
delete user.id;
user.tags.push('ts');

// copy - these produce new objects
const patched = { ...user, role: 'editor' };      // later keys win
const deep    = structuredClone(user);            // whole graph

// inspect
Object.keys(user);      // ['name', 'tags', 'role']
Object.values(user);
Object.entries(user);   // [['name','Ada'], ...] - the for..of pair form
'name' in user;         // true - includes inherited keys
Object.hasOwn(user, 'name'); // true - own keys only

// arrays: know which methods mutate
[3, 1, 2].sort();       // MUTATES and returns the same array
[3, 1, 2].toSorted();   // returns a new array (ES2023)
arr.splice(1, 2);       // MUTATES - removes in place
arr.slice(1, 3);        // copies a window
```

```python
user = {"id": 7, "name": "Ada", "tags": ["js"]}

# read
user["name"]                 # KeyError if missing - stricter than JS
user.get("nickname", "anon") # the ?? equivalent

# copy - the same shallow/deep distinction exists
patched = {**user, "role": "editor"}   # like JS spread
import copy
deep = copy.deepcopy(user)             # like structuredClone

# inspect
list(user.keys()), list(user.items())
"name" in user

# and the same mutating-vs-returning split
nums = [3, 1, 2]
nums.sort()        # mutates, returns None  <- JS returns the array
sorted(nums)       # returns a new list
```

- **Strength — cheap sharing** — Passing a large object to a function costs nothing; only the reference moves. This is why JavaScript can pass big structures around freely.
- **Weakness — accidental sharing** — A function that mutates its argument changes the caller's data. Treat arguments as read-only unless mutation is the documented point of the function.

> **Warning**
>
> **Two references are never `===` unless they point at the same object.** `{a: 1} === {a: 1}` is `false`, and so is `[1,2].includes`-style deep matching — `arr.indexOf({id: 1})` will never find anything. Compare by a key (`arr.find(x => x.id === 1)`) or compare a serialised form; there is no built-in deep equality.

<a id="4-functions-and-this"></a>

### Functions, Arrows & `this`

- **Functions are** `values`
- **Arrow `this`** `lexical`
- **Function `this`** `call-site`
- **Binding rules** `4`

Functions in JavaScript are ordinary values: you can store one in a variable, put it in an array, pass it to another function and return it from one. That is what makes callbacks, array methods, and the entire asynchronous style possible — and it is the foundation of the next two sections.

**The four ways to write a function**

```javascript
function add(a, b) { return a + b; }        // declaration - hoisted whole
const add = function (a, b) { return a + b; }; // expression - not hoisted
const add = (a, b) => a + b;                 // arrow, implicit return
const obj = { add(a, b) { return a + b; } }; // method shorthand

// parameters
const greet = (name = 'world', ...rest) => `hi ${name}`; // default + rest
const draw = ({ x = 0, y = 0 } = {}) => …;   // named arguments

// returning an object literal from an arrow needs parens
const make = (id) => ({ id });               // the () are not optional
```

```python
def add(a, b):
    return a + b

add = lambda a, b: a + b        # limited to a single expression

def greet(name="world", *rest):
    return f"hi {name}"

def draw(*, x=0, y=0):          # keyword-only args - JS uses destructuring
    ...

# Python has no arrow/function `this` distinction: methods take `self`
# explicitly, which is the problem `this` solves badly.
```

Now the part that costs people afternoons. **`this` is not decided by where a function is written — it is decided by how it is called.** The same function body can see four different values depending on the call site. Step through each rule:

> **Interactive animation:** `this-binding` — rendered by the page script in the HTML version.

Read the rules in priority order and you can answer any `this` question mechanically: `new` wins (a fresh object), then explicit `call`/`apply`/`bind`, then a receiver before the dot, then the default (`undefined` in strict mode). Arrow functions sit outside this list entirely — they have no `this` of their own, so the name resolves up the scope chain like any ordinary variable.

- **Use an arrow for** — callbacks, array-method predicates, anything nested inside a method that needs the surrounding `this`. Arrows also have no `arguments` and cannot be used with `new` — which is a feature, not a limitation.
- **Do not use an arrow for** — object methods (there is no enclosing `this` to inherit), prototype methods, or anything you intend to call with `new`. Use the `method() {}` shorthand instead.

> **Interview**
>
> **Asked constantly:** "What is the difference between `call`, `apply` and `bind`?" — `call` and `apply` both invoke immediately and differ only in how arguments are passed (list vs array); `bind` invokes nothing and returns a new function permanently welded to that receiver. Follow-up worth pre-empting: binding an already-bound function does nothing, because the first binding wins.

<a id="5-array-methods"></a>

### The Array Methods That Replace Loops

- **map / filter** `O(n)`
- **find / some** `O(n), early exit`
- **sort** `O(n log n)`
- **includes on array** `O(n)`

Most loops you would write in another language are one method call here. The value is not brevity — it is that the method *names the intent*. `filter` announces "a subset, same values"; `map` announces "same count, different values". A reader knows the shape of the result before reading the callback.

> **Interactive animation:** `array-methods` — rendered by the page script in the HTML version.

Because each one returns an array, they chain — and reading a chain top to bottom describes the pipeline in order:

**A pipeline, and the loop it replaces**

```javascript
const total = orders
  .filter((o) => o.status === 'paid')     // fewer items
  .map((o) => o.amount)                   // now numbers
  .reduce((sum, amount) => sum + amount, 0); // one value

// grouping - the reduce that earns its keep
const byUser = orders.reduce((acc, o) => {
  (acc[o.userId] ??= []).push(o);
  return acc;                              // ALWAYS return the accumulator
}, {});

// or, in modern runtimes
const byUser = Object.groupBy(orders, (o) => o.userId);

// sort needs a comparator for numbers - the default is ALPHABETICAL
[10, 9, 1].sort();                   // [1, 10, 9]   ⚠
[10, 9, 1].sort((a, b) => a - b);    // [1, 9, 10]   ✓
orders.toSorted((a, b) => b.amount - a.amount); // non-mutating (ES2023)

// flatten one level of nested arrays
[[1, 2], [3]].flat();                        // [1, 2, 3]
users.flatMap((u) => u.roles);               // map + flat in one pass
```

```python
total = sum(o["amount"] for o in orders if o["status"] == "paid")
# Python prefers comprehensions where JS chains methods; same pipeline,
# read right-to-left instead of top-to-bottom.

from collections import defaultdict
by_user = defaultdict(list)
for o in orders:
    by_user[o["user_id"]].append(o)

from itertools import groupby   # note: requires sorted input, unlike JS

sorted([10, 9, 1])                       # numeric by default - no JS trap
sorted(orders, key=lambda o: -o["amount"])
```

> **Warning**
>
> **The three traps in this area.** (1) `sort()` without a comparator compares *strings*, so `[10, 9]` sorts to `[10, 9]`. (2) `sort`, `reverse` and `splice` mutate the original — use `toSorted`, `toReversed` and `slice` when you must not. (3) `forEach` ignores the return value and cannot be broken out of; if you need an early exit use `for…of`, and if you want a result use `map`.

**Interview question**

*Deduplicate an array of objects by `id`, keeping the first occurrence.*

The naive `filter` with an `indexOf` inside is O(n²) — for each element it rescans the array. Use a `Set` or `Map` to make the "have I seen this?" question O(1), which brings the whole thing to O(n). A `Map` keyed by id also gives you "keep the last occurrence" for free by simply overwriting.

**Answer — deduplicate by key**

```javascript
// O(n) - a Set remembers what we have already emitted
const dedupe = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// keep the LAST occurrence instead - a Map overwrites
const lastWins = [...new Map(items.map((i) => [i.id, i])).values()];

// primitives only? one line
const unique = [...new Set([1, 2, 2, 3])];   // [1, 2, 3]
```

```python
def dedupe(items):
    seen = set()
    out = []
    for item in items:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        out.append(item)
    return out

# keep the last occurrence - dicts preserve insertion order
last_wins = list({i["id"]: i for i in items}.values())

unique = list(dict.fromkeys([1, 2, 2, 3]))   # order-preserving
```

<a id="unit-2"></a>

## Unit 2 — How JavaScript Actually Runs

Everything so far you could have guessed from reading code. This unit is the machinery underneath: one thread and one stack, scopes that outlive their functions, objects that inherit through a chain of other objects, and a queue that decides when your callbacks run. These five sections are what separate someone who can write JavaScript from someone who can debug it.

<a id="6-the-call-stack"></a>

### The Call Stack & the Single Thread

- **Threads** `1`
- **Stack depth** `~10k frames`
- **Push / pop** `O(1)`
- **Blocking cost** `whole UI`

JavaScript runs your code on **exactly one thread**. There is one call stack, and while something is on it, nothing else in that program can happen — no click handler, no timer, no rendering. A 200 ms synchronous loop is a 200 ms frozen page. Understanding this is the prerequisite for understanding why the async model looks the way it does.

> **Analogy** 🍽️
>
> **Picture it — a stack of plates**
>
> Every function call puts a plate on top of the pile, holding that call's arguments, local variables and the address to return to. You can only ever touch the top plate. When a function returns, its plate comes off and its locals are gone. Print the pile from the top down and you have a stack trace — which is why the error you are reading is always the *first* line, and the cause is usually further down.

> **Interactive animation:** `call-stack` — rendered by the page script in the HTML version.

Two practical consequences. First, **recursion depth is bounded** — around ten thousand frames before `RangeError: Maximum call stack size exceeded`. JavaScript engines do not implement tail-call elimination (Safari aside), so deep recursion must be rewritten as a loop or split across event-loop turns. Second, **anything slow must not be synchronous**: parse a huge JSON file, or hash a password, and the whole tab stops. Move it to a `Worker`, or chunk it so the stack can drain between pieces.

> **Tip**
>
> When you see a stack trace, read it as the plates from top to bottom: the topmost frame is where the error *surfaced*, and each line below is who called it. In async code the trace often stops at the callback boundary — that is the stack having already unwound before the callback ran, and it is exactly why `async/await` is easier to debug than raw callbacks.

<a id="7-closures"></a>

### Closures

- **Captures** `the variable`
- **Not** `a copy of the value`
- **Per call** `a new environment`
- **Lifetime** `as long as referenced`

A closure is what you get when a function **outlives the scope it was created in and keeps access to it anyway**. It is not an advanced feature you opt into — every function you write inside another function is one. It sounds abstract until you see the two things it enables: private state, and functions configured at runtime.

The mechanism is simple once you know that scopes live on the heap, not the stack. A function's frame pops when it returns, but its *environment* survives as long as something still points at it — and a returned inner function points at it. Watch the frame disappear while the variable stays alive:

> **Interactive animation:** `closure` — rendered by the page script in the HTML version.

> **Analogy** 🎒
>
> **Picture it — a backpack the function never takes off**
>
> When a function is created it straps on a backpack containing the scope it was born in — not a photocopy of the contents, the actual scope. Wherever that function travels, it can reach into the backpack. Two functions created in the same call share one backpack; two created in different calls carry different ones. The backpack is only thrown away when every function wearing it is gone.

**What closures are actually for**

```javascript
// 1. private state - `count` is unreachable from outside
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get value() { return count; },
  };
}
const c = makeCounter();
c.increment();       // 1
c.count;             // undefined - genuinely private

// 2. configuration captured once, reused forever
const withPrefix = (prefix) => (msg) => console.log(`[${prefix}] ${msg}`);
const logAuth = withPrefix('auth');
logAuth('login ok'); // [auth] login ok

// 3. memoisation - the cache lives in the closure
const memoize = (fn) => {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
};

// 4. once - a flag nobody else can flip
const once = (fn) => {
  let done = false;
  return (...args) => {
    if (done) return;
    done = true;
    return fn(...args);
  };
};
```

```python
# Python closures work the same way, with one wrinkle: assigning to a
# captured name requires `nonlocal`, otherwise you create a new local.
def make_counter():
    count = 0
    def increment():
        nonlocal count      # JavaScript needs no such keyword
        count += 1
        return count
    return increment

c = make_counter()
c()   # 1

def with_prefix(prefix):
    return lambda msg: print(f"[{prefix}] {msg}")

from functools import lru_cache    # memoisation, batteries included

@lru_cache(maxsize=None)
def slow(n):
    ...
```

- **Strength — encapsulation without classes** — State that literally cannot be reached from outside, no naming conventions or `#private` fields required. Every module pattern, hook and middleware factory is this.
- **Weakness — silent retention** — A closure keeps its *whole* environment alive, not just the variable it uses. A callback that captures a scope containing a large array keeps that array in memory for as long as the callback is registered.

> **Interview**
>
> **The question behind the question:** when an interviewer asks "what is a closure?", they are checking whether you know it captures the *variable* rather than the value. The proof is the `var` loop from section 2: all three callbacks print `3` precisely because they share one live binding rather than three snapshots.

<a id="8-prototypes-and-classes"></a>

### Prototypes & Classes

- **Inheritance** `delegation`
- **Lookup** `O(chain depth)`
- **Methods stored** `once, shared`
- **Chain ends at** `null`

JavaScript has no classes in the way C++ or Java do. It has objects, and every object holds a hidden link to another object called its **prototype**. When you read a property the engine looks at the object, then its prototype, then *its* prototype, until it finds the key or runs out of chain. `class` syntax is a readable way to build these links — real, useful sugar over a mechanism that stays visible underneath.

> **Interactive animation:** `prototype-chain` — rendered by the page script in the HTML version.

> **Analogy** 📚
>
> **Picture it — asking up the chain of command**
>
> You ask an object a question. If it knows the answer it replies. If not, it does not guess — it forwards the question to its manager, who forwards it again, until someone answers or the chain reaches the top and the reply is "undefined". Note what this is *not*: nothing was copied into the object when it was created. It genuinely asks, every single time.

The important asymmetry: **reads walk the chain, writes never do**. Assigning `rex.speak = fn` creates an own property on `rex` that shadows the inherited one for that object only. This is why mutating a shared prototype at runtime is so dangerous, and why accidentally adding to `Object.prototype` breaks every object in the program.

**Classes, and what they compile down to**

```javascript
class Animal {
  static kingdom = 'Animalia';   // on the class itself
  #secret = 42;                  // truly private - not just a convention
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
  get label() { return this.name.toUpperCase(); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);                 // MUST run before touching `this`
    this.breed = breed;
  }
  speak() { return `${super.speak()} - a bark`; }
}

const rex = new Dog('Rex', 'lab');
rex instanceof Dog;     // true
rex instanceof Animal;  // true - the chain is walked

// the same thing, written by hand, pre-2015
function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return `${this.name} makes a sound`; };
function Dog(name) { Animal.call(this, name); }
Dog.prototype = Object.create(Animal.prototype);  // link the chains
Dog.prototype.constructor = Dog;

// no classes needed at all
const proto = { speak() { return `${this.name} speaks`; } };
const cat = Object.create(proto);
cat.name = 'Tom';
Object.getPrototypeOf(cat) === proto;   // true
```

```python
class Animal:
    kingdom = "Animalia"          # class attribute - shared, like a prototype

    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

    @property
    def label(self):
        return self.name.upper()

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def speak(self):
        return f"{super().speak()} - a bark"

# Python resolves attributes through the MRO (a linearised class list),
# JavaScript through a chain of ordinary objects. Same delegation idea;
# Python's is fixed at class-definition time, JavaScript's is mutable at
# runtime - you can reassign an object's prototype after creating it.
```

- **Strength — one copy of every method** — A thousand instances share a single `speak` function on the prototype. Defining methods inside the constructor instead creates a thousand copies.
- **Weakness — `this` comes along for the ride** — Class methods are ordinary functions, so passing `obj.method` as a callback loses the receiver. Bind it, or declare the method as a class field arrow: `speak = () => …`.

> **Warning**
>
> **Never extend built-in prototypes.** `Array.prototype.last = …` works, and then breaks the moment a library iterates keys with `for…in`, or a future spec adds a method with the same name and different behaviour. If you need a helper, write a plain function.

<a id="9-the-event-loop"></a>

### The Event Loop

- **Microtasks drained** `all of them`
- **Macrotasks per turn** `1`
- **setTimeout(fn, 0)** `≥ 4 ms, later`
- **Render budget** `16.7 ms`

One thread, yet a browser handles clicks, timers and network responses without freezing. The trick is that **the slow work is not done by JavaScript**. When you call `setTimeout` or `fetch`, you hand a callback to the host — the browser or Node — and return immediately. The host does the waiting on its own threads, and when it is finished it puts your callback in a *queue*. The event loop's only job is: when the stack is empty, take the next callback and run it.

The subtlety, and the source of every "why did that print in that order" question, is that there are **two queues with different priorities**. Microtasks (promise callbacks, `await` resumptions) are drained *completely* after each task; macrotasks (timers, I/O, DOM events) get one per turn.

Before stepping through the animation, here is the whole machine on one picture — the four parts and the single circular path a callback travels through them.

*Diagram labels:* the JavaScript thread — one thing at a time · call stack · console.log · render() · main() · <script> · LIFO · push / pop · heap · objects · closures · promises · values live here — · the stack holds frames · the host — browser / Node, many threads · timers — setTimeout / setInterval · network — fetch, XHR, WebSocket · DOM events — click, key, scroll · disk & OS I/O — libuv pool · the waiting happens here, off your thread · ① hand off work · returns at once · ② a promise · settles · ② the host · finishes · MICROTASK QUEUE — jumps the line · .then / .catch / .finally · await resume · queueMicrotask · drained COMPLETELY, every turn · TASK QUEUE — macrotasks · timer fired · I/O complete · click handler · MessageChannel · exactly ONE taken per turn · ③ served first · ③ one per turn · THE EVENT LOOP — one turn, repeated forever · 1 · take ONE · macrotask · 2 · drain ALL · microtasks · 3 · render · rAF → layout → paint · 4 · repeat · only if stack empty · ④ pushed onto the empty stack · step 2 also runs microtasks queued during step 2 — an endless chain there never reaches step 3, and the tab freezes

*The complete circuit. Nothing in this picture runs in parallel with your code except the host's own threads on the right; every callback you write comes back through the same single stack. The colours match the animation below — running now, queued microtask, queued macrotask, rendered.*

> **Interactive animation:** `event-loop` — rendered by the page script in the HTML version.

> **Analogy** ☕
>
> **Picture it — one barista, two queues**
>
> There is a single barista (the thread). Customers who need something quick — "just add sugar to the one you already made" — form the priority queue, and the barista clears *all* of them before glancing at the main line. Customers in the main line (timers, clicks) are served one at a time, and after each one the priority queue is emptied again. This is fair to no one, and it is exactly why an infinite chain of quick requests can starve everybody else — including the browser's chance to repaint.

> **Key idea**
>
> One turn of the loop: **run one macrotask → drain every microtask → let the browser render → repeat**. Almost every ordering puzzle in JavaScript is answered by reading those four steps in order. `setTimeout(fn, 0)` does not mean "now", it means "at the start of some future turn" — and in browsers nested timers are additionally clamped to about 4 ms.

<a id="10-promises-and-async"></a>

### Promises & async/await

- **States** `3`
- **Transitions** `1, ever`
- **Callbacks run as** `microtasks`
- **await returns** `a promise`

A promise is an object representing a value that is not there yet. It has three states — pending, fulfilled, rejected — and it may transition **exactly once**. Because the result is stored rather than broadcast, you can attach a handler long after it settled and still get the value; an event you missed is gone forever, but a promise replays.

> **Interactive animation:** `promise-states` — rendered by the page script in the HTML version.

`async`/`await` is not a different mechanism — it is syntax over exactly those promises. An `async` function always returns a promise, and `await` means "suspend this function, hand control back to the caller, and resume in a microtask when that promise settles". Watch a function pause and leave the stack entirely:

> **Interactive animation:** `async-await` — rendered by the page script in the HTML version.

**The shape of async code you should be writing**

```javascript
async function loadDashboard(userId) {
  try {
    // independent work - start both, then await. NOT two sequential awaits.
    const [user, orders] = await Promise.all([
      fetchUser(userId),
      fetchOrders(userId),
    ]);

    // dependent work - this one genuinely must wait
    const prefs = await fetchPrefs(user.prefsId);

    return { user, orders, prefs };
  } catch (err) {
    // catches ANY rejection above, exactly like a synchronous throw
    report(err);
    throw err;              // rethrow unless you can truly recover
  } finally {
    hideSpinner();          // runs on success and on failure
  }
}

// mapping over async work: map first, then await together
const users = await Promise.all(ids.map((id) => fetchUser(id)));

// a deadline for anything
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
```

```python
import asyncio

async def load_dashboard(user_id):
    try:
        # gather is Promise.all
        user, orders = await asyncio.gather(
            fetch_user(user_id),
            fetch_orders(user_id),
        )
        prefs = await fetch_prefs(user["prefs_id"])
        return {"user": user, "orders": orders, "prefs": prefs}
    except Exception as err:
        report(err)
        raise
    finally:
        hide_spinner()

# The big difference: Python coroutines are LAZY - calling one does
# nothing until it is awaited or scheduled. A JavaScript promise starts
# its work the moment it is created, which is why `Promise.all` on
# already-started promises still runs them in parallel.
```

Once you have several promises in flight, the four combinators cover essentially every situation. They differ only in *when they settle* and *what a failure does*:

> **Interactive animation:** `promise-concurrency` — rendered by the page script in the HTML version.

> **Warning**
>
> **The two mistakes that show up in every code review.** First, sequential awaits over independent work — `await a(); await b();` takes the sum of both latencies when it could take the max. Second, an unhandled rejection: a promise chain with no `catch` and no `await` inside a `try` will crash a Node process and log a warning nobody reads in the browser. Also note `forEach` does not await — use `for…of` for sequential async work, or `Promise.all(map(...))` for parallel.

**Interview question**

*What does this print, and why?*

Work it out with the loop rules: all synchronous code first, then every microtask, then one macrotask. `'1'` and `'4'` are synchronous. `'3'` is a promise callback — a microtask — so it runs as soon as the script finishes. `'2'` is a timer, a macrotask, so it runs after the microtask queue is empty. Answer: `1 4 3 2`. Note that the executor function passed to `new Promise` runs **synchronously**, which is the part most people get wrong.

**Answer — ordering**

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

new Promise((resolve) => {
  console.log('4');        // ⚠ the executor is SYNCHRONOUS
  resolve();
}).then(() => console.log('3'));

// prints: 1, 4, 3, 2

// the same rules with await
async function f() {
  console.log('a');
  await null;              // awaiting a non-promise still yields a microtask
  console.log('c');
}
f();
console.log('b');
// prints: a, b, c
```

```python
import asyncio

async def main():
    print("1")
    asyncio.get_running_loop().call_soon(lambda: print("2"))

    async def later():
        print("3")

    task = asyncio.create_task(later())   # scheduled, not run yet
    print("4")
    await task

asyncio.run(main())
# 1, 4, 2, 3 - Python's loop has a single ready queue rather than
# JavaScript's split macrotask/microtask priority, so the order differs.
```

<a id="unit-3"></a>

## Unit 3 — Writing Real Code

The language is only half the job. Real code is split across files, runs inside a host that gives it a page or a process, and has to survive being read again in six months. Three sections: how modules load, what the browser actually hands you, and a single page that ties everything above together.

<a id="11-modules"></a>

### Modules & the Ecosystem

- **Standard** `ESM`
- **Legacy (Node)** `CommonJS`
- **Evaluated** `once`
- **Bindings** `live`

A module is a file with its own scope. Nothing inside it is visible elsewhere unless you `export` it, and nothing from elsewhere is visible inside unless you `import` it. That is the entire idea, and it replaced a decade of workarounds — IIFEs, namespaces, and global variables carefully prefixed to avoid collisions.

Two systems exist. **ES modules** (`import`/`export`) are the standard, understood by browsers and Node alike; their imports are *static*, so the whole dependency graph is known before a single line executes. **CommonJS** (`require`/`module.exports`) is Node's original system, where importing is a function call that runs the file right there. Compare how each one loads the same graph:

> **Interactive animation:** `module-graph` — rendered by the page script in the HTML version.

**Module syntax you will actually type**

```javascript
// cart.js - named exports are the default choice
export const TAX = 0.2;
export function total(items) { … }
export default class Cart { … }        // at most one per module

// main.js
import Cart, { total, TAX as VAT } from './cart.js';  // extension required
import * as cart from './cart.js';                     // namespace object

// lazy: a function call, allowed anywhere, returns a promise
const { heavy } = await import('./heavy.js');

// side-effect only - runs the module, imports nothing
import './polyfills.js';
```

```python
# cart.py
TAX = 0.2
def total(items): ...

# main.py
from cart import total, TAX as VAT
import cart                       # namespace, like import * as
import importlib
heavy = importlib.import_module("heavy")   # the dynamic form

# Python modules are also evaluated once and cached (sys.modules),
# exactly like JavaScript. The difference: Python exports everything
# public by default, JavaScript exports nothing unless you say so.
```

Around modules sits the package ecosystem, and three facts save a lot of confusion. `package.json` declares your dependencies and their allowed version ranges; the **lockfile** records the exact versions that were installed and is what makes a build reproducible, so it belongs in git. `npm ci` installs strictly from the lockfile and is what CI should run; `npm install` may update it. And `node_modules` is a build artifact — never committed, always regenerable.

> **Tip**
>
> To use ESM in Node, either add `"type": "module"` to `package.json` or name files `.mjs`. In ESM you lose `__dirname` and `require`, and gain **top-level `await`** — you can await at the top of a module without wrapping it in an async function.

<a id="12-the-browser"></a>

### The Browser — DOM, Events & fetch

- **DOM read/write** `can force layout`
- **Frame budget** `16.7 ms`
- **Event phases** `3`
- **fetch rejects on** `network only`

The DOM is a tree of objects representing the page, handed to you by the browser. You query it, change it, and listen to it — and the only performance rule that matters is that **touching it is expensive**. Reading a layout property such as `offsetHeight` forces the browser to recompute geometry; doing that inside a loop that also writes creates "layout thrashing", where every iteration invalidates the work of the last. Batch your reads, then batch your writes.

Events do not simply fire on the element you clicked. They travel *down* from the window to the target, then back *up* — and that upward journey is what makes one listener able to serve a thousand rows:

> **Interactive animation:** `dom-events` — rendered by the page script in the HTML version.

**The browser API surface worth memorising**

```javascript
// query
const el   = document.querySelector('#list');       // first match
const all  = document.querySelectorAll('li.active'); // static NodeList

// change - textContent is safe, innerHTML is an injection risk
el.textContent = userInput;          // ✓ always
el.innerHTML = userInput;            // ✗ executes markup
el.classList.toggle('open', isOpen);
el.dataset.userId = 7;               // <div data-user-id="7">

// build without parsing strings
const li = document.createElement('li');
li.textContent = name;
list.append(li);

// one delegated listener beats a thousand direct ones
list.addEventListener('click', (e) => {
  const row = e.target.closest('li');
  if (row) select(row.dataset.id);
});

// cancellable listeners - one signal removes them all
const ac = new AbortController();
window.addEventListener('scroll', onScroll, { signal: ac.signal });
ac.abort();

// fetch: only rejects on NETWORK failure, never on 404 or 500
const res = await fetch('/api/users', { signal: ac.signal });
if (!res.ok) throw new Error(`HTTP ${res.status}`);   // you must check
const data = await res.json();
```

```python
# The closest analogue on the server side
import httpx

async with httpx.AsyncClient() as client:
    res = await client.get("/api/users", timeout=5)
    res.raise_for_status()      # httpx DOES raise on 4xx/5xx - fetch does not
    data = res.json()

# Parsing HTML server-side rather than manipulating a live DOM
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
soup.select_one("#list")
[li.get_text() for li in soup.select("li.active")]
```

> **Warning**
>
> **The `fetch` trap everyone hits once:** a `404` or `500` is a perfectly successful HTTP exchange, so the promise *fulfils*. Only a dropped connection, DNS failure or CORS block rejects it. Always check `res.ok` yourself — otherwise your `catch` block never runs and you try to render an error page as JSON.

Finally, the browser fires events far faster than you can usefully respond to them — `scroll` and `input` can fire dozens of times a second. Two closures fix this, and knowing which to reach for is the difference between a smooth page and a janky one:

> **Interactive animation:** `debounce-throttle` — rendered by the page script in the HTML version.

<a id="13-the-whole-thing-on-one-page"></a>

## The Whole Thing on One Page

Everything above, compressed into the form you would want on a card next to your keyboard.

<a id="the-decisions"></a>

### The decisions you make daily

| Question | Answer | Because |
| --- | --- | --- |
| Declare a variable? | `const`, then `let` | Block scoped and TDZ-protected; `var` is function scoped and silently `undefined` |
| Compare two values? | `===`, except `x == null` | `==` converts through a three-step algorithm nobody predicts |
| Default a value? | `??` over `\|\|` | `\|\|` also replaces legitimate `0` and `''` |
| Write a callback? | Arrow function | No `this` of its own, so the surrounding one survives |
| Write an object method? | `method() {}` shorthand | An arrow has no enclosing `this` to inherit |
| Copy an object? | `{...o}`, or `structuredClone` | Spread is shallow — nested values stay shared |
| Transform a list? | `map` / `filter` / `reduce` | The method names the shape of the result before you read the callback |
| Find one item? | `find`, not `filter()[0]` | `find` stops at the first match |
| Several independent requests? | `Promise.all` | Sequential `await`s add latency instead of overlapping it |
| Sort numbers? | `sort((a, b) => a - b)` | The default comparator sorts as strings |
| Handle 1000 rows' clicks? | One delegated listener on the parent | Events bubble, and it keeps working for rows added later |
| React to typing? | Debounce; throttle for scroll | Debounce waits for the end of a burst, throttle caps the rate during it |

<a id="the-machine"></a>

### The machine, in five sentences

```text
1. ONE THREAD, ONE STACK
                Every call pushes a frame; nothing else runs until it pops.
                Slow synchronous work freezes everything.

                2. NAMES RESOLVE OUTWARD, LEXICALLY
                Current scope → enclosing scope → … → global → ReferenceError.
                Fixed by where the code is WRITTEN, not who called it.

                3. A FUNCTION KEEPS ITS BIRTH SCOPE ALIVE (closure)
                The frame pops; the environment survives while anything references it.
                It captures the VARIABLE, not a snapshot of the value.

                4. PROPERTIES ARE FOUND BY WALKING A CHAIN OF OBJECTS (prototype)
                Reads walk up the chain. Writes always land on the object itself.
                `class` is sugar over exactly this.

                5. ASYNC WORK RESUMES THROUGH QUEUES, AFTER THE STACK EMPTIES
                run one macrotask → drain ALL microtasks → render → repeat
                promises/await are microtasks; timers and events are macrotasks.
```

<a id="the-traps"></a>

### The traps, ranked by how often they bite

- **1. Shared references**`const b = a` does not copy. Mutating `b.x` changes `a.x`, and `{...a}` only protects the top level.
- **2. Lost `this`** — Passing `obj.method` as a callback drops the receiver. Wrap it in an arrow or `bind` it.
- **3. Sequential awaits** — Two independent `await`s cost the sum of both latencies. Start both promises, then `Promise.all`.
- **4. Truthiness on `0` and `''`**`if (count)` and `x || fallback` silently treat valid values as missing.
- **5. Mutating array methods**`sort`, `reverse`, `splice` change the original. `toSorted`, `toReversed` and `slice` do not.
- **6. Unhandled rejections** — A chain with no `catch` and no `await` in a `try` crashes Node and vanishes in the browser.
- **7. `fetch` not rejecting on 404** — An HTTP error is a successful request. Check `res.ok` yourself.
- **8. Leaked listeners and timers** — Every registered handler keeps its whole closure alive. Remove them, or pass an `AbortSignal`.

That last one is worth one more look, because "why is memory climbing?" is a question you will be asked eventually and the answer is always the same shape — something reachable from a root that nobody remembered to release:

> **Interactive animation:** `garbage-collection` — rendered by the page script in the HTML version.

<a id="two-more-worth-knowing"></a>

### Two more worth knowing before you go

**Destructuring** is everywhere in modern code — in imports, in function signatures, in `for…of` over `Object.entries`. Reading it as "a picture of the shape I expect" makes it immediately legible:

> **Interactive animation:** `destructuring` — rendered by the page script in the HTML version.

And **generators**, while rarer, are the mechanism behind `for await…of`, streaming responses and lazy pipelines — a function that can pause in the middle and be resumed later with its locals intact:

> **Interactive animation:** `generator` — rendered by the page script in the HTML version.

<a id="where-next"></a>

### Where to go next

1. [The JavaScript Detailed Course](javascript-detailed-course.html) — the same ground from first principles plus everything this page skipped: property descriptors, symbols, iterators, `Proxy`, regular expressions, the memory model, Node internals and tooling.
2. [All Programming Language Courses](../programming-languages.html) — the Python track covers the same ideas from the other side, which is the fastest way to see which parts of JavaScript are genuinely unusual.
3. [MDN JavaScript reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript) — the documentation to keep open. Accurate, versioned, and the source most other sites are paraphrasing.
4. [The ECMAScript specification](https://tc39.es/ecma262/) — dense, but the final word when two blog posts disagree about coercion or the event loop.
5. [javascript.info](https://javascript.info/) — a well-sequenced tutorial with exercises, good for filling gaps in a specific area.

> **Key idea**
>
> If you keep one thing from this page: **when JavaScript surprises you, ask which of the four mechanisms is involved**. Is a reference shared? Which scope is this name resolved in? What is the call site, and therefore `this`? Which queue is this callback sitting in? Almost every bug is one of those four, and each one has a visible, mechanical answer.

---

TechToday Study Library — JavaScript
