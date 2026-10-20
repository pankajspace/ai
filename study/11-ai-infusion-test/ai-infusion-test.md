[<- README](../../README.md)

# AI Infusion Test

All 12 answers from the test screenshots (9 Multiple Choice Questions in Section 1 and 3 Coding Questions in Section 2) have been verified and are **100% correct**.

---

## Section 1: Multiple Choice Questions (MCQs)

### 1. Question 01: Tokenizer Logic
**Question:** Why do LLMs use sub-word tokens instead of whole-word or single-letter tokens? *(Select any ONE)*

1. **[x] Tokens give a compact vocabulary (~100k chunks) while still being able to spell out any unseen word from familiar pieces** *(Correct)*
2. [ ] Whole words are always cheaper to process than tokens
3. [ ] Sub-word tokens eliminate the need for a context window
4. [ ] Sub-word tokens make the model completely bug-free

**Explanation:** Sub-word tokenization (such as BPE) balances vocabulary size and sequence length. Single-letter tokens create very long sequences, while whole-word tokens require an enormous vocabulary and fail on out-of-vocabulary (unseen) words. Sub-word tokens keep the vocabulary compact (~100k tokens) while allowing any novel word to be constructed from smaller known sub-word units.

---

### 2. Chain vs Agent
**Question:** What is the key difference between a "chain" and an "agent"? *(Select any ONE)*

1. [ ] A chain uses a web UI library while an agent does not
2. [ ] An agent always needs a vector database, a chain never does
3. **[x] A chain follows a fixed sequence of steps; an agent decides on its own, at runtime, whether to call a tool** *(Correct)*
4. [ ] There is no real difference — they are just two names for the same thing

**Explanation:** Chains execute a predetermined, hardcoded pipeline of steps (e.g., `prompt | llm | parser`), whereas agents use an LLM as a reasoning engine at runtime to dynamically decide which tools to call, in what order, and when to stop.

---

### 3. The Package Opener
**Question:** What does an output parser (like `StrOutputParser`) actually do in a chain? *(Select any ONE)*

1. [ ] It fetches website content for summarization
2. [ ] It stores conversation memory across sessions
3. [ ] It converts a prompt template's blanks into actual text
4. **[x] It unwraps the model's response package and hands back just the plain text string** *(Correct)*

**Explanation:** Chat models return a structured message object (such as `AIMessage`) containing metadata, token usage, and content. `StrOutputParser` extracts the `.content` string from the response object so downstream steps receive plain text.

---

### 4. The Boundary Problem
**Question:** Why is `"chunk_overlap"` used when splitting documents into chunks for retrieval? *(Select any ONE)*

1. [ ] To make the vector database run faster
2. **[x] To ensure a sentence sitting at a chunk boundary isn't split and missed entirely** *(Correct)*
3. [ ] To reduce the number of tokens billed per API call
4. [ ] To automatically translate text into multiple languages

**Explanation:** When documents are split into fixed-size chunks, an important sentence or thought can be cut in half across two adjacent chunks. Adding `chunk_overlap` repeats a small window of text across consecutive chunks so boundary context stays intact for embedding and retrieval.

---

### 5. The Three Gates
**Question:** What are the three independent "gates" that must all be open before an agent can successfully call a cloud-hosted model? *(Select any ONE)*

1. **[x] Credentials, IAM permission, and Model access (enabled per region)** *(Correct)*
2. [ ] Internet connection, RAM, and CPU speed
3. [ ] Python version, pip version, and OS type
4. [ ] Framework version, UI library version, and API key

**Explanation:** Calling a managed cloud LLM (such as AWS Bedrock) requires passing three independent checks: valid authentication credentials (who you are), IAM policy permissions (what API actions you are allowed to invoke, e.g., `bedrock:InvokeModel`), and model access enabled in that specific cloud region.

---

### 6. Function to Tool
**Question:** What three things must be added to a plain Python function to turn it into an agent-usable tool? *(Select any ONE)*

1. [ ] A class definition, a database connection, and a return statement
2. [ ] An API key, a region name, and a session object
3. [ ] A Gradio interface, a vector store, and an embedding model
4. **[x] A decorator marking it as a tool, type hints, and a clear docstring** *(Correct)*

