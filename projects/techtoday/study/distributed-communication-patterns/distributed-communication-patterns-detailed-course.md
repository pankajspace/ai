<!--
Source: distributed-communication-patterns-detailed-course.html
Title: Distributed Communication Detailed Course | TechToday
Description: A 47-section course on how distributed services communicate — transports and encodings, REST/gRPC/GraphQL, discovery, load balancing, meshes, timeouts, retries, idempotency, breakers, queues, logs, delivery semantics, outbox, CDC, CQRS, sagas, polling, server-sent events, WebSockets, webhooks, async request-reply, consensus, tracing and testing.
Theme-color: #0b0d10
Stylesheets: distributed-communication-patterns-study.css, ../../site-header.css
Scripts: distributed-communication-patterns-study.js
-->

Navigation: [TechToday](../../index.html) · [← Distributed Communication Courses](distributed-communication-patterns-courses.html)

<a id="distributed-communication-patterns"></a>

# Distributed Communication Patterns

Forty-seven sections, from what a TCP connection actually costs to how a saga unwinds a half-finished order. Each section builds only on the ones before it, so it reads straight through — but every pattern is also self-contained enough to look up when you meet it in a design review. Press **Play** on any animation.

<a id="table-of-contents"></a>

## Table of Contents

1. [Why Remote Calls Are Different](#1-why-remote-calls-are-different)
2. [The Coupling Spectrum](#2-the-coupling-spectrum)
3. [Transports: TCP, HTTP/1.1, HTTP/2, HTTP/3](#3-transports)
4. [Serialization Formats](#4-serialization-formats)
5. [Schema Evolution & Compatibility](#5-schema-evolution)
6. [REST & Resource-Oriented APIs](#6-rest)
7. [gRPC & the Four Call Shapes](#7-grpc)
8. [GraphQL](#8-graphql)
9. [API Versioning](#9-api-versioning)
10. [Service Discovery](#10-service-discovery)
11. [Load Balancing](#11-load-balancing)
12. [API Gateways & Backends for Frontends](#12-api-gateways)
13. [Service Mesh & Sidecars](#13-service-mesh)
14. [Timeouts & Deadline Propagation](#14-timeouts-and-deadlines)
15. [Retries, Backoff & Jitter](#15-retries)
16. [Idempotency & Deduplication](#16-idempotency)
17. [Circuit Breakers](#17-circuit-breakers)
18. [Bulkheads, Load Shedding & Rate Limiting](#18-bulkheads-and-shedding)
19. [Health Checks & Failure Detection](#19-health-checks)
20. [Queues & Competing Consumers](#20-queues)
21. [Publish/Subscribe](#21-pubsub)
22. [Log-Based Streaming](#22-log-streaming)
23. [Delivery Semantics](#23-delivery-semantics)
24. [Ordering & Partition Keys](#24-ordering)
25. [Dead Letter Queues & Replay](#25-dead-letters)
26. [Backpressure & Flow Control](#26-backpressure)
27. [The Dual Write & the Transactional Outbox](#27-outbox)
28. [Change Data Capture](#28-cdc)
29. [Event-Driven Architecture](#29-event-driven)
30. [CQRS & Read Models](#30-cqrs)
31. [Sagas](#31-sagas)
32. [Two-Phase Commit](#32-two-phase-commit)
33. [Composition: Scatter-Gather, Aggregator, Claim Check](#33-composition-patterns)
34. [Caching Between Services](#34-caching)
35. [Real-Time Push to Clients](#35-real-time-push)
36. [Polling & Long Polling](#36-polling-and-long-polling)
37. [Server-Sent Events](#37-server-sent-events)
38. [WebSockets](#38-websockets)
39. [Webhooks](#39-webhooks)
40. [Asynchronous Request-Reply](#40-async-request-reply)
41. [Consensus, Quorums & Leader Election](#41-consensus)
42. [Time, Ordering & Causality](#42-time-and-causality)
43. [Observability: Correlation, Tracing & RED](#43-observability)
44. [Testing: Contracts, Chaos & Fault Injection](#44-testing)
45. [Cheat Sheet](#45-cheat-sheet)
46. [Pattern-Recognition Playbook](#46-pattern-playbook)
47. [Practice Roadmap](#47-practice-roadmap)

<a id="1-why-remote-calls-are-different"></a>

## 1. Why Remote Calls Are Different

> **Key idea**
>
> New to this? Start with the [Distributed Communication Patterns Crash Course](distributed-communication-patterns-crash-course.html) — fourteen sections covering the patterns you touch weekly, each with an animation. Come back here for the full treatment, the edge cases, and the reasoning behind each default.

In 1994 Peter Deutsch wrote down a list of things programmers assume about networks that are not true. With James Gosling's later addition they became the **eight fallacies of distributed computing**, and three decades later they are still the root cause of most production incidents:

```text
1. The network is reliable. 5. Topology doesn't change.
                2. Latency is zero. 6. There is one administrator.
                3. Bandwidth is infinite. 7. Transport cost is zero.
                4. The network is secure. 8. The network is homogeneous.
```

They are not a list of things to memorise for an interview. They are a list of *assumptions baked into code that looks correct*. A method call that became an HTTP call during a refactor still looks like a method call at the call site — and that is exactly the problem. The syntax hides four new failure modes.

<a id="1-1-the-third-outcome"></a>

### The third outcome

A local call returns or throws. A remote call returns, fails, or leaves you not knowing. That third outcome — the ambiguous one — is the axis the whole field turns on.

> **Interactive animation:** `partial-failure` — rendered by the page script in the HTML version.

This is the **two generals problem** in practical dress. Two generals must attack simultaneously and can only communicate by messenger through hostile territory. No finite exchange of messages can make both certain that the other will attack: whatever the last message is, its sender cannot know it arrived. The proof is short and the consequence is permanent — **no protocol can give you certainty about a remote peer's state**. You can only reduce how often the uncertainty matters.

<a id="1-2-latency-and-availability-arithmetic"></a>

### Latency and availability arithmetic

- **L1 cache** `1 ns`
- **Main memory** `100 ns`
- **NVMe read** `100 µs`
- **Same-DC RPC** `0.5 ms`
- **Cross-region** `70 ms`

Those six orders of magnitude are why “extract this into a service” is never a neutral refactor. But the number that surprises people more is the availability one. Dependencies in a request path do not average, they multiply:

| Chain | Each at 99.9% | Downtime / month |
| --- | --- | --- |
| 1 service | 99.9% | 43 minutes |
| 4 services | 99.6% | 2.9 hours |
| 10 services | 99.0% | 7.2 hours |
| 30 services | 97.0% | 21.6 hours |

Latency behaves the same way and worse, because *tails add*. If each of four services has a p99 of 100 ms, the p99 of the chain is not 100 ms — it is closer to the sum, because the chance of *at least one* hop being slow grows with the number of hops. A caller fanning out to 100 shards, each with a 99th-percentile of 100 ms, sees a slow shard in roughly `1 - 0.99^100 ≈ 63%` of requests. **Your median becomes your components' tail.**

> **Warning**
>
> **Slow is worse than down.** A down service returns `ECONNREFUSED` in microseconds — cheap to detect, cheap to handle. A service answering in 30 seconds consumes your threads, your connection pool and your memory for 30 seconds per request. Most cascading failures start with something that was *up the whole time*.

<a id="1-3-what-this-course-is-actually-about"></a>

### What this course is actually about

Every pattern in the next forty-two sections does exactly one of three jobs. It is worth holding this taxonomy in mind, because it turns a long list of named patterns into three short ones:

- **Make the unknown rare** — Timeouts, deadlines, health checks, circuit breakers, bulkheads, load shedding. These reduce how often you end up in the ambiguous state, and how much it costs when you do.
- **Make the unknown harmless** — Idempotency keys, at-least-once delivery, the outbox, compensating transactions, CRDTs. These accept that duplicates and partial failures will happen and make the outcome correct anyway.
- **Make the unknown visible** — Correlation ids, distributed tracing, queue depth and consumer lag, dead letter queues, reconciliation jobs. You cannot eliminate the third outcome, so you must be able to find it afterwards.

<a id="2-the-coupling-spectrum"></a>

## 2. The Coupling Spectrum

“Loose coupling” is used as though it were one thing. It is at least four, they are independent, and a design can be loose on one axis and rigid on another. Naming them makes architectural arguments much shorter.

| Axis | Tight means | Loosened by |
| --- | --- | --- |
| **Temporal** | both sides must be up at the same instant | a broker that stores the message |
| **Spatial** | the caller must know who and where the callee is | discovery, topics, an event bus |
| **Format** | both sides must share a data shape | schema evolution rules, tolerant readers |
| **Behavioural** | the caller depends on *what* the callee does | publishing facts rather than issuing commands |

> **Interactive animation:** `sync-vs-async` — rendered by the page script in the HTML version.

Compare the two variants above along all four axes. The asynchronous version loosens temporal coupling (the workers can be down), spatial coupling (the API does not know who consumes) and behavioural coupling (it announces a fact rather than commanding a charge). It does *not* loosen format coupling at all — in fact it tightens it, because the event payload is now a contract shared by every consumer, and unlike an HTTP response you cannot see who depends on which field.

> **Key idea**
>
> **Decoupling is redistribution, not removal.** Every axis you loosen moves the difficulty somewhere else: temporal decoupling creates eventual consistency, spatial decoupling destroys the visible call graph, behavioural decoupling makes the flow implicit. The right question is never “how do we decouple?” but *“which coupling is costing us, and what are we willing to pay to move it?”*

<a id="2-1-commands-events-and-queries"></a>

### Commands, events and queries

Three message kinds, with different coupling and different ownership. Getting the vocabulary right prevents a surprising number of design mistakes:

|   | Command | Event | Query |
| --- | --- | --- | --- |
| Intent | do this | this happened | tell me this |
| Name | imperative: `CapturePayment` | past tense: `PaymentCaptured` | `GetOrder` |
| Recipients | exactly one | zero or more | exactly one |
| Can be rejected | yes — it is a request | no — it already happened | n/a |
| Owner of the name | the receiver | the sender | the receiver |

> **Warning**
>
> The most common smell is an “event” named like a command — `SendEmail` published to a topic. That is a command wearing a costume: it has exactly one legitimate consumer, the publisher is depending on that consumer's behaviour, and adding a second subscriber sends two emails. If the publisher cares that something specific happens next, it is issuing a command; be honest about it and use a queue with one consumer.

<a id="3-transports"></a>

## 3. Transports: TCP, HTTP/1.1, HTTP/2, HTTP/3

Everything above runs on a transport, and the transport's properties leak upward constantly — into your tail latency, your connection pool settings, and your load balancer's behaviour.

<a id="3-1-what-a-connection-costs"></a>

### What a connection costs

```text
Cold request, HTTP/1.1 + TLS 1.2, 70 ms RTT:

                DNS lookup ~1 RTT (cached after)
                TCP handshake 1 RTT SYN -> SYN/ACK -> ACK
                TLS handshake 2 RTT (TLS 1.3: 1 RTT, or 0-RTT on resumption)
                HTTP request 1 RTT
                --------------------------------
                ~5 RTT = 350 ms before a single byte of payload

                Warm request on a pooled connection: 1 RTT = 70 ms
```

> **Key idea**
>
> **Connection pooling is the single biggest latency win available to a client**, and it is usually one configuration line. A client that creates a new connection per request is paying 4 extra round trips every time. Check three settings on every HTTP client you own: pool size, keep-alive timeout, and whether the pool is per-host (it should be).

<a id="3-2-head-of-line-blocking"></a>

### Head-of-line blocking, at three layers

The same phenomenon appears at every layer of the stack, and the fix at one layer exposes it at the next. This progression is the entire story of HTTP's evolution:

| Version | Concurrency model | Blocking problem |
| --- | --- | --- |
| HTTP/1.1 | one request at a time per connection; browsers open ~6 | **Application-level**: a slow response blocks the connection behind it |
| HTTP/2 | many multiplexed streams on one TCP connection | **Transport-level**: one lost TCP segment stalls *every* stream |
| HTTP/3 (QUIC) | independent streams over UDP, loss recovery per stream | mostly solved; costs you UDP middlebox trouble and more CPU |

This is why HTTP/2 helps enormously on a clean datacentre link and can help less than expected on a lossy mobile network: multiplexing removed the application-layer queue and handed the problem to TCP, which recovers in order. QUIC moves loss recovery into user space per stream, which is why HTTP/3 shines exactly where HTTP/2 disappointed.

> **Warning**
>
> **HTTP/2 and load balancers do not mix by accident.** Because many requests share one connection, an L4 load balancer that balances *connections* will pin all of a client's traffic to one backend — and a long-lived gRPC channel will happily send a million requests to a single pod while its siblings idle. You need an L7 proxy that balances per *stream*, or client-side load balancing, or periodic connection recycling (`MAX_CONNECTION_AGE`).

<a id="3-3-tcp-details-that-reach-your-code"></a>

### TCP details that reach your code

- **A half-open connection looks alive** — If a peer is power-cycled or a NAT entry expires, your socket stays `ESTABLISHED` forever with no traffic. Only `TCP_KEEPALIVE` or an application-level heartbeat detects it — which is why every long-lived protocol has a ping.
- **The accept queue is a hidden timeout**`listen(backlog)` bounds how many connections wait for your process to `accept()`. Overflow it and the kernel drops SYNs silently; the client sees a timeout and blames the network.
- **Slow start punishes short connections** — A new connection ramps its congestion window from a small initial value, so the first few round trips carry less data than the link can hold. Another reason to reuse connections.
- **Nagle vs delayed ACK** — Small writes can interact with delayed acknowledgement to add ~40 ms of pure latency. Enable `TCP_NODELAY` for request/response protocols — almost every RPC library does this for you, but check if you are writing raw sockets.

<a id="4-serialization-formats"></a>

## 4. Serialization Formats

An encoding decision looks like a performance decision and is actually a *coupling* decision. The real axis is whether a receiver can understand the bytes without your schema.

> **Interactive animation:** `wire-formats` — rendered by the page script in the HTML version.

<a id="4-1-how-protobuf-gets-small"></a>

### How protobuf gets small

Two mechanisms, and both matter for understanding the compatibility rules in the next section. First, each field is written as a **tag-length-value** triple where the tag encodes the field number and the wire type — the field *name* never appears. Second, integers are **varint**-encoded: small numbers take one byte, and only large ones take the full width.

```text
message Order { string id = 1; int64 total = 2; }

                JSON: {"id":"A-4471","total":8210} 29 bytes
                Protobuf: 0A 06 41 2D 34 34 37 31 10 92 40 11 bytes
                ^^ ^^ ------ id ------- ^^ -------
                | | | varint 8210
                | length 6 field 2, varint
                field 1, length-delimited

                The strings "id" and "total" are not on the wire at all.
```

> **Tip**
>
> Two consequences fall out of the diagram. A reader that meets an unknown tag can *skip* it, because the wire type tells it how long the value is — that is what makes adding fields safe. And a reader has no way to detect that tag `2` used to mean something else, which is what makes renumbering catastrophic.

<a id="4-2-choosing"></a>

### Choosing, in practice

- **JSON at every boundary you do not control** — Public APIs, webhooks, config, anything a human debugs. The tax is real (2–4× the bytes, slow parsing) and almost always worth paying for a receiver who can open it in a browser.
- **Protobuf for internal RPC** — Generated clients, a schema CI can check, and payloads small enough that serialization stops showing up in your profiles.
- **Avro for event logs** — The schema is carried once per topic or file rather than per record, and the registry enforces compatibility at publish time. For billions of near-identical records this wins on both size and governance.
- **Language-native serialization: never across a boundary** — Java `Serializable`, Python `pickle`, .NET `BinaryFormatter`. They couple you to one language and one class layout, and deserializing untrusted input is a remote-code-execution vulnerability, not a bug. This is a live entry in the OWASP Top 10.

<a id="5-schema-evolution"></a>

## 5. Schema Evolution & Compatibility

You never upgrade both sides of a boundary at once. During any rolling deploy, v1 and v2 are both live and talking to each other — and in an event log, a message written by v1 may be read by v7 three years later. Compatibility is therefore not a nicety; it is the thing that makes deployment possible at all.

> **Interactive animation:** `schema-evolution` — rendered by the page script in the HTML version.

<a id="5-1-the-four-compatibility-modes"></a>

### The four compatibility modes

| Mode | Means | Deploy order |
| --- | --- | --- |
| **Backward** | new code can read old data | consumers first |
| **Forward** | old code can read new data | producers first |
| **Full** | both | any order — aim for this |
| **None** | a flag day | stop the world; you will not be allowed to |

Note that the deploy order is a *consequence* of the mode, not an independent choice. If your change is only backward compatible, consumers must ship first; get that order wrong and old consumers meet new data they cannot read. A registry that enforces **full** compatibility removes the ordering constraint entirely, which is why it is worth the setup.

<a id="5-2-the-rules"></a>

### The rules, and why each one holds

| Change | Safe? | Why |
| --- | --- | --- |
| add an optional field with a default | ✓ yes | old readers skip the unknown tag; new readers fill the default |
| rename a field | ✓ yes (protobuf/avro-by-alias) | the wire carries the tag number, not the name |
| widen `int32` to `int64` | ✓ yes | same varint wire type; values round-trip |
| remove a field | ⚠ only after deprecation | readers silently get the default — no error is raised |
| make an optional field required | ✗ no | old producers omit it; new consumers reject valid traffic |
| change a field's type | ✗ never | the wire type changes and the whole message fails to parse |
| reuse a retired tag number | ✗ never | old data decodes into the new field as garbage |

<a id="5-3-the-tolerant-reader"></a>

### The tolerant reader

Half of compatibility is the producer's job; the other half is written into every consumer. A **tolerant reader** takes only what it needs and ignores everything else — which means a producer can add fields freely without coordinating with anyone.

**Read what you need, ignore the rest, preserve the unknown**

```python
# Intolerant: strict mode turns any new producer field into a rejected message.
class Order(BaseModel):
    model_config = ConfigDict(extra="forbid")   # DON'T
    id: str
    amount_minor: int

# Tolerant: unknown fields are ignored, missing optionals get defaults.
class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")   # DO
    id: str
    amount_minor: int
    currency: str = "GBP"                       # added in v2, defaulted here

# Tolerant AND lossless: if you re-emit the message, carry unknowns through,
# otherwise a middleman silently strips fields its neighbours depend on.
class Envelope(BaseModel):
    model_config = ConfigDict(extra="allow")
    event_id: str
    event_type: str
```

```javascript
// Intolerant: .strict() turns any new producer field into a rejected message.
const OrderStrict = z.object({
  id: z.string(),
  amountMinor: z.number().int(),
}).strict();                                    // DON'T

// Tolerant: zod strips unknown keys by default, and optionals get defaults.
const Order = z.object({
  id: z.string(),
  amountMinor: z.number().int(),
  currency: z.string().default("GBP"),          // added in v2, defaulted here
});

// Tolerant AND lossless: passthrough keeps unknown fields so a middleman
// does not silently strip fields its neighbours depend on.
const Envelope = z.object({
  eventId: z.string(),
  eventType: z.string(),
}).passthrough();
```

> **Key idea**
>
> **Enforce compatibility in CI, not in code review.** `buf breaking` for protobuf, a schema registry with `FULL` compatibility for Avro and JSON Schema, and consumer-driven contract tests (section 44) for REST. Compatibility is a property a machine can check on every pull request, and a property humans reliably fail to check at 5 p.m. on a Friday.

<a id="6-rest"></a>

## 6. REST & Resource-Oriented APIs

REST is a style, not a protocol: model your domain as **resources** with stable identifiers, act on them with a small fixed set of verbs, and let the response carry everything needed to interpret it. Almost nobody implements Fielding's full constraint set — what teams mean by “REST” in 2026 is resource URLs, HTTP verbs, HTTP status codes and JSON. That is fine, as long as you get the parts that carry real semantics right.

<a id="6-1-the-verbs-carry-guarantees"></a>

### The verbs carry guarantees

| Verb | Safe | Idempotent | Cacheable | Retry without thinking? |
| --- | --- | --- | --- | --- |
| `GET` | yes | yes | yes | yes |
| `PUT` | no | yes | no | yes |
| `DELETE` | no | yes | no | yes |
| `POST` | no | **no** | rarely | **only with an idempotency key** |
| `PATCH` | no | depends on the patch | no | only if the patch is absolute |

These are not conventions, they are contracts that *infrastructure relies on*. Proxies cache `GET`s. Load balancers and client libraries retry idempotent verbs automatically. A `GET` with a side effect will eventually be executed twice by a prefetcher, and a `PATCH` that says `{"balance": "-10"}` will eventually be applied twice by a retry.

<a id="6-2-status-codes-that-matter"></a>

### Status codes that actually change behaviour

- **202 Accepted** — The single most under-used code. It says “recorded, not finished” and it is the honest answer for every asynchronous endpoint. Return a status URL with it so the caller can poll for completion.
- **409 Conflict / 412 Precondition Failed** — The optimistic-concurrency pair. With `If-Match: "etag"` a client can say “update this only if nobody else has”, which is how you get lost-update protection without holding a lock across a network.
- **429 Too Many Requests** — Always with `Retry-After`. A limiter that does not say when to come back converts one impatient client into a retry storm.
- **503 vs 500**`503` means “try again, this is transient”; `500` means “something is broken, retrying will not help”. Clients retry on the former. Returning `500` for overload wastes the one signal you had.

> **Tip**
>
> Use [RFC 9457 problem details](https://www.rfc-editor.org/rfc/rfc9457.html) for error bodies: a stable `type` URI, a human `title`, the `status`, and a `detail`. It costs nothing and it means clients can branch on a machine-readable code instead of regex-matching your English error strings — which they *will* do otherwise, and then your copy-edit becomes their outage.

<a id="6-3-pagination-and-filtering"></a>

### Pagination that survives contact with real data

**Cursor pagination, and why offsets break**

```python
# DON'T: offset pagination. Two problems that both get worse with scale.
#   1. OFFSET 100000 makes the database count and discard 100,000 rows.
#   2. If a row is inserted while the client pages, everything shifts by one
#      and the client sees an item twice - or never sees it at all.
"select * from orders order by created_at desc limit 20 offset 100000"

# DO: keyset (cursor) pagination. Constant cost, and stable under writes.
async def list_orders(cursor: str | None, limit: int = 20):
    if cursor:
        after_created, after_id = decode_cursor(cursor)
        rows = await db.fetch(
            """select * from orders
                where (created_at, id) < ($1, $2)   -- the index does the seek
                order by created_at desc, id desc
                limit $3""",
            after_created, after_id, limit,
        )
    else:
        rows = await db.fetch(
            "select * from orders order by created_at desc, id desc limit $1", limit
        )

    # Opaque cursor: encode it so clients cannot build one and depend on
    # its shape - that would make your index choice a public API.
    next_cursor = encode_cursor(rows[-1]) if len(rows) == limit else None
    return {"items": rows, "nextCursor": next_cursor}
```

```javascript
// DON'T: offset pagination. Two problems that both get worse with scale.
//   1. OFFSET 100000 makes the database count and discard 100,000 rows.
//   2. If a row is inserted while the client pages, everything shifts by one
//      and the client sees an item twice - or never sees it at all.
"select * from orders order by created_at desc limit 20 offset 100000";

// DO: keyset (cursor) pagination. Constant cost, and stable under writes.
async function listOrders(cursor, limit = 20) {
  const rows = cursor
    ? (await db.query(
        `select * from orders
          where (created_at, id) < ($1, $2)      -- the index does the seek
          order by created_at desc, id desc
          limit $3`,
        [...decodeCursor(cursor), limit],
      )).rows
    : (await db.query(
        "select * from orders order by created_at desc, id desc limit $1", [limit],
      )).rows;

  // Opaque cursor: encode it so clients cannot build one and depend on
  // its shape - that would make your index choice a public API.
  return {
    items: rows,
    nextCursor: rows.length === limit ? encodeCursor(rows.at(-1)) : null,
  };
}
```

<a id="7-grpc"></a>

## 7. gRPC & the Four Call Shapes

gRPC is protobuf over HTTP/2 with generated clients and servers. Its real advantages over REST are less about speed than about the things it makes *impossible to forget*: a schema that CI can diff, deadlines that travel with the request, cancellation that actually propagates, and streaming as a first-class shape rather than a chunked-encoding trick.

> **Interactive animation:** `rpc-modes` — rendered by the page script in the HTML version.

**A service, its deadline, and a streaming call**

```proto
syntax = "proto3";
package shipping.v1;

import "google/protobuf/timestamp.proto";

service Shipping {
  rpc GetShipment(GetShipmentRequest) returns (Shipment);
  rpc WatchShipment(GetShipmentRequest) returns (stream ShipmentEvent);
  rpc UploadScans(stream Scan) returns (UploadSummary);
  rpc Sync(stream ClientMsg) returns (stream ServerMsg);
}

message Shipment {
  string id = 1;
  Status status = 2;
  google.protobuf.Timestamp updated_at = 3;

  enum Status {
    STATUS_UNSPECIFIED = 0;   // always reserve 0 for "unset"
    STATUS_PICKED      = 1;
    STATUS_IN_TRANSIT  = 2;
    STATUS_DELIVERED   = 3;
  }
}
```

```python
# The deadline is part of the call, not a wrapper around it - and the server
# can read it, so it can abandon work it knows will be too late.
async def get_shipment(shipment_id: str):
    async with grpc.aio.insecure_channel(SHIPPING) as channel:
        stub = shipping_pb2_grpc.ShippingStub(channel)
        try:
            return await stub.GetShipment(
                shipping_pb2.GetShipmentRequest(id=shipment_id),
                timeout=0.3,                       # becomes grpc-timeout on the wire
                metadata=(("traceparent", current_traceparent()),),
            )
        except grpc.aio.AioRpcError as e:
            if e.code() == grpc.StatusCode.DEADLINE_EXCEEDED:
                raise TooSlow() from e
            raise

# Server side: check the deadline before starting expensive work.
class ShippingServicer(shipping_pb2_grpc.ShippingServicer):
    async def GetShipment(self, request, context):
        if context.time_remaining() < 0.05:
            context.abort(grpc.StatusCode.DEADLINE_EXCEEDED, "not enough time left")
        return await load_shipment(request.id)
```

```javascript
// A server-streaming call: one request, an async iterable of responses.
async function watchShipment(id, signal) {
  const call = client.watchShipment(
    { id },
    { deadline: Date.now() + 30_000, signal },     // travels on the wire
  );

  for await (const event of call) {
    handle(event);
    // Resume tokens matter: if this stream drops, you must restart from
    // where you got to, not from the beginning.
    lastSeen = event.sequence;
  }
}
```

- **Deadlines are built in** — The `grpc-timeout` header travels with every call and every generated server can read the remaining time. Section 14's deadline propagation is free rather than hand-rolled.
- **Cancellation propagates** — When a client disconnects, the server's context is cancelled and downstream calls made from that context are cancelled too. This is the thing that actually stops wasted work.
- **Browsers cannot speak it** — Browser APIs do not expose HTTP/2 framing, so you need grpc-web plus a proxy, or gRPC-JSON transcoding at a gateway.
- **Nothing caches it** — Every call is a `POST` with a binary body. All the free CDN and proxy caching you get with `GET` is gone.

> **Warning**
>
> **The load-balancing gotcha bites every team once.** A gRPC channel is one long-lived HTTP/2 connection, so an L4 load balancer pins it to a single backend forever. Symptoms: one pod at 90% CPU while its siblings idle, and new pods receiving no traffic after a scale-up. Fix with client-side load balancing over a resolved address list, an L7 proxy that balances per stream, or `GRPC_ARG_MAX_CONNECTION_AGE` so connections recycle and re-resolve.

<a id="8-graphql"></a>

## 8. GraphQL

REST and gRPC both let the *server* decide the response shape. GraphQL inverts that: the client sends a query describing exactly the fields it wants, and gets back that shape and nothing else. When you have several very different clients over one domain graph, this is a genuine win. It also moves a large amount of cost and risk from design time to run time.

```text
REST, a mobile product page: GraphQL, the same page:

                GET /products/88 180 ms POST /graphql 180 ms
                GET /products/88/reviews 180 ms { product(id:88) {
                GET /users/me 180 ms name price
                GET /stock/88 180 ms reviews(first:3){ text }
                ---------------------------------- stock { available }
                4 round trips, over-fetched } }
                ----------------------------------
                1 round trip, exactly the fields
```

<a id="8-1-the-n-plus-1-problem"></a>

### The N+1 problem, and the dataloader

GraphQL resolvers run per field per object, so a query returning 50 orders, each asking for its customer, calls the customer resolver 50 times. Naively that is 50 database round trips for one query — and the query that triggers it looks completely innocent.

**Batch per request tick, then one query**

```javascript
// A DataLoader collects every key requested during one tick of the event
// loop, then issues a single batched query and scatters the results back.
const customerLoader = new DataLoader(async (ids) => {
  const { rows } = await db.query(
    "select * from customers where id = any($1)", [ids],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  // The batch function MUST return results in the same order as the keys.
  return ids.map((id) => byId.get(id) ?? null);
});

const resolvers = {
  Order: {
    // Called 50 times; results in ONE query, not 50.
    customer: (order) => customerLoader.load(order.customerId),
  },
};

// Create loaders PER REQUEST. A process-wide loader caches across users,
// which is a data-leak bug, not a performance optimisation.
app.use((req, res, next) => {
  req.loaders = { customer: makeCustomerLoader() };
  next();
});
```

```python
# strawberry / graphene: the same batching idea, per request.
class CustomerLoader(DataLoader):
    async def batch_load_fn(self, ids: list[str]):
        rows = await db.fetch("select * from customers where id = any($1)", ids)
        by_id = {r["id"]: r for r in rows}
        # The batch function MUST return results in the same order as the keys.
        return [by_id.get(i) for i in ids]

@strawberry.type
class Order:
    customer_id: strawberry.Private[str]

    @strawberry.field
    async def customer(self, info) -> Customer:
        # Called 50 times; results in ONE query, not 50.
        return await info.context["customer_loader"].load(self.customer_id)

# Build loaders PER REQUEST - a process-wide loader caches across users,
# which is a data-leak bug, not a performance optimisation.
async def context_getter() -> dict:
    return {"customer_loader": CustomerLoader()}
```

> **Warning**
>
> **A public GraphQL endpoint is an arbitrary-cost API.** A nested query over a many-to-many relationship can ask for a billion rows in thirty characters, and a malicious client can do it deliberately. Before exposing one publicly you need *all* of: depth limiting, complexity/cost analysis with a per-caller budget, pagination required on list fields, a timeout, and ideally **persisted queries** — where clients may only send hashes of queries you have pre-approved, which also restores CDN caching.

- **Best fit** — Many heterogeneous clients over one graph; a BFF layer you own; rapid product iteration where a new screen should not need a new endpoint.
- **Worst fit** — Service-to-service calls (use gRPC — you control both ends, so flexibility buys nothing), file upload/download, and anything that needs HTTP caching.

<a id="9-api-versioning"></a>

## 9. API Versioning

Versioning is the admission that section 5's compatibility rules will eventually not be enough. The goal is not to version elegantly — it is to **need a new version as rarely as possible**, because every version you ship is one you maintain until the last client dies.

| Strategy | Example | Trade |
| --- | --- | --- |
| URL path | `/v2/orders` | obvious, cacheable, greppable; the version leaks into every link and client |
| Media type | `Accept: application/vnd.acme.v2+json` | purist-correct, URLs stay stable; nearly impossible to test in a browser |
| Header | `X-API-Version: 2026-09-01` | clean URLs; invisible to CDNs unless you add it to the cache key |
| Date pinning | version pinned per API key at signup | best client experience, most server work — Stripe's model |

> **Key idea**
>
> **The date-pinned model is worth understanding even if you do not build it.** Each account is pinned to the API version current when it signed up; the server holds a chain of small *transformation functions* that convert the latest internal response back to each older shape. Your business logic only ever knows the newest version, and the compatibility burden sits in one reviewable, testable list of transformations instead of in forks of every handler.

<a id="9-1-deprecating-without-breaking-anyone"></a>

### Deprecating without breaking anyone

```text
1. Announce docs + changelog + email; give a date, not "soon"
                2. Instrument count calls per version PER CLIENT - you cannot
                remove what you cannot measure
                3. Signal Deprecation: true / Sunset: Wed, 01 Apr 2026 (RFC 8594)
                4. Nudge contact the top 20 callers directly; they are 90% of traffic
                5. Brownout return 410 for 5 minutes at a published time, twice.
                Nothing generates migration tickets like a scheduled outage.
                6. Remove only when the per-client counter has been zero for weeks
```

> **Warning**
>
> Internally, prefer **expand and contract** to versioning: add the new field alongside the old, write both for a release, migrate readers, then stop writing the old one. Three deploys and no version number. Versioning is for boundaries you do not control — if you can see and change every caller, versioning is usually a way of avoiding a conversation.

<a id="10-service-discovery"></a>

## 10. Service Discovery

Instances are ephemeral. They are rescheduled on deploys, scaled by autoscalers, evicted by spot interruptions, and their addresses are recycled within minutes. Discovery is the machinery that keeps a caller's idea of “where is orders?” close enough to the truth.

> **Interactive animation:** `service-discovery` — rendered by the page script in the HTML version.

<a id="10-1-three-places-the-lookup-can-live"></a>

### Three places the lookup can live

| Pattern | Who resolves | Notes |
| --- | --- | --- |
| **Client-side** | the caller's library | one hop, best load balancing; a library in every language to keep updated |
| **Server-side** | a load balancer in front | language-agnostic and simple; an extra hop and a thing to scale |
| **Sidecar** | a proxy on localhost | client-side smarts without client-side libraries — section 13 |

> **Warning**
>
> **DNS is a discovery mechanism with a trap in it.** Many runtimes cache resolutions beyond the TTL — the JVM historically cached forever by default — so an instance replaced twenty minutes ago is still being called. Worse, connection pools hold sockets to addresses resolved long ago, so even a correct TTL changes nothing until the connection is recycled. If you use DNS for discovery, set `networkaddress.cache.ttl`, cap connection age, and treat a short TTL as necessary but not sufficient.

<a id="10-2-registration-and-health"></a>

### Registration, health and the failure window

Instances either register themselves on boot (only the instance knows when it is truly ready) or are registered by the platform (Kubernetes writes Endpoints from readiness probes). Either way the registry must assume entries are lies until proven otherwise, because a crashed process cannot deregister itself. Hence TTLs and continuous probing.

```text
Time to stop sending traffic to a dead instance:

                probe interval (5 s) x failure threshold (3) = 15 s of blackholing
                + propagation to callers (watch: ~0 s, DNS TTL: up to the TTL)
                + the caller's connection pool holding an open socket to it

                Shrink the first term and you get faster failure detection AND more
                false positives during a GC pause. That trade never goes away - it is
                the same trade as a heartbeat timeout in section 19.
```

<a id="11-load-balancing"></a>

## 11. Load Balancing

Having found the healthy set, you pick one. The algorithm matters far more than people expect, because the default — round robin — optimises the one thing that is almost never what you want.

> **Interactive animation:** `load-balancing` — rendered by the page script in the HTML version.

| Algorithm | Balances | Use when |
| --- | --- | --- |
| Round robin | request count | requests are uniform and servers identical — rarely true |
| Least connections | in-flight work | variable request cost; the best general default |
| Power of two choices | in-flight work, cheaply | large fleets — near-optimal without global state |
| EWMA latency | observed response time | heterogeneous hardware or noisy neighbours |
| Consistent hashing | keys | the backend holds a cache or session worth keeping warm |

> **Key idea**
>
> **Power of two choices deserves its reputation.** Pick two backends at random, send to whichever has fewer in-flight requests. It needs no global coordination, and it gets you almost all of least-connections' benefit — crucially, it also avoids the failure mode where every independent balancer picks the *same* least-loaded server simultaneously and stampedes it.

<a id="11-1-outlier-detection-and-the-grey-failure"></a>

### Outlier detection and grey failure

The dangerous instance is not the dead one, it is the one that is up, passing a shallow health check, and answering slowly or returning 500s for a subset of requests. **Outlier detection** (Envoy's term; “passive health checking” elsewhere) watches the *real traffic* for each backend and ejects one whose error rate or latency deviates from its peers.

**Envoy outlier detection, and why the max-ejection cap exists**

```yaml
outlierDetection:
  consecutive5xxErrors: 5        # 5 in a row and you are out
  interval: 10s                  # evaluation window
  baseEjectionTime: 30s          # grows on repeat offences
  maxEjectionPercent: 50         # NEVER let this reach 100

# The cap is the important line. During a dependency-wide outage every
# backend looks unhealthy, and a balancer that ejects all of them turns a
# degraded service into a total one. Keeping half the pool means you fail
# some requests instead of all of them - and the same reasoning is why
# health checks should not cascade their own dependencies' failures.
```

```text
Grey failure, and what catches it:

  symptom                        caught by
  -----------------------------  ------------------------------------------
  process dead                   TCP health check
  process wedged, port open      HTTP /healthz
  healthy but slow               least-connections / EWMA / outlier ejection
  healthy but wrong (bad deploy) canary analysis + error-rate alerting
  healthy for some keys only     per-route metrics; a global rate hides it
```

<a id="12-api-gateways"></a>

## 12. API Gateways & Backends for Frontends

A gateway is a single entry point that terminates TLS, authenticates, applies rate limits, and routes to internal services. The reason it exists is partly latency — and mostly that edge concerns should be implemented once, not once per service.

> **Interactive animation:** `api-gateway` — rendered by the page script in the HTML version.

- **Belongs in the gateway** — TLS termination, authentication and token validation, rate limiting and quotas, request/response logging and trace initiation, CORS, payload size limits, request routing, and protocol translation (REST in, gRPC out).
- **Does not belong in the gateway** — Business rules, per-domain validation, data transformation that encodes domain knowledge, and orchestration of multi-step workflows. The moment shipping a feature means editing the gateway *and* a service, you have rebuilt the enterprise service bus that everyone spent the 2010s escaping.

> **Key idea**
>
> **The BFF variant solves the ownership problem.** One shared gateway serving a web app, an iOS app and a partner API becomes a contended resource: every team needs changes and no team owns it. A *backend for frontend* gives each client its own thin aggregation layer, owned by the team that owns that client. Three small services beat one queue for one service — at the cost of some duplicated aggregation logic, which is usually the cheaper problem.

> **Warning**
>
> A gateway is, by construction, a **single point of failure** and a single point of blast radius for configuration. Run at least three replicas across zones, keep routing config in version control and roll it out like code (canary included), keep the auth path's dependencies minimal, and make sure a gateway deploy cannot take out every API at once.

<a id="13-service-mesh"></a>

## 13. Service Mesh & Sidecars

Retries, timeouts, mTLS, load balancing, circuit breaking and telemetry are the same in every service. Implemented as libraries, they must be written and upgraded per language — and rolling out a retry-policy change becomes a coordinated redeploy of forty teams. A mesh moves them into a proxy next to each process.

> **Interactive animation:** `service-mesh` — rendered by the page script in the HTML version.

**Policy as configuration, applied without touching application code**

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: orders
spec:
  hosts: [orders.internal]
  http:
    - timeout: 2s                    # hard cap for the whole call
      retries:
        attempts: 2
        perTryTimeout: 700ms         # 2 x 700ms + overhead MUST fit in 2s
        retryOn: 5xx,reset,connect-failure
      route:
        - destination: { host: orders.internal, subset: v2 }
          weight: 5                  # canary: 5% to v2
        - destination: { host: orders.internal, subset: v1 }
          weight: 95
---
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: orders
spec:
  host: orders.internal
  trafficPolicy:
    loadBalancer: { simple: LEAST_REQUEST }
    connectionPool:
      http: { maxRequestsPerConnection: 100 }   # forces periodic re-balance
    outlierDetection:
      consecutive5xxErrors: 5
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```

```text
What the sidecar does to one call, in order:

  app  --(plain HTTP to localhost, redirected by iptables)-->  sidecar out
       sidecar out: pick endpoint (LEAST_REQUEST, outliers ejected)
                    start timeout + retry budget
                    originate mTLS with a rotated workload identity
                    emit metrics + a client span
         |
         v  (encrypted, authenticated)
       sidecar in:  terminate mTLS, verify peer identity
                    check authorization policy (may checkout call orders?)
                    emit metrics + a server span
  app  <--(plain HTTP from localhost)--  sidecar in

Two extra hops. ~0.5-1 ms of added p50 latency, and roughly 0.5 vCPU
per 1000 rps of sidecar overhead. That is the price list.
```

- **Worth it when** — You have many services in several languages, a compliance requirement for encryption in transit, and a platform team that can own the control plane. Uniform policy and zero-code mTLS are genuinely hard to get any other way.
- **Not worth it when** — You have six services in one language. A shared client library gives you 80% of the benefit for 5% of the operational cost, and you will not spend incidents debugging whether the problem is your code or the proxy.

> **Tip**
>
> **Ambient/sidecar-less meshes** (Istio ambient, Cilium) move the L4 work into a per-node agent and only inject an L7 proxy where you need L7 features. They cut the per-pod overhead substantially. The architectural trade is unchanged: you are still buying uniform policy with a control plane you must run, upgrade and debug.

<a id="14-timeouts-and-deadlines"></a>

## 14. Timeouts & Deadline Propagation

A timeout converts section 1's third outcome into the second one. It is the most basic resilience mechanism and the most commonly misconfigured, because the defaults are wrong and the failure mode is invisible until you are overloaded.

> **Interactive animation:** `timeout-deadline` — rendered by the page script in the HTML version.

<a id="14-1-the-timeouts-you-must-set"></a>

### The timeouts you must set

| Timeout | Guards against | Typical default |
| --- | --- | --- |
| Connect | unreachable host, full accept queue | often the OS default — tens of seconds |
| TLS handshake | a peer that accepts but never negotiates | frequently unset |
| Read / response | a slow or wedged server | **infinite** in several popular clients |
| Total request | slow drip: many small reads, none late enough to trip | usually unset — the one that catches slowloris |
| Idle / pool checkout | waiting for a connection that never frees up | unset — turns pool exhaustion into a hang |

> **Warning**
>
> **“We have a timeout” usually means one of five is set.** A read timeout with no pool-checkout timeout still hangs forever when the pool is exhausted — which is exactly what happens during the incident. Audit every client you own against the table above; it is an hour of work that prevents a class of outage.

<a id="14-2-picking-the-number"></a>

### Picking the number

Do not guess, and do not use the average. Take the dependency's observed **p99.9** and add headroom — typically p99.9 × 1.5. That is high enough that a legitimate slow request is not killed, and low enough that a wedged call is released quickly. Then sanity-check it against the caller's own budget:

```text
Budget arithmetic for a 2 s user-facing SLO:

                gateway total budget 2000 ms
                - gateway overhead - 50 ms
                = available to downstream 1950 ms

                orders (2 attempts x 700 ms) 1400 ms <-- retries must FIT
                pricing (1 attempt, 250 ms)
                inventory (1 attempt, 250 ms) (parallel, so max not sum)
                render + serialise 200 ms
                --------------------------------------------
                worst case 1650 ms under budget, with slack

                RULE: inner timeout < outer timeout, always. An inner call that cannot
                finish before its caller gives up is pure wasted capacity.
```

<a id="14-3-cancellation-is-the-other-half"></a>

### Cancellation is the other half

A timeout that only abandons the *waiting* is half a timeout. Unless the abandonment propagates, every downstream hop keeps working for a caller that has gone — and that wasted work is precisely what turns a slowdown into a collapse, because it consumes capacity fastest when capacity is scarcest.

**Propagate the deadline, and cancel downstream**

```python
DEADLINE_HEADER = "X-Request-Deadline-Unix-Ms"

async def handler(request):
    # Trust an inbound deadline, but never let it exceed our own maximum -
    # a caller can otherwise pin your threads for an hour with one header.
    inbound = request.headers.get(DEADLINE_HEADER)
    ours = time.time() * 1000 + 2000
    deadline_ms = min(float(inbound), ours) if inbound else ours

    async with deadline_scope(deadline_ms) as scope:
        # asyncio cancels the whole scope when the deadline passes, which
        # propagates into every await inside it, including open sockets.
        price, stock = await asyncio.gather(
            call("pricing", scope), call("stock", scope)
        )
    return render(price, stock)

async def call(service, scope):
    remaining = (scope.deadline_ms - time.time() * 1000) / 1000
    if remaining <= 0.05:
        raise DeadlineExceeded(service)      # do not even start
    return await client.get(
        f"http://{service}/x",
        timeout=remaining,
        headers={DEADLINE_HEADER: str(scope.deadline_ms)},
    )
```

```javascript
const DEADLINE_HEADER = "x-request-deadline-unix-ms";

async function handler(req, res) {
  // Trust an inbound deadline, but never let it exceed our own maximum -
  // a caller can otherwise pin your event loop with one header.
  const inbound = Number(req.headers[DEADLINE_HEADER]);
  const deadline = Math.min(inbound || Infinity, Date.now() + 2000);

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), deadline - Date.now());
  // If the CLIENT hangs up, cancel everything downstream immediately.
  req.on("close", () => ac.abort());

  try {
    const [price, stock] = await Promise.all([
      call("pricing", deadline, ac.signal),
      call("stock", deadline, ac.signal),
    ]);
    res.json(render(price, stock));
  } finally {
    clearTimeout(timer);
  }
}

async function call(service, deadline, signal) {
  if (deadline - Date.now() <= 50) throw new DeadlineExceeded(service);
  return fetch(`http://${service}/x`, {
    signal,
    headers: { [DEADLINE_HEADER]: String(deadline) },
  });
}
```

> **Key idea**
>
> **Pass an absolute deadline, never a duration.** A duration silently resets at every hop: “you have 2 seconds” re-read four hops down means eight seconds of total budget. An absolute timestamp cannot be reset by accident — and the only thing it requires is roughly synchronised clocks, which is already table stakes (section 42). gRPC sidesteps even that by sending a duration that each hop decrements explicitly.

<a id="15-retries"></a>

## 15. Retries, Backoff & Jitter

Retrying is how transient failures stop reaching users, and how a small incident becomes a large one. The difference is entirely in *what* you retry, *when*, and *how many layers* do it.

> **Interactive animation:** `retry-backoff` — rendered by the page script in the HTML version.

<a id="15-1-what-is-safe-to-retry"></a>

### What is safe to retry

| Signal | Retry? | Reason |
| --- | --- | --- |
| connection refused / reset before send | ✓ always | the request provably never executed |
| `503`, `429` with `Retry-After` | ✓ yes, after the stated delay | the server is explicitly asking you to |
| `500`, `502` | ⚠ only if idempotent | the effect may or may not have happened |
| timeout | ⚠ only if idempotent | the ambiguous case — section 1's third outcome |
| `400`, `404`, `422` | ✗ never | the request is wrong; it will be equally wrong next time |
| `401`, `403` | ✗ not as a retry | refresh the token once, then fail — do not loop |

<a id="15-2-the-three-backoff-strategies"></a>

### Backoff, and why jitter is not optional

Exponential backoff fixes the *volume* of retries. It does nothing about their *synchronisation* — clients that failed together retry together, forever, in waves. Jitter fixes that, and AWS's published measurements make “full jitter” the default worth copying:

```text
sleep = random_between(0, min(cap, base * 2**attempt)) <- full jitter

                attempt window a sample draw
                0 0 - 200 ms 17 ms
                1 0 - 400 ms 383 ms
                2 0 - 800 ms 112 ms
                3 0 - 1600 ms 1204 ms

                Decorrelated jitter (good for long polling loops):
                sleep = min(cap, random_between(base, previous_sleep * 3))
```

<a id="15-3-retry-budgets-and-amplification"></a>

### Retry budgets and amplification

> **Interactive animation:** `retry-storm` — rendered by the page script in the HTML version.

**A retry budget: retries can never exceed 10% of traffic**

```python
class RetryBudget:
    """Token bucket over recent traffic. Retries spend; requests earn.

    The point is that during a widespread outage - exactly when naive
    retries would triple the load - the budget empties and retries stop.
    """

    def __init__(self, ratio: float = 0.1, min_per_sec: float = 10.0):
        self.ratio = ratio
        self.min_per_sec = min_per_sec
        self.tokens = 0.0

    def on_request(self) -> None:
        self.tokens = min(self.tokens + self.ratio, 100.0)

    def try_retry(self) -> bool:
        if self.tokens < 1.0:
            metrics.increment("retry.budget_exhausted")
            return False
        self.tokens -= 1.0
        return True

async def call(fn, budget: RetryBudget, attempts: int = 3):
    budget.on_request()
    for attempt in range(attempts):
        try:
            return await fn()
        except Retryable:
            if attempt == attempts - 1 or not budget.try_retry():
                raise
            await asyncio.sleep(random.uniform(0, min(10.0, 0.2 * 2 ** attempt)))
```

```javascript
// Token bucket over recent traffic. Retries spend; requests earn.
// During a widespread outage - exactly when naive retries would triple
// the load - the budget empties and retries stop on their own.
class RetryBudget {
  #tokens = 0;
  constructor(ratio = 0.1, cap = 100) { this.ratio = ratio; this.cap = cap; }

  onRequest() { this.#tokens = Math.min(this.#tokens + this.ratio, this.cap); }

  tryRetry() {
    if (this.#tokens < 1) { metrics.increment("retry.budget_exhausted"); return false; }
    this.#tokens -= 1;
    return true;
  }
}

async function call(fn, budget, attempts = 3) {
  budget.onRequest();
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === attempts - 1 || !isRetryable(err) || !budget.tryRetry()) throw err;
      await sleep(Math.random() * Math.min(10_000, 200 * 2 ** attempt));
    }
  }
}
```

> **Key idea**
>
> **Retry at one layer only.** Retries compose multiplicatively, so three layers with three attempts each is 27× amplification — and it arrives precisely when the system is least able to absorb it. Pick the layer closest to the user that still understands the request, give it a budget, and make every other layer fail fast. Combine with a circuit breaker so repeated failure eventually stops producing traffic at all.

<a id="16-idempotency"></a>

## 16. Idempotency & Deduplication

Every mechanism in this course delivers duplicates: retries, at-least-once brokers, consumer rebalances, webhook redelivery, outbox relays. Idempotency is what makes that safe, and it is the single highest-leverage property you can give a handler.

> **Interactive animation:** `idempotency-key` — rendered by the page script in the HTML version.

<a id="16-1-four-ways-to-get-it"></a>

### Four ways to get it

| Technique | How | Best for |
| --- | --- | --- |
| **Natural idempotence** | absolute assignment: `set status = 'shipped'` | state updates — always prefer this |
| **Dedupe key** | unique constraint on a client-supplied id | creates, charges, sends |
| **Optimistic version** | `where version = $expected` | concurrent writers to one row |
| **Monotonic guard** | `where version < $new`, or a state machine | event handlers that may see stale replays |

<a id="16-2-the-details-that-decide-correctness"></a>

### The details that decide correctness

- **One key per attempt** — The commonest client bug. The key identifies the *intent*, so it must be generated before the first attempt and reused by every retry. Generate it when the user presses the button, not when the HTTP call is made.
- **Check-then-insert** — A `SELECT` followed by an `INSERT` is not atomic: two concurrent retries both see nothing and both proceed. Only a unique constraint (or an `INSERT ... ON CONFLICT`) gives you the atomicity.
- **Key and effect in different transactions** — Recreates the dual-write problem of section 27 in miniature: crash in between, and you have a key with no effect (silent loss) or an effect with no key (duplicate on retry).
- **Store the response** — A retry must receive the *original* answer, including the generated id. Returning bare `200 OK` to a retry forces the client to go looking for what it created.

> **Warning**
>
> **Two subtleties worth designing deliberately.** First, *key reuse with a different body* is a client bug: store a hash of the request and return `422` if the same key arrives with different content, rather than silently replaying the wrong answer. Second, an *in-flight* duplicate (the retry arrives before the original commits) should return `409 Conflict` and let the client retry — not block, and certainly not proceed. Expire keys after a window comfortably longer than your longest retry schedule: 24 hours is a common choice, and the table needs a pruning job.

<a id="17-circuit-breakers"></a>

## 17. Circuit Breakers

Timeouts bound one call. A circuit breaker notices that *many* calls are failing and stops making them — which protects you (threads stay free) and the dependency (it gets a chance to recover).

> **Interactive animation:** `circuit-breaker` — rendered by the page script in the HTML version.

**A breaker with the four numbers that matter**

```python
class CircuitBreaker:
    def __init__(self, *, failure_rate=0.5, min_calls=20, cooldown=30.0,
                 half_open_calls=1):
        self.failure_rate = failure_rate     # trip above this fraction
        self.min_calls = min_calls           # ...but only with enough samples
        self.cooldown = cooldown             # how long OPEN lasts
        self.half_open_calls = half_open_calls
        self.state, self.window, self.opened_at = "closed", deque(maxlen=100), 0.0

    def _allow(self) -> bool:
        if self.state == "closed":
            return True
        if self.state == "open":
            if time.monotonic() - self.opened_at < self.cooldown:
                return False
            self.state = "half_open"          # let exactly one probe through
            self.probes = 0
        return self.probes < self.half_open_calls

    async def call(self, fn, fallback=None):
        if not self._allow():
            metrics.increment("breaker.rejected")
            if fallback is None:
                raise CircuitOpen()
            return await fallback()           # a breaker without a fallback
                                              # just moves the error around
        try:
            result = await fn()
        except Exception:
            self._record(False)
            raise
        self._record(True)
        return result

    def _record(self, ok: bool) -> None:
        if self.state == "half_open":
            # One bad probe reopens; one good probe closes. Never average here.
            self.state, self.opened_at = ("closed", 0.0) if ok else ("open", time.monotonic())
            self.window.clear()
            return
        self.window.append(ok)
        if len(self.window) >= self.min_calls:
            failures = self.window.count(False) / len(self.window)
            if failures >= self.failure_rate:
                self.state, self.opened_at = "open", time.monotonic()
```

```text
The four numbers, and how to choose them:

  failure threshold   50% is a good start. Too low and a normal error
                      rate trips you; too high and you never trip.

  minimum calls       20-ish. Without it, 1 failure out of 1 call opens
                      the breaker on a quiet endpoint at 3 a.m.

  cool-down           30 s, DOUBLING on repeated failure. A fixed short
                      cool-down turns the breaker into a synchronised
                      traffic generator against a service trying to boot.

  half-open calls     1. The whole point is to probe with one request
                      rather than with the entire fleet at once.

Scope: ONE BREAKER PER DEPENDENCY (and per endpoint if their failure
modes differ). A global breaker means a sick recommendations service
cuts you off from a healthy payments service.
```

> **Key idea**
>
> **A breaker with no fallback is half a pattern.** Failing fast only helps if you have something to say: a cached value, a default, a degraded feature, a queued write, or an honest error the UI can render. And check that the fallback does not depend on the same broken thing — falling back to a cache that lives behind the failing service is a surprisingly common own goal.

> **Warning**
>
> Do not count *all* exceptions as failures. A `404` or a validation error means the dependency is working perfectly; counting it trips the breaker during an ordinary traffic pattern. Count timeouts, connection failures and `5xx`. Conversely, **always** count timeouts — they are the expensive failure, because each one holds a worker for the whole timeout.

<a id="18-bulkheads-and-shedding"></a>

## 18. Bulkheads, Load Shedding & Rate Limiting

Three ways to say “no” before saying it becomes involuntary. A bulkhead limits how much of you one dependency can occupy; load shedding rejects work you cannot complete in time; rate limiting enforces a contract with a caller.

> **Interactive animation:** `bulkhead` — rendered by the page script in the HTML version.

<a id="18-1-littles-law-is-the-whole-argument"></a>

### Little's law is the whole argument

```text
 concurrency = arrival rate x service time
                L = lambda x W

                Normal: 100 rps x 0.04 s = 4 workers needed
                Degraded: 100 rps x 30.0 s = 3000 workers needed (you have 10)

                Nothing about your traffic changed. The dependency got slower, and your
                required concurrency went up 750x. This is why a shared pool empties in
                seconds, and why the fix is a bound you set in advance rather than
                capacity you add during the incident.
```

<a id="18-2-shedding-the-right-work"></a>

### Shedding the right work

When you must reject, reject *early* and *selectively*. Rejecting at the door costs microseconds; rejecting after 400 ms of work means you paid for the work and got nothing. And not all requests are equal:

- **Shed by criticality** — Drop the recommendations refresh before the checkout. Tag requests with a priority at the edge and make it part of the request context so every layer can honour it.
- **Shed by age** — If a request has already exceeded its deadline while queued, drop it without executing. Under queue collapse this is the difference between 0% and 100% useful throughput.
- **Shed retries first** — Mark retried requests with a header. When overloaded, reject those before first attempts — it breaks the amplification loop at exactly the right moment.
- **Do not shed randomly if you can avoid it** — Uniform shedding gives every user a partly broken experience. Shedding whole low-priority categories keeps the important paths working.

<a id="18-3-rate-limiting"></a>

### Rate limiting

> **Interactive animation:** `rate-limit` — rendered by the page script in the HTML version.

| Algorithm | Allows bursts? | Notes |
| --- | --- | --- |
| Token bucket | yes, up to capacity | the usual choice for APIs — forgiving and simple |
| Leaky bucket | no | smooths output to a constant rate; good in front of a fragile dependency |
| Fixed window | accidentally, 2× | a burst at the end of one window plus one at the start of the next |
| Sliding window log | no | exact, memory-heavy; the sliding-window *counter* approximation is the practical middle |

> **Warning**
>
> **The hard part is where the counter lives.** Per-instance limits drift as you autoscale (10 instances × 100 rps is a 1000 rps limit you did not intend). A shared counter in Redis fixes that and introduces a dependency on the hot path — so decide in advance whether an unreachable Redis means *fail open* (allow everything, risking overload) or *fail closed* (reject everything, causing an outage). Most teams fail open with a conservative local fallback limit.

<a id="19-health-checks"></a>

## 19. Health Checks & Failure Detection

Everything upstream — discovery, load balancing, orchestration — depends on someone deciding that an instance is unhealthy. In an asynchronous network that decision is always a timeout, and it is always a guess.

<a id="19-1-three-kinds-of-probe"></a>

### Three kinds of probe, with different consequences

| Probe | Asks | Failure means |
| --- | --- | --- |
| **Liveness** | is the process wedged? | **restart it** — so it must never check dependencies |
| **Readiness** | can it serve right now? | remove from the load balancer, leave it running |
| **Startup** | has it finished booting? | wait longer before the other two apply |

> **Warning**
>
> **The most damaging health-check bug is a liveness probe that checks the database.** The database has a hiccup, every replica fails liveness simultaneously, the orchestrator restarts all of them, they all reconnect at once, and the database — which was recovering — is now facing a connection storm from a cold fleet. *Liveness answers “is this process stuck?” and nothing else.* Dependency status belongs in readiness, and even there you should think twice: if every replica reports not-ready, you have converted a degraded service into a zero-capacity one.

**Liveness, readiness and a deep check that is not a probe**

```python
@app.get("/livez")
async def livez():
    # Deliberately trivial. If this handler runs, the event loop is alive.
    # NEVER touch a dependency here - see the warning above.
    return {"ok": True}

@app.get("/readyz")
async def readyz():
    # Is this instance able to serve? Check things WE own and that make
    # us useless if broken: migrations applied, caches warmed, pool open.
    if not app.state.migrations_done:
        raise HTTPException(503, "migrations pending")
    if app.state.shutting_down:
        raise HTTPException(503, "draining")      # graceful shutdown
    if db_pool.available() == 0 and db_pool.waiters() > 50:
        raise HTTPException(503, "pool saturated")
    return {"ok": True}

@app.get("/debug/deep")
async def deep():
    # Rich dependency status for humans and dashboards - NOT wired to any
    # probe, so a dependency blip can never restart or eject the fleet.
    return {
        "database": await ping(db, timeout=0.2),
        "cache": await ping(redis, timeout=0.1),
        "broker": await ping(kafka, timeout=0.3),
    }
```

```yaml
livenessProbe:
  httpGet: { path: /livez, port: 8080 }
  periodSeconds: 10
  failureThreshold: 3            # 30 s of wedged before a restart
  timeoutSeconds: 2              # a probe with no timeout is not a probe

readinessProbe:
  httpGet: { path: /readyz, port: 8080 }
  periodSeconds: 5
  failureThreshold: 2            # come out of rotation faster than you restart

startupProbe:
  httpGet: { path: /readyz, port: 8080 }
  periodSeconds: 5
  failureThreshold: 60           # 5 minutes to boot, THEN liveness applies

lifecycle:
  preStop:
    # Fail readiness, wait for the LB to notice, then let SIGTERM drain.
    # Without this, in-flight requests are killed on every deploy.
    exec: { command: ["sh", "-c", "sleep 15"] }
terminationGracePeriodSeconds: 45
```

<a id="19-2-heartbeats-and-the-detection-trade"></a>

### Heartbeats and the detection trade

Between peers there is no orchestrator, so failure detection is a heartbeat plus a timeout — and the timeout is a pure trade with no correct answer:

```text
timeout too SHORT -> a 400 ms GC pause looks like death
                -> unnecessary failovers, split brain, thrash
                timeout too LONG -> a dead peer keeps receiving traffic for seconds

                The unavoidable asymmetry: you cannot distinguish "crashed" from
                "slow" from "partitioned". This is the FLP result in practical dress -
                in an asynchronous network, no failure detector is both complete and
                accurate. Every real system picks a point on that line and lives with
                the consequences, which is why fencing tokens (section 41) exist.
```

> **Tip**
>
> **Phi-accrual failure detectors** (Cassandra, Akka) replace the binary timeout with a *suspicion level* derived from the observed distribution of heartbeat arrival times. On a network that is normally jittery, the threshold adapts instead of being hand-tuned — and callers can react proportionally: stop sending new work at low suspicion, fail over at high.

<a id="20-queues"></a>

## 20. Queues & Competing Consumers

Sections 14–19 made synchronous calls survivable. The rest of this course is about removing them where they do not belong. A queue does three things at once: it decouples in time, it lets you scale consumers independently of producers, and it converts an overload problem into a latency problem.

> **Interactive animation:** `queue-consumers` — rendered by the page script in the HTML version.

<a id="20-1-the-lease-is-the-mechanism"></a>

### The lease is the mechanism

Everything a queue guarantees comes from one idea: a delivered message is not deleted, it is made *invisible for a while*. SQS calls this the visibility timeout; AMQP calls it an unacked delivery; the effect is identical. If the consumer acks, the message is deleted. If it crashes, the lease expires and someone else gets it.

```text
visibility timeout too SHORT
                -> a slow-but-healthy consumer's message is redelivered while it is
                still working on it. Two consumers now process the same message.
                Symptom: duplicates that correlate with processing time.

                visibility timeout too LONG
                -> a crashed consumer's message is stuck for minutes before anyone
                retries it. Symptom: latency spikes after a deploy or an OOM.

                Fix: set it to ~3x your p99 processing time, AND extend the lease
                periodically from a long-running handler (a "heartbeat" for the
                message) instead of picking one large number.
```

**A consumer that extends its own lease and acks last**

```python
async def consume_forever():
    while True:
        messages = await sqs.receive_message(
            QueueUrl=QUEUE,
            MaxNumberOfMessages=10,
            WaitTimeSeconds=20,           # long polling: fewer empty calls
            AttributeNames=["ApproximateReceiveCount"],
        )
        await asyncio.gather(*(handle_one(m) for m in messages.get("Messages", [])))

async def handle_one(msg):
    receive_count = int(msg["Attributes"]["ApproximateReceiveCount"])
    # Knowing the attempt number lets you log, alert, or degrade on the
    # nth try instead of discovering the loop from a DLQ alarm.
    if receive_count > 3:
        log.warning("message retried repeatedly", message_id=msg["MessageId"])

    keepalive = asyncio.create_task(extend_lease(msg))
    try:
        await process(json.loads(msg["Body"]))     # must be idempotent
        # Ack LAST. Acking first would be at-most-once - see section 23.
        await sqs.delete_message(QueueUrl=QUEUE, ReceiptHandle=msg["ReceiptHandle"])
    except TransientError:
        pass                                       # no ack: it will come back
    finally:
        keepalive.cancel()

async def extend_lease(msg):
    while True:
        await asyncio.sleep(20)
        await sqs.change_message_visibility(
            QueueUrl=QUEUE, ReceiptHandle=msg["ReceiptHandle"], VisibilityTimeout=60,
        )
```

```javascript
async function handleOne(msg) {
  const attempt = Number(msg.Attributes.ApproximateReceiveCount);
  // Knowing the attempt number lets you log, alert, or degrade on the
  // nth try instead of discovering the loop from a DLQ alarm.
  if (attempt > 3) log.warn({ messageId: msg.MessageId }, "retried repeatedly");

  // Extend the lease while we work, rather than guessing one large timeout.
  const keepalive = setInterval(
    () => sqs.send(new ChangeMessageVisibilityCommand({
      QueueUrl: QUEUE, ReceiptHandle: msg.ReceiptHandle, VisibilityTimeout: 60,
    })),
    20_000,
  );

  try {
    await process(JSON.parse(msg.Body));          // must be idempotent
    // Ack LAST. Acking first would be at-most-once - see section 23.
    await sqs.send(new DeleteMessageCommand({
      QueueUrl: QUEUE, ReceiptHandle: msg.ReceiptHandle,
    }));
  } catch (err) {
    if (!isTransient(err)) throw err;             // no ack: it comes back
  } finally {
    clearInterval(keepalive);
  }
}
```

> **Key idea**
>
> **The two metrics that matter are queue depth and oldest-message age.** Depth alone lies: a steady depth of 40 looks identical whether messages take 50 ms or 50 minutes to get through. Age tells you whether you are already violating an expectation. Alert on *age*, capacity-plan on *depth*, and graph the derivative of depth — a queue growing linearly is a consumer that will never catch up.

<a id="21-pubsub"></a>

## 21. Publish/Subscribe

Same infrastructure, opposite semantic. A queue splits messages between consumers; a topic copies each message to every subscription. That single difference changes who owns the contract and how the system evolves.

> **Interactive animation:** `pubsub-fanout` — rendered by the page script in the HTML version.

<a id="21-1-routing-inside-the-broker"></a>

### Routing inside the broker

Not every subscriber wants every message, and filtering in the broker beats filtering in the consumer — you avoid paying to deliver, deserialize and discard.

| Pattern | Selects by | Example |
| --- | --- | --- |
| Topic exchange | a hierarchical routing key | `order.uk.*.created` |
| Header / attribute filter | message attributes | `eventType IN ['refund'] AND amount > 10000` |
| Content-based router | the payload, in a routing component | flexible, and a coupling point — the router now parses everyone's schema |
| Message filter | a predicate in the consumer | simplest; you pay full delivery cost for discarded messages |

> **Warning**
>
> **Two failure modes are specific to pub/sub.** First, *semantic confusion*: deploying three replicas that read a *queue* while expecting each to see every message silently processes a third of the traffic per replica. Say “competing consumers” or “fan-out” out loud when you create the subscription. Second, *the invisible call graph*: nobody can tell who consumes an event by reading the publisher, so a field you believe is unused may be load-bearing for a team you have never met. Publish a schema, version it, and keep a consumer registry.

<a id="22-log-streaming"></a>

## 22. Log-Based Streaming

Kafka, Pulsar and Kinesis look like topics but do not delete what they deliver. Records sit in an append-only partition until a retention policy removes them, and each consumer group tracks its own position. That one difference gives you replay, and it changes the operational model completely.

> **Interactive animation:** `log-stream` — rendered by the page script in the HTML version.

|   | Queue (SQS, RabbitMQ) | Log (Kafka, Kinesis) |
| --- | --- | --- |
| After delivery | deleted on ack | retained until the retention window ends |
| Broker state per message | yes — lease, attempt count | none — just one offset per group per partition |
| Replay | no | yes — reset the offset |
| Per-message retry / DLQ | built in | you build it |
| Parallelism | add consumers freely | capped by partition count |
| Ordering | best-effort (or FIFO queues, at a throughput cost) | strict within a partition |

<a id="22-1-partitions-offsets-and-rebalances"></a>

### Partitions, offsets and rebalances

```text
Choosing a partition count - you can increase it, never decrease it,
                and increasing it changes which key lands where (breaking ordering
                across the boundary). So over-provision modestly at the start.

                partitions >= peak_throughput / per_consumer_throughput
                partitions >= max consumers you ever want in one group
                partitions <= what your ops can carry (each costs files, memory,
                and rebalance time on every broker)

                20 MB/s peak / 5 MB/s per consumer = 4 -> choose 12, not 4.
```

> **Warning**
>
> **Rebalances are the number one source of duplicates.** When a consumer joins, leaves or is declared dead, partitions are reassigned from each group member's *last committed offset* — so anything processed but not committed is processed again. Two mitigations matter: commit offsets frequently but always *after* processing, and use cooperative incremental rebalancing so the whole group does not stop the world. And check `max.poll.interval.ms`: a handler slower than that interval makes the broker think the consumer is dead, triggering a rebalance, which makes everything slower — a feedback loop that presents as mysterious repeated processing.

> **Tip**
>
> **Log compaction** is the feature people forget. With `cleanup.policy=compact` the broker keeps only the *latest* record per key, forever. The topic becomes a durable changelog of current state: a new consumer can read it from the beginning and rebuild a complete local view without querying anybody. That is how you give a service its own replica of reference data without a nightly export job.

<a id="23-delivery-semantics"></a>

## 23. Delivery Semantics

Every broker's guarantee reduces to one decision in the consumer: acknowledge before the work, or after it. Everything else is a consequence.

> **Interactive animation:** `delivery-semantics` — rendered by the page script in the HTML version.

<a id="23-1-there-is-no-exactly-once-delivery"></a>

### There is no exactly-once delivery

This is not a limitation of current products; it is the two generals problem from section 1. The sender cannot know its message arrived without an acknowledgement, and the acknowledgement can be lost, so the sender must choose between possibly-not-sending and possibly-sending-twice. What you *can* have is exactly-once **effect**.

**At-least-once delivery, exactly-once effect**

```python
async def handle(message):
    event_id = message.headers["event-id"]

    async with db.transaction():
        try:
            # The dedupe row and the effect commit TOGETHER or not at all.
            await db.execute(
                "insert into processed_events (event_id, handler) values ($1, $2)",
                event_id, "billing",                # scope by handler: two
            )                                       # consumers legitimately
        except UniqueViolation:                     # each process the event
            log.info("duplicate ignored", event_id=event_id)
            return                                  # ack outside, message gone

        await apply_effect(message.payload)         # the real work

    # Ack only after the transaction committed. A crash before this line
    # redelivers the message, and the insert above makes that harmless.
    await message.ack()
```

```javascript
async function handle(message) {
  const eventId = message.headers["event-id"];

  await db.transaction(async (tx) => {
    try {
      // The dedupe row and the effect commit TOGETHER or not at all.
      await tx.query(
        "insert into processed_events (event_id, handler) values ($1, $2)",
        [eventId, "billing"],       // scope by handler: two consumers may
      );                            // each legitimately process the event
    } catch (err) {
      if (err.code !== UNIQUE_VIOLATION) throw err;
      log.info({ eventId }, "duplicate ignored");
      return;
    }
    await applyEffect(message.payload);            // the real work
  });

  // Ack only after the transaction committed. A crash before this line
  // redelivers the message, and the insert above makes that harmless.
  await message.ack();
}
```

> **Key idea**
>
> **Kafka's “exactly-once semantics” is real but narrow.** Transactional producers plus `read_committed` consumers give you atomic *consume-transform-produce* — the offset commit and the output records commit together, *within Kafka*. The moment your handler calls Stripe, writes to Postgres or sends an email, that external effect is outside the transaction and is yours to deduplicate. Read the guarantee as “exactly once, inside this system”.

<a id="24-ordering"></a>

## 24. Ordering & Partition Keys

Ordering guarantees are narrower than people assume and are silently destroyed by the default partitioner. The fix is one line; understanding *which* line requires knowing what you actually need ordered.

> **Interactive animation:** `ordering-keys` — rendered by the page script in the HTML version.

<a id="24-1-key-selection"></a>

### Choosing the key

The key answers exactly one question: *which events must never overtake each other?* Usually that is the aggregate root — the order id, the account id, the device id. Two constraints pull in opposite directions:

- **Too coarse → hot partitions** — Keying by `country` puts 40% of European traffic on one partition. One consumer is saturated while the rest idle, and you cannot fix it by adding consumers.
- **Too fine → lost ordering** — Keying by `event_id` spreads perfectly and guarantees nothing. If two events about the same entity can land on different partitions, ordering between them is gone.
- **The tie-break** — Key by the entity whose state machine you are driving. If that creates a hot key, salt *only* the hot one (`celebrity#0..7`) and accept unordered processing for it specifically — a deliberate, documented exception.

> **Key idea**
>
> **Make handlers order-insensitive anyway.** Partition counts change, topics get migrated, replays happen, and a DLQ redrive reintroduces an old message into a live stream. A version number with a monotonic guard (`where version < $new`) or an explicit state machine that rejects illegal transitions costs almost nothing and turns “out of order” from a corruption bug into a logged no-op.

<a id="25-dead-letters"></a>

## 25. Dead Letter Queues & Replay

Retries assume failure is transient. Poison messages are not, and without an escape hatch they block everything behind them.

> **Interactive animation:** `dlq` — rendered by the page script in the HTML version.

<a id="25-1-classify-the-failure"></a>

### Classify the failure before you retry it

| Failure | Example | Action |
| --- | --- | --- |
| **Transient** | timeout, 503, deadlock | retry with backoff |
| **Poison** | malformed payload, missing required field | straight to the DLQ — do not waste retries |
| **Dependent** | the referenced order does not exist *yet* | retry with a long delay, then DLQ |
| **Semantic** | business rule rejects it | not a failure — ack and record the rejection |

> **Tip**
>
> The *dependent* row is the interesting one and it is common in event-driven systems: a `PaymentCaptured` event arrives before the `OrderPlaced` that created the order, because they travelled through different topics. Retrying quickly is pointless; the fix is either a *retry topic with a delay* (a 30-second queue and a 5-minute queue, then the DLQ), or keying both events so they share a partition and cannot overtake each other.

<a id="25-2-redrive-and-replay"></a>

### Redrive and replay

- **Keep the original, plus context** — The exact bytes received, the exception, the stack trace, the attempt count and the timestamp. A DLQ entry you cannot reproduce from is a bug report with the interesting half missing.
- **Alarm on depth > 0** — Nothing should reach a DLQ that a human need not see. The classic failure is not a missing DLQ but one nobody has opened since March.
- **One-click redrive** — Put it in the runbook and test it in a game day. Redriving is safe precisely because your handlers are idempotent — and if you are nervous about redriving, that is a signal about your idempotency, not about your DLQ.
- **Never redrive blindly into a live stream** — Old messages re-entering a partition arrive out of order relative to current traffic. This is exactly the case section 24's monotonic guard exists for.

<a id="26-backpressure"></a>

## 26. Backpressure & Flow Control

A queue absorbs a burst. It cannot absorb a sustained mismatch: if the producer is faster than the consumer, the difference accumulates forever. What happens next depends entirely on whether you bounded the buffer.

> **Interactive animation:** `backpressure` — rendered by the page script in the HTML version.

<a id="26-1-where-flow-control-already-exists"></a>

### Where flow control already exists

You often do not need to invent this — you need to stop defeating it:

| Layer | Mechanism | How it gets defeated |
| --- | --- | --- |
| TCP | receive window — stop reading and the sender stalls | an app that drains the socket into an unbounded in-memory list |
| HTTP/2, gRPC | per-stream `WINDOW_UPDATE` credits | buffering the whole stream before processing it |
| Reactive streams | `request(n)` demand signalling | `onBackpressureBuffer()` with no bound |
| Message consumers | prefetch / `max.poll.records` | a prefetch of 1000 with slow handlers — leases expire mid-work |

**A bounded pipeline that pushes back instead of buffering**

```python
# The bound is chosen from a LATENCY target, not from available memory:
# 64 items x 10 ms each = ~640 ms of queueing, which is our budget.
queue: asyncio.Queue = asyncio.Queue(maxsize=64)

async def producer(source):
    async for item in source:
        # put() BLOCKS when the queue is full. That is the backpressure:
        # we stop reading from the source, TCP's window closes, and the
        # pressure travels all the way back to the sender.
        await queue.put(item)

async def producer_with_shedding(source):
    async for item in source:
        try:
            queue.put_nowait(item)
        except asyncio.QueueFull:
            # When you CANNOT push back (an HTTP handler, a fire-and-forget
            # producer), shed explicitly and count it. Silence here is how
            # overload becomes invisible.
            metrics.increment("pipeline.shed")
            raise HTTPException(503, headers={"Retry-After": "1"})

async def consumer():
    while True:
        item = await queue.get()
        try:
            if item.deadline < time.monotonic():
                metrics.increment("pipeline.expired")   # do not do dead work
                continue
            await process(item)
        finally:
            queue.task_done()
```

```javascript
// Node streams implement backpressure for you - if you respect the
// return value of write() and use pipeline() rather than manual pumps.
import { pipeline } from "node:stream/promises";

await pipeline(
  source,                                  // readable
  new Transform({
    objectMode: true,
    highWaterMark: 64,                     // the bound, in items
    transform(item, _enc, cb) {
      // Skip work that is already too late rather than doing it slowly.
      if (item.deadline < Date.now()) { metrics.increment("expired"); return cb(); }
      process(item).then((out) => cb(null, out), cb);
    },
  }),
  sink,
);

// The bug this replaces: reading everything into an array first.
//   const all = [];
//   source.on("data", (d) => all.push(d));   // unbounded, OOM under load
```

> **Key idea**
>
> **An unbounded queue does not prevent overload, it hides it** — until it becomes an out-of-memory kill that loses everything in flight. Bound every buffer from a latency target; then choose deliberately what happens when it fills: *push back* when you can reach the producer, *shed* with `503` plus `Retry-After` when you cannot, or *drop by policy* (oldest-first) when the data's value decays with age.

<a id="27-outbox"></a>

## 27. The Dual Write & the Transactional Outbox

You have a database and a broker. A single operation must update both. There is no transaction that spans them, and every workaround that does not change the *shape* of the problem leaves a window in which one happened and the other did not.

> **Interactive animation:** `outbox` — rendered by the page script in the HTML version.

<a id="27-1-why-the-obvious-fixes-fail"></a>

### Why the obvious fixes fail

| Attempt | What still breaks |
| --- | --- |
| write, then publish | publish fails or the process dies → committed order, no event |
| publish, then write | write fails → an event about an order that does not exist |
| publish inside the transaction | the transaction can still roll back *after* the publish succeeded |
| retry the publish in a loop | narrows the window; the process can die inside the loop |
| compensate by deleting the row | someone may have read it already, and the delete can fail too |

> **Key idea**
>
> Every row above is the same mistake: trying to make two commits behave like one. **The outbox changes the problem instead of attacking it** — it makes the event part of the database write, so there is only ever one commit, and moves publishing to a process that is allowed to fail and retry freely.

<a id="27-2-the-implementation-details"></a>

### The implementation details that matter

**A relay that will not double-publish under two replicas**

```python
CREATE_TABLE = """
create table outbox (
  id            bigserial primary key,        -- ordering for the relay
  event_id      uuid not null unique,         -- consumers dedupe on this
  topic         text not null,
  partition_key text not null,                -- preserves per-entity order
  payload       jsonb not null,
  created_at    timestamptz not null default now(),
  published_at  timestamptz                   -- null = not yet published
);
create index on outbox (id) where published_at is null;   -- partial index:
"""                                                       -- stays tiny

async def relay_batch():
    async with db.transaction():
        rows = await db.fetch(
            """select * from outbox
                where published_at is null
                order by id
                limit 100
                for update skip locked"""      # two relay replicas can run
        )                                      # safely: each takes different
        for row in rows:                       # rows, neither blocks
            await broker.publish(
                row["topic"],
                key=row["partition_key"],      # same key -> same partition
                value=row["payload"],
                headers={"event-id": str(row["event_id"])},
            )
            await db.execute(
                "update outbox set published_at = now() where id = $1", row["id"]
            )
    # A crash between publish and update republishes on restart. That is
    # at-least-once, which is why event-id is on the message.

# Prune, or the table becomes your largest one within a month.
async def prune():
    await db.execute(
        "delete from outbox where published_at < now() - interval '7 days'"
    )
```

```text
Outbox checklist - the five things people miss:

  1. event_id on the row AND on the message. Without it, consumers
     cannot deduplicate the at-least-once republishing.

  2. partition_key on the row. Publishing with a random key destroys
     the ordering you carefully preserved in the database.

  3. FOR UPDATE SKIP LOCKED (or a single leader relay). Two relay
     replicas polling the same rows will double-publish constantly.

  4. A partial index on unpublished rows. Without it the relay's query
     degrades as the table grows, which is the moment it matters most.

  5. A prune job. An unpruned outbox in a busy service outgrows the
     business tables and slows down the transactions that write to it.

Polling interval: 100-500 ms is usually fine, and adds that much
latency to every event. If you need lower, use CDC (section 28)
to tail the WAL instead of polling.
```

> **Tip**
>
> The **inbox** is the mirror pattern on the consuming side: write the incoming event's id into a table in the same transaction as the effect. Section 23's deduplication code *is* an inbox. Together, outbox and inbox give you an at-least-once pipe with exactly-once effects at both ends — which is as close to “exactly once” as the universe permits.

<a id="28-cdc"></a>

## 28. Change Data Capture

The database already writes an ordered, durable record of every committed change: its write-ahead log. CDC reads that log and turns it into a stream — which solves the dual write with *no application changes at all*.

> **Interactive animation:** `cdc` — rendered by the page script in the HTML version.

| Approach | How | Problem |
| --- | --- | --- |
| Poll `updated_at` | `where updated_at > last_seen` | misses deletes; misses rows committed out of clock order; ties at the boundary |
| Triggers to an audit table | a trigger per table | writes inside every transaction; a maintenance burden on the DBA |
| **Log-based (Debezium)** | attach as a replication client | the right answer — no polling, no missed rows, before-images included |

<a id="28-1-the-schema-coupling-trap"></a>

### The schema coupling trap

Raw CDC publishes *table rows*, not domain events. That is its great convenience and its central flaw: every consumer is now coupled to your physical schema, so renaming a column or splitting a table becomes a breaking change to an API you did not know you had published.

- **CDC on an outbox table** — The pattern that gets you both halves: the application writes a designed event into `outbox`, and CDC tails the WAL to publish it. You get low latency and no polling, and the event schema is yours to control.
- **CDC on business tables, published widely** — Fine as a tactical way to unlock a legacy system you cannot modify. Treat the stream as internal, and put a transformation service in front of anything other teams consume.
- **Snapshot pain** — A new connector must first read the entire table (“initial snapshot”) before streaming. On a large table that is hours of load; use an incremental snapshot mode, and plan for it.

> **Warning**
>
> **Two operational hazards.** A stopped connector means the database *cannot recycle its WAL*, so disk fills up silently until the primary refuses writes — monitor replication slot lag as a first-class alert. And CDC events are keyed by primary key, so ordering holds per row; a transaction that touched five tables arrives as five independent events, and reconstructing its atomicity downstream requires the transaction id the connector provides.

<a id="29-event-driven"></a>

## 29. Event-Driven Architecture

“Event-driven” describes at least three different architectures with different coupling, different payloads and different failure modes. Arguments about it are usually two people describing different ones.

> **Interactive animation:** `event-flavours` — rendered by the page script in the HTML version.

<a id="29-1-designing-the-event"></a>

### Designing the event

**An event envelope worth copying**

```json
{
  "specversion": "1.0",
  "id": "9f21b4c8-...",
  "type": "com.acme.orders.placed.v1",
  "source": "/services/orders",
  "subject": "A-4471",
  "time": "2026-09-16T10:31:02.441Z",
  "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",

  "data": {
    "orderId": "A-4471",
    "customerId": "C-1182",
    "totalMinor": 8210,
    "currency": "GBP",
    "items": [{ "sku": "TT-01", "qty": 2 }],
    "occurredAt": "2026-09-16T10:31:02.180Z",
    "version": 3
  }
}
```

```text
Why each field earns its place:

  id           dedupe key. Non-negotiable: delivery is at-least-once.
  type         includes a VERSION. "orders.placed.v1" lets v2 coexist.
  subject      the entity id - also your partition key (section 24).
  time         when the broker got it. Different from occurredAt!
  occurredAt   when the FACT happened in the domain. This is the one
               business logic should use; the other is for operations.
  version      monotonic per entity -> the guard in section 24.
  traceparent  carries the trace across the broker. Without it, your
               distributed trace stops dead at every queue.

Naming:  PAST TENSE, always. "OrderPlaced", never "PlaceOrder".
         An event is a fact that already happened and cannot be
         rejected. If the publisher expects something specific to
         happen next, it is issuing a command - use a queue and be
         honest about the coupling.

Size:    keep under ~100 KB. For anything bigger use a claim check
         (section 33): put the blob in object storage, send the URL.
```

> **Warning**
>
> **Event-driven systems fail in ways request/response ones do not.** There is no call stack, so “why did this happen?” requires correlation ids and traces rather than a stack trace. Cyclic subscriptions become infinite loops that nobody designed — A emits an event B reacts to by emitting an event A reacts to. And because a consumer can lag for hours without anything erroring, *consumer lag is a first-class alert*, not a dashboard curiosity.

<a id="30-cqrs"></a>

## 30. CQRS & Read Models

Writes want normalisation and constraints; reads want denormalised, pre-joined, query-shaped data. One schema serving both is a compromise. CQRS splits them, using the event stream of section 29 as the seam.

> **Interactive animation:** `cqrs` — rendered by the page script in the HTML version.

<a id="30-1-read-your-own-writes"></a>

### The read-your-own-writes problem

The projection lags, so a user who just saved an edit can be shown the old value. This is not a bug you fix; it is the architecture, and you handle it in the interface:

- **Optimistic UI** — Render the change the client just made from local state, without waiting for the read model. Simplest, and covers the common case.
- **Sticky reads after a write** — For N seconds after a user's write, route their reads to the write model (or to a replica known to be caught up). Costs a little consistency plumbing, buys a lot of user trust.
- **Version tokens** — Return the write's version to the client; the client sends it with reads, and the read model waits (briefly) or reports staleness. The most correct, and the most work.
- **Hoping it is fast enough** — It is, until a redeploy or a rebuild puts the projection minutes behind, and then it is the loudest bug in the product.

> **Key idea**
>
> **Apply CQRS to one aggregate, not to a system.** It earns its cost when read and write workloads genuinely differ in shape or scale — a product catalogue read a million times and written a hundred times, say. “We are doing CQRS” as an architecture-wide decision typically produces several times the code and no new capability. Also make every projection *rebuildable from scratch*: the ability to drop a read model and replay is what makes changing one safe.

<a id="31-sagas"></a>

## 31. Sagas

One business operation, several services, several databases. You cannot wrap it in a transaction, so you replace atomicity with a sequence of local transactions, each paired with a compensation that semantically offsets it.

> **Interactive animation:** `saga` — rendered by the page script in the HTML version.

<a id="31-1-compensation-is-not-rollback"></a>

### Compensation is not rollback

A rollback leaves no trace; a compensation is a new forward transaction that everyone can see. The customer's statement shows the charge *and* the refund. Between the two, the money genuinely was gone — sagas are not *isolated*, and that intermediate visibility is a product decision somebody must make deliberately.

| Step type | Meaning | Consequence |
| --- | --- | --- |
| **Compensatable** | can be semantically undone | put these first |
| **Pivot** | the point of no return | after it, the saga must roll *forward* |
| **Retryable** | must eventually succeed | put these after the pivot — retry until they do |

> **Key idea**
>
> Ordering steps by that table is the single most useful saga design technique. Send-the-email and ship-the-parcel cannot be undone, so they belong *after* the pivot, where the saga has already committed to succeeding. Discovering mid-incident that your only compensation for “email sent” is a second, apologetic email is how sagas get their reputation.

**An orchestrator that survives its own restart**

```python
STEPS = [
    Step("capture_payment", do=payments.capture,  undo=payments.refund),
    Step("reserve_stock",   do=inventory.reserve, undo=inventory.release),
    Step("schedule_ship",   do=shipping.schedule, undo=None),   # the PIVOT
    Step("send_receipt",    do=email.send,        undo=None),   # retryable
]

async def run(saga_id: str):
    # State lives in the DATABASE, not in memory. The orchestrator can be
    # killed between any two lines and resume exactly where it left off.
    state = await load_or_create(saga_id)

    while state.index < len(STEPS):
        step = STEPS[state.index]
        try:
            # Idempotency key is derived, not random: a retry of this step
            # after a crash reuses the same key. See section 16.
            await step.do(saga_id, idempotency_key=f"{saga_id}:{step.name}")
        except Compensatable as e:
            await compensate(saga_id, state, upto=state.index)
            await mark_failed(saga_id, reason=str(e))
            return
        except Exception:
            # Past the pivot there is no way back: retry forever with
            # backoff, and page a human if it stays stuck.
            await schedule_retry(saga_id, backoff_for(state.attempts))
            return

        state = await advance(saga_id)          # committed after EVERY step

    await mark_complete(saga_id)

async def compensate(saga_id, state, upto):
    # Reverse order, and compensations must be idempotent too - this loop
    # can itself be interrupted and resumed.
    for i in range(upto - 1, -1, -1):
        if STEPS[i].undo:
            await STEPS[i].undo(saga_id, idempotency_key=f"{saga_id}:undo:{i}")
        await record_compensated(saga_id, i)
```

```text
Orchestration vs choreography - choosing:

  ORCHESTRATION when:            CHOREOGRAPHY when:
    more than 3 steps              2-3 stable steps
    the flow is business-critical  participants are owned by one team
    you need timeouts per step     you add participants often
    a human may intervene          nobody needs a single view of progress
    you need a progress view

The decisive question is not coupling, it is: WHO DO YOU ASK
"why is order A-4471 stuck?" With an orchestrator, one query answers
it. With choreography, you correlate logs across five services and
hope everyone propagated the trace id.

Either way you need:
  - a state machine persisted after every step (survives restarts)
  - idempotent steps AND idempotent compensations
  - a timeout per step, with an explicit "stuck" state
  - a dashboard of in-flight sagas by state and age
  - a manual retry/cancel control for support staff
```

<a id="32-two-phase-commit"></a>

## 32. Two-Phase Commit

2PC gives real atomicity across systems. Understanding why it is nevertheless rare between services is worth the five minutes, because “why not just use distributed transactions?” comes up in every design review.

> **Interactive animation:** `two-phase-commit` — rendered by the page script in the HTML version.

- **It blocks** — A participant that voted yes may neither commit nor abort until the coordinator speaks. If the coordinator dies in the window, locks are held indefinitely — and participants cannot resolve it among themselves, because they may all be in the same state.
- **Availability multiplies, hard** — The transaction needs *every* participant and the coordinator up simultaneously, for the whole duration. Five 99.9% participants give a 99.4% transaction.
- **Locks are held across a network** — Lock duration goes from microseconds to round trips, so throughput on contended rows collapses.
- **Where it is fine** — Inside one database cluster, across shards on one fast network, with a replicated coordinator — Spanner and CockroachDB do exactly this, using Paxos/Raft-replicated coordinators plus tight clock bounds so the blocking window is survivable.

> **Key idea**
>
> **The saga is 2PC's practical replacement**, and the trade is explicit: 2PC gives atomicity and takes availability; a saga gives availability and takes isolation. Nothing gives you both — which is a restatement of CAP, one layer up.

<a id="33-composition-patterns"></a>

## 33. Composition: Scatter-Gather, Aggregator, Claim Check

Three small patterns that show up constantly once you have more than a handful of services.

<a id="33-1-scatter-gather-and-the-tail"></a>

### Scatter-gather and the tail

> **Interactive animation:** `scatter-gather` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Any fan-out makes you hostage to the worst component.** With `N` parallel calls each having a p99 of `t`, the probability that *none* is slow is `0.99^N` — 96% at N=4, 37% at N=100. Design for the tail deliberately: **hedge** idempotent reads at the p95 mark, allow **partial results** with an explicit incompleteness flag, keep the fan-out narrow, and measure the p99 of the *aggregate*. Per-shard dashboards will look healthy for the entire duration of the complaint.

<a id="33-2-aggregator-and-claim-check"></a>

### Aggregator and claim check

**Partial results, and keeping big payloads out of the broker**

```python
async def search(query: str, deadline_ms: float):
    budget = (deadline_ms - now_ms()) / 1000
    tasks = {name: asyncio.create_task(shard.search(query, timeout=budget))
             for name, shard in SHARDS.items()}

    done, pending = await asyncio.wait(tasks.values(), timeout=budget)
    for task in pending:
        task.cancel()                          # stop work nobody will read

    results, missing = [], []
    for name, task in tasks.items():
        if task in done and not task.exception():
            results.extend(task.result())
        else:
            missing.append(name)               # degrade, do not fail

    # Tell the caller the answer is incomplete instead of pretending.
    return {"results": rank(results), "partial": bool(missing), "missing": missing}

# Claim check: never put a 40 MB document on the broker. Put a pointer.
async def publish_document(doc_bytes: bytes, doc_id: str):
    key = f"documents/{doc_id}"
    await s3.put_object(Bucket=BUCKET, Key=key, Body=doc_bytes)
    await broker.publish("documents", key=doc_id, value={
        "documentId": doc_id,
        "location": f"s3://{BUCKET}/{key}",    # the claim check
        "sizeBytes": len(doc_bytes),
        "sha256": hashlib.sha256(doc_bytes).hexdigest(),
    })
    # Keeps messages small and fast, keeps sensitive bytes out of broker
    # logs and replicas, and lets access control live with the object.
    # The cost: object lifetime must outlive the topic's retention.
```

```javascript
async function search(query, deadlineMs) {
  const budget = deadlineMs - Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), budget);

  // allSettled, not all: one rejected shard must not fail the request.
  const entries = Object.entries(SHARDS);
  const settled = await Promise.allSettled(
    entries.map(([, shard]) => shard.search(query, { signal: ac.signal })),
  );
  clearTimeout(timer);

  const results = [];
  const missing = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") results.push(...r.value);
    else missing.push(entries[i][0]);          // degrade, do not fail
  });

  // Tell the caller the answer is incomplete instead of pretending.
  return { results: rank(results), partial: missing.length > 0, missing };
}
```

> **Tip**
>
> **Hedging is cheap insurance for idempotent reads.** Send a duplicate request to a second replica once the first has exceeded the p95, and take whichever answers first. Roughly 5% extra load buys a dramatically shorter tail. Never hedge a write, and always cancel the loser so the duplicate does not become a second unit of real work.

<a id="34-caching"></a>

## 34. Caching Between Services

A cache is the cheapest way to remove a network call, and the easiest way to build a system that works until the instant it does not. The failure modes are specific and worth knowing in advance.

> **Interactive animation:** `cache-stampede` — rendered by the page script in the HTML version.

<a id="34-1-where-the-cache-sits"></a>

### Where the cache sits

| Location | Latency | Trade |
| --- | --- | --- |
| In-process | nanoseconds | fastest; N copies with N different opinions, and cold on every deploy |
| Shared (Redis) | ~0.5 ms | one truth, survives deploys; a network hop and a new dependency on the hot path |
| HTTP / CDN | varies | free with correct `Cache-Control`; only works for `GET` |
| Two-tier | ns then ms | best hit latency with shared truth; two invalidation problems instead of one |

<a id="34-2-invalidation-and-the-failure-modes"></a>

### Invalidation, and the three classic failures

- **Stampede (dog-piling)** — A hot key expires and every concurrent request recomputes it. Fix with **single-flight** (one recomputation, everyone else waits) plus **jittered TTLs** so keys populated together do not expire together.
- **Penetration** — Requests for a key that does not exist miss every time and hit the origin every time — trivially weaponised. Cache the negative result briefly, or put a bloom filter in front.
- **Avalanche** — The cache tier restarts and every key is gone at once. Your origin was sized for the 0.1% miss rate. Mitigate with warm-up on boot, request rate limits at the origin, and multi-node caches that never all restart together.
- **Stale-while-revalidate** — The most valuable single technique: serve the expired value while refreshing in the background. A 61-second-old price beats an error, and it converts a slow origin from an outage into a slightly stale page.

> **Warning**
>
> **Invalidation across services is a distributed systems problem wearing a cache costume.** Publishing an `invalidate` event is itself a dual write (section 27), and it can be lost, delayed or reordered. That is why the honest default is a *short TTL*: it bounds staleness without requiring correctness from your invalidation path. Reach for event-driven invalidation only where the staleness window genuinely matters, and keep the TTL as a safety net.

<a id="35-real-time-push"></a>

## 35. Real-Time Push to Clients

The last hop is asymmetric: the client is behind a NAT, on a flaky radio, and cannot be dialled. The connection must be initiated from their side, so every option is a variation on “how long do we keep it open?”

> **Interactive animation:** `push-channels` — rendered by the page script in the HTML version.

|   | Latency | Direction | Reconnect | Proxy friendliness |
| --- | --- | --- | --- | --- |
| Short polling | half the interval | pull | n/a | perfect |
| Long polling | near zero | pull, parked | you build it | good, watch idle timeouts |
| SSE | near zero | server → client | **automatic**, with `Last-Event-ID` | good; disable proxy buffering |
| WebSocket | near zero | both | you build it | needs upgrade support |

Those four rows are not four competing technologies so much as four answers to one question: *who keeps the connection open, and for how long?* Sections 36–38 take them one at a time. This section is the map, plus the part they all share.

<a id="35-1-choosing-a-channel"></a>

### Choosing a channel

```text
Is the "client" another company's server?           -> webhook (section 39)
Is it ONE long job the caller is waiting on?         -> async request-reply (section 40)

Otherwise it is a browser or an app:
  Must the client SEND often (chat, cursors, games)? -> WebSocket (section 38)
  Is the stream continuous, or latency-sensitive?    -> SSE (section 37)
  Updates rare, seconds of delay acceptable?          -> poll with a cursor (section 36)
  Corporate proxy eats every stream?                  -> long polling as the fallback
```

> **Key idea**
>
> **Every push channel is only as reliable as its cursor.** Polling, long polling, SSE and WebSockets all drop the connection sooner or later — a deploy, a train tunnel, a proxy timeout. The one thing that makes a reconnect lossless is the same in all four: events carry a monotonic id, the client remembers the last one it saw, and the server can answer “everything after N” from a durable backlog. Pick the transport for latency and direction; get the cursor right for correctness.

<a id="35-2-long-lived-connections"></a>

### The operational reality of long-lived connections

Everything below applies to long polling, SSE and WebSockets alike. None of it shows up in a local demo, and all of it shows up in the first week of production.

```text
DEPLOYS         every deploy disconnects everyone at once. Without
                jittered client reconnect, they all come back in the
                same 200 ms and you DDoS yourself on every release.

SCALING         autoscale on CONNECTION COUNT, not CPU. A box holding
                50,000 idle sockets is at 3% CPU and completely full.
                Check ulimit, ephemeral port range and LB connection
                limits before you find them the hard way.

ROUTING         any instance may need to reach any client, so you need
                a pub/sub backplane (Redis, NATS, Kafka) behind the
                fleet. The fan-out problem from section 21, one layer
                down.

LIVENESS        a NAT or LB will drop an idle connection silently and
                both sides will believe they are still talking. Ping
                every 30 s; SSE can send a comment line ":keepalive".

AUTH            tokens expire mid-connection. Decide whether you drop
                the connection, or accept a re-auth message on it.

BACKPRESSURE    a slow client must not grow an unbounded server-side
                buffer. Bound it, and disconnect clients that fall too
                far behind - section 26 applies here too.
```

<a id="36-polling-and-long-polling"></a>

## 36. Polling & Long Polling

Polling is the baseline every push mechanism is measured against, and it is still the right answer more often than its reputation suggests: dashboards that refresh every 30 seconds, mobile apps in the background, the status of a long-running job (section 40). Long polling is the trick that got push latency out of plain HTTP before SSE and WebSockets existed. It is now the fallback for hostile networks — and, less visibly, the engine inside SQS `WaitTimeSeconds`, Kafka's `fetch.max.wait.ms` and Consul's blocking queries.

> **Interactive animation:** `long-poll-cursor` — rendered by the page script in the HTML version.

<a id="36-1-short-polling-done-properly"></a>

### Short polling done properly

The cost of polling is set by *client count over interval*, not by how often anything changes — so the work is to make each empty answer as cheap as possible.

```text
load        = clients / interval
              50,000 clients / 10 s  = 5,000 requests per second,
              of which ~99% say "nothing new"

latency     = interval / 2 on average, interval at worst

make the empty answer cheap:
  conditional GET   If-None-Match: "v41"   -> 304 Not Modified, no body
  cursor            GET /orders?updated_after=2026-10-03T09:14:07Z
  CDN caching       Cache-Control: max-age=5 on shared data, so 50,000
                    clients become one origin request per 5 s
  adapt             back off when the tab is hidden (Page Visibility API),
                    honour a server-sent Retry-After, jitter the interval
```

- **Strength — boring infrastructure** — Stateless, cacheable, trivially load-balanced, and passes through every proxy, firewall and CDN ever built. A failed poll is just a failed GET, retried on the next tick.
- **Strength — the server sets the pace** — `Retry-After` and `Cache-Control` let the server slow every client down during an incident without a deploy.
- **Weakness — load scales with the audience** — Doubling users doubles traffic even if nothing ever changes; that is backwards for anything popular.
- **Weakness — latency floor** — You cannot get below half the interval on average, and shortening the interval buys latency linearly with load.

<a id="36-2-long-polling-server-side"></a>

### Long polling, server side

The server parks the request until there is something to say or a timeout fires, then the client immediately asks again. Two details decide whether it is correct: the **cursor** (so events produced *between* two polls are not lost) and **subscribe-before-check** (so an event published between “is there anything?” and “wait for something” is not lost either).

**A long-poll endpoint with a cursor and no lost wake-ups**

```python
POLL_TIMEOUT = 25        # below every proxy's idle timeout (commonly 30-60 s)

@app.get("/updates")
async def updates(after: int, user=Depends(current_user)):
    # Subscribe FIRST, then check. Checking first leaves a window where an
    # event is published after the check but before the wait - and the
    # request then sleeps for 25 s with news sitting in the log.
    waiter = notifier.subscribe(user.id)
    try:
        events = await log.read_after(user.id, after, limit=100)
        if not events:
            try:
                async with asyncio.timeout(POLL_TIMEOUT):
                    await waiter.wait()           # a parked coroutine, not a thread
            except TimeoutError:
                return Response(status_code=204) # empty: the client re-polls
            events = await log.read_after(user.id, after, limit=100)
        return {"events": events, "cursor": events[-1].seq if events else after}
    finally:
        waiter.close()
```

```javascript
const POLL_TIMEOUT_MS = 25_000;  // below every proxy's idle timeout

app.get("/updates", requireUser, async (req, res) => {
  const after = Number(req.query.after ?? 0);
  // Subscribe FIRST, then check, so no publish can slip between the two.
  const waiter = notifier.subscribe(req.user.id);
  try {
    let events = await log.readAfter(req.user.id, after, 100);
    if (events.length === 0) {
      const woke = await waiter.wait(POLL_TIMEOUT_MS);   // resolves false on timeout
      if (!woke) return res.sendStatus(204);             // empty: the client re-polls
      events = await log.readAfter(req.user.id, after, 100);
    }
    res.json({ events, cursor: events.at(-1)?.seq ?? after });
  } finally {
    waiter.close();
  }
});
```

**The client loop: persist the cursor, back off on errors only**

```python
async def poll_forever(session: aiohttp.ClientSession, cursor: int):
    failures = 0
    while True:
        try:
            async with session.get(f"{BASE}/updates", params={"after": cursor},
                                   timeout=aiohttp.ClientTimeout(total=35)) as res:
                if res.status == 200:
                    body = await res.json()
                    for ev in body["events"]:
                        await handle(ev)              # must be idempotent
                    cursor = body["cursor"]
                    await save_cursor(cursor)
                failures = 0                          # a 204 is success too
        except (aiohttp.ClientError, asyncio.TimeoutError):
            failures += 1
            # Full jitter (section 15): a server restart must not bring
            # every client back in the same 100 ms.
            await asyncio.sleep(random.uniform(0, min(30, 0.5 * 2 ** failures)))
```

```javascript
async function pollForever(signal) {
  let cursor = Number(localStorage.getItem("cursor") ?? 0);
  let failures = 0;
  while (!signal.aborted) {
    try {
      const res = await fetch(`/updates?after=${cursor}`, { signal });
      if (res.status === 200) {
        const { events, cursor: next } = await res.json();
        events.forEach(render);                  // must be idempotent
        cursor = next;
        localStorage.setItem("cursor", String(cursor));
      }
      failures = 0;                              // a 204 is success too
    } catch (err) {
      if (signal.aborted) return;
      failures += 1;
      // Full jitter (section 15): a server restart must not bring
      // every client back in the same 100 ms.
      await sleep(Math.random() * Math.min(30_000, 500 * 2 ** failures));
    }
  }
}
```

> **Warning**
>
> **The hold time must be shorter than the shortest idle timeout on the path.** An ALB defaults to 60 s, nginx's `proxy_read_timeout` to 60 s, some corporate proxies to 30 s, and a mobile carrier's NAT can be far less. Exceed any one of them and the request dies with a `504` instead of a clean `204` — and because every client parked at the same moment, they all reconnect at the same moment. Hold for 20–25 s and treat the empty response as normal.

> **Tip**
>
> **A parked request is a held connection.** Long polling costs the same file descriptors and memory per client as SSE, plus a full request/response cycle per message. It wins on compatibility, not efficiency — which is why it is the fallback that libraries such as Socket.IO and SignalR quietly switch to when a stream cannot get through.

<a id="37-server-sent-events"></a>

## 37. Server-Sent Events

Server-sent events (SSE) are one HTTP response that never ends. The server sets `Content-Type: text/event-stream`, keeps the body open, and writes small blocks of text whenever it has news. The browser's `EventSource` API parses them, dispatches them as events, and — the part that matters — reconnects by itself and tells the server the id of the last event it saw. That is the whole protocol, and it is why SSE is the right default for server-to-client updates: price tickers, notifications, progress bars, build logs, and the token-by-token output of every major LLM API.

> **Interactive animation:** `sse-resume` — rendered by the page script in the HTML version.

<a id="37-1-the-wire-format"></a>

### The wire format

```text
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache

: lines starting with a colon are comments - used as keepalives
retry: 5000                        <- reconnect delay the browser should use (ms)

id: 41
event: price                       <- dispatched to addEventListener("price")
data: {"sym":"ACME","px":214.02}
                                   <- a BLANK line ends the event
id: 42
data: first line of a payload
data: second line                  <- joined with "\n" by the client

```

Four field names, UTF-8 text only, and a blank line as the delimiter. An event without an `event:` field is dispatched as `message`. An `id:` sets the client's `lastEventId`, which the browser sends back as the `Last-Event-ID` request header on every automatic reconnect — so put an id on **every** event, or a reconnect resumes from the last event that happened to have one.

|   | SSE | WebSocket |
| --- | --- | --- |
| Direction | server → client | both |
| Protocol | plain HTTP response | HTTP upgrade, then its own framing |
| Payload | UTF-8 text (binary must be base64, +33%) | text or binary |
| Reconnect and resume | **built in** — `retry:` and `Last-Event-ID` | yours to build |
| Auth, cookies, CORS, HTTP/2 multiplexing | unchanged from the rest of your API | handshake only; CORS does not apply |
| Works through ordinary proxies | yes, once buffering is off | needs upgrade support end to end |

<a id="37-2-a-resumable-stream"></a>

### A resumable stream behind a fleet

A production SSE endpoint does four things beyond writing lines: it **replays** from `Last-Event-ID`, it receives live events from a **backplane** (because the publisher is rarely on the instance holding the connection), it sends **keepalives**, and it orders the first two carefully. Subscribe to the live feed *before* reading the backlog and drop duplicates by id; the other way round loses anything published between the two calls — the same race as in long polling.

**SSE with resumption, keepalives and a backplane**

```python
KEEPALIVE = 15   # seconds; comfortably inside every idle timeout on the path

@app.get("/stream")
async def stream(request: Request, user=Depends(current_user),
                 last_event_id: str | None = Header(None)):
    async def gen():
        last_seq = int(last_event_id or 0)
        # Subscribe BEFORE reading the backlog; the subscription buffers
        # anything published while the replay is running.
        live = bus.subscribe(f"user:{user.id}")
        try:
            # Resumption: the browser sent Last-Event-ID automatically.
            for ev in await backlog.since(user.id, last_seq):
                yield sse(ev)
                last_seq = ev.seq

            while not await request.is_disconnected():
                try:
                    ev = await asyncio.wait_for(live.next(), timeout=KEEPALIVE)
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"           # keeps NATs and LBs from reaping us
                    continue
                if ev.seq <= last_seq:                # already sent during replay
                    continue
                yield sse(ev)
                last_seq = ev.seq
        finally:
            await live.close()

    return StreamingResponse(gen(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",     # tell nginx not to buffer the stream
    })

def sse(ev) -> str:
    # id: enables resumption. retry: sets the client's reconnect delay -
    # jittered per connection so a deploy does not synchronise everyone.
    retry_ms = random.randint(2000, 8000)
    return f"id: {ev.seq}\nevent: {ev.type}\nretry: {retry_ms}\ndata: {json.dumps(ev.data)}\n\n"
```

```javascript
const KEEPALIVE_MS = 15_000;
const MAX_BUFFER = 1 << 20;      // 1 MiB queued for one client is "not keeping up"

app.get("/stream", requireUser, async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",   // tell nginx not to buffer the stream
  });

  let lastSeq = Number(req.get("Last-Event-ID") ?? 0);
  const send = (ev) => {
    if (ev.seq <= lastSeq) return;                 // already sent during replay
    lastSeq = ev.seq;
    const retry = 2000 + Math.floor(Math.random() * 6000);   // jittered per connection
    res.write(`id: ${ev.seq}\nevent: ${ev.type}\nretry: ${retry}\ndata: ${JSON.stringify(ev.data)}\n\n`);
    // A slow client must not grow an unbounded buffer (section 26). Cut it
    // loose; it reconnects with Last-Event-ID and loses nothing.
    if (res.writableLength > MAX_BUFFER) res.end();
  };

  // Subscribe BEFORE replaying, and hold live events until the replay ends.
  const pending = [];
  let replaying = true;
  const live = await bus.subscribe(`user:${req.user.id}`, (ev) =>
    replaying ? pending.push(ev) : send(ev));
  for (const ev of await backlog.since(req.user.id, lastSeq)) send(ev);
  replaying = false;
  pending.forEach(send);

  const keepalive = setInterval(() => res.write(": keepalive\n\n"), KEEPALIVE_MS);
  req.on("close", () => {
    clearInterval(keepalive);
    live.unsubscribe();
  });
});
```

**The browser side — `EventSource` does the reconnecting for you**

```javascript
const es = new EventSource("/stream", { withCredentials: true });

es.addEventListener("price", (e) => render(JSON.parse(e.data)));

es.onerror = () => {
  // CONNECTING: the browser is already retrying and will send Last-Event-ID.
  // CLOSED: it gave up - a non-200 status or the wrong Content-Type stops
  // EventSource for good, and reconnecting is now your job.
  if (es.readyState === EventSource.CLOSED) scheduleReconnect();
};
```

<a id="37-3-sse-in-production"></a>

### What breaks in production

- **Strength — it is just HTTP** — Your auth cookies, CORS rules, rate limits, access logs, tracing and HTTP/2 multiplexing all apply unchanged. There is no second protocol to secure or observe.
- **Strength — resumption is in the protocol** — `retry:` and `Last-Event-ID` give you reconnect-and-resume for free; with WebSockets the same feature is a project.
- **Weakness — buffering intermediaries** — Anything that buffers the response — nginx with `proxy_buffering on`, gzip middleware, some CDNs, serverless gateways that only return complete responses — holds your events until the buffer fills. The symptom is “works locally, arrives in bursts in production”.
- **Weakness — six connections per origin on HTTP/1.1** — Browsers cap HTTP/1.1 connections per origin across *all tabs*, so the seventh tab's stream silently queues. Serve over HTTP/2, where streams share one connection, or share one stream between tabs with a `SharedWorker` or `BroadcastChannel`.
- **Weakness — `EventSource` is GET-only with no custom headers** — You cannot send `Authorization: Bearer …`. Use cookies, a short-lived single-use token in the query string (it will be logged, so make it expire in seconds), or a `fetch()`-based reader.
- **Weakness — one direction, text only** — The client still sends everything with ordinary requests. That is usually fine; when it is not, you wanted a WebSocket.

> **Tip**
>
> **LLM streaming APIs are SSE — but not `EventSource`.** OpenAI- and Anthropic-style chat completions stream tokens as `text/event-stream`, but the request is a `POST` with a JSON body and a bearer token, which `EventSource` cannot send. Clients read the stream with `fetch()` and a `ReadableStream`, parsing the same `data:` lines by hand. Same wire format, different client — and none of the automatic reconnect, which is why a dropped generation is normally restarted rather than resumed.

> **Warning**
>
> **A `204` stops the reconnect loop; a `500` does not.** `EventSource` keeps retrying network errors forever, but any non-`200` status or a wrong `Content-Type` closes it permanently. Use that deliberately: return `204 No Content` to tell a client to stop (logged out, feature disabled), and make sure a crashing endpoint fails as a dropped connection rather than an error page — or every client will need its own reconnect logic after all.

<a id="38-websockets"></a>

## 38. WebSockets

A WebSocket starts as an HTTP request and then stops being HTTP. After `101 Switching Protocols`, the TCP connection carries framed messages in both directions with no request/response pairing, no status codes and no headers. That freedom is the whole feature and the whole bill: everything HTTP gave you per request — status codes, retries, idempotency, request-level load balancing, per-request auth, caching — now has to be rebuilt as a protocol of your own on top.

> **Interactive animation:** `websocket-backplane` — rendered by the page script in the HTML version.

<a id="38-1-handshake-and-frames"></a>

### The handshake and the frame

```text
GET /ws HTTP/1.1                              HTTP/1.1 101 Switching Protocols
Host: chat.example.com                        Upgrade: websocket
Upgrade: websocket                            Connection: Upgrade
Connection: Upgrade                           Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==   Sec-WebSocket-Protocol: chat.v2
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: chat.v2, chat.v1      <- the ONLY HTTP moment: cookies,
Origin: https://app.example.com                  Origin and auth are checked here

after the 101, every message is a frame:

  FIN | opcode | MASK | payload length | (mask key) | payload
   1b    4b      1b      7 / 16 / 64 b     32 b

  opcodes   0x1 text   0x2 binary   0x8 close   0x9 ping   0xA pong
  overhead  2-14 bytes per message, versus hundreds of bytes of HTTP headers
  masking   every client-to-server frame is XOR-masked so a cache-poisoning
            payload cannot look like valid HTTP to a confused proxy
```

<a id="38-2-you-are-writing-a-protocol"></a>

### You are now writing a protocol

The moment you choose WebSockets, you inherit the design work HTTP had already done for you. Teams that skip this table rebuild it one incident at a time.

| HTTP gave you | Over a WebSocket you must build |
| --- | --- |
| a method and a path per request | a message envelope: `{"type", "id", "data"}` |
| a response matched to its request | a correlation id on every request-shaped message (section 40) |
| status codes | error messages, and close codes: `1000` normal, `1001` going away, `1008` policy, `1011` server error, `1012` restart, `1013` try again later |
| retries that are safe for `GET` and keyed for `POST` | acks plus idempotency keys on every client-sent action (section 16) |
| auth on every request | auth at the handshake, plus a rule for tokens that expire mid-connection |
| versioning in the URL or a header | a negotiated subprotocol: `Sec-WebSocket-Protocol: chat.v2` |
| TCP flow control you never think about | an application-level check of `bufferedAmount` (section 26) |
| request-level load balancing | connection-level balancing, and a backplane so any node reaches any user |

**Server: auth at the handshake, heartbeat, backplane, backpressure**

```python
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    # Browsers send cookies on cross-site WebSocket handshakes and CORS does
    # not apply, so an unchecked Origin is a cross-site hijack (CSWSH).
    if ws.headers.get("origin") not in ALLOWED_ORIGINS:
        await ws.close(code=1008)                     # policy violation
        return
    user = await authenticate(ws.cookies.get("session"))
    if user is None:
        await ws.close(code=1008)
        return
    await ws.accept(subprotocol="chat.v2")

    # Backplane: the user may be messaged from any node in the fleet.
    sub = bus.subscribe(f"user:{user.id}", max_pending=1000)   # bounded buffer

    async def pump_out():
        async for ev in sub:
            await ws.send_json({"type": ev.type, "seq": ev.seq, "data": ev.data})

    out = asyncio.create_task(pump_out())
    try:
        async for msg in ws.iter_json():
            if msg["type"] == "send":
                # Same rules as any write API: validate, authorise, dedupe.
                await chat.post(user, msg["room"], msg["text"], key=msg["id"])
                await ws.send_json({"type": "ack", "id": msg["id"]})
            elif msg["type"] == "resume":
                for ev in await backlog.since(user.id, msg["after"]):
                    await ws.send_json({"type": ev.type, "seq": ev.seq, "data": ev.data})
    except WebSocketDisconnect:
        pass
    finally:
        out.cancel()
        await sub.close()

# Heartbeats: run uvicorn with --ws-ping-interval 20 --ws-ping-timeout 20,
# so a silently dropped connection is detected in under a minute.
```

```javascript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });
const MAX_BUFFER = 1 << 20;

server.on("upgrade", async (req, socket, head) => {
  // The handshake is the only HTTP moment you get: check Origin and auth here.
  // Browsers send cookies cross-site and CORS does not apply (CSWSH).
  const user = ALLOWED_ORIGINS.has(req.headers.origin) ? await authenticate(req) : null;
  if (!user) {
    socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => onConnection(ws, user));
});

function onConnection(ws, user) {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  // Backplane: the user may be messaged from any node in the fleet.
  const sub = bus.subscribe(`user:${user.id}`, (ev) => {
    // bufferedAmount is bytes queued for a client that is not reading.
    if (ws.bufferedAmount > MAX_BUFFER) return ws.close(1013, "too slow");
    ws.send(JSON.stringify({ type: ev.type, seq: ev.seq, data: ev.data }));
  });

  ws.on("message", async (raw) => {
    const msg = JSON.parse(raw);
    if (msg.type === "send") {
      // Same rules as any write API: validate, authorise, dedupe.
      await chat.post(user, msg.room, msg.text, { key: msg.id });
      ws.send(JSON.stringify({ type: "ack", id: msg.id }));
    } else if (msg.type === "resume") {
      for (const ev of await backlog.since(user.id, msg.after)) {
        ws.send(JSON.stringify({ type: ev.type, seq: ev.seq, data: ev.data }));
      }
    }
  });
  ws.on("close", () => sub.unsubscribe());
}

// Heartbeat: a NAT or LB drops idle sockets silently, so prove liveness.
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }   // missed the last ping
    ws.isAlive = false;
    ws.ping();
  }
}, 30_000);
```

**The client: reconnect with jitter, resume, resend what was never acked**

```javascript
function connect(state) {
  const ws = new WebSocket("wss://chat.example.com/ws", "chat.v2");

  ws.onopen = () => {
    state.attempt = 0;
    ws.send(JSON.stringify({ type: "resume", after: state.lastSeq }));
    // A message sent but never acked may or may not have arrived (section 1).
    // Resend it with the SAME id and let the server deduplicate.
    for (const m of state.unacked.values()) ws.send(JSON.stringify(m));
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "ack") state.unacked.delete(msg.id);
    else if (msg.seq > state.lastSeq) {
      state.lastSeq = msg.seq;
      render(msg);
    }
  };

  ws.onclose = (e) => {
    if (e.code === 1008) return showLogin();             // policy: do not retry
    const cap = Math.min(30_000, 1000 * 2 ** state.attempt++);
    setTimeout(() => connect(state), Math.random() * cap); // full jitter
  };

  state.ws = ws;
}

function sendChat(state, room, text) {
  const msg = { type: "send", id: crypto.randomUUID(), room, text };
  state.unacked.set(msg.id, msg);                       // until the server acks
  if (state.ws.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(msg));
}
```

- **Strength — genuinely bidirectional** — Either side sends whenever it likes, with 2–14 bytes of framing. Chat, collaborative editing, multiplayer state, trading terminals and live cursors are the cases that justify it.
- **Strength — binary and low overhead** — Protobuf or MessagePack frames with no base64 tax and no per-message header block.
- **Weakness — not HTTP any more** — Caches, retries, status codes, per-request auth, request logs and most API gateways stop at the `101`. Your observability now has to understand your message envelope.
- **Weakness — stateful and sticky** — A connection pins a user to one node for hours. Load balancing evens out *connections*, not work, and a deploy or a scale-in is a mass disconnect you have to choreograph.

> **Warning**
>
> **Check `Origin` on the handshake, every time.** A browser attaches cookies to a WebSocket handshake from *any* site, and the same-origin policy and CORS do not apply to it. Without an `Origin` allow-list, a malicious page can open a socket to your API as the logged-in user and read every message — cross-site WebSocket hijacking. Cookie `SameSite=Lax` helps but is not a substitute.

> **Tip**
>
> **You are allowed not to build this.** Socket.IO, SignalR and Phoenix Channels provide envelopes, rooms, acks, reconnect and a long-polling fallback; managed services (API Gateway WebSocket APIs, Azure Web PubSub, Ably, Pusher) also take the connection fleet and the backplane off your hands. WebTransport, built on HTTP/3, is the emerging successor, with multiple streams and unreliable datagrams, but it is not yet a default. Raw WebSockets make sense when you need the protocol to be yours.

<a id="39-webhooks"></a>

## 39. Webhooks

A webhook is pub/sub across a trust boundary: you deliver events by HTTP to endpoints you do not own, cannot debug, and cannot force to be reliable. Everything hard about it follows from that.

> **Interactive animation:** `webhook-retry` — rendered by the page script in the HTML version.

**Signing, and verifying, a webhook correctly**

```python
# --- Sender -------------------------------------------------------------
def sign(secret: str, body: bytes, timestamp: int) -> str:
    # Sign the TIMESTAMP + RAW BODY. Signing only the body lets anyone who
    # captures one delivery replay it forever.
    mac = hmac.new(secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256)
    return f"t={timestamp},v1={mac.hexdigest()}"

# --- Receiver -----------------------------------------------------------
@app.post("/webhooks/acme")
async def receive(request: Request):
    raw = await request.body()            # RAW bytes - re-serialising the
                                          # parsed JSON changes the bytes
                                          # and the signature will not match
    header = request.headers["X-Acme-Signature"]
    ts, sig = parse(header)

    # Reject old deliveries so a captured request cannot be replayed later.
    if abs(time.time() - ts) > 300:
        raise HTTPException(400, "timestamp outside tolerance")

    expected = hmac.new(SECRET.encode(), f"{ts}.".encode() + raw, hashlib.sha256)
    # constant-time compare: == leaks the signature one byte at a time
    if not hmac.compare_digest(expected.hexdigest(), sig):
        raise HTTPException(401, "bad signature")

    # Return 2xx FAST. Do the work asynchronously, or the sender's timeout
    # becomes your retry storm.
    await inbox.enqueue(json.loads(raw))
    return {"received": True}
```

```text
Sending webhooks - the production checklist:

  [ ] never send inline from the request that caused the event; a
      customer's slow endpoint would be inside your own latency
  [ ] sign timestamp + raw body with HMAC-SHA256, per-endpoint secret
  [ ] support TWO active secrets so customers can rotate without downtime
  [ ] include an event id; delivery is at-least-once and they must dedupe
  [ ] include a sequence number or occurredAt; retries mean a refund can
      arrive BEFORE the payment it refunds
  [ ] retry with exponential backoff and jitter over hours or days -
      receivers are down for deploys, not for 200 ms
  [ ] cap the per-attempt timeout hard (5-10 s) and the payload size
  [ ] after the window: disable the endpoint, email a human, offer replay
  [ ] expose a delivery log with request, response and manual re-send
  [ ] "fetch, don't trust" for sensitive data: send an id and let the
      receiver call your authenticated API for the payload
  [ ] SSRF: validate customer URLs - block private ranges, link-local
      169.254.169.254 (cloud metadata!), and re-validate after redirects

Receiving webhooks:
  [ ] verify the signature on the RAW body, in constant time
  [ ] reject stale timestamps
  [ ] deduplicate on the event id
  [ ] return 2xx immediately, process asynchronously
  [ ] tolerate out-of-order arrival; use occurredAt, not receipt order
```

<a id="40-async-request-reply"></a>

## 40. Asynchronous Request-Reply

Some operations take longer than any sane timeout: a video transcode, a monthly statement, a bulk import, a batch of LLM calls. Holding one HTTP request open for five minutes fails at every layer — a load balancer's 60-second idle timeout kills it, the client retries and starts the job twice, and the next deploy kills both. Asynchronous request-reply splits one call into two: **start** the work and get a *handle* back immediately, then **collect** the result later by polling, by push, or by callback. Over a message broker, the same idea is a request on one queue and a reply on another, matched by a **correlation id**.

> **Interactive animation:** `async-request-reply` — rendered by the page script in the HTML version.

<a id="40-1-the-http-shape"></a>

### The HTTP shape: 202, a status resource, and 303

```text
POST /reports                Idempotency-Key: 7f3c...
  <- 202 Accepted            Location: /jobs/7       Retry-After: 5
                             { "jobId": "7", "status": "queued" }

GET /jobs/7
  <- 200 OK                  Retry-After: 10
                             { "status": "running", "progress": 0.4 }

GET /jobs/7
  <- 303 See Other           Location: /reports/7    (the client follows it)
GET /reports/7
  <- 200 OK                  the result itself, cacheable, with its own lifetime

the other endings:
  failed      200 OK  { "status": "failed", "error": {...} }
              - the STATUS request succeeded; the job failed. Never a 500.
  cancelled   DELETE /jobs/7  -> 202, then status "cancelled"
  expired     GET /jobs/7 after the retention window -> 410 Gone
```

Each piece earns its place. `202` says “accepted, not done”. `Location` is the handle. `Retry-After` lets the *server* set the polling rate, so it can slow every client down during an incident. And `303` separates the job (transient, per-request) from the result (a normal resource you can cache, link to and authorise like anything else).

**Starting a job and reporting its status**

```python
@app.post("/reports", status_code=202)
async def start_report(req: ReportRequest, response: Response,
                       idempotency_key: str = Header(...)):
    # Starting a job is a write like any other: a retried POST must return
    # the SAME job, not start a second one. A unique constraint on the key
    # settles two concurrent retries (section 16).
    job = await jobs.get_by_key(idempotency_key)
    if job is None:
        async with db.transaction():
            job = await jobs.create(key=idempotency_key, kind="report",
                                    params=req.model_dump(), status="queued")
            # The job row and its event commit together (section 27).
            await outbox.append("report.requested", {"jobId": job.id})
    response.headers["Location"] = f"/jobs/{job.id}"
    response.headers["Retry-After"] = "5"
    return {"jobId": job.id, "status": job.status}


@app.get("/jobs/{job_id}")
async def job_status(job_id: str, response: Response):
    job = await jobs.get(job_id)
    if job is None:
        raise HTTPException(404)
    if job.expired:
        raise HTTPException(410, "job expired")
    if job.status == "succeeded":
        # 303: the answer lives elsewhere; the client follows with a GET.
        return RedirectResponse(f"/reports/{job.result_id}", status_code=303)
    if job.status in ("queued", "running"):
        response.headers["Retry-After"] = "10"
    # A FAILED job is still a successful status request: 200, error in the
    # body, so clients and retry layers never confuse the two.
    return {"jobId": job.id, "status": job.status,
            "progress": job.progress, "error": job.error}
```

```javascript
app.post("/reports", async (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) return res.status(400).json({ error: "Idempotency-Key required" });

  // Starting a job is a write like any other: a retried POST must return
  // the SAME job. A unique constraint on the key settles concurrent retries.
  let job = await jobs.getByKey(key);
  if (!job) {
    job = await db.transaction(async (tx) => {
      const created = await jobs.create(tx, { key, kind: "report", params: req.body, status: "queued" });
      await outbox.append(tx, "report.requested", { jobId: created.id });   // section 27
      return created;
    });
  }
  res.status(202).location(`/jobs/${job.id}`).set("Retry-After", "5")
    .json({ jobId: job.id, status: job.status });
});

app.get("/jobs/:id", async (req, res) => {
  const job = await jobs.get(req.params.id);
  if (!job) return res.sendStatus(404);
  if (job.expired) return res.status(410).json({ error: "job expired" });
  if (job.status === "succeeded") return res.redirect(303, `/reports/${job.resultId}`);
  if (job.status === "queued" || job.status === "running") res.set("Retry-After", "10");
  // A FAILED job is still a successful status request: 200, error in the body.
  res.json({ jobId: job.id, status: job.status, progress: job.progress, error: job.error });
});
```

**The client side: honour `Retry-After`, bound the total wait**

```javascript
async function runReport(params) {
  const key = crypto.randomUUID();                 // one key per INTENT, reused on retry
  const start = await fetch("/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(params),
  });
  const statusUrl = start.headers.get("Location");
  let wait = Number(start.headers.get("Retry-After") ?? 5);
  const giveUpAt = Date.now() + 15 * 60_000;

  while (Date.now() < giveUpAt) {
    await sleep(wait * 1000);
    const res = await fetch(statusUrl);            // fetch follows the 303 itself
    if (res.redirected) return res.json();         // landed on /reports/7: done
    const job = await res.json();
    if (job.status === "failed") throw new JobFailed(job.error);
    wait = Number(res.headers.get("Retry-After") ?? Math.min(wait * 2, 60));
  }
  // Giving up waiting is not cancelling: the job is still running.
  throw new Error(`still running - check ${statusUrl} later`);
}
```

<a id="40-2-telling-the-client"></a>

### Telling the client it is done: poll, push or callback

| Completion signal | Use when | What it costs |
| --- | --- | --- |
| Poll the status URL (section 36) | the default; works for every client, including scripts and CLIs | wasted requests; latency is the poll interval |
| Push over SSE or a WebSocket (37, 38) | a browser already holds a stream open | the streaming infrastructure, and a push can be missed |
| Callback webhook (section 39) | the client is a server that can receive HTTP | signing, retries, SSRF checks on the callback URL |

> **Tip**
>
> **Keep the status URL even when you push.** Pushes and callbacks are optimisations; the status resource is the source of truth. A client that missed the SSE event or whose webhook endpoint was down for a deploy must be able to ask “so, is it done?” and get the right answer — otherwise every lost notification becomes a support ticket.

<a id="40-3-request-reply-over-a-broker"></a>

### Request-reply over a message broker

Inside a system, the same pattern runs over queues. The requester sends a message carrying two extra properties: **`reply_to`**, the queue the answer should go to, and **`correlation_id`**, a unique id it remembers. The responder does the work, publishes the answer to `reply_to` with the same `correlation_id`, and the requester matches it to the waiting caller. AMQP and JMS have both properties built in; on Kafka you put them in headers and use a reply topic.

**An RPC client over RabbitMQ: correlation ids, a private reply queue, no leaks**

```python
class RpcClient:
    def __init__(self, channel):
        self.channel = channel
        self.pending: dict[str, asyncio.Future] = {}

    async def start(self):
        # One exclusive, auto-deleted reply queue PER INSTANCE, so a reply
        # always reaches the process that holds the waiting future.
        self.reply_queue = await self.channel.declare_queue(exclusive=True, auto_delete=True)
        await self.reply_queue.consume(self.on_reply, no_ack=True)

    async def on_reply(self, msg):
        fut = self.pending.pop(msg.correlation_id, None)
        if fut is None:
            # A late reply for a request we already gave up on. The work may
            # still have happened - which is why requests must be idempotent.
            log.info("late reply discarded", correlation_id=msg.correlation_id)
            return
        fut.set_result(json.loads(msg.body))

    async def call(self, queue: str, payload: dict, timeout: float = 2.0):
        corr_id = str(uuid.uuid4())
        fut = asyncio.get_running_loop().create_future()
        self.pending[corr_id] = fut
        await self.channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps(payload).encode(),
                correlation_id=corr_id,
                reply_to=self.reply_queue.name,
                expiration=timeout,          # a stale request is not worth doing
            ),
            routing_key=queue,
        )
        try:
            return await asyncio.wait_for(fut, timeout)
        finally:
            self.pending.pop(corr_id, None)  # never leak an entry on timeout
```

```javascript
export async function createRpcClient(channel) {
  const pending = new Map();
  // One exclusive reply queue per instance: replies return to the process
  // that holds the waiting promise.
  const { queue: replyTo } = await channel.assertQueue("", { exclusive: true, autoDelete: true });

  await channel.consume(replyTo, (msg) => {
    const id = msg.properties.correlationId;
    const entry = pending.get(id);
    if (!entry) return log.info({ id }, "late reply discarded");   // we timed out
    pending.delete(id);
    clearTimeout(entry.timer);
    entry.resolve(JSON.parse(msg.content.toString()));
  }, { noAck: true });

  return function call(queue, payload, timeoutMs = 2000) {
    const correlationId = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(correlationId);             // never leak an entry
        reject(new Error(`rpc to ${queue} timed out`));
      }, timeoutMs);
      pending.set(correlationId, { resolve, timer });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        correlationId,
        replyTo,
        expiration: String(timeoutMs),            // a stale request is not worth doing
      });
    });
  };
}
```

```text
The responder's half - three rules:

  1. publish the reply to msg.reply_to with msg.correlation_id copied over
  2. ack the REQUEST only after the reply is published; acking first means
     a crash in between loses the reply and the requester waits for nothing
  3. be idempotent on the request id - a requester that timed out will
     retry, and the first attempt may already have done the work
```

- **Strength — load-levelling** — Requests queue up instead of overwhelming the responder, and any number of workers can compete for them (section 20). Spikes become latency rather than errors.
- **Strength — location transparency** — The requester needs a queue name, not an address. Responders can sit behind a firewall, scale to zero, or move between regions.
- **Weakness — still synchronous coupling** — If the caller blocks waiting for the reply, latency still adds and availability still multiplies; the broker is now on the critical path too. Inside one network, gRPC with a deadline is usually simpler.
- **Weakness — the third outcome, again** — A timeout tells you nothing about whether the work happened (section 1). Late replies are normal, so the request must be idempotent and the reply handler must tolerate an unknown correlation id.

> **Key idea**
>
> **Once you return `202`, the job is a public API.** The handle must survive restarts and deploys (so it lives in a database, not in memory), creating it must be idempotent (so a retried `POST` does not start a second job), and it must have an explicit lifetime (so `/jobs/7` returns `410 Gone` next month rather than a confusing `404`). Teams that treat the job id as an implementation detail end up with clients polling handles that silently vanished.

<a id="41-consensus"></a>

## 41. Consensus, Quorums & Leader Election

Sooner or later something must be agreed: who is the leader, which config is current, who holds the lock. You will rarely implement consensus, and you will constantly rely on it — so the properties matter more than the algorithm.

> **Interactive animation:** `raft-election` — rendered by the page script in the HTML version.

<a id="41-1-quorums"></a>

### Quorums

> **Interactive animation:** `quorum` — rendered by the page script in the HTML version.

```text
Why majorities: any two majorities of the same set must OVERLAP.
                So two leaders cannot both be elected in one term, and a read quorum
                must intersect the write quorum that accepted the last write.

                nodes majority tolerates
                3 2 1 failure
                4 3 1 failure <- 4 buys nothing over 3
                5 3 2 failures
                7 4 3 failures <- and every write costs 4 round trips

                Hence odd cluster sizes, and hence 3 or 5 in practice.
```

<a id="41-2-the-lock-that-is-not-a-lock"></a>

### The distributed lock that is not a lock

The most common consensus-adjacent mistake in application code: acquiring a lease and believing it is still held. It cannot be guaranteed — the holder may pause for a GC, lose the network, or be descheduled, and the lease can expire while it still *thinks* it owns the lock.

**Fencing tokens: make the resource reject stale holders**

```python
# WRONG - the classic broken distributed lock.
if await redis.set("lock:invoice", me, nx=True, ex=30):
    await charge_customer()          # a 35 s GC pause here means the lease
    await redis.delete("lock:invoice")  # expired, someone else acquired it,
                                        # and we BOTH charge the customer

# RIGHT - a monotonically increasing fencing token, checked at the resource.
token = await lock_service.acquire("invoice")      # returns 41, then 42, ...

# The RESOURCE enforces the ordering. It does not matter how long we paused
# or what we believe: a write carrying an older token is rejected.
await db.execute(
    """update invoices
          set status = 'charged', fence = $1
        where id = $2 and fence < $1""",
    token, invoice_id,
)
# A stale holder (token 41) arriving after the new holder (42) has written
# matches zero rows. No double charge, no reliance on wall-clock timing.
```

```text
What to use, and what it gives you:

  etcd / ZooKeeper / Consul   leader election, config, service registry.
                              Linearizable, and they hand you fencing
                              tokens (etcd revision, ZK zxid) for free.

  Kafka consumer groups       partition assignment and leadership, done
                              for you. Most teams never need more.

  A database row              "select ... for update" or an advisory
                              lock is a perfectly good lock when all
                              contenders already share that database.

  Redis SETNX                 a LEASE, not a lock. Fine for "probably
                              only one cron runs this" - never for
                              correctness without a fencing token.

The recurring lesson: you cannot guarantee mutual exclusion with
timeouts alone, because you cannot distinguish a crashed holder from
a paused one (section 19). You CAN make the resource reject writes
from anyone but the current holder. Push the check to the resource.
```

<a id="42-time-and-causality"></a>

## 42. Time, Ordering & Causality

“Later” is not a well-defined concept across machines. Clocks drift, NTP steps them backwards, and two events milliseconds apart on different hosts cannot be reliably ordered by timestamp.

- **Wall clock (`now()`)** — Jumps forwards and backwards with NTP corrections and leap-second smearing. Drifts by milliseconds to seconds. Use it for display and for business timestamps — *never* to measure a duration or to order events.
- **Monotonic clock** — Only moves forward, unaffected by NTP. The only correct source for timeouts, latency measurement and backoff. Meaningless across machines.
- **Logical clock (Lamport)** — A counter per node, maxed with every received message and incremented. Gives you a total order consistent with causality — if A caused B, then `L(A) < L(B)`. The converse is not true.
- **Vector clock** — One counter per node, compared element-wise. Detects genuine *concurrency*: if neither vector dominates, the events are concurrent and you have a conflict to resolve rather than an order to obey.

> **Warning**
>
> **“Last write wins” means “whichever server's clock was further ahead”.** Under concurrent writes with a few hundred milliseconds of clock skew, LWW silently discards updates — and nothing logs it. If the data matters, keep a version vector and surface the conflict, or use a CRDT whose merge is defined so that concurrent updates converge without loss.

> **Tip**
>
> Google Spanner's answer is instructive: TrueTime reports an *interval* rather than an instant, and a transaction deliberately waits out the uncertainty before committing. That buys external consistency at the price of a few milliseconds per commit and an atomic clock in every datacentre. Everyone else uses hybrid logical clocks (a wall-clock value with a logical tiebreaker), which give you causality without the hardware.

<a id="43-observability"></a>

## 43. Observability: Correlation, Tracing & RED

In a monolith a stack trace tells you what happened. In a distributed system there is no stack, so you must construct one — and the construction has to be designed in, not added during the incident.

> **Interactive animation:** `trace-propagation` — rendered by the page script in the HTML version.

<a id="43-1-the-three-signals"></a>

### The three signals, and what each answers

| Signal | Answers | Cost model |
| --- | --- | --- |
| Metrics | is something wrong, and since when? | cheap; cardinality is the killer |
| Traces | where did the time go, across services? | expensive; sample intelligently |
| Logs | what exactly happened in this one case? | expensive at volume; structure them |

```text
RED, for every service: USE, for every resource:
                Rate requests/sec Utilisation % busy
                Errors failures/sec Saturation queue depth / wait time
                Duration p50 p95 p99 p99.9 Errors error count

                And for every asynchronous boundary, the three that people forget:
                consumer lag how far behind is each subscription?
                oldest message age are we already violating an expectation?
                DLQ depth alert at > 0, always
```

**Propagate context through HTTP and through the broker**

```python
from opentelemetry import trace, propagate

tracer = trace.get_tracer(__name__)

# HTTP is the easy case - auto-instrumentation handles traceparent.
# The broker is where traces usually break, because nothing injects
# the context into message headers unless you do it explicitly.
async def publish(topic: str, key: str, payload: dict):
    with tracer.start_as_current_span(f"publish {topic}", kind=SpanKind.PRODUCER) as span:
        span.set_attribute("messaging.destination.name", topic)
        headers: dict[str, str] = {}
        propagate.inject(headers)                # writes traceparent
        await broker.send(topic, key=key, value=payload, headers=headers)

async def consume(message):
    # Link, do not nest: a consumer may process a batch from many traces,
    # and the consumer span can outlive the producer's request by hours.
    ctx = propagate.extract(message.headers)
    with tracer.start_as_current_span(
        "process order-events", context=ctx, kind=SpanKind.CONSUMER
    ) as span:
        span.set_attribute("messaging.message.id", message.headers["event-id"])
        # Put the trace id in every log line: one id, five services.
        with log.contextualize(trace_id=format(span.get_span_context().trace_id, "032x")):
            await handle(message)
```

```javascript
import { context, propagation, trace, SpanKind } from "@opentelemetry/api";

const tracer = trace.getTracer("orders");

// HTTP is the easy case. The broker is where traces usually break,
// because nothing injects the context into message headers for you.
async function publish(topic, key, payload) {
  await tracer.startActiveSpan(`publish ${topic}`, { kind: SpanKind.PRODUCER },
    async (span) => {
      const headers = {};
      propagation.inject(context.active(), headers);   // writes traceparent
      await broker.send({ topic, messages: [{ key, value: payload, headers }] });
      span.end();
    });
}

async function consume(message) {
  // Link, do not nest: a consumer may process a batch from many traces.
  const ctx = propagation.extract(context.active(), message.headers);
  await context.with(ctx, async () => {
    await tracer.startActiveSpan("process order-events",
      { kind: SpanKind.CONSUMER }, async (span) => {
        // Put the trace id in every log line: one id, five services.
        await logger.child({ traceId: span.spanContext().traceId })
          .runWith(() => handle(message));
        span.end();
      });
  });
}
```

> **Key idea**
>
> **Tail-based sampling is what makes tracing useful.** Head-based sampling at 1% keeps a random 1% — which is almost never the request you are investigating. Tail-based sampling buffers a whole trace, then keeps it if it was slow or errored. You get every interesting trace and a small sample of the boring ones, which is exactly the right trade.

> **Warning**
>
> **Watch metric cardinality.** A label with unbounded values — user id, order id, raw URL path with ids in it — creates a separate time series per value and will take down your metrics backend long before it takes down your service. Ids belong on *spans and logs*, where they are indexed per event, not on metrics, where they multiply.

<a id="44-testing"></a>

## 44. Testing: Contracts, Chaos & Fault Injection

The interesting behaviours in this course — retries, breakers, redelivery, compensation — only appear under failure. If your tests only exercise the happy path, every one of them is untested code that runs for the first time during an incident.

<a id="44-1-contract-testing"></a>

### Contract testing

End-to-end integration environments are slow, flaky and always slightly out of date. Consumer-driven contract tests give you most of the confidence without any of that: each consumer declares what it needs, and the provider's CI verifies it can still satisfy every declared expectation.

```text
Consumer's test Provider's CI
                "when I GET /orders/A-4471 replays every consumer's
                I need { id, status }" --> expectation against the real
                provider, with no consumer running
                produces a PACT file -> fails the build if a field a
                published to a broker consumer depends on disappeared

                Key property: the provider learns it is about to break someone
                BEFORE deploying, and learns exactly who. No shared environment,
                no 40-minute test suite, no flaky cross-team failures.
```

<a id="44-2-fault-injection"></a>

### Fault injection, from cheapest to bravest

**Test the failure paths deliberately**

```python
# 1. Unit: assert the RESILIENCE behaviour, not just the happy path.
async def test_breaker_opens_and_serves_fallback():
    dependency = FlakyStub(fail_times=25)
    client = Resilient(dependency, breaker=CircuitBreaker(min_calls=20))

    for _ in range(25):
        with contextlib.suppress(Exception):
            await client.get_price("SKU-1")

    assert client.breaker.state == "open"
    # The point of the breaker is the fallback, so assert on that.
    assert await client.get_price("SKU-1", fallback=cached) == cached_price
    # And assert we stopped CALLING - that is what protects the dependency.
    assert dependency.calls == 25

# 2. Integration: prove duplicates are harmless, because they WILL happen.
async def test_handler_is_idempotent():
    event = make_event(id="evt-1", amount=8210)
    await handle(event)
    await handle(event)                       # redelivery
    await handle(event)                       # rebalance
    assert await ledger.total() == 8210       # charged ONCE

# 3. Integration: prove the outbox survives a crash between the two steps.
async def test_outbox_republishes_after_relay_crash():
    await place_order(order)
    broker.fail_next_publish()                # crash after publish, before
    await relay_batch()                       # marking published
    await relay_batch()
    assert broker.published_count(order.id) == 2      # at-least-once, and
    assert consumer_applied_count(order.id) == 1      # deduped downstream
```

```yaml
# 4. Mesh-level fault injection: real failures, in a real environment,
# scoped to traffic carrying one header - so only your test client sees it.
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: pricing-chaos
spec:
  hosts: [pricing.internal]
  http:
    - match:
        - headers:
            x-chaos-experiment: { exact: "pricing-latency" }
      fault:
        delay:
          percentage: { value: 100 }
          fixedDelay: 5s              # does the caller's timeout fire?
        abort:
          percentage: { value: 10 }
          httpStatus: 503             # does the breaker open? fallback serve?
      route:
        - destination: { host: pricing.internal }
    - route:
        - destination: { host: pricing.internal }   # everyone else: normal
```

> **Key idea**
>
> **Chaos engineering is an experiment, not vandalism.** The method is: state a *hypothesis* (“if pricing adds 5 s of latency, checkout stays under 2 s and serves cached prices”), define the smallest possible blast radius, run it in business hours with the team watching, and stop the moment the hypothesis is disproved. The value is not in breaking things; it is in discovering that your stated beliefs about your system are wrong — which they reliably are, and far cheaper to learn at 2 p.m. on a Tuesday.

<a id="45-cheat-sheet"></a>

## 45. Cheat Sheet

<a id="45-1-choosing-a-style"></a>

### Choosing a communication style

| Need | Use | Section |
| --- | --- | --- |
| the caller needs the answer to continue | synchronous RPC | 6, 7 |
| public or browser-facing API | REST + JSON | 6 |
| internal, high volume, polyglot | gRPC + protobuf | 7 |
| many clients wanting different slices | GraphQL behind a BFF | 8, 12 |
| work that can happen later | queue, competing consumers | 20 |
| announce a fact to unknown listeners | topic, pub/sub | 21 |
| replay, or many independent readers | log (Kafka, Kinesis) | 22 |
| rare updates, seconds of delay acceptable | polling with a cursor and `ETag` | 36 |
| server pushing to a browser | SSE (WebSocket if bidirectional) | 35, 37, 38 |
| events to another company's server | signed, retried webhooks | 39 |
| a job that outlasts any timeout | async request-reply: `202` + status URL | 40 |
| events from a database you cannot change | CDC | 28 |

<a id="45-2-reliability-defaults"></a>

### Reliability defaults worth starting from

```text
TIMEOUTS connect 1 s; read = dependency p99.9 x 1.5; total request
                cap; pool-checkout timeout SET. Inner < outer, always.
                Propagate an ABSOLUTE deadline.

                RETRIES one layer only. 2-3 attempts. Full jitter:
                sleep = rand(0, min(cap, base * 2**n)). Retry budget 10%.
                Only retryable errors. Only idempotent operations.

                IDEMPOTENCY client-minted key per INTENT. Unique constraint in the
                same transaction as the effect. Store and replay the
                response. Expire keys after 24 h.

                BREAKERS per dependency. 50% failures over >= 20 calls. 30 s
                cool-down, doubling. 1 half-open probe. ALWAYS a fallback.

                BULKHEADS partition pools per dependency. Bound every queue from a
                LATENCY target. Shed early, shed by priority and by age.

                MESSAGING ack AFTER the work. Assume duplicates. Key by the entity
                whose order matters. DLQ with alarm at depth > 0 and a
                tested redrive. Alert on consumer lag and oldest-age.

                WRITES+EVENTS never save() then publish(). Outbox, or CDC. Consumers
                dedupe on event id in the same transaction as the effect.

                OBSERVABILITY W3C traceparent on every hop INCLUDING messages. Trace id
                in every log line. RED per service, lag per subscription.
                Tail-based sampling. No unbounded metric labels.
```

<a id="45-3-the-numbers"></a>

### Numbers worth knowing

- **Same-DC RPC** `0.5 ms`
- **Cross-region** `70 ms`
- **4G round trip** `180 ms`
- **TLS 1.3 handshake** `1 RTT`
- **Sidecar overhead** `~0.5 ms`

- **4 deps @ 99.9%** `99.6%`
- **Fan-out 100, p99 each** `63% slow`
- **3 layers × 3 retries** `27× load`
- **Hedge cost** `~5%`

<a id="46-pattern-playbook"></a>

## 46. Pattern-Recognition Playbook

In a design review or an interview, the skill is mapping a symptom to a pattern quickly and saying what it costs. This table is that mapping.

| You hear… | Reach for | And say the cost |
| --- | --- | --- |
| “the charge went through twice” | idempotency key (16) | a key table, and clients must mint keys correctly |
| “one slow service took down the page” | timeout + bulkhead + breaker + fallback (14, 17, 18) | a degraded feature instead of a complete one |
| “the database got 27× the traffic” | retry budget, single retry layer (15) | some transient errors now reach users |
| “the order exists but no email was sent” | transactional outbox (27) | a relay to run, a table to prune, ~200 ms of latency |
| “events are processed out of order” | partition key + monotonic guard (24) | parallelism bounded by key diversity; hot-key risk |
| “one bad message blocked the queue” | DLQ + failure classification (25) | a queue someone must actually watch |
| “the consumer fell hours behind” | more partitions, or backpressure upstream (22, 26) | partition count is a one-way door |
| “the service OOMs under load” | bounded queues, load shedding (26, 18) | explicit rejections you must handle |
| “half the order succeeded” | saga with compensations (31) | no isolation — partial states are visible |
| “we need a distributed transaction” | saga, not 2PC (31, 32) | eventual consistency, compensations to design |
| “the search page is slower than any shard” | hedging, partial results (33) | ~5% more load; incomplete answers |
| “the cache expired and everything fell over” | single-flight, jittered TTL, SWR (34) | users may see slightly stale data |
| “reads are slow and writes are contended” | CQRS for that aggregate (30) | read-your-writes lag the UI must handle |
| “we cannot tell where the time goes” | tracing with context propagation (43) | instrumentation everywhere; sampling to tune |
| “two workers ran the same job” | fencing tokens, not just a lock (41) | the resource must enforce the token |
| “the last write won and lost data” | version vectors or a CRDT (42) | conflicts surface into the product |
| “live updates arrive in bursts in production” | disable proxy buffering for the stream (37) | a per-route proxy rule to keep in sync |
| “users miss notifications after reconnecting” | event ids + `Last-Event-ID` / resume cursor (35, 37) | a durable, ordered backlog per user |
| “messages only reach users on the same server” | pub/sub backplane behind the socket fleet (38) | another hop and another system to run |
| “the export times out and users click again” | async request-reply with an idempotency key (40) | a job resource to store, poll traffic, result expiry |

> **Interview**
>
> **The move that lands in interviews** is not naming the pattern — it is naming the pattern *and its bill*, unprompted. “I'd use an outbox here; that costs us a relay process, a table to prune, and about 200 ms of publish latency, and it buys us the guarantee that we never lose an event.” Anyone can list patterns. Engineers who have run them in production talk about the costs.

<a id="47-practice-roadmap"></a>

## 47. Practice Roadmap

Reading about partial failure does not teach you partial failure. Build these five in order — each one is small, and each forces you to meet a specific idea with your own hands.

<a id="47-1-five-builds"></a>

### Five builds

1. **Break it on purpose.** Two services, a synchronous call between them. Add a proxy that injects latency, drops responses and returns 503s. Watch a thread pool empty. *Then* add a timeout, then a retry with jitter, then a breaker with a fallback, measuring after each. You will never again think of these as optional.
2. **Make the duplicate harmless.** Add an idempotency key to a `POST`. Prove it works by hammering the endpoint concurrently with the same key from ten workers and asserting one effect. Try the `SELECT`-then-`INSERT` version first and watch it fail under concurrency — that failure is the lesson.
3. **Build the outbox.** Write an order and an outbox row in one transaction; run a relay with `FOR UPDATE SKIP LOCKED`. Kill the relay between publish and mark-published and confirm the event is republished. Then add consumer-side deduplication and confirm the effect happens once.
4. **Run a saga.** Three services, one of which fails at step three. Persist the state machine so you can kill the orchestrator mid-flow and watch it resume. Write the compensations first; you will discover at least one step you cannot undo, and that discovery is the point.
5. **See the whole request.** Instrument all of the above with OpenTelemetry, propagate `traceparent` through the broker as well as through HTTP, and put the trace id in every log line. Then break something and find it from a single id.

<a id="47-2-drills"></a>

### Weekly drills

- **Audit one client** — Pick an HTTP or database client in your codebase and check all five timeouts from section 14. Most teams find at least one unbounded setting in the first hour.
- **Draw one arrow** — Take any arrow in your architecture diagram and answer the eight questions from the crash course's summary. If you cannot answer “what happens on a duplicate?”, you have found this week's work.
- **Read one DLQ** — Open a dead letter queue nobody has looked at. Whatever is in there is a real bug with a reproduction case attached.
- **Run one experiment** — State a hypothesis about a dependency failing, inject the fault with a tiny blast radius, and see whether you were right. You usually will not be.

<a id="47-3-where-next"></a>

### Where to go next

1. ⚡ The [Distributed Communication Patterns Crash Course](distributed-communication-patterns-crash-course.html) — the weekly-use subset, animated, for revision.
2. 📚 Both guides in the [Distributed Communication Courses catalog](distributed-communication-patterns-courses.html).
3. 📖 [The Amazon Builders' Library](https://aws.amazon.com/builders-library/) — short, measured articles on timeouts, retries, load shedding, health checks and caching from people operating them at planetary scale. Start with “Timeouts, retries, and backoff with jitter”.
4. 🧩 [microservices.io](https://microservices.io/patterns/) — Chris Richardson's catalog: saga, outbox, API composition, CQRS, each with its forces and consequences.
5. 🧠 [Martin Fowler — What do you mean by “event-driven”?](https://martinfowler.com/articles/201701-event-driven.html) — the clearest short treatment of the distinction in section 29.
6. 📕 *Designing Data-Intensive Applications* by Martin Kleppmann — chapters 8 and 9 are the rigorous version of sections 1, 41 and 42, and worth the time.

> *"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."* — Leslie Lamport

---

TechToday Study Library — Distributed Communication Patterns
