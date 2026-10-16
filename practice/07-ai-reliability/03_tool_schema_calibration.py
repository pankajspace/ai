"""Tool Schema Routing Calibration Benchmark.

Measures which part of a tool schema an LLM actually routes on using a 2x2 factorial design:
1. 2x2 Matrix of Conditions:
   - Condition A: Descriptive Names (`get_weather_current`, etc.) + Loose Descriptions
   - Condition B: Descriptive Names (`get_weather_current`, etc.) + Tight Descriptions
   - Condition C: Opaque Names (`weather_service_a`, `b`, `c`) + Loose Descriptions
   - Condition D: Opaque Names (`weather_service_a`, `b`, `c`) + Tight Descriptions
2. Crossing function names with docstring descriptions separates the two signals and
   reveals whether the model relies on identifier keywords or semantic docstrings.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_tool_schema_calibration.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_tool_schema_calibration
"""

import os
import textwrap
import time
from collections import Counter

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from rich.console import Console, Group
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------

# 1. Load API keys and settings from .env
load_dotenv(find_dotenv())

console = Console()

MODEL_ID = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.0"))

_client = None


def get_client() -> OpenAI:
    """Returns a module-level OpenAI client, creating it on first use."""
    global _client
    # ① Lazily initialize the OpenAI client and verify that OPENAI_API_KEY is configured
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            console.print(
                "[bold red]Error:[/bold red] OPENAI_API_KEY not set. Add it to a .env file."
            )
            raise SystemExit(1)
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


# ---------------------------------------------------------------------------
# Tool Schema Definitions & 2x2 Calibration Matrix
# ---------------------------------------------------------------------------


def tool(name, description):
    """Builds one OpenAI tool definition."""
    # ① Construct an OpenAI function-calling schema for a given tool name and description
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "The city name."}
                },
                "required": ["location"],
            },
        },
    }


CANONICAL = ("current", "forecast", "history")

NAME_SETS = {
    "descriptive": {
        "current": "get_weather_current",
        "forecast": "get_weather_forecast",
        "history": "get_weather_history",
    },
    "opaque": {
        "current": "weather_service_a",
        "forecast": "weather_service_b",
        "history": "weather_service_c",
    },
}

DESCRIPTION_SETS = {
    "loose": {
        "current": "Get weather information for a location.",
        "forecast": "Get weather data for a city.",
        "history": "Fetch weather records for a specific area.",
    },
    "tight": {
        "current": (
            "Get CURRENT, REAL-TIME weather conditions for a specific location. "
            "Use only for queries about 'now', 'today', or current status."
        ),
        "forecast": (
            "Get FUTURE weather predictions and forecasts. Use only for queries "
            "about 'tomorrow', 'next week', 'upcoming', or future dates."
        ),
        "history": (
            "Fetch HISTORICAL weather records from the past. Use only for queries "
            "about yesterday, last year, or specific past dates."
        ),
    },
}


def build_condition(name_style, desc_style):
    """Builds the tool list and a name->canonical map for one condition."""
    # ① Pair the chosen naming style with the chosen description style for all three tools
    names = NAME_SETS[name_style]
    descs = DESCRIPTION_SETS[desc_style]
    tools = [tool(names[c], descs[c]) for c in CANONICAL]
    lookup = {names[c]: c for c in CANONICAL}
    return tools, lookup


# ---------------------------------------------------------------------------
# Benchmark Dataset & Input Options
# ---------------------------------------------------------------------------

# 2. Inputs - query dataset
#    Uncomment another option below to test different scenarios:

