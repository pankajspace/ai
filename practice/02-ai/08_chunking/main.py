"""Text Chunking.

Splits a long document into small, overlapping chunks - the first step of RAG.
Small chunks embed and search better; the overlap keeps sentences that cross a
chunk boundary from losing their context.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py
    python main.py "Your own long text..."

Run with Docker (from this folder):
    docker build -t 08_chunking .
    docker run --rm 08_chunking
    docker run --rm 08_chunking "Your own long text..."
"""

import sys

from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Read the text from the command line (or use the sample)
SAMPLE_TEXT = (
    "Retrieval-Augmented Generation (RAG) combines search retrieval with generative AI models. "
    "Before documents can be searched efficiently, they must be broken down into smaller pieces. "
    "This process is called chunking. "
    "RecursiveCharacterTextSplitter splits documents on paragraph breaks, line breaks, and spaces "
    "to keep semantically related sentences together. "
    "Chunk overlap ensures that context across boundaries is not lost between adjacent chunks. "
    "These chunks are then converted into numerical vectors using embedding models, allowing "
    "similarity search to locate the most relevant sections when answering a user question."
)
text = sys.argv[1] if len(sys.argv) > 1 else SAMPLE_TEXT

# 2. Configure the splitter
#    It tries to split on paragraphs, then lines, then spaces, so related
#    words stay together while keeping each chunk under chunk_size.
splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,     # max characters per chunk
    chunk_overlap=40,   # characters shared by neighbouring chunks
)

# 3. Split the text into chunks
chunks = splitter.split_text(text)

# 4. Print each chunk with its length
print(f"Total chunks: {len(chunks)}")
for i, chunk in enumerate(chunks, start=1):
    print(f"\nChunk #{i} ({len(chunk)} chars):\n{chunk}")
