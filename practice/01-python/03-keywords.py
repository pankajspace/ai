"""Python Fundamentals - Reserved Keywords and Soft Keywords.

This script demonstrates how to inspect and validate Python language keywords:
1. Retrieving the complete list of hard reserved keywords via keyword.kwlist.
2. Retrieving context-specific soft keywords (e.g., match, case, type, _) via keyword.softkwlist.
3. Testing whether an identifier is a reserved keyword or soft keyword at runtime.

Run directly:
    python practice/01-python/03-keywords.py
"""

import keyword

# ---------------------------------------------------------------------------
# 1. Hard Reserved Keywords
# ---------------------------------------------------------------------------
# ① Hard keywords cannot be used as variable, function, or class identifiers anywhere
print(f"All keywords in python {keyword.kwlist}")
# All keywords in python ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']


# ---------------------------------------------------------------------------
# 2. Context-Sensitive Soft Keywords
# ---------------------------------------------------------------------------
# ② Soft keywords (introduced in Python 3.10+) act as keywords only in specific syntactic contexts
# (such as structural pattern matching), remaining valid identifiers elsewhere
print(f"All soft keywords in python {keyword.softkwlist}")
# All soft keywords in python ['_', 'case', 'match', 'type']


# ---------------------------------------------------------------------------
# 3. Verification / Keyword Membership Checks
# ---------------------------------------------------------------------------
# ③ Check if a string is a reserved hard keyword (case-sensitive)
print(keyword.iskeyword('True')) # True
print(keyword.iskeyword('true')) # False

# ④ Check if a string is a context-sensitive soft keyword
print(keyword.issoftkeyword('case')) # True
print(keyword.issoftkeyword('def')) # False
