"""Prompting Strategies Benchmark (Direct vs. Zero-Shot CoT vs. Few-Shot CoT).

Benchmarks three fundamental prompting strategies on multi-step reasoning problems
where the intuitive answer is easily miscalculated:
1. Direct: "Answer in one short sentence. State only the final answer."
2. Zero-Shot CoT: "Think step by step, then state your final answer..."
3. Few-Shot CoT: Provides explicit worked reasoning examples before the question.

Reports accuracy AND token cost, so the accuracy gain can be weighed against
what it costs to buy in tokens and latency.

IMPORTANT: use a NON-reasoning model (e.g. gpt-4o-mini). Reasoning models
think internally even under a "just the final answer" prompt, which erases
the gap this benchmark exists to measure.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 01_prompting_strategies .
    docker run --rm --env-file .env 01_prompting_strategies
"""

import os
import re
import textwrap
import time

import matplotlib

matplotlib.use("Agg")  # save to file without needing a display
import matplotlib.pyplot as plt
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------

# 1. Load API keys and settings from .env
load_dotenv(find_dotenv())

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

console = Console()
_client = None


def get_client() -> OpenAI:
    """Returns a module-level OpenAI client, creating it on first use.

    Returns:
        An authenticated OpenAI client instance.

    Side effects:
        Reads OPENAI_API_KEY from the environment on first call.

    Edge cases / gotchas:
        Raises SystemExit with a readable message when the key is missing,
        rather than a bare KeyError at import time.
    """
    global _client
    # ① Lazily initialize the OpenAI client and verify that OPENAI_API_KEY is configured
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            console.print(
                "[bold red]Error:[/bold red] OPENAI_API_KEY not set. Add it to a .env file."
            )
            console.print(
                f"[dim]Looked for .env at: "
                f"{find_dotenv() or 'no .env found in this folder or any parent'}[/dim]"
            )
            raise SystemExit(1)
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


# ---------------------------------------------------------------------------
# Benchmark Dataset & Input Options
# ---------------------------------------------------------------------------

# 2. Inputs - default benchmark suite or targeted single test cases
#    Uncomment another option below to test different scenarios:

# Option 1: Full benchmark suite (default) - multi-step reasoning, arithmetic, rates
BENCHMARK_DATA = [
    {
        "question": "A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)",
        "answer": ["293"],
    },
    {
        "question": "A jacket is priced at 4000 rupees. A 25% discount is applied, then a further 10% off the reduced price, and finally 18% GST is added to that result. What is the final price? (Answer with the number only)",
        "answer": ["3186"],
    },
    {
        "question": "A factory produces 2000 units in a day. 8% fail quality control. Of the units that pass, 15% are exported and the rest are sold domestically. How many units are sold domestically? (Answer with the number only)",
        "answer": ["1564"],
    },
    {
        "question": "A train departs at 14:35. The journey takes 3 hours 50 minutes, then it waits 25 minutes at a junction, then continues for a further 1 hour 40 minutes. What time does it arrive? (Answer in 24-hour HH:MM format)",
        "answer": ["20:30", "8:30 pm", "8:30pm"],
    },
    {
        "question": "Three printers together print 90 pages in 6 minutes. At the same rate per printer, how many pages would 5 printers print in 10 minutes? (Answer with the number only)",
        "answer": ["250"],
    },
]

# Option 2: Quick single test - transaction calculation
# BENCHMARK_DATA = [
#     {
#         "question": "A shop sells pens at 23 rupees each. Ravi buys 7 pens, returns 2 of them, then buys 4 more. He pays the final bill with a 500 rupee note. How much change does he get? (Answer with the number only)",
#         "answer": ["293"],
#     },
# ]

# Option 3: Quick single test - compound percentages
# BENCHMARK_DATA = [
#     {
#         "question": "A jacket is priced at 4000 rupees. A 25% discount is applied, then a further 10% off the reduced price, and finally 18% GST is added to that result. What is the final price? (Answer with the number only)",
#         "answer": ["3186"],
#     },
# ]

# Option 4: Quick single test - worker rates
# BENCHMARK_DATA = [
#     {
#         "question": "Three printers together print 90 pages in 6 minutes. At the same rate per printer, how many pages would 5 printers print in 10 minutes? (Answer with the number only)",
#         "answer": ["250"],
#     },
# ]

