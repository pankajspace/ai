"""Paragraph RAG (Retrieval-Augmented Generation) Service.

This service implements a RAG workflow for answering questions over a paragraph:
1. Splits the paragraph into manageable text chunks using RecursiveCharacterTextSplitter.
2. Indexes chunks and retrieves the top matching passages for the user question.
3. Formulates a grounded prompt with the retrieved context.
4. Generates a concise, fact-based answer using ChatOpenAI.
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel

# Load API keys and model names from .env
load_dotenv(find_dotenv())

PARAGRAPH = (
    "TechToday Return Policy: Customers may return any eligible product within 30 days "
    "of the purchase date. All returned merchandise must be unworn, undamaged, and in its "
    "original packaging with all tags attached. Refunds are processed back to the original "
    "payment method within 5 to 7 business days after inspection. Standard shipping fees "
    "are non-refundable unless the return is due to our fulfillment error. International "
    "orders and clearance items marked as final sale cannot be returned or exchanged."
)


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class RagRequest(BaseModel):
    """Input payload for paragraph-based RAG query."""

    paragraph: str = PARAGRAPH
    question: str = "How long do I have to return something?"


class RagResponse(BaseModel):
    """Output payload containing grounded answer and retrieved sources."""

    paragraph: str
    question: str
    answer: str
    sources: list[str]


# ---------------------------------------------------------------------------
# RAG Pipeline: Chunk -> Embed & Store -> Retrieve -> Generate
# ---------------------------------------------------------------------------
# Load the local embedding model once (no API key needed)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# RAG prompt: instructs the model to answer strictly from retrieved context
prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I couldn't find that in the provided paragraph."
Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")


def answer_rag(paragraph: str, question: str) -> dict:
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

    # ② Embed every chunk and store the vectors in an in-memory Chroma vector store
    db = Chroma.from_texts(chunks, embedder)

    # ③ Retrieve the top-k chunks most similar to the question
    k = min(3, len(chunks))
    relevant_chunks = [doc.page_content for doc in db.similarity_search(question, k=k)]

    # ④ Join the retrieved chunks into one context string
    context = "\n\n".join(relevant_chunks)
    # Drop the in-memory collection so the next request starts with an empty store
    db.delete_collection()

    # ⑤ Generate an answer grounded only in the retrieved context
    #   (temperature=0 for deterministic, factual responses)
    model = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        temperature=0,
    )
    answer = (prompt | model).invoke({"context": context, "question": question}).content

    return {
        "paragraph": paragraph,
        "question": question,
        "answer": answer.strip(),
        "sources": relevant_chunks,
    }
