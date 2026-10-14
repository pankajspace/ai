"""Text Chunking.

Splits a long document into small, overlapping chunks - the first step of RAG.
Small chunks embed and search better; the overlap keeps sentences that cross a
chunk boundary from losing their context.
To try another text or chunk size, change the values in step 1.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 08_chunking .
    docker run --rm 08_chunking
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Inputs - sample texts and splitter settings; pick one text at the bottom
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

# 2. Configure the splitter
#    It tries to split on paragraphs, then lines, then spaces, so related
#    words stay together while keeping each chunk under CHUNK_SIZE.
splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)

# 3. Split the text into chunks
chunks = splitter.split_text(text)

# 4. Print each chunk with its length
print(f"Total chunks: {len(chunks)} (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
for i, chunk in enumerate(chunks, start=1):
    print(f"\nChunk #{i} ({len(chunk)} chars):\n{chunk}")
