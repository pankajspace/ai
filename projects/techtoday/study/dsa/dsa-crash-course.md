<!--
Source: dsa-crash-course.html
Title: DSA Crash Course | TechToday
Description: A visual crash course in data structures and algorithms — every structure explained with a real-world mental model, animated, and shown in Python and JavaScript.
Theme-color: #0b0d10
Stylesheets: dsa-study.css, ../../site-header.css
Scripts: dsa-study.js
-->

Navigation: [TechToday](../../index.html) · [← DSA Courses](dsa-courses.html)

<a id="dsa-crash-course"></a>

# Data Structures & Algorithms

Every structure here comes with a picture you already have in your head — cinema seats, a treasure hunt, a pile of plates, a ticket queue. Learn the mental model first and the code stops being something to memorise. Press **Play** on any animation to watch the idea move.

> **Key idea**
>
> The whole field answers one question: **given the shape of my data and the operations I need, what is the cheapest way to arrange it?** Every structure below is one answer, and every one is a trade — you buy fast lookups with extra memory, or fast inserts with slow scans. Nothing is universally best.

<a id="table-of-contents"></a>

## Table of Contents

1. [The Only Maths You Need](#0-the-only-maths-you-need)
2. [Arrays](#1-arrays)
3. [Strings](#strings)
4. [Linked Lists](#2-linked-lists)
5. [Stacks](#3-stacks)
6. [Queues](#4-queues)
7. [Hash Tables & Sets](#5-hash-tables-and-sets)
8. [Trees](#6-trees)
9. [Graphs](#7-graphs)
10. [Searching](#8-searching)
11. [Sorting](#9-sorting)
12. [The Four Problem-Solving Philosophies](#10-the-four-problem-solving-philosophies)
13. [The Whole Thing on One Page](#11-the-whole-thing-on-one-page)

<a id="0-the-only-maths-you-need"></a>

## The Only Maths You Need

Before any structure makes sense you need one idea: **Big-O**. It does not measure seconds — seconds depend on your laptop. It measures how the work *grows* as the input grows, which is the only thing that still matters when your ten test rows become ten million production rows.

> **Analogy** 🔍
>
> **Picture it — finding a name in a phone book**
>
> Reading every name from page one is `O(n)`: twice the book, twice the work. Opening the middle and halving repeatedly is `O(log n)`: twice the book costs you *one* extra step. That gap is the entire subject.

1. `O(1)` **constant** — array index, hash lookup. Input size is irrelevant.
2. `O(log n)` **logarithmic** — binary search, balanced trees. You halve the problem each step.
3. `O(n)` **linear** — one pass over everything.
4. `O(n log n)` **linearithmic** — the good sorts. In practice, close enough to linear.
5. `O(n²)` **quadratic** — nested loops comparing every pair. Fine for thousands, painful beyond.
6. `O(2ⁿ)` / `O(n!)` — every subset, every permutation. Dies around `n = 30` and `n = 12` respectively.

> **Tip**
>
> A yardstick worth memorising: a machine does roughly **10⁸ simple operations per second**. So at `n = 100,000`, an `O(n²)` solution needs `10¹⁰` operations and will time out, while `O(n log n)` needs about `1.7 × 10⁶` and finishes instantly. Read a problem's limits and they tell you which complexity is expected.

Big-O measures **space** the same way it measures time — and it is the half people forget. What counts is the *extra* memory an algorithm allocates, not the input itself. Two things catch beginners out: **the call stack is memory**, so recursing `n` deep costs `O(n)` even if you allocate nothing; and **slicing copies**, so `nums[1:]` inside a loop quietly turns a linear algorithm quadratic.

---

<a id="unit-1"></a>

## Unit 1 — Foundational Linear Structures

Linear structures store data sequentially: one item after another, in a row or a defined order.

<a id="1-arrays"></a>

### Arrays

- **Access** `O(1)`
- **Search** `O(n)`
- **Insert / delete in middle** `O(n)`

The most fundamental structure: a collection of items stored in **contiguous** memory blocks. The computer reserves a run of slots right next to each other, and each slot gets a serial number — an **index** — starting at **0**.

> **Analogy** 🎬
>
> **Picture it — cinema seats**
>
> Seats in a row, numbered in order. With a ticket for Seat 5 you do not ask everyone in seats 1 to 4 where it is — you walk straight to it. That is constant-time access, and it works because the seats are laid out in a predictable line.

Because the slots are equal-sized and adjacent, the address of item `i` is pure arithmetic: `base + i × size`. No searching involved — that single fact is why arrays are the default container in every language.

- **Strength — instant access** — Know the index and the computer jumps straight there, whether there are ten items or ten million.
- **Weakness — the shifting hassle** — Insert between seats 3 and 4 and everyone from 4 onward shuffles one place right. On a big array that is real work.

```text
index: 0 1 2 3 4
                [ 10 | 20 | 30 | 40 | 50 ] insert 25 at index 2
                ↓
                [ 10 | 20 | 25 | 30 | 40 | 50 ] ← 30, 40, 50 all had to move right
```

**Question**

*How do fundamental array operations work?*

Review indexing, appending to the end in amortized `O(1)` time, inserting or deleting in the middle requiring `O(n)` element shifts, and allocating multi-dimensional grid structures.

**Arrays**

```python
seats = [10, 20, 30, 40, 50]

seats[2]              # 30    O(1)  - straight there
seats.append(60)      # O(1)  - adding at the end is cheap
seats.insert(2, 25)   # O(n)  - everything after index 2 shifts right
seats.pop(0)          # O(n)  - everything shifts left
30 in seats           # O(n)  - it has to look at each item

# Gotcha: build 2-D grids row by row, or every row is the SAME list.
grid  = [[0] * 4 for _ in range(3)]   # correct
wrong = [[0] * 4] * 3                 # 3 references to one row
```

```javascript
const seats = [10, 20, 30, 40, 50];

seats[2];                 // 30   O(1)
seats.push(60);           // O(1)
seats.splice(2, 0, 25);   // O(n) - shifts everything after index 2
seats.shift();            // O(n) - re-indexes the whole array
seats.includes(30);       // O(n)

// Same 2-D gotcha as JavaScript.
const grid1 = Array.from({ length: 3 }, () => new Array(4).fill(0)); // correct
const grid2 = new Array(3).fill(null).map(() => new Array(4).fill(0)); // correct
const grid3 = [...Array(3)].map(() => new Array(4).fill(0)); // correct
const wrong = new Array(3).fill(new Array(4).fill(0)); // wrong: only one row is created
```

<a id="why-append-is-cheap"></a>

#### Why appending is cheap

A fixed block of memory cannot grow, so how is `append` `O(1)`? The array quietly reserves spare capacity. When it fills up, the language allocates a block **twice the size** and copies everything across — an `O(n)` operation. Because the size doubles, that copy happens exponentially rarely: across `n` appends the total copying is less than `2n`. Spread over all of them that is `O(1)` each, which is what **amortised** means — a long run is fast, not that every single call is.

**Top Interview Question**

*Move every zero in an array to the end, keeping the order of the other numbers, and do it in place. `[0, 3, 0, 5, 9, 0, 2]` becomes `[3, 5, 9, 2, 0, 0, 0]`.*

Building a new array is easy but not "in place". Instead use **two pointers**: one reads every element, the other marks where the next non-zero belongs. Swapping them pushes zeroes rightward automatically, and because the reader only ever moves forward this is a single `O(n)` pass with no extra memory.

**Answer — move zeroes in place**

```python
def move_zeroes(nums):
    """O(n) time, O(1) space. Order of the non-zeros is preserved."""
    write = 0                       # next slot a non-zero should land in
    for read in range(len(nums)):   # read scans every element once
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1

data = [0, 3, 0, 5, 9, 0, 2]
move_zeroes(data)
print(data)                         # [3, 5, 9, 2, 0, 0, 0]
```

```javascript
function moveZeroes(nums) {         // O(n) time, O(1) space
  let write = 0;                    // next slot a non-zero should land in
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
}

const data = [0, 3, 0, 5, 9, 0, 2];
moveZeroes(data);
console.log(data);                  // [3, 5, 9, 2, 0, 0, 0]
```

<a id="strings"></a>

### Strings

- **Index** `O(1)`
- **Concatenate** `O(n + m)`
- **Naive search** `O(n·m)`
- **Immutable** in both languages

A string is an array of characters with one extra rule that changes everything: in both Python and JavaScript it is **immutable**. You cannot overwrite a character in place — every "change" quietly builds a brand new string and copies the old one across.

> **Analogy** 🪧
>
> **Picture it — a carved stone sign**
>
> You cannot rub out one letter on a carved sign. To fix a typo you carve a whole new sign. Doing that once is fine; doing it once per word in a long speech is how an afternoon disappears.

> **Warning**
>
> That immutability is behind the single most common accidental slowdown in beginner code: `text += word` inside a loop is `O(n²)`, because each `+=` copies everything written so far. Collect the pieces in a list and join once — `"".join(parts)` in Python, `parts.join("")` in JavaScript — for `O(n)`.

- **Strength — cheap to share** — Because nothing can modify a string, it is safe to pass around, use as a dictionary key, and cache.
- **Weakness — every edit copies** — Need to change characters in a loop? Convert to a list of characters, edit, then join back once.

**Question**

*How do you build and edit strings without going quadratic?*

Collect the pieces and join them once, and reach for a mutable character list whenever you genuinely need to overwrite positions. The rest is the everyday toolkit — splitting, searching, reversing and counting characters, which is the single highest-value habit for string problems.

**Strings, done right**

```python
s = "Hello, World"

s[0]                    # 'H'   O(1)
s.lower()               # O(n) - a NEW string, s is unchanged
s.split(", ")           # ['Hello', 'World']
s.find("World")         # 7, or -1 if absent
s[::-1]                 # 'dlroW ,olleH' - reverse by slicing

# BAD: each += copies everything so far -> O(n^2)
out = ""
for w in ["a", "b", "c"]:
    out += w

# GOOD: one allocation at the end -> O(n)
out = "".join(["a", "b", "c"])

# When you must overwrite characters, use a list and join once.
chars = list("hello")
chars[0] = "H"
print("".join(chars))   # 'Hello'

# Counting characters solves a huge share of string problems.
from collections import Counter
print(Counter("mississippi").most_common(2))    # [('i', 4), ('s', 4)]
```

```javascript
const s = "Hello, World";

s[0];                       // 'H'   O(1)
s.toLowerCase();            // O(n) - a NEW string
s.split(", ");              // ['Hello', 'World']
s.indexOf("World");         // 7, or -1
[...s].reverse().join("");  // 'dlroW ,olleH' - spread is emoji-safe

// GOOD: collect, then join once -> predictably O(n)
const out = ["a", "b", "c"].join("");

// When you must overwrite characters, use an array and join once.
const chars = [..."hello"];
chars[0] = "H";
console.log(chars.join(""));    // 'Hello'

// Counting characters solves a huge share of string problems.
const freq = new Map();
for (const ch of "mississippi") freq.set(ch, (freq.get(ch) ?? 0) + 1);
```

> **Tip**
>
> **Characters are not bytes.** JavaScript strings are UTF-16, so an emoji takes two slots and `"😀".length === 2`. Reversing with `s.split("")` corrupts it; `[...s]` walks whole code points and is safe.

**Top Interview Question**

*Decide whether a string is a palindrome, counting only letters and digits and ignoring case. `"A man, a plan, a canal: Panama"` is one.*

Stripping the punctuation into a cleaned copy and comparing it with its reverse works, but allocates two more strings — and on an immutable type that is the expensive thing.

Walk **two pointers** inwards from both ends instead, skipping anything that is not alphanumeric as you go. Nothing is copied, so it is `O(n)` time and `O(1)` space.

**Answer — valid palindrome with two pointers**

```python
def is_palindrome(s):
    """O(n) time, O(1) space. No cleaned copy is ever built."""
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1                       # skip junk on the left
        while left < right and not s[right].isalnum():
            right -= 1                      # skip junk on the right
        if s[left].lower() != s[right].lower():
            return False
        left, right = left + 1, right - 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))   # True
print(is_palindrome("race a car"))                       # False
```

```javascript
function isPalindrome(s) {                  // O(n) time, O(1) space
  const alnum = (c) => /[a-z0-9]/i.test(c);
  let left = 0, right = s.length - 1;
  while (left < right) {
    while (left < right && !alnum(s[left])) left++;      // skip junk
    while (left < right && !alnum(s[right])) right--;
    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;
    left++; right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));   // true
console.log(isPalindrome("race a car"));                       // false
```

<a id="2-linked-lists"></a>

### Linked Lists

- **Access by index** `O(n)`
- **Insert / delete at a known node** `O(1)`

Linked lists fix the array's shifting problem by giving up contiguity. Data is scattered anywhere in memory. Each **node** holds two things: the value, and a **pointer** — the address of the next node.

> **Analogy** 🗺️
>
> **Picture it — a treasure hunt**
>
> You start with one clue. It says "under the mango tree". At the mango tree is a note pointing to "the old well". You follow the chain of addresses to the treasure. You cannot skip to clue seven — you have to walk the chain.

> **Interactive animation:** `linked-list` — rendered by the page script in the HTML version.

- **Strength — cheap insertion** — To splice a node in between two others you just rewrite two pointers. Nothing else in memory moves.
- **Weakness — no jumping** — To reach the 100th item you start at the first and follow 99 pointers. There is no index arithmetic.

<a id="the-three-flavours"></a>

#### The three flavours

1. **Singly linked** — a one-way street; nodes point forward only.
2. **Doubly linked** — a two-way street; each node points forward *and* back. Costs an extra pointer, buys backward iteration and `O(1)` deletion given just the node.
3. **Circular** — the last node points back to the first, forming a loop. Think *repeat mode* in a music player, or a round-robin scheduler.

**Question**

*How do you construct and traverse a singly linked list?*

Define a self-referential node holding a value and a reference pointer, wire consecutive nodes together into a chain, and walk from head to tail using a temporary pointer until reaching null.

**Defining a node and walking the chain**

```python
class Node:
    def __init__(self, value, nxt=None):
        self.value = value
        self.next = nxt

# Chain three nodes: 10 -> 20 -> 30 -> None
head = Node(10, Node(20, Node(30)))

def walk(head):
    while head:                 # the treasure hunt, one clue at a time
        print(head.value)
        head = head.next
```

```javascript
class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

// 10 -> 20 -> 30 -> null
const head = new Node(10, new Node(20, new Node(30)));

function walk(node) {
  while (node) {                // follow the chain of clues
    console.log(node.value);
    node = node.next;
  }
}
```

**Top Interview Question**

*How do you reverse a singly linked list in place?*

Reversing a list is the single most asked linked-list question. Given the head of a list, flip every node's next pointer backwards in `O(n)` time and `O(1)` memory using three pointers (`prev`, `curr`, and `next`) so you don't lose the remaining chain during reassignment.

**Reversing a list in place**

```python
def reverse(head):
    """The classic interview question. O(n) time, O(1) space."""
    prev = None
    while head:
        nxt = head.next         # remember where we were going
        head.next = prev        # flip this link backwards
        prev, head = head, nxt  # step both pointers forward
    return prev                 # the old tail is the new head
```

```javascript
function reverse(head) {        // O(n) time, O(1) space
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;      // remember the rest
    cur.next = prev;            // flip the link
    prev = cur;
    cur = next;
  }
  return prev;                  // old tail becomes the new head
}
```

<a id="3-stacks"></a>

### Stacks

- **Push / pop / peek** `O(1)`
- **Rule** LIFO — last in, first out

A stack only lets you add or remove at **one end**, called the top. **Push** puts something on; **pop** takes the top one off.

> **Analogy** 🍽️
>
> **Picture it — a pile of plates**
>
> You stack washed plates one on top of another. The last plate you put down is the first one you pick up. Try to pull one from the bottom and the whole pile comes down.

That restriction sounds limiting until you notice it is the exact shape of **nesting**: the most recently opened thing must be the first one closed. Brackets, HTML tags, function calls and undo history are all nesting problems — which is why stacks are everywhere.

1. The browser **Back** button.
2. **Undo** (Ctrl+Z) in any editor.
3. The computer's own **call stack** — one frame per active function call.
4. Depth-first search, and checking balanced brackets.

**Top Interview Question**

*How do you determine if brackets and parentheses are balanced?*

Given a string containing brackets like `()[]{}`, verify that every opening bracket has an identically matching closing bracket in the proper nesting order by pushing opening tokens onto a stack and popping to validate pairs upon encountering closing tokens in `O(n)` time.

**Balanced brackets — the classic stack problem**

```python
def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []

    for ch in s:
        if ch in "([{":
            stack.append(ch)            # remember what must be closed
        elif ch in pairs:
            # It must close the MOST RECENT opener - that is the LIFO rule.
            if not stack or stack.pop() != pairs[ch]:
                return False

    return not stack                    # nothing may be left open

print(is_balanced("{[()]}"))    # True
print(is_balanced("{[(])}"))    # False - right count, wrong nesting
```

```javascript
function isBalanced(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);                   // remember what must close
    } else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;   // wrong opener
    }
  }
  return stack.length === 0;            // nothing left open
}

console.log(isBalanced("{[()]}"));      // true
console.log(isBalanced("{[(])}"));      // false
```

<a id="4-queues"></a>

### Queues

- **Enqueue / dequeue** `O(1)`
- **Rule** FIFO — first in, first out

A queue is fairness. Data enters at the back (**enqueue**) and leaves from the front (**dequeue**).

> **Analogy** 🎟️
>
> **Picture it — a ticket counter**
>
> People queue for cinema tickets. The first to arrive is the first served. Nobody jumps the line, and new arrivals join at the back.

Both a stack and a queue accept the same items — only the *exit rule* differs. Watch them diverge from identical contents:

> **Interactive animation:** `stack-queue` — rendered by the page script in the HTML version.

<a id="queue-variants"></a>

#### The variants worth knowing

1. **Circular queue** — the end wraps around to the start, reusing the empty slots left behind at the front instead of growing forever.
2. **Double-ended queue (deque)** — add and remove at *both* ends. It subsumes both stack and queue.
3. **Priority queue** — items are served by importance, not arrival time. Think an **emergency room**: the heart-attack patient is seen before the mild headache who arrived an hour earlier. Usually built on a *heap* (below).

> **Warning**
>
> In JavaScript, never use `array.shift()` as a queue. It re-indexes the entire array, so it is `O(n)` and quietly turns an `O(V + E)` breadth-first search into `O(V²)`. Keep a head index instead, as in the code below.

**Question**

*How do you implement an efficient queue in practice?*

Use Python's built-in doubly linked `collections.deque` for guaranteed `O(1)` appends and pops on both ends, and in JavaScript implement a head-pointer offset over an array to avoid catastrophic `O(n)` element shifts during dequeuing.

**Queues, done right**

```python
from collections import deque

q = deque()
q.append("a")       # enqueue at the back    O(1)
q.append("b")
q.popleft()         # dequeue from the front O(1)  -> 'a'

q.appendleft("z")   # deque powers: both ends are O(1)
q.pop()

# NEVER use list.pop(0) as a queue - it shifts every element, O(n).
```

```javascript
// No built-in deque, and shift() is O(n). A head index fixes it:
class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }

  enqueue(x) {
    this.items.push(x);                 // O(1)
  }

  dequeue() {                           // O(1) amortised
    if (this.head >= this.items.length) return undefined;
    return this.items[this.head++];     // move the pointer, not the data
  }

  get size() {
    return this.items.length - this.head;
  }
}
```

<a id="priority-queue-heap"></a>

#### The priority queue, up close

A **heap** is the usual implementation. It answers exactly one question fast — *what is the smallest item right now?* — and deliberately keeps everything else unsorted, which is why it is cheaper than a full tree. It needs no pointers at all: store the tree in a plain array where the children of index `i` live at `2i+1` and `2i+2`.

> **Interactive animation:** `heap` — rendered by the page script in the HTML version.

**Using and building a heap**

```python
            import heapq

            # heapq turns any list into a MIN-heap in place.
            nums = [5, 1, 8, 3, 9, 2]
            heapq.heapify(nums)             # O(n), not O(n log n)
            heapq.heappush(nums, 0)         # O(log n)
            smallest = heapq.heappop(nums)  # O(log n) -> 0
            peek = nums[0]                  # O(1)

            # Top-k without sorting everything: O(n log k) time, O(k) space.
            def top_k(nums, k):
                heap = []
                for x in nums:
                    heapq.heappush(heap, x)
                    if len(heap) > k:
                        heapq.heappop(heap)     # evict the smallest; keep the k largest
                return sorted(heap, reverse=True)

            # For a MAX-heap, negate the values (heapq has no max variant).
            def max_heap_demo(values):
                heap = [-v for v in values]
                heapq.heapify(heap)
                return -heapq.heappop(heap)     # largest

            # Priority queues: push (priority, tiebreaker, payload) tuples so that
            # equal priorities never try to compare the payloads.
            import itertools
            counter = itertools.count()
            tasks = []
            heapq.heappush(tasks, (2, next(counter), "write tests"))
            heapq.heappush(tasks, (1, next(counter), "fix outage"))
            print(heapq.heappop(tasks)[2])      # 'fix outage'

            print(top_k([7, 2, 9, 4, 1, 8], 3)) # [9, 8, 7]
            print(heapq.nlargest(3, [7, 2, 9])) # [9, 7, 2] - built in

```

```javascript
            // JavaScript has no heap, so here is a complete one. Pass a comparator to
            // get a max-heap or to order objects by any field.
            class Heap {
              constructor(compare = (a, b) => a - b, items = []) {
                this.compare = compare;
                this.data = items;
                // Heapify bottom-up: O(n), not O(n log n).
                for (let i = (this.data.length >> 1) - 1; i >= 0; i--) this.#siftDown(i);
              }

              get size() {
                return this.data.length;
              }

              peek() {
                return this.data[0];              // O(1)
              }

              push(value) {                       // O(log n)
                this.data.push(value);
                this.#siftUp(this.data.length - 1);
              }

              pop() {                             // O(log n)
                if (this.data.length === 0) return undefined;
                const top = this.data[0];
                const last = this.data.pop();
                if (this.data.length) {
                  this.data[0] = last;
                  this.#siftDown(0);
                }
                return top;
              }

              #siftUp(i) {
                while (i > 0) {
                  const parent = (i - 1) >> 1;
                  if (this.compare(this.data[i], this.data[parent]) >= 0) break;
                  [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
                  i = parent;
                }
              }

              #siftDown(i) {
                const n = this.data.length;
                while (true) {
                  let best = i;
                  const l = 2 * i + 1;
                  const r = 2 * i + 2;
                  if (l < n && this.compare(this.data[l], this.data[best]) < 0) best = l;
                  if (r < n && this.compare(this.data[r], this.data[best]) < 0) best = r;
                  if (best === i) return;
                  [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
                  i = best;
                }
              }
            }

            const minHeap = new Heap();
            [5, 1, 8, 3].forEach((x) => minHeap.push(x));
            console.log(minHeap.pop());                     // 1

            const maxHeap = new Heap((a, b) => b - a);
            const tasks = new Heap((a, b) => a.priority - b.priority);
            tasks.push({ priority: 2, name: "write tests" });
            tasks.push({ priority: 1, name: "fix outage" });
            console.log(tasks.pop().name);                  // 'fix outage'

            function topK(nums, k) {                        // O(n log k)
              const heap = new Heap();
              for (const x of nums) {
                heap.push(x);
                if (heap.size > k) heap.pop();              // drop the smallest
              }
              return heap.data.sort((a, b) => b - a);
            }

            console.log(topK([7, 2, 9, 4, 1, 8], 3));       // [9, 8, 7]

```

**Top Interview Question**

*Implement a FIFO queue using only two stacks. You may only use push, pop, peek and "is empty".*

Push incoming items directly onto an `in` stack. When dequeuing, pull from an `out` stack; if `out` is empty, transfer all elements from `in` to `out`, reversing their order to achieve FIFO. The trick is to refill `out` **only when it is empty**. Each element is moved between stacks at most once, so although a single `dequeue` may cost `O(n)`, the average over many calls is `O(1)` — amortised, exactly like the array doubling from earlier.

**Answer — queue from two stacks**

```python
class QueueFromStacks:
    def __init__(self):
        self.inbox = []             # newest items land here
        self.outbox = []            # reversed, so the oldest is on top

    def enqueue(self, x):
        self.inbox.append(x)        # always O(1)

    def _shift(self):
        # ONLY refill when outbox is empty, or the order breaks.
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())   # reverse into outbox

    def dequeue(self):
        self._shift()
        return self.outbox.pop() if self.outbox else None

    def peek(self):
        self._shift()
        return self.outbox[-1] if self.outbox else None

q = QueueFromStacks()
q.enqueue(1); q.enqueue(2); q.enqueue(3)
print(q.dequeue(), q.dequeue(), q.dequeue())    # 1 2 3  - FIFO preserved
```

```javascript
class QueueFromStacks {
  constructor() {
    this.inbox = [];                // newest items land here
    this.outbox = [];               // reversed, so the oldest is on top
  }

  enqueue(x) {
    this.inbox.push(x);             // always O(1)
  }

  #shift() {
    // ONLY refill when outbox is empty, or the ordering breaks.
    if (this.outbox.length === 0) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }

  dequeue() {
    this.#shift();
    return this.outbox.pop();
  }

  peek() {
    this.#shift();
    return this.outbox.at(-1);
  }
}

const q = new QueueFromStacks();
q.enqueue(1); q.enqueue(2); q.enqueue(3);
console.log(q.dequeue(), q.dequeue(), q.dequeue());   // 1 2 3
```

---

<a id="unit-2"></a>

## Unit 2 — High-Speed & Relational Structures

Past simple lines: structures for near-instant lookup, hierarchies, and networks.

<a id="5-hash-tables-and-sets"></a>

### Hash Tables & Sets

- **Insert / lookup / delete** `O(1)` average
- **Worst case** `O(n)`
- **No ordering**

A hash table is an array you index with something other than a number. It stores **key-value pairs**, and a **hash function** is the machine that turns a key into a slot number.

> **Analogy** 📱
>
> **Picture it — your phone's contacts**
>
> You do not scroll through 1,000 names. You type "Alice" and the phone computes exactly where that record lives and shows it instantly. The name goes in, a drawer number comes out.

> **Interactive animation:** `hash-table` — rendered by the page script in the HTML version.

Two different keys can land in the same drawer — a **collision**. The usual fix is **chaining**: each bucket holds a little list, and lookups compare keys inside it. As long as the table stays mostly empty the chains stay tiny and lookups stay `O(1)` on average.

A **set** is the same machinery with the values thrown away — it stores only unique keys and silently swallows duplicates. Think a **VIP guest list** where a name cannot appear twice.

> **Interview**
>
> The single highest-value habit in this whole course: whenever you catch yourself writing a nested loop to ask *"have I seen this before?"* or *"does the matching item exist?"*, a hash set turns `O(n²)` into `O(n)`. That one substitution solves a startling share of interview problems.

**Question**

*How do you eliminate nested loops using a hash table?*

Solve the classic Two Sum problem — finding two numbers in an unsorted array that add up to a target sum — by querying an auxiliary hash map for the required complement (`target - x`) in average `O(1)` time instead of scanning the remainder with an inner loop.

**The O(n²) → O(n) rewrite**

```python
# Dictionaries and sets
ages = {"ada": 36, "alan": 41}
ages["grace"] = 45          # O(1) insert
ages.get("linus", 0)        # 0 - no KeyError
"ada" in ages               # O(1) membership

seen = {1, 2, 3}            # a set: unique keys only
seen.add(3)                 # still {1, 2, 3}

def two_sum(nums, target):
    """Find two numbers adding to target. O(n) instead of O(n^2)."""
    seen = {}                       # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:      # is my partner already here?
            return seen[target - x], i
        seen[x] = i
    return None

print(two_sum([2, 7, 11, 15], 9))   # (0, 1)
```

```javascript
// Map is the right default - any key type, keeps insertion order.
const ages = new Map([["ada", 36], ["alan", 41]]);
ages.set("grace", 45);      // O(1)
ages.get("linus") ?? 0;     // 0
ages.has("ada");            // O(1)

const seen = new Set([1, 2, 3]);
seen.add(3);                // still {1, 2, 3}

function twoSum(nums, target) {     // O(n) instead of O(n^2)
  const index = new Map();          // value -> index
  for (let i = 0; i < nums.length; i++) {
    if (index.has(target - nums[i])) return [index.get(target - nums[i]), i];
    index.set(nums[i], i);
  }
  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));   // [0, 1]
```

**Top Interview Question**

*Group a list of words so that anagrams end up together: `["eat", "tea", "tan", "ate", "nat", "bat"]` becomes `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`.*

Comparing every word with every other is `O(n²·L)`. The move is to build a **canonical key** that all anagrams share — the sorted letters, or a 26-slot letter count — and use it as a dictionary key. One pass, `O(n·L log L)`.

**Answer — group anagrams by canonical key**

```python
from collections import defaultdict

def group_anagrams(words):
    """O(n * L log L) time. Anagrams collapse onto the same sorted-letters key."""
    buckets = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))     # "tea" and "eat" both become "aet"
        buckets[key].append(word)
    return list(buckets.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

```javascript
function groupAnagrams(words) {         // O(n * L log L) time
  const buckets = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");   // "tea" and "eat" -> "aet"
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(word);
  }
  return [...buckets.values()];
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [['eat','tea','ate'], ['tan','nat'], ['bat']]
```

<a id="6-trees"></a>

### Trees

- **Traversal** `O(n)`
- **Balanced operations** `O(log n)`
- **Degenerate** `O(n)`

Trees hold **hierarchy** — data spreading out from a single origin. Computer-science trees grow **upside down**: they start at a **root** at the top and branch downward through **parents** and **children** to **leaves**, which are nodes with no children of their own.

> **Analogy** 👴
>
> **Picture it — a family tree**
>
> The grandfather is the root. His children branch off him, their children branch off them. Every person has exactly one parent, so there is exactly one path from the root to anyone — which is why tree code never needs to worry about going in circles.

<a id="binary-search-tree"></a>

#### Binary search tree — the guessing game

A **BST** adds one rule: every value in the left subtree is smaller than its parent, every value on the right is larger. That single invariant turns a walk into a search — at each node you throw away an entire subtree without looking at it.

> **Interactive animation:** `bst-search` — rendered by the page script in the HTML version.

**A complete BST, including deletion**

```python
            class BST:
                class _Node:
                    __slots__ = ("value", "left", "right")

                    def __init__(self, value):
                        self.value = value
                        self.left = self.right = None

                def __init__(self):
                    self.root = None

                def insert(self, value):
                    """O(h). Duplicates are ignored."""
                    def go(node):
                        if node is None:
                            return BST._Node(value)
                        if value < node.value:
                            node.left = go(node.left)
                        elif value > node.value:
                            node.right = go(node.right)
                        return node
                    self.root = go(self.root)

                def contains(self, value):
                    """O(h), iterative - no stack frames needed."""
                    node = self.root
                    while node:
                        if value == node.value:
                            return True
                        node = node.left if value < node.value else node.right
                    return False

                def delete(self, value):
                    """The only fiddly operation. Three cases, see the comments."""
                    def go(node, value):
                        if node is None:
                            return None
                        if value < node.value:
                            node.left = go(node.left, value)
                        elif value > node.value:
                            node.right = go(node.right, value)
                        else:
                            # Case 1 and 2: zero or one child - splice the child up.
                            if node.left is None:
                                return node.right
                            if node.right is None:
                                return node.left
                            # Case 3: two children. Replace this value with its
                            # in-order successor (smallest value in the right subtree),
                            # then delete that successor from the right subtree.
                            successor = node.right
                            while successor.left:
                                successor = successor.left
                            node.value = successor.value
                            node.right = go(node.right, successor.value)
                        return node
                    self.root = go(self.root, value)

                def in_order(self):
                    """Sorted iteration for free. O(n)."""
                    stack, node = [], self.root
                    while stack or node:
                        while node:
                            stack.append(node)
                            node = node.left
                        node = stack.pop()
                        yield node.value
                        node = node.right

            tree = BST()
            for v in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
                tree.insert(v)
            print(list(tree.in_order()))    # [1, 3, 4, 6, 7, 8, 10, 13, 14]
            tree.delete(3)
            print(list(tree.in_order()))    # [1, 4, 6, 7, 8, 10, 13, 14]

```

```javascript
            class BST {
              constructor() {
                this.root = null;
              }

              insert(value) {                       // O(h), duplicates ignored
                const go = (node) => {
                  if (!node) return { value, left: null, right: null };
                  if (value < node.value) node.left = go(node.left);
                  else if (value > node.value) node.right = go(node.right);
                  return node;
                };
                this.root = go(this.root);
              }

              contains(value) {                     // O(h), iterative
                let node = this.root;
                while (node) {
                  if (value === node.value) return true;
                  node = value < node.value ? node.left : node.right;
                }
                return false;
              }

              delete(value) {
                const go = (node, value) => {
                  if (!node) return null;
                  if (value < node.value) node.left = go(node.left, value);
                  else if (value > node.value) node.right = go(node.right, value);
                  else {
                    if (!node.left) return node.right;    // 0 or 1 child
                    if (!node.right) return node.left;
                    // Two children: promote the in-order successor.
                    let successor = node.right;
                    while (successor.left) successor = successor.left;
                    node.value = successor.value;
                    node.right = go(node.right, successor.value);
                  }
                  return node;
                };
                this.root = go(this.root, value);
              }

              *inOrder() {                          // sorted iteration, O(n)
                const stack = [];
                let node = this.root;
                while (stack.length || node) {
                  while (node) {
                    stack.push(node);
                    node = node.left;
                  }
                  node = stack.pop();
                  yield node.value;
                  node = node.right;
                }
              }
            }

            const tree = new BST();
            for (const v of [8, 3, 10, 1, 6, 14, 4, 7, 13]) tree.insert(v);
            console.log([...tree.inOrder()]);       // [1,3,4,6,7,8,10,13,14]

```

> **Warning**
>
> **The BST's fatal flaw:** insert `1, 2, 3, 4, 5` in order and every node becomes a right child. You now have a linked list wearing a tree costume, and every operation degrades to `O(n)`. Sorted input is not rare — it is *normal* for timestamps and IDs. Hence the next idea.

<a id="balanced-trees"></a>

#### Balanced trees — AVL and red-black

These trees notice when they are becoming lopsided and **rotate** — a constant-time pointer rearrangement that pulls one node up and pushes another down while preserving the ordering. The result is a guaranteed `O(log n)` height instead of a hopeful one.

*Diagram labels:* before — left heavy, height 3 · 5 · 3 · 1 · 4 · 8 · → · rotate right at 5 · after — balanced, height 2 · 3 · 1 · 5 · 4 · 8

*In-order reading is 1, 3, 4, 5, 8 both before and after — the rotation fixes the shape without disturbing the ordering.*

**AVL insertion with rotations**

```python
            class AVLNode:
                __slots__ = ("value", "left", "right", "height")

                def __init__(self, value):
                    self.value = value
                    self.left = self.right = None
                    self.height = 1

            def h(node):
                return node.height if node else 0

            def update(node):
                node.height = 1 + max(h(node.left), h(node.right))

            def balance_factor(node):
                """> 1 means left heavy, < -1 means right heavy."""
                return h(node.left) - h(node.right) if node else 0

            def rotate_right(y):
                """    y            x
                      / \\          / \\
                     x   C   ->    A   y      O(1) pointer surgery, order preserved.
                    / \\              / \\
                   A   B            B   C
                """
                x = y.left
                y.left = x.right
                x.right = y
                update(y)
                update(x)
                return x                # x is the new subtree root

            def rotate_left(x):
                y = x.right
                x.right = y.left
                y.left = x
                update(x)
                update(y)
                return y

            def avl_insert(node, value):
                """Ordinary BST insert, then rebalance on the way back up. O(log n)."""
                if node is None:
                    return AVLNode(value)
                if value < node.value:
                    node.left = avl_insert(node.left, value)
                elif value > node.value:
                    node.right = avl_insert(node.right, value)
                else:
                    return node

                update(node)
                bf = balance_factor(node)

                if bf > 1 and value < node.left.value:      # left-left
                    return rotate_right(node)
                if bf < -1 and value > node.right.value:    # right-right
                    return rotate_left(node)
                if bf > 1:                                  # left-right
                    node.left = rotate_left(node.left)
                    return rotate_right(node)
                if bf < -1:                                 # right-left
                    node.right = rotate_right(node.right)
                    return rotate_left(node)
                return node

            root = None
            for v in [10, 20, 30, 40, 50]:      # sorted input that would ruin a plain BST
                root = avl_insert(root, v)
            print(root.value, root.height)      # 20 3  - height 3 instead of 5

```

```javascript
            const h = (node) => (node ? node.height : 0);
            const update = (node) => { node.height = 1 + Math.max(h(node.left), h(node.right)); };
            const balanceFactor = (node) => (node ? h(node.left) - h(node.right) : 0);

            function rotateRight(y) {               // O(1), preserves in-order sequence
              const x = y.left;
              y.left = x.right;
              x.right = y;
              update(y);
              update(x);
              return x;                             // new subtree root
            }

            function rotateLeft(x) {
              const y = x.right;
              x.right = y.left;
              y.left = x;
              update(x);
              update(y);
              return y;
            }

            function avlInsert(node, value) {       // BST insert + rebalance on unwind
              if (!node) return { value, left: null, right: null, height: 1 };
              if (value < node.value) node.left = avlInsert(node.left, value);
              else if (value > node.value) node.right = avlInsert(node.right, value);
              else return node;

              update(node);
              const bf = balanceFactor(node);

              if (bf > 1 && value < node.left.value) return rotateRight(node);   // LL
              if (bf < -1 && value > node.right.value) return rotateLeft(node);  // RR
              if (bf > 1) {                                                      // LR
                node.left = rotateLeft(node.left);
                return rotateRight(node);
              }
              if (bf < -1) {                                                     // RL
                node.right = rotateRight(node.right);
                return rotateLeft(node);
              }
              return node;
            }

            let root = null;
            for (const v of [10, 20, 30, 40, 50]) root = avlInsert(root, v);
            console.log(root.value, root.height);   // 20 3

```

<a id="tries"></a>

#### Tries — the autocomplete tree

A **trie** (prefix tree) stores words along the *edges* rather than in the nodes. Each node is a single letter, and shared prefixes share one path — "car" and "cat" both travel the same `c → a` edges before splitting. Lookup time depends on the length of the word, not on how many words are stored.

> **Interactive animation:** `trie` — rendered by the page script in the HTML version.

**A trie with autocomplete**

```python
            class Trie:
                def __init__(self):
                    self.children = {}      # character -> Trie
                    self.is_word = False
                    self.count = 0          # how many words pass through this node

                def insert(self, word):
                    """O(len(word))."""
                    node = self
                    for ch in word:
                        node = node.children.setdefault(ch, Trie())
                        node.count += 1
                    node.is_word = True

                def _walk(self, prefix):
                    """Follow a prefix; return the node it ends at, or None."""
                    node = self
                    for ch in prefix:
                        node = node.children.get(ch)
                        if node is None:
                            return None
                    return node

                def search(self, word):
                    node = self._walk(word)
                    return node is not None and node.is_word

                def starts_with(self, prefix):
                    return self._walk(prefix) is not None

                def count_prefix(self, prefix):
                    """How many stored words begin with this prefix. O(len(prefix))."""
                    node = self._walk(prefix)
                    return node.count if node else 0

                def autocomplete(self, prefix, limit=10):
                    """Every word under the prefix, via DFS from that node."""
                    node = self._walk(prefix)
                    if node is None:
                        return []
                    out = []

                    def dfs(node, path):
                        if len(out) >= limit:
                            return
                        if node.is_word:
                            out.append(prefix + path)
                        for ch, child in sorted(node.children.items()):
                            dfs(child, path + ch)

                    dfs(node, "")
                    return out

            trie = Trie()
            for w in ["car", "card", "care", "cat", "dog"]:
                trie.insert(w)

            print(trie.search("car"))            # True
            print(trie.search("ca"))             # False - a prefix is not a word
            print(trie.starts_with("ca"))        # True
            print(trie.count_prefix("car"))      # 3
            print(trie.autocomplete("car"))      # ['car', 'card', 'care']

```

```javascript
            class Trie {
              constructor() {
                this.children = new Map();        // character -> Trie
                this.isWord = false;
                this.count = 0;                   // words passing through this node
              }

              insert(word) {                      // O(word.length)
                let node = this;
                for (const ch of word) {
                  if (!node.children.has(ch)) node.children.set(ch, new Trie());
                  node = node.children.get(ch);
                  node.count++;
                }
                node.isWord = true;
              }

              #walk(prefix) {
                let node = this;
                for (const ch of prefix) {
                  node = node.children.get(ch);
                  if (!node) return null;
                }
                return node;
              }

              search(word) {
                const node = this.#walk(word);
                return Boolean(node?.isWord);
              }

              startsWith(prefix) {
                return this.#walk(prefix) !== null;
              }

              countPrefix(prefix) {               // O(prefix.length)
                return this.#walk(prefix)?.count ?? 0;
              }

              autocomplete(prefix, limit = 10) {
                const start = this.#walk(prefix);
                if (!start) return [];
                const out = [];
                const dfs = (node, path) => {
                  if (out.length >= limit) return;
                  if (node.isWord) out.push(prefix + path);
                  for (const ch of [...node.children.keys()].sort()) {
                    dfs(node.children.get(ch), path + ch);
                  }
                };
                dfs(start, "");
                return out;
              }
            }

            const trie = new Trie();
            for (const w of ["car", "card", "care", "cat", "dog"]) trie.insert(w);

            console.log(trie.search("car"));        // true
            console.log(trie.search("ca"));         // false
            console.log(trie.startsWith("ca"));     // true
            console.log(trie.countPrefix("car"));   // 3
            console.log(trie.autocomplete("car"));  // ['car','card','care']

```

**Top Interview Question**

*Find the maximum depth of a binary tree — the number of nodes on the longest path from the root down to a leaf.*

This is the tree pattern in its purest form, and it is worth memorising because almost every tree question is a variation of it: **solve the left subtree, solve the right subtree, combine.**

The base case is an empty tree, which has depth `0`. Anything else is one (for the current node) plus whichever child subtree runs deeper. You never write a loop — the recursion visits each node exactly once, so it is `O(n)`.

**Answer — maximum depth of a binary tree**

```python
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

def max_depth(node):
    """O(n) time, O(h) stack space."""
    if node is None:
        return 0                    # base case: an empty tree has no depth
    # Trust that each side returns its own answer, then combine.
    return 1 + max(max_depth(node.left), max_depth(node.right))

#        3
#       / \
#      9   20
#         /  \
#        15   7
tree = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(max_depth(tree))              # 3
```

```javascript
class TreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(node) {           // O(n) time, O(h) stack space
  if (!node) return 0;              // base case: empty tree has no depth
  // Trust each side to return its own answer, then combine.
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

const tree = new TreeNode(3, new TreeNode(9),
                             new TreeNode(20, new TreeNode(15), new TreeNode(7)));
console.log(maxDepth(tree));        // 3
```

<a id="tree-traversals"></a>

#### Tree Traversals

On a binary tree, systematic traversal produces four standard orders. The three depth-first ones differ only in *when* the node itself is visited relative to its children — a one-line change with completely different uses. In-order on a BST comes out perfectly sorted.

#### In-order traversal (Left → Root → Right)

Visits the left subtree, then the root, then the right subtree. Produces sorted order on any valid binary search tree.

> **Interactive animation:** `traversal` (option=inorder) — rendered by the page script in the HTML version.

#### Pre-order traversal (Root → Left → Right)

Visits the root before its children. Ideal for serialising, copying, or prefix-evaluating trees.

> **Interactive animation:** `traversal` (option=preorder) — rendered by the page script in the HTML version.

#### Post-order traversal (Left → Right → Root)

Visits both children before the parent. Essential for bottom-up calculations, directory size accumulation, and deletions.

> **Interactive animation:** `traversal` (option=postorder) — rendered by the page script in the HTML version.

**The node, and the three depth-first orders**

```python
            class TreeNode:
                def __init__(self, value, left=None, right=None):
                    self.value, self.left, self.right = value, left, right

            def preorder(node, out=None):
                """Node, left, right. Use to serialise or copy a tree."""
                out = [] if out is None else out
                if node:
                    out.append(node.value)
                    preorder(node.left, out)
                    preorder(node.right, out)
                return out

            def inorder(node, out=None):
                """Left, node, right. On a BST this yields sorted order."""
                out = [] if out is None else out
                if node:
                    inorder(node.left, out)
                    out.append(node.value)
                    inorder(node.right, out)
                return out

            def postorder(node, out=None):
                """Left, right, node. Children finish first - use to free or evaluate."""
                out = [] if out is None else out
                if node:
                    postorder(node.left, out)
                    postorder(node.right, out)
                    out.append(node.value)
                return out

```

```javascript
            class TreeNode {
              constructor(value, left = null, right = null) {
                this.value = value;
                this.left = left;
                this.right = right;
              }
            }

            function preorder(node, out = []) {     // node, left, right
              if (!node) return out;
              out.push(node.value);
              preorder(node.left, out);
              preorder(node.right, out);
              return out;
            }

            function inorder(node, out = []) {      // left, node, right -> sorted on a BST
              if (!node) return out;
              inorder(node.left, out);
              out.push(node.value);
              inorder(node.right, out);
              return out;
            }

            function postorder(node, out = []) {    // left, right, node
              if (!node) return out;
              postorder(node.left, out);
              postorder(node.right, out);
              out.push(node.value);
              return out;
            }

```

#### Level-order traversal (BFS)

Visits nodes row by row from top to bottom using a FIFO queue.

> **Interactive animation:** `traversal` (option=level) — rendered by the page script in the HTML version.

**Level-order (BFS)**

```python
            from collections import deque

            def level_order(root):
                """BFS with a queue. Returns one list per level."""
                if not root:
                    return []
                levels, q = [], deque([root])
                while q:
                    level = []
                    for _ in range(len(q)):         # snapshot the size = this level
                        node = q.popleft()
                        level.append(node.value)
                        if node.left:
                            q.append(node.left)
                        if node.right:
                            q.append(node.right)
                    levels.append(level)
                return levels

```

```javascript
            function levelOrder(root) {             // BFS, one array per level
              if (!root) return [];
              const levels = [];
              let frontier = [root];
              while (frontier.length) {
                levels.push(frontier.map((n) => n.value));
                const next = [];
                for (const node of frontier) {
                  if (node.left) next.push(node.left);
                  if (node.right) next.push(node.right);
                }
                frontier = next;
              }
              return levels;
            }

```

<a id="7-graphs"></a>

### Graphs

- **Adjacency list** `O(V + E)` space
- **Traversal** `O(V + E)`

Graphs are the most general structure there is: **vertices** (the data points) joined by **edges** (the connections). Any point may connect to any other. Trees, linked lists and grids are all just graphs with extra rules.

> **Analogy** 🕸️
>
> **Picture it — a social network**
>
> Every person is a vertex; every friendship is an edge. There is no root and no parent — everyone sits in parallel, and you can wander from anyone to anyone by following connections.

1. **Undirected** — the relationship runs both ways. *Facebook friends.*
2. **Directed** — one-way, drawn with arrows. *Instagram followers.*
3. **Weighted** — each edge carries a cost or distance. *Google Maps, in kilometres or minutes.*
4. **Unweighted** — connections with no value attached. *Plain social circles.*

**Question**

*How do you represent and build a graph?*

You almost always store a graph as an **adjacency list** — a map from each vertex to its list of neighbours. It costs `O(V + E)` space and makes "who is next to me?" instant, which is exactly what every traversal asks.

**Building a graph**

```python
from collections import defaultdict

def build(edges, directed=False):
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        if not directed:
            graph[b].append(a)      # undirected: the road runs both ways
    return graph

friends = build([("ada", "alan"), ("alan", "grace"), ("ada", "grace")])
print(friends["ada"])               # ['alan', 'grace']

# A grid is a graph too: each cell is a vertex with up to four edges.
DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))
```

```javascript
function build(edges, directed = false) {
  const graph = new Map();
  const add = (a, b) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a).push(b);
  };
  for (const [a, b] of edges) {
    add(a, b);
    if (!directed) add(b, a);       // undirected: both ways
  }
  return graph;
}

const friends = build([["ada", "alan"], ["alan", "grace"], ["ada", "grace"]]);
console.log(friends.get("ada"));    // ['alan', 'grace']

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // grid neighbours
```

**Top Interview Question**

*Given a grid of `"1"` (land) and `"0"` (water), count the islands. An island is land connected horizontally or vertically.*

The insight that unlocks a whole family of problems: **a grid is a graph**. Every cell is a vertex, and its up/down/left/right neighbours are its edges — nobody has to hand you an adjacency list.

The answer is "count the connected components". Walk the grid; each time you meet land you have not seen before, that is a new island, and you flood-fill the whole thing so it is never counted twice. Sinking each visited cell to `"0"` is the cheapest possible visited set.

**Answer — number of islands**

```python
def count_islands(grid):
    """O(rows * cols) - every cell is visited at most once."""
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0

    def sink(r, c):
        """Flood-fill this island so it is never counted again."""
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return                      # off the grid, or water/already sunk
        grid[r][c] = "0"                # mark visited by sinking the land
        sink(r + 1, c); sink(r - 1, c)
        sink(r, c + 1); sink(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":       # unvisited land = a brand new island
                islands += 1
                sink(r, c)
    return islands

print(count_islands([["1", "1", "0", "0"],
                     ["1", "1", "0", "0"],
                     ["0", "0", "1", "0"]]))     # 2
```

```javascript
function countIslands(grid) {           // O(rows * cols)
  if (!grid.length) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  const sink = (r, c) => {              // flood-fill one island
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";                   // mark visited by sinking the land
    sink(r + 1, c); sink(r - 1, c);
    sink(r, c + 1); sink(r, c - 1);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {         // unvisited land = a new island
        islands++;
        sink(r, c);
      }
    }
  }
  return islands;
}

console.log(countIslands([["1","1","0","0"],
                          ["1","1","0","0"],
                          ["0","0","1","0"]]));  // 2
```

<a id="graph-traversals"></a>

#### Graph Traversals & Shortest Paths

Once data sits in a graph, you need a systematic way to explore its vertices and edges without getting trapped in cycles. There are two primary strategies, and they differ by a single detail: **which vertex you take out of the waiting frontier next.**

- **Depth-first search (DFS)** — Dive as deep as possible down one branch, then back up and try the next. Uses a **stack**, or plain recursion. Good for "does a path exist?", cycle detection and connected components.
- **Breadth-first search (BFS)** — Visit every immediate neighbour first, then everything two steps away, and so on. Uses a **queue**. Good for "fewest moves" and shortest paths on unweighted graphs.

> **Analogy** 💧
>
> **Picture it — a pebble in a pond**
>
> BFS spreads outward in expanding rings, finishing every point at distance 1 before touching anything at distance 2. That is exactly why the first time it reaches your target, it has arrived by the shortest route.

> **Warning**
>
> The one thing you must not forget on a graph — as opposed to a tree — is the **visited set**. Graphs contain cycles, and without it your traversal loops forever.

**Question**

*How do you traverse a graph layer-by-layer using breadth-first search (BFS)?*

Initialize a FIFO queue with the starting node and track visited vertices in a set; repeatedly dequeue the oldest node, process it, and enqueue all unvisited neighbors, exploring vertices in order of increasing distance in `O(V + E)` time.

> **Interactive animation:** `graph-traversal` (option=bfs) — rendered by the page script in the HTML version.

**Breadth-first search**

```python
from collections import deque

def bfs(graph, start):
    """Queue -> oldest first -> explores level by level. O(V + E)."""
    visited = {start}
    q = deque([start])
    order = []

    while q:
        node = q.popleft()              # OLDEST first
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)  # mark on ENQUEUE, or it enters twice
                q.append(neighbour)
    return order
```

```javascript
function bfs(graph, start) {            // queue -> level by level
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  let head = 0;                         // index, not shift() - keeps it O(1)

  while (head < queue.length) {
    const node = queue[head++];         // OLDEST first
    order.push(node);
    for (const neighbour of graph.get(node) ?? []) {
      if (visited.has(neighbour)) continue;
      visited.add(neighbour);           // mark on ENQUEUE
      queue.push(neighbour);
    }
  }
  return order;
}
```

**Question**

*How do you traverse deep into a graph iteratively using a stack (DFS)?*

Swap the BFS queue for a LIFO stack. By taking the *newest* item instead of the oldest, the same loop dives down a single branch instead of spreading in rings. Pushing neighbours in reverse ensures they pop in identical order to the recursive walk.

> **Interactive animation:** `graph-traversal` (option=dfs) — rendered by the page script in the HTML version.

**Depth-first search (iterative)**

```python
def dfs_iterative(graph, start):
    """Stack -> newest first -> dives down one branch. O(V + E)."""
    visited = set()
    stack = [start]
    order = []

    while stack:
        node = stack.pop()                  # NEWEST first
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbour in reversed(graph[node]):
            if neighbour not in visited:
                stack.append(neighbour)
    return order
```

```javascript
function dfsIterative(graph, start) {       // stack -> dive deep
  const visited = new Set();
  const stack = [start];
  const order = [];

  while (stack.length) {
    const node = stack.pop();               // NEWEST first
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);
    const neighbours = graph.get(node) ?? [];
    for (let i = neighbours.length - 1; i >= 0; i--) {
      if (!visited.has(neighbours[i])) stack.push(neighbours[i]);
    }
  }
  return order;
}
```

<a id="dijkstra"></a>

#### Dijkstra's algorithm — shortest path with costs

BFS finds the fewest *hops*. When edges have costs — kilometres, minutes, money — you need **Dijkstra**. It keeps a **min-heap** (priority queue) of the cheapest place to go next, and **relaxes** edges as it goes: whenever a shortcut is found, the recorded cost is lowered. This is what powers Google Maps.

> **Interactive animation:** `dijkstra` — rendered by the page script in the HTML version.

> **Key idea**
>
> Dijkstra only works because every weight is **non-negative** — that guarantees a settled node can never be improved later, since a detour only ever adds cost. With negative edges the logic collapses and you need Bellman-Ford instead.

**Dijkstra with a priority queue**

```python
            import heapq
            from collections import defaultdict

            def dijkstra(graph, start):
                """graph: {node: [(neighbour, weight)]}. O((V + E) log V)."""
                dist = defaultdict(lambda: float("inf"))
                dist[start] = 0
                prev = {}
                visited = set()
                pq = [(0, start)]           # (distance, node) - the heap orders by distance

                while pq:
                    d, node = heapq.heappop(pq)
                    if node in visited:
                        continue            # a stale entry from an earlier, worse path
                    visited.add(node)       # this distance is now final

                    for neighbour, weight in graph[node]:
                        candidate = d + weight
                        if candidate < dist[neighbour]:     # relax
                            dist[neighbour] = candidate
                            prev[neighbour] = node
                            heapq.heappush(pq, (candidate, neighbour))
                            # We do not remove the old entry; we just skip it above.
                            # This "lazy deletion" is simpler and still O(E log V).

                return dict(dist), prev

            def rebuild_path(prev, start, goal):
                path, node = [], goal
                while node != start:
                    path.append(node)
                    node = prev.get(node)
                    if node is None:
                        return None         # unreachable
                path.append(start)
                return path[::-1]

            graph = {
                "A": [("B", 4), ("C", 2)],
                "B": [("A", 4), ("C", 1), ("D", 5)],
                "C": [("A", 2), ("B", 1), ("D", 8), ("F", 10)],
                "D": [("B", 5), ("C", 8), ("E", 2), ("F", 6)],
                "E": [("D", 2), ("F", 3)],
                "F": [("C", 10), ("D", 6), ("E", 3)],
            }
            dist, prev = dijkstra(graph, "A")
            print(dist["F"])                            # 12
            print(rebuild_path(prev, "A", "F"))         # ['A', 'C', 'B', 'D', 'F']

```

```javascript
            // Uses the Heap class from section 19.
            function dijkstra(graph, start) {       // O((V + E) log V)
              const dist = new Map([[start, 0]]);
              const prev = new Map();
              const visited = new Set();
              const pq = new Heap((a, b) => a[0] - b[0]);   // [distance, node]
              pq.push([0, start]);

              while (pq.size) {
                const [d, node] = pq.pop();
                if (visited.has(node)) continue;    // stale entry - lazy deletion
                visited.add(node);                  // distance is now final

                for (const [neighbour, weight] of graph.get(node) ?? []) {
                  const candidate = d + weight;
                  if (candidate < (dist.get(neighbour) ?? Infinity)) {   // relax
                    dist.set(neighbour, candidate);
                    prev.set(neighbour, node);
                    pq.push([candidate, neighbour]);
                  }
                }
              }
              return { dist, prev };
            }

            function rebuildPath(prev, start, goal) {
              const path = [];
              let node = goal;
              while (node !== start) {
                path.push(node);
                node = prev.get(node);
                if (node === undefined) return null;    // unreachable
              }
              path.push(start);
              return path.reverse();
            }

            const graph = new Map([
              ["A", [["B", 4], ["C", 2]]],
              ["B", [["A", 4], ["C", 1], ["D", 5]]],
              ["C", [["A", 2], ["B", 1], ["D", 8], ["F", 10]]],
              ["D", [["B", 5], ["C", 8], ["E", 2], ["F", 6]]],
              ["E", [["D", 2], ["F", 3]]],
              ["F", [["C", 10], ["D", 6], ["E", 3]]],
            ]);
            const { dist, prev } = dijkstra(graph, "A");
            console.log(dist.get("F"));                     // 12
            console.log(rebuildPath(prev, "A", "F"));       // ['A','C','B','D','F']

```

---

<a id="unit-3"></a>

## Unit 3 — Core Algorithms

Structures hold the data. Algorithms are the disciplined, step-by-step methods for working with it.

<a id="8-searching"></a>

### Searching

1. **Linear search** `O(n)` — check every item one by one. Slow, but it is the only option on unsorted data.
2. **Binary search** `O(log n)` — requires **sorted** data. Open in the middle, decide whether the target is left or right, throw the other half away, repeat.

> **Analogy** 📖
>
> **Picture it — a dictionary**
>
> Looking for "monsoon", you do not start at "aardvark". You flip to the middle, land on "K", and instantly discard the first half of the book. Finding one word among 100,000 takes about **17 steps**.

> **Interactive animation:** `binary-search` — rendered by the page script in the HTML version.

**Question**

*How do you implement binary search iteratively on a sorted array?*

Given a sorted array and a target value, repeatedly compare the target against the middle element; adjust the low or high pointer to halve the remaining search space on every iteration, achieving `O(log n)` time with `O(1)` auxiliary space.

**Binary search**

```python
def binary_search(nums, target):
    """Index of target, or -1. Requires a SORTED list."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2   # overflow-safe midpoint, good habit
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1            # discard mid and everything left of it
        else:
            hi = mid - 1            # discard mid and everything right of it
    return -1

print(binary_search([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 72))   # 8
```

```javascript
function binarySearch(nums, target) {   // needs a SORTED array
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);  // overflow-safe midpoint
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;   // drop the left half
    else hi = mid - 1;                      // drop the right half
  }
  return -1;
}

console.log(binarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 72));  // 8
```

**Top Interview Question**

*A sorted array was rotated at some unknown pivot — for example `[4, 5, 6, 7, 0, 1, 2]`. Find a target in `O(log n)`.*

The array is no longer fully sorted, so plain binary search breaks. But here is the key observation: however you cut it at `mid`, **at least one half is still properly sorted**.

Work out which half is the clean one by comparing `nums[lo]` with `nums[mid]`. If the target lies inside that sorted half's range, search there; otherwise it must be in the messy half. You still halve the range every step, so it stays logarithmic.

**Answer — search a rotated sorted array**

```python
def search_rotated(nums, target):
    """O(log n). One half of any split is always properly sorted."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid

        if nums[lo] <= nums[mid]:               # LEFT half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                    # target is inside it
            else:
                lo = mid + 1                    # must be in the messy half
        else:                                   # RIGHT half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))     # 4
print(search_rotated([4, 5, 6, 7, 0, 1, 2], 3))     # -1
```

```javascript
function searchRotated(nums, target) {  // O(log n)
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {        // LEFT half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;                // must be in the messy half
    } else {                            // RIGHT half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0));   // 4
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 3));   // -1
```

<a id="9-sorting"></a>

### Sorting

You will rarely write a sort in production — both languages ship excellent ones. You learn them because they are the clearest demonstration of algorithmic technique: one task, solved six ways, with the trade-offs on display. Below, each algorithm is animated step by step alongside its core mechanism.

#### 1. Bubble sort

Compare adjacent elements and swap them if they are out of order, repeating until the array is sorted. After pass `k`, the largest `k` values are parked at the end. `O(n²)` worst/average, `O(n)` best on nearly-sorted data.

> **Interactive animation:** `sorting` (option=bubble) — rendered by the page script in the HTML version.

**Bubble sort**

```python
def bubble_sort(nums):
    """O(n^2) worst/average, O(n) best. In-place, stable."""
    n = len(nums)
    swapped = True
    while swapped:
        swapped = False
        for i in range(n - 1):
            if nums[i] > nums[i + 1]:
                nums[i], nums[i + 1] = nums[i + 1], nums[i]
                swapped = True
        n -= 1
    return nums

print(bubble_sort([38, 12, 47, 5, 29]))          # [5, 12, 29, 38, 47]
```

```javascript
function bubbleSort(nums) {             // O(n^2) worst, O(n) best, stable
  let n = nums.length;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = 0; i + 1 < n; i++) {
      if (nums[i] > nums[i + 1]) {
        [nums[i], nums[i + 1]] = [nums[i + 1], nums[i]];
        swapped = true;
      }
    }
    n--;
  }
  return nums;
}

console.log(bubbleSort([38, 12, 47, 5, 29]));      // [5, 12, 29, 38, 47]
```

#### 2. Selection sort

Repeatedly find the minimum element in the unsorted suffix and swap it into place. Exactly `n - 1` swaps total — the fewest writes of any comparison sort. Always `O(n²)` comparisons, but `O(n)` writes.

> **Interactive animation:** `sorting` (option=selection) — rendered by the page script in the HTML version.

**Selection sort**

```python
def selection_sort(nums):
    """O(n^2) comparisons, O(n) swaps total. In place, not stable."""
    n = len(nums)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if nums[j] < nums[min_idx]:
                min_idx = j
        if min_idx != i:
            nums[i], nums[min_idx] = nums[min_idx], nums[i]
    return nums

print(selection_sort([38, 12, 47, 5, 29]))       # [5, 12, 29, 38, 47]
```

```javascript
function selectionSort(nums) {          // O(n^2) comparisons, O(n) swaps
  const n = nums.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (nums[j] < nums[min]) min = j;
    }
    if (min !== i) [nums[i], nums[min]] = [nums[min], nums[i]];
  }
  return nums;
}

console.log(selectionSort([38, 12, 47, 5, 29]));   // [5, 12, 29, 38, 47]
```

#### 3. Insertion sort

Build the sorted array one element at a time, sliding each new item leftward into its proper position like cards in your hand. `O(n²)` worst, but `O(n)` on nearly-sorted data with small constants.

> **Interactive animation:** `sorting` (option=insertion) — rendered by the page script in the HTML version.

**Insertion sort**

```python
def insertion_sort(nums):
    """O(n^2) worst, O(n) adaptive. In-place, stable."""
    for i in range(1, len(nums)):
        key = nums[i]
        j = i - 1
        while j >= 0 and nums[j] > key:
            nums[j + 1] = nums[j]
            j -= 1
        nums[j + 1] = key
    return nums

print(insertion_sort([38, 12, 47, 5, 29]))       # [5, 12, 29, 38, 47]
```

```javascript
function insertionSort(nums) {          // O(n^2) worst, O(n) on sorted, stable
  for (let i = 1; i < nums.length; i++) {
    const key = nums[i];
    let j = i - 1;
    while (j >= 0 && nums[j] > key) {
      nums[j + 1] = nums[j];
      j--;
    }
    nums[j + 1] = key;
  }
  return nums;
}

console.log(insertionSort([38, 12, 47, 5, 29]));   // [5, 12, 29, 38, 47]
```

#### 4. Merge sort

Divide the array in half recursively until single elements remain, then merge sorted halves back together in linear time using two pointers. Guaranteed `O(n log n)` in all cases, stable, but requires `O(n)` auxiliary space.

> **Interactive animation:** `sorting` (option=merge) — rendered by the page script in the HTML version.

**Merge sort**

```python
def merge_sort(nums):
    """Divide and conquer. O(n log n) always. Stable."""
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])       # solve each half
    right = merge_sort(nums[mid:])

    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):      # then merge them
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]

