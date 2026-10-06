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
    # ① return mock quarter data as if it came from a sales system
    # Mock data — swap in a real CRM/warehouse query to take this further.
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}


@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    # ① compute the average deal size from revenue and deal count
    avg_deal = revenue / deals
    # ② format the metrics so the agent can include them in the answer
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    # ① return a mock delivery confirmation instead of sending real email
    # Mock send — no real email is dispatched; wire up an SMTP/SES client here.
    return f"Email sent to {to}"


def report(question: str) -> str:
    """Answer a sales request, letting the agent chain its three tools."""
    # ① create an agent with separate query, analysis, and email tools
    agent = Agent(
        model=BedrockModel(model_id=MODEL_ID),
        tools=[get_sales_data, analyze_sales, send_email],
        callback_handler=None,
    )
    # ② send the request and let the agent choose the tool sequence
    return agent_text(agent(question))
