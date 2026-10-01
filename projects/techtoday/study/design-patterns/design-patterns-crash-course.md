<!--
Source: design-patterns-crash-course.html
Title: Design Patterns Crash Course | TechToday
Description: A visual crash course in the design patterns working engineers use every week — coupling, composition over inheritance, Singleton and dependency injection, Builder, Prototype with a registry, factories, Adapter, Facade, Decorator, Flyweight, Strategy and Observer — each with an animation and Python/TypeScript code.
Theme-color: #0b0d10
Stylesheets: design-patterns-study.css, ../../site-header.css
Scripts: design-patterns-study.js
-->

Navigation: [TechToday](../../index.html) · [← Design Patterns Courses](design-patterns-courses.html)

<a id="design-patterns-crash-course"></a>

# Design Patterns

A design pattern is a named, reusable answer to a design problem that keeps coming back. Usually the problem is that one part of the code keeps changing, and you want each change to touch one place instead of twenty. This page covers the ten patterns you will meet most often, and the one idea underneath all of them. Each section starts with the mental model and ends with code. Press **Play** on any animation to watch the objects move.

> **Key idea**
>
> Every pattern on this page does the same thing: **it finds the part of the code that changes and puts it behind a stable interface**, so a change touches one class instead of every caller. Strategy does it for algorithms, Factory for creating objects, Decorator for behaviour added around a call, and Observer for who gets told when something happens. If you know what a pattern isolates, you know when to use it. You also know when not to: if nothing varies there, the pattern is just extra code.

<a id="table-of-contents"></a>

## Table of Contents