print(merge_sort([38, 12, 47, 5, 29]))    # [5, 12, 29, 38, 47]
```

```javascript
function mergeSort(nums) {              // O(n log n) always, stable
  if (nums.length <= 1) return nums;
  const mid = nums.length >> 1;
  const left = mergeSort(nums.slice(0, mid));    // solve each half
  const right = mergeSort(nums.slice(mid));

  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {  // then merge
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  return [...out, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSort([38, 12, 47, 5, 29]));   // [5, 12, 29, 38, 47]
```

#### 5. Quicksort

Pick a pivot element, partition smaller elements to its left and larger elements to its right, and recurse on each side. Average `O(n log n)` with excellent cache performance and in-place partitioning, worst-case `O(n²)`.

> **Interactive animation:** `sorting` (option=quick) — rendered by the page script in the HTML version.

**Quicksort**

```python
def quicksort(nums):
    """Pick a pivot, split around it, repeat. Average O(n log n)."""
    if len(nums) <= 1:
        return nums
    pivot = nums[len(nums) // 2]
    smaller = [x for x in nums if x < pivot]
    equal = [x for x in nums if x == pivot]
    larger = [x for x in nums if x > pivot]
    return quicksort(smaller) + equal + quicksort(larger)

print(quicksort([38, 12, 47, 5, 29]))     # [5, 12, 29, 38, 47]
```

```javascript
function quicksort(nums) {              // average O(n log n)
  if (nums.length <= 1) return nums;
  const pivot = nums[nums.length >> 1];
  const smaller = nums.filter((x) => x < pivot);
  const equal = nums.filter((x) => x === pivot);
  const larger = nums.filter((x) => x > pivot);
  return [...quicksort(smaller), ...equal, ...quicksort(larger)];
}

console.log(quicksort([38, 12, 47, 5, 29]));   // [5, 12, 29, 38, 47]
```

#### 6. Heapsort

Convert the array into a max-heap in place, then repeatedly swap the maximum element at the root to the end and sift down. Guaranteed `O(n log n)` time and `O(1)` auxiliary space, but not stable.

> **Interactive animation:** `sorting` (option=heap) — rendered by the page script in the HTML version.

**Heapsort**

```python
def heapsort(nums):
    """O(n log n) always, O(1) auxiliary space, not stable."""
    def sift_down(n, i):
        while True:
            largest = i
            l, r = 2 * i + 1, 2 * i + 2
            if l < n and nums[l] > nums[largest]: largest = l
            if r < n and nums[r] > nums[largest]: largest = r
            if largest == i: break
            nums[i], nums[largest] = nums[largest], nums[i]
            i = largest

    # Build max-heap in place: O(n)
    for i in range(len(nums) // 2 - 1, -1, -1):
        sift_down(len(nums), i)
    # Extract max repeatedly: O(n log n)
    for end in range(len(nums) - 1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]
        sift_down(end, 0)
    return nums

print(heapsort([38, 12, 47, 5, 29]))             # [5, 12, 29, 38, 47]
```

```javascript
function heapSort(nums) {               // O(n log n) always, O(1) space
  const n = nums.length;
  const siftDown = (len, i) => {
    while (true) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < len && nums[l] > nums[largest]) largest = l;
      if (r < len && nums[r] > nums[largest]) largest = r;
      if (largest === i) break;
      [nums[i], nums[largest]] = [nums[largest], nums[i]];
      i = largest;
    }
  };

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(n, i);
  for (let end = n - 1; end > 0; end--) {
    [nums[0], nums[end]] = [nums[end], nums[0]];
    siftDown(end, 0);
  }
  return nums;
}

console.log(heapSort([38, 12, 47, 5, 29]));        // [5, 12, 29, 38, 47]
```

Two words get used constantly when comparing sorts. A sort is **stable** if items that compare equal keep their original relative order — that is what lets you sort by surname, then by department, and still have surnames ordered within each department. It is **in place** if it needs only `O(1)` extra memory rather than a second array. Merge sort is stable but not in place; quicksort is in place but not stable.

> **Tip**
>
> Python's `sort()` and JavaScript's `Array.prototype.sort()` are both **Timsort** — stable, `O(n log n)`, and `O(n)` on already-sorted input. Use them. One trap: JavaScript's `sort()` with no comparator sorts *as strings*, so `[10, 9, 1].sort()` gives `[1, 10, 9]`. Always pass `(a, b) => a - b`.

**Top Interview Question**

*Sort an array containing only the values `0`, `1` and `2` in a single pass, in place. This is the "Dutch national flag" problem.*

Calling `sort()` works but wastes the biggest clue in the question: there are only **three** distinct values. That extra information beats the `n log n` comparison barrier.

Partition the array using Dijkstra's Dutch National Flag algorithm: keep three pointers. Everything before `low` is a 0, everything after `high` is a 2, and `i` scans the unknown middle. Note the asymmetry: after swapping with `high` you must *not* advance `i`, because the value you just pulled in from the right has never been examined.

**Answer — sort colors in one pass**

```python
def sort_colors(nums):
    """O(n) time, O(1) space, single pass. Values must be 0, 1 or 2."""
    low, i, high = 0, 0, len(nums) - 1

    while i <= high:
        if nums[i] == 0:
            nums[low], nums[i] = nums[i], nums[low]
            low += 1
            i += 1              # the swapped-in value was already checked
        elif nums[i] == 2:
            nums[i], nums[high] = nums[high], nums[i]
            high -= 1           # do NOT advance i - that value is unseen
        else:                   # nums[i] == 1, already in the middle band
            i += 1

data = [2, 0, 2, 1, 1, 0]
sort_colors(data)
print(data)                     # [0, 0, 1, 1, 2, 2]
```

```javascript
function sortColors(nums) {     // O(n) time, O(1) space, single pass
  let low = 0;
  let i = 0;
  let high = nums.length - 1;

  while (i <= high) {
    if (nums[i] === 0) {
      [nums[low], nums[i]] = [nums[i], nums[low]];
      low++;
      i++;                      // swapped-in value was already checked
    } else if (nums[i] === 2) {
      [nums[i], nums[high]] = [nums[high], nums[i]];
      high--;                   // do NOT advance i - that value is unseen
    } else {
      i++;                      // a 1 is already in the middle band
    }
  }
}

const data = [2, 0, 2, 1, 1, 0];
sortColors(data);
console.log(data);              // [0, 0, 1, 1, 2, 2]
```

<a id="10-the-four-problem-solving-philosophies"></a>

## The Four Problem-Solving Philosophies

Almost every algorithm is built on one of four mindsets. Recognising which one a problem wants is most of the battle.

<a id="greedy"></a>

### 1. Greedy

**Philosophy:** take the best option available *right now* and never look back.

> **Analogy** 💵
>
> **Picture it — making change**
>
> A shopkeeper owing you 32 taka grabs the largest note that fits — 20 — then the next largest — 10 — then 2. No planning, no backtracking, done.

> **Warning**
>
> Greedy fails *silently*, which makes it dangerous. With coins {25, 10, 1}, making 30 greedily takes 25 + five 1s = **six coins**, but the best answer is three 10s. Always test your greedy rule against a small adversarial case before trusting it — if you can break it, you need dynamic programming.

**Top Interview Question**

*Each entry of an array is the maximum jump length from that index. Starting at index 0, can you reach the last index? `[2, 3, 1, 1, 4]` is reachable; `[3, 2, 1, 0, 4]` is not.*

Exploring every jump sequence is exponential. Greedily track the **furthest index reachable so far**: if the loop ever stands on an index beyond that reach, the array is broken there and no later element can help. One pass, `O(n)`.

**Answer — jump game by furthest reach**

```python
def can_jump(nums):
    """O(n) time, O(1) space. Track only the furthest index still reachable."""
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False            # stranded - nothing earlier could get here
        reach = max(reach, i + jump)
    return True

print(can_jump([2, 3, 1, 1, 4]))    # True
print(can_jump([3, 2, 1, 0, 4]))    # False - the 0 at index 3 is a wall
```

```javascript
function canJump(nums) {            // O(n) time, O(1) space
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;    // stranded before this index
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4]));   // true
console.log(canJump([3, 2, 1, 0, 4]));   // false
```

<a id="divide-and-conquer"></a>

### 2. Divide & Conquer

**Philosophy:** break an intimidating problem into small independent sub-problems, solve those, and combine the results.

Merge sort and quicksort are the canonical examples: split ten million items down to single items, where the problem is trivial, then reassemble. The sub-problems being *independent* is what separates this from dynamic programming.

All of it runs on **recursion** — a function that calls itself on a smaller input. You write it as if the smaller case is already solved, which is the mental leap, and handle only the smallest case by hand. Every recursive function needs exactly three things:

1. A **base case** that returns without recursing — in merge sort, a list of one item is already sorted.
2. A **recursive case** that calls itself on a *strictly smaller* input.
3. **Progress** — every path must move toward the base case.

> **Warning**
>
> Miss the base case, or fail to shrink the input, and the recursion never stops. Each call occupies a real frame on the **call stack**, so it does not hang — it crashes with `RecursionError` in Python (default limit ~1000 frames) or `Maximum call stack size exceeded` in JavaScript. Neither language optimises tail calls, so genuinely deep recursion must be rewritten as a loop with an explicit stack.

**Top Interview Question**

*Sort an array in guaranteed `O(n log n)` time without relying on the language's built-in sort.*

This is divide and conquer in its purest form: split the array in half, sort each half by the same method, then **merge** two sorted halves in linear time. The recursion is `log n` deep and each level does `O(n)` merging work, which is exactly where `O(n log n)` comes from. Merge sort is also stable.

**Answer — merge sort**

```python
def merge_sort(nums):
    """O(n log n) time, O(n) space. Stable: equal values keep their order."""
    if len(nums) <= 1:
        return nums                     # base case: already sorted
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])       # divide
    right = merge_sort(nums[mid:])
    return merge(left, right)           # conquer