**Explanation:** Agent frameworks (like LangChain and AWS Strands) inspect the `@tool` decorator to register the function, use the **type hints** to build the JSON schema for arguments, and pass the **docstring** to the LLM so it understands when and how to call the tool.

---

### 7. Resume Scan vs Interview
**Question:** Which of the following statements are **TRUE** about bi-encoders and cross-encoders used in reranking? *(Select ALL that apply)*

1. **[x] Bi-encoders encode the query and document separately, making them fast and pre-computable** *(Correct)*
2. [ ] Cross-encoders are used to grab the initial top 50–100 candidates from millions of chunks
3. **[x] Cross-encoders process the query and document together, giving higher accuracy but at slower speed** *(Correct)*
4. [ ] Bi-encoders always produce more accurate rankings than cross-encoders
5. **[x] Cross-encoder scores cannot be precomputed because each score is pair-specific** *(Correct)*

**Explanation:**
1. **Bi-encoders** (the "resume scan") compute embeddings for documents ahead of time and encode the query independently at search time, enabling fast vector similarity search over millions of chunks to get the initial top 50–100 candidates.
2. **Cross-encoders** (the "in-depth interview") feed the `(query, document)` pair jointly through cross-attention layers, yielding higher ranking accuracy but requiring a forward pass per pair at query time (so scores cannot be pre-computed).

---

### 8. Two Librarians
**Question:** Which of the following are **TRUE** about hybrid search (BM25 + vector search)? *(Select ALL that apply)*

1. **[x] BM25 excels at exact matches like SKU codes, product IDs, and legal references** *(Correct)*
2. **[x] Vector search excels at understanding paraphrases and semantic meaning, even without exact keyword overlap** *(Correct)*
3. [ ] Hybrid search eliminates the need for an LLM in the final answer generation step
4. **[x] Reciprocal Rank Fusion (RRF) merges the two ranked lists into one combined ranking** *(Correct)*
5. [ ] BM25 is better than vector search at understanding synonyms

**Explanation:**
1. **BM25** is a lexical/keyword retrieval algorithm that excels at exact token matching (IDs, error codes, specific terms).
2. **Vector search** uses dense embeddings to capture semantic similarity and synonyms even when exact words differ.
3. **Reciprocal Rank Fusion (RRF)** combines the ranked lists from both retrievers into a single unified ranking without needing score calibration.

---

### 9. Answers vs Goals
**Question:** Which of the following statements correctly describe the difference between a retrieval-based chatbot and a true agent? *(Select ALL that apply)*

1. **[x] A retrieval-based system grounds answers in fetched information, while an agent can act, observe results, and retry using tools** *(Correct)*
2. **[x] An agent runs a reasoning loop (reason → act → observe → repeat) until it judges the goal is met** *(Correct)*
3. [ ] A retrieval-based chatbot can also directly modify a database record when asked
4. [ ] An agent cannot use retrieval as part of its workflow
5. **[x] Retrieval answers questions; agents accomplish goals** *(Correct)*

**Explanation:** A RAG chatbot fetches relevant context to answer a user's question (read-only grounding), whereas an agent runs an iterative ReAct loop (`reason -> act -> observe -> repeat`), calling tools (which can include retrieval as well as write actions) until the user's goal is achieved.

---

## Section 2: Coding Questions

### 1. Token Cost Estimator

#### Context
LLMs charge per token, not per character or word. Before shipping any AI feature, an engineer needs a quick way to estimate how many tokens a piece of text will consume and what that will cost against a given pricing rate — exactly the "tokens, not words" intuition behind pricing an app.

#### Problem Statement
Write a function `estimate_token_cost(text, price_per_million)`.

1. Count the total number of characters in `text`.
2. Estimate the token count using the rule `"1 token ≈ 4 characters"` — i.e., `tokens = round(characters / 4)`, with a minimum of 1 token for any non-empty text.
3. Compute the cost as `(tokens / 1,000,000) * price_per_million`.
4. Return a single dictionary with three keys: `"characters"` (int), `"tokens"` (int), and `"cost"` (float, rounded to 6 decimal places).

#### Sample Input
```python
text = "AI Engineering is surprisingly approachable and powerful for beginners!"
price_per_million = 5.0
```

#### Sample Output
```python
{"characters": 71, "tokens": 18, "cost": 0.00009}
```

