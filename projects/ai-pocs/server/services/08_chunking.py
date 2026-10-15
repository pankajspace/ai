"""Text Chunking Service.

This service splits long documents into smaller, overlapping chunks suitable
for vector embeddings and retrieval (RAG).
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel

TEXT_RAG = (
    "Retrieval-Augmented Generation (RAG) combines search retrieval with generative AI models. "
    "Before documents can be searched efficiently, they must be broken down into smaller pieces. "
    "This process is called chunking. "
    "RecursiveCharacterTextSplitter splits documents on paragraph breaks, line breaks, and spaces "
    "to keep semantically related sentences together. "
    "Chunk overlap ensures that context across boundaries is not lost between adjacent chunks. "
    "These chunks are then converted into numerical vectors using embedding models, allowing "
    "similarity search to locate the most relevant sections when answering a user question."
)


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class ChunkingRequest(BaseModel):
    """Input payload for text chunking."""

    text: str = TEXT_RAG
    chunk_size: int = 250
    chunk_overlap: int = 40


class ChunkingResponse(BaseModel):
    """Output payload containing generated chunks and configuration."""

    total_chunks: int
    chunk_size: int
    chunk_overlap: int
    chunks: list[str]


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def chunk_text(text: str = TEXT_RAG, chunk_size: int = 250, chunk_overlap: int = 40) -> list[str]:
    """Split text into overlapping chunks using RecursiveCharacterTextSplitter.

    Args:
        text: Input text document.
        chunk_size: Target characters per chunk.
        chunk_overlap: Shared characters between adjacent chunks.

    Returns:
        List of text chunks.
    """
    # ① Configure RecursiveCharacterTextSplitter with target chunk size and overlap.
    #   It tries to split on paragraphs (\n\n), then lines (\n), then spaces, so related
    #   sentences stay together while keeping each chunk under chunk_size.
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,        # aim for target chars per chunk
        chunk_overlap=chunk_overlap,  # adjacent chunks share chars (context glue)
    )
    # ② Split the document text into overlapping chunks preserving natural boundaries
    return splitter.split_text(text)
