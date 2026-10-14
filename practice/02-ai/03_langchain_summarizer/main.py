"""LangChain Summarizer - prompt | model | parser.

Builds a tiny LCEL (LangChain Expression Language) chain that turns long text
into a short, friendly summary. The pipe `|` means "then".
To summarize a different text, change the choice in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 03_langchain_summarizer .
    docker run --rm --env-file ../.env 03_langchain_summarizer
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - sample texts; pick one at the bottom of this step
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