#### Solution (Verified Correct)
```python
import sys


def estimate_token_cost(text: str, price_per_million: float) -> dict:
    characters = len(text)
    if characters == 0:
        tokens = 0
    else:
        tokens = max(1, round(characters / 4))

    cost = round((tokens / 1_000_000) * price_per_million, 6)
    return {"characters": characters, "tokens": tokens, "cost": cost}
```

---

### 2. Hybrid Search Rank Fusion

#### Context
Pure keyword search (BM25) and pure semantic search (vector similarity) each catch things the other misses. Production RAG systems merge both rankings into one using Reciprocal Rank Fusion (RRF) — a simple formula that rewards documents ranked highly by either method, without needing to retrain or re-score anything.

#### Problem Statement
Write a function `reciprocal_rank_fusion(bm25_ranking, vector_ranking, k_constant, top_n)`.

1. `bm25_ranking` and `vector_ranking` are each a list of document IDs, ordered from most to least relevant (best result first) according to that retrieval method.
2. For every document appearing in either list, compute its RRF score as the sum of `1 / (k_constant + rank)` across each list it appears in, where `rank` is its 1-based position in that list. A document missing from a list contributes nothing from that list.
3. Sort all documents by their combined score, highest first.
4. Return a dictionary containing only the top `top_n` documents, mapping each document ID to its score rounded to 4 decimal places.

#### Input Format
```text
Line 1: T (number of test cases)

For each test case:
  Line 1: N1 - length of bm25_ranking
  Line 2: N1 space-separated integers (document IDs, best first)
  Line 3: N2 - length of vector_ranking
  Line 4: N2 space-separated integers (document IDs, best first)
  Line 5: k_constant (single integer)
  Line 6: top_n (single integer)
```

#### Sample Input
```python
bm25_ranking = [3, 1, 4, 2]
vector_ranking = [1, 2, 3, 5]
k_constant = 60
top_n = 3
```

#### Sample Output
```python
{1: 0.0325, 3: 0.0323, 2: 0.0318}
```

#### Solution (Verified Correct)
```python
import sys


def reciprocal_rank_fusion(
    bm25_ranking: list[int],
    vector_ranking: list[int],
    k_constant: int,
    top_n: int,
) -> dict:
    rrf_scores = {}

    for rank, doc_id in enumerate(bm25_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    for rank, doc_id in enumerate(vector_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    sorted_docs = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)

    result = {}
    for doc_id, score in sorted_docs[:top_n]:
        result[doc_id] = round(score, 4)

    return result
```

---

### 3. Semantic Similarity Search

#### Context
Before any reranking or hybrid tricks are added, the core of every RAG system is a single-stage semantic search: turn a query and a set of documents into vectors, and find which documents are closest in meaning using cosine similarity — the "search by meaning" idea that makes RAG possible.

#### Problem Statement
Using the `sentence-transformers` library, write a function `semantic_search(query, documents, top_k)`.

1. Use a bi-encoder model (`SentenceTransformer('all-MiniLM-L6-v2')`) to encode the query and every string in `documents` into embeddings.
2. Compute the cosine similarity between the query embedding and each document embedding.
3. Rank the documents by similarity score, highest first.
4. Select the top `top_k` documents.
5. Return a dictionary where each key is the 0-based index of a selected document in the original `documents` list, and each value is its cosine similarity score rounded to 2 decimal places.

#### Sample Input
```python
query = "How do I reset my router?"
documents = [
    "To pay your bill, visit the billing portal.",
    "Unplug the router for 30 seconds, then plug it back in to reset it.",
    "Our new internet plans are faster than ever.",
    "A factory reset can be done by holding the pinhole button for 10 seconds."
]
top_k = 2
```

#### Sample Output
```python
{1: 0.83, 3: 0.48}
```

#### Solution (Verified Correct)
```python
import sys
from sentence_transformers import SentenceTransformer, util


def semantic_search(query: str, documents: list[str], top_k: int) -> dict:
    model = SentenceTransformer("all-MiniLM-L6-v2")

    query_embedding = model.encode(query, convert_to_tensor=True)
    doc_embeddings = model.encode(documents, convert_to_tensor=True)

    scores = util.cos_sim(query_embedding, doc_embeddings)[0]

    ranked = [(i, float(scores[i])) for i in range(len(documents))]
    ranked.sort(key=lambda x: x[1], reverse=True)

    return {idx: round(score, 2) for idx, score in ranked[:top_k]}
```
All 12 answers from the test screenshots (9 Multiple Choice Questions in Section 1 and 3 Coding Questions in Section 2) have been verified and are **100% correct**.

