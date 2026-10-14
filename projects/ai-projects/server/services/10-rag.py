"""Paragraph RAG (Retrieval-Augmented Generation) Service.

This service implements a RAG workflow for answering questions over a paragraph:
1. Splits the paragraph into manageable text chunks using RecursiveCharacterTextSplitter.
2. Indexes chunks and retrieves the top matching passages for the user question.
3. Formulates a grounded prompt with the retrieved context.
4. Generates a concise, fact-based answer using ChatOpenAI.

Run directly:
    python projects/ai-projects/server/services/10-rag.py
"""

import os
from dotenv import find_dotenv, load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

load_dotenv(find_dotenv())

DEFAULT_SAMPLE_PARAGRAPH = (
    "TechToday Return Policy: Customers may return any eligible product within 30 days "
    "of the purchase date. All returned merchandise must be unworn, undamaged, and in its "
    "original packaging with all tags attached. Refunds are processed back to the original "
    "payment method within 5 to 7 business days after inspection. Standard shipping fees "
    "are non-refundable unless the return is due to our fulfillment error. International "
    "orders and clearance items marked as final sale cannot be returned or exchanged."
)

DEFAULT_SAMPLE_QUESTION = "How long do I have to return something?"

# RAG prompt: instructs the model to answer strictly from retrieved context
RAG_PROMPT = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I couldn't find that in the provided paragraph."
Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class RagRequest(BaseModel):
    """Input payload for paragraph-based RAG query."""

    paragraph: str = Field(
        default=DEFAULT_SAMPLE_PARAGRAPH,
        description="Paragraph or document text to query",
    )
    question: str = Field(
        default=DEFAULT_SAMPLE_QUESTION,
        description="Question to ask about the paragraph",
    )


class RagResponse(BaseModel):
    """Output payload containing grounded answer and retrieved sources."""

    paragraph: str
    question: str
    answer: str
    sources: list[str]


# ---------------------------------------------------------------------------
# Retrieval & RAG Logic
# ---------------------------------------------------------------------------
def _retrieve_relevant_chunks(chunks: list[str], question: str, k: int = 3) -> list[str]:
    """Retrieve top relevant chunks using Chroma/Embeddings with fallback."""
    if len(chunks) <= k:
        return chunks

    # 1. Attempt Chroma + HuggingFaceEmbeddings (original design)
    try:
        from langchain_chroma import Chroma
        from langchain_huggingface import HuggingFaceEmbeddings

        embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        db = Chroma.from_texts(chunks, embedder)
        results = db.similarity_search(question, k=k)
        return [r.page_content for r in results]
    except Exception:
        pass

    # 2. Attempt OpenAIEmbeddings + InMemoryVectorStore
    try:
        from langchain_openai import OpenAIEmbeddings
        from langchain_core.vectorstores import InMemoryVectorStore

        embedder = OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL", None),
        )
        db = InMemoryVectorStore.from_texts(chunks, embedder)
        results = db.similarity_search(question, k=k)
        return [r.page_content for r in results]
    except Exception:
        pass

    # 3. Simple lexical relevance fallback for lightweight POC execution
    q_words = set(question.lower().split())
    scored = sorted(
        chunks,
        key=lambda c: len(set(c.lower().split()) & q_words),
        reverse=True,
    )
    return scored[:k]


def answer_rag(
    paragraph: str = DEFAULT_SAMPLE_PARAGRAPH,
    question: str = DEFAULT_SAMPLE_QUESTION,
) -> dict:
    """Execute the complete paragraph RAG pipeline: chunk -> retrieve -> synthesize.

    Args:
        paragraph: The source paragraph to search.
        question: User query about the paragraph.

    Returns:
        Dictionary matching RagResponse schema.
    """
    # ① Chunk the paragraph into overlapping pieces
    splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=40)
    chunks = splitter.split_text(paragraph)
    if not chunks:
        chunks = [paragraph]

    # ② Retrieve the most relevant chunks for the question
    relevant_chunks = _retrieve_relevant_chunks(chunks, question, k=3)

    # ③ Format the retrieved chunks into context string
    context = "\n\n".join(relevant_chunks)

    # ④ Initialize chat model
    model = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        temperature=0,
    )

    # ⑤ Synthesize answer with prompt chain
    chain = RAG_PROMPT | model
    result = chain.invoke({"context": context, "question": question})
    answer = result.content if hasattr(result, "content") else str(result)

    return {
        "paragraph": paragraph,
        "question": question,
        "answer": str(answer).strip(),
        "sources": relevant_chunks,
    }


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Paragraph RAG Service ---")
    res = answer_rag(DEFAULT_SAMPLE_PARAGRAPH, DEFAULT_SAMPLE_QUESTION)
    print(f"\nQuestion: {res['question']}")
    print(f"\nRetrieved Chunks ({len(res['sources'])}):")
    for i, s in enumerate(res['sources'], 1):
        print(f" [{i}] {s}")
    print(f"\nAnswer:\n{res['answer']}")
