<!--
Source: dsa-detailed-course.html
Title: DSA Detailed Course | TechToday
Description: A complete data structures and algorithms course with animated visualisations and side-by-side Python and JavaScript implementations.
Theme-color: #0b0d10
Stylesheets: dsa-study.css, ../../site-header.css
Scripts: dsa-study.js
-->

Navigation: [TechToday](../../index.html) · [← DSA Courses](dsa-courses.html)

<a id="dsa-detailed-course"></a>

# Data Structures & Algorithms

A complete, self-contained course. Every structure is explained from first principles, animated step by step, and implemented twice — once in Python and once in JavaScript — so you can read whichever language you think in. Press **Play** on any animation and step through it; the pictures do most of the teaching.

<a id="table-of-contents"></a>

## Table of Contents

1. [How to Use This Course](#1-how-to-use-this-course)
2. [Complexity Analysis](#2-complexity-analysis)
3. [How Memory Actually Works](#3-how-memory-actually-works)
4. [Arrays](#4-arrays)
5. [Strings](#5-strings)
6. [Two Pointers](#6-two-pointers)
7. [Sliding Window](#7-sliding-window)
8. [Prefix Sums & Difference Arrays](#8-prefix-sums-and-difference-arrays)
9. [Hash Tables](#9-hash-tables)
10. [Linked Lists](#10-linked-lists)
11. [Stacks](#11-stacks)
12. [Queues & Deques](#12-queues-and-deques)
13. [Recursion](#13-recursion)
14. [Sorting](#14-sorting)
15. [Searching & Binary Search](#15-searching-and-binary-search)
16. [Trees](#16-trees)
17. [Binary Search Trees](#17-binary-search-trees)
18. [Balanced Trees & B-Trees](#18-balanced-trees-and-b-trees)
19. [Heaps & Priority Queues](#19-heaps-and-priority-queues)
20. [Tries](#20-tries)
21. [Union-Find](#21-union-find)
22. [Graph Representations](#22-graph-representations)
23. [Graph Traversal](#23-graph-traversal)
24. [Topological Sort](#24-topological-sort)
25. [Shortest Paths](#25-shortest-paths)
26. [Minimum Spanning Trees](#26-minimum-spanning-trees)
27. [Greedy Algorithms](#27-greedy-algorithms)
28. [Divide & Conquer](#28-divide-and-conquer)
29. [Backtracking](#29-backtracking)
30. [Dynamic Programming](#30-dynamic-programming)
31. [Bit Manipulation](#31-bit-manipulation)
32. [Math & Number Theory](#32-math-and-number-theory)
33. [Range Query Structures](#33-range-query-structures)
34. [String Algorithms](#34-string-algorithms)
35. [Intervals & Sweep Line](#35-intervals-and-sweep-line)
36. [Complexity Cheat Sheet](#36-complexity-cheat-sheet)
37. [Pattern Recognition Playbook](#37-pattern-recognition-playbook)
38. [Practice Roadmap](#38-practice-roadmap)

<a id="1-how-to-use-this-course"></a>

## 1. How to Use This Course

Data structures and algorithms is not a vocabulary test. It is the study of a single question: **given the shape of my data and the operations I need, what is the cheapest way to arrange it?** Every structure in this course is an answer to that question, and every structure is a trade — you buy fast lookups with extra memory, or fast inserts with slow scans. Nothing here is universally "best".

The material is arranged so that each section only depends on the ones before it. Complexity analysis comes first because it is the language everything else is described in. Then arrays, because arrays are what the hardware actually gives you and every other structure is either built on top of one or defined in contrast to one.

<a id="how-each-section-is-built"></a>

### How each section is built

1. **The idea in plain language** — what problem the structure solves and what it costs.
2. **A picture or an animation** — press Play, or step through with the arrows. Animations pause automatically when they scroll off screen.
3. **Implementations in Python and JavaScript** — click the language tabs at the top of any code block. Your choice is remembered across the whole page.
4. **Complexity and gotchas** — the numbers you should be able to recite, and the mistakes people actually make.
5. **When to reach for it** — the signal in a problem statement that says "use this".

> **Tip**
>
> Read with a keyboard nearby. Type the implementations out rather than copying them — the muscle memory of writing a binary search correctly is worth more than reading ten of them.

> **Key idea**
>
> New to the subject, or short on time? Start with the [DSA Crash Course](dsa-crash-course.html) — the same structures explained through everyday mental models in about a tenth of the reading, then come back here for the implementations, proofs and edge cases.

<a id="a-note-on-the-two-languages"></a>

### A note on the two languages

**Question**

*How do language ergonomics and standard collections differ between Python and JavaScript?*

Python and JavaScript were chosen because they are the two languages most people already have. They are also instructive together: Python hands you `list`, `dict`, `set`, `heapq` and `deque` out of the box, while JavaScript gives you `Array`, `Map` and `Set` but *no* heap and no real deque. Where a language lacks a structure, this course implements it, which is the best possible way to learn how it works.

**The same idea, two languages**

```python
# Python gives you a lot for free.
from collections import deque, defaultdict, Counter
import heapq

stack = []                      # list works as a stack
queue = deque()                 # O(1) pops from both ends
heap = []                       # heapq turns a list into a min-heap
lookup = {}                     # hash map
seen = set()                    # hash set
graph = defaultdict(list)       # adjacency list that self-initialises
freq = Counter("mississippi")   # {'i': 4, 's': 4, 'p': 2, 'm': 1}
```

```javascript
// JavaScript gives you less, so you build a little more.
const stack = [];               // push / pop
const queue = [];               // shift() is O(n) - use an index or a ring buffer
const heap = new MinHeap();     // not built in; we write one in section 19
const lookup = new Map();       // insertion-ordered hash map, any key type
const seen = new Set();
const graph = new Map();        // Map<node, node[]>
const freq = new Map();
for (const ch of "mississippi") freq.set(ch, (freq.get(ch) ?? 0) + 1);
```

> **Warning**
>
> **The single most common JavaScript performance bug in interviews:** using `array.shift()` as a queue. It re-indexes the entire array, so it is `O(n)`, turning an `O(V + E)` BFS into `O(V²)`. Use a head pointer instead — section 12 shows how.

<a id="2-complexity-analysis"></a>

## 2. Complexity Analysis

- **Purpose** compare algorithms without running them
- **Measures** time, space
- **Ignores** constants, hardware, small inputs

Timing code with a stopwatch tells you about your laptop. Big-O tells you about your algorithm. It answers one specific question: *as the input grows, how does the work grow?* Constants and lower-order terms are dropped because they stop mattering once `n` gets large — an `O(n²)` algorithm will lose to an `O(n log n)` one eventually, no matter how cleverly the loop body is optimised.

<a id="the-notations"></a>

### The three notations

1. **Big-O** `O(f)` — an *upper* bound. "It grows no faster than this." This is what people mean 95% of the time.
2. **Big-Omega** `Ω(f)` — a *lower* bound. "It grows at least this fast." Comparison sorting is `Ω(n log n)`: no comparison sort can ever do better.
3. **Big-Theta** `Θ(f)` — a tight bound, when the upper and lower bounds match. Merge sort is `Θ(n log n)` because it is that fast on every possible input.

You should also separate **best / average / worst** case from these notations — they are independent axes. Quicksort's worst case is `O(n²)` and its average case is `O(n log n)`; both are Big-O statements about different input distributions.

<a id="the-growth-classes"></a>

### The growth classes, from best to worst

*Diagram labels:* input size n → · operations · O(1) · O(log n) · O(n) · O(n log n) · O(n²) · O(2ⁿ) · O(n!)

*The curves that matter. Anything above `O(n log n)` stops being usable long before the input gets interesting.*

1. `O(1)` **constant** — array index, hash lookup, push onto a stack. The input size is irrelevant.
2. `O(log n)` **logarithmic** — binary search, balanced tree operations, heap push/pop. You halve the problem each step. Doubling the input adds *one* step.
3. `O(n)` **linear** — a single pass. Doubling the input doubles the work. This is usually the floor, since you normally must at least read the input.
4. `O(n log n)` **linearithmic** — the good sorts, and any algorithm that sorts first. Practically indistinguishable from linear at real-world sizes.
5. `O(n²)` **quadratic** — nested loops over the same input, comparing every pair. Fine up to a few thousand items, painful beyond that.
6. `O(2ⁿ)` **exponential** — every subset. Naive recursive Fibonacci, brute-force subset problems. Dies around `n = 30`.
7. `O(n!)` **factorial** — every permutation. Travelling salesman by brute force. Dies around `n = 12`.

> **Key idea**
>
> A useful yardstick: a modern machine does roughly **10⁸ simple operations per second** in an interpreted language. If `n = 10⁵`, then `O(n²) = 10¹⁰` is far too slow but `O(n log n) ≈ 1.7 × 10⁶` is instant. Read the constraints in a problem and they will tell you the intended complexity.

<a id="how-to-count"></a>

### How to count, mechanically

1. **Sequential blocks add**, then you keep the largest: `O(n) + O(n²) = O(n²)`.
2. **Nested loops multiply**: a loop of `n` containing a loop of `m` is `O(n·m)`.
3. **Drop constants**: `O(3n + 50) = O(n)`. Three passes is still linear.
4. **A loop that divides the counter** (`i //= 2`, `i *= 2`) is `O(log n)`.
5. **Recursion**: multiply the number of calls by the work per call, or use the Master Theorem below.

**Question**

*How do you calculate the Big-O time complexity of various loop structures?*

Analyze single loops, nested iterations, independent sequential passes, and halving step counters to count precise operation bounds.

**Counting practice**

```python
def example(nums):                      # n = len(nums)
    total = 0                           # O(1)

    for x in nums:                      # O(n)
        total += x

    for i in range(len(nums)):          # O(n) outer
        for j in range(len(nums)):      # O(n) inner  -> O(n^2) together
            if nums[i] + nums[j] == 10:
                total += 1

    i = len(nums)
    while i > 1:                        # halves each time -> O(log n)
        i //= 2

    return total                        # O(n) + O(n^2) + O(log n) = O(n^2)

def sum_pairs_once(nums):               # the classic O(n^2) -> O(n) rewrite
    seen, count = set(), 0
    for x in nums:                      # single pass, O(n) time
        count += (10 - x) in seen       # set membership is O(1) average
        seen.add(x)
    return count                        # O(n) time, O(n) extra space
```

```javascript
function example(nums) {                  // n = nums.length
  let total = 0;                          // O(1)

  for (const x of nums) total += x;       // O(n)

  for (let i = 0; i < nums.length; i++) { // O(n) outer
    for (let j = 0; j < nums.length; j++) // O(n) inner -> O(n^2)
      if (nums[i] + nums[j] === 10) total++;
  }

  let i = nums.length;
  while (i > 1) i = Math.floor(i / 2);    // O(log n)

  return total;                           // dominated by O(n^2)
}

function sumPairsOnce(nums) {             // the O(n^2) -> O(n) rewrite
  const seen = new Set();
  let count = 0;
  for (const x of nums) {                 // one pass, O(n)
    if (seen.has(10 - x)) count++;        // Set lookup is O(1) average
    seen.add(x);
  }
  return count;                           // O(n) time, O(n) space
}
```

<a id="space-complexity"></a>

### Space complexity

Space is counted the same way, but only **auxiliary** space — extra memory your algorithm allocates — is usually reported. The input itself does not count. Two things people forget:

1. **The call stack is space.** Recursing `n` deep costs `O(n)` memory even if you allocate nothing. This is why a recursive traversal of a degenerate tree can overflow the stack.
2. **Slices and string concatenation allocate.** In Python `s[1:]` copies; in a loop that turns an `O(n)` algorithm into `O(n²)`. Use indices instead.

<a id="amortised-analysis"></a>

### Amortised analysis

Appending to a dynamic array is usually `O(1)`, but occasionally the array is full and must be copied to a bigger block, which is `O(n)`. Because the array doubles, that expensive copy happens exponentially rarely: after `n` appends the total copying work is `1 + 2 + 4 + … + n < 2n`. Spread across `n` operations that is `O(1)` each — **amortised constant**. The distinction matters: amortised `O(1)` means a long run is fast, not that every individual call is.

<a id="the-master-theorem"></a>

### The Master Theorem

For divide-and-conquer recurrences of the form `T(n) = a·T(n/b) + O(n^d)` — split into `a` subproblems of size `n/b`, with `O(n^d)` work to split and combine:

1. If `d > log_b(a)` the combine step dominates: `T(n) = O(n^d)`.
2. If `d = log_b(a)` every level costs the same: `T(n) = O(n^d · log n)`.
3. If `d < log_b(a)` the leaves dominate: `T(n) = O(n^(log_b a))`.

Merge sort is `a = 2, b = 2, d = 1`; since `log₂2 = 1 = d`, it is `O(n log n)`. Binary search is `a = 1, b = 2, d = 0`; `log₂1 = 0 = d`, giving `O(log n)`. Naive matrix multiplication by blocks is `a = 8, b = 2, d = 2`; `log₂8 = 3 > 2`, giving `O(n³)`.

<a id="3-how-memory-actually-works"></a>

## 3. How Memory Actually Works

Every complexity claim in this course rests on one hardware fact: **memory is a single enormous numbered array of bytes**, and the CPU can jump to any address in constant time. Everything else — objects, lists, trees, graphs — is a convention layered on top of that flat array.

*Diagram labels:* CONTIGUOUS ARRAY — one block, addresses computed by arithmetic · 10 · 20 · 30 · 40 · 50 · 1000 · 1008 · 1016 · 1024 · 1032 · addr = base + i × 8 · → O(1), cache friendly · LINKED NODES — scattered, each one must be followed · 10 · 20 · 30 · 40 · 2040 · 7112 · 3888 · 9024

*Contiguity is the whole difference between an array and a linked list. One supports arithmetic; the other supports pointer chasing.*

<a id="why-cache-locality-matters"></a>

### Why cache locality matters

The CPU does not fetch one byte at a time. It fetches a **cache line** — typically 64 bytes — and keeps it in a small, very fast memory close to the core. Reading `arr[0]` therefore drags `arr[1]` through `arr[7]` along for free. Walking an array is close to free after the first miss; walking a linked list is a cache miss per node, and a miss costs roughly **100×** a hit.

> **Key idea**
>
> Two structures with identical Big-O can differ by an order of magnitude in wall-clock time. Big-O tells you how the cost scales; cache locality tells you what the constant is. Prefer arrays until measurements say otherwise.

<a id="stack-versus-heap"></a>

### Stack versus heap

1. The **call stack** holds one frame per active function call: parameters, locals, and the return address. It grows and shrinks like a stack (hence the name) and is tiny — typically 1–8 MB. Runaway recursion exhausts it and you get `RecursionError` in Python or `RangeError: Maximum call stack size exceeded` in JavaScript.
2. The **heap** is the large pool where objects, lists and dictionaries live. It is managed by the garbage collector in both our languages, and allocation there is much more expensive than pushing a stack frame.

**Question**

*What causes a stack overflow in recursive execution?*

Observe recursion depth limits by invoking self-calling functions until the process call stack exhausts its frame capacity.

**Watching the stack limit**

```python
import sys

print(sys.getrecursionlimit())      # 1000 by default in CPython

def depth(n=0):
    try:
        return depth(n + 1)
    except RecursionError:
        return n

print(depth())                      # roughly 990-1000

# Python has no tail-call optimisation, so deep recursion must be
# rewritten as a loop with an explicit stack. This is why iterative
# graph traversals are safer on large inputs.
```

```javascript
function depth(n = 0) {
  try {
    return depth(n + 1);
  } catch {
    return n;                       // RangeError caught here
  }
}

console.log(depth());               // ~10,000-15,000 depending on engine

// No engine ships tail-call optimisation in practice either, so the same
// advice applies: convert deep recursion into an explicit stack loop.
```

<a id="4-arrays"></a>

## 4. Arrays

- **Access** `O(1)`
- **Search** `O(n)`
- **Append** `O(1)*` amortised
- **Insert / delete at i** `O(n)`
- **Space** `O(n)`

An array is a contiguous block of equal-sized slots. Because the slots are equal-sized and adjacent, the address of element `i` is pure arithmetic: `base + i × element_size`. That single fact gives you `O(1)` random access and is the reason arrays are the default container in every language.

> **Analogy** 🎬
>
> **Picture it — cinema seats**
>
> Seats in a row, numbered in order. With a ticket for Seat 5 you do not ask everyone in seats 1 to 4 where it is — you walk straight there. But adding a seat between 3 and 4 means everyone from 4 onward shuffles right. Instant access, expensive insertion: the whole personality of an array.

The cost is rigidity. Inserting into the middle means every later element must shift right one slot, and deleting means they all shift left. Both are `O(n)`. A **dynamic array** (Python's `list`, JavaScript's `Array`) hides the fixed-size problem by allocating spare capacity and doubling when it runs out, which is where amortised `O(1)` append comes from.

*Diagram labels:* capacity 4, size 4 — full · a · b · c · d · append("e") → no room · allocate 2×, copy all n, free old · capacity 8, size 5 — room to spare · a · b · c · d · e · next 3 appends are O(1)

*Doubling means the expensive copy happens exponentially rarely, so the average cost per append stays constant.*

<a id="the-operations-that-cost"></a>

### The operations that cost

**Question**

*How do dynamic array operations behave in Python and JavaScript?*

Examine random indexing, appending, shifting insertions, element removals, and multi-dimensional array initialization traps.

**Array fundamentals**

```python
nums = [10, 20, 30, 40, 50]

nums[2]                 # O(1)  - pure address arithmetic
nums.append(60)         # O(1)* - amortised; may trigger a resize
nums.pop()              # O(1)  - removing from the end shifts nothing

nums.insert(1, 15)      # O(n)  - every later element shifts right
nums.pop(0)             # O(n)  - every later element shifts left
nums.remove(30)         # O(n)  - a search plus a shift
30 in nums              # O(n)  - linear scan; use a set for membership

nums.sort()             # O(n log n) - Timsort, in place, stable
sorted(nums)            # O(n log n) - returns a new list
nums.reverse()          # O(n)
nums[1:4]               # O(k)  - slicing COPIES; not free

# Two-dimensional arrays: build rows independently.
grid = [[0] * 4 for _ in range(3)]      # correct: 3 distinct rows
wrong = [[0] * 4] * 3                   # BUG: three references to ONE row
wrong[0][0] = 9
print(wrong)            # [[9,0,0,0],[9,0,0,0],[9,0,0,0]]
```

```javascript
const nums = [10, 20, 30, 40, 50];

nums[2];                  // O(1)
nums.push(60);            // O(1)* amortised
nums.pop();               // O(1)

nums.splice(1, 0, 15);    // O(n) - insert at index 1
nums.shift();             // O(n) - removes the front, re-indexes everything
nums.indexOf(30);         // O(n)
nums.includes(30);        // O(n) - use a Set for membership tests

nums.sort((a, b) => a - b);  // O(n log n); WITHOUT the comparator JS sorts
                             // lexicographically: [1,10,2] not [1,2,10]
nums.slice(1, 4);         // O(k) - copies
nums.reverse();           // O(n) - in place

// Two-dimensional arrays: same aliasing trap as Python.
const grid = Array.from({ length: 3 }, () => new Array(4).fill(0)); // correct
const wrong = new Array(3).fill(new Array(4).fill(0));              // BUG
wrong[0][0] = 9;
console.log(wrong);       // every row shows 9 - they are the same array
```

> **Warning**
>
> Both languages share the **2-D aliasing trap**: multiplying or filling with a row object stores the same reference `n` times. Always construct each row with a comprehension or `Array.from`.

<a id="in-place-rotation"></a>

### A worked example: rotating in place

Rotating an array right by `k` looks like it needs a second array. The reversal trick does it with `O(1)` extra space — reverse everything, then reverse the two pieces. It is worth internalising because the same "reverse to rotate" idea shows up in string problems constantly.

```text
original [1, 2, 3, 4, 5, 6, 7] k = 3
                reverse all [7, 6, 5, 4, 3, 2, 1]
                reverse [0,k) [5, 6, 7, | 4, 3, 2, 1]
                reverse [k,n) [5, 6, 7, | 1, 2, 3, 4] ← rotated right by 3
```

**Top Interview Question 1**

*How do you rotate an array by k positions in O(1) extra space?*

Reverse the entire array, reverse the first `k` elements, and reverse the remaining elements to cyclically shift all values in `O(n)` time without auxiliary memory.

**Rotate right by k in O(1) space**

```python
def rotate(nums, k):
    """Rotate nums right by k, in place. O(n) time, O(1) space."""
    n = len(nums)
    k %= n                          # rotating by n is a no-op
    if k == 0:
        return

    def reverse(lo, hi):
        while lo < hi:
            nums[lo], nums[hi] = nums[hi], nums[lo]
            lo, hi = lo + 1, hi - 1

    reverse(0, n - 1)               # whole array
    reverse(0, k - 1)               # first k
    reverse(k, n - 1)               # the rest

data = [1, 2, 3, 4, 5, 6, 7]
rotate(data, 3)
print(data)                         # [5, 6, 7, 1, 2, 3, 4]
```

```javascript
function rotate(nums, k) {
  const n = nums.length;
  k %= n;
  if (k === 0) return;

  const reverse = (lo, hi) => {
    while (lo < hi) {
      [nums[lo], nums[hi]] = [nums[hi], nums[lo]];
      lo++;
      hi--;
    }
  };

  reverse(0, n - 1);   // whole array
  reverse(0, k - 1);   // first k
  reverse(k, n - 1);   // the rest
}

const data = [1, 2, 3, 4, 5, 6, 7];
rotate(data, 3);
console.log(data);     // [5, 6, 7, 1, 2, 3, 4]
```

<a id="when-to-use-arrays"></a>

### When to reach for an array

1. You need **indexed access** or you iterate far more often than you insert.
2. The data is **fixed or grows only at the end**.
3. You care about **speed constants** — nothing beats a contiguous scan.
4. You are about to sort, binary search, or apply two pointers / sliding window — all of which require random access.

**Top Interview Question 2**

*Return an array where each position holds the product of every *other* element. `[1, 2, 3, 4]` becomes `[24, 12, 8, 6]`. Division is banned, and it must run in `O(n)`.*

Division would be a one-liner — until a single zero appears and the whole thing collapses. The division-free answer is two sweeps: one left-to-right accumulating the product of everything *before* each index, one right-to-left folding in everything *after*. The output array doubles as the scratch space, so the extra memory is `O(1)`.

**Answer — product of array except self**

```python
def product_except_self(nums):
    """O(n) time, O(1) extra space (the output does not count). No division."""
    out = [1] * len(nums)

    prefix = 1                          # product of everything to the left
    for i in range(len(nums)):
        out[i] = prefix
        prefix *= nums[i]

    suffix = 1                          # product of everything to the right
    for i in range(len(nums) - 1, -1, -1):
        out[i] *= suffix
        suffix *= nums[i]

    return out

print(product_except_self([1, 2, 3, 4]))    # [24, 12, 8, 6]
print(product_except_self([0, 4, 0]))       # [0, 0, 0] - zeros are handled
```

```javascript
function productExceptSelf(nums) {      // O(n) time, O(1) extra space
  const out = new Array(nums.length).fill(1);

  let prefix = 1;                       // product of everything to the left
  for (let i = 0; i < nums.length; i++) {
    out[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;                       // product of everything to the right
  for (let i = nums.length - 1; i >= 0; i--) {
    out[i] *= suffix;
    suffix *= nums[i];
  }

  return out;
}

console.log(productExceptSelf([1, 2, 3, 4]));   // [24, 12, 8, 6]
console.log(productExceptSelf([0, 4, 0]));      // [0, 0, 0]
```

**Top Interview Question 3**

*Given daily stock prices, return the largest profit from a single buy followed by a later sell, or `0` if no trade is profitable.*

The pairwise scan is `O(n²)`. Note that the best sale on any given day depends only on the **cheapest price seen so far** — a running minimum. That turns the problem into one pass over the array with two scalars, `O(n)` time and `O(1)` space.

**Answer — best time to buy and sell stock**

```python
def max_profit(prices):
    """O(n) time, O(1) space. Track the cheapest buy seen so far."""
    cheapest, best = float("inf"), 0
    for price in prices:
        cheapest = min(cheapest, price)         # best day to have bought
        best = max(best, price - cheapest)      # sell today at today's price
    return best

print(max_profit([7, 1, 5, 3, 6, 4]))   # 5
print(max_profit([7, 6, 4, 3, 1]))      # 0 - never profitable
```

```javascript
function maxProfit(prices) {            // O(n) time, O(1) space
  let cheapest = Infinity, best = 0;
  for (const price of prices) {
    cheapest = Math.min(cheapest, price);       // best day to have bought
    best = Math.max(best, price - cheapest);    // sell at today's price
  }
  return best;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4]));   // 5
console.log(maxProfit([7, 6, 4, 3, 1]));      // 0 - never profitable
```

<a id="5-strings"></a>

## 5. Strings

- **Index** `O(1)`
- **Concatenate** `O(n + m)`
- **Substring / slice** `O(k)`
- **Naive search** `O(n·m)`
- **Immutable** in both languages

**Question**

*Why is repeated string concatenation expensive?*

A string is an array of characters with one crucial extra property in both Python and JavaScript: **it is immutable**. You cannot change a character in place; every "modification" builds a whole new string. That single property is responsible for the most common accidental `O(n²)` in beginner code.

**The quadratic concatenation trap**

```python
# BAD: each += allocates a new string and copies everything so far.
def build_bad(words):
    out = ""
    for w in words:
        out += w            # O(len(out)) each time -> O(n^2) overall
    return out

# GOOD: collect the pieces, join once. O(n) total.
def build_good(words):
    parts = []
    for w in words:
        parts.append(w)     # O(1) amortised
    return "".join(parts)   # one allocation of the final size

# Useful string operations
s = "Hello, World"
s.lower(), s.upper()        # O(n), new strings
s.split(", ")               # ['Hello', 'World']
s.replace("l", "L")         # O(n), new string
s.find("World")             # 7, or -1 if absent
s[::-1]                     # 'dlroW ,olleH' - reverse by slicing
list(s)                     # a mutable list of characters when you must edit
```

```javascript
// BAD in principle; engines optimise it with ropes, but do not rely on that.
function buildBad(words) {
  let out = "";
  for (const w of words) out += w;
  return out;
}

// GOOD: explicit and predictably O(n).
function buildGood(words) {
  const parts = [];
  for (const w of words) parts.push(w);
  return parts.join("");
}

const s = "Hello, World";
s.toLowerCase();            // O(n), new string
s.split(", ");              // ['Hello', 'World']
s.replaceAll("l", "L");     // O(n)
s.indexOf("World");         // 7, or -1
[...s].reverse().join("");  // 'dlroW ,olleH' - spread handles surrogate pairs
Array.from(s);              // mutable character array
```

<a id="characters-are-not-bytes"></a>

### Characters are not bytes

Both languages index strings by code unit, not by "what a human calls a character". JavaScript strings are UTF-16, so an emoji occupies *two* slots and `"😀".length === 2`. Reversing with `s.split("").reverse()` corrupts such characters; spreading with `[...s]` iterates code points and is safe. Python 3 strings are sequences of code points, which avoids the surrogate problem but still splits combining accents.

<a id="frequency-counting"></a>

### The workhorse: frequency counting

**Top Interview Question 1**

*How do you verify if two strings are anagrams?*

A very large share of string problems — anagrams, permutations, "can we rearrange…", "longest substring with…" — reduce to counting characters. Learn this pattern once and it pays for itself repeatedly.

**Anagrams by frequency count**

```python
from collections import Counter

def is_anagram(a: str, b: str) -> bool:
    """O(n) time, O(k) space where k = alphabet size."""
    if len(a) != len(b):
        return False
    return Counter(a) == Counter(b)

# Sorting also works but costs O(n log n):
#   return sorted(a) == sorted(b)

def group_anagrams(words):
    """Group words that are anagrams of each other. O(total chars)."""
    buckets = {}
    for w in words:
        key = tuple(sorted(w))          # canonical form; hashable
        buckets.setdefault(key, []).append(w)
    return list(buckets.values())

print(is_anagram("listen", "silent"))               # True
print(group_anagrams(["eat", "tea", "tan", "ate"])) # [['eat','tea','ate'], ['tan']]
```

```javascript
function countChars(s) {
  const freq = new Map();
  for (const ch of s) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  return freq;
}

function isAnagram(a, b) {              // O(n) time, O(k) space
  if (a.length !== b.length) return false;
  const freq = countChars(a);
  for (const ch of b) {
    const left = freq.get(ch);
    if (!left) return false;            // absent or already exhausted
    freq.set(ch, left - 1);
  }
  return true;
}

function groupAnagrams(words) {
  const buckets = new Map();
  for (const w of words) {
    const key = [...w].sort().join("");        // canonical form
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(w);
  }
  return [...buckets.values()];
}

console.log(isAnagram("listen", "silent"));               // true
console.log(groupAnagrams(["eat", "tea", "tan", "ate"])); // [['eat','tea','ate'],['tan']]
```

> **Interview**
>
> When a string problem mentions *lowercase English letters*, you can replace the hash map with a fixed 26-slot array indexed by `ord(ch) - ord('a')`. Same complexity, much smaller constant, and it makes comparing two counts a single array equality check.

**Top Interview Question 2**

*Decide whether a string is a palindrome, considering only letters and digits and ignoring case. `"A man, a plan, a canal: Panama"` is one.*

Building a cleaned copy and comparing it with its reverse is correct but allocates two extra strings. Two pointers walking inwards from both ends — skipping anything that is not alphanumeric — settles it in `O(n)` time and `O(1)` space.

**Answer — valid palindrome with two pointers**

```python
def is_palindrome(s):
    """O(n) time, O(1) space. Skips punctuation without building a new string."""
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

**Top Interview Question 3**

*Find the longest common prefix shared by an array of strings. `["flower", "flow", "flight"]` gives `"fl"`.*

The prefix can never be longer than the shortest word, and it can only shrink. Walk the characters of the first word column by column and stop the instant one string disagrees — worst case `O(total characters)`, and in practice it exits almost immediately.

**Answer — longest common prefix**

```python
def longest_common_prefix(words):
    """O(total characters) worst case; usually exits after a few columns."""
    if not words:
        return ""
    for i, ch in enumerate(words[0]):       # walk the first word column by column
        for other in words[1:]:
            if i == len(other) or other[i] != ch:
                return words[0][:i]         # first disagreement ends the prefix
    return words[0]                         # the first word is itself the prefix

print(longest_common_prefix(["flower", "flow", "flight"]))   # "fl"
print(longest_common_prefix(["dog", "racecar"]))             # ""
```

```javascript
function longestCommonPrefix(words) {       // O(total characters) worst case
  if (words.length === 0) return "";
  for (let i = 0; i < words[0].length; i++) {
    const ch = words[0][i];
    for (const other of words.slice(1)) {
      if (i === other.length || other[i] !== ch) return words[0].slice(0, i);
    }
  }
  return words[0];                          // first word is the whole prefix
}

console.log(longestCommonPrefix(["flower", "flow", "flight"]));   // "fl"
console.log(longestCommonPrefix(["dog", "racecar"]));             // ""
```

<a id="6-two-pointers"></a>

## 6. Two Pointers

- **Time** `O(n)`
- **Space** `O(1)`
- **Requires** sorted data or a monotonic property
- **Replaces** a nested `O(n²)` loop

Two pointers is the first genuine *technique* rather than a structure. The insight is simple: if the data is sorted, then comparing the two ends tells you something definitive, so you can eliminate one candidate per step instead of testing every pair. An `O(n²)` double loop collapses into a single `O(n)` pass with no extra memory.

> **Interactive animation:** `two-pointers` — rendered by the page script in the HTML version.

<a id="the-three-shapes"></a>

### The three shapes

1. **Converging** — one pointer at each end, moving towards each other. Pair sums, valid palindrome, container with most water, reversing in place.
2. **Same-direction (fast/slow)** — both start at the left; the fast one scans, the slow one marks where the next kept element goes. Removing duplicates, moving zeroes, partitioning.
3. **Two sequences** — one pointer per array, advancing whichever is behind. Merging sorted lists, intersection of sorted arrays, the merge step of merge sort.

**Top Interview Question 1**

*How do two pointers locate a target pair in a sorted array?*

Place pointers at opposite boundaries; if their sum is too small, advance the left pointer, and if too large, decrement the right pointer to find the target in `O(n)` time and `O(1)` space.

**Converging: two-sum on a sorted array**

```python
def two_sum_sorted(nums, target):
    """Indices of a pair summing to target. O(n) time, O(1) space."""
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        total = nums[lo] + nums[hi]
        if total == target:
            return lo, hi
        if total < target:
            lo += 1         # need a bigger sum; nums[lo] is the smallest option
        else:
            hi -= 1         # need a smaller sum; nums[hi] is the biggest option
    return None

def is_palindrome(s: str) -> bool:
    """Ignore non-alphanumerics and case. O(n) time, O(1) space."""
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1
        while lo < hi and not s[hi].isalnum():
            hi -= 1
        if s[lo].lower() != s[hi].lower():
            return False
        lo, hi = lo + 1, hi - 1
    return True

print(two_sum_sorted([1, 4, 7, 11, 15, 19, 24], 26))    # (2, 5)
print(is_palindrome("A man, a plan, a canal: Panama"))  # True
```

```javascript
function twoSumSorted(nums, target) {   // O(n) time, O(1) space
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const total = nums[lo] + nums[hi];
    if (total === target) return [lo, hi];
    if (total < target) lo++;           // need a bigger sum
    else hi--;                          // need a smaller sum
  }
  return null;
}

const isAlnum = (ch) => /[a-z0-9]/i.test(ch);

function isPalindrome(s) {              // O(n) time, O(1) space
  let lo = 0;
  let hi = s.length - 1;
  while (lo < hi) {
    while (lo < hi && !isAlnum(s[lo])) lo++;
    while (lo < hi && !isAlnum(s[hi])) hi--;
    if (s[lo].toLowerCase() !== s[hi].toLowerCase()) return false;
    lo++;
    hi--;
  }
  return true;
}

console.log(twoSumSorted([1, 4, 7, 11, 15, 19, 24], 26));   // [2, 5]
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
```

**Top Interview Question 2**

*How do you remove duplicates from a sorted array in place?*

Advance a fast reading pointer across every position while maintaining a slow writing pointer that only increments when discovering a novel value, preserving unique elements in `O(n)` time.

**Fast/slow: remove duplicates in place**

```python
def dedupe_sorted(nums):
    """Keep unique values at the front; return the new length. O(n)/O(1)."""
    if not nums:
        return 0
    write = 1                       # slow pointer: next slot to fill
    for read in range(1, len(nums)):   # fast pointer: scans everything
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

def move_zeroes(nums):
    """Push every zero to the end, keeping the order of the rest."""
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1

data = [1, 1, 2, 2, 2, 3, 4, 4]
print(dedupe_sorted(data), data[:5])    # 4 [1, 2, 3, 4, 2]

z = [0, 3, 0, 5, 9, 0, 2]
move_zeroes(z)
print(z)                                # [3, 5, 9, 2, 0, 0, 0]
```

```javascript
function dedupeSorted(nums) {           // O(n) time, O(1) space
  if (nums.length === 0) return 0;
  let write = 1;                        // slow pointer
  for (let read = 1; read < nums.length; read++) {   // fast pointer
    if (nums[read] !== nums[write - 1]) nums[write++] = nums[read];
  }
  return write;
}

function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
}

const data = [1, 1, 2, 2, 2, 3, 4, 4];
console.log(dedupeSorted(data), data.slice(0, 4));  // 4 [1, 2, 3, 4]

const z = [0, 3, 0, 5, 9, 0, 2];
moveZeroes(z);
console.log(z);                          // [3, 5, 9, 2, 0, 0, 0]
```

> **Interview**
>
> **Recognition signal:** the problem says *sorted*, or asks for a pair/triplet, or demands `O(1)` extra space while rearranging an array. If the array is not sorted but order does not matter, sorting first for `O(n log n)` and then using two pointers is often the intended solution — that is how 3Sum works.

**Top Interview Question 3**

*Each entry of an array is the height of a vertical line. Pick two lines that, with the x-axis, hold the most water. `[1, 8, 6, 2, 5, 4, 8, 3, 7]` holds `49`.*

Every pair is `O(n²)`. Start with the widest possible container — one pointer at each end — and move the pointer at the **shorter** line inwards. Moving the taller one can only lose area (the width shrinks and the height is still capped by the short line), so nothing better is ever skipped. `O(n)`.

**Answer — container with most water**

```python
def max_area(heights):
    """O(n) time, O(1) space. Always move the pointer at the shorter wall."""
    left, right, best = 0, len(heights) - 1, 0
    while left < right:
        height = min(heights[left], heights[right])     # the short wall caps it
        best = max(best, height * (right - left))
        if heights[left] < heights[right]:
            left += 1               # the short side is the only one worth moving
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))   # 49
```

```javascript
function maxArea(heights) {             // O(n) time, O(1) space
  let left = 0, right = heights.length - 1, best = 0;
  while (left < right) {
    const height = Math.min(heights[left], heights[right]);
    best = Math.max(best, height * (right - left));
    if (heights[left] < heights[right]) left++;   // move the shorter wall
    else right--;
  }
  return best;
}

console.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));   // 49
```

<a id="7-sliding-window"></a>

## 7. Sliding Window

- **Time** `O(n)`
- **Space** `O(1)` or `O(k)`
- **Applies to** contiguous subarrays / substrings

Sliding window is two pointers specialised for **contiguous** ranges. Instead of recomputing a subarray's total from scratch every time you move, you update it incrementally: add the element entering on the right, subtract the element leaving on the left. Recomputation of `O(k)` per window becomes `O(1)`, and the whole scan becomes linear.

> **Interactive animation:** `sliding-window` — rendered by the page script in the HTML version.

<a id="fixed-versus-variable-windows"></a>

### Fixed versus variable windows

1. **Fixed size `k`** — the window always holds exactly `k` items. Slide it one step at a time. Maximum average, all anagrams of a pattern.
2. **Variable size** — grow the right edge greedily; whenever the window becomes invalid, shrink from the left until it is valid again. Longest substring without repeating characters, smallest subarray with sum ≥ target, longest substring with at most `k` distinct characters.

**Top Interview Question 1**

*How do you find the longest substring without repeating characters using a sliding window?*

The variable form looks like a nested loop but is still `O(n)`: each index enters the window exactly once and leaves at most once, so the inner `while` runs `n` times in total across the whole outer loop — a classic amortised argument.

**Variable window: longest substring without repeats**

```python
def longest_unique(s: str) -> int:
    """Length of the longest substring with no repeated character. O(n)."""
    last_seen = {}          # char -> most recent index
    best = 0
    left = 0                # window is s[left:right]

    for right, ch in enumerate(s):
        # If we have seen ch inside the current window, jump left past it.
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)

    return best

def min_subarray_sum(nums, target):
    """Shortest subarray with sum >= target, or 0. Positive numbers only."""
    left = total = 0
    best = float("inf")

    for right, value in enumerate(nums):
        total += value                      # grow to the right
        while total >= target:              # shrink while still valid
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1

    return 0 if best == float("inf") else best

print(longest_unique("abcabcbb"))              # 3  ("abc")
print(min_subarray_sum([2, 3, 1, 2, 4, 3], 7)) # 2  ([4, 3])
```

```javascript
function longestUnique(s) {               // O(n) time, O(k) space
  const lastSeen = new Map();             // char -> most recent index
  let best = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;        // jump past the duplicate
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

function minSubarraySum(nums, target) {   // positive numbers only
  let left = 0;
  let total = 0;
  let best = Infinity;

  for (let right = 0; right < nums.length; right++) {
    total += nums[right];                 // grow
    while (total >= target) {             // shrink while valid
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}

console.log(longestUnique("abcabcbb"));               // 3
console.log(minSubarraySum([2, 3, 1, 2, 4, 3], 7));   // 2
```

> **Warning**
>
> Sliding window assumes that **growing the window never helps once it is invalid**. With negative numbers that assumption breaks — adding a negative value can bring a too-large sum back into range. For arrays containing negatives, use prefix sums with a hash map instead (next section).

**Top Interview Question 2**

*Given strings `s` and `t`, find the shortest substring of `s` that contains every character of `t` including duplicates. `("ADOBECODEBANC", "ABC")` gives `"BANC"`.*

This is the hardest shape of the pattern, and the trick is the bookkeeping. Keep a count of what is still *missing* and a single `have` counter of how many distinct requirements are already satisfied. Expand the right edge until the window is valid, then shrink the left edge as far as it stays valid. Each index enters and leaves once: `O(n + m)`.

**Answer — minimum window substring**

```python
from collections import Counter

def min_window(s, t):
    """O(n + m) time. Each index is added once and removed at most once."""
    if not t or len(t) > len(s):
        return ""
    need = Counter(t)                       # character -> how many still needed
    missing = len(t)                        # total characters still owed
    best = (float("inf"), 0, 0)
    left = 0

    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1                    # this character paid off a debt
        need[ch] -= 1                       # negatives mean "spare copies"

        while missing == 0:                 # window is valid - try to shrink it
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            need[s[left]] += 1
            if need[s[left]] > 0:           # we just gave up a needed character
                missing += 1
            left += 1

    return "" if best[0] == float("inf") else s[best[1]:best[2] + 1]

print(min_window("ADOBECODEBANC", "ABC"))   # "BANC"
```

```javascript
function minWindow(s, t) {                  // O(n + m) time
  if (!t || t.length > s.length) return "";
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  let missing = t.length, left = 0, best = [Infinity, 0, 0];

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if ((need.get(ch) ?? 0) > 0) missing--;   // paid off a debt
    need.set(ch, (need.get(ch) ?? 0) - 1);    // negatives are spare copies

    while (missing === 0) {                   // valid - shrink from the left
      if (right - left + 1 < best[0]) best = [right - left + 1, left, right];
      const out = s[left];
      need.set(out, need.get(out) + 1);
      if (need.get(out) > 0) missing++;       // gave up a needed character
      left++;
    }
  }

  return best[0] === Infinity ? "" : s.slice(best[1], best[2] + 1);
}

console.log(minWindow("ADOBECODEBANC", "ABC"));   // "BANC"
```

**Top Interview Question 3**

*Given an array of positive integers and a target, find the length of the shortest contiguous subarray whose sum is at least the target, or `0` if none exists. `([2, 3, 1, 2, 4, 3], 7)` gives `2` (the run `[4, 3]`).*

This is the canonical *variable* window. Grow the right edge until the sum qualifies, then shrink the left edge for as long as it still qualifies, recording the best length each time. Because all values are positive, growing only ever increases the sum and shrinking only ever decreases it — that monotonicity is exactly what makes the two-pointer sweep valid, and each index enters and leaves once for `O(n)`.

**Answer — minimum size subarray sum**

```python
def min_subarray_len(target, nums):
    """O(n) time, O(1) space. Valid only because every value is positive."""
    left = total = 0
    best = float("inf")

    for right, x in enumerate(nums):
        total += x
        while total >= target:                  # qualifies - try to shorten it
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1

    return 0 if best == float("inf") else best

print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))   # 2  ([4, 3])
print(min_subarray_len(11, [1, 1, 1, 1]))        # 0  (impossible)
```

```javascript
function minSubArrayLen(target, nums) {         // O(n) time, O(1) space
  let left = 0, total = 0, best = Infinity;

  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (total >= target) {                   // qualifies - shorten it
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }

  return best === Infinity ? 0 : best;
}

console.log(minSubArrayLen(7, [2, 3, 1, 2, 4, 3]));   // 2
console.log(minSubArrayLen(11, [1, 1, 1, 1]));        // 0
```

<a id="8-prefix-sums-and-difference-arrays"></a>

## 8. Prefix Sums & Difference Arrays

- **Build** `O(n)`
- **Range query** `O(1)`
- **Space** `O(n)`
- **Trade** preprocessing for query speed

If you will be asked "what is the sum of `nums[i..j]`?" many times, answering each one by looping is `O(n)` per query. Precompute a running total instead and every query becomes one subtraction. This is the simplest example of the most important idea in algorithm design: **pay once up front to make the repeated operation cheap.**

```text
nums = [ 3, 1, 4, 1, 5, 9, 2 ]
                prefix = [0, 3, 4, 8, 9, 14, 23, 25] prefix[i] = sum of first i values
                ^ ^
                sum(nums[2..5]) = prefix[6] - prefix[2] = 23 - 4 = 19 one subtraction, O(1)
```

**Question**

*How do prefix sums allow O(1) range sum queries?*

Precompute running totals where each entry stores the cumulative sum up to that index; any range sum `sum(nums[i..j])` is computed instantly via `prefix[j+1] - prefix[i]`.

**1-D prefix sums**

```python
from itertools import accumulate

def build_prefix(nums):
    """prefix[i] = sum of nums[:i]; length n + 1 so no special cases."""
    prefix = [0] * (len(nums) + 1)
    for i, value in enumerate(nums):
        prefix[i + 1] = prefix[i] + value
    return prefix

nums = [3, 1, 4, 1, 5, 9, 2]
prefix = build_prefix(nums)                 # or: [0, *accumulate(nums)]
range_sum = lambda i, j: prefix[j + 1] - prefix[i]   # inclusive i..j
print(range_sum(2, 5))                      # 19
```

```javascript
function buildPrefix(nums) {              // prefix[i] = sum of nums[0..i-1]
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) prefix[i + 1] = prefix[i] + nums[i];
  return prefix;
}

const nums = [3, 1, 4, 1, 5, 9, 2];
const prefix = buildPrefix(nums);
const rangeSum = (i, j) => prefix[j + 1] - prefix[i];   // inclusive
console.log(rangeSum(2, 5));              // 19
```

**Top Interview Question 1**

*How do you count subarrays that sum to k when numbers can be negative?*

Pairing prefix sums with a hash map answers a harder question: *how many* subarrays sum to exactly `k`. Because it never assumes the running total only grows, this one works with negative numbers — which is precisely where a sliding window fails.

**Counting subarrays with a given sum**

```python
def subarrays_summing_to(nums, k):
    """Count subarrays with sum exactly k. Works with negatives. O(n)."""
    counts = {0: 1}         # a prefix sum of 0 has been seen once (empty prefix)
    running = answer = 0
    for value in nums:
        running += value
        # If running - k was seen before, every such position starts a valid
        # subarray ending here.
        answer += counts.get(running - k, 0)
        counts[running] = counts.get(running, 0) + 1
    return answer

print(subarrays_summing_to([1, 2, -1, 2, 1], 3))    # 3
```

```javascript
function subarraysSummingTo(nums, k) {    // handles negatives, O(n)
  const counts = new Map([[0, 1]]);       // empty prefix seen once
  let running = 0;
  let answer = 0;
  for (const value of nums) {
    running += value;
    answer += counts.get(running - k) ?? 0;
    counts.set(running, (counts.get(running) ?? 0) + 1);
  }
  return answer;
}

console.log(subarraysSummingTo([1, 2, -1, 2, 1], 3));   // 3
```

**Question**

*How do you compute sub-matrix region sums in O(1) time?*

The same idea lifts to two dimensions. Each cell stores the sum of the rectangle from the origin to it, built by **inclusion-exclusion** — add the cell above and the cell to the left, then subtract the corner you just counted twice. Any sub-rectangle then costs four lookups.

**2-D prefix sums**

```python
def build_prefix_2d(grid):
    """pre[r][c] = sum of the rectangle from (0,0) to (r-1,c-1)."""
    rows, cols = len(grid), len(grid[0])
    pre = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            pre[r + 1][c + 1] = (grid[r][c] + pre[r][c + 1]
                                 + pre[r + 1][c] - pre[r][c])   # inclusion-exclusion
    return pre
```

```javascript
function buildPrefix2D(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const pre = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pre[r + 1][c + 1] = grid[r][c] + pre[r][c + 1] + pre[r + 1][c] - pre[r][c];
    }
  }
  return pre;                             // inclusion-exclusion
}
```

**Top Interview Question 2**

*Find the index where the sum of everything to its left equals the sum of everything to its right. `[1, 7, 3, 6, 5, 6]` gives `3`.*

Recomputing both sides at every index is `O(n²)`. One total plus a running left sum is enough: the right side is always `total − left − nums[i]`. A single pass, `O(n)` time and `O(1)` space.

**Answer — find the pivot index**

```python
def pivot_index(nums):
    """O(n) time, O(1) space. right = total - left - nums[i], for free."""
    total = sum(nums)
    left = 0
    for i, x in enumerate(nums):
        if left == total - left - x:    # left side equals right side
            return i
        left += x
    return -1

print(pivot_index([1, 7, 3, 6, 5, 6]))   # 3
print(pivot_index([1, 2, 3]))            # -1
```

```javascript
function pivotIndex(nums) {             // O(n) time, O(1) space
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;   // balanced here
    left += nums[i];
  }
  return -1;
}

console.log(pivotIndex([1, 7, 3, 6, 5, 6]));   // 3
console.log(pivotIndex([1, 2, 3]));            // -1
```

**Top Interview Question 3**

*In a binary array, find the longest subarray containing an equal number of `0`s and `1`s. `[0, 1, 0, 0, 1, 1, 0]` gives `6`.*

Rewrite every `0` as `−1`. An equal-count subarray is now a subarray summing to zero, which means the running total is the *same* at both ends. Store the first index at which each running total appears and the answer falls out in one pass, `O(n)`.

**Answer — contiguous array of equal 0s and 1s**

```python
def find_max_length(nums):
    """O(n) time. Treat 0 as -1: equal counts become a running sum of zero."""
    first_seen = {0: -1}                # running sum -> earliest index
    running = best = 0
    for i, x in enumerate(nums):
        running += 1 if x == 1 else -1
        if running in first_seen:
            best = max(best, i - first_seen[running])   # sum unchanged in between
        else:
            first_seen[running] = i     # only the EARLIEST index is useful
    return best

print(find_max_length([0, 1, 0, 0, 1, 1, 0]))   # 6
```

```javascript
function findMaxLength(nums) {          // O(n) time
  const firstSeen = new Map([[0, -1]]); // running sum -> earliest index
  let running = 0, best = 0;
  for (let i = 0; i < nums.length; i++) {
    running += nums[i] === 1 ? 1 : -1;  // treat 0 as -1
    if (firstSeen.has(running)) best = Math.max(best, i - firstSeen.get(running));
    else firstSeen.set(running, i);     // keep only the earliest index
  }
  return best;
}

console.log(findMaxLength([0, 1, 0, 0, 1, 1, 0]));   // 6
```

<a id="difference-arrays"></a>

### Difference arrays: the mirror image

**Question**

*How do you perform multiple range updates efficiently using a difference array?*

Prefix sums make range *queries* cheap on static data. A difference array makes range *updates* cheap when you only need the final state. To add `v` to every element in `[i, j]`, record `+v` at `i` and `−v` at `j+1`; after all updates, one prefix-sum pass materialises the result. Each update is `O(1)` instead of `O(j − i)`.

**Range updates in O(1) each**

```python
def apply_ranges(n, updates):
    """updates = [(start, end_inclusive, delta)]. O(n + len(updates))."""
    diff = [0] * (n + 1)
    for start, end, delta in updates:
        diff[start] += delta
        diff[end + 1] -= delta          # cancel the effect after the range

    result, running = [], 0
    for i in range(n):
        running += diff[i]              # prefix sum turns marks into values
        result.append(running)
    return result

# Three flight bookings on a 5-seat manifest.
print(apply_ranges(5, [(0, 2, 10), (1, 4, 20), (3, 3, 5)]))
# [10, 30, 30, 25, 20]
```

```javascript
function applyRanges(n, updates) {        // updates: [start, endInclusive, delta]
  const diff = new Array(n + 1).fill(0);
  for (const [start, end, delta] of updates) {
    diff[start] += delta;
    diff[end + 1] -= delta;               // cancel after the range
  }

  const result = [];
  let running = 0;
  for (let i = 0; i < n; i++) {
    running += diff[i];                   // prefix sum materialises values
    result.push(running);
  }
  return result;
}

console.log(applyRanges(5, [[0, 2, 10], [1, 4, 20], [3, 3, 5]]));
// [10, 30, 30, 25, 20]
```

<a id="9-hash-tables"></a>

## 9. Hash Tables

- **Insert / lookup / delete** `O(1)` average
- **Worst case** `O(n)`
- **Space** `O(n)`
- **No ordering** by key

A hash table is an array that you index with something other than an integer. A **hash function** converts the key into a bucket number, and then you use plain array indexing. That is the entire idea; everything else is damage control for the fact that two different keys can land in the same bucket.

> **Analogy** 📱
>
> **Picture it — your phone's contacts**
>
> You do not scroll through 1,000 names. You type "Alice" and the phone computes exactly which drawer that record lives in and opens it. A name goes in, a slot number comes out — and how many contacts you have stored makes no difference to how long it takes.

> **Interactive animation:** `hash-table` — rendered by the page script in the HTML version.

<a id="collisions"></a>

### Collisions and how they are handled

1. **Separate chaining** — each bucket holds a list (or, in modern Java, a tree once it gets long). Simple, tolerant of high load factors, costs an extra pointer hop.
2. **Open addressing** — on collision, probe for another empty slot (linear probing, quadratic probing, double hashing). Better cache behaviour, but deletion needs tombstones and performance collapses as the table fills. CPython's `dict` uses open addressing.

Both schemes rely on the **load factor** (items ÷ buckets) staying low. When it crosses a threshold — around 0.66 in CPython, 0.75 in Java — the table allocates a bigger array and **rehashes** every key. That single operation is `O(n)`, which is why hash table inserts are amortised `O(1)`, not truly constant.

> **Key idea**
>
> The `O(1)` is an *average* over a good hash function. If every key hashes to the same bucket, lookup degrades to a linear scan. This is a real attack vector — a **hash-flooding DoS** — which is why Python randomises string hashing per process and why you should never rely on hash iteration order.

<a id="what-can-be-a-key"></a>

### What can be a key

**Question**

*What types can serve as hash table keys and how are maps and sets used?*

A key must be **hashable**, which in practice means immutable — if a key mutates after insertion, its hash changes and the entry becomes unreachable. In Python that rules out `list`, `set` and `dict` as keys (use `tuple` or `frozenset`). JavaScript's plain objects stringify every key, so `obj[1]` and `obj["1"]` collide; `Map` does not do this and should be your default.

**Maps and sets in practice**

```python
from collections import defaultdict, Counter

# --- dict basics ---
ages = {"ada": 36, "alan": 41}
ages["grace"] = 45          # O(1) average insert
ages.get("linus", 0)        # 0 - no KeyError
"ada" in ages               # O(1) membership
del ages["alan"]            # O(1)

# defaultdict removes the "does this key exist yet?" boilerplate
graph = defaultdict(list)
graph["a"].append("b")      # no need to initialise graph["a"]

# Counter is a dict tuned for tallies
freq = Counter("mississippi")
print(freq.most_common(2))  # [('i', 4), ('s', 4)]

# --- set basics: a dict with no values ---
seen = {1, 2, 3}
seen.add(4)                 # O(1)
seen & {3, 4, 5}            # {3, 4} intersection
seen | {9}                  # union
seen - {1}                  # difference

# Tuple keys let you index by a composite - very common in DP and grids.
memo = {}
memo[(3, 7)] = "row 3, col 7"

def first_duplicate(nums):
    """The classic O(n) time / O(n) space trade against an O(n^2) scan."""
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
    return None
```

```javascript
// --- Map: the right default ---
const ages = new Map([["ada", 36], ["alan", 41]]);
ages.set("grace", 45);       // O(1) average
ages.get("linus") ?? 0;      // undefined -> 0
ages.has("ada");             // O(1)
ages.delete("alan");
ages.size;                   // O(1); plain objects need Object.keys().length

// Map preserves insertion order and accepts ANY key type.
const objKey = { id: 1 };
const meta = new Map([[objKey, "metadata"]]);   // impossible with a plain object

// --- Set ---
const seen = new Set([1, 2, 3]);
seen.add(4);
seen.has(2);                 // O(1)
const other = new Set([3, 4, 5]);
const intersection = [...seen].filter((x) => other.has(x));  // [3, 4]

// Composite keys must be serialised, since objects compare by reference.
const memo = new Map();
memo.set("3,7", "row 3, col 7");

function firstDuplicate(nums) {
  const seenValues = new Set();
  for (const x of nums) {
    if (seenValues.has(x)) return x;
    seenValues.add(x);
  }
  return null;
}

// Frequency tally, the JS way
function tally(items) {
  const freq = new Map();
  for (const item of items) freq.set(item, (freq.get(item) ?? 0) + 1);
  return freq;
}
```

<a id="building-one-from-scratch"></a>

### Building one from scratch

**Question**

*How do you implement a hash map from scratch using separate chaining?*

Implementing a hash map with chaining takes about thirty lines and removes all the mystery: hash each key into a bucket index, store key-value pairs in buckets, and rehash into a larger table when the load factor exceeds a threshold.

**A hash map with separate chaining**

```python
class HashMap:
    def __init__(self, capacity=8):
        self.buckets = [[] for _ in range(capacity)]
        self.size = 0

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def put(self, key, value):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:                    # update in place
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1
        if self.size / len(self.buckets) > 0.75:
            self._resize()

    def get(self, key, default=None):
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        return default

    def remove(self, key):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return True
        return False

    def _resize(self):
        """O(n), but happens rarely enough to amortise to O(1) per insert."""
        old = self.buckets
        self.buckets = [[] for _ in range(len(old) * 2)]
        self.size = 0
        for bucket in old:
            for k, v in bucket:
                self.put(k, v)
```

```javascript
class HashMap {
  constructor(capacity = 8) {
    this.buckets = Array.from({ length: capacity }, () => []);
    this.size = 0;
  }

  #hash(key) {                          // FNV-style string hash
    const s = String(key);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % this.buckets.length;
  }

  put(key, value) {
    const bucket = this.buckets[this.#hash(key)];
    for (const entry of bucket) {
      if (entry[0] === key) {            // update in place
        entry[1] = value;
        return;
      }
    }
    bucket.push([key, value]);
    this.size++;
    if (this.size / this.buckets.length > 0.75) this.#resize();
  }

  get(key, fallback = undefined) {
    for (const [k, v] of this.buckets[this.#hash(key)]) if (k === key) return v;
    return fallback;
  }

  remove(key) {
    const bucket = this.buckets[this.#hash(key)];
    const i = bucket.findIndex(([k]) => k === key);
    if (i === -1) return false;
    bucket.splice(i, 1);
    this.size--;
    return true;
  }

  #resize() {                           // O(n), amortised away
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () => []);
    this.size = 0;
    for (const bucket of old) for (const [k, v] of bucket) this.put(k, v);
  }
}
```

> **Interview**
>
> **Recognition signal:** any time you catch yourself writing a nested loop to ask "have I seen this before?" or "does the complement exist?", a hash set or map turns `O(n²)` into `O(n)`. That single substitution solves a startling fraction of interview questions.

**Top Interview Question 1**

*Return the indices of the two numbers in an unsorted array that add up to a target. Exactly one answer exists.*

The nested-loop answer is `O(n²)`. Instead ask a different question at each element: *have I already seen my complement?* A dictionary from value to index answers that in `O(1)`, so one pass is enough — and the map is filled *after* the lookup so an element never pairs with itself.

**Answer — two sum in one pass**

```python
def two_sum(nums, target):
    """O(n) time, O(n) space. Look up the complement instead of scanning for it."""
    seen = {}                           # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:          # is my partner already behind me?
            return [seen[target - x], i]
        seen[x] = i                     # store AFTER the lookup
    return []

print(two_sum([2, 7, 11, 15], 9))       # [0, 1]
print(two_sum([3, 3], 6))               # [0, 1]
```

```javascript
function twoSum(nums, target) {         // O(n) time, O(n) space
  const seen = new Map();               // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);               // store AFTER the lookup
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 3], 6));         // [0, 1]
```

**Top Interview Question 2**

*Group a list of words so that anagrams land in the same bucket: `["eat", "tea", "tan", "ate", "nat", "bat"]` becomes `[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]`.*

Comparing every word against every other is `O(n²·L)`. Build a **canonical key** that all anagrams of a word share and use it as a dictionary key. Sorting the letters is the easy key at `O(L log L)`; a 26-slot letter count is `O(L)` and worth mentioning as the follow-up.

**Answer — group anagrams**

```python
from collections import defaultdict

def group_anagrams(words):
    """O(n * L) time with a count key. Anagrams collapse onto one bucket."""
    buckets = defaultdict(list)
    for word in words:
        counts = [0] * 26                       # a..z tally, order-independent
        for ch in word:
            counts[ord(ch) - ord("a")] += 1
        buckets[tuple(counts)].append(word)     # tuples are hashable, lists are not
    return list(buckets.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

```javascript
function groupAnagrams(words) {                 // O(n * L) time
  const buckets = new Map();
  for (const word of words) {
    const counts = new Array(26).fill(0);       // a..z tally
    for (const ch of word) counts[ch.charCodeAt(0) - 97]++;
    const key = counts.join(",");               // Map keys compare by identity
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(word);
  }
  return [...buckets.values()];
}

console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [['eat','tea','ate'], ['tan','nat'], ['bat']]
```

**Top Interview Question 3**

*Find the length of the longest run of consecutive integers in an unsorted array, in `O(n)` — so sorting is off the table. `[100, 4, 200, 1, 3, 2]` gives `4`.*

Drop everything into a set for `O(1)` membership tests. The linear bound comes from one guard: only begin counting at a value whose predecessor is absent, i.e. the true start of a run. Every run is then walked exactly once, so the inner loop costs `O(n)` across the whole array, not per element.

**Answer — longest consecutive sequence**

```python
def longest_consecutive(nums):
    """O(n) time, O(n) space. Each run is walked once, from its true start."""
    seen = set(nums)
    best = 0
    for x in seen:
        if x - 1 in seen:               # not a run start - somebody else owns it
            continue
        length = 1
        while x + length in seen:       # walk this run to its end
            length += 1
        best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))          # 4
print(longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]))  # 9
```

```javascript
function longestConsecutive(nums) {     // O(n) time, O(n) space
  const seen = new Set(nums);
  let best = 0;
  for (const x of seen) {
    if (seen.has(x - 1)) continue;      // not the start of a run
    let length = 1;
    while (seen.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2]));   // 4
```

<a id="10-linked-lists"></a>

## 10. Linked Lists

- **Access by index** `O(n)`
- **Insert / delete at a known node** `O(1)`
- **Search** `O(n)`
- **Space** `O(n)` + pointer overhead

A linked list gives up contiguity. Each node stores a value and the address of the next node, so nodes can live anywhere in memory. You lose `O(1)` indexing and cache locality; you gain the ability to splice elements in and out without moving anything else.

> **Analogy** 🗺️
>
> **Picture it — a treasure hunt**
>
> You start with one clue. It says "under the mango tree". At the mango tree is a note pointing to "the old well". You follow the chain of addresses to the treasure — and you cannot skip ahead to clue seven, because the only thing that knows where it is, is clue six.

> **Interactive animation:** `linked-list` — rendered by the page script in the HTML version.

<a id="variants"></a>

### The variants

1. **Singly linked** — one `next` pointer. Minimal memory; you can only walk forwards, and deleting a node requires its predecessor.
2. **Doubly linked** — `next` and `prev`. Costs one extra pointer per node but allows `O(1)` deletion given only the node itself, and backwards iteration. This is what an LRU cache is built from.
3. **Circular** — the tail points back to the head. Round-robin schedulers, ring buffers, the Josephus problem.

**Question**

*How do you define a linked list node and build a chain?*

Construct a node holding a value and reference link, and populate nodes in reverse order so each points forward to its subsequent neighbor in `O(n)` time.

**Node type, and building a list**

```python
class Node:
    __slots__ = ("value", "next")       # __slots__ saves memory per node

    def __init__(self, value, nxt=None):
        self.value = value
        self.next = nxt

def from_list(values):
    """Build a list back-to-front so each node points at the one after it."""
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.value)
        head = head.next
    return out
```

```javascript
class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

function fromArray(values) {          // build back-to-front
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
  return head;
}

function toArray(head) {
  const out = [];
  for (let cur = head; cur; cur = cur.next) out.push(cur.value);
  return out;
}
```

**Top Interview Question 1**

*How do you reverse a linked list in place?*

Reversal is the canonical linked-list question. The whole trick is that you need three references live at once — save `next` before overwriting it, or the rest of the list becomes unreachable.

**Reversing in place**

```python
def reverse(head):
    """Flip every pointer. O(n) time, O(1) space - the canonical question."""
    prev = None
    while head:
        nxt = head.next     # 1. remember where we were going
        head.next = prev    # 2. flip this link backwards
        prev = head         # 3. prev advances
        head = nxt          # 4. head advances
    return prev             # prev is the old tail = the new head

head = from_list([1, 2, 3, 4, 5])
print(to_list(reverse(head)))       # [5, 4, 3, 2, 1]
```

```javascript
function reverse(head) {              // O(n) time, O(1) space
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;            // 1. remember the rest
    cur.next = prev;                  // 2. flip the link
    prev = cur;                       // 3. advance prev
    cur = next;                       // 4. advance cur
  }
  return prev;                        // the old tail is the new head
}

console.log(toArray(reverse(fromArray([1, 2, 3, 4, 5]))));  // [5,4,3,2,1]
```

**Top Interview Question 2**

*How do fast and slow pointers detect cycles and locate midpoints?*

These two belong together: both run a slow pointer at one step and a fast pointer at two, and differ only in what they do with the result. One detects a loop, the other lands on the midpoint — the same mechanism answering two questions in a single pass with constant memory.

**Fast and slow pointers: cycle detection and midpoint**

```python
def has_cycle(head):
    """Floyd's tortoise and hare. O(n) time, O(1) space."""
    slow = fast = head
    while fast and fast.next:
        slow = slow.next            # one step
        fast = fast.next.next       # two steps
        if slow is fast:            # if there is a loop they must meet
            return True
    return False

def middle(head):
    """The slow pointer lands on the middle when fast reaches the end."""
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow
```

```javascript
function hasCycle(head) {             // Floyd's tortoise and hare
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

function middle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
```

> **Key idea**
>
> **Two techniques carry most linked-list problems.** First, a **dummy head** node in front of the real list removes every "what if I am deleting the first element?" special case. Second, **fast and slow pointers** find the middle, detect cycles, and locate the `k`-th node from the end in a single pass with constant memory.

<a id="lru-cache"></a>

### Where doubly linked lists earn their keep: an LRU cache

**Top Interview Question 3**

*How do you design a Least Recently Used (LRU) Cache with O(1) operations?*

An LRU cache needs `O(1)` lookup *and* `O(1)` "move this item to most recently used". A hash map alone gives the first; a doubly linked list alone gives the second. Combining them — map from key to node, list maintaining recency order — is the classic answer, and it is exactly how `OrderedDict` and JavaScript's `Map` are implemented internally.

**LRU cache in O(1)**

```python
class LRUCache:
    """Hash map for O(1) lookup + doubly linked list for O(1) reordering."""

    class _Node:
        __slots__ = ("key", "value", "prev", "next")

        def __init__(self, key=None, value=None):
            self.key, self.value = key, value
            self.prev = self.next = None

    def __init__(self, capacity):
        self.capacity = capacity
        self.table = {}
        # Sentinel head/tail so no insertion or removal is a special case.
        self.head, self.tail = self._Node(), self._Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node):
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.table.get(key)
        if node is None:
            return -1
        self._unlink(node)          # touch it: move to the front
        self._push_front(node)
        return node.value

    def put(self, key, value):
        if key in self.table:
            node = self.table[key]
            node.value = value
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.table) == self.capacity:
            lru = self.tail.prev    # the node just before the tail sentinel
            self._unlink(lru)
            del self.table[lru.key]
        node = self._Node(key, value)
        self.table[key] = node
        self._push_front(node)

cache = LRUCache(2)
cache.put(1, "a"); cache.put(2, "b")
cache.get(1)                 # 'a' - 1 is now most recent
cache.put(3, "c")            # evicts key 2
print(cache.get(2))          # -1
```

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.table = new Map();
    // Sentinel head/tail remove every edge case.
    this.head = { key: null, value: null };
    this.tail = { key: null, value: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  #unlink(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  #pushFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    const node = this.table.get(key);
    if (!node) return -1;
    this.#unlink(node);
    this.#pushFront(node);            // touch it
    return node.value;
  }

  put(key, value) {
    const existing = this.table.get(key);
    if (existing) {
      existing.value = value;
      this.#unlink(existing);
      this.#pushFront(existing);
      return;
    }
    if (this.table.size === this.capacity) {
      const lru = this.tail.prev;
      this.#unlink(lru);
      this.table.delete(lru.key);
    }
    const node = { key, value, prev: null, next: null };
    this.table.set(key, node);
    this.#pushFront(node);
  }
}

const cache = new LRUCache(2);
cache.put(1, "a");
cache.put(2, "b");
cache.get(1);                         // 'a'
cache.put(3, "c");                    // evicts key 2
console.log(cache.get(2));            // -1
```

> **Warning**
>
> Outside interviews and specific structures like LRU caches, adjacency lists and free lists, linked lists are usually the *wrong* choice. A dynamic array beats them on almost every real workload because of cache locality, even for middle insertions at small sizes.

<a id="11-stacks"></a>

## 11. Stacks

- **Push / pop / peek** `O(1)`
- **Search** `O(n)`
- **Discipline** LIFO — last in, first out

A stack is any collection where you only add and remove at one end. That restriction sounds limiting, but it is exactly the shape of **nesting**: the most recently opened thing must be the first one closed. Function calls, brackets, HTML tags, undo history, and depth-first search are all nesting problems, which is why the stack appears everywhere.

> **Analogy** 🍽️
>
> **Picture it — a pile of plates**
>
> You stack washed plates one on another. The last one down is the first one up. Pull from the bottom and the pile comes down — which is exactly why a function cannot return before the functions it called have returned.

> **Interactive animation:** `stack-queue` — rendered by the page script in the HTML version.

**Top Interview Question 1**

*How do you validate balanced brackets using a stack?*

Push opening symbols onto a LIFO stack; when encountering a closing symbol, pop the top element to verify that they form a matching pair in `O(n)` time.

**Balanced brackets - the canonical stack problem**

```python
def is_balanced(s: str) -> bool:
    """O(n) time, O(n) space."""
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []

    for ch in s:
        if ch in "([{":
            stack.append(ch)            # remember what must be closed
        elif ch in pairs:
            # Must close the MOST RECENT opener - that is the LIFO rule.
            if not stack or stack.pop() != pairs[ch]:
                return False

    return not stack                    # nothing may be left open

print(is_balanced("{[()]}"))    # True
print(is_balanced("{[(])}"))    # False - correct count, wrong nesting
```

```javascript
function isBalanced(s) {                // O(n) time, O(n) space
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];

  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false;   // wrong or missing opener
    }
  }
  return stack.length === 0;            // nothing left open
}

console.log(isBalanced("{[()]}"));      // true
console.log(isBalanced("{[(])}"));      // false
```

<a id="monotonic-stack"></a>

### The monotonic stack

This is the highest-value stack idea and the one people miss. Keep the stack sorted (increasing or decreasing) by popping anything that would break the order as you push. Every element is pushed once and popped once, so the whole thing is `O(n)` even though it looks like a nested loop. It answers "for each element, what is the next greater/smaller one?" — the core of daily temperatures, stock spans, largest rectangle in a histogram, and trapping rain water.

```text
temps = [73, 74, 75, 71, 69, 72, 76, 73]
                answer = [ 1, 1, 4, 2, 1, 1, 0, 0] days until a warmer temperature

                stack holds INDICES whose answer is still unknown, with decreasing temperatures:
                i=0 push 0 stack [0]
                i=1 74 > 73 pop 0 -> ans[0]=1 stack [1]
                i=2 75 > 74 pop 1 -> ans[1]=1 stack [2]
                i=3 71 < 75 push 3 stack [2,3]
                i=4 69 < 71 push 4 stack [2,3,4]
                i=5 72 > 69 pop 4 -> ans[4]=1
                72 > 71 pop 3 -> ans[3]=2 stack [2,5]
                i=6 76 > 72 pop 5 -> ans[5]=1
                76 > 75 pop 2 -> ans[2]=4 stack [6]
                i=7 73 < 76 push 7 stack [6,7] -> both keep answer 0
```

**Top Interview Question 2**

*How does a monotonic stack find the next greater element in O(n) time?*

Maintain a stack of indices with decreasing values; pop and record answers for all elements smaller than the current value before pushing the new index.

**Monotonic stack: next greater element**

```python
def days_until_warmer(temps):
    """For each day, how many days until a warmer one. O(n) time and space."""
    answer = [0] * len(temps)
    stack = []                          # indices, temperatures decreasing

    for i, t in enumerate(temps):
        # Everything cooler than today has just found its answer.
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)

    return answer                       # unresolved indices keep 0

def largest_rectangle(heights):
    """Largest rectangle in a histogram. O(n) with a monotonic stack."""
    stack = []                          # indices, heights increasing
    best = 0
    for i, h in enumerate([*heights, 0]):   # sentinel 0 flushes the stack
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            # The bar extends left to the previous smaller bar (exclusive).
            left = stack[-1] + 1 if stack else 0
            best = max(best, height * (i - left))
        stack.append(i)
    return best

print(days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]))
# [1, 1, 4, 2, 1, 1, 0, 0]
print(largest_rectangle([2, 1, 5, 6, 2, 3]))    # 10
```

```javascript
function daysUntilWarmer(temps) {       // O(n) time and space
  const answer = new Array(temps.length).fill(0);
  const stack = [];                     // indices, decreasing temperatures

  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack.at(-1)] < temps[i]) {
      const j = stack.pop();
      answer[j] = i - j;                // today resolves day j
    }
    stack.push(i);
  }
  return answer;
}

function largestRectangle(heights) {    // O(n)
  const stack = [];                     // indices, increasing heights
  let best = 0;
  const bars = [...heights, 0];         // sentinel flushes the stack

  for (let i = 0; i < bars.length; i++) {
    while (stack.length && heights[stack.at(-1)] >= bars[i]) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack.at(-1) + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}

console.log(daysUntilWarmer([73, 74, 75, 71, 69, 72, 76, 73]));
// [1, 1, 4, 2, 1, 1, 0, 0]
console.log(largestRectangle([2, 1, 5, 6, 2, 3]));   // 10
```

**Top Interview Question 3**

*Design a stack with `push`, `pop`, `top` and `get_min`, every one of them `O(1)`.*

Caching a single minimum breaks as soon as it is popped — you would have to rescan. The fix is to notice that the history of minima is itself a stack: push the running minimum alongside every value so the two structures rise and fall together. `O(1)` everywhere, `O(n)` extra memory.

**Answer — min stack**

```python
class MinStack:
    """All four operations are O(1). The mins stack mirrors the main stack."""

    def __init__(self):
        self._items = []
        self._mins = []                 # _mins[i] = min of _items[0..i]

    def push(self, x):
        self._items.append(x)
        self._mins.append(x if not self._mins else min(x, self._mins[-1]))

    def pop(self):
        self._mins.pop()                # pop both - they always match in height
        return self._items.pop()

    def top(self):
        return self._items[-1]

    def get_min(self):
        return self._mins[-1]           # O(1): no scanning, ever

s = MinStack()
for v in (5, 2, 7, 2):
    s.push(v)
print(s.get_min())                      # 2
s.pop(); s.pop()
print(s.get_min())                      # 2 - the first 2 is still in there
```

```javascript
class MinStack {                        // all four operations are O(1)
  #items = [];
  #mins = [];                           // #mins[i] = min of #items[0..i]

  push(x) {
    this.#items.push(x);
    const previous = this.#mins.length ? this.#mins[this.#mins.length - 1] : x;
    this.#mins.push(Math.min(x, previous));
  }
  pop()    { this.#mins.pop(); return this.#items.pop(); }
  top()    { return this.#items[this.#items.length - 1]; }
  getMin() { return this.#mins[this.#mins.length - 1]; }   // O(1)
}

const s = new MinStack();
[5, 2, 7, 2].forEach((v) => s.push(v));
console.log(s.getMin());                // 2
s.pop(); s.pop();
console.log(s.getMin());                // 2
```

<a id="12-queues-and-deques"></a>

## 12. Queues & Deques

- **Enqueue / dequeue** `O(1)`
- **Deque** `O(1)` at both ends
- **Discipline** FIFO — first in, first out

A queue is fairness: whatever arrived first leaves first. It models real waiting lines, task schedulers, message buses, printer spools — and, most importantly for this course, it is the engine of breadth-first search. Because BFS explores in arrival order, it visits nodes in order of distance from the source, which is why it finds shortest paths in unweighted graphs.

> **Analogy** 🎟️
>
> **Picture it — a ticket counter**
>
> People queue for cinema tickets. First to arrive, first served; new arrivals join the back. Nobody jumps the line — and that fairness is precisely what makes BFS visit nodes in order of distance from the source.

A **deque** (double-ended queue) allows push and pop at both ends in `O(1)`. It subsumes both stack and queue and enables the monotonic-deque trick below.

<a id="queue-variants"></a>

### The three variants

1. **Circular queue (ring buffer)** — a fixed-size array whose end wraps around to its start, so the slots vacated at the front get reused instead of abandoned.
2. **Deque** — add and remove at both ends. Python's `collections.deque` is itself a doubly linked list of fixed-size blocks.
3. **Priority queue** — items leave by importance rather than arrival time. Think an **emergency room**: the heart-attack patient is seen before the mild headache who arrived an hour earlier. Covered properly in [section 19](#19-heaps-and-priority-queues), because the interesting part is the heap underneath.

<a id="why-circular"></a>

#### Why the wrap-around matters

Implement a queue naively on an array and every `dequeue` leaves a dead slot at the front. The head index marches rightwards forever and the array grows without bound even though the queue itself may hold three items. A circular queue fixes this with modular arithmetic — `(index + 1) % capacity` — giving genuinely constant memory. This is what audio buffers, network packet queues and streaming windows are built on.

```text
capacity 6, head=4, tail=1, size=3 (tail is the next free slot)

                index: 0 1 2 3 4 5
                [ E | | | | C | D ]
                ^tail ^head
                ‘-- oldest item E wrapped around
                into the space C
                dequeue -> C, head = (4 + 1) % 6 = 5 and D left behind
                enqueue F -> slot 1, tail = (1 + 1) % 6 = 2

                full when size == capacity ← track size explicitly; head == tail
                empty when size == 0 is ambiguous otherwise
```

**Top Interview Question 1**

*How do you implement a fixed-capacity circular queue using modular arithmetic?*

Use modulo math `(head + size) % capacity` to wrap around array indices so enqueue and dequeue operations run in `O(1)` without memory growth.

**Circular queue in fixed memory**

```python
class CircularQueue:
    """Fixed-capacity FIFO. Every operation O(1), memory never grows."""

    def __init__(self, capacity):
        self.data = [None] * capacity
        self.head = 0           # index of the oldest item
        self.size = 0           # tracked explicitly - see the note below

    def enqueue(self, value):
        if self.size == len(self.data):
            raise OverflowError("queue is full")
        tail = (self.head + self.size) % len(self.data)  # wrap around
        self.data[tail] = value
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("queue is empty")
        value = self.data[self.head]
        self.data[self.head] = None                 # release the reference
        self.head = (self.head + 1) % len(self.data)
        self.size -= 1
        return value

    def __len__(self):
        return self.size

q = CircularQueue(3)
q.enqueue("a"); q.enqueue("b"); q.enqueue("c")
print(q.dequeue())          # 'a'  - slot 0 is now free again
q.enqueue("d")              # reuses slot 0 instead of growing
print(len(q))               # 3
```

```javascript
class CircularQueue {
  constructor(capacity) {
    this.data = new Array(capacity).fill(null);
    this.head = 0;                    // oldest item
    this.size = 0;                    // tracked explicitly
  }

  enqueue(value) {
    if (this.size === this.data.length) throw new RangeError("queue is full");
    const tail = (this.head + this.size) % this.data.length;   // wrap around
    this.data[tail] = value;
    this.size++;
  }

  dequeue() {
    if (this.size === 0) return undefined;
    const value = this.data[this.head];
    this.data[this.head] = null;      // release the reference for the GC
    this.head = (this.head + 1) % this.data.length;
    this.size--;
    return value;
  }
}

const q = new CircularQueue(3);
q.enqueue("a"); q.enqueue("b"); q.enqueue("c");
console.log(q.dequeue());             // 'a' - slot 0 is free again
q.enqueue("d");                       // reuses slot 0, no growth
```

> **Warning**
>
> Track `size` explicitly rather than inferring emptiness from the indices. With only `head` and `tail`, the condition `head == tail` means *both* completely empty and completely full, and the two are indistinguishable. The usual alternatives are a separate counter, as above, or deliberately wasting one slot so the two states can never coincide.

**Question**

*How do you implement an efficient queue in Python and JavaScript?*

In Python, use `collections.deque` for `O(1)` operations at both ends; in JavaScript, use an array with a tracked head index to avoid expensive re-indexing.

**Queues, done correctly**

```python
from collections import deque

q = deque()
q.append("a")        # enqueue at the back      O(1)
q.append("b")
q.popleft()          # dequeue from the front   O(1)

q.appendleft("z")    # deque powers: push front O(1)
q.pop()              # pop back                 O(1)

# NEVER use list.pop(0) as a queue - it shifts every remaining element,
# which is O(n) and silently turns an O(V+E) BFS into O(V^2).

# A ring buffer: a fixed-size queue that overwrites the oldest entry.
recent = deque(maxlen=3)
for x in [1, 2, 3, 4, 5]:
    recent.append(x)
print(list(recent))          # [3, 4, 5]
```

```javascript
// JavaScript has no deque, and Array.shift() is O(n). Use a head index:
// the array grows but never re-indexes, so both ends stay O(1) amortised.
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
    const value = this.items[this.head];
    this.items[this.head++] = undefined; // release the reference for the GC
    if (this.head > 32 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);  // compact occasionally
      this.head = 0;
    }
    return value;
  }

  get size() {
    return this.items.length - this.head;
  }

  peek() {
    return this.items[this.head];
  }
}

const q = new Queue();
q.enqueue("a");
q.enqueue("b");
console.log(q.dequeue(), q.size);       // 'a' 1
```

<a id="monotonic-deque"></a>

### Sliding window maximum with a monotonic deque

**Top Interview Question 2**

*How do you find the sliding window maximum in linear time?*

Finding the maximum of every window of size `k` naively costs `O(n·k)`. Keep a deque of indices whose values are decreasing: the front is always the current maximum, and any element smaller than the one arriving can never be the maximum again, so it is discarded immediately. Each index is pushed and popped once, giving `O(n)`.

**Sliding window maximum in O(n)**

```python
from collections import deque

def window_max(nums, k):
    """Maximum of every window of size k. O(n) time, O(k) space."""
    dq = deque()        # indices; nums[dq] is strictly decreasing
    out = []

    for i, value in enumerate(nums):
        # 1. Drop indices that have fallen out of the window on the left.
        if dq and dq[0] <= i - k:
            dq.popleft()
        # 2. Drop smaller values from the back: they can never win again.
        while dq and nums[dq[-1]] <= value:
            dq.pop()
        dq.append(i)
        # 3. Once the first full window exists, the front is the maximum.
        if i >= k - 1:
            out.append(nums[dq[0]])

    return out

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
```

```javascript
function windowMax(nums, k) {           // O(n) time, O(k) space
  const dq = [];                        // indices; values strictly decreasing
  const out = [];

  for (let i = 0; i < nums.length; i++) {
    if (dq.length && dq[0] <= i - k) dq.shift();       // 1. expire the front
    while (dq.length && nums[dq.at(-1)] <= nums[i]) dq.pop();  // 2. dominate
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]);             // 3. front is the max
  }
  return out;
}

console.log(windowMax([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [3, 3, 5, 5, 6, 7]
```

**Top Interview Question 3**

*A grid holds empty cells (`0`), fresh oranges (`1`) and rotten ones (`2`). Every minute a rotten orange rots its four neighbours. Return the minutes until nothing fresh is left, or `-1` if that never happens.*

Rot spreads from many sources at once, so a per-orange BFS would recount the same cells. Seed the queue with *every* rotten orange, then drain it **one level at a time** — each drained level is one minute. This multi-source BFS is the standard way to answer "how long until everything is reached" questions, in `O(rows × cols)`.

**Answer — rotting oranges (multi-source BFS)**

```python
from collections import deque

def oranges_rotting(grid):
    """O(rows * cols). Draining one queue level = one minute of decay."""
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))    # every rotten orange is a start point
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):     # exactly one minute's worth of spread
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2    # marking as rotten also marks it visited
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1

    return -1 if fresh else minutes     # unreachable fresh oranges -> -1

print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))   # 4
print(oranges_rotting([[2, 1, 1], [0, 1, 1], [1, 0, 1]]))   # -1
```

```javascript
function orangesRotting(grid) {         // O(rows * cols)
  const rows = grid.length, cols = grid[0].length;
  let queue = [], fresh = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);   // every rotten cell is a seed
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (queue.length && fresh) {
    const next = [];                    // one minute's worth of spread
    for (const [r, c] of queue) {
      for (const [dr, dc] of moves) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;             // rotten also means visited
          fresh--;
          next.push([nr, nc]);
        }
      }
    }
    queue = next;
    minutes++;
  }

  return fresh ? -1 : minutes;
}

console.log(orangesRotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]));   // 4
```

<a id="13-recursion"></a>

## 13. Recursion

- **Cost** one stack frame per call
- **Space** `O(depth)`
- **Needs** a base case that is always reached

Recursion is what you use when a problem contains smaller copies of itself. You write the solution as if the smaller case is already solved — that leap of faith is the hard part — and handle only the base case explicitly. Trees, graphs, divide and conquer, backtracking and dynamic programming are all recursive at heart.

Every recursive function needs exactly three things:

1. A **base case** that returns without recursing.
2. A **recursive case** that calls itself on a strictly smaller input.
3. **Progress** — every path must move towards the base case, or you get infinite recursion and a stack overflow.

> **Interactive animation:** `recursion` — rendered by the page script in the HTML version.

**Question**

*Why is naive recursion inefficient for overlapping subproblems?*

Computing `fib(n) = fib(n-1) + fib(n-2)` naively recomputes identical subtrees an exponential number of times, causing `O(2ⁿ)` runtime.

**Naive recursion — exponential**

```python
def fib_naive(n):
    """O(2^n) - recomputes the same subproblems over and over."""
    if n <= 1:                      # base case
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

print(fib_naive(30))        # slow: ~1.6 million calls
```

```javascript
function fibNaive(n) {                  // O(2^n)
  if (n <= 1) return n;                 // base case
  return fibNaive(n - 1) + fibNaive(n - 2);
}
```

**Question**

*How does memoization convert exponential recursion into linear time?*

The logic above is already correct — it is just wasteful, recomputing identical subtrees. Caching each result the first time it is produced collapses `O(2ⁿ)` to `O(n)` without changing a single line of the recurrence.

**Memoised recursion — linear**

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):
    """O(n) time, O(n) space. One line of caching removes the whole blow-up."""
    if n <= 1:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)

print(fib_memo(300))        # instant, arbitrary precision integers
```

```javascript
const memo = new Map();
function fibMemo(n) {                   // O(n) time and space
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  const value = fibMemo(n - 1) + fibMemo(n - 2);
  memo.set(n, value);
  return value;
}

// A reusable memoiser for any single-argument pure function.
const memoize = (fn, cache = new Map()) => (x) =>
  cache.has(x) ? cache.get(x) : (cache.set(x, fn(x)), cache.get(x));

console.log(fibMemo(90));               // 2880067194370816000 (float precision!)
```

**Question**

*How do you eliminate recursion using bottom-up iteration?*

Once you notice each value depends only on the previous two, the recursion is unnecessary. Sweeping forward with two variables gives the same answer in constant space and with no stack frames at all.

**Bottom-up iteration — constant space**

```python
def fib_iterative(n):
    """O(n) time, O(1) space - no stack frames at all."""
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

console.log(fibIterative(90));          // use BigInt beyond 2^53 - 1
```

<a id="recursion-to-iteration"></a>

### Turning recursion into iteration

**Question**

*How do you convert recursion into iteration using an explicit stack?*

Any recursion can be rewritten with an explicit stack, which is what the runtime was doing for you. Do this when the depth could exceed the stack limit — deep trees, long linked lists, large graphs.

**Explicit stack instead of the call stack**

```python
def dfs_recursive(node, visit):
    if node is None:
        return
    visit(node.value)
    dfs_recursive(node.left, visit)
    dfs_recursive(node.right, visit)

def dfs_iterative(root, visit):
    """Same pre-order walk, but the stack is ours and lives on the heap."""
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        visit(node.value)
        stack.append(node.right)    # push right first so left pops first
        stack.append(node.left)
```

```javascript
function dfsRecursive(node, visit) {
  if (!node) return;
  visit(node.value);
  dfsRecursive(node.left, visit);
  dfsRecursive(node.right, visit);
}

function dfsIterative(root, visit) {    // our stack lives on the heap
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    visit(node.value);
    stack.push(node.right);             // push right first so left pops first
    stack.push(node.left);
  }
}
```

> **Tip**
>
> When a recursion feels confusing, draw the **recursion tree**: one node per call, children for the calls it makes. The number of nodes is your time complexity and the depth is your space complexity. If the same label appears on more than one node, memoisation will help — and that observation is literally the definition of dynamic programming.

**Top Interview Question 1**

*Move a tower of `n` discs from peg A to peg C using peg B, never placing a larger disc on a smaller one. Print the moves.*

The recursive statement is almost the whole solution: move the top `n − 1` discs out of the way, move the biggest disc across, then move the `n − 1` back on top. Each disc doubles the work, so the move count is `2ⁿ − 1` — the canonical demonstration that a tidy recurrence can still be exponential.

**Answer — towers of Hanoi**

```python
def hanoi(n, source="A", target="C", spare="B"):
    """2^n - 1 moves. Three lines of recursion; no iterative version is simpler."""
    if n == 0:
        return                              # nothing left to move
    hanoi(n - 1, source, spare, target)     # get the small discs out of the way
    print(f"move disc {n}: {source} -> {target}")
    hanoi(n - 1, spare, target, source)     # pile them back on the big disc

hanoi(3)
# move disc 1: A -> C     move disc 2: A -> B     move disc 1: C -> B
# move disc 3: A -> C     move disc 1: B -> A     move disc 2: B -> C
# move disc 1: A -> C     (7 moves = 2^3 - 1)
```

```javascript
function hanoi(n, source = "A", target = "C", spare = "B") {   // 2^n - 1 moves
  if (n === 0) return;                      // nothing left to move
  hanoi(n - 1, source, spare, target);      // clear the small discs
  console.log(`move disc ${n}: ${source} -> ${target}`);
  hanoi(n - 1, spare, target, source);      // pile them back on
}

hanoi(3);                                   // 7 moves = 2^3 - 1
```

**Top Interview Question 2**

*Flatten an arbitrarily nested array of integers into a flat list: `[1, [2, [3, [4]], 5]]` becomes `[1, 2, 3, 4, 5]`.*

This is the shape recursion exists for — the structure is defined in terms of itself, so the code should be too. Each element is either a value (emit it) or another list (recurse). Work is `O(total elements)` and the stack depth equals the nesting depth, which is worth saying out loud in an interview.

**Answer — flatten a nested list**

```python
def flatten(items):
    """O(total elements) time; stack depth == nesting depth."""
    out = []
    for item in items:
        if isinstance(item, list):
            out.extend(flatten(item))   # a list: solve the same problem, smaller
        else:
            out.append(item)            # a value: emit it
    return out

print(flatten([1, [2, [3, [4]], 5]]))   # [1, 2, 3, 4, 5]
print(flatten([[], [[]], [1]]))         # [1]
```

```javascript
function flatten(items) {               // O(total elements); depth == nesting
  const out = [];
  for (const item of items) {
    if (Array.isArray(item)) out.push(...flatten(item));   // recurse
    else out.push(item);                                   // emit
  }
  return out;
}

console.log(flatten([1, [2, [3, [4]], 5]]));   // [1, 2, 3, 4, 5]
// The built-in equivalent: [1, [2, [3, [4]], 5]].flat(Infinity)
```

**Top Interview Question 3**

*Reverse a singly linked list recursively, and say what it costs compared with the iterative version.*

Recurse to the tail first, then on the way back out make the next node point *backwards* and sever the old link. It is elegant, but honesty matters here: the stack grows to `O(n)`, so for a million-node list the iterative version is the one that survives. Interviewers usually want both, plus that trade-off stated.

**Answer — recursive list reversal**

```python
def reverse_recursive(node):
    """O(n) time, O(n) STACK - the iterative version uses O(1) space."""
    if node is None or node.next is None:
        return node                     # empty or single node: already reversed

    new_head = reverse_recursive(node.next)   # reverse everything after me
    node.next.next = node               # the next node now points back at me
    node.next = None                    # ...and I become the new tail
    return new_head                     # the old tail bubbles up unchanged
```

```javascript
function reverseRecursive(node) {       // O(n) time, O(n) STACK
  if (node === null || node.next === null) return node;   // base case

  const newHead = reverseRecursive(node.next);   // reverse the rest
  node.next.next = node;                // the next node points back at me
  node.next = null;                     // ...and I become the tail
  return newHead;                       // old tail bubbles up unchanged
}

// Prefer the iterative version on long lists: it is O(1) space and cannot
// blow the call stack.
```

<a id="14-sorting"></a>

## 14. Sorting

- **Comparison-sort floor** `Ω(n log n)`
- **Practical default** the built-in sort
- **Key properties** stability, in-place, adaptivity

You will rarely write a sort in production — both languages ship excellent ones. You study them because they are the clearest possible demonstration of algorithmic technique: the same task solved six ways, with the trade-offs laid bare. Each algorithm is animated step by step alongside its implementation below.

<a id="the-three-properties"></a>

### The three properties that matter

1. **Stable** — equal elements keep their original relative order. This is what lets you sort by one key and then another to get a compound ordering. Merge sort and insertion sort are stable; quicksort and heapsort are not.
2. **In place** — uses `O(1)` or `O(log n)` extra memory. Quicksort and heapsort qualify; merge sort does not.
3. **Adaptive** — faster on data that is already partly sorted. Insertion sort is `O(n)` on sorted input; Timsort is built entirely around exploiting existing runs.

<a id="why-n-log-n-is-the-floor"></a>

### Why `n log n` is a hard floor

An algorithm that only compares elements is walking a decision tree: each comparison has two outcomes, so `c` comparisons distinguish at most `2^c` orderings. There are `n!` possible orderings, so you need `2^c ≥ n!`, giving `c ≥ log₂(n!) ≈ n log n`. No comparison sort can beat that. The only escape is to stop comparing — which is exactly what counting and radix sort do.

<a id="the-implementations"></a>

### The implementations

**Question**

*How does bubble sort repeatedly swap adjacent elements to sort an array?*

Compare adjacent elements in pairwise passes, swapping out-of-order pairs so the largest remaining value bubbles to the end of the array after each pass. If a full pass makes zero swaps, early termination sorts in linear time.

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

**Question**

*How does selection sort minimise write operations?*

Scan the unsorted portion of the array for its minimum value and perform exactly one swap to place it at the boundary of the sorted prefix. With only n - 1 swaps total, it makes the fewest writes of any comparison sort.

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

**Question**

*How does insertion sort achieve linear time on nearly-sorted data?*

Maintain a sorted prefix and slide each subsequent element leftward into its correct slot. When data is already near its final place, inner while-loops exit almost immediately, running in O(n) time with very small constant factors.

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

**Question**

*How does merge sort guarantee O(n log n) stable sorting?*

Recursively divide the input in half until single items remain, then merge sorted halves back together in linear time using two pointers.

> **Interactive animation:** `sorting` (option=merge) — rendered by the page script in the HTML version.

**Merge sort**

```python
def merge_sort(nums):
    """O(n log n) always. Stable. O(n) extra space."""
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    return merge(left, right)

def merge(left, right):
    """Two-pointer merge of two sorted lists. O(n + m)."""
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        # <= (not <) is what makes this STABLE: ties take from the left.
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

print(merge_sort([38, 12, 47, 5, 29]))          # [5, 12, 29, 38, 47]
```

```javascript
function mergeSort(nums) {              // O(n log n) always, stable
  if (nums.length <= 1) return nums;
  const mid = nums.length >> 1;
  return merge(mergeSort(nums.slice(0, mid)), mergeSort(nums.slice(mid)));
}

function merge(left, right) {           // O(n + m) two-pointer merge
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    // <= keeps it STABLE: ties come from the left run.
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

console.log(mergeSort([38, 12, 47, 5, 29]));       // [5, 12, 29, 38, 47]
```

**Question**

*How does quicksort partition in place without extra space?*

Quicksort does its work while *splitting* rather than while merging, which is why it needs no second array. Two details make this version production-grade: a median-of-three pivot to avoid the `O(n²)` worst case on sorted input, and recursing into the smaller partition while looping on the larger, which caps stack depth at `O(log n)`.

> **Interactive animation:** `sorting` (option=quick) — rendered by the page script in the HTML version.

**Quicksort with Lomuto partitioning**

```python
def quicksort(nums, lo=0, hi=None):
    """Average O(n log n), worst O(n^2). In place, not stable."""
    if hi is None:
        hi = len(nums) - 1
    while lo < hi:
        p = partition(nums, lo, hi)
        # Recurse into the SMALLER side, loop on the larger one.
        # This caps stack depth at O(log n) even in the worst case.
        if p - lo < hi - p:
            quicksort(nums, lo, p - 1)
            lo = p + 1
        else:
            quicksort(nums, p + 1, hi)
            hi = p - 1

def partition(nums, lo, hi):
    """Lomuto partition with a median-of-three pivot."""
    mid = (lo + hi) // 2
    # Order lo, mid, hi so the median ends up at hi as the pivot.
    if nums[mid] < nums[lo]:
        nums[mid], nums[lo] = nums[lo], nums[mid]
    if nums[hi] < nums[lo]:
        nums[hi], nums[lo] = nums[lo], nums[hi]
    if nums[mid] < nums[hi]:
        nums[mid], nums[hi] = nums[hi], nums[mid]

    pivot = nums[hi]
    store = lo
    for i in range(lo, hi):
        if nums[i] < pivot:
            nums[i], nums[store] = nums[store], nums[i]
            store += 1
    nums[store], nums[hi] = nums[hi], nums[store]
    return store

data = [38, 12, 47, 5, 29]
quicksort(data)
print(data)                                     # [5, 12, 29, 38, 47]
```

```javascript
function quicksort(nums, lo = 0, hi = nums.length - 1) {
  while (lo < hi) {
    const p = partition(nums, lo, hi);
    // Recurse on the smaller side to bound stack depth at O(log n).
    if (p - lo < hi - p) {
      quicksort(nums, lo, p - 1);
      lo = p + 1;
    } else {
      quicksort(nums, p + 1, hi);
      hi = p - 1;
    }
  }
  return nums;
}

function partition(nums, lo, hi) {      // Lomuto, median-of-three pivot
  const mid = (lo + hi) >> 1;
  const swap = (a, b) => { [nums[a], nums[b]] = [nums[b], nums[a]]; };
  if (nums[mid] < nums[lo]) swap(mid, lo);
  if (nums[hi] < nums[lo]) swap(hi, lo);
  if (nums[mid] < nums[hi]) swap(mid, hi);

  const pivot = nums[hi];
  let store = lo;
  for (let i = lo; i < hi; i++) if (nums[i] < pivot) swap(i, store++);
  swap(store, hi);
  return store;
}

console.log(quicksort([38, 12, 47, 5, 29]));       // [5, 12, 29, 38, 47]
```

**Question**

*How does heapsort achieve guaranteed O(n log n) sorting in place?*

Build a max-heap in place using bottom-up sift-down in O(n) time, then repeatedly swap the root maximum to the end of the array and restore the heap invariant in O(log n) time per element.

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

    # Bottom-up heap construction: O(n)
    for i in range(len(nums) // 2 - 1, -1, -1):
        sift_down(len(nums), i)
    # Repeatedly move max to end: O(n log n)
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

**Question**

*How does counting sort achieve O(n + k) time without comparing elements?*

Both of the above compare elements, so both are stuck behind the `n log n` barrier. Counting sort escapes it by not comparing at all — it uses the values themselves as array indices.

**Counting sort**

```python
def counting_sort(nums, max_value):
    """O(n + k) - beats the n log n bound by never comparing."""
    counts = [0] * (max_value + 1)
    for x in nums:
        counts[x] += 1
    out = []
    for value, count in enumerate(counts):
        out.extend([value] * count)
    return out

print(counting_sort([4, 1, 3, 1, 4, 0], 4))     # [0, 1, 1, 3, 4, 4]
```

```javascript
function countingSort(nums, maxValue) { // O(n + k), no comparisons at all
  const counts = new Array(maxValue + 1).fill(0);
  for (const x of nums) counts[x]++;
  const out = [];
  counts.forEach((count, value) => {
    for (let i = 0; i < count; i++) out.push(value);
  });
  return out;
}

console.log(countingSort([4, 1, 3, 1, 4, 0], 4));  // [0, 1, 1, 3, 4, 4]
```

<a id="non-comparison-sorts"></a>

### Sorting without comparing

1. **Counting sort** `O(n + k)` — tally each value in an array indexed by the value itself. Only usable when values are small non-negative integers, since space is `O(k)`.
2. **Radix sort** `O(d·(n + b))` — counting-sort by each digit, least significant first, using a stable sort so earlier passes survive. Sorts integers and fixed-length strings in effectively linear time.
3. **Bucket sort** `O(n)` average — scatter values into buckets by range, sort each bucket, concatenate. Excellent when the input is uniformly distributed.

**Question**

*How does radix sort achieve linear time on fixed-width integers?*

Sort numbers digit by digit from least significant digit (LSD) to most significant digit using a stable counting sort on each digit. Earlier digit orderings are preserved by stability, sorting in `O(d · (n + b))` time where `d` is digit count and `b` is base (10).

**Radix sort (LSD)**

```python
def radix_sort(nums):
    """O(d * (n + b)) time. Non-negative integers, LSD stable passes."""
    if not nums:
        return nums
    max_val = max(nums)
    exp = 1
    while max_val // exp > 0:
        counts = [0] * 10
        for x in nums:
            digit = (x // exp) % 10
            counts[digit] += 1
        for i in range(1, 10):
            counts[i] += counts[i - 1]
        out = [0] * len(nums)
        for x in reversed(nums):
            digit = (x // exp) % 10
            counts[digit] -= 1
            out[counts[digit]] = x
        nums = out
        exp *= 10
    return nums

print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))  # [2, 24, 45, 66, 75, 90, 170, 802]
```

```javascript
function radixSort(nums) {              // O(d * (n + b)), LSD stable
  if (!nums.length) return nums;
  let maxVal = Math.max(...nums);
  let exp = 1;
  let arr = [...nums];

  while (Math.floor(maxVal / exp) > 0) {
    const counts = new Array(10).fill(0);
    for (const x of arr) counts[Math.floor(x / exp) % 10]++;
    for (let i = 1; i < 10; i++) counts[i] += counts[i - 1];

    const out = new Array(arr.length);
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      out[--counts[digit]] = arr[i];
    }
    arr = out;
    exp *= 10;
  }
  return arr;
}

console.log(radixSort([170, 45, 75, 90, 802, 24, 2, 66]));
```

**Question**

*How does bucket sort distribute and sort uniformly distributed data in linear average time?*

Divide the value interval `[0, 1)` into `n` equal sub-buckets. Distribute elements into their corresponding bucket, sort each bucket (typically with insertion sort), and concatenate the buckets into a final sorted array in `O(n)` average time.

**Bucket sort**

```python
def bucket_sort(nums):
    """O(n) average for numbers uniformly distributed in [0, 1)."""
    if not nums:
        return nums
    n = len(nums)
    buckets = [[] for _ in range(n)]
    for x in nums:
        idx = int(n * x)
        buckets[min(idx, n - 1)].append(x)
    out = []
    for bucket in buckets:
        bucket.sort()
        out.extend(bucket)
    return out

print(bucket_sort([0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]))
```

```javascript
function bucketSort(nums) {             // O(n) average on uniform floats
  if (!nums.length) return nums;
  const n = nums.length;
  const buckets = Array.from({ length: n }, () => []);
  for (const x of nums) {
    const idx = Math.min(Math.floor(n * x), n - 1);
    buckets[idx].push(x);
  }
  return buckets.flatMap((b) => b.sort((a, b) => a - b));
}

console.log(bucketSort([0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]));
```

<a id="what-the-built-ins-do"></a>

### What the built-ins actually do

**Question**

*How do you sort complex objects by custom keys idiomatically?*

Python's `sort` is **Timsort**: it finds naturally sorted runs, extends short ones with insertion sort, and merges them. It is stable, `O(n)` on already-sorted input, and `O(n log n)` otherwise. V8's `Array.prototype.sort` has been Timsort since 2018 and is also stable. Both are better than anything you will write by hand — the reason to know the alternatives is to recognise when the *problem* wants a different structure entirely.

**Sorting by keys the idiomatic way**

```python
people = [("ada", 36), ("alan", 41), ("grace", 36)]

sorted(people, key=lambda p: p[1])              # by age, stable
sorted(people, key=lambda p: (-p[1], p[0]))     # age desc, then name asc
sorted(people, key=lambda p: p[1], reverse=True)

words = ["banana", "kiwi", "apple"]
words.sort(key=len)                             # in place, by length

# Stability composed: sort by the secondary key first, then the primary.
records = sorted(people, key=lambda p: p[0])    # name
records.sort(key=lambda p: p[1])                # then age; names stay ordered
```

```javascript
const people = [["ada", 36], ["alan", 41], ["grace", 36]];

people.sort((a, b) => a[1] - b[1]);            // by age, stable
people.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])); // age desc, name asc

const words = ["banana", "kiwi", "apple"];
words.sort((a, b) => a.length - b.length);     // in place

// The classic bug: sort() with no comparator sorts by STRING value.
console.log([10, 9, 1].sort());                // [1, 10, 9]  - wrong
console.log([10, 9, 1].sort((a, b) => a - b)); // [1, 9, 10]  - right
```

**Top Interview Question 1**

*An array holds only `0`, `1` and `2`. Sort it in a single pass with constant extra space — no counting pass, no library sort.*

Counting each value and rewriting the array takes two passes. The **Dutch national flag** partition does it in one: three pointers carve the array into *done-zeros*, *done-ones*, *unexamined* and *done-twos*. The subtlety is that swapping a `2` in from the back brings an unexamined value, so the cursor must not advance.

**Answer — sort colours (Dutch national flag)**

```python
def sort_colors(nums):
    """O(n) time, O(1) space, single pass. Three regions, three pointers."""
    low, i, high = 0, 0, len(nums) - 1
    while i <= high:
        if nums[i] == 0:
            nums[low], nums[i] = nums[i], nums[low]
            low += 1
            i += 1                      # what came back is a settled 0 or 1
        elif nums[i] == 2:
            nums[high], nums[i] = nums[i], nums[high]
            high -= 1                   # do NOT advance i: the swapped-in value
        else:                           # is still unexamined
            i += 1

data = [2, 0, 2, 1, 1, 0]
sort_colors(data)
print(data)                             # [0, 0, 1, 1, 2, 2]
```

```javascript
function sortColors(nums) {             // O(n) time, O(1) space, one pass
  let low = 0, i = 0, high = nums.length - 1;
  const swap = (a, b) => { [nums[a], nums[b]] = [nums[b], nums[a]]; };

  while (i <= high) {
    if (nums[i] === 0) swap(low++, i++);       // settled on the left
    else if (nums[i] === 2) swap(high--, i);   // do NOT advance i
    else i++;                                  // a 1 is already in place
  }
}

const data = [2, 0, 2, 1, 1, 0];
sortColors(data);
console.log(data);                      // [0, 0, 1, 1, 2, 2]
```

**Top Interview Question 2**

*Merge a sorted array `b` into a sorted array `a` that already has enough trailing space. Do it in place.*

Merging forwards means shifting elements out of the way, which is `O(n·m)`. Fill **from the back** instead: the largest remaining value goes into the last free slot, and that slot is always beyond anything still unread. One reverse pass, `O(n + m)`.

**Answer — merge sorted array in place**

```python
def merge_in_place(a, m, b, n):
    """O(n + m) time, O(1) space. Writing backwards never overwrites unread data."""
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:                       # once b is drained, a is already in place
        if i >= 0 and a[i] > b[j]:
            a[write] = a[i]
            i -= 1
        else:
            a[write] = b[j]
            j -= 1
        write -= 1

a = [1, 2, 3, 0, 0, 0]
merge_in_place(a, 3, [2, 5, 6], 3)
print(a)                                # [1, 2, 2, 3, 5, 6]
```

```javascript
function mergeInPlace(a, m, b, n) {     // O(n + m) time, O(1) space
  let i = m - 1, j = n - 1, write = m + n - 1;
  while (j >= 0) {                      // when b is drained, a is already sorted
    if (i >= 0 && a[i] > b[j]) a[write--] = a[i--];
    else a[write--] = b[j--];
  }
}

const a = [1, 2, 3, 0, 0, 0];
mergeInPlace(a, 3, [2, 5, 6], 3);
console.log(a);                         // [1, 2, 2, 3, 5, 6]
```

**Top Interview Question 3**

*Arrange a list of non-negative integers so that concatenating them forms the largest possible number. `[3, 30, 34, 5, 9]` gives `"9534330"`.*

Sorting descending numerically is wrong: `30` beats `3` numerically, yet `"330" > "303"`. The right comparator asks which *concatenation* is larger, `a + b` versus `b + a`. This is the classic reminder that a custom comparator must define a consistent total order, and the leading-zero case still needs handling.

**Answer — largest number via a custom comparator**

```python
from functools import cmp_to_key

def largest_number(nums):
    """O(n log n) comparisons, each on short strings. Order by a+b vs b+a."""
    def compare(a, b):
        if a + b == b + a:
            return 0
        return -1 if a + b > b + a else 1   # -1 means "a comes first"

    parts = sorted((str(x) for x in nums), key=cmp_to_key(compare))
    joined = "".join(parts)
    return "0" if joined[0] == "0" else joined   # [0, 0] must not become "00"

print(largest_number([3, 30, 34, 5, 9]))   # "9534330"
print(largest_number([0, 0]))              # "0"
```

```javascript
function largestNumber(nums) {          // O(n log n) comparisons
  const parts = nums.map(String).sort((a, b) => (b + a).localeCompare(a + b));
  const joined = parts.join("");
  return joined[0] === "0" ? "0" : joined;   // [0, 0] must not become "00"
}

console.log(largestNumber([3, 30, 34, 5, 9]));   // "9534330"
console.log(largestNumber([0, 0]));              // "0"
```

<a id="15-searching-and-binary-search"></a>

## 15. Searching & Binary Search

- **Linear** `O(n)`, no preconditions
- **Binary** `O(log n)`, needs order
- **Space** `O(1)` iterative

Binary search is the most valuable twenty lines of code in this course, and the most commonly written incorrectly. Jon Bentley reported that only about 10% of professional programmers could write a correct one given two hours; the bug that shipped in Java's standard library for nine years was an integer overflow in `(lo + hi) / 2`.

> **Interactive animation:** `binary-search` — rendered by the page script in the HTML version.

<a id="getting-it-right"></a>

### Getting the details right

1. **Pick a loop invariant and never break it.** The version below uses an inclusive range `[lo, hi]`, so the loop condition is `lo <= hi` and the updates skip `mid`. Mixing this with the half-open convention is where most bugs come from.
2. **Compute the midpoint safely** as `lo + (hi - lo) // 2`. In Python integers never overflow, but the habit matters everywhere else.
3. **Guarantee progress.** Every branch must shrink the range, otherwise you loop forever.

**Top Interview Question 1**

*How do you implement exact-match binary search iteratively?*

Maintain an inclusive range `[lo, hi]` and compare target with mid; adjust boundaries to discard halves while guaranteeing progress until the target is found or bounds cross in `O(log n)` time.

**Exact-match binary search**

```python
def binary_search(nums, target):
    """Index of target, or -1. O(log n) time, O(1) space."""
    lo, hi = 0, len(nums) - 1           # inclusive range [lo, hi]
    while lo <= hi:
        mid = lo + (hi - lo) // 2       # overflow-safe by habit
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1                # discard mid and everything left
        else:
            hi = mid - 1                # discard mid and everything right
    return -1

print(binary_search([1, 3, 3, 3, 7, 9], 7))         # 4
```

```javascript
function binarySearch(nums, target) {   // O(log n) time, O(1) space
  let lo = 0;
  let hi = nums.length - 1;             // inclusive range
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);  // overflow-safe midpoint
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

console.log(binarySearch([1, 3, 3, 3, 7, 9], 7));      // 4
```

**Top Interview Question 2**

*How do you find the first and last boundary indices of duplicate values?*

Exact match is rarely what you actually want. With duplicates you need *boundaries*: the first index not below the target, and the first index above it. These two are mirror images — the only difference is `<` versus `<=` — so they belong side by side. Note they use the half-open range `[lo, hi)`, which is why the loop condition changes to `lo < hi`.

**Lower and upper bound**

```python
def lower_bound(nums, target):
    """First index with nums[i] >= target (insertion point). O(log n)."""
    lo, hi = 0, len(nums)               # half-open [lo, hi)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid                    # mid might be the answer - keep it
    return lo

def upper_bound(nums, target):
    """First index with nums[i] > target."""
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] <= target:         # the only change: <= instead of <
            lo = mid + 1
        else:
            hi = mid
    return lo

# The standard library already has both:
#   from bisect import bisect_left, bisect_right, insort

data = [1, 3, 3, 3, 7, 9]
print(lower_bound(data, 3), upper_bound(data, 3))   # 1 4  -> three 3s
```

```javascript
function lowerBound(nums, target) {     // first index with nums[i] >= target
  let lo = 0;
  let hi = nums.length;                 // half-open range
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;                      // mid may be the answer
  }
  return lo;
}

function upperBound(nums, target) {     // first index with nums[i] > target
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (nums[mid] <= target) lo = mid + 1;   // the only change: <= not <
    else hi = mid;
  }
  return lo;
}

const data = [1, 3, 3, 3, 7, 9];
console.log(lowerBound(data, 3), upperBound(data, 3)); // 1 4
```

<a id="binary-search-on-the-answer"></a>

### Binary search on the answer

**Question**

*How do you apply binary search to find the minimum feasible answer over a predicate?*

The real power move: you do not need an array at all. If you can write a predicate `feasible(x)` that is **false, false, …, false, true, true, …, true** as `x` increases, you can binary search the answer space directly. Minimum capacity to ship packages in `d` days, minimum eating speed, smallest largest-subarray-sum — all the same template.

**Binary search over a monotonic predicate**

```python
def min_ship_capacity(weights, days):
    """Smallest daily capacity that ships everything within `days` days."""

    def feasible(capacity):
        """Monotonic: if capacity works, capacity + 1 also works."""
        needed, load = 1, 0
        for w in weights:
            if load + w > capacity:
                needed += 1     # start a new day
                load = 0
            load += w
        return needed <= days

    # Lower bound: must fit the heaviest single package in one day.
    # Upper bound: ship everything in one day.
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if feasible(mid):
            hi = mid            # mid works - try to do better
        else:
            lo = mid + 1        # mid is too small
    return lo                   # first feasible capacity

print(min_ship_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))    # 15
```

```javascript
function minShipCapacity(weights, days) {
  const feasible = (capacity) => {      // monotonic predicate
    let needed = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > capacity) {
        needed++;                       // start a new day
        load = 0;
      }
      load += w;
    }
    return needed <= days;
  };

  let lo = Math.max(...weights);        // must fit the heaviest package
  let hi = weights.reduce((a, b) => a + b, 0);   // everything in one day
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (feasible(mid)) hi = mid;        // works - try smaller
    else lo = mid + 1;                  // too small
  }
  return lo;
}

console.log(minShipCapacity([1,2,3,4,5,6,7,8,9,10], 5));   // 15
```

> **Interview**
>
> **Recognition signal:** the phrase "minimise the maximum" or "maximise the minimum", or a sorted input with a `O(log n)` requirement. If the answer lives in a numeric range and you can cheaply check a candidate, binary search the range.

**Top Interview Question 3**

*A sorted array of distinct values was rotated at an unknown pivot — `[4, 5, 6, 7, 0, 1, 2]` — and you must find a target in `O(log n)`.*

Scanning is `O(n)` and throws the sortedness away. The key observation: cut anywhere and **at least one half is still perfectly sorted**. Work out which half that is by comparing the ends, check whether the target lies inside it, and discard the other half. Same `O(log n)`, one extra branch.

**Answer — search in a rotated sorted array**

```python
def search_rotated(nums, target):
    """O(log n). One half of every cut is always sorted - use it to decide."""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid

        if nums[lo] <= nums[mid]:               # the LEFT half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1                    # target is inside it
            else:
                lo = mid + 1
        else:                                   # the RIGHT half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1

    return -1

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))   # 4
print(search_rotated([4, 5, 6, 7, 0, 1, 2], 3))   # -1
```

```javascript
function searchRotated(nums, target) {  // O(log n)
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {        // the LEFT half is sorted
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                            // the RIGHT half is sorted
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}

console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0));   // 4
console.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 3));   // -1
```

<a id="16-trees"></a>

## 16. Trees

- **Traversal** `O(n)`
- **Depth-based ops** `O(h)`
- **Balanced height** `h = log n`
- **Degenerate height** `h = n`

A tree is a connected graph with no cycles: `n` nodes and exactly `n − 1` edges, with one node designated the root. The defining property is that there is exactly one path between any two nodes, which is what makes recursion on trees so clean — no cycle detection is needed.

> **Analogy** 👴
>
> **Picture it — a family tree**
>
> The grandfather is the root; his children branch off him, their children off them. Everyone has exactly one parent, so there is exactly one route from the root to any person — which is the reason tree code never has to worry about walking in circles.

*Diagram labels:* A · B · C · D · E · F · root (depth 0) · internal nodes · leaves · edge · height = 2, size = 6, edges = 5

*Vocabulary: root, parent, child, sibling, leaf, subtree. **Depth** counts down from the root; **height** counts up from the deepest leaf.*

<a id="kinds-of-trees"></a>

### Kinds of trees

1. **Binary tree** — at most two children per node.
2. **Full** — every node has 0 or 2 children. **Complete** — every level filled except possibly the last, which fills left to right (this is what heaps require). **Perfect** — all leaves at the same depth, exactly `2^h − 1` nodes.
3. **Balanced** — height stays `O(log n)`. This is a promise about performance, not a shape.
4. **N-ary** — arbitrary children; file systems and DOM trees.

<a id="traversals"></a>

### The four traversals

**How do pre-order, in-order, and post-order depth-first traversals differ?** The three depth-first orders differ only in *when* the node itself is visited relative to its children — a one-line change with completely different uses. Below, each traversal is animated step by step alongside its implementation.

#### 1. Pre-order traversal (Root → Left → Right)

Visits the current node before either subtree. Used for creating copies, serialising trees, or calculating prefix expressions.

> **Interactive animation:** `traversal` (option=preorder) — rendered by the page script in the HTML version.

#### 2. In-order traversal (Left → Root → Right)

Visits the left subtree, then the root, then the right subtree. On a Binary Search Tree, this yields elements in monotonically increasing order.

> **Interactive animation:** `traversal` (option=inorder) — rendered by the page script in the HTML version.

#### 3. Post-order traversal (Left → Right → Root)

Visits both subtrees before visiting the current node. Essential for bottom-up computation (such as computing subtree sizes or heights) and deleting nodes safely.

> **Interactive animation:** `traversal` (option=postorder) — rendered by the page script in the HTML version.

**Question**

*How do you implement a binary tree node and the three depth-first traversals (pre-order, in-order, and post-order)?*

Pre-order visits the current node before its subtrees, in-order yields elements in sorted order on a BST, and post-order processes both subtrees before the current node.

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

**Top Interview Question 1**

*How do you traverse a binary tree level by level using breadth-first search?*

Level-order is the odd one out: it is not depth-first at all, so it uses a queue rather than the call stack. Snapshotting the queue length at the top of each round is what lets you emit one list per level instead of one flat sequence.

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

**Question**

*How do you perform an in-order tree traversal iteratively using an explicit stack?*

Finally, the same in-order walk with the recursion removed. Worth knowing because it is what you reach for when a tree is deep enough to overflow the call stack.

**In-order without recursion**

```python
def inorder_iterative(root):
    """The same walk without recursion, using an explicit stack."""
    out, stack, cur = [], [], root
    while cur or stack:
        while cur:                      # go as far left as possible
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()               # backtrack one node
        out.append(cur.value)
        cur = cur.right                 # then explore its right subtree
    return out
```

```javascript
function inorderIterative(root) {       // explicit stack, no recursion
  const out = [];
  const stack = [];
  let cur = root;
  while (cur || stack.length) {
    while (cur) {                       // dive left
      stack.push(cur);
      cur = cur.left;
    }
    cur = stack.pop();                  // backtrack
    out.push(cur.value);
    cur = cur.right;                    // then go right
  }
  return out;
}
```

**Question**

*How do you perform pre-order and post-order tree traversals iteratively using an explicit stack?*

Iterative pre-order visits the current node and pushes children (right child first so left pops first). Iterative post-order pops each node, records its value, pushes its left then right child, and returns the reversed output (or uses two stacks) to produce the exact `Left → Right → Root` sequence without recursion.

**Pre-order and post-order without recursion**

```python
def preorder_iterative(root):
    """Pre-order (Root, Left, Right) without recursion."""
    if not root:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.value)
        if node.right:                  # push right first so left pops first
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return out

def postorder_iterative(root):
    """Post-order (Left, Right, Root) without recursion."""
    if not root:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.value)
        if node.left:                   # push left first
            stack.append(node.left)
        if node.right:                  # push right second
            stack.append(node.right)
    return out[::-1]                    # reverse produces Left -> Right -> Root
```

```javascript
function preorderIterative(root) {      // Root, Left, Right
  if (!root) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.value);
    if (node.right) stack.push(node.right);   // right pushed first
    if (node.left) stack.push(node.left);     // left pops first
  }
  return out;
}

function postorderIterative(root) {     // Left, Right, Root
  if (!root) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.value);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}
```

<a id="tree-recursion-template"></a>

### The tree recursion template

**Top Interview Question 2**

*How do you compute the height, balance, and diameter of a binary tree?*

Almost every tree question fits one shape: solve the left subtree, solve the right subtree, combine. Get comfortable with it and depth, diameter, balance checking and path sums all become five-line functions.

**Depth, balance and diameter from one pattern**

```python
def height(node):
    """O(n) - one visit per node."""
    if node is None:
        return 0
    return 1 + max(height(node.left), height(node.right))

def is_balanced(root):
    """Return -1 as a sentinel for 'already unbalanced' to stay O(n)."""
    def check(node):
        if node is None:
            return 0
        left = check(node.left)
        if left == -1:
            return -1
        right = check(node.right)
        if right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return check(root) != -1

def diameter(root):
    """Longest path between any two nodes, in edges. O(n)."""
    best = 0

    def depth(node):
        nonlocal best
        if node is None:
            return 0
        left, right = depth(node.left), depth(node.right)
        # The longest path THROUGH this node, considered once per node.
        best = max(best, left + right)
        return 1 + max(left, right)

    depth(root)
    return best

def lowest_common_ancestor(node, a, b):
    """The deepest node that has both a and b in its subtree. O(n)."""
    if node is None or node is a or node is b:
        return node
    left = lowest_common_ancestor(node.left, a, b)
    right = lowest_common_ancestor(node.right, a, b)
    if left and right:
        return node             # a and b split here, so this is the LCA
    return left or right        # both are on one side
```

```javascript
function height(node) {                 // O(n)
  if (!node) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}

function isBalanced(root) {             // -1 sentinel keeps it O(n)
  const check = (node) => {
    if (!node) return 0;
    const left = check(node.left);
    if (left === -1) return -1;
    const right = check(node.right);
    if (right === -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  };
  return check(root) !== -1;
}

function diameter(root) {               // longest path in edges, O(n)
  let best = 0;
  const depth = (node) => {
    if (!node) return 0;
    const left = depth(node.left);
    const right = depth(node.right);
    best = Math.max(best, left + right);   // path through this node
    return 1 + Math.max(left, right);
  };
  depth(root);
  return best;
}

function lowestCommonAncestor(node, a, b) {
  if (!node || node === a || node === b) return node;
  const left = lowestCommonAncestor(node.left, a, b);
  const right = lowestCommonAncestor(node.right, a, b);
  if (left && right) return node;       // a and b diverge here
  return left ?? right;
}
```

**Top Interview Question 3**

*Given two nodes `p` and `q` in a binary tree (no parent pointers, not a search tree), find their lowest common ancestor — the deepest node that has both of them below it.*

Collecting the root-to-node path for each and comparing them works but needs two traversals and extra memory. The recursive answer is four lines: ask each subtree *"did you find either node?"*. A node whose two children both report a find **is** the answer; otherwise pass up whichever side reported one. Single `O(n)` pass, `O(h)` stack.

**Answer — lowest common ancestor of a binary tree**

```python
def lowest_common_ancestor(root, p, q):
    """O(n) time, O(h) stack. The split point is the answer."""
    if root is None or root is p or root is q:
        return root                     # found one - report it upwards

    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)

    if left and right:
        return root                     # p and q split here - this is the LCA
    return left or right                # both live on one side; pass it up

#         3
#        / #       5   1        LCA(5, 1) = 3   (they split at the root)
#      / \           LCA(6, 4) = 5   (4 is below 5, so 5 itself wins)
#     6   2
```

```javascript
function lowestCommonAncestor(root, p, q) {   // O(n) time, O(h) stack
  if (root === null || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root;       // p and q split here - this is the LCA
  return left || right;                 // both on one side; pass it up
}

// Note the second base case: if q sits BELOW p, the recursion stops at p and
// returns it, which is the correct answer - an ancestor may be one of the nodes.
```

<a id="17-binary-search-trees"></a>

## 17. Binary Search Trees

- **Search / insert / delete** `O(h)`
- **Balanced** `O(log n)`
- **Degenerate** `O(n)`
- **Bonus** sorted iteration for free

A BST adds one rule to a binary tree: for every node, all values in the left subtree are smaller and all values in the right subtree are larger. That invariant turns a tree walk into a binary search — at each node you discard an entire subtree.

> **Interactive animation:** `bst-search` — rendered by the page script in the HTML version.

**Question**

*How do you implement a Binary Search Tree (BST) supporting insertion, search, and node deletion?*

The BST's advantage over a hash map is **order**. A hash map answers "is `x` present?" faster, but a BST also answers "what is the smallest value greater than `x`?", "give me everything between 10 and 50", and "iterate in sorted order" — none of which a hash map can do at all.

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

**Top Interview Question 1**

*Given a binary tree, decide whether it is a valid binary search tree.*

The tempting answer — check that each node sits between its own two children — is **wrong**. The BST rule is not local: *every* value in the left subtree must be smaller, not just the immediate child. A tree like `[10, 5, 15, null, null, 6, 20]` passes the naive check but is invalid, because `6` sits in `10`'s right subtree while being smaller than `10`.

The fix is to carry the permitted range down as you descend. Each step narrows one side of the window, so a node is valid only if it falls inside the interval it inherited.

**Answer — validate a BST in O(n)**

```python
def is_valid_bst(root):
    """O(n) time, O(h) stack. Every node must fit the range it inherits."""
    def check(node, low, high):
        if node is None:
            return True                 # an empty tree is trivially valid
        if not (low < node.value < high):
            return False                # violates a bound set by an ancestor
        # Going left tightens the upper bound; going right lifts the lower one.
        return (check(node.left, low, node.value)
                and check(node.right, node.value, high))

    return check(root, float("-inf"), float("inf"))

# The classic trap: this tree passes a naive parent-child check but is invalid,
# because 6 lives in 10's RIGHT subtree yet is smaller than 10.
#         10
#        /  \
#       5    15
#           /  \
#          6    20
```

```javascript
function isValidBST(root) {             // O(n) time, O(h) stack
  const check = (node, low, high) => {
    if (!node) return true;             // empty tree is trivially valid
    if (!(low < node.value && node.value < high)) return false;
    // Going left tightens the upper bound; going right lifts the lower one.
    return check(node.left, low, node.value)
        && check(node.right, node.value, high);
  };
  return check(root, -Infinity, Infinity);
}

// Alternative: an in-order walk of a valid BST is strictly increasing, so you
// can traverse and check each value is greater than the previous one.
```

> **Warning**
>
> **The BST's fatal flaw:** insert `1, 2, 3, 4, 5` in order and every node becomes a right child. You now have a linked list wearing a tree costume, and every operation is `O(n)`. Sorted input is not rare — it is the *normal* case for timestamps, IDs and imported data. This is the entire reason for the next section.

**Top Interview Question 2**

*Return the `k`-th smallest value in a binary search tree.*

Flattening the whole tree into a sorted list is `O(n)` time *and* `O(n)` memory. The BST property means an in-order walk already emits values in sorted order, so an explicit stack lets you stop the moment the `k`-th value pops out: `O(h + k)`. If the question becomes "and now handle frequent updates", the follow-up answer is to augment each node with its subtree size.

**Answer — kth smallest element in a BST**

```python
def kth_smallest(root, k):
    """O(h + k) time, O(h) space. Stops as soon as the answer is found."""
    stack, node = [], root
    while stack or node:
        while node:                     # dive to the smallest unvisited value
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.value           # the k-th value in sorted order
        node = node.right               # in-order: left, self, right
    return None                         # the tree has fewer than k nodes
```

```javascript
function kthSmallest(root, k) {         // O(h + k) time, O(h) space
  const stack = [];
  let node = root;
  while (stack.length || node) {
    while (node) { stack.push(node); node = node.left; }   // dive left
    node = stack.pop();
    if (--k === 0) return node.value;   // the k-th value in sorted order
    node = node.right;
  }
  return null;                          // fewer than k nodes
}
```

**Top Interview Question 3**

*Find the lowest common ancestor of two nodes in a *binary search tree*. How is this easier than the same question on a plain binary tree?*

On a plain tree you must search both subtrees. In a BST the ordering tells you where to go without looking: if both values sit below the current node, walk left; if both sit above, walk right. The first node that lands *between* them is the split point, and therefore the answer. No recursion needed — `O(h)` time and `O(1)` space.

**Answer — lowest common ancestor of a BST**

```python
def lca_bst(root, p, q):
    """O(h) time, O(1) space. The ordering replaces the search entirely."""
    node = root
    while node:
        if p.value < node.value and q.value < node.value:
            node = node.left            # both smaller - the answer is left
        elif p.value > node.value and q.value > node.value:
            node = node.right           # both larger - the answer is right
        else:
            return node                 # they split here (or one IS this node)
    return None
```

```javascript
function lcaBST(root, p, q) {           // O(h) time, O(1) space
  let node = root;
  while (node) {
    if (p.value < node.value && q.value < node.value) node = node.left;
    else if (p.value > node.value && q.value > node.value) node = node.right;
    else return node;                   // the split point is the LCA
  }
  return null;
}
```

<a id="18-balanced-trees-and-b-trees"></a>

## 18. Balanced Trees & B-Trees

- **All operations** `O(log n)` guaranteed
- **Mechanism** rotations or node splitting
- **Used by** language libraries, databases, filesystems

A self-balancing tree detects when it is getting lopsided and repairs itself. The repair operation for binary trees is the **rotation**: a constant-time pointer rearrangement that reduces height on one side while preserving the BST ordering.

*Diagram labels:* before — left heavy, height 3 · 5 · 3 · 1 · 4 · 8 · → · rotate right at 5 · after — balanced, height 2 · 3 · 1 · 5 · 4 · 8

*A rotation moves one node up and one down in `O(1)`. In-order traversal is unchanged (1, 3, 4, 5, 8 both before and after), so the BST property survives.*

<a id="the-families"></a>

### The families

1. **AVL tree** — keeps the heights of the two subtrees within 1 at every node. Strictly balanced, so lookups are the fastest of any BST, but it rotates more on writes. Good for read-heavy workloads.
2. **Red-black tree** — a looser invariant (no red node has a red child; every root-to-leaf path has the same number of black nodes) that guarantees height ≤ `2 log(n+1)`. Fewer rotations on writes. This is what Java's `TreeMap`, C++'s `std::map` and the Linux kernel scheduler use.
3. **Treap / skip list** — randomised structures that achieve `O(log n)` *expected* height with far simpler code. Redis sorted sets are skip lists.
4. **B-tree / B+ tree** — not binary. Each node holds many keys and has many children, so the tree is extremely shallow.

<a id="treeset-and-treemap"></a>

### TreeSet & TreeMap — the standard-library wrappers

You rarely build an AVL or red-black tree by hand. Every major language wraps one up for you:

1. **Java** — `TreeSet<T>` (sorted set of unique elements) and `TreeMap<K, V>` (sorted key-value map), both backed by a red-black tree.
2. **C++** — `std::set` / `std::map` (red-black tree). `std::multiset` / `std::multimap` allow duplicate keys.
3. **Python** — no built-in equivalent. Use the third-party `sortedcontainers` library (`SortedList`, `SortedDict`, `SortedSet`), which are backed by B-tree-like sorted lists and deliver `O(log n)` inserts, deletes and lookups.
4. **JavaScript** — no native sorted set/map. Use a manual BST, or libraries like `bintrees` or `functional-red-black-tree`.

**A `TreeSet`** is an ordered collection of unique elements. Under the hood it is simply a `TreeMap` where each element is stored as a key with a dummy placeholder value. Iterating always yields elements in sorted order.

**A `TreeMap`** is an ordered key-value map. It keeps all keys in sorted order (either natural ordering or by a custom comparator), so you can iterate from smallest to largest in `O(n)`.

#### When to use TreeSet / TreeMap over HashSet / HashMap

`HashMap` and `HashSet` give `O(1)` average lookups — use them when you only need "is `x` present?" or "what is the value for key `k`?". Reach for `TreeMap` / `TreeSet` when you need any of these `O(log n)` operations that hash tables **cannot** do:

1. **`floor(x)`** — largest element ≤ `x`.
2. **`ceiling(x)`** — smallest element ≥ `x`.
3. **`lower(x)`** — strictly greatest element < `x`.
4. **`higher(x)`** — strictly smallest element > `x`.
5. **`first()` / `last()`** — minimum and maximum.
6. **`subSet(from, to)`** — a live view of elements in a range.
7. **Sorted iteration** — iterate keys in order without a separate sort step.

> **Rule of thumb:** if the problem says "find the nearest", "next greater", "previous smaller", "range of values", or "k-th smallest in a stream" — think `TreeSet` / `TreeMap`.

**Worked example — TreeSet / TreeMap in action**

*Given a stream of integers, support two operations: `add(val)` inserts a value, and `find_closest(target)` returns the element in the set nearest to `target` (break ties by returning the smaller one). Both operations must be `O(log n)`.*

A `HashSet` cannot answer "nearest" without scanning all elements. A `TreeSet` (or `SortedList` in Python) answers it instantly with `floor` and `ceiling`: look one step below and one step above, then pick the closer one.

**Answer — nearest value using a sorted set**

```python
from sortedcontainers import SortedList          # pip install sortedcontainers

class NearestFinder:
    """O(log n) add and O(log n) find_closest, backed by a sorted list."""
    def __init__(self):
        self.sl = SortedList()

    def add(self, val):
        self.sl.add(val)                          # O(log n)

    def find_closest(self, target):
        if not self.sl:
            return None
        idx = self.sl.bisect_left(target)         # O(log n) — position where target would go

        best = None
        # Check the element at idx (ceiling) and idx-1 (floor)
        for i in (idx, idx - 1):
            if 0 <= i < len(self.sl):
                cand = self.sl[i]
                if best is None or abs(cand - target) < abs(best - target) \
                        or (abs(cand - target) == abs(best - target) and cand < best):
                    best = cand
        return best


nf = NearestFinder()
for v in [4, 1, 9, 7, 3]:
    nf.add(v)

print(nf.find_closest(5))   # 4  — both 4 and 7 are candidates; 4 is closer
print(nf.find_closest(6))   # 7  — 7 is 1 away, 4 is 2 away
print(nf.find_closest(8))   # 9 vs 7 — both 1 away, pick smaller → 7
```

```javascript
// A minimal sorted-set backed by a balanced BST (using an array + bisect for clarity).
// In production, use a library like 'bintrees' for O(log n) insert.

class NearestFinder {
  constructor() { this.arr = []; }            // kept sorted

  add(val) {                                  // O(log n) search + O(n) shift (use BST lib for true O(log n))
    let lo = 0, hi = this.arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.arr[mid] < val) lo = mid + 1;
      else hi = mid;
    }
    if (this.arr[lo] !== val) this.arr.splice(lo, 0, val);
  }

  findClosest(target) {                       // O(log n)
    const a = this.arr, n = a.length;
    if (n === 0) return null;
    let lo = 0, hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    // lo is the ceiling index; lo-1 is the floor index
    let best = null;
    for (const i of [lo, lo - 1]) {
      if (i >= 0 && i < n) {
        const c = a[i];
        if (best === null
            || Math.abs(c - target) < Math.abs(best - target)
            || (Math.abs(c - target) === Math.abs(best - target) && c < best)) {
          best = c;
        }
      }
    }
    return best;
  }
}

const nf = new NearestFinder();
for (const v of [4, 1, 9, 7, 3]) nf.add(v);

console.log(nf.findClosest(5));   // 4
console.log(nf.findClosest(6));   // 7
console.log(nf.findClosest(8));   // 7  (tie-break: 7 < 9)
```

<a id="why-databases-use-b-trees"></a>

### Why every database uses a B+ tree

On disk, the cost is not comparisons — it is **page reads**. A disk or SSD reads a 4–16 KB page at a time, and one random read costs roughly as much as a million in-memory comparisons. A binary tree over 10 million keys is ~23 levels deep, meaning up to 23 page reads per lookup. A B+ tree packs hundreds of keys into each page, so the branching factor is ~500 and the same 10 million keys fit in **three levels**. That is why `CREATE INDEX` builds a B+ tree and not an AVL tree.

```text
B+ tree, branching factor 4 (real ones are ~500)

                [ 20 | 50 ] internal nodes hold keys only
                / | \
                [ 5 | 12 ] [ 30 | 40 ] [ 60 | 80 ]
                / | \ ... ...
                leaves: [1,3,5] <-> [8,12] <-> [15,18] <-> [22,30] <-> ...
                ^ all values live in the leaves, linked left-to-right
                so a RANGE SCAN is one descent plus a linear walk
```

**Top Interview Question 1**

*How do AVL tree rotations maintain O(log n) height during insertions?*

Check the balance factor after standard BST insertion; perform single or double rotations (left or right) in `O(1)` time to restore balance whenever a subtree height difference exceeds one.

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

**Top Interview Question 2**

*Convert a sorted array into a height-balanced binary search tree.*

Inserting the sorted values one by one is exactly the disaster described above — you get a right-leaning chain of height `n`. Balance has to be built in from the start.

Since the array is already sorted, its **middle element** is the median, so making it the root splits the remaining values evenly in two. Recurse on each half and the halving guarantees a height of `⌈log n⌉` — no rotations required, because you never create the imbalance in the first place.

**Answer — sorted array to a balanced BST**

```python
def sorted_array_to_bst(nums):
    """O(n) time, O(log n) stack. Height is guaranteed to be ceil(log n)."""
    def build(lo, hi):
        if lo > hi:
            return None
        mid = lo + (hi - lo) // 2       # median -> splits the rest evenly
        node = TreeNode(nums[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node

    return build(0, len(nums) - 1)

tree = sorted_array_to_bst([1, 2, 3, 4, 5, 6, 7])
print(tree.value)       # 4 - the median becomes the root
# Naive sequential insertion of the same data gives a chain of height 7;
# this gives height 3.
```

```javascript
function sortedArrayToBST(nums) {   // O(n) time, O(log n) stack
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = lo + ((hi - lo) >> 1);   // median splits the rest evenly
    return {
      value: nums[mid],
      left: build(lo, mid - 1),
      right: build(mid + 1, hi),
    };
  };
  return build(0, nums.length - 1);
}

const tree = sortedArrayToBST([1, 2, 3, 4, 5, 6, 7]);
console.log(tree.value);            // 4 - the median becomes the root
```

**Top Interview Question 3**

*Convert a balanced binary search tree into a sorted, circular doubly linked list **in place** — reuse `left` as `previous` and `right` as `next`, allocating no new nodes.*

This is the question that checks whether you really understand in-order traversal. Walking the tree in order visits the values in exactly the sequence the list needs, so all that is left is to stitch each visited node to the previously visited one. Keep a `previous` pointer across the recursion, then close the ring between head and tail at the end: `O(n)` time, `O(h)` stack, zero allocations.

**Answer — BST to sorted circular doubly linked list**

```python
def tree_to_doubly_list(root):
    """O(n) time, O(h) stack, no new nodes. left = prev, right = next."""
    if root is None:
        return None

    head = previous = None

    def visit(node):
        nonlocal head, previous
        if node is None:
            return
        visit(node.left)                # everything smaller is already linked

        if previous is None:
            head = node                 # the smallest value becomes the head
        else:
            previous.right = node       # stitch the two neighbours together
            node.left = previous
        previous = node

        visit(node.right)

    visit(root)
    head.left, previous.right = previous, head   # close the ring
    return head
```

```javascript
function treeToDoublyList(root) {       // O(n) time, O(h) stack, no allocation
  if (!root) return null;

  let head = null, previous = null;

  const visit = (node) => {
    if (!node) return;
    visit(node.left);                   // everything smaller is linked already

    if (!previous) head = node;         // the smallest value is the head
    else { previous.right = node; node.left = previous; }
    previous = node;

    visit(node.right);
  };

  visit(root);
  head.left = previous;                 // close the ring
  previous.right = head;
  return head;
}
```

<a id="19-heaps-and-priority-queues"></a>

## 19. Heaps & Priority Queues

- **Peek min/max** `O(1)`
- **Push / pop** `O(log n)`
- **Build from array** `O(n)`
- **Space** `O(1)` extra — it lives in the array

A heap answers exactly one question fast: *what is the smallest (or largest) item right now?* It does not keep the rest sorted, and that deliberate weakness is why it is cheaper than a balanced tree. A **priority queue** is the abstract idea; a **binary heap** is the usual implementation.

The elegant part is that a heap needs no pointers at all. Store the complete binary tree level by level in an array and the relationships become arithmetic: for index `i`, children are at `2i+1` and `2i+2`, and the parent is at `(i−1)//2`.

> **Interactive animation:** `heap` — rendered by the page script in the HTML version.

**Question**

*How do binary heap operations (heapify, push, and pop) maintain heap order?*

Map a complete binary tree into a flat array using index arithmetic `2i+1` and `2i+2`, restoring heap invariants via sift-up and sift-down in `O(log n)` time.

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

<a id="why-build-is-linear"></a>

### Why building a heap is `O(n)`, not `O(n log n)`

Sifting down from the bottom up, half the nodes are leaves and need zero work, a quarter need at most one swap, an eighth need two, and so on. The total is `n × Σ(k / 2^k) = 2n = O(n)`. Pushing elements one at a time instead gives `O(n log n)`, so always `heapify` an existing array rather than looping over pushes.

**Top Interview Question 1**

*Merge `k` sorted linked lists into one sorted list.*

Concatenating everything and sorting is `O(N log N)` over all `N` elements and throws away the fact that each list is *already* sorted. The smallest unused value can only ever be at the head of one of the `k` lists — so you only ever need the minimum of `k` candidates, which is exactly what a heap gives you.

Hold one entry per list in a min-heap. Pop the smallest, append it, then push that list's next node. The heap never exceeds `k` items, giving `O(N log k)` — a real improvement when `k` is much smaller than `N`.

**Answer — merge k sorted lists in O(N log k)**

```python
import heapq

def merge_k_lists(lists):
    """lists = [head, head, ...]. O(N log k) time, O(k) space."""
    heap = []
    # Seed with the head of each list. The counter breaks ties so Python
    # never tries to compare two Node objects.
    for i, head in enumerate(lists):
        if head:
            heapq.heappush(heap, (head.value, i, head))

    dummy = Node(None)          # dummy head removes the "is it first?" case
    tail = dummy

    while heap:
        _, i, node = heapq.heappop(heap)    # smallest head across all lists
        tail.next = node
        tail = node
        if node.next:                       # refill from the same list
            heapq.heappush(heap, (node.next.value, i, node.next))

    return dummy.next

# Three sorted lists -> one sorted list, touching each node once.
```

```javascript
// Uses the Heap class from earlier in this section.
function mergeKLists(lists) {           // O(N log k) time, O(k) space
  const heap = new Heap((a, b) => a.value - b.value);
  for (const head of lists) if (head) heap.push(head);

  const dummy = { value: null, next: null };   // removes the "first?" case
  let tail = dummy;

  while (heap.size) {
    const node = heap.pop();            // smallest head across all lists
    tail.next = node;
    tail = node;
    if (node.next) heap.push(node.next);       // refill from the same list
  }

  tail.next = null;
  return dummy.next;
}
```

> **Interview**
>
> **Recognition signal:** "top `k`", "`k`-th largest", "median of a stream", "merge `k` sorted lists", "schedule by priority", or Dijkstra/Prim. Note that for top-`k` largest you keep a *min*-heap of size `k` — the counterintuitive direction is the whole trick.

**Top Interview Question 2**

*Numbers arrive one at a time. After each arrival you may be asked for the median of everything seen so far. Design a structure that keeps both operations fast.*

Re-sorting on every query is `O(n log n)` per call. Split the data at the median instead: a **max-heap** for the lower half and a **min-heap** for the upper half. The two roots straddle the middle, so the median is either one root or the average of both. Keep the sizes within one of each other and insertion is `O(log n)` while the query is `O(1)`.

**Answer — find median from a data stream**

```python
import heapq

class MedianFinder:
    """add: O(log n). median: O(1). Two heaps meeting at the middle."""

    def __init__(self):
        self._low = []                  # max-heap (negated) - the smaller half
        self._high = []                 # min-heap - the larger half

    def add(self, x):
        heapq.heappush(self._low, -x)                       # always land in low
        heapq.heappush(self._high, -heapq.heappop(self._low))   # pass the max up
        if len(self._high) > len(self._low):                # rebalance
            heapq.heappush(self._low, -heapq.heappop(self._high))

    def median(self):
        if len(self._low) > len(self._high):
            return -self._low[0]        # odd count - low holds the extra value
        return (-self._low[0] + self._high[0]) / 2

mf = MedianFinder()
for v in (5, 15, 1, 3):
    mf.add(v)
print(mf.median())                      # 4.0  -> sorted: [1, 3, 5, 15]
```

```javascript
// JavaScript has no built-in heap; this uses the MinHeap from earlier in the
// section, with the low half negated so a min-heap behaves like a max-heap.
class MedianFinder {                    // add: O(log n), median: O(1)
  constructor() {
    this.low = new MinHeap();           // negated -> acts as a max-heap
    this.high = new MinHeap();
  }

  add(x) {
    this.low.push(-x);                            // always land in low
    this.high.push(-this.low.pop());              // pass its max up to high
    if (this.high.size() > this.low.size()) {     // rebalance
      this.low.push(-this.high.pop());
    }
  }

  median() {
    if (this.low.size() > this.high.size()) return -this.low.peek();
    return (-this.low.peek() + this.high.peek()) / 2;
  }
}
```

**Top Interview Question 3**

*Given points on a plane, return the `k` closest to the origin.*

Sorting everything is `O(n log n)` when only `k` results are wanted. Keep a **max-heap of size k**: push each point and evict the worst whenever the heap overflows, so it always holds the best `k` seen so far. That is `O(n log k)` time and `O(k)` memory — and it works on a stream, where sorting cannot. Comparing squared distances avoids a pointless square root.

**Answer — k closest points to origin**

```python
import heapq

def k_closest(points, k):
    """O(n log k) time, O(k) space. Squared distance - no sqrt needed."""
    heap = []                                   # max-heap of the best k so far
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))   # negate for a max-heap
        if len(heap) > k:
            heapq.heappop(heap)                 # drop the current worst
    return [[x, y] for _, x, y in heap]

print(k_closest([[1, 3], [-2, 2], [5, 8], [0, 1]], 2))   # [[-2, 2], [0, 1]]
```

```javascript
function kClosest(points, k) {          // O(n log k) time, O(k) space
  const heap = new MinHeap();           // stores [-distance, x, y]
  for (const [x, y] of points) {
    heap.push([-(x * x + y * y), x, y]);   // negate so the worst sits on top
    if (heap.size() > k) heap.pop();       // drop the current worst
  }
  return heap.toArray().map(([, x, y]) => [x, y]);
}

// Sorting is O(n log n) and needs the whole array up front; the size-k heap
// works on a stream and never holds more than k points.
```

<a id="20-tries"></a>

## 20. Tries

- **Insert / search** `O(L)` — length of the key
- **Prefix query** `O(L)`
- **Space** `O(total characters × alphabet)`

A trie (from re*trie*val, usually pronounced "try") stores strings along the edges of a tree. Everything below a node shares that node's prefix, which makes the operations a hash map cannot do — autocomplete, prefix counting, longest common prefix — trivially cheap.

The headline property is that lookup time depends on the **length of the key**, not on how many keys are stored. A trie holding ten words and a trie holding ten million answer `startsWith("app")` in the same three steps.

> **Interactive animation:** `trie` — rendered by the page script in the HTML version.

**Top Interview Question 1**

*How does a trie perform prefix matching and autocomplete in O(L) time?*

Store characters along tree edges where descendant nodes share common prefix paths, enabling `O(L)` word lookups and recursive subtree traversals for prefix autocomplete.

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

> **Tip**
>
> Tries trade memory for speed aggressively. If space matters, a **radix tree** (compressed trie) collapses every chain of single-child nodes into one edge holding a whole substring — this is what IP routing tables and Git's object store use.

**Top Interview Question 2**

*Given a dictionary of roots and a sentence, replace every word that has a root as its prefix with the *shortest* such root. For roots `["cat", "bat", "rat"]` and the sentence `"the cattle was rattled by the battery"`, the answer is `"the cat was rat by the bat"`.*

Checking every word against every root is `O(words × roots × length)`. A trie collapses that: walk the word's characters down the trie and stop at the first node flagged as end-of-word. Because you stop at the first flag, you automatically get the shortest root — no comparison needed.

**Answer — replace words with their roots**

```python
def replace_words(roots, sentence):
    """O(total characters). Uses the Trie class from above."""
    trie = Trie()
    for root in roots:
        trie.insert(root)

    def shortest_root(word):
        node = trie
        for i, ch in enumerate(word):
            node = node.children.get(ch)
            if node is None:
                return word             # no root is a prefix of this word
            if node.is_word:
                return word[:i + 1]     # first flag hit = SHORTEST root
        return word

    return " ".join(shortest_root(w) for w in sentence.split())

print(replace_words(["cat", "bat", "rat"],
                    "the cattle was rattled by the battery"))
# 'the cat was rat by the bat'
```

```javascript
function replaceWords(roots, sentence) {    // O(total characters)
  const trie = new Trie();
  for (const root of roots) trie.insert(root);

  const shortestRoot = (word) => {
    let node = trie;
    for (let i = 0; i < word.length; i++) {
      node = node.children.get(word[i]);
      if (!node) return word;               // no root prefixes this word
      if (node.isWord) return word.slice(0, i + 1);   // first flag = shortest
    }
    return word;
  };

  return sentence.split(" ").map(shortestRoot).join(" ");
}

console.log(replaceWords(["cat", "bat", "rat"],
                         "the cattle was rattled by the battery"));
// 'the cat was rat by the bat'
```

**Top Interview Question 3**

*Design a dictionary supporting `add_word` and `search`, where a search string may contain `.` as a wildcard matching any single character.*

Adding is an ordinary trie insert. The wildcard is what makes it interesting: at a `.` the walk is no longer a single path, so the search has to branch into *every* child and succeed if any branch does — a depth-first search over the trie. A concrete word costs `O(L)`; a query that is all wildcards degrades to `O(26^L)`, which is worth stating out loud.

**Answer — design add and search words**

```python
class WordDictionary:
    """add: O(L). search: O(L) with no wildcards, branching at each '.'."""

    def __init__(self):
        self._children = {}
        self._is_word = False

    def add_word(self, word):
        node = self
        for ch in word:
            node = node._children.setdefault(ch, WordDictionary())
        node._is_word = True

    def search(self, pattern, index=0):
        if index == len(pattern):
            return self._is_word        # only a complete word counts
        ch = pattern[index]
        if ch == ".":                   # wildcard: try every child
            return any(child.search(pattern, index + 1)
                       for child in self._children.values())
        child = self._children.get(ch)
        return child is not None and child.search(pattern, index + 1)

d = WordDictionary()
for w in ("bad", "dad", "mad"):
    d.add_word(w)
print(d.search("pad"), d.search("bad"), d.search(".ad"), d.search("b.."))
# False True True True
```

```javascript
class WordDictionary {                  // add: O(L); '.' branches the search
  constructor() {
    this.children = new Map();
    this.isWord = false;
  }

  addWord(word) {
    let node = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new WordDictionary());
      node = node.children.get(ch);
    }
    node.isWord = true;
  }

  search(pattern, index = 0) {
    if (index === pattern.length) return this.isWord;
    const ch = pattern[index];
    if (ch === ".") {                   // wildcard: any child may match
      for (const child of this.children.values()) {
        if (child.search(pattern, index + 1)) return true;
      }
      return false;
    }
    const child = this.children.get(ch);
    return child ? child.search(pattern, index + 1) : false;
  }
}

const d = new WordDictionary();
["bad", "dad", "mad"].forEach((w) => d.addWord(w));
console.log(d.search("pad"), d.search("bad"), d.search(".ad"), d.search("b.."));
// false true true true
```

<a id="trieset-and-triemap"></a>

### TrieSet & TrieMap — using a trie as a collection

A basic trie already answers "is this word present?" — that is a **set**. Attach a value to each end-of-word node and the same structure becomes a **map**. These specialised collections are called **TrieSet** and **TrieMap**.

1. **TrieSet** — a set of strings backed by a trie. Supports `add`, `contains`, and `remove` in `O(L)` (key length), plus prefix queries that `HashSet` and `TreeSet` cannot do efficiently.
2. **TrieMap** — a map from string keys to arbitrary values. Each end-of-word node stores the associated value. Supports `put`, `get`, `delete` in `O(L)`, plus `keysWithPrefix(prefix)` and `longestPrefixOf(query)`.

#### Language support

1. **Scala** — ships `scala.collection.concurrent.TrieMap`, a lock-free concurrent hash-trie (note: this is a hash-array-mapped trie, not a string prefix trie).
2. **Java / C++ / Python / JavaScript** — no built-in trie collection. You build one from scratch (as shown above) or use libraries like `datrie` (Python), `marisa-trie` (Python/C++), or `trie-prefix-tree` (npm).

#### When to use a TrieSet / TrieMap over a HashMap

A `HashMap` with string keys gives `O(L)` average-case lookup (hashing the key costs `O(L)`), so raw lookup speed is similar. Choose a TrieMap / TrieSet when you need operations that hash tables **cannot** do:

1. **Prefix search** — "give me all keys starting with `pre`" in `O(P + K)` where `P` is the prefix length and `K` is the number of matches.
2. **Autocomplete / typeahead** — walk the trie to the prefix node, then DFS the subtree to collect completions.
3. **Longest prefix matching** — "what is the longest stored key that is a prefix of this query?" Used in IP routing tables and URL routers.
4. **Lexicographic ordering** — a DFS of the trie yields all keys in sorted order without a separate sort step.
5. **Shared-prefix compression** — when many keys share long prefixes (URLs, file paths, DNS names), a trie uses less memory than storing each key independently.

> **Rule of thumb:** if the keys are strings and the problem involves prefixes, autocomplete, wildcard matching, or longest-prefix routing — use a TrieMap / TrieSet. For arbitrary key types or pure key-value lookup, stick to `HashMap`.

**Worked example — TrieMap in action**

*Build a `TrieMap` that maps string keys to integer values. Support `put(key, value)`, `get(key)`, and `keys_with_prefix(prefix)` — return all key-value pairs whose key starts with `prefix`.*

This extends the basic trie from above: each end-of-word node stores a value instead of just a boolean flag. The prefix-collection walk is unchanged — DFS the subtree and collect nodes that carry a value.

**Answer — TrieMap with prefix lookup**

```python
class TrieMap:
    """A string-keyed map backed by a trie. O(L) put/get, O(P+K) prefix query."""
    def __init__(self):
        self.children = {}
        self.value = None                # None means 'no entry here'
        self._has_value = False

    def put(self, key, value):           # O(L)
        node = self
        for ch in key:
            node = node.children.setdefault(ch, TrieMap())
        node.value = value
        node._has_value = True

    def get(self, key, default=None):    # O(L)
        node = self
        for ch in key:
            node = node.children.get(ch)
            if node is None:
                return default
        return node.value if node._has_value else default

    def keys_with_prefix(self, prefix):  # O(P + K)
        node = self
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return []
        results = []
        node._collect(prefix, results)
        return results

    def _collect(self, path, results):
        if self._has_value:
            results.append((path, self.value))
        for ch, child in sorted(self.children.items()):
            child._collect(path + ch, results)


tm = TrieMap()
for key, val in [("apple", 1), ("app", 2), ("apricot", 3), ("banana", 4)]:
    tm.put(key, val)

print(tm.get("app"))                    # 2
print(tm.get("ap"))                     # None — not a stored key
print(tm.keys_with_prefix("ap"))        # [('app', 2), ('apple', 1), ('apricot', 3)]
print(tm.keys_with_prefix("ban"))       # [('banana', 4)]
print(tm.keys_with_prefix("z"))         # []
```

```javascript
class TrieMap {                                // O(L) put/get, O(P+K) prefix query
  constructor() {
    this.children = new Map();
    this.value = undefined;
    this._hasValue = false;
  }

  put(key, value) {                            // O(L)
    let node = this;
    for (const ch of key) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieMap());
      node = node.children.get(ch);
    }
    node.value = value;
    node._hasValue = true;
  }

  get(key) {                                   // O(L)
    let node = this;
    for (const ch of key) {
      node = node.children.get(ch);
      if (!node) return undefined;
    }
    return node._hasValue ? node.value : undefined;
  }

  keysWithPrefix(prefix) {                     // O(P + K)
    let node = this;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return [];
    }
    const results = [];
    node._collect(prefix, results);
    return results;
  }

  _collect(path, results) {
    if (this._hasValue) results.push([path, this.value]);
    for (const [ch, child] of [...this.children.entries()].sort()) {
      child._collect(path + ch, results);
    }
  }
}

const tm = new TrieMap();
for (const [k, v] of [["apple", 1], ["app", 2], ["apricot", 3], ["banana", 4]]) {
  tm.put(k, v);
}

console.log(tm.get("app"));                    // 2
console.log(tm.get("ap"));                     // undefined
console.log(tm.keysWithPrefix("ap"));          // [['app',2],['apple',1],['apricot',3]]
console.log(tm.keysWithPrefix("ban"));         // [['banana',4]]
console.log(tm.keysWithPrefix("z"));           // []
```

<a id="21-union-find"></a>

## 21. Union-Find

- **Find / union** `O(α(n))` — effectively constant
- **Space** `O(n)`
- **Answers** "are these two in the same group?"

Union-Find (a disjoint-set union, or DSU) maintains a collection of non-overlapping groups under two operations: `find(x)` returns a representative of `x`'s group, and `union(a, b)` merges two groups. Two elements are connected exactly when their representatives are identical.

Two optimisations turn a potentially `O(n)` structure into an effectively constant one. **Union by rank/size** always attaches the smaller tree under the larger, keeping trees shallow. **Path compression** flattens the path to the root during every `find`. Together they give `O(α(n))` amortised, where `α` is the inverse Ackermann function — less than 5 for any input that fits in the universe.

> **Interactive animation:** `dsu` — rendered by the page script in the HTML version.

**Top Interview Question 1**

*How do path compression and union by rank optimize disjoint-set operations?*

Maintain parent pointers representing sets; during `find`, compress paths directly to the root, and during `union`, attach shallower trees beneath deeper ones to achieve near-constant `O(α(n))` amortized time.

**Union-Find, fully optimised**

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))    # every element is its own root
        self.rank = [0] * n             # upper bound on tree height
        self.count = n                  # number of disjoint groups

    def find(self, x):
        """Path compression: point every node on the path at the root."""
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:   # second pass re-points the path
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        """Union by rank. Returns False if they were already connected."""
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                # already together - a cycle edge
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra            # attach the shallower under the deeper
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.count -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)

def count_islands(grid):
    """Connected components in a grid, via DSU. O(rows * cols * a(n))."""
    rows, cols = len(grid), len(grid[0])
    dsu = UnionFind(rows * cols)
    water = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 0:
                water += 1
                continue
            for dr, dc in ((1, 0), (0, 1)):     # right and down is enough
                nr, nc = r + dr, c + dc
                if nr < rows and nc < cols and grid[nr][nc] == 1:
                    dsu.union(r * cols + c, nr * cols + nc)
    return dsu.count - water

uf = UnionFind(7)
uf.union(0, 1); uf.union(2, 3); uf.union(1, 3)
print(uf.connected(0, 3), uf.count)     # True 4
```

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.count = n;                     // number of disjoint groups
  }

  find(x) {                             // with path compression
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[x] !== root) {   // flatten the path
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(a, b) {                         // union by rank
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false;        // already connected -> cycle edge
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.count--;
    return true;
  }

  connected(a, b) {
    return this.find(a) === this.find(b);
  }
}

const uf = new UnionFind(7);
uf.union(0, 1);
uf.union(2, 3);
uf.union(1, 3);
console.log(uf.connected(0, 3), uf.count);   // true 4
```

**Top Interview Question 2**

*You are given an `n × n` matrix where `grid[i][j] = 1` means city `i` and city `j` are directly connected. A province is a group of cities connected directly or indirectly. How many provinces are there?*

This is Union-Find's home territory: you are told about connections one at a time and asked how many groups survive. Union every connected pair, and the answer is simply how many groups remain — which the structure already tracks in `count`.

Only the upper triangle needs scanning, since the matrix is symmetric and `union` is order-independent.

**Answer — count provinces**

```python
def count_provinces(grid):
    """O(n^2 * a(n)) - one union attempt per pair. Uses UnionFind from above."""
    n = len(grid)
    uf = UnionFind(n)

    for i in range(n):
        for j in range(i + 1, n):       # upper triangle: the matrix is symmetric
            if grid[i][j] == 1:
                uf.union(i, j)          # already-connected pairs are a no-op

    return uf.count                     # groups left after every merge

print(count_provinces([[1, 1, 0],
                       [1, 1, 0],
                       [0, 0, 1]]))     # 2
```

```javascript
function countProvinces(grid) {         // uses UnionFind from above
  const n = grid.length;
  const uf = new UnionFind(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {   // upper triangle - matrix is symmetric
      if (grid[i][j] === 1) uf.union(i, j);
    }
  }
  return uf.count;                      // groups remaining after every merge
}

console.log(countProvinces([[1, 1, 0],
                            [1, 1, 0],
                            [0, 0, 1]]));   // 2
```

> **Interview**
>
> **Recognition signal:** connectivity, grouping, "number of provinces/islands/components", detecting a cycle while adding edges, accounts merge, or Kruskal's MST. Union-Find is the right answer whenever edges arrive incrementally and you only ever *merge* groups — it cannot split them again.

**Top Interview Question 3**

*A tree of `n` nodes had one extra edge added, creating exactly one cycle. Given the edge list, return the edge that can be removed — the last one in the input if several qualify.*

A DFS after every insertion re-walks the graph and lands at `O(n²)`. Union-find answers it in one pass: process edges in order and union each pair. The first edge whose two endpoints are **already in the same set** is the one that closed the cycle, so it is the answer. With path compression and union by rank the whole scan is effectively `O(n)`.

**Answer — redundant connection**

```python
def find_redundant_connection(edges):
    """Effectively O(n). The first edge joining two connected nodes is the cycle."""
    dsu = UnionFind(len(edges) + 1)     # nodes are labelled 1..n
    for a, b in edges:
        if not dsu.union(a, b):         # union returns False if already joined
            return [a, b]               # this edge closed the cycle
    return []

print(find_redundant_connection([[1, 2], [1, 3], [2, 3]]))   # [2, 3]
```

```javascript
function findRedundantConnection(edges) {   // effectively O(n)
  const dsu = new UnionFind(edges.length + 1);   // nodes are labelled 1..n
  for (const [a, b] of edges) {
    if (!dsu.union(a, b)) return [a, b];        // already connected -> the cycle
  }
  return [];
}

console.log(findRedundantConnection([[1, 2], [1, 3], [2, 3]]));   // [2, 3]
```

<a id="22-graph-representations"></a>

## 22. Graph Representations

- **Adjacency list** space `O(V + E)`
- **Adjacency matrix** space `O(V²)`
- **Edge lookup** list `O(deg)` vs matrix `O(1)`

A graph is just vertices and edges — the most general structure there is. Trees, linked lists, grids, road networks, dependency graphs, social networks and state machines are all graphs with extra constraints. Learning to *see* a problem as a graph is more than half the battle; once you do, four or five standard algorithms cover almost everything.

<a id="graph-vocabulary"></a>

### Vocabulary you need

1. **Directed vs undirected** — do edges have a direction? Twitter follows are directed; Facebook friendships are not.
2. **Weighted vs unweighted** — do edges carry a cost? Unweighted shortest path is BFS; weighted needs Dijkstra.
3. **Cyclic vs acyclic** — a directed acyclic graph (DAG) can be topologically sorted; a graph with cycles cannot.
4. **Dense vs sparse** — is `E ≈ V²` or `E ≈ V`? This decides your representation.
5. **Degree** — edges touching a vertex. In a directed graph, in-degree and out-degree are separate and both matter.

*Diagram labels:* 0 · 1 · 2 · 3 · adjacency list — O(V + E) · 0 → [1, 2] · 1 → [0, 2, 3] · 2 → [0, 1] · 3 → [1] · iterate neighbours fast; default choice · adjacency matrix — O(V²) · 0 1 1 0 · row 0 · 1 0 1 1 · 1 1 0 0 · O(1) "is there an edge?" · wasteful when sparse

*Use an adjacency list unless the graph is dense or you need constant-time edge existence checks.*

**Question**

*How do you construct and represent an adjacency list for unweighted and weighted graphs?*

An adjacency list associates each vertex with an array of its neighbors (and edge weights for weighted graphs), providing efficient \(O(V + E)\) space complexity and fast neighbor lookups.

**Adjacency list — unweighted and weighted**

```python
from collections import defaultdict

def build_undirected(n, edges):
    """Adjacency list. O(V + E) space."""
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)      # drop this line for a DIRECTED graph
    return graph

def build_weighted(n, edges):
    """edges = [(a, b, weight)] -> {node: [(neighbour, weight)]}"""
    graph = defaultdict(list)
    for a, b, w in edges:
        graph[a].append((b, w))
        graph[b].append((a, w))
    return graph
```

```javascript
function buildUndirected(edges) {       // Map<node, node[]>, O(V + E)
  const graph = new Map();
  const add = (a, b) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a).push(b);
  };
  for (const [a, b] of edges) {
    add(a, b);
    add(b, a);                          // omit for a DIRECTED graph
  }
  return graph;
}

function buildWeighted(edges) {         // edges: [a, b, weight]
  const graph = new Map();
  const add = (a, b, w) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a).push([b, w]);
  };
  for (const [a, b, w] of edges) {
    add(a, b, w);
    add(b, a, w);
  }
  return graph;
}
```

**Question**

*How do you represent a graph using an adjacency matrix?*

The matrix representation trades memory for a constant-time "is there an edge?" test. It is the right choice only when the graph is dense, or when an algorithm indexes edges directly — Floyd-Warshall being the obvious case.

**Adjacency matrix**

```python
def build_matrix(n, edges):
    """O(V^2) space; good for dense graphs and Floyd-Warshall."""
    matrix = [[0] * n for _ in range(n)]
    for a, b in edges:
        matrix[a][b] = matrix[b][a] = 1
    return matrix
```

```javascript
function buildMatrix(n, edges) {        // O(V^2)
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [a, b] of edges) {
    matrix[a][b] = 1;
    matrix[b][a] = 1;
  }
  return matrix;
}
```

**Question**

*How do you model and traverse a 2D grid as an implicit graph?*

Grids need no builder at all. Each cell is a vertex and its edges are implicit in the four compass offsets — which is why so many "matrix" problems are really graph traversals in disguise.

**A grid as an implicit graph**

```python
# A grid IS a graph: each cell is a vertex with up to four edges.
DIRECTIONS = ((-1, 0), (1, 0), (0, -1), (0, 1))

def grid_neighbours(grid, r, c):
    for dr, dc in DIRECTIONS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
            yield nr, nc
```

```javascript
// A grid is a graph with implicit edges.
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function* gridNeighbours(grid, r, c) {
  for (const [dr, dc] of DIRECTIONS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
      yield [nr, nc];
    }
  }
}
```

**Top Interview Question 1**

*Given a reference to a node in a connected undirected graph, return a deep copy of the whole graph. Every node holds a value and a list of neighbours.*

The difficulty is not the traversal — it is the **cycles**. Copying naively recurses forever, because `A`'s neighbour is `B` and `B`'s neighbour is `A`.

The fix is a map from *original node* to *its copy*. It does double duty: it is the visited set that stops the recursion, and it is how you find the already-made copy to wire up as a neighbour. Create the copy and record it in the map **before** recursing, or you loop.

**Answer — clone an undirected graph**

```python
def clone_graph(node):
    """O(V + E). The map is both the visited set and the original -> copy index."""
    if node is None:
        return None
    copies = {}                     # original node -> its clone

    def dfs(original):
        if original in copies:
            return copies[original]         # already cloned - stops cycles
        clone = Node(original.value)
        copies[original] = clone            # record BEFORE recursing
        for neighbour in original.neighbours:
            clone.neighbours.append(dfs(neighbour))
        return clone

    return dfs(node)
```

```javascript
function cloneGraph(node) {         // O(V + E)
  if (!node) return null;
  const copies = new Map();         // original node -> its clone

  const dfs = (original) => {
    if (copies.has(original)) return copies.get(original);   // stops cycles
    const clone = { value: original.value, neighbours: [] };
    copies.set(original, clone);    // record BEFORE recursing
    for (const neighbour of original.neighbours) {
      clone.neighbours.push(dfs(neighbour));
    }
    return clone;
  };

  return dfs(node);
}
```

**Top Interview Question 2**

*A grid of `"1"` (land) and `"0"` (water) is given. Count the islands — groups of land connected horizontally or vertically.*

This is the question that turns a grid into a graph: every cell is a vertex and its four neighbours are its edges. Scan for an unvisited land cell, then flood the whole island with DFS or BFS so it is never counted twice; the number of times you had to start a flood is the number of islands. Sinking each visited cell to `"0"` avoids a separate visited set. `O(rows × cols)`.

**Answer — number of islands**

```python
def num_islands(grid):
    """O(rows * cols). Each cell is visited once and then sunk."""
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != "1":
            return                      # off the grid, or water/already visited
        grid[r][c] = "0"                # sinking IS the visited marker
        sink(r + 1, c); sink(r - 1, c)
        sink(r, c + 1); sink(r, c - 1)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":       # a brand new island
                islands += 1
                sink(r, c)
    return islands

print(num_islands([list("11000"), list("11000"), list("00100")]))   # 2
```

```javascript
function numIslands(grid) {             // O(rows * cols)
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;

  const sink = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";                   // sinking IS the visited marker
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };

  let islands = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") { islands++; sink(r, c); }
    }
  }
  return islands;
}

// On a very large grid, swap the recursion for a BFS queue: the DFS stack can
// reach rows * cols deep and overflow.
```

**Top Interview Question 3**

*In a board of `"X"` and `"O"`, flip every region of `"O"`s that is completely surrounded by `"X"`s. A region touching the border is not surrounded and must survive.*

Testing each region for "does it touch the border?" repeats work. Invert the problem: start from the border `"O"`s only and mark everything reachable from them as **safe**. Whatever is still `"O"` afterwards must be enclosed, so flip it. Two sweeps and one flood, `O(rows × cols)`. Working from the guaranteed-safe boundary inwards is a pattern that reappears in many grid questions.

**Answer — surrounded regions**

```python
def solve_surrounded(board):
    """O(rows * cols). Flood from the border, then flip whatever is left."""
    if not board:
        return
    rows, cols = len(board), len(board[0])

    def mark_safe(r, c):
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != "O":
            return
        board[r][c] = "S"               # reachable from the border -> safe
        mark_safe(r + 1, c); mark_safe(r - 1, c)
        mark_safe(r, c + 1); mark_safe(r, c - 1)

    for r in range(rows):               # every border cell is a starting point
        mark_safe(r, 0); mark_safe(r, cols - 1)
    for c in range(cols):
        mark_safe(0, c); mark_safe(rows - 1, c)

    for r in range(rows):
        for c in range(cols):
            board[r][c] = "O" if board[r][c] == "S" else "X"

grid = [list("XXXX"), list("XOOX"), list("XXOX"), list("XOXX")]
solve_surrounded(grid)
print(["".join(row) for row in grid])
# ['XXXX', 'XXXX', 'XXXX', 'XOXX']   - only the border-touching O survives
```

```javascript
function solveSurrounded(board) {       // O(rows * cols)
  if (!board.length) return;
  const rows = board.length, cols = board[0].length;

  const markSafe = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== "O") return;
    board[r][c] = "S";                  // reachable from the border -> safe
    markSafe(r + 1, c); markSafe(r - 1, c);
    markSafe(r, c + 1); markSafe(r, c - 1);
  };

  for (let r = 0; r < rows; r++) { markSafe(r, 0); markSafe(r, cols - 1); }
  for (let c = 0; c < cols; c++) { markSafe(0, c); markSafe(rows - 1, c); }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      board[r][c] = board[r][c] === "S" ? "O" : "X";
    }
  }
}
```

<a id="23-graph-traversal"></a>

## 23. Graph Traversal

- **BFS & DFS** `O(V + E)`
- **BFS space** `O(V)` queue
- **DFS space** `O(h)` stack

BFS and DFS are the same algorithm with one difference: BFS takes the *oldest* item from the frontier (a queue), DFS takes the *newest* (a stack). Swap the container and the behaviour flips completely. Both visit every reachable vertex once and every edge once, so both are `O(V + E)`.

> **Analogy** 💧
>
> **Picture it — a pebble dropped in a pond**
>
> BFS spreads outward in expanding rings, finishing every point one step away before touching anything two steps away. That is why the first time it reaches your target it has necessarily arrived by the shortest route. DFS is the opposite instinct: pick a direction and run until you hit a wall.

The single thing you must not forget on a graph — as opposed to a tree — is the **visited set**. Graphs have cycles; without it you loop forever.

<a id="which-one-to-use"></a>

### Which one to use

1. **BFS** — shortest path in an *unweighted* graph, level-by-level processing, "minimum number of steps/moves", finding the nearest match, word ladders, flood fill from multiple sources.
2. **DFS** — does a path exist, connected components, cycle detection, topological sort, strongly connected components, and anything where you need to explore a full branch before backtracking.

**Question**

*How do you traverse an unweighted graph level-by-level using Breadth-First Search (BFS)?*

Starting from a given node, enqueue it, mark it visited immediately upon enqueueing to avoid duplicates, and process each node's unvisited neighbors in FIFO order.

> **Interactive animation:** `graph-traversal` (option=bfs) — rendered by the page script in the HTML version.

**Breadth-first search**

```python
from collections import deque

def bfs(graph, start):
    """Visit order plus the distance (in edges) from start. O(V + E)."""
    visited = {start}
    dist = {start: 0}
    order = []
    q = deque([start])

    while q:
        node = q.popleft()              # OLDEST first -> breadth first
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)  # mark on ENQUEUE, not on dequeue,
                dist[neighbour] = dist[node] + 1   # or nodes enter twice
                q.append(neighbour)

    return order, dist
```

```javascript
function bfs(graph, start) {            // O(V + E)
  const visited = new Set([start]);
  const dist = new Map([[start, 0]]);
  const order = [];
  const queue = [start];
  let head = 0;                         // index instead of shift() - O(1)

  while (head < queue.length) {
    const node = queue[head++];         // OLDEST first
    order.push(node);
    for (const neighbour of graph.get(node) ?? []) {
      if (visited.has(neighbour)) continue;
      visited.add(neighbour);           // mark on ENQUEUE
      dist.set(neighbour, dist.get(node) + 1);
      queue.push(neighbour);
    }
  }
  return { order, dist };
}
```

**Question**

*How do you traverse deep into a graph recursively using Depth-First Search (DFS)?*

DFS dives along each branch until it hits a dead end or an already-visited vertex before backtracking. By relying on the call stack, each recursive call visits an unvisited neighbour. A `visited` set is mandatory on graphs to prevent infinite loops in cycles.

**Depth-first search (recursive)**

```python
def dfs_recursive(graph, start):
    """Recursive DFS: uses the system call stack. O(V + E) time, O(V) space."""
    visited = set()
    order = []

    def dfs(node):
        visited.add(node)
        order.append(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                dfs(neighbour)

    dfs(start)
    return order

# Undirected graph traversal from 'A'
print(dfs_recursive({"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "D"], "D": ["B", "C"]}, "A"))
# ['A', 'B', 'D', 'C']
```

```javascript
function dfsRecursive(graph, start) {   // O(V + E) time, O(V) space
  const visited = new Set();
  const order = [];

  function dfs(node) {
    visited.add(node);
    order.push(node);
    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        dfs(neighbour);
      }
    }
  }

  dfs(start);
  return order;
}

const graph = new Map([
  ["A", ["B", "C"]],
  ["B", ["A", "D"]],
  ["C", ["A", "D"]],
  ["D", ["B", "C"]],
]);
console.log(dfsRecursive(graph, "A"));  // ['A', 'B', 'D', 'C']
```

**Question**

*How do you traverse deep into a graph iteratively using a stack (DFS)?*

Swap the queue for a stack and the identical loop becomes depth-first. Note the `reversed` push order: pushing neighbours in reverse means they *pop* in the original order, so the walk matches the recursive version.

> **Interactive animation:** `graph-traversal` (option=dfs) — rendered by the page script in the HTML version.

**Depth-first search (iterative)**

```python
def dfs_iterative(graph, start):
    """Same shape, but a stack. O(V + E)."""
    visited = set()
    order = []
    stack = [start]

    while stack:
        node = stack.pop()              # NEWEST first -> depth first
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
function dfsIterative(graph, start) {   // O(V + E)
  const visited = new Set();
  const order = [];
  const stack = [start];

  while (stack.length) {
    const node = stack.pop();           // NEWEST first
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

**Question**

*How do you reconstruct the shortest path between two nodes in an unweighted graph?*

Recording a **parent pointer** as each node is discovered turns BFS into a shortest-path finder. Because BFS reaches every node by the fewest edges, the first time you see the goal you already have the optimal route — just walk the parents backwards.

**Shortest path reconstruction (unweighted)**

```python
from collections import deque

def shortest_path(graph, start, goal):
    """BFS + parent pointers. Optimal for UNWEIGHTED graphs only."""
    if start == goal:
        return [start]
    parent = {start: None}
    q = deque([start])

    while q:
        node = q.popleft()
        for neighbour in graph[node]:
            if neighbour in parent:
                continue
            parent[neighbour] = node
            if neighbour == goal:       # first time we see it = shortest
                path = [goal]
                while path[-1] is not None and parent[path[-1]] is not None:
                    path.append(parent[path[-1]])
                return path[::-1]
            q.append(neighbour)

    return None                         # unreachable
```

```javascript
function shortestPath(graph, start, goal) {   // unweighted only
  if (start === goal) return [start];
  const parent = new Map([[start, null]]);
  const queue = [start];
  let head = 0;

  while (head < queue.length) {
    const node = queue[head++];
    for (const neighbour of graph.get(node) ?? []) {
      if (parent.has(neighbour)) continue;
      parent.set(neighbour, node);
      if (neighbour === goal) {         // first sighting = shortest
        const path = [goal];
        while (parent.get(path.at(-1)) !== null) path.push(parent.get(path.at(-1)));
        return path.reverse();
      }
      queue.push(neighbour);
    }
  }
  return null;                          // unreachable
}
```

**Question**

*How do you find all connected components in an undirected graph?*

Start a fresh traversal from every unvisited node. Each new start is one more disconnected piece, and the flood fill claims everything reachable from it.

**Connected components**

```python
def connected_components(graph, nodes):
    """How many separate pieces does the graph have?"""
    seen, components = set(), 0
    for node in nodes:
        if node in seen:
            continue
        components += 1                 # a node we have never reached
        stack = [node]
        while stack:                    # flood the whole component
            cur = stack.pop()
            if cur in seen:
                continue
            seen.add(cur)
            stack.extend(graph[cur])
    return components
```

```javascript
function connectedComponents(graph, nodes) {
  const seen = new Set();
  let components = 0;

  for (const node of nodes) {
    if (seen.has(node)) continue;
    components++;                       // a node we have never reached
    const stack = [node];
    while (stack.length) {              // flood the whole component
      const cur = stack.pop();
      if (seen.has(cur)) continue;
      seen.add(cur);
      stack.push(...(graph.get(cur) ?? []));
    }
  }
  return components;
}
```

<a id="cycle-detection"></a>

### Cycle detection

**Top Interview Question 1**

*How do you detect a cycle in an undirected graph using DFS?*

In an undirected graph, every edge is bidirectional. As DFS explores from `node` to `neighbour`, if `neighbour` has already been visited and is **not the parent** we just came from, an alternative path connects them — proving a **cycle exists**.

**Cycle detection in an undirected graph**

```python
def has_cycle_undirected(graph, nodes):
    """DFS with parent tracking. O(V + E) time, O(V) space."""
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for neighbour in graph[node]:
            if neighbour not in visited:
                if dfs(neighbour, node):
                    return True
            elif neighbour != parent:   # visited and not parent -> cycle
                return True
        return False

    for node in nodes:
        if node not in visited:
            if dfs(node, None):
                return True
    return False

# A -- B -- C -- A  (has cycle)
print(has_cycle_undirected({"A": ["B", "C"], "B": ["A", "C"], "C": ["A", "B"]}, ["A", "B", "C"]))  # True
# A -- B -- C  (no cycle)
print(has_cycle_undirected({"A": ["B"], "B": ["A", "C"], "C": ["B"]}, ["A", "B", "C"]))            # False
```

```javascript
function hasCycleUndirected(graph, nodes) {  // O(V + E) time, O(V) space
  const visited = new Set();

  function dfs(node, parent) {
    visited.add(node);
    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        if (dfs(neighbour, node)) return true;
      } else if (neighbour !== parent) {
        return true;                    // visited and not parent -> cycle
      }
    }
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node, null)) return true;
    }
  }
  return false;
}
```

**Top Interview Question 2**

*How do you detect a cycle in a directed graph using DFS (three-state / recursion stack)?*

In a directed graph, visiting an already-visited vertex does *not* imply a cycle (it could be a cross edge or forward edge). A cycle exists if and only if DFS encounters a node that is currently on the **active recursion stack** (a back edge). We track 3 states: `0 = unvisited` (WHITE), `1 = visiting` / on call stack (GREY), and `2 = visited` / completely explored (BLACK).

**Cycle detection in a directed graph**

```python
def has_cycle_directed(graph, nodes):
    """Detect directed cycle via 3 states: 0=unvisited, 1=on stack, 2=done. O(V + E)."""
    state = {node: 0 for node in nodes}

    def dfs(node):
        state[node] = 1                 # push onto recursion stack
        for neighbour in graph[node]:
            if state[neighbour] == 1:   # back edge -> cycle!
                return True
            if state[neighbour] == 0 and dfs(neighbour):
                return True
        state[node] = 2                 # pop from stack / fully explored
        return False

    for node in nodes:
        if state[node] == 0:
            if dfs(node):
                return True
    return False

# 0 -> 1 -> 2 -> 0 (cycle)
print(has_cycle_directed({0: [1], 1: [2], 2: [0]}, [0, 1, 2]))       # True
# 0 -> 1, 0 -> 2 (DAG - no cycle)
print(has_cycle_directed({0: [1, 2], 1: [], 2: []}, [0, 1, 2]))       # False
```

```javascript
function hasCycleDirected(graph, nodes) {  // O(V + E) time, O(V) space
  // 0 = unvisited, 1 = visiting (on call stack), 2 = finished
  const state = new Map(nodes.map((n) => [n, 0]));

  function dfs(node) {
    state.set(node, 1);
    for (const neighbour of graph.get(node) ?? []) {
      if (state.get(neighbour) === 1) return true;  // back edge
      if (state.get(neighbour) === 0 && dfs(neighbour)) return true;
    }
    state.set(node, 2);
    return false;
  }

  for (const node of nodes) {
    if (state.get(node) === 0) {
      if (dfs(node)) return true;
    }
  }
  return false;
}
```

<a id="bipartite-graph"></a>

### Bipartite graph verification

**Top Interview Question 3**

*How do you determine if a graph is bipartite (2-colorable) using traversal?*

A graph is **bipartite** if vertices can be split into two sets such that no two adjacent nodes share the same set — which is mathematically equivalent to the graph having **no odd-length cycles**. We 2-color the graph during BFS: assign color 0 to the source, and for every neighbour, assign color `1 - color[u]`. If an adjacent neighbour already has the *same* color, the graph cannot be bipartite.

**Bipartite graph verification (2-coloring)**

```python
from collections import deque

def is_bipartite(graph, nodes):
    """2-coloring via BFS. O(V + E) time, O(V) space."""
    color = {}                          # node -> 0 or 1

    for start in nodes:
        if start in color:
            continue
        color[start] = 0
        q = deque([start])

        while q:
            node = q.popleft()
            for neighbour in graph[node]:
                if neighbour not in color:
                    color[neighbour] = 1 - color[node]
                    q.append(neighbour)
                elif color[neighbour] == color[node]:
                    return False        # same color on adjacent nodes -> odd cycle!

    return True

# Triangle: 3 nodes all connected (odd cycle of length 3)
print(is_bipartite({"A": ["B", "C"], "B": ["A", "C"], "C": ["A", "B"]}, ["A", "B", "C"]))  # False
# Square: A-B-C-D-A (even cycle of length 4)
print(is_bipartite({"A": ["B", "D"], "B": ["A", "C"], "C": ["B", "D"], "D": ["A", "C"]}, ["A", "B", "C", "D"]))  # True
```

```javascript
function isBipartite(graph, nodes) {    // O(V + E) time, O(V) space
  const color = new Map();              // node -> 0 or 1

  for (const start of nodes) {
    if (color.has(start)) continue;
    color.set(start, 0);
    const queue = [start];
    let head = 0;

    while (head < queue.length) {
      const node = queue[head++];
      const nextColor = 1 - color.get(node);
      for (const neighbour of graph.get(node) ?? []) {
        if (!color.has(neighbour)) {
          color.set(neighbour, nextColor);
          queue.push(neighbour);
        } else if (color.get(neighbour) === color.get(node)) {
          return false;                 // adjacent vertices share color
        }
      }
    }
  }
  return true;
}
```

<a id="all-paths"></a>

### All paths from source to target

**Top Interview Question 4**

*How do you find all simple paths between two nodes using DFS with backtracking?*

Standard graph traversal marks a vertex as visited permanently. To find **all distinct paths** from source to target, we use **backtracking**: add the node to the current path, mark it visited, recursively explore all unvisited neighbours, and upon return, *unmark* (backtrack) the node so alternative routes can traverse through it.

**All paths from source to target (backtracking)**

```python
def all_paths_source_target(graph, source, target):
    """DFS with backtracking to find every simple path. O(2^V * V)."""
    results = []
    path = [source]
    visited = {source}

    def dfs(node):
        if node == target:
            results.append(list(path))
            return
        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                path.append(neighbour)
                dfs(neighbour)
                path.pop()                  # backtrack path
                visited.remove(neighbour)   # backtrack visited set

    dfs(source)
    return results

# Paths from 0 to 3 in graph 0->1->3, 0->2->3
print(all_paths_source_target({0: [1, 2], 1: [3], 2: [3], 3: []}, 0, 3))
# [[0, 1, 3], [0, 2, 3]]
```

```javascript
function allPathsSourceTarget(graph, source, target) {
  const results = [];
  const path = [source];
  const visited = new Set([source]);

  function dfs(node) {
    if (node === target) {
      results.push([...path]);
      return;
    }
    for (const neighbour of graph.get(node) ?? []) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        path.push(neighbour);
        dfs(neighbour);
        path.pop();                     // backtrack path
        visited.delete(neighbour);      // backtrack visited set
      }
    }
  }

  dfs(source);
  return results;
}

