"""Python Fundamentals - Object-Oriented Programming (OOP), Inheritance, and MRO.

This script demonstrates Python's object-oriented programming model:
1. Defining classes with class attributes, `__init__` instance state, and methods.
2. String representation dunder methods (`__str__` for users vs `__repr__` for developers).
3. Single inheritance and delegating to parent classes with `super()`.
4. Multiple inheritance, the Diamond Problem, Method Resolution Order (`__mro__`),
   and cooperative `super().__init__(**kwargs)`.

Run directly:
    python practice/01-python/16-oop.py
"""

# ---------------------------------------------------------------------------
# 1. Defining a Class with __init__, Methods, and Dunder Representations
# ---------------------------------------------------------------------------
class BankAccount:
    """Represent a bank account supporting deposits and withdrawals."""

    bank_name = "TechBank"  # Class attribute (shared across all instances)

    def __init__(self, owner: str, balance: float = 0.0):
        """Initialize account owner and starting balance."""
        self.owner = owner          # Instance attribute
        self.balance = balance      # Instance attribute

    def deposit(self, amount: float) -> float:
        """Add a positive amount to the account balance and return the new balance."""
        # ① Guard against zero or negative deposits
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        # ② Update and return balance
        self.balance += amount
        return self.balance

    def withdraw(self, amount: float) -> float:
        """Deduct an amount from the balance if sufficient funds exist."""
        # ① Guard against overdraft
        if amount > self.balance:
            raise ValueError("Insufficient funds.")
        # ② Deduct and return remaining balance
        self.balance -= amount
        return self.balance

    def __str__(self) -> str:
        """Human-readable string representation used by print() and str()."""
        return f"BankAccount(owner='{self.owner}', balance=${self.balance:.2f})"

    def __repr__(self) -> str:
        """Unambiguous developer representation used in debuggers and repr()."""
        return f"BankAccount(owner='{self.owner}', balance={self.balance})"


# ---------------------------------------------------------------------------
# 2. Creating Instances & Single Inheritance with super()
# ---------------------------------------------------------------------------
# ① Instantiate BankAccount and invoke instance methods
acc = BankAccount("Alice", 100.0)
acc.deposit(50.0)
print(acc)        # BankAccount(owner='Alice', balance=$150.00)
print(repr(acc))  # BankAccount(owner='Alice', balance=150.0)


# ② Extend BankAccount via single inheritance
class SavingsAccount(BankAccount):
    """BankAccount subclass that accrues interest at a configurable rate."""

    def __init__(self, owner: str, balance: float = 0.0, interest_rate: float = 0.03):
        """Initialize base BankAccount fields via super() plus interest_rate."""
        super().__init__(owner, balance)
        self.interest_rate = interest_rate

    def apply_interest(self) -> float:
        """Calculate and credit interest to the current balance."""
        earned = self.balance * self.interest_rate
        self.balance += earned
        return self.balance


savings = SavingsAccount("Bob", 1000.0)
savings.apply_interest()
print(f"Savings balance: ${savings.balance:.2f}")  # Savings balance: $1030.00


# ---------------------------------------------------------------------------
# Interview Question 1 / Problem: Inventory Item Class
# ---------------------------------------------------------------------------
class InventoryItem:
    """Track stock quantity and unit pricing for a warehouse inventory item."""

    def __init__(self, name: str, quantity: int = 0, unit_price: float = 0.0):
        """Initialize an inventory item with non-negative quantity and unit price."""
        # ① Validate initial state invariants
        if quantity < 0 or unit_price < 0:
            raise ValueError("Quantity and price must be non-negative.")
        self.name = name
        self.quantity = quantity
        self.unit_price = unit_price

    def restock(self, amount: int) -> int:
        """Increase item stock by a positive integer amount."""
        if amount <= 0:
            raise ValueError("Restock amount must be positive.")
        self.quantity += amount
        return self.quantity

    def sell(self, amount: int) -> int:
        """Decrease item stock by a positive amount if sufficient stock is available."""
        # ① Validate sale quantity is positive and within available stock
        if amount <= 0:
            raise ValueError("Sale amount must be positive.")
        if amount > self.quantity:
            raise ValueError(f"Cannot sell {amount}; only {self.quantity} in stock.")
        # ② Deduct sold units and return updated quantity
        self.quantity -= amount
        return self.quantity

    def total_value(self) -> float:
        """Compute total monetary value of current stock rounded to 2 decimal places."""
        return round(self.quantity * self.unit_price, 2)

    def __repr__(self) -> str:
        """Developer-friendly representation of the inventory item."""
        return f"InventoryItem(name='{self.name}', qty={self.quantity}, price={self.unit_price})"


# ---------------------------------------------------------------------------
# Verification / Test Cases (InventoryItem)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# 3. Multiple Inheritance, the Diamond Problem & Cooperative super()
# ---------------------------------------------------------------------------
#
#       Device
#       /    \
#   Scanner  Printer
#       \    /
#       Copier
#
# Using cooperative `super().__init__(**kwargs)` ensures Python follows C3
# Linearization (MRO: Copier -> Scanner -> Printer -> Device -> object) so that
# the shared base class `Device.__init__` is executed exactly ONCE.
class Device:
    """Root hardware device class tracking initialization count."""

    init_count = 0

    def __init__(self, device_id: str, brand: str = "Generic", **kwargs):
        super().__init__(**kwargs)
        self.device_id = device_id
        self.brand = brand
        Device.init_count += 1

    def diagnostics(self) -> list[str]:
        return [f"Device({self.device_id}, brand={self.brand}) OK"]


class Scanner(Device):
    """Scanner capability mixin extending Device."""

    def __init__(self, resolution_dpi: int = 600, **kwargs):
        super().__init__(**kwargs)
        self.resolution_dpi = resolution_dpi

    def diagnostics(self) -> list[str]:
        return [f"Scanner({self.resolution_dpi} DPI) OK"] + super().diagnostics()


class Printer(Device):
    """Printer capability mixin extending Device."""

    def __init__(self, print_speed_ppm: int = 30, **kwargs):
        super().__init__(**kwargs)
        self.print_speed_ppm = print_speed_ppm

    def diagnostics(self) -> list[str]:
        return [f"Printer({self.print_speed_ppm} PPM) OK"] + super().diagnostics()


class Copier(Scanner, Printer):
    """Multi-function copier inheriting cooperatively from both Scanner and Printer."""

    def __init__(self, has_duplex: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.has_duplex = has_duplex

    def diagnostics(self) -> list[str]:
        return [f"Copier(duplex={self.has_duplex}) OK"] + super().diagnostics()


# ---------------------------------------------------------------------------
# Verification / Test Cases (Diamond Problem & MRO)
# ---------------------------------------------------------------------------
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
