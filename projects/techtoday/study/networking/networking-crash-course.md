<!--
Source: networking-crash-course.html
Title: Networking Crash Course | TechToday
Description: A visual crash course in computer networking — encapsulation, ARP and switching, subnets, routing and NAT, TCP, DNS, HTTP, TLS, load balancers and CDNs, each explained with an animation and commands you can run.
Theme-color: #0b0d10
Stylesheets: networking-study.css, ../../site-header.css
Scripts: networking-study.js
-->

Navigation: [TechToday](../../index.html) · [← Networking Courses](networking-courses.html)

<a id="networking-crash-course"></a>

# Computer Networking

A network is a machine you can never see all of at once, which is why it is usually taught as a list of acronyms. This page does the opposite: it takes the dozen ideas you actually meet at work, gives each one a picture you already have in your head, and then shows the machinery underneath. Press **Play** on any animation to watch the idea move, and switch the language tabs to read the code in Python or JavaScript.

> **Key idea**
>
> The whole subject answers one question: **how do you get a message from one machine to another when nobody in the middle knows both ends, links keep failing, and everything is shared with strangers?** Every mechanism below — MAC addresses, IP, routing, TCP, DNS, TLS — is one layer's answer to a slice of that question, and every layer works by *trusting the layer below to be unreliable*.

<a id="table-of-contents"></a>

## Table of Contents

