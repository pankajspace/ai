"""LangChain Conversational Memory Chat Service.

This service demonstrates conversational memory using LangChain LCEL (LangChain Expression Language):
1. Loads API credentials and model configuration from environment variables (.env).
2. Maintains conversation context across multiple turns using ChatPromptTemplate with MessagesPlaceholder.
3. Uses Pydantic models (ChatMessage, MemoryChatRequest, MemoryChatResponse) for structured serialization.
4. Dynamically appends user questions and assistant answers to preserve context across turns.

Run directly:
    python projects/ai-projects/server/services/04_langchain_memory_chat.py
"""

import os
import sys
from typing import List, Optional, Union
from dotenv import find_dotenv, load_dotenv
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
load_dotenv(find_dotenv())


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    """Single chat turn in conversation history."""

    role: str = Field(
        default="user",
        description="Author role: 'user' or 'assistant'",
    )
    content: str = Field(
        default="",
        description="Text content of the message",
    )


class MemoryChatRequest(BaseModel):
    """Input payload for memory chat queries."""

    message: str = Field(
        default="My favorite color is navy blue.",
        description="Current user prompt or question",
    )
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation turns preserving message context",
    )


class MemoryChatResponse(BaseModel):
    """Output payload containing assistant response and updated history."""

    message: str
    response: str
    history: List[ChatMessage]


# ---------------------------------------------------------------------------
# Helpers for Message Serialization & Conversion
# ---------------------------------------------------------------------------
def _to_langchain_messages(
    messages: List[Union[ChatMessage, dict, BaseMessage]],
) -> List[BaseMessage]:
    """Convert input messages into LangChain BaseMessage objects."""
    lc_messages: List[BaseMessage] = []
    for msg in messages:
        if isinstance(msg, BaseMessage):
            lc_messages.append(msg)
            continue

        role = ""
        content = ""
        if isinstance(msg, ChatMessage):
            role = msg.role
            content = msg.content
        elif isinstance(msg, dict):
            role = msg.get("role", "")
            content = msg.get("content", "")

        if role.lower() in ("user", "human"):
            lc_messages.append(HumanMessage(content=content))
        elif role.lower() in ("assistant", "ai"):
            lc_messages.append(AIMessage(content=content))
    return lc_messages


def _to_chat_messages(
    messages: List[Union[ChatMessage, dict, BaseMessage]],
) -> List[ChatMessage]:
    """Convert input messages into Pydantic ChatMessage objects."""
    chat_messages: List[ChatMessage] = []
    for msg in messages:
        if isinstance(msg, ChatMessage):
            chat_messages.append(msg)
        elif isinstance(msg, dict):
            chat_messages.append(
                ChatMessage(
                    role=msg.get("role", "user"),
                    content=msg.get("content", ""),
                )
            )
        elif isinstance(msg, HumanMessage):
            chat_messages.append(ChatMessage(role="user", content=str(msg.content)))
        elif isinstance(msg, AIMessage):
            chat_messages.append(ChatMessage(role="assistant", content=str(msg.content)))
    return chat_messages


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def chat_with_memory(
    question: str = "My favorite color is navy blue.",
    history: Optional[List[Union[ChatMessage, dict, BaseMessage]]] = None,
) -> tuple[str, List[ChatMessage]]:
    """Execute a conversational chat turn with memory retention.

    Args:
        question: User message or query.
        history: Previous chat messages to provide context.

    Returns:
        Tuple of (assistant_response, updated_chat_history).
    """
    history_list = history or []
    lc_history = _to_langchain_messages(history_list)

    model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    base_url = os.getenv("OPENAI_BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")

    model = ChatOpenAI(
        model=model_name,
        api_key=api_key,
        base_url=base_url if base_url else None,
        timeout=15.0,
    )

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a friendly assistant. Use the conversation history to stay consistent.",
        ),
        MessagesPlaceholder("history"),
        ("human", "{question}"),
    ])
    chain = prompt | model

    result = chain.invoke({"history": lc_history, "question": question})
    answer = str(result.content) if hasattr(result, "content") else str(result)

    updated_history = [
        *_to_chat_messages(history_list),
        ChatMessage(role="user", content=question),
        ChatMessage(role="assistant", content=answer),
    ]

    return answer, updated_history


# Functional aliases for backwards-compatibility and service consistency
run_memory_chat = chat_with_memory
memory_chat = chat_with_memory


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Conversational Memory Chat Service ---")
    if sys.stdin.isatty():
        print("Chat with the bot (type 'quit' or 'exit' to stop).")
        session_history: List[ChatMessage] = []
        while True:
            try:
                user_query = input("You: ")
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if user_query.strip().lower() in {"quit", "exit"}:
                break
            if not user_query.strip():
                continue

            bot_reply, session_history = chat_with_memory(user_query, session_history)
            print("Bot:", bot_reply)
            print(f"   (history now has {len(session_history)} messages)")
    else:
        print("\nTurn 1: Telling bot user's preference...")
        turn1_reply, h1 = chat_with_memory("Hi! My favorite color is navy blue.")
        print("Bot:", turn1_reply)

        print("\nTurn 2: Asking bot to recall user's preference...")
        turn2_reply, h2 = chat_with_memory("What is my favorite color?", history=h1)
        print("Bot:", turn2_reply)
        print(f"   (history preserved {len(h2)} messages)")
