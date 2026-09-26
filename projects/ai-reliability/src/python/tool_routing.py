"""Tool Schema Calibration: which part of a tool schema does the model route on?

Adapted from ``study/09-ai-reliability/tool-schema-calibration.py``. Three weather
tools are offered under a 2x2 of conditions (descriptive vs opaque names x
loose vs tight descriptions). ``tool_choice="required"`` forces a pick so
"which tool" is isolated from "whether to call a tool at all".

The web demo routes the visitor's own question under all four conditions, then
scores a fixed labelled sample to fill in the accuracy matrix.
"""

from config import CHAT_MODEL, bar, get_openai_client, parallel_map

TEMPERATURE = 0
MAX_QUERY_CHARS = 300

CANONICAL = ("current", "forecast", "history")

NAME_SETS = {
    "descriptive": {
        "current": "get_weather_current",
        "forecast": "get_weather_forecast",
        "history": "get_weather_history",
    },
    # plausible but uninformative - the shape real MCP servers often ship with
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

CONDITIONS = [
    ("A", "descriptive", "loose"),
    ("B", "descriptive", "tight"),
    ("C", "opaque", "loose"),
    ("D", "opaque", "tight"),
]

NAME_CHOICES = ("both", *NAME_SETS)
DESCRIPTION_CHOICES = ("both", *DESCRIPTION_SETS)

# A balanced subset of the study prototype's 50 labelled queries.
SAMPLE_QUERIES = [
    ("Is it raining in London at the moment?", "current"),
    ("Show me today's weather for NYC.", "current"),
    ("Check weather for Rome.", "current"),
    ("Weather update for Cape Town.", "current"),
    ("Will it rain next Tuesday in Paris?", "forecast"),
    ("Give me the 5-day forecast for Sydney.", "forecast"),
    ("Upcoming weather for Chicago.", "forecast"),
    ("Weather outlook for Seoul next month.", "forecast"),
    ("What was the weather like in London yesterday?", "history"),
    ("Weather records for Tokyo in 1990.", "history"),
    ("Last week's weather in Toronto.", "history"),
    ("Was it raining in Seoul three days ago?", "history"),
]


def build_condition(name_style: str, desc_style: str) -> tuple[list, dict]:
    """Return (tools, lookup) where lookup maps emitted names to canonical slots."""
    names = NAME_SETS[name_style]
    descs = DESCRIPTION_SETS[desc_style]
    tools = [
        {
            "type": "function",
            "function": {
                "name": names[c],
                "description": descs[c],
                "parameters": {
                    "type": "object",
                    "properties": {"location": {"type": "string", "description": "The city name."}},
                    "required": ["location"],
                },
            },
        }
        for c in CANONICAL
    ]
    return tools, {names[c]: c for c in CANONICAL}


def select_tool(query: str, name_style: str, desc_style: str) -> str:
    """Return the canonical slot the model routed to, '(no call)', or '(error)'."""
    tools, lookup = build_condition(name_style, desc_style)
    try:
        response = get_openai_client().chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": query}],
            tools=tools,
            tool_choice="required",
            temperature=TEMPERATURE,
        )
        calls = response.choices[0].message.tool_calls
        if not calls:
            return "(no call)"
        return lookup.get(calls[0].function.name, calls[0].function.name)
    except Exception:
        return "(error)"


def run_routing(query: str, names: str = "both", descriptions: str = "both") -> str:
    """Route ``query`` under the selected conditions and score the labelled sample."""
    query = query.strip()[:MAX_QUERY_CHARS]
    conditions = [
        c for c in CONDITIONS
        if names in ("both", c[1]) and descriptions in ("both", c[2])
    ]
    jobs = [(query, n, d) for _, n, d in conditions]
    jobs += [(q, n, d) for _, n, d in conditions for q, _ in SAMPLE_QUERIES]
    picks = parallel_map(lambda job: select_tool(*job), jobs)

    yours, sample = picks[: len(conditions)], picks[len(conditions):]
    total = len(SAMPLE_QUERIES)
    scores = {}
    for i, (label, _, _) in enumerate(conditions):
        chunk = sample[i * total:(i + 1) * total]
        scores[label] = sum(p == exp for p, (_, exp) in zip(chunk, SAMPLE_QUERIES))

    lines = [f"Your question · {CHAT_MODEL} · temperature {TEMPERATURE} · tool_choice=required"]
    for (label, n, d), pick in zip(conditions, yours):
        tool_name = NAME_SETS[n].get(pick, pick)
        lines.append(f"  {label} {n} names + {d} descs → {tool_name} ({pick})")

    lines += ["", f"Routing accuracy on {total} labelled queries"]
    for label, n, d in conditions:
        lines.append(f"  {label} {n:<11} + {d:<5}  {bar(scores[label], total)}")

    lifts = [
        ("Description lift with self-explanatory names", "B", "A"),
        ("Description lift with opaque names", "D", "C"),
        ("Name lift with vague descriptions", "A", "C"),
        ("Name lift with tight descriptions", "B", "D"),
    ]
    lift_lines = [
        f"{text}: {scores[hi] - scores[lo]:+d}" for text, hi, lo in lifts if hi in scores and lo in scores
    ]
    if lift_lines:
        lines += [""] + lift_lines

    lines.append("")
    if len(scores) < 4:
        lines.append("Tip: set both dropdowns to 'Both' for the full 2x2 and a verdict.")
        return "\n".join(lines)

    desc_lift_desc = scores["B"] - scores["A"]
    desc_lift_opaque = scores["D"] - scores["C"]
    if desc_lift_opaque > desc_lift_desc:
        lines.append(
            "Verdict: descriptions are load-bearing - but only when the names are not "
            "already doing the work. Rename tools generically and the description is the "
            "only signal left."
        )
    elif desc_lift_desc > 0 or desc_lift_opaque > 0:
        lines.append("Verdict: tightening descriptions improves routing regardless of naming.")
    else:
        lines.append(
            "Verdict: no measurable effect from descriptions on this sample - the model "
            "is saturating the task."
        )
    return "\n".join(lines)


if __name__ == "__main__":
    print(run_routing("Will it snow in Oslo this weekend?"))