def merge(left, right):
    """Linear-time merge of two sorted lists."""
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:         # <= is what keeps the sort stable
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]   # one side is empty by now

print(merge_sort([5, 2, 9, 1, 5, 6]))   # [1, 2, 5, 5, 6, 9]
```

```javascript
function mergeSort(nums) {              // O(n log n) time, O(n) space, stable
  if (nums.length <= 1) return nums;    // base case
  const mid = nums.length >> 1;
  return merge(mergeSort(nums.slice(0, mid)), mergeSort(nums.slice(mid)));
}

function merge(left, right) {           // linear-time merge of two sorted arrays
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);   // <= keeps it stable
    else out.push(right[j++]);
  }
  return out.concat(left.slice(i), right.slice(j));
}

console.log(mergeSort([5, 2, 9, 1, 5, 6]));   // [1, 2, 5, 5, 6, 9]
```

<a id="dynamic-programming"></a>

### 3. Dynamic Programming

**Philosophy:** those who do not remember the past are condemned to recompute it.

> **Analogy** 📔
>
> **Picture it — keeping a diary**
>
> Every time you finish a calculation you write the answer in a diary. When the same question comes up again — and in recursive problems it comes up constantly — you look it up instead of redoing the work.

Fibonacci is the standard demonstration. Naive recursion recomputes the same values an exponential number of times; caching them makes it linear. Step through the animation and watch the cache start intercepting calls:

> **Interactive animation:** `recursion` — rendered by the page script in the HTML version.

**Question**

*Why is naive recursive Fibonacci calculation inefficient?*

Evaluate the recurrence `fib(n) = fib(n-1) + fib(n-2)` directly without memoization; because identical subproblems are recomputed repeatedly across branching recursive calls, the time complexity balloons exponentially to `O(2ⁿ)`.

**The naive version — exponential**

```python
def fib_slow(n):
    """O(2^n) - recomputes the same subproblems over and over."""
    if n <= 1:
        return n
    return fib_slow(n - 1) + fib_slow(n - 2)
