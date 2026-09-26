[<- DSA](00-dsa-quick.md)

# Revision Advanced DSA - 1

## Index
- [Notes](#notes)
  - [1. Recursion](#1-recursion)
  - [2. Hashing (Map & Set)](#2-hashing-map--set)
  - [3. Count Sort & Merge Sort](#3-count-sort--merge-sort)
  - [4. Kadane's Algorithm](#4-kadanes-algorithm)
- [Questions](#questions)
  - [1. 1D Arrays Advanced](#1-1d-arrays-advanced)
  - [2. Prefix Sum Advanced](#2-prefix-sum-advanced)
  - [3. Two Pointers](#3-two-pointers)
  - [4. Interval Technique](#4-interval-technique)
  - [5. Kadane's Algorithm](#5-kadanes-algorithm)
  - [6. 2D Arrays / Matrix Advanced](#6-2d-arrays--matrix-advanced)
  - [7. Bit Manipulation Advanced](#7-bit-manipulation-advanced)
  - [8. Recursion](#8-recursion)
  - [9. Hashing (Set)](#9-hashing-set)
  - [10. Hashing (Map)](#10-hashing-map)
  - [11. Count Sort & Merge Sort](#11-count-sort--merge-sort)
  - [12. Quick Sort & Comparator](#12-quick-sort--comparator)

# Notes

## 1. Recursion

### Steps to write recursive functions
1. Expectation → Decide what our function is supposed to do. Fix the exact input → output contract (parameters, return value) and never change its meaning midway.
2. Main logic → Break the problem into subproblems and then use them to solve the larger problem. Assume the smaller call already returns the correct answer (**recursive leap of faith**) — do not trace it in your head; just combine its result.
3. Base case → Last valid input for which recursion needs to stop, answered directly without another call.

**Applying the 3 steps — `sum(n)` = sum of first n natural numbers:**
1. Expectation: `sum(n)` returns `1 + 2 + ... + n`.
2. Main logic: `sum(n) = n + sum(n - 1)` — trust that `sum(n - 1)` is already correct.
3. Base case: `sum(0) = 0`.

**Things to check before you run the code:**
1. Every recursive call must move **strictly closer** to the base case, otherwise it never terminates (`sum(n - 1)`, not `sum(n)`).
2. The base case must cover **all** ways recursion can bottom out — `fib` needs `n <= 1` (both `0` and `1`), not just `n == 0`.
3. Guard the invalid/edge inputs (negative `n`, empty array, `index == arr.length`) — they usually become extra base cases.
4. The combine step happens **after** the recursive call returns; work placed before vs after the call changes the output order (see "Decreasing & Increasing in one function").
5. If the same subproblem is solved repeatedly (like `fib`), add **memoization** to cut the recursion tree down from exponential to linear.

### How to Calculate Time Complexity & Space Complexity in Recursion
1. **Time Complexity** = Total number of function calls × work done per call.
2. **Space Complexity** = Maximum depth of the call stack (+ any extra data structures).
3. Draw the **recursion tree** — count nodes for Time Complexity, count max depth for Space Complexity.

### 1. Simple Example — Factorial: `fact(n)`

```java
int fact(int n) {
    if (n <= 1) return 1;       // base case — O(1) work
    return n * fact(n - 1);     // one recursive call
}
```

**Recursion Tree for `fact(5)`:**
```
fact(5)
  └── fact(4)
        └── fact(3)
              └── fact(2)
                    └── fact(1) ← base case
```

**Time Complexity Analysis:**
- Each call makes exactly **1 recursive call**, reducing `n` by 1.
- Total calls: `n` (from `fact(n)` down to `fact(1)`).
- Work per call: O(1) (just a multiplication).
- **TC = n × O(1) = O(n)**

**Space Complexity Analysis:**
- The call stack grows by 1 frame for every call until the base case.
- Maximum stack depth = `n`.
- No extra data structures used.
- **SC = O(n)** (due to call stack)

### 2. Hard Example — Fibonacci: `fib(n)`

```java
int fib(int n) {
    if (n <= 1) return n;              // base case — O(1)
    return fib(n - 1) + fib(n - 2);    // TWO recursive calls
}
```

**Recursion Tree for `fib(5)`:**
```
                         fib(5)
                       /        \
                  fib(4)          fib(3)
                 /     \          /     \
            fib(3)    fib(2)   fib(2)  fib(1)
            /   \      /  \     /  \
        fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
        /   \
    fib(1) fib(0)
```

**Time Complexity Analysis:**
- Each call branches into **2 recursive calls**.
- At level 0: 1 call. Level 1: 2 calls. Level 2: 4 calls. ... Level k: 2^k calls.
- Maximum depth = `n`, so the **upper bound** on total calls ≈ `2^0 + 2^1 + ... + 2^n = 2^(n+1) - 1`.
- (In reality it's slightly less because `fib(n-2)` branch is shorter, but the dominant term remains exponential.)
- **TC = O(2^n)**

**Space Complexity Analysis:**
- Even though there are many calls, they don't all exist on the stack at the same time.
- The call stack follows one path at a time (DFS-like), all the way down to the base case before backtracking.
- The **longest path** from root to leaf is `fib(5) → fib(4) → fib(3) → fib(2) → fib(1)`, which is depth `n`.
- At any point, at most `n` frames are on the stack.
- **SC = O(n)** (call stack depth, not total calls)

**Why SC ≠ O(2^n)?**
```
Stack grows DOWN one path, then backtracks:

  Call fib(5) → push frame
    Call fib(4) → push frame
      Call fib(3) → push frame
        Call fib(2) → push frame
          Call fib(1) → push frame → return → pop
          Call fib(0) → push frame → return → pop
        fib(2) returns → pop
        Call fib(1) → push frame → return → pop    ← reuses the freed space
      fib(3) returns → pop
      ...

Max frames alive at once = n (the longest root-to-leaf path)
```

### Recursion VS Iteration
```
Every problem that can be solved using recursion can also be solved using iteration. However, there are certain problems where recursion provides a cleaner and more intuitive solution compared to iteration. Examples include tree traversals, combinatorial problems (like permutations and combinations), and problems that can be broken down into smaller subproblems (like the Fibonacci sequence).

If we want to convert a recursive solution to an iterative one, we often use data structures like stacks or queues to simulate the function call stack used in recursion.
```

## 2. Hashing (Map & Set)

### HashMap operations
1. set(key, value) - set the value for the key: Time Complexity: O(1) on average, O(n) in worst case
2. get(key) - get the value for the key: Time Complexity: O(1) on average, O(n) in worst case
3. delete(key) - delete the key-value pair: Time Complexity: O(1) on average, O(n) in worst case
4. has(key) - check if the key is present in the hashmap: Time Complexity: O(1) on average, O(n) in worst case
5. size - get the size of the hashmap: Time Complexity: O(1)

### HashSet operations
1. add(value) - add the value to the set: Time Complexity: O(1) on average, O(n) in worst case
2. delete(value) - delete the value from the set: Time Complexity: O(1) on average, O(n) in worst case
3. has(value) - check if the value is present in the set: Time Complexity: O(1) on average, O(n) in worst case
4. size - get the size of the set: Time Complexity: O(1)

## 3. Count Sort & Merge Sort

### Ideal range for Count Sort
```
Range of elements: A[i] <= 10^6
Frequency of every element: A[i] <= 10^6
```

### Mid calculation optimization
```js
const mid = lo + Math.floor((hi - lo) / 2);
```

```python
mid = lo + (hi - lo) // 2
```

### Stable Sort
A sorting algorithm is stable if it preserves the relative order of equal elements in the sorted array. For example, if two elements have the same value, their order in the original array should be maintained in the sorted array.

### Inplace Sort
A sorting algorithm is inplace if it preserves the original array and does not require additional space for sorting. For example, if an algorithm sorts an array in place, it modifies the original array without creating a new one.

## 4. Kadane's Algorithm

### Core Idea
Kadane's Algorithm finds the **optimal contiguous subarray** in O(N) time, O(1) space. It works by making a single **greedy decision at every index**: should I **extend** the current subarray to include this element, or **restart** a fresh subarray starting here?

```
At each index i:
  currentBest = max(arr[i], currentBest + arr[i])
  globalBest  = max(globalBest, currentBest)
```

If `currentBest + arr[i]` becomes worse than just `arr[i]` alone, the accumulated subarray is a net drag — discard it and restart.

### When to Use Kadane's Algorithm
Use Kadane's whenever a problem asks you to find **the best contiguous subarray** and at each index you can make an **"extend or restart"** decision. The key insight is recognizing that a problem can be **transformed** into this pattern, even when it doesn't directly ask for "maximum sum".

**The universal pattern to identify:**
- You are looking for a **contiguous subarray** (not subsequence, not fixed-size window).
- At each element, continuing the subarray either **helps or hurts**, and you can decide locally.
- The "goodness" of the subarray is **cumulative** (sum, product, length under a condition).

### Summary — Recognizing Kadane's Problems
1. **Contiguous subarray?** → If yes, Kadane's is a candidate.
2. **Can I make a local extend/restart decision?** → If yes, apply Kadane's.
3. **Does the problem need a transformation first?** → Map values to gains/losses (like Flip maps 0→+1, 1→-1), then apply Kadane's on the transformed array.
4. **Is the "extend" condition based on structure (increasing/decreasing)?** → Use condition-based restart instead of sum-based restart.
5. **Does the operation have sign-flipping behavior (like multiplication)?** → Track both min and max (like Max Product Subarray).

# Questions

## 1. 1D Arrays Advanced

### 1. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Brute Force **O(N^3), O(1)**
```js
function findMaximumSubarraySum(arr) {
  const n = arr.length;
  let maxSum = arr[0]; // Initialize maxSum with the first element of the array

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let sum = 0;
      for (let k = i; k <= j; k++) {
        sum += arr[k]; // Calculate the sum of the subarray from i to j
      }

      if (sum > maxSum) {
        maxSum = sum; // Update maxSum if the current sum is greater
      }
    }
  }

  return maxSum;
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // 6
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // 8

// Time Complexity: O(n^3)
// Space Complexity: O(1)
```

```python
def find_maximum_subarray_sum(arr):
    n = len(arr)
    max_sum = arr[0]

    for i in range(n):
        for j in range(i, n):
            sub_sum = 0
            for k in range(i, j + 1):
                sub_sum += arr[k]

            if sub_sum > max_sum:
                max_sum = sub_sum

    return max_sum


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))           # 6
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3]))  # 8

# Time Complexity: O(n^3)
# Space Complexity: O(1)
```

```java
public class MaximumSubarraySum {
    public static int findMaximumSubarraySum(int[] arr) {
        int n = arr.length;
        int maxSum = arr[0]; // Initialize maxSum with the first element of the array

        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int sum = 0;
                for (int k = i; k <= j; k++) {
                    sum += arr[k]; // Calculate the sum of the subarray from i to j
                }

                if (sum > maxSum) {
                    maxSum = sum; // Update maxSum if the current sum is greater
                }
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumSubarraySum(new int[]{1, 2, 3, -9, 5})); // 6
        System.out.println(findMaximumSubarraySum(new int[]{-3, 2, 4, -1, 3, -4, 3})); // 8
    }
}

// Time Complexity: O(n^3)
// Space Complexity: O(1)
```

### 2. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Prefix Sum **O(N), O(N)**
```js
function findMaximumSubarraySum(arr) {
  let n = arr.length;
  let prefixSum = [];
  prefixSum[0] = arr[0];
  for (let i = 1; i < n; i++) {
    prefixSum[i] = prefixSum[i - 1] + arr[i];
  }

  let maxSum = arr[0];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = i; j < n; j++) {
      if (i === 0) {
        sum = prefixSum[j];
      } else {
        sum = prefixSum[j] - prefixSum[i - 1];
      }

      if (sum > maxSum) {
        maxSum = sum;
      }
    }
  }

  return maxSum;
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // 6
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // 8

// Time Complexity: O(n^2)
// Space Complexity: O(n)
```

```python
def find_maximum_subarray_sum(arr):
    n = len(arr)
    # Step 1: Create Prefix Sum Array
    prefix_sum = [0] * n
    prefix_sum[0] = arr[0]
    for i in range(1, n):
        prefix_sum[i] = prefix_sum[i - 1] + arr[i]

    max_sum = arr[0]

    # Step 2: Iterate through all possible subarrays
    for i in range(n):
        for j in range(i, n):
            # Calculate sum of subarray from i to j using prefix sum
            if i == 0:
                sub_sum = prefix_sum[j]
            else:
                sub_sum = prefix_sum[j] - prefix_sum[i - 1]

            if sub_sum > max_sum:
                max_sum = sub_sum

    return max_sum


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))           # 6
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3]))  # 8

# Time Complexity: O(n^2)
# Space Complexity: O(n)
```

```java
public class MaximumSubarraySum {
    public static int findMaximumSubarraySum(int[] arr) {
        int n = arr.length;
        int[] prefixSum = new int[n];
        prefixSum[0] = arr[0];
        for (int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i - 1] + arr[i];
        }

        int maxSum = arr[0];
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                if (i == 0) {
                    sum = prefixSum[j];
                } else {
                    sum = prefixSum[j] - prefixSum[i - 1];
                }

                if (sum > maxSum) {
                    maxSum = sum;
                }
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumSubarraySum(new int[]{1, 2, 3, -9, 5})); // 6
        System.out.println(findMaximumSubarraySum(new int[]{-3, 2, 4, -1, 3, -4, 3})); // 8
    }
}

// Time Complexity: O(n^2)
// Space Complexity: O(n)
```

### 3. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Carry Forward **O(N), O(1)**
```js
function findMaximumSubarraySum(arr) {
  let maxSum = Number.MIN_SAFE_INTEGER; // or -Infinity
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = i; j < n; j++) {
      sum += arr[j];
      if (sum > maxSum) {
        maxSum = sum;
      }
    }
  }

  return maxSum;
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // 6
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // 8

// Time Complexity: O(n^2)
// Space Complexity: O(1)
```

```python
def find_maximum_subarray_sum(arr):
    max_sum = -float('inf')
    n = len(arr)

    for i in range(n):
        sub_sum = 0
        for j in range(i, n):
            sub_sum += arr[j]  # Carry forward sum from i to j-1
            if sub_sum > max_sum:
                max_sum = sub_sum

    return max_sum


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))           # 6
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3]))  # 8

# Time Complexity: O(n^2)
# Space Complexity: O(1)
```

```java
public class MaximumSubarraySum {
    public static int findMaximumSubarraySum(int[] arr) {
        int maxSum = Integer.MIN_VALUE; // or -Infinity
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            int sum = 0;
            for (int j = i; j < n; j++) {
                sum += arr[j];
                if (sum > maxSum) {
                    maxSum = sum;
                }
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumSubarraySum(new int[]{1, 2, 3, -9, 5})); // 6
        System.out.println(findMaximumSubarraySum(new int[]{-3, 2, 4, -1, 3, -4, 3})); // 8
    }
}

// Time Complexity: O(n^2)
// Space Complexity: O(1)
```

### 4. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Kadanes Algorithm **O(N), O(1)**
```js
function findMaximumSubarraySum(arr) {
  const n = arr.length;

  if (n === 0) return 0;

  let maxSum = arr[0];
  let currSum = 0;

  for (let i = 0; i < n; i++) {
    // Add the current element to the currSum
    currSum += arr[i];

    // Update maxSum if the current currSum is greater
    if (currSum > maxSum) {
      maxSum = currSum;
    }

    // If currSum becomes negative, reset it to 0
    // This is the key step in Kadane's algorithm
    // It allows us to start a new subarray from the next element
    // This is because a negative currSum will not contribute positively to any future subarray
    // So we reset it to 0 to start fresh subarray from the next index
    if (currSum < 0) {
      currSum = 0;
    }
  }

  return maxSum;
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // 6
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // 8

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def find_maximum_subarray_sum(arr):
    max_sum = arr[0]
    curr_sum = 0

    for num in arr:
        curr_sum += num

        if curr_sum > max_sum:
            max_sum = curr_sum

        if curr_sum < 0:
            curr_sum = 0

    return max_sum


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))             # 6
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3]))    # 8
print(find_maximum_subarray_sum([-2, -3, -1]))                 # -1
print(find_maximum_subarray_sum([1, 2, 3, 4, 5]))             # 15
print(find_maximum_subarray_sum([-1, -2, -3, -4, -5]))         # -1

# Time Complexity: O(n)
# Space Complexity: O(1)
```

```java
public class MaximumSubarraySum {
    public static int findMaximumSubarraySum(int[] arr) {
        int n = arr.length;

        if (n == 0) return 0;

        int maxSum = arr[0];
        int currSum = 0;

        for (int i = 0; i < n; i++) {
            // Add the current element to the currSum
            currSum += arr[i];

            // Update maxSum if the current currSum is greater
            if (currSum > maxSum) {
                maxSum = currSum;
            }

            // If currSum becomes negative, reset it to 0
            // This is the key step in Kadane's algorithm
            // It allows us to start a new subarray from the next element
            // This is because a negative currSum will not contribute positively to any future subarray
            // So we reset it to 0 to start fresh subarray from the next index
            if (currSum < 0) {
                currSum = 0;
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumSubarraySum(new int[]{1, 2, 3, -9, 5})); // 6
        System.out.println(findMaximumSubarraySum(new int[]{-3, 2, 4, -1, 3, -4, 3})); // 8
    }
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

## 2. Prefix Sum Advanced

### 1. Zero Based Queries I (Perform multiple Queries from i to last index) (Beggars Outside Temple) | Prefix Sum **O(N), O(N)**.
`N` beggars are sitting in a row outside a temple, and initially each beggar has `0` coins. Whenever a donor arrives, they choose a beggar at index `start` and give `value` coins to every beggar from `start` to the last beggar.

Each zero-based query is represented as `[start, value]`. Apply all queries and return an array containing the total coins held by each beggar.

```js
function performQueries(arr, queries) {
  for (let i = 0; i < queries.length; i++) {
    let [start, val] = queries[i];
    // Record val at start; it should affect start through the last index.
    arr[start] += val;
  }
  console.log(arr);
  // Combined changes starting at each index for first example : [-1, 3, 0, 0, 1]
  // Combined changes starting at each index for second example : [-3, 2, 0, 0, 5]

  // The first loop does not calculate each beggar's final earnings.
  // It creates a change array that records only where each donation starts.
  // For example, [-1, 3, 0, 0, 1] means:
  // - a net change of -1 starts at index 0,
  // - an additional 3 starts at index 1, and
  // - an additional 1 starts at index 4.
  // Prefix sum carries every recorded change to all following beggars:
  // [-1, 3, 0, 0, 1] -> [-1, 2, 2, 2, 3].
  // This avoids updating every beggar for every query: O(q + n) instead of O(q * n).
  let prefixSum = [];
  prefixSum[0] = arr[0];
  for (let i = 1; i < arr.length; i++) {
    prefixSum[i] = prefixSum[i - 1] + arr[i];
  }

  return prefixSum; // Final array after applying all queries.
}
let queries = [[1, 3], [0, 2], [4, 1], [0, -3]];
console.log(performQueries([0, 0, 0, 0, 0], queries)); // [-1, 2, 2, 2, 3]
let queries2 = [[1, 2], [0, 3], [4, 5], [0, -6]];
console.log(performQueries([0, 0, 0, 0, 0], queries2)); // [-3, -1, -1, -1, 4]

// Time Complexity: O(n + q)
// Space Complexity: O(n)
```

```python
def perform_queries(arr, queries):
    for start, val in queries:
        arr[start] += val

    # Prefix sum to carry forward values to the end
    for i in range(1, len(arr)):
        arr[i] += arr[i - 1]

    return arr


queries1 = [[1, 3], [0, 2], [4, 1], [0, -3]]
print(perform_queries([0, 0, 0, 0, 0], queries1))  # [-1, 2, 2, 2, 3]

queries2 = [[1, 2], [0, 3], [4, 5], [0, -6]]
print(perform_queries([0, 0, 0, 0, 0], queries2))  # [-3, -1, -1, -1, 4]

# Time Complexity: O(N + Q)
# Space Complexity: O(1)
```

```java
public class PerformQueries {
    public static int[] performQueries(int[] arr, int[][] queries) {
        for (int i = 0; i < queries.length; i++) {
            int start = queries[i][0];
            int val = queries[i][1];
            // Perform the query
            arr[start] += val;
        }
        System.out.println(Arrays.toString(arr));

        // Calculate prefix sum
        int[] prefixSum = new int[arr.length];
        prefixSum[0] = arr[0];
        for (int i = 1; i < arr.length; i++) {
            prefixSum[i] = prefixSum[i - 1] + arr[i];
        }

        return prefixSum;
    }

    public static void main(String[] args) {
        int[][] queries1 = {{1, 3}, {0, 2}, {4, 1}, {0, -3}};
        System.out.println(Arrays.toString(performQueries(new int[]{0, 0, 0, 0, 0}, queries1))); // [-1, 2, 2, 2, 3]

        int[][] queries2 = {{1, 2}, {0, 3}, {4, 5}, {0, -6}};
        System.out.println(Arrays.toString(performQueries(new int[]{0, 0, 0, 0, 0}, queries2))); // [-3, -1, -1, -1, 4]
    }
}
```

### 2. Zero Based Queries II (Perform multiple Queries from index i to j) (Beggars Outside Temple) | Prefix Sum **O(N), O(N)**.
Here we are stopping the donation at index j instead of going to the last beggar. Each zero-based query is represented as `[start, end, value]`. Apply all queries and return an array containing the total coins held by each beggar.

```js
function performQueries(arr, queries) {
    const n = arr.length;

    for (let i = 0; i < queries.length; i++) {
        let [start, end, val] = queries[i];
        arr[start] += val; // Start adding val from this index.
        if (end + 1 < n) { // Stop adding val after the end index.
            arr[end + 1] -= val;
        }
        console.log(arr);
    }

    // Convert the recorded changes into each beggar's final earnings.
    let prefixSum = [];
    prefixSum[0] = arr[0];
    for (let i = 1; i < n; i++) {
        prefixSum[i] = prefixSum[i - 1] + arr[i];
    }

    return prefixSum;
}
let queries = [[1, 3, 2], [5, 6, -1], [2, 5, 5], [0, 1, 4]];
console.log(performQueries([0, 0, 0, 0, 0, 0, 0], queries)); // [4, 6, 7, 7, 5, 4, -1]

// Time Complexity: O(n + q)
// Space Complexity: O(n)
```

```python
def perform_queries(arr, queries):
    n = len(arr)

    for start, end, val in queries:
        arr[start] += val
        if end + 1 < n:
            arr[end + 1] -= val

    # Convert recorded changes into final prefix sums
    prefix_sum = [0] * n
    prefix_sum[0] = arr[0]
    for i in range(1, n):
        prefix_sum[i] = prefix_sum[i - 1] + arr[i]

    return prefix_sum


queries = [[1, 3, 2], [5, 6, -1], [2, 5, 5], [0, 1, 4]]
print(perform_queries([0, 0, 0, 0, 0, 0, 0], queries))  # [4, 6, 7, 7, 5, 4, -1]

# Time Complexity: O(n + q)
# Space Complexity: O(n)
```

```java
public class PerformQueries {
    public static int[] performQueries(int[] arr, int[][] queries) {
        int n = arr.length;

        for (int i = 0; i < queries.length; i++) {
            int start = queries[i][0];
            int end = queries[i][1];
            int val = queries[i][2];
            arr[start] += val;
            if (end + 1 < n) {
                arr[end + 1] -= val;
            }
            System.out.println(Arrays.toString(arr));
        }

        // Calculate prefix sum
        int[] prefixSum = new int[n];
        prefixSum[0] = arr[0];
        for (int i = 1; i < n; i++) {
            prefixSum[i] = prefixSum[i - 1] + arr[i];
        }

        return prefixSum;
    }

    public static void main(String[] args) {
        int[][] queries = {{1, 3, 2}, {5, 6, -1}, {2, 5, 5}, {0, 1, 4}};
        System.out.println(Arrays.toString(performQueries(new int[]{0, 0, 0, 0, 0, 0, 0}, queries))); // [4, 6, 7, 7, 5, 4, -1]
    }
}
```

### 3. Zero Based Queries III (Perform multiple Queries from index i to j) (Beggars Outside Temple) when the initial array is non zero | Prefix Sum **O(N), O(N)**.
Here we already have an initial array of coins for the beggars. Each zero-based query is represented as `[start, end, value]`. Apply all queries and return an array containing the total coins held by each beggar.

```js
function performQueries(arr, queries) {
  // Store query changes separately from the original values.
  let diffArr = new Array(arr.length).fill(0);

  for (let i = 0; i < queries.length; i++) {
    let [start, end, val] = queries[i];
    diffArr[start] += val; // Start adding val from this index.
    if (end + 1 < diffArr.length) { // Stop adding val after the end index.
      diffArr[end + 1] -= val;
    }
  }

  // Get the total query change at each index.
  let prefixSum = [];
  prefixSum[0] = diffArr[0];
  for (let i = 1; i < diffArr.length; i++) {
    prefixSum[i] = prefixSum[i - 1] + diffArr[i];
  }

  // Add each beggar's original coins.
  for (let i = 0; i < arr.length; i++) {
    prefixSum[i] += arr[i];
  }

  return prefixSum;
}
let queries = [[0, 2, 2], [1, 3, 3], [2, 4, 4]];
console.log(performQueries([1, 2, 3, 4, 5], queries)); // [3, 7, 12, 11, 9]

// Time Complexity: O(n + q)
// Space Complexity: O(n)
```

```python
from collections import defaultdict


def perform_queries(arr, queries):
    # Store query changes in a hash map: index -> net change
    diff = defaultdict(int)

    for start, end, val in queries:
        diff[start] += val
        diff[end + 1] -= val

    # Build the final array
    result = [0] * len(arr)
    running_add = 0
    for i in range(len(arr)):
        running_add += diff[i]
        result[i] = arr[i] + running_add

    return result


queries = [[1, 3, 2], [5, 6, -1], [2, 5, 5], [0, 1, 4]]
print(perform_queries([0, 0, 0, 0, 0, 0, 0], queries))  # [4, 6, 7, 7, 5, 4, -1]

# Time Complexity: O(n + q)
# Space Complexity: O(q)
```

```java
public class PerformQueries {
    public static int[] performQueries(int[] arr, int[][] queries) {
        // Calculate the difference array
        // Initialize the difference array with the same length as arr
        int[] diffArr = new int[arr.length];

        // Iterate through the queries and update the difference array
        for (int i = 0; i < queries.length; i++) {
            int start = queries[i][0];
            int end = queries[i][1];
            int val = queries[i][2];
            diffArr[start] += val;
            if (end + 1 < diffArr.length) {
                diffArr[end + 1] -= val;
            }
        }

        // Calculate prefix sum to get the final array
        int[] prefixSum = new int[diffArr.length];
        prefixSum[0] = diffArr[0];
        for (int i = 1; i < diffArr.length; i++) {
            prefixSum[i] = prefixSum[i - 1] + diffArr[i];
        }

        // Add the original array values to the prefix sum
        for (int i = 0; i < arr.length; i++) {
            prefixSum[i] += arr[i];
        }

        return prefixSum;
    }

    public static void main(String[] args) {
        int[][] queries = {{0, 2, 2}, {1, 3, 3}, {2, 4, 4}};
        System.out.println(Arrays.toString(performQueries(new int[]{1, 2, 3, 4, 5}, queries))); // [3, 7, 12, 11, 9]
    }
}
```

## 3. Two Pointers

### 1. Trapping Rain Water / Rain Water Trapped | Prefix Sum **O(N), O(N)** | Two Pointers **O(N), O(1)**.
Imagine a histogram where the bars' heights are given by the array A. Each bar is of uniform width, which is 1 unit. When it rains, water will accumulate in the valleys between the bars.

Your task is to calculate the total amount of water that can be trapped in these valleys.

Example: `A = [3, 0, 2, 0, 4, 0, 2]`

```text

   Height
    4 |                 ###
    3 | ### ~~~ ~~~ ~~~ ###
    2 | ### ~~~ ### ~~~ ### ~~~ ###
    1 | ### ~~~ ### ~~~ ### ~~~ ###
      +-----------------------------
        0   1   2   3   4   5   6   Index

    ### = histogram bar
    ~~~ = trapped water
```

For every index, `water = min(leftMax, rightMax) - heights[i]`.

```text
Index:     0  1  2  3  4  5  6
Height:    3  0  2  0  4  0  2
Water:     0  3  1  3  0  2  0
-----
Total trapped water = 9 units
```

```js
function trap(heights) {
    // Pointers delimit the part of the array that is not processed yet.
    let left = 0, right = heights.length - 1;

    // Highest bars found so far while moving inward from each side.
    let leftMax = 0, rightMax = 0;

    // Total water collected above all processed bars.
    let water = 0;

    // Each iteration processes one bar, so both pointers move at most n times.
    while (left < right) {
        // Process the shorter boundary. Since heights[right] is at least
        // heights[left], the left bar already has a sufficient boundary on the
        // right. Therefore, water above left depends only on leftMax.
        if (heights[left] < heights[right]) {
            if (heights[left] >= leftMax) {
                // This bar becomes the new left boundary; no water sits above it.
                leftMax = heights[left];
            } else {
                // leftMax is taller, so the difference is trapped above this bar.
                water += leftMax - heights[left];
            }
            // The current left bar is fully resolved.
            left++;
        } else {
            // heights[left] is at least heights[right], so the right bar has a
            // sufficient boundary on the left. Its water depends only on rightMax.
            if (heights[right] >= rightMax) {
                // This bar becomes the new right boundary; no water sits above it.
                rightMax = heights[right];
            } else {
                // rightMax is taller, so the difference is trapped above this bar.
                water += rightMax - heights[right];
            }
            // The current right bar is fully resolved.
            right--;
        }
    }

    return water;
}
console.log(trap([3, 0, 2, 0, 4, 0, 2])); // 9
console.log(trap([5, 4, 1, 4, 3, 2, 7])); // 11
console.log(trap([5, 2, 1, 4])); // 5

// Detailed dry run for the first example: [3, 0, 2, 0, 4, 0, 2]
// Start: left=0, right=6, leftMax=0, rightMax=0, water=0
// Step 1: heights[left]=3, heights[right]=2 -> process right
//         rightMax=max(0,2)=2, water+=0, right=5
// Step 2: heights[left]=3, heights[right]=0 -> process right
//         water += rightMax - heights[5] = 2 - 0 = 2, right=4, water=2
// Step 3: heights[left]=3, heights[right]=4 -> process left
//         leftMax=max(0,3)=3, water+=0, left=1
// Step 4: heights[left]=0, heights[right]=4 -> process left
//         water += leftMax - heights[1] = 3 - 0 = 3, left=2, water=5
// Step 5: heights[left]=2, heights[right]=4 -> process left
//         water += leftMax - heights[2] = 3 - 2 = 1, left=3, water=6
// Step 6: heights[left]=0, heights[right]=4 -> process left
//         water += leftMax - heights[3] = 3 - 0 = 3, left=4, water=9
// Stop: left == right, final trapped water = 9

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def trap(heights):
    if not heights or len(heights) < 3:
        return 0

    left = 0
    right = len(heights) - 1
    left_max = 0
    right_max = 0
    trapped_water = 0

    while left < right:
        if heights[left] <= heights[right]:
            if heights[left] >= left_max:
                left_max = heights[left]
            else:
                trapped_water += left_max - heights[left]
            left += 1
        else:
            if heights[right] >= right_max:
                right_max = heights[right]
            else:
                trapped_water += right_max - heights[right]
            right -= 1

    return trapped_water


print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))  # 6
print(trap([4, 2, 0, 3, 2, 5]))                      # 9

# Time Complexity: O(n)
# Space Complexity: O(1)
```

```java
public class Main {
    public static int trap(int[] heights) {
        int n = heights.length;
        if (n == 0) {
            return 0;
        }

        int left = 0;
        int right = n - 1;
        int leftMax = 0;
        int rightMax = 0;
        int water = 0;

        while (left < right) {
            // Resolve the side with smaller height first.
            if (heights[left] <= heights[right]) {
                if (heights[left] >= leftMax) {
                    leftMax = heights[left];
                } else {
                    water += leftMax - heights[left];
                }
                left++;
            } else {
                if (heights[right] >= rightMax) {
                    rightMax = heights[right];
                } else {
                    water += rightMax - heights[right];
                }
                right--;
            }
        }

        return water;
    }

    public static void main(String[] args) {
        System.out.println(trap(new int[] {3, 0, 2, 0, 4, 0, 2})); // 9
        System.out.println(trap(new int[] {5, 4, 1, 4, 3, 2, 7})); // 11
        System.out.println(trap(new int[] {5, 2, 1, 4})); // 5
    }
}
```

## 4. Interval Technique

### 1. Merge Overlapping Intervals. **O(N), O(1)**.
```js
function mergeIntervals(intervals) {
    // If there are no intervals or only one, no merging is needed.
    if (!intervals || intervals.length <= 1) {
        return intervals;
    }

    // Sort the intervals based on their start time (the first element of each sub-array).
    // This is crucial for the merging logic to work correctly.
    intervals.sort((a, b) => a[0] - b[0]);

    // Initialize an array to store the merged intervals.
    let result = [];

    // Start with the first interval as the current interval to merge.
    let start = intervals[0][0];
    let end = intervals[0][1];

    // Iterate through the sorted intervals, starting from the second one.
    for (let i = 1; i < intervals.length; i++) {
        const currentInterval = intervals[i];

        // Check if the current interval overlaps with the merged interval (currentInterval[0] <= end).
        if (currentInterval[0] <= end) {
            // If they overlap, extend the 'end' of the merged interval
            // to include the end of the current interval, if it's larger.
            end = Math.max(end, currentInterval[1]);
        } else {
            // If there is no overlap, the previous merged interval is complete.
            // Push the [start, end] pair to the result array.
            result.push([start, end]);

            // Start a new merged interval using the current interval's start and end.
            start = currentInterval[0];
            end = currentInterval[1];
        }
    }

    // After the loop finishes, push the last merged interval into the result.
    // This handles the final interval (or the only interval if there was just one).
    result.push([start, end]);

    // Return the array of non-overlapping, merged intervals.
    return result;
}

let intervals1 = [[2, 6], [3, 7]];
// Sorted: [[2, 6], [3, 7]]
// 1. start=2, end=6
// 2. i=1: [3, 7]. 3 <= 6 (overlap). end = max(6, 7) = 7.
// 3. Loop ends. Push [2, 7].
console.log(mergeIntervals(intervals1)); // [[2, 7]]

let intervals2 = [[5, 8], [1, 3]];
// Sorted: [[1, 3], [5, 8]]
// 1. start=1, end=3
// 2. i=1: [5, 8]. 5 > 3 (no overlap).
// 3. Push [1, 3].
// 4. Reset: start=5, end=8.
// 5. Loop ends. Push [5, 8].
console.log(mergeIntervals(intervals2)); // [[1, 3], [5, 8]]

let intervals3 = [[5, 6], [0, 3], [4, 7], [6, 9]];
// Sorted: [[0, 3], [4, 7], [5, 6], [6, 9]]
// 1. start=0, end=3
// 2. i=1: [4, 7]. 4 > 3 (no overlap).
// 3. Push [0, 3].
// 4. Reset: start=4, end=7.
// 5. i=2: [5, 6]. 5 <= 7 (overlap). end = max(7, 6) = 7.
// 6. i=3: [6, 9]. 6 <= 7 (overlap). end = max(7, 9) = 9.
// 7. Loop ends. Push [4, 9].
console.log(mergeIntervals(intervals3)); // [[0, 3], [4, 9]]

// Time Complexity: O(nlogn)
// Space Complexity: O(n)
```

```python
def merge_intervals(intervals):
    if not intervals:
        return []

    # Sort intervals by start time
    intervals.sort(key=lambda x: x[0])

    merged = [intervals[0]]

    for i in range(1, len(intervals)):
        curr_start, curr_end = intervals[i]
        last_start, last_end = merged[-1]

        if curr_start <= last_end:
            # Overlapping intervals, merge them
            merged[-1] = [last_start, max(last_end, curr_end)]
        else:
            merged.append(intervals[i])

    return merged


print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))  # [[1, 6], [8, 10], [15, 18]]
print(merge_intervals([[1, 4], [4, 5]]))                      # [[1, 5]]

# Time Complexity: O(N log N) - due to sorting
# Space Complexity: O(1) - excluding output
```

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Main {
    public static int[][] mergeIntervals(int[][] intervals) {
        if (intervals == null || intervals.length <= 1) {
            return intervals;
        }

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        List<int[]> result = new ArrayList<>();
        int start = intervals[0][0];
        int end = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            int[] current = intervals[i];

            if (current[0] <= end) {
                end = Math.max(end, current[1]);
            } else {
                result.add(new int[] {start, end});
                start = current[0];
                end = current[1];
            }
        }

        result.add(new int[] {start, end});

        return result.toArray(new int[result.size()][]);
    }

    public static void main(String[] args) {
        int[][] intervals1 = {{2, 6}, {3, 7}};
        int[][] intervals2 = {{5, 8}, {1, 3}};
        int[][] intervals3 = {{5, 6}, {0, 3}, {4, 7}, {6, 9}};

        System.out.println(Arrays.deepToString(mergeIntervals(intervals1))); // [[2, 7]]
        System.out.println(Arrays.deepToString(mergeIntervals(intervals2))); // [[1, 3], [5, 8]]
        System.out.println(Arrays.deepToString(mergeIntervals(intervals3))); // [[0, 3], [4, 9]]
    }
}

```

## 5. Kadane's Algorithm

### 1. Max Sum Contiguous Subarray / Maximum Subarray Sum. Negative numbers allowed. **O(N), O(1)**.
```js
function findMaximumSubarraySum(arr) {
  const n = arr.length;

  if (n === 0) return 0;

  let maxSum = arr[0];
  let currSum = 0;

  for (let i = 0; i < n; i++) {
    // Add the current element to the currSum
    currSum += arr[i];

    // Update maxSum if the current currSum is greater
    if (currSum > maxSum) {
      maxSum = currSum;
    }

    // If currSum becomes negative, reset it to 0
    // This is the key step in Kadane's algorithm
    // It allows us to start a new subarray from the next element
    // This is because a negative currSum will not contribute positively to any future subarray
    // So we reset it to 0 to start fresh subarray from the next index
    if (currSum < 0) {
      currSum = 0;
    }
  }

  return maxSum;
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // 6
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // 8

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def find_maximum_subarray_sum(arr):
    n = len(arr)
    max_sum = arr[0]
    curr_sum = 0

    for i in range(n):
        curr_sum += arr[i]

        if curr_sum > max_sum:
            max_sum = curr_sum

        if curr_sum < 0:
            curr_sum = 0

    return max_sum


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))           # 6
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3]))  # 8
print(find_maximum_subarray_sum([-2, -3, -1]))               # -1

# Time Complexity: O(n)
# Space Complexity: O(1)
```

```java
public class MaximumSubarraySum {
    public static int findMaximumSubarraySum(int[] arr) {
        int n = arr.length;

        if (n == 0) return 0;

        int maxSum = arr[0];
        int currSum = 0;

        for (int i = 0; i < n; i++) {
            // Add the current element to the currSum
            currSum += arr[i];

            // Update maxSum if the current currSum is greater
            if (currSum > maxSum) {
                maxSum = currSum;
            }

            // If currSum becomes negative, reset it to 0
            // This is the key step in Kadane's algorithm
            // It allows us to start a new subarray from the next element
            // This is because a negative currSum will not contribute positively to any future subarray
            // So we reset it to 0 to start fresh subarray from the next index
            if (currSum < 0) {
                currSum = 0;
            }
        }

        return maxSum;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumSubarraySum(new int[]{1, 2, 3, -9, 5})); // 6
        System.out.println(findMaximumSubarraySum(new int[]{-3, 2, 4, -1, 3, -4, 3})); // 8
    }
}

// Time Complexity: O(n)
// Space Complexity: O(1)
```

### 2. Find the maximum subarray sum as well as the subarray itself. Negative numbers allowed. **O(N), O(1)**.

```js
function findMaximumSubarraySum(arr) {
  let maxSum = arr[0];
  let currSum = 0;
  let start = 0;
  let end = 0;
  let tempStart = 0;

  for (let i = 0; i < arr.length; i++) {
    currSum += arr[i];

    if (currSum > maxSum) {
      maxSum = currSum;
      start = tempStart;
      end = i;
    }

    if (currSum < 0) {
      currSum = 0;
      tempStart = i + 1;
    }
  }

  return { maxSum, subarray: arr.slice(start, end + 1) };
}
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5])); // { maxSum: 6, subarray: [1, 2, 3] }
console.log(findMaximumSubarraySum([1, 2, 3, -9, 5, 4])); // { maxSum: 9 , subarray: [5, 4] }
console.log(findMaximumSubarraySum([-3, 2, 4, -1, 3, -4, 3])); // { maxSum: 8, subarray: [2, 4, -1, 3] }
console.log(findMaximumSubarraySum([-2, -3, -1])); // { maxSum: -1, subarray: [-1] }
console.log(findMaximumSubarraySum([1, 2, 3, 4, 5])); // { maxSum: 15, subarray: [1, 2, 3, 4, 5] }

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def find_maximum_subarray_sum(arr):
    max_sum = arr[0]
    curr_sum = 0
    start = 0
    end = 0
    temp_start = 0

    for i in range(len(arr)):
        curr_sum += arr[i]

        if curr_sum > max_sum:
            max_sum = curr_sum
            start = temp_start
            end = i

        if curr_sum < 0:
            curr_sum = 0
            temp_start = i + 1

    return {"max_sum": max_sum, "subarray": arr[start:end + 1]}


print(find_maximum_subarray_sum([1, 2, 3, -9, 5]))          # {'max_sum': 6, 'subarray': [1, 2, 3]}
print(find_maximum_subarray_sum([1, 2, 3, -9, 5, 4]))       # {'max_sum': 9, 'subarray': [5, 4]}
print(find_maximum_subarray_sum([-3, 2, 4, -1, 3, -4, 3])) # {'max_sum': 8, 'subarray': [2, 4, -1, 3]}
print(find_maximum_subarray_sum([-2, -3, -1]))              # {'max_sum': -1, 'subarray': [-1]}
print(find_maximum_subarray_sum([1, 2, 3, 4, 5]))           # {'max_sum': 15, 'subarray': [1, 2, 3, 4, 5]}

# Time Complexity: O(n)
# Space Complexity: O(1)
```

```java
import java.util.Arrays;

public class MaximumSubarrayWithElements {
    static class Result {
        int maxSum;
        int[] subarray;

        Result(int maxSum, int[] subarray) {
            this.maxSum = maxSum;
            this.subarray = subarray;
        }
    }

    public static Result findMaximumSubarraySum(int[] arr) {
        int maxSum = arr[0];
        int currSum = 0;
        int start = 0;
        int end = 0;
        int tempStart = 0;

        for (int i = 0; i < arr.length; i++) {
            currSum += arr[i];

            if (currSum > maxSum) {
                maxSum = currSum;
                start = tempStart;
                end = i;
            }

            if (currSum < 0) {
                currSum = 0;
                tempStart = i + 1;
            }
        }

        int[] bestSubarray = Arrays.copyOfRange(arr, start, end + 1);
        return new Result(maxSum, bestSubarray);
    }

    public static void main(String[] args) {
        Result r1 = findMaximumSubarraySum(new int[] {1, 2, 3, -9, 5});
        Result r2 = findMaximumSubarraySum(new int[] {1, 2, 3, -9, 5, 4});
        Result r3 = findMaximumSubarraySum(new int[] {-3, 2, 4, -1, 3, -4, 3});
        Result r4 = findMaximumSubarraySum(new int[] {-2, -3, -1});
        Result r5 = findMaximumSubarraySum(new int[] {1, 2, 3, 4, 5});

        System.out.println("{ maxSum: " + r1.maxSum + ", subarray: " + Arrays.toString(r1.subarray) + " }");
        System.out.println("{ maxSum: " + r2.maxSum + ", subarray: " + Arrays.toString(r2.subarray) + " }");
        System.out.println("{ maxSum: " + r3.maxSum + ", subarray: " + Arrays.toString(r3.subarray) + " }");
        System.out.println("{ maxSum: " + r4.maxSum + ", subarray: " + Arrays.toString(r4.subarray) + " }");
        System.out.println("{ maxSum: " + r5.maxSum + ", subarray: " + Arrays.toString(r5.subarray) + " }");
    }
}
```

### 3. Flip. Maximize 1s in Binary String. Return indices of flip. **O(N), O(1)**.
```
You are given a binary string A(i.e., with characters 0 and 1) consisting of characters A1, A2, ..., AN. In a single operation, you can choose two indices, L and R, such that 1 ≤ L ≤ R ≤ N and flip the characters AL, AL+1, ..., AR. By flipping, we mean changing character 0 to 1 and vice-versa.

Your aim is to perform ATMOST one operation such that in the final string number of 1s is maximized.

If you don't want to perform the operation, return an empty array. Else, return an array consisting of two elements denoting L and R. If there are multiple solutions, return the lexicographically smallest pair of L and R.

NOTE: Pair (a, b) is lexicographically smaller than pair (c, d) if a < c or, if a == c and b < d.
```

#### Input / Output
```
Input : A = "010"
Output : [1, 1]
Explanation : Flipping the first element will give us 110 which is the maximum number of 1s we can have. We cant flip the second or third element as it will give us 101 or 011 which is same as flipping the first element. So we return the lexicographically smallest pair [1, 1].

Input : A = "111"
Output : []
Explanation : No operation is needed as there are already maximum number of 1s.

Input : A = "000"
Output : [1, 3]
Explanation : Flipping the whole array will give us 111 which is the maximum number of 1s we can have.
```

```js
function flip(A) {
  const n = A.length;
  let maxSum = 0;
  let currentSum = 0;
  let start = 0, end = 0, tempStart = 0;
  let noChange = true;

  // Kadane's algorithm to find the maximum subarray
  for (let i = 0; i < n; i++) {
    const value = A[i] === '0' ? 1 : -1;
    currentSum += value;

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
      noChange = false;
    }

    if (currentSum < 0) {
      currentSum = 0;
      tempStart = i + 1;
    }
  }

  // If no improvement is possible, return an empty array
  if (noChange) {
    return [];
  }

  // Return 1-based indices
  return [start + 1, end + 1];
}
console.log(flip("010")); // [1, 1]
console.log(flip("111")); // []
console.log(flip("000")); // [1, 3]
console.log(flip("110")); // [3, 3]
console.log(flip("101")); // [2, 2]
console.log(flip("111000")); // [4, 6]
console.log(flip("000111")); // [1, 3]
console.log(flip("111111")); // []
console.log(flip("110011")); // [3, 4]
console.log(flip("101010")); // [2, 2]
console.log(flip("010101")); // [1, 1]
console.log(flip("111000")); // [4, 6]

// Time Complexity : O(N)
// Space Complexity : O(1)
```

```python
def flip(A):
    n = len(A)
    max_sum = 0
    current_sum = 0
    start = 0
    end = 0
    temp_start = 0
    no_change = True

    # Kadane's algorithm: map '0' -> +1, '1' -> -1
    for i in range(n):
        val = 1 if A[i] == '0' else -1
        current_sum += val

        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i
            no_change = False

        if current_sum < 0:
            current_sum = 0
            temp_start = i + 1

    if no_change:
        return []

    # Return 1-based indices
    return [start + 1, end + 1]


print(flip("010"))     # [1, 1]
print(flip("111"))     # []
print(flip("000"))     # [1, 3]
print(flip("110"))     # [3, 3]
print(flip("101"))     # [2, 2]
print(flip("111000"))  # [4, 6]

# Time Complexity: O(N)
# Space Complexity: O(1)
```

```java
import java.util.Arrays;

public class FlipBinaryString {
    public static int[] flip(String s) {
        int n = s.length();

        int maxSum = 0;
        int currentSum = 0;
        int start = 0;
        int end = 0;
        int tempStart = 0;
        boolean noChange = true;

        for (int i = 0; i < n; i++) {
            // Treat '0' as +1 (gain a 1 after flip), '1' as -1 (lose a 1 after flip).
            int value = (s.charAt(i) == '0') ? 1 : -1;
            currentSum += value;

            if (currentSum > maxSum) {
                maxSum = currentSum;
                start = tempStart;
                end = i;
                noChange = false;
            }

            if (currentSum < 0) {
                currentSum = 0;
                tempStart = i + 1;
            }
        }

        if (noChange) {
            return new int[0];
        }

        // Return 1-based indices.
        return new int[] {start + 1, end + 1};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(flip("010"))); // [1, 1]
        System.out.println(Arrays.toString(flip("111"))); // []
        System.out.println(Arrays.toString(flip("000"))); // [1, 3]
        System.out.println(Arrays.toString(flip("110"))); // [3, 3]
        System.out.println(Arrays.toString(flip("101"))); // [2, 2]
        System.out.println(Arrays.toString(flip("111000"))); // [4, 6]
        System.out.println(Arrays.toString(flip("000111"))); // [1, 3]
        System.out.println(Arrays.toString(flip("111111"))); // []
        System.out.println(Arrays.toString(flip("110011"))); // [3, 4]
        System.out.println(Arrays.toString(flip("101010"))); // [2, 2]
        System.out.println(Arrays.toString(flip("010101"))); // [1, 1]
        System.out.println(Arrays.toString(flip("111000"))); // [4, 6]
    }
}
```

## 6. 2D Arrays / Matrix Advanced

### 1. Find element in rowwise and colwise sorted matrix. | Staircase Search **O(N+M), O(1)**
```js
function findElement(matrix, target) {
  // if matrix is empty return false
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return false;

  const n = matrix.length;       // Number of rows
  const m = matrix[0].length;    // Number of columns

  // Start at the top-right corner of the matrix
  let i = 0;          // Row index, starting at first row
  let j = m - 1;      // Column index, starting at last column
  const path = [];    // Array to store the path

  // Iterate while indices are within the matrix bounds
  while (i < n && j >= 0) {
    const current = matrix[i][j];
    path.push(`[${i}, ${j}]`); // Add current position to path

    // If the current element matches the target, we've found it
    if (current === target) {
      console.log(`Path for ${target}:`, path);
      return true;
    }

    // If current element is less than the target,
    // move down to the next row to increase the value
    if (current < target) {
      i++;
    }
    // Otherwise (current > target),
    // move left to the previous column to decrease the value
    else {
      j--;
    }
  }

  // If we exit the loop, the target is not present in the matrix
  console.log(`Path for ${target}:`, path);
  return false;
}
const mat = [
  [1, 4, 7, 11, 15],
  [2, 5, 8, 12, 19],
  [3, 6, 9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30]
];
console.log(findElement(mat, 5));   // true // path [ '[0, 4]', '[0, 3]', '[0, 2]', '[0, 1]', '[1, 1]' ]
console.log(findElement(mat, 16));  // true // path [ '[0, 4]', '[1, 4]', '[1, 3]', '[2, 3]' ]
console.log(findElement(mat, 20));  // false // path [ '[0, 4]', '[1, 4]', '[2, 4]', '[2, 3]', '[3, 3]', '[4, 3]', '[4, 2]', '[4, 1]', '[4, 0]' ]

// Time Complexity: O(N+M)
// Space Complexity: O(1)
```

```python
def find_element(matrix, target):
    if not matrix or not matrix[0]:
        return False

    rows = len(matrix)
    cols = len(matrix[0])

    # Start at top-right corner
    r = 0
    c = cols - 1

    while r < rows and c >= 0:
        val = matrix[r][c]
        if val == target:
            return True
        elif val > target:
            c -= 1
        else:
            r += 1

    return False


matrix = [
    [1, 4, 7, 11, 15],
    [2, 5, 8, 12, 19],
    [3, 6, 9, 16, 22],
    [10, 13, 14, 17, 24],
    [18, 21, 23, 26, 30]
]
print(find_element(matrix, 5))   # True
print(find_element(matrix, 20))  # False

# Time Complexity: O(N + M)
# Space Complexity: O(1)
```

```java
import java.util.ArrayList;
import java.util.List;

public class FindElementInSortedMatrix {
    public static boolean findElement(int[][] matrix, int target) {
        // if matrix is empty return false
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return false;
        }

        int n = matrix.length;       // Number of rows
        int m = matrix[0].length;    // Number of columns

        // Start at the top-right corner of the matrix
        int i = 0;          // Row index, starting at first row
        int j = m - 1;      // Column index, starting at last column
        List<String> path = new ArrayList<>(); // List to store the path

        // Iterate while indices are within the matrix bounds
        while (i < n && j >= 0) {
            int current = matrix[i][j];
            path.add("[" + i + ", " + j + "]"); // Add current position to path

            // If the current element matches the target, we've found it
            if (current == target) {
                System.out.println("Path for " + target + ": " + path);
                return true;
            }

            // If current element is less than the target,
            // move down to the next row to increase the value
            if (current < target) {
                i++;
            }
            // Otherwise (current > target),
            // move left to the previous column to decrease the value
            else {
                j--;
            }
        }

        // If we exit the loop, the target is not present in the matrix
        System.out.println("Path for " + target + ": " + path);
        return false;
    }

    public static void main(String[] args) {
        int[][] mat = {
            {1, 4, 7, 11, 15},
            {2, 5, 8, 12, 19},
            {3, 6, 9, 16, 22},
            {10, 13, 14, 17, 24},
            {18, 21, 23, 26, 30}
        };
        System.out.println(findElement(mat, 5));   // true
        System.out.println(findElement(mat, 16));  // true
        System.out.println(findElement(mat, 20));  // false
    }
}

// Time Complexity: O(N+M)
// Space Complexity: O(1)
```

### 2. Row with maximum number of ones. | Staircase Search **O(N+M), O(1)**
```js
function maxOnesRow(A) {
  const rows = A.length;
  const cols = A[0].length;

  let maxRow = -1; // To store the row index with the maximum 1s
  let col = cols - 1; // Start from the top-right corner

  // Traverse rows from top to bottom
  for (let row = 0; row < rows; row++) {
    // Move left while there are 1s in the current row
    while (col >= 0 && A[row][col] === 1) {
      col--; // Move left
      maxRow = row; // Update maxRow to the current row
    }
  }

  return maxRow; // Return the row with the maximum number of 1s
}
console.log(maxOnesRow([[0, 1, 1], [0, 0, 1], [0, 1, 1]])); // 0
console.log(maxOnesRow([[0, 1, 1, 1], [0, 0, 1, 1], [0, 1, 1, 1], [0, 0, 0, 1]])); // 0
console.log(maxOnesRow([[0, 0, 0, 0], [0, 0, 1, 1], [0, 1, 1, 1], [1, 1, 1, 1]])); // 3

// Time Complexity : O(N + M)
// Space Complexity : O(1)
```

```python
def max_ones_row(A):
    rows = len(A)
    cols = len(A[0])
    r = 0
    c = cols - 1
    best_row = -1

    # Start at top-right and move left when 1, down when 0
    while r < rows and c >= 0:
        if A[r][c] == 1:
            best_row = r
            c -= 1
        else:
            r += 1

    return best_row


matrix = [
    [0, 1, 1],
    [0, 0, 1],
    [0, 1, 1]
]
print(max_ones_row(matrix))  # 0

# Time Complexity: O(N + M)
# Space Complexity: O(1)
```

```java
public class RowWithMaxOnes {
    public static int maxOnesRow(int[][] A) {
        int rows = A.length;
        int cols = A[0].length;

        int maxRow = -1; // To store the row index with the maximum 1s
        int col = cols - 1; // Start from the top-right corner

        // Traverse rows from top to bottom
        for (int row = 0; row < rows; row++) {
            // Move left while there are 1s in the current row
            while (col >= 0 && A[row][col] == 1) {
                col--; // Move left
                maxRow = row; // Update maxRow to the current row
            }
        }

        return maxRow; // Return the row with the maximum number of 1s
    }

    public static void main(String[] args) {
        System.out.println(maxOnesRow(new int[][]{{0, 1, 1}, {0, 0, 1}, {0, 1, 1}})); // 0
        System.out.println(maxOnesRow(new int[][]{{0, 1, 1, 1}, {0, 0, 1, 1}, {0, 1, 1, 1}, {0, 0, 0, 1}})); // 0
        System.out.println(maxOnesRow(new int[][]{{0, 0, 0, 0}, {0, 0, 1, 1}, {0, 1, 1, 1}, {1, 1, 1, 1}})); // 3
    }
}

// Time Complexity : O(N + M)
// Space Complexity : O(1)
```

### 3. Print Boundary Elements of a 2D Matrix in Clockwise Manner / 2D Matrix Spiral Traversal. | Boundary Traversal **O(N*M), O(1)**
```js
function printBoundary(matrix) {
    const totalRows = matrix.length;
    const totalCols = matrix[0].length;
    const boundaryElements = [];

    // Start at the top-left corner
    let row = 0;
    let col = 0;

    // 1. Traverse the Top Boundary (Left to Right)
    // We collect (totalCols - 1) elements, leaving the top-right corner for the next step
    for (let step = 1; step < totalCols; step++) {
        boundaryElements.push(matrix[row][col]);
        col++; // Move right
    }

    // 2. Traverse the Right Boundary (Top to Bottom)
    // We collect (totalRows - 1) elements, leaving the bottom-right corner for the next step
    for (let step = 1; step < totalRows; step++) {
        boundaryElements.push(matrix[row][col]);
        row++; // Move down
    }

    // 3. Traverse the Bottom Boundary (Right to Left)
    // We collect (totalCols - 1) elements, leaving the bottom-left corner for the next step
    for (let step = 1; step < totalCols; step++) {
        boundaryElements.push(matrix[row][col]);
        col--; // Move left
    }

    // 4. Traverse the Left Boundary (Bottom to Top)
    // We collect (totalRows - 1) elements, stopping just below our starting point
    for (let step = 1; step < totalRows; step++) {
        boundaryElements.push(matrix[row][col]);
        row--; // Move up
    }

    return boundaryElements;
}
const matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16]
];
console.log(printBoundary(matrix)); // [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5]

// Time Complexity: O(N * M)
// Space Complexity: O(1)
```

```python
def print_boundary(matrix):
    if not matrix:
        return []

    total_rows = len(matrix)
    total_cols = len(matrix[0])
    result = []

    # Top boundary: left to right
    for c in range(total_cols - 1):
        result.append(matrix[0][c])

    # Right boundary: top to bottom
    for r in range(total_rows - 1):
        result.append(matrix[r][total_cols - 1])

    # Bottom boundary: right to left
    for c in range(total_cols - 1, 0, -1):
        result.append(matrix[total_rows - 1][c])

    # Left boundary: bottom to top
    for r in range(total_rows - 1, 0, -1):
        result.append(matrix[r][0])

    return result


matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print(print_boundary(matrix))  # [1, 2, 3, 6, 9, 8, 7, 4]

# Time Complexity: O(N + M)
# Space Complexity: O(1)
```

```java
import java.util.ArrayList;
import java.util.List;

public class PrintBoundary {
    public static List<Integer> printBoundary(int[][] matrix) {
        int totalRows = matrix.length;
        int totalCols = matrix[0].length;
        List<Integer> boundaryElements = new ArrayList<>();

        // Start at the top-left corner
        int row = 0;
        int col = 0;

        // 1. Traverse the Top Boundary (Left to Right)
        // We collect (totalCols - 1) elements, leaving the top-right corner for the next step
        for (int step = 1; step < totalCols; step++) {
            boundaryElements.add(matrix[row][col]);
            col++; // Move right
        }

        // 2. Traverse the Right Boundary (Top to Bottom)
        // We collect (totalRows - 1) elements, leaving the bottom-right corner for the next step
        for (int step = 1; step < totalRows; step++) {
            boundaryElements.add(matrix[row][col]);
            row++; // Move down
        }

        // 3. Traverse the Bottom Boundary (Right to Left)
        // We collect (totalCols - 1) elements, leaving the bottom-left corner for the next step
        for (int step = 1; step < totalCols; step++) {
            boundaryElements.add(matrix[row][col]);
            col--; // Move left
        }

        // 4. Traverse the Left Boundary (Bottom to Top)
        // We collect (totalRows - 1) elements, stopping just below our starting point
        for (int step = 1; step < totalRows; step++) {
            boundaryElements.add(matrix[row][col]);
            row--; // Move up
        }

        return boundaryElements;
    }

    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12},
            {13, 14, 15, 16}
        };
        System.out.println(printBoundary(matrix)); // [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5]
    }
}

// Time Complexity: O(N * M)
// Space Complexity: O(1)
```

### 4. Lawn Mowing Problem / Print whole matrix in a clockwise manner. | Boundary Traversal **O(N*M), O(1)**
```js
function printSpiral(matrix) {
  // Get the size of the square matrix (assumes n x n)
  const size = matrix.length;
  let row = 0; // Current row index
  let col = 0; // Current column index

  // 'steps' is the number of elements to print for each boundary in the current layer.
  // It starts as size - 1 and decreases by 2 for each inner spiral layer.
  let steps = size - 1;

  // Use a string to accumulate the output, mimicking System.out.print
  let spiralOutput = "";

  // Loop while there are still full boundaries to print (steps > 0)
  while (steps > 0) {
    // 1. Traverse the Top Boundary (Left to Right)
    for (let step = 1; step <= steps; step++) {
      spiralOutput += matrix[row][col] + " ";
      col++; // Move right
    }

    // 2. Traverse the Right Boundary (Top to Bottom)
    for (let step = 1; step <= steps; step++) {
      spiralOutput += matrix[row][col] + " ";
      row++; // Move down
    }

    // 3. Traverse the Bottom Boundary (Right to Left)
    for (let step = 1; step <= steps; step++) {
      spiralOutput += matrix[row][col] + " ";
      col--; // Move left
    }

    // 4. Traverse the Left Boundary (Bottom to Top)
    for (let step = 1; step <= steps; step++) {
      spiralOutput += matrix[row][col] + " ";
      row--; // Move up
    }

    // Move diagonally to the starting point of the next inner spiral layer
    row++;
    col++;

    // Since we moved inward by 1 layer on all sides, the boundary length
    // for the next inner spiral is reduced by 2.
    steps -= 2;
  }

  /*
   * For odd-sized matrices (e.g., 3x3, 5x5), the loop stops when
   * steps becomes 0 (e.g., 5x5: 4 -> 2 -> 0).
   * This leaves a single element in the very center that is missed.
   * This 'if' block handles that specific case.
   * For a 1x1 matrix, size=1, steps=0, the while loop is skipped,
   * and this 'if' block correctly handles the single element.
   */
  if (steps === 0) {
    spiralOutput += matrix[row][col];
  }

  // Print the final accumulated spiral string
  console.log(spiralOutput.trim());
}

// Example with an odd-sized matrix (5x5)
const mat = [
  [11, 12, 13, 14, 15],
  [21, 22, 23, 24, 25],
  [31, 32, 33, 34, 35],
  [41, 42, 43, 44, 45],
  [51, 52, 53, 54, 55]
];
printSpiral(mat);

// Example with an even-sized matrix (4x4)
const mat2 = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
];
printSpiral(mat2);

// Time Complexity: O(N * M)
// Space Complexity: O(1)
```

```python
def print_spiral(matrix):
    if not matrix:
        return []

    n = len(matrix)
    row = 0
    col = 0
    length = n - 1
    result = []

    while length >= 1:
        # Move right
        for k in range(length):
            result.append(matrix[row][col])
            col += 1

        # Move down
        for k in range(length):
            result.append(matrix[row][col])
            row += 1

        # Move left
        for k in range(length):
            result.append(matrix[row][col])
            col -= 1

        # Move up
        for k in range(length):
            result.append(matrix[row][col])
            row -= 1

        row += 1
        col += 1
        length -= 2

    # If n is odd, add center element
    if length == 0:
        result.append(matrix[row][col])

    return result


matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16]
]
print(print_spiral(matrix))
# [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10]

# Time Complexity: O(N^2)
# Space Complexity: O(1)
```

```java
public class PrintSpiralMatrix {
    public static void printSpiral(int[][] matrix) {
        // Get the size of the square matrix (assumes n x n)
        int size = matrix.length;
        int row = 0; // Current row index
        int col = 0; // Current column index

        // 'steps' is the number of elements to print for each boundary in the current layer.
        // It starts as size - 1 and decreases by 2 for each inner spiral layer.
        int steps = size - 1;

        // Use a StringBuilder to accumulate the output
        StringBuilder spiralOutput = new StringBuilder();

        // Loop while there are still full boundaries to print (steps > 0)
        while (steps > 0) {
            // 1. Traverse the Top Boundary (Left to Right)
            for (int step = 1; step <= steps; step++) {
                spiralOutput.append(matrix[row][col]).append(" ");
                col++; // Move right
            }

            // 2. Traverse the Right Boundary (Top to Bottom)
            for (int step = 1; step <= steps; step++) {
                spiralOutput.append(matrix[row][col]).append(" ");
                row++; // Move down
            }

            // 3. Traverse the Bottom Boundary (Right to Left)
            for (int step = 1; step <= steps; step++) {
                spiralOutput.append(matrix[row][col]).append(" ");
                col--; // Move left
            }

            // 4. Traverse the Left Boundary (Bottom to Top)
            for (int step = 1; step <= steps; step++) {
                spiralOutput.append(matrix[row][col]).append(" ");
                row--; // Move up
            }

            // Move diagonally to the starting point of the next inner spiral layer
            row++;
            col++;

            // Since we moved inward by 1 layer on all sides, the boundary length
            // for the next inner spiral is reduced by 2.
            steps -= 2;
        }

        /*
         * For odd-sized matrices (e.g., 3x3, 5x5), the loop stops when
         * steps becomes 0 (e.g., 5x5: 4 -> 2 -> 0).
         * This leaves a single element in the very center that is missed.
         * This 'if' block handles that specific case.
         * For a 1x1 matrix, size=1, steps=0, the while loop is skipped,
         * and this 'if' block correctly handles the single element.
         */
        if (steps == 0) {
            spiralOutput.append(matrix[row][col]);
        }

        // Print the final accumulated spiral string
        System.out.println(spiralOutput.toString().trim());
    }

    public static void main(String[] args) {
        // Example with an odd-sized matrix (5x5)
        int[][] mat = {
            {11, 12, 13, 14, 15},
            {21, 22, 23, 24, 25},
            {31, 32, 33, 34, 35},
            {41, 42, 43, 44, 45},
            {51, 52, 53, 54, 55}
        };
        printSpiral(mat);

        // Example with an even-sized matrix (4x4)
        int[][] mat2 = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12},
            {13, 14, 15, 16}
        };
        printSpiral(mat2);
    }
}

// Time Complexity: O(N * M)
// Space Complexity: O(1)
```

## 7. Bit Manipulation Advanced

### 1. Checking even/odd. Check if the last bit is 0, then number is even, else odd. **O(1), O(1)**
```js
// If the last bit is zero, then number is even, else odd.
function isEven(num) {
    return (num & 1) === 0;
}
console.log(isEven(0)); // true // 0000 & 0001 = 0000
console.log(isEven(4)); // true // 0100 & 0001 = 0000
console.log(isEven(5)); // false // 0101 & 0001 = 0001

// Time Complexity : O(1)
// Space Complexity : O(1)
```

```python
# If the last bit is zero, then number is even, else odd.
def is_even(n):
    return (n & 1) == 0


print(is_even(4))  # True
print(is_even(5))  # False

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class CheckEvenOdd {
    // If the last bit is zero, then number is even, else odd.
    public static boolean isEven(int num) {
        return (num & 1) == 0;
    }

    public static void main(String[] args) {
        System.out.println(isEven(0)); // true // 0000 & 0001 = 0000
        System.out.println(isEven(4)); // true // 0100 & 0001 = 0000
        System.out.println(isEven(5)); // false // 0101 & 0001 = 0001
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

### 2. Power of Left Shift Operator

#### 1. Set ith bit | **O(1), O(1)**
```js
function setBit(n, i) {
  // Set ith bit
  n = n | (1 << i);
  return n;
}
console.log(setBit(5, 0)); // 5  // 0101 | 0001 = 0101
console.log(setBit(5, 1)); // 7  // 0101 | 0010 = 0111
console.log(setBit(5, 2)); // 5  // 0101 | 0100 = 0101
console.log(setBit(5, 3)); // 13 // 0101 | 1000 = 1101
```

```python
def set_bit(n, i):
    # Set ith bit
    return n | (1 << i)


print(set_bit(5, 1))  # 7 (0101 -> 0111)

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class SetBit {
    public static int setBit(int n, int i) {
        // Set ith bit
        n = n | (1 << i);
        return n;
    }

    public static void main(String[] args) {
        System.out.println(setBit(5, 0)); // 5  // 0101 | 0001 = 0101
        System.out.println(setBit(5, 1)); // 7  // 0101 | 0010 = 0111
        System.out.println(setBit(5, 2)); // 5  // 0101 | 0100 = 0101
        System.out.println(setBit(5, 3)); // 13 // 0101 | 1000 = 1101
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

#### 2. Toggle ith bit | **O(1), O(1)**
```js
function toggleBit(n, i) {
  // Toggle ith bit
  n = n ^ (1 << i);
  return n;
}
console.log(toggleBit(5, 0)); // 4 // 5 in binary is 0101, toggling 0th bit gives us 0100 which is 4
console.log(toggleBit(5, 1)); // 7 // 5 in binary is 0101, toggling 1st bit gives us 0111 which is 7
console.log(toggleBit(5, 2)); // 1 // 5 in binary is 0101, toggling 2nd bit gives us 0001 which is 1
console.log(toggleBit(5, 3)); // 13 // 5 in binary is 0101, toggling 3rd bit gives us 1101 which is 13
```

```python
def toggle_bit(n, i):
    # Toggle ith bit
    return n ^ (1 << i)


print(toggle_bit(5, 1))  # 7 (0101 -> 0111)
print(toggle_bit(7, 1))  # 5 (0111 -> 0101)

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class ToggleBit {
    public static int toggleBit(int n, int i) {
        // Toggle ith bit
        n = n ^ (1 << i);
        return n;
    }

    public static void main(String[] args) {
        System.out.println(toggleBit(5, 0)); // 4  // 5 in binary is 0101, toggling 0th bit gives 0100 (4)
        System.out.println(toggleBit(5, 1)); // 7  // 5 in binary is 0101, toggling 1st bit gives 0111 (7)
        System.out.println(toggleBit(5, 2)); // 1  // 5 in binary is 0101, toggling 2nd bit gives 0001 (1)
        System.out.println(toggleBit(5, 3)); // 13 // 5 in binary is 0101, toggling 3rd bit gives 1101 (13)
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

#### 3. Check ith bit | **O(1), O(1)**
```js
// Check if ith bit is set or unset
function isBitSet(n, i) {
  if ((n & (1 << i)) != 0) { // ith bit is set
    return true;
  }
  return false; // ith bit is unset
}
console.log(isBitSet(5, 0)); // true // 5 in binary is 0101, 0th bit is set
console.log(isBitSet(5, 1)); // false // 5 in binary is 0101, 1st bit is unset
console.log(isBitSet(5, 2)); // true // 5 in binary is 0101, 2nd bit is set
console.log(isBitSet(5, 3)); // false // 5 in binary is 0101, 3rd bit is unset
```

```python
def is_bit_set(n, i):
    return (n & (1 << i)) != 0


print(is_bit_set(5, 0))  # True (bit 0 is 1 in 101)
print(is_bit_set(5, 1))  # False (bit 1 is 0 in 101)

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class CheckBit {
    // Check if ith bit is set or unset
    public static boolean isBitSet(int n, int i) {
        if ((n & (1 << i)) != 0) { // ith bit is set
            return true;
        }
        return false; // ith bit is unset
    }

    public static void main(String[] args) {
        System.out.println(isBitSet(5, 0)); // true  // 5 in binary is 0101, 0th bit is set
        System.out.println(isBitSet(5, 1)); // false // 5 in binary is 0101, 1st bit is unset
        System.out.println(isBitSet(5, 2)); // true  // 5 in binary is 0101, 2nd bit is set
        System.out.println(isBitSet(5, 3)); // false // 5 in binary is 0101, 3rd bit is unset
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

#### 4. Unset ith bit | **O(1), O(1)**
```js
// Unset ith bit
function unsetBit(n, i) {
  // If ith bit is set, unset it
  if(isBitSet(n, i)) {
    n = n ^ (1 << i);
  }
  return n;
}
console.log(unsetBit(5, 0)); // 4 // 5 in binary is 0101, unsetting 0th bit gives us 0100 which is 4
console.log(unsetBit(5, 1)); // 5 // 5 in binary is 0101, unsetting 1st bit doesn't change it
console.log(unsetBit(5, 2)); // 1 // 5 in binary is 0101, unsetting 2nd bit gives us 0001 which is 1
console.log(unsetBit(5, 3)); // 5 // 5 in binary is 0101, unsetting 3rd bit doesn't change it

// Alternative approach
function unsetBit(n, i) {
  // Unset ith bit
  n = n & ~(1 << i);
  return n;
}
```

```python
def unset_bit(n, i):
    return n & ~(1 << i)


print(unset_bit(7, 1))  # 5 (0111 -> 0101)

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class UnsetBit {
    public static boolean isBitSet(int n, int i) {
        return (n & (1 << i)) != 0;
    }

    // Unset ith bit using XOR
    public static int unsetBit(int n, int i) {
        if (isBitSet(n, i)) {
            n = n ^ (1 << i);
        }
        return n;
    }

    // Alternative approach using bitwise AND with NOT
    public static int unsetBitDirect(int n, int i) {
        n = n & ~(1 << i);
        return n;
    }

    public static void main(String[] args) {
        System.out.println(unsetBit(5, 0)); // 4 // 5 in binary is 0101, unsetting 0th bit gives 0100 (4)
        System.out.println(unsetBit(5, 1)); // 5 // 5 in binary is 0101, unsetting 1st bit doesn't change it
        System.out.println(unsetBit(5, 2)); // 1 // 5 in binary is 0101, unsetting 2nd bit gives 0001 (1)
        System.out.println(unsetBit(5, 3)); // 5 // 5 in binary is 0101, unsetting 3rd bit doesn't change it
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

### 3. Single Number 1. Every element appears twice except one. **O(N), O(1)**
```js
// Using XOR. as XORing a number with itself gives 0, so all same number cancels out each other
// Example: [4, 1, 2, 1, 2] -> (4 ^ 1 ^ 2 ^ 1 ^ 2) -> 4 ^ (1 ^ 1) ^ (2 ^ 2) -> 4 ^ 0 ^ 0 -> 4
function singleNumber(nums) {
  let result = 0;
  for (let num of nums) {
    result ^= num;
  }
  return result;
}
console.log(singleNumber([4, 1, 2, 1, 2])); // 4
console.log(singleNumber([2, 2, 1])); // 1
```

```python
def single_number(arr):
    ans = 0
    for num in arr:
        ans ^= num
    return ans


print(single_number([1, 2, 2, 3, 1]))  # 3

# Time Complexity: O(N)
# Space Complexity: O(1)
```

```java
public class SingleNumberI {
    // Using XOR: x ^ x = 0, so duplicate numbers cancel out
    public static int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[]{4, 1, 2, 1, 2})); // 4
        System.out.println(singleNumber(new int[]{2, 2, 1}));       // 1
    }
}

// Time Complexity: O(N)
// Space Complexity: O(1)
```

### 4. Single Number 2. Every element appears thrice except one. **O(N), O(1)**
```js
// Problem: Find the unique number in an array where every other number repeats 'k' times.
// 1. Iterate through each bit position (0 to 31).
// 2. Count the number of set bits (1s) at the current position across all numbers.
// 3. If a number repeats 'k' times, its bits will contribute a multiple of 'k' to the total count.
// 4. Therefore, if the total count modulo 'k' is non-zero, the unique number has a set bit at this position.
// Note: This approach is generalizable for any repeating count k (e.g., k=3, k=4, etc.).
function singleNumber(nums, k) {
  // We assume 32-bit integers and will try to reconstruct the unique number bit by bit.
  let result = 0;

  // Iterate through each of the 32 bits (for 32-bit integers)
  for (let i = 0; i < 32; i++) {
    // Variable to count the number of times the i-th bit is set across all numbers
    let count = 0;

    for (let num of nums) {
      // (1 << i) creates a mask with only the ith bit set.
      // bitwise AND checks if the ith bit of 'num' is set.
      if ((num & (1 << i)) !== 0) {
        count++;
      }
    }

    // If the count of set bits is not a multiple of k,
    // it implies the unique number has a set bit at position i.
    if (count % k !== 0) {
      // Set the ith bit in the result
      result = result | (1 << i);
    }
  }

  return result;
}

console.log(singleNumber([4, 2, 2, 2], 3)); // 4
// Dry Run for: singleNumber([4, 2, 2, 2], 3)
// Binary representations:
// 4 -> 1 0 0
// 2 -> 0 1 0
// 2 -> 0 1 0
// 2 -> 0 1 0
// -----------------
// Iteration:
// Bit 0 (i=0): count of 1s = 0. 0 % 3 === 0. Result bit 0 remains 0. Result = 0 (binary 000)
// Bit 1 (i=1): count of 1s = 3 (from the three 2s). 3 % 3 === 0. Result bit 1 remains 0. Result = 0 (binary 000)
// Bit 2 (i=2): count of 1s = 1 (from the 4). 1 % 3 !== 0. Result bit 2 becomes 1. Result = 4 (binary 100)
// Bits 3 to 31: count of 1s = 0. Result remains 4. (binary 100)
// Final Result = 4

console.log(singleNumber([1, 1, 1, 4, 3, 3, 3, 5, 5, 5], 3)); // 4
// Dry Run for: singleNumber([1, 1, 1, 4, 3, 3, 3, 5, 5, 5], 3)
// Binary representations:
// 1 -> 0 0 1
// 1 -> 0 0 1
// 1 -> 0 0 1
// 4 -> 1 0 0
// 3 -> 0 1 1
// 3 -> 0 1 1
// 3 -> 0 1 1
// 5 -> 1 0 1
// 5 -> 1 0 1
// 5 -> 1 0 1
// -----------------
// Iteration:
// Bit 0 (i=0): count of 1s = 3 (from 1s) + 3 (from 3s) + 3 (from 5s) = 9. 9 % 3 === 0. Result bit 0 remains 0. Result = 0 (binary 000)
// Bit 1 (i=1): count of 1s = 3 (from 3s) = 3. 3 % 3 === 0. Result bit 1 remains 0. Result = 0 (binary 000)
// Bit 2 (i=2): count of 1s = 1 (from 4) + 3 (from 5s) = 4. 4 % 3 !== 0. Result bit 2 becomes 1. Result = 4 (binary 100)
// Bits 3 to 31: count of 1s = 0. Result remains 4. (binary 100)
// Final Result = 4
```

```python
def single_number_2(arr):
    ans = 0
    for i in range(32):
        count = 0
        for num in arr:
            if (num & (1 << i)) != 0:
                count += 1
        # If count of set bits is not a multiple of 3, ith bit belongs to the single number
        if count % 3 != 0:
            ans |= (1 << i)
    return ans


print(single_number_2([1, 2, 4, 3, 3, 2, 2, 3, 1, 1]))  # 4

# Time Complexity: O(32 * N) = O(N)
# Space Complexity: O(1)
```

```java
public class SingleNumberII {
    public static int singleNumber(int[] nums, int k) {
        // Reconstruct the unique number bit by bit
        int result = 0;

        // Iterate through each of the 32 bits
        for (int i = 0; i < 32; i++) {
            int count = 0;

            for (int num : nums) {
                if ((num & (1 << i)) != 0) {
                    count++;
                }
            }

            // If the count of set bits is not a multiple of k,
            // the unique number has the i-th bit set
            if (count % k != 0) {
                result = result | (1 << i);
            }
        }

        return result;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[]{4, 2, 2, 2}, 3));                   // 4
        System.out.println(singleNumber(new int[]{1, 1, 1, 4, 3, 3, 3, 5, 5, 5}, 3)); // 4
    }
}

// Time Complexity: O(32 * N) = O(N)
// Space Complexity: O(1)
```

### 5. Single Number 3. Every element appears twice except two. **O(N), O(1)**
```js
// Problem: Find two unique numbers in an array where every other number repeats twice.
// Approach:
// 1. XOR all numbers. The result will be (uniqueA ^ uniqueB) since paired numbers cancel out.
// 2. Find any set bit in this XOR result. A set bit means uniqueA and uniqueB differ at this bit.
// 3. Partition the original array into two groups based on whether this bit is set or not.
// 4. XOR all elements in each group. This isolates uniqueA in one group and uniqueB in the other.
/**
 * Finds the two numbers that appear only once in an array where every other number appears exactly twice.
 * @param {number[]} A - Array of integers
 * @returns {number[]} - Array containing the two unique numbers in ascending order
 */
function singleNumber(A) {
  // 1. XOR all elements to get the combined XOR of the two unique numbers.
  //    Since x ^ x = 0, all paired numbers cancel out, leaving uniqueA ^ uniqueB.
  let value = 0;
  for (let num of A) {
    value ^= num;
  }

  // 2. Find any bit that is set (1) in 'value' (we'll use the rightmost set bit).
  //    A set bit indicates a position where the two unique numbers differ.
  let setBit = 0;
  for (let i = 0; i < 32; i++) {
    if ((value & (1 << i)) !== 0) {
      setBit = i;
      break;
    }
  }

  // 3. Partition the array into two groups based on the distinguishing bit.
  let result = [0, 0];

  // 4. Partition and XOR:
  //    - The `if/else` forces uniqueA into one group and uniqueB into the other.
  //    - Duplicate numbers are identical, so both copies always fall into the exact same group.
  //    - By XORing the numbers as they enter the group, duplicates cancel each other out (x ^ x = 0).
  //    - Only the single unique number in each group remains.
  for (let num of A) {
    if ((num & (1 << setBit)) !== 0) {
      // Group 1: Numbers with the distinguishing bit set to 1.
      result[0] ^= num;
    } else {
      // Group 2: Numbers with the distinguishing bit set to 0.
      result[1] ^= num;
    }
  }

  // 4. Sort the result to ensure the output is in ascending order.
  result.sort((a, b) => a - b);

  return result;
}

console.log(singleNumber([1, 2, 3, 1, 2, 4])); // [3, 4]
// Dry Run for: singleNumber([1, 2, 3, 1, 2, 4])
// Binary representations:
// 1 -> 0 0 1
// 2 -> 0 1 0
// 3 -> 0 1 1
// 1 -> 0 0 1
// 2 -> 0 1 0
// 4 -> 1 0 0
// -----------------
// Step 1: XOR all elements
// value = 1 ^ 2 ^ 3 ^ 1 ^ 2 ^ 4 = 3 ^ 4 = 7 (binary 111)
//
// Step 2: Find rightmost set bit in value (7)
// 7 is 111. The 0th bit (i=0) is set. setBit = 0.
//
// Step 3 & 4: Partition and XOR (Here 1 and 3 are in group 0 and 2 and 4 are in group 1)
//      We have 1, 3, 1 in group 0 and 2, 2, 4 in group 1. So XORing will cancel 1s from group 0 and 2s from group 1.
//      So in group 0 we have 3 remaining and in group 1 we have 4 remaining.
// num = 1 (001): 0th bit is 1. result[0] ^= 1  -> result[0] = 1
// num = 2 (010): 0th bit is 0. result[1] ^= 2  -> result[1] = 2
// num = 3 (011): 0th bit is 1. result[0] ^= 3  -> result[0] = 1 ^ 3 = 2
// num = 1 (001): 0th bit is 1. result[0] ^= 1  -> result[0] = 2 ^ 1 = 3
// num = 2 (010): 0th bit is 0. result[1] ^= 2  -> result[1] = 2 ^ 2 = 0
// num = 4 (100): 0th bit is 0. result[1] ^= 4  -> result[1] = 0 ^ 4 = 4
//
// Final buckets: result = [3, 4]
// Step 5: Sort
// Sorted result = [3, 4]

console.log(singleNumber([1, 2])); // [1, 2]
// Dry Run for: singleNumber([1, 2])
// Binary representations:
// 1 -> 0 1
// 2 -> 1 0
// -----------------
// Step 1: XOR all elements
// value = 1 ^ 2 = 3 (binary 11)
//
// Step 2: Find rightmost set bit in value (3)
// 3 is 11. The 0th bit (i=0) is set. setBit = 0.
//
// Step 3 & 4: Partition and XOR
// num = 1 (01): 0th bit is 1. result[0] ^= 1  -> result[0] = 1
// num = 2 (10): 0th bit is 0. result[1] ^= 2  -> result[1] = 2
//
// Final buckets: result = [1, 2]
// Step 5: Sort
// Sorted result = [1, 2]

// Time Complexity : O(n)
// Space Complexity : O(1)
```

```python
def single_number_3(arr):
    xor_all = 0
    for num in arr:
        xor_all ^= num

    # Find the rightmost set bit
    pos = 0
    while (xor_all & (1 << pos)) == 0:
        pos += 1

    # Split numbers into two groups based on the set bit
    group1 = 0
    group2 = 0
    for num in arr:
        if (num & (1 << pos)) != 0:
            group1 ^= num
        else:
            group2 ^= num

    return sorted([group1, group2])


print(single_number_3([1, 2, 3, 1, 2, 4]))  # [3, 4]

# Time Complexity: O(N)
# Space Complexity: O(1)
```

```java
import java.util.Arrays;

public class SingleNumberIII {
    public static int[] singleNumber(int[] A) {
        // 1. XOR all elements to get uniqueA ^ uniqueB
        int value = 0;
        for (int num : A) {
            value ^= num;
        }

        // 2. Find the rightmost set bit in value
        int setBit = 0;
        for (int i = 0; i < 32; i++) {
            if ((value & (1 << i)) != 0) {
                setBit = i;
                break;
            }
        }

        // 3. Partition into two groups and XOR
        int[] result = new int[2];
        for (int num : A) {
            if ((num & (1 << setBit)) != 0) {
                // Group 1: Numbers with distinguishing bit set
                result[0] ^= num;
            } else {
                // Group 2: Numbers with distinguishing bit unset
                result[1] ^= num;
            }
        }

        // 4. Sort result to return in ascending order
        Arrays.sort(result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(singleNumber(new int[]{1, 2, 3, 1, 2, 4}))); // [3, 4]
        System.out.println(Arrays.toString(singleNumber(new int[]{1, 2})));             // [1, 2]
    }
}

// Time Complexity : O(N)
// Space Complexity : O(1)
```

### 6. Number of 1 Bits. Count the number of 1 bits in binary representation. **O(1), O(1)**
```js
function numSetBits(A) {
  let count = 0;
  while (A > 0) { // Iterate till A is greater than 0
    count += A & 1; // Check if last bit is set in A and increment count if it is set
    A = A >> 1; // Shift A to right side by 1 bit to check next bit in next iteration
  }
  return count;
}
console.log(numSetBits(11)); // 3 // 1011
console.log(numSetBits(15)); // 4 // 1111

// Time Complexity : O(1)
// Space Complexity : O(1)
```

```python
def num_set_bits(A):
    count = 0
    while A > 0:
        count += (A & 1)
        A >>= 1
    return count


print(num_set_bits(11))  # 3 (1011 in binary)

# Time Complexity: O(log A) / O(number of bits)
# Space Complexity: O(1)
```

```java
public class NumberOf1Bits {
    public static int numSetBits(int A) {
        int count = 0;
        while (A > 0) { // Iterate till A is greater than 0
            count += A & 1; // Check if last bit is set
            A = A >> 1;     // Shift A right by 1 bit
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(numSetBits(11)); // 3 // 1011
        System.out.println(numSetBits(15)); // 4 // 1111
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

### 7. Set Bit. Set the A-th bit and B-th bit in 0 and return output in decimal Number System. **O(1), O(1)**
```js
function setBits(A, B) {
  let n = 0;
  n = n | (1 << A)
  n = n | (1 << B)
  return n;
}
console.log(setBits(3, 5)); // 40 // 00000000 // 1 << 3 = 00001000 = 8, 1 << 5 = 00100000 = 32, 8 | 32 = 00101000 = 40
console.log(setBits(4, 4)); // 16 // 00000000 // 1 << 4 = 00010000 = 16, 1 << 4 = 00010000 = 16, 16 | 16 = 00010000 = 16

// Time Complexity : O(1)
// Space Complexity : O(1)
```

```python
def set_bits(A, B):
    n = 0
    n |= (1 << A)
    n |= (1 << B)
    return n


print(set_bits(3, 5))  # 40 (2^3 + 2^5 = 8 + 32 = 40)

# Time Complexity: O(1)
# Space Complexity: O(1)
```

```java
public class SetBits {
    public static int setBits(int A, int B) {
        int n = 0;
        n = n | (1 << A);
        n = n | (1 << B);
        return n;
    }

    public static void main(String[] args) {
        System.out.println(setBits(3, 5)); // 40 // 1<<3 = 8, 1<<5 = 32, 8 | 32 = 40
        System.out.println(setBits(4, 4)); // 16 // 1<<4 = 16, 1<<4 = 16, 16 | 16 = 16
    }
}

// Time Complexity : O(1)
// Space Complexity : O(1)
```

### 8. Subarrays with OR 0. Count the number of subarrays where the bitwise OR of all elements in the subarray is 0 | Arrays Miscellaneous | Subarrays counting **O(N), O(1)**

**Approach:**
- The bitwise OR of a subarray is `0` if and only if **all elements in that subarray are `0`** (e.g., `0 | 0 = 0`, but `0 | 1 = 1`).
- This means the problem simplifies to finding the number of subarrays that consist entirely of `0`s.
- For any contiguous sequence (run) of `k` zeros, the number of all-zero subarrays that can be formed from it is `k * (k + 1) / 2`.
- We can iterate through the array:
  - Keep a `zeroCount` variable to count consecutive zeros.
  - If we see a `0`, increment `zeroCount`.
  - If we see a non-zero element, we calculate the number of subarrays for the previous run of zeros using `(zeroCount * (zeroCount + 1)) / 2`, add it to `totalCount`, and reset `zeroCount` to `0`.
- At the end of the loop, we must add the subarrays formed by any trailing sequence of zeros to `totalCount`.

**Dry Run:**
- Let `A = [0, 0, 1, 1, 0]`.
- Initialize `totalCount = 0`, `zeroCount = 0`.
- **i = 0:** `A[0] = 0`. `zeroCount++` becomes `1`.
- **i = 1:** `A[1] = 0`. `zeroCount++` becomes `2`.
- **i = 2:** `A[2] = 1` (non-zero).
  - Calculate subarrays for previous run: `(2 * 3) / 2 = 3`.
  - `totalCount += 3` (becomes 3).
  - Reset `zeroCount = 0`.
- **i = 3:** `A[3] = 1` (non-zero).
  - Calculate subarrays for previous run: `(0 * 1) / 2 = 0`.
  - `totalCount += 0` (remains 3).
  - Reset `zeroCount = 0`.
- **i = 4:** `A[4] = 0`. `zeroCount++` becomes `1`.
- **End of Array:** We have a trailing run of `0`s.
  - Calculate subarrays for trailing run: `(1 * 2) / 2 = 1`.
  - `totalCount += 1` (becomes 4).
- **Return:** `4`.

```js
// subarraysWithOR0: Counts the number of subarrays where the bitwise OR is 0
// A subarray's OR is 0 only if every element in it is 0.
// Thus, we just need to count subarrays composed entirely of 0s.
function subarraysWithOR0(A) {
  // 'totalCount' accumulates the total number of all-zero subarrays
  let totalCount = 0;
  // 'zeroCount' tracks the length of the current contiguous sequence of 0s
  let zeroCount = 0;

  // Iterate through the array to find sequences of 0s
  for (let i = 0; i < A.length; i++) {
    if (A[i] === 0) {
      // Increment the count for the current sequence of 0s
      zeroCount++;
    } else {
      // Non-zero element breaks the sequence of 0s
      // A sequence of length 'k' yields k*(k+1)/2 valid subarrays
      totalCount += (zeroCount * (zeroCount + 1)) / 2;

      // Reset the sequence length for the next potential sequence of 0s
      zeroCount = 0;
    }
  }

  // Account for any sequence of 0s that extends to the end of the array
  totalCount += (zeroCount * (zeroCount + 1)) / 2;

  // Return the accumulated total of valid subarrays
  return totalCount;
}
console.log(subarraysWithOR0([0, 0, 1, 1, 0])); // 4   (runs: [0,0] → 3 subarrays, [0] → 1 subarray)
console.log(subarraysWithOR0([0, 0, 0]));       // 6   (run of 3 zeros → 3*4/2 = 6)
console.log(subarraysWithOR0([1, 0, 0, 1]));    // 3   (run of 2 zeros → 2*3/2 = 3)
console.log(subarraysWithOR0([0, 1]));          // 1   (run of 1 zero  → 1*2/2 = 1)

// Time Complexity: O(n), where n = A.length
// Space Complexity: O(1) — only a few variables regardless of input size
```

```python
def subarrays_with_or_0(arr):
    total_zeros = 0
    zero_count = 0

    for num in arr:
        if num == 0:
            zero_count += 1
        else:
            total_zeros += zero_count * (zero_count + 1) // 2
            zero_count = 0

    total_zeros += zero_count * (zero_count + 1) // 2
    return total_zeros


print(subarrays_with_or_0([1, 0, 0, 0, 1]))  # 6 ([0], [0], [0], [0, 0], [0, 0], [0, 0, 0])

# Time Complexity: O(N)
# Space Complexity: O(1)
```

```java
public class SubarraysWithOR0 {
    // Counts the number of subarrays where the bitwise OR is 0
    public static long subarraysWithOR0(int[] A) {
        long totalCount = 0;
        long zeroCount = 0;

        for (int i = 0; i < A.length; i++) {
            if (A[i] == 0) {
                zeroCount++;
            } else {
                totalCount += (zeroCount * (zeroCount + 1)) / 2;
                zeroCount = 0;
            }
        }

        totalCount += (zeroCount * (zeroCount + 1)) / 2;
        return totalCount;
    }

    public static void main(String[] args) {
        System.out.println(subarraysWithOR0(new int[]{0, 0, 1, 1, 0})); // 4
        System.out.println(subarraysWithOR0(new int[]{0, 0, 0}));       // 6
        System.out.println(subarraysWithOR0(new int[]{1, 0, 0, 1}));    // 3
        System.out.println(subarraysWithOR0(new int[]{0, 1}));          // 1
    }
}

// Time Complexity: O(N)
// Space Complexity: O(1)
```

### 9. Subarrays with OR 1. Count the number of subarrays where the bitwise OR of all elements in the subarray is 1 | Arrays Miscellaneous | Subarrays counting **O(N), O(1)**

**Approach:**
- A subarray's bitwise OR is `1` if it contains **at least one `1`**. The only time a subarray's OR is `0` is when **all** its elements are `0`.
- Instead of directly counting subarrays with an OR of `1`, it is easier to calculate the **total number of subarrays** and subtract the number of **all-zero subarrays**.
- **Total Subarrays:** For an array of length `n`, the total number of subarrays is `n * (n + 1) / 2`.
- **All-zero Subarrays:** We can use the same logic as the previous problem. For any contiguous sequence of `k` zeros, the number of zero-only subarrays is `k * (k + 1) / 2`.
- **Result:** `(Total Subarrays) - (All-zero Subarrays)`.

**Dry Run:**
- Let `A = [0, 0, 1, 1, 0]`.
- `n = 5`. Total possible subarrays = `5 * 6 / 2 = 15`.
- Initialize `totalZeroSubArrs = 0`, `zeroRun = 0`.
- **i = 0:** `A[0] = 0`. `zeroRun++` becomes `1`.
- **i = 1:** `A[1] = 0`. `zeroRun++` becomes `2`.
- **i = 2:** `A[2] = 1`.
  - Add previous zero-run subarrays to total: `totalZeroSubArrs += (2 * 3) / 2 = 3`.
  - Reset `zeroRun = 0`.
- **i = 3:** `A[3] = 1`.
  - Add previous zero-run subarrays to total: `totalZeroSubArrs += (0 * 1) / 2 = 0`.
  - Reset `zeroRun = 0`.
- **i = 4:** `A[4] = 0`. `zeroRun++` becomes `1`.
- **End of Array:** Process trailing zero run.
  - `totalZeroSubArrs += (1 * 2) / 2 = 1`.
  - `totalZeroSubArrs` becomes `4`.
- **Return:** `totalSubArrs - totalZeroSubArrs = 15 - 4 = 11`.

```js
// subarraysWithOR1: Counts the number of subarrays where the bitwise OR is 1
// We find this by subtracting the number of all-zero subarrays from the total number of subarrays
function subarraysWithOR1(A) {
  const n = A.length;
  // Calculate the total possible subarrays for an array of length 'n'
  const totalSubArrs = (n * (n + 1)) / 2;

  // 'totalZeroSubArrs' will store the count of subarrays made entirely of 0s
  let totalZeroSubArrs = 0;
  // 'zeroRun' tracks the length of the current contiguous sequence of 0s
  let zeroRun = 0;

  // Iterate through the array to find sequences of 0s
  for (let i = 0; i < n; i++) {
    if (A[i] === 0) {
      // Extend the current sequence of 0s
      zeroRun++;
    } else {
      // Non-zero element breaks the sequence of 0s
      // Add the valid zero-only subarrays for the completed sequence
      totalZeroSubArrs += (zeroRun * (zeroRun + 1)) / 2;

      // Reset the sequence length for the next potential sequence of 0s
      zeroRun = 0;
    }
  }

  // Account for any sequence of 0s that extends to the end of the array
  if (zeroRun > 0) {
    totalZeroSubArrs += (zeroRun * (zeroRun + 1)) / 2;
  }

  // Subarrays with OR = 1 are all subarrays minus the all-zero ones
  return totalSubArrs - totalZeroSubArrs;
}
console.log(subarraysWithOR1([0, 0, 1, 1, 0])); // 11
// Explanation: totalSubArrs = 5*6/2 = 15, all-zero subarrays = 4, so 15 - 4 = 11

console.log(subarraysWithOR1([0, 0, 0]));       // 0
// Explanation: totalSubArrs = 3*4/2 = 6, all-zero subarrays = 6, so 6 - 6 = 0

// Time Complexity:  O(n), where n = A.length
// Space Complexity: O(1) — uses only a few counters regardless of input size
```

```python
def subarrays_with_or_1(arr):
    n = len(arr)
    total_subarrays = n * (n + 1) // 2

    # Count subarrays with OR 0 (i.e. all elements are 0)
    zero_subarrays = 0
    zero_count = 0
    for num in arr:
        if num == 0:
            zero_count += 1
        else:
            zero_subarrays += zero_count * (zero_count + 1) // 2
            zero_count = 0

    zero_subarrays += zero_count * (zero_count + 1) // 2
    return total_subarrays - zero_subarrays


print(subarrays_with_or_1([1, 0, 1]))        # 5
print(subarrays_with_or_1([1, 0, 0, 0, 1]))  # 9

# Time Complexity: O(N)
# Space Complexity: O(1)
```

```java
public class SubarraysWithOR1 {
    // Counts the number of subarrays where the bitwise OR is 1
    public static long subarraysWithOR1(int[] A) {
        long n = A.length;
        long totalSubArrs = (n * (n + 1)) / 2;
        long totalZeroSubArrs = 0;
        long zeroRun = 0;

        for (int i = 0; i < n; i++) {
            if (A[i] == 0) {
                zeroRun++;
            } else {
                totalZeroSubArrs += (zeroRun * (zeroRun + 1)) / 2;
                zeroRun = 0;
            }
        }

        if (zeroRun > 0) {
            totalZeroSubArrs += (zeroRun * (zeroRun + 1)) / 2;
        }

        return totalSubArrs - totalZeroSubArrs;
    }

    public static void main(String[] args) {
        System.out.println(subarraysWithOR1(new int[]{0, 0, 1, 1, 0})); // 11
        System.out.println(subarraysWithOR1(new int[]{0, 0, 0}));       // 0
    }
}

// Time Complexity: O(N)
// Space Complexity: O(1)
```

## 8. Recursion

### 1. Sum of n natural numbers. **O(N), O(N)**
```js
function sum(n) {
  if (n == 0) {
    return 0;
  }

  return n + sum(n - 1);
}
console.log(sum(5)); // 15
```

```python
def sum_n(n):
    if n == 0:
        return 0
    return n + sum_n(n - 1)


print(sum_n(5))  # 15

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 2. Factorial of a number. **O(N), O(N)**
```js
function factorial(n) {
  if (n == 0) {
    return 1;
  }

  return n * factorial(n - 1);
}
console.log(factorial(5)); // 120
```

```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)


print(factorial(5))  # 120

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 3. Increasing order / Print 1 to N. **O(N), O(N)**
```js
function increasing(n) {
  if (n == 0) {
    return;
  }

  increasing(n - 1);

  console.log(n);
}
increasing(5); // 1 2 3 4 5
```

```python
def increasing(n):
    if n == 0:
        return
    increasing(n - 1)
    print(n, end=" ")


increasing(5)  # 1 2 3 4 5
print()

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 4. Decreasing order / Whirpool's countdown timer / Print N to 1 function. **O(N), O(N)**
```
Whirlpool wants to design a timer for their washing machines. This feature is a simple countdown timer. When a user sets a time, for example, 10 minutes, the washing machine needs to show each minute passing, counting down until it reaches 0.

Your task is to write a program that takes an integer A (the time in minutes set by the user) and then prints out each minute as it counts down to 0. The requirement is that after a user sets a timer for the washing machine for some time say A, the washing machine should display each minute after that decremented one by one till the time becomes 0.
```

```js
function decreasing(n) {
  if (n == 0) {
    return;
  }

  console.log(n);

  decreasing(n - 1);
}
decreasing(5); // 5 4 3 2 1
```

```python
def decreasing(n):
    if n == 0:
        return
    print(n, end=" ")
    decreasing(n - 1)


decreasing(5)  # 5 4 3 2 1
print()

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 5. Fibonacci series / Find Nth Fibonacci number using recursion. **O(2^n), O(n)**
```js
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }

  const first = fibonacci(n - 1);

  const second = fibonacci(n - 2);

  return first + second;
}
console.log(fibonacci(5)); // 5
console.log(fibonacci(6)); // 8
console.log(fibonacci(7)); // 13
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


print(fibonacci(5))  # 5
print(fibonacci(7))  # 13

# Time Complexity: O(2^N)
# Space Complexity: O(N)
```

### 6. Fibonacci series using Memoization / Find Nth Fibonacci number using memoization. **O(N), O(N)**
```js
// TOP-DOWN MEMOIZATION (Recursive + Cache)
//
// Why memoize?
// Plain recursion for fib(n) has O(2^n) time — it recomputes the same subproblems
// many times. For example, fib(3) is computed twice in fib(5), fib(2) three times, etc.
// Memoization stores each result the first time it's computed, turning O(2^n) → O(n).
//
// How it works:
// 1. Start from the original problem fib(n) and break it down (top → down).
// 2. Before computing fib(k), check if it's already in the memo cache.
//    - If YES → return cached value instantly (O(1) lookup).
//    - If NO  → compute it recursively, store the result, then return.
// 3. The memo object is passed by reference through all recursive calls,
//    so every call shares the same cache — a result stored by one branch
//    is immediately available to all other branches.

function fibonacci(n, memo = {}) {
  // BASE CASE: The smallest subproblems that don't need further breakdown.
  // fib(0) = 0, fib(1) = 1 — these are defined values, not computed.
  if (n <= 1) {
    return n;
  }

  // CACHE CHECK: Before doing any work, check if we've already solved this subproblem.
  // This is what turns exponential recursion into linear — each fib(k) is computed
  // at most once. Every subsequent call for the same k returns in O(1).
  if (memo[n]) {
    return memo[n];
  }

  // RECURSIVE STEP: Solve the two smaller subproblems.
  // The same memo object is passed down, so results computed in the fib(n-1) branch
  // (which goes deeper first) will already be cached when fib(n-2) needs them.
  // This is why fib(n-2) almost always hits the cache — the left branch (n-1)
  // has already computed and stored it.
  const first = fibonacci(n - 1, memo);
  const second = fibonacci(n - 2, memo);

  // STORE & RETURN: Cache the result so any future call to fib(n) is O(1).
  // Without this line, we'd recompute fib(n) every time it's needed.
  memo[n] = first + second;

  return memo[n];
}
console.log(fibonacci(5)); // 5
console.log(fibonacci(6)); // 8
console.log(fibonacci(7)); // 13
```

```python
# TOP-DOWN MEMOIZATION (Recursive + Cache)
def fibonacci_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 1:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]


print(fibonacci_memo(10))  # 55
print(fibonacci_memo(50))  # 12586269025

# Time Complexity: O(N)
# Space Complexity: O(N)
```

#### Dry Run — `fibonacci(5)`

```
fibonacci(5)  → memo = {}  (nothing cached yet, must compute)
├── fibonacci(4)  → memo = {}  (not cached, recurse deeper)
│   ├── fibonacci(3)  → memo = {}  (not cached, recurse deeper)
│   │   ├── fibonacci(2)  → memo = {}  (not cached, recurse deeper)
│   │   │   ├── fibonacci(1)  → base case, return 1  (no recursion needed)
│   │   │   └── fibonacci(0)  → base case, return 0  (no recursion needed)
│   │   │   memo[2] = 1 + 0 = 1  → return 1  (first time computing fib(2), store it)
│   │   └── fibonacci(1)  → base case, return 1  (no recursion needed)
│   │   memo[3] = 1 + 1 = 2  → return 2  (first time computing fib(3), store it)
│   └── fibonacci(2)  → memo[2] exists! return 1 (cached ✅ — saved an entire subtree!)
│   memo[4] = 2 + 1 = 3  → return 3  (first time computing fib(4), store it)
└── fibonacci(3)  → memo[3] exists! return 2 (cached ✅ — saved an entire subtree!)
memo[5] = 3 + 2 = 5  → return 5  (first time computing fib(5), store it)

Final memo = { 2: 1, 3: 2, 4: 3, 5: 5 }
Output: 5

Total function calls: 9  (with memo)  vs  15 (without memo)
  → The savings grow exponentially for larger n.
  → fib(2) and fib(3) were each needed twice but computed only once.
```

### 7. Fibonacci series using Tabulation / Find Nth Fibonacci number using tabulation. **O(N), O(N)**
```js
// BOTTOM-UP TABULATION (Iterative + Array)
//
// Why tabulation?
// Instead of starting from fib(n) and recursing down (top-down),
// we start from the smallest subproblems fib(0), fib(1) and build UP to fib(n).
// No recursion means no call stack overhead — avoids stack overflow for large n.
//
// How it works:
// 1. Create a dp[] array where dp[i] will hold fib(i).
// 2. Seed the base cases: dp[0] = 0, dp[1] = 1.
// 3. Iterate from i = 2 to n, filling each dp[i] = dp[i-1] + dp[i-2].
// 4. By the time the loop ends, dp[n] contains the answer.
//
// Memoization vs Tabulation:
// - Memoization (top-down): recursive, computes only needed subproblems, uses call stack.
// - Tabulation (bottom-up): iterative, computes ALL subproblems from 0 to n, no call stack.
// - Both are O(n) time and O(n) space, but tabulation has lower constant overhead
//   (no function call overhead per subproblem).

function fibonacci(n) {
  // dp array stores all fibonacci values from 0 to n.
  // Initialize with base cases: fib(0) = 0, fib(1) = 1.
  // These are the foundation — every other value is built from these two.
  const dp = [0, 1];

  // BUILD UP: Fill the table from the smallest unsolved subproblem (i=2)
  // all the way up to the target (i=n).
  // At each step, dp[i-1] and dp[i-2] are guaranteed to already be computed
  // because we're iterating in order — this is the key insight of bottom-up DP.
  for (let i = 2; i <= n; i++) {
    // Each value is simply the sum of the two preceding values.
    // No recursion, no cache lookups — just a direct array access (O(1) per step).
    dp[i] = dp[i - 1] + dp[i - 2];
  }

  // The answer is now sitting at dp[n], built up from dp[0] and dp[1].
  return dp[n];
}

console.log(fibonacci(5)); // 5
console.log(fibonacci(6)); // 8
console.log(fibonacci(7)); // 13
```

```python
# BOTTOM-UP TABULATION (Iterative + Array)
def fibonacci_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(fibonacci_tab(10))  # 55

# Time Complexity: O(N)
# Space Complexity: O(N)
```

#### Dry Run — `fibonacci(5)`

```
Initial: dp = [0, 1]  (base cases seeded)

i = 2: dp[2] = dp[1] + dp[0] = 1 + 0 = 1  → dp = [0, 1, 1]
i = 3: dp[3] = dp[2] + dp[1] = 1 + 1 = 2  → dp = [0, 1, 1, 2]
i = 4: dp[4] = dp[3] + dp[2] = 2 + 1 = 3  → dp = [0, 1, 1, 2, 3]
i = 5: dp[5] = dp[4] + dp[3] = 3 + 2 = 5  → dp = [0, 1, 1, 2, 3, 5]

return dp[5] = 5  ✅

Key observations:
  → No recursion at all — just a simple for-loop filling an array left to right.
  → Each dp[i] only depends on dp[i-1] and dp[i-2], which are already filled.
  → Total iterations: n - 1 = 4 (constant work per iteration → O(n) overall).
```

### 8. Sum of Digits! Find the sum of digits of a given number using recursion. **O(log(n)), O(log(n))**
```js
function sumOfDigits(n) {
  if (n === 0) return 0;
  const lastDigit = n % 10;
  const remainingDigits = Math.floor(n / 10);
  return lastDigit + sumOfDigits(remainingDigits);
}
console.log(sumOfDigits(56789)); // 35
console.log(sumOfDigits(12345)); // 15
console.log(sumOfDigits(0)); // 0

// Time Complexity: O(log n) - In each call divides n by 10, so the number of calls equals the number of digits, ≈ ⌊log₁₀ n⌋ + 1. Work per call is O(1).
// Space Complexity: O(log n) - The recursion is not tail-call optimized in JS engines (V8 doesn't implement TCO), so the call stack grows to the same depth as the digit count. No extra data structures.
```

```python
def sum_of_digits(n):
    if n == 0:
        return 0
    return (n % 10) + sum_of_digits(n // 10)


print(sum_of_digits(12345))  # 15
print(sum_of_digits(46))     # 10

# Time Complexity: O(log10 N)
# Space Complexity: O(log10 N)
```

### 9. Decreasing & Increasing in one function. / Print 1 to N and N to 1 in one function. **O(N), O(N)**
```js
function decInc(A) {
  if (A == 0) {
    return 0;
  }
  process.stdout.write(A + " "); // Print the current number before the recursive call, this will handle the decreasing part.
  decInc(A - 1);
  process.stdout.write(A + " "); // Print the current number after the recursive call, this will handle the increasing part.
}

decInc(5); // 5 4 3 2 1 1 2 3 4 5

// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
import sys


def dec_inc(A):
    if A == 0:
        return
    sys.stdout.write(str(A) + " ")
    dec_inc(A - 1)
    sys.stdout.write(str(A) + " ")


dec_inc(4)  # 4 3 2 1 1 2 3 4
print()

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 10. Power function. **O(N), O(N)**
```js
function power(base, exponent) {
  if(exponent === 0) return 1;

  return base * power(base, exponent - 1);
}
console.log(power(2, 3)); // 8
console.log(power(2, 0)); // 1

// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
def power(base, exponent):
    if exponent == 0:
        return 1
    return base * power(base, exponent - 1)


print(power(2, 3))  # 8
print(power(3, 4))  # 81

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 11. Fast Power function. **O(log N), O(log N)**
```js
// Incorrect / Sub-optimal implementation of fast power function
function fastPowerIncorrect(base, exponent) {
  // Base case: Any number to the power 0 is 1
  if (exponent === 0) return 1;

  // Making two separate recursive calls computes the exact same subproblem twice.
  // Recurrence relation: T(N) = 2 * T(N/2) + O(1) => by Master Theorem, T(N) = O(N).
  // This completely negates the benefit of dividing the exponent by 2.
  if (exponent % 2 === 0) {
    // If the exponent is even, we can split it into two equal halves and multiply the results.
    // Example: 2^6 = (2^3)^2 = 8 * 8 = 64
    return fastPowerIncorrect(base, exponent / 2) * fastPowerIncorrect(base, exponent / 2);
  } else {
    // If the exponent is odd, we can split it into two nearly equal halves and multiply the results along with the base.
    // Example: 2^7 = 2 * (2^3)^2 = 2 * 8 * 8 = 128
    return base * fastPowerIncorrect(base, Math.floor(exponent / 2)) * fastPowerIncorrect(base, Math.floor(exponent / 2));
  }
}

// Time Complexity: O(n) - Because two recursive calls of size n/2 are made at each step, forming a full binary recursion tree with 2^(log₂ n) = n leaves.
// Space Complexity: O(log n) - Maximum depth of the recursive call stack is ⌊log₂ n⌋ + 1.
```

```python
# Sub-optimal implementation without caching subcall: O(N)
def fast_power_suboptimal(base, exponent):
    if exponent == 0:
        return 1
    if exponent % 2 == 0:
        return fast_power_suboptimal(base, exponent // 2) * fast_power_suboptimal(base, exponent // 2)
    return base * fast_power_suboptimal(base, exponent // 2) * fast_power_suboptimal(base, exponent // 2)
```

```js
function fastPower(base, exponent) {
  // Base case: Any number raised to the power of 0 is 1 (base^0 = 1).
  if (exponent === 0) {
    return 1;
  }

  // Key Optimization: Compute the subproblem (base ^ ⌊exponent / 2⌋) only ONCE and store it.
  // This single recursive call avoids duplicate work, achieving recurrence T(N) = T(N/2) + O(1) => O(log N).
  const half = fastPower(base, Math.floor(exponent / 2));

  // If exponent is even: base^exponent = (base^(exponent/2))^2 = half * half
  // Example: 2^6 = (2^3)^2 = 8 * 8 = 64
  if (exponent % 2 === 0) {
    return half * half;
  } else {
    // If exponent is odd: base^exponent = base * (base^⌊exponent/2⌋)^2 = base * half * half
    // Example: 2^7 = 2 * (2^3)^2 = 2 * 8 * 8 = 128
    return half * half * base;
  }
}
console.log(fastPower(2, 3)); // 8
console.log(fastPower(2, 0)); // 1
console.log(fastPower(3, 5)); // 243

// Time Complexity: O(log n) - The exponent 'n' is halved at each step, resulting in ⌊log₂ n⌋ + 1 calls with O(1) multiplication per call.
// Space Complexity: O(log n) - Call stack depth is proportional to the number of divisions, ⌊log₂ n⌋ + 1.
```

```python
def fast_power(base, exponent):
    # Base case: Any number raised to 0 is 1
    if exponent == 0:
        return 1

    # Divide step: Compute power for half the exponent
    half_power = fast_power(base, exponent // 2)

    # If exponent is even
    if exponent % 2 == 0:
        return half_power * half_power
    # If exponent is odd
    else:
        return base * half_power * half_power


print(fast_power(2, 10))  # 1024
print(fast_power(3, 5))   # 243

# Time Complexity: O(log N)
# Space Complexity: O(log N)
```

## 9. Hashing (Set)

### 1. Count of Distinct Elements | Set **O(N), O(N)**
Given an n elements array, find the count of distinct elements in the array.
```js
function countDistinct(arr) {
  const set = new Set(arr);
  return set.size;
}
const arr = [2, 6, 3, 8, 2, 8, 2, 8, 10, 6]
console.log(countDistinct(arr)); // 6
// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
def count_distinct(arr):
    # Python built-in set automatically stores unique elements
    return len(set(arr))


print(count_distinct([1, 2, 2, 3, 4, 4, 5]))  # 5

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 2. Check if pair with sum K exists / Good Pair | Set **O(N), O(N)**
```js
function goodPair(arr, K) {
    let set = new Set();

    for (let elem of arr) {
        let complement = K - elem;
        if (set.has(complement)) {
            return 1; // good pair found
        }
        set.add(elem);
    }

    return 0; // no good pair found
}

console.log(goodPair([1, 2, 3, 4], 7)); // 1
console.log(goodPair([1, 2, 4, 3], 2)); // 0
console.log(goodPair([1, 9, 3, 4], 4)); // 1
console.log(goodPair([-2, 1, 5, 8], 3)); // 1 (pair -2, 5)
```

```python
def good_pair(arr, K):
    seen = set()
    for num in arr:
        complement = K - num
        if complement in seen:
            return 1
        seen.add(num)
    return 0

print(good_pair([1, 2, 3, 4], 7))   # 1
print(good_pair([1, 2, 4, 3], 2))   # 0
print(good_pair([1, 9, 3, 4], 4))   # 1
print(good_pair([-2, 1, 5, 8], 3))  # 1 (pair -2, 5)
```

### 3. Check if subarray with sum 0 exists | Set & Carry Forward **O(N), O(N)**
```js
function subarraySumZero(arr) {
  // Create a Set to store the prefix sums encountered so far.
  let set = new Set();

  // Initialize the cumulative sum to K.
  let sum = 0;

  // Iterate through each number in the input array.
  for (const num of arr) {
    // Add the current number to the cumulative sum.
    // We call this Carry Forward technique.
    sum += num;

    // Check for the subarray sum 0 condition:
    // 1. If the cumulative sum is 0, it means the subarray from the beginning
    //    up to the current element sums to 0.
    // 2. If the current cumulative sum has been seen before (is in the set),
    //    it means the elements *between* the previous occurrence of this sum
    //    and the current element must sum to 0.
    if (sum === 0 || set.has(sum)) {
      // Found a subarray with sum 0.
      return true;
    }

    // Add the current cumulative sum to the set for future checks.
    set.add(sum);
  }

  // If the loop finishes without finding a subarray with sum 0, return false.
  return false;
}

console.log(subarraySumZero([2, 2, 1, -3, 4, 3, 1, -2, -3, 2])); // true
// num =  2, sum = 2, set = {2}
// num =  2, sum = 4, set = {2, 4}
// num =  1, sum = 5, set = {2, 4, 5}
// num = -3, sum = 2 -> set.has(2) is true! Returns true (subarray [2, 1, -3] sums to 0)

console.log(subarraySumZero([1, 2, 3, 4, 5])); // false
// num = 1, sum =  1, set = {1}
// num = 2, sum =  3, set = {1, 3}
// num = 3, sum =  6, set = {1, 3, 6}
// num = 4, sum = 10, set = {1, 3, 6, 10}
// num = 5, sum = 15, set = {1, 3, 6, 10, 15}
// Loop finishes without match -> returns false

// Time Complexity: O(n)
// We iterate through the array once. Set operations (add, has) are O(1) on average.
// Space Complexity: O(n)
// In the worst case, the set will store n distinct prefix sums.
```

```python
def subarray_sum_k(arr, K):
    seen_sums = set()
    curr_sum = K

    for num in arr:
        curr_sum += num
        # If prefix sum is K or was seen before, subarray sum is K
        if curr_sum == K or curr_sum in seen_sums:
            return 1
        seen_sums.add(curr_sum)

    return 0


print(subarray_sum_k([1, 2, 3, 4, 5], 0))  # 0
print(subarray_sum_k([4, -1, 1], 0))       # 1
print(subarray_sum_k([1, -1], 0))          # 1

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 4. Longest Substring Without Repeating Characters | Set & Two Pointers. **O(N), O(N)**
```js
function lengthOfLongestSubstring(s) {
  let n = s.length;
  let maxLength = 0;
  let start = 0;
  let set = new Set();

  for (let end = 0; end < n; end++) {
    // If the character is already in the set, remove characters from the start until it's not
    while (set.has(s[end])) {
      set.delete(s[start]);
      start++;
    }
    // Add the current character to the set
    set.add(s[end]);
    // Update maxLength if needed
    maxLength = Math.max(maxLength, end - start + 1);
  }
  return maxLength;
}
console.log(lengthOfLongestSubstring("cbaabcfedfgh")); // 6 // "abcfed"
// Dry Run for: lengthOfLongestSubstring("cbaabcfedfgh")
// end=0,  char='c': set={'c'},                         start=0, window="c",            maxLength=1
// end=1,  char='b': set={'c','b'},                     start=0, window="cb",           maxLength=2
// end=2,  char='a': set={'c','b','a'},                 start=0, window="cba",          maxLength=3
// end=3,  char='a': 'a' in set -> delete 'c','b','a',  start=3, set={'a'}, window="a", maxLength=3
// end=4,  char='b': set={'a','b'},                     start=3, window="ab",           maxLength=3
// end=5,  char='c': set={'a','b','c'},                 start=3, window="abc",          maxLength=3
// end=6,  char='f': set={'a','b','c','f'},             start=3, window="abcf",         maxLength=4
// end=7,  char='e': set={'a','b','c','f','e'},         start=3, window="abcfe",        maxLength=5
// end=8,  char='d': set={'a','b','c','f','e','d'},     start=3, window="abcfed",       maxLength=6
// end=9,  char='f': 'f' in set -> delete 'a','b','c','f', start=7, set={'e','d','f'}, window="edf", maxLength=6
// end=10, char='g': set={'e','d','f','g'},             start=7, window="edfg",         maxLength=6
// end=11, char='h': set={'e','d','f','g','h'},         start=7, window="edfgh",        maxLength=6
// Final maxLength = 6 ("abcfed")

console.log(lengthOfLongestSubstring("abcdbefdghij")); // 8 // "cbefdghi"

// Time Complexity: O(n)
// Space Complexity: O(min(n, m)), where n is the length of the string and m is the size of the character set
```

```python
def length_of_longest_substring(s):
    char_set = set()
    left = 0
    max_len = 0

    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)

    return max_len


print(length_of_longest_substring("abcabcbb"))  # 3 // "abc"
print(length_of_longest_substring("bbbbb"))     # 1 // "b"
print(length_of_longest_substring("pwwkew"))    # 3 // "wke"

# Time Complexity: O(N)
# Space Complexity: O(min(N, M)) where M is character set size
```

## 10. Hashing (Map)

### 1. Count frequence of elements in array /Frequency of given elements / Frequency of element query | Map **O(N), O(N)**
Given an n elements array, and q queries, find the frequency of each element in the array.
```js
function frequency(arr, queries) {
  const map = new Map();
  for (const elem of arr) {
    if (map.has(elem)) {
      map.set(elem, map.get(elem) + 1);
    } else {
      map.set(elem, 1);
    }
  }

  const ans = [];
  for (const query of queries) {
    if (map.has(query)) {
      ans.push(map.get(query));
    } else {
      ans.push(0);
    }
  }

  return ans;
}
console.log(frequency([2, 6, 3, 8, 2, 8, 2, 8, 10, 6], [2, 8, 3, 5])); // [3, 3, 1, 0]

// Time Complexity: O(n + q)
// Space Complexity: O(n)
```

```python
def frequency(arr, queries):
    freq_map = {}
    for num in arr:
        freq_map[num] = freq_map.get(num, 0) + 1

    return [freq_map.get(q, 0) for q in queries]


print(frequency([1, 2, 1, 1], [1, 2]))  # [3, 1]
print(frequency([2, 5, 9, 2, 8], [3, 2]))  # [0, 2]

# Time Complexity: O(N + Q)
# Space Complexity: O(N)
```

### 2. Count of pairs with sum K | Map **O(N), O(N)**
```js
function countPairsSum(arr, k) {
  const target = BigInt(k);
  const map = new Map();
  let count = 0n;

  for (const item of arr) {
    const elem = BigInt(item);
    const need = target - elem;

    if (map.has(need)) {
      count += map.get(need);
    }

    if (map.has(elem)) {
      map.set(elem, map.get(elem) + 1n);
    } else {
      map.set(elem, 1n);
    }

    // Alternatively, we could use the following line to avoid the if/else:
    // map.set(elem, (map.get(elem) || 0n) + 1n);
  }

  const MOD = 1000_000_007n;

  return Number(count % MOD)
}
console.log(countPairsSum([3, 5, 1, 2], 8)); // 1
console.log(countPairsSum([1, 2, 1, 2], 3)); // 4 // [[1, 2], [2, 1], [1, 2], [2, 1]]
```

```python
def count_pairs_sum(arr, k):
    freq = dict()
    count = 0

    for num in arr:
        complement = k - num
        count += freq.get(complement, 0)
        freq[num] = freq.get(num, 0) + 1

    return count


print(count_pairs_sum([1, 2, 3, 2, 1], 3))  # 4
print(count_pairs_sum([1, 1, 1], 2))        # 3
```

### 3. Count subarrays with sum 0 | Map & Prefix Sum. **O(N), O(N)**
```js
function countSubarraysWithSumZero(arr) {
  let map = new Map();
  let sum = 0;
  let count = 0;

  for (const num of arr) {
    sum += num;

    if (sum === 0) {
      count++;
    }

    if (map.has(sum)) {
      count += map.get(sum);
    }

    map.set(sum, (map.get(sum) || 0) + 1);
  }

  return count;
}
console.log(countSubarraysWithSumZero([2, 2, 1, -3, 4, 3, 1, -2, -3, 2])); // 2 // [2, 1, -3], [-3, 4, 3, 1, -2, -3]
// num =  2: sum =  2, map = {2: 1}, count = 0
// num =  2: sum =  4, map = {2: 1, 4: 1}, count = 0
// num =  1: sum =  5, map = {2: 1, 4: 1, 5: 1}, count = 0
// num = -3: sum =  2 -> map.has(2) (+1), map = {2: 2, 4: 1, 5: 1}, count = 1 ([2, 1, -3])
// num =  4: sum =  6, map = {2: 2, 4: 1, 5: 1, 6: 1}, count = 1
// num =  3: sum =  9, map = {2: 2, 4: 1, 5: 1, 6: 1, 9: 1}, count = 1
// num =  1: sum = 10, map = {..., 10: 1}, count = 1
// num = -2: sum =  8, map = {..., 8: 1}, count = 1
// num = -3: sum =  5 -> map.has(5) (+1), map = {..., 5: 2}, count = 2 ([-3, 4, 3, 1, -2, -3])
// num =  2: sum =  7, map = {..., 7: 1}, count = 2
// Total count = 2

console.log(countSubarraysWithSumZero([1, 2, -2, 4, -4])); // 3 // [2, -2], [4, -4], [2, -2, 4, -4]
// num =  1: sum = 1, map = {1: 1}, count = 0
// num =  2: sum = 3, map = {1: 1, 3: 1}, count = 0
// num = -2: sum = 1 -> map.has(1) (+1), map = {1: 2, 3: 1}, count = 1 ([2, -2])
// num =  4: sum = 5, map = {1: 2, 3: 1, 5: 1}, count = 1
// num = -4: sum = 1 -> map.has(1) (+2), map = {1: 3, 3: 1, 5: 1}, count = 3 ([2, -2, 4, -4], [4, -4])
// Total count = 3

// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
from collections import defaultdict


def count_subarrays_with_sum_zero(arr):
    freq = defaultdict(int)
    freq[0] = 1  # Base case for prefix sum 0
    curr_sum = 0
    count = 0

    for num in arr:
        curr_sum += num
        count += freq[curr_sum]
        freq[curr_sum] += 1

    return count


print(count_subarrays_with_sum_zero([1, -1, -2, 2]))     # 3
print(count_subarrays_with_sum_zero([-1, 2, -1]))        # 2
print(count_subarrays_with_sum_zero([0, 0, 0]))          # 6

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 4. Check subarray with sum K exists | Map. **O(N), O(N)**
```js
function subarraySumK(arr, k) {
  let map = new Map();
  let sum = 0;

  for (const num of arr) {
    sum += num;

    // Subarray between a previous index and current index equals k:
    // currentSum - previousSum = k => previousSum = currentSum - k
    if (sum === k || map.has(sum - k)) {
      return true;
    }

    map.set(sum, (map.get(sum) || 0) + 1);
  }

  return false;
}

console.log(subarraySumK([2, 3, 9, -4, 1, 5, 6, 2, 5], 11)); // true // [2, 3, 9, -4, 1]
// num =  2: sum =  2, map = {2: 1}
// num =  3: sum =  5, map = {2: 1, 5: 1}
// num =  9: sum = 14, map = {2: 1, 5: 1, 14: 1}, check (14 - 11 = 3) -> Not in map
// num = -4: sum = 10, map = {..., 10: 1}, check (10 - 11 = -1) -> Not in map
// num =  1: sum = 11 -> sum === k (true)

console.log(subarraySumK([4, 2, 3, 7, -1, 9, 15, 16, -8], 20)); // true // [2, 3, 7, -1, 9]
// num =  4: sum =  4, map = {4: 1}
// num =  2: sum =  6, map = {4: 1, 6: 1}
// num =  3: sum =  9, map = {..., 9: 1}
// num =  7: sum = 16, map = {..., 16: 1}
// num = -1: sum = 15, map = {..., 15: 1}
// num =  9: sum = 24 -> map.has(24 - 20 = 4) is true

// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
def subarray_sum_k(arr, k):
    seen = {0}
    curr_sum = 0

    for num in arr:
        curr_sum += num
        if (curr_sum - k) in seen:
            return True
        seen.add(curr_sum)

    return False


print(subarray_sum_k([10, 2, -2, -20, 10], -10))  # True
print(subarray_sum_k([1, 2, 3], 7))                 # False

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 5. Count subarrays with sum K | Map & Prefix Sum. **O(N), O(N)**
```js
function countSubarraysWithSumK(arr, k) {
    // A Map to store the frequency of prefix sums encountered so far.
    // Key = Prefix Sum, Value = How many times this sum has occurred.
    let map = new Map();

    // Initialize the map with base case: {0: 1}
    // This is crucial. It represents a "sum of 0" before the array starts.
    // It handles cases where a subarray starts directly from index 0 and equals k.
    // Without this, we would need a separate 'if (currentSum === k)' check.
    // map.set(0, 1);

    let currentSum = 0;
    let count = 0;

    for (const [i, num] of arr.entries()) {
        // 1. Add current number to the running cumulative sum (Prefix Sum)
        currentSum += num;

        // Alternatively if we dont do map.set(0, 1) at the beginning, we need to check if the currentSum itself equals k.
        if(currentSum === k) {
            count++;
        }

        // 2. Check if a specific previous sum exists.
        // The logic is: currentSum - previousSum = k
        // Therefore: previousSum = currentSum - k
        // If 'currentSum - k' is in the map, it means we found a valid subarray
        // ending at the current index.
        const targetPrefixSum = currentSum - k;

        if (map.has(targetPrefixSum)) {
            console.log(`Found subarray with sum ${k} ending at current index ${i}. CurrentSum: ${currentSum}, TargetPrefixSum: ${targetPrefixSum}`);
            // Add the number of times that prefix sum occurred to our total count.
            count += map.get(targetPrefixSum);
        }

        // 3. Store the current cumulative sum in the map for future iterations.
        // If it exists, increment the count; otherwise, set it to 1.
        map.set(currentSum, (map.get(currentSum) || 0) + 1);
    }

    return count;
}

console.log(countSubarraysWithSumK([2, 3, 9, -4, 1, 5, 6, 2, 5], 11)); // 3 // [2, 3, 9, -4, 1], [9, -4, 1, 5], [5, 6]
console.log(countSubarraysWithSumK([4, 2, 3, 7, -1, 9, 15, 16, -8], 20)); // 1 // [2, 3, 7, -1, 9]
```

```python
def count_subarrays_with_sum_k(arr, k):
    freq = dict()
    # freq[0] = 1
    curr_sum = 0
    count = 0

    for num in arr:
        curr_sum += num
        # Alternatively if we don't initialize freq[0] = 1 at the beginning, we need to check if the current sum itself equals k.
        if curr_sum == k:
            count += 1
        count += freq.get(curr_sum - k, 0)
        freq[curr_sum] = freq.get(curr_sum, 0) + 1

    return count

print(count_subarrays_with_sum_k([1, 0, 1], 1))    # 4
print(count_subarrays_with_sum_k([0, 0, 0], 0))    # 6
print(count_subarrays_with_sum_k([1, 2, 3], 3))    # 2
```

### 6. Find common elements in 2 arrays | Map **O(N), O(N)**
```js
function commonElements(A, B) {
  // Always build the frequency map on the smaller array
  if (B.length < A.length) {
    [A, B] = [B, A];
  }

  // 1) Count frequencies of A’s elements
  const freq = new Map();
  for (const x of A) {
    // freq.set(x, (freq.get(x) || 0) + 1); // Use this syntax to avoid the if/else.

    // Alternatively, we can use if / else
    if (freq.has(x)) {
      freq.set(x, freq.get(x) + 1);
    } else {
      freq.set(x, 1);
    }
  }

  // 2) Walk through B, collecting matches
  const result = [];
  for (const x of B) {
    const c = freq.get(x) || 0;
    if (c > 0) {
      result.push(x);
      freq.set(x, c - 1);
    }
  }

  return result;
}
console.log(commonElements([1, 2, 2, 1], [2, 3, 1, 2])); // [2, 1, 2]
console.log(commonElements([2, 1, 4, 10], [3, 6, 2, 10, 10])); // [2, 10]

// Time Complexity: O(n + m)
// Space Complexity: O(n)
```

```python
from collections import Counter


def common_elements(A, B):
    freq_a = Counter(A)
    freq_b = Counter(B)
    ans = []

    for num in freq_a:
        if num in freq_b:
            common_count = min(freq_a[num], freq_b[num])
            ans.extend([num] * common_count)

    return ans


print(common_elements([1, 2, 2, 1], [2, 3, 1, 2]))  # [1, 2, 2]

# Time Complexity: O(N + M)
# Space Complexity: O(N + M)
```

## 11. Count Sort & Merge Sort

### 1. Count sort of positive numbers | Count Sort. **O(N + K), O(K)**
```js
/**
 * Implementation of Counting Sort.
 * Note: This algorithm works best for numbers with a reasonable range (K).
 * Time Complexity: O(N + K)
 * Space Complexity: O(K) where K is the max value in the array.
 */
function countingSort(inputArray) {
  // 1. Find the maximum value in the array.
  // We need this to determine the size of our frequency array (the range).
  let maxElement = Math.max(...inputArray);

  // 2. Create the Frequency Array (often called 'Count Array').
  // We initialize it with 0. The size is maxElement + 1 because
  // arrays are 0-indexed (e.g., to store the number 6, we need index 6).
  let frequencyArray = new Array(maxElement + 1).fill(0);

  // 3. Count occurrences of each element.
  // The magic of Counting Sort: The 'value' from the input becomes the 'index' in the frequency array.
  for (const number of inputArray) {
    frequencyArray[number] += 1;
  }

  let sortedArray = [];

  // 4. Reconstruct the sorted array.
  // We iterate through the frequencyArray.
  // 'currentNum' is the index (which represents the actual number value).
  for (let currentNum = 0; currentNum < frequencyArray.length; currentNum++) {

    let count = frequencyArray[currentNum];

    // If count is greater than 0, push that number into the sorted array
    // as many times as it appeared.
    while (count > 0) {
      sortedArray.push(currentNum);
      count--;
    }
  }

  return sortedArray;
}

console.log(countingSort([6, 3, 2, 1, 2, 6, 3, 1, 2, 6])); // [1, 1, 2, 2, 2, 3, 3, 6, 6, 6]
console.log(countingSort([4, 2, 7, 7, 3, 2, 1, 8])); // [1, 2, 2, 3, 4, 7, 7, 8]
console.log(countingSort([7, 6, 2, 15, 12, 12, 11, 3, 3, 2, 1, 7, 9, 11, 12])); // [1, 2, 2, 3, 3, 6, 7, 7, 9, 11, 11, 12, 12, 12, 15]

// Time Complexity: O(n + k) where n is the number of elements in the array and k is the range of the elements
// Space Complexity: O(k) for the frequency map
```

```python
def count_sort_positive(arr):
    if not arr:
        return []

    max_val = max(arr)
    count = [0] * (max_val + 1)

    for num in arr:
        count[num] += 1

    ans = []
    for val, freq in enumerate(count):
        ans.extend([val] * freq)

    return ans


print(count_sort_positive([4, 2, 2, 8, 3, 3, 1]))  # [1, 2, 2, 3, 3, 4, 8]

# Time Complexity: O(N + K) where K is max element
# Space Complexity: O(K)
```

### 2. Count sort of negative numbers | Count Sort. **O(N), O(N)**
```js
/** Counting Sort implementation capable of handling negative numbers.
 * Strategy: Normalize the range of numbers to start from 0 by using an offset.
 * Time Complexity: O(n + k) -> n is array length, k is the range (max - min)
 * Space Complexity: O(k) -> size of the frequency array
 */
function countSort(arr) {
    // 1. Find the boundaries of the data.
    // We need 'min' to calculate the offset (how much to shift values).
    let min = Math.min(...arr);
    let max = Math.max(...arr);

    // 2. Calculate the size of the frequency array (Range).
    // Example: If range is -3 to 2. Size = 2 - (-3) + 1 = 6 slots.
    let range = max - min + 1;

    // Create the frequency array filled with zeros
    let frequencyArray = new Array(range).fill(0);
    let sortedArray = [];

    // 3. Populate Frequency Array with Offset.
    for (const num of arr) {
        // SHIFT LOGIC: Subtract 'min' to map the value to a valid 0-based index.
        // Example: If num is -3 and min is -3, index = -3 - (-3) = 0.
        const shiftedIndex = num - min;
        frequencyArray[shiftedIndex]++;
    }

    // 4. Reconstruct the Sorted Array.
    for (let i = 0; i < frequencyArray.length; i++) {
        let count = frequencyArray[i];

        // REVERSE SHIFT: Add 'min' back to the index to get the original value.
        const originalValue = i + min;

        while (count > 0) {
            sortedArray.push(originalValue);
            count--;
        }
    }

    return sortedArray;
}

console.log(countSort([-2, 1, 4, 2, -2, 6, 1, -3, 4, -1])); // [-3, -2, -2, -1, 1, 1, 2, 4, 4, 6]

// Time Complexity: O(n + k) where n is the number of elements in the array and k is the range of the elements
// Space Complexity: O(k) for the frequency map
```

```python
def count_sort_negative(arr):
    if not arr:
        return []

    min_val = min(arr)
    max_val = max(arr)
    range_val = max_val - min_val + 1

    count = [0] * range_val
    for num in arr:
        count[num - min_val] += 1

    ans = []
    for i in range(range_val):
        ans.extend([i + min_val] * count[i])

    return ans


print(count_sort_negative([-5, -10, 0, -3, 8, 5, -1, 10]))
# [-10, -5, -3, -1, 0, 5, 8, 10]

# Time Complexity: O(N + K) where K is max - min + 1
# Space Complexity: O(K)
```

### 3. Merge two sorted arrays | Merge Sort. **O(N), O(N)**
```js
/**
 * Splitting Function
 * Separates the input array into two lists: Evens and Odds.
 * Note: It does NOT sort them; it preserves their original relative order.
 */
function mergeSortedArrays(arr) {
  let even = [];
  let odd = [];

  // Iterate through every number in the input array
  for (const num of arr) {
    if (num % 2 === 0) {
      // If divisible by 2, it goes to the 'even' bucket
      even.push(num);
    } else {
      // Otherwise, it goes to the 'odd' bucket
      odd.push(num);
    }
  }

  // At this point for input [1, 5, 2, 4, 9, 6, 8]:
  // even = [2, 4, 6, 8]  (Happens to be sorted)
  // odd  = [1, 5, 9]     (Happens to be sorted)

  // Merge the two separated arrays back together
  return mergeTwoSortedArrays(even, odd);
}

/**
 * Merging Function
 * Standard "Two Pointer" merge logic.
 * Assumes 'even' and 'odd' arrays are ALREADY sorted.
 */
function mergeTwoSortedArrays(even, odd) {
  let i = 0; // Pointer for 'even' array
  let j = 0; // Pointer for 'odd' array
  let merged = [];

  // Compare elements at pointers i and j
  while (i < even.length && j < odd.length) {
    if (even[i] < odd[j]) {
      // Even number is smaller, push it and move even pointer
      merged.push(even[i]);
      i++;
    } else {
      // Odd number is smaller, push it and move odd pointer
      merged.push(odd[j]);
      j++;
    }
  }

  // If even array has leftovers, push them
  while (i < even.length) {
    merged.push(even[i]);
    i++;
  }

  // If odd array has leftovers, push them
  while (j < odd.length) {
    merged.push(odd[j]);
    j++;
  }
  return merged;
}

console.log(mergeSortedArrays([1, 5, 2, 4, 9, 6, 8])); // [1, 2, 4, 5, 6, 8, 9]

// Time Complexity: O(n)
// Space Complexity: O(n)
```

```python
def merge_two_sorted_arrays(A, B):
    n = len(A)
    m = len(B)
    merged = []
    i = 0
    j = 0

    while i < n and j < m:
        if A[i] <= B[j]:
            merged.append(A[i])
            i += 1
        else:
            merged.append(B[j])
            j += 1

    while i < n:
        merged.append(A[i])
        i += 1

    while j < m:
        merged.append(B[j])
        j += 1

    return merged


print(merge_two_sorted_arrays([1, 3, 5], [2, 4, 6]))  # [1, 2, 3, 4, 5, 6]

# Time Complexity: O(N + M)
# Space Complexity: O(N + M)
```

### 4. Merge sort | Merge Sort. **O(N), O(N)**
```js
/**
 * Helper function to merge two sorted arrays into a single sorted array.
 * Uses the "Two Pointer" technique.
 * Time Complexity: O(n + m) where n and m are lengths of left and right arrays.
 */
function mergeTwoSortedArrays(left, right) {
    let leftPointer = 0; // Pointer for 'left' array
    let rightPointer = 0; // Pointer for 'right' array
    let merged = [];

    // Compare elements from both arrays and pick the smaller one
    while (leftPointer < left.length && rightPointer < right.length) {
        if (left[leftPointer] <= right[rightPointer]) {
            merged.push(left[leftPointer]);
            leftPointer++; // Advance left pointer
        } else {
            merged.push(right[rightPointer]);
            rightPointer++; // Advance right pointer
        }
    }

    // If 'left' still has elements, append them (they are already sorted)
    while (leftPointer < left.length) {
        merged.push(left[leftPointer]);
        leftPointer++;
    }

    // If 'right' still has elements, append them
    while (rightPointer < right.length) {
        merged.push(right[rightPointer]);
        rightPointer++;
    }

    return merged;
}

/**
 * Main Recursive Merge Sort Function.
 * Uses "Divide and Conquer" strategy.
 * Time Complexity: O(n log n)
 */
function mergeSort(arr, lo = 0, hi = arr.length - 1) {
    // Base Case: If the subarray has 1 element, it is inherently sorted.
    if (lo >= hi) {
        return [arr[lo]];
    }

    // Calculate middle index to split the array
    const mid = Math.floor((lo + hi) / 2);

    // DIVIDE: Recursively sort the left half
    const left = mergeSort(arr, lo, mid);

    // DIVIDE: Recursively sort the right half
    const right = mergeSort(arr, mid + 1, hi);

    // CONQUER: Merge the two sorted halves
    const merged = mergeTwoSortedArrays(left, right);

    // Return the merged sorted array
    return merged;
}

console.log(mergeSort([6, 3, 2, 1, 2, 6, 3, 1, 2, 6])); // [1, 1, 2, 2, 2, 3, 3, 6, 6, 6]
console.log(mergeSort([4, 2, 7, 7, 3, 2, 1, 8])); // [1, 2, 2, 3, 4, 7, 7, 8]

// Time Complexity: O(n log n)
// Space Complexity: O(n) for the merged array

// Merge sort is a stable sort because it preserves the relative order of equal elements.
// Merge sort is not an inplace sort because it requires additional space for the merged array.
```

```python
def merge(left, right):
    result = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result


def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)


print(merge_sort([38, 27, 43, 3, 9, 82, 10]))  # [3, 9, 10, 27, 38, 43, 82]

# Time Complexity: O(N log N)
# Space Complexity: O(N)
```

### 5. Sort by color. Sort an array in such a way that same colored elements are adjacent / Dutch National Flag Problem | Count Sort. **O(N), O(N)**
```js
// Using count sort
function sortColors(arr) {
  let count = new Array(3).fill(0);
  let ans = [];
  for (const num of arr) {
    count[num]++;
  }

  for (let i = 0; i < count.length; i++) {
    let frequency = count[i];
    while (frequency > 0) {
      ans.push(i);
      frequency--;
    }
  }

  return ans;
}

console.log(sortColors([0, 1, 2, 0, 1, 2])); // [0, 0, 1, 1, 2, 2]
console.log(sortColors([0])); // [0]

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
# Using Counting Sort / Dutch National Flag
def sort_colors(arr):
    count0 = 0
    count1 = 0
    count2 = 0

    for num in arr:
        if num == 0:
            count0 += 1
        elif num == 1:
            count1 += 1
        else:
            count2 += 1

    i = 0
    for _ in range(count0):
        arr[i] = 0
        i += 1
    for _ in range(count1):
        arr[i] = 1
        i += 1
    for _ in range(count2):
        arr[i] = 2
        i += 1

    return arr


print(sort_colors([2, 0, 2, 1, 1, 0]))  # [0, 0, 1, 1, 2, 2]

# Time Complexity: O(N)
# Space Complexity: O(1)
```

## 12. Quick Sort & Comparator

### 1. Partition the array. All 0s on the left and all 1s on the right. | Partitioning Algorithm **O(N), O(1)**
```js
function partition(arr) {
  let low = 0;
  let high = 0;
  while (high < arr.length) {
    if (arr[high] === 0) {
      // Swap arr[low] and arr[high]
      [arr[low], arr[high]] = [arr[high], arr[low]];
      low++;
    }
    high++;
  }

  return arr;
}
console.log(partition([1, 0, 1, 1, 0, 0, 1, 0, 1, 0])); // [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def partition(arr):
    low = 0
    high = 0
    while high < len(arr):
        if arr[high] == 0:
            arr[low], arr[high] = arr[high], arr[low]
            low += 1
        high += 1
    return arr


print(partition([0, 1, 0, 1, 1, 0]))  # [0, 0, 0, 1, 1, 1]

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 2. Partition the integer array with pivot. All elements less than pivot on the left and all elements greater than pivot on the right. | Quick Sort. **O(N), O(N)**
```js
function partitionArray(arr) {
  let low = 0;
  let high = 0;
  const end = arr.length - 1;
  const pivot = arr[end];
  while (high < end) {
    if (arr[high] < pivot) {
      // Swap arr[low] and arr[high]
      [arr[low], arr[high]] = [arr[high], arr[low]];
      low++;
    }
    high++;
  }

  // Swap arr[low] and arr[end] in the end
  // This step is important to place the pivot in its correct position as pivot is last element
  [arr[low], arr[end]] = [arr[end], arr[low]];

  return arr;
}
console.log(partitionArray([20, 55, 44, 31, 77, 17, 93, 26, 54])); // [17, 20, 26, 31, 44, 55, 93]

// Time Complexity: O(n)
// Space Complexity: O(1)
```

```python
def partition_array(arr):
    low = 0
    high = 0
    pivot = arr[0]

    while high < len(arr):
        if arr[high] <= pivot:
            arr[low], arr[high] = arr[high], arr[low]
            low += 1
        high += 1

    # Place pivot in its correct position
    arr[0], arr[low - 1] = arr[low - 1], arr[0]
    return arr


print(partition_array([54, 26, 93, 17, 77, 31, 44, 55, 20]))
# [20, 26, 44, 17, 31, 54, 77, 55, 93]

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 3. Quick Sort. | Quick Sort. **O(N), O(N)**
```js
/**
 * Helper function to partition the array.
 * Its goal is to place the pivot element in its correct sorted position
 * and ensure all smaller elements are to the left, and larger elements to the right.
 *
 * @param {Array} arr - The array to sort
 * @param {number} start - The starting index of the segment to partition
 * @param {number} end - The ending index (where the pivot initially lives)
 */
function getPivoteIndex(arr, start, end) {
    // 'low' tracks the boundary of the "smaller than pivot" section.
    // It starts at the beginning of the segment.
    let low = start;

    // 'high' is the iterator that scans the array from start to end-1.
    let high = start;

    // We choose the last element as the 'pivot' value.
    const pivot = arr[end];

    // Loop through the array segment (excluding the pivot itself at 'end')
    while (high < end) {
        // If the current element is smaller than the pivot...
        if (arr[high] < pivot) {
            // ...we move it to the "smaller" section (the left side).
            // We do this by swapping the current element (arr[high])
            // with the element at the 'low' boundary.
            [arr[low], arr[high]] = [arr[high], arr[low]];

            // We then increment 'low' to expand the "smaller" section.
            low++;
        }
        // Move the iterator forward to check the next element.
        high++;
    }

    // After the loop finishes, all elements smaller than the pivot are
    // to the left of 'low', and all elements larger are to the right of 'low'.
    // The pivot is still sitting at 'end'.
    // We swap the pivot into its correct sorted position (at 'low').
    [arr[low], arr[end]] = [arr[end], arr[low]];

    // Return the final index of the pivot so QuickSort knows where to split.
    return low;
}

/**
 * Main QuickSort function (Recursive).
 *
 * @param {Array} arr - The array to sort
 * @param {number} low - The starting index (default 0)
 * @param {number} high - The ending index (default last element)
 */
function quickSort(arr, low = 0, high = arr.length - 1) {
    // Base Case: If the segment has 0 or 1 element, it is already sorted.
    // We stop recursion here.
    if (low >= high) {
        return;
    }

    // Partition the array and get the index where the pivot ended up.
    // At this point, the pivot is fixed in its final sorted position.
    const pivotIndex = getPivoteIndex(arr, low, high);

    // Recursively sort the sub-array to the LEFT of the pivot.
    // Notice we go up to 'pivotIndex - 1'.
    quickSort(arr, low, pivotIndex - 1);

    // Recursively sort the sub-array to the RIGHT of the pivot.
    // Notice we start from 'pivotIndex + 1'.
    quickSort(arr, pivotIndex + 1, high);
}

const arr = [17, 20, 26, 31, 44, 55, 77, 93];
quickSort(arr);
console.log(arr); // [17, 20, 26, 31, 44, 55, 77, 93]

// Time Complexity: O(n log n)
// Space Complexity: O(log n)
```

```python
def partition_lomuto(arr, low, high):
    pivot = arr[high]
    i = low - 1

    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def quick_sort_helper(arr, low, high):
    if low < high:
        pi = partition_lomuto(arr, low, high)
        quick_sort_helper(arr, low, pi - 1)
        quick_sort_helper(arr, pi + 1, high)


def quick_sort(arr):
    quick_sort_helper(arr, 0, len(arr) - 1)
    return arr


print(quick_sort([10, 7, 8, 9, 1, 5]))  # [1, 5, 7, 8, 9, 10]

# Time Complexity: O(N log N) average, O(N^2) worst case
# Space Complexity: O(log N) auxiliary recursion stack
```

### 4. Sorting based on factors of the elements. | Custom Comparator **O(N log N), O(1)**
```js
function getFactorsCount(num) {
  let count = 0;
  for (let i = 1; i <= Math.sqrt(num); i++) {
    // Check if i is a factor of num
    // For example, if num is 36, then i can be 1, 2, 3, 4, 6
    // and 9. So we check if num is divisible by i
    // If it is, we increment the count
    if (num % i === 0) {
      count++;

      // If i is not the square root of num, count the other factor as well
      // For example, if num is 36, then both 6 and 6 are factors
      // but we only want to count it once
      // So we check if i is not equal to num / i
      // If it is not, we increment the count
      if (i !== num / i) {
        count++;
      }
    }
  }
  return count;
}
function sortByFactors(arr) {
  return arr.sort((a, b) => {
    const factorsA = getFactorsCount(a);
    const factorsB = getFactorsCount(b);
    if (factorsA === factorsB) {
      return a - b;
      // or alternatively
      // if (a < b) return -1;
      // if (a > b) return 1;
      // return 0;
    }
    return factorsA - factorsB;
  });
}
console.log(sortByFactors([4, 7, 6, 9, 8, 2, 10])); // [2, 7, 4, 9, 6, 8, 10]
console.log(sortByFactors([10, 5, 6, 2, 3, 4])); // [2, 3, 4, 5, 6, 10]
```

```python
import math
from functools import cmp_to_key


def get_factors_count(num):
    count = 0
    i = 1
    while i * i <= num:
        if num % i == 0:
            count += 1
            if i != num // i:
                count += 1
        i += 1
    return count


def sort_by_factors(arr):
    # Sort primarily by factor count ascending, secondarily by value ascending
    return sorted(arr, key=lambda x: (get_factors_count(x), x))


print(sort_by_factors([4, 7, 6, 9, 8, 2, 10]))  # [2, 7, 4, 9, 6, 8, 10]
print(sort_by_factors([10, 5, 6, 2, 3, 4]))      # [2, 3, 4, 5, 6, 10]

# Time Complexity: O(N * sqrt(max_val) + N log N)
# Space Complexity: O(1)
```

### 5. Largest Number. Sort the array to form the largest number. | Custom Comparator **O(N log N), O(1)**
```
Given an array of non negative integers, sort the array in such a way that the largest number is formed by rearranging the elements of the array.
Return the largest number as a string.
```

```js
/**
 * @param {number[]} arr - Array of non-negative integers
 * @return {string} - The largest formed number as a string
 */
function largestNumber(arr) {
    // Sort the array using a custom comparator.
    // We cannot use standard numeric sort (a-b) or standard lexical sort.
    // We must determine which order of two numbers creates a larger combination.
    arr.sort((a, b) => {
        // Convert both numbers to strings to test concatenation.
        // Example: a = 9, b = 989
        const ab = a.toString() + b.toString(); // "9989"
        const ba = b.toString() + a.toString(); // "9899"

        // Compare the numerical values of the two concatenated strings.
        // Logic: If 'ba' is larger than 'ab', then 'b' should come before 'a'
        // to maximize the total number (Descending order logic).
        // JavaScript automatically coerces these strings to numbers for subtraction.
        // return ba - ab; // decreasing order
        // or alternatively:
        if (ab > ba) return -1;
        if (ab < ba) return 1;
        return 0;
    });

    // Join the sorted array elements into a single string.
    const result = arr.join('');

    // Edge Case Handling (Optional/Implicit):
    // If the array contains only zeros (e.g., [0, 0]), the result would be "00".
    // In many LeetCode/Hackerrank variations, you might need to return "0"
    // if result[0] === '0'.
    return result;
}

// Comparison trace for [989, 9]:
// "9" + "989" (9989) vs "989" + "9" (9899).
// 9989 > 9899, so 9 comes before 989.
console.log(largestNumber([989, 9, 767, 11, 1, 0])); // "998987671110"

console.log(largestNumber([10, 5, 2, 8, 200])); // "85220010"

// Time Complexity: O(n log n)
// Space Complexity: O(n)
```

```python
from functools import cmp_to_key


def largest_number(arr):
    # Custom comparator: compare concatenation order
    def compare(a, b):
        ab = str(a) + str(b)
        ba = str(b) + str(a)
        if ab > ba:
            return -1
        elif ab < ba:
            return 1
        return 0

    sorted_arr = sorted(arr, key=cmp_to_key(compare))
    result = "".join(str(x) for x in sorted_arr)

    # Edge case: if highest value is "0", result is "0"
    return "0" if result[0] == "0" else result


print(largest_number([989, 9, 767, 11, 1, 0]))  # "998987671110"
print(largest_number([10, 5, 2, 8, 200]))        # "85220010"

# Time Complexity: O(N log N)
# Space Complexity: O(N)
```

