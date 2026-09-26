[<- DSA](00-dsa-quick.md)

# Revision Advanced DSA - 4

## Index
- [Notes](#notes)
  - [1. Heaps](#1-heaps)
  - [2. Dynamic Programming](#2-dynamic-programming)
  - [3. One Dimensional DP](#3-one-dimensional-dp)
  - [4. Knapsack Problems](#4-knapsack-problems)
  - [5. Graphs](#5-graphs)
- [Questions](#questions)
  - [1. Heaps Introduction](#1-heaps-introduction)
  - [2. Heap Sort & Greedy](#2-heap-sort--greedy)
  - [3. DP 1: One Dimensional](#3-dp-1-one-dimensional)
  - [4. DP 2: Two Dimensional](#4-dp-2-two-dimensional)
  - [5. DP 3: Knapsack](#5-dp-3-knapsack)
  - [6. Graphs 1: Introduction, DFS & Cycle Detection](#6-graphs-1-introduction-dfs--cycle-detection)
  - [7. Graphs 2: BFS & MST](#7-graphs-2-bfs--mst)
  - [8. Graphs 3: Dijkstra Algo & Topological Sort](#8-graphs-3-dijkstra-algo--topological-sort)
  - [Multiple Approaches](#multiple-approaches)

# Notes

## 1. Heaps

### Heap Data Structure
```
The heap data structure is a binary tree with two special properties.

First property is based on structure.
Complete Binary Tree: All levels are completely filled. The last level can be the exception but is should also be filled from left to right.

Second property is based on the order of elements.
Heap Order Property:
In the case of max heap, the value of the parent is greater than the value of the children.
In the case of min heap, the value of the parent is less than the value of the children.

Example 1:
            5
          /   \
         12    20
        /  \   /  \
       25  13 24   22
      /  \
     35  34

* This is the complete binary tree as all the levels are filled and the last level is filled from left to right.
* Heap Order Property is also valid at every point in the tree, as 5 is less than 12 and 20, 12 is less than 25 and 13, 20 is less than 24 and 22, 25 is less than 35 and 34.
* Hence, it is a min-heap.

Example 2:
            58
          /    \
         39     26
        /  \   /  \
       34  12 3    9
      /  \
     16   1

* This is the complete binary tree as all the levels are filled and the last level is filled from left to right.
* Heap Order Property is also valid at every point in the tree, as 58 is greater than 39 and 26, 39 is greater than 34 and 12, 26 is greater than 3 and 9, 34 is greater than 16 and 1.
* Hence, it is a max-heap.
```

### Array representation of Tree
```
[8, 10, 1, 6, 12, 19, 15, 3, 7]
 0  1   2  3  4   5   6   7  8

             8(0)
          /      \
      10(1)       1(2)
     /    \      /    \
  6(3)   12(4) 19(5) 15(6)
 /   \
3(7)  7(8)
```

Are we really making a tree OR is it just visualisation? → We are assuming array as tree.

Advantages:
1) Element is available at certain index.
2) This visualised tree will be always complete binary tree.

### Index mapping formula (same for both min-heap and max-heap)
Here i is the index of current node.
1. Parent index: `Math.floor((i - 1) / 2)`  (integer division)
2. Left child index: `2 * i + 1`
3. Right child index: `2 * i + 2`

### Min-heap
```
Heap array (after heapify):
[1, 3, 8, 6, 12, 19, 15, 10, 7]
```

**Tree view (index in parentheses):**
```
            1(0)
          /     \
       3(1)      8(2)
      /   \     /    \
   6(3) 12(4) 19(5)  15(6)
   /  \
10(7) 7(8)
```
Property check: every parent ≤ its children (min-heap order) and the shape is a complete binary tree.

### Max-heap
```
Heap array (after heapify):
[19, 10, 15, 7, 8, 1, 12, 3, 6]
```

**Tree view (index in parentheses):**
```
             19(0)
           /      \
       10(1)      15(2)
      /    \      /    \
   7(3)   8(4)  1(5)  12(6)
   /  \
 3(7) 6(8)
```
Property check: every parent ≥ its children (max-heap order) and the shape is complete.

### Array representation of Tree
```
[8, 10, 1, 6, 12, 19, 15, 3, 7]
 0  1   2  3  4   5   6   7  8

             8(0)
          /      \
      10(1)       1(2)
     /    \      /    \
  6(3)   12(4) 19(5) 15(6)
 /   \
3(7)  7(8)
```

Are we really making a tree OR is it just visualisation? → We are assuming array as tree.

Advantages:
1) Element is available at certain index.
2) This visualised tree will be always complete binary tree.

#### Index mapping formula (same for both min-heap and max-heap)
Here i is the index of current node.
1. Parent index: `Math.floor((i - 1) / 2)`  (integer division)
2. Left child index: `2 * i + 1`
3. Right child index: `2 * i + 2`

#### Min-heap
```
Heap array (after heapify):
[1, 3, 8, 6, 12, 19, 15, 10, 7]
```

**Tree view (index in parentheses):**
```
            1(0)
          /     \
       3(1)      8(2)
      /   \     /    \
   6(3) 12(4) 19(5)  15(6)
   /  \
10(7) 7(8)
```
Property check: every parent ≤ its children (min-heap order) and the shape is a complete binary tree.

#### Max-heap
```
Heap array (after heapify):
[19, 10, 15, 7, 8, 1, 12, 3, 6]
```

**Tree view (index in parentheses):**
```
             19(0)
           /      \
       10(1)      15(2)
      /    \      /    \
   7(3)   8(4)  1(5)  12(6)
   /  \
 3(7) 6(8)
```
Property check: every parent ≥ its children (max-heap order) and the shape is complete.

### Sorting Approaches Overview
- **Naive Sorts**: Bubble Sort, Selection Sort, Insertion Sort
  - Time Complexity: O(n²)
  - Space: O(1)
- **Efficient Sorts**: Merge Sort, QuickSort
  - Time: O(n log n)
  - Space: Merge → O(n), QuickSort → O(log n)
- **Heap Sort**: Uses **binary heap** data structure.
  - Time: O(n log n)
  - Space: O(1)
  - Not stable

### Heap Sort Using Max Heap
Heap Sort can be done using either a **min-heap** or **max-heap**.
Use max-heap to sort in ascending order and min-heap for descending order.
Here, we use a **max-heap** to sort in ascending order.
- Build a max-heap from array → O(n)
- Extract max (root element) by swapping with last element and reducing heap size. Now last element is sorted.
- Reduce heap size by 1 by ignoring last element (now sorted)
- Then down-heapify the root to restore max-heap property → O(log n)
- Repeat until array is sorted

Initial array: `[13, 7, 6, 10, 5, 2, 1, 9, 14]`
```
            14
         /      \
       13        10
     /   \     /   \
    7     6   5     2
   / \
  1   9
```
Sorted array: `[1, 2, 5, 6, 7, 9, 10, 13, 14]`

### Observations in Heap Sort
1. Use Max-Heap for ascending sort to get max elements first and place them at the end. This can be done in-place in the array. i.e O(1) space.
2. Use Min-Heap for descending sort to get min elements first and place them at the end. This can be done in-place in the array. i.e O(1) space.

### Stability of Sorting

***Stable Sort***
```
Keeps relative order of equal elements (Merge Sort).
Example: Sorting `[1a, 1b, 2a, 2b]` will always produce `[1a, 1b, 2a, 2b]`.
```
**Heap Sort is NOT a stable sort.**
```
Does not guarantee relative order of equal elements.
Example: Sorting `[1a, 1b, 2a, 2b]` may produce `[1b, 1a, 2b, 2a]`.
```

### Median of a Sorted array
Middle element of a a Sorted array is the median.
```
Array: [9, 3, 7, 15, 1]
Sorted: [1, 3, 7, 9, 15] → Median = 7

Array: [9, 3, 7, 5, 1, 10]
Sorted: [1, 3, 5, 7, 9, 10]
First middle = 5, Second middle = 7 → Median = (5 + 7) / 2 = 6

In case of even length array, based on requirement, median can be defined as:
- Lower Median: First middle element
- Upper Median: Second middle element
- Average Median: Average of both middle elements
```

## 2. Dynamic Programming
Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler, overlapping subproblems. The results of these subproblems are stored (memoized or tabulated) to avoid redundant computations. For a problem to be solvable with DP, it must have two key properties:
1.  **Optimal Substructure**: The optimal solution to the main problem can be constructed from the optimal solutions of its subproblems. This often hints at a recursive solution.
2.  **Overlapping Subproblems**: The problem involves solving the same subproblems multiple times. DP takes advantage of this by computing each subproblem only once and storing its result. Repeatation of subproblems is what differentiates DP from simple recursion.
3.  **Memoization (Top-Down) / Tabulation (Bottom-Up)**: Storing the results.

### There are two main approaches to DP:
  * **Top-Down (Memoization)**: This is a recursive approach. You start with the main problem and break it down. If you encounter a subproblem you've already solved, you retrieve its result from storage instead of re-calculating it.
  * **Bottom-Up (Tabulation)**: This is an iterative approach. You start by solving the smallest possible subproblems. You then use these results to build solutions for progressively larger subproblems until you solve the main problem.

The main idea behind DP is to trade space for time. By using extra memory to store results, we can significantly reduce the time complexity of the algorithm.

### Simple Reursion Example with No DP
```
Print numbers from n to 1.

This problem cannot be solved using Dynamic Programming because it lacks the two essential properties required for DP.
1. No optimal substructure. The solution to printing numbers from n to 1 does not depend on the solutions of smaller subproblems in a way that can be reused to build the final solution.
2. No overlapping subproblems. Each subproblem is unique and does not repeat.

Also we can not store results of subproblems because each subproblem is unique and does not repeat.
```

```js
function printNumbers(n) {
  // Base case: if n is 0, stop the recursion
  if (n === 0) {
    return;
  }

  // Print the current number
  console.log(n);

  // Recursive call with n-1
  printNumbers(n - 1);
}

printNumbers(5); // Output: 5 4 3 2 1

// Time Complexity: O(n)
// Space Complexity: O(n) - due to recursion stack
```

```python
def print_numbers(n):
    # Base case: if n is 0, stop the recursion
    if n == 0:
        return

    # Print the current number
    print(n)

    # Recursive call with n-1
    print_numbers(n - 1)


print_numbers(5)  # Output: 5 4 3 2 1

# Time Complexity: O(n)
# Space Complexity: O(n) - due to recursion stack
```

### Few List of Problems where DP can't be applied
1. **Calculating Factorial**: n! = n * (n-1)! (Linear dependency, no repeated states).
2. **Generating Permutations**: Generating all permutations of a set of numbers (each permutation is unique, no overlapping subproblems).
3. **Tree Traversal**: Printing nodes of a binary tree (Inorder, Preorder, Postorder) (Every node is visited exactly once).

### Why can't we use DP in case of Factorial?
To use Dynamic Programming (DP), a problem must meet two criteria. **Factorial** meets the first one but fails the second one completely.
1. **Optimal Substructure:** Does the solution depend on smaller versions of itself?
* **Yes.** To solve , you need the solution for 4!.
2. **Overlapping Subproblems:** Do you solve the **same** sub-problem multiple times?
* **No.** This is why DP is useless here.

#### The "Straight Line" Problem
When you calculate the factorial of a number (e.g. 5!), the dependency graph is a **straight line**, not a branching tree.
To calculate `fact(5)`:
1. `fact(5)` calls `fact(4)`
2. `fact(4)` calls `fact(3)`
3. `fact(3)` calls `fact(2)`
4. `fact(2)` calls `fact(1)`

**The Key Difference:**
* **In Fibonacci (DP):** `fib(5)` needs `fib(3)`, and `fib(4)` *also* needs `fib(3)`. Because `fib(3)` is needed twice, we cache it (DP).
* **In Factorial:** Once `fact(3)` returns its value to `fact(4)`, it is **never asked for again**. Storing it in a table is a waste of memory because no other part of the calculation needs it.

#### Code Comparison
Here is the flow in JavaScript. Notice there is no opportunity to "reuse" a variable.

```javascript
function factorial(n) {
  // Base case
  if (n === 0 || n === 1) return 1;

  // Recurse
  // We simply go deeper. We never "branch out" to calculate (n-2) separately.
  return n * factorial(n - 1);
}
```

```python
def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1

    return n * factorial(n - 1)


print(factorial(5))  # 120
```

## 3. One Dimensional DP

### Dynamic Programming
Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler, overlapping subproblems. The results of these subproblems are stored (memoized or tabulated) to avoid redundant computations. For a problem to be solvable with DP, it must have two key properties:
1.  **Optimal Substructure**: The optimal solution to the main problem can be constructed from the optimal solutions of its subproblems. This often hints at a recursive solution.
2.  **Overlapping Subproblems**: The problem involves solving the same subproblems multiple times. DP takes advantage of this by computing each subproblem only once and storing its result. Repeatation of subproblems is what differentiates DP from simple recursion.
3.  **Memoization (Top-Down) / Tabulation (Bottom-Up)**: Storing the results.

### There are two main approaches to DP
  * **Top-Down (Memoization)**: This is a recursive approach. You start with the main problem and break it down. If you encounter a subproblem you've already solved, you retrieve its result from storage instead of re-calculating it.
  * **Bottom-Up (Tabulation)**: This is an iterative approach. You start by solving the smallest possible subproblems. You then use these results to build solutions for progressively larger subproblems until you solve the main problem.
The main idea behind DP is to trade space for time. By using extra memory to store results, we can significantly reduce the time complexity of the algorithm.

### Few List of Problems where DP can't be applied
1. **Calculating Factorial**: n! = n * (n-1)! (Linear dependency, no repeated states).
2. **Generating Permutations**: Generating all permutations of a set of numbers (each permutation is unique, no overlapping subproblems).
3. **Tree Traversal**: Printing nodes of a binary tree (Inorder, Preorder, Postorder) (Every node is visited exactly once).

### Why can't we use DP in case of Factorial?
To use Dynamic Programming (DP), a problem must meet two criteria. **Factorial** meets the first one but fails the second one completely.
1. **Optimal Substructure:** Does the solution depend on smaller versions of itself?
* **Yes.** To solve , you need the solution for 4!.
2. **Overlapping Subproblems:** Do you solve the **same** sub-problem multiple times?
* **No.** This is why DP is useless here.

#### The "Straight Line" Problem
When you calculate the factorial of a number (e.g. 5!), the dependency graph is a **straight line**, not a branching tree.
To calculate `fact(5)`:
1. `fact(5)` calls `fact(4)`
2. `fact(4)` calls `fact(3)`
3. `fact(3)` calls `fact(2)`
4. `fact(2)` calls `fact(1)`

**The Key Difference:**
* **In Fibonacci (DP):** `fib(5)` needs `fib(3)`, and `fib(4)` *also* needs `fib(3)`. Because `fib(3)` is needed twice, we cache it (DP).
* **In Factorial:** Once `fact(3)` returns its value to `fact(4)`, it is **never asked for again**. Storing it in a table is a waste of memory because no other part of the calculation needs it.

#### Code Comparison
Here is the flow in JavaScript. Notice there is no opportunity to "reuse" a variable.

```javascript
function factorial(n) {
  // Base case
  if (n === 0 || n === 1) return 1;

  // Recurse
  // We simply go deeper. We never "branch out" to calculate (n-2) separately.
  return n * factorial(n - 1);
}
```

```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
```

## 4. Knapsack Problems

Given a set of items, each with a weight and a value, the goal is to determine the number of each item to include in a collection (the "knapsack") so that the total weight is less than or equal to a given limit and the total value is as large as possible.

There are several variations of this problem:
  - **Fractional Knapsack**: Items can be divided. This can be solved efficiently using a greedy approach.
  - **0-1 Knapsack**: Items are indivisible; you either take an item or you don't. The greedy approach does not work, and it's typically solved using dynamic programming.
  - **Unbounded Knapsack (0-N Knapsack)**: Items are indivisible, but you have an infinite supply of each item. This is also solved using dynamic programming, with a slight variation in the state transition formula compared to the 0-1 version.

## 5. Graphs

A graph is a non-linear data structure consisting of a collection of **Vertices** (or nodes) and **Edges** that connect pairs of vertices.

Graphs are used to model various real-world scenarios:

1.  **Computer Networks:** Each machine (Desktop, Server, Printer, Workstation) is a vertex, and the connections between them are edges.
2.  **Social Media:** Each person is a vertex, and a "friend" or "follow" connection is an edge.
3.  **Google Maps:** Locations or intersections are vertices, and the roads connecting them are edges.

**Terminology:**

  * **Vertex:** A node in the graph. (e.g., 0, 1, 2, 3, 4, 5, 6)
  * **Edge:** A link between two vertices. (e.g., an edge exists between vertex 0 and 3, written as 0-3)
  * **Neighbors:** The set of vertices connected by an edge to a particular vertex. For example, the neighbors of vertex 4 are {3, 5, 6}.

A simple graph with 7 vertices and some edges.

```

      (0)
      / \
     /   \
   (1)   (3)
    |    / \
    |   /   \
   (2) (4)--(5)
        |   /
        |  /
        (6)

```

  * **Vertices:** {0, 1, 2, 3, 4, 5, 6}
  * **Edges:** {0-1, 0-3, 1-2, 2-3, 3-4, 4-5, 4-6, 5-6}

### Properties / Types of Graphs

#### **1. Directed vs. Un-directed Graphs**

  * **Un-directed Graph:** Edges have no direction. If there is an edge from vertex `i` to `j`, there is also an edge from `j` to `i`.
    ```
      (i) ------ (j)
    ```
  * **Directed Graph:** Edges have a direction. An edge from `i` to `j` does not imply an edge from `j` to `i`.
    ```
      (i) ------> (j)
    ```

#### **2. Connected vs. Disconnected Graphs**

  * **Connected Graph:** For any two vertices in the graph, there is a path between them. All vertices are connected in a single component.
  * **Disconnected Graph:** The graph is made of two or more disjoint sets of vertices (components). There is no path between vertices in different components.

**Connected Graph**

```
    (1)-----(2)-----(3)
                   |
                   |
                  (4)-----(5)
```

  * All 5 vertices are connected.

**Disconnected Graph**

```
    (1)-----(2)     (4)-----(5)

    (3)             (6)
```

  * There are three separate components: {1, 2, 3}, {4, 5}, and {6}.

#### **3. Weighted vs. Unweighted Graphs**

  * **Unweighted Graph:** All edges are considered equal; there is no cost or weight associated with traversing an edge.
  * **Weighted Graph:** Each edge has a numerical weight or cost associated with it. This can represent distance, time, etc.

**Weighted Graph**

```
      (City A)
         |
         | 6
         |
      (City B)
```

  * The edge between City A and City B has a weight of 6.

#### **4. Cyclic vs. Acyclic Graphs**

  * **Cyclic Graph:** Contains at least one cycle, which is a path that starts and ends at the same vertex without revisiting an edge.
  * **Acyclic Graph:** Contains no cycles. A directed acyclic graph is often called a **DAG**.

**Cyclic (Undirected)**

```
    (1)-----(2)-----(4)-----(5)
             |      /
             |     /
            (3)----
```

  * Cycle: 2 -\> 3 -\> 4 -\> 2

**Acyclic (Undirected)**

```
    (1)-----(x)-----(2)
           / \
          /   \
        (4)   (3)
```

**Cyclic (Directed)**

```
      (1) <------(3)
      / \        /
     /   \      /
    V     V    V
   (2)----->(4)----->(5)
```

  * Cycle: 1 -\> 4 -\> 3 -\> 1

**Acyclic (Directed)**

```
   (1)----->(2)----->(3)
    \       /
     \     /
      V   V
       (4)
```

#### **5. Degree, In-degree, and Out-degree**

  * **Degree (Undirected Graph):** The number of edges connected to a vertex. It is the count of its neighbors.
  * **In-degree (Directed Graph):** The number of incoming edges to a vertex.
  * **Out-degree (Directed Graph):** The number of outgoing edges from a vertex.

**Degree (Undirected)**

```
        (18)   (1)
          \   /
           (x)-----(2)
           / \
          /   \
        (4)   (3)
```

  * `degree(x)` = count of neighbors of x = 4.

**In-degree & Out-degree (Directed)**

```
      (A) -----> (x) <----- (B)
                 / \
                /   \
               V     V
              (1)   (2)----->(3)
```

  * `in-degree(x)` = 2 (from A and B)
  * `out-degree(x)` = 2 (to 1 and 2)

#### **6. Simple Graph**

  * A graph with no self-loops (an edge from a vertex to itself) and no multiple edges between the same pair of vertices.

**Simple Graph**

```
       (A)----------(B)
        |            |
        |            |
       (C)----------(D)
```

# Questions

## 1. Heaps Introduction

### 1. Insertion in min heap **O(N), O(N)**
```
heap[] = arr: [5, 12, 20, 25, 13, 24, 22, 35, 94]
               0   1   2   3   4   5   6   7   8

Insert → 10 // Now Heap order property is disturbed
heap[] = arr: [5, 12, 20, 25, 13, 24, 22, 35, 94, 10]
               0   1   2   3   4   5   6   7   8   9

NOTE: After insertion, if heap order property is disturbed, then we can resolve it using Upheapify (Shift-Up / Bubble-Up).

index of newly inserted element
i = heap.length - 1 = 10 - 1 = 9

parent = (i - 1) / 2 = (9 - 1) / 2 = 4
If parent is greater than child, → swap it.

i = 4
parent = (4 - 1) / 2 = 1 → compare → swap if req.

i = 1
parent = 0 → compare → swap if req.

To perform upheapify:
- we need to traverse height of tree.
- height of complete binary tree: log n

TC: O(log n) ⇒ Insertion in Heap is O(log n)
```

**Before insertion:**
```
            5(0)
          /     \
      12(1)      20(2)
     /    \     /     \
  25(3)  13(4) 24(5)  22(6)
 /    \
35(7) 94(8)
```

**After inserting 10 at end (index 9):**
Heap order is disturbed at 13(4) and 10(9).
```
            5(0)
          /     \
      12(1)       20(2)
     /    \      /     \
  25(3)  13(4) 24(5)  22(6)
 /    \     \
35(7) 94(8)  10(9)
```

**After upheapify swaps:**
Now heap order is restored.
```
            5(0)
          /     \
      10(1)      20(2)
     /    \     /     \
  25(3)  12(4) 24(5)  22(6)
 /    \     \
35(7) 94(8) 13(9)
```

```js
// Insertion in Min-Heap
/*
 * Algorithm Explanation:
 * * This code implements the insertion operation for a Min-Heap data structure.
 * * A Min-Heap is a complete binary tree where the value of each node is smaller than or equal to the values of its children.
 * * The heap is represented as an array where for any node at index 'i':
 * - The left child is at index: 2*i + 1
 * - The right child is at index: 2*i + 2
 * - The parent is at index: floor((i - 1) / 2)
 *
 * The insertion algorithm follows these steps:
 * 1. Insertion: The new element is initially added to the end of the array (the bottom-rightmost available spot in the tree).
 * 2. Up-Heapify (Bubble Up): To restore the Min-Heap property:
 * - Compare the newly added element with its parent.
 * - If the new element is smaller than the parent, swap them.
 * - Repeat this process, moving up the tree, until the element is either larger than its parent or reaches the root.
 */

// Heap array
const heap = [];

// Insert element into min-heap
function insert(ele) {
    // Add element to end (O(1) amortized)
    // Push the new element to the last index of the array.
    heap.push(ele);
    // Restore heap property (O(log n))
    // Call the helper function to fix the order if the new element is smaller than its parent.
    upheapify();
}

// Restore heap order by moving last element up
function upheapify() {
    let i = heap.length - 1; // start from last index
    // Initialize the pointer 'i' to the index of the newly inserted element.

    // Continue the loop as long as the current node is not the root (index 0).
    while (i > 0) {
        // Calculate the parent's index using the formula (current_index - 1) / 2.
        const parent = Math.floor((i - 1) / 2); // parent index

        // Check if the parent's value is greater than the current child's value for min-heap property.
        if (heap[parent] > heap[i]) {
            // If true, the Min-Heap property is violated.
            // Swap the current node with its parent to restore order.
            [heap[i], heap[parent]] = [heap[parent], heap[i]];

            // Move the pointer 'i' up to the parent's index to continue checking up the tree.
            i = parent; // move up
        } else {
            // If the parent is smaller or equal, the heap property is satisfied.
            // We break out of the loop.
            break;
        }
    }
}

insert(5);
insert(12);
insert(20);
insert(25);
insert(13);
insert(24);
insert(22);
insert(35);
insert(94);
insert(10); // Causes swaps to bubble up from the bottom to index 1.

console.log(heap); // Min-heap array after all insertions
// Expected: [5, 10, 20, 25, 12, 24, 22, 35, 94, 13]

/* * Time Complexity: O(log N)
 * - The height of a complete binary tree with N nodes is log N.
 * - In the worst case (inserting a new minimum), the upheapify process traverses from the leaf to the root.
 * - Therefore, insertion takes logarithmic time relative to the number of elements.
 *
 * Space Complexity: O(N)
 * - The heap requires O(N) space to store the elements in the array.
 * - The iterative upheapify function uses O(1) auxiliary space (no recursion stack).
 */
```

```python
# Insertion in Min-Heap (Manual / Array based)
def insert_min_heap(heap, val):
    heap.append(val)
    curr = len(heap) - 1

    while curr > 0:
        parent = (curr - 1) // 2
        if heap[curr] < heap[parent]:
            heap[curr], heap[parent] = heap[parent], heap[curr]
            curr = parent
        else:
            break

    return heap


# Using Python's built-in heapq module:
# import heapq
# heapq.heappush(heap, val)  # O(log N)

h = [1, 5, 3, 7, 9, 8]
print(insert_min_heap(h, 2))

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

### 2. Extraction in min heap **O(N), O(N)**
```
heap[] = arr: [5, 12, 20, 25, 13, 24, 22, 35, 94]
               0   1   2   3   4   5   6   7   8

We always remove root element (minimum element in min-heap)
→ swap(0, n-1)
→ heap.remove(n-1)

Now heap order property is disturbed
heap[] = arr: [12, 20, 25, 13, 24, 22, 35, 94]
               0   1   2   3   4   5   6   7

NOTE: After removal, we have to manage heap order property by performing downheapify(Shift-Down / Bubble-Down).

i = 0 // starting index for downheapify
arr: [12, 20, 25, 13, 24, 22, 35, 94]
      0   1   2   3   4   5   6   7

To convert heap:
left child index = 2 * i + 1
right child index = 2 * i + 2

To perform downheapify:
- we need to traverse height of tree.
- height of complete binary tree: log n

TC: O(log n) ⇒ Removal in Heap is O(log n)
```

**Before removal:**
```
         2(0)
       /      \
    4(1)       5(2)
   /    \      /   \
 11(3)  6(4) 7(5)  8(6)
 /
20(7)
```

**After swap(0, n-1) and removing last:**
After removing 2, heap order is disturbed.
```
         20(0)
       /      \
    4(1)       5(2)
   /    \     /    \
 11(3)  6(4) 7(5)  8(6)
```

**After downheapify:**
After downheapify now heap order is restored.
```
         4(0)
       /      \
    6(1)       5(2)
   /    \     /    \
 11(3) 20(4) 7(5)  8(6)
```
Now heap order is restored.

```js
// Removal in Min-Heap
/*
 * ==========================================
 * ALGORITHM EXPLANATION: MIN-HEAP REMOVAL
 * ==========================================
 * The goal is to remove the root element (the minimum value) while maintaining
 * the Min-Heap property (parent <= children).
 * * 1. Check Empty: If the heap is empty, return undefined.
 * 2. Save Root: Store the value at index 0 (the minimum) to return later.
 * 3. Swap & Pop:
 * - Swap the root (index 0) with the last element in the array.
 * - Remove the last element (which is now the old root) from the array.
 * - This effectively deletes the root but leaves the new root (formerly the last leaf)
 * in the wrong position.
 * 4. Downheapify (Bubble Down):
 * - Start at the new root (index 0).
 * - Compare the current node with its left and right children.
 * - Find the smallest index among the Current, Left Child, and Right Child.
 * - If the Current node is NOT the smallest, swap it with the smallest child.
 * - Update the current index to the child's index and repeat.
 * - Stop when the current node is smaller than both children or no children exist.
 * 5. Return: Return the saved root value.
 * ==========================================
 */

// Heap Removal in Min-Heap

// Heap array
// We are initializing the heap with some unordered data for the sake of the variable declaration,
// but in the test case below, we will push sorted/valid heap data to simulate a real scenario.
const heap = [];

// Remove and return the min element (root)
function remove() {
    // Edge Case: If the heap is empty, there is nothing to remove.
    if (heap.length === 0) return undefined;

    // The minimum element in a Min-Heap is always at index 0.
    const min = heap[0];

    // Swap root with last element
    // We move the last leaf to the root position to preserve the Complete Binary Tree structure before re-balancing.
    const lastIndex = heap.length - 1;
    [heap[0], heap[lastIndex]] = [heap[lastIndex], heap[0]];

    // Remove last element
    // Now that the minimum element is at the end, we simply pop it off.
    heap.pop();

    // Restore heap property
    // The element currently at index 0 is likely too large to be the root,
    // so we sink it down to its correct position.
    downheapify();

    // Return the original minimum value we saved earlier.
    return min;
}

// Downheapify from root
// This function iteratively moves the node at index 0 down until the heap property is restored.
function downheapify() {
    let i = 0; // Start at the root index
    const n = heap.length; // Cache the length of the heap

    // Loop as long as the current node 'i' has at least a left child.
    // In a complete binary tree, if a node has no left child, it is a leaf.
    const leftIndex = 2 * i + 1;
    while (leftIndex < n) { // while left child exists

        // Assume the current node 'i' is the smallest to start with.
        let minIndex = i;

        // Calculate child indices
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        // Compare with Left Child:
        // Check if left child exists AND is smaller than the current smallest (parent).
        if (left < n && heap[left] < heap[minIndex]) {
            minIndex = left; // Update minIndex to left child
        }

        // Compare with Right Child:
        // Check if right child exists AND is smaller than the current smallest
        // (which could be the parent or the left child at this point).
        if (right < n && heap[right] < heap[minIndex]) {
            minIndex = right; // Update minIndex to right child
        }

        // If the smallest value is NOT the current parent 'i', we need to swap.
        if (minIndex !== i) {
            // Swap the current node with the smaller child to push the larger value down.
            [heap[i], heap[minIndex]] = [heap[minIndex], heap[i]];

            // Move our pointer 'i' to the child's index to continue checking down the tree.
            i = minIndex;
        } else {
            // If minIndex is still 'i', the parent is smaller than both children.
            // The heap property is satisfied. Break the loop.
            break;
        }
    }
}

// Adding elements to simulate a valid Min-Heap state before removal.
// Heap representation: [2, 4, 5, 11, 6, 7, 8, 20]
// Tree view:
//        2
//      /   \
//     4     5
//    / \   / \
//   11  6 7   8
//  /
// 20
heap.push(2, 4, 5, 11, 6, 7, 8, 20);

console.log("Removed min:", remove()); // should remove 2
console.log("Heap after removal:", heap);
// Expected output after removing 2 and rebalancing:
// 1. Swap 2 and 20 -> [20, 4, 5, 11, 6, 7, 8, 2]
// 2. Pop 2 -> [20, 4, 5, 11, 6, 7, 8]
// 3. Downheapify 20:
//    - 20 > 4 (swap with left) -> [4, 20, 5, 11, 6, 7, 8]
//    - 20 > 6 (swap with right child of index 1) -> [4, 6, 5, 11, 20, 7, 8]
//    - Heap Property restored.

/*
 * ==========================================
 * COMPLEXITY ANALYSIS
 * ==========================================
 * * Time Complexity: O(log N)
 * - The remove() operation involves swapping elements and running downheapify().
 * - downheapify() traverses the height of the binary tree.
 * - Since a binary heap is a complete binary tree, the height is log N.
 * - Therefore, the time taken is proportional to the height: O(log N).
 * * Space Complexity: O(1)
 * - The downheapify() function is implemented iteratively using a while loop.
 * - It only uses a constant amount of extra space variables (i, n, minIndex, left, right).
 * - No recursion stack or auxiliary data structures are used.
 * ==========================================
 */
```

```python
# Extraction in Min-Heap
def extract_min(heap):
    if not heap:
        return None
    if len(heap) == 1:
        return heap.pop()

    min_val = heap[0]
    heap[0] = heap.pop()  # Move last element to root

    # Sift Down (Heapify)
    curr = 0
    n = len(heap)
    while True:
        left = 2 * curr + 1
        right = 2 * curr + 2
        smallest = curr

        if left < n and heap[left] < heap[smallest]:
            smallest = left
        if right < n and heap[right] < heap[smallest]:
            smallest = right

        if smallest != curr:
            heap[curr], heap[smallest] = heap[smallest], heap[curr]
            curr = smallest
        else:
            break

    return min_val


# Using Python's built-in heapq module:
# import heapq
# min_val = heapq.heappop(heap)  # O(log N)

h = [1, 5, 3, 7, 9, 8]
print(extract_min(h))  # 1

# Time Complexity: O(log N)
# Space Complexity: O(1)
```

### 3. Min-Heap Class Implementation **O(N), O(N)**
```js
/**
 * ALGORITHM: MIN-HEAP
 * -------------------
 * A Min-Heap is a complete binary tree where the parent node is always
 * smaller than or equal to its children.
 * * Logic:
 * 1. Store elements in an array where for index 'i':
 * - Left Child: 2i + 1
 * - Right Child: 2i + 2
 * - Parent: floor((i-1) / 2)
 * 2. Maintain order during insertion by bubbling up.
 * 3. Maintain order during deletion by bubbling down.
 */

class MinHeap {
    constructor() {
        // Initialize an empty array to store heap elements
        this.heap = [];
    }

    // Get index of parent/children
    // Calculates parent index using the formula (i-1)/2
    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    // Calculates left child index using 2i + 1
    getLeftChildIndex(i) { return 2 * i + 1; }
    // Calculates right child index using 2i + 2
    getRightChildIndex(i) { return 2 * i + 2; }

    // Swap helper
    // Uses ES6 destructuring to swap values at two indices in the array
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Insert a new value
    insert(value) {
        // Add value to the end of the array (maintains complete tree property)
        this.heap.push(value);
        // Move the value up to its correct position to maintain heap property
        this.heapifyUp();
    }

    // Heapify up (fix after insertion)
    heapifyUp() {
        // Start at the last element added
        let index = this.heap.length - 1;
        // While we aren't at the root and the parent is larger than current element
        while (
            index > 0 &&
            this.heap[this.getParentIndex(index)] > this.heap[index]
        ) {
            // Swap the element with its parent
            this.swap(this.getParentIndex(index), index);
            // Move the index pointer to the parent's position
            index = this.getParentIndex(index);
        }
    }

    // Extract minimum (root)
    extractMin() {
        // If heap is empty, return null
        if (this.heap.length === 0) return null;
        // If only one element, just pop and return it
        if (this.heap.length === 1) return this.heap.pop();

        // Store the root value to return later
        const root = this.heap[0];
        // Remove the last element and place it at the root
        this.heap[0] = this.heap.pop(); // Move last to root
        // Sink the new root down to its correct position
        this.heapifyDown();
        return root;
    }

    // Heapify down (fix after removal)
    heapifyDown() {
        let index = 0;

        // Continue as long as the current node has at least a left child
        while (this.getLeftChildIndex(index) < this.heap.length) {
            // Assume the current node is the smallest
            let smallerChildIndex = index;

            // If left child exists and is smaller than current smaller, update smallerChildIndex
            if (
                this.getLeftChildIndex(index) < this.heap.length &&
                this.heap[this.getLeftChildIndex(index)] < this.heap[smallerChildIndex]
            ) {
                smallerChildIndex = this.getLeftChildIndex(index);
            }

            // If right child exists and is smaller than the current smaller, update smallerChildIndex
            if (
                this.getRightChildIndex(index) < this.heap.length &&
                this.heap[this.getRightChildIndex(index)] < this.heap[smallerChildIndex]
            ) {
                smallerChildIndex = this.getRightChildIndex(index);
            }

            // If the current node is already smaller than its smallest child, we are done
            if (this.heap[index] <= this.heap[smallerChildIndex]) {
                break;
            } else {
                // Otherwise, swap and continue descending the tree
                this.swap(index, smallerChildIndex);
            }

            // Move index pointer to the smaller child's position
            index = smallerChildIndex;
        }
    }

    // Peek min element
    // Returns the root of the heap (the minimum) without removing it
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    // Size of heap
    // Returns the total number of elements currently in the heap
    size() {
        return this.heap.length;
    }
}

const minHeap = new MinHeap();
minHeap.insert(10);
minHeap.insert(5);
minHeap.insert(20);
minHeap.insert(1);
minHeap.insert(15);
console.log(minHeap.peek());       // Output: 1 (smallest element)
console.log(minHeap.extractMin()); // Output: 1
console.log(minHeap.extractMin()); // Output: 5
console.log(minHeap.heap);         // Output: [10, 15, 20]

//    10
//   /  \
//  15  20

/**
 * COMPLEXITY ANALYSIS:
 * * Time Complexity:
 * - insert(): O(log n) -> In worst case, we traverse from leaf to root (height of tree).
 * - extractMin(): O(log n) -> In worst case, we traverse from root to leaf.
 * - peek(): O(1) -> Accessing the first element of an array is constant time.
 * - heapifyUp / heapifyDown: O(log n) -> Proportional to the height of the tree.
 * * Space Complexity:
 * - O(n) -> We store 'n' elements in an array.
 */
```

```python
import heapq


# Approach 1: Using Python's built-in heapq
class MinHeapBuiltin:
    def __init__(self):
        self.heap = []

    def push(self, val):
        heapq.heappush(self.heap, val)

    def pop(self):
        return heapq.heappop(self.heap) if self.heap else None

    def peek(self):
        return self.heap[0] if self.heap else None

    def size(self):
        return len(self.heap)


# Approach 2: Manual Class Implementation
class MinHeap:
    def __init__(self):
        self.heap = []

    def push(self, val):
        self.heap.append(val)
        self._bubble_up(len(self.heap) - 1)

    def pop(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._bubble_down(0)
        return root

    def peek(self):
        return self.heap[0] if self.heap else None

    def _bubble_up(self, idx):
        while idx > 0:
            parent = (idx - 1) // 2
            if self.heap[idx] < self.heap[parent]:
                self.heap[idx], self.heap[parent] = self.heap[parent], self.heap[idx]
                idx = parent
            else:
                break

    def _bubble_down(self, idx):
        n = len(self.heap)
        while True:
            left = 2 * idx + 1
            right = 2 * idx + 2
            smallest = idx
            if left < n and self.heap[left] < self.heap[smallest]:
                smallest = left
            if right < n and self.heap[right] < self.heap[smallest]:
                smallest = right
            if smallest != idx:
                self.heap[idx], self.heap[smallest] = self.heap[smallest], self.heap[idx]
                idx = smallest
            else:
                break


# Time Complexity: O(log N) for push and pop, O(1) for peek
# Space Complexity: O(N)
```

### 4. Max-Heap Class Implementation **O(N), O(N)**
```js
/**
 * ALGORITHM EXPLANATION: MaxHeap
 * * A MaxHeap is a specialized binary tree-based data structure that satisfies the "Heap Property":
 * The value of each node must be less than or equal to the value of its parent.
 * Consequently, the largest element is always at the root (index 0).
 * * 1. STORAGE: The heap is implemented using a dynamic array (this.heap).
 * - For any element at index i:
 * - Left Child: 2i + 1
 * - Right Child: 2i + 2
 * - Parent: floor((i - 1) / 2)
 * * 2. INSERTION (heapifyUp):
 * - Add the new value to the end of the array.
 * - Compare the value with its parent. If the value is greater, swap them.
 * - Repeat until the root is reached or the MaxHeap property is restored.
 * * 3. EXTRACTION (extractMax):
 * - Remove the root (the maximum element).
 * - Replace the root with the last element in the array.
 * - Compare the new root with its children. Swap with the larger child if necessary.
 * - Repeat down the tree (heapifyDown) until the property is restored.
 */

class MaxHeap {
  constructor() {
    // Initialize an empty array to store heap elements
    this.heap = [];
  }

  // Get index of parent/children
  // Formula: (index - 1) / 2 (rounded down)
  getParentIndex(i) { return Math.floor((i - 1) / 2); }

  // Formula: 2 * index + 1
  getLeftChildIndex(i) { return 2 * i + 1; }

  // Formula: 2 * index + 2
  getRightChildIndex(i) { return 2 * i + 2; }

  // Swap helper
  // Uses ES6 destructuring to swap values at two indices in the array
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert a new value
  insert(value) {
    // Add value to the very end of the heap array
    this.heap.push(value);
    // Bubble the value up to its correct position
    this.heapifyUp();
  }

  // Heapify up (fix after insertion)
  heapifyUp() {
    // Start at the last index
    let index = this.heap.length - 1;
    // While not at root and parent is smaller than current element
    while (
      index > 0 &&
      this.heap[this.getParentIndex(index)] < this.heap[index] // flipped sign
    ) {
      // Swap with parent
      this.swap(this.getParentIndex(index), index);
      // Move index up to the parent's position for the next iteration
      index = this.getParentIndex(index);
    }
  }

  // Extract maximum (root)
  extractMax() {
    // Return null if heap is empty
    if (this.heap.length === 0) return null;
    // If only one element, just pop and return it
    if (this.heap.length === 1) return this.heap.pop();

    // Store the max value to return later
    const root = this.heap[0];
    // Take the last element and move it to the root position
    this.heap[0] = this.heap.pop(); // Move last to root
    // Sink the new root down to maintain heap property
    this.heapifyDown();
    return root;
  }

  // Heapify down (fix after removal)
  heapifyDown() {
    let index = 0;
    // Continue while the current node has at least a left child
    while (this.getLeftChildIndex(index) < this.heap.length) {
      // Assume the current node is the largest
      let largerChildIndex = index;

      // If left child exists and is greater than current larger, update largerChildIndex
      if (
        this.getLeftChildIndex(index) < this.heap.length &&
        this.heap[this.getLeftChildIndex(index)] > this.heap[largerChildIndex]
      ) {
        largerChildIndex = this.getLeftChildIndex(index);
      }

      // If right child exists and is greater than left child, update largerChildIndex
      if (
        this.getRightChildIndex(index) < this.heap.length &&
        this.heap[this.getRightChildIndex(index)] > this.heap[largerChildIndex]
      ) {
        largerChildIndex = this.getRightChildIndex(index);
      }

      // If current node is already larger than its largest child, we are done
      if (this.heap[index] >= this.heap[largerChildIndex]) {
        break;
      } else {
        // Otherwise, swap and move down the tree
        this.swap(index, largerChildIndex);
      }

      // Move index pointer to the larger child's position
      index = largerChildIndex;
    }
  }

  // Peek max element
  // Returns the root (index 0) without removing it
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Size of heap
  // Returns the number of elements currently in the heap
  size() {
    return this.heap.length;
  }
}

const maxHeap = new MaxHeap();
maxHeap.insert(10);
maxHeap.insert(5);
maxHeap.insert(20);
maxHeap.insert(1);
maxHeap.insert(15);
console.log(maxHeap.peek());        // Output: 20 (largest element)
console.log(maxHeap.extractMax());  // Output: 20
console.log(maxHeap.extractMax());  // Output: 15
console.log(maxHeap.heap);          // Output: [5, 1, 10]

//     5
//   /  \
//  1   10

/**
 * COMPLEXITY ANALYSIS:
 * * TIME COMPLEXITY:
 * - insert(): O(log n) -> In the worst case, we traverse the height of the tree.
 * - extractMax(): O(log n) -> Requires heapifyDown, traversing tree height.
 * - peek(): O(1) -> Simple array access at index 0.
 * - getParent/ChildrenIndex: O(1) -> Basic arithmetic operations.
 * * SPACE COMPLEXITY:
 * - O(n) -> Where n is the number of elements stored in the heap array.
 */
```

```python
import heapq


# Using Python's built-in heapq (by storing negated values)
class MaxHeap:
    def __init__(self):
        self.heap = []

    def push(self, val):
        heapq.heappush(self.heap, -val)

    def pop(self):
        if not self.heap:
            return None
        return -heapq.heappop(self.heap)

    def peek(self):
        return -self.heap[0] if self.heap else None

    def size(self):
        return len(self.heap)


max_h = MaxHeap()
for v in [5, 3, 8, 1, 2]:
    max_h.push(v)
print(max_h.pop())  # 8
print(max_h.pop())  # 5

# Time Complexity: O(log N) for push/pop, O(1) for peek
# Space Complexity: O(N)
```

### 5. Build a Priority Queue | Min-Heap **O(N), O(N)**
```js
/**
 * ALGORITHM EXPLANATION: MIN-HEAP BASED PRIORITY QUEUE
 * ---------------------------------------------------
 * This implementation wraps a MinHeap data structure to provide a Priority Queue interface.
 * * 1. Structure: It uses a complete binary tree (the heap) where every parent node is
 * less than or equal to its children. This ensures the smallest element is always
 * at the root.
 * * 2. Addition (Push): When a value is added, it is placed at the end of the heap and
 * "bubbles up" (compared with parents) to restore the heap property.
 * * 3. Removal (Poll): The root (minimum value) is removed. To maintain tree structure,
 * the last element is moved to the root and "bubbles down" (compared with children)
 * to its correct position.
 * * 4. Priority: In this numeric implementation, lower numbers are treated as higher priority.
 */

// Using the given MinHeap as-is
class PriorityQueue {
  constructor() {
    // Initialize the internal heap storage using the MinHeap class
    this.heap = new MinHeap();
  }

  // Add an item (priority is the numeric value itself)
  add(value) {
    // Delegates the insertion to the heap's insert method (O(log n))
    this.heap.insert(value);
  }

  // Remove and return the smallest (highest-priority) item
  poll() {
    // Extracts and returns the root element while maintaining heap integrity
    return this.heap.extractMin();
  }

  // Look at the smallest item without removing it
  peek() {
    // Accesses the root element of the heap without modifying the structure
    return this.heap.peek();
  }

  // Number of items
  size() {
    // Returns the current count of elements stored in the heap
    return this.heap.size();
  }

  // Optional helper
  isEmpty() {
    // Returns true if the size is zero, otherwise false
    return this.size() === 0;
  }
}

// Instantiate a new priority queue
const pq = new PriorityQueue();

// Insert values; 3 should become the root as it is the minimum
pq.add(10);
pq.add(3);
pq.add(7);

// Output: 3 (The smallest value currently in the queue)
console.log(pq.peek()); // 3

// Output: 3 (Removes 3, heap re-adjusts so 7 becomes the new root)
console.log(pq.poll()); // 3

// Output: 7 (Removes 7, next smallest value)
console.log(pq.poll()); // 7

// Output: 1 (Only the value 10 remains)
console.log(pq.size()); // 1

/**
 * COMPLEXITY ANALYSIS
 * -------------------
 * TIME COMPLEXITY:
 * - add(): O(log n) -> Because we may need to bubble the element up the height of the tree.
 * - poll(): O(log n) -> Because we must bubble the new root down the height of the tree.
 * - peek(): O(1) -> The minimum element is always at the root/index 0.
 * - size(): O(1) -> Usually tracked by a property or array length.
 * * SPACE COMPLEXITY:
 * - O(n) -> Where n is the number of elements stored in the priority queue.
 */
```

```python
import heapq


class PriorityQueue:
    def __init__(self):
        self.heap = []

    def add(self, val):
        heapq.heappush(self.heap, val)

    def poll(self):
        return heapq.heappop(self.heap) if self.heap else None

    def peek(self):
        return self.heap[0] if self.heap else None

    def size(self):
        return len(self.heap)

    def is_empty(self):
        return len(self.heap) == 0


# Time Complexity: O(log N) add/poll, O(1) peek
# Space Complexity: O(N)
```

### 6. Connecting the ropes | Priority Queue **O(N), O(N)**
```
We are given an array that represents the size of different ropes. In a single operation, you can connect two ropes. Cost of connecting two ropes is sum of the length of ropes you are connecting. Find the minimum cost of connecting all the ropes.
```

#### 1. Insertion Sort
```js
/**
 * ALGORITHM: Minimum Cost to Connect Ropes
 * 1. Start with an initial array of rope lengths.
 * 2. Use Insertion Sort to sort the initial array in ascending order.
 * 3. While there is more than one rope in the array:
 * * a. Take the two smallest ropes (the first two elements of the sorted array).
 * * b. Calculate the cost to connect them (sum of the two ropes).
 * * c. Add this connection cost to the total cumulative cost.
 * * d. Remove the two used ropes and insert the new combined rope back into the array.
 * * e. Re-sort the array using a single pass of Insertion Sort to maintain order.
 * 4. Return the total cumulative cost.
 */

function minCostToConnectRopes(ropes) {
    let totalCost = 0;

    // Initial check: if there's only one rope or none, cost is 0
    if (ropes.length <= 1) return 0;

    // Perform an initial Insertion Sort to get the ropes in order
    insertionSort(ropes);

    // Continue connecting until only one rope remains
    while (ropes.length > 1) {
        // Extract the two smallest ropes (always at index 0 and 1)
        let first = ropes.shift(); // Remove the smallest
        let second = ropes.shift(); // Remove the second smallest

        // The cost for this specific connection
        let currentCost = first + second;

        // Add current connection cost to the total running cost
        totalCost += currentCost;

        // Push the new combined rope back into the array
        ropes.push(currentCost);

        // Re-sort the array to ensure the next two smallest are at the front
        // Since only one element is out of order, Insertion Sort is very efficient here
        insertionSort(ropes);
    }

    return totalCost;
}

// Standard Insertion Sort Implementation
function insertionSort(arr) {
    // Iterate through the array starting from the second element
    for (let i = 1; i < arr.length; i++) {
        // Store the current element to be compared
        let key = arr[i];
        let j = i - 1;

        // Move elements of arr[0..i-1] that are greater than key
        // to one position ahead of their current position
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        // Place the key at its correct sorted position
        arr[j + 1] = key;
    }
}

// Test Outputs
const ropes1 = [4, 3, 2, 6];
console.log("Minimum cost for [4, 3, 2, 6]:", minCostToConnectRopes(ropes1));
// Expected: 29 (2+3=5, [4,5,6] -> 4+5=9, [9,6] -> 9+6=15. Total: 5+9+15=29)

const ropes2 = [1, 2, 3, 4, 5];
console.log("Minimum cost for [1, 2, 3, 4, 5]:", minCostToConnectRopes(ropes2));
// Expected: 33

/**
 * TIME COMPLEXITY: O(N^2)
 * The initial insertion sort takes O(N^2). Inside the while loop (which runs N-1 times),
 * we perform another insertion sort. While insertion sort is O(N) for a nearly sorted
 * array (which we have here), the cumulative complexity results in O(N^2).
 * * SPACE COMPLEXITY: O(1)
 * The algorithm sorts the array in-place (or modifies the existing array) and uses
 * a few auxiliary variables, requiring no extra space proportional to the input size.
 */
```

```python
def min_cost_connect_ropes_insertion_sort(ropes):
    if len(ropes) <= 1:
        return 0

    ropes.sort()
    total_cost = 0

    while len(ropes) > 1:
        cost = ropes.pop(0) + ropes.pop(0)
        total_cost += cost

        # Insert cost maintaining sorted order
        inserted = False
        for i in range(len(ropes)):
            if ropes[i] >= cost:
                ropes.insert(i, cost)
                inserted = True
                break
        if not inserted:
            ropes.append(cost)

    return total_cost


print(min_cost_connect_ropes_insertion_sort([4, 3, 2, 6]))  # 29
```

#### 2. Priority Queue
```js
/**
 * -------- Priority Queue (Min-Heap) --------
 * ALGORITHM EXPLANATION:
 * This implementation uses an array-based binary heap.
 * For any element at index i:
 * - Left Child:  2i + 1
 * - Right Child: 2i + 2
 * - Parent:      floor((i - 1) / 2)
 * * The 'Min-Heap Property' ensures the parent is always smaller than its children.
 * * CORE OPERATIONS:
 * 1. Insert (add): Append to end and 'bubbleUp' to restore order.
 * 2. Extract Min (poll): Replace root with last element and 'bubbleDown' to restore order.
 */
class PriorityQueue {
    constructor() {
        // Initialize an empty array to store heap elements
        this.heap = [];
    }

    // Helper: Returns the number of elements in the heap
    size() {
        // Return the current length of the underlying array
        return this.heap.length;
    }

    // Adds a new value and "bubbles up" to maintain heap property
    add(val) { // Insertion operation // O(log n)
        // Add to the end of the array
        this.heap.push(val);
        // Move the newly added element up to its correct position to maintain min-heap property
        this.bubbleUp();
    }

    // Removes and returns the smallest value (root) and "bubbles down"
    poll() { // Extraction operation // O(log n)
        // Handle empty heap case
        if (this.size() === 0) return null;
        // If only one element exists, simply remove and return it
        if (this.size() === 1) return this.heap.pop();

        // Store the root (smallest) value to return later
        const min = this.heap[0];
        // Move the last element in the array to the root position
        this.heap[0] = this.heap.pop();
        // Restore heap property by moving the new root down to its correct position
        this.bubbleDown();
        return min;
    }

    // Restoration: Moves the last element up the tree to its correct position to maintain heap property of min-heap
    bubbleUp() {
        // Start tracking from the last element added
        let index = this.heap.length - 1;
        // Continue until the element reaches the root or finds its place
        while (index > 0) {
            // Calculate parent index: floor((i - 1) / 2)
            let parentIndex = Math.floor((index - 1) / 2);
            // If child is smaller than parent, swap them (Violates Min-Heap property)
            if (this.heap[index] < this.heap[parentIndex]) {
                // Perform ES6 array destructuring swap
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                // Update current index to parent's position for next iteration
                index = parentIndex;
            } else {
                // Property is satisfied; stop bubbling up
                break;
            }
        }
    }

    // Restoration: Moves the root element down the tree to its correct position to maintain heap property of min-heap
    bubbleDown() {
        // Start from the root
        let index = 0;
        const length = this.heap.length;

        while (true) {
            // Calculate child indices
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = null;

            // Compare with left child
            if (left < length) {
                // If left child is smaller than current element, mark for swap
                if (this.heap[left] < this.heap[index]) {
                    swap = left;
                }
            }

            // Compare with right child (must be smaller than both parent and left child)
            if (right < length) {
                if (
                    // Case 1: Right is smaller than parent and no swap with left was planned
                    (swap === null && this.heap[right] < this.heap[index]) ||
                    // Case 2: Right is smaller than the left child
                    (swap !== null && this.heap[right] < this.heap[left])
                ) {
                    swap = right;
                }
            }

            // If no swap index was set, the heap property is restored
            if (swap === null) break;

            // Perform the swap between parent and the smaller child
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];

            // Update index to the child's position to continue the process
            index = swap;
        }
    }
}

/**
 * -------- Minimum cost to connect ropes --------
 * @param {number[]} lengths - array of rope lengths
 * @returns {number} minimum total cost
 *
 * Algorithm Explanation (Greedy Approach):
 * To minimize the total cost, we must always combine the two shortest available ropes.
 * This is because shorter ropes are added to the total sum multiple times if combined early.
 * 1) Push all lengths into a min-heap (O(n log n)).
 * 2) While more than one rope remains:
 * - Pop two smallest (a, b) (O(log n)).
 * - Calculate merge cost = a + b.
 * - Add this merge cost to the running total.
 * - Push (a + b) back to heap to be treated as a new rope (O(log n)).
 * 3) Return total accumulated cost.
 */
function minCostToConnectRopes(lengths) {
    // Edge case: if no ropes or only one, no connection is possible (cost 0)
    if (!Array.isArray(lengths) || lengths.length <= 1) return 0;

    // Instantiate our priority queue
    const pq = new PriorityQueue();

    // Fill the heap with initial rope lengths
    for (const len of lengths) { // for loop runs O(n) times
        pq.add(len); // each add is O(log n)
    }

    let total = 0;
    // Keep merging until only one combined rope remains
    while (pq.size() > 1) { // while loop runs O(n) times
        // Extract the two smallest elements
        const a = pq.poll(); // each poll is O(log n)
        const b = pq.poll(); // each poll is O(log n)
        // The cost for this step is the sum of the two ropes
        const cost = a + b;
        // Accumulate this step's cost into the total
        total += cost;
        // Put the newly merged rope back into the priority queue
        pq.add(cost); // each add is O(log n)
    }

    // Return the total cost of all connections
    return total;
}

console.log(minCostToConnectRopes([])); // 0
console.log(minCostToConnectRopes([8])); // 0 (nothing to connect)

console.log(minCostToConnectRopes([1, 2, 3])); // 9
// Steps:
// 1 + 2 = 3 (cost 3), ropes: [3, 3], Total cost = 3
// 3 + 3 = 6 (cost 6), ropes: [6], Total cost = 3 + 6 = 9

console.log(minCostToConnectRopes([4, 3, 2, 6])); // 29
// Steps:
// 2 + 3 = 5 (cost 5), ropes: [4, 5, 6], Total cost = 5
// 4 + 5 = 9 (cost 9), ropes: [6, 9], Total cost = 5 + 9 = 14
// 6 + 9 = 15 (cost 15), ropes: [15], Total cost = 14 + 15 = 29

console.log(minCostToConnectRopes([1, 2, 5, 10, 35, 89])); // 224
console.log(minCostToConnectRopes([2, 2, 3, 3])); // 20

/**
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(n log n)
 * - Inserting n elements into the heap takes O(n log n).
 * - The while loop runs n-1 times. Inside the loop, `poll()` and `add()`
 * both take O(log n), leading to O(n log n) for the connection phase.
 *
 * * Space Complexity: O(n)
 * - We store all n rope lengths in the priority queue (heap).
 */
```

```python
import heapq


def min_cost_to_connect_ropes(lengths):
    if not lengths or len(lengths) <= 1:
        return 0

    # Using Python's built-in heapq.heapify - O(N)
    heapq.heapify(lengths)
    total = 0

    while len(lengths) > 1:
        a = heapq.heappop(lengths)
        b = heapq.heappop(lengths)
        cost = a + b
        total += cost
        heapq.heappush(lengths, cost)

    return total


print(min_cost_to_connect_ropes([1, 2, 3]))       # 9
print(min_cost_to_connect_ropes([4, 3, 2, 6]))    # 29
print(min_cost_to_connect_ropes([1, 2, 5, 10, 35, 89]))  # 224

# Time Complexity: O(N log N)
# Space Complexity: O(1) in-place or O(N)
```

### 7. Build a Heap from Array **O(N), O(N)**
```
Given an array A of N integers, convert that array into a min heap and return the array.
NOTE: A min heap is a binary tree where every node has a value less than or equal to its children.
```

```js
/* * ==========================================
 * ALGORITHM EXPLANATION: BUILD MIN-HEAP
 * ==========================================
 * * The goal is to transform an arbitrary array into a Binary Min-Heap,
 * where every parent node is less than or equal to its children.
 * * Approach (Floyd's Algorithm / Bottom-Up Construction):
 * 1. Identify the "Last Non-Leaf Node":
 * - In a binary heap represented as an array, leaf nodes do not need
 * to be sifted down because they have no children.
 * - The last non-leaf node is located at index floor(n / 2) - 1.
 * * 2. Iterate Backwards:
 * - We iterate from the last non-leaf node down to the root (index 0).
 * - For each node, we treat it as the root of a small sub-tree and
 * perform a "Sift Down" (or Heapify) operation.
 * * 3. Sift Down (Heapify):
 * - Compare the current node (parent) with its left and right children.
 * - Find the smallest value among the three.
 * - If the smallest value is not the parent, swap the parent with the
 * smallest child.
 * - Repeat the process at the new position of the parent until the
 * heap property is satisfied or a leaf is reached.
 * * By processing sub-trees from the bottom up, we ensure that when we
 * reach the root, the entire structure satisfies the heap property.
 */

/**
 * Build a min-heap in-place from array A.
 * Time:  O(n)
 * Space: O(1) extra (in-place)
 *
 * @param {number[]} A
 * @returns {number[]} A transformed into a min-heap (array form)
 */
function buildMinHeap(A) {
  // Get the total number of elements in the array
  const n = A.length;

  // Start from the last non-leaf and sift down to index 0
  // Formula: floor(n / 2) - 1. Nodes after this index are leaves.
  const lastNonLeaf = Math.floor(n / 2) - 1;

  // Iterate backwards from the last internal node up to the root
  for (let parent = lastNonLeaf; parent >= 0; parent--) {
    // Apply the siftDown operation to fix the heap property for the sub-tree rooted at 'parent'
    siftDown(A, parent, n);
  }

  // Return the mutated array which is now a valid Min-Heap
  return A;
}

/**
 * Restore min-heap property at index `parent` by pushing it down.
 * Chooses the smaller of the two children to swap with.
 */
function siftDown(heap, parent, heapSize) {
  // Continue swapping down until the element is in the correct spot or hits a leaf
  while (true) {
    // Calculate indices for left and right children
    // Left child index: 2 * i + 1
    const left  = 2 * parent + 1;
    // Right child index: 2 * i + 2 (or left + 1)
    const right = left + 1;

    // Assume the current parent is the smallest to start
    let smallest = parent;

    // Compare with Left Child:
    // Check if left child exists AND is smaller than current smallest
    if (left < heapSize && heap[left] < heap[smallest])  smallest = left;

    // Compare with Right Child:
    // Check if right child exists AND is smaller than current smallest
    if (right < heapSize && heap[right] < heap[smallest]) smallest = right;

    // Check if the heap property is already satisfied (parent is smaller than both children)
    if (smallest === parent) break; // heap property satisfied

    // Swap the parent with the smallest child to push the larger value down
    [heap[parent], heap[smallest]] = [heap[smallest], heap[parent]];

    // Update the parent index to the child's index we just swapped with
    // This allows us to continue checking the next level down in the next iteration
    parent = smallest; // continue sifting down
  }
}

//

const A = [5, 13, -2, 11, 27, 31, 0, 19];
console.log(buildMinHeap(A)); // e.g. [-2, 5, 0, 11, 13, 31, 27, 19]

/*
 * ==========================================
 * COMPLEXITY ANALYSIS
 * ==========================================
 * * Time Complexity: O(n)
 * - While siftDown takes O(log n) time, buildMinHeap calls it on n/2 nodes.
 * - However, nodes at the bottom have height 0, and nodes at the top have height log n.
 * - The mathematical series sums to a linear bound O(n), making it more efficient
 * than inserting elements one by one into a heap (which would be O(n log n)).
 * * Space Complexity: O(1)
 * - The algorithm performs the heap construction in-place.
 * - No additional data structures (like a new array) are allocated relative to input size.
 */
```

```python
def heapify(arr, n, i):
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] < arr[smallest]:
        smallest = left
    if right < n and arr[right] < arr[smallest]:
        smallest = right

    if smallest != i:
        arr[i], arr[smallest] = arr[smallest], arr[i]
        heapify(arr, n, smallest)


def build_min_heap(arr):
    n = len(arr)
    # Start from last non-leaf node down to root
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    return arr


# Alternatively, using Python built-in:
# import heapq
# heapq.heapify(arr)  # In-place O(N)

print(build_min_heap([5, 13, -2, 11, 27, 31, 0, 19]))

# Time Complexity: O(N)
# Space Complexity: O(1) auxiliary
```

### 8. Heap Queries | Min-Heap **O(N), O(N)**
```
You have an empty min heap. You are given an array A consisting of N queries. Let P denote A[i][0] and Q denote A[i][1].
There are two types of queries:
P = 1, Q = -1 : Pop the minimum element from the heap.
P = 2, 1 <= Q <= 109 : Insert Q into the heap.

Return an integer array containing the answer for all the extract min operation. If the size of heap is 0, then extract min should return -1.
```

```js
/**
 * ALGORITHM EXPLANATION:
 * This code implements a Min-Heap data structure and a query processing system.
 * * 1. Min-Heap Logic:
 * - The heap is stored as an array where for any index i, the children are at
 * 2i+1 and 2i+2.
 * - Sift-Up: When adding an element, it is placed at the end and "bubbles up"
 * by swapping with its parent until the heap property (parent <= child) is restored.
 * - Sift-Down: When removing the root, the last element is moved to the root
 * and "bubbles down" by swapping with its smallest child to restore the property.
 * * 2. Query Logic (heapQueries):
 * - Type 1 Query [1, -1]: Performs a 'pop' operation. If the heap is empty,
 * it returns -1; otherwise, it returns the minimum value.
 * - Type 2 Query [2, Q]: Performs a 'push' operation, adding value Q to the heap.
 */

/**
 * Min-heap for numbers (array-backed).
 * push: O(log n), pop: O(log n), peek: O(1)
 */
class MinHeap {
  constructor() {
    // Internal array to store heap elements
    this.h = [];
  }

  // Returns the number of elements in the heap
  size() { return this.h.length; }

  // Returns the smallest element without removing it
  peek() { return this.h[0]; }

  push(x) {
    // Add the new element to the end of the array
    this.h.push(x);
    // Restore heap property by moving the element up to its correct position
    this.siftUp(this.h.length - 1);
  }

  pop() {
    const n = this.h.length;
    // Return undefined if the heap is empty
    if (n === 0) return undefined;
    // If only one element exists, just remove and return it
    if (n === 1) return this.h.pop();

    // Store the root (minimum) value to return later
    const min = this.h[0];
    // Move the last element to the root position
    this.h[0] = this.h.pop();
    // Restore heap property by moving the new root down to its correct position
    this.siftDown(0);
    return min;
  }

  siftUp(i) {
    // Continue moving up until the root is reached
    while (i > 0) {
      // Calculate the parent index using the formula (i-1)/2
      const parent = Math.floor((i - 1) / 2);
      // If the parent is already smaller or equal, the heap property is satisfied
      if (this.h[parent] <= this.h[i]) break;
      // Swap the current element with its parent
      [this.h[parent], this.h[i]] = [this.h[i], this.h[parent]];
      // Update the current index to the parent's index
      i = parent;
    }
  }

  siftDown(i) {
    const n = this.h.length;
    while (true) {
      // Calculate indices for left and right children
      const left = 2 * i + 1;
      const right = left + 1;
      let smallest = i;

      // Check if left child exists and is smaller than the current element
      if (left < n && this.h[left] < this.h[smallest]) smallest = left;
      // Check if right child exists and is smaller than the current smallest
      if (right < n && this.h[right] < this.h[smallest]) smallest = right;

      // If the smallest is still the current index, the heap property is satisfied
      if (smallest === i) break;
      // Swap the current element with the smallest of its children
      [this.h[i], this.h[smallest]] = [this.h[smallest], this.h[i]];
      // Update the current index to the child's index to continue sifting
      i = smallest;
    }
  }
}

/**
 * Process heap queries.
 *
 * @param {number[][]} A - queries as [P, Q]
 * @returns {number[]} results of all extract-min operations (or -1 if empty)
 */
function heapQueries(A) {
  // Initialize a new MinHeap instance
  const heap = new MinHeap();
  // Array to collect results from pop operations
  const result = [];

  // Iterate through each query in the input array
  for (const [P, Q] of A) {
    // If P is 1 and Q is -1, it's an extract-min (pop) operation
    if (P === 1 && Q === -1) {
      const minValue = heap.pop();
      // Push -1 to results if heap was empty, otherwise push the min value
      result.push(minValue === undefined ? -1 : minValue);
    }
    // If P is 2 and Q is positive, it's an insert (push) operation
    else if (P === 2 && Q >= 1) {
      heap.push(Q);
    }
  }
  // Return the accumulated results of all extract-min operations
  return result;
}

// Test Case 1: Initial pop (empty), push 2, push 1, pop (returns 1)
console.log(heapQueries([[1, -1], [2, 2], [2, 1], [1, -1]]));          // [-1, 1]

// Test Case 2: Push 5, 3, 1, then pop twice (returns 1 then 3)
console.log(heapQueries([[2, 5], [2, 3], [2, 1], [1, -1], [1, -1]]));   // [1, 3]

/**
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(M * log N)
 * - M is the number of queries in the input array A.
 * - Each push/pop operation on the heap takes O(log N) time, where N is the current
 * number of elements in the heap.
 * * Space Complexity: O(N + M)
 * - O(N) to store the elements within the MinHeap array.
 * - O(M) in the worst case for the 'result' array if every query is a pop operation.
 */
```

```python
import heapq


def process_heap_queries(queries):
    heap = []
    results = []

    for q in queries:
        op = q[0]
        if op == 1:
            # Insert
            heapq.heappush(heap, q[1])
        elif op == 2:
            # Extract min
            results.append(heapq.heappop(heap) if heap else -1)
        elif op == 3:
            # Get min
            results.append(heap[0] if heap else -1)

    return results


# Time Complexity: O(Q log N)
# Space Complexity: O(N)
```

## 2. Heap Sort & Greedy

### 1. Build a min-heap from an array | Down-Heapify-Min **O(N), O(N)**
```js
/**
 * ==========================================
 * ALGORITHM EXPLANATION: BUILD MIN-HEAP
 * ==========================================
 * * 1. CONCEPT:
 * A Min-Heap is a complete binary tree where the value of every node is less than
 * or equal to the values of its children. In an array representation:
 * - For a node at index i:
 * - Left Child is at index: 2*i + 1
 * - Right Child is at index: 2*i + 2
 * - Parent is at index: floor((i-1) / 2)
 * * 2. BUILDING THE HEAP (Floyd's Algorithm):
 * Rather than inserting elements one by one (which takes O(n log n)), we optimize
 * by treating the existing array as a heap that needs fixing.
 * * - We iterate backwards from the last non-leaf node up to the root (index 0).
 * - Leaf nodes (the bottom half of the array) already satisfy the heap property
 * trivially because they have no children.
 * - For every internal node, we perform a "sift-down" (or down-heapify) operation.
 * * 3. DOWN-HEAPIFY (SIFT-DOWN):
 * This process pushes a node down the tree until it sits in a valid position
 * relative to its descendants.
 * - Compare the current node with its left and right children.
 * - Find the smallest value among the three (parent, left, right).
 * - If the parent is not the smallest, swap it with the smallest child.
 * - Repeat the process at the new child position until the heap property is restored
 * or the node becomes a leaf.
 * * 4. RESULT:
 * The array is transformed in-place into a valid Min-Heap.
 * The smallest element is guaranteed to be at index 0.
 */

/**
 * Index helpers for array-heap representation
 */
// Calculate the parent index of a given child index i
// Note: This helper is provided for completeness but not strictly used in the build/down-heap process
const parent = (i) => Math.floor((i - 1) / 2);

// Calculate the left child index of a given parent index i
// Formula: 2*i + 1 maps the 0-indexed array to binary tree structure
const left = (i) => 2 * i + 1;

// Calculate the right child index of a given parent index i
// Formula: 2*i + 2 maps the 0-indexed array to binary tree structure
const right = (i) => 2 * i + 2;

/**
 * In-place build of a MIN-HEAP from array `arr`
 * Time:  O(n)  |  Space: O(1)
 */
function buildMinHeap(arr) {
    const n = arr.length; // Get the total number of elements

    // Start from the last non-leaf node and push violations down
    // Nodes from index n/2 to n-1 are leaves and are already trivial heaps.
    // We calculate the start index using floor((n - 2) / 2) effectively finding the parent of the last element.
    const lastNonLeaf = Math.floor((n - 2) / 2);
    for (let i = lastNonLeaf; i >= 0; i--) {

        // Fix the min-heap property for subtree rooted at i.
        // As we move backwards (i--), we ensure that every subtree we visit becomes a valid heap.
        downHeapifyMin(arr, i, n);
    }

    return arr; // convenient chaining, though array is modified by reference
}

/**
 * Sift-down for MIN-HEAP in range [0, heapSize)
 */
function downHeapifyMin(arr, i, heapSize) {
    // We use a while loop for an iterative approach to save stack space (vs recursion)
    while (true) {
        let smallest = i; // Assume current node (root of this subtree) is the smallest
        const leftChildIndex = left(i), rightChildIndex = right(i); // Calculate children indices using helpers

        // Check if left child exists (leftChildIndex < heapSize) AND if it is smaller than the current smallest
        // If true, the left child is the new candidate for smallest
        if (leftChildIndex < heapSize && arr[leftChildIndex] < arr[smallest]) smallest = leftChildIndex;

        // Check if right child exists (rightChildIndex < heapSize) AND if it is smaller than the current smallest
        // If true, the right child is the new candidate for smallest
        if (rightChildIndex < heapSize && arr[rightChildIndex] < arr[smallest]) smallest = rightChildIndex;

        // If the smallest is still the current node, the heap property is satisfied for this node
        // No further updates are needed for this path
        if (smallest === i) break;

        // Swap the current node with the smallest child to fix violation.
        // This pushes the larger value down and brings the smaller value up.
        [arr[i], arr[smallest]] = [arr[smallest], arr[i]];

        // Move current index to the child's position (where we just swapped)
        // to continue sifting down the element we just pushed down.
        i = smallest;
    }
}

// Initial unsorted array
const input = [8, 10, 1, 6, 12, 19, 15, 3, 7];

// Build MIN-HEAP
const minHeapArr = [...input]; // Create a shallow copy to preserve input for comparison
buildMinHeap(minHeapArr); // Transform array into min-heap in-place

// Output the result
console.log("MIN-HEAP (array):", minHeapArr);
// Expected Output: [ 1, 3, 8, 6, 12, 19, 15, 10, 7 ] (or similar valid heap structure)

/**
 * ==========================================
 * COMPLEXITY ANALYSIS
 * ==========================================
 * * 1. TIME COMPLEXITY: O(n)
 * - The `downHeapifyMin` function takes O(h) time, where h is the height of the node.
 * - In `buildMinHeap`, we run this for n/2 nodes.
 * - However, most nodes are near the bottom (height 0 or 1). Only the root is at max height.
 * - The sum of heights in a complete binary tree converges to O(n) (specifically bounded by 2n).
 * - Therefore, building a heap is a linear time operation, strictly more efficient than O(n log n).
 * * 2. SPACE COMPLEXITY: O(1)
 * - The algorithm sorts the array in-place.
 * - We use an iterative `while` loop in `downHeapifyMin` instead of recursion,
 * so there is no additional call stack memory overhead.
 * - Only a few auxiliary variables (smallest, leftChildIndex, rightChildIndex) are used.
 */
```

```python
import heapq


def build_min_heap_array(arr):
    # Using built-in heapq.heapify
    heapq.heapify(arr)
    return arr


print(build_min_heap_array([9, 4, 7, 1, -2, 6, 5]))
```

### 2. Build a max-heap from an array | Down-Heapify-Max **O(N), O(N)**
```js
/*
 * ALGORITHM EXPLANATION:
 * 1. Build Heap (Bottom-Up Approach):
 * - We treat the input array as a Complete Binary Tree.
 * - Leaf nodes (the bottom layer) already satisfy the heap property trivially because they have no children.
 * - We start fixing the heap property from the *last non-leaf node* up to the root (index 0).
 * - The index of the last non-leaf node is calculated as floor((n - 2) / 2).
 *
 * 2. Down-Heapify (Sift-Down):
 * - This function ensures the subtree rooted at a specific index 'i' satisfies the Max-Heap property.
 * - It compares the node at 'i' with its left and right children.
 * - If the node is smaller than the largest of its children, it is swapped with that child.
 * - The process continues iteratively at the new position of the node until it is larger than its children or becomes a leaf.
 *
 * This method is generally preferred over inserting elements one by one because it runs in O(n) time.
 */

/**
 * Index helpers for array-heap representation
 */
// Calculate the parent index of a given child index i
const parent = (i) => Math.floor((i - 1) / 2);
// Calculate the left child index of a given parent index i
const left = (i) => 2 * i + 1;
// Calculate the right child index of a given parent index i
const right = (i) => 2 * i + 2;

/**
 * In-place build of a MAX-HEAP from array `arr`
 * Time:  O(n)  |  Space: O(1)
 */
function buildMaxHeap(arr) {
    const n = arr.length; // Get the total number of elements

    // Iterate from the last non-leaf node up to the root.
    // We start at floor((n - 2) / 2) because indices greater than this are leaf nodes
    // and do not need to be heapified downwards.
    const lastNonLeaf = Math.floor((n - 2) / 2);
    for (let i = lastNonLeaf; i >= 0; i--) {
        // Apply the sift-down logic to the current node 'i' to ensure the subtree
        // rooted at 'i' follows max-heap rules.
        downHeapifyMax(arr, i, n); // Fix the max-heap property for subtree at i
    }

    return arr; // Return the mutated array which is now a valid max-heap
}

/**
 * Sift-down for MAX-HEAP in range [0, heapSize)
 */
function downHeapifyMax(arr, i, heapSize) {
    // Loop indefinitely; we will break out manually when the heap property is satisfied
    // or we hit the bottom of the tree.
    while (true) {
        let largest = i; // Assume current node is the largest
        const leftChildIndex = left(i), rightChildIndex = right(i); // Calculate children indices using helper functions

        // Check if the left child exists (leftChildIndex < heapSize) AND if it is greater than the current largest node.
        // If true, update 'largest' to point to the left child index.
        if (leftChildIndex < heapSize && arr[leftChildIndex] > arr[largest]) largest = leftChildIndex;

        // Check if the right child exists (rightChildIndex < heapSize) AND if it is greater than the current largest node.
        // If true, update 'largest' to point to the right child index.
        if (rightChildIndex < heapSize && arr[rightChildIndex] > arr[largest]) largest = rightChildIndex;

        // If the largest index is still the original 'i', it means the parent is larger
        // than both children (or it has no children). The heap property is satisfied.
        if (largest === i) break;

        // Swap the current node (arr[i]) with the largest child (arr[largest]).
        // This moves the smaller value down the tree.
        [arr[i], arr[largest]] = [arr[largest], arr[i]];

        // Update 'i' to the 'largest' index.
        // We must now continue sifting down from this new position to ensure
        // the node fits in its new subtree.
        i = largest;
    }
}

// Initial unsorted array
const input = [8, 10, 1, 6, 12, 19, 15, 3, 7];

// Build MAX-HEAP
const maxHeapArr = [...input]; // Create a shallow copy using spread syntax to avoid mutating original 'input'
buildMaxHeap(maxHeapArr); // Transform array into max-heap in-place
console.log("MAX-HEAP (array):", maxHeapArr);
// Expected Output: [ 19, 12, 15, 7, 10, 1, 8, 3, 6 ] (Structure may vary slightly depending on swaps, but root must be 19)

/*
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(n)
 * - Although heapify is O(log n), buildMaxHeap performs fewer operations for nodes
 * closer to the bottom. The mathematical summation converges to O(n) (linear time).
 * * Space Complexity: O(1)
 * - The algorithm sorts the heap in-place.
 * - The iterative implementation of downHeapifyMax avoids the stack space overhead
 * of recursion.
 */
```

```python
def max_heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        max_heapify(arr, n, largest)


def build_max_heap(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        max_heapify(arr, n, i)
    return arr


print(build_max_heap([1, 3, 5, 4, 6, 13, 10, 9, 8, 15, 17]))

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 3. Sort an Array | Heap Sort **O(N), O(N)**
```js
/**
 * ==========================================
 * ALGORITHM EXPLANATION: HEAPSORT
 * ==========================================
 * Heapsort is a comparison-based sorting technique based on a Binary Heap data structure.
 * It is similar to selection sort where we first find the maximum element and place
 * the maximum element at the end. We repeat the same process for the remaining elements.
 *
 * The algorithm divides into two main phases:
 *
 * 1. Build Max Heap:
 * - Treat the array as a Complete Binary Tree.
 * - Iterate from the last non-leaf node up to the root (index 0).
 * - Apply 'downHeapify' (or sift-down) on each node to ensure the Max-Heap
 * property holds (parent node >= children nodes).
 * - After this phase, the largest element is at the root (index 0).
 *
 * 2. Extraction and Sorting:
 * - Swap the root (largest value) with the last element of the heap.
 * - Decrease the heap size by 1 (effectively "locking" the largest element in its sorted position).
 * - Call 'downHeapify' on the new root to restore the Max-Heap property.
 * - Repeat until the heap size is 1.
 * ==========================================
 */

/**
 * Heapsort Algorithm in JavaScript
 *
 * Time Complexity:  O(n log n)
 * Space Complexity: O(1) (in-place)
 * Not a stable sort (equal elements may change relative order).
 */

function heapSort(arr) {
    // Capture the total number of elements to determine heap bounds
    const n = arr.length;

    console.log("--- Initial Array ---"); // LOG
    console.log(`[${arr.join(", ")}]\n`); // LOG

    // Step 1: Build a Max Heap
    // Start from the last non-leaf node (index = (n-2)/2) down to root
    // Ensures that the array satisfies the heap property

    console.log("--- Phase 1: Building Max Heap ---"); // LOG

    // We start from Math.floor((n - 2) / 2) because indices greater than this are leaf nodes
    // and inherently satisfy the heap property (as they have no children).
    const lastNonLeaf = Math.floor((n - 2) / 2);
    for (let i = lastNonLeaf; i >= 0; i--) {
        // 'Sink' the current node 'i' down to its correct position to form a valid sub-heap
        downHeapify(arr, i, n);
    }

    console.log("Max Heap Constructed: [" + arr.join(", ") + "]\n"); // LOG

    // Step 2: Extract elements one by one from the heap
    // Move the current max (root) to the end of the array
    // Reduce heap size by 1, then restore max-heap property

    console.log("--- Phase 2: Extraction & Sorting ---"); // LOG

    for (let end = n - 1; end > 0; end--) {
        // The element at arr[0] is guaranteed to be the maximum of the current heap.
        // Swap it with the element at the current 'end' index.

        console.log(`Swap Root (${arr[0]}) with End (${arr[end]}) -> Lock index ${end}`); // LOG

        swap(arr, 0, end);         // Place max at the correct position

        console.log(`   Array state: [${arr.join(", ")}]`); // LOG

        // After swapping, the value at arr[0] is likely smaller than its children, breaking the heap property.
        // We call downHeapify on the root (index 0) considering the new heap size (which is 'end').
        downHeapify(arr, 0, end);  // Restore max-heap property for reduced heap
    }
}

/**
 * Restores the heap property by moving an element downwards
 * (used after building heap or swapping root with last element).
 *
 * @param {number[]} a - The array representing the heap
 * @param {number} i - Index to start heapifying from
 * @param {number} heapSize - The current effective size of heap
 */
function downHeapify(a, i, heapSize) {
    // Loop until the node reaches a position where it is larger than its children or becomes a leaf
    while (true) {
        let largest = i;                   // Assume current node is largest
        const leftChildIndex = 2 * i + 1;            // Calculate Left child index (standard binary heap formula)
        const rightChildIndex = 2 * i + 2;           // Calculate Right child index

        // Compare with left child:
        // 1. Check if left child exists (index < heapSize)
        // 2. Check if left child is greater than the current 'largest' node
        if (leftChildIndex < heapSize && a[leftChildIndex] > a[largest]) {
            largest = leftChildIndex; // Update largest to left child
        }

        // Compare with right child:
        // 1. Check if right child exists (index < heapSize)
        // 2. Check if right child is greater than the current 'largest' node (which could be parent or left child)
        if (rightChildIndex < heapSize && a[rightChildIndex] > a[largest]) {
            largest = rightChildIndex; // Update largest to right child
        }

        // If parent is larger than both children, the heap property is satisfied.
        // We can stop the process.
        if (largest === i) break;

        // Else, swap parent with the larger child to push the smaller value down
        swap(a, i, largest);

        // Update 'i' to the child's index where we just swapped the value.
        // We continue the loop to check if this value needs to sink further down.
        i = largest; // Move downwards
    }
}

/**
 * Utility function to swap two elements in an array
 */
function swap(a, i, j) {
    // Use ES6 Destructuring assignment to swap values at indices i and j
    [a[i], a[j]] = [a[j], a[i]];
}

// Initialize an unsorted array for testing
let arr = [13, 7, 6, 10, 5, 2, 1, 9, 14];

// Execute the Heapsort function
heapSort(arr);

// Output the sorted result
console.log("\n--- Final Result ---"); // LOG
console.log("Sorted:", arr); // [1, 2, 5, 6, 7, 9, 10, 13, 14]

/**
 * ==========================================
 * COMPLEXITY ANALYSIS
 * ==========================================
 *
 * Time Complexity:
 * - Best Case: O(n log n) - Even if sorted, we build heap and extract.
 * - Average Case: O(n log n)
 * - Worst Case: O(n log n)
 * Explanation: Building the heap takes O(n). The extraction phase involves n-1 calls
 * to downHeapify, each taking O(log n) (the height of the tree).
 * Total = O(n) + O(n log n) ≈ O(n log n).
 *
 * Space Complexity:
 * - O(1) Auxiliary Space
 * Explanation: The sorting happens in-place within the input array.
 * No additional data structures are allocated proportional to input size.
 * ==========================================
 */
```

```python
def heap_sort(arr):
    n = len(arr)

    # Step 1: Build max heap
    for i in range(n // 2 - 1, -1, -1):
        max_heapify(arr, n, i)

    # Step 2: Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        max_heapify(arr, i, 0)

    return arr


print(heap_sort([12, 11, 13, 5, 6, 7]))  # [5, 6, 7, 11, 12, 13]

# Time Complexity: O(N log N)
# Space Complexity: O(1)
```

### 4. Median of a Stream | Max-Heap & Min-Heap **O(N), O(N)**
To efficiently calculate median while numbers stream in:
- Use **Max-Heap** for lower half means for smaller numbers
- Use **Min-Heap** for upper half means for larger numbers
- Balance heap sizes (difference ≤ 1)

```
Max-Heap (Lower): [10, 8, 5]
Min-Heap (Upper): [12, 15, 20]

Median = (10 + 12) / 2 = 11
```

```js
/* * ALGORITHM EXPLANATION:
 * ----------------------
 * 1. Data Structure:
 * - Two heaps are used to divide the stream into two halves.
 * - 'low' (MaxHeap) stores the smaller half of numbers.
 * - 'high' (MinHeap) stores the larger half of numbers.
 * * 2. Insertion (addNum):
 * - We first try to place the number in the correct heap based on value.
 * - Then we REBALANCE: We ensure the size difference between heaps is <= 1.
 * If one heap grows too large, we pop its root and push it to the other.
 * * 3. Retrieval (findMedian):
 * - If sizes are equal (even total elements), the median is the average of both roots.
 * - If sizes differ (odd total elements), the median is the root of the larger heap.
 */

class MinHeap {
    constructor() { this.h = []; } // store heap as array

    size() { return this.h.length; }          // number of elements
    peek() { return this.h[0] ?? null; }      // return min element without removing

    insert(x) {
        this.h.push(x);               // add element at the end
        this.up(this.h.length - 1);   // restore heap property (bubble up)
    }

    extractMin() {
        if (!this.h.length) return null;        // empty heap check
        if (this.h.length === 1) return this.h.pop(); // only one element, return it

        const root = this.h[0];                 // store min element
        this.h[0] = this.h.pop();               // move last element to root
        this.down(0);                           // restore heap property (bubble down)
        return root;
    }

    // Bubble-up (fix heap upwards)
    up(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);    // parent index
            if (this.h[p] <= this.h[i]) break;    // parent already smaller, stop
            [this.h[p], this.h[i]] = [this.h[i], this.h[p]]; // swap with parent
            i = p;
        }
    }

    // Bubble-down (fix heap downwards)
    down(i) {
        const n = this.h.length;
        while (true) {
            let s = i, l = 2 * i + 1, r = 2 * i + 2; // left & right children
            if (l < n && this.h[l] < this.h[s]) s = l; // pick smaller child (left)
            if (r < n && this.h[r] < this.h[s]) s = r; // pick smaller child (right)
            if (s === i) break;                     // heap property satisfied
            [this.h[i], this.h[s]] = [this.h[s], this.h[i]]; // swap
            i = s;
        }
    }
}

class MaxHeap {
    constructor() { this.h = []; }

    size() { return this.h.length; }
    peek() { return this.h[0] ?? null; }

    insert(x) {
        this.h.push(x);
        this.up(this.h.length - 1); // restore max-heap property
    }

    extractMax() {
        if (!this.h.length) return null;
        if (this.h.length === 1) return this.h.pop();

        const root = this.h[0];
        this.h[0] = this.h.pop(); // move last element to root
        this.down(0);             // restore heap property
        return root;
    }

    // Bubble-up (fix heap upwards)
    up(i) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.h[p] >= this.h[i]) break; // parent already larger, stop
            [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
            i = p;
        }
    }

    // Bubble-down (fix heap downwards)
    down(i) {
        const n = this.h.length;
        while (true) {
            let s = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && this.h[l] > this.h[s]) s = l; // pick larger child (left)
            if (r < n && this.h[r] > this.h[s]) s = r; // pick larger child (right)
            if (s === i) break;
            [this.h[i], this.h[s]] = [this.h[s], this.h[i]];
            i = s;
        }
    }
}

/**
 * MedianFinder
 * - Maintains a running median from a stream of numbers.
 * - Uses a MaxHeap for the lower half and MinHeap for the upper half.
 */
class MedianFinder {
    constructor() {
        this.low = new MaxHeap();  // stores smaller half (max at root)
        this.high = new MinHeap(); // stores larger half (min at root)
    }

    addNum(num) {
        // Decide where to put the number
        // If low is empty OR number is smaller than max of low, it belongs in low
        if (!this.low.size() || num <= this.low.peek()) {
            this.low.insert(num);
        } else {
            // Otherwise it belongs in the upper half
            this.high.insert(num);
        }

        // Balance sizes so that difference ≤ 1
        // If low has more than 1 extra element than high, move max of low -> high
        if (this.low.size() > this.high.size() + 1) {
            this.high.insert(this.low.extractMax());
        }
        // If high has more than 1 extra element than low, move min of high -> low
        else if (this.high.size() > this.low.size() + 1) {
            this.low.insert(this.high.extractMin());
        }
    }

    findMedian() {
        // If both heaps have equal size → average of roots
        if (this.low.size() === this.high.size()) {
            return (this.low.peek() + this.high.peek()) / 2;
        }

        // Else, median is the root of the bigger size heap
        return this.low.size() > this.high.size() ? this.low.peek() : this.high.peek();
    }
}

// Example usage
let mf = new MedianFinder();
[9, 6, 3, 10, 4].forEach(x => {
    mf.addNum(x);
    console.log(`Added ${x}, Median:`, mf.findMedian());
});

/*
 * TEST OUTPUTS:
 * Added 9, Median: 9       (low:[9], high:[])
 * Added 6, Median: 7.5     (low:[6], high:[9]) -> Average (6+9)/2
 * Added 3, Median: 6       (low:[6,3], high:[9]) -> Max of low is 6
 * Added 10, Median: 7.5    (low:[6,3], high:[9,10]) -> Average (6+9)/2
 * Added 4, Median: 6       (low:[6,4,3], high:[9,10]) -> Max of low is 6
 */

/*
 * COMPLEXITY ANALYSIS:
 * --------------------
 * Time Complexity:
 * - addNum(x): O(log N)
 * Insertion into a heap is O(log N). Rebalancing extracts and inserts,
 * which is also O(log N).
 * - findMedian(): O(1)
 * Accessing the root (peek) of a heap is constant time.
 * Total time complexity of MedianFinder operations is O(N log N) for N insertions.
 * Overall, each insertion and median retrieval is efficient.
 *
 * * Space Complexity:
 * - O(N)
 * We store every element of the stream exactly once across the two heaps.
 */
```

```python
import heapq


class MedianFinder:
    def __init__(self):
        # low stores smaller half as max-heap (negated values)
        self.low = []
        # high stores larger half as min-heap
        self.high = []

    def add_num(self, num: int) -> None:
        if not self.low or num <= -self.low[0]:
            heapq.heappush(self.low, -num)
        else:
            heapq.heappush(self.high, num)

        # Balance heaps: len(low) can be at most 1 greater than len(high)
        if len(self.low) > len(self.high) + 1:
            heapq.heappush(self.high, -heapq.heappop(self.low))
        elif len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2.0


mf = MedianFinder()
for x in [5, 15, 1, 3]:
    mf.add_num(x)
    print(f"Added {x}, Median: {mf.find_median()}")
# Added 5, Median: 5.0
# Added 15, Median: 10.0
# Added 1, Median: 5.0
# Added 3, Median: 4.0

# Time Complexity: O(log N) per insertion, O(1) for median
# Space Complexity: O(N)
```

### 5. Activity Selection Problem / Finish Maximum Jobs | Greedy Algorithm **O(N), O(N)**
- Given start and end times, select max number of non-overlapping activities.
- **Strategy**: Sort by end times, then pick compatible ones.

```
Activities: (1,2), (2,3), (3,6), (6,7), (8,9)
Selected:   (1,2), (3,6), (6,7), (8,9)
```

```js
/**
 * Activity Selection Problem (a.k.a Finish Maximum Jobs)
 *
 * Goal:
 * - Given start and end times of activities, select the maximum number
 *   of non-overlapping activities.
 *
 * Strategy:
 * - Sort activities by their finishing time (earliest first).
 * - Always pick the first activity that ends earliest.
 * - For each subsequent activity, if its start time is >= end time of
 *   the last selected activity, then select it.
 *
 * Time Complexity:  O(n log n) (due to sorting)
 * Space Complexity: O(1) extra (excluding output array)
 */

function activitySelection(intervals) {
    // Step 1: Sort activities by their end times
    intervals.sort((a, b) => a.end - b.end);

    let chosen = [];       // list of selected activities
    let lastEnd = -Infinity; // track end time of last chosen activity

    // Step 2: Iterate through activities
    for (let it of intervals) {
        // If this activity starts after or when the last one ended
        if (it.start >= lastEnd) {
            chosen.push(it);     // choose this activity
            lastEnd = it.end;    // update lastEnd
        }
    }

    return chosen;
}

// Example usage
const activities = [
    { start: 1, end: 2 },
    { start: 2, end: 3 },
    { start: 3, end: 6 },
    { start: 6, end: 7 },
    { start: 8, end: 9 }
];

console.log("Selected Activities:", activitySelection(activities));
/**
 * Output:
 * [
 *   { start: 1, end: 2 },
 *   { start: 3, end: 6 },
 *   { start: 6, end: 7 },
 *   { start: 8, end: 9 }
 * ]
 */
```

```python
def max_activities(activities):
    # Sort by finish time ascending
    activities.sort(key=lambda x: x[1])

    count = 1
    last_end = activities[0][1]

    for i in range(1, len(activities)):
        start, end = activities[i]
        if start >= last_end:
            count += 1
            last_end = end

    return count


print(max_activities([[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]]))  # 4

# Time Complexity: O(N log N)
# Space Complexity: O(1)
```

### 6. Job Scheduling | Min Heap **O(N), O(N)**
```
Each item/job has an expiry (deadline) and a profit. Each job takes 1 unit of time. Choose a subset and an order so that each chosen job finishes on or before its deadline and total profit is maximized.

expiry: [1, 3, 3, 3, 5, 5, 6, 8]
profit: [5, 2, 7, 1, 4, 3, 8, 1]
```

#### Greedy with Min-Heap (by Profit) — Deadline-Safe

**Idea:** Sort jobs by **deadline ascending**. Iterate; for each job, **add its profit** to a min-heap. If heap size exceeds the **current deadline**, pop the **smallest** profit — effectively keeping the best set that fits so far.

```
Sort by deadline:
(t, profit): (1,5), (3,2), (3,7), (3,1), (5,4), (5,3), (6,8), (8,1)

Iterate:
- push 5 → heap=[5]                    (size≤1 OK)
- push 2 → heap=[2,5]                  (size≤3 OK)
- push 7 → heap=[2,5,7]                (size≤3 OK)
- push 1 → heap=[1,2,7,5] → size=4>3 → pop 1 → heap=[2,5,7]
- push 4 → heap=[2,4,7,5]              (size≤5 OK)
- push 3 → heap=[2,3,7,5,4]            (size≤5 OK)
- push 8 → heap=[2,3,7,5,4,8]          (size≤6 OK)
- push 1 → heap=[1,3,2,5,4,8,7] → size=7≤8 OK

Total profit = sum(heap) = 1+3+2+5+4+8+7 = 30
(If you track size>deadline at each step, you're always feasible.)
```

#### Timeline Slots
```
Time slots: 1  2  3  4  5  6  7  8
Choose at most t jobs among those with deadline t
Keep the highest profits using a min-heap; drop the smallest when over capacity.
```

#### Solution
```js
// ------------------------------- Min-Heap (Numbers) -------------------------------
// A clear, well-documented binary min-heap for numbers (used to keep smallest profit on top).
class MinHeapOfNumbers {
    constructor() {
        this.heap = [];                                  // Array-backed binary heap (level-order)
    }

    size() {                                           // Current number of items in the heap
        return this.heap.length;
    }

    peek() {                                           // Read the smallest value (root) without removing it
        return this.heap[0];
    }

    insert(value) {                                    // Insert a new number into the heap
        this.heap.push(value);                           // 1) Append at the end
        this._siftUp(this.heap.length - 1);              // 2) Restore heap property by bubbling up
    }

    extractMin() {                                     // Remove and return the smallest value
        if (this.heap.length === 0) return undefined;    // Empty heap guard
        const minValue = this.heap[0];                   // Save root value to return
        const last = this.heap.pop();                    // Remove last element
        if (this.heap.length > 0) {                      // If not empty after pop
            this.heap[0] = last;                           // Move last element to root
            this._siftDown(0);                             // Restore heap property by pushing down
        }
        return minValue;                                 // Return the smallest value
    }

    // ------------------------------- Helpers -------------------------------
    _parent(i) { return (i - 1) >> 1; }                // Parent index in 0-based heap
    _left(i) { return (i << 1) + 1; }                // Left child index
    _right(i) { return (i << 1) + 2; }                // Right child index

    _siftUp(i) {                                       // Bubble up until parent <= child
        while (i > 0) {                                  // Continue until reaching the root
            const p = this._parent(i);                     // Parent index
            if (this.heap[p] <= this.heap[i]) break;       // Heap property satisfied → stop
            [this.heap[p], this.heap[i]] =                 // Swap parent and child
                [this.heap[i], this.heap[p]];
            i = p;                                         // Continue from parent's position
        }
    }

    _siftDown(i) {                                     // Push down until current <= children
        const n = this.heap.length;                      // Cache heap size
        while (true) {                                   // Iterate until heap property holds
            let smallest = i;                              // Assume current index is smallest
            const l = this._left(i), r = this._right(i);   // Compute children indices

            if (l < n && this.heap[l] < this.heap[smallest]) smallest = l; // Left smaller?
            if (r < n && this.heap[r] < this.heap[smallest]) smallest = r; // Right smaller?

            if (smallest === i) break;                     // Already in correct position
            [this.heap[i], this.heap[smallest]] =          // Swap with the smaller child
                [this.heap[smallest], this.heap[i]];
            i = smallest;                                  // Continue from child position
        }
    }
}

/**
 * maximizeProfitWithinDeadlines
 * Greedy with a min-heap: after sorting by deadline, we push each job's profit.
 * If we exceed how many jobs can be done by that deadline (heap size > deadline),
 * we drop the smallest profit. The heap always holds the best feasible set so far.
 *
 * @param {{deadline:number, profit:number}[]} jobs - Array of jobs with deadline & profit.
 * @returns {number} - Maximum achievable total profit.
 *
 * Time:  O(n log n) to sort + O(n log n) heap ops → O(n log n)
 * Space: O(n) in worst case for the heap (when deadlines are large).
 */
function maximizeProfitWithinDeadlines(jobs) {
    // 1) Sort jobs by deadline ascending so we always enforce feasibility up to current deadline.
    jobs.sort((a, b) => a.deadline - b.deadline);

    // 2) Min-heap holds profits of currently chosen jobs (smallest on top).
    const chosenProfits = new MinHeapOfNumbers();

    // 3) Traverse jobs in deadline order.
    for (const job of jobs) {
        chosenProfits.insert(job.profit);               // Tentatively include this job's profit

        // If we now hold more jobs than we can finish by this deadline,
        // remove the smallest profit to keep only the best set.
        if (chosenProfits.size() > job.deadline) {
            chosenProfits.extractMin();                   // Drop least valuable job
        }
    }

    // 4) Sum remaining profits in the heap → this is the optimal total profit.
    return chosenProfits.heap.reduce((sum, p) => sum + p, 0);
}

// ---------------------------------- Example ----------------------------------
const sampleJobs = [
    { deadline: 1, profit: 5 }, { deadline: 3, profit: 2 },
    { deadline: 3, profit: 7 }, { deadline: 3, profit: 1 },
    { deadline: 5, profit: 4 }, { deadline: 5, profit: 3 },
    { deadline: 6, profit: 8 }, { deadline: 8, profit: 1 },
];

console.log(maximizeProfitWithinDeadlines(sampleJobs)); // 30

// Time Complexity: O(n log n)
// Space Complexity: O(n)
```

```python
import heapq

# Python built-in heapq provides direct min-heap support
heap = []
for x in [10, 4, 15, 20, 0]:
    heapq.heappush(heap, x)

print(heapq.heappop(heap))  # 0
print(heapq.heappop(heap))  # 4
```

## 3. DP 1: One Dimensional

### 1. Fibonacci Numbers | Dynamic Programming (Top-Down & Bottom-Up) **O(N), O(N)**

```
Generate the Nth number in the Fibonacci sequence. The sequence starts with 0 and 1, and each subsequent number is the sum of the two preceding ones.
Sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
```

#### Explanation

The core of the Fibonacci sequence is its recurrence relation:
`fib(n) = fib(n - 1) + fib(n - 2)`

This naturally leads to a recursive solution. However, a simple recursive implementation is inefficient because it repeatedly calculates the same Fibonacci numbers. For example, to calculate `fib(5)`, we need `fib(4)` and `fib(3)`. To calculate `fib(4)`, we again need `fib(3)`. The value for `fib(3)` is computed twice. This redundancy grows exponentially.

Dynamic Programming solves this by storing the result of each Fibonacci number after computing it once.

#### Diagrams

A recursive approach without DP leads to a large tree of function calls with many repeated calculations.

**Recursion Tree for `fib(5)`:**
```
                        fib(5)
                       /      \
                  fib(4)        fib(3)
                 /      \      /      \
            fib(3)   fib(2)  fib(2)   fib(1)
           /      \  /     \ /      \
      fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
      /    \
 fib(1) fib(0)
```

With memoization, once `fib(3)` is computed, its value is stored. The next time `fib(3)` is needed, the stored value is returned instantly, pruning the recursion tree.

**Pruned Tree with Memoization:**
```
                        fib(5)
                       /      \
                  fib(4)        fib(3)  <-- Computed and stored
                 /      \      /
            fib(3)   fib(2)  <-- Value retrieved from storage
           /      \  /     \
      fib(2) fib(1) fib(1) fib(0) <-- `fib(2)` computed and stored
      /    \
 fib(1) fib(0)
```

#### 1. Top-Down (Memoization)
```js
/**
 * Calculates the nth Fibonacci number using a top-down recursive approach with memoization.
 * Time:  O(n) - Each Fibonacci number from 0 to n is computed only once.
 * Space: O(n) - For the recursion stack and the storage array.
 *
 * @param {number} n The index in the Fibonacci sequence.
 * @returns {number} The nth Fibonacci number.
 */
function fibonacciMemoized(n) {
  // Create a storage array (cache) and initialize with a value indicating 'not computed'.
  // We use an array of size n+1 to store fib(0) through fib(n).
  const storage = new Array(n + 1).fill(-1);

  // Helper function that performs the recursion.
  function solve(num) {
    // Base cases for the Fibonacci sequence.
    if (num <= 1) {
      storage[num] = num; // fib(0) = 0, fib(1) = 1
      return num;
    }

    // If the result for 'num' is already computed, return it from storage.
    if (storage[num] !== -1) {
      return storage[num];
    }

    // If not computed, calculate it recursively.
    const num1 = solve(num - 1);
    const num2 = solve(num - 2);
    const fibNum = num1 + num2;

    // Store the result before returning it.
    storage[num] = fibNum;

    return fibNum;
  }

  return solve(n);
}

console.log(fibonacciMemoized(8)); // expected output: 21
```

```python
def fibonacci_memoized(n):
    memo = {}

    def solve(num):
        if num <= 1:
            return num
        if num in memo:
            return memo[num]

        memo[num] = solve(num - 1) + solve(num - 2)
        return memo[num]

    return solve(n)


print(fibonacci_memoized(10))  # 55

# Time Complexity: O(N)
# Space Complexity: O(N)
```

#### 2. Bottom-Up (Tabulation)
```js
/**
 * Calculates the nth Fibonacci number using a bottom-up iterative approach (tabulation).
 * Time:  O(n) - A single loop runs from 2 to n.
 * Space: O(n) - An array of size n+1 is used for storage.
 *
 * @param {number} n The index in the Fibonacci sequence.
 * @returns {number} The nth Fibonacci number.
 */
function fibonacciTabulated(n) {
  // Base case: if n is 0 or 1, return n itself.
  if (n <= 1) {
    return n;
  }

  // Create a DP table (array) to store Fibonacci numbers from 0 to n.
  const dpTable = new Array(n + 1);

  // Initialize the first two values of the sequence.
  dpTable[0] = 0;
  dpTable[1] = 1;

  // Iteratively compute Fibonacci numbers from 2 up to n.
  for (let i = 2; i <= n; i++) {
    // Each entry is the sum of the previous two.
    dpTable[i] = dpTable[i - 1] + dpTable[i - 2];
  }

  // The final answer is in the last cell of the table.
  return dpTable[n];
}

// example usage
console.log(fibonacciTabulated(8)); // expected output: 21
```

```python
def fibonacci_tabulation(n):
    if n <= 1:
        return n

    dp = [0] * (n + 1)
    dp[1] = 1

    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]

    return dp[n]


print(fibonacci_tabulation(10))  # 55

# Time Complexity: O(N)
# Space Complexity: O(N)
```

#### Dry Run

**Tabulation for `n=5`**

| i   | `dpTable[i-1]` | `dpTable[i-2]` | `dpTable[i]`  | `dpTable` Array      |
| --- | -------------- | -------------- | ------------- | -------------------- |
| 0   | -              | -              | 0 (base case) | `[0, _, _, _, _, _]` |
| 1   | -              | -              | 1 (base case) | `[0, 1, _, _, _, _]` |
| 2   | 1              | 0              | 1             | `[0, 1, 1, _, _, _]` |
| 3   | 1              | 1              | 2             | `[0, 1, 1, 2, _, _]` |
| 4   | 2              | 1              | 3             | `[0, 1, 1, 2, 3, _]` |
| 5   | 3              | 2              | 5             | `[0, 1, 1, 2, 3, 5]` |

#### 3. Space-Optimized Bottom-Up

```js
/**
 * Calculates the nth Fibonacci number using a space-optimized iterative approach.
 * Time:  O(n) - A single loop runs n-1 times.
 * Space: O(1) - Only three variables are used, regardless of n.
 *
 * @param {number} n The index in the Fibonacci sequence.
 * @returns {number} The nth Fibonacci number.
 */
function fibonacciOptimized(n) {
  // Base case: if n is 0 or 1, return n itself.
  if (n <= 1) {
    return n;
  }

  // 'prev2' holds the value of fib(i-2). Initialize to fib(0).
  let prev2 = 0;
  // 'prev1' holds the value of fib(i-1). Initialize to fib(1).
  let prev1 = 1;
  // 'current' will hold the value of fib(i).
  let current;

  // Loop from 2 to n to calculate the remaining numbers.
  for (let i = 2; i <= n; i++) {
    // Calculate the current Fibonacci number.
    current = prev1 + prev2;
    // Update the pointers: prev2 becomes what prev1 was.
    prev2 = prev1;
    // And prev1 becomes the newly calculated current value.
    prev1 = current;
  }

  // The final answer is in 'prev1' (or 'current').
  return prev1;
}

// example usage
console.log(fibonacciOptimized(8)); // expected output: 21
```

```python
def fibonacci_space_optimized(n):
    if n <= 1:
        return n

    prev2 = 0
    prev1 = 1

    for _ in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr

    return prev1


print(fibonacci_space_optimized(10))  # 55

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 2. Count Ways to Climb Stairs | Dynamic Programming (Paths) **O(N), O(N)**

```
You are climbing a staircase. It takes n steps to reach the top.
Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?
```

#### Input/Output

```
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps

Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
```

#### Explanation

Let's denote the number of ways to reach the `n`th stair as `ways(n)`. To reach the `n`th stair, you must have come from either the `(n-1)`th stair (by taking a single step) or the `(n-2)`th stair (by taking two steps).

Therefore, the total number of ways to reach stair `n` is the sum of the ways to reach stair `(n-1)` and the ways to reach stair `(n-2)`.

This gives us the recurrence relation:
`ways(n) = ways(n - 1) + ways(n - 2)`

This is identical to the Fibonacci sequence. The only difference is in the base cases.

  * `ways(0)`: There is 1 way to be at the 0th stair (by not moving).
  * `ways(1)`: There is 1 way to reach the 1st stair (one step from the start).

So, the problem is a variation of Fibonacci, starting from `ways(1)=1`, `ways(2)=2`. If we define `ways(0)=1`, the sequence works perfectly.

#### Diagrams

**Paths to stair 4:**

The problem can be visualized as finding all paths from a source (stair 0) to a destination (stair N).

```
      (Stair 4)  <-- Destination
        /   \
       /     \
  (Stair 3) (Stair 2)  <-- Intermediates
    /   \     /   \
   /     \   /     \
(Stair 2) (Stair 1) (Stair 1) (Stair 0)
   ...
     \
  (Stair 0) <-- Source
```

To find total paths to stair 4, we add:
(Total paths from source to stair 3) + (Total paths from source to stair 2)

#### 1. Space-Optimized Bottom-Up

Since this problem is a variation of Fibonacci, the most efficient solution is the space-optimized one.

```js
/*
 * ALGORITHM EXPLANATION:
 * This function solves the "Climbing Stairs" problem using a Dynamic Programming approach,
 * specifically optimizing for space (effectively calculating the Fibonacci sequence).
 *
 * The logic is based on the recurrence relation:
 * To reach step 'n', you must have arrived from either step 'n-1' (taking 1 step)
 * or step 'n-2' (taking 2 steps).
 * Therefore: ways(n) = ways(n-1) + ways(n-2).
 *
 * implementation Details:
 * 1. Base cases are handled first (0 or 1 steps = 1 way).
 * 2. We use an iterative approach to calculate the number of ways from the bottom up.
 * 3. Instead of maintaining an array of size n (O(n) space), we only store the
 * results of the previous two steps (`prev1` and `prev2`) because that is all
 * we need to calculate the current step. This reduces space complexity to O(1).
 */

/**
 * Calculates the number of distinct ways to climb a staircase of n steps.
 *
 * @param {number} n The number of stairs.
 * @returns {number} The number of distinct ways to climb.
 */
function climbStairs(n) {
    // Check for the base case where n is small.
    // If there are 0 or 1 stairs, there is only one way.
    // (0 stairs = 1 way: doing nothing; 1 stair = 1 way: taking one step).
    if (n <= 1) {
        return 1;
    }

    // Initialize variables to store the number of ways to reach the previous two steps.
    // 'prev2' holds ways(i-2). For i=2, this is ways(0), which is 1.
    let prev2 = 1;

    // 'prev1' holds ways(i-1). For i=2, this is ways(1), which is 1.
    let prev1 = 1;

    // Declare a variable to store the result for the current step in the loop.
    // 'current' will hold ways(i).
    let current;

    // Loop from 2 to n to build up the solution from the bottom.
    // Loop from 2 to n.
    for (let i = 2; i <= n; i++) {
        // Calculate ways to reach the current step 'i'.
        // The number of ways to reach stair 'i' is the sum of ways to reach i-1 and i-2.
        current = prev1 + prev2;

        // Shift the values for the next iteration of the loop.
        // The previous 'prev1' becomes the new 'prev2'.
        // Update the pointers for the next iteration.
        prev2 = prev1;

        // The current result becomes the new 'prev1'.
        prev1 = current;
    }

    // After the loop finishes, prev1 holds the result for step n.
    // 'prev1' now holds the total number of ways for n stairs.
    return prev1; // or return current;
}

// Execute the function with a test case of 4 stairs.
console.log(climbStairs(4)); // output: 5

/*
 * COMPLEXITY ANALYSIS:
 *
 * Time Complexity: O(n)
 * - The algorithm runs a single loop from i = 2 to n.
 * - The operations inside the loop (addition and variable assignment) are constant time O(1).
 * - Therefore, the time required grows linearly with the input n.
 *
 * Space Complexity: O(1)
 * - We are not using any data structures (like arrays) that grow with the input size.
 * - We only use a fixed number of variables (prev1, prev2, current, i) regardless of how large n is.
 * - This is an improvement over the standard Dynamic Programming approach which usually takes O(n) space.
 */
```

```python
def climb_stairs(n):
    if n <= 2:
        return n

    prev2 = 1
    prev1 = 2

    for _ in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr

    return prev1


print(climb_stairs(4))  # 5
print(climb_stairs(5))  # 8

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 3. Minimum Perfect Squares to Sum to n | DP (Unbounded) **O(N), O(N)**

```
Given an integer N, find the minimum number of perfect squares required to sum up to N.
Duplicate squares are allowed.
A perfect square is an integer that is the square of an integer (e.g., 1, 4, 9, 16, ...).
```

#### Input/Output

```
Input: N = 12
Output: 3
Explanation: 12 = 4 + 4 + 4 (2^2 + 2^2 + 2^2)

Input: N = 13
Output: 2
Explanation: 13 = 9 + 4 (3^2 + 2^2)
```

#### Explanation

This problem asks for the minimum number of squares. A greedy approach (always subtracting the largest possible perfect square less than the remaining number) does not work. For `N=12`, a greedy approach would give `9 + 1 + 1 + 1` (4 squares), but the optimal solution is `4 + 4 + 4` (3 squares).

This problem has optimal substructure and overlapping subproblems, making it suitable for DP.

Let `dp[i]` be the minimum number of squares needed to sum to `i`.
To find `dp[n]`, we can try subtracting every possible perfect square `j*j` (where `j*j <= n`).
If we subtract `j*j`, we are left with the subproblem of finding the minimum squares for `n - j*j`. We already have this answer stored in `dp[n - j*j]`. We add 1 to it (for the `j*j` square we just used).

We do this for all possible `j` and take the minimum.
`dp[n] = min(dp[n - j*j]) + 1` for all `j` such that `j*j <= n`.

#### Diagrams

**Recursion Tree for `n=12`:**

This shows how the main problem `n=12` is broken down. We can see overlapping subproblems like `n=8` and `n=3`.

```
                            n=12
                    /         |         \
                (1^2)       (2^2)       (3^2)
                 /            |            \
              n=11           n=8            n=3
             / |   \        /   \            |
        (1^2) (2^2) (3^2)  (1^2) (2^2)     (1^2)
         /      |     \    /       \         |
      n=10     n=7   n=2  n=7      n=4      n=2
       ...     ...     ...     ...     ...       ...
```

#### 1. Top-Down (Memoization)

This solution directly translates the recursive relation into code with a cache to store results of subproblems.

```js
/*
 * Algorithm Explanation:
 * The problem is to find the minimum number of perfect squares (1, 4, 9, 16, ...) that sum up to a given number 'n'.
 * This can be solved using Dynamic Programming (specifically, the Top-Down approach with Memoization).
 *
 * 1.  **State Definition**: Let `f(n)` be the minimum number of perfect squares needed to sum to `n`.
 * 2.  **Recurrence Relation**: To find `f(n)`, we can try subtracting every possible square `i*i` (where `i*i <= n`) from `n`.
 * If we pick `i*i` as one of the squares, the problem reduces to finding the minimum squares for `n - i*i`.
 * Therefore, `f(n) = 1 + min(f(n - 1^2), f(n - 2^2), f(n - 3^2), ...)`.
 * The `+ 1` accounts for the square `i*i` we just used.
 * 3.  **Base Case**: `f(0) = 0`. It takes zero squares to sum to 0.
 * 4.  **Memoization**: We store the result of each subproblem `f(num)` in an array `storage`. If `f(num)` is called again, we return the stored value to avoid redundant calculations.
 * 5.  **Iteration**: We loop from `i = 1` while `i*i <= num` to explore all possible square subtractions for the current number.
 */

/**
 * Finds the minimum number of perfect squares that sum to n using memoization.
 *
 * @param {number} n The target number.
 * @returns {number} The minimum number of perfect squares.
 */
function minSquaresMemoized(n) {
    // Create storage and initialize with -1 (uncomputed).
    // This array will act as our memoization table (cache) to store results of subproblems.
    // Index i stores the minimum perfect squares needed for number i.
    const storage = new Array(n + 1).fill(-1);

    // Helper function to solve the problem recursively.
    function solve(num) {
        // Base case: if num is 0 or 1, return num itself.
        if (num == 0 || num == 1) {
            storage[num] = num;
            return num;
        }

        // If we have already computed the result for 'num', return it.
        // This is the memoization step: check the cache before computing.
        if (storage[num] !== -1) {
            return storage[num];
        }

        // Initialize minCount to a very large value.
        // This variable tracks the minimum number of squares found so far for the current 'num'.
        let minCount = Infinity;

        // Iterate through all possible perfect squares less than or equal to 'num'.
        // We try subtracting 1^2, 2^2, 3^2, etc., as long as the square is <= num.
        for (let i = 1; i * i <= num; i++) {
            // Consider using the square i*i.
            // The remaining problem is to find the min squares for (num - i*i).
            // We recursively call solve for the remainder.
            const remainingResult = solve(num - i * i);

            // Update minCount if this path gives a smaller number of squares.
            // We take the minimum of the current known best and the result from this specific path.
            minCount = Math.min(minCount, remainingResult);
        }

        // Store the result: min squares for subproblems + 1 (for the current square i*i).
        // The '+ 1' adds the count for the square we subtracted in the loop (i*i).
        // We save this result in 'storage' to avoid re-calculating it later.
        storage[num] = minCount + 1;

        // Return the computed minimum count for 'num'.
        return storage[num];
    }

    // Start the recursive process with the initial target number 'n'.
    return solve(n);
}

console.log(minSquaresMemoized(12)); // output: 3, since 12 = 4 + 4 + 4, 2^2 + 2^2 + 2^2
console.log(minSquaresMemoized(13)); // output: 2 , since 13 = 9 + 4, 3^2 + 2^2
console.log(minSquaresMemoized(27)); // output: 3 , since 27 = 9 + 9 + 9, 3^2 + 3^2 + 3^2

/*
 * Time Complexity: O(n * sqrt(n))
 * - There are 'n' unique subproblems (states) from 1 to n.
 * - For each subproblem 'num', the for-loop runs 'sqrt(num)' times (since i*i <= num).
 * - Total operations roughly sum up to n * sqrt(n).
 *
 * Space Complexity: O(n)
 * - We use an array 'storage' of size 'n + 1' to store the results.
 * - Additionally, the recursion stack depth can go up to 'n' in the worst case (e.g., summing 1+1+1...).
 */
```

```python
def num_squares_memo(n):
    memo = {}

    def solve(num):
        if num == 0:
            return 0
        if num in memo:
            return memo[num]

        min_sq = float('inf')
        i = 1
        while i * i <= num:
            min_sq = min(min_sq, 1 + solve(num - i * i))
            i += 1

        memo[num] = min_sq
        return min_sq

    return solve(n)


print(num_squares_memo(12))  # 3 (4 + 4 + 4)
print(num_squares_memo(13))  # 2 (4 + 9)

# Time Complexity: O(N * sqrt(N))
# Space Complexity: O(N)
```

#### 2. Bottom-Up (Tabulation)

This solution builds the `dp` table from the bottom up, starting from the smallest subproblem.

```js
/*
 * ALGORITHM EXPLANATION:
 *
 * This function solves the "Perfect Squares" problem using Dynamic Programming (Tabulation).
 * The goal is to find the least number of perfect squares (1, 4, 9, 16...) that sum up to integer n.
 *
 * 1. State Definition:
 * We define a DP array `dpTable` where `dpTable[i]` represents the minimum number of
 * perfect squares required to sum to the integer `i`.
 *
 * 2. Initialization:
 * - Create an array of size n + 1.
 * - Initialize all values to Infinity (or a large number) to act as a placeholder for comparison.
 * - Set `dpTable[0] = 0` because it takes 0 squares to sum to 0. This is our base case.
 *
 * 3. Iteration (Bottom-Up):
 * - We loop from `i = 1` up to `n` to fill the table.
 * - For each number `i`, we check all perfect squares (j*j) that are less than or equal to `i`.
 * - The recurrence relation is: dpTable[i] = min(dpTable[i], 1 + dpTable[i - j*j]).
 * Here, `1` accounts for the square `j*j` we are using, and `dpTable[i - j*j]` is the
 * previously computed optimal result for the remainder.
 *
 * 4. Result:
 * - After filling the table, `dpTable[n]` contains the minimum count for the input `n`.
 */

/**
 * Finds the minimum number of perfect squares that sum to n using tabulation.
 *
 * @param {number} n The target number.
 * @returns {number} The minimum number of perfect squares.
 */
function minSquaresTabulated(n) {
    // dpTable[i] will store the min number of squares that sum to i.
    // Create an array of size n + 1 to store results for indices 0 through n.
    // Initialize with Infinity so any calculated count will be smaller and selected by Math.min.
    const dpTable = new Array(n + 1).fill(Infinity);

    // Base case: 0 requires 0 squares.
    // This serves as the anchor for the DP transitions.
    dpTable[0] = 0;

    // Iterate from 1 to n to fill the DP table.
    // This represents solving the problem for every integer up to n (bottom-up approach).
    for (let i = 1; i <= n; i++) {
        // For each number 'i', try subtracting all possible perfect squares.
        // j represents the root of the square. We check j*j = 1, 4, 9, etc., as long as j*j <= i.
        for (let j = 1; j * j <= i; j++) {
            // The number of squares for 'i' could be 1 (for j*j) + the number of squares for (i - j*j).
            // Calculate the remainder if we subtract the current square (j*j) from i.
            const remaining = i - j * j;

            // Look up the optimal solution for the remainder and add 1 (for the current square j*j).
            const potentialCount = 1 + dpTable[remaining];

            // Update the entry for 'i' if we found a better (smaller) combination.
            // We compare the current value in dpTable[i] (which might be Infinity or a previous calculation)
            // with the newly calculated potentialCount.
            dpTable[i] = Math.min(dpTable[i], potentialCount);
        }
    }

    // The final answer is stored in the last cell of the table.
    // This index represents the optimal solution for the original target n.
    return dpTable[n];
}

console.log(minSquaresTabulated(12)); // output: 3
console.log(minSquaresTabulated(13)); // output: 2

/*
 * COMPLEXITY ANALYSIS:
 *
 * 1. Time Complexity: O(n * sqrt(n))
 * - The outer loop runs 'n' times (from 1 to n).
 * - The inner loop runs 'sqrt(i)' times because j*j <= i implies j <= sqrt(i).
 * - Summing sqrt(i) for i=1 to n results in an upper bound of O(n * sqrt(n)).
 *
 * 2. Space Complexity: O(n)
 * - We allocate an array `dpTable` of size `n + 1` to store the sub-problems.
 * - This linear space is required for the tabulation approach.
 */
```

```python
def num_squares_tab(n):
    dp = [float('inf')] * (n + 1)
    dp[0] = 0

    for i in range(1, n + 1):
        j = 1
        while j * j <= i:
            dp[i] = min(dp[i], 1 + dp[i - j * j])
            j += 1

    return dp[n]


print(num_squares_tab(12))  # 3
print(num_squares_tab(13))  # 2

# Time Complexity: O(N * sqrt(N))
# Space Complexity: O(N)
```

## 4. DP 2: Two Dimensional

### 1. House Robber | 1D DP (Tabulation) | 1D DP (Space Optimized) **O(N), O(N)**

```
Given an integer array `nums` representing the amount of money in a row of houses, determine the maximum amount of money you can rob in one night. The only constraint is that you cannot rob two adjacent houses, as this will trigger an alarm.
```

#### Theory

This problem has optimal substructure and overlapping subproblems, making it a perfect candidate for Dynamic Programming.

Let's define `dp[i]` as the maximum amount of money that can be robbed from the first `i` houses (i.e., from house 0 to house `i`).

To decide what to do at house `i`, we have two choices:

1.  **Rob house `i`**: If we rob house `i`, we cannot rob the adjacent house `i-1`. The maximum money we can have is the money in house `i` plus the maximum money we could have robbed from houses 0 to `i-2`.
      * `money = nums[i] + dp[i-2]`
2.  **Skip house `i`**: If we don't rob house `i`, the maximum money we can have is simply the maximum money we could have robbed from houses 0 to `i-1`.
      * `money = dp[i-1]`

The optimal solution for `dp[i]` is the maximum of these two choices.

**State Transition Formula:**
`dp[i] = max(nums[i] + dp[i-2], dp[i-1])`

#### Input/Output

```
Input: nums = [2, 7, 9, 3, 1]
Output: 12
Explanation: Rob house 0 (money = 2), house 2 (money = 9) and house 4 (money = 1).
Total amount you can rob = 2 + 9 + 1 = 12.
```

```
Input: nums = [10, 9, 7, 100]
Output: 110
Explanation: Rob house 0 (money = 10) and house 3 (money = 100).
Total amount you can rob = 10 + 100 = 110.
```

#### Explanation

We can use an array `dp` to store the maximum amount of money that can be robbed up to each house. We iterate through the houses and apply the state transition formula. The final answer will be the value at the last index of the `dp` array.

#### Dry Run

Let's trace the example `nums = [2, 7, 9, 3, 1]`.

  * **dp[0]:** Only one house. We must rob it. `dp[0] = 2`.
  * **dp[1]:** Two houses. Rob house 0 (2) or house 1 (7). Max is 7. `dp[1] = max(2, 7) = 7`.
  * **dp[2]:** `max(dp[1], nums[2] + dp[0])` = `max(7, 9 + 2)` = `max(7, 11)` = `11`.
  * **dp[3]:** `max(dp[2], nums[3] + dp[1])` = `max(11, 3 + 7)` = `max(11, 10)` = `11`.
  * **dp[4]:** `max(dp[3], nums[4] + dp[2])` = `max(11, 1 + 11)` = `max(11, 12)` = `12`.

| Index (i) |   0   |   1   |   2   |   3   |   4   |
| :-------- | :---: | :---: | :---: | :---: | :---: |
| `nums[i]` |   2   |   7   |   9   |   3   |   1   |
| `dp[i]`   |   2   |   7   |  11   |  11   |  12   |

#### 1. Tabulation (DP with Array)

```js
/**
 * Calculates the maximum amount of money that can be robbed from a row of houses
 * without robbing two adjacent ones, using a DP array.
 * @param {number[]} houseMoney - An array representing the money in each house.
 * @returns {number} - The maximum amount of money that can be robbed.
 */
function houseRobberTabulation(houseMoney) {
  // Get the number of houses.
  const n = houseMoney.length;

  // If there are no houses, no money can be robbed.
  if (n === 0) {
    return 0;
  }

  // If there is only one house, rob it.
  if (n === 1) {
    return houseMoney[0];
  }

  // Create a DP array to store the max money robbed up to house i.
  const dp = new Array(n).fill(0);

  // Base case: For the first house, the max money is the money in it.
  dp[0] = houseMoney[0];

  // Base case: For the second house, the max is either the first or the second house's money.
  dp[1] = Math.max(houseMoney[0], houseMoney[1]);

  // Iterate from the third house to the end.
  for (let i = 2; i < n; i++) {
    // For each house, decide whether to rob it or skip it.
    // Option 1: Rob the current house (i). This means you get its money plus the max robbed up to house i-2.
    const robCurrent = houseMoney[i] + dp[i - 2];
    // Option 2: Skip the current house (i). The max money is what was robbed up to house i-1.
    const skipCurrent = dp[i - 1];
    // The optimal choice is the maximum of these two options.
    dp[i] = Math.max(robCurrent, skipCurrent);
  }

  // The final answer is the maximum money that can be robbed from all houses.
  return dp[n - 1];
}

// Example usage:
const houses1 = [2, 7, 9, 3, 1];
console.log(houseRobberTabulation(houses1)); // Expected output: 12

const houses2 = [10, 9, 7, 100];
console.log(houseRobberTabulation(houses2)); // Expected output: 110

// Time Complexity: O(N) because we iterate through the array once.
// Space Complexity: O(N) for the DP array.
```

```python
def rob_tabulation(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]

    dp = [0] * len(nums)
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])

    for i in range(2, len(nums)):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])

    return dp[-1]


print(rob_tabulation([1, 2, 3, 1]))  # 4
print(rob_tabulation([2, 7, 9, 3, 1]))  # 12

# Time Complexity: O(N)
# Space Complexity: O(N)
```

#### 2. Space Optimized DP

Since the calculation for `dp[i]` only depends on the previous two values (`dp[i-1]` and `dp[i-2]`), we don't need to store the entire DP array. We can optimize the space by only keeping track of the last two results.

```js
/**
 * Calculates the maximum amount of money that can be robbed, using space-optimized DP.
 * @param {number[]} houseMoney - An array representing the money in each house.
 * @returns {number} - The maximum amount of money that can be robbed.
 */
function houseRobberSpaceOptimized(houseMoney) {
  // Get the number of houses.
  const n = houseMoney.length;

  // If there are no houses, no money can be robbed.
  if (n === 0) {
    return 0;
  }

  // If there is only one house, rob it.
  if (n === 1) {
    return houseMoney[0];
  }

  // 'prev2' stores the max money robbed up to house i-2. Initialize to the first house.
  let prev2 = houseMoney[0];
  // 'prev1' stores the max money robbed up to house i-1. Initialize to the max of the first two houses.
  let prev1 = Math.max(houseMoney[0], houseMoney[1]);

  // Iterate from the third house to the end.
  for (let i = 2; i < n; i++) {
    // Calculate the max money for the current house 'i'.
    // Option 1: Rob the current house, so money is houseMoney[i] + prev2.
    // Option 2: Skip the current house, so money is prev1.
    const currentMax = Math.max(houseMoney[i] + prev2, prev1);

    // Update the pointers for the next iteration.
    // The previous 'prev1' becomes the new 'prev2'.
    prev2 = prev1;
    // The 'currentMax' becomes the new 'prev1'.
    prev1 = currentMax;
  }

  // After the loop, 'prev1' holds the maximum money robbed for all houses.
  return prev1;
}

// Example usage:
const houses3 = [2, 7, 9, 3, 1];
console.log(houseRobberSpaceOptimized(houses3)); // Expected output: 12

const houses4 = [10, 9, 7, 100];
console.log(houseRobberSpaceOptimized(houses4)); // Expected output: 110

// Time Complexity: O(N) because we iterate through the array once.
// Space Complexity: O(1) because we only use a few variables to store state.
```

```python
def rob(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]

    prev2 = nums[0]
    prev1 = max(nums[0], nums[1])

    for i in range(2, len(nums)):
        curr = max(prev1, prev2 + nums[i])
        prev2 = prev1
        prev1 = curr

    return prev1


print(rob([1, 2, 3, 1]))     # 4
print(rob([2, 7, 9, 3, 1]))  # 12

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 2. Unique Paths in a Grid | Memoization | 2D DP (Tabulation) **O(N), O(N)**

```
Given an `n x m` matrix, find the total number of unique paths from the top-left corner (0, 0) to the bottom-right corner (n-1, m-1). You can only move one step down or one step right at a time.
```

#### Theory

To reach any cell `(i, j)`, you must have come from either the cell above it, `(i-1, j)`, or the cell to its left, `(i, j-1)`. Therefore, the total number of unique paths to reach `(i, j)` is the sum of the unique paths to reach `(i-1, j)` and the unique paths to reach `(i, j-1)`.

**State Transition Formula:**
`paths(i, j) = paths(i-1, j) + paths(i, j-1)`

**Base Cases:**

  * Any cell in the first row (`i=0`) can only be reached from the left. There is only 1 path to each of these cells.
  * Any cell in the first column (`j=0`) can only be reached from above. There is only 1 path to each of these cells.
  * Therefore, `paths(i, j) = 1` if `i=0` or `j=0`.

#### Diagrams

A visual representation of a 3x3 grid. 'S' is the source (0,0) and 'D' is the destination (2,2). The paths show different ways to get from S to D by only moving right or down.

```
  0   1   2
+---+---+---+
| S |   |   |  0
+---+---+---+
|   |   |   |  1
+---+---+---+
|   |   | D |  2
+---+---+---+

Example Path 1: Right, Right, Down, Down
  (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)

Example Path 2: Down, Right, Down, Right
  (0,0) -> (1,0) -> (1,1) -> (2,1) -> (2,2)

Example Path 3: Down, Down, Right, Right
  (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2)
```

#### Input/Output

```
Input: n = 3, m = 3
Output: 6
```

#### Dry Run

Let's trace a 3x3 grid using a DP table.

|       |   0   |   1   |   2   |
| :---: | :---: | :---: | :---: |
| **0** |   1   |   1   |   1   |
| **1** |   1   |   2   |   3   |
| **2** |   1   |   3   |   6   |

  * `dp[0][0] = 1` (Start)
  * First row and column are all 1s.
  * `dp[1][1] = dp[0][1] + dp[1][0] = 1 + 1 = 2`
  * `dp[1][2] = dp[0][2] + dp[1][1] = 1 + 2 = 3`
  * `dp[2][1] = dp[1][1] + dp[2][0] = 2 + 1 = 3`
  * `dp[2][2] = dp[1][2] + dp[2][1] = 3 + 3 = 6`

#### 1. Recursion (Brute-force)

```js
/**
 * Calculates the number of unique paths using a brute-force recursive approach.
 * @param {number} n - The number of rows in the grid.
 * @param {number} m - The number of columns in the grid.
 * @returns {number} - The total number of unique paths.
 */
function uniquePathsRecursive(n, m) {
  // Inner recursive function that works with zero-based indices.
  function countPaths(row, col) {
    // Base case: If we are in the first row or first column, there's only one way to get there.
    if (row === 0 || col === 0) {
      return 1;
    }
    // Recursive step: The number of paths to (row, col) is the sum of paths
    // from the cell above and the cell to the left.
    const pathsFromTop = countPaths(row - 1, col);
    const pathsFromLeft = countPaths(row, col - 1);
    return pathsFromTop + pathsFromLeft;
  }
  // Start the recursion from the bottom-right corner.
  return countPaths(n - 1, m - 1);
}

// Example usage:
console.log(uniquePathsRecursive(3, 3)); // Expected output: 6
// Note: This is very slow for larger grids due to re-computation.

// Time Complexity: O(2^(n+m)) - Exponential, as many subproblems are re-solved.
// Space Complexity: O(n+m) - For the recursion stack depth.
```

```python
def unique_paths_recursive(m, n):
    def count_paths(i, j):
        if i == m - 1 and j == n - 1:
            return 1
        if i >= m or j >= n:
            return 0
        return count_paths(i + 1, j) + count_paths(i, j + 1)

    return count_paths(0, 0)


print(unique_paths_recursive(3, 7))  # 28
```

#### 2. Memoization (Top-down DP)

```js
/**
 * Calculates the number of unique paths using memoization to avoid re-computation.
 * @param {number} n - The number of rows in the grid.
 * @param {number} m - The number of columns in the grid.
 * @returns {number} - The total number of unique paths.
 */
function uniquePathsMemoization(n, m) {
  // Create a memoization table initialized with a value indicating 'not computed yet'.
  const memo = Array(n).fill(null).map(() => Array(m).fill(-1));

  // Inner recursive function with memoization.
  function countPaths(row, col) {
    // Base case: If we are in the first row or column, there is only one path.
    if (row === 0 || col === 0) {
      return 1;
    }
    // If the result for this cell is already computed, return it from the memo table.
    if (memo[row][col] !== -1) {
      return memo[row][col];
    }
    // Compute the number of paths from the top and left.
    const pathsFromTop = countPaths(row - 1, col);
    const pathsFromLeft = countPaths(row, col - 1);

    // Store the result in the memo table before returning.
    memo[row][col] = pathsFromTop + pathsFromLeft;

    return memo[row][col];
  }

  // Start the recursion from the bottom-right corner.
  return countPaths(n - 1, m - 1);
}

// Example usage:
console.log(uniquePathsMemoization(3, 7)); // Expected output: 28

// Time Complexity: O(n * m) - Each cell is computed only once.
// Space Complexity: O(n * m) - For the memoization table and recursion stack.
```

```python
def unique_paths_memo(m, n):
    memo = {}

    def count_paths(i, j):
        if i == m - 1 and j == n - 1:
            return 1
        if i >= m or j >= n:
            return 0
        if (i, j) in memo:
            return memo[(i, j)]

        memo[(i, j)] = count_paths(i + 1, j) + count_paths(i, j + 1)
        return memo[(i, j)]

    return count_paths(0, 0)


print(unique_paths_memo(3, 7))  # 28

# Time Complexity: O(M * N)
# Space Complexity: O(M * N)
```

#### 3. Tabulation (Bottom-up DP)

```js
/**
 * Calculates the number of unique paths using tabulation (a 2D DP array).
 * @param {number} n - The number of rows in the grid.
 * @param {number} m - The number of columns in the grid.
 * @returns {number} - The total number of unique paths.
 */
function uniquePathsTabulation(n, m) {
  // Create a DP table to store the number of paths to each cell.
  const dp = Array(n).fill(null).map(() => Array(m).fill(0));

  // Iterate through each cell of the grid.
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < m; col++) {
      // Base case: For cells in the first row or first column, there is only one path.
      if (row === 0 || col === 0) {
        dp[row][col] = 1;
      } else {
        // For any other cell, the number of paths is the sum of paths
        // from the cell above and the cell to the left.
        const pathsFromTop = dp[row - 1][col];
        const pathsFromLeft = dp[row][col - 1];
        dp[row][col] = pathsFromTop + pathsFromLeft;
      }
    }
  }

  // The result is the value in the bottom-right cell of the DP table.
  return dp[n - 1][m - 1];
}

// Example usage:
console.log(uniquePathsTabulation(3, 3)); // Expected output: 6

// Time Complexity: O(n * m) - We iterate through the entire grid.
// Space Complexity: O(n * m) - For the 2D DP array.
```

```python
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]

    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]

    return dp[m - 1][n - 1]


print(unique_paths(3, 7))  # 28
print(unique_paths(3, 2))  # 3

# Time Complexity: O(M * N)
# Space Complexity: O(M * N)
```

### 3. Count A-Digit Numbers with Digit Sum B | Recursion with Memoization (Top-Down 2D DP) | Iterative 1D DP with Space Optimization (Bottom-Up) **O(N), O(N)**

```text
Find the count of all A-digit positive numbers whose sum of digits equals B. The first digit cannot be zero. Since the answer can be large, return it modulo 10^9 + 7.
```

#### Constraints

```text
1 <= A <= 1000
1 <= B <= 10000
```

#### Input/Output Examples

```text
Example Input: A = 2, B = 4
Example Output: 4
Example Explanation: Valid numbers are {13, 22, 31, 40}. Note that 04 is treated as a 1-digit number, so it is invalid.

Example Input: A = 2, B = 20
Example Output: 0
Example Explanation: The maximum sum for two digits is 9+9=18. It is impossible to reach sum 20.
```

#### 1. Recursion with Memoization (Top-Down DP)

This approach solves the problem by breaking it down into smaller subproblems. To form an `A`-digit number with sum `B`, we pick a valid digit for the first position and recursively find the number of ways to fill the remaining `A-1` positions with the remaining sum.

**Algorithm:**

1. **State Definition:** `dp[digits_left][current_sum]` represents the number of ways to form a number using `digits_left` digits such that their sum is `current_sum`.
2. **Handling Leading Zeros:** The first digit of the number cannot be 0. We handle this outside the main recursive helper function by iterating the first digit from 1 to 9. The subsequent digits can be 0 to 9.
3. **Memoization:** We use a 2D array to store results of `(digits_left, current_sum)` to avoid recalculating the same states.

```js
/**
 * Approach: Top-Down Dynamic Programming (Recursion + Memoization)
 * * Time:  O(A * B) - We fill a table of size A*B, each state takes constant time (loop 0-9).
 * Space: O(A * B) - For the memoization table + O(A) recursion stack depth.
 */
function solution(A, B) {
  const MOD = 1000000007;

  // Initialize memoization table with -1
  // Dimensions: (A + 1) x (B + 1)
  // memo[i][j] stores the count of i-digit numbers summing to j (allowing leading zeros)
  const memo = Array.from({ length: A + 1 }, () => Array(B + 1).fill(-1));

  /**
   * Helper function to find count of numbers
   * @param {number} len - Number of digits remaining to be filled
   * @param {number} target - The sum we need to achieve
   */
  function countWays(len, target) {
    // Base Case: If target sum becomes negative, this path is invalid
    if (target < 0) return 0;

    // Base Case: If no digits left
    if (len === 0) {
      // If sum is exactly 0, we found 1 valid combination (all digits placed successfully)
      return target === 0 ? 1 : 0;
    }

    // Return memoized result if exists
    if (memo[len][target] !== -1) {
      return memo[len][target];
    }

    let count = 0;

    // Iterate through all possible digits (0-9) for the current position
    // Note: This helper allows 0 as a digit because it handles positions after the first.
    for (let digit = 0; digit <= 9; digit++) {
      // Add the ways to form the rest of the number
      // We need (len - 1) digits that sum to (target - digit)
      count = (count + countWays(len - 1, target - digit)) % MOD;
    }

    // Store and return result
    return (memo[len][target] = count);
  }

  // --- Main Logic ---
  let ans = 0;

  // The first digit (Most Significant Digit) cannot be 0.
  // We iterate through 1-9 for the first digit.
  for (let d = 1; d <= 9; d++) {
    if (B - d >= 0) {
      // For the remaining (A - 1) digits, we need to achieve sum (B - d).
      // These subsequent digits can be 0.
      ans = (ans + countWays(A - 1, B - d)) % MOD;
    }
  }

  return ans;
}

console.log(solution(2, 4)); // Expected Output: 4

// Time Complexity: O(A * B)
// Space Complexity: O(A * B)
```

```python
def count_digit_sum_memo(A, B):
    MOD = 1000000007
    memo = {}

    def solve(digits_left, sum_left):
        if digits_left == 0:
            return 1 if sum_left == 0 else 0
        if sum_left < 0:
            return 0
        if (digits_left, sum_left) in memo:
            return memo[(digits_left, sum_left)]

        ways = 0
        start_digit = 1 if digits_left == A else 0
        for d in range(start_digit, 10):
            if sum_left - d >= 0:
                ways = (ways + solve(digits_left - 1, sum_left - d)) % MOD

        memo[(digits_left, sum_left)] = ways
        return ways

    return solve(A, B)


print(count_digit_sum_memo(2, 4))  # 4 (13, 22, 31, 40)

# Time Complexity: O(A * B * 10)
# Space Complexity: O(A * B)
```

#### 2. Iterative DP with Space Optimization (Bottom-Up)

This approach builds the solution iteratively. Instead of full recursion, we calculate the DP table row by row.

**Observation:**
To calculate the values for `i` digits (`curr` row), we only need the values for `i-1` digits (`prev` row). Specifically, `dp[i][sum] = sum(dp[i-1][sum - digit])` for `digit` in `0..9`. Therefore, we can reduce the space complexity from `O(A*B)` to `O(B)` by maintaining only two arrays.

**Algorithm:**

1. Initialize `prev` array of size `B+1`. This represents numbers with `1` digit.
2. Fill `prev` for digits 1 to 9 (since the first digit cannot be 0).
3. Loop from length `i = 2` to `A`.
4. For each length, create a `curr` array. Calculate `curr[sum]` by summing `prev[sum-d]` for `d` in `0..9`.
5. After computing `curr`, update `prev = curr`.
6. The result is `prev[B]`.

```js
/**
 * Approach: Bottom-Up Dynamic Programming with Space Optimization
 * * Time:  O(A * B) - Nested loops: A iterations * B sums * 10 digits.
 * Space: O(B)     - We only store two rows (prev and curr) of size B.
 */
function solution(A, B) {
  const MOD = 1000000007;

  // prev[j] stores the number of ways to form a number
  // with 'i-1' digits having sum 'j'.
  let prev = new Array(B + 1).fill(0);

  // Initialize for the first digit (Length = 1)
  // The first digit must be 1-9 (Leading zeros constraint)
  for (let d = 1; d <= 9; d++) {
    if (d <= B) {
      prev[d] = 1;
    }
  }

  // Iterate from length 2 to A (building up the number of digits)
  for (let i = 2; i <= A; i++) {
    let curr = new Array(B + 1).fill(0);

    // Calculate counts for every possible sum 's' up to B
    for (let s = 0; s <= B; s++) {
      // Try appending digits 0-9 to the previous numbers
      for (let d = 0; d <= 9; d++) {
        if (s - d >= 0) {
          // If we append digit 'd', the previous (i-1) digits must sum to 's - d'
          curr[s] = (curr[s] + prev[s - d]) % MOD;
        }
      }
    }
    // Update prev array for the next iteration
    prev = curr;
  }

  return prev[B];
}

console.log(solution(2, 4)); // Expected Output: 4

// Time Complexity: O(A * B)
// Space Complexity: O(B)
```

```python
def count_digit_sum_iterative(A, B):
    MOD = 1000000007
    dp = [0] * (B + 1)

    # First digit (1 to 9)
    for d in range(1, min(10, B + 1)):
        dp[d] = 1

    for _ in range(2, A + 1):
        next_dp = [0] * (B + 1)
        for s in range(B + 1):
            if dp[s] > 0:
                for d in range(10):
                    if s + d <= B:
                        next_dp[s + d] = (next_dp[s + d] + dp[s]) % MOD
        dp = next_dp

    return dp[B]


print(count_digit_sum_iterative(2, 4))  # 4
```

### 4. Catalan Numbers | 1D DP / Combinatorics **O(N), O(N)**

#### Theory

The Catalan numbers are a sequence of natural numbers that appear in many counting problems in combinatorics. They are denoted by `C_n`.

**Sequence:** 1, 1, 2, 5, 14, 42, 132, ...

**Recurrence Relation:**
The Catalan numbers can be defined by the following recurrence relation:
`C_n = C_0 * C_{n-1} + C_1 * C_{n-2} + ... + C_{n-1} * C_0`
which can be written as:
`C_n = sum(C_i * C_{n-1-i})` for `i` from 0 to `n-1`.

**Base Case:**
`C_0 = 1`
`C_1 = 1`

**Example Calculations:**
  * `C_2 = C_0 * C_1 + C_1 * C_0 = 1*1 + 1*1 = 2`
  * `C_3 = C_0 * C_2 + C_1 * C_1 + C_2 * C_0 = 1*2 + 1*1 + 2*1 = 5`
  * `C_4 = C_0*C_3 + C_1*C_2 + C_2*C_1 + C_3*C_0 = 1*5 + 1*2 + 2*1 + 5*1 = 14`

#### 1. Calculating Nth Catalan Number

```js
/**
 * Calculates the Nth Catalan number using dynamic programming.
 * @param {number} n - The index of the Catalan number to find.
 * @returns {number} - The Nth Catalan number.
 */
function calculateCatalan(n) {
  // Create a DP array to store Catalan numbers from 0 to n.
  const catalan = new Array(n + 1).fill(0);

  // Base cases.
  catalan[0] = 1;
  if (n > 0) {
    catalan[1] = 1;
  }

  // Use the recurrence relation to fill the DP table up to n.
  for (let i = 2; i <= n; i++) {
    // C_i = sum of C_j * C_{i-1-j} for j from 0 to i-1
    for (let j = 0; j < i; j++) {
      catalan[i] += catalan[j] * catalan[i - 1 - j];
    }
  }

  // Return the Nth Catalan number.
  return catalan[n];
}

// Example usage:
console.log(`C_0: ${calculateCatalan(0)}`); // Expected output: 1
console.log(`C_3: ${calculateCatalan(3)}`); // Expected output: 5
console.log(`C_5: ${calculateCatalan(5)}`); // Expected output: 42

// Time Complexity: O(N^2) - Due to the nested loops.
// Space Complexity: O(N) - For the DP array.
```

```python
def catalan_number(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1

    for i in range(2, n + 1):
        for j in range(i):
            dp[i] += dp[j] * dp[i - 1 - j]

    return dp[n]


print(catalan_number(4))  # 14
print(catalan_number(5))  # 42

# Time Complexity: O(N^2)
# Space Complexity: O(N)
```

```js
/**
 * ALGORITHM EXPLANATION:
 * The Catalan numbers follow a recursive relationship defined by the formula:
 * C(n) = Σ (C(i) * C(n-1-i)) for i = 0 to n-1.
 * * This implementation uses Dynamic Programming (Bottom-Up) to avoid redundant
 * calculations. It builds an array 'c' where each index 'i' stores the i-th
 * Catalan number.
 * * To find C(i), the algorithm takes the sum of products of previously computed
 * Catalan numbers by pairing the first (p1) and last (p2) available elements,
 * moving inward until all combinations are summed.
 */

/**
 * Calculates the Nth Catalan number using a bottom-up DP approach.
 * Time:  O(n^2)
 * Space: O(n)
 */
function getCatalanNumber(n) {
    // Create an array of size n + 1 to store Catalan numbers from 0 to n
    // We fill with 0 to allow the += addition operation during summation
    let c = new Array(n + 1).fill(0);

    // Base case: C(0) is always 1
    c[0] = 1;

    // Handle edge case where n is 0 to return early
    if (n === 0) return c[0];

    // Base case: C(1) is always 1
    c[1] = 1;

    // Iterate from 2 up to n to fill the DP table incrementally
    for (let i = 2; i <= n; i++) {
        // p1 starts at the beginning of the array (C[0])
        let p1 = 0;
        // p2 starts at the end of the previously computed values (C[i-1])
        let p2 = i - 1;

        // Apply the summation formula: C[i] = C[0]*C[i-1] + C[1]*C[i-2] + ... + C[i-1]*C[0]
        // This loop runs 'i' times for each 'i' in the outer loop
        while (p2 >= 0) {
            // Add the product of the two terms to the current Catalan index
            // Formula: c[i] = Σ (c[p1] * c[p2])
            c[i] += c[p1] * c[p2];

            // Move p1 forward to the next Catalan number
            p1++;
            // Move p2 backward to the previous Catalan number
            p2--;
        }
    }

    // Return the nth Catalan number stored in the DP table after all iterations
    return c[n];
}

console.log(getCatalanNumber(0)); // 1
console.log(getCatalanNumber(3)); // 5
console.log(getCatalanNumber(5)); // 42
console.log(getCatalanNumber(8)); // 1430

/**
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(n^2)
 * The outer loop runs (n-1) times. For every iteration 'i', the inner while loop
 * runs 'i' times. This results in a summation: 2 + 3 + ... + n, which simplifies
 * to quadratic time.
 * * Space Complexity: O(n)
 * We allocate a single-dimensional array 'c' of size (n + 1) to store the
 * intermediate results of the Catalan sequence.
*/
```

```python
def catalan_formula(n):
    # C(n) = (2n)! / ((n + 1)! * n!)
    c = 1
    for i in range(1, n + 1):
        c = c * (4 * i - 2) // (i + 1)
    return c


print(catalan_formula(4))  # 14
print(catalan_formula(5))  # 42

# Time Complexity: O(N)
# Space Complexity: O(1)
```

### 5. Count of Unique BSTs | 1D DP (Catalan Numbers) **O(N), O(N)**

```
Given a number N, count the total number of unique Binary Search Trees (BSTs) that can be formed using N distinct numbers (e.g., from 1 to N).
```

#### Theory

This is a classic combinatorial problem whose solution is the Nth Catalan number.

Let's see why. If we have `N` distinct keys (say 1, 2, ..., N), we can pick any key `i` to be the root of the BST.

  * Once `i` is the root, all keys smaller than `i` (i.e., `1` to `i-1`) must go into the left subtree. There are `i-1` such keys.
  * All keys larger than `i` (i.e., `i+1` to `N`) must go into the right subtree. There are `N-i` such keys.

The number of unique BSTs with `k` keys is `C_k`.
So, if we choose `i` as the root:

  * Number of unique left subtrees = `Count(i-1)`
  * Number of unique right subtrees = `Count(N-i)`

The total number of BSTs with `i` as the root is `Count(i-1) * Count(N-i)`.

To get the total count for `N` nodes, we sum this product over all possible roots `i` from 1 to `N`.
`Count(N) = sum(Count(i-1) * Count(N-i))` for `i` from 1 to `N`.

If we let `j = i-1`, the formula becomes:
`Count(N) = sum(Count(j) * Count(N-1-j))` for `j` from 0 to `N-1`.

This is exactly the recurrence relation for the Catalan numbers, where `Count(N) = C_N`.

#### Input/Output

```
Input: N = 3
Output: 5
```

#### Explanation

For `N=3`, the keys are {1, 2, 3}.

  * **Root = 1:** Left subtree (0 nodes), Right subtree (2 nodes: {2,3}).
      * Ways = `C_0 * C_2` = 1 \* 2 = 2
  * **Root = 2:** Left subtree (1 node: {1}), Right subtree (1 node: {3}).
      * Ways = `C_1 * C_1` = 1 \* 1 = 1
  * **Root = 3:** Left subtree (2 nodes: {1,2}), Right subtree (0 nodes).
      * Ways = `C_2 * C_0` = 2 \* 1 = 2

Total ways = 2 + 1 + 2 = 5. This is `C_3`.

#### 1. 1D DP (Catalan Numbers)

The solution is to calculate the Nth Catalan number. We can reuse the function from the previous section.

```js
/**
 * Counts the number of unique Binary Search Trees with N nodes.
 * This is equivalent to finding the Nth Catalan number.
 * @param {number} n - The number of nodes in the BST.
 * @returns {number} - The total number of unique BSTs.
 */
function countUniqueBsts(n) {
  // Handle the case of a negative input.
  if (n < 0) return 0;

  // Create a DP array to store the number of unique BSTs for i nodes.
  // This array will effectively store Catalan numbers.
  const dp = new Array(n + 1).fill(0);

  // Base case: There is one unique BST with 0 nodes (the empty tree).
  dp[0] = 1;
  // Base case: There is one unique BST with 1 node.
  if (n > 0) {
    dp[1] = 1;
  }

  // Iterate from 2 nodes up to n nodes.
  for (let i = 2; i <= n; i++) {
    // For a tree with 'i' nodes, iterate through all possible root choices.
    // 'j' represents the number of nodes in the left subtree.
    for (let j = 0; j < i; j++) {
      // Number of nodes in the right subtree will be (i - 1 - j).
      // Total trees = (ways for left subtree) * (ways for right subtree)
      const leftSubtreeCount = dp[j];
      const rightSubtreeCount = dp[i - 1 - j];
      dp[i] += leftSubtreeCount * rightSubtreeCount;
    }
  }

  // The result is the number of BSTs for n nodes.
  return dp[n];
}

// Example usage:
console.log(countUniqueBsts(3)); // Expected output: 5
console.log(countUniqueBsts(0)); // Expected output: 1
console.log(countUniqueBsts(1)); // Expected output: 1
console.log(countUniqueBsts(4)); // Expected output: 14

// Time Complexity: O(N^2)
// Space Complexity: O(N)
```

```python
def num_trees(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1

    for i in range(2, n + 1):
        for j in range(1, i + 1):
            dp[i] += dp[j - 1] * dp[i - j]

    return dp[n]


print(num_trees(3))  # 5
print(num_trees(4))  # 14

# Time Complexity: O(N^2)
# Space Complexity: O(N)
```

### 6. Unique Binary Search Trees II | Dynamic Programming (Catalan Numbers) **O(N), O(N)**

```
Given an integer A, return how many structurally unique Binary Search Trees (BSTs) can be formed
that store the values 1...A (each value used exactly once). The answer equals the A-th Catalan number.
```

#### Constraints

```
1 <= A <= 18
```

#### Input/Output Format

```
Input Format:
- A single integer A.

Output Format:
- A single integer: the number of structurally unique BSTs that can be formed using 1...A.
```

#### Input/Output Examples

```
Example Input:
1
Example Output:
1
Example Explanation:
Only one BST with a single node.

Example Input:
2
Example Output:
2
Example Explanation:
Two BSTs: root=1 with right child=2, and root=2 with left child=1.
```

#### Solution

```js
/**
 * Count the number of structurally unique BSTs that can be formed with keys 1..n.
 * This count is the nth Catalan number:
 *   C(0) = 1
 *   C(n) = sum_{i=0..n-1} C(i) * C(n-1-i)
 *
 * We use bottom-up DP to compute C(0) ... C(n).
 *
 * Time:  O(n^2) — double loop over all partitions for each n
 * Space: O(n)   — store Catalan numbers up to n
 *
 * @param {number} n - number of distinct keys (values 1..n)
 * @returns {number} - number of unique BSTs
 */
function countUniqueBSTs(n) {
    // Guard: if n is negative, there are no valid BST counts to compute
    if (typeof n !== "number" || n < 0) return 0;

    // Create an array catalan where catalan[k] will store C(k), the k-th Catalan number
    const catalan = new Array(n + 1).fill(0);

    // Base case: there is exactly 1 empty BST (useful in the recurrence when a side is empty)
    catalan[0] = 1;

    // Fill catalan[1..n] using the standard Catalan recurrence
    for (let size = 1; size <= n; size++) {
        // Initialize accumulator for C(size)
        let totalForSize = 0;

        // Consider each key position as root:
        // left subtree has i nodes, right subtree has (size - 1 - i) nodes
        for (let leftSize = 0; leftSize <= size - 1; leftSize++) {
            const rightSize = size - 1 - leftSize; // Complementary size for the right subtree

            // Number of unique BSTs for this split is a product of possibilities on both sides
            totalForSize += catalan[leftSize] * catalan[rightSize];
        }

        // Store the computed Catalan value for 'size'
        catalan[size] = totalForSize;
    }

    // The result is the n-th Catalan number
    return catalan[n];
}

// example usage
console.log(countUniqueBSTs(1)); // expected output: 1
console.log(countUniqueBSTs(2)); // expected output: 2
console.log(countUniqueBSTs(3)); // expected output: 5

// Time Complexity: O(n^2)
// Space Complexity: O(n)
```

```python
def count_unique_bsts(n):
    return num_trees(n)
```

### 7. Max Sum Without Adjacent Elements | Dynamic Programming (House Robber on Column Max) **O(N), O(N)**

```
You are given a 2 × N grid of positive integers A.
You must pick a subset of cells to maximize the total sum subject to adjacency rules:
- You cannot pick two cells that are adjacent horizontally, vertically, or diagonally.

Goal: Return the maximum achievable sum.
Key observation: If you pick any cell in column i, you cannot pick any cell in columns i-1 or i+1,
and you also cannot pick the other cell in the same column i.
```

#### Constraints

```
1 <= N <= 20000
1 <= A[i][j] <= 2000
```

#### Input/Output Format

```
Input Format:
- A single 2D array A with exactly 2 rows and N columns.

Output Format:
- A single integer: the maximum possible sum.
```

#### Input/Output Examples

```
Example Input:
A = [
  [1],
  [2]
]
Example Output:
2
Example Explanation:
Only one column exists. Choose the larger of the two cells → 2.

Example Input:
A = [
  [1, 2, 3, 4],
  [2, 3, 4, 5]
]
Example Output:
8
Example Explanation:
Compress each column to its best pick: [max(1,2)=2, max(2,3)=3, max(3,4)=4, max(4,5)=5] = [2,3,4,5]
Now choose non-adjacent elements to maximize sum → 3 + 5 = 8.
```

#### Solution

```js
/**
 * Compute the maximum sum of selected numbers from a 2 × N grid such that
 * no two chosen cells are adjacent horizontally, vertically, or diagonally.
 *
 * Reduction:
 * - From each column i, you can choose at most one cell (top or bottom),
 *   because vertical adjacency forbids choosing both.
 * - If you choose any cell in column i, you cannot choose from i-1 or i+1
 *   due to horizontal/diagonal adjacency.
 * - Therefore, compress the grid into a 1D array bestPerColumn[i] = max(A[0][i], A[1][i]),
 *   and solve the classic "maximum sum of non-adjacent elements" (House Robber) on this array.
 *
 * Time:  O(N) — single pass to compress + single pass DP
 * Space: O(1) — constant extra space (beyond the input)
 *
 * @param {number[][]} grid - A 2D array with exactly 2 rows and N columns.
 * @returns {number} - The maximum achievable sum.
 */
function maxSumWithoutAdjacentIn2xNGrid(grid) {
    // Validate that grid is a proper 2xN matrix
    // Return 0 for invalid or empty inputs as no selection can be made.
    if (
        !Array.isArray(grid) ||
        grid.length !== 2 ||
        !Array.isArray(grid[0]) ||
        !Array.isArray(grid[1]) ||
        grid[0].length !== grid[1].length
    ) {
        return 0;
    }

    // Number of columns (N)
    const numCols = grid[0].length;

    // Edge case: if there are no columns, the max sum is 0.
    if (numCols === 0) return 0;

    // If there is only one column, we can select the larger of the two cells in that column.
    if (numCols === 1) {
        // Safely compute max using Math.max after ensuring they are numbers
        const top = Number(grid[0][0]) || 0;
        const bottom = Number(grid[1][0]) || 0;
        return Math.max(top, bottom);
    }

    // Step 1: Compress each column to the best pick from that column.
    // bestPerColumn[i] = max(grid[0][i], grid[1][i])
    // We don't need to store the entire compressed array; we can feed it directly into the DP.
    // But for clarity, we will compute values on the fly within the DP.

    // House Robber DP with O(1) extra space:
    // dp[i] = max sum considering columns up to i (0-based),
    // Transition: dp[i] = max(dp[i-1], dp[i-2] + bestPerColumn[i])
    // We'll maintain two variables:
    // - prev2 = dp[i-2]
    // - prev1 = dp[i-1]
    // and compute current dp[i] iteratively.

    // Initialize DP for the first two columns.

    // Column 0 best value
    const bestCol0 = Math.max(Number(grid[0][0]) || 0, Number(grid[1][0]) || 0);
    let prev2 = bestCol0; // dp[0]

    // Column 1 best value
    const bestCol1 = Math.max(Number(grid[0][1]) || 0, Number(grid[1][1]) || 0);
    let prev1 = Math.max(bestCol0, bestCol1); // dp[1] = max(dp[0], bestCol1)

    // Process columns 2..N-1
    for (let col = 2; col < numCols; col++) {
        // Best pick for this column
        const bestHere = Math.max(Number(grid[0][col]) || 0, Number(grid[1][col]) || 0);

        // If we skip this column: value stays prev1 (dp[col-1]).
        // If we take this column: we add bestHere to prev2 (dp[col-2]).
        const take = prev2 + bestHere; // take current column
        const skip = prev1;            // skip current column

        // Current optimal up to 'col'
        const current = Math.max(skip, take);

        // Slide the DP window:
        prev2 = prev1;    // dp[col-2] <- dp[col-1]
        prev1 = current;  // dp[col-1] <- dp[col]
    }

    // prev1 holds dp[N-1], the answer for all columns.
    return prev1;
}

// example usage
const grid1 = [
    [1],
    [2]
];
console.log(maxSumWithoutAdjacentIn2xNGrid(grid1)); // expected output: 2

const grid2 = [
    [1, 2, 3, 4],
    [2, 3, 4, 5]
];
console.log(maxSumWithoutAdjacentIn2xNGrid(grid2)); // expected output: 8

// Time Complexity: O(N)
// Space Complexity: O(1)
```

```python
def max_sum_adjacent(matrix):
    # Select max of each column, then adjacent columns cannot both be chosen (House Robber)
    n = len(matrix[0])
    if n == 0:
        return 0

    col_max = [max(matrix[0][i], matrix[1][i]) for i in range(n)]

    if n == 1:
        return col_max[0]

    prev2 = col_max[0]
    prev1 = max(col_max[0], col_max[1])

    for i in range(2, n):
        curr = max(prev1, prev2 + col_max[i])
        prev2 = prev1
        prev1 = curr

    return prev1


print(max_sum_adjacent([[1, 2, 3, 4], [2, 3, 4, 5]]))  # 8 (3 + 5)
```

### 8. N digit numbers | Dynamic Programming with Prefix Sums (Digit DP) **O(N), O(N)**

```
Find the count of A-digit positive numbers whose digits sum to B.
- A valid A-digit number cannot have a leading zero (first digit must be 1..9).
- Return the count modulo 1,000,000,007.
```

#### Constraints

```
1 <= A <= 1000
1 <= B <= 10000
```

#### Input/Output Format

```
Input Format:
- First argument: integer A (number of digits)
- Second argument: integer B (target sum of digits)

Output Format:
- Single integer: number of valid A-digit numbers with digit sum exactly B (mod 1e9+7)
```

#### Input/Output Examples

```
Example Input:
A = 2
B = 4
Example Output:
4
Example Explanation:
Valid numbers: 22, 31, 13, 40  → count = 4

Example Input:
A = 1
B = 3
Example Output:
1
Example Explanation:
Only valid number is 3.
```

#### Solution

```js
/**
 * Count A-digit numbers with digit sum exactly B (no leading zeros).
 * Uses Digit DP with prefix-sum optimization to achieve O(A * B) time.
 *
 * Idea:
 *  Let dp_prev[s] be the number of ways to form a number (with a certain number of leading digits fixed)
 *  that has digit-sum s.
 *
 *  Transition for the first position (1-based):
 *    - Allowed digits: 1..9 (no leading zero)
 *    - So dp_first[s] = 1 if 1 <= s <= 9 else 0
 *
 *  For each subsequent position:
 *    - Allowed digits: 0..9
 *    - dp_next[s] = sum_{d in 0..9 and s-d >= 0} dp_prev[s - d]
 *
 *  We compute these transitions efficiently with prefix sums:
 *    Let pref[k] = (dp_prev[0] + dp_prev[1] + ... + dp_prev[k]) mod M
 *    Then for a digit range [L, R] (here [0,9] or [1,9] at first step),
 *    dp_next[s] = pref[s - L] - pref[s - R - 1]  (clamped to valid indices, mod M)
 *
 *  Complexity:
 *    Time:  O(A * B) — for each of A positions we fill B+1 states with O(1) work via prefix sums
 *    Space: O(B)     — one rolling array for dp and one for prefix sums
 *
 *  Early pruning:
 *    - Minimum possible sum for A-digit number is 1 (first digit 1, rest 0)
 *    - Maximum possible sum is 9 * A
 *    - If B < 1 or B > 9*A, answer is 0 immediately
 *
 * @param {number} totalDigits - A (number of digits)
 * @param {number} targetSum   - B (desired digit sum)
 * @returns {number} - Count modulo 1e9+7
 */
function countNDigitNumbersWithSum(totalDigits, targetSum) {
    // Use a fixed modulus as required by the problem
    const MOD = 1_000_000_007;

    // Validate and normalize inputs
    const A = Number(totalDigits) | 0;   // ensure integer
    const B = Number(targetSum) | 0;     // ensure integer

    // Quick boundary checks using min/max digit-sums for A-digit numbers
    if (A <= 0) return 0;                // No digits → no valid A-digit number
    if (B < 1) return 0;                 // Leading digit at least 1 → sum can't be < 1
    if (B > 9 * A) return 0;             // Sum can't exceed 9 per digit

    // dp_prev[s] will represent the number of ways to reach sum s after processing some prefix of digits
    let dp_prev = new Array(B + 1).fill(0);

    // Initialize for the first digit: allowed digits are 1..9
    // For sums 1..9, there's exactly 1 way (choose that digit), provided s <= B
    const firstDigitMax = Math.min(9, B);
    for (let s = 1; s <= firstDigitMax; s++) {
        dp_prev[s] = 1; // One way to get sum s with one digit (that digit equals s)
    }

    // Process remaining digits (positions 2..A), each allowing digits 0..9
    for (let pos = 2; pos <= A; pos++) {
        // Build prefix sums of dp_prev to enable O(1) range sums
        const prefix = new Array(B + 1).fill(0);
        prefix[0] = dp_prev[0] % MOD;
        for (let s = 1; s <= B; s++) {
            // prefix[s] = sum_{k=0..s} dp_prev[k]
            const sumVal = prefix[s - 1] + dp_prev[s];
            prefix[s] = sumVal >= MOD ? sumVal - MOD : sumVal; // fast mod
        }

        // Compute dp_next from dp_prev using digit range [0..9] and prefix sums
        const dp_next = new Array(B + 1).fill(0);
        for (let s = 0; s <= B; s++) {
            // Need sum over dp_prev[s - d] for d in [0..9], s - d >= 0
            // That's dp_prev[s] + dp_prev[s-1] + ... + dp_prev[s-9], clamping at 0
            const left = Math.max(0, s - 9);
            const right = s; // s - 0
            // Range sum using prefix: sum(dp_prev[left..right]) = prefix[right] - prefix[left-1]
            let total = prefix[right];
            if (left > 0) {
                total -= prefix[left - 1];
            }
            // Normalize to [0, MOD)
            if (total < 0) total += MOD;
            dp_next[s] = total;
        }

        // Slide window: next iteration's "previous" becomes current dp
        dp_prev = dp_next;
    }

    // After A digits, the number of ways to have total sum B is dp_prev[B]
    return dp_prev[B] % MOD;
}

// example usage
console.log(countNDigitNumbersWithSum(2, 4)); // expected output: 4 (22, 31, 13, 40)
console.log(countNDigitNumbersWithSum(1, 3)); // expected output: 1 (3)

// Time Complexity: O(A * B)
// Space Complexity: O(B)
```

```python
def count_numbers_with_sum(A, B):
    return count_digit_sum_iterative(A, B)
```

## 5. DP 3: Knapsack

### 1. Target Sum / Subset Sum Problem | Recursion (Brute Force) | 2D DP (Tabulation) | 1D DP (Space Optimization) **O(N), O(N)**
```
You are given a set of non-negative integers and a target sum. The task is to determine whether there exists a subset of the given set whose sum is equal to the target sum.
```

#### 1. Recursive (Brute-force)

```js
/**
 * Determines if a subset with the given sum exists using recursion.
 * Time:  O(2^n) - For each element, we have two choices, leading to an exponential number of calls.
 * Space: O(n) - The depth of the recursion stack can go up to n.
 */
function targetSumRecursive(arr, target) {
  // Helper function to perform the recursion
  function canPartition(index, currentSum) {
    // Base case: If the current sum equals the target, we found a solution.
    if (currentSum === 0) {
      return true;
    }
    // Base case: If we've run out of numbers or the sum is negative, this path is invalid.
    if (index < 0 || currentSum < 0) {
      return false;
    }

    // Choice 1: Select the current element.
    // We include arr[index] and check if the remaining sum can be found in the rest of the array.
    const included = canPartition(index - 1, currentSum - arr[index]);

    // Choice 2: Reject the current element.
    // We skip arr[index] and check if the sum can be found in the rest of the array.
    const excluded = canPartition(index - 1, currentSum);

    // Return true if either choice leads to a solution.
    return included || excluded;
  }

  // Start the recursion from the last element of the array.
  return canPartition(arr.length - 1, target);
}

// Example usage
const arr1 = [3, 34, 12, 4, 5, 2];
const target1 = 41;
console.log(`Can sum to ${target1}?`, targetSumRecursive(arr1, target1)); // true (34+5+2)

const target2 = 9;
console.log(`Can sum to ${target2}?`, targetSumRecursive(arr1, target2)); // true (4+5 or 3+4+2)

const target3 = 30;
console.log(`Can sum to ${target3}?`, targetSumRecursive(arr1, target3)); // false (no subset)


/**
 * Solves the subset sum problem using recursion with memoization.
 * Time:  O(n * targetSum) - Each state (index, sum) is computed only once.
 * Space: O(n * targetSum) - For the memoization cache and recursion stack.
 */
function targetSumMemoized(arr, target) {
  // A cache to store results of subproblems. Key: "index-sum", Value: boolean
  const memo = new Map();

  function solve(index, currentSum) {
    // Base case: A solution is found
    if (currentSum === 0) {
      return true;
    }
    // Base case: Invalid path (out of bounds or sum is negative)
    if (index < 0 || currentSum < 0) {
      return false;
    }

    // Check if we have already computed the result for this state
    const key = `${index}-${currentSum}`;
    if (memo.has(key)) {
      return memo.get(key);
    }

    // Choice 1: Include the current element
    const included = solve(index - 1, currentSum - arr[index]);

    // Choice 2: Exclude the current element
    const excluded = solve(index - 1, currentSum);

    // Store the result and return
    const result = included || excluded;
    memo.set(key, result);
    return result;
  }

  return solve(arr.length - 1, target);
}

// Example usage
const arr = [3, 34, 12, 4, 5, 2];
const targetSum = 41;
console.log("Memoized Recursive:", targetSumMemoized(arr, targetSum)); // true
```

```python
def subset_sum_recursive(arr, target):
    def solve(idx, curr_sum):
        if curr_sum == target:
            return True
        if idx == len(arr) or curr_sum > target:
            return False

        # Include or exclude
        return solve(idx + 1, curr_sum + arr[idx]) or solve(idx + 1, curr_sum)

    return solve(0, 0)


print(subset_sum_recursive([3, 34, 4, 12, 5, 2], 9))  # True
```

#### 2. Dynamic Programming (Tabulation)

```js
/**
 * Determines if a subset with the given sum exists using dynamic programming.
 * Time:  O(n * target) - We iterate through a 2D array of size n * target.
 * Space: O(n * target) - We use a 2D array to store the results of subproblems.
 */
function targetSumTabulation(arr, target) {
  const n = arr.length;
  // dp[i][j] will be true if a sum `j` can be obtained using a subset of the first `i` elements.
  const dp = Array(n + 1).fill(false).map(() => Array(target + 1).fill(false));

  // Base case: A sum of 0 is always possible (by choosing an empty subset).
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true;
  }

  // Iterate through each element
  for (let i = 1; i <= n; i++) {
    const currentElement = arr[i - 1];
    // Iterate through each possible sum
    for (let j = 1; j <= target; j++) {
      // If we don't include the current element, the result is the same as for the previous `i-1` elements.
      const excluded = dp[i - 1][j];

      // If we can include the current element (i.e., the target sum `j` is greater than or equal to it)
      let included = false;
      if (j >= currentElement) {
        // The result is whether we could form the remaining sum `j - currentElement` with the previous `i-1` elements.
        included = dp[i - 1][j - currentElement];
      }

      // The current state is true if we can achieve the sum by either including OR excluding the element.
      dp[i][j] = included || excluded;
    }
  }

  // The final answer is in the bottom-right cell.
  return dp[n][target];
}

// Example usage
const arr4 = [3, 34, 12, 4, 5, 2];
const target4 = 41;
console.log(`Can sum to ${target4}?`, targetSumTabulation(arr4, target4)); // true

const target5 = 30;
console.log(`Can sum to ${target5}?`, targetSumTabulation(arr4, target5)); // false
```

```python
def subset_sum_tabulation(arr, target):
    n = len(arr)
    dp = [[False] * (target + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = True

    for i in range(1, n + 1):
        for j in range(1, target + 1):
            if arr[i - 1] <= j:
                dp[i][j] = dp[i - 1][j] or dp[i - 1][j - arr[i - 1]]
            else:
                dp[i][j] = dp[i - 1][j]

    return dp[n][target]


print(subset_sum_tabulation([3, 34, 4, 12, 5, 2], 9))  # True
```

#### 3. Space-Optimized Dynamic Programming

```js
/**
 * Space-optimized version of the target sum problem using only one row for DP.
 * Time:  O(n * target) - We still iterate through each element and each target sum.
 * Space: O(target) - We only need one array of size `target+1` to store the previous row's results.
 */
function targetSumSpaceOptimized(arr, target) {
  const n = arr.length;
  // dp[j] will be true if sum `j` is achievable.
  let dp = Array(target + 1).fill(false);

  // Base case: A sum of 0 is always possible.
  dp[0] = true;

  // Iterate through each element in the input array.
  for (let i = 0; i < n; i++) {
    const currentElement = arr[i];
    // Iterate backwards from the target sum down to the value of the current element.
    // We go backwards to use the results from the *previous* row (before processing the current element).
    for (let j = target; j >= currentElement; j--) {
      // If sum `j` is not yet achievable, check if it can be achieved by including the current element.
      // This is true if `dp[j - currentElement]` was achievable in the previous step.
      dp[j] = dp[j] || dp[j - currentElement];
    }
  }

  // The final answer is at dp[target].
  return dp[target];
}

// Example usage
const arr6 = [3, 34, 12, 4, 5, 2];
const target6 = 41;
console.log(`Can sum to ${target6}?`, targetSumSpaceOptimized(arr6, target6)); // true

const target7 = 30;
console.log(`Can sum to ${target7}?`, targetSumSpaceOptimized(arr6, target7)); // false
```

```python
def subset_sum_space_optimized(arr, target):
    dp = [False] * (target + 1)
    dp[0] = True

    for num in arr:
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]

    return dp[target]


print(subset_sum_space_optimized([3, 34, 4, 12, 5, 2], 9))  # True

# Time Complexity: O(N * target)
# Space Complexity: O(target)
```

### 2. Customized Shopping Recommendations | 0-1 Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) **O(N), O(N)**

```
Problem Statement: Given the Budget of the user and cost and happiness value of N items of the desired product. Compute the maximum happiness value you can get if you buy some products optimally, staying within the budget.
```

#### Input/Output

```
Input:
Budget = 200
Items:
  - Cost: 110, Happiness: 39
  - Cost: 180, Happiness: 57
  - Cost: 50, Happiness: 13
  - Cost: 120, Happiness: 44
  - Cost: 100, Happiness: 24

Output:
Maximum Happiness = 96 (Item 1 + Item 4: Cost=230 > 200. Item 2 + Item 3: Cost=230 > 200. Hmm, the example in the PDF seems to have a typo adding costs. Item 1 + Item 3: 110+50=160, Hap=39+13=52. Item 1 + Item 5: 110+100=210 > 200. Item 3 + Item 4: 50+120=170, Hap=13+44=57. Let's re-read the PDF example... It adds item 1 and 2 getting cost 290, which is wrong. It adds item 2 and 4 getting 300. Let's assume the happiness values were different. The core problem is clear, however. Example: Item 1 (110, 39) + Item 3 (50, 13) + Item 5 (100, 24) = Cost 260. The correct combination for Budget=200 would be Item 3 (50, 13) + Item 4 (120, 44) = Cost 170, Happiness 57. Or Item 1 (110, 39) + Item 3 (50, 13) = Cost 160, Happiness 52.  Let's use a standard example.
Budget = 7
Costs = [1, 3, 4, 5]
Values = [1, 4, 5, 7]
Output = 9 (Items with cost 3 and 4)
```

#### Theory / Observations

This problem is a classic example of the **0-1 Knapsack Problem**. The "budget" is the knapsack's capacity, "cost" is the item's weight, and "happiness" is the item's value. You can either take an item (0) or leave it (1).

The recursive structure is identical to the Target Sum problem. For each item, you can either:

1.  **Select**: Put the item in the cart. The happiness is `item.happiness + maxHappiness(remaining_items, budget - item.cost)`. This is only possible if `budget >= item.cost`.
2.  **Reject**: Do not put the item in the cart. The happiness is `maxHappiness(remaining_items, budget)`.

The optimal solution is the maximum of these two choices. We will implement the solutions requested in the PDF's TODO list: recursive, memoized, and tabulated.

#### Diagrams

**DP State Transition**

```
              +----------------------------------+
              | dp[i][j]                         |
              | (Max happiness using first `i`   |
              |  items with budget `j`)          |
              +----------------------------------+
                             |
                             |
             takes the Maximum of two choices
                           /     \
                          /       \
           +-------------+         +-------------------------------+
           |   NO CALL   |         |           YES CALL            |
           |  (Reject i) |         |           (Select i)          |
           +-------------+         +-------------------------------+
                 |                              |
      dp[i-1][j]                  dp[i-1][j - cost[i]] + happiness[i]
(Happiness from previous items,      (Max happiness from previous items
    with the same budget)            with remaining budget, plus current
                                          item's happiness)
```

#### 1. Recursion (Brute Force)
```js
/**
 * Finds the maximum happiness using a brute-force recursive approach.
 * Time:  O(2^n) - Exponential, as it explores every possible combination.
 * Space: O(n) - Due to the recursion stack depth.
 */
function maxHappinessRecursive(costs, happiness, budget) {
  const n = costs.length;

  function solve(index, currentBudget) {
    // Base case: If we have considered all items or have no budget left, no more happiness can be added.
    if (index < 0 || currentBudget <= 0) {
      return 0;
    }

    // Choice 1: Reject the current item.
    // We calculate the max happiness possible by skipping this item.
    const rejectHappiness = solve(index - 1, currentBudget);

    // Choice 2: Select the current item (if possible).
    let selectHappiness = 0;
    // Check if the current item's cost is within our budget.
    if (costs[index] <= currentBudget) {
      // If so, calculate the happiness from this choice:
      // current item's happiness + max happiness from the rest of the items with the reduced budget.
      selectHappiness = happiness[index] + solve(index - 1, currentBudget - costs[index]);
    }

    // Return the maximum happiness from either selecting or rejecting the item.
    return Math.max(rejectHappiness, selectHappiness);
  }

  return solve(n - 1, budget);
}

// Example usage
const costs1 = [110, 180, 50, 120, 100];
const happiness1 = [39, 57, 13, 44, 24];
const budget1 = 200;
// Optimal: item 3 (50, 13) + item 4 (120, 44) = cost 170, happiness 57
console.log("Max Happiness (Recursive):", maxHappinessRecursive(costs1, happiness1, budget1)); // 57
```

```python
def knapsack_01_recursive(values, weights, capacity):
    def solve(idx, rem_cap):
        if idx == len(values) or rem_cap == 0:
            return 0

        # Exclude
        max_val = solve(idx + 1, rem_cap)

        # Include
        if weights[idx] <= rem_cap:
            max_val = max(max_val, values[idx] + solve(idx + 1, rem_cap - weights[idx]))

        return max_val

    return solve(0, capacity)


print(knapsack_01_recursive([60, 100, 120], [10, 20, 30], 50))  # 220
```

#### 2. Memoization (Top-down DP)

```js
/**
 * Solves the 0-1 knapsack problem using memoization to avoid recomputing subproblems.
 * Time:  O(n * budget) - Each state (index, currentBudget) is computed only once.
 * Space: O(n * budget) - For the memoization table (cache).
 */
function maxHappinessMemoized(costs, happiness, budget) {
  const n = costs.length;
  // Create a cache to store the results of subproblems. Initialize with -1.
  const memo = Array(n).fill(null).map(() => Array(budget + 1).fill(-1));

  function solve(index, currentBudget) {
    // Base case: No items left or no budget.
    if (index < 0 || currentBudget <= 0) {
      return 0;
    }

    // If the result for this state is already computed, return it from the cache.
    if (memo[index][currentBudget] !== -1) {
      return memo[index][currentBudget];
    }

    // Choice 1: Reject the current item.
    const rejectHappiness = solve(index - 1, currentBudget);

    // Choice 2: Select the current item (if possible).
    let selectHappiness = 0;
    if (costs[index] <= currentBudget) {
      selectHappiness = happiness[index] + solve(index - 1, currentBudget - costs[index]);
    }

    // Store the computed result in the cache before returning.
    memo[index][currentBudget] = Math.max(rejectHappiness, selectHappiness);
    return memo[index][currentBudget];
  }

  return solve(n - 1, budget);
}

// Example usage
const costs2 = [110, 180, 50, 120, 100];
const happiness2 = [39, 57, 13, 44, 24];
const budget2 = 200;
console.log("Max Happiness (Memoized):", maxHappinessMemoized(costs2, happiness2, budget2)); // 57
```

```python
def knapsack_01_memo(values, weights, capacity):
    memo = {}

    def solve(idx, rem_cap):
        if idx == len(values) or rem_cap == 0:
            return 0
        if (idx, rem_cap) in memo:
            return memo[(idx, rem_cap)]

        max_val = solve(idx + 1, rem_cap)

        if weights[idx] <= rem_cap:
            max_val = max(max_val, values[idx] + solve(idx + 1, rem_cap - weights[idx]))

        memo[(idx, rem_cap)] = max_val
        return max_val

    return solve(0, capacity)


print(knapsack_01_memo([60, 100, 120], [10, 20, 30], 50))  # 220

# Time Complexity: O(N * W)
# Space Complexity: O(N * W)
```

#### 3. Tabulation (Bottom-up DP)

```js
/**
 * Solves the 0-1 knapsack problem using tabulation.
 * Time:  O(n * budget) - We iterate through a 2D array of size n * budget.
 * Space: O(n * budget) - For the DP table.
 */
function maxHappinessTabulation(costs, happiness, budget) {
  const n = costs.length;
  // dp[i][j] = max happiness with first `i` items and budget `j`.
  const dp = Array(n + 1).fill(0).map(() => Array(budget + 1).fill(0));

  // Iterate through each item.
  for (let i = 1; i <= n; i++) {
    const currentCost = costs[i - 1];
    const currentHappiness = happiness[i - 1];

    // Iterate through each possible budget.
    for (let j = 0; j <= budget; j++) {
      // Option 1: Reject the current item.
      // The happiness is the same as the max happiness with the previous i-1 items.
      const rejectHappiness = dp[i - 1][j];

      // Option 2: Select the current item (if budget allows).
      let selectHappiness = 0;
      if (j >= currentCost) {
        // Happiness = current item's happiness + max happiness from previous i-1 items with the remaining budget.
        selectHappiness = currentHappiness + dp[i - 1][j - currentCost];
      }

      // Store the maximum of the two options.
      dp[i][j] = Math.max(rejectHappiness, selectHappiness);
    }
  }

  // The final answer is in the bottom-right cell.
  return dp[n][budget];
}

// Example usage
const costs3 = [110, 180, 50, 120, 100];
const happiness3 = [39, 57, 13, 44, 24];
const budget3 = 200;
console.log("Max Happiness (Tabulation):", maxHappinessTabulation(costs3, happiness3, budget3)); // 57
```

```python
def knapsack_01_tabulation(values, weights, capacity):
    n = len(values)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]


print(knapsack_01_tabulation([60, 100, 120], [10, 20, 30], 50))  # 220

# Time Complexity: O(N * W)
# Space Complexity: O(N * W)
```

### 3. Fractional Knapsack | Greedy Algorithm **O(N), O(N)**

```
Given N cakes with their happiness and weight. Find maximum total happiness that can be kept in a bag with capacity = W. Cakes can be divided.
```

#### Input/Output

```
Input:
Capacity = 70
Items (weight, protein/value):
  - Tomato: 20, 200
  - Apples: 15, 180
  - Onion: 50, 250
  - Chicken: 10, 150
  - Potato: 25, 200
  - Mango: 12, 132
  - Seafood: 5, 100

Output:
Maximum Protein = 826
```

#### Theory / Observations

Since we can take fractions of items, the optimal strategy is a **greedy** one. We should prioritize items that give the most value per unit of weight.

The algorithm is as follows:

1.  Calculate the value-to-weight ratio (e.g., protein per kg) for each item.
2.  Sort the items in descending order based on this ratio.
3.  Iterate through the sorted items and add them to the knapsack:
      * If the entire item fits, take it all.
      * If only a fraction of the item fits, take as much as possible to fill the remaining capacity.
      * Stop when the knapsack is full.

This greedy approach works for the fractional version because we can always top up the knapsack with the best available item, ensuring no capacity is wasted.

#### Greedy Approach

```js
/**
 * Solves the Fractional Knapsack problem using a greedy approach.
 * Time:  O(n log n) - Dominated by the sorting step.
 * Space: O(n) - To store the items with their ratios.
 */
function fractionalKnapsack(weights, values, capacity) {
  const n = weights.length;

  // 1. Create an array of items with their value-to-weight ratio.
  const items = [];
  for (let i = 0; i < n; i++) {
    items.push({
      weight: weights[i],
      value: values[i],
      ratio: values[i] / weights[i],
    });
  }

  // 2. Sort items in descending order of their ratio.
  items.sort((a, b) => b.ratio - a.ratio);

  let totalValue = 0;
  let currentCapacity = capacity;

  // 3. Iterate through sorted items and fill the knapsack.
  for (const item of items) {
    if (currentCapacity === 0) {
      break; // Knapsack is full.
    }

    // If the whole item fits, take it all.
    if (item.weight <= currentCapacity) {
      totalValue += item.value;
      currentCapacity -= item.weight;
    } else {
      // If only a fraction fits, take that fraction.
      const fraction = currentCapacity / item.weight;
      totalValue += item.value * fraction;
      currentCapacity = 0; // The knapsack is now full.
    }
  }

  return totalValue;
}

// Example usage from the PDF
const weights = [20, 15, 50, 10, 25, 12, 5]; // Tomato, Apples, Onion, Chicken, Potato, Mango, Seafood
const values = [200, 180, 250, 150, 200, 132, 100]; // Protein values
const capacity = 70;

/* Ratios:
Seafood: 100/5 = 20
Chicken: 150/10 = 15
Onion: 250/50 = 5  <-- PDF has a typo, 250/50 is not 12.5. Assuming onion weight is 20, ratio is 12.5. Let's use the PDF's numbers. Let's recalculate based on PDF's implied order.
PDF Sorted Order (by ppk): Seafood(20), Chicken(15), Onion(12.5), Apples(12), Mango(11), Tomato(10), Potato(8)
Let's assume Onion weight is 20kg to get ratio 12.5. Let's use the text's data.

Correct ratios: Seafood(20), Chicken(15), Apples(12), Mango(11), Tomato(10), Potato(8), Onion(5)
1. Take Seafood (5kg). Capacity left: 65. Value: 100.
2. Take Chicken (10kg). Capacity left: 55. Value: 100+150=250.
3. Take Apples (15kg). Capacity left: 40. Value: 250+180=430.
4. Take Mango (12kg). Capacity left: 28. Value: 430+132=562.
5. Take Tomato (20kg). Capacity left: 8. Value: 562+200=762.
6. Take 8kg of Potato (ratio 8). Value: 762 + (8 * 8) = 762 + 64 = 826.
The calculation in the PDF seems to arrive at the same result.
*/

console.log("Max Value (Fractional Knapsack):", fractionalKnapsack(weights, values, capacity)); // 826
```

```python
def fractional_knapsack(values, weights, capacity):
    items = []
    for i in range(len(values)):
        items.append((values[i] / weights[i], values[i], weights[i]))

    # Sort by value/weight ratio descending
    items.sort(key=lambda x: x[0], reverse=True)

    total_value = 0.0
    curr_cap = capacity

    for ratio, val, wt in items:
        if curr_cap >= wt:
            curr_cap -= wt
            total_value += val
        else:
            total_value += ratio * curr_cap
            break

    return total_value


print(fractional_knapsack([60, 100, 120], [10, 20, 30], 50))  # 240.0

# Time Complexity: O(N log N)
# Space Complexity: O(N)
```

### 4. Unbounded Knapsack / 0-N Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) **O(N), O(N)**

```
Given N toys with their happiness and weight. Find maximum total happiness that can be kept in a bag with capacity W. Division of toys are not allowed and infinite toys of each type are available.
```

#### Input/Output

```
Input:
Capacity = 8 kg
Items (weight, value):
  - I0: 3, 2
  - I1: 4, 5
  - I2: 7, 1

Output:
Maximum value = 6 (Two of item I1: weight=4+4=8, value=5+5=10. Ah, wait. Example in PDF says 4+4=8, profit = 5+3=8? Typo. Let's re-run.
  - I0+I0 = w:6, v:4
  - I1+I1 = w:8, v:10
  - I0+I1 = w:7, v:7
The max value is 10. Let's use the other example from the PDF.)

Input:
Capacity (k) = 100
Weights = [1, 50]
Values = [1, 30]

Output:
Maximum value = 100 (by taking the item with weight 1 and value 1, one hundred times).
```

#### Theory / Observations

This variation is called the Unbounded Knapsack because you can select the same item multiple times. The recursive structure is slightly different from the 0-1 Knapsack.

For each item `i`:
1.  **Reject**: We don't take this item and move to consider item `i-1` with the same capacity. `knapsack(i-1, capacity)`
2.  **Select**: We take this item. The new value is `value[i] + knapsack(i, capacity - weight[i])`. Notice we recurse on the *same item* `i`, allowing it to be picked again. This is the key difference from 0-1 knapsack, where we would recurse on `i-1`.

The DP state transition for tabulation becomes:
`dp[i][j] = max(dp[i-1][j], values[i] + dp[i][j - weights[i]])`

#### 1. 2D DP (Memoization)
```js
/**
 * Solves the Unbounded Knapsack problem using memoization.
 * Time:  O(n * capacity) - Each state is computed once.
 * Space: O(n * capacity) - For the memoization cache.
 */
function unboundedKnapsackMemoized(weights, values, capacity) {
  const n = weights.length;
  // Create a cache to store results.
  const memo = Array(n).fill(null).map(() => Array(capacity + 1).fill(-1));

  function solve(index, currentCapacity) {
    // Base case: No items or no capacity left.
    if (index < 0 || currentCapacity <= 0) {
      return 0;
    }

    // Return cached result if available.
    if (memo[index][currentCapacity] !== -1) {
      return memo[index][currentCapacity];
    }

    // Choice 1: Reject the current item and move to the next.
    const rejectValue = solve(index - 1, currentCapacity);

    // Choice 2: Select the current item (if it fits).
    let selectValue = 0;
    if (weights[index] <= currentCapacity) {
      // Key difference: Recurse on the *same index* to allow multiple selections of the same item.
      selectValue = values[index] + solve(index, currentCapacity - weights[index]);
    }

    // Cache and return the best outcome.
    memo[index][currentCapacity] = Math.max(rejectValue, selectValue);
    return memo[index][currentCapacity];
  }

  return solve(n - 1, capacity);
}

// Example usage
const weights1 = [1, 50];
const values1 = [1, 30];
const capacity1 = 100;
console.log("Max Value (Unbounded Memoized):", unboundedKnapsackMemoized(weights1, values1, capacity1)); // 100

const weights2 = [3, 4, 7];
const values2 = [2, 5, 1];
const capacity2 = 8;
console.log("Max Value (Unbounded Memoized):", unboundedKnapsackMemoized(weights2, values2, capacity2)); // 10 (4+4)
```

```python
def unbounded_knapsack_memo(values, weights, capacity):
    memo = {}

    def solve(rem_cap):
        if rem_cap == 0:
            return 0
        if rem_cap in memo:
            return memo[rem_cap]

        max_val = 0
        for i in range(len(values)):
            if weights[i] <= rem_cap:
                max_val = max(max_val, values[i] + solve(rem_cap - weights[i]))

        memo[rem_cap] = max_val
        return max_val

    return solve(capacity)


print(unbounded_knapsack_memo([10, 40, 50, 70], [1, 3, 4, 5], 8))  # 110

# Time Complexity: O(N * W)
# Space Complexity: O(W)
```

#### 2. 2D DP (Tabulation)
```js
/**
 * Solves the Unbounded Knapsack problem using tabulation.
 * Time:  O(n * capacity) - Iterating through the DP table.
 * Space: O(n * capacity) - For the DP table.
 */
function unboundedKnapsackTabulation(weights, values, capacity) {
  const n = weights.length;
  // dp[i][j] = max value with first `i` items and capacity `j`.
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const currentWeight = weights[i - 1];
    const currentValue = values[i - 1];

    for (let j = 0; j <= capacity; j++) {
      // Choice 1: Reject the item. Value is the same as with i-1 items.
      const rejectValue = dp[i - 1][j];

      // Choice 2: Select the item (if it fits).
      let selectValue = 0;
      if (j >= currentWeight) {
        // Key difference: Use dp[i] (current row) for the subproblem, not dp[i-1].
        // This means we are allowed to use the current item `i` again.
        selectValue = currentValue + dp[i][j - currentWeight];
      }

      dp[i][j] = Math.max(rejectValue, selectValue);
    }
  }

  return dp[n][capacity];
}

// Example usage
const weights3 = [1, 50];
const values3 = [1, 30];
const capacity3 = 100;
console.log("Max Value (Unbounded Tabulation):", unboundedKnapsackTabulation(weights3, values3, capacity3)); // 100

const weights4 = [3, 4, 7];
const values4 = [2, 5, 1];
const capacity4 = 8;
console.log("Max Value (Unbounded Tabulation):", unboundedKnapsackTabulation(weights4, values4, capacity4)); // 10
```

```python
def unbounded_knapsack_tabulation(values, weights, capacity):
    dp = [0] * (capacity + 1)

    for w in range(1, capacity + 1):
        for i in range(len(values)):
            if weights[i] <= w:
                dp[w] = max(dp[w], values[i] + dp[w - weights[i]])

    return dp[capacity]


print(unbounded_knapsack_tabulation([10, 40, 50, 70], [1, 3, 4, 5], 8))  # 110

# Time Complexity: O(N * W)
# Space Complexity: O(W)
```

## 6. Graphs 1: Introduction, DFS & Cycle Detection

### 1. Storing a Graph | Adjacency Matrix **O(N), O(N)**
In any question they will never give us a graph directly, we have to create a graph ad then solve the question.

An adjacency matrix is a 2D array `graph[V][V]`, where `V` is the number of vertices.
  * `graph[u][v] = 1` if there is an edge from vertex `u` to `v`.
  * `graph[u][v] = 0` if there is no edge.
  * For weighted graphs, `graph[u][v] = weight` instead of 1.

**Graph to be represented:**
```
       (1)---(3)---(4)---(6)
        | \   |   /
        |  \  |  /
       (2)---(5)
```

**Adjacency Matrix for the graph above (n=6):**
|       | 0   | 1   | 2   | 3   | 4   | 5   | 6   |
| ----- | --- | --- | --- | --- | --- | --- | --- |
| **0** | 0   | 0   | 0   | 0   | 0   | 0   | 0   |
| **1** | 0   | 0   | 1   | 1   | 0   | 1   | 0   |
| **2** | 0   | 1   | 0   | 0   | 0   | 1   | 0   |
| **3** | 0   | 1   | 0   | 0   | 1   | 1   | 0   |
| **4** | 0   | 0   | 0   | 1   | 0   | 1   | 1   |
| **5** | 0   | 1   | 1   | 1   | 1   | 0   | 0   |
| **6** | 0   | 0   | 0   | 0   | 1   | 0   | 0   |

#### 1. Adjacency Matrix Implementation

```js
/**
 * Creates a graph representation using an adjacency matrix.
 * @param {number[][]} edges - A list of edges, where each edge is [u, v].
 * @param {number} numVertices - The total number of vertices in the graph (1-based).
 * @returns {number[][]} - The adjacency matrix.
 * Time: O(E) to build, where E is the number of edges. Querying for an edge is O(1).
 * Space: O(V*V) where V is the number of vertices.
 */
function createGraphAdjacencyMatrix(edges, numVertices) {
  // Initialize an (n+1)x(n+1) matrix with zeros for 1-based indexing.
  const graph = Array(numVertices + 1).fill(0).map(() => Array(numVertices + 1).fill(0));

  // Iterate through each edge provided.
  for (let i = 0; i < edges.length; i++) {
    // Get the two vertices of the current edge.
    const u = edges[i][0];
    const v = edges[i][1];

    // For an un-directed graph, mark the connection in both directions.
    graph[u][v] = 1; // Edge from u to v
    graph[v][u] = 1; // Edge from v to u
  }

  return graph;
}

// Example usage:
const edges = [[1, 3], [1, 2], [3, 4], [3, 5], [2, 5], [4, 5], [4, 6]];
const n = 6;
console.log(createGraphAdjacencyMatrix(edges, n));

// Time Complexity to create: O(E) where E is the number of edges.
// Space Complexity: O(V^2) where V is the number of vertices.
```

```python
def create_adj_matrix(n, edges, directed=False):
    # Using 1-based indexing
    matrix = [[0] * (n + 1) for _ in range(n + 1)]

    for u, v in edges:
        matrix[u][v] = 1
        if not directed:
            matrix[v][u] = 1

    return matrix


# Time Complexity: O(N^2)
# Space Complexity: O(N^2)
```

**Advantages:**
1.  Easy to implement.
2.  Checking if an edge exists between two vertices `(u, v)` is very fast, O(1).
3.  Adding or removing an edge is also O(1).

**Disadvantages:**
1.  Consumes a lot of space, O(V^2), which is inefficient for sparse graphs (graphs with few edges).

### 2. Storing a Graph | Adjacency List **O(N), O(N)**
An adjacency list represents a graph as an array of lists. The size of the array is equal to the number of vertices.
  * `graph[i]` stores a list of vertices adjacent to vertex `i`.
  * For weighted graphs, the list stores pairs of `{neighbor, weight}`.

#### Diagrams

**Unweighted Graph Representation**
```
      (1)----(2)
      / \    /
     /   \  /
    (5)---(3)----(4)----(6)
```

Adjacency List:
  * 1 -> [2, 5, 3]
  * 2 -> [1, 3]
  * 3 -> [1, 5, 2, 4]
  * 4 -> [3, 6]
  * 5 -> [1, 3]
  * 6 -> [4]

**Weighted Graph Representation**
```
    1 --(5)-- 2
    | \
   (7) (wt)
    |   \
    3 --(9)-- 4
```

Adjacency List (stores pairs of `{neighbor, weight}`):
  * 1 -> [{nbr: 2, wt: 5}, {nbr: 3, wt: 7}]
  * 2 -> [{nbr: 1, wt: 5}]
  * 3 -> [{nbr: 1, wt: 7}, {nbr: 4, wt: 9}]
  * 4 -> [{nbr: 3, wt: 9}]

#### 1. Adjacency List Implementation

```js
/**
 * Represents a pair for weighted graphs.
 * @param {number} neighbor - The adjacent vertex.
 * @param {number} weight - The weight of the edge.
 */
class Pair {
  constructor(neighbor, weight) {
    this.neighbor = neighbor;
    this.weight = weight;
  }
}

/**
 * Creates a graph representation using an adjacency list.
 * @param {number[][]} edges - A list of edges, where each edge is [u, v, weight].
 * @param {number} numVertices - The total number of vertices in the graph (1-based).
 * @returns {Array<Array<Pair>>} - The adjacency list.
 * Time: O(V + E)
 * Space: O(V + E)
 */
function createGraphAdjacencyList(edges, numVertices) {
  // Initialize an array of empty lists. Size is n+1 for 1-based indexing.
  const graph = Array(numVertices + 1).fill(null).map(() => []);

  // Iterate through all edges to build the list.
  for (let i = 0; i < edges.length; i++) {
    // Extract vertices and weight from the edge info.
    const u = edges[i][0];
    const v = edges[i][1];
    const weight = edges[i][2];

    // For an un-directed graph, add an edge from u to v and from v to u.
    graph[u].push(new Pair(v, weight));
    graph[v].push(new Pair(u, weight));
  }
  return graph;
}

// Example usage:
const weightedEdges = [[1, 2, 5], [1, 3, 7], [3, 4, 9]];
const numNodes = 4;
const adjList = createGraphAdjacencyList(weightedEdges, numNodes);
console.log(JSON.stringify(adjList));

// Time Complexity: O(V + E)
// Space Complexity: O(V + 2E) for undirected graphs, which simplifies to O(V + E).
```

```python
from collections import defaultdict


def create_adj_list(edges, directed=False):
    adj = defaultdict(list)

    for edge in edges:
        if len(edge) == 3:
            u, v, wt = edge
            adj[u].append((v, wt))
            if not directed:
                adj[v].append((u, wt))
        else:
            u, v = edge
            adj[u].append(v)
            if not directed:
                adj[v].append(u)

    return adj


# Time Complexity: O(V + E)
# Space Complexity: O(V + E)
```

### 3. Traversal in UD Graph | Depth First Search (Undirected Graph) **O(N), O(N)**
DFS is a traversal algorithm that explores as far as possible along each branch before backtracking. It often uses a stack (implicitly via recursion). To avoid infinite loops in graphs with cycles, we must keep track of visited vertices.

#### Theory / Observations

1.  Start from a source vertex `src`.
2.  Mark `src` as visited.
3.  Explore one of its unvisited neighbors.
4.  Recursively call DFS on that neighbor.
5.  Continue until all reachable vertices from `src` have been visited.
6.  To handle disconnected graphs, you would loop through all vertices and start a DFS from any vertex that has not yet been visited.

#### Diagrams

**Graph for DFS Traversal**
```
      (0)-----(1)-----(2)
       |       |
       |       |
      (3)-----(4)-----(5)
               |
               |
              (6)
```

**DFS Path starting from `src = 0`:**
0 -> 1 -> 2 -> 4 -> 3 -> 5 -> 6 (One possible path, depends on neighbor order)

#### Dry Run
`src = 0`
1.  `dfs(0)`: Mark 0 as visited. `visited = [T, F, F, F, F, F, F]`
2.  Go to neighbor 1. `dfs(1)`. Mark 1 as visited. `visited = [T, T, F, F, F, F, F]`
3.  From 1, go to neighbor 2. `dfs(2)`. Mark 2 as visited. `visited = [T, T, T, F, F, F, F]`
4.  From 2, go to neighbor 4. `dfs(4)`. Mark 4 as visited. `visited = [T, T, T, T, F, F, F]`
5.  From 4, go to neighbor 3. `dfs(3)`. Mark 3 as visited. `visited = [T, T, T, T, T, F, F]`
6.  From 3, neighbors are 0 and 4, both visited. Return.
7.  From 4, go to neighbor 5. `dfs(5)`. Mark 5 as visited. `visited = [T, T, T, T, T, T, F]`
8.  From 5, neighbor 4 is visited. Return.
9.  From 4, go to neighbor 6. `dfs(6)`. Mark 6 as visited. `visited = [T, T, T, T, T, T, T]`
10. All neighbors visited, backtrack up the call stack.

#### 1. DFS Traversal

```js
/**
 * Helper function for DFS traversal
 * @param {number} source - The current vertex to visit.
 * @param {Array<Array<{neighbor: number, weight: number}>>} graph - The adjacency list.
 * @param {boolean[]} visited - An array to keep track of visited nodes.
 */
function DFS(source, graph, visited) {
    // Mark the current source node as visited.
    visited[source] = true;
    process.stdout.write(source + " ");

    // Get all neighbors of the current source node.
    const neighbors = graph[source];

    // Iterate through all neighbors.
    for (const pair of neighbors) {
        const neighborNode = pair.neighbor;
        // If the neighbor has not been visited yet, recursively call DFS on it.
        if (!visited[neighborNode]) {
            DFS(neighborNode, graph, visited);
        }
    }
}

/**
 * Main function to start the graph traversal.
 * @param {Array<Array<{neighbor: number, weight: number}>>} graph - The adjacency list.
 * @param {number} numVertices - The total number of vertices.
 */
function traverseGraph(graph, numVertices) {
    // Create a boolean array to track visited vertices, initialized to false.
    const visitedDisconnected = new Array(numVertices).fill(false);
    const visitedConnected = new Array(numVertices).fill(false);

    // OPTION 1: Logic for Disconnected Graphs (loops through all nodes)
    for (let i = 0; i < numVertices; i++) {
        if (!visitedDisconnected[i]) {
            DFS(i, graph, visitedDisconnected);
        }
    }
    console.log();

    // OPTION 2: Logic for Connected Graphs (starts strictly from node 0)
    // We pass '0' as the starting source index.
    DFS(0, graph, visitedConnected);
    console.log();
}

// Example usage:
const dfsEdges = [
    [0, 1, 0], [0, 3, 0], [1, 2, 0], [1, 4, 0],
    [2, 4, 0], [3, 4, 0], [4, 5, 0], [4, 6, 0]
];
const dfsNumVertices = 7;

// Create adjacency list
const dfsGraph = Array(dfsNumVertices).fill(null).map(() => []);
for (const edge of dfsEdges) {
    dfsGraph[edge[0]].push({ neighbor: edge[1], weight: edge[2] });
    dfsGraph[edge[1]].push({ neighbor: edge[0], weight: edge[2] });
}

traverseGraph(dfsGraph, dfsNumVertices);

// Time Complexity: O(V + 2E) because every vertex is visited once and every edge is visited twice.
// Space Complexity: O(V) for the visited array and the recursion stack depth in the worst case (for a skewed graph).
```

```python
def dfs_traversal(adj, start_node, num_nodes):
    visited = [False] * (num_nodes + 1)
    traversal = []

    def dfs(node):
        visited[node] = True
        traversal.append(node)
        for neighbor in adj[node]:
            if not visited[neighbor]:
                dfs(neighbor)

    dfs(start_node)
    return traversal


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

### 4. Detect Cycle in a directed graph **O(N), O(N)**

#### 1. Brute-force Backtracking
This approach, suggested in the notes, involves running a full cycle check from every single node and using a single `visited` array which is reset for different paths by backtracking. This leads to a very high time complexity as many paths are re-explored.

```js
/**
 * Checks for a cycle starting from a specific source node using backtracking.
 * This is the inefficient approach described in the notes.
 *
 * @param {number} src - The source node for the current DFS path.
 * @param {boolean[]} visitedInPath - Tracks nodes visited in the current path.
 * @param {Array<Array<{neighbor: number}>>} graph - The adjacency list of the graph.
 * @returns {boolean} - True if a cycle is found, otherwise false.
 * Time: O(V * (V+E)) - Inefficient because it can re-explore paths.
 * Space: O(V) for recursion stack and visited array.
 */
function checkCycleInefficient(src, visitedInPath, graph) {
  // Go through all neighbors of the source node.
  for (const neighborInfo of graph[src]) {
    const neighbor = neighborInfo.neighbor;

    // If the neighbor is already in the current path, we found a cycle.
    if (visitedInPath[neighbor] === true) {
      return true; // Cycle detected
    } else {
      // Mark this neighbor as visited for the current path.
      visitedInPath[neighbor] = true;

      // Recursively check for a cycle from this neighbor.
      if (checkCycleInefficient(neighbor, visitedInPath, graph)) {
        return true; // Propagate the cycle detection result.
      }

      // Backtrack: Un-mark the neighbor as we return from this path.
      // This allows it to be visited via other paths.
      visitedInPath[neighbor] = false;
    }
  }
  // No cycle found starting from this source node in this path.
  return false;
}

/**
 * Main function to detect a cycle in a directed graph.
 * @param {number} numVertices - The total number of vertices.
 * @param {Array<Array<{neighbor: number}>>} graph - The adjacency list.
 * @returns {boolean}
 */
function hasCycleInefficient(numVertices, graph) {
  // We must check for a cycle starting from each and every vertex.
  // This is because the graph might be disconnected or a cycle might not be reachable from node 0.
  for (let v = 0; v < numVertices; v++) {
    const visitedInPath = new Array(numVertices).fill(false);
    visitedInPath[v] = true;

    if (checkCycleInefficient(v, visitedInPath, graph)) {
      return true; // If any starting point leads to a cycle, return true.
    }
  }

  return false; // No cycles found from any starting point.
}
// Time Complexity: O(V * (V+E)) - Very high due to repeated computations.
// Space Complexity: O(V) for the visited array and recursion stack.
```

```python
def has_cycle_undirected(adj, num_nodes):
    visited = [False] * (num_nodes + 1)

    def dfs(node, parent):
        visited[node] = True
        for neighbor in adj[node]:
            if not visited[neighbor]:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False

    for i in range(1, num_nodes + 1):
        if not visited[i]:
            if dfs(i, -1):
                return True

    return False


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

#### 2. Optimized DFS with 2 Visited Arrays (3 states)
This is the standard and efficient approach. We use a global `visited` array to avoid re-processing nodes that are part of a path that has already been confirmed to be acyclic. The `recursionStack` array tracks the current path.

```js
/**
 * Efficiently checks for a cycle using a global visited array and a path-specific recursion stack array.
 * @param {number} src - The current source node.
 * @param {boolean[]} visited - Tracks all nodes visited so far across all DFS calls.
 * @param {boolean[]} recursionStack - Tracks nodes currently in the recursion stack for the current DFS.
 * @param {Array<Array<{neighbor: number}>>} graph - The adjacency list.
 * @returns {boolean} - True if a cycle is detected.
 */
function detectCycleUtil(src, visited, recursionStack, graph) {
  // Mark the current node as visited and add it to the current recursion stack.
  visited[src] = true;
  recursionStack[src] = true;

  // Iterate over all neighbors of the current node.
  for (const neighborInfo of graph[src]) {
    const neighbor = neighborInfo.neighbor;

    // If the neighbor hasn't been visited yet, recurse on it.
    if (!visited[neighbor]) {
      // If the recursive call finds a cycle, propagate the result up.
      if (detectCycleUtil(neighbor, visited, recursionStack, graph)) {
        return true;
      }
    }
    // If the neighbor is already in the current recursion stack, a cycle is found.
    else if (recursionStack[neighbor]) {
      return true;
    }
  }

  // Backtrack: Remove the current node from the recursion stack as we are done exploring from it.
  recursionStack[src] = false;

  // No cycle was found starting from this node.
  return false;
}

/**
 * Main function to check for cycles in a directed graph.
 * @param {number} numVertices - Total number of vertices.
 * @param {number[][]} edges - List of directed edges [u, v].
 * @returns {boolean}
 */
function hasCycle(numVertices, edges) {
  // Build the adjacency list for the graph.
  const graph = Array(numVertices).fill(null).map(() => []);
  for (const edge of edges) {
    graph[edge[0]].push({ neighbor: edge[1] });
  }

  // `visited` array tracks nodes that have ever been visited.
  const visited = new Array(numVertices).fill(false);
  // `recursionStack` tracks nodes in the current DFS path.
  const recursionStack = new Array(numVertices).fill(false);

  // We need to check from every vertex in case the graph is disconnected.
  for (let i = 0; i < numVertices; i++) {
    // If the node has not been visited yet, start a new DFS from it.
    if (!visited[i]) {
      if (detectCycleUtil(i, visited, recursionStack, graph)) {
        return true; // Cycle found
      }
    }
  }

  // If we get through all nodes and find no cycles, the graph is acyclic.
  return false;
}

// Example usage
const cyclicEdges = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 1]];
console.log("Graph 1 has cycle:", hasCycle(5, cyclicEdges)); // Expected: true

const acyclicEdges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3]];
console.log("Graph 2 has cycle:", hasCycle(5, acyclicEdges)); // Expected: false

// Time Complexity: O(V + E) - Each vertex and edge is processed once.
// Space Complexity: O(V) - For the visited arrays and recursion stack.
```

```python
def has_cycle_directed_colors(adj, num_nodes):
    # 0 = unvisited, 1 = visiting (in recursion stack), 2 = visited
    state = [0] * (num_nodes + 1)

    def dfs(node):
        state[node] = 1  # visiting
        for neighbor in adj[node]:
            if state[neighbor] == 1:
                return True  # Back edge found
            if state[neighbor] == 0:
                if dfs(neighbor):
                    return True
        state[node] = 2  # visited
        return False

    for i in range(1, num_nodes + 1):
        if state[i] == 0:
            if dfs(i):
                return True

    return False


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

### 5. Cycle in Directed Graph | BFS | DFS Kahn's Algorithm **O(N), O(N)**

#### 1. Using Depth First Search (DFS)

To detect a cycle in a directed graph, we can use a Depth First Search (DFS) traversal. The core idea is to identify **back edges**. A back edge is an edge from a node `u` to one of its ancestors `v` in the DFS tree.

We use two boolean arrays to keep track of the state of each node:

1.  `visited`: This array marks nodes that have been visited at any point during the entire traversal. This helps in handling disconnected components and avoids redundant processing.
2.  `recursionStack` (or `pathVisited`): This array marks nodes that are currently in the recursion stack of the *current* DFS path.

**Algorithm:**

1.  Build an adjacency list representation of the graph from the input edges.
2.  Initialize `visited` and `recursionStack` arrays with `false`.
3.  Iterate through all nodes from 1 to `A`. If a node hasn't been visited, start a DFS traversal from it.
4.  In the DFS function for a node `u`:
    a. Mark `u` as visited and also add it to the `recursionStack`.
    b. For each neighbor `v` of `u`:
    i. If `v` has not been visited, make a recursive call for `v`. If this call returns `true` (cycle detected), propagate `true` up.
    ii. If `v` is already in the `recursionStack`, it means we have found a back edge from `u` to `v`. A cycle exists, so return `true`.
    c. After exploring all neighbors of `u`, backtrack by removing `u` from the `recursionStack`.
5.  If the entire graph is traversed without finding any back edges, no cycle exists. Return `0`. Otherwise, return `1`.

This approach correctly handles disconnected graphs by initiating a DFS for each unvisited node.

```js
/**
 * Detects a cycle in a directed graph using Depth First Search.
 * @param {number} A The number of nodes in the graph.
 * @param {number[][]} B The matrix of edges.
 * @returns {number} 1 if a cycle exists, 0 otherwise.
 */
function hasCycleDFS(A, B) {
  // Create an adjacency list to represent the graph.
  // We use A+1 because nodes are 1-indexed.
  const adj = Array.from({ length: A + 1 }, () => []);

  // Populate the adjacency list from the input edge matrix B.
  for (const edge of B) {
    const u = edge[0]; // source node
    const v = edge[1]; // destination node
    adj[u].push(v);
  }

  // visited: keeps track of all visited nodes across all DFS traversals.
  const visited = new Array(A + 1).fill(false);

  // recursionStack: keeps track of nodes in the current DFS path.
  // This is crucial for detecting back edges in a directed graph.
  const recursionStack = new Array(A + 1).fill(false);

  // Helper function to perform DFS traversal from a given node.
  function detectCycle(node) {
    // Mark the current node as visited and add it to the current recursion stack.
    visited[node] = true;
    recursionStack[node] = true;

    // Iterate over all neighbors of the current node.
    for (const neighbor of adj[node]) {
      // If the neighbor has not been visited yet, recursively call DFS.
      if (!visited[neighbor]) {
        // If the recursive call finds a cycle, propagate true up the call stack.
        if (detectCycle(neighbor)) {
          return true;
        }
      }
      // If the neighbor is already in the current recursion stack, we have found a back edge.
      // This indicates a cycle.
      else if (recursionStack[neighbor]) {
        return true;
      }
    }

    // Backtrack: Once we have explored all paths from the current node,
    // remove it from the recursion stack before returning.
    recursionStack[node] = false;

    // No cycle was found in the paths starting from this node.
    return false;
  }

  // Iterate through all nodes to handle disconnected graphs.
  for (let i = 1; i <= A; i++) {
    // If a node has not been visited, start a new DFS traversal.
    if (!visited[i]) {
      // If the DFS traversal finds a cycle, we can immediately return 1.
      if (detectCycle(i)) {
        return 1;
      }
    }
  }

  // If we have traversed the entire graph and found no cycles, return 0.
  return 0;
}

// Example Usage
const A1 = 5;
const B1 = [ [1, 2], [4, 1], [2, 4], [3, 4], [5, 2], [1, 3] ];
console.log(`Cycle detected in graph 1: ${hasCycleDFS(A1, B1)}`); // Expected output: 1

const A2 = 5;
const B2 = [ [1, 2], [2, 3], [3, 4], [4, 5] ];
console.log(`Cycle detected in graph 2: ${hasCycleDFS(A2, B2)}`); // Expected output: 0

// Time Complexity: O(A + M), where A is the number of vertices and M is the number of edges.
// Each vertex and edge is visited once.
// Space Complexity: O(A + M). O(A + M) for the adjacency list and O(A) for the visited arrays
// and the recursion stack depth.
```

```python
def detect_cycle_dfs(adj, num_nodes):
    visited = [False] * (num_nodes + 1)
    rec_stack = [False] * (num_nodes + 1)

    def dfs(node):
        visited[node] = True
        rec_stack[node] = True

        for neighbor in adj[node]:
            if not visited[neighbor]:
                if dfs(neighbor):
                    return True
            elif rec_stack[neighbor]:
                return True

        rec_stack[node] = False
        return False

    for i in range(1, num_nodes + 1):
        if not visited[i]:
            if dfs(i):
                return True

    return False


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

#### 2. Using BFS (Kahn's Topological Sort Algorithm)

A cycle in a directed graph can also be detected using a modification of Breadth-First Search (BFS), specifically Kahn's algorithm for topological sorting.

A topological sort is a linear ordering of vertices such that for every directed edge from vertex `u` to `v`, `u` comes before `v` in the ordering. Such an ordering is only possible if the graph is a Directed Acyclic Graph (DAG).

**Algorithm:**

1.  **Compute In-degrees:** Calculate the in-degree (number of incoming edges) for every node in the graph.
2.  **Initialize Queue:** Create a queue and enqueue all nodes with an in-degree of 0.
3.  **Process Nodes:**
    a. Initialize a counter for visited nodes to 0.
    b. While the queue is not empty, dequeue a node `u`.
    c. Increment the visited nodes counter.
    d. For each neighbor `v` of `u`, decrement its in-degree.
    e. If the in-degree of `v` becomes 0, enqueue `v`.
4.  **Check for Cycle:** After the loop, if the visited nodes counter is equal to the total number of nodes `A`, it means a valid topological sort was possible and the graph is acyclic. If the count is less than `A`, it implies that some nodes were not visited because their in-degrees never became 0, which happens only if they are part of a cycle.

<!-- end list -->

```js
/**
 * Detects a cycle in a directed graph using Kahn's Algorithm (Topological Sort).
 * @param {number} A The number of nodes in the graph.
 * @param {number[][]} B The matrix of edges.
 * @returns {number} 1 if a cycle exists, 0 otherwise.
 */
function hasCycleBFS(A, B) {
  // Create an adjacency list.
  const adj = Array.from({ length: A + 1 }, () => []);

  // Create an array to store the in-degree of each node.
  const inDegree = new Array(A + 1).fill(0);

  // Build the adjacency list and calculate in-degrees for all nodes.
  for (const edge of B) {
    const u = edge[0];
    const v = edge[1];
    adj[u].push(v);
    inDegree[v]++;
  }

  // Create a queue for the BFS-based topological sort.
  const queue = [];

  // Initialize the queue with all nodes that have an in-degree of 0.
  for (let i = 1; i <= A; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // Count of nodes included in the topological sort.
  let visitedNodesCount = 0;

  // Process nodes from the queue.
  while (queue.length > 0) {
    const node = queue.shift();
    visitedNodesCount++;

    // For each neighbor, reduce its in-degree.
    for (const neighbor of adj[node]) {
      inDegree[neighbor]--;

      // If a neighbor's in-degree becomes 0, add it to the queue.
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If the number of nodes in the topological sort is less than the total number
  // of nodes in the graph, then the graph has a cycle.
  return visitedNodesCount < A ? 1 : 0;
}


// Example Usage
const A3 = 5;
const B3 = [ [1, 2], [4, 1], [2, 4], [3, 4], [5, 2], [1, 3] ];
console.log(`Cycle detected in graph 1: ${hasCycleBFS(A3, B3)}`); // Expected output: 1

const A4 = 5;
const B4 = [ [1, 2], [2, 3], [3, 4], [4, 5] ];
console.log(`Cycle detected in graph 2: ${hasCycleBFS(A4, B4)}`); // Expected output: 0


// Time Complexity: O(A + M), where A is the number of vertices and M is the number of edges.
// Building adj list and in-degrees is O(A+M). The while loop processes each vertex and edge once.
// Space Complexity: O(A + M). O(A + M) for the adjacency list and O(A) for the in-degree array and the queue.
```

```python
from collections import deque


def detect_cycle_kahns(adj, num_nodes):
    in_degree = [0] * (num_nodes + 1)
    for u in adj:
        for v in adj[u]:
            in_degree[v] += 1

    queue = deque([i for i in range(1, num_nodes + 1) if in_degree[i] == 0])
    count = 0

    while queue:
        node = queue.popleft()
        count += 1
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If count != num_nodes, there is a cycle
    return count != num_nodes


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

A path can be found using any standard graph traversal algorithm, like **Breadth-First Search (BFS)** or **Depth-First Search (DFS)**. Both methods start at the source node (`1`) and explore its neighbors, and then their neighbors, and so on, until the destination node (`A`) is found or all reachable nodes have been visited.

To avoid infinite loops in graphs with cycles and to prevent redundant computations, we use a `visited` array to keep track of the nodes we have already explored.

### 6. Path in Directed Graph | BFS | DFS **O(N), O(N)**

#### 1. Using Breadth-First Search (BFS)

BFS is a great choice for finding if a path exists. It explores the graph layer by layer from the source node. We use a **queue** to manage the nodes to visit and a **visited** array to keep track of nodes already processed.

**Algorithm:**

1.  First, represent the graph using an **adjacency list** for efficient neighbor lookup.
2.  Create a queue and add the starting node `1`.
3.  Create a `visited` boolean array and mark node `1` as visited.
4.  While the queue is not empty:
    a. Dequeue a node `u`.
    b. For each neighbor `v` of `u`:
    i. If `v` is the destination node `A`, a path has been found, so return `1`.
    ii. If `v` has not been visited, mark it as visited and enqueue it.
5.  If the queue becomes empty and the destination `A` was never reached, it's unreachable. Return `0`.

<!-- end list -->

```js
/**
 * Checks for a path from node 1 to node A using BFS.
 * @param {number} A The total number of nodes (and the destination node).
 * @param {number[][]} B The matrix of directed edges.
 * @returns {number} 1 if a path exists, 0 otherwise.
 * Time:  O(A + M)
 * Space: O(A + M)
 */
function findPathBFS(A, B) {
  // Build the adjacency list representation of the graph.
  // We use A+1 because nodes are 1-indexed.
  const adj = Array.from({ length: A + 1 }, () => []);
  for (const edge of B) {
    const source = edge[0];
    const destination = edge[1];
    adj[source].push(destination);
  }

  // If A is 1, a path from 1 to 1 trivially exists.
  if (A === 1) {
    return 1;
  }

  // Create a queue for BFS and add the starting node (1).
  const queue = [1];

  // Create a 'visited' array to keep track of visited nodes
  // to prevent cycles and redundant work.
  const visited = new Array(A + 1).fill(false);
  visited[1] = true;

  // Process the queue until it's empty.
  while (queue.length > 0) {
    // Dequeue the current node.
    const currentNode = queue.shift();

    // Iterate through all neighbors of the current node.
    for (const neighbor of adj[currentNode]) {
      // If the neighbor is the destination, we've found a path.
      if (neighbor === A) {
        return 1;
      }
      // If the neighbor has not been visited yet...
      if (!visited[neighbor]) {
        // Mark it as visited.
        visited[neighbor] = true;
        // Enqueue it to be visited later.
        queue.push(neighbor);
      }
    }
  }

  // If the queue becomes empty and we haven't reached node A, no path exists.
  return 0;
}

// Example usage
console.log(findPathBFS(5, [ [1, 2], [4, 1], [2, 4], [3, 4], [5, 2], [1, 3] ])); // 0
console.log(findPathBFS(5, [ [1, 2], [2, 3], [3, 4], [4, 5] ])); // 1

// Time Complexity: O(A + M), where A is the number of nodes and M is the number of edges.
// In the worst case, we visit every node and edge in the connected component of the source.
// Space Complexity: O(A + M). This includes O(A + M) for the adjacency list and O(A) for the
// queue and visited array.
```

```python
from collections import deque


def has_path_bfs(adj, source, dest, num_nodes):
    visited = [False] * (num_nodes + 1)
    queue = deque([source])
    visited[source] = True

    while queue:
        curr = queue.popleft()
        if curr == dest:
            return True
        for neighbor in adj[curr]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append(neighbor)

    return False


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

#### 2. Using Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking. We can implement this recursively. A `visited` array is essential here as well to avoid getting trapped in cycles.

**Algorithm:**

1.  Build an **adjacency list** for the graph.
2.  Create a `visited` boolean array.
3.  Define a recursive function `canReach(node)`:
    a. Mark the current `node` as visited.
    b. If `node` is the destination `A`, return `true`.
    c. For each unvisited neighbor `v` of `node`, recursively call `canReach(v)`.
    d. If any recursive call returns `true`, it means a path was found, so propagate `true` up.
4.  If after exploring all paths from the current `node`, the destination is not found, return `false`.
5.  Initiate the search by calling `canReach(1)`. Return `1` if it's `true`, else `0`.

<!-- end list -->

```js
/**
 * Checks for a path from node 1 to node A using DFS.
 * @param {number} A The total number of nodes (and the destination node).
 * @param {number[][]} B The matrix of directed edges.
 * @returns {number} 1 if a path exists, 0 otherwise.
 * Time:  O(A + M)
 * Space: O(A + M)
 */
function findPathDFS(A, B) {
  // Build the adjacency list representation of the graph.
  const adj = Array.from({ length: A + 1 }, () => []);
  for (const edge of B) {
    const source = edge[0];
    const destination = edge[1];
    adj[source].push(destination);
  }

  // Create a 'visited' array to avoid infinite loops in case of cycles.
  const visited = new Array(A + 1).fill(false);

  // Recursive DFS function to find the path.
  function canReach(currentNode) {
    // If we have reached the destination node, a path exists.
    if (currentNode === A) {
      return true;
    }

    // Mark the current node as visited.
    visited[currentNode] = true;

    // Explore all neighbors of the current node.
    for (const neighbor of adj[currentNode]) {
      // If the neighbor has not been visited, perform DFS from there.
      if (!visited[neighbor]) {
        // If the recursive call finds the path, propagate the result.
        if (canReach(neighbor)) {
          return true;
        }
      }
    }

    // If no path was found from this node's neighbors, return false.
    return false;
  }

  // Start the DFS from the source node (1).
  return canReach(1) ? 1 : 0;
}

// Example usage
console.log(findPathDFS(5, [ [1, 2], [4, 1], [2, 4], [3, 4], [5, 2], [1, 3] ])); // 0
console.log(findPathDFS(5, [ [1, 2], [2, 3], [3, 4], [4, 5] ])); // 1

// Time Complexity: O(A + M), where A is the number of nodes and M is the number of edges.
// Each node and edge is visited at most once.
// Space Complexity: O(A + M). O(A + M) for the adjacency list, O(A) for the visited array,
// and O(A) for the recursion stack in the worst-case (a long chain).
```

```python
def has_path_dfs(adj, source, dest, num_nodes):
    visited = [False] * (num_nodes + 1)

    def dfs(node):
        if node == dest:
            return True
        visited[node] = True
        for neighbor in adj[node]:
            if not visited[neighbor]:
                if dfs(neighbor):
                    return True
        return False

    return dfs(source)


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

## 7. Graphs 2: BFS & MST

### 1. Breadth First Search (BFS) Traversal | Queue **O(N), O(N)**

```
Given a graph and a starting source vertex, traverse the graph using Breadth First Search.
```

#### Theory / Observations

BFS explores the graph layer by layer, moving radially outwards from the source node. This property makes it ideal for finding the shortest path in an unweighted graph, where the "shortest path" is defined by the minimum number of edges.

**Steps for BFS:**

1.  Create a **Queue** to store nodes to visit.
2.  Create a **visited array** (or set) to keep track of visited nodes to avoid cycles and redundant processing.
3.  Add the source node to the queue and mark it as visited.
4.  While the queue is not empty:
      * **Remove** a node from the front of the queue.
      * **Work**: Process the node (e.g., print it, check if it's the destination).
      * **Add Neighbors**: For the removed node, iterate through its neighbors. If a neighbor has not been visited, mark it as visited and add it to the queue.

#### Diagrams

A sample graph with 8 vertices (0 to 7).

```
      0 -------- 4
     /          / |
    /          /  |
   1 --------- 3--5--6
    \         /   |
     \       /    |
       ---- 2     7
```

#### Dry Run

Let's trace BFS on the graph above.

**Scenario 1: Source = 3**

| Action                   | Queue       | Visited             | Output | Distance from 3 |
| :----------------------- | :---------- | :------------------ | :----- | :-------------- |
| Initial                  | `[3]`       | `[F,F,F,T,F,F,F,F]` |        | 3 -\> 0         |
| Remove 3, Add 1, 4, 5, 2 | `[1,4,5,2]` | `[F,T,T,T,T,T,F,F]` | 3      | 1,4,5,2 -\> 1   |
| Remove 1, Add 0          | `[4,5,2,0]` | `[T,T,T,T,T,T,F,F]` | 1      | 0 -\> 2         |
| Remove 4                 | `[5,2,0]`   | `[T,T,T,T,T,T,F,F]` | 4      |                 |
| Remove 5, Add 6, 7       | `[2,0,6,7]` | `[T,T,T,T,T,T,T,T]` | 5      | 6, 7 -\> 2      |
| Remove 2                 | `[0,6,7]`   | `[T,T,T,T,T,T,T,T]` | 2      |                 |
| Remove 0                 | `[6,7]`     | `[T,T,T,T,T,T,T,T]` | 0      |                 |
| Remove 6                 | `[7]`       | `[T,T,T,T,T,T,T,T]` | 6      |                 |
| Remove 7                 | `[]`        | `[T,T,T,T,T,T,T,T]` | 7      |                 |

**Final Traversal Order:** 3, 1, 4, 5, 2, 0, 6, 7

#### 1. Using Queue

This solution implements the standard BFS algorithm to traverse a graph and calculate the shortest distance from a source node to all other nodes in terms of edge count.

```js
/**
 * Represents a pair of vertex and its distance from the source.
 */
class BfsPair {
  /**
   * @param {number} vertex - The vertex number.
   * @param {number} distance - The distance from the source.
   */
  constructor(vertex, distance) {
    this.vertex = vertex; // The node/vertex identifier
    this.distance = distance; // Distance from the source node
  }
}

/**
 * Performs Breadth-First Search on a graph.
 * @param {number[][]} graph - The adjacency list representation of the graph.
 * @param {number} source - The starting vertex for the traversal.
 * Time:  O(V + E) where V is the number of vertices and E is the number of edges.
 * Space: O(V) for the visited array and the queue.
 */
function breadthFirstSearch(graph, source) {
  // Get the total number of vertices in the graph.
  const numVertices = graph.length;
  // visited array to keep track of visited nodes. Initialized to false.
  const visited = new Array(numVertices).fill(false);
  // Queue for BFS, storing BfsPair objects.
  const queue = [];

  // Start BFS from the source node.
  // Add the source to the queue with a distance of 0.
  queue.push(new BfsPair(source, 0));
  // Mark the source node as visited.
  visited[source] = true;

  // Loop until the queue is empty.
  while (queue.length > 0) {
    // 1. Remove the first element from the queue.
    const currentPair = queue.shift();
    const currentVertex = currentPair.vertex;
    const currentDistance = currentPair.distance;

    // 2. Work: Print the vertex and its distance from the source.
    console.log(`Vertex: ${currentVertex}, Distance from source: ${currentDistance}`);

    // 3. Add unvisited neighbors to the queue.
    // Get all neighbors of the current vertex.
    const neighbors = graph[currentVertex];
    for (const neighbor of neighbors) {
      // If the neighbor has not been visited yet.
      if (!visited[neighbor]) {
        // Mark the neighbor as visited.
        visited[neighbor] = true;
        // Add the neighbor to the queue with an incremented distance.
        queue.push(new BfsPair(neighbor, currentDistance + 1));
      }
    }
  }
}

// Example Usage:
// Adjacency list for the graph in the diagram.
const adjList = [
  [1, 4],    // 0
  [0, 2, 3], // 1
  [1, 3],    // 2
  [1, 2, 4, 5], // 3
  [0, 3],    // 4
  [3, 6, 7], // 5
  [5],       // 6
  [5]        // 7
];

console.log("BFS starting from source 3:");
breadthFirstSearch(adjList, 3);

// Time Complexity: O(V + E)
// Space Complexity: O(V)
```

```python
from collections import deque


def bfs_traversal(adj, start, num_nodes):
    visited = [False] * (num_nodes + 1)
    queue = deque([(start, 0)])  # (node, distance)
    visited[start] = True
    traversal = []

    while queue:
        node, dist = queue.popleft()
        traversal.append((node, dist))

        for neighbor in adj[node]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append((neighbor, dist + 1))

    return traversal


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

### 2. Multisource BFS **O(N), O(N)**

```
There are N number of nodes and multiple source nodes (S1, S2, S3, ...). We need to find the length of the shortest path from a given destination node to *any one* of the source nodes.
```

#### Explanation

**Brute-force Approach:**
Run a standard BFS starting from each source node one by one. For three sources, this means traversing the graph three times and taking the minimum of the three resulting distances. This is inefficient.

**Optimized Approach (Multisource BFS):**
Instead of running BFS multiple times, we can run it just once. The idea is to treat all source nodes as being at level 0.

1.  Create a queue and a visited array.
2.  Add **all** source nodes to the queue initially, with a distance of 0, and mark them all as visited.
3.  Run the standard BFS loop. When the algorithm reaches the destination node, the distance associated with it will be the shortest distance from the *closest* source. This works because BFS naturally explores level by level, so the first time we reach the destination, it must be via the shortest path from one of the initial sources.

#### Diagrams

```
      12 -- 10(S1) -- 11
            |
            8 -- 1(S2) -- 2 -- 9(dst)
            |           |
            7 -- 6 -- 5(S3)-- 4 -- 3
```

#### 1. Optimized Multisource BFS

```js
/**
 * Represents a pair of vertex and its distance from the source.
 */
class BfsPair {
  /**
   * @param {number} vertex - The vertex number.
   * @param {number} distance - The distance from the source.
   */
  constructor(vertex, distance) {
    this.vertex = vertex; // The node/vertex identifier
    this.distance = distance; // Distance from the source node
  }
}

/**
 * Finds the shortest distance from any source to the destination using multisource BFS.
 * @param {number[][]} graph - The adjacency list of the graph.
 * @param {number[]} sources - An array of source vertices.
 * @param {number} destination - The destination vertex.
 * @returns {number} The shortest distance, or -1 if unreachable.
 * Time: O(V + E)
 * Space: O(V)
 */
function multiSourceBfs(graph, sources, destination) {
  // Get the total number of vertices.
  const numVertices = graph.length;
  // Queue for BFS. Using the same BfsPair class from before.
  const queue = [];
  // visited array to track visited nodes.
  const visited = new Array(numVertices).fill(false);

  // 1. Add all source nodes to the queue.
  for (const source of sources) {
    if (source < numVertices) {
      queue.push(new BfsPair(source, 0));
      visited[source] = true;
    }
  }

  // 2. Perform standard BFS.
  while (queue.length > 0) {
    // Remove the current node from the queue.
    const currentPair = queue.shift();
    const currentVertex = currentPair.vertex;
    const currentDistance = currentPair.distance;

    // Check if the current vertex is the destination.
    if (currentVertex === destination) {
      // If it is, we have found the shortest path.
      return currentDistance;
    }

    // Explore neighbors.
    const neighbors = graph[currentVertex] || [];
    for (const neighbor of neighbors) {
      // If a neighbor is not visited.
      if (!visited[neighbor]) {
        // Mark it as visited.
        visited[neighbor] = true;
        // Add it to the queue with incremented distance.
        queue.push(new BfsPair(neighbor, currentDistance + 1));
      }
    }
  }

  // If the loop finishes and the destination was not found, it's unreachable.
  return -1;
}

// Example Usage from the PDF:
// Assuming graph nodes are 0-indexed. Let's map nodes 1-12 to 0-11.
const multiSourceGraph = new Array(12).fill(0).map(() => []);
// Edges based on diagram
multiSourceGraph[9].push(11, 7); // 10 -> 12, 8
multiSourceGraph[11].push(9);     // 12 -> 10
multiSourceGraph[7].push(9, 0, 6); // 8 -> 10, 1, 7
multiSourceGraph[0].push(7, 1);     // 1 -> 8, 2
multiSourceGraph[6].push(7, 5);     // 7 -> 8, 6
multiSourceGraph[1].push(0, 8);     // 2 -> 1, 9
multiSourceGraph[8].push(1);       // 9 -> 2
multiSourceGraph[5].push(6, 4);     // 6 -> 7, 5
multiSourceGraph[4].push(5, 3);     // 5 -> 6, 4
multiSourceGraph[3].push(4, 2);     // 4 -> 5, 3
multiSourceGraph[2].push(3);       // 3 -> 4

// Sources: 10, 1, 5 -> indices 9, 0, 4
const sources = [9, 0, 4];
// Destination: 9 -> index 8
const destination = 8;

const shortestDist = multiSourceBfs(multiSourceGraph, sources, destination);
console.log(`Shortest distance to destination ${destination + 1} is: ${shortestDist}`); // Expected output: 2

// Time Complexity: O(V + E)
// Space Complexity: O(V)
```

```python
from collections import deque


def multisource_bfs(grid, sources):
    rows = len(grid)
    cols = len(grid[0])
    dist = [[-1] * cols for _ in range(rows)]
    queue = deque()

    for r, c in sources:
        queue.append((r, c))
        dist[r][c] = 0

    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        r, c = queue.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))

    return dist


# Time Complexity: O(R * C)
# Space Complexity: O(R * C)
```

### 3. Rotten Oranges / Minimum Time Required to Rot All Oranges | Multisource BFS **O(N), O(N)**

```
Given an m x n grid where each cell can have one of three values:
- 0 representing an empty cell,
- 1 representing a fresh orange,
- 2 representing a rotten orange.
Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.
Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return -1.
```

#### Explanation

This problem is a perfect application of Multisource BFS. The initially "rotten oranges" are our multiple sources. The "time" it takes for a fresh orange to rot is equivalent to the "distance" from the nearest initial rotten orange. The goal is to find the maximum time taken for any fresh orange to become rotten.

**Approach:**

1.  Initialize a queue for BFS.
2.  Traverse the grid to find all initially rotten oranges (value 2), add them to the queue, and count the total number of fresh oranges.
3.  Start the Multisource BFS. For each rotten orange removed from the queue, check its 4-directional neighbors.
4.  If a neighbor is a fresh orange, make it rotten, decrement the `freshOranges` count, and add it to the queue with an updated time (`currentTime + 1`).
5.  After the BFS is complete, if the `freshOranges` count is zero, all oranges were rotted. Return the final time. Otherwise, return -1.

#### 1. Multisource BFS

```js
/**
 * Represents the state of an orange in the grid.
 */
class Orange {
  /**
   * @param {number} row - The row index.
   * @param {number} col - The column index.
   * @param {number} time - The time at which this orange became rotten.
   */
  constructor(row, col, time) {
    this.row = row;
    this.col = col;
    this.time = time;
  }
}

/**
 * Calculates the minimum time required to rot all oranges.
 * @param {number[][]} grid - The grid of oranges.
 * @returns {number} The minimum time, or -1 if impossible.
 * Time: O(m * n) - Each cell is visited at most once.
 * Space: O(m * n) - In the worst case, the queue can hold all the cells.
 */
function orangesRotting(grid) {
  // Get grid dimensions.
  const rows = grid.length;
  if (rows === 0) return 0;
  const cols = grid[0].length;

  // Queue for multisource BFS.
  const queue = [];
  let freshOranges = 0;

  // Initial pass to populate the queue with rotten oranges and count fresh ones.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) {
        queue.push(new Orange(r, c, 0));
      } else if (grid[r][c] === 1) {
        freshOranges++;
      }
    }
  }

  if (freshOranges === 0) return 0;

  let maxTime = 0;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    const currentOrange = queue.shift();
    const { row, col, time } = currentOrange;
    maxTime = Math.max(maxTime, time);

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        grid[newRow][newCol] === 1
      ) {
        grid[newRow][newCol] = 2;
        freshOranges--;
        queue.push(new Orange(newRow, newCol, time + 1));
      }
    }
  }

  // If there are still fresh oranges, it's impossible.
  return freshOranges > 0 ? -1 : maxTime;
}

// Example Usage:
const grid1 = [[2,1,1],[1,1,0],[0,1,1]];
console.log(`Time to rot all oranges: ${orangesRotting(grid1)}`); // Expected output: 4

// Time Complexity: O(m * n)
// Space Complexity: O(m * n)
```

```python
from collections import deque


def oranges_rotting(grid):
    rows = len(grid)
    cols = len(grid[0])
    queue = deque()
    fresh_count = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh_count += 1

    minutes = 0
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while queue:
        r, c, m = queue.popleft()
        minutes = m

        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh_count -= 1
                queue.append((nr, nc, m + 1))

    return minutes if fresh_count == 0 else -1


print(oranges_rotting([[2, 1, 1], [1, 1, 0], [0, 1, 1]]))  # 4

# Time Complexity: O(R * C)
# Space Complexity: O(R * C)
```

### 4. Cost of Construction of Bridges / Flipkart's Logistics Challenge | Minimum Spanning Tree (MST) | Kruskal's Algorithm **O(N), O(N)**

```
Scenario: A company (like Flipkart) has N local distribution centers across a city. You are given the possible connections (bridges/roads) that can be built between these centers and the cost associated with each one.

Goal: Find the minimum cost to construct roads such that all centers are connected, meaning it's possible to travel from any center to any other center.
```

#### Theory / Observations

This problem is a classic example of finding a **Minimum Spanning Tree (MST)**. The goal is to connect all vertices (centers) in a weighted, undirected graph with the minimum possible total edge weight (cost).

  * **Spanning Tree**: A subgraph that connects all vertices together with no cycles. For a graph with 'V' vertices, a spanning tree has exactly 'V-1' edges.
  * **Minimum Spanning Tree (MST)**: The spanning tree with the minimum sum of edge weights. The solution to this problem is to find the cost of the MST for the graph of centers.

**Prim's Algorithm** is a greedy algorithm to find an MST. It works by growing a tree from an initial vertex, at each step adding the cheapest possible connection (edge) from a vertex in the tree to a vertex outside the tree. A **Priority Queue** is used to efficiently find this cheapest edge.

#### Dry Run

Let's trace Prim's Algorithm on the example graph starting from `src = 1` (index 0). The graph has 6 vertices.

| Action              | Priority Queue (v, wt)                | Visited         | Min Cost | MST Edges     |
| :------------------ | :------------------------------------ | :-------------- | :------- | :------------ |
| Initial (src=1)     | `[(2,7), (4,8)]`                      | `[T,F,F,F,F,F]` | 0        | {}            |
| Remove (2,7)        | `[(4,3), (4,8), (3,6)]`               | `[T,T,F,F,F,F]` | 7        | {(1,2)}       |
| Remove (4,3) from 2 | `[(5,3), (3,4), (3,6), (4,8)]`        | `[T,T,F,T,F,F]` | 7+3=10   | {(1,2),(2,4)} |
| Remove (5,3) from 4 | `[(3,2), (3,4), (3,6), (6,5), (4,8)]` | `[T,T,F,T,T,F]` | 10+3=13  | {..,(4,5)}    |
| Remove (3,2) from 5 | `[(3,4), (6,5), (3,6), (4,8)]`        | `[T,T,T,T,T,F]` | 13+2=15  | {..,(5,3)}    |
| Remove (3,4) from 4 | Ignore (3 is visited)                 | `[T,T,T,T,T,F]` | 15       | {..,(5,3)}    |
| Remove (6,5) from 3 | `[(3,6), (4,8)]`                      | `[T,T,T,T,T,T]` | 15+5=20  | {..,(3,6)}    |

**Final Minimum Cost = 20**

#### 1. Prim's Algorithm using Priority Queue

This solution finds the minimum cost to connect all of the centers by implementing Prim's algorithm.

```js
/**
 * Represents an edge (a potential road/bridge) in the graph.
 */
class Edge {
  constructor(u, v, wt) {
    this.u = u;   // Source center
    this.v = v;   // Destination center
    this.wt = wt; // Cost of the road
  }
}

/**
 * Represents a neighbor in an adjacency list.
 */
class NeighborPair {
    constructor(neighbor, weight) {
        this.neighbor = neighbor;
        this.weight = weight;
    }
}

/**
 * A simple Priority Queue implementation (Min Heap) to always get the cheapest road.
 */
class PriorityQueue {
  constructor() {
    this.items = [];
  }
  add(element) {
    this.items.push(element);
    this.items.sort((a, b) => a.wt - b.wt);
  }
  remove() {
    return this.items.shift();
  }
  size() {
    return this.items.length;
  }
}

/**
 * Finds the minimum cost to connect all centers using Prim's algorithm.
 * @param {NeighborPair[][]} graph - Adjacency list representing centers and road costs.
 * @returns {number} The minimum cost to build the network.
 * Time: O(E * log V) with an efficient priority queue.
 * Space: O(V + E) for the graph representation, visited array, and priority queue.
 */
function findMinConstructionCost(graph) {
  const numVertices = graph.length;
  const visited = new Array(numVertices).fill(false);
  const pq = new PriorityQueue();
  let minCost = 0;
  const startVertex = 0;

  // Add the first center to our network.
  visited[startVertex] = true;

  // Add all potential roads from the starting center to the priority queue.
  for (const pair of graph[startVertex]) {
    pq.add(new Edge(startVertex, pair.neighbor, pair.weight));
  }

  while (pq.size() > 0) {
    // 1. Get the cheapest available road.
    const edge = pq.remove();
    const v = edge.v;
    const wt = edge.wt;

    // 2. If this road leads to an already connected center, skip it.
    if (visited[v] === true) {
      continue;
    }

    // 3. Connect the new center and add the road's cost.
    visited[v] = true;
    minCost += wt;

    // 4. Add all new potential roads from the newly connected center.
    for (const pair of graph[v]) {
      if (visited[pair.neighbor] === false) {
        pq.add(new Edge(v, pair.neighbor, pair.weight));
      }
    }
  }

  return minCost;
}

// Example Usage from the PDF (nodes 1-6 -> indices 0-5)
const centersGraph = new Array(6).fill(0).map(() => []);
centersGraph[0].push(new NeighborPair(1, 7), new NeighborPair(3, 8)); // Center 1
centersGraph[1].push(new NeighborPair(0, 7), new NeighborPair(3, 3), new NeighborPair(2, 6)); // Center 2
centersGraph[2].push(new NeighborPair(1, 6), new NeighborPair(3, 4), new NeighborPair(4, 2), new NeighborPair(5, 5)); // Center 3
centersGraph[3].push(new NeighborPair(0, 8), new NeighborPair(1, 3), new NeighborPair(2, 4), new NeighborPair(4, 3)); // Center 4
centersGraph[4].push(new NeighborPair(2, 2), new NeighborPair(3, 3), new NeighborPair(5, 5)); // Center 5
centersGraph[5].push(new NeighborPair(2, 5), new NeighborPair(4, 5)); // Center 6

const minCost = findMinConstructionCost(centersGraph);
console.log(`Minimum cost to construct the bridges: ${minCost}`); // 20

// Time Complexity: O(M log M + M * α(N))
// The dominant part is sorting the M edges, which takes O(M log M).
// The DSU operations (find and union) take nearly constant time, O(α(N)),
// where α is the Inverse Ackermann function. We perform O(M) such operations.
// So, the total time is dominated by sorting.

// Space Complexity: O(N + M)
// We need O(M) space for the augmented edges array and the result array.
// The DSU data structure requires O(N) space for its parent and size arrays.
```

```python
import heapq
from collections import defaultdict


def prim_mst(num_nodes, edges):
    adj = defaultdict(list)
    for u, v, wt in edges:
        adj[u].append((wt, v))
        adj[v].append((wt, u))

    visited = [False] * (num_nodes + 1)
    min_heap = [(0, 1)]  # (weight, node)
    mst_cost = 0
    edges_count = 0

    while min_heap and edges_count < num_nodes:
        wt, u = heapq.heappop(min_heap)

        if visited[u]:
            continue

        visited[u] = True
        mst_cost += wt
        edges_count += 1

        for weight, neighbor in adj[u]:
            if not visited[neighbor]:
                heapq.heappush(min_heap, (weight, neighbor))

    return mst_cost


# Time Complexity: O(E log V)
# Space Complexity: O(V + E)
```

### 5. Commutable Islands | Kruskal's Algorithm | Prims's Algorithm **O(N), O(N)**
```
There are A islands and there are M bridges connecting them. Each bridge has some cost attached to it.
We need to find bridges with minimal cost such that all islands are connected.
It is guaranteed that input data will contain at least one possible scenario in which all islands are connected with each other.
```

#### 1. Kruskal's Algorithm

```
The problem of connecting all islands with minimum cost is a classic application of finding a Minimum Spanning Tree (MST) in a graph. Here, islands are vertices and bridges are weighted edges.

Kruskal's algorithm provides a straightforward way to find the MST. It follows a greedy approach:
1.  **Sort all edges (bridges)** by their weight (cost) in non-decreasing order.
2.  Initialize a Disjoint Set Union (DSU) data structure, with each island in its own set. This structure is highly efficient for checking if two islands are already connected and for merging two disjoint sets of islands.
3.  Iterate through the sorted bridges. For each bridge connecting islands `u` and `v`:
    * Check if `u` and `v` are already in the same connected component using the DSU's `find` operation.
    * If they are not connected, add the bridge's cost to our total minimum cost. Then, merge the two components into one using the DSU's `union` operation. This edge is now part of our MST.
    * If they are already connected, we discard this bridge to avoid creating a cycle.
4.  We stop once we have added `A - 1` bridges to our MST, as this is the exact number of edges required to connect `A` vertices.

This approach ensures that we always pick the cheapest available bridge that doesn't form a cycle, which guarantees a Minimum Spanning Tree.
```

```js
/**
 * A Disjoint Set Union (DSU) data structure with path compression and union by rank.
 * This is used to efficiently track the connected components of the graph.
 */
class DSU {
  /**
   * @param {number} n The number of elements (islands).
   */
  constructor(n) {
    // parent[i] stores the parent of element i. Initially, each element is its own parent.
    // The array is of size n+1 for 1-based indexing of islands.
    this.parent = Array.from({ length: n + 1 }, (_, i) => i);
    // rank[i] stores the rank (an upper bound on the height) of the tree rooted at i.
    // Used for the union-by-rank optimization.
    this.rank = new Array(n + 1).fill(0);
  }

  /**
   * Finds the representative (root) of the set containing element i, with path compression.
   * @param {number} i The element to find.
   * @returns {number} The representative of the set.
   */
  find(i) {
    // If i is the parent of itself, then it is the root.
    if (this.parent[i] === i) {
      return i;
    }
    // Otherwise, recursively find the root and apply path compression.
    // This makes the tree flatter, speeding up future find operations.
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  /**
   * Merges the sets containing elements i and j, using union by rank.
   * @param {number} i An element in the first set.
   * @param {number} j An element in the second set.
   * @returns {boolean} True if the sets were merged, false if they were already in the same set.
   */
  union(i, j) {
    // Find the representatives of the sets containing i and j.
    const rootI = this.find(i);
    const rootJ = this.find(j);

    // If they are not already in the same set, merge them.
    if (rootI !== rootJ) {
      // Union by rank: attach the shorter tree to the root of the taller tree.
      if (this.rank[rootI] < this.rank[rootJ]) {
        this.parent[rootI] = rootJ;
      } else if (this.rank[rootI] > this.rank[rootJ]) {
        this.parent[rootJ] = rootI;
      } else {
        // If ranks are the same, make one the root and increment its rank.
        this.parent[rootJ] = rootI;
        this.rank[rootI]++;
      }
      return true; // The union was successful.
    }
    return false; // i and j were already in the same set.
  }
}

/**
 * Finds the minimum cost to connect all islands using Kruskal's algorithm.
 * @param {number} A The number of islands.
 * @param {number[][]} B The list of bridges, where B[i] = [island1, island2, cost].
 * @returns {number} The minimal cost to connect all islands.
 */
function solveCommutableIslandsKruskal(A, B) {
  // Step 1: Sort all bridges by their cost in ascending order.
  // The sort function compares the third element (cost) of each bridge.
  B.sort((bridgeA, bridgeB) => bridgeA[2] - bridgeB[2]);

  // Step 2: Initialize the DSU data structure for A islands.
  const dsu = new DSU(A);

  // Initialize total cost and the number of edges added to the MST.
  let totalCost = 0;
  let edgesCount = 0;

  // Step 3: Iterate through the sorted bridges.
  for (const bridge of B) {
    // Destructure the bridge information.
    const [u, v, cost] = bridge;

    // Step 4: Check if including this bridge creates a cycle.
    // The union operation returns true if u and v were in different sets.
    if (dsu.union(u, v)) {
      // If they were in different sets, this bridge connects two previously disconnected components.
      // Add its cost to the total and increment the edge count.
      totalCost += cost;
      edgesCount++;

      // Optimization: An MST for A vertices has exactly A-1 edges.
      // If we have found A-1 edges, all islands are connected, and we can stop.
      if (edgesCount === A - 1) {
        break;
      }
    }
  }

  // Return the total cost of the MST.
  return totalCost;
}

// Example Usage:
const A1 = 4;
const B1 = [ [1, 2, 1], [2, 3, 4], [1, 4, 3], [4, 3, 2], [1, 3, 10] ];
console.log(`Minimal cost for Example 1: ${solveCommutableIslandsKruskal(A1, B1)}`); // Expected output: 6

const A2 = 4;
const B2 = [ [1, 2, 1], [2, 3, 2], [3, 4, 4], [1, 4, 3] ];
console.log(`Minimal cost for Example 2: ${solveCommutableIslandsKruskal(A2, B2)}`); // Expected output: 6

// Time Complexity: O(M log M)
// The dominant operation is sorting the M bridges, which takes O(M log M) time.
// The loop iterates up to M times, and each DSU operation (find and union) with optimizations
// is nearly constant time, amortized O(α(A)), where α is the very slow-growing inverse Ackermann function.
// Thus, the total time is dominated by the sort.

// Space Complexity: O(A)
// The DSU data structure requires two arrays of size A+1 to store the parent and rank for each island.
```

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n + 1))
        self.rank = [0] * (n + 1)

    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])  # Path compression
        return self.parent[i]

    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i == root_j:
            return False

        # Union by rank
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1

        return True


def kruskal_mst(num_nodes, edges):
    # Sort edges by weight ascending
    edges.sort(key=lambda x: x[2])
    dsu = DSU(num_nodes)
    mst_cost = 0
    edges_taken = 0

    for u, v, wt in edges:
        if dsu.union(u, v):
            mst_cost += wt
            edges_taken += 1
            if edges_taken == num_nodes - 1:
                break

    return mst_cost


# Time Complexity: O(E log E)
# Space Complexity: O(V)
```

#### 2. Prim's Algorithm

```
Prim's algorithm is another greedy algorithm for finding an MST. It works by growing the MST from an arbitrary starting vertex.

The algorithm proceeds as follows:
1.  **Initialize:** Start with an empty MST. Create a Min-Priority Queue to store edges that connect a vertex in the MST to a vertex outside the MST. Pick an arbitrary starting island (e.g., island 1).
2.  **Build Adjacency List:** Convert the input edge list into an adjacency list for easier traversal of the graph.
3.  **Grow the MST:**
    * Add the starting island to a `visited` set. Add all its connecting bridges to the priority queue.
    * While the MST doesn't include all islands (i.e., `visited` set size is less than `A`):
        * Extract the bridge with the minimum cost from the priority queue.
        * Let this bridge connect island `u` (already in the MST) to island `v` (not in the MST).
        * If `v` has already been visited, discard this edge and continue (this handles cycles and outdated entries in the queue).
        * Otherwise, add this bridge's cost to the total cost, add `v` to the `visited` set.
        * Then, for all bridges connected to `v`, if they lead to an unvisited island, add them to the priority queue.
4.  The algorithm terminates when `A-1` edges have been added, and the total cost is the weight of the MST.

This implementation uses a Min-Heap for the priority queue to achieve an efficient time complexity.
```

```js
/**
 * A simple Min-Priority Queue implementation using a binary heap.
 * It stores items in the format [priority, value].
 */
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Helper methods to get parent and child indices
  _getParentIndex(i) { return Math.floor((i - 1) / 2); }
  _getLeftChildIndex(i) { return 2 * i + 1; }
  _getRightChildIndex(i) { return 2 * i + 2; }

  // Helper method to swap two elements in the heap
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * Adds an element to the priority queue.
   * @param {Array} element An array [priority, value].
   */
  enqueue(element) {
    // Add the new element to the end of the array.
    this.heap.push(element);
    // Bubble it up to its correct position to maintain the heap property.
    this._bubbleUp();
  }

  _bubbleUp() {
    let index = this.heap.length - 1;
    // While the element has a parent and is smaller than its parent, swap them.
    while (index > 0) {
      const parentIndex = this._getParentIndex(index);
      if (this.heap[index][0] < this.heap[parentIndex][0]) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Removes and returns the element with the highest priority (lowest value).
   * @returns {Array} The element [priority, value].
   */
  dequeue() {
    // If the heap is empty, return null.
    if (this.isEmpty()) return null;
    // The root of the heap is the minimum element.
    const min = this.heap[0];
    // Replace the root with the last element.
    const end = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = end;
      // Sink the new root down to its correct position.
      this._sinkDown();
    }
    return min;
  }

  _sinkDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];
    while (true) {
      let leftChildIndex = this._getLeftChildIndex(index);
      let rightChildIndex = this._getRightChildIndex(index);
      let leftChild, rightChild;
      let swap = null;

      // Check if left child exists and if it's smaller than the element.
      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild[0] < element[0]) {
          swap = leftChildIndex;
        }
      }

      // Check if right child exists and if it's smaller than both the element and the left child.
      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild[0] < element[0]) ||
          (swap !== null && rightChild[0] < leftChild[0])
        ) {
          swap = rightChildIndex;
        }
      }

      // If no swap is needed, the element is in its correct place.
      if (swap === null) break;
      // Perform the swap and continue sinking down.
      this._swap(index, swap);
      index = swap;
    }
  }

  /**
   * Checks if the priority queue is empty.
   * @returns {boolean} True if empty, false otherwise.
   */
  isEmpty() {
    return this.heap.length === 0;
  }
}

/**
 * Finds the minimum cost to connect all islands using Prim's algorithm.
 * @param {number} A The number of islands.
 * @param {number[][]} B The list of bridges, where B[i] = [island1, island2, cost].
 * @returns {number} The minimal cost to connect all islands.
 */
function solveCommutableIslandsPrim(A, B) {
  // Step 1: Build an adjacency list representation of the graph.
  // The list stores neighbors and the cost to reach them.
  const adj = Array.from({ length: A + 1 }, () => []);
  for (const [u, v, cost] of B) {
    adj[u].push({ node: v, cost: cost });
    adj[v].push({ node: u, cost: cost });
  }

  // Step 2: Initialize data structures for Prim's algorithm.
  const pq = new MinPriorityQueue();         // Stores [cost, node] to visit next.
  const visited = new Array(A + 1).fill(false); // Tracks islands already in the MST.
  let totalCost = 0;                         // Accumulates the total cost of the MST.
  let edgesCount = 0;                        // Counts the number of islands added to the MST.

  // Step 3: Start the algorithm from an arbitrary island (e.g., island 1).
  // The cost to connect the first island to the MST is 0.
  pq.enqueue([0, 1]);

  // Step 4: Loop until all islands are included in the MST.
  while (!pq.isEmpty() && edgesCount < A) {
    // Extract the island that can be reached with the minimum cost.
    const [cost, u] = pq.dequeue();

    // If this island has already been visited, skip it.
    // This handles cases where we find a cheaper path to an island already in the queue.
    if (visited[u]) {
      continue;
    }

    // Process the new island: mark as visited, add cost, and increment count.
    visited[u] = true;
    totalCost += cost;
    edgesCount++;

    // Explore the neighbors of the newly added island.
    for (const neighbor of adj[u]) {
      const { node: v, cost: edgeCost } = neighbor;
      // If a neighbor hasn't been visited, add it to the priority queue.
      if (!visited[v]) {
        pq.enqueue([edgeCost, v]);
      }
    }
  }

  return totalCost;
}

// Example Usage:
console.log(`Minimal cost for Example 1 (Prim's): ${solveCommutableIslandsPrim(A1, B1)}`); // Expected output: 6
console.log(`Minimal cost for Example 2 (Prim's): ${solveCommutableIslandsPrim(A2, B2)}`); // Expected output: 6

// Time Complexity: O(M log A)
// We build an adjacency list in O(M). The main loop can run up to A times.
// In the worst case, every edge might be added to the priority queue once.
// An enqueue or dequeue operation on the priority queue (implemented as a binary heap) takes O(log K),
// where K is the size of the queue. The queue size can be at most M edges, but more tightly bounded by A vertices in some versions.
// In this specific implementation, we can add multiple edges for the same vertex, so the PQ size can go up to M.
// The complexity is O(M log M). However, a standard analysis of Prim's with a binary heap gives O((A+M)log A),
// which simplifies to O(M log A) for a connected graph.

// Space Complexity: O(A + M)
// The adjacency list requires O(A + M) space. The `visited` array takes O(A) space.
// The priority queue can, in the worst case, store an edge for every vertex not in the MST, taking O(M) space.
```

```python
def commutable_islands(A, B):
    # A = num islands, B = edges [[u, v, wt]]
    return prim_mst(A, B)
```

## 8. Graphs 3: Dijkstra Algo & Topological Sort

### 1. Another BFS **O(N), O(N)**
```
Find the minimum weight to travel to vertex v from vertex u in a given connected simple graph, such that the weight of any edge is either 1 or 2.
```

#### Theory / Observations

When we need to find the shortest path in an unweighted graph (or a graph where all edge weights are equal), a standard **Breadth-First Search (BFS)** is the perfect algorithm. BFS explores the graph layer by layer, guaranteeing that we find the path with the fewest edges.

The challenge here is that the edge weights are not uniform; they can be 1 or 2. A standard BFS won't work directly because a path with more edges might have a smaller total weight (e.g., three edges of weight 1 are better than one edge of weight 2 and one of weight 1).

The key observation is that we can transform the graph to make all edge weights uniform (equal to 1). We can then apply a standard BFS.

**Transformation Strategy:**

1.  If an edge has a weight of **1**, we can consider it a standard edge.
2.  If an edge between vertices `u` and `v` has a weight of **2**, we can conceptually split this edge by introducing a new, temporary (or dummy) vertex, let's call it `d`. We replace the single edge `(u, v)` of weight 2 with two new edges: `(u, d)` of weight 1 and `(d, v)` of weight 1. The total weight to travel from `u` to `v` through `d` is `1 + 1 = 2`, which is the original weight.

After applying this transformation to all edges with weight 2, the entire graph will only have edges of weight 1. Now, running a standard BFS on this modified graph will give us the shortest path in terms of the number of edges, which directly corresponds to the minimum total weight in the original graph.

#### Diagrams

**Original Graph (Example)**

```
      (1) --1-- (2) --1-- (3)
       | \       |       |
       1  2      1       1
       |   \     |       |
      (4) --1-- (5) ----- (3) is already connected
       |
       2
       |
      (5) --- (4) is already connected
```

*Simplified representation from image:*

```
      1
     / \
    /   \
   1     2
  /       \
 2----1----3
 | \  /|   |
 |  \/ |   |
 1  /\ 1   1
 | /  \ |   |
 4----1----5
  \  /
   2
    . (This edge from 4 to 5 with weight 2 seems redundant as there's one with weight 1)
```

**Transformed Graph**
Let's transform the edges with weight 2.
  - The edge (1, 4) with weight 2 becomes `(1) --1-- (6) --1-- (4)`.
  - The edge (4, 5) with weight 2 becomes `(4) --1-- (7) --1-- (5)`.
  - Let's assume the edge between 3 and 4 (via a blue dot in the image) is weight 2. It becomes `(3) --1-- (8) --1-- (4)`.

The new graph would look like this (with new dummy nodes 6, 7, 8):

```
            (1) --1-- (2) --1-- (3)
            / |         |      / |
           /  1         1     /  1
          /   |         |    /   |
        (6)  (5)---1---(4)  (8) (5)
         |   / \        | \  |
         1  /   1       1  \ 1
         | /     \      |   \
        (1)------(4)   (7)--(3)
```

Now, all edges have weight 1, and we can run BFS.

#### Graph Transformation + BFS
This solution modifies the graph structure first and then applies a standard BFS.

```js
/**
 * Represents a pair of vertex and its distance from the source.
 * @class
 */
class Pair {
  /**
   * @param {number} vertex - The vertex number.
   * @param {number} distance - The distance from the source.
   */
  constructor(vertex, distance) {
    this.vertex = vertex;
    this.distance = distance;
  }
}

/**
 * Finds the shortest path in a graph with edge weights 1 or 2.
 * @param {number} n - The number of vertices.
 * @param {number[][]} edges - An array of edges [u, v, weight].
 * @param {number} src - The source vertex.
 * @param {number} dest - The destination vertex.
 * @returns {number} The minimum weight of the path, or -1 if no path exists.
 * Time: O(V + E) where V is the number of vertices and E is the number of edges in the *new* graph.
 * In the worst case, V = n + E, and E_new = 2*E. So, O(n + E).
 * Space: O(V + E) for the adjacency list and queue. So, O(n + E).
 */
function findShortestPathWithWeights12(n, edges, src, dest) {
  // The graph is represented by an adjacency list.
  const graph = new Array(n + edges.length).fill(0).map(() => []);
  let currentVertexCount = n;

  /**
   * Helper function to add an undirected edge to the graph.
   * @param {number} u - The first vertex.
   * @param {number} v - The second vertex.
   */
  function addEdge(u, v) {
    graph[u].push(v);
    graph[v].push(u);
  }

  // Process the edges and transform the graph.
  for (const edge of edges) {
    const u = edge[0];
    const v = edge[1];
    const weight = edge[2];

    if (weight === 1) {
      // If weight is 1, add a direct edge.
      addEdge(u, v);
    } else {
      // If weight is 2, add a dummy vertex in between.
      const dummyVertex = currentVertexCount;
      // The graph array needs to be large enough for new vertices.
      // We already allocated space for the worst case.
      currentVertexCount++;

      // Add edge from u to the dummy vertex.
      addEdge(u, dummyVertex);
      // Add edge from the dummy vertex to v.
      addEdge(dummyVertex, v);
    }
  }

  // Now, perform a standard BFS on the transformed graph.
  const queue = [];
  const visited = new Array(currentVertexCount).fill(false);

  // Start BFS from the source vertex.
  queue.push(new Pair(src, 0));
  visited[src] = true;

  while (queue.length > 0) {
    // Dequeue the current vertex.
    const currentPair = queue.shift();
    const currentVertex = currentPair.vertex;
    const currentDistance = currentPair.distance;

    // If we have reached the destination, return the distance.
    if (currentVertex === dest) {
      return currentDistance;
    }

    // Explore all neighbors.
    for (const neighbor of graph[currentVertex]) {
      // If the neighbor has not been visited yet.
      if (!visited[neighbor]) {
        // Mark it as visited.
        visited[neighbor] = true;
        // Enqueue it with an incremented distance.
        queue.push(new Pair(neighbor, currentDistance + 1));
      }
    }
  }

  // If the destination is not reachable, return -1.
  return -1;
}

// Example usage from the diagram (simplified)
const n_vertices = 5;
const edge_list = [
  [1, 2, 1], [1, 4, 2], [2, 3, 1],
  [2, 4, 1], [3, 5, 1], [4, 5, 1]
];
const source = 1;
const destination = 5;

// Note: Vertices are 1-based in the problem, let's adjust to 0-based for arrays.
const adjusted_edges = edge_list.map(([u,v,w]) => [u-1, v-1, w]);

console.log(`Shortest path from ${source} to ${destination}:`, findShortestPathWithWeights12(n_vertices, adjusted_edges, source - 1, destination - 1)); // expected output: 2 (path 1->2->4->5)
// Time Complexity: O(N + E)
// Space Complexity: O(N + E)
```

```python
from collections import deque


def shortest_path_unweighted(adj, source, dest, num_nodes):
    dist = [-1] * (num_nodes + 1)
    queue = deque([source])
    dist[source] = 0

    while queue:
        curr = queue.popleft()
        if curr == dest:
            return dist[curr]

        for neighbor in adj[curr]:
            if dist[neighbor] == -1:
                dist[neighbor] = dist[curr] + 1
                queue.append(neighbor)

    return -1


# Time Complexity: O(V + E)
# Space Complexity: O(V)
```

### 2. Dijkstra's Algorithm **O(N), O(N)**

```
There are N cities in a country, you are living in city-1. Find the minimum distance to reach every other city from city-1. We need to return the answer in the form of an array where the i-th element is the shortest distance from city-1 to city-i.
```

#### Theory / Observations

**Dijkstra's algorithm** is a classic greedy algorithm used to find the shortest paths from a single source vertex to all other vertices in a weighted graph with **non-negative edge weights**.

It works by maintaining a set of visited vertices and a data structure (typically a **min-priority queue**) that stores vertices to visit, prioritized by their current known shortest distance from the source.

**Algorithm Steps:**

1.  Initialize a distance array `dist` for all vertices. Set `dist[source] = 0` and `dist[all_other_vertices] = infinity`.
2.  Create a min-priority queue and add the source vertex to it with a priority (distance) of 0.
3.  While the priority queue is not empty:
    a.  Extract the vertex `u` with the smallest distance from the priority queue.
    b.  If `u` has already been visited, skip it. (This handles cases where we've found a shorter path to a vertex already in the queue).
    c.  Mark `u` as visited.
    d.  For each neighbor `v` of `u`:
    i.  Calculate the new potential distance to `v` through `u`: `newDist = dist[u] + weight(u, v)`.
    ii. If `newDist` is less than the current known distance `dist[v]`, update `dist[v] = newDist` and add `v` to the priority queue with priority `newDist`.
4.  After the loop finishes, the `dist` array will contain the shortest path distances from the source to all other vertices.

The difference between Dijkstra's and Prim's algorithm for Minimum Spanning Trees (MST) is subtle but important. Prim's algorithm also uses a priority queue but prioritizes the minimum edge weight to an unvisited vertex, aiming to connect all vertices with minimum total edge cost. Dijkstra's prioritizes the minimum total path weight from the source, aiming to find the shortest path from the source.

#### Diagrams

**Example Graph:**

```
      City 0 --40-- City 3 --2-- City 4
        |             |            | \
       10             10           3  8
        |             |            |   \
      City 1 --10-- City 2         City 5 --3-- City 6

```

#### Dry Run

Let source = City 0.
`dist = [0, inf, inf, inf, inf, inf, inf]`
`pq = [{v: 0, dist: 0}]`

| Step  | Remove from PQ  | Visited        | dist Array                        | PQ Contents                                     |
| :---: | :-------------- | :------------- | :-------------------------------- | :---------------------------------------------- |
|   1   | `{v: 0, d: 0}`  | `{0}`          | `[0, 10, inf, 40, inf, inf, inf]` | `[{v: 1, d: 10}, {v: 3, d: 40}]`                |
|   2   | `{v: 1, d: 10}` | `{0, 1}`       | `[0, 10, 20, 40, inf, inf, inf]`  | `[{v: 2, d: 20}, {v: 3, d: 40}]`                |
|   3   | `{v: 2, d: 20}` | `{0, 1, 2}`    | `[0, 10, 20, 30, inf, inf, inf]`  | `[{v: 3, d: 30}, {v: 3, d: 40}]` \*             |
|   4   | `{v: 3, d: 30}` | `{0, 1, 2, 3}` | `[0, 10, 20, 30, 32, inf, inf]`   | `[{v: 4, d: 32}, {v: 3, d: 40}]`                |
|   5   | `{v: 4, d: 32}` | `{0,1,2,3,4}`  | `[0, 10, 20, 30, 32, 35, 40]`     | `[{v: 5, d: 35}, {v: 3, d: 40}, {v: 6, d: 40}]` |
|   6   | `{v: 5, d: 35}` | `{0,..,5}`     | `[0, 10, 20, 30, 32, 35, 38]`     | `[{v: 6, d: 38}, {v: 3, d: 40}, {v: 6, d: 40}]` |
|   7   | `{v: 6, d: 38}` | `{0,..,6}`     | `[0, 10, 20, 30, 32, 35, 38]`     | `[{v: 3, d: 40}, {v: 6, d: 40}]`                |
|   8   | `{v: 3, d: 40}` | -              | (skip, 3 is visited)              | `[{v: 6, d: 40}]`                               |
|   9   | `{v: 6, d: 40}` | -              | (skip, 6 is visited)              | `[]`                                            |

*Note: In step 3, `dist[3]` is updated from 40 to 30 (path `0->1->2->3`). A new entry `{v: 3, d: 30}` is added to the PQ. The old entry `{v: 3, d: 40}` remains but will be ignored later since 3 will be marked visited when we process the entry with distance 30.*

**Final distances from source 0:** `[0, 10, 20, 30, 32, 35, 38]`

#### Dijkstra's Algorithm with Min-Priority Queue

```js
/**
 * A simple Min-Priority Queue implementation for Dijkstra's algorithm.
 * In a real-world scenario, a more efficient heap-based implementation would be used.
 */
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority); // Simple, but inefficient sort
  }

  dequeue() {
    return this.elements.shift().element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Implements Dijkstra's algorithm to find the shortest path from a source to all other vertices.
 * @param {number} n - The number of vertices.
 * @param {number[][]} edges - An array of edges [u, v, weight].
 * @param {number} src - The source vertex.
 * @returns {number[]} An array of shortest distances from the source.
 * Time: O(E log V) with an efficient priority queue (min-heap). With array-based sort, it's O(V*E) or worse.
 * Space: O(V + E) for the adjacency list, distance array, and priority queue.
 */
function dijkstra(n, edges, src) {
  // Create an adjacency list to represent the graph.
  // The list stores pairs of {neighbor, weight}.
  const graph = new Array(n).fill(0).map(() => []);
  for (const [u, v, weight] of edges) {
    graph[u].push({ neighbor: v, weight });
    graph[v].push({ neighbor: u, weight }); // Assuming undirected graph
  }

  // Initialize the distances array with infinity for all vertices except the source.
  const distances = new Array(n).fill(Infinity);
  distances[src] = 0;

  // Priority queue to store {vertex, distance} and prioritize the smallest distance.
  const pq = new PriorityQueue();
  pq.enqueue(src, 0);

  // A set or boolean array to keep track of visited nodes to avoid cycles and redundant processing.
  // This is a common optimization for Dijkstra's.
  const visited = new Array(n).fill(false);

  // Main loop of the algorithm.
  while (!pq.isEmpty()) {
    // Get the vertex with the smallest distance from the priority queue.
    const currentVertex = pq.dequeue();

    // If we've already found a shorter path to this vertex and processed it, skip.
    if (visited[currentVertex]) {
        continue;
    }

    // Mark the current vertex as visited.
    visited[currentVertex] = true;

    // Iterate over all neighbors of the current vertex.
    for (const edge of graph[currentVertex]) {
      const neighbor = edge.neighbor;
      const weight = edge.weight;

      // Calculate the new distance to the neighbor through the current vertex.
      const newDistance = distances[currentVertex] + weight;

      // If this new path is shorter than the previously known path...
      if (newDistance < distances[neighbor]) {
        // ...update the distance.
        distances[neighbor] = newDistance;
        // And add the neighbor to the priority queue to explore its neighbors later.
        pq.enqueue(neighbor, newDistance);
      }
    }
  }

  // Return the array of final shortest distances.
  return distances;
}


// Example usage from the diagram
const numCities = 7;
const cityConnections = [
  [0, 1, 10], [0, 3, 40], [1, 2, 10], [2, 3, 10],
  [3, 4, 2], [4, 5, 3], [4, 6, 8], [5, 6, 3]
];
const startCity = 0;

const shortestDistances = dijkstra(numCities, cityConnections, startCity);
console.log("Shortest distances from city 0:", shortestDistances);
// Expected Output: [0, 10, 20, 30, 32, 35, 38]

// Time Complexity: O(E log V)
// Space Complexity: O(V + E)
```

```python
import heapq
from collections import defaultdict


def dijkstra(num_nodes, edges, source):
    adj = defaultdict(list)
    for u, v, wt in edges:
        adj[u].append((v, wt))
        adj[v].append((u, wt))

    dist = [float('inf')] * (num_nodes + 1)
    dist[source] = 0
    # min-heap storing (distance, node)
    min_heap = [(0, source)]

    while min_heap:
        d, u = heapq.heappop(min_heap)

        if d > dist[u]:
            continue

        for neighbor, weight in adj[u]:
            if dist[u] + weight < dist[neighbor]:
                dist[neighbor] = dist[u] + weight
                heapq.heappush(min_heap, (dist[neighbor], neighbor))

    return dist


# Time Complexity: O((V + E) log V)
# Space Complexity: O(V + E)
```

### 3. Topological Sort / Possible to finish all courses **O(N), O(N)**
```
Given N courses and a list of prerequisites, we have to check if it is possible to finish all the courses. For example, to take course 2, you must first take course 1. This is a prerequisite.
```

#### Theory / Observations

This problem can be modeled as a directed graph where courses are vertices and prerequisites are directed edges. If course `u` is a prerequisite for course `v`, we draw a directed edge `u -> v`.

It is possible to finish all courses if and only if the graph of dependencies is a **Directed Acyclic Graph (DAG)**. If there is a cycle (e.g., `A -> B -> C -> A`), it represents a deadlock where you can never satisfy the prerequisites for the courses in the cycle.

A **Topological Sort** or **Topological Ordering** of a DAG is a linear ordering of its vertices such that for every directed edge from vertex `u` to vertex `v`, `u` comes before `v` in the ordering. This ordering represents a valid sequence in which the courses can be taken.

There are two main algorithms for finding a topological sort:

1.  **Kahn's Algorithm (BFS-based):** This is the one detailed in the notes. It uses the concept of **in-degree** (the number of incoming edges) for each vertex.
2.  **DFS-based Algorithm:** This approach uses Depth First Search and a stack.

#### Kahn's Algorithm

**Steps:**

1.  **Compute In-degrees:** Create an array `inDegree` and calculate the in-degree for every vertex by iterating through all the edges.
2.  **Initialize Queue:** Create a queue and add all vertices with an in-degree of 0. These are the courses with no prerequisites.
3.  **Process Queue:**
    a.  Initialize a list or array `result` to store the topological order and a `count` of visited nodes to 0.
    b.  While the queue is not empty:
    i.   Dequeue a vertex `u`.
    ii.  Add `u` to the `result` list and increment `count`.
    iii. For each neighbor `v` of `u`:
    \-   Decrement the in-degree of `v` (since we have "completed" course `u`).
    \-   If the in-degree of `v` becomes 0, enqueue `v`.
4.  **Check for Cycle:** After the loop, if `count` is equal to the total number of vertices, it means we have successfully ordered all courses, and the `result` list is a valid topological sort. If `count` is less than the number of vertices, it means there was a cycle in the graph, and it's impossible to finish all courses.

#### Diagrams

**Cyclic Graph (Impossible to finish)**
`1 -> 2`, `1 -> 3`, `2 -> 3`, `2 -> 5`, `3 -> 4`, `4 -> 2`
The cycle is `2 -> 3 -> 4 -> 2`.

```
      (1) -----> (3) -----> (4)
       |          ^          |
       |         /           |
       V        /            V
      (2) -----> (5)         (2)
       \____________________/
```

**Acyclic Graph (DAG - Possible to finish)**
`1 -> 2`, `1 -> 3`, `2 -> 4`, `2 -> 5`, `3 -> 4`

```
      (1) -----> (2) -----> (5)
       \         /
        \       /
         V     V
        (3) ->(4)
```

Possible topological sorts: `[1, 2, 3, 5, 4]`, `[1, 3, 2, 4, 5]`, etc.

#### Scenario-based Question

```
Which of the following is a correct topological order for this graph?
```

**Diagram:**

```
      (TD) ----> (TA) ----> (TC)
       |          |          ^
       |          |         /
       V          V        /
      (TA) ----> (TB) <----/

Redrawing for clarity:
TD -> TA
TA -> TB
TA -> TC
TC -> TB

```

**Analysis:**

  - **TD** has an in-degree of 0. It must come first.
  - After TD is done, **TA**'s prerequisite is met. So TA comes after TD.
  - After TA is done, **TB** and **TC**'s prerequisites are met.
  - TC is a prerequisite for TB. So TC must come before TB.
  - Therefore, a valid order is **TD -\> TA -\> TC -\> TB**.

#### 1. Kahn's Algorithm (BFS-based)

```js
/**
 * Performs a topological sort on a directed graph using Kahn's algorithm.
 * @param {number} n - The number of vertices (courses).
 * @param {number[][]} prerequisites - An array of prerequisite pairs [u, v], meaning u must be taken before v.
 * @returns {number[] | string} The topological order if possible, otherwise a message indicating a cycle.
 * Time: O(V + E) where V is vertices and E is edges.
 * Space: O(V + E) for the graph, in-degree array, and queue.
 */
function topologicalSort(n, prerequisites) {
  // Step 1: Build the graph and the in-degree array.
  const graph = new Array(n).fill(0).map(() => []);
  const inDegree = new Array(n).fill(0);

  for (const [u, v] of prerequisites) {
    // Edge from u -> v
    graph[u].push(v);
    // Increment the in-degree of the destination vertex v.
    inDegree[v]++;
  }

  // Step 2: Initialize the queue with all vertices having an in-degree of 0.
  const queue = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // This will store the final sorted order.
  const result = [];

  // Step 3: Process the queue.
  while (queue.length > 0) {
    // Dequeue a vertex.
    const u = queue.shift();
    // Add it to our result list.
    result.push(u);

    // Iterate over its neighbors.
    for (const v of graph[u]) {
      // Decrement the in-degree of the neighbor.
      inDegree[v]--;
      // If the in-degree becomes 0, it means all its prerequisites are met.
      if (inDegree[v] === 0) {
        // Add it to the queue to be processed.
        queue.push(v);
      }
    }
  }

  // Step 4: Check for a cycle.
  if (result.length === n) {
    // If the result has all the vertices, we have a valid sort.
    return result;
  } else {
    // Otherwise, the graph has a cycle.
    return "Impossible to finish all courses, a cycle was detected.";
  }
}

// Example usage
const numCourses = 5;
const prereqs = [[1, 0], [2, 0], [3, 1], [3, 2]]; // Example: To take course 0, you need 1 and 2.
console.log("Topological Order:", topologicalSort(numCourses, prereqs));

const numCourses_cycle = 4;
const prereqs_cycle = [[1, 0], [0, 2], [2, 1], [2, 3]]; // Cycle: 1->0->2->1
console.log("Topological Order (with cycle):", topologicalSort(numCourses_cycle, prereqs_cycle));

// Time Complexity: O(V + E)
// Space Complexity: O(V + E)
```

```python
from collections import deque, defaultdict


def topological_sort_kahns(num_nodes, edges):
    adj = defaultdict(list)
    in_degree = [0] * (num_nodes + 1)

    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1

    queue = deque([i for i in range(1, num_nodes + 1) if in_degree[i] == 0])
    topo_order = []

    while queue:
        node = queue.popleft()
        topo_order.append(node)

        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(topo_order) != num_nodes:
        return []  # Graph has a cycle

    return topo_order


# Time Complexity: O(V + E)
# Space Complexity: O(V + E)
```

#### 2. DFS-based Algorithm

The DFS approach works by visiting each node and only adding it to the final topological order *after* all of its descendants have been visited and added. This is typically achieved by using a stack or recursion.

**Algorithm Steps:**

1.  Initialize a `visited` set (or array) to keep track of visited nodes during the DFS traversal.
2.  Initialize a `recursionStack` set to detect cycles.
3.  Initialize a `stack` to store the topological order.
4.  Iterate through all vertices of the graph. If a vertex hasn't been visited, call a recursive DFS helper function on it.
5.  **DFS Helper Function `dfs(vertex)`:**
    a.  Mark `vertex` as visited and add it to the `recursionStack`.
    b.  For each neighbor of `vertex`:
    i.  If the neighbor is in the `recursionStack`, a cycle is detected. Return `false`.
    ii. If the neighbor is not visited, recursively call `dfs(neighbor)`. If the recursive call returns `false`, propagate it up.
    c.  Remove `vertex` from the `recursionStack`.
    d.  Push `vertex` onto the `stack`.
    e.  Return `true`.
6.  After iterating through all vertices, if no cycle was detected, the `stack` (when popped) contains the topological sort.

```js
/**
 * Performs a topological sort using a DFS-based approach.
 * @param {number} n - The number of vertices.
 * @param {number[][]} prerequisites - An array of prerequisite pairs [u, v].
 * @returns {number[] | string} The topological order, or a cycle detection message.
 * Time: O(V + E)
 * Space: O(V + E)
 */
function topologicalSortDFS(n, prerequisites) {
  // Build the graph
  const graph = new Array(n).fill(0).map(() => []);
  for (const [u, v] of prerequisites) {
    graph[u].push(v);
  }

  const visited = new Set();
  const recursionStack = new Set();
  const resultStack = [];

  /**
   * Recursive DFS helper function.
   * @param {number} vertex - The current vertex to visit.
   * @returns {boolean} - True if no cycle is found in this path, false otherwise.
   */
  function dfs(vertex) {
    // Mark the current node as visited and part of the current recursion stack.
    visited.add(vertex);
    recursionStack.add(vertex);

    // Recur for all the vertices adjacent to this vertex.
    for (const neighbor of graph[vertex]) {
      // If the neighbor is not visited yet, recurse on it.
      if (!visited.has(neighbor)) {
        if (!dfs(neighbor)) {
          // If a cycle is detected downstream, propagate the result up.
          return false;
        }
      }
      // If the neighbor is already in the recursion stack, we have found a cycle.
      else if (recursionStack.has(neighbor)) {
        return false;
      }
    }

    // Remove the vertex from recursion stack before returning.
    recursionStack.delete(vertex);
    // Push current vertex to stack which stores the result.
    // This happens only after all its neighbors have been processed.
    resultStack.push(vertex);

    return true;
  }

  // Call the recursive helper for all vertices.
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      if (!dfs(i)) {
        return "Impossible to finish all courses, a cycle was detected.";
      }
    }
  }

  // The stack contains the vertices in reverse topological order.
  return resultStack.reverse();
}

// Example usage
console.log("Topological Order (DFS):", topologicalSortDFS(numCourses, prereqs));
console.log("Topological Order (DFS with cycle):", topologicalSortDFS(numCourses_cycle, prereqs_cycle));
// Time Complexity: O(V + E)
// Space Complexity: O(V + E)
```

```python
from collections import defaultdict


def topological_sort_dfs(num_nodes, edges):
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)

    visited = [False] * (num_nodes + 1)
    rec_stack = [False] * (num_nodes + 1)
    stack = []

    def dfs(node):
        visited[node] = True
        rec_stack[node] = True

        for neighbor in adj[node]:
            if not visited[neighbor]:
                if dfs(neighbor):
                    return True
            elif rec_stack[neighbor]:
                return True  # Cycle detected

        rec_stack[node] = False
        stack.append(node)
        return False

    for i in range(1, num_nodes + 1):
        if not visited[i]:
            if dfs(i):
                return []  # Cycle exists

    return stack[::-1]


# Time Complexity: O(V + E)
# Space Complexity: O(V + E)
```

### 4. Possibility of Finishing | BFS (Khan's Algorithm) | DFS (Cycle Detection) **O(N), O(N)**
```
There are a total of A courses you have to take, labeled from 1 to A.
Some courses may have prerequisites, for example to take course 2 you have to first take course 1, which is expressed as a pair: [1,2].
So you are given two integer array B and C of same size where for each i (B[i], C[i]) denotes a pair.
Given the total number of courses and a list of prerequisite pairs, is it possible for you to finish all courses?
Return 1 if it is possible to finish all the courses, or 0 if it is not possible to finish all the courses.
```

#### 1. BFS (Kahn's Algorithm for Topological Sort)

```
This problem can be modeled as finding a cycle in a directed graph. Each course is a node, and a prerequisite pair (u, v) represents a directed edge from u to v. Finishing all courses is possible if and only if the graph is a Directed Acyclic Graph (DAG), i.e., it contains no cycles.

Kahn's algorithm is a popular method to find a topological sort of a DAG. If a topological sort can be generated that includes all the vertices, the graph is acyclic. If the algorithm terminates before visiting all vertices, the graph must contain a cycle.

The approach is as follows:
1.  **Graph Representation**: We build an adjacency list to represent the graph and an `inDegree` array to store the number of prerequisites for each course.
2.  **Initialization**: We initialize a queue with all courses that have an in-degree of 0 (i.e., courses with no prerequisites).
3.  **Processing**: We process the queue. For each course we dequeue:
    a. We increment a counter for the number of completed courses.
    b. For each course that has the current course as a prerequisite, we decrement its in-degree.
    c. If a course's in-degree becomes 0, it means all its prerequisites are now met, so we enqueue it.
4.  **Conclusion**: After the queue is empty, if the count of completed courses equals the total number of courses, it means all courses could be finished in some order. Otherwise, a cycle exists, making it impossible.
```

```js
/**
 * Checks if all courses can be finished using Kahn's algorithm (BFS).
 * @param {number} A - The total number of courses.
 * @param {number[]} B - An array of prerequisite courses.
 * @param {number[]} C - An array of courses that depend on the prerequisites.
 * @returns {number} 1 if possible, 0 otherwise.
 */
function canFinishCoursesBFS(A, B, C) {
  // Number of courses (vertices).
  const numCourses = A;
  // Number of prerequisite pairs (edges).
  const numPrerequisites = B.length;

  // inDegree array to store the number of prerequisites for each course.
  // We use size A+1 to easily handle 1-based indexing for courses.
  const inDegree = new Array(numCourses + 1).fill(0);

  // Adjacency list to represent the course dependency graph.
  // adj[i] will contain a list of courses that have course 'i' as a prerequisite.
  const adj = Array.from({ length: numCourses + 1 }, () => []);

  // Build the graph and populate the inDegree array from the input prerequisites.
  for (let i = 0; i < numPrerequisites; i++) {
    // B[i] is a prerequisite for C[i]. This means there is an edge from B[i] to C[i].
    const prerequisite = B[i];
    const course = C[i];

    // Add an edge from the prerequisite to the course.
    adj[prerequisite].push(course);
    // Increment the in-degree of the course that has a prerequisite.
    inDegree[course]++;
  }

  // Create a queue to store courses with no prerequisites (in-degree of 0).
  const queue = [];
  // Populate the queue with initial courses that can be taken.
  for (let i = 1; i <= numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // A counter to keep track of the number of courses that are part of the topological sort.
  let finishedCoursesCount = 0;

  // Process the courses in the queue.
  while (queue.length > 0) {
    // Dequeue a course that has no remaining prerequisites.
    const currentCourse = queue.shift();
    // Increment the count of finished courses.
    finishedCoursesCount++;

    // Iterate through all courses that depend on the currentCourse.
    for (const dependentCourse of adj[currentCourse]) {
      // Since currentCourse is now "finished", decrement the prerequisite count for its dependent courses.
      inDegree[dependentCourse]--;

      // If a dependent course now has no prerequisites left, it's ready to be taken. Add it to the queue.
      if (inDegree[dependentCourse] === 0) {
        queue.push(dependentCourse);
      }
    }
  }

  // If the number of finished courses equals the total number of courses,
  // it means a valid topological order exists, and there are no cycles.
  if (finishedCoursesCount === numCourses) {
    return 1; // It is possible to finish all courses.
  } else {
    return 0; // It is not possible due to a cycle.
  }
}

// Example usage:
const A1 = 3, B1 = [1, 2], C1 = [2, 3];
console.log(`Can finish courses for Example 1? ${canFinishCoursesBFS(A1, B1, C1)}`); // Expected output: 1

const A2 = 2, B2 = [1, 2], C2 = [2, 1];
console.log(`Can finish courses for Example 2? ${canFinishCoursesBFS(A2, B2, C2)}`); // Expected output: 0

// Time Complexity: O(A + E), where A is the number of courses (vertices) and E is the number of prerequisites (edges).
// We iterate through all edges to build the graph and in-degree array. Then, we visit each vertex and edge once during the BFS traversal.
// Space Complexity: O(A + E).
// We use an adjacency list (O(E)), an in-degree array (O(A)), and a queue (O(A) in the worst case).
```

```python
from collections import deque, defaultdict


def can_finish_courses_bfs(num_courses, prerequisites):
    adj = defaultdict(list)
    in_degree = [0] * num_courses

    for dest, src in prerequisites:
        adj[src].append(dest)
        in_degree[dest] += 1

    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    finished = 0

    while queue:
        curr = queue.popleft()
        finished += 1
        for nxt in adj[curr]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)

    return finished == num_courses


print(can_finish_courses_bfs(2, [[1, 0]]))          # True
print(can_finish_courses_bfs(2, [[1, 0], [0, 1]]))  # False

# Time Complexity: O(V + E)
# Space Complexity: O(V + E)
```

#### 2. DFS (Depth-First Search) Cycle Detection

```
Another way to solve this is to use Depth-First Search (DFS) to detect a cycle in the directed graph. If a cycle is detected, it's impossible to finish all the courses.

The core idea is to maintain two sets (or boolean arrays) for tracking the state of each node during the DFS traversal:
1.  `visited`: Keeps track of nodes that have been visited at any point. This prevents redundant computations.
2.  `recursionStack`: Keeps track of nodes that are currently in the recursion path of the ongoing DFS traversal.

A cycle is detected if we visit a node that is already present in the `recursionStack`. This indicates a "back edge" in the graph, which forms a cycle.

The approach is as follows:
1.  **Graph Representation**: Build an adjacency list from the prerequisite pairs.
2.  **DFS Traversal**: Iterate through all courses from 1 to A. If a course hasn't been visited, start a DFS traversal from it.
3.  **Cycle Detection**: During a DFS from a course `u`:
    a. Mark `u` as visited and add it to the `recursionStack`.
    b. For each neighbor `v` of `u`, if `v` is already in the `recursionStack`, a cycle is found.
    c. If `v` is not visited, recursively call DFS on `v`. If the recursive call finds a cycle, propagate this information up.
    d. When returning from the recursion for `u`, remove it from the `recursionStack` (backtracking).
4.  **Conclusion**: If any DFS traversal finds a cycle, we immediately know it's impossible. If we traverse the entire graph without finding any cycles, it's possible.
```

```js
/**
 * Checks if all courses can be finished using DFS cycle detection.
 * @param {number} A - The total number of courses.
 * @param {number[]} B - An array of prerequisite courses.
 * @param {number[]} C - An array of courses that depend on the prerequisites.
 * @returns {number} 1 if possible, 0 otherwise.
 */
function canFinishCoursesDFS(A, B, C) {
  // Number of courses (vertices).
  const numCourses = A;
  // Number of prerequisite pairs (edges).
  const numPrerequisites = B.length;

  // Adjacency list to represent the course dependency graph.
  const adj = Array.from({ length: numCourses + 1 }, () => []);

  // Build the graph from the input prerequisites.
  for (let i = 0; i < numPrerequisites; i++) {
    const prerequisite = B[i];
    const course = C[i];
    // Add an edge from the prerequisite to the course.
    adj[prerequisite].push(course);
  }

  // `visited` array tracks nodes that have been visited in any DFS traversal.
  const visited = new Array(numCourses + 1).fill(false);
  // `recursionStack` tracks nodes currently in the recursion stack for the *current* DFS traversal.
  const recursionStack = new Array(numCourses + 1).fill(false);

  // Helper function to perform DFS and detect cycles.
  // It returns true if a cycle is detected, false otherwise.
  const hasCycle = (course) => {
    // Mark the current course as visited and part of the current recursion path.
    visited[course] = true;
    recursionStack[course] = true;

    // Iterate through all courses that depend on the current course.
    for (const dependentCourse of adj[course]) {
      // If the dependent course hasn't been visited yet, perform DFS on it.
      if (!visited[dependentCourse]) {
        // If the recursive call finds a cycle, propagate the result up by returning true.
        if (hasCycle(dependentCourse)) {
          return true;
        }
      }
      // If the dependent course is already in the current recursion stack,
      // we have found a back edge, which indicates a cycle.
      else if (recursionStack[dependentCourse]) {
        return true;
      }
    }

    // Backtrack: Remove the current course from the recursion stack as we are done exploring its path.
    recursionStack[course] = false;
    // No cycle was found in the path starting from this course.
    return false;
  };

  // Iterate through all courses to handle potentially disconnected components in the graph.
  for (let i = 1; i <= numCourses; i++) {
    // If a course has not been visited yet, start a new DFS from it.
    if (!visited[i]) {
      // If the DFS call detects a cycle, it's impossible to finish the courses.
      if (hasCycle(i)) {
        return 0; // Cycle detected, not possible.
      }
    }
  }

  // If we iterate through all courses and their paths without finding any cycles, it's possible.
  return 1;
}


// Example usage:
const A1_dfs = 3, B1_dfs = [1, 2], C1_dfs = [2, 3];
console.log(`Can finish courses for Example 1? ${canFinishCoursesDFS(A1_dfs, B1_dfs, C1_dfs)}`); // Expected output: 1

const A2_dfs = 2, B2_dfs = [1, 2], C2_dfs = [2, 1];
console.log(`Can finish courses for Example 2? ${canFinishCoursesDFS(A2_dfs, B2_dfs, C2_dfs)}`); // Expected output: 0

// Time Complexity: O(A + E), where A is the number of courses (vertices) and E is the number of prerequisites (edges).
// Each vertex and edge is visited exactly once across all DFS calls.
// Space Complexity: O(A + E).
// We use an adjacency list (O(E)), visited and recursionStack arrays (O(A)), and the system's recursion stack (O(A) in the worst case for a long chain).
```

```python
from collections import defaultdict


def can_finish_courses_dfs(num_courses, prerequisites):
    adj = defaultdict(list)
    for dest, src in prerequisites:
        adj[src].append(dest)

    visited = [0] * num_courses  # 0: unvisited, 1: visiting, 2: visited

    def has_cycle(course):
        visited[course] = 1
        for nxt in adj[course]:
            if visited[nxt] == 1:
                return True
            if visited[nxt] == 0 and has_cycle(nxt):
                return True
        visited[course] = 2
        return False

    for c in range(num_courses):
        if visited[c] == 0:
            if has_cycle(c):
                return False

    return True


print(can_finish_courses_dfs(2, [[1, 0]]))  # True

# Time Complexity: O(V + E)
# Space Complexity: O(V + E)
```

### 5. Topological Sort | Kahn's Algorithm with Min-Heap **O(N), O(N)**
```
Given an directed acyclic graph having A nodes. A matrix B of size M x 2 is given which represents the M edges such that there is a edge directed from node B[i][0] to node B[i][1].
Topological sorting for Directed Acyclic Graph (DAG) is a linear ordering of vertices such that for every directed edge uv, vertex u comes before v in the ordering. Topological Sorting for a graph is not possible if the graph is not a DAG.
Return the topological ordering of the graph and if it doesn't exist then return an empty array.
If there is a solution return the correct ordering. If there are multiple solutions print the lexographically smallest one.
Ordering (a, b, c) is said to be lexographically smaller than ordering (e, f, g) if a < e or if(a==e) then b < f and so on.

NOTE:
There are no self-loops in the graph.
The graph may or may not be connected.
Nodes are numbered from 1 to A.
Your solution will run on multiple test cases. If you are using global variables make sure to clear them.
```

#### 1. Kahn's Algorithm with a Min-Heap

```
The problem requires a topological sort, but with the specific condition of finding the lexicographically smallest ordering. This suggests that whenever we have a choice of which node to visit next, we must always pick the smallest one.

Kahn's algorithm, a BFS-based approach, is perfect for this. The standard algorithm uses a regular queue, but to get the lexicographically smallest result, we can replace the queue with a Min-Priority Queue (Min-Heap).

The algorithm proceeds as follows:
1.  **Compute In-degrees**: We first build an adjacency list for the graph and compute the in-degree (number of incoming edges) for every node.
2.  **Initialize Heap**: We find all nodes with an in-degree of 0. These are the starting points of our graph, as they have no prerequisites. We add all of them to a min-heap.
3.  **Process Nodes**: We loop until the min-heap is empty. In each iteration, we extract the smallest node from the heap (this is guaranteed by the min-heap property). This node is the next in our sorted order.
4.  **Update Neighbors**: After processing a node, we iterate through its neighbors and decrease their in-degree by one, signifying that one of their prerequisites has been met. If a neighbor's in-degree becomes 0, we add it to the min-heap, as it is now ready to be processed.
5.  **Cycle Detection**: If, after the loop, the number of nodes in our result list is less than the total number of nodes (A), it implies the graph has a cycle, and a valid topological sort is impossible. In this case, we return an empty array. Otherwise, we return the sorted result.
```

```js
/**
 * A Min-Priority Queue class to efficiently manage nodes with an in-degree of 0,
 * always providing the smallest node first.
 */
class MinPriorityQueue {
  constructor() {
    // The heap is an array of numbers.
    this.heap = [];
  }
  // Checks if the heap is empty.
  isEmpty() {
    return this.heap.length === 0;
  }
  // Swaps two elements in the heap.
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
  // Helper methods to get parent and child indices.
  parent(i) { return Math.floor((i - 1) / 2); }
  leftChild(i) { return 2 * i + 1; }
  rightChild(i) { return 2 * i + 2; }

  /**
   * Adds an element to the heap and maintains the heap property.
   * @param {number} element The node to add.
   */
  enqueue(element) {
    // Add the new element to the end of the array.
    this.heap.push(element);
    // Bubble it up to its correct position.
    this.siftUp(this.heap.length - 1);
  }

  /**
   * Removes and returns the smallest element (the root) from the heap.
   * @returns {number|null} The smallest node.
   */
  dequeue() {
    // If the heap is empty, there's nothing to remove.
    if (this.isEmpty()) return null;
    // Swap the root with the last element.
    this.swap(0, this.heap.length - 1);
    // Remove the last element (which was the original root).
    const dequeued = this.heap.pop();
    // If the heap is not empty, restore the heap property from the new root.
    if (!this.isEmpty()) {
      this.siftDown(0);
    }
    return dequeued;
  }

  /**
   * Moves an element up the heap to its correct position.
   * @param {number} i The index of the element to sift up.
   */
  siftUp(i) {
    let parentIndex = this.parent(i);
    // Keep swapping with the parent as long as the element is smaller.
    while (i > 0 && this.heap[i] < this.heap[parentIndex]) {
      this.swap(i, parentIndex);
      i = parentIndex;
      parentIndex = this.parent(i);
    }
  }

  /**
   * Moves an element down the heap to its correct position.
   * @param {number} i The index of the element to sift down.
   */
  siftDown(i) {
    let minIndex = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);
    const size = this.heap.length;
    // Find the smallest among the element and its children.
    if (left < size && this.heap[left] < this.heap[minIndex]) minIndex = left;
    if (right < size && this.heap[right] < this.heap[minIndex]) minIndex = right;
    // If the element is not the smallest, swap it with the smallest child and continue.
    if (i !== minIndex) {
      this.swap(i, minIndex);
      this.siftDown(minIndex);
    }
  }
}

/**
 * Generates the lexicographically smallest topological sort of a directed graph.
 * Time:  O((A + M) * log A)
 * Space: O(A + M)
 * @param {number} A The number of nodes (numbered 1 to A).
 * @param {number[][]} B A matrix representing the directed edges [from, to].
 * @returns {number[]} The sorted list of nodes, or an empty array if a cycle exists.
 */
function solution(A, B) {
  // Use arrays of size A+1 to handle 1-based indexing of nodes.
  const adj = Array(A + 1).fill(0).map(() => []);
  const inDegree = Array(A + 1).fill(0);

  // Step 1: Build the adjacency list and in-degree array.
  for (const edge of B) {
    const [u, v] = edge;
    // Add an edge from u to v.
    adj[u].push(v);
    // Increment the in-degree of the destination node v.
    inDegree[v]++;
  }

  // Step 2: Initialize the min-heap with all nodes having an in-degree of 0.
  const minHeap = new MinPriorityQueue();
  for (let i = 1; i <= A; i++) {
    if (inDegree[i] === 0) {
      minHeap.enqueue(i);
    }
  }

  // This array will store the final sorted order.
  const result = [];

  // Step 3: Process nodes from the min-heap.
  while (!minHeap.isEmpty()) {
    // Get the smallest available node (guarantees lexicographical order).
    const u = minHeap.dequeue();
    // Add it to our result list.
    result.push(u);

    // Step 4: Update neighbors' in-degrees.
    for (const v of adj[u]) {
      // Since u is processed, it's no longer a prerequisite for v.
      inDegree[v]--;
      // If v now has no prerequisites, it's ready to be processed.
      if (inDegree[v] === 0) {
        minHeap.enqueue(v);
      }
    }
  }

  // Step 5: Check for cycles.
  // A valid topological sort includes all nodes.
  if (result.length === A) {
    return result; // Success, no cycle.
  } else {
    return []; // A cycle was detected.
  }
}

// example usage
const A1 = 6;
const B1 = [ [6, 3], [6, 1], [5, 1], [5, 2], [3, 4], [4, 2] ];
console.log(solution(A1, B1)); // expected output: [5, 6, 1, 3, 4, 2]

const A2 = 3;
const B2 = [ [1, 2], [2, 3], [3, 1] ];
console.log(solution(A2, B2)); // expected output: []

// Time Complexity: O((A + M) * log A)
// Building the graph takes O(A + M). The main loop can run up to A times (for each node). Each edge M results in an in-degree update. In the worst case, every node or edge update could lead to a heap operation (enqueue/dequeue), which costs O(log A). Therefore, the complexity is dominated by heap operations.

// Space Complexity: O(A + M)
// The adjacency list requires O(A + M) space. The in-degree array and result array require O(A) space. The min-heap can store up to O(A) nodes.
```

```python
import heapq
from collections import defaultdict


def topological_sort_lexicographical(num_nodes, edges):
    adj = defaultdict(list)
    in_degree = [0] * (num_nodes + 1)

    for u, v in edges:
        adj[u].append(v)
        in_degree[v] += 1

    # Min-Heap ensures smallest available node is processed first
    min_heap = [i for i in range(1, num_nodes + 1) if in_degree[i] == 0]
    heapq.heapify(min_heap)
    result = []

    while min_heap:
        node = heapq.heappop(min_heap)
        result.append(node)

        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                heapq.heappush(min_heap, neighbor)

    if len(result) != num_nodes:
        return []

    return result


# Time Complexity: O(V log V + E log V)
# Space Complexity: O(V + E)
```

## Multiple Approaches

### 1. Connecting the ropes | Priority Queue **O(N), O(N)**
```
We are given an array that represents the size of different ropes. In a single operation, you can connect two ropes. Cost of connecting two ropes is sum of the length of ropes you are connecting. Find the minimum cost of connecting all the ropes.
```

#### 1. Insertion Sort
```js
/**
 * ALGORITHM: Minimum Cost to Connect Ropes
 * 1. Start with an initial array of rope lengths.
 * 2. Use Insertion Sort to sort the initial array in ascending order.
 * 3. While there is more than one rope in the array:
 * * a. Take the two smallest ropes (the first two elements of the sorted array).
 * * b. Calculate the cost to connect them (sum of the two ropes).
 * * c. Add this connection cost to the total cumulative cost.
 * * d. Remove the two used ropes and insert the new combined rope back into the array.
 * * e. Re-sort the array using a single pass of Insertion Sort to maintain order.
 * 4. Return the total cumulative cost.
 */

function minCostToConnectRopes(ropes) {
    let totalCost = 0;

    // Initial check: if there's only one rope or none, cost is 0
    if (ropes.length <= 1) return 0;

    // Perform an initial Insertion Sort to get the ropes in order
    insertionSort(ropes);

    // Continue connecting until only one rope remains
    while (ropes.length > 1) {
        // Extract the two smallest ropes (always at index 0 and 1)
        let first = ropes.shift(); // Remove the smallest
        let second = ropes.shift(); // Remove the second smallest

        // The cost for this specific connection
        let currentCost = first + second;

        // Add current connection cost to the total running cost
        totalCost += currentCost;

        // Push the new combined rope back into the array
        ropes.push(currentCost);

        // Re-sort the array to ensure the next two smallest are at the front
        // Since only one element is out of order, Insertion Sort is very efficient here
        insertionSort(ropes);
    }

    return totalCost;
}

// Standard Insertion Sort Implementation
function insertionSort(arr) {
    // Iterate through the array starting from the second element
    for (let i = 1; i < arr.length; i++) {
        // Store the current element to be compared
        let key = arr[i];
        let j = i - 1;

        // Move elements of arr[0..i-1] that are greater than key
        // to one position ahead of their current position
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        // Place the key at its correct sorted position
        arr[j + 1] = key;
    }
}

// Test Outputs
const ropes1 = [4, 3, 2, 6];
console.log("Minimum cost for [4, 3, 2, 6]:", minCostToConnectRopes(ropes1));
// Expected: 29 (2+3=5, [4,5,6] -> 4+5=9, [9,6] -> 9+6=15. Total: 5+9+15=29)

const ropes2 = [1, 2, 3, 4, 5];
console.log("Minimum cost for [1, 2, 3, 4, 5]:", minCostToConnectRopes(ropes2));
// Expected: 33

/**
 * TIME COMPLEXITY: O(N^2)
 * The initial insertion sort takes O(N^2). Inside the while loop (which runs N-1 times),
 * we perform another insertion sort. While insertion sort is O(N) for a nearly sorted
 * array (which we have here), the cumulative complexity results in O(N^2).
 * * SPACE COMPLEXITY: O(1)
 * The algorithm sorts the array in-place (or modifies the existing array) and uses
 * a few auxiliary variables, requiring no extra space proportional to the input size.
 */
```

```python
def min_cost_ropes_insertion(ropes):
    if len(ropes) <= 1:
        return 0
    ropes.sort()
    cost = 0
    while len(ropes) > 1:
        c = ropes.pop(0) + ropes.pop(0)
        cost += c
        # Insert c into sorted position
        inserted = False
        for i, r in enumerate(ropes):
            if r >= c:
                ropes.insert(i, c)
                inserted = True
                break
        if not inserted:
            ropes.append(c)
    return cost
```

#### 2. Priority Queue
```js
/**
 * -------- Priority Queue (Min-Heap) --------
 * ALGORITHM EXPLANATION:
 * This implementation uses an array-based binary heap.
 * For any element at index i:
 * - Left Child:  2i + 1
 * - Right Child: 2i + 2
 * - Parent:      floor((i - 1) / 2)
 * * The 'Min-Heap Property' ensures the parent is always smaller than its children.
 * * CORE OPERATIONS:
 * 1. Insert (add): Append to end and 'bubbleUp' to restore order.
 * 2. Extract Min (poll): Replace root with last element and 'bubbleDown' to restore order.
 */
class PriorityQueue {
    constructor() {
        // Initialize an empty array to store heap elements
        this.heap = [];
    }

    // Helper: Returns the number of elements in the heap
    size() {
        // Return the current length of the underlying array
        return this.heap.length;
    }

    // Adds a new value and "bubbles up" to maintain heap property
    add(val) { // Insertion operation // O(log n)
        // Add to the end of the array
        this.heap.push(val);
        // Move the newly added element up to its correct position to maintain min-heap property
        this.bubbleUp();
    }

    // Removes and returns the smallest value (root) and "bubbles down"
    poll() { // Extraction operation // O(log n)
        // Handle empty heap case
        if (this.size() === 0) return null;
        // If only one element exists, simply remove and return it
        if (this.size() === 1) return this.heap.pop();

        // Store the root (smallest) value to return later
        const min = this.heap[0];
        // Move the last element in the array to the root position
        this.heap[0] = this.heap.pop();
        // Restore heap property by moving the new root down to its correct position
        this.bubbleDown();
        return min;
    }

    // Restoration: Moves the last element up the tree to its correct position to maintain heap property of min-heap
    bubbleUp() {
        // Start tracking from the last element added
        let index = this.heap.length - 1;
        // Continue until the element reaches the root or finds its place
        while (index > 0) {
            // Calculate parent index: floor((i - 1) / 2)
            let parentIndex = Math.floor((index - 1) / 2);
            // If child is smaller than parent, swap them (Violates Min-Heap property)
            if (this.heap[index] < this.heap[parentIndex]) {
                // Perform ES6 array destructuring swap
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                // Update current index to parent's position for next iteration
                index = parentIndex;
            } else {
                // Property is satisfied; stop bubbling up
                break;
            }
        }
    }

    // Restoration: Moves the root element down the tree to its correct position to maintain heap property of min-heap
    bubbleDown() {
        // Start from the root
        let index = 0;
        const length = this.heap.length;

        while (true) {
            // Calculate child indices
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = null;

            // Compare with left child
            if (left < length) {
                // If left child is smaller than current element, mark for swap
                if (this.heap[left] < this.heap[index]) {
                    swap = left;
                }
            }

            // Compare with right child (must be smaller than both parent and left child)
            if (right < length) {
                if (
                    // Case 1: Right is smaller than parent and no swap with left was planned
                    (swap === null && this.heap[right] < this.heap[index]) ||
                    // Case 2: Right is smaller than the left child
                    (swap !== null && this.heap[right] < this.heap[left])
                ) {
                    swap = right;
                }
            }

            // If no swap index was set, the heap property is restored
            if (swap === null) break;

            // Perform the swap between parent and the smaller child
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];

            // Update index to the child's position to continue the process
            index = swap;
        }
    }
}

/**
 * -------- Minimum cost to connect ropes --------
 * @param {number[]} lengths - array of rope lengths
 * @returns {number} minimum total cost
 *
 * Algorithm Explanation (Greedy Approach):
 * To minimize the total cost, we must always combine the two shortest available ropes.
 * This is because shorter ropes are added to the total sum multiple times if combined early.
 * 1) Push all lengths into a min-heap (O(n log n)).
 * 2) While more than one rope remains:
 * - Pop two smallest (a, b) (O(log n)).
 * - Calculate merge cost = a + b.
 * - Add this merge cost to the running total.
 * - Push (a + b) back to heap to be treated as a new rope (O(log n)).
 * 3) Return total accumulated cost.
 */
function minCostToConnectRopes(lengths) {
    // Edge case: if no ropes or only one, no connection is possible (cost 0)
    if (!Array.isArray(lengths) || lengths.length <= 1) return 0;

    // Instantiate our priority queue
    const pq = new PriorityQueue();

    // Fill the heap with initial rope lengths
    for (const len of lengths) { // for loop runs O(n) times
        pq.add(len); // each add is O(log n)
    }

    let total = 0;
    // Keep merging until only one combined rope remains
    while (pq.size() > 1) { // while loop runs O(n) times
        // Extract the two smallest elements
        const a = pq.poll(); // each poll is O(log n)
        const b = pq.poll(); // each poll is O(log n)
        // The cost for this step is the sum of the two ropes
        const cost = a + b;
        // Accumulate this step's cost into the total
        total += cost;
        // Put the newly merged rope back into the priority queue
        pq.add(cost); // each add is O(log n)
    }

    // Return the total cost of all connections
    return total;
}

console.log(minCostToConnectRopes([])); // 0
console.log(minCostToConnectRopes([8])); // 0 (nothing to connect)

console.log(minCostToConnectRopes([1, 2, 3])); // 9
// Steps:
// 1 + 2 = 3 (cost 3), ropes: [3, 3], Total cost = 3
// 3 + 3 = 6 (cost 6), ropes: [6], Total cost = 3 + 6 = 9

console.log(minCostToConnectRopes([4, 3, 2, 6])); // 29
// Steps:
// 2 + 3 = 5 (cost 5), ropes: [4, 5, 6], Total cost = 5
// 4 + 5 = 9 (cost 9), ropes: [6, 9], Total cost = 5 + 9 = 14
// 6 + 9 = 15 (cost 15), ropes: [15], Total cost = 14 + 15 = 29

console.log(minCostToConnectRopes([1, 2, 5, 10, 35, 89])); // 224
console.log(minCostToConnectRopes([2, 2, 3, 3])); // 20

/**
 * COMPLEXITY ANALYSIS:
 * * Time Complexity: O(n log n)
 * - Inserting n elements into the heap takes O(n log n).
 * - The while loop runs n-1 times. Inside the loop, `poll()` and `add()`
 * both take O(log n), leading to O(n log n) for the connection phase.
 *
 * * Space Complexity: O(n)
 * - We store all n rope lengths in the priority queue (heap).
 */
```

```python
import heapq


def min_cost_ropes_pq(lengths):
    if not lengths or len(lengths) <= 1:
        return 0
    heapq.heapify(lengths)
    total = 0
    while len(lengths) > 1:
        c = heapq.heappop(lengths) + heapq.heappop(lengths)
        total += c
        heapq.heappush(lengths, c)
    return total
```

### 2. Target Sum / Subset Sum Problem | Recursion (Brute Force) | 2D DP (Tabulation) | 1D DP (Space Optimization) **O(N), O(N)**
```
You are given a set of non-negative integers and a target sum. The task is to determine whether there exists a subset of the given set whose sum is equal to the target sum.
```

#### 1. Recursive (Brute-force)

```js
/**
 * Determines if a subset with the given sum exists using recursion.
 * Time:  O(2^n) - For each element, we have two choices, leading to an exponential number of calls.
 * Space: O(n) - The depth of the recursion stack can go up to n.
 */
function targetSumRecursive(arr, target) {
  // Helper function to perform the recursion
  function canPartition(index, currentSum) {
    // Base case: If the current sum equals the target, we found a solution.
    if (currentSum === 0) {
      return true;
    }
    // Base case: If we've run out of numbers or the sum is negative, this path is invalid.
    if (index < 0 || currentSum < 0) {
      return false;
    }

    // Choice 1: Select the current element.
    // We include arr[index] and check if the remaining sum can be found in the rest of the array.
    const included = canPartition(index - 1, currentSum - arr[index]);

    // Choice 2: Reject the current element.
    // We skip arr[index] and check if the sum can be found in the rest of the array.
    const excluded = canPartition(index - 1, currentSum);

    // Return true if either choice leads to a solution.
    return included || excluded;
  }

  // Start the recursion from the last element of the array.
  return canPartition(arr.length - 1, target);
}

// Example usage
const arr1 = [3, 34, 12, 4, 5, 2];
const target1 = 41;
console.log(`Can sum to ${target1}?`, targetSumRecursive(arr1, target1)); // true (34+5+2)

const target2 = 9;
console.log(`Can sum to ${target2}?`, targetSumRecursive(arr1, target2)); // true (4+5 or 3+4+2)

const target3 = 30;
console.log(`Can sum to ${target3}?`, targetSumRecursive(arr1, target3)); // false (no subset)


/**
 * Solves the subset sum problem using recursion with memoization.
 * Time:  O(n * targetSum) - Each state (index, sum) is computed only once.
 * Space: O(n * targetSum) - For the memoization cache and recursion stack.
 */
function targetSumMemoized(arr, target) {
  // A cache to store results of subproblems. Key: "index-sum", Value: boolean
  const memo = new Map();

  function solve(index, currentSum) {
    // Base case: A solution is found
    if (currentSum === 0) {
      return true;
    }
    // Base case: Invalid path (out of bounds or sum is negative)
    if (index < 0 || currentSum < 0) {
      return false;
    }

    // Check if we have already computed the result for this state
    const key = `${index}-${currentSum}`;
    if (memo.has(key)) {
      return memo.get(key);
    }

    // Choice 1: Include the current element
    const included = solve(index - 1, currentSum - arr[index]);

    // Choice 2: Exclude the current element
    const excluded = solve(index - 1, currentSum);

    // Store the result and return
    const result = included || excluded;
    memo.set(key, result);
    return result;
  }

  return solve(arr.length - 1, target);
}

// Example usage
const arr = [3, 34, 12, 4, 5, 2];
const targetSum = 41;
console.log("Memoized Recursive:", targetSumMemoized(arr, targetSum)); // true
```

```python
def target_sum_rec(arr, target):
    def dfs(i, s):
        if s == target:
            return True
        if i >= len(arr) or s > target:
            return False
        return dfs(i + 1, s + arr[i]) or dfs(i + 1, s)

    return dfs(0, 0)
```

#### 2. Dynamic Programming (Tabulation)

```js
/**
 * Determines if a subset with the given sum exists using dynamic programming.
 * Time:  O(n * target) - We iterate through a 2D array of size n * target.
 * Space: O(n * target) - We use a 2D array to store the results of subproblems.
 */
function targetSumTabulation(arr, target) {
  const n = arr.length;
  // dp[i][j] will be true if a sum `j` can be obtained using a subset of the first `i` elements.
  const dp = Array(n + 1).fill(false).map(() => Array(target + 1).fill(false));

  // Base case: A sum of 0 is always possible (by choosing an empty subset).
  for (let i = 0; i <= n; i++) {
    dp[i][0] = true;
  }

  // Iterate through each element
  for (let i = 1; i <= n; i++) {
    const currentElement = arr[i - 1];
    // Iterate through each possible sum
    for (let j = 1; j <= target; j++) {
      // If we don't include the current element, the result is the same as for the previous `i-1` elements.
      const excluded = dp[i - 1][j];

      // If we can include the current element (i.e., the target sum `j` is greater than or equal to it)
      let included = false;
      if (j >= currentElement) {
        // The result is whether we could form the remaining sum `j - currentElement` with the previous `i-1` elements.
        included = dp[i - 1][j - currentElement];
      }

      // The current state is true if we can achieve the sum by either including OR excluding the element.
      dp[i][j] = included || excluded;
    }
  }

  // The final answer is in the bottom-right cell.
  return dp[n][target];
}

// Example usage
const arr4 = [3, 34, 12, 4, 5, 2];
const target4 = 41;
console.log(`Can sum to ${target4}?`, targetSumTabulation(arr4, target4)); // true

const target5 = 30;
console.log(`Can sum to ${target5}?`, targetSumTabulation(arr4, target5)); // false
```

```python
def target_sum_tab(arr, target):
    n = len(arr)
    dp = [[False] * (target + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = True
    for i in range(1, n + 1):
        for j in range(1, target + 1):
            if arr[i - 1] <= j:
                dp[i][j] = dp[i - 1][j] or dp[i - 1][j - arr[i - 1]]
            else:
                dp[i][j] = dp[i - 1][j]
    return dp[n][target]
```

#### 3. Space-Optimized Dynamic Programming

```js
/**
 * Space-optimized version of the target sum problem using only one row for DP.
 * Time:  O(n * target) - We still iterate through each element and each target sum.
 * Space: O(target) - We only need one array of size `target+1` to store the previous row's results.
 */
function targetSumSpaceOptimized(arr, target) {
  const n = arr.length;
  // dp[j] will be true if sum `j` is achievable.
  let dp = Array(target + 1).fill(false);

  // Base case: A sum of 0 is always possible.
  dp[0] = true;

  // Iterate through each element in the input array.
  for (let i = 0; i < n; i++) {
    const currentElement = arr[i];
    // Iterate backwards from the target sum down to the value of the current element.
    // We go backwards to use the results from the *previous* row (before processing the current element).
    for (let j = target; j >= currentElement; j--) {
      // If sum `j` is not yet achievable, check if it can be achieved by including the current element.
      // This is true if `dp[j - currentElement]` was achievable in the previous step.
      dp[j] = dp[j] || dp[j - currentElement];
    }
  }

  // The final answer is at dp[target].
  return dp[target];
}

// Example usage
const arr6 = [3, 34, 12, 4, 5, 2];
const target6 = 41;
console.log(`Can sum to ${target6}?`, targetSumSpaceOptimized(arr6, target6)); // true

const target7 = 30;
console.log(`Can sum to ${target7}?`, targetSumSpaceOptimized(arr6, target7)); // false
```

```python
def target_sum_space_opt(arr, target):
    dp = [False] * (target + 1)
    dp[0] = True
    for x in arr:
        for j in range(target, x - 1, -1):
            dp[j] = dp[j] or dp[j - x]
    return dp[target]
```
