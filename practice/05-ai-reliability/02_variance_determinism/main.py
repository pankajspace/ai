"""Structured Output Variance & Determinism Benchmark.

Evaluates how output constraints transform stochastic LLMs into reliable pipeline components:
1. Strategy A (Unconstrained Prompt): Model asked for review extraction in freeform text
   (high variance, crashes strict downstream JSON parsers).
2. Strategy B (Prompt-Constrained): Prompt instructs JSON output with specific keys
   (occasionally wraps markdown code fences or drifts from schema).
3. Strategy C (Schema-Enforced): Uses OpenAI Structured Outputs (`response_format` with strict JSON schema)
   guaranteeing 100% valid, schema-compliant JSON across all iterations.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 02_variance_determinism .
    docker run --rm --env-file .env 02_variance_determinism
"""

import json
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

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# ---------------------------------------------------------------------------
# Benchmark Dataset & Input Options
# ---------------------------------------------------------------------------

# 2. Inputs - iterations count and review text
#    Uncomment another option below to test different scenarios:

# Iterations per strategy (measures statistical consistency)
ITERATIONS = 15
# ITERATIONS = 3  # Fast test run
# ITERATIONS = 5  # Quick check

# Option 1: Smartphone review (default)
base_review = (
    "The new smartphone is amazing, the camera quality is top-notch but the "
    "battery life is a bit disappointing. I love the design though!"
)

# Option 2: Laptop review with mixed performance
# base_review = (
#     "The laptop has blazing performance and great build quality, but the "
#     "trackpad feels sticky and the battery lasts only 3 hours under load."
# )

# Option 3: Flight delay / travel complaint
# base_review = (
#     "Terrible customer service and the flight was delayed by 6 hours. "
#     "The food served onboard was okay, but baggage was mishandled."
# )

# Option 4: Hotel hospitality review
# base_review = (
#     "The hotel room was spotless, the staff was exceptionally helpful, "
#     "and the breakfast buffet was delicious with plenty of fresh choices."
# )

# Schema expected by downstream pipeline
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["Positive", "Negative", "Mixed"]},
        "entities": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["sentiment", "entities"],
    "additionalProperties": False,
}

# ---------------------------------------------------------------------------
# Helper & Scoring Functions
# ---------------------------------------------------------------------------

_client = None


def get_openai_client():
    """Initializes and returns the OpenAI API client."""
    global _client
    # ① Lazily initialize the OpenAI client and verify that OPENAI_API_KEY is configured
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            console.print(
                "[bold red]Error:[/bold red] OPENAI_API_KEY environment variable not set."
            )
            raise ValueError("OPENAI_API_KEY not set")
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


def call_model(client, prompt, response_format=None, model_name=MODEL, max_retries=4):
    """Generates a text response from the model, retrying on transient errors."""
    last_err = ""
    # ① Attempt chat completion with optional response_format and exponential backoff on rate/server errors
    for attempt in range(max_retries):
        try:
            kwargs = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            }
            if response_format is not None:
                kwargs["response_format"] = response_format

            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content.strip()
        except Exception as e:
            last_err = str(e)
            if any(
                hard in last_err
                for hard in ("insufficient_quota", "invalid_api_key", "401", "404")
            ):
                break
            if any(code in last_err for code in ("429", "500", "503")):
                time.sleep(2**attempt * 2)
                continue
            break
    return f"Error: {last_err}"


def parse_downstream(raw):
    """Simulates a strict downstream consumer parsing the model output."""
    # ① Attempt strict json.loads() parsing without any markdown fence stripping
    if raw.startswith("Error:"):
        return False, False

    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return False, False

    if not isinstance(data, dict):
        return True, False

    # ② Verify that the parsed JSON object conforms to the expected sentiment and entities schema
    sentiment = data.get("sentiment")
    entities = data.get("entities")

    schema_ok = (
        isinstance(sentiment, str)
        and sentiment in ("Positive", "Negative", "Mixed")
        and isinstance(entities, list)
        and all(isinstance(e, str) for e in entities)
    )
    return True, schema_ok


# ---------------------------------------------------------------------------
# Terminal Rendering & Visualization
# ---------------------------------------------------------------------------