const graph = new Map([
  [0, [1, 2]],
  [1, [3]],
  [2, [3]],
  [3, []],
]);
console.log(allPathsSourceTarget(graph, 0, 3));  // [[0, 1, 3], [0, 2, 3]]
```

<a id="multi-source-bfs"></a>

### Multi-source BFS

**Question**

*How do you simulate simultaneous multi-source wave propagation using BFS?*

Seed the queue with *several* starting nodes at distance 0 and BFS normally. Every node then learns its distance to the *nearest* source in a single `O(V + E)` pass, rather than one BFS per source. Rotting oranges, nearest exit from a maze, and "distance to the closest 0 in a matrix" are all solved this way.

**Multi-source BFS on a grid**

```python
from collections import deque

def minutes_to_rot_all(grid):
    """2 = rotten, 1 = fresh, 0 = empty. Returns minutes, or -1."""
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c, 0))     # EVERY rotten orange is a source
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while q:
        r, c, t = q.popleft()
        minutes = max(minutes, t)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2        # mark immediately to avoid duplicates
                fresh -= 1
                q.append((nr, nc, t + 1))

    return minutes if fresh == 0 else -1

print(minutes_to_rot_all([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))    # 4
```

```javascript
function minutesToRotAll(grid) {        // 2 rotten, 1 fresh, 0 empty
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [];
  let head = 0;
  let fresh = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c, 0]);   // every source at once
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  while (head < queue.length) {
    const [r, c, t] = queue[head++];
    minutes = Math.max(minutes, t);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
        grid[nr][nc] = 2;               // mark on enqueue
        fresh--;
        queue.push([nr, nc, t + 1]);
      }
    }
  }
  return fresh === 0 ? minutes : -1;
}

