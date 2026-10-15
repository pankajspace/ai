"""Chain-of-Thought vs. Direct Answer Reliability Benchmark.

Demonstrates that asking a model to "think step by step" acts as a reliability
lever across multi-step reasoning problems — not merely a stylistic choice:
1. Benchmarks challenging multi-step logic problems (Spatial Navigation, Relational Logic,
   Temporal Scheduling, Inventory State Tracking, and Truth-Tellers Logic Puzzle).
2. Runs two prompt strategies N times per problem:
   - Direct: "Answer in one short sentence only. Do not show any working or reasoning."
   - CoT: "Think step by step. Show each step of your reasoning clearly, then state your final answer."
3. Scores every response, aggregates accuracy and latency distributions across all runs,
   and displays a side-by-side comparison table.

IMPORTANT: use a NON-reasoning model (e.g. gpt-4o-mini). Reasoning models
think internally even when told not to show working, which erases the gap
this prototype exists to measure.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 01_cot_vs_direct .
    docker run --rm --env-file .env 01_cot_vs_direct
"""

import os
import textwrap
import time

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

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

# ---------------------------------------------------------------------------
# Benchmark Dataset & Input Options
# ---------------------------------------------------------------------------

# 2. Inputs - number of runs per problem and problem test suite
#    Uncomment another option below to test different scenarios:

# Runs per problem
RUNS_PER_PROBLEM = 8
# RUNS_PER_PROBLEM = 2  # Fast test run
# RUNS_PER_PROBLEM = 5  # Medium benchmark run

# Number of trailing lines considered "final answer"
TAIL_LINES = 1

# Set True to inspect prompt/response exchanges in Rich panels
SHOW_EXCHANGES = False

# Option 1: Full benchmark problem suite (default)
PROBLEMS = [
    {
        "title": "Spatial Navigation (Grid)",
        "question": (
            "Start at origin (0,0) facing North (+Y direction). "
            "Move forward 3 units. Turn right 90 degrees. Move forward 2 units. "
            "Turn right 90 degrees. Move forward 5 units. "
            "Turn left 90 degrees. Move backward 2 units. "
            "What are your exact final (X,Y) coordinates? Format as (X, Y)."
        ),
        "correct_answers": ["(0, -2)", "(0,-2)"],
        "wrong_answer": "(4, -2) or (2, 2) (loses track of current heading before moving)",
        "explanation": "Start(0,0) N -> Fwd 3 to (0,3). Right to E -> Fwd 2 to (2,3). Right to S -> Fwd 5 to (2,-2). Left to E -> Back 2 (moving West) to (0,-2).",
    },
    {
        "title": "Relational Logic (Family Tree)",
        "question": (
            "Alice is the sister of Bob. Bob is the father of Charlie. "
            "Charlie is the brother of Diana. Diana is the mother of Eve. "
            "What is the exact biological relationship of Alice to Eve?"
        ),
        "correct_answers": ["great-aunt", "great aunt", "grand-aunt", "grand aunt"],
        "wrong_answer": "Aunt or Grandmother (skips a generational layer)",
        "explanation": "Bob is Diana's father. Alice is Bob's sister, making her Diana's aunt. Diana is Eve's mother, making Alice Eve's great-aunt.",
    },
    {
        "title": "Temporal Scheduling",
        "question": (
            "Five speakers (A, B, C, D, E) present one after another. "
            "E must speak exactly third. B must speak immediately after D. "
            "D cannot be the first speaker. C must speak at some point before A. "
            "What is the exact sequence of the 5 speakers from first to last? Format as a comma-separated list."
        ),
        "correct_answers": ["c, a, e, d, b", "c,a,e,d,b"],
        "wrong_answer": "C, D, B, E, A (violates E being third or D being first)",
        "explanation": "E is 3rd (_ _ E _ _). DB is a block, can't be 1-2 (D not 1st), so must be 4-5 (_ _ E D B). C before A fills 1 and 2 (C A E D B).",
    },
    {
        "title": "Inventory State Tracking",
        "question": (
            "An empty box is given to you. You put in an Apple, a Banana, and a Carrot. "
            "You remove the Apple and add a Date. You remove the Carrot and put the Apple back in. "
            "You swap the Banana for an Eggplant. Finally, you take out the Date. "
            "List exactly the items currently in the box."
        ),
        "correct_answers": [
            "apple, eggplant",
            "eggplant, apple",
            "apple and eggplant",
            "eggplant and apple",
        ],
        "wrong_answer": "Apple, Banana, Date (fails to apply all state changes sequentially)",
        "explanation": "Add A,B,C -> [A,B,C]. Rem A, Add D -> [B,C,D]. Rem C, Add A -> [A,B,D]. Swap B for E -> [A,D,E]. Rem D -> [A,E].",
    },
    {
        "title": "Logic Puzzle (Truth-Tellers)",
        "question": (
            "There are three boxes: X, Y, and Z. Exactly one contains a diamond. "
            "Box X says: 'The diamond is in Box Y.' "
            "Box Y says: 'The diamond is not in Box Y.' "
            "Box Z says: 'The diamond is not in Box X.' "
            "Exactly one box's statement is true. Which box contains the diamond? "
            "Answer with the exact phrase 'Box X', 'Box Y', or 'Box Z'."
        ),
        "correct_answers": ["box x"],
        "wrong_answer": "Box Y or Z (fails to evaluate the statements against all possible states)",
        "explanation": "If the diamond is in X: X is false, Y is true, Z is false. This yields exactly one true statement, satisfying the condition.",
    },
]