# Few-Shot Examples for reasoning-based prompting
FEW_SHOT_EXAMPLES = """
Example 1:
Question: If I have 3 apples and I give 2 to my friend, but then my friend gives me 1 back, how many apples do I have?
Thought:
1. Start with 3 apples.
2. Give 2 away: 3 - 2 = 1 apple remaining.
3. Friend gives 1 back: 1 + 1 = 2 apples.
Answer: 2

Example 2:
Question: How many legs does a spider have?
Thought:
1. Spiders are arachnids.
2. Arachnids typically have 8 legs.
Answer: 8

Example 3:
Question: What is 15 * 4?
Thought:
1. 15 * 2 is 30.
2. 30 * 2 is 60.
Answer: 60
"""


# ---------------------------------------------------------------------------
# Helper & Scoring Functions
# ---------------------------------------------------------------------------


def get_model_response(prompt):
    """Sends a prompt to the model and returns the response text and token counts.

    Args:
        prompt: The string text to send.

    Returns:
        A tuple (text, prompt_tokens, completion_tokens). On failure, returns
        an 'Error: ...' string with zero token counts.

    Side effects:
        Makes a synchronous network request.

    Edge cases / gotchas:
        Never raises, so a single failed call does not abort the benchmark.
    """
    # ① Dispatch chat completion request and extract response text plus token usage
    try:
        response = get_client().chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
        )
        usage = response.usage
        return (
            response.choices[0].message.content,
            usage.prompt_tokens,
            usage.completion_tokens,
        )
    except Exception as e:
        return f"Error: {e}", 0, 0


def extract_final_answer(response_text):
    """Isolates the model's stated final answer from a full response.

    Args:
        response_text: The verbatim model output.

    Returns:
        The answer segment as a lowercase string.

    Edge cases / gotchas:
        Prefers the text after the LAST 'Answer:' marker, which both CoT
        prompts request. Falls back to the final non-empty line, which is
        what a Direct response is. This is what stops a reasoning trace from
        being searched for the right answer.
    """
    # ① Look for explicit 'Answer:' delimiter or fallback to the final non-empty line
    text = response_text.strip()

    matches = list(re.finditer(r"answer\s*:", text, flags=re.IGNORECASE))
    if matches:
        segment = text[matches[-1].end() :]
    else:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        segment = lines[-1] if lines else ""

    # ② Take only the first line of the segment and strip markdown formatting
    segment = segment.strip().splitlines()[0] if segment.strip() else ""
    return segment.replace("*", "").replace("`", "").strip().lower()


def first_clause(segment):
    """Trims a stated answer down to the asserted value, dropping justification.

    Args:
        segment: The lowercase answer segment from extract_final_answer().

    Returns:
        The leading clause as a string.

    Edge cases / gotchas:
        Cuts at a comma, semicolon, sentence break or a joining word such as
        'since'. Without this, a response like 'Answer: 8 sheep are left, since
        17 - 9 = 8' would be searched for the expected '9' and score correct.
        The sentence break is '. ' (period plus space) so decimals like 0.05
        survive intact.
    """
    # ① Locate punctuation or conjunction cut points that introduce trailing explanations
    cut_points = [segment.find(sep) for sep in (",", ";", ". ")]
    for word in (" since ", " because ", " which ", " as ", " so ", " therefore "):
        cut_points.append(segment.find(word))

    # ② Slice up to the earliest valid cut point to isolate the asserted answer
    valid = [p for p in cut_points if p > 0]
    return segment[: min(valid)].strip() if valid else segment.strip()


def evaluate_accuracy(response_text, correct_answer):
    """Checks whether the model's FINAL answer matches an expected answer.

    Args:
        response_text: The verbatim model output.
        correct_answer: The expected answer, as a string or a list of
            acceptable strings.

    Returns:
        True when the extracted final answer matches any accepted value.

    Edge cases / gotchas:
        Scores only the stated final answer, with word boundaries, and for a
        numeric answer requires the FIRST number stated to be the answer.
    """
    # ① Guard against error responses and normalize expected answers into a list
    if response_text.startswith("Error:"):
        return False

    accepted = (
        [correct_answer] if isinstance(correct_answer, str) else list(correct_answer)
    )

    # ② Extract the final answer segment and trim trailing justification clauses
    answer_segment = extract_final_answer(response_text)
    if not answer_segment:
        return False

    # keep only the asserted value, dropping any trailing justification
    clause = first_clause(answer_segment)
    cleaned_clause = clause.replace("$", "").replace(",", "")

    # ③ Match the cleaned answer clause against each accepted ground-truth candidate
    for candidate in accepted:
        cleaned_answer = candidate.strip().lower().replace("$", "").replace(",", "")

        if cleaned_clause.rstrip(".") == cleaned_answer:
            return True

        if re.search(r"^\d+$", cleaned_answer):
            first_num = re.search(r"\b\d+\b", cleaned_clause)
            if first_num and first_num.group(0) == cleaned_answer:
                return True

        pattern = r"\b" + re.escape(cleaned_answer) + r"\b"
        if re.search(pattern, cleaned_clause):
            return True

    return False