# Option 1: Full benchmark of 50 queries across all three categories (default)
QUERIES = [
    # Current (17)
    ("How is the weather in Tokyo right now?", "current"),
    ("Is it raining in London at the moment?", "current"),
    ("Current temperature in Paris?", "current"),
    ("Show me today's weather for NYC.", "current"),
    ("What's the humidity like in Berlin today?", "current"),
    ("Tell me the weather for Sydney now.", "current"),
    ("Status of weather in Mumbai.", "current"),
    ("Is it sunny in Madrid today?", "current"),
    ("Check weather for Rome.", "current"),
    ("What's the wind speed in Chicago right now?", "current"),
    ("Weather report for Seattle currently.", "current"),
    ("Give me the current weather in Toronto.", "current"),
    ("Current conditions in Moscow.", "current"),
    ("Is there snow in Oslo today?", "current"),
    ("Weather update for Cape Town.", "current"),
    ("Current sky condition in Seoul.", "current"),
    ("How hot is it in Dubai now?", "current"),
    # Forecast (17)
    ("What will the weather be like tomorrow in London?", "forecast"),
    ("Will it rain next Tuesday in Paris?", "forecast"),
    ("Forecast for Berlin for the coming weekend.", "forecast"),
    ("Is it going to snow tomorrow in NYC?", "forecast"),
    ("Weather prediction for Tokyo next week.", "forecast"),
    ("Give me the 5-day forecast for Sydney.", "forecast"),
    ("How's the weather looking for Madrid on Friday?", "forecast"),
    ("Will the sun be out tomorrow in Rome?", "forecast"),
    ("Upcoming weather for Chicago.", "forecast"),
    ("Forecast for Seattle next Monday.", "forecast"),
    ("Prediction for Toronto weather tomorrow.", "forecast"),
    ("Future weather in Moscow for the next 3 days.", "forecast"),
    ("Expected weather in Oslo tomorrow.", "forecast"),
    ("Is it going to be windy in Cape Town this weekend?", "forecast"),
    ("Weather outlook for Seoul next month.", "forecast"),
    ("Will it be hot in Dubai tomorrow?", "forecast"),
    ("Forecast for Beijing tomorrow.", "forecast"),
    # History (16)
    ("What was the weather like in London yesterday?", "history"),
    ("Did it rain in Paris last Christmas?", "history"),
    ("Temperature in Berlin on July 4th, 2023.", "history"),
    ("How much snow fell in NYC last winter?", "history"),
    ("Weather records for Tokyo in 1990.", "history"),
    ("Was it sunny in Sydney on my birthday last year?", "history"),
    ("History of weather in Madrid for August 2022.", "history"),
    ("Past weather in Rome for June last year.", "history"),
    ("What was the weather in Chicago on January 1st?", "history"),
    ("Historical data for Seattle weather in 2010.", "history"),
    ("Last week's weather in Toronto.", "history"),
    ("How cold was it in Moscow in December 2020?", "history"),
    ("Weather in Oslo yesterday afternoon.", "history"),
    ("Cape Town weather history for last summer.", "history"),
    ("Was it raining in Seoul three days ago?", "history"),
    ("Past temperature in Dubai on Feb 1st.", "history"),
]

# Option 2: Quick test subset (6 queries - 2 per category)
# QUERIES = [
#     ("How is the weather in Tokyo right now?", "current"),
#     ("What's the humidity like in Berlin today?", "current"),
#     ("What will the weather be like tomorrow in London?", "forecast"),
#     ("Forecast for Berlin for the coming weekend.", "forecast"),
#     ("What was the weather like in London yesterday?", "history"),
#     ("Did it rain in Paris last Christmas?", "history"),
# ]

# Option 3: Future forecast queries only
# QUERIES = [
#     ("What will the weather be like tomorrow in London?", "forecast"),
#     ("Will it rain next Tuesday in Paris?", "forecast"),
#     ("Forecast for Berlin for the coming weekend.", "forecast"),
#     ("Give me the 5-day forecast for Sydney.", "forecast"),
# ]

# ---------------------------------------------------------------------------
# Terminal Rendering & Visualization
# ---------------------------------------------------------------------------

SHORT_NAME = {None: "(no call)", "ERROR": "(error)"}


def accuracy_bar(correct, total, width=20):
    """Generates a text-based progress bar indicating success rate."""
    # ① Compute accuracy ratio and format a color-coded ASCII progress bar
    pct = correct / total if total else 0
    filled = round(pct * width)
    bar = "X" * filled + "." * (width - filled)
    color = "green" if pct >= 0.8 else "yellow" if pct >= 0.5 else "red"
    return Text(f"{bar}  {correct}/{total}  ({int(pct * 100)}%)", style=color)


def display_llm_exchange(query, response_text):
    """Renders visual representation of the LLM input and output."""
    # ① Render the user query inside a styled Model Input panel
    messages = [{"role": "user", "content": query}]
    input_elements = []
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        indent = " " * (len(role) + 2)
        wrapped = textwrap.fill(content, width=82, subsequent_indent=indent)
        input_elements.append(
            Text.assemble((f"{role.upper()}: ", "bold blue"), (wrapped, "blue"))
        )
        input_elements.append(Rule(style="bright_black"))

    if input_elements:
        input_elements.pop()

    console.print(
        Panel(
            Group(*input_elements),
            title="[bold bright_black]Model Input[/bold bright_black]",
            border_style="bright_black",
            padding=(1, 2),
        )
    )
    console.print()

    # ② Render the selected tool call inside a Model Response panel
    wrapped_response = textwrap.fill(
        response_text, width=82, subsequent_indent="           "
    )
    response_content = Text.assemble(
        ("ASSISTANT: ", "bold green"), (wrapped_response, "italic")
    )
    console.print(
        Panel(
            response_content,
            title="[bold bright_black]Model Response[/bold bright_black]",
            border_style="bright_black",
            padding=(1, 2),
            highlight=False,
        )
    )
    console.print()


# ---------------------------------------------------------------------------
# Helper & Scoring Functions
# ---------------------------------------------------------------------------


