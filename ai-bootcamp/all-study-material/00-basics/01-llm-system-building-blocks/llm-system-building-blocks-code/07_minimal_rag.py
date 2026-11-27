"""Worked example: a minimal RAG in about 20 lines (index, retrieve, augment, generate)."""
import numpy as np

from _common import EMBEDDING_MODEL, MODEL, get_client

client = get_client()

# Example documents to be indexed for retrieval
docs = ["Refunds for cancelled orders take 5-7 working days.",
        "UPI refunds are usually faster: 1-3 working days.",
        "Delivery partners can't accept cash above ₹2,000."]

# Function to embed text using the embedding model
def embed(texts):
    out = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return np.array([d.embedding for d in out.data])

# 1. Embed the documents to create the index once upfront. Do this again if documents change.
doc_vecs = embed(docs)

# 2. Embed the question
question = "I paid by UPI, when will my refund come?"
q_vec = embed([question])[0]

# 3. Compute similarity between question and document vectors
scores = doc_vecs @ q_vec

# 4. Retrieve the top 2 relevant documents based on similarity scores
# top = [docs[i] for i in scores.argsort()[::-1][:2]]

# Alternative simplified code to get top 2 documents
# pair each score with its doc, highest score first
scored_docs = sorted(zip(scores, docs), reverse=True)
# keep only the text of the top 2 docs
top = [doc for score, doc in scored_docs[:2]]

print("Retrieved Top 2:", top)

# 5. Use the retrieved documents to augment the question and generate an answer using the chat model
answer = client.chat.completions.create(model=MODEL, messages=[
    {"role": "system", "content": "Answer only from this context:\n" + "\n".join(top)},
    {"role": "user", "content": question}])
print(answer.choices[0].message.content)
