"""PDF Chat: index pasted PDF text and answer questions from its content.

This module combines the full RAG pipeline for PDF text: chunk pasted content,
embed it into an in-memory Chroma store, then answer questions using only the
document's content.

Can be run directly:  ``docker compose run --rm pdf-chat``
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

from config import get_chat_model, get_embedder

PDF_PROMPT = ChatPromptTemplate.from_template("""
You are a helpful PDF assistant. Answer the question using ONLY the context below.
If the context doesn't contain the answer, say "I couldn't find that in the document."

Context:
{context}

Question: {question}
""")


def build_pdf_text_index(pdf_text: str) -> Chroma:
    """Chunk pasted PDF text and build an in-memory vector store.

    Args:
        pdf_text: Text copied from a PDF.

    Returns:
        A ``Chroma`` vector store containing the embedded text chunks.
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)  # bigger chunks than the chunking demo's 100/10 since PDF pages carry more context per paragraph
    chunks = splitter.create_documents([pdf_text])
    embedder = get_embedder()
    db = Chroma.from_documents(chunks, embedder)  # in-memory only (no persist_directory) — index is rebuilt each time PDF text is submitted
    return db


def ask_pdf(db: Chroma, question: str) -> str:
    """Answer a question using the content of an indexed PDF.

    Args:
        db: A Chroma vector store built by ``build_pdf_text_index``.
        question: The user's question about the PDF.

    Returns:
        The model's answer.
    """
    model = get_chat_model()
    chunks = db.similarity_search(question, k=4)  # one more chunk than the rag.py demo's k=3, since PDF answers often span more context
    context = "\n\n".join(c.page_content for c in chunks)
    chain = PDF_PROMPT | model
    return chain.invoke({"context": context, "question": question}).content


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python pdf_chat.py '<pdf text>'")
        sys.exit(1)

    pdf_text = sys.argv[1]
    print("Indexing pasted PDF text...")
    db = build_pdf_text_index(pdf_text)
    print("PDF text indexed. Type your questions (Ctrl+C to quit).\n")

    while True:
        try:
            question = input("Q: ")
            if not question.strip():
                continue
            print(f"A: {ask_pdf(db, question)}\n")
        except (KeyboardInterrupt, EOFError):
            print("\nBye!")
            break
