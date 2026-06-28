[<- README](../README.md)

# Comprehensive Python Course

Welcome to the Python Core Concepts guide! This document covers fundamental to advanced concepts in Python, providing detailed explanations and practical examples to help you master the language. Everything from basics to modern features is covered here.

---

## Table of Contents
1. [Variables and Basic Data Types](#1-variables-and-basic-data-types)
2. [Data Structures](#2-data-structures)
3. [Control Flow](#3-control-flow)
4. [Functions and Scope](#4-functions-and-scope)
5. [Object-Oriented Programming (OOP) - In Detail](#5-object-oriented-programming-oop---in-detail)
6. [Modules and Packages](#6-modules-and-packages)
7. [Exception Handling](#7-exception-handling)
8. [File Handling and Context Managers](#8-file-handling-and-context-managers)
9. [Memory Management and Garbage Collection](#9-memory-management-and-garbage-collection)
10. [Concurrency and Parallelism (Threading, Multiprocessing, AsyncIO)](#10-concurrency-and-parallelism)
11. [Advanced Concepts](#11-advanced-concepts)
12. [Modern Python & Ecosystem](#12-modern-python--ecosystem)

---

## 1. Variables and Basic Data Types

Variables are containers for storing data values. In Python, you do not need to declare a variable's type explicitly; the type is inferred dynamically.

### Basic Data Types
- **Integers (`int`)**, **Floating-point numbers (`float`)**, **Strings (`str`)**, **Booleans (`bool`)**, **NoneType (`None`)**

**Example:**
```python
age = 25
temperature = 98.6
name = "Alice"
is_student = True
address = None

# Built-in methods for type checking and conversion
print(type(age))         # <class 'int'>
print(isinstance(age, int)) # True

# f-Strings (formatted string literals)
greeting = f"Hello. My name is {name} and I am {age} years old."
```

---

## 2. Data Structures

### 2.1 Lists (Mutable, Ordered)
```python
fruits = ["apple", "banana", "cherry"]
fruits.append("orange")
fruits.insert(1, "mango")
popped_fruit = fruits.pop()
```

### 2.2 Tuples (Immutable, Ordered)
Faster than lists. Used for fixed heterogeneous data.
```python
coordinates = (10.0, 20.0)
x, y = coordinates # Unpacking
```

### 2.3 Sets (Mutable, Unordered, Unique)
Used for fast membership testing and math operations.
```python
primary = {"red", "blue", "yellow"}
secondary = {"green", "orange", "purple"}
all_colors = primary | secondary # Union
common = primary & secondary     # Intersection
```

### 2.4 Dictionaries (Key-Value, Ordered from 3.7+)
```python
student = {"name": "John", "age": 22}
print(student.get("GPA", 0.0)) # Safe access
student["age"] = 23

for key, value in student.items():
    print(f"{key}: {value}")
```

---

## 3. Control Flow

### Conditional and Loop Statements
```python
# if-elif-else
if score >= 90: grade = 'A'
elif score >= 80: grade = 'B'
else: grade = 'F'

# for loop with range(start, stop, step)
for i in range(1, 10, 2):
    pass # 1, 3, 5, 7, 9

# while loop with break/continue
count = 5
while count > 0:
    if count == 3:
        count -= 1
        continue # Skip 3
    count -= 1
```

---

## 4. Functions and Scope

### Parameters, Unpacking, and Lambdas
```python
def print_details(*args, **kwargs):
    # args is a tuple of positional arguments
    # kwargs is a dict of keyword arguments
    pass

# Lambda (anonymous function)
square = lambda x: x ** 2
```

### Scope and the LEGB Rule
**L**ocal, **E**nclosing, **G**lobal, **B**uilt-in.
```python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        nonlocal x   # Modifies 'enclosing', not local
        x = "modified enclosing"
    inner()

count = 0
def increment():
    global count     # Modifies global variable
    count += 1
```

---

## 5. Object-Oriented Programming (OOP) - In Detail

### 5.1 Classes, Objects, and `self`
The class is the blueprint. `__init__` initializes instance attributes. `self` refers to the specific object instance calling the method.

### 5.2 Instance, Class, and Static Methods
```python
class Employee:
    company = "Tech Corp" # Class attribute

    def __init__(self, name):
        self.name = name  # Instance attribute

    # Needs access to specific instance ('self')
    def get_name(self):
        return self.name

    # Needs access to the class ('cls'), but not the instance
    @classmethod
    def get_company(cls):
        return cls.company

    # Doesn't need access to class OR instance, acts as a utility
    @staticmethod
    def is_workday(day):
        return day.weekday() < 5
```

### 5.3 Encapsulation and `@property`
Encapsulation restricts direct access to internal states. Python uses `_` for protected (convention) and `__` for private (name mangling).
The `@property` decorator allows for getter, setter, and deleter behavior.
```python
class BankAccount:
    def __init__(self, balance):
        self.__balance = balance # Private

    @property
    def balance(self):
        return self.__balance

    @balance.setter
    def balance(self, new_balance):
        if new_balance >= 0:
            self.__balance = new_balance
        else:
            raise ValueError("Balance cannot be negative")

acc = BankAccount(100)
acc.balance = 200 # Calls the setter!
```

### 5.4 Inheritance, MRO, and Abstract Classes
- **Multiple Inheritance**: Python supports inheriting from multiple classes.
- **Method Resolution Order (MRO)**: The order Python searches for methods (accessible via `ClassName.mro()`).
- **Abstract Base Classes (ABC)**: Enforces child classes to implement certain methods.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self): pass

class MathUtility:
    def print_info(self): print("Math utility used.")

# Multiple Inheritance
class Rectangle(Shape, MathUtility):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self): # Required by ABC
        return self.w * self.h

print(Rectangle.mro()) # [Rectangle, Shape, ABC, MathUtility, object]
```

### 5.5 Magic Methods and Operator Overloading
Also known as dunder (double underscore) methods. They define how objects interact with Python's built-in operators.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        # Overloads the '+' operator
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        # Overloads the '==' operator
        return self.x == other.x and self.y == other.y

    def __str__(self):
        # Human-readable string representation (called by print)
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        # Developer-friendly string representation
        return f"Vector({self.x}, {self.y})"

v1 = Vector(2, 4)
v2 = Vector(3, -1)
print(v1 + v2) # Calls __add__, outputs Vector(5, 3)
```

### 5.6 Data Classes (`@dataclass`) (Python 3.7+)
Automatically generates boilerplate code for classes (like `__init__`, `__repr__`, `__eq__`).

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int
    z: int = 0  # Default value

p1 = Point(1, 2)
print(p1) # Output: Point(x=1, y=2, z=0) automatically generated!
```

---

## 6. Modules and Packages

Modules are `.py` files. Packages are directories of modules with an `__init__.py` file (optional in modern Python).

```python
import math
from datetime import datetime
import pandas as pd

# Runs only if file is executed directly (not if imported elsewhere)
if __name__ == "__main__":
    pass
```

---

## 7. Exception Handling

Ensures the program doesn't crash from unexpected behavior.

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print("Cannot divide by zero!")
except (TypeError, ValueError):
    print("Handled multiple exceptions")
else:
    print("Runs if NO exception occurred")
finally:
    print("Always runs.")
```

---

## 8. File Handling and Context Managers

The `with` statement manages resources efficiently (like automatically closing files).

```python
with open("data.txt", "w") as f:
    f.write("Line 1")

# Creating custom context managers with __enter__ and __exit__
class DatabaseConnection:
    def __enter__(self):
        print("Opening connection")
        return self
    def __exit__(self, exc_type, exc_val, traceback):
        print("Closing connection reliably")

with DatabaseConnection() as db:
    pass # do work
```

---

## 9. Memory Management and Garbage Collection

Python handles memory management automatically, relieving the developer from manual memory allocation (like `malloc` in C).

### 9.1 Reference Counting
Python keeps track of how many references point to an object. When the count drops to 0, the memory is deallocated.
```python
import sys
a = []            # Reference count = 1
b = a             # Reference count = 2
print(sys.getrefcount(a)) # Usually shows memory ref + internal Python refs
del b             # Reference count = 1
```

### 9.2 Garbage Collection (GC Module)
Reference counting alone can't handle **circular references** (e.g., Object A references Object B, and Object B references Object A). Python has a built-in cycle-detecting garbage collector.
```python
import gc
gc.enable()       # Enabled by default
gc.collect()      # Force a manual garbage collection sweep
print(gc.get_stats())
```

---

## 10. Concurrency and Parallelism

Concurrency means dealing with lots of things at once (task switching), while Parallelism means doing lots of things at once (multiple CPU cores).

### 10.1 The Global Interpreter Lock (GIL)
CPython has a GIL, a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes at once. This means **Threads in Python do NOT run in true parallel for CPU-bound tasks**.

### 10.2 Multithreading (`threading` module)
Good for **I/O-bound tasks** (network requests, file reading), where the thread spends time waiting.
```python
import threading
import time

def io_task():
    time.sleep(1) # Simulating I/O Wait

thread1 = threading.Thread(target=io_task)
thread2 = threading.Thread(target=io_task)

thread1.start()
thread2.start()

thread1.join() # Wait for thread1 to finish
thread2.join()
```

### 10.3 Multiprocessing (`multiprocessing` module)
Bypasses the GIL by creating entirely separate Python processes (each with its own memory space and GIL). Good for **CPU-bound tasks** (math, image processing).
```python
from multiprocessing import Process

def cpu_task():
    return sum(i*i for i in range(10**7))

if __name__ == '__main__':
    p1 = Process(target=cpu_task)
    p2 = Process(target=cpu_task)
    p1.start(); p2.start()
    p1.join(); p2.join()
```

### 10.4 AsyncIO (`async` / `await`)
Provides single-threaded, cooperative concurrency. highly efficient for massive I/O bound workloads (like handling thousands of network connections).
```python
import asyncio

async def fetch_data(id):
    await asyncio.sleep(1) # Yields control back to event loop
    return f"Data {id}"

async def main():
    # Gather runs them concurrently
    results = await asyncio.gather(fetch_data(1), fetch_data(2))
    print(results)

# asyncio.run(main())
```

---

## 11. Advanced Concepts

### 11.1 Iterators and Generators (`yield`)
Generators evaluate lazily (one at a time), saving massive amounts of memory compared to lists.
```python
def fibonacci(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

for val in fibonacci(5): print(val) # 0, 1, 1, 2, 3
```

### 11.2 Decorators
Functions that wrap other functions to modify behavior dynamically.
```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before execution")
        result = func(*args, **kwargs)
        print("After execution")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
```

---

## 12. Modern Python & Ecosystem

### 12.1 Type Hinting (PEP 484)
Used by linters (`mypy`) to catch type errors before runtime.
```python
from typing import List, Dict, Union, Optional

def process(data: List[int]) -> Optional[float]:
    if not data: return None
    return sum(data) / len(data)
```

### 12.2 Walrus Operator (`:=`) & Pattern Matching (`match-case`)
```python
# Walrus (assign and evaluate)
if (n := len([1,2,3])) > 2:
    print(n)

# Match-case (Python 3.10+)
def handle_response(status):
    match status:
        case 200: return "OK"
        case 404: return "Not Found"
        case _: return "Unknown"
```

### 12.3 Virtual Environments
Isolates dependencies.
```bash
python -m venv myenv
source myenv/bin/activate  # Linux/Mac
pip install requests
pip freeze > requirements.txt
```

---
**Congratulations!** You've completed the comprehensive Python course. You are now equipped with knowledge spanning from fundamental syntax to memory internals, advanced OOP, concurrency scaling, and modern Python architectures!
