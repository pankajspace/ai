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

**Explanation:**
1. **Why Option 1 is correct:** Sub-word tokenization algorithms (such as Byte-Pair Encoding, or BPE) strike the optimal balance between vocabulary size and sequence length. Common words (e.g., `"apple"`) stay as single tokens, while rare, compound, or unseen words (e.g., `"tokenization"` or a new slang term) are broken down into smaller known sub-word pieces (`"token"` + `"ization"`). This keeps the vocabulary compact (~50k–100k tokens) while guaranteeing zero out-of-vocabulary (OOV) failures.
2. **Why Option 2 is wrong:** Whole-word vocabularies would require millions of entries (exploding the embedding matrix and output softmax layer size) and still fail on typos, new words, or code identifiers.
3. **Why Option 3 is wrong:** Every transformer architecture still operates within a finite context window measured in tokens; tokenization changes how text is segmented, not the attention memory limit.
4. **Why Option 4 is wrong:** Tokenization is purely a text-to-integer preprocessing step and does not prevent hallucinations or model bugs.

---

### 2. Chain vs Agent
**Question:** What is the key difference between a "chain" and an "agent"? *(Select any ONE)*

1. [ ] A chain uses a web UI library while an agent does not
2. [ ] An agent always needs a vector database, a chain never does
3. **[x] A chain follows a fixed sequence of steps; an agent decides on its own, at runtime, whether to call a tool** *(Correct)*
4. [ ] There is no real difference — they are just two names for the same thing

**Explanation:**
1. **Why Option 3 is correct:**
   - A **chain** is a deterministic, hardcoded pipeline of operations defined by the developer ahead of time (for example, `prompt | llm | output_parser`). Every input flows through the exact same sequence of steps.
   - An **agent** uses the LLM as a runtime reasoning engine: given a user goal and a set of available tools, the model dynamically decides *which* tool to call, *with what arguments*, whether to call another tool based on the observation, and when it has enough information to return the final answer.
2. **Why Option 1 is wrong:** Both chains and agents are backend execution patterns; either can be paired with (or run without) a web UI like Gradio or Streamlit.
3. **Why Option 2 is wrong:** Chains frequently use vector databases (standard RAG is typically a fixed chain: retrieve → augment prompt → generate), while an agent might only use calculator or API tools without any vector database.
4. **Why Option 4 is wrong:** They represent fundamentally different control flows — developer-determined control flow (chain) vs. LLM-determined control flow (agent).

---

### 3. The Package Opener
**Question:** What does an output parser (like `StrOutputParser`) actually do in a chain? *(Select any ONE)*

1. [ ] It fetches website content for summarization
2. [ ] It stores conversation memory across sessions
3. [ ] It converts a prompt template's blanks into actual text
4. **[x] It unwraps the model's response package and hands back just the plain text string** *(Correct)*

**Explanation:**
1. **Why Option 4 is correct:** When you invoke a chat model in frameworks like LangChain, it does not return a raw Python string — it returns a rich message object (such as `AIMessage`) containing `.content` alongside response metadata, token usage counts, stop reasons, and tool call payloads. `StrOutputParser` acts as a "package opener" at the end of a chain (`prompt | llm | StrOutputParser()`), extracting just the `.content` string so downstream code or UI components receive clean plain text.
2. **Why Option 1 is wrong:** Fetching website content is the job of a document loader or web-scraping tool (e.g., `WebBaseLoader`), not an output parser.
3. **Why Option 2 is wrong:** Storing conversation history across turns/sessions is handled by memory/checkpointer components, not output parsers.
4. **Why Option 3 is wrong:** Filling template placeholders (`{topic}`, `{question}`) with variable values is the job of `PromptTemplate` / `ChatPromptTemplate` at the *start* of the chain.

---

### 4. The Boundary Problem
**Question:** Why is `"chunk_overlap"` used when splitting documents into chunks for retrieval? *(Select any ONE)*

1. [ ] To make the vector database run faster
2. **[x] To ensure a sentence sitting at a chunk boundary isn't split and missed entirely** *(Correct)*
3. [ ] To reduce the number of tokens billed per API call
4. [ ] To automatically translate text into multiple languages

