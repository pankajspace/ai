"""RAG query: retrieve relevant chunks and generate an answer.

This is step 2 of the RAG pipeline: given a user question, find the most
relevant chunks from the Chroma vector store, inject them into a prompt, and
ask the LLM to answer using only that context.

Can be run directly:  ``docker compose run --rm rag``
"""

from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

from config import get_chat_model, get_embedder

# The RAG prompt instructs the model to answer only from the provided context.
RAG_PROMPT = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I don't know." Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")


def rag_answer(question: str, persist_directory: str = "./chroma_db") -> str:
    """Retrieve relevant chunks and generate a grounded answer.

    Args:
        question: The user's question.
        persist_directory: Folder containing the Chroma database built by
            ``index.py``.

    Returns:
        The model's answer, grounded in the retrieved context.
    """
    embedder = get_embedder()
    db = Chroma(persist_directory=persist_directory, embedding_function=embedder)
    model = get_chat_model()

    chunks = db.similarity_search(question, k=3)
    context = "\n\n".join(c.page_content for c in chunks)
    chain = RAG_PROMPT | model
    return chain.invoke({"context": context, "question": question}).content


if __name__ == "__main__":
    question = "How long do I have to return something?"
    print(f"Q: {question}")
    print(f"A: {rag_answer(question)}")
