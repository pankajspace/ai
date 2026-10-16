"""LangChain Text Summarizer - prompt | model | parser.

This script demonstrates prompt chaining using LangChain LCEL (LangChain Expression Language):
1. Loads API credentials and model configuration from environment variables (.env).
2. Defines sample input paragraphs to summarize.
3. Sets up a reusable ChatPromptTemplate with a `{data}` placeholder.
4. Chains `ChatPromptTemplate | ChatOpenAI | StrOutputParser` using the LCEL pipe operator (`|`).
5. Invokes the chain with input text to produce a concise, friendly summary.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_langchain_summarizer.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_langchain_summarizer
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load API keys and model names from .env
#   (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# Sample texts to summarize - pick one at the bottom of this section
TEXT_LANGCHAIN = (
    "Information about LangChain and its usage in building AI applications. "
    "We will explore how it simplifies the integration of language models into "
    "various applications. It provides a structured way to create prompts, manage "
    "outputs, and chain together multiple language model calls. This allows "
    "developers to build complex AI-driven workflows efficiently."
)
TEXT_DOCKER = (
    "Docker packages an application together with everything it needs to run - "
    "the code, the runtime, system libraries and settings - into a single image. "
    "That image runs the same way on a laptop, a test server or in the cloud, which "
    "removes the classic 'it works on my machine' problem. Containers start in "
    "seconds, use fewer resources than virtual machines, and many of them can run "
    "side by side on one host without interfering with each other."
)
TEXT_EMAIL = (
    "Hi team, a quick update on the release. QA found two blocking bugs in the "
    "checkout flow on Tuesday; both are now fixed and verified. Because of this "
    "the release moves from Thursday to Monday morning. Marketing has been told "
    "and will shift the announcement email. Please finish any open code reviews "
    "by Friday evening so we can freeze the branch over the weekend. Thanks!"
)

text = TEXT_LANGCHAIN
# text = TEXT_DOCKER
# text = TEXT_EMAIL

# ---------------------------------------------------------------------------
# LangChain LCEL Chain Definition
# ---------------------------------------------------------------------------
# ② Create a reusable prompt template with a {data} placeholder
prompt = ChatPromptTemplate.from_template(
    "Give a short, friendly summary of this long text:\n\n{data}"
)

# ③ Initialize the OpenAI chat model wrapped for LangChain
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0.3,
    timeout=20.0,
)

# ④ Create the output parser that unwraps the AIMessage into a plain string
parser = StrOutputParser()

# ⑤ Snap the components together using the LCEL pipe operator (| means "then")
chain = prompt | model | parser

# ---------------------------------------------------------------------------
# Chain Execution
# ---------------------------------------------------------------------------
# ⑥ Invoke the chain; the input dictionary fills the {data} placeholder by name
summary = chain.invoke({"data": text})

print("Original text:\n", text, "\n")
print("Summary:\n", summary)
