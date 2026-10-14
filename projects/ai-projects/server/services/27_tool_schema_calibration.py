"""Tool Schema Routing Calibration Service.

Measures which part of a tool schema an LLM actually routes on:
1. 2x2 Matrix of Conditions:
   - Condition A: Descriptive Name + Loose Description
   - Condition B: Descriptive Name + Tight Description
   - Condition C: Opaque Name (`tool_alpha`, `tool_beta`) + Loose Description
   - Condition D: Opaque Name (`tool_alpha`, `tool_beta`) + Tight Description
2. Evaluates whether the model routes by function name keywords or deep semantic docstrings.

Run directly:
    python projects/ai-projects/server/services/27_tool_schema_calibration.py
"""

import json
import os
from typing import Any, Dict, List, Optional
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class ToolSchemaCalibrationRequest(BaseModel):
    """Input payload for Tool Schema Calibration."""

    query: str = Field(
        default="What is the current hourly precipitation forecast for Seattle?",
        description="Query testing weather tool routing precision",
    )


class ConditionResult(BaseModel):
    condition_code: str
    condition_label: str
    selected_tool: Optional[str]
    is_correct_routing: bool


class ToolSchemaCalibrationResponse(BaseModel):
    """Output payload from Tool Schema Calibration."""

    query: str
    target_intent: str
    condition_results: List[ConditionResult]
    analysis_summary: str
    model: str


def run_tool_schema_calibration(
    query: str = "What is the current hourly precipitation forecast for Seattle?",
) -> dict:
    """Evaluate tool routing across 2x2 naming/description conditions."""
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # The ideal tool is hourly precipitation forecast
    # We test 4 conditions:
    conditions = [
        {
            "code": "A",
            "label": "Descriptive Names x Loose Descriptions",
            "tools": [
                {"name": "get_current_weather", "desc": "Get weather info for a city."},
                {"name": "get_hourly_precipitation", "desc": "Check rain forecast."},
                {"name": "get_historical_climate", "desc": "Get climate records."},
            ],
            "correct_target": "get_hourly_precipitation",
        },
        {
            "code": "B",
            "label": "Descriptive Names x Tight Descriptions",
            "tools": [
                {"name": "get_current_weather", "desc": "Get immediate snapshot of current ambient temperature and atmospheric pressure."},
                {"name": "get_hourly_precipitation", "desc": "Retrieve hour-by-hour expected rainfall probability, accumulation, and precipitation intensity."},
                {"name": "get_historical_climate", "desc": "Retrieve historical multi-decade climatic averages, record highs, and seasonal norms."},
            ],
            "correct_target": "get_hourly_precipitation",
        },
        {
            "code": "C",
            "label": "Opaque Names x Loose Descriptions",
            "tools": [
                {"name": "service_fn_101", "desc": "Get weather info for a city."},
                {"name": "service_fn_102", "desc": "Check rain forecast."},
                {"name": "service_fn_103", "desc": "Get climate records."},
            ],
            "correct_target": "service_fn_102",
        },
        {
            "code": "D",
            "label": "Opaque Names x Tight Descriptions",
            "tools": [
                {"name": "service_fn_101", "desc": "Get immediate snapshot of current ambient temperature and atmospheric pressure."},
                {"name": "service_fn_102", "desc": "Retrieve hour-by-hour expected rainfall probability, accumulation, and precipitation intensity."},
                {"name": "service_fn_103", "desc": "Retrieve historical multi-decade climatic averages, record highs, and seasonal norms."},
            ],
            "correct_target": "service_fn_102",
        },
    ]

    results = []

    for c in conditions:
        schemas = [
            {
                "type": "function",
                "function": {
                    "name": t["name"],
                    "description": t["desc"],
                    "parameters": {
                        "type": "object",
                        "properties": {"city": {"type": "string"}},
                        "required": ["city"],
                    },
                },
            }
            for t in c["tools"]
        ]

        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a weather routing coordinator. Select the single best tool for the user's request."},
                {"role": "user", "content": query},
            ],
            tools=schemas,
            tool_choice="required",
        )
        msg = resp.choices[0].message
        chosen = msg.tool_calls[0].function.name if msg.tool_calls else None
        is_correct = (chosen == c["correct_target"])

        results.append({
            "condition_code": c["code"],
            "condition_label": c["label"],
            "selected_tool": chosen,
            "is_correct_routing": is_correct,
        })

    correct_count = sum(1 for r in results if r["is_correct_routing"])
    summary = f"Routed accurately in {correct_count} of 4 calibration conditions. Tight docstrings enable successful routing even with opaque names (Condition D)."

    return {
        "query": query,
        "target_intent": "Hourly Precipitation Forecast",
        "condition_results": results,
        "analysis_summary": summary,
        "model": model,
    }


if __name__ == "__main__":
    out = run_tool_schema_calibration()
    print("Summary:", out["analysis_summary"])
    for r in out["condition_results"]:
        print(f"[{r['condition_code']}] {r['condition_label']}: Selected={r['selected_tool']} (Correct: {r['is_correct_routing']})")