def display_exchange(prompt, response):
    """Prints the prompt, the model response and the parser verdict."""
    # ① Render the user prompt inside a styled Model Input panel
    input_elements = []
    messages = [{"role": "user", "content": prompt}]

    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        indent = " " * (len(role) + 2)
        wrapped = textwrap.fill(content, width=82, subsequent_indent=indent)
        input_elements.append(
            Text.assemble((f"{role.upper()}: ", "bold blue"), (wrapped, "blue"))
        )

    console.print(
        Panel(
            Group(*input_elements),
            title="[bold bright_black]Model Input[/bold bright_black]",
            border_style="bright_black",
            padding=(1, 2),
        )
    )
    console.print()

    # ② Render the raw model output inside a Model Response panel
    wrapped_response = textwrap.fill(response, width=82, subsequent_indent="           ")
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

    # ③ Evaluate and display the downstream JSON/schema parser verdict
    parsed_ok, schema_ok = parse_downstream(response)
    if parsed_ok and schema_ok:
        verdict = "[bold green]Downstream parser: OK - valid JSON, schema matched[/bold green]"
    elif parsed_ok:
        verdict = "[bold yellow]Downstream parser: PARTIAL - valid JSON but wrong shape[/bold yellow]"
    else:
        verdict = "[bold red]Downstream parser: CRASHED - json.loads() raised[/bold red]"
    console.print(f"  {verdict}")
    console.print()


def run_experiment(client, name, prompt, response_format=None, iterations=ITERATIONS):
    """Executes a prompt multiple times and collects all responses."""
    console.print(f"[bold cyan]-- {name} {'-' * max(4, 50 - len(name))}[/bold cyan]")
    console.print(f"[dim]Running {iterations} iterations...[/dim]")

    responses = []

    # ① Execute and display the first sample iteration in full detail
    console.print("[dim]  Waiting for first response...[/dim]")
    sample_response = call_model(client, prompt, response_format=response_format)
    display_exchange(prompt, sample_response)
    responses.append(sample_response)

    console.print("  [dim]Collecting remaining responses:[/dim]")

    # ② Execute remaining iterations and print compact parser status indicators
    for i in range(2, iterations + 1):
        resp = call_model(client, prompt, response_format=response_format)
        responses.append(resp)

        parsed_ok, schema_ok = parse_downstream(resp)
        if parsed_ok and schema_ok:
            dot = "[green]o[/green]"
        elif parsed_ok:
            dot = "[yellow]?[/yellow]"
        else:
            dot = "[red]x[/red]"

        console.print(
            f"  [dim]Run #{i:02d}:[/dim] {dot}  [dim]{resp[:60]}...[/dim]",
            highlight=False,
        )

    console.print()
    return responses


def calculate_metrics(responses):
    """Calculates statistical and parser-success metrics for a set of responses."""
    # ① Count unique responses and modal frequency to quantify output consistency
    total = len(responses)
    if total == 0:
        return {
            "unique_count": 0,
            "consistency_pct": 0,
            "parse_pct": 0,
            "schema_pct": 0,
            "most_common_share": 0,
            "total": 0,
        }

    counts = Counter(responses)
    unique_count = len(counts)
    most_common_count = counts.most_common(1)[0][1]

    # ② Compute JSON parse rate and strict target schema compliance rate
    parse_success = 0
    schema_success = 0
    for r in responses:
        p_ok, s_ok = parse_downstream(r)
        if p_ok:
            parse_success += 1
        if s_ok:
            schema_success += 1

    return {
        "unique_count": unique_count,
        "consistency_pct": (most_common_count / total) * 100,
        "parse_pct": (parse_success / total) * 100,
        "schema_pct": (schema_success / total) * 100,
        "most_common_share": most_common_count,
        "total": total,
    }


def pct_cell(pct):
    """Formats a percentage as a coloured string."""
    color = "green" if pct >= 95 else "yellow" if pct >= 50 else "red"
    return f"[{color}]{pct:.0f}%[/{color}]"


