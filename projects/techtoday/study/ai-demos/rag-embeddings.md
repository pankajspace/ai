<!--
Source: rag-embeddings.html
Title: RAG & Embeddings | TechToday
Theme-color: #0b0d10
Stylesheets: ../dsa/dsa-study.css, ../../site-header.css
Scripts: ../dsa/dsa-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Demos](ai-demos.html)

RAG · Talk to your own documents

<a id="rag-and-embeddings"></a>

# Stop letting your AI *guess*. Give it a library.

With LangChain agents, your agent could *act* — but it still didn't know **your** data. Now you fix that. You'll build a system that reads your PDFs, finds the right passage for any question, and answers from **real text** — not vibes. It's called **RAG**, and it's how every "chat with your docs" app on the planet actually works. 👉

📚 Embeddings, intuition first · ✂️ Chunking, demystified · 🗂️ Vector databases · 🎯 Reranking + hybrid search · 📄 Chat-with-your-PDF, shipped

**Scaler Academy** — every diagram below is interactive. Drag, click, type along.

10 Topics · Concepts, Live Simulators & a Chat-with-your-PDF Project

<a id="table-of-contents"></a>

## Table of Contents

1. [Recap: LLMs & LangChain Agents](#recap)
2. [Why RAG: Beyond Model Memory](#why)
3. [How RAG Works End-to-End](#how)
4. [Embeddings & Vector Space](#emb)
5. [Chunking Strategies](#chunk)
6. [Vector Databases](#vdb)
7. [Build Your RAG Pipeline](#build)
8. [Reranking & Hybrid Search](#rerank)
9. [Chat with Your Documents](#project)
10. [What's Next](#next)

<a id="recap"></a>

## 1. What You Can *Already* Do

<a id="recap-bridge"></a>

### Where You Are, and the Two Problems Left

**Recap** 30 seconds · LLM calls + LangChain agents

✓ Call any LLM (OpenAI, Groq, Ollama) · ✓ Snap a LangChain chain together · ✓ Pass chat history with placeholders · ✓ Build an agent that picks tools

> **Analogy** 🤔 — **But your agent has two real problems**
>
> **1) It doesn't know *your* stuff** — your company's docs, your PDFs, last week's release notes. **2) When it doesn't know, it makes things up** (hallucinates) confidently. What follows is the single biggest fix in AI engineering. Same agent loop — but now it can look things up in a library *you* built.

> 💡 **🎙️ Speaker note · landing the bridge.** If the shop-assistant agent felt fuzzy, this is the cleanup. Say it plainly: "With agents, the model *chose* a tool. Now the tool is its own library — and the magic moves from *which tool* to *how do we find the right page?*." That's RAG, in one sentence.

<a id="why"></a>

## 2. Why Does RAG *Exist?*

<a id="why-problems"></a>

### The 4 Problems RAG Solves

**Block 14** ~10 min · the hook

An LLM is a brilliant intern who finished training a year ago and was never allowed inside your office. RAG fixes both — fresh data, *and* your private data — by handing the intern a relevant page **at question-time**.

- **🗓️ Knowledge cutoff** — The model's training ended months ago. It doesn't know yesterday's RBI rate cut or last week's Budget numbers. `✓ RAG: fetch today's article`
- **🔒 Private / internal data** — It has never seen your HR policy, your contracts, your product wiki, or your customer tickets — and you can't paste them all into one prompt. `✓ RAG: search your docs`
- **🌀 Hallucinations** — When unsure, the model invents confident-sounding answers. Bad in customer support, dangerous in legal, fatal in healthcare. `✓ RAG: ground in real text`
- **🔗 No citations** — Ask "where did you get that?" and a raw LLM has nothing. Real products need *"see source: page 14"*. `✓ RAG: return the source chunk`

> 🔑 **🤯 The 1-line definition.** **RAG = Retrieval-Augmented Generation.** Before the model answers, *you* retrieve the most relevant snippets from your own data and stuff them into the prompt. The model then answers *from* those snippets. No retraining. No fine-tuning. Just open-book exam instead of closed-book.

> 🎯 **Industry spotlight · where you've seen this already — almost every "AI feature" you've used is RAG underneath.** Notion AI answering from your workspace, Glean searching your company's apps, Perplexity citing sources, Intercom's Fin support bot, ChatGPT's "search the web", Cursor finding code in your repo, even the new "ask about this PDF" button in your browser — same pattern, every time. Master this, and you can clone any of them.
>
> Notion AI · Glean · Perplexity · Intercom Fin · Cursor · ChatGPT Search

> 💡 **💡 Quick reality-check (mention this).** People sometimes ask: "Why not just fine-tune the model on our data?" Three reasons it's usually wrong: **(1)** expensive and slow to redo every time data changes, **(2)** still can't cite sources, **(3)** still hallucinates. RAG is faster, cheaper, traceable, and almost always the right first move.

<a id="how"></a>

## 3. RAG in One Simple *Picture*

<a id="how-librarian"></a>

### The Smart Librarian

**Block 15** ~10 min · the picture

Forget the buzzwords. The whole pipeline is just **a smart librarian** sitting between your question and the model.

> **Analogy** 📚 — **The library analogy that explains everything**
>
> Imagine you ask your friend a question about a 800-page book they've never read. Bad idea — they'll guess. Smart move? **You find the 3 most relevant pages, hand them over, and *then* ask.** They read the pages and answer confidently with the real text. That's RAG. The "librarian" who finds those 3 pages is the only new thing we're building today.

<a id="how-pipeline"></a>

### The 5-Box Pipeline (Memorise This)

```mermaid
flowchart LR
  Q[❓ Question<br>user types it] --> S[🔎 Search<br>find relevant chunks]:::hl
  S --> F[📋 Stuff<br>add chunks to prompt]:::hl
  F --> L[🧠 LLM<br>answer using them]
  L --> A[💬 Answer<br>+ source citation]:::good
```

Boxes 1, 4, 5 you already know from calling an LLM directly. Boxes 2 + 3 are the entire job of everything below.

> **Two phases · don't confuse them.**
>
> **Phase 1 — Indexing (offline, once):** read your docs → break into chunks → turn each chunk into numbers (embedding) → store in a vector database. Slow, but you only do it when documents change.
>
> **Phase 2 — Querying (online, every question):** turn the question into numbers → find nearest chunks in the database → paste them into the prompt → LLM answers. Milliseconds per query.

> 🔑 **✨ The unlock that surprises everyone.** You are *not* retraining the model. The model stays exactly the same `gpt-4o-mini` you called through the raw OpenAI API. We're only changing **what goes into the prompt**. RAG is, at its core, very fancy *prompt engineering* — automated.

<a id="emb"></a>

## 4. Embeddings: Words Become *Coordinates*

<a id="emb-definition"></a>

### What Is an Embedding?

**Block 16** ~25 min · the "aha" of the whole topic

Before we can "search by meaning", we need a way to **turn meaning into numbers**. That's an *embedding*. And once you see what it does, every confusing thing about RAG suddenly makes sense.

> **Definition · keep this in your head.** An **embedding** is a list of numbers (a *vector*) that captures the meaning of a piece of text. Similar meanings ⟶ similar numbers ⟶ nearby points in space. Different meanings ⟶ far apart.

**🧭 Vector space, live** — demo

similar meaning ⟶ nearby points · that's the entire trick

<a id="emb-2d-world"></a>

### Imagine a 2D World First — Height & Weight

Forget AI for a second. If I plot people by *height vs weight*, people of similar build end up close together on the chart. Same idea, scaled up. Real embeddings have **384, 768 or even 3072 dimensions** — way more than we can draw — but the principle is identical: *similar ⟶ close, different ⟶ far.*

> **Analogy** 📊 — **"Why so many dimensions?"**
>
> Because meaning is rich. Two words can be similar in many ways at once — *topic, tone, formality, language, sentiment*. Each dimension captures a different axis of similarity. 768 isn't arbitrary; it's just enough to separate millions of distinct ideas.

<a id="emb-arithmetic"></a>

### The *Aha*: Embedding Math Actually Works

This is the demo that turned a generation of engineers into believers. Trained on enough text, vectors carry real relationships you can do arithmetic on. Pick a side and watch:

**Live sim · Vector arithmetic** — click an equation

king − man + woman ≈ queen

*Control:* king − man + woman

*Control:* paris − france + india

*Control:* tokyo − japan + germany

*Control:* walking − walk + run

Click a different equation. Each is a *real result* from GloVe / Word2Vec embeddings — no tricks. The model never saw any rule like "queen is the female king" — that pattern just *emerges* from the geometry of meaning.

> 🔑 **🤯 Why this is the foundation of everything here.** If *woman* and *queen* can be found by simple arithmetic, then "find the chunk most similar to my question" is also just arithmetic — fast, scalable, and runs on commodity hardware. Every RAG system uses exactly this idea. **Search by meaning = nearest point in vector space.**

<a id="emb-mini-map"></a>

### See It in 2D — Same Idea, Drawable

A real-world plot of word vectors squished from 768 dimensions down to 2 for visualization. Click pairs and notice the *direction* connecting them is the same:

**Live sim · Vector space mini-map** — click the pairs · watch the arrows align

*Control:* 👑 king ↔ queen / man ↔ woman

*Control:* 🏛️ paris ↔ france / delhi ↔ india

*Control:* 🍎 banana ↔ grape (close) vs aeroplane (far)

*Control:* ↺ clear

*"capital-of"* is encoded as the **direction** from country → capital. Same arrow length, same angle, anywhere on the map. That direction *is* the relationship.

<a id="emb-cosine"></a>

### The Score We Use: *Cosine Similarity*

Two vectors close together = the *angle* between them is small. The cosine of that angle is our score. It ranges from **-1 (opposite) to +1 (identical)**. Practically: **above 0.7 means "very similar"**, below 0.3 means "barely related". No math needed to use it — just remember: *bigger number = more similar*.

> **Analogy** 📐 — **The clock-hands intuition**
>
> Two clock hands pointing at the same time ⟶ angle = 0 ⟶ cosine = 1 ⟶ perfectly similar. Pointing at 12 and 6 ⟶ angle = 180° ⟶ cosine = −1 ⟶ opposites. We don't care how *long* the hands are, only the angle. That's why text length doesn't break the score.

<a id="emb-meter"></a>

### Try It — the Similarity Meter

Type any two sentences. The meter shows the cosine similarity our system would compute (this in-browser simulation uses a small built-in semantic table, so results feel realistic for common topics).

**Live sim · Cosine similarity meter** — try opposites, synonyms, totally unrelated pairs

Sentence A: A cat is sleeping on the couch.

Sentence B: A kitten is napping on the sofa.

*Control:* synonyms · paraphrase · same city, different names · related concepts · unrelated · totally unrelated

**0.00** cosine similarity

Type or click a preset to score.

<a id="emb-code"></a>

### How Do We Actually Get an Embedding? One Function Call.

You don't have to train anything — somebody else already did. Open-source models from Hugging Face (`sentence-transformers`) or APIs from OpenAI / Cohere give you embeddings in one line:

embeddings.py

```python
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")   # ① free, fast, 384 dims

vec = model.encode("A cat is sleeping on the couch")  # ② that's an embedding!
print(vec.shape)         # → (384,)  — 384 numbers
print(vec[:5])          # → [-0.05, 0.12, 0.41, -0.08, 0.22] (something like that)

# to compare two pieces of text → encode both → take cosine similarity
from numpy import dot
from numpy.linalg import norm

v1 = model.encode("A cat is sleeping on the couch")
v2 = model.encode("A kitten is napping on the sofa")
similarity = dot(v1, v2) / (norm(v1) * norm(v2))   # cosine
print(similarity)       # → 0.87 (very similar 🎉)
```

#### 🔍 Decoder

- **①** **all-MiniLM-L6-v2** is a tiny but excellent open-source embedding model — runs on your laptop, no API key needed. For production, look at `BAAI/bge-large-en-v1.5` (best English) or OpenAI's `text-embedding-3-small` (paid, very good multilingual).
- **②** `.encode("text")` returns the vector. That's the whole API surface — one call, 384 numbers back. Now your text is searchable by meaning.

> 💡 **🎙️ Speaker note · how to pitch this section.** This is the "physics" of RAG. Don't rush. Spend a full 5 minutes letting them play with the meter and the king-queen equation. Once they internalize *"similar meaning = nearby vector"*, everything else here is bookkeeping.

- **📍 Vectors = coordinates** — Every chunk of text gets a point in space.
- **📐 Cosine similarity** — Score from −1 to +1. Bigger = closer.
- **🪄 Math you can do** — king − man + woman ≈ queen. Really.
- **⚡ One function call** — `.encode(text)` — that's it.

<a id="chunk"></a>

## 5. Chunking: Cut the Book into *Snippets*

<a id="chunk-why"></a>

### Why Chunking Decides Everything

**Block 17** ~15 min · the unglamorous part that decides everything

Before we embed anything, we have to cut it up. You can't embed a 200-page PDF as one vector — meaning gets averaged away to mush. So we split it into *chunks*. **How** you chunk decides how good your RAG actually is. Engineers underestimate this; the best ones obsess over it.

> **Analogy** 🍕 — **The pizza-slice analogy**
>
> One whole pizza is hard to share — too big. Cut it into 100 confetti-sized bits and nobody can taste anything. **Slice sizes matter.** Chunks are pizza slices: too big and you lose precision (the relevant bit is buried), too small and you lose context (each crumb is meaningless).

<a id="chunk-strategies"></a>

### The 4 Chunking Strategies Worth Knowing

- **📏 Fixed size** — Every N characters or tokens — done. Brain-dead simple, fast, your default. *Downside:* chops mid-sentence, mid-table, mid-thought. `Best for: prototypes, blog posts`
- **🔁 Recursive** — Try to split on paragraphs first; if too big, split on sentences; if still too big, on words. Smart fallback ladder. The default in LangChain. `Best for: most real apps`
- **🧠 Semantic** — Embed every sentence; group consecutive sentences that "talk about the same thing". Chunks follow meaning, not size. `Best for: long flowing prose`
- **📑 Structure-aware** — Use the document's own structure — markdown headings, code blocks, HTML sections. Each section becomes a chunk. `Best for: docs, code, wikis`

<a id="chunk-sim"></a>

### Watch All 4 Strategies — Same Text, Four Different Cuts

Same source passage, four ways to chop it. Switch tabs and watch **where the cuts land** and **how chunks change shape**. The differences *are* the lesson — pure text won't make this click; the picture will.

**Live sim · 4 chunking strategies · same source** — click tabs · compare cuts side by side

📄 Source · a tiny markdown doc with 3 topics

*Control:* 📏 Fixed · blind char-count

*Control:* 🔁 Recursive · respect boundaries

*Control:* 🧠 Semantic · group by topic

*Control:* 📑 Structure · follow headers

*Control:* Chunk size slider (40–240 characters)

**Try this sequence:** start on *Fixed* at size 80 → count the 🪓 mid-word cuts → flip to *Recursive* at the same size → they're all gone → flip to *Semantic* → notice three chunks emerge that align perfectly with the three topics → flip to *Structure* → see how the markdown `##` headers do the work for free.

> **The recall vs precision tradeoff · keep this in mind.** **Big chunks** → high recall (the answer is probably *in* there), but low precision (lots of fluff around it). **Small chunks** → high precision (the chunk is exactly the answer), but low recall (the relevant bit might be split across two chunks and you only pulled one). Most teams sweep chunk size as their first RAG tuning knob.

<a id="chunk-code"></a>

### One Line of Real Code

chunk.py

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ① choose chunk size and overlap so nearby context stays connected
splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,        # aim for ~800 chars per chunk
    chunk_overlap=100,     # adjacent chunks share 100 chars (context glue)
)

# ② split the long document into chunks ready for embedding
chunks = splitter.split_text(your_long_document)
# ③ print how many chunks will go into the vector search index
print(len(chunks))    # → e.g. 47 chunks ready to embed
```

> 💡 **💡 Why `chunk_overlap`?** If your question's answer sits exactly at a chunk boundary, you'd miss it. Overlap (50–100 chars) makes sure every sentence appears in at least one chunk fully. Cheap insurance.

<a id="vdb"></a>

## 6. Vector Databases: a Search Engine for *Meaning*

<a id="vdb-definition"></a>

### What a Vector Database Is

**Block 18** ~10 min

You have thousands of embeddings. For every question, you need the top-k nearest ones — *fast*. That's what a vector database does, and that's **all** it does.

> **Analogy** 🗂️ — **One-line definition**
>
> A vector database is a *search engine* where instead of "find documents containing this word", the query is "find vectors closest to *this* vector". Same idea as Google, swapped engine.

<a id="vdb-options"></a>

### The Three Names You'll Hear All the Time

- **🟢 Chroma ★ today** — Open-source, runs in-process (no server!), one `pip install`. Perfect for prototypes & up to ~10M vectors. **What we'll use today.**
- **🔵 Pinecone** — Fully managed SaaS. Zero ops, scales to billions, but paid. The boring-and-reliable choice for production.
- **🟣 Qdrant** — Open-source *and* production-grade. Self-host or use their cloud. Great middle ground when you outgrow Chroma.

> 💡 **🎯 Picking one (don't overthink).** Prototyping or under 1M chunks? **Chroma**. Want zero ops & have a budget? **Pinecone**. Need to self-host at scale? **Qdrant** or **Weaviate**. The good news: LangChain wraps all of them with the same interface, so swapping later is a one-line change.

<a id="vdb-operations"></a>

### What It Actually Does — Three Operations

A vector DB is just these three calls:

1. **`db.add(documents, embeddings)`** — store chunks and their vectors. (Indexing.)
2. **`db.query(query_vector, k=3)`** — return the 3 chunks whose vectors are closest. (Retrieval.)
3. **`db.delete(ids)`** — remove chunks when a doc is deleted. That's it. Three calls.

> 🎯 **Industry spotlight · how it stays fast — HNSW, the trick behind every vector DB.** Searching billions of vectors naively means computing billions of distances per query. **HNSW** (Hierarchical Navigable Small World — a 2018 algorithm) builds a "ladder" graph so each query takes only ~log(N) hops. Result: sub-10ms lookups on 100M vectors. You'll never write this yourself — every vector DB ships it built-in.
>
> Chroma · HNSW · Pinecone · proprietary · Qdrant · HNSW · FAISS · IVF + HNSW

<a id="build"></a>

## 7. Build a Real RAG in *30 Lines*

<a id="build-index"></a>

### Step 1 — Index Your Documents (Once)

**Block 19** ~20 min · all four pieces, working together

We've talked about every piece. Now we wire them up. This is the whole pattern — every RAG system you'll see in production is just a fancier version of *this*.

index.py

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ① load your documents (any text — for now, hardcoded)
docs = [
    "Our return policy allows refunds within 30 days of purchase.",
    "Shipping is free for orders above ₹999 across India.",
    "For corporate orders above 50 units, contact sales@example.com.",
    "Our office is in Indiranagar, Bangalore. Open Mon-Fri 10am-7pm.",
]

# ② split into chunks (small docs here, but production = thousands of pages)
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.create_documents(docs)

# ③ pick an embedding model (free, runs locally, no API key)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ④ build the vector store from chunks + embeddings (saves to disk)
db = Chroma.from_documents(chunks, embedder, persist_directory="./chroma_db")

print(f"Indexed {len(chunks)} chunks 🎉")
```

<a id="build-query"></a>

### Step 2 — Ask a Question (Every Time)

rag.py

```python
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
    chain = prompt | model                                # ⑧ same LangChain chain trick
    return chain.invoke({"context": context, "question": question}).content

print(rag_answer("How long do I have to return something?"))
# → "30 days from the purchase date."  ✅ from your data, not a guess
```

#### 🔍 Decoder — the 8 numbered steps

- **①** Your data. In real life this is PDFs, web pages, Notion exports — anything you can turn into text.
- **②** Chunk it. Block 17 in action. `chunk_size=500` is a sane default.
- **③** Pick an embedder. We're using a free local one — swap to `OpenAIEmbeddings()` for a paid, slightly better version.
- **④** `Chroma.from_documents` embeds every chunk and stores both the text and the vector. Done once per dataset.
- **⑤** Reopen the same database. The embeddings are already on disk — no re-encoding.
- **⑥** The magic prompt template. Notice `"ONLY the context below"` — this single line is the most important hallucination-fighter in RAG.
- **⑦** `similarity_search` = embed the question, find the 3 nearest chunks, return them. The librarian.
- **⑧** Same LangChain pipe (`prompt | model`) you used for LangChain chains. **RAG didn't replace your previous knowledge — it slotted right in.**

<a id="build-sim"></a>

### Watch It Run — Step-by-Step Pipeline

Press *Next* to see exactly what happens inside `rag_answer("How long do I have to return something?")`. Each step is a card; this is the whole RAG flow on one screen:

**Live sim · RAG, step by step** — press ▶ five times

*Control:* ▶ Next step

*Control:* ↺ Reset

> 🔑 **🎯 Take a moment — this *is* the canonical pattern.** That's it. Every RAG system in the world — from a hobby project to Perplexity — is a variant of these 8 lines. From here we're just making it *better*: smarter retrieval, smarter prompts, multiple passes. The core never changes.

<a id="rerank"></a>

## 8. Make It Better: *Rerank* + *Hybrid* Search

<a id="rerank-two-stage"></a>

### Problem 1: the Top-5 from Vector Search Isn't the *Best* 5

**Block 20** ~15 min · 80% of RAG quality lives here

A vanilla RAG works. A *good* RAG works **well**. The two tricks that close that gap — and that every senior engineer asks about — are *reranking* and *hybrid search*. Both are easy to add.

Embedding similarity is fast, but it sometimes ranks shallow word-matches above deep semantic matches. So we use a **two-stage retrieval** — a fast first pass to narrow down, then a slow accurate pass to pick the real winners.

> **Analogy** 📄 — **Imagine hiring for one open role — with 1,000 applicants**
>
> You can't interview 1,000 people (it would take a year). You also can't pick someone by gut feel from a stack of resumes (you'd hire badly). So you do **two passes**: a fast *resume scan* to shortlist 25, then a real *30-minute interview* with each of those 25. **Bi-encoder and cross-encoder are exactly these two passes.**

- **📋 Bi-encoder · like a resume scan** — Reads the query and the document **separately**, turns each into a vector, then compares the two vectors with cosine similarity. The encoder *never sees them together* — it judges each "card" alone.
  - ⚡ **Fast** — sub-10ms over millions of docs
  - 💾 **Pre-computable** — encode all your docs once, store forever, only encode the query at runtime
  - 📉 **Shallow** — misses subtle relevance because the model never compares them side-by-side
  - `→ use it to grab top 50–100 candidates`
- **🎙️ Cross-encoder · like a 30-min interview** — Feeds the query **and** the document into one transformer *together*, lets the model attend to both at once, then outputs a single relevance score. The model can compare them token by token, weigh trade-offs, spot nuance.
  - 🎯 **Way more accurate** — sees query↔doc word interactions directly
  - 🐢 **Slow** — full transformer run per (query, doc) pair
  - ❌ **Not pre-computable** — each score is pair-specific, you can't cache anything
  - `→ use it to rerank those 50 → top 3`

```mermaid
flowchart LR
  A[1,000,000<br>all your chunks] -->|📋 bi-encoder · ~10 ms| B[50<br>candidates]:::hl
  B -->|🎙️ cross-encoder · ~200 ms| C[3<br>to the LLM]:::good
```

Funnel total: ~210ms — fast enough for live chat, accurate enough to beat raw vector search by miles.

> **Remember this — the two-stage pattern is universal.**
>
> **Stage 1 (bi-encoder):** grab top 50-100 candidates from the vector DB. Fast.
>
> **Stage 2 (cross-encoder):** re-score those candidates with a smarter model. Slow per item, but you're only re-scoring 50, not 50 million. Keep the top 3-5 for the LLM.

<a id="rerank-sim"></a>

### See Reranking Flip the Order

Same query, same candidates. *Left*: what cosine similarity returned. *Right*: what a cross-encoder reranker returns. Press the button and watch the real answer rise:

**Live sim · Reranker · before vs after** — query: "how do I return a defective product?"

stage 1 · vector search (top 5) ➜ stage 2 · cross-encoder rerank

*Control:* ▶ Run reranker

*Control:* ↺ Reset

Notice doc #4 — it never says the word "return" but it's clearly the most relevant. Pure vector search ranks it #4; cross-encoder lifts it to #1. *That* is why we rerank.

The code to add reranking is laughably short:

rerank.py

```python
from sentence_transformers import CrossEncoder

# ① load a cross-encoder that can score a question with one chunk
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L6-v2")   # free, fast

def retrieve_with_rerank(question, top_k=3):
    # ① retrieve more cheap candidates than you finally need
    candidates = db.similarity_search(question, k=25)        # grab 25 cheap candidates
    # ② pair the same question with each candidate chunk for scoring
    pairs = [(question, c.page_content) for c in candidates]
    # ③ score every question chunk pair with the cross-encoder
    scores = reranker.predict(pairs)                          # cross-encoder scores each pair
    # ④ sort by score and return the best chunks
    return [c for _, c in sorted(zip(scores, candidates), reverse=True)[:top_k]]
```

<a id="rerank-keywords"></a>

### Problem 2: Sometimes You Need the *Exact Word*

Pure semantic search ignores keywords. Ask "what's the price of **SKU-4429**?" and the embedding doesn't care about that specific code — it just sees "price" and "product". For codes, names, IDs, dates — **keyword search beats semantic** hands down. The fix isn't to pick one or the other. It's to use *both*, with very different strengths.

> **Analogy** 📚 — **Two librarians, very different superpowers**
>
> Remember our librarian from Block 15? She has **two assistants** who search the stacks completely differently. One is a literalist who lives for exact words. The other is a philosopher who lives for meaning. Send your query to the right one and you get great results. **Send your query to *both* — and let them merge their rankings — and you get magic.** That's hybrid search.

- **🔤 Librarian A · BM25 · the literalist** — Obsessed with **exact words**. Type *"SKU-4429"* or *"Article 21"* and she'll find every single doc containing those exact characters. But ask for *"running shoes"* and she'll skip the doc titled *"marathon footwear"* — different words, even though same meaning.
  - ✅ **Brilliant at** product codes, SKUs, model numbers, version strings
  - ✅ **Brilliant at** proper nouns, dates, legal references, technical jargon
  - ❌ **Blind to** synonyms, paraphrase, intent — words are just characters to her
  - `→ catches what vector misses`
- **🧠 Librarian B · Vector · the philosopher** — Obsessed with **meaning**. Ask for *"running shoes"* and she surfaces *"marathon footwear"*, *"jogging trainers"*, even *"sneakers for athletes"*. But ask for *"SKU-4429"* and she shrugs — random letters and numbers are just noise to her.
  - ✅ **Brilliant at** natural-language questions, "what's this about?"
  - ✅ **Brilliant at** fuzzy queries, paraphrase, multilingual matching
  - ❌ **Blind to** exact codes, IDs, technical strings — drowns them in averages
  - `→ catches what BM25 misses`

<a id="rerank-hybrid"></a>

### Hybrid = Both Librarians on the Case

Send the same query to *both* librarians at the same time. Each ranks the docs by their own logic. You then **merge their two ranked lists into one** using a tiny formula called **Reciprocal Rank Fusion (RRF)**:

> 🔑 **⚡ Reciprocal Rank Fusion in one line.** For each doc, final score = `1 / (60 + rank in BM25) + 1 / (60 + rank in Vector)`. Docs that *both* librarians ranked highly bubble to the top. Docs only one of them liked still get a fair shot. No tuning, no thresholds, no magic numbers (well, 60 — but it almost never matters). *That's it.* Used by almost every production RAG system in the wild.

> **Analogy** 🤝 — **Why this works so well in practice**
>
> Real user queries are *messy* — mostly natural language, but sprinkled with technical terms, product codes, names, or jargon the embedding model has never seen. Hybrid covers both halves of every messy query automatically: the natural-language part goes to Vector, the technical-term part goes to BM25, and RRF stitches the answers together. **You're not picking sides — you're using each tool for what it's actually good at.**

<a id="rerank-hybrid-sim"></a>

### See It on a Real Query — *"I Want Running Shoes"*

Same query, three rankings. Watch how Librarian A and Librarian B return different top picks — and how Hybrid merges them. Press the button to see who wins:

**Live sim · BM25 vs Vector vs Hybrid** — same query, three rankings

- **🔤 BM25** `keyword` — Counts word overlap. Loves "shoes" appearing literally.
- **🧠 Vector** `semantic` — Understands "running" means jogging — even if the word "shoes" isn't there.
- **⚡ Hybrid** `blended` — Reciprocal rank fusion — gives the best of both. Default for production.

*Control:* ▶ Compare all three

> 🎯 **Industry spotlight · this is what the leaderboard chases — every "+10% retrieval quality" paper is one of these tricks.** Reranking + hybrid search are the two single biggest quality wins in RAG. Add them and you go from "demo works" to "production works". Almost every benchmark in the MTEB leaderboard uses some combination. You now know the playbook.
>
> BM25 + Vector · Cross-encoder rerank · Reciprocal rank fusion · Cohere Rerank API

<a id="project"></a>

## 9. Mini-Project: Chat with *Your* PDF

<a id="project-overview"></a>

### The Full App — 4 Files

**Block 21** ~20 min · 🏁 THE BUILD

Time to ship. Point it at any PDF — your resume, a research paper, an annual report, your college notes — and chat with it. Every answer cites the page it came from. This is the project that gets people asking **"how did you build this?"**

```mermaid
flowchart LR
  P[📄 PDF in<br>user gives a path] --> C[✂️ Chunk<br>~800 chars]
  C --> E[📍 Embed + store<br>Chroma]:::hl
  E --> R[🔎 Retrieve<br>top-3 chunks]:::hl
  R --> T[💬 Chat<br>terminal loop]:::good
```

Load → chunk → embed → retrieve → answer. Let's write each piece.

<a id="project-index"></a>

### Step 1 — Load the PDF & Index It Once

pdf_chat.py · part 1

```python
# pip install langchain langchain-openai langchain-chroma langchain-huggingface \
#             langchain-community pypdf sentence-transformers python-dotenv

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

<a id="project-answer"></a>

### Step 2 — Answer with Retrieval + Citations

pdf_chat.py · part 2

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
# ① load the API key and create the PDF assistant model
load_dotenv()

model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ② define the grounded answer prompt and source-citation format
prompt = ChatPromptTemplate.from_template("""
You are a helpful PDF assistant. Answer the question using ONLY the context below.
If the context doesn't contain the answer, say "I couldn't find that in the document."
After your answer, list the page numbers you used as: Sources: page X, page Y.

Context:
{context}

Question: {question}
""")

def ask(db, question):
    # ① retrieve the most relevant PDF chunks for the question
    chunks  = db.similarity_search(question, k=4)
    # ② include page numbers beside each chunk before prompting the model
    context = "\n\n".join(
        f"[page {c.metadata['page']+1}] {c.page_content}" for c in chunks)
    # ③ connect the prompt to the model for this answer
    chain = prompt | model
    # ④ ask the model using only the retrieved PDF context
    return chain.invoke({"context": context, "question": question}).content
```

<a id="project-entry"></a>

### Step 3 — The Entry Point

A tiny `main.py` indexes the PDF once, then answers questions in a loop:

main.py

```python
from pdf_chat import build_index, ask

pdf_path = input("Path to your PDF: ")
db = build_index(pdf_path)                 # ① index once, before the chat loop
print("✅ PDF indexed! Ask me anything about it. (blank line to quit)")

while True:
    question = input("\nYou: ").strip()    # ② every question reuses the same index
    if not question:
        break
    print("Bot:", ask(db, question))
```

#### 🔍 Decoder · the 3 small choices that matter

- **①** `build_index` runs once, before the loop, and the result is kept in `db`. Without that, every question would re-index the PDF from scratch (slow!).
- **②** Indexing only once means each question is instant. This is the same indexing/querying split from Block 15.
- **③** We pass `page` from the chunk metadata into the prompt (in `ask`) — that's how the model knows which page to cite. **Metadata is RAG's superpower.**

<a id="project-run"></a>

### Run It

Save `pdf_chat.py` (parts 1 + 2), `main.py` and your `.env` in one folder, then run:

bash — your project folder

```text
$ python main.py

Path to your PDF: annual_report.pdf
✅ PDF indexed! Ask me anything about it. (blank line to quit)

You: What was the revenue this year?
```

1. **Point it at *any* PDF.** Your resume, the Indian Constitution, your company's HR policy, last quarter's earnings call transcript. Anything text-based.
2. **Ask 3 questions.** One factual ("when was X founded?"), one summary ("what's the main argument?"), one tricky ("compare X and Y"). Notice the citations.
3. **Try a question that's NOT in the doc.** The answer should be *"I couldn't find that in the document."* — that's RAG **refusing to hallucinate**. Watch for this moment. It's the whole point.

<a id="project-demo"></a>

### Try the Working Version 👇

A live in-browser version with three pre-indexed sample documents — click a PDF, ask a question, see RAG retrieve the right chunk before answering:

**📄 Chat with your PDF** — live demo

Pick a sample document

*Control:* 📋 HR Policy · 💰 TCS Q3 Earnings · 📜 Indian Constitution (Part III)

*Control:* Ask

⚙️ Simulated in-browser with a tiny semantic-matching layer so it runs key-free. Your real `pdf_chat.py` uses actual embeddings + GPT — same flow, same feel, larger brain.

> 🎯 **Industry spotlight · this *is* the canonical AI product — you just built the most-shipped AI app of 2024–26.** "Chat with [your docs / your PDF / your codebase / your Notion]" is the single most common AI feature on the market today — and almost all of them are this exact pattern with a fancier UI. ChatGPT's "Browse my files", Claude Projects, Cursor's `@codebase`, Glean, Notion AI — every one of them. You now own the recipe.
>
> Notion AI · Glean · Claude Projects · Cursor @docs · Perplexity Spaces

<a id="project-variations"></a>

### Want a Variation? Pick a Flavour, Swap the PDF

The recipe is the same; the data makes it interesting. Try one of these on your own:

- **📜 Chat with the Constitution** — Index the Indian Constitution PDF. Ask "what are the Fundamental Rights?" with citations. `data: indiacode.nic.in`
- **📊 Chat with an earnings call** — Index TCS or Infosys' last quarterly transcript. Ask about margins, guidance, hiring. `data: investor relations sites`
- **📚 Chat with your textbook** — Index a chapter. Ask exam-style questions. Suddenly: a personalised tutor. `data: your bookshelf`
- **🧾 Chat with company HR policy** — Genuinely useful at your workplace. "How many leaves do I have left?" "What's the WFH policy?" `data: your HR portal`

<a id="next"></a>

## 10. Where This Is *Going*

<a id="next-agentic"></a>

### 🤖 Agentic RAG — When Retrieval Becomes a Decision

**Block 23** ~5 min · what's coming

RAG works. But the frontier is making it *smarter* — and that's where this course leads next.

The RAG you just built always retrieves. But sometimes you don't need to (small talk), and sometimes one retrieval isn't enough (multi-hop questions). **Agentic RAG** = combine the LangChain agent loop with this RAG library. The agent *decides*: "do I need to look this up? Is what I found enough? Should I rewrite my query and try again?"

> **Analogy** 🔁 — **The loop you'll meet next**
>
> *Query → retrieve → grade chunks → if bad, rewrite query, search again → if still bad, ask user for clarification → answer.* Same agent loop you built with LangChain agents, with the RAG librarian as one of its tools.

<a id="next-advanced"></a>

### 📈 Advanced RAG — the Tricks the Senior Engineers Use

- **✍️ HyDE** — Hypothetical Document Embeddings: have the LLM *imagine* what the answer would look like, then search for chunks that match the imagined answer. Counter-intuitive, works surprisingly well.
- **🪜 Step-back prompting** — Before searching, ask the LLM to generalize the question. "What's the formula for compound interest in this case?" → "What is compound interest?" → broader, better retrieval.
- **🕸️ Graph RAG** — Build a knowledge graph from your docs (entities + relationships). Now you can answer "who reports to X" by walking the graph, not just searching.
- **📊 RAG evaluation** — How do you measure if your RAG is good? Three metrics: *relevance*, *faithfulness*, *correctness*. We'll wire up a real eval pipeline.

> 🔑 **🚀 Where you are right now.** By now you've built a chatbot, an agent, and a RAG system. You understand the four pieces of every AI product — *model · prompt · tool · retrieval*. Almost everything ahead is recombining these four in cleverer ways. You're past the steep part of the curve.

- **📍 Embeddings** — Text → vectors. Similar meaning = nearby.
- **✂️ Chunking** — The unglamorous knob that decides quality.
- **🗂️ Vector DB** — Three calls: add, query, delete.
- **🎯 You shipped** — A real "Chat with your PDF". 🎉
