# AI Project Quick-Start Plan, Decision Guide & Reusable Snippets

A concise, generic reference to go from any problem statement to AI architecture selection and well-commented, copy-pasteable code templates with sample inputs for every technology in our stack.

---

## 1. Step-by-Step Plan to Build Any AI Project

1. **Step 1 — Split the Problem into LLM vs. Deterministic Code:**
   1. **LLM Tasks:** Unstructured text understanding, classification, entity extraction, tool selection, and response drafting.
   2. **Deterministic Code Tasks:** All math, scoring, regex validation, sorting, and rule thresholds (never let an LLM do math or enforce hard limits).
2. **Step 2 — Pick the Simplest Architecture That Solves It (Escalation Ladder):**
   1. **Level 0 (Pure Code):** Exact rules, regex, or math $\rightarrow$ no AI needed ([Snippet 4.3](#43-level-0-pure-deterministic-python-rule--regex)).
   2. **Level 1 (Classical ML):** Tabular numbers $\rightarrow$ `pandas` + `scikit-learn` + `joblib` ([Snippet 4.4](#44-level-1-classical-ml-pandas--scikit-learn--joblib)).
   3. **Level 2 (Single LLM Call):** Summarize, classify, or extract JSON in one call ([Snippet 4.5](#45-level-2-single-llm-call--structured-json-output)).
   4. **Level 3 (Fixed Hybrid Pipeline):** Fixed step sequence: `LLM Step 1` $\rightarrow$ `Python Rule` $\rightarrow$ `LLM Step 2` ([Snippet 4.6](#46-level-3-fixed-hybrid-pipeline-langchain-lcel--python-rule)).
   5. **Level 4 (Embeddings & RAG):** Semantic similarity or grounded Q&A using `SentenceTransformer` and `ChromaDB` ([Snippets 4.7 & 4.8](#47-level-4a-local-embeddings--cosine-similarity-sentencetransformer--numpy)).
   6. **Level 5 (Single ReAct Agent):** LLM dynamically picks which tools to call in a loop using Raw SDK, `LangGraph`, or `AWS Strands` ([Snippets 4.9, 4.10 & 4.11](#49-level-5a-raw-openai--groq-tool-calling-react-agent)).
   7. **Level 6 (Memory, Multi-Agent, Multi-Judge & MCP):** Stateful `Redis` memory, multi-agent hand-offs, parallel multi-model voting, or `FastMCP` tool servers ([Snippets 4.12–4.15](#412-level-6a-conversation-memory-with-redis--langchain-messagesplaceholder)).
3. **Step 3 — Select the Tech Stack (Model, Framework, Storage):**
   1. Choose the model provider, orchestration SDK, and memory/vector store using Section 2.
4. **Step 4 — Add Production Guardrails & Fallbacks:**
   1. Validate inputs and outputs with `Pydantic` schemas ([Snippet 4.2](#42-shared-setup-pydantic-data-validation-schemas)).
   2. Cap agent loops (`MAX_ROUNDS = 5`) to prevent infinite tool calls.
   3. Enforce structured outputs (`response_format={"type": "json_object"}` or allowlist normalizers) with safe fallback values.
   4. Run independent LLM calls concurrently via `ThreadPoolExecutor` to reduce latency.
   5. Add retry logic for transient tool-call errors (`tool_use_failed`) and an in-memory fallback when external services (like Redis or API keys) are unavailable.
5. **Step 5 — Evaluate with Golden Test Cases:**
   1. Unit-test deterministic functions with `unittest` or `pytest`.
   2. Evaluate AI pipelines on golden test cases, asserting both **tool routing** (expected tool was called) and **ground-truth tokens** in the final output ([Snippet 4.16](#416-automated-ai-evaluation-harness-tool-routing--ground-truth-assertions)).

---

## 2. Quick Decision Guide: Which AI Tech to Use When

### 2.1. By Problem Signal
1. **Exact rules, regex, or formula calculation** $\rightarrow$ **Level 0:** Pure Python function + `re`.
2. **Numeric prediction or classification on tabular data** $\rightarrow$ **Level 1:** `pandas` + `scikit-learn` (`RandomForestRegressor` / `RandomForestClassifier`) + `joblib`.
3. **Single-turn text generation, classification, or JSON extraction** $\rightarrow$ **Level 2:** Direct `OpenAI` / `Groq` / `Bedrock` SDK + `response_format={"type": "json_object"}`.
4. **Fixed multi-step workflow combining prompts and code rules** $\rightarrow$ **Level 3:** LangChain LCEL (`ChatPromptTemplate | ChatOpenAI | StrOutputParser | RunnableLambda`).
5. **Pairwise text similarity or semantic clustering on CPU** $\rightarrow$ **Level 4A:** `SentenceTransformer("all-MiniLM-L6-v2")` + `numpy` cosine similarity.
6. **Document Q&A with citations** $\rightarrow$ **Level 4B:** `RecursiveCharacterTextSplitter` + `OpenAIEmbeddings` (or `HuggingFaceEmbeddings`) + `ChromaDB`.
7. **Open-ended queries requiring dynamic tool calls** $\rightarrow$ **Level 5:** Raw `OpenAI` tool loop, `LangGraph` (`StateGraph` / `create_react_agent`), or AWS `strands-agents` (`@tool`).
8. **Multi-turn chat history across user sessions** $\rightarrow$ **Level 6A:** `Redis` (`rpush` / `lrange` / `expire` with Python `dict` fallback) + `MessagesPlaceholder`.
9. **Multi-role workflows or high-stakes cross-model consensus** $\rightarrow$ **Level 6B:** Sequential Agent Hand-off or Parallel Multi-Judge Voting (`ThreadPoolExecutor`).
10. **Decoupled tools exposed as a standalone process** $\rightarrow$ **Level 6C:** `FastMCP` server (`@mcp.tool()`) + `ClientSession` over `stdio`.

### 2.2. Model, Framework & Storage Quick Chooser
1. **Model Provider:**
   1. **OpenAI (`gpt-4o-mini`):** Default for instruction following, strict JSON mode, and LCEL chains.
   2. **Groq (`openai/gpt-oss-20b` / Llama 3):** Best for ultra-fast multi-turn ReAct tool loops.
   3. **Amazon Bedrock (`amazon.nova-lite-v1:0`):** Best for AWS workloads using `boto3` IAM roles and `strands-agents`.
   4. **Google Gemini (`gemini-3.8-flash`):** Best as an independent model in multi-judge voting panels.
2. **Orchestration Framework:**
   1. **Raw `openai` / `boto3` SDK:** Zero-dependency control over `messages`, `tools`, and `response_format`.
   2. **LangChain LCEL (`prompt | llm | parser`):** Declarative prompt chaining and output parsing.
   3. **LangGraph (`langgraph`):** Stateful cyclic graphs, explicit `StateGraph` nodes, and conditional routing.
   4. **AWS Strands (`strands-agents`):** Decorator-based (`@tool`) sync/async/class tools on Bedrock.
   5. **FastMCP (`mcp`):** Standardized client-server protocol for decoupled tool discovery and execution.
3. **Memory & Storage:**
   1. **Stateless:** Single-turn calls and one-shot extraction.
   2. **In-Memory List / OOP Class:** Single-process session tracking.
   3. **Redis (`redis`):** Distributed multi-user persistent session history keyed by `session_id` with TTL expiration.
   4. **ChromaDB (`chromadb`):** Ephemeral (in-memory) or persistent (disk/server) vector database for semantic retrieval.

---

## 3. 4 Solution Alternatives for Any Problem Statement

1. **Alternative A: Deterministic Pipeline + Constrained LLM Chains (Level 3 — Default)**
   1. **Flow:** `Input` $\rightarrow$ `LLM Classifier/Extractor` $\rightarrow$ `Python Rule/Math` $\rightarrow$ `LLM Formatter`.
   2. **Pros:** Fast (1–2 LLM calls), predictable, 100% accurate math/rules, no infinite loops.
   3. **Cons:** Fixed step sequence; cannot dynamically invent new tool call sequences.
   4. **Use When:** The task follows a known step-by-step workflow.
2. **Alternative B: Single ReAct Tool-Calling Agent (Level 5)**
   1. **Flow:** `Input` $\rightarrow$ `Agent Loop (LLM picks tools -> Python runs tool -> feed result back)` $\rightarrow$ `Final Answer`.
   2. **Pros:** Flexible; dynamically chooses which tools to run based on user input.
   3. **Cons:** Higher latency (2–5 LLM calls per turn).
   4. **Use When:** Tool selection and order depend on the user's question at runtime.
3. **Alternative C: Grounded Vector RAG + Classical ML (Level 4 + Level 1)**
   1. **Flow:** `Input` $\rightarrow$ `(Optional: sklearn .pkl prediction)` $\rightarrow$ `ChromaDB Similarity Search` $\rightarrow$ `Grounded LLM Answer`.
   2. **Pros:** Grounds answers in external documents; prevents hallucinations.
   3. **Cons:** Requires document chunking and embedding indexing.
   4. **Use When:** Answers must be cited from documentation, manuals, or knowledge bases.
4. **Alternative D: Multi-Judge / Multi-Agent Ensemble + MCP (Level 6)**
   1. **Flow:** `Input` $\rightarrow$ `Task Extractor` $\rightarrow$ `Parallel Multi-Model Judges / Specialist Agents + MCP Tools` $\rightarrow$ `Aggregated Output`.
   2. **Pros:** Highest accuracy, cross-model consensus, and decoupled tool architecture.
   3. **Cons:** Highest token usage (mitigated for latency via `ThreadPoolExecutor`).
   4. **Use When:** High-stakes decisions, LLM-as-a-Judge evaluation, or multi-role systems.

---

## 4. Reusable AI & Infrastructure Code Snippets (with Comments & Sample Inputs)

### 4.1. Shared Setup: Multi-Provider LLM Clients (`OpenAI`, `Groq`, `Gemini`, `AWS Bedrock`)
How to initialize OpenAI-compatible clients (`openai`, `groq`, `gemini`) and AWS Bedrock (`boto3`).

```python
import os
import boto3
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file (OPENAI_API_KEY, GROQ_API_KEY, etc.)
load_dotenv()


def get_openai_compatible_client(provider: str = "openai") -> tuple[OpenAI, str]:
    """Return an (OpenAI SDK client, model_name) tuple for OpenAI, Groq, or Gemini."""
    if provider == "groq":
        # Groq uses the standard OpenAI SDK pointed at Groq's base_url
        return (
            OpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"),
            "openai/gpt-oss-20b",
        )
    if provider == "gemini":
        # Gemini supports an OpenAI-compatible endpoint for drop-in use
        return (
            OpenAI(
                api_key=os.getenv("GEMINI_API_KEY"),
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
            ),
            "gemini-3.8-flash",
        )
    # Default: standard OpenAI client
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY")), "gpt-4o-mini"


def call_bedrock_converse(prompt: str, model_id: str = "amazon.nova-lite-v1:0") -> str:
    """Direct AWS Bedrock Converse API call using boto3 (uses IAM role or AWS env vars)."""
    bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
    response = bedrock.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
        inferenceConfig={"maxTokens": 512, "temperature": 0.2},
    )
    return response["output"]["message"]["content"][0]["text"]


# --- Sample Input & Usage ---
# client, model = get_openai_compatible_client(provider="openai")
# text = call_bedrock_converse("Explain vector embeddings in one sentence.")
```

---

### 4.2. Shared Setup: `Pydantic` Data Validation Schemas
Use `Pydantic` (`BaseModel`, `Field`) to validate incoming API payloads and structure outgoing AI responses.

```python
from typing import List, Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Validates incoming user request parameters with defaults and bounds."""
    query: str = Field(..., min_length=1, description="User input text")
    temperature: float = Field(default=0.2, ge=0.0, le=1.5)
    max_results: int = Field(default=3, ge=1, le=10)


class QueryResponse(BaseModel):
    """Enforces a strict schema on the returned AI payload."""
    answer: str
    confidence: float
    sources: List[str] = []
    error: Optional[str] = None


# --- Sample Input & Usage ---
req = QueryRequest(query="How does RAG work?", temperature=0.1)
resp = QueryResponse(answer="RAG retrieves docs before generating.", confidence=0.95, sources=["doc_1.md"])
print(resp.model_dump_json())  # Serializes to validated JSON string
```

---

### 4.3. Level 0: Pure Deterministic Python Rule & Regex
Keep exact math, keyword matching (`re`), and threshold checks in pure Python functions.

```python
import re


def check_text_and_limit(text: str, amount: float, max_limit: float = 100.0) -> dict:
    """Deterministic helper: find alert keywords via regex and check a numeric cap."""
    # 1. Word-boundary regex match (case-insensitive)
    matched_keywords = re.findall(r"\b(urgent|error|fail)\b", text.lower())

    # 2. Exact numeric threshold rule
    exceeds_limit = amount > max_limit

    return {
        "matched_keywords": matched_keywords,
        "exceeds_limit": exceeds_limit,
        "requires_review": bool(matched_keywords) or exceeds_limit,
    }


# --- Sample Input & Usage ---
sample_result = check_text_and_limit(text="System error on order", amount=150.0, max_limit=100.0)
# Output: {'matched_keywords': ['error'], 'exceeds_limit': True, 'requires_review': True}
```

---

### 4.4. Level 1: Classical ML (`pandas` + `scikit-learn` + `joblib`)
Use `pandas` DataFrames, `scikit-learn` estimators, and `joblib` serialization for fast numeric/tabular predictions.

```python
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

FEATURE_COLS = ["feature_a", "feature_b"]
MODEL_FILE = "/tmp/rf_model.pkl"

# 1. Prepare tabular training data in a pandas DataFrame
train_df = pd.DataFrame({
    "feature_a": [1.0, 2.0, 3.0, 4.0, 5.0],
    "feature_b": [10.0, 20.0, 30.0, 40.0, 50.0],
    "target":    [15.0, 30.0, 45.0, 60.0, 75.0],
})

# 2. Fit RandomForestRegressor and save artifact to disk with joblib
rf_model = RandomForestRegressor(n_estimators=50, random_state=42)
rf_model.fit(train_df[FEATURE_COLS], train_df["target"])
joblib.dump(rf_model, MODEL_FILE)

# 3. Load saved .pkl model and predict on new sample input
loaded_model = joblib.load(MODEL_FILE)

# --- Sample Input & Usage ---
sample_input_df = pd.DataFrame([{"feature_a": 2.5, "feature_b": 25.0}])[FEATURE_COLS]
prediction = float(loaded_model.predict(sample_input_df)[0])
# Output: ~37.5
```

---

### 4.5. Level 2: Single LLM Call & Structured JSON Output
Direct chat completion with system persona and schema-enforced JSON output (`response_format={"type": "json_object"}`).

```python
import json


def run_single_llm_and_json(client, model: str, user_text: str) -> dict:
    # 1. Standard text completion with a system persona
    text_resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a concise assistant. Reply in one sentence."},
            {"role": "user", "content": f"Summarize: {user_text}"},
        ],
        temperature=0.2,
    )
    summary = text_resp.choices[0].message.content

    # 2. Enforced JSON mode (guarantees valid JSON string output)
    # Note: The prompt MUST contain the word 'JSON' when using json_object mode.
    json_resp = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "Extract JSON with keys: 'sentiment' ('positive'|'negative') and 'score' (0-1).",
            },
            {"role": "user", "content": user_text},
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
    )
    extracted = json.loads(json_resp.choices[0].message.content)
    return {"summary": summary, "extracted": extracted}


# --- Sample Input & Usage ---
# result = run_single_llm_and_json(client, "gpt-4o-mini", "The new release is super fast and stable!")
# Output: {'summary': '...', 'extracted': {'sentiment': 'positive', 'score': 0.95}}
```

---

### 4.6. Level 3: Fixed Hybrid Pipeline (LangChain LCEL + Python Rule)
Combine declarative LangChain Expression Language (`Prompt | LLM | Parser | RunnableLambda`) with pure Python logic.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 1. Define allowlist normalizer so downstream Python code only sees valid labels
ALLOWED_LABELS = ("low", "high", "unknown")
normalize_label = RunnableLambda(
    lambda raw: raw.strip().lower() if raw.strip().lower() in ALLOWED_LABELS else "unknown"
)

# 2. LCEL Classification Chain: Prompt -> LLM -> String Parser -> Normalizer
classify_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Classify urgency into ONE word: low, high, or unknown."),
        ("human", "{text}"),
    ])
    | llm
    | StrOutputParser()
    | normalize_label
)

# 3. LCEL Drafting Chain
draft_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "Write a 1-sentence response for urgency={urgency} and action={action}."),
        ("human", "{text}"),
    ])
    | llm
    | StrOutputParser()
)


def run_hybrid_pipeline(text: str) -> dict:
    # Step A: LLM classifies unstructured text
    urgency = classify_chain.invoke({"text": text})
    # Step B: Deterministic Python rule decides action
    action = "escalate_to_human" if urgency in ("high", "unknown") else "auto_acknowledge"
    # Step C: LLM drafts final message grounded in Python's decision
    reply = draft_chain.invoke({"urgency": urgency, "action": action, "text": text})
    return {"urgency": urgency, "action": action, "reply": reply}


# --- Sample Input & Usage ---
# output = run_hybrid_pipeline("Production database is down for all users!")
# Output: {'urgency': 'high', 'action': 'escalate_to_human', 'reply': '...'}
```

---

### 4.7. Level 4A: Local Embeddings & Cosine Similarity (`SentenceTransformer` + `numpy`)
Encode text into dense vectors locally on CPU (zero API cost) and compute semantic similarity with `numpy`.

```python
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Load lightweight 384-dimensional local embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """Encode two strings into vectors and return their cosine similarity (-1.0 to 1.0)."""
    # normalize_embeddings=True makes dot product equal to cosine similarity
    vecs = embedder.encode([text_a, text_b], normalize_embeddings=True)
    similarity = float(np.dot(vecs[0], vecs[1]))
    return round(similarity, 4)


# --- Sample Input & Usage ---
score = compute_semantic_similarity("How do I reset my password?", "Forgot my login credentials")
# Output: ~0.68 (high semantic similarity despite zero shared words)
```

---

### 4.8. Level 4B: Vector Database RAG (`ChromaDB` Native Client & LangChain Wrapper)
How to use `ChromaDB` both directly (`chromadb.EphemeralClient` / `PersistentClient`) and via LangChain (`RecursiveCharacterTextSplitter` + `Chroma`).

```python
import chromadb
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Part 1: Direct Native ChromaDB Client (Ephemeral or Persistent) ---
# Use PersistentClient(path="./chroma_data") to save on disk, or HttpClient(host="localhost", port=8000)
chroma_client = chromadb.EphemeralClient()
collection = chroma_client.get_or_create_collection(name="knowledge_base")

# Add documents with metadata and unique IDs
collection.add(
    ids=["doc1", "doc2"],
    documents=["Refunds take 3 to 5 business days.", "Premium support is available 24/7."],
    metadatas=[{"topic": "billing"}, {"topic": "support"}],
)

# Query collection for top-1 match (with optional metadata filter where={"topic": "billing"})
native_results = collection.query(query_texts=["When will I get my money back?"], n_results=1)
top_doc = native_results["documents"][0][0]


# --- Part 2: Full LangChain RAG Pipeline (Chunk -> Embed -> Retrieve -> Answer) ---
def ask_rag(raw_texts: list[str], question: str) -> dict:
    # 1. Split long texts into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=30)
    docs = splitter.create_documents(raw_texts)

    # 2. Embed & index in Chroma (swap with HuggingFaceEmbeddings("all-MiniLM-L6-v2") for free local use)
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    )

    # 3. Retrieve top-k most relevant chunks
    retrieved = vectorstore.similarity_search(question, k=2)
    context = "\n\n".join(d.page_content for d in retrieved)

    # 4. Grounded LLM call
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = f"Answer strictly using this context:\n{context}\n\nQuestion: {question}"
    return {"answer": llm.invoke(prompt).content, "sources": [d.page_content for d in retrieved]}


# --- Sample Input & Usage ---
# res = ask_rag(["Policy: Users can cancel within 14 days for a full refund."], "What is the cancellation window?")
# Output: {'answer': 'Users can cancel within 14 days for a full refund.', 'sources': ['...']}
```

---

### 4.9. Level 5A: Raw OpenAI / Groq Tool-Calling ReAct Agent
Full control over the ReAct loop (`messages` $\rightarrow$ `tool_calls` $\rightarrow$ execute Python function $\rightarrow$ `role: "tool"`), including retry on transient `tool_use_failed` errors.

```python
import json
from openai import BadRequestError

# 1. Define JSON Schema menu of tools for the LLM
TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "add_numbers",
            "description": "Add two numbers a and b and return the exact sum.",
            "parameters": {
                "type": "object",
                "properties": {"a": {"type": "number"}, "b": {"type": "number"}},
                "required": ["a", "b"],
            },
        },
    }
]

# 2. Map tool names to actual Python functions
TOOL_FUNCTIONS = {"add_numbers": lambda args: {"sum": args["a"] + args["b"]}}


def run_raw_react_agent(client, model: str, user_query: str) -> tuple[str, list]:
    messages = [
        {"role": "system", "content": "Use tools for any math. Never guess numbers."},
        {"role": "user", "content": user_query},
    ]
    tool_trace = []

    # 3. Bounded ReAct loop (capped at 5 rounds)
    for _ in range(5):
        # Retry wrapper for occasional malformed tool call glitches
        for attempt in range(3):
            try:
                resp = client.chat.completions.create(
                    model=model, messages=messages, tools=TOOLS_SCHEMA, tool_choice="auto"
                )
                break
            except BadRequestError as exc:
                if getattr(exc, "code", None) != "tool_use_failed" or attempt == 2:
                    raise

        msg = resp.choices[0].message
        # If the LLM didn't request a tool call, we have the final answer
        if not msg.tool_calls:
            return msg.content or "", tool_trace

        # 4. Execute each requested tool and append result with role="tool"
        messages.append(msg)
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments or "{}")
            result = TOOL_FUNCTIONS[call.function.name](args)
            tool_trace.append({"tool": call.function.name, "args": args, "result": result})
            messages.append({
                "role": "tool",
                "tool_call_id": call.id,
                "content": json.dumps(result),
            })

    return "Max rounds reached", tool_trace


# --- Sample Input & Usage ---
# answer, trace = run_raw_react_agent(client, "gpt-4o-mini", "What is 145.5 plus 89.25?")
# Output: answer="234.75", trace=[{'tool': 'add_numbers', 'args': {'a': 145.5, 'b': 89.25}, 'result': {'sum': 234.75}}]
```

---

### 4.10. Level 5B: `LangGraph` Stateful Agent (`create_react_agent` & Custom `StateGraph`)
How to use `LangGraph` both with the one-line prebuilt ReAct agent and with an explicit custom `StateGraph` (nodes, edges, and conditional routing).

```python
from typing import Literal
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, create_react_agent


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two integers a and b."""
    return a * b


llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# --- Option 1: One-Line Prebuilt LangGraph ReAct Agent ---
prebuilt_agent = create_react_agent(llm, tools=[multiply])

# --- Option 2: Custom StateGraph with Explicit Nodes & Conditional Edges ---
llm_with_tools = llm.bind_tools([multiply])


def call_model_node(state: MessagesState):
    """Graph Node 1: Call the LLM with current message history."""
    return {"messages": [llm_with_tools.invoke(state["messages"])]}


def should_continue(state: MessagesState) -> Literal["tools", "__end__"]:
    """Conditional Edge: Route to 'tools' node if LLM made tool_calls, else END."""
    last_message = state["messages"][-1]
    return "tools" if last_message.tool_calls else END


builder = StateGraph(MessagesState)
builder.add_node("agent", call_model_node)
builder.add_node("tools", ToolNode([multiply]))
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", should_continue)
builder.add_edge("tools", "agent")  # Loop back from tools to agent
custom_graph = builder.compile()

# --- Sample Input & Usage ---
# res = custom_graph.invoke({"messages": [("user", "What is 12 multiplied by 9?")]})
# print(res["messages"][-1].content)  # Output: "12 multiplied by 9 is 108."
```

---

### 4.11. Level 5C: AWS Strands Agent (`@tool`, Stateful Class Tool & Async Tool)
Build agents on Amazon Bedrock using `strands-agents` with function tools, stateful OOP class tools, and async tools.

```python
from strands import Agent, tool
from strands.models.bedrock import BedrockModel
from strands_tools import calculator  # Prebuilt tool from strands-agents-tools


# 1. Function-based tool (docstring and type hints auto-generate the schema)
@tool
def get_weather(city: str) -> dict:
    """Get weather forecast for a city."""
    return {"city": city, "temp_c": 26, "condition": "sunny"}


# 2. Class-based stateful tool (maintains state across multiple tool calls)
class CartManager:
    def __init__(self):
        self.items: list[str] = []

    @tool
    def add_to_cart(self, item: str) -> str:
        """Add an item to the user's shopping cart."""
        self.items.append(item)
        return f"Cart now has: {self.items}"


# 3. Initialize BedrockModel and Agent
cart = CartManager()
agent = Agent(
    model=BedrockModel(model_id="amazon.nova-lite-v1:0"),
    tools=[get_weather, cart.add_to_cart, calculator],
    system_prompt="Use the provided tools to answer the user's request.",
)

# --- Sample Input & Usage ---
# response = agent("Check the weather in Goa, add 'sunscreen' to my cart, and compute 250 * 4.")
# print(str(response))
```

---

### 4.12. Level 6A: Conversation Memory with `Redis` & LangChain `MessagesPlaceholder`
How to properly connect to `Redis` (`ping`, `rpush`, `lrange`, `expire` TTL, `delete`) with an automatic in-memory fallback when Redis is offline, and inject history into an LLM prompt.

```python
import json
import os
import redis
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

# 1. Connect to Redis with a short socket timeout and verify via ping()
_MEMORY_FALLBACK: dict[str, list[dict]] = {}


def get_redis_client() -> redis.Redis | None:
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", "6379"))
    try:
        client = redis.Redis(host=host, port=port, decode_responses=True, socket_connect_timeout=1)
        client.ping()  # Verify server is reachable
        return client
    except Exception:
        return None  # Fall back to in-memory dictionary if Redis is unreachable


def append_message(session_id: str, role: str, content: str, ttl_seconds: int = 3600) -> None:
    """Append a message turn to Redis list 'session:<id>' and set a 1-hour expiration TTL."""
    r = get_redis_client()
    entry = {"role": role, "content": content}
    if r:
        key = f"session:{session_id}"
        r.rpush(key, json.dumps(entry))  # Push JSON string to end of Redis list
        r.expire(key, ttl_seconds)       # Auto-expire idle sessions
    else:
        _MEMORY_FALLBACK.setdefault(session_id, []).append(entry)


def get_history(session_id: str) -> list[dict]:
    """Fetch all turns for a session_id from Redis (or fallback dict)."""
    r = get_redis_client()
    if r:
        raw_items = r.lrange(f"session:{session_id}", 0, -1)
        return [json.loads(item) for item in raw_items]
    return list(_MEMORY_FALLBACK.get(session_id, []))


def clear_session(session_id: str) -> None:
    """Delete session history from Redis and fallback dict."""
    r = get_redis_client()
    if r:
        r.delete(f"session:{session_id}")
    _MEMORY_FALLBACK.pop(session_id, None)


# 2. Wire saved history into LangChain MessagesPlaceholder
chat_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant with memory."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{user_input}"),
    ])
    | ChatOpenAI(model="gpt-4o-mini", temperature=0)
)


def chat_with_memory(session_id: str, user_input: str) -> str:
    # Convert stored dicts into LangChain HumanMessage / AIMessage objects
    past_turns = get_history(session_id)
    lc_history = [
        HumanMessage(content=t["content"]) if t["role"] == "user" else AIMessage(content=t["content"])
        for t in past_turns
    ]
    reply = chat_chain.invoke({"history": lc_history, "user_input": user_input}).content
    # Persist both user turn and assistant reply
    append_message(session_id, "user", user_input)
    append_message(session_id, "assistant", reply)
    return reply


# --- Sample Input & Usage ---
# turn1 = chat_with_memory(session_id="user_101", user_input="My favorite language is Python.")
# turn2 = chat_with_memory(session_id="user_101", user_input="What is my favorite language?")
# Output: "Your favorite language is Python."
# clear_session("user_101")
```

---

### 4.13. Level 6B: Multi-Agent Sequential Hand-off (Planner $\rightarrow$ Specialist)
Pass structured state from Agent 1 (Planner/Interviewer) to Agent 2 (Executor/Evaluator).

```python
def run_two_agent_handoff(client, model: str, user_goal: str) -> dict:
    # Agent 1 (Planner): Breaks the user goal into a concrete sub-task
    plan_resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are the Planner Agent. Output ONE specific task to solve the goal."},
            {"role": "user", "content": user_goal},
        ],
    )
    assigned_task = plan_resp.choices[0].message.content

    # Agent 2 (Specialist): Receives Agent 1's output and executes it
    exec_resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are the Specialist Agent. Complete the assigned task concisely."},
            {"role": "user", "content": f"Assigned task from Planner:\n{assigned_task}"},
        ],
    )
    return {"plan": assigned_task, "execution": exec_resp.choices[0].message.content}