console.log(minutesToRotAll([[2, 1, 1], [1, 1, 0], [0, 1, 1]]));   // 4
```

<a id="24-topological-sort"></a>

## 24. Topological Sort

- **Time** `O(V + E)`
- **Requires** a directed acyclic graph
- **Bonus** detects cycles for free

A topological order lists the vertices of a directed graph so that every edge points forwards. It answers "in what order can I do these tasks given their dependencies?" — build systems, course prerequisites, spreadsheet recalculation, package installation, and job scheduling are all topological sorts.

Such an order exists **if and only if the graph has no cycle**. A cycle means a circular dependency, and the algorithms below report it naturally: Kahn's algorithm finishes with vertices left over, and the DFS version finds a back edge.

```text
edges: shirt → tie → jacket socks → shoes pants → shoes, pants →
                belt

                in-degree: shirt 0 socks 0 pants 0 tie 1 belt 1 jacket 1 shoes 2

                queue starts with everything at in-degree 0: [shirt, socks, pants]
                take shirt → tie drops to 0 → queue [socks, pants, tie]
                take socks → shoes drops to 1
                take pants → shoes drops to 0, belt drops to 0
                ...
                valid order: shirt, socks, pants, tie, shoes, belt, jacket (not unique!)
```

**Top Interview Question 1**

*How do you find a topological ordering of a Directed Acyclic Graph (DAG) using Kahn's algorithm or DFS?*

Kahn's algorithm iteratively removes nodes with zero in-degree using a queue, while the DFS variant performs a post-order traversal and reverses the resulting list, also detecting cycles via three-color recursion tracking.

**Kahn's algorithm and the DFS variant**

```python
from collections import deque, defaultdict

