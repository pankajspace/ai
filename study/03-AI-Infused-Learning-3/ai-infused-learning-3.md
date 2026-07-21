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

## Big Idea

LangChain agents let an LLM decide when to call Python functions, use the returned values, and then produce a final answer. The functions are called **tools**. A tool is usually just a normal Python function with:

1. Clear type hints, so the model knows what arguments to pass.
2. A useful docstring, so the model knows when to use it.
3. A predictable return value, so the model can include the result in its answer.

The important learning point is that the model does not run arbitrary Python by itself. It chooses from the tools we expose to it.

## Agent Flow

1. The user asks a question.
2. The agent reads the question, the system prompt, and the available tool descriptions.
3. If a tool is useful, the model emits a tool call with arguments.
4. LangChain runs the matching Python function.
5. The tool result is added back into the conversation.
6. The model writes the final answer using that result.

In the examples below, the `ask()` helper prints this hidden loop so the tool call and tool result are visible.

## Example 1: Agent With One Tool

This first version gives the agent only one tool: `get_weather`. Because the tool list is small, it is easy to see whether the model decides to use the function or answer from its own knowledge.

Try these questions:

1. `What is the weather like in New York?` should call `get_weather`.
2. `What is scaler company?` should not need the weather tool, so the model can answer directly.

```python
"""
Langchain Version V1 - Agents (single tool)
"""

import langchain
print("LangChain version:", langchain.__version__)

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = "groq:llama-3.3-70b-versatile"   # check console.groq.com for current IDs
    REQUIRED_KEY = "GROQ_API_KEY"
elif PROVIDER == "gemini":
    MODEL = "google_genai:gemini-2.0-flash"
    REQUIRED_KEY = "GOOGLE_API_KEY"
else:  # openai
    MODEL = "openai:gpt-4o-mini"
    REQUIRED_KEY = "OPENAI_API_KEY"

key = os.environ.get(REQUIRED_KEY)
if not key:
    raise SystemExit(
        f"{REQUIRED_KEY} not found in environment. "
        f"Add it to your .env for provider '{PROVIDER}'."
    )
print(f"Provider={PROVIDER}  Model={MODEL}  Key={key[:6]}...{key[-4:]}")

# ---------------------------------------------------------------------------
# One tool
# ---------------------------------------------------------------------------
def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is too hot to handle, 28 degrees C."

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
from langchain.agents import create_agent

agent = create_agent(
    model=MODEL,
    tools=[get_weather],
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)

# ---------------------------------------------------------------------------
# Run a question and show the tool call + tool result.
# ---------------------------------------------------------------------------
def ask(question: str, show_steps: bool = True) -> None:
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    print(f"\nQ: {question}")

    if show_steps:
        for msg in response["messages"]:
            if msg.type == "ai" and getattr(msg, "tool_calls", None):
                for tc in msg.tool_calls:
                    print(f"   [tool call]   {tc['name']}({tc['args']})")
            elif msg.type == "tool":
                print(f"   [tool result] {msg.content}")

    print(f"A: {response['messages'][-1].content}")

# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")
    ask("What is scaler company?")
```

Key observations:

1. The tool name, parameter name, type hint, and docstring all influence how the model calls the tool.
2. The model can choose not to call a tool when the tool is irrelevant.
3. The final answer depends on the system prompt. Here, the prompt asks the model to state the result clearly.

## Example 2: Agent With Multiple Tools

This version adds several tools so the agent has to choose between them. That makes the example closer to a real assistant, where different functions handle different tasks.

The available tools are:

1. `get_weather(city: str)` for weather questions.
2. `add(a: float, b: float)` for addition.
3. `multiply(a: float, b: float)` for multiplication.
4. `get_population(city: str)` for population lookups.

The interesting test is the combined question: `What's the weather in Tokyo, and what is 12 times 12?` A good agent should call two tools and then combine both results in one final answer.