**Explanation:**
1. **Why Option 2 is correct:** When splitting a long document into fixed-size chunks (e.g., `chunk_size=500`), a key fact or sentence sitting right at character 500 can get sliced in half — leaving the subject in Chunk 1 and the predicate/answer in Chunk 2. Neither half alone may carry enough semantic meaning to match the user's query during retrieval. Setting `chunk_overlap` (e.g., `50–100` characters/tokens) slides the window back slightly so the tail end of Chunk 1 is repeated at the beginning of Chunk 2, preserving complete context across boundaries.
2. **Why Option 1 is wrong:** Overlap slightly *increases* the total number of chunks/text stored, so it does not speed up vector search.
3. **Why Option 3 is wrong:** Because overlapping text is embedded across adjacent chunks, it slightly *increases* token volume during indexing rather than reducing API cost.
4. **Why Option 4 is wrong:** Text splitters only slice strings by character/token counts and separators; they perform no translation.

---

### 5. The Three Gates
**Question:** What are the three independent "gates" that must all be open before an agent can successfully call a cloud-hosted model? *(Select any ONE)*

1. **[x] Credentials, IAM permission, and Model access (enabled per region)** *(Correct)*
2. [ ] Internet connection, RAM, and CPU speed
3. [ ] Python version, pip version, and OS type
4. [ ] Framework version, UI library version, and API key

**Explanation:**
1. **Why Option 1 is correct:** When calling a managed enterprise cloud LLM service (such as AWS Bedrock), a request must pass three separate cloud security and provisioning gates:
   - **Gate 1 — Credentials (Authentication):** Valid AWS access keys / session token proving *who* is making the request (`aws configure` / environment variables).
   - **Gate 2 — IAM Permission (Authorization):** An IAM policy attached to that identity granting permission to call inference APIs (e.g., `bedrock:InvokeModel` / `bedrock:Converse`).
   - **Gate 3 — Model Access (Per-Region Provisioning):** The specific foundation model (e.g., Claude Sonnet or Titan) must be enabled/subscribed in the exact AWS region (`us-east-1`, `us-west-2`, etc.) targeted by the client.
2. **Why Options 2, 3, and 4 are wrong:** Local hardware specs, OS/pip versions, or UI libraries are general local environment factors, not the three cloud access-control gates governing managed model invocation.

---

### 6. Function to Tool
**Question:** What three things must be added to a plain Python function to turn it into an agent-usable tool? *(Select any ONE)*

1. [ ] A class definition, a database connection, and a return statement
2. [ ] An API key, a region name, and a session object
3. [ ] A Gradio interface, a vector store, and an embedding model
4. **[x] A decorator marking it as a tool, type hints, and a clear docstring** *(Correct)*

**Explanation:**
1. **Why Option 4 is correct:** Agent frameworks (such as AWS Strands Agents and LangChain) convert a regular Python function into an LLM-callable tool by inspecting three things:
   - **The `@tool` decorator:** Registers the function with the agent framework as an executable tool.
   - **Type hints (`param: str -> dict`):** Automatically inspected to generate the JSON Schema telling the LLM the exact parameter names and data types expected.
   - **A clear docstring (`"""..."""`):** Sent directly to the LLM in the system/tool prompt so the model knows *what* the tool does and *when* to invoke it.
2. **Why Options 1, 2, and 3 are wrong:** A tool can be a pure local helper function (like a unit converter or calculator) that needs no classes, database connections, cloud sessions, UI, or vector stores.

---

### 7. Resume Scan vs Interview
**Question:** Which of the following statements are **TRUE** about bi-encoders and cross-encoders used in reranking? *(Select ALL that apply)*

1. **[x] Bi-encoders encode the query and document separately, making them fast and pre-computable** *(Correct)*
2. [ ] Cross-encoders are used to grab the initial top 50–100 candidates from millions of chunks
3. **[x] Cross-encoders process the query and document together, giving higher accuracy but at slower speed** *(Correct)*
4. [ ] Bi-encoders always produce more accurate rankings than cross-encoders
5. **[x] Cross-encoder scores cannot be precomputed because each score is pair-specific** *(Correct)*

