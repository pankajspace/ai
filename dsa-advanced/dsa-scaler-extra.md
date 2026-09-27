[<- DSA](00-dsa-quick.md)

# DSA Extra

## Index
1. [Bit Manipulation Basics](#1-bit-manipulations-basics)
2. [Multiple Approaches](#2-multiple-approaches)

# Questions

## 1. Bit Manipulations Basics

### 1. Binary to Decimal Conversion. **O(log N), O(1)**
```js
function binaryToDecimal(n) {
  let decimalNumber = 0;
  const base = 2;
  let multiplier = 1;
  while (n > 0) {
    let lastDigit = n % 10;
    n = Math.floor(n / 10);

    decimalNumber += lastDigit * multiplier;
    multiplier *= base; // 1, 2, 4, 8, 16, ...
    // Alternative way
    // let position = 0;
    // decimalNumber += lastDigit * Math.pow(base, position);
    // position += 1;
  }
  console.log(decimalNumber);
  return decimalNumber;
}
binaryToDecimal(1101) // 13
```

### 2. Decimal to Binary Conversion. **O(log N), O(1)**
```js
function decimalToBinary(n) {
  let binaryNumber = 0;
  const base = 10;
  let multiplier = 1;
  while (n > 0) {
    let lastDigit = n % 2;
    n = Math.floor(n / 2);

    binaryNumber += lastDigit * multiplier;
    multiplier *= base;
    // Alternative way
    // let position = 0;
    // binaryNumber += lastDigit * Math.pow(base, position);
    // position += 1;
  }
  console.log(binaryNumber);
  return binaryNumber;
}
decimalToBinary(13) // 1101
```

## 2. Multiple Approaches

### 1. Find sum of all subarrays sums

#### 1. Find sum of all subarrays sums | Brute Force Approach: **O(N^3), O(1)**
```js
function sumOfAllSubarrays(A) {
  let sum = 0;
  for (let i = 0; i < A.length; i++) {
    for (let j = i; j < A.length; j++) {
      for (let k = i; k <= j; k++) {
        sum += A[k];
      }
    }
  }
  return sum;
}

console.log(sumOfAllSubarrays([1, 2, 3])); // 20
console.log(sumOfAllSubarrays([1, 2, 3, 4])); // 50

// Time Complexity: O(N^3)
// Space Complexity: O(1)
```

```java
// Brute Force: O(N^3)
public static long sumOfAllSubarraysBrute(int[] A) {
    long sum = 0;
    for (int i = 0; i < A.length; i++) {
        for (int j = i; j < A.length; j++) {
            for (int k = i; k <= j; k++) {
                sum += A[k];
            }
        }
    }
    return sum;
}
// System.out.println(sumOfAllSubarraysBrute(new int[]{1,2,3}));   // 20
// System.out.println(sumOfAllSubarraysBrute(new int[]{1,2,3,4})); // 50
```

#### 2. Find sum of all subarrays sums | Prefix Sum: **O(N^2), O(N)**
```js
function sumOfAllSubarrays(A) {
    // Calculate prefix sum
    let prefixSum = [];
    prefixSum[0] = A[0];
    for (let i = 1; i < A.length; i++) {
        prefixSum[i] = prefixSum[i - 1] + A[i];
    }
    console.log(prefixSum);

    let sum = 0;
    for (let i = 0; i < A.length; i++) {
        for (let j = i; j < A.length; j++) {
            if (i === 0) {
                sum += prefixSum[j];
            } else {
                sum += prefixSum[j] - prefixSum[i - 1];
            }
        }
    }

    return sum;
}

console.log(sumOfAllSubarrays([1, 2, 3])); // 20
console.log(sumOfAllSubarrays([1, 2, 3, 4])); // 50

// Time Complexity: O(N^2)
// Space Complexity: O(N)
```

```java
// Prefix Sum: O(N^2) time, O(N) space
public static long sumOfAllSubarraysPrefix(int[] A) {
    int[] prefixSum = new int[A.length];
    prefixSum[0] = A[0];
    for (int i = 1; i < A.length; i++) {
        prefixSum[i] = prefixSum[i - 1] + A[i];
    }
    long sum = 0;
    for (int i = 0; i < A.length; i++) {
        for (int j = i; j < A.length; j++) {
            sum += (i == 0) ? prefixSum[j] : prefixSum[j] - prefixSum[i - 1];
        }
    }
    return sum;
}
// System.out.println(sumOfAllSubarraysPrefix(new int[]{1,2,3}));   // 20
// System.out.println(sumOfAllSubarraysPrefix(new int[]{1,2,3,4})); // 50
```

#### 3. Find sum of all subarrays sums | Carry Forward Technique: **O(N^2), O(1)**
```js
function sumOfAllSubarrays(A) {
  let sum = 0;
  for (let i = 0; i < A.length; i++) {
    let subarraySum = 0;
    // Calculate sum of subarray starting from i to end of array
    for (let j = i; j < A.length; j++) {
      subarraySum += A[j];
      sum += subarraySum;
    }
  }

  return sum;
}

console.log(sumOfAllSubarrays([1, 2, 3])); // 20
console.log(sumOfAllSubarrays([1, 2, 3, 4])); // 50

// Time Complexity: O(N^2)
// Space Complexity: O(1)
```

```java
// Carry Forward: O(N^2) time, O(1) space
public static long sumOfAllSubarraysCarryForward(int[] A) {
    long sum = 0;
    for (int i = 0; i < A.length; i++) {
        int subarraySum = 0;
        for (int j = i; j < A.length; j++) {
            subarraySum += A[j];
            sum += subarraySum;
        }
    }
    return sum;
}
// System.out.println(sumOfAllSubarraysCarryForward(new int[]{1,2,3}));   // 20
// System.out.println(sumOfAllSubarraysCarryForward(new int[]{1,2,3,4})); // 50
```

#### 4. Find sum of all subarrays sums | Contribution Technique: **O(N), O(1)**
```js
function sumOfAllSubarrays(A) {
  let sum = 0;
  const N = A.length;
  for (let i = 0; i < N; i++) {
    // For each element A[i], it contributes to (i + 1) * (N - i) subarrays
    // In other words index i will be present in (i + 1) * (N - i) subarrays
    const subarrayCount = (i + 1) * (N - i);

    // Contribution of A[i] is A[i] * subarrayCount
    const contribution = A[i] * subarrayCount;

    // Add contribution of A[i] to the total sum
    sum += contribution;
  }
  return sum;
}

console.log(sumOfAllSubarrays([1, 2, 3])); // 20
console.log(sumOfAllSubarrays([1, 2, 3, 4])); // 50

// Time Complexity: O(N)
// Space Complexity: O(1)
```

```java
// Contribution Technique: O(N) time, O(1) space
public static long sumOfAllSubarraysContrib(int[] A) {
    long sum = 0;
    int N = A.length;
    for (int i = 0; i < N; i++) {
        long subarrayCount = (long)(i + 1) * (N - i);
        sum += A[i] * subarrayCount;
    }
    return sum;
}
// System.out.println(sumOfAllSubarraysContrib(new int[]{1,2,3}));   // 20
// System.out.println(sumOfAllSubarraysContrib(new int[]{1,2,3,4})); // 50
```

### 2. Find maximum subarray sum of length K

#### 1. Find maximum subarray sum of length K | Brute Force Approach: **O(N*K), O(1)**
```js
function maxSubarraySum(A, K) {
    let start = 0;
    let end = K - 1;
    let maxSum = 0;

    while (end < A.length) {
        let currentSubarraySum = 0;

        for (let i = start; i <= end; i++) {
            currentSubarraySum += A[i];
        }

        maxSum = Math.max(maxSum, currentSubarraySum);

        start++;
        end++;
    }

    return maxSum;
}

console.log(maxSubarraySum([1, 2, 3, 4, 5], 3)); // 12

// Time Complexity: O(N * K)
// Space Complexity: O(1)
```

```java
// Brute Force: O(N*K) time, O(1) space
public static int maxSubarraySumBrute(int[] A, int K) {
    int start = 0, end = K - 1;
    int maxSum = 0;
    while (end < A.length) {
        int currentSum = 0;
        for (int i = start; i <= end; i++) currentSum += A[i];
        maxSum = Math.max(maxSum, currentSum);
        start++;
        end++;
    }
    return maxSum;
}
// System.out.println(maxSubarraySumBrute(new int[]{1,2,3,4,5}, 3)); // 12
```

#### 2. Find maximum subarray sum of length K | Prefix Sum: **O(N), O(N)**
```js
function maxSubarraySum(A, K) {
    let prefixSum = [A[0]];
    for (let i = 1; i < A.length; i++) {
        prefixSum[i] = prefixSum[i - 1] + A[i];
    }

    // prefixSum = [1, 3, 6, 10, 15] for A = [1, 2, 3, 4, 5]

    let start = 0;
    let end = K - 1;
    let maxSum = 0
    while (end < A.length) {
        let sum;
        if (start === 0) {
            sum = prefixSum[end];
        } else {
            sum = prefixSum[end] - prefixSum[start - 1];
        }
        maxSum = Math.max(maxSum, sum);
        start++;
        end++;
    }

    return maxSum;
}

console.log(maxSubarraySum([1, 2, 3, 4, 5], 3)); // 12

// Time Complexity: O(N)
// Space Complexity: O(N)
```

```java
// Prefix Sum: O(N) time, O(N) space
public static int maxSubarraySumPrefix(int[] A, int K) {
    int[] prefixSum = new int[A.length];
    prefixSum[0] = A[0];
    for (int i = 1; i < A.length; i++) {
        prefixSum[i] = prefixSum[i - 1] + A[i];
    }

    int start = 0, end = K - 1;
    int maxSum = 0;
    while (end < A.length) {
        int sum;
        if (start == 0) {
            sum = prefixSum[end];
        } else {
            sum = prefixSum[end] - prefixSum[start - 1];
        }
        maxSum = Math.max(maxSum, sum);
        start++;
        end++;
    }
    return maxSum;
}
// System.out.println(maxSubarraySumPrefix(new int[]{1,2,3,4,5}, 3)); // 12
```

#### 3. Find maximum subarray sum of length K | Sliding Window Fixed: **O(N), O(1)**
```js
function maxSubarraySum(A, K) {
    let currentWindowSum = 0;
    // Calculate sum of first K elements
    for (let i = 0; i < K; i++) {
        currentWindowSum += A[i];
    }

    let maxSum = currentWindowSum;

    let start = 0;
    let end = K - 1;
    while (end < A.length) {
        currentWindowSum = currentWindowSum - A[start] + A[end];
        maxSum = Math.max(maxSum, currentWindowSum);
        start++;
        end++;
    }

    return maxSum;
}

console.log(maxSubarraySum([1, 2, 3, 4, 5], 3)); // 12

// Time Complexity: O(N)
// Space Complexity: O(1)
```

```java
// Sliding Window Fixed: O(N) time, O(1) space
public static int maxSubarraySumSliding(int[] A, int K) {
    int currentWindowSum = 0;
    for (int i = 0; i < K; i++) {
        currentWindowSum += A[i];
    }

    int maxSum = currentWindowSum;

    int start = 0, end = K - 1;
    while (end < A.length) {
        currentWindowSum = currentWindowSum - A[start] + A[end];
        maxSum = Math.max(maxSum, currentWindowSum);
        start++;
        end++;
    }
    return maxSum;
}
// System.out.println(maxSubarraySumSliding(new int[]{1,2,3,4,5}, 3)); // 12
```




### 3. Find maximum subarray sum less than or equal to sum K

#### 1. Positive Numbers Only | Sliding Window Dynamic **O(N), O(1)**

#### 2. With Negative Numbers | Balanced BST **O(N log N), O(N)**

### 4. Find the unique element in an array where every element appears twice except for one. | Binary Search on Array | Bit Manipulation **O(log N), O(1)**

#### 1. Using Binary Search on Array

#### 2. Using Bit Manipulation

### 5. Check pair with given sum exists in a sorted array having distinct elements | Brute Force | Binary Search | Hash Set | Two Pointers

#### 1. Using Brute Force T(n^2), S(1)

#### 2. Using Binary Search T(n log n), S(1)

#### 3. Using Hash Set T(n), S(n)

#### 4. Using Two Pointers T(n), S(1)

### 6. Print Valid Parenthesis | Backtracking **O(N), O(1)**

#### 1. Recursive Proactive Approach

#### 2. Recursive Reactive Approach

#### 3. Iterative Approach using Stack

#### 4. Dynamic Programming

### 7. Check pair with given sum exists in a sorted array having distinct elements | Brute Force | Binary Search | Hash Set | Two Pointers

#### 1. Using Brute Force T(n^2), S(1)

#### 2. Using Binary Search T(n log n), S(1)

#### 3. Using Hash Set T(n), S(n)

#### 4. Using Two Pointers T(n), S(1)

## 3. Interview Problems

### 1. Minimum Meeting Rooms (Max Overlap of Meetings) | Two Pointers + Sorting **O(N), O(N)**

### 2. Sort a K-Sorted (Nearly Sorted) Array | Min-Heap (Priority Queue) **O(N), O(N)**

### 3. Minimum Distance Between Equal Elements | Hash Map (Last-Seen Index) **O(N), O(N)**

### 4. Minimum Window Substring | Sliding Window + Frequency Maps **O(N), O(N)**

### 5. Shaggy and distances | Hash Map (last-seen index) + Single Pass **O(N), O(N)**

### 6. K Places Apart | Min-Heap of size (B+1) **O(N), O(N)**

### 7. Meeting Rooms II | Two-Pointer Sweep over Sorted Start/End Times **O(N), O(N)**

### 8. Minimum Window Substring | Sliding Window + Frequency Counts **O(N), O(N)**

### 9. Number of Islands | DFS | BFS **O(N), O(N)**

### 10. Shortest Distance in a Maze | BFS (Dijkstra's on unweighted graph) **O(N), O(N)**

### 11. Minimum Jumps to Reach End | Dynamic Programming | Greedy (Optimized) **O(N), O(N)**

### 12. Maximum Profit from Stock Prices | Peak Valley Approach | Single One Pass **O(N), O(N)**

### 13. Stock Buy Sell-I (One Transaction) **O(N), O(N)**

### 14. Stock Buy Sell-II (Multiple Transactions) **O(N), O(N)**

### 15. Stock Buy Sell-III (At Most Two Transactions) **O(N), O(N)**

### 16. Stock Buy Sell-IV (At Most K Transactions) **O(N), O(N)**

### 17. Best Time to Buy and Sell Stock | Greedy Approach (Peak Valley) | Dynamic Programming **O(N), O(N)**

### 18. Shortest Distance in a Maze | Dijkstra's Algorithm **O(N), O(N)**

### 19. Number of Islands | DFS | BFS **O(N), O(N)**

### 20. Jump Game 2 | Dynamic Programming | Greedy Approach **O(N), O(N)**

### 21. Valid Path | BFS with On-the-Fly Check | BFS with Pre-computed Obstacle Grid **O(N), O(N)**