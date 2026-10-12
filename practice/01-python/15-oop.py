# 1. Defining a class with __init__ and methods
class BankAccount:
    bank_name = "TechBank"  # Class attribute (shared)

    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner          # Instance attribute
        self.balance = balance      # Instance attribute

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self.balance += amount
        return self.balance

    def withdraw(self, amount: float) -> float:
        if amount > self.balance:
            raise ValueError("Insufficient funds.")
        self.balance -= amount
        return self.balance

    def __str__(self) -> str:
        return f"BankAccount(owner='{self.owner}', balance=${self.balance:.2f})"

    def __repr__(self) -> str:
        return f"BankAccount(owner='{self.owner}', balance={self.balance})"

# 2. Creating instances and invoking methods
acc = BankAccount("Alice", 100.0)
acc.deposit(50.0)
print(acc)        # BankAccount(owner='Alice', balance=$150.00)
print(repr(acc))  # BankAccount(owner='Alice', balance=150.0)

# 3. Inheritance and super()
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: float = 0.0, interest_rate: float = 0.03):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def apply_interest(self) -> float:
        earned = self.balance * self.interest_rate
        self.balance += earned
        return self.balance

savings = SavingsAccount("Bob", 1000.0)
savings.apply_interest()
print(f"Savings balance: ${savings.balance:.2f}")  # Savings balance: $1030.00


# Interview question: Inventory Item Class
class InventoryItem:
    def __init__(self, name: str, quantity: int = 0, unit_price: float = 0.0):
        if quantity < 0 or unit_price < 0:
            raise ValueError("Quantity and price must be non-negative.")
        self.name = name
        self.quantity = quantity
        self.unit_price = unit_price

    def restock(self, amount: int) -> int:
        if amount <= 0:
            raise ValueError("Restock amount must be positive.")
        self.quantity += amount
        return self.quantity

    def sell(self, amount: int) -> int:
        if amount <= 0:
            raise ValueError("Sale amount must be positive.")
        if amount > self.quantity:
            raise ValueError(f"Cannot sell {amount}; only {self.quantity} in stock.")
        self.quantity -= amount
        return self.quantity

    def total_value(self) -> float:
        return round(self.quantity * self.unit_price, 2)

    def __repr__(self) -> str:
        return f"InventoryItem(name='{self.name}', qty={self.quantity}, price={self.unit_price})"

# Test cases
item = InventoryItem("Mechanical Keyboard", quantity=10, unit_price=79.99)
print(item.total_value())  # 799.9
item.restock(5)
print(item.quantity)       # 15
item.sell(3)
print(item.quantity)       # 12
print(item.total_value())  # 959.88

try:
    item.sell(20)
except ValueError as e:
    print(e)  # Cannot sell 20; only 12 in stock.

print("Inventory item passed!")  # Inventory item passed!

