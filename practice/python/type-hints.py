# basic variable annotations
user_name: str = "Pankaj"
user_age: int = 30
user_height: float = 5.10
user_active: bool = True
user_session: None = None

# basic function annotations
def greet(name: str) -> str:
    return f"Hello, {name}!"
print(greet("Pankaj"))

def process() -> None:
    print("Processing...")
process()