def topo_sort_kahn(n, edges):
    """BFS-based. Returns an order, or None if there is a cycle. O(V + E)."""
    graph = defaultdict(list)
    in_degree = [0] * n
    for a, b in edges:              # edge a -> b means a must come first
        graph[a].append(b)
        in_degree[b] += 1

    # Anything with no unmet dependency can start immediately.
    q = deque(v for v in range(n) if in_degree[v] == 0)
    order = []

    while q:
        node = q.popleft()
        order.append(node)
        for neighbour in graph[node]:
            in_degree[neighbour] -= 1       # one dependency satisfied
            if in_degree[neighbour] == 0:
                q.append(neighbour)

    # If we could not place every vertex, the leftovers form a cycle.
    return order if len(order) == n else None

def topo_sort_dfs(n, edges):
    """DFS-based: a node is appended once all its descendants are done."""
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)

    WHITE, GREY, BLACK = 0, 1, 2        # unvisited / on the stack / finished
    colour = [WHITE] * n
    order = []

    def visit(node):
        if colour[node] == GREY:
            return False                # back edge -> cycle
        if colour[node] == BLACK:
            return True                 # already processed
        colour[node] = GREY
        for neighbour in graph[node]:
            if not visit(neighbour):
                return False
        colour[node] = BLACK
        order.append(node)              # post-order = reverse topological
        return True

    for v in range(n):
        if not visit(v):
            return None
    return order[::-1]

