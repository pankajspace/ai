"""Capstone Travel Assistant Agent Service.

Demonstrates comprehensive multi-step autonomous planning:
1. Custom domain tools plus one prebuilt tool:
   - `get_weather_forecast(city, days)`
   - `suggest_packing_list(high_c, low_c, days, conditions)`
   - `estimate_trip_cost(city, days, travellers)`
   - `calculator` (prebuilt from `strands_tools`)
2. The agentic loop feeds the weather forecast into packing recommendations,
   estimates stay, food and travel costs, and checks them against the traveller's budget.
"""

import os

from dotenv import find_dotenv, load_dotenv
from pydantic import BaseModel
from strands import Agent, tool
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

# ① Load AWS credentials and Bedrock configuration from .env
load_dotenv(find_dotenv())


class TravelAssistantRequest(BaseModel):
    """Input payload for Travel Assistant Agent."""

    query: str = (
        "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. "
        "What should I pack, and does it fit my budget?"
    )


class TravelAssistantResponse(BaseModel):
    """Output payload from Travel Assistant Agent."""

    query: str
    response: str
    workflow_steps: list[str]


# ② Resolve the target Bedrock model identifier
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


@tool
def get_weather_forecast(city: str, days: int) -> dict:
    """Get the weather forecast for a city over a number of days.

    Args:
        city: Destination city name (e.g., "Goa", "Bangalore")
        days: Number of days in the trip
    """
    # Look up destination weather forecast in the mock catalog (or fall back to moderate defaults)
    forecasts = {
        "goa":       {"high_c": 32, "low_c": 26, "conditions": "humid, occasional showers"},
        "bangalore": {"high_c": 27, "low_c": 18, "conditions": "mild, light evening rain"},
        "jaipur":    {"high_c": 38, "low_c": 25, "conditions": "hot and dry"},
        "manali":    {"high_c": 14, "low_c": 3,  "conditions": "cold, chance of snow"},
    }
    data = forecasts.get(city.lower(), {"high_c": 28, "low_c": 20, "conditions": "moderate"})
    return {"city": city, "days": days, **data}


@tool
def suggest_packing_list(high_c: int, low_c: int, days: int, conditions: str) -> list:
    """Suggest what to pack based on temperatures, trip length and conditions.

    Args:
        high_c: Daytime high in Celsius
        low_c: Night-time low in Celsius
        days: Number of days in the trip
        conditions: Short description of expected weather
    """
    # Start with base clothing, toiletries, and electronics for the trip duration
    items = [f"{days + 1} sets of clothes", "toiletries", "phone charger"]

    # Append temperature- and weather-condition-specific gear
    if high_c >= 30:
        items += ["light cotton clothing", "sunscreen", "sunglasses", "reusable water bottle"]
    if low_c <= 15:
        items += ["warm jacket", "thermal layer"]
    elif low_c <= 22:
        items += ["light jacket for evenings"]
    if "rain" in conditions.lower() or "shower" in conditions.lower():
        items += ["compact umbrella", "quick-dry footwear"]
    if "snow" in conditions.lower():
        items += ["gloves", "woollen cap", "waterproof boots"]

    return items


@tool
def estimate_trip_cost(city: str, days: int, travellers: int = 1) -> dict:
    """Estimate the cost of a trip in Indian rupees.

    Args:
        city: Destination city
        days: Number of days
        travellers: Number of people travelling (default: 1)
    """
    # Calculate accommodation, food, and local transport costs in INR
    per_night = {"goa": 3500, "bangalore": 3000, "jaipur": 2500, "manali": 2800}
    stay = per_night.get(city.lower(), 3000) * days
    food = 1200 * days * travellers
    local_travel = 800 * days
    total = stay + food + local_travel

    # Return itemized and total estimated trip cost breakdown
    return {
        "city": city,
        "days": days,
        "travellers": travellers,
        "stay_inr": stay,
        "food_inr": food,
        "local_travel_inr": local_travel,
        "total_inr": total,
    }


def run_travel_assistant_agent(query: str) -> dict:
    """Run the Capstone Travel Assistant Agent."""
    # ③ Initialize the Travel Assistant Agent with custom tools, calculator, and system prompt
    agent = Agent(
        model=BedrockModel(model_id=model_id),
        tools=[get_weather_forecast, suggest_packing_list, estimate_trip_cost, calculator],
        system_prompt=(
            "You are a practical travel assistant. "
            "When asked about a trip: check the weather first, then suggest what to pack "
            "based on that weather, then estimate the cost. "
            "Always say whether the trip fits the user's budget, and keep advice concise."
        ),
    )

    # ④ Run the multi-step planning loop (weather -> packing -> cost -> budget check)
    response = agent(query)

    # ⑤ Collect the tool calls in the order the agent made them
    tool_calls = [
        f"{block['toolUse']['name']}({block['toolUse']['input']})"
        for message in agent.messages
        for block in message["content"]
        if "toolUse" in block
    ]

    return {"query": query, "response": str(response), "workflow_steps": tool_calls}

