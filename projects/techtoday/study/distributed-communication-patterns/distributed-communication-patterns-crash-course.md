<!--
Source: distributed-communication-patterns-crash-course.html
Title: Distributed Communication Crash Course | TechToday
Description: A visual crash course in how services talk to each other — sync vs async, gRPC, discovery, timeouts, retries, idempotency, circuit breakers, queues, delivery guarantees, the outbox, sagas and real-time push, each with an animation.
Theme-color: #0b0d10
Stylesheets: distributed-communication-patterns-study.css, ../../site-header.css
Scripts: distributed-communication-patterns-study.js
-->

Navigation: [TechToday](../../index.html) · [← Distributed Communication Courses](distributed-communication-patterns-courses.html)

<a id="distributed-communication-crash-course"></a>

# Distributed Communication Patterns

The moment your code makes a call that leaves the process, everything you knew about function calls stops being true. This page is the set of patterns that exist because of that one fact — the ones you will reach for every week. Mental model first, code second. Press **Play** on any animation to watch the idea move.

> **Key idea**
>
> Every pattern on this page answers one question: **how do you build something dependable out of components that can be slow, can be down, and can never tell you which?** Timeouts, retries, idempotency keys, circuit breakers, queues, outboxes and sagas are not seven unrelated tools. They are seven answers to that single question, and each one buys reliability with a currency you must be willing to spend: latency, duplication, staleness, or complexity.

<a id="table-of-contents"></a>

## Table of Contents