# 0 -> 1 -> 3, 0 -> 2 -> 3
print(topo_sort_kahn(4, [(0, 1), (0, 2), (1, 3), (2, 3)]))   # [0, 1, 2, 3]
print(topo_sort_kahn(2, [(0, 1), (1, 0)]))                   # None - cycle
```

```javascript
function topoSortKahn(n, edges) {       // O(V + E), null if cyclic
  const graph = Array.from({ length: n }, () => []);
  const inDegree = new Array(n).fill(0);
  for (const [a, b] of edges) {         // a must come before b
    graph[a].push(b);
    inDegree[b]++;
  }

  const queue = [];
  for (let v = 0; v < n; v++) if (inDegree[v] === 0) queue.push(v);

  const order = [];
  let head = 0;
  while (head < queue.length) {
    const node = queue[head++];
    order.push(node);
    for (const neighbour of graph[node]) {
      if (--inDegree[neighbour] === 0) queue.push(neighbour);
    }
  }
  return order.length === n ? order : null;   // leftovers mean a cycle
}

function topoSortDfs(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) graph[a].push(b);

  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const colour = new Array(n).fill(WHITE);
  const order = [];

  const visit = (node) => {
    if (colour[node] === GREY) return false;    // back edge -> cycle
    if (colour[node] === BLACK) return true;
    colour[node] = GREY;
    for (const neighbour of graph[node]) if (!visit(neighbour)) return false;
    colour[node] = BLACK;
    order.push(node);                            // post-order
    return true;
  };

  for (let v = 0; v < n; v++) if (!visit(v)) return null;
  return order.reverse();
}

