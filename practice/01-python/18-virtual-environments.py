"""Python Fundamentals - Virtual Environments and Dependency Management.

This script demonstrates inspecting Python's runtime environment and dependency files:
1. Detecting whether the interpreter is running inside an isolated virtual environment
   by comparing `sys.prefix` against `sys.base_prefix`.
2. Inspecting the active Python binary path via `sys.executable`.
3. Reading and parsing package version specifiers from `requirements.txt` content.

Run directly:
    python practice/01-python/18-virtual-environments.py
"""

import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 1. Detecting Active Virtual Environment via sys.prefix
# ---------------------------------------------------------------------------
def is_virtual_env() -> bool:
    """Check whether the current Python process is running inside a virtual environment.

    Returns:
        True if running inside a venv/virtualenv (sys.prefix != sys.base_prefix), False otherwise.
    """
    # ① In a virtual environment, sys.prefix points to the .venv directory,
    # while sys.base_prefix points to the global system Python installation.
    return sys.prefix != sys.base_prefix


# ② Inspect runtime interpreter paths and virtual environment status
print(f"Python Executable: {sys.executable}")
# Python Executable: /Users/pankaj/Workspace/ai/.venv/bin/python3
print(f"Active Environment Path: {sys.prefix}")
# Active Environment Path: /Users/pankaj/Workspace/ai/.venv
print(f"Base System Python Path: {sys.base_prefix}")
# Base System Python Path: /usr/local
print(f"Running inside virtual environment: {is_virtual_env()}")
# Running inside virtual environment: True


# ---------------------------------------------------------------------------
# 2. Inspecting Local requirements.txt (If Present)
# ---------------------------------------------------------------------------
req_file = Path("requirements.txt")
if req_file.exists():
    dependencies = [line.strip() for line in req_file.read_text().splitlines() if line.strip() and not line.startswith("#")]
    print(f"Project requirements ({len(dependencies)} packages): {dependencies}")
    # Project requirements (3 packages): ['fastapi>=0.110.0', 'uvicorn~=0.28.0', 'requests==2.31.0']


# ---------------------------------------------------------------------------
# Interview Question / Problem: Parse Requirements File
# ---------------------------------------------------------------------------
def parse_requirements(requirements_content: str) -> dict[str, str]:
    """Parse raw requirements.txt content into a mapping of package names to version specifiers.

    Args:
        requirements_content: Multiline string formatted like a pip requirements.txt file.

    Returns:
        Dictionary mapping lowercase package names to their version specifier string
        (or '' if no version constraint is specified).
    """
    # ① Initialize output map and compile regex capturing (package_name, optional_specifier)
    requirements = {}
    pattern = re.compile(r"^([A-Za-z0-9_.\-]+)\s*([<>=!~].*)?$")

    # ② Process the file line by line
    for line in requirements_content.splitlines():
        cleaned = line.strip()
        # ③ Skip empty lines and comment lines starting with '#'
        if not cleaned or cleaned.startswith("#"):
            continue

        # ④ Extract normalized package name and version constraint
        match = pattern.match(cleaned)
        if match:
            pkg_name = match.group(1).lower()
            specifier = (match.group(2) or "").strip()
            requirements[pkg_name] = specifier

    # ⑤ Return the parsed dependency dictionary
    return requirements


# ---------------------------------------------------------------------------
# Verification / Test Cases
# ---------------------------------------------------------------------------
sample_reqs = """
# Production dependencies
requests==2.31.0
fastapi>=0.110.0
uvicorn~=0.28.0
pytest
"""

parsed = parse_requirements(sample_reqs)
print(parsed["requests"])      # ==2.31.0
print(parsed["fastapi"])       # >=0.110.0
print(parsed["uvicorn"])       # ~=0.28.0
print(repr(parsed["pytest"]))  # ''
print("Parse requirements passed!")  # Parse requirements passed!
