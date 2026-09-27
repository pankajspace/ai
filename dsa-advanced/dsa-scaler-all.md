[<- DSA](00-dsa-quick.md)

# Revision Intermediate DSA

## Problem Solving
### My Notes
1. Sum of first N natural numbers: N * (N + 1) / 2
2. Sum of first N terms of a GP = a * (r^N - 1) / (r - 1) where a is the first term, r is the common ratio.
3. [a, b] inclusive range of numbers. [a, b] = b - a + 1
4. (a, b) exclusive range of numbers. (a, b) = b - a - 1
### Questions
1. Count factors of a number
2. Prime Number Check, Prime Number is a number which has exactly 2 factors. 1 and the number itself.
3. Find Perfect Number, Perfect Number is a positive integer which is equal to the sum of its proper positive divisors.
4. Count Prime Numbers below given number

## Time Complexity
### My Notes
1.  Time Complexity & Big O Notation calculation.
2.  Time complexity examples.
3.  Time complexity from best to worst: O(1) < O(log n) < O(sqrt(n)) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)
4.  O(1)       - Constant time complexity.
5.  O(log n)   - Logarithmic time complexity.
6.  O(sqrt(n)) - Square root time complexity.
7.  O(n)       - Linear time complexity.
8.  O(n log n) - Linearithmic time complexity.
9.  O(n^2)     - Quadratic time complexity.
10. O(n^3)     - Cubic time complexity.
11. O(2^n)     - Exponential time complexity.
12. O(n!)      - Factorial time complexity.
13. Online editors have a time limit of 1 sec which is equivalent to 10^9 instructions. To avoid TLE in online editors, optimize the code to reduce the number of iterations to 10^8 or less.
14. Logarithms explained with examples.
    1. log₂(8)  = 3 means 2³ = 8
    2. log₃(81) = 4 means 3⁴ = 81

## 1D Arrays Basics
### My Notes
1. Total number of subarrays in an array of size n is n*(n+1)/2.
2. Length of the subarray is (end - start + 1).
### Brute Force
1. Reversing an array involves swapping elements from the start and end. **O(N), O(1)**
2. Rotating an array involves reversing segments of the array. **O(N), O(1)**
3. Reverse Array in a Range **O(N), O(1)**
4. Sum of Max & Min in an Array **O(N), O(1)**
5. Linear Search - Multiple Occurrences / Count of occurrences of an element in an array **O(N), O(1)**
6. Time to Equality. Find minimum time to make all elements equal by incrementing elements by 1 **O(N), O(1)**
7. Count of elements in an Array which have at least one element greater than itself **O(N), O(1)**
8. Find Second Largest Element in an Array **O(N), O(1)**

## Prefix Sum Basics
### Questions
1. Create a prefix sum array. **O(N), O(N)**
2. Create a prefix sum array to calculate the sum of elements in a given range. / Range Sum Query **O(N), O(N)**
3. Create a prefix sum array to calculate the sum of even indexed elements in a given range. **O(N), O(N)**
4. Create a prefix sum array to calculate the sum of odd indexed elements in a given range. **O(N), O(N)**
5. Find the number of special indices in an array. Special indices are indices such that removing an element at that index makes the sum of even indexed elements equal to the sum of odd indexed elements. **O(N), O(N)**
6. In place prefix sum. **O(N), O(1)**
7. Equilibrium index of an array. Sum of elements at lower indexes is equal to the sum of elements at higher indexes. **O(N), O(1)**
8. Prefix Sum of counter. **O(N), O(N)**

## Carry Forward & Subarray
### My Notes
1. Total no. of subarrays = N * (N + 1) / 2
### Brute Force
1. Print elements of the subarray that starts from the start index and ends at the end index | Simple iteration **O(N), O(1)**
```js
function printSubarray(A, start, end) {
  for (let i = start; i <= end; i++) {
    console.log(A[i]);
  }
}

printSubarray([1, 2, 3, 4, 5], 1, 3); // 2, 3, 4`
```
2. Print all possible subarrays of the array. No optimised solution available | Brute Force **O(N^2), O(1)**
```js
function printAllSubarrays(A) {
    const result = [];
    for (let i = 0; i < A.length; i++) {
        for (let j = i; j < A.length; j++) {
            let subarray = [];
            for (let k = i; k <= j; k++) {
                subarray.push(A[k]);
            }
            result.push(subarray);
            // console.log(subarray);
        }
    }
    return result;
}

console.log(printAllSubarrays([1, 2, 3])); // [ [ 1 ], [ 1, 2 ], [ 1, 2, 3 ], [ 2 ], [ 2, 3 ], [ 3 ] ]
console.log(printAllSubarrays([1, 2])); // [ [ 1 ], [ 1, 2 ], [ 2 ] ]
```
### Carry Forward 
1. Special Subsequence "AG" / Count of pairs of two given characters in an array. **O(N), O(1)**
2. Closest MinMax Subarray / Smallest subarray containing min and max elements. **O(N), O(1)**
3. Pick from both sides in given no of operations, maximize the picked elements sum | Carry Forward (Prefix + Suffix) **O(N), O(1)** | Sliding window Fixed **O(N), O(1)**
4. Leaders in an array. An element is a leader if it is strictly greater than all the elements to its right side. **O(N), O(1)**
5. Best Time to Buy and Sell Stocks 1 / Maximum profit. **O(N), O(1)**

## Sliding Window & Contribution
### My Notes
1. For any array of size N, number of subarrays of size K = N - K + 1 
### Brute Force
1. Print subarrays sums starting from given index | Simple iteration **O(N), O(1)**
```js
function printSubarraysFromIndex(A, startIndex) {
    let subarraySum = 0;
    let totalSum = 0;
    for (let j = startIndex; j < A.length; j++) {
        // we are carrying forward the subarraySum of subarray starting from startIndex to end of array
        subarraySum += A[j];
        process.stdout.write(subarraySum + ", "); // Print subarraySum of current subarray
        totalSum += subarraySum; // Keep track of total sum of all subarrays
    }
    process.stdout.write(`(Total: ${totalSum}) `); // Print total sum so far
    console.log(); // New line after printing the subarray
}

printSubarraysFromIndex([1, 2, 3, 4], 1); // Output: 2, 5, 9, (Total: 16)
printSubarraysFromIndex([1, 2, 3, 4], 2); // Output: 3, 7, (Total: 10)
printSubarraysFromIndex([1, 2, 3, 4], 0); // Output: 1, 3, 6, 10, (Total: 20)
```
2. Print and Count all Subarrays of given length K | While Loop **O(N), O(1)**
```js
function countSubarraysOfLengthK(A, K) {
  let count = 0;
  let start = 0;
  let end = K - 1;

  while (end < A.length) {
    console.log(`Start index: ${start}, End index: ${end}`);
    count++;
    start++;
    end++;
  }

  return count;
}