---

## Section 1: Multiple Choice Questions (MCQs)

### 1. Question 01: Tokenizer Logic
**Question:** Why do LLMs use sub-word tokens instead of whole-word or single-letter tokens? *(Select any ONE)*

1. **[x] Tokens give a compact vocabulary (~100k chunks) while still being able to spell out any unseen word from familiar pieces** *(Correct)*
2. [ ] Whole words are always cheaper to process than tokens
3. [ ] Sub-word tokens eliminate the need for a context window
4. [ ] Sub-word tokens make the model completely bug-free

**Explanation:** Sub-word tokenization (such as BPE) balances vocabulary size and sequence length. Single-letter tokens create very long sequences, while whole-word tokens require an enormous vocabulary and fail on out-of-vocabulary (unseen) words. Sub-word tokens keep the vocabulary compact (~100k tokens) while allowing any novel word to be constructed from smaller known sub-word units.

---

### 2. Chain vs Agent
**Question:** What is the key difference between a "chain" and an "agent"? *(Select any ONE)*

1. [ ] A chain uses a web UI library while an agent does not
2. [ ] An agent always needs a vector database, a chain never does
3. **[x] A chain follows a fixed sequence of steps; an agent decides on its own, at runtime, whether to call a tool** *(Correct)*
4. [ ] There is no real difference — they are just two names for the same thing

**Explanation:** Chains execute a predetermined, hardcoded pipeline of steps (e.g., `prompt | llm | parser`), whereas agents use an LLM as a reasoning engine at runtime to dynamically decide which tools to call, in what order, and when to stop.

---

### 3. The Package Opener
**Question:** What does an output parser (like `StrOutputParser`) actually do in a chain? *(Select any ONE)*

1. [ ] It fetches website content for summarization
2. [ ] It stores conversation memory across sessions
3. [ ] It converts a prompt template's blanks into actual text
4. **[x] It unwraps the model's response package and hands back just the plain text string** *(Correct)*

**Explanation:** Chat models return a structured message object (such as `AIMessage`) containing metadata, token usage, and content. `StrOutputParser` extracts the `.content` string from the response object so downstream steps receive plain text.

---

### 4. The Boundary Problem
**Question:** Why is `"chunk_overlap"` used when splitting documents into chunks for retrieval? *(Select any ONE)*

1. [ ] To make the vector database run faster
2. **[x] To ensure a sentence sitting at a chunk boundary isn't split and missed entirely** *(Correct)*
3. [ ] To reduce the number of tokens billed per API call
4. [ ] To automatically translate text into multiple languages

**Explanation:** When documents are split into fixed-size chunks, an important sentence or thought can be cut in half across two adjacent chunks. Adding `chunk_overlap` repeats a small window of text across consecutive chunks so boundary context stays intact for embedding and retrieval.

---

### 5. The Three Gates
**Question:** What are the three independent "gates" that must all be open before an agent can successfully call a cloud-hosted model? *(Select any ONE)*

1. **[x] Credentials, IAM permission, and Model access (enabled per region)** *(Correct)*
2. [ ] Internet connection, RAM, and CPU speed
3. [ ] Python version, pip version, and OS type
4. [ ] Framework version, UI library version, and API key

**Explanation:** Calling a managed cloud LLM (such as AWS Bedrock) requires passing three independent checks: valid authentication credentials (who you are), IAM policy permissions (what API actions you are allowed to invoke, e.g., `bedrock:InvokeModel`), and model access enabled in that specific cloud region.

---

### 6. Function to Tool
**Question:** What three things must be added to a plain Python function to turn it into an agent-usable tool? *(Select any ONE)*

1. [ ] A class definition, a database connection, and a return statement
2. [ ] An API key, a region name, and a session object
3. [ ] A Gradio interface, a vector store, and an embedding model
4. **[x] A decorator marking it as a tool, type hints, and a clear docstring** *(Correct)*

**Explanation:** Agent frameworks (like LangChain and AWS Strands) inspect the `@tool` decorator to register the function, use the **type hints** to build the JSON schema for arguments, and pass the **docstring** to the LLM so it understands when and how to call the tool.

