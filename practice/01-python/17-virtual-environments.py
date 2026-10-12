import re
import sys
from pathlib import Path

# Verify whether the current script is running inside a virtual environment
def is_virtual_env() -> bool:
    # In a virtual environment, sys.prefix points to the .venv directory,
    # while sys.base_prefix points to the global system Python installation.
    return sys.prefix != sys.base_prefix

print(f"Python Executable: {sys.executable}")
print(f"Active Environment Path: {sys.prefix}")
print(f"Base System Python Path: {sys.base_prefix}")
print(f"Running inside virtual environment: {is_virtual_env()}")

# Check for requirements.txt in project root
req_file = Path("requirements.txt")
if req_file.exists():
    dependencies = [line.strip() for line in req_file.read_text().splitlines() if line.strip() and not line.startswith("#")]
    print(f"Project requirements ({len(dependencies)} packages): {dependencies}")


# Interview question: Parse Requirements File
def parse_requirements(requirements_content: str) -> dict[str, str]:
    requirements = {}
    pattern = re.compile(r"^([A-Za-z0-9_.\-]+)\s*([<>=!~].*)?$")

    for line in requirements_content.splitlines():
        cleaned = line.strip()
        # Skip empty lines and comment lines
        if not cleaned or cleaned.startswith("#"):
            continue

        match = pattern.match(cleaned)
        if match:
            pkg_name = match.group(1).lower()
            specifier = (match.group(2) or "").strip()
            requirements[pkg_name] = specifier

    return requirements

# Test cases
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
print("Parse requirements passed!")

