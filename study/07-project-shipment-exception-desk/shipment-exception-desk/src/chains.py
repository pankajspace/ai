"""LangChain chains for Northwind Logistics Shipment Exception Desk.

Implements the standard prompt | model | parser chain pattern for:
1. classify_chain: Categorizes exception reports into delayed, damaged, lost, or unknown.
2. escalate_chain: Drafts internal escalation notes for managers.
3. draft_email_chain: Drafts customer resolution emails for auto-resolved claims.
"""

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda

try:
    from .llm import llm
except ImportError:
    from llm import llm


# --- 1. Classification Chain ---
_classify_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert logistics triage classifier at Northwind Logistics.\n"
            "Given an incoming customer exception report, classify it into EXACTLY one category:\n"
            "- delayed: shipment was late, held up, stuck at a hub, or missed delivery deadline.\n"
            "- damaged: package or contents arrived broken, crushed, leaking, cracked, or ruined.\n"
            "- lost: package marked delivered but missing, lost in transit, or untraceable by carrier.\n"
            "- unknown: report is garbled, unreadable, meaningless gibberish, or cannot be reliably determined.\n\n"
            "Respond with ONLY one lowercase word: delayed, damaged, lost, or unknown.",
        ),
        (
            "human",
            "Exception Report:\n{report_text}\n\nCategory:",
        ),
    ]
)


def _clean_category(raw_output: str) -> str:
    """Normalize and validate the classification output."""
    cleaned = raw_output.strip().lower().replace('"', "").replace("'", "")
    # Check for known categories in the output
    for cat in ["delayed", "damaged", "lost", "unknown"]:
        if cat in cleaned:
            return cat
    return "unknown"


classify_chain = (
    _classify_prompt
    | llm
    | StrOutputParser()
    | RunnableLambda(_clean_category)
)


# --- 2. Escalation Chain ---
_escalate_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a logistics operations analyst at Northwind Logistics.\n"
            "Draft a concise, professional internal escalation briefing to an Operations Manager.\n"
            "The briefing must include:\n"
            "- Subject line: [ESCALATION REQUIRED] followed by Category and Tier\n"
            "- Incident Summary\n"
            "- Customer Tier & Value at Risk\n"
            "- Compensation Calculated\n"
            "- Escalation Trigger / Reason\n"
            "- Recommended Operational Action",
        ),
        (
            "human",
            "Customer Tier: {customer_tier}\n"
            "Shipment Value: ${shipment_value}\n"
            "Category: {category}\n"
            "Calculated Compensation: ${compensation_amount}\n"
            "Escalation Reason: {escalation_reason}\n\n"
            "Customer Report:\n{report_text}\n\n"
            "Draft Internal Escalation Briefing:",
        ),
    ]
)

escalate_chain = _escalate_prompt | llm | StrOutputParser()


# --- 3. Draft Email Chain ---
_draft_email_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a Senior Customer Care Specialist at Northwind Logistics.\n"
            "Draft an empathetic, professional resolution email to the customer regarding their shipment exception.\n"
            "Guidelines:\n"
            "- Acknowledge the issue ({category}) and apologize sincerely for the inconvenience.\n"
            "- Clearly state the approved compensation of ${compensation_amount} under our Northwind Guarantee.\n"
            "- Mention that credit will reflect within 2-3 business days.\n"
            "- Maintain an empathetic, helpful tone.\n"
            "- Sign off as: 'Northwind Logistics Customer Care Team'.",
        ),
        (
            "human",
            "Customer Tier: {customer_tier}\n"
            "Shipment Value: ${shipment_value}\n"
            "Category: {category}\n"
            "Approved Compensation: ${compensation_amount}\n"
            "Compensation Reason: {compensation_reason}\n\n"
            "Customer Report:\n{report_text}\n\n"
            "Draft Customer Resolution Email:",
        ),
    ]
)

draft_email_chain = _draft_email_prompt | llm | StrOutputParser()