1. [Coupling: Why Patterns Exist](#1-coupling-and-change)
2. [Composition Over Inheritance](#2-composition-over-inheritance)
3. [Singleton & Dependency Injection](#3-singleton-and-dependency-injection)
4. [Builder](#4-builder)
5. [Prototype & Registry](#5-prototype-and-registry)
6. [Factories](#6-factories)
7. [Adapter & Facade](#7-adapter-and-facade)
8. [Decorator & Flyweight](#8-decorator-and-flyweight)
9. [Strategy](#9-strategy)
10. [Observer](#10-observer)
11. [Patterns in a Language With Functions](#11-patterns-as-functions)
12. [The Whole Thing on One Page](#12-the-whole-thing-on-one-page)

<a id="unit-1"></a>

## Unit 1 — Design Principles

The two ideas every pattern is built from: keep coupling low, and prefer holding a collaborator to inheriting from one.

<a id="1-coupling-and-change"></a>

## 1. Coupling: Why Patterns Exist

- **Patterns in the GoF book** `23` <!-- ok -->
- **Ones you will use weekly** `about 10` <!-- good -->
- **The core principle** `encapsulate what varies` <!-- great -->
- **Price of every pattern** `+1 indirection` <!-- bad -->

**Coupling** is how much one piece of code has to know about another to work. Suppose `OrderService` creates a `StripeClient` itself, calls Stripe's method names and checks Stripe's error codes. Then switching to another payment provider means editing `OrderService`, and every other class that does the same. Those classes are *tightly coupled* to Stripe. Now suppose `OrderService` only knows that it has "something with a `charge(amount)` method". It works with Stripe, with Adyen, or with a fake in a test, and it never has to change. Every design pattern in this course is a named, specific way of replacing a dependency on a concrete class with a dependency on an interface.

> **Analogy** 🔌
>
> **Picture it — the wall socket**
>
> Your laptop doesn't care which power station made the electricity. It depends on the shape of the socket, which is a standard interface. The power company can replace a coal plant with a wind farm and nobody rewires their house. Wiring the laptop straight into the generator would work fine, right up until the first time anything changed.

> **Interactive animation:** `change-ripple` — rendered by the page script in the HTML version.

The animation doesn't count lines of code. It counts **files that had to change because of one business decision**, and that is the number patterns try to keep small. Three principles from the *Gang of Four* (GoF) book, *Design Patterns* (1994), do most of the work, and every pattern on this page applies at least one of them:

```text
1. Encapsulate what varies.            Find the axis of change. Put it behind a seam
                                       so the rest of the code can't see it move.

2. Program to an interface,            Depend on "something that can charge()",
   not an implementation.              not on StripeClient.

3. Favour composition over             Hold a collaborator you can swap, instead of
   inheritance.                        inheriting from one you can't.
```

- **Strength — change stays local.** A new payment provider is one new class. Existing classes don't change, so their tests keep passing.
- **Strength — testable by default.** Code that depends on an interface can be given a fake. Most "hard to test" code is code that creates its own collaborators.
- **Weakness — indirection costs something.** Every interface is one more jump when you read the code. "Go to definition" now lands on an abstract method, not on the code that runs.
- **Weakness — the wrong seam is worse than none.** If you guess the axis of change wrong, you pay for the abstraction and still have to edit everything when the real change arrives.

**Interview question**

*What is the difference between coupling and cohesion, and why do people say you want low coupling and high cohesion?*

**Cohesion** describes what's *inside* a module: do its parts belong together, and do they change for the same reason? **Coupling** describes what's *between* modules: how much each one knows about the others. With high cohesion, a change usually stays inside one module. With low coupling, a change inside one module doesn't spread to the others. Together they limit how far a change can spread. A class that both formats invoices *and* sends email has low cohesion, because a template change and an SMTP change both land in it. Splitting it in two, and making the invoice code depend on a `Notifier` interface instead of an SMTP library, fixes the cohesion and the coupling together. The code below shows the same move for payments. The service declares the capability it needs, and both the real gateway and the test fake provide it.

**Answer — depend on a capability, not a vendor**

```python
# Before: OrderService built Stripe itself, so changing provider -- or testing
# without the network -- meant editing this class.
#
#     class OrderService:
#         def __init__(self) -> None:
#             self._stripe = stripe.Client(os.environ["STRIPE_KEY"])

from typing import Protocol


class PaymentGateway(Protocol):
    def charge(self, amount_cents: int) -> str: ...


class StripeGateway:
    def __init__(self, client) -> None:
        self._client = client

    def charge(self, amount_cents: int) -> str:
        result = self._client.charges.create(amount=amount_cents, currency="usd")
        return result["id"]


class OrderService:
    # Knows a capability, not a vendor. Someone else chooses the implementation.
    def __init__(self, gateway: PaymentGateway) -> None:
        self._gateway = gateway

    def checkout(self, order_id: str, total_cents: int) -> str:
        return self._gateway.charge(total_cents)


class FakeGateway:
    """Satisfies PaymentGateway structurally: no inheritance, no mock library."""

    def __init__(self) -> None:
        self.charges: list[int] = []

    def charge(self, amount_cents: int) -> str:
        self.charges.append(amount_cents)
        return f"fake-{len(self.charges)}"


def test_checkout_charges_the_order_total() -> None:
    gateway = FakeGateway()
    OrderService(gateway).checkout("order-1", 4_250)
    assert gateway.charges == [4_250]
```

```typescript
// Before: OrderService did `this.stripe = new Stripe(process.env.STRIPE_KEY!)`,
// so changing provider -- or testing without the network -- meant editing it.

interface PaymentGateway {
  charge(amountCents: number): Promise<string>;
}

type StripeLike = {
  charges: { create(args: { amount: number; currency: string }): Promise<{ id: string }> };
};

class StripeGateway implements PaymentGateway {
  constructor(private readonly client: StripeLike) {}

  async charge(amountCents: number): Promise<string> {
    const result = await this.client.charges.create({ amount: amountCents, currency: "usd" });
    return result.id;
  }
}

class OrderService {
  // Knows a capability, not a vendor. Someone else chooses the implementation.
  constructor(private readonly gateway: PaymentGateway) {}

  checkout(orderId: string, totalCents: number): Promise<string> {
    return this.gateway.charge(totalCents);
  }
}

class FakeGateway implements PaymentGateway {
  readonly charges: number[] = [];

  async charge(amountCents: number): Promise<string> {
    this.charges.push(amountCents);
    return `fake-${this.charges.length}`;
  }
}

test("checkout charges the order total", async () => {
  const gateway = new FakeGateway();
  await new OrderService(gateway).checkout("order-1", 4250);
  expect(gateway.charges).toEqual([4250]);
});
```

> **Warning**
>
> **An interface with one implementation that will only ever have one isn't decoupling. It's ceremony.** Add the seam when a second implementation exists (a real provider plus a test fake counts), or when the requirements already show that this part will change. "We might switch databases one day" is rarely a good enough reason. Every abstraction you add is code that someone has to read on the way to the code that actually runs.

<a id="2-composition-over-inheritance"></a>

## 2. Composition Over Inheritance

- **Inheritance, M × N features** `M × N classes` <!-- bad -->
- **Composition, M × N features** `M + N classes` <!-- great -->
- **Coupling created by `extends`** `the strongest there is` <!-- bad -->
- **Swap behaviour at runtime** `composition only` <!-- good -->

Inheritance says "a `B` *is an* `A`" and gives `B` all of `A`'s code. Composition says "a `B` *has an* `A`" and passes work to it. Inheritance is fine when there's one stable axis of variation. But once there are two independent axes, the hierarchy needs one subclass for every combination. Think of reports that vary by *format* (PDF, CSV) and by *delivery* (email, S3). Every value you add on either axis multiplies the number of classes. Composition gives each axis its own small interface and lets the object *hold* one of each, so the counts add instead of multiply.

> **Analogy** 🧱
>
> **Picture it — a carved statue versus LEGO**
>
> A carved statue of a knight on a horse is one solid piece. If you want the knight on foot, you carve a new statue. A LEGO knight and a LEGO horse clip together, so you can swap the horse for a dragon without touching the knight. Inheritance carves the combination into the type. Composition clips the parts together when the object is built.

> **Interactive animation:** `class-explosion` — rendered by the page script in the HTML version.

The second half of the animation is what the GoF book means by "favour composition over inheritance". The word is *favour*, not *always*. Inheritance is still the right tool when the subtype really *is* a kind of the parent and can stand in for it anywhere: a `ValidationError` is an `Exception`. It's the wrong tool when you only want to reuse some code, or when the variation has more than one axis.

- **Strength — composition swaps parts at runtime.** A `Report` holding a `Delivery` can get a different delivery per customer, per request or per test. A subclass is fixed when the object is created.
- **Strength — inheritance fits a real is-a with one axis.** Exception hierarchies, framework base classes and ORM `Model` classes are designed to be extended. Use those hooks; just don't build deep trees of your own.
- **Weakness — the fragile base class.** A subclass depends on its parent's *internals*, not only its interface. A harmless-looking change in the parent, such as making `add_all()` call `add()`, can quietly break every child.
- **Weakness — composition means more wiring.** Somebody has to build the object and pass in its parts. That's more code at construction time, and usually it's worth it.

**Interview question**

*You have `PdfReport` and `CsvReport` subclasses of `Report`, and product now wants each one either emailed or uploaded to S3. How do you avoid writing `EmailedPdfReport`, `S3CsvReport` and the rest?*

There are two independent axes here: **format** (PDF, CSV, and Excel next quarter) and **delivery** (email, S3, and Slack after that). Inheritance needs 3 × 3 = 9 classes, and each new format adds three more. Instead, make each axis a small interface of its own and let `Report` *hold* one of each. That's 3 + 3 classes, and you choose the combination when you build the object, which can come from config or the user's settings. Each formatter and each delivery can be tested alone, and a new delivery channel doesn't touch any formatter.

**Answer — two axes, two collaborators**

```python
import csv
import io
from typing import Protocol


class Formatter(Protocol):
    extension: str
    def render(self, rows: list[dict]) -> bytes: ...


class Delivery(Protocol):
    def send(self, filename: str, payload: bytes) -> None: ...


class CsvFormatter:
    extension = "csv"

    def render(self, rows: list[dict]) -> bytes:
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
        return buffer.getvalue().encode()


class EmailDelivery:
    def __init__(self, mailer, to: str) -> None:
        self._mailer, self._to = mailer, to

    def send(self, filename: str, payload: bytes) -> None:
        self._mailer.send(to=self._to, subject=filename, attachments=[(filename, payload)])


class S3Delivery:
    def __init__(self, s3, bucket: str) -> None:
        self._s3, self._bucket = s3, bucket

    def send(self, filename: str, payload: bytes) -> None:
        self._s3.put_object(Bucket=self._bucket, Key=filename, Body=payload)


class Report:
    """Has a formatter and a delivery; is neither. 3 + 3 classes, not 3 x 3."""

    def __init__(self, name: str, formatter: Formatter, delivery: Delivery) -> None:
        self.name, self.formatter, self.delivery = name, formatter, delivery

    def publish(self, rows: list[dict]) -> None:
        filename = f"{self.name}.{self.formatter.extension}"
        self.delivery.send(filename, self.formatter.render(rows))


# The combination is chosen at construction time -- here, from user settings.
Report("weekly-sales", CsvFormatter(), S3Delivery(s3, "reports")).publish(rows)
Report("weekly-sales", CsvFormatter(), EmailDelivery(mailer, "cfo@example.com")).publish(rows)
```

```typescript
interface Formatter {
  readonly extension: string;
  render(rows: Record<string, unknown>[]): Uint8Array;
}

interface Delivery {
  send(filename: string, payload: Uint8Array): Promise<void>;
}

type Attachment = { filename: string; payload: Uint8Array };
type Mailer = { send(msg: { to: string; subject: string; attachments: Attachment[] }): Promise<void> };
type S3Like = { putObject(args: { Bucket: string; Key: string; Body: Uint8Array }): Promise<unknown> };

class CsvFormatter implements Formatter {
  readonly extension = "csv";

  render(rows: Record<string, unknown>[]): Uint8Array {
    const header = Object.keys(rows[0]);
    const quote = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
    const lines = [header.join(","), ...rows.map((r) => header.map((h) => quote(r[h])).join(","))];
    return new TextEncoder().encode(lines.join("\n"));
  }
}

class EmailDelivery implements Delivery {
  constructor(private readonly mailer: Mailer, private readonly to: string) {}

  send(filename: string, payload: Uint8Array): Promise<void> {
    return this.mailer.send({ to: this.to, subject: filename, attachments: [{ filename, payload }] });
  }
}

class S3Delivery implements Delivery {
  constructor(private readonly s3: S3Like, private readonly bucket: string) {}

  async send(filename: string, payload: Uint8Array): Promise<void> {
    await this.s3.putObject({ Bucket: this.bucket, Key: filename, Body: payload });
  }
}

class Report {
  // Has a formatter and a delivery; is neither. 3 + 3 classes, not 3 x 3.
  constructor(
    readonly name: string,
    private readonly formatter: Formatter,
    private readonly delivery: Delivery,
  ) {}

  publish(rows: Record<string, unknown>[]): Promise<void> {
    const filename = `${this.name}.${this.formatter.extension}`;
    return this.delivery.send(filename, this.formatter.render(rows));
  }
}

await new Report("weekly-sales", new CsvFormatter(), new S3Delivery(s3, "reports")).publish(rows);
```

> **Warning**
>
> **Subclassing a built-in just to reuse its code** is the classic way to get bitten. In CPython, a `class LowerKeys(dict)` that overrides `__setitem__` to lower-case keys looks finished. But `LowerKeys(A=1)` and `d.update(B=2)` skip your override, because the built-in `dict` constructor and `update()` don't call `__setitem__` at all. You inherited an implementation you don't control. Holding a plain `dict` inside your class, or subclassing `collections.UserDict` (which is written to send every write through `__setitem__`), avoids it.

---

<a id="unit-2"></a>

## Unit 2 — Creational Patterns

Who decides which class gets created, how a complicated object gets assembled, how to copy a ready-made one, and how many instances of something exist.

<a id="3-singleton-and-dependency-injection"></a>

## 3. Singleton & Dependency Injection

- **Instances of a singleton** `exactly 1` <!-- ok -->
- **Callers hiding a dependency on it** `all of them` <!-- bad -->
- **DI: who builds the collaborators** `one composition root` <!-- great -->
- **Swapping it in a test** `pass a fake` <!-- great -->

A **singleton** guarantees that a class has exactly one instance, and gives the whole program access to it through calls like `Config.instance()` or `Database.get_instance()`. The "one instance" part is often legitimate: you really do want one connection pool and one loaded config. The "access from anywhere" part is the problem. Any function can quietly grab the instance, so its dependencies no longer show up in its signature, and a test can't swap it without patching globals. **Dependency injection** (DI) keeps the one instance and drops the global access. You create the object once, at startup, in one place called the *composition root*, and you *pass* it to whatever needs it.

> **Analogy** 🏨
>
> **Picture it — the lobby safe versus room keys**
>
> A singleton is one shared safe in the hotel lobby. Everyone knows where it is and anyone can open it, so when something goes missing you can't tell who touched it. Dependency injection is the front desk handing each guest a key to their own room at check-in. There's still exactly one front desk, but who can open what is decided in one place, and you can see it on every key.

> **Interactive animation:** `singleton-vs-di` — rendered by the page script in the HTML version.

Look at the two test runs in the animation. With the singleton, test B passes or fails depending on whether test A ran first, because they share one object. That's the defining symptom of global mutable state: **tests that depend on the order they run in**. With injection, each test builds its own object graph, so there's nothing to leak between them.

- **Strength — singleton: one shared, expensive resource.** A connection pool or a model loaded into memory should exist once. That goal is right; only the global lookup is the problem.
- **Strength — DI: dependencies are visible in the signature.** `ReportService(db, clock)` tells you what it touches. A test passes fakes, and there's nothing to patch.
- **Weakness — singletons leak state between tests.** Test A sets a flag on the shared instance and test B fails, but only when it runs after A. They also make parallel test runs unsafe.
- **Weakness — DI makes big constructors obvious.** A constructor with nine parameters is a class doing too much. DI doesn't cause that; it just makes it visible. A heavy DI framework adds reflection and config magic you often don't need either.

**Interview question**

*Your codebase calls `Database.get_instance()` in 140 places and the test suite is flaky. How do you migrate without a big-bang rewrite?*

Don't delete the singleton first. Work in three steps, each one a small pull request that ships on its own. **Step 1:** give each class a constructor parameter that defaults to the singleton. Production behaviour doesn't change, and tests can already pass a fake. **Step 2:** build the real objects in one composition root, such as `main()` or the app factory, and pass `db` explicitly. Also inject anything else that's hidden global state, like the clock. **Step 3:** once no caller relies on the default, make the parameter required and delete `get_instance()`. There's still exactly one database object. The difference is that the program now passes it around explicitly instead of each class looking it up.

**Answer — from singleton to injected, one safe step at a time**

```python
import os
import time


# Step 0 -- where you are: a singleton reached from everywhere.
class Database:
    _instance: "Database | None" = None

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn

    @classmethod
    def get_instance(cls) -> "Database":
        if cls._instance is None:
            cls._instance = cls(os.environ["DATABASE_URL"])
        return cls._instance

    def scalar(self, sql: str, *args) -> int: ...


# Step 1 -- accept the dependency, default to the singleton. Ship this alone.
class ReportService:
    def __init__(self, db: Database | None = None, clock=time.time) -> None:
        self._db = db if db is not None else Database.get_instance()
        self._clock = clock

    def daily_total(self) -> int:
        since = self._clock() - 86_400
        return self._db.scalar("select sum(total) from orders where created_at >= %s", since)


# Step 2 -- one composition root builds the real objects and passes them down.
def create_app() -> dict:
    db = Database(os.environ["DATABASE_URL"])  # still exactly one instance
    return {"reports": ReportService(db=db)}


# Step 3 -- make `db` required and delete get_instance(). Tests touch no globals:
class FakeDb:
    def __init__(self, result: int) -> None:
        self.result, self.last_args = result, ()

    def scalar(self, sql: str, *args) -> int:
        self.last_args = args
        return self.result


def test_daily_total_queries_the_last_24_hours() -> None:
    db = FakeDb(result=1200)
    service = ReportService(db=db, clock=lambda: 1_700_000_000)
    assert service.daily_total() == 1200
    assert db.last_args == (1_700_000_000 - 86_400,)
```

```typescript
// Step 0 -- where you are: a singleton reached from everywhere.
class Database {
  private static instance?: Database;

  static getInstance(): Database {
    return (Database.instance ??= new Database(process.env.DATABASE_URL!));
  }

  constructor(private readonly url: string) {}

  async scalar(sql: string, ...args: unknown[]): Promise<number> {
    throw new Error("real query elided");
  }
}

type Db = Pick<Database, "scalar">;
type Clock = () => number;

// Step 1 -- accept the dependency, default to the singleton. Ship this alone.
class ReportService {
  constructor(
    private readonly db: Db = Database.getInstance(),
    private readonly now: Clock = Date.now,
  ) {}

  dailyTotal(): Promise<number> {
    const since = new Date(this.now() - 86_400_000);
    return this.db.scalar("select sum(total) from orders where created_at >= $1", since);
  }
}

// Step 2 -- one composition root builds the real objects and passes them down.
export function createApp() {
  const db = new Database(process.env.DATABASE_URL!); // still exactly one instance
  return { reports: new ReportService(db) };
}

// Step 3 -- make `db` required and delete getInstance(). Tests touch no globals:
test("dailyTotal queries the last 24 hours", async () => {
  const calls: unknown[][] = [];
  const db: Db = {
    scalar: async (_sql, ...args) => {
      calls.push(args);
      return 1200;
    },
  };
  const service = new ReportService(db, () => 1_700_000_000_000);
  expect(await service.dailyTotal()).toBe(1200);
  expect(calls[0]).toEqual([new Date(1_700_000_000_000 - 86_400_000)]);
});
```

> **Warning**
>
> In Python, **a module is already a singleton**. It's imported once and cached in `sys.modules`, so a module-level `pool = create_pool()` gives you "one instance" with no metaclass tricks. The same goes for an exported `const` in an ES module. But the same testability problem applies: if every function does `from db import pool`, every function has a hidden dependency. Import it once in the composition root and pass it down.

<a id="4-builder"></a>

## 4. Builder

- **Constructor arguments before it pays off** `about 5+` <!-- ok -->
- **Half-built objects escaping** `0` <!-- great -->
- **Cross-field validation runs** `once, in build()` <!-- great -->
- **Often enough instead** `keyword args / options object` <!-- good -->

Builder separates *assembling* a complicated object from *the object itself*. You call a series of small, readable steps, like `.url(...)`, `.header(...)` and `.timeout(...)`. Then a final `build()` checks the whole configuration at once and returns an object that is complete and valid. It solves two problems. The first is the *telescoping constructor*: a dozen positional arguments that nobody can read at the call site. The second is the object that spends a while half-configured before it's safe to use. Query builders, HTTP request builders, test-data builders and the configuration objects of most SDKs are all builders.

> **Analogy** 🥪
>
> **Picture it — a sandwich counter**
>
> You don't say "sourdough, true, false, false, true, 2, mayo". You say "sourdough... add turkey... no onions... toast it". At the end, the person at the counter checks the order makes sense (you didn't ask for two kinds of bread) and hands you one finished sandwich. You never hold a half-made one.

> **Interactive animation:** `builder-steps` — rendered by the page script in the HTML version.

The important frame is the last one. A setter can only check its own field, but `build()` sees *every* field at once. That makes it the only place where rules that span several fields can be enforced, such as "GET can't have a body" or "an end date must come after the start date". Those rules are exactly what positional constructors and plain setters get wrong.

- **Strength — reads like the spec.** `RequestBuilder().method("POST").url(u).json(body)` explains itself. `Request("POST", u, None, body, 5, False, True)` does not.
- **Strength — the product can be immutable.** All the mutation happens inside the builder. The object `build()` returns can be frozen and shared between threads safely.
- **Weakness — fields are duplicated.** The builder mirrors the product's fields, and the two drift apart when someone adds a field to one and forgets the other.
- **Weakness — keyword arguments are often enough.** In Python, `Client(timeout=5, retries=3)` with defaults already fixes the telescoping constructor, and an options object does the same in TypeScript. Use a builder when construction has an *order*, *repeated* steps, or *validation across several fields*.

**Interview question**

*Build an HTTP request builder where a request must have a URL, a GET can't have a body, and the finished request can't be modified.*

The rules are about *combinations* of fields, so no single setter can check them: `.method("GET")` might be called before `.json(...)`, or after it. That's what `build()` is for. It runs once and sees the whole configuration. Each step returns the builder so calls can be chained. `build()` returns a *separate*, frozen object, so changing the builder afterwards can't change a request that has already been built. Headers are copied into a read-only mapping for the same reason.

**Answer — a validating request builder**

```python
import json
from dataclasses import dataclass
from types import MappingProxyType
from typing import Self


@dataclass(frozen=True)
class Request:
    method: str
    url: str
    headers: MappingProxyType
    body: bytes | None
    timeout_s: float


class RequestBuilder:
    def __init__(self) -> None:
        self._method = "GET"
        self._url: str | None = None
        self._headers: dict[str, str] = {}
        self._body: bytes | None = None
        self._timeout_s = 10.0

    def method(self, method: str) -> Self:
        self._method = method.upper()
        return self

    def url(self, url: str) -> Self:
        self._url = url
        return self

    def header(self, name: str, value: str) -> Self:
        self._headers[name.lower()] = value
        return self

    def json(self, payload: object) -> Self:
        self._body = json.dumps(payload).encode()
        return self.header("content-type", "application/json")

    def timeout(self, seconds: float) -> Self:
        self._timeout_s = seconds
        return self

    def build(self) -> Request:
        # Cross-field rules: no single setter can check these, because order is free.
        if not self._url:
            raise ValueError("a request needs a url")
        if self._body is not None and self._method in {"GET", "HEAD"}:
            raise ValueError(f"{self._method} requests cannot have a body")
        if self._timeout_s <= 0:
            raise ValueError("timeout must be positive")
        headers = MappingProxyType(dict(self._headers))  # a copy, read-only
        return Request(self._method, self._url, headers, self._body, self._timeout_s)


request = (
    RequestBuilder()
    .method("post")
    .url("https://api.example.com/orders")
    .header("Authorization", "Bearer <token>")
    .json({"sku": "A-17", "qty": 2})
    .timeout(5)
    .build()
)
```

```typescript
interface HttpRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
  readonly timeoutMs: number;
}

class RequestBuilder {
  private _method = "GET";
  private _url?: string;
  private _headers: Record<string, string> = {};
  private _body?: string;
  private _timeoutMs = 10_000;

  method(method: string): this {
    this._method = method.toUpperCase();
    return this;
  }

  url(url: string): this {
    this._url = url;
    return this;
  }

  header(name: string, value: string): this {
    this._headers[name.toLowerCase()] = value;
    return this;
  }

  json(payload: unknown): this {
    this._body = JSON.stringify(payload);
    return this.header("content-type", "application/json");
  }

  timeout(ms: number): this {
    this._timeoutMs = ms;
    return this;
  }

  build(): HttpRequest {
    // Cross-field rules: no single setter can check these, because order is free.
    if (!this._url) throw new Error("a request needs a url");
    if (this._body !== undefined && ["GET", "HEAD"].includes(this._method)) {
      throw new Error(`${this._method} requests cannot have a body`);
    }
    if (this._timeoutMs <= 0) throw new Error("timeout must be positive");
    return Object.freeze({
      method: this._method,
      url: this._url,
      headers: Object.freeze({ ...this._headers }), // a copy, read-only
      body: this._body,
      timeoutMs: this._timeoutMs,
    });
  }
}

const request = new RequestBuilder()
  .method("post")
  .url("https://api.example.com/orders")
  .header("Authorization", "Bearer <token>")
  .json({ sku: "A-17", qty: 2 })
  .timeout(5000)
  .build();
```

> **Warning**
>
> A builder whose steps all `return self` is **mutable, and shared by anyone holding it**. Suppose you write `base = RequestBuilder().header("Authorization", t)`, then `a = base.url("/a").build()`, then `b = base.method("DELETE").url("/b").build()`. The second line changed `base` itself, so any later request built from `base` is a DELETE too. If you want reusable templates, make each step return a *new* builder. Otherwise, document that a builder is used once and thrown away.

<a id="5-prototype-and-registry"></a>

## 5. Prototype & Registry

- **New objects come from** `copying a configured one` <!-- ok -->
- **A prototype registry maps** `a name to a ready-made object` <!-- good -->
- **A shallow copy shares** `every nested object` <!-- bad -->
- **Copy tools** `copy.deepcopy · structuredClone` <!-- ok -->

**Prototype** creates new objects by *copying* an existing, fully configured one, instead of building each one from scratch. A **prototype registry** keeps a named set of these ready-made examples, such as "starter plan" and "enterprise plan", and hands out a fresh copy on request. It fits when an object is fiddly or expensive to set up, because it's loaded from config, has dozens of settings or was tuned by hand, and what you really want is "one like that, with a tweak". Compare it with the factory registry in the next section. A *factory* registry stores **recipes** (classes and constructors) and builds each object from nothing. A *prototype* registry stores **finished examples** and copies them.

> **Analogy** 📄
>
> **Picture it — a folder of document templates**
>
> You don't write every invoice from a blank page. You open the templates folder, duplicate "Invoice — EU customer", and change the name and the amount. The folder is the registry, and each template is a prototype. Now imagine the copies all *pointed at* the template's logo file instead of including their own. Recolour the logo in one invoice, and every invoice, template included, changes with it. That's exactly what a shallow copy does.

> **Interactive animation:** `prototype-copy` — rendered by the page script in the HTML version.

The cloning call is the easy part. The real decision is **how deep the copy goes**. `copy.copy(x)`, `dict(x)`, `{ ...x }` and `Object.assign({}, x)` all copy just *one level*. The new object gets its own top-level fields, but nested dicts and lists are still shared with the original. A registry has to hand out copies that are independent all the way down. Read-only parts can stay shared on purpose, because nobody can change them.

- **Strength — configured objects are cheap to make.** Ten plan tiers or document templates are built once, then copied as often as needed.
- **Strength — callers ask by name.** `plans.create("enterprise")` needs no class name and no knowledge of how that plan was put together.
- **Weakness — copy depth is a decision for every field.** Each field must be either copied or deliberately shared, and an unclassified field is a bug waiting to happen.
- **Weakness — deep copies can surprise you.** `deepcopy` walks the whole object graph, so it's slow for big objects and copies things you never meant to, like locks and connections.

**Interview question**

*Every new tenant starts from a plan template (starter, pro or enterprise) with feature flags, limits and regions. Build a registry that hands out copies, and guarantee that changing one tenant can never affect another tenant or the template.*

The registry is a dictionary from plan name to a **prototype** object. `create(name, **overrides)` looks the prototype up, makes a **deep copy** so that the nested `features` dict and `regions` list are new objects too, then applies the caller's overrides. It's the same production details as any registry: registering a name twice is an error, an unknown name fails with the list of valid names, and an override for a field that doesn't exist is rejected instead of silently creating a new attribute. The test is what proves the guarantee. Change one copy's nested data, then check that a second copy and a freshly created one are both untouched.

**Answer — a prototype registry that hands out independent copies**

```python
import copy
from dataclasses import dataclass, field


@dataclass
class Plan:
    name: str
    features: dict[str, bool] = field(default_factory=dict)
    limits: dict[str, int] = field(default_factory=dict)
    regions: list[str] = field(default_factory=list)


class PlanRegistry:
    """Named, ready-made prototypes. create() always hands out an independent copy."""

    def __init__(self) -> None:
        self._prototypes: dict[str, Plan] = {}

    def register(self, key: str, prototype: Plan) -> None:
        if key in self._prototypes:
            raise ValueError(f"plan {key!r} registered twice")
        self._prototypes[key] = prototype

    def create(self, key: str, **overrides) -> Plan:
        if key not in self._prototypes:
            known = ", ".join(sorted(self._prototypes))
            raise ValueError(f"unknown plan {key!r}; known: {known}")
        clone = copy.deepcopy(self._prototypes[key])  # nested dicts and lists are copied too
        for attr, value in overrides.items():
            if not hasattr(clone, attr):
                raise AttributeError(f"Plan has no field {attr!r}")
            setattr(clone, attr, value)
        return clone


plans = PlanRegistry()
plans.register("starter", Plan("starter", {"sso": False, "beta": False}, {"seats": 5}, ["eu-west-1"]))
plans.register("enterprise", Plan("enterprise", {"sso": True, "beta": False}, {"seats": 500}, ["eu-west-1", "us-east-1"]))


def test_tenants_never_share_state() -> None:
    acme = plans.create("enterprise", name="acme")
    globex = plans.create("enterprise", name="globex")
    acme.features["beta"] = True
    acme.regions.append("ap-south-1")
    assert globex.features["beta"] is False  # another tenant: untouched
    assert plans.create("enterprise").regions == ["eu-west-1", "us-east-1"]  # the prototype: untouched
```

```typescript
interface Plan {
  name: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  regions: string[];
}

class PlanRegistry {
  // Named, ready-made prototypes. create() always hands out an independent copy.
  private readonly prototypes = new Map<string, Plan>();

  register(key: string, prototype: Plan): void {
    if (this.prototypes.has(key)) throw new Error(`plan "${key}" registered twice`);
    this.prototypes.set(key, prototype);
  }

  create(key: string, overrides: Partial<Plan> = {}): Plan {
    const prototype = this.prototypes.get(key);
    if (!prototype) {
      const known = [...this.prototypes.keys()].sort().join(", ");
      throw new Error(`unknown plan "${key}"; known: ${known}`);
    }
    // Plain data, so structuredClone copies every level. Class instances would lose their methods.
    return { ...structuredClone(prototype), ...overrides };
  }
}

const plans = new PlanRegistry();
plans.register("starter", { name: "starter", features: { sso: false, beta: false }, limits: { seats: 5 }, regions: ["eu-west-1"] });
plans.register("enterprise", {
  name: "enterprise",
  features: { sso: true, beta: false },
  limits: { seats: 500 },
  regions: ["eu-west-1", "us-east-1"],
});

test("tenants never share state", () => {
  const acme = plans.create("enterprise", { name: "acme" });
  const globex = plans.create("enterprise", { name: "globex" });
  acme.features.beta = true;
  acme.regions.push("ap-south-1");
  expect(globex.features.beta).toBe(false); // another tenant: untouched
  expect(plans.create("enterprise").regions).toEqual(["eu-west-1", "us-east-1"]); // the prototype: untouched
});
```

> **Warning**
>
> **The shallow-copy bug ships quietly.** Every test that only reads a copy passes, and the first support engineer who flips a flag for one customer turns it on for all of them. Write the independence test above for any registry that hands out mutable objects. Also know the edges of the deep-copy tools. Python's `deepcopy` fails on objects holding locks or connections (`TypeError: cannot pickle '_thread.lock' object`). JavaScript's `structuredClone` throws on functions and turns class instances into plain objects. When a prototype holds such things, write an explicit `clone()` method that decides, field by field, what's copied and what's shared.

<a id="6-factories"></a>

## 6. Factories

- **Places that name concrete classes** `exactly 1` <!-- great -->
- **Callers edited per new type** `0` <!-- great -->
- **Three flavours** `simple · method · abstract` <!-- ok -->
- **Most common form** `a registry dict` <!-- good -->

A factory is code whose only job is to decide *which* class to create, and *how* to create it. Without one, `if provider == "stripe": StripeGateway(...) elif ...` gets copied into every place that needs a gateway, and every copy has to be found and updated when a provider is added. With a factory, the mapping from a name or a config value to a concrete class lives in one place, and everything else just asks for "a gateway". Three different things share the name. A **simple factory** is a function or registry that returns the right object. A **Factory Method** (GoF) is a base class that lets subclasses override the method that creates the object. An **Abstract Factory** creates a whole *family* of objects that must match each other. The simple factory with a registry is the one you'll write most often. Unlike the prototype registry in the previous section, this registry holds *recipes*: each entry builds a brand-new object from its arguments.

> **Analogy** 🍕
>
> **Picture it — ordering at the counter**
>
> You say "one margherita". You don't walk into the kitchen, choose the dough and light the oven. You don't even know whether today's chef uses gas or wood. The counter turns a name into the right process and hands you a finished pizza. When the menu gets a new item, the kitchen learns a new recipe, and customers order exactly as before.

> **Interactive animation:** `factory-registry` — rendered by the page script in the HTML version.

The registry is what keeps this *open for extension*. A new type adds one entry and touches nothing else, because the factory never names concrete classes in an `if` chain. It looks them up. Creating objects is the one job that can't be hidden behind an interface, because *somebody* has to call a constructor. A factory makes sure there's only one place that does it.

- **Strength — one place names the concrete classes.** A new provider is one new class and one registry entry. Callers that ask for "a sender" never change.
- **Strength — construction logic has a home.** Reading secrets, setting timeouts and wrapping in retries all stay out of business code.
- **Weakness — string lookups fail late.** A typo like `"emial"` in config fails at runtime, not at import. Check config at startup and fail loudly, listing the valid names.
- **Weakness — a factory for one class is noise.** If there is one implementation and no plan for a second, call the constructor.

**Interview question**

*Notification jobs arrive from a queue with a `channel` field: `"email"`, `"sms"` or `"push"`. Write the code that turns a job into the right sender, so that adding a channel needs no edits to existing code.*

The thing that varies is which sender class to create, and it's selected by a string, so a **registry** fits. It's a dictionary from channel name to constructor, plus a small `register` function, so each class registers itself next to its own definition. Then the consumer contains no `if` at all. Two details separate a production answer from a whiteboard one. First, registering the same name twice should be an error, not a silent overwrite. Second, an unknown channel should fail with a message that lists the valid ones, not with a bare `KeyError` three frames deep.

**Answer — a self-registering sender factory**

```python
from typing import Callable, Protocol


class Sender(Protocol):
    def send(self, to: str, body: str) -> None: ...


_SENDERS: dict[str, Callable[[dict], Sender]] = {}


def register(channel: str):
    """Class decorator: each class registers itself next to its own definition."""
    def decorate(cls):
        if channel in _SENDERS:
            raise ValueError(f"channel {channel!r} registered twice")
        _SENDERS[channel] = cls
        return cls
    return decorate


@register("email")
class EmailSender:
    def __init__(self, settings: dict) -> None:
        self._from = settings["email_from"]

    def send(self, to: str, body: str) -> None:
        print(f"email {self._from} -> {to}: {body}")


@register("sms")
class SmsSender:
    def __init__(self, settings: dict) -> None:
        self._number = settings["sms_number"]

    def send(self, to: str, body: str) -> None:
        print(f"sms {self._number} -> {to}: {body}")


def make_sender(channel: str, settings: dict) -> Sender:
    try:
        factory = _SENDERS[channel]
    except KeyError:
        known = ", ".join(sorted(_SENDERS))
        raise ValueError(f"unknown channel {channel!r}; known: {known}") from None
    return factory(settings)


def handle(job: dict, settings: dict) -> None:
    # The consumer never names a concrete class.
    make_sender(job["channel"], settings).send(job["to"], job["body"])
```

```typescript
interface Sender {
  send(to: string, body: string): Promise<void>;
}

type Settings = { emailFrom: string; smsNumber: string };
type SenderFactory = (settings: Settings) => Sender;

const senders = new Map<string, SenderFactory>();

export function register(channel: string, factory: SenderFactory): void {
  if (senders.has(channel)) throw new Error(`channel "${channel}" registered twice`);
  senders.set(channel, factory);
}

class EmailSender implements Sender {
  constructor(private readonly from: string) {}

  async send(to: string, body: string): Promise<void> {
    console.log(`email ${this.from} -> ${to}: ${body}`);
  }
}

class SmsSender implements Sender {
  constructor(private readonly number: string) {}

  async send(to: string, body: string): Promise<void> {
    console.log(`sms ${this.number} -> ${to}: ${body}`);
  }
}

register("email", (s) => new EmailSender(s.emailFrom));
register("sms", (s) => new SmsSender(s.smsNumber));

export function makeSender(channel: string, settings: Settings): Sender {
  const factory = senders.get(channel);
  if (!factory) {
    const known = [...senders.keys()].sort().join(", ");
    throw new Error(`unknown channel "${channel}"; known: ${known}`);
  }
  return factory(settings);
}

export async function handle(job: { channel: string; to: string; body: string }, settings: Settings) {
  // The consumer never names a concrete class.
  await makeSender(job.channel, settings).send(job.to, job.body);
}
```

> **Warning**
>
> Self-registration only works if the module that defines the class **actually gets imported**. If nobody imports a new `slack.py`, its decorator never runs, and the factory reports "unknown channel 'slack'" even though the class is right there in the repo. Import every plugin module in one explicit place, such as a package `__init__.py` or an `index.ts` barrel, so the list of channels is visible and easy to search.

---

<a id="unit-3"></a>

## Unit 3 — Structural Patterns

How objects fit together: wrappers that change an interface so things connect, wrappers that keep it and add behaviour, and shared objects that keep thousands of small ones cheap.

<a id="7-adapter-and-facade"></a>

## 7. Adapter & Facade

- **Adapter: interfaces bridged** `one to one` <!-- ok -->
- **Facade: subsystem calls hidden** `many behind one` <!-- great -->
- **Behaviour either one adds** `none` <!-- ok -->
- **Where they live** `at the boundary` <!-- good -->

Both are wrappers whose job is to *change the interface*. Neither adds behaviour. An **Adapter** makes an existing class fit an interface your code already expects. For example, a vendor SDK that offers `upload_blob(container, name, stream)` becomes your own `Storage.put(key, data)`. A **Facade** puts one simple entry point in front of a complicated subsystem. For example, one `place_order(cart)` call replaces eight calls across inventory, pricing, payments and shipping that have to happen in the right order. Adapter *translates*: the interface you need already exists, and you make something fit it. Facade *simplifies*: you invent a new, smaller interface over many parts.

> **Analogy** 🧳
>
> **Picture it — a travel plug and a hotel concierge**
>
> A travel plug doesn't generate electricity. It changes the shape of your plug so your charger fits the wall. That's an Adapter: same function, different shape. A concierge is a Facade. You say "dinner for two at eight", and they call the restaurant, book the taxi and tell the doorman. Those services still exist, and you could call them yourself. You just don't have to.

> **Interactive animation:** `adapter-facade` — rendered by the page script in the HTML version.

Both live at **boundaries**: between your code and someone else's, or between a subsystem and the code that uses it. That's why they matter so much when things change. When the vendor ships v3 of its SDK with renamed methods, only the adapter changes. When the checkout steps get reordered, only the facade changes. Everything behind the boundary is protected.

- **Strength — vendors stay at the edge.** When an SDK renames its methods, you change one adapter, not 60 call sites. Your domain code never imports the vendor's package.
- **Strength — a facade gives the common path one obvious entry point.** New team members call `place_order()`. Only code that really needs fine control goes underneath it.
- **Weakness — leaky adapters.** If the vendor's exceptions, IDs or pagination tokens pass straight through, you've added a layer and gained no isolation. Translate the errors and types as well as the method names.
- **Weakness — a facade can grow into a god object.** "Just add it to the facade" turns a thin coordinator into a 3,000-line class. A facade should coordinate calls, not contain business rules.

**Interview question**

*Your app has a `Storage` interface with `put(key, data)` and `get(key)`. Integrate a vendor blob SDK whose API is `upload_blob(container, name, stream, overwrite)` and `download_blob(container, name)`, and which raises `BlobNotFound`.*

This is a classic *object adapter*: a class that implements `Storage`, holds the SDK client, and translates in both directions. It translates **arguments** (a key becomes a container plus a blob name, and bytes become a stream), **return values** (a download stream becomes bytes) and, the part most answers miss, **errors**. `BlobNotFound` must become your own `KeyNotFound`. Otherwise every caller has to import the vendor's exception to handle a missing key, and you've lost the isolation that was the whole point. Writing an in-memory implementation alongside it gives tests and local development a second implementation, which is what justifies having the interface.

**Answer — an adapter that translates calls, values and errors**

```python
import io
from typing import Protocol

from blobsdk import BlobClient, BlobNotFound  # the vendor's types stay in this file


class KeyNotFound(Exception):
    """Our error type. Callers never see the vendor's exceptions."""


class Storage(Protocol):
    def put(self, key: str, data: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...


class BlobStorageAdapter:
    """Implements our Storage interface on top of the vendor SDK."""

    def __init__(self, client: BlobClient, container: str) -> None:
        self._client = client
        self._container = container

    def put(self, key: str, data: bytes) -> None:
        self._client.upload_blob(self._container, name=key, stream=io.BytesIO(data), overwrite=True)

    def get(self, key: str) -> bytes:
        try:
            stream = self._client.download_blob(self._container, name=key)
        except BlobNotFound as exc:
            raise KeyNotFound(key) from exc  # translate errors, not just calls
        return stream.read()


class InMemoryStorage:
    """The second implementation: tests and local development."""

    def __init__(self) -> None:
        self._items: dict[str, bytes] = {}

    def put(self, key: str, data: bytes) -> None:
        self._items[key] = data

    def get(self, key: str) -> bytes:
        try:
            return self._items[key]
        except KeyError:
            raise KeyNotFound(key) from None
```

```typescript
import { BlobClient, BlobNotFoundError } from "blob-sdk"; // the vendor's types stay in this file

export class KeyNotFound extends Error {
  constructor(readonly key: string) {
    super(`key not found: ${key}`);
  }
}

export interface Storage {
  put(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Uint8Array>;
}

export class BlobStorageAdapter implements Storage {
  constructor(private readonly client: BlobClient, private readonly container: string) {}

  async put(key: string, data: Uint8Array): Promise<void> {
    await this.client.uploadBlob(this.container, key, data, { overwrite: true });
  }

  async get(key: string): Promise<Uint8Array> {
    try {
      const blob = await this.client.downloadBlob(this.container, key);
      return new Uint8Array(await blob.arrayBuffer());
    } catch (err) {
      if (err instanceof BlobNotFoundError) throw new KeyNotFound(key); // translate errors too
      throw err;
    }
  }
}

export class InMemoryStorage implements Storage {
  private readonly items = new Map<string, Uint8Array>();

  async put(key: string, data: Uint8Array): Promise<void> {
    this.items.set(key, data);
  }

  async get(key: string): Promise<Uint8Array> {
    const data = this.items.get(key);
    if (data === undefined) throw new KeyNotFound(key);
    return data;
  }
}
```

> **Tip**
>
> Adapter, Facade and Decorator (next section) can look almost identical in code: a class that holds another object and forwards calls to it. What tells them apart is **intent**. An Adapter *conforms to an interface that already exists*. A Facade *invents a new, simpler interface*. A Decorator *keeps the same interface and adds behaviour*. Name the class after the pattern you mean, such as `BlobStorageAdapter` or `CheckoutFacade`, so reviewers know which of the three you intended.

<a id="8-decorator-and-flyweight"></a>

## 8. Decorator & Flyweight

- **Interface changed** `no` <!-- great -->
- **Decorator adds behaviour** `yes, and stacks` <!-- good -->
- **Flyweight shares** `immutable intrinsic state` <!-- good -->
- **Mutating a shared flyweight** `changes every user` <!-- bad -->

Both patterns are about what sits behind an object reference. A **Decorator** wraps an object in another object with *exactly the same interface*, so callers can't tell the difference, and adds behaviour around the call, such as logging, retries, caching, metrics or compression. Decorators stack: `Cached(Retrying(Timed(client)))` is three layers around the same core. A **Flyweight** goes the other way. Instead of adding layers to one object, it lets thousands of objects *share* one object for the part they have in common, so memory grows with the number of *kinds* of thing, not the number of things.

> **Analogy** 🎁
>
> **Picture it — gift wrap and a typeface**
>
> Wrap a present in paper, then put it in a box, then add a ribbon. Each layer adds something, and the present inside doesn't change. That's Decorator. A typeface is a Flyweight. A page holds thousands of letter "e"s, but the font stores the shape of "e" once. Each "e" on the page only records where it sits and how big it is.

> **Interactive animation:** `wrapper-layers` (variant `decorator`) — rendered by the page script in the HTML version.

Watch the request travel. Each decorator layer runs code *on the way in* (start a timer, check the cache) and *on the way out* (record the duration, store the result). A layer can also end the trip early: a cache hit never reaches the network. That's why the **order of the layers matters**. A cache outside a retry layer answers before any retry happens. A cache inside it gets checked again on every attempt.

Flyweight is a memory optimisation for huge numbers of similar objects. Split each object's state in two. **Intrinsic** state is the same across many objects and never changes, such as a map marker's icon bitmap and colour, or a glyph's outline. **Extrinsic** state differs per object, such as the marker's position and label. Put the intrinsic part in a flyweight, create each distinct one once through a caching factory, and let every object hold a reference to it plus its own extrinsic state.

> **Interactive animation:** `flyweight-share` — rendered by the page script in the HTML version.

**Flyweight — a caching factory for shared, frozen styles**

```python
from dataclasses import dataclass
from functools import cache


@dataclass(frozen=True)  # shared, so it must never change
class MarkerStyle:
    icon: str
    colour: str


@cache  # one MarkerStyle per (icon, colour), created on first request
def marker_style(icon: str, colour: str) -> MarkerStyle:
    return MarkerStyle(icon, colour)  # real code would load the ~24 KB bitmap here


@dataclass
class Marker:
    lat: float  # extrinsic: different for every marker
    lon: float
    style: MarkerStyle  # intrinsic: a reference to a shared flyweight


a = Marker(51.5, -0.1, marker_style("pin", "red"))
b = Marker(48.9, 2.4, marker_style("pin", "red"))
assert a.style is b.style  # one object, shared
```

```typescript
interface MarkerStyle {
  readonly icon: string;
  readonly colour: string;
}

const styles = new Map<string, MarkerStyle>();

// One MarkerStyle per (icon, colour), created on first request.
export function markerStyle(icon: string, colour: string): MarkerStyle {
  const key = `${icon}/${colour}`;
  let style = styles.get(key);
  if (!style) {
    style = Object.freeze({ icon, colour }); // shared, so it must never change
    styles.set(key, style);
  }
  return style;
}

type Marker = { lat: number; lon: number; style: MarkerStyle }; // position is extrinsic

const a: Marker = { lat: 51.5, lon: -0.1, style: markerStyle("pin", "red") };
const b: Marker = { lat: 48.9, lon: 2.4, style: markerStyle("pin", "red") };
console.log(a.style === b.style); // true: one object, shared
```

> **Tip**
>
> A flyweight factory is **a cache keyed by value**. Singleton gives you one instance per class; Flyweight gives you one instance per distinct intrinsic state. You already use flyweights: interned strings, CPython's cached small integers, and `functools.cache` on a factory function all hand back the same object for the same value. Reach for the pattern only after measuring. It pays when objects number in the tens of thousands and share a heavy part.

- **Strength — Decorator adds cross-cutting concerns without touching the class.** Retries, timing, auth and caching each live in one small wrapper, and they work with any implementation of the interface. Production gets `Cached(Retrying(real))`, and tests get `real`.
- **Strength — Flyweight makes memory grow per kind, not per object.** A million markers that use three styles store three icons, not a million.
- **Weakness — decorator order changes behaviour.** Logging outside auth records rejected requests; logging inside auth doesn't. Both can be right. Picking one by accident is the bug.
- **Weakness — a flyweight must be immutable.** If one marker sets `style.colour = "yellow"` to show it's selected, every marker sharing that style turns yellow. Freeze flyweights, and keep per-object variation like "selected" in the extrinsic state.

**Interview question**

*Add retries with exponential backoff to any function that calls the network, without editing those functions.*

It takes a function and returns a function with the same signature that does something extra around the call, so it's a decorator. In Python that's literally a function decorator; in TypeScript, it's a higher-order function that keeps the signature. Three details make an answer production-grade. First, retry only **transient** errors, like timeouts, dropped connections and 503s. Retrying a 400 just repeats your own mistake. Second, back off **exponentially with jitter**, so a thousand clients don't retry at the same instant. Third, in Python, use `functools.wraps` so the wrapped function keeps its name and docstring for logs and debuggers.

**Answer — a retry decorator**

```python
import functools
import random
import time

import requests


class TransientError(Exception):
    """A failure worth trying again: the server said 'not now', not 'no'."""


RETRYABLE = (TransientError, requests.Timeout, requests.ConnectionError)


def retry(attempts: int = 3, base_delay: float = 0.2):
    def decorate(fn):
        @functools.wraps(fn)  # keep the name and docstring for logs and debuggers
        def wrapper(*args, **kwargs):
            for attempt in range(1, attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except RETRYABLE:
                    if attempt == attempts:
                        raise
                    # exponential backoff with full jitter: 0-0.2s, 0-0.4s, 0-0.8s ...
                    time.sleep(random.uniform(0, base_delay * 2 ** (attempt - 1)))
        return wrapper
    return decorate


@retry(attempts=4)
def fetch_exchange_rate(currency: str) -> float:
    response = requests.get(f"https://rates.example.com/{currency}", timeout=2)
    if response.status_code == 503:
        raise TransientError("rates service unavailable")
    response.raise_for_status()  # a 4xx is our bug: raise it, don't retry it
    return response.json()["rate"]
```

```typescript
export class TransientError extends Error {}

const isTransient = (err: unknown) =>
  err instanceof TransientError || (err instanceof DOMException && err.name === "TimeoutError");

export function withRetry<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  { attempts = 3, baseDelayMs = 200 } = {},
): (...args: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await fn(...args);
      } catch (err) {
        if (!isTransient(err) || attempt >= attempts) throw err;
        // exponential backoff with full jitter: 0-200ms, 0-400ms, 0-800ms ...
        const delay = Math.random() * baseDelayMs * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };
}

async function fetchExchangeRate(currency: string): Promise<number> {
  const res = await fetch(`https://rates.example.com/${currency}`, { signal: AbortSignal.timeout(2000) });
  if (res.status === 503) throw new TransientError("rates service unavailable");
  if (!res.ok) throw new Error(`rates: HTTP ${res.status}`); // a 4xx is our bug: don't retry it
  return (await res.json()).rate;
}

export const getExchangeRate = withRetry(fetchExchangeRate, { attempts: 4 });
```

> **Warning**
>
> Python's `@decorator` syntax and the GoF Decorator pattern are **related, but they aren't the same thing**. `@retry` wraps a *function*, once, when the module loads, and every caller gets the wrapped version. The GoF pattern wraps an *object*, at runtime, so you can apply it to one instance and not another. It also has to implement the *whole* interface, including methods you didn't want to change, which you forward by hand. Interviewers like to check that you know the difference.

---

<a id="unit-4"></a>

## Unit 4 — Behavioural Patterns

How objects split up work and talk to each other: algorithms you can swap at runtime, and events that any number of listeners can react to.

<a id="9-strategy"></a>

## 9. Strategy

- **Classes added** `1 interface + 1 per algorithm` <!-- ok -->
- **When the algorithm is chosen** `at runtime` <!-- great -->
- **if/elif branches left in the caller** `none` <!-- great -->
- **In Python and TypeScript, often just** `a function` <!-- good -->

Strategy puts a family of interchangeable algorithms behind one interface, so the code that uses them doesn't know which one it has. The caller (the *context*) holds a strategy and calls it. Choosing the strategy is somebody else's job. Use it when the same task can be done several ways, and the choice depends on configuration, the customer or something known only at runtime. Pricing rules, retry policies, sort orders, compression codecs and route planners are all common examples. The tell-tale sign that you need it is an `if/elif` on a "type" or "mode" that grows by one branch every few weeks.

> **Analogy** 🗺️
>
> **Picture it — a maps app**
>
> You type the destination once, then tap *car*, *bike* or *walk*. The map, the ETA and the turn-by-turn screen all stay the same. Only the route-finding algorithm changes. When the team added *public transport*, they didn't rewrite the app. They wrote one more routing strategy and added one more button.

> **Interactive animation:** `strategy-swap` — rendered by the page script in the HTML version.

Notice that `Checkout` never changed in the animation. It asked the same question, *"what does shipping cost for this cart?"*, and got three different answers because it was holding three different objects. That is the whole pattern, and it's why the caller needs no `if` statements.

- **Strength — gets rid of the growing if/elif.** Each new pricing rule is a new class or function, not one more branch in a 300-line method nobody wants to touch.
- **Strength — each algorithm can be tested alone.** You can test `FreeOver` with three asserts, without building a checkout.
- **Weakness — someone still has to choose.** The selection logic doesn't disappear; it moves. Usually it ends up in a factory or a config map (section 6).
- **Weakness — overkill for two stable branches.** If there are two cases and there will only ever be two, an `if` is clearer than an interface and two classes.

**Interview question**

*Design shipping-cost calculation for a checkout that supports flat rate, by weight, and free over a threshold. Marketing adds a new rule every few months.*

The part that changes is the **rule**, and the checkout around it stays the same, so the rule is the strategy, with one method: `cost(cart)`. Free-over-threshold is the interesting one, because it *wraps another rule*: "free if the subtotal is over £50, otherwise whatever the base rule says". So it takes another strategy in its constructor. Composition gives you that combination for free, while an `if` chain would have to copy the base rule's logic into a new branch. Use exact decimal money or integer pence, never floats. And notice that `Checkout` takes the rule in its constructor. It doesn't look the rule up itself.

**Answer — shipping rules as interchangeable strategies**

```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class Cart:
    subtotal: Decimal
    weight_kg: Decimal


class ShippingRule(Protocol):
    def cost(self, cart: Cart) -> Decimal: ...


@dataclass(frozen=True)
class FlatRate:
    amount: Decimal

    def cost(self, cart: Cart) -> Decimal:
        return self.amount


@dataclass(frozen=True)
class ByWeight:
    per_kg: Decimal
    minimum: Decimal = Decimal("3.00")

    def cost(self, cart: Cart) -> Decimal:
        return max(self.minimum, cart.weight_kg * self.per_kg)


@dataclass(frozen=True)
class FreeOver:
    threshold: Decimal
    otherwise: ShippingRule  # a strategy that wraps another strategy

    def cost(self, cart: Cart) -> Decimal:
        if cart.subtotal >= self.threshold:
            return Decimal("0")
        return self.otherwise.cost(cart)


class Checkout:
    def __init__(self, shipping: ShippingRule) -> None:
        self._shipping = shipping

    def total(self, cart: Cart) -> Decimal:
        return cart.subtotal + self._shipping.cost(cart)


rule = FreeOver(Decimal("50"), otherwise=ByWeight(per_kg=Decimal("1.20")))
cart = Cart(subtotal=Decimal("42.00"), weight_kg=Decimal("4"))
print(Checkout(rule).total(cart))  # 42.00 + max(3.00, 4.80) = 46.80
```

```typescript
interface Cart {
  subtotalPence: number;
  weightGrams: number;
}

interface ShippingRule {
  cost(cart: Cart): number;
}

class FlatRate implements ShippingRule {
  constructor(private readonly pence: number) {}

  cost(): number {
    return this.pence;
  }
}

class ByWeight implements ShippingRule {
  constructor(private readonly pencePerKg: number, private readonly minimumPence = 300) {}

  cost(cart: Cart): number {
    return Math.max(this.minimumPence, Math.ceil((cart.weightGrams / 1000) * this.pencePerKg));
  }
}

class FreeOver implements ShippingRule {
  // A strategy that wraps another strategy.
  constructor(private readonly thresholdPence: number, private readonly otherwise: ShippingRule) {}

  cost(cart: Cart): number {
    return cart.subtotalPence >= this.thresholdPence ? 0 : this.otherwise.cost(cart);
  }
}

class Checkout {
  constructor(private readonly shipping: ShippingRule) {}

  total(cart: Cart): number {
    return cart.subtotalPence + this.shipping.cost(cart);
  }
}

const rule = new FreeOver(5000, new ByWeight(120));
console.log(new Checkout(rule).total({ subtotalPence: 4200, weightGrams: 4000 })); // 4200 + 480 = 4680
```

> **Tip**
>
> In Python and TypeScript, **a strategy with one method and no state is just a function**. `sorted(orders, key=by_total)` is the Strategy pattern, and so is `orders.sort((a, b) => a.total - b.total)`. Reach for a class when the strategy has configuration (a rate, a threshold), needs more than one method, or has to be named in logs and config. Otherwise, pass the function.

<a id="10-observer"></a>

## 10. Observer

- **What the publisher knows** `only a callback type` <!-- great -->
- **Adding a subscriber** `no publisher edits` <!-- great -->
- **Notification order** `don't rely on it` <!-- bad -->
- **The classic leak** `a forgotten unsubscribe` <!-- bad -->

Observer lets one object, the **subject** or *publisher*, notify any number of other objects, the **observers** or *subscribers*, when something happens, without knowing who they are. Observers register themselves; the subject keeps a list and calls each one. It's the pattern behind DOM events, Node's `EventEmitter`, UI state subscriptions, Django signals and every requirement that says "when X happens, also do Y". It replaces "the order service calls the email service, the loyalty service and analytics" with "the order service announces `order_placed`, and whoever cares listens".

> **Analogy** 📰
>
> **Picture it — a newspaper subscription**
>
> The paper doesn't know who you are beyond an address on a list. You subscribe, and the paper arrives every morning; you cancel, and it stops. The newsroom doesn't change how it writes the paper when a new reader signs up. But if you move house and forget to cancel, papers keep piling up at an empty address. That's the classic Observer memory leak.

> **Interactive animation:** `observer-notify` — rendered by the page script in the HTML version.

Look at the **direction of the dependency** in the animation. Without Observer, the order service imports the email module, the loyalty module and the analytics module, so the core of the system depends on its edges. With Observer, the edges import the core's event type, and the core imports nothing. That reversal is why Observer is the standard way to keep a domain model small while features grow around it.

- **Strength — new reactions don't touch existing code.** Loyalty points, analytics and the receipt email are three subscribers; a fourth touches no existing code.
- **Strength — the dependency points inward.** The core doesn't import the email module; the email module imports the core's event. The core stays small and stable.
- **Weakness — control flow becomes invisible.** You can't answer "what happens when an order is placed?" by reading `place_order()` any more. You have to find every subscriber.
- **Weakness — one failing observer can stop the rest.** If subscriber two raises, does subscriber three still run? Decide on purpose, because the default answer is "no".

**Interview question**

*Implement an in-process event bus where handlers can subscribe and unsubscribe, a failing handler doesn't stop the others, and forgetting to clean up is hard to do by accident.*

Keep a collection of handlers per event name. The key design choice is that `subscribe` **returns an unsubscribe function**. The code that subscribed always holds the way to clean up, which is the same idea React effect cleanups and RxJS subscriptions use. When publishing, loop over a **copy** of the handler list. Otherwise, a handler that unsubscribes itself during the loop changes the list under you, and the next handler gets skipped. Wrap each handler call in a `try`, log the failure, and carry on, so one broken subscriber can't stop the others.

**Answer — a small, safe event bus**

```python
import logging
from collections import defaultdict
from typing import Any, Callable

Handler = Callable[[dict[str, Any]], None]
log = logging.getLogger(__name__)


class EventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Handler]] = defaultdict(list)

    def subscribe(self, event: str, handler: Handler) -> Callable[[], None]:
        self._handlers[event].append(handler)

        def unsubscribe() -> None:
            if handler in self._handlers[event]:
                self._handlers[event].remove(handler)

        return unsubscribe  # the subscriber always holds the way to clean up

    def publish(self, event: str, payload: dict[str, Any]) -> None:
        for handler in list(self._handlers[event]):  # a copy: handlers may unsubscribe mid-loop
            try:
                handler(payload)
            except Exception:
                log.exception("handler %r failed for %s", handler, event)


bus = EventBus()
bus.subscribe("order_placed", lambda e: print("email receipt to", e["email"]))
stop_points = bus.subscribe("order_placed", lambda e: print("award points:", e["total"] // 100))

bus.publish("order_placed", {"order_id": "A-1", "email": "ana@example.com", "total": 4200})
stop_points()  # e.g. the loyalty feature is switched off
```

```typescript
type Handler<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<any>>>();

  subscribe<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler); // the subscriber holds the cleanup
  }

  publish<K extends keyof Events>(event: K, payload: Events[K]): void {
    // A copy: handlers may unsubscribe while we loop.
    for (const handler of [...(this.handlers.get(event) ?? [])]) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`handler failed for ${String(event)}`, err);
      }
    }
  }
}

type ShopEvents = {
  order_placed: { orderId: string; email: string; total: number };
  order_cancelled: { orderId: string; reason: string };
};

const bus = new EventBus<ShopEvents>();
bus.subscribe("order_placed", (e) => console.log("email receipt to", e.email));
const stopPoints = bus.subscribe("order_placed", (e) => console.log("award points:", Math.floor(e.total / 100)));

bus.publish("order_placed", { orderId: "A-1", email: "ana@example.com", total: 4200 });
stopPoints(); // e.g. the loyalty feature is switched off
```

> **Warning**
>
> In-process observers run **synchronously, on the publisher's call stack, and inside its database transaction**. If the email subscriber takes two seconds, `place_order()` takes two seconds. If it raises and you don't catch it, the order can roll back. There's a subtler bug too: an observer that sends a "your order is confirmed" email *before* the transaction commits will occasionally confirm an order that then rolls back. Anything slow, remote or irreversible belongs behind a queue, published after the commit, not in a direct callback.

---

<a id="unit-5"></a>

## Unit 5 — Patterns in Practice

When a language feature replaces a pattern outright, and how to pick the right one from everything above.

<a id="11-patterns-as-functions"></a>

## 11. Patterns in a Language With Functions

- **GoF patterns simpler in dynamic languages** `16 of 23 (Norvig, 1996)` <!-- good -->
- **Strategy becomes** `a function argument` <!-- great -->
- **Command becomes** `a closure` <!-- great -->
- **Iterator becomes** `a generator` <!-- great -->

The GoF book was written in 1994 with examples in C++ and Smalltalk. Many of its patterns are ways to pass *behaviour* around in a language where behaviour can only travel inside an object. Python and TypeScript have first-class functions, closures, generators, decorators and modules, so several patterns shrink to a single language feature. The *idea* survives, because you still separate the part that varies from the part that doesn't. The class diagram often doesn't survive. In a 1996 talk, Peter Norvig showed that 16 of the 23 GoF patterns become "invisible or simpler" in dynamic languages like Lisp and Dylan, and the same reasoning applies to Python and TypeScript.

> **Analogy** ✂️
>
> **Picture it — a sewing pattern versus a shop-bought shirt**
>
> A sewing pattern tells you how to cut cloth into a shirt. If the shop already sells the shirt you want, you don't need the pattern. Knowing the pattern still tells you why the seams are where they are. Language features are the shop-bought shirts, and knowing the pattern helps you see what `sorted(key=...)` is quietly doing for you.

> **Interactive animation:** `pattern-to-function` — rendered by the page script in the HTML version.

| Pattern | Class-based form | Idiomatic Python / TypeScript |
| --- | --- | --- |
| Strategy | an interface plus one class per algorithm | pass a function: `key=`, a compare callback |
| Command | a class with `execute()` | a closure, or `functools.partial` |
| Observer | a subject holding observer objects | a list of callbacks, `EventEmitter`, signals |
| Iterator | a class with `has_next()` and `next()` | a generator function using `yield` |
| Template Method | an abstract base class with hook methods | a function that takes the hooks as arguments |
| Decorator (of functions) | a wrapper class with the same interface | `@decorator` or a higher-order function |
| Singleton | a private constructor plus `instance()` | a module-level object |
| Factory | a factory class | a dict of constructors; classes are already callable |
| Visitor | double dispatch through `accept()` | `match`, `functools.singledispatch`, a `switch` on a tagged union |

- **Strength — less code, same decoupling.** A `key=` function keeps `sorted` closed for modification just as well as a `Comparator` class does, in one line.
- **Strength — simpler tests.** Pass a lambda as the fake. No mock framework, no extra class.
- **Weakness — functions are bad at holding a lot of state.** Once a "strategy" needs config, a cache and two operations, closures returning closures are harder to read than a small class. Turn it into a class.
- **Weakness — anonymous functions hide in stack traces.** A pipeline of lambdas fails with `<lambda>` frames and nothing else to go on. Give names to the functions that will show up in errors.

**Interview question**

*Rewrite a class-based Command for a background job queue using functions. When would you keep the class?*

The Command pattern turns a request into an object so it can be queued, logged, retried or undone (the [detailed course](design-patterns-detailed-course.html) covers it in full). Here the job only needs "do this later, with these arguments", which is exactly what a closure or `functools.partial` captures. The queue stores callables and the worker calls them, knowing nothing about what they do. That's the whole Command pattern in two lines. Keep a class, or plain data with a type tag, when the command needs **more than one operation** (`execute` and `undo`), when it has to be **serialised** to cross a process boundary (you can't put a closure on Redis, but you can put a dict there), or when it needs a **name or ID** for logs, metrics and deduplication.

**Answer — commands as closures, and when they must become data**

```python
from functools import partial
from queue import Queue
from typing import Callable


def send_email(user_id: str, template: str) -> None:
    print(f"sending {template} to {user_id}")


def resize_avatar(user_id: str, size: int) -> None:
    print(f"resizing avatar for {user_id} to {size}px")


# In-process: a command is just a callable with its arguments bound.
jobs: Queue[Callable[[], None]] = Queue()
jobs.put(partial(send_email, "u-42", "welcome"))
jobs.put(lambda: resize_avatar("u-42", size=256))

while not jobs.empty():
    jobs.get()()  # the worker knows nothing about what the job does


# Across processes: closures can't be serialised, so the command becomes data
# with a type tag, and a table maps each tag back to its behaviour.
HANDLERS: dict[str, Callable[..., None]] = {
    "send_email": send_email,
    "resize_avatar": resize_avatar,
}


def run_message(message: dict) -> None:
    args = dict(message)  # don't mutate the caller's message
    kind = args.pop("kind")
    HANDLERS[kind](**args)


run_message({"kind": "resize_avatar", "user_id": "u-42", "size": 256})
```

```typescript
async function sendEmail(userId: string, template: string): Promise<void> {
  console.log(`sending ${template} to ${userId}`);
}

async function resizeAvatar(userId: string, size: number): Promise<void> {
  console.log(`resizing avatar for ${userId} to ${size}px`);
}

// In-process: a command is just a closure with its arguments captured.
type Job = () => Promise<void>;
const jobs: Job[] = [];
jobs.push(() => sendEmail("u-42", "welcome"));
jobs.push(() => resizeAvatar("u-42", 256));

for (const job of jobs.splice(0)) await job(); // the worker knows nothing about the job

// Across processes: closures can't be serialised, so the command becomes data
// with a type tag. The tagged union makes the compiler check every kind is handled.
type JobMessage =
  | { kind: "send_email"; userId: string; template: string }
  | { kind: "resize_avatar"; userId: string; size: number };

export async function runMessage(message: JobMessage): Promise<void> {
  switch (message.kind) {
    case "send_email":
      return sendEmail(message.userId, message.template);
    case "resize_avatar":
      return resizeAvatar(message.userId, message.size);
  }
}

await runMessage({ kind: "resize_avatar", userId: "u-42", size: 256 });
```

> **Key idea**
>
> The test for any pattern in a modern language is: **would a function do?** If the pattern's object has exactly one method and no state, it's a function dressed up as a class. Patterns earn their classes when the thing being passed around has several operations, carries state, or has to be named, stored or serialised.

<a id="12-the-whole-thing-on-one-page"></a>

## 12. The Whole Thing on One Page

Everything above, compressed into the questions you actually ask in a design review.

<a id="pick-a-pattern"></a>

### Pick a pattern by its symptom

| Symptom in the code | Pattern | What it isolates |
| --- | --- | --- |
| an `if/elif` on a type or mode that keeps growing | Strategy | the algorithm |
| `new ConcreteThing(...)` copied into many files | Factory or a registry | which class gets created |
| a constructor with eight arguments, or half-built objects | Builder | the assembly steps and their validation |
| "one like that, with a tweak" for objects that are fiddly to set up | Prototype with a registry | the ready-made examples to copy |
| `get_instance()` everywhere, and tests that depend on run order | Dependency injection with a composition root | who creates the collaborators |
| a vendor's types and errors spread through the domain | Adapter | the vendor's interface |
| eight calls that must happen in the right order to do one thing | Facade | the subsystem's complexity |
| retries, logging or caching copy-pasted around calls | Decorator | the cross-cutting behaviour |
| memory dominated by millions of near-identical objects | Flyweight | the shared, immutable state |
| "when X happens, also do Y and Z" | Observer | who reacts to an event |
| subclasses for every combination of two features | Composition (Bridge) | each axis of variation |

Undo, lazy loading, access checks, mode-dependent behaviour and request pipelines have patterns of their own (Command, Proxy, State and Chain of Responsibility). The [detailed course](design-patterns-detailed-course.html) covers them, along with the rest of the 23 GoF patterns.

<a id="same-shape-different-intent"></a>

### Same shape, different intent

Several patterns have identical class diagrams and differ only in *why* they exist. Naming the intent is most of the skill.

```text
A wrapper with the SAME interface as the object it wraps
    adds behaviour around calls ................. Decorator

A wrapper with a DIFFERENT interface
    conforms to an interface you already need ... Adapter
    invents a simpler interface over many parts . Facade

A registry of objects looked up by name
    holds recipes that build new objects ........ Factory
    holds finished examples to copy ............. Prototype

One shared instance handed to many users
    one per class, for the whole app ............ Singleton
    one per distinct value, immutable ........... Flyweight

An object holding a swappable collaborator
    chosen from outside, usually fixed .......... Strategy
```

<a id="questions-to-ask"></a>

### Questions to ask before reaching for a pattern

1. **What changes here, and how often?** If nothing varies, no pattern is needed. Write the straight-line code.
2. **Is there a second implementation today?** A test fake counts. A hypothetical future one usually doesn't.
3. **Would a function do?** One method and no state means a function, not a class.
4. **Can a newcomer find what actually runs?** Every layer of indirection should make the code easier to understand, not harder.
5. **Does the name say the intent?** `PaymentGatewayAdapter` tells reviewers far more than `PaymentGatewayWrapper`.

> **Key idea**
>
> **If you remember one sentence from this page:** a design pattern is a way to make one particular kind of change cheap, and it costs some indirection. Use a pattern where the code is actually changing, name it after its intent, and leave it out everywhere else. Patterns aren't a sign of good design. Code that is easy to change is.

<a id="where-next"></a>

### Where to go next

1. 📘 The [Design Patterns Detailed Course](design-patterns-detailed-course.html) covers all 23 GoF patterns from first principles, plus SOLID, UML, dependency injection, Repository and Unit of Work, functional patterns, anti-patterns, refactoring toward patterns and a practice roadmap.
2. 📚 Browse both courses in the [Design Patterns Courses catalog](design-patterns-courses.html).
3. 🧭 [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns) is an illustrated catalog of every GoF pattern, with the problem, the structure and code in many languages.
4. 🐍 [Brandon Rhodes — Python Design Patterns](https://python-patterns.guide/) explains which GoF patterns still matter in Python, and which a language feature has replaced.
5. 📖 *Design Patterns: Elements of Reusable Object-Oriented Software* by Gamma, Helm, Johnson and Vlissides (1994) is the original catalog. Read the first two chapters even if you only skim the rest.

> *"Program to an interface, not an implementation."* — Gamma, Helm, Johnson & Vlissides, *Design Patterns* (1994)
