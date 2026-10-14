"""LangChain Summarizer - prompt | model | parser.

Builds a tiny LCEL (LangChain Expression Language) chain that turns long text
into a short, friendly summary. The pipe `|` means "then".

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py
    python main.py "Some long text to summarize..."

Run with Docker (from this folder):
    docker build -t 03_langchain_summarizer .
    docker run --rm --env-file ../.env 03_langchain_summarizer
    docker run --rm --env-file ../.env 03_langchain_summarizer "Some long text to summarize..."
"""

import os
import sys

from dotenv import find_dotenv, load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Read the text to summarize from the command line (or use the sample)
SAMPLE_TEXT = (
    "Information about LangChain and its usage in building AI applications. "
    "We will explore how it simplifies the integration of language models into "
    "various applications. It provides a structured way to create prompts, manage "
    "outputs, and chain together multiple language model calls. This allows "
    "developers to build complex AI-driven workflows efficiently."
)
text = sys.argv[1] if len(sys.argv) > 1 else SAMPLE_TEXT

# 3. Prompt: a reusable template with a {data} blank
prompt = ChatPromptTemplate.from_template(
    "Give a short, friendly summary of this long text:\n\n{data}"
)

# 4. Model: the OpenAI chat model, wrapped for LangChain
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0.3,
    timeout=20.0,
)

# 5. Parser: unwraps the model's message into plain text
parser = StrOutputParser()

# 6. Chain them together: prompt -> model -> parser
chain = prompt | model | parser

# 7. Run the chain; the dict fills the {data} blank by name
summary = chain.invoke({"data": text})

print("Original text:\n", text, "\n")
print("Summary:\n", summary)