1. [The Third Outcome](#0-the-third-outcome)
2. [Synchronous or Asynchronous](#1-sync-or-async)
3. [REST, gRPC & GraphQL](#2-rest-grpc-graphql)
4. [Finding & Choosing an Instance](#3-discovery-and-load-balancing)
5. [Timeouts & Deadlines](#4-timeouts-and-deadlines)
6. [Retries, Backoff & Jitter](#5-retries-and-backoff)
7. [Idempotency](#6-idempotency)
8. [Circuit Breakers & Bulkheads](#7-circuit-breakers-and-bulkheads)
9. [Queues & Topics](#8-queues-and-topics)
10. [Delivery Guarantees & Ordering](#9-delivery-and-ordering)
11. [Dead Letters & Backpressure](#10-dead-letters-and-backpressure)
12. [The Dual Write & the Outbox](#11-the-outbox)
13. [Sagas](#12-sagas)
14. [Pushing to the Client](#13-pushing-to-the-client)
15. [The Whole Thing on One Page](#14-the-whole-thing-on-one-page)

<a id="0-the-third-outcome"></a>

## The Third Outcome

Before any pattern makes sense you need one idea. A local function call has two outcomes: it returns, or it throws. A **remote** call has three: it returns, it fails, or **you never find out**. That third outcome does not exist inside a process, it cannot be eliminated, and every single pattern in this course is machinery for surviving it.

> **Analogy** 📮
>
> **Picture it — posting a letter with no tracking**
>
> You post a cheque and hear nothing for a week. Did it get lost on the way there? Did it arrive and get lost in their office? Did they cash it and the receipt got lost on the way back? *You cannot tell.* And the decision you have to make — send another cheque or not — is exactly the decision your HTTP client makes on every timeout, dozens of times a second.

> **Interactive animation:** `partial-failure` — rendered by the page script in the HTML version.

Notice what went wrong there. Nobody wrote a bug. The server did its job, the network dropped one packet out of billions, and the client did the textbook thing. The double charge is an emergent property of a correct client talking to a correct server over an imperfect wire.

- **A timeout is not an error** — An HTTP `500` tells you the work failed. A timeout tells you *nothing* — the request may never have arrived, may have failed, or may have completely succeeded. Code that treats them identically is code that double-charges people.
- **Slow is worse than down** — A dead service gives you a fast connection-refused, which is easy to handle. A service answering in 30 seconds holds your threads, your connections and your memory hostage, and takes your service down with it. **Grey failure is the hard case.**

<a id="0-1-what-the-network-does-to-your-numbers"></a>

### What the network does to your numbers

- **In-process call** `~1 ns`
- **Same-datacentre RPC** `~0.5 ms`
- **Cross-region RPC** `~70 ms`
- **4G round trip** `~180 ms`

Those numbers are six orders of magnitude apart, and the spread is why a refactor that “just” moves a method into another service can make a page ten times slower. But latency is only half of it. The other half is arithmetic:

```text
chain of 4 services, each 99.9% available

                availability = 0.999 x 0.999 x 0.999 x 0.999 = 99.6%
                -> 3.5 hours of downtime per month, not 43 minutes

                p99 latency = p99(A) + p99(B) + p99(C) + p99(D)
                -> tails ADD; they do not average out
```

> **Warning**
>
> **Availability multiplies and latency adds.** Every synchronous dependency you put in a request path makes both worse, permanently. This is the real cost of a microservice boundary, and it is why the interesting question is never “should these be separate services?” but *“does this call have to be in the request path at all?”*

> **Tip**
>
> Two rules of thumb worth memorising before anything else. **First: the network is not reliable, not fast, not secure, and its topology changes** — these are four of the famous *eight fallacies of distributed computing*, and every outage you will ever debug is someone having assumed one of them. **Second: you cannot make a distributed call as safe as a local one; you can only make its failure cheap.**

<a id="1-sync-or-async"></a>

## Synchronous or Asynchronous

- **Sync latency** `sum of the chain`
- **Sync availability** `product of the chain`
- **Async latency** `one broker write`
- **Async consistency** `eventual`

This is the first and biggest fork in the road, and it is not really a technology choice. It is a choice about **who waits**. In a synchronous call the caller holds a connection open until the work is finished. In an asynchronous one the caller hands the work to a broker, gets an acknowledgement, and leaves.

> **Analogy** ☕
>
> **Picture it — a coffee shop**
>
> *Synchronous* is the barista taking your order, making it, and handing it over before serving the next person. Simple, and the queue is only as fast as the slowest drink. *Asynchronous* is the cashier writing your name on a cup and putting it on the rail: the till keeps moving, three baristas work the rail in parallel, and you find out your drink is ready later. The second design serves far more people — and introduces a state the first one never had: **paid for, not yet made**.

> **Interactive animation:** `sync-vs-async` — rendered by the page script in the HTML version.

- **Choose synchronous when the caller needs the answer** — A price, an authorisation, a seat availability, a login. If the next line of the caller's code cannot run without the result, a queue only adds machinery around a wait you still have to do.
- **Choose asynchronous when the caller needs an acknowledgement** — Send the email, update the search index, recalculate the recommendations, emit the audit record. Nobody is watching, so do not make a customer wait for it — and do not let its outage become yours.
- **The sync trap**“It is only one more call” is how a 200 ms endpoint becomes a 2 s endpoint over eighteen months, one reasonable pull request at a time.
- **The async trap** — Eventual consistency is a *product* problem, not just an engineering one. Somebody has to decide what the screen says while the order exists but is not yet paid for.

**Interview question**

*A user uploads a profile photo. What happens synchronously, and what happens asynchronously?*

Split by what the user must see before the request can return. They must see that the upload *succeeded* and, ideally, their new photo — so storing the original and returning its URL is synchronous. Everything derived from it is not: generating five thumbnail sizes, running content moderation, stripping EXIF, invalidating CDN paths, and notifying their followers. Each of those is slow, each can fail independently, and none of them should be able to make the upload button return an error.

The interesting part is the in-between state. Thumbnails are not ready yet, so the answer is not “do it later and hope” — it is to *design the intermediate state*: serve the original scaled by the browser until the thumbnail exists, or show a shimmer. That decision is the actual work of going asynchronous.

**Answer — synchronous path returns fast, work is queued**

```python
@app.post("/profile/photo", status_code=202)
async def upload_photo(user_id: str, file: UploadFile):
    # Synchronous: only what the user must see before the button stops spinning.
    key = f"users/{user_id}/original/{uuid.uuid4()}.jpg"
    await s3.put_object(Bucket=BUCKET, Key=key, Body=await file.read())

    await db.execute(
        "update users set photo_key = $1, photo_state = 'processing' where id = $2",
        key, user_id,
    )

    # Asynchronous: one event, four independent consumers, none in the request path.
    await outbox.append(
        topic="photo.uploaded",
        key=user_id,
        payload={"userId": user_id, "objectKey": key, "uploadedAt": now_iso()},
    )

    return {"state": "processing", "url": cdn_url(key)}
```

```javascript
app.post("/profile/photo", async (req, res) => {
  // Synchronous: only what the user must see before the button stops spinning.
  const key = `users/${req.userId}/original/${randomUUID()}.jpg`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: req.file.buffer }));

  await db.query(
    "update users set photo_key = $1, photo_state = 'processing' where id = $2",
    [key, req.userId],
  );

  // Asynchronous: one event, four independent consumers, none in the request path.
  await outbox.append({
    topic: "photo.uploaded",
    key: req.userId,
    payload: { userId: req.userId, objectKey: key, uploadedAt: new Date().toISOString() },
  });

  res.status(202).json({ state: "processing", url: cdnUrl(key) });
});
```

> **Interview**
>
> **The answer interviewers are listening for** is not “use a queue”. It is the sentence *“asynchronous buys availability and pays for it in consistency, so the real question is what the user sees in between”*. Naming the intermediate state is what separates someone who has read about queues from someone who has shipped one.

<a id="2-rest-grpc-graphql"></a>

## REST, gRPC & GraphQL

- **REST + JSON** `universal`
- **gRPC + protobuf** `4× smaller`
- **GraphQL** `one flexible endpoint`

Once you have decided to make a synchronous call, you pick a style. All three of these are request/response over HTTP; they differ in *who decides the shape of the response* and *how much the two ends must agree in advance*.

> **Interactive animation:** `rpc-modes` — rendered by the page script in the HTML version.

The animation shows gRPC's four call shapes, because those are the ones people have not met. The encoding difference matters just as much, and it is where most of the performance argument lives:

> **Interactive animation:** `wire-formats` — rendered by the page script in the HTML version.

**The same contract, three ways**

```proto
syntax = "proto3";
package orders.v1;

service Orders {
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc WatchOrder(GetOrderRequest) returns (stream OrderEvent);
}

message GetOrderRequest {
  string order_id = 1;
}

message Order {
  string order_id  = 1;
  string status    = 2;   // never renumber a tag
  int64  total_minor = 3;
  string currency  = 4;
  reserved 5;             // 5 was 'legacy_total', do not reuse
}
```

```json
GET /v1/orders/A-4471

{
  "id": "A-4471",
  "status": "paid",
  "amount": 8210,
  "currency": "GBP",
  "_links": { "cancel": "/v1/orders/A-4471/cancellation" }
}
```

```text
# GraphQL: the CLIENT chooses the fields, in one round trip

query {
  order(id: "A-4471") {
    status
    amount
    customer { name tier }      # would be a second REST call
    items { sku qty }           # would be a third
  }
}
```

- **REST wins at the edge** — Cacheable by URL, debuggable with `curl`, understood by every proxy and every developer, and it survives a receiver who has never seen your schema. For a public API this is usually the end of the discussion.
- **gRPC wins between your own services** — Generated clients in every language, a schema that CI can check for breaking changes, HTTP/2 multiplexing, streaming, and 4× smaller payloads. Deadlines and cancellation are built into the protocol rather than bolted on.
- **GraphQL wins for varied clients** — When an iOS screen, an Android screen and a web dashboard all need different slices of the same graph, letting the client specify the slice beats maintaining three bespoke endpoints.
- **And the costs** — gRPC is awkward from a browser (you need grpc-web or a gateway) and uncacheable. GraphQL moves query cost to runtime — an innocent query can fan out into an N+1 storm, so you need dataloaders, depth limits and cost analysis before you expose it publicly.

> **Warning**
>
> **Whatever you pick, your real contract is the schema, and it will outlive your code.** You never get to upgrade both sides at once — during any rollout v1 and v2 are both live and talking to each other. Add optional fields with defaults, rename freely, and never reuse or retype a field number.

> **Interactive animation:** `schema-evolution` — rendered by the page script in the HTML version.

<a id="3-discovery-and-load-balancing"></a>

## Finding & Choosing an Instance

- **Discovery** `a freshness problem`
- **Round robin** `counts turns`
- **Least connections** `counts work`

“Call the orders service” hides two questions. *Where is it?* — its instances are ephemeral, rescheduled constantly, and their addresses change every deploy. And *which one?* — because there are eleven of them and they are not equally healthy.

> **Interactive animation:** `service-discovery` — rendered by the page script in the HTML version.

> **Key idea**
>
> Discovery is not a lookup problem, it is a **freshness** problem. Every design — DNS with short TTLs, a sidecar watching a registry, a client library that subscribes — is trading how stale the caller's address list may be against how much load the registry can take. The window between “instance died” and “callers know” is `probe interval × failure threshold`, and during it, callers send traffic into a black hole.

Then you pick one. The default everyone inherits is round robin, and it fails in a specific, common way that is worth seeing once:

> **Interactive animation:** `load-balancing` — rendered by the page script in the HTML version.

> **Tip**
>
> **Use the picker above to compare all three.** Round robin distributes *requests* equally, which only helps if every request costs the same and every server is identical. Least-connections distributes *work*, so a slow server naturally receives less. Consistent hashing distributes *keys*, which is what you want when the server has a cache worth keeping warm.

**Interview question**

*Your p50 is healthy but your p99 tripled after a deploy. All instances pass their health checks. What is your first hypothesis?*

One instance is *grey failing* — up, answering, passing a shallow `/healthz` that only proves the process can return 200, but slow. With round robin it keeps receiving its full share, so a fixed fraction of requests is slow and the tail moves while the median does not. The tell is the shape: if p99 tripled and p50 did not, look for a *subset* of instances, not a global regression.

Three fixes, in increasing order of value: make health checks *deep* (check the dependencies the endpoint actually needs); switch to least-request load balancing so slowness is self-limiting; and add **outlier detection** so an instance whose error or latency profile deviates from its peers is ejected automatically for a cool-down period.

<a id="4-timeouts-and-deadlines"></a>

## Timeouts & Deadlines

- **No timeout** `wait forever`
- **Per-hop timeout** `wasted work`
- **Propagated deadline** `nothing wasted`

A timeout is the only way to convert the third outcome into the second one: it turns “I do not know” into a definite failure you can act on. Every remote call needs one. But a timeout set independently at each hop produces a subtle, expensive bug.

> **Interactive animation:** `timeout-deadline` — rendered by the page script in the HTML version.

> **Analogy** 🍽️
>
> **Picture it — a table that has already left**
>
> A table orders, waits twenty minutes, gives up and walks out. Nobody tells the kitchen. The kitchen finishes the order, plates it, and the waiter carries it to an empty table — while eleven new tables wait for the same stove. **The wasted work is not the meal; it is the stove time.** That is exactly what a missing deadline costs you: capacity, spent precisely when you have none to spare.

**Propagating a deadline instead of setting a timeout**

```python
# The caller sets ONE budget for the whole request tree.
async def handle_request(request):
    deadline = time.monotonic() + 3.0          # absolute, not a duration

    price = await get_price(request.sku, deadline)
    stock = await get_stock(request.sku, deadline)
    return render(price, stock)

async def get_price(sku, deadline):
    remaining = deadline - time.monotonic()
    if remaining <= 0.05:                      # not enough time to be useful
        raise DeadlineExceeded()               # fail now, do not start the call

    # Pass the remainder down; the next hop subtracts its own elapsed time.
    async with httpx.AsyncClient() as client:
        return await client.get(
            f"{PRICING}/price/{sku}",
            timeout=remaining,
            headers={"X-Request-Deadline-Ms": str(int(remaining * 1000))},
        )
```

```javascript
// The caller sets ONE budget for the whole request tree.
async function handleRequest(req) {
  const deadline = Date.now() + 3000;          // absolute, not a duration

  const price = await getPrice(req.sku, deadline);
  const stock = await getStock(req.sku, deadline);
  return render(price, stock);
}

async function getPrice(sku, deadline) {
  const remaining = deadline - Date.now();
  if (remaining <= 50) throw new DeadlineExceeded(); // fail now, do not start

  // AbortController is how you actually cancel in-flight work in JS.
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), remaining);
  try {
    return await fetch(`${PRICING}/price/${sku}`, {
      signal: ac.signal,
      headers: { "X-Request-Deadline-Ms": String(remaining) },
    });
  } finally {
    clearTimeout(timer);
  }
}
```

> **Warning**
>
> **Three timeout bugs that are nearly universal.** One: *the default is often infinite* — Python's `requests`, many JDBC drivers and plenty of gRPC setups will wait forever unless told otherwise. Two: *connect timeout and read timeout are different settings*, and setting only one leaves the other unbounded. Three: *an inner timeout larger than an outer one is always a bug*; the inner call can never win, so it is pure wasted capacity. Timeouts must **shrink** as you go down the stack.

<a id="5-retries-and-backoff"></a>

## Retries, Backoff & Jitter

- **Immediate retry** `load amplifier`
- **Exponential** `still synchronised`
- **Full jitter** `smooth`
- **Retry budget** `≤ 10% of traffic`

Retrying is the obvious response to a failed call and the easiest way to turn a small problem into an outage. The difference between the two is entirely in *when* you retry.

> **Interactive animation:** `retry-backoff` — rendered by the page script in the HTML version.

Step through all three variants above. The first is a load amplifier aimed at the thing that is already struggling. The second fixes the volume and leaves every client synchronised. Only the third — adding randomness — produces the smooth ramp a recovering service can actually survive.

**Full jitter, with a retryable-error check**

```python
RETRYABLE = {408, 429, 500, 502, 503, 504}

async def call_with_retries(fn, *, attempts=4, base=0.2, cap=10.0):
    for attempt in range(attempts):
        try:
            return await fn()
        except HttpError as e:
            # Never retry a 400 or a 422 - the request itself is wrong,
            # and it will be exactly as wrong the second time.
            if e.status not in RETRYABLE or attempt == attempts - 1:
                raise
            # Honour the server if it told us when to come back.
            wait = e.retry_after or random.uniform(0, min(cap, base * 2 ** attempt))
        except (TimeoutError, ConnectionError):
            if attempt == attempts - 1:
                raise
            wait = random.uniform(0, min(cap, base * 2 ** attempt))

        await asyncio.sleep(wait)
```

```javascript
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

async function callWithRetries(fn, { attempts = 4, base = 200, cap = 10_000 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      const last = attempt === attempts - 1;
      const retryable = err.status === undefined || RETRYABLE.has(err.status);
      // Never retry a 400 or a 422 - the request itself is wrong.
      if (last || !retryable) throw err;

      // Full jitter: a uniform sample from the whole backoff window.
      const window = Math.min(cap, base * 2 ** attempt);
      const wait = err.retryAfterMs ?? Math.random() * window;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
```

The rule that people miss is that retries **compose multiplicatively**. Three layers each retrying three times is not three retries, it is twenty-seven:

> **Interactive animation:** `retry-storm` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Retry at exactly one layer** — usually the one closest to the user that still understands the request — and cap it with a **retry budget**: if retries exceed ~10% of requests, stop retrying entirely until the ratio recovers. Every other layer fails fast and reports upward. Add a circuit breaker so that repeated failure stops producing traffic at all.

<a id="6-idempotency"></a>

## Idempotency

- **Safe to retry** `GET, PUT, DELETE`
- **Not safe** `POST charge, send`
- **Fix** `client-minted key`

Retries and at-least-once delivery both mean the same thing: **your handler will be called more than once with the same input**, and not occasionally — routinely, under load, exactly when it matters. Idempotency is the property that makes that harmless, and it is the single highest-leverage idea in this course.

> **Analogy** 🛗
>
> **Picture it — a lift button**
>
> Press the call button once, or jab it eleven times: the lift comes once. The button is idempotent, and that is precisely why nobody has to think about how many times they pressed it. A vending machine's coin slot is not idempotent, which is why you watch it like a hawk. Design your endpoints to be lift buttons.

> **Interactive animation:** `idempotency-key` — rendered by the page script in the HTML version.

**The unique constraint does the work, not the if-statement**

```python
@app.post("/charges")
async def create_charge(body: ChargeRequest, idempotency_key: str = Header(...)):
    async with db.transaction():                      # ONE transaction
        try:
            # The unique index is the lock. Never "select then insert" -
            # two concurrent retries will both pass that check.
            await db.execute(
                "insert into idempotency_keys (key, request_hash) values ($1, $2)",
                idempotency_key, hash_of(body),
            )
        except UniqueViolation:
            stored = await db.fetchrow(
                "select response, request_hash from idempotency_keys where key = $1",
                idempotency_key,
            )
            # Same key, different body = a client bug worth shouting about.
            if stored["request_hash"] != hash_of(body):
                raise HTTPException(422, "idempotency key reused with a different body")
            return json.loads(stored["response"])     # replay the original answer

        charge = await ledger.charge(body.amount, body.currency, body.card_token)
        await db.execute(
            "update idempotency_keys set response = $1 where key = $2",
            json.dumps(charge), idempotency_key,
        )
        return charge
```

```javascript
app.post("/charges", async (req, res) => {
  const key = req.header("Idempotency-Key");
  if (!key) return res.status(400).json({ error: "Idempotency-Key required" });

  await db.transaction(async (tx) => {              // ONE transaction
    try {
      // The unique index is the lock. Never "select then insert" -
      // two concurrent retries will both pass that check.
      await tx.query(
        "insert into idempotency_keys (key, request_hash) values ($1, $2)",
        [key, hashOf(req.body)],
      );
    } catch (err) {
      if (err.code !== UNIQUE_VIOLATION) throw err;
      const { rows } = await tx.query(
        "select response, request_hash from idempotency_keys where key = $1", [key],
      );
      // Same key, different body = a client bug worth shouting about.
      if (rows[0].request_hash !== hashOf(req.body)) {
        return res.status(422).json({ error: "key reused with a different body" });
      }
      return res.json(rows[0].response);             // replay the original answer
    }

    const charge = await ledger.charge(req.body);
    await tx.query("update idempotency_keys set response = $1 where key = $2",
      [charge, key]);
    res.json(charge);
  });
});
```

- **Naturally idempotent — do this where you can**`PUT /orders/44 {status:"shipped"}` sets an absolute state, so running it twice is identical to running it once. Prefer absolute assignments (`set balance = 90`) over relative ones (`balance = balance - 10`) whenever the domain allows.
- **Needs an explicit key** — Anything that appends, sends, charges or emits. `POST /charges`, `POST /emails`, `append to ledger`. There is no way to make these safe without remembering that you already did them.

> **Warning**
>
> **The three ways people get this wrong.** Generating a new key per *attempt* instead of per *intent* — the key must be created before the first try and reused by every retry. Checking with a `SELECT` before inserting — two concurrent retries both see nothing and both proceed; only a unique constraint is atomic. And writing the key in a different transaction from the effect — which reintroduces exactly the dual-write problem you will meet in section 11.

<a id="7-circuit-breakers-and-bulkheads"></a>

## Circuit Breakers & Bulkheads

- **Breaker** `stop calling`
- **Bulkhead** `cap the damage`
- **Shedding** `reject early`

Timeouts, retries and idempotency make a *single* call survivable. These two patterns stop a failing dependency from consuming the calling service itself. A circuit breaker decides *whether to call at all*; a bulkhead decides *how much of you can be tied up* when the answer is yes.

> **Interactive animation:** `circuit-breaker` — rendered by the page script in the HTML version.

> **Analogy** ⚡
>
> **Picture it — the consumer unit in your house**
>
> A short circuit in the kitchen trips one breaker. Your lights stay on, your router stays on, and the house does not burn down. The breaker does not repair the fault — it **contains** it, and it makes the fault obvious and the recovery deliberate. A software circuit breaker has exactly this job, and like the electrical one it must be scoped: one per dependency, never a single breaker for everything.

The breaker keeps you from calling a broken thing. The bulkhead keeps the calls you *do* make from eating every resource you have:

> **Interactive animation:** `bulkhead` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Resource exhaustion is how one failure becomes all failures.** A shared thread pool, connection pool or event loop is a single point of contagion: the slow dependency does not have to break you directly, it just has to hold your workers long enough that everything else queues behind it. Partition by dependency, and pair every breaker with a **fallback** — a cached value, a degraded feature, a queued write, or an honest error.

**Interview question**

*Your recommendations service is down. The product page is timing out. Walk through what should have prevented the outage.*

Four layers, each of which would have been enough on its own. **A short timeout** (200 ms, not 30 s) means a hanging call releases its worker almost immediately. **A bulkhead** caps recommendations at, say, 20% of the pool, so even with a long timeout it cannot consume all of it. **A circuit breaker** notices the failure rate and stops calling entirely, which also removes load from a service trying to restart. **A fallback** — last week's popular items, or simply omitting the carousel — turns the whole thing from an outage into a slightly less personalised page.

The framing to say out loud: *recommendations is a non-critical dependency, so the design fault was letting a non-critical dependency fail a critical path at all.* Classify every dependency as critical or not, and make the non-critical ones structurally incapable of taking you down.

<a id="8-queues-and-topics"></a>

## Queues & Topics

- **Queue** `one consumer gets it`
- **Topic** `everyone gets a copy`
- **Log** `+ replay`

A broker gives you three things at once: it **decouples in time** (the receiver need not be up), it **decouples in identity** (the sender need not know who receives), and it **absorbs load** (a spike becomes a backlog instead of an error page). What you choose between is not really a product but a delivery semantic.

> **Interactive animation:** `queue-consumers` — rendered by the page script in the HTML version.

> **Tip**
>
> The two numbers to alarm on for any queue are **depth** (is it growing without bound?) and **oldest message age** (are we already late?). Depth alone lies to you: a queue with a steady depth of 40 looks identical whether messages take 50 ms or 50 minutes to get through it.

Now the same infrastructure with the opposite semantic. A queue splits work between consumers; a **topic** copies it to all of them:

> **Interactive animation:** `pubsub-fanout` — rendered by the page script in the HTML version.

> **Warning**
>
> **Getting this backwards is a classic production incident.** Deploy three replicas of a service that reads a *queue* expecting each replica to see every message, and each replica sees a third of them — two thirds of your orders are never billed, silently. Say the semantic out loud when you create the subscription: *“competing consumers”* or *“fan-out”*.

The third shape is the **log** — Kafka, Pulsar, Kinesis. It looks like a topic but it does not delete what it delivers, and that one difference changes everything downstream of it:

> **Interactive animation:** `log-stream` — rendered by the page script in the HTML version.

- **Choose a queue** — when work is disposable once done, consumers are interchangeable, and you want per-message retries and a dead letter queue for free. Job processing, emails, thumbnails.
- **Choose a log** — when the history is the product: multiple independent readers, replay after a bug, ordering within a key, or feeding both a real-time consumer and a nightly analytics job from the same data.
- **Log costs** — Parallelism is capped by partition count, which you must choose up front. Rebalances produce duplicates. And there is no per-message retry — one poison record blocks its whole partition unless you handle it yourself.

<a id="9-delivery-and-ordering"></a>

## Delivery Guarantees & Ordering

- **At most once** `may lose`
- **At least once** `may duplicate`
- **Exactly once** `only as an effect`

Every broker's guarantee comes down to one decision in the consumer: **do you acknowledge before or after doing the work?** That is the whole thing. Everything else is marketing.

> **Interactive animation:** `delivery-semantics` — rendered by the page script in the HTML version.

> **Key idea**
>
> **There is no exactly-once delivery.** It is provably impossible over an unreliable network — the classic two-generals result. What you can have is exactly-once *effect*: at-least-once delivery plus a dedupe key committed in the same transaction as the side effect. When a vendor says “exactly once”, they mean either that, or exactly-once within their own system only. Your call to Stripe is still yours to protect.

Ordering has the same character — a guarantee that is narrower than people assume, and silently lost by a default setting:

> **Interactive animation:** `ordering-keys` — rendered by the page script in the HTML version.

**Key the message, and make the handler order-insensitive anyway**

```python
# 1. Same entity -> same key -> same partition -> ordered.
await producer.send(
    topic="order-events",
    key=order_id.encode(),          # NOT a random uuid, NOT round robin
    value=event.to_json(),
    headers=[("event-id", event.id.encode()), ("traceparent", ctx.encode())],
)

# 2. Belt and braces: reject stale events even if they do arrive in order.
async def handle(event):
    updated = await db.execute(
        """update orders
              set status = $1, version = $2
            where id = $3 and version < $2""",   # monotonic guard
        event.status, event.version, event.order_id,
    )
    if updated == 0:
        log.info("stale or duplicate event ignored", event_id=event.id)
```

```javascript
// 1. Same entity -> same key -> same partition -> ordered.
await producer.send({
  topic: "order-events",
  messages: [{
    key: orderId,                   // NOT a random uuid, NOT round robin
    value: JSON.stringify(event),
    headers: { "event-id": event.id, traceparent: ctx },
  }],
});

// 2. Belt and braces: reject stale events even if they do arrive in order.
async function handle(event) {
  const { rowCount } = await db.query(
    `update orders
        set status = $1, version = $2
      where id = $3 and version < $2`,          // monotonic guard
    [event.status, event.version, event.orderId],
  );
  if (rowCount === 0) log.info({ eventId: event.id }, "stale or duplicate ignored");
}
```

> **Warning**
>
> **Never ask for global ordering.** It means one partition, one consumer, and no horizontal scale — you have bought a distributed system and configured it to be a single-threaded one. Ask instead: *which entity's events must not overtake each other?* That entity's id is your partition key, and everything else is free to be reordered.

<a id="10-dead-letters-and-backpressure"></a>

## Dead Letters & Backpressure

- **Poison message** `fails forever`
- **DLQ** `unblocks the stream`
- **Unbounded queue** `hidden overload`

Retries assume failure is transient. Some failures are not — a malformed payload will fail identically forever, and while it is being retried it blocks everything behind it.

> **Interactive animation:** `dlq` — rendered by the page script in the HTML version.

> **Tip**
>
> A dead letter queue is a **bug report with the payload attached**, not a graveyard. Alarm on `depth > 0`, keep the original message plus the exception and stack trace, and put a one-click **redrive** in the runbook. The most common failure in practice is not a missing DLQ — it is a DLQ nobody has looked at since March.

The other broker failure mode is quieter, and it is the one that kills processes at 3 a.m.: a producer that is simply faster than its consumer.

> **Interactive animation:** `backpressure` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Every queue must be bounded, and the bound must come from a latency target rather than from available memory.** “Unbounded” always means “bounded by RAM, discovered during an incident”. Once bounded you have three real options when it fills: *push back* (stop reading, so the producer slows down), *shed* (reject with `503` plus `Retry-After`), or *drop by policy* (discard the oldest, which is right for live data whose value decays).

<a id="11-the-outbox"></a>

## The Dual Write & the Outbox

- **Dual write** `no correct version`
- **Outbox** `one transaction`
- **CDC** `zero app changes`

Here is the most common bug in event-driven systems, and it is in code that looks completely reasonable: save to the database, then publish an event. Two systems, two commits, and no transaction that spans them.

> **Interactive animation:** `outbox` — rendered by the page script in the HTML version.

> **Warning**
>
> **A dual write has no correct implementation.** Retrying narrows the window; it never closes it, because the process can die inside the retry loop. Reversing the order just swaps “an order nobody was told about” for “an event about an order that does not exist”. If you catch yourself writing `db.save(); broker.publish();`, you have this bug.

**The outbox: two inserts, one commit**

```python
async def place_order(order):
    async with db.transaction():                  # ONE transaction, ONE system
        await db.execute(
            "insert into orders (id, customer_id, total_minor) values ($1, $2, $3)",
            order.id, order.customer_id, order.total_minor,
        )
        await db.execute(
            """insert into outbox (id, topic, partition_key, payload)
               values ($1, $2, $3, $4)""",
            uuid.uuid4(), "order-events", order.id, order.to_event_json(),
        )
    # No publish here. Nothing to fail. Nothing to retry. Nothing to get wrong.

# A separate process, restartable at any moment, publishes what committed.
async def relay():
    while True:
        rows = await db.fetch(
            "select * from outbox where published_at is null order by id limit 100"
        )
        for row in rows:
            await broker.publish(row["topic"], key=row["partition_key"],
                                 value=row["payload"], headers={"event-id": row["id"]})
            # A crash here republishes on restart - consumers dedupe on event-id.
            await db.execute("update outbox set published_at = now() where id = $1",
                             row["id"])
        await asyncio.sleep(0.2)
```

```javascript
async function placeOrder(order) {
  await db.transaction(async (tx) => {          // ONE transaction, ONE system
    await tx.query(
      "insert into orders (id, customer_id, total_minor) values ($1, $2, $3)",
      [order.id, order.customerId, order.totalMinor],
    );
    await tx.query(
      `insert into outbox (id, topic, partition_key, payload)
       values ($1, $2, $3, $4)`,
      [randomUUID(), "order-events", order.id, order.toEventJson()],
    );
  });
  // No publish here. Nothing to fail. Nothing to retry. Nothing to get wrong.
}

// A separate process, restartable at any moment, publishes what committed.
async function relay() {
  for (;;) {
    const { rows } = await db.query(
      "select * from outbox where published_at is null order by id limit 100",
    );
    for (const row of rows) {
      await broker.publish(row.topic, {
        key: row.partition_key, value: row.payload, headers: { "event-id": row.id },
      });
      // A crash here republishes on restart - consumers dedupe on event-id.
      await db.query("update outbox set published_at = now() where id = $1", [row.id]);
    }
    await sleep(200);
  }
}
```

The outbox converts an impossible problem into a solved one plus a tolerable one: atomicity within a single database, and at-least-once publishing that consumers deduplicate. The alternative, if you cannot change the application at all, is to let the database's own log be the source of events:

> **Interactive animation:** `cdc` — rendered by the page script in the HTML version.

<a id="12-sagas"></a>

## Sagas

- **Steps** `local transactions`
- **Rollback** `does not exist`
- **Instead** `compensations`

One business operation, four services, four databases. You cannot wrap that in a transaction, so you give up atomicity and replace it with a sequence of local transactions, each with a matching **compensation** that semantically offsets it.

> **Interactive animation:** `saga` — rendered by the page script in the HTML version.

> **Analogy** 🧾
>
> **Picture it — a refund is not an un-charge**
>
> A database rollback leaves no trace: the write never existed. A compensation is a *new forward transaction* — the customer's statement shows the charge and the refund, the warehouse log shows the reservation and the release, and for a few seconds the money genuinely was gone. Compensation is bookkeeping, not time travel, and designing it is the real work of a saga.

- **Orchestration** — One component owns the state machine and calls each step. Easy to see, easy to debug, easy to add a timeout or a manual intervention step. Use it for anything long, critical, or with more than three steps.
- **Choreography** — Each service reacts to events and publishes its own. Maximum decoupling, and adding a participant needs no change anywhere else. Good for two or three stable steps.
- **Orchestration's cost** — The orchestrator knows about everyone, so it becomes a place logic accumulates and a service every team must change.
- **Choreography's cost** — The flow exists nowhere as a readable artefact. “Why did this order stall?” means correlating logs across five services, and cyclic subscriptions become loops nobody designed.

> **Warning**
>
> **Two rules that make sagas work.** Every step must be *idempotent*, because the orchestrator will retry on timeout. And *design the compensations first* — the happy path is the easy half, and discovering during an incident that a step has no compensation (an email is already sent, a warehouse has already shipped) is how sagas get a bad reputation. Where a step truly cannot be undone, put it **last**.

For contrast, the mechanism sagas replace — two-phase commit — is worth understanding precisely so you can explain why you did not use it:

> **Interactive animation:** `two-phase-commit` — rendered by the page script in the HTML version.

<a id="13-pushing-to-the-client"></a>

## Pushing to the Client

- **Polling** `simple, wasteful`
- **SSE** `server → client`
- **WebSocket** `both ways`
- **Webhook** `server → server`

Everything so far has been servers talking to servers. The last hop is different, because the client is behind a NAT, on a flaky radio, and cannot be called. So the connection must start from their side, and the question becomes how long you keep it open.

> **Interactive animation:** `push-channels` — rendered by the page script in the HTML version.

> **Tip**
>
> **Default to server-sent events.** They ride on ordinary HTTP with your existing auth, reconnect automatically with `Last-Event-ID` resumption built in, and cover the common case of server-to-client updates. Reach for WebSockets only when the *client* needs to send frequently — chat, collaborative editing, games. Keep polling in your pocket for updates that are rare and not urgent; it is not a bad design, just a bad default.

> **Warning**
>
> **Long-lived connections are state, and that is the real cost.** Every deploy disconnects everyone at once (so you need jittered reconnect, or they all come back together). Autoscaling is driven by connection count, not CPU. And because any server may need to reach any client, you need a pub/sub backplane behind them — which means the fan-out problem you solved in section 8 reappears, one layer down.

When the “client” is another company's server, the pattern flips into a **webhook**: you make the HTTP call, to an endpoint you do not control and cannot debug.

> **Interactive animation:** `webhook-retry` — rendered by the page script in the HTML version.

<a id="14-the-whole-thing-on-one-page"></a>

## The Whole Thing on One Page

Everything above, compressed into the three decisions you actually make.

<a id="pick-a-style"></a>

### Pick a communication style

| If the caller… | Use | You are accepting |
| --- | --- | --- |
| needs the answer to continue | synchronous RPC (gRPC internally, REST at the edge) | latency adds, availability multiplies |
| needs only an acknowledgement | queue — competing consumers | eventual consistency, duplicate handling |
| is announcing a fact to nobody in particular | topic — pub/sub fan-out | no visible call graph; the event schema is now an API |
| wants replay, or many independent readers | log (Kafka, Kinesis, Pulsar) | partition-capped parallelism, rebalance duplicates |
| is a browser that needs updates | SSE, or WebSocket if it must send too | connections are state: deploys, scaling, backplane |
| is another company's server | webhook, signed and retried for hours | out-of-order delivery, endpoints you cannot debug |

<a id="pick-a-reliability-pattern"></a>

### Pick a reliability pattern

| Symptom | Pattern | The one detail people get wrong |
| --- | --- | --- |
| calls hang forever | timeouts | the default is often infinite; connect and read are separate settings |
| work continues after the caller left | deadline propagation | pass an *absolute* deadline, not a duration |
| transient errors reach users | retry with full jitter | retry at one layer only, under a budget |
| retries cause double effects | idempotency key | one key per *intent*; enforce with a unique constraint |
| a broken dependency is still being called | circuit breaker | scope per dependency, and always pair with a fallback |
| one dependency exhausts the whole service | bulkhead | partition the pool *before* you need to |
| a queue grows without limit | backpressure / load shedding | bound it from a latency target, not from RAM |
| one message fails forever | dead letter queue | alarm on depth > 0 and keep a redrive path |
| db write and event can diverge | transactional outbox (or CDC) | never `save()` then `publish()` |
| a multi-service operation half-failed | saga with compensations | design the compensations first; put un-undoable steps last |
| a fan-out is as slow as its worst shard | hedged requests, partial results | measure the p99 of the aggregate, not of the parts |
| cache expiry floods the origin | single-flight + jittered TTL | stale-while-revalidate beats an error every time |

<a id="the-questions-to-ask-of-any-design"></a>

### The questions to ask of any design

```text
For every arrow you draw between two boxes, answer these:

                1. Does the caller need the answer? -> if no, why is this arrow synchronous?
                2. What is the timeout, and who set it? -> "the default" is not an answer
                3. What happens on a duplicate? -> retries and redelivery guarantee one
                4. What happens if this side is down? -> fallback, queue, or degrade
                5. What happens if it is SLOW, not down? -> the harder and more common case
                6. Is the effect and its event one commit? -> if not, you have a dual write
                7. How do you know it is broken? -> trace id, queue depth, oldest-age
                8. How do you replay after fixing a bug? -> DLQ redrive, or log offset reset
```

> **Key idea**
>
> **If you remember one sentence from this page:** the network gives you three outcomes instead of two, so every pattern here is either *making the unknown outcome rare* (timeouts, breakers, bulkheads), *making it harmless* (idempotency, outbox, compensations), or *making it visible* (tracing, queue depth, DLQs). When you meet a pattern that is not on this page, ask which of those three it is doing — there is no fourth category.

<a id="where-next"></a>

### Where to go next

1. 📘 The [Distributed Communication Patterns Detailed Course](distributed-communication-patterns-detailed-course.html) — the same ground in 43 sections, plus transports and HTTP/3, service meshes, consensus and quorums, CQRS and event sourcing, scatter-gather and tail latency, distributed tracing, contract testing and a practice roadmap.
2. 📚 Browse both guides in the [Distributed Communication Courses catalog](distributed-communication-patterns-courses.html).
3. 📖 [AWS Builders' Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) — the measured data behind section 5, from people running it at planetary scale.
4. 🧩 [microservices.io pattern catalog](https://microservices.io/patterns/) — Chris Richardson's reference for saga, outbox, API gateway and their variants.
5. 🧠 [Martin Fowler — What do you mean by “event-driven”?](https://martinfowler.com/articles/201701-event-driven.html) — the clearest short treatment of the four things people mean by that phrase.

> *"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."* — Leslie Lamport

---

TechToday Study Library — Distributed Communication Patterns
