"""Text Chunking Service.

This service splits long documents into smaller, overlapping chunks suitable
for vector embeddings and retrieval (RAG).

Run directly:
    python projects/ai-projects/server/services/08_chunking.py
"""

from pydantic import BaseModel, Field

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter

DEFAULT_SAMPLE_TEXT = (
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

    text: str = Field(
        default=DEFAULT_SAMPLE_TEXT,
        description="Document text to split into chunks",
    )
    chunk_size: int = Field(
        default=250,
        ge=20,
        le=5000,
        description="Target maximum characters per chunk",
    )
    chunk_overlap: int = Field(
        default=40,
        ge=0,
        le=1000,
        description="Character overlap between adjacent chunks",
    )


class ChunkingResponse(BaseModel):
    """Output payload containing generated chunks and configuration."""

    total_chunks: int
    chunk_size: int
    chunk_overlap: int
    chunks: list[str]


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def chunk_text(
    text: str = DEFAULT_SAMPLE_TEXT,
    chunk_size: int = 250,
    chunk_overlap: int = 40,
) -> list[str]:
    """Split text into overlapping chunks using RecursiveCharacterTextSplitter.

    Args:
        text: Input text document.
        chunk_size: Target characters per chunk.
        chunk_overlap: Shared characters between adjacent chunks.

    Returns:
        List of text chunks.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,        # aim for target chars per chunk
        chunk_overlap=chunk_overlap,  # adjacent chunks share chars (context glue)
    )
    return splitter.split_text(text)


# ---------------------------------------------------------------------------
# Standalone CLI Verification
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("--- Text Chunking Service ---")
    chunks = chunk_text(DEFAULT_SAMPLE_TEXT, chunk_size=200, chunk_overlap=40)
    print(f"Total chunks: {len(chunks)}")
    for idx, c in enumerate(chunks, 1):
        print(f"\nChunk #{idx} ({len(c)} chars):\n{c}")