console.log(countSubarraysOfLengthK([1, 2, 3, 4, 5], 3)); // 3
// Start index: 0, End index: 2
// Start index: 1, End index: 3
// Start index: 2, End index: 4
```
### Multiple Approaches
1. Find sum of all subarrays sums
   - Brute Force Approach: **O(N^3), O(1)**
   - Prefix Sum: **O(N^2), O(N)**
   - Carry Forward Technique: **O(N^2), O(1)**
   - Contribution Technique: **O(N), O(1)**
2. Find maximum subarray sum of length K
   - Brute Force Approach: **O(N*K), O(1)**
   - Prefix Sum: **O(N), O(N)**
   - Sliding Window Fixed: **O(N), O(1)**

## Contribution Technique
1. Sum of all Subarrays sums. **O(N), O(1)**
2. Sum of all Submatrices sums. **O(N^2), O(1)**

## Sliding Window Fixed
1. Subarray with given sum and length. **O(N), O(1)**
2. Subarray with least average and given length B. **O(N), O(1)**
3. Range Sum Query of average. **O(N), O(1)**
4. Minimum Swaps. In given array bring all numbers less than or equal to given number together. **O(N), O(1)**

## Sliding Window Dynamic
1. Maximum Subarray Sum less than or equal to given sum | Brute Force **O(N^2), O(1)** | Sliding Window Dynamic **O(N), O(1)**
2. Counting Subarrays with Sum Less Than given sum | Brute Force (Carry forward technique) **O(N^2), O(1)** | Sliding Window Dynamic / Two Pointers. **O(N), O(1)**

## Fenwick Tree (BIT) + Coordinate Compression
1. Good Subarrays | Brute Force (Carry forward technique) **O(N^2), O(1)** | Fenwick Tree (BIT) + Coordinate Compression. **O(N log N), O(N)**

## Sorting Basics
### Questions
1. Minimize the cost to empty an array / Minimum cost to remove all elements | Sorting & Contribution **O(N log N), O(1)** | Sorting & Prefix sum **O(N log N), O(N)**
2. Find count of Noble Integers | Sorting **O(N log N), O(1)**
3. Find count of Nobel integers (Not Distinct) | Sorting **O(N log N), O(1)**
4. Nobel number in an array | Sorting **O(N log N), O(1)**
5. Kth smallest element | Sorting **O(N log N), O(1)**
6. Check Arithmetic Progression | Sorting **O(N log N), O(1)**
7. Check anagrams | Sorting **O(N log N), O(1)**
### Sorting Algorithms
1. Selection Sort **O(N^2), O(1)**
2. Insertion Sort **O(N^2), O(1)**
3. Bubble Sort **O(N^2), O(1)**

## 2D Arrays / Matrix Basics
### Simple Iteration
1. Creating and printing a 2D Array. **O(N*M), O(1)**
2. Given a matrix print row-wise sum. **O(N*M), O(1)**
3. Given a matrix print col-wise sum. **O(N*M), O(1)**
4. Given a square matrix print principal diagonal. **O(N), O(1)**
5. Given a square matrix print anti-diagonal. **O(N), O(1)**
6. Print all anti-diagonals in a rec matrix (right to left). **O(N*M), O(1)**
7. Transpose of a square matrix. **O(N*N), O(1)**
8. Rotate a matrix to 90 degree clockwise. **O(N*N), O(1)**
9. Sum of main diagonal elements of a matrix. **O(N), O(1)**
10. Column Sum. **O(N*M), O(1)**
11. Anti Diagonals Array. **O(N*M), O(1)**
12. Matrix Transpose Rectangular. **O(N*M), O(1)**
13. Matrix Scalar Product. **O(N*M), O(1)**
14. Add the matrices. **O(N*M), O(1)**
15. Minor Diagonal Sum. **O(N), O(1)**
16. Matrix replace every row and column with 0 if any element is 0. **O(N*M), O(1)**

## Bit Manipulations Basics
### Questions
1. Binary to Decimal Conversion. **O(N), O(1)**
2. Decimal to Binary Conversion. **O(N), O(1)**
3. Addition of Decimal Numbers. **O(N), O(1)**
4. Addition of Binary Numbers. **O(N), O(1)**
5. Add Binary Strings. **O(N), O(1)**

## Strings
### String data type
1. Toggling case of a string / Toggling Case of each character in a string. **O(N), O(1)**
2. Reverse the string. **O(N), O(1)**
3. Reverse the sentence. **O(N), O(1)**
4. Longest common prefix in an array of strings. **O(N), O(1)**
5. Count occurrences of a given substring in a string. **O(N), O(1)**
6. Count all the substrings of a string starting with a vowel. **O(N), O(1)**
7. Check if the given string contains all alphanumeric characters. **O(N), O(1)**
8. Reverse vowels in a string | While Loop **O(N), O(1)**
### Bit manipulation
1. Toggling case of a string. **O(N), O(1)**
### Two Pointers
1. Checking whether the given substring is palindrome or not. **O(N), O(1)**
2. Longest palindrome substring. **O(N), O(1)**
### Manacher's algorithm
1. Longest palindrome substring. **O(N), O(1)**

## Arrays Miscellaneous Basics
1. Length of longest consecutive 1's after replacement of 0 to 1 only once. **O(N), O(1)**
2. Length of longest consecutive 1's after swapping 0 to 1 only once. **O(N), O(1)**
3. Count Increasing Triplets. **O(N), O(1)**

## Boyer-Moore Voting Algorithm
1. Majority Element. **O(N), O(1)**
2. N/3 Repeat Number. **O(N), O(1)**

## Set Basics
1. Good Pair / Check if pair of elements have given sum exists in the array. **O(N), O(N)**
2. Colorful Number. **O(N), O(1)**

## Contest Intermediate DSA
1. Toggle String | Strings **O(N), O(1)**
2. Prefix Sum of counter | Prefix Sums **O(N), O(1)**
3. Range Sum Query of average | Sliding Window **O(N), O(1)**
4. Reverse vowels in a string | Strings **O(N), O(1)**
5. Rotate a matrix by 90 degrees | 2D Arrays **O(N), O(1)**
6. Amazing Subarrays | Set **O(N), O(1)**
7. Jenny and Negative numbers / Longest negative subarray | Kadane's Algorithm **O(N), O(1)**
8. Bob the Builder | Prefix Sum **O(N), O(1)**

# Revision Advanced DSA 1

## 1D Arrays Advanced
### Multiple Approaches
1. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Brute Force **O(N^2), O(1)**.
2. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Prefix Sum **O(N), O(N)**.
3. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Carry Forward **O(N), O(1)**.
4. Find Maximum Subarray Sum i.e. The subarray with maximum sum | Kadanes Algorithm **O(N), O(1)**.

## Prefix Sum Advanced
1. Zero Based Queries I (Perform multiple Queries from i to last index) (Beggars Outside Temple). **O(N), O(N)**.
2. Zero Based Queries II (Perform multiple Queries from index i to j) (Beggars Outside Temple). **O(N), O(N)**.
3. Zero Based Queries III (Perform multiple Queries from index i to j) (Beggars Outside Temple) | Prefix Sum when the initial array is non zero **O(N), O(N)**.

## Prefix Sum | Two Pointers
1. Trapping Rain Water / Rain Water Trapped | Prefix Sum **O(N), O(N)** | Two Pointers **O(N), O(1)**.

## Interval Technique
1. Merge Overlapping Intervals. **O(N), O(1)**.

## Kadane's Algorithm
1. Max Sum Contiguous Subarray. **O(N), O(1)**.
2. Find the maximum subarray sum as well as the subarray itself. **O(N), O(1)**.
3. Flip. Maximize 1s in Binary String. Return indices of flip. **O(N), O(1)**.

## 2D Arrays / Matrix Advanced
### Staircase Search
1. Find element in rowwise and colwise sorted matrix. **O(N), O(1)**.
2. Row with maximum number of ones. **O(N), O(1)**.
### Boundary Traversal
1. Print Boundary Elements of a 2D Matrix in Clockwise Manner / 2D Matrix Spiral Traversal. **O(N), O(1)**.
2. Lawn Mowing Problem / Print whole matrix in a clockwise manner. **O(N), O(1)**.

## Arrays Miscellaneous Advanced
1. Add One To Number. **O(N), O(1)**.
2. Find First Missing Natural Number if negative numbers are present in the array. **O(N), O(1)**.
3. First Missing Integer. **O(N), O(1)**.
4. Next Permutation. Find the next lexicographical permutation of a given array of numbers. **O(N), O(1)**.
5. Add One To Number. Increment a number represented as an array of digits by one, handling carry and leading zeros appropriately. **O(N), O(1)**.

## Bit Manipulation 1
### Questions
1. Checking even/odd. Check if the last bit is 0, then number is even, else odd. **O(1), O(1)**
2. Power of Left Shift Operator
   - Set ith bit | **O(1), O(1)**
   - Toggle ith bit | **O(1), O(1)**
   - Unset ith bit | **O(1), O(1)**
   - Check ith bit | **O(1), O(1)**
3. Check whether ith bit is set or not using left shift and AND operator. **O(1), O(1)**
4. Single Number 1. Every element appears twice except one. **O(N), O(1)**
5. Single Number 2. Every element appears thrice except one. **O(N), O(1)**
6. Single Number 3. Every element appears twice except two. **O(N), O(1)**
7. Number of 1 Bits. Count the number of 1 bits in binary representation. **O(1), O(1)**
8. Single Number I. Every element appear twice except one. **O(N), O(1)**
9. Single Number III. Every element appear twice except two. **O(N), O(1)**
10. Set Bit. Set the A-th bit and B-th bit in 0 and return output in decimal Number System. **O(1), O(1)**
11. Find n-th Magic Number. A magic number is defined as a number that can be expressed as a power of 5 or a sum of unique powers of 5. **O(log N), O(1)**
12. Help From Sam. Counts the number of set bits (1s) in the binary representation of A. **O(log N), O(1)**
13. Unset x bits from right. **O(1), O(1)**

## Lab Session Bit Manipulation
### Questions
1. Subarrays with OR 0. Count the number of subarrays where the bitwise OR of all elements in the subarray is 0 | Arrays Miscellaneous | Subarrays counting **O(N), O(1)**
2. Finding Good Days. Count the number of set bits in the binary representation of a number. **O(log N), O(1)**
3. Subarrays with OR 1. Count the number of subarrays where the bitwise OR of all elements in the subarray is 1 | Arrays Miscellaneous | Subarrays counting **O(N), O(1)**
4. Min XOR value. Find the pair of integers in the array which have minimum XOR value. **O(N), O(1)**
5. Strange Equality. Find the XOR of two numbers defined by specific conditions related to a given integer. **O(1), O(1)**

## Recursion
### My Notes
1. Time Complexity in Recursion
   1. Time complexity  = Number of function calls * Time taken by each function call
2. Space Complexity in Recursion
   1. Space complexity = Maximum levels in the recursion tree * Space taken per level
### Questions
1. Sum of n natural numbers. **O(N), O(N)**
2. Factorial of a number. **O(N), O(N)**
3. Increasing order / Print 1 to N. **O(N), O(N)**
4. Decreasing order / Whirpool's countdown timer / Print N to 1 function. **O(N), O(N)**
5. Fibonacci series / Find Nth Fibonacci number using recursion. **O(N), O(N)**
6. Fibonacci series using Memoization / Find Nth Fibonacci number using memoization. **O(N), O(N)**
7. Fibonacci series using Tabulation / Find Nth Fibonacci number using tabulation. **O(N), O(N)**
8. Sum of Digits! Find the sum of digits of a given number using recursion. **O(N), O(N)**
9. Decreasing & Increasing in one function. / Print 1 to N and N to 1 in one function. **O(N), O(N)**

## Lab Session Recursion
### Questions
1. Power function. **O(N), O(N)**
2. Fast Power function. **O(log N), O(log N)**
3. Print array using recursion. **O(N), O(N)**
4. Find all indices of an element in an array. **O(N), O(N)**
5. Check palindrome using recursion. **O(N), O(N)**
6. Tower of Hanoi. **O(N), O(N)**
7. Is magic number check / Sum of digits till a single digit is 1 or not. **O(N), O(N)**
8. Get max element of an array using Recursion. **O(N), O(N)**
9. Get first index of an element in an array using Recursion. **O(N), O(N)**
10. Get last index of an element in an array using Recursion. **O(N), O(N)**

## Maths: Modular Arithmetic & GCD
### My Notes
1. Properties of Modular Arithmetic
   1. (a + b) % m = [(a % m) + (b % m)] % m.
   2. (a * b) % m = [(a % m) * (b % m)] % m.
   3. (-a) % m = [( - (a % m)) + m] % m. To ensure non-negative result add m to avoid negative results.
   4. (a - b) % m = [(a % m) - (b % m) + m] % m. To ensure non-negative result add m to avoid negative results.
   5. (a ^ b) % m = [(a % m) ^ b] % m. (^ is exponentiation here, not bitwise XOR).
2. Properties of GCD
   1. GCD(a, b) = GCD(b, a)
   2. GCD(0, a) = a, a != 0
   3. GCD(a, b) = GCD(a - b, b) if a >= b > 0
   4. GCD(a, b) = GCD(a % b, b)
   5. GCD(0, 0) = Infinity
   6. GCD(a, b, c) = GCD(a, GCD(b, c)) = GCD(b, GCD(a, c)) = GCD(c, GCD(a, b))
### Questions
1. Fast Power with mod using recursion **O(log N), O(log N)**
2. Count pairs whose sum is a multiple of m **O(N), O(N)**
3. Function to find GCD **O(log N), O(log N)**
4. GCD of an array **O(N log N), O(log N)**
5. Implement Power Function. | Modular Arithmetic & Recursion. **O(log N), O(log N)**
6. Greatest Common Divisor. **O(log N), O(log N)**
7. Pair Sum divisible by B. Find and return the number of pairs in A whose sum is divisible by B. **O(N), O(N)**
8. Largest Coprime Divisor. **O(log N), O(log N)**
9. Divisor game. Find the number of special integers less than or equal to A. **O(N), O(N)**
10. Mod Sum. Find the sum of A [i] % A [j] for all possible i, j pairs. **O(N), O(N)**
11. A, B and Modulo. Find the greatest possible positive integer M, such that A % M = B % M. **O(N), O(N)**
12. Delete one. Delete one element such that the GCD of the remaining array is maximum. **O(N), O(N)**

## Hashing (Map & Set)
### HashMap operations:
1. set(key, value) - set the value for the key: Time Complexity: O(1) on average, O(n) in worst case
2. get(key) - get the value for the key: Time Complexity: O(1) on average, O(n) in worst case
3. delete(key) - delete the key-value pair: Time Complexity: O(1) on average, O(n) in worst case
4. has(key) - check if the key is present in the hashmap: Time Complexity: O(1) on average, O(n) in worst case
5. size - get the size of the hashmap: Time Complexity: O(1)
### HashSet operations:
1. add(value) - add the value to the set: Time Complexity: O(1) on average, O(n) in worst case
2. delete(value) - delete the value from the set: Time Complexity: O(1) on average, O(n) in worst case
3. has(value) - check if the value is present in the set: Time Complexity: O(1) on average, O(n) in worst case
4. size - get the size of the set: Time Complexity: O(1)
### Questions
1. Frequency of given elements | Map **O(N), O(N)**
2. Count of Distinct Elements | Set **O(N), O(N)**
3. Check if pair of Sum K exists / Check whether pair with given sum exists  | Set **O(N), O(N)**
4. Count no. of pairs with sum K | Map **O(N), O(N)**
5. Frequency of element query / Count frequence of elements in array | Map **O(N), O(N)**
6. Find common elements in 2 arrays | Map **O(N), O(N)**
7. Count unique elements in array | Set **O(N), O(N)**
8. Count no of Pairs with given Difference | Map **O(N), O(N)**

## Lab Session Hashing
### Questions
1. Longest Substring Without Repeating Characters | Set & Two Pointers. **O(N), O(N)**
2. First non repeating element | Map. **O(N), O(N)**
3. Check if subarray sum 0 exists | Set & Prefix Sum. **O(N), O(N)**
4. Count subarrays with sum 0 | Map & Prefix Sum. **O(N), O(N)**
5. Check subarray with sum k exists | Map. **O(N), O(N)**
6. Count subarrays with sum Equals K | Map & Prefix Sum. **O(N), O(N)**
7. Length of Longest Subarray with Sum K | Map & Prefix Sum. **O(N), O(N)**
8. Find First Repeating element | Map. **O(N), O(N)**
9. Find Distinct Numbers in Window | Map & Sliding Window Fixed. **O(N), O(N)**
10. Find First Subarray with given Sum | Map & Prefix Sum. **O(N), O(N)**
11. Length of the Longest Subarray with Zero Sum | Map & Prefix Sum. **O(N), O(N)**
12. Count Subarrays with Zero Sum | Map & Prefix Sum. **O(N), O(N)**

## Count Sort & Merge Sort
### My Notes
1. JavaScript basic sorting for BigInts.
```js
const arr = [1n, 2n, 10n, 5n];