# Option 2: Single problem test - Spatial navigation
# PROBLEMS = [
#     {
#         "title": "Spatial Navigation (Grid)",
#         "question": (
#             "Start at origin (0,0) facing North (+Y direction). "
#             "Move forward 3 units. Turn right 90 degrees. Move forward 2 units. "
#             "Turn right 90 degrees. Move forward 5 units. "
#             "Turn left 90 degrees. Move backward 2 units. "
#             "What are your exact final (X,Y) coordinates? Format as (X, Y)."
#         ),
#         "correct_answers": ["(0, -2)", "(0,-2)"],
#         "wrong_answer": "(4, -2) or (2, 2)",
#         "explanation": "Start(0,0) N -> Fwd 3 to (0,3). Right to E -> Fwd 2 to (2,3). Right to S -> Fwd 5 to (2,-2). Left to E -> Back 2 (moving West) to (0,-2).",
#     }
# ]

# Option 3: Single problem test - Relational logic (Family Tree)
# PROBLEMS = [
#     {
#         "title": "Relational Logic (Family Tree)",
#         "question": (
#             "Alice is the sister of Bob. Bob is the father of Charlie. "
#             "Charlie is the brother of Diana. Diana is the mother of Eve. "
#             "What is the exact biological relationship of Alice to Eve?"
#         ),
#         "correct_answers": ["great-aunt", "great aunt", "grand-aunt", "grand aunt"],
#         "wrong_answer": "Aunt or Grandmother",
#         "explanation": "Bob is Diana's father. Alice is Bob's sister, making her Diana's aunt. Diana is Eve's mother, making Alice Eve's great-aunt.",
#     }
# ]

# ---------------------------------------------------------------------------
# Helper & Scoring Functions
# ---------------------------------------------------------------------------

_client = None


def get_client() -> OpenAI:
    """Returns a module-level OpenAI client, creating it on first use."""
    global _client
    # ① Lazily initialize the OpenAI client and verify that OPENAI_API_KEY is configured
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            console.print("[bold red]Error:[/bold red] OPENAI_API_KEY not set.")
            raise SystemExit(1)
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        _client = OpenAI(api_key=api_key, base_url=base_url)
    return _client


def direct_prompt(question: str) -> str:
    """Returns a prompt requesting a direct answer without reasoning."""
    # ① Construct a constrained prompt that forbids intermediate reasoning steps
    return (
        f"{question}\n\n"
        "Answer in one short sentence only. Do not show any working or reasoning."
    )


def cot_prompt(question: str) -> str:
    """Returns a prompt requesting step-by-step reasoning (Chain-of-Thought)."""
    # ① Construct a Chain-of-Thought prompt requesting explicit step-by-step working
    return (
        f"{question}\n\n"
        "Think step by step. Show each step of your reasoning clearly, "
        "then state your final answer on the last line."
    )


def ask(prompt: str) -> str:
    """Sends a prompt to the model and returns the verbatim response text."""
    # ① Optionally render the input prompt panel when SHOW_EXCHANGES is enabled
    if SHOW_EXCHANGES:
        console.print(
            Panel(
                Group(
                    Text.assemble(("USER: ", "bold blue"), (prompt, "blue")),
                    Rule(style="bright_black"),
                ),
                title="[bold bright_black]Model Input[/bold bright_black]",
                border_style="bright_black",
                padding=(1, 2),
            )
        )

    # ② Send the chat completion request to the configured model
    try:
        response = get_client().chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=TEMPERATURE,
        )
        response_text = response.choices[0].message.content.strip()
    except Exception as e:
        response_text = f"Error: {e}"

    # ③ Optionally render the model response panel when SHOW_EXCHANGES is enabled
    if SHOW_EXCHANGES:
        wrapped_response = textwrap.fill(
            response_text, width=82, subsequent_indent="           "
        )
        console.print(
            Panel(
                Text.assemble(
                    ("ASSISTANT: ", "bold green"), (wrapped_response, "italic")
                ),
                title="[bold bright_black]Model Response[/bold bright_black]",
                border_style="bright_black",
                padding=(1, 2),
                highlight=False,
            )
        )
        console.print()

    return response_text