```

```javascript
function fibSlow(n) {                   // O(2^n)
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}
```

**Question**

*How does top-down memoization optimize recursive overlapping subproblems?*

Add a lookup table or hash map cache to record subproblem results as they are computed; whenever `fib(n)` is requested again, retrieve the cached value in `O(1)` time, collapsing the entire recursion tree from `O(2ⁿ)` down to linear `O(n)` time.

**With memoisation — linear**

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_fast(n):
    """O(n). The decorator IS the diary."""
    if n <= 1:
        return n
    return fib_fast(n - 1) + fib_fast(n - 2)

print(fib_fast(300))        # instant
```

```javascript
const memo = new Map();
function fibFast(n) {                   // O(n) - the Map is the diary
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fibFast(n - 1) + fibFast(n - 2);
  memo.set(n, value);
  return value;
}

console.log(fibFast(90));               // use BigInt past 2^53 - 1
```

**Question**

*How do you convert top-down recursion into space-optimized bottom-up dynamic programming?*

Once you see that each answer depends only on the two before it, you can drop the recursion entirely and sweep forward with two variables — same result, no stack frames, constant memory.

**Bottom-up — linear time, constant space**

```python
def fib_iterative(n):
    """O(n) time, O(1) space - no recursion at all."""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib_iterative(90))    # 2880067194370816120
```