---

### 7. Resume Scan vs Interview
**Question:** Which of the following statements are **TRUE** about bi-encoders and cross-encoders used in reranking? *(Select ALL that apply)*

1. **[x] Bi-encoders encode the query and document separately, making them fast and pre-computable** *(Correct)*
2. [ ] Cross-encoders are used to grab the initial top 50–100 candidates from millions of chunks
3. **[x] Cross-encoders process the query and document together, giving higher accuracy but at slower speed** *(Correct)*
4. [ ] Bi-encoders always produce more accurate rankings than cross-encoders
5. **[x] Cross-encoder scores cannot be precomputed because each score is pair-specific** *(Correct)*

**Explanation:**
1. **Bi-encoders** (the "resume scan") compute embeddings for documents ahead of time and encode the query independently at search time, enabling fast vector similarity search over millions of chunks to get the initial top 50–100 candidates.
2. **Cross-encoders** (the "in-depth interview") feed the `(query, document)` pair jointly through cross-attention layers, yielding higher ranking accuracy but requiring a forward pass per pair at query time (so scores cannot be pre-computed).

---

### 8. Two Librarians
**Question:** Which of the following are **TRUE** about hybrid search (BM25 + vector search)? *(Select ALL that apply)*

1. **[x] BM25 excels at exact matches like SKU codes, product IDs, and legal references** *(Correct)*
2. **[x] Vector search excels at understanding paraphrases and semantic meaning, even without exact keyword overlap** *(Correct)*
3. [ ] Hybrid search eliminates the need for an LLM in the final answer generation step
4. **[x] Reciprocal Rank Fusion (RRF) merges the two ranked lists into one combined ranking** *(Correct)*
5. [ ] BM25 is better than vector search at understanding synonyms

**Explanation:**
1. **BM25** is a lexical/keyword retrieval algorithm that excels at exact token matching (IDs, error codes, specific terms).
2. **Vector search** uses dense embeddings to capture semantic similarity and synonyms even when exact words differ.
3. **Reciprocal Rank Fusion (RRF)** combines the ranked lists from both retrievers into a single unified ranking without needing score calibration.

---

### 9. Answers vs Goals
**Question:** Which of the following statements correctly describe the difference between a retrieval-based chatbot and a true agent? *(Select ALL that apply)*

1. **[x] A retrieval-based system grounds answers in fetched information, while an agent can act, observe results, and retry using tools** *(Correct)*
2. **[x] An agent runs a reasoning loop (reason → act → observe → repeat) until it judges the goal is met** *(Correct)*
3. [ ] A retrieval-based chatbot can also directly modify a database record when asked
4. [ ] An agent cannot use retrieval as part of its workflow
5. **[x] Retrieval answers questions; agents accomplish goals** *(Correct)*

**Explanation:** A RAG chatbot fetches relevant context to answer a user's question (read-only grounding), whereas an agent runs an iterative ReAct loop (`reason -> act -> observe -> repeat`), calling tools (which can include retrieval as well as write actions) until the user's goal is achieved.

---

## Section 2: Coding Questions

### 1. Token Cost Estimator

#### Context
LLMs charge per token, not per character or word. Before shipping any AI feature, an engineer needs a quick way to estimate how many tokens a piece of text will consume and what that will cost against a given pricing rate — exactly the "tokens, not words" intuition behind pricing an app.

#### Problem Statement
Write a function `estimate_token_cost(text, price_per_million)`.

1. Count the total number of characters in `text`.
2. Estimate the token count using the rule `"1 token ≈ 4 characters"` — i.e., `tokens = round(characters / 4)`, with a minimum of 1 token for any non-empty text.
3. Compute the cost as `(tokens / 1,000,000) * price_per_million`.
4. Return a single dictionary with three keys: `"characters"` (int), `"tokens"` (int), and `"cost"` (float, rounded to 6 decimal places).

#### Sample Input
```python
text = "AI Engineering is surprisingly approachable and powerful for beginners!"
price_per_million = 5.0
```

#### Sample Output
```python
{"characters": 71, "tokens": 18, "cost": 0.00009}
```

