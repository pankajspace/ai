[<- DSA](00-dsa-quick.md)

# Revision Advanced DSA - 2

## Index
- [Notes](#notes)
  - [1. Binary Search](#1-binary-search)
  - [2. Linked List: Basic Problems](#2-linked-list-basic-problems)
  - [3. Stacks](#3-stacks)
  - [4. Queues: Implementation & Problems](#4-queues-implementation--problems)
- [Questions](#questions)
  - [1. Searching 1: Binary Search on Array](#1-searching-1-binary-search-on-array)
  - [2. Searching 2: Binary Search on Answer](#2-searching-2-binary-search-on-answer)
  - [3. Linked List Introduction](#3-linked-list-introduction)
  - [4. Linked List: Basic Problems](#4-linked-list-basic-problems)
  - [5. Stacks](#5-stacks)
  - [6. Queues](#6-queues)
  - [7. Trees 1: Structure & Traversal](#7-trees-1-structure--traversal)
  - [8. Trees 2: BST](#8-trees-2-bst)

# Notes

## 1. Binary Search
Searching can be done if we know the following 2 things:
1. The target
2. The search space

Binary Search, also known as the "Divide and Conquer" approach, works on the principle of reducing the search space by half in each iteration.

It is not necessary that the array is sorted, but it is necessary that the array can be divided into halves in a meaningful way based on some condition.

## 2. Linked List: Basic Problems

### Linked List Operations
1. append: Add a new node at the end of the list. Time complexity: O(1) if you have a tail pointer; O(n) if you must traverse from the head. **O(1), O(1)**
2. insertAtPosition: Insert a new node at a specific position. Time complexity O(n). **O(N), O(1)**
3. getNodeAtPosition: Retrieve the node at a specific position. Time complexity O(n). **O(N), O(1)**
4. deleteNode: Remove the first occurrence of a element from the list. Time complexity O(n). **O(N), O(1)**
5. isValuePresent: Check if a value K exists in the list. Time complexity O(n). **O(N), O(1)**
6. getSize: Calculate the size of the linked list. Time complexity: O(1) if a size property is maintained; O(n) if you must count nodes manually. **O(N), O(1)**

## 3. Stacks

### Infix VS Postfix VS Prefix
1. Infix: Operator is placed between operands. Example: `A + B`
2. Postfix: Operator is placed after operands. Example: `A B +`
3. Prefix: Operator is placed before operands. Example: `+ A B`

```
Infix: 1 + 2 + 3 * 4 - 5 / 6 + 7 - 8 * 9
Postfix: 1 2 + 3 4 * + 5 6 / - 7 + 8 9 * -
Prefix: - + - + + 1 2 * 3 4 / 5 6 7 * 8 9

Answer: 50.833
```

### Stack Operations
1. Push: Add an element to the top of the stack. Time complexity O(1). **O(1), O(1)**
2. Pop: Remove the element from the top of the stack. It is common to return the popped element. Time complexity O(1). **O(1), O(1)**
3. Peek/Top: Retrieve the element at the top of the stack without removing it. Accessing the top element directly via a pointer or index. Time complexity O(1). **O(1), O(1)**
4. Size: Get the number of elements currently in the stack. Usually maintained by a simple counter variable. Time complexity O(1). **O(1), O(1)**
5. IsEmpty: Check if the stack is empty (i.e., no elements are inside). A simple check if the size is zero or the top pointer is null. Time complexity O(1). **O(1), O(1)**

## 4. Queues: Implementation & Problems

### Queue Operations (Using Singly Linked List)
1. Enqueue: Add an element to the rear of the queue. Time complexity is O(1). **O(1), O(1)**
2. Dequeue: Remove an element from the front of the queue. Time complexity is O(1). **O(1), O(1)**
3. Peek/Front: Get the front element without removing it. Time complexity is O(1). **O(1), O(1)**
4. IsEmpty: Check if the queue is empty. Time complexity is O(1). **O(1), O(1)**
5. Size: Get the number of elements in the queue. Time complexity is O(1). **O(1), O(1)**

# Questions

## 1. Searching 1: Binary Search on Array

### 1. Search element K in sorted array | Binary Search on Array **O(log N), O(1)**
```js
// Iterative implementation of binary search on a sorted array
function binarySearch(arr, k) {
  let low = 0;
  let hign = arr.length - 1;

  while (low <= hign) {
    // Calculate mid index
    const mid = low + Math.floor((hign - low) / 2);

    if (arr[mid] === k) { // or k === arr[mid]
      return mid; // Element found at index mid
    } else if (arr[mid] < k) { // or k > arr[mid]
      low = mid + 1; // Search in the right half
    } else {
      hign = mid - 1; // Search in the left half
    }
  }

  return -1; // Element not found
}

console.log(binarySearch([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 9)); // 2
console.log(binarySearch([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 27)); // 9
console.log(binarySearch([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 21)); // -1

// Time Complexity: O(log n)
// Space Complexity: O(1)
```

```python
def binary_search_iterative(arr, k):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = low + (high - low) // 2

        if arr[mid] == k:
            return mid
        elif arr[mid] < k:
            low = mid + 1
        else:
            high = mid - 1

    return -1


print(binary_search_iterative([1, 2, 3, 4, 5, 6, 7], 4))  # 3
print(binary_search_iterative([1, 2, 3, 4, 5, 6, 7], 8))  # -1

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

```js
// Recursive implementation of binary search on a sorted array
function binarySearchRecursive(arr, k, low = 0, hign = arr.length - 1) {
    if (low > hign) {
        return -1; // Element not found
    }

    // Calculate mid index
    const mid = low + Math.floor((hign - low) / 2);

    if (arr[mid] === k) { // or k === arr[mid]
        return mid; // Element found at index mid
    } else if (arr[mid] < k) { // or k > arr[mid]
        return binarySearchRecursive(arr, k, mid + 1, hign); // Search in the right half
    } else {
        return binarySearchRecursive(arr, k, low, mid - 1); // Search in the left half
    }
}

console.log(binarySearchRecursive([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 9)); // 2
console.log(binarySearchRecursive([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 27)); // 9
console.log(binarySearchRecursive([3, 6, 9, 12, 14, 19, 20, 23, 25, 27], 21)); // -1

// Time Complexity: O(log n)
// Space Complexity: O(log n) due to recursion stack
```

```python
def binary_search_recursive(arr, low, high, k):
    if low > high:
        return -1

    mid = low + (high - low) // 2

    if arr[mid] == k:
        return mid
    elif arr[mid] < k:
        return binary_search_recursive(arr, mid + 1, high, k)
    else:
        return binary_search_recursive(arr, low, mid - 1, k)


arr = [1, 2, 3, 4, 5, 6, 7]
print(binary_search_recursive(arr, 0, len(arr) - 1, 4))  # 3
print(binary_search_recursive(arr, 0, len(arr) - 1, 8))  # -1

# Time Complexity: O(log N)
# Space Complexity: O(log N) due to recursive call stack
```

### 2. Find first occurrence in a sorted array | Binary Search on Array **O(log N), O(1)**
```js
function findFirstOccurrence(arr, k) {
  let low = 0;
  let hign = arr.length - 1;
  let ans = -1;

  while (low <= hign) {
    const mid = low + Math.floor((hign - low) / 2); // Calculate mid index

    if (arr[mid] === k) {
      ans = mid; // Update ans if target is found
      hign = mid - 1; // Search in the left half for the first occurrence
    } else if (arr[mid] < k) {
      low = mid + 1; // Search in the right half
    } else {
      hign = mid - 1; // Search in the left half
    }
  }

  return ans; // First occurrence of k not found
}

console.log(findFirstOccurrence([3, 6, 9, 9, 9, 19, 20, 23, 27, 27], 9)); // 2
console.log(findFirstOccurrence([3, 6, 9, 9, 9, 19, 20, 23, 27, 27], 27)); // 8
console.log(findFirstOccurrence([3, 6, 9, 9, 9, 19, 20, 23, 27, 27], 21)); // -1

// Time Complexity: O(log n)
// Space Complexity: O(1)
```

```python
def find_first_occurrence(arr, k):
    low = 0
    high = len(arr) - 1
    ans = -1

    while low <= high:
        mid = low + (high - low) // 2

        if arr[mid] == k:
            ans = mid
            # Continue searching in the left half for an earlier occurrence
            high = mid - 1
        elif arr[mid] < k:
            low = mid + 1
        else:
            high = mid - 1

    return ans


print(find_first_occurrence([1, 2, 2, 2, 3, 4, 5], 2))  # 1
print(find_first_occurrence([1, 2, 3, 4, 5], 6))        # -1

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

### 3. Local Minima in an Array. A local minima is an element which is smaller than its neighbours | Binary Search on Array **O(log N), O(1)**
```js
function findLocalMinima(arr) {
  const n = arr.length;

  // --- EDGE CASE HANDLING ---

  // Case 1: Array has only one element.
  // It is technically a local minimum since it has no neighbors.
  if (n === 1) return arr[0];

  // Case 2: Check the very first element (index 0).
  // If index 0 is smaller than index 1, it's a local minimum (Slope starts up: / )
  if (arr[0] < arr[1]) return arr[0];

  // Case 3: Check the very last element (index n-1).
  // If the last item is smaller than the second to last, it's a local minimum (Slope ends down: \ )
  if (arr[n - 1] < arr[n - 2]) return arr[n - 1];

  // --- BINARY SEARCH SETUP ---

  // We start search from index 1 to n-2 because we already checked 0 and n-1.
  let low = 1;
  let high = n - 2; // (Corrected typo: 'hign' -> 'high')

  while (low <= high) {
    // Calculate middle index to split the array
    const mid = low + Math.floor((high - low) / 2);

    // --- CHECK FOR LOCAL MINIMA (V-Shape) ---
    // If mid is smaller than its left neighbor AND smaller than its right neighbor.
    // Shape:  \ /
    //          V
    if (arr[mid - 1] > arr[mid] && arr[mid] < arr[mid + 1]) {
      return arr[mid];
    }

    // --- DECIDE WHICH SIDE TO SEARCH ---

    // Scenario: The slope is going DOWN to the right (\ - Shape).
    // Logic: mid-1 is big, mid is smaller, mid+1 is even smaller (or unknown).
    // If we are falling down, the bottom (minimum) must be ahead of us (Right side).
    else if (arr[mid - 1] > arr[mid] && arr[mid] > arr[mid + 1]) {
      low = mid + 1; // Discard left half, move to right
    }

    // Scenario: The slope is going UP (/ - Shape) or is a Peak (^ - Shape).
    // Logic: In both cases, arr[mid-1] is smaller than arr[mid].
    // If the left neighbor is smaller, we should go back to find the bottom (Left side).
    else {
      high = mid - 1; // Discard right half, move to left
    }
  }

  return -1; // Should theoretically not be reached if inputs are valid distinct numbers
}

console.log(findLocalMinima([5, 9, 15, 16, 20, 21]));       // 5  (Detected by start check)
console.log(findLocalMinima([21, 20, 19, 17, 15, 9, 7]));   // 7  (Detected by end check)
console.log(findLocalMinima([5, 8, 12, 3]));                // 5  (First element check)
console.log(findLocalMinima([3, 6, 1, 0, 9, 15, 8]));       // 0  (Binary search finds the valley)

// Time Complexity: O(log n) - Because we cut the search space in half every iteration.
// Space Complexity: O(1)    - We only use a few variables for pointers.
```

```python
def find_local_minima(arr):
    n = len(arr)
    if n == 1:
        return arr[0]

    # Check boundaries
    if arr[0] < arr[1]:
        return arr[0]
    if arr[n - 1] < arr[n - 2]:
        return arr[n - 1]

    low = 1
    high = n - 2

    while low <= high:
        mid = low + (high - low) // 2

        if arr[mid] < arr[mid - 1] and arr[mid] < arr[mid + 1]:
            return arr[mid]
        elif arr[mid - 1] > arr[mid] and arr[mid] > arr[mid + 1]:
            low = mid + 1
        else:
            high = mid - 1

    return -1


print(find_local_minima([5, 9, 15, 16, 20, 21]))      # 5
print(find_local_minima([21, 20, 19, 17, 15, 9, 7]))  # 7
print(find_local_minima([3, 6, 1, 0, 9, 15, 8]))      # 0

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

### 4. Finding the square root of a number. | Binary Search on Array **O(log N), O(1)**
```js
function findSquareRoot(n) {
    // --- SEARCH RANGE ---
    // The square root of 'n' must be between 0 and 'n'.
    let low = 0;
    let high = n;

    // 'ans' stores the closest valid integer found so far.
    // We initialize it to 1 (though 0 or -1 is often safer for edge cases,
    // the logic below handles updates correctly for n >= 1).
    let ans = 1;

    while (low <= high) {
        // Calculate the middle point of the current range
        const mid = low + Math.floor((high - low) / 2);

        console.log(`low: ${low}, high: ${high}, mid: ${mid}`);

        // Calculate the square of the middle number
        const square = mid * mid;

        // --- CASE 1: EXACT MATCH ---
        // If mid * mid is exactly n, we found the perfect square root.
        if (square === n) {
            return mid;
        }

        // --- CASE 2: UNDER-SHOOT (Possibility) ---
        // If mid * mid is LESS than n, then 'mid' is a valid candidate for the "floor" root.
        // However, there might be a larger valid number, so we search the RIGHT half.
        else if (square < n) {
            ans = mid;      // Store current valid guess
            low = mid + 1;  // Try to find a larger number
        }

        // --- CASE 3: OVER-SHOOT ---
        // If mid * mid is GREATER than n, 'mid' is too big.
        // The answer must be smaller, so we search the LEFT half.
        else {
            high = mid - 1; // Eliminate the right half
        }
    }

    // If no perfect square was found, return the closest integer (floor)
    // stored in 'ans' from the last valid 'under-shoot'.
    return ans;
}

console.log(findSquareRoot(9));  // 3 (Exact match found)
console.log(findSquareRoot(10)); // 3 (3*3=9 is < 10, but 4*4=16 is > 10. Returns 3)
console.log(findSquareRoot(99)); // 9 (9*9=81 is < 99, but 10*10=100 is > 99. Returns 9)

// Time Complexity: O(log n) - Much faster than checking 1, 2, 3... (which is O(√n))
// Space Complexity: O(1)
```

```python
def find_square_root(n):
    if n < 0:
        return -1
    if n == 0 or n == 1:
        return n

    low = 0
    high = n
    ans = 1

    while low <= high:
        mid = low + (high - low) // 2

        if mid * mid == n:
            return mid
        elif mid * mid < n:
            ans = mid
            low = mid + 1
        else:
            high = mid - 1

    return ans


print(find_square_root(25))  # 5
print(find_square_root(20))  # 4
print(find_square_root(1))   # 1

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

### 5. Find a peak element | Binary Search on Array **O(log N), O(1)**
```
Given an array of integers A, find and return the peak element in it.
An array element is considered a peak if it is not smaller than its neighbors.
For corner elements, we need to consider only one neighbor.
```

#### Solution
We can optimize this to O(log N) using Binary Search. The observation is that if we are at an element that is smaller than its neighbor, we can move towards the larger neighbor to find a peak. This is because if we climb the "slope," we are guaranteed to eventually hit a peak (either a local maximum or the end of the array).

1. Find the middle element `mid`.
2. Compare `A[mid]` with its neighbors.
3. If `A[mid]` is smaller than `A[mid-1]`, then a peak must exist on the left side (move `high` to `mid - 1`).
4. If `A[mid]` is smaller than `A[mid+1]`, then a peak must exist on the right side (move `low` to `mid + 1`).
5. Otherwise, `A[mid]` is a peak.

```js
// Optimized Binary Search Implementation by our way
function findPeak(arr) {
  const n = arr.length;

  if (n === 1) return arr[0]; // If only one element, return it

  if (arr[0] >= arr[1]) return arr[0]; // Check first element

  if (arr[n - 1] >= arr[n - 2]) return arr[n - 1]; // Check last element

  let low = 1;
  let hign = n - 2;
  while (low <= hign) {
    const mid = low + Math.floor((hign - low) / 2); // Calculate mid index

    if (arr[mid] > arr[mid - 1] && arr[mid] > arr[mid + 1]) { // Peak found
      return arr[mid];
    }
    if (arr[mid] < arr[mid - 1]) { //shape is (\ - shape)
      // Search in the left half
      hign = mid - 1;
    } else { // shape is (/ - shape) or (^ - shape)
      // Search in the right half
      low = mid + 1;
    }
  }

  return -1; // No peak found
}

console.log(findPeak([1, 2, 3, 4, 5])); // 5
console.log(findPeak([5, 17, 100, 11])); // 100
console.log(findPeak([1, 1000000000, 1000000000])); // 1000000000

// Time Complexity: O(log n)
// Space Complexity: O(1)


// Alternative Binary Search Implementation
/**
 * Uses Binary Search to find a peak element efficiently.
 * Time:  O(log N) - We halve the search space in every iteration.
 * Space: O(1) - Iterative approach uses constant extra space.
 */
function findPeakElementBinary(A) {
  let low = 0;
  let high = A.length - 1;
  const n = A.length;

  while (low <= high) {
    // Calculate the middle index to avoid overflow
    let mid = Math.floor(low + (high - low) / 2);

    // Check if the current mid element is a peak
    // 1. Check if left neighbor exists and if mid is >= left neighbor
    // 2. Check if right neighbor exists and if mid is >= right neighbor
    const isGreaterThanLeft = (mid === 0) || (A[mid] >= A[mid - 1]);
    const isGreaterThanRight = (mid === n - 1) || (A[mid] >= A[mid + 1]);

    if (isGreaterThanLeft && isGreaterThanRight) {
      return A[mid];
    }

    // If we are not at a peak, decide which half to explore

    // If the left neighbor is greater, a peak must exist in the left half
    if (mid > 0 && A[mid - 1] > A[mid]) {
      high = mid - 1;
    }
    // Otherwise, the right neighbor is greater (or equal), so explore right
    else {
      low = mid + 1;
    }
  }

  return -1; // Should not be reached
}

console.log(findPeakElementBinary([1, 2, 3, 4, 5])); // 5
console.log(findPeakElementBinary([5, 17, 100, 11])); // 100

// Time Complexity: O(log N)
// Space Complexity: O(1)


// Alternative Binary Search Implementation if Array has Duplicates
/**
 * Finds a peak in an array with duplicates where flat plateaus
 * make direction ambiguous.
 * Time:  O(N) worst case (all duplicates), O(log N) average.
 * Space: O(1)
 */
function findPeakWithDuplicates(A) {
  let low = 0;
  let high = A.length - 1;

  while (low < high) {
    let mid = Math.floor(low + (high - low) / 2);

    if (A[mid] > A[mid + 1]) {
      // The slope is going down to the right.
      // A peak must be at 'mid' or somewhere to the left.
      high = mid;
    } else if (A[mid] < A[mid + 1]) {
      // The slope is going up to the right.
      // A peak must be to the right.
      low = mid + 1;
    } else {
      // A[mid] == A[mid + 1]
      // We are on a plateau. We can't determine direction safely.
      // Strategy: Shrink the search space from the right slightly.
      // This is safe because if high was the unique peak,
      // A[high-1] would likely guide us back,
      // or we will eventually find it as we shrink.
      high--;
    }
  }

  // low will converge to the peak index
  return A[low];
}

console.log(findPeakWithDuplicates([2, 2, 2, 3, 2, 2])); // 3
console.log(findPeakWithDuplicates([1, 2, 3, 1])); // 3

// Time Complexity: O(N) worst case (e.g., [2, 2, 2, 2]), O(log N) if few duplicates.
// Space Complexity: O(1)
```

```python
def find_peak(arr):
    n = len(arr)
    if n == 1:
        return arr[0]
    if arr[0] >= arr[1]:
        return arr[0]
    if arr[n - 1] >= arr[n - 2]:
        return arr[n - 1]

    low = 1
    high = n - 2

    while low <= high:
        mid = low + (high - low) // 2

        if arr[mid] >= arr[mid - 1] and arr[mid] >= arr[mid + 1]:
            return arr[mid]
        elif arr[mid - 1] > arr[mid]:
            high = mid - 1
        else:
            low = mid + 1

    return -1


print(find_peak([1, 2, 3, 4, 5]))     # 5
print(find_peak([5, 4, 3, 2, 1]))     # 5
print(find_peak([1, 2, 1, 3, 5, 6, 4])) # 2 or 6

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

## 2. Searching 2: Binary Search on Answer

### 1. Painter's Partition. Find minimum largest workload. | Binary Search on Answer **O(log N), O(1)**
```
Given an array containing lenghts of boards called A[], there are K painters available to paint these boards.
Each painter takes T unit of time to paint 1 unit of board length.
Calculate the minimum time required to paint all the boards under the following constraints:
1. A painter can only paint continuous sections of board.
2. A painter can only paint one board at a time.
```

```js
// PAINTER'S PARTITION PROBLEM
// Problem: Given N boards of different lengths, K painters, and time T per unit length,
// find the minimum time required to paint all boards when:
// - Each painter paints contiguous sections of boards
// - All painters work simultaneously

// ============================================================================
// BINARY SEARCH APPROACH
// ============================================================================
// We binary search on the answer (minimum time required)
// Search space boundaries:
// - low = max(A[i]) * T  → Best case: K painters ≥ N boards, each paints one board
//                           Bottleneck is the longest board
// - high = sum(A[i]) * T → Worst case: Only 1 painter paints all boards sequentially

// ============================================================================
// FEASIBILITY CHECK FUNCTION
// ============================================================================
// Checks if all boards can be painted within 'maxTimeAllowed' using at most 'paintersAvailable'
// Strategy: Greedy allocation - assign boards to current painter until time limit
function isFeasible(boards, timePerUnit, paintersAvailable, maxTimeAllowed) {
    let painters = 1;        // Start with first painter
    let currentTime = 0;     // Time allocated to current painter
    let flag = false;        // flag to indicate whether feasible or not

    // Try to allocate each board to painters
    for (let i = 0; i < boards.length; i++) {
        let boardTime = boards[i] * timePerUnit;  // calculate time required for the current board
        currentTime += boardTime;                 // Add current board's time to current painter

        // If current painter exceeds time limit
        if (currentTime > maxTimeAllowed) {
            painters++;                 // Allocate a new painter
            currentTime = boardTime;    // New painter starts with current board
        }

        // If we need more painters than available, it's not feasible
        if (painters > paintersAvailable) {
            flag = false;
            console.log(`isFeasible([${boards}], ${timePerUnit}, ${paintersAvailable}, ${maxTimeAllowed}) : ${flag}`);
            return flag;
        }
    }

    // Successfully allocated all boards within paintersAvailable
    flag = true;
    console.log(`isFeasible([${boards}], ${timePerUnit}, ${paintersAvailable}, ${maxTimeAllowed}) : ${flag}`);
    return flag;
}

// ============================================================================
// MAIN FUNCTION - BINARY SEARCH FOR MINIMUM TIME
// ============================================================================
// A: Array of board lengths
// T: Time to paint one unit length
// K: Number of painters available
function minTime(A, T, K) {
    // Initialize search space
    let low = Math.max(...A) * T;                              // Minimum possible time
    let high = A.reduce((acc, item) => acc + (item * T), 0);   // Maximum possible time
    let ans = high;                                            // Store the answer (initially worst case)

    // Binary search on the answer
    while (low <= high) {
        let mid = low + Math.floor((high - low) / 2);  // Calculate middle time (avoids overflow)

        // Check if painting all boards in 'mid' time is feasible
        if (isFeasible(A, T, K, mid)) {
            ans = mid;           // Update answer (found a valid solution)
            high = mid - 1;      // Try to find an even smaller time (search left half)
        } else {
            low = mid + 1;       // Not feasible, need more time (search right half)
        }
    }

    return ans;       // Return the minimum time found
}

// Boards=[5,3,6,1,7], Time=2 per unit, Painters=3
// Expected: 16 (Painter1: 5,3 → 16, Painter2: 6 → 12, Painter3: 1,7 → 16)
console.log(minTime([5, 3, 6, 1, 7], 2, 3)); // 16

// Boards=[4,2,2,3], Time=2 per unit, Painters=3
// Expected: 8 (Painter1: 4 → 8, Painter2: 2,2 → 8, Painter3: 3 → 6)
console.log(minTime([4, 2, 2, 3], 2, 3)); // 8

// Time complexity: O(N * log(sum - max))
//   - Binary search runs log(high - low) times
//   - Each isFeasible check takes O(N) to iterate through boards
//   - Therefore: O(N * log(high - low))
// Space complexity: O(1)
//   - Only using constant extra space for variables
```

```python
def is_possible(boards, painters, max_time_per_painter):
    num_painters = 1
    current_time = 0

    for length in boards:
        if current_time + length <= max_time_per_painter:
            current_time += length
        else:
            num_painters += 1
            current_time = length
            if num_painters > painters:
                return False

    return True


def painters_partition(boards, painters):
    low = max(boards)
    high = sum(boards)
    ans = high

    while low <= high:
        mid = low + (high - low) // 2

        if is_possible(boards, painters, mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1

    return ans


print(painters_partition([10, 20, 30, 40], 2))  # 60

# Time Complexity: O(N * log(sum - max))
# Space Complexity: O(1)
```

### 2. Email Response Handlers. Find minimum largest workload. | Binary Search on Answer **O(log N), O(1)**
```
Imagine you tasked with developing a system for evenly distributing the workload among a team of email response handlers in a customer service department. Each email is assigned a 'complexity' score, which represents the estimated time and effort required to address it. The complexity scores are represented as an array, where each email corresponds to a single email.

The goal is to divide the array into K contiguous blocks(where k is the number of email handlers), such that the maximum sum of complexity scores in any block is minimized. The approach aims to ensure that no single email handler is overwhelmed with highly complex emails, while others are left with simpler ones.
```

```js
// For binary search
// 1. target: max sum of complexity scores in any block
// 2. search space:
// low = max(A[i]) if number of email handlers are same as emails
// high = sum(A[i]) if only one email handler is available

/**
 * Check if it is feasible to divide the array into <= given blocks
 * such that no block's sum exceeds 'maxCapacity' (the proposed max capacity).
 */
function isFeasible(workLoads, blocksAllowed, maxCapacity) {
    // Start with 1 email handler (block)
    let currentBlocks = 1;

    // Initialize the current workload sum for this handler to 0
    let currentWorkload = 0;

    // Iterate through every email complexity score in the array
    for (let i = 0; i < workLoads.length; i++) {

        // Tentatively add the current email's complexity to the current handler's load
        currentWorkload += workLoads[i];

        // Check if adding this email pushed the handler over the 'maxCapacity' limit
        if (currentWorkload > maxCapacity) {
            // If yes, we must assign this email to a NEW handler (start a new block)
            currentBlocks++;

            // The new handler starts with just this current email's complexity
            currentWorkload = workLoads[i];
        }

        // Optimization check: If we have used more handlers than available (blocksAllowed),
        // this specific 'maxCapacity' capacity is too small to work.
        if (currentBlocks > blocksAllowed) {
            return false; // Return immediately to save maxCapacity
        }
    }

    // If we processed all emails without exceeding 'k' handlers, this capacity is valid
    return true;
}

/**
 * Binary search to find the minimum possible value for the "max workload"
 */
function minMaxSum(A, k) {
    // Lower Bound: The capacity cannot be smaller than the single largest email.
    // Even with infinite handlers, someone has to take the largest task alone.
    let low = Math.max(...A);

    // Upper Bound: The capacity cannot be larger than the total sum of all emails.
    // This is the worst-case scenario where 1 handler does everything.
    let high = A.reduce((acc, item) => acc + item, 0);

    // Initialize 'ans' to the worst-case (high) as a fallback
    let ans = high;

    // Standard Binary Search loop: continues until the search space collapses
    while (low <= high) {

        // Pick the middle value between low and high to test as our "candidate capacity"
        let mid = low + Math.floor((high - low) / 2);

        // Call the helper to see if 'mid' is a valid capacity for k handlers
        if (isFeasible(A, k, mid)) {
            // SUCCESS: 'mid' is a valid capacity.
            // Store it as a potential answer.
            ans = mid;

            // Try to find an even smaller (better) capacity by eliminating the right half
            high = mid - 1;
        } else {
            // FAILURE: 'mid' was too small (required more than k handlers).
            // We must increase the capacity, so eliminate the left half.
            low = mid + 1;
        }
    }

    // Return the smallest capacity that was marked as feasible
    return ans;
}

// Test Case 1: [1, 2, 3, 4] split into 2 blocks.
// Optimal split: [1, 2, 3] (sum 6) and [4] (sum 4). Max is 6.
console.log(minMaxSum([1, 2, 3, 4], 2)); // Output: 6

// Test Case 2: [1, 2, 3, 4] split into 3 blocks.
// Optimal split: [1, 2], [3], [4]. Max sums are 3, 3, 4. Max is 4.
console.log(minMaxSum([1, 2, 3, 4], 3)); // Output: 4

// Test Case 3: [7, 2, 5, 10, 8] split into 2 blocks.
// Optimal split: [7, 2, 5] (sum 14) and [10, 8] (sum 18). Max is 18.
console.log(minMaxSum([7, 2, 5, 10, 8], 2)); // Output: 18

// Time complexity: O(N * log(S))
// N = length of array A (due to the loop in isFeasible)
// S = sum of all elements in A (log(high - low) represents the binary search steps)

// Space complexity: O(1)
// We only store a few integer variables (low, high, mid, ans, blocks, curr).
```

```python
def is_feasible_handlers(complexity, max_handlers, max_load):
    handlers = 1
    current_load = 0

    for score in complexity:
        if current_load + score <= max_load:
            current_load += score
        else:
            handlers += 1
            current_load = score
            if handlers > max_handlers:
                return False

    return True


def min_max_response_complexity(complexity, k):
    low = max(complexity)
    high = sum(complexity)
    ans = high

    while low <= high:
        mid = low + (high - low) // 2

        if is_feasible_handlers(complexity, k, mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1

    return ans


print(min_max_response_complexity([12, 34, 67, 90], 2))  # 113

# Time Complexity: O(N * log(sum - max))
# Space Complexity: O(1)
```

### 3. Aggresive Cows. Find largest minimum distance. | Binary Search on Answer **O(log N), O(1)**
```
Given K cows and N stalls, there is an array A[] denoting the location of stalls.
Place all K cows in such a way that the minimum distance between any two cows is as long as possible. Find the largest minimum distance.

If the location of stalls is not sorted, sort it first.

Note:
1. Only one cow can be placed in single stall.
2. All cows have to be placed.

Problem Constraints:
2 <= N <= 100000
0 <= A[i] <= 10^9
2 <= K <= N
```

```js
/**
 * Helper function: isFeasible
 * Determines if it is possible to place 'k' cows such that
 * the distance between any two cows is at least 'dist'.
 *
 * Strategy: Greedy approach.
 * We place the first cow at the very first stall (index 0) to leave
 * as much space as possible for the remaining cows. Then, we only
 * place the next cow when the distance requirement is met.
 */
function isFeasible(stallLocations, totalCows, dist) {
    // Start by placing the first cow at the first stall (index 0).
    let cows = 1;

    // Keep track of the index of the stall where the LAST cow was placed.
    let lastLocation = 0;

    // Iterate through the remaining stalls to see where we can place the rest.
    for (let i = 1; i < stallLocations.length; i++) {

        // Check the distance between the current stall (stallLocations[i]) and the
        // last stall where a cow was placed (stallLocations[lastLocation]).
        // If this gap is >= 'dist', it is valid to place a cow here.
        if (stallLocations[i] - stallLocations[lastLocation] >= dist) {
            cows++; // Place the next cow here.
            lastLocation = i; // Update the last location to this current stall.
        }

        // If we have successfully placed totalCows, this 'dist' is feasible.
        if (cows === totalCows) {
            return true;
        }
    }

    // If we went through all stalls and couldn't place totalCows
    // with at least 'dist' gap, this distance is too ambitious.
    return false;
}

/**
 * Main function: largestMinDistance
 * Uses Binary Search to find the maximum possible value for the minimum distance.
 */
function largestMinDistance(A, k) {
    // 1. Sort the stall locations.
    // This is critical because we need to calculate distances between
    // stalls in increasing order to use the greedy approach in isFeasible.
    A.sort((a, b) => a - b);

    // 2. Define the search space for the answer (the distance).
    // The smallest possible distance between any two distinct stalls is at least 1.
    let low = 1;

    // The largest possible distance is the gap between the first and last stall.
    // (We cannot have a gap larger than the total span of the array).
    let high = A[A.length - 1] - A[0];

    // Variable to store the best valid distance found so far.
    // Initialize it to the highest possible distance.
    let ans = high;

    // 3. Binary Search Loop
    while (low <= high) {
        // Calculate 'mid', which represents the "minimum distance" we are currently testing.
        // effectively: mid = (low + high) / 2
        let mid = low + Math.floor((high - low) / 2);

        // 4. Check if 'mid' is a feasible distance using the helper function.
        if (isFeasible(A, k, mid)) {
            // If true, it means we CAN place cows with at least 'mid' distance.
            ans = mid; // Store this as a potential answer.

            // Since we want the LARGEST minimum distance, we try to go higher.
            // We eliminate the lower half of the search space.
            low = mid + 1;
        } else {
            // If false, it means 'mid' was too large (cows couldn't fit).
            // We need to try smaller distances, so we eliminate the upper half.
            high = mid - 1;
        }
    }

    // Return the largest feasible minimum distance found.
    return ans;
}

// Test Case 1
// Stalls at: 0, 3, 4, 7, 9, 10 | Cows: 4
// Result: 3 (Cows can be placed at 0, 3, 7, 10)
console.log(largestMinDistance([0, 3, 4, 7, 9, 10], 4));

// Test Case 2
// Stalls at: 1, 2, 4, 8, 9 | Cows: 3
// Result: 3 (Cows can be placed at 1, 4, 8)
console.log(largestMinDistance([1, 2, 4, 8, 9], 3));

// Complexity Analysis:
// Time Complexity: O(N * log(Range))
//   - Sorting takes O(N log N).
//   - The Binary Search runs O(log(Range)) times, where Range = max_stall - min_stall.
//   - Inside each binary search step, isFeasible iterates through the array: O(N).
//   - Total: O(N log N + N * log(High - Low)).
//
// Space Complexity: O(1)
//   - We only use a few variables for tracking indices and bounds.
```

```python
def is_feasible_cows(stalls, dist, cows):
    count = 1
    last_pos = stalls[0]

    for i in range(1, len(stalls)):
        if stalls[i] - last_pos >= dist:
            count += 1
            last_pos = stalls[i]
            if count >= cows:
                return True

    return False


def aggressive_cows(stalls, cows):
    stalls.sort()
    low = 1
    high = stalls[-1] - stalls[0]
    ans = 0

    while low <= high:
        mid = low + (high - low) // 2

        if is_feasible_cows(stalls, mid, cows):
            ans = mid
            low = mid + 1
        else:
            high = mid - 1

    return ans


print(aggressive_cows([1, 2, 8, 4, 9], 3))  # 3

# Time Complexity: O(N log N + N * log(max_dist))
# Space Complexity: O(1)
```

### 4. Least Capacity to Ship Packages A Within B Days. Find minimum ship capacity. | Binary Search on Answer **O(log N), O(1)**
```
A conveyor belt has N packages that must be shipped from one port to another within B days.

The ith package on the conveyor belt has a weight of A[i]. Each day, we load the ship with packages on the conveyor belt (in the order given by A). We may not load more weight than the maximum weight capacity of the ship.

Return the least weight capacity of the ship that will result in all the packages on the conveyor belt being shipped within B days.
```

```js
/**
 * Main function: leastCapacityToShip
 * Finds the minimum ship capacity required to ship all packages within B days.
 */
function leastCapacityToShip(A, B) {
    // 1. Define the search space boundaries.

    // Lower Bound (left): The ship MUST be at least capable of carrying the
    // single heaviest package. If the capacity is smaller than the heaviest package,
    // we can never load that specific package.
    let left = Math.max(...A);

    // Upper Bound (right): In the worst case (1 day), the ship needs to carry
    // all packages at once. So the max capacity needed is the sum of all weights.
    let right = A.reduce((a, b) => a + b, 0);

    /**
     * Helper function: canShip
     * Checks if a specific ship 'capacity' is sufficient to transport
     * all packages within 'B' days.
     * * Strategy: Greedy approach.
     * We load packages in the exact order they arrive (A[0], A[1]...) onto the
     * ship for the current day until we can't fit the next one. Then we move
     * to the next day.
     */
    function canShip(capacity) {
        let days = 1;      // Start counting from Day 1
        let current = 0;   // Current weight loaded on the ship for this day

        for (let weight of A) {
            // Check if adding the next package exceeds the ship's limit
            if (current + weight > capacity) {
                days++;        // If it exceeds, we must ship what we have and start a new day
                current = 0;   // Reset the current load for the new day
            }
            // Add the package to the current day's load
            // (If we just started a new day, this is the first package of that day)
            current += weight;
        }

        // If the total days required is less than or equal to the limit B,
        // then this capacity is valid/feasible.
        return days <= B;
    }

    // Variable to store the best (smallest) valid capacity found so far.
    let answer = right;

    // 2. Binary Search Loop
    while (left <= right) {
        // Pick a capacity in the middle of our search range
        let mid = Math.floor((left + right) / 2);

        // 3. Check feasibility
        if (canShip(mid)) {
            // If we CAN ship within B days using 'mid' capacity:
            answer = mid;    // Record this as a potential answer
            right = mid - 1; // Try to find an even SMALLER capacity (optimization)
        } else {
            // If we CANNOT ship within B days (took too many days):
            // It means 'mid' capacity is too small. We need a bigger ship.
            left = mid + 1;  // Eliminate the lower half
        }
    }

    return answer;
}

// Test Case 1
// Weights: [1..10], Days: 5
// Total sum = 55. Heaviest = 10.
// Optimal capacity is 15.
// Day 1: 1, 2, 3, 4, 5 (Total 15)
// Day 2: 6, 7 (Total 13)
// Day 3: 8 (Total 8)
// Day 4: 9 (Total 9)
// Day 5: 10 (Total 10)
console.log(leastCapacityToShip([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)); // 15

// Test Case 2
// Weights: [1, 2, 3, 1, 1], Days: 4
// Optimal capacity is 3.
// Day 1: 1, 2 (Total 3)
// Day 2: 3 (Total 3)
// Day 3: 1, 1 (Total 2) -> Wait, logic check:
// Actually:
// Day 1: 1, 2 (3)
// Day 2: 3 (3)
// Day 3: 1, 1 (2) -> Done in 3 days, which is <= 4 days. Valid.
console.log(leastCapacityToShip([1, 2, 3, 1, 1], 4)); // 3

// Complexity Analysis:
// Time Complexity: O(N * log(Sum - Max))
//   - We search the range from Max(A) to Sum(A).
//   - For every step of binary search, we iterate through A (O(N)) inside canShip.
// Space Complexity: O(1)
//   - We only use variables for tracking limits and sums.
```

```python
def can_ship(weights, days, capacity):
    days_needed = 1
    current_weight = 0

    for w in weights:
        if current_weight + w <= capacity:
            current_weight += w
        else:
            days_needed += 1
            current_weight = w
            if days_needed > days:
                return False

    return True


def least_capacity_to_ship(weights, days):
    low = max(weights)
    high = sum(weights)
    ans = high

    while low <= high:
        mid = low + (high - low) // 2

        if can_ship(weights, days, mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1

    return ans


print(least_capacity_to_ship([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))  # 15

# Time Complexity: O(N * log(sum - max))
# Space Complexity: O(1)
```

### 5. Allocate Books | Binary Search on Answer **O(Nlog(Sum-Max)), O(1)**
```
Given an array of integers A of size N and an integer B.
The College library has N books. The ith book has A[i] number of pages.
You have to allocate books to B number of students so that the maximum number of pages allocated to a student is minimum.

A book will be allocated to exactly one student.
Each student has to be allocated at least one book.
Allotment should be in contiguous order, for example: A student cannot be allocated book 1 and book 3, skipping book 2.
```

```js
function isFeasible(A, dist, k) {
  let students = 1;
  let curr = 0;
  for (let i = 0; i < A.length; i++) {
    curr += A[i];
    if (curr > dist) {
      students++;
      curr = A[i];
    }
    if (students > k) {
      return false;
    }
  }
  return true;
}

function allocateBooks(A, k) {
  // if we have more students than books, impossible
  if (k > A.length) return -1;

  let low = Math.max(...A);
  let high = A.reduce((acc, item) => acc + item, 0);
  let ans = -1;

  while (low <= high) {
    let mid = Math.floor(low + (high - low) / 2);
    if (isFeasible(A, mid, k)) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return ans;
}
console.log(allocateBooks([12, 34, 67, 90], 2)); // 113
console.log(allocateBooks([12, 15, 78], 4)); // -1

// Time complexity: O(Nlog(high-low))
// Space complexity: O(1)
```

```python
def is_feasible_allocation(A, max_pages, students):
    allocated_students = 1
    current_pages = 0

    for pages in A:
        if current_pages + pages <= max_pages:
            current_pages += pages
        else:
            allocated_students += 1
            current_pages = pages
            if allocated_students > students:
                return False

    return True


def allocate_books(A, B):
    if len(A) < B:
        return -1

    low = max(A)
    high = sum(A)
    ans = -1

    while low <= high:
        mid = low + (high - low) // 2

        if is_feasible_allocation(A, mid, B):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1

    return ans


print(allocate_books([12, 34, 67, 90], 2))  # 113

# Time Complexity: O(N * log(sum - max))
# Space Complexity: O(1)
```

## 3. Linked List Introduction

### 1. Given the head of a linked list, return the kth element. | Linked List **O(N), O(1)**
```js
function getKthElement(head, k) {
  let current = head;

  for (let i = 0; i < k; i++) {
    current = current.next;
  }

  return current.data;
}
const head = { data: 1, next: { data: 2, next: { data: 3, next: { data: 4, next: { data: 5, next: null } } } } };
console.log(getKthElement(head, 2)); // 3
```

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def get_kth_element(head, k):
    current = head
    for _ in range(k):
        if current is None:
            return None
        current = current.next
    return current


# Time Complexity: O(k)
# Space Complexity: O(1)
```

### 2. Print Linked List | Linked List **O(N), O(1)**
```js
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  append(data) {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  printList() {
    let current = this.head;
    while (current) {
      process.stdout.write(current.data + " ");
      current = current.next;
    }
    console.log();
  }
}
const list = new LinkedList();
list.append(1);
list.append(2);
list.append(3);
list.append(4);
// {data: 1, next: {data: 2, next: {data: 3, next: {data: 4, next: null}}}}
list.printList(); // 1 2 3 4
```

```python
class ListNode:
    def __init__(self, data=0, next=None):
        self.data = data
        self.next = next


def print_linked_list(head):
    current = head
    while current is not None:
        print(current.data, end=" -> ")
        current = current.next
    print("None")


# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 3. kth Node in a List | Linked List **O(N), O(1)**
```
You are given a singly linked list and an integer k. Your task is to access the node at the k-th index (0-based indexing) in the list and return its value. If the index is out of bounds, return -1.
```

```js
class ListNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  append(data) {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  getKthElement(k) {
    let current = this.head;
    for (let i = 0; i < k; i++) {
      if (!current) return -1; // Out of bounds
      current = current.next;
    }
    return current ? current.data : -1; // Return -1 if out of bounds
  }
}
const list = new LinkedList();
list.append(1);
list.append(3);
list.append(5);
list.append(7);
list.append(9);
console.log(JSON.stringify(list.head)); // Output the original list
// {data: 1, next: {data: 3, next: {data: 5, next: {data: 7, next: {data: 9, next: null}}}}}
console.log(list.getKthElement(2)); // 5
```

```python
class ListNode:
    def __init__(self, data=0, next=None):
        self.data = data
        self.next = next


def get_kth_node(head, k):
    current = head
    idx = 0
    while current is not None:
        if idx == k:
            return current.data
        current = current.next
        idx += 1
    return -1


# Time Complexity: O(k)
# Space Complexity: O(1)
```

## 4. Linked List: Basic Problems

### 1. Simple linked list implementation. **O(N), O(1)**
```js
class Node {
    constructor(data) {
        this.data = data; // store the value carried by this node
        this.next = null; // pointer to the next node in the list
    }
}

class LinkedList {
    constructor() {
        this.head = null; // reference to the first node in the list
    }

    append(data) {
        const newNode = new Node(data); // create a new node with the given value
        if (this.head === null) { // if the list is empty
            this.head = newNode; // set new node as head
            return; // exit because append is complete
        }
        let current = this.head; // start traversal from the head
        while (current.next !== null) { // move until the last node
            current = current.next; // advance to the next node
        }
        current.next = newNode; // link the last node to the new node
    }

    display() {
        let current = this.head; // start from the head node
        const values = []; // collect node values for joined output
        while (current) { // traverse until no more nodes
            values.push(current.data); // record the current node's value
            current = current.next; // advance to the next node
        }
        process.stdout.write(values.join(' -> ')); // print values separated by arrows
        console.log(''); // add newline after the list
    }
}

const list = new LinkedList(); // instantiate an empty linked list
list.append(1); // append first value: list = 1
list.append(2); // append second value: list = 1 -> 2
list.append(3); // append third value: list = 1 -> 2 -> 3
list.display(); // 1 -> 2 -> 3

// serialize and print the raw linked list structure
console.log(JSON.stringify(list.head));
// { "data": 1, "next": { "data": 2, "next": { "data": 3, "next": null } } }
```

```python
class Node:
    def __init__(self, data=0, next=None):
        self.data = data
        self.next = next


class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node


# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 2. Check if value K is present in the linked list or not. **O(N), O(1)**
```js
function isValuePresent(head, k) {
  let current = head;
  while (current !== null) {
    if (current.data === k) {
      return true; // Value found
    }
    current = current.next; // Move to the next node
  }
  return false; // Value not found
}

const head = { data: 1, next: { data: 5, next: { data: 3, next: null } } };
console.log(isValuePresent(head, 3)); // true
console.log(isValuePresent(head, 4)); // false
console.log(isValuePresent(head, 5)); // true
```

```python
def is_value_present(head, k):
    current = head
    while current is not None:
        if current.data == k:
            return True
        current = current.next
    return False


# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 3. Insert a new node with data V at position P in the linked list. / Insert in Linked List. **O(N), O(1)**
```js
function getNodeAtPosition(head, P) {
  let current = head;
  for (let i = 0; i < P && current !== null; i++) {
    current = current.next; // Move to the next node
  }
  return current; // Return the node at position P
}

function insertAtPosition(head, V, P) {
  const newNode = { data: V, next: null };

  if (P === 0) {
    newNode.next = head; // Insert at the head
    return newNode; // Return new head
  }

  const prevNode = getNodeAtPosition(head, P - 1); // Get the node at position P-1
  const nextNode = prevNode.next; // Get the node at position P
  prevNode.next = newNode; // Link the new node to the previous node
  newNode.next = nextNode; // Link the new node to the next node
  return head; // Return the head of the list
}

const head = { data: 1, next: { data: 2, next: { data: 3, next: { data: 5, next: null } } } }; // Create a linked list
console.log(head); // Output the original list
const V = 4; // Value to insert
const P = 1; // Position to insert at
const newHead = insertAtPosition(head, V, P); // Insert the new node
console.log(JSON.stringify(newHead)); // Output the new head of the list
// { data: 1, next: { data: 4, next: { data: 2, next: { data: 3, next: null } } } }
```

```python
def insert_at_position(head, p, v):
    new_node = Node(v)
    if p == 0:
        new_node.next = head
        return new_node

    current = head
    for _ in range(p - 1):
        if current is None:
            break
        current = current.next

    if current is not None:
        new_node.next = current.next
        current.next = new_node

    return head


# Time Complexity: O(P)
# Space Complexity: O(1)
```

### 4. Size of the linked list. **O(N), O(1)**
```js
function getSize(head) {
  let size = 0;
  let current = head;
  while (current !== null) {
    size++; // Increment size for each node
    current = current.next; // Move to the next node
  }
  return size; // Return the size of the list
}

const head = { data: 1, next: { data: 2, next: { data: 3, next: null } } }; // Create a linked list
console.log(getSize(head)); // Output the size of the list
```

```python
def get_size(head):
    size = 0
    current = head
    while current is not None:
        size += 1
        current = current.next
    return size


# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 5. Deletion in the linked list. / Delete in Linked List. **O(N), O(1)**
```
Delete the first occurrence of value X in the linked list. If the value is not found, leave the list unchanged.
```

```js
function deleteNode(head, X) {
  if (head === null) return null; // If the list is empty, return null

  if (head.data === X) {
    return head.next; // If the head node is to be deleted, return the next node as the new head
  }

  let current = head;
  while (current.next !== null && current.next.data !== X) {
    current = current.next; // Traverse the list to find the node to delete
  }

  if (current.next !== null) {
    current.next = current.next.next; // Bypass the node to delete it
  }

  return head; // Return the head of the list
}

const head = { data: 1, next: { data: 2, next: { data: 3, next: null } } }; // Create a linked list
console.log(head); // Output the original list
const X = 2; // Value to delete
const newHead = deleteNode(head, X); // Delete the node with value X
console.log(JSON.stringify(newHead)); // Output the new head of the list
// { data: 1, next: { data: 3, next: null } }
```

```python
def delete_node(head, x):
    if head is None:
        return None

    if x == 0:
        return head.next

    current = head
    for _ in range(x - 1):
        if current is None or current.next is None:
            return head
        current = current.next

    if current.next is not None:
        current.next = current.next.next

    return head


# Time Complexity: O(X)
# Space Complexity: O(1)
```

### 6. Reverse the linked list given the head of the linked list. **O(N), O(1)**
```js
function reverseLinkedList(head) {
  let prev = null; // Previous node
  let current = head; // Current node

  while (current !== null) {
    const nextNode = current.next; // Store the next node
    current.next = prev; // Reverse the link
    prev = current; // Move prev to current
    current = nextNode; // Move to the next node
  }

  return prev; // Return the new head of the reversed list
}

const head = { data: 1, next: { data: 2, next: { data: 3, next: null } } }; // Create a linked list
console.log(head); // Output the original list
const newHead = reverseLinkedList(head); // Reverse the linked list
console.log(JSON.stringify(newHead)); // Output the new head of the reversed list
// { data: 3, next: { data: 2, next: { data: 1, next: null } } }
```

```python
def reverse_linked_list(head):
    prev = None
    curr = head

    while curr is not None:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node

    return prev


# Time Complexity: O(N)
# Space Complexity: O(1)
```

## 5. Stacks

### 1. Implementation of Stack using static array. **O(N), O(1)**
```js
class Stack {
  constructor() {
    this.array = new Array(8); // Array to hold stack elements
    this.length = 0; // Current length of the stack
    this.topIndex = -1; // Index of the top element
  }

  push(element) {
    if (this.topIndex === this.array.length - 1) {
      console.log("Stack Overflow");
      return;
    }

    this.topIndex++; // Increment topIndex
    this.array[this.topIndex] = element; // Add element to the top of the stack
    this.length++;
  }

  pop() {
    if (this.topIndex === -1) {
      console.log("Stack Underflow");
      return null;
    }

    const poppedElement = this.array[this.topIndex]; // Get the top element
    this.topIndex--; // Decrement topIndex
    this.length--; // Decrease the length of the stack
    return poppedElement; // Return the popped element
  }

  peek() {
    if (this.topIndex === -1) {
      console.log("Stack is empty");
      return null;
    }

    return this.array[this.topIndex]; // Return the top element without removing it
  }

  size() {
    return this.length; // Return the current length of the stack
  }

  isEmpty() {
    return this.length === 0; // Check if the stack is empty
  }

  display() {
    if (this.isEmpty()) {
      console.log("Stack is empty");
      return;
    }

    for (let i = 0; i <= this.topIndex; i++) {
      process.stdout.write(this.array[i] + " ");
    }
  }
}

const stack = new Stack();
stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
stack.push(50);
stack.push(60);
console.log(stack.size()); // 6
console.log(stack.pop()); // 60
console.log(stack.pop()); // 50
console.log(stack.size()); // 4
stack.display(); // 10 20 30 40
```

```python
class StaticArrayStack:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.array = [None] * capacity
        self.top_idx = -1

    def push(self, val):
        if self.top_idx == self.capacity - 1:
            raise OverflowError("Stack Overflow")
        self.top_idx += 1
        self.array[self.top_idx] = val

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack Underflow")
        val = self.array[self.top_idx]
        self.top_idx -= 1
        return val

    def peek(self):
        if self.is_empty():
            return None
        return self.array[self.top_idx]

    def is_empty(self):
        return self.top_idx == -1


# Time Complexity: O(1) for push, pop, peek
# Space Complexity: O(capacity)
```

### 2. Implementation of Stack using dynamic array. **O(N), O(1)**
```js
class Stack {
  constructor() {
    this.array = []; // Initialize an empty array to hold stack elements
    this.length = 0; // Current length of the stack
    this.topIndex = -1; // Index of the top element
  }

  push(element) {
    this.array.push(element); // Add element to the end of the array
    this.topIndex++; // Increment topIndex
    this.length++; // Increase the length of the stack
  }

  pop() {
    if (this.isEmpty()) {
      console.log("Stack Underflow");
      return null; // Return null if stack is empty
    }
    const poppedElement = this.array.pop(); // Remove the last element from the array
    this.topIndex--; // Decrement topIndex
    this.length--; // Decrease the length of the stack
    return poppedElement; // Return the popped element
  }

  peek() {
    if (this.isEmpty()) {
      console.log("Stack is empty");
      return null; // Return null if stack is empty
    }
    return this.array[this.topIndex]; // Return the last element in the array
  }

  size() {
    return this.length; // Return the current length of the stack
  }

  isEmpty() {
    return this.length === 0; // Check if the stack is empty
  }

  display() {
    if (this.isEmpty()) {
      console.log("Stack is empty");
      return;
    }
    console.log(this.array.join(" ")); // Display all elements in the stack
  }
}

const stack = new Stack();
stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
stack.push(50);
stack.push(60);
console.log(stack.size()); // 6
console.log(stack.pop()); // 60
console.log(stack.pop()); // 50
console.log(stack.size()); // 4
stack.display(); // 10 20 30 40
```

```python
class DynamicStack:
    def __init__(self):
        # Using Python built-in list as dynamic stack
        self.stack = []

    def push(self, val):
        self.stack.append(val)

    def pop(self):
        if self.is_empty():
            return None
        return self.stack.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self.stack[-1]

    def is_empty(self):
        return len(self.stack) == 0

    def size(self):
        return len(self.stack)


# Time Complexity: O(1) amortized
# Space Complexity: O(N)
```

### 3. Balanced Parenthesis. **O(N), O(1)**
```
Check whether the given sequence of parentheses is valid or not.
```

```js
// Balanced Parentheses Checker
function isMatchingPair(opening, closing) {
  return (opening === '(' && closing === ')') ||
    (opening === '{' && closing === '}') ||
    (opening === '[' && closing === ']');
}

// Function to check if the parentheses in the expression are balanced
function isBalanced(expression) {
  const stack = []; // Here we use an array to simulate the stack

  for (let char of expression) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char); // Push opening brackets onto the stack
    } else if (char === ')' || char === '}' || char === ']') {
      if (stack.length === 0) return false; // Stack is empty, unbalanced
      const top = stack[stack.length - 1]; // Get the top element of the stack
      if (!isMatchingPair(top, char)) return false; // Check for matching pairs
      stack.pop(); // Pop the top element if it matches
    }
  }

  return stack.length === 0; // If stack is empty, parentheses are balanced
}

console.log(isBalanced("(){}[]")); // true
console.log(isBalanced("([{}])")); // true
console.log(isBalanced("}{[}")); // false
console.log(isBalanced("(][)")); // false

// Time Complexity: O(n), where n is the length of the expression
// Space Complexity: O(n), for the stack used to hold opening brackets


// Alternative Implementation
function isValidParentheses(s) {
    const stack = [];
    const map = {
        ')': '(',
        ']': '[',
        '}': '{'
    };

    for (let char of s) {
        // If it's a closing bracket
        if (map[char]) {
            // Pop the top element (if stack is empty, topElement will be undefined)
            const topElement = stack.pop();

            // Check if the popped element matches the required opener
            if (topElement !== map[char]) {
                return false;
            }
        } else {
            // It's an opening bracket, push it
            stack.push(char);
        }
    }

    // If the stack is empty, all brackets were matched correctly
    return stack.length === 0;
}

console.log(isValidParentheses("()[]{}")); // true
console.log(isValidParentheses("([)]"));   // false
console.log(isValidParentheses("{[]}"));   // true

// Time Complexity: O(n), where n is the length of the string
// Space Complexity: O(n), for the stack used to hold opening brackets
```

```python
def is_balanced_parentheses(s):
    stack = []
    matching = {')': '(', '}': '{', ']': '['}

    for ch in s:
        if ch in "({[":
            stack.append(ch)
        elif ch in matching:
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()

    return len(stack) == 0


print(is_balanced_parentheses("({[]})"))  # True
print(is_balanced_parentheses("([)]"))    # False

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 4. Evaluate Postfix Expression. **O(N), O(1)**
```
Given a postfix expression, evaluate and calculate its value.

Demonstrated how to resolve postfix expressions using a stack to store operands and apply operators in sequence.
```

```js
// Function to calculate the result of two values based on the operator
function evaluate(val1, val2, operator) {
  switch (operator) {
    case '+':
      return val1 + val2; // Addition
    case '-':
      return val1 - val2; // Subtraction
    case '*':
      return val1 * val2; // Multiplication
    case '/':
      return Math.floor(val1 / val2); // Division (using floor for integer division)
    default:
      throw new Error("Invalid operator"); // Handle invalid operators
  }
}

// Function to evaluate a postfix expression
function evaluatePostfix(expression) {
  const stack = []; // Stack to hold operands
  const tokens = expression.split(' '); // Split the expression into tokens

  for (let char of tokens) {
    if (!isNaN(char)) { // Check if the character is a number or an operator
      stack.push(Number(char)); // Push numbers onto the stack
    } else { // If it's an operator
      // Pop the top two elements
      const val2 = stack.pop();
      const val1 = stack.pop();
      let result = evaluate(val1, val2, char); // Evaluate the operation
      stack.push(result); // Push the result back onto the stack
    }
  }

  return stack.pop(); // The final result will be the only element left in the stack
}

console.log(evaluatePostfix("7 3 5 * +")); // 22
console.log(evaluatePostfix("5 2 * 3 -")); // 7
console.log(evaluatePostfix("3 5 + 2 - 2 5 * -")); // -4

// Time Complexity: O(n), where n is the number of tokens in the expression
// Space Complexity: O(n), for the stack used to hold operands
```

```python
def evaluate_postfix(tokens):
    stack = []

    for token in tokens:
        if token in {"+", "-", "*", "/"}:
            val2 = stack.pop()
            val1 = stack.pop()
            if token == "+":
                stack.append(val1 + val2)
            elif token == "-":
                stack.append(val1 - val2)
            elif token == "*":
                stack.append(val1 * val2)
            elif token == "/":
                # Integer division truncating toward zero
                stack.append(int(val1 / val2))
        else:
            stack.append(int(token))

    return stack[0]


print(evaluate_postfix(["2", "1", "+", "3", "*"]))  # 9
print(evaluate_postfix(["4", "13", "5", "/", "+"]))  # 6

# Time Complexity: O(N)
# Space Complexity: O(N)
```
```
Given an array, find the index of the nearest smaller element on the left for all i index in A[].
Formally, for all i, find the largest j < i such that A[j] < A[i]. If no such j exists, return -1.

For each element in an array, find the nearest smaller element on the left
```

```js
function nextSmallerIndexOnLeft(arr) {
    const stack = []; // Stack to hold indices of elements
    const result = []; // Array to hold the result

    stack.push(0); // Push the first index onto the stack
    result.push(-1); // The first element has no smaller element on the left

    for (let i = 1; i < arr.length; i++) {
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        // While the stack is not empty and the top element is greater than or equal to the current element
        while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {
            stack.pop(); // Pop elements from the stack until we find a smaller element
        }
        if (stack.length === 0) {
            result.push(-1); // No smaller element found, push -1
        } else { // The top of the stack is the index of the nearest smaller element
            result.push(stack[stack.length - 1]); // Push the index of the nearest smaller element
        }
        stack.push(i); // Push the current index onto the stack
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        console.log("----------"); // Debug: Separator for clarity
    }

    return result; // Return the result array
}

console.log(nextSmallerIndexOnLeft([10, 16, 5, 9, 12, 8, 25, 7, 13])); // [-1, 0, -1, 2, 3, 2, 5, 2, 7]
console.log(nextSmallerIndexOnLeft([18, 3, 13, 19, 5, 24, 4])); // [-1, -1, 1, 2, 1, 4, 1]
console.log(nextSmallerIndexOnLeft([4, 6, 10, 11, 7, 8, 3, 5])); // [-1, 0, 1, 2, 1, 4, -1, 6]
console.log(nextSmallerIndexOnLeft([4, 5, 2, 10, 8, 2])); // [-1, 0, -1, 2, 2, -1]

// Time Complexity: O(n), where n is the length of the array
// Space Complexity: O(n), for the stack used to hold indices
```

```python
def next_smaller_index_on_left(arr):
    stack = []
    result = []

    for i in range(len(arr)):
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()

        if not stack:
            result.append(-1)
        else:
            result.append(stack[-1])

        stack.append(i)

    return result


print(next_smaller_index_on_left([4, 5, 2, 10, 8]))  # [-1, 0, -1, 2, 2]

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 5. Nearest Smaller Element Index on Left. **O(N), O(1)**
```
Given an array, find the index of the nearest smaller element on the left for all i index in A[].
Formally, for all i, find the largest j < i such that A[j] < A[i]. If no such j exists, return -1.

For each element in an array, find the nearest smaller element on the left
```

```js
function nextSmallerIndexOnLeft(arr) {
    const stack = []; // Stack to hold indices of elements
    const result = []; // Array to hold the result

    stack.push(0); // Push the first index onto the stack
    result.push(-1); // The first element has no smaller element on the left

    for (let i = 1; i < arr.length; i++) {
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        // While the stack is not empty and the top element is greater than or equal to the current element
        while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {
            stack.pop(); // Pop elements from the stack until we find a smaller element
        }
        if (stack.length === 0) {
            result.push(-1); // No smaller element found, push -1
        } else { // The top of the stack is the index of the nearest smaller element
            result.push(stack[stack.length - 1]); // Push the index of the nearest smaller element
        }
        stack.push(i); // Push the current index onto the stack
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        console.log("----------"); // Debug: Separator for clarity
    }

    return result; // Return the result array
}

console.log(nextSmallerIndexOnLeft([10, 16, 5, 9, 12, 8, 25, 7, 13])); // [-1, 0, -1, 2, 3, 2, 5, 2, 7]
console.log(nextSmallerIndexOnLeft([18, 3, 13, 19, 5, 24, 4])); // [-1, -1, 1, 2, 1, 4, 1]
console.log(nextSmallerIndexOnLeft([4, 6, 10, 11, 7, 8, 3, 5])); // [-1, 0, 1, 2, 1, 4, -1, 6]
console.log(nextSmallerIndexOnLeft([4, 5, 2, 10, 8, 2])); // [-1, 0, -1, 2, 2, -1]

// Time Complexity: O(n), where n is the length of the array
// Space Complexity: O(n), for the stack used to hold indices
```

```python
def next_smaller_index_on_left(arr):
    stack = []
    result = []

    for i, val in enumerate(arr):
        while stack and arr[stack[-1]] >= val:
            stack.pop()

        result.append(stack[-1] if stack else -1)
        stack.append(i)

    return result


print(next_smaller_index_on_left([4, 5, 2, 10, 8]))  # [-1, 0, -1, 2, 2]

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 6. Nearest Greater Element Index on Left. **O(N), O(1)**
```
Given an array, find the index of the nearest greater element on the left for all i index in A[].
Formally, for all i, find the largest j < i such that A[j] > A[i]. If no such j exists, return -1.
```

```js
function nextGreaterIndexOnLeft(arr) {
  const stack = []; // Stack to hold indices of elements
  const result = []; // Array to hold the result

  stack.push(0); // Push the first index onto the stack
  result.push(-1); // The first element has no greater element on the left

  for (let i = 1; i < arr.length; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] <= arr[i]) {
      stack.pop(); // Pop elements from the stack until we find a greater element
    }
    if (stack.length === 0) {
      result.push(-1); // No greater element found, push -1
    } else {
      result.push(stack[stack.length - 1]); // Push the index of the nearest greater element
    }
    stack.push(i); // Push the current index onto the stack
  }
  return result; // Return the result array
}

console.log(nextGreaterIndexOnLeft([10, 16, 5, 9, 12, 8, 25, 7, 13])); // [-1, -1, 1, 1, 1, 4, -1, 6, 6]
console.log(nextGreaterIndexOnLeft([18, 3, 13, 19, 5, 24, 4])); // [-1, 0, 0, -1, 3, -1, 5]
console.log(nextGreaterIndexOnLeft([4, 6, 10, 11, 7, 8, 3, 5])); // [-1, -1, -1, -1, 3, 3, 5, 5]
console.log(nextGreaterIndexOnLeft([4, 5, 2, 10, 8, 2])); // [-1, -1, 1, -1, 3, 4]

// Time Complexity: O(n), where n is the length of the array
// Space Complexity: O(n), for the stack used to hold indices
```

```python
def next_greater_index_on_left(arr):
    stack = []
    result = []

    for i, val in enumerate(arr):
        while stack and arr[stack[-1]] <= val:
            stack.pop()

        result.append(stack[-1] if stack else -1)
        stack.append(i)

    return result


print(next_greater_index_on_left([4, 5, 2, 10, 8]))  # [-1, -1, 1, -1, 3]

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 7. Nearest Smaller Element Index on Right. **O(N), O(1)**
```
Given an array, find the index of the nearest smaller element on the right for all i index in A[].
Formally, for all i, find the smallest j > i such that A[j] < A[i]. If no such j exists, return -1.
```

```js
function nextSmallerIndexOnRight(arr) {
    const stack = []; // Stack to hold indices of elements
    const result = new Array(arr.length).fill(-1); // Initialize result array with -1

    for (let i = arr.length - 1; i >= 0; i--) {
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        while (stack.length > 0 && arr[stack[stack.length - 1]] >= arr[i]) {
            stack.pop(); // Pop elements from the stack until we find a smaller element
        }
        if (stack.length > 0) {
            result[i] = stack[stack.length - 1]; // Set the index of the nearest smaller element
        }
        stack.push(i); // Push the current index onto the stack
        console.log(stack, i); // Debug: Print the current state of the stack and current index
        console.log("----------"); // Debug: Separator for clarity
    }
    return result; // Return the result array
}

console.log(nextSmallerIndexOnRight([10, 16, 5, 9, 12, 8, 25, 7, 13])); // [2, 2, -1, 5, 5, 7, 7, -1, -1]
console.log(nextSmallerIndexOnRight([18, 3, 13, 19, 5, 24, 4])); // [1, -1, 4, 4, 6, 6, -1]
console.log(nextSmallerIndexOnRight([4, 6, 10, 11, 7, 8, 3, 5])); // [6, 6, 4, 4, 6, 6, -1, -1]
console.log(nextSmallerIndexOnRight([4, 5, 2, 10, 8, 2])); // [2, 2, -1, 4, 5, -1]

// Time Complexity: O(n), where n is the length of the array
// Space Complexity: O(n), for the stack used to hold indices
```

```python
def next_smaller_index_on_right(arr):
    n = len(arr)
    stack = []
    result = [n] * n

    for i in range(n - 1, -1, -1):
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()

        if stack:
            result[i] = stack[-1]

        stack.append(i)

    return result


print(next_smaller_index_on_right([4, 5, 2, 10, 8]))  # [2, 2, 5, 4, 5]

# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 8. Nearest Greater Element Index on Right. **O(N), O(1)**
```
Given an array, find the index of the nearest greater element on the right for all i index in A[].
Formally, for all i, find the smallest j > i such that A[j] > A[i]. If no such j exists, return -1.
```

```js
function nextGreaterIndexOnRight(arr) {
  const stack = []; // Stack to hold indices of elements
  const result = new Array(arr.length).fill(-1); // Initialize result array with -1

  for (let i = arr.length - 1; i >= 0; i--) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] <= arr[i]) {
      stack.pop(); // Pop elements from the stack until we find a greater element
    }
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1]; // Set the index of the nearest greater element
    }
    stack.push(i); // Push the current index onto the stack
  }
  return result; // Return the result array
}

console.log(nextGreaterIndexOnRight([10, 16, 5, 9, 12, 8, 25, 7, 13])); // [1, 6, 3, 4, 6, 6, -1, 8, -1]
console.log(nextGreaterIndexOnRight([18, 3, 13, 19, 5, 24, 4])); // [3, 2, 3, 5, 5, -1, -1]
console.log(nextGreaterIndexOnRight([4, 6, 10, 11, 7, 8, 3, 5])); // [1, 2, 3, -1, 5, -1, 7, -1]
console.log(nextGreaterIndexOnRight([4, 5, 2, 10, 8, 2])); // [1, 3, 3, -1, -1, -1]

// Time Complexity: O(n), where n is the length of the array
// Space Complexity: O(n), for the stack used to hold indices
```

```python
def next_greater_index_on_right(arr):
    n = len(arr)
    stack = []
    result = [n] * n

    for i in range(n - 1, -1, -1):
        while stack and arr[stack[-1]] <= arr[i]:
            stack.pop()

        if stack:
            result[i] = stack[-1]

        stack.append(i)

    return result


print(next_greater_index_on_right([4, 5, 2, 10, 8]))  # [1, 3, 3, 5, 5]

# Time Complexity: O(N)
# Space Complexity: O(N)
```

## 6. Queues

### 1. Implementation of queue | JavaScript Dynamic Array. **O(N), O(1)**
```
Implent a Queue using JavaScript Array methods.
- Enqueue: Add an element to the end of the array. O(1)
- Dequeue: Remove an element from the front of the array. O(n) because it requires shifting all elements.
- Front: Return the first element of the array without removing it. O(1)
- IsEmpty: Check if the array is empty. O(1)
- Size: Return the length of the array. O(1)
```

```js
// To implement a Queue with O(1) time complexity for enqueue, dequeue, front, isEmpty, and size using JavaScript,
// we can use a circular indexing strategy (also known as a "two-pointer" approach).
// This avoids the O(n) cost of Array.prototype.shift().
class Queue {
  constructor() {
    this.items = []; // Array to hold queue elements
    this.head = 0; // index for front
    this.tail = 0; // index for end
  }

  // Enqueue: O(1)
  enqueue(element) {
    this.items[this.tail] = element;
    this.tail++;
  }

  // Dequeue: O(n) because we need to shift elements
  dequeue() {
    if (this.isEmpty()) return undefined;

    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  // Front: O(1)
  front() {
    return this.isEmpty() ? undefined : this.items[this.head];
  }

  // IsEmpty: O(1)
  isEmpty() {
    return this.size() === 0;
  }

  // Size: O(1)
  size() {
    return this.tail - this.head;
  }
}

const queue = new Queue();
queue.enqueue(1);
queue.enqueue(2);
console.log(queue.size()); // 2
console.log(queue.front()); // 1
console.log(queue.dequeue()); // 1
console.log(queue.front()); // 2
console.log(queue.dequeue()); // 2
console.log(queue.isEmpty()); // true
console.log(queue.size()); // 0
```

```python
from collections import deque


class Queue:
    def __init__(self):
        # Python collections.deque provides O(1) append and popleft
        self.queue = deque()

    def enqueue(self, val):
        self.queue.append(val)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.queue.popleft()

    def peek(self):
        if self.is_empty():
            return None
        return self.queue[0]

    def is_empty(self):
        return len(self.queue) == 0

    def size(self):
        return len(self.queue)


# Time Complexity: O(1) for enqueue and dequeue
# Space Complexity: O(N)
```

### 2. Implementation of queue | Singly Linked List using tail pointer. **O(N), O(1)**
```
Implent a Queue using Singly Linked List.
- Enqueue: Add an element to the end of the array. O(1) because we maintain a tail pointer.
- Dequeue: Remove an element from the front of the array. O(1)
- Front: Return the first element of the array without removing it. O(1)
- IsEmpty: Check if the array is empty. O(1)
- Size: Return the length of the array. O(1)
```

```js
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.head = null;  // Front of the queue
        this.tail = null;  // End of the queue
        this.length = 0;
    }

    // Add an element to the end of the queue - O(1)
    enqueue(data) {
        const newNode = new Node(data);

        if (this.tail === null) {
            // Queue is empty - new node is both head and tail
            // Update the head pointer
            this.head = newNode;
            // Update the tail pointer
            this.tail = newNode;
        } else {
            // Add to the end
            this.tail.next = newNode;
            // Update the tail pointer
            this.tail = newNode;
        }

        this.length++;
        return true;
    }

    // Remove and return element from the front of the queue - O(1)
    dequeue() {
        if (this.isEmpty()) {
            throw new Error("Dequeue from empty queue");
        }

        const data = this.head.data;
        this.head = this.head.next;

        // If queue becomes empty, update tail
        if (this.head === null) {
            this.tail = null;
        }

        this.length--;
        return data;
    }

    // Return the first element without removing it - O(1)
    front() {
        if (this.isEmpty()) {
            throw new Error("Front from empty queue");
        }
        return this.head.data;
    }

    // Check if the queue is empty - O(1)
    isEmpty() {
        return this.head === null;
    }

    // Return the number of elements in the queue - O(1)
    size() {
        return this.length;
    }

    // Display all elements in the queue (for debugging)
    display() {
        if (this.isEmpty()) {
            console.log("Queue is empty");
            return;
        }

        let current = this.head;
        const elements = [];
        while (current) {
            elements.push(current.data);
            current = current.next;
        }
        console.log("Front -> " + elements.join(" -> ") + " -> Rear");
    }
}

const q = new Queue();

console.log("Enqueuing elements: 10, 20, 30, 40");
q.enqueue(10);
q.enqueue(20);
q.enqueue(30);
q.enqueue(40);

console.log(`Queue size: ${q.size()}`); // 4
q.display(); // Front -> 10 -> 20 -> 30 -> 40 -> Rear

console.log(`Front element: ${q.front()}`); // 10

console.log(`Dequeuing: ${q.dequeue()}`); // 10
console.log(`Dequeuing: ${q.dequeue()}`); // 20

console.log(`Queue size after dequeuing: ${q.size()}`); // 2
q.display(); // Front -> 30 -> 40 -> Rear

console.log(`Front element: ${q.front()}`); // 30

console.log(`Is empty? ${q.isEmpty()}`); // false

console.log("Enqueuing 50");
q.enqueue(50);
q.display(); // Front -> 30 -> 40 -> 50 -> Rear

console.log("Dequeuing all elements:");
while (!q.isEmpty()) {
    console.log(`Dequeued: ${q.dequeue()}`); // 30, 40, 50
}

console.log(`Is empty? ${q.isEmpty()}`); // true
console.log(`Queue size: ${q.size()}`); // 0
```

```python
class Node:
    def __init__(self, data=0, next=None):
        self.data = data
        self.next = next


class LinkedListQueue:
    def __init__(self):
        self.head = None
        self.tail = None
        self._size = 0

    def enqueue(self, data):
        new_node = Node(data)
        if not self.tail:
            self.head = self.tail = new_node
        else:
            self.tail.next = new_node
            self.tail = new_node
        self._size += 1

    def dequeue(self):
        if not self.head:
            return None
        val = self.head.data
        self.head = self.head.next
        if not self.head:
            self.tail = None
        self._size -= 1
        return val

    def is_empty(self):
        return self._size == 0


# Time Complexity: O(1) for enqueue and dequeue
# Space Complexity: O(N)
```

### 3. Implementation of queue | Stack (push efficient approach). **O(N), O(1)**
```
Implent a Queue using Stack.
- Enqueue: Add an element to the end of the array. O(1)
- Dequeue: Remove an element from the front of the array. Amortized O(1) OR O(n) because it requires transferring elements from one stack to another.
- Front: Return the first element of the array without removing it. Amortized O(1) OR O(n) because it requires transferring elements from one stack to another.
- IsEmpty: Check if the array is empty. O(1)
- Size: Return the length of the array. O(1)
```

```js
/*
 * ALGORITHM EXPLANATION: Queue using Two Stacks
 *
 * This implementation simulates a First-In-First-Out (FIFO) Queue using two Last-In-First-Out (LIFO) Stacks.
 *
 * 1. Data Structures:
 * - stackIn: Captures all incoming elements (Enqueues).
 * - stackOut: Holds elements ready to be removed (Dequeues).
 *
 * 2. Enqueue Operation:
 * - Simply push the new element onto 'stackIn'.
 * - Time Complexity: O(1).
 *
 * 3. Dequeue / Front Operation:
 * - We need to access the "oldest" element. Stacks only give us the "newest".
 * - Logic:
 * a. Check 'stackOut'. If it has items, pop/peek the top item (this is the oldest).
 * b. If 'stackOut' is empty, we perform a "lazy transfer":
 * - Pop every element from 'stackIn' and push it onto 'stackOut'.
 * - This effectively reverses the order of elements, placing the oldest element
 * at the top of 'stackOut'.
 * - Time Complexity: Amortized O(1). While the transfer is O(n), it happens rarely
 * (only when stackOut is empty), making the average cost constant.
 */

class Queue {
  constructor() {
    this.stackIn = [];  // Main stack for enqueue // Initialize array to act as the input stack
    this.stackOut = []; // Helper stack for dequeue/front // Initialize array to act as the output/processing stack
  }

  // Enqueue: O(1)
  enqueue(value) {
    // Push the new value onto the input stack (Add to the end of the input list)
    this.stackIn.push(value);
  }

  // Dequeue: Amortized O(1) or O(n) in worst case
  dequeue() {
    // Check if the queue is empty before attempting to remove an element
    if (this.isEmpty()) return undefined;

    // If the output stack is empty, we need to refill it from the input stack
    if (this.stackOut.length === 0) {
      // Transfer only when stackOut is empty
      // Loop while there are still elements in the input stack
      while (this.stackIn.length > 0) {
        // Pop from input (LIFO) and push to output.
        // This reverses the order: the first item entered into stackIn becomes the top of stackOut.
        this.stackOut.push(this.stackIn.pop());
      }
    }

    // Remove and return the top element from the output stack (the oldest element in the queue)
    return this.stackOut.pop();
  }

  // Front: Amortized O(1) or O(n) in worst case
  front() {
    // Check if the queue is empty before attempting to access the front element
    if (this.isEmpty()) return undefined;

    // Just like dequeue, if stackOut is empty, we must transfer elements from stackIn
    if (this.stackOut.length === 0) {
      while (this.stackIn.length > 0) {
        // Move elements from input to output to correct the order
        this.stackOut.push(this.stackIn.pop());
      }
    }

    // Return the top element of stackOut without removing it (peek operation)
    return this.stackOut[this.stackOut.length - 1];
  }

  // IsEmpty: O(1)
  isEmpty() {
    // The queue is empty only if BOTH the input and output stacks contain no elements
    return this.stackIn.length === 0 && this.stackOut.length === 0;
  }

  // Size: O(1)
  size() {
    // The total size is the sum of elements waiting in both stacks
    return this.stackIn.length + this.stackOut.length;
  }
}

// Instantiate the Queue
const q = new Queue();

// Add elements to the queue
q.enqueue(10); // stackIn: [10], stackOut: []
q.enqueue(20); // stackIn: [10, 20], stackOut: []
q.enqueue(30); // stackIn: [10, 20, 30], stackOut: []

// Check the front element
console.log(q.front());    // 10
// Explanation: stackOut is empty, so [10, 20, 30] transfers to stackOut becoming [30, 20, 10]. Top is 10.

// Remove the front element
console.log(q.dequeue());  // 10
// Explanation: Pops 10 from stackOut. stackOut is now [30, 20].

// Check the new front element
console.log(q.front());    // 20
// Explanation: stackOut has items, so we just peek the top (20).

// Check the total size
console.log(q.size());     // 2
// Explanation: stackIn has 0 items + stackOut has 2 items = 2.

// Check if empty
console.log(q.isEmpty());  // false
```

```python
class QueueTwoStacksPushEfficient:
    def __init__(self):
        self.s1 = []
        self.s2 = []

    def enqueue(self, x):
        self.s1.append(x)

    def dequeue(self):
        if not self.s2:
            while self.s1:
                self.s2.append(self.s1.pop())
        return self.s2.pop() if self.s2 else None

    def peek(self):
        if not self.s2:
            while self.s1:
                self.s2.append(self.s1.pop())
        return self.s2[-1] if self.s2 else None

    def is_empty(self):
        return not self.s1 and not self.s2


# Time Complexity: O(1) enqueue, O(1) amortized dequeue
# Space Complexity: O(N)
```

### 4. Implementation of queue | Stack (pop efficient approach). **O(N), O(1)**
```
Implent a Queue using Stack.
- Enqueue: Add an element to the end of the array. O(n)
- Dequeue: Remove an element from the front of the array. O(1)
- Front: Return the first element of the array without removing it. O(1)
- IsEmpty: Check if the array is empty. O(1)
- Size: Return the length of the array. O(1)
```

```js
/*
 * ALGORITHM: Queue using Stack (Enqueue-Heavy)
 *
 * 1. Data Structure: A single array (`this.stack`) acts as the main storage.
 * 2. Enqueue Operation (Push):
 * - Create a temporary buffer.
 * - Move ALL elements from main stack to buffer (reverses order).
 * - Push new value to the empty main stack (it becomes the bottom).
 * - Move ALL elements from buffer back to main stack (restores relative order).
 * 3. Dequeue Operation (Pop):
 * - Simply pop the top element. Since we handled the order during enqueue,
 * the top element is guaranteed to be the oldest (FIFO).
 */

class Queue {
  // Initialize the Queue with an empty array to act as the stack
  constructor() {
    this.stack = [];
  }

  // Enqueue: O(n)
  // Adds an item to the queue. Complexity is linear because we move all existing elements.
  enqueue(value) {
    const tempStack = [];

    // Step 1: Reverse the stack
    // We need to clear the main stack to put the new value at the very bottom.
    // We move everything to tempStack.
    while (this.stack.length > 0) {
      tempStack.push(this.stack.pop());
    }

    // Step 2: Add the new element at the bottom
    // Now that this.stack is empty, this value sits at index 0.
    this.stack.push(value);

    // Step 3: Restore the original order
    // We move the previous elements back on top of the new value.
    // This ensures the oldest element remains at the top (end of array).
    while (tempStack.length > 0) {
      this.stack.push(tempStack.pop());
    }
  }

  // Dequeue: O(1)
  // Removes the item from the front of the queue.
  dequeue() {
    // Guard clause: Return undefined if queue is empty to prevent errors
    if (this.isEmpty()) return undefined;

    // Because of the work done in enqueue, the "front" of the queue
    // is actually the top of this stack.
    return this.stack.pop();
  }

  // Front: O(1)
  // Peeks at the item at the front of the queue without removing it.
  front() {
    if (this.isEmpty()) return undefined;
    // The last element in the array represents the top of the stack (the front of the queue)
    return this.stack[this.stack.length - 1];
  }

  // IsEmpty: O(1)
  // Checks if the stack has 0 elements.
  isEmpty() {
    return this.stack.length === 0;
  }

  // Size: O(1)
  // Returns the total number of elements.
  size() {
    return this.stack.length;
  }
}

const q = new Queue();

// Adding elements (Expensive operation: moves existing items back and forth)
q.enqueue(1); // Stack: [1]
q.enqueue(2); // Stack becomes [2, 1] (1 is at top/front)
q.enqueue(3); // Stack becomes [3, 2, 1] (1 is at top/front)

console.log(q.front());    // 1 (The oldest element, which is at the top of the stack)
console.log(q.dequeue());  // 1 (Removes top of stack: [3, 2])
console.log(q.front());    // 2 (The new top of stack)
console.log(q.size());     // 2 (Remaining elements: 3 and 2)
console.log(q.isEmpty());  // false
```

```python
class QueueTwoStacksPopEfficient:
    def __init__(self):
        self.s1 = []
        self.s2 = []

    def enqueue(self, x):
        while self.s1:
            self.s2.append(self.s1.pop())
        self.s1.append(x)
        while self.s2:
            self.s1.append(self.s2.pop())

    def dequeue(self):
        return self.s1.pop() if self.s1 else None

    def peek(self):
        return self.s1[-1] if self.s1 else None

    def is_empty(self):
        return len(self.s1) == 0


# Time Complexity: O(N) enqueue, O(1) dequeue
# Space Complexity: O(N)
```

### 5. Doubly Ended Queue | Doubly Linked List. **O(N), O(1)**
```
A Doubly Ended Queue (Deque) allows insertion and deletion of elements from both ends.
- EnqueueFront: Add an element to the front of the deque. O(1)
- EnqueueRear: Add an element to the rear of the deque. O(1)
- DequeueFront: Remove an element from the front of the deque. O(1)
- DequeueRear: Remove an element from the rear of the deque. O(1)
- Front: Get the front element without removing it. O(1)
- Rear: Get the rear element without removing it. O(1)
- IsEmpty: Check if the deque is empty. O(1)
- Size: Get the number of elements in the deque. O(1)
```

```js
/*
 * ALGORITHM EXPLANATION:
 *
 * Data Structure: Doubly Linked List
 * - Maintains pointers to both the 'head' (first node) and 'tail' (last node).
 * - Allows O(1) time complexity for adding/removing from either end.
 *
 * Operations:
 * 1. enqueueFront(v): Creates a node 'v'. If empty, it becomes head/tail.
 * Otherwise, it becomes the new head, pointing 'next' to the old head.
 *
 * 2. enqueueRear(v): Creates a node 'v'. If empty, it becomes head/tail.
 * Otherwise, it becomes the new tail, pointing 'prev' to the old tail.
 *
 * 3. dequeueFront(): Removes head. The new head is head.next.
 * Clean up pointers (prev of new head becomes null). Handle empty list case.
 *
 * 4. dequeueRear(): Removes tail. The new tail is tail.prev.
 * Clean up pointers (next of new tail becomes null). Handle empty list case.
 */

// Class representing a single unit in the list
class Node {
  constructor(value) {
    this.value = value; // The data stored in the node
    this.next = null;   // Pointer to the next node in the list
    this.prev = null;   // Pointer to the previous node in the list
  }
}

// Class representing the Double Ended Queue
class Deque {
  constructor() {
    this.head = null; // Front: Points to the first element
    this.tail = null; // Rear: Points to the last element
    this.length = 0;  // Tracks the total number of elements
  }

  // Add element to the front: O(1)
  enqueueFront(value) {
    const newNode = new Node(value); // Create the new node to insert

    // If the list is currently empty, the new node is both head and tail
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      // If not empty, link the new node before the current head
      newNode.next = this.head; // New node points forward to old head
      this.head.prev = newNode; // Old head points backward to new node
      this.head = newNode;      // Update head pointer to the new node
    }

    this.length++; // Increment size
  }

  // Add element to the rear: O(1)
  enqueueRear(value) {
    const newNode = new Node(value); // Create the new node to insert

    // If the list is currently empty, the new node is both head and tail
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      // If not empty, link the new node after the current tail
      newNode.prev = this.tail; // New node points backward to old tail
      this.tail.next = newNode; // Old tail points forward to new node
      this.tail = newNode;      // Update tail pointer to the new node
    }

    this.length++; // Increment size
  }

  // Remove element from the front: O(1)
  dequeueFront() {
    // Guard clause: Cannot remove from an empty list
    if (this.isEmpty()) return undefined;

    const value = this.head.value; // Store value to return later
    this.head = this.head.next;    // Move head pointer forward

    // If list is not empty after removal
    if (this.head) {
      this.head.prev = null; // Remove reference to the old removed node
    } else {
      // If list is now empty, tail must also be null
      this.tail = null;
    }

    this.length--; // Decrement size
    return value;  // Return the removed value
  }

  // Remove element from the rear: O(1)
  dequeueRear() {
    // Guard clause: Cannot remove from an empty list
    if (this.isEmpty()) return undefined;

    const value = this.tail.value; // Store value to return later
    this.tail = this.tail.prev;    // Move tail pointer backward

    // If list is not empty after removal
    if (this.tail) {
      this.tail.next = null; // Remove reference to the old removed node
    } else {
      // If list is now empty, head must also be null
      this.head = null;
    }

    this.length--; // Decrement size
    return value;  // Return the removed value
  }

  // Get front element: O(1)
  front() {
    // Return value if exists, otherwise undefined
    return this.isEmpty() ? undefined : this.head.value;
  }

  // Get rear element: O(1)
  rear() {
    // Return value if exists, otherwise undefined
    return this.isEmpty() ? undefined : this.tail.value;
  }

  // Check if empty: O(1)
  isEmpty() {
    return this.length === 0; // Returns true if length is 0
  }

  // Get size: O(1)
  size() {
    return this.length; // Returns current count of nodes
  }
}

const dq = new Deque();
dq.enqueueRear(10); // List: 10
dq.enqueueFront(5); // List: 5 <-> 10
dq.enqueueRear(15); // List: 5 <-> 10 <-> 15

console.log(dq.front());    // 5
console.log(dq.rear());     // 15
console.log(dq.dequeueFront()); // 5 (List becomes 10 <-> 15)
console.log(dq.dequeueRear());  // 15 (List becomes 10)
console.log(dq.size());     // 1
console.log(dq.isEmpty());  // false
```

```python
from collections import deque

# Python built-in deque supports O(1) appends and pops from both sides:
# append(x), appendleft(x), pop(), popleft()
dq = deque()
dq.append(1)
dq.append(2)
dq.appendleft(0)
print(dq)          # deque([0, 1, 2])
print(dq.popleft())# 0
print(dq.pop())    # 2

# Time Complexity: O(1) for all operations
# Space Complexity: O(N)
```

### 6. Sliding Window Maximum | Sliding Window Technique & Double Ended Queue (Deque). **O(N), O(1)**
```
Given an array of integers and a window size, find the maximum element in each sliding window of the given size.
Implement the solution using Sliding Window technique with a Double Ended Queue (Deque) to achieve O(n) time complexity.
```

```js
/*
 * ALGORITHM: SLIDING WINDOW MAXIMUM (MONOTONIC QUEUE)
 *
 * 1. Data Structure: Uses a Deque (implemented via Doubly Linked List) to store *indices* of array elements.
 * 2. Invariant: The Deque maintains indices in a specific order such that:
 * a. The indices are sorted increasing (chronological order).
 * b. The actual values at those indices (inputArray[i]) are sorted strictly decreasing.
 * 3. Logic:
 * - For every element 'windowEnd' in the array:
 * - Remove elements from the BACK of the Deque that are smaller than inputArray[windowEnd].
 * (Why? Because inputArray[windowEnd] is larger and newer; the smaller elements are useless now).
 * - Add 'windowEnd' to the BACK.
 * - Remove elements from the FRONT if they are out of the current window range [windowStart, windowEnd].
 * - The FRONT of the Deque is now the maximum for this window.
 */

// Node class for doubly linked list
// Represents a single element in the Deque containing a value and pointers to neighbors.
class Node {
    constructor(value) {
        this.value = value; // Stores the index of the array element
        this.prev = null;   // Pointer to the previous node
        this.next = null;   // Pointer to the next node
    }
}

// Deque implementation using doubly linked list
// Allows O(1) insertion and deletion from both ends, which is critical for the O(N) total time complexity.
class Deque {
    constructor() {
        this.head = null;   // Front of the deque
        this.tail = null;   // Back of the deque
        this.length = 0;    // Tracks number of elements
    }

    addLast(value) {
        const newNode = new Node(value);

        // If empty, new node is both head and tail
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            // Link current tail to new node and update tail
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }

        this.length++;
    }

    addFirst(value) {
        const newNode = new Node(value);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            // Link new node to current head and update head
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }

        this.length++;
    }

    removeLast() {
        if (this.isEmpty()) return null;

        const value = this.tail.value;

        // Handle case with only one element
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            // Move tail pointer back and sever connection
            this.tail = this.tail.prev;
            this.tail.next = null;
        }

        this.length--;
        return value;
    }

    removeFirst() {
        if (this.isEmpty()) return null;

        const value = this.head.value;

        // Handle case with only one element
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            // Move head pointer forward and sever connection
            this.head = this.head.next;
            this.head.prev = null;
        }

        this.length--;
        return value;
    }

    // Returns value at the front without removing it (Peek operation)
    getFirst() {
        if (this.isEmpty()) return null;
        return this.head.value;
    }

    // Returns value at the back without removing it
    getLast() {
        if (this.isEmpty()) return null;
        return this.tail.value;
    }

    size() {
        return this.length;
    }

    isEmpty() {
        return this.length === 0;
    }
}

// Sliding Window Maximum function
// inputArray: input array of numbers
// windowSize: size of the sliding window
function slidingWindowMax(inputArray, windowSize) {
    const indexDeque = new Deque(); // Initialize our custom Deque

    // Prepare first window
    // Process the first 'windowSize' elements to set up the initial state of the Deque
    for (let currentIndex = 0; currentIndex < windowSize; currentIndex++) {
        // Remove elements from rear while current element is greater
        // This enforces the monotonic decreasing property.
        // If inputArray[currentIndex] > inputArray[back], the back element can never be a max again.
        while (indexDeque.size() > 0 && inputArray[indexDeque.getLast()] < inputArray[currentIndex]) {
            indexDeque.removeLast();
        }
        indexDeque.addLast(currentIndex); // Add current index
    }

    // Prepare windowStart, windowEnd variables and iterate on rest of the window
    // 'windowStart' is the start of the current window, 'windowEnd' is the next element to process
    let windowStart = 1;
    let windowEnd = windowSize;

    const maxValues = []; // Array to store maximums

    while (windowEnd < inputArray.length) {
        // Store answer for previous window
        // The element at indexDeque.getFirst() is the index of the max value for the window ending at windowEnd-1
        maxValues.push(inputArray[indexDeque.getFirst()]);

        // Remove elements outside current window
        // 'windowStart' has moved forward, so if the max index is less than 'windowStart', it is no longer valid
        while (indexDeque.size() > 0 && indexDeque.getFirst() < windowStart) {
            indexDeque.removeFirst();
        }

        // Add new element to deque
        // Similar to the initialization loop: maintain decreasing order by popping from back
        while (indexDeque.size() > 0 && inputArray[indexDeque.getLast()] < inputArray[windowEnd]) {
            indexDeque.removeLast();
        }
        indexDeque.addLast(windowEnd);

        // Update inputArray[windowStart-1] (element going out of window)
        // Note: The loop `indexDeque.getFirst() < windowStart` above generally handles this cleanup.
        // This check specifically looks for the case where the outgoing element was the maximum.
        if (indexDeque.getFirst() === windowStart - 1) {
            indexDeque.removeFirst();
        }

        // Shift window - Time Complexity: O(n), Space Complexity: O(n)
        windowStart++;
        windowEnd++;
    }

    // Add the last window
    // The loop terminates before adding the max of the final window configuration
    maxValues.push(inputArray[indexDeque.getFirst()]);

    return maxValues;
}

const inputArray = [1, 3, -1, -3, 5, 3, 6, 7];
const windowSize = 3;

const result = slidingWindowMax(inputArray, windowSize);

console.log("Input array:", inputArray);
console.log("Window size:", windowSize);
console.log("Sliding window maximums:", result); // [3, 3, 5, 5, 6, 7]

/*
 * COMPLEXITY ANALYSIS
 *
 * Time Complexity: O(N)
 * - Each element is added to the Deque exactly once via addLast.
 * - Each element is removed from the Deque at most once via removeFirst or removeLast.
 * - All Deque operations are O(1).
 * - Therefore, the total operations are proportional to N.
 *
 * Space Complexity: O(K)
 * - The Deque stores indices of elements in the current window.
 * - In the worst case (a sorted decreasing array), the Deque will store all 'windowSize' indices of the window.
 * - The output array 'maxValues' takes O(N - windowSize + 1) space, but auxiliary space is dominated by the Deque.
 */
```

```python
from collections import deque


def max_sliding_window(nums, k):
    dq = deque()  # stores indices
    result = []

    for i, val in enumerate(nums):
        # Remove indices that fall outside the current window
        while dq and dq[0] < i - k + 1:
            dq.popleft()

        # Remove elements smaller than current element from back
        while dq and nums[dq[-1]] <= val:
            dq.pop()

        dq.append(i)

        # Append to result once first window is complete
        if i >= k - 1:
            result.append(nums[dq[0]])

    return result


print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3, 3, 5, 5, 6, 7]

# Time Complexity: O(N)
# Space Complexity: O(K)
```

```js
// Alternate implementation of Sliding Window Maximum using Monotonic Deque
/*
 * ALGORITHM EXPLANATION:
 * ----------------------
 * This function solves the "Sliding Window Maximum" problem using a Monotonic Decreasing Deque.
 *
 * 1. Concept:
 * - A "deque" (double-ended queue) is used to store indices of the array elements.
 * - The deque is maintained in a strictly "monotonic decreasing" order based on the values
 * at those indices. This means nums[deque[0]] is always the largest value in the current
 * window, nums[deque[1]] is the second largest, and so on.
 *
 * 2. Steps for each element at index 'i':
 * a. Clean up (Front): Remove indices from the front of the deque if they are outside
 * the current window range [i - k + 1, i]. This ensures we only consider valid elements.
 * b. Maintain Monotony (Back): Before adding the current index 'i', remove indices from
 * the back of the deque if their corresponding values are less than or equal to the
 * current value (nums[i]). Why? Because the current value is larger and occurs later,
 * so the smaller previous values will never be the maximum again.
 * c. Add Current: Push the current index 'i' to the back of the deque.
 * d. Record Result: Once the first window is fully formed (i >= k - 1), the element
 * at the front of the deque (deque[0]) is the maximum for the current window.
 *
 * 3. Complexity:
 * - Time: O(N). Each element is pushed once and popped at most once.
 * - Space: O(K). In the worst case, the deque stores K elements.
 */


/**
 * Finds the maximum of each sliding window using a Monotonic Deque.
 * * Time:  O(N) - Each element is added and removed from the deque at most once.
 * Space: O(K) - The deque stores at most K indices (in the worst case of sorted descending array).
 */
function maxSlidingWindowDeque(nums, k) {
    // Initialize an array to store the maximums for each window.
    const result = [];

    // Initialize the deque (double-ended queue).
    // This will store indices, not values.
    // Storing indices allows us to easily check if an element is out of the current window.
    const deque = [];

    // Iterate through every element in the input array 'nums'.
    for (let i = 0; i < nums.length; i++) {
        // 1. Remove indices that are out of the current window from the front.
        // The window is [i - k + 1, i]. Any index <= i - k is invalid.
        // If the index at the front of the deque is too old, remove it.
        if (deque.length > 0 && deque[0] <= i - k) {
            deque.shift(); // Remove from front
        }

        // 2. Maintain the monotonic property (decreasing order of values).
        // Remove indices from the back if the value at that index is smaller than
        // or equal to the current element. They are no longer useful.
        // Explanation: If nums[i] >= nums[back], then nums[back] can never be the max
        // because nums[i] is larger and will stay in the window longer.
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop(); // Remove from back
        }

        // 3. Add the current element's index to the deque
        // After the while loop above, the deque is strictly decreasing.
        deque.push(i);

        // 4. Add the maximum to the result.
        // The first window completes when i reaches k - 1.
        // Before this point, the window is still growing.
        // The front of the deque always holds the index of the maximum element.
        if (i >= k - 1) {
            // deque[0] is the index of the max value for the current window [i-k+1, i]
            result.push(nums[deque[0]]);
        }
    }

    // Return the array containing the maximums for all sliding windows.
    return result;
}

// Execute the function and log the output
console.log(maxSlidingWindowDeque([1, 3, -1, -3, 5, 3, 6, 7], 3)); // [3, 3, 5, 5, 6, 7]

// Time Complexity: O(N)
// Space Complexity: O(K)
```

```python
from collections import deque


def sliding_window_max(A, B):
    dq = deque()
    res = []

    for i in range(len(A)):
        if dq and dq[0] <= i - B:
            dq.popleft()

        while dq and A[dq[-1]] <= A[i]:
            dq.pop()

        dq.append(i)

        if i >= B - 1:
            res.append(A[dq[0]])

    return res


print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3, 3, 5, 5, 6, 7]

# Time Complexity: O(N)
# Space Complexity: O(B)
```

### 7. Parking Ice Cream Truck | Sliding Window Maximum Problem. **O(N), O(B)**
```
Imagine you're an ice cream truck driver in a beachside town. The beach is divided into several sections, and each section has varying numbers of beachgoers wanting ice cream given by the array of integers A.

For simplicity, let's say the beach is divided into 8 sections. One day, you note down the number of potential customers in each section: [5, 12, 3, 4, 8, 10, 2, 7]. This means there are 5 people in the first section, 12 in the second, and so on.

You can only stop your truck in B consecutive sections at a time because of parking restrictions. To maximize sales, you want to park where the most customers are clustered together.

For all B consecutive sections, identify the busiest stretch to park your ice cream truck and serve the most customers. Return an array C, where C[i] is the busiest section in each of the B consecutive sections. Refer to the given example for clarity.

NOTE: If B > length of the array, return 1 element with the max of the array.
```

```js
/**
 * Given an array A of potential customers in each beach section,
 * and a window size B (number of consecutive sections you can park in),
 * this function returns an array C where C[i] is the maximum number
 * of customers in any subarray A[i..i+B-1].
 *
 * If B > A.length, the result is a single-element array containing
 * the maximum of the entire array.
 *
 * Time Complexity: O(n) — each index is added and removed from the deque at most once.
 * Space Complexity: O(B) for the deque + O(n−B+1) for the result.
 *
 * @param {number[]} A - Array of integers representing customers per section.
 * @param {number} B   - Number of consecutive sections you can park in.
 * @return {number[]}  - Array of busiest (maximum) customer counts per window.
 */
function maxSlidingWindow(A, B) {
  const n = A.length;

  // Edge case: if B is larger than the array length, return the max of the entire array.
  if (B >= n) {
    let overallMax = A[0];
    for (let i = 1; i < n; i++) {
      if (A[i] > overallMax) overallMax = A[i];
    }
    return [overallMax];
  }

  const result = [];    // Will hold the max of each window
  const dq = [];        // Deque to store indices; A[dq[0]] is the current window’s max

  // 1. Initialize the deque for the first window (indices 0..B-1)
  for (let i = 0; i < B; i++) {
    // Remove from back while A[i] is greater or equal—those smaller/equal can’t be max.
    while (dq.length > 0 && A[dq[dq.length - 1]] <= A[i]) {
      dq.pop();
    }
    dq.push(i);
  }

  // 2. Slide the window from i = B to i = n−1
  for (let i = B; i < n; i++) {
    // (a) The front of deque holds the index of the max for the previous window
    result.push(A[dq[0]]);

    // (b) Remove indices from back while current element ≥ A[dq.back]
    while (dq.length > 0 && A[dq[dq.length - 1]] <= A[i]) {
      dq.pop();
    }

    // (c) Add current index i to the back
    dq.push(i);

    // (d) Remove the front index if it’s out of the current window (i−B)
    if (dq[0] <= i - B) {
      dq.shift();
    }
  }

  // 3. Append the maximum for the final window (ending at index n−1)
  result.push(A[dq[0]]);

  return result;
}

const A1 = [1, 3, -1, -3, 5, 3, 6, 7];
const B1 = 3;
console.log(maxSlidingWindow(A1, B1)); // [3, 3, 5, 5, 6, 7]

const A2 = [1, 2, 3, 4, 2, 7, 1, 3, 6];
const B2 = 6;
console.log(maxSlidingWindow(A2, B2)); // [7, 7, 7, 7]

// Time Complexity: O(n)
// Space Complexity: O(B)
```

```python
from collections import deque


def parking_ice_cream_truck(A, B):
    # Same as Sliding Window Maximum
    dq = deque()
    ans = []

    for i in range(len(A)):
        if dq and dq[0] <= i - B:
            dq.popleft()

        while dq and A[dq[-1]] <= A[i]:
            dq.pop()

        dq.append(i)

        if i >= B - 1:
            ans.append(A[dq[0]])

    return ans


print(parking_ice_cream_truck([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3, 3, 5, 5, 6, 7]

# Time Complexity: O(N)
# Space Complexity: O(B)
```

## 7. Trees 1: Structure & Traversal

### 1. Pre-order traversal **O(N), O(1)**
Pre-order traversal is a depth-first traversal method where the nodes are visited in the following order:
Node -> Left Subtree -> Right Subtree

```js
function preOrderTraversal(node) {
    if (node === null) return;
    console.log(node.data); // Visit the node
    preOrderTraversal(node.left); // Traverse left subtree
    preOrderTraversal(node.right); // Traverse right subtree
}

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

// 1 2 4 5 3 6 7
```

```python
def pre_order_traversal(root):
    if root is None:
        return
    print(root.data, end=" ")
    pre_order_traversal(root.left)
    pre_order_traversal(root.right)


# Time Complexity: O(N)
# Space Complexity: O(H) where H is tree height
```

### 2. In-order traversal **O(N), O(1)**
In-order traversal is a depth-first traversal method where the nodes are visited in the following order:
Left Subtree -> Node -> Right Subtree

```js
function inOrderTraversal(node) {
    if (node === null) return;
    inOrderTraversal(node.left); // Traverse left subtree
    console.log(node.data); // Visit the node
    inOrderTraversal(node.right); // Traverse right subtree
}

const root = {
    data: 1,
    left: {
        data: 2,
        left: { data: 4, left: null, right: null },
        right: { data: 5, left: null, right: null }
    },
    right: {
        data: 3,
        left: { data: 6, left: null, right: null },
        right: { data: 7, left: null, right: null }
    }
};

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

inOrderTraversal(root); // 4 2 5 1 6 3 7
```

```python
def in_order_traversal(root):
    if root is None:
        return
    in_order_traversal(root.left)
    print(root.data, end=" ")
    in_order_traversal(root.right)


# Time Complexity: O(N)
# Space Complexity: O(H)
```

### 3. Post-order traversal **O(N), O(1)**
Post-order traversal is a depth-first traversal method where the nodes are visited in the following order:
Left Subtree -> Right Subtree -> Node

```js
function postOrderTraversal(node) {
    if (node === null) return;
    postOrderTraversal(node.left); // Traverse left subtree
    postOrderTraversal(node.right); // Traverse right subtree
    console.log(node.data); // Visit the node
}

const root = {
    data: 1,
    left: {
        data: 2,
        left: { data: 4, left: null, right: null },
        right: { data: 5, left: null, right: null }
    },
    right: {
        data: 3,
        left: { data: 6, left: null, right: null },
        right: { data: 7, left: null, right: null }
    }
};

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

postOrderTraversal(root); // 4 5 2 6 7 3 1
```

```python
def post_order_traversal(root):
    if root is None:
        return
    post_order_traversal(root.left)
    post_order_traversal(root.right)
    print(root.data, end=" ")


# Time Complexity: O(N)
# Space Complexity: O(H)
```

### 4. Iterative in-order traversal | Stack **O(N), O(1)**
```
Iterative in-order traversal can be implemented using a stack to keep track of nodes.
We are going to use a stack to simulate the recursive behavior of in-order traversal.
Step 1: First push the root node to the stack.
Then repeat the following steps until the stack is empty:
State 0: Pre Area: Increase the state and add the left child to the stack if it exists.
State 1: In Area: Print the data, increase the state, add the right child to the stack if it exists.
State 2: Post Area: Simply pop the node from the stack.
```

```js
class Node {
  constructor(data) {
    this.data = data;    // The value of the node
    this.left = null;    // Pointer to the left child
    this.right = null;   // Pointer to the right child
  }
}

class Pair {
  constructor(node, state) {
    this.node = node;    // The current node
    this.state = state;  // 0 = “go to left”, 1 = “visit”, 2 = “go to right/finish”
  }
}

function iterativeInOrderTraversal(root) {
  if (root === null) return;

  const stack = [];
  // Start by pushing the root with state = 0 (i.e. we haven’t visited its left subtree yet)
  stack.push(new Pair(root, 0));

  while (stack.length > 0) {
    const top = stack[stack.length - 1];

    if (top.state === 0) {
      // state 0: “go down to left subtree if it exists”
      if (top.node.left !== null) {
        // push the left child with state = 0
        stack.push(new Pair(top.node.left, 0));
      }
      // mark this node as “next, we should visit it” (state = 1)
      top.state = 1;

    } else if (top.state === 1) {
      // state 1: “we are now visiting the node itself”
      process.stdout.write(top.node.data + " "); // Print the node's data

      // after printing, if there’s a right child, push it to the stack (to traverse its subtree)
      if (top.node.right !== null) {
        stack.push(new Pair(top.node.right, 0));
      }
      // mark this node as “completely done” (state = 2)
      top.state = 2;

    } else {
      // state 2: “we have visited left, printed this node, and visited right”
      // so we can pop it off and go back up
      stack.pop();
    }
  }

  // The traversal is complete, and all nodes have been printed in in-order
  console.log(); // Print a newline at the end
}

const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.left = new Node(6);
root.right.right = new Node(7);

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

iterativeInOrderTraversal(root); // 4 2 5 1 6 3 7

// Time Complexity: O(n)
// Space Complexity: O(n) for the stack
```

```python
def iterative_in_order(root):
    stack = []
    curr = root
    result = []

    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left

        curr = stack.pop()
        result.append(curr.data)
        curr = curr.right

    return result


# Time Complexity: O(N)
# Space Complexity: O(H)
```

### 5. Iterative level-order traversal | Deque **O(N), O(1)**
```
Level order traversal is a breadth-first traversal method where the nodes are visited level by level from left to right. It can be implemented using a queue.
Step 1: Start by pushing the root node to the queue.
Then repeat the following steps until the queue is empty:
1. Dequeue a node from the front of the queue.
2. Print the data of the dequeued node.
3. Enqueue the children of the dequeued node (left child first, then right child).
```

```js
class Node {
    constructor(data) {
        this.data = data;    // The value of the node
        this.left = null;    // Pointer to the left child
        this.right = null;   // Pointer to the right child
    }
}

function levelOrderTraversal(root) {
    if (root === null) return;

    const queue = [];
    queue.push(root);

    while (queue.length > 0) {
        const levelSize = queue.length; // Get the number of nodes at the current level
        for (let i = 0; i < levelSize; i++) {
            // Step 1: dequeue the next node
            const node = queue.shift(); // Dequeue the front node

            // Step 2: process the node
            process.stdout.write(node.data + " "); // Print the node's data

            // Step 3: enqueue children for the next level
            // Enqueue the left child if it exists
            if (node.left) queue.push(node.left);
            // Enqueue the right child if it exists
            if (node.right) queue.push(node.right);
        }
    }

    console.log(); // Print a newline after each level
}

// The traversal is complete, and all nodes have been printed level by level
console.log(); // Print a newline at the end

const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.left = new Node(6);
root.right.right = new Node(7);

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

levelOrderTraversal(root); // 1 2 3 4 5 6 7

// Time Complexity: O(n)
// Space Complexity: O(n) for the queue
```

```python
from collections import deque


def level_order_traversal(root):
    if not root:
        return []

    queue = deque([root])
    result = []

    while queue:
        level_size = len(queue)
        current_level = []

        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.data)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

        result.append(current_level)

    return result


# Time Complexity: O(N)
# Space Complexity: O(N)
```

### 6. Left view and right view of a binary tree | Deque **O(N), O(1)**
```
Left view of a binary tree is the set of nodes visible when the tree is viewed from the left side.
Right view is similar but viewed from the right side. We can use level order traversal to achieve this.
Left view can be obtained by printing the first node of each level during level order traversal.
Right view can be obtained by printing the last node of each level.
```

```js
class Node {
  constructor(data) {
    this.data = data;    // The value of the node
    this.left = null;    // Pointer to the left child
    this.right = null;   // Pointer to the right child
  }
}

function leftRightView(root) {
  if (root === null) return;

  const queue = [];
  queue.push(root);
  let leftView = [];
  let rightView = [];

  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift(); // Dequeue the front node

      // For left view, add the first node of each level
      if (i === 0) {
        leftView.push(node.data);
      }

      // For right view, add the last node of each level
      if (i === levelSize - 1) {
        rightView.push(node.data);
      }

      // Enqueue the left child if it exists
      if (node.left !== null) {
        queue.push(node.left);
      }

      // Enqueue the right child if it exists
      if (node.right !== null) {
        queue.push(node.right);
      }
    }
  }

  console.log("Left View:", leftView.join(" "));
  console.log("Right View:", rightView.join(" "));
}

const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.left = new Node(6);
root.right.right = new Node(7);

//     1
//    / \
//   2   3
//  / \  / \
// 4  5 6   7

leftRightView(root);
// Left View: 1 2 4
// Right View: 1 3 7

// Time Complexity: O(n)
// Space Complexity: O(n) for the queue
```

```python
from collections import deque


def left_and_right_view(root):
    if not root:
        return {"left": [], "right": []}

    queue = deque([root])
    left_view = []
    right_view = []

    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == 0:
                left_view.append(node.data)
            if i == level_size - 1:
                right_view.append(node.data)

            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

    return {"left": left_view, "right": right_view}


# Time Complexity: O(N)
# Space Complexity: O(N)
```

## 8. Trees 2: BST

### 1. Searching in Binary Search Tree **O(N), O(1)**
```
Given Root of a BST and a value K, return true if the value is present in the BST, otherwise return false.
       4
      / \
     2   7
    / \
   1   3
```

```js
// Iterative approach to search in BST

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function searchInBST(root, k) {
  while (root !== null) {
    if (root.val === k) {
      return true; // Value found
    } else if (k < root.val) {
      root = root.left; // Search in left subtree
    } else {
      root = root.right; // Search in right subtree
    }
  }

  return false; // Value not found
}

const root = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3

console.log(searchInBST(root, 2)); // true
console.log(searchInBST(root, 5)); // false

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(1) for iterative approach
```

```python
def search_bst_iterative(root, val):
    curr = root
    while curr:
        if curr.data == val:
            return True
        elif val < curr.data:
            curr = curr.left
        else:
            curr = curr.right
    return False


# Time Complexity: O(H) where H is tree height
# Space Complexity: O(1)
```

```js
// Recursive approach to search in BST
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function searchInBSTRecursive(root, k) {
  if (root === null) {
    return false; // Base case: value not found
  }

  if (root.val === k) {
    return true; // Value found
  } else if (k < root.val) {
    return searchInBSTRecursive(root.left, k); // Search in left subtree
  } else {
    return searchInBSTRecursive(root.right, k); // Search in right subtree
  }
}

const rootRecursive = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
console.log(searchInBSTRecursive(rootRecursive, 2)); // true
console.log(searchInBSTRecursive(rootRecursive, 5)); // false
```

```python
def search_bst_recursive(root, val):
    if root is None:
        return False
    if root.data == val:
        return True
    elif val < root.data:
        return search_bst_recursive(root.left, val)
    else:
        return search_bst_recursive(root.right, val)


# Time Complexity: O(H)
# Space Complexity: O(H) recursion stack
```

### 2. Insertion in Binary Search Tree **O(N), O(1)**
```
Given Root of a BST and a value K, insert the value K into the BST and return the root of the modified BST.
```

```js
// Recursive approach to insert into BST

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function insertIntoBST(root, k) {
    if (root === null) {
        return new TreeNode(k); // Create a new node if the tree is empty
    }

    if (k <= root.val) {
        root.left = insertIntoBST(root.left, k); // Insert in left subtree
    } else {
        root.right = insertIntoBST(root.right, k); // Insert in right subtree
    }

    return root; // Return the unchanged root
}

const rootInsert = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3

console.log(JSON.stringify(insertIntoBST(rootInsert, 5))); // BST with 5 inserted
//      4
//     / \
//    2   7
//   / \  /
//  1   3 5

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(h) for recursive stack space
```

```python
class TreeNode:
    def __init__(self, data=0):
        self.data = data
        self.left = None
        self.right = None


def insert_bst_recursive(root, val):
    if root is None:
        return TreeNode(val)

    if val < root.data:
        root.left = insert_bst_recursive(root.left, val)
    elif val > root.data:
        root.right = insert_bst_recursive(root.right, val)

    return root


# Time Complexity: O(H)
# Space Complexity: O(H)
```

```js
// Iterative approach to insert into BST

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function insertIntoBSTIterative(root, k) {
    const newNode = new TreeNode(k);

    // Edge case: If the tree is empty, the new node becomes the root
    if (root === null) {
        return newNode;
    }

    let current = root;
    while (true) {
        if (k <= current.val) {
            // Go Left
            if (current.left === null) {
                current.left = newNode; // Found the spot
                break; // Exit the loop
            }
            current = current.left; // Keep going down
        } else {
            // Go Right
            if (current.right === null) {
                current.right = newNode; // Found the spot
                break; // Exit the loop
            }
            current = current.right; // Keep going down
        }
    }

    return root;
}

const rootInsert = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3

insertIntoBSTIterative(rootInsert, 5);
console.log(JSON.stringify(rootInsert));
//      4
//     / \
//    2   7
//   / \ /
//  1  3 5

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(1) for iterative approach
```

```python
def insert_bst_iterative(root, val):
    new_node = TreeNode(val)
    if root is None:
        return new_node

    curr = root
    parent = None

    while curr:
        parent = curr
        if val < curr.data:
            curr = curr.left
        elif val > curr.data:
            curr = curr.right
        else:
            return root  # Value already exists

    if val < parent.data:
        parent.left = new_node
    else:
        parent.right = new_node

    return root


# Time Complexity: O(H)
# Space Complexity: O(1)
```

### 3. Find Smallest in Binary Search Tree **O(N), O(1)**
```
Given the root of a BST, find the smallest value in the BST.
Smallest value is the leftmost node in the BST.
- Either it will be the leaf node
- Or it will have a single right child.
```

```js
// Iterative approach to find the smallest value in BST

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function findSmallestInBST(root) {
    if (root === null) {
        return null; // Tree is empty
    }

    while (root.left !== null) {
        root = root.left; // Traverse to the leftmost node
    }

    return root.val; // Return the smallest value
}

const rootSmallest = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3
console.log(findSmallestInBST(rootSmallest)); // 1

const rootSmallest2 = new TreeNode(4, null, new TreeNode(7));
//       4
//        \
//         7
console.log(findSmallestInBST(rootSmallest2)); // 4

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(1) for iterative approach
```

```python
def find_smallest_iterative(root):
    if not root:
        return None
    curr = root
    while curr.left:
        curr = curr.left
    return curr.data


# Time Complexity: O(H)
# Space Complexity: O(1)
```

```js
// Recursive approach to find the smallest value in BST

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function findSmallestInBSTRecursive(root) {
    // Base Case 1: Empty tree
    if (root === null) {
        return null;
    }

    // Base Case 2: If there is no left child, we have found the smallest value (current node)
    if (root.left === null) {
        return root.val;
    }

    // Recursive Step: The smallest value must be in the left subtree
    return findSmallestInBSTRecursive(root.left);
}

const rootSmallest = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3
console.log(findSmallestInBSTRecursive(rootSmallest)); // 1

const rootSmallest2 = new TreeNode(4, null, new TreeNode(7));
//       4
//        \
//         7
console.log(findSmallestInBSTRecursive(rootSmallest2)); // 4

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(h) due to the recursion stack
```

```python
def find_smallest_recursive(root):
    if not root:
        return None
    if not root.left:
        return root.data
    return find_smallest_recursive(root.left)


# Time Complexity: O(H)
# Space Complexity: O(H)
```

### 4. Find Largest in Binary Search Tree **O(N), O(1)**
```
Given the root of a BST, find the largest value in the BST.
Largest value is the rightmost node in the BST.
- Either it will be the leaf node
- Or it will have a single left child.
```

```js
// Iterative approach to find the largest value in BST

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function findLargestInBST(root) {
  if (root === null) {
    return null; // Tree is empty
  }

  while (root.right !== null) {
    root = root.right; // Traverse to the rightmost node
  }

  return root.val; // Return the largest value
}

const rootLargest = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3
console.log(findLargestInBST(rootLargest)); // 7

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(1) for iterative approach
```

```python
def find_largest_iterative(root):
    if not root:
        return None
    curr = root
    while curr.right:
        curr = curr.right
    return curr.data


# Time Complexity: O(H)
# Space Complexity: O(1)
```

```js
// Recursive approach to find the largest value in BST

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function findLargestInBSTRecursive(root) {
  // Base Case 1: Empty tree
  if (root === null) {
    return null;
  }

  // Base Case 2: If there is no right child, we found the largest value
  if (root.right === null) {
    return root.val;
  }

  // Recursive Step: The largest value must be in the right subtree
  return findLargestInBSTRecursive(root.right);
}

const rootLargest = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
//      4
//     / \
//    2   7
//   / \
//  1   3

console.log(findLargestInBSTRecursive(rootLargest)); // 7

// Time Complexity: O(h) where h is the height of the tree
// Space Complexity: O(h) due to the recursion stack
```

```python
def find_largest_recursive(root):
    if not root:
        return None
    if not root.right:
        return root.data
    return find_largest_recursive(root.right)


# Time Complexity: O(H)
# Space Complexity: O(H)
```

### 5. Deletion in Binary Search Tree **O(N), O(1)**
```
Given the root of a BST and a value K, delete the node with value K from the BST and return the root of the modified BST.

Approach 1: (with max value in left subtree)
1. Find the max value in the left subtree of the node to be deleted.
2. Replace the value of the node to be deleted with the max value.
3. Delete the max value node from the left subtree.

Approach 2: (with min value in right subtree)
1. Find the min value in the right subtree of the node to be deleted.
2. Replace the value of the node to be deleted with the min value.
3. Delete the min value node from the right subtree.
```

```js
/*
 * ALGORITHM EXPLANATION:
 * * This function implements the deletion of a node with value 'k' from a Binary Search Tree (BST).
 * The algorithm proceeds in two main phases: Search and Delete.
 * * 1. Search Phase:
 * - We traverse the tree recursively to find the node containing 'k'.
 * - If 'k' is smaller than the current node, we move to the left subtree.
 * - If 'k' is larger, we move to the right subtree.
 * * 2. Delete Phase (once the node is found):
 * - Case 1: Leaf Node (No children)
 * Simply remove the node by returning null.
 * - Case 2: One Child
 * Replace the node with its non-null child (effectively bypassing the deleted node).
 * - Case 3: Two Children
 * This is the complex case. To preserve the BST property, we need a replacement value.
 * We find the "Inorder Successor" (the smallest value in the right subtree).
 * We copy the successor's value to the current node.
 * Then, we recursively call delete on the right subtree to remove the original successor node.
 */

// Approach 2: (with min value in right subtree)

// Define the structure for a Tree Node
class TreeNode {
    // Constructor to initialize the node value and its children
    constructor(val = 0, left = null, right = null) {
        this.val = val;     // Set the value of the node
        this.left = left;   // Set reference to the left child
        this.right = right; // Set reference to the right child
    }
}

// Function to delete a specific node 'k' from the BST
function deleteNode(root, k) {
    // Check if the current node is null (tree is empty or value not found)
    if (root === null) {
        return null; // Base case: node not found, return null
    }

    // If the value to be deleted is smaller than the root's value
    if (k < root.val) {
        // Recursively attempt to delete the node in the left subtree
        // Update the left child with the result of the recursive call
        root.left = deleteNode(root.left, k); // Search in left subtree
    }
    // If the value to be deleted is larger than the root's value
    else if (k > root.val) {
        // Recursively attempt to delete the node in the right subtree
        // Update the right child with the result of the recursive call
        root.right = deleteNode(root.right, k); // Search in right subtree
    }
    // If we reach here, we have found the node to be deleted (root.val === k)
    else {
        // Node to be deleted found

        // Case 1: Check if it is a leaf node (no children)
        if (root.left === null && root.right === null) {
            return null; // Node is a leaf, remove it by returning null
        }

        // Case 2: Node with only one child

        // If there is no left child
        if (root.left === null) {
            return root.right; // Replace current node with its right child
        }
        // If there is no right child
        if (root.right === null) {
            return root.left; // Replace current node with its left child
        }

        // Case 3: Node with two children
        // We need to find the inorder successor (smallest node in the right subtree)
        let minNode = root.right; // Start looking in the right subtree

        // Traverse down the left side of the right subtree to find the minimum
        while (minNode.left !== null) {
            minNode = minNode.left; // Traverse to the leftmost node
        }

        // Replace the current node's value with the minimum node's value
        // This effectively "deletes" the target value while keeping the structure valid
        root.val = minNode.val; // Replace value with the minimum node's value

        // Now we have a duplicate of the min value in the tree.
        // We must recursively delete that minimum node from the right subtree.
        root.right = deleteNode(root.right, minNode.val); // Delete the minimum node from the right subtree
    }

    // Return the root of the modified subtree to the caller
    return root; // Return the modified root
}

// Constructing a sample BST for testing
// Tree Structure:
//      4
//     / \
//    2   7
//   / \
//  1   3
const rootDelete = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));

// Output the original tree structure as a JSON string
console.log(JSON.stringify(rootDelete)); // Original BST

// Perform the deletion of node with value 2
console.log(JSON.stringify(deleteNode(rootDelete, 2))); // BST with node 2 deleted
// Resulting Tree:
//      4
//     / \
//    3   7
//   /
//  1

// Time Complexity: O(h) where h is the height of the tree.
// - In the worst case (skewed tree), h = n (number of nodes), so O(n).
// - In a balanced tree, h = log(n), so O(log n).

// Space Complexity: O(h) for recursive stack space.
// - We use recursion, which consumes stack memory proportional to the height of the tree.
```

```python
def get_min_node(node):
    curr = node
    while curr.left:
        curr = curr.left
    return curr


def delete_bst_recursive(root, key):
    if not root:
        return None

    if key < root.data:
        root.left = delete_bst_recursive(root.left, key)
    elif key > root.data:
        root.right = delete_bst_recursive(root.right, key)
    else:
        # Case 1 & 2: Node with only one child or no child
        if not root.left:
            return root.right
        elif not root.right:
            return root.left

        # Case 3: Node with two children
        successor = get_min_node(root.right)
        root.data = successor.data
        root.right = delete_bst_recursive(root.right, successor.data)

    return root


# Time Complexity: O(H)
# Space Complexity: O(H)
```

```js
/* * ALGORITHM EXPLANATION:
 * * 1. Search Phase:
 * - Start at the root.
 * - If the target value 'k' is less than the current node's value, recurse into the left subtree.
 * - If 'k' is greater, recurse into the right subtree.
 * - If 'k' matches the current node's value, we proceed to the deletion phase.
 * * 2. Deletion Phase (3 Scenarios):
 * - Case A (Leaf Node): If the node has no children, simply remove it (return null).
 * - Case B (One Child): If the node has only one child, bypass the current node and return that single child to link it to the parent.
 * - Case C (Two Children): This specific implementation uses the "Max in Left Subtree" (Inorder Predecessor) approach.
 * a. Find the maximum value node in the left subtree (go left once, then keep going right).
 * b. Replace the value of the node to be deleted with this maximum value.
 * c. Recursively delete the duplicate maximum value node from the left subtree.
 */

// Approach 1: (with max value in left subtree)

class TreeNode {
    // Constructor to initialize a tree node with value and children pointers
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function deleteNode(root, k) {
    // Check if the current node is null (end of branch or empty tree)
    if (root === null) {
        return null; // Base case: node not found
    }

    // Traverse left if the target key is smaller than the current node value
    if (k < root.val) {
        root.left = deleteNode(root.left, k); // Search in left subtree
    }
    // Traverse right if the target key is larger than the current node value
    else if (k > root.val) {
        root.right = deleteNode(root.right, k); // Search in right subtree
    }
    else {
        // Node to be deleted found

        // Case 1: Leaf node (0 children)
        // If both children are null, simply remove the node by returning null
        if (root.left === null && root.right === null) {
            return null;
        }

        // Case 2: Node with one child
        // If left is null, the right child replaces the current node
        if (root.left === null) {
            return root.right; // Replace with right child
        }
        // If right is null, the left child replaces the current node
        if (root.right === null) {
            return root.left; // Replace with left child
        }

        // Case 3: Node with two children (Approach 1 Specific Logic)
        // We need to find a replacement value to maintain BST property.
        // This approach selects the largest value from the smaller side (Left Subtree).

        // 1. Find the MAX value in the LEFT subtree
        let maxNode = root.left;
        while (maxNode.right !== null) {
            maxNode = maxNode.right; // Traverse to the rightmost node of the left child
        }

        // 2. Replace the current node's value with that max value
        // We overwrite the value rather than moving the actual node object
        root.val = maxNode.val;

        // 3. Delete the duplicate max value node from the LEFT subtree
        // Since we moved the value up, the original node holding that value must be removed
        root.left = deleteNode(root.left, maxNode.val);
    }

    return root; // Return the modified root
}

// Creating a sample tree for testing
// Structure:
//      4
//     / \
//    2   7
//   / \
//  1   3
const rootDelete = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));

console.log("Original Tree:", JSON.stringify(rootDelete));
//      4
//     / \
//    2   7
//   / \
//  1   3

console.log("Tree after deleting 4:", JSON.stringify(deleteNode(rootDelete, 4)));
// Logic:
// 1. Node 4 found. Has 2 children.
// 2. Left subtree is (2, 1, 3).
// 3. Max in left subtree is 3.
// 4. Replace 4 with 3.
// 5. Delete 3 from left subtree.

// Resulting Tree:
//      3
//     / \
//    2   7
//   /
//  1

/*
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(h)
 * - Where 'h' is the height of the tree.
 * - In the worst case (skewed tree), we might traverse from root to leaf, making it O(n).
 * - In a balanced tree, the height is log(n), making it O(log n).
 * * Space Complexity: O(h)
 * - This is due to the recursion stack used by the system.
 * - In the worst case (skewed tree), the stack depth is O(n).
 * - In a balanced tree, the stack depth is O(log n).
 */
```

```python
def delete_bst_iterative(root, key):
    curr = root
    prev = None

    # Search for node and track parent
    while curr and curr.data != key:
        prev = curr
        if key < curr.data:
            curr = curr.left
        else:
            curr = curr.right

    if not curr:
        return root

    # Node has at most one child
    if not curr.left or not curr.right:
        new_curr = curr.left if curr.left else curr.right
        if not prev:
            return new_curr
        if curr == prev.left:
            prev.left = new_curr
        else:
            prev.right = new_curr
    else:
        # Node has two children: find inorder successor
        p = None
        temp = curr.right
        while temp.left:
            p = temp
            temp = temp.left

        if p:
            p.left = temp.right
        else:
            curr.right = temp.right

        curr.data = temp.data

    return root


# Time Complexity: O(H)
# Space Complexity: O(1)
```

### 6. Construct a Balanced Binary Search Tree from Sorted Array **O(N), O(1)**
```
Given a sorted array, construct a balanced binary search tree (BST) from it and return the root of the BST.
```

```js
/*
 * ALGORITHM EXPLANATION:
 * ----------------------
 * To construct a Balanced Binary Search Tree (BST) from a sorted array, we must ensure
 * that the height difference between the left and right subtrees of any node is at most 1.
 *
 * 1. **Identify the Root**: Since the array is sorted, the middle element is the
 * median. Making the middle element the root ensures that roughly half the
 * elements are on the left and half are on the right, maintaining balance.
 *
 * 2. **Recursive Approach**:
 * - Calculate the middle index of the current subarray (defined by `low` and `high`).
 * - Create a new tree node using the value at this middle index.
 * - Recursively repeat the process for the left subarray (from `low` to `mid - 1`)
 * to construct the left child.
 * - Recursively repeat the process for the right subarray (from `mid + 1` to `high`)
 * to construct the right child.
 *
 * 3. **Base Case**:
 * - If `low > high`, it means the subarray is empty. Return `null` to indicate
 * the end of that branch.
 */

// Definition for a binary tree node.
class TreeNode {
    // Constructor initializes the node value and its children pointers
    constructor(val = 0, left = null, right = null) {
        this.val = val;     // The value of the node
        this.left = left;   // Pointer to the left child
        this.right = right; // Pointer to the right child
    }
}

// Main function to initiate the BST construction
function constructBST(arr) {
    // Call the recursive helper function with the full range of the array
    // low index = 0, high index = last element (arr.length - 1)
    return construct(arr, 0, arr.length - 1);
}

// Helper function to construct the tree recursively
function construct(arr, low, high) {
    // Base Case: If the start index exceeds the end index, the range is invalid/empty.
    if (low > high) {
        return null; // Return null to signify no node exists here
    }

    // Calculate the middle index to determine the root of this subtree.
    // Note: Added Math.floor to ensure an integer index (crucial for JS).
    const mid = Math.floor(low + (high - low) / 2);

    // Create a new TreeNode using the value at the middle index
    const node = new TreeNode(arr[mid]);

    // Recursively build the left subtree using elements before the mid index
    // Range becomes [low, mid - 1]
    node.left = construct(arr, low, mid - 1);

    // Recursively build the right subtree using elements after the mid index
    // Range becomes [mid + 1, high]
    node.right = construct(arr, mid + 1, high);

    // Return the constructed node (root of this subtree) back to the caller
    return node;
}

const sortedArray = [1, 2, 3, 4, 5, 6, 7];
const balancedBST = constructBST(sortedArray);
console.log(JSON.stringify(balancedBST)); // Balanced BST constructed from the sorted array
//      4
//    /   \
//   2     6
//  / \   / \
// 1   3 5   7

/*
 * COMPLEXITY ANALYSIS:
 * --------------------
 * Time Complexity: O(N)
 * - We visit every element in the array exactly once to create a corresponding tree node.
 * - Therefore, the time complexity is linear with respect to the number of elements N.
 *
 * Space Complexity: O(N)
 * - O(N) is required to store the output structure (the tree nodes).
 * - Additionally, the recursion stack uses O(log N) space because the tree is balanced.
 * - Total Space: O(N).
 */
```

```python
def sorted_array_to_bst(nums):
    def build_bst(left, right):
        if left > right:
            return None
        mid = left + (right - left) // 2
        root = TreeNode(nums[mid])
        root.left = build_bst(left, mid - 1)
        root.right = build_bst(mid + 1, right)
        return root

    return build_bst(0, len(nums) - 1)


# Time Complexity: O(N)
# Space Complexity: O(log N)
```

### 7. Check if a Tree is a Binary Search Tree **O(N), O(1)**
```
Given the root of a binary tree, check if it is a binary search tree (BST).
Property of a balanced BST: In-order traversal of the BST is always sorted.
```

```js
/*
ALGORITHM EXPLANATION:
This code validates whether a binary tree is a valid Binary Search Tree (BST).
The algorithm uses the property that an in-order traversal of a valid BST visits
nodes in strictly ascending order. It performs an in-order traversal while keeping
track of the previously visited node's value. If at any point the current node's
value is not greater than the previous node's value, the tree is not a valid BST.

HOW IT WORKS:
1. Initialize a previous value tracker to negative infinity
2. Perform in-order traversal (left subtree -> current node -> right subtree)
3. At each node, check if current value > previous value
4. If violation found, mark as invalid BST and return early
5. Update previous value and continue traversal
6. Return the final validation result
*/

// TreeNode class definition for binary tree nodes
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;        // Store the node's value
        this.left = left;      // Reference to left child node
        this.right = right;    // Reference to right child node
    }
}