def is_correct(response: str, correct_answers: list[str]) -> bool:
    """Check whether the model's FINAL answer matches an accepted answer."""
    # ① Reject error responses or empty outputs immediately
    if response.startswith("Error:"):
        return False

    lines = [ln.strip() for ln in response.splitlines() if ln.strip()]
    if not lines:
        return False

    # ② Check whether any accepted answer appears in the trailing TAIL_LINES of the response
    tail = " ".join(lines[-TAIL_LINES:]).lower()
    for ans in correct_answers:
        if ans.lower() in tail:
            return True
    return False


# ---------------------------------------------------------------------------
# Terminal Rendering & Visualization
# ---------------------------------------------------------------------------


def run_strategy(prompt_fn, strategy_name: str, problem: dict):
    """Runs one strategy across RUNS_PER_PROBLEM iterations."""
    # ① Build the strategy-specific prompt for the current reasoning problem
    prompt = prompt_fn(problem["question"])
    results: list[bool] = []
    latencies: list[float] = []

    # ② Execute RUNS_PER_PROBLEM independent trials and record accuracy and latency
    for i in range(1, RUNS_PER_PROBLEM + 1):
        t0 = time.time()
        resp = ask(prompt)
        dt = time.time() - t0
        ok = is_correct(resp, problem["correct_answers"])
        results.append(ok)
        latencies.append(dt)

        # ③ Print per-run status indicator, latency, and extracted tail line
        dot = "[green]o[/green]" if ok else "[red]x[/red]"
        scored_on = " ".join(
            [ln for ln in resp.splitlines() if ln.strip()][-TAIL_LINES:]
        )
        console.print(
            f"  [dim]Run #{i:02d}:[/dim] {dot}  [dim]{dt:4.1f}s | scored on: '{scored_on[:45]}'[/dim]",
            highlight=False,
        )

    return results, latencies


def accuracy_bar(correct: int, total: int, width: int = 16) -> Text:
    """Renders a text progress bar coloured by accuracy."""
    # ① Compute success ratio and render a color-coded Unicode block progress bar
    pct = correct / total if total else 0
    filled = round(pct * width)
    bar = "█" * filled + "░" * (width - filled)
    color = "green" if pct >= 0.75 else "yellow" if pct >= 0.4 else "red"
    return Text(f"{bar} {pct * 100:3.0f}%", style=color)


# ---------------------------------------------------------------------------
# Benchmark Execution Loop
# ---------------------------------------------------------------------------


