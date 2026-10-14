"""CAPSTONE PROJECT — Travel Assistant Agent.

This deliberately mirrors the travel-planner example from Module 1, so
you END where Module 1 BEGAN — but now you build it yourself.

It exercises every skill from both chapters:
  * custom tools (@tool + type hints + docstrings)
  * multiple tools that feed into each other
  * a pre-built community tool (calculator)
  * a system prompt
  * the agentic loop doing multi-step planning

WHAT TO WATCH: the agent calls get_weather_forecast FIRST, feeds those numbers
into suggest_packing_list, then prices the trip and compares to the budget.
Nobody wrote that sequence — the loop worked it out.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 12_travel_assistant .
    docker run --rm --env-file .env 12_travel_assistant
"""

import os
import sys

from dotenv import find_dotenv, load_dotenv
from strands import Agent, tool
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

# 1. Load AWS and Bedrock configuration from .env
load_dotenv(find_dotenv())

# 2. Inputs - travel questions; uncomment another line or edit to try different destinations & budgets
query = (
    "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. "
    "What should I pack, and does it fit my budget?"
)
# query = "I'm planning a 4-day solo trip to Manali with a budget of 15000 rupees. What should I pack and can I afford it?"
# query = "I'm going to Bangalore for 2 days with 1 colleague. Budget is 10000 rupees. Suggest packing list and calculate cost."
# query = "Family trip of 4 to Jaipur for 5 days with budget 50000 rupees. What are the weather, packing, and costs?"

# 3. Model configuration
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")


# 4. Custom tool definitions
@tool
def get_weather_forecast(city: str, days: int) -> dict:
    """Get the weather forecast for a city over a number of days.

    Args:
        city: Destination city name (e.g., "Goa", "Bangalore")
        days: Number of days in the trip
    """
    # Mock data — swap in a real weather API to take this further.
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
    items = [f"{days + 1} sets of clothes", "toiletries", "phone charger"]

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
    per_night = {"goa": 3500, "bangalore": 3000, "jaipur": 2500, "manali": 2800}
    stay = per_night.get(city.lower(), 3000) * days
    food = 1200 * days * travellers
    local_travel = 800 * days
    total = stay + food + local_travel

    return {
        "city": city,
        "days": days,
        "travellers": travellers,
        "stay_inr": stay,
        "food_inr": food,
        "local_travel_inr": local_travel,
        "total_inr": total,
    }


# 5. Initialize agent with tools and system prompt
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

if __name__ == "__main__":
    # Command line argument override if provided
    selected_query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else query

    print(f"\nQuestion: {selected_query}\n" + "-" * 60)
    response = agent(selected_query)
    print(response)