```python
"""
Langchain Version V1 - Agents (multiple tools + visible tool calls)

Teaching idea: give the agent SEVERAL tools, then SHOW what it does internally.
For each question the agent: reads the tools -> decides which to call ->
calls it -> reads the result -> writes a final answer. The step trace below
makes that loop visible so students can see the function calls happen.

NOTE on the OpenAI 429 ('insufficient_quota'): billing state, not a bug.
PROVIDER="groq" (free) keeps you teaching without OpenAI credits.
"""

import langchain
print("LangChain version:", langchain.__version__)

# ---------------------------------------------------------------------------
# Load environment / API keys
# ---------------------------------------------------------------------------
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(), override=True)

# ---------------------------------------------------------------------------
# Pick your provider here.
# ---------------------------------------------------------------------------
# "groq"   -> free + fast.  Key: https://console.groq.com      (GROQ_API_KEY)
# "gemini" -> free tier.    Key: https://aistudio.google.com   (GOOGLE_API_KEY)
# "openai" -> needs billing/credits set up.                    (OPENAI_API_KEY)
PROVIDER = "groq"

if PROVIDER == "groq":
    MODEL = "groq:llama-3.3-70b-versatile"   # check console.groq.com for current IDs
    REQUIRED_KEY = "GROQ_API_KEY"
elif PROVIDER == "gemini":
    MODEL = "google_genai:gemini-2.0-flash"
    REQUIRED_KEY = "GOOGLE_API_KEY"
else:  # openai
    MODEL = "openai:gpt-4o-mini"
    REQUIRED_KEY = "OPENAI_API_KEY"

key = os.environ.get(REQUIRED_KEY)
if not key:
    raise SystemExit(
        f"{REQUIRED_KEY} not found in environment. "
        f"Add it to your .env for provider '{PROVIDER}'."
    )
print(f"Provider={PROVIDER}  Model={MODEL}  Key={key[:6]}...{key[-4:]}")

# ---------------------------------------------------------------------------
# Tools
#   1. Type hints (city: str)  -> tell the model what arguments to pass
#   2. The docstring           -> tells the model WHEN to use this tool
# ---------------------------------------------------------------------------

def get_weather(city: str) -> str:
    """Get the current weather for a given city."""
    return f"The weather in {city} is sunny, 28 degrees C."


def add(a: float, b: float) -> float:
    """Add two numbers together."""
    return a + b


def multiply(a: float, b: float) -> float:
    """Multiply two numbers together."""
    return a * b


def get_population(city: str) -> str:
    """Get the approximate population of a major city."""
    data = {
        "new york": "8.5 million",
        "london": "9 million",
        "bangalore": "13 million",
        "tokyo": "14 million",
    }
    return data.get(city.lower(), f"Sorry, I don't have population data for {city}.")


TOOLS = [get_weather, add, multiply, get_population]

# ---------------------------------------------------------------------------
# Build the agent
# ---------------------------------------------------------------------------
from langchain.agents import create_agent

agent = create_agent(
    model=MODEL,
    tools=TOOLS,
    # Tighter prompt: force the model to actually state the result so we don't
    # get vague answers like "that's the current weather".
    system_prompt=(
        "You are a helpful assistant. Use the available tools when needed. "
        "Always state the final result clearly and completely in your answer."
    ),
)


# ---------------------------------------------------------------------------
# Run a question and (optionally) show every tool call + tool result.
# ---------------------------------------------------------------------------
def ask(question: str, show_steps: bool = True) -> None:
    response = agent.invoke({"messages": [{"role": "user", "content": question}]})
    print(f"\nQ: {question}")

    if show_steps:
        for msg in response["messages"]:
            # The AI decided to call one or more tools
            if msg.type == "ai" and getattr(msg, "tool_calls", None):
                for tc in msg.tool_calls:
                    print(f"   [tool call]   {tc['name']}({tc['args']})")
            # A tool returned its result
            elif msg.type == "tool":
                print(f"   [tool result] {msg.content}")

    print(f"A: {response['messages'][-1].content}")


# ---------------------------------------------------------------------------
# Demo
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    ask("What is the weather like in New York?")          # -> get_weather
    ask("What is 25 multiplied by 4?")                     # -> multiply
    ask("What is 137 plus 568?")                           # -> add
    ask("What is the population of Bangalore?")            # -> get_population
    ask("What's the weather in Tokyo, and what is 12 times 12?")  # -> two tools
    ask("Who wrote the play Romeo and Juliet?")   # -> no tool needed
```

Key observations:

1. More tools mean the model must classify the user's intent more carefully.
2. A single user question can lead to multiple tool calls.
3. Tool descriptions should be specific. If two tools have vague or overlapping docstrings, the model may choose the wrong one.
4. The agent can still answer normal knowledge questions without tools.

## Practical Tips

1. Keep tool functions small and focused.
2. Use descriptive function names like `get_population` instead of generic names like `lookup`.
3. Write docstrings as instructions for the model, not just as comments for humans.
4. Return simple strings, numbers, or JSON-like dictionaries that are easy for the model to read.
5. Print tool calls while learning or debugging, because it shows whether the model's decision process matches your expectation.

## Common Mistakes

1. Assuming the tool runs automatically: the model must first decide that a tool is useful.
2. Weak docstrings: the model may ignore or misuse a tool if the purpose is unclear.
3. Too many unrelated tools: this can make tool selection noisy.
4. Expecting live data from fake tools: these examples return hardcoded values, so they are for learning the agent pattern, not real weather or population data.

## Practice Ideas

1. Add a `subtract(a: float, b: float)` tool and test subtraction questions.
2. Add a `divide(a: float, b: float)` tool and handle division by zero.
3. Replace the hardcoded weather tool with a real weather API.
4. Add a `get_company_info(company: str)` tool so the `scaler company` question can use a tool.
5. Ask one question that requires three tools and check whether the printed trace shows all three calls.

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