def run_demo():
    """Runs the full CoT vs Direct comparison benchmark."""
    # ① Initialize OpenAI client and display the benchmark overview panel
    get_client()

    console.print(
        Panel.fit(
            "[bold yellow]Chain-of-Thought vs. Direct Answer[/bold yellow]\n"
            "[dim]Measuring CoT as a reliability lever across multi-step reasoning problems.[/dim]\n"
            f"[dim]Model: {MODEL_NAME} | temperature: {TEMPERATURE} | {RUNS_PER_PROBLEM} runs per problem[/dim]",
            border_style="yellow",
        )
    )
    console.print()

    summary: list[dict] = []

    # ② Iterate through each reasoning problem and run both Direct and CoT strategies
    for i, problem in enumerate(PROBLEMS, start=1):
        console.print(
            Rule(
                f"[bold]Problem {i} / {len(PROBLEMS)}: {problem['title']}[/bold]",
                style="white",
            )
        )
        console.print(f"[bold]Q:[/bold] {problem['question']}")
        console.print(
            f"[bold]Correct answer:[/bold] [green]{problem['correct_answers'][0]}[/green]"
        )
        console.print(
            f"[bold]Common wrong answer:[/bold] [red]{problem['wrong_answer']}[/red]"
        )
        console.print(f"[dim]{problem['explanation']}[/dim]\n")

        # ③ Run Direct prompt trials and Chain-of-Thought prompt trials
        console.print(
            "[bold cyan]-- Direct prompts --------------------------[/bold cyan]"
        )
        direct_results, direct_times = run_strategy(direct_prompt, "Direct", problem)
        console.print()

        console.print(
            "[bold magenta]-- Chain-of-Thought prompts -----------------[/bold magenta]"
        )
        cot_results, cot_times = run_strategy(cot_prompt, "CoT   ", problem)
        console.print()

        # ④ Compute per-problem accuracy and latency averages and display comparison table
        direct_acc = sum(direct_results)
        cot_acc = sum(cot_results)
        direct_avg_t = sum(direct_times) / len(direct_times)
        cot_avg_t = sum(cot_times) / len(cot_times)

        table = Table(
            show_header=True, header_style="bold", padding=(0, 2), show_edge=False
        )
        table.add_column("Strategy", width=10)
        table.add_column("Score", width=6, justify="center")
        table.add_column("Avg Time", width=10, justify="right")
        table.add_column("Distribution (filled = correct)")

        table.add_row(
            "[cyan]Direct[/cyan]",
            f"{direct_acc}/{RUNS_PER_PROBLEM}",
            f"{direct_avg_t:.2f}s",
            accuracy_bar(direct_acc, RUNS_PER_PROBLEM),
        )
        table.add_row(
            "[magenta]CoT[/magenta]",
            f"{cot_acc}/{RUNS_PER_PROBLEM}",
            f"{cot_avg_t:.2f}s",
            accuracy_bar(cot_acc, RUNS_PER_PROBLEM),
        )

        console.print(table)
        console.print()

        summary.append(
            {
                "title": problem["title"],
                "direct": direct_acc,
                "cot": cot_acc,
                "direct_t": direct_avg_t,
                "cot_t": cot_avg_t,
            }
        )

    # ⑤ Build and render the overall cross-problem summary table and CoT accuracy lift
    console.print(Rule("[bold yellow]Overall Summary[/bold yellow]", style="yellow"))

    total_runs = RUNS_PER_PROBLEM * len(PROBLEMS)
    summary_table = Table(
        show_header=True, header_style="bold", padding=(0, 2), show_edge=False
    )
    summary_table.add_column("Problem", min_width=24)
    summary_table.add_column("Direct", justify="center")
    summary_table.add_column("CoT", justify="center")
    summary_table.add_column("Avg T (D/C)", justify="center")
    summary_table.add_column("CoT lift", justify="center")
    summary_table.add_column("Distribution")

    total_direct = total_cot = 0
    total_direct_t = total_cot_t = 0.0
    for row in summary:
        lift = row["cot"] - row["direct"]
        if lift > 0:
            lift_str = f"[green]+{lift}[/green]"
        elif lift < 0:
            lift_str = f"[red]{lift}[/red]"
        else:
            lift_str = "[dim]+/-0[/dim]"

        d_bar = "█" * row["direct"] + "░" * (RUNS_PER_PROBLEM - row["direct"])
        c_bar = "█" * row["cot"] + "░" * (RUNS_PER_PROBLEM - row["cot"])
        dist = Text()
        dist.append(f"D:{d_bar}", style="cyan")
        dist.append("  ")
        dist.append(f"C:{c_bar}", style="magenta")

        summary_table.add_row(
            row["title"],
            f"{row['direct']}/{RUNS_PER_PROBLEM}",
            f"{row['cot']}/{RUNS_PER_PROBLEM}",
            f"{row['direct_t']:.1f}s / {row['cot_t']:.1f}s",
            lift_str,
            dist,
        )
        total_direct += row["direct"]
        total_cot += row["cot"]
        total_direct_t += row["direct_t"]
        total_cot_t += row["cot_t"]

    summary_table.add_section()
    total_lift = total_cot - total_direct
    lift_color = "green" if total_lift > 0 else "red" if total_lift < 0 else "dim"
    avg_direct_t = total_direct_t / len(PROBLEMS)
    avg_cot_t = total_cot_t / len(PROBLEMS)

    summary_table.add_row(
        "[bold]TOTAL / AVG[/bold]",
        f"[bold]{total_direct}/{total_runs}[/bold]",
        f"[bold]{total_cot}/{total_runs}[/bold]",
        f"[bold]{avg_direct_t:.1f}s / {avg_cot_t:.1f}s[/bold]",
        f"[bold {lift_color}]{'+' if total_lift > 0 else ''}{total_lift}[/bold {lift_color}]",
        "",
    )

    console.print(summary_table)
    console.print()

    # ⑥ Report final accuracy gain vs latency overhead trade-off
    accuracy_gain = (total_cot - total_direct) / total_runs * 100
    latency_cost = (avg_cot_t / avg_direct_t - 1) * 100 if avg_direct_t else 0
    console.print(
        f"[bold]Trade-off:[/bold] CoT bought "
        f"[green]{accuracy_gain:+.1f}pp accuracy[/green] for "
        f"[yellow]{latency_cost:+.0f}% latency[/yellow]."
    )
    console.print()


# ---------------------------------------------------------------------------
# Standalone CLI Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    run_demo()

