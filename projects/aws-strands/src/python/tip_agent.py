"""Module 2 demo — a tool-enabled agent: the tip calculator.

The agent understands INTENT, not keywords: every phrasing of a tip question
routes to the same ``calculate_tip`` tool with no regex or intent classifier.
"""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


@tool
def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people.

    Args:
        bill_amount: Total bill amount in dollars
        tip_percentage: Tip percentage (e.g., 15, 18, 20)
        num_people: Number of people splitting the bill (default: 1)
    """
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / num_people
    return {
        "bill": bill_amount,
        "tip": round(tip, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2),
    }


def calculate(question: str) -> str:
    """Answer a natural-language tip question using the calculate_tip tool."""
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[calculate_tip],
        callback_handler=None,
    )
    return agent_text(agent(question))