console.log(topoSortKahn(4, [[0, 1], [0, 2], [1, 3], [2, 3]]));  // [0,1,2,3]
console.log(topoSortKahn(2, [[0, 1], [1, 0]]));                  // null
```

> **Key idea**
>
> The three-colour DFS is the general way to **detect a cycle in a directed graph**. Grey means "currently on the recursion stack", so reaching a grey node means you have looped back on yourself. In an *undirected* graph the test is different: a visited neighbour that is not your parent indicates a cycle, or simply use Union-Find.

**Top Interview Question 2**

*There are `n` courses labelled `0…n-1` and a list of pairs `[a, b]` meaning "you must take `b` before `a`". Return any valid order in which to take all the courses, or an empty list if it is impossible.*

"Must come before" is a directed edge, so this is a topological sort with one extra requirement: the impossible case. Kahn's algorithm reports it for free — if the queue empties before every course is placed, the leftovers are stuck waiting on each other, which is a cycle.

Watch the edge direction: the pair `[a, b]` reads "b before a", so the edge runs `b → a` and it is `a`'s in-degree that increases. Reversing this is the most common mistake in the problem.

**Answer — course schedule ordering**

```python
from collections import deque

def find_order(n, prerequisites):
    """O(V + E). Returns [] when a cycle makes the ordering impossible."""
    graph = [[] for _ in range(n)]
    in_degree = [0] * n

    for course, needed in prerequisites:    # [a, b] means b BEFORE a
        graph[needed].append(course)        # so the edge runs needed -> course
        in_degree[course] += 1

    # Anything with no outstanding prerequisite can be taken immediately.
    q = deque(c for c in range(n) if in_degree[c] == 0)
    order = []

    while q:
        course = q.popleft()
        order.append(course)
        for nxt in graph[course]:
            in_degree[nxt] -= 1             # one prerequisite satisfied
            if in_degree[nxt] == 0:
                q.append(nxt)

    # Fewer than n placed means the rest form a cycle.
    return order if len(order) == n else []

print(find_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))  # [0, 1, 2, 3]
print(find_order(2, [[1, 0], [0, 1]]))                  # [] - circular
```

```javascript
function findOrder(n, prerequisites) {  // O(V + E), [] if impossible
  const graph = Array.from({ length: n }, () => []);
  const inDegree = new Array(n).fill(0);

  for (const [course, needed] of prerequisites) {   // [a, b] = b BEFORE a
    graph[needed].push(course);                     // edge: needed -> course
    inDegree[course]++;
  }

  const queue = [];
  for (let c = 0; c < n; c++) if (inDegree[c] === 0) queue.push(c);

  const order = [];
  let head = 0;
  while (head < queue.length) {
    const course = queue[head++];
    order.push(course);
    for (const next of graph[course]) {
      if (--inDegree[next] === 0) queue.push(next);
    }
  }

  return order.length === n ? order : [];   // short means a cycle
}

console.log(findOrder(4, [[1, 0], [2, 0], [3, 1], [3, 2]]));  // [0,1,2,3]
console.log(findOrder(2, [[1, 0], [0, 1]]));                  // [] - circular
```

**Top Interview Question 3**

*You are given a list of words sorted according to an unknown alphabet. Recover an ordering of the letters consistent with that dictionary, or report that the input is contradictory.*

The hard half is realising this *is* a topological sort: comparing two adjacent words, the first position where they differ yields one ordering constraint — an edge. Build the graph from those edges and run Kahn's algorithm; a leftover node count means a cycle, i.e. no valid alphabet. Watch the trap case `["abc", "ab"]`: a prefix appearing *after* its own extension is invalid, and no edge would catch it.

**Answer — alien dictionary letter order**

```python
from collections import deque

def alien_order(words):
    """O(total characters). Each adjacent pair contributes at most one edge."""
    successors = {ch: set() for word in words for ch in word}
    in_degree = {ch: 0 for ch in successors}

    for first, second in zip(words, words[1:]):
        if len(first) > len(second) and first.startswith(second):
            return ""                   # "abc" before "ab" is impossible
        for a, b in zip(first, second):
            if a != b:                  # the first difference is the constraint
                if b not in successors[a]:
                    successors[a].add(b)
                    in_degree[b] += 1
                break                   # later characters say nothing

    queue = deque(ch for ch, d in in_degree.items() if d == 0)
    order = []
    while queue:
        ch = queue.popleft()
        order.append(ch)
        for nxt in successors[ch]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    return "".join(order) if len(order) == len(in_degree) else ""   # cycle -> ""

print(alien_order(["wrt", "wrf", "er", "ett", "rftt"]))   # "wertf"
print(alien_order(["abc", "ab"]))                         # "" - contradictory
```

```javascript
function alienOrder(words) {            // O(total characters)
  const successors = new Map(), inDegree = new Map();
  for (const word of words) {
    for (const ch of word) {
      if (!successors.has(ch)) { successors.set(ch, new Set()); inDegree.set(ch, 0); }
    }
  }

  for (let i = 0; i + 1 < words.length; i++) {
    const [first, second] = [words[i], words[i + 1]];
    if (first.length > second.length && first.startsWith(second)) return "";
    for (let j = 0; j < Math.min(first.length, second.length); j++) {
      if (first[j] !== second[j]) {     // the first difference is the edge
        if (!successors.get(first[j]).has(second[j])) {
          successors.get(first[j]).add(second[j]);
          inDegree.set(second[j], inDegree.get(second[j]) + 1);
        }
        break;                          // later characters say nothing
      }
    }
  }

  const queue = [...inDegree].filter(([, d]) => d === 0).map(([ch]) => ch);
  const order = [];
  while (queue.length) {
    const ch = queue.shift();
    order.push(ch);
    for (const next of successors.get(ch)) {
      inDegree.set(next, inDegree.get(next) - 1);
      if (inDegree.get(next) === 0) queue.push(next);
    }
  }

  return order.length === inDegree.size ? order.join("") : "";   // cycle -> ""
}

console.log(alienOrder(["wrt", "wrf", "er", "ett", "rftt"]));   // "wertf"
```

<a id="25-shortest-paths"></a>

## 25. Shortest Paths

- **BFS** `O(V + E)` unweighted
- **Dijkstra** `O((V+E) log V)` non-negative
- **Bellman-Ford** `O(V·E)` handles negatives
- **Floyd-Warshall** `O(V³)` all pairs

Every shortest-path algorithm is built from one primitive: **relaxation**. If the currently known distance to `v` is worse than going via `u`, improve it:

```text
if dist[u] + weight(u, v) < dist[v]:
                dist[v] = dist[u] + weight(u, v)
                prev[v] = u # remember how we got here, to rebuild the path
```

The algorithms differ only in the *order* in which they relax edges, and that order is what determines their speed and what graphs they can handle.

<a id="dijkstra"></a>

### Dijkstra's algorithm

Always finalise the unvisited node with the smallest tentative distance. Because every weight is non-negative, no future path can ever come back and improve it — any detour only adds cost. That observation is the proof of correctness, and it is also exactly why **negative weights break Dijkstra**.

> **Interactive animation:** `dijkstra` — rendered by the page script in the HTML version.

**Top Interview Question 1**

*How does Dijkstra's algorithm find single-source shortest paths on non-negative weighted graphs?*

By repeatedly extracting the unvisited vertex with the minimum tentative distance using a priority queue and relaxing its neighbors, Dijkstra computes shortest paths in \(O((V + E) \log V)\) time.

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

<a id="bellman-ford-and-floyd-warshall"></a>

### When Dijkstra will not do

1. **Bellman-Ford** `O(V·E)` — relax *every* edge `V−1` times. Slower, but it tolerates negative weights and, with one extra pass, detects negative cycles. Used in distance-vector routing and currency arbitrage detection.
2. **Floyd-Warshall** `O(V³)` — shortest paths between *all* pairs, in five lines. Practical up to a few hundred vertices, and the cleanest way to compute transitive closure.
3. **0-1 BFS** `O(V + E)` — when weights are only 0 or 1, a deque replaces the heap: push weight-0 edges to the front, weight-1 edges to the back.
4. **A*** — Dijkstra plus a heuristic estimate of the remaining distance. If the heuristic never overestimates, the result is still optimal but far fewer nodes are explored. This is what routing and game pathfinding use.

**Top Interview Question 2**

*How do you compute shortest paths when edge weights can be negative, or between all pairs of vertices?*

Bellman-Ford relaxes all edges \(V-1\) times to handle negative weights and detect negative cycles in \(O(V \cdot E)\), while Floyd-Warshall computes all-pairs shortest paths via dynamic programming across intermediate vertices in \(O(V^3)\).

**Bellman-Ford and Floyd-Warshall**

```python
def bellman_ford(n, edges, start):
    """edges = [(u, v, w)]. Returns (dist, None) or (None, 'negative cycle')."""
    dist = [float("inf")] * n
    dist[start] = 0

    # After k rounds every shortest path using <= k edges is correct.
    # A simple path has at most n - 1 edges, so n - 1 rounds suffice.
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break                       # early exit: already stable

    # One more round: any further improvement means a negative cycle.
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            return None, "negative cycle"

    return dist, None

def floyd_warshall(matrix):
    """matrix[i][j] = weight or inf. All-pairs shortest paths. O(V^3)."""
    n = len(matrix)
    dist = [row[:] for row in matrix]

    # k is the highest-numbered intermediate vertex allowed so far.
    # The loop order matters: k MUST be outermost.
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    return dist
```

```javascript
function bellmanFord(n, edges, start) { // edges: [u, v, w]
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;

  for (let round = 0; round < n - 1; round++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;                // already stable
  }

  for (const [u, v, w] of edges) {      // one extra round detects negatives
    if (dist[u] + w < dist[v]) return { dist: null, error: "negative cycle" };
  }
  return { dist, error: null };
}

function floydWarshall(matrix) {        // O(V^3) all pairs
  const n = matrix.length;
  const dist = matrix.map((row) => [...row]);

  for (let k = 0; k < n; k++) {         // k MUST be the outer loop
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}
```

**Top Interview Question 3**

*A network has `n` nodes labelled `1…n`. Given travel times as directed edges `[from, to, time]`, a signal is sent from node `k`. How long until *every* node receives it, or `-1` if some node never does?*

"Time for all to receive" is the **maximum** of the shortest paths from `k` to every node — the last arrival sets the answer. Weights are positive travel times, so Dijkstra applies directly; run it once from `k` and take the largest finalised distance.

The unreachable case falls out naturally: if any distance is still infinite when the queue drains, that node has no route from `k`.

**Answer — network delay time**

```python
import heapq
from collections import defaultdict

def network_delay_time(times, n, k):
    """O((V + E) log V). times = [(from, to, weight)], nodes are 1..n."""
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))         # DIRECTED - only one direction

    dist = {}
    pq = [(0, k)]                       # (distance so far, node)

    while pq:
        d, node = heapq.heappop(pq)
        if node in dist:
            continue                    # stale entry; already finalised
        dist[node] = d
        for neighbour, w in graph[node]:
            if neighbour not in dist:
                heapq.heappush(pq, (d + w, neighbour))

    # Every node must have been reached, and the slowest one is the answer.
    return max(dist.values()) if len(dist) == n else -1

print(network_delay_time([(2, 1, 1), (2, 3, 1), (3, 4, 1)], 4, 2))   # 2
print(network_delay_time([(1, 2, 1)], 2, 2))                         # -1
```

```javascript
// Uses the Heap class from section 19.
function networkDelayTime(times, n, k) {    // O((V + E) log V)
  const graph = new Map();
  for (const [u, v, w] of times) {          // DIRECTED edges
    if (!graph.has(u)) graph.set(u, []);
    graph.get(u).push([v, w]);
  }

  const dist = new Map();
  const pq = new Heap((a, b) => a[0] - b[0]);
  pq.push([0, k]);

  while (pq.size) {
    const [d, node] = pq.pop();
    if (dist.has(node)) continue;           // stale entry
    dist.set(node, d);
    for (const [neighbour, w] of graph.get(node) ?? []) {
      if (!dist.has(neighbour)) pq.push([d + w, neighbour]);
    }
  }

  // All nodes reached? Then the slowest arrival is the answer.
  return dist.size === n ? Math.max(...dist.values()) : -1;
}

console.log(networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2));   // 2
console.log(networkDelayTime([[1,2,1]], 2, 2));                   // -1
```

<a id="26-minimum-spanning-trees"></a>

## 26. Minimum Spanning Trees

- **Kruskal** `O(E log E)` — sort + Union-Find
- **Prim** `O(E log V)` — grow from one vertex
- **Result** `V − 1` edges, minimum total weight

A minimum spanning tree connects every vertex using the cheapest possible total edge weight, with no cycles. It is the answer to "lay cable to every building for the least money" — network design, clustering, and approximate travelling-salesman tours.

Note the difference from shortest paths: an MST minimises the *total* weight of the whole tree, not the distance between any particular pair. The path between two nodes in an MST is frequently *not* the shortest path between them.

1. **Kruskal** — sort all edges by weight, then add each one unless it would create a cycle. Union-Find is the cycle test, which is precisely why the two topics sit next to each other. Better on sparse graphs.
2. **Prim** — grow a single tree from an arbitrary vertex, always adding the cheapest edge that reaches a new vertex. Structurally identical to Dijkstra with a different relaxation rule. Better on dense graphs.

**Top Interview Question 1**

*How do you construct a Minimum Spanning Tree (MST) using Kruskal's or Prim's algorithm?*

Both are greedy, and both are provably optimal because of the **cut property**: for any way of splitting the vertices into two groups, the lightest edge crossing the split is in some MST.

**Kruskal and Prim**

```python
import heapq

def kruskal(n, edges):
    """edges = [(weight, u, v)]. O(E log E), dominated by the sort."""
    uf = UnionFind(n)                   # from section 21
    mst, total = [], 0

    for weight, u, v in sorted(edges):  # cheapest first
        if uf.union(u, v):              # False means it would form a cycle
            mst.append((u, v, weight))
            total += weight
            if len(mst) == n - 1:
                break                   # a spanning tree has exactly n-1 edges

    return (mst, total) if len(mst) == n - 1 else (None, None)  # disconnected

def prim(graph, start):
    """graph: {node: [(neighbour, weight)]}. O(E log V)."""
    visited = {start}
    pq = [(w, start, v) for v, w in graph[start]]
    heapq.heapify(pq)
    mst, total = [], 0

    while pq and len(visited) < len(graph):
        weight, u, v = heapq.heappop(pq)
        if v in visited:
            continue                    # both ends already in the tree
        visited.add(v)
        mst.append((u, v, weight))
        total += weight
        for neighbour, w in graph[v]:   # extend the frontier
            if neighbour not in visited:
                heapq.heappush(pq, (w, v, neighbour))

    return mst, total

edges = [(4, 0, 1), (2, 0, 2), (1, 1, 2), (5, 1, 3), (8, 2, 3)]
print(kruskal(4, edges))    # ([(1, 2, 1), (0, 2, 2), (1, 3, 5)], 8)
```

```javascript
function kruskal(n, edges) {            // edges: [weight, u, v]
  const uf = new UnionFind(n);          // from section 21
  const sorted = [...edges].sort((a, b) => a[0] - b[0]);
  const mst = [];
  let total = 0;

  for (const [weight, u, v] of sorted) {
    if (uf.union(u, v)) {               // false = would create a cycle
      mst.push([u, v, weight]);
      total += weight;
      if (mst.length === n - 1) break;
    }
  }
  return mst.length === n - 1 ? { mst, total } : null;   // disconnected
}

function prim(graph, start) {           // O(E log V), uses Heap from §19
  const visited = new Set([start]);
  const pq = new Heap((a, b) => a[0] - b[0]);
  for (const [v, w] of graph.get(start) ?? []) pq.push([w, start, v]);

  const mst = [];
  let total = 0;

  while (pq.size && visited.size < graph.size) {
    const [weight, u, v] = pq.pop();
    if (visited.has(v)) continue;       // already in the tree
    visited.add(v);
    mst.push([u, v, weight]);
    total += weight;
    for (const [neighbour, w] of graph.get(v) ?? []) {
      if (!visited.has(neighbour)) pq.push([w, v, neighbour]);
    }
  }
  return { mst, total };
}

console.log(kruskal(4, [[4, 0, 1], [2, 0, 2], [1, 1, 2], [5, 1, 3], [8, 2, 3]]));
// { mst: [[1,2,1],[0,2,2],[1,3,5]], total: 8 }
```

**Top Interview Question 2**

*Given points on a plane, the cost of connecting two of them is their Manhattan distance `|x1-x2| + |y1-y2|`. Find the minimum total cost to connect all points so that there is exactly one path between any two.*

"Connect everything for the least total cost, exactly one path between any pair" is the definition of a minimum spanning tree. The only twist is that no edge list is given — every pair is implicitly an edge, so you generate all `n(n-1)/2` of them and run Kruskal.

Note this is *not* a shortest-path problem. The MST minimises the total wiring, not the distance between any particular pair — the route between two points in the result may well be a detour.

**Answer — minimum cost to connect all points**

```python
def min_cost_connect(points):
    """O(n^2 log n) - dominated by sorting the n^2 candidate edges."""
    n = len(points)
    edges = []
    for i in range(n):
        for j in range(i + 1, n):       # every pair is a candidate edge
            x1, y1 = points[i]
            x2, y2 = points[j]
            edges.append((abs(x1 - x2) + abs(y1 - y2), i, j))

    edges.sort()                        # cheapest first - Kruskal
    uf = UnionFind(n)
    total = used = 0

    for weight, u, v in edges:
        if uf.union(u, v):              # False means it would form a cycle
            total += weight
            used += 1
            if used == n - 1:           # a spanning tree has exactly n-1 edges
                break
    return total