**Explanation:**
1. **Bi-encoders = "The 5-Second Resume Scan" (Option 1 is TRUE):** A bi-encoder embeds documents and queries *independently* into fixed-size vectors. Because document embeddings do not depend on the user's query, all millions of document chunks can be embedded once offline and indexed in a vector database. At query time, only the query is embedded and compared via fast cosine similarity to retrieve the top 50–100 candidates.
2. **Cross-encoders = "The 30-Minute In-Depth Interview" (Options 3 and 5 are TRUE):** A cross-encoder concatenates `[CLS] query [SEP] document [SEP]` and passes both *together* through every self-attention layer of the transformer, outputting a single relevance score. Because every token in the query can attend to every token in the document, it captures fine-grained nuance and word order much more accurately than a single compressed vector — but since it requires a full forward pass for every `(query, doc)` pair at runtime, scores cannot be precomputed offline.
3. **Why Option 2 is FALSE:** Running a cross-encoder across millions of chunks at query time would take minutes or hours; bi-encoders (or BM25) grab the initial top 50–100 candidates, and the cross-encoder only reranks that small shortlist down to the final top 3–5.
4. **Why Option 4 is FALSE:** Cross-encoders are significantly *more* accurate than bi-encoders because joint cross-attention prevents information loss from compressing a whole passage into one static vector.

---

### 8. Two Librarians
**Question:** Which of the following are **TRUE** about hybrid search (BM25 + vector search)? *(Select ALL that apply)*

1. **[x] BM25 excels at exact matches like SKU codes, product IDs, and legal references** *(Correct)*
2. **[x] Vector search excels at understanding paraphrases and semantic meaning, even without exact keyword overlap** *(Correct)*
3. [ ] Hybrid search eliminates the need for an LLM in the final answer generation step
4. **[x] Reciprocal Rank Fusion (RRF) merges the two ranked lists into one combined ranking** *(Correct)*
5. [ ] BM25 is better than vector search at understanding synonyms

**Explanation:**
1. **The Keyword Librarian — BM25 (Option 1 is TRUE, Option 5 is FALSE):** BM25 scores documents based on exact term frequency and inverse document frequency (TF-IDF family). It shines when a user searches for exact strings like error codes (`ERR_404_TIMEOUT`), SKU numbers (`SKU-9981`), function names, or legal section numbers where dense embeddings often blur details. However, because it matches literal tokens, it fails on synonyms (e.g., `"laptop"` vs. `"notebook"`).
2. **The Meaning Librarian — Vector Search (Option 2 is TRUE):** Dense vector search maps text into a semantic embedding space where paraphrases and synonyms land close together, even when they share zero keywords (e.g., `"How do I fix a frozen screen?"` matching `"Troubleshooting unresponsive display"`).
3. **Merging Lists with RRF (Option 4 is TRUE):** Because BM25 scores (unbounded positive numbers) and cosine similarity scores (`[-1, 1]`) live on incompatible scales, you cannot simply add raw scores. **Reciprocal Rank Fusion (RRF)** solves this by scoring each document based only on its *rank position* in each list: $\text{RRF}(d) = \sum \frac{1}{k + \text{rank}(d)}$, rewarding documents that rank well in either or both lists.
4. **Why Option 3 is FALSE:** Hybrid search only improves the *Retrieval* step of RAG; you still need the LLM in the *Generation* step to read the retrieved chunks and synthesize the final answer.

---

### 9. Answers vs Goals
**Question:** Which of the following statements correctly describe the difference between a retrieval-based chatbot and a true agent? *(Select ALL that apply)*

1. **[x] A retrieval-based system grounds answers in fetched information, while an agent can act, observe results, and retry using tools** *(Correct)*
2. **[x] An agent runs a reasoning loop (reason → act → observe → repeat) until it judges the goal is met** *(Correct)*
3. [ ] A retrieval-based chatbot can also directly modify a database record when asked
4. [ ] An agent cannot use retrieval as part of its workflow
5. **[x] Retrieval answers questions; agents accomplish goals** *(Correct)*

