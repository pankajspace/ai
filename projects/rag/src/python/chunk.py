"""Text chunking demo: split a long document into overlapping chunks.

Adjacent chunks share ``chunk_overlap`` characters so context at the boundary
is never lost — this is the \"context glue\" that makes retrieval work well.

Can be run directly:  ``docker compose run --rm chunk``
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(
    text: str,
    chunk_size: int = 100, # 800
    chunk_overlap: int = 10, # 100
) -> list[str]:
    """Split *text* into overlapping chunks.

    Args:
        text: The long document to split.
        chunk_size: Target size (in characters) per chunk.
        chunk_overlap: Number of characters shared between adjacent chunks.

    Returns:
        A list of chunk strings.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_text(text)


if __name__ == "__main__":
    sample = (
        "Our return policy allows refunds within 30 days of purchase. "
        "Shipping is free for orders above ₹999 across India. "
        "For corporate orders above 50 units, contact sales@example.com. "
        "Our office is in Indiranagar, Bangalore. Open Mon-Fri 10am-7pm. "
    ) * 10  # repeat to make it long enough for chunking to be visible

    chunks = chunk_text(sample)
    print(f"Input length : {len(sample)} characters")
    print(f"Chunk count  : {len(chunks)}")
    for i, c in enumerate(chunks):
        print(f"\n--- Chunk {i + 1} ({len(c)} chars) ---")
        print(c[:120] + ("…" if len(c) > 120 else ""))