```javascript
function fibIterative(n) {              // O(n) time, O(1) space
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

console.log(fibIterative(90));          // use BigInt past 2^53 - 1
```

**Top Interview Question**

*You climb a staircase of `n` steps, taking 1 or 2 steps at a time. How many distinct ways are there to reach the top?*

To arrive at step `n` you must have come from `n - 1` or `n - 2`, so `ways(n) = ways(n - 1) + ways(n - 2)` — Fibonacci in disguise. Since only the last two values are ever needed, the table collapses into two variables: `O(n)` time, `O(1)` space.

**Answer — climbing stairs**

```python
def climb_stairs(n):
    """O(n) time, O(1) space. Only the previous two answers are ever needed."""
    one_back, two_back = 1, 1       # ways(1) = 1, ways(0) = 1
    for _ in range(2, n + 1):
        one_back, two_back = one_back + two_back, one_back
    return one_back

print(climb_stairs(5))              # 8
```

```javascript
function climbStairs(n) {           // O(n) time, O(1) space
  let oneBack = 1, twoBack = 1;     // ways(1) = 1, ways(0) = 1
  for (let i = 2; i <= n; i++) {
    [oneBack, twoBack] = [oneBack + twoBack, oneBack];
  }
  return oneBack;
}

console.log(climbStairs(5));        // 8
```

