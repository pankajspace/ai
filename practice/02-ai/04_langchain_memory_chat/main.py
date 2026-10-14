"""LangChain Memory Chat.

The model itself is stateless, so we keep the conversation history ourselves
and send it with every new question. This script plays a scripted
conversation, so you can see the bot recall earlier turns.
To try another conversation, change the choice in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 04_langchain_memory_chat .
    docker run --rm --env-file ../.env 04_langchain_memory_chat
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - sample conversations (one user message per turn); pick one below
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

# 3. Create the chat model
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    timeout=15.0,
)

# 4. Build the prompt: system instructions + past messages + new question
#    MessagesPlaceholder("history") is filled with the list of past turns.
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly assistant. Use the conversation history to stay consistent."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])

# 5. Chain them together: prompt -> model
chain = prompt | model

# 6. Play the conversation - history is a list of (role, content) tuples
history: list[tuple[str, str]] = []

for question in conversation:
    # 6a. Send history + the new question to the model
    answer = chain.invoke({"history": history, "question": question}).content
    print(f"\nYou: {question}")
    print(f"Bot: {answer}")

    # 6b. Remember this turn so the next question has context
    history.append(("human", question))
    history.append(("ai", answer))
    print(f"   (history now has {len(history)} messages)")
