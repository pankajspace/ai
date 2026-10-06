<!--
Source: design-patterns-detailed-course.html
Title: Design Patterns Detailed Course | TechToday
Description: A 39-section course on object-oriented design patterns from first principles — coupling, UML and SOLID, all 23 Gang of Four patterns, dependency injection, Repository and Unit of Work, functional patterns, anti-patterns, refactoring and testing — with animations and full Python and TypeScript implementations.
Theme-color: #0b0d10
Stylesheets: design-patterns-study.css, ../../site-header.css
Scripts: design-patterns-study.js
-->

Navigation: [TechToday](../../index.html) · [← Design Patterns Courses](design-patterns-courses.html)

<a id="design-patterns"></a>

# Design Patterns

Thirty-nine sections, from what coupling actually costs to how Visitor's double dispatch works. Each section builds only on the ones before it, so the course reads straight through. Each pattern is also self-contained enough to look up on its own when you meet it in a code review. Every pattern section follows the same order: the problem, the structure, a full implementation in Python and TypeScript, the trade-offs, and an interview question. Press **Play** on any animation.

<a id="table-of-contents"></a>

## Table of Contents

1. [What a Design Pattern Is](#1-what-a-pattern-is)
2. [Coupling, Cohesion & Change](#2-coupling-and-cohesion)
3. [Reading Class Diagrams](#3-reading-uml)
4. [SOLID I: Single Responsibility & Open/Closed](#4-srp-and-ocp)
5. [SOLID II: Liskov, Interface Segregation & Dependency Inversion](#5-lsp-isp-dip)
6. [Composition, Delegation & Inheritance](#6-composition-and-delegation)
7. [Factory Method](#7-factory-method)
8. [Abstract Factory](#8-abstract-factory)
9. [Builder](#9-builder)
10. [Prototype](#10-prototype)
11. [Singleton](#11-singleton)
12. [Dependency Injection & Inversion of Control](#12-dependency-injection)
13. [Adapter](#13-adapter)
14. [Bridge](#14-bridge)
15. [Composite](#15-composite)
16. [Decorator](#16-decorator)
17. [Facade](#17-facade)
18. [Flyweight](#18-flyweight)
19. [Proxy](#19-proxy)
20. [Strategy](#20-strategy)
21. [Template Method](#21-template-method)
22. [Observer](#22-observer)
23. [Command](#23-command)
24. [State](#24-state)
25. [Chain of Responsibility](#25-chain-of-responsibility)
26. [Iterator & Generators](#26-iterator)
27. [Mediator](#27-mediator)
28. [Memento](#28-memento)
29. [Visitor](#29-visitor)
30. [Interpreter](#30-interpreter)
31. [Null Object, Value Object & Specification](#31-small-patterns)
32. [Repository & Unit of Work](#32-repository-and-unit-of-work)
33. [Functional Patterns: When Patterns Disappear](#33-functional-patterns)
34. [Anti-Patterns & Over-Engineering](#34-anti-patterns)
35. [Refactoring Toward Patterns](#35-refactoring-to-patterns)
36. [Patterns and Testability](#36-patterns-and-testing)
37. [Cheat Sheet](#37-cheat-sheet)
38. [Pattern-Recognition Playbook](#38-pattern-playbook)
39. [Practice Roadmap](#39-practice-roadmap)

<a id="unit-1"></a>

## Unit 1 — Foundations

The ideas every pattern is built from: coupling and cohesion, the vocabulary of class diagrams, the five SOLID principles, and the choice between inheritance and composition.

<a id="1-what-a-pattern-is"></a>

## 1. What a Design Pattern Is

- **Patterns in the GoF catalog** `23` <!-- ok -->
- **Creational** `5` <!-- good -->
- **Structural** `7` <!-- good -->
- **Behavioural** `11` <!-- good -->

> **Key idea**
>
> If you want the ten patterns you'll meet most often, with one animation each, start with the [Design Patterns Crash Course](design-patterns-crash-course.html) and come back here for depth. This course assumes nothing, but it moves faster through the ideas the crash course already animated, and spends its time on structure, variations, edge cases and full implementations.

A **design pattern** is a named description of a solution to a design problem that keeps coming back, written so you can apply it in many different contexts. It isn't code you can download. A library is code you call, and a framework is code that calls you, but a pattern is an *idea* that you implement again each time, adapted to the language and the problem in front of you. Two implementations of Observer can share no lines of code and still be the same pattern, because they solve the same problem in the same way: one object announces changes to others without knowing who they are.

The idea came from architecture, not software. In *A Pattern Language* (1977), the architect Christopher Alexander described 253 patterns for towns and buildings, and wrote that each one *"describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice."* In 1994, Erich Gamma, Richard Helm, Ralph Johnson and John Vlissides, soon nicknamed the **Gang of Four** (GoF), published *Design Patterns: Elements of Reusable Object-Oriented Software*. It catalogued 23 patterns from real object-oriented systems, gave each one a name, and organised them by purpose.

<a id="1-1-anatomy"></a>

### The anatomy of a pattern

Every GoF pattern is described with the same headings, and those headings are what make a pattern more than a code snippet. The most useful ones are *intent* and *consequences*. Intent tells you whether the pattern fits your problem. Consequences tell you what it will cost.

```text
Name            a shared word: "make it a Strategy" replaces a paragraph of explanation
Intent          the one-sentence problem it solves
Motivation      a concrete scenario where the problem hurts
Applicability   the situations where it fits, and where it doesn't
Structure       the classes and objects involved, as a diagram
Participants    the role each class plays: Context, Strategy, ConcreteStrategy ...
Consequences    what you gain and what you pay: every pattern trades something
Implementation  pitfalls and language-specific variations
Related         patterns that are often confused with it, or combined with it
```

The book sorts the patterns two ways. **Purpose** asks what the pattern is *for*. *Creational* patterns decide how objects get created. *Structural* patterns decide how objects are put together into larger structures. *Behavioural* patterns decide how objects split up work and communicate. **Scope** asks whether the relationship is fixed at compile time through inheritance (class scope), or set up at runtime between objects (object scope). Only four patterns are class-scoped, which tells you how strongly the book prefers composition.

| Purpose | Class scope (inheritance) | Object scope (composition) |
| --- | --- | --- |
| Creational | Factory Method | Abstract Factory, Builder, Prototype, Singleton |
| Structural | Adapter (class form) | Adapter (object form), Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
| Behavioural | Interpreter, Template Method | Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Visitor |

<a id="1-2-pattern-vs-other-things"></a>

### Patterns, idioms, algorithms and architectures

| Term | Scale | Example | Is it code? |
| --- | --- | --- | --- |
| Idiom | one language feature, a few lines | Python's `with` block; JavaScript's `??=` | yes, language-specific |
| Algorithm | a procedure with a defined result | binary search; Dijkstra | yes, precise steps |
| Design pattern | a few cooperating classes or functions | Strategy; Observer; Adapter | no, a reusable design |
| Architectural pattern | a whole system or service | layered; hexagonal; event-driven; MVC | no, a system shape |

- **Strength — a shared vocabulary.** "Wrap the client in a caching proxy" is a complete design instruction to anyone who knows the words. That is the biggest benefit of patterns, and it costs nothing.
- **Strength — solutions with known trade-offs.** A pattern comes with its consequences already written down, so you can compare designs before you build either one.
- **Weakness — they invite over-use.** Knowing 23 hammers makes everything look like a nail. Code with a pattern on every line is harder to change, not easier.
- **Weakness — some patterns are workarounds for missing language features.** Several GoF patterns exist because C++ in 1994 had no first-class functions. In Python and TypeScript, they shrink to a single feature (section 33).

**Interview question**

*Name the design pattern behind each of these everyday lines of code.*

Classify each one by its **intent**, not by its syntax. **1** passes a swappable algorithm into `sort`, so it's **Strategy**. **2** returns a wrapper with the same call signature that adds caching, so it's **Decorator**; because it also decides whether the real function runs at all, it's a caching **Proxy** too. **3** walks a collection without knowing how it's stored, so it's **Iterator**. **4** registers a callback that runs when something happens, so it's **Observer**. **5** returns the same shared object for the same key every time. Python's documentation guarantees that repeated `getLogger()` calls with the same name return the same `Logger`. That's a keyed registry of shared instances, sometimes called a *Multiton*, and closely related to **Flyweight**. **6** isn't a GoF pattern at all. It's the *Execute Around* idiom, also called RAII: setup and teardown wrapped around a block of code by the language. The point of the exercise is that you already use patterns every day. Learning their names lets you talk about them, and see when a design is missing one.

**The code to classify**

```python
import functools
import logging

orders.sort(key=lambda o: o.total)                       # 1


@functools.lru_cache(maxsize=1024)                       # 2
def exchange_rate(currency: str) -> float: ...


for line in open("orders.csv"):                          # 3
    print(line)

button.bind("<Button-1>", on_click)                      # 4 (tkinter)

log = logging.getLogger("payments")                      # 5

with db.transaction():                                   # 6
    db.execute("update accounts set ...")
```

```typescript
orders.sort((a, b) => a.total - b.total);               // 1

const cachedRate = memoize(exchangeRate);               // 2

for (const line of readLines("orders.csv")) {           // 3
  console.log(line);
}

button.addEventListener("click", onClick);              // 4

const key = Symbol.for("payments");                     // 5: same symbol for the same key

{
  await using tx = await db.transaction();              // 6: TS 5.2 explicit resource management
  await tx.execute("update accounts set ...");
}
```

> **Tip**
>
> When you describe a design, **name the pattern and the roles**. "`PricingRule` is the Strategy, and `Checkout` is the Context" tells a reviewer which parts are meant to vary and which are meant to stay fixed. A class called `PricingManager` tells them nothing. Names are the cheapest documentation you'll ever write.

<a id="2-coupling-and-cohesion"></a>

## 2. Coupling, Cohesion & Change

- **Goal for coupling** `low, and explicit` <!-- great -->
- **Goal for cohesion** `high: one reason to change` <!-- great -->
- **Worst coupling** `shared mutable globals` <!-- bad -->
- **Duplication vs wrong abstraction** `duplication is cheaper` <!-- ok -->

**Coupling** measures how much one module depends on another: how much it has to know, and how likely a change in one is to force a change in the other. **Cohesion** measures how strongly the parts *inside* a module belong together. The two were described in the 1970s by Larry Constantine and Ed Yourdon in their work on *structured design*, long before objects were common. Their ideas still explain why patterns exist. A system is easy to change when each module has a single, clear job (high cohesion) and depends on others only through small, stable interfaces (low coupling). Every pattern in this course moves code towards that shape, along some particular axis.

> **Interactive animation:** `change-ripple` — rendered by the page script in the HTML version.

<a id="2-1-kinds-of-coupling"></a>

### Kinds of coupling, from worst to best

Not all coupling is equal. The classic list orders it by how much one module knows about another's internals. The first rows are the ones patterns help remove.

| Kind | What it looks like | Why it hurts | Typical fix |
| --- | --- | --- | --- |
| Content | one module reaches into another's private fields | any internal change breaks the other module | encapsulate; expose a method |
| Common (global) | modules share a global or a singleton | anyone can change it; tests leak state | dependency injection (section 12) |
| Control | a caller passes a flag that selects behaviour | the caller must know the callee's internal branches | split the function, or use Strategy |
| Stamp | passing a whole record when two fields are needed | changes to unused fields still ripple | pass only what's needed |
| Data | passing plain values through parameters | minimal: this is the goal | — |
| Message | sending messages or events to an interface | the lowest coupling: no shared types beyond the message | Observer, Command, queues |

A finer-grained vocabulary is **connascence**, from Meilir Page-Jones. Two pieces of code are *connascent* if changing one requires changing the other. The weak forms are static and easy to spot: agreeing on a *name*, a *type*, or the *meaning* of a value (is `status = 3` "shipped"?), or the *position* of arguments. The strong forms are dynamic and only show up at runtime: the *order* in which calls must happen, their *timing*, and *identity* (two parts of the code must hold the very same object). The rule of thumb is to turn strong connascence into weaker forms, and to keep any strong connascence inside a single module. Patterns do exactly that. A Builder turns positional arguments into names. A State class turns "call these in the right order" into "only legal calls exist".

<a id="2-2-kinds-of-cohesion"></a>

### Cohesion

The worst kind of cohesion is *coincidental*: a `utils.py` whose functions share nothing but a file. Next comes *logical* cohesion, where things are grouped because they're the same kind of thing, such as "all the validators". Then *temporal* cohesion, where things happen at the same time, like everything in `on_startup()`. The best kind is **functional** cohesion: every part of the module contributes to one well-defined job. A practical test is to describe the module in one sentence without using "and". "Calculates shipping cost" passes. "Validates the order and sends the email and updates stock" doesn't.

- **Strength — change stays local.** Low coupling and high cohesion together put a limit on how far one change can spread. That limit is what makes a large codebase possible to work in.
- **Strength — modules can be understood alone.** You can read a cohesive module with explicit dependencies without opening five other files.
- **Weakness — decoupling has a price.** Every interface adds a layer of indirection. Coupling isn't evil. *Unnecessary* coupling across a line that changes often is.
- **Weakness — removing duplication can add coupling.** Merging two similar functions that change for different reasons couples them. When one requirement changes, the shared function grows a flag.

**Interview question**

*A function `export(rows, fmt, compress=False, legacy_dates=False)` has eleven call sites, each passing a different mix of flags. What's wrong with it, and how would you fix it?*

It's **control coupling**. Every caller has to know the function's internal decision tree to choose the right flags. Every new requirement adds another flag, and the number of combinations to test doubles each time. The function also has low cohesion: date formatting, serialisation and compression are three jobs that change for three different reasons. The fix is to split it into small functions that each do one job, and let callers *compose* them. The callers already know what they want, so they might as well say it directly. If formats must be chosen at runtime, say from a config file, a registry of serialiser functions (a Strategy) replaces the `fmt` string. Notice that the new code has *more* functions but *less* coupling, because no caller depends on a branch it doesn't use.

**Answer — from flags to composition**

```python
import csv
import gzip
import io
import json
from datetime import date

# Before: every caller drives the internal branches with flags.
def export(rows, fmt="csv", compress=False, legacy_dates=False):
    if legacy_dates:
        rows = [{**r, "date": r["date"].strftime("%d/%m/%Y")} for r in rows]
    if fmt == "csv":
        data = to_csv(rows)
    elif fmt == "json":
        data = to_json(rows)
    else:
        raise ValueError(f"unknown format {fmt!r}")
    return gzip.compress(data) if compress else data


# After: one job per function. Callers compose exactly what they need.
def legacy_dates(rows: list[dict]) -> list[dict]:
    return [{**r, "date": r["date"].strftime("%d/%m/%Y")} for r in rows]


def to_csv(rows: list[dict]) -> bytes:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue().encode()


def to_json(rows: list[dict]) -> bytes:
    return json.dumps(rows, default=str).encode()


SERIALISERS = {"csv": to_csv, "json": to_json}  # only where the choice is runtime data

rows = [{"id": 1, "date": date(2026, 3, 1), "total": 42}]
nightly = gzip.compress(to_csv(legacy_dates(rows)))   # the old export(rows, "csv", True, True)
api_body = SERIALISERS["json"](rows)                  # the old export(rows, "json")
```

```typescript
import { gzipSync } from "node:zlib";

type Row = Record<string, unknown> & { date: Date };

// Before: every caller drives the internal branches with flags.
export function exportRows(rows: Row[], fmt = "csv", compress = false, legacyDates = false): Uint8Array {
  const out = legacyDates ? rows.map((r) => ({ ...r, date: r.date.toLocaleDateString("en-GB") })) : rows;
  const data = fmt === "csv" ? toCsv(out) : fmt === "json" ? toJson(out) : fail(fmt);
  return compress ? gzipSync(data) : data;
}

// After: one job per function. Callers compose exactly what they need.
const legacyDatesOf = (rows: Row[]) => rows.map((r) => ({ ...r, date: r.date.toLocaleDateString("en-GB") }));

function toCsv(rows: Record<string, unknown>[]): Uint8Array {
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))];
  return new TextEncoder().encode(lines.join("\n"));
}

const toJson = (rows: unknown[]) => new TextEncoder().encode(JSON.stringify(rows));

function fail(fmt: string): never {
  throw new Error(`unknown format ${fmt}`);
}

export const SERIALISERS: Record<string, (rows: Record<string, unknown>[]) => Uint8Array> = {
  csv: toCsv,
  json: toJson,
};

const rows: Row[] = [{ id: 1, date: new Date("2026-03-01"), total: 42 }];
const nightly = gzipSync(toCsv(legacyDatesOf(rows))); // the old exportRows(rows, "csv", true, true)
const apiBody = SERIALISERS.json(rows); // the old exportRows(rows, "json")
```

> **Warning**
>
> **Don't deduplicate code that changes for different reasons.** Two functions that look the same today but serve different business rules aren't duplicates. They're coincidentally similar. Merge them, and the first divergent requirement adds a flag, which brings back control coupling. Sandi Metz put it well: *"duplication is far cheaper than the wrong abstraction."* Wait until you've seen the same change needed in several places before you extract the shared part.

<a id="3-reading-uml"></a>

## 3. Reading Class Diagrams

- **Relationships to know** `6` <!-- good -->
- **Hollow triangle** `inherits / implements` <!-- ok -->
- **Diamond** `whole–part` <!-- ok -->
- **Dashed line** `weaker: depends / implements` <!-- ok -->

Every pattern catalog draws its patterns as **UML class diagrams**, so you need to be able to read them. You don't need much of UML (the Unified Modeling Language). A class is a box with up to three compartments: its name, its fields and its methods. *Italic* names are abstract, and `«interface»` above a name marks an interface. A prefix on each member gives its visibility: `+` public, `-` private, `#` protected. The lines between boxes are where the meaning is. There are six kinds, and each one maps to a specific shape of code.

<figure class="figure">
<svg viewBox="0 0 760 400" width="760" role="img" aria-label="The six UML class relationships: association, aggregation, composition, dependency, inheritance and realization, each drawn between two classes">
  <g>
    <rect x="20" y="14" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="33" class="n-label">Order</text>
    <rect x="320" y="14" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="390" y="33" class="n-label">Customer</text>
    <line x1="160" y1="33" x2="318" y2="33" class="e-done"/><path d="M306 27 L318 33 L306 39" class="e-done"/>
    <text x="300" y="25" class="n-sub">1</text>
    <text x="490" y="37" class="vz-text" style="text-anchor:start">association: holds a reference</text>
  </g>
  <g>
    <rect x="20" y="78" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="97" class="n-label">Team</text>
    <rect x="320" y="78" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="390" y="97" class="n-label">Player</text>
    <path d="M160 97 L172 91 L184 97 L172 103 Z" class="e-done" fill="none"/><line x1="184" y1="97" x2="320" y2="97" class="e-done"/>
    <text x="304" y="89" class="n-sub">*</text>
    <text x="490" y="101" class="vz-text" style="text-anchor:start">aggregation: has parts it didn't create</text>
  </g>
  <g>
    <rect x="20" y="142" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="161" class="n-label">Order</text>
    <rect x="320" y="142" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="390" y="161" class="n-label">OrderLine</text>
    <path d="M160 161 L172 155 L184 161 L172 167 Z" class="n-done"/><line x1="184" y1="161" x2="320" y2="161" class="e-done"/>
    <text x="304" y="153" class="n-sub">1..*</text>
    <text x="490" y="165" class="vz-text" style="text-anchor:start">composition: creates and owns its parts</text>
  </g>
  <g>
    <rect x="20" y="206" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="225" class="n-label">Checkout</text>
    <rect x="320" y="206" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="390" y="225" class="n-label">Clock</text>
    <line x1="160" y1="225" x2="318" y2="225" class="e-act" stroke-dasharray="6 5"/><path d="M306 219 L318 225 L306 231" class="e-act"/>
    <text x="490" y="229" class="vz-text" style="text-anchor:start">dependency: uses it, holds no field</text>
  </g>
  <g>
    <rect x="20" y="270" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="289" class="n-label">Card</text>
    <rect x="320" y="270" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="390" y="289" class="n-label" style="font-style:italic">PaymentMethod</text>
    <line x1="160" y1="289" x2="306" y2="289" class="e-done"/><path d="M306 281 L320 289 L306 297 Z" class="e-done"/>
    <text x="490" y="293" class="vz-text" style="text-anchor:start">inheritance: is a kind of</text>
  </g>
  <g>
    <rect x="20" y="334" width="140" height="38" rx="6" class="n-idle" stroke-width="2"/><text x="90" y="353" class="n-label">StripeGateway</text>
    <rect x="320" y="328" width="140" height="50" rx="6" class="n-idle" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="390" y="342" class="n-sub">«interface»</text><text x="390" y="359" class="n-label">PaymentGateway</text>
    <line x1="160" y1="353" x2="306" y2="353" class="e-done" stroke-dasharray="6 5"/><path d="M306 345 L320 353 L306 361 Z" class="e-done"/>
    <text x="490" y="357" class="vz-text" style="text-anchor:start">realization: implements an interface</text>
  </g>
</svg>
<figcaption>The six relationships. Arrows point from the class that knows to the class that is known. Diamonds sit on the "whole" side, and hollow triangles point at the parent or the interface.</figcaption>
</figure>

Three rules make most diagrams easy to read. First, **arrows point towards the thing being depended on**. If you change the class at the arrowhead, the class at the tail may have to change too. Second, **solid lines are stronger than dashed ones**. A solid line means a field or a parent class, a long-lived relationship. A dashed line means a parameter, a local variable, or "implements". Third, **diamonds are about lifetime**. A filled diamond (composition) means the whole creates its parts and they die with it. A hollow diamond (aggregation) means the parts are passed in and can outlive the whole.

<a id="3-1-sequence-diagrams"></a>

### Sequence diagrams

Class diagrams show structure. **Sequence diagrams** show behaviour over time. Each object gets a vertical *lifeline*, time flows downwards, and a horizontal arrow is a message, meaning a method call. A solid arrowhead is a synchronous call. A dashed arrow going back is its return. An open arrowhead is an asynchronous message. You'll see sequence diagrams for the behavioural patterns, where *who calls whom, in what order* is the whole point.

```text
 client          Checkout         ShippingRule
   |                 |                  |
   |  total(cart)    |                  |
   |---------------->|   cost(cart)     |
   |                 |----------------->|
   |                 |      4.80        |
   |                 |<- - - - - - - - -|
   |     46.80       |                  |
   |<- - - - - - - - |                  |
```

**Interview question**

*Draw the class diagram for this: an Order has one or more OrderLines; each line refers to a Product from the catalogue; an Order is paid with a PaymentMethod, which is either a Card or a Wallet. Then show the code for each relationship.*

Go through the nouns and decide how long each relationship lasts. Lines are **created by** the order and mean nothing without it, so that's **composition** (a filled diamond on `Order`, multiplicity `1..*`). Products exist in the catalogue whether or not anyone orders them, so a line **refers to** a product: a plain **association**. `PaymentMethod` is abstract, and `Card` and `Wallet` **inherit** from it, so hollow triangles point up at it. The order **holds** whichever payment method was chosen, which is another association, to the abstract type. That's what lets either kind be used. In code, composition shows up as the whole *constructing* its parts. Association shows up as a field *passed in*.

```text
                       «abstract»
 Order  ─────────────▶  PaymentMethod
   ◆ 1                     △      △
   │                       │      │
   │ 1..*                Card   Wallet
 OrderLine ──────────▶ Product
```

**Answer — each relationship as code**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from decimal import Decimal


@dataclass(frozen=True)
class Product:                       # exists independently in the catalogue
    sku: str
    price: Decimal


@dataclass(frozen=True)
class OrderLine:
    product: Product                 # association: refers to, doesn't own
    quantity: int

    def subtotal(self) -> Decimal:
        return self.product.price * self.quantity


class PaymentMethod(ABC):            # abstract: italic name in UML
    @abstractmethod
    def authorise(self, amount: Decimal) -> str: ...


class Card(PaymentMethod):           # inheritance: hollow triangle to the parent
    def __init__(self, token: str) -> None:
        self.token = token

    def authorise(self, amount: Decimal) -> str:
        return f"card-auth-{self.token[-4:]}-{amount}"


class Wallet(PaymentMethod):
    def __init__(self, wallet_id: str) -> None:
        self.wallet_id = wallet_id

    def authorise(self, amount: Decimal) -> str:
        return f"wallet-auth-{self.wallet_id}-{amount}"


@dataclass
class Order:
    payment: PaymentMethod                                 # association, to the abstraction
    lines: list[OrderLine] = field(default_factory=list)   # composition: created here

    def add(self, product: Product, quantity: int) -> None:
        self.lines.append(OrderLine(product, quantity))    # the whole creates its parts

    def pay(self) -> str:
        return self.payment.authorise(sum((l.subtotal() for l in self.lines), Decimal("0")))
```

```typescript
class Product {
  // Exists independently in the catalogue.
  constructor(readonly sku: string, readonly pricePence: number) {}
}

class OrderLine {
  // Association: refers to a product, doesn't own it.
  constructor(readonly product: Product, readonly quantity: number) {}

  subtotal(): number {
    return this.product.pricePence * this.quantity;
  }
}

abstract class PaymentMethod {
  // Abstract: italic name in UML.
  abstract authorise(amountPence: number): string;
}

class Card extends PaymentMethod {
  constructor(private readonly token: string) {
    super();
  }
  authorise(amountPence: number): string {
    return `card-auth-${this.token.slice(-4)}-${amountPence}`;
  }
}

class Wallet extends PaymentMethod {
  constructor(private readonly walletId: string) {
    super();
  }
  authorise(amountPence: number): string {
    return `wallet-auth-${this.walletId}-${amountPence}`;
  }
}

class Order {
  private readonly lines: OrderLine[] = []; // composition: created and owned here

  constructor(private readonly payment: PaymentMethod) {} // association, to the abstraction

  add(product: Product, quantity: number): void {
    this.lines.push(new OrderLine(product, quantity)); // the whole creates its parts
  }

  pay(): string {
    return this.payment.authorise(this.lines.reduce((sum, l) => sum + l.subtotal(), 0));
  }
}
```

> **Tip**
>
> People argue a lot about **aggregation versus composition**, and the argument rarely matters. The useful question is about *lifetime*: who creates the part, and does the part outlive the whole? Delete an order and its lines go too (composition). Delete a team and the players still exist (aggregation). If the answer doesn't affect your design, a plain association line is fine. Most real diagrams use only association, inheritance, realization and dependency.

<a id="4-srp-and-ocp"></a>

## 4. SOLID I: Single Responsibility & Open/Closed

- **SRP: a module answers to** `one actor` <!-- great -->
- **OCP: add behaviour by** `adding code, not editing it` <!-- great -->
- **"Open/closed" coined by** `Bertrand Meyer, 1988` <!-- ok -->
- **SOLID collected by** `Robert C. Martin, ~2000` <!-- ok -->

**SOLID** is five principles that Robert C. Martin collected around 2000. Michael Feathers later noticed their initials spelled the acronym. They aren't patterns. They're the *reasons* patterns take the shape they do, and each GoF pattern can be read as a way of satisfying one or more of them. This section covers the first two, and the next section covers the other three.

The **Single Responsibility Principle** (SRP) is usually quoted as "a class should have only one reason to change". That's easy to agree with and hard to apply, because almost anything can be described as one reason or as five. Martin later sharpened it: *a module should be responsible to one, and only one, actor*. An *actor* is a group of people who request changes, such as finance, operations or the database team. If two different groups can ask you to change the same class for unrelated reasons, the class has two responsibilities. Sooner or later, a change for one group will break something for the other.

The **Open/Closed Principle** (OCP) comes from Bertrand Meyer's *Object-Oriented Software Construction* (1988): *software entities should be open for extension, but closed for modification*. In practice, it means arranging code so that the *expected* kinds of change are made by **adding** new code, such as a new class, function or registry entry, rather than by **editing** code that already works and is already tested. Strategy, Decorator, Observer, Factory registries and Visitor are all ways to make one particular axis of a system open/closed.

> **Interactive animation:** `ocp-switch` — rendered by the page script in the HTML version.

<a id="4-1-srp-in-practice"></a>

### SRP in practice: split by actor

The usual SRP violation is a domain class that has also become the place for formatting and persistence. Each of those concerns belongs to a different group of people, changes at a different rate, and needs different things to test it. Splitting them gives each group one file to change. It also means the domain logic can be tested without a database or a PDF library.

**SRP — one class per actor**

```python
from dataclasses import dataclass
from decimal import Decimal


# Before: finance, design and the DBA all edit this one class.
#
# class Invoice:
#     def total(self) -> Decimal: ...        # finance's tax rules
#     def to_pdf(self) -> bytes: ...         # the design team's layout
#     def save(self, conn) -> None: ...      # the DBA's schema


@dataclass(frozen=True)
class InvoiceLine:
    description: str
    amount: Decimal


@dataclass(frozen=True)
class Invoice:  # finance: the business rules, and nothing else
    number: str
    lines: tuple[InvoiceLine, ...]
    vat_rate: Decimal = Decimal("0.20")

    def net(self) -> Decimal:
        return sum((line.amount for line in self.lines), Decimal("0"))

    def total(self) -> Decimal:
        return (self.net() * (1 + self.vat_rate)).quantize(Decimal("0.01"))


class InvoiceRenderer:  # design: layout changes land here
    def to_text(self, invoice: Invoice) -> str:
        rows = [f"{l.description:<30}{l.amount:>10}" for l in invoice.lines]
        return "\n".join([f"Invoice {invoice.number}", *rows, f"{'Total':<30}{invoice.total():>10}"])


class InvoiceRepository:  # the DBA: schema changes land here
    def __init__(self, conn) -> None:
        self._conn = conn

    def save(self, invoice: Invoice) -> None:
        self._conn.execute(
            "insert into invoices (number, total) values (?, ?)",
            (invoice.number, str(invoice.total())),
        )
```

```typescript
// Before: finance, design and the DBA all edit this one class.
//
// class Invoice {
//   total(): number { ... }        // finance's tax rules
//   toPdf(): Uint8Array { ... }    // the design team's layout
//   save(db: Db): void { ... }     // the DBA's schema
// }

interface InvoiceLine {
  readonly description: string;
  readonly amountPence: number;
}

class Invoice {
  // Finance: the business rules, and nothing else.
  constructor(
    readonly number: string,
    readonly lines: readonly InvoiceLine[],
    readonly vatRate = 0.2,
  ) {}

  net(): number {
    return this.lines.reduce((sum, l) => sum + l.amountPence, 0);
  }

  total(): number {
    return Math.round(this.net() * (1 + this.vatRate));
  }
}

class InvoiceRenderer {
  // Design: layout changes land here.
  toText(invoice: Invoice): string {
    const rows = invoice.lines.map((l) => `${l.description.padEnd(30)}${String(l.amountPence).padStart(10)}`);
    return [`Invoice ${invoice.number}`, ...rows, `${"Total".padEnd(30)}${String(invoice.total()).padStart(10)}`].join("\n");
  }
}

class InvoiceRepository {
  // The DBA: schema changes land here.
  constructor(private readonly db: { run(sql: string, params: unknown[]): Promise<void> }) {}

  save(invoice: Invoice): Promise<void> {
    return this.db.run("insert into invoices (number, total) values (?, ?)", [invoice.number, invoice.total()]);
  }
}
```

<a id="4-2-ocp-in-practice"></a>

### OCP in practice: a list of rules instead of a list of branches

The pricing engine below is *closed* for modification: its loop never changes. It's *open* for extension, because a new promotion is a new class added to the list. That's the same shape as Strategy (section 20), applied to many rules at once.

**OCP — new promotions are new classes**

```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable, Protocol


@dataclass(frozen=True)
class Order:
    subtotal: Decimal
    items: int
    first_order: bool


class DiscountRule(Protocol):
    def amount(self, order: Order) -> Decimal: ...


@dataclass(frozen=True)
class PercentOver:
    threshold: Decimal
    percent: Decimal

    def amount(self, order: Order) -> Decimal:
        return order.subtotal * self.percent / 100 if order.subtotal >= self.threshold else Decimal("0")


@dataclass(frozen=True)
class FirstOrder:
    flat: Decimal

    def amount(self, order: Order) -> Decimal:
        return self.flat if order.first_order else Decimal("0")


class PricingEngine:
    """Closed: this loop never changes. Open: pass in more rules."""

    def __init__(self, rules: Iterable[DiscountRule]) -> None:
        self._rules = tuple(rules)

    def price(self, order: Order) -> Decimal:
        best = max((rule.amount(order) for rule in self._rules), default=Decimal("0"))
        return max(order.subtotal - best, Decimal("0"))


engine = PricingEngine([PercentOver(Decimal("100"), Decimal("10")), FirstOrder(Decimal("15"))])
print(engine.price(Order(subtotal=Decimal("120"), items=3, first_order=True)))  # 120 - max(12, 15) = 105
```

```typescript
interface Order {
  subtotalPence: number;
  items: number;
  firstOrder: boolean;
}

interface DiscountRule {
  amount(order: Order): number;
}

class PercentOver implements DiscountRule {
  constructor(private readonly thresholdPence: number, private readonly percent: number) {}
  amount(order: Order): number {
    return order.subtotalPence >= this.thresholdPence ? Math.round((order.subtotalPence * this.percent) / 100) : 0;
  }
}

class FirstOrder implements DiscountRule {
  constructor(private readonly flatPence: number) {}
  amount(order: Order): number {
    return order.firstOrder ? this.flatPence : 0;
  }
}

class PricingEngine {
  // Closed: this loop never changes. Open: pass in more rules.
  constructor(private readonly rules: readonly DiscountRule[]) {}

  price(order: Order): number {
    const best = Math.max(0, ...this.rules.map((r) => r.amount(order)));
    return Math.max(order.subtotalPence - best, 0);
  }
}

const engine = new PricingEngine([new PercentOver(10_000, 10), new FirstOrder(1500)]);
console.log(engine.price({ subtotalPence: 12_000, items: 3, firstOrder: true })); // 12000 - max(1200, 1500) = 10500
```

- **Strength — SRP isolates whoever asks for changes.** A finance change can't break the PDF layout, because they don't share a file any more.
- **Strength — OCP protects tested code.** Extending by adding means existing tests keep passing, and reviews only have to cover the new class.
- **Weakness — SRP can be over-applied.** Splitting a 40-line class into five 8-line classes, each with one caller, scatters one idea across five files.
- **Weakness — OCP needs a prediction.** You can only close code against the kinds of change you expect. Guess wrong, and the abstraction gets in the way of the change that actually comes.

**Interview question**

*An `Employee` class has `calculate_pay()`, used by finance, `report_hours()`, used by operations, and `save()`, used by the database team. Both `calculate_pay` and `report_hours` call a private helper, `regular_hours()`. Finance asks for a change to how regular hours are counted. What goes wrong, and how should the class be split?*

This is Martin's own example. The developer changes `regular_hours()` for finance, and finance's tests pass. But operations' `report_hours()` silently starts reporting different numbers, because it shared the helper. Nobody in operations asked for a change, and nobody on the finance side knew operations depended on it. The cause is **two actors sharing one module**. The fix is to give each actor its own class: a `PayCalculator` and an `HoursReporter`, each with its own copy of the regular-hours rule, which is free to drift. They share only the plain employee *data*. If callers want one convenient object, an `Employee` facade can delegate to both. The apparent duplication is deliberate: the two rules look the same today, but they belong to different people.

**Answer — one class per actor, shared data only**

```python
from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class EmployeeData:  # plain data, no behaviour: safe to share
    id: str
    hourly_rate: Decimal
    hours_by_day: tuple[float, ...]


class PayCalculator:  # finance's rules
    def regular_hours(self, e: EmployeeData) -> float:
        return sum(min(h, 8.0) for h in e.hours_by_day)  # finance: cap at 8 hours per day

    def calculate_pay(self, e: EmployeeData) -> Decimal:
        overtime = sum(e.hours_by_day) - self.regular_hours(e)
        return e.hourly_rate * Decimal(str(self.regular_hours(e))) + e.hourly_rate * Decimal("1.5") * Decimal(str(overtime))


class HoursReporter:  # operations' rules: free to differ from finance's
    def regular_hours(self, e: EmployeeData) -> float:
        return sum(h for h in e.hours_by_day if h <= 10.0)  # ops: ignore anomalous days

    def report_hours(self, e: EmployeeData) -> str:
        return f"{e.id}: {self.regular_hours(e):.1f} regular hours"


class EmployeeFacade:  # optional: one entry point that delegates
    def __init__(self, data: EmployeeData) -> None:
        self._data = data
        self._pay, self._hours = PayCalculator(), HoursReporter()

    def calculate_pay(self) -> Decimal:
        return self._pay.calculate_pay(self._data)

    def report_hours(self) -> str:
        return self._hours.report_hours(self._data)
```

```typescript
interface EmployeeData {
  // Plain data, no behaviour: safe to share.
  readonly id: string;
  readonly hourlyRatePence: number;
  readonly hoursByDay: readonly number[];
}

class PayCalculator {
  // Finance's rules.
  regularHours(e: EmployeeData): number {
    return e.hoursByDay.reduce((sum, h) => sum + Math.min(h, 8), 0); // finance: cap at 8 hours per day
  }

  calculatePay(e: EmployeeData): number {
    const regular = this.regularHours(e);
    const overtime = e.hoursByDay.reduce((a, b) => a + b, 0) - regular;
    return Math.round(e.hourlyRatePence * regular + e.hourlyRatePence * 1.5 * overtime);
  }
}

class HoursReporter {
  // Operations' rules: free to differ from finance's.
  regularHours(e: EmployeeData): number {
    return e.hoursByDay.filter((h) => h <= 10).reduce((a, b) => a + b, 0); // ops: ignore anomalous days
  }

  reportHours(e: EmployeeData): string {
    return `${e.id}: ${this.regularHours(e).toFixed(1)} regular hours`;
  }
}

class EmployeeFacade {
  // Optional: one entry point that delegates.
  private readonly pay = new PayCalculator();
  private readonly hours = new HoursReporter();

  constructor(private readonly data: EmployeeData) {}

  calculatePay(): number {
    return this.pay.calculatePay(this.data);
  }

  reportHours(): string {
    return this.hours.reportHours(this.data);
  }
}
```

> **Warning**
>
> **OCP isn't a rule against editing code.** No design is closed against every change, and trying to make one gives you abstraction everywhere and clarity nowhere. Choose the axes that actually change, such as new payment providers, new promotions or new export formats, and close the code against those. Everything else can stay simple, direct, and editable. When a new kind of change shows up a second time, *then* add the seam.

<a id="5-lsp-isp-dip"></a>

## 5. SOLID II: Liskov, Interface Segregation & Dependency Inversion

- **LSP: a subtype must** `keep every promise of its parent` <!-- great -->
- **ISP: interface size** `what one client needs` <!-- good -->
- **DIP: who owns the interface** `the high-level policy` <!-- great -->
- **DIP is not** `the same as DI` <!-- bad -->

The **Liskov Substitution Principle** (LSP) comes from Barbara Liskov's 1987 keynote and was formalised with Jeannette Wing in 1994: *if φ(x) is a property provable about objects x of type T, then φ(y) should be true for objects y of type S, where S is a subtype of T.* In plain words: **anywhere the code expects a parent type, any subtype must work without the caller noticing**. That's a promise about *behaviour*, not just method signatures. A subclass that has all the right methods but behaves differently breaks every caller that relied on how the parent behaved.

Behavioural subtyping turns that into checkable rules. A subtype may **not strengthen preconditions**: it can't accept less than the parent did. It may **not weaken postconditions**: it can't promise less than the parent did. It must **preserve invariants**, and it must **not throw new kinds of exception** that callers of the parent couldn't have expected. The textbook violation is `Square extends Rectangle`. Mathematically, a square is a rectangle. Behaviourally, it isn't, because a rectangle promises that setting its width leaves its height alone.

> **Interactive animation:** `lsp-square` — rendered by the page script in the HTML version.

The **Interface Segregation Principle** (ISP) says that *clients shouldn't be forced to depend on methods they don't use*. A "fat" interface, such as a `Machine` with `print`, `scan`, `fax` and `staple`, forces a simple printer to implement `fax` by throwing an error. That's an LSP violation waiting to happen. It also means every client recompiles, or at least gets re-reviewed, when an unrelated method changes. Split the interface by *client need*: `Printer`, `Scanner`, `Fax`. A class can implement several small interfaces, and each client depends on only the one it uses. In Python, `Protocol`, and in TypeScript, structural typing, make this nearly free: the *consumer* can declare the narrow interface it needs, right next to the function that uses it.

The **Dependency Inversion Principle** (DIP) says that *high-level modules shouldn't depend on low-level modules; both should depend on abstractions*. It also says *abstractions shouldn't depend on details*. The key word is *inversion*. In the naive design, the business policy (`ReportService`) imports the storage detail (`PostgresClient`), so the arrows point from policy to detail. Under DIP, the policy *defines and owns* an interface describing what it needs (`ReportStore`), and the detail implements it. The source-code arrow now points from the detail *towards* the policy. That's the opposite direction to the flow of control, which is why it's called an inversion. This is the root idea behind *hexagonal* (ports and adapters) and *clean* architectures.

```text
Before: the policy depends on the detail.     After: the detail depends on the policy.

  ReportService ───────▶ PostgresClient          ReportService ───────▶ «interface» ReportStore
  (business policy)      (storage detail)        (business policy)        owned by the domain
                                                                                   △
                                                                                   ┆ implements
                                                                          PostgresReportStore
                                                                          (adapter, outer layer)
```

**DIP — the domain owns the port, the adapter implements it**

```python
# domain/reports.py -- imports nothing from infrastructure.
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class Sale:
    day: date
    amount: Decimal


class ReportStore(Protocol):  # the port: shaped by what the policy needs
    def sales_between(self, start: date, end: date) -> list[Sale]: ...


class ReportService:  # high-level policy
    def __init__(self, store: ReportStore) -> None:
        self._store = store

    def weekly_total(self, week_start: date, week_end: date) -> Decimal:
        return sum((s.amount for s in self._store.sales_between(week_start, week_end)), Decimal("0"))


# adapters/postgres.py -- depends on the domain, never the other way round.
class PostgresReportStore:
    def __init__(self, conn) -> None:
        self._conn = conn

    def sales_between(self, start: date, end: date) -> list[Sale]:
        rows = self._conn.execute("select day, amount from sales where day between %s and %s", (start, end))
        return [Sale(day, Decimal(amount)) for day, amount in rows]


class InMemoryReportStore:  # a second adapter: tests and local runs
    def __init__(self, sales: list[Sale]) -> None:
        self._sales = sales

    def sales_between(self, start: date, end: date) -> list[Sale]:
        return [s for s in self._sales if start <= s.day <= end]
```

```typescript
// domain/reports.ts -- imports nothing from infrastructure.
export interface Sale {
  readonly day: string; // ISO date
  readonly amountPence: number;
}

export interface ReportStore {
  // The port: shaped by what the policy needs.
  salesBetween(start: string, end: string): Promise<Sale[]>;
}

export class ReportService {
  // High-level policy.
  constructor(private readonly store: ReportStore) {}

  async weeklyTotal(weekStart: string, weekEnd: string): Promise<number> {
    const sales = await this.store.salesBetween(weekStart, weekEnd);
    return sales.reduce((sum, s) => sum + s.amountPence, 0);
  }
}

// adapters/postgres.ts -- depends on the domain, never the other way round.
type Pool = { query(sql: string, params: unknown[]): Promise<{ rows: { day: string; amount: number }[] }> };

export class PostgresReportStore implements ReportStore {
  constructor(private readonly pool: Pool) {}

  async salesBetween(start: string, end: string): Promise<Sale[]> {
    const { rows } = await this.pool.query("select day, amount from sales where day between $1 and $2", [start, end]);
    return rows.map((r) => ({ day: r.day, amountPence: r.amount }));
  }
}

export class InMemoryReportStore implements ReportStore {
  // A second adapter: tests and local runs.
  constructor(private readonly sales: Sale[]) {}

  async salesBetween(start: string, end: string): Promise<Sale[]> {
    return this.sales.filter((s) => s.day >= start && s.day <= end);
  }
}
```

- **Strength — LSP makes polymorphism safe.** If every subtype keeps its parent's promises, code written against the parent works with every subtype, including ones written years later.
- **Strength — DIP protects the core from the edges.** Databases, frameworks and vendors can be swapped, or faked in tests, without touching the business rules.
- **Weakness — ISP taken too far makes many tiny interfaces.** Ten one-method interfaces for one class are hard to navigate. Split by real client needs, not by method count.
- **Weakness — DIP adds a layer.** Each port is an interface plus at least one adapter. For a small script that will only ever talk to one database, that's ceremony.

**Interview question**

*A `ReadOnlyList` class extends `list` and overrides `append` to raise an error. Is that an LSP violation? How do Python and TypeScript model read-only collections instead?*

Yes. Code that accepts a `list` is allowed to call `append`, because that's part of `list`'s contract. Passing it a `ReadOnlyList` makes that code fail at runtime, so `ReadOnlyList` has **strengthened a precondition**: "you may call append" became "you may not". The fix is to flip the hierarchy. The *read-only* interface is the **supertype**, and the mutable one extends it, because a mutable list can do everything a read-only list can, plus more. That's exactly how both standard libraries are built. Python's `collections.abc.Sequence` has no mutating methods, and `MutableSequence` extends it. A function that only reads should accept `Sequence`. In TypeScript, `ReadonlyArray<T>` has no `push`, and a normal `T[]` can be passed anywhere a `readonly T[]` is expected, but not the other way round. This is ISP and LSP working together: callers ask for the narrowest interface they need.

**Answer — the read-only type is the supertype**

```python
from collections.abc import MutableSequence, Sequence


# LSP violation: a "list" that breaks list's contract.
class ReadOnlyList(list):
    def append(self, item):
        raise TypeError("read-only")  # callers of list never expected this


def add_default(items: list[str]) -> None:
    items.append("default")  # valid for every list... except ReadOnlyList


# The standard library's design: read-only is the supertype.
def total(prices: Sequence[float]) -> float:  # asks only for what it uses
    return sum(prices)


def add_tax_line(prices: MutableSequence[float], tax: float) -> None:
    prices.append(tax)  # asks for mutation explicitly


assert issubclass(list, MutableSequence) and issubclass(tuple, Sequence)
assert not issubclass(tuple, MutableSequence)

print(total([9.99, 5.00]), total((9.99, 5.00)))  # both work: lists and tuples are Sequences
```

```typescript
// LSP violation: an "array" that breaks Array's contract.
class ReadOnlyList<T> extends Array<T> {
  override push(..._items: T[]): number {
    throw new TypeError("read-only"); // callers of Array never expected this
  }
}

// The language's design: ReadonlyArray is the supertype.
function total(prices: readonly number[]): number {
  // asks only for what it uses
  return prices.reduce((a, b) => a + b, 0);
}

function addTaxLine(prices: number[], tax: number): void {
  prices.push(tax); // asks for mutation explicitly
}

const cart: number[] = [999, 500];
total(cart); // OK: a mutable array is assignable to readonly number[]

const frozen: readonly number[] = cart;
// addTaxLine(frozen, 120);  // compile error: 'push' does not exist on type 'readonly number[]'
```

> **Warning**
>
> **Dependency inversion and dependency injection are different things.** Injection is a *technique*: an object gets its collaborators from outside, through its constructor. Inversion is about *which way the source-code dependency points*, and *who owns the interface*. You can inject a `PostgresClient` straight into `ReportService`. That's DI, but no inversion, because the policy still imports the detail. DIP is satisfied only when the interface lives with, and is shaped by, the high-level code that uses it.

<a id="6-composition-and-delegation"></a>

## 6. Composition, Delegation & Inheritance

- **Inheritance couples you to** `the parent's internals` <!-- bad -->
- **Composition couples you to** `the collaborator's interface` <!-- great -->
- **Delegation costs** `one forwarding method each` <!-- ok -->
- **Python method resolution order** `C3 linearisation` <!-- ok -->

Inheritance does two jobs at once, and most of its problems come from mixing them up. **Interface inheritance** (subtyping) says "this class can be used wherever the parent is expected", which is LSP's territory. **Implementation inheritance** says "reuse the parent's code". Interface inheritance is a promise. Implementation inheritance is a dependency on the parent's *internals*: which methods call which, in what order, and which fields they touch. None of that is part of any documented contract. Composition gets reuse without that dependency. The new class *holds* an instance of the other and **delegates** to it, so it depends only on the other class's public interface.

> **Interactive animation:** `class-explosion` (variant `inheritance`) — rendered by the page script in the HTML version.

<a id="6-1-fragile-base-class"></a>

### The fragile base class problem

Joshua Bloch made the classic example famous in *Effective Java*: a set that counts how many items were ever added. Override both `add` and `add_all` to count, and the count comes out double. The parent's `add_all` happens to call `add` internally, so each item is counted twice. The subclass is correct only for one particular version of the parent's private implementation. If the parent's author later changes `add_all` to append directly, which is a harmless optimisation from the parent's point of view, the subclass breaks the other way. A base class is **fragile** when you can't safely change its implementation without reading every subclass.

**The fragile base class, and the composition fix**

```python
class Collection:
    def __init__(self) -> None:
        self._items: list = []

    def add(self, item) -> None:
        self._items.append(item)

    def add_all(self, items) -> None:
        for item in items:
            self.add(item)  # an implementation detail...

    def __len__(self) -> int:
        return len(self._items)


class CountingCollection(Collection):  # inheritance: depends on that detail
    def __init__(self) -> None:
        super().__init__()
        self.added = 0

    def add(self, item) -> None:
        self.added += 1
        super().add(item)

    def add_all(self, items) -> None:
        items = list(items)
        self.added += len(items)
        super().add_all(items)  # ...which calls our add() again


broken = CountingCollection()
broken.add_all(["a", "b", "c"])
print(broken.added)  # 6, not 3


class CountingWrapper:  # composition: depends only on the public interface
    def __init__(self, inner: Collection) -> None:
        self._inner = inner
        self.added = 0

    def add(self, item) -> None:
        self.added += 1
        self._inner.add(item)

    def add_all(self, items) -> None:
        items = list(items)
        self.added += len(items)
        self._inner.add_all(items)  # the inner add() is the inner object's business

    def __len__(self) -> int:
        return len(self._inner)


fixed = CountingWrapper(Collection())
fixed.add_all(["a", "b", "c"])
print(fixed.added)  # 3, whatever Collection.add_all does inside
```

```typescript
class Collection<T> {
  protected items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  addAll(items: Iterable<T>): void {
    for (const item of items) this.add(item); // an implementation detail...
  }

  get size(): number {
    return this.items.length;
  }
}

class CountingCollection<T> extends Collection<T> {
  // Inheritance: depends on that detail.
  added = 0;

  override add(item: T): void {
    this.added++;
    super.add(item);
  }

  override addAll(items: Iterable<T>): void {
    const list = [...items];
    this.added += list.length;
    super.addAll(list); // ...which calls our add() again
  }
}

const broken = new CountingCollection<string>();
broken.addAll(["a", "b", "c"]);
console.log(broken.added); // 6, not 3

class CountingWrapper<T> {
  // Composition: depends only on the public interface.
  added = 0;

  constructor(private readonly inner: Collection<T>) {}

  add(item: T): void {
    this.added++;
    this.inner.add(item);
  }

  addAll(items: Iterable<T>): void {
    const list = [...items];
    this.added += list.length;
    this.inner.addAll(list); // the inner add() is the inner object's business
  }

  get size(): number {
    return this.inner.size;
  }
}

const fixed = new CountingWrapper(new Collection<string>());
fixed.addAll(["a", "b", "c"]);
console.log(fixed.added); // 3, whatever Collection.addAll does inside
```

<a id="6-2-mixins-and-multiple-inheritance"></a>

### Mixins and multiple inheritance

Python supports multiple inheritance and resolves method lookups using the **C3 linearisation**, which you can inspect as `Class.__mro__`. `super()` follows that order, not "the parent", which is what makes cooperative *mixins* work: small classes that each add one capability, like `JsonMixin` or `TimestampMixin`, combined into one class. TypeScript classes have single inheritance only. The usual mixin technique there is a function that takes a class and returns a subclass of it, `const Timestamped = <B extends Ctor>(Base: B) => class extends Base { ... }`. Mixins are still inheritance, so the fragile-base-class risk still applies. Keep them small, stateless where possible, and independent of each other.

- **Strength — composition depends only on interfaces.** The wrapped class can change its internals freely, and the wrapper can't tell.
- **Strength — composition works at runtime.** Delegates can be swapped per instance, and the same delegate can be shared by several wrappers.
- **Weakness — delegation means forwarding code.** Every method you want to expose needs a one-line forwarder. In TypeScript there's no shortcut. In Python, `__getattr__` can forward automatically, with a catch (see below).
- **Weakness — inheritance is sometimes simply right.** A framework base class *designed* for extension, with documented hooks, is the cheapest correct design. Fighting it with composition only adds code.

**Interview question**

*When is inheritance the right choice? Give concrete criteria, and show a base class that is designed to be extended.*

Use inheritance when **all** of these hold. **One:** the subclass really *is* a kind of the parent in every context, and LSP holds, so it can be used anywhere the parent can. **Two:** the parent is **designed for extension**. Its author decided which methods subclasses may override (the *hooks*), documented when they're called, and doesn't call overridable methods in surprising places. **Three:** the hierarchy stays **shallow**, one or two levels deep. **Four:** you need polymorphism *and* shared behaviour together, which an interface alone can't give you. Exception hierarchies satisfy all four. So do framework classes like `unittest.TestCase` and HTTP handler base classes. A base designed for extension usually looks like a Template Method (section 21): one public method that subclasses don't override, which calls protected hooks that they do.

**Answer — inheritance done on purpose**

```python
from abc import ABC, abstractmethod
from typing import final


class PaymentError(Exception):  # exception hierarchies: the classic good case
    """Base for every payment failure; callers can catch this one type."""


class CardDeclined(PaymentError):
    def __init__(self, reason: str) -> None:
        super().__init__(f"card declined: {reason}")
        self.reason = reason


class ProviderUnavailable(PaymentError):
    retryable = True


class Importer(ABC):
    """Designed for extension: one fixed algorithm, documented hooks."""

    @final  # type checkers reject overrides of the template itself
    def run(self, raw: bytes) -> int:
        rows = self.parse(raw)          # required hook
        rows = [r for r in rows if self.keep(r)]
        for row in rows:
            self.save(row)              # required hook
        self.after_import(len(rows))    # optional hook
        return len(rows)

    @abstractmethod
    def parse(self, raw: bytes) -> list[dict]: ...

    @abstractmethod
    def save(self, row: dict) -> None: ...

    def keep(self, row: dict) -> bool:  # optional hook with a safe default
        return True

    def after_import(self, count: int) -> None:  # optional hook, does nothing by default
        pass
```

```typescript
export class PaymentError extends Error {
  // Exception hierarchies: the classic good case.
  override name = "PaymentError";
}

export class CardDeclined extends PaymentError {
  override name = "CardDeclined";
  constructor(readonly reason: string) {
    super(`card declined: ${reason}`);
  }
}

export class ProviderUnavailable extends PaymentError {
  override name = "ProviderUnavailable";
  readonly retryable = true;
}

export abstract class Importer {
  // Designed for extension: one fixed algorithm, documented hooks.
  // TypeScript has no `final`; the convention is not to override run().
  run(raw: Uint8Array): number {
    const rows = this.parse(raw).filter((r) => this.keep(r)); // required hook, optional hook
    for (const row of rows) this.save(row); // required hook
    this.afterImport(rows.length); // optional hook
    return rows.length;
  }

  protected abstract parse(raw: Uint8Array): Record<string, unknown>[];
  protected abstract save(row: Record<string, unknown>): void;

  protected keep(_row: Record<string, unknown>): boolean {
    return true; // optional hook with a safe default
  }

  protected afterImport(_count: number): void {
    // optional hook, does nothing by default
  }
}
```

> **Warning**
>
> Python's `__getattr__` looks like free delegation: define it to return `getattr(self._inner, name)` and every method is forwarded. **It doesn't forward special methods.** `len(wrapper)`, `for x in wrapper`, `wrapper == other` and `wrapper[0]` look up `__len__`, `__iter__`, `__eq__` and `__getitem__` on the *type*, skipping `__getattr__` entirely. So the wrapper quietly isn't a collection any more. Either define the dunder methods you need explicitly, or subclass a base like `collections.UserList` that already does.

<a id="unit-2"></a>

## Unit 2 — Creational Patterns

Five GoF patterns, plus dependency injection: who decides which class gets instantiated, when it happens, and how the rest of the code is kept from caring.

<a id="7-factory-method"></a>

## 7. Factory Method

- **Scope** `class: uses inheritance` <!-- ok -->
- **Who picks the concrete product** `a subclass` <!-- ok -->
- **Composition alternative** `inject a factory function` <!-- good -->
- **Often confused with** `static factory methods` <!-- bad -->

**Intent:** *define an interface for creating an object, but let subclasses decide which class to instantiate.* A base class contains an algorithm that needs to create some object along the way, like a writer, a connection or a parser, but it shouldn't decide which concrete class that is. So it calls an overridable method, the **factory method**, and each subclass overrides it to return its own product. The algorithm stays in the base class, written once. Only the "which class" decision varies.

It's the creational twin of Template Method (section 21). The base class's algorithm is a template, and one of its steps happens to be "create the thing". It's one of only four GoF patterns that work through inheritance rather than composition. In Python and TypeScript, the composition version, passing in a factory *function*, is often simpler. The inheritance version is right when you're already subclassing for other reasons, such as framework extension points.

```text
         «abstract» ReportJob                      «abstract» RowWriter
  ┌──────────────────────────────────┐          ┌─────────────────────┐
  │ + run(rows)    calls ↓           │ creates  │ + write(row)        │
  │ # create_writer()   abstract     │ ───────▶ │ + getvalue()        │
  └──────────────────────────────────┘          └─────────────────────┘
          △                   △                       △            △
  CsvReportJob        JsonLinesReportJob         CsvWriter   JsonLinesWriter
  create_writer() → CsvWriter()   create_writer() → JsonLinesWriter()
```

<a id="7-1-three-things-called-factory"></a>

### Three different things called "factory"

| Name | What it is | Example |
| --- | --- | --- |
| Simple factory | a function or registry that returns the right object for an input | `make_sender("sms")` (crash course, section 6) |
| Static factory method | a named alternative constructor on the class itself | `datetime.fromisoformat(s)`, `dict.fromkeys(k)`, `Array.from(it)`, `Promise.resolve(v)` |
| GoF Factory Method | an overridable method that subclasses use to choose the product | `ReportJob.create_writer()` below |

Static factory methods are worth using everywhere. They have *names*, so `Money.from_cents(1250)` and `Money.parse("12.50 GBP")` can coexist, which two plain constructors can't. They can return a cached instance or a subclass, and they can validate before anything is built. But they aren't the GoF pattern, because nothing is overridden.

> **Interactive animation:** `factory-registry` — rendered by the page script in the HTML version.

**Factory Method — the job is fixed, the writer varies**

```python
import csv
import io
import json
from abc import ABC, abstractmethod
from typing import Iterable


class RowWriter(ABC):
    @abstractmethod
    def write(self, row: dict) -> None: ...

    @abstractmethod
    def getvalue(self) -> bytes: ...


class CsvWriter(RowWriter):
    def __init__(self) -> None:
        self._buffer = io.StringIO()
        self._writer: csv.DictWriter | None = None

    def write(self, row: dict) -> None:
        if self._writer is None:  # the header comes from the first row
            self._writer = csv.DictWriter(self._buffer, fieldnames=list(row))
            self._writer.writeheader()
        self._writer.writerow(row)

    def getvalue(self) -> bytes:
        return self._buffer.getvalue().encode()


class JsonLinesWriter(RowWriter):
    def __init__(self) -> None:
        self._lines: list[str] = []

    def write(self, row: dict) -> None:
        self._lines.append(json.dumps(row, default=str))

    def getvalue(self) -> bytes:
        return ("\n".join(self._lines) + "\n").encode()


class ReportJob(ABC):
    def run(self, rows: Iterable[dict]) -> bytes:
        writer = self.create_writer()  # the factory method
        for row in rows:
            writer.write(self.transform(row))
        return writer.getvalue()

    @abstractmethod
    def create_writer(self) -> RowWriter: ...

    def transform(self, row: dict) -> dict:  # a second, optional hook
        return row


class CsvReportJob(ReportJob):
    def create_writer(self) -> RowWriter:
        return CsvWriter()


class JsonLinesReportJob(ReportJob):
    def create_writer(self) -> RowWriter:
        return JsonLinesWriter()

    def transform(self, row: dict) -> dict:
        return {**row, "exported": True}


rows = [{"sku": "A-17", "qty": 2}, {"sku": "B-02", "qty": 1}]
print(CsvReportJob().run(rows).decode())
print(JsonLinesReportJob().run(rows).decode())
```

```typescript
interface RowWriter {
  write(row: Record<string, unknown>): void;
  getValue(): string;
}

class CsvWriter implements RowWriter {
  private columns?: string[];
  private readonly lines: string[] = [];

  write(row: Record<string, unknown>): void {
    if (!this.columns) {
      // The header comes from the first row.
      this.columns = Object.keys(row);
      this.lines.push(this.columns.join(","));
    }
    this.lines.push(this.columns.map((c) => `"${String(row[c]).replaceAll('"', '""')}"`).join(","));
  }

  getValue(): string {
    return this.lines.join("\n");
  }
}

class JsonLinesWriter implements RowWriter {
  private readonly lines: string[] = [];

  write(row: Record<string, unknown>): void {
    this.lines.push(JSON.stringify(row));
  }

  getValue(): string {
    return this.lines.join("\n") + "\n";
  }
}

abstract class ReportJob {
  run(rows: Iterable<Record<string, unknown>>): string {
    const writer = this.createWriter(); // the factory method
    for (const row of rows) writer.write(this.transform(row));
    return writer.getValue();
  }

  protected abstract createWriter(): RowWriter;

  protected transform(row: Record<string, unknown>): Record<string, unknown> {
    return row; // a second, optional hook
  }
}

class CsvReportJob extends ReportJob {
  protected createWriter(): RowWriter {
    return new CsvWriter();
  }
}

class JsonLinesReportJob extends ReportJob {
  protected createWriter(): RowWriter {
    return new JsonLinesWriter();
  }

  protected override transform(row: Record<string, unknown>) {
    return { ...row, exported: true };
  }
}

const rows = [{ sku: "A-17", qty: 2 }, { sku: "B-02", qty: 1 }];
console.log(new CsvReportJob().run(rows));
console.log(new JsonLinesReportJob().run(rows));
```

- **Strength — the algorithm is written once.** `run()` lives in one place, and every job type reuses it, including its error handling and logging.
- **Strength — a natural extension point.** Frameworks expose factory methods so users can plug in their own classes without forking framework code.
- **Weakness — a subclass per product.** If the *only* thing a subclass does is pick a product, that's a whole class to express one constructor call.
- **Weakness — tied to inheritance.** You can't change the product at runtime, or pick it per call, without creating another subclass.

**Interview question**

*Your `HttpClient` base class creates `Connection` objects internally. A team needs connections that trust a custom certificate authority. How do you allow that without editing `HttpClient`, and what's the composition alternative?*

The inheritance answer is a **factory method**. `HttpClient` calls `self.create_connection(host)` wherever it needs a connection, and the default implementation returns a plain `Connection`. The team subclasses it as `CustomCaHttpClient` and overrides only that one method. The composition answer, usually the better one in Python and TypeScript, is to **inject a factory**: a constructor parameter `connection_factory`, defaulting to the plain `Connection` constructor. Callers pass a function that builds the special connection, with no subclass needed, and the choice can differ per instance. Choose inheritance when the subclass also overrides other hooks. Choose injection when picking the product is the only variation.

**Answer — both versions side by side**

```python
import ssl
from typing import Callable


class Connection:
    def __init__(self, host: str, context: ssl.SSLContext | None = None) -> None:
        self.host = host
        self.context = context or ssl.create_default_context()

    def send(self, request: bytes) -> bytes:
        return b"HTTP/1.1 200 OK"  # real socket work elided


# 1. Factory Method: a subclass overrides one hook.
class HttpClient:
    def get(self, host: str, path: str) -> bytes:
        conn = self.create_connection(host)  # the factory method
        return conn.send(f"GET {path} HTTP/1.1\r\nHost: {host}\r\n\r\n".encode())

    def create_connection(self, host: str) -> Connection:
        return Connection(host)


class CustomCaHttpClient(HttpClient):
    def __init__(self, ca_file: str) -> None:
        self._context = ssl.create_default_context(cafile=ca_file)

    def create_connection(self, host: str) -> Connection:
        return Connection(host, self._context)


# 2. Composition: inject the factory; no subclass at all.
class InjectedHttpClient:
    def __init__(self, connection_factory: Callable[[str], Connection] = Connection) -> None:
        self._connect = connection_factory

    def get(self, host: str, path: str) -> bytes:
        return self._connect(host).send(f"GET {path} HTTP/1.1\r\nHost: {host}\r\n\r\n".encode())


internal_ctx = ssl.create_default_context(cafile="/etc/ssl/internal-ca.pem")
client = InjectedHttpClient(lambda host: Connection(host, internal_ctx))
```

```typescript
import { readFileSync } from "node:fs";

class Connection {
  constructor(readonly host: string, readonly ca?: Buffer) {}

  async send(request: string): Promise<string> {
    return "HTTP/1.1 200 OK"; // real socket work elided
  }
}

// 1. Factory Method: a subclass overrides one hook.
class HttpClient {
  get(host: string, path: string): Promise<string> {
    const conn = this.createConnection(host); // the factory method
    return conn.send(`GET ${path} HTTP/1.1\r\nHost: ${host}\r\n\r\n`);
  }

  protected createConnection(host: string): Connection {
    return new Connection(host);
  }
}

class CustomCaHttpClient extends HttpClient {
  constructor(private readonly ca: Buffer) {
    super();
  }

  protected override createConnection(host: string): Connection {
    return new Connection(host, this.ca);
  }
}

// 2. Composition: inject the factory; no subclass at all.
type ConnectionFactory = (host: string) => Connection;

class InjectedHttpClient {
  constructor(private readonly connect: ConnectionFactory = (host) => new Connection(host)) {}

  get(host: string, path: string): Promise<string> {
    return this.connect(host).send(`GET ${path} HTTP/1.1\r\nHost: ${host}\r\n\r\n`);
  }
}

const internalCa = readFileSync("/etc/ssl/internal-ca.pem");
const client = new InjectedHttpClient((host) => new Connection(host, internalCa));
```

> **Warning**
>
> **Never call a factory method, or any other overridable method, from the base class constructor.** In TypeScript and JavaScript, a subclass's field initialisers run *after* `super()` returns. So when the base constructor calls an overridden method, that method sees the subclass's fields as `undefined`. In the example above, a `createConnection` called from `HttpClient`'s constructor would read `this.ca` before it was set. Python has the same trap if a subclass sets its attributes after calling `super().__init__()`. Create products lazily, on first use, as `get()` does here.

<a id="8-abstract-factory"></a>

## 8. Abstract Factory

- **Creates** `a family of matching objects` <!-- great -->
- **Guarantees** `families are never mixed` <!-- great -->
- **Adding a new family** `one new factory class` <!-- good -->
- **Adding a new product kind** `edit every factory` <!-- bad -->

**Intent:** *provide an interface for creating families of related or dependent objects without specifying their concrete classes.* Some objects only make sense together. Your app needs a blob store, a queue and a secrets store, and in production all three must come from the same cloud, while in tests all three should be in memory. If each piece of code chooses its own implementation, sooner or later somebody pairs an AWS queue with a local blob store and gets a bug that only shows up in staging. An **abstract factory** is one object with a creation method for each product. Each concrete factory produces a whole consistent *family*. The application receives one factory and asks it for everything, so it can't mix families even by accident.

```text
                 «interface» CloudFactory
         ┌──────────────────────────────────────┐
         │ + blob_store() → BlobStore           │
         │ + queue(name)  → Queue               │
         │ + secrets()    → SecretStore         │
         └──────────────────────────────────────┘
                 △                         △
        LocalFactory                   AwsFactory
   InMemoryBlobStore              S3BlobStore
   InMemoryQueue                  SqsQueue
   EnvSecretStore                 SecretsManagerStore
```

> **Interactive animation:** `abstract-factory-families` — rendered by the page script in the HTML version.

**Abstract Factory — one family per environment**

```python
import os
from collections import defaultdict, deque
from typing import Protocol


class BlobStore(Protocol):
    def put(self, key: str, data: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...


class Queue(Protocol):
    def send(self, body: str) -> None: ...
    def receive(self) -> str | None: ...


class SecretStore(Protocol):
    def get(self, name: str) -> str: ...


class CloudFactory(Protocol):
    def blob_store(self) -> BlobStore: ...
    def queue(self, name: str) -> Queue: ...
    def secrets(self) -> SecretStore: ...


# --- the local family: in memory, for tests and laptops -----------------------
class InMemoryBlobStore:
    def __init__(self) -> None:
        self._data: dict[str, bytes] = {}

    def put(self, key: str, data: bytes) -> None:
        self._data[key] = data

    def get(self, key: str) -> bytes:
        return self._data[key]


class InMemoryQueue:
    def __init__(self) -> None:
        self._messages: deque[str] = deque()

    def send(self, body: str) -> None:
        self._messages.append(body)

    def receive(self) -> str | None:
        return self._messages.popleft() if self._messages else None


class EnvSecretStore:
    def get(self, name: str) -> str:
        return os.environ[name]


class LocalFactory:
    def __init__(self) -> None:
        self._blobs = InMemoryBlobStore()
        self._queues: dict[str, InMemoryQueue] = defaultdict(InMemoryQueue)

    def blob_store(self) -> BlobStore:
        return self._blobs

    def queue(self, name: str) -> Queue:
        return self._queues[name]  # the same name gives the same queue

    def secrets(self) -> SecretStore:
        return EnvSecretStore()


# --- the AWS family: every product talks to the same account and region -------
class S3BlobStore:
    def __init__(self, s3, bucket: str) -> None:
        self._s3, self._bucket = s3, bucket

    def put(self, key: str, data: bytes) -> None:
        self._s3.put_object(Bucket=self._bucket, Key=key, Body=data)

    def get(self, key: str) -> bytes:
        return self._s3.get_object(Bucket=self._bucket, Key=key)["Body"].read()


class SqsQueue:
    def __init__(self, sqs, url: str) -> None:
        self._sqs, self._url = sqs, url

    def send(self, body: str) -> None:
        self._sqs.send_message(QueueUrl=self._url, MessageBody=body)

    def receive(self) -> str | None:
        messages = self._sqs.receive_message(QueueUrl=self._url, MaxNumberOfMessages=1).get("Messages", [])
        if not messages:
            return None
        self._sqs.delete_message(QueueUrl=self._url, ReceiptHandle=messages[0]["ReceiptHandle"])
        return messages[0]["Body"]


class SecretsManagerStore:
    def __init__(self, client) -> None:
        self._client = client

    def get(self, name: str) -> str:
        return self._client.get_secret_value(SecretId=name)["SecretString"]


class AwsFactory:
    def __init__(self, session, bucket: str, queue_urls: dict[str, str]) -> None:
        self._session, self._bucket, self._urls = session, bucket, queue_urls

    def blob_store(self) -> BlobStore:
        return S3BlobStore(self._session.client("s3"), self._bucket)

    def queue(self, name: str) -> Queue:
        return SqsQueue(self._session.client("sqs"), self._urls[name])

    def secrets(self) -> SecretStore:
        return SecretsManagerStore(self._session.client("secretsmanager"))
```

```typescript
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export interface BlobStore {
  put(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array>;
}
export interface Queue {
  send(body: string): Promise<void>;
  receive(): Promise<string | undefined>;
}
export interface SecretStore {
  get(name: string): Promise<string>;
}
export interface CloudFactory {
  blobStore(): BlobStore;
  queue(name: string): Queue;
  secrets(): SecretStore;
}

// --- the local family: in memory, for tests and laptops ---------------------
class InMemoryBlobStore implements BlobStore {
  private readonly data = new Map<string, Uint8Array>();
  async put(key: string, data: Uint8Array) {
    this.data.set(key, data);
  }
  async get(key: string) {
    const value = this.data.get(key);
    if (!value) throw new Error(`no such key: ${key}`);
    return value;
  }
}

class InMemoryQueue implements Queue {
  private readonly messages: string[] = [];
  async send(body: string) {
    this.messages.push(body);
  }
  async receive() {
    return this.messages.shift();
  }
}

class EnvSecretStore implements SecretStore {
  async get(name: string) {
    const value = process.env[name];
    if (value === undefined) throw new Error(`missing secret ${name}`);
    return value;
  }
}

export class LocalFactory implements CloudFactory {
  private readonly blobs = new InMemoryBlobStore();
  private readonly queues = new Map<string, InMemoryQueue>();

  blobStore() {
    return this.blobs;
  }
  queue(name: string) {
    if (!this.queues.has(name)) this.queues.set(name, new InMemoryQueue()); // same name, same queue
    return this.queues.get(name)!;
  }
  secrets() {
    return new EnvSecretStore();
  }
}

// --- the AWS family: every product talks to the same account and region -----
class S3BlobStore implements BlobStore {
  constructor(private readonly s3: S3Client, private readonly bucket: string) {}
  async put(key: string, data: Uint8Array) {
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data }));
  }
  async get(key: string) {
    const out = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return out.Body!.transformToByteArray();
  }
}

class SqsQueue implements Queue {
  constructor(private readonly sqs: SQSClient, private readonly url: string) {}
  async send(body: string) {
    await this.sqs.send(new SendMessageCommand({ QueueUrl: this.url, MessageBody: body }));
  }
  async receive() {
    const out = await this.sqs.send(new ReceiveMessageCommand({ QueueUrl: this.url, MaxNumberOfMessages: 1 }));
    const message = out.Messages?.[0];
    if (!message) return undefined;
    await this.sqs.send(new DeleteMessageCommand({ QueueUrl: this.url, ReceiptHandle: message.ReceiptHandle }));
    return message.Body;
  }
}

class SecretsManagerStore implements SecretStore {
  constructor(private readonly client: SecretsManagerClient) {}
  async get(name: string) {
    const out = await this.client.send(new GetSecretValueCommand({ SecretId: name }));
    return out.SecretString!;
  }
}

export class AwsFactory implements CloudFactory {
  constructor(
    private readonly region: string,
    private readonly bucket: string,
    private readonly queueUrls: Record<string, string>,
  ) {}

  blobStore() {
    return new S3BlobStore(new S3Client({ region: this.region }), this.bucket);
  }
  queue(name: string) {
    return new SqsQueue(new SQSClient({ region: this.region }), this.queueUrls[name]);
  }
  secrets() {
    return new SecretsManagerStore(new SecretsManagerClient({ region: this.region }));
  }
}
```

- **Strength — consistency is guaranteed.** Code that only ever talks to one factory can't combine products from two families.
- **Strength — switching a whole environment is one decision.** Local, AWS, or a future GCP family: the composition root picks one factory, and nothing else changes.
- **Weakness — new product kinds are expensive.** Adding a `cache()` method means editing the interface *and* every concrete factory. The pattern is closed against new families, not against new products.
- **Weakness — heavyweight for one product.** If a "family" has one member, this is just a factory with extra ceremony.

**Interview question**

*Where should the choice of factory happen, and how do you stop the rest of the code from creating products some other way?*

The choice happens **once**, in the composition root, based on configuration such as an environment variable. Everything below that receives a `CloudFactory`, or better, only the specific products it needs, already created. Two habits keep families from being mixed. First, **the concrete product classes aren't imported outside the factory module**. Many teams enforce that with a lint rule or by not exporting the classes. Second, **application code depends on the interfaces** (`BlobStore`, `Queue`), never on `S3BlobStore`. Then the only way to get a queue is from the factory, so the only queues that exist come from the chosen family. Tests use `LocalFactory` and get a full, consistent, in-memory world without touching the network.

**Answer — choosing the family once, at the root**

```python
import os

import boto3


def build_factory() -> CloudFactory:
    env = os.environ.get("APP_ENV", "local")
    if env == "local":
        return LocalFactory()
    if env in {"staging", "production"}:
        session = boto3.Session(region_name=os.environ["AWS_REGION"])
        urls = {"orders": os.environ["ORDERS_QUEUE_URL"]}
        return AwsFactory(session, bucket=os.environ["BUCKET"], queue_urls=urls)
    raise ValueError(f"unknown APP_ENV {env!r}")


class ReceiptService:  # sees only interfaces, built from one family
    def __init__(self, blobs: BlobStore, queue: Queue) -> None:
        self._blobs, self._queue = blobs, queue

    def store(self, order_id: str, pdf: bytes) -> None:
        key = f"receipts/{order_id}.pdf"
        self._blobs.put(key, pdf)
        self._queue.send(key)


factory = build_factory()
receipts = ReceiptService(factory.blob_store(), factory.queue("orders"))


def test_receipt_is_stored_and_announced() -> None:
    local = LocalFactory()
    ReceiptService(local.blob_store(), local.queue("orders")).store("A-1", b"%PDF")
    assert local.blob_store().get("receipts/A-1.pdf") == b"%PDF"
    assert local.queue("orders").receive() == "receipts/A-1.pdf"
```

```typescript
export function buildFactory(env = process.env.APP_ENV ?? "local"): CloudFactory {
  if (env === "local") return new LocalFactory();
  if (env === "staging" || env === "production") {
    return new AwsFactory(process.env.AWS_REGION!, process.env.BUCKET!, {
      orders: process.env.ORDERS_QUEUE_URL!,
    });
  }
  throw new Error(`unknown APP_ENV ${env}`);
}

export class ReceiptService {
  // Sees only interfaces, built from one family.
  constructor(private readonly blobs: BlobStore, private readonly queue: Queue) {}

  async store(orderId: string, pdf: Uint8Array): Promise<void> {
    const key = `receipts/${orderId}.pdf`;
    await this.blobs.put(key, pdf);
    await this.queue.send(key);
  }
}

const factory = buildFactory();
export const receipts = new ReceiptService(factory.blobStore(), factory.queue("orders"));

test("receipt is stored and announced", async () => {
  const local = new LocalFactory();
  await new ReceiptService(local.blobStore(), local.queue("orders")).store("A-1", new Uint8Array([37]));
  expect(await local.blobStore().get("receipts/A-1.pdf")).toEqual(new Uint8Array([37]));
  expect(await local.queue("orders").receive()).toBe("receipts/A-1.pdf");
});
```

> **Tip**
>
> In Python and TypeScript, a "family" doesn't have to be a class hierarchy. **A module that exports matching constructors is an abstract factory**: `import storage.local as cloud` versus `import storage.aws as cloud`, where both modules define `blob_store()`, `queue()` and `secrets()`. Use classes when a factory needs its own state, like a shared session, a region or a cache of queues, as both factories above do.

<a id="9-builder"></a>

## 9. Builder

- **GoF intent** `same steps, different representations` <!-- ok -->
- **Everyday use** `readable, validated construction` <!-- good -->
- **Test data builders** `defaults plus overrides` <!-- great -->
- **The Director** `optional: owns the step order` <!-- ok -->

The crash course used Builder for its everyday job: building a complex object step by step and validating it once in `build()`. The original GoF intent was broader: *separate the construction of a complex object from its representation, so that the same construction process can create different representations.* The book's example was a document converter. It reads a rich-text file once, and calls the same steps (`convert_paragraph`, `convert_font_change`) on whichever builder it's given: plain text, TeX, or a widget tree. The object that knows the *order of steps* is the **Director**. The objects that know how to *produce one representation* are the **Builders**. Change the builder and the same document comes out in a different format.

```text
 ReportDirector  ── uses ─▶  «interface» ReportBuilder  ◁┄┄ MarkdownBuilder → str
  build(data):                + title(t)                 ◁┄┄ HtmlBuilder     → str (escaped)
    title → section            + section(h)
    → table → note             + table(rows)
                               + note(t)
                               + result()
```

> **Interactive animation:** `builder-steps` — rendered by the page script in the HTML version.

**GoF Builder — one director, two representations**

```python
import html
from typing import Protocol


class ReportBuilder(Protocol):
    def title(self, text: str) -> None: ...
    def section(self, heading: str) -> None: ...
    def table(self, rows: list[dict]) -> None: ...
    def note(self, text: str) -> None: ...
    def result(self) -> str: ...


class MarkdownBuilder:
    def __init__(self) -> None:
        self._parts: list[str] = []

    def title(self, text: str) -> None:
        self._parts.append(f"# {text}\n")

    def section(self, heading: str) -> None:
        self._parts.append(f"\n## {heading}\n")

    def table(self, rows: list[dict]) -> None:
        cols = list(rows[0])
        self._parts.append("| " + " | ".join(cols) + " |")
        self._parts.append("| " + " | ".join("---" for _ in cols) + " |")
        self._parts += ["| " + " | ".join(str(r[c]) for c in cols) + " |" for r in rows]

    def note(self, text: str) -> None:
        self._parts.append(f"\n> {text}")

    def result(self) -> str:
        return "\n".join(self._parts)


class HtmlBuilder:
    def __init__(self) -> None:
        self._parts: list[str] = []

    def title(self, text: str) -> None:
        self._parts.append(f"<h1>{html.escape(text)}</h1>")  # data is untrusted: always escape

    def section(self, heading: str) -> None:
        self._parts.append(f"<h2>{html.escape(heading)}</h2>")

    def table(self, rows: list[dict]) -> None:
        cols = list(rows[0])
        head = "".join(f"<th>{html.escape(c)}</th>" for c in cols)
        body = "".join("<tr>" + "".join(f"<td>{html.escape(str(r[c]))}</td>" for c in cols) + "</tr>" for r in rows)
        self._parts.append(f"<table><tr>{head}</tr>{body}</table>")

    def note(self, text: str) -> None:
        self._parts.append(f"<p class='note'>{html.escape(text)}</p>")

    def result(self) -> str:
        return "\n".join(self._parts)


class ReportDirector:
    """Knows the order of the steps; knows nothing about any format."""

    def build(self, builder: ReportBuilder, sales: list[dict]) -> str:
        builder.title("Weekly sales")
        builder.section("By region")
        builder.table(sales)
        builder.note(f"{len(sales)} regions reported")
        return builder.result()


sales = [{"region": "EU", "total": 1200}, {"region": "US <West>", "total": 900}]
print(ReportDirector().build(MarkdownBuilder(), sales))
print(ReportDirector().build(HtmlBuilder(), sales))  # "<West>" comes out escaped
```

```typescript
interface ReportBuilder {
  title(text: string): void;
  section(heading: string): void;
  table(rows: Record<string, unknown>[]): void;
  note(text: string): void;
  result(): string;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

class MarkdownBuilder implements ReportBuilder {
  private readonly parts: string[] = [];
  title(text: string) {
    this.parts.push(`# ${text}\n`);
  }
  section(heading: string) {
    this.parts.push(`\n## ${heading}\n`);
  }
  table(rows: Record<string, unknown>[]) {
    const cols = Object.keys(rows[0]);
    this.parts.push(`| ${cols.join(" | ")} |`, `| ${cols.map(() => "---").join(" | ")} |`);
    for (const r of rows) this.parts.push(`| ${cols.map((c) => String(r[c])).join(" | ")} |`);
  }
  note(text: string) {
    this.parts.push(`\n> ${text}`);
  }
  result() {
    return this.parts.join("\n");
  }
}

class HtmlBuilder implements ReportBuilder {
  private readonly parts: string[] = [];
  title(text: string) {
    this.parts.push(`<h1>${escapeHtml(text)}</h1>`); // data is untrusted: always escape
  }
  section(heading: string) {
    this.parts.push(`<h2>${escapeHtml(heading)}</h2>`);
  }
  table(rows: Record<string, unknown>[]) {
    const cols = Object.keys(rows[0]);
    const head = cols.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
    const body = rows.map((r) => `<tr>${cols.map((c) => `<td>${escapeHtml(String(r[c]))}</td>`).join("")}</tr>`).join("");
    this.parts.push(`<table><tr>${head}</tr>${body}</table>`);
  }
  note(text: string) {
    this.parts.push(`<p class="note">${escapeHtml(text)}</p>`);
  }
  result() {
    return this.parts.join("\n");
  }
}

class ReportDirector {
  // Knows the order of the steps; knows nothing about any format.
  build(builder: ReportBuilder, sales: Record<string, unknown>[]): string {
    builder.title("Weekly sales");
    builder.section("By region");
    builder.table(sales);
    builder.note(`${sales.length} regions reported`);
    return builder.result();
  }
}

const sales = [{ region: "EU", total: 1200 }, { region: "US <West>", total: 900 }];
console.log(new ReportDirector().build(new MarkdownBuilder(), sales));
console.log(new ReportDirector().build(new HtmlBuilder(), sales)); // "<West>" comes out escaped
```

- **Strength — one construction process, many outputs.** Adding a PDF report is one new builder. The director, and the order of the steps, are untouched.
- **Strength — construction reads like a specification.** Both GoF and fluent builders name each step, which is far easier to review than a long positional constructor.
- **Weakness — two objects where one might do.** A builder for a class with three fields is ceremony. Use keyword arguments or an options object.
- **Weakness — builders are easy to share by accident.** A mutable builder held in a shared variable leaks steps from one build into the next (crash course, section 4).

**Interview question**

*Tests in your codebase each build an `Order` with fifteen fields, and most tests care about only one or two of them. Write a test data builder that fixes this, and make it safe to reuse.*

This is the **test data builder** that Nat Pryce described, and it may be the most valuable use of Builder in a real codebase. The builder starts with *valid, boring defaults* for every field, so a test only states what it cares about: `an_order().with_status("shipped").build()`. That makes each test say *why* it exists. When `Order` gains a sixteenth field, only the builder's defaults change, not two hundred tests. The "safe to reuse" part matters. If each `with_` method returned `self` after mutating it, a shared base builder would leak changes between tests. So make every step return a **new builder** (copy-on-write). Python's `dataclasses.replace` and TypeScript's object spread make that a one-liner per step.

**Answer — an immutable test data builder**

```python
from dataclasses import dataclass, field, replace
from datetime import date
from decimal import Decimal


@dataclass(frozen=True)
class Line:
    sku: str
    qty: int
    price: Decimal


@dataclass(frozen=True)
class Order:
    id: str
    customer_id: str
    status: str
    placed_on: date
    lines: tuple[Line, ...]
    currency: str = "GBP"


@dataclass(frozen=True)
class OrderBuilder:
    _id: str = "order-1"
    _customer: str = "customer-1"
    _status: str = "pending"
    _placed_on: date = date(2026, 1, 15)
    _lines: tuple[Line, ...] = field(default_factory=lambda: (Line("SKU-1", 1, Decimal("10.00")),))

    # Every step returns a NEW builder, so a shared base can never be corrupted.
    def with_status(self, status: str) -> "OrderBuilder":
        return replace(self, _status=status)

    def for_customer(self, customer_id: str) -> "OrderBuilder":
        return replace(self, _customer=customer_id)

    def placed_on(self, day: date) -> "OrderBuilder":
        return replace(self, _placed_on=day)

    def with_line(self, sku: str, qty: int = 1, price: str = "10.00") -> "OrderBuilder":
        return replace(self, _lines=(*self._lines, Line(sku, qty, Decimal(price))))

    def build(self) -> Order:
        return Order(self._id, self._customer, self._status, self._placed_on, self._lines)


def an_order() -> OrderBuilder:
    return OrderBuilder()


base = an_order().for_customer("vip-7")
shipped = base.with_status("shipped").build()
pending = base.build()
assert pending.status == "pending"  # base was not mutated by the line above
```

```typescript
interface Line {
  readonly sku: string;
  readonly qty: number;
  readonly pricePence: number;
}

interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly status: string;
  readonly placedOn: string;
  readonly lines: readonly Line[];
  readonly currency: string;
}

class OrderBuilder {
  private constructor(private readonly fields: Order) {}

  static anOrder(): OrderBuilder {
    return new OrderBuilder({
      id: "order-1",
      customerId: "customer-1",
      status: "pending",
      placedOn: "2026-01-15",
      lines: [{ sku: "SKU-1", qty: 1, pricePence: 1000 }],
      currency: "GBP",
    });
  }

  // Every step returns a NEW builder, so a shared base can never be corrupted.
  withStatus(status: string): OrderBuilder {
    return new OrderBuilder({ ...this.fields, status });
  }

  forCustomer(customerId: string): OrderBuilder {
    return new OrderBuilder({ ...this.fields, customerId });
  }

  placedOn(placedOn: string): OrderBuilder {
    return new OrderBuilder({ ...this.fields, placedOn });
  }

  withLine(sku: string, qty = 1, pricePence = 1000): OrderBuilder {
    return new OrderBuilder({ ...this.fields, lines: [...this.fields.lines, { sku, qty, pricePence }] });
  }

  build(): Order {
    return Object.freeze({ ...this.fields, lines: Object.freeze([...this.fields.lines]) });
  }
}

const base = OrderBuilder.anOrder().forCustomer("vip-7");
const shipped = base.withStatus("shipped").build();
const pending = base.build();
console.assert(pending.status === "pending"); // base was not mutated by the line above
```

> **Tip**
>
> For small immutable objects you often don't need a builder class at all. **`dataclasses.replace(obj, status="shipped")`** in Python and **`{ ...obj, status: "shipped" }`** in TypeScript give you "copy with changes" for free, and that covers most of what test builders do. Keep a builder class for when you need *defaults that live in one place*, *validation across several fields*, or *domain-named steps* like `.with_line()` that do more than set one field.

<a id="10-prototype"></a>

## 10. Prototype

- **New objects come from** `copying an existing one` <!-- ok -->
- **A shallow copy shares** `every nested object` <!-- bad -->
- **Python** `copy.copy · copy.deepcopy` <!-- ok -->
- **JavaScript** `structuredClone · Object.create` <!-- ok -->

**Intent:** *specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.* Sometimes building an object from scratch is expensive or awkward. It might be loaded from a file, assembled from many settings, or tuned by hand. And what you really want is "one like that, with these changes". Prototype keeps a few fully configured instances, the *prototypes*, and creates new objects by **cloning** one and adjusting the copy. It's also a way to create objects without naming their class: whoever holds a prototype can produce more of whatever it is.

JavaScript is built on a language-level version of this idea. Every object has a *prototype* that it delegates missing properties to, and `Object.create(proto)` makes a new object whose prototype is `proto`. That's delegation, not copying, but it has the same trap as a shallow copy, as you'll see below. The hard part of the pattern is never the cloning call. It's deciding **how deep the copy goes**.

```text
shallow copy                                deep copy
  template ──▶ { features }  ◀── clone        template ──▶ { features }
           ──▶ [ regions ]   ◀──                       ──▶ [ regions ]
  one new outer object; nested objects       clone    ──▶ { features }'  (new)
  are SHARED with the original                         ──▶ [ regions ]'   (new)
```

> **Interactive animation:** `prototype-copy` — rendered by the page script in the HTML version.

**Prototype — a registry of configured templates with a controlled deep copy**

```python
import copy
from dataclasses import dataclass, field
from typing import ClassVar


class TemplateCache:
    """Expensive to build, read-only once built: safe to share between clones."""

    def __init__(self, names: list[str]) -> None:
        self.templates = {n: f"<template {n}>" for n in names}


@dataclass
class TenantConfig:
    name: str
    features: dict[str, bool] = field(default_factory=dict)
    limits: dict[str, int] = field(default_factory=dict)
    regions: list[str] = field(default_factory=list)
    templates: TemplateCache | None = None

    _shared: ClassVar[frozenset[str]] = frozenset({"templates"})

    def __deepcopy__(self, memo: dict) -> "TenantConfig":
        cls = type(self)
        clone = cls.__new__(cls)
        memo[id(self)] = clone  # register first, so cycles resolve to this copy
        for name, value in vars(self).items():
            setattr(clone, name, value if name in self._shared else copy.deepcopy(value, memo))
        return clone


class PrototypeRegistry:
    def __init__(self) -> None:
        self._prototypes: dict[str, TenantConfig] = {}

    def register(self, key: str, prototype: TenantConfig) -> None:
        self._prototypes[key] = prototype

    def create(self, key: str, **overrides) -> TenantConfig:
        clone = copy.deepcopy(self._prototypes[key])
        for attr, value in overrides.items():
            setattr(clone, attr, value)
        return clone


shared = TemplateCache(["welcome", "invoice", "reset-password"])
registry = PrototypeRegistry()
registry.register("starter", TenantConfig("starter", {"sso": False, "beta": False}, {"seats": 5}, ["eu-west-1"], shared))
registry.register("enterprise", TenantConfig("enterprise", {"sso": True, "beta": False}, {"seats": 500}, ["eu-west-1", "us-east-1"], shared))

acme = registry.create("enterprise", name="acme")
acme.features["beta"] = True                                     # changes acme only
assert registry.create("enterprise").features["beta"] is False   # the prototype is untouched
assert acme.templates is shared                                  # the expensive part is shared on purpose
```

```typescript
class TemplateCache {
  // Expensive to build, read-only once built: safe to share between clones.
  readonly templates: ReadonlyMap<string, string>;
  constructor(names: string[]) {
    this.templates = new Map(names.map((n) => [n, `<template ${n}>`]));
  }
}

class TenantConfig {
  constructor(
    public name: string,
    public features: Record<string, boolean>,
    public limits: Record<string, number>,
    public regions: string[],
    readonly templates: TemplateCache, // shared on purpose
  ) {}

  // structuredClone(this) would return a plain object and lose the class and its
  // methods, so clone deliberately: deep-copy data, share the read-only cache.
  clone(): TenantConfig {
    return new TenantConfig(
      this.name,
      structuredClone(this.features),
      structuredClone(this.limits),
      [...this.regions],
      this.templates,
    );
  }
}

class PrototypeRegistry {
  private readonly prototypes = new Map<string, TenantConfig>();

  register(key: string, prototype: TenantConfig): void {
    this.prototypes.set(key, prototype);
  }

  create(key: string, overrides: Partial<Pick<TenantConfig, "name">> = {}): TenantConfig {
    const prototype = this.prototypes.get(key);
    if (!prototype) throw new Error(`no prototype "${key}"`);
    return Object.assign(prototype.clone(), overrides);
  }
}

const shared = new TemplateCache(["welcome", "invoice", "reset-password"]);
const registry = new PrototypeRegistry();
registry.register("starter", new TenantConfig("starter", { sso: false, beta: false }, { seats: 5 }, ["eu-west-1"], shared));
registry.register("enterprise", new TenantConfig("enterprise", { sso: true, beta: false }, { seats: 500 }, ["eu-west-1", "us-east-1"], shared));

const acme = registry.create("enterprise", { name: "acme" });
acme.features.beta = true; // changes acme only
console.assert(registry.create("enterprise").features.beta === false); // the prototype is untouched
console.assert(acme.templates === shared); // the expensive part is shared on purpose
```

- **Strength — configured objects are cheap to make.** Ten tenant tiers, game units or document templates, each built once and then cloned as often as needed.
- **Strength — creation without naming the class.** Code holding a prototype can produce more of it, even if it was loaded from config or a plugin.
- **Weakness — copy depth is a design decision.** Every field has to be classified as copied or shared, and an unclassified field is a bug waiting to happen.
- **Weakness — deep copies can be slow and surprising.** `deepcopy` walks the entire object graph, including things you never meant to copy.

**Interview question**

*Each tenant's config is created by copying a template config. After a support engineer turns on a beta flag for one tenant, other tenants start seeing the beta feature too. What happened, and what are two fixes?*

The copy was **shallow**. `copy.copy(template)`, `dict(template)`, `{ ...template }` and `Object.assign({}, template)` all create a new *outer* object, but nested dicts and lists are still the *same objects* as the template's. Setting `tenant.features["beta"] = True` writes into the shared `features` dict, which changes the template and every tenant copied from it. The first fix is to **deep-copy** the mutable parts, with `copy.deepcopy` or `structuredClone`, or by copying each nested field yourself as `TenantConfig.clone()` does. The second fix, usually the better one, is to make the config **immutable**. When nothing can be changed in place, sharing is safe, copies are never needed, and "change a flag" becomes "create a new config with a new flags mapping".

**Answer — the bug, and both fixes**

```python
import copy
from dataclasses import dataclass, replace
from types import MappingProxyType

template = {"plan": "pro", "features": {"beta": False}}

# The bug: a shallow copy shares the nested dict.
tenant_a = copy.copy(template)
tenant_a["features"]["beta"] = True
assert template["features"]["beta"] is True  # every tenant now has beta

# Fix 1: deep-copy the mutable parts.
template = {"plan": "pro", "features": {"beta": False}}
tenant_b = copy.deepcopy(template)
tenant_b["features"]["beta"] = True
assert template["features"]["beta"] is False


# Fix 2: make the config immutable, so sharing is safe and copies are unnecessary.
@dataclass(frozen=True)
class Config:
    plan: str
    features: MappingProxyType  # a read-only view of a dict


base = Config("pro", MappingProxyType({"beta": False}))
tenant_c = replace(base, features=MappingProxyType({**base.features, "beta": True}))
assert base.features["beta"] is False and tenant_c.features["beta"] is True
```

```typescript
type Features = Record<string, boolean>;

let template = { plan: "pro", features: { beta: false } as Features };

// The bug: a shallow copy shares the nested object.
const tenantA = { ...template };
tenantA.features.beta = true;
console.assert(template.features.beta === true); // every tenant now has beta

// Fix 1: deep-copy the data.
template = { plan: "pro", features: { beta: false } };
const tenantB = structuredClone(template);
tenantB.features.beta = true;
console.assert(template.features.beta === false);

// Fix 2: make the config immutable, so sharing is safe and copies are unnecessary.
interface Config {
  readonly plan: string;
  readonly features: Readonly<Features>;
}

const base: Config = Object.freeze({ plan: "pro", features: Object.freeze({ beta: false }) });
const tenantC: Config = { ...base, features: { ...base.features, beta: true } };
console.assert(base.features.beta === false && tenantC.features.beta === true);
```

> **Warning**
>
> **Deep copy copies too much.** `copy.deepcopy` walks every reference, so a config holding a lock, a database connection or an open file fails with errors like `TypeError: cannot pickle '_thread.lock' object`, or worse, quietly duplicates a resource. JavaScript's `structuredClone` throws a `DataCloneError` on functions, and it returns plain objects for class instances, losing their methods. Decide per field what is copied and what is shared, and write that decision down in a `clone()` or `__deepcopy__` method, as above.

<a id="11-singleton"></a>

## 11. Singleton

- **Instances per process** `exactly one` <!-- ok -->
- **Python's built-in singleton** `the module` <!-- good -->
- **Thread-safe lazy creation needs** `a lock, checked twice` <!-- ok -->
- **The real cost** `hidden global state` <!-- bad -->

**Intent:** *ensure a class only has one instance, and provide a global point of access to it.* That sentence contains two separate promises, and they deserve separate verdicts. **One instance** is often a legitimate requirement: one connection pool, one in-memory cache, one loaded machine-learning model. **A global point of access** is the part that causes the damage. Every function that calls `Thing.instance()` has a dependency you can't see in its signature, can't swap in a test, and can't reason about locally. Section 12 shows how to keep the first promise without the second. This section covers how to implement Singleton correctly when you do need it, which mostly means being careful about **lazy creation** and **concurrency**.

> **Interactive animation:** `singleton-vs-di` (variant `singleton`) — rendered by the page script in the HTML version.

<a id="11-1-implementations"></a>

### Six ways to get one instance

| Technique | Language | Lazy? | Notes |
| --- | --- | --- | --- |
| Module-level object | Python, TS/JS | no, created on first import | The simplest and most idiomatic. Import caching guarantees one module object. |
| `instance()` class method | both | yes | Needs a lock for thread-safe lazy creation in Python. |
| `__new__` returning a cached instance | Python | yes | `__init__` still runs on every call, which surprises people. |
| Metaclass with an instance cache | Python | yes | Works for many classes at once, but it's heavy machinery for the job. |
| `@functools.cache` on a getter | Python | yes | Thread-safe cache, but the getter can run twice under a race. |
| Borg (shared `__dict__`) | Python | — | Many instances that share one state. Same globals problem, more confusing. |

The `functools.cache` row is worth a closer look. The Python documentation says the cache stays consistent under concurrent use, but *the wrapped function may be called more than once* if a second thread calls it before the first call has finished and been cached. For a function that opens a connection pool, "more than once" means two pools. When creation must happen exactly once, use an explicit lock.

**Singleton — thread-safe lazy creation, and the async version**

```python
import os
import threading
from typing import ClassVar


def load_settings() -> dict[str, str]:
    return {"region": os.environ.get("REGION", "eu-west-1")}


class Settings:
    _instance: ClassVar["Settings | None"] = None
    _lock: ClassVar[threading.Lock] = threading.Lock()

    def __init__(self, values: dict[str, str]) -> None:
        self.values = values

    @classmethod
    def instance(cls) -> "Settings":
        if cls._instance is None:  # fast path: no lock once created
            with cls._lock:
                if cls._instance is None:  # re-check: another thread may have won the race
                    cls._instance = cls(load_settings())
        return cls._instance

    @classmethod
    def reset_for_tests(cls) -> None:
        with cls._lock:
            cls._instance = None


# The idiomatic alternative: the module itself is the singleton.
# settings.py
#     values = load_settings()          # runs once, on first import
# anywhere.py
#     from settings import values
```

```typescript
function loadSettings(): Record<string, string> {
  return { region: process.env.REGION ?? "eu-west-1" };
}

export class Settings {
  private static instance?: Settings;

  private constructor(readonly values: Readonly<Record<string, string>>) {}

  static get(): Settings {
    // JavaScript runs one thread per isolate, so synchronous creation can't race.
    return (Settings.instance ??= new Settings(Object.freeze(loadSettings())));
  }

  static resetForTests(): void {
    Settings.instance = undefined;
  }
}

// The idiomatic alternative: the module itself is the singleton.
// settings.ts
//   export const values = Object.freeze(loadSettings());   // runs once, on first import
```

- **Strength — one instance of something expensive.** Pools, caches and loaded models really should exist once, and Singleton guarantees it.
- **Strength — lazy creation.** Nothing is built until the first caller asks, which keeps startup fast for programs that may never need it.
- **Weakness — hidden dependencies.** A function's signature no longer tells you what it uses, so neither readers nor tests can see it.
- **Weakness — shared mutable state across tests.** State leaks from one test to the next, and the suite can't safely run in parallel. Hence the `reset_for_tests` methods every singleton eventually grows.

**Interview question**

*Implement a lazily initialised singleton database client in an async TypeScript service, where the first request triggers the connection. What race condition do most implementations have, and how do you fix it?*

The naive version checks `if (!client) client = await connect()`. JavaScript has no threads here, but it does have **interleaving at every `await`**. Two requests arrive together. Both see `client` as undefined, both call `connect()`, and both `await`. Now there are two connection pools, and one of them is never closed. The fix is to **cache the promise, not the result**. The first caller stores the pending `connect()` promise, and every later caller, including ones that arrive while it's still connecting, awaits *the same promise*. If the connection attempt fails, clear the cached promise so the next caller can retry, instead of every future caller inheriting the same rejection forever. Python's `asyncio` has the same race, and the same fix: share one task, or hold an `asyncio.Lock` while creating.

**Answer — cache the in-flight creation**

```python
import asyncio


class Database:
    @classmethod
    async def connect(cls, url: str) -> "Database":
        await asyncio.sleep(0.1)  # stands in for the real handshake
        return cls()


_db_task: asyncio.Task | None = None


async def get_db(url: str) -> Database:
    global _db_task
    if _db_task is None:
        _db_task = asyncio.ensure_future(Database.connect(url))  # share the in-flight attempt
    try:
        return await _db_task
    except Exception:
        _db_task = None  # a failed attempt must not be cached forever
        raise


async def main() -> None:
    a, b = await asyncio.gather(get_db("postgres://..."), get_db("postgres://..."))
    assert a is b  # both callers got the one connection


asyncio.run(main())
```

```typescript
class Database {
  static async connect(url: string): Promise<Database> {
    await new Promise((resolve) => setTimeout(resolve, 100)); // stands in for the real handshake
    return new Database();
  }
}

let dbPromise: Promise<Database> | undefined;

export function getDb(url: string): Promise<Database> {
  // Cache the promise, not the result: callers that arrive mid-connect share it.
  dbPromise ??= Database.connect(url).catch((err) => {
    dbPromise = undefined; // a failed attempt must not be cached forever
    throw err;
  });
  return dbPromise;
}

const [a, b] = await Promise.all([getDb("postgres://..."), getDb("postgres://...")]);
console.assert(a === b); // both callers got the one connection
```

> **Warning**
>
> **"One instance" really means "one per module object", and a program can load the same module twice.** In Node, two versions of a package in `node_modules`, or a package bundled twice, each get their own module-level singleton, so "the" event bus or registry quietly splits in two. In Python, running `python app/config.py` loads that file as `__main__`, and a later `import app.config` loads it *again* under its real name. The same thing happens if the file is reachable as both `config` and `app.config` through `sys.path`. If identity matters, put the singleton in a module that is never run as a script, and check for duplicate packages with `npm ls <pkg>`.

<a id="12-dependency-injection"></a>

## 12. Dependency Injection & Inversion of Control

- **Forms of injection** `constructor · setter · parameter` <!-- ok -->
- **The best default** `constructor injection` <!-- great -->
- **Where objects get built** `one composition root` <!-- great -->
- **The look-alike anti-pattern** `service locator` <!-- bad -->

**Inversion of Control** (IoC) is the general idea that a framework calls *your* code, rather than your code calling the framework. It's often summarised as the *Hollywood Principle*: "don't call us, we'll call you". Template Method, Observer and every web framework's route handlers are examples. **Dependency Injection** (DI) is IoC applied to one specific question: *how does an object get its collaborators?* Martin Fowler gave the technique its name in a 2004 article. Without DI, the object creates or looks up its collaborators itself, with `Database.get_instance()` or `new StripeClient()`. With DI, the collaborators are created somewhere else and *handed in*. The object only declares what it needs.

There are three forms. **Constructor injection** passes collaborators as constructor parameters. It's the right default, because the object is complete and valid from the moment it exists, and its dependencies are listed in one obvious place. **Setter injection** assigns collaborators after construction. Use it only for optional collaborators, because the object is incomplete until someone remembers to call the setter. **Parameter injection** passes a collaborator to a single method call, such as `render(template, clock=clock)`. It fits when only one method needs the collaborator.

<a id="12-1-composition-root"></a>

### The composition root, and containers

Every application with DI has a **composition root**: one place, as close to the program's entry point as possible, where the concrete objects are created and wired together. That's the only place that names concrete classes. In a small or medium application, writing the wiring by hand, known as *pure DI*, is perfectly good. It's ordinary code that the type checker can verify. A **DI container** automates the wiring. You register how to build each type and how long each instance should live, and the container resolves whole object graphs on demand. FastAPI's `Depends`, NestJS providers, InversifyJS and .NET's built-in container are all examples.

Containers bring one idea that's genuinely new: **lifetimes**. A *singleton* is created once per application. A *scoped* instance is created once per scope, typically one HTTP request, which is the right lifetime for a database session or unit of work. A *transient* instance is created fresh every time it's requested. Lifetimes are where the classic container bug lives, as the interview question below shows.

> **Interactive animation:** `di-container` — rendered by the page script in the HTML version.

**A dependency injection container from scratch**

```python
import time
from enum import Enum
from typing import Any, Callable, TypeVar

T = TypeVar("T")


class Lifetime(Enum):
    SINGLETON = "singleton"
    SCOPED = "scoped"
    TRANSIENT = "transient"


class Container:
    def __init__(self) -> None:
        self.providers: dict[type, tuple[Callable[["Scope"], Any], Lifetime]] = {}
        self.singletons: dict[type, Any] = {}

    def register(self, token: type[T], factory: Callable[["Scope"], T], lifetime: Lifetime) -> None:
        self.providers[token] = (factory, lifetime)

    def scope(self) -> "Scope":
        return Scope(self)


class Scope:
    """One per request. Scoped instances live here; singletons live on the container."""

    def __init__(self, container: Container) -> None:
        self._container = container
        self._scoped: dict[type, Any] = {}
        self._resolving: list[type] = []  # the current chain, for cycle and lifetime checks

    def resolve(self, token: type[T]) -> T:
        if token not in self._container.providers:
            raise LookupError(f"nothing registered for {token.__name__}")
        if token in self._resolving:
            chain = " -> ".join(t.__name__ for t in [*self._resolving, token])
            raise RuntimeError(f"dependency cycle: {chain}")
        factory, lifetime = self._container.providers[token]
        if lifetime is Lifetime.SCOPED:
            for parent in self._resolving:
                if self._container.providers[parent][1] is Lifetime.SINGLETON:
                    raise RuntimeError(f"captive dependency: singleton {parent.__name__} "
                                       f"would keep scoped {token.__name__} alive forever")
        cache = {Lifetime.SINGLETON: self._container.singletons, Lifetime.SCOPED: self._scoped}.get(lifetime)
        if cache is not None and token in cache:
            return cache[token]
        self._resolving.append(token)
        try:
            instance = factory(self)
        finally:
            self._resolving.pop()
        if cache is not None:
            cache[token] = instance
        return instance


# --- wiring an application -----------------------------------------------------
class Database:
    def __init__(self, url: str) -> None:
        self.url = url


class Clock:
    def now(self) -> float:
        return time.time()


class UnitOfWork:
    def __init__(self, db: Database) -> None:
        self.db = db


class OrderService:
    def __init__(self, uow: UnitOfWork, clock: Clock) -> None:
        self.uow, self.clock = uow, clock


container = Container()
container.register(Database, lambda s: Database("postgres://orders"), Lifetime.SINGLETON)
container.register(Clock, lambda s: Clock(), Lifetime.SINGLETON)
container.register(UnitOfWork, lambda s: UnitOfWork(s.resolve(Database)), Lifetime.SCOPED)
container.register(OrderService, lambda s: OrderService(s.resolve(UnitOfWork), s.resolve(Clock)), Lifetime.TRANSIENT)

request_1, request_2 = container.scope(), container.scope()
a, b = request_1.resolve(OrderService), request_1.resolve(OrderService)
c = request_2.resolve(OrderService)
assert a is not b                 # transient: new every time
assert a.uow is b.uow             # scoped: shared within one request
assert a.uow is not c.uow         # ...but not across requests
assert a.uow.db is c.uow.db       # singleton: shared by everyone
```

```typescript
type Ctor<T> = abstract new (...args: never[]) => T;
type Lifetime = "singleton" | "scoped" | "transient";
type Factory<T> = (scope: Scope) => T;

export class Container {
  readonly providers = new Map<Ctor<unknown>, { factory: Factory<unknown>; lifetime: Lifetime }>();
  readonly singletons = new Map<Ctor<unknown>, unknown>();

  register<T>(token: Ctor<T>, factory: Factory<T>, lifetime: Lifetime): this {
    this.providers.set(token, { factory, lifetime });
    return this;
  }

  scope(): Scope {
    return new Scope(this);
  }
}

export class Scope {
  // One per request. Scoped instances live here; singletons live on the container.
  private readonly scoped = new Map<Ctor<unknown>, unknown>();
  private readonly resolving: Ctor<unknown>[] = []; // the current chain, for cycle and lifetime checks

  constructor(private readonly container: Container) {}

  resolve<T>(token: Ctor<T>): T {
    const provider = this.container.providers.get(token);
    if (!provider) throw new Error(`nothing registered for ${token.name}`);
    if (this.resolving.includes(token)) {
      throw new Error(`dependency cycle: ${[...this.resolving, token].map((t) => t.name).join(" -> ")}`);
    }
    if (provider.lifetime === "scoped") {
      const owner = this.resolving.find((t) => this.container.providers.get(t)?.lifetime === "singleton");
      if (owner) throw new Error(`captive dependency: singleton ${owner.name} would keep scoped ${token.name} alive forever`);
    }
    const cache =
      provider.lifetime === "singleton" ? this.container.singletons : provider.lifetime === "scoped" ? this.scoped : undefined;
    if (cache?.has(token)) return cache.get(token) as T;
    this.resolving.push(token);
    try {
      const instance = provider.factory(this) as T;
      cache?.set(token, instance);
      return instance;
    } finally {
      this.resolving.pop();
    }
  }
}

// --- wiring an application ---------------------------------------------------
class Database {
  constructor(readonly url: string) {}
}
class Clock {
  now(): number {
    return Date.now();
  }
}
class UnitOfWork {
  constructor(readonly db: Database) {}
}
class OrderService {
  constructor(readonly uow: UnitOfWork, readonly clock: Clock) {}
}

const container = new Container()
  .register(Database, () => new Database("postgres://orders"), "singleton")
  .register(Clock, () => new Clock(), "singleton")
  .register(UnitOfWork, (s) => new UnitOfWork(s.resolve(Database)), "scoped")
  .register(OrderService, (s) => new OrderService(s.resolve(UnitOfWork), s.resolve(Clock)), "transient");

const request1 = container.scope();
const request2 = container.scope();
const [a, b, c] = [request1.resolve(OrderService), request1.resolve(OrderService), request2.resolve(OrderService)];
console.assert(a !== b); // transient: new every time
console.assert(a.uow === b.uow); // scoped: shared within one request
console.assert(a.uow !== c.uow); // ...but not across requests
console.assert(a.uow.db === c.uow.db); // singleton: shared by everyone
```

- **Strength — dependencies are explicit and swappable.** Every collaborator shows up in a signature, so tests pass fakes and nothing needs patching.
- **Strength — lifetimes are managed in one place.** "One per request" and "one per app" become configuration rather than scattered caching code.
- **Weakness — containers add magic.** Auto-wiring by type or decorator moves wiring errors from compile time to startup, and makes "where does this come from?" harder to answer.
- **Weakness — DI can't fix a design that needs too many collaborators.** It only makes them visible. A constructor with nine parameters is a class with too many jobs.

**Interview question**

*What is a captive dependency, and how would a container detect it?*

A **captive dependency** is a longer-lived object holding on to a shorter-lived one. The classic case is a *singleton* that receives a *scoped* object, such as a per-request database session, in its constructor. The singleton is created once, during the first request, so it captures *that request's* session and keeps it for the life of the process. Every later request then talks through a session that belongs to a finished request. That leads to stale data, "session is closed" errors, or, worst of all, data from one user's transaction leaking into another's. A container can detect it while it resolves the graph. It keeps the chain of types currently being built, and if a scoped type is requested while any singleton is in that chain, it fails at startup, as the `resolve` method above does. The fix is to make the outer object scoped too, or to have the singleton depend on a **factory** and open a fresh scoped object per call.

**Answer — the failure, and the factory fix**

```python
from typing import Callable


class PricingCache:  # wrong: a singleton that holds a request's unit of work
    def __init__(self, uow: UnitOfWork) -> None:
        self.uow = uow


container.register(PricingCache, lambda s: PricingCache(s.resolve(UnitOfWork)), Lifetime.SINGLETON)
try:
    container.scope().resolve(PricingCache)
except RuntimeError as err:
    print(err)  # captive dependency: singleton PricingCache would keep scoped UnitOfWork alive forever


class SafePricingCache:  # right: depends on a factory and opens a fresh unit of work per call
    def __init__(self, new_uow: Callable[[], UnitOfWork]) -> None:
        self._new_uow = new_uow
        self._prices: dict[str, int] = {}

    def price(self, sku: str) -> int:
        if sku not in self._prices:
            uow = self._new_uow()  # short-lived, never stored
            self._prices[sku] = len(uow.db.url) + len(sku)  # stands in for a real query
        return self._prices[sku]


container.register(
    SafePricingCache,
    lambda s: SafePricingCache(lambda: container.scope().resolve(UnitOfWork)),
    Lifetime.SINGLETON,
)
print(container.scope().resolve(SafePricingCache).price("A-17"))
```

```typescript
class PricingCache {
  // Wrong: a singleton that holds a request's unit of work.
  constructor(readonly uow: UnitOfWork) {}
}

container.register(PricingCache, (s) => new PricingCache(s.resolve(UnitOfWork)), "singleton");
try {
  container.scope().resolve(PricingCache);
} catch (err) {
  console.log((err as Error).message); // captive dependency: singleton PricingCache would keep scoped UnitOfWork alive forever
}

class SafePricingCache {
  // Right: depends on a factory and opens a fresh unit of work per call.
  private readonly prices = new Map<string, number>();

  constructor(private readonly newUow: () => UnitOfWork) {}

  price(sku: string): number {
    if (!this.prices.has(sku)) {
      const uow = this.newUow(); // short-lived, never stored
      this.prices.set(sku, uow.db.url.length + sku.length); // stands in for a real query
    }
    return this.prices.get(sku)!;
  }
}

container.register(SafePricingCache, () => new SafePricingCache(() => container.scope().resolve(UnitOfWork)), "singleton");
console.log(container.scope().resolve(SafePricingCache).price("A-17"));
```

> **Warning**
>
> **A service locator is a singleton with better marketing.** `ServiceLocator.get(OrderRepository)` called from inside a class *looks* like DI, because it uses a container. But the dependency is still hidden inside method bodies rather than declared in the constructor, so you're back to everything section 11 warned about. Mark Seemann's rule of thumb: the container should be referenced **only from the composition root**. If application code asks the container for things, it's a locator.

<a id="unit-3"></a>

## Unit 3 — Structural Patterns

Seven patterns about how objects are assembled into larger structures: wrapping one object to change its interface or add behaviour, bridging two hierarchies, building trees, and sharing what doesn't need to be copied.

<a id="13-adapter"></a>

## 13. Adapter

- **Object adapter** `holds the adaptee` <!-- great -->
- **Class adapter** `inherits from the adaptee` <!-- ok -->
- **Translates** `calls · values · errors · units` <!-- good -->
- **At system scale** `anti-corruption layer` <!-- ok -->

**Intent:** *convert the interface of a class into another interface clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.* There are three roles. The **Target** is the interface your code already uses. The **Adaptee** is the existing class with the wrong shape, often a vendor SDK or legacy module. The **Adapter** implements the Target by calling the Adaptee. The crash course covered the everyday version. This section covers the two structural forms, adapting a whole *style* of API rather than a single class, and the system-scale version.

An **object adapter** holds an instance of the adaptee and delegates to it. It works in every language, can adapt any subclass of the adaptee, and is the default choice. A **class adapter** *inherits* from both the target and the adaptee, using multiple inheritance. It avoids one level of indirection and can override adaptee behaviour, but it ties the adapter to one concrete adaptee class, and TypeScript can't express it at all. At the scale of whole systems, Eric Evans's *Domain-Driven Design* describes an **anti-corruption layer**: a set of adapters and translators around a legacy system or a partner's API, so its model, names and quirks never leak into yours.

```text
  OrderService ──▶ «interface» PaymentGateway        (Target: our names, our units, our errors)
                        △
                        ┆ implements
                 LegacyPayAdapter ── holds ──▶ LegacyPayClient   (Adaptee: dollars, status strings)
```

> **Interactive animation:** `adapter-facade` (variant `adapter`) — rendered by the page script in the HTML version.

**Adapter — object and class forms, translating units and errors**

```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


# --- the Target: our interface, our units (integer cents), our errors ----------
class CardDeclined(Exception):
    pass


@dataclass(frozen=True)
class Charge:
    reference: str
    amount_cents: int


class PaymentGateway(Protocol):
    def charge(self, amount_cents: int, currency: str) -> Charge: ...


# --- the Adaptee: a legacy client with a different shape ------------------------
class LegacyPayClient:
    def make_payment(self, amount: float, curr: str) -> dict:
        """Takes dollars as a float and a lower-case currency; returns a status dict."""
        if amount > 10_000:
            return {"status": "DECLINED", "why": "limit"}
        return {"status": "OK", "ref": f"LP-{int(amount * 100)}"}


# --- object adapter: holds the adaptee (the default choice) --------------------
class LegacyPayAdapter:
    def __init__(self, client: LegacyPayClient) -> None:
        self._client = client

    def charge(self, amount_cents: int, currency: str) -> Charge:
        dollars = Decimal(amount_cents) / 100  # units: cents -> dollars, exactly
        result = self._client.make_payment(float(dollars), currency.lower())
        if result["status"] != "OK":  # errors: status strings -> our exception
            raise CardDeclined(result.get("why", "unknown"))
        return Charge(reference=result["ref"], amount_cents=amount_cents)


# --- class adapter: inherits from the adaptee (Python only) --------------------
class LegacyPayClassAdapter(LegacyPayClient):
    def charge(self, amount_cents: int, currency: str) -> Charge:
        result = self.make_payment(float(Decimal(amount_cents) / 100), currency.lower())
        if result["status"] != "OK":
            raise CardDeclined(result.get("why", "unknown"))
        return Charge(result["ref"], amount_cents)


gateway: PaymentGateway = LegacyPayAdapter(LegacyPayClient())
print(gateway.charge(4_250, "USD"))  # Charge(reference='LP-4250', amount_cents=4250)
```

```typescript
// --- the Target: our interface, our units (integer cents), our errors --------
export class CardDeclined extends Error {}

export interface Charge {
  readonly reference: string;
  readonly amountCents: number;
}

export interface PaymentGateway {
  charge(amountCents: number, currency: string): Promise<Charge>;
}

// --- the Adaptee: a legacy client with a different shape ----------------------
type LegacyResult = { status: "OK"; ref: string } | { status: "DECLINED"; why: string };

class LegacyPayClient {
  // Takes dollars as a number and a lower-case currency; returns a status object.
  async makePayment(amount: number, curr: string): Promise<LegacyResult> {
    return amount > 10_000 ? { status: "DECLINED", why: "limit" } : { status: "OK", ref: `LP-${Math.round(amount * 100)}` };
  }
}

// --- object adapter: the only form TypeScript supports -------------------------
export class LegacyPayAdapter implements PaymentGateway {
  constructor(private readonly client: LegacyPayClient) {}

  async charge(amountCents: number, currency: string): Promise<Charge> {
    const result = await this.client.makePayment(amountCents / 100, currency.toLowerCase()); // units
    if (result.status !== "OK") throw new CardDeclined(result.why); // errors
    return { reference: result.ref, amountCents };
  }
}

const gateway: PaymentGateway = new LegacyPayAdapter(new LegacyPayClient());
console.log(await gateway.charge(4250, "USD")); // { reference: 'LP-4250', amountCents: 4250 }
```

- **Strength — reuse without rewriting.** Existing, tested code joins a new design without being edited, even when it's code you can't edit.
- **Strength — one place for translation.** Units, names, error types and pagination quirks are converted once, at the boundary, with tests around them.
- **Weakness — adapters can hide a mismatch in meaning.** If the adaptee *can't* honour the target's contract (no idempotency, different rounding), the adapter only hides the problem until production.
- **Weakness — adapter chains.** Adapting an adapter of an adapter is a sign that two models should be reconciled, not wrapped again.

**Interview question**

*A legacy library offers `fetch_user(user_id, on_done, on_error)`, calling one of the two callbacks later, possibly from another thread. Adapt it so modern code can write `user = await fetch_user(user_id)`.*

This adapts an entire API *style*, callbacks, to another, awaitables. The structure is the same: implement the target shape by calling the adaptee. In TypeScript, wrap the call in a `new Promise` whose `resolve` and `reject` *are* the two callbacks. That's what Node's `util.promisify` does for its own callback convention. In Python, create a `Future` on the running event loop, and have the callbacks complete it. If the library calls back **from another thread**, the callbacks must hand the result to the loop with `loop.call_soon_threadsafe`, because asyncio objects aren't thread-safe. Also guard against libraries that call back *twice*: a future can only be completed once, so check `done()` first.

**Answer — adapting callbacks to async/await**

```python
import asyncio
import threading


def legacy_fetch_user(user_id: str, on_done, on_error) -> None:
    """The adaptee: calls back later, from its own worker thread."""
    def work() -> None:
        if user_id.startswith("u-"):
            on_done({"id": user_id, "name": "Ana"})
        else:
            on_error(ValueError(f"bad id {user_id!r}"))
    threading.Timer(0.05, work).start()


async def fetch_user(user_id: str) -> dict:
    """The adapter: the same operation, as a coroutine."""
    loop = asyncio.get_running_loop()
    future: asyncio.Future = loop.create_future()

    def settle(fn, value) -> None:  # runs on the loop's thread
        if not future.done():  # tolerate libraries that call back twice
            fn(value)

    legacy_fetch_user(
        user_id,
        lambda user: loop.call_soon_threadsafe(settle, future.set_result, user),
        lambda err: loop.call_soon_threadsafe(settle, future.set_exception, err),
    )
    return await future


print(asyncio.run(fetch_user("u-42")))  # {'id': 'u-42', 'name': 'Ana'}
```

```typescript
type Callback<T> = (value: T) => void;

// The adaptee: calls back later.
function legacyFetchUser(userId: string, onDone: Callback<{ id: string; name: string }>, onError: Callback<Error>): void {
  setTimeout(() => (userId.startsWith("u-") ? onDone({ id: userId, name: "Ana" }) : onError(new Error(`bad id ${userId}`))), 50);
}

// The adapter: the same operation, as a promise. A promise settles once, so
// libraries that call back twice are harmless.
export function fetchUser(userId: string): Promise<{ id: string; name: string }> {
  return new Promise((resolve, reject) => legacyFetchUser(userId, resolve, reject));
}

// The same idea, generalised: promisify any (args..., onDone, onError) function.
export function promisify2<A extends unknown[], T>(
  fn: (...args: [...A, Callback<T>, Callback<Error>]) => void,
): (...args: A) => Promise<T> {
  return (...args: A) => new Promise<T>((resolve, reject) => fn(...args, resolve, reject));
}

console.log(await fetchUser("u-42")); // { id: 'u-42', name: 'Ana' }
console.log(await promisify2(legacyFetchUser)("u-7")); // { id: 'u-7', name: 'Ana' }
```

> **Warning**
>
> **The dangerous adapter bugs are about meaning, not method names.** Dollars versus cents, seconds versus milliseconds, 0-based versus 1-based page numbers, local time versus UTC, "inclusive" versus "exclusive" end dates. The code compiles, the call succeeds, and the number is a hundred times wrong. Convert units explicitly, with exact types such as `Decimal` or integer cents rather than floats. Then test the adapter against the real adaptee with a *contract test* (section 36), not just against a mock.

<a id="14-bridge"></a>

## 14. Bridge

- **Separates** `abstraction from implementation` <!-- ok -->
- **Classes for M × N combinations** `M + N` <!-- great -->
- **When you apply it** `up front, by design` <!-- ok -->
- **Classic example** `database drivers` <!-- good -->

**Intent:** *decouple an abstraction from its implementation so that the two can vary independently.* The words are confusing, because here "abstraction" and "implementation" don't mean "interface" and "class". They mean **two separate hierarchies**. The *abstraction* hierarchy is what clients use, the high-level operations: an `Alert`, a `Digest`, a `Reminder`. The *implementor* hierarchy is the low-level platform those operations run on: `Email`, `SMS`, `Slack`. The abstraction **holds** an implementor (that reference is the "bridge") and builds its high-level behaviour out of the implementor's small set of **primitive operations**. Either side can grow without touching the other.

You've already met the problem Bridge solves: it's the class explosion from section 6. Bridge is that composition fix, applied deliberately, *up front*, when you can see two dimensions of change from the start. Python's database API (PEP 249) is a real-world bridge. Application code and ORMs are written against the API's connection and cursor operations, and each database *driver* implements those primitives for Postgres, MySQL or SQLite. Python's `logging` has the same shape: loggers decide *what* to record, and handlers decide *where* it goes.

```text
  Abstraction (what clients use)                Implementor (the platform)
  «abstract» Notification ── bridge ──▶ «interface» Channel
     + notify(recipient)                             + send(to, subject, body)
          △                                          + max_length
   Alert   Digest   Reminder                    Email   Sms   Slack   Push
   3 abstractions  +  4 implementors  =  7 classes covering 12 combinations
```

> **Interactive animation:** `bridge-matrix` — rendered by the page script in the HTML version.

**Bridge — notifications over channels**

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass


# --- implementor: the platform's primitive operations ---------------------------
class Channel(ABC):
    max_length: int = 10_000

    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> None: ...


class EmailChannel(Channel):
    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[email] to={to} subject={subject!r}\n{body}")


class SmsChannel(Channel):
    max_length = 160

    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[sms] to={to}: {body}")  # SMS has no subject line


class SlackChannel(Channel):
    max_length = 4_000

    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[slack] {to}: *{subject}* {body}")


# --- abstraction: high-level operations built from the primitives ---------------
class Notification(ABC):
    def __init__(self, channel: Channel) -> None:
        self.channel = channel  # the bridge

    def fit(self, text: str) -> str:
        limit = self.channel.max_length
        return text if len(text) <= limit else text[: limit - 1] + "…"

    @abstractmethod
    def notify(self, to: str) -> None: ...


@dataclass
class Incident:
    service: str
    summary: str


class Alert(Notification):
    def __init__(self, channel: Channel, incident: Incident) -> None:
        super().__init__(channel)
        self.incident = incident

    def notify(self, to: str) -> None:
        subject = f"ALERT {self.incident.service}"
        self.channel.send(to, subject, self.fit(f"{subject}: {self.incident.summary}"))


class Digest(Notification):
    def __init__(self, channel: Channel, items: list[str]) -> None:
        super().__init__(channel)
        self.items = items

    def notify(self, to: str) -> None:
        body = "\n".join(f"- {item}" for item in self.items)
        self.channel.send(to, f"Your digest ({len(self.items)} items)", self.fit(body))


Alert(SmsChannel(), Incident("payments", "p99 latency above 2s for 5 minutes")).notify("+44 7700 900123")
Digest(EmailChannel(), ["3 new orders", "1 refund"]).notify("ops@example.com")
```

```typescript
// --- implementor: the platform's primitive operations -------------------------
interface Channel {
  readonly maxLength: number;
  send(to: string, subject: string, body: string): void;
}

class EmailChannel implements Channel {
  readonly maxLength = 10_000;
  send(to: string, subject: string, body: string) {
    console.log(`[email] to=${to} subject=${JSON.stringify(subject)}\n${body}`);
  }
}

class SmsChannel implements Channel {
  readonly maxLength = 160;
  send(to: string, _subject: string, body: string) {
    console.log(`[sms] to=${to}: ${body}`); // SMS has no subject line
  }
}

class SlackChannel implements Channel {
  readonly maxLength = 4_000;
  send(to: string, subject: string, body: string) {
    console.log(`[slack] ${to}: *${subject}* ${body}`);
  }
}

// --- abstraction: high-level operations built from the primitives -------------
abstract class Notification {
  constructor(protected readonly channel: Channel) {} // the bridge

  protected fit(text: string): string {
    const limit = this.channel.maxLength;
    return text.length <= limit ? text : text.slice(0, limit - 1) + "…";
  }

  abstract notify(to: string): void;
}

class Alert extends Notification {
  constructor(channel: Channel, private readonly incident: { service: string; summary: string }) {
    super(channel);
  }
  notify(to: string) {
    const subject = `ALERT ${this.incident.service}`;
    this.channel.send(to, subject, this.fit(`${subject}: ${this.incident.summary}`));
  }
}

class Digest extends Notification {
  constructor(channel: Channel, private readonly items: string[]) {
    super(channel);
  }
  notify(to: string) {
    const body = this.items.map((item) => `- ${item}`).join("\n");
    this.channel.send(to, `Your digest (${this.items.length} items)`, this.fit(body));
  }
}

new Alert(new SmsChannel(), { service: "payments", summary: "p99 latency above 2s for 5 minutes" }).notify("+44 7700 900123");
new Digest(new EmailChannel(), ["3 new orders", "1 refund"]).notify("ops@example.com");
```

- **Strength — two axes grow independently.** A new channel works with every notification type at once, and a new notification type works on every channel.
- **Strength — the platform stays hidden.** Clients only see `Alert` and `Digest`. Which channel is used can be decided per user, at runtime.
- **Weakness — you need the primitives right.** If the implementor's operations are too narrow, every new abstraction needs a new primitive, which means editing every channel.
- **Weakness — it's up-front design.** If only one axis ever varies, the second hierarchy is ceremony.

**Interview question**

*Product asks for WhatsApp (1,000-character limit, no subject line) and for a new notification type, `Escalation`, which repeats an alert to a manager. How many classes change in the Bridge design, and how is Bridge different from Strategy and Adapter?*

**Zero existing classes change.** WhatsApp is one new implementor, and `Escalation` is one new abstraction that composes existing behaviour. Both work with everything already there, and that's the whole payoff: two additions instead of the seven a subclass-per-combination design would need. On the comparison: **Strategy** has the same shape, an object holding a swappable collaborator, but the collaborator is one *algorithm* inside one class. **Bridge** splits a whole design into *two hierarchies*, each expected to grow, and connects them through a set of primitives. **Adapter** is the after-the-fact cousin. You use it when two existing interfaces don't fit, whereas Bridge is designed in from the start so that they never have to be adapted.

**Answer — two additions, no edits**

```python
class WhatsAppChannel(Channel):  # one new implementor
    max_length = 1_000

    def send(self, to: str, subject: str, body: str) -> None:
        print(f"[whatsapp] {to}: {body}")  # no subject line, like SMS


class Escalation(Notification):  # one new abstraction, built from existing ones
    def __init__(self, channel: Channel, alert: Alert, manager: str) -> None:
        super().__init__(channel)
        self.alert, self.manager = alert, manager

    def notify(self, to: str) -> None:
        self.alert.notify(to)
        incident = self.alert.incident
        self.channel.send(self.manager, "Escalated", self.fit(f"Unacknowledged: {incident.service}: {incident.summary}"))


alert = Alert(WhatsAppChannel(), Incident("search", "index lag 15 minutes"))
Escalation(SlackChannel(), alert, manager="@oncall-lead").notify("+44 7700 900456")
```

```typescript
class WhatsAppChannel implements Channel {
  // One new implementor.
  readonly maxLength = 1_000;
  send(to: string, _subject: string, body: string) {
    console.log(`[whatsapp] ${to}: ${body}`); // no subject line, like SMS
  }
}

class Escalation extends Notification {
  // One new abstraction, built from existing ones.
  constructor(
    channel: Channel,
    private readonly alert: Alert,
    private readonly incident: { service: string; summary: string },
    private readonly manager: string,
  ) {
    super(channel);
  }
  notify(to: string) {
    this.alert.notify(to);
    this.channel.send(this.manager, "Escalated", this.fit(`Unacknowledged: ${this.incident.service}: ${this.incident.summary}`));
  }
}

const incident = { service: "search", summary: "index lag 15 minutes" };
new Escalation(new SlackChannel(), new Alert(new WhatsAppChannel(), incident), incident, "@oncall-lead").notify("+44 7700 900456");
```

> **Tip**
>
> The hard part of Bridge is choosing the **primitive operations**. Make them the smallest set every platform can genuinely support, like `send(to, subject, body)` and `max_length`, and keep platform-specific features, such as Slack threads or email attachments, out of the shared interface. If one platform needs a capability others lack, expose it as an optional capability check, like `supports_attachments`, rather than a method that the others implement by throwing.

<a id="15-composite"></a>

## 15. Composite

- **Structure** `a part–whole tree` <!-- ok -->
- **Leaf and group are treated** `identically` <!-- great -->
- **Typical traversal** `recursive, post-order` <!-- ok -->
- **What bites** `cycles and very deep trees` <!-- bad -->

**Intent:** *compose objects into tree structures to represent part–whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.* A file is a node, and a folder is a node that contains nodes. A product is priced, and a bundle is priced from the products inside it, some of which may be bundles themselves. The client calls `size()` or `price()` on whatever it's holding and never asks "is this a leaf or a group?". A **Leaf** answers directly. A **Composite** answers by asking its children and combining their answers. The DOM, UI component trees, abstract syntax trees, organisation charts and permission groups are all composites.

The one real design decision is where the child-management methods, like `add` and `remove`, live. Put them on the shared **Component** interface for *transparency*: clients never need to know what they're holding, but calling `add` on a leaf must then fail at runtime. Put them only on **Composite** for *safety*: the type system prevents adding children to a leaf, but clients sometimes have to check the type. GoF leans towards transparency. Typed languages usually choose safety.

```text
              Bundle "Starter kit"  (10% off)        price = 0.9 × (25.00 + 41.04) = 59.44
               ├── Product "Keyboard"   25.00
               └── Bundle "Audio"      (5% off)       price = 0.95 × (30.00 + 13.20) = 41.04
                    ├── Product "Headset"  30.00
                    └── Product "Stand"    13.20
```

> **Interactive animation:** `composite-tree` — rendered by the page script in the HTML version.

**Composite — products and nested bundles**

```python
from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import ROUND_HALF_UP, Decimal
from typing import Iterator

CENT = Decimal("0.01")


class Item(ABC):
    def __init__(self, name: str) -> None:
        self.name = name

    @abstractmethod
    def price(self) -> Decimal: ...

    @abstractmethod
    def leaves(self) -> Iterator[Product]: ...


class Product(Item):  # leaf
    def __init__(self, name: str, price: str) -> None:
        super().__init__(name)
        self._price = Decimal(price)

    def price(self) -> Decimal:
        return self._price

    def leaves(self) -> Iterator[Product]:
        yield self


class Bundle(Item):  # composite: "safe" design, children only here
    def __init__(self, name: str, discount_percent: int = 0) -> None:
        super().__init__(name)
        self.discount = Decimal(discount_percent) / 100
        self.children: list[Item] = []

    def add(self, *items: Item) -> Bundle:
        for item in items:
            if item is self or (isinstance(item, Bundle) and item.contains(self)):
                raise ValueError(f"adding {item.name!r} would create a cycle")
            self.children.append(item)
        return self

    def contains(self, target: Item) -> bool:
        return any(child is target or (isinstance(child, Bundle) and child.contains(target)) for child in self.children)

    def price(self) -> Decimal:  # post-order: children first, then this node
        subtotal = sum((child.price() for child in self.children), Decimal("0"))
        return (subtotal * (1 - self.discount)).quantize(CENT, ROUND_HALF_UP)

    def leaves(self) -> Iterator[Product]:
        for child in self.children:
            yield from child.leaves()


audio = Bundle("Audio", discount_percent=5).add(Product("Headset", "30.00"), Product("Stand", "13.20"))
kit = Bundle("Starter kit", discount_percent=10).add(Product("Keyboard", "25.00"), audio)
print(kit.price())                          # 59.44
print([p.name for p in kit.leaves()])       # ['Keyboard', 'Headset', 'Stand']
```

```typescript
interface Item {
  readonly name: string;
  pricePence(): number;
  leaves(): Generator<Product>;
}

class Product implements Item {
  // Leaf.
  constructor(readonly name: string, private readonly pence: number) {}

  pricePence(): number {
    return this.pence;
  }

  *leaves(): Generator<Product> {
    yield this;
  }
}

class Bundle implements Item {
  // Composite: "safe" design, children only here.
  private readonly children: Item[] = [];

  constructor(readonly name: string, private readonly discountPercent = 0) {}

  add(...items: Item[]): this {
    for (const item of items) {
      if (item === this || (item instanceof Bundle && item.contains(this))) {
        throw new Error(`adding "${item.name}" would create a cycle`);
      }
      this.children.push(item);
    }
    return this;
  }

  contains(target: Item): boolean {
    return this.children.some((c) => c === target || (c instanceof Bundle && c.contains(target)));
  }

  pricePence(): number {
    // Post-order: children first, then this node.
    const subtotal = this.children.reduce((sum, c) => sum + c.pricePence(), 0);
    return Math.round(subtotal * (1 - this.discountPercent / 100));
  }

  *leaves(): Generator<Product> {
    for (const child of this.children) yield* child.leaves();
  }
}

const audio = new Bundle("Audio", 5).add(new Product("Headset", 3000), new Product("Stand", 1320));
const kit = new Bundle("Starter kit", 10).add(new Product("Keyboard", 2500), audio);
console.log(kit.pricePence()); // 5944
console.log([...kit.leaves()].map((p) => p.name)); // ['Keyboard', 'Headset', 'Stand']
```

- **Strength — clients stay simple.** One call, `price()`, works on a single product or a bundle of bundles, with no type checks.
- **Strength — new node types slot in.** A `Subscription` leaf or a `BuyTwoGetOne` composite works everywhere the tree is used.
- **Weakness — the uniform interface can be too general.** Operations that make sense only for leaves or only for groups end up on the shared interface, or need type checks.
- **Weakness — hidden cost.** One `price()` call may walk thousands of nodes. Cache subtotals on composites if the tree is large and read often.

**Interview question**

*Compute the total size of a directory tree that can be 50,000 levels deep (a generated build artefact). Why does the obvious recursive Composite fail, and what do you do instead?*

The recursive version, `size = sum(child.size() for child in children)`, uses one stack frame per level. Python's default recursion limit is about 1,000 frames (`sys.getrecursionlimit()`), and a JavaScript engine typically allows around ten thousand frames before throwing `RangeError: Maximum call stack size exceeded`. So a deep but otherwise ordinary tree crashes the program. The fix keeps the Composite *structure* but changes the *traversal*: walk the tree **iteratively, with an explicit stack** that lives on the heap. That needs a post-order traversal, because a folder's size is known only after all its children are. One clean way is two passes. First collect the nodes in pre-order with a stack, then process that list in reverse, which visits every child before its parent. Track visited nodes as well, because real file systems contain symlink cycles.

**Answer — iterative post-order over a composite**

```python
from dataclasses import dataclass, field


@dataclass(eq=False)
class Node:
    name: str
    own_bytes: int = 0
    children: list["Node"] = field(default_factory=list)


def total_sizes(root: Node) -> dict[int, int]:
    """Size of every subtree, without recursion. Keys are id(node)."""
    order, stack, seen = [], [root], set()
    while stack:  # pass 1: pre-order on an explicit stack
        node = stack.pop()
        if id(node) in seen:  # cycle or shared node (e.g. a symlink loop)
            continue
        seen.add(id(node))
        order.append(node)
        stack.extend(node.children)
    sizes: dict[int, int] = {}
    for node in reversed(order):  # pass 2: every child is finished before its parent
        sizes[id(node)] = node.own_bytes + sum(sizes.get(id(c), 0) for c in node.children)
    return sizes


# A chain 50,000 levels deep: recursion would exceed the default limit.
root = node = Node("d0", 1)
for depth in range(1, 50_000):
    child = Node(f"d{depth}", 1)
    node.children.append(child)
    node = child
print(total_sizes(root)[id(root)])  # 50000
```

```typescript
interface Node {
  name: string;
  ownBytes: number;
  children: Node[];
}

export function totalSizes(root: Node): Map<Node, number> {
  // Size of every subtree, without recursion.
  const order: Node[] = [];
  const stack: Node[] = [root];
  const seen = new Set<Node>();
  while (stack.length) {
    // Pass 1: pre-order on an explicit stack.
    const node = stack.pop()!;
    if (seen.has(node)) continue; // cycle or shared node (e.g. a symlink loop)
    seen.add(node);
    order.push(node);
    stack.push(...node.children);
  }
  const sizes = new Map<Node, number>();
  for (const node of order.reverse()) {
    // Pass 2: every child is finished before its parent.
    sizes.set(node, node.ownBytes + node.children.reduce((sum, c) => sum + (sizes.get(c) ?? 0), 0));
  }
  return sizes;
}

// A chain 50,000 levels deep: recursion would overflow the call stack.
const root: Node = { name: "d0", ownBytes: 1, children: [] };
let node = root;
for (let depth = 1; depth < 50_000; depth++) {
  const child: Node = { name: `d${depth}`, ownBytes: 1, children: [] };
  node.children.push(child);
  node = child;
}
console.log(totalSizes(root).get(root)); // 50000
```

> **Warning**
>
> **A composite that can contain itself never finishes.** A bundle added to one of its own sub-bundles, a group nested inside its own member group, or a symlink pointing at a parent folder all send a recursive `price()` or `size()` into infinite recursion. Prevent cycles when adding children, as `Bundle.add` does, or detect them while traversing with a visited set, as `total_sizes` does. Do both if the data can come from outside.

<a id="16-decorator"></a>

## 16. Decorator

- **Interface after wrapping** `unchanged` <!-- great -->
- **Layers** `stack at runtime` <!-- good -->
- **Classic example** `I/O streams` <!-- ok -->
- **Python's `@` syntax** `related, but not the same` <!-- ok -->

**Intent:** *attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.* The structure has four parts. A **Component** interface. A **ConcreteComponent** that does the real work. A **Decorator** base class that implements the same interface, holds a component and forwards every call to it. And **ConcreteDecorators** that override only the methods they change, doing something before or after forwarding. Because a decorator *is* a component, decorators wrap other decorators, and the stack is assembled at runtime in whatever order you need.

You use a real decorator stack every time you open a text file in Python. `open("data.csv")` returns a `TextIOWrapper` (bytes to text), wrapped around a `BufferedReader` (buffering), wrapped around a `FileIO` (raw system calls). Each layer has the same file-like interface, and each adds one responsibility. `gzip.open` adds one more layer, decompression. Java's `java.io` streams were the GoF book's era example. TypeScript 5.0 also supports the standardised ECMAScript `@decorator` syntax for classes and methods. Like Python's `@`, it wraps *definitions* rather than *objects at runtime*.

> **Interactive animation:** `wrapper-layers` (variant `decorator`) — rendered by the page script in the HTML version.

**Decorator — compression and checksums around an output sink**

```python
import hashlib
import zlib
from typing import Protocol


class Sink(Protocol):  # Component
    def write(self, data: bytes) -> None: ...
    def close(self) -> None: ...


class FileSink:  # ConcreteComponent: the real work
    def __init__(self, path: str) -> None:
        self._file = open(path, "wb")

    def write(self, data: bytes) -> None:
        self._file.write(data)

    def close(self) -> None:
        self._file.close()


class SinkDecorator:  # Decorator base: forwards everything by default
    def __init__(self, inner: Sink) -> None:
        self._inner = inner

    def write(self, data: bytes) -> None:
        self._inner.write(data)

    def close(self) -> None:
        self._inner.close()


class GzipSink(SinkDecorator):
    def __init__(self, inner: Sink) -> None:
        super().__init__(inner)
        self._zip = zlib.compressobj(wbits=31)  # 31 = gzip container format

    def write(self, data: bytes) -> None:
        self._inner.write(self._zip.compress(data))

    def close(self) -> None:
        self._inner.write(self._zip.flush())  # emit the trailer before closing
        super().close()


class ChecksumSink(SinkDecorator):
    def __init__(self, inner: Sink) -> None:
        super().__init__(inner)
        self.sha256 = hashlib.sha256()

    def write(self, data: bytes) -> None:
        self.sha256.update(data)
        super().write(data)


# Checksum OUTSIDE gzip: hashes the uncompressed CSV the reader will see.
sink = ChecksumSink(GzipSink(FileSink("orders.csv.gz")))
sink.write(b"id,total\n1,42.00\n2,13.50\n")
sink.close()
print("csv sha256:", sink.sha256.hexdigest())

# Checksum INSIDE gzip: hashes the compressed file as stored on disk.
inner = ChecksumSink(FileSink("orders2.csv.gz"))
sink2 = GzipSink(inner)
sink2.write(b"id,total\n1,42.00\n2,13.50\n")
sink2.close()
print("file sha256:", inner.sha256.hexdigest())
```

```typescript
import { createHash, type Hash } from "node:crypto";
import { closeSync, openSync, writeSync } from "node:fs";
import { gzipSync } from "node:zlib";

interface Sink {
  // Component
  write(data: Uint8Array): void;
  close(): void;
}

class FileSink implements Sink {
  // ConcreteComponent: the real work.
  private readonly fd: number;
  constructor(path: string) {
    this.fd = openSync(path, "w");
  }
  write(data: Uint8Array) {
    writeSync(this.fd, data);
  }
  close() {
    closeSync(this.fd);
  }
}

abstract class SinkDecorator implements Sink {
  // Decorator base: forwards everything by default.
  constructor(protected readonly inner: Sink) {}
  write(data: Uint8Array) {
    this.inner.write(data);
  }
  close() {
    this.inner.close();
  }
}

class GzipSink extends SinkDecorator {
  private readonly chunks: Uint8Array[] = [];
  override write(data: Uint8Array) {
    this.chunks.push(data); // buffered: gzipSync needs the whole payload
  }
  override close() {
    this.inner.write(gzipSync(Buffer.concat(this.chunks)));
    super.close();
  }
}

class ChecksumSink extends SinkDecorator {
  readonly sha256: Hash = createHash("sha256");
  override write(data: Uint8Array) {
    this.sha256.update(data);
    super.write(data);
  }
}

// Checksum OUTSIDE gzip: hashes the uncompressed CSV the reader will see.
const sink = new ChecksumSink(new GzipSink(new FileSink("orders.csv.gz")));
sink.write(new TextEncoder().encode("id,total\n1,42.00\n2,13.50\n"));
sink.close();
console.log("csv sha256:", sink.sha256.digest("hex"));
```

- **Strength — responsibilities combine freely.** Compression, checksums, encryption, metrics and rate limits are each one class, combined per use without a subclass per combination.
- **Strength — single responsibility per layer.** Each decorator is small, does one thing, and can be tested by wrapping a fake.
- **Weakness — order is semantic.** The two stacks above produce different checksums, and both are correct for different purposes. Document which one you meant.
- **Weakness — identity and type checks break.** A decorated object isn't `is` the original, and `isinstance(sink, FileSink)` is false, so code that checks concrete types stops working.

**Interview question**

*Write a `ttl_cache(seconds)` decorator for methods that caches results per instance and per arguments. What goes wrong with the obvious `functools.lru_cache` approach?*

`@functools.lru_cache` on a method looks right, but the cache lives on the *function*, which belongs to the class, and the key includes `self`. So every instance that ever called the method is **kept alive by the cache** until it's evicted. With an unbounded cache, that's never: a memory leak in a long-running service. Linters warn about it (flake8-bugbear's B019). It also can't expire entries by age. The fix is to keep a separate cache **per instance**, stored in a `WeakKeyDictionary` (Python) or a `WeakMap` (TypeScript), so an instance's cache disappears when the instance does. Each entry stores its timestamp, so it can expire. Use a monotonic clock, because wall-clock time can jump backwards. Arguments must be hashable, or serialisable for the key.

**Answer — a per-instance TTL cache decorator**

```python
import functools
import time
import weakref


def ttl_cache(seconds: float):
    def decorate(method):
        caches: weakref.WeakKeyDictionary = weakref.WeakKeyDictionary()  # dies with each instance

        @functools.wraps(method)
        def wrapper(self, *args):
            cache = caches.setdefault(self, {})
            now = time.monotonic()  # immune to wall-clock jumps
            hit = cache.get(args)
            if hit is not None and now - hit[0] < seconds:
                return hit[1]
            value = method(self, *args)
            cache[args] = (now, value)
            return value

        return wrapper

    return decorate


class RatesClient:
    def __init__(self) -> None:
        self.calls = 0

    @ttl_cache(seconds=60)
    def rate(self, currency: str) -> float:
        self.calls += 1
        return {"EUR": 1.08, "JPY": 0.0067}[currency]


client = RatesClient()
client.rate("EUR")
client.rate("EUR")
assert client.calls == 1  # the second call was served from the cache
```

```typescript
export function ttlCache(seconds: number) {
  return function <This extends object, A extends unknown[], R>(
    method: (this: This, ...args: A) => R,
    _context: ClassMethodDecoratorContext<This, (this: This, ...args: A) => R>,
  ) {
    const caches = new WeakMap<This, Map<string, { at: number; value: R }>>(); // dies with each instance
    return function (this: This, ...args: A): R {
      let cache = caches.get(this);
      if (!cache) caches.set(this, (cache = new Map()));
      const key = JSON.stringify(args);
      const now = performance.now(); // monotonic: immune to wall-clock jumps
      const hit = cache.get(key);
      if (hit && now - hit.at < seconds * 1000) return hit.value;
      const value = method.call(this, ...args);
      cache.set(key, { at: now, value });
      return value;
    };
  };
}

class RatesClient {
  calls = 0;

  @ttlCache(60) // TypeScript 5.0+ standard decorators
  rate(currency: string): number {
    this.calls++;
    return ({ EUR: 1.08, JPY: 0.0067 } as Record<string, number>)[currency];
  }
}

const client = new RatesClient();
client.rate("EUR");
client.rate("EUR");
console.assert(client.calls === 1); // the second call was served from the cache
```

> **Warning**
>
> **A GoF decorator must forward the *whole* interface,** including the methods it doesn't change. That's why the examples above use a forwarding base class. If you hand-write a decorator and forget one method, say `flush()`, then calls to it go nowhere, or raise `AttributeError` only on the code path that uses it. In Python, don't solve this with `__getattr__` forwarding alone, because special methods like `__enter__`, `__iter__` and `__len__` bypass it (section 6).

<a id="17-facade"></a>

## 17. Facade

- **Interface it offers** `new, smaller, simpler` <!-- great -->
- **The subsystem** `still reachable directly` <!-- ok -->
- **What the subsystem knows about it** `nothing` <!-- great -->
- **Becomes a god object when** `it holds business rules` <!-- bad -->

**Intent:** *provide a unified interface to a set of interfaces in a subsystem. Facade defines a higher-level interface that makes the subsystem easier to use.* A subsystem with many parts usually has one or two common paths through it, and every client re-implements them: the right calls, in the right order, with the right clean-up when something fails. A facade writes that path down once. The parts stay public, because a facade is a *convenience*, not a wall, but most callers never need to go beneath it.

The standard libraries are full of facades. Python's `subprocess.run()` is the documented recommended entry point, and `Popen` sits underneath it for the cases `run()` doesn't cover. `requests.get()` is a facade over connection pools, retries, encoding and redirects. In a layered application, the **application service** or use-case layer is a set of facades over the domain and infrastructure. Two comparisons sharpen the idea. A facade *invents* an interface, while an adapter *conforms to* an existing one. And a facade's subsystem doesn't know the facade exists, so communication is one-way. A **Mediator** (section 27) is different: its colleagues talk *to* the mediator and it talks back, so communication is two-way.

> **Interactive animation:** `adapter-facade` (variant `facade`) — rendered by the page script in the HTML version.

**Facade — publishing a video in one call, with clean-up on failure**

```python
import logging
from dataclasses import dataclass

log = logging.getLogger(__name__)


# --- the subsystem: useful parts, each with its own interface -----------------
class ObjectStore:
    def __init__(self) -> None:
        self.objects: dict[str, bytes] = {}

    def put(self, key: str, data: bytes) -> str:
        self.objects[key] = data
        return key

    def delete(self, key: str) -> None:
        self.objects.pop(key, None)


class Transcoder:
    def to_renditions(self, data: bytes) -> dict[str, bytes]:
        return {"720p": data[: len(data) // 2], "1080p": data}


class Thumbnailer:
    def frame_at(self, data: bytes, seconds: float) -> bytes:
        return data[:16]


class Cdn:
    def publish(self, keys: list[str]) -> str:
        return f"https://cdn.example.com/{keys[0].split('/')[1]}"


class Notifier:
    def followers(self, channel_id: str, url: str) -> None:
        log.info("notify followers of %s: %s", channel_id, url)


@dataclass(frozen=True)
class Published:
    video_id: str
    url: str


# --- the facade: one call that owns the order of the steps --------------------
class VideoPublishing:
    def __init__(self, store: ObjectStore, transcoder: Transcoder, thumbs: Thumbnailer, cdn: Cdn, notifier: Notifier) -> None:
        self._store, self._transcoder, self._thumbs = store, transcoder, thumbs
        self._cdn, self._notifier = cdn, notifier

    def publish(self, channel_id: str, video_id: str, raw: bytes) -> Published:
        written: list[str] = []
        try:
            written.append(self._store.put(f"videos/{video_id}/original", raw))
            for name, data in self._transcoder.to_renditions(raw).items():
                written.append(self._store.put(f"videos/{video_id}/{name}", data))
            thumb = self._thumbs.frame_at(raw, seconds=3.0)
            written.append(self._store.put(f"videos/{video_id}/thumb.jpg", thumb))
            url = self._cdn.publish(written)
        except Exception:
            for key in reversed(written):  # clean up what we created, newest first
                self._store.delete(key)
            raise  # never swallow the failure
        self._notifier.followers(channel_id, url)  # only after everything succeeded
        return Published(video_id, url)


facade = VideoPublishing(ObjectStore(), Transcoder(), Thumbnailer(), Cdn(), Notifier())
print(facade.publish("chan-9", "v-123", b"\x00" * 64))
```

```typescript
// --- the subsystem: useful parts, each with its own interface ---------------
class ObjectStore {
  readonly objects = new Map<string, Uint8Array>();
  async put(key: string, data: Uint8Array): Promise<string> {
    this.objects.set(key, data);
    return key;
  }
  async delete(key: string): Promise<void> {
    this.objects.delete(key);
  }
}

class Transcoder {
  async toRenditions(data: Uint8Array): Promise<Record<string, Uint8Array>> {
    return { "720p": data.slice(0, data.length / 2), "1080p": data };
  }
}

class Thumbnailer {
  async frameAt(data: Uint8Array, _seconds: number): Promise<Uint8Array> {
    return data.slice(0, 16);
  }
}

class Cdn {
  async publish(keys: string[]): Promise<string> {
    return `https://cdn.example.com/${keys[0].split("/")[1]}`;
  }
}

class Notifier {
  async followers(channelId: string, url: string): Promise<void> {
    console.log(`notify followers of ${channelId}: ${url}`);
  }
}

// --- the facade: one call that owns the order of the steps ------------------
export class VideoPublishing {
  constructor(
    private readonly store: ObjectStore,
    private readonly transcoder: Transcoder,
    private readonly thumbs: Thumbnailer,
    private readonly cdn: Cdn,
    private readonly notifier: Notifier,
  ) {}

  async publish(channelId: string, videoId: string, raw: Uint8Array): Promise<{ videoId: string; url: string }> {
    const written: string[] = [];
    let url: string;
    try {
      written.push(await this.store.put(`videos/${videoId}/original`, raw));
      for (const [name, data] of Object.entries(await this.transcoder.toRenditions(raw))) {
        written.push(await this.store.put(`videos/${videoId}/${name}`, data));
      }
      written.push(await this.store.put(`videos/${videoId}/thumb.jpg`, await this.thumbs.frameAt(raw, 3)));
      url = await this.cdn.publish(written);
    } catch (err) {
      for (const key of written.reverse()) await this.store.delete(key); // clean up, newest first
      throw err; // never swallow the failure
    }
    await this.notifier.followers(channelId, url); // only after everything succeeded
    return { videoId, url };
  }
}

const facade = new VideoPublishing(new ObjectStore(), new Transcoder(), new Thumbnailer(), new Cdn(), new Notifier());
console.log(await facade.publish("chan-9", "v-123", new Uint8Array(64)));
```

- **Strength — the common path is written once.** The order of steps, the clean-up and the logging live in one method, not in every controller and job.
- **Strength — callers are insulated.** Reordering or replacing subsystem steps changes the facade, not its many callers.
- **Weakness — it attracts everything.** Every new feature looks like "one more method on the facade", until it's a 3,000-line class that every team edits.
- **Weakness — it can hide the subsystem's power.** Callers that need an unusual combination of steps get pushed into awkward workarounds if the parts aren't also reachable.

**Interview question**

*Your `CheckoutFacade` has grown to 40 methods, and three teams edit it every week. What went wrong, and how do you fix it without breaking callers?*

Two things went wrong. First, the facade became the **only door** into the subsystem, so every new capability was added to it, including ones used by a single caller. Second, it started to hold **business rules**, like discount eligibility and stock reservation policy, instead of only coordinating calls. Those rules belong to the domain objects. The fix is to split the facade **by use case**. Each operation, such as `PlaceOrder`, `CancelOrder` or `ApplyCoupon`, becomes its own small application-service class with one public method. Shared rules move down into the domain. The old facade can stay temporarily as a thin layer that delegates to the new classes, so callers migrate one at a time, and it's deleted when nobody uses it.

**Answer — from one big facade to one class per use case**

```python
from dataclasses import dataclass


# Before: one class, 40 methods, owned by everyone.
#
# class CheckoutFacade:
#     def place_order(...): ...
#     def cancel_order(...): ...
#     def apply_coupon(...): ...     # holds coupon rules itself
#     ... 37 more ...


@dataclass(frozen=True)
class PlaceOrderCommand:
    cart_id: str
    payment_token: str


class PlaceOrder:  # one use case, one public method, one owning team
    def __init__(self, carts, payments, orders) -> None:
        self._carts, self._payments, self._orders = carts, payments, orders

    def __call__(self, cmd: PlaceOrderCommand) -> str:
        cart = self._carts.get(cmd.cart_id)
        cart.ensure_checkoutable()  # the rule lives in the domain object, not here
        charge = self._payments.charge(cmd.payment_token, cart.total())
        return self._orders.create_from(cart, charge)


class CancelOrder:
    def __init__(self, orders, payments) -> None:
        self._orders, self._payments = orders, payments

    def __call__(self, order_id: str) -> None:
        order = self._orders.get(order_id)
        order.cancel()  # raises if the order's state forbids it
        self._payments.refund(order.charge_id)


class CheckoutFacade:  # temporary: delegates while callers migrate, then deleted
    def __init__(self, place: PlaceOrder, cancel: CancelOrder) -> None:
        self.place_order, self.cancel_order = place, cancel
```

```typescript
// Before: one class, 40 methods, owned by everyone.
//
// class CheckoutFacade {
//   placeOrder(...) {}
//   cancelOrder(...) {}
//   applyCoupon(...) {}   // holds coupon rules itself
//   ... 37 more ...
// }

interface Cart {
  ensureCheckoutable(): void;
  total(): number;
}
interface Order {
  chargeId: string;
  cancel(): void;
}
interface Carts {
  get(id: string): Promise<Cart>;
}
interface Orders {
  get(id: string): Promise<Order>;
  createFrom(cart: Cart, chargeId: string): Promise<string>;
}
interface Payments {
  charge(token: string, amount: number): Promise<string>;
  refund(chargeId: string): Promise<void>;
}

export class PlaceOrder {
  // One use case, one public method, one owning team.
  constructor(private readonly carts: Carts, private readonly payments: Payments, private readonly orders: Orders) {}

  async execute(cmd: { cartId: string; paymentToken: string }): Promise<string> {
    const cart = await this.carts.get(cmd.cartId);
    cart.ensureCheckoutable(); // the rule lives in the domain object, not here
    const chargeId = await this.payments.charge(cmd.paymentToken, cart.total());
    return this.orders.createFrom(cart, chargeId);
  }
}

export class CancelOrder {
  constructor(private readonly orders: Orders, private readonly payments: Payments) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orders.get(orderId);
    order.cancel(); // throws if the order's state forbids it
    await this.payments.refund(order.chargeId);
  }
}

/** @deprecated Temporary: delegates while callers migrate, then deleted. */
export class CheckoutFacade {
  constructor(private readonly place: PlaceOrder, private readonly cancel: CancelOrder) {}
  placeOrder(cmd: { cartId: string; paymentToken: string }) {
    return this.place.execute(cmd);
  }
  cancelOrder(orderId: string) {
    return this.cancel.execute(orderId);
  }
}
```

> **Warning**
>
> **A facade that hides failures is worse than no facade.** If step four of five fails, the caller must find out, and the subsystem mustn't be left half-updated. Either clean up what the facade already did, as `publish()` does, or make each step idempotent so the whole call can be safely retried. Catching an exception and returning `None` or `false` from a facade turns a loud, debuggable failure into silent corruption.

<a id="18-flyweight"></a>

## 18. Flyweight

- **What's shared** `intrinsic, immutable state` <!-- great -->
- **What the caller supplies** `extrinsic state, per use` <!-- ok -->
- **Python's own flyweights** `small ints · interned strings` <!-- ok -->
- **A flyweight must be** `immutable` <!-- bad -->

**Intent:** *use sharing to support large numbers of fine-grained objects efficiently.* Some programs need millions of small objects: characters in a document, markers on a map, trees in a game world, cells in a spreadsheet. Most of each object's data is the same as thousands of others. Every tree of a given species has the same mesh, texture and colour. Only its position and size differ. Flyweight splits the state in two. **Intrinsic** state is shared, immutable, and stored once per distinct value in a flyweight object. **Extrinsic** state is unique per use, stored compactly by the client, and passed in when needed. A **factory** with a cache makes sure each distinct intrinsic state exists exactly once.

Language runtimes use flyweights all the time. CPython pre-allocates the integers from −5 to 256 and returns the same objects every time. String literals that look like identifiers are *interned*, and `sys.intern()` lets you intern your own strings, which saves memory and makes dictionary lookups on repeated keys faster. JavaScript engines intern strings and share *hidden classes* (shapes) between objects created with the same properties in the same order. A related but separate optimisation is shrinking each object, with `__slots__` in Python or typed arrays in JavaScript. Real systems often combine the two.

```text
Without flyweights: 1,000,000 markers × (icon 24 KB + font + colour) ≈ 24 GB
With flyweights:    3 MarkerStyle objects × ~24 KB                   ≈ 72 KB
                  + 1,000,000 × (lat 8 B + lon 8 B + style index 1 B) ≈ 17 MB
```

> **Interactive animation:** `flyweight-share` — rendered by the page script in the HTML version.

**Flyweight — shared marker styles, compact per-marker data**

```python
from dataclasses import dataclass
from functools import cache


@dataclass(frozen=True, slots=True)
class MarkerStyle:  # flyweight: intrinsic, immutable, shared
    icon: str
    colour: str
    font: str
    icon_bytes: bytes  # the expensive part, loaded once per style

    def draw(self, lat: float, lon: float, label: str) -> str:  # extrinsic state passed in
        return f"{self.icon}@({lat:.4f},{lon:.4f}) {label} [{self.colour}]"


@cache  # the flyweight factory: one object per distinct intrinsic state
def marker_style(icon: str, colour: str, font: str = "Inter") -> MarkerStyle:
    return MarkerStyle(icon, colour, font, icon_bytes=b"\x89PNG" + b"\x00" * 24_000)


@dataclass(slots=True)  # extrinsic state: small, one per marker
class Marker:
    lat: float
    lon: float
    label: str
    style: MarkerStyle  # a reference, not a copy


markers = [
    Marker(51.5 + i * 1e-5, -0.12, f"store {i}", marker_style("pin", "red" if i % 2 else "blue"))
    for i in range(100_000)
]
styles = {id(m.style) for m in markers}
print(len(markers), "markers share", len(styles), "style objects")  # 100000 markers share 2 style objects
print(markers[7].style.draw(markers[7].lat, markers[7].lon, markers[7].label))
```

```typescript
interface MarkerStyle {
  // Flyweight: intrinsic, immutable, shared.
  readonly icon: string;
  readonly colour: string;
  readonly font: string;
  readonly iconBytes: Uint8Array; // the expensive part, loaded once per style
}

const styles = new Map<string, MarkerStyle>();

// The flyweight factory: one object per distinct intrinsic state.
export function markerStyle(icon: string, colour: string, font = "Inter"): MarkerStyle {
  const key = `${icon}|${colour}|${font}`;
  let style = styles.get(key);
  if (!style) {
    style = Object.freeze({ icon, colour, font, iconBytes: new Uint8Array(24_000) });
    styles.set(key, style);
  }
  return style;
}

export function draw(style: MarkerStyle, lat: number, lon: number, label: string): string {
  return `${style.icon}@(${lat.toFixed(4)},${lon.toFixed(4)}) ${label} [${style.colour}]`; // extrinsic state passed in
}

interface Marker {
  // Extrinsic state: small, one per marker.
  lat: number;
  lon: number;
  label: string;
  style: MarkerStyle; // a reference, not a copy
}

const markers: Marker[] = Array.from({ length: 100_000 }, (_, i) => ({
  lat: 51.5 + i * 1e-5,
  lon: -0.12,
  label: `store ${i}`,
  style: markerStyle("pin", i % 2 ? "red" : "blue"),
}));
console.log(markers.length, "markers share", new Set(markers.map((m) => m.style)).size, "style objects");
console.log(draw(markers[7].style, markers[7].lat, markers[7].lon, markers[7].label));
```

- **Strength — memory drops by orders of magnitude.** The shared part is stored once per distinct value, not once per object.
- **Strength — cheaper comparisons.** Shared flyweights can be compared by identity, and interned strings make dictionary lookups faster.
- **Weakness — extrinsic state moves to the client.** Code has to pass position and label into every call, which makes APIs clumsier.
- **Weakness — only pays off at scale.** For a few thousand objects, the factory and the split state are complexity without a measurable benefit.

**Interview question**

*A map shows two million markers, each an object holding its own icon bitmap, colour, font and coordinates. The browser tab uses 3 GB and stutters when panning. Redesign the data.*

Find the **intrinsic** state: the icon, colour and font repeat across almost every marker, because there are only a handful of marker *kinds*. Make those a few shared, frozen style objects from a factory. That alone removes the bitmaps from two million objects. Then look at the **extrinsic** state: latitude, longitude and a style choice per marker. At two million entries, even small objects carry overhead per object. So store the extrinsic state as **columns** instead of objects: one `Float64Array` of latitudes, one of longitudes, and a `Uint8Array` of style indexes into the style table. That's 17 bytes per marker, and it's cache-friendly to iterate when deciding what's on screen. The flyweights handle what's shared, and the column layout handles what isn't.

**Answer — flyweight styles plus columnar extrinsic state**

```python
from array import array


class MarkerLayer:
    def __init__(self, styles: list[MarkerStyle]) -> None:
        self.styles = styles  # the flyweights, stored once
        self.lats = array("d")  # 8 bytes per marker
        self.lons = array("d")  # 8 bytes per marker
        self.style_ids = bytearray()  # 1 byte per marker (up to 256 styles)

    def add(self, lat: float, lon: float, style_id: int) -> None:
        self.lats.append(lat)
        self.lons.append(lon)
        self.style_ids.append(style_id)

    def visible(self, south: float, north: float, west: float, east: float):
        for i in range(len(self.lats)):
            if south <= self.lats[i] <= north and west <= self.lons[i] <= east:
                yield self.lats[i], self.lons[i], self.styles[self.style_ids[i]]


layer = MarkerLayer([marker_style("pin", "red"), marker_style("pin", "blue"), marker_style("star", "gold")])
for i in range(2_000_000):
    layer.add(51.0 + (i % 1000) * 1e-3, -1.0 + (i // 1000) * 1e-3, i % 3)
print(sum(1 for _ in layer.visible(51.2, 51.21, -0.5, -0.49)))  # markers in one small viewport
```

```typescript
export class MarkerLayer {
  private lats: Float64Array; // 8 bytes per marker
  private lons: Float64Array; // 8 bytes per marker
  private styleIds: Uint8Array; // 1 byte per marker (up to 256 styles)
  private count = 0;

  constructor(private readonly styles: MarkerStyle[], capacity: number) {
    this.lats = new Float64Array(capacity);
    this.lons = new Float64Array(capacity);
    this.styleIds = new Uint8Array(capacity);
  }

  add(lat: number, lon: number, styleId: number): void {
    this.lats[this.count] = lat;
    this.lons[this.count] = lon;
    this.styleIds[this.count] = styleId;
    this.count++;
  }

  *visible(south: number, north: number, west: number, east: number) {
    for (let i = 0; i < this.count; i++) {
      const lat = this.lats[i];
      const lon = this.lons[i];
      if (lat >= south && lat <= north && lon >= west && lon <= east) yield { lat, lon, style: this.styles[this.styleIds[i]] };
    }
  }
}

const layer = new MarkerLayer([markerStyle("pin", "red"), markerStyle("pin", "blue"), markerStyle("star", "gold")], 2_000_000);
for (let i = 0; i < 2_000_000; i++) layer.add(51 + (i % 1000) * 1e-3, -1 + Math.floor(i / 1000) * 1e-3, i % 3);
console.log([...layer.visible(51.2, 51.21, -0.5, -0.49)].length); // markers in one small viewport
```

> **Warning**
>
> **A flyweight must be immutable, because everyone shares it.** If one marker changes its style object's colour to show it's selected, a hundred thousand markers turn yellow. Freeze flyweights (`frozen=True`, `Object.freeze`) and model per-object variation as extrinsic state. A related Python trap: `a is b` happens to be `True` for small cached integers and interned strings, which tempts people into using `is` for equality. It breaks as soon as a value is outside the cache, as with `1000 is 10**3`. Use `==` for values, and `is` only for identity, such as `is None`.

<a id="19-proxy"></a>

## 19. Proxy

- **Interface** `same as the real subject` <!-- great -->
- **Kinds** `virtual · protection · remote · caching` <!-- ok -->
- **Built into the language** `JS Proxy · Python __getattr__` <!-- good -->
- **Classic ORM trap** `N + 1 lazy loads` <!-- bad -->

**Intent:** *provide a surrogate or placeholder for another object to control access to it.* A proxy implements the same interface as the **real subject** and sits in front of it, so it has the same shape as a Decorator (section 16). The difference is intent: a decorator adds behaviour, while a proxy *controls access*. The common kinds are named by what they control. A **virtual proxy** controls *when* the real object is created, by creating it lazily on first use. A **protection proxy** controls *who* may call it, by checking permissions. A **remote proxy** controls *where* it runs: every gRPC or RPC client stub is a local object standing in for a remote one. A **caching proxy** controls *whether* the real call happens at all. A **smart reference** adds bookkeeping, such as reference counting, locking or access logging.

Both languages have proxy machinery built in. JavaScript's `Proxy` object wraps any target with *traps* for `get`, `set`, `has`, `deleteProperty` and more, and `Reflect` provides the default behaviour for each trap. Vue 3's reactivity system is built on it: reading a property through the proxy records a dependency, and writing one triggers updates. In Python, `__getattr__` intercepts lookups of missing attributes, `weakref.proxy` makes a proxy that doesn't keep its target alive, and `unittest.mock` objects are proxies that record calls. ORMs use virtual proxies for **lazy loading**: `order.customer` looks like a field, but the first access runs a query.

> **Interactive animation:** `wrapper-layers` (variant `proxy`) — rendered by the page script in the HTML version.

**Proxy — virtual and protection proxies, by hand and with language support**

```python
from typing import Callable, Generic, TypeVar

T = TypeVar("T")


class Report:
    def __init__(self, report_id: str) -> None:
        print(f"loading 40 MB for {report_id}...")  # expensive
        self.report_id = report_id

    def export_pdf(self) -> bytes:
        return f"%PDF {self.report_id}".encode()


class LazyProxy(Generic[T]):
    """Virtual proxy: creates the real object on first attribute access."""

    def __init__(self, factory: Callable[[], T]) -> None:
        self._factory = factory
        self._target: T | None = None

    def _real(self) -> T:
        if self._target is None:
            self._target = self._factory()
        return self._target

    def __getattr__(self, name: str):  # called only for attributes the proxy lacks
        return getattr(self._real(), name)

    @property
    def __class__(self):  # isinstance() also consults __class__, so the proxy passes type checks
        return type(self._real())


class ReportAccessProxy:
    """Protection proxy: same interface, checks permission first."""

    def __init__(self, report: Report, permissions: set[str]) -> None:
        self._report, self._permissions = report, permissions

    def export_pdf(self) -> bytes:
        if "reports:export" not in self._permissions:
            raise PermissionError("missing permission reports:export")
        return self._report.export_pdf()


lazy = LazyProxy(lambda: Report("q3-sales"))  # nothing loaded yet
print(isinstance(lazy, Report))  # loads now, then True
print(ReportAccessProxy(lazy, {"reports:export"}).export_pdf())
```

```typescript
class Report {
  constructor(readonly reportId: string) {
    console.log(`loading 40 MB for ${reportId}...`); // expensive
  }
  exportPdf(): string {
    return `%PDF ${this.reportId}`;
  }
}

// Virtual proxy with the built-in Proxy: creates the real object on first use.
export function lazy<T extends object>(factory: () => T): T {
  let target: T | undefined;
  const real = () => (target ??= factory());
  return new Proxy({} as T, {
    get(_shell, prop) {
      const value = Reflect.get(real(), prop);
      return typeof value === "function" ? value.bind(real()) : value; // bind: built-ins need their real `this`
    },
    set: (_shell, prop, value) => Reflect.set(real(), prop, value),
    has: (_shell, prop) => Reflect.has(real(), prop),
    getPrototypeOf: () => Reflect.getPrototypeOf(real()), // keeps instanceof working
  });
}

// Protection proxy, written as a class: same interface, checks permission first.
export class ReportAccessProxy {
  constructor(private readonly report: Pick<Report, "exportPdf">, private readonly permissions: Set<string>) {}

  exportPdf(): string {
    if (!this.permissions.has("reports:export")) throw new Error("missing permission reports:export");
    return this.report.exportPdf();
  }
}

// A generic read-only view: every nested object comes back wrapped too.
export function readonlyView<T extends object>(target: T): Readonly<T> {
  return new Proxy(target, {
    get(t, prop, receiver) {
      const value = Reflect.get(t, prop, receiver);
      return typeof value === "object" && value !== null ? readonlyView(value) : value;
    },
    set() {
      throw new TypeError("read-only");
    },
    deleteProperty() {
      throw new TypeError("read-only");
    },
  });
}

const report = lazy(() => new Report("q3-sales")); // nothing loaded yet
console.log(report instanceof Report); // loads now, then true
console.log(new ReportAccessProxy(report, new Set(["reports:export"])).exportPdf());
```

- **Strength — control without changing the subject.** Laziness, permissions, caching and remoting are added to a class that knows nothing about them.
- **Strength — transparent to callers.** Callers program against the interface and get the right behaviour without knowing a proxy is involved.
- **Weakness — hidden cost.** An innocent-looking attribute read can be a network call or a database query. That's exactly how the N+1 problem below happens.
- **Weakness — identity and introspection get murky.** `proxy is real` is false, debuggers show the proxy, and generic proxies must forward every trap or behave strangely.

**Interview question**

*A page lists 50 orders with their customer names and takes two seconds. The ORM's SQL log shows 51 queries. Explain what's happening and fix it.*

This is the **N+1 query problem**, and lazy-loading proxies cause it. The first query loads 50 orders. Each `order.customer` is a virtual proxy, and the template touches `order.customer.name` 50 times, so each access triggers *one more query* to load that customer: 1 + 50 = 51 round trips. Each query is fast, but the latency adds up. The fix is to tell the ORM, **at query time**, which relationships you'll need, so it can load them in bulk. Load them with a `JOIN`, or with one extra `IN (...)` query for all 50 customers at once. In SQLAlchemy that's `selectinload` or `joinedload`, and in Prisma it's `include`. Where you can't change the query, for example in GraphQL resolvers, a *DataLoader* collects the IDs requested in one tick and fetches them in a single batch. As a guardrail, add a test that counts queries per page, or turn on the ORM's warnings for lazy loads.

**Answer — from 51 queries to 2**

```python
from sqlalchemy import ForeignKey, String, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload


class Base(DeclarativeBase):
    pass


class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped[Customer] = relationship()  # lazy="select" by default: a lazy-loading proxy


engine = create_engine("sqlite://", echo=True)  # echo shows every query
Base.metadata.create_all(engine)

with Session(engine) as session:
    # N + 1: one query for orders, then one per order on first access to .customer.
    for order in session.scalars(select(Order).limit(50)):
        print(order.id, order.customer.name)

    # 2 queries: orders, then ONE "WHERE customers.id IN (...)" for all of them.
    stmt = select(Order).options(selectinload(Order.customer)).limit(50)
    for order in session.scalars(stmt):
        print(order.id, order.customer.name)
```

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query"] }); // log shows every query

// N + 1: one query for orders, then one per order for its customer.
const orders = await prisma.order.findMany({ take: 50 });
for (const order of orders) {
  const customer = await prisma.customer.findUnique({ where: { id: order.customerId } });
  console.log(order.id, customer?.name);
}

// 2 queries: orders, then ONE batched lookup for all their customers.
const withCustomers = await prisma.order.findMany({ take: 50, include: { customer: true } });
for (const order of withCustomers) console.log(order.id, order.customer.name);
```

> **Warning**
>
> **JavaScript proxies around built-in objects break in a surprising way.** `new Proxy(new Map(), {})` looks like a map, but calling `.get()` on it throws `TypeError: Method Map.prototype.get called on incompatible receiver`. `Map`, `Set`, `Date` and class instances with `#private` fields keep their data in internal slots that only the real object has. Inside the `get` trap, bind methods to the real target, as `lazy()` does with `value.bind(real())`, or don't proxy those types.

<a id="unit-4"></a>

## Unit 4 — Behavioural Patterns

Eleven patterns about how objects divide up work and communicate: swapping algorithms, fixing an algorithm's skeleton, announcing events, turning requests into objects, changing behaviour with state, passing requests along, walking collections, coordinating peers, saving and restoring state, adding operations to a structure, and evaluating small languages.

<a id="20-strategy"></a>

## 20. Strategy

- **Participants** `Context · Strategy · ConcreteStrategy` <!-- ok -->
- **Chosen** `at runtime, from outside` <!-- great -->
- **Stateless strategies** `can be shared, or be functions` <!-- good -->
- **Hidden contract** `comparators must be consistent` <!-- bad -->

**Intent:** *define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.* The crash course covered the core move. The **Context** holds a **Strategy** and delegates one step of its work to it, and **ConcreteStrategies** implement that step in different ways. This section covers the decisions that come after: how a strategy gets the data it needs, who picks it, and what promises a strategy has to keep.

**How a strategy gets its data.** The context can *push* exactly the values the algorithm needs (`cost(weight, subtotal)`), or it can pass *itself* so the strategy can pull what it needs (`cost(cart)`). Pushing keeps strategies independent of the context, but every new strategy that needs another value changes the interface. Passing the context is more flexible, but couples each strategy to the context's shape. A good middle ground is a small, purpose-built input object. **Who picks the strategy.** Usually configuration, through a registry (section 7), or a *selector* that chooses per request. **Sharing.** A strategy with no per-call state can be one shared instance, or simply a function. Standard libraries are full of function strategies: `sorted(key=...)`, `functools.cmp_to_key`, `Array.prototype.sort(compare)`. Passport.js even calls its authentication plug-ins "strategies".

> **Interactive animation:** `strategy-swap` — rendered by the page script in the HTML version.

**Strategy — compression chosen per content type, as classes or functions**

```python
import gzip
import zlib
from dataclasses import dataclass
from typing import Callable, Protocol


class Compressor(Protocol):  # the Strategy interface
    name: str
    def compress(self, data: bytes) -> bytes: ...


@dataclass(frozen=True)
class Gzip:  # configured strategy: a class earns its keep here
    level: int = 6
    name: str = "gzip"

    def compress(self, data: bytes) -> bytes:
        return gzip.compress(data, compresslevel=self.level)


@dataclass(frozen=True)
class Identity:
    name: str = "identity"

    def compress(self, data: bytes) -> bytes:
        return data


# Selection lives in one table, not in the context.
BY_CONTENT_TYPE: dict[str, Compressor] = {
    "text/html": Gzip(level=9),
    "application/json": Gzip(level=6),
    "image/png": Identity(),  # already compressed: don't waste CPU
}


class ResponseWriter:  # the Context
    def __init__(self, choose: Callable[[str], Compressor]) -> None:
        self._choose = choose

    def encode(self, body: bytes, content_type: str) -> tuple[str, bytes]:
        strategy = self._choose(content_type)
        return strategy.name, strategy.compress(body)


writer = ResponseWriter(lambda ct: BY_CONTENT_TYPE.get(ct, Identity()))
encoding, payload = writer.encode(b"<p>hello</p>" * 100, "text/html")
print(encoding, len(payload))

# The same idea with a plain function as the strategy:
deflate: Callable[[bytes], bytes] = lambda data: zlib.compress(data, 6)
```

```typescript
import { gzipSync } from "node:zlib";

interface Compressor {
  // The Strategy interface.
  readonly name: string;
  compress(data: Uint8Array): Uint8Array;
}

class Gzip implements Compressor {
  // Configured strategy: a class earns its keep here.
  readonly name = "gzip";
  constructor(private readonly level = 6) {}
  compress(data: Uint8Array) {
    return gzipSync(data, { level: this.level });
  }
}

const identity: Compressor = { name: "identity", compress: (data) => data }; // a plain object works too

// Selection lives in one table, not in the context.
const BY_CONTENT_TYPE: Record<string, Compressor> = {
  "text/html": new Gzip(9),
  "application/json": new Gzip(6),
  "image/png": identity, // already compressed: don't waste CPU
};

class ResponseWriter {
  // The Context.
  constructor(private readonly choose: (contentType: string) => Compressor) {}

  encode(body: Uint8Array, contentType: string): [string, Uint8Array] {
    const strategy = this.choose(contentType);
    return [strategy.name, strategy.compress(body)];
  }
}

const writer = new ResponseWriter((ct) => BY_CONTENT_TYPE[ct] ?? identity);
const [encoding, payload] = writer.encode(new TextEncoder().encode("<p>hello</p>".repeat(100)), "text/html");
console.log(encoding, payload.length);
```

- **Strength — algorithms are isolated and testable.** Each one can be benchmarked and tested on its own, and the context's tests just use a stub strategy.
- **Strength — runtime choice.** Per customer, per request, per experiment arm: the context is the same, and only the object it receives changes.
- **Weakness — the interface must fit every algorithm.** If one strategy needs data the others don't, the interface either grows for everyone or the context gets passed in whole.
- **Weakness — selection logic can sprawl.** The `if/elif` you removed can reappear in the selector. Keep selection data-driven, in a table, wherever possible.

**Interview question**

*Route each card payment to the cheapest provider that supports its card network and country, and fall back to the next cheapest when a provider is down. Design it with Strategy.*

There are two separate variations here, so use two strategies. Each **provider** is a strategy for *how* to charge, behind one `charge()` interface. The **routing policy** is a strategy for *which* providers to try, and in what order. It's a function from a payment to a ranked list, and you might swap "cheapest first" for "highest approval rate first" in an experiment. The fallback behaviour is itself a strategy that *composes* others: a `FallbackGateway` implements `charge()` by trying each ranked provider until one succeeds. That's the same move as `FreeOver` wrapping another rule in the crash course. The checkout only ever sees one `PaymentGateway`. Retry only on errors that mean "provider unavailable". A decline is a real answer, and retrying it elsewhere can double-charge the customer.

**Answer — provider strategies, a routing strategy, and a composite fallback**

```python
from dataclasses import dataclass
from typing import Callable, Protocol


class ProviderDown(Exception):
    """The provider couldn't be reached: safe to try another one."""


@dataclass(frozen=True)
class Payment:
    amount_cents: int
    network: str  # "visa", "amex", ...
    country: str


class Provider(Protocol):
    name: str
    fee_bps: int  # basis points
    networks: frozenset[str]
    def charge(self, payment: Payment) -> str: ...


Router = Callable[[Payment, list[Provider]], list[Provider]]


def cheapest_first(payment: Payment, providers: list[Provider]) -> list[Provider]:
    eligible = [p for p in providers if payment.network in p.networks]
    return sorted(eligible, key=lambda p: p.fee_bps)


class FallbackGateway:  # a strategy composed of strategies
    def __init__(self, providers: list[Provider], route: Router = cheapest_first) -> None:
        self._providers, self._route = providers, route

    def charge(self, payment: Payment) -> str:
        tried = []
        for provider in self._route(payment, self._providers):
            try:
                return provider.charge(payment)  # a decline raises something else and stops here
            except ProviderDown:
                tried.append(provider.name)  # only "unavailable" moves on to the next one
        raise ProviderDown(f"no provider available (tried {tried or 'none eligible'})")


@dataclass
class FakeProvider:
    name: str
    fee_bps: int
    networks: frozenset[str]
    up: bool = True

    def charge(self, payment: Payment) -> str:
        if not self.up:
            raise ProviderDown(self.name)
        return f"{self.name}:{payment.amount_cents}"


gateway = FallbackGateway([
    FakeProvider("acme", 140, frozenset({"visa", "mastercard"}), up=False),
    FakeProvider("zenpay", 175, frozenset({"visa", "amex"})),
])
print(gateway.charge(Payment(4_200, "visa", "GB")))  # acme is down, so zenpay:4200
```

```typescript
export class ProviderDown extends Error {}

interface Payment {
  amountCents: number;
  network: string;
  country: string;
}

interface Provider {
  readonly name: string;
  readonly feeBps: number;
  readonly networks: ReadonlySet<string>;
  charge(payment: Payment): Promise<string>;
}

type Router = (payment: Payment, providers: Provider[]) => Provider[];

export const cheapestFirst: Router = (payment, providers) =>
  providers.filter((p) => p.networks.has(payment.network)).sort((a, b) => a.feeBps - b.feeBps);

export class FallbackGateway {
  // A strategy composed of strategies.
  constructor(private readonly providers: Provider[], private readonly route: Router = cheapestFirst) {}

  async charge(payment: Payment): Promise<string> {
    const tried: string[] = [];
    for (const provider of this.route(payment, this.providers)) {
      try {
        return await provider.charge(payment); // a decline throws something else and stops here
      } catch (err) {
        if (!(err instanceof ProviderDown)) throw err;
        tried.push(provider.name); // only "unavailable" moves on to the next one
      }
    }
    throw new ProviderDown(`no provider available (tried ${tried.join(", ") || "none eligible"})`);
  }
}

const fake = (name: string, feeBps: number, networks: string[], up = true): Provider => ({
  name,
  feeBps,
  networks: new Set(networks),
  async charge(p) {
    if (!up) throw new ProviderDown(name);
    return `${name}:${p.amountCents}`;
  },
});

const gateway = new FallbackGateway([fake("acme", 140, ["visa", "mastercard"], false), fake("zenpay", 175, ["visa", "amex"])]);
console.log(await gateway.charge({ amountCents: 4200, network: "visa", country: "GB" })); // zenpay:4200
```

> **Warning**
>
> **A comparator is a strategy with a contract, and breaking it breaks sorting.** `items.sort((a, b) => a.price > b.price)` is a classic JavaScript bug. The callback returns `true` or `false`, which become `1` or `0` and never a negative number, so the sort gets inconsistent answers and returns a wrongly ordered array, with no error. A comparator must return negative, zero or positive, and must be *consistent*: if `a < b` and `b < c`, then `a < c`. Python avoids the trap by preferring `key=` functions. Do the same in TypeScript: `(a, b) => a.price - b.price`.

<a id="21-template-method"></a>

## 21. Template Method

- **The skeleton lives in** `a base-class method` <!-- ok -->
- **Subclasses override** `steps and hooks only` <!-- good -->
- **Control flow** `inverted: the base calls you` <!-- ok -->
- **Composition alternative** `pass the steps as functions` <!-- great -->

**Intent:** *define the skeleton of an algorithm in an operation, deferring some steps to subclasses. Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure.* The base class has one public method, the **template method**, which calls a sequence of steps. Some steps are **abstract**, and every subclass must provide them. Some are **hooks** with a default, usually doing nothing, that subclasses may override. The base class controls the *order*, the error handling and the bookkeeping, so subclasses can't get those wrong. This is inversion of control in its oldest form: you don't call the framework, the framework's template method calls your steps.

You meet it constantly. `unittest.TestCase.run` calls `setUp`, the test method and `tearDown`. Django's class-based views dispatch to `get` or `post`. A `socketserver` request handler calls `setup`, `handle` and `finish`. React class components exposed lifecycle hooks the framework called in a fixed order. Template Method is the inheritance-based relative of Strategy. Strategy varies one step by *composing* in an object. Template Method varies several steps by *overriding* methods.

> **Interactive animation:** `template-method` — rendered by the page script in the HTML version.

**Template Method — a batch job skeleton with steps and hooks**

```python
import time
from abc import ABC, abstractmethod
from typing import Any, Iterable, final


class BatchJob(ABC):
    """The skeleton: timing, per-item error isolation and reporting are fixed here."""

    @final
    def run(self) -> dict[str, int]:
        started = time.perf_counter()
        ok = failed = 0
        self.before()                          # hook
        for item in self.fetch():              # abstract step
            try:
                self.process(item)             # abstract step
                ok += 1
            except Exception as exc:
                failed += 1
                self.on_error(item, exc)       # hook
        self.after(ok, failed)                 # hook
        return {"ok": ok, "failed": failed, "ms": round((time.perf_counter() - started) * 1000)}

    @abstractmethod
    def fetch(self) -> Iterable[Any]: ...

    @abstractmethod
    def process(self, item: Any) -> None: ...

    def before(self) -> None:  # hooks: safe defaults, override if needed
        pass

    def on_error(self, item: Any, exc: Exception) -> None:
        print(f"skipped {item!r}: {exc}")

    def after(self, ok: int, failed: int) -> None:
        pass


class PriceImport(BatchJob):
    def __init__(self, rows: list[str]) -> None:
        self.rows, self.prices = rows, {}

    def fetch(self) -> Iterable[str]:
        return self.rows

    def process(self, row: str) -> None:
        sku, price = row.split(",")
        self.prices[sku] = round(float(price) * 100)

    def after(self, ok: int, failed: int) -> None:
        print(f"imported {ok} prices, {failed} rejected")


print(PriceImport(["A-1,9.99", "bad row", "B-2,4.50"]).run())
```

```typescript
export abstract class BatchJob<T> {
  // The skeleton: timing, per-item error isolation and reporting are fixed here.
  // TypeScript has no `final`; by convention, subclasses don't override run().
  async run(): Promise<{ ok: number; failed: number; ms: number }> {
    const started = performance.now();
    let ok = 0;
    let failed = 0;
    await this.before(); // hook
    for await (const item of this.fetch()) {
      // abstract step
      try {
        await this.process(item); // abstract step
        ok++;
      } catch (err) {
        failed++;
        this.onError(item, err as Error); // hook
      }
    }
    await this.after(ok, failed); // hook
    return { ok, failed, ms: Math.round(performance.now() - started) };
  }

  protected abstract fetch(): AsyncIterable<T> | Iterable<T>;
  protected abstract process(item: T): Promise<void> | void;

  // Hooks: safe defaults, override if needed.
  protected async before(): Promise<void> {}
  protected onError(item: T, err: Error): void {
    console.log(`skipped ${JSON.stringify(item)}: ${err.message}`);
  }
  protected async after(_ok: number, _failed: number): Promise<void> {}
}

class PriceImport extends BatchJob<string> {
  readonly prices = new Map<string, number>();
  constructor(private readonly rows: string[]) {
    super();
  }
  protected fetch() {
    return this.rows;
  }
  protected process(row: string) {
    const [sku, price] = row.split(",");
    if (price === undefined) throw new Error("expected sku,price");
    this.prices.set(sku, Math.round(Number(price) * 100));
  }
  protected override async after(ok: number, failed: number) {
    console.log(`imported ${ok} prices, ${failed} rejected`);
  }
}

console.log(await new PriceImport(["A-1,9.99", "bad row", "B-2,4.50"]).run());
```

- **Strength — the invariant parts can't be skipped.** Timing, error isolation and reporting happen for every job, because subclasses never write `run()`.
- **Strength — very little code per variant.** A new job is two short methods.
- **Weakness — inheritance coupling.** Subclasses depend on when and in what order hooks are called. Change the skeleton and every subclass may need checking.
- **Weakness — steps can't be mixed and matched.** A job that wants `PriceImport`'s `fetch` with another job's `process` needs yet another subclass.

**Interview question**

*Rewrite `BatchJob` using composition instead of inheritance. When is the inheritance version the better choice?*

Turn each step into a **parameter**. The skeleton becomes a function, or a small class, that takes `fetch` and `process` as functions and the hooks as optional functions with defaults. That's the "pass the steps" form, which is Strategy applied to every step. Now steps from different jobs can be combined freely, each step can be tested as a plain function, and nothing needs to subclass anything. The inheritance version is still better when the steps **share state**: a subclass's `fetch` and `process` can share fields, such as an open file or a cursor, through `self`, while separate functions would need that state threaded through them. It's also better when a framework *expects* you to subclass, so users can discover the hooks with "go to definition". Use composition when steps vary independently, and inheritance when they form one coherent unit.

**Answer — the same skeleton, with steps passed in**

```python
import time
from typing import Any, Callable, Iterable


def run_batch(
    fetch: Callable[[], Iterable[Any]],
    process: Callable[[Any], None],
    on_error: Callable[[Any, Exception], None] = lambda item, exc: print(f"skipped {item!r}: {exc}"),
) -> dict[str, int]:
    started = time.perf_counter()
    ok = failed = 0
    for item in fetch():
        try:
            process(item)
            ok += 1
        except Exception as exc:
            failed += 1
            on_error(item, exc)
    return {"ok": ok, "failed": failed, "ms": round((time.perf_counter() - started) * 1000)}


prices: dict[str, int] = {}


def store_price(row: str) -> None:
    sku, price = row.split(",")
    prices[sku] = round(float(price) * 100)


print(run_batch(lambda: ["A-1,9.99", "bad row", "B-2,4.50"], store_price))
```

```typescript
export async function runBatch<T>(
  fetch: () => Iterable<T> | AsyncIterable<T>,
  process: (item: T) => void | Promise<void>,
  onError: (item: T, err: Error) => void = (item, err) => console.log(`skipped ${JSON.stringify(item)}: ${err.message}`),
): Promise<{ ok: number; failed: number; ms: number }> {
  const started = performance.now();
  let ok = 0;
  let failed = 0;
  for await (const item of fetch()) {
    try {
      await process(item);
      ok++;
    } catch (err) {
      failed++;
      onError(item, err as Error);
    }
  }
  return { ok, failed, ms: Math.round(performance.now() - started) };
}

const prices = new Map<string, number>();
const storePrice = (row: string) => {
  const [sku, price] = row.split(",");
  if (price === undefined) throw new Error("expected sku,price");
  prices.set(sku, Math.round(Number(price) * 100));
};

console.log(await runBatch(() => ["A-1,9.99", "bad row", "B-2,4.50"], storePrice));
```

> **Warning**
>
> **Overriding the template method itself defeats the pattern.** If a subclass overrides `run()`, the guarantees, such as error isolation and timing, silently disappear for that job. In Python, mark the template with `@typing.final`, which type checkers like mypy and pyright enforce. TypeScript has no `final` keyword, so document it, and keep `run()` free of logic that subclasses might want to change. Put that logic in hooks instead. The opposite mistake is a hook that *must* call `super()` to work. If forgetting `super()` breaks the job, the base class should call that code itself, outside the hook.

<a id="22-observer"></a>

## 22. Observer

- **Notification model** `push data, or let them pull` <!-- ok -->
- **Delivery** `synchronous by default` <!-- bad -->
- **Leak-proof subscriptions** `weak refs or an unsubscribe` <!-- good -->
- **Pub/sub adds** `a broker and topics` <!-- ok -->

**Intent:** *define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.* The crash course built an event bus. Underneath it are four design decisions that every real implementation has to make on purpose.

**Push or pull.** In the *push* model, the subject sends the changed data with the notification. In the *pull* model, it sends only "something changed", and observers read what they need from the subject. Push is simpler and avoids extra calls. Pull lets each observer decide what it needs, but it can read state that has changed *again* since the notification. **Synchronous or asynchronous.** Synchronous delivery runs observers in the publisher's call stack, which is simple, ordered and debuggable, but slow observers block the publisher. Asynchronous delivery queues notifications, which decouples timing but gives up ordering guarantees and immediate errors. **Lifetime.** A subject holding strong references keeps every observer alive. That's the *lapsed listener* leak, the most common Observer bug. **Re-entrancy.** An observer that changes the subject, or publishes another event, while a notification is in progress can see half-updated state or loop forever.

Observer is in-process and direct: the subject keeps the list of observers itself. **Publish/subscribe** puts a broker in the middle with named *topics*, so publishers and subscribers don't even share a reference to each other. That's what message buses and Kafka provide across processes. RxJS-style reactive streams combine Observer with Iterator: an observable is a stream of values over time, with operators like `map` and `filter`.

> **Interactive animation:** `observer-notify` — rendered by the page script in the HTML version.

**Observer — an observable value with leak-proof subscriptions**

```python
import weakref
from typing import Callable, Generic, TypeVar

T = TypeVar("T")


class Observable(Generic[T]):
    """Holds a value; notifies observers (push model) when it changes."""

    def __init__(self, value: T) -> None:
        self._value = value
        self._functions: list[Callable[[T, T], None]] = []
        self._methods: list[weakref.WeakMethod] = []  # don't keep observer objects alive

    @property
    def value(self) -> T:
        return self._value

    def set(self, new: T) -> None:
        old, self._value = self._value, new
        if old == new:
            return  # no change, no notification
        self._methods = [ref for ref in self._methods if ref() is not None]  # drop dead observers
        for fn in [*self._functions, *(ref() for ref in self._methods)]:
            if fn is not None:
                fn(old, new)

    def subscribe(self, fn: Callable[[T, T], None]) -> Callable[[], None]:
        if hasattr(fn, "__self__"):  # a bound method: hold it weakly
            ref = weakref.WeakMethod(fn)
            self._methods.append(ref)
            return lambda: ref in self._methods and self._methods.remove(ref)
        self._functions.append(fn)
        return lambda: fn in self._functions and self._functions.remove(fn)


class PriceBadge:
    def __init__(self, price: Observable[int]) -> None:
        price.subscribe(self.render)  # weakly held: the badge can be garbage-collected

    def render(self, old: int, new: int) -> None:
        print(f"badge: {old} -> {new}")


price = Observable(999)
badge = PriceBadge(price)
stop_log = price.subscribe(lambda old, new: print(f"log: price changed by {new - old}"))
price.set(899)  # badge and log both notified
del badge  # no unsubscribe needed for the weakly held method
stop_log()
price.set(799)  # nobody is listening any more
```

```typescript
type Listener<T> = (oldValue: T, newValue: T) => void;

export class Observable<T> {
  private readonly target = new EventTarget();

  constructor(private current: T) {}

  get value(): T {
    return this.current;
  }

  set(next: T): void {
    const previous = this.current;
    if (Object.is(previous, next)) return; // no change, no notification
    this.current = next;
    this.target.dispatchEvent(new CustomEvent("change", { detail: [previous, next] }));
  }

  // Unsubscribe by aborting the signal: one AbortController can end many subscriptions at once.
  subscribe(listener: Listener<T>, signal?: AbortSignal): void {
    this.target.addEventListener(
      "change",
      (event) => {
        const [previous, next] = (event as CustomEvent<[T, T]>).detail;
        listener(previous, next);
      },
      { signal },
    );
  }
}

const price = new Observable(999);
const widgetLifetime = new AbortController(); // tied to a UI component's lifetime

price.subscribe((old, next) => console.log(`badge: ${old} -> ${next}`), widgetLifetime.signal);
price.subscribe((old, next) => console.log(`log: price changed by ${next - old}`), widgetLifetime.signal);
price.set(899); // both notified
widgetLifetime.abort(); // the component unmounts: every subscription it made ends
price.set(799); // nobody is listening any more
```

- **Strength — subjects stay ignorant of observers.** New reactions don't touch the subject, and the dependency points from the observers to the subject.
- **Strength — it composes into larger systems.** UI data binding, reactive streams, domain events and pub/sub all build on the same idea.
- **Weakness — cascades are hard to follow.** An observer that updates another observable that notifies more observers can turn one change into an avalanche nobody can trace.
- **Weakness — lifetime is everyone's problem.** Without weak references or disciplined unsubscription, observers outlive their usefulness and leak memory.

**Interview question**

*While a subject is notifying its observers, one observer publishes another event on the same bus, and another observer unsubscribes itself. What can go wrong, and how do you make dispatch safe?*

Three things go wrong with naive, re-entrant dispatch. **Ordering:** the nested event is delivered *in the middle* of the outer one, so some observers see event B before they've seen event A. **Mutation during iteration:** an observer that unsubscribes changes the list being looped over, so the next observer can be skipped, or the language raises an error. **Unbounded recursion:** two observers that each publish in response to the other loop until the stack overflows. The fix is a **dispatch queue**. `publish` appends to a queue. If no dispatch is running, it drains the queue in order, and each event is delivered to a *snapshot* of the subscribers taken when it's dispatched. Events published during dispatch wait in the queue, so every observer sees events in the order they were published. A cap on events per drain turns runaway loops into a clear error.

**Answer — a re-entrancy-safe dispatcher**

```python
from collections import deque
from typing import Callable

Handler = Callable[[str, dict], None]


class SafeBus:
    MAX_EVENTS_PER_DRAIN = 10_000

    def __init__(self) -> None:
        self._handlers: dict[str, list[Handler]] = {}
        self._queue: deque[tuple[str, dict]] = deque()
        self._draining = False

    def subscribe(self, event: str, handler: Handler) -> Callable[[], None]:
        self._handlers.setdefault(event, []).append(handler)
        return lambda: handler in self._handlers[event] and self._handlers[event].remove(handler)

    def publish(self, event: str, payload: dict) -> None:
        self._queue.append((event, payload))
        if self._draining:  # nested publish: it waits its turn
            return
        self._draining = True
        try:
            delivered = 0
            while self._queue:
                name, data = self._queue.popleft()
                for handler in list(self._handlers.get(name, [])):  # snapshot of subscribers
                    handler(name, data)
                delivered += 1
                if delivered > self.MAX_EVENTS_PER_DRAIN:
                    raise RuntimeError("event storm: observers are publishing in a loop")
        finally:
            self._draining = False
            self._queue.clear()


bus, seen = SafeBus(), []
bus.subscribe("a", lambda n, d: (seen.append("A1"), bus.publish("b", {})))
bus.subscribe("a", lambda n, d: seen.append("A2"))
bus.subscribe("b", lambda n, d: seen.append("B"))
bus.publish("a", {})
print(seen)  # ['A1', 'A2', 'B']: every observer saw A before anyone saw B
```

```typescript
type Handler = (name: string, payload: unknown) => void;

export class SafeBus {
  static readonly MAX_EVENTS_PER_DRAIN = 10_000;
  private readonly handlers = new Map<string, Handler[]>();
  private readonly queue: [string, unknown][] = [];
  private draining = false;

  subscribe(event: string, handler: Handler): () => void {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...list, handler]);
    return () => this.handlers.set(event, (this.handlers.get(event) ?? []).filter((h) => h !== handler));
  }

  publish(event: string, payload: unknown): void {
    this.queue.push([event, payload]);
    if (this.draining) return; // nested publish: it waits its turn
    this.draining = true;
    try {
      let delivered = 0;
      while (this.queue.length) {
        const [name, data] = this.queue.shift()!;
        for (const handler of [...(this.handlers.get(name) ?? [])]) handler(name, data); // snapshot
        if (++delivered > SafeBus.MAX_EVENTS_PER_DRAIN) throw new Error("event storm: observers are publishing in a loop");
      }
    } finally {
      this.draining = false;
      this.queue.length = 0;
    }
  }
}

const bus = new SafeBus();
const seen: string[] = [];
bus.subscribe("a", () => {
  seen.push("A1");
  bus.publish("b", {});
});
bus.subscribe("a", () => seen.push("A2"));
bus.subscribe("b", () => seen.push("B"));
bus.publish("a", {});
console.log(seen); // ['A1', 'A2', 'B']: every observer saw A before anyone saw B
```

> **Warning**
>
> **`weakref.ref(obj.method)` is dead the moment you create it.** Each `obj.method` access builds a *new* bound-method object, and nothing else refers to that object, so the weak reference to it is cleared immediately and the observer never fires. Use `weakref.WeakMethod(obj.method)`, which holds the instance and the function separately, as `Observable.subscribe` does. In JavaScript, prefer explicit unsubscription, such as an `AbortSignal` or a returned dispose function. `WeakRef` cleanup timing is up to the garbage collector, so code shouldn't depend on it.

<a id="23-command"></a>

## 23. Command

- **Participants** `Command · Receiver · Invoker · Client` <!-- ok -->
- **Naming** `imperative: ReserveStock` <!-- ok -->
- **Commands compose into** `macro commands` <!-- good -->
- **Across processes, send** `data, never live objects` <!-- bad -->

**Intent:** *encapsulate a request as an object, thereby letting you parameterise clients with different requests, queue or log requests, and support undoable operations.* There are four roles. The **Command** has an `execute()` method, and often `undo()`. The **Receiver** is the object that actually does the work, like a document, a wallet or an inventory. The **Invoker** triggers commands without knowing what they do: a button, a scheduler, a queue worker, an undo manager. The **Client** creates the command and connects it to its receiver. The animation shows the classic undo and redo design: two stacks, where any new command clears the redo stack. The ideas below are what you need for production systems.

**Commands versus events.** A command is a *request* that may be refused, so it's named in the imperative: `ReserveStock`, `ChargeCard`. An event is a *fact* that already happened, named in the past tense: `StockReserved`. Keeping the two apart is the backbone of CQRS and message-driven systems. **Macro commands** are Composite applied to Command: a command made of commands, executed in order. If they need to be all-or-nothing, a failure part-way through undoes the completed ones in reverse. That's a small, in-process version of the *saga* pattern. **Two ways to undo:** a command can apply an *inverse* operation, like credit after debit, or restore a *snapshot* taken before it ran (Memento, section 28). Inverses are cheap but must be exact. Snapshots are simple but cost memory.

> **Interactive animation:** `command-undo` — rendered by the page script in the HTML version.

**Command — a macro command that rolls back on failure**

```python
from typing import Protocol


class Command(Protocol):
    def execute(self) -> None: ...
    def undo(self) -> None: ...


class Wallet:  # receiver
    def __init__(self, balance: int) -> None:
        self.balance = balance

    def debit(self, amount: int) -> None:
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def credit(self, amount: int) -> None:
        self.balance += amount


class Inventory:  # receiver
    def __init__(self, stock: dict[str, int]) -> None:
        self.stock = stock

    def take(self, sku: str, qty: int) -> None:
        if self.stock.get(sku, 0) < qty:
            raise ValueError(f"out of stock: {sku}")
        self.stock[sku] -= qty

    def put_back(self, sku: str, qty: int) -> None:
        self.stock[sku] += qty


class Debit:
    def __init__(self, wallet: Wallet, amount: int) -> None:
        self.wallet, self.amount = wallet, amount

    def execute(self) -> None:
        self.wallet.debit(self.amount)

    def undo(self) -> None:
        self.wallet.credit(self.amount)  # the exact inverse


class Reserve:
    def __init__(self, inventory: Inventory, sku: str, qty: int) -> None:
        self.inventory, self.sku, self.qty = inventory, sku, qty

    def execute(self) -> None:
        self.inventory.take(self.sku, self.qty)

    def undo(self) -> None:
        self.inventory.put_back(self.sku, self.qty)


class Macro:
    """A command made of commands: all of them happen, or none do."""

    def __init__(self, *steps: Command) -> None:
        self.steps = steps
        self._done: list[Command] = []

    def execute(self) -> None:
        self._done = []
        try:
            for step in self.steps:
                step.execute()
                self._done.append(step)
        except Exception:
            self.undo()  # roll back the completed steps
            raise

    def undo(self) -> None:
        for step in reversed(self._done):
            step.undo()
        self._done = []


wallet, inventory = Wallet(50), Inventory({"A-17": 1})
purchase = Macro(Debit(wallet, 30), Reserve(inventory, "A-17", 2))  # asks for 2, only 1 in stock
try:
    purchase.execute()
except ValueError as err:
    print(err, "| balance restored to", wallet.balance)  # out of stock: A-17 | balance restored to 50
```

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Wallet {
  // Receiver.
  constructor(public balance: number) {}
  debit(amount: number) {
    if (amount > this.balance) throw new Error("insufficient funds");
    this.balance -= amount;
  }
  credit(amount: number) {
    this.balance += amount;
  }
}

class Inventory {
  // Receiver.
  constructor(private readonly stock: Map<string, number>) {}
  take(sku: string, qty: number) {
    if ((this.stock.get(sku) ?? 0) < qty) throw new Error(`out of stock: ${sku}`);
    this.stock.set(sku, this.stock.get(sku)! - qty);
  }
  putBack(sku: string, qty: number) {
    this.stock.set(sku, (this.stock.get(sku) ?? 0) + qty);
  }
}

const debit = (wallet: Wallet, amount: number): Command => ({
  execute: () => wallet.debit(amount),
  undo: () => wallet.credit(amount), // the exact inverse
});

const reserve = (inventory: Inventory, sku: string, qty: number): Command => ({
  execute: () => inventory.take(sku, qty),
  undo: () => inventory.putBack(sku, qty),
});

class Macro implements Command {
  // A command made of commands: all of them happen, or none do.
  private done: Command[] = [];
  constructor(private readonly steps: Command[]) {}

  execute(): void {
    this.done = [];
    try {
      for (const step of this.steps) {
        step.execute();
        this.done.push(step);
      }
    } catch (err) {
      this.undo(); // roll back the completed steps
      throw err;
    }
  }

  undo(): void {
    for (const step of this.done.reverse()) step.undo();
    this.done = [];
  }
}

const wallet = new Wallet(50);
const inventory = new Inventory(new Map([["A-17", 1]]));
try {
  new Macro([debit(wallet, 30), reserve(inventory, "A-17", 2)]).execute(); // asks for 2, only 1 in stock
} catch (err) {
  console.log((err as Error).message, "| balance restored to", wallet.balance); // out of stock: A-17 | ... 50
}
```

- **Strength — requests become data.** They can be queued, scheduled, logged for audit, replayed after a bug fix, or sent to another process.
- **Strength — invokers stay generic.** One undo manager, job runner or button class works for every command.
- **Weakness — two representations of every operation.** The direct method call and the command object must stay in step as the receiver evolves.
- **Weakness — rollback is only as good as the inverses.** An inverse that isn't exact, or a side effect that can't be reversed, like an email already sent, breaks all-or-nothing.

**Interview question**

*Background jobs are commands put on a queue and run by workers. The queue delivers at least once, so a job can run twice. Design the command format and the handler so retries are safe.*

First, the command on the queue must be **plain data**, never a pickled object or a closure: a type name, a schema version, the arguments as IDs and values, and a unique **command ID**. Workers look up a handler for the type in a registry. That keeps producers and consumers independent, and lets you deploy new handler code without losing queued jobs. Second, because delivery is at least once, every handler must be **idempotent**. Before doing the work, the handler records the command ID in a table with a *unique constraint*, inside the same database transaction as the work itself. A redelivered command fails that insert and is acknowledged without being run again. Third, distinguish errors: a transient failure is re-raised so the queue retries it, and a permanent one, like a validation error, goes to a dead-letter queue instead of retrying forever.

**Answer — serialisable commands with idempotent handlers**

```python
import json
import sqlite3
import uuid
from typing import Callable

HANDLERS: dict[str, Callable[[sqlite3.Connection, dict], None]] = {}


def handles(kind: str):
    def register(fn):
        HANDLERS[kind] = fn
        return fn
    return register


def make_command(kind: str, **args) -> str:  # what producers put on the queue: plain JSON
    return json.dumps({"id": str(uuid.uuid4()), "kind": kind, "version": 1, "args": args})


@handles("grant_credit")
def grant_credit(db: sqlite3.Connection, args: dict) -> None:
    db.execute("update accounts set credit = credit + ? where id = ?", (args["amount"], args["account_id"]))


def run(db: sqlite3.Connection, message: str) -> None:
    command = json.loads(message)
    with db:  # one transaction: the dedupe record and the work commit together
        try:
            db.execute("insert into processed_commands (id) values (?)", (command["id"],))
        except sqlite3.IntegrityError:
            return  # already processed: acknowledge and move on
        HANDLERS[command["kind"]](db, command["args"])


db = sqlite3.connect(":memory:")
db.executescript("""
    create table processed_commands (id text primary key);
    create table accounts (id text primary key, credit integer not null);
    insert into accounts values ('acc-1', 0);
""")
message = make_command("grant_credit", account_id="acc-1", amount=500)
run(db, message)
run(db, message)  # redelivered: safely ignored
print(db.execute("select credit from accounts").fetchone())  # (500,)
```

```typescript
import { randomUUID } from "node:crypto";

interface CommandMessage {
  id: string;
  kind: string;
  version: number;
  args: Record<string, unknown>;
}

interface Tx {
  // A database transaction: everything inside commits or rolls back together.
  insertProcessed(id: string): Promise<boolean>; // false if the id already exists (unique constraint)
  addCredit(accountId: string, amount: number): Promise<void>;
}
interface Db {
  transaction<T>(work: (tx: Tx) => Promise<T>): Promise<T>;
}

const handlers = new Map<string, (tx: Tx, args: Record<string, unknown>) => Promise<void>>();
handlers.set("grant_credit", (tx, args) => tx.addCredit(String(args.accountId), Number(args.amount)));

// What producers put on the queue: plain JSON.
export const makeCommand = (kind: string, args: Record<string, unknown>): string =>
  JSON.stringify({ id: randomUUID(), kind, version: 1, args } satisfies CommandMessage);

export async function run(db: Db, message: string): Promise<void> {
  const command = JSON.parse(message) as CommandMessage;
  const handler = handlers.get(command.kind);
  if (!handler) throw new Error(`no handler for ${command.kind}`); // permanent: dead-letter it
  await db.transaction(async (tx) => {
    // The dedupe record and the work commit together.
    if (!(await tx.insertProcessed(command.id))) return; // already processed: acknowledge and move on
    await handler(tx, command.args);
  });
}
```

> **Warning**
>
> **Commands that hold live object references can't cross a process boundary, and they go stale.** A `Debit(wallet, 30)` holding a `Wallet` object works in memory. Put it on a queue and you'd have to serialise the wallet *as it was*, and replaying it tomorrow would act on yesterday's balance. Commands that leave the process should carry **IDs and values**, like `{"wallet_id": "w-9", "amount": 30}`, and the handler should load the current state when it runs.

<a id="24-state"></a>

## 24. State

- **Two implementations** `state classes, or a table` <!-- ok -->
- **A transition table is** `data you can print and test` <!-- great -->
- **Guards and actions** `conditions and effects on arrows` <!-- ok -->
- **Booleans as state** `allow impossible combinations` <!-- bad -->

**Intent:** *allow an object to alter its behaviour when its internal state changes. The object will appear to change its class.* The GoF form uses one class per state: the object forwards each event to its current state object, and a transition replaces that object. The first interview question below builds it. The other standard implementation is a **table-driven finite state machine** (FSM). Its states and events are values, and a table maps each `(state, event)` pair to the next state. Two additions make tables practical. A **guard** is a condition that must hold for the transition to fire, like "has a payment method". An **action** is a side effect that runs when the transition fires, like "send the welcome email". Choose classes when states differ in *behaviour*. Choose a table when they mostly differ in *which transitions are allowed*. Tables are easier to visualise, review and test exhaustively.

Large machines grow two more ideas from David Harel's *statecharts*. **Hierarchical states** let a `Paused` sub-state live inside an `Active` state and inherit its transitions. **Parallel regions** model independent dimensions, like billing status and shipping status, without multiplying their states together. Libraries such as XState for TypeScript and `transitions` for Python implement them. Reach for one when a hand-written table passes about twenty transitions.

> **Interactive animation:** `state-machine` — rendered by the page script in the HTML version.

**State — a table-driven machine with guards and actions**

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable


class S(Enum):
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"


class E(Enum):
    CONVERT = "convert"
    PAYMENT_FAILED = "payment_failed"
    PAYMENT_SUCCEEDED = "payment_succeeded"
    CANCEL = "cancel"


@dataclass
class Subscription:
    id: str
    state: S = S.TRIALING
    has_card: bool = False
    log: list[str] = field(default_factory=list)


Guard = Callable[[Subscription], bool]
Action = Callable[[Subscription], None]


@dataclass(frozen=True)
class Transition:
    target: S
    guard: Guard = lambda sub: True
    action: Action = lambda sub: None


TABLE: dict[tuple[S, E], Transition] = {
    (S.TRIALING, E.CONVERT): Transition(S.ACTIVE, guard=lambda s: s.has_card, action=lambda s: s.log.append("welcome email")),
    (S.TRIALING, E.CANCEL): Transition(S.CANCELLED),
    (S.ACTIVE, E.PAYMENT_FAILED): Transition(S.PAST_DUE, action=lambda s: s.log.append("dunning email")),
    (S.ACTIVE, E.CANCEL): Transition(S.CANCELLED, action=lambda s: s.log.append("exit survey")),
    (S.PAST_DUE, E.PAYMENT_SUCCEEDED): Transition(S.ACTIVE),
    (S.PAST_DUE, E.CANCEL): Transition(S.CANCELLED),
}


class InvalidTransition(Exception):
    pass


def fire(sub: Subscription, event: E) -> None:
    transition = TABLE.get((sub.state, event))
    if transition is None:
        raise InvalidTransition(f"{event.value} is not allowed from {sub.state.value}")
    if not transition.guard(sub):
        raise InvalidTransition(f"guard failed for {event.value} from {sub.state.value}")
    transition.action(sub)
    sub.state = transition.target


sub = Subscription("sub-1", has_card=True)
for event in (E.CONVERT, E.PAYMENT_FAILED, E.PAYMENT_SUCCEEDED, E.CANCEL):
    fire(sub, event)
print(sub.state, sub.log)  # S.CANCELLED ['welcome email', 'dunning email', 'exit survey']
```

```typescript
type State = "trialing" | "active" | "past_due" | "cancelled";
type Event = "convert" | "payment_failed" | "payment_succeeded" | "cancel";

interface Subscription {
  id: string;
  state: State;
  hasCard: boolean;
  log: string[];
}

interface Transition {
  target: State;
  guard?: (sub: Subscription) => boolean;
  action?: (sub: Subscription) => void;
}

// Partial: only the legal (state, event) pairs appear. Anything missing is illegal.
const TABLE: Partial<Record<State, Partial<Record<Event, Transition>>>> = {
  trialing: {
    convert: { target: "active", guard: (s) => s.hasCard, action: (s) => s.log.push("welcome email") },
    cancel: { target: "cancelled" },
  },
  active: {
    payment_failed: { target: "past_due", action: (s) => s.log.push("dunning email") },
    cancel: { target: "cancelled", action: (s) => s.log.push("exit survey") },
  },
  past_due: {
    payment_succeeded: { target: "active" },
    cancel: { target: "cancelled" },
  },
};

export class InvalidTransition extends Error {}

export function fire(sub: Subscription, event: Event): void {
  const transition = TABLE[sub.state]?.[event];
  if (!transition) throw new InvalidTransition(`${event} is not allowed from ${sub.state}`);
  if (transition.guard && !transition.guard(sub)) throw new InvalidTransition(`guard failed for ${event} from ${sub.state}`);
  transition.action?.(sub);
  sub.state = transition.target;
}

const sub: Subscription = { id: "sub-1", state: "trialing", hasCard: true, log: [] };
for (const event of ["convert", "payment_failed", "payment_succeeded", "cancel"] as const) fire(sub, event);
console.log(sub.state, sub.log); // cancelled ['welcome email', 'dunning email', 'exit survey']
```

- **Strength — illegal moves are impossible, not just discouraged.** Every event goes through one function that checks the table, so no code path can skip the rules.
- **Strength — the machine can be inspected.** A table can be printed as a diagram, reviewed by product managers, and tested pair by pair.
- **Weakness — logic spreads into guards and actions.** If they grow large, the table gets hard to read. Keep them as named functions, not inline lambdas.
- **Weakness — flat machines explode.** Independent dimensions multiplied together give dozens of states. That's when you need hierarchy or parallel regions.

**Interview question**

*Model an order lifecycle: pending → paid → shipped → delivered. An order can be cancelled only before it ships (cancelling a paid order refunds it), and a delivered order can be refunded.*

Draw the diagram first; the code follows from it. Each state class implements only the events that are legal from that state. A base class implements every event as "reject", so an illegal move like shipping an unpaid order fails in one place with a clear message. The rule lives in the *structure*, not in an `if` someone might forget. The `Order` (the *context*) holds the current state, forwards each event to it, and exposes `status` as the state's name for storage. A lookup from name to class rebuilds the state when the order is loaded from the database.

**Answer — an order whose state decides what it can do**

```python
from __future__ import annotations


class InvalidTransition(Exception):
    pass


class OrderState:
    """Every event is illegal unless a state says otherwise."""

    name = "?"

    def pay(self, order: Order) -> None:
        self._reject("pay")

    def ship(self, order: Order, tracking: str) -> None:
        self._reject("ship")

    def deliver(self, order: Order) -> None:
        self._reject("deliver")

    def cancel(self, order: Order) -> None:
        self._reject("cancel")

    def refund(self, order: Order) -> None:
        self._reject("refund")

    def _reject(self, event: str) -> None:
        raise InvalidTransition(f"cannot {event} an order that is {self.name}")


class Pending(OrderState):
    name = "pending"

    def pay(self, order: Order) -> None:
        order.transition(Paid())

    def cancel(self, order: Order) -> None:
        order.transition(Cancelled())


class Paid(OrderState):
    name = "paid"

    def ship(self, order: Order, tracking: str) -> None:
        order.tracking = tracking
        order.transition(Shipped())

    def cancel(self, order: Order) -> None:
        order.transition(Refunded())  # cancelling after payment means refunding


class Shipped(OrderState):
    name = "shipped"

    def deliver(self, order: Order) -> None:
        order.transition(Delivered())


class Delivered(OrderState):
    name = "delivered"

    def refund(self, order: Order) -> None:
        order.transition(Refunded())


class Cancelled(OrderState):
    name = "cancelled"


class Refunded(OrderState):
    name = "refunded"


STATES = {cls.name: cls for cls in (Pending, Paid, Shipped, Delivered, Cancelled, Refunded)}


class Order:
    def __init__(self, order_id: str, status: str = "pending") -> None:
        self.id = order_id
        self.tracking: str | None = None
        self._state: OrderState = STATES[status]()  # rebuilt from the stored name
        self.history = [status]

    @property
    def status(self) -> str:
        return self._state.name

    def transition(self, new_state: OrderState) -> None:
        self._state = new_state
        self.history.append(new_state.name)

    # The context only forwards. There is no `if status == ...` anywhere.
    def pay(self) -> None:
        self._state.pay(self)

    def ship(self, tracking: str) -> None:
        self._state.ship(self, tracking)

    def deliver(self) -> None:
        self._state.deliver(self)

    def cancel(self) -> None:
        self._state.cancel(self)

    def refund(self) -> None:
        self._state.refund(self)


order = Order("A-1")
order.pay()
order.ship("1Z999")
order.cancel()  # InvalidTransition: cannot cancel an order that is shipped
```

```typescript
export class InvalidTransition extends Error {}

abstract class OrderState {
  abstract readonly name: string;

  // Every event is illegal unless a state says otherwise.
  pay(order: Order): void {
    this.reject("pay");
  }
  ship(order: Order, tracking: string): void {
    this.reject("ship");
  }
  deliver(order: Order): void {
    this.reject("deliver");
  }
  cancel(order: Order): void {
    this.reject("cancel");
  }
  refund(order: Order): void {
    this.reject("refund");
  }

  protected reject(event: string): never {
    throw new InvalidTransition(`cannot ${event} an order that is ${this.name}`);
  }
}

class Pending extends OrderState {
  readonly name = "pending";
  pay(order: Order) {
    order.transition(new Paid());
  }
  cancel(order: Order) {
    order.transition(new Cancelled());
  }
}

class Paid extends OrderState {
  readonly name = "paid";
  ship(order: Order, tracking: string) {
    order.tracking = tracking;
    order.transition(new Shipped());
  }
  cancel(order: Order) {
    order.transition(new Refunded()); // cancelling after payment means refunding
  }
}

class Shipped extends OrderState {
  readonly name = "shipped";
  deliver(order: Order) {
    order.transition(new Delivered());
  }
}

class Delivered extends OrderState {
  readonly name = "delivered";
  refund(order: Order) {
    order.transition(new Refunded());
  }
}

class Cancelled extends OrderState {
  readonly name = "cancelled";
}

class Refunded extends OrderState {
  readonly name = "refunded";
}

const STATES: Record<string, () => OrderState> = {
  pending: () => new Pending(),
  paid: () => new Paid(),
  shipped: () => new Shipped(),
  delivered: () => new Delivered(),
  cancelled: () => new Cancelled(),
  refunded: () => new Refunded(),
};

export class Order {
  tracking?: string;
  readonly history: string[];
  private state: OrderState;

  constructor(readonly id: string, status = "pending") {
    this.state = STATES[status](); // rebuilt from the stored name
    this.history = [status];
  }

  get status(): string {
    return this.state.name;
  }

  transition(next: OrderState): void {
    this.state = next;
    this.history.push(next.name);
  }

  // The context only forwards. There is no `if (status === ...)` anywhere.
  pay() { this.state.pay(this); }
  ship(tracking: string) { this.state.ship(this, tracking); }
  deliver() { this.state.deliver(this); }
  cancel() { this.state.cancel(this); }
  refund() { this.state.refund(this); }
}

const order = new Order("A-1");
order.pay();
order.ship("1Z999");
order.cancel(); // InvalidTransition: cannot cancel an order that is shipped
```

**Interview question**

*How do you test a state machine thoroughly, so that adding a transition can't silently allow something it shouldn't?*

Test **every pair**, not just the happy path. A machine with *S* states and *E* events has exactly *S × E* `(state, event)` pairs, and each one is either a specified transition or an error. Write the expected behaviour as its own small table in the test, listing only the *legal* pairs and their targets. Then loop over the full cross-product. For legal pairs, assert the new state. For everything else, assert that `InvalidTransition` is raised. Because the test enumerates the whole product, a transition added to the production table without being added to the expected table fails the build. Guards get extra cases, one with the guard true and one with it false. Generating a diagram from the table, for example as Mermaid text, gives reviewers something they can actually check.

**Answer — exhaustive pair testing**

```python
import itertools

import pytest

EXPECTED = {  # the spec, written independently of TABLE
    (S.TRIALING, E.CONVERT): S.ACTIVE,
    (S.TRIALING, E.CANCEL): S.CANCELLED,
    (S.ACTIVE, E.PAYMENT_FAILED): S.PAST_DUE,
    (S.ACTIVE, E.CANCEL): S.CANCELLED,
    (S.PAST_DUE, E.PAYMENT_SUCCEEDED): S.ACTIVE,
    (S.PAST_DUE, E.CANCEL): S.CANCELLED,
}


@pytest.mark.parametrize("state,event", list(itertools.product(S, E)))
def test_every_state_event_pair(state: S, event: E) -> None:
    sub = Subscription("t", state=state, has_card=True)
    if (state, event) in EXPECTED:
        fire(sub, event)
        assert sub.state is EXPECTED[(state, event)]
    else:
        with pytest.raises(InvalidTransition):
            fire(sub, event)


def test_convert_requires_a_card() -> None:
    with pytest.raises(InvalidTransition, match="guard"):
        fire(Subscription("t", has_card=False), E.CONVERT)


def as_mermaid() -> str:  # a diagram generated from the real table, for reviews and docs
    lines = ["stateDiagram-v2"]
    lines += [f"    {s.value} --> {t.target.value}: {e.value}" for (s, e), t in TABLE.items()]
    return "\n".join(lines)
```

```typescript
import { describe, expect, test } from "vitest";

const STATES: State[] = ["trialing", "active", "past_due", "cancelled"];
const EVENTS: Event[] = ["convert", "payment_failed", "payment_succeeded", "cancel"];

const EXPECTED: Record<string, State> = {
  // The spec, written independently of TABLE.
  "trialing/convert": "active",
  "trialing/cancel": "cancelled",
  "active/payment_failed": "past_due",
  "active/cancel": "cancelled",
  "past_due/payment_succeeded": "active",
  "past_due/cancel": "cancelled",
};

describe("subscription state machine", () => {
  const pairs = STATES.flatMap((state) => EVENTS.map((event) => [state, event] as const));

  test.each(pairs)("%s + %s", (state, event) => {
    const sub: Subscription = { id: "t", state, hasCard: true, log: [] };
    const expected = EXPECTED[`${state}/${event}`];
    if (expected) {
      fire(sub, event);
      expect(sub.state).toBe(expected);
    } else {
      expect(() => fire(sub, event)).toThrow(InvalidTransition);
    }
  });

  test("convert requires a card", () => {
    expect(() => fire({ id: "t", state: "trialing", hasCard: false, log: [] }, "convert")).toThrow(/guard/);
  });
});
```

> **Warning**
>
> **Booleans are a state machine with no rules.** An order with `is_paid`, `is_shipped` and `is_cancelled` has eight possible combinations, and most of them are nonsense: shipped but not paid, cancelled and shipped. Every one is still representable, so eventually some code path produces one. Model the lifecycle as **one** state field whose type only allows legal values: a Python `Enum`, or a TypeScript union of string literals. Use a TypeScript *discriminated union* when each state carries different data, such as a tracking number only when shipped. That makes illegal states unrepresentable, so the compiler, not a code review, rejects them.

<a id="25-chain-of-responsibility"></a>

## 25. Chain of Responsibility

- **Classic form** `handle it, or pass it on` <!-- ok -->
- **Pipeline form** `every handler takes a turn` <!-- ok -->
- **Seen in** `DOM bubbling · logging · middleware` <!-- good -->
- **Always end with** `a default handler` <!-- bad -->

**Intent:** *avoid coupling the sender of a request to its receiver by giving more than one object a chance to handle the request. Chain the receiving objects and pass the request along the chain until an object handles it.* Two forms share the name. In the **classic** GoF form, each handler holds a link to its *successor*, and either handles the request completely or passes it on. Exactly one handler deals with it. Approval hierarchies, help systems and fallback resolvers work this way. In the **pipeline** form, which is what middleware uses, every handler gets a turn, can change the request or response, and *may* stop the chain early. This section builds the classic form first, then the pipeline form with error handling.

You've used both without naming them. DOM events **bubble**: a click is offered to the target element, then its parent, and so on up to the document, and any listener can call `stopPropagation()`. Python's `logging` passes each record up the logger hierarchy, from `app.payments` to `app` to the root logger, offering it to each logger's handlers along the way. Exception handling is a chain too: an exception travels up the call stack until a frame with a matching `except` or `catch` takes responsibility.

> **Interactive animation:** `middleware-chain` — rendered by the page script in the HTML version.

**Chain of Responsibility — expense approvals with successors**

```python
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class Expense:
    employee: str
    amount: Decimal
    category: str


class Approver:
    def __init__(self, name: str, limit: Decimal, successor: Approver | None = None) -> None:
        self.name, self.limit, self.successor = name, limit, successor

    def handle(self, expense: Expense) -> str:
        if self.can_approve(expense):
            return f"approved by {self.name}"
        if self.successor is None:  # the end of the chain must decide something
            return f"rejected: nobody may approve {expense.amount}"
        return self.successor.handle(expense)

    def can_approve(self, expense: Expense) -> bool:
        return expense.amount <= self.limit


class FinanceDirector(Approver):
    def can_approve(self, expense: Expense) -> bool:  # handlers can apply their own rules
        return expense.category != "gifts" and super().can_approve(expense)


def build_chain() -> Approver:
    board = Approver("the board", Decimal("1_000_000"))
    director = FinanceDirector("finance director", Decimal("50_000"), board)
    manager = Approver("manager", Decimal("5_000"), director)
    return Approver("team lead", Decimal("500"), manager)


chain = build_chain()
print(chain.handle(Expense("ana", Decimal("120"), "travel")))      # approved by team lead
print(chain.handle(Expense("ana", Decimal("12_000"), "travel")))   # approved by finance director
print(chain.handle(Expense("ana", Decimal("12_000"), "gifts")))    # approved by the board
```

```typescript
interface Expense {
  employee: string;
  amountPence: number;
  category: string;
}

class Approver {
  constructor(
    readonly name: string,
    protected readonly limitPence: number,
    private readonly successor?: Approver,
  ) {}

  handle(expense: Expense): string {
    if (this.canApprove(expense)) return `approved by ${this.name}`;
    if (!this.successor) return `rejected: nobody may approve ${expense.amountPence}`; // the end must decide
    return this.successor.handle(expense);
  }

  protected canApprove(expense: Expense): boolean {
    return expense.amountPence <= this.limitPence;
  }
}

class FinanceDirector extends Approver {
  protected override canApprove(expense: Expense): boolean {
    return expense.category !== "gifts" && super.canApprove(expense); // handlers can apply their own rules
  }
}

function buildChain(): Approver {
  const board = new Approver("the board", 100_000_000);
  const director = new FinanceDirector("finance director", 5_000_000, board);
  const manager = new Approver("manager", 500_000, director);
  return new Approver("team lead", 50_000, manager);
}

const chain = buildChain();
console.log(chain.handle({ employee: "ana", amountPence: 12_000, category: "travel" })); // approved by team lead
console.log(chain.handle({ employee: "ana", amountPence: 1_200_000, category: "travel" })); // approved by finance director
console.log(chain.handle({ employee: "ana", amountPence: 1_200_000, category: "gifts" })); // approved by the board
```

- **Strength — the sender doesn't know the receiver.** Callers submit to the head of the chain. Who handles the request is a property of the chain, which can be rearranged without touching callers.
- **Strength — each handler has one rule.** Adding a "travel desk" approver is one new link, not an edit to a nested `if`.
- **Weakness — no guarantee anyone handles it.** Without an explicit final handler, requests can fall off the end silently.
- **Weakness — hard to see who acted.** Debugging means walking the chain. Log which handler took responsibility.

**Interview question**

*In Express, an error thrown in any middleware skips the remaining normal middleware and goes to error-handling middleware. Implement that behaviour in a small pipeline.*

The pipeline has **two kinds of handler**. Express tells them apart by arity: a function with four parameters, `(err, req, res, next)`, is an error handler. The runner walks the list with an index, and *what it's carrying* decides which kind runs next. While there's no error, it calls only normal handlers and skips error handlers. When a normal handler throws, or passes an error to `next`, the runner switches to carrying that error. From then on it skips normal handlers and offers the error to error handlers, each of which can either respond or pass it on. If the error reaches the end of the chain, a final default handler turns it into a 500, so nothing is ever silently swallowed. The version below makes the two kinds explicit instead of counting parameters.

**Answer — a pipeline with an error-handling lane**

```python
from typing import Callable

Request = dict
Response = dict
Next = Callable[..., Response]  # next() continues; next(err) switches to the error lane
Handler = Callable[[Request, Next], Response]
ErrorHandler = Callable[[Exception, Request, Next], Response]


def pipeline(normal: list[Handler], errors: list[ErrorHandler]) -> Callable[[Request], Response]:
    def handle(request: Request) -> Response:
        def run_normal(i: int) -> Response:
            if i >= len(normal):
                return {"status": 404, "body": "not found"}
            try:
                return normal[i](request, lambda err=None: run_errors(0, err) if err else run_normal(i + 1))
            except Exception as raised:
                return run_errors(0, raised)  # a throw joins the error lane

        def run_errors(i: int, err: Exception) -> Response:
            if i >= len(errors):
                return {"status": 500, "body": "internal error"}  # the default at the end
            try:
                return errors[i](err, request, lambda passed=None: run_errors(i + 1, passed or err))
            except Exception as raised:
                return run_errors(i + 1, raised)

        return run_normal(0)

    return handle


def parse_json(req: Request, nxt: Next) -> Response:
    if req.get("body") == "{bad":
        raise ValueError("malformed JSON")
    return nxt()


def endpoint(req: Request, nxt: Next) -> Response:
    return {"status": 200, "body": "ok"}


def bad_request(err: Exception, req: Request, nxt: Next) -> Response:
    if isinstance(err, ValueError):
        return {"status": 400, "body": str(err)}
    return nxt(err)  # not mine: pass it along the error lane


app = pipeline([parse_json, endpoint], [bad_request])
print(app({"body": "{}"}))      # {'status': 200, 'body': 'ok'}
print(app({"body": "{bad"}))    # {'status': 400, 'body': 'malformed JSON'}
```

```typescript
type Req = { body?: string };
type Res = { status: number; body: string };
type Next = (err?: Error) => Res;
type Handler = (req: Req, next: Next) => Res;
type ErrorHandler = (err: Error, req: Req, next: Next) => Res;

export function pipeline(normal: Handler[], errors: ErrorHandler[]) {
  return (req: Req): Res => {
    const runNormal = (i: number): Res => {
      if (i >= normal.length) return { status: 404, body: "not found" };
      try {
        return normal[i](req, (err) => (err ? runErrors(0, err) : runNormal(i + 1)));
      } catch (err) {
        return runErrors(0, err as Error); // a throw joins the error lane
      }
    };
    const runErrors = (i: number, err: Error): Res => {
      if (i >= errors.length) return { status: 500, body: "internal error" }; // default at the end
      try {
        return errors[i](err, req, (next) => runErrors(i + 1, next ?? err));
      } catch (thrown) {
        return runErrors(i + 1, thrown as Error);
      }
    };
    return runNormal(0);
  };
}

const parseJson: Handler = (req, next) => {
  if (req.body === "{bad") throw new SyntaxError("malformed JSON");
  return next();
};
const endpoint: Handler = () => ({ status: 200, body: "ok" });
const badRequest: ErrorHandler = (err, _req, next) =>
  err instanceof SyntaxError ? { status: 400, body: err.message } : next(err); // not mine: pass it on

const app = pipeline([parseJson, endpoint], [badRequest]);
console.log(app({ body: "{}" })); // { status: 200, body: 'ok' }
console.log(app({ body: "{bad" })); // { status: 400, body: 'malformed JSON' }
```

> **Warning**
>
> **In Python's `logging`, the chain causes duplicate log lines.** Records *propagate* up the logger hierarchy and are offered to every logger's handlers on the way. If you add a handler to `logging.getLogger("app.payments")` *and* the root logger has one, every payment message is printed twice. Either attach handlers only at the root, which is the usual approach, or set `propagate = False` on the logger that has its own handler. More generally, any chain where several handlers may act needs a clear rule about whether a handler that acts also stops the request.

<a id="26-iterator"></a>

## 26. Iterator & Generators

- **Python protocol** `__iter__ · __next__ · StopIteration` <!-- ok -->
- **JavaScript protocol** `[Symbol.iterator] · next() → {value, done}` <!-- ok -->
- **Generators are** `iterators written as functions` <!-- great -->
- **A generator can be consumed** `exactly once` <!-- bad -->

**Intent:** *provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.* The collection might be an array, a linked list, a tree, a paginated API or a file larger than memory, and the consumer shouldn't care. An **external iterator** is an object the consumer drives, asking for the next element when it wants one. An **internal iterator** takes a function and applies it to every element itself, like `forEach`. External iterators are more flexible: you can stop early, interleave two of them, or pass one around.

Both languages build Iterator into their syntax. In Python, `for` calls `iter(obj)`, which calls `__iter__`, and then calls `__next__` until it raises `StopIteration`. In JavaScript, `for...of` calls `obj[Symbol.iterator]()` and then `next()` until it returns `{ done: true }`. Writing those classes by hand means managing state between calls. **Generators** remove that work. A function containing `yield` returns an iterator whose state is the function's own paused stack frame. Generators make iteration **lazy**: each value is computed only when the consumer asks for it, so pipelines over huge or infinite sources use constant memory and stop as soon as the consumer stops. Async generators (`async def ... yield`, `async function*`) extend the idea to values that arrive over time, consumed with `async for` and `for await`.

> **Interactive animation:** `iterator-lazy` — rendered by the page script in the HTML version.

**Iterator — the same tree traversal as a class and as a generator**

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterator


@dataclass
class Node:
    key: int
    left: Node | None = None
    right: Node | None = None


class InOrderIterator:
    """An external iterator written by hand: the state is an explicit stack."""

    def __init__(self, root: Node | None) -> None:
        self._stack: list[Node] = []
        self._push_left(root)

    def _push_left(self, node: Node | None) -> None:
        while node is not None:
            self._stack.append(node)
            node = node.left

    def __iter__(self) -> InOrderIterator:
        return self

    def __next__(self) -> int:
        if not self._stack:
            raise StopIteration
        node = self._stack.pop()
        self._push_left(node.right)
        return node.key


def in_order(node: Node | None) -> Iterator[int]:
    """The same traversal as a generator: the paused frame keeps the state."""
    if node is not None:
        yield from in_order(node.left)
        yield node.key
        yield from in_order(node.right)


class Tree:  # the aggregate: callers iterate without seeing nodes at all
    def __init__(self, root: Node | None) -> None:
        self.root = root

    def __iter__(self) -> Iterator[int]:
        return InOrderIterator(self.root)


tree = Tree(Node(8, Node(3, Node(1), Node(6)), Node(10, None, Node(14))))
print(list(tree))                       # [1, 3, 6, 8, 10, 14]
print(list(in_order(tree.root)))        # the same, from the generator
print(next(k for k in tree if k > 5))   # 6: stops early, the rest is never visited
```

```typescript
interface TreeNode {
  key: number;
  left?: TreeNode;
  right?: TreeNode;
}

class InOrderIterator implements Iterator<number> {
  // An external iterator written by hand: the state is an explicit stack.
  private readonly stack: TreeNode[] = [];

  constructor(root?: TreeNode) {
    this.pushLeft(root);
  }

  private pushLeft(node?: TreeNode): void {
    for (; node; node = node.left) this.stack.push(node);
  }

  next(): IteratorResult<number> {
    const node = this.stack.pop();
    if (!node) return { done: true, value: undefined };
    this.pushLeft(node.right);
    return { done: false, value: node.key };
  }
}

// The same traversal as a generator: the paused frame keeps the state.
function* inOrder(node?: TreeNode): Generator<number> {
  if (!node) return;
  yield* inOrder(node.left);
  yield node.key;
  yield* inOrder(node.right);
}

class Tree implements Iterable<number> {
  // The aggregate: callers iterate without seeing nodes at all.
  constructor(private readonly root?: TreeNode) {}
  [Symbol.iterator](): Iterator<number> {
    return new InOrderIterator(this.root);
  }
}

const tree = new Tree({ key: 8, left: { key: 3, left: { key: 1 }, right: { key: 6 } }, right: { key: 10, right: { key: 14 } } });
console.log([...tree]); // [1, 3, 6, 8, 10, 14]
console.log([...inOrder({ key: 2, left: { key: 1 }, right: { key: 3 } })]); // [1, 2, 3]
for (const key of tree) {
  if (key > 5) {
    console.log(key); // 6: stops early, the rest is never visited
    break;
  }
}
```

- **Strength — consumers don't depend on representation.** Swap a list for a tree, a database cursor or an API and `for` loops don't change.
- **Strength — laziness.** Values are produced on demand, so huge or infinite sequences are fine, and stopping early saves the rest of the work.
- **Weakness — one pass, in one direction.** Most iterators can't rewind or be reused. Code that needs two passes must buffer the values or ask for a new iterator.
- **Weakness — laziness moves errors.** A generator's body runs when it's *consumed*, not when it's *created*, so an exception surfaces far from the line that built the pipeline.

**Interview question**

*An API returns customers 100 per page with a `next_cursor`. Write an iterator that yields customers one at a time, fetches pages only when needed, and stops making requests as soon as the consumer stops.*

A generator is the right tool, because the pagination state, the current cursor, becomes ordinary local variables. Loop: fetch a page, `yield` each customer, and if the response has no `next_cursor`, return. Because generators are lazy, a consumer that breaks out after 30 customers causes exactly **one** request, and pages that are never needed are never fetched. In TypeScript, use an *async generator* consumed with `for await`. The fetch happens at the `await`, and breaking out of the loop calls the generator's `return()`, which ends it cleanly. Add a guard against cursors that repeat, because a buggy API can otherwise send you into an infinite loop.

**Answer — lazy pagination**

```python
from typing import Iterator


class FakeApi:  # stands in for an HTTP client
    def __init__(self, total: int) -> None:
        self.total, self.requests = total, 0

    def list_customers(self, cursor: int | None, limit: int = 100) -> dict:
        self.requests += 1
        start = cursor or 0
        items = [{"id": f"c-{i}"} for i in range(start, min(start + limit, self.total))]
        next_cursor = start + limit if start + limit < self.total else None
        return {"items": items, "next_cursor": next_cursor}


def all_customers(api: FakeApi) -> Iterator[dict]:
    cursor, seen = None, set()
    while True:
        page = api.list_customers(cursor)
        yield from page["items"]
        cursor = page["next_cursor"]
        if cursor is None:
            return
        if cursor in seen:  # a buggy API must not loop us forever
            raise RuntimeError(f"cursor {cursor} repeated")
        seen.add(cursor)


api = FakeApi(total=1_000)
for customer in all_customers(api):
    if customer["id"] == "c-30":
        break
print(api.requests)  # 1: the other nine pages were never requested
```

```typescript
interface Page {
  items: { id: string }[];
  nextCursor?: string;
}

export async function* allCustomers(fetchPage: (cursor?: string) => Promise<Page>): AsyncGenerator<{ id: string }> {
  let cursor: string | undefined;
  const seen = new Set<string>();
  do {
    const page = await fetchPage(cursor); // runs only when the consumer asks for more
    yield* page.items;
    cursor = page.nextCursor;
    if (cursor && seen.has(cursor)) throw new Error(`cursor ${cursor} repeated`); // a buggy API must not loop us forever
    if (cursor) seen.add(cursor);
  } while (cursor);
}

let requests = 0;
const fakeApi = async (cursor?: string): Promise<Page> => {
  requests++;
  const start = Number(cursor ?? 0);
  const items = Array.from({ length: 100 }, (_, i) => ({ id: `c-${start + i}` }));
  return { items, nextCursor: start + 100 < 1000 ? String(start + 100) : undefined };
};

for await (const customer of allCustomers(fakeApi)) {
  if (customer.id === "c-30") break; // calls the generator's return(): it stops cleanly
}
console.log(requests); // 1: the other nine pages were never requested
```

> **Warning**
>
> **Generators are one-shot.** `customers = all_customers(api)`, then `len(list(customers))`, then a `for` loop over `customers` again: the second pass sees nothing, with no error, because the generator is already exhausted. The same is true of `map`, `filter` and `zip` objects in Python, and of any JavaScript generator. Either materialise once with `list(...)`, or return an *iterable* object whose `__iter__` or `[Symbol.iterator]` creates a fresh iterator each time, like `Tree` above. A related trap: changing a collection while iterating it. Python raises `RuntimeError: dictionary changed size during iteration`, and lists silently skip elements, so iterate over a copy.

<a id="27-mediator"></a>

## 27. Mediator

- **Links between N peers** `N, not N(N − 1) / 2` <!-- great -->
- **What each peer knows** `only the mediator` <!-- great -->
- **Direction of talk** `two-way, through the hub` <!-- ok -->
- **The risk** `a god mediator` <!-- bad -->

**Intent:** *define an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly, and lets you vary their interaction independently.* Picture a checkout form. Changing the country must update the postcode validation, the shipping options and the tax line. Choosing express shipping must recalculate the total and maybe the delivery date. If every widget talks directly to every other one, five widgets need up to ten links, every widget has to know about the others, and none of them can be reused on another form. With a mediator, each widget knows exactly one thing: *tell the mediator when I change*. The mediator holds the rules about who reacts to what.

Air-traffic control is the textbook analogy: planes talk to the tower, never to each other. In software, a chat room routes messages between users. A dialog controller coordinates form fields. A UI framework's *lifted state*, or a central store, coordinates components. MediatR in .NET dispatches requests to handlers in-process. Compared with its neighbours: **Observer** is one-to-many broadcasting where the subject doesn't know its listeners. **Facade** is one-way, because the subsystem doesn't know the facade exists. **Mediator** is many-to-many coordination, where the peers do know the mediator and talk *to* it.

> **Interactive animation:** `mediator-hub` — rendered by the page script in the HTML version.

**Mediator — a checkout form whose fields only talk to the hub**

```python
from __future__ import annotations

from typing import Protocol


class Mediator(Protocol):
    def changed(self, sender: Field, event: str) -> None: ...


class Field:
    def __init__(self, mediator: Mediator, name: str, value: str = "") -> None:
        self._mediator, self.name, self.value = mediator, name, value
        self.error = ""

    def set(self, value: str) -> None:
        self.value = value
        self._mediator.changed(self, "changed")  # the only thing a field knows


class CheckoutForm:  # the mediator: all the "who reacts to what" lives here
    RATES = {"GB": 0.20, "DE": 0.19, "US": 0.0}
    SHIPPING = {"GB": ["standard", "express"], "DE": ["standard"], "US": ["standard", "express", "overnight"]}

    def __init__(self) -> None:
        self.country = Field(self, "country", "GB")
        self.postcode = Field(self, "postcode")
        self.shipping = Field(self, "shipping", "standard")
        self.options: list[str] = self.SHIPPING["GB"]
        self.tax_rate = self.RATES["GB"]

    def changed(self, sender: Field, event: str) -> None:
        if sender is self.country:
            self.options = self.SHIPPING.get(sender.value, ["standard"])
            if self.shipping.value not in self.options:
                self.shipping.value = self.options[0]  # set quietly: no event loop
            self.tax_rate = self.RATES.get(sender.value, 0.0)
            self._validate_postcode()
        elif sender is self.postcode:
            self._validate_postcode()

    def _validate_postcode(self) -> None:
        rules = {"GB": lambda p: 5 <= len(p.replace(" ", "")) <= 7, "US": lambda p: p.isdigit() and len(p) == 5}
        valid = rules.get(self.country.value, lambda p: bool(p))(self.postcode.value)
        self.postcode.error = "" if valid else f"not a valid {self.country.value} postcode"


form = CheckoutForm()
form.shipping.set("express")
form.country.set("DE")  # express isn't offered in DE: shipping falls back, tax changes
print(form.shipping.value, form.tax_rate, form.options)  # standard 0.19 ['standard']
form.country.set("US")
form.postcode.set("SW1A 1AA")
print(form.postcode.error)  # not a valid US postcode
```

```typescript
interface Mediator {
  changed(sender: Field, event: string): void;
}

class Field {
  error = "";
  constructor(private readonly mediator: Mediator, readonly name: string, public value = "") {}

  set(value: string): void {
    this.value = value;
    this.mediator.changed(this, "changed"); // the only thing a field knows
  }
}

const RATES: Record<string, number> = { GB: 0.2, DE: 0.19, US: 0 };
const SHIPPING: Record<string, string[]> = { GB: ["standard", "express"], DE: ["standard"], US: ["standard", "express", "overnight"] };
const POSTCODE_RULES: Record<string, (p: string) => boolean> = {
  GB: (p) => p.replace(/ /g, "").length >= 5 && p.replace(/ /g, "").length <= 7,
  US: (p) => /^\d{5}$/.test(p),
};

class CheckoutForm implements Mediator {
  // The mediator: all the "who reacts to what" lives here.
  readonly country = new Field(this, "country", "GB");
  readonly postcode = new Field(this, "postcode");
  readonly shipping = new Field(this, "shipping", "standard");
  options = SHIPPING.GB;
  taxRate = RATES.GB;

  changed(sender: Field): void {
    if (sender === this.country) {
      this.options = SHIPPING[sender.value] ?? ["standard"];
      if (!this.options.includes(this.shipping.value)) this.shipping.value = this.options[0]; // set quietly: no event loop
      this.taxRate = RATES[sender.value] ?? 0;
      this.validatePostcode();
    } else if (sender === this.postcode) {
      this.validatePostcode();
    }
  }

  private validatePostcode(): void {
    const valid = (POSTCODE_RULES[this.country.value] ?? ((p: string) => p.length > 0))(this.postcode.value);
    this.postcode.error = valid ? "" : `not a valid ${this.country.value} postcode`;
  }
}

const form = new CheckoutForm();
form.shipping.set("express");
form.country.set("DE"); // express isn't offered in DE: shipping falls back, tax changes
console.log(form.shipping.value, form.taxRate, form.options); // standard 0.19 ['standard']
form.country.set("US");
form.postcode.set("SW1A 1AA");
console.log(form.postcode.error); // not a valid US postcode
```

- **Strength — peers become reusable.** A `Field` knows nothing about countries or tax, so it works on any form.
- **Strength — interaction rules live in one place.** "What happens when the country changes" is answered by reading one method.
- **Weakness — the mediator centralises complexity.** It doesn't remove the rules, it gathers them, and a busy form's mediator can become the hardest class in the codebase.
- **Weakness — event loops.** A mediator that updates a peer, which notifies the mediator, which updates the peer... Update peers quietly, or guard against re-entrancy.

**Interview question**

*Your checkout mediator's `changed()` method is now 400 lines of `if sender is ...` branches. How do you keep a mediator manageable?*

Keep the mediator's *role*, being the only place that knows about interactions, but stop writing the interactions as one long method. Turn each interaction into a small, named **rule** that declares *what it listens to* and *what it does*, and make the mediator a dispatcher over a table of rules. A new interaction then becomes a new rule, which is open/closed applied to the mediator itself. Each rule can be tested alone by firing one event at a form. The dispatcher also becomes the natural place for loop protection: track which rules are running, and refuse to re-enter one. If the rules start forming chains of their own, that's a sign the form has a lifecycle, and a state machine (section 24) may describe it better.

**Answer — a rule-table mediator**

```python
from collections import defaultdict
from typing import Callable

Rule = Callable[["RuleForm"], None]


class RuleForm:
    def __init__(self) -> None:
        self.values: dict[str, str] = {"country": "GB", "shipping": "standard", "postcode": ""}
        self.derived: dict[str, object] = {}
        self._rules: dict[str, list[Rule]] = defaultdict(list)
        self._running: set[Rule] = set()

    def on(self, field: str):  # declare what a rule listens to
        def register(rule: Rule) -> Rule:
            self._rules[field].append(rule)
            return rule
        return register

    def set(self, field: str, value: str) -> None:
        self.values[field] = value
        for rule in self._rules[field]:
            if rule in self._running:  # loop protection lives in one place
                continue
            self._running.add(rule)
            try:
                rule(self)
            finally:
                self._running.discard(rule)


form = RuleForm()


@form.on("country")
def shipping_options(f: RuleForm) -> None:
    options = {"DE": ["standard"]}.get(f.values["country"], ["standard", "express"])
    f.derived["options"] = options
    if f.values["shipping"] not in options:
        f.set("shipping", options[0])


@form.on("country")
def tax_rate(f: RuleForm) -> None:
    f.derived["tax_rate"] = {"GB": 0.20, "DE": 0.19}.get(f.values["country"], 0.0)


form.set("shipping", "express")
form.set("country", "DE")
print(form.values["shipping"], form.derived)  # standard {'options': ['standard'], 'tax_rate': 0.19}
```

```typescript
type Rule = (form: RuleForm) => void;

export class RuleForm {
  readonly values: Record<string, string> = { country: "GB", shipping: "standard", postcode: "" };
  readonly derived: Record<string, unknown> = {};
  private readonly rules = new Map<string, Rule[]>();
  private readonly running = new Set<Rule>();

  on(field: string, rule: Rule): this {
    // Declare what a rule listens to.
    this.rules.set(field, [...(this.rules.get(field) ?? []), rule]);
    return this;
  }

  set(field: string, value: string): void {
    this.values[field] = value;
    for (const rule of this.rules.get(field) ?? []) {
      if (this.running.has(rule)) continue; // loop protection lives in one place
      this.running.add(rule);
      try {
        rule(this);
      } finally {
        this.running.delete(rule);
      }
    }
  }
}

const shippingOptions: Rule = (f) => {
  const options = f.values.country === "DE" ? ["standard"] : ["standard", "express"];
  f.derived.options = options;
  if (!options.includes(f.values.shipping)) f.set("shipping", options[0]);
};
const taxRate: Rule = (f) => {
  f.derived.taxRate = ({ GB: 0.2, DE: 0.19 } as Record<string, number>)[f.values.country] ?? 0;
};

const form = new RuleForm().on("country", shippingOptions).on("country", taxRate);
form.set("shipping", "express");
form.set("country", "DE");
console.log(form.values.shipping, form.derived); // standard { options: ['standard'], taxRate: 0.19 }
```

> **Tip**
>
> Use a mediator when **several peers interact in both directions** and you want them reusable. Don't use one to put a single relationship behind a hub. If only one object ever reacts to another, a direct call or an Observer subscription is simpler and easier to follow. A mediator is worth it when the alternative is a web of objects that all import each other.

<a id="28-memento"></a>

## 28. Memento

- **Participants** `Originator · Memento · Caretaker` <!-- ok -->
- **The memento is** `opaque to all but its originator` <!-- great -->
- **The cost** `memory per snapshot` <!-- bad -->
- **Cheap snapshots come from** `immutable, shared state` <!-- good -->

**Intent:** *without violating encapsulation, capture and externalise an object's internal state so that the object can be restored to this state later.* There are three roles. The **Originator** is the object whose state matters, like an editor, a game or a form. It can create a snapshot, `save()`, and restore one, `restore(m)`. The **Memento** is the snapshot. The key rule is that it's *opaque*: only the originator can read what's inside. The **Caretaker**, such as an undo history, a checkpoint store or a "discard changes" button, holds mementos and hands them back, but never looks inside. That opacity is the pattern's whole point. The history can be generic, and the originator can change its internals without breaking the history code.

Memento and Command (section 23) are the two ways to implement undo. Commands store the *operation* and must know its exact inverse. Mementos store the *state* and just put it back, so they need no inverse logic, but they cost memory for every snapshot. The memory cost largely disappears with **immutable state**. If each edit produces a new state that *shares* the unchanged parts with the old one, a snapshot is just a reference to the old state. Persistent data structures and Redux-style immutable updates work this way, and so does "time-travel" debugging in front-end tools.

> **Interactive animation:** `memento-history` — rendered by the page script in the HTML version.

**Memento — an editor with opaque snapshots and a bounded history**

```python
from __future__ import annotations

from collections import deque
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class _EditorSnapshot:  # the memento: frozen, and private by convention
    text: str
    cursor: int
    selection: tuple[int, int] | None


class Editor:  # the originator
    def __init__(self) -> None:
        self._text, self._cursor = "", 0
        self._selection: tuple[int, int] | None = None

    def type(self, s: str) -> None:
        self._text = self._text[: self._cursor] + s + self._text[self._cursor :]
        self._cursor += len(s)

    def select(self, start: int, end: int) -> None:
        self._selection = (start, end)

    def save(self) -> object:  # callers get an opaque object
        return _EditorSnapshot(self._text, self._cursor, self._selection)

    def restore(self, memento: object) -> None:
        if not isinstance(memento, _EditorSnapshot):
            raise TypeError("not a snapshot from this editor")
        self._text, self._cursor, self._selection = memento.text, memento.cursor, memento.selection

    def __repr__(self) -> str:
        return f"Editor({self._text!r}, cursor={self._cursor})"


class History:  # the caretaker: stores snapshots, never looks inside
    def __init__(self, editor: Editor, limit: int = 100) -> None:
        self._editor = editor
        self._undo: deque[object] = deque(maxlen=limit)  # oldest snapshots fall off the end

    def checkpoint(self) -> None:
        self._undo.append(self._editor.save())

    def undo(self) -> None:
        if self._undo:
            self._editor.restore(self._undo.pop())


editor = Editor()
history = History(editor, limit=50)
history.checkpoint()
editor.type("Hello")
history.checkpoint()
editor.type(", world")
print(editor)  # Editor('Hello, world', cursor=12)
history.undo()
print(editor)  # Editor('Hello', cursor=5)
```

```typescript
class EditorSnapshot {
  // The memento: fields are #private, so only code in this file can read them.
  readonly #text: string;
  readonly #cursor: number;
  constructor(text: string, cursor: number) {
    this.#text = text;
    this.#cursor = cursor;
  }
  static read(s: EditorSnapshot): { text: string; cursor: number } {
    return { text: s.#text, cursor: s.#cursor };
  }
}

export type Memento = { readonly __brand: "EditorMemento" }; // what callers see: nothing usable

export class Editor {
  // The originator.
  private text = "";
  private cursor = 0;

  type(s: string): void {
    this.text = this.text.slice(0, this.cursor) + s + this.text.slice(this.cursor);
    this.cursor += s.length;
  }

  save(): Memento {
    return new EditorSnapshot(this.text, this.cursor) as unknown as Memento;
  }

  restore(memento: Memento): void {
    if (!(memento instanceof EditorSnapshot)) throw new TypeError("not a snapshot from this editor");
    ({ text: this.text, cursor: this.cursor } = EditorSnapshot.read(memento));
  }

  toString(): string {
    return `Editor(${JSON.stringify(this.text)}, cursor=${this.cursor})`;
  }
}

export class History {
  // The caretaker: stores snapshots, never looks inside.
  private readonly undoStack: Memento[] = [];
  constructor(private readonly editor: Editor, private readonly limit = 100) {}

  checkpoint(): void {
    this.undoStack.push(this.editor.save());
    if (this.undoStack.length > this.limit) this.undoStack.shift(); // oldest snapshots fall off
  }

  undo(): void {
    const memento = this.undoStack.pop();
    if (memento) this.editor.restore(memento);
  }
}

const editor = new Editor();
const history = new History(editor, 50);
history.checkpoint();
editor.type("Hello");
history.checkpoint();
editor.type(", world");
console.log(String(editor)); // Editor("Hello, world", cursor=12)
history.undo();
console.log(String(editor)); // Editor("Hello", cursor=5)
```

- **Strength — encapsulation survives.** The history stores and returns snapshots without depending on the editor's fields, so those fields can change freely.
- **Strength — restore is trivially correct.** There's no inverse logic to get wrong, because the old state is simply put back.
- **Weakness — memory.** A snapshot per keystroke of a large document is expensive unless state is shared, so bound the history and checkpoint at sensible moments.
- **Weakness — external state isn't captured.** A snapshot restores the object, not the email it sent or the file it wrote.

**Interview question**

*Your design tool snapshots the whole document, 50 MB, before every change, and memory runs out after a few hundred edits. How do you keep snapshot-based undo without copying everything?*

Make the document **immutable and structurally shared**. Instead of editing the document in place and copying it to snapshot it, every edit creates a *new* document value that **reuses every part that didn't change**. Move one shape on one page, and the new document is a new root, a new page and a new shape list, all pointing at the same objects as the old document for everything else. A snapshot is then just *a reference to the previous root*: constant time to take, and its memory cost is only the parts that actually changed. Undo means swapping the root reference back. This is how persistent data structures, Git's trees and Redux-style stores make history cheap. Bound the history anyway, and checkpoint per *user action* rather than per mouse-move event.

**Answer — snapshots as references to immutable states**

```python
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Shape:
    id: str
    x: int
    y: int


@dataclass(frozen=True)
class Page:
    name: str
    shapes: tuple[Shape, ...]


@dataclass(frozen=True)
class Document:
    pages: tuple[Page, ...]


def move(doc: Document, page_i: int, shape_id: str, dx: int, dy: int) -> Document:
    page = doc.pages[page_i]
    shapes = tuple(replace(s, x=s.x + dx, y=s.y + dy) if s.id == shape_id else s for s in page.shapes)
    pages = doc.pages[:page_i] + (replace(page, shapes=shapes),) + doc.pages[page_i + 1 :]
    return Document(pages)  # untouched pages and shapes are the SAME objects as before


v1 = Document(tuple(Page(f"p{i}", tuple(Shape(f"s{j}", j, j) for j in range(1000))) for i in range(50)))
history = [v1]  # a snapshot is just a reference
v2 = move(v1, 3, "s7", 10, 0)
history.append(v2)

print(v2.pages[0] is v1.pages[0])                    # True: other pages are shared
print(v2.pages[3].shapes[8] is v1.pages[3].shapes[8])  # True: even unchanged shapes on the edited page
print(v2.pages[3].shapes[7].x)                       # 17
```

```typescript
interface Shape {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}
interface Page {
  readonly name: string;
  readonly shapes: readonly Shape[];
}
interface Doc {
  readonly pages: readonly Page[];
}

function move(doc: Doc, pageIndex: number, shapeId: string, dx: number, dy: number): Doc {
  const page = doc.pages[pageIndex];
  const shapes = page.shapes.map((s) => (s.id === shapeId ? { ...s, x: s.x + dx, y: s.y + dy } : s));
  const pages = doc.pages.map((p, i) => (i === pageIndex ? { ...page, shapes } : p));
  return { pages }; // untouched pages and shapes are the SAME objects as before
}

const v1: Doc = {
  pages: Array.from({ length: 50 }, (_, i) => ({
    name: `p${i}`,
    shapes: Array.from({ length: 1000 }, (_, j) => ({ id: `s${j}`, x: j, y: j })),
  })),
};
const history: Doc[] = [v1]; // a snapshot is just a reference
const v2 = move(v1, 3, "s7", 10, 0);
history.push(v2);

console.log(v2.pages[0] === v1.pages[0]); // true: other pages are shared
console.log(v2.pages[3].shapes[8] === v1.pages[3].shapes[8]); // true: even unchanged shapes on the edited page
console.log(v2.pages[3].shapes[7].x); // 17
```

> **Warning**
>
> **A snapshot that holds mutable objects isn't a snapshot.** If `save()` stores `self._lines` (a list) instead of a copy, every later edit to the list also edits the "saved" state, and undo restores the present instead of the past. Either copy the mutable parts deeply enough when saving, or make the state immutable so that sharing is safe. The `frozen=True` dataclass and `readonly` interfaces above exist precisely to make this mistake hard to write.

<a id="29-visitor"></a>

## 29. Visitor

- **Adding an operation** `one new visitor` <!-- great -->
- **Adding an element type** `edit every visitor` <!-- bad -->
- **Mechanism** `double dispatch` <!-- ok -->
- **Modern alternative** `matching on a closed union` <!-- good -->

**Intent:** *represent an operation to be performed on the elements of an object structure. Visitor lets you define a new operation without changing the classes of the elements on which it operates.* Take a syntax tree with `Num`, `Add` and `Mul` nodes. You want many operations over it: evaluate, pretty-print, type-check, optimise, compile. Putting every operation as a method on every node class scatters each operation across all the classes, and every new operation edits all of them. Visitor turns that around. Each operation becomes one **visitor** class with a method per node type (`visit_num`, `visit_add`), and each node gets one generic method, `accept(visitor)`, that calls the right one.

The mechanism is **double dispatch**. Which code runs depends on *two* runtime types: the node's and the visitor's. A method call normally dispatches on one type, the receiver. So `node.accept(v)` dispatches on the node's type, and inside, `v.visit_add(self)` dispatches on the visitor's. This is a deliberate trade, and it has a name: the **expression problem**, which Philip Wadler named in 1998. Object-oriented classes make it easy to add *types* and hard to add *operations*. Visitor makes it easy to add *operations* and hard to add *types*. Real tools pick Visitor when the node types are fixed and the operations keep growing. Python's `ast.NodeVisitor` dispatches to `visit_` plus the class name, and Babel and ESLint plugins are visitors keyed by node type.

> **Interactive animation:** `visitor-dispatch` — rendered by the page script in the HTML version.

**Visitor — two operations over one expression tree**

```python
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Generic, TypeVar

R = TypeVar("R")


class Visitor(ABC, Generic[R]):
    @abstractmethod
    def visit_num(self, node: Num) -> R: ...
    @abstractmethod
    def visit_var(self, node: Var) -> R: ...
    @abstractmethod
    def visit_add(self, node: Add) -> R: ...
    @abstractmethod
    def visit_mul(self, node: Mul) -> R: ...


class Expr(ABC):
    @abstractmethod
    def accept(self, visitor: Visitor[R]) -> R: ...


@dataclass(frozen=True)
class Num(Expr):
    value: float
    def accept(self, v: Visitor[R]) -> R:
        return v.visit_num(self)  # second dispatch: on the visitor


@dataclass(frozen=True)
class Var(Expr):
    name: str
    def accept(self, v: Visitor[R]) -> R:
        return v.visit_var(self)


@dataclass(frozen=True)
class Add(Expr):
    left: Expr
    right: Expr
    def accept(self, v: Visitor[R]) -> R:
        return v.visit_add(self)


@dataclass(frozen=True)
class Mul(Expr):
    left: Expr
    right: Expr
    def accept(self, v: Visitor[R]) -> R:
        return v.visit_mul(self)


class Evaluate(Visitor[float]):  # operation 1: no node class was edited to add it
    def __init__(self, env: dict[str, float]) -> None:
        self.env = env
    def visit_num(self, n: Num) -> float:
        return n.value
    def visit_var(self, n: Var) -> float:
        return self.env[n.name]
    def visit_add(self, n: Add) -> float:
        return n.left.accept(self) + n.right.accept(self)
    def visit_mul(self, n: Mul) -> float:
        return n.left.accept(self) * n.right.accept(self)


class Show(Visitor[str]):  # operation 2
    def visit_num(self, n: Num) -> str:
        return f"{n.value:g}"
    def visit_var(self, n: Var) -> str:
        return n.name
    def visit_add(self, n: Add) -> str:
        return f"({n.left.accept(self)} + {n.right.accept(self)})"
    def visit_mul(self, n: Mul) -> str:
        return f"{n.left.accept(self)} * {n.right.accept(self)}"


expr = Add(Num(2), Mul(Var("x"), Num(3)))  # 2 + x * 3
print(expr.accept(Show()), "=", expr.accept(Evaluate({"x": 4})))  # (2 + x * 3) = 14.0
```

```typescript
interface Visitor<R> {
  visitNum(node: Num): R;
  visitVar(node: Var): R;
  visitAdd(node: Add): R;
  visitMul(node: Mul): R;
}

interface Expr {
  accept<R>(visitor: Visitor<R>): R;
}

class Num implements Expr {
  constructor(readonly value: number) {}
  accept<R>(v: Visitor<R>): R {
    return v.visitNum(this); // second dispatch: on the visitor
  }
}
class Var implements Expr {
  constructor(readonly name: string) {}
  accept<R>(v: Visitor<R>): R {
    return v.visitVar(this);
  }
}
class Add implements Expr {
  constructor(readonly left: Expr, readonly right: Expr) {}
  accept<R>(v: Visitor<R>): R {
    return v.visitAdd(this);
  }
}
class Mul implements Expr {
  constructor(readonly left: Expr, readonly right: Expr) {}
  accept<R>(v: Visitor<R>): R {
    return v.visitMul(this);
  }
}

class Evaluate implements Visitor<number> {
  // Operation 1: no node class was edited to add it.
  constructor(private readonly env: Record<string, number>) {}
  visitNum = (n: Num) => n.value;
  visitVar = (n: Var) => this.env[n.name];
  visitAdd = (n: Add): number => n.left.accept(this) + n.right.accept(this);
  visitMul = (n: Mul): number => n.left.accept(this) * n.right.accept(this);
}

class Show implements Visitor<string> {
  // Operation 2.
  visitNum = (n: Num) => String(n.value);
  visitVar = (n: Var) => n.name;
  visitAdd = (n: Add): string => `(${n.left.accept(this)} + ${n.right.accept(this)})`;
  visitMul = (n: Mul): string => `${n.left.accept(this)} * ${n.right.accept(this)}`;
}

const expr = new Add(new Num(2), new Mul(new Var("x"), new Num(3))); // 2 + x * 3
console.log(expr.accept(new Show()), "=", expr.accept(new Evaluate({ x: 4 }))); // (2 + x * 3) = 14
```

- **Strength — operations are cohesive.** Everything about evaluation is in `Evaluate`, and a new analysis is one new class that touches no node.
- **Strength — visitors can accumulate state.** A type-checker or code generator carries its context (scopes, output buffer) in the visitor while walking the tree.
- **Weakness — new element types are expensive.** Adding `Neg` means a new method on the visitor interface *and* in every existing visitor.
- **Weakness — elements must expose their insides.** Visitors read node fields directly, so the nodes can't keep much encapsulated.

**Interview question**

*You add a `Neg` (unary minus) node. Show what has to change in the Visitor design, and compare it with a closed union plus pattern matching. Which do modern Python and TypeScript favour?*

In the Visitor design, you add the `Neg` class with an `accept`, add `visit_neg` to the `Visitor` interface, and then implement it in **every** visitor. The type checker flags each visitor that's missing the method, which is the pattern's safety net. With a **closed union**, such as a TypeScript discriminated union or a Python union of dataclasses, an operation is just a function with a `switch` or `match` over the node type, and there's no `accept` at all. Adding `Neg` means adding it to the union, and an **exhaustiveness check** makes the compiler list every operation that hasn't handled it. That's `never` in TypeScript, or `typing.assert_never` with mypy or pyright in Python. You get the same safety net with less ceremony, and plain data nodes. Modern code in both languages favours the union-plus-match form. Classic Visitor is still useful when the element hierarchy is open to plugins, or when you need to dispatch on classes you don't own.

**Answer — the closed-union version, with an exhaustiveness check**

```python
from __future__ import annotations

from dataclasses import dataclass
from typing import assert_never


@dataclass(frozen=True)
class Num:
    value: float


@dataclass(frozen=True)
class Var:
    name: str


@dataclass(frozen=True)
class Add:
    left: Expr
    right: Expr


@dataclass(frozen=True)
class Neg:  # the new node type
    operand: Expr


Expr = Num | Var | Add | Neg


def evaluate(e: Expr, env: dict[str, float]) -> float:
    match e:
        case Num(value):
            return value
        case Var(name):
            return env[name]
        case Add(left, right):
            return evaluate(left, env) + evaluate(right, env)
        case Neg(operand):  # delete this case and mypy/pyright flag assert_never below
            return -evaluate(operand, env)
        case _:
            assert_never(e)


print(evaluate(Add(Num(2), Neg(Var("x"))), {"x": 5}))  # -3.0
```

```typescript
type Expr =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "add"; left: Expr; right: Expr }
  | { kind: "neg"; operand: Expr }; // the new node type

function assertNever(x: never): never {
  throw new Error(`unhandled node: ${JSON.stringify(x)}`);
}

export function evaluate(e: Expr, env: Record<string, number>): number {
  switch (e.kind) {
    case "num":
      return e.value;
    case "var":
      return env[e.name];
    case "add":
      return evaluate(e.left, env) + evaluate(e.right, env);
    case "neg": // delete this case and the compiler rejects assertNever(e) below
      return -evaluate(e.operand, env);
    default:
      return assertNever(e);
  }
}

console.log(evaluate({ kind: "add", left: { kind: "num", value: 2 }, right: { kind: "neg", operand: { kind: "var", name: "x" } } }, { x: 5 })); // -3
```

> **Tip**
>
> Choose by **which axis changes more often**. If new *kinds of thing* arrive regularly and the operations are few, keep behaviour on the classes, which is ordinary polymorphism. If the kinds are stable and new *operations* keep arriving, which is typical of compilers, linters, serialisers and report generators, use Visitor or a closed union with pattern matching. Getting this choice wrong is what makes a codebase feel like every change touches twenty files.

<a id="30-interpreter"></a>

## 30. Interpreter

- **Each grammar rule becomes** `one class` <!-- ok -->
- **Good for** `small, stable languages` <!-- great -->
- **Bad for** `anything general-purpose` <!-- bad -->
- **Never** `eval() a user's string` <!-- bad -->

**Intent:** *given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences in the language.* Some problems are best solved with a tiny language: feature-flag rules (`plan == "pro" and seats > 5`), search filters, pricing rules, alert conditions, routing expressions. Interpreter maps each **grammar rule** to a class. *Terminal* expressions, like a comparison or a literal, evaluate directly. *Non-terminal* expressions, like `and`, `or` and `not`, combine their children. A sentence is a tree of those objects, an **abstract syntax tree** (AST), and evaluating it is a recursive `evaluate(context)` call down the tree. The structure is Composite, and adding operations over the tree is Visitor's job.

GoF Interpreter covers the AST and its evaluation. A real feature also needs a **parser** that turns text into the tree. For small grammars, a hand-written *recursive-descent* parser, with one function per grammar rule, is short, fast and produces clear error messages. The pattern stops scaling when the language grows: hundreds of grammar rules, performance needs and good diagnostics call for parser generators, bytecode and a real compiler pipeline. Keep Interpreter for languages small enough to describe on one page.

```text
rule  := or
or    := and ("or" and)*
and   := not ("and" not)*
not   := "not" not | atom
atom  := "(" rule ")" | FIELD OP VALUE
OP    := == | != | > | >= | < | <=
VALUE := number | "string" | true | false

plan == "pro" and (seats > 5 or not trial)   →   And(Cmp(plan == "pro"), Or(Cmp(seats > 5), Not(Cmp(trial == true))))
```

> **Interactive animation:** `interpreter-eval` — rendered by the page script in the HTML version.

**Interpreter — the rule language's AST and its evaluation**

```python
import operator
from dataclasses import dataclass
from typing import Any, Protocol

OPS = {"==": operator.eq, "!=": operator.ne, ">": operator.gt, ">=": operator.ge, "<": operator.lt, "<=": operator.le}


class Rule(Protocol):
    def evaluate(self, ctx: dict[str, Any]) -> bool: ...


@dataclass(frozen=True)
class Cmp:  # terminal expression
    field: str
    op: str
    value: Any

    def evaluate(self, ctx: dict[str, Any]) -> bool:
        if self.field not in ctx:
            return False  # unknown attributes never match
        return OPS[self.op](ctx[self.field], self.value)


@dataclass(frozen=True)
class And:  # non-terminal expressions
    left: Rule
    right: Rule

    def evaluate(self, ctx: dict[str, Any]) -> bool:
        return self.left.evaluate(ctx) and self.right.evaluate(ctx)  # short-circuits


@dataclass(frozen=True)
class Or:
    left: Rule
    right: Rule

    def evaluate(self, ctx: dict[str, Any]) -> bool:
        return self.left.evaluate(ctx) or self.right.evaluate(ctx)


@dataclass(frozen=True)
class Not:
    operand: Rule

    def evaluate(self, ctx: dict[str, Any]) -> bool:
        return not self.operand.evaluate(ctx)


rule = And(Cmp("plan", "==", "pro"), Or(Cmp("seats", ">", 5), Not(Cmp("trial", "==", True))))
print(rule.evaluate({"plan": "pro", "seats": 3, "trial": False}))  # True: not on trial
print(rule.evaluate({"plan": "pro", "seats": 3, "trial": True}))   # False
```

```typescript
type Ctx = Record<string, string | number | boolean>;
type Op = "==" | "!=" | ">" | ">=" | "<" | "<=";

const OPS: Record<Op, (a: any, b: any) => boolean> = {
  "==": (a, b) => a === b,
  "!=": (a, b) => a !== b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
};

export interface Rule {
  evaluate(ctx: Ctx): boolean;
}

export class Cmp implements Rule {
  // Terminal expression.
  constructor(readonly field: string, readonly op: Op, readonly value: string | number | boolean) {}
  evaluate(ctx: Ctx): boolean {
    return this.field in ctx && OPS[this.op](ctx[this.field], this.value); // unknown attributes never match
  }
}

export class And implements Rule {
  // Non-terminal expressions.
  constructor(readonly left: Rule, readonly right: Rule) {}
  evaluate(ctx: Ctx) {
    return this.left.evaluate(ctx) && this.right.evaluate(ctx); // short-circuits
  }
}
export class Or implements Rule {
  constructor(readonly left: Rule, readonly right: Rule) {}
  evaluate(ctx: Ctx) {
    return this.left.evaluate(ctx) || this.right.evaluate(ctx);
  }
}
export class Not implements Rule {
  constructor(readonly operand: Rule) {}
  evaluate(ctx: Ctx) {
    return !this.operand.evaluate(ctx);
  }
}

const rule = new And(new Cmp("plan", "==", "pro"), new Or(new Cmp("seats", ">", 5), new Not(new Cmp("trial", "==", true))));
console.log(rule.evaluate({ plan: "pro", seats: 3, trial: false })); // true: not on trial
console.log(rule.evaluate({ plan: "pro", seats: 3, trial: true })); // false
```

- **Strength — rules become data.** Product managers can edit `plan == "pro" and seats > 5` in an admin screen without a deployment, and the rules can be stored, versioned and audited.
- **Strength — easy to extend the grammar.** A new operator, like `in`, is one new class and one parser branch.
- **Weakness — tree-walking is slow.** That's fine for rules evaluated thousands of times a second, but not for a general-purpose language running hot loops.
- **Weakness — a language is forever.** Once users have written rules, every grammar change must stay backwards-compatible. Design the grammar carefully before shipping it.

**Interview question**

*Let product managers write feature-flag rules like `plan == "pro" and seats > 5`. Someone suggests evaluating them with `eval`. Explain why not, and write the parser that turns the text into the AST above.*

`eval` executes **arbitrary code** in your process. A "rule" like `__import__("os").system("...")` would run with your service's permissions. Restricting the globals doesn't fix it, because Python's object model lets determined input escape any sandbox you build around `eval`. JavaScript's `eval` and `new Function` have the same problem. A dedicated parser for a **tiny grammar** is safer by construction, because it can only ever produce the node types you defined. It's also *better*: it can validate field names against an allow-list, report errors with positions, and cap length and depth. The parser has two parts. A **tokenizer** uses one regular expression to split the text into tokens. Then a **recursive-descent parser** has one function per grammar rule, and the precedence (`not` binds tighter than `and`, which binds tighter than `or`) comes from which function calls which.

**Answer — tokenizer and recursive-descent parser**

```python
import re
from typing import Any

TOKEN = re.compile(r'\s*(?:(\d+(?:\.\d+)?)|"([^"]*)"|(==|!=|>=|<=|>|<)|(\(|\))|([A-Za-z_]\w*))')
ALLOWED_FIELDS = {"plan", "seats", "trial", "country"}


def tokenize(text: str) -> list[tuple[str, Any]]:
    if len(text) > 500:
        raise ValueError("rule too long")
    tokens, pos = [], 0
    while pos < len(text.rstrip()):
        m = TOKEN.match(text, pos)
        if not m:
            raise ValueError(f"unexpected character at {pos}: {text[pos:pos + 10]!r}")
        number, string, op, paren, word = m.groups()
        if number is not None:
            tokens.append(("value", float(number) if "." in number else int(number)))
        elif string is not None:
            tokens.append(("value", string))
        elif op:
            tokens.append(("op", op))
        elif paren:
            tokens.append((paren, paren))
        elif word in ("and", "or", "not"):
            tokens.append((word, word))
        elif word in ("true", "false"):
            tokens.append(("value", word == "true"))
        else:
            tokens.append(("field", word))
        pos = m.end()
    return tokens


class Parser:
    def __init__(self, text: str) -> None:
        self.tokens, self.i, self.depth = tokenize(text), 0, 0

    def parse(self) -> Rule:
        rule = self.or_()
        if self.i != len(self.tokens):
            raise ValueError(f"unexpected {self.tokens[self.i][1]!r}")
        return rule

    def peek(self) -> str | None:
        return self.tokens[self.i][0] if self.i < len(self.tokens) else None

    def take(self, kind: str) -> Any:
        if self.peek() != kind:
            raise ValueError(f"expected {kind}, found {self.peek() or 'end of rule'}")
        self.i += 1
        return self.tokens[self.i - 1][1]

    def or_(self) -> Rule:
        rule = self.and_()
        while self.peek() == "or":
            self.take("or")
            rule = Or(rule, self.and_())
        return rule

    def and_(self) -> Rule:
        rule = self.not_()
        while self.peek() == "and":
            self.take("and")
            rule = And(rule, self.not_())
        return rule

    def not_(self) -> Rule:
        if self.peek() == "not":
            self.take("not")
            return Not(self.not_())
        return self.atom()

    def atom(self) -> Rule:
        if self.peek() == "(":
            self.depth += 1
            if self.depth > 20:
                raise ValueError("rule nested too deeply")
            self.take("(")
            rule = self.or_()
            self.take(")")
            self.depth -= 1
            return rule
        field = self.take("field")
        if field not in ALLOWED_FIELDS:
            raise ValueError(f"unknown field {field!r}")
        return Cmp(field, self.take("op"), self.take("value"))


rule = Parser('plan == "pro" and (seats > 5 or not trial == true)').parse()
print(rule.evaluate({"plan": "pro", "seats": 3, "trial": False}))  # True
```

```typescript
type Token = { kind: "value"; value: string | number | boolean } | { kind: "op"; value: Op } | { kind: "field"; value: string } | { kind: "(" | ")" | "and" | "or" | "not" };

const TOKEN = /\s*(?:(\d+(?:\.\d+)?)|"([^"]*)"|(==|!=|>=|<=|>|<)|([()])|([A-Za-z_]\w*))/y;
const ALLOWED_FIELDS = new Set(["plan", "seats", "trial", "country"]);

export function tokenize(text: string): Token[] {
  if (text.length > 500) throw new Error("rule too long");
  const tokens: Token[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < text.trimEnd().length) {
    const at = TOKEN.lastIndex;
    const m = TOKEN.exec(text);
    if (!m) throw new Error(`unexpected character at ${at}: ${JSON.stringify(text.slice(at, at + 10))}`);
    const [, num, str, op, paren, word] = m;
    if (num !== undefined) tokens.push({ kind: "value", value: Number(num) });
    else if (str !== undefined) tokens.push({ kind: "value", value: str });
    else if (op) tokens.push({ kind: "op", value: op as Op });
    else if (paren) tokens.push({ kind: paren as "(" | ")" });
    else if (word === "and" || word === "or" || word === "not") tokens.push({ kind: word });
    else if (word === "true" || word === "false") tokens.push({ kind: "value", value: word === "true" });
    else tokens.push({ kind: "field", value: word });
  }
  return tokens;
}

export function parse(text: string): Rule {
  const tokens = tokenize(text);
  let i = 0;
  let depth = 0;
  const peek = () => tokens[i]?.kind;
  const take = <K extends Token["kind"]>(kind: K): Extract<Token, { kind: K }> => {
    if (peek() !== kind) throw new Error(`expected ${kind}, found ${peek() ?? "end of rule"}`);
    return tokens[i++] as Extract<Token, { kind: K }>;
  };
  const or = (): Rule => {
    let rule = and();
    while (peek() === "or") {
      take("or");
      rule = new Or(rule, and());
    }
    return rule;
  };
  const and = (): Rule => {
    let rule = not();
    while (peek() === "and") {
      take("and");
      rule = new And(rule, not());
    }
    return rule;
  };
  const not = (): Rule => {
    if (peek() !== "not") return atom();
    take("not");
    return new Not(not());
  };
  const atom = (): Rule => {
    if (peek() === "(") {
      if (++depth > 20) throw new Error("rule nested too deeply");
      take("(");
      const rule = or();
      take(")");
      depth--;
      return rule;
    }
    const field = take("field").value;
    if (!ALLOWED_FIELDS.has(field)) throw new Error(`unknown field ${field}`);
    return new Cmp(field, take("op").value, take("value").value);
  };
  const rule = or();
  if (i !== tokens.length) throw new Error(`unexpected token ${peek()}`);
  return rule;
}

console.log(parse('plan == "pro" and (seats > 5 or not trial == true)').evaluate({ plan: "pro", seats: 3, trial: false })); // true
```

> **Warning**
>
> **Never evaluate rule text with `eval`, `exec`, `new Function` or a template engine.** Every one of them turns "a rule an admin typed" into "code your server runs". Python's `ast.literal_eval` is safe only for literal values, like numbers, strings and lists, not for expressions with comparisons and field names. Parse a grammar you control into nodes you defined, check field names against an allow-list, and limit the rule's length and nesting depth so a hostile rule can't exhaust memory or the stack.

<a id="unit-5"></a>

## Unit 5 — Beyond the Gang of Four

Patterns that grew up after 1994, the way first-class functions change the catalogue, and the judgement to know when a pattern is making code worse: anti-patterns, refactoring toward and away from patterns, and designing for tests.

<a id="31-small-patterns"></a>

## 31. Null Object, Value Object & Specification

- **Null Object replaces** `if x is None checks` <!-- good -->
- **Value Object equality** `by value, not identity` <!-- great -->
- **Value Objects are** `immutable and self-validating` <!-- great -->
- **Specification** `business rules you can combine` <!-- ok -->

Three small patterns that appear in almost every codebase, described after the GoF book. A **Null Object** (Bobby Woolf, 1996) is an object that implements the expected interface by *doing nothing*: a logger that discards messages, a guest user with no permissions, a discount of zero. Callers stop writing `if logger is not None:` before every use, because there's always *something* to call. Python's own `logging.NullHandler` is one. It's what libraries attach so they don't print warnings when the application hasn't configured logging.

A **Value Object**, popularised by Eric Evans's *Domain-Driven Design* (2003) and by Martin Fowler, is a small **immutable** type defined entirely by its values. Two `Money(10, "GBP")` objects are *equal*, even though they're different objects, and neither can be changed. Value objects cure *primitive obsession*: passing amounts around as floats and currencies as strings, so nothing stops you adding pounds to yen. They **validate on construction**, so an invalid email address or a negative quantity can't exist at all. A **Specification** (Evans and Fowler) turns a business rule into an object with one method, `is_satisfied_by(candidate)`, plus `and`, `or` and `not` combinators. Rules become reusable, testable values that can be combined, named, and even translated into a database query.

**Value Object and Null Object — money that can't be misused, and a do-nothing discount**

```python
from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_EVEN, Decimal
from typing import Protocol


@dataclass(frozen=True)  # immutable; __eq__ and __hash__ compare by value
class Money:
    amount: Decimal
    currency: str

    def __post_init__(self) -> None:  # self-validating: invalid Money can't exist
        if len(self.currency) != 3 or not self.currency.isupper():
            raise ValueError(f"bad currency {self.currency!r}")
        object.__setattr__(self, "amount", Decimal(self.amount).quantize(Decimal("0.01"), ROUND_HALF_EVEN))

    def __add__(self, other: Money) -> Money:
        self._same_currency(other)
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: Money) -> Money:
        self._same_currency(other)
        return Money(self.amount - other.amount, self.currency)

    def times(self, factor: Decimal | int) -> Money:
        return Money(self.amount * Decimal(factor), self.currency)

    def _same_currency(self, other: Money) -> None:
        if other.currency != self.currency:
            raise ValueError(f"can't combine {self.currency} and {other.currency}")


class Discount(Protocol):
    def apply(self, price: Money) -> Money: ...


@dataclass(frozen=True)
class PercentOff:
    percent: int

    def apply(self, price: Money) -> Money:
        return price - price.times(Decimal(self.percent) / 100)


class NoDiscount:  # Null Object: a real Discount that does nothing
    def apply(self, price: Money) -> Money:
        return price


def checkout_total(price: Money, discount: Discount = NoDiscount()) -> Money:
    return discount.apply(price)  # no "if discount is not None" anywhere


assert Money(Decimal("10"), "GBP") == Money(Decimal("10.00"), "GBP")  # equal by value
print(checkout_total(Money(Decimal("80"), "GBP"), PercentOff(25)))     # Money(amount=Decimal('60.00'), currency='GBP')
print(checkout_total(Money(Decimal("80"), "GBP")))                     # unchanged
```

```typescript
export class Money {
  // Immutable; stored as integer minor units, so there are no float rounding errors.
  private constructor(readonly minor: number, readonly currency: string) {
    Object.freeze(this);
  }

  static of(amount: string, currency: string): Money {
    // Self-validating: invalid Money can't exist.
    if (!/^[A-Z]{3}$/.test(currency)) throw new Error(`bad currency ${currency}`);
    if (!/^-?\d+(\.\d{1,2})?$/.test(amount)) throw new Error(`bad amount ${amount}`);
    const [whole, frac = ""] = amount.split(".");
    const sign = whole.startsWith("-") ? -1 : 1;
    return new Money(Number(whole) * 100 + sign * Number(frac.padEnd(2, "0")), currency);
  }

  plus(other: Money): Money {
    this.sameCurrency(other);
    return new Money(this.minor + other.minor, this.currency);
  }

  minus(other: Money): Money {
    this.sameCurrency(other);
    return new Money(this.minor - other.minor, this.currency);
  }

  percent(p: number): Money {
    return new Money(Math.round((this.minor * p) / 100), this.currency);
  }

  equals(other: Money): boolean {
    // TypeScript has no operator overloading: === compares identity, so values need equals().
    return this.minor === other.minor && this.currency === other.currency;
  }

  toString(): string {
    return `${(this.minor / 100).toFixed(2)} ${this.currency}`;
  }

  private sameCurrency(other: Money): void {
    if (other.currency !== this.currency) throw new Error(`can't combine ${this.currency} and ${other.currency}`);
  }
}

interface Discount {
  apply(price: Money): Money;
}

const percentOff = (p: number): Discount => ({ apply: (price) => price.minus(price.percent(p)) });
const noDiscount: Discount = { apply: (price) => price }; // Null Object: a real Discount that does nothing

const checkoutTotal = (price: Money, discount: Discount = noDiscount) => discount.apply(price); // no null checks

console.assert(Money.of("10", "GBP").equals(Money.of("10.00", "GBP"))); // equal by value
console.log(String(checkoutTotal(Money.of("80", "GBP"), percentOff(25)))); // 60.00 GBP
console.log(String(checkoutTotal(Money.of("80", "GBP")))); // 80.00 GBP
```

- **Strength — Null Object removes defensive clutter.** One do-nothing implementation replaces dozens of `None` checks, and the "nothing" case becomes explicit and testable.
- **Strength — Value Objects make bad states unrepresentable.** Currency mismatches and invalid emails fail at construction, once, instead of everywhere they're used.
- **Weakness — Null Objects can hide real problems.** A missing configuration that silently becomes a no-op logger means you find out about it during an incident.
- **Weakness — value objects cost some ceremony.** Every boundary, such as JSON, the database or forms, needs conversion code to and from the primitive form.

**Interview question**

*A promotion applies to customers who are new or in the gold loyalty tier, and who are not in a sanctioned country. Marketing changes these rules every month. Model them so the rules can be combined, reused and tested on their own.*

Each condition is a **Specification**: an object with `is_satisfied_by(customer)`. `IsNew`, `TierAtLeast("gold")` and `CountryIn(sanctioned)` are small, separately testable classes. Combinators *compose* them, so the promotion rule is literally `(IsNew() | TierAtLeast("gold")) & ~CountryIn(SANCTIONED)`. In Python, overload `&`, `|` and `~`, the operators `pandas` and SQLAlchemy also use for combining conditions. TypeScript has no operator overloading, so use `.and()`, `.or()` and `.not()` methods. Marketing's monthly change becomes a new combination of existing specifications. Each spec can also produce a description of itself, which is useful for "why wasn't I eligible?" messages and for logs.

**Answer — composable specifications**

```python
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class Customer:
    joined: date
    tier: str
    country: str


class Spec:
    def is_satisfied_by(self, c: Customer) -> bool:
        raise NotImplementedError

    def __and__(self, other: Spec) -> Spec:
        return AllOf(self, other)

    def __or__(self, other: Spec) -> Spec:
        return AnyOf(self, other)

    def __invert__(self) -> Spec:
        return Not(self)


@dataclass(frozen=True)
class AllOf(Spec):
    a: Spec
    b: Spec

    def is_satisfied_by(self, c: Customer) -> bool:
        return self.a.is_satisfied_by(c) and self.b.is_satisfied_by(c)


@dataclass(frozen=True)
class AnyOf(Spec):
    a: Spec
    b: Spec

    def is_satisfied_by(self, c: Customer) -> bool:
        return self.a.is_satisfied_by(c) or self.b.is_satisfied_by(c)


@dataclass(frozen=True)
class Not(Spec):
    inner: Spec

    def is_satisfied_by(self, c: Customer) -> bool:
        return not self.inner.is_satisfied_by(c)


@dataclass(frozen=True)
class IsNew(Spec):
    days: int = 30

    def is_satisfied_by(self, c: Customer) -> bool:
        return date.today() - c.joined <= timedelta(days=self.days)


@dataclass(frozen=True)
class TierAtLeast(Spec):
    tier: str
    ORDER = ("basic", "silver", "gold", "platinum")

    def is_satisfied_by(self, c: Customer) -> bool:
        return self.ORDER.index(c.tier) >= self.ORDER.index(self.tier)


@dataclass(frozen=True)
class CountryIn(Spec):
    countries: frozenset[str]

    def is_satisfied_by(self, c: Customer) -> bool:
        return c.country in self.countries


SANCTIONED = frozenset({"XX", "YY"})
eligible = (IsNew() | TierAtLeast("gold")) & ~CountryIn(SANCTIONED)

print(eligible.is_satisfied_by(Customer(date(2019, 5, 1), "platinum", "GB")))  # True: gold or above
print(eligible.is_satisfied_by(Customer(date.today(), "basic", "XX")))         # False: sanctioned
```

```typescript
interface Customer {
  joined: Date;
  tier: "basic" | "silver" | "gold" | "platinum";
  country: string;
}

export class Spec {
  constructor(readonly test: (c: Customer) => boolean, readonly describe: string) {}

  isSatisfiedBy(c: Customer): boolean {
    return this.test(c);
  }
  and(other: Spec): Spec {
    return new Spec((c) => this.test(c) && other.test(c), `(${this.describe} and ${other.describe})`);
  }
  or(other: Spec): Spec {
    return new Spec((c) => this.test(c) || other.test(c), `(${this.describe} or ${other.describe})`);
  }
  not(): Spec {
    return new Spec((c) => !this.test(c), `not ${this.describe}`);
  }
}

const TIERS = ["basic", "silver", "gold", "platinum"] as const;
const isNew = (days = 30) => new Spec((c) => Date.now() - c.joined.getTime() <= days * 86_400_000, `joined in the last ${days} days`);
const tierAtLeast = (tier: Customer["tier"]) => new Spec((c) => TIERS.indexOf(c.tier) >= TIERS.indexOf(tier), `tier >= ${tier}`);
const countryIn = (countries: Set<string>) => new Spec((c) => countries.has(c.country), `country in ${[...countries].join("/")}`);

const SANCTIONED = new Set(["XX", "YY"]);
const eligible = isNew().or(tierAtLeast("gold")).and(countryIn(SANCTIONED).not());

console.log(eligible.describe); // ((joined in the last 30 days or tier >= gold) and not country in XX/YY)
console.log(eligible.isSatisfiedBy({ joined: new Date("2019-05-01"), tier: "platinum", country: "GB" })); // true
console.log(eligible.isSatisfiedBy({ joined: new Date(), tier: "basic", country: "XX" })); // false
```

> **Warning**
>
> **A Null Object is right only when "do nothing" is genuinely correct.** `NoDiscount` is fine, because no discount is a legitimate business case. A `NullPaymentGateway` returned when configuration is missing isn't: every checkout would "succeed" without charging anyone. If absence is an *error*, fail loudly at startup. If absence is a *valid choice*, model it as a Null Object. If the caller needs to *know* whether something was there, return an explicit optional value (`None`, `undefined`, a `Result`) and let the type checker force the check.

<a id="32-repository-and-unit-of-work"></a>

## 32. Repository & Unit of Work

- **A repository looks like** `an in-memory collection` <!-- great -->
- **One repository per** `aggregate, not per table` <!-- ok -->
- **A unit of work commits** `every change in one transaction` <!-- great -->
- **ORM sessions already are** `units of work` <!-- ok -->

Two patterns from Martin Fowler's *Patterns of Enterprise Application Architecture* (2002), both central to Domain-Driven Design. A **Repository** *mediates between the domain and data-mapping layers using a collection-like interface for accessing domain objects*. Domain code calls `orders.get(order_id)` and `orders.add(order)` as if the orders lived in memory. Whether they come from Postgres, DynamoDB or a dictionary in a test is the repository's business. Its query methods speak the domain's language, like `overdue_since(date)`, rather than exposing SQL or a query builder. It's dependency inversion (section 5) applied to persistence. The domain owns the repository *interface*, and infrastructure implements it.

A **Unit of Work** *maintains a list of objects affected by a business transaction and coordinates the writing out of changes*. A use case may load three objects, change two and create one. The unit of work tracks them as *new*, *dirty* or *removed*, and on `commit()` writes everything in **one database transaction**, in a safe order (inserts before the rows that reference them). If anything fails, nothing is written. It usually includes an **Identity Map**: within one unit of work, loading the same row twice returns the *same* object, so two copies can't disagree. SQLAlchemy's `Session` and Entity Framework's `DbContext` are both units of work with an identity map. Percival and Gregory's *Architecture Patterns with Python* builds both patterns from scratch and is a good next step.

> **Interactive animation:** `unit-of-work` — rendered by the page script in the HTML version.

**Repository and Unit of Work — a domain-owned interface with two implementations**

```python
from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from typing import Protocol


@dataclass
class Account:  # a domain object: knows nothing about storage
    id: str
    balance: int

    def withdraw(self, amount: int) -> None:
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount

    def deposit(self, amount: int) -> None:
        self.balance += amount


class AccountRepository(Protocol):  # owned by the domain
    def get(self, account_id: str) -> Account: ...
    def add(self, account: Account) -> None: ...


class SqliteAccountRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn
        self._identity_map: dict[str, Account] = {}  # one object per row, per unit of work
        self.seen: set[str] = set()

    def get(self, account_id: str) -> Account:
        if account_id not in self._identity_map:
            row = self._conn.execute("select id, balance from accounts where id = ?", (account_id,)).fetchone()
            if row is None:
                raise KeyError(account_id)
            self._identity_map[account_id] = Account(*row)
        self.seen.add(account_id)
        return self._identity_map[account_id]

    def add(self, account: Account) -> None:
        self._identity_map[account.id] = account
        self.seen.add(account.id)

    def flush(self) -> None:  # write every tracked object (a real UoW would track only dirty ones)
        for account in self._identity_map.values():
            self._conn.execute(
                "insert into accounts (id, balance) values (?, ?) on conflict(id) do update set balance = excluded.balance",
                (account.id, account.balance),
            )


class UnitOfWork:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def __enter__(self) -> UnitOfWork:
        self.accounts = SqliteAccountRepository(self._conn)
        return self

    def commit(self) -> None:
        self.accounts.flush()
        self._conn.commit()  # everything, or...

    def __exit__(self, exc_type, exc, tb) -> None:
        self._conn.rollback()  # ...nothing: anything not committed is discarded


def transfer(uow: UnitOfWork, source: str, target: str, amount: int) -> None:  # a use case
    with uow:
        uow.accounts.get(source).withdraw(amount)
        uow.accounts.get(target).deposit(amount)
        uow.commit()  # both balances change together, or neither does


conn = sqlite3.connect(":memory:")
conn.execute("create table accounts (id text primary key, balance integer not null)")
conn.executemany("insert into accounts values (?, ?)", [("a", 100), ("b", 0)])
conn.commit()
transfer(UnitOfWork(conn), "a", "b", 30)
print(conn.execute("select * from accounts order by id").fetchall())  # [('a', 70), ('b', 30)]
```

```typescript
export class Account {
  // A domain object: knows nothing about storage.
  constructor(readonly id: string, public balance: number) {}
  withdraw(amount: number) {
    if (amount > this.balance) throw new Error("insufficient funds");
    this.balance -= amount;
  }
  deposit(amount: number) {
    this.balance += amount;
  }
}

export interface AccountRepository {
  // Owned by the domain.
  get(id: string): Promise<Account>;
  add(account: Account): void;
}

export interface UnitOfWork {
  readonly accounts: AccountRepository;
  commit(): Promise<void>;
}

// An in-memory unit of work: the same contract, for tests and local runs.
export class InMemoryUnitOfWork implements UnitOfWork {
  private readonly pending = new Map<string, Account>(); // identity map for this unit of work
  committed = false;

  constructor(private readonly store: Map<string, { id: string; balance: number }>) {}

  readonly accounts: AccountRepository = {
    get: async (id) => {
      if (!this.pending.has(id)) {
        const row = this.store.get(id);
        if (!row) throw new Error(`no account ${id}`);
        this.pending.set(id, new Account(row.id, row.balance));
      }
      return this.pending.get(id)!;
    },
    add: (account) => void this.pending.set(account.id, account),
  };

  async commit(): Promise<void> {
    for (const a of this.pending.values()) this.store.set(a.id, { id: a.id, balance: a.balance });
    this.committed = true; // nothing reaches the store until here
  }
}

export async function transfer(uow: UnitOfWork, source: string, target: string, amount: number): Promise<void> {
  (await uow.accounts.get(source)).withdraw(amount);
  (await uow.accounts.get(target)).deposit(amount);
  await uow.commit(); // both balances change together, or neither does
}

const store = new Map([["a", { id: "a", balance: 100 }], ["b", { id: "b", balance: 0 }]]);
await transfer(new InMemoryUnitOfWork(store), "a", "b", 30);
console.log([...store.values()]); // [{ id: 'a', balance: 70 }, { id: 'b', balance: 30 }]
```

- **Strength — the domain is free of persistence.** Business rules are tested with an in-memory repository in milliseconds, with no database.
- **Strength — consistency per use case.** A unit of work makes "all or nothing" the default, rather than something each handler has to remember.
- **Weakness — another layer over the ORM.** If you already use an ORM session well, a hand-written repository and unit of work can be pure duplication.
- **Weakness — query needs leak.** Reports and search screens want flexible queries that don't fit a collection-like interface. Let them use a separate, read-only query path.

**Interview question**

*A teammate proposes a generic `Repository[T]` with `find(predicate)`, `find_all()`, `save(entity)` and `delete(entity)` for every table. Is that a good idea?*

Usually not. A generic repository looks reusable, but it gives up what makes the pattern worthwhile. First, `find(predicate)` either **leaks the query language**, so callers pass SQL fragments or ORM expressions and are coupled to the database again, or it loads everything and filters in memory, which works in tests and collapses in production. Second, "one per table" ignores **aggregates**. An `Order` and its `OrderLine`s should be loaded and saved as one unit, with one repository, so their invariants hold. Third, it exposes operations the domain shouldn't use, like deleting an order that has shipped. Prefer **one repository per aggregate**, with **intention-revealing methods** named in the domain's language. Sharing *implementation* code between repositories behind the scenes is fine. Sharing a generic *interface* isn't.

**Answer — from a generic interface to an intention-revealing one**

```python
from datetime import date
from typing import Callable, Protocol, TypeVar

T = TypeVar("T")


# Leaky: callers decide how to query, and every table looks the same.
class GenericRepository(Protocol[T]):
    def find(self, predicate: Callable[[T], bool]) -> list[T]: ...  # loads everything, or leaks SQL
    def save(self, entity: T) -> None: ...
    def delete(self, entity: T) -> None: ...  # even for orders that already shipped?


# Intention-revealing: one per aggregate, named in the domain's language.
class OrderRepository(Protocol):
    def get(self, order_id: str) -> "Order": ...  # loads the order WITH its lines
    def add(self, order: "Order") -> None: ...
    def unpaid_since(self, day: date) -> list["Order"]: ...  # implemented with an indexed query
    def for_customer(self, customer_id: str, limit: int = 20) -> list["Order"]: ...
    # no delete(): orders are cancelled through the domain, never removed
```

```typescript
// Leaky: callers decide how to query, and every table looks the same.
interface GenericRepository<T> {
  find(predicate: (entity: T) => boolean): Promise<T[]>; // loads everything, or leaks SQL
  save(entity: T): Promise<void>;
  delete(entity: T): Promise<void>; // even for orders that already shipped?
}

interface Order {
  id: string;
  customerId: string;
  lines: { sku: string; qty: number }[];
}

// Intention-revealing: one per aggregate, named in the domain's language.
interface OrderRepository {
  get(orderId: string): Promise<Order>; // loads the order WITH its lines
  add(order: Order): Promise<void>;
  unpaidSince(day: Date): Promise<Order[]>; // implemented with an indexed query
  forCustomer(customerId: string, limit?: number): Promise<Order[]>;
  // no delete(): orders are cancelled through the domain, never removed
}
```

> **Tip**
>
> **If you use an ORM, you already have a unit of work.** SQLAlchemy's `Session`, Django's transactions, Entity Framework's `DbContext` and Prisma's `$transaction` all track changes and commit them together. Wrapping them in your own repository is worth it when you need the **seam**, for fast in-memory tests of business rules or for keeping ORM types out of the domain. Don't add it by reflex. A thin repository over a good ORM is fine. A thick one that re-implements the ORM is a maintenance burden.

<a id="33-functional-patterns"></a>

## 33. Functional Patterns: When Patterns Disappear

- **Strategy, Command, Template Method** `become plain functions` <!-- great -->
- **Pipelines** `compose small functions` <!-- good -->
- **Errors as values** `Result types` <!-- ok -->
- **Architecture** `functional core, imperative shell` <!-- great -->

The crash course (section 11) showed several GoF patterns shrinking to one language feature. This section goes further: the functional *techniques* that replace patterns, and the one architectural idea that matters most. Functions can be passed and returned, so **higher-order functions** replace Strategy, Template Method and Command. **Closures** capture configuration, which replaces small single-method classes. **Partial application** pre-fills arguments, which replaces simple factories. **Composition** builds a function from functions, which replaces Decorator for functions and Chain of Responsibility for pipelines. **Immutability** makes Prototype, Memento and defensive copying largely unnecessary.

The idea with the biggest effect on design is **functional core, imperative shell**, from Gary Bernhardt's 2012 talk *Boundaries*. Put the *decisions* in pure functions: data in, data out, no I/O, no clock, no randomness. Put the *effects* (reading the database, calling APIs, sending email) in a thin outer shell that gathers inputs, calls the core and carries out what it decided. The core can be tested with plain values, millions of cases a second, with no mocks. The shell is so simple that a few integration tests cover it. It's dependency inversion with the dependency removed altogether: the core doesn't call the database through an interface, it never calls it at all.

> **Interactive animation:** `pattern-to-function` — rendered by the page script in the HTML version.

**Functional building blocks — composition and errors as values**

```python
from __future__ import annotations

import re
from dataclasses import dataclass
from functools import partial, reduce
from typing import Callable, Generic, TypeVar

A = TypeVar("A")
E = TypeVar("E")


def pipe(*fns: Callable) -> Callable:
    """pipe(f, g, h)(x) == h(g(f(x))): left-to-right composition."""
    return lambda x: reduce(lambda acc, fn: fn(acc), fns, x)


@dataclass(frozen=True)
class Ok(Generic[A]):
    value: A


@dataclass(frozen=True)
class Err(Generic[E]):
    error: E


Result = Ok[A] | Err[E]


def parse_quantity(text: str) -> Result[int, str]:
    if not text.strip().isdigit():
        return Err(f"not a number: {text!r}")
    qty = int(text)
    return Ok(qty) if 1 <= qty <= 99 else Err(f"out of range: {qty}")


def describe(result: Result[int, str]) -> str:
    match result:  # the caller must handle both cases: errors are values, not surprises
        case Ok(qty):
            return f"{qty} item(s)"
        case Err(message):
            return f"rejected ({message})"


normalise = pipe(str.strip, str.lower, partial(re.sub, r"\s+", "-"))  # partial pre-fills pattern and replacement
print(normalise("  Summer Sale  "))                                     # summer-sale
print([describe(parse_quantity(t)) for t in ("3", "0", "abc")])         # ['3 item(s)', 'rejected (out of range: 0)', ...]
```

```typescript
export const pipe =
  <T>(...fns: Array<(x: T) => T>) =>
  (x: T): T =>
    fns.reduce((acc, fn) => fn(acc), x); // left-to-right composition

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function parseQuantity(text: string): Result<number, string> {
  if (!/^\s*\d+\s*$/.test(text)) return err(`not a number: ${JSON.stringify(text)}`);
  const qty = Number(text);
  return qty >= 1 && qty <= 99 ? ok(qty) : err(`out of range: ${qty}`);
}

const describe = (r: Result<number, string>) => (r.ok ? `${r.value} item(s)` : `rejected (${r.error})`); // both cases handled

const replaceSpaces = (sep: string) => (s: string) => s.replaceAll(" ", sep); // a closure: a pre-filled function
const normalise = pipe<string>((s) => s.trim(), (s) => s.toLowerCase(), replaceSpaces("-"));
console.log(normalise("  Summer Sale  ")); // summer-sale
console.log(["3", "0", "abc"].map((t) => describe(parseQuantity(t)))); // ['3 item(s)', 'rejected (out of range: 0)', ...]
```

- **Strength — less structure for the same decoupling.** A function parameter is a seam, just as an interface is, with no extra types or classes.
- **Strength — pure cores are trivially testable.** No mocks, no setup, no clock: give it values and assert on values.
- **Weakness — composition can obscure intent.** A chain of twelve anonymous functions is harder to debug than three named steps. Name the stages.
- **Weakness — errors-as-values spread.** Once one function returns a `Result`, every caller must handle it. That's the point, but it's also friction where exceptions would be simpler.

**Interview question**

*A nightly job loads subscriptions, works out who needs a renewal reminder (7 days before renewal, unless they already got one, and never for cancelled plans), sends emails and records what it sent. It's one 150-line function full of database and email calls, and it has no tests. Restructure it.*

Split it into **decide** and **do**. The *core* is a pure function: `reminders_due(subscriptions, already_sent, today) -> list[Reminder]`. Every business rule, including the 7-day window, the "already sent" check and the cancelled-plan exclusion, lives there and takes plain data, including `today`, so tests never need to fake a clock. The *shell* is a short function that loads subscriptions and the sent log from the database, calls the core, sends each reminder, and records it. Now the rules can be tested exhaustively with plain values, the shell is too simple to hide bugs, and a "dry run" mode is just calling the core and printing its output.

**Answer — functional core, imperative shell**

```python
from dataclasses import dataclass
from datetime import date, timedelta


@dataclass(frozen=True)
class Subscription:
    id: str
    email: str
    renews_on: date
    cancelled: bool


@dataclass(frozen=True)
class Reminder:
    subscription_id: str
    email: str
    renews_on: date


# --- the functional core: pure decisions, plain data in and out -----------------
def reminders_due(subs: list[Subscription], already_sent: set[str], today: date) -> list[Reminder]:
    window_end = today + timedelta(days=7)
    return [
        Reminder(s.id, s.email, s.renews_on)
        for s in subs
        if not s.cancelled and today <= s.renews_on <= window_end and s.id not in already_sent
    ]


# --- the imperative shell: gathers inputs, calls the core, performs effects -----
def run_nightly(db, mailer, today: date | None = None) -> int:
    today = today or date.today()
    reminders = reminders_due(db.load_subscriptions(), db.load_sent_ids(), today)
    for r in reminders:
        mailer.send(r.email, f"Your plan renews on {r.renews_on:%d %B}")
        db.record_sent(r.subscription_id)
    return len(reminders)


def test_core_without_mocks() -> None:
    today = date(2026, 3, 1)
    subs = [
        Subscription("s1", "a@x.io", date(2026, 3, 5), cancelled=False),   # due
        Subscription("s2", "b@x.io", date(2026, 3, 5), cancelled=True),    # cancelled
        Subscription("s3", "c@x.io", date(2026, 3, 20), cancelled=False),  # too early
        Subscription("s4", "d@x.io", date(2026, 3, 2), cancelled=False),  # already sent
    ]
    assert [r.subscription_id for r in reminders_due(subs, {"s4"}, today)] == ["s1"]
```

```typescript
interface Subscription {
  id: string;
  email: string;
  renewsOn: string; // ISO date
  cancelled: boolean;
}
interface Reminder {
  subscriptionId: string;
  email: string;
  renewsOn: string;
}

const addDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10);

// --- the functional core: pure decisions, plain data in and out -------------
export function remindersDue(subs: Subscription[], alreadySent: Set<string>, today: string): Reminder[] {
  const windowEnd = addDays(today, 7);
  return subs
    .filter((s) => !s.cancelled && s.renewsOn >= today && s.renewsOn <= windowEnd && !alreadySent.has(s.id))
    .map((s) => ({ subscriptionId: s.id, email: s.email, renewsOn: s.renewsOn }));
}

// --- the imperative shell: gathers inputs, calls the core, performs effects --
interface Db {
  loadSubscriptions(): Promise<Subscription[]>;
  loadSentIds(): Promise<Set<string>>;
  recordSent(id: string): Promise<void>;
}
interface Mailer {
  send(to: string, text: string): Promise<void>;
}

export async function runNightly(db: Db, mailer: Mailer, today = new Date().toISOString().slice(0, 10)): Promise<number> {
  const reminders = remindersDue(await db.loadSubscriptions(), await db.loadSentIds(), today);
  for (const r of reminders) {
    await mailer.send(r.email, `Your plan renews on ${r.renewsOn}`);
    await db.recordSent(r.subscriptionId);
  }
  return reminders.length;
}

test("core without mocks", () => {
  const subs: Subscription[] = [
    { id: "s1", email: "a@x.io", renewsOn: "2026-03-05", cancelled: false }, // due
    { id: "s2", email: "b@x.io", renewsOn: "2026-03-05", cancelled: true }, // cancelled
    { id: "s3", email: "c@x.io", renewsOn: "2026-03-20", cancelled: false }, // too early
    { id: "s4", email: "d@x.io", renewsOn: "2026-03-02", cancelled: false }, // already sent
  ];
  expect(remindersDue(subs, new Set(["s4"]), "2026-03-01").map((r) => r.subscriptionId)).toEqual(["s1"]);
});
```

> **Warning**
>
> **Point-free cleverness is the functional version of pattern-itis.** `compose(map(prop("total")), filter(complement(propEq("status", "void"))), sortBy(prop("date")))` is a puzzle to anyone who didn't write it, and its stack traces point at library internals. Functional style earns its place by making *data flow* obvious. A list comprehension or a short loop over named helper functions is often clearer than a combinator chain. The aim is code that's easy to change, not code with no loops in it.

<a id="34-anti-patterns"></a>

## 34. Anti-Patterns & Over-Engineering

- **The rule of three** `abstract on the third repetition` <!-- good -->
- **YAGNI** `you aren't gonna need it` <!-- ok -->
- **Most common anti-pattern** `the god object` <!-- bad -->
- **Cheapest fix available** `delete the abstraction` <!-- great -->

An **anti-pattern** is a common response to a recurring problem that *looks* like a solution but makes things worse. The term was popularised by the 1998 book *AntiPatterns*. Patterns fail in two opposite directions. **Under-design** means one class doing everything, globals everywhere, and copy-paste instead of abstraction. **Over-design** means interfaces with one implementation, factories that build one thing, and three layers of indirection around a function call. Over-design is the one that experienced developers fall into, because every individual abstraction looks responsible. The result is code where finding the line that actually *does* something takes six "go to definition" jumps.

Two heuristics keep you between the extremes. **YAGNI**, "you aren't gonna need it" from Extreme Programming, says don't build for requirements you only imagine. Add the seam when the second case actually arrives. The **rule of three**, which Martin Fowler credits to Don Roberts in *Refactoring*, says the first time you write something, just write it. The second time, you can duplicate it, wincing. The third time, extract the abstraction, because by then you know which parts really vary.

| Anti-pattern | Symptom | Fix |
| --- | --- | --- |
| God object | one class that everything imports and every change touches | split by responsibility or actor (section 4) |
| Singleton abuse | `get_instance()` calls everywhere, tests depend on run order | dependency injection, composition root (section 12) |
| Service locator | dependencies fetched from a container inside methods | constructor injection |
| Anemic domain model | data-only classes plus "service" classes holding every rule | move behaviour next to the data it protects |
| Speculative generality | interfaces, factories and hooks for cases that don't exist | inline them; add the seam when the second case arrives |
| Poltergeist | a class that only passes calls on to another and holds nothing | delete it; call the real object |
| Yo-yo problem | understanding a method means bouncing through 6 levels of inheritance | flatten the hierarchy; prefer composition (section 6) |
| Golden hammer | the team's favourite pattern applied to every problem | choose by the problem's axis of change, not by habit |
| Lava flow | dead code and half-finished abstractions nobody dares remove | delete with tests as the safety net (section 35) |
| Pattern-itis | `AbstractPaymentStrategyFactoryProvider` | name things after the domain, not the pattern stack |

**Speculative generality — and the code the requirement actually needed**

```python
from abc import ABC, abstractmethod


# Before: four types, one factory and a provider, to send one kind of email.
class NotificationStrategy(ABC):
    @abstractmethod
    def send(self, user, message: str) -> None: ...


class EmailNotificationStrategy(NotificationStrategy):
    def __init__(self, smtp) -> None:
        self._smtp = smtp

    def send(self, user, message: str) -> None:
        self._smtp.send(user.email, message)


class NotificationStrategyFactory:
    def __init__(self, smtp) -> None:
        self._smtp = smtp

    def create(self, kind: str) -> NotificationStrategy:
        if kind == "email":
            return EmailNotificationStrategy(self._smtp)
        raise ValueError(kind)  # the only other kind that has ever existed


class NotificationStrategyFactoryProvider:
    factory: NotificationStrategyFactory | None = None

    @classmethod
    def get(cls) -> NotificationStrategyFactory:
        assert cls.factory is not None, "provider not configured"
        return cls.factory


# NotificationStrategyFactoryProvider.get().create("email").send(user, "Welcome!")


# After: what the requirement actually asks for today.
def send_welcome(smtp, user) -> None:
    smtp.send(user.email, "Welcome!")


# When SMS genuinely arrives, introduce a Notifier protocol THEN, with two real implementations.
```

```typescript
// Before: four types, one factory and a provider, to send one kind of email.
interface NotificationStrategy {
  send(user: { email: string }, message: string): Promise<void>;
}

class EmailNotificationStrategy implements NotificationStrategy {
  constructor(private readonly smtp: { send(to: string, body: string): Promise<void> }) {}
  send(user: { email: string }, message: string) {
    return this.smtp.send(user.email, message);
  }
}

class NotificationStrategyFactory {
  constructor(private readonly smtp: { send(to: string, body: string): Promise<void> }) {}
  create(kind: string): NotificationStrategy {
    if (kind === "email") return new EmailNotificationStrategy(this.smtp);
    throw new Error(kind); // the only other kind that has ever existed
  }
}

class NotificationStrategyFactoryProvider {
  static factory?: NotificationStrategyFactory;
  static get(): NotificationStrategyFactory {
    if (!this.factory) throw new Error("provider not configured");
    return this.factory;
  }
}

// await NotificationStrategyFactoryProvider.get().create("email").send(user, "Welcome!");

// After: what the requirement actually asks for today.
export const sendWelcome = (smtp: { send(to: string, body: string): Promise<void> }, user: { email: string }) =>
  smtp.send(user.email, "Welcome!");

// When SMS genuinely arrives, introduce a Notifier interface THEN, with two real implementations.
```

- **Strength — naming anti-patterns speeds up reviews.** "This is speculative generality" is a precise, impersonal comment that points straight at the fix.
- **Strength — deleting abstractions is cheap.** Inlining an unnecessary layer is usually a safe, mechanical refactoring, and it makes the code smaller.
- **Weakness — the labels can be misused.** "YAGNI" isn't an argument against *every* seam. A real second implementation, including a test fake, justifies an interface.
- **Weakness — hindsight bias.** Some abstractions look speculative until the day they're needed. Judge by evidence in the requirements, not by taste.

**Interview question**

*Your `Order` class is a bag of fields, and an `OrderService` with 2,000 lines holds every rule: adding lines, applying discounts, cancelling. A bug let someone add a line to a shipped order. What's the anti-pattern, and what does the fix look like?*

It's the **anemic domain model**, a name Martin Fowler gave it in 2003. The objects *look* like domain objects, but they have no behaviour, so nothing protects their **invariants**. Any code holding an `Order` can set `status = "cancelled"` or append to `lines` without the checks, and the bug happened because one code path skipped the service. The fix is to move each rule **next to the data it protects**. `Order` gets methods like `add_line()` and `cancel()` that enforce the rules, keeps its fields private or read-only, and *computes* derived values like the total instead of storing them. The service shrinks to coordination: load, call a domain method, save. Now there's exactly one way to add a line, and it always checks the status.

**Answer — from a bag of fields to an object that protects itself**

```python
from dataclasses import dataclass
from decimal import Decimal


# Before (anemic): any code can put the order into an invalid state.
#
# @dataclass
# class Order:
#     status: str
#     lines: list
#     total: Decimal             # stored, so it can drift from the lines
#
# class OrderService:
#     def add_line(self, order, line):
#         if order.status != "draft":
#             raise ValueError(...)  # ...but nothing forces callers to come here
#         order.lines.append(line)
#         order.total += line.price * line.qty


@dataclass(frozen=True)
class Line:
    sku: str
    qty: int
    price: Decimal


class Order:  # after: the rules live with the data
    def __init__(self, order_id: str) -> None:
        self.id = order_id
        self._status = "draft"
        self._lines: list[Line] = []

    @property
    def status(self) -> str:
        return self._status

    @property
    def lines(self) -> tuple[Line, ...]:  # read-only view: no appending from outside
        return tuple(self._lines)

    @property
    def total(self) -> Decimal:  # derived, so it can never drift
        return sum((l.price * l.qty for l in self._lines), Decimal("0"))

    def add_line(self, line: Line) -> None:
        if self._status != "draft":
            raise ValueError(f"can't add lines to a {self._status} order")
        if line.qty <= 0:
            raise ValueError("quantity must be positive")
        self._lines.append(line)

    def place(self) -> None:
        if not self._lines:
            raise ValueError("can't place an empty order")
        self._status = "placed"

    def cancel(self) -> None:
        if self._status in ("shipped", "delivered"):
            raise ValueError(f"can't cancel a {self._status} order")
        self._status = "cancelled"
```

```typescript
// Before (anemic): any code can put the order into an invalid state.
//
// interface Order { status: string; lines: Line[]; total: number }   // total stored, so it can drift
// class OrderService {
//   addLine(order: Order, line: Line) { ...check status... order.lines.push(line); order.total += ... }
// }

interface Line {
  readonly sku: string;
  readonly qty: number;
  readonly pricePence: number;
}

export class Order {
  // After: the rules live with the data.
  #status: "draft" | "placed" | "shipped" | "delivered" | "cancelled" = "draft";
  readonly #lines: Line[] = [];

  constructor(readonly id: string) {}

  get status() {
    return this.#status;
  }

  get lines(): readonly Line[] {
    return [...this.#lines]; // a copy: no pushing from outside
  }

  get total(): number {
    return this.#lines.reduce((sum, l) => sum + l.pricePence * l.qty, 0); // derived, so it can never drift
  }

  addLine(line: Line): void {
    if (this.#status !== "draft") throw new Error(`can't add lines to a ${this.#status} order`);
    if (line.qty <= 0) throw new Error("quantity must be positive");
    this.#lines.push(line);
  }

  place(): void {
    if (this.#lines.length === 0) throw new Error("can't place an empty order");
    this.#status = "placed";
  }

  cancel(): void {
    if (this.#status === "shipped" || this.#status === "delivered") throw new Error(`can't cancel a ${this.#status} order`);
    this.#status = "cancelled";
  }
}
```

> **Tip**
>
> In code review, ask **"what would break if we deleted this layer?"** If the honest answer is "nothing, we'd just call the real thing directly", the layer is speculative. Ask for it to be removed now, and re-added when a second implementation or a real variation shows up. Adding an abstraction later is rarely hard, because your tools find every call site. Living with a wrong abstraction for years is what's expensive.

<a id="35-refactoring-to-patterns"></a>

## 35. Refactoring Toward Patterns

- **Safety net first** `characterisation tests` <!-- great -->
- **Step size** `small, always green` <!-- great -->
- **The classic move** `replace conditional with polymorphism` <!-- ok -->
- **The book** `Kerievsky, 2004` <!-- ok -->

Patterns are rarely designed in on day one. Usually they're **refactored into** code that has started to hurt. Joshua Kerievsky's *Refactoring to Patterns* (2004) built on Martin Fowler's *Refactoring* by treating each pattern as a *destination*, reached through a sequence of small, behaviour-preserving steps, with the tests passing after every step. Kerievsky is equally clear about the reverse: **refactoring away from patterns**, such as inlining a singleton or collapsing a hierarchy, when a pattern no longer pays for itself.

Every refactoring starts with a **safety net**. If the code has good tests, those are it. Legacy code usually doesn't, so first you write **characterisation tests**, a term from Michael Feathers's *Working Effectively with Legacy Code*: tests that record what the code *currently* does, bugs included, so that any change in behaviour is visible. Then you change the *structure* in tiny steps, running the tests each time, and keep refactoring commits separate from commits that change behaviour.

| Smell in the code | Refactoring | Destination pattern |
| --- | --- | --- |
| a `switch` on a type code, repeated in several methods | replace conditional with polymorphism | Strategy, or State |
| a constructor with many parameters, some optional | introduce parameter object, then a builder | Builder |
| `new ConcreteThing()` scattered through the code | move creation knowledge to a factory | Factory / registry |
| optional extras tangled into a core method | move embellishment to a decorator | Decorator |
| a tree built from strings or nested dicts | replace implicit tree with composite | Composite |
| a big `if/elif` that dispatches requests by name | replace conditional dispatcher with command | Command + registry |
| a vendor API called from everywhere | wrap it, then route every call through the wrapper | Adapter |
| a singleton with one real use | inline singleton (refactoring *away*) | plain object, injected |

**Replace conditional with polymorphism — the steps, with the final result**

```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

# Before: the same switch on `method` appears in cost() AND in eta_days().
#
# def cost(method, weight):
#     if method == "standard": return Decimal("3.99") + weight * Decimal("0.5")
#     elif method == "express": return Decimal("9.99") + weight * Decimal("0.8")
#     elif method == "pickup": return Decimal("0")
#
# def eta_days(method):
#     if method == "standard": return 4
#     ...
#
# Step 1: write characterisation tests for cost() and eta_days() for every method.
# Step 2: introduce the interface, and one class per branch, copying each branch's body.
# Step 3: add a lookup from the old string to the new class (keeps every caller working).
# Step 4: make cost() and eta_days() delegate through the lookup. Run the tests.
# Step 5: migrate callers to hold a ShippingMethod object; delete the string functions.


class ShippingMethod(Protocol):
    def cost(self, weight_kg: Decimal) -> Decimal: ...
    def eta_days(self) -> int: ...


@dataclass(frozen=True)
class Standard:
    def cost(self, weight_kg: Decimal) -> Decimal:
        return Decimal("3.99") + weight_kg * Decimal("0.5")

    def eta_days(self) -> int:
        return 4


@dataclass(frozen=True)
class Express:
    def cost(self, weight_kg: Decimal) -> Decimal:
        return Decimal("9.99") + weight_kg * Decimal("0.8")

    def eta_days(self) -> int:
        return 1


@dataclass(frozen=True)
class Pickup:
    def cost(self, weight_kg: Decimal) -> Decimal:
        return Decimal("0")

    def eta_days(self) -> int:
        return 0


METHODS: dict[str, ShippingMethod] = {"standard": Standard(), "express": Express(), "pickup": Pickup()}


def cost(method: str, weight_kg: Decimal) -> Decimal:  # step 4: the old API delegates, callers unchanged
    return METHODS[method].cost(weight_kg)
```

```typescript
// Before: the same switch on `method` appears in cost() AND in etaDays().
//
// function cost(method: string, weightKg: number) {
//   switch (method) { case "standard": return 399 + weightKg * 50; case "express": ...; case "pickup": return 0; }
// }
//
// Step 1: write characterisation tests for cost() and etaDays() for every method.
// Step 2: introduce the interface, and one object per branch, copying each branch's body.
// Step 3: add a lookup from the old string to the new object (keeps every caller working).
// Step 4: make cost() and etaDays() delegate through the lookup. Run the tests.
// Step 5: migrate callers to hold a ShippingMethod; delete the string functions.

interface ShippingMethod {
  costPence(weightKg: number): number;
  etaDays(): number;
}

const standard: ShippingMethod = { costPence: (kg) => 399 + Math.round(kg * 50), etaDays: () => 4 };
const express: ShippingMethod = { costPence: (kg) => 999 + Math.round(kg * 80), etaDays: () => 1 };
const pickup: ShippingMethod = { costPence: () => 0, etaDays: () => 0 };

const METHODS: Record<string, ShippingMethod> = { standard, express, pickup };

export function cost(method: string, weightKg: number): number {
  // Step 4: the old API delegates, callers unchanged.
  const shipping = METHODS[method];
  if (!shipping) throw new Error(`unknown shipping method ${method}`);
  return shipping.costPence(weightKg);
}
```

- **Strength — small steps keep risk low.** Every step is reviewable, and if a test fails you know exactly which small change caused it.
- **Strength — patterns arrive when they're proven necessary.** The pattern is introduced because the smell is real, not because someone predicted it.
- **Weakness — characterisation tests freeze bugs.** They record current behaviour, wrong answers included. Fix bugs in separate, deliberate commits after the refactor.
- **Weakness — it takes discipline.** Mixing "while I'm here" behaviour changes into a refactor makes review impossible and hides regressions.

**Interview question**

*You inherit a 600-line `calculate_fee()` with nested conditionals on provider, country, currency and amount, and no tests. Product wants a new provider next sprint. How do you change it safely?*

Don't start by restructuring. Start by **pinning down current behaviour** with a *golden master* test, a kind of characterisation test. Generate a large, deterministic set of inputs, using a seeded random generator over every provider, country, currency and a spread of amounts including the edges. Run them through the current function, and save the outputs, including exceptions, to a file. The test then reruns those inputs and compares the results with the file. Any behavioural change, intended or not, fails loudly. With that net in place, refactor in small steps, such as extracting a per-provider fee strategy, *without* adding the new provider, with the golden master passing after each step. Only then add the new provider as a new strategy, in a separate commit, and add *its* expected outputs to the golden file deliberately.

**Answer — a golden master test**

```python
import json
import random
from pathlib import Path


def legacy_fee(provider: str, country: str, currency: str, amount: int) -> int:
    ...  # the 600-line function under test


def generate_cases(n: int = 2_000, seed: int = 42):
    rng = random.Random(seed)  # seeded: the same inputs on every run
    edges = [0, 1, 99, 100, 101, 9_999, 10_000, 10_001, 1_000_000]
    for i in range(n):
        yield {
            "provider": rng.choice(["stripe", "adyen", "paypal"]),
            "country": rng.choice(["GB", "US", "DE", "IN", "BR"]),
            "currency": rng.choice(["GBP", "USD", "EUR", "INR"]),
            "amount": edges[i % len(edges)] if i % 4 == 0 else rng.randint(1, 500_000),
        }


def run_case(case: dict) -> dict:
    try:
        return {"fee": legacy_fee(**case)}
    except Exception as exc:  # errors are behaviour too
        return {"error": type(exc).__name__}


def test_fees_match_golden_master() -> None:
    golden = Path(__file__).with_name("fees.golden.json")
    actual = [run_case(case) for case in generate_cases()]
    if not golden.exists():  # the first run records today's behaviour, bugs included
        golden.write_text(json.dumps(actual, indent=1))
    assert actual == json.loads(golden.read_text())
```

```typescript
import { expect, test } from "vitest";

declare function legacyFee(provider: string, country: string, currency: string, amount: number): number; // the code under test

function mulberry32(seed: number) {
  // A tiny seeded PRNG: the same inputs on every run.
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function* generateCases(n = 2000, seed = 42) {
  const rand = mulberry32(seed);
  const pick = <T>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const edges = [0, 1, 99, 100, 101, 9_999, 10_000, 10_001, 1_000_000];
  for (let i = 0; i < n; i++) {
    yield {
      provider: pick(["stripe", "adyen", "paypal"]),
      country: pick(["GB", "US", "DE", "IN", "BR"]),
      currency: pick(["GBP", "USD", "EUR", "INR"]),
      amount: i % 4 === 0 ? edges[i % edges.length] : 1 + Math.floor(rand() * 500_000),
    };
  }
}

test("fees match the golden master", () => {
  const actual = [...generateCases()].map((c) => {
    try {
      return { fee: legacyFee(c.provider, c.country, c.currency, c.amount) };
    } catch (err) {
      return { error: (err as Error).name }; // errors are behaviour too
    }
  });
  expect(actual).toMatchSnapshot(); // the first run records today's behaviour, bugs included
});
```

> **Warning**
>
> **Never mix a refactoring and a behaviour change in one commit.** A refactoring commit should pass the *unchanged* test suite. That's the proof that it changed only structure. If it also changes behaviour, a reviewer can't tell whether a modified test is intended or a regression being covered up. Refactor, merge, then change behaviour. Kent Beck's phrasing: *"make the change easy (warning: this may be hard), then make the easy change."*

<a id="36-patterns-and-testing"></a>

## 36. Patterns and Testability

- **A seam is** `a place to change behaviour without editing` <!-- great -->
- **Test doubles** `dummy · stub · spy · mock · fake` <!-- ok -->
- **Fakes stay honest through** `contract tests` <!-- great -->
- **Don't mock** `what you don't own` <!-- bad -->

Michael Feathers defines a **seam** as *a place where you can alter behaviour in your program without editing in that place*. Testability is mostly a question of seams. If a class creates its own database client, reads the system clock and calls a vendor SDK directly, there's no way to run it in a test without the real database, the real time and the real vendor. Patterns are, among other things, a catalogue of seams. **Dependency injection**, **Strategy**, **Adapter**, **Factory** and **Observer** each create one. **Singleton**, static method calls, `new` inside constructors, and hidden reads of the clock or a random generator destroy them.

When a seam exists, a test puts a **test double** in it. Gerard Meszaros's *xUnit Test Patterns* (2007) named five kinds, and using the right word avoids a lot of confusion. A **dummy** is passed in but never used, only to fill a parameter. A **stub** returns canned answers, like a fixed clock. A **spy** records how it was called, so the test can assert on it afterwards. A **mock** is created with expectations about the calls it should receive, and fails if they don't happen. A **fake** is a working, simplified implementation, like an in-memory repository. Meszaros also described the **Humble Object** pattern: when something is hard to test, like a UI widget, an HTTP handler or a cron entry point, move the logic out into a plain object, and leave the hard-to-test part so thin it barely needs tests. That's functional core, imperative shell (section 33) seen from the testing side.

**The five test doubles, in one test file**

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from unittest.mock import Mock


@dataclass
class User:
    id: str
    email: str
    trial_ends: datetime


class TrialReminder:
    def __init__(self, users, mailer, clock, audit_log) -> None:
        self.users, self.mailer, self.clock, self.audit_log = users, mailer, clock, audit_log

    def run(self, user_id: str) -> None:
        user = self.users.get(user_id)
        if user.trial_ends.date() - self.clock.now().date() == timedelta(days=1):
            self.mailer.send(user.email, "Your trial ends tomorrow")


class FixedClock:  # stub: returns a canned answer
    def __init__(self, at: datetime) -> None:
        self.at = at

    def now(self) -> datetime:
        return self.at


class RecordingMailer:  # spy: records calls for the test to inspect
    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    def send(self, to: str, body: str) -> None:
        self.sent.append((to, body))


class InMemoryUsers:  # fake: a working, simplified implementation
    def __init__(self) -> None:
        self._rows: dict[str, User] = {}

    def add(self, user: User) -> None:
        self._rows[user.id] = user

    def get(self, user_id: str) -> User:
        return self._rows[user_id]


def test_reminder_sent_the_day_before_the_trial_ends() -> None:
    users = InMemoryUsers()
    users.add(User("u1", "a@x.io", trial_ends=datetime(2026, 3, 1, 9)))
    mailer = RecordingMailer()
    TrialReminder(users, mailer, FixedClock(datetime(2026, 2, 28, 23)), audit_log=None).run("u1")  # None: a dummy
    assert mailer.sent == [("a@x.io", "Your trial ends tomorrow")]


def test_reminder_with_a_mock() -> None:
    users = InMemoryUsers()
    users.add(User("u1", "a@x.io", trial_ends=datetime(2026, 3, 1)))
    mailer = Mock()  # mock: the interaction itself is what's verified
    TrialReminder(users, mailer, FixedClock(datetime(2026, 2, 28)), audit_log=None).run("u1")
    mailer.send.assert_called_once_with("a@x.io", "Your trial ends tomorrow")
```

```typescript
import { expect, test, vi } from "vitest";

interface User {
  id: string;
  email: string;
  trialEnds: Date;
}

class TrialReminder {
  constructor(
    private readonly users: { get(id: string): User },
    private readonly mailer: { send(to: string, body: string): void },
    private readonly clock: { now(): Date },
    private readonly auditLog: unknown,
  ) {}

  run(userId: string): void {
    const user = this.users.get(userId);
    const days = Math.round((startOfDay(user.trialEnds) - startOfDay(this.clock.now())) / 86_400_000);
    if (days === 1) this.mailer.send(user.email, "Your trial ends tomorrow");
  }
}

const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

const fixedClock = (at: Date) => ({ now: () => at }); // stub: returns a canned answer

class RecordingMailer {
  // Spy: records calls for the test to inspect.
  readonly sent: [string, string][] = [];
  send(to: string, body: string) {
    this.sent.push([to, body]);
  }
}

class InMemoryUsers {
  // Fake: a working, simplified implementation.
  private readonly rows = new Map<string, User>();
  add(user: User) {
    this.rows.set(user.id, user);
  }
  get(id: string): User {
    const user = this.rows.get(id);
    if (!user) throw new Error(`no user ${id}`);
    return user;
  }
}

test("reminder sent the day before the trial ends", () => {
  const users = new InMemoryUsers();
  users.add({ id: "u1", email: "a@x.io", trialEnds: new Date("2026-03-01T09:00:00Z") });
  const mailer = new RecordingMailer();
  new TrialReminder(users, mailer, fixedClock(new Date("2026-02-28T23:00:00Z")), null).run("u1"); // null: a dummy
  expect(mailer.sent).toEqual([["a@x.io", "Your trial ends tomorrow"]]);
});

test("reminder with a mock", () => {
  const users = new InMemoryUsers();
  users.add({ id: "u1", email: "a@x.io", trialEnds: new Date("2026-03-01T00:00:00Z") });
  const mailer = { send: vi.fn() }; // mock: the interaction itself is what's verified
  new TrialReminder(users, mailer, fixedClock(new Date("2026-02-28T00:00:00Z")), null).run("u1");
  expect(mailer.send).toHaveBeenCalledOnce();
  expect(mailer.send).toHaveBeenCalledWith("a@x.io", "Your trial ends tomorrow");
});
```

- **Strength — seams make tests fast and focused.** Business rules run in milliseconds against fakes and stubs, with no network, database or clock.
- **Strength — the vocabulary sharpens test design.** Asking "do I need a stub or a mock here?" separates testing *results* from testing *interactions*.
- **Weakness — over-mocking couples tests to implementation.** Tests that assert every internal call break on every refactor, even when the behaviour is unchanged.
- **Weakness — fakes can drift.** An in-memory fake that behaves differently from the real thing makes tests pass and production fail.

**Interview question**

*Your tests use an in-memory fake of the storage interface, and production uses a database-backed implementation. How do you make sure the fake doesn't drift from the real thing?*

Write one suite of **contract tests** against the *interface*, and run that same suite against **every implementation**: the fake and the real adapter. The contract captures the behaviour callers rely on. For example: `get` after `put` returns the same bytes, a missing key raises `KeyNotFound` rather than returning `None`, and `put` overwrites. The real adapter runs the suite in an integration job against a disposable database or container, and the fake runs it in milliseconds. If someone changes the real adapter's behaviour, or adds a fake shortcut that the database doesn't honour, the shared suite fails for whichever one diverged. Then every *other* test that uses the fake inherits that guarantee. In pytest this is a parametrised fixture. In Vitest or Jest it's `describe.each` over factory functions.

**Answer — one contract, every implementation**

```python
import sqlite3

import pytest


class KeyNotFound(Exception):
    pass


class InMemoryStore:
    def __init__(self) -> None:
        self._data: dict[str, bytes] = {}

    def put(self, key: str, value: bytes) -> None:
        self._data[key] = value

    def get(self, key: str) -> bytes:
        if key not in self._data:
            raise KeyNotFound(key)
        return self._data[key]


class SqliteStore:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn
        conn.execute("create table if not exists kv (k text primary key, v blob not null)")

    def put(self, key: str, value: bytes) -> None:
        self._conn.execute("insert into kv values (?, ?) on conflict(k) do update set v = excluded.v", (key, value))

    def get(self, key: str) -> bytes:
        row = self._conn.execute("select v from kv where k = ?", (key,)).fetchone()
        if row is None:
            raise KeyNotFound(key)
        return row[0]


@pytest.fixture(params=["memory", "sqlite"])
def store(request):  # every test below runs once per implementation
    if request.param == "memory":
        return InMemoryStore()
    return SqliteStore(sqlite3.connect(":memory:"))


def test_get_returns_what_was_put(store) -> None:
    store.put("a", b"\x00\x01")
    assert store.get("a") == b"\x00\x01"


def test_missing_key_raises_key_not_found(store) -> None:
    with pytest.raises(KeyNotFound):
        store.get("nope")


def test_put_overwrites(store) -> None:
    store.put("a", b"old")
    store.put("a", b"new")
    assert store.get("a") == b"new"
```

```typescript
import { describe, expect, test } from "vitest";

export class KeyNotFound extends Error {}

export interface Store {
  put(key: string, value: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array>;
}

class InMemoryStore implements Store {
  private readonly data = new Map<string, Uint8Array>();
  async put(key: string, value: Uint8Array) {
    this.data.set(key, value);
  }
  async get(key: string) {
    const value = this.data.get(key);
    if (!value) throw new KeyNotFound(key);
    return value;
  }
}

declare function createPostgresStore(): Promise<Store>; // the real adapter, against a disposable database

const implementations: [string, () => Promise<Store>][] = [
  ["memory", async () => new InMemoryStore()],
  ...(process.env.INTEGRATION ? [["postgres", createPostgresStore] as [string, () => Promise<Store>]] : []),
];

describe.each(implementations)("Store contract: %s", (_name, create) => {
  // Every test below runs once per implementation.
  test("get returns what was put", async () => {
    const store = await create();
    await store.put("a", new Uint8Array([0, 1]));
    expect(await store.get("a")).toEqual(new Uint8Array([0, 1]));
  });

  test("missing key throws KeyNotFound", async () => {
    await expect((await create()).get("nope")).rejects.toBeInstanceOf(KeyNotFound);
  });

  test("put overwrites", async () => {
    const store = await create();
    await store.put("a", new TextEncoder().encode("old"));
    await store.put("a", new TextEncoder().encode("new"));
    expect(new TextDecoder().decode(await store.get("a"))).toBe("new");
  });
});
```

> **Warning**
>
> **Don't mock what you don't own.** That's advice from Steve Freeman and Nat Pryce's *Growing Object-Oriented Software, Guided by Tests*. If your tests mock the AWS SDK or an HTTP library directly, they encode *your guess* about how that library behaves, and they keep passing when the guess is wrong. Wrap the third-party API in an **adapter you own** (section 13). Mock or fake *your adapter* in unit tests, and test the adapter itself against the real service, or a faithful local emulator, in a small set of integration and contract tests.

<a id="unit-6"></a>

## Unit 6 — Wrap-Up

Everything on a few pages: the whole catalogue in tables, a playbook for recognising which pattern a problem needs, and a plan for practising until the choice becomes instinct.

<a id="37-cheat-sheet"></a>

## 37. Cheat Sheet

The whole course, compressed for revision. Every row links back to its section through the sidebar.

<a id="37-1-gof-patterns"></a>

### The 23 Gang of Four patterns

| Pattern | Kind | Intent in one line | Idiomatic Python / TypeScript |
| --- | --- | --- | --- |
| Factory Method | creational | a subclass decides which product to create | override a `create_x()` hook, or inject a factory function |
| Abstract Factory | creational | create families of objects that must match | one factory object or module per family |
| Builder | creational | assemble step by step, validate once | fluent builder; `dataclasses.replace` or spread for small cases |
| Prototype | creational | make new objects by copying a configured one | explicit `clone()`; `copy.deepcopy`; `structuredClone` for plain data |
| Singleton | creational | one instance with global access | a module-level object, passed in by injection |
| Adapter | structural | make an existing class fit an interface you need | a wrapper that translates calls, values, errors and units |
| Bridge | structural | let an abstraction and its implementation vary independently | the abstraction holds an implementor with primitive operations |
| Composite | structural | treat leaves and groups the same way in a tree | a recursive method on a shared interface; iterative for deep trees |
| Decorator | structural | add behaviour and keep the interface | a forwarding wrapper class; `@decorator` for functions |
| Facade | structural | one simple entry point to a subsystem | a use-case function or application service |
| Flyweight | structural | share immutable state between many objects | a cached factory; `sys.intern`; typed arrays for extrinsic state |
| Proxy | structural | control access to the real object | a wrapper class; `__getattr__`; JavaScript `Proxy` |
| Chain of Responsibility | behavioural | pass a request along handlers until one deals with it | a middleware list; successor links |
| Command | behavioural | turn a request into an object | a closure in-process; data plus a handler registry across processes |
| Interpreter | behavioural | evaluate sentences of a small language | AST classes plus a recursive-descent parser |
| Iterator | behavioural | sequential access without exposing the structure | generators; `__iter__`; `[Symbol.iterator]` |
| Mediator | behavioural | peers coordinate through one hub | a controller object or a rule table |
| Memento | behavioural | an opaque snapshot to restore later | a frozen dataclass; immutable, shared state |
| Observer | behavioural | notify dependents when something changes | a callback list; `EventTarget`; signals |
| State | behavioural | behaviour changes with internal state | state classes, or a transition table with guards |
| Strategy | behavioural | interchangeable algorithms | pass a function, or an object for configured strategies |
| Template Method | behavioural | a fixed skeleton with overridable steps | a base class with hooks, or the steps passed as functions |
| Visitor | behavioural | add operations without changing element classes | `match` or a discriminated union with an exhaustive `switch` |

<a id="37-2-beyond-gof"></a>

### Beyond the catalogue

| Pattern | Intent in one line | Section |
| --- | --- | --- |
| Dependency Injection | collaborators are passed in, built once in a composition root | 12 |
| Null Object | a do-nothing implementation instead of `None` checks | 31 |
| Value Object | small, immutable, equal by value, valid by construction | 31 |
| Specification | business rules as combinable predicate objects | 31 |
| Repository | a collection-like interface over persistence, owned by the domain | 32 |
| Unit of Work | track changes and commit them in one transaction | 32 |
| Functional core, imperative shell | pure decisions inside, effects at the edge | 33 |
| Humble Object | move logic out of hard-to-test boundaries | 36 |

<a id="37-3-same-shape"></a>

### Same shape, different intent

```text
A wrapper with the SAME interface as what it wraps
    adds behaviour around calls ......................... Decorator
    controls access, creation or location ............... Proxy

A wrapper with a DIFFERENT interface
    conforms to an interface that already exists ........ Adapter
    invents a simpler interface over many parts ......... Facade

An object holding a swappable collaborator
    one algorithm, chosen from outside .................. Strategy
    swapped by the object itself as it changes .......... State
    a whole second hierarchy, designed up front ......... Bridge

A tree of objects behind one interface
    leaves and groups answer the same calls ............. Composite
    nodes of a small language, evaluated ................ Interpreter
    operations kept outside the node classes ............ Visitor

Requests flowing through objects
    each handler may stop or pass it on ................. Chain of Responsibility
    the request itself is a storable, undoable object ... Command
    peers talk through one coordinator .................. Mediator
    one subject broadcasts to many listeners ............ Observer
```

<a id="37-4-principles"></a>

### The principles underneath

1. **Encapsulate what varies.** Find the axis of change and put it behind a seam.
2. **Program to an interface, not an implementation.** Depend on capabilities, not on vendors or concrete classes.
3. **Favour composition over inheritance.** Inherit for a true is-a with designed hooks; compose for everything else.
4. **Single responsibility.** One module answers to one actor.
5. **Open/closed.** Make the *expected* changes by adding code, not by editing tested code.
6. **Liskov substitution.** A subtype keeps every promise its parent made.
7. **Interface segregation.** Clients depend only on the methods they use.
8. **Dependency inversion.** Policy owns the interfaces, and details implement them.
9. **YAGNI and the rule of three.** Add the abstraction when the second or third real case arrives, not before.

> **Key idea**
>
> Every row in these tables is a way to make one kind of change cheap, and every one of them costs some indirection. The skill isn't knowing all 23. It's recognising **which kind of change your code actually faces**, and picking the one pattern, or the plain function, that makes that change cheap.

<a id="38-pattern-playbook"></a>

## 38. Pattern-Recognition Playbook

Patterns are hard to recognise from their names and easy to recognise from their **symptoms**. This playbook starts from what you see in the code or the requirements, and works back to the pattern and the first safe step towards it.

<a id="38-1-symptoms"></a>

### From symptom to pattern

| What you notice | Likely pattern | First safe step |
| --- | --- | --- |
| the same `if/elif` on a type field in several methods | Strategy, or State if it changes over time | characterisation tests, then one class per branch (section 35) |
| a status field checked at the top of most methods | State | draw the state diagram; write the transition table |
| `ConcreteThing(...)` constructed in many files | Factory / registry | route every construction through one function |
| constructors with 8+ parameters, or half-built objects | Builder | introduce a parameter object, then a builder with `build()` validation |
| `get_instance()` everywhere, tests depend on run order | Dependency injection | add a constructor parameter defaulting to the singleton (crash course, section 3) |
| vendor types and errors in domain code | Adapter | define the interface you wish you had; implement it over the SDK |
| callers repeat the same 5 calls in the same order | Facade | extract the sequence into one use-case function |
| retry, cache or timing code copy-pasted around calls | Decorator | wrap one call site; then move the others onto the wrapper |
| expensive objects loaded "just in case" | Proxy (virtual) | load lazily behind the same interface |
| "when X happens, also do Y and Z" requirements | Observer | publish an event after the commit; move Y and Z into subscribers |
| a need for undo, audit logs, queues or retries | Command | represent the request as data with an ID |
| checks that each may reject a request | Chain of Responsibility | one middleware per check, with an explicit default at the end |
| `for` loops that page through an API by hand | Iterator / generator | hide paging behind a generator that yields items |
| UI components that all update each other | Mediator | route changes through one coordinator or rule table |
| many new operations over a stable set of node types | Visitor / pattern matching | a closed union and one function per operation |
| business users who want to write their own rules | Interpreter + Specification | a tiny grammar, a parser and an allow-list; never `eval` |
| one subclass per *combination* of two features | Bridge / composition | split each axis into its own interface |
| millions of near-identical objects | Flyweight | separate intrinsic from extrinsic state; cache the intrinsic part |

<a id="38-2-decision-flow"></a>

### Questions that pick the pattern

```text
Is the problem about CREATING objects?
    which class depends on config or input? ................ Factory / registry
    several objects that must come from the same family? ... Abstract Factory
    many optional parts, rules that span fields? ........... Builder
    copies of a configured template? ....................... Prototype
    exactly one, shared? ................................... one instance, injected

Is it about STRUCTURE: wrapping, combining, sharing?
    an interface that doesn't fit? ......................... Adapter
    too many calls to do one thing? ........................ Facade
    extra behaviour, same interface? ....................... Decorator
    laziness, permissions or remoteness? ................... Proxy
    a part-whole tree? ..................................... Composite
    two independent dimensions of variation? ............... Bridge
    huge numbers of near-identical objects? ................ Flyweight

Is it about BEHAVIOUR and communication?
    one step of an algorithm varies? ....................... Strategy (or a function)
    a fixed skeleton with varying steps? ................... Template Method
    "when X, also do Y"? ................................... Observer
    undo, queue, log, retry? ............................... Command
    behaviour depends on a lifecycle stage? ................ State
    a request passing through a series of checks? .......... Chain of Responsibility
    walking a collection or a stream lazily? ............... Iterator / generator
    many peers interacting in both directions? ............. Mediator
    save now, restore later? ............................... Memento
    many operations over a stable set of types? ............ Visitor / pattern matching
    users writing their own expressions? ................... Interpreter

None of the above, or nothing varies yet? .................. no pattern: write the plain code
```

<a id="38-3-red-flags"></a>

### Red flags in a code review

1. **An interface with one implementation and no test fake.** Ask what second implementation is expected, and when.
2. **Class names built from pattern names.** `OrderStrategyFactoryManager` describes the plumbing, not the domain.
3. **A pattern without its intent.** A "Decorator" that changes the interface, or a "Facade" that holds business rules, is a different, unnamed thing.
4. **Hidden global state.** `get_instance()`, module-level mutable state, or `datetime.now()` deep inside business logic.
5. **Inheritance more than two levels deep,** or a subclass that overrides a method only to call `super()` with different arguments.
6. **Observers doing slow or irreversible work synchronously,** inside the publisher's transaction.
7. **Shallow copies of mutable templates,** and snapshots that hold references to live, mutable state.
8. **Anything that `eval`s, `exec`s or `new Function`s user input.**

> **Tip**
>
> When you aren't sure, **write the straightforward code first** and wait for the second and third change requests. They tell you which axis actually varies, and *that* tells you the pattern. Refactoring into a pattern with tests in place is cheap. Unwinding the wrong pattern after a year of other code has been built on it is not.

<a id="39-practice-roadmap"></a>

## 39. Practice Roadmap

Reading about patterns builds vocabulary. Judgement comes from *applying* them to real code and living with the consequences. This six-week plan alternates reading with deliberate practice, and each week ends with something you can show in a code review.

<a id="39-1-six-weeks"></a>

### Six weeks, one theme a week

1. **Week 1 — Foundations (sections 1–6).** Take a large class from your own codebase. List the *actors* who request changes to it (SRP), find one flag argument (control coupling), and draw its class diagram. Exercise: split one class by actor, with tests passing before and after.
2. **Week 2 — Creational (sections 7–12).** Find one `get_instance()` or hidden `new` and replace it with constructor injection, using the three-step migration from section 3 of the crash course. Write a test data builder for your most-used domain object. Exercise: build the toy DI container from section 12 and make it detect a captive dependency.
3. **Week 3 — Structural (sections 13–19).** Wrap one vendor SDK behind an adapter you own, with contract tests that run against both a fake and the real service. Add retries as a decorator rather than inline code. Exercise: find and fix an N+1 query with eager loading.
4. **Week 4 — Behavioural I (sections 20–25).** Refactor one type-code `switch` into strategies, following section 35's steps. Model one entity's lifecycle as a transition table with exhaustive pair tests. Exercise: write a middleware pipeline with an error lane.
5. **Week 5 — Behavioural II (sections 26–30).** Replace a hand-written pagination loop with a generator. Write the rule-language parser and interpreter from section 30, then add an `in` operator. Exercise: rewrite a Visitor as a discriminated union with an exhaustiveness check.
6. **Week 6 — Judgement (sections 31–36).** Find one speculative abstraction in your codebase and delete it. Restructure one job into a functional core and an imperative shell. Exercise: the Gilded Rose kata below, using a golden master test first.

<a id="39-2-katas"></a>

### Refactoring katas worth doing

1. 🏪 [Gilded Rose](https://github.com/emilybache/GildedRose-Refactoring-Kata) — a legendary tangle of nested conditionals. Golden master first, then Strategy or polymorphism. Available in dozens of languages, including Python and TypeScript.
2. 🦜 [Parrot](https://github.com/emilybache/Parrot-Refactoring-Kata) — a short exercise in replacing a type-code `switch` with polymorphism.
3. 🎾 [Tennis](https://github.com/emilybache/Tennis-Refactoring-Kata) — three badly written implementations of one scoring rule. Practise small, safe steps and naming.
4. ✈️ [Trip Service](https://github.com/sandromancuso/trip-service-kata) — legacy code with a hidden singleton and a static call. Practise creating seams and characterisation tests.

<a id="39-3-reading"></a>

### Reading list

1. *Design Patterns: Elements of Reusable Object-Oriented Software* — Gamma, Helm, Johnson, Vlissides (1994). The original catalogue. Read chapters 1 and 2 closely, and use the rest as a reference.
2. *Head First Design Patterns* (2nd edition, 2020) — Freeman and Robson. The friendliest first read, with Java examples that translate easily.
3. *Refactoring* (2nd edition, 2018) — Martin Fowler. The catalogue of small, safe steps, with JavaScript examples.
4. *Refactoring to Patterns* — Joshua Kerievsky (2004). How to arrive at, or leave, each pattern by refactoring.
5. *Working Effectively with Legacy Code* — Michael Feathers (2004). Seams and characterisation tests: how to get untested code under test.
6. *Patterns of Enterprise Application Architecture* — Martin Fowler (2002). Repository, Unit of Work, Identity Map and the rest of the application-level patterns.
7. *Architecture Patterns with Python* — Harry Percival and Bob Gregory (2020). Repository, Unit of Work, message bus and dependency injection built step by step. Free to read at [cosmicpython.com](https://www.cosmicpython.com/).

<a id="39-4-where-next"></a>

### Where to go next

1. 📗 Revisit the [Design Patterns Crash Course](design-patterns-crash-course.html) for the animated, one-section-per-pattern overview.
2. 📚 Browse both courses in the [Design Patterns Courses catalog](design-patterns-courses.html).
3. 🧭 [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns) — an illustrated reference for every GoF pattern, with code in many languages.
4. 🐍 [Brandon Rhodes — Python Design Patterns](https://python-patterns.guide/) — which patterns matter in Python, and which a language feature replaces.
5. 🧠 [Peter Norvig — Design Patterns in Dynamic Languages](https://norvig.com/design-patterns/) — the 1996 talk showing how 16 of the 23 patterns simplify with first-class functions.

> *"Favor object composition over class inheritance."* — Gamma, Helm, Johnson & Vlissides, *Design Patterns* (1994)
