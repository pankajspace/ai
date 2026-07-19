"""PDF Chat: upload a PDF, index it, and answer questions from its content.

This module combines the full RAG pipeline for PDF documents: load pages with
``PyPDFLoader``, chunk them, embed into an in-memory Chroma store, then answer
questions using only the document's content.  Page numbers are included in the
context so the model can cite sources.

Can be run directly:  ``docker compose run --rm pdf-chat``
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

from config import get_chat_model, get_embedder

PDF_PROMPT = ChatPromptTemplate.from_template("""
You are a helpful PDF assistant. Answer the question using ONLY the context below.
If the context doesn't contain the answer, say "I couldn't find that in the document."
After your answer, list the page numbers you used as: Sources: page X, page Y.

Context:
{context}

Question: {question}
""")


def build_pdf_index(pdf_path: str) -> Chroma:
    """Load a PDF file, chunk its pages, and build an in-memory vector store.

    Args:
        pdf_path: Path to the PDF file on disk.

    Returns:
        A ``Chroma`` vector store containing the embedded PDF chunks.
    """
    pages = PyPDFLoader(pdf_path).load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(pages)
    embedder = get_embedder()
    db = Chroma.from_documents(chunks, embedder)
    return db


def ask_pdf(db: Chroma, question: str) -> str:
    """Answer a question using the content of an indexed PDF.

    Args:
        db: A Chroma vector store built by ``build_pdf_index``.
        question: The user's question about the PDF.

    Returns:
        The model's answer, with page-number citations.
    """
    model = get_chat_model()
    chunks = db.similarity_search(question, k=4)
    context = "\n\n".join(
        f"[page {c.metadata.get('page', 0) + 1}] {c.page_content}"
        for c in chunks
    )
    chain = PDF_PROMPT | model
    return chain.invoke({"context": context, "question": question}).content


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python pdf_chat.py <path-to-pdf>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    print(f"Indexing {pdf_path}…")
    db = build_pdf_index(pdf_path)
    print("✅ PDF indexed! Type your questions (Ctrl+C to quit).\n")

    while True:
        try:
            question = input("Q: ")
            if not question.strip():
                continue
            print(f"A: {ask_pdf(db, question)}\n")
        except (KeyboardInterrupt, EOFError):
            print("\nBye!")
            break