**Explanation:**
1. **Retrieval (RAG) = Answering Questions (Options 1 and 5 are TRUE):** A retrieval-based chatbot is a read-only system designed to ground LLM responses in trusted company documents (e.g., *"What is our refund policy?"*). It fetches relevant chunks and summarizes them into an answer.
2. **Agents = Accomplishing Multi-Step Goals via ReAct (Options 1, 2, and 5 are TRUE):** A true agent operates in an autonomous **ReAct loop** (**Re**ason → **Act** by calling a tool → **Observe** the tool's output → **Repeat** or recover from errors) until the user's goal is completed (e.g., *"Look up order #123, check if it qualifies for a refund, process the refund, and email the receipt"*).
3. **Why Option 3 is FALSE:** A pure retrieval-based chatbot only reads from a knowledge base; modifying external state (updating databases, sending emails, issuing refunds) requires agent tool execution.
4. **Why Option 4 is FALSE:** Agents routinely use retrieval as one of their tools (often called **Agentic RAG**), combining knowledge lookup with action tools.

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
    # Step 1: Count the total number of characters in the input string
    characters = len(text)

    # Step 2: Estimate token count using the "1 token ≈ 4 characters" rule of thumb.
    # - Empty strings ("") consume 0 tokens.
    # - For any non-empty string (e.g., 1 character where round(1 / 4) == 0),
    #   max(1, ...) acts as a floor so the token count is never less than 1.
    if characters == 0:
        tokens = 0
    else:
        tokens = max(1, round(characters / 4))

    # Step 3: Calculate the API cost based on the rate per 1,000,000 tokens
    # (1_000_000 uses Python underscores as visual thousands separators, equal to 1000000)
    # and round to 6 decimal places as required by the specification.
    cost = round((tokens / 1_000_000) * price_per_million, 6)

    # Step 4: Return the structured summary dictionary
    return {"characters": characters, "tokens": tokens, "cost": cost}
```

#### Python Shorthands & Idioms Explained
1. **`max(1, round(characters / 4))` (Clamping / Floor Shorthand):**
   - `round(characters / 4)` divides the character count by 4 and rounds to the nearest integer. For a 1-character string (`"a"`), `1 / 4` is `0.25`, which rounds down to `0`.
   - Wrapping it in `max(1, ...)` compares `1` against the rounded number and picks whichever is larger — guaranteeing a minimum of `1` token in a single line.
   - **Expanded multi-line equivalent:**
     ```python
     tokens = round(characters / 4)
     if tokens < 1:
         tokens = 1
     ```
2. **`1_000_000` (Numeric Literal Underscores):**
   - Python allows underscores inside numbers (`1_000_000`) purely for human readability so you don't miscount zeros. Python treats `1_000_000` identically to `1000000`.

#### Walkthrough with Sample Input
1. **Character Count:** `len("AI Engineering is surprisingly approachable and powerful for beginners!")` returns `71`.
2. **Token Estimate:** `71 / 4 = 17.75`, and `round(17.75)` evaluates to `18` (which is ≥ 1).
3. **Cost Calculation:** `(18 / 1_000_000) * 5.0 = 0.00009`, which rounds to `0.00009`.

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
    # Dictionary mapping each document ID -> its accumulated RRF score
    rrf_scores = {}

    # Step 1: Accumulate RRF contributions from the BM25 keyword ranking.
    # - enumerate(..., start=1) yields (rank, doc_id) pairs with rank starting at 1.
    # - rrf_scores.get(doc_id, 0.0) fetches the existing score for doc_id, or returns
    #   0.0 if doc_id is not yet in the dictionary.
    for rank, doc_id in enumerate(bm25_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    # Step 2: Accumulate RRF contributions from the dense vector similarity ranking.
    # Documents appearing in BOTH lists have their two scores summed together;
    # documents appearing in only one list start at 0.0 and get this single score.
    for rank, doc_id in enumerate(vector_ranking, start=1):
        rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (k_constant + rank))

    # Step 3: Sort all candidate documents by their combined RRF score (highest first).
    # - rrf_scores.items() produces (doc_id, score) tuples, e.g., [(3, 0.0323), (1, 0.0325), ...].
    # - key=lambda item: item[1] tells sorted() to compare each tuple by index 1 (the score)
    #   instead of index 0 (the doc_id).
    # - reverse=True sorts in descending order (largest score first).
    sorted_docs = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)

    # Step 4: Slice the first top_n tuples (sorted_docs[:top_n]) and build the final
    # dictionary with scores rounded to 4 decimal places.
    result = {}
    for doc_id, score in sorted_docs[:top_n]:
        result[doc_id] = round(score, 4)

    return result
```

#### Python Shorthands & Idioms Explained
1. **`for rank, doc_id in enumerate(bm25_ranking, start=1):` (1-Based Enumeration & Tuple Unpacking):**
   - Normally, list indices start at `0`. Passing `start=1` tells `enumerate()` to count positions starting from `1` (`1, 2, 3, ...`), which matches the 1-based `rank` in the RRF formula $\frac{1}{k + \text{rank}}$.
   - On each iteration, `enumerate()` yields a 2-tuple `(rank, doc_id)` (for example, `(1, 3)` on the first element of `[3, 1, 4, 2]`), which Python unpacks directly into the variables `rank` and `doc_id`.
   - **Expanded equivalent without `enumerate`:**
     ```python
     rank = 1
     for doc_id in bm25_ranking:
         ...
         rank += 1
     ```
2. **`rrf_scores.get(doc_id, 0.0)` (Safe Dictionary Lookup with Default):**
   - Indexing `rrf_scores[doc_id]` directly when `doc_id` has not been seen yet would raise a `KeyError`.
   - `.get(doc_id, 0.0)` checks if `doc_id` exists in `rrf_scores`: if it does, it returns the current score; if not, it returns the fallback value `0.0`.
   - **Expanded equivalent with `if / else`:**
     ```python
     if doc_id not in rrf_scores:
         rrf_scores[doc_id] = 0.0
     rrf_scores[doc_id] = rrf_scores[doc_id] + (1.0 / (k_constant + rank))
     ```
3. **`sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)` (Sorting a Dictionary by Value):**
   - **`rrf_scores.items()`:** A dictionary cannot be sorted directly, so `.items()` turns `{3: 0.03226, 1: 0.03252, ...}` into a sequence of `(key, value)` tuples: `[(3, 0.03226), (1, 0.03252), ...]`.
   - **`key=lambda item: item[1]`:** By default, Python sorts tuples by their first element (`item[0]`, the `doc_id`). We want to sort by the *score* (`item[1]`). `lambda item: item[1]` is a one-line anonymous function that takes one `(doc_id, score)` tuple (`item`) and returns `item[1]` (the score) as the sorting key.
   - **`reverse=True`:** Changes the sort order from ascending (lowest score first) to descending (highest score first).
   - **Expanded equivalent using a named helper function:**
     ```python
     def get_score(item):
         # item is a (doc_id, score) tuple; return the score at index 1
         return item[1]

     sorted_docs = sorted(rrf_scores.items(), key=get_score, reverse=True)
     ```
4. **`sorted_docs[:top_n]` (List Slicing):**
   - `[:top_n]` is slice notation for `sorted_docs[0:top_n]`, which takes at most the first `top_n` elements from the start of the sorted list and ignores the rest.

#### Walkthrough with Sample Input (`k_constant = 60`, `top_n = 3`)
1. **Doc `1`:** Rank 2 in BM25 + Rank 1 in Vector $\rightarrow \frac{1}{60+2} + \frac{1}{60+1} = \frac{1}{62} + \frac{1}{61} \approx 0.016129 + 0.016393 = 0.032522 \rightarrow \mathbf{0.0325}$.
2. **Doc `3`:** Rank 1 in BM25 + Rank 3 in Vector $\rightarrow \frac{1}{60+1} + \frac{1}{60+3} = \frac{1}{61} + \frac{1}{63} \approx 0.016393 + 0.015873 = 0.032266 \rightarrow \mathbf{0.0323}$.
3. **Doc `2`:** Rank 4 in BM25 + Rank 2 in Vector $\rightarrow \frac{1}{60+4} + \frac{1}{60+2} = \frac{1}{64} + \frac{1}{62} \approx 0.015625 + 0.016129 = 0.031754 \rightarrow \mathbf{0.0318}$.
4. **Doc `4`:** Rank 3 in BM25 only $\rightarrow \frac{1}{60+3} = \frac{1}{63} \approx 0.0159$ (excluded by `top_n = 3`).
5. **Doc `5`:** Rank 4 in Vector only $\rightarrow \frac{1}{60+4} = \frac{1}{64} \approx 0.0156$ (excluded by `top_n = 3`).

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
    # Step 1: Load the pretrained bi-encoder embedding model (384-dimensional vectors)
    model = SentenceTransformer("all-MiniLM-L6-v2")

    # Step 2: Encode the query string and all document strings into PyTorch tensors
    # so they can be compared directly using vector math.
    query_embedding = model.encode(query, convert_to_tensor=True)
    doc_embeddings = model.encode(documents, convert_to_tensor=True)

    # Step 3: Compute cosine similarity between the query (shape: [1, 384]) and all
    # documents (shape: [N, 384]). util.cos_sim returns a 2D tensor of shape [1, N],
    # so indexing [0] extracts the 1D row of N similarity scores for our single query.
    scores = util.cos_sim(query_embedding, doc_embeddings)[0]

    # Step 4: Build a list of (doc_index, similarity_score) tuples using a list
    # comprehension, then sort the list in-place from highest score to lowest score.
    ranked = [(i, float(scores[i])) for i in range(len(documents))]
    ranked.sort(key=lambda x: x[1], reverse=True)

    # Step 5: Use a dictionary comprehension over the top_k slice to return
    # {doc_index: rounded_score} rounded to 2 decimal places.
    return {idx: round(score, 2) for idx, score in ranked[:top_k]}
```

#### Python Shorthands & Idioms Explained
1. **`scores = util.cos_sim(query_embedding, doc_embeddings)[0]` (2D Matrix Row Indexing):**
   - `util.cos_sim(A, B)` is designed to compare *batches* of queries against *batches* of documents, returning a 2D grid (matrix) of shape `[num_queries, num_documents]`.
   - Because we passed only **1 query** and **4 documents**, the output tensor has shape `[1, 4]`, e.g., `tensor([[0.14, 0.83, 0.11, 0.48]])`.
   - Adding `[0]` at the end grabs the first (and only) row, unwrapping it into a 1D tensor of 4 scores: `tensor([0.14, 0.83, 0.11, 0.48])`.
2. **`ranked = [(i, float(scores[i])) for i in range(len(documents))]` (List Comprehension):**
   - **Why we pair `i` with `scores[i]`:** If we sorted `scores` alone, we would lose track of *which* original document each score belonged to. Pairing `(i, float(scores[i]))` keeps the original 0-based index `i` glued to its score during sorting.
   - **Why `float(scores[i])` is needed:** Each `scores[i]` is a PyTorch scalar `Tensor` (e.g., `tensor(0.8312)`), not a plain Python float. Wrapping it in `float(...)` converts it into a standard Python `float` so `round()` and JSON/dict serialization work cleanly.
   - **How the list comprehension works:** `[EXPRESSION for VAR in ITERABLE]` loops `i` from `0` to `len(documents) - 1` and collects each `(i, float(scores[i]))` tuple into a new list.
   - **Expanded multi-line `for` loop equivalent:**
     ```python
     ranked = []
     for i in range(len(documents)):
          pair = (i, float(scores[i]))
          ranked.append(pair)
     ```
3. **`ranked.sort(key=lambda x: x[1], reverse=True)` (In-Place List Sorting with `lambda`):**
   - Each element `x` inside `ranked` is a 2-tuple `(doc_index, score)`, where `x[0]` is `doc_index` and `x[1]` is `score`.
   - `key=lambda x: x[1]` tells `.sort()` to order the tuples by `x[1]` (the similarity score) rather than `x[0]` (the document index).
   - `reverse=True` sorts in descending order (highest similarity first).
   - **`.sort()` vs `sorted()`:** `ranked.sort(...)` modifies the `ranked` list *in-place* (and returns `None`), whereas `sorted(ranked, ...)` creates and returns a *new* sorted list.
4. **`{idx: round(score, 2) for idx, score in ranked[:top_k]}` (Dictionary Comprehension + Slicing + Unpacking):**
   - This single return statement combines three Python idioms:
     - **Slicing (`ranked[:top_k]`):** Takes only the first `top_k` tuples from the already-sorted `ranked` list (e.g., `[(1, 0.8312), (3, 0.4789)]`).
     - **Tuple Unpacking (`for idx, score in ...`):** Splits each `(doc_index, score)` tuple into two named variables: `idx` and `score`.
     - **Dictionary Comprehension (`{KEY_EXPR: VAL_EXPR for ...}`):** Builds a new dictionary mapping `idx` to `round(score, 2)`.
   - **Expanded multi-line `for` loop equivalent:**
     ```python
     result = {}
     for idx, score in ranked[:top_k]:
         result[idx] = round(score, 2)
     return result
     ```

#### Walkthrough with Sample Input
1. **Index `1` (`0.83`):** `"Unplug the router for 30 seconds, then plug it back in to reset it."` directly answers how to reset a router, giving the highest semantic similarity.
2. **Index `3` (`0.48`):** `"A factory reset can be done by holding the pinhole button for 10 seconds."` is semantically related to resetting hardware (even without repeating the word `"router"`), taking second place.
3. **Indices `0` and `2`:** Billing and marketing sentences have low cosine similarity to the troubleshooting query and are filtered out by `top_k = 2`.
