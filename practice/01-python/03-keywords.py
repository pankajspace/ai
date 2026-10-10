import keyword

# Get all keywords
print(f"All keywords in python {keyword.kwlist}")
# All keywords in python ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']

# Get all soft keywords
print(f"All soft keywords in python {keyword.softkwlist}")
# All soft keywords in python ['_', 'case', 'match', 'type']

# Checking if a string is a keyword
print(keyword.iskeyword('True')) # True
print(keyword.iskeyword('true')) # False

# Checking if a string is a soft keyword
print(keyword.issoftkeyword('case')) # True
print(keyword.issoftkeyword('def')) # False