// Main function to check if a binary tree is a valid BST
function checkBST(root) {
    let prev = -Infinity;   // Track the previously visited node's value (start with smallest possible value)
    let isBST = true;       // Flag to track if the tree is a valid BST
    inOrderTraversal(root); // Start the in-order traversal from root
    return isBST;           // Return the final validation result

    // Nested function to perform in-order traversal
    function inOrderTraversal(node) {
        if (node === null) {  // Base case: if node is null, return
            return;
        }
        inOrderTraversal(node.left); // Recursively traverse left subtree first
        if (node.val <= prev) {      // Check if current node violates BST property
            isBST = false; // If current node's value is not greater than previous, it's not a BST
            return;                    // Early return to stop further traversal
        }
        prev = node.val; // Update previous node's value
        isBST && inOrderTraversal(node.right); // Only traverse right subtree if still valid BST
    }
}

// Create a sample binary tree for testing
const rootCheck = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
const isBST = checkBST(rootCheck); // Call the BST validation function
console.log(isBST); // true

// Time Complexity: O(n) where n is the number of nodes in the tree
// Space Complexity: O(h) for the recursive stack space, where h is the height of the tree

/*
COMPLEXITY ANALYSIS:

TIME COMPLEXITY: O(n)
- In the worst case, we visit every node in the tree exactly once
- Each node operation (comparison, assignment) takes O(1) time
- Therefore, total time complexity is O(n) where n is the number of nodes

SPACE COMPLEXITY: O(h)
- The space complexity is determined by the recursive call stack
- In the worst case (skewed tree), the recursion depth equals the height h
- For a balanced tree: h = log(n), for a skewed tree: h = n
- Additional space for variables (prev, isBST) is O(1)
- Therefore, space complexity is O(h) where h is the height of the tree
*/
```

```python
def is_valid_bst(root, min_val=-float('inf'), max_val=float('inf')):
    if not root:
        return True

    if not (min_val < root.data < max_val):
        return False

    return is_valid_bst(root.left, min_val, root.data) and is_valid_bst(root.right, root.data, max_val)


