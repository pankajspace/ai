"""Example catalog: reads the Strands SDK example scripts and builds a
structured directory of modules and lessons.

Each example file's module-level docstring is parsed for the lesson title
and description.  The source code is returned verbatim for display in the
browser.

This module is imported by ``app.py`` — it never runs standalone.
"""

import os
import re
from pathlib import Path

# examples/ sits alongside this file inside src/python/
EXAMPLES_DIR = Path(__file__).resolve().parent / "examples"

# Module metadata — order and display names for each subdirectory.
MODULES = [
    {
        "id": "01",
        "title": "Module 1 — First Agents",
        "description": "Simplest possible agents with Strands and LangGraph. "
                       "See the agentic loop run for the first time.",
        "accent": "green",
    },
    {
        "id": "02",
        "title": "Module 2 — Tools",
        "description": "The core skill: turning Python functions into agent tools. "
                       "Custom tools, pre-built tools, multi-tool agents, "
                       "class-based tools, and async parallel execution.",
        "accent": "blue",
    },
    {
        "id": "03",
        "title": "Module 3 — Capstone",
        "description": "A Travel Assistant that chains weather, packing, and "
                       "budget tools — exercises every concept from Modules 1 & 2.",
        "accent": "purple",
    },
]

# Root-level utility scripts (not inside a module directory).
ROOT_SCRIPTS = [
    {
        "filename": "config.py",
        "title": "Shared Model Config",
        "description": "Model IDs for Bedrock — change once, applies everywhere.",
    },
    {
        "filename": "00_check_setup.py",
        "title": "Environment Check",
        "description": "Verifies Python, packages, credentials, region, and "
                       "Bedrock — makes a real model call.",
    },
    {
        "filename": "01_list_models.py",
        "title": "List Live Models",
        "description": "Lists Bedrock models available in your account. "
                       "Use when a model is retired.",
    },
]


def _parse_docstring(source: str) -> tuple[str, str]:
    """Extract a title and description from a module-level docstring.

    The first non-empty line becomes the title; subsequent lines up to a
    blank line (or the ``python`` / ``bash`` run-command line) become the
    description.

    Returns (title, description).  Falls back to the filename if parsing
    fails.
    """
    match = re.match(r'^"""(.*?)"""', source, re.DOTALL)
    if not match:
        match = re.match(r"^'''(.*?)'''", source, re.DOTALL)
    if not match:
        return ("Untitled", "")

    raw = match.group(1).strip()
    lines = raw.splitlines()

    # First non-empty line → title (strip leading "Module X · Lesson Y — ")
    title = ""
    desc_lines: list[str] = []
    collecting_desc = False
    for line in lines:
        stripped = line.strip()
        if not title:
            if stripped:
                # Remove the "Module X · Lesson Y — " prefix if present
                cleaned = re.sub(r"^Module\s+\d+\s*·\s*Lesson\s+\d+\s*—\s*", "", stripped)
                # Remove "CAPSTONE PROJECT — " prefix
                cleaned = re.sub(r"^CAPSTONE PROJECT\s*—\s*", "", cleaned)
                title = cleaned
            continue
        if stripped == "":
            if collecting_desc:
                break
            continue
        # Stop at run-command lines
        if stripped.startswith("python ") or stripped.startswith("python3 "):
            break
        collecting_desc = True
        desc_lines.append(stripped)

    description = " ".join(desc_lines)
    return (title, description)


def _read_file(path: Path) -> str:
    """Read a file and return its contents as a string."""
    return path.read_text(encoding="utf-8")


def _build_lessons(module_id: str) -> list[dict]:
    """Build the lesson list for a single module directory."""
    module_dir = EXAMPLES_DIR / module_id
    if not module_dir.is_dir():
        return []

    lessons = []
    for py_file in sorted(module_dir.glob("*.py")):
        source = _read_file(py_file)
        title, description = _parse_docstring(source)
        lessons.append({
            "filename": py_file.name,
            "title": title,
            "description": description,
            "source": source,
        })
    return lessons


def get_modules() -> list[dict]:
    """Return the full module/lesson catalog.

    Each module dict contains: id, title, description, accent, lessons[].
    """
    result = []
    for mod in MODULES:
        lessons = _build_lessons(mod["id"])
        result.append({
            **mod,
            "lessons": lessons,
        })
    return result


def get_root_scripts() -> list[dict]:
    """Return metadata + source for the root-level utility scripts."""
    result = []
    for info in ROOT_SCRIPTS:
        path = EXAMPLES_DIR / info["filename"]
        if path.exists():
            source = _read_file(path)
        else:
            source = f"# File not found: {info['filename']}"
        result.append({
            **info,
            "source": source,
        })
    return result


def get_lesson(module_id: str, filename: str) -> dict | None:
    """Return a single lesson by module ID and filename, or None."""
    path = EXAMPLES_DIR / module_id / filename
    if not path.exists():
        return None
    source = _read_file(path)
    title, description = _parse_docstring(source)
    return {
        "module": module_id,
        "filename": filename,
        "title": title,
        "description": description,
        "source": source,
    }