<a id="backtracking"></a>

### 4. Backtracking

**Philosophy:** try a path; on hitting a dead end, step back to the last junction and try a different one.

> **Analogy** 🧩
>
> **Picture it — solving Sudoku**
>
> You pencil a 5 into a cell. Three moves later it breaks a rule. So you retrace, erase the 5, and try a 6. A maze works the same way — and so does a chess engine exploring millions of futures and abandoning the dead ends.

The code is always the same three lines — **choose, explore, un-choose**:

```text
def backtrack(state):
                if is_complete(state):
                record(state); return

                for choice in candidates(state):
                if not is_valid(choice, state):
                continue # PRUNE - this is what makes it tractable
                state.append(choice) # 1. choose
                backtrack(state) # 2. explore
                state.pop() # 3. un-choose
```

**Top Interview Question**

*How do you generate all possible subsets (the power set) of a collection using backtracking?*

At each element index, branch into two decisions: include the element or exclude it; recursively explore down each choice branch, record the accumulated state upon reaching each leaf, and un-choose the element to restore state for sibling branches in `O(2ⁿ)` time.

**Backtracking: every subset of a list**

```python
def subsets(nums):
    """All 2^n subsets. At each index: take it, or skip it."""
    out, path = [], []

    def go(i):
        if i == len(nums):
            out.append(path[:])     # copy - path keeps mutating
            return
        go(i + 1)                   # skip nums[i]
        path.append(nums[i])        # 1. choose
        go(i + 1)                   # 2. explore
        path.pop()                  # 3. un-choose

    go(0)
    return out

print(subsets([1, 2, 3]))
# [[], [3], [2], [2,3], [1], [1,3], [1,2], [1,2,3]]
```

