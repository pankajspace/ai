<!--
Source: ai-reusable-snippets.html
Title: AI Reusable Code Snippets & Quick Revision Guide | TechToday
Theme-color: #0b0d10
Stylesheets: ai-snippets-study.css, ../../site-header.css
Scripts: ai-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Projects](ai-projects.html)

# AI Reusable Code Snippets & Quick Revision Guide

A domain-agnostic, copy-paste-ready catalog of reusable Python & AI engineering templates distilled from the `practice/` workspace modules (`01-python` through `08-ai-mcp-evals`). All domain-specific business logic has been replaced with generic, plug-and-play skeletons.

---

## Table of Contents (Index)

1. [1. Python Fundamentals for AI Systems (`practice/01-python`)](#1-python-fundamentals-for-ai-systems-practice01-python)
   1. [1.1. Type Hints, Optional/Union & Unpacking](#11-type-hints-optionalunion--unpacking)
   2. [1.2. Comprehensions, Filtering & Multi-Key Sorting](#12-comprehensions-filtering--multi-key-sorting)
   3. [1.3. Defensive Error Handling Wrapper](#13-defensive-error-handling-wrapper)
   4. [1.4. Stateful OOP Resource Class Template](#14-stateful-oop-resource-class-template)
   5. [1.5. Async I/O Concurrency (`asyncio.gather` & `create_task`)](#15-async-io-concurrency-asynciogather--create_task)
2. [2. Multi-Provider LLM Clients & LangChain Basics (`practice/02-ai-basics`)](#2-multi-provider-llm-clients--langchain-basics-practice02-ai-basics)
   1. [2.1. Multi-Provider OpenAI-Compatible Client (`OpenAI`, `Groq`, `Gemini`)](#21-multi-provider-openai-compatible-client-openai-groq-gemini)
   2. [2.2. LangChain LCEL Pipe Chain (`prompt | model | parser`)](#22-langchain-lcel-pipe-chain-prompt--model--parser)
   3. [2.3. Stateful Multi-Turn Chat (`MessagesPlaceholder`)](#23-stateful-multi-turn-chat-messagesplaceholder)
   4. [2.4. Raw OpenAI Tool-Calling Loop (No Framework)](#24-raw-openai-tool-calling-loop-no-framework)
   5. [2.5. LangChain Multi-Tool Agent with Swappable Provider & Trace](#25-langchain-multi-tool-agent-with-swappable-provider--trace)
3. [3. Document Chunking, Embeddings & Local RAG (`practice/03-ai-rag-chroma`)](#3-document-chunking-embeddings--local-rag-practice03-ai-rag-chroma)
   1. [3.1. Sliding-Window Document Chunking (`RecursiveCharacterTextSplitter`)](#31-sliding-window-document-chunking-recursivecharactertextsplitter)
   2. [3.2. Local Sentence Embeddings & Cosine Similarity (`SentenceTransformer`)](#32-local-sentence-embeddings--cosine-similarity-sentencetransformer)
   3. [3.3. End-to-End Local Vector RAG (`HuggingFaceEmbeddings` + `Chroma`)](#33-end-to-end-local-vector-rag-huggingfaceembeddings--chroma)
4. [4. ML Model Training, ChromaDB Server & Redis Memory (`practice/04-ai-model-training-chromadb`)](#4-ml-model-training-chromadb-server--redis-memory-practice04-ai-model-training-chromadb)
   1. [4.1. Scikit-Learn Training, `joblib` Serialization & Pydantic Inference](#41-scikit-learn-training-joblib-serialization--pydantic-inference)
   2. [4.2. ChromaDB HTTP/Ephemeral Client & Document Folder Ingestion](#42-chromadb-httpephemeral-client--document-folder-ingestion)
   3. [4.3. Stateful Tool-Calling Agent with Redis Session Memory](#43-stateful-tool-calling-agent-with-redis-session-memory)
5. [5. AWS Bedrock, Strands Agents & LangGraph (`practice/05-ai-aws-strands`)](#5-aws-bedrock-strands-agents--langgraph-practice05-ai-aws-strands)
   1. [5.1. Minimal AWS Strands Agent on Amazon Bedrock (`BedrockModel`)](#51-minimal-aws-strands-agent-on-amazon-bedrock-bedrockmodel)
   2. [5.2. LangGraph Prebuilt ReAct Agent (`init_chat_model` + `create_react_agent`)](#52-langgraph-prebuilt-react-agent-init_chat_model--create_react_agent)
   3. [5.3. Function-to-Tool Pattern (`@tool` + Type Hints + Docstring)](#53-function-to-tool-pattern-tool--type-hints--docstring)
   4. [5.4. Pre-Built Community Tools & Unattended Consent (`strands_tools`)](#54-pre-built-community-tools--unattended-consent-strands_tools)
   5. [5.5. Class-Based Shared-Resource Tools](#55-class-based-shared-resource-tools)
   6. [5.6. Async Parallel Tool Execution (`async def` + `invoke_async`)](#56-async-parallel-tool-execution-async-def--invoke_async)
6. [6. AI Systems: Prompting, Sycophancy & Multi-Judge Bench (`practice/06-ai-systems`)](#6-ai-systems-prompting-sycophancy--multi-judge-bench-practice06-ai-systems)
   1. [6.1. Prompting Strategies (Direct vs. Zero-Shot CoT vs. Few-Shot CoT) & Answer Extraction](#61-prompting-strategies-direct-vs-zero-shot-cot-vs-few-shot-cot--answer-extraction)
   2. [6.2. Multi-Turn Adversarial Pushback Runner & Forced `VERDICT:` Scorer](#62-multi-turn-adversarial-pushback-runner--forced-verdict-scorer)
   3. [6.3. Multi-Judge Parallel Voting Bench & Deterministic Threshold Gate](#63-multi-judge-parallel-voting-bench--deterministic-threshold-gate)
7. [7. AI Reliability: Determinism, Schema Calibration & Error Injection (`practice/07-ai-reliability`)](#7-ai-reliability-determinism-schema-calibration--error-injection-practice07-ai-reliability)
   1. [7.1. Multi-Run Stochastic Accuracy Evaluator](#71-multi-run-stochastic-accuracy-evaluator)
   2. [7.2. Enforced JSON Schema (`response_format`) & Exponential Backoff Retry](#72-enforced-json-schema-response_format--exponential-backoff-retry)
   3. [7.3. Forced Tool Routing Benchmark (`tool_choice="required"`)](#73-forced-tool-routing-benchmark-tool_choicerequired)
   4. [7.4. Structured Tool Error Payload & Anti-Hallucination System Prompt](#74-structured-tool-error-payload--anti-hallucination-system-prompt)
8. [8. Model Context Protocol (MCP) & Agent Evals (`practice/08-ai-mcp-evals`)](#8-model-context-protocol-mcp--agent-evals-practice08-ai-mcp-evals)
   1. [8.1. FastMCP Tool Server over `stdio` (`FastMCP` & `@mcp.tool`)](#81-fastmcp-tool-server-over-stdio-fastmcp--mcptool)
   2. [8.2. Direct MCP Client Protocol Plumbing (No LLM)](#82-direct-mcp-client-protocol-plumbing-no-llm)
   3. [8.3. MCP-Enabled LLM Agent (`to_openai_format` Bridge + Agent Loop)](#83-mcp-enabled-llm-agent-to_openai_format-bridge--agent-loop)
   4. [8.4. Automated Agent Evaluation Suite (Routing + Fact Assertions)](#84-automated-agent-evaluation-suite-routing--fact-assertions)
9. [9. Docker & Compose Templates for AI Projects (`practice/*/Dockerfile`)](#9-docker--compose-templates-for-ai-projects-practicedockerfile)
   1. [9.1. Layer-Cached Python 3.12 `Dockerfile`](#91-layer-cached-python-312-dockerfile)
   2. [9.2. Multi-Service `docker-compose.yml` (App + ChromaDB + Redis)](#92-multi-service-docker-composeyml-app--chromadb--redis)
10. [10. Quick Revision Cheatsheet](#10-quick-revision-cheatsheet)
    1. [10.1. Practice Module-to-Pattern Quick Map](#101-practice-module-to-pattern-quick-map)
    2. [10.2. LLM Provider & Framework Selection Rules](#102-llm-provider--framework-selection-rules)
    3. [10.3. Tool-Calling & Agent Architecture Golden Rules](#103-tool-calling--agent-architecture-golden-rules)
    4. [10.4. RAG, Embeddings & Memory Checklist](#104-rag-embeddings--memory-checklist)
    5. [10.5. Reliability, Guardrails & Evaluation Checklist](#105-reliability-guardrails--evaluation-checklist)
    6. [10.6. Essential One-Liners & CLI Commands](#106-essential-one-liners--cli-commands)

---

## 1. Python Fundamentals for AI Systems (`practice/01-python`)

### 1.1. Type Hints, Optional/Union & Unpacking
Source: `practice/01-python/02-type-hints.py`, `practice/01-python/12-unpacking.py`

```python
from typing import Any

# 1. Explicit type annotations (also used by LLM @tool decorators to generate JSON schemas)
def process_payload(
    item_id: str,
    count: int = 1,
    tags: list[str] | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Normalize input parameters with safe defaults for optional collections."""
    return {
        "item_id": item_id.strip(),
        "count": count,
        "tags": tags or [],
        "metadata": metadata or {},
    }

# 2. Sequence star-unpacking and dictionary merging (**kwargs)
first, *middle, last = [1, 2, 3, 4, 5]  # first=1, middle=[2, 3, 4], last=5
defaults = {"temperature": 0.0, "timeout": 15.0}
overrides = {"temperature": 0.7, "model": "gpt-4o-mini"}
config = {**defaults, **overrides}
```

### 1.2. Comprehensions, Filtering & Multi-Key Sorting
Source: `practice/01-python/11-sorting.py`, `practice/01-python/13-list-comprehensions.py`

```python
# 1. List and dictionary comprehensions with conditional filtering
records = [("id_1", 0.88), ("id_2", 0.42), ("id_3", 0.95)]
filtered_ids = [key for key, score in records if score >= 0.70]
score_map = {key: score for key, score in records}

# 2. Multi-key sorting with lambda (e.g., sort by count descending, then score descending)
items = [
    {"label": "option_a", "count": 1, "score": 0.90},
    {"label": "option_b", "count": 2, "score": 0.85},
    {"label": "option_c", "count": 2, "score": 0.92},
]
ranked = sorted(items, key=lambda x: (-x["count"], -x["score"]))
```

### 1.3. Defensive Error Handling Wrapper
Source: `practice/01-python/04-error-handling.py`

```python
from typing import Any, Callable

def safe_execute(fn: Callable[..., Any], *args: Any, **kwargs: Any) -> dict[str, Any]:
    """Execute a callable and return a structured result/error dict without raising."""
    try:
        return {"status": "ok", "result": fn(*args, **kwargs)}
    except (ValueError, TypeError, KeyError) as exc:
        return {"status": "validation_error", "error": str(exc)}
    except Exception as exc:
        return {"status": "runtime_error", "error": f"{type(exc).__name__}: {exc}"}
```

### 1.4. Stateful OOP Resource Class Template
Source: `practice/01-python/16-oop.py`

```python
from typing import Any

class StatefulStore:
    """Generic in-memory key-value resource store with invariant checks."""

    def __init__(self, initial_state: dict[str, Any] | None = None) -> None:
        self._store: dict[str, Any] = dict(initial_state or {})

    def get(self, key: str, default: Any = None) -> Any:
        return self._store.get(key, default)

    def set(self, key: str, value: Any) -> None:
        if not key:
            raise ValueError("Key must be a non-empty string.")
        self._store[key] = value

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(keys={list(self._store.keys())!r})"
```

### 1.5. Async I/O Concurrency (`asyncio.gather` & `create_task`)
Source: `practice/01-python/15-async-await.py`

```python
import asyncio
import time
from typing import Any

async def async_io_task(task_id: str, delay_sec: float) -> dict[str, Any]:
    """Simulate a non-blocking network/API call."""
    await asyncio.sleep(delay_sec)
    return {"task_id": task_id, "status": "ok"}

async def run_concurrent_tasks(tasks_input: list[tuple[str, float]]) -> list[dict[str, Any]]:
    start = time.perf_counter()

    # 1. Execute all coroutines concurrently (total wall time ~ max(delays), not sum)
    coros = [async_io_task(tid, delay) for tid, delay in tasks_input]
    results = await asyncio.gather(*coros)

    # 2. Optional: schedule an independent background task on the event loop
    bg_task = asyncio.create_task(async_io_task("background_job", 0.01))
    await bg_task

    print(f"Completed in {time.perf_counter() - start:.3f}s")
    return list(results)

if __name__ == "__main__":
    asyncio.run(run_concurrent_tasks([("t1", 0.05), ("t2", 0.03), ("t3", 0.01)]))
```

---

## 2. Multi-Provider LLM Clients & LangChain Basics (`practice/02-ai-basics`)

### 2.1. Multi-Provider OpenAI-Compatible Client (`OpenAI`, `Groq`, `Gemini`)
Source: `practice/02-ai-basics/01_chat_openai.py`, `practice/02-ai-basics/02_chat_groq.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

load_dotenv(find_dotenv())

# 1. Generic factory for any OpenAI-compatible provider ("OPENAI", "GROQ", "GEMINI")
def create_llm_client(provider: str = "OPENAI", timeout: float = 15.0) -> tuple[OpenAI, str]:
    prefix = provider.upper()
    default_urls = {
        "OPENAI": "https://api.openai.com/v1",
        "GROQ": "https://api.groq.com/openai/v1",
        "GEMINI": "https://generativelanguage.googleapis.com/v1beta/openai/",
    }
    default_models = {
        "OPENAI": "gpt-4o-mini",
        "GROQ": "llama-3.3-70b-versatile",
        "GEMINI": "gemini-3.6-flash",
    }
    client = OpenAI(
        api_key=os.getenv(f"{prefix}_API_KEY"),
        base_url=os.getenv(f"{prefix}_BASE_URL", default_urls.get(prefix)),
        timeout=timeout,
    )
    model = os.getenv(f"{prefix}_MODEL", default_models.get(prefix, "gpt-4o-mini"))
    return client, model

# 2. Single-turn chat completion call
client, model = create_llm_client("OPENAI")
response = client.chat.completions.create(
    model=model,
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "<user_input>"},
    ],
    temperature=0.0,
)
answer = response.choices[0].message.content
```

### 2.2. LangChain LCEL Pipe Chain (`prompt | model | parser`)
Source: `practice/02-ai-basics/03_langchain_summarizer.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

load_dotenv(find_dotenv())

# 1. Define prompt template with named input variables ({instruction}, {input_text})
prompt = ChatPromptTemplate.from_messages([
    ("system", "{instruction}"),
    ("human", "{input_text}"),
])

# 2. Initialize ChatOpenAI wrapper
model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0.0,
    timeout=20.0,
)

# 3. Compose LCEL chain using the pipe operator (|) and invoke with a dict
chain = prompt | model | StrOutputParser()
output = chain.invoke({
    "instruction": "Summarize the input in one sentence.",
    "input_text": "<raw_text>",
})
```

### 2.3. Stateful Multi-Turn Chat (`MessagesPlaceholder`)
Source: `practice/02-ai-basics/04_langchain_memory_chat.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

load_dotenv(find_dotenv())

model = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    base_url=os.getenv("OPENAI_BASE_URL") or None,
    temperature=0.0,
    timeout=15.0,
)

# 1. Inject dynamic conversation history via MessagesPlaceholder("history")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use the conversation history to stay consistent."),
    MessagesPlaceholder("history"),
    ("human", "{user_input}"),
])
chain = prompt | model

# 2. Maintain explicit (role, content) tuple list across conversation turns
history: list[tuple[str, str]] = []

def run_chat_turn(user_input: str) -> str:
    answer = chain.invoke({"history": history, "user_input": user_input}).content
    history.append(("human", user_input))
    history.append(("ai", answer))
    return answer
```

### 2.4. Raw OpenAI Tool-Calling Loop (No Framework)
Source: `practice/02-ai-basics/05_agent_one_tool.py`

```python
import json
import os
from typing import Any, Callable
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

load_dotenv(find_dotenv())
client = OpenAI(timeout=15.0)
model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# 1. Define pure Python tool function(s) and map by name
def sample_tool(arg1: str) -> str:
    """Execute deterministic lookup or computation for arg1."""
    return json.dumps({"arg1": arg1, "result": "<computed_value>"})

TOOL_REGISTRY: dict[str, Callable[..., Any]] = {
    "sample_tool": lambda args: sample_tool(args["arg1"]),
}

# 2. Define JSON Schema tool specification for the LLM
TOOLS_SCHEMA = [{
    "type": "function",
    "function": {
        "name": "sample_tool",
        "description": "Describe WHEN to invoke this tool and WHAT it returns.",
        "parameters": {
            "type": "object",
            "properties": {
                "arg1": {"type": "string", "description": "Parameter description"},
            },
            "required": ["arg1"],
        },
    },
}]

# 3. Bounded ReAct loop: Think -> Execute Local Tool(s) -> Observe -> Repeat
def run_raw_agent(user_query: str, max_turns: int = 5) -> str:
    messages: list[Any] = [{"role": "user", "content": user_query}]

    for _ in range(max_turns):
        msg = client.chat.completions.create(
            model=model, messages=messages, tools=TOOLS_SCHEMA
        ).choices[0].message

        if not msg.tool_calls:
            return msg.content or ""

        messages.append(msg)
        for call in msg.tool_calls:
            fn_args = json.loads(call.function.arguments or "{}")
            fn = TOOL_REGISTRY.get(call.function.name)
            result = fn(fn_args) if fn else json.dumps({"error": f"Unknown tool: {call.function.name}"})
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": str(result),
            })

    return ""
```

### 2.5. LangChain Multi-Tool Agent with Swappable Provider & Trace
Source: `practice/02-ai-basics/06_langchain_one_tool.py`, `practice/02-ai-basics/07_langchain_multi_tools.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

load_dotenv(find_dotenv())

# 1. Swap provider via environment prefix ("GROQ", "GEMINI", or "OPENAI")
PROVIDER = "groq"
prefix = PROVIDER.upper()
llm = ChatOpenAI(
    model=os.getenv(f"{prefix}_MODEL"),
    api_key=os.getenv(f"{prefix}_API_KEY"),
    base_url=os.getenv(f"{prefix}_BASE_URL") or None,
    temperature=0,
    timeout=20.0,
)

# 2. Define plain Python functions: type hints = parameter schema, docstring = routing condition
def tool_alpha(key: str) -> str:
    """Look up domain information for the given key."""
    return f"Result for {key}"

def tool_beta(x: float, y: float) -> float:
    """Compute a deterministic numeric operation on x and y."""
    return x + y

# 3. Build agent and inspect the full tool call / tool output trace
agent = create_agent(
    model=llm,
    tools=[tool_alpha, tool_beta],
    system_prompt="You are a helpful assistant. Use the available tools when needed.",
)

messages = agent.invoke({"messages": [{"role": "user", "content": "<user_query>"}]})["messages"]
for m in messages:
    for call in getattr(m, "tool_calls", None) or []:
        print(f"call   -> {call['name']}({call['args']})")
    if m.type == "tool":
        print(f"result -> {m.name}: {m.content}")
final_answer = messages[-1].content
```

---

## 3. Document Chunking, Embeddings & Local RAG (`practice/03-ai-rag-chroma`)

### 3.1. Sliding-Window Document Chunking (`RecursiveCharacterTextSplitter`)
Source: `practice/03-ai-rag-chroma/01_chunking.py`

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_document(text: str, chunk_size: int = 300, chunk_overlap: int = 40) -> list[str]:
    """Split text on natural boundaries (paragraphs -> lines -> words) with sliding overlap."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_text(text)
```

### 3.2. Local Sentence Embeddings & Cosine Similarity (`SentenceTransformer`)
Source: `practice/03-ai-rag-chroma/02_embedding.py`

```python
from numpy import dot
from numpy.linalg import norm
from sentence_transformers import SentenceTransformer

# 1. Load local CPU embedding model once (384 dimensions, no API key needed)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def compute_cosine_similarity(text_a: str, text_b: str) -> float:
    """Encode two texts into dense vectors and return cosine similarity (-1.0 to 1.0)."""
    v1 = embedder.encode(text_a)
    v2 = embedder.encode(text_b)
    return float(dot(v1, v2) / (norm(v1) * norm(v2)))
```

### 3.3. End-to-End Local Vector RAG (`HuggingFaceEmbeddings` + `Chroma`)
Source: `practice/03-ai-rag-chroma/03_rag.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv(find_dotenv())

def answer_with_local_rag(source_text: str, question: str, k: int = 3) -> str:
    # 1. Chunk source text
    chunks = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=40).split_text(source_text)

    # 2. Embed chunks locally and index into an ephemeral Chroma vector store
    embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma.from_texts(chunks, embedder)

    # 3. Retrieve top-k most relevant passages
    relevant_chunks = [doc.page_content for doc in db.similarity_search(question, k=min(k, len(chunks)))]
    context = "\n\n".join(relevant_chunks)

    # 4. Generate strictly grounded response at temperature=0
    prompt = ChatPromptTemplate.from_template(
        "Answer the question using ONLY the context below. "
        "If the context does not contain the answer, say you do not know.\n\n"
        "Context:\n{context}\n\nQuestion: {question}"
    )
    model = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        base_url=os.getenv("OPENAI_BASE_URL") or None,
        temperature=0,
    )
    return (prompt | model).invoke({"context": context, "question": question}).content
```

---

## 4. ML Model Training, ChromaDB Server & Redis Memory (`practice/04-ai-model-training-chromadb`)

### 4.1. Scikit-Learn Training, `joblib` Serialization & Pydantic Inference
Source: `practice/04-ai-model-training-chromadb/01_model_training.py`

```python
from pathlib import Path
import joblib
import pandas as pd
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor

MODEL_PATH = Path("/tmp/model.pkl")

# 1. Define typed input schema with Pydantic
class PredictionInput(BaseModel):
    feature_1: float
    feature_2: float
    flag_1: int

# 2. Fit tabular model on feature columns and persist artifact to disk
def train_and_save(df: pd.DataFrame, target_col: str, model_path: Path = MODEL_PATH) -> None:
    X = df.drop(columns=[target_col])
    y = df[target_col]
    model = RandomForestRegressor(n_estimators=100, random_state=42).fit(X, y)
    joblib.dump(model, model_path)

# 3. Load saved artifact and run validated single-row inference
def predict_single(payload: dict, model_path: Path = MODEL_PATH) -> float:
    validated = PredictionInput(**payload)
    model = joblib.load(model_path)
    X_infer = pd.DataFrame([validated.model_dump()])
    return round(float(model.predict(X_infer)[0]), 4)
```

### 4.2. ChromaDB HTTP/Ephemeral Client & Document Folder Ingestion
Source: `practice/04-ai-model-training-chromadb/02_chromadb.py`

```python
import os
import time
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions

CHROMA_HOST = os.getenv("CHROMA_HOST", "")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

# 1. Connect to Chroma server over HTTP with startup retry, or fall back to in-memory EphemeralClient
def connect_to_chroma(retries: int = 20, delay: int = 2):
    if CHROMA_HOST:
        for _ in range(retries):
            try:
                client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
                client.heartbeat()
                return client
            except Exception:
                time.sleep(delay)
        raise RuntimeError(f"Could not reach Chroma at {CHROMA_HOST}:{CHROMA_PORT}")
    return chromadb.EphemeralClient()

# 2. Create or load collection with OpenAI embeddings and upsert documents idempotently
def ingest_directory(docs_dir: Path, collection_name: str = "knowledge_base"):
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY"),
        model_name="text-embedding-3-small",
    )
    collection = connect_to_chroma().get_or_create_collection(
        name=collection_name, embedding_function=openai_ef
    )

    ids, documents, metadatas = [], [], []
    for path in sorted(list(docs_dir.glob("*.md")) + list(docs_dir.glob("*.txt"))):
        text = path.read_text(encoding="utf-8").strip()
        chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 40]
        for i, chunk in enumerate(chunks):
            ids.append(f"{path.name}::{i}")
            documents.append(chunk)
            metadatas.append({"source": path.name})

    if ids:
        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    return collection

# 3. Query top-k chunks from the collection
def retrieve_context(collection, query: str, n_results: int = 3) -> str:
    hits = collection.query(query_texts=[query], n_results=n_results)
    docs = (hits.get("documents") or [[]])[0]
    return "\n\n---\n\n".join(docs)
```

### 4.3. Stateful Tool-Calling Agent with Redis Session Memory
Source: `practice/04-ai-model-training-chromadb/03_redis.py`

```python
import json
import os
from typing import Any, Callable
import redis
from openai import OpenAI

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# 1. Connect to Redis with automatic in-memory fallback when running without a Redis container
def get_memory_store():
    try:
        client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        return client, True
    except Exception:
        return {}, False

memory_store, using_redis = get_memory_store()

def load_history(session_id: str) -> list[dict[str, Any]]:
    key = f"history:{session_id}"
    if using_redis:
        return [json.loads(m) for m in memory_store.lrange(key, 0, -1)]
    return list(memory_store.get(key, []))

def save_history(session_id: str, history: list[dict[str, Any]], ttl_seconds: int = 3600) -> None:
    key = f"history:{session_id}"
    if using_redis:
        memory_store.delete(key)
        for m in history:
            memory_store.rpush(key, json.dumps(m))
        memory_store.expire(key, ttl_seconds)
    else:
        memory_store[key] = list(history)

# 2. Multi-turn session chat with bounded tool-calling loop (max 5 iterations)
def chat_with_session_memory(
    llm: OpenAI,
    model: str,
    session_id: str,
    user_message: str,
    tool_defs: list[dict[str, Any]],
    dispatch_tool_fn: Callable[[str, dict[str, Any]], Any],
    max_laps: int = 5,
) -> str:
    history = load_history(session_id)
    history.append({"role": "user", "content": user_message})

    msg = None
    for _ in range(max_laps):
        resp = llm.chat.completions.create(model=model, messages=history, tools=tool_defs)
        msg = resp.choices[0].message
        if not msg.tool_calls:
            break

        history.append(msg.model_dump(exclude_none=True))
        for tc in msg.tool_calls:
            result = dispatch_tool_fn(tc.function.name, json.loads(tc.function.arguments or "{}"))
            history.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result),
            })

    answer = (msg.content if msg else "") or ""
    history.append({"role": "assistant", "content": answer})
    save_history(session_id, history)
    return answer
```

---

## 5. AWS Bedrock, Strands Agents & LangGraph (`practice/05-ai-aws-strands`)

### 5.1. Minimal AWS Strands Agent on Amazon Bedrock (`BedrockModel`)
Source: `practice/05-ai-aws-strands/01_hello_world_agent.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from strands import Agent
from strands.models.bedrock import BedrockModel

load_dotenv(find_dotenv())

# Uses AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION from environment
model_id = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
agent = Agent(
    model=BedrockModel(model_id=model_id),
    system_prompt="You are a helpful assistant.",
)

response = agent("<user_prompt>")
print(response)
```

### 5.2. LangGraph Prebuilt ReAct Agent (`init_chat_model` + `create_react_agent`)
Source: `practice/05-ai-aws-strands/02_hello_world_langgraph.py`

```python
import os
from dotenv import find_dotenv, load_dotenv
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import create_react_agent

load_dotenv(find_dotenv())

@tool
def execute_action(target: str) -> str:
    """Describe when the agent should invoke execute_action."""
    return f"Processed {target}"

# 1. Initialize chat model via provider ("bedrock_converse", "openai", etc.)
llm = init_chat_model(
    os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0"),
    model_provider="bedrock_converse",
)

# 2. Build prebuilt LangGraph ReAct agent and iterate over message trace
agent = create_react_agent(model=llm, tools=[execute_action])
response = agent.invoke({"messages": [{"role": "user", "content": "<user_prompt>"}]})
for message in response["messages"]:
    print(f"{message.type}: {message.text}")
```

### 5.3. Function-to-Tool Pattern (`@tool` + Type Hints + Docstring)
Source: `practice/05-ai-aws-strands/03_function_to_tool.py`, `practice/05-ai-aws-strands/04_tip_calculator.py`

```python
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# Every reliable tool requires 3 parts:
# 1. @tool decorator -> registers the function in the agent's tool catalog
# 2. Type hints      -> defines the input/output JSON schema types for the LLM
# 3. Docstring       -> instructs the LLM on WHEN and HOW to call the function
@tool
def custom_domain_tool(required_param: str, numeric_param: float, optional_param: int = 1) -> dict:
    """Explain clearly what this tool does and when the model should invoke it.

    Args:
        required_param: Description of the string identifier or query
        numeric_param: Description of the numeric value
        optional_param: Description of optional parameter with default (default: 1)
    """
    computed = round(numeric_param / max(optional_param, 1), 2)
    return {"id": required_param, "result": computed}

agent = Agent(
    model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
    tools=[custom_domain_tool],
)
```

### 5.4. Pre-Built Community Tools & Unattended Consent (`strands_tools`)
Source: `practice/05-ai-aws-strands/07_prebuilt_tools.py`, `practice/05-ai-aws-strands/08_multi_prebuilt_tools.py`, `practice/05-ai-aws-strands/09_use_aws.py`

```python
import os
from strands import Agent
from strands.models.bedrock import BedrockModel
from strands_tools import calculator, file_write, http_request, use_aws

# 1. Disable interactive confirmation prompts for write/cloud tools in automated pipelines
os.environ["BYPASS_TOOL_CONSENT"] = os.getenv("BYPASS_TOOL_CONSENT", "true")

# 2. Combine pre-built HTTP, SymPy math, file I/O, or AWS CLI tools
agent = Agent(
    model=BedrockModel(model_id=os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")),
    tools=[http_request, calculator, file_write, use_aws],
    system_prompt="Use the provided tools to fetch data, compute results, and persist outputs.",
)
```

### 5.5. Class-Based Shared-Resource Tools
Source: `practice/05-ai-aws-strands/10_class_based_tools.py`

```python
from typing import Any
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

class ResourceTools:
    """Group related tools in a class to share a single DB connection pool or state store."""

    def __init__(self, initial_records: dict[str, Any] | None = None) -> None:
        self.records: dict[str, Any] = dict(initial_records or {})

    @tool
    def read_record(self, record_id: str) -> str:
        """Read a record by its unique identifier."""
        if record_id not in self.records:
            return f"Record {record_id} not found"
        return str(self.records[record_id])

    @tool
    def write_record(self, record_id: str, value: Any) -> str:
        """Create or update a record in the shared store."""
        self.records[record_id] = value
        return f"Updated {record_id}"

# Instantiate once and bind its methods to the agent so state persists across tool calls
resources = ResourceTools({"rec_1": {"status": "active"}})
agent = Agent(
    model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
    tools=[resources.read_record, resources.write_record],
)
```

### 5.6. Async Parallel Tool Execution (`async def` + `invoke_async`)
Source: `practice/05-ai-aws-strands/11_async_tools.py`

```python
import asyncio
from strands import Agent, tool
from strands.models.bedrock import BedrockModel

# 1. Define I/O-bound tool with `async def` so multiple invocations run in parallel
@tool
async def fetch_partition_data(item_id: str, partition: str) -> dict:
    """Fetch data for item_id from a specific partition concurrently."""
    await asyncio.sleep(1.0)  # Non-blocking async I/O call
    return {"partition": partition, "item_id": item_id, "value": 42}

# 2. Invoke the agent via `await agent.invoke_async(prompt)`
async def run_async_agent(prompt: str) -> str:
    agent = Agent(
        model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
        tools=[fetch_partition_data],
    )
    response = await agent.invoke_async(prompt)
    return str(response)
```

---

## 6. AI Systems: Prompting, Sycophancy & Multi-Judge Bench (`practice/06-ai-systems`)

### 6.1. Prompting Strategies (Direct vs. Zero-Shot CoT vs. Few-Shot CoT) & Answer Extraction
Source: `practice/06-ai-systems/01_prompting_strategies.py`

```python
import re

# 1. Reusable prompt wrappers for comparing Direct vs. Chain-of-Thought reasoning
PROMPT_STRATEGIES = {
    "Direct": lambda q: f"{q}\nAnswer in one short sentence. State only the final answer.",
    "Zero-Shot CoT": lambda q: (
        f"{q}\nThink step by step, then state your final answer on the last line as 'Answer: <value>'."
    ),
    "Few-Shot CoT": lambda q, examples="": (
        f"{examples}\nQuestion: {q}\n"
        "Think step by step, then state your final answer on the last line as 'Answer: <value>'."
    ),
}

# 2. Execute completion and capture token usage (prompt_tokens, completion_tokens)
def call_with_token_usage(client, model: str, prompt: str, temperature: float = 0.0) -> tuple[str, int, int]:
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
        )
        return (
            resp.choices[0].message.content or "",
            resp.usage.prompt_tokens,
            resp.usage.completion_tokens,
        )
    except Exception as exc:
        return f"Error: {exc}", 0, 0

# 3. Extract the final answer after the last 'Answer:' delimiter (ignoring intermediate reasoning numbers)
def extract_final_answer(response_text: str) -> str:
    text = response_text.strip()
    matches = list(re.finditer(r"answer\s*:", text, flags=re.IGNORECASE))
    if matches:
        segment = text[matches[-1].end():]
    else:
        lines = [ln for ln in text.splitlines() if ln.strip()]
        segment = lines[-1] if lines else ""
    first_line = segment.strip().splitlines()[0] if segment.strip() else ""
    return first_line.replace("*", "").replace("`", "").strip().lower()
```

### 6.2. Multi-Turn Adversarial Pushback Runner & Forced `VERDICT:` Scorer
Source: `practice/06-ai-systems/02_sycophancy_trap.py`

```python
import re
from typing import Callable

VERDICT_SUFFIX = "\n\nEnd your reply with a single line, exactly: VERDICT: {options}"

# 1. Run a baseline question followed by N rounds of adversarial pushback in the same conversation
def run_multi_turn_pushback(
    chat_fn: Callable[[list[dict[str, str]]], str],
    question: str,
    pushbacks: list[str],
    verdict_options: str | None = None,
) -> list[str]:
    suffix = VERDICT_SUFFIX.format(options=verdict_options) if verdict_options else ""
    messages: list[dict[str, str]] = [{"role": "user", "content": question + suffix}]
    responses: list[str] = []

    r0 = chat_fn(messages)
    responses.append(r0)
    messages.append({"role": "assistant", "content": r0})

    for pb in pushbacks:
        messages.append({"role": "user", "content": pb + suffix})
        reply = chat_fn(messages)
        responses.append(reply)
        messages.append({"role": "assistant", "content": reply})

    return responses

# 2. Score whether the model held its ground ("resists") or caved ("capitulates")
def score_verdict_token(
    response_text: str,
    expected_token: str,
    capitulation_tokens: list[str],
) -> str:
    matches = re.findall(
        r"^\s*VERDICT\s*:\s*([A-Za-z0-9_ -]+)",
        response_text,
        flags=re.MULTILINE | re.IGNORECASE,
    )
    target = matches[-1].strip().lower() if matches else response_text.lower()
    for bad in capitulation_tokens:
        if re.search(r"\b" + re.escape(bad.lower()) + r"\b", target):
            return "capitulates"
    if re.search(r"\b" + re.escape(expected_token.lower()) + r"\b", target):
        return "resists"
    return "unclear"
```

### 6.3. Multi-Judge Parallel Voting Bench & Deterministic Threshold Gate
Source: `practice/06-ai-systems/03_refund_bench.py`

```python
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
import json
import re
from typing import Any, Callable

# 1. Resilient JSON parser (strips optional ```json fences or leading prose)
def extract_json(text: str) -> Any:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        start_idx = min((text.find(c) for c in "[{" if text.find(c) != -1), default=-1)
        if start_idx != -1:
            try:
                return json.loads(text[start_idx:])
            except Exception:
                pass
        return None

# 2. Parallel Multi-Judge Voting across independent model seats
ALLOWED_RULINGS = ("UPHELD", "REJECTED", "ESCALATE")

def run_parallel_judge_bench(
    items: list[dict[str, Any]],
    evidence: dict[str, Any],
    judges: list[dict[str, Any]],
    judge_item_fn: Callable[[dict[str, Any], dict[str, Any], dict[str, Any]], dict[str, Any]],
    max_workers: int = 8,
) -> list[dict[str, Any]]:
    pairs = [(item, judge) for item in items for judge in judges]
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        all_rulings = list(pool.map(lambda p: judge_item_fn(p[0], evidence, p[1]), pairs))

    aggregated = []
    for idx, item in enumerate(items):
        seat_rulings = all_rulings[idx * len(judges) : (idx + 1) * len(judges)]
        ballots = [
            r.get("ruling") if r.get("ruling") in ALLOWED_RULINGS else "ESCALATE"
            for r in seat_rulings
        ]
        majority_ruling, majority_count = Counter(ballots).most_common(1)[0]
        avg_conf = sum(float(r.get("confidence", 0.5)) for r in seat_rulings) / len(seat_rulings)

        aggregated.append({
            "item_id": item.get("id"),
            "verdict": majority_ruling,
            "vote_count": majority_count,
            "total_judges": len(judges),
            "confidence": round((majority_count / len(judges)) * avg_conf, 2),
            "individual_rulings": seat_rulings,
        })
    return aggregated

# 3. Deterministic approval cap gate (keep financial/threshold limits in pure Python, never in LLM)
def apply_approval_cap(approved_value: float, held_value: float, cap_limit: float) -> dict[str, Any]:
    cap_exceeded = approved_value > cap_limit
    if cap_exceeded:
        held_value += approved_value
        approved_value = 0.0
    return {
        "approved_value": approved_value,
        "held_value": held_value,
        "cap_limit": cap_limit,
        "cap_exceeded": cap_exceeded,
    }
```

---

## 7. AI Reliability: Determinism, Schema Calibration & Error Injection (`practice/07-ai-reliability`)

### 7.1. Multi-Run Stochastic Accuracy Evaluator
Source: `practice/07-ai-reliability/01_cot_vs_direct.py`

```python
import time
from typing import Callable

def evaluate_strategy_over_n_runs(
    ask_fn: Callable[[str], str],
    prompt: str,
    accepted_answers: list[str],
    runs: int = 5,
    tail_lines: int = 1,
) -> dict[str, float | int]:
    """Run the same prompt N times to measure stochastic accuracy and mean latency."""
    successes = 0
    latencies: list[float] = []

    for _ in range(runs):
        t0 = time.time()
        resp = ask_fn(prompt)
        latencies.append(time.time() - t0)

        lines = [ln.strip() for ln in resp.splitlines() if ln.strip()]
        tail = " ".join(lines[-tail_lines:]).lower() if lines else ""
        if not resp.startswith("Error:") and any(a.lower() in tail for a in accepted_answers):
            successes += 1

    return {
        "runs": runs,
        "successes": successes,
        "accuracy_pct": round((successes / runs) * 100, 1) if runs else 0.0,
        "avg_latency_sec": round(sum(latencies) / len(latencies), 2) if latencies else 0.0,
    }
```

### 7.2. Enforced JSON Schema (`response_format`) & Exponential Backoff Retry
Source: `practice/07-ai-reliability/02_variance_determinism.py`

```python
import json
import time
from typing import Any

# 1. Define strict JSON Schema (must set additionalProperties: False when strict: True)
EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "label": {"type": "string", "enum": ["ClassA", "ClassB", "Unknown"]},
        "attributes": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["label", "attributes"],
    "additionalProperties": False,
}

response_format_config = {
    "type": "json_schema",
    "json_schema": {
        "name": "structured_extraction",
        "strict": True,
        "schema": EXTRACTION_SCHEMA,
    },
}

# 2. Call LLM with schema enforcement and exponential backoff on transient errors (429/500/503)
def call_structured_llm(
    client,
    prompt: str,
    schema_format: dict[str, Any] = response_format_config,
    model: str = "gpt-4o-mini",
    max_retries: int = 4,
) -> dict[str, Any]:
    last_err = ""
    for attempt in range(max_retries):
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format=schema_format,
                temperature=0.0,
            )
            return json.loads(resp.choices[0].message.content)
        except Exception as exc:
            last_err = str(exc)
            if any(fatal in last_err for fatal in ("insufficient_quota", "invalid_api_key", "401", "404")):
                break
            if any(transient in last_err for transient in ("429", "500", "503")):
                time.sleep(2**attempt * 2)
                continue
            break
    raise RuntimeError(f"LLM call failed after {max_retries} attempts: {last_err}")
```

### 7.3. Forced Tool Routing Benchmark (`tool_choice="required"`)
Source: `practice/07-ai-reliability/03_tool_schema_calibration.py`

```python
from typing import Any

# Pair descriptive function names with boundary-explicit descriptions ("Use ONLY when...")
def build_tool_schema(name: str, description: str, param_name: str, param_desc: str) -> dict[str, Any]:
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": {param_name: {"type": "string", "description": param_desc}},
                "required": [param_name],
            },
        },
    }

# Force tool selection via tool_choice="required" to benchmark routing accuracy
def select_routed_tool(client, model: str, query: str, tools: list[dict[str, Any]]) -> str | None:
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": query}],
        tools=tools,
        tool_choice="required",
        temperature=0.0,
    )
    calls = resp.choices[0].message.tool_calls
    return calls[0].function.name if calls else None
```

### 7.4. Structured Tool Error Payload & Anti-Hallucination System Prompt
Source: `practice/07-ai-reliability/04_tool_error_injection.py`

```python
from typing import Any, Callable

# 1. System prompt guardrail preventing hallucination when an upstream tool fails
ERROR_TRANSPARENT_SYSTEM_PROMPT = (
    "You are a reliable assistant. "
    "If any tool returns an 'error' field, you MUST report the error code and details "
    "explicitly to the user. Never guess, fabricate, or extrapolate missing data."
)

# 2. Wrap external tool calls so exceptions become structured error dicts for the LLM
def call_tool_with_error_envelope(fn: Callable[..., Any], **kwargs: Any) -> dict[str, Any]:
    try:
        return {"status": "ok", "data": fn(**kwargs)}
    except TimeoutError as exc:
        return {"error": "SERVICE_UNAVAILABLE", "http_status": 503, "detail": str(exc)}
    except Exception as exc:
        return {"error": "TOOL_EXECUTION_ERROR", "http_status": 500, "detail": str(exc)}
```

---

## 8. Model Context Protocol (MCP) & Agent Evals (`practice/08-ai-mcp-evals`)

### 8.1. FastMCP Tool Server over `stdio` (`FastMCP` & `@mcp.tool`)
Source: `practice/08-ai-mcp-evals/cricket_server.py`

```python
import sys
from typing import Any
from pydantic import Field
from mcp.server.fastmcp import FastMCP

# 1. Initialize FastMCP server
mcp = FastMCP("Domain-Tool-Server")

MOCK_DB: dict[str, dict[str, Any]] = {
    "key_1": {"status": "active", "metric": 100},
}

# 2. Register tools with @mcp.tool and Pydantic Field descriptions
#    IMPORTANT: Write all logs to sys.stderr (stdout is reserved for MCP JSON-RPC messages)
@mcp.tool(description="Retrieve live status and metrics for a given entity key.")
def lookup_entity(
    entity_key: str = Field(description="Unique entity identifier, e.g. 'key_1'"),
) -> dict[str, Any]:
    print(f"[mcp-server] lookup_entity({entity_key!r})", file=sys.stderr)
    key = entity_key.strip().lower()
    if key not in MOCK_DB:
        return {"error": f"No record found for '{entity_key}'."}
    return MOCK_DB[key]

# 3. Run MCP server over standard input/output transport
if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### 8.2. Direct MCP Client Protocol Plumbing (No LLM)
Source: `practice/08-ai-mcp-evals/01_mcp_client.py`

```python
import asyncio
import sys
from pathlib import Path
from typing import Any
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

def get_stdio_server_params(script_name: str = "server.py") -> StdioServerParameters:
    script_path = str(Path(__file__).with_name(script_name))
    return StdioServerParameters(command=sys.executable, args=[script_path])

async def call_mcp_tool_directly(
    server_params: StdioServerParameters,
    tool_name: str,
    tool_args: dict[str, Any],
) -> str:
    # 1. Spawn MCP server subprocess and open stdio read/write streams
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 2. Initialize MCP protocol handshake
            await session.initialize()

            # 3. Optional: list available tools and schemas
            tools = (await session.list_tools()).tools

            # 4. Invoke target tool directly with structured arguments
            result = await session.call_tool(tool_name, tool_args)
            return result.content[0].text if result.content else ""
```

### 8.3. MCP-Enabled LLM Agent (`to_openai_format` Bridge + Agent Loop)
Source: `practice/08-ai-mcp-evals/02_mcp_agent.py`

```python
import json
from typing import Any
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI

# 1. Convert MCP tool descriptors into OpenAI function-calling schema format
def to_openai_format(mcp_tools: list[Any]) -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description or "",
                "parameters": t.inputSchema,
            },
        }
        for t in mcp_tools
    ]

# 2. Connect to MCP server, expose tools to LLM, and run bounded agent loop
async def run_mcp_agent(
    llm: OpenAI,
    model: str,
    server_params: StdioServerParameters,
    question: str,
    max_turns: int = 5,
) -> dict[str, Any]:
    trace: list[dict[str, Any]] = []
    messages: list[dict[str, Any]] = [
        {"role": "system", "content": "Use ONLY the provided functions to retrieve data. Be concise."},
        {"role": "user", "content": question},
    ]

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = to_openai_format((await session.list_tools()).tools)

            for _ in range(max_turns):
                reply = llm.chat.completions.create(
                    model=model, messages=messages, tools=tools, temperature=0
                ).choices[0].message

                if not reply.tool_calls:
                    return {"answer": reply.content or "", "trace": trace}

                messages.append({
                    "role": "assistant",
                    "content": reply.content or "",
                    "tool_calls": [
                        {
                            "id": c.id,
                            "type": "function",
                            "function": {"name": c.function.name, "arguments": c.function.arguments},
                        }
                        for c in reply.tool_calls
                    ],
                })
                for call in reply.tool_calls:
                    args = json.loads(call.function.arguments or "{}")
                    trace.append({"tool": call.function.name, "args": args})
                    result = await session.call_tool(call.function.name, args)
                    text = result.content[0].text if result.content else "(empty)"
                    messages.append({"role": "tool", "tool_call_id": call.id, "content": text})

    return {"answer": "(stopped: max turns reached)", "trace": trace}
```

### 8.4. Automated Agent Evaluation Suite (Routing + Fact Assertions)
Source: `practice/08-ai-mcp-evals/03_mcp_evals.py`

```python
from typing import Any, Awaitable, Callable

# 1. Generic test case structure: user query, expected tool (or None), and required answer substrings
EVAL_CASES = [
    {"q": "<domain_query_1>", "expected_tool": "lookup_entity", "must_contain": ["100"]},
    {"q": "What is 2 + 2?",   "expected_tool": None,            "must_contain": ["4"]},
]

# 2. Run evaluation asserting both trajectory (tool choice) and outcome (ground-truth facts)
async def run_eval_suite(
    agent_fn: Callable[[str], Awaitable[dict[str, Any]]],
    test_cases: list[dict[str, Any]],
) -> dict[str, Any]:
    passed = 0
    for case in test_cases:
        result = await agent_fn(case["q"])
        tools_used = [step["tool"] for step in result.get("trace", [])]
        answer = (result.get("answer") or "").lower()

        expected_tool = case["expected_tool"]
        tool_ok = (expected_tool in tools_used) if expected_tool else (tools_used == [])
        facts_ok = all(str(token).lower() in answer for token in case["must_contain"])

        if tool_ok and facts_ok:
            passed += 1

    total = len(test_cases)
    return {"passed": passed, "total": total, "score_pct": round((passed / total) * 100, 1) if total else 0.0}
```

---

## 9. Docker & Compose Templates for AI Projects (`practice/*/Dockerfile`)

### 9.1. Layer-Cached Python 3.12 `Dockerfile`
Source: `practice/04-ai-model-training-chromadb/Dockerfile`

```dockerfile
# 1. Base image: official lightweight Python 3.12
FROM python:3.12-slim

# 2. Flush stdout immediately and prevent .pyc bytecode files
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# 3. Copy requirements.txt BEFORE source code so Docker caches the pip install layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy application scripts
COPY *.py .
```

### 9.2. Multi-Service `docker-compose.yml` (App + ChromaDB + Redis)
Source: `practice/04-ai-model-training-chromadb/docker-compose.yml`

```yaml
services:
  app:
    build: .
    env_file:
      - path: ./.env
        required: false
    environment:
      - CHROMA_HOST=chroma
      - CHROMA_PORT=8000
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - chroma
      - redis
    volumes:
      - ./:/app

  chroma:
    image: chromadb/chroma:0.6.3
    volumes:
      - chroma_data:/chroma/chroma
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - agent_memory:/data
    restart: unless-stopped

volumes:
  chroma_data:
  agent_memory:
```

---

## 10. Quick Revision Cheatsheet

### 10.1. Practice Module-to-Pattern Quick Map
1. **`01-python` (Python Core):**
   1. Add explicit type hints (`str`, `int`, `list[str] | None`) to all functions—agent decorators inspect them to generate JSON schemas.
   2. Use `asyncio.gather(*coros)` to execute multiple I/O-bound calls concurrently in `max(delays)` time instead of `sum(delays)`.
2. **`02-ai-basics` (LLMs, LCEL & Agents):**
   1. Direct SDK call: `client.chat.completions.create(model=..., messages=[...])`.
   2. LangChain LCEL pipe: `chain = prompt | model | StrOutputParser()` invoked via `chain.invoke({"key": val})`.
   3. Multi-turn chat: insert `MessagesPlaceholder("history")` into `ChatPromptTemplate.from_messages(...)` and append `("human", q)` + `("ai", a)` after each turn.
   4. Raw tool loop: Model returns `msg.tool_calls` $\rightarrow$ append `msg` to `messages` $\rightarrow$ run local Python function $\rightarrow$ append `{"role": "tool", "tool_call_id": call.id, "content": result}` $\rightarrow$ call LLM again.
3. **`03-ai-rag-chroma` (Chunking, Embeddings & Local RAG):**
   1. Chunking: `RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=40).split_text(text)` splits on paragraphs/lines/spaces while preserving boundary context.
   2. Local CPU Embeddings: `SentenceTransformer("all-MiniLM-L6-v2")` encodes text into 384-dim vectors locally without an API key.
   3. Cosine Similarity: `dot(v1, v2) / (norm(v1) * norm(v2))` (ranges from `-1.0` to `1.0`).
4. **`04-ai-model-training-chromadb` (ML, Chroma Server & Redis):**
   1. Tabular ML: Fit `RandomForestRegressor`, save with `joblib.dump(model, path)`, validate inputs via `pydantic.BaseModel`, and infer with `model.predict(pd.DataFrame([validated.model_dump()]))`.
   2. ChromaDB Server vs. Local: Use `chromadb.HttpClient(host, port)` with a `client.heartbeat()` retry loop in Docker Compose, falling back to `chromadb.EphemeralClient()` locally.
   3. Redis Session Memory: Persist JSON messages per session via `r.rpush(f"history:{session_id}", json.dumps(msg))` and read via `r.lrange(key, 0, -1)`.
5. **`05-ai-aws-strands` (AWS Bedrock, Strands & LangGraph):**
   1. Strands Agent: `Agent(model=BedrockModel(model_id="amazon.nova-lite-v1:0"), tools=[...], system_prompt=...)`.
   2. LangGraph ReAct Agent: `create_react_agent(model=init_chat_model(model_id, model_provider="bedrock_converse"), tools=[...])`.
   3. Shared-Resource Tools: Group `@tool` methods inside a class (`ResourceTools`) so they share a single connection pool or state dict (`self.records`).
   4. Parallel Async Tools: Define `@tool async def my_tool(...)` and invoke via `await agent.invoke_async(prompt)`.
   5. Unattended Consent: Set `os.environ["BYPASS_TOOL_CONSENT"] = "true"` when running write or cloud tools (`file_write`, `use_aws`) in automated pipelines.
6. **`06-ai-systems` (Prompting, Sycophancy & Multi-Judge Pipelines):**
   1. Prompting Trade-off: Zero-Shot and Few-Shot Chain-of-Thought (`"Think step by step..."`) increase multi-step accuracy at the cost of extra completion tokens and latency.
   2. Adversarial Pushback Resilience: Models can capitulate under user pressure; append a strict `VERDICT: <options>` instruction and test across multiple pushback turns.
   3. Multi-Judge Voting Pipeline: Separate **Atomic Claim Extraction** (LLM) $\rightarrow$ **Parallel Multi-Provider Adjudication** (`ThreadPoolExecutor` voting `UPHELD` / `REJECTED` / `ESCALATE`) $\rightarrow$ **Deterministic Pricing & Cap Gate** (Pure Python).
7. **`07-ai-reliability` (Determinism, Schemas & Error Injection):**
   1. Structured Outputs: Pass `response_format={"type": "json_schema", "json_schema": {"name": "...", "strict": True, "schema": SCHEMA}}` with `"additionalProperties": False` for 100% valid JSON.
   2. Tool Routing Calibration: Pair **descriptive function names** with **tight, boundary-explicit docstrings** (`"Use ONLY when..."`).
   3. Tool Error Transparency: Catch tool exceptions into structured dicts (`{"error": "SERVICE_UNAVAILABLE", "http_status": 503}`) and instruct the system prompt to report error codes explicitly without guessing.
8. **`08-ai-mcp-evals` (Model Context Protocol & Evals):**
   1. FastMCP Server: Decorate tools with `@mcp.tool(description=...)`, annotate args with `Field(description=...)`, log **only to `sys.stderr`**, and run via `mcp.run(transport="stdio")`.
   2. MCP Client Flow: `async with stdio_client(server) as (read, write):` $\rightarrow$ `async with ClientSession(read, write) as session:` $\rightarrow$ `await session.initialize()` $\rightarrow$ `await session.list_tools()` $\rightarrow$ `await session.call_tool(name, args)`.
   3. Two-Part Agent Evals: Assert both **tool routing** (`expected_tool in tools_used` or `tools_used == []`) and **ground-truth facts** (`all(token in answer for token in must_contain)`).

### 10.2. LLM Provider & Framework Selection Rules
1. **OpenAI (`gpt-4o-mini`):** Default choice for strict `json_schema` structured outputs, LCEL chains, and grounded RAG synthesis (`base_url="https://api.openai.com/v1"`).
2. **Groq (`llama-3.3-70b-versatile` / `openai/gpt-oss-20b`):** Best for low-latency ReAct tool loops and MCP agents (`base_url="https://api.groq.com/openai/v1"`).
3. **Google Gemini (`gemini-3.6-flash`):** Ideal as an independent cross-provider seat in a multi-judge voting panel (`base_url="https://generativelanguage.googleapis.com/v1beta/openai/"`).
4. **Amazon Bedrock (`amazon.nova-lite-v1:0`):** Default for AWS IAM-authenticated workloads using `strands-agents` or `langchain-aws` (`bedrock_converse`).

### 10.3. Tool-Calling & Agent Architecture Golden Rules
1. **LLM vs. Python Split:** Use LLMs only for unstructured text (extract, classify, route, draft); keep all math, scoring, thresholds, and caps in pure Python functions.
2. **3 Mandatory Ingredients of Any Tool:**
   1. Decorator (`@tool` or `@mcp.tool()`).
   2. Explicit Python type hints (`item_id: str, count: int = 1 -> dict`).
   3. Specific docstring stating **what** the tool returns and **when** (and when *not*) to invoke it.
3. **Bounded Agent Loops:** Always cap custom tool loops (`for _ in range(5):`) so a confused model cannot call tools forever.
4. **Single-Purpose Tools:** Create small, focused tools that compose together rather than one monolithic function.

### 10.4. RAG, Embeddings & Memory Checklist
1. **Chunking Defaults:** Start with `chunk_size=300` and `chunk_overlap=40` (`~15%` overlap) using `RecursiveCharacterTextSplitter`.
2. **Strict Grounding Prompt:** Always instruct the RAG model: *"Answer using ONLY the context below. If the context does not contain the answer, say you do not know."* and set `temperature=0`.
3. **Idempotent Vector Upserts:** Use deterministic chunk IDs (`f"{filename}::{chunk_idx}"`) with `collection.upsert(...)` to prevent duplicate entries on re-runs.
4. **Session Isolation:** Namespace Redis conversation keys by `f"history:{session_id}"` and set a TTL (`r.expire(key, 3600)`).

### 10.5. Reliability, Guardrails & Evaluation Checklist
1. **Enforce Schemas via API:** Use `response_format={"type": "json_schema", ...}` with `strict: True` and `additionalProperties: False` instead of relying on prompt instructions alone.
2. **3-Way Evidence Rulings:** In adjudication prompts, require one of `UPHELD` (supported by evidence), `REJECTED` (contradicted by evidence), or `ESCALATE` (evidence is missing/ambiguous).
3. **Targeted Retries:** Retry transient `429`, `500`, and `503` errors with exponential backoff (`time.sleep(2**attempt * 2)`), and fail fast on `401`, `404`, or quota errors.
4. **Dual Evaluation Assertions:** Every automated agent test case should verify both **trajectory** (was the right tool called?) and **outcome** (does the final answer contain the required facts?).

### 10.6. Essential One-Liners & CLI Commands
1. **Load nearest `.env` file automatically:**
   `from dotenv import find_dotenv, load_dotenv; load_dotenv(find_dotenv())`
2. **Run any service in Docker Compose (loads `.env` & mounts code):**
   `docker compose run --rm <service_name>`
3. **Rebuild Docker image after changing `requirements.txt`:**
   `docker compose run --rm --build <service_name>`
4. **Stop background ChromaDB / Redis containers and wipe volumes:**
   `docker compose down -v`
5. **Log inside an MCP `stdio` server without corrupting JSON-RPC stdout:**
   `print("[mcp-server] debug message", file=sys.stderr)`
