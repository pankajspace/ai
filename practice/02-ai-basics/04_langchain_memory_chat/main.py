"""LangChain Conversational Memory Chat.

This script demonstrates multi-turn conversational memory using LangChain LCEL:
1. Loads API credentials and model configuration from environment variables (.env).
2. Because LLMs are stateless, maintains conversation history explicitly across turns.
3. Injects past turns into the prompt using `ChatPromptTemplate` and `MessagesPlaceholder`.
4. Appends each user question and assistant reply to `history` so subsequent turns retain context.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 04_langchain_memory_chat .
    docker run --rm --env-file .env 04_langchain_memory_chat
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
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
# Sample multi-turn conversations (one user message per turn) - pick one below
CONVERSATION_COLOR = [
    "Hi! My favorite color is navy blue.",
    "What is my favorite color?",
]
CONVERSATION_TRIP = [
    "I'm planning a trip to Goa next month with my two kids.",
    "Suggest one activity that would suit us.",
    "Remind me - where am I going, and how many people are travelling?",
]
CONVERSATION_PROFILE = [
    "My name is Asha and I'm a backend developer.",
    "This week I'm learning LangChain.",
    "Summarize what you know about me in one sentence.",
]

conversation = CONVERSATION_COLOR
# conversation = CONVERSATION_TRIP
# conversation = CONVERSATION_PROFILE

# ---------------------------------------------------------------------------
# Model & Prompt Chain Setup
# ---------------------------------------------------------------------------
# ② Initialize the ChatOpenAI client
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    timeout=15.0,
)

# ③ Build prompt template injecting system instructions, chat history, and current question
#   MessagesPlaceholder("history") dynamically receives the list of past (role, content) tuples
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly assistant. Use the conversation history to stay consistent."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])

# ④ Assemble the LCEL pipeline (Prompt | Model)
chain = prompt | model

# ---------------------------------------------------------------------------
# Multi-Turn Conversation Loop
# ---------------------------------------------------------------------------
# ⑤ Initialize an empty list of (role, content) tuples to store conversation history
history: list[tuple[str, str]] = []

for question in conversation:
    # ⑥ Invoke the chain with accumulated history and the current user question
    answer = chain.invoke({"history": history, "question": question}).content
    print(f"\nYou: {question}")
    print(f"Bot: {answer}")

    # ⑦ Append the current user question and assistant answer to preserve context for the next turn
    history.append(("human", question))
    history.append(("ai", answer))
    print(f"   (history now has {len(history)} messages)")