print(min_cost_connect([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)]))   # 20
```

```javascript
function minCostConnect(points) {       // O(n^2 log n), uses UnionFind
  const n = points.length;
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {   // every pair is a candidate edge
      const [x1, y1] = points[i];
      const [x2, y2] = points[j];
      edges.push([Math.abs(x1 - x2) + Math.abs(y1 - y2), i, j]);
    }
  }

  edges.sort((a, b) => a[0] - b[0]);    // cheapest first - Kruskal
  const uf = new UnionFind(n);
  let total = 0;
  let used = 0;

  for (const [weight, u, v] of edges) {
    if (uf.union(u, v)) {               // false = would create a cycle
      total += weight;
      if (++used === n - 1) break;      // spanning tree has n-1 edges
    }
  }
  return total;
}

console.log(minCostConnect([[0,0],[2,2],[3,10],[5,2],[7,0]]));   // 20
```

**Top Interview Question 3**

*Each of `n` houses can get water either by digging its own well at a cost, or by laying a pipe to another house at a cost. Supply every house for the least total cost.*

Wells and pipes look like two different problems, which is what makes this a good MST question. The trick is a **virtual node 0** representing the water source: digging a well at house `i` becomes an edge `0 — i` priced at the well cost. Now every option is just an edge, and the cheapest way to connect all `n + 1` nodes is a plain minimum spanning tree — Kruskal over the combined edge list, `O(E log E)`.

**Answer — optimize water distribution**

```python
def min_cost_to_supply_water(n, wells, pipes):
    """O(E log E). A virtual node turns 'dig a well' into 'lay a pipe to 0'."""
    edges = [(cost, 0, house) for house, cost in enumerate(wells, start=1)]
    edges += [(cost, a, b) for a, b, cost in pipes]
    edges.sort()                        # Kruskal: cheapest edge first

    dsu = UnionFind(n + 1)              # node 0 is the virtual water source
    total = 0
    for cost, a, b in edges:
        if dsu.union(a, b):             # only edges that join two components
            total += cost
    return total

print(min_cost_to_supply_water(3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]]))   # 3
```

```javascript
function minCostToSupplyWater(n, wells, pipes) {   // O(E log E)
  const edges = wells.map((cost, i) => [cost, 0, i + 1]);   // 0 = water source
  for (const [a, b, cost] of pipes) edges.push([cost, a, b]);
  edges.sort((x, y) => x[0] - y[0]);                // Kruskal: cheapest first

  const dsu = new UnionFind(n + 1);
  let total = 0;
  for (const [cost, a, b] of edges) {
    if (dsu.union(a, b)) total += cost;             // joins two components
  }
  return total;
}

console.log(minCostToSupplyWater(3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]]));   // 3
```

<a id="27-greedy-algorithms"></a>

## 27. Greedy Algorithms

- **Strategy** take the best local option, never reconsider
- **Typical cost** `O(n log n)` — usually a sort
- **Risk** locally optimal ≠ globally optimal

A greedy algorithm makes the choice that looks best right now and never backtracks. When it works it is dramatically simpler and faster than dynamic programming. When it does not work it fails silently, producing a plausible but wrong answer — which is why **proving** greediness is valid matters more here than anywhere else.

Two properties must hold:

1. **Greedy choice property** — a globally optimal solution can be reached by making locally optimal choices.
2. **Optimal substructure** — after making a greedy choice, what remains is the same problem on a smaller input.

> **Warning**
>
> **The classic counterexample.** Making change for 30 with coins {25, 10, 1}: greedy takes 25, then five 1s — six coins. The optimal answer is three 10s. With US-style coin systems greedy happens to work; with arbitrary denominations it does not, and you need DP. Always test your greedy rule against a small adversarial case before trusting it.

**Top Interview Question 1**

*How do you find the maximum number of mutually compatible, non-overlapping intervals?*

Sort intervals by their finish times and greedily select the interval that ends earliest; finishing earliest leaves maximal remaining time for subsequent intervals.

**Interval scheduling — sort by end time**

```python
def max_meetings(intervals):
    """Most non-overlapping intervals. Sort by END time - that is the trick.
    O(n log n). Finishing earliest leaves the most room for everything else."""
    intervals.sort(key=lambda iv: iv[1])
    count, last_end = 0, float("-inf")
    for start, end in intervals:
        if start >= last_end:       # no clash with the previous choice
            count += 1
            last_end = end
    return count

print(max_meetings([(1, 3), (2, 5), (4, 7), (6, 8)]))   # 2
```

```javascript
function maxMeetings(intervals) {       // sort by END time, O(n log n)
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
  let count = 0;
  let lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) {             // no clash
      count++;
      lastEnd = end;
    }
  }
  return count;
}

console.log(maxMeetings([[1, 3], [2, 5], [4, 7], [6, 8]]));   // 2
```

**Top Interview Question 2**

*How do you determine if you can reach the last index of an array (Jump Game)?*

Track the furthest index reachable so far. If the scan ever passes that frontier, no earlier jump could have bridged the gap and the answer is settled.

**Jump game — can you reach the end?**

```python
def can_jump(nums):
    """nums[i] = max jump length from i. Can we reach the end? O(n)."""
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:               # this index is unreachable
            return False
        reach = max(reach, i + jump)
    return True

print(can_jump([2, 3, 1, 1, 4]))                        # True
print(can_jump([3, 2, 1, 0, 4]))                        # False
```

```javascript
function canJump(nums) {                // O(n)
  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;        // unreachable index
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4]), canJump([3, 2, 1, 0, 4])); // true false
```

**Top Interview Question 3**

*How do you calculate the minimum number of platforms needed for a train schedule?*

Sort arrivals and departures into two independent lists and walk them with two pointers — the same sweep-line counting used for intervals, expressed without building an event list.

**Minimum platforms — two-pointer greedy**

```python
def min_platforms(arrivals, departures):
    """Fewest train platforms needed. Classic two-pointer greedy."""
    arrivals, departures = sorted(arrivals), sorted(departures)
    i = j = platforms = best = 0
    while i < len(arrivals):
        if arrivals[i] <= departures[j]:
            platforms += 1          # a train arrives before one leaves
            best = max(best, platforms)
            i += 1
        else:
            platforms -= 1          # a platform frees up
            j += 1
    return best

print(min_platforms([900, 940, 950], [910, 1200, 1120]))    # 2
```

```javascript
function minPlatforms(arrivals, departures) {
  const a = [...arrivals].sort((x, y) => x - y);
  const d = [...departures].sort((x, y) => x - y);
  let i = 0;
  let j = 0;
  let platforms = 0;
  let best = 0;
  while (i < a.length) {
    if (a[i] <= d[j]) {
      best = Math.max(best, ++platforms);   // a train arrives
      i++;
    } else {
      platforms--;                          // a platform frees up
      j++;
    }
  }
  return best;
}

console.log(minPlatforms([900, 940, 950], [910, 1200, 1120]));   // 2
```

<a id="28-divide-and-conquer"></a>

## 28. Divide & Conquer

- **Shape** divide, conquer, combine
- **Analysis** the Master Theorem
- **Parallelises** naturally

Break the problem into independent subproblems of the same type, solve them recursively, and combine the answers. The subproblems being *independent* is what distinguishes this from dynamic programming, where subproblems overlap and are therefore cached.

**Top Interview Question 1**

*How do you find the k-th smallest element in an unsorted array in O(n) average time using Quickselect?*

Like quicksort, partition the array around a pivot, but recurse only into the one partition that can contain the k-th element, turning \(O(n \log n)\) sorting into \(O(n)\) average selection.

**Quickselect — k-th smallest in O(n)**

```python
import random

def quickselect(nums, k):
    """k-th smallest (0-indexed) in O(n) average. Like quicksort, but we
    only recurse into the ONE side that can contain the answer, which turns
    n + n/2 + n/4 + ... into 2n."""
    nums = list(nums)
    lo, hi = 0, len(nums) - 1
    while True:
        if lo == hi:
            return nums[lo]
        pivot_index = random.randint(lo, hi)    # randomise to avoid O(n^2)
        nums[pivot_index], nums[hi] = nums[hi], nums[pivot_index]
        pivot = nums[hi]

        store = lo
        for i in range(lo, hi):
            if nums[i] < pivot:
                nums[i], nums[store] = nums[store], nums[i]
                store += 1
        nums[store], nums[hi] = nums[hi], nums[store]

        if k == store:
            return nums[store]
        if k < store:
            hi = store - 1              # answer is on the left
        else:
            lo = store + 1              # answer is on the right

print(quickselect([7, 2, 9, 4, 1, 8], 2))       # 4  (third smallest)
```

```javascript
function quickselect(input, k) {        // k-th smallest, O(n) average
  const nums = [...input];
  let lo = 0;
  let hi = nums.length - 1;
  const swap = (a, b) => { [nums[a], nums[b]] = [nums[b], nums[a]]; };

  while (true) {
    if (lo === hi) return nums[lo];
    swap(lo + Math.floor(Math.random() * (hi - lo + 1)), hi);   // random pivot
    const pivot = nums[hi];

    let store = lo;
    for (let i = lo; i < hi; i++) if (nums[i] < pivot) swap(i, store++);
    swap(store, hi);

    if (k === store) return nums[store];
    if (k < store) hi = store - 1;      // recurse left only
    else lo = store + 1;                // recurse right only
  }
}

console.log(quickselect([7, 2, 9, 4, 1, 8], 2));    // 4
```

**Top Interview Question 2**

*How do you compute powers in O(log n) time using binary exponentiation?*

Rather than multiplying `base` by itself `n` times, square repeatedly and peel off a factor whenever the exponent is odd — turning `O(n)` multiplications into `O(log n)`.

**Binary exponentiation**

```python
def power(base, exponent):
    """base^exponent in O(log n) multiplications instead of O(n)."""
    result = 1
    while exponent > 0:
        if exponent & 1:                # odd exponent -> take one factor out
            result *= base
        base *= base                    # square the base
        exponent >>= 1                  # halve the exponent
    return result

print(power(2, 30))                             # 1073741824
```

```javascript
function power(base, exponent) {        // O(log n) multiplications
  let result = 1n;
  let b = BigInt(base);
  let e = BigInt(exponent);
  while (e > 0n) {
    if (e & 1n) result *= b;            // odd -> peel off one factor
    b *= b;                             // square
    e >>= 1n;                           // halve
  }
  return result;
}

console.log(power(2, 30).toString());               // 1073741824
```

**Top Interview Question 3**

*How do you count inversions in an array in O(n log n) time?*

Counting inversions is divide and conquer hiding inside a sort. The pairs that are out of order are counted for free during the merge: whenever a value is taken from the right run, every element still left in the left run forms an inversion with it — so a whole batch is counted in one addition.

**Counting inversions during a merge sort**

```python
def count_inversions(nums):
    """Pairs (i < j) with nums[i] > nums[j]. O(n log n) via merge sort:
    when we take from the right run, every remaining left element is an
    inversion with it - counted in one operation instead of one by one."""
    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, x = sort(a[:mid])
        right, y = sort(a[mid:])
        merged, z = [], 0
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
                z += len(left) - i      # the whole rest of `left` is inverted
        merged.extend(left[i:]); merged.extend(right[j:])
        return merged, x + y + z

    return sort(list(nums))[1]

print(count_inversions([2, 4, 1, 3, 5]))        # 3
```

```javascript
function countInversions(input) {       // O(n log n) via merge sort
  const sort = (a) => {
    if (a.length <= 1) return [a, 0];
    const mid = a.length >> 1;
    const [left, x] = sort(a.slice(0, mid));
    const [right, y] = sort(a.slice(mid));
    const merged = [];
    let i = 0;
    let j = 0;
    let z = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) merged.push(left[i++]);
      else {
        merged.push(right[j++]);
        z += left.length - i;           // all remaining left values invert
      }
    }
    return [[...merged, ...left.slice(i), ...right.slice(j)], x + y + z];
  };
  return sort([...input])[1];
}

console.log(countInversions([2, 4, 1, 3, 5]));      // 3
```

<a id="29-backtracking"></a>

## 29. Backtracking

- **Shape** choose → explore → un-choose
- **Subsets** `O(2ⁿ)`
- **Permutations** `O(n!)`
- **Rescued by** pruning

Backtracking is systematic brute force: build a candidate solution one decision at a time, abandon a branch the moment it cannot possibly work, and undo the last decision before trying the next one. It is DFS over a tree of decisions.

The pattern is always the same three lines, and recognising it makes subsets, permutations, combinations, N-Queens, Sudoku and word search all the same problem:

```text
def backtrack(state):
                if is_complete(state):
                record(state); return

                for choice in candidates(state):
                if not is_valid(choice, state):
                continue # PRUNE - this is what makes it tractable
                state.append(choice) # 1. choose
                backtrack(state) # 2. explore
                state.pop() # 3. un-choose (the "backtrack")
```

**Top Interview Question 1**

*How do you generate all possible subsets (the power set) of an array using backtracking?*

At each index, branch into two decisions: skip the element or include it, explore recursively, and backtrack by popping the chosen element.

**Subsets — take it or skip it**

```python
def subsets(nums):
    """All 2^n subsets. At each index: take it or skip it."""
    out, path = [], []

    def go(i):
        if i == len(nums):
            out.append(path[:])         # copy - path keeps mutating
            return
        go(i + 1)                       # skip nums[i]
        path.append(nums[i])            # choose
        go(i + 1)                       # explore
        path.pop()                      # un-choose

    go(0)
    return out

print(len(subsets([1, 2, 3])))      # 8
```

```javascript
function subsets(nums) {                // 2^n subsets
  const out = [];
  const path = [];
  const go = (i) => {
    if (i === nums.length) {
      out.push([...path]);              // copy: path keeps mutating
      return;
    }
    go(i + 1);                          // skip
    path.push(nums[i]);                 // choose
    go(i + 1);                          // explore
    path.pop();                         // un-choose
  };
  go(0);
  return out;
}

console.log(subsets([1, 2, 3]).length); // 8
```

**Top Interview Question 2**

*How do you generate all permutations of an array in place using backtracking?*

Instead of taking or skipping, swap each remaining candidate into the current slot. Swapping in place avoids building a "used" set.

**Permutations — swap into place**

```python
def permutations(nums):
    """All n! orderings, swapping in place."""
    out = []

    def go(start):
        if start == len(nums):
            out.append(nums[:])
            return
        for i in range(start, len(nums)):
            nums[start], nums[i] = nums[i], nums[start]     # choose
            go(start + 1)                                   # explore
            nums[start], nums[i] = nums[i], nums[start]     # un-choose

    go(0)
    return out

print(len(permutations([1, 2, 3]))) # 6
```

```javascript
function permutations(nums) {           // n! orderings
  const out = [];
  const swap = (a, b) => { [nums[a], nums[b]] = [nums[b], nums[a]]; };
  const go = (start) => {
    if (start === nums.length) {
      out.push([...nums]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      swap(start, i);                   // choose
      go(start + 1);                    // explore
      swap(start, i);                   // un-choose
    }
  };
  go(0);
  return out;
}

console.log(permutations([1, 2, 3]).length);  // 6
```

**Top Interview Question 3**

*How do you generate combinations of k numbers with optimal search pruning?*

If there are not enough numbers left to ever reach length `k`, the loop stops rather than exploring a branch that cannot succeed.

**Combinations — with pruning**

```python
def combinations(n, k):
    """C(n, k) combinations, with pruning."""
    out, path = [], []

    def go(start):
        if len(path) == k:
            out.append(path[:])
            return
        # PRUNE: stop early if not enough numbers remain to reach length k.
        for value in range(start, n - (k - len(path)) + 2):
            path.append(value)
            go(value + 1)
            path.pop()

    go(1)
    return out

print(len(combinations(5, 3)))      # 10
```

```javascript
function combinations(n, k) {           // C(n, k), with pruning
  const out = [];
  const path = [];
  const go = (start) => {
    if (path.length === k) {
      out.push([...path]);
      return;
    }
    // PRUNE: stop when too few numbers remain to reach length k.
    for (let value = start; value <= n - (k - path.length) + 1; value++) {
      path.push(value);
      go(value + 1);
      path.pop();
    }
  };
  go(1);
  return out;
}

console.log(combinations(5, 3).length);  // 10
```

**Top Interview Question 4**

*How do you solve the N-Queens puzzle with constant-time conflict checking?*

The three sets make each conflict check `O(1)`, using the fact that cells on a `\` diagonal share `row - col` and cells on a `/` diagonal share `row + col`.

**N-Queens — pruning with constant-time conflict checks**

```python
def solve_n_queens(n):
    """Count placements of n queens on n x n with no mutual attacks."""
    cols, diag, anti = set(), set(), set()
    count = 0

    def go(row):
        nonlocal count
        if row == n:
            count += 1
            return
        for col in range(n):
            # Constant-time conflict check thanks to the diagonal identities:
            # cells on a "\" diagonal share row - col; on "/" they share row + col.
            if col in cols or (row - col) in diag or (row + col) in anti:
                continue
            cols.add(col); diag.add(row - col); anti.add(row + col)
            go(row + 1)
            cols.remove(col); diag.remove(row - col); anti.remove(row + col)

    go(0)
    return count

print(solve_n_queens(8))            # 92
```

```javascript
function solveNQueens(n) {
  const cols = new Set();
  const diag = new Set();               // row - col
  const anti = new Set();               // row + col
  let count = 0;

  const go = (row) => {
    if (row === n) {
      count++;
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag.has(row - col) || anti.has(row + col)) continue;
      cols.add(col); diag.add(row - col); anti.add(row + col);
      go(row + 1);
      cols.delete(col); diag.delete(row - col); anti.delete(row + col);
    }
  };
  go(0);
  return count;
}

console.log(solveNQueens(8));                 // 92
```

> **Tip**
>
> **Pruning is everything.** Naive N-Queens for `n = 8` would test `8⁸ = 16.7` million placements; checking conflicts as you go cuts it to about 2,000 recursive calls. When a backtracking solution is too slow, the fix is almost never a faster language — it is a better constraint check, an earlier bound, or a smarter ordering of candidates.

<a id="30-dynamic-programming"></a>

## 30. Dynamic Programming

- **Requires** optimal substructure + overlapping subproblems
- **Top-down** recursion + memo
- **Bottom-up** iterative table
- **Typical** `O(states × transitions)`

Dynamic programming is recursion that refuses to solve the same subproblem twice. That is genuinely all it is. The reputation for difficulty comes from the modelling step — deciding what a "state" is — not from the technique.

> **Analogy** 📔
>
> **Picture it — keeping a diary**
>
> Every time you finish a calculation you write the answer down. When the same question comes up again — and in recursive problems it comes up relentlessly — you look it up instead of redoing the work. That is the entire difference between `O(2ⁿ)` and `O(n)`.

Two conditions must hold. **Optimal substructure**: the best solution is built from best solutions to subproblems. **Overlapping subproblems**: the same subproblem is reached through many different paths. Without the second, you have plain divide and conquer.

<a id="the-two-styles"></a>

### The two styles

1. **Top-down (memoisation)** — write the natural recursion, add a cache. Easier to derive, only computes the states you actually need, costs stack depth.
2. **Bottom-up (tabulation)** — fill a table in dependency order with loops. No recursion limit, better constants, and it makes space optimisation obvious.

<a id="a-recipe-that-always-works"></a>

### A recipe that always works

1. **Define the state.** What is the smallest set of variables that fully describes a subproblem? Write `dp[i]` or `dp[i][j]` as an English sentence first.
2. **Write the recurrence.** How does one state depend on smaller ones? This is usually "the best of a small number of choices".
3. **Set the base cases.** The states that need no computation.
4. **Choose an iteration order** so every dependency is computed before it is needed.
5. **Optimise space** if only the last row or two is ever read.

<a id="one-dimensional-dp"></a>

### One-dimensional DP

**Top Interview Question 1**

*How many distinct ways can you climb a staircase of n steps taking 1 or 2 steps at a time?*

Notice that this is Fibonacci in disguise: the number of ways to reach step \(n\) is \(dp[n] = dp[n-1] + dp[n-2]\), which can be computed iteratively in \(O(n)\) time and \(O(1)\) space.

**Climbing stairs — Fibonacci in disguise**

```python
def climb_stairs(n):
    """dp[i] = ways to reach step i. Fibonacci in disguise. O(n)/O(1)."""
    a, b = 1, 1                     # base cases: dp[0] = dp[1] = 1
    for _ in range(n - 1):
        a, b = b, a + b             # dp[i] = dp[i-1] + dp[i-2]
    return b

print(climb_stairs(10))                                     # 89
```

```javascript
function climbStairs(n) {               // O(n) time, O(1) space
  let [a, b] = [1, 1];
  for (let i = 1; i < n; i++) [a, b] = [b, a + b];
  return b;
}

console.log(climbStairs(10));                  // 89
```

**Top Interview Question 2**

*How do you find the maximum loot you can rob without alerting police by robbing adjacent houses?*

House robber adds a constraint to the same linear shape: you may not take two adjacent items. That turns one running value into two — the best if you take the current house, and the best if you skip it.

**House robber — no two adjacent**

```python
def rob(houses):
    """dp[i] = most money from the first i houses, no two adjacent."""
    take, skip = 0, 0
    for money in houses:
        # Taking this house means we must have skipped the previous one.
        take, skip = skip + money, max(skip, take)
    return max(take, skip)          # O(n) time, O(1) space

print(rob([2, 7, 9, 3, 1]))                                 # 12
```

```javascript
function rob(houses) {                  // no two adjacent, O(n)/O(1)
  let take = 0;
  let skip = 0;
  for (const money of houses) {
    [take, skip] = [skip + money, Math.max(skip, take)];
  }
  return Math.max(take, skip);
}

console.log(rob([2, 7, 9, 3, 1]));             // 12
```

**Top Interview Question 3**

*How do you find the fewest coins needed to make up a given amount?*

Coin change needs a real table rather than two variables, because the answer for an amount can depend on any smaller amount, not just the previous one or two.

**Coin change — fewest coins**

```python
def coin_change(coins, amount):
    """Fewest coins summing to amount, or -1. O(amount * len(coins))."""
    INF = float("inf")
    dp = [0] + [INF] * amount       # dp[x] = fewest coins to make x
    for x in range(1, amount + 1):
        for coin in coins:
            if coin <= x and dp[x - coin] + 1 < dp[x]:
                dp[x] = dp[x - coin] + 1
    return -1 if dp[amount] == INF else dp[amount]

print(coin_change([1, 5, 10, 25], 30))                      # 2
```

```javascript
function coinChange(coins, amount) {    // O(amount * coins)
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const coin of coins) {
      if (coin <= x) dp[x] = Math.min(dp[x], dp[x - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

console.log(coinChange([1, 5, 10, 25], 30));   // 2
```

**Top Interview Question 4**

*How do you find the length of the Longest Increasing Subsequence (LIS) in O(n log n) time?*

Longest increasing subsequence has an obvious `O(n²)` DP, but the version below is the one worth knowing: it keeps an array of smallest possible tails and binary searches it, giving `O(n log n)`.

**Longest increasing subsequence — patience sorting**

```python
def longest_increasing_subsequence(nums):
    """O(n log n) with patience sorting: tails[k] = smallest possible tail
    of an increasing subsequence of length k + 1."""
    from bisect import bisect_left
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)         # x extends the longest subsequence
        else:
            tails[i] = x            # x makes a length-(i+1) tail smaller
    return len(tails)               # NOTE: length only, not the sequence

print(longest_increasing_subsequence([10, 9, 2, 5, 3, 7]))  # 3
```

```javascript
function lis(nums) {                    // O(n log n) patience sorting
  const tails = [];                     // tails[k] = smallest tail of length k+1
  for (const x of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {                   // lower bound
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;                      // append or replace
  }
  return tails.length;
}

console.log(lis([10, 9, 2, 5, 3, 7]));         // 3
```

<a id="two-dimensional-dp"></a>

### Two-dimensional DP

When the state needs two indices — two strings, or items plus remaining capacity — you fill a grid. Watch the two canonical examples build themselves cell by cell.

> **Interactive animation:** `dp-lcs` — rendered by the page script in the HTML version.

> **Interactive animation:** `knapsack` — rendered by the page script in the HTML version.

**Top Interview Question 5**

*How do you find the length of the Longest Common Subsequence (LCS) between two strings?*

Use a 2D table where \(dp[i][j]\) is the LCS of prefixes \(a[:i]\) and \(b[:j]\). If characters match, \(dp[i][j] = dp[i-1][j-1] + 1\); otherwise take \(\max(dp[i-1][j], dp[i][j-1])\).

**Longest common subsequence**

```python
def lcs_length(a, b):
    """Longest common subsequence. O(n*m) time, O(min(n,m)) space here."""
    if len(a) < len(b):
        a, b = b, a                     # keep the shorter string as columns
    prev = [0] * (len(b) + 1)
    for ch_a in a:
        cur = [0] * (len(b) + 1)
        for j, ch_b in enumerate(b, start=1):
            if ch_a == ch_b:
                cur[j] = prev[j - 1] + 1        # characters pair up
            else:
                cur[j] = max(prev[j], cur[j - 1])   # drop one from either side
        prev = cur
    return prev[-1]

print(lcs_length("ABCBDAB", "BDCABA"))                  # 4
```

```javascript
function lcsLength(a, b) {              // O(n*m) time, O(m) space
  let prev = new Array(b.length + 1).fill(0);
  for (const chA of a) {
    const cur = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (chA === b[j - 1]) cur[j] = prev[j - 1] + 1;       // pair up
      else cur[j] = Math.max(prev[j], cur[j - 1]);          // drop one
    }
    prev = cur;
  }
  return prev[b.length];
}

console.log(lcsLength("ABCBDAB", "BDCABA"));               // 4
```

**Top Interview Question 6**

*How do you compute the minimum edit distance (Levenshtein distance) between two strings?*

Edit distance uses the same two-string grid but three choices instead of two, one per allowed edit. Matching characters cost nothing and move diagonally; otherwise you pay 1 and take the cheapest of delete, insert or replace.

**Edit distance (Levenshtein)**

```python
def edit_distance(a, b):
    """Levenshtein: fewest insert/delete/replace to turn a into b. O(n*m)."""
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i                    # delete every character of a
    for j in range(m + 1):
        dp[0][j] = j                    # insert every character of b

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]     # free - characters match
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],       # delete a[i-1]
                    dp[i][j - 1],       # insert b[j-1]
                    dp[i - 1][j - 1],   # replace
                )
    return dp[n][m]

print(edit_distance("kitten", "sitting"))               # 3
```

```javascript
function editDistance(a, b) {           // Levenshtein, O(n*m)
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;     // delete everything
  for (let j = 0; j <= m; j++) dp[0][j] = j;     // insert everything

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];   // free
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[n][m];
}

console.log(editDistance("kitten", "sitting"));            // 3
```

**Top Interview Question 7**

*How do you solve the 0/1 Knapsack problem using a space-optimized 1D array?*

Knapsack shows the space optimisation that applies to most 2-D DP: since each row only ever reads the row above, one array suffices. The direction of the inner loop is the whole trick — iterate capacity **downwards** or an item can be picked twice.

**0/1 knapsack, space-optimised**

```python
def knapsack(weights, values, capacity):
    """0/1 knapsack, space-optimised to one row. O(n*W) time, O(W) space."""
    dp = [0] * (capacity + 1)
    for w, v in zip(weights, values):
        # Iterate capacity DOWNWARDS so each item is used at most once.
        # Going upwards would let an item be reused -> unbounded knapsack.
        for c in range(capacity, w - 1, -1):
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[capacity]

print(knapsack([1, 3, 4, 2], [15, 20, 30, 18], 6))      # 63
```

```javascript
function knapsack(weights, values, capacity) {  // O(n*W) time, O(W) space
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    // DOWNWARDS so each item is used at most once.
    for (let c = capacity; c >= weights[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}

console.log(knapsack([1, 3, 4, 2], [15, 20, 30, 18], 6));  // 63
```

<a id="dp-families"></a>

### The families worth recognising

1. **Linear** — `dp[i]` depends on a few earlier indices. Climbing stairs, house robber, maximum subarray (Kadane), decode ways.
2. **Knapsack** — items plus a capacity. 0/1 (each item once, iterate capacity downwards) versus unbounded (unlimited copies, iterate upwards). Subset sum and partition are knapsacks in disguise.
3. **Two sequences** — `dp[i][j]` over two strings. LCS, edit distance, regular expression matching, distinct subsequences.
4. **Interval** — `dp[i][j]` over a range, computed by increasing length. Matrix chain multiplication, burst balloons, longest palindromic subsequence.
5. **Grid** — `dp[r][c]` over a matrix. Unique paths, minimum path sum, maximal square.
6. **Bitmask** — `dp[mask]` where the mask is a subset of up to ~20 items. Travelling salesman, assignment problems.
7. **Digit DP** — counting numbers in a range with a property, one digit at a time.

> **Interview**
>
> **Recognition signal:** "how many ways", "minimum/maximum cost", "is it possible to reach", or a brute-force recursion whose tree contains repeated labels. If a greedy rule is easy to break with a counterexample but the problem still has optimal substructure, it is DP.

<a id="31-bit-manipulation"></a>

## 31. Bit Manipulation

- **Every operation** `O(1)`
- **Set as a bitmask** up to 32 or 64 elements
- **Uses** flags, subsets, hashing, DP over subsets

Bit manipulation trades readability for speed and compactness. Its real value in this course is that a bitmask *is* a set: 32 boolean flags in a single integer, with union, intersection and membership as single CPU instructions. That is what makes subset-DP feasible.

> **Interactive animation:** `bits` — rendered by the page script in the HTML version.

<a id="the-vocabulary"></a>

### The vocabulary

1. `x & y` — AND, 1 only where both are 1. Used for masking and testing.
2. `x | y` — OR, 1 where either is 1. Used for setting.
3. `x ^ y` — XOR, 1 where they differ. Used for toggling; `x ^ x = 0` and `x ^ 0 = x`, which is the basis of the "find the single number" trick.
4. `~x` — NOT, flips every bit.
5. `x << k` — shift left, multiply by `2^k`. `x >> k` — shift right, integer-divide by `2^k`.

**Question**

*What are the essential bit manipulation idioms for single-bit and whole-value operations?*

The most frequent bitwise patterns include setting, clearing, toggling, and reading individual bits, as well as clearing the lowest set bit (\(x \ \& \ (x - 1)\)) and isolating it (\(x \ \& \ -x\)).

**The bit idioms worth memorising**

```python
x = 0b1011      # 11

# --- single-bit operations ---
x | (1 << 2)        # set bit 2       -> 0b1111
x & ~(1 << 1)       # clear bit 1     -> 0b1001
x ^ (1 << 0)        # toggle bit 0    -> 0b1010
(x >> 3) & 1        # read bit 3      -> 1

# --- whole-value idioms ---
x & (x - 1)         # clear the lowest set bit
x & -x              # isolate the lowest set bit
x & (x - 1) == 0    # is x a power of two? (careful: also true for 0)
bin(x).count("1")   # population count
x.bit_length()      # 4 - position of the highest set bit
```

```javascript
let x = 0b1011;         // 11

// --- single-bit operations ---
x | (1 << 2);           // set bit 2
x & ~(1 << 1);          // clear bit 1
x ^ (1 << 0);           // toggle bit 0
(x >> 3) & 1;           // read bit 3

// --- whole-value idioms ---
x & (x - 1);            // clear the lowest set bit
x & -x;                 // isolate the lowest set bit
(x & (x - 1)) === 0;    // power of two (also true for 0)
Math.clz32(x);          // count leading zeros -> highest set bit position
```

**Top Interview Question 1**

*How do you find the single unique number in an array where every other number appears twice?*

Exploiting the property that XOR is its own inverse (\(a \oplus a = 0\) and \(a \oplus 0 = a\)), XORing all elements together cancels out duplicate pairs, leaving the unique number in \(O(n)\) time and \(O(1)\) auxiliary memory.

**XOR to find the single number**

```python
def single_number(nums):
    """Every value appears twice except one. XOR cancels the pairs. O(n)/O(1)."""
    result = 0
    for value in nums:
        result ^= value
    return result

print(single_number([4, 1, 2, 1, 2]))       # 4
```

```javascript
function singleNumber(nums) {           // XOR cancels pairs, O(n)/O(1)
  let result = 0;
  for (const value of nums) result ^= value;
  return result;
}

console.log(singleNumber([4, 1, 2, 1, 2]));   // 4
```

**Top Interview Question 2**

*How do you count the number of set bits (population count / Hamming weight) in an integer?*

Counting set bits naively tests all 32 or 64 positions. Brian Kernighan's trick instead clears the lowest set bit each round, so the loop runs once per *set* bit — far fewer iterations on sparse values.

**Population count (Brian Kernighan)**

```python
def count_bits(x):
    """Brian Kernighan: loops once per SET bit, not once per bit."""
    count = 0
    while x:
        x &= x - 1              # clears the lowest set bit
        count += 1
    return count

print(count_bits(0b1011))       # 3   (bin(x).count("1") is the built-in way)
```

```javascript
function countBits(x) {                 // Brian Kernighan
  let count = 0;
  while (x) {
    x &= x - 1;                         // clears the lowest set bit
    count++;
  }
  return count;
}

console.log(countBits(0b1011));         // 3
```

**Question**

*How do you generate all subsets of a collection using bitmask enumeration?*

Finally, the bridge to bitmask DP: an `n`-bit integer *is* a subset of `n` items. Counting from `0` to `2ⁿ - 1` therefore enumerates every subset exactly once.

**Enumerating subsets with a bitmask**

```python
def all_subsets(items):
    """Enumerate 2^n subsets by counting in binary."""
    n = len(items)
    for mask in range(1 << n):
        # bit i of mask says whether items[i] is in this subset
        yield [items[i] for i in range(n) if mask >> i & 1]

print(list(all_subsets(["a", "b"])))        # [[], ['a'], ['b'], ['a','b']]
```

```javascript
function* allSubsets(items) {           // 2^n subsets by counting in binary
  for (let mask = 0; mask < 1 << items.length; mask++) {
    // bit i of mask says whether items[i] is in this subset
    yield items.filter((_, i) => (mask >> i) & 1);
  }
}

console.log([...allSubsets(["a", "b"])]);     // [[], ['a'], ['b'], ['a','b']]
```

> **Warning**
>
> JavaScript's bitwise operators coerce to **signed 32-bit** integers, so `1 << 31` is negative and `1 << 32` is 1. Use `>>>` for unsigned right shift, and `BigInt` beyond 32 bits. Python integers are arbitrary precision and negative numbers behave as if they had infinite leading 1s.

**Top Interview Question 3**

*For every number from `0` to `n`, count how many `1` bits it has. Return the counts as an array, and do it in `O(n)` total.*

Calling a popcount on each number independently is `O(n log n)`. The linear solution is a small piece of dynamic programming over bits: every number `i` is some previously-seen number with one bit removed.

Use dynamic programming over bits: since `i & (i - 1)` clears the lowest set bit and is therefore strictly smaller than `i` — its answer is already computed, making each entry one lookup plus one addition.

**Answer — counting bits for 0..n**

```python
def count_bits(n):
    """O(n) time, O(n) space. dp[i] builds on an already-solved smaller value."""
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        # i & (i - 1) clears the lowest set bit, so it is smaller than i
        # and already computed. One fewer 1 bit than i, hence the + 1.
        dp[i] = dp[i & (i - 1)] + 1
    return dp

print(count_bits(8))    # [0, 1, 1, 2, 1, 2, 2, 3, 1]

# The alternative recurrence uses the shift instead:
#   dp[i] = dp[i >> 1] + (i & 1)
# "the bits of i without its last one, plus that last bit".
```

```javascript
function countBits(n) {         // O(n) time, O(n) space
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    // i & (i - 1) clears the lowest set bit -> smaller, already computed.
    dp[i] = dp[i & (i - 1)] + 1;
  }
  return dp;
}

console.log(countBits(8));      // [0, 1, 1, 2, 1, 2, 2, 3, 1]

// Alternative recurrence: dp[i] = dp[i >> 1] + (i & 1)
```

<a id="32-math-and-number-theory"></a>

## 32. Math & Number Theory

- **GCD** `O(log min(a,b))`
- **Sieve** `O(n log log n)`
- **Modular power** `O(log e)`

**Top Interview Question 1**

*How do you compute the Greatest Common Divisor (GCD) and Least Common Multiple (LCM) of two integers?*

Euclid's algorithm computes the GCD in \(O(\log \min(a, b))\) by repeatedly taking remainders (\(a, b = b, a \pmod b\)). LCM is then derived via \((a \cdot b) / \gcd(a, b)\), dividing first to avoid integer overflow.

**GCD and LCM**

```python
from math import gcd

def euclid(a, b):
    """gcd via repeated remainder. O(log min(a, b)) - Euclid, ~300 BC."""
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    """Divide first to avoid overflow in fixed-width languages."""
    return a // gcd(a, b) * b

print(euclid(48, 18), lcm(4, 6))        # 6 12
```

```javascript
function gcd(a, b) {                    // O(log min(a, b))
  while (b) [a, b] = [b, a % b];
  return a;
}

const lcm = (a, b) => (a / gcd(a, b)) * b;   // divide first

console.log(gcd(48, 18), lcm(4, 6));    // 6 12
```

**Top Interview Question 2**

*How do you find all prime numbers up to n using the Sieve of Eratosthenes?*

The sieve generates *every* prime below `n` at once. Crossing out starts at `p*p` rather than `2p`, because any smaller multiple of `p` already has a smaller prime factor and was struck out on an earlier pass.

**Sieve of Eratosthenes**

```python
from math import isqrt

def sieve(n):
    """All primes up to n. O(n log log n) time, O(n) space."""
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    # Start crossing out at p*p: smaller multiples already have a smaller factor.
    for p in range(2, isqrt(n) + 1):
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False
    return [i for i, prime in enumerate(is_prime) if prime]

print(sieve(30))                        # [2,3,5,7,11,13,17,19,23,29]
```

```javascript
function sieve(n) {                     // O(n log log n)
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (!isPrime[p]) continue;
    for (let m = p * p; m <= n; m += p) isPrime[m] = false;  // start at p*p
  }
  return isPrime.flatMap((prime, i) => (prime ? [i] : []));
}

