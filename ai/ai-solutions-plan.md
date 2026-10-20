# AI Solutions Plan: Fast Decision Guide & Code Snippets

## 1. 4-Step Plan for Any Problem Statement

1. **Split LLM vs. Python:** Use LLMs only for unstructured text (classify, extract, route, draft). Keep all math, regex, scoring, and thresholds in pure Python functions.
2. **Pick the Lowest Complexity Level:**
   1. **Level 0 (Pure Python):** Exact rules or math $\rightarrow$ no AI needed.
   2. **Level 1 (Classical ML):** Tabular numbers $\rightarrow$ `scikit-learn` + `joblib` ([4.2](#42-classical-ml-scikit-learn--joblib)).
   3. **Level 2 (Single LLM + JSON Schema):** Summarize, classify, or extract JSON in one call ([4.3](#43-single-llm-call--enforced-json-shape-json_schema)).
   4. **Level 3 (Hybrid LCEL Pipeline):** Fixed sequence: `Classify` $\rightarrow$ `Python Rule` $\rightarrow$ `Draft` ([4.4](#44-langchain-lcel-pipeline)).
   5. **Level 4 (Embeddings & RAG):** Grounded Q&A over documents using `ChromaDB` ([4.5](#45-embeddings--chromadb-rag)).
   6. **Level 5 (Single Tool Agent):** LLM dynamically picks tools in a loop ([4.6](#46-tool-calling-agents-raw-sdk-langgraph-aws-strands)).
   7. **Level 6 (Memory, Multi-Judge & MCP):** `Redis` memory, parallel judge voting, or `FastMCP` tool servers ([4.7](#47-redis-session-memory--messagesplaceholder), [4.8](#48-parallel-multi-judge-voting--fastmcp)).
3. **Choose the Tech Stack:** Pick model, framework, and storage from Section 2.
4. **Add Guardrails:** Cap agent loops (`range(5)`), enforce `json_schema`, parallelize multi-calls (`ThreadPoolExecutor`), and add safe fallbacks (`"unknown"` / `"ESCALATE"`).

---

## 2. Quick Decision Guide: Which Tech When

1. **Model Provider:**
   1. **OpenAI (`gpt-4o-mini`):** Default for reliable instructions, strict `json_schema`, and LCEL chains.
   2. **Groq (`openai/gpt-oss-20b`):** Ultra-fast multi-turn ReAct tool loops.
   3. **AWS Bedrock (`amazon.nova-lite-v1:0`):** AWS IAM-authenticated workloads with `strands-agents`.
   4. **Gemini (`gemini-3.8-flash`):** Independent secondary judge in multi-model voting panels.
2. **Framework:**
   1. **Raw `openai` SDK:** Single calls, `json_schema` extraction, parallel judges, and custom ReAct loops.
   2. **LangChain LCEL (`prompt | llm | parser`):** Fixed multi-step prompt chains.
   3. **LangGraph (`create_react_agent` / `StateGraph`):** Stateful cyclic agent workflows.
   4. **AWS Strands (`@tool` + `Agent`):** Decorator-based tool agents on Bedrock.
   5. **FastMCP (`mcp`):** Decoupled tool server subprocess over `stdio`.
3. **Storage & Embeddings:**
   1. **Local Embeddings (`SentenceTransformer("all-MiniLM-L6-v2")`):** Free CPU embeddings & cosine similarity.
   2. **Cloud Embeddings (`OpenAIEmbeddings("text-embedding-3-small")`):** Low-RAM embeddings for larger docs.
   3. **ChromaDB (`chromadb`):** Vector search (`EphemeralClient` in-memory or `PersistentClient` on disk).
   4. **Redis (`redis`):** Multi-user chat session persistence (`rpush`, `lrange`, `expire`).

---

## 3. 4 Solution Alternatives for Any Problem Statement

1. **Alternative A — Hybrid Pipeline (Level 3, Default):** `Input` $\rightarrow$ `LLM Classify` $\rightarrow$ `Python Math/Policy` $\rightarrow$ `LLM Draft`. Fastest (1–2 calls), 100% accurate rules, fixed flow.
2. **Alternative B — Single ReAct Agent (Level 5):** `Input` $\rightarrow$ `Bounded Tool Loop` $\rightarrow$ `Answer`. Flexible for conversational/multi-tool queries, higher latency (2–5 calls).
3. **Alternative C — Grounded RAG + ML (Level 4 + 1):** `Input` $\rightarrow$ `(Optional sklearn .pkl)` $\rightarrow$ `ChromaDB Top-k` $\rightarrow$ `Grounded Answer`. Best for large policy/manual Q&A.
4. **Alternative D — Multi-Judge Ensemble + MCP (Level 6):** `Input` $\rightarrow$ `Claim Extractor` $\rightarrow$ `Parallel 3-Judge Vote (OpenAI+Gemini+Groq)` $\rightarrow$ `Python Cap Settlement`. Best for high-stakes disputes.

---

## 4. Essential AI Code Snippets

### 4.1. Multi-Provider LLM Client (`OpenAI`, `Groq`, `Gemini`)
```python
import os
from openai import OpenAI

# 1. Configure provider endpoint and model:
#    - OpenAI: base_url="https://api.openai.com/v1", MODEL="gpt-4o-mini"
#    - Groq:   base_url="https://api.groq.com/openai/v1", MODEL="openai/gpt-oss-20b"
#    - Gemini: base_url="https://generativelanguage.googleapis.com/v1beta/openai/", MODEL="gemini-3.8-flash"
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),  # Reads API key from environment variable
    base_url="https://api.openai.com/v1",
)
MODEL = "gpt-4o-mini"

# 2. Sample Input & Basic Completion Call
sample_prompt = "Reply in 3 words: What is Python?"
resp = client.chat.completions.create(
    model=MODEL,
    messages=[{"role": "user", "content": sample_prompt}],
    temperature=0.0,  # 0.0 = deterministic output
)
answer = resp.choices[0].message.content  # Sample Output: "Versatile programming language."
```

### 4.2. Classical ML (`scikit-learn` + `joblib`)
```python
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# 1. Sample Training Input: tabular dataset with features (x1, x2) and target (y)
train_df = pd.DataFrame({
    "x1": [1.0, 2.0, 3.0, 4.0],
    "x2": [10.0, 20.0, 30.0, 40.0],
    "y": [15.0, 30.0, 45.0, 60.0],
})

# 2. Fit regression model on feature columns and persist to disk (.pkl)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(train_df[["x1", "x2"]], train_df["y"])
joblib.dump(model, "model.pkl")

# 3. Sample Inference Input: unseen row with the exact same feature names
sample_input = pd.DataFrame([{"x1": 2.5, "x2": 25.0}])

# 4. Load saved artifact from disk and predict numeric target
loaded_model = joblib.load("model.pkl")
pred = float(loaded_model.predict(sample_input)[0])  # Sample Output: ~37.5
```

### 4.3. Single LLM Call & Enforced JSON Shape (`json_schema`)
```python
import json

# 1. Define strict JSON Schema: guarantees keys, types, enums, and no extra fields
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["Positive", "Negative", "Mixed"]},
        "entities": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["sentiment", "entities"],
    "additionalProperties": False,  # Required when strict=True
}

# 2. Sample Input: unstructured customer review
sample_review = "Great camera and display, but weak battery life."

# 3. Call LLM with response_format={"type": "json_schema", ...} to enforce structure
resp = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": "Extract overall sentiment and mentioned product entities."},
        {"role": "user", "content": sample_review},
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "extraction", "strict": True, "schema": RESPONSE_SCHEMA},
    },
    temperature=0.0,
)

# 4. Parse guaranteed-valid JSON string into a Python dict
data = json.loads(resp.choices[0].message.content)
# Sample Output: {"sentiment": "Mixed", "entities": ["camera", "display", "battery life"]}
```

### 4.4. LangChain LCEL Pipeline
```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI

# 1. Build fixed pipe: Prompt Template -> Chat Model -> String Parser -> Python Guardrail
ALLOWED_LABELS = {"low", "high"}
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Classify ticket urgency into ONE word: low, high, or unknown."),
        ("human", "{text}"),
    ])
    | ChatOpenAI(model="gpt-4o-mini", temperature=0)  # Deterministic classification
    | StrOutputParser()                               # Extracts message.content as str
    | RunnableLambda(                                 # Fallback to "unknown" if hallucinated
        lambda s: s.strip().lower() if s.strip().lower() in ALLOWED_LABELS else "unknown"
    )
)

# 2. Sample Input: incoming support ticket
sample_ticket = {"text": "Production database is down and checkout is failing!"}

# 3. Invoke pipeline synchronously
label = chain.invoke(sample_ticket)  # Sample Output: "high"
```

### 4.5. Embeddings & ChromaDB RAG
```python
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Part 1: Local CPU Embeddings & Cosine Similarity ---
# Sample Input: two short support queries to compare semantically
sample_pair = ["Reset my account password", "I forgot my login credentials"]

# Encode into L2-normalized vectors so dot product equals cosine similarity (-1.0 to 1.0)
embedder = SentenceTransformer("all-MiniLM-L6-v2")
vecs = embedder.encode(sample_pair, normalize_embeddings=True)
sim = float(np.dot(vecs[0], vecs[1]))  # Sample Output: ~0.68 (high semantic similarity)

# --- Part 2: Chunk -> Embed in ChromaDB -> Retrieve Top-k -> Grounded Answer ---
# Sample Input: raw policy documents + user question
sample_docs = [
    "Refund Policy: Standard refunds are processed within 3 business days to the original card.",
    "Shipping Policy: Express orders ship within 24 hours; standard orders take 3-5 days.",
]
sample_question = "How long do refunds take?"

# Split raw text into overlapping chunks and index in an in-memory Chroma vectorstore
chunks = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30).create_documents(sample_docs)
vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings(model="text-embedding-3-small"))

# Retrieve top-k most relevant chunks and pass them as grounding context to the LLM
top_docs = vectorstore.similarity_search(sample_question, k=1)
context = "\n".join(d.page_content for d in top_docs)
answer = ChatOpenAI(model="gpt-4o-mini", temperature=0).invoke(
    f"Answer using ONLY the context below.\nContext:\n{context}\n\nQuestion: {sample_question}"
).content  # Sample Output: "Standard refunds take 3 business days."
```

### 4.6. Tool-Calling Agents (Raw SDK, LangGraph, AWS Strands)
```python
# --- A. Raw OpenAI / Groq ReAct Loop ---
# 1. Define JSON tool schema for the LLM and map function names to pure Python functions
TOOLS_SCHEMA = [{
    "type": "function",
    "function": {
        "name": "add",
        "description": "Add two numbers a and b.",
        "parameters": {
            "type": "object",
            "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
            "required": ["a", "b"],
        },
    },
}]
TOOLS = {"add": lambda args: args["a"] + args["b"]}

# 2. Sample Input: natural-language math query requiring tool execution
messages = [{"role": "user", "content": "What is 12.5 + 8.5?"}]

# 3. Bounded ReAct loop (max 5 turns to prevent infinite tool loops)
for _ in range(5):
    msg = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOLS_SCHEMA).choices[0].message
    if not msg.tool_calls:
        print(msg.content)  # Sample Output: "12.5 + 8.5 is 21.0."
        break
    messages.append(msg)  # Record assistant's tool call request
    for call in msg.tool_calls:
        # Parse LLM arguments, invoke Python function, and append tool result linked by tool_call_id
        fn_args = json.loads(call.function.arguments)  # e.g., {"a": 12.5, "b": 8.5}
        res = TOOLS[call.function.name](fn_args)       # -> 21.0
        messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(res)})
```

```python
# --- B. LangGraph Prebuilt ReAct Agent ---
from langchain_core.tools import tool as lc_tool
from langgraph.prebuilt import create_react_agent

# Docstring + type hints are automatically converted into the tool's JSON schema
@lc_tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers a and b."""
    return a * b

# Sample Input: user message list -> agent calls multiply(6, 7) -> returns final state
lg_agent = create_react_agent(ChatOpenAI(model="gpt-4o-mini", temperature=0), tools=[multiply])
lg_state = lg_agent.invoke({"messages": [("user", "What is 6 * 7?")]})
lg_answer = lg_state["messages"][-1].content  # Sample Output: "6 * 7 is 42."

# --- C. AWS Strands Bedrock Agent ---
from strands import Agent, tool as strands_tool
from strands.models.bedrock import BedrockModel

@strands_tool
def get_order_status(order_id: str) -> str:
    """Look up current delivery status for a given order_id."""
    return f"Order {order_id}: Shipped (arriving tomorrow)"

# Sample Input: natural-language prompt -> Bedrock Nova invokes @strands_tool -> returns answer
strands_agent = Agent(model=BedrockModel(model_id="amazon.nova-lite-v1:0"), tools=[get_order_status])
strands_answer = str(strands_agent("Check status for order ORD-42"))
# Sample Output: "Order ORD-42 has shipped and is arriving tomorrow."
```

### 4.7. Redis Session Memory & `MessagesPlaceholder`
```python
import redis
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. Sample Input: user session ID, prior conversation turn, and follow-up question
session_key = "session:user_101"
prior_turn = {"role": "user", "content": "Hi, my name is Alex and I use the Pro plan."}
followup_input = "What is my name and plan?"

# 2. Save turn to Redis list (rpush) with a 1-hour TTL (expire) and read back full session (lrange)
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.rpush(session_key, json.dumps(prior_turn))
r.expire(session_key, 3600)
turns = [json.loads(x) for x in r.lrange(session_key, 0, -1)]

# 3. Convert stored JSON dicts into LangChain message objects and inject via MessagesPlaceholder
history = [
    HumanMessage(content=t["content"]) if t["role"] == "user" else AIMessage(content=t["content"])
    for t in turns
]
chat = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful support assistant."),
        MessagesPlaceholder("history"),  # Expands prior HumanMessage/AIMessage list in-place
        ("human", "{input}"),
    ])
    | ChatOpenAI(model="gpt-4o-mini", temperature=0)
)
reply = chat.invoke({"history": history, "input": followup_input}).content
# Sample Output: "Your name is Alex and you are on the Pro plan."
```

### 4.8. Parallel Multi-Judge Voting & `FastMCP`
```python
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from mcp.server.fastmcp import FastMCP

# --- Part 1: Parallel Multi-Judge Voting Bench ---
# Sample Input: dispute case description + 3 independent judge callables (e.g., OpenAI, Gemini, Groq)
sample_case = "Customer returned item within 7 days with original receipt; merchant denied refund."
judges = [
    lambda case: "UPHELD",    # Judge 1 (e.g., OpenAI gpt-4o-mini)
    lambda case: "UPHELD",    # Judge 2 (e.g., Gemini 3.8 Flash)
    lambda case: "ESCALATE",  # Judge 3 (e.g., Groq gpt-oss-20b)
]

# Execute all judge calls concurrently via thread pool and compute majority vote
with ThreadPoolExecutor(max_workers=8) as pool:
    ballots = list(pool.map(lambda fn: fn(sample_case), judges))  # -> ["UPHELD", "UPHELD", "ESCALATE"]
verdict, vote_count = Counter(ballots).most_common(1)[0]
# Sample Output: verdict="UPHELD", vote_count=2 (majority 2/3 reached)

# --- Part 2: FastMCP Tool Server over stdio ---
# Exposes Python functions as standardized MCP tools to any MCP-compatible client
mcp = FastMCP("pricing-tools")

@mcp.tool()
def lookup_price(sku: str) -> str:
    """Return the unit price for a given product SKU."""
    catalog = {"SKU-100": "$99.00", "SKU-200": "$149.00"}
    return catalog.get(sku, "UNKNOWN_SKU")

# Sample Input via MCP Client: session.call_tool("lookup_price", {"sku": "SKU-100"}) -> "$99.00"
# Start server subprocess on stdio with: mcp.run()
```
