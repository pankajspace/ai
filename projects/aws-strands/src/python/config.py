"""Shared configuration: load .env and expose Bedrock model settings.

Every feature module imports MODEL_ID from here, so if a model is retired you
change it ONCE in this file instead of editing each demo.

Credentials are read from the standard AWS environment variables
(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION) or, in
production, the EC2 instance role — boto3 (used by the Strands SDK) picks them
up automatically, so no key handling is needed in application code.
"""

import os

from dotenv import load_dotenv

# Read key=value pairs from the .env file and inject them into os.environ.
# Safe to call at import time — if no .env exists (e.g. in production where
# env vars are set directly), python-dotenv simply does nothing.
load_dotenv()

# Current, non-retired models (verified working).
# The "us." prefix is a cross-region inference profile — required on Bedrock.
NOVA_LITE = "us.amazon.nova-lite-v1:0"                   # default — Amazon's own, no use-case form, cheapest
HAIKU = "us.anthropic.claude-haiku-4-5-20251001-v1:0"    # Claude, fast + cheap (needs Anthropic use-case form)
SONNET = "us.anthropic.claude-sonnet-4-5-20250929-v1:0"  # Claude, stronger reasoning (needs Anthropic use-case form)

# Default used across the demos. Override with:  export MODEL_ID="..."
# Amazon Nova avoids the Anthropic "use case details" gating and is the cheapest option.
MODEL_ID = os.environ.get("MODEL_ID", NOVA_LITE)

REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")


def agent_text(response) -> str:
    """Extract the plain-text reply from a Strands agent response.

    Strands returns a rich result object; ``str(response)`` yields the final
    assistant text, which is what the browser needs.
    """
    return str(response).strip()
