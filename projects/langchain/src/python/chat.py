"""A memory chat built as a LangChain chain with a MessagesPlaceholder.

The key idea from Class 2 is that an LLM has no memory of its own — it only
"remembers" because we re-send the past turns with every request.  The
``MessagesPlaceholder`` is the slot where that prior conversation is injected
into the prompt.

The web layer is stateless: the browser keeps the running history and sends it
with each message, so ``reply()`` takes the history as an argument rather than
holding it in a module-level variable.
"""

from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from config import get_chat_model

# The prompt has three parts: a system persona, the history placeholder where
# past turns slot in, and the newest human question.
PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a friendly assistant. Use the conversation history to "
            "stay consistent.",
        ),
        MessagesPlaceholder("history"),
        ("human", "{question}"),
    ]
)


def _build_chain():
    """Assemble the chat chain: prompt | model.

    Built lazily inside a function (rather than at import time) so importing
    this module never requires an API key — the model client is only created
    when a reply is actually requested.  A slightly warmer temperature keeps
    replies conversational; the parser is omitted because reply() reads
    ``.content`` from the returned message directly.
    """
    return PROMPT | get_chat_model(temperature=0.7)


def _to_messages(history: list[dict]) -> list:
    """Convert plain {role, content} dicts into LangChain message objects.

    The browser sends history as JSON dicts (``{"role": "user"|"assistant",
    "content": "..."}``).  LangChain's placeholder expects ``HumanMessage`` /
    ``AIMessage`` objects, so we translate here at the boundary.

    Args:
        history: Prior turns as a list of ``{"role", "content"}`` dicts.

    Returns:
        A list of alternating ``HumanMessage`` / ``AIMessage`` objects.
    """
    messages = []
    for turn in history:
        if turn.get("role") == "assistant":
            messages.append(AIMessage(turn.get("content", "")))
        else:
            messages.append(HumanMessage(turn.get("content", "")))
    return messages


def reply(question: str, history: list[dict] | None = None) -> str:
    """Answer a question with the conversation history for context.

    Args:
        question: The newest user message.
        history:  Prior turns as ``{"role", "content"}`` dicts.  Defaults to
                  an empty conversation.

    Returns:
        The assistant's reply text.
    """
    messages = _to_messages(history or [])
    response = _build_chain().invoke({"history": messages, "question": question})
    return response.content


if __name__ == "__main__":
    # Quick manual test: a two-turn conversation showing memory in action.
    # The bot only knows the name in the second turn because we resend the
    # first turn as history.
    print(reply("My name is Aarav. Remember it."))
    print(reply("What's my name?", [
        {"role": "user", "content": "My name is Aarav. Remember it."},
        {"role": "assistant", "content": "Nice to meet you, Aarav!"},
    ]))
