[<- README](../../README.md) | [Notes](ai-infused-learning-3.html)

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
