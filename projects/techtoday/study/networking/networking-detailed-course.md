<!--
Source: networking-detailed-course.html
Title: Networking Detailed Course | TechToday
Description: A 38-section course in computer networking from first principles — Ethernet, ARP, IPv4 and IPv6, subnetting, routing, OSPF and BGP, NAT, DHCP, UDP and TCP internals, DNS, HTTP/1.1 through HTTP/3, TLS, load balancing, CDNs, cloud networking, security and performance debugging.
Theme-color: #0b0d10
Stylesheets: networking-study.css, ../../site-header.css
Scripts: networking-study.js
-->

Navigation: [TechToday](../../index.html) · [← Networking Courses](networking-courses.html)

<a id="networking-detailed-course"></a>

# Computer Networking

Thirty-eight sections, each depending only on the ones before it, from "why does a signal on a wire need a protocol at all" to "why is the p99 of this API exactly one second". Every mechanism is introduced by the problem it solves, and every trade-off is stated out loud. Press **Play** on the animations, and switch the language tabs to read the code in Python, JavaScript or the shell.

<a id="table-of-contents"></a>

## Table of Contents

1. [Why Layers Exist](#1-why-layers-exist)
2. [The OSI and TCP/IP Models](#2-osi-and-tcp-ip)
3. [Encapsulation and the Life of a Frame](#3-encapsulation)
4. [Latency, Bandwidth and the Bandwidth-Delay Product](#4-latency-and-bandwidth)
5. [The Link Layer and Ethernet](#5-the-link-layer)
6. [Switching, VLANs and Spanning Tree](#6-switching-and-vlans)
7. [ARP and Neighbour Discovery](#7-arp)
8. [IPv4 Addressing](#8-ipv4-addressing)
9. [Subnetting and CIDR Arithmetic](#9-subnetting)
10. [IPv6](#10-ipv6)
11. [The IP Header, MTU and Fragmentation](#11-the-ip-header)
12. [ICMP, ping and traceroute](#12-icmp)
13. [Routing Fundamentals](#13-routing)
14. [Interior Routing — RIP and OSPF](#14-interior-routing)
15. [BGP and the Shape of the Internet](#15-bgp)
16. [NAT and Private Addressing](#16-nat)
17. [DHCP and Autoconfiguration](#17-dhcp)
18. [Ports, Sockets and the Socket API](#18-sockets)
19. [UDP](#19-udp)
20. [TCP Connection Management](#20-tcp-connections)
21. [TCP Reliability](#21-tcp-reliability)
22. [TCP Flow Control](#22-tcp-flow-control)
23. [TCP Congestion Control](#23-tcp-congestion-control)
24. [TCP Performance Tuning](#24-tcp-tuning)
25. [DNS in Depth](#25-dns)
26. [HTTP/1.1](#26-http11)
27. [HTTP/2](#27-http2)
28. [HTTP/3 and QUIC](#28-http3)
29. [TLS and the PKI](#29-tls)
30. [Writing Network Code](#30-network-code)
31. [Proxies and Load Balancing](#31-proxies)
32. [CDNs and Anycast](#32-cdns)
33. [Cloud Networking](#33-cloud-networking)
34. [Network Security](#34-security)
35. [Performance Debugging Playbook](#35-performance-debugging)
36. [Cheat Sheet](#36-cheat-sheet)
37. [Pattern-Recognition Playbook](#37-pattern-playbook)
38. [Practice Roadmap](#38-practice-roadmap)

<a id="1-why-layers-exist"></a>

## 1. Why Layers Exist

> **Key idea**
>
> New to the subject? Start with the [Networking Crash Course](networking-crash-course.html) — the same ideas in fourteen animated sections, sized for an afternoon. This course assumes you want the reasoning, the edge cases and the numbers.

Begin with the raw problem, stripped of all vocabulary. You have two computers and something that can carry a signal between them — copper, fibre, radio. You want a program on one to send a message to a program on the other. Between you and that goal sit five independent difficulties, and it is worth stating them separately because each one is eventually solved by a different layer:

1. **Signalling.** A voltage on a wire is not a bit. Both ends must agree on how a 1 is encoded, how fast bits arrive, and where one frame ends and the next begins.
2. **Sharing.** More than two devices want the same medium. Something must decide who transmits and how a receiver knows a message was meant for it.
3. **Reaching strangers.** The destination is not on your wire. Some system must forward messages through machines that have no interest in your conversation.
4. **Reliability.** Signals get corrupted, queues overflow, links fail mid-transfer. Someone must notice and repair it — or explicitly decide not to.
5. **Meaning.** Even a perfectly delivered pile of bytes is useless unless both programs agree what they represent.

You could solve all five at once, in one enormous protocol. People tried. The reason nobody does it any more is not elegance — it is **independent evolution**. Ethernet has been replaced by Wi-Fi and fibre; IPv4 is being replaced by IPv6; HTTP has been through four major versions. Each of those changes happened without rewriting the others, because the interface between layers stayed fixed while the implementations churned.

> **Analogy** 🚢
>
> **Picture it — the shipping container**
>
> A container's dimensions and lifting points are standardised; what is inside is nobody's business. That one interface let ships, cranes, trucks and trains all be redesigned independently over sixty years. The container is the layer boundary, and it is worth remembering that the standard is *deliberately unambitious*: it says nothing about cargo, insurance, or routes.

<a id="1-1-what-a-layer-boundary-guarantees"></a>

### 1.1 What a layer boundary actually guarantees

The rule that makes layering work is narrower than people assume: **layer N on one machine communicates only with layer N on the other machine, using services provided by layer N−1**. It does not know how N−1 works, and it must not care.

The consequence is the one worth internalising: **each layer assumes the layer below is unreliable and adds only what it needs**. Ethernet detects corruption but does not repair it. IP forwards packets but does not promise they arrive. TCP repairs loss but knows nothing about which bytes mean what. Nobody duplicates work, and nobody trusts anybody.

> **Warning**
>
> **Layering is a model, not a law.** Real systems violate it constantly and usefully: NAT rewrites transport ports inside a network device, load balancers read HTTP at layer 7, QUIC puts a transport inside UDP inside IP. When a violation surprises you, that is usually where the bug is — a "transparent" middlebox that is not transparent at all.

<a id="2-osi-and-tcp-ip"></a>

## 2. The OSI and TCP/IP Models

Two models are in circulation. **OSI** has seven layers and is the vocabulary everyone uses; **TCP/IP** has four and is what actually runs. Learn OSI for the words — "that's a layer 4 load balancer" is a sentence you will hear weekly — and TCP/IP for the reality.

| OSI | TCP/IP | Unit | Address | Examples |
| --- | --- | --- | --- | --- |
| 7 Application | Application | message | URL, hostname | HTTP, DNS, SMTP, gRPC |
| 6 Presentation | — | — | TLS, JSON, gzip |   |
| 5 Session | — | — | (largely fictional in practice) |   |
| 4 Transport | Transport | segment / datagram | port | TCP, UDP, QUIC |
| 3 Network | Internet | packet | IP address | IP, ICMP, routing protocols |
| 2 Data link | Link | frame | MAC address | Ethernet, Wi-Fi, ARP |
| 1 Physical | bit / symbol | — | copper, fibre, radio |   |

Layers 5 and 6 are the weakest part of OSI and the reason practitioners quietly ignore it. TLS is the classic embarrassment: it is usually called layer 6, but it runs over TCP and carries HTTP, so by the model's own rules it is simultaneously above and below itself. The TCP/IP model shrugs and calls it application-layer, which is closer to how it is implemented.

> **Tip**
>
> The layer numbers earn their keep in exactly one place: describing middleboxes. A **layer 4** load balancer forwards by four-tuple without reading the payload — fast, protocol agnostic, and it cannot route by URL. A **layer 7** load balancer terminates the connection, parses HTTP, and can route by path, header or cookie — and therefore must hold your TLS keys. That single distinction decides most architecture arguments about proxies.

<a id="3-encapsulation"></a>

## 3. Encapsulation and the Life of a Frame

Layering is an idea; encapsulation is the mechanism. Each layer takes the unit handed down to it, prepends its own header, and passes the result down as an opaque payload. On the way up, each layer removes exactly the header it added.

> **Interactive animation:** `encapsulation` — rendered by the page script in the HTML version.

<a id="3-1-headers-and-overhead"></a>

### 3.1 The cost of all those headers

Overhead is fixed per packet, so it matters enormously for small packets and hardly at all for large ones:

| Header | Size | Carries |
| --- | --- | --- |
| Ethernet | 14 B + 4 B FCS | destination MAC, source MAC, ethertype, checksum |
| IPv4 | 20 B (typical) | source and destination IP, TTL, protocol, fragmentation fields |
| IPv6 | 40 B (fixed) | same idea, bigger addresses, no fragmentation or checksum |
| TCP | 20 B + options | ports, sequence, acknowledgement, flags, window, checksum |
| UDP | 8 B | ports, length, checksum — and nothing else |

A one-byte keystroke over SSH costs 54 bytes of headers to deliver — 98% overhead. A 1460-byte bulk segment costs the same 54 bytes, or 3.6%. This is why **packets per second, not bits per second, is usually the limiting resource** on routers, firewalls and virtual NICs, and why batching small messages is such a reliable optimisation.

> **Warning**
>
> Encapsulation nests further than the table suggests. A VXLAN-encapsulated packet inside a cloud network carries Ethernet-in-UDP-in-IP-in-Ethernet, and a VPN adds more. Each wrapper steals bytes from the payload, which is why **tunnels are where MTU problems live** — see section 11.

<a id="4-latency-and-bandwidth"></a>

## 4. Latency, Bandwidth and the Bandwidth-Delay Product

Before any protocol, get the physics straight, because most performance mistakes are made here. **Bandwidth** is how many bits per second a link can carry. **Latency** is how long one bit takes to arrive. They are almost unrelated, and only one of them is for sale.

> **Analogy** 🚚
>
> **Picture it — a lorry full of hard drives**
>
> A van carrying 1,000 disks across a country in six hours has staggering bandwidth — petabits per second — and appalling latency. A fibre link has modest bandwidth and millisecond latency. For bulk migration the van wins; for a database query it is useless. Ask which one your workload actually needs before optimising either.

Latency has four components, and only one of them is under anyone's control:

- **Propagation delay** — Distance ÷ speed of light in the medium — about 200 km per millisecond in fibre. Physics. Unimprovable except by moving the data closer, which is exactly what a CDN does.
- **Transmission delay** — Packet size ÷ link rate. Real on slow links: 1500 bytes on a 1 Mbit/s uplink is 12 ms.
- **Queueing delay** — Time spent waiting in router buffers. Highly variable, and the main cause of jitter and of bufferbloat.
- **Processing delay** — Routing lookups, checksums, encryption. Usually microseconds on hardware, but real in virtualised and software paths.

| Path | Typical RTT | What that means |
| --- | --- | --- |
| Same host (loopback) | < 0.1 ms | Why localhost benchmarks lie about everything |
| Same rack | 0.1–0.5 ms | Chatty service calls are affordable here |
| Same region, cross-AZ | 0.5–2 ms | Synchronous replication is viable |
| Same continent | 10–40 ms | Chatty protocols start to hurt badly |
| Transatlantic | 70–90 ms | Every extra round trip is visible to a human |
| Antipodal | 250–300 ms | Only round-trip count matters; bandwidth is irrelevant |

<a id="4-1-bandwidth-delay-product"></a>

### 4.1 The bandwidth-delay product

The two numbers combine into the single most useful quantity in transport performance: **BDP = bandwidth × round-trip time**. It is the amount of data that must be *in flight* — sent but not yet acknowledged — to keep the pipe full. Send less and the link idles while you wait for acknowledgements.

> **Key idea**
>
> **Throughput = window ÷ RTT**, capped by bandwidth. A 64 KB window on an 80 ms path yields 6.5 Mbit/s regardless of a 10 Gbit/s link. Whenever a transfer refuses to speed up, compute the BDP before blaming anything else — it identifies the bottleneck in ten seconds.

**Worked example**

*A backup runs between two regions, 1 Gbit/s available, 90 ms RTT. It sustains 5.8 Mbit/s. Where is the limit, and what are the options?*

BDP = 125 MB/s × 0.09 s = 11.25 MB in flight to saturate. The measured rate implies a window of about 65 KB — the classic unscaled TCP maximum. So the sender is window-limited, not bandwidth-limited. Three fixes, in order of preference: raise the socket buffer ceilings so auto-tuning can scale the window; run parallel streams so several windows add up; or, if the path is also lossy, switch congestion control to BBR, since a loss-based algorithm recovers a large window agonisingly slowly at 90 ms per round trip.

**BDP arithmetic and the fix**

```python
def bdp_bytes(bits_per_second: float, rtt_seconds: float) -> float:
    return bits_per_second / 8 * rtt_seconds

def throughput_bps(window_bytes: float, rtt_seconds: float) -> float:
    return window_bytes * 8 / rtt_seconds

link, rtt = 1_000_000_000, 0.090
print(f"need {bdp_bytes(link, rtt) / 1e6:.1f} MB in flight")     # 11.2 MB

for kb in (64, 512, 4096, 16384):
    mbps = throughput_bps(kb * 1024, rtt) / 1e6
    print(f"{kb:>6} KB window -> {mbps:8.1f} Mbit/s")

# 64 KB ->  5.8 Mbit/s  - matches the measurement, so the window is the bottleneck
```

```bash
# confirm the window really is the limit, live
ss -ti dst 10.30.0.7 | grep -oE 'rtt:[0-9.]+|cwnd:[0-9]+|send [0-9.]+[MK]bps'

# raise the auto-tuning ceiling (min default max)
sysctl -w net.ipv4.tcp_rmem="4096 262144 33554432"
sysctl -w net.ipv4.tcp_wmem="4096 262144 33554432"

# measure with and without parallel streams to separate window from path limits
iperf3 -c 10.30.0.7 -t 20            # single stream
iperf3 -c 10.30.0.7 -t 20 -P 8       # eight streams: 8 windows in parallel
```

<a id="5-the-link-layer"></a>

## 5. The Link Layer and Ethernet

The link layer moves a frame between two devices that share a medium. Its scope is one hop and no further, and everything about it follows from that limitation.

An **Ethernet frame** is: destination MAC (6 bytes), source MAC (6), ethertype (2), payload (46–1500), frame check sequence (4). The ethertype says what is inside — `0x0800` for IPv4, `0x86DD` for IPv6, `0x0806` for ARP — which is how the receiver knows which upstairs protocol to hand it to.

```text
 0 6 12 14 n
                +-------------------+------------------+-----+---------------------------+-----+
                | destination MAC | source MAC | typ | payload | FCS |
                | 6 bytes | 6 bytes | 2 | 46 - 1500 bytes | 4 |
                +-------------------+------------------+-----+---------------------------+-----+
                who gets it who sent it what's the IP packet lives here CRC-32
                (this hop) (this hop) inside detect only

```

Three details of that structure are worth dwelling on:

- **MAC addresses are flat** — 48 bits, first 24 identifying the manufacturer. No hierarchy at all, so no aggregation is possible — which is precisely why a global network cannot be built from MAC addresses alone.
- **The FCS detects, it does not correct** — A corrupted frame is silently discarded. Repair is somebody else's problem, and that somebody is TCP.
- **Minimum payload of 46 bytes** — A leftover from collision detection on shared coax. Small packets are padded, which is one more reason tiny messages are inefficient.
- **The broadcast address**`ff:ff:ff:ff:ff:ff` reaches every device on the segment — the escape hatch that makes ARP and DHCP possible.

<a id="5-1-collision-and-broadcast-domains"></a>

### 5.1 Collision domains and broadcast domains

Original Ethernet was a shared cable: only one device could transmit at a time, and simultaneous transmissions collided. CSMA/CD — listen, transmit, detect the collision, back off randomly, retry — managed the chaos, and it worked until utilisation rose, at which point throughput collapsed.

Switches killed collisions by giving every port its own segment, so modern full-duplex Ethernet has no collisions at all. But the second domain survived: **a broadcast still reaches every port**. One switch, or twenty switches wired together, is a single broadcast domain — and that is the unit that does not scale. Splitting broadcast domains is the entire purpose of VLANs and subnets.

> **Tip**
>
> Wi-Fi reintroduces every problem switches solved. It is half duplex, it is a shared medium with hidden nodes, it uses collision *avoidance* plus link-layer retransmission, and the rate adapts constantly with signal quality. So on Wi-Fi, packet loss is often **not** congestion — which quietly breaks TCP's central assumption and is a major reason BBR exists.

<a id="6-switching-and-vlans"></a>

## 6. Switching, VLANs and Spanning Tree

A switch performs one algorithm, and it is short enough to state in full: on receiving a frame, record *source MAC → arrival port* in the forwarding table; then look up the *destination MAC*; if it is known, send the frame out of that port only; if it is unknown or is a broadcast, flood it out of every port except the one it came in on.

> **Interactive animation:** `switching` — rendered by the page script in the HTML version.

That is all. There is no configuration, no protocol between switches for learning, and no memory beyond a table with an ageing timer of a few minutes. The elegance is real, and so are the two failure modes it creates.

<a id="6-1-loops-and-spanning-tree"></a>

### 6.1 Loops and spanning tree

Connect two switches with two cables and a broadcast will circulate between them forever. Nothing in the algorithm stops it — **there is no TTL at layer 2**. Worse, each lap re-triggers flooding, so a single broadcast becomes an exponential storm that saturates every link within seconds and takes the segment down completely.

**Spanning Tree Protocol** exists solely to prevent this. Switches elect a root bridge, compute the shortest path to it, and deliberately *disable* the ports that would create a loop, leaving exactly one active path between any two points. Redundant cables are kept as hot spares, unblocked automatically when a link fails.

> **Warning**
>
> Classic STP takes **30–50 seconds** to reconverge; RSTP cuts that to a few seconds. Either way it is slow enough to be visible as an outage, which is why data-centre fabrics have largely abandoned spanning tree in favour of routed (layer 3) designs with ECMP, where loops are prevented by TTL and multiple paths can be used *simultaneously* rather than blocked.

<a id="6-2-vlans"></a>

### 6.2 VLANs

A **VLAN** splits one physical switch into several independent virtual switches. Each port is assigned a VLAN ID, and the switch will not forward a frame between VLANs at all — they are separate broadcast domains that happen to share hardware. Traffic between them must be routed, which means it can be filtered and counted.

Frames crossing between switches carry an **802.1Q tag** — 4 extra bytes holding the VLAN ID — on a link configured as a *trunk*. Two consequences follow immediately: those 4 bytes eat into the MTU (hence 1504-byte "baby giant" frames), and a misconfigured trunk is a security hole, because VLAN separation is enforced entirely by configuration.

> **Tip**
>
> The mapping to remember: **one VLAN ≈ one subnet ≈ one broadcast domain**. When someone says "put the printers on their own VLAN", they mean: give them their own broadcast domain and their own IP prefix, so their noise stays local and a firewall rule can be written about them.

<a id="7-arp"></a>

## 7. ARP and Neighbour Discovery

Two addressing systems now exist: MAC addresses that identify machines and IP addresses that identify locations. Something must map the second onto the first for the final hop of every delivery, and that something is the **Address Resolution Protocol**.

> **Interactive animation:** `arp` — rendered by the page script in the HTML version.

ARP is deliberately primitive. There is no server, no configuration, and no state beyond a cache: a request is broadcast to the whole segment, and the machine that owns the address answers. Note what it is *not* — it is not a layer 3 protocol, since ARP frames carry ethertype `0x0806` and are never routed. ARP works only within one broadcast domain, which is exactly the scope where a MAC address is meaningful.

<a id="7-1-the-decision-before-every-packet"></a>

### 7.1 The decision made before every packet

Before a host transmits anything it performs one test, and the entire behaviour of the stack follows from the answer:

```text
 destination AND my_mask == my_network ?
                | |
                yes no
                | |
                ARP for the DESTINATION ARP for the DEFAULT GATEWAY
                frame goes straight to it frame goes to the router,
                whose MAC replaces the destination's
                - the IP header is untouched

```

This explains two otherwise baffling symptoms. A host with the **wrong mask** may reach some addresses and not others, because it misclassifies part of its own subnet as remote. A host with the **wrong gateway** reaches everything local and nothing else — the local case never consults the gateway at all.

<a id="7-2-gratuitous-arp-and-failover"></a>

### 7.2 Gratuitous ARP, proxy ARP, and how failover works

A **gratuitous ARP** is an unsolicited announcement: "this IP is at this MAC". It looks like an oddity until you realise it is the mechanism behind almost every layer-2 failover. A virtual IP moves to a standby machine, the standby broadcasts a gratuitous ARP, every host and switch updates its cache, and traffic follows within a second — no routing protocol involved.

**Proxy ARP** is a router answering on behalf of a machine that is not on the segment. It is mostly a legacy compatibility feature today and a reliable source of confusion when enabled by accident.

> **Warning**
>
> Both mechanisms exist because **ARP believes whatever it is told**. The same property is ARP spoofing: an attacker on your segment announces the gateway's IP as their own MAC, and every host obediently sends them all outbound traffic. Defences are switch features — dynamic ARP inspection, port security — plus the assumption you should hold anyway: *the local network is not trustworthy, so use TLS*.

IPv6 replaces ARP with **Neighbour Discovery**, carried over ICMPv6 and using multicast instead of broadcast, so only the plausible targets are interrupted rather than every device. It also folds in router discovery and address autoconfiguration, which is why IPv6 hosts can configure themselves without DHCP.

**Inspecting the neighbour table**

```bash
ip neigh show                       # the modern command (arp -an still works)
# 10.0.0.1 dev eth0 lladdr ee:aa:00:00:00:01 REACHABLE
# 10.0.0.9 dev eth0  INCOMPLETE       <- nothing answered: link/VLAN/firewall

ip neigh flush dev eth0             # force fresh resolution for a clean test
sudo tcpdump -ni eth0 arp           # watch the questions and answers directly

# IPv6 equivalent: neighbour solicitation / advertisement over ICMPv6
sudo tcpdump -ni eth0 icmp6 and ip6[40] == 135
```

```python
import ipaddress, subprocess

def neighbours() -> dict[str, str]:
    """Parse `ip neigh` into {ip: state} - INCOMPLETE entries are the interesting ones."""
    out = subprocess.run(["ip", "neigh"], capture_output=True, text=True).stdout
    table = {}
    for line in out.splitlines():
        parts = line.split()
        if parts:
            table[parts[0]] = parts[-1]
    return table

for ip, state in neighbours().items():
    if state == "INCOMPLETE":
        print(f"{ip}: no ARP reply - check link, VLAN, or host firewall")

def next_hop(dst: str, my_ip: str, prefix: int, gateway: str) -> str:
    """Who do we ARP for? The whole of host routing, in three lines."""
    local = ipaddress.ip_network(f"{my_ip}/{prefix}", strict=False)
    return dst if ipaddress.ip_address(dst) in local else gateway
```

<a id="8-ipv4-addressing"></a>

## 8. IPv4 Addressing

An IPv4 address is 32 bits — about 4.3 billion values, of which a large fraction is reserved. Written as four decimal octets purely for human convenience; every operation on it is a bitwise operation.

The crucial property is **hierarchy**. Addresses are allocated by position in the network, so a router can summarise millions of hosts as one prefix. Without that the global routing table would need billions of entries instead of roughly 950,000, and no hardware could hold it.

| Range | Name | Why you meet it |
| --- | --- | --- |
| `0.0.0.0/8` | this network | `0.0.0.0` as a bind address means "every interface" |
| `10.0.0.0/8` | private | 16.7M addresses — the default choice for VPCs and offices |
| `127.0.0.0/8` | loopback | Never leaves the host; binding here hides a service from the world |
| `169.254.0.0/16` | link-local | Self-assigned when DHCP fails; also the cloud metadata address |
| `172.16.0.0/12` | private | 1M addresses — Docker's default bridge lives here |
| `192.168.0.0/16` | private | 65k addresses — home routers |
| `100.64.0.0/10` | carrier-grade NAT | Your "public" IP may be one of these behind an ISP's NAT |
| `224.0.0.0/4` | multicast | One-to-many; used by routing protocols and mDNS |

> **Key idea**
>
> **Choose private ranges as though you will merge with another company.** Two networks that both used `10.0.0.0/16` cannot be peered or VPN-linked without double NAT, which is painful forever. Pick an unusual block — `10.87.0.0/16`, not `10.0.0.0/16` — and document it. This costs nothing today and saves a migration later.

Historical note worth knowing because the vocabulary persists: addresses were originally divided into fixed **classes** (A = /8, B = /16, C = /24). The scheme was catastrophically wasteful — an organisation needing 300 addresses was given 65,534 — and was replaced in 1993 by **CIDR**, which made the prefix length arbitrary. When someone says "a class C", they mean a /24, and they are using a term that has been obsolete for three decades.

<a id="9-subnetting"></a>

## 9. Subnetting and CIDR Arithmetic

A subnet mask marks the boundary between the network part and the host part. In CIDR notation the mask is a single number: `/24` means the first 24 bits are network. Everything else is derived.

> **Interactive animation:** `subnetting` — rendered by the page script in the HTML version.

<a id="9-1-the-four-operations"></a>

### 9.1 The four operations

- **Network address**`address AND mask`. Zero every host bit. This is the single test a router performs.
- **Broadcast address**`network OR NOT mask`. Set every host bit. Cannot be assigned to a machine.
- **Usable range** — network + 1 through broadcast − 1. Two addresses lost per subnet, which is why a /31 is useless for hosts (and why /31 is specially permitted for point-to-point links).
- **Host count**`2^(32 − prefix) − 2`. Memorise the ladder: /24 = 254, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2.

<a id="9-2-vlsm-and-supernetting"></a>

### 9.2 Variable-length subnetting and aggregation

Prefixes nest, so a block can be split unevenly — a /24 into one /25, one /26 and two /27s — sized to actual need. That is **VLSM**, and it is how any real allocation plan is built.

The same nesting runs in reverse. Four adjacent /24s that share the first 22 bits can be advertised as one `/22`. This **aggregation** is what keeps the global routing table manageable — and why address blocks are allocated in contiguous, power-of-two-aligned chunks.

**Worked example**

*Plan addressing for a VPC in three availability zones, each needing a public subnet (~500 hosts) and a private subnet (~4000 hosts), with room to double.*

Take `10.42.0.0/16` — deliberately not `10.0.0.0/16`, to survive a future merger. Private subnets need 4000 usable, so a /20 (4094) is the smallest fit; double that need means /19 (8190) is the safer choice. Public subnets need 500, so /23 (510) fits but /22 gives headroom. Allocate the three /19s from the bottom of the range and the three /22s from a separate region of it, so each group can be summarised in a single firewall or route-table rule. Leave the upper half of the /16 entirely unallocated: **the most common addressing mistake is packing subnets tightly**, since a subnet cannot be resized once resources live in it.

**Generate and validate the plan**

```python
import ipaddress

vpc = ipaddress.ip_network("10.42.0.0/16")
private = list(ipaddress.ip_network("10.42.0.0/18").subnets(new_prefix=19))[:3]
public = list(ipaddress.ip_network("10.42.128.0/20").subnets(new_prefix=22))[:3]

for zone, net in zip("abc", private):
    print(f"private-{zone}  {net}  {net.num_addresses - 2:>5} usable")
for zone, net in zip("abc", public):
    print(f"public-{zone}   {net}  {net.num_addresses - 2:>5} usable")

# never let two subnets overlap - this assertion belongs in your IaC tests
allocated = private + public
for a, b in ((x, y) for x in allocated for y in allocated if x != y):
    assert not a.overlaps(b), f"{a} overlaps {b}"

# and confirm everything still fits inside the VPC
assert all(net.subnet_of(vpc) for net in allocated)
print("free space:", list(vpc.address_exclude(ipaddress.ip_network('10.42.0.0/17'))))
```

```javascript
const toInt = (ip) => ip.split(".").reduce((a, o) => (a << 8) + Number(o), 0) >>> 0;
const toIp = (n) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

function cidrInfo(cidr) {
    const [base, p] = cidr.split("/");
    const prefix = Number(p);
    const mask = prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
    const network = (toInt(base) & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    return {
        network: toIp(network),
        firstHost: toIp(network + 1),
        lastHost: toIp(broadcast - 1),
        broadcast: toIp(broadcast),
        usable: broadcast - network - 1,
    };
}

const overlaps = (a, b) => {
    const ra = cidrInfo(a), rb = cidrInfo(b);
    return toInt(ra.network) <= toInt(rb.broadcast) && toInt(rb.network) <= toInt(ra.broadcast);
};

console.log(cidrInfo("10.42.0.0/19"));
console.log(overlaps("10.42.0.0/19", "10.42.16.0/20"));   // true - caught before deploy
```

<a id="10-ipv6"></a>

## 10. IPv6

IPv6 addresses are 128 bits — 3.4 × 10³⁸ of them, enough to abandon scarcity as a design constraint entirely. Written as eight groups of four hex digits, with one run of zeros collapsible to `::`, so `2001:0db8:0000:0000` `:0000:0000:0000:0001` becomes `2001:db8::1`.

| Difference | What changes in practice |
| --- | --- |
| Subnets are always /64 | Subnetting arithmetic disappears; the lower 64 bits are the interface identifier |
| No NAT | Every device is globally addressable — so the firewall, not NAT, is your only boundary |
| No broadcast | Replaced by multicast groups, so only interested devices are interrupted |
| No router fragmentation | Path MTU discovery is mandatory; blocking ICMPv6 breaks the protocol outright |
| SLAAC | Hosts self-configure from a router advertisement; DHCPv6 is optional |
| Fixed 40-byte header | Simpler and faster to parse; options move into extension headers |

Addresses you will actually meet: `::1` is loopback; `fe80::/10` is link-local and exists on every interface whether you asked for it or not; `fc00::/7` is unique-local (the closest thing to a private range); `2000::/3` is globally routable. A single interface normally holds several addresses at once, which surprises people used to IPv4.

> **Warning**
>
> The practical trap in dual-stack environments is **silent preference**. Most resolvers and clients try AAAA before A. If IPv6 is configured but broken — a common state — every connection stalls until it falls back. Happy Eyeballs (RFC 8305) races both families and picks the winner after a short head start, which is why browsers hide the problem and your backend service does not. In code, **always iterate over every result from `getaddrinfo`** rather than taking the first.

<a id="11-the-ip-header"></a>

## 11. The IP Header, MTU and Fragmentation

The IPv4 header is 20 bytes, and only a handful of its fields matter day to day:

- **TTL** — Decremented at every hop; at zero the packet is destroyed and ICMP is returned. Loop protection — and the mechanism traceroute exploits.
- **Protocol** — Says what is inside: 6 = TCP, 17 = UDP, 1 = ICMP. How the receiving stack knows which module to call.
- **Source / destination** — The only end-to-end identifiers in the packet. Rewritten only by NAT.
- **Identification, flags, offset** — The fragmentation machinery discussed below.
- **DSCP / ECN** — Quality-of-service marking, and explicit congestion notification — a router can *mark* a packet instead of dropping it.

Every link imposes a **maximum transmission unit**: 1500 bytes on standard Ethernet, 9000 on a jumbo-frame data-centre network, less on tunnels. A packet larger than the next link's MTU must be fragmented or dropped.

> **Interactive animation:** `ip-fragmentation` — rendered by the page script in the HTML version.

<a id="11-1-why-fragmentation-is-avoided"></a>

### 11.1 Why fragmentation is avoided

1. **Loss is amplified.** Reassembly is all-or-nothing, so losing one fragment discards the whole datagram. Three fragments turn 1% packet loss into ~3% datagram loss.
2. **Reassembly costs memory** at the destination, and only there — fragments are never reassembled in transit.
3. **Middleboxes hate it.** Only the first fragment carries the TCP or UDP ports, so firewalls and load balancers cannot classify the rest.
4. **IPv6 forbids it in routers** outright.

So senders set the **don't fragment** bit and rely on **path MTU discovery**: a router that cannot forward the packet drops it and returns ICMP *fragmentation needed* naming the MTU it can handle. TCP goes further and negotiates a maximum segment size during the handshake, so it rarely produces an oversized packet at all.

> **Key idea**
>
> **The MTU black hole.** If a firewall blocks ICMP, the notification never arrives: the sender keeps retransmitting a packet that can never fit. The signature is unmistakable — the *handshake succeeds and small requests work, but anything large hangs completely*. Suspect it whenever a VPN, GRE tunnel, VXLAN overlay or PPPoE link is in the path, and test with `ping -M do -s 1472`, reducing the size until it passes.

**Find the real path MTU**

```bash
# -M do sets don't-fragment; -s is PAYLOAD size (add 28 for ICMP+IP headers)
ping -M do -s 1472 -c 1 example.com     # 1472 + 28 = 1500 - passes on plain Ethernet
ping -M do -s 1452 -c 1 example.com     # 1480 - typical over a PPPoE or GRE tunnel
ping -M do -s 1372 -c 1 example.com     # 1400 - typical over a VPN

# "Frag needed and DF set" = you have exceeded the path MTU; go smaller
# total silence instead of that message = ICMP is being filtered -> black hole

tracepath example.com                    # reports the discovered PMTU per hop
ip route get 93.184.216.34               # shows a cached mtu for this destination

# workaround at the edge: clamp TCP MSS so the sender never overshoots
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --clamp-mss-to-pmtu
```

```python
import socket

def path_mtu(host: str, port: int = 443) -> int:
    """Ask the kernel what MTU it discovered for this destination."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # refuse to fragment, so the kernel performs path MTU discovery
    s.setsockopt(socket.IPPROTO_IP, socket.IP_MTU_DISCOVER, socket.IP_PMTUDISC_DO)
    s.connect((host, port))
    mtu = s.getsockopt(socket.IPPROTO_IP, socket.IP_MTU)
    s.close()
    return mtu

print(path_mtu("example.com"))   # 1500 normally; 1400-ish through a VPN

# a black hole looks like: handshake fine (small packets), then the first
# large response never arrives and the socket eventually times out
```

<a id="12-icmp"></a>

## 12. ICMP, ping and traceroute

**ICMP** is IP's control channel. It carries no user data; it exists so that machines can report problems about other packets. It is not optional plumbing — several protocols depend on it, and blocking it wholesale breaks them.

| Message | Meaning | Who relies on it |
| --- | --- | --- |
| Echo request / reply (8 / 0) | "are you there?" | `ping` |
| Time exceeded (11) | TTL hit zero here | `traceroute`, loop detection |
| Destination unreachable (3) | no route, or port closed | fast failure instead of a timeout |
| Frag needed, code 3/4 | packet too big, MTU is *n* | path MTU discovery — **never block this** |

> **Interactive animation:** `traceroute` — rendered by the page script in the HTML version.

> **Warning**
>
> Three ways people misread traceroute. **`* * *` is usually not loss** — most routers rate-limit or suppress ICMP while forwarding traffic perfectly. **A high RTT at one hop is not a slow hop** — it means that router deprioritised your ICMP reply; only a rise that *persists to the final hop* is real. And **the path is not one path** — ECMP hashes each probe onto a different parallel link, so consecutive lines may describe different routes. Use `mtr` for a statistical view, and `traceroute -T -p 443` to follow the port your application actually uses.

<a id="13-routing"></a>

## 13. Routing Fundamentals

Routing is the process by which a packet crosses networks it has no relationship with. The mechanism is startlingly minimal: **every router makes one local decision, and the path is what emerges**.

> **Interactive animation:** `routing` — rendered by the page script in the HTML version.

<a id="13-1-the-forwarding-algorithm"></a>

### 13.1 The forwarding algorithm

1. Receive a frame; discard the link-layer header.
2. Verify the IP header checksum; drop the packet if it fails.
3. Decrement TTL. If it reaches zero, drop it and send ICMP time exceeded.
4. Find the **longest matching prefix** for the destination in the forwarding table.
5. If the next hop is on a directly connected network, resolve its MAC with ARP; otherwise use the next-hop router's MAC.
6. Build a fresh link-layer frame and transmit. Forget everything.

Step 4 is the interesting one. Prefixes are stored in a structure — historically a trie, today usually TCAM in hardware — that returns the most specific match in constant time, regardless of table size. Order in a configuration file is irrelevant; specificity decides.

> **Key idea**
>
> **Longest prefix match** is why a default route and a specific override can coexist, why a `/32` host route always wins, and why announcing a more specific prefix than somebody else steals their traffic (section 15). It is the single rule that carries the most weight in the whole subject.

<a id="13-2-reading-a-routing-table"></a>

### 13.2 Reading a real routing table

**The routing table, and how to interrogate it**

```bash
ip route
# default via 10.0.0.1 dev eth0 proto dhcp metric 100
# 10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.7
# 172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1
#
# 'scope link'  = directly connected, ARP for the destination itself
# 'via X'       = send to router X, ARP for X

# never guess which entry wins - ask the kernel to run the algorithm for you
ip route get 93.184.216.34
ip route get 10.0.0.9

# policy routing: Linux consults several tables in rule order
ip rule show
ip route show table all | head -20

# a host route is the most specific override possible
sudo ip route add 93.184.216.34/32 via 10.0.0.2
```

```python
import ipaddress

TABLE = [
    ("10.0.0.0/24",     "on-link"),
    ("93.184.0.0/16",   "10.0.0.3"),
    ("93.184.216.0/24", "10.0.0.2"),
    ("0.0.0.0/0",       "10.0.0.1"),   # default - matches everything, always loses ties
]

def longest_prefix_match(destination: str):
    """Exactly what a router does, minus the hardware."""
    dst = ipaddress.ip_address(destination)
    best = None
    for cidr, next_hop in TABLE:
        net = ipaddress.ip_network(cidr)
        if dst in net and (best is None or net.prefixlen > best[0].prefixlen):
            best = (net, next_hop)
    return best

print(longest_prefix_match("93.184.216.34"))   # /24 wins over /16 and /0
print(longest_prefix_match("93.184.9.1"))      # /16 wins over /0
print(longest_prefix_match("8.8.8.8"))         # only the default matches
```

<a id="13-3-static-versus-dynamic"></a>

### 13.3 Static versus dynamic routing

Static routes are typed in by a human: predictable, auditable, and completely unable to react to a failure. Dynamic routing protocols exchange reachability information so that routers recompute paths automatically when a link dies. Almost every real network uses static routes at the edges and a dynamic protocol in the core.

Dynamic protocols split into two families, and the distinction is worth holding onto: **distance vector** protocols tell their neighbours what they know ("I can reach X in 4 hops"), while **link state** protocols tell everyone what they see ("these are my links"), and each router computes the whole map itself.

<a id="14-interior-routing"></a>

## 14. Interior Routing — RIP and OSPF

Inside one organisation — an **autonomous system** — the goal is simply to find good paths quickly. Nobody is negotiating money or policy, so the protocols optimise for convergence speed.

<a id="14-1-rip"></a>

### 14.1 RIP, and why simple is not enough

**RIP** is distance vector: every 30 seconds each router broadcasts its table, neighbours add one to each metric and keep the best. It is trivially simple, and it fails in an instructive way.

When a network disappears, the news travels slowly while stale information circulates — **count-to-infinity**. Router A hears from B that X is reachable in 2 hops, not realising B's route *goes through A*. The metric climbs one hop at a time until it reaches 16, which RIP defines as unreachable. That cap is also RIP's diameter limit: no network more than 15 hops across. Split horizon and poison reverse mitigate it; they do not cure it.

<a id="14-2-ospf"></a>

### 14.2 OSPF

**OSPF** takes the opposite approach. Each router floods a description of its own links to every other router, so all of them build an identical map of the topology — the link-state database. Each then runs **Dijkstra's shortest path algorithm** locally to compute its own tree.

- **Fast convergence** — A failure is flooded immediately and everyone recomputes. Seconds, not minutes, and no count-to-infinity because nobody relies on hearsay.
- **Cost-based metrics** — Link cost is derived from bandwidth, so a gigabit path beats a slow path even if it has more hops. Equal-cost paths can be used simultaneously (ECMP).
- **Heavier** — Every router holds the full database and runs Dijkstra. Large domains are split into **areas**, all connecting to a backbone (area 0), so flooding stays local.
- **Single administration only** — It assumes every participant is trusted and shares one goal — which is precisely why it cannot be used between companies.

> **Tip**
>
> If you know Dijkstra from an algorithms course, you already know the core of OSPF: nodes are routers, edges are links, weights are costs, and the output is a shortest-path tree rooted at yourself. The [DSA crash course](../dsa/dsa-crash-course.html) has the algorithm animated; the only addition here is the flooding protocol that keeps every router's copy of the graph identical.

<a id="15-bgp"></a>

## 15. BGP and the Shape of the Internet

Between organisations everything changes. Roughly 75,000 autonomous systems must exchange routes while competing commercially, trusting each other minimally, and honouring contracts. No shortest-path algorithm can express "prefer the transit provider we pay less for" — so **BGP is a path-vector protocol driven by policy, not by distance**.

> **Interactive animation:** `bgp` — rendered by the page script in the HTML version.

<a id="15-1-how-a-route-is-chosen"></a>

### 15.1 How a route is chosen

An announcement carries the prefix plus the list of autonomous systems it has traversed. Each AS prepends itself before passing it on, which prevents loops (an AS seeing its own number discards the route) and gives a crude length metric. Selection then runs down a fixed list:

1. **Highest local preference** — a purely local business decision. This is where "send traffic via the cheap transit" is expressed, and it outranks everything else.
2. **Shortest AS path** — the only vaguely topological criterion, and a poor proxy for latency.
3. Origin type, MED, eBGP over iBGP, lowest IGP cost to the next hop, and finally the lowest router ID as a tie-break.

> **Key idea**
>
> **BGP optimises for money and policy, not speed.** This is why a packet from London to Paris can travel via New York, and why "the internet routes around damage" is only true on a scale of minutes. Convergence after a withdrawal is measured in tens of seconds — during which packets are dropped or loop.

<a id="15-2-hijacks-and-leaks"></a>

### 15.2 Hijacks and route leaks

BGP was designed among people who knew each other, and it shows: an announcement is believed because it was made. Two failure classes follow. A **hijack** announces someone else's prefix — usually a more specific one, which wins by longest prefix match and silently attracts their traffic. A **route leak** re-advertises routes learned from one provider to another, turning a small network into an accidental transit for traffic it cannot carry.

Both have taken large services offline. The mitigations — RPKI origin validation, IRR filtering, maximum prefix limits — are deployed unevenly, so the honest summary is that **the global routing system still rests substantially on trust**.

<a id="16-nat"></a>

## 16. NAT and Private Addressing

NAT was an emergency measure to slow IPv4 exhaustion, and it became the most consequential violation of the end-to-end principle in the internet's history.

> **Interactive animation:** `nat` — rendered by the page script in the HTML version.

What is almost always meant by "NAT" is **NAPT** — network address *and port* translation, sometimes called PAT or masquerading. The router rewrites the source address *and* the source port, so a single public address can multiplex tens of thousands of internal flows, keyed by port.

| Variant | What it does | Where you meet it |
| --- | --- | --- |
| Source NAT (masquerade) | rewrites the source on the way out | every home router; cloud NAT gateways |
| Destination NAT (port forward) | rewrites the destination on the way in | exposing a home server; Kubernetes services |
| Full NAT / 1:1 | maps one private address to one public | elastic IPs on cloud instances |
| Carrier-grade NAT | ISP NATs many customers together | mobile networks; `100.64.0.0/10` addresses |

<a id="16-1-what-nat-breaks"></a>

### 16.1 What NAT breaks

- **Inbound connections** — No table entry means the packet is dropped. Servers behind NAT need explicit port forwarding; peer-to-peer needs STUN to learn its public mapping, hole punching to create one, and TURN to relay when that fails.
- **Long-idle connections** — Mappings are soft state with idle timeouts — often 350 s on cloud NAT gateways. Neither endpoint is told, so the connection simply stops working.
- **Embedded addresses** — Any protocol that puts an IP address inside its payload — classic FTP, SIP — needs an application-layer gateway to rewrite it, and those gateways are a reliable source of bizarre bugs.
- **...but it does hide the inside** — Unsolicited inbound traffic is dropped by default. It is not a real security policy, but it is a genuine reduction in exposure.

> **Warning**
>
> **The port exhaustion trap.** A NAT gateway allocates ports per *destination* tuple. Thousands of instances all connecting to one popular destination — an S3 endpoint, an external API — share a single public address and can exhaust its ~64k ports. The symptom is intermittent connection failures under load that no single instance can reproduce. Fixes: more NAT addresses, a VPC endpoint that bypasses NAT entirely, or connection reuse so fewer ports are needed.

<a id="17-dhcp"></a>

## 17. DHCP and Autoconfiguration

A host joining a network needs an address before it can ask for one. DHCP resolves the paradox with broadcast, and delivers the rest of the configuration in the same exchange.

> **Interactive animation:** `dhcp` — rendered by the page script in the HTML version.

The four messages — **D**ISCOVER, **O**FFER, **R**EQUEST, **A**CK — carry more than an address. The ACK typically includes the subnet mask, the default gateway, DNS servers, the domain search list, the lease time, and often an NTP server. Nearly everything a user thinks of as "network settings" arrives here.

A lease is *borrowed*. At 50% of the lease time the client renews with a unicast REQUEST directly to the server; at 87.5% it broadcasts, hoping any server will answer. Only if both fail does it give up the address.

> **Key idea**
>
> `169.254.x.x` means **nobody answered the DISCOVER**. It is a self-assigned link-local address, and it tells you exactly where to look: the DHCP server, the relay agent, or the VLAN the port landed in. It never means the network is partially working.

Because DHCP is broadcast-based, it does not cross routers. Networks that centralise their DHCP server use a **relay agent** on each router, which forwards the broadcast as a unicast to the server and stamps in which subnet it came from so the right pool is used.

> **Warning**
>
> DHCP is unauthenticated, so a **rogue DHCP server** — a misconfigured home router plugged into an office port is the classic case — can hand out its own address as the gateway and intercept everything. The switch feature that prevents it is DHCP snooping, which only accepts offers from designated ports.

<a id="18-sockets"></a>

## 18. Ports, Sockets and the Socket API

IP delivers to a machine; the transport layer delivers to a *program*. The mechanism is a 16-bit port number at each end, and the abstraction your code sees is the **socket** — a file descriptor you can read and write.

> **Interactive animation:** `sockets` — rendered by the page script in the HTML version.

<a id="18-1-the-four-tuple"></a>

### 18.1 The four-tuple

The kernel demultiplexes arriving segments using `(source IP, source port, destination IP, destination port)`. Only one field must differ for two connections to be distinct, which leads to a result that surprises people: **a server is not limited to 65,535 connections on port 443**. Its limit is memory and file descriptors. The *client* is the constrained side, because for a fixed destination its only free field is the ephemeral source port — roughly 28,000 of them by default on Linux.

| Range | Name | Note |
| --- | --- | --- |
| 0–1023 | well known | Requires root (or `CAP_NET_BIND_SERVICE`) to bind on Unix |
| 1024–49151 | registered | 3306 MySQL, 5432 Postgres, 6379 Redis, 8080 HTTP alt |
| 32768–60999 | ephemeral (Linux default) | Chosen automatically for outbound connections |

<a id="18-2-the-two-queues"></a>

### 18.2 The two queues behind `listen()`

A listening socket has two kernel queues, and knowing the difference explains a whole family of production incidents. The **SYN queue** holds half-open connections whose handshake is incomplete. The **accept queue** holds fully established connections waiting for your application to call `accept()`.

If the accept queue fills — because your application is too slow to accept, not because the network is busy — new connections are dropped or reset. From the client this looks like a random timeout or a connection reset, with the server showing low CPU and healthy logs. `ss -lnt` shows the queue depths directly, and `nstat -az TcpExtListenOverflows` counts the drops.

**A correct TCP server, and the sockets it creates**

```python
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# without SO_REUSEADDR a restart fails while old connections sit in TIME_WAIT
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# 0.0.0.0 = every interface. Bind to 127.0.0.1 and nothing outside the host
# can reach you - the single most common container networking mistake.
server.bind(("0.0.0.0", 9000))

# the backlog is the ACCEPT queue depth, not a connection limit
server.listen(512)

while True:
    conn, peer = server.accept()      # returns a NEW socket; `server` keeps listening
    with conn:
        print("connection from", peer, "->", conn.getsockname())
        conn.sendall(b"hello\n")
```

```bash
# Recv-Q on a LISTEN socket = connections waiting to be accepted
# Send-Q on a LISTEN socket = the configured backlog
ss -lnt
# State   Recv-Q  Send-Q  Local Address:Port
# LISTEN  0       512     0.0.0.0:9000        <- healthy
# LISTEN  512     512     0.0.0.0:9000        <- FULL: the app is not accepting

# were connections actually dropped because of it?
nstat -az | grep -E 'ListenOverflows|ListenDrops'

# the kernel ceiling that silently truncates your listen() backlog
sysctl net.core.somaxconn
```

<a id="19-udp"></a>

## 19. UDP

UDP adds exactly two things to IP: port numbers, and an optional checksum. Eight bytes of header, no state, no setup, no promises. Its value is not what it provides but **what it refuses to do** — it never delays your data to repair somebody else's.

> **Interactive animation:** `udp-vs-tcp` (option=udp) — rendered by the page script in the HTML version.

- **Message boundaries preserved** — One `sendto()` is one datagram is one `recvfrom()`. No framing code required — the opposite of TCP.
- **Zero setup latency** — The first packet carries data. For a single request/response like DNS this halves the total time.
- **One socket, many peers** — A single UDP socket can serve thousands of clients, which is why it suits game servers and multicast.
- **You inherit every hard problem** — Loss, ordering, duplication, congestion control, MTU. Skip congestion control and you are the reason a shared link collapses.

The right question is never "UDP or TCP?" but **"is late data still valuable?"**. In a voice call a packet 300 ms late is worthless — retransmitting it wastes bandwidth to deliver something that will be discarded. In a bank transfer late is infinitely better than lost. That single question decides it.

> **Tip**
>
> Keep UDP payloads under about **1200 bytes**. Larger datagrams get fragmented at the IP layer, and a single lost fragment destroys the whole message. This is exactly why DNS responses above 512 bytes historically fell back to TCP, and why EDNS0 negotiates a larger size explicitly rather than assuming one. QUIC follows the same rule.

**UDP: the whole API, and the reliability you must add**

```python
import socket, struct, time

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(0.5)                       # there is NO retransmission - so time out yourself

def request(payload: bytes, addr, attempts: int = 3) -> bytes | None:
    """Minimum viable reliability over UDP: sequence number, timeout, backoff."""
    for attempt in range(attempts):
        seq = int(time.time() * 1000) & 0xFFFF
        sock.sendto(struct.pack("!H", seq) + payload, addr)
        try:
            data, _ = sock.recvfrom(1200)   # keep under the fragmentation threshold
            if struct.unpack("!H", data[:2])[0] == seq:
                return data[2:]             # matching sequence - a genuine reply
            # otherwise it is a late reply to an earlier attempt: ignore and keep waiting
        except socket.timeout:
            time.sleep(0.1 * 2 ** attempt)  # exponential backoff, as TCP would do
    return None
```

```javascript
const dgram = require("dgram");
const socket = dgram.createSocket("udp4");

// UDP gives you no timers, no retries and no ordering - all of it is yours
function request(payload, port, host, { attempts = 3, timeout = 500 } = {}) {
    return new Promise((resolve, reject) => {
        let tries = 0;
        const seq = Math.floor(Math.random() * 65536);
        const packet = Buffer.concat([Buffer.from([seq >> 8, seq & 255]), payload]);

        const send = () => {
            if (tries++ >= attempts) return reject(new Error("no reply after retries"));
            socket.send(packet, port, host);
            timer = setTimeout(send, timeout * 2 ** (tries - 1));   // backoff
        };

        let timer;
        socket.on("message", (msg) => {
            if (msg.readUInt16BE(0) !== seq) return;   // stale reply from an old attempt
            clearTimeout(timer);
            resolve(msg.subarray(2));
        });
        send();
    });
}
```

<a id="20-tcp-connections"></a>

## 20. TCP Connection Management

TCP turns an unreliable packet service into a reliable, ordered, full-duplex byte stream. Everything it does rests on one piece of shared fiction: **a connection, which exists only as matching state in two kernels**.

> **Interactive animation:** `tcp-handshake` — rendered by the page script in the HTML version.

<a id="20-1-the-handshake"></a>

### 20.1 Why three messages, not two

Each direction is an independent byte stream, and each needs its initial sequence number acknowledged. That is four messages in principle, but the server's ACK and its own SYN travel together, giving three.

The initial sequence number is **random**, not zero, and this is a security property rather than an aesthetic one: predictable sequence numbers let an off-path attacker inject data into a connection they cannot see. Randomising them makes blind injection impractical.

<a id="20-2-the-state-machine"></a>

### 20.2 The states you will actually see

| State | Meaning | Accumulating means |
| --- | --- | --- |
| `LISTEN` | waiting for connections | normal |
| `SYN_SENT` | SYN sent, nothing back | packets are being dropped — firewall or wrong address |
| `SYN_RECV` | half-open on the server | SYN flood, or clients disappearing mid-handshake |
| `ESTABLISHED` | data can flow | normal — but check idle ones against NAT timeouts |
| `CLOSE_WAIT` | peer closed, we have not | **a bug in your code**: `close()` is never called |
| `FIN_WAIT_2` | we closed, peer has not | the bug is on the other side |
| `TIME_WAIT` | waiting out stray duplicates | churning connections — pool them instead |

<a id="20-3-time-wait"></a>

### 20.3 TIME_WAIT, defended

The side that closes first waits roughly 60 seconds (2 × maximum segment lifetime) before releasing the four-tuple. Two reasons, both real. A delayed duplicate from the old connection could otherwise arrive inside a new connection reusing the same ports and corrupt its stream. And if the final ACK is lost, the peer will retransmit its FIN — someone must still be there to answer.

> **Warning**
>
> The tempting "fixes" are traps. `tcp_tw_recycle` was removed from Linux because it broke NATed clients outright. `tcp_tw_reuse` is safe only for outbound connections with timestamps enabled. **The real fix is to stop creating so many connections** — keep- alive and connection pooling remove the problem instead of hiding it. And if a server is accumulating TIME_WAIT, ask why the *server* is closing first; usually a missing keep-alive or an aggressively low `Connection: close` policy.

<a id="20-4-reset"></a>

### 20.4 RST — the abrupt close

A **RST** tears a connection down immediately with no four-way exchange. You get one when connecting to a port with nothing listening (that is "connection refused"), when sending on a connection the peer has already forgotten, or when a firewall rejects rather than drops. In application code it surfaces as `ECONNRESET` — "connection reset by peer" — which almost always means the other side crashed, timed out, or closed while data was still in flight.

<a id="21-tcp-reliability"></a>

## 21. TCP Reliability

Reliability is built from three ideas: number every byte, acknowledge cumulatively, and retransmit what is not acknowledged. The subtlety is entirely in *how fast loss is detected*.

> **Interactive animation:** `tcp-retransmission` (option=fast) — rendered by the page script in the HTML version.

<a id="21-1-sequence-numbers"></a>

### 21.1 Sequence numbers count bytes

A segment's sequence number is the position of its first byte in the stream, and an ACK number is the next byte expected. Counting bytes rather than packets is what allows a retransmission to be re-segmented differently from the original — the receiver reassembles by position, not by packet identity.

<a id="21-2-two-detection-mechanisms"></a>

### 21.2 Fast retransmit versus timeout

**Duplicate ACKs** are the fast path. When a segment is missing but later ones arrive, the receiver keeps repeating the same ACK number. Three duplicates are treated as evidence of loss — one or two are more likely to be reordering — and the sender retransmits immediately, costing about one round trip.

The **retransmission timeout** is the slow path, used when nothing else is in flight to generate duplicate ACKs. It is derived from measurement, not a constant:

```text
 SRTT = (1 - a) * SRTT + a * sample a = 1/8
                RTTVAR = (1 - b) * RTTVAR + b * |SRTT - sample| b = 1/4
                RTO = SRTT + 4 * RTTVAR (Linux floor: 200 ms)

                a stable path -> small RTTVAR -> tight RTO, fast recovery
                a jittery path -> large RTTVAR -> patient RTO, avoids spurious resends

```

When the timer fires the reaction is severe: retransmit, collapse the congestion window to one segment, and **double the timer** for the next attempt. Exponential backoff protects a network in trouble, but it is why a two-second glitch can leave a connection frozen for far longer.

> **Key idea**
>
> A p50 of 5 ms with a p99 of almost exactly **200 ms, 1 s or 3 s** is not slow code — it is the retransmission timer and its backoff. Confirm with `ss -ti` (per-connection `retrans` counters) or `nstat -az TcpRetransSegs`. On a wired path anything above roughly **0.5% retransmissions** means the network is dropping and no application change will help.

<a id="21-3-sack"></a>

### 21.3 SACK and delayed ACKs

A cumulative ACK cannot express "I have 5 and 7 but not 6". **Selective acknowledgement** adds a TCP option listing the blocks actually received, so only the true gap is resent instead of everything after it. It is enabled by default everywhere and matters enormously on high-BDP paths.

**Delayed ACK** waits up to 40 ms before acknowledging, hoping to piggyback the ACK on outgoing data. Combined with **Nagle's algorithm** — which withholds a small segment until the previous one is acknowledged — it produces a notorious 40 ms stall in request/response protocols that write a header and a body separately. The fix is `TCP_NODELAY`, or simply writing the whole message in one call.

<a id="22-tcp-flow-control"></a>

## 22. TCP Flow Control

Flow control protects the *receiver*. Every ACK carries a **receive window** saying how much buffer space is left, and the sender may never have more than that outstanding.

> **Interactive animation:** `tcp-window` — rendered by the page script in the HTML version.

When the application stops reading, the buffer fills and the advertised window shrinks to zero. The sender must stop — and because a window-opening ACK could itself be lost, it periodically sends a one-byte **window probe** to avoid deadlock. This is how backpressure propagates from a slow consumer all the way back to a producer's `send()` call.

> **Key idea**
>
> Two windows constrain every sender: **rwnd** (what the receiver can absorb) and **cwnd** (what the network can absorb). In-flight data is capped by `min(rwnd, cwnd)`. Diagnosing throughput starts with identifying which one is binding — `ss -ti` prints both.

The window field is only 16 bits, capping it at 65,535 bytes — hopeless on modern paths. **Window scaling** negotiates a shift factor during the handshake, allowing windows up to 1 GB. It is negotiated in the SYN *only*, so a middlebox that strips the option silently caps the connection at 64 KB for its whole life.

> **Tip**
>
> Reading `ss -tim`: a large `Send-Q` with a small `cwnd` means the *network* is the limit; a large `Send-Q` with a small advertised window means the *receiver* is the limit; a large `Recv-Q` on the receiving side means *your application* is too slow to read. Three different bugs, three different fixes, distinguished in one command.

<a id="23-tcp-congestion-control"></a>

## 23. TCP Congestion Control

Nothing tells a sender how fast the network can go. It must discover the limit by probing, and back off when it finds it — forever, because the answer changes constantly as other flows come and go.

> **Interactive animation:** `congestion-control` (option=reno) — rendered by the page script in the HTML version.

<a id="23-1-the-classic-algorithm"></a>

### 23.1 Slow start and congestion avoidance

**Slow start** is exponential despite the name: the congestion window doubles every round trip until loss occurs or a threshold is reached. It is how a new connection reaches full speed in a handful of round trips rather than hundreds.

After that, **congestion avoidance** adds roughly one segment per round trip and halves the window on loss — **additive increase, multiplicative decrease**. AIMD is the reason independent TCP flows converge on a fair share of a bottleneck without any coordination, and the reason a cwnd graph is a sawtooth.

| Algorithm | Signal | Best for | Weakness |
| --- | --- | --- | --- |
| Reno / NewReno | packet loss | historical baseline | recovers far too slowly on high-BDP paths |
| CUBIC (Linux default) | packet loss | general purpose, long fat pipes | still fills queues; still confuses loss with congestion |
| BBR | bandwidth + RTT model | lossy or bufferbloated paths, CDNs | can be unfair to loss-based flows sharing a link |
| DCTCP | ECN marks | data centres with ECN-capable switches | requires switch support end to end |

<a id="23-2-bbr-and-bufferbloat"></a>

### 23.2 Why BBR exists

Loss-based control rests on an assumption that is no longer safe: *loss means congestion*. On wireless links, loss is often interference — backing off makes things worse for no reason. And on links with oversized buffers, congestion arrives with *no loss at all*: the sender keeps filling the buffer, adding hundreds of milliseconds of queueing delay to every flow sharing the link. That is **bufferbloat**, and the classic symptom is a large download destroying video-call quality while packet loss stays at zero.

**BBR** instead models the path — measuring delivery rate and minimum RTT continuously — and paces at the estimated bottleneck bandwidth. It aims to keep the pipe full and the *queue empty*, periodically probing for more bandwidth and draining afterwards.

**Inspect and change congestion control**

```bash
sysctl net.ipv4.tcp_congestion_control          # cubic on most systems
sysctl net.ipv4.tcp_available_congestion_control

# switch system-wide (BBR pairs best with the fq queueing discipline)
sysctl -w net.core.default_qdisc=fq
sysctl -w net.ipv4.tcp_congestion_control=bbr

# watch cwnd, RTT and retransmissions on a live connection
watch -n1 "ss -ti state established '( dport = :443 )' | tail -4"

# measure honestly: run before and after, on the real path, several times
iperf3 -c far.example.com -t 30 -O 3            # -O skips slow start from the average
```

```python
import socket

s = socket.create_connection(("far.example.com", 443))

# per-socket congestion control - useful when you cannot change system defaults
try:
    s.setsockopt(socket.IPPROTO_TCP, socket.TCP_CONGESTION, b"bbr")
except OSError:
    pass                                        # module not loaded; keep the default

# TCP_INFO exposes cwnd, rtt, retransmissions - the same data ss prints
import struct
info = s.getsockopt(socket.IPPROTO_TCP, socket.TCP_INFO, 224)
fields = struct.unpack("BBBBBBBBIIIIIIIIIIIIIIIIIIIIIIII", info[:112])
print("rtt(us):", fields[23], "cwnd:", fields[26])
```

<a id="24-tcp-tuning"></a>

## 24. TCP Performance Tuning

Tuning follows one rule: **identify the binding constraint first**. Almost every TCP performance problem is one of five, and each has a distinct signature.

| Symptom | Cause | Fix |
| --- | --- | --- |
| Throughput plateaus far below the link | window < bandwidth-delay product | raise `tcp_rmem`/`tcp_wmem`; confirm window scaling |
| Sporadic multi-hundred-ms latency | retransmission timeouts | find the loss; enable SACK; consider BBR |
| Exactly ~40 ms stalls on small writes | Nagle + delayed ACK | `TCP_NODELAY`, or write the message in one call |
| High latency *and* zero loss | bufferbloat | fq_codel on the bottleneck; BBR on the sender |
| Connection setup dominates | too many short connections | keep-alive, pooling, HTTP/2, TLS resumption |

> **Warning**
>
> **Do not copy sysctl blogs.** Every one of these settings is a trade — bigger buffers cost memory per connection and can worsen bufferbloat; a wider ephemeral range delays rather than prevents exhaustion; disabling Nagle increases packet count. Measure the actual constraint, change one thing, measure again. The most valuable optimisation in this whole section is not a sysctl at all: it is **reusing connections**.

<a id="25-dns"></a>

## 25. DNS in Depth

DNS is a distributed database with delegated authority and aggressive caching. Every connection begins with it, and a surprising share of "the network is down" incidents end here.

> **Interactive animation:** `dns-resolution` — rendered by the page script in the HTML version.

<a id="25-1-the-players"></a>

### 25.1 The four participants

- **Stub resolver** — In your OS or library. Asks one question of one server and expects a full answer. This is what `getaddrinfo()` uses — and it has its own cache you cannot see.
- **Recursive resolver** — Does the actual work: walks the delegation chain, caches everything, serves thousands of clients. Your ISP's, or 8.8.8.8, or 1.1.1.1.
- **Root and TLD servers** — Hold no answers, only referrals. Thirteen root *identities*, served by hundreds of anycast instances worldwide.
- **Authoritative server** — Actually holds the zone. Whoever controls it controls the name — which is why registrar and DNS account security is a top-tier concern.

<a id="25-2-record-types"></a>

### 25.2 Record types that matter

| Type | Maps to | Gotcha |
| --- | --- | --- |
| A / AAAA | IPv4 / IPv6 address | Multiple records = crude round robin with no health checking |
| CNAME | another name | Cannot coexist with any other record at the same name — so never at the zone apex |
| ALIAS / ANAME | another name, resolved server-side | Vendor-specific workaround for the apex problem |
| MX | mail servers, with priority | Must point at a name, never an IP address |
| TXT | arbitrary text | SPF, DKIM, DMARC, domain verification — deleting one breaks email |
| NS | delegation | Must match what the parent zone publishes, or resolution is erratic |
| SRV | service + port | Used by service discovery, SIP, Kubernetes headless services |
| PTR | reverse lookup | Lives in `in-addr.arpa`; controlled by whoever owns the address block |

<a id="25-3-caching-and-ttl"></a>

### 25.3 Caching, TTLs and the migration procedure

Caching happens at every level — authoritative TTL, recursive resolver, OS, library, browser, and application runtime. The consequence is absolute: **a record you have already served cannot be recalled**. "DNS propagation" is a misleading phrase; nothing propagates, entries simply expire at different times because each cache started its countdown at a different moment.

> **Key idea**
>
> The safe migration procedure: **(1)** lower the TTL to 60 s and wait at least the *old* TTL so every cache has picked up the short one; **(2)** make the change; **(3)** keep the old endpoint serving for hours — some clients ignore TTLs entirely; **(4)** raise the TTL again once traffic has moved. Skipping step 1 is the classic cause of a day-long partial outage.

> **Warning**
>
> Two client-side traps. Older JVMs cached successful lookups *forever* by default (`networkaddress.cache.ttl`) — always set it explicitly in long-lived services. And connection pools resolve once at creation: a pool holding connections to a decommissioned IP will keep using it long after DNS has changed, so pools need max-lifetime settings too.

<a id="25-4-modern-dns"></a>

### 25.4 DNSSEC, DoT and DoH

Plain DNS is unauthenticated and unencrypted — trivially observable and spoofable. **DNSSEC** signs records so a resolver can verify authenticity (but not privacy). **DoT** (DNS over TLS, port 853) and **DoH** (DNS over HTTPS, port 443) encrypt the query between stub and resolver. DoH is contentious precisely because it hides DNS inside normal web traffic — excellent for privacy, awkward for enterprises that relied on DNS visibility for filtering and monitoring.

<a id="26-http11"></a>

## 26. HTTP/1.1

HTTP is a request/response protocol in plain text: a request line, headers, a blank line, and an optional body. Its simplicity is why it took over everything — you can speak it by hand with `nc`.

> **Interactive animation:** `http-versions` (option=h1) — rendered by the page script in the HTML version.

```text
GET /index.html HTTP/1.1 HTTP/1.1 200 OK
                Host: example.com Content-Type: text/html
                User-Agent: curl/8.4.0 Content-Length: 1256
                Accept: */* Cache-Control: max-age=300
                Connection: keep-alive
                <!doctype html>...
                (blank line ends the headers) (body, exactly 1256 bytes)

```

Two design decisions define it. It is **stateless** — every request stands alone, which is what makes horizontal scaling and caching possible, and why cookies and tokens had to be invented to simulate sessions. And it carries **exactly one request per connection at a time**, which is its central performance flaw.

<a id="26-1-framing-and-keep-alive"></a>

### 26.1 Framing and keep-alive

Since TCP has no message boundaries, HTTP must declare where a body ends: either `Content-Length`, or `Transfer-Encoding: chunked` when the length is not known in advance. Ambiguity between the two is the basis of **request smuggling** attacks, where a proxy and a backend disagree about where one request ends and the next begins.

HTTP/1.1 made connections persistent by default. Pipelining — sending several requests without waiting — was specified but is effectively dead, because responses still had to return in order, so one slow response blocked the rest. Browsers instead open up to **six connections per host**, and every classic optimisation (domain sharding, sprites, bundling, inlining) exists to work around that limit.

<a id="26-2-methods-and-status"></a>

### 26.2 Methods, status codes and retry safety

- **Safe and idempotent**`GET`, `HEAD`, `OPTIONS` change nothing. `PUT` and `DELETE` change something but repeating them is harmless. All are safe to retry automatically.
- **Not idempotent**`POST` and `PATCH`. A retry may create a duplicate — and since the network retries whether you plan for it or not, use an **idempotency key** the server can deduplicate on.
- **Retry on 429, 502, 503, 504** — With exponential backoff *and jitter*. Honour `Retry-After` when present. Without jitter, all your clients retry in lockstep and create a thundering herd.
- **Never retry a 4xx** — The request itself is wrong; repeating it wastes capacity during an incident and hides the real error.

**Speak HTTP by hand, then look at the timings**

```bash
# HTTP/1.1 is simple enough to type. Host: is mandatory - it is how one IP
# serves many sites (and the plaintext ancestor of TLS SNI).
printf 'GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n' \
  | nc example.com 80

# headers only, and the negotiated protocol version
curl -sSI --http1.1 https://example.com

# where did the time actually go?
curl -sS -o /dev/null -w \
 'dns %{time_namelookup}  tcp %{time_connect}  tls %{time_appconnect}
ttfb %{time_starttransfer}  total %{time_total}  proto %{http_version}\n' \
 https://example.com
```

```python
import random, time
import requests

session = requests.Session()          # reuse connections - the biggest single win

RETRYABLE = {429, 500, 502, 503, 504}

def get_with_backoff(url: str, attempts: int = 4):
    for attempt in range(attempts):
        response = session.get(url, timeout=(3, 10))   # (connect, read) - always both
        if response.status_code < 400 or response.status_code not in RETRYABLE:
            return response                            # 4xx: do NOT retry, it is our bug

        wait = float(response.headers.get("Retry-After", 0)) or 2 ** attempt
        time.sleep(wait + random.uniform(0, 0.5))      # jitter prevents a thundering herd
    response.raise_for_status()
```

<a id="27-http2"></a>

## 27. HTTP/2

HTTP/2 keeps every semantic of HTTP/1.1 — the same methods, status codes and headers — and replaces the wire format entirely. Text becomes binary frames, and each frame carries a **stream identifier**.

> **Interactive animation:** `http-versions` (option=h2) — rendered by the page script in the HTML version.

- **Multiplexing** — Many concurrent streams on one connection, responses interleaved in any order. One slow API call no longer blocks a small CSS file behind it.
- **HPACK header compression** — A shared dynamic table means repeated cookies and user-agent strings stop being resent — often 90% smaller headers on mobile.
- **Prioritisation and flow control** — Per-stream windows, so a large download cannot starve interactive requests on the same connection.
- **TCP head-of-line blocking** — All streams share one TCP connection, and TCP delivers in order — so one lost packet stalls *every* stream, including the ones whose data already arrived.

> **Warning**
>
> **HTTP/1.1 optimisations become anti-optimisations.** Domain sharding splits the single connection that multiplexing depends on. Giant bundles defeat granular caching. Inlining prevents caching entirely. If you moved to HTTP/2 and performance did not improve, the usual reason is that the old workarounds were left in place.

Server push — the ability to send resources the client had not requested — was the headline feature and has been removed from Chrome and largely abandoned: it usually pushed things the client already had. `103 Early Hints` with `preload` achieves the intent without the waste.

<a id="28-http3"></a>

## 28. HTTP/3 and QUIC

HTTP/3 fixes head-of-line blocking by abandoning TCP. It runs over **QUIC**: a reliable, encrypted, multiplexed transport implemented in *user space* on top of UDP.

> **Interactive animation:** `http-versions` (option=h3) — rendered by the page script in the HTML version.

Why UDP rather than a new protocol number? Because **middleboxes** — NATs, firewalls, load balancers — drop anything that is not TCP or UDP, and would take a decade to update. Building on UDP made QUIC deployable immediately. Putting it in user space means it can be updated with a browser release rather than a kernel release, which is why it has evolved faster in five years than TCP did in twenty.

- **Per-stream loss recovery** — A lost packet stalls only its own stream. This is the fix HTTP/2 could not make.
- **1-RTT handshake, 0-RTT resumption** — Transport and TLS 1.3 handshakes are merged. 0-RTT early data is replayable, so it must be restricted to idempotent requests.
- **Connection migration** — A connection is identified by a connection ID, not the four-tuple — so switching from Wi-Fi to mobile does not break the download.
- **Costs** — Higher per-packet CPU than kernel TCP, UDP sometimes throttled or blocked, and far less operator visibility since almost the entire header is encrypted.

> **Tip**
>
> Deployment is by negotiation, not switchover: a server advertises HTTP/3 with an `Alt-Svc` header (or an HTTPS DNS record), and clients that can use it will, falling back to HTTP/2 when UDP is blocked. Verify with `curl --http3 -sSI`, and confirm the protocol actually used rather than the one offered.

<a id="29-tls"></a>

## 29. TLS and the PKI

TLS provides confidentiality, integrity and **identity**. The third is the one that makes the other two meaningful, and the one most often discarded in a hurry to make an error go away.

> **Interactive animation:** `tls-handshake` — rendered by the page script in the HTML version.

<a id="29-1-what-the-handshake-establishes"></a>

### 29.1 What the handshake establishes

1. **A shared secret**, via ephemeral Diffie-Hellman. Both sides derive the same key without it ever crossing the wire, and it is discarded afterwards — that is **forward secrecy**: capturing today's traffic and stealing the key tomorrow yields nothing.
2. **The server's identity**, via a certificate chaining to a trusted root, plus a signature over the handshake proving possession of the private key.
3. **An agreed cipher suite**, chosen from what both support. TLS 1.3 pruned the list to a handful of modern AEAD ciphers, which removed an entire generation of downgrade attacks.
4. **Transcript integrity**, via the Finished message — tampering anywhere in the handshake causes both sides to compute different MACs and abort.

<a id="29-2-certificates"></a>

### 29.2 Certificates and chains

A certificate binds a public key to a set of names, signed by a certificate authority. Validation checks the name against the **SAN** list (the old Common Name field is ignored by modern clients), the validity dates, the signature chain up to a trusted root, and revocation status.

> **Key idea**
>
> The most common production TLS bug is a **missing intermediate**. Browsers hide it by fetching the missing certificate via the AIA extension; libraries do not, so the same site works in Chrome and fails in your service with "unable to get local issuer certificate". The fix is on the server: serve the leaf plus every intermediate (never the root).

| Error | Real cause | Correct fix |
| --- | --- | --- |
| unable to get local issuer certificate | server omits an intermediate | fix the server's chain file |
| hostname mismatch | name not in the SAN list | reissue with the right names, or connect by the right name |
| certificate has expired | expiry, or a wrong system clock | renew — and check NTP before assuming |
| self-signed certificate in chain | corporate TLS-inspecting proxy | add the corporate root to the trust store, not `verify=False` |
| handshake failure | no shared cipher or version | modernise the older side; do not re-enable TLS 1.0 |

<a id="29-3-mtls-and-termination"></a>

### 29.3 mTLS and termination

**Mutual TLS** makes the client present a certificate too, so both ends are authenticated cryptographically. It is the foundation of service-to-service authentication in a service mesh, where identity comes from a certificate rather than a shared secret in an environment variable.

**Termination** is where TLS ends. If it ends at the load balancer, everything behind is plaintext unless you re-encrypt. That may be an acceptable decision — but make it deliberately, and remember that the padlock in a browser says nothing whatsoever about your internal network.

<a id="30-network-code"></a>

## 30. Writing Network Code

Most networking bugs in application code come from four assumptions that are false on a real network and true on localhost — which is exactly why they survive testing.

- **"One send equals one receive"** — TCP is a byte stream. Always frame your messages with a length prefix or a delimiter, and always loop when reading.
- **"It will either work or fail"** — The third outcome is *hanging forever*. Every network call needs a timeout — connect *and* read, separately.
- **"A retry is harmless"** — Only for idempotent operations. Otherwise you need an idempotency key, because the network retries whether you designed for it or not.
- **"Resolve once at startup"** — Addresses change. Long-lived pools need a maximum connection lifetime so they pick up DNS changes.

> **Key idea**
>
> **Timeout budgets must shrink as you go deeper.** If the user-facing request has a 3 s budget, the service call inside it gets 2 s and the database call inside that gets 1 s. Equal timeouts at every layer guarantee that an outer call times out while inner work continues — burning capacity to produce a result nobody will read.

**A client that survives a real network**

```python
import random, socket, time
import requests
from requests.adapters import HTTPAdapter

def build_session() -> requests.Session:
    session = requests.Session()
    adapter = HTTPAdapter(pool_connections=20, pool_maxsize=100, max_retries=0)
    session.mount("https://", adapter)     # pooling removes handshakes AND TIME_WAIT
    return session

SESSION = build_session()
RETRYABLE = {429, 500, 502, 503, 504}

def call(url: str, *, budget_s: float = 2.0, attempts: int = 3):
    deadline = time.monotonic() + budget_s          # a budget, not a per-try timeout
    last = None
    for attempt in range(attempts):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break
        try:
            # (connect timeout, read timeout) - a connect hang and a slow server
            # are different failures and deserve different limits
            response = SESSION.get(url, timeout=(min(1.0, remaining), remaining))
            if response.status_code not in RETRYABLE:
                return response
            last = f"http {response.status_code}"
        except (requests.Timeout, requests.ConnectionError) as exc:
            last = repr(exc)
        time.sleep(min(0.05 * 2 ** attempt, 0.4) + random.uniform(0, 0.05))
    raise TimeoutError(f"budget exhausted: {last}")
```

```javascript
const https = require("https");

// One agent, reused: keeps connections alive so each call skips TCP + TLS setup
const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 100,
    keepAliveMsecs: 30_000,     // must stay BELOW any NAT / load-balancer idle timeout
});

async function call(url, { budgetMs = 2000, attempts = 3 } = {}) {
    const deadline = Date.now() + budgetMs;
    let last;

    for (let attempt = 0; attempt < attempts; attempt++) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;

        // AbortController is the only reliable way to bound a fetch in Node
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), remaining);
        try {
            const res = await fetch(url, { agent, signal: controller.signal });
            if (![429, 500, 502, 503, 504].includes(res.status)) return res;
            last = `http ${res.status}`;
        } catch (err) {
            last = err.message;                     // includes aborts and DNS failures
        } finally {
            clearTimeout(timer);
        }
        const backoff = Math.min(50 * 2 ** attempt, 400) + Math.random() * 50;
        await new Promise((r) => setTimeout(r, backoff));
    }
    throw new Error(`budget exhausted: ${last}`);
}
```

<a id="31-proxies"></a>

## 31. Proxies and Load Balancing

A **forward proxy** sits in front of clients (corporate egress filtering, caching). A **reverse proxy** sits in front of servers and is what almost everyone means: TLS termination, load balancing, routing, rate limiting, compression, and a single place to apply policy.

> **Interactive animation:** `load-balancing` (option=rr) — rendered by the page script in the HTML version.

<a id="31-1-l4-versus-l7"></a>

### 31.1 Layer 4 versus layer 7

|   | Layer 4 | Layer 7 |
| --- | --- | --- |
| Decides on | IP addresses and ports | path, headers, cookies, method |
| TLS | passes through untouched | must terminate it to read anything |
| Cost | very low; can be hardware or kernel-bypass | higher — parses every request |
| Can do | any TCP/UDP protocol | retries, rewriting, canaries, per-route limits |
| Typical | NLB, IPVS, HAProxy in TCP mode | ALB, nginx, Envoy, Traefik |

<a id="31-2-algorithms-and-health"></a>

### 31.2 Algorithms and health checking

Choose by **how variable request cost is**. Uniform work → round robin. Variable work → least connections, so slow backends stop attracting more. Cache locality or sticky sessions → consistent hashing, which moves only the affected keys when a backend leaves, instead of reshuffling everything as `hash % n` would.

But the feature that actually keeps you online is **health checking**. Two rules: check something meaningful (an endpoint that touches the dependencies you need, not just an open port), and **never let the health check cascade** — if the shared database hiccups and every backend fails its check simultaneously, the load balancer removes the entire fleet and turns a slow minute into a total outage.

> **Warning**
>
> Size for failure: **when one of three backends dies, the survivors each take 50% more load**. A pool running at 70% utilisation has no headroom for a single failure, so the removal of one node cascades into the removal of the rest. This is the single most common shape of a self-inflicted outage.

> **Tip**
>
> Behind any proxy your application sees the *proxy's* address. The client's real IP arrives in `X-Forwarded-For` or the `Forwarded` header — and you must only trust it when it comes from your own proxies, otherwise anyone can forge their apparent origin and bypass IP-based rate limits or allow-lists.

<a id="32-cdns"></a>

## 32. CDNs and Anycast

A CDN's real product is not bandwidth — it is the **elimination of distance**, and with it the round trips that dominate page load time.

> **Interactive animation:** `cdn` — rendered by the page script in the HTML version.

Users are steered to a nearby edge by **anycast** (the same IP address announced from many locations, with BGP delivering each user to the topologically nearest one) or by geo-aware DNS. Anycast is elegant for stateless UDP and short connections; for long TCP connections it depends on routing stability, since a mid-connection route change would land packets at a different machine.

- **Latency** — TCP and TLS handshakes complete metres away instead of continents away. This benefits even uncacheable, personalised responses.
- **Origin offload** — A 95% hit ratio means 20× fewer requests reach your servers — and absorbs traffic spikes you could never provision for.
- **Attack absorption** — A large distributed edge is the practical defence against volumetric DDoS.
- **Invalidation and correctness** — Purges take time to reach every edge; a wrong `Vary` header or a cached `Set-Cookie` can serve one user's data to another.

> **Key idea**
>
> **Content hashing beats invalidation.** Name assets `app.9f2a1c.js` and serve them with `Cache-Control: public, max-age=31536000, immutable`. A deploy is then a new URL, old objects can be cached forever, and no purge is ever required. Reserve short TTLs for the HTML that references them.

<a id="33-cloud-networking"></a>

## 33. Cloud Networking

Cloud networking is the same set of concepts with new names and one important difference: everything is an API call, and almost everything is **deny by default**.

| Cloud concept | Is really | Watch out for |
| --- | --- | --- |
| VPC | a private address space you own | CIDR cannot be shrunk; overlapping ranges block peering forever |
| Subnet | a per-AZ slice of the VPC | Cannot be resized; the provider reserves ~5 addresses in each |
| Route table | a routing table | "Public subnet" simply means it has a route to the internet gateway |
| Security group | a stateful per-instance firewall | Stateful: allow inbound and the reply is automatically permitted |
| Network ACL | a stateless per-subnet filter | **Stateless**: you must also allow the ephemeral return ports |
| NAT gateway | source NAT for private subnets | Per-destination port limits; and you pay per GB processed |
| VPC endpoint / PrivateLink | a private path to a managed service | Bypasses NAT entirely — cheaper and removes a shared bottleneck |
| Peering / Transit Gateway | routing between VPCs | Peering is not transitive; overlapping CIDRs cannot be peered |

> **Key idea**
>
> The stateful/stateless distinction causes more cloud debugging time than anything else. **Security groups are stateful** — allow inbound 443 and responses flow back automatically. **Network ACLs are stateless** — allow inbound 443 and the reply from an ephemeral port is still blocked unless you allow 1024–65535 outbound. A connection that establishes but returns nothing is very often exactly this.

> **Tip**
>
> Cloud connectivity debugging ladder: is there a **route** to the destination? Does the **security group** allow it in *and* the source group allow it out? Does the **NACL** allow both directions including return ports? Is the instance in a subnet with an internet or NAT route at all? Managed tools (VPC Reachability Analyzer, flow logs) answer all four faster than any packet capture.

Container networking adds one more layer: each pod gets its own address, a `Service` is a virtual IP implemented with iptables or IPVS rules (this is destination NAT), and cluster DNS resolves service names. When a pod cannot reach a service, the ladder is the same one — DNS, then routing, then the network policy that is quietly denying the traffic.

<a id="34-security"></a>

## 34. Network Security

Every protocol so far was designed for a network of trusted academics. Security has been retrofitted, which is why the assumption to work from is: **the network is hostile, so authenticate and encrypt at the application layer**.

| Attack | Exploits | Defence |
| --- | --- | --- |
| ARP spoofing | ARP has no authentication | Dynamic ARP inspection; TLS everywhere |
| DNS cache poisoning | UDP is trivially forged | Source-port randomisation, DNSSEC, DoT/DoH |
| SYN flood | half-open connections consume state | SYN cookies (state-free handshakes) |
| Amplification DDoS | UDP services reply larger than the query | Ingress filtering (BCP 38); do not expose open resolvers |
| BGP hijack | announcements are believed | RPKI origin validation, prefix filters |
| TLS stripping | the first request is plaintext | HSTS, and preload lists |
| Request smuggling | proxy and backend disagree on framing | Reject ambiguous length/chunked combinations |
| SSRF | the server will fetch any URL you give it | Allow-list destinations; block link-local metadata addresses |

> **Warning**
>
> **Firewalls: drop versus reject.** A rejected packet produces an immediate "connection refused"; a dropped packet produces a timeout. Dropping hides the service from scanners but makes every client wait out its full timeout — including your own health checks. Choose deliberately, and remember the diagnostic value: *refused means something answered, timeout means silence*.

The direction of travel is **zero trust**: stop treating "inside the network" as an authorisation decision. Authenticate every request with mTLS or a signed token, authorise per identity rather than per subnet, and encrypt internal traffic. Network position becomes one signal among several rather than the whole security model.

<a id="35-performance-debugging"></a>

## 35. Performance Debugging Playbook

Start by locating the time. Every request is DNS + connect + TLS + server + transfer, and the answer is usually obvious once those five numbers are separated.

> **Interactive animation:** `packet-journey` — rendered by the page script in the HTML version.

**The ladder, in order**

```bash
# 1. split the request into phases - do this FIRST, it usually ends the search
curl -sS -o /dev/null -w \
 'dns %{time_namelookup}  tcp %{time_connect}  tls %{time_appconnect}
ttfb %{time_starttransfer}  total %{time_total}\n' https://api.example.com/health

# 2. is the path lossy? only loss that persists to the FINAL hop counts
mtr -rwc 100 api.example.com

# 3. is TCP struggling? retransmissions, rtt variance, cwnd
ss -ti state established '( dport = :443 )'
nstat -az | grep -E 'TcpRetransSegs|TcpExtTCPLostRetransmit|ListenOverflows'

# 4. is the server even accepting? Recv-Q on a LISTEN socket = unaccepted backlog
ss -lnt

# 5. interface-level errors: drops and overruns mean the NIC or queue is the problem
ip -s link show eth0

# 6. when nothing else agrees, look at the wire
sudo tcpdump -ni any -c 200 'host api.example.com and port 443'
```

```python
import socket, ssl, statistics, time

def phase_timings(host: str, port: int = 443, samples: int = 5) -> dict:
    """Measure each phase separately - an average hides the phase that matters."""
    results = {"dns": [], "tcp": [], "tls": [], "ttfb": []}

    for _ in range(samples):
        t0 = time.perf_counter()
        addr = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)[0][4]
        t1 = time.perf_counter()

        sock = socket.create_connection(addr, timeout=5)
        t2 = time.perf_counter()

        tls = ssl.create_default_context().wrap_socket(sock, server_hostname=host)
        t3 = time.perf_counter()

        tls.sendall(f"GET / HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n".encode())
        tls.recv(1)
        t4 = time.perf_counter()
        tls.close()

        for key, value in zip(results, (t1 - t0, t2 - t1, t3 - t2, t4 - t3)):
            results[key].append(value * 1000)

    return {k: round(statistics.median(v), 1) for k, v in results.items()}

print(phase_timings("example.com"))   # {'dns': 21.4, 'tcp': 84.2, 'tls': 91.7, 'ttfb': 88.9}
# tcp ~= tls ~= ttfb ~= one RTT each -> this is a DISTANCE problem, not a server problem
```

> **Key idea**
>
> Read the phase numbers as a shape, not as values. **DNS large** → resolver, not your service. **TCP ≈ TLS ≈ TTFB ≈ one RTT each** → you are paying for distance; add a CDN or reuse connections. **TTFB large, everything else small** → it really is your application. **Total large but TTFB small** → transfer, so look at response size, slow start and window.

<a id="36-cheat-sheet"></a>

## 36. Cheat Sheet

| Number | Value | Why it matters |
| --- | --- | --- |
| Speed in fibre | ~200 km/ms | The floor on any latency budget |
| Ethernet MTU | 1500 B (TCP MSS 1460) | Tunnels reduce it; ICMP must not be blocked |
| Header overhead | 54 B (Eth+IP+TCP) | Why small packets are inefficient |
| Initial cwnd | 10 segments ≈ 14 KB | First response under 14 KB arrives in one RTT |
| Ephemeral ports | ~28,000 | Client-side connection limit per destination |
| TIME_WAIT | ~60 s | Held by whoever closes first |
| Minimum RTO | 200 ms (Linux) | The p99 spike you keep seeing |
| Delayed ACK | up to 40 ms | The Nagle interaction stall |
| Cloud NAT idle timeout | ~350 s | Set keep-alives below it |
| TLS 1.3 handshake | 1 RTT (0 resumed) | TLS 1.2 costs 2 |

**Commands worth memorising**

```bash
ip -brief addr ; ip route ; ip neigh          # my address, my routes, my neighbours
ip route get 1.1.1.1                          # which route actually wins?
ss -tulpn                                     # what is listening, and as which process
ss -ti state established                      # per-connection rtt, cwnd, retransmits
dig +short example.com ; dig +trace example.com
curl -sS -o /dev/null -w '%{time_connect} %{time_appconnect} %{time_total}\n' URL
nc -vz host 443                               # refused (RST) vs timeout (dropped)
mtr -rwc 50 host                              # sustained loss to the FINAL hop only
ping -M do -s 1472 host                       # path MTU probe
sudo tcpdump -ni any 'host X and port 443'    # the ground truth
openssl s_client -connect host:443 -servername host   # certificate chain as served
```

<a id="37-pattern-playbook"></a>

## 37. Pattern-Recognition Playbook

| Symptom | Almost always | Confirm with |
| --- | --- | --- |
| Connection refused, instantly | Nothing listening, or bound to 127.0.0.1 | `ss -tulpn` on the target |
| Connection timed out | Packets dropped — firewall, security group, wrong route | `tcpdump` at both ends: did it arrive? |
| Works by IP, fails by name | DNS only | `dig` authoritative vs resolver |
| Handshake fine, big responses hang | MTU black hole (tunnel + ICMP blocked) | `ping -M do -s ...` |
| p99 = 200 ms / 1 s / 3 s exactly | TCP retransmission timeout and backoff | `ss -ti` retrans counters |
| Exactly 40 ms stalls | Nagle + delayed ACK | Two writes per message in the code |
| Throughput capped, link idle | Window < bandwidth-delay product | Compute BDP; check window scaling |
| Idle connections die overnight | NAT or load-balancer idle timeout | Enable keep-alives below the timeout |
| "Cannot assign requested address" | Ephemeral port exhaustion from churn | `ss -tan \| grep -c TIME-WAIT` |
| Random resets under load | Accept queue overflow | `ss -lnt`, `ListenOverflows` |
| Cert works in browser, fails in code | Missing intermediate in the served chain | `openssl s_client -showcerts` |
| Establishes but no data returns | Stateless NACL blocking the return ports | Check ephemeral range outbound |
| Fast download destroys call quality | Bufferbloat on the uplink | Latency under load; fq_codel |
| Slow only for one region | Distance / no local edge | Phase timings from that region |

<a id="38-practice-roadmap"></a>

## 38. Practice Roadmap

Reading about networks does not build the intuition; watching your own packets does. In rough order of value:

1. **Capture a page load.** Run Wireshark, load a site, and find the DNS query, the TCP handshake, the TLS handshake and the first HTTP request. Twenty minutes here is worth a chapter.
2. **Break something on purpose.** Use `tc netem` to add 100 ms of delay and 1% loss to your loopback, then watch how your application behaves. Almost every timeout bug you will ever hit is reproducible this way.
3. **Subnet on paper.** Plan a three-AZ VPC without a calculator, then check it with the `ipaddress` module. Do it until the /24-to-/30 ladder is automatic.
4. **Write a length-prefixed protocol** over raw TCP, and make it survive partial reads, a peer that disappears, and a message that arrives in three chunks.
5. **Measure the bandwidth-delay product** of a real path with `iperf3`, then change the window and predict the result before you measure it.
6. **Read one production incident report** that involved DNS, BGP or MTU. The public post-mortems from large providers are the best networking case studies available.

> **Interview**
>
> **If you remember five things:** layering means the outermost header is local and the innermost is end to end; longest prefix match decides every route; a connection is state in two kernels identified by a four-tuple; throughput is window ÷ RTT while latency is round trips × distance; and when it breaks, debug bottom up — refused and timed out are different bugs.

Related reading on this site: the [Networking Crash Course](networking-crash-course.html) for a faster pass over the same ground, the [OS Detailed Course](../os/os-detailed-course.html) for the kernel side of sockets and interrupts, and the [Networking catalog](networking-courses.html) for everything in this topic.

---

TechToday Study Library — Computer Networking