# ---------------------------------------------------------------------------
# Terminal Rendering & Visualization
# ---------------------------------------------------------------------------


def display_prompt_block(prompt, prompt_type):
    """Styles and prints the prompt to the terminal."""
    # ① Wrap and render the user prompt inside a styled Rich panel
    indent = " " * (len(prompt_type) + 2)
    wrapped = textwrap.fill(prompt.strip(), width=82, subsequent_indent=indent)

    content = Text.assemble(
        (f"{prompt_type.upper()}: ", "bold blue"),
        (wrapped, "blue"),
    )

    console.print(
        Panel(
            content,
            title="[bold bright_black]Model Input[/bold bright_black]",
            border_style="bright_black",
            padding=(1, 2),
        )
    )
    console.print()


def accuracy_bar(correct, total, width=20):
    """Generates a text-based progress bar indicating success rate."""
    # ① Compute accuracy ratio and format a color-coded ASCII progress bar
    if total == 0:
        return Text("N/A", style="dim")
    pct = correct / total
    filled = round(pct * width)
    bar = "X" * filled + "." * (width - filled)
    color = "green" if pct >= 0.8 else "yellow" if pct >= 0.5 else "red"
    return Text(f"{bar}  {correct}/{total}  ({int(pct * 100)}%)", style=color)


# ---------------------------------------------------------------------------
# Benchmark Execution Loop
# ---------------------------------------------------------------------------


