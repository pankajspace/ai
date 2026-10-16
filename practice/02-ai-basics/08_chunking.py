"""Text Chunking for RAG Pipelines.

This script demonstrates splitting long documents into smaller, overlapping chunks
suitable for vector embeddings and retrieval (RAG):
1. Defines sample document texts and chunking hyperparameters (`CHUNK_SIZE`, `CHUNK_OVERLAP`).
2. Configures `RecursiveCharacterTextSplitter`, which splits on paragraph breaks, line breaks,
   and spaces to keep semantically related sentences together.
3. Applies sliding-window character overlap so context across chunk boundaries is preserved.

Run locally (from this folder):
    pip install -r requirements.txt
    python 08_chunking.py

Run with Docker Compose (from this folder):
    docker compose run --rm 08_chunking
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

# ---------------------------------------------------------------------------
# Sample Inputs & Chunking Hyperparameters
# ---------------------------------------------------------------------------
# ① Choose a sample text and chunking parameters below
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
# Has paragraph breaks (\n\n) - watch the splitter prefer them over cutting mid-sentence
TEXT_PARAGRAPHS = (
    "Python is a popular programming language known for its readable syntax.\n\n"
    "It is widely used in web development, data analysis, automation and AI. "
    "Libraries such as NumPy, pandas and PyTorch make it the default choice for "
    "machine learning work.\n\n"
    "Python code runs on an interpreter, so you can try ideas instantly in a REPL "
    "or a notebook without a separate compile step."
)

text = TEXT_RAG
# text = TEXT_PARAGRAPHS

CHUNK_SIZE = 200      # max characters per chunk          - try 100 or 400
CHUNK_OVERLAP = 40    # characters shared by neighbours   - try 0 or 80

# ---------------------------------------------------------------------------
# Text Splitter Configuration & Execution
# ---------------------------------------------------------------------------
# ② Configure RecursiveCharacterTextSplitter with target chunk size and overlap.
#   It tries to split on paragraphs (\n\n), then lines (\n), then spaces, so related
#   sentences stay together while keeping each chunk under CHUNK_SIZE.
splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,        # aim for target chars per chunk
    chunk_overlap=CHUNK_OVERLAP,  # adjacent chunks share chars (context glue)
)

# ③ Split the document text into overlapping chunks preserving natural boundaries
chunks = splitter.split_text(text)

# ---------------------------------------------------------------------------
# Output Results
# ---------------------------------------------------------------------------
# ④ Print each generated chunk along with its character count
print(f"Total chunks: {len(chunks)} (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
for i, chunk in enumerate(chunks, start=1):
    print(f"\nChunk #{i} ({len(chunk)} chars):\n{chunk}")