# --- Sample Input & Usage ---
# result = run_two_agent_handoff(client, "gpt-4o-mini", "Launch a product announcement email")
# Output: {'plan': 'Draft a 3-line launch email...', 'execution': 'Subject: Introducing...'}
```

---

### 4.14. Level 6C: Parallel Multi-Judge Voting Bench (`ThreadPoolExecutor`)
Fan out an evaluation across multiple independent LLM judges in parallel and compute the majority verdict.

```python
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

VALID_VERDICTS = ("UPHELD", "REJECTED", "ESCALATE")


def _poll_judge(judge_callable, claim: str, evidence: str) -> str:
    """Ask a single judge model to rule UPHELD, REJECTED, or ESCALATE based strictly on evidence."""
    prompt = (
        f"Claim: {claim}\nEvidence: {evidence}\n"
        "Reply with ONLY one word: UPHELD, REJECTED, or ESCALATE."
    )
    try:
        ruling = judge_callable(prompt).strip().upper()
        return ruling if ruling in VALID_VERDICTS else "ESCALATE"
    except Exception:
        return "ESCALATE"  # Safe fallback if a provider times out


def run_parallel_judges(claim: str, evidence: str, judge_callables: list) -> dict:
    """Run all judges concurrently via ThreadPoolExecutor and tally the majority vote."""
    with ThreadPoolExecutor(max_workers=8) as pool:
        ballots = list(pool.map(lambda fn: _poll_judge(fn, claim, evidence), judge_callables))

    winner, votes = Counter(ballots).most_common(1)[0]
    return {
        "ballots": ballots,
        "majority_verdict": winner,
        "agreement_ratio": round(votes / len(judge_callables), 2),
    }


