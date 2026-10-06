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
    # ① configure larger chunks so PDF paragraphs keep enough context
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)  # bigger chunks than the chunking demo's 100/10 since PDF pages carry more context per paragraph
    # ② split the pasted PDF text into LangChain document chunks
    chunks = splitter.create_documents([pdf_text])
    # ③ load the local embedding model for the chunks
    embedder = get_embedder()
    # ④ build an in-memory vector store for this PDF submission
    db = Chroma.from_documents(chunks, embedder)  # in-memory only (no persist_directory) — index is rebuilt each time PDF text is submitted
    # ⑤ return the searchable PDF index to the caller
    return db


def ask_pdf(db: Chroma, question: str) -> str:
    """Answer a question using the content of an indexed PDF.

    Args:
        db: A Chroma vector store built by ``build_pdf_text_index``.
        question: The user's question about the PDF.

    Returns:
        The model's answer.
    """
    # ① load the chat model that will answer from retrieved PDF context
    model = get_chat_model()
    # ② retrieve the PDF chunks most relevant to the question
    chunks = db.similarity_search(question, k=4)  # one more chunk than the rag.py demo's k=3, since PDF answers often span more context
    # ③ join the retrieved chunks into one prompt context
    context = "\n\n".join(c.page_content for c in chunks)
    # ④ compose the PDF prompt with the model
    chain = PDF_PROMPT | model
    # ⑤ ask the model to answer using only the PDF context
    return chain.invoke({"context": context, "question": question}).content


if __name__ == "__main__":
    import sys

    # ① require pasted PDF text as the command-line input
    if len(sys.argv) < 2:
        print("Usage: python pdf_chat.py '<pdf text>'")
        sys.exit(1)

    # ② build a searchable in-memory index from the pasted text
    pdf_text = sys.argv[1]
    print("Indexing pasted PDF text...")
    db = build_pdf_text_index(pdf_text)
    print("PDF text indexed. Type your questions (Ctrl+C to quit).\n")

    # ③ keep accepting questions until the user exits
    while True:
        try:
            # ④ read the next question and ignore blank input
            question = input("Q: ")
            if not question.strip():
                continue
            # ⑤ answer from the indexed PDF and print the response
            print(f"A: {ask_pdf(db, question)}\n")
        except (KeyboardInterrupt, EOFError):
            # ⑥ exit cleanly when the user stops the chat
            print("\nBye!")
            break