def run_benchmark():
    """Runs all benchmark questions across the three prompting strategies.

    Returns:
        A dict keyed by strategy name, containing accuracy, tokens, and counts.

    Side effects:
        Makes network requests and prints formatted output to stdout.
    """
    # ① Define the three prompting strategy templates (Direct, Zero-Shot CoT, Few-Shot CoT)
    strategies = {
        "Direct": lambda q: f"{q}\nAnswer in one short sentence. State only the final answer.",
        "Zero-Shot CoT": lambda q: f"{q}\nThink step by step, then state your final answer on the last line as 'Answer: <value>'.",
        "Few-Shot CoT": lambda q: f"{FEW_SHOT_EXAMPLES}\nQuestion: {q}\nThink step by step, then state your final answer on the last line as 'Answer: <value>'.",
    }

    results = {
        name: {"accuracy": 0, "total_correct": 0, "tokens": 0, "count": 0}
        for name in strategies
    }

    # ② Print the benchmark overview header
    console.print(
        Panel.fit(
            "[bold yellow]Benchmarking Prompting Strategies[/bold yellow]\n"
            "[dim]Direct vs. Zero-Shot CoT vs. Few-Shot CoT[/dim]\n"
            f"[dim]Model: {MODEL_NAME} · Temperature: {TEMPERATURE}[/dim]",
            border_style="yellow",
        )
    )
    console.print()

    # ③ Execute each prompting strategy across all benchmark questions
    for name, strategy_fn in strategies.items():
        console.print(Rule(f"[bold cyan]Strategy: {name}[/bold cyan]", style="cyan"))
        console.print()

        total_correct = 0
        total_tokens = 0

        for i, item in enumerate(BENCHMARK_DATA, 1):
            prompt = strategy_fn(item["question"])
            expected = item["answer"]
            expected_label = expected[0] if isinstance(expected, list) else expected

            display_prompt_block(prompt, "User")

            # ④ Call the model and measure response latency and token consumption
            start_time = time.time()
            response, p_tokens, c_tokens = get_model_response(prompt)
            elapsed = time.time() - start_time

            # ⑤ Score accuracy against expected ground truth and display the response
            total_tokens += p_tokens + c_tokens
            is_correct = evaluate_accuracy(response, expected)
            if is_correct:
                total_correct += 1

            wrapped_response = textwrap.fill(
                response.strip(), width=82, subsequent_indent="           "
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

            dot = "[green]o[/green]" if is_correct else "[red]x[/red]"
            scored = extract_final_answer(response)
            console.print(
                f"  [dim]Run #{i:02d}:[/dim] {dot} [dim]{elapsed:4.1f}s | "
                f"{p_tokens + c_tokens} tokens | scored on: '{scored}' "
                f"| expected: '{expected_label}'[/dim]",
                highlight=False,
            )
            console.print()

        # ⑥ Aggregate accuracy percentage and total token cost for the current strategy
        results[name]["accuracy"] = (total_correct / len(BENCHMARK_DATA)) * 100
        results[name]["total_correct"] = total_correct
        results[name]["tokens"] = total_tokens
        results[name]["count"] = len(BENCHMARK_DATA)
        console.print()

    return results


def plot_results(results):
    """Generates and saves a performance plot comparing strategies.

    Args:
        results: The dict returned by run_benchmark().

    Side effects:
        Writes benchmark_results.png to the current directory.
    """
    # ① Extract strategy names, accuracy percentages, and token counts
    names = list(results.keys())
    accuracies = [results[n]["accuracy"] for n in names]
    tokens = [results[n]["tokens"] for n in names]

    # ② Plot accuracy bars on the primary Y-axis and token cost line on the secondary Y-axis
    fig, ax1 = plt.subplots(figsize=(10, 6))

    color = "tab:blue"
    ax1.set_xlabel("Strategy")
    ax1.set_ylabel("Accuracy (%)", color=color)
    ax1.bar(names, accuracies, color=color, alpha=0.6, label="Accuracy")
    ax1.tick_params(axis="y", labelcolor=color)
    ax1.set_ylim(0, 110)

    # Secondary axis for token count
    ax2 = ax1.twinx()
    color = "tab:red"
    ax2.set_ylabel("Total Tokens Used", color=color)
    ax2.plot(names, tokens, color=color, marker="o", label="Token Cost")
    ax2.tick_params(axis="y", labelcolor=color)

    # ③ Save the chart to disk as benchmark_results.png
    plt.title(f"Accuracy vs. Token Cost ({MODEL_NAME})")
    fig.tight_layout()
    plt.savefig("benchmark_results.png")


def display_stats(results):
    """Displays a summary table and final verdict based on benchmark data.

    Args:
        results: The dict returned by run_benchmark().

    Side effects:
        Writes tables and a verdict panel to stdout.
    """
    # ① Build and print the comparative Rich summary table across all strategies
    console.print(Rule("[bold yellow]Overall Summary[/bold yellow]", style="yellow"))
    console.print()

    table = Table(title="Benchmark Results", show_lines=True)
    table.add_column("Strategy", style="bold", min_width=15)
    table.add_column("Accuracy", justify="center")
    table.add_column("Total Tokens", justify="center", style="dim")
    table.add_column("Avg Tokens/Query", justify="center", style="dim")

    for name, data in results.items():
        avg_tokens = data["tokens"] / data["count"]
        acc_bar = accuracy_bar(data["total_correct"], data["count"])

        table.add_row(
            name,
            acc_bar,
            str(data["tokens"]),
            f"{avg_tokens:.1f}",
        )

    console.print(table)
    console.print()

    # ② Compute top accuracy, token efficiency (accuracy points per 1k tokens), and CoT deltas
    best_acc = max(results.values(), key=lambda x: x["accuracy"])["accuracy"]
    best_strategies = [n for n, d in results.items() if d["accuracy"] == best_acc]

    efficiency = {
        n: (d["accuracy"] / (d["tokens"] / 1000)) if d["tokens"] > 0 else 0
        for n, d in results.items()
    }
    most_efficient = max(efficiency, key=efficiency.get)

    baseline = results["Direct"]
    verdict_lines = [
        f"Highest Accuracy: [green]{', '.join(best_strategies)} ({best_acc:.1f}%)[/green]",
        f"Most Efficient:   [cyan]{most_efficient}[/cyan] "
        f"[dim]({efficiency[most_efficient]:.1f} accuracy pts per 1k tokens)[/dim]",
    ]

    for name, data in results.items():
        if name == "Direct" or baseline["tokens"] == 0:
            continue
        acc_delta = data["accuracy"] - baseline["accuracy"]
        token_mult = data["tokens"] / baseline["tokens"]
        verdict_lines.append(
            f"[dim]{name}: {acc_delta:+.0f}pp accuracy for {token_mult:.1f}x the tokens[/dim]"
        )

    # ③ Render the final verdict panel
    console.print(
        Panel.fit(
            "\n".join(verdict_lines),
            title="[bold]Verdict[/bold]",
            border_style="green",
        )
    )
    console.print()
    console.print("[dim]Plot saved to benchmark_results.png[/dim]")


# ---------------------------------------------------------------------------
# Standalone CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    results = run_benchmark()
    display_stats(results)
    plot_results(results)

