"""Build a Chroma vector store from a list of text documents.

This is step 1 of the RAG pipeline: take raw text, chunk it, embed the chunks
with a local sentence-transformer model, and persist the vectors to disk so
they can be queried later by ``rag.py``.

Can be run directly:  ``docker compose run --rm index``
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

from config import get_embedder

# Demo documents — in production these would come from a database, PDF, or API.
DEMO_DOCS = [
    "Our return policy allows refunds within 30 days of purchase.",
    "Shipping is free for orders above ₹999 across India.",
    "For corporate orders above 50 units, contact sales@example.com.",
    "Our office is in Indiranagar, Bangalore. Open Mon-Fri 10am-7pm.",
]


def build_index(
    docs: list[str],
    persist_directory: str = "./chroma_db",
    chunk_size: int = 500,
    chunk_overlap: int = 50,
) -> Chroma:
    """Chunk, embed, and persist documents into a Chroma vector store.

    Args:
        docs: List of raw text documents to index.
        persist_directory: Folder to save the Chroma database.
        chunk_size: Target size per chunk (characters).
        chunk_overlap: Overlap between adjacent chunks.

    Returns:
        The ``Chroma`` vector store instance.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    chunks = splitter.create_documents(docs)
    embedder = get_embedder()
    db = Chroma.from_documents(chunks, embedder, persist_directory=persist_directory)
    return db, len(chunks)


if __name__ == "__main__":
    db, count = build_index(DEMO_DOCS)
    print(f"Indexed {count} chunks 🎉")
