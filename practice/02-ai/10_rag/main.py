"""RAG (Retrieval-Augmented Generation) over a paragraph.

Puts 08 (chunking) and 09 (embeddings) together with an LLM:
chunk -> embed + store -> retrieve the best chunks -> answer ONLY from them.
To ask something else, change the question in step 2.

Run locally (from this folder):
    pip install -r requirements.txt
    python main.py

Run with Docker (from this folder):
    docker build -t 10_rag .
    docker run --rm --env-file ../.env 10_rag
"""

import os

from dotenv import find_dotenv, load_dotenv
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Load API keys and model names from .env
#    (in Docker they are passed in with --env-file instead)
load_dotenv(find_dotenv())

# 2. Inputs - the document to search, and a question about it
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

# 3. Chunk the paragraph into small, overlapping pieces
splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=40)
chunks = splitter.split_text(PARAGRAPH)

# 4. Embed the chunks and store them in an in-memory Chroma vector store
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma.from_texts(chunks, embedder)

# 5. Retrieve the chunks most similar to the question
k = min(3, len(chunks))
relevant_chunks = [doc.page_content for doc in db.similarity_search(question, k=k)]
context = "\n\n".join(relevant_chunks)

# 6. Build a grounded prompt - the model must answer ONLY from the context
prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I couldn't find that in the provided paragraph."
Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")

model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0,
)

# 7. Generate the answer: prompt -> model
answer = (prompt | model).invoke({"context": context, "question": question}).content

# 8. Print the question, the retrieved chunks and the answer
print(f"Question: {question}")
print(f"\nRetrieved chunks ({len(relevant_chunks)} of {len(chunks)}):")
for i, chunk in enumerate(relevant_chunks, start=1):
    print(f" [{i}] {chunk}")
print(f"\nAnswer:\n{answer.strip()}")
