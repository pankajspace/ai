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

# Swap base_url for Groq ("https://api.groq.com/openai/v1") or Gemini ("https://generativelanguage.googleapis.com/v1beta/openai/")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url="https://api.openai.com/v1")
MODEL = "gpt-4o-mini"
```

### 4.2. Classical ML (`scikit-learn` + `joblib`)
```python
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# 1. Train & save tabular model
df = pd.DataFrame({"x1": [1, 2, 3], "x2": [10, 20, 30], "y": [15, 30, 45]})
model = RandomForestRegressor(random_state=42).fit(df[["x1", "x2"]], df["y"])
joblib.dump(model, "model.pkl")

# 2. Load & predict (Sample Input: x1=2.5, x2=25)
pred = float(joblib.load("model.pkl").predict(pd.DataFrame([{"x1": 2.5, "x2": 25}]))[0])  # -> ~37.5
```

### 4.3. Single LLM Call & Enforced JSON Shape (`json_schema`)
```python
import json

# 1. Define exact expected JSON shape
RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "sentiment": {"type": "string", "enum": ["Positive", "Negative", "Mixed"]},
        "entities": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["sentiment", "entities"],
    "additionalProperties": False,
}

# 2. Enforce schema via response_format (Sample Input: "Great camera, weak battery.")
resp = client.chat.completions.create(
    model=MODEL,
    messages=[{"role": "user", "content": "Extract from: 'Great camera, weak battery.'"}],
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "extraction", "strict": True, "schema": RESPONSE_SCHEMA},
    },
    temperature=0.0,
)
data = json.loads(resp.choices[0].message.content)  # -> {'sentiment': 'Mixed', 'entities': ['camera', 'battery']}
```

### 4.4. LangChain LCEL Pipeline
```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI

# Prompt -> LLM -> String Parser -> Allowlist Normalizer
chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Classify into ONE word: low, high, or unknown."),
        ("human", "{text}"),
    ])
    | ChatOpenAI(model="gpt-4o-mini", temperature=0)
    | StrOutputParser()
    | RunnableLambda(lambda s: s.strip().lower() if s.strip().lower() in ("low", "high") else "unknown")
)
label = chain.invoke({"text": "Server is down!"})  # -> "high"
```

### 4.5. Embeddings & ChromaDB RAG
```python
import numpy as np
from sentence_transformers import SentenceTransformer
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Local CPU embeddings & cosine similarity
vecs = SentenceTransformer("all-MiniLM-L6-v2").encode(["Reset password", "Forgot login"], normalize_embeddings=True)
sim = float(np.dot(vecs[0], vecs[1]))  # -> ~0.68

# 2. Chunk -> Embed in ChromaDB -> Retrieve top-k -> Grounded Answer
docs = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30).create_documents(["Refunds take 3 days."])
vectorstore = Chroma.from_documents(docs, OpenAIEmbeddings(model="text-embedding-3-small"))
context = "\n".join(d.page_content for d in vectorstore.similarity_search("Refund time?", k=2))
answer = ChatOpenAI(model="gpt-4o-mini").invoke(f"Context:\n{context}\n\nQ: Refund time?").content
```

### 4.6. Tool-Calling Agents (Raw SDK, LangGraph, AWS Strands)
```python
# --- A. Raw OpenAI / Groq ReAct Loop ---
TOOLS_SCHEMA = [{
    "type": "function",
    "function": {
        "name": "add",
        "description": "Add a and b.",
        "parameters": {"type": "object", "properties": {"a": {"type": "number"}, "b": {"type": "number"}}, "required": ["a", "b"]},
    },
}]
TOOLS = {"add": lambda args: args["a"] + args["b"]}

messages = [{"role": "user", "content": "What is 12 + 8?"}]
for _ in range(5):
    msg = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOLS_SCHEMA).choices[0].message
    if not msg.tool_calls:
        print(msg.content)  # -> "20"
        break
    messages.append(msg)
    for call in msg.tool_calls:
        res = TOOLS[call.function.name](json.loads(call.function.arguments))
        messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps(res)})
```

```python
# --- B. LangGraph Agent & C. AWS Strands Bedrock Agent ---
from langchain_core.tools import tool as lc_tool
from langgraph.prebuilt import create_react_agent
from strands import Agent, tool as strands_tool
from strands.models.bedrock import BedrockModel

@lc_tool
def multiply(a: int, b: int) -> int:
    """Multiply a and b."""
    return a * b

lg_res = create_react_agent(ChatOpenAI(model="gpt-4o-mini"), [multiply]).invoke({"messages": [("user", "6 * 7?")]})

@strands_tool
def get_status(id: str) -> str:
    """Get status by ID."""
    return f"{id}: active"

strands_res = str(Agent(model=BedrockModel(model_id="amazon.nova-lite-v1:0"), tools=[get_status])("Status of 42?"))
```

### 4.7. Redis Session Memory & `MessagesPlaceholder`
```python
import redis
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 1. Redis save & load with 1h TTL (Sample Input: session_id="u1")
r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.rpush("session:u1", json.dumps({"role": "user", "content": "Hi, I'm Alex"}))
r.expire("session:u1", 3600)
turns = [json.loads(x) for x in r.lrange("session:u1", 0, -1)]

# 2. Inject history into LangChain prompt
history = [HumanMessage(content=t["content"]) if t["role"] == "user" else AIMessage(content=t["content"]) for t in turns]
chat = ChatPromptTemplate.from_messages([MessagesPlaceholder("history"), ("human", "{input}")]) | ChatOpenAI(model="gpt-4o-mini")
reply = chat.invoke({"history": history, "input": "What is my name?"}).content  # -> "Alex"
```

### 4.8. Parallel Multi-Judge Voting & `FastMCP`
```python
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from mcp.server.fastmcp import FastMCP

# 1. Parallel Multi-Judge Voting Bench (Sample Input: 3 judge functions)
judges = [lambda p: "UPHELD", lambda p: "UPHELD", lambda p: "ESCALATE"]
with ThreadPoolExecutor(max_workers=8) as pool:
    ballots = list(pool.map(lambda fn: fn("Rule UPHELD, REJECTED, or ESCALATE"), judges))
verdict, count = Counter(ballots).most_common(1)[0]  # -> verdict="UPHELD", count=2

# 2. FastMCP Tool Server over stdio
mcp = FastMCP("tools")

@mcp.tool()
def lookup_price(item: str) -> str:
    """Return item price."""
    return "$99"
# Run server with: mcp.run() | Connect client via: stdio_client(StdioServerParameters(...)) -> session.list_tools() / session.call_tool()
```
