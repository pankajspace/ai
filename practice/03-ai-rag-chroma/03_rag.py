"""Paragraph RAG (Retrieval-Augmented Generation) Pipeline.

This script combines chunking (01), embeddings (02), and an LLM into a complete RAG workflow:
1. Splits the source paragraph into overlapping text chunks using `RecursiveCharacterTextSplitter`.
2. Embeds all chunks with `HuggingFaceEmbeddings("all-MiniLM-L6-v2")` and indexes them in Chroma.
3. Retrieves the top-k most relevant chunks for the user's question via vector similarity search.
4. Injects the retrieved context into a grounded prompt and generates a fact-based answer with `ChatOpenAI`.

Run locally (from this folder):
    pip install -r requirements.txt
    python 03_rag.py

Run with Docker Compose (from this folder):
    docker compose run --rm 03_rag
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ---------------------------------------------------------------------------
# Configuration & Environment Setup
# ---------------------------------------------------------------------------
# ① Load API keys and model names from .env
#   (in Docker, environment variables are passed in with --env-file instead)
load_dotenv(find_dotenv())

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# Source document paragraph and user question - uncomment another question to test
PARAGRAPH = (
    "TechToday Return Policy: Customers may return any eligible product within 30 days "
    "of the purchase date. All returned merchandise must be unworn, undamaged, and in its "
    "original packaging with all tags attached. Refunds are processed back to the original "
    "payment method within 5 to 7 business days after inspection. Standard shipping fees "
    "are non-refundable unless the return is due to our fulfillment error. International "
    "orders and clearance items marked as final sale cannot be returned or exchanged."
)
question = "How long do I have to return something?"
# question = "How long does a refund take?"
# question = "Are shipping fees refunded?"
# question = "What condition must returned items be in?"
# question = "Are clearance items marked as final sale returnable?"
# question = "Do you sell laptops?"   # not in the paragraph -> the model should say so

# ---------------------------------------------------------------------------
# Step 1: Document Chunking
# ---------------------------------------------------------------------------
# ② Split the paragraph into small, overlapping chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=40)
chunks = splitter.split_text(PARAGRAPH)

# ---------------------------------------------------------------------------
# Step 2: Vector Indexing & Similarity Retrieval
# ---------------------------------------------------------------------------
# ③ Embed all chunks into an ephemeral in-memory Chroma vector store
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma.from_texts(chunks, embedder)

# ④ Run similarity search for the user question and format top-k passages as context
k = min(3, len(chunks))
relevant_chunks = [doc.page_content for doc in db.similarity_search(question, k=k)]
context = "\n\n".join(relevant_chunks)

# ---------------------------------------------------------------------------
# Step 3: Grounded Prompt & Answer Synthesis
# ---------------------------------------------------------------------------
# ⑤ Build a grounded RAG prompt that instructs the model to answer strictly from context
prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I couldn't find that in the provided paragraph."
Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")

# ⑥ Initialize the ChatOpenAI model with temperature=0 for deterministic, factual responses
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0,
)

# ⑦ Synthesize the grounded answer by invoking the `prompt | model` LCEL chain
answer = (prompt | model).invoke({"context": context, "question": question}).content

# ---------------------------------------------------------------------------
# Output Results
# ---------------------------------------------------------------------------
print(f"Question: {question}")
print(f"\nRetrieved chunks ({len(relevant_chunks)} of {len(chunks)}):")
for i, chunk in enumerate(relevant_chunks, start=1):
    print(f" [{i}] {chunk}")
print(f"\nAnswer:\n{answer.strip()}")
