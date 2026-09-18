<!--
Source: os-crash-course.html
Title: Operating Systems Crash Course | TechToday
Description: A visual crash course in operating systems — processes, threads, scheduling, virtual memory, locks, deadlock, file systems and I/O, each explained with a mental model, an animation, and code in Python and C.
Theme-color: #0b0d10
Stylesheets: os-study.css, ../../site-header.css
Scripts: os-study.js
-->

Navigation: [TechToday](../../index.html) · [← OS Courses](os-courses.html)

<a id="os-crash-course"></a>

# Operating Systems

An operating system is the program that lies to every other program — and the lies are so consistent that we call them abstractions. This page takes the dozen ideas you actually meet at work, gives each one a picture you already have in your head, and then shows the machinery underneath. Press **Play** on any animation to watch the idea move.

> **Key idea**
>
> The whole subject answers one question: **how do you let many untrusting programs share one machine, without any of them noticing, breaking each other, or bringing the machine down?** Every mechanism below — processes, virtual memory, scheduling, file systems — is one answer, and every one costs something. There is no free abstraction; there is only a bill you are willing to pay.

<a id="table-of-contents"></a>

## Table of Contents

1. [What an OS Actually Does](#0-what-an-os-actually-does)
2. [Processes](#1-processes)
3. [Threads](#2-threads)
4. [CPU Scheduling](#3-cpu-scheduling)
5. [The Address Space](#4-the-address-space)
6. [Virtual Memory & Paging](#5-virtual-memory)
7. [The Memory Hierarchy](#6-the-memory-hierarchy)
8. [Synchronisation](#7-synchronisation)
9. [Deadlock](#8-deadlock)
10. [Talking Between Processes](#9-talking-between-processes)
11. [Files & File Systems](#10-files-and-file-systems)
12. [I/O & Interrupts](#11-io-and-interrupts)
13. [Virtual Machines & Containers](#12-vms-and-containers)
14. [The Whole Thing on One Page](#13-the-whole-thing-on-one-page)

<a id="0-what-an-os-actually-does"></a>

## What an OS Actually Does

Before anything else you need one idea: **the CPU has two modes, and the boundary between them is the entire operating system**. In *user mode* your program can do arithmetic, call functions and touch its own memory. It cannot talk to a disk, map memory, or look at another process. In *kernel mode* everything is permitted. Your program crosses that boundary thousands of times a second, and every crossing is called a **system call**.

> **Analogy** 🏦
>
> **Picture it — the bank counter**
>
> You cannot walk into the vault. You fill in a slip, slide it under the glass, and a teller who *is* allowed in does the work and slides the result back. You never touch the money directly, you cannot see anyone else's account, and the teller checks every slip before acting on it. Your program is the customer; the kernel is the teller; the syscall is the slip.

Two facts follow immediately. First, the kernel is not "always running" — it is a library of handlers that runs *on your thread's time* when you call it, or on an interrupt when hardware demands it. Second, a program cannot choose where it lands inside the kernel: the `syscall` instruction jumps to an address the kernel registered at boot. That single restriction is the whole security model.

> **Interactive animation:** `syscall` — rendered by the page script in the HTML version.

- **Syscall round trip** `~1–2 µs`
- **Ordinary function call** `~1 ns`
- **Context switch** `~1–5 µs`
- **Page fault from SSD** `~100 µs`

Look at those numbers together and most performance advice you have ever read becomes obvious. A syscall is a thousand function calls. That is why buffered I/O exists, why `io_uring` exists, why logging line-by-line to a file is slow, and why a chatty microservice is slower than a monolith doing the same work.

<a id="what-the-kernel-gives-you"></a>

### The four abstractions

Everything in this course is one of four illusions, each hiding one scarce physical resource:

- **The process** — Hides the fact that there are only a handful of CPUs. Your program believes it has one all to itself.
- **The address space** — Hides physical memory. Your program believes it owns a private, contiguous range of addresses starting near zero.
- **The file** — Hides the disk — and the network, the terminal, the mouse. Everything becomes a stream of bytes you can `read` and `write`.
- **The thread** — Hides waiting. Blocking on I/O stops one thread, not the machine.

> **Tip**
>
> When you get stuck on an OS question, ask *which illusion is leaking?* A slow program is usually the CPU illusion leaking (you are queued behind others) or the memory illusion leaking (you are faulting to disk). A wrong answer under load is usually the thread illusion leaking (two threads met on one variable).

<a id="how-the-machine-gets-here"></a>

### How the machine gets into this state

None of the above exists when you press the power button. The CPU starts in a primitive mode with no paging, no protection and no notion of a file. Boot is a relay race in which each stage loads something more capable than itself and then steps aside.

> **Interactive animation:** `boot-sequence` — rendered by the page script in the HTML version.

> **Warning**
>
> **PID 1 is special.** The kernel starts exactly one user process and everything else on the machine descends from it by `fork()`. If PID 1 exits, the kernel panics. This is why a container whose main process crashes takes the container with it — inside the container, your process *is* PID 1.

---

<a id="unit-1"></a>

## Unit 1 — Running Programs

The first illusion: that your program has a CPU to itself. Three ideas build it — the process, the thread, and the scheduler that shuffles them.

<a id="1-processes"></a>

### Processes

- **Create (fork)** `~50–500 µs`
- **Isolation** `total`
- **Communication** `needs the kernel`

A **program** is a file on disk: dead bytes. A **process** is that program in motion — code plus its memory, its open files, its registers, its place in the queue. The same program run twice is two processes that share nothing.

> **Analogy** 🍰
>
> **Picture it — a recipe and a kitchen**
>
> The recipe is the program. Baking it is the process: you have your own bowl, your own oven shelf, your own half-mixed batter, and your own place in the sequence of steps. Two people baking the same recipe are two processes. Neither can knock over the other's bowl, and each must be told where they are up to if they leave the kitchen and come back.

The kernel tracks all of that in one structure, the **process control block** (on Linux, `task_struct`): PID, state, registers, page-table pointer, file descriptor table, parent, credentials, accounting. When people say "the kernel switched processes", they mean it saved one of these and loaded another.

<a id="the-five-states"></a>

#### The five states

At any instant a process is in exactly one state, and almost all of your intuition about performance comes from knowing which one.

> **Interactive animation:** `process-states` — rendered by the page script in the HTML version.

> **Key idea**
>
> Only two arrows in that diagram are the scheduler's *choice*: dispatch (ready → running) and preempt (running → ready). Every other transition is forced — by the program calling something blocking, or by hardware finishing something. When you tune a system you are almost always tuning how long processes sit in **ready**, or why they are sitting in **waiting**.

<a id="how-processes-are-born"></a>

#### How processes are born

Unix does something that looks bizarre until you see the reason: creating a process and running a program are *two separate calls*. `fork()` duplicates the caller. `exec()` throws the current program away and loads a new one in its place. Every shell command you have ever typed is `fork`, then `exec`, then `wait`.

> **Interactive animation:** `fork-exec` — rendered by the page script in the HTML version.

The gap between the two calls is the payoff. In that window the child is still the parent's code, so it can rearrange the world its new program will wake up in — redirect `stdout`, close descriptors, drop privileges, enter a namespace — and the new program needs to know nothing about it. That is how shell redirection, pipes and containers are all built out of the same two calls.

**Question**

*What does this program print, and how many times?*

The trap is that `fork()` returns twice: once in the parent with the child's PID, once in the child with `0`. Both halves continue from the same line, so everything after the call runs in duplicate unless you branch on the return value.

**fork, exec and wait**

```python
import os, sys

pid = os.fork()          # returns TWICE - once per process

if pid == 0:
    # child: replace this program entirely
    os.execvp("ls", ["ls", "-l"])
    sys.exit(1)          # only reached if exec failed
else:
    # parent: block until that specific child finishes
    _, status = os.waitpid(pid, 0)
    print("child exited with", os.WEXITSTATUS(status))

# Anything printed BEFORE the fork and buffered will appear twice,
# because the buffer itself was duplicated. Flush before forking.
```

```c
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    fflush(stdout);              /* or the buffer gets duplicated */
    pid_t pid = fork();

    if (pid < 0) {               /* out of PIDs or memory */
        perror("fork");
        return 1;
    }
    if (pid == 0) {              /* child */
        execlp("ls", "ls", "-l", NULL);
        perror("exec");          /* exec only returns on failure */
        _exit(1);
    }
    int status;
    waitpid(pid, &status, 0);    /* reap it, or it stays a zombie */
    printf("child exited with %d\n", WEXITSTATUS(status));
    return 0;
}
```

> **Warning**
>
> **Two classic bugs live in that snippet.** First, `printf` before `fork` without flushing duplicates the buffered text — the buffer is process memory and gets copied. Second, forgetting `wait` leaves a **zombie**: the process is dead but its exit status keeps a slot in the process table. A long-running parent that never reaps eventually exhausts the PID space.

> **Interview**
>
> **"Isn't copying the whole address space on `fork` ruinously expensive?"** It would be, so it does not happen. `fork` copies the page *table* and marks every page read-only in both processes; the first write to a page traps and copies just that page. A `fork` of a 4 GB Redis costs kilobytes. You will meet the mechanism in §5.

<a id="2-threads"></a>

### Threads

- **Create** `~10–30 µs`
- **Stack cost** `8 MB virtual, ~8 KB real`
- **Isolation** `none`

A process bundles two unrelated things: a container of resources, and a thing that executes. Threads split them. Several threads share one address space, one file table, one set of permissions — but each has its own stack, registers and program counter.

> **Analogy** 👩‍🍳
>
> **Picture it — three cooks, one kitchen**
>
> Same worktop, same fridge, same pans. Each cook has their own hands and their own place in their own recipe. They finish faster than one cook could — right up until two of them reach for the same knife, or one salts a pot the other already salted. Everything good and everything terrifying about threads is in that sentence.

> **Interactive animation:** `threads` — rendered by the page script in the HTML version.

- **Strength — cheap and instant sharing** — Passing a megabyte between threads costs a pointer. Between processes it costs a copy through the kernel.
- **Weakness — no protection** — One wild pointer in one thread corrupts the others and kills the whole process. Processes fail alone; threads fail together.

**Question**

*Two threads each increment a shared counter a hundred thousand times. What is the final value?*

Almost never 200,000. `counter += 1` is not one instruction — it is load, add, store, and a thread can be preempted between any two of them. Both threads read the same old value, both add one, both write the same new value, and one increment vanishes.

**The race, and the fix**

```python
import threading

counter = 0
lock = threading.Lock()

def bump_racy():
    global counter
    for _ in range(100_000):
        counter += 1              # load, add, store - three chances to be preempted

def bump_safe():
    global counter
    for _ in range(100_000):
        with lock:                # the three steps become indivisible
            counter += 1

threads = [threading.Thread(target=bump_safe) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)                    # 200000, every time

# Note: CPython's GIL makes the racy version *usually* correct, which is
# worse than always wrong - the bug survives your tests and appears in prod.
```

```c
#include <stdio.h>
#include <pthread.h>

static long counter = 0;
static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

static void *bump(void *arg) {
    for (int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&lock);
        counter++;                    /* critical section: keep it tiny */
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}

int main(void) {
    pthread_t a, b;
    pthread_create(&a, NULL, bump, NULL);
    pthread_create(&b, NULL, bump, NULL);
    pthread_join(a, NULL);
    pthread_join(b, NULL);
    printf("%ld\n", counter);         /* 200000 */
    return 0;
}
```

> **Warning**
>
> **Threads are not a way to make slow code fast.** They help when the work is genuinely parallel (multiple cores, CPU-bound) or genuinely blocking (waiting on I/O). They do not help a single-core, single-dependency chain, and they never help an algorithm that is `O(n²)` when it could be `O(n log n)`. Fix the algorithm first; concurrency multiplies constant factors, not complexity classes.

<a id="3-cpu-scheduling"></a>

### CPU Scheduling

- **Linux time slice** `~1–10 ms`
- **Switch cost** `~1–5 µs`
- **Cache re-warm** `often 10× the switch`

There are more runnable things than cores, so somebody must choose. The scheduler runs whenever a process blocks, exits, wakes, or has held the CPU too long, and answers one question: *who next?*

> **Analogy** ☕
>
> **Picture it — one barista, a queue, and a rule**
>
> Serve strictly in arrival order and the person ordering forty coffees blocks everyone behind them. Serve the quickest order first and the average wait drops — but the big order may never be served at all. Give everyone thirty seconds and pass the rest on, and nobody is stuck, but every switch costs you a moment of fumbling. Those three rules are FCFS, SJF and round robin, and the fumbling is the context switch.

Change the picker and nothing else, and the same four jobs finish in a completely different order with completely different average waits. Try each policy below.

> **Interactive animation:** `scheduling` — rendered by the page script in the HTML version.

| Policy | Picks | Good at | Fails when |
| --- | --- | --- | --- |
| FCFS | whoever arrived first | batch work, no starvation | one long job blocks everyone — the *convoy effect* |
| SJF / SRTF | the shortest remaining burst | provably the best average wait | you cannot know burst lengths; long jobs starve |
| Round robin | next in the queue, for one quantum | interactivity — everyone runs soon | quantum too small: all switching, no work |
| Priority | the most important arrived job | real-time and latency-critical work | starvation, unless you add ageing |
| MLFQ / CFS | whoever is furthest behind their fair share | mixed real workloads with no hints | needs tuning; can be gamed by yielding early |

Real systems do not use any of the textbook four directly. Linux's CFS — and its successor EEVDF — tracks how much CPU time each task has received relative to its weight and always runs the one that has fallen furthest behind. There is no fixed quantum: the slice shrinks as the number of runnable tasks grows, so latency stays bounded.

<a id="what-a-switch-costs"></a>

#### What a switch actually costs

> **Interactive animation:** `context-switch` — rendered by the page script in the HTML version.

> **Key idea**
>
> The register copy is the cheap half. The expensive half is invisible: the incoming process starts with the outgoing one's data still in L1, L2 and the TLB, and stalls on cache misses for thousands of cycles. This is why pinning threads to cores helps, why a thread pool sized to core count beats ten thousand threads, and why "just add more threads" eventually makes things slower.

**Question**

*Your service's p99 latency is terrible but every CPU sits at 40%. Where is the time going?*

Idle CPU with bad latency means your requests are not waiting for the CPU — they are in **waiting**, not **ready**. Something blocking is in the path: a synchronous disk write, a downstream call, a lock held across I/O, or a connection pool with fewer slots than concurrent requests. The scheduler is not your problem; find the blocking call.

**Looking at it on Linux**

```bash
# What state is each thread in?  R = running/ready, S = sleeping,
# D = uninterruptible sleep (almost always disk), Z = zombie.
ps -eLo pid,tid,stat,pcpu,wchan:24,comm | head -30

# Run-queue length. If 'r' is much larger than the core count you are
# CPU-starved; if 'b' is high you are blocked on I/O instead.
vmstat 1 5

# Involuntary switches = preemptions. A huge number means too many
# runnable threads for the cores you have.
pidstat -w -p <pid> 1 5

# Which syscall is a stuck thread sitting in?
strace -p <pid> -c -f
```

---

<a id="unit-2"></a>

## Unit 2 — Memory

The second illusion: that your program owns a private, contiguous, enormous block of memory. It owns none of those things.

<a id="4-the-address-space"></a>

### The Address Space

Every process sees the same layout: code at the bottom, then initialised data, then a heap that grows upward, then a huge gap, then a stack that grows downward from the top. Two processes can both hold a pointer to `0x400000` and be looking at entirely different bytes.

```text
high addresses
                ┌────────────────────────┐
                │ kernel (not yours) │ ← same in every process, unreachable in user mode
                ├────────────────────────┤
                │ stack ↓ │ ← locals, return addresses; grows down
                │ │
                │ (unmapped gap) │ ← touch this and you get SIGSEGV
                │ │
                │ heap ↑ │ ← malloc / new; grows up
                ├────────────────────────┤
                │ .bss (zeroed globals) │
                │ .data (initialised) │
                │ .text (your code) │ ← read-only and executable
                └────────────────────────┘
                low addresses (0x0 deliberately unmapped, so *NULL faults)
```

Why not just hand each process a real, contiguous slab of physical RAM? People tried. The result is **external fragmentation**: free memory exists but in the wrong shape.

> **Interactive animation:** `fragmentation` — rendered by the page script in the HTML version.

> **Key idea**
>
> The final frame is the pivotal idea of the whole unit. Instead of making memory fit the request, **chop everything into fixed-size pages and stop requiring contiguity**. External fragmentation then cannot happen, because every hole is exactly the size of every request.

<a id="5-virtual-memory"></a>

### Virtual Memory & Paging

- **Page size** `4 KB`
- **TLB hit** `~1 cycle`
- **TLB miss (page walk)** `~100 cycles`
- **Fault to SSD** `~100 µs`

Every address your program uses is **virtual**. Hardware — the memory management unit — translates it on every single access, using a per-process table the kernel maintains. This one indirection buys isolation, relocation, sharing, swapping and lazy allocation all at once.

> **Analogy** 🏨
>
> **Picture it — hotel room numbers**
>
> Every guest is told they are in room 1, 2, 3. The front desk keeps a private map from each guest's numbering to the actual doors, which are scattered across four floors. Guests never collide, the hotel can move you overnight without telling you, and two guests can be shown to the same room deliberately when they are meant to share. The map is the page table.

> **Interactive animation:** `page-translation` — rendered by the page script in the HTML version.

Note what the animation does *not* translate: the offset. Because pages are `2¹²` bytes, the low 12 bits pass straight through and only the top bits are looked up. That is the entire reason page sizes are powers of two.

<a id="the-page-fault"></a>

#### The page fault is a feature

When a page table entry says `valid = 0`, the hardware traps to the kernel. Beginners read that as an error; it is in fact the hook that makes most of the system work:

- **Lazy allocation**`malloc` of 1 GB touches no physical memory. Pages appear on first write.
- **Demand paging** — An executable is mapped, not loaded. Its pages arrive from disk as they are first executed.
- **Copy-on-write** — Shared pages are marked read-only; the first write makes a private copy.
- **Swapping** — A cold page is written to disk and its entry invalidated. Touching it brings it back.
- **mmap'd files** — File contents appear as memory. Reads fault the data in; the page cache and your address space are the same pages.
- **And the error case** — No mapping at all → `SIGSEGV`. Same mechanism, different verdict.

> **Interactive animation:** `copy-on-write` — rendered by the page script in the HTML version.

<a id="choosing-a-victim"></a>

#### When memory runs out, somebody must go

> **Interactive animation:** `page-replacement` — rendered by the page script in the HTML version.

> **Warning**
>
> **Thrashing** is what happens when the set of pages processes actively need exceeds physical memory. Every fault evicts a page that is about to be needed, so the machine spends all its time paging and almost none computing. The signature is unmistakable: CPU near zero, disk at 100%, load average climbing, everything unresponsive. The only real fixes are fewer processes or more RAM — you cannot schedule your way out of it.

**Interview question**

*Your process shows 12 GB of virtual memory but the machine has 8 GB of RAM and is not swapping. How?*

Because virtual size (`VSZ`) counts *reservations*, and resident size (`RSS`) counts real frames. Allocated-but-untouched pages, memory-mapped files, and shared libraries counted once per process all inflate `VSZ`. Only `RSS` consumes RAM — and even `RSS` over-counts, because shared pages are charged to every process that maps them.

**Seeing it yourself**

```python
import mmap, os

# Reserve 4 GiB of address space. This does NOT allocate 4 GiB of RAM -
# the mapping is anonymous and every page is copy-on-write from a shared
# zero page until something writes to it.
region = mmap.mmap(-1, 4 * 1024 ** 3)

def kb(field):
    for line in open("/proc/self/status"):
        if line.startswith(field):
            return line.split()[1]

print("VmSize", kb("VmSize"))     # ~4 GiB - the promise
print("VmRSS ", kb("VmRSS"))      # a few MB - the reality

region[0] = 1                     # one write -> exactly one page faults in
print("VmRSS ", kb("VmRSS"))      # up by 4 KB, not 4 GiB
```

```bash
# VSZ is the promise, RSS is the bill.
ps -o pid,vsz,rss,comm -p $$

# Every mapping, with its permissions and backing file.
cat /proc/$$/maps | head

# Per-mapping resident and *private* memory - the number that actually
# disappears when the process exits.
grep -E 'Rss|Pss|Private' /proc/$$/smaps_rollup

# Are we faulting from disk?  'majflt/s' above zero means real I/O.
pidstat -r -p $$ 1 3
```

<a id="6-the-memory-hierarchy"></a>

### The Memory Hierarchy

The OS spends enormous effort keeping your data near the top of a ladder whose rungs are orders of magnitude apart. Once you have internalised the distances, half of systems performance is obvious.

> **Interactive animation:** `memory-hierarchy` — rendered by the page script in the HTML version.

> **Key idea**
>
> Two properties make caching work at every level, and they are the same two: **temporal locality** (what you touched, you will touch again) and **spatial locality** (what is next to it, you will touch next). Iterating an array row-wise is fast and column-wise is slow for exactly this reason, and it is the same reason the page cache, the TLB, readahead and branch predictors all exist.

---

<a id="unit-3"></a>

## Unit 3 — Coordination

Once two things run at once, correctness stops being about your code and starts being about the interleavings your code allows.

<a id="7-synchronisation"></a>

### Synchronisation

A **race condition** is any situation where the result depends on timing. The cause is almost always the same: an operation that looks atomic in your source is several instructions in the machine, and a thread can be stopped between any two of them.

> **Interactive animation:** `race-condition` — rendered by the page script in the HTML version.

> **Analogy** 🚻
>
> **Picture it — the single-occupancy toilet**
>
> One room, one lock, one key. You do not negotiate with the queue and you do not check whether anyone is inside — you try the handle. If it is locked you wait; when the occupant leaves, the next person gets in. A mutex is that lock, the room is the critical section, and the cardinal sin is going in and never coming out.

| Primitive | Answers | Use when |
| --- | --- | --- |
| **Mutex** | "only one at a time" | protecting shared mutable state; the default choice |
| **Semaphore** | "at most N at a time" | counting a resource — free buffer slots, connection pool |
| **Condition variable** | "wait until this becomes true" | a thread must sleep until another changes state |
| **RW lock** | "many readers or one writer" | reads vastly outnumber writes *and* sections are long |
| **Atomic** | "this one word, indivisibly" | counters and flags — no kernel involvement at all |
| **Spinlock** | "busy-wait, do not sleep" | kernel code holding a lock for nanoseconds on another core |

> **Tip**
>
> A mutex that is contended puts the loser to *sleep*, which costs a syscall and a context switch — perhaps 2 µs. A spinlock burns the CPU instead. Spinning wins only when the expected wait is shorter than the switch, which in user space is almost never. Modern mutexes (futex, on Linux) spin briefly and then sleep, giving you both.

<a id="the-bounded-buffer"></a>

#### The pattern behind every queue

Producer–consumer over a bounded buffer is the single most reused concurrency shape in software: thread pools, log pipelines, Kafka consumers, socket backlogs, `asyncio` queues. Two counting semaphores and a mutex do all of it.

> **Interactive animation:** `producer-consumer` — rendered by the page script in the HTML version.

**Question**

*Why must the buffer be bounded at all — why not let the producer run free?*

Because an unbounded queue converts a throughput mismatch into a memory leak. If the producer is even 1% faster than the consumer, the queue grows without limit until the machine dies — and it dies *far* from the actual bug. A bounded buffer turns that into **back-pressure**: the producer blocks, the slowdown propagates upstream, and the system degrades instead of collapsing.

**Bounded buffer**

```python
import queue, threading, time

# maxsize is the whole point: put() blocks when the queue is full.
work = queue.Queue(maxsize=5)

def producer():
    for i in range(20):
        work.put(i)              # blocks once 5 items are outstanding
    for _ in range(2):
        work.put(None)           # one sentinel per consumer

def consumer():
    while (item := work.get()) is not None:
        time.sleep(0.05)         # deliberately slower than the producer
        print("handled", item)

threads = [threading.Thread(target=producer)] + \
          [threading.Thread(target=consumer) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join()
```

```c
#include <pthread.h>
#include <semaphore.h>

#define N 5
static int buf[N];
static int in = 0, out = 0;
static sem_t empty, full;                 /* counting: slots and items  */
static pthread_mutex_t mtx = PTHREAD_MUTEX_INITIALIZER;

static void *producer(void *arg) {
    for (int i = 0; i < 20; i++) {
        sem_wait(&empty);                 /* claim a free slot          */
        pthread_mutex_lock(&mtx);         /* THEN take the mutex        */
        buf[in] = i; in = (in + 1) % N;
        pthread_mutex_unlock(&mtx);
        sem_post(&full);                  /* announce an item           */
    }
    return NULL;
}

static void *consumer(void *arg) {
    for (int i = 0; i < 20; i++) {
        sem_wait(&full);
        pthread_mutex_lock(&mtx);
        int v = buf[out]; out = (out + 1) % N;
        pthread_mutex_unlock(&mtx);
        sem_post(&empty);
        (void)v;
    }
    return NULL;
}

int main(void) {
    sem_init(&empty, 0, N);
    sem_init(&full, 0, 0);
    pthread_t p, c;
    pthread_create(&p, NULL, producer, NULL);
    pthread_create(&c, NULL, consumer, NULL);
    pthread_join(p, NULL);
    pthread_join(c, NULL);
    return 0;
}
```

> **Warning**
>
> **Swap those two lines and you deadlock.** If the producer takes the mutex *before* `sem_wait(empty)`, then when the buffer is full it falls asleep holding the mutex — and the consumer, which needs that mutex to drain anything, can never run. Order matters: always take the counting semaphore first, the mutex second.

<a id="8-deadlock"></a>

### Deadlock

Deadlock needs four conditions to hold simultaneously. Break any one and it becomes impossible.

1. **Mutual exclusion** — the resource cannot be shared.
2. **Hold and wait** — a process holds one resource while requesting another.
3. **No preemption** — the resource cannot be taken away by force.
4. **Circular wait** — a cycle of processes each waiting on the next.

> **Interactive animation:** `deadlock` — rendered by the page script in the HTML version.

> **Analogy** 🚦
>
> **Picture it — gridlock at a four-way junction**
>
> Four cars each edge into the box and each now blocks the one that would let them out. Nobody has crashed, nobody is at fault, and nobody can move. Only three things resolve it: don't enter the box unless your exit is clear (prevent hold-and-wait), agree a fixed order of precedence (prevent circular wait), or someone reverses (preemption).

- **Prevention — lock ordering** — Number every lock; always acquire in increasing order. Kills circular wait, costs nothing, and is what real code does.
- **Prevention — try-lock with backoff**`trylock` the second lock; release everything and retry on failure. Kills hold-and-wait.
- **Avoidance — Banker's algorithm** — Grant a request only if the system stays in a safe state. Beautiful, and requires knowing every process's maximum need in advance, so effectively unused.
- **Detection and recovery** — Let it happen, find the cycle, kill a victim. This is what databases do — and why your transaction sometimes returns "deadlock detected, retry".
- **The ostrich algorithm** — Ignore it. Reboot when it happens. Genuinely the right call for rare deadlocks in non-critical software, and what general-purpose OSes actually do.

> **Interview**
>
> **"How would you debug a hung service?"** Take a thread dump (`jstack`, `py-spy dump`, `gdb thread apply all bt`) and look at what each thread is blocked on. Deadlock shows up instantly as two threads each waiting on a lock the other holds. If instead every thread waits on the same external call, it is not deadlock — it is a missing timeout, which is far more common in practice.

<a id="9-talking-between-processes"></a>

### Talking Between Processes

Isolation is the point of a process, so any communication has to be deliberate and has to go through the kernel. The mechanisms differ mostly in *how many copies* the data makes.

| Mechanism | Shape | Copies | Reach for it when |
| --- | --- | --- | --- |
| **Pipe** | byte stream, one direction | 2 | parent to child; shell pipelines |
| **Named pipe (FIFO)** | byte stream, via a path | 2 | unrelated processes on one machine |
| **Unix domain socket** | stream or datagram, bidirectional | 2 | the default for local IPC — can pass file descriptors |
| **TCP socket** | stream over a network | 2+ | the processes may be on different machines |
| **Shared memory** | a shared page mapping | 0 | bulk data, lowest possible latency — you supply the locking |
| **Signal** | one integer, asynchronous | — | notification only; not for data |

> **Key idea**
>
> **Shared memory is the only zero-copy option, and the only one with no built-in synchronisation.** Everything else is a queue with a kernel in the middle doing the ordering for you. That is the trade in one line: pay for copies and get correctness, or take the speed and own the locking yourself.

**Question**

*What actually happens when you type `ls | wc -l`?*

The shell creates a pipe — a kernel buffer with two descriptors — then forks twice. In each child it uses `dup2` to point `stdout` (or `stdin`) at the pipe end *before* calling `exec`, so both programs run completely unaware they are in a pipeline. Closing the unused ends matters: `wc` only sees end-of-file when the *last* writing descriptor closes, so a forgotten copy in the parent hangs the pipeline forever.

**Building a pipeline by hand**

```python
import os

r, w = os.pipe()                  # r and w are plain file descriptors

if os.fork() == 0:                # child 1: becomes `ls`
    os.close(r)                   # it never reads
    os.dup2(w, 1)                 # its stdout IS the pipe now
    os.close(w)
    os.execvp("ls", ["ls"])

if os.fork() == 0:                # child 2: becomes `wc -l`
    os.close(w)                   # it never writes
    os.dup2(r, 0)                 # its stdin IS the pipe
    os.close(r)
    os.execvp("wc", ["wc", "-l"])

os.close(r); os.close(w)          # ESSENTIAL: while the parent still holds
os.wait(); os.wait()              # the write end, wc never sees EOF
```

```bash
# The same thing, with the shell doing the work.
ls | wc -l

# Watch the descriptors the shell set up for a running pipeline:
ls /proc/$$/fd -l

# A pipe is a fixed-size kernel buffer (64 KB by default). Fill it
# without a reader and the writer blocks - that is back-pressure again.
yes | head -1   # head exits, yes gets SIGPIPE, the pipeline ends cleanly
```

---

<a id="unit-4"></a>

## Unit 4 — The Outside World

Everything so far happened inside the machine. Now the parts that touch storage, devices and other machines — all of them, in Unix, pretending to be files.

<a id="10-files-and-file-systems"></a>

### Files & File Systems

A file is the OS's second great lie: a named, arbitrarily long, byte-addressable stream, built on a device that only understands fixed-size blocks at fixed addresses. The structure that maintains the fiction is the **inode**.

> **Interactive animation:** `inode` — rendered by the page script in the HTML version.

> **Key idea**
>
> The inode holds everything about a file *except its name*. A directory is simply a file whose contents are (name → inode number) pairs. That one design decision explains hard links (two names, one inode, one link count), why renaming within a file system is instant regardless of file size, and why deleting an open file frees nothing until the last descriptor closes.

<a id="the-descriptor-chain"></a>

#### What a file descriptor really is

```text
your process the kernel the file system
                ┌───────────┐ ┌──────────────────┐ ┌────────────┐
                │ fd 0 ─────┼──────▶│ open file entry │──────▶│ inode 8421 │
                │ fd 1 ─────┼──────▶│ offset, flags │ │ size, mode │
                │ fd 3 ─────┼──┐ └──────────────────┘ │ blocks[] │
                └───────────┘ │ ▲ └────────────┘
                │ │ ▲
                └────────────────────┘ (dup2 shares this) │
                (a second open() makes a new entry pointing here)
```

Three levels, and each one explains a behaviour. `dup2` makes two descriptors share an *open file entry*, so they share the offset — that is why `ls > f` and `echo >> f` behave differently. Two separate `open()` calls make two entries with independent offsets pointing at the same inode. And the inode's link count is what actually decides when the blocks are freed.

- **The page cache is not optional** — Ordinary reads and writes go through RAM. A "write" returns once the data is in a dirty page, not once it is on the disk.
- **Which is why `fsync` exists** — Until `fsync` returns, a power cut loses your data. Databases call it constantly and it dominates their write latency.
- **Journalling** — Write your intent to a log first, then do the work. After a crash, replay the log. This is why `ext4` mounts in seconds instead of running `fsck`.
- **Everything is a file**`/proc`, `/sys`, pipes, sockets, devices — all reachable through `open`/`read`/`write`/`close`. One interface, dozens of implementations.

**Question**

*You delete a 40 GB log file with `rm`, but `df` still shows the disk full. Why, and what do you do?*

Because `rm` removes a *name*, not a file. The inode's link count drops to zero, but a process still holds an open descriptor, so the kernel keeps the blocks alive until that descriptor closes. Restart or signal the holder — or, if you cannot, truncate the file through `/proc/<pid>/fd/<n>` to reclaim the space immediately.

**Finding the culprit**

```bash
# Files that are deleted but still open - the classic "df and du disagree".
lsof +L1

# Or, straight from the process:
ls -l /proc/1234/fd | grep deleted

# Reclaim the space without restarting the process:
: > /proc/1234/fd/7

# Proof that names are cheap and inodes are the real file:
echo hello > a; ln a b        # one inode, two names
stat -c '%h %i %n' a b        # same inode number, link count 2
rm a; cat b                   # still there - link count is now 1
```

<a id="11-io-and-interrupts"></a>

### I/O & Interrupts

Devices are thousands to millions of times slower than the CPU, so the OS never waits for them by asking. It asks the device to speak up when it is ready. That is an **interrupt**: the hardware's way of calling a function inside the kernel.

> **Interactive animation:** `interrupt` — rendered by the page script in the HTML version.

> **Tip**
>
> Interrupt handlers run with interrupts disabled on that core, so they must be short. Linux splits them in two: a *top half* that acknowledges the device and queues work, and a *bottom half* (softirq, tasklet or kernel thread) that does the real processing later with interrupts enabled. When a NIC delivers millions of packets a second, even this is too expensive — so the driver switches to **polling** (NAPI) under load, which is the one case where busy-waiting wins.

Above the interrupt sits scheduling of the requests themselves. On a spinning disk the arm movement dominates everything, so the order you serve requests in changes throughput by a factor of three.

> **Interactive animation:** `disk-scheduling` — rendered by the page script in the HTML version.

> **Warning**
>
> **None of that applies to an SSD.** There is no arm, so "seek distance" is meaningless and reordering buys nothing but latency. The correct I/O scheduler for NVMe on Linux is usually `none`. Carrying spinning-disk intuition onto flash is one of the most common sources of confidently wrong performance advice.

<a id="blocking-vs-async"></a>

#### Blocking, non-blocking, and the event loop

- **Blocking** — One thread per connection. Simple, and the thread sleeps for free — but 10,000 connections means 10,000 stacks and a scheduler full of them.
- **Non-blocking + readiness**`epoll`/`kqueue`: ask the kernel "which of these 10,000 descriptors can move now?", then do only that work. One thread, one core, enormous concurrency.
- **Completion-based**`io_uring`/IOCP: submit the operation, get told when it is *done*. Fewer syscalls still, because submissions and completions are shared ring buffers.
- **The rule** — Blocking threads for CPU-bound work, event loops for connection-bound work. Mixing them — a blocking call inside an event loop — stalls every other connection on that thread.

<a id="12-vms-and-containers"></a>

### Virtual Machines & Containers

The OS virtualises the CPU and memory for processes. Two technologies push the same idea one level further — and they are far less similar than the marketing suggests.

*Diagram labels:* virtual machines · containers · app A · app B · guest kernel · guest kernel · hypervisor · host kernel · hardware · app A · app B · namespaces · namespaces · one shared host kernel · hardware · boots in seconds · isolates completely · starts in milliseconds · shares the kernel

*The whole difference is the middle row: a VM brings its own kernel, a container borrows the host's. Everything else — startup time, memory overhead, blast radius — follows from that one fact.*

A container is not a lightweight VM. It is an ordinary Linux process with three kernel features applied to it:

1. **Namespaces** — change what the process can *see*. Separate PID, mount, network, user, UTS and IPC views. Inside its PID namespace your process is PID 1, which is why it must handle signals and reap children like an init system.
2. **cgroups** — limit what it can *use*. CPU shares, memory ceiling, I/O bandwidth. Exceed the memory limit and the kernel OOM-kills your process, which is what an exit code of 137 means.
3. **Union file system** — layered, copy-on-write images. The same paging idea applied to files: share the read-only layers, copy a file only when written.

> **Interview**
>
> **"Why is a container not a security boundary in the way a VM is?"** Because every container on a host talks to the *same kernel*. One kernel vulnerability reachable through a syscall is a route out of every container on that machine. A VM guest would have to break its kernel *and* the hypervisor. This is exactly why `gVisor`, Kata Containers and Firecracker microVMs exist — they reinsert a boundary while keeping container ergonomics.

---

<a id="13-the-whole-thing-on-one-page"></a>

## The Whole Thing on One Page

<a id="the-numbers"></a>

### The numbers worth memorising

| Operation | Cost | Which means |
| --- | --- | --- |
| Function call | `~1 ns` | free; never optimise this first |
| L1 cache hit | `~1 ns` | locality is worth designing for |
| Main memory | `~100 ns` | a cache miss costs 100 instructions |
| System call | `~1–2 µs` | batch them; buffer your I/O |
| Context switch | `~1–5 µs` | plus cache damage; size pools to cores |
| Mutex, uncontended | `~20 ns` | locking is cheap; *contention* is not |
| Mutex, contended | `~2 µs` | a sleep and a wake — shrink the critical section |
| SSD random read | `~100 µs` | a page fault to disk is 1000 memory accesses |
| Disk seek | `~10 ms` | sequential beats random by orders of magnitude |
| Cross-region round trip | `~150 ms` | no amount of tuning beats fewer round trips |

<a id="the-mechanisms"></a>

### Every mechanism, one line each

| Mechanism | Hides | Trick | Cost |
| --- | --- | --- | --- |
| Process | having few CPUs | save and restore state | switch time, memory per process |
| Thread | waiting | share everything but the stack | no isolation; races |
| Scheduler | the queue | preempt on a timer | switch overhead, cold caches |
| Virtual memory | physical RAM | translate every address | TLB misses, page faults |
| Demand paging | slow loading | fault the page in on first touch | latency spikes; thrashing |
| Copy-on-write | the cost of `fork` | share read-only, copy on write | a fault per first write |
| Page cache | disk latency | keep file blocks in RAM | data loss without `fsync` |
| File | blocks and devices | inode plus a byte-stream API | indirection, metadata I/O |
| Interrupt | slow devices | let hardware call the kernel | storms; handlers must stay short |
| Mutex | interleaving | make a section indivisible | contention, deadlock |
| Container | the rest of the machine | namespaces plus cgroups | shared kernel, weaker boundary |

<a id="diagnose-anything"></a>

### Diagnose almost anything in four questions

1. **Is it running or waiting?** High CPU means you are compute-bound: profile the code. Low CPU with bad latency means you are blocked: find the syscall.
2. **If waiting, on what?** `D` state is disk. `S` with a socket in `wchan` is the network. A lock shows up in a thread dump.
3. **If running, is it doing useful work?** Check `majflt` (paging), `cs` (switching) and cache misses in `perf stat` before you blame the algorithm.
4. **Is the answer wrong only under load?** Then it is a race, and no amount of reading the happy path will find it. Look for shared mutable state without a lock.

> **Key idea**
>
> Almost every OS mechanism in this course is one of three moves: **add a level of indirection** (page tables, file descriptors, the IDT), **cache the expensive thing** (TLB, page cache, dentry cache), or **do it lazily** (demand paging, copy-on-write, delayed allocation). Once you see those three, a mechanism you have never met becomes guessable.

<a id="where-next"></a>

### Where to go next

1. 📘 The [Operating Systems Detailed Course](os-detailed-course.html) — the same ground in 38 sections, from first principles: kernel architectures, the full scheduling family, page-table structure, classic synchronisation problems, journalling file systems, disk and SSD internals, security, and a Linux performance-debugging playbook.
2. 📚 Browse both guides in the [Operating Systems catalog](os-courses.html).
3. 📖 [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) — free, complete, and the best OS book written. Read the virtualisation part first.
4. 🧪 [MIT 6.1810 / xv6](https://pdos.csail.mit.edu/6.828/) — a real Unix kernel small enough to read in a weekend, with labs that make you implement the things on this page.
5. 🔍 [Brendan Gregg's Linux performance material](https://www.brendangregg.com/linuxperf.html) — the tools that turn all of this into evidence rather than opinion.

> *"An operating system is a collection of things that don't fit into a language. There shouldn't be one."* — Dan Ingalls. He was wrong, but understanding exactly why is a good test of whether this page landed.

---

TechToday Study Library — Operating Systems