// ascending
arr.sort((a, b) => {
  if (a < b) return -1;
  if (a > b) return  1;
  return  0;
});
console.log(arr);
// [1n, 2n, 5n, 10n]

// descending
arr.sort((a, b) => {
  if (a > b) return -1;
  if (a < b) return  1;
  return  0;
});
console.log(arr);
// [10n, 5n, 2n, 1n]
```
2. Mid calculation optimization : `mid = lo + Math.floor((hi - lo) / 2);`
### Questions
1. Count sort of positive numbers | Count Sort. **O(N), O(N)**
2. Count sort of negative numbers | Count Sort. **O(N), O(N)**
3. Merge two sorted arrays | Merge Sort. **O(N), O(N)**
4. Merge sort | Merge Sort. **O(N), O(N)**
5. Sort by color. Sort an array in such a way that same colored elements are adjacent / Dutch National Flag Problem | Count Sort. **O(N), O(N)**
6. Smallest number. Find the smallest number that can be formed by rearranging the digits of a given number in an array. | Count Sort. **O(N), O(N)**
7. Max chunks to make sorted. Count the maximum number of chunks that can be formed such that sorting each chunk results in a sorted array. | Greedy Approach (Max So Far) | Cumulative Sum Approach **O(N), O(N)**
8. Inversion count in an array. Count the total number of inversions in an array. if i < j and A[i] > A[j], then the pair (i, j) is called an inversion of A | Modified Merge Sort **O(N), O(N)**
9. Sort subarray with left and right index. | Merge Sort. **O(N), O(N)**
10. Max Chunks To Make Sorted II | Left Max and Right Min Arrays **O(N), O(N)** | Monotonic Stack **O(N), O(N)**
11. Dutch National Flag Problem | Count Sort. **O(N), O(N)**

## Quick Sort & Comparator
### Questions
1. Partition the array. All 0s on the left and all 1s on the right. | Partitioning Algorithm **O(N), O(1)**
2. Partition the integer array with pivot. All elements less than pivot on the left and all elements greater than pivot on the right. | Quick Sort. **O(N), O(N)**
3. Quick Sort. | Quick Sort. **O(N), O(N)**
4. Randomised QuickSort. | Quick Sort. **O(N), O(N)**
5. Sorting based on factors of the elements. | Custom Comparator **O(N log N), O(1)**
6. Largest Number. Sort the array to form the largest number. | Custom Comparator **O(N log N), O(1)**
7. Partition Index. Find the partition index of the array based on the last element as pivot. | Quick Sort. **O(N), O(N)**
8. Wave Array. Sort the array in a wave-like pattern | Sorting & Swapping alternate elements. **O(N log N), O(N)**
9. B Closest Points to Origin. Sort the points based on their distance from the origin | Custom Comparator **O(N log N), O(N)** | Max Heap **O(N log B), O(B)** | QuickSelect (Quick Sort based approach) **O(N), O(N)**
10. Tens Digit Sorting. Sort the array based on the tens digit of each element. | Custom Comparator **O(N log N), O(1)**
11. Sort 01. Arrange the array of 0s and 1s in sorted order. | Partitioning Algorithm **O(N), O(1)**

## Contest 1: Arrays, Bit Manipulation, Recursion, Math, Hashing & Sorting
### Questions
1. Count Intersection | Arrays | Interval Technique
2. Count Intersection | Arrays | Interval Technique
3. Benjamin and XOR | Bit Manipulation & Math
4. Decreasing dishes | Arrays | Kadane's Algorithm
5. Rain Water Trapped | Arrays One Dimensional | Prefix Sum | Two Pointers Technique
6. Highest Product | Greedy Algorithm | Arrays Miscellaneous
7. Search in a row wise and column wise sorted matrix | 2D Arrays
8. Rice | Bit Manipulation
9. Chef and Cooking | Arrays | Kadane's Algorithm
10. Sum of all Submatrices: Matrix
11. Mega Sale | Arrays Miscellaneous
12. Find All Pair | Hashing
13. More letters | Arrays | Prefix Sums
14. Smallest Value | Array | Arrays Miscellaneous | Sieving
15. MathLand and Sum | Matrix | Contribution Technique
16. First Missing Integer | Arrays Two Dimensional
17. Wave Array | Quick Sort & Comparator
18. Continuous Sum Query | Prefix Sum & Difference Array
19. Bit Differences | Bit Manipulation
20. Sum of All x Length Subarrays | Sliding Window | Prefix Sum

# Revision Advanced DSA 2

## Searching 1: Binary Search on Array
### Questions
1. Search element K. | Binary Search on Array **O(log N), O(1)**
2. Find first occurrence. | Binary Search on Array **O(log N), O(1)**
3. Identify 2024's First Email. | Binary Search on Array **O(log N), O(1)**
4. Local Minima in an Array. | Binary Search on Array **O(log N), O(1)**
5. Finding the square root of a number. | Binary Search on Array **O(log N), O(1)**
6. Search for a Range / Find First and Last Position of Element in Sorted Array. | Binary Search on Array **O(log N), O(1)**
7. Square Root of an Integer | Binary Search on Answer. **O(log N), O(1)**
8. Sorted Insert Position. | Binary Search on Array **O(log N), O(1)**
9. Find a peak element. | Binary Search on Array **O(log N), O(1)**
10. Matrix Search | Binary Search on Array **O(log N), O(1)**
11. Maximum height of staircase | Mathematical | Binary Search on Answer. **O(log N), O(1)**

## Searching 2: Binary Search on Answer
### Questions
1. Painter's Partition. Find minimum largest workload. | Binary Search on Answer **O(log N), O(1)**
2. Email Response Handlers. Find minimum largest workload. | Binary Search on Answer **O(log N), O(1)**
3. Aggresive Cows. Find largest minimum distance. | Binary Search on Answer **O(log N), O(1)**
4. Least Capacity to Ship Packages A Within B Days. Find minimum ship capacity. | Binary Search on Answer **O(log N), O(1)**
5. Allocate Books. Find minimum largest workload. | Binary Search on Answer **O(log N), O(1)**
6. Special Integer | Binary Search on Answer + Sliding Window Technique **O(log N), O(1)**
7. ADD OR NOT | Binary Search on Answer + Prefix Sum Technique + Sliding Window Technique **O(log N), O(1)**

## Lab Session on Searching
### Questions
1. Find the unique element in an array where every element appears twice except for one. | Binary Search on Array | Bit Manipulation **O(log N), O(1)**
2. Search for a target element in a rotated sorted array. | Binary Search on Array **O(log N), O(1)**
3. Find the median of two sorted arrays. | Binary Search on Array **O(log N), O(1)**
4. Rotated Sorted Array Search | Binary Search on Array **O(log N), O(1)**
5. Single Element in Sorted Array | Binary Search on Array **O(log N), O(1)**
6. Median of Two Sorted Arrays | Binary Search on Array **O(log N), O(1)**
7. Matrix Median | Binary Search on Answer **O(log N), O(1)**
8. Minimum Difference | Binary Search on Array **O(log N), O(1)**
9. Ath Magical Number | Binary Search on Answer **O(log N), O(1)**
10. Find Smallest Again | Binary Search on Answer **O(log N), O(1)**

## Classes, Objects & Linked List Introduction
### Questions
1. Given the head of a linked list, return the kth element. | Linked List **O(N), O(1)**
2. Print Linked List | Linked List **O(N), O(1)**
3. kth Node in a List | Linked List **O(N), O(1)**

## Linked List: Basic Problems
### Linked List Operations
1. append: Add a new node at the end of the list. Time complexity: O(1) if you have a tail pointer; O(n) if you must traverse from the head. **O(1), O(1)**
2. insertAtPosition: Insert a new node at a specific position. Time complexity O(n). **O(N), O(1)**
3. getNodeAtPosition: Retrieve the node at a specific position. Time complexity O(n). **O(N), O(1)**
4. deleteNode: Remove the first occurrence of a element from the list. Time complexity O(n). **O(N), O(1)**
5. isValuePresent: Check if a value K exists in the list. Time complexity O(n). **O(N), O(1)**
6. getSize: Calculate the size of the linked list. Time complexity: O(1) if a size property is maintained; O(n) if you must count nodes manually. **O(N), O(1)**
### Questions
1. Simple linked list implementation. **O(N), O(1)**
2. Check if value K is present in the linked list or not. **O(N), O(1)**
3. Insert a new node with data V at position P in the linked list. / Insert in Linked List. **O(N), O(1)**
4. Size of the linked list. **O(N), O(1)**
5. Deletion in the linked list. / Delete in Linked List. **O(N), O(1)**
6. Reverse the linked list given the head of the linked list. **O(N), O(1)**
7. Deep copy of a doubly linked list. **O(N), O(1)**
8. Copy List with Random Pointer. **O(N), O(1)**
9. Remove Duplicates from Sorted List. **O(N), O(1)**
10. Remove Nth Node from List End. **O(N), O(1)**
11. Reverse Link List II. **O(N), O(1)**
12. K Reverse Linked List. **O(N), O(1)**

## Stacks
### Stack Operations
1. Push: Add an element to the top of the stack. Time complexity O(1). **O(1), O(1)**
2. Pop: Remove the element from the top of the stack. It is common to return the popped element. Time complexity O(1). **O(1), O(1)**
3. Peek/Top: Retrieve the element at the top of the stack without removing it. Accessing the top element directly via a pointer or index. Time complexity O(1). **O(1), O(1)**
4. Size: Get the number of elements currently in the stack. Usually maintained by a simple counter variable. Time complexity O(1). **O(1), O(1)**
5. IsEmpty: Check if the stack is empty (i.e., no elements are inside). A simple check if the size is zero or the top pointer is null. Time complexity O(1). **O(1), O(1)**
### Questions
1. Implementation of Stack using static array. **O(N), O(1)**
2. Implementation of Stack using dynamic array. **O(N), O(1)**
3. Balanced Parenthesis. **O(N), O(1)**
4. Evaluate Postfix Expression. **O(N), O(1)**
5. Nearest Smaller Element Index on Left. **O(N), O(1)**
6. Nearest Greater Element Index on Left. **O(N), O(1)**
7. Nearest Smaller Element Index on Right. **O(N), O(1)**
8. Nearest Greater Element Index on Right. **O(N), O(1)**
9. Restaurant Hunt | Variation of Nearest Greater Element. **O(N), O(1)**
10. Passing Game. **O(N), O(1)**
11. Min Stack. **O(N), O(1)**
12. Redundant Braces. **O(N), O(1)**
13. Infix to Postfix. **O(N), O(1)**

## Lab Session on Stacks
### Questions
1. Implementation of Stack using Linked List. **O(N), O(1)**
2. Remove equal pair of consecutive elements till possible. **O(N), O(1)**
3. Largest Rectangle in Histogram. **O(N), O(1)**
4. Sum of (Max-Min) of all subarrays. **O(N), O(1)**
5. Double Character Trouble. Removes consecutive pairs of characters from a string using a stack. **O(N), O(1)**
6. MAX and MIN. Computes the sum of (Max-Min) for all subarrays using stacks to find next smaller and greater indices. | Stack + Contribution Technique. **O(N), O(1)**
7. Max Rectangle in Binary Matrix. Finds the largest rectangle of 1s in a binary matrix using histogram techniques. **O(N), O(1)**
8. Check two bracket expressions. Normalizes expressions with brackets and checks if they are equivalent using a map. **O(N), O(1)**
9. Sort stack using another stack. Sorts a stack using an auxiliary stack, maintaining order with O(n^2) complexity in the worst case. **O(N), O(1)**

## Queues: Implementation & Problems
### Queue Operations (Using Singly Linked List)
1. Enqueue: Add an element to the rear of the queue. Time complexity is O(1). **O(1), O(1)**
2. Dequeue: Remove an element from the front of the queue. Time complexity is O(1). **O(1), O(1)**
3. Peek/Front: Get the front element without removing it. Time complexity is O(1). **O(1), O(1)**
4. IsEmpty: Check if the queue is empty. Time complexity is O(1). **O(1), O(1)**
5. Size: Get the number of elements in the queue. Time complexity is O(1). **O(1), O(1)**
### Queue Implementations
1. Implementation of queue | JavaScript Dynamic Array. **O(N), O(1)**
2. Implementation of queue | Singly Linked List using tail pointer. **O(N), O(1)**
3. Implementation of queue | Stack (push efficient approach). **O(N), O(1)**
4. Implementation of queue | Stack (pop efficient approach). **O(N), O(1)**
5. Doubly Ended Queue | Doubly Linked List. **O(N), O(1)**
### Questions
1. Sliding Window Maximum | Sliding Window Technique & Double Ended Queue (Deque). **O(N), O(1)**
2. Real-Time Stock Trading Alerts | Sliding Window Maximum. **O(N), O(1)**
3. Parking Ice Cream Truck. **O(N), O(1)**
4. N integers containing only 1, 2 & 3. **O(N), O(1)**
5. Unique Letter. **O(N), O(1)**
6. Sum of min and max of all sub-arrays of given size. **O(N), O(1)**

## Trees 1: Structure & Traversal
### Questions
1. Pre-order traversal **O(N), O(1)**
2. In-order traversal **O(N), O(1)**
3. Post-order traversal **O(N), O(1)**
4. Iterative in-order traversal | Stack **O(N), O(1)**
5. Iterative level-order traversal | Queue **O(N), O(1)**
6. Left view and right view of a binary tree **O(N), O(1)**
7. Level Order | Deque **O(N), O(1)**
8. Right View of Binary Tree | Deque **O(N), O(1)**
9. Sum Binary Tree or Not **O(N), O(1)**
10. Serialize Binary Tree | Deque **O(N), O(1)**
11. Deserialize Binary Tree | Deque **O(N), O(1)**

## Trees 2: BST
### Questions
1. Searching in Binary Search Tree **O(N), O(1)**
2. Insertion in Binary Search Tree **O(N), O(1)**
3. Find Smallest in Binary Search Tree **O(N), O(1)**
4. Find Largest in Binary Search Tree **O(N), O(1)**
5. Deletion in Binary Search Tree **O(N), O(1)**
6. Construct a Balanced Binary Search Tree from Sorted Array **O(N), O(1)**
7. Check if a Tree is a Binary Search Tree **O(N), O(1)**
8. Valid Binary Search Tree **O(N), O(1)**
9. Sorted Array To Balanced BST **O(N), O(1)**
10. Two Sum BST **O(N), O(1)**
11. Check for BST with One Child **O(N), O(1)**
12. BST nodes in a range **O(N), O(1)**

## Lab Session on Binary Trees
### Questions
1. Equal Tree Partition: Check if a binary tree can be partitioned into two subtrees with equal sums. **O(N), O(1)**
2. Path Sum: Determine if a binary tree has a root-to-leaf path with a given sum. **O(N), O(1)**
3. Check Height Balanced Tree: Verify if a binary tree is height-balanced. **O(N), O(1)**
4. Construct Binary Tree from Inorder and Postorder Traversal: Build a binary tree from given inorder and postorder traversals. **O(N), O(1)**
5. Balanced Binary Tree **O(N), O(1)**

## Contest 2: Sorting, Searching, Linked List, Stacks, Queues & Trees
### Questions
1. Warmer Temperature | Stack
2. Least Capacity to Ship | Binary Search
3. Balanced Binary Tree | Binary Tree
4. Perfect Line | Heap
5. Level Order | Binary Tree
6. Lower Temperature | Stack
7. Serialize Binary Tree | Binary Tree
8. Checking Assignments | Binary Search + Queue
9. Sort List | Linked List
10. Next Greater | Stack
11. Alice the Shooter | Stack
12. Wrestling | Binary Search
13. Maximum Unsorted Subarray | Comparison with Sorted Array | Linear Scan (Two Pointers / Max-Min)
14. Dance Class | Greedy Approach with Sorting and Two Pointers
15. Banana Eating Competition | Binary Search on Answer
16. Kill the Enemy | Greedy Approach with Linear Scan (Optimized) | Greedy Approach with Sorting
17. Maximum Unsorted Subarray | Two-Pointer with Min-Max Range Expansion | Sorting Comparison
18. Dance Class | Greedy Approach with Sorting and Two Pointers

# Revision Advanced DSA 3

## Maths: Combinatorics Basics & Prime Numbers
### My Notes
1. Additon Rule: Used when you can choose one of several options (OR).
2. Multiplication Rule: Used when you can choose multiple options in sequence (AND).
3. Permutation: Arrangement of objects where order matters.
4. Combination: Selection of objects where order does not matter.
5. nPr Formulae: n! / (n - r)! for permutations.
6. nCr = nPr / r!, So nCr = n! / (r! * (n - r)!) for combinations.
7. Properties of Combination:
   1. nC0 = 1
   2. nCn = 1
   3. nC1 = n
   4. nCr = nC(n - r)
   5. nCr = n-1Cr + n-1C(r - 1)
### Questions
1. Most Varied Meal Combo. Find restaurant with maximum unique meal combinations. | Multiplication Rule (AND) **O(N), O(1)**
2. Primes from 1 to N | Sieve of Eratosthenes **O(N), O(1)**
3. Check Prime Numbers. Check if a number is prime using factor counting. **O(N), O(1)**
4. Compute nCr % m | Prime Factorization + Sieve of Eratosthenes **O(N), O(1)** | Space Optimized Dynamic Programming OR Pascal's Identity DP OR Pascal's Triangle Method **O(N), O(1)**
5. Find All Primes | Sieve of Eratosthenes **O(N), O(1)**
6. Prime Sum | Sieve of Eratosthenes **O(N), O(1)** | Trial Division **O(N), O(1)**
7. Number of Digit One | Iterative Mathematical Approach **O(N), O(1)** | Recursive Digit DP **O(N), O(1)**
8. Consecutive Numbers Sum | Mathematical Iteration on Sequence Length **O(N), O(1)** | Counting Odd Divisors (Number Theory) **O(N), O(1)** | Sieve of Eratosthenes + Prime Factorization **O(N), O(1)**

## Lab Session on Prime Numbers & 2 Pointers
### Questions
1. Print Pascal Triangle (nCr % M) | 2D Arrays | nCr formula
   1. Using 2D Arrays T(n^2), S(n^2)
   2. Using nCr formula T(n^2), S(1)
2. Count of Divisors | Divisor Sieve
3. Check pair with given sum exists in a sorted array having distinct elements | Brute Force | Binary Search | Hash Set | Two Pointers
    1. Using Brute Force T(n^2), S(1)
    2. Using Binary Search T(n log n), S(1)
    3. Using Hash Set T(n), S(n)
    4. Using Two Pointers T(n), S(1)
4. Count Pairs with Sum K if array is sorted and has distinct elements | Two Pointers **O(N), O(1)**
5. Count Pairs with Sum K if array is sorted and has duplicates | Two Pointers **O(N), O(1)**
6. Check if there exists a pair with difference K in a sorted array | Two Pointers **O(N), O(1)**
7. Count Pairs with Difference K in a sorted array if array has distinct elements | Two Pointers **O(N), O(1)**
8. Count Pairs with Difference K in a sorted array if array has duplicates | Two Pointers **O(N), O(1)**
9.  Pascal Triangle | nCr % M **O(N), O(1)**
10. Pairs with given sum II | Two Pointers **O(N), O(1)**
11. Pairs with Given Difference | Two Pointers **O(N), O(1)**
12. 3 Sum | Two Pointers **O(N), O(1)**
13. Lucky Numbers | Sieve **O(N), O(1)**
14. Another Count Rectangles | Two Pointers **O(N), O(1)**
15. Closest pair from sorted arrays | Two Pointers **O(N), O(1)**

## Lab Session on Maths & 2 Pointers
### Questions
1. Finding N-th column title | Modulus & Division **O(N), O(1)**
2. Sorted Permutation Rank | Permutation & Factorial **O(N), O(1)**
3. Check subarray with sum k | Two Pointers **O(N), O(1)**
4. Container with most Water | Two Pointer **O(N), O(1)**
5. Excel Column Title | Modulus & Division **O(N), O(1)**
6. Container With Most Water | Two Pointer **O(N), O(1)**
7. Sorted Permutation Rank | Permutation & Factorial **O(N), O(1)**
8. Subarray with given sum | Two Pointers **O(N), O(1)**
9. Excel Column Number | Modulus & Division **O(N), O(1)**
10. Array 3 Pointers | Three Pointers **O(N), O(1)**
11. Max Continuous Series of 1s | Two Pointers **O(N), O(1)**

## Backtracking
### My Notes
1. Subsets, Subsequences, Subarrays
### Questions
1. Print Valid Parenthesis | Backtracking **O(N), O(1)**
   1. Recursive Proactive Approach
   2. Recursive Reactive Approach
   3. Iterative Approach using Stack
   4. Dynamic Programming
2. Subsets | Backtracking **O(N), O(1)**
3. Fitness Meets Variety / Print all possible permutations | Backtracking + Visited Array (DFS) | Backtracking + Swapping **O(N), O(1)**
4. Permutations | Backtracking **O(N), O(1)**
5. Generate all Parentheses II | Backtracking **O(N), O(1)**
6. Generate Subsets | Backtracking **O(N), O(1)**
7. Letter Phone | Backtracking **O(N), O(1)**
8. Kth Symbol | Backtracking + Bit Manipulation **O(N), O(1)**

## Lab Session on Backtracking
### Questions
1. Print paths in Staircase | Backtracking **O(N), O(1)**
   1. Using Top-Down Approach
   2. Using Bottom-Up Approach
2. Print all paths from source to destination | Backtracking **O(N), O(1)**
3. Shortest path in a Binary Maze with Hurdles | Backtracking | BFS **O(N), O(1)**
4. Print paths in Staircase | Backtracking **O(N), O(1)**
5. Shortest path in a Binary Maze with Hurdles | Backtracking **O(N), O(1)**
6. Print All Maze Paths | Backtracking **O(N), O(1)**
7. Subset Sum equal to K | Backtracking **O(N), O(1)**

## Linked List, Sorting and Problems
### My Notes
1. Mid = (Size + 1) / 2
### Questions
1. Doubly Linked List **O(N), O(1)**
2. Find the middle element of a linked list | Slow and Fast Pointer Technique **O(N), O(1)**
3. Merge Two Sorted Lists **O(N), O(1)**
4. Sort a Linked List | Merge Sort **O(N), O(1)**
5. Check Palindrome Linked List | Singly Linked List **O(N), O(1)**
6. Real Life Application - Spotify's Music Manager | Doubly Linked List **O(N), O(1)**
7. Swap List Nodes in pairs **O(N), O(1)**
8. Add Two Numbers as Lists **O(N), O(1)**
9. Longest Palindromic List **O(N), O(1)**

## Linked List, Doubly Linked List and Detecting Loop
### My Notes
1. Memory Hierarchy
### Questions
1. Insert node just before tail in a dll | Doubly Linked List **O(N), O(1)**
2. Delete a node from a dll | Doubly Linked List **O(N), O(1)**
3. Implement an LRU Cache | Doubly Linked List & Hash Map **O(N), O(1)**
   1. Class Based Implementation
   2. Functional Implementation
4. Google Maps got your back | Detect Cycle in a Linked List **O(N), O(1)**
5. Detect Cycle in a Linked List | Floyd’s Cycle Detection Algorithm **O(N), O(1)**
6. Find the starting point of the cycle | Floyd’s Cycle Detection Algorithm **O(N), O(1)**
7. Remove the cycle | Floyd’s Cycle Detection Algorithm **O(N), O(1)**
8. Intersection of Linked Lists | Singly Linked Lists **O(N), O(1)**
9. LRU Cache | Doubly Linked List & Hash Map **O(N), O(1)**
10. Remove Loop from Linked List | Floyd’s Cycle Detection Algorithm **O(N), O(1)**
11. Reorder List | Singly Linked List **O(N), O(1)**
12. Partition List | Singly Linked List **O(N), O(1)**
13. Flatten a linked list | Doubly Linked List **O(N), O(1)**

## Trees 3: Morris Inorder Traversal & LCA
### My Notes
1. Property of Binary Search Tree (BST): The inorder traversal of a BST gives the elements in sorted order.
### Questions
1. Finding the kth Smallest Element in a Binary Search Tree **O(N), O(1)**
2. Morris Inorder Traversal | Iterative Inorder Traversal without Stack **O(N), O(1)**
3. Node to Root Path in a Binary Tree **O(N), O(1)**
4. Lowest Common Ancestor (LCA) in a Binary Search Tree(BST) **O(N), O(1)**
5. We are all connected / Lowest Common Ancestor in a Binary Tree / Earliest Common Ancestor **O(N), O(1)**
6. Recover Binary Search Tree (BST) by Swapping Two Nodes | Morris Traversal **O(N), O(1)**
7. Least Common Ancestor **O(N), O(1)**
8. Path Sum **O(N), O(1)**
9. Kth Smallest Element In BST **O(N), O(1)**
10. LCA in BST **O(N), O(1)**
11. Morris Inorder Traversal **O(N), O(1)**
12. Common Nodes in Two BST **O(N), O(1)**
13. Distance between Nodes of BST **O(N), O(1)**

## Lab Session on Binary Trees 2
### Questions
1. Height of Binary Tree in terms of Edges | Recursion **O(N), O(1)**
2. Height of Binary Tree in terms of Nodes | Recursion **O(N), O(1)**
3. Diameter of Binary Tree / Height of Binary Tree in terms of Edges | Height of Binary Tree **O(N), O(1)**
4. Level Order Traversal of Binary Tree | Deque **O(N), O(1)**
5. Q5. Next Pointer Binary Tree | Level Order Traversal + Deque | Iterative Level-Order Threading **O(N), O(1)**
6. Vertical Order Traversal of Binary Tree | HashMap & Level Order Traversal **O(N), O(1)**
7. Top View of Binary Tree | Vertical Order Traversal **O(N), O(1)**
8. Bottom View of Binary Tree | Vertical Order Traversal **O(N), O(1)**
9. Invert the Binary Tree | Level Order Traversal **O(N), O(1)**
10. Identical Binary Trees | Recursion **O(N), O(1)**

## Hashing 3: Internal Implementation & Problems
### Questions
1. Check if given element exists in Q queries | DAT (Direct Address Table) **O(N), O(N)**
2. Implement hash map | Arrays of Linked lists **O(N), O(N)**
3. Longest Consecutive Sequence | Set **O(N), O(N)**
4. Longest Subarray Zero Sum | Map + Prefix Sum **O(N), O(N)**
5. Colorful Number | Set **O(N), O(N)**
6. Count Subarrays | Map + Sliding Window **O(N), O(N)**
7. Sort Array in given Order | Map **O(N), O(N)**

## Contest 3: Math, Two Pointers, Backtracking, Linked List & Trees
### Questions
1. Children and Rides
2. Permutations
3. Flatten Binary Tree to Linked List
4. Special Prime Numbers
5. Closest pair from sorted arrays | Two Pointers
6. Diameter of binary tree | Binary Tree
7. Minimum Distance | Two Pointers
8. Equal Ribbon Lengths | Math
9. Equal Tree Partition | Binary Tree | Postorder Traversal + Subtree Sums
10. Tree Inversion | Binary Tree |  DFS (Recursion)
11. Maximum Chocolates | Sliding Window (≤ C non-majority in window)
12. Count Primes Excluding Specific Digit | Sieve of Eratosthenes + Digit Check
13. Remove Nth Node from List End | Linked List
14. Number Line Confusion | Two Pointers
15. Longest Possible Route in a Matrix with Hurdles | Backtracking
16. Print paths in Staircase | Backtracking
17. Largest Rectangle in Histogram | Monotonic Stack
18. Coding Mentor | Monotonic Stack
19. Increasing Order words | Stable Sorting | Bucket Sort
20. Remove Nth Node from List End | Two-Pointer Technique | Iterative Length Calculation
21. Largest Number | Custom Sorting
22. Compiler Error (Minimum Bracket Reversals) | Stack

# Revision Advanced DSA 4

## Heaps Introduction
### Questions
1. Heap Data Structure **O(N), O(N)**
2. Array representation of Tree **O(N), O(N)**
3. Insertion in min heap **O(N), O(N)**
4. Extraction in min heap **O(N), O(N)**
5. Min-Heap Class Implementation **O(N), O(N)**
6. Max-Heap Class Implementation **O(N), O(N)**
7. Build a Priority Queue | Min-Heap **O(N), O(N)**
8. Connecting the ropes | Priority Queue **O(N), O(N)**
9. Connect ropes | Priority Queue **O(N), O(N)**
10. Build a Heap from Array **O(N), O(N)**
11. Heap Queries | Min-Heap **O(N), O(N)**
12. Minimum largest element | Min-Heap + Greedy | Binary Search on Answer **O(N), O(N)**
13. Misha and Candies | Min-Heap **O(N), O(N)**
14. Maximum array sum after B negations | Greedy Algorithm | Count Bucket Sort (Optimized) **O(N), O(N)**

## Heap Sort & Greedy
### Questions
1. Build a min-heap from an array | Down-Heapify-Min **O(N), O(N)**
2. Build a max-heap from an array | Down-Heapify-Max **O(N), O(N)**
3. Sort an Array | Heap Sort **O(N), O(N)**
4. Median of a Stream | Max-Heap & Min-Heap **O(N), O(N)**
5. Activity Selection Problem / Finish Maximum Jobs | Greedy Algorithm **O(N), O(N)**
6. Running Median | Max Heap & Min Heap **O(N), O(N)**
7. Finish Maximum Jobs | Greedy Algorithm **O(N), O(N)**
8. Seats | Greedy Algorithm **O(N), O(N)**
9. Assign Mice to Holes | Greedy Algorithm **O(N), O(N)**
10. Ways to form Max Heap | Dynamic Programming **O(N), O(N)**
11. Another Coin Problem | Greedy Algorithm **O(N), O(N)**

## Lab Session on Heaps & Greedy
### Questions
1. Distribute Candy | Greedy Algorithm **O(N), O(N)**
2. Merge K Sorted Lists | Min Heap **O(N), O(N)**
3. Job Scheduling | Min Heap **O(N), O(N)**
4. Flipkart's Challenge in Effective Inventory Management / Job Sequencing with Deadlines (Expiry) and Profits | Min Heap **O(N), O(N)**
5. Distribute Candy | Greedy Algorithm **O(N), O(N)**
6. Merge K Sorted Lists | Min Heap **O(N), O(N)**
7. Ath largest element | Min Heap **O(N), O(N)**
8. Flipkart's Challenge in Effective Inventory Management | Min Heap **O(N), O(N)**
9. Product of 3 | Min Heap **O(N), O(N)**
10. Kth Smallest Element in a Sorted Matrix | Binary Search + Counting **O(N), O(N)**

## Lab Session on Interview Problems 1
### Questions
1. Minimum Meeting Rooms (Max Overlap of Meetings) | Two Pointers + Sorting **O(N), O(N)**
2. Sort a K-Sorted (Nearly Sorted) Array | Min-Heap (Priority Queue) **O(N), O(N)**
3. Minimum Distance Between Equal Elements | Hash Map (Last-Seen Index) **O(N), O(N)**
4. Minimum Window Substring | Sliding Window + Frequency Maps **O(N), O(N)**
5. Shaggy and distances | Hash Map (last-seen index) + Single Pass **O(N), O(N)**
6. K Places Apart | Min-Heap of size (B+1) **O(N), O(N)**
7. Meeting Rooms II | Two-Pointer Sweep over Sorted Start/End Times **O(N), O(N)**
8. Minimum Window Substring | Sliding Window + Frequency Counts **O(N), O(N)**

## DP 1: One Dimensional
### Questions
1. Fibonacci Numbers | Dynamic Programming (Top-Down & Bottom-Up) **O(N), O(N)**
2. Count Ways to Climb Stairs | Dynamic Programming (Paths) **O(N), O(N)**
3. Minimum Perfect Squares to Sum to n | DP (Unbounded) **O(N), O(N)**
4. Stairs | Dynamic Programming (Tabulation, Space-Optim **O(N), O(N)**
5. Minimum Number of Squares | Dynamic Programming (Tabulation, Unbounded) **O(N), O(N)**
6. Fibonacci Number | Dynamic Programming (Tabulation, Space-Optimized)ized) **O(N), O(N)**
7. Max Product Subarray | Dynamic Programming (Kadane-Style with Min/Max Tracking) **O(N), O(N)**
8. Maximum Sum Value | Dynamic Programming (1D Prefix DP) **O(N), O(N)**

## DP 2: Two Dimensional
### Questions
1. Q1. House Robber | 1D DP (Tabulation) | 1D DP (Space Optimized) **O(N), O(N)**
2. Q2. Unique Paths in a Grid | Memoization | 2D DP (Tabulation) **O(N), O(N)**
3. Q3. Count A-Digit Numbers with Digit Sum B | Recursion with Memoization (Top-Down 2D DP) | Iterative 1D DP with Space Optimization (Bottom-Up) **O(N), O(N)**
4. Q4. Catalan Numbers | 1D DP / Combinatorics **O(N), O(N)**
5. Q5. Count of Unique BSTs | 1D DP (Catalan Numbers) **O(N), O(N)**
6. Unique Binary Search Trees II | Dynamic Programming (Catalan Numbers) **O(N), O(N)**
7. Max Sum Without Adjacent Elements | Dynamic Programming (House Robber on Column Max) **O(N), O(N)**
8. N digit numbers | Dynamic Programming with Prefix Sums (Digit DP) **O(N), O(N)**
9. Max Rectangle in Binary Matrix | Monotonic Stack on Histogram (Row-wise DP) **O(N), O(N)**
10. Min Sum Path in Matrix | Dynamic Programming (1D Space Optimization) **O(N), O(N)**
11. Min Sum Path in Triangle | Dynamic Programming (Bottom-Up, O(n) Space) **O(N), O(N)**
12. Intersecting Chords in a Circle | Dynamic Programming (Catalan Numbers mod 1e9+7) **O(N), O(N)**

## DP 3: Knapsack
### Questions
1. Target Sum / Subset Sum Problem | Recursion (Brute Force) | 2D DP (Tabulation) | 1D DP (Space Optimization) **O(N), O(N)**
2. Customized Shopping Recommendations | 0-1 Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) **O(N), O(N)**
3. Fractional Knapsack | Greedy Algorithm **O(N), O(N)**
4. Flipkart's Upcoming Special Promotional Event | 0-1 Knapsack **O(N), O(N)**
5. 0-1 Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) | No Greedy Solution **O(N), O(N)**
6. Unbounded Knapsack / 0-N Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) **O(N), O(N)**
7. 0-1 Knapsack | Recursion (Brute Force) | 2D DP (Memoization) | 2D DP (Tabulation) | 1D DP (Space Optimization) **O(N), O(N)**
8. Fractional Knapsack | Greedy Algorithm **O(N), O(N)**
9.  Tushar's Birthday Party | Unbounded Knapsack **O(N), O(N)**
10. Ways to send the signal | 1D DP (Space Optimized) **O(N), O(N)**
11. Buying Candies | Unbounded Knapsack **O(N), O(N)**

## Lab Session on Applications of Knapsack
### Questions
1. Cut the Rod for maximum profit | Dynamic Programming (Tabulation) **O(N), O(N)**
2. Count the number of ways using coins (Ordered Selection) | Dynamic Programming (Tabulation) **O(N), O(N)**
3. Count the number of ways using coins (Un-ordered Selection) | Dynamic Programming (Tabulation) **O(N), O(N)**
4. Extended 0-1 Knapsack Problem | Dynamic Programming **O(N), O(N)**
5. Coin Sum Infinite | Dynamic Programming **O(N), O(N)**
6. Cutting a Rod | Dynamic Programming (Unbounded Knapsack) **O(N), O(N)**
7. 0-1 Knapsack Problem | Dynamic Programming **O(N), O(N)**
8. Distinct Subsequences | Dynamic Programming **O(N), O(N)**
9. Let's Party | Dynamic Programming **O(N), O(N)**
10. Length of Longest Fibonacci Subsequence | Dynamic Programming & Hashing **O(N), O(N)**

## Graphs 1: Introduction, DFS & Cycle Detection
### Questions
1. Storing a Graph | Adjacency Matrix **O(N), O(N)**
2. Storing a Graph | Adjacency List **O(N), O(N)**
3. Traversal in UD Graph | Depth First Search (Undirected Graph) **O(N), O(N)**
4. Detect Cycle in a directed graph **O(N), O(N)**
5. Cycle in Directed Graph | BFS | DFS Kahn's Algorithm **O(N), O(N)**
6. Path in Directed Graph | BFS | DFS **O(N), O(N)**
7. First Depth First Search | Ancestor Path Traversal **O(N), O(N)**
8. Maximum Depth | Pre-computation with BFS and Binary Search **O(N), O(N)**

## Graphs 2: BFS & MST
### Questions
1. Breadth First Search (BFS) Traversal **O(N), O(N)**
2. Multisource BFS **O(N), O(N)**
3. Rotten Oranges / Minimum Time Required to Rot All Oranges | Multisource BFS **O(N), O(N)**
4. Cost of Construction of Bridges / Flipkart's Logistics Challenge | Minimum Spanning Tree (MST) | Kruskal's Algorithm **O(N), O(N)**
5. Commutable Islands | Kruskal's Algorithm | Prims's Algorithm **O(N), O(N)**
6. Rotten Oranges | Multisource BFS **O(N), O(N)**
7. Construction Cost | Prim's Algorithm | Kruskal's Algorithm **O(N), O(N)**
8. Capture Regions on Board | Reverse Thinking & Depth-First Search (DFS) **O(N), O(N)**
9. Black Shapes | Depth-First Search (DFS) **O(N), O(N)**
10. Knight On Chess Board | Breadth-First Search (BFS) **O(N), O(N)**
11. Damaged Roads | Greedy with Sorting **O(N), O(N)**
12. Edge in MST | Modified Kruskal's Algorithm (Grouping by Weight) **O(N), O(N)**

## Graphs 3: Dijkstra Algo & Topological Sort
### Questions
1. Another BFS **O(N), O(N)**
2. Algorithm **O(N), O(N)**
3. Topological Sort / Possible to finish all courses **O(N), O(N)**
4. Possibility of Finishing | BFS (Khan's Algorithm) | DFS (Cycle Detection) **O(N), O(N)**
5. Dijkstra's Algorithm | Min-Heap **O(N), O(N)**
6. Another BFS | Graph Transformation + BFS **O(N), O(N)**
7. Topological Sort | Kahn's Algorithm with Min-Heap **O(N), O(N)**
8. Ways to Decode | Dynamic Programming | Dynamic Programming with Space Optimization **O(N), O(N)**
9. Largest Distance between nodes of a Tree | Two BFS Traversals | Single DFS Traversal **O(N), O(N)**
10. Flip Array | Dynamic Programming (Space Optimized) | Dynamic Programming (2D Array) **O(N), O(N)**
11. Perfect Numbers | Breadth-First Search (Queue-based Generation) **O(N), O(N)**

## Lab Session on Interview Problems 2
### Questions
1. Number of Islands | DFS | BFS **O(N), O(N)**
2. Shortest Distance in a Maze | BFS (Dijkstra's on unweighted graph) **O(N), O(N)**
3. Minimum Jumps to Reach End | Dynamic Programming | Greedy (Optimized) **O(N), O(N)**
4. Maximum Profit from Stock Prices | Peak Valley Approach | Single One Pass **O(N), O(N)**
5. Stock Buy Sell-I (One Transaction) **O(N), O(N)**
6. Stock Buy Sell-II (Multiple Transactions) **O(N), O(N)**
7. Stock Buy Sell-III (At Most Two Transactions) **O(N), O(N)**
8. Stock Buy Sell-IV (At Most K Transactions) **O(N), O(N)**
9. Best Time to Buy and Sell Stock | Greedy Approach (Peak Valley) | Dynamic Programming **O(N), O(N)**
10. Shortest Distance in a Maze | Dijkstra's Algorithm **O(N), O(N)**
11. Number of Islands | DFS | BFS **O(N), O(N)**
12. Jump Game 2 | Dynamic Programming | Greedy Approach **O(N), O(N)**
13. Valid Path | BFS with On-the-Fly Check | BFS with Pre-computed Obstacle Grid **O(N), O(N)**

## Contest 4: Heaps, Greedy, DP & Graphs
### Questions
1. Maximize Sweetness | Dynamic Programming (2D Array) | Dynamic Programming (1D Array - Space Optimized)
2. Minimum Number of Squares | Dynamic Programming (Bottom-Up) | Breadth-First Search (BFS)
3. Strengthen It | Greedy Approach with Disjoint Set Union (DSU)
4. Magical Bridge | Breadth-First Search (BFS)
5. Rat Vaccine | Disjoint Set Union (DSU) | Graph Traversal (DFS)
6. Racing cars | Greedy Simulation
7. Make Equal | Greedy Approach (Histogram Leveling)
8. Fractional Knapsack | Greedy Approach based on Value-to-Weight Ratio
9. Minimum Largest Element | Min-Heap Greedy Approach | Binary Search on Answer
10. Reverse Level Order | Queue and Stack (BFS Approach) | Level-by-Level Grouping (Iterative BFS)
11. Minimize Total | Max-Heap (Priority Queue) | Counting Sort / Frequency Array (Optimization) | BigInt Max-Heap | Binary Search + Math (For Massive B and A[i])

