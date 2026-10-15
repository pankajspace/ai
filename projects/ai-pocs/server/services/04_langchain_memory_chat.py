"""LangChain Conversational Memory Chat Service.

This service demonstrates conversational memory using LangChain LCEL (LangChain Expression Language):
1. Loads API credentials and model configuration from environment variables (.env).
2. Maintains conversation context across multiple turns using ChatPromptTemplate with MessagesPlaceholder.
3. Uses Pydantic models (ChatMessage, MemoryChatRequest, MemoryChatResponse) for structured serialization.
4. Dynamically appends user questions and assistant answers to preserve context across turns.

Run directly:
    python projects/ai-pocs/server/services/04_langchain_memory_chat.py
"""

import os
from typing import List, Optional
from dotenv import find_dotenv, load_dotenv
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
# Model & Prompt Chain Setup
# ---------------------------------------------------------------------------
# ① Initialize the ChatOpenAI client
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    api_key=os.getenv("OPENAI_API_KEY") or "missing-key",
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    timeout=15.0,
)

# ② Build prompt template injecting system instructions, chat history, and current question
#   MessagesPlaceholder("history") dynamically receives the list of past (role, content) tuples
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly assistant. Use the conversation history to stay consistent."),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])

# ③ Assemble the LCEL pipeline (Prompt | Model)
chain = prompt | model


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def chat_with_memory(
    question: str = "My favorite color is navy blue.",
    history: Optional[List[ChatMessage]] = None,
) -> tuple[str, List[ChatMessage]]:
    """Execute a conversational chat turn with memory retention.

    Args:
        question: User message or query.
        history: Previous chat messages to provide context.

    Returns:
        Tuple of (assistant_response, updated_chat_history).
    """
    # ④ Convert the history sent by the browser into (role, content) tuples
    history = history or []
    lc_history = [(msg.role, msg.content) for msg in history]

    # ⑤ Invoke the chain with accumulated history and the current user question
    answer = chain.invoke({"history": lc_history, "question": question}).content

    # ⑥ Append the current question and answer to preserve context for the next turn
    updated_history = [
        *history,
        ChatMessage(role="user", content=question),
        ChatMessage(role="assistant", content=answer),
    ]
    return answer, updated_history


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Conversational Memory Chat Service ---")
    session_history: List[ChatMessage] = []
    for user_question in ["Hi! My favorite color is navy blue.", "What is my favorite color?"]:
        reply, session_history = chat_with_memory(user_question, session_history)
        print(f"\nYou: {user_question}")
        print(f"Bot: {reply}")
        print(f"   (history now has {len(session_history)} messages)")