#### Solution (Verified Correct)
```python
import sys


def estimate_token_cost(text: str, price_per_million: float) -> dict:
    characters = len(text)
    if characters == 0:
        tokens = 0
    else:
        tokens = max(1, round(characters / 4))

    cost = round((tokens / 1_000_000) * price_per_million, 6)
    return {"characters": characters, "tokens": tokens, "cost": cost}
```

---

### 2. Hybrid Search Rank Fusion

#### Context
Pure keyword search (BM25) and pure semantic search (vector similarity) each catch things the other misses. Production RAG systems merge both rankings into one using Reciprocal Rank Fusion (RRF) — a simple formula that rewards documents ranked highly by either method, without needing to retrain or re-score anything.

#### Problem Statement
Write a function `reciprocal_rank_fusion(bm25_ranking, vector_ranking, k_constant, top_n)`.

1. `bm25_ranking` and `vector_ranking` are each a list of document IDs, ordered from most to least relevant (best result first) according to that retrieval method.
2. For every document appearing in either list, compute its RRF score as the sum of `1 / (k_constant + rank)` across each list it appears in, where `rank` is its 1-based position in that list. A document missing from a list contributes nothing from that list.
3. Sort all documents by their combined score, highest first.
4. Return a dictionary containing only the top `top_n` documents, mapping each document ID to its score rounded to 4 decimal places.

#### Input Format
```text
Line 1: T (number of test cases)

For each test case:
  Line 1: N1 - length of bm25_ranking
  Line 2: N1 space-separated integers (document IDs, best first)
  Line 3: N2 - length of vector_ranking
  Line 4: N2 space-separated integers (document IDs, best first)
  Line 5: k_constant (single integer)
  Line 6: top_n (single integer)
```

#### Sample Input
```python
bm25_ranking = [3, 1, 4, 2]
vector_ranking = [1, 2, 3, 5]
k_constant = 60
top_n = 3
```

#### Sample Output
```python
{1: 0.0325, 3: 0.0323, 2: 0.0318}
```

#### Solution (Verified Correct)
```python
import sys


def reciprocal_rank_fusion(
    bm25_ranking: list[int],
    vector_ranking: list[int],
    k_constant: int,
    top_n: int,
) -> dict:
    rrf_scores = {}

    for rank, doc_id in enumerate(bm25_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    for rank, doc_id in enumerate(vector_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    sorted_docs = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)

    result = {}
    for doc_id, score in sorted_docs[:top_n]:
        result[doc_id] = round(score, 4)

    return result
```

---

### 3. Semantic Similarity Search

#### Context
Before any reranking or hybrid tricks are added, the core of every RAG system is a single-stage semantic search: turn a query and a set of documents into vectors, and find which documents are closest in meaning using cosine similarity — the "search by meaning" idea that makes RAG possible.

#### Problem Statement
Using the `sentence-transformers` library, write a function `semantic_search(query, documents, top_k)`.

1. Use a bi-encoder model (`SentenceTransformer('all-MiniLM-L6-v2')`) to encode the query and every string in `documents` into embeddings.
2. Compute the cosine similarity between the query embedding and each document embedding.
3. Rank the documents by similarity score, highest first.
4. Select the top `top_k` documents.
5. Return a dictionary where each key is the 0-based index of a selected document in the original `documents` list, and each value is its cosine similarity score rounded to 2 decimal places.

#### Sample Input
```python
query = "How do I reset my router?"
documents = [
    "To pay your bill, visit the billing portal.",
    "Unplug the router for 30 seconds, then plug it back in to reset it.",
    "Our new internet plans are faster than ever.",
    "A factory reset can be done by holding the pinhole button for 10 seconds."
]
top_k = 2
```

#### Sample Output
```python
{1: 0.83, 3: 0.48}
```

#### Solution (Verified Correct)
```python
import sys
from sentence_transformers import SentenceTransformer, util


def semantic_search(query: str, documents: list[str], top_k: int) -> dict:
    model = SentenceTransformer("all-MiniLM-L6-v2")

    query_embedding = model.encode(query, convert_to_tensor=True)
    doc_embeddings = model.encode(documents, convert_to_tensor=True)

    scores = util.cos_sim(query_embedding, doc_embeddings)[0]

    ranked = [(i, float(scores[i])) for i in range(len(documents))]
    ranked.sort(key=lambda x: x[1], reverse=True)

    return {idx: round(score, 2) for idx, score in ranked[:top_k]}
```