# --- Sample Input & Usage ---
# mock_judges = [lambda p: "UPHELD", lambda p: "UPHELD", lambda p: "ESCALATE"]
# res = run_parallel_judges("Order arrived 40 mins late", "SLA: 45m, Actual: 85m", mock_judges)
# Output: {'ballots': ['UPHELD', 'UPHELD', 'ESCALATE'], 'majority_verdict': 'UPHELD', 'agreement_ratio': 0.67}
```

---

### 4.15. Level 6D: Model Context Protocol (`FastMCP` Server & `stdio` Client)
Expose tools in an isolated `FastMCP` server subprocess and discover/invoke them dynamically over `stdio`.

```python
# --- File 1: mcp_server.py ---
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("demo-tools")


@mcp.tool()
def lookup_price(item: str) -> str:
    """Return the price of an item from the catalog."""
    prices = {"keyboard": "$75", "monitor": "$250"}
    return prices.get(item.lower(), "Unknown item")


if __name__ == "__main__":
    mcp.run()  # Listens over stdio for MCP protocol messages
```

```python
# --- File 2: mcp_client.py ---
import asyncio
import json
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_mcp_agent(client, model: str, server_script: str, user_question: str) -> str:
    # 1. Configure subprocess parameters to launch mcp_server.py over stdio
    server_params = StdioServerParameters(command=sys.executable, args=[server_script])
    messages = [{"role": "user", "content": user_question}]

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 2. Perform MCP handshake and dynamically discover available tools
            await session.initialize()
            mcp_tools = (await session.list_tools()).tools

            # 3. Convert MCP tool schemas into OpenAI function-calling format
            openai_tools = [
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

            # 4. Run standard tool-calling loop, delegating execution to session.call_tool()
            for _ in range(5):
                resp = client.chat.completions.create(model=model, messages=messages, tools=openai_tools)
                msg = resp.choices[0].message
                if not msg.tool_calls:
                    return msg.content or ""

                messages.append(msg)
                for call in msg.tool_calls:
                    args = json.loads(call.function.arguments or "{}")
                    mcp_result = await session.call_tool(call.function.name, args)
                    tool_text = mcp_result.content[0].text if mcp_result.content else ""
                    messages.append({"role": "tool", "tool_call_id": call.id, "content": tool_text})
    return ""


# --- Sample Input & Usage ---
# answer = asyncio.run(run_mcp_agent(client, "gpt-4o-mini", "mcp_server.py", "How much is a keyboard?"))
# Output: "A keyboard costs $75."
```

---

### 4.16. Automated AI Evaluation Harness (Tool-Routing & Ground-Truth Assertions)
Test any agent or pipeline against golden test cases by checking both **which tool was called** and **whether expected facts appear in the answer**.

```python
GOLDEN_EVAL_CASES = [
    {
        "question": "What is 145.5 plus 89.25?",
        "expected_tool": "add_numbers",
        "expected_tokens": ["234.75"],
    },
]


def run_eval_suite(agent_fn, cases: list[dict]) -> dict:
    """Run golden test cases and score both tool selection and answer accuracy."""
    report = []
    for case in cases:
        answer, trace = agent_fn(case["question"])
        called_tools = [step["tool"] for step in trace]

        # Assertion 1: Did the agent call the right tool?
        tool_ok = case["expected_tool"] in called_tools
        # Assertion 2: Are all ground-truth tokens present in the final answer?
        answer_ok = all(tok.lower() in answer.lower() for tok in case["expected_tokens"])

        report.append({
            "question": case["question"],
            "passed": tool_ok and answer_ok,
            "tool_ok": tool_ok,
            "answer_ok": answer_ok,
        })

    passed_count = sum(1 for r in report if r["passed"])
    return {"total": len(report), "passed": passed_count, "details": report}


# --- Sample Input & Usage ---
# mock_agent = lambda q: ("The sum is 234.75.", [{"tool": "add_numbers"}])
# eval_results = run_eval_suite(mock_agent, GOLDEN_EVAL_CASES)
# Output: {'total': 1, 'passed': 1, 'details': [{'question': '...', 'passed': True, 'tool_ok': True, 'answer_ok': True}]}
```

---

### 4.16. Automated AI Evaluation Harness (Tool-Routing & Ground-Truth Assertions)
Test any agent or pipeline against golden test cases by checking both **which tool was called** and **whether expected facts appear in the answer**.

```python
GOLDEN_EVAL_CASES = [
    {
        "question": "What is 145.5 plus 89.25?",
        "expected_tool": "add_numbers",
        "expected_tokens": ["234.75"],
    },
]


def run_eval_suite(agent_fn, cases: list[dict]) -> dict:
    """Run golden test cases and score both tool selection and answer accuracy."""
    report = []
    for case in cases:
        answer, trace = agent_fn(case["question"])
        called_tools = [step["tool"] for step in trace]

        # Assertion 1: Did the agent call the right tool?
        tool_ok = case["expected_tool"] in called_tools
        # Assertion 2: Are all ground-truth tokens present in the final answer?
        answer_ok = all(tok.lower() in answer.lower() for tok in case["expected_tokens"])

        report.append({
            "question": case["question"],
            "passed": tool_ok and answer_ok,
            "tool_ok": tool_ok,
            "answer_ok": answer_ok,
        })

    passed_count = sum(1 for r in report if r["passed"])
    return {"total": len(report), "passed": passed_count, "details": report}


# --- Sample Input & Usage ---
# mock_agent = lambda q: ("The sum is 234.75.", [{"tool": "add_numbers"}])
# eval_results = run_eval_suite(mock_agent, GOLDEN_EVAL_CASES)
# Output: {'total': 1, 'passed': 1, 'details': [{'question': '...', 'passed': True, 'tool_ok': True, 'answer_ok': True}]}
```