def log_responses_to_file(filename, prompt, responses):
    """Writes all raw responses to a markdown file for inspection."""
    # ① Persist all raw outputs and their downstream parser statuses to a Markdown log file
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# Responses Log\n\nPrompt:\n```\n{prompt}\n```\n\n")
        for i, resp in enumerate(responses, 1):
            p_ok, s_ok = parse_downstream(resp)
            status = "OK" if s_ok else ("JSON_ONLY" if p_ok else "CRASH")
            f.write(f"## Run {i} [{status}]\n```\n{resp}\n```\n\n")


# ---------------------------------------------------------------------------
# Benchmark Execution Loop
# ---------------------------------------------------------------------------


def main():
    """Runs the 3-strategy comparison and prints the summary."""
    # ① Initialize OpenAI client and display the benchmark banner
    client = get_openai_client()

    console.print(
        Panel.fit(
            "[bold yellow]Variance & Non-Determinism in LLM Outputs[/bold yellow]\n"
            "[dim]How output constraints turn an unreliable model into a reliable component.[/dim]\n"
            f"[dim]Model: {MODEL} | temperature 0.7 | {ITERATIONS} runs per strategy[/dim]",
            border_style="yellow",
        )
    )
    console.print()

    # ② Define prompts and strict JSON schema format for Strategies A, B, and C
    task = (
        "Extract the sentiment and key entities from this customer review: "
        f"'{base_review}'"
    )

    unconstrained_prompt = task

    constrained_prompt = (
        f"{task}\n"
        "Output only a JSON object with the keys 'sentiment' and 'entities'. "
        "'sentiment' should be a string (Positive, Negative, or Mixed). "
        "'entities' should be a list of strings."
    )

    schema_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "review_extraction",
            "strict": True,
            "schema": RESPONSE_SCHEMA,
        },
    }

    # ③ Run Strategy A (Unconstrained freeform prompt) and compute metrics
    res_a = run_experiment(
        client, "Strategy A: Unconstrained Prompt", unconstrained_prompt
    )
    log_responses_to_file("output-a-unconstrained.md", unconstrained_prompt, res_a)
    metrics_a = calculate_metrics(res_a)

    # ④ Run Strategy B (Prompt-Constrained JSON instructions) and compute metrics
    res_b = run_experiment(
        client, "Strategy B: Prompt-Constrained (asks for JSON)", constrained_prompt
    )
    log_responses_to_file("output-b-prompt-json.md", constrained_prompt, res_b)
    metrics_b = calculate_metrics(res_b)

    # ⑤ Run Strategy C (Schema-Enforced Structured Outputs API) and compute metrics
    res_c = run_experiment(
        client,
        "Strategy C: Schema-Enforced (API guarantees JSON)",
        constrained_prompt,
        response_format=schema_format,
    )
    log_responses_to_file("output-c-schema.md", constrained_prompt, res_c)
    metrics_c = calculate_metrics(res_c)

    # ⑥ Render the comparative Variance & Pipeline Reliability summary table
    console.print(Rule("[bold yellow]Overall Summary[/bold yellow]", style="yellow"))
    console.print()

    table = Table(title="Variance & Pipeline Reliability", show_lines=True)
    table.add_column("Metric", style="bold", min_width=26)
    table.add_column("A: Unconstrained", justify="center", style="cyan")
    table.add_column("B: Prompt-Constrained", justify="center", style="magenta")
    table.add_column("C: Schema-Enforced", justify="center", style="green")

    table.add_row(
        "Unique Responses",
        str(metrics_a["unique_count"]),
        str(metrics_b["unique_count"]),
        str(metrics_c["unique_count"]),
    )
    table.add_row(
        "Consistency Score",
        f"{metrics_a['consistency_pct']:.0f}%",
        f"{metrics_b['consistency_pct']:.0f}%",
        f"{metrics_c['consistency_pct']:.0f}%",
    )
    table.add_row(
        "Parses as JSON",
        pct_cell(metrics_a["parse_pct"]),
        pct_cell(metrics_b["parse_pct"]),
        pct_cell(metrics_c["parse_pct"]),
    )
    table.add_row(
        "Matches Target Schema",
        pct_cell(metrics_a["schema_pct"]),
        pct_cell(metrics_b["schema_pct"]),
        pct_cell(metrics_c["schema_pct"]),
    )

    console.print(table)
    console.print()


# ---------------------------------------------------------------------------
# Standalone CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    main()

