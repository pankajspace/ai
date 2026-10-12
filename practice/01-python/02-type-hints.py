from __future__ import annotations

## basic variable annotations
user_name: str = "Pankaj"
user_age: int = 30
user_height: float = 5.10
user_active: bool = True
user_session: None = None

## basic function annotations
# function return type annotation
def greet(name: str) -> str:
    return f"Hello, {name}!"
print(greet("Pankaj"))  # Hello, Pankaj!
# function with no return value annotation
def process() -> None:
    print("Processing...")  # Processing...
process()

## build in collection and generic type annotations
# list annotation
numbers: list[int] = [1, 2, 3, 4, 5]
# dictionary annotation
user_info: dict[str, str] = {"name": "Pankaj", "city": "New York"}
# tuple annotation
coordinates: tuple[float, float] = (40.7128, 74.0060)
# set annotation
unique_numbers: set[int] = {1, 2, 3, 4, 5}

## union type annotation
value: int | str = 42
value = "Hello"
optional_value: int | None = None

## type alias to give meaningful names to complex composite types.
Point = tuple[float, float]
location: Point = (40.7128, 74.0060)

# Interview question: Parse Record
ParsedRecord = tuple[str, int, float]

def parse_record(raw: dict[str, str]) -> ParsedRecord | None:
    try:
        name = raw["name"]
        age = int(raw["age"])
        balance = float(raw["balance"])
        return name, age, balance
    except (KeyError, ValueError):
        return None

# Test cases
record_ok = {"name": "Charlie", "age": "29", "balance": "150.50"}
parsed = parse_record(record_ok)
print(parsed)  # ('Charlie', 29, 150.5)

record_bad = {"name": "Bob", "balance": "invalid"}
print(parse_record(record_bad))  # None

empty_record = {}
print(parse_record(empty_record))  # None
print("Parse record with type hints passed!")  # Parse record with type hints passed!