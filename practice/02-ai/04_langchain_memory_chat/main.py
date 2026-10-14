"""LangChain Memory Chat.

An interactive chat in the terminal. The model itself is stateless, so we keep
the conversation history ourselves and send it with every new question.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py
    (type 'quit' or 'exit' to stop)

Run with Docker (from this folder):
    docker build -t 04_langchain_memory_chat .
    docker run --rm -it --env-file ../.env 04_langchain_memory_chat

Try:
    You: My favorite color is navy blue.
    You: What is my favorite color?
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Create the chat model
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    timeout=15.0,
)

# 3. Build the prompt: system instructions + past messages + new question
#    MessagesPlaceholder("history") is filled with the list of past turns.
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly assistant. Use the conversation history to stay consistent."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])

# 4. Chain them together: prompt -> model
chain = prompt | model

# 5. Chat loop - history is a list of (role, content) tuples
history: list[tuple[str, str]] = []
print("Chat with the bot (type 'quit' or 'exit' to stop).")

while True:
    # 5a. Read the user's question
    try:
        question = input("You: ").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        break
    if question.lower() in {"quit", "exit"}:
        break
    if not question:
        continue

    # 5b. Send history + question to the model
    answer = chain.invoke({"history": history, "question": question}).content
    print("Bot:", answer)

    # 5c. Remember this turn so the next question has context
    history.append(("human", question))
    history.append(("ai", answer))
    print(f"   (history now has {len(history)} messages)")
