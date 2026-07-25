[<- README](../../README.md) | [Notes](rag-embeddings.html)

# AI Infused Learning - 3

# Contact
- [Shivank](mailto:[shivank.agrawal_1@scaler.com])

# Links
1. [Class 3 Notes](https://scaler-content.github.io/class-3-AI-engg/)
2. [Pinecone](https://www.pinecone.io/)
3. [Chroma](https://www.trychroma.com/)

# Homework
Anki Notes Project

# My Notes

## 0. Where This Class Fits
By now you can call any LLM, snap a LangChain chain together, pass chat history, and build an agent that picks tools. But that agent has two real problems: it doesn't know *your* stuff (company docs, PDFs, last week's release notes), and when it doesn't know, it confidently makes things up. Class 3 is the single biggest fix in AI engineering — the same agent loop, but now it can look things up in a library *you* built. That's **RAG**.

## 1. Why RAG Exists
An LLM is like a brilliant intern who finished training a year ago and was never allowed inside your office. RAG fixes both problems by handing the intern a relevant page *at question-time*. It solves four core LLM weaknesses:

1. **🗓️ Knowledge cutoff** — training ended months ago; it doesn't know yesterday's news. *Fix: fetch today's article.*
2. **🔒 Private / internal data** — it has never seen your HR policy, contracts, product wiki, or tickets, and you can't paste them all into one prompt. *Fix: search your docs.*
3. **🌀 Hallucinations** — when unsure, it invents confident-sounding answers. Bad in support, dangerous in legal, fatal in healthcare. *Fix: ground it in real text.*
4. **🔗 No citations** — a raw LLM can't answer "where did you get that?" Real products need *"see source: page 14."* *Fix: return the source chunk.*

**The one-line definition:** RAG = **R**etrieval-**A**ugmented **G**eneration. Before the model answers, *you* retrieve the most relevant snippets from your own data and stuff them into the prompt. The model answers *from* those snippets — no retraining, just an **open-book exam instead of a closed-book one.**

**Why not just fine-tune?** It's usually the wrong first move: it's expensive/slow to redo every time data changes, it still can't cite sources, and it still hallucinates. RAG is faster, cheaper, and traceable.

## 2. The Mental Model — a Smart Librarian
Ask a friend a question about an 800-page book they've never read and they'll guess. Smart move: find the 3 most relevant pages, hand them over, *then* ask — now they answer confidently with real text. That librarian who finds the pages is the only new thing we build today.

**The 5-box pipeline (memorise this):**

```
❓ Question → 🔎 Search (find chunks) → 📋 Stuff (add to prompt) → 🧠 LLM (answer) → 💬 Answer (+ citation)
       1                2                         3                       4                    5
```

Boxes 1, 4, and 5 you already knew from Class 1. Boxes 2 and 3 (the "librarian") are the entire job of RAG.

**Two phases — don't confuse them:**

1. **Indexing (offline, once):** read docs → break into chunks → turn each chunk into an embedding → store in a vector DB. Slow, but only done when documents change.
2. **Querying (online, every question):** turn the question into a vector → find the nearest chunks → paste them into the prompt → LLM answers. Milliseconds per query.

**The unlock:** you are *not* retraining the model. It stays exactly the same `gpt-4o-mini` from Class 1; you only change *what goes into the prompt*. RAG is, at its core, very fancy *automated prompt engineering*.

## 3. Embeddings — Words Become Coordinates
To "search by meaning" we must turn meaning into numbers — that's an **embedding**: a list of numbers (a *vector*) that captures the meaning of a piece of text. Similar meanings → nearby points; different meanings → far apart.

Imagine plotting people by *height vs weight* — similar builds cluster together. Real embeddings do the same for *meaning*, except in **384, 768, or even 3072 dimensions**, because meaning is rich: topic, tone, formality, language, and sentiment each get their own axis.

**The *aha* — embedding math actually works.** Trained on enough text, vectors carry real relationships you can do arithmetic on:

```text
king  − man    + woman   ≈ queen
paris − france + india   ≈ delhi
tokyo − japan  + germany ≈ berlin
```

The model was never told "queen is the female king" — that pattern *emerges* from the geometry of meaning. This is why "find the chunk most similar to my question" is just arithmetic: **search by meaning = nearest point in vector space.**

**Cosine similarity — the score we use.** It measures the *angle* between two vectors, from −1 (opposite) through 0 (unrelated) to +1 (identical). Practically: above ~0.7 = "very similar", below ~0.3 = "barely related". The clock-hands intuition: two hands at the same time → angle 0 → cosine 1 → identical; at 12 and 6 → angle 180° → cosine −1 → opposite. Only the angle matters, not the length, so differences in text length don't distort the score.

**Getting an embedding is one function call:**

```python
# embeddings.py
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")   # ① free, fast, 384 dims

vec = model.encode("A cat is sleeping on the couch")  # ② that's an embedding!
print(vec.shape)         # → (384,)  — 384 numbers
print(vec[:5])           # → [-0.05, 0.12, 0.41, -0.08, 0.22] (something like that)

# to compare two pieces of text → encode both → take cosine similarity
from numpy import dot
from numpy.linalg import norm

v1 = model.encode("A cat is sleeping on the couch")
v2 = model.encode("A kitten is napping on the sofa")
similarity = dot(v1, v2) / (norm(v1) * norm(v2))   # cosine
print(similarity)        # → 0.87 (very similar 🎉)
```

1. `all-MiniLM-L6-v2` is a tiny but excellent open-source model — runs on your laptop, no API key, 384 dimensions (the class default). Production options: `BAAI/bge-large-en-v1.5` (best open-source English) or OpenAI's `text-embedding-3-small` (paid, very good multilingual).
2. `.encode("text")` returns the vector — the whole API surface is that one call.

## 4. Chunking — Cut the Book Into Snippets
You can't embed a 200-page PDF as one vector — the meaning averages into mush. So you split into **chunks**. It's like slicing a pizza: one whole pie is too big to share, but confetti-sized bits are tasteless too. Too-big chunks lose precision (the relevant bit is buried in fluff); too-small chunks lose context (each crumb is meaningless). How you chunk quietly decides how good your RAG is.

**Four chunking strategies worth knowing:**

1. **📏 Fixed size** — every N characters/tokens. Brain-dead simple and fast, but chops mid-sentence. *Best for prototypes.*
2. **🔁 Recursive** — split on paragraphs first, then sentences, then words as a fallback ladder. LangChain's default. *Best for most real apps.*
3. **🧠 Semantic** — embed each sentence and group consecutive ones on the same topic. Chunks follow meaning, not size. *Best for long flowing prose.*
4. **📑 Structure-aware** — follow the document's own structure (markdown headings, code blocks, HTML sections). *Best for docs, code, and wikis.*

**Recall vs precision tradeoff:** big chunks give high recall (the answer is probably in there) but low precision (lots of fluff); small chunks the reverse. Chunk size is usually the first RAG tuning knob.

```python
# chunk.py
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,        # aim for ~800 chars per chunk
    chunk_overlap=100,     # adjacent chunks share 100 chars (context glue)
)

chunks = splitter.split_text(your_long_document)
print(len(chunks))    # → e.g. 47 chunks ready to embed
```

**Why `chunk_overlap`?** If a question's answer sits exactly on a chunk boundary, you'd miss it. Overlap (50–100 chars) ensures every sentence appears fully in at least one chunk — cheap insurance.

## 5. Vector Databases — a Search Engine for Meaning
You have thousands of embeddings; for every question you need the top-k nearest ones — *fast*. A vector database is a search engine where, instead of "find documents containing this word," the query is "find the vectors closest to *this* vector." Same idea as Google, swapped engine. It does just three things:

1. `db.add(documents, embeddings)` — store chunks + vectors (indexing).
2. `db.query(query_vector, k=3)` — return the k nearest chunks (retrieval).
3. `db.delete(ids)` — remove chunks when a doc is deleted.

**The three names you'll hear:**

1. **🟢 Chroma** — open-source, runs in-process (no server), one `pip install`. Great up to ~10M vectors. *The class default.*
2. **🔵 Pinecone** — fully managed SaaS, zero ops, scales to billions, paid. The boring-and-reliable production choice.
3. **🟣 Qdrant** — open-source *and* production-grade. A great middle ground when you outgrow Chroma.

LangChain wraps all of them with the same interface, so swapping later is a one-line change.

**HNSW — the trick behind the speed.** Searching billions of vectors naively means billions of distance calculations per query. HNSW (Hierarchical Navigable Small World, a 2018 algorithm) builds a "ladder" graph so each query takes only ~log(N) hops → sub-10ms lookups on 100M vectors. You never write it; every vector DB ships it built-in.

## 6. Build a Real RAG in ~30 Lines
Every RAG system in production is a fancier version of this. It's two files: index once, then query every time.

### Step 1 — Index your documents (once). Store them in a vector database.
```python
# index.py

# This is a splitter used to split the text into chunks
from langchain_text_splitters import RecursiveCharacterTextSplitter
# This is a model used to generate embeddings
from langchain_huggingface import HuggingFaceEmbeddings
# This is a vector database used to store embeddings
from langchain_chroma import Chroma

# STEP 1: load your documents (any text — for now, hardcoded)
docs = [
    "Our return policy allows refunds within 30 days of purchase.",
    "Shipping is free for orders above ₹999 across India.",
    "For corporate orders above 50 units, contact sales@example.com.",
    "Our office is in Indiranagar, Bangalore. Open Mon-Fri 10am-7pm.",
]

# STEP 2: split into chunks (small docs here, but production = thousands of pages)
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.create_documents(docs)

# STEP 3: pick an embedding model (free, runs locally, no API key)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# STEP 4: build the vector store from chunks + embeddings (saves to disk)
db = Chroma.from_documents(chunks, embedder, persist_directory="./chroma_db")

# STEP 5: print the number of chunks indexed
print(f"Indexed {len(chunks)} chunks 🎉")
```

### Step 2 — Ask a question (every time)
```python
# rag.py
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
load_dotenv()

# ⑤ open the same vector store we built in step 1
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db       = Chroma(persist_directory="./chroma_db", embedding_function=embedder)
model    = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ⑥ the prompt: instructions + chunks + question
prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I don't know." Be concise and quote facts directly.

Context:
{context}

Question: {question}
""")

def rag_answer(question):
    chunks = db.similarity_search(question, k=3)         # ⑦ retrieve top 3
    context = "\n\n".join(c.page_content for c in chunks)
    chain = prompt | model                                # ⑧ same chain trick as Class 2
    return chain.invoke({"context": context, "question": question}).content

print(rag_answer("How long do I have to return something?"))
# → "30 days from the purchase date."  ✅ from your data, not a guess
```

The 8 numbered steps:

1. Your data — in real life: PDFs, web pages, Notion exports, anything text.
2. Chunk it. `chunk_size=500` is a sane default.
3. Pick an embedder — free local one; swap to `OpenAIEmbeddings()` for a paid, slightly better version.
4. `Chroma.from_documents` embeds every chunk and stores text + vector. Done once per dataset.
5. Reopen the same database — embeddings already on disk, no re-encoding.
6. The magic prompt template: `"ONLY the context below"` is the most important hallucination-fighter in RAG — the moment the system *refuses to make something up* is the whole point.
7. `similarity_search` = embed the question, find the 3 nearest chunks, return them. The librarian.
8. The same LangChain pipe (`prompt | model`) from Class 2 — RAG slots right into your previous knowledge.

## 7. Make It Better — Reranking + Hybrid Search
About 80% of RAG quality lives in these two easy-to-add tricks.

### Problem 1: the top-5 from vector search isn't the *best* 5
Embedding similarity is fast but sometimes ranks shallow word-matches above deep semantic ones. The fix is **two-stage retrieval** — like hiring for one role with 1,000 applicants: you can't interview everyone, nor pick by gut from resumes, so you scan resumes to shortlist ~25, then interview those.

1. **📋 Bi-encoder (the resume scan)** — encodes the query and each document *separately* into vectors, then compares with cosine. Fast (sub-10ms over millions), pre-computable (encode all docs once), but shallow because it never sees them together. Use it to grab the top 50–100 candidates.
2. **🎙️ Cross-encoder (the interview)** — feeds the query *and* document into one transformer *together* and outputs a single relevance score. Far more accurate (sees word-level interactions), but slow (a full transformer run per pair) and not cacheable. Use it to rerank those 50 → top 3.

**The funnel:** 1,000,000 chunks → bi-encoder (~10ms) → 50 candidates → cross-encoder (~200ms) → 3 to the LLM. Total ~210ms — fast enough for live chat, and it beats raw vector search by miles. A cross-encoder can lift a chunk that never uses the query's exact words but is clearly most relevant.

```python
# rerank.py
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")   # free, fast

def retrieve_with_rerank(question, top_k=3):
    candidates = db.similarity_search(question, k=25)        # grab 25 cheap candidates
    pairs = [(question, c.page_content) for c in candidates]
    scores = reranker.predict(pairs)                          # cross-encoder scores each pair
    return [c for _, c in sorted(zip(scores, candidates), reverse=True)[:top_k]]
```

### Problem 2: sometimes you need the *exact word*
Pure semantic search ignores keywords. Ask "what's the price of **SKU-4429**?" and the embedding just sees "price" and "product." For codes, names, IDs, and dates, keyword search beats semantic. Think of two librarians:

1. **🔤 BM25 (the literalist)** — obsessed with exact words. Brilliant at product codes (SKU-4429), IDs, dates, proper nouns, and legal references, but blind to synonyms (skips "marathon footwear" when you ask for "running shoes").
2. **🧠 Vector (the philosopher)** — obsessed with meaning. Brilliant at synonyms, paraphrase, fuzzy and multilingual queries, but it shrugs at exact codes and IDs.

**Hybrid search** sends the same query to *both* librarians and merges their two ranked lists. Real user queries are messy — mostly natural language sprinkled with technical terms — so the natural-language part goes to Vector, the technical part goes to BM25, and the merge stitches them together. You're not picking sides; you use each tool for what it's good at. That's why hybrid is the production default.

**Reciprocal Rank Fusion (RRF)** is the tiny formula that merges the two lists:

```text
score(doc) = 1 / (60 + rank_BM25) + 1 / (60 + rank_Vector)
```

Docs both librarians ranked highly bubble to the top; docs only one liked still get a fair shot. No thresholds, no tuning (the 60 rarely matters), and it's used by almost every production RAG system.

## 8. Mini-Project — Chat With Your PDF
Upload any PDF (resume, research paper, annual report, notes) and chat with it — every answer cites the page it came from. Pipeline: **📄 PDF in → ✂️ Chunk (~800 chars) → 📍 Embed + store (Chroma) → 🔎 Retrieve top-3 → 💬 Chat (Gradio).**

### Step 1 — Load the PDF & index it once
```python
# pdf_chat.py · part 1
# pip install langchain langchain-openai langchain-chroma langchain-huggingface \
#             langchain-community pypdf sentence-transformers gradio python-dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def build_index(pdf_path):
    pages    = PyPDFLoader(pdf_path).load()                    # ① read all pages
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks   = splitter.split_documents(pages)                # ② chunk them
    embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db       = Chroma.from_documents(chunks, embedder)         # ③ in-memory store
    return db
```

`PyPDFLoader` (from `langchain_community.document_loaders`) reads a PDF's pages into `Document` objects and preserves page-number metadata — RAG's superpower for trustworthy, citable answers.

### Step 2 — Answer with retrieval + citations
```python
# pdf_chat.py · part 2
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
load_dotenv()

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

prompt = ChatPromptTemplate.from_template("""
You are a helpful PDF assistant. Answer the question using ONLY the context below.
If the context doesn't contain the answer, say "I couldn't find that in the document."
After your answer, list the page numbers you used as: Sources: page X, page Y.

Context:
{context}

Question: {question}
""")

def ask(db, question):
    chunks  = db.similarity_search(question, k=4)
    context = "\n\n".join(
        f"[page {c.metadata['page']+1}] {c.page_content}" for c in chunks)
    chain = prompt | model
    return chain.invoke({"context": context, "question": question}).content
```

Passing `c.metadata['page']` into the context is what lets the model cite the exact source page.

### Step 3 — Give it a face with Gradio
```python
# pdf_chat.py · part 3
import gradio as gr

state = {"db": None}                    # ① remember the index across turns

def upload(pdf):
    state["db"] = build_index(pdf.name)   # ② re-index whenever a new PDF arrives
    return "✅ PDF indexed! Ask me anything about it."

def chat(message, history):
    if state["db"] is None:
        return "Please upload a PDF first 📄"
    return ask(state["db"], message)

with gr.Blocks(title="📄 Chat with your PDF") as demo:
    gr.Markdown("## 📄 Chat with your PDF (powered by RAG)")
    pdf    = gr.File(label="Upload a PDF", file_types=[".pdf"])
    status = gr.Markdown()
    pdf.upload(upload, inputs=pdf, outputs=status)
    gr.ChatInterface(fn=chat)

demo.launch(share=True)                   # share=True → public link!
```

The three small choices that matter:

1. `state` is a plain dict that survives across Gradio events. Without it, every chat message would re-index the PDF from scratch (slow).
2. Re-indexing only on upload means typing stays instant — the same indexing/querying split from the mental model.
3. We pass `page` from the chunk metadata into the prompt — that's how the model knows which page to cite.

```bash
# run it
$ python pdf_chat.py

Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://abcd12.gradio.live   # ← share this on LinkedIn!
```

**The moment to record:** ask a question *not* in the doc — the answer should be *"I couldn't find that in the document."* That's RAG **refusing to hallucinate**, and it's the whole point. This "Chat with [your docs/PDF/codebase]" pattern is the most-shipped AI app of 2024–26.

## 9. A Peek Ahead
1. **🤖 Agentic RAG** — today's RAG always retrieves, but sometimes you shouldn't (small talk) and sometimes one retrieval isn't enough (multi-hop). Agentic RAG combines Class 2's agent loop with Class 3's library: query → retrieve → grade chunks → if bad, rewrite the query and search again → if still bad, ask the user → answer. Same agent loop, with the librarian as one of its tools.
2. **✍️ HyDE (Hypothetical Document Embeddings)** — have the LLM imagine what the answer looks like, then search for chunks matching that imagined answer.
3. **🪜 Step-back prompting** — generalize the question before searching (e.g. "compound interest in this case?" → "what is compound interest?") for broader retrieval.
4. **🕸️ Graph RAG** — build a knowledge graph of entities and relationships, so you can answer "who reports to X" by walking the graph.
5. **📊 RAG evaluation** — measure quality via relevance, faithfulness, and correctness.

The recurring lesson across three classes: every AI product is a recombination of four pieces — **model, prompt, tool, retrieval.**


# Quick Review of Concepts

## LangChain Agents (recap)
An agent is an LLM paired with tools and a loop: the model decides on its own when to call a tool, reads the result, and writes a final answer. Crucially, the model never runs code itself — it *asks* for a tool to be run, and your Python does the actual execution.

## Tools as Python Functions (recap)
Any Python function can become an agent tool. Clear type hints tell the model what arguments to pass, a descriptive docstring tells it *when* to use the tool, and a predictable return value lets it fold the result into its answer. Good naming and docs matter because the model reads them to make its decision.

## Multi-Tool Agents (recap)
When given several tools, the agent must classify the user's intent and pick the right one(s). A single question can trigger multiple tool calls that are then combined into one answer, and the model can also skip tools entirely and answer from its own knowledge if none are relevant.

## Three Ways to Steer a Model
The three levers are prompting (about 90% of real work), RAG (feed the model your own documents at question-time), and fine-tuning (retrain on examples — powerful but rarely needed). Everything covered in this class relies on prompting plus RAG, and RAG is almost always the right first move over fine-tuning because it's cheaper, updates instantly when data changes, and can cite its sources.

## RAG (Retrieval-Augmented Generation)
An LLM is like a brilliant intern who finished training a year ago and was never allowed inside your office. RAG fixes both problems by handing the intern a relevant page *at question-time*: before the model answers, you retrieve the most relevant snippets from your own data and stuff them into the prompt, so the model answers *from* those snippets with no retraining. It's the difference between an open-book exam and a closed-book one.

## Why RAG Exists
RAG solves four core LLM weaknesses: the knowledge cutoff (training ended months ago, so it doesn't know yesterday's news), private/internal data it has never seen (your HR policy, contracts, tickets — too much to paste in one prompt), hallucinations (confident invented answers, dangerous in support/legal/healthcare), and no citations (a raw LLM can't tell you "see source: page 14"). People ask "why not just fine-tune on our data?" — it's usually wrong because fine-tuning is expensive to redo whenever data changes, still can't cite sources, and still hallucinates. RAG is faster, cheaper, and traceable.

## RAG Is Fancy Prompt Engineering
In RAG the model itself never changes — it stays exactly the same `gpt-4o-mini` from Class 1; only what goes into the prompt changes. All you're really doing is automating the job of finding the right context and pasting it in before the question, which makes RAG at its core very fancy, automated prompt engineering.

## Two Phases of RAG
Don't confuse the two phases. *Indexing* happens offline and only when documents change: read docs → break into chunks → turn each chunk into an embedding → store in a vector DB (slow, but done once). *Querying* happens online for every question: turn the question into a vector → find the nearest chunks → paste them into the prompt → LLM answers (milliseconds per query).

## The 5-Box Pipeline
The whole pipeline is a smart librarian sitting between your question and the model: ask a friend about an 800-page book they've never read and they'll guess, but hand them the 3 most relevant pages first and they answer confidently. In boxes: Question → Search (find relevant chunks) → Stuff (add chunks to the prompt) → LLM (answer using them) → Answer (+ source citation). Boxes 1, 4, and 5 you already knew from Class 1; boxes 2 and 3 (the "librarian") are the entire job of RAG.

## Embeddings
An embedding is a list of numbers (a vector) that captures the meaning of text — similar meanings become nearby points in space, different meanings land far apart. The intuition: just as plotting people by height vs weight groups similar builds together, embeddings plot meaning, except in 384, 768, or even 3072 dimensions because meaning is rich (topic, tone, formality, language, sentiment all get their own axes). You get one with a single call like `model.encode("text")`.

## Vector Arithmetic
Trained on enough text, embedding vectors carry real relationships you can do arithmetic on — the famous `king − man + woman ≈ queen`, plus `paris − france + india ≈ delhi` and `tokyo − japan + germany ≈ berlin`. The model was never told "queen is the female king"; that pattern *emerges* from the geometry of meaning. This is why "find the chunk most similar to my question" is just arithmetic: search by meaning = nearest point in vector space.

## Cosine Similarity
Cosine similarity scores how alike two vectors are based on the *angle* between them, from −1 (opposite) through 0 (unrelated) to +1 (identical), with above ~0.7 meaning "very similar" and below ~0.3 "barely related." The clock-hands intuition: two hands at the same time have angle 0 → cosine 1 → identical; at 12 and 6 they point opposite → cosine −1. Because only the angle matters and not the hands' length, differences in text length don't distort the score.

## Embedding Models
Embedding models are pre-trained models that turn text into vectors — you don't train anything, someone already did. Common choices: `all-MiniLM-L6-v2` (tiny, free, runs locally, no API key, 384 dimensions — the class default), `BAAI/bge-large-en-v1.5` (best open-source English), and OpenAI's `text-embedding-3-small` (paid, very good multilingual). The entire API surface is one call: `.encode("text")` returns the vector.

## Chunking
Chunking cuts documents into snippets before embedding, because embedding a 200-page PDF as one vector averages its meaning into mush. It's like slicing a pizza: one whole pie is too big to share, but confetti-sized bits are tasteless too. Too-big chunks lose precision (the relevant bit is buried in fluff); too-small chunks lose context (each crumb is meaningless). How you chunk quietly decides how good your RAG is — the best engineers obsess over it, and chunk size is usually the first tuning knob.

## Four Chunking Strategies
Four strategies are worth knowing: *fixed size* (every N characters — brain-dead simple and fast, but chops mid-sentence; good for prototypes), *recursive* (split on paragraphs, then sentences, then words as a fallback ladder — LangChain's default, good for most apps), *semantic* (embed each sentence and group consecutive ones on the same topic — good for long flowing prose), and *structure-aware* (follow the document's own markdown headings, code blocks, or HTML sections — good for docs, code, and wikis). This ties to a recall-vs-precision tradeoff: big chunks give high recall but low precision, small chunks the reverse.

## Chunk Overlap
Chunk overlap means adjacent chunks share some characters (typically 50–100) so an answer sitting exactly on a boundary isn't missed. It ensures every sentence appears fully in at least one chunk — cheap insurance against splitting a relevant thought across two chunks where you only retrieve one.

## RecursiveCharacterTextSplitter
`RecursiveCharacterTextSplitter` is LangChain's default chunking tool (`from langchain_text_splitters`). You set `chunk_size` (e.g. 800 chars) and `chunk_overlap` (e.g. 100 chars of shared border), then call `.split_text(...)` or `.split_documents(...)`; it tries paragraph boundaries first, then sentences, then individual words to keep chunks coherent.

## Vector Databases
A vector database is a search engine where, instead of "find documents containing this word," the query is "find the vectors closest to *this* vector" — same idea as Google, swapped engine. It does just three things: `add` (store chunks + vectors — indexing), `query` (return the top-k nearest — retrieval), and `delete`. The three names you'll hear: Chroma (open-source, runs in-process with one `pip install`, great up to ~10M vectors — the class default), Pinecone (fully managed SaaS, zero ops, scales to billions, paid), and Qdrant (open-source *and* production-grade). LangChain wraps all of them with the same interface, so swapping later is a one-line change.

## HNSW
HNSW (Hierarchical Navigable Small World, a 2018 algorithm) is the trick behind vector-database speed. Searching billions of vectors naively means billions of distance calculations per query; HNSW builds a "ladder" graph so each query takes only ~log(N) hops, giving sub-10ms lookups on 100M vectors. You never write it yourself — every vector DB ships it built-in.

## The RAG Prompt Pattern
The key RAG prompt instructs the model to answer "using ONLY the context below" and to say "I don't know" (or "I couldn't find that in the document") when the context lacks the answer. This single line is the most important hallucination-fighter in RAG — the moment the system *refuses to make something up* is the whole point of the pattern.

## Bi-Encoder vs Cross-Encoder (Reranking)
Vector search's top-5 isn't always the *best* 5, so good RAG uses two-stage retrieval — like hiring for one role with 1,000 applicants: you can't interview everyone, nor pick by gut from resumes, so you scan resumes to shortlist ~25, then interview those. A *bi-encoder* (the resume scan) encodes query and document separately then compares vectors — fast (sub-10ms over millions), pre-computable, but shallow because it never sees them together. A *cross-encoder* (the interview) feeds query and document into one transformer *together* and outputs a relevance score — far more accurate but slow and not cacheable. Pattern: bi-encoder grabs the top 50–100 candidates (~10ms), cross-encoder reranks them to the best 3 (~200ms). A cross-encoder can lift a chunk that never uses the query's exact words but is clearly most relevant.

## BM25 (Keyword Search) vs Vector (Semantic Search)
Think of two librarians. BM25 is the literalist — brilliant at exact words, product codes (SKU-4429), IDs, dates, proper nouns, and legal references, but blind to synonyms (it skips "marathon footwear" when you ask for "running shoes"). Vector search is the philosopher — brilliant at meaning, synonyms, paraphrase, and multilingual matching, but it shrugs at exact codes and IDs, drowning them in averages. Neither alone is perfect for real, messy queries.

## Hybrid Search
Hybrid search sends the same query to *both* librarians (BM25 and vector) at once and merges their two ranked lists. Real user queries are messy — mostly natural language sprinkled with technical terms and codes — so the natural-language part goes to Vector, the technical part goes to BM25, and the merge stitches them together. You're not picking sides; you're using each tool for what it's good at, which is why hybrid is the production default.

## Reciprocal Rank Fusion (RRF)
RRF is the tiny formula that merges hybrid search's two lists: for each doc, `score = 1/(60 + rank_BM25) + 1/(60 + rank_Vector)`. Docs both librarians ranked highly bubble to the top, while docs only one liked still get a fair shot. No thresholds, no tuning (the 60 rarely matters), and it's used by almost every production RAG system.

## PyPDFLoader
`PyPDFLoader` (from `langchain_community.document_loaders`) reads a PDF's pages into `Document` objects via `.load()`. It preserves page-number metadata, so you can pass `page` into the prompt and have the model cite the exact source page — metadata is RAG's superpower for trustworthy answers.

## Gradio ChatInterface (for RAG)
The same Gradio wrapper from Class 2 now powers "Chat with your PDF": a `gr.File` upload triggers `build_index()` to chunk, embed, and store the PDF, and `gr.ChatInterface` calls an `ask()` function that retrieves the top chunks and answers with citations. A plain `state` dict keeps the index alive across turns so it re-indexes only on upload (fast typing), and `launch(share=True)` gives a public link. This "Chat with [your docs/PDF/codebase]" pattern is the most-shipped AI app of 2024–26.

## Agentic RAG (preview)
Today's RAG always retrieves, but sometimes you shouldn't (small talk) and sometimes one retrieval isn't enough (multi-hop questions). Agentic RAG combines Class 2's agent loop with Class 3's library, letting the agent *decide*: query → retrieve → grade the chunks → if bad, rewrite the query and search again → if still bad, ask the user to clarify → answer. It's the same agent loop with the librarian as one of its tools.

## Advanced RAG Techniques (preview)
The tricks senior engineers reach for: *HyDE* (Hypothetical Document Embeddings — have the LLM imagine what the answer looks like, then search for chunks matching that imagined answer), *step-back prompting* (generalize the question before searching, e.g. "compound interest in this case?" → "what is compound interest?" for broader retrieval), *Graph RAG* (build a knowledge graph of entities and relationships so you can answer "who reports to X" by walking the graph), and *RAG evaluation* (measure quality via relevance, faithfulness, and correctness). The recurring lesson across three classes: every AI product is a recombination of four pieces — model, prompt, tool, retrieval.
