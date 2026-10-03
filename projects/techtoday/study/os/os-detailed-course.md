<!--
Source: os-detailed-course.html
Title: Operating Systems Detailed Course | TechToday
Description: A 40-section operating systems course from first principles — traps and system calls, processes and threads, the full scheduling family, virtual memory and page tables, synchronisation and deadlock, file systems, I/O, security, containers, and Linux performance debugging.
Theme-color: #0b0d10
Stylesheets: os-study.css, ../../site-header.css
Scripts: os-study.js
-->

Navigation: [TechToday](../../index.html) · [← OS Courses](os-courses.html)

<a id="os-detailed-course"></a>

# Operating Systems

Forty sections, ordered so that each one only depends on the ones before it. We start from a bare CPU with no protection, no memory translation and no notion of a file, and build up to a machine running thousands of isolated programs. Every section explains *why* the mechanism exists before showing what it does, because a mechanism without its problem is just trivia. Press **Play** on the animations.

> **Key idea**
>
> **New to this?** Read the [Operating Systems Crash Course](os-crash-course.html) first. It covers the same twelve core ideas with a mental model for each and takes an afternoon. This page assumes you want the machinery, the edge cases and the code.

<a id="table-of-contents"></a>

## Table of Contents

1. [What an Operating System Is](#1-what-an-operating-system-is)
2. [Kernel Mode, User Mode and the Trap](#2-kernel-mode-user-mode-and-the-trap)
3. [System Calls](#3-system-calls)
4. [Kernel Architectures](#4-kernel-architectures)
5. [The Boot Sequence](#5-the-boot-sequence)
6. [The Process Abstraction](#6-the-process-abstraction)
7. [Process States](#7-process-states)
8. [fork, exec and wait](#8-fork-exec-and-wait)
9. [Context Switching](#9-context-switching)
10. [Threads and Thread Models](#10-threads)
11. [Scheduling Goals and Metrics](#11-scheduling-goals)
12. [Classic Scheduling Algorithms](#12-classic-scheduling-algorithms)
13. [MLFQ and the Linux Scheduler](#13-mlfq-and-linux-cfs)
14. [Multiprocessor Scheduling](#14-multiprocessor-scheduling)
15. [Concurrency and Race Conditions](#15-concurrency-and-race-conditions)
16. [Locks](#16-locks)
17. [Semaphores and Condition Variables](#17-semaphores-and-condition-variables)
18. [Classic Synchronisation Problems](#18-classic-synchronisation-problems)
19. [Deadlock](#19-deadlock)
20. [Memory from First Principles](#20-memory-from-first-principles)
21. [Segmentation and Paging](#21-segmentation-and-paging)
22. [Page Tables and the TLB](#22-page-tables-and-the-tlb)
23. [Demand Paging](#23-demand-paging)
24. [Page Replacement](#24-page-replacement)
25. [Thrashing and the Working Set](#25-thrashing-and-the-working-set)
26. [Memory Allocators](#26-memory-allocators)
27. [The Memory Hierarchy and Caches](#27-the-memory-hierarchy)
28. [Inter-Process Communication](#28-inter-process-communication)
29. [Signals](#29-signals)
30. [Files, Directories and Descriptors](#30-files-and-descriptors)
31. [File System Implementation](#31-file-system-implementation)
32. [Crash Consistency and Journalling](#32-crash-consistency)
33. [The I/O Subsystem](#33-the-io-subsystem)
34. [Disks, SSDs and I/O Scheduling](#34-disks-and-ssds)
35. [Protection and Security](#35-protection-and-security)
36. [Virtualisation and Containers](#36-virtualisation-and-containers)
37. [Performance Debugging on Linux](#37-performance-debugging)
38. [Cheat Sheet](#38-cheat-sheet)
39. [Pattern-Recognition Playbook](#39-pattern-recognition-playbook)
40. [Practice Roadmap](#40-practice-roadmap)

<a id="unit-1"></a>

## Unit 1 — Foundations

The kernel's privileged role, and how programs cross into it.

<a id="1-what-an-operating-system-is"></a>

## 1. What an Operating System Is

Start from a machine with no operating system. You have a CPU that fetches and executes instructions, a block of RAM, and some devices attached to a bus. You can write a program that owns all of it. This is not hypothetical — it is how microcontrollers still work, and how every computer worked until the 1950s. It is fine as long as exactly one program runs, that program never crashes, and nobody minds that the CPU sits idle for milliseconds at a time whenever the program touches a disk.

All three assumptions fail as soon as the hardware becomes expensive enough to share. An operating system is what you are forced to write once you want several programs on one machine. It has exactly three jobs.

- **Abstraction** — Turn awkward hardware into a usable interface. Nobody wants to program a disk in terms of cylinders and sectors; they want `open`, `read`, `write`.
- **Arbitration** — Decide who gets the CPU, the memory, the disk bandwidth — and enforce that decision against programs that would happily take everything.
- **Isolation** — Ensure one program's bug or malice cannot corrupt, observe or crash another. This is the job that needs hardware help; the other two could be done by a library.

Notice that the three are in tension. Perfect isolation means no sharing, which is useless. Perfect abstraction hides the hardware so thoroughly that you cannot exploit it — which is why databases open files with `O_DIRECT` to bypass the page cache the OS worked hard to give them. Almost every design argument in this course is one of these three pulling against another.

<a id="1-1-the-illusions"></a>

### 1.1 The four illusions

Everything that follows is one of four fictions, each hiding one scarce physical thing:

| Illusion | Reality | Maintained by | Leaks as |
| --- | --- | --- | --- |
| "I have a CPU to myself" | a handful of cores, shared | the scheduler and the timer interrupt | latency under load |
| "I have private, contiguous memory" | scattered 4 KB frames, some on disk | the MMU and page tables | page faults, thrashing, OOM kills |
| "Files are byte streams" | fixed-size blocks on a device | the file system and page cache | data loss without `fsync`, `ENOSPC` |
| "Blocking is free" | a thread sleeps and something else runs | threads and interrupts | thread-pool exhaustion, races |

> **Key idea**
>
> When something is mysterious in production, the productive question is **which illusion is leaking?** Almost every incident you will debug is one of the four rows above showing through.

<a id="1-2-what-is-not-the-os"></a>

### 1.2 What is deliberately *not* the OS

The kernel is the part that runs privileged. A great deal of what people call "the operating system" is ordinary user-space software that could be replaced without touching the kernel: the shell, the window system, `systemd`, the C library, package managers, even most of the network stack in some designs. Keeping this line clear matters, because "add it to the kernel" is always the tempting answer and almost always the wrong one — kernel code has no memory protection, no ability to page, and a bug there takes the machine down rather than a process.

<a id="2-kernel-mode-user-mode-and-the-trap"></a>

## 2. Kernel Mode, User Mode and the Trap

Isolation cannot be built in software alone. If a program can execute any instruction it likes, it can simply write to the disk controller's registers, or rewrite the page tables, or disable the timer that would have preempted it. So the hardware provides a mode bit.

- **User mode** `ring 3`
- **Kernel mode** `ring 0`
- **Ways to cross** `3`

In **user mode** a set of instructions is simply illegal: loading the page-table base register, executing `hlt`, doing raw port I/O, changing the interrupt table. Attempting one raises an exception. In **kernel mode** everything is permitted. The mode bit lives in a CPU register that user code cannot write — otherwise the whole scheme would be one instruction away from defeat.

<a id="2-1-three-ways-in"></a>

### 2.1 The only three ways into the kernel

1. **System call** — the program asks. Deliberate and synchronous.
2. **Exception (fault)** — the program did something the hardware could not complete: a page fault, a divide by zero, an illegal instruction. Synchronous but unintentional.
3. **Interrupt** — a device wants attention. Asynchronous and unrelated to whatever was running.

All three funnel through the same machinery: the CPU saves a little state, switches to the kernel stack, sets the mode bit, and jumps to an address *the kernel chose in advance*. That last clause is the whole of protection. A program can decide *when* to enter the kernel; it can never decide *where*.

```text
user code running
                │
                ├── syscall instruction ──┐
                ├── page fault ───────────┤
                └── timer interrupt ──────┤
                ▼
                ┌────────────────────────────────┐
                │ hardware: push pc + flags │
                │ switch to kernel stack │
                │ set mode = kernel │
                │ jump to table[vector] │ ← the table was installed at boot
                └────────────────────────────────┘
                │
                ▼
                kernel handler runs, then iret/sysret back
```

<a id="2-2-the-trap-table"></a>

### 2.2 The trap table

At boot, before any user code exists, the kernel fills in the **interrupt descriptor table** and tells the CPU where it is. Each entry maps a vector number to a handler address and the privilege level required to invoke it. Vector 14 is the page fault; vector 32 and up are device interrupts; `syscall` uses a dedicated fast path through a model-specific register rather than the table on x86-64, precisely because it is the hot one.

> **Warning**
>
> The kernel switches to a **separate kernel stack** on every entry, and it must. If the handler ran on the user stack, a program could shrink that stack to nothing, trap, and make the kernel fault while trying to save state — or simply read the kernel's saved data afterwards. Each thread therefore has two stacks: one for user code, one for kernel code.

<a id="3-system-calls"></a>

## 3. System Calls

A system call is a function call whose implementation lives on the other side of a privilege boundary. The mechanics are worth knowing in detail, because the cost is the reason for an enormous amount of software design.

> **Interactive animation:** `syscall` — rendered by the page script in the HTML version.

<a id="3-1-the-calling-convention"></a>

### 3.1 The calling convention

On Linux x86-64: the call number goes in `rax`, arguments in `rdi, rsi, rdx, r10, r8, r9` (note `r10`, not `rcx` — `syscall` clobbers `rcx`), and the result comes back in `rax`. Errors are returned as small negative values, which the C library converts into `-1` plus `errno`.

**What read() compiles to**

```c
/* What glibc's read() reduces to, minus the error handling. */
static long sys_read(int fd, void *buf, unsigned long count) {
    long ret;
    __asm__ volatile (
        "syscall"
        : "=a" (ret)                      /* result comes back in rax   */
        : "a"  (0),                       /* __NR_read == 0             */
          "D"  (fd),                      /* rdi                        */
          "S"  (buf),                     /* rsi                        */
          "d"  (count)                    /* rdx                        */
        : "rcx", "r11", "memory");        /* clobbered by the trap      */
    return ret;                           /* < 0  means -errno          */
}
```

```python
import ctypes, os

libc = ctypes.CDLL("libc.so.6", use_errno=True)

# syscall(2) lets you invoke any call by number, bypassing the wrapper.
SYS_getpid = 39
print("via libc wrapper:", os.getpid())
print("via raw syscall :", libc.syscall(SYS_getpid))

# Errors come back as -1 with errno set, not as exceptions.
fd = libc.open(b"/definitely/not/here", os.O_RDONLY)
if fd == -1:
    print("errno:", os.strerror(ctypes.get_errno()))
```

<a id="3-2-the-cost"></a>

### 3.2 Why the cost matters so much

A syscall round trip is roughly `1–2 µs` — about a thousand times an ordinary function call. Worse, since Meltdown and Spectre the mitigations (page-table isolation, speculation barriers) roughly doubled it on many CPUs. That single number is the origin of:

- **Buffered I/O**`stdio`, `BufferedWriter`: batch a few kilobytes so one `write` replaces a thousand.
- **Vectored I/O**`readv`/`writev`: several buffers, one crossing.
- **Batched notification**`epoll_wait` returns many ready descriptors per call, unlike `select` which re-scans everything every time.
- **Shared-memory rings**`io_uring`: submissions and completions in memory both sides can see, so many operations need *zero* syscalls.
- **vDSO** — Calls that need no privilege at all — `gettimeofday`, `clock_gettime` — are mapped into your address space and never trap.

**Worked example**

*How much does one unbuffered write per line actually cost?*

Write a million lines two ways and count the syscalls. The buffered version issues roughly `total_bytes / 4096` calls; the unbuffered version issues one per line. The wall-clock difference is almost entirely boundary crossings, not the disk — the data goes to the page cache either way.

**Counting the crossings**

```python
import os, time

N = 200_000
line = b"the quick brown fox\n"

# 1. One write() syscall per line.
t = time.perf_counter()
fd = os.open("/tmp/unbuffered", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
for _ in range(N):
    os.write(fd, line)                      # ~200,000 syscalls
os.close(fd)
print("unbuffered", round(time.perf_counter() - t, 3), "s")

# 2. Buffered: the library batches into ~4 KB chunks.
t = time.perf_counter()
with open("/tmp/buffered", "wb") as f:
    for _ in range(N):
        f.write(line)                       # ~1,000 syscalls
print("buffered  ", round(time.perf_counter() - t, 3), "s")
```

```bash
# Count syscalls by name for any command:
strace -c -f python3 write_test.py

# Typical shape of the output - note the call counts, not the times:
# % time     seconds  usecs/call     calls    errors syscall
#  98.12    0.412000          2     200000           write
#   0.51    0.002100          2       1000           write   (buffered run)

# Per-second syscall rate of a running process:
perf stat -e 'syscalls:sys_enter_write' -p <pid> sleep 5
```

> **Interview**
>
> **"Is a system call a context switch?"** No, and the distinction is worth being precise about. A syscall is a *mode* switch: same process, same address space, same thread, higher privilege. A context switch replaces the running process entirely — different registers, different page tables. A syscall *may* lead to a context switch if it blocks, but most do not.

<a id="4-kernel-architectures"></a>

## 4. Kernel Architectures

Given that some code must run privileged, how much of it should? This is the oldest live argument in the field, and the answer is a trade between performance and fault isolation.

| Design | In kernel mode | Strength | Weakness | Examples |
| --- | --- | --- | --- | --- |
| **Monolithic** | scheduler, memory, file systems, drivers, network stack | fast — everything is a function call | a driver bug panics the machine; huge trusted base | Linux, BSD |
| **Microkernel** | IPC, scheduling, address spaces — nothing else | drivers are restartable processes; tiny trusted base | every interaction becomes message passing | seL4, QNX, MINIX 3 |
| **Hybrid** | microkernel structure, most services still privileged | pragmatic | the vocabulary of one, the trust base of the other | Windows NT, XNU |
| **Unikernel** | everything, but only one application | no protection needed, so no crossing cost | no isolation at all; one app per VM | MirageOS, IncludeOS |
| **Exokernel** | multiplexing only; abstractions live in libraries | applications tune their own policies | hard to program; largely a research line | MIT Exokernel |

Linux is monolithic but *modular*: drivers load and unload at runtime as `.ko` files. That gives the packaging convenience of a microkernel with none of the isolation — a loaded module runs with full privilege in the same address space as everything else. This is why an out-of-tree graphics driver can take down a machine that has never crashed otherwise.

> **Tip**
>
> The argument has quietly been settled by a third option: run the risky code in user space with a *fast* path back into the kernel. `FUSE` puts file systems in user space, `DPDK` and `io_uring` move I/O out of the syscall path, and **eBPF** lets you run verified, sandboxed programs *inside* the kernel without being able to crash it. eBPF is the most interesting thing to happen to kernel architecture in twenty years: safe extensibility without a mode switch.

<a id="5-the-boot-sequence"></a>

## 5. The Boot Sequence

Everything above assumes the kernel is already running with page tables built and a scheduler ticking. Getting there is a relay race in which each stage exists only to load something more capable than itself.

> **Interactive animation:** `boot-sequence` — rendered by the page script in the HTML version.

<a id="5-1-why-so-many-stages"></a>

### 5.1 Why so many stages

Each handoff exists because of a bootstrapping problem. The CPU can only start at a fixed physical address, so something must be at that address in ROM — but ROM is small and cannot know about your disks, so it loads a boot loader. The boot loader must read a kernel from a file system, but teaching it every file system is madness, so UEFI standardises on one (FAT) and everything else is deferred. The kernel then needs drivers to reach the real root file system, which may be on RAID, LVM or encrypted storage — but those drivers live *on* that file system. Hence the **initramfs**: a compressed archive unpacked into RAM containing exactly enough to mount the real thing.

> **Key idea**
>
> The pattern — "load something smarter than me, then get out of the way" — is worth recognising because it recurs everywhere: dynamic linkers, JIT compilers, container runtimes, and the two-stage `fork`/`exec` you will meet in §8.

<a id="5-2-pid-1"></a>

### 5.2 PID 1

The kernel creates exactly one user-space process. Everything else on the machine is a descendant of it via `fork`. PID 1 has two duties beyond starting services: it must never exit (the kernel panics if it does), and it must **reap orphans** — when any process dies leaving children, those children are re-parented to PID 1, which must call `wait` on them or the process table fills with zombies.

> **Warning**
>
> This is a real container bug, not a curiosity. Inside a container your application *is* PID 1. If it spawns children and does not reap them, zombies accumulate; if it does not handle `SIGTERM`, `docker stop` waits ten seconds and then kills it uncleanly. Use `--init`, or `tini`, or handle signals yourself.

**Looking at the tree**

```bash
# Everything descends from PID 1.
pstree -p 1 | head -20

# What the kernel was told at boot, and what it did about it:
cat /proc/cmdline
dmesg | head -40

# The kernel's own threads have no user memory - they show in brackets.
ps -eo pid,ppid,comm | awk '$2 == 2 || $1 == 2' | head

# Orphans get re-parented to PID 1 (or to the nearest subreaper):
bash -c 'sleep 60 & echo child $!; exit' ; sleep 1 ; ps -o pid,ppid,comm -C sleep
```

<a id="unit-2"></a>

## Unit 2 — Processes, Threads & Scheduling

The process abstraction, how the CPU is shared, and who runs next.

<a id="6-the-process-abstraction"></a>

## 6. The Process Abstraction

A process is the unit the kernel schedules resources onto and enforces isolation between. Concretely it is a bundle of five things:

1. An **address space** — the page table that defines which memory it can reach.
2. A **thread of execution** — registers, program counter, kernel stack. (Possibly several; see §10.)
3. A **file descriptor table** — small integers mapping to open files, sockets, pipes.
4. **Credentials** — user and group IDs, capabilities, namespaces, cgroup membership.
5. **Accounting and relationships** — PID, parent, children, CPU time used, signal handlers, exit status.

All of it lives in one kernel structure, the **process control block**. On Linux this is `struct task_struct`, which is around 3–7 KB and, characteristically, has one for every *thread* rather than every process — threads share pointers to the address space and descriptor table instead of having their own.

```text
struct task_struct {
                pid_t pid, tgid; // tgid is the "process id" userspace sees
                volatile long state; // running / interruptible / uninterruptible ...
                struct mm_struct *mm; // address space - SHARED between threads
                struct files_struct *files; // fd table - SHARED between threads
                struct signal_struct *signal; // signal handlers - SHARED
                struct thread_struct thread; // saved registers - PRIVATE
                void *stack; // kernel stack - PRIVATE
                struct task_struct *parent;
                struct list_head children, sibling;
                struct sched_entity se; // the scheduler's bookkeeping
                const struct cred *cred; // uid, gid, capabilities
                struct nsproxy *nsproxy; // namespaces - the container knob
                ...
                };
```

> **Key idea**
>
> Read that structure and the whole rest of the course is visible in outline. `mm` is §20–26. `files` is §30. `se` is §11–14. `signal` is §29. `nsproxy` is §36. A process is simply the sum of those pointers.

<a id="6-1-the-descriptor-table"></a>

### 6.1 The descriptor table

A file descriptor is an index into a per-process array. That indirection is why descriptors are small integers, why they are per-process (fd 3 means different things in different processes), and why `dup2(fd, 1)` can redirect output without the program noticing: you are overwriting slot 1 of an array, and the program only ever refers to the slot.

**Inspecting a live process**

```bash
# Everything in the PCB is exposed through /proc.
ls /proc/self/                    # one directory per process
cat /proc/self/status | head -20  # state, threads, memory, uid/gid
cat /proc/self/limits             # RLIMIT_NOFILE, stack size, core size
ls -l /proc/self/fd               # the descriptor table, as symlinks
cat /proc/self/cgroup             # which cgroup - i.e. which container
ls -l /proc/self/ns               # the namespaces it belongs to

# Threads of a process, each with its own task_struct:
ls /proc/self/task
```

```python
import os

print("pid      ", os.getpid())
print("parent   ", os.getppid())
print("uid/gid  ", os.getuid(), os.getgid())
print("cwd      ", os.getcwd())
print("open fds ", sorted(int(fd) for fd in os.listdir("/proc/self/fd")))

# Descriptors are inherited across fork() and (unless CLOEXEC) across exec().
# This is exactly how shell redirection survives into a program that
# knows nothing about it.
f = open("/tmp/out", "w")
print("fd number:", f.fileno(), "close-on-exec:", os.get_inheritable(f.fileno()))
```

<a id="7-process-states"></a>

## 7. Process States

The textbook model has five states. Linux adds a couple of distinctions that matter enormously in practice.

> **Interactive animation:** `process-states` — rendered by the page script in the HTML version.

| `ps` code | State | Meaning | What it tells you |
| --- | --- | --- | --- |
| `R` | running or runnable | on a CPU, or queued waiting for one | `ps` cannot distinguish the two — use run-queue length |
| `S` | interruptible sleep | waiting for an event; signals can wake it | normal blocking: sockets, sleeps, condition variables |
| `D` | uninterruptible sleep | in the middle of I/O; cannot be signalled | almost always disk or NFS. `kill -9` will not work |
| `T` | stopped | `SIGSTOP`, or under a debugger | Ctrl-Z, or someone attached `gdb` |
| `Z` | zombie | exited; exit status not yet collected | the parent is not calling `wait` |

> **Warning**
>
> **`D` state is the single most useful diagnostic in Linux.** A process stuck there is inside a driver, holding kernel resources, and cannot be killed — not even with `SIGKILL` — because there is no safe point to unwind from. Many processes in `D` plus a climbing load average with idle CPUs is the classic signature of a failing disk or a hung network file system. Load average on Linux counts `D` as well as `R`, which is why it can read 40 on a machine doing nothing.

<a id="7-1-the-load-average"></a>

### 7.1 What load average actually measures

On most Unixes, load average is the exponentially-weighted count of processes in `R`. On Linux it is `R` *plus* `D`. So a load of 8 on an 8-core box might mean perfect saturation, or it might mean one process computing and seven stuck on a dead NFS mount. The number alone is uninterpretable; you need the breakdown.

**Decomposing load**

```bash
uptime                                   # 1, 5, 15 minute averages

# Split it: how many are runnable (r) vs blocked (b)?
vmstat 1 5

# Who exactly is in D state right now, and in which kernel function?
ps -eo pid,stat,wchan:30,comm | awk '$2 ~ /^D/'

# Pressure Stall Information - far better than load average.
# "some avg10" = % of the last 10s in which at least one task was stalled.
cat /proc/pressure/cpu
cat /proc/pressure/io
cat /proc/pressure/memory
```

<a id="8-fork-exec-and-wait"></a>

## 8. fork, exec and wait

Unix separates "make a new process" from "run a new program". Almost every other system combines them (Windows' `CreateProcess` takes seventeen parameters for exactly this reason). The separation looks wasteful and is in fact the source of most of Unix's composability.

> **Interactive animation:** `fork-exec` — rendered by the page script in the HTML version.

<a id="8-1-what-fork-copies"></a>

### 8.1 What `fork` copies and what it shares

| Thing | After `fork` | Consequence |
| --- | --- | --- |
| Memory | logically copied, physically shared copy-on-write | cheap, until the child writes a lot |
| File descriptors | duplicated, pointing at the *same* open file entries | parent and child share the file offset |
| Signal handlers | copied | the child inherits your handlers, which is often wrong |
| Threads | **only the calling thread survives** | a mutex held by another thread stays locked forever |
| Locks and buffers | copied in whatever state they were in | unflushed `stdio` output appears twice |
| PID, parent, timers | new | the only reliable way to tell the halves apart |

> **Warning**
>
> **Forking a multithreaded process is a minefield.** Only the calling thread exists in the child, but all the memory — including mutexes other threads were holding — is duplicated in place. If another thread held the `malloc` arena lock at the moment of the fork, the child deadlocks the first time it allocates. POSIX's answer is that between `fork` and `exec` you may only call *async-signal-safe* functions. In practice: fork early, before you start threads, or use `posix_spawn`/`vfork` which never return to your code at all.

<a id="8-2-exec"></a>

### 8.2 `exec` replaces, it does not create

`execve` tears down the address space and builds a new one from an executable: map the segments, set up the stack with `argv` and `envp`, load the dynamic linker, jump to the entry point. What *survives* is the interesting part: the PID, the parent relationship, open descriptors (unless marked close-on-exec), the current directory, the user IDs, and resource limits. That survival list is precisely what makes shell redirection and containers work.

**A miniature shell**

```python
import os, shlex, sys

while True:
    try:
        line = input("mini$ ").strip()
    except EOFError:
        break
    if not line:
        continue

    # Support one level of output redirection: cmd > file
    argv = shlex.split(line)
    outfile = None
    if ">" in argv:
        i = argv.index(">")
        argv, outfile = argv[:i], argv[i + 1]

    pid = os.fork()
    if pid == 0:
        # We are the child, and still running shell code - this window is
        # the entire reason fork and exec are separate calls.
        if outfile:
            fd = os.open(outfile, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
            os.dup2(fd, 1)            # stdout now points at the file
            os.close(fd)
        try:
            os.execvp(argv[0], argv)  # never returns on success
        except FileNotFoundError:
            print(argv[0] + ": not found", file=sys.stderr)
        os._exit(127)                 # _exit, not exit: skip atexit handlers

    os.waitpid(pid, 0)                # reap, or accumulate zombies
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/wait.h>

int main(void) {
    char line[512];
    while (printf("mini$ "), fflush(stdout), fgets(line, sizeof line, stdin)) {
        line[strcspn(line, "\n")] = 0;
        if (!*line) continue;

        char *argv[32]; int argc = 0;
        for (char *t = strtok(line, " "); t && argc < 31; t = strtok(NULL, " "))
            argv[argc++] = t;
        argv[argc] = NULL;

        pid_t pid = fork();
        if (pid < 0) { perror("fork"); continue; }

        if (pid == 0) {                       /* child */
            execvp(argv[0], argv);
            fprintf(stderr, "%s: not found\n", argv[0]);
            _exit(127);                       /* _exit skips atexit/flush */
        }

        int status;
        waitpid(pid, &status, 0);
        if (WIFEXITED(status) && WEXITSTATUS(status))
            fprintf(stderr, "exit %d\n", WEXITSTATUS(status));
    }
    return 0;
}
```

<a id="8-3-zombies-and-orphans"></a>

### 8.3 Zombies and orphans

- **Zombie** — Child died, parent alive but not calling `wait`. Memory is freed but the PCB and exit status remain. Leaks process table entries; you cannot `kill` a zombie because it is already dead.
- **Orphan** — Parent died first. The child is re-parented to PID 1 (or the nearest `PR_SET_CHILD_SUBREAPER` ancestor), which reaps it. Harmless.
- **The fix** — Either `wait` properly, or handle `SIGCHLD`, or explicitly set `SIGCHLD` to `SIG_IGN` so the kernel reaps for you.

<a id="9-context-switching"></a>

## 9. Context Switching

A context switch is the mechanism that makes the CPU illusion possible: save enough state that a process can be resumed later as though nothing happened, then load somebody else's.

> **Interactive animation:** `context-switch` — rendered by the page script in the HTML version.

<a id="9-1-what-gets-saved"></a>

### 9.1 What gets saved

1. **Hardware, automatically** — program counter, flags, stack pointer, privilege level. Pushed by the trap itself.
2. **Kernel, explicitly** — general-purpose registers into the PCB.
3. **Lazily, if needed** — floating-point and vector registers (AVX-512 state alone is over 2 KB). The kernel marks them unavailable and only saves them if the new task actually uses them.
4. **Address space** — write the new page-table base to `cr3`. This is the expensive part.

<a id="9-2-the-hidden-cost"></a>

### 9.2 The cost you cannot see

The direct cost is 1–5 µs. The indirect cost is usually larger and never appears in a profiler as "context switch": the incoming process finds L1, L2 and the TLB full of the outgoing process's data, and stalls on misses for thousands of cycles while they refill. Before **PCID** tagging, every `cr3` write flushed the entire TLB; with PCIDs entries survive, but caches still cool down.

- **Voluntary switch** — The process blocked — it gave up the CPU. High counts mean I/O-bound work, which is usually fine.
- **Involuntary switch** — The process was preempted. High counts mean more runnable threads than cores: the classic symptom of an oversized thread pool.

**Worked example**

*Measure the cost of a switch, and show why oversubscription hurts.*

Two processes ping-ponging a byte through a pipe force one switch per message. Divide the total time by twice the message count and you have a switch, plus two syscalls. Then run more CPU-bound threads than cores and watch `nivcsw` — involuntary switches — climb while throughput falls.

**Measuring switches**

```python
import os, time, resource

N = 20_000
r1, w1 = os.pipe()          # parent -> child
r2, w2 = os.pipe()          # child  -> parent

if os.fork() == 0:
    os.close(w1); os.close(r2)
    for _ in range(N):
        os.read(r1, 1)
        os.write(w2, b"x")
    os._exit(0)

os.close(r1); os.close(w2)
start = time.perf_counter()
for _ in range(N):
    os.write(w1, b"x")
    os.read(r2, 1)
elapsed = time.perf_counter() - start
os.wait()

# Each round trip = 2 switches + 4 syscalls.
print(f"{elapsed / (2 * N) * 1e6:.2f} µs per switch (incl. syscalls)")

u = resource.getrusage(resource.RUSAGE_SELF)
print("voluntary  ", u.ru_nvcsw)      # we blocked and yielded
print("involuntary", u.ru_nivcsw)     # we were preempted
```

```bash
# System-wide switch rate ('cs' column):
vmstat 1 5

# Per-process, split into voluntary and involuntary:
pidstat -w -p <pid> 1 5

# Direct measurement with perf:
perf stat -e context-switches,cpu-migrations,page-faults ./your-program

# Who is being migrated between cores? Migration is a switch plus a
# guaranteed cold cache on the destination.
perf sched latency --sort max
```

<a id="10-threads"></a>

## 10. Threads and Thread Models

A process conflates a resource container with a unit of execution. Threads separate them: one container, many units.

> **Interactive animation:** `threads` — rendered by the page script in the HTML version.

<a id="10-1-the-three-models"></a>

### 10.1 The three models

| Model | Mapping | Switch cost | Fatal flaw |
| --- | --- | --- | --- |
| **Many-to-one** (user threads) | N user threads on 1 kernel thread | a function call — nanoseconds | one blocking syscall blocks all of them; no parallelism |
| **One-to-one** (kernel threads) | 1 : 1 | a full context switch | each thread costs kernel memory; thousands are expensive |
| **Many-to-many** (hybrid) | N user threads on M kernel threads | cheap in the common case | complex; needs a runtime scheduler |

Linux, Windows and macOS all use one-to-one — the kernel schedules every thread. Language runtimes then build many-to-many on top: **goroutines**, Java's virtual threads, and every `async`/`await` system are user-level schedulers multiplexing many logical tasks onto a small pool of OS threads. The recurring bug in all of them is the same: *a blocking call in a coroutine blocks the whole carrier thread*, which is the many-to-one flaw resurfacing.

> **Key idea**
>
> On Linux the distinction between process and thread barely exists in the kernel. Both are created by `clone()`; the flags decide what is shared. `fork()` is `clone()` with nothing shared; `pthread_create()` is `clone()` with `CLONE_VM | CLONE_FILES | CLONE_SIGHAND | CLONE_THREAD`. Everything in between is legal — and that is exactly how containers are built, by adding namespace flags to the same call.

<a id="10-2-picking-a-count"></a>

### 10.2 How many threads

- **CPU-bound** — Threads ≈ cores. More only adds switching and cache pollution.
- **I/O-bound, blocking** — Threads ≈ cores × (1 + wait time / compute time). A task waiting 90% of the time supports about ten threads per core.
- **I/O-bound, many connections** — Do not use threads for concurrency at all — use an event loop. 10,000 connections is 10,000 stacks otherwise.
- **The anti-pattern** — One unbounded thread pool shared by CPU work and blocking calls. The blocking calls occupy every thread and the CPU work never runs.

**Threads vs processes, measured**

```python
import os, time, threading, multiprocessing

def spin(n=5_000_000):
    x = 0
    while x < n:
        x += 1

def timed(label, fn):
    t = time.perf_counter()
    fn()
    print(f"{label:22} {time.perf_counter() - t:.2f}s")

timed("serial", lambda: [spin() for _ in range(4)])

def with_threads():
    ts = [threading.Thread(target=spin) for _ in range(4)]
    [t.start() for t in ts]; [t.join() for t in ts]

def with_processes():
    ps = [multiprocessing.Process(target=spin) for _ in range(4)]
    [p.start() for p in ps]; [p.join() for p in ps]

timed("4 threads", with_threads)     # no faster in CPython: the GIL
timed("4 processes", with_processes) # ~4x faster on 4+ cores

# The lesson generalises beyond Python: threads help only when the
# runtime AND the workload both allow real parallelism.
print("cores:", os.cpu_count())
```

```c
#define _GNU_SOURCE
#include <stdio.h>
#include <sched.h>
#include <pthread.h>

/* Thread-local storage: per-thread data with no locking at all.
   Anything you can keep here costs nothing to synchronise. */
static __thread long local_count = 0;

static void *work(void *arg) {
    for (long i = 0; i < 10000000; i++) local_count++;   /* no lock needed */

    /* Pin this thread to one core to avoid migration and keep caches warm. */
    cpu_set_t set;
    CPU_ZERO(&set);
    CPU_SET((long)arg % sysconf(_SC_NPROCESSORS_ONLN), &set);
    pthread_setaffinity_np(pthread_self(), sizeof set, &set);

    return (void *)local_count;
}

int main(void) {
    pthread_t t[4];
    long total = 0;
    for (long i = 0; i < 4; i++) pthread_create(&t[i], NULL, work, (void *)i);
    for (int i = 0; i < 4; i++) {
        void *r; pthread_join(t[i], &r); total += (long)r;
    }
    printf("%ld\n", total);
    return 0;
}
```

<a id="11-scheduling-goals"></a>

## 11. Scheduling Goals and Metrics

Before comparing algorithms you need to be able to say what "better" means, because the goals conflict and no scheduler optimises all of them.

| Metric | Definition | Matters for |
| --- | --- | --- |
| **Turnaround time** | completion − arrival | batch jobs, builds, analytics |
| **Waiting time** | turnaround − CPU time actually used | the scheduler's own efficiency |
| **Response time** | first dispatch − arrival | anything interactive; this is what "feels fast" |
| **Throughput** | jobs completed per unit time | servers, queues |
| **Fairness** | equal shares to equal-weight tasks | multi-tenant machines |
| **Predictability** | bounded worst case | real-time: a late answer is a wrong answer |

> **Key idea**
>
> Turnaround and response time pull in opposite directions. Minimising turnaround means running a job to completion without interruption; minimising response time means chopping everything into small slices so nothing waits long to start. Interactive systems choose response time and pay for it in context switches — which is why a desktop feels smooth while compiling, and why a batch cluster is configured completely differently.

<a id="11-1-workload-shapes"></a>

### 11.1 The two workload shapes

Real processes alternate between CPU bursts and I/O waits, and the *ratio* is what a good scheduler exploits. An **I/O-bound** process computes for a few hundred microseconds then blocks; a **CPU-bound** process runs until preempted. Boosting the I/O-bound one is nearly free — it will hand the CPU back almost immediately — and keeps devices busy. Every practical scheduler since the 1960s does some version of this.

```text
CPU-bound: [██████████████████████] preempted, requeued
                I/O-bound: [█] wait [█] wait [█] wait [█] wait
                ↑
                give this one priority: it returns the CPU immediately,
                and meanwhile the disk is doing work in parallel
```

<a id="12-classic-scheduling-algorithms"></a>

## 12. Classic Scheduling Algorithms

Change the picking rule and nothing else, and the same jobs produce very different numbers. Step through each policy below on identical input.

> **Interactive animation:** `scheduling` — rendered by the page script in the HTML version.

<a id="12-1-fcfs"></a>

### 12.1 First-come first-served

Run jobs in arrival order, to completion. Non-preemptive, trivially fair, impossible to starve — and terrible for average waiting time because of the **convoy effect**: one long job at the head delays everyone behind it, including short jobs that would have finished instantly. Worse, the I/O-bound jobs stuck behind it leave the devices idle while they wait.

<a id="12-2-sjf-and-srtf"></a>

### 12.2 Shortest job first, and its preemptive twin

SJF is *provably optimal* for average waiting time among non-preemptive schedulers — an exchange argument shows any other order can be improved by swapping an adjacent longer-before-shorter pair. SRTF, its preemptive version, is optimal overall. Both are unimplementable for two reasons: you cannot know a job's burst length in advance, and a steady stream of short jobs starves the long ones forever.

Real systems *estimate* the next burst from history with an exponential average:

```text
τ(n+1) = α · t(n) + (1 − α) · τ(n)

                t(n) = the burst that just happened
                τ(n) = what we predicted last time
                α = 0.5 typically — recent history counts, old history decays

                This is just an EWMA, and it is the same idea behind TCP's RTT estimate.
```

<a id="12-3-round-robin"></a>

### 12.3 Round robin

FCFS plus preemption: each job gets one quantum, then goes to the back of the queue. The response-time guarantee is what makes a machine feel alive — with `n` jobs and quantum `q`, nobody waits more than `(n−1)·q` to start.

Choosing `q` is the whole art. Too large and it degenerates to FCFS. Too small and switching overhead dominates: with a 5 µs switch and a 50 µs quantum you spend 10% of the machine on bookkeeping. The rule of thumb is that **80% of bursts should finish within one quantum**, which lands you at the 1–10 ms range every real system uses.

<a id="12-4-priority"></a>

### 12.4 Priority scheduling

Run the highest-priority runnable job. Simple, and it starves everything at the bottom the moment the machine is busy. The standard fix is **ageing**: increase a job's priority the longer it waits, so anything ignored long enough eventually rises to the top.

> **Warning**
>
> **Priority inversion** is the failure mode that priority scheduling introduces. A low-priority thread holds a lock that a high-priority thread needs; a medium-priority thread preempts the low one; the high-priority thread is now blocked behind a thread with lower priority than itself, indefinitely. This is not theoretical — it nearly ended the Mars Pathfinder mission in 1997, which kept resetting until JPL enabled **priority inheritance** remotely. The fix: while a low-priority thread holds a lock a high-priority thread wants, it temporarily inherits the higher priority.

**Worked example**

*Implement the four policies and compare them on one workload.*

The point of writing this out is to see how little code separates them: everything is identical except the line that picks from the ready queue.

**A scheduler in 40 lines**

```python
from dataclasses import dataclass

@dataclass
class Job:
    name: str; arrive: int; burst: int; prio: int = 0
    left: int = 0; done: int = 0

def run(policy, spec, quantum=2):
    jobs = [Job(*j, left=j[2]) for j in spec]
    ready, t, timeline, admitted = [], 0, [], set()

    def admit():
        for j in jobs:
            if j.arrive <= t and j.name not in admitted:
                admitted.add(j.name); ready.append(j)

    while any(j.left for j in jobs):
        admit()
        if not ready:
            timeline.append("."); t += 1; continue

        if policy == "fcfs" or policy == "rr":
            job = ready.pop(0)
        elif policy == "sjf":
            job = ready.pop(min(range(len(ready)), key=lambda i: ready[i].left))
        else:                                   # priority: lower is better
            job = ready.pop(min(range(len(ready)), key=lambda i: ready[i].prio))

        slice_ = min(quantum, job.left) if policy == "rr" else job.left
        timeline += [job.name] * slice_
        job.left -= slice_; t += slice_
        admit()                                 # arrivals during the slice
        (ready.append(job) if job.left else setattr(job, "done", t))

    wait = [j.done - j.arrive - j.burst for j in jobs]
    return "".join(timeline), sum(wait) / len(wait)

spec = [("P1", 0, 4, 2), ("P2", 1, 3, 1), ("P3", 2, 3, 3), ("P4", 3, 2, 1)]
for p in ("fcfs", "sjf", "rr", "priority"):
    line, avg = run(p, spec)
    print(f"{p:9} {line}  avg wait {avg:.2f}")
```

```bash
# Linux exposes several scheduling policies. SCHED_OTHER (CFS/EEVDF) is
# the default; the others are real-time and outrank it entirely.
chrt -m                       # list policies and their priority ranges

chrt -f 50 ./latency-critical # SCHED_FIFO: runs until it blocks or yields
chrt -r 50 ./latency-critical # SCHED_RR:   same, but round-robins at equal prio
chrt -o -p 0 $$               # back to SCHED_OTHER

# Niceness only affects SCHED_OTHER weight - it is not a priority.
nice -n 19 ./background-job
renice -n -5 -p <pid>         # negative nice needs privilege

# What is this process actually running under?
chrt -p <pid>
```

<a id="13-mlfq-and-linux-cfs"></a>

## 13. MLFQ and the Linux Scheduler

Every algorithm in §12 needs information you do not have. The **multilevel feedback queue** is the classic answer: *learn* each job's behaviour by watching it.

1. Several queues, each with a priority and its own quantum. Higher priority, shorter quantum.
2. New jobs enter at the **top** — optimism: assume it is short and interactive.
3. A job that uses its whole quantum is demoted a level. It has revealed itself as CPU-bound.
4. A job that blocks before the quantum expires stays where it is. It is interactive; keep it fast.
5. Periodically **boost everything to the top**. This prevents starvation and copes with a job that changes phase.

Rule 5 is not optional. Without it, a long-running job that becomes interactive stays stuck at the bottom, and a program can game the system by yielding just before its quantum expires to stay at the top forever.

<a id="13-1-cfs"></a>

### 13.1 CFS: fairness instead of priorities

Linux replaced heuristic priority juggling with a single idea. Track `vruntime` — virtual runtime — for every task: the CPU time it has received, divided by its weight. Always run the task with the smallest `vruntime`. That is the entire algorithm.

- **No fixed quantum** — The slice is `period / nr_running`, so with more tasks everyone gets shorter turns and latency stays bounded.
- **Nice becomes weight** — Each nice level changes weight by ~1.25×, so nice 0 versus nice 5 is roughly a 3:1 CPU split rather than an absolute ordering.
- **Sleepers get a bonus** — A waking task's `vruntime` is clamped near the minimum so it runs almost immediately — this is what makes interactive tasks feel instant without any "interactivity heuristic".
- **Red-black tree** — Tasks are ordered by `vruntime`; picking the next one is the leftmost node, `O(log n)` to update and `O(1)` to read.
- **Group scheduling** — Fairness applies per cgroup first, then within it — which is exactly how container CPU limits are enforced.

> **Tip**
>
> Since Linux 6.6, CFS has been replaced by **EEVDF** (Earliest Eligible Virtual Deadline First). It keeps `vruntime` fairness but adds a per-task deadline derived from a requested latency, so a task can ask for shorter, more frequent slices without asking for a larger *share*. In other words: latency and throughput become separate knobs, which CFS conflated.

<a id="13-2-real-time"></a>

### 13.2 Real-time classes

Linux runs several scheduling classes in strict order: `SCHED_DEADLINE` beats `SCHED_FIFO` and `SCHED_RR`, which beat `SCHED_OTHER`, which beats `SCHED_BATCH` and `SCHED_IDLE`. A `SCHED_FIFO` task runs until it blocks or yields — so an infinite loop at real-time priority will hang that core, which is why the kernel reserves a small percentage of time for non-real-time work by default.

> **Interview**
>
> **"What is the difference between nice and real-time priority?"** Nice is a *weight* within the fair-share class: a nice −20 task gets a bigger slice but a nice 19 task still runs. Real-time priority is *absolute*: a `SCHED_FIFO` task at priority 1 completely starves every `SCHED_OTHER` task regardless of their nice values. They are not two ends of one scale.

<a id="14-multiprocessor-scheduling"></a>

## 14. Multiprocessor Scheduling

With several cores, a new question appears: *where* should a task run, not just *when*. The naive answer — one global run queue protected by a lock — collapses at scale, because every scheduling decision on every core contends for one cache line.

- **Single global queue** — Perfect load balance, and a lock that every core hits thousands of times a second. Also destroys cache affinity: a task lands on a random core each time.
- **Per-CPU queues** — No contention on the common path, and tasks naturally stay on one core. Needs periodic **load balancing** to move work from busy queues to idle ones.

Every modern kernel uses per-CPU queues plus balancing, and the balancing is where the subtlety lives. Migrating a task costs a guaranteed cold cache on the destination, so the balancer must weigh imbalance against migration cost — and must understand the machine's topology.

<a id="14-1-affinity-and-numa"></a>

### 14.1 Affinity, topology and NUMA

```text
socket 0 socket 1
                ┌──────────────────────────┐ ┌──────────────────────────┐
                │ core0 core1 core2 core3 │ │ core4 core5 core6 core7 │
                │ └──L2─┘ └──L2─┘ │ │ └──L2─┘ └──L2─┘ │
                │ └────── L3 ──────┘ │ │ └────── L3 ──────┘ │
                └─────────┬────────────────┘ └────────────┬─────────────┘
                │ │
                ┌────┴─────┐ ┌────┴─────┐
                │ DRAM 0 │◀── interconnect ──▶│ DRAM 1 │
                └──────────┘ └──────────┘
                local: ~100 ns remote: ~150-200 ns

                Moving a task within an L2 group is nearly free.
                Moving it across sockets costs cache AND makes its memory remote.
```

On a **NUMA** machine memory is attached to sockets, so a task moved across sockets keeps accessing memory that is now remote — permanently slower until the pages are migrated too. Linux therefore has *scheduling domains* mirroring the topology and balances aggressively within a domain, reluctantly across one.

**Controlling placement**

```bash
# What does the machine actually look like?
lscpu | grep -E 'NUMA|Socket|Core|Thread|L1|L2|L3'
numactl --hardware

# Pin a process to specific CPUs (hard affinity).
taskset -c 0-3 ./worker
taskset -pc <pid>                 # inspect or change a running process

# Keep a process and its memory on one NUMA node.
numactl --cpunodebind=0 --membind=0 ./database

# Is a workload suffering from remote memory?
numastat -p <pid>                 # numa_miss / numa_foreign should be low
perf stat -e node-loads,node-load-misses ./worker

# How often are tasks being bounced between cores?
perf stat -e cpu-migrations ./worker
```

```python
import os

print("visible cpus:", os.cpu_count())
print("allowed cpus:", sorted(os.sched_getaffinity(0)))

# Pin this process to cores 0 and 1. Useful for latency-sensitive work
# and for benchmarks that must not be perturbed by migration.
os.sched_setaffinity(0, {0, 1})
print("after pinning:", sorted(os.sched_getaffinity(0)))

# In a container, os.cpu_count() reports the HOST's core count while the
# cgroup quota may allow far less. Sizing a thread pool from cpu_count()
# inside a container is a classic and expensive mistake.
try:
    quota = int(open("/sys/fs/cgroup/cpu.max").read().split()[0])
    print("cgroup cpu quota:", quota)
except (FileNotFoundError, ValueError):
    pass
```

<a id="unit-3"></a>

## Unit 3 — Concurrency & Synchronisation

Race conditions, locks, semaphores and condition variables, and how deadlock happens.

<a id="15-concurrency-and-race-conditions"></a>

## 15. Concurrency and Race Conditions

Concurrency is about *structure* — several logical activities in flight. Parallelism is about *execution* — several things happening at the same instant. You can have concurrency on one core, and the bugs are identical either way, because both allow interleavings your sequential reasoning did not consider.

> **Interactive animation:** `race-condition` — rendered by the page script in the HTML version.

<a id="15-1-why-it-happens"></a>

### 15.1 Three reasons your source lies to you

1. **Non-atomicity.** `counter++` is load, add, store. A preemption between any two loses an update.
2. **Reordering.** The compiler and the CPU both reorder memory operations that appear independent. Thread A's write to `data` may become visible *after* its write to `ready`, so thread B sees `ready == true` and stale data.
3. **Visibility.** Each core has its own store buffer and caches. A write is not instantly visible elsewhere; without a barrier there is no guarantee about *when* it becomes so.

> **Warning**
>
> This is why `volatile` in C does **not** make code thread-safe. It prevents the compiler caching a value in a register — nothing more. It emits no memory barrier and provides no atomicity. Use `_Atomic` / `std::atomic` / `java.util.concurrent`, which specify ordering as well as indivisibility. (Java's `volatile` is a different keyword with different, stronger semantics — do not carry the intuition across languages.)

<a id="15-2-the-critical-section-problem"></a>

### 15.2 What a correct solution must guarantee

1. **Mutual exclusion** — at most one thread in the critical section.
2. **Progress** — if nobody is inside, someone waiting must get in; the decision cannot be postponed indefinitely by threads outside the section.
3. **Bounded waiting** — a thread cannot be overtaken unboundedly many times.

Peterson's algorithm satisfies all three using only loads and stores, which is a lovely proof that locks do not *require* hardware support. It is also useless on real hardware without memory barriers, because of reason 2 above — and that is exactly why every real lock is built on an atomic read-modify-write instruction instead.

**Atomics: the primitive under every lock**

```c
#include <stdatomic.h>
#include <stdbool.h>

/* compare-and-swap: the universal primitive. Atomically, "if the value
   is still what I read, replace it; otherwise tell me it changed." */
atomic_int counter = 0;

void lock_free_increment(void) {
    int old = atomic_load(&counter);
    while (!atomic_compare_exchange_weak(&counter, &old, old + 1))
        ;                       /* someone beat us; old is refreshed, retry */
}

/* Or just let the compiler emit the single instruction: */
void simpler(void) {
    atomic_fetch_add(&counter, 1);      /* lock xadd on x86 */
}

/* Publishing data safely needs ORDERING, not just atomicity. */
atomic_bool ready = false;
int payload = 0;

void producer(void) {
    payload = 42;
    atomic_store_explicit(&ready, true, memory_order_release);
    /* release: everything written before this is visible to anyone
       who reads `ready` with acquire ordering. */
}

bool consumer(int *out) {
    if (atomic_load_explicit(&ready, memory_order_acquire)) {
        *out = payload;                 /* guaranteed to see 42 */
        return true;
    }
    return false;
}
```

```python
import threading, itertools

# CPython has no user-facing atomics, but some operations are atomic
# *because of the GIL* - which is an implementation detail, not a
# language guarantee, and is going away with free-threaded builds.

counter = itertools.count()          # thread-safe by design
next(counter)                        # a genuinely atomic increment

# This is NOT safe, GIL or not - it is three bytecodes with a
# preemption point between them:
shared = 0
def unsafe():
    global shared
    shared += 1

# The portable answer is a lock, and it costs ~50ns uncontended:
lock = threading.Lock()
def safe():
    global shared
    with lock:
        shared += 1

# Detect the problem rather than reasoning about it: run under
# `python -X dev` or use a thread sanitiser in C/C++/Go/Rust.
```

<a id="16-locks"></a>

## 16. Locks

A lock is a way to make a region of code behave as though it were a single instruction, from the point of view of other threads. Building one correctly requires hardware help.

<a id="16-1-building-a-lock"></a>

### 16.1 Building one from an atomic instruction

```text
Naive, and broken:
                while (flag == 1) ; // two threads can both pass this test
                flag = 1; // ...and both reach here

                Correct, using test-and-set (one indivisible instruction):
                while (test_and_set(&flag) == 1) ; // atomically read old value AND set to 1
                // critical section // only the thread that read 0 gets in
                flag = 0;

                That spins. To sleep instead, the kernel must be involved - which is
                what a futex is: spin briefly in user space, and only enter the kernel
                if the lock is actually contended.
```

| Lock type | On contention | Uncontended cost | Use when |
| --- | --- | --- | --- |
| **Spinlock** | busy-waits | ~20 ns | kernel code, hold time < a context switch, multicore only |
| **Mutex (futex)** | spins briefly, then sleeps | ~20 ns | everything in user space, by default |
| **RW lock** | readers share, writers exclude | ~40 ns | long read sections, heavily read-dominated |
| **Recursive mutex** | same thread may re-enter | ~30 ns | rarely — it usually means unclear ownership |
| **Seqlock** | readers retry on a version change | ~5 ns read | tiny, frequently-read data (timekeeping in the kernel) |
| **RCU** | readers never block at all | ~0 | read-mostly kernel structures; writers copy and swap |

> **Tip**
>
> **A spinlock on a single core is a guaranteed deadlock in the making.** The holder cannot make progress while the spinner burns the only CPU. Spinlocks are only sensible when the holder is genuinely running on another core, which is why they are kernel primitives and not something you should reach for in application code.

<a id="16-2-using-locks-well"></a>

### 16.2 Using locks well

- **Shrink the critical section** — Compute outside the lock, mutate inside. Never hold a lock across I/O or a syscall — a 2 µs lock becomes a 2 ms lock.
- **Lock data, not code** — Write down which lock protects which fields and keep it next to the declaration. "This function is synchronised" tells you nothing about invariants.
- **Use scoped acquisition**`with lock:`, RAII, `defer`. Manual unlock plus an early return or an exception is the most common leak.
- **Do not use an RW lock reflexively** — It has more bookkeeping than a mutex, and with short sections the extra cost exceeds what the extra parallelism buys.
- **Do not roll your own lock-free structure** — Correct lock-free code needs precise memory ordering and hits problems like ABA. Use a reviewed library.

<a id="17-semaphores-and-condition-variables"></a>

## 17. Semaphores and Condition Variables

A mutex answers "one at a time". Two other questions need different tools: "how many are available?" and "wait until this becomes true".

<a id="17-1-semaphores"></a>

### 17.1 Semaphores

A semaphore is an integer with two atomic operations: `wait` (decrement; block while the value would go negative) and `post` (increment; wake a waiter). Initialise it to 1 and you have a mutex; initialise it to N and you have a permit pool.

> **Warning**
>
> A binary semaphore is *not* a mutex, despite looking like one. A mutex has an **owner**: only the locking thread may unlock it, which enables error checking, priority inheritance and deadlock detection. A semaphore has no owner — any thread may `post` it — which is what makes it right for signalling between threads and wrong as a general mutual-exclusion primitive.

<a id="17-2-condition-variables"></a>

### 17.2 Condition variables

A condition variable lets a thread sleep until some predicate over shared state becomes true. It is always paired with a mutex, and the pairing is not decoration: `wait` atomically releases the mutex and sleeps, then re-acquires it before returning. Without that atomicity there is a window in which the state changes between your check and your sleep, and you sleep forever — the *lost wakeup*.

> **Key idea**
>
> **Always wait in a loop, never in an `if`.** `while (!predicate) cond.wait(lock);` Three reasons: spurious wakeups are permitted by POSIX; `notify_all` wakes several threads and only one can win; and another thread may change the state between the wakeup and your re-acquiring the mutex. The loop costs one comparison and removes an entire class of intermittent bugs.

> **Interactive animation:** `producer-consumer` — rendered by the page script in the HTML version.

**A bounded queue, done properly**

```python
import threading, collections

class BoundedQueue:
    def __init__(self, capacity):
        self.items = collections.deque()
        self.capacity = capacity
        self.mutex = threading.Lock()
        self.not_full = threading.Condition(self.mutex)
        self.not_empty = threading.Condition(self.mutex)

    def put(self, item):
        with self.mutex:
            while len(self.items) >= self.capacity:   # WHILE, never IF
                self.not_full.wait()                  # releases the mutex atomically
            self.items.append(item)
            self.not_empty.notify()                   # wake exactly one consumer

    def get(self):
        with self.mutex:
            while not self.items:
                self.not_empty.wait()
            item = self.items.popleft()
            self.not_full.notify()
            return item

# Two condition variables on one mutex is the correct shape. Using a
# single condition and notify_all() also works, but wakes every waiter
# to discover that most of them still cannot proceed - the "thundering
# herd", which turns O(1) work into O(n) wakeups.
```

```c
#include <pthread.h>

#define CAP 128
typedef struct {
    int buf[CAP], head, tail, count;
    pthread_mutex_t m;
    pthread_cond_t not_full, not_empty;
} queue_t;

void q_put(queue_t *q, int v) {
    pthread_mutex_lock(&q->m);
    while (q->count == CAP)                     /* WHILE, never IF */
        pthread_cond_wait(&q->not_full, &q->m); /* unlocks + sleeps atomically */
    q->buf[q->tail] = v;
    q->tail = (q->tail + 1) % CAP;
    q->count++;
    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->m);
}

int q_get(queue_t *q) {
    pthread_mutex_lock(&q->m);
    while (q->count == 0)
        pthread_cond_wait(&q->not_empty, &q->m);
    int v = q->buf[q->head];
    q->head = (q->head + 1) % CAP;
    q->count--;
    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->m);
    return v;
}
```

<a id="18-classic-synchronisation-problems"></a>

## 18. Classic Synchronisation Problems

These four are not academic exercises. Each isolates one failure mode you will meet in production, and knowing the shape lets you recognise it in code that looks nothing like the textbook version.

<a id="18-1-producer-consumer"></a>

### 18.1 Producer–consumer

Covered in §17. The lesson is **back-pressure**: a bounded buffer converts a throughput mismatch into a blocked producer instead of an out-of-memory kill. Every thread pool, message queue and socket backlog is this problem.

<a id="18-2-readers-writers"></a>

### 18.2 Readers–writers

Many readers may share; a writer needs exclusivity. The trap is the policy question hiding inside:

- **Reader-preference** — New readers join while readers are active. Maximum read throughput, and a continuous stream of readers **starves writers forever**.
- **Writer-preference** — Waiting writers block new readers. Writers make progress; heavy write load starves readers instead.
- **Fair / FIFO** — Queue everyone in arrival order, batching adjacent readers. Neither starves; slightly lower peak throughput. This is what you want by default.

<a id="18-3-dining-philosophers"></a>

### 18.3 Dining philosophers

Five philosophers, five forks, each needs the two beside them. If all five pick up their left fork at once, all five hold one and wait for one: deadlock, and the canonical demonstration of circular wait.

- **Resource ordering** — Number the forks; always take the lower-numbered one first. One philosopher then reaches for the higher fork first, breaking the symmetry — and the cycle. This is the fix you should use in real code.
- **Limit concurrency** — A semaphore permitting only four at the table guarantees one can always eat.
- **All-or-nothing** — Acquire both forks atomically under a global lock, or not at all.
- **Naive retry** — Put the fork down and try again — deadlock becomes **livelock**: everyone busy, nobody eating. Randomised backoff is required.

<a id="18-4-sleeping-barber"></a>

### 18.4 The sleeping barber

A barber sleeps when no customers wait; customers leave if the waiting room is full. This is a thread pool with a bounded queue and a rejection policy — precisely the shape of an HTTP server with a connection backlog. The lesson is that **shedding load is a valid strategy**: refusing a request quickly is better than accepting it into an unbounded queue where it will time out anyway.

**Philosophers, with and without ordering**

```python
import threading, time, random

N = 5
forks = [threading.Lock() for _ in range(N)]

def philosopher_deadlocks(i):
    """Everyone grabs left first -> all five hold one fork -> deadlock."""
    left, right = forks[i], forks[(i + 1) % N]
    for _ in range(100):
        left.acquire()
        time.sleep(0.001)          # widen the window so it actually happens
        right.acquire()
        right.release(); left.release()

def philosopher_ordered(i):
    """Always take the lower-numbered fork first. No cycle is possible."""
    a, b = sorted((i, (i + 1) % N))
    for _ in range(100):
        with forks[a]:
            with forks[b]:
                pass               # eat

ts = [threading.Thread(target=philosopher_ordered, args=(i,)) for i in range(N)]
for t in ts: t.start()
for t in ts: t.join()
print("everyone ate")
```

```c
#include <pthread.h>
#include <stdio.h>

#define N 5
static pthread_mutex_t fork_[N];

static void *philosopher(void *arg) {
    long i = (long)arg;
    int a = i, b = (i + 1) % N;
    if (a > b) { int t = a; a = b; b = t; }   /* global ordering: no cycle */

    for (int k = 0; k < 1000; k++) {
        pthread_mutex_lock(&fork_[a]);
        pthread_mutex_lock(&fork_[b]);
        /* eat */
        pthread_mutex_unlock(&fork_[b]);
        pthread_mutex_unlock(&fork_[a]);
    }
    return NULL;
}

int main(void) {
    pthread_t t[N];
    for (int i = 0; i < N; i++) pthread_mutex_init(&fork_[i], NULL);
    for (long i = 0; i < N; i++) pthread_create(&t[i], NULL, philosopher, (void *)i);
    for (int i = 0; i < N; i++) pthread_join(t[i], NULL);
    puts("everyone ate");
    return 0;
}
```

<a id="19-deadlock"></a>

## 19. Deadlock

Deadlock requires four conditions to hold at once. Break any one and it is impossible.

> **Interactive animation:** `deadlock` — rendered by the page script in the HTML version.

| Condition | Meaning | How you would break it | Practical? |
| --- | --- | --- | --- |
| Mutual exclusion | the resource cannot be shared | make it shareable — immutable data, per-thread copies | sometimes; the best fix when it applies |
| Hold and wait | holds one while requesting another | acquire everything at once, or release before waiting | yes — `trylock` with backoff |
| No preemption | cannot be taken by force | timeouts; roll back and retry | yes — this is what databases do |
| Circular wait | a cycle in the wait-for graph | impose a global lock ordering | **yes — the standard answer** |

<a id="19-1-avoidance"></a>

### 19.1 Avoidance: the Banker's algorithm

Rather than preventing a condition, grant each request only if the resulting state is *safe* — meaning some ordering of the remaining processes can still finish. The algorithm is elegant and essentially never used, because it requires every process to declare its maximum resource need in advance, and the check is `O(n² × m)` on every request. Know it for the interview; do not plan to implement it.

<a id="19-2-detection"></a>

### 19.2 Detection and recovery

Let deadlock happen, then find cycles in the wait-for graph periodically and break one by killing or rolling back a victim. Databases do exactly this — when PostgreSQL returns *"deadlock detected"* it has run a cycle check and aborted the cheapest transaction. It works there because transactions are already designed to be retryable, which is the property that makes recovery acceptable.

> **Warning**
>
> **Livelock and starvation are not deadlock, and they look different in a thread dump.** In deadlock, threads are blocked and using no CPU. In livelock, threads are running flat out, repeatedly retrying and undoing each other — high CPU, zero progress. Starvation is one thread never getting a turn while others make progress. The fixes differ: ordering for deadlock, randomised backoff for livelock, ageing or fair queueing for starvation.

**Detecting and avoiding it in practice**

```bash
# A hung process: what is every thread blocked on?
gdb -p <pid> -batch -ex 'thread apply all bt' 2>/dev/null | head -60

# Python:
py-spy dump --pid <pid>

# Java:
jstack <pid> | grep -A 12 'Found one Java-level deadlock'

# Deadlock: blocked threads, no CPU. Livelock: spinning threads, no progress.
top -H -p <pid>

# The kernel's own detector for tasks stuck over 120s:
dmesg | grep -i 'hung_task\|blocked for more than'

# Database side:
# postgres: log_lock_waits = on, deadlock_timeout = 1s
# mysql:    SHOW ENGINE INNODB STATUS \G   -> LATEST DETECTED DEADLOCK
```

```python
import threading

# Two locks, and the classic bug: two code paths take them in
# opposite orders.
account_a = threading.Lock()
account_b = threading.Lock()

def transfer_bad(src, dst):
    with src:              # thread 1: a then b
        with dst:          # thread 2: b then a   -> cycle -> deadlock
            pass

# Fix 1: a global ordering. Any total order works as long as everyone
# agrees; id() is convenient and stable for the object's lifetime.
def transfer_ordered(src, dst):
    first, second = sorted((src, dst), key=id)
    with first:
        with second:
            pass

# Fix 2: try-lock with backoff. Breaks hold-and-wait instead.
import random, time
def transfer_trylock(src, dst):
    while True:
        with src:
            if dst.acquire(timeout=0.01):
                try:
                    return
                finally:
                    dst.release()
        time.sleep(random.uniform(0, 0.005))   # randomise, or you livelock
```

<a id="unit-4"></a>

## Unit 4 — Memory Management

From physical memory to paging, the TLB, page replacement and allocators.

<a id="20-memory-from-first-principles"></a>

## 20. Memory from First Principles

Start again from the bare machine. One program, physical addresses, no translation. It works. Now add a second program and three problems appear immediately, in this order:

1. **Protection.** Program A can write to program B's memory. Nothing stops it.
2. **Relocation.** The compiler emitted absolute addresses, but the program will be loaded wherever there is room. Every address in the binary is wrong.
3. **Allocation.** As programs start and exit, free memory becomes a patchwork of holes.

<a id="20-1-base-and-bounds"></a>

### 20.1 First attempt: base and bounds

Give the CPU two privileged registers. On every access compute `physical = virtual + base` and trap if `virtual >= bound`. This is astonishingly cheap — two registers and an adder — and solves protection and relocation completely. Programs can be written as though they start at zero, and the kernel can move one by copying it and updating `base`.

What it does not solve is allocation. Each process still needs one contiguous physical run, and the whole run must be resident even though most of it — the gap between heap and stack — is untouched.

> **Interactive animation:** `fragmentation` — rendered by the page script in the HTML version.

<a id="20-2-two-fragmentations"></a>

### 20.2 The two fragmentations

- **External** — Free memory exists but is split into pieces smaller than the request. The disease of variable-size contiguous allocation.
- **Internal** — You round the request up to a fixed unit and waste the remainder. The price of fixed-size allocation — a 1-byte file still occupies a 4 KB page.

You can have one or the other. Fixed-size units eliminate external fragmentation by construction, at the cost of a little internal waste. On a 4 KB page the expected waste is 2 KB per allocation — a rounding error against the benefit.

> **Key idea**
>
> That trade is the pivot of memory management. **Stop requiring contiguity, chop everything into equal pages, and let a table hide the scattering.** Everything from §21 onward is working out the consequences.

<a id="21-segmentation-and-paging"></a>

## 21. Segmentation and Paging

<a id="21-1-segmentation"></a>

### 21.1 Segmentation: variable-size, semantically meaningful

Generalise base-and-bounds to several base/bound pairs, one per logical region: code, data, heap, stack. Now the gap between heap and stack costs nothing, each segment gets its own permissions (code read-execute, data read-write), and sharing a code segment between processes is trivial.

Segmentation fails for the same reason base-and-bounds did, only later: segments are variable-sized, so external fragmentation returns, and a segment that grows must be moved or must fail.

<a id="21-2-paging"></a>

### 21.2 Paging: fixed-size, semantically meaningless

Chop the virtual address space into fixed-size **pages** and physical memory into identically-sized **frames**. Any page can live in any frame. External fragmentation becomes impossible because every hole is exactly the size of every request.

|   | Segmentation | Paging |
| --- | --- | --- |
| Unit size | variable, logical | fixed, arbitrary |
| Fragmentation | external | internal, small |
| Address | segment + offset (two-dimensional) | one linear number the hardware splits |
| Permissions | natural — per logical region | per page; the kernel groups them into VMAs |
| Verdict | largely historical | universal |

Linux keeps the useful half of segmentation in software: a process's address space is a list of **VMAs** (virtual memory areas), each a contiguous range with uniform permissions and a backing object. `/proc/pid/maps` is a printout of that list. The hardware sees only pages.

**Reading a real address space**

```bash
cat /proc/self/maps
# 5566f8a00000-5566f8a02000 r--p  ...  /usr/bin/cat     <- text, read-only
# 5566f8a02000-5566f8a06000 r-xp  ...  /usr/bin/cat     <- executable
# 5566f8a06000-5566f8a08000 r--p  ...  /usr/bin/cat     <- rodata
# 5566f8a09000-5566f8a0a000 rw-p  ...  /usr/bin/cat     <- data + bss
# 5566f9c3b000-5566f9c5c000 rw-p  ...  [heap]
# 7ffd4a1b0000-7ffd4a1d1000 rw-p  ...  [stack]
# 7ffd4a1f4000-7ffd4a1f8000 r--p  ...  [vvar]
# 7ffd4a1f8000-7ffd4a1fa000 r-xp  ...  [vdso]           <- syscall-free calls
# ffffffffff600000-ffffffffff601000 --xp ... [vsyscall]

# Per-region resident and shared/private breakdown:
sudo awk '/^[0-9a-f]/ {r=$0} /^Rss:/ {print $2" kB  "r}' /proc/self/smaps | sort -rn | head

# Note "w" and "x" never appear together in a sane binary: W^X.
grep -c 'rwx' /proc/self/maps      # should be 0
```

```python
import re, collections

perms = collections.Counter()
total = collections.Counter()

for line in open("/proc/self/maps"):
    start, end = (int(x, 16) for x in line.split()[0].split("-"))
    flags = line.split()[1]
    name = line.split()[-1] if line.count(" ") > 5 else "[anon]"
    perms[flags] += 1
    total[flags] += end - start

for flag, count in perms.most_common():
    print(f"{flag}  {count:4d} regions  {total[flag] / 1024 / 1024:8.2f} MB")

# r-xp = code, r--p = constants, rw-p = data/heap/stack.
# Anything rwxp is a red flag: writable AND executable memory is how
# exploits turn a buffer overflow into code execution.
```

<a id="22-page-tables-and-the-tlb"></a>

## 22. Page Tables and the TLB

> **Interactive animation:** `page-translation` — rendered by the page script in the HTML version.

<a id="22-1-why-multi-level"></a>

### 22.1 Why the table is a tree

Do the arithmetic on a flat table. A 48-bit address space with 4 KB pages has `2³⁶` pages; at 8 bytes per entry that is **512 GB of page table per process**. Absurd — and almost entirely empty, since a process uses a tiny, sparse subset of its address space.

A multi-level table exploits the sparseness. Split the page number into chunks and index a tree; a whole subtree that maps nothing is a single null pointer.

```text
x86-64, 4-level, 4 KB pages:

                63 48 47 39 38 30 29 21 20 12 11 0
                ┌────────┬─────────┬─────────┬─────────┬─────────┬────────────┐
                │ unused │ PML4 │ PDPT │ PD │ PT │ offset │
                │ (sign) │ 9 bits │ 9 bits │ 9 bits │ 9 bits │ 12 bits │
                └────────┴─────────┴─────────┴─────────┴─────────┴────────────┘
                │ │ │ │ └─▶ byte in page
                │ │ │ └───▶ 512 entries → the frame
                │ │ └─────────▶ 512 entries, or a 2 MB huge page here
                │ └───────────────▶ 512 entries, or a 1 GB huge page here
                └─────────────────────▶ 512 entries; cr3 points at this table

                A minimal process: 4 tables × 4 KB = 16 KB, not 512 GB.
                Cost: a TLB miss now needs FOUR memory accesses, not one.
```

<a id="22-2-the-pte"></a>

### 22.2 What is in an entry

- **Frame number** — Where the page actually lives.
- **Valid / present** — Clear this bit and any access traps. The hook for demand paging, swapping and copy-on-write.
- **Writable** — Clear it to make a page read-only — how COW and W^X are enforced.
- **User / supervisor** — Clear it and only ring 0 may touch the page. This is what keeps the kernel mapping in every address space safe.
- **Accessed** — Set by hardware on any access. The kernel clears it periodically; this is how it approximates LRU without timestamps.
- **Dirty** — Set by hardware on write. A clean page can be dropped for free; a dirty one must be written out first.
- **NX / execute-disable** — Refuse to execute from this page. Turns most stack overflows from code execution into a crash.

<a id="22-3-the-tlb"></a>

### 22.3 The TLB is what makes it viable

Four memory accesses per translation would make every load five times slower. The **translation lookaside buffer** is a small, fully-associative cache of recent translations — typically 64 entries for L1 and 1000–2000 for L2 — with a hit rate above 99% on normal code. A hit costs essentially nothing; a miss costs the walk.

| Event | Cost | Handled by |
| --- | --- | --- |
| TLB hit | ~1 cycle | hardware, invisible |
| TLB miss, page present | ~100 cycles | hardware page walker |
| Page fault, minor (in RAM) | ~1–3 µs | kernel — just fix the mapping |
| Page fault, major (from SSD) | ~100 µs | kernel + real I/O + a context switch |

> **Tip**
>
> **Huge pages** attack TLB pressure directly. A 2 MB page covers 512× more memory per entry, so a database with a 64 GB buffer pool goes from millions of TLB-mappable pages to tens of thousands. For large-working-set workloads this is often a 5–20% win for one `madvise` call. The catch is that transparent huge pages must sometimes *compact* memory to find a contiguous 2 MB run, which causes latency spikes — which is why nearly every database's tuning guide says to set THP to `madvise` rather than `always`.

**Seeing translation cost**

```bash
# TLB misses and page-walk cycles for a real workload:
perf stat -e dTLB-loads,dTLB-load-misses,iTLB-load-misses ./workload

# Minor (mapping fixed in RAM) vs major (had to read from disk) faults:
/usr/bin/time -v ./workload | grep -i faults
ps -o min_flt,maj_flt,comm -p <pid>

# Transparent huge pages: 'always' can cause compaction stalls.
cat /sys/kernel/mm/transparent_hugepage/enabled
grep AnonHugePages /proc/meminfo

# How much of this process is backed by huge pages?
grep -E 'AnonHugePages|Rss' /proc/<pid>/smaps_rollup
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <time.h>

#define GB (1024UL * 1024 * 1024)

/* Random access over a large region is dominated by TLB misses, not by
   the memory latency people usually blame. Compare with and without
   huge pages to see the translation cost on its own. */
static double walk(char *p, size_t n, int huge) {
    if (huge) madvise(p, n, MADV_HUGEPAGE);
    for (size_t i = 0; i < n; i += 4096) p[i] = 1;      /* fault it all in */

    struct timespec a, b;
    clock_gettime(CLOCK_MONOTONIC, &a);
    volatile long sum = 0;
    for (int r = 0; r < 20000000; r++)
        sum += p[(rand() % (n / 4096)) * 4096];          /* one page each */
    clock_gettime(CLOCK_MONOTONIC, &b);
    return (b.tv_sec - a.tv_sec) + (b.tv_nsec - a.tv_nsec) / 1e9;
}

int main(void) {
    size_t n = 2 * GB;
    char *p = mmap(NULL, n, PROT_READ | PROT_WRITE,
                   MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    printf("4K pages : %.2f s\n", walk(p, n, 0));
    printf("2M pages : %.2f s\n", walk(p, n, 1));
    return 0;
}
```

<a id="23-demand-paging"></a>

## 23. Demand Paging

Once translation exists, a page need not be in memory at all. Clear the valid bit and the hardware will tell you the moment somebody touches it. That single hook turns the page fault from an error into the most reused mechanism in the kernel.

<a id="23-1-the-fault-path"></a>

### 23.1 What happens on a fault

1. The MMU finds `valid = 0` (or a permission violation) and traps. The faulting address is left in `cr2`.
2. The kernel looks the address up in the process's VMA list. **No VMA covers it** → `SIGSEGV`. Done.
3. A VMA covers it, so the access is legal. Which kind of fault is it?

   - Anonymous, never touched → allocate a zeroed frame. *Minor fault.*
   - File-backed, already in the page cache → just point the PTE at it. *Minor fault.*
   - File-backed, not cached → start disk I/O, block the process. *Major fault.*
   - Present but read-only, and this was a write to a COW page → copy it.
   - Swapped out → read it back from swap. *Major fault.*
4. Update the PTE, flush the stale TLB entry, return — and the CPU *re-executes the faulting instruction*, which now succeeds.

> **Key idea**
>
> Step 4 is the elegant part: the kernel never has to emulate the instruction or know what it was doing. It fixes the mapping and lets the hardware try again. That is why one mechanism can serve lazy allocation, COW, swapping and mmap'd files without any of them knowing about the others.

<a id="23-2-cow"></a>

### 23.2 Copy-on-write

> **Interactive animation:** `copy-on-write` — rendered by the page script in the HTML version.

<a id="23-3-overcommit"></a>

### 23.3 Overcommit and the OOM killer

Because pages are allocated on first touch, Linux happily promises more memory than it has — **overcommit**. This is not recklessness: most programs touch far less than they allocate, and `fork` would be impossible otherwise. But it moves the failure from `malloc` returning `NULL` (which you could handle) to a page fault the kernel cannot satisfy (which it cannot). At that point the **OOM killer** picks a victim by score — roughly, the process using the most memory — and kills it.

> **Warning**
>
> This is why a container exits with code **137** (128 + SIGKILL) rather than raising an out-of-memory exception: nothing in your program was consulted. And why the victim is often not the guilty process — the leak may be in a small process, but the killer targets the largest one. Set a cgroup memory limit so the kill is scoped to the offender, and expose `memory.events` so you can see it happening.

**Faults, overcommit and the killer**

```python
import mmap, resource, os

def faults():
    r = resource.getrusage(resource.RUSAGE_SELF)
    return r.ru_minflt, r.ru_majflt

before = faults()
region = mmap.mmap(-1, 512 * 1024 * 1024)     # reserve 512 MB
print("after reserving :", faults(), "  (unchanged - nothing touched)")

for off in range(0, len(region), 4096):        # touch every page once
    region[off] = 1
print("after touching  :", faults(), "  (one minor fault per page)")

# Read a file with and without the page cache warm to see MAJOR faults.
# echo 3 | sudo tee /proc/sys/vm/drop_caches   # then re-run
with open("/usr/bin/python3", "rb") as f:
    m = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
    for off in range(0, len(m), 4096):
        _ = m[off]
print("after mmap read :", faults())
```

```bash
# 0 = heuristic (default), 1 = always allow, 2 = strict accounting
cat /proc/sys/vm/overcommit_memory
cat /proc/meminfo | grep -E 'Commit|MemAvailable'

# Who did the OOM killer choose, and why?
dmesg -T | grep -i -A 5 'killed process'
journalctl -k | grep -i oom

# Bias the choice. -1000 makes a process immune; +1000 makes it the
# first victim. Use this for your monitoring agent, not your app.
echo -500 > /proc/<pid>/oom_score_adj
cat /proc/<pid>/oom_score

# In a container, scope the kill with a cgroup limit:
cat /sys/fs/cgroup/memory.max
cat /sys/fs/cgroup/memory.events      # oom_kill counter lives here
```

<a id="24-page-replacement"></a>

## 24. Page Replacement

Memory fills up. Something must be evicted, and the choice determines whether the next fault is free or costs 100 µs.

> **Interactive animation:** `page-replacement` — rendered by the page script in the HTML version.

| Policy | Evicts | Verdict |
| --- | --- | --- |
| **Optimal (MIN)** | the page needed furthest in the future | unimplementable; the benchmark others are measured against |
| **FIFO** | the oldest loaded | trivial and bad — suffers Belady's anomaly |
| **LRU** | least recently used | excellent, but exact LRU needs a timestamp on every access |
| **Clock / second chance** | oldest with reference bit clear | the practical LRU approximation; nearly free |
| **LFU** | least frequently used | clings to pages that were hot once; needs ageing |
| **ARC / LIRS / MGLRU** | adaptive between recency and frequency | what modern kernels and databases actually use |

<a id="24-1-beladys-anomaly"></a>

### 24.1 Belady's anomaly

Adding more frames should never cause more faults. Under FIFO it can. The reason is that FIFO's set of resident pages with `n+1` frames is not necessarily a superset of its set with `n` — it does not have the *stack property*. LRU and Optimal do have it and are therefore immune. This is the reason FIFO is a teaching example and not a real policy.

<a id="24-2-what-linux-does"></a>

### 24.2 What Linux actually does

Not LRU, and not one list. Linux keeps **active** and **inactive** lists for file-backed and anonymous pages separately. New pages start inactive; a second reference promotes them to active. Reclaim scans the inactive list from the tail, using the hardware accessed bit as a second-chance signal. Separating file from anonymous matters because dropping a clean file page is free (it is still on disk) while evicting an anonymous page requires a swap write.

> **Tip**
>
> `swappiness` (0–200, default 60) is the balance between those two lists, not an on/off switch for swap. Setting it to 1 tells the kernel to strongly prefer dropping file cache over swapping anonymous memory — sensible for a database with its own cache, harmful for a machine with lots of idle anonymous memory that would be better on disk. Setting it to 0 does *not* disable swap; it just makes the kernel wait until it is desperate.

<a id="25-thrashing-and-the-working-set"></a>

## 25. Thrashing and the Working Set

The **working set** of a process is the set of pages it has referenced in the last `Δ` units of time. If the sum of all working sets exceeds physical memory, every eviction removes a page that is about to be needed, and the system enters **thrashing**: all time spent paging, none computing.

```text
throughput
                │ ▁▄████████▇▆
                │ ▁▄██ ▔▔▔▔▔▔▔▚▖
                │ ▄██ ▚▖ ← the cliff: working sets no
                │ ██ ▚▄▄▖ longer fit in RAM
                │██ ▔▔▔▔▔▔▔▔▔▔
                └────────────────────────────────────────────────▶ degree of multiprogramming

                Adding one more process past the cliff makes the whole machine slower.
                This is why admission control beats "just run more workers".
```

The failure mode is vicious because the obvious response makes it worse. Throughput drops, so a naive autoscaler or connection pool adds more workers, which increases the total working set, which increases paging. The only real fixes are to **reduce the number of concurrent processes** (admission control), reduce each one's footprint, or add memory.

> **Warning**
>
> **The signature is unmistakable.** CPU near zero, disk at 100% utilisation, load average climbing, `si`/`so` in `vmstat` non-zero and rising, major faults per second in the thousands, everything unresponsive including SSH. If you see high CPU instead, it is not thrashing — look elsewhere.

**Confirming thrashing**

```bash
# si/so are swap-in and swap-out pages per second. Sustained non-zero
# values with low 'us'/'sy' and high 'wa' is thrashing.
vmstat 1

# Major faults per second, per process - who is causing it?
pidstat -r 1 5 | sort -k 6 -rn | head

# Pressure Stall Information is the modern, direct answer:
# "some avg10=45.00" means 45% of the last 10s had a task stalled on memory.
cat /proc/pressure/memory

# Who is using swap?
for f in /proc/*/status; do
  awk '/^Name|^VmSwap/ {printf "%s ", $2} END {print ""}' "$f"
done | sort -k2 -rn | head
```

<a id="26-memory-allocators"></a>

## 26. Memory Allocators

The kernel hands out pages. Programs want arbitrary byte counts. Something has to bridge the two — and there is a bridge on each side of the syscall boundary.

<a id="26-1-user-space"></a>

### 26.1 In user space: `malloc`

`malloc` is a library, not a syscall. It obtains large regions from the kernel with `brk` or `mmap` and then sub-allocates. Modern allocators (glibc's ptmalloc, jemalloc, tcmalloc, mimalloc) all share the same structure:

- **Size classes** — Round requests to one of a few dozen sizes so free blocks are interchangeable.
- **Per-thread caches** — A thread-local free list means most allocations need no lock at all. This is the single biggest win in multithreaded allocators.
- **Arenas** — Several independent heaps so threads that do miss the cache contend with few others.
- **mmap for large blocks** — Above ~128 KB, go straight to the kernel and return the pages on `free` — so large allocations actually shrink RSS while small ones do not.

> **Warning**
>
> **`free()` usually does not return memory to the OS.** The block goes back on a free list for reuse. This is why RSS often looks like a ratchet: it grows and never falls, even though the program is not leaking. The mechanism is fine — reusing a page is far cheaper than unmapping and re-faulting it — but it makes "memory usage" a misleading metric. Compare `malloc_stats()` or jemalloc's arena stats with RSS before declaring a leak.

<a id="26-2-kernel-space"></a>

### 26.2 In the kernel: buddy and slab

The kernel cannot page itself out and cannot afford fragmentation, so it uses two cooperating allocators:

1. **The buddy allocator** hands out physically contiguous power-of-two runs of pages. Splitting a block in half produces two "buddies"; when both are free they merge back, which keeps large contiguous runs available. Visible in `/proc/buddyinfo`.
2. **The slab allocator** sits on top for the many small, same-sized kernel objects (`task_struct`, `inode`, `dentry`). It keeps caches of pre-initialised objects, so allocating one is a pointer pop, and there is no fragmentation because every object in a cache is identical. Visible in `/proc/slabinfo` and `slabtop`.

**Where the memory went**

```bash
# Kernel object caches, sorted by size. Runaway dentry or inode caches
# are a classic cause of "the kernel ate my RAM".
sudo slabtop -o | head -15

# Free page runs by order - if only order-0 is left, huge page
# allocation will stall trying to compact memory.
cat /proc/buddyinfo

# The big picture: what is anonymous, what is file cache, what is kernel?
grep -E 'MemTotal|MemFree|MemAvailable|Cached|Slab|AnonPages|Shmem' /proc/meminfo

# Watch an allocator's behaviour rather than guessing:
ltrace -e 'malloc+free' ./program 2>&1 | head
valgrind --leak-check=full --show-leak-kinds=all ./program
MALLOC_ARENA_MAX=2 ./program        # cap glibc arenas in a container
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <malloc.h>

/* Demonstrates that free() returns memory to the allocator, not the OS -
   except for large blocks, which came from mmap and go straight back. */
static long rss_kb(void) {
    long v = 0; char k[64];
    FILE *f = fopen("/proc/self/status", "r");
    while (fscanf(f, "%63s %ld", k, &v) == 2)
        if (!strcmp(k, "VmRSS:")) break;
    fclose(f);
    return v;
}

int main(void) {
    printf("start          %ld kB\n", rss_kb());

    void *small[100000];
    for (int i = 0; i < 100000; i++) small[i] = malloc(1000);
    printf("100k x 1 kB    %ld kB\n", rss_kb());
    for (int i = 0; i < 100000; i++) free(small[i]);
    printf("after free     %ld kB   <- barely moves\n", rss_kb());

    void *big = malloc(200 * 1024 * 1024);   /* > mmap threshold */
    ((char *)big)[0] = 1;
    printf("one 200 MB     %ld kB\n", rss_kb());
    free(big);
    printf("after free     %ld kB   <- returned, it was mmap'd\n", rss_kb());

    malloc_trim(0);                          /* ask glibc to give some back */
    printf("after trim     %ld kB\n", rss_kb());
    return 0;
}
```

<a id="27-the-memory-hierarchy"></a>

## 27. The Memory Hierarchy and Caches

> **Interactive animation:** `memory-hierarchy` — rendered by the page script in the HTML version.

Every level of that ladder is a cache for the level below, and every one works for the same two reasons: **temporal locality** (what you touched, you will touch again) and **spatial locality** (what is beside it, you will touch next). The OS did not invent these; it exploits them, and so should your data structures.

<a id="27-1-cache-lines"></a>

### 27.1 The cache line is the unit, not the byte

Memory moves in 64-byte lines. Reading one byte fetches 64. This has two consequences worth internalising:

- **Sequential access is nearly free** — The first byte of a line costs a miss; the next 63 are hits. Plus the prefetcher notices the pattern and fetches ahead.
- **False sharing** — Two threads writing two *different* variables that share one line will ping-pong that line between cores, each invalidating the other. The variables are independent; the performance is not. Pad hot per-thread counters to 64 bytes.

> **Key idea**
>
> Row-major traversal of a 2-D array is often 5–10× faster than column-major, for one reason: the row walk uses all 64 bytes of every line it fetches, and the column walk uses 4 of them. No algorithmic change, no different Big-O — just respecting the transfer unit. This is the highest return-on-effort optimisation in most numeric code.

<a id="27-2-the-page-cache"></a>

### 27.2 The page cache

The OS's own cache, and the largest consumer of RAM on a typical server. Every file read and write goes through it unless you explicitly opt out with `O_DIRECT`. A read that hits is a `memcpy`; a write returns as soon as the data is in a dirty page, and a kernel thread flushes it later.

This is why `free` showing "almost no free memory" is normal and healthy — the kernel is using idle RAM as cache and will drop it instantly on demand. The number to read is **MemAvailable**, not **MemFree**.

**The page cache in action**

```bash
# 'buff/cache' is not used memory - 'available' is what you can still get.
free -h

# Cold vs warm read of the same file:
sync; echo 3 | sudo tee /proc/sys/vm/drop_caches >/dev/null
time cat bigfile > /dev/null      # cold: limited by the disk
time cat bigfile > /dev/null      # warm: limited by memcpy

# How much of a specific file is cached right now?
vmtouch -v bigfile

# Dirty pages awaiting writeback - large values mean a big loss window
# on power failure, and latency spikes when the flush finally happens.
grep -E 'Dirty|Writeback' /proc/meminfo
sysctl vm.dirty_ratio vm.dirty_background_ratio
```

```python
import os, time

PATH = "/tmp/cache-demo.bin"
with open(PATH, "wb") as f:
    f.write(os.urandom(256 * 1024 * 1024))

def read_all():
    t = time.perf_counter()
    with open(PATH, "rb") as f:
        while f.read(1 << 20):
            pass
    return time.perf_counter() - t

print(f"first read (may hit disk): {read_all():.3f}s")
print(f"second read (page cache) : {read_all():.3f}s")

# Tell the kernel what you intend, and it will behave better:
fd = os.open(PATH, os.O_RDONLY)
os.posix_fadvise(fd, 0, 0, os.POSIX_FADV_SEQUENTIAL)  # readahead aggressively
os.posix_fadvise(fd, 0, 0, os.POSIX_FADV_DONTNEED)    # drop it after use
os.close(fd)
os.unlink(PATH)
```

<a id="unit-5"></a>

## Unit 5 — Communication, File Systems & I/O

Processes talking to each other, files on disk, and the I/O path down to the device.

<a id="28-inter-process-communication"></a>

## 28. Inter-Process Communication

Isolation is the point of a process, so communication must be explicit. The mechanisms differ mainly in how many times the data is copied and who does the synchronising.

| Mechanism | Copies | Sync included | Scope | Typical latency |
| --- | --- | --- | --- | --- |
| Pipe / FIFO | 2 | yes — blocks when full or empty | one machine | ~5 µs |
| Unix domain socket | 2 | yes | one machine | ~10 µs |
| TCP loopback | 2+ | yes | network | ~30 µs |
| POSIX message queue | 2 | yes, with priorities | one machine | ~10 µs |
| Shared memory | **0** | **no — you provide it** | one machine | ~100 ns |
| Signal | — | n/a | one machine | ~2 µs |
| eventfd / futex | — | yes | one machine | ~1 µs |

<a id="28-1-pipes"></a>

### 28.1 Pipes

A pipe is a fixed-size kernel buffer (64 KB by default) with a read end and a write end. Its behaviour encodes two important rules: a writer blocks when the buffer is full — back-pressure again — and a reader sees end-of-file only when the *last* write descriptor closes. Forgetting to close the parent's copy of the write end is the classic reason a pipeline hangs forever.

Writing more than `PIPE_BUF` (4096 bytes) at once is not atomic, so concurrent writers can interleave mid-message. This is exactly why multi-process logging to one file produces occasional mangled lines.

<a id="28-2-shared-memory"></a>

### 28.2 Shared memory

Map the same physical frames into two address spaces and communication becomes an ordinary memory write: no syscall, no copy, nanoseconds. In exchange you get no synchronisation whatsoever and must supply it yourself — typically with a process-shared mutex or an atomic ring buffer placed *inside* the shared region.

**Shared memory between processes**

```python
import multiprocessing as mp
import time

def worker(buf, lock, n):
    for _ in range(n):
        with lock:                     # the OS gives you ZERO sync here -
            buf[0] += 1                # without the lock this loses updates

if __name__ == "__main__":
    # Genuinely shared memory: one physical page mapped into both processes.
    buf = mp.Array("q", 1, lock=False)
    lock = mp.Lock()                   # a process-shared futex

    N = 200_000
    ps = [mp.Process(target=worker, args=(buf, lock, N)) for _ in range(2)]
    t = time.perf_counter()
    [p.start() for p in ps]; [p.join() for p in ps]

    print("counter:", buf[0], "expected:", 2 * N)
    print(f"{(time.perf_counter() - t) / (2 * N) * 1e9:.0f} ns per locked increment")

    # Compare with a Queue, which copies through a pipe and pickles:
    q = mp.Queue()
    t = time.perf_counter()
    for i in range(20_000):
        q.put(i); q.get()
    print(f"{(time.perf_counter() - t) / 20_000 * 1e6:.1f} µs per queue round trip")
```

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>
#include <pthread.h>

typedef struct {
    pthread_mutex_t lock;          /* the mutex lives IN the shared region */
    long counter;
} shared_t;

int main(void) {
    shared_t *s = mmap(NULL, sizeof *s, PROT_READ | PROT_WRITE,
                       MAP_SHARED | MAP_ANONYMOUS, -1, 0);

    /* A normal mutex is only valid within one address space. This
       attribute is what makes it work across processes. */
    pthread_mutexattr_t attr;
    pthread_mutexattr_init(&attr);
    pthread_mutexattr_setpshared(&attr, PTHREAD_PROCESS_SHARED);
    pthread_mutexattr_setrobust(&attr, PTHREAD_MUTEX_ROBUST); /* survive a crash */
    pthread_mutex_init(&s->lock, &attr);

    if (fork() == 0) {
        for (int i = 0; i < 100000; i++) {
            pthread_mutex_lock(&s->lock);
            s->counter++;
            pthread_mutex_unlock(&s->lock);
        }
        _exit(0);
    }
    for (int i = 0; i < 100000; i++) {
        pthread_mutex_lock(&s->lock);
        s->counter++;
        pthread_mutex_unlock(&s->lock);
    }
    wait(NULL);
    printf("%ld\n", s->counter);       /* 200000 */
    return 0;
}
```

> **Interview**
>
> **"Which IPC would you choose?"** Default to a Unix domain socket: bidirectional, connection-oriented, works with `epoll`, and it can pass file descriptors between processes — a genuinely unique capability that underpins privilege separation in browsers and `systemd` socket activation. Reach for shared memory only when you have measured that the copy is your bottleneck, because you inherit the entire synchronisation problem.

<a id="29-signals"></a>

## 29. Signals

A signal is a software interrupt delivered to a process: one small integer, no payload, arriving at an arbitrary point in execution. It is the oldest IPC mechanism in Unix and by far the most misunderstood.

| Signal | Default | Catchable | Meaning |
| --- | --- | --- | --- |
| `SIGTERM` (15) | terminate | yes | polite "please stop" — what orchestrators send first |
| `SIGKILL` (9) | terminate | **no** | the kernel removes you; no cleanup, no handler |
| `SIGINT` (2) | terminate | yes | Ctrl-C from the terminal |
| `SIGSEGV` (11) | core dump | yes | you touched an address with no mapping |
| `SIGPIPE` (13) | terminate | yes | wrote to a pipe or socket with no reader |
| `SIGCHLD` (17) | ignore | yes | a child stopped or exited — reap it here |
| `SIGSTOP` (19) | stop | **no** | freeze; only `SIGCONT` resumes |
| `SIGHUP` (1) | terminate | yes | terminal closed; by convention, "reload config" |

> **Warning**
>
> **A signal handler runs on your thread's stack, at an arbitrary instruction.** It may interrupt `malloc` halfway through updating its free list. So a handler may only call **async-signal-safe** functions — a short list that excludes `printf`, `malloc` and almost every library you would want. Calling `printf` from a handler is the most common signal bug and it deadlocks rarely enough to reach production.

The standard discipline is the **self-pipe trick** or its modern replacements: the handler does nothing but set a `volatile sig_atomic_t` flag or write one byte to a pipe, and the real work happens in the main loop where normal rules apply. Linux offers `signalfd` and `eventfd` to make signals just another readable descriptor in your `epoll` set, which is strictly better.

**Graceful shutdown, done correctly**

```python
import signal, socket, sys, time

running = True

def on_term(signum, frame):
    # In Python the interpreter defers handlers to bytecode boundaries,
    # so this is safe-ish - but keep it to a flag regardless.
    global running
    running = False

signal.signal(signal.SIGTERM, on_term)
signal.signal(signal.SIGINT, on_term)

# Ignore SIGPIPE and handle the EPIPE error instead: otherwise a client
# disconnecting mid-response kills your whole server.
signal.signal(signal.SIGPIPE, signal.SIG_IGN)

print("working; send SIGTERM to stop cleanly")
while running:
    time.sleep(0.1)                  # ...real work here

print("draining connections, flushing, closing")   # THIS is why SIGTERM
sys.exit(0)                                        # is sent before SIGKILL
```

```c
#include <stdio.h>
#include <signal.h>
#include <unistd.h>
#include <string.h>

static volatile sig_atomic_t stop = 0;   /* the only safe handler state */

static void on_term(int sig) {
    (void)sig;
    stop = 1;                            /* no printf, no malloc, no locks */
}

int main(void) {
    struct sigaction sa;
    memset(&sa, 0, sizeof sa);
    sa.sa_handler = on_term;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;            /* restart interrupted syscalls */
    sigaction(SIGTERM, &sa, NULL);
    sigaction(SIGINT, &sa, NULL);
    signal(SIGPIPE, SIG_IGN);            /* handle EPIPE in code instead */

    while (!stop) {
        pause();                         /* sleep until a signal arrives */
    }

    printf("clean shutdown\n");          /* safe here - not in the handler */
    return 0;
}
```

<a id="30-files-and-descriptors"></a>

## 30. Files, Directories and Descriptors

"Everything is a file" means one interface — `open`, `read`, `write`, `close`, `lseek` — serves regular files, directories, devices, pipes, sockets, and kernel data exposed through `/proc` and `/sys`. One vocabulary, dozens of implementations behind a dispatch table.

<a id="30-1-three-tables"></a>

### 30.1 The three levels

```text
per-process system-wide per-file-system
                descriptor table open file table inode table
                ┌─────────────┐ ┌──────────────────┐ ┌──────────────┐
                │ 0 ──────────┼────┐ │ offset: 4096 │ │ inode 8421 │
                │ 1 ──────────┼──┐ └──▶│ flags: O_RDWR │───▶│ size, mode │
                │ 2 ──────────┼──┘ │ refcount: 2 │ │ uid, times │
                │ 3 ──────────┼───────▶│ offset: 0 │───▶│ block ptrs │
                └─────────────┘ │ flags: O_RDONLY │ └──────────────┘
                └──────────────────┘ ▲
                └── two open() calls make two
                entries pointing at ONE inode

                dup2(1, 2) -> fds 1 and 2 share ONE entry, so they share the OFFSET.
                open() twice -> separate entries, independent offsets, same file.
```

Every behaviour you have wondered about falls out of that picture. Redirecting both stdout and stderr with `>file 2>&1` makes them share an offset so their output interleaves correctly; `>file 2>file` creates two entries with independent offsets and they overwrite each other. A child inherits descriptors after `fork`, so parent and child share the offset — and appending safely from several processes needs `O_APPEND`, which makes seek-and-write atomic in the kernel.

<a id="30-2-directories-and-links"></a>

### 30.2 Directories are just files

A directory's contents are (name → inode number) pairs. The name is not in the inode. Consequences:

- **Hard link** — A second name for the same inode. The inode has a link count; the data goes away when it reaches zero *and* no process holds it open.
- **Symbolic link** — A tiny file containing a path. Resolved at every lookup, may dangle, may cross file systems.
- **Rename is atomic** — Within one file system it only rewrites directory entries, so it is instant regardless of file size — and it is the standard trick for atomic file replacement.
- **Delete does not free space** — Unlinking drops the link count; if a process still has it open, the blocks stay until the last descriptor closes.

**Descriptors, links and atomic replacement**

```python
import os, tempfile

# Two opens = two offsets. dup = one offset shared.
a = os.open("/etc/hostname", os.O_RDONLY)
b = os.open("/etc/hostname", os.O_RDONLY)
c = os.dup(a)
os.read(a, 4)
print("a:", os.lseek(a, 0, os.SEEK_CUR),
      "b:", os.lseek(b, 0, os.SEEK_CUR),      # 0  - independent
      "c:", os.lseek(c, 0, os.SEEK_CUR))      # 4  - shares a's entry
[os.close(fd) for fd in (a, b, c)]

# The only safe way to replace a config file: write a temp file in the
# SAME directory, fsync it, then rename. rename() is atomic, so a reader
# sees either the whole old file or the whole new one - never a partial.
def atomic_write(path, data):
    d = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(dir=d)
    try:
        with os.fdopen(fd, "w") as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())          # the data is now durable
        os.replace(tmp, path)             # atomic swap of the name
        dirfd = os.open(d, os.O_RDONLY)   # and make the RENAME durable too
        os.fsync(dirfd)
        os.close(dirfd)
    except BaseException:
        os.unlink(tmp)
        raise

atomic_write("/tmp/config.json", '{"ok": true}')
```

```bash
# Names are cheap; the inode is the file.
echo hello > a
ln a b                      # hard link - same inode
ln -s a c                   # symlink   - a small file containing "a"
stat -c '%i %h %n' a b c    # inode, link count, name
rm a; cat b                 # fine: link count was 2
cat c                       # broken: the symlink pointed at the NAME

# "df says full, du says empty": deleted-but-open files.
lsof +L1
ls -l /proc/*/fd 2>/dev/null | grep deleted

# Descriptor limits - the usual cause of "too many open files".
ulimit -n
cat /proc/<pid>/limits | grep 'open files'
ls /proc/<pid>/fd | wc -l
```

<a id="31-file-system-implementation"></a>

## 31. File System Implementation

A disk offers fixed-size blocks at numeric addresses. A file system builds named, growable byte streams on top. Its on-disk layout is always some version of the same four regions.

```text
┌────────┬──────────────┬──────────────┬───────────────┬────────────────────────┐
                │ boot │ super block │ inode bitmap │ inode table │ data blocks │
                │ block │ (geometry, │ + data │ (one entry │ (file contents and │
                │ │ block size, │ bitmap │ per file) │ directory entries) │
                │ │ counts) │ (free maps) │ │ │
                └────────┴──────────────┴──────────────┴───────────────┴────────────────────────┘

                Reading /home/pankaj/notes.txt costs, cold:
                inode of / → data of / → inode of home → data of home →
                inode of pankaj → data of pankaj → inode of notes.txt → data
                = 8 disk reads for one open(). Hence the dentry cache.
```

> **Interactive animation:** `inode` — rendered by the page script in the HTML version.

<a id="31-1-tracking-blocks"></a>

### 31.1 Three ways to record where the data is

- **Contiguous** — Store start and length. Fast sequential reads, trivial random access — and external fragmentation plus the impossibility of growth. Used only for read-only media.
- **Linked** — Each block points at the next. No fragmentation, no growth limit — and random access is `O(n)` because you must walk. FAT is this, with the pointers pulled out into one table so the walk is at least in memory.
- **Indexed (inodes)** — An index block holds the block numbers. Direct pointers for small files, single/double/triple indirection for large ones. Random access in a bounded number of steps, no fragmentation, and small files stay cheap.
- **Extents** — Store (start, length) pairs instead of individual block numbers. A 1 GB contiguous file needs one extent rather than 262,144 pointers. Every modern file system — ext4, XFS, btrfs, NTFS — uses these.

<a id="31-2-the-vfs"></a>

### 31.2 The VFS layer

Linux supports dozens of file systems behind one API through the **virtual file system**: an abstract set of objects (superblock, inode, dentry, file) with operation tables that each concrete file system fills in. `read()` calls `file->f_op->read_iter()`, and whether that lands in ext4, NFS, procfs or FUSE is invisible to your program. It is straightforward object-oriented dispatch written in C, and it is what lets `/proc` pretend to be files that do not exist.

The **dentry cache** sits in front of it, memoising path components so the eight-read walk above happens once rather than on every `open`. This cache is frequently the largest slab consumer on a busy file server.

<a id="32-crash-consistency"></a>

## 32. Crash Consistency and Journalling

Appending one block to a file requires three separate writes: the data block, the inode (size and the new pointer), and the free-space bitmap. A crash between any two leaves the file system *inconsistent* — and the disk may reorder them, so "between" is not even well defined.

| Crash after | Result |
| --- | --- |
| data only | harmless — the block is not referenced by anything |
| inode only | the file points at a block the bitmap says is free: it will be handed to another file |
| bitmap only | a leaked block — space lost until `fsck` |
| inode + bitmap | the file contains whatever garbage was in that block: possibly another user's old data |

<a id="32-1-fsck-vs-journal"></a>

### 32.1 From `fsck` to journalling

The original answer was to scan the entire file system after a crash and repair whatever looks wrong. `fsck` works, is unbearably slow on a large volume, and cannot recover intent — it can tell that a block is orphaned but not what the file was supposed to contain.

**Journalling** borrows write-ahead logging from databases. Before touching the real structures, write what you are about to do into a circular log and commit it. After a crash, replay the log — every committed transaction is redone, every incomplete one ignored. Recovery time depends on the journal size, not the disk size, which is why a modern machine mounts in seconds after a power cut.

- **journal (full)** — Data and metadata both go to the journal. Safest, and everything is written twice.
- **ordered (default)** — Only metadata is journalled, but data is forced to disk *before* the metadata that references it. You never see another file's old bytes.
- **writeback** — Metadata journalled, data unordered. Fast, and after a crash a file can contain stale data from whoever owned that block previously.
- **Copy-on-write** — ZFS and btrfs never overwrite: they write new blocks and atomically swap the root pointer. No journal at all, plus free snapshots — at the cost of fragmentation over time.

<a id="32-2-fsync"></a>

### 32.2 `fsync` is the only durability promise

`write()` returning means the bytes are in the page cache. Nothing more. Until `fsync` returns, a power cut loses them. And `fsync` on the file is not enough when you created or renamed it — the *directory entry* needs its own `fsync`, which is the step almost everyone omits.

> **Warning**
>
> It gets worse: on Linux, if `fsync` fails, the dirty pages may be marked clean and dropped, so **retrying `fsync` can return success while your data is gone**. This is the "fsyncgate" that led PostgreSQL to panic and recover from the WAL rather than retry. The lesson for application code: treat a failed `fsync` as an unrecoverable error for that file, not something to retry.

**What durability costs**

```python
import os, time

def bench(label, do_fsync, n=2000):
    fd = os.open("/tmp/durability", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
    t = time.perf_counter()
    for i in range(n):
        os.write(fd, b"x" * 512)
        if do_fsync:
            os.fsync(fd)                  # wait for the device, every time
    os.fsync(fd)
    os.close(fd)
    dt = time.perf_counter() - t
    print(f"{label:22} {n/dt:9.0f} writes/s")

bench("page cache only", False)           # tens of thousands per second
bench("fsync every write", True)          # hundreds - this is the device

# fdatasync skips metadata that does not affect retrieval (mtime), which
# is measurably faster and is what databases use for their log files.
# The full durable-create recipe:
#   1. write the data
#   2. fsync the FILE
#   3. rename into place
#   4. fsync the DIRECTORY   <- the step everyone forgets
```

```bash
# What journalling mode is this file system using?
sudo tune2fs -l /dev/sda1 | grep -i 'features\|journal'
mount | grep ' / '                       # look for data=ordered

# Is a device lying about flush? Batteries and capacitors matter here.
sudo hdparm -W /dev/sda                  # write cache enabled?

# Measure the real fsync latency of a device:
fio --name=fsync --rw=write --bs=4k --size=64m --fsync=1 --filename=/tmp/f

# Watch writeback happening:
grep -E 'Dirty|Writeback' /proc/meminfo
sudo iotop -o                            # which process is flushing?
```

<a id="33-the-io-subsystem"></a>

## 33. The I/O Subsystem

Devices are between a thousand and a billion times slower than the CPU, so the entire I/O design is about never blocking a core on one.

> **Interactive animation:** `interrupt` — rendered by the page script in the HTML version.

<a id="33-1-three-ways-to-talk-to-a-device"></a>

### 33.1 Three ways to move the data

1. **Programmed I/O with polling.** The CPU asks "ready?" in a loop and copies byte by byte. Simple, and it burns a whole core. Only sensible when the wait is shorter than an interrupt — which, at ten million packets a second, it is.
2. **Interrupt-driven I/O.** The device raises a line when ready; the CPU does something else meanwhile. The CPU still copies the data, so a fast device generates an interrupt per block and the overhead dominates.
3. **DMA.** The device controller writes straight into RAM and interrupts once when the whole transfer is complete. The CPU is uninvolved for the duration. This is how all serious I/O works.

> **Key idea**
>
> DMA is also why an `fsync` is not enough on its own and why IOMMUs exist: a device writing directly into physical memory can, without an IOMMU, write *anywhere*. That is a security boundary problem, and it is why Thunderbolt DMA attacks were possible and why VMs need IOMMU support for device passthrough.

<a id="33-2-top-and-bottom-halves"></a>

### 33.2 Top and bottom halves

An interrupt handler runs with interrupts disabled on its core, so it must be short or it delays every other device. Linux therefore splits handling: the **top half** acknowledges the device and schedules work; the **bottom half** (softirq, tasklet, or a kernel thread) does the real processing later with interrupts enabled. Under extreme load even this is too expensive, so network drivers switch to **NAPI** polling — the one case where busy-waiting is correct, because at that rate there is always another packet.

<a id="33-3-io-models"></a>

### 33.3 The four I/O models

| Model | How you wait | Syscalls per op | Scales to |
| --- | --- | --- | --- |
| Blocking | the thread sleeps | 1 | hundreds of connections |
| `select`/`poll` | pass the whole set every call | 1 + O(n) scan | ~1000, then the scan dominates |
| `epoll`/`kqueue` | the kernel keeps the set; you get ready ones | ~1 per batch | hundreds of thousands |
| `io_uring`/IOCP | shared submission and completion rings | **0 in steady state** | millions of ops/sec |

**An epoll event loop**

```python
import selectors, socket

# selectors picks epoll on Linux, kqueue on BSD/macOS. One thread,
# one core, thousands of connections - because the thread only ever
# runs when a descriptor can actually make progress.
sel = selectors.DefaultSelector()

server = socket.socket()
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 8080))
server.listen(512)                       # the accept backlog IS a bounded queue
server.setblocking(False)

def on_accept(sock):
    conn, _ = sock.accept()
    conn.setblocking(False)              # essential: one slow read would
    sel.register(conn, selectors.EVENT_READ, on_read)   # stall everyone

def on_read(conn):
    data = conn.recv(4096)
    if not data:
        sel.unregister(conn); conn.close(); return
    conn.sendall(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok")

sel.register(server, selectors.EVENT_READ, on_accept)

while True:
    for key, _ in sel.select():          # ONE syscall returns every ready fd
        key.data(key.fileobj)

# The cardinal rule: never make a blocking call in here. One synchronous
# database query stalls every other connection on this thread - the
# many-to-one thread model's flaw, rediscovered.
```

```bash
# Which I/O model is a process using? Look at what it blocks in.
strace -c -p <pid>              # epoll_wait? io_uring_enter? read?

# Accept backlog: Recv-Q on a LISTEN socket is the queue depth.
# If it sits at Send-Q (the limit), you are dropping connections.
ss -ltn

# Per-device I/O: %util near 100 with high await means the device is
# saturated; high await with low %util means queueing elsewhere.
iostat -xz 1

# Which process is doing the I/O?
sudo iotop -oPa
sudo biolatency-bpfcc 10 1     # latency histogram, from eBPF
```

<a id="34-disks-and-ssds"></a>

## 34. Disks, SSDs and I/O Scheduling

<a id="34-1-spinning-disks"></a>

### 34.1 Spinning disks

A read costs **seek time** (move the arm, ~5–10 ms) plus **rotational latency** (wait for the sector, half a revolution ≈ 4 ms at 7200 rpm) plus **transfer** (microseconds). Mechanical positioning is 99% of the cost, which is why sequential access is 100× faster than random and why the order you serve requests in matters so much.

> **Interactive animation:** `disk-scheduling` — rendered by the page script in the HTML version.

<a id="34-2-ssds"></a>

### 34.2 SSDs are a different machine

Flash has no moving parts, so seek distance is meaningless and random reads cost about the same as sequential ones. But it has a constraint no disk has: **you can program a page but you can only erase a whole block** (hundreds of pages). Overwriting 4 KB in place would mean erasing and rewriting megabytes.

The flash translation layer therefore never overwrites: it writes the new data elsewhere, remaps the logical address, and marks the old page invalid. A background **garbage collector** later consolidates partly-invalid blocks and erases them. Three consequences follow directly:

- **Write amplification** — A 4 KB logical write can cost far more physical writing. Keeping free space (over-provisioning) reduces it substantially.
- **TRIM matters** — The drive cannot know a block is unused unless the file system says so. Without TRIM the GC preserves data nobody wants.
- **Latency is bimodal** — Most writes are fast; the one that triggers GC is not. This is a common source of unexplained p99 spikes on otherwise idle-looking storage.

|   | HDD | SATA SSD | NVMe SSD |
| --- | --- | --- | --- |
| Random read latency | ~10 ms | ~100 µs | ~20 µs |
| Random IOPS | ~100 | ~90,000 | ~1,000,000 |
| Sequential vs random | 100× difference | ~2× difference | ~2× difference |
| Right I/O scheduler | `bfq` / `mq-deadline` | `mq-deadline` | `none` |

> **Warning**
>
> Carrying spinning-disk intuition to flash produces confidently wrong advice. "Defragment the database", "sort your I/O by offset", "sequential-only workloads" — all were sound in 2005 and are now noise or actively harmful (defragmenting an SSD just burns write cycles). Check what the device *is* before applying a rule about what it used to be.

**Knowing your storage**

```bash
# Rotational? 1 = spinning disk, 0 = SSD.
cat /sys/block/sda/queue/rotational

# Which scheduler is in use, and what is available?
cat /sys/block/nvme0n1/queue/scheduler      # [none] mq-deadline kyber bfq
echo none | sudo tee /sys/block/nvme0n1/queue/scheduler

# Queue depth and read-ahead - both worth tuning per workload.
cat /sys/block/sda/queue/nr_requests
blockdev --getra /dev/sda

# Measure rather than assume: random vs sequential on this device.
fio --name=randread --ioengine=libaio --direct=1 --rw=randread \
    --bs=4k --iodepth=32 --size=1G --runtime=30 --filename=/tmp/fio

# Is TRIM running?
sudo systemctl status fstrim.timer
lsblk --discard                              # DISC-GRAN non-zero = supported
```

<a id="unit-6"></a>

## Unit 6 — Protection, Virtualisation & Practice

Security boundaries, virtual machines and containers, debugging on Linux, and the revision material.

<a id="35-protection-and-security"></a>

## 35. Protection and Security

*Protection* is the mechanism — who may do what. *Security* is the policy and the threat model. The kernel provides mechanism; you choose policy.

<a id="35-1-the-layers"></a>

### 35.1 The layers, from hardware up

1. **Privilege rings** — user code cannot execute privileged instructions (§2).
2. **Page permissions** — read/write/execute and user/supervisor per page. W^X means no page is both writable and executable, which turns most memory-corruption bugs into crashes rather than code execution.
3. **Users, groups and file modes** — the classic discretionary model. Coarse, but it is what everything else is built on.
4. **Capabilities** — split root's powers into ~40 pieces so a web server can bind port 80 (`CAP_NET_BIND_SERVICE`) without being able to load kernel modules.
5. **Mandatory access control** — SELinux and AppArmor add a policy the file owner cannot override.
6. **seccomp** — restrict a process to a whitelist of syscalls. This is the single most effective sandboxing tool available, and what container runtimes and browsers rely on.
7. **Namespaces and cgroups** — change what a process can see and how much it can use (§36).

<a id="35-2-mitigations"></a>

### 35.2 Why exploitation got harder

- **ASLR** — Randomise where the stack, heap and libraries land, so an attacker cannot hard-code an address.
- **NX / DEP** — The stack is not executable, so injected shellcode cannot run. (Attackers responded with return-oriented programming, reusing existing code.)
- **Stack canaries** — A random value before the return address; if it changed, abort.
- **KASLR, KPTI, SMEP/SMAP** — The same ideas applied to the kernel — including unmapping the kernel during user execution, which is the Meltdown mitigation that made syscalls measurably slower.
- **Side channels remain** — Spectre and friends leak data through timing rather than memory access, so no permission bit stops them. Mitigation is expensive and ongoing.

**Locking a process down**

```python
import os, resource, ctypes

# 1. Drop privileges as early as possible, groups first - a common bug
#    is dropping the uid while keeping a privileged group.
def drop_privileges(uid, gid):
    os.setgroups([])
    os.setgid(gid)          # gid BEFORE uid, or you lose the right to do it
    os.setuid(uid)
    assert os.setuid not in (0,) and os.getuid() == uid

# 2. Bound the damage a bug can do.
resource.setrlimit(resource.RLIMIT_NOFILE, (1024, 1024))
resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))       # no fork bombs
resource.setrlimit(resource.RLIMIT_CORE, (0, 0))          # no core dumps

# 3. Refuse to ever gain privilege again, even via a setuid binary.
PR_SET_NO_NEW_PRIVS = 38
ctypes.CDLL("libc.so.6").prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0)

# 4. Then restrict syscalls with seccomp (via pyseccomp / libseccomp).
#    A parser that only needs read/write/exit does not need socket().
```

```bash
# Which mitigations does this CPU/kernel have enabled?
grep . /sys/devices/system/cpu/vulnerabilities/*

# ASLR: 2 = full (default), 0 = off. Turn it off only to debug.
cat /proc/sys/kernel/randomize_va_space
setarch $(uname -m) -R ./program        # run once with ASLR disabled

# What is this binary's own hardening?
checksec --file=/usr/bin/ssh            # RELRO, canary, NX, PIE

# Capabilities instead of root:
sudo setcap cap_net_bind_service=+ep ./server
getcap ./server

# Is the process seccomp-confined?  2 = filter mode.
grep Seccomp /proc/<pid>/status

# systemd does most of this declaratively:
#   NoNewPrivileges=yes  PrivateTmp=yes  ProtectSystem=strict
#   SystemCallFilter=@system-service     MemoryMax=512M
```

<a id="36-virtualisation-and-containers"></a>

## 36. Virtualisation and Containers

Virtualisation applies the OS's own trick one level up: give each guest the illusion of a whole machine. Containers do something quite different despite the similar packaging.

<a id="36-1-hypervisors"></a>

### 36.1 Hypervisors

A virtual machine monitor multiplexes real hardware among guest kernels. The hard part is that a guest kernel expects to execute privileged instructions. Three solutions were tried in order:

1. **Trap-and-emulate** — run the guest deprivileged and emulate each trapping instruction. Classic x86 broke this: seventeen instructions failed silently instead of trapping.
2. **Binary translation** (VMware) — rewrite the guest kernel's instruction stream on the fly. Ingenious and complex.
3. **Hardware assist** (Intel VT-x, AMD-V) — add a genuine "guest mode" so privileged instructions trap properly, plus *nested paging* (EPT) so guest-virtual → guest-physical → host-physical translation happens in hardware. This is what everything uses now.

<a id="36-2-containers"></a>

### 36.2 Containers

A container is an ordinary process with three kernel features applied. There is no container object in the kernel — `ps` on the host shows the processes plainly.

- **Namespaces — what it can see** — PID, mount, network, user, UTS, IPC, cgroup, time. Created by passing `CLONE_NEW*` flags to the same `clone()` that makes threads.
- **cgroups — what it can use** — CPU weight and quota, memory limit, I/O bandwidth, PID count. Exceeding the memory limit means an OOM kill scoped to the container.
- **Union file system — what it reads** — Layered, copy-on-write images. Read-only layers shared between containers; writes copy the file up. The same lazy-copy idea as §23, at file granularity.

> **Warning**
>
> Two consequences bite people constantly. First, **a runtime that sizes its thread pool or heap from the host's CPU and memory count will be wrong inside a container**, because `/proc/cpuinfo` and `/proc/meminfo` still describe the host — read `/sys/fs/cgroup/cpu.max` and `memory.max` instead. Second, your process is **PID 1**, so it must reap zombies and handle `SIGTERM`, or use `--init`.

**Building a container by hand**

```bash
# There is no magic. unshare creates namespaces directly.
sudo unshare --pid --fork --mount-proc --uts --net --ipc --mount bash
hostname isolated                 # UTS namespace: does not affect the host
ps aux                            # PID namespace: bash is PID 1
ip addr                           # NET namespace: only loopback exists
exit

# cgroup v2 limits, applied by hand:
sudo mkdir /sys/fs/cgroup/demo
echo "200000 1000000" | sudo tee /sys/fs/cgroup/demo/cpu.max   # 0.2 CPU
echo "256M"           | sudo tee /sys/fs/cgroup/demo/memory.max
echo $$               | sudo tee /sys/fs/cgroup/demo/cgroup.procs
# ...this shell is now limited. Check the accounting:
cat /sys/fs/cgroup/demo/cpu.stat /sys/fs/cgroup/demo/memory.events

# From outside, a container is just processes:
docker run -d --name x --memory 256m --cpus 0.5 nginx
ps -ef | grep nginx               # visible on the host
sudo ls -l /proc/<pid>/ns         # its namespace identifiers
cat /proc/<pid>/cgroup            # which cgroup it belongs to
```

```python
import os

def cgroup_limits():
    """Read the limits that actually apply, not the host's hardware."""
    try:
        quota, period = open("/sys/fs/cgroup/cpu.max").read().split()
        cpus = None if quota == "max" else int(quota) / int(period)
    except FileNotFoundError:
        cpus = None
    try:
        mem = open("/sys/fs/cgroup/memory.max").read().strip()
        mem = None if mem == "max" else int(mem)
    except FileNotFoundError:
        mem = None
    return cpus, mem

cpus, mem = cgroup_limits()
print("host cores reported by the OS:", os.cpu_count())
print("cores this cgroup may use    :", cpus)
print("memory limit (bytes)         :", mem)

# Size pools from the LIMIT, not from cpu_count(). Getting this wrong on
# a 64-core host with a 0.5-CPU quota creates 64 worker threads that
# collectively get half a core - all switching, no throughput.
workers = max(1, int(cpus or os.cpu_count()))
print("threads to start             :", workers)
```

<a id="37-performance-debugging"></a>

## 37. Performance Debugging on Linux

Everything above becomes useful the moment you can measure it. The method matters more than the tools: start from a symptom, form a hypothesis about *which resource* is the constraint, and take the measurement that would disprove it.

<a id="37-1-use-method"></a>

### 37.1 The USE method

For every resource, check three things: **U**tilisation, **S**aturation (queued work), **E**rrors. It is systematic, it terminates, and it finds problems that intuition skips past.

| Resource | Utilisation | Saturation | Errors |
| --- | --- | --- | --- |
| CPU | `mpstat -P ALL 1` | run queue in `vmstat`, `/proc/pressure/cpu` | throttling in `cpu.stat` |
| Memory | `free -h`, `MemAvailable` | `si`/`so`, major faults, PSI | OOM kills in `dmesg` |
| Disk | `iostat -xz 1` (%util) | `aqu-sz`, `await`, PSI io | `dmesg`, SMART |
| Network | `sar -n DEV 1` | `ss -ti` retransmits, backlog drops | `ip -s link`, `netstat -s` |

<a id="37-2-the-first-sixty-seconds"></a>

### 37.2 The first sixty seconds

**A triage checklist**

```bash
uptime                  # is load high, and is it rising?
dmesg -T | tail -30     # OOM kills, disk errors, hung tasks
vmstat 1 5              # r (runnable) vs b (blocked); si/so = swapping
mpstat -P ALL 1 3       # one hot core, or all of them? %iowait? %steal?
pidstat 1 3             # which process is responsible
iostat -xz 1 3          # %util, await, queue depth per device
free -h                 # available, not free. Is swap in use?
sar -n DEV 1 3          # network throughput and errors
top -H                  # per-thread view of the top offender

# Then narrow down:
cat /proc/pressure/{cpu,io,memory}     # PSI beats load average
perf top -p <pid>                      # where are the cycles going?
perf record -F 99 -g -p <pid> -- sleep 20 && perf report
strace -c -f -p <pid>                  # which syscalls dominate?

# %steal above zero on a VM means the hypervisor is descheduling you -
# the problem is not on your machine at all.
```

> **Key idea**
>
> Two numbers separate almost every case. **High CPU + slow** → you are compute-bound; profile the code and look at cache misses. **Low CPU + slow** → you are blocked; find the syscall, the lock, or the downstream service. Reaching for a CPU profiler on a blocked process is the most common wasted hour in performance work.

<a id="37-3-flame-graphs"></a>

### 37.3 Flame graphs and eBPF

A CPU flame graph shows where cycles go: sample stacks at 99 Hz, aggregate, plot width by frequency. An **off-CPU** flame graph is the more useful half for the "low CPU + slow" case: it samples where threads are *blocked*, aggregating by the stack that led to the sleep. eBPF makes both cheap enough to run in production, along with tools like `biolatency`, `runqlat` (scheduler queueing) and `execsnoop`.

**Profiling both halves**

```bash
# On-CPU: where are the cycles spent?
perf record -F 99 -a -g -- sleep 30
perf script | stackcollapse-perf.pl | flamegraph.pl > cpu.svg

# Off-CPU: where is the time spent BLOCKED? Usually more informative.
sudo offcputime-bpfcc -df -p <pid> 30 | flamegraph.pl > offcpu.svg

# Scheduler latency: how long do runnable threads wait for a core?
sudo runqlat-bpfcc 10 1

# Block I/O latency distribution:
sudo biolatency-bpfcc 10 1

# What is being executed, system-wide? Great for finding surprise forks.
sudo execsnoop-bpfcc

# One-off questions with bpftrace:
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat { @[comm] = count(); }'
sudo bpftrace -e 'kprobe:vfs_read { @bytes = hist(arg2); }'
```

<a id="38-cheat-sheet"></a>

## 38. Cheat Sheet

<a id="38-1-latency-numbers"></a>

### 38.1 Latency numbers

| Operation | Time | If L1 were 1 second |
| --- | --- | --- |
| L1 cache reference | `1 ns` | 1 second |
| Branch mispredict | `3 ns` | 3 seconds |
| L2 cache reference | `4 ns` | 4 seconds |
| Mutex lock/unlock, uncontended | `20 ns` | 20 seconds |
| Main memory reference | `100 ns` | 1.5 minutes |
| Compress 1 KB with Snappy | `2 µs` | 33 minutes |
| System call | `1–2 µs` | ~25 minutes |
| Context switch | `1–5 µs` | ~1 hour |
| Send 1 KB over 1 Gbps | `10 µs` | 3 hours |
| SSD random read | `100 µs` | 1 day |
| Read 1 MB sequentially from SSD | `250 µs` | 3 days |
| Round trip within a datacentre | `500 µs` | 6 days |
| Disk seek | `10 ms` | 4 months |
| Round trip California ↔ Netherlands | `150 ms` | 5 years |

<a id="38-2-syscalls"></a>

### 38.2 The system calls worth knowing by heart

| Area | Calls |
| --- | --- |
| Processes | `fork`, `clone`, `execve`, `wait4`, `exit_group`, `getpid`, `kill` |
| Files | `open`, `read`, `write`, `close`, `lseek`, `stat`, `unlink`, `rename`, `fsync` |
| Descriptors | `dup2`, `pipe`, `fcntl`, `splice`, `sendfile` |
| Memory | `mmap`, `munmap`, `mprotect`, `brk`, `madvise`, `mlock` |
| Sockets | `socket`, `bind`, `listen`, `accept4`, `connect`, `setsockopt` |
| Waiting | `epoll_create1`, `epoll_ctl`, `epoll_wait`, `futex`, `io_uring_enter` |
| Isolation | `unshare`, `setns`, `seccomp`, `prctl`, `capset` |

<a id="38-3-files-to-read"></a>

### 38.3 Files that answer questions

| Path | Tells you |
| --- | --- |
| `/proc/PID/status` | state, threads, VmRSS, VmSwap, seccomp mode |
| `/proc/PID/maps`, `smaps_rollup` | every mapping, and where the memory really went |
| `/proc/PID/fd/` | open descriptors — including deleted-but-open files |
| `/proc/PID/stack`, `wchan` | which kernel function a blocked task is sitting in |
| `/proc/PID/limits`, `cgroup` | rlimits, and which container it belongs to |
| `/proc/pressure/{cpu,io,memory}` | PSI — the single best saturation signal |
| `/proc/meminfo`, `slabinfo`, `buddyinfo` | where all the RAM is |
| `/sys/fs/cgroup/*` | the limits that actually apply to you |
| `/sys/block/DEV/queue/*` | rotational, scheduler, read-ahead, queue depth |

<a id="39-pattern-recognition-playbook"></a>

## 39. Pattern-Recognition Playbook

Symptom on the left, the mechanism from this course on the right. Most production mysteries are on this list.

| Symptom | Almost certainly | Confirm with |
| --- | --- | --- |
| High latency, CPUs idle | blocked on I/O, a lock, or a downstream call (§7, §16) | `ps` state, off-CPU profile, thread dump |
| High CPU, low throughput | cache misses, lock contention, or GC (§16, §27) | `perf stat`, `perf top` |
| Load average huge, CPUs idle | tasks stuck in `D` state — storage (§7) | `ps -eo stat,wchan`, `iostat` |
| Everything freezes, disk at 100% | thrashing (§25) | `vmstat` si/so, `/proc/pressure/memory` |
| Killed with exit code 137 | OOM killer or a cgroup memory limit (§23, §36) | `dmesg`, `memory.events` |
| RSS grows and never falls | allocator free lists, not necessarily a leak (§26) | `malloc_stats`, `smaps_rollup`, valgrind |
| `df` full but `du` small | deleted files still held open (§30) | `lsof +L1` |
| "Too many open files" | descriptor leak or a low `RLIMIT_NOFILE` (§6) | `ls /proc/PID/fd \| wc -l` |
| Data lost after a power cut | no `fsync`, or no directory `fsync` (§32) | read the write path; `strace -e fsync` |
| Wrong answers only under load | a data race (§15) | thread sanitiser; look for unlocked shared state |
| Hangs, no CPU used | deadlock (§19) | thread dump — two threads, two locks, opposite order |
| Spins at 100%, no progress | livelock or a busy-wait loop (§19) | `perf top` shows the retry loop |
| Slow only after container start | cold page cache, or cgroup CPU throttling (§27, §36) | `cpu.stat` `nr_throttled` |
| p99 spikes on an idle SSD | flash garbage collection, or THP compaction (§22, §34) | `biolatency`, THP setting |
| Slow on a big machine only | NUMA remote memory or cross-socket migration (§14) | `numastat`, `perf stat -e node-load-misses` |
| `%steal` above zero | the hypervisor is descheduling your vCPU (§36) | `mpstat -P ALL` — not your problem to fix |

<a id="39-1-three-moves"></a>

### 39.1 The three moves behind every mechanism

1. **Add a level of indirection.** Page tables, file descriptors, the VFS, the IDT, the FTL inside an SSD. Costs a lookup; buys relocation, sharing and protection.
2. **Cache the expensive thing.** TLB, page cache, dentry cache, allocator free lists, per-CPU run queues. Costs coherence and staleness; buys orders of magnitude.
3. **Do it lazily.** Demand paging, copy-on-write, overcommit, delayed allocation, buffered writes. Costs a fault later and a durability window; buys never paying for what you do not use.

> **Key idea**
>
> Meet an unfamiliar mechanism and ask which of the three it is. Then ask what it costs, because all three have the same shape of bill: indirection costs a lookup, caching costs staleness, laziness costs a spike at the worst moment. Every "surprising" OS behaviour in this course is one of those three bills arriving.

<a id="40-practice-roadmap"></a>

## 40. Practice Roadmap

Reading about this material does not stick. Building small pieces of it does. The projects below are ordered so each one uses what the previous one taught, and each is small enough to finish.

<a id="40-1-week-by-week"></a>

### 40.1 Six projects, in order

1. **A shell.** `fork`, `exec`, `wait`, then pipes with `pipe` and `dup2`, then redirection, then background jobs and `SIGCHLD`. You will get the descriptor-closing bug and learn more from it than from this page. *Covers §6, §8, §28, §29, §30.*
2. **A thread pool with a bounded queue.** Mutex plus two condition variables, graceful shutdown, and a deliberate test that would fail without the loop around `wait`. *Covers §15–18.*
3. **A memory allocator.** Start with `sbrk` and a free list, add splitting and coalescing, then size classes. Measure fragmentation against `malloc`. *Covers §20, §26.*
4. **A scheduler simulator.** Implement FCFS, SJF, RR, priority and MLFQ over the same workload and plot the metrics from §11. Then add I/O bursts and watch which policies cope. *Covers §11–13.*
5. **A page-replacement simulator.** FIFO, LRU, Clock and Optimal on a real trace (`valgrind --tool=lackey` will produce one). Reproduce Belady's anomaly deliberately. *Covers §23–25.*
6. **A user-space file system with FUSE.** Inodes, directories, and a block allocator. Then kill it mid-write and see exactly why journalling exists. *Covers §30–32.*

<a id="40-2-work-on-your-own-machine"></a>

### 40.2 Then look at your own machine

- **Read `/proc` for a real service** — Its maps, its descriptors, its cgroup, its state. Predict what you will find before you look.
- **Trace a request end to end**`strace -f` one HTTP request through your service and count the syscalls. The number is usually shocking.
- **Make a flame graph of something slow** — Then make an off-CPU one and see how different the story is.
- **Break something on purpose** — Fill a disk, exhaust descriptors, trigger an OOM kill, cause a deadlock. Recognising the signature later is worth more than reading about it.

<a id="40-3-going-deeper"></a>

### 40.3 Going deeper

1. 📘 [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/) — free, and the clearest book on this material. Virtualisation, then concurrency, then persistence.
2. 🧪 [MIT 6.1810 and xv6](https://pdos.csail.mit.edu/6.828/) — a complete Unix kernel you can read in a weekend, with labs that make you implement page tables, a scheduler and a file system.
3. 🐧 [LWN's kernel index](https://lwn.net/Kernel/Index/) — how the ideas here are actually evolving: EEVDF, MGLRU, io_uring, folios.
4. 🔍 [Brendan Gregg — Linux performance](https://www.brendangregg.com/linuxperf.html) — the USE method, flame graphs, and the eBPF toolkit.
5. 📖 [man7.org](https://man7.org/linux/man-pages/) — the manual pages are the specification, and section 2 and 7 are far better written than their reputation suggests.
6. 🖥️ ["CPU utilization is wrong"](https://www.brendangregg.com/blog/2017-05-09/cpu-utilization-is-wrong.html) — a short read that will change how you interpret every dashboard you own.

> **Key idea**
>
> If you remember one thing from forty sections: **the operating system is not magic, it is a set of trades somebody made on your behalf.** Learn what each one bought and what it cost, and the machine stops being mysterious — it becomes a system you can reason about, and occasionally out-argue.

> *"Those who do not understand Unix are condemned to reinvent it, poorly."* — Henry Spencer

---

TechToday Study Library — Operating Systems
