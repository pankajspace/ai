"""Capstone Travel Assistant Agent Service.

Demonstrates comprehensive multi-step autonomous planning:
1. Custom domain tools:
   - `get_weather_forecast(city, days)`
   - `suggest_packing_list(city, weather, days)`
   - `calculate_trip_cost(destination, days, travelers)`
   - `calculator(expression)`
2. The agentic loop automatically feeds weather forecast into packing recommendations,
   calculates accommodation and travel costs, and evaluates against the traveler's budget.
3. Provides complete structured travel itinerary and budget validation.

Run directly:
    python projects/ai-projects/server/services/22_travel_assistant.py
"""

import json
import math
import os
import re
from typing import Any, Dict, List
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(find_dotenv())


class TravelAssistantRequest(BaseModel):
    """Input payload for Travel Assistant Agent."""

    query: str = Field(
        default="I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. What should I pack, and does it fit my budget?",
        description="Natural language trip planning query with destination, duration, companions, and budget",
    )


class TravelAssistantResponse(BaseModel):
    """Output payload from Travel Assistant Agent."""

    query: str
    response: str
    workflow_steps: List[str]
    itinerary_data: Dict[str, Any]
    provider: str


CITY_WEATHER = {
    "goa": {"temp": "31°C", "condition": "Sunny & Humid", "rain_chance": "10%"},
    "manali": {"temp": "12°C", "condition": "Cold & Breezy", "rain_chance": "25%"},
    "bangalore": {"temp": "24°C", "condition": "Pleasant & Cloudy", "rain_chance": "40%"},
    "jaipur": {"temp": "34°C", "condition": "Dry & Hot", "rain_chance": "5%"},
}

BASE_COSTS_PER_PERSON_PER_DAY = {
    "goa": 2500,
    "manali": 2000,
    "bangalore": 3000,
    "jaipur": 2200,
}


def get_weather_forecast(city: str, days: int = 3) -> dict:
    """Retrieve weather forecast for a target destination."""
    # ① Look up destination weather forecast or fall back to mild sunny defaults
    c = city.lower().strip()
    w = CITY_WEATHER.get(c, {"temp": "26°C", "condition": "Mild & Sunny", "rain_chance": "15%"})
    return {"city": city.title(), "days": days, **w}


def suggest_packing_list(city: str, weather_condition: str, days: int = 3) -> list:
    """Generate recommended items to pack based on weather conditions."""
    # ① Start with base travel essentials and append weather-specific gear
    cond = weather_condition.lower()
    items = ["ID and Travel Documents", "Personal Toiletries", "Phone Charger & Power Bank"]
    if "cold" in cond or "breezy" in cond:
        items.extend(["Thermal Jacket", "Woolen Socks", "Gloves", "Moisturizer"])
    elif "sunny" in cond or "hot" in cond:
        items.extend(["Sunscreen (SPF 50+)", "UV Sunglasses", "Light Cotton Clothes", "Sun Hat", "Swimwear"])
    if "rain" in cond or "cloudy" in cond:
        items.extend(["Compact Umbrella", "Waterproof Bag Cover"])
    return items


def calculate_trip_cost(destination: str, days: int, num_travelers: int = 1) -> dict:
    """Calculate estimated total cost in INR."""
    # ① Multiply daily per-person rate by duration and total travelers
    dest = destination.lower().strip()
    daily_rate = BASE_COSTS_PER_PERSON_PER_DAY.get(dest, 2500)
    total = daily_rate * days * num_travelers
    return {
        "destination": destination.title(),
        "days": days,
        "travelers": num_travelers,
        "daily_rate_per_person": daily_rate,
        "total_estimated_cost_inr": total,
    }


