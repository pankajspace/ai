"""Module 3 (capstone) demo — a multi-tool Travel Assistant.

The agent chains three custom tools plus a pre-built calculator: it checks the
weather first, feeds those numbers into a packing list, then prices the trip
and compares it to the budget. Nobody wrote that sequence — the agentic loop
works it out.
"""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel
from strands_tools import calculator

from config import MODEL_ID, agent_text


@tool
def get_weather_forecast(city: str, days: int) -> dict:
    """Get the weather forecast for a city over a number of days.

    Args:
        city: Destination city name (e.g., "Goa", "Bangalore")
        days: Number of days in the trip
    """
    # ① use mock forecasts in place of a live weather api
    # Mock data — swap in a real weather API to take this further.
    forecasts = {
        "goa":       {"high_c": 32, "low_c": 26, "conditions": "humid, occasional showers"},
        "bangalore": {"high_c": 27, "low_c": 18, "conditions": "mild, light evening rain"},
        "jaipur":    {"high_c": 38, "low_c": 25, "conditions": "hot and dry"},
        "manali":    {"high_c": 14, "low_c": 3,  "conditions": "cold, chance of snow"},
    }
    # ② choose the requested city's forecast or a moderate default
    data = forecasts.get(city.lower(), {"high_c": 28, "low_c": 20, "conditions": "moderate"})
    # ③ return the forecast with the original city and trip length
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
    # ① start with essentials every trip needs
    items = [f"{days + 1} sets of clothes", "toiletries", "phone charger"]
    # ② add hot-weather items when daytime highs are high
    if high_c >= 30:  # hot-weather threshold
        items += ["light cotton clothing", "sunscreen", "sunglasses", "reusable water bottle"]
    # ③ add evening layers based on the expected low temperature
    if low_c <= 15:  # cold-night threshold
        items += ["warm jacket", "thermal layer"]
    elif low_c <= 22:  # mild-night threshold — lighter layer than the cold case above
        items += ["light jacket for evenings"]
    # ④ add rain gear by scanning the forecast wording for wet weather
    # Keyword match on the forecast text rather than a structured field — fragile
    # if get_weather_forecast's wording changes, but keeps the tool signature simple.
    if "rain" in conditions.lower() or "shower" in conditions.lower():
        items += ["compact umbrella", "quick-dry footwear"]
    # ⑤ add snow gear when the conditions mention snow
    if "snow" in conditions.lower():
        items += ["gloves", "woollen cap", "waterproof boots"]
    # ⑥ return the complete packing list for the agent to explain
    return items


@tool
def estimate_trip_cost(city: str, days: int, travellers: int = 1) -> dict:
    """Estimate the cost of a trip in Indian rupees.

    Args:
        city: Destination city
        days: Number of days
        travellers: Number of people travelling (default: 1)
    """
    # ① choose a per-night stay estimate for the destination
    per_night = {"goa": 3500, "bangalore": 3000, "jaipur": 2500, "manali": 2800}
    # ② calculate stay, food, and local travel costs
    stay = per_night.get(city.lower(), 3000) * days
    food = 1200 * days * travellers  # flat per-person, per-day food estimate (INR)
    local_travel = 800 * days  # flat per-day local transport estimate (INR), not per traveller
    # ③ add the cost categories into one trip total
    total = stay + food + local_travel
    # ④ return a structured cost breakdown for the agent
    return {
        "city": city,
        "days": days,
        "travellers": travellers,
        "stay_inr": stay,
        "food_inr": food,
        "local_travel_inr": local_travel,
        "total_inr": total,
    }


def plan(question: str) -> str:
    """Plan a trip end-to-end, letting the agent chain its tools as needed."""
    # ① create a travel agent with weather, packing, budget, and math tools
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[get_weather_forecast, suggest_packing_list, estimate_trip_cost, calculator],
        system_prompt=(
            "You are a practical travel assistant. "
            "When asked about a trip: check the weather first, then suggest what to pack "
            "based on that weather, then estimate the cost. "
            "Always say whether the trip fits the user's budget, and keep advice concise."
        ),
        callback_handler=None,
    )
    # ② send the trip request and return the agent's final itinerary advice
    return agent_text(agent(question))