```javascript
function subsets(nums) {                // all 2^n subsets
  const out = [];
  const path = [];

  const go = (i) => {
    if (i === nums.length) {
      out.push([...path]);              // copy - path keeps mutating
      return;
    }
    go(i + 1);                          // skip
    path.push(nums[i]);                 // 1. choose
    go(i + 1);                          // 2. explore
    path.pop();                         // 3. un-choose
  };

  go(0);
  return out;
}

console.log(subsets([1, 2, 3]).length); // 8
```

> **Tip**
>
> **Pruning is everything.** Brute-force 8-queens would test 16.7 million placements; checking for conflicts as you go cuts it to roughly 2,000 recursive calls. When backtracking is too slow, the fix is a better constraint check — never a faster language.

---

<a id="11-the-whole-thing-on-one-page"></a>

## The Whole Thing on One Page

<a id="pick-a-structure"></a>

### Pick a structure

| Structure | Access | Search | Insert | Reach for it when… |
| --- | --- | --- | --- | --- |
| Array | `O(1)` | `O(n)` | `O(n)` | you index or iterate far more than you insert |
| Linked list | `O(n)` | `O(n)` | `O(1)` | you splice constantly and never index |
| Stack | `O(n)` | `O(n)` | `O(1)` | the problem nests — brackets, undo, DFS |
| Queue | `O(n)` | `O(n)` | `O(1)` | order of arrival matters — scheduling, BFS |
| Hash map / set | — | `O(1)` | `O(1)` | you ask "have I seen this?" or "does X exist?" |
| Heap | `O(1)` min | `O(n)` | `O(log n)` | you repeatedly need the best item — top-k, Dijkstra |
| Balanced BST | `O(log n)` | `O(log n)` | `O(log n)` | you need sorted order *and* fast lookup |
| Trie | `O(L)` | `O(L)` | `O(L)` | prefixes matter — autocomplete, dictionaries |
| Graph | — | `O(V + E)` | `O(1)` | things connect to things — networks, maps, deps |