console.log(sieve(30));                            // [2,3,...,29]
```

**Question**

*How do you find all prime factors of an integer using trial division?*

Trial division only has to reach `√n`, because at most one prime factor can exceed it — whatever remains at the end is itself prime.

**Prime factorisation**

```python
def prime_factors(n):
    """O(sqrt(n)). Any factor above sqrt(n) can only appear once."""
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)            # whatever survives is prime
    return factors

print(prime_factors(360))               # [2, 2, 2, 3, 3, 5]
```

```javascript
function primeFactors(n) {              // O(sqrt(n))
  const factors = [];
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
  }
  if (n > 1) factors.push(n);           // whatever survives is prime
  return factors;
}

console.log(primeFactors(360));                    // [2,2,2,3,3,5]
```

**Top Interview Question 3**

*How do you compute (base ^ exponent) % mod efficiently without integer overflow?*

Modular exponentiation is binary exponentiation with a `% mod` after every step, so the numbers never grow. It underpins RSA, hashing and every "answer modulo 10⁹+7" problem.

**Modular exponentiation**

```python
def mod_pow(base, exponent, mod):
    """(base ** exponent) % mod without ever building a huge number."""
    result = 1
    base %= mod
    while exponent > 0:
        if exponent & 1:
            result = result * base % mod
        base = base * base % mod
        exponent >>= 1
    return result

# Python has these built in: pow(base, exp, mod), math.comb, math.gcd
from math import comb
print(mod_pow(2, 100, 1_000_000_007))   # 976371285
print(comb(10, 3))                      # 120
```

```javascript
function modPow(base, exponent, mod) {  // BigInt avoids overflow past 2^53
  let result = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exponent);
  const m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return result;
}

console.log(modPow(2, 100, 1000000007).toString()); // 976371285
```

> **Warning**
>
> JavaScript numbers are IEEE-754 doubles: integers above `2⁵³ − 1` (`Number.MAX_SAFE_INTEGER`) silently lose precision, and `%` on negatives returns a negative result. For modular arithmetic use `((a % m) + m) % m`, and reach for `BigInt` when values get large. Python has neither problem — its integers are unbounded and `%` always returns a non-negative result for a positive modulus.

<a id="33-range-query-structures"></a>

## 33. Range Query Structures

- **Fenwick / segment tree** query & update `O(log n)`
- **Build** `O(n)`
- **Beats** prefix sums when the data changes

A prefix-sum array answers range queries in `O(1)` but must be rebuilt entirely — an `O(n)` operation — whenever a single value changes. When you need *both* fast queries and fast updates, you need a tree.

<a id="fenwick-tree"></a>

### Fenwick tree (binary indexed tree)

The most compact solution for prefix sums with point updates: one array, two loops of three lines each. Index `i` stores the sum of a block whose length is the lowest set bit of `i`, so walking by `i -= i & -i` visits `O(log n)` blocks that exactly tile the prefix.

```text
index: 1 2 3 4 5 6 7 8
                covers: [1] [1-2] [3] [1-4] [5] [5-6] [7] [1-8]
                | | | |
                +--- each node covers (i & -i) elements ending at i

                prefix(7) = tree[7] + tree[6] + tree[4] 7 -> 6 -> 4 -> 0 (3 steps)
                update(5) touches tree[5], tree[6], tree[8] 5 -> 6 -> 8 -> ... (3 steps)
```

**Top Interview Question 1**

*How do you implement a Fenwick Tree (Binary Indexed Tree) for dynamic prefix sums and point updates?*

Store cumulative sums where node \(i\) covers \(i \ \& \ -i\) elements ending at \(i\), enabling prefix sum queries and point updates in \(O(\log n)\) time using bitwise jumps.

**Fenwick tree**

```python
class Fenwick:
    """Prefix sums with point updates, both O(log n). 1-indexed internally."""

    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def update(self, i, delta):
        """Add delta at index i (0-based). O(log n)."""
        i += 1
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i             # jump to the next node that covers i

    def prefix(self, i):
        """Sum of the first i elements (0-based exclusive). O(log n)."""
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i             # strip the lowest set bit
        return total

    def range_sum(self, lo, hi):
        """Inclusive [lo, hi]."""
        return self.prefix(hi + 1) - self.prefix(lo)

fw = Fenwick(8)
for i, v in enumerate([3, 1, 4, 1, 5, 9, 2, 6]):
    fw.update(i, v)
print(fw.range_sum(2, 5))       # 19
fw.update(3, 10)                # nums[3] becomes 11
print(fw.range_sum(2, 5))       # 29 - no rebuild needed
```

```javascript
class Fenwick {
  constructor(n) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0);
  }

  update(i, delta) {                    // O(log n), i is 0-based
    for (let k = i + 1; k <= this.n; k += k & -k) this.tree[k] += delta;
  }

  prefix(i) {                           // sum of first i elements, O(log n)
    let total = 0;
    for (let k = i; k > 0; k -= k & -k) total += this.tree[k];
    return total;
  }

  rangeSum(lo, hi) {                    // inclusive
    return this.prefix(hi + 1) - this.prefix(lo);
  }
}

const fw = new Fenwick(8);
[3, 1, 4, 1, 5, 9, 2, 6].forEach((v, i) => fw.update(i, v));
console.log(fw.rangeSum(2, 5));         // 19
fw.update(3, 10);
console.log(fw.rangeSum(2, 5));         // 29
```

<a id="segment-tree"></a>

### Segment tree

**Top Interview Question 2**

*How do you implement an iterative Segment Tree supporting arbitrary associative range queries and point updates?*

More code than a Fenwick tree, but far more general: it works for *any* associative combine function — minimum, maximum, GCD, sum, bitwise OR — and supports range assignment with lazy propagation. The iterative bottom-up version below is short enough to memorise.

**Iterative segment tree, any associative operation**

```python
class SegmentTree:
    """Point update, range query. O(n) build, O(log n) per operation.
    Pass any associative combine: min, max, gcd, sum, ..."""

    def __init__(self, values, combine=min, identity=float("inf")):
        self.n = len(values)
        self.combine = combine
        self.identity = identity
        # Leaves live at [n, 2n); internal node i has children 2i and 2i+1.
        self.tree = [identity] * self.n + list(values)
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = combine(self.tree[2 * i], self.tree[2 * i + 1])

    def update(self, i, value):
        i += self.n
        self.tree[i] = value
        i //= 2
        while i:                        # repair the ancestors
            self.tree[i] = self.combine(self.tree[2 * i], self.tree[2 * i + 1])
            i //= 2

    def query(self, lo, hi):
        """Half-open [lo, hi). Walk up from both ends, folding as we go."""
        result = self.identity
        lo += self.n
        hi += self.n
        while lo < hi:
            if lo & 1:                  # lo is a right child - take it
                result = self.combine(result, self.tree[lo])
                lo += 1
            if hi & 1:                  # hi is a right child - take hi-1
                hi -= 1
                result = self.combine(result, self.tree[hi])
            lo //= 2
            hi //= 2
        return result

st = SegmentTree([5, 2, 8, 1, 9, 3], combine=min, identity=float("inf"))
print(st.query(1, 5))       # 1  -> min of [2, 8, 1, 9]
st.update(3, 7)
print(st.query(1, 5))       # 2
```

```javascript
class SegmentTree {
  constructor(values, combine = Math.min, identity = Infinity) {
    this.n = values.length;
    this.combine = combine;
    this.identity = identity;
    this.tree = [...new Array(this.n).fill(identity), ...values];
    for (let i = this.n - 1; i > 0; i--) {
      this.tree[i] = combine(this.tree[2 * i], this.tree[2 * i + 1]);
    }
  }

  update(i, value) {                    // O(log n)
    let k = i + this.n;
    this.tree[k] = value;
    for (k >>= 1; k > 0; k >>= 1) {
      this.tree[k] = this.combine(this.tree[2 * k], this.tree[2 * k + 1]);
    }
  }

  query(lo, hi) {                       // half-open [lo, hi), O(log n)
    let result = this.identity;
    let l = lo + this.n;
    let r = hi + this.n;
    while (l < r) {
      if (l & 1) result = this.combine(result, this.tree[l++]);
      if (r & 1) result = this.combine(result, this.tree[--r]);
      l >>= 1;
      r >>= 1;
    }
    return result;
  }
}

const st = new SegmentTree([5, 2, 8, 1, 9, 3]);
console.log(st.query(1, 5));            // 1
st.update(3, 7);
console.log(st.query(1, 5));            // 2

// Same class, different operation:
const sums = new SegmentTree([5, 2, 8, 1], (a, b) => a + b, 0);
console.log(sums.query(0, 4));          // 16
```

**Top Interview Question 3**

*Design a structure over an integer array supporting two operations, both efficient and interleaved arbitrarily: `update(i, value)` sets one element, and `sumRange(i, j)` returns the sum of an inclusive range.*

The trap is picking one extreme. A plain array makes `update` `O(1)` but `sumRange` `O(n)`; a prefix-sum array flips it — `O(1)` queries but an `O(n)` rebuild on every write. If the question interleaves both, either choice is `O(n)` per operation overall.

A Fenwick tree balances them at `O(log n)` each. One wrinkle: it stores *deltas*, so to *set* a value you must add the difference from the current one — which means keeping the plain array alongside it.

**Answer — mutable range sum**

```python
class NumArray:
    """Both operations O(log n). Uses the Fenwick class from above."""

    def __init__(self, nums):
        self.nums = list(nums)          # keep the raw values...
        self.tree = Fenwick(len(nums))  # ...because Fenwick stores DELTAS
        for i, value in enumerate(nums):
            self.tree.update(i, value)

    def update(self, i, value):
        delta = value - self.nums[i]    # convert "set" into "add this much"
        self.nums[i] = value
        self.tree.update(i, delta)

    def sum_range(self, i, j):
        return self.tree.range_sum(i, j)

arr = NumArray([1, 3, 5])
print(arr.sum_range(0, 2))      # 9
arr.update(1, 2)                # [1, 2, 5]
print(arr.sum_range(0, 2))      # 8
```

```javascript
class NumArray {                    // both operations O(log n)
  constructor(nums) {
    this.nums = [...nums];          // keep raw values...
    this.tree = new Fenwick(nums.length);   // ...Fenwick stores DELTAS
    nums.forEach((value, i) => this.tree.update(i, value));
  }

  update(i, value) {
    const delta = value - this.nums[i];     // turn "set" into "add"
    this.nums[i] = value;
    this.tree.update(i, delta);
  }

  sumRange(i, j) {
    return this.tree.rangeSum(i, j);
  }
}

const arr = new NumArray([1, 3, 5]);
console.log(arr.sumRange(0, 2));    // 9
arr.update(1, 2);                   // [1, 2, 5]
console.log(arr.sumRange(0, 2));    // 8
```

<a id="34-string-algorithms"></a>

## 34. String Algorithms

- **Naive search** `O(n·m)`
- **KMP** `O(n + m)`
- **Rabin-Karp** `O(n + m)` expected

Naive substring search restarts from scratch after every mismatch, re-examining characters it has already seen. The classic algorithms all remove that waste in different ways.

<a id="kmp"></a>

### Knuth-Morris-Pratt

KMP precomputes, for each prefix of the pattern, the length of the longest proper prefix that is also a suffix — the "failure function". On a mismatch it slides the pattern by exactly the right amount instead of by one, so the text pointer never moves backwards. Total time `O(n + m)`.

```text
pattern: A B A B C
                LPS: 0 0 1 2 0 lps[i] = longest proper prefix of pattern[0..i] that is also a suffix

                text: A B A B A B C
                pattern: A B A B C
                ^ mismatch at pattern index 4; lps[3] = 2
                so keep the matched "AB" and resume comparing at pattern index 2 —
                the text pointer NEVER goes backwards.
```

**Top Interview Question 1**

*How does the Knuth-Morris-Pratt (KMP) algorithm achieve O(n + m) substring search?*

Precompute the longest proper prefix that is also a suffix (LPS table) for each prefix of the pattern. On a mismatch, use the LPS value to shift the pattern without ever decrementing the text pointer.

**KMP — failure table and search**

```python
def build_lps(pattern):
    """lps[i] = length of the longest proper prefix of pattern[:i+1]
    that is also a suffix of it. O(m)."""
    lps = [0] * len(pattern)
    length = 0
    i = 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]    # fall back, do not restart
        else:
            lps[i] = 0
            i += 1
    return lps

def kmp_search(text, pattern):
    """All start indices of pattern in text. O(n + m)."""
    if not pattern:
        return []
    lps = build_lps(pattern)
    matches = []
    j = 0                               # index into pattern

    for i, ch in enumerate(text):       # i never goes backwards
        while j and ch != pattern[j]:
            j = lps[j - 1]              # slide the pattern, keep the overlap
        if ch == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - j + 1)
            j = lps[j - 1]              # continue for overlapping matches

    return matches

print(kmp_search("ABABDABACDABABCABAB", "ABABCABAB"))   # [10]
```

```javascript
function buildLps(pattern) {            // O(m)
  const lps = new Array(pattern.length).fill(0);
  let length = 0;
  let i = 1;
  while (i < pattern.length) {
    if (pattern[i] === pattern[length]) lps[i++] = ++length;
    else if (length) length = lps[length - 1];   // fall back, do not restart
    else lps[i++] = 0;
  }
  return lps;
}

function kmpSearch(text, pattern) {     // O(n + m)
  if (!pattern) return [];
  const lps = buildLps(pattern);
  const matches = [];
  let j = 0;

  for (let i = 0; i < text.length; i++) {   // i never moves backwards
    while (j && text[i] !== pattern[j]) j = lps[j - 1];
    if (text[i] === pattern[j]) j++;
    if (j === pattern.length) {
      matches.push(i - j + 1);
      j = lps[j - 1];                   // allow overlapping matches
    }
  }
  return matches;
}

console.log(kmpSearch("ABABDABACDABABCABAB", "ABABCABAB"));  // [10]
```

<a id="rabin-karp"></a>

### Rabin-Karp — the rolling hash

A completely different escape from the same waste. Instead of being clever about mismatches, compare a cheap **hash** of each window against the pattern's hash. The trick is that the hash rolls in `O(1)`: drop the leftmost character's contribution, shift, add the new one — no need to re-read the window.

**Top Interview Question 2**

*How does the Rabin-Karp algorithm use rolling hashes for substring search?*

Hashes can collide, so a hit must always be verified against the real substring. That keeps it correct, and with a decent modulus collisions are rare enough that the expected cost stays `O(n + m)`.

**Rabin-Karp substring search**

```python
def rabin_karp(text, pattern, base=256, mod=1_000_000_007):
    """Rolling hash: compare cheap hashes, verify only on a hit. O(n + m)."""
    n, m = len(text), len(pattern)
    if m > n:
        return []

    high = pow(base, m - 1, mod)        # value of the leading digit
    pattern_hash = text_hash = 0
    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
        text_hash = (text_hash * base + ord(text[i])) % mod

    matches = []
    for i in range(n - m + 1):
        # Hash equality can be a collision, so always verify the substring.
        if text_hash == pattern_hash and text[i:i + m] == pattern:
            matches.append(i)
        if i < n - m:
            # Roll: drop the leftmost character, append the next one. O(1).
            text_hash = ((text_hash - ord(text[i]) * high) * base
                         + ord(text[i + m])) % mod
    return matches

print(rabin_karp("abracadabra", "abra"))                # [0, 7]
```

```javascript
function rabinKarp(text, pattern, base = 256n, mod = 1000000007n) {
  const n = text.length;
  const m = pattern.length;
  if (m > n) return [];

  let high = 1n;
  for (let i = 0; i < m - 1; i++) high = (high * base) % mod;

  let patternHash = 0n;
  let textHash = 0n;
  for (let i = 0; i < m; i++) {
    patternHash = (patternHash * base + BigInt(pattern.charCodeAt(i))) % mod;
    textHash = (textHash * base + BigInt(text.charCodeAt(i))) % mod;
  }

  const matches = [];
  for (let i = 0; i + m <= n; i++) {
    // Verify on a hash hit - collisions are possible.
    if (textHash === patternHash && text.slice(i, i + m) === pattern) matches.push(i);
    if (i + m < n) {
      textHash = (textHash - BigInt(text.charCodeAt(i)) * high) * base
        + BigInt(text.charCodeAt(i + m));
      textHash = ((textHash % mod) + mod) % mod;   // keep it non-negative
    }
  }
  return matches;
}

console.log(rabinKarp("abracadabra", "abra"));               // [0, 7]
```

<a id="palindromes"></a>

### Palindromes: expand around centres

**Top Interview Question 3**

*How do you find the longest palindromic substring by expanding around centers?*

Every palindrome has a centre — either a character (odd length) or a gap between two characters (even length). There are `2n − 1` centres, and expanding each is `O(n)`, giving a simple `O(n²)` that beats the `O(n³)` brute force. Manacher's algorithm reaches `O(n)` but is rarely required.

**Longest palindromic substring**

```python
def longest_palindrome(s):
    """O(n^2) time, O(1) space. Try every possible centre."""
    if not s:
        return ""
    best_start, best_len = 0, 1

    def expand(lo, hi):
        nonlocal best_start, best_len
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1
            hi += 1
        length = hi - lo - 1            # we overshot by one on both sides
        if length > best_len:
            best_start, best_len = lo + 1, length

    for i in range(len(s)):
        expand(i, i)        # odd-length palindromes centred on a character
        expand(i, i + 1)    # even-length palindromes centred on a gap

    return s[best_start:best_start + best_len]

print(longest_palindrome("babad"))      # 'bab' (or 'aba')
print(longest_palindrome("cbbd"))       # 'bb'
```

```javascript
function longestPalindrome(s) {         // O(n^2) time, O(1) space
  if (!s) return "";
  let bestStart = 0;
  let bestLen = 1;

  const expand = (lo, hi) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--;
      hi++;
    }
    const length = hi - lo - 1;         // overshot by one on each side
    if (length > bestLen) {
      bestStart = lo + 1;
      bestLen = length;
    }
  };

  for (let i = 0; i < s.length; i++) {
    expand(i, i);                       // odd length
    expand(i, i + 1);                   // even length
  }
  return s.slice(bestStart, bestStart + bestLen);
}

console.log(longestPalindrome("babad"));   // 'bab'
console.log(longestPalindrome("cbbd"));    // 'bb'
```

<a id="35-intervals-and-sweep-line"></a>

## 35. Intervals & Sweep Line

- **Cost** `O(n log n)` — the sort dominates
- **First move** sort by start, or split into events

Interval problems — meeting rooms, calendar booking, merging ranges, skyline — all begin the same way: **sort**. Sorting by start time makes overlaps adjacent; splitting each interval into a `+1` event at its start and a `−1` event at its end lets you sweep a line across the timeline and track how many intervals are active at once.

```text
intervals: [1,3] [2,6] [8,10] [15,18]

                sorted by start, then merge:
                [1,3] current = [1,3]
                [2,6] starts at 2 <= 3 -> overlap: extend to [1,6]
                [8,10] starts at 8 > 6 -> gap: emit [1,6], current = [8,10]
                [15,18] starts at 15 > 10 -> gap: emit [8,10], current = [15,18]

                result: [1,6] [8,10] [15,18]
```

**Top Interview Question 1**

*How do you merge overlapping intervals?*

Sort intervals by start time. Iterate through them, merging the current interval with the previous one if its start is \(\le\) the previous interval's end, or appending a new interval if there is a gap.

**Merging overlapping intervals**

```python
def merge_intervals(intervals):
    """Combine every overlapping pair. O(n log n)."""
    if not intervals:
        return []
    intervals = sorted(intervals)       # by start, then end
    merged = [list(intervals[0])]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:      # overlaps the current block
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end]) # disjoint - start a new block
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))
# [[1, 6], [8, 10], [15, 18]]
```

```javascript
function mergeIntervals(intervals) {    // O(n log n)
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = [[...sorted[0]]];

  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = merged.at(-1);
    if (start <= last[1]) last[1] = Math.max(last[1], end);   // overlap
    else merged.push([start, end]);                            // gap
  }
  return merged;
}

console.log(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]));
// [[1,6],[8,10],[15,18]]
```

**Top Interview Question 2**

*How do you insert an interval into an already sorted list of non-overlapping intervals in O(n) time?*

If the list is *already* sorted and non-overlapping, inserting one new interval does not need a re-sort at all — a single `O(n)` pass in three phases: copy everything that ends before the new one starts, absorb everything that touches it, then copy the rest.

**Inserting into a sorted interval list**

```python
def insert_interval(intervals, new):
    """Insert into an already-sorted, non-overlapping list. O(n)."""
    out, i, n = [], 0, len(intervals)
    start, end = new

    while i < n and intervals[i][1] < start:     # entirely before
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= end:      # overlapping - absorb
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    out.extend(intervals[i:])                   # entirely after
    return out

print(insert_interval([[1, 3], [6, 9]], [2, 5]))    # [[1, 5], [6, 9]]
```

```javascript
function insertInterval(intervals, [start, end]) {   // O(n)
  const out = [];
  let i = 0;
  let lo = start;
  let hi = end;

  while (i < intervals.length && intervals[i][1] < lo) out.push(intervals[i++]);
  while (i < intervals.length && intervals[i][0] <= hi) {
    lo = Math.min(lo, intervals[i][0]);
    hi = Math.max(hi, intervals[i][1]);
    i++;
  }
  out.push([lo, hi]);
  return [...out, ...intervals.slice(i)];
}

console.log(insertInterval([[1, 3], [6, 9]], [2, 5]));   // [[1,5],[6,9]]
```

**Top Interview Question 3**

*How do you find the maximum number of concurrent intervals using a sweep-line algorithm (Meeting Rooms II)?*

Rather than manipulating intervals as objects, split each into a `+1` arrival and a `−1` departure, sort all the events, and run a counter along the timeline.

**Sweep line — peak concurrency**

```python
def max_concurrent(intervals):
    """Peak number of simultaneous intervals - the sweep line. O(n log n)."""
    events = []
    for start, end in intervals:
        events.append((start, 1))       # someone arrives
        events.append((end, -1))        # someone leaves
    # Ends sort before starts at the same instant, so touching intervals
    # ([1,2] and [2,3]) do not count as overlapping.
    events.sort(key=lambda e: (e[0], e[1]))

    active = best = 0
    for _, delta in events:
        active += delta
        best = max(best, active)
    return best

print(max_concurrent([[0, 30], [5, 10], [15, 20]]))     # 2
```

```javascript
function maxConcurrent(intervals) {     // sweep line, O(n log n)
  const events = [];
  for (const [start, end] of intervals) {
    events.push([start, 1]);            // arrival
    events.push([end, -1]);             // departure
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);   // ends before starts

  let active = 0;
  let best = 0;
  for (const [, delta] of events) best = Math.max(best, (active += delta));
  return best;
}

console.log(maxConcurrent([[0, 30], [5, 10], [15, 20]]));   // 2
```

<a id="36-complexity-cheat-sheet"></a>

## 36. Complexity Cheat Sheet

These are the numbers to be able to recite. Everything is average case unless noted.

<a id="data-structure-costs"></a>

### Data structures

| Structure | Access | Search | Insert | Delete | Space |
| --- | --- | --- | --- | --- | --- |
| Array (dynamic) | `O(1)` | `O(n)` | `O(n)` / `O(1)` at end | `O(n)` / `O(1)` at end | `O(n)` |
| Singly linked list | `O(n)` | `O(n)` | `O(1)` at a known node | `O(1)` at a known node | `O(n)` |
| Stack / queue / deque | `O(n)` | `O(n)` | `O(1)` | `O(1)` | `O(n)` |
| Hash map / set | — | `O(1)`, worst `O(n)` | `O(1)`* | `O(1)` | `O(n)` |
| Binary search tree | `O(h)` | `O(h)` | `O(h)` | `O(h)` | `O(n)` |
| Balanced BST (AVL, RB) | `O(log n)` | `O(log n)` | `O(log n)` | `O(log n)` | `O(n)` |
| Binary heap | `O(1)` min/max | `O(n)` | `O(log n)` | `O(log n)` | `O(n)` |
| Trie | `O(L)` | `O(L)` | `O(L)` | `O(L)` | `O(alphabet · total)` |
| Union-Find | — | `O(α(n))` | `O(α(n))` | not supported | `O(n)` |
| Fenwick / segment tree | `O(log n)` | `O(log n)` | `O(log n)` | `O(log n)` | `O(n)` |

<a id="sorting-costs"></a>

### Sorting algorithms

| Algorithm | Best | Average | Worst | Space | Stable |
| --- | --- | --- | --- | --- | --- |
| Bubble | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | yes |
| Selection | `O(n²)` | `O(n²)` | `O(n²)` | `O(1)` | no |
| Insertion | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | yes |
| Merge | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes |
| Quick | `O(n log n)` | `O(n log n)` | `O(n²)` | `O(log n)` | no |
| Heap | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | no |
| Timsort (built-in) | `O(n)` | `O(n log n)` | `O(n log n)` | `O(n)` | yes |
| Counting | `O(n + k)` | `O(n + k)` | `O(n + k)` | `O(k)` | yes |
| Radix | `O(d(n + b))` | `O(d(n + b))` | `O(d(n + b))` | `O(n + b)` | yes |

<a id="graph-costs"></a>

### Graph algorithms

| Algorithm | Time | Use it for |
| --- | --- | --- |
| BFS / DFS | `O(V + E)` | reachability, components, unweighted shortest path |
| Topological sort | `O(V + E)` | dependency ordering, cycle detection in a digraph |
| Dijkstra (binary heap) | `O((V + E) log V)` | shortest path, non-negative weights |
| Bellman-Ford | `O(V · E)` | negative weights, negative-cycle detection |
| Floyd-Warshall | `O(V³)` | all-pairs shortest paths, transitive closure |
| Kruskal | `O(E log E)` | MST on sparse graphs |
| Prim | `O(E log V)` | MST on dense graphs |

<a id="input-size-guide"></a>

### Reading the constraints

1. `n ≤ 10` — `O(n!)` permutations are fine.
2. `n ≤ 20` — `O(2ⁿ)`: subsets, bitmask DP.
3. `n ≤ 100` — `O(n³)`: Floyd-Warshall, interval DP.
4. `n ≤ 1,000` — `O(n²)`: nested loops, 2-D DP.
5. `n ≤ 100,000` — `O(n log n)`: sorting, heaps, binary search, segment trees.
6. `n ≤ 1,000,000` — `O(n)` or `O(n log n)` only: hashing, two pointers, sliding window, prefix sums.
7. `n ≥ 10⁹` — `O(log n)` or `O(1)`: binary search on the answer, maths.

<a id="37-pattern-recognition-playbook"></a>

## 37. Pattern Recognition Playbook

Most problems are variations on about fifteen patterns. This section is the mapping from what a problem *says* to what you should *reach for*.

- **"Sorted array" + pair/triplet** Two pointers from both ends. Sort first if it is not sorted and the order does not matter.
- **"Contiguous subarray/substring"** Sliding window for positives; prefix sums with a hash map when negatives are allowed.
- **"Have I seen this before?"** Hash set or map. Turns `O(n²)` into `O(n)`.
- **"Top k" / "k-th largest"** Heap of size `k` (min-heap for largest), or quickselect for `O(n)` average.
- **"Next greater / smaller element"** Monotonic stack. Also spans, histograms, rain water.
- **"Sliding window max/min"** Monotonic deque.
- **"Shortest path, unweighted"** BFS. Weighted and non-negative? Dijkstra. Negative? Bellman-Ford.
- **"Dependencies / prerequisites"** Topological sort on a DAG.
- **"Connected / grouped / islands"** DFS flood fill or Union-Find.
- **"All combinations / permutations"** Backtracking with pruning.
- **"How many ways" / "min or max cost"** Dynamic programming.
- **"Minimise the maximum"** Binary search on the answer with a feasibility check.
- **"Prefix / autocomplete"** Trie.
- **"Overlapping ranges"** Sort by start and merge, or a sweep line of +1/−1 events.
- **"In place, O(1) space"** Two pointers, in-place reversal, or index-as-hash marking.
- **"Cycle in a list or sequence"** Floyd's fast and slow pointers.
- **"Range query with updates"** Fenwick or segment tree. Static data? Prefix sums.
- **"Linked list, one pass"** Dummy head plus fast/slow pointers.

<a id="a-method-for-attacking-a-problem"></a>

### A method for attacking any problem

1. **Restate it** in your own words and confirm the inputs, outputs and edge cases. Empty input, one element, duplicates, negatives, and the maximum size.
2. **Write the brute force** — even just out loud. It gives you a correctness baseline and a complexity to beat.
3. **Find the waste.** What is being recomputed? What information is thrown away between iterations? The optimisation almost always comes from caching that information in a better structure.
4. **Match the pattern** from the list above.
5. **Verify on a small example by hand** before writing more code, especially the boundaries.
6. **State the complexity** of what you wrote, in time and in space.

> **Key idea**
>
> The single most transferable skill here is step 3. Two pointers, sliding window, prefix sums, memoisation, monotonic stacks and hash maps are all the same move: *notice that you are throwing away work between iterations, and keep it instead.*

<a id="38-practice-roadmap"></a>

## 38. Practice Roadmap

Reading this page will not make you good at algorithms any more than reading about swimming makes you a swimmer. Here is an order of practice that builds on itself.

<a id="phase-1"></a>

### Phase 1 — fluency with the basics

1. Arrays and strings: reverse in place, rotate, remove duplicates, valid palindrome, group anagrams.
2. Hashing: two sum, first unique character, contains duplicate, longest consecutive sequence.
3. Two pointers and sliding window: container with most water, longest substring without repeats, minimum window substring.
4. Stacks: valid parentheses, min stack, daily temperatures, evaluate reverse Polish notation.

<a id="phase-2"></a>

### Phase 2 — structures and recursion

1. Linked lists: reverse, merge two sorted, detect cycle, remove `n`-th from end, LRU cache.
2. Trees: all four traversals, maximum depth, validate a BST, lowest common ancestor, level-order.
3. Heaps: `k`-th largest, merge `k` sorted lists, top `k` frequent, median of a data stream.
4. Binary search: classic, first/last position, search in a rotated array, minimise the maximum.

<a id="phase-3"></a>

### Phase 3 — graphs and search

1. Grids as graphs: number of islands, rotting oranges, word search, surrounded regions.
2. Traversal: clone a graph, course schedule (topological sort), word ladder.
3. Weighted: network delay time (Dijkstra), cheapest flight within `k` stops, MST.
4. Backtracking: subsets, permutations, combination sum, N-Queens, Sudoku solver.

<a id="phase-4"></a>

### Phase 4 — dynamic programming and the rest

1. 1-D: climbing stairs, house robber, coin change, longest increasing subsequence, word break.
2. 2-D: unique paths, edit distance, longest common subsequence, 0/1 knapsack, regular expression matching.
3. Advanced structures: trie with autocomplete, Union-Find problems, Fenwick or segment tree.
4. Everything else: bit manipulation, intervals, sweep line, string matching.

<a id="how-to-practise"></a>

### How to practise so it sticks

1. **Time-box.** Twenty-five minutes of genuine effort, then read the solution. Struggling for three hours teaches you far less than reading a good solution and re-solving it from scratch the next day.
2. **Re-solve, do not re-read.** A problem is learned when you can write the solution without looking, a week later.
3. **Keep a mistake log.** Off-by-one in binary search, forgetting the visited set, mutating while iterating. Patterns in your own errors are more valuable than any problem list.
4. **Say the complexity out loud** after every solution, for both time and space.
5. **Prefer depth over volume.** Fifty problems understood thoroughly beat five hundred skimmed.

> *"Bad programmers worry about the code. Good programmers worry about data structures and their relationships."* — Linus Torvalds

<a id="where-to-go-next"></a>

### Where to go next

1. 📚 Browse all guides in the [DSA Courses catalog](dsa-courses.html).
2. 📖 [CP-Algorithms](https://cp-algorithms.com/) — rigorous write-ups of the advanced material.
3. 📖 *The Algorithm Design Manual* (Skiena) — the best book for building intuition about which algorithm to use.
4. 🧠 [LeetCode](https://leetcode.com/) and [Codeforces](https://codeforces.com/) — for the repetitions.

---

TechToday Study Library — Data Structures & Algorithms
