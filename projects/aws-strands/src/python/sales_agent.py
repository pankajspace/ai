"""Module 2 demo — multi-tool planning: a sales report agent.

"Pull last quarter's sales data and email a summary to the team" is three
tasks: query, analyse, send. The agent is given three small, single-purpose
tools and works out the order itself — that is planning.
"""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel

from config import MODEL_ID, agent_text


@tool
def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}


@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    avg_deal = revenue / deals
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    return f"Email sent to {to}"


def report(question: str) -> str:
    """Answer a sales request, letting the agent chain its three tools."""
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[get_sales_data, analyze_sales, send_email],
        callback_handler=None,
    )
    return agent_text(agent(question))