def run_travel_assistant_agent(
    query: str = "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. What should I pack, and does it fit my budget?",
) -> dict:
    """Run the capstone travel assistant agent."""
    # ① Load AWS credentials and initialize workflow step and itinerary trackers
    aws_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    bedrock_model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

    workflow_steps = []
    itinerary_data = {}

    # ② Run Strands Capstone Agent on Bedrock if AWS credentials are configured
    if aws_key and aws_secret:
        try:
            from strands import Agent, tool
            from strands.models.bedrock import BedrockModel

            @tool
            def tool_weather(city: str, days: int) -> dict:
                """Retrieve weather forecast for a destination."""
                res = get_weather_forecast(city, days)
                workflow_steps.append(f"get_weather_forecast('{city}', {days}d) -> {res['condition']}")
                return res

            @tool
            def tool_packing(city: str, weather_condition: str, days: int) -> list:
                """Suggest items to pack based on weather."""
                res = suggest_packing_list(city, weather_condition, days)
                workflow_steps.append(f"suggest_packing_list(...) -> {len(res)} items")
                return res

            @tool
            def tool_cost(destination: str, days: int, num_travelers: int) -> dict:
                """Estimate total trip costs in INR."""
                res = calculate_trip_cost(destination, days, num_travelers)
                workflow_steps.append(f"calculate_trip_cost(...) -> ₹{res['total_estimated_cost_inr']:,}")
                return res

            agent = Agent(
                model=BedrockModel(model_id=bedrock_model_id),
                tools=[tool_weather, tool_packing, tool_cost],
                system_prompt="You are an expert travel assistant. Automatically check weather, suggest packing items, and calculate costs to verify against budget.",
            )
            res = agent(query)
            return {
                "query": query,
                "response": str(res),
                "workflow_steps": workflow_steps,
                "itinerary_data": itinerary_data,
                "provider": f"Strands Capstone + Bedrock ({bedrock_model_id})",
            }
        except Exception as exc:
            print(f"Bedrock travel assistant failed ({exc}), falling back to OpenAI")

    # ③ Configure OpenAI client and register the three travel planning tool schemas
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    )

    tools_schema = [
        {
            "type": "function",
            "function": {
                "name": "get_weather_forecast",
                "description": "Fetch weather forecast (temp, condition, rain chance) for a destination city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "City name (e.g. Goa, Manali, Jaipur)"},
                        "days": {"type": "integer", "description": "Trip duration in days"},
                    },
                    "required": ["city"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "suggest_packing_list",
                "description": "Generate recommended packing list based on the destination's weather forecast.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"},
                        "weather_condition": {"type": "string", "description": "Condition e.g. 'Sunny', 'Cold'"},
                        "days": {"type": "integer"},
                    },
                    "required": ["city", "weather_condition"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_trip_cost",
                "description": "Calculate estimated trip budget/cost in INR.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "destination": {"type": "string"},
                        "days": {"type": "integer"},
                        "num_travelers": {"type": "integer", "description": "Total persons traveling"},
                    },
                    "required": ["destination", "days", "num_travelers"],
                },
            },
        },
    ]

    messages = [
        {
            "role": "system",
            "content": "You are a comprehensive travel concierge agent. Chain weather -> packing -> cost estimation tools to deliver a complete travel plan.",
        },
        {"role": "user", "content": query},
    ]

    # ④ Execute the multi-step planning loop: weather forecast -> packing list -> cost vs budget
    for _ in range(6):
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            tools=tools_schema,
            tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)

        if not msg.tool_calls:
            return {
                "query": query,
                "response": msg.content or "",
                "workflow_steps": workflow_steps,
                "itinerary_data": itinerary_data,
                "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')} (Capstone Planner)",
            }

        for tc in msg.tool_calls:
            fname = tc.function.name
            args = json.loads(tc.function.arguments or "{}")
            if fname == "get_weather_forecast":
                w_out = get_weather_forecast(args.get("city", "Goa"), args.get("days", 3))
                itinerary_data["weather"] = w_out
                workflow_steps.append(f"get_weather_forecast('{w_out['city']}') -> {w_out['condition']}, {w_out['temp']}")
                content = json.dumps(w_out)
            elif fname == "suggest_packing_list":
                p_out = suggest_packing_list(args.get("city", "Goa"), args.get("weather_condition", "Sunny"), args.get("days", 3))
                itinerary_data["packing"] = p_out
                workflow_steps.append(f"suggest_packing_list(...) -> {len(p_out)} suggested items")
                content = json.dumps(p_out)
            elif fname == "calculate_trip_cost":
                c_out = calculate_trip_cost(args.get("destination", "Goa"), args.get("days", 3), args.get("num_travelers", 3))
                itinerary_data["cost"] = c_out
                workflow_steps.append(f"calculate_trip_cost(...) -> ₹{c_out['total_estimated_cost_inr']:,}")
                content = json.dumps(c_out)
            else:
                content = f"Unknown tool {fname}"

            messages.append({"role": "tool", "tool_call_id": tc.id, "content": content})

    return {
        "query": query,
        "response": messages[-1].get("content", ""),
        "workflow_steps": workflow_steps,
        "itinerary_data": itinerary_data,
        "provider": f"OpenAI {os.getenv('OPENAI_MODEL', 'gpt-4o-mini')}",
    }


if __name__ == "__main__":
    out = run_travel_assistant_agent()
    print("Steps:", out["workflow_steps"])
    print("Response:", out["response"])