1. [What a Network Actually Is](#0-what-a-network-is)
2. [The Link Layer — MAC, Switches & ARP](#1-the-link-layer)
3. [IP Addresses & Subnets](#2-ip-addresses-and-subnets)
4. [Routing & NAT](#3-routing-and-nat)
5. [Ports, Sockets & the Two Transports](#4-ports-and-transports)
6. [The TCP Connection](#5-the-tcp-connection)
7. [Reliability — Loss & Retransmission](#6-reliability)
8. [Flow Control & Congestion Control](#7-flow-and-congestion-control)
9. [DNS](#8-dns)
10. [HTTP — 1.1, 2 and 3](#9-http)
11. [TLS & HTTPS](#10-tls-and-https)
12. [Proxies, Load Balancers & CDNs](#11-proxies-and-cdns)
13. [Debugging a Network Problem](#12-debugging)
14. [The Whole Thing on One Page](#13-the-whole-thing-on-one-page)

<a id="0-what-a-network-is"></a>

## What a Network Actually Is

Before any protocol, one idea: **a network is not a wire between you and the server**. There is no circuit, no reserved path, nothing that belongs to your conversation. There is only a sequence of independent machines, each of which receives a chunk of bytes, looks at the front of it, and shoves it one step further. Nobody along the way knows the whole route, remembers your previous packet, or promises that the next one will arrive.

Everything else in networking is built to make that brutal arrangement feel like a reliable pipe. And the tool used to build it is **layering**: each layer solves exactly one problem, and hands the rest down.

> **Analogy** 📮
>
> **Picture it — a letter inside an envelope inside a mailbag**
>
> You write a letter (the HTTP request). You put it in an envelope addressed to a person (TCP: which conversation). That envelope goes into a larger one addressed to a building in another city (IP: which machine). That goes into a mailbag addressed to *the next depot down the road* — and the mailbag is thrown away and rewritten at every single depot (Ethernet: this hop only). The letter itself is never opened until it reaches the person named on the innermost envelope.

That is the whole model, and it is worth stating the consequence plainly: **the outermost header is always local and temporary; the innermost is end to end**. A router rewrites the mailbag and leaves everything inside untouched. That single rule explains why you can change from Wi-Fi to fibre mid-download, why a firewall can filter on IP addresses but needs extra work to see HTTP, and why encryption at one layer hides everything above it and nothing below it.

> **Interactive animation:** `encapsulation` — rendered by the page script in the HTML version.

- **Ethernet header** `14 B`
- **IP header** `20 B`
- **TCP header** `20 B`
- **Typical MTU** `1500 B`

<a id="the-four-layers-you-need"></a>

### The four layers you actually need

Textbooks teach seven OSI layers. In practice you need four, and you should be able to name what each one adds that the one below could not do:

- **Link (Ethernet, Wi-Fi)** — Moves a frame between two devices *on the same physical segment*. Addresses are MAC addresses, burnt into the NIC. Has no idea what a network is.
- **Network (IP)** — Moves a packet between any two machines on Earth, hop by hop. Addresses are IP addresses, assigned by location in the topology. Makes no promise of delivery, order, or speed.
- **Transport (TCP, UDP)** — Moves data between two *programs*. Adds port numbers so one machine can hold thousands of conversations — and, in TCP's case, adds the illusion of a reliable ordered stream.
- **Application (HTTP, DNS, TLS)** — Gives the bytes meaning. This is where your code lives, and it is the only layer that knows what a "request" or a "web page" is.

> **Tip**
>
> When something is broken, debug **bottom up**, because a lower layer failing always looks like a higher layer failing. Do I have a link? Do I have an IP and a gateway? Can I ping the gateway? Can I resolve the name? Can I open the port? Does the request return? Five commands in that order find the fault far faster than staring at application logs.

**Interview question**

*Your service can reach a database by IP but not by hostname. Which layer is broken, and why does that immediately tell you where to look?*

Reaching it by IP proves the link, network and transport layers are fine — frames leave, routing works, the port is open. Only the *name to address* step failed, and that is DNS, an application-layer service. So the fault is in the resolver configuration, the DNS server, or the record itself — never in routing or firewalls. Layering turns "the network is broken" into a two-line diagnosis.

**Prove it, layer by layer**

```bash
# link + network: is there a route and does the far end answer?
ip route get 10.0.4.21
ping -c2 10.0.4.21

# transport: is the port actually open?
nc -vz 10.0.4.21 5432

# application: does the name resolve at all?
dig +short db.internal
resolvectl query db.internal
```

```python
import socket

host = "db.internal"

try:
    infos = socket.getaddrinfo(host, 5432, proto=socket.IPPROTO_TCP)
    print("resolved:", {i[4][0] for i in infos})
except socket.gaierror as exc:
    # gaierror is *always* a name-resolution failure, never a routing one
    print("DNS failed:", exc)

# compare with the same test against the literal address
with socket.create_connection(("10.0.4.21", 5432), timeout=2) as s:
    print("tcp to the IP works:", s.getpeername())
```

> **Warning**
>
> **The most useful number in networking is the round trip time.** Bandwidth you can buy; latency is bounded by physics. Light in fibre covers roughly 200 km per millisecond, and real paths are far from straight — so London to New York is about 70 ms round trip and always will be. Any design that needs ten sequential round trips has a floor of 700 ms no matter how fast the servers are.

---

<a id="1-the-link-layer"></a>

## The Link Layer — MAC, Switches & ARP

- **MAC address** `48 bits`
- **Scope** `one segment`
- **Switch lookup** `O(1)`
- **ARP cache life** `~minutes`

Your network card cannot send anything to an IP address. It can only put a frame on the wire addressed to a **MAC address** — 48 bits, assigned by the manufacturer, flat and unstructured. Flat is the important word: a MAC address tells you *who*, never *where*. There is no organisation to it, so no router could ever build a table of the world's MAC addresses.

> **Analogy** 🏢
>
> **Picture it — names versus street addresses**
>
> A MAC address is a person's name: unique, permanent, and completely useless for delivery unless you already know which room they are in. An IP address is a street address: it encodes location, so anybody can narrow it down without knowing the person. Networks need both — the name for the last few metres, the street address for everything else.

The device that connects machines on a segment is a **switch**, and it is remarkable mostly for how little configuration it needs. It learns the entire topology from ordinary traffic, using one rule: *the source address of an arriving frame tells me which port that machine is on*.

> **Interactive animation:** `switching` — rendered by the page script in the HTML version.

- **Strength — zero configuration** — Plug in a switch and it works. It builds its forwarding table from the traffic itself, and ages entries out when machines move.
- **Strength — real parallelism** — Two pairs of machines on different ports can talk simultaneously at full speed. The old shared hub gave everyone one collision domain; a switch gives each port its own.
- **Weakness — broadcasts reach everyone** — ARP, DHCP and discovery protocols are flooded to every port forever. One flat segment with thousands of hosts spends real bandwidth and CPU on noise.
- **Weakness — loops are catastrophic** — Two switches wired in a loop flood a broadcast to each other endlessly. Without spanning tree, one cable turns a working LAN into a dead one in seconds.

<a id="arp-the-missing-link"></a>

### ARP — the missing link between the two address types

So the machine has an IP address to send to, and a NIC that only understands MAC addresses. Something must bridge the two, and that something is **ARP** — a protocol so simple it is almost rude: shout the question at everyone on the segment and wait for the one machine that recognises itself.

> **Interactive animation:** `arp` — rendered by the page script in the HTML version.

> **Key idea**
>
> The decision every host makes before sending *any* packet: **mask the destination with my own subnet mask. Same network → ARP for the destination itself. Different network → ARP for the default gateway.** That is the entire routing logic of an ordinary machine, and it explains why a wrong subnet mask breaks connectivity in one direction only, and why a wrong gateway breaks everything except the local subnet.

**Interview question**

*Two machines on the same switch, same subnet, cannot ping each other. What do you check, in what order?*

Because they are on the same subnet, *no routing is involved at all* — so the gateway, the routing table and the firewall's forwarding rules are all irrelevant. That leaves three possibilities, and the ARP cache distinguishes them immediately. If the ARP entry is `INCOMPLETE`, the ARP request itself is not getting a reply — physical link, VLAN mismatch, or a host-level firewall blocking ARP. If the ARP entry *resolves* but ping still fails, the frames are arriving and ICMP is being dropped by a host firewall. If the two machines disagree about the mask, one thinks the other is remote and sends via the gateway.

**Answer — inspect the layer-2 state**

```bash
ip -brief addr             # my address and mask - do we really agree on the subnet?
ip neigh                   # the ARP cache: REACHABLE, STALE or INCOMPLETE?
ip neigh flush all         # force a fresh ARP round for a clean test

# watch the actual ARP conversation on the wire
sudo tcpdump -ni eth0 arp

# INCOMPLETE  -> nothing replied: link, VLAN, or host firewall
# REACHABLE but ping fails -> frames arrive, ICMP is being filtered
```

```python
import ipaddress

def is_local(src: str, dst: str, prefix: int) -> bool:
    """The exact test every host performs before sending a packet."""
    net = ipaddress.ip_network(f"{src}/{prefix}", strict=False)
    return ipaddress.ip_address(dst) in net

# both hosts agree - frames go directly, ARP for the destination
print(is_local("10.0.0.7", "10.0.0.9", 24))    # True

# one host was configured /25 by mistake: it now thinks .130 is remote
print(is_local("10.0.0.7", "10.0.0.130", 25))  # False -> sent to the gateway
```

> **Warning**
>
> **ARP has no authentication whatsoever.** Any machine on the segment can answer "that IP is me", and everyone will believe it — that is ARP spoofing, and it is why being on the same LAN as an attacker is genuinely dangerous, and why TLS matters even on a network you own.

<a id="2-ip-addresses-and-subnets"></a>

## IP Addresses & Subnets

- **IPv4 address** `32 bits`
- **IPv6 address** `128 bits`
- **/24 usable hosts** `254`
- **Router lookup** `longest prefix`

An IPv4 address is 32 bits, and the dots are decoration. What makes it useful is that it is **hierarchical**: the left-hand bits identify a network, the right-hand bits identify a host inside it, and a router only ever has to care about the left-hand part. That is what lets the entire internet be routed with under a million table entries instead of billions.

> **Analogy** ☎️
>
> **Picture it — a phone number**
>
> `+44 20 7946 0123`. The exchange in Tokyo does not know that subscriber; it knows only that `+44` goes to the UK. London's exchange knows `20` is its own and looks at the rest. Each level strips a prefix it understands and ignores the rest. Subnet masks are the same idea with the boundary made explicit — and made *movable*.

The notation `10.0.4.0/24` means "the first 24 bits are the network". Everything you need — network address, broadcast address, host range, host count — falls straight out of that one number with an AND and an OR.

> **Interactive animation:** `subnetting` (option=26) — rendered by the page script in the HTML version.

> **Key idea**
>
> Two facts carry almost all subnetting questions. **Every extra prefix bit halves the block**: /24 = 254 usable, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2. And **a longer prefix always wins** in a routing table, regardless of row order — which is how a specific override coexists with a catch-all default route.

- **Private ranges — reusable everywhere**`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Never routed on the internet, which is why every office and every VPC can use them at once.
- **Loopback — `127.0.0.0/8`** — Never leaves the machine. Binding a server to `127.0.0.1` instead of `0.0.0.0` is the single most common reason a container is unreachable.
- **Link-local — `169.254.0.0/16`** — Self-assigned when DHCP fails. Seeing it means "nobody answered my DHCP request", not "my network is fine".
- **Overlapping ranges** — Two sites that both chose `10.0.0.0/16` can never be joined by a VPN without NAT. Pick your private ranges as if you will merge companies one day.

<a id="getting-an-address"></a>

### Getting an address in the first place

A machine joining a network has a chicken-and-egg problem: it needs an address to talk, and it must talk to get one. **DHCP** breaks the cycle with broadcast, and while it is at it hands over the mask, gateway and DNS servers — most of what you think of as "network settings" arrives in one message.

> **Interactive animation:** `dhcp` — rendered by the page script in the HTML version.

**Interview question**

*You need to carve `10.20.0.0/16` into subnets for three availability zones, each with a public and a private subnet. What do you allocate, and what goes wrong if you make them too small?*

Six subnets means borrowing three bits (2³ = 8 blocks, two spare for growth), giving six `/19`s of 8,190 hosts each. The reason to be generous is that **a subnet cannot be resized after it has resources in it** — you would have to rebuild. The reason not to use the whole /16 is that you will eventually peer this network with another one, and overlapping ranges cannot be peered at all. Allocate a large block, subnet it sparsely, and leave gaps.

**Answer — subnet arithmetic in code**

```python
import ipaddress

vpc = ipaddress.ip_network("10.20.0.0/16")

# borrow 3 bits -> eight /19 blocks, six used, two held in reserve
blocks = list(vpc.subnets(prefixlen_diff=3))
names = ["public-a", "private-a", "public-b", "private-b", "public-c", "private-c"]

for name, net in zip(names, blocks):
    hosts = net.num_addresses - 2          # network + broadcast are not usable
    print(f"{name:<11} {net}  {net[1]} - {net[-2]}  ({hosts} hosts)")

# the membership test a router performs, in one line
print(ipaddress.ip_address("10.20.36.9") in blocks[1])   # True
```

```javascript
const toInt = (ip) => ip.split(".").reduce((a, o) => (a << 8) + Number(o), 0) >>> 0;
const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

function subnets(cidr, extraBits) {
    const [base, prefix] = cidr.split("/");
    const newPrefix = Number(prefix) + extraBits;
    const size = 2 ** (32 - newPrefix);
    return Array.from({ length: 2 ** extraBits }, (_, i) => {
        const network = (toInt(base) + i * size) >>> 0;
        return {
            cidr: `${toIp(network)}/${newPrefix}`,
            firstHost: toIp(network + 1),
            lastHost: toIp(network + size - 2),
            hosts: size - 2,
        };
    });
}

console.table(subnets("10.20.0.0/16", 3).slice(0, 6));
```

> **Tip**
>
> IPv6 removes the arithmetic entirely: subnets are **always /64**, addresses are plentiful, and NAT is unnecessary. The habits that survive are the same — hierarchy, prefixes and longest-prefix match — which is why learning IPv4 subnetting is still worth an afternoon.

<a id="3-routing-and-nat"></a>

## Routing & NAT

- **Router's memory of you** `none`
- **Decision per packet** `next hop only`
- **TTL start** `64`
- **Internet routing table** `~950k prefixes`

A router does one job, millions of times a second: take a packet, find the longest matching prefix in its table, decrement the TTL, wrap the packet in a fresh link-layer frame for that next hop, and forget it ever existed. **No router knows the full path.** The route is an emergent property of a lot of independent local decisions.

> **Analogy** 🚏
>
> **Picture it — asking directions in a strange city**
>
> You do not ask for the whole route. You ask one person, who points down a road; at the next junction you ask again. Nobody you meet knows your entire journey, and if a road closes the next person simply points somewhere else. You arrive anyway — and two friends making the same trip may take different streets.

> **Interactive animation:** `routing` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Longest prefix match** is the one rule to memorise. Rows are not tried in order and there is no "first match wins" — the most specific prefix always wins. `0.0.0.0/0` matches everything, which is why it is the default route and always the loser in any tie.

<a id="nat-in-practice"></a>

### NAT — why your laptop's address is a lie

Your machine almost certainly has a private address that is meaningless on the internet. A NAT device rewrites the source address and port on the way out, remembers the swap, and reverses it on the way back. It was invented to conserve IPv4 addresses, and it accidentally became the firewall most people rely on.

> **Interactive animation:** `nat` — rendered by the page script in the HTML version.

- **Strength — one address for thousands** — Port translation means a single public IP can serve an entire office. This is the only reason IPv4 survived the 2010s.
- **Strength — closed by default** — An unsolicited inbound packet has no table entry and is dropped. Free protection, at least against untargeted scanning.
- **Weakness — inbound needs plumbing** — Port forwarding, STUN, TURN and hole punching all exist because NAT broke the end-to-end model that peer-to-peer protocols assumed.
- **Weakness — mappings expire silently** — An idle TCP mapping is dropped after minutes to hours. The connection is not closed — it is *forgotten*, so the next packet vanishes and the app hangs until a timeout.

**Interview question**

*A long-lived worker connection to a database "goes stale" every night, and only in the cloud environment. Why, and what fixes it?*

Between the worker and the database sits a NAT gateway (or a load balancer) with an idle timeout — commonly 350 seconds on cloud NAT. Overnight the connection is idle past that, and the mapping is silently deleted. Neither end is told, so both still believe the connection is `ESTABLISHED`. The next query is sent into a void and blocks until the TCP retransmission timer eventually gives up, minutes later. The fix is to send traffic more often than the timeout: **TCP keep-alives set well below the idle timer**, or an application-level ping, or a connection pool that recycles idle connections. Retries alone do not help, because the first query after the gap is always lost.

**Answer — keep the mapping alive**

```python
import socket

s = socket.create_connection(("db.internal", 5432))

# start probing after 60s idle, every 15s, give up after 4 failures
s.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
s.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 60)
s.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 15)
s.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPCNT, 4)

# a probe every 60s is far below a 350s NAT timeout, so the mapping never expires
# - and a genuinely dead peer is now detected in ~2 minutes instead of ~15
```

```bash
# system-wide defaults are far too patient for NATed paths
sysctl net.ipv4.tcp_keepalive_time     # 7200 = two hours!
sysctl -w net.ipv4.tcp_keepalive_time=60
sysctl -w net.ipv4.tcp_keepalive_intvl=15
sysctl -w net.ipv4.tcp_keepalive_probes=4

# is the connection really still there? Send-Q stuck and growing = nobody is listening
ss -tino state established '( dport = :5432 )'
```

---

<a id="4-ports-and-transports"></a>

## Ports, Sockets & the Two Transports

- **Port number** `16 bits`
- **UDP header** `8 B`
- **TCP header** `20 B+`
- **Demux key** `4-tuple`

IP gets a packet to a machine. It does not get it to *a program* — and a machine runs hundreds. The transport layer adds a 16-bit **port number** at each end, and the kernel uses the resulting four values to decide which socket the bytes belong to.

> **Analogy** 🏨
>
> **Picture it — a hotel and its room numbers**
>
> The street address gets the post to the building; the room number gets it to the guest. The front desk can hold a thousand simultaneous conversations without confusion because every letter carries both. And two different guests can write to the same room in another hotel at the same time — the reply finds its way back because the *pair* of rooms is unique.

> **Interactive animation:** `sockets` — rendered by the page script in the HTML version.

> **Key idea**
>
> A connection is identified by the **four-tuple** `(src ip, src port, dst ip, dst port)`. Only one of the four must differ for two connections to be distinct. So a server is *not* limited to 65535 connections on port 443 — but a client connecting repeatedly to **the same** destination is limited by its ephemeral port range, which is where "cannot assign requested address" under load comes from.

On top of ports sit exactly two transports worth knowing. They differ in one decision — *who is responsible for loss* — and everything else follows from it.

> **Interactive animation:** `udp-vs-tcp` (option=udp) — rendered by the page script in the HTML version.

|   | UDP | TCP |
| --- | --- | --- |
| Unit | datagram — boundaries preserved | byte stream — boundaries lost |
| Setup cost | none, first packet is data | one round trip before any data |
| On loss | gone, silently | retransmitted automatically |
| On reorder | delivered out of order | buffered and reordered |
| Congestion | none — you can flood a link | backs off automatically |
| Natural fit | DNS, voice, video, games, QUIC | HTTP, databases, SSH, anything transactional |

> **Warning**
>
> **TCP is a byte stream, not a message stream.** Two `send()` calls may arrive as one `recv()`, and one `send()` may arrive as three. Any protocol over TCP must carry its own framing — a length prefix, a delimiter, or chunked encoding. Assuming "one send, one receive" is the most common bug in hand-rolled network code, and it usually only shows up under load or across the internet, never on localhost.

**Interview question**

*Write a TCP client that reads a length-prefixed message correctly. Why can you not just call `recv(n)` once?*

Because `recv(n)` means "give me *up to* n bytes" — it returns whatever has arrived, which may be 1 byte or 3 of the 4 header bytes. The stream has no memory of your message boundaries, so the reader must loop until it has exactly what it needs. This is the code every protocol library has at its core.

**Answer — frame a byte stream**

```python
import socket, struct

def recv_exactly(sock: socket.socket, n: int) -> bytes:
    """recv() returns 'up to n' bytes - so loop until we truly have n."""
    buf = bytearray()
    while len(buf) < n:
        chunk = sock.recv(n - len(buf))
        if not chunk:                      # empty bytes = peer closed cleanly
            raise ConnectionError(f"closed after {len(buf)} of {n} bytes")
        buf += chunk
    return bytes(buf)

def read_message(sock: socket.socket) -> bytes:
    header = recv_exactly(sock, 4)         # 4-byte big-endian length prefix
    (length,) = struct.unpack("!I", header)
    if length > 10 * 1024 * 1024:          # never trust a length off the wire
        raise ValueError("message too large")
    return recv_exactly(sock, length)

def send_message(sock: socket.socket, payload: bytes) -> None:
    sock.sendall(struct.pack("!I", len(payload)) + payload)   # sendall loops for you
```

```javascript
const net = require("net");

function readMessages(socket, onMessage) {
    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
        // chunks are arbitrary slices of the stream - accumulate, then parse
        buffer = Buffer.concat([buffer, chunk]);

        while (buffer.length >= 4) {
            const length = buffer.readUInt32BE(0);
            if (buffer.length < 4 + length) break;      // message not complete yet
            onMessage(buffer.subarray(4, 4 + length));
            buffer = buffer.subarray(4 + length);        // may hold the next message
        }
    });
}

const socket = net.createConnection({ host: "127.0.0.1", port: 9000 });
readMessages(socket, (msg) => console.log("message:", msg.toString()));
```

<a id="5-the-tcp-connection"></a>

## The TCP Connection

- **Setup** `1 RTT`
- **Teardown** `4 segments`
- **TIME_WAIT** `~60 s`
- **State lives in** `both kernels`

A TCP connection is not a thing in the network. It is **agreed state in two kernels** — two sets of sequence numbers, windows and timers that happen to be consistent. Routers in between know nothing about it. That is why a connection survives a route change, and why it can also be "established" on one side and long gone on the other.

> **Interactive animation:** `tcp-handshake` — rendered by the page script in the HTML version.

> **Analogy** 📞
>
> **Picture it — "can you hear me?"**
>
> Before a serious phone call you both confirm the line works: "hello?" — "yes, I hear you, can you hear me?" — "yes". Three messages, and only now does either of you start talking. TCP does exactly this, and for exactly the same reason: *each side needs proof that the other can both send and receive*.

> **Key idea**
>
> Three states you will actually see in `ss` or `netstat`, and what each one accuses:
>
> - **SYN_SENT** piling up — your SYNs are going nowhere. A firewall dropping (not rejecting) packets, or the wrong address entirely.
> - **CLOSE_WAIT** piling up — *your* application received a FIN and never called `close()`. This is a bug in your code, not the network, and it leaks file descriptors until the process dies.
> - **TIME_WAIT** piling up — you are opening and closing connections at a furious rate. Not an error, but a sign that you should be reusing connections.

- **Why TIME_WAIT exists** — A delayed duplicate from the old connection could otherwise land inside a brand-new one that happens to reuse the same four-tuple. Sixty seconds of silence guarantees it has expired.
- **Why it hurts** — Whoever closes first pays it. A client or proxy that opens a fresh connection per request exhausts its ephemeral ports long before the server is stressed.
- **The real fix — keep-alive** — Reuse the connection. One handshake amortised over a thousand requests removes the handshake latency, the TIME_WAIT, and the slow start.
- **The wrong fix**`SO_REUSEADDR` on the client, or aggressively recycling TIME_WAIT, papers over the problem and can resurrect exactly the bug the state prevents.

**Interview question**

*Under load your service logs "cannot assign requested address" when calling an internal API. Nothing is wrong with the API. What is happening?*

Your process is opening a new TCP connection per request and closing it. Each close leaves a `TIME_WAIT` holding that four-tuple for around a minute. Since the destination IP and port are fixed, the only variable is your source port, and Linux offers roughly 28,000 of them — so at more than about 470 new connections per second you run out. The right fix is **connection pooling / keep-alive**, which turns 470 connections per second into a handful held open. Widening `ip_local_port_range` is a stopgap that buys you a small multiple, not a solution.

**Answer — pool the connections**

```python
import requests

# WRONG: a brand-new connection, handshake and TIME_WAIT per call
def fetch_bad(url):
    return requests.get(url, timeout=2).json()

# RIGHT: one Session reuses connections through a pool
session = requests.Session()
adapter = requests.adapters.HTTPAdapter(
    pool_connections=20,      # distinct hosts to keep pools for
    pool_maxsize=100,         # sockets kept alive per host
    max_retries=0,            # retries belong at the application layer
)
session.mount("http://", adapter)
session.mount("https://", adapter)

def fetch_good(url):
    return session.get(url, timeout=2).json()
```

```bash
# count sockets by state - TIME_WAIT dominating confirms the diagnosis
ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn

# how many ephemeral ports do we actually have?
sysctl net.ipv4.ip_local_port_range        # 32768 60999 -> ~28k

# a stopgap, not a fix: widen the range while you deploy pooling
sysctl -w net.ipv4.ip_local_port_range="10240 65535"
```

<a id="6-reliability"></a>

## Reliability — Loss & Retransmission

- **Sequence numbers count** `bytes`
- **Fast retransmit** `~1 RTT`
- **Timeout retransmit** `200 ms+`
- **Dup ACKs to trigger** `3`

IP loses packets — routinely, by design, whenever a queue is full. TCP's reliability is built from three cheap ingredients: **number every byte, acknowledge what you have, and resend what was never acknowledged**. Everything else is a refinement of how quickly loss is noticed.

> **Analogy** 📄
>
> **Picture it — numbered pages by fax**
>
> You fax a 200-page document. The other side calls back: "I have everything up to page 47." That is a cumulative ACK — one short message covering all of it. If they keep repeating "still up to 47" while pages 48 onward keep arriving, you know precisely which page to resend, and you know it without waiting for any clock.

> **Interactive animation:** `tcp-retransmission` (option=fast) — rendered by the page script in the HTML version.

> **Key idea**
>
> The two recovery paths have wildly different costs, and knowing which one you are hitting is most of TCP debugging. **Fast retransmit** is triggered by three duplicate ACKs and costs about one round trip. **An RTO timeout** costs at least 200 ms — often a full second after backoff — and resets the congestion window to one segment. A p50 of 5 ms with a p99 of almost exactly 200 ms or 1 s is a retransmission timeout, not slow code.

- **Cumulative ACK**"I have everything below X." One lost ACK is harmless because the next one covers it — elegant and self-healing.
- **...but it hides the details** — A cumulative ACK cannot say "I have 5 and 7 but not 6", so a naive sender would resend everything after the gap.
- **SACK fixes that** — Selective acknowledgement lists the blocks actually received, so only the true gap is retransmitted. On by default everywhere; worth confirming it survived your middleboxes.
- **Loss ≠ congestion** — TCP assumes every loss means the network is full. On a wireless link, loss is often just interference — and backing off makes throughput worse for no reason.

> **Tip**
>
> Retransmissions are measurable, not mysterious. `ss -ti` prints `retrans:` counters, RTT and its variance per connection; `nstat -az TcpRetransSegs` gives the machine-wide count. A retransmission rate above roughly **0.5%** on a wired path means something in the middle is dropping, and no amount of application tuning will help.

<a id="7-flow-and-congestion-control"></a>

## Flow Control & Congestion Control

- **Receiver's limit** `rwnd`
- **Network's limit** `cwnd`
- **In flight** `min of the two`
- **Throughput** `window / RTT`

Two completely different things can force a sender to slow down, and confusing them wastes days. **Flow control** protects the *receiver* from being overrun. **Congestion control** protects the *network* from being overrun. They use separate windows, and a sender may keep in flight only the smaller of the two.

> **Analogy** 🚰
>
> **Picture it — filling a bath through a hose**
>
> Flow control is the bath telling you it is nearly full, so stop pouring. Congestion control is the hose itself: push harder than it can carry and the excess just backs up. Both limit your rate, but the remedy is completely different — a bigger bath solves one, and nothing but patience solves the other.

> **Interactive animation:** `tcp-window` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Throughput = window ÷ RTT.** On a 100 ms path a 64 KB window gives about 5 Mbit/s no matter how much bandwidth you paid for. This is the bandwidth-delay product, and it is why a transatlantic copy that stubbornly refuses to go faster is nearly always a *window* problem, not a *bandwidth* problem. Window scaling and larger socket buffers are the lever.

The second window is more interesting, because nothing tells the sender how fast the network can go. It has to **discover** the limit by probing until something breaks, then back off — forever.

> **Interactive animation:** `congestion-control` (option=reno) — rendered by the page script in the HTML version.

**Interview question**

*Two data centres are connected by a 1 Gbit/s link with 80 ms RTT. A single `scp` transfer only reaches 6 Mbit/s. The link is not busy. Why?*

Compute the bandwidth-delay product: 1 Gbit/s × 0.08 s = 10 MB. To keep that pipe full a sender must have **10 MB in flight**. A default 64 KB window gives 64 KB ÷ 0.08 s ≈ 6.5 Mbit/s — which matches the observed number exactly. Nothing is broken; the window is the bottleneck. Fix it by enabling window scaling and raising the socket buffer limits, or sidestep it with parallel streams. Note also that a *single* lost packet on such a path is brutal: recovering a large window one segment per 80 ms RTT takes minutes.

**Answer — size the window to the pipe**

```python
bandwidth_bps = 1_000_000_000        # 1 Gbit/s
rtt_seconds = 0.080                  # 80 ms

bdp_bytes = bandwidth_bps / 8 * rtt_seconds
print(f"bandwidth-delay product: {bdp_bytes / 1e6:.1f} MB in flight to fill the pipe")

for window_kb in (64, 1024, 16384):
    throughput = (window_kb * 1024 * 8) / rtt_seconds
    print(f"{window_kb:>6} KB window -> {throughput / 1e6:6.1f} Mbit/s")

# 64 KB    ->    6.5 Mbit/s   <- exactly what was measured
# 1 MB     ->  104.9 Mbit/s
# 16 MB    -> 1677.7 Mbit/s   <- window is no longer the limit
```

```bash
# is window scaling even on? (it must be, for windows above 64 KB)
sysctl net.ipv4.tcp_window_scaling

# raise the auto-tuning ceiling: min, default, max bytes
sysctl -w net.ipv4.tcp_rmem="4096 131072 16777216"
sysctl -w net.ipv4.tcp_wmem="4096 131072 16777216"

# watch it work: cwnd, rtt and the negotiated send window, live
ss -ti dst 10.20.0.9 | grep -E 'cwnd|rtt|send'
```

> **Warning**
>
> **Bufferbloat.** A loss-based sender only stops when a packet is dropped — so if a router has a huge buffer, the sender happily fills it and every flow sharing that link inherits hundreds of milliseconds of pure queueing delay. Symptom: a large download makes video calls unusable while showing zero packet loss. The fix lives in the router (fair queueing, CoDel), not in your application.

---

<a id="8-dns"></a>

## DNS

- **Transport** `UDP 53`
- **Cold lookup** `4 queries`
- **Warm lookup** `< 1 ms`
- **Change latency** `= TTL`

Nothing on the internet routes on names, so every connection begins with a translation you did not write and cannot see. DNS is a **distributed, cached, delegated database** — and the three adjectives are the whole design.

> **Analogy** 📚
>
> **Picture it — a librarian who only knows other librarians**
>
> You ask for a book. The librarian does not have it, but knows which building holds that category; that building's librarian knows which floor; that floor's librarian actually has it. Nobody holds the full catalogue, everybody holds one level of referral, and the answer is remembered on the way back so the next person is served instantly.

> **Interactive animation:** `dns-resolution` — rendered by the page script in the HTML version.

> **Key idea**
>
> **TTL is a promise you cannot withdraw.** Once an answer leaves the authoritative server, it lives in caches you do not control for the full TTL — resolvers, operating systems, browsers, and JVMs that famously cache forever. So the migration procedure is always: lower the TTL to 60 s *at least a full TTL before* the change, make the change, verify, then raise it again.

- **A / AAAA** — Name → IPv4 / IPv6 address. The ordinary case.
- **CNAME** — Name → another name. Cannot coexist with other records at the same name, which is why the bare apex of a domain needs an ALIAS/ANAME instead.
- **MX / TXT** — Mail routing and verification (SPF, DKIM, domain ownership). Deleting a "useless" TXT record is a classic way to break email for a week.
- **DNS is not a load balancer** — Round-robin A records give you crude spreading with no health checks and client-side caching you cannot flush. Use it for coarse geography, not for failover.

**Interview question**

*You point a domain at a new server. Some users reach it immediately, others get the old one for hours. Nothing is wrong with either server. Explain.*

Caching, at several independent levels. Each resolver holds the old record until *its* copy's TTL expires, and its countdown started whenever *it* asked — so different users expire at different moments. Some clients are worse: an old JVM caches successful lookups forever by default, and browsers keep their own cache. This is why "DNS propagation" is a misleading phrase; nothing propagates, records simply expire at different times. The fix is planning, not force: lower the TTL in advance and **keep the old server running until the longest TTL has passed**.

**Answer — see exactly what each layer believes**

```bash
# what does the authoritative server say? (bypasses every cache)
dig @ns1.example.com www.example.com +norecurse

# what does a public resolver still have cached, and for how long?
dig @1.1.1.1 www.example.com          # look at the TTL - it counts DOWN

# replay the full delegation walk: root -> .com -> authoritative
dig +trace www.example.com

# and what does THIS machine believe, cache included?
resolvectl query www.example.com
```

```python
import socket, time

# getaddrinfo goes through the OS resolver and its cache - not the network,
# which is why this can keep returning a stale answer long after dig is correct
for _ in range(3):
    infos = socket.getaddrinfo("www.example.com", 443, proto=socket.IPPROTO_TCP)
    print(sorted({info[4][0] for info in infos}))
    time.sleep(1)

# in the JVM the equivalent trap is networkaddress.cache.ttl, which historically
# defaulted to "cache forever" - always set it explicitly in long-lived services
```

<a id="9-http"></a>

## HTTP — 1.1, 2 and 3

- **HTTP/1.1** `1 request at a time`
- **HTTP/2** `multiplexed on TCP`
- **HTTP/3** `multiplexed on QUIC`
- **Browser conns per host** `6`

HTTP itself is simple: a request line, headers, a blank line, a body. What changed across three versions is not the semantics — a `GET` is still a `GET` — but **how many conversations can share one connection, and what blocks what**.

> **Interactive animation:** `http-versions` (option=h1) — rendered by the page script in the HTML version.

> **Key idea**
>
> Follow head-of-line blocking as it moves down the stack, because that is the entire story. **HTTP/1.1** blocks at the HTTP layer — one request per connection, so browsers open six. **HTTP/2** fixes that with binary framing and streams, but all streams share one TCP connection, so a single lost packet stalls every stream — blocking moved into TCP. **HTTP/3** replaces TCP with QUIC, which tracks loss per stream, so it is finally gone.

- **Keep-alive is free money** — Reusing a connection removes a TCP handshake, a TLS handshake and a slow start per request. It is almost always the largest single client-side win.
- **HTTP/1.1 workarounds hurt on HTTP/2** — Domain sharding and giant bundles were invented to beat the six-connection limit. On HTTP/2 they split the connection, break priorities and defeat caching.
- **Status codes are a contract**`4xx` means do not retry, the request is wrong. `5xx` and `429` mean retry with backoff and jitter. Retrying a `400` forever is how you build an outage.
- **Idempotency decides retry safety**`GET`, `PUT` and `DELETE` can be retried; `POST` cannot, unless you send an idempotency key. Networks retry — plan for duplicates.

> **Tip**
>
> The header that solves the most real problems is `Cache-Control`. `no-store` for anything private, `public, max-age=31536000, immutable` for hashed static assets, and `stale-while-revalidate` to serve instantly while refreshing in the background. Get those three right and you have removed most of your traffic before writing any code.

<a id="10-tls-and-https"></a>

## TLS & HTTPS

- **TLS 1.3 handshake** `1 RTT`
- **Resumed** `0 RTT`
- **TLS 1.2 handshake** `2 RTT`
- **Gives you** `privacy + integrity + identity`

TLS provides three things, and people remember only the first. **Confidentiality**: nobody can read the traffic. **Integrity**: nobody can modify it undetected. **Identity**: you are talking to who you think. Without the third the first two are worthless — a perfectly encrypted channel to an attacker is still an attacker.

> **Analogy** 🛂
>
> **Picture it — a passport check before a private room**
>
> Anyone can offer you a soundproof room. The point of the passport check is to establish that the person leading you into it is the bank manager and not a stranger who bought the same door. The certificate is the passport; the certificate authority is the issuing government; your browser's trust store is the list of governments you accept.

> **Interactive animation:** `tls-handshake` — rendered by the page script in the HTML version.

> **Warning**
>
> **Disabling certificate verification is not "fixing a TLS error".** `verify=False`, `-k`, `rejectUnauthorized: false` — each of these turns an authenticated channel into an encrypted one with a stranger. The real causes are almost always mundane: an expired certificate, a missing intermediate in the chain, a hostname that does not match the SAN list, or a clock that is wrong.

**Interview question**

*A certificate works in your browser but your service rejects it with "unable to get local issuer certificate". Both machines trust the same CA. What is different?*

The server is not sending the full chain. Browsers hide this: when an intermediate is missing they quietly fetch it using the AIA extension, so the page loads. Most libraries do not — they check the chain exactly as presented and fail. So the certificate is fine and the trust store is fine; the **server's bundle is incomplete**. Fix it on the server by concatenating the leaf and every intermediate (never the root) into the chain file, and verify with a client that does not do you any favours.

**Answer — inspect the chain as presented**

```bash
# what does the server actually send? Look for the full chain, not just the leaf
openssl s_client -connect example.com:443 -servername example.com -showcerts </dev/null

# the verdict line, and the expiry dates
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# curl fails the same way a library would - a better test than a browser
curl -sSv https://example.com >/dev/null
```

```python
import ssl, socket

ctx = ssl.create_default_context()          # verifies hostname AND chain - keep it that way

with socket.create_connection(("example.com", 443), timeout=3) as raw:
    with ctx.wrap_socket(raw, server_hostname="example.com") as tls:
        cert = tls.getpeercert()
        print("protocol :", tls.version())              # TLSv1.3
        print("cipher   :", tls.cipher()[0])
        print("expires  :", cert["notAfter"])
        print("names    :", [v for k, v in cert["subjectAltName"] if k == "DNS"])

# ssl.SSLCertVerificationError with 'unable to get local issuer certificate'
# means the SERVER omitted an intermediate - not that you should disable verification
```

<a id="11-proxies-and-cdns"></a>

## Proxies, Load Balancers & CDNs

- **L4 balancer** `sees the 4-tuple`
- **L7 balancer** `sees the request`
- **CDN edge RTT** `2–20 ms`
- **Origin RTT** `50–250 ms`

Almost nothing in production talks directly to the process that answers it. In between sit proxies — and there are only two interesting kinds. A **layer 4** balancer forwards packets by four-tuple: fast, protocol-agnostic, blind to content. A **layer 7** balancer terminates the connection, reads the request, and can route by path, header or cookie — and therefore must also terminate TLS.

> **Interactive animation:** `load-balancing` (option=rr) — rendered by the page script in the HTML version.

> **Key idea**
>
> Choose the algorithm by **how variable your request cost is**. Uniform requests → round robin, and its simplicity is a feature. Wildly variable requests → least connections, so slow backends stop attracting work. Cache locality or sticky sessions → consistent hashing, accepting that it makes deploys and drains harder. And whichever you pick, **health checks are what actually keep you up**.

The other machine in the middle is a cache close to the user. Its main product is not bandwidth — it is **the elimination of distance**, and with it the round trips that dominate page load.

> **Interactive animation:** `cdn` — rendered by the page script in the HTML version.

- **Latency collapses** — TCP and TLS handshakes now complete against a server milliseconds away, so even uncacheable, personalised responses get faster.
- **Origin load collapses** — A 95% hit ratio means 20× fewer requests reach your servers — the cheapest capacity you will ever buy.
- **Invalidation is the hard part** — A purge must reach every edge. Hash your filenames (`app.9f2a1c.js`) so a deploy is a new URL and nothing ever needs purging.
- **You lose the client's IP** — Everything behind a proxy sees the proxy's address unless `X-Forwarded-For` is set and — importantly — *trusted only from your own proxies*. Blindly trusting that header is a real vulnerability.

> **Warning**
>
> **A padlock in the browser says nothing about your internal network.** If TLS terminates at the load balancer, the traffic behind it is plaintext unless you re-encrypt. Decide that deliberately — and if the answer is "the internal network is trusted", make sure you can defend why.

---

<a id="12-debugging"></a>

## Debugging a Network Problem

- **Method** `bottom up`
- **Refused** `RST — nothing listening`
- **Timed out** `dropped — firewall`
- **Works small, hangs big** `MTU`

Almost every network problem is diagnosed by the same ladder, climbed from the bottom. The value of doing it in order is that **a failure at any layer looks identical from the application** — "it's slow", "it hangs", "connection error" — and only the ladder distinguishes them.

> **Interactive animation:** `traceroute` — rendered by the page script in the HTML version.

> **Key idea**
>
> Two failure messages that are almost never read carefully enough. **Connection refused** means a machine answered with a TCP RST — you reached it, and nothing is listening on that port. **Connection timed out** means *silence* — a firewall dropped the packet, or you are talking to the wrong address entirely. The first is an application problem; the second is a network problem. They are never confused once you know the difference.

The other classic is a connection that establishes happily and then hangs the moment something large is transferred. That shape — small requests fine, big responses dead — has one usual cause.

> **Interactive animation:** `ip-fragmentation` — rendered by the page script in the HTML version.

**Interview question**

*"The API is slow." Give the sequence of commands that narrows this to a layer in under two minutes.*

Work upward, and let each answer eliminate a whole class of causes. Name resolution first, because a slow DNS lookup is invisible in application logs. Then reachability and RTT, to separate network latency from server time. Then the port itself, to distinguish refused from filtered. Then a full HTTP timing breakdown, which splits DNS, connect, TLS and server processing into separate numbers — and at that point the answer is usually obvious. Only then look at retransmissions.

**Answer — the two-minute ladder**

```bash
# 1. name -> address, and how long that itself took
dig +stats api.example.com | grep -E 'Query time|ANSWER'

# 2. is the host reachable, and what is the real RTT?
ping -c5 api.example.com

# 3. is the port open? refused (RST) and filtered (silence) are different bugs
nc -vz api.example.com 443

# 4. split the request into phases - this usually ends the investigation
curl -sS -o /dev/null -w \
 'dns %{time_namelookup}s  connect %{time_connect}s  tls %{time_appconnect}s
server %{time_starttransfer}s  total %{time_total}s\n' \
 https://api.example.com/health

# 5. is the path itself lossy? sustained loss to the FINAL hop is what counts
mtr -rwc 50 api.example.com

# 6. are we retransmitting? >0.5% on a wired path means the network is dropping
ss -ti state established '( dport = :443 )' | grep -o 'retrans:[0-9/]*'
```

```python
import socket, ssl, time

host, port = "api.example.com", 443
t0 = time.perf_counter()

addr = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)[0][4]
t_dns = time.perf_counter()

sock = socket.create_connection(addr, timeout=5)
t_tcp = time.perf_counter()

tls = ssl.create_default_context().wrap_socket(sock, server_hostname=host)
t_tls = time.perf_counter()

tls.sendall(b"GET /health HTTP/1.1\r\nHost: " + host.encode() + b"\r\nConnection: close\r\n\r\n")
tls.recv(1)                              # block until the FIRST byte comes back
t_first = time.perf_counter()

print(f"dns    {t_dns  - t0:.3f}s")      # slow here -> resolver, not your service
print(f"tcp    {t_tcp  - t_dns:.3f}s")   # slow here -> distance, or a full accept queue
print(f"tls    {t_tls  - t_tcp:.3f}s")   # slow here -> handshake, cert chain, CPU
print(f"server {t_first - t_tls:.3f}s")  # slow here -> and only here is it your code
```

> **Tip**
>
> Learn to read `tcpdump` even a little — it is the only tool that shows what actually happened rather than what a library reported. `sudo tcpdump -ni any port 443 and host 10.0.4.21` answers "did my packet even leave?", which is the question that ends most arguments between two teams.

<a id="13-the-whole-thing-on-one-page"></a>

## The Whole Thing on One Page

Every idea in this course appears, in order, in the most ordinary act on the internet: typing a URL and pressing Enter. Watch the time accumulate, and notice how little of it belongs to the server.

> **Interactive animation:** `packet-journey` — rendered by the page script in the HTML version.

> **Key idea**
>
> **Latency is composed of round trips, and round trips are bounded by physics.** Every serious web performance technique — keep-alive, connection pooling, HTTP/2 multiplexing, TLS 1.3 and resumption, CDNs, HTTP/3 — attacks the *number of round trips*, not the amount of compute. Once you see that, the whole field stops looking like a pile of acronyms.

| Symptom | Most likely layer | First thing to check |
| --- | --- | --- |
| Connection refused, instantly | Transport | Is anything in `LISTEN`? Bound to `127.0.0.1` instead of `0.0.0.0`? |
| Connection times out | Network / firewall | Security group, route table, NACL — packets are being dropped, not rejected |
| Works by IP, not by name | Application (DNS) | `dig` against the authoritative server, then the resolver |
| Handshake fine, large transfers hang | Network (MTU) | Tunnel or VPN in the path; ICMP being blocked |
| p99 spikes to exactly ~200 ms or ~1 s | Transport | TCP retransmission timeout — check `retrans` counters |
| Throughput capped far below the link | Transport | Bandwidth-delay product — window size, not bandwidth |
| Idle connections die overnight | Network (NAT / LB) | Idle timeout; enable keep-alives below it |
| Certificate error in code, fine in browser | Application (TLS) | Missing intermediate in the server's chain |
| "Cannot assign requested address" under load | Transport | Ephemeral port exhaustion — pool your connections |
| One user slow, everyone else fine | Link / last mile | `mtr` from that user; bufferbloat on their uplink |

<a id="where-to-go-next"></a>

### Where to go next

1. [The Networking Detailed Course](networking-detailed-course.html) — the same ground from first principles, plus IPv6, OSPF and BGP, TCP internals, QUIC, cloud networking, security and a full performance playbook.
2. [All Networking Courses](networking-courses.html) — the catalog page for this topic.
3. [The OS Crash Course](../os/os-crash-course.html) — sockets, interrupts and the kernel side of everything above.
4. *Beej's Guide to Network Programming* — still the clearest free introduction to sockets ever written.
5. *High Performance Browser Networking* by Ilya Grigorik — free online, and the best single explanation of why latency beats bandwidth.
6. Install Wireshark and capture your own machine loading a page. Twenty minutes of watching real packets teaches more than any diagram, including these.

> **Interview**
>
> **If you remember five things:** layering means the outermost header is local and the innermost is end to end; longest prefix match decides every route; a connection is state in two kernels, identified by a four-tuple; throughput is window ÷ RTT while latency is round trips × distance; and when it breaks, debug bottom up — refused and timed out are different bugs.

---

TechToday Study Library — Computer Networking