def select_tool(query, tools, lookup):
    """Asks the model to route one query and returns the tool it picked."""
    # ① Force a tool selection via tool_choice="required" and map back to the canonical category
    try:
        response = get_client().chat.completions.create(
            model=MODEL_ID,
            messages=[{"role": "user", "content": query}],
            tools=tools,
            tool_choice="required",
            temperature=TEMPERATURE,
        )
        calls = response.choices[0].message.tool_calls
        if not calls:
            return None
        return lookup.get(calls[0].function.name, calls[0].function.name)
    except Exception as e:
        console.print(f"\n[bold red]API error:[/bold red] {e}")
        return "ERROR"


# ---------------------------------------------------------------------------
# Benchmark Execution Loop
# ---------------------------------------------------------------------------


def run_condition(name_style, desc_style, label):
    """Evaluates the benchmark queries under one cell of the 2x2 design."""
    # ① Build the condition's tool definitions and canonical lookup table
    tools, lookup = build_condition(name_style, desc_style)
    console.print(
        f"[bold cyan]-- Condition {label}: {name_style.title()} names + "
        f"{desc_style.title()} descriptions ----------------[/bold cyan]"
    )

    # ② Route the first query and display the sample LLM exchange panel
    t0 = time.time()
    sample_picked = select_tool(QUERIES[0][0], tools, lookup)
    t_first = time.time() - t0

    sample_call_text = (
        f"[CALLING TOOL] {sample_picked} for query: '{QUERIES[0][0]}'"
    )
    display_llm_exchange(QUERIES[0][0], sample_call_text)

    records = [
        {
            "query": QUERIES[0][0],
            "expected": QUERIES[0][1],
            "picked": sample_picked,
            "correct": sample_picked == QUERIES[0][1],
            "elapsed": t_first,
        }
    ]

    console.print("  [dim]Collecting remaining responses:[/dim]")

    # ③ Route all remaining queries and record routing accuracy and latency
    for idx, (query, expected) in enumerate(QUERIES[1:], start=2):
        t0 = time.time()
        picked = select_tool(query, tools, lookup)
        elapsed = time.time() - t0
        correct = picked == expected
        records.append(
            {
                "query": query,
                "expected": expected,
                "picked": picked,
                "correct": correct,
                "elapsed": elapsed,
            }
        )

        dot = "[green]o[/green]" if correct else "[red]x[/red]"
        console.print(
            f"  [dim]Run #{idx:02d}:[/dim] {dot}  [dim]{elapsed:4.1f}s | "
            f"expected '{expected}', picked '{SHORT_NAME.get(picked, picked)}'[/dim]",
            highlight=False,
        )

    # ④ Return aggregated routing accuracy and per-category counts for this condition
    console.print()
    correct_count = sum(1 for r in records if r["correct"])
    return {
        "records": records,
        "correct": correct_count,
        "total": len(records),
        "accuracy": (correct_count / len(records)) * 100,
        "by_category": Counter(
            r["expected"] for r in records if r["correct"]
        ),
    }


def main():
    """Runs the 2x2 routing experiment and displays the summary."""
    # ① Initialize OpenAI client and display the benchmark overview panel
    get_client()

    console.print(
        Panel.fit(
            "[bold yellow]Tool Schema Calibration[/bold yellow]\n"
            "[dim]Measures whether LLMs route on tool names vs descriptions.[/dim]\n"
            f"[dim]Model: {MODEL_ID} · Temperature: {TEMPERATURE} · {len(QUERIES)} queries per condition[/dim]",
            border_style="yellow",
        )
    )
    console.print()

    # ② Define and execute all four conditions (A, B, C, D) of the 2x2 schema matrix
    conditions = [
        ("A", "descriptive", "loose"),
        ("B", "descriptive", "tight"),
        ("C", "opaque", "loose"),
        ("D", "opaque", "tight"),
    ]

    results = {}
    for code, n_style, d_style in conditions:
        results[code] = run_condition(n_style, d_style, code)

    # ③ Render the comparative routing accuracy summary table across Conditions A–D
    console.print(Rule("[bold yellow]Overall Summary[/bold yellow]", style="yellow"))
    console.print()

    table = Table(title="Routing Accuracy Across Conditions", show_lines=True)
    table.add_column("Condition", style="bold", min_width=28)
    table.add_column("Tool Names", justify="center")
    table.add_column("Descriptions", justify="center")
    table.add_column("Accuracy", justify="center")
    table.add_column("Score", justify="center")

    labels = {
        "A": ("Descriptive", "Loose"),
        "B": ("Descriptive", "Tight"),
        "C": ("Opaque", "Loose"),
        "D": ("Opaque", "Tight"),
    }

    for code in ("A", "B", "C", "D"):
        res = results[code]
        n_lbl, d_lbl = labels[code]
        table.add_row(
            f"Condition {code}",
            n_lbl,
            d_lbl,
            accuracy_bar(res["correct"], res["total"]),
            f"{res['correct']}/{res['total']}",
        )

    console.print(table)
    console.print()


# ---------------------------------------------------------------------------
# Standalone CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    main()