# Time Complexity: O(N)
# Space Complexity: O(H)
```

### 8. Sorted Array To Balanced BST **O(N), O(1)**
```
Given an array where elements are sorted in ascending order, convert it to a height Balanced Binary Search Tree (BBST).
Balanced tree : a height-balanced binary tree is defined as a binary tree in which the depth of the two subtrees of every node never differ by more than 1.
```

```js
// Definition for a binary tree node.
class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

/**
 * Converts a sorted array into a height-balanced BST.
 *
 * @param {number[]} A  Sorted array of unique values
 * @return {Node|null}  Root of the balanced BST
 */
function sortedArrayToBST(A) {
  // Helper that builds tree from A[lo..hi]
  function build(lo, hi) {
    if (lo > hi) return null;              // empty subtree
    const mid = Math.floor((lo + hi) / 2); // pick middle
    const node = new Node(A[mid]);
    node.left  = build(lo,   mid - 1);     // left half
    node.right = build(mid + 1, hi);       // right half
    return node;
  }

  return build(0, A.length - 1);
}
// Input: [1,2,3]
let arr1 = [1, 2, 3];
let bst1 = sortedArrayToBST(arr1);
/* Produces:
      2
     / \
    1   3
*/

// Input: [1,2,3,5,10]
let arr2 = [1, 2, 3, 5, 10];
let bst2 = sortedArrayToBST(arr2);
/* Produces one valid balanced tree, for example:
        3
       / \
      2   5
     /     \
    1      10
*/

// (You can write a simple traversal to verify structure if you like)

// Time Complexity: O(n) where n is the number of elements in the array
// Space Complexity: O(n) for the recursive stack space and the BST nodes
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def sorted_array_to_balanced_bst(arr):
    def helper(left, right):
        if left > right:
            return None
        mid = (left + right) // 2
        node = TreeNode(arr[mid])
        node.left = helper(left, mid - 1)
        node.right = helper(mid + 1, right)
        return node

    return helper(0, len(arr) - 1)


# Time Complexity: O(N)
# Space Complexity: O(log N) recursion stack
```