<a id="pick-an-approach"></a>

### Pick an approach

- **"Sorted array" + find a pair** — Two pointers, one at each end. `O(n)`.
- **"Have I seen this before?"** — Hash set. Turns `O(n²)` into `O(n)`.
- **"Top k" or "k-th largest"** — A heap of size `k`.
- **"Fewest moves / steps"** — BFS.
- **"Does a path exist?"** — DFS.
- **"Cheapest route" with costs** — Dijkstra.
- **"How many ways" / "min or max cost"** — Dynamic programming.
- **"All combinations / permutations"** — Backtracking with pruning.
- **"Prefix" or "autocomplete"** — Trie.
- **"Dependencies / prerequisites"** — Topological sort on a DAG.

<a id="how-to-attack-any-problem"></a>

### How to attack any problem

1. **Restate it** in your own words. Confirm the edge cases: empty input, one element, duplicates, negatives, maximum size.
2. **Write the brute force**, even just out loud. It gives you a correct baseline and a complexity to beat.
3. **Find the waste.** What is being recomputed? What gets thrown away between iterations?
4. **Match the pattern** from the list above.
5. **Say the complexity out loud** — time and space — before you call it done.

> **Key idea**
>
> Step 3 is the transferable skill. Two pointers, sliding windows, prefix sums, memoisation, monotonic stacks and hash maps are all the same move: *notice that you are throwing away work between iterations, and keep it instead.*

<a id="where-next"></a>

### Where to go next

1. 📘 The [DSA Detailed Course](dsa-detailed-course.html) — the same ground in 38 sections, plus prefix sums, union-find, topological sort, MSTs, segment trees, string matching and a full practice roadmap.
2. 📚 Browse all guides in the [DSA Courses catalog](dsa-courses.html).
3. 📖 [VisuAlgo](https://visualgo.net/) — interactive visualisations of every structure here.
4. 🧠 [LeetCode](https://leetcode.com/) — for the repetitions. Time-box to 25 minutes, then read the solution and re-solve it from scratch the next day.

> *"Bad programmers worry about the code. Good programmers worry about data structures and their relationships."* — Linus Torvalds

---

TechToday Study Library — Data Structures & Algorithms
