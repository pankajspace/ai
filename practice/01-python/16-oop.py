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


# 4. Multiple Inheritance, the Diamond Problem & cooperative super()
#
#       Device
#       /    \
#   Scanner  Printer
#       \    /
#       Copier
#
class Device:
    init_count = 0

    def __init__(self, device_id: str, brand: str = "Generic", **kwargs):
        super().__init__(**kwargs)
        self.device_id = device_id
        self.brand = brand
        Device.init_count += 1

    def diagnostics(self) -> list[str]:
        return [f"Device({self.device_id}, brand={self.brand}) OK"]

class Scanner(Device):
    def __init__(self, resolution_dpi: int = 600, **kwargs):
        super().__init__(**kwargs)
        self.resolution_dpi = resolution_dpi

    def diagnostics(self) -> list[str]:
        return [f"Scanner({self.resolution_dpi} DPI) OK"] + super().diagnostics()

class Printer(Device):
    def __init__(self, print_speed_ppm: int = 30, **kwargs):
        super().__init__(**kwargs)
        self.print_speed_ppm = print_speed_ppm

    def diagnostics(self) -> list[str]:
        return [f"Printer({self.print_speed_ppm} PPM) OK"] + super().diagnostics()

class Copier(Scanner, Printer):
    def __init__(self, has_duplex: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.has_duplex = has_duplex

    def diagnostics(self) -> list[str]:
        return [f"Copier(duplex={self.has_duplex}) OK"] + super().diagnostics()

# Test cases
copier = Copier(
    device_id="DEV-200",
    brand="Canon",
    resolution_dpi=2400,
    print_speed_ppm=40,
    has_duplex=True
)

print(copier.device_id)        # DEV-200
print(copier.brand)            # Canon
print(copier.resolution_dpi)   # 2400
print(copier.print_speed_ppm)  # 40
print(copier.has_duplex)       # True
print(Device.init_count)       # 1
print([cls.__name__ for cls in Copier.__mro__])
# ['Copier', 'Scanner', 'Printer', 'Device', 'object']

for status in copier.diagnostics():
    print(status)
# Copier(duplex=True) OK
# Scanner(2400 DPI) OK
# Printer(40 PPM) OK
# Device(DEV-200, brand=Canon) OK

print("Diamond problem passed!")  # Diamond problem passed!

