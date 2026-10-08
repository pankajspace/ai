<!--
Source: fde-advanced-course.html
Title: FDE Advanced Course | TechToday
Description: The advanced technical stack of a forward deployed AI engineer: transformer internals, context economics, structured output, vector and graph retrieval, multimodal RAG, LangGraph, multi-agent systems, MCP, fine-tuning, quantisation, legacy integration, text-to-SQL, entitlements, guardrails, gateways, LLMOps and cost.
Theme-color: #0b0d10
Stylesheets: fde-study.css, ../../site-header.css
Scripts: fde-study.js
-->

Navigation: [TechToday](../../index.html) · [← FDE Courses](fde-courses.html)

<a id="fde-advanced-course"></a>

# FDE Advanced

The other FDE courses teach the job: the engagement, the discovery, the politics, the handover. This one teaches the machinery you have to be fluent in to do that job inside a real customer estate — how the model actually decodes, where a context window goes, how retrieval is built and graded, how agents are orchestrated durably, what fine-tuning buys and what it costs, and how any of it survives an enterprise security review. Forty-one sections, each one assuming only the ones before it. Press **Play** on any animation.

<a id="table-of-contents"></a>

## Table of Contents

1. [What This Course Assumes](#1-what-this-course-assumes)
2. [Transformer Internals You Actually Use](#2-transformer-internals)
3. [Reasoning Models and When They Pay](#3-reasoning-models)
4. [Tokens, Context and the Economics of a Prompt](#4-context-economics)
5. [Prompting Patterns That Survive Production](#5-prompt-architecture)
6. [Structured Output and Validation](#6-structured-output)
7. [Tool Calling at Production Scale](#7-tool-calling)
8. [Systematic Prompt Optimisation](#8-prompt-optimisation)
9. [Async Python and Throughput](#9-async-and-throughput)
10. [Chunking](#10-chunking)
11. [Embeddings, Metrics and Dimensionality](#11-embeddings)
12. [Vector Indexes and Vector Databases](#12-vector-indexes)
13. [Hybrid Search and Rank Fusion](#13-hybrid-search)
14. [Reranking](#14-reranking)
15. [Query Transformation and Self-Correcting RAG](#15-advanced-rag)
16. [RAG Evaluation and Synthetic Sets](#16-rag-evaluation)
17. [Knowledge Graphs and GraphRAG](#17-knowledge-graphs)
18. [Multimodal RAG and Document AI](#18-multimodal-rag)
19. [Agent Architectures](#19-agent-architectures)
20. [LangGraph in Depth](#20-langgraph)
21. [Multi-Agent Orchestration](#21-multi-agent)
22. [Agent Memory](#22-agent-memory)
23. [Model Context Protocol](#23-mcp)
24. [Fine-Tuning: LoRA, QLoRA and Preference Optimisation](#24-fine-tuning)
25. [Quantisation, Local Inference and Model Placement](#25-quantisation-and-placement)
26. [Legacy Integration: SOAP, ODBC and Systems of Record](#26-legacy-integration)
27. [Text-to-SQL Inside an Enterprise Schema](#27-text-to-sql)
28. [Identity, Entitlements and Permission-Aware Retrieval](#28-identity-and-entitlements)
29. [Production AI Security and Guardrails](#29-ai-security)
30. [The LLM Gateway](#30-llm-gateway)
31. [Observability, Tracing and LLMOps](#31-observability-and-llmops)
32. [Serving: FastAPI, Containers, CI/CD and Cloud](#32-serving-and-infrastructure)
33. [Cost Modelling and Capacity Planning](#33-cost-and-capacity)
34. [Two Reference Architectures](#34-reference-architectures)
35. [The Framework Landscape](#35-framework-landscape)
36. [The Ground You Deploy Onto: Cloud, Network, Linux](#36-cloud-network-linux)
37. [Model Foundations You Must Be Able to Explain](#37-model-foundations)
38. [AI-Assisted Development with Agentic IDEs](#38-agentic-ides)
39. [Cheat Sheet](#39-cheat-sheet)
40. [Pattern Recognition Playbook](#40-pattern-recognition)
41. [Practice Roadmap](#41-practice-roadmap)

<a id="unit-1"></a>

## Unit 1 — Model & Prompt Engineering

Getting reliable, efficient behaviour out of a single model call at production scale.

<a id="1-what-this-course-assumes"></a>

## 1. What This Course Assumes

> **Key idea**
>
> This is the third FDE course on the site and the most technical. If you have not met the role before, read the [crash course](fde-crash-course.html) first for the engagement loop, and the [detailed course](fde-detailed-course.html) for discovery, scoping, compliance, on-call and hiring. This course deliberately does *not* repeat them. It covers the stack underneath.

A forward deployed engineer is judged on a system working in an environment they do not control. That means two kinds of competence, and most engineers have only one. The first is the consulting half — find the real workflow, scope it, survive the politics, hand it over. The second is the technical half: when the customer's architect asks why you chose a 384-dimension embedding model, why the agent loop terminates, what happens to the KV cache under their concurrency, or how row-level security reaches the retriever, you answer from mechanism rather than from a framework's README.

That second half is what this course is. It is organised bottom-up: the model, then what you put in its context, then retrieval, then agents, then the parts that make any of it deployable inside a bank.

<a id="1-1-the-shape-of-the-stack"></a>

### 1.1 The shape of the stack

```
                         what the customer sees
  ┌───────────────────────────────────────────────────────────────┐
  │  a claims handler asks a question and gets a cited answer     │
  └───────────────────────────────────────────────────────────────┘
        │
  ┌─────┴──────────────┐  ┌──────────────────┐  ┌────────────────┐
  │ orchestration      │  │ retrieval        │  │ the model      │
  │ §19–23 agents,     │  │ §10–18 chunking, │  │ §2–9 decoding, │
  │ graphs, MCP        │  │ vectors, graphs  │  │ context, tools │
  └─────┬──────────────┘  └────────┬─────────┘  └───────┬────────┘
        └──────────────┬───────────┴────────────────────┘
                       │
  ┌────────────────────┴──────────────────────────────────────────┐
  │ the part that decides whether it ships                        │
  │ §26–33 legacy systems, entitlements, guardrails, gateway,     │
  │         observability, serving, cost                          │
  │ §35–38 stack choice, cloud and Linux, model theory, agent IDEs│
  └───────────────────────────────────────────────────────────────┘
```

Read the bottom band again. In most failed enterprise AI projects, nothing in the top three boxes was wrong. The pilot answered questions correctly in a notebook and then could not be connected to the system of record, could not honour the permission model, could not be traced, or could not be priced. That is why a third of this course is about the bottom band.

<a id="1-2-prerequisites"></a>

### 1.2 What you are assumed to know

- **Assumed — Python** functions, classes, exceptions, context managers, virtual environments, and enough `asyncio` to know that `await` yields control rather than starting a thread. Section 9 covers only the parts that bite.
- **Assumed — HTTP and SQL** status codes, pagination, retries, joins, indexes and what a query plan is. Section 27 assumes you can read `EXPLAIN` output.
- **Assumed — containers** a Dockerfile, an image layer, an environment variable, and why a secret does not belong in either.
- **Not assumed — ML theory** you will not need to derive backpropagation. Everything about the model here is operational: what it costs, where it breaks, what you can change.

<a id="1-3-how-to-read-it"></a>

### 1.3 How to read it

Every section answers the same three questions in the same order: *what is the mechanism*, *what does it cost*, and *what does it look like when it fails in a customer's estate*. The third is the one that earns your keep. Anybody can wire a retriever; the value is knowing that a permission change upstream silently stales your index and writing the alert before it happens.

> **Interview**
>
> Almost every question in an FDE technical loop is a variant of “why did you choose that, and what breaks?” Answers that name a tool score nothing. Answers that name a trade-off, a number and a failure mode score everything. Read each section with that in mind — the numbers in the `meta-strip` at the top of a section are the ones worth memorising.

<a id="2-transformer-internals"></a>

## 2. Transformer Internals You Actually Use

- **Prefill** `O(n²)` in prompt length
- **Decode, cached** `O(n)` per token
- **KV cache** `GBs per request`
- **What you tune** `the prompt, not the weights`

You do not need the architecture to build a product. You need it the moment a customer asks why the first token takes two seconds, why their 100-page document costs more than ten 10-page documents, or why throughput collapses when they raise concurrency. All three answers live in the same place.

<a id="2-1-attention-in-one-paragraph"></a>

### 2.1 Attention, in one paragraph

Each token is projected into three vectors: a **query** (what am I looking for), a **key** (what do I offer) and a **value** (what I will contribute if chosen). Every token's query is compared against every earlier token's key; the resulting weights are used to take a weighted average of the values. That is the whole mechanism, repeated across dozens of heads and dozens of layers. The consequence that matters to you is the comparison count: `n` tokens means `n²` comparisons, so cost scales with the *square* of prompt length in the prefill phase.

> **Analogy** 🗂️
>
> **Picture it — a room of index cards**
>
> Every word in the prompt writes an index card describing itself (the key) and a note of what it contributes (the value). To produce the next word, you hold up a request (the query) and every card in the room raises its hand with a relevance score. You blend the notes in proportion to the scores. Add a word, and every existing card must be consulted again — which is exactly why long prompts cost more than proportionally.

<a id="2-2-prefill-and-decode"></a>

### 2.2 Prefill and decode are different machines

A request has two phases with completely different performance characteristics, and conflating them is the most common source of wrong capacity planning.

| Phase | What happens | Bound by | Visible as |
| --- | --- | --- | --- |
| Prefill | The whole prompt is processed in one parallel pass; K/V vectors for every position are computed and stored | Compute (FLOPs) | Time to first token |
| Decode | One token at a time, each attending over the cache | Memory bandwidth | Tokens per second |

So a long prompt with a short answer is a compute problem, and a short prompt with a long answer is a bandwidth problem. Batching helps the second enormously and the first barely. When a customer says “it is slow”, the first question is always *which number* — time to first token, or tokens per second — because the fixes have nothing in common.

<a id="2-3-the-kv-cache"></a>

### 2.3 The KV cache

> **Interactive animation:** `kv-cache` — rendered by the page script in the HTML version.

Switch the widget to *No cache* and watch the work counter. The cache turns quadratic decoding into linear decoding, and it pays for that with memory: roughly

```
bytes ≈ 2 (K and V) × layers × kv_heads × head_dim × seq_len × dtype_bytes

Llama-3-8B, 8k context, fp16, one request:
  2 × 32 × 8 × 128 × 8192 × 2  ≈  1.07 GB
```

One gigabyte, for one conversation. On a 24 GB card holding a 16 GB model you have room for about seven concurrent long conversations before you start evicting. This single calculation is why self-hosted deployments have concurrency limits that surprise people, why *grouped-query attention* (fewer KV heads than query heads) exists at all, and why vLLM's paged attention — which stores the cache in fixed blocks like virtual memory pages instead of one contiguous slab — roughly doubles achievable throughput without changing the model.

> **Tip**
>
> Provider **prompt caching** is this idea exposed commercially: keep the long, stable prefix of your prompt byte-identical across calls and the provider reuses its own cached K/V, charging a fraction of the input price. It changes how you lay out a prompt — system instructions, tool schemas and few-shot examples first and frozen; retrieved chunks and the user's question last. Reorder those and you silently lose the discount.

<a id="2-4-mixture-of-experts"></a>

### 2.4 Mixture of experts

In a dense model every parameter participates in every token. A mixture-of-experts model replaces the feed-forward block with `N` parallel experts and a router that activates two of them per token. A model with 47 B total parameters may activate only 13 B per token: it is priced and runs like a 13 B model, and it is smart like something much larger.

The catch is entirely operational, and it is the sort of detail that decides an architecture review. **All** the parameters must be resident in memory even though only a fraction are used, so an MoE model needs the VRAM of the big number and delivers the speed of the small one. For a hosted API that is the provider's problem. For an in-tenant deployment on the customer's two GPUs, it is yours, and it often rules the model out.

> **Warning**
>
> MoE routing also makes latency less predictable: different tokens take different paths and expert load is uneven. If you are quoting a p99 latency into an SLA for a self-hosted MoE model, measure it under the customer's real concurrency rather than trusting a benchmark taken at batch size one.

<a id="2-5-what-this-buys-you"></a>

### 2.5 What this buys you in the room

**Architecture review question**

*“We want this in our VPC on the two A10s we already have. Twenty concurrent users, 6k-token prompts. Will it work?”*

Do not answer yes or no — do the arithmetic out loud, because the arithmetic *is* the answer, and it is the same arithmetic in every one of these conversations. Two A10s give 48 GB. An 8 B model at fp16 is 16 GB, leaving 32. At 6k context each request's cache is roughly 0.8 GB, so twenty concurrent sessions need about 16 GB — it fits, with headroom that disappears the moment someone pastes a long document. Then name the levers in order of preference: quantise to 4-bit (16 GB → ~5), which frees far more than it costs in quality; cap context per request; use paged attention; and only then buy hardware.

**The back-of-envelope, as code you can keep**

```python
def vram_budget(
    params_b: float,          # model size in billions
    bits: int = 16,           # 16 = fp16, 4 = Q4
    layers: int = 32,
    kv_heads: int = 8,        # GQA: often far fewer than query heads
    head_dim: int = 128,
    ctx: int = 6_000,
    concurrency: int = 20,
    gpu_gb: float = 48.0,
) -> dict:
    weights = params_b * 1e9 * bits / 8 / 1e9
    # 2 = one K and one V per position; caches stay fp16 even when weights do not
    kv_per_req = 2 * layers * kv_heads * head_dim * ctx * 2 / 1e9
    total = weights + kv_per_req * concurrency
    return {
        "weights_gb": round(weights, 1),
        "kv_per_request_gb": round(kv_per_req, 2),
        "total_gb": round(total, 1),
        "headroom_gb": round(gpu_gb - total, 1),
        "max_concurrency": int((gpu_gb * 0.9 - weights) // kv_per_req),
    }

print(vram_budget(8))            # fp16: fits, but thinly
print(vram_budget(8, bits=4))    # Q4:   comfortable
```

```text
{'weights_gb': 16.0, 'kv_per_request_gb': 0.79, 'total_gb': 31.7,
 'headroom_gb': 16.3, 'max_concurrency': 34}

{'weights_gb': 4.0,  'kv_per_request_gb': 0.79, 'total_gb': 19.7,
 'headroom_gb': 28.3, 'max_concurrency': 39}
```

<a id="3-reasoning-models"></a>

## 3. Reasoning Models and When They Pay

- **Cost multiple** `3–20×`
- **Latency** `seconds to minutes`
- **Wins on** `multi-constraint reasoning`
- **Loses on** `extraction, routing, formatting`

A reasoning model generates a long internal chain of thought before its visible answer, and is trained with reinforcement learning to make that chain actually useful rather than decorative. You are billed for the hidden tokens. The practical consequence: reasoning models are a *budget decision* disguised as a model choice.

<a id="3-1-where-they-earn-it"></a>

### 3.1 Where they earn their price

- **Strength — constraint satisfaction** “Given these six policy clauses and this claim history, is it payable and under which clause?” Work that requires holding several conditions simultaneously and checking them against each other.
- **Strength — self-correction** Multi-step arithmetic, date and SLA calculations, plan generation where an early mistake invalidates the rest.
- **Strength — ambiguous specs** Turning a vague requirement into a decomposed plan — which is, not coincidentally, the FDE's own job.
- **Weakness — simple extraction** Pulling six fields out of an invoice. A small model does it as well, 20× cheaper and 10× faster.
- **Weakness — latency budgets** Anything in a live conversation. A handler on a phone call will not wait forty seconds.
- **Weakness — steerability** Heavy few-shot prompting and rigid formatting instructions help these models less, and sometimes hurt. They want the goal and the constraints, not a worked template.

<a id="3-2-the-routing-pattern"></a>

### 3.2 The pattern that actually ships: route

Almost no production system should send every request to a reasoning model, and almost none should send none. Classify cheaply, escalate deliberately, and log the escalation rate — it is one of the most useful cost signals you will have.

**Escalate on evidence, not on vibes**

```python
ROUTINE, HARD = "small-fast", "reasoning"

def route(task: dict) -> str:
    """Escalate only on signals you can measure and later audit."""
    if task["type"] in {"extract", "classify", "summarise"}:
        return ROUTINE
    if task["clauses_in_scope"] > 3:          # multi-constraint
        return HARD
    if task["value_gbp"] > 10_000:            # the mistake is expensive
        return HARD
    if task["first_pass_confidence"] < 0.7:   # cheap model already tried
        return HARD
    return ROUTINE

async def answer(task: dict) -> dict:
    tier = route(task)
    out = await call(model=MODELS[tier], **task["payload"])
    # Log the tier with the trace: escalation rate is a cost KPI, and a
    # rising one usually means the routine path has quietly regressed.
    log.info("routed", extra={"tier": tier, "trace": task["trace_id"]})
    return out
```

```javascript
const ROUTINE = "small-fast", HARD = "reasoning";

const route = (task) => {
  if (["extract", "classify", "summarise"].includes(task.type)) return ROUTINE;
  if (task.clausesInScope > 3) return HARD;
  if (task.valueGbp > 10_000) return HARD;
  if (task.firstPassConfidence < 0.7) return HARD;
  return ROUTINE;
};

export async function answer(task) {
  const tier = route(task);
  const out = await call({ model: MODELS[tier], ...task.payload });
  log.info("routed", { tier, trace: task.traceId });
  return out;
}
```

> **Warning**
>
> Two operational traps. First, hidden reasoning tokens are billed but not returned, so your token accounting must read the provider's usage fields rather than counting the response — teams routinely under-forecast by 5× this way. Second, you usually cannot see the chain of thought, so “show your working” as an audit control does not work here; if the customer needs a reviewable rationale, ask for a structured justification in the *answer*, and evaluate that.

<a id="4-context-economics"></a>

## 4. Tokens, Context and the Economics of a Prompt

- **English** `~4 chars / token`
- **Code, ids, JSON** `~2–3 chars / token`
- **Cost driver** `tokens × turns × users`
- **Attention** `strong at the ends`

Tokenisation is the arithmetic under every invoice you will ever defend. Byte-pair encoding merges frequent character sequences into single tokens, so common English is cheap and everything enterprise is not: `CLM-2026-004417` may be seven tokens, a UUID twenty, and a table of numbers is almost pathological. Non-English text costs more still — a fact worth raising early with a customer operating in Hindi or Arabic, because it can double a forecast.

<a id="4-1-count-before-you-quote"></a>

### 4.1 Count before you quote

**A token budget you can put in a scoping document**

```python
import tiktoken

enc = tiktoken.get_encoding("o200k_base")

def tokens(text: str) -> int:
    return len(enc.encode(text))

def monthly_cost(
    system: str, tools: str, chunks: str, question: str, answer_tokens: int,
    turns_per_day: int, users: int, in_per_m: float, out_per_m: float,
    cache_hit: float = 0.0,   # fraction of input served from prompt cache
) -> float:
    stable = tokens(system) + tokens(tools)          # cacheable prefix
    volatile = tokens(chunks) + tokens(question)     # changes every call
    billed_in = stable * (1 - cache_hit * 0.9) + volatile
    per_call = billed_in / 1e6 * in_per_m + answer_tokens / 1e6 * out_per_m
    return per_call * turns_per_day * users * 21     # working days

print(round(monthly_cost(SYSTEM, TOOLS, CHUNKS, Q, 400,
                         turns_per_day=30, users=250,
                         in_per_m=2.50, out_per_m=10.00), 2))
```

```text
without prompt caching   £ 11,340.00 / month
with 80% cache hit rate  £  6,982.50 / month
after reranking 20 → 6   £  3,115.10 / month

The last line is the point: retrieval discipline is a cost control,
not just a quality control.
```

<a id="4-2-packing-the-window"></a>

### 4.2 Packing the window

> **Interactive animation:** `context-budget` — rendered by the page script in the HTML version.

Two effects fight each other. A bigger window lets you stuff more evidence in; attention quality in the middle of a long window is measurably worse than at its ends — the *lost in the middle* result. So beyond a certain point, adding context reduces accuracy while increasing cost and latency. The competent move is always the same: retrieve wide, rerank hard, send little, and put the most important evidence first and last.

<a id="4-3-compression-techniques"></a>

### 4.3 Compressing what must stay

| Technique | How | Typical saving | Risk |
| --- | --- | --- | --- |
| Rolling summary | Summarise turns older than the last two into a paragraph of state | 60–80% of history | Losing a constraint the user set early on |
| Sentence pruning | Drop sentences in a chunk with low similarity to the query | 30–50% of chunk text | Cutting the sentence that carried the qualifier |
| Schema slimming | Send only the tools reachable from the current state | 50–70% of tool tokens | The model cannot call a tool it was not shown |
| Structured, not prose | Pass retrieved records as compact JSON, not rendered sentences | 20–40% | None material — do this by default |

> **Key idea**
>
> Write the token budget into the design document as a table — component, tokens, whether it is cacheable — before anyone writes a prompt. It converts the endless “is this too expensive?” conversation into a line-by-line one, and it is the single artefact that most impresses a customer CTO in an early review.

<a id="4-4-when-it-does-not-fit"></a>

### 4.4 When the evidence genuinely does not fit

Summarising a 300-page report, or answering across forty documents at once, is the case where no amount of reranking helps — the task really does need all of it. There are four strategies, and naming them correctly is half of choosing.

| Strategy | How | Calls | Use when |
| --- | --- | --- | --- |
| **Stuffing** | Put everything in one prompt | 1 | It fits with headroom. Always try this first — the others exist only because it fails |
| **Map-reduce** | Summarise each chunk independently, then combine the summaries | n + 1, parallel | Fast, and the default for “summarise these forty tickets”. Loses cross-document relationships |
| **Refine** | Summarise chunk 1, then ask the model to revise that summary given chunk 2, and so on | n, strictly serial | Narrative documents where later text changes the meaning of earlier text. Slow, and early errors propagate |
| **Sliding window** | Walk a fixed window with overlap, carrying forward a running state | n, serial | Transcripts, logs and chat history where locality matters and the whole will never fit |

> **Tip**
>
> Map-reduce is parallel and therefore fast; refine is serial and therefore slow but coherent. If you need both, map-reduce into section summaries and then *refine* over those — a dozen inputs instead of three hundred, at a fraction of the wall-clock time.

<a id="5-prompt-architecture"></a>

## 5. Prompting Patterns That Survive Production

- **Versioned** `like code`
- **Tested** `against a golden set`
- **Few-shot** `3–8 examples`
- **Never** `edited live in a notebook`

You already know zero-shot and few-shot. What separates a production prompt from a demo prompt is structure, versioning and the assumption that everything inside it is untrusted. This section covers the patterns worth the complexity and the ones that are usually cargo cult.

<a id="5-1-the-layout"></a>

### 5.1 The layout that survives caching and injection

```
┌ system ──────────────────────────────────────────────┐  stable · cacheable
│ role, scope, refusal rules, output contract          │
├ tool schemas ────────────────────────────────────────┤  stable · cacheable
├ few-shot examples ───────────────────────────────────┤  stable · cacheable
├ retrieved evidence ──────────────────────────────────┤  volatile · UNTRUSTED
│ <doc id="CLM-2"> ... </doc>  (delimited, id'd)       │
├ conversation history ────────────────────────────────┤  volatile
└ user question ───────────────────────────────────────┘  volatile · UNTRUSTED
```

Three rules are doing the work here. Stable content goes first so the cacheable prefix is as long as possible. Retrieved evidence is wrapped in explicit delimiters with ids, so the model can cite and so that instructions embedded in a document are visibly *inside* a data block. And the instruction that matters most — the refusal rule, the output contract — is repeated at the very end, because that is the other position attention reliably reaches.

<a id="5-2-which-patterns-earn-their-tokens"></a>

### 5.2 Which patterns earn their tokens

| Pattern | What it does | Use when | Real cost |
| --- | --- | --- | --- |
| Chain of thought | Think step by step before answering | Arithmetic, multi-clause rules — on non-reasoning models | 2–4× output tokens; redundant on reasoning models |
| Self-consistency | Sample `k` answers, take the majority | High-value decisions with a discrete answer | `k`× everything. Rarely justified below £1k per decision |
| Reflection / self-critique | Draft, critique against the rules, revise | Generated artefacts: SQL, config, letters to customers | 2–3 calls; genuinely effective when the critique has a checklist |
| Tree of thought | Branch, evaluate, prune | Search problems with a scoring function | High. Almost always the wrong tool in enterprise workflows |
| Prompt chaining | One narrow call per step, piped | Nearly always | Low. The default you should reach for first |
| Plan-and-execute | Plan once, then execute steps without re-planning | Long tool sequences where drift is the risk | Low; also the most auditable, because the plan is an artefact |

> **Tip**
>
> Prompt chaining beats one clever mega-prompt for a reason that has nothing to do with accuracy: **each link is separately testable**. When quality drops you can point at the step that regressed instead of bisecting a 2,000-token instruction. Decompose until every call has one job and one output contract.

<a id="5-3-multi-turn-state"></a>

### 5.3 Multi-turn design

Do not carry conversation by appending raw turns forever. Carry an explicit state object and render the prompt from it. The difference shows up the first time a user says “actually, make it Cardiff” twenty turns in: with raw history the model has to re-read and re-infer; with state you simply update a field.

**State-rendered prompts instead of an ever-growing transcript**

```python
from dataclasses import dataclass, field

@dataclass
class Session:
    site: str | None = None
    date_range: tuple[str, str] | None = None
    filters: dict = field(default_factory=dict)
    recent: list[dict] = field(default_factory=list)   # last 2 turns, verbatim
    summary: str = ""                                  # everything older

    def render(self) -> list[dict]:
        state = (
            f"Known so far — site: {self.site or 'unset'}; "
            f"range: {self.date_range or 'unset'}; filters: {self.filters}"
        )
        msgs = [{"role": "system", "content": SYSTEM},
                {"role": "system", "content": state}]
        if self.summary:
            msgs.append({"role": "system",
                         "content": f"Earlier in this conversation: {self.summary}"})
        return msgs + self.recent

    def observe(self, turn: dict) -> None:
        self.recent.append(turn)
        if len(self.recent) > 4:                       # 2 exchanges
            self.summary = summarise(self.summary, self.recent.pop(0))
```

```javascript
export class Session {
  constructor() {
    this.site = null;
    this.dateRange = null;
    this.filters = {};
    this.recent = [];   // last two exchanges, verbatim
    this.summary = "";  // everything older, compressed
  }

  render() {
    const state =
      `Known so far — site: ${this.site ?? "unset"}; ` +
      `range: ${this.dateRange ?? "unset"}; ` +
      `filters: ${JSON.stringify(this.filters)}`;
    const msgs = [
      { role: "system", content: SYSTEM },
      { role: "system", content: state },
    ];
    if (this.summary) {
      msgs.push({ role: "system", content: `Earlier: ${this.summary}` });
    }
    return [...msgs, ...this.recent];
  }

  observe(turn) {
    this.recent.push(turn);
    if (this.recent.length > 4) {
      this.summary = summarise(this.summary, this.recent.shift());
    }
  }
}
```

<a id="5-4-prompts-are-code"></a>

### 5.4 Prompts are code

Keep prompts in files, not string literals. Give each one a semantic version. Record the version with every trace, so that when accuracy moves you can correlate it with a deploy. Run the golden set (§16) in CI against every change. This sounds bureaucratic until the first time a customer asks “what changed on Tuesday?” and you can answer in thirty seconds.

> **Warning**
>
> The single most damaging habit in customer-site AI work is editing the live prompt to fix a complaint. It resolves the complaint, silently breaks two other cases, and leaves no record. If you take one operational discipline from this course, take this one: **no prompt reaches production without a version, a diff and an eval run.**

<a id="6-structured-output"></a>

## 6. Structured Output and Validation

- **Contract** `a schema, not a hope`
- **Repair** `1 retry, with the error`
- **Enum fields** `always closed`
- **Free text** `unparseable at scale`

Everything downstream of the model — a database write, a branch in a workflow, a UI — needs a shape. Asking politely for JSON in the prompt works about 95% of the time, which sounds excellent until you run 40,000 documents a day and discover it means two thousand failures.

<a id="6-1-three-levels-of-guarantee"></a>

### 6.1 Three levels of guarantee

| Mechanism | How it works | Guarantee |
| --- | --- | --- |
| Prompt instruction | “Reply with JSON matching…” | None. Expect prose preambles, markdown fences, trailing commas |
| JSON mode | Provider flag forcing syntactically valid JSON | Valid JSON — but not *your* JSON. Fields can be missing or invented |
| Constrained decoding | Provider or engine masks the token distribution to a grammar derived from your schema | Schema-valid by construction. This is what `strict: true` and `response_format` with a JSON Schema give you |

Use constrained decoding wherever the provider supports it, and validate anyway. Schema-valid is not semantically valid: a date can parse and still be in 1970, a claim id can match a regex and not exist.

<a id="6-2-pydantic-as-the-contract"></a>

### 6.2 Pydantic as the single source of truth

**One model definition drives the schema, the parse and the validation**

```python
from enum import StrEnum
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field, field_validator

class Outcome(StrEnum):
    APPROVE = "approve"
    DECLINE = "decline"
    ESCALATE = "escalate"          # closed set: the model cannot invent a fourth

class Approve(BaseModel):
    outcome: Literal[Outcome.APPROVE]
    amount_gbp: float = Field(ge=0, le=50_000)
    clause: str = Field(pattern=r"^§\d+\.\d+$")

class Decline(BaseModel):
    outcome: Literal[Outcome.DECLINE]
    reason_code: Literal["SLA_MET", "NOT_COVERED", "DUPLICATE"]
    evidence_chunk_ids: list[str] = Field(min_length=1)   # forces citation

class Escalate(BaseModel):
    outcome: Literal[Outcome.ESCALATE]
    question_for_human: str = Field(min_length=10, max_length=300)

# Discriminated union: one field decides the branch, so validation errors
# are precise instead of "none of the 3 variants matched".
Decision = Annotated[Union[Approve, Decline, Escalate],
                     Field(discriminator="outcome")]

class Result(BaseModel):
    decision: Decision
    confidence: float = Field(ge=0, le=1)

    @field_validator("confidence")
    @classmethod
    def not_suspiciously_round(cls, v: float) -> float:
        # Models emit 0.95 reflexively. Treat it as unset rather than as signal.
        return 0.0 if v in (0.95, 0.9) else v
```

```javascript
import { z } from "zod";

const Approve = z.object({
  outcome: z.literal("approve"),
  amountGbp: z.number().min(0).max(50_000),
  clause: z.string().regex(/^§\d+\.\d+$/),
});

const Decline = z.object({
  outcome: z.literal("decline"),
  reasonCode: z.enum(["SLA_MET", "NOT_COVERED", "DUPLICATE"]),
  evidenceChunkIds: z.array(z.string()).min(1),
});

const Escalate = z.object({
  outcome: z.literal("escalate"),
  questionForHuman: z.string().min(10).max(300),
});

// discriminatedUnion gives the same precise errors as Pydantic's discriminator
export const Result = z.object({
  decision: z.discriminatedUnion("outcome", [Approve, Decline, Escalate]),
  confidence: z.number().min(0).max(1),
});
```

Two design choices in there are worth copying everywhere. **Closed enums** mean the model cannot invent an outcome your workflow has no branch for. **Required evidence ids** on the decline path mean an unsupported refusal fails validation rather than reaching a customer — the schema is quietly enforcing a policy, which is far more reliable than a sentence in the prompt asking for one.

Libraries such as `instructor` wrap the last mile of this: they derive the JSON Schema from your Pydantic model, pass it as `response_format` or as a tool definition, validate the reply and re-ask on failure — the loop in §6.3, as a decorator. Worth using, with one caveat for field work: know what it does underneath, because when a provider in the customer's estate does not support strict mode you will need to fall back to prompting plus validation yourself, and a library that hides the difference will hide the failure too.

<a id="6-3-the-repair-loop"></a>

### 6.3 The repair loop, bounded

**Retry once with the validation error; then fail honestly**

```python
from pydantic import ValidationError

async def extract(prompt: str, schema: type[BaseModel], attempts: int = 2):
    messages = [{"role": "user", "content": prompt}]
    last_error: str | None = None

    for attempt in range(attempts):
        raw = await call(messages=messages, response_format=json_schema(schema))
        try:
            return schema.model_validate_json(raw)
        except ValidationError as exc:
            # Feed the model the *validator's* message, not a generic scolding.
            # errors() is precise: field path, rule violated, value received.
            last_error = exc.json(indent=None)
            messages += [
                {"role": "assistant", "content": raw},
                {"role": "user",
                 "content": f"That failed validation: {last_error}. "
                            f"Return corrected JSON only."},
            ]
            metrics.incr("extract.repair", tags={"attempt": attempt})

    # Never return a half-parsed object. Downstream code must be able to trust
    # its input, so a failure here becomes an explicit, countable outcome.
    raise SchemaFailure(prompt=prompt, error=last_error)
```

```text
extract.repair       rate 3.1%   ← healthy; watch the trend, not the value
extract.failure      rate 0.04%  ← these go to a human queue, not /dev/null

A repair rate that jumps after a model version change is one of the
earliest and cheapest drift signals you will get. Alert on it.
```

> **Key idea**
>
> Repair rate and schema-failure rate are two of the four metrics worth putting on the wall from day one (the others are retrieval hit rate and human-override rate). They need no labelled data, they move before quality does, and a customer's ops lead can understand all four without a tutorial.

<a id="7-tool-calling"></a>

## 7. Tool Calling at Production Scale

- **Tools per call** `≤ 10 reachable`
- **Descriptions** `written for a stranger`
- **Writes** `idempotent or gated`
- **Errors** `values, not exceptions`

A tool definition is a piece of documentation the model reads at runtime. That reframing fixes most tool-calling problems: the model is not misbehaving, it is following an ambiguous specification you wrote. Everything in this section follows from taking the schema seriously as an interface.

<a id="7-1-the-anatomy"></a>

### 7.1 Anatomy of a tool that works

**Every field is doing a job**

```python
FIND_CLAIMS = {
    "name": "find_claims",
    # Describe WHEN to use it and WHEN NOT TO. Most tool-selection errors are
    # description errors — two tools whose descriptions do not distinguish them.
    "description": (
        "Search exception claims for ONE site. A claim is 'overdue' when now is "
        "past its SLA deadline. Use this to find claim ids before acting on "
        "them; do NOT use it to look up a claim you already have an id for "
        "(use get_claim). Returns at most 100 rows, newest first."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "site_code": {
                "type": "string",
                "pattern": "^[A-Z]{3}-[0-9]{2}$",
                "description": "Site code such as 'LDS-04'. Never a site name.",
            },
            "overdue_only": {"type": "boolean", "default": True},
            "limit": {"type": "integer", "minimum": 1, "maximum": 100,
                      "default": 20},
        },
        "required": ["site_code"],
        "additionalProperties": False,   # with strict mode: no invented params
    },
}
```

```javascript
export const FIND_CLAIMS = {
  name: "find_claims",
  description:
    "Search exception claims for ONE site. A claim is 'overdue' when now is " +
    "past its SLA deadline. Use this to find claim ids before acting on them; " +
    "do NOT use it when you already have an id (use get_claim). Max 100 rows.",
  parameters: {
    type: "object",
    properties: {
      siteCode: {
        type: "string",
        pattern: "^[A-Z]{3}-[0-9]{2}$",
        description: "Site code such as 'LDS-04'. Never a site name.",
      },
      overdueOnly: { type: "boolean", default: true },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    },
    required: ["siteCode"],
    additionalProperties: false,
  },
};
```

<a id="7-2-too-many-tools"></a>

### 7.2 The tool-count problem

Selection accuracy degrades as the tool list grows, and the schemas themselves consume context on every single call. Past roughly a dozen tools you need a strategy, and there are only three that work:

- **State-scoped exposure** Only pass the tools reachable from the current step. A graph node that is gathering evidence does not need the tool that writes a decision. Cheapest and most effective.
- **Namespacing by sub-agent** Give each worker its own narrow tool set (§21). Ten tools split across three specialists beats thirty in one prompt.
- **Tool retrieval** Embed tool descriptions and retrieve the top few for the query. Necessary above ~50 tools; adds a failure mode, because a tool that is not retrieved simply does not exist.
- **Doing nothing** The symptom is a model that calls a plausible neighbour of the right tool. The diagnosis looks like a reasoning failure and is actually a namespace problem.

<a id="7-3-execution-discipline"></a>

### 7.3 Executing calls safely

**Parallel where safe, serial where not, errors as data**

```python
import asyncio

READ_ONLY = {"find_claims", "get_claim", "get_policy"}

async def run_tool_calls(calls: list[dict], ctx: Context) -> list[dict]:
    reads  = [c for c in calls if c["name"] in READ_ONLY]
    writes = [c for c in calls if c["name"] not in READ_ONLY]

    # Reads have no ordering constraints, so fan them out.
    results = await asyncio.gather(*(dispatch(c, ctx) for c in reads),
                                   return_exceptions=True)
    out = [to_message(c, r) for c, r in zip(reads, results)]

    # Writes run one at a time, in the order the model asked for, each with an
    # idempotency key derived from its arguments — a retried run must not
    # produce a second payment.
    for c in writes:
        key = idempotency_key(ctx.trace_id, c["name"], c["arguments"])
        out.append(to_message(c, await dispatch(c, ctx, idempotency_key=key)))
    return out

def to_message(call: dict, result) -> dict:
    """A failed tool returns a message the model can reason about.
    Raising here just ends the run; the model can retry or route around."""
    if isinstance(result, Exception):
        body = {"error": type(result).__name__, "detail": str(result)[:200],
                "retryable": isinstance(result, (TimeoutError, RateLimited))}
    else:
        body = result
    return {"role": "tool", "tool_call_id": call["id"], "content": json(body)}
```

```javascript
const READ_ONLY = new Set(["find_claims", "get_claim", "get_policy"]);

export async function runToolCalls(calls, ctx) {
  const reads = calls.filter((c) => READ_ONLY.has(c.name));
  const writes = calls.filter((c) => !READ_ONLY.has(c.name));

  const settled = await Promise.allSettled(
    reads.map((c) => dispatch(c, ctx))
  );
  const out = reads.map((c, i) => toMessage(c, settled[i]));

  for (const c of writes) {
    const key = idempotencyKey(ctx.traceId, c.name, c.arguments);
    const r = await dispatch(c, ctx, { idempotencyKey: key });
    out.push(toMessage(c, { status: "fulfilled", value: r }));
  }
  return out;
}

const toMessage = (call, settled) => ({
  role: "tool",
  tool_call_id: call.id,
  content: JSON.stringify(
    settled.status === "rejected"
      ? { error: settled.reason.name, detail: String(settled.reason).slice(0, 200) }
      : settled.value
  ),
});
```

> **Warning**
>
> Hallucinated tool calls are normal, not exceptional: a name that does not exist, an argument that is not in the schema, an id invented to fill a required field. Handle all three as ordinary control flow — return a tool message saying exactly what was wrong and let the model correct itself — and cap the corrections. An uncapped correction loop is how a £4 task becomes a £400 one overnight.

<a id="8-prompt-optimisation"></a>

## 8. Systematic Prompt Optimisation

- **Needs** `a metric and 50+ examples`
- **Optimises** `instructions + demos`
- **Typical gain** `5–20 points`
- **Not a substitute for** `good retrieval`

Hand-tuning prompts is a search over an enormous space conducted by one tired human with no memory of what they already tried. Frameworks like DSPy make the search programmatic: you declare the *signature* of each step and a metric, and the optimiser proposes instructions and selects few-shot demonstrations against your data.

<a id="8-1-the-shift-in-thinking"></a>

### 8.1 The shift in thinking

> **Analogy** ⚙️
>
> **Picture it — hand-tuned assembly vs a compiler**
>
> Writing prompts by hand is writing assembly: you can do it well, but you are optimising one function at a time against a machine you cannot see inside. A prompt optimiser is a compiler — you declare intent (*this step maps a question and context to an answer with citations*) and a benchmark, and it generates the actual text. When the model underneath changes, you recompile instead of rewriting.

**Declare the step, then compile it against data**

```python
import dspy

class Classify(dspy.Signature):
    """Route an inbound exception to the team that owns it."""
    note:  str = dspy.InputField(desc="handler's free-text note")
    sites: str = dspy.InputField(desc="comma-separated valid site codes")
    team:  str = dspy.OutputField(desc="one of: billing, logistics, legal, none")
    why:   str = dspy.OutputField(desc="one sentence, quoting the note")

router = dspy.ChainOfThought(Classify)

def metric(example, pred, trace=None) -> float:
    # The metric IS the specification. Getting it wrong optimises the wrong
    # thing very efficiently — here, a wrong route costs more than an abstention.
    if pred.team == example.team:
        return 1.0
    return 0.3 if pred.team == "none" else 0.0

optimised = dspy.MIPROv2(metric=metric, auto="medium").compile(
    router, trainset=train[:120], valset=dev[:60],
)
optimised.save("router.v3.json")     # the artefact you version and ship
```

```text
baseline (hand-written prompt)      0.71 on dev
+ optimised instruction             0.78
+ 4 selected demonstrations         0.86
+ same, on a cheaper small model    0.83   ← the real prize

Optimising for the small model is usually worth more than the
accuracy points: it moves the workload down a price tier.
```

<a id="8-2-when-not-to"></a>

### 8.2 When not to reach for it

Optimisers need a metric and a dataset. If you do not have 50 labelled examples you do not have an optimisation problem, you have a *specification* problem, and the fix is to go and sit with the operators until you can write down what a correct answer is. In a customer engagement that is almost always the true blocker, and it is the same work as building the golden set in §16 — so do it once and use it twice.

> **Tip**
>
> The most reliable use of an optimiser in field work is not squeezing the last points out of the flagship model. It is **compiling a prompt that lets a small, cheap, locally-hostable model do the routine 70%**. That is the change that makes an in-tenant deployment affordable, and it is invisible to anyone reading the prompt by hand.

<a id="9-async-and-throughput"></a>

## 9. Async Python and Throughput

- **LLM work is** `I/O bound`
- **One event loop** `thousands of waits`
- **One blocking call** `stalls everything`
- **Always** `bound concurrency`

An LLM call spends almost all of its wall-clock time waiting on a socket. That single fact means a well-written async service handles hundreds of concurrent requests on one core, and a badly-written one handles about four. The mistakes are few and always the same.

<a id="9-1-the-three-mistakes"></a>

### 9.1 The three mistakes

**Each of these has shipped to production more than once**

```python
# 1. Sequential awaits. Correct, and ten times slower than necessary.
results = []
for doc in docs:
    results.append(await summarise(doc))          # 10 × 2s = 20s

results = await asyncio.gather(*(summarise(d) for d in docs))   # ~2s

# 2. A blocking call inside a coroutine. requests, psycopg2, PyPDF, tiktoken
#    on a big document — any of them freezes the entire event loop, so every
#    other in-flight request stops too. The symptom is baffling: latency
#    spikes on endpoints that did nothing wrong.
text = requests.get(url).text                      # ✗ blocks the loop
text = (await client.get(url)).text                # ✓ httpx.AsyncClient
pages = await asyncio.to_thread(pdf_extract, path) # ✓ push CPU work off-loop

# 3. Unbounded fan-out. gather() over 5,000 documents opens 5,000 sockets,
#    hits the provider's rate limit, and retries all of them at once.
sem = asyncio.Semaphore(8)                         # match the provider's limit

async def guarded(doc):
    async with sem:
        return await summarise(doc)

results = await asyncio.gather(*(guarded(d) for d in docs))
```

```javascript
// 1. Sequential awaits
const results = [];
for (const doc of docs) results.push(await summarise(doc));   // slow
const fast = await Promise.all(docs.map(summarise));          // parallel

// 2. Blocking the loop: in Node it is CPU work, not I/O. A synchronous
//    JSON.parse of a 200 MB file or a regex with catastrophic backtracking
//    stalls every other request on the process.
const data = JSON.parse(fs.readFileSync(p));      // ✗
const data2 = JSON.parse(await fs.promises.readFile(p));  // ✓ still CPU-bound
// heavy CPU work belongs in a worker_thread

// 3. Unbounded fan-out — cap it
import pLimit from "p-limit";
const limit = pLimit(8);
const out = await Promise.all(docs.map((d) => limit(() => summarise(d))));
```

<a id="9-2-streaming"></a>

### 9.2 Streaming is a product decision

Streaming does not make a response faster; it makes the wait legible. A 6-second answer that begins appearing at 600 ms feels quicker than a 3-second answer that appears all at once. In a customer demo that difference decides how the room feels about the system, which is not a trivial consideration.

It also imposes an architecture. Once you stream, your output guardrails (§29) can no longer inspect a complete response before the user sees it. The usual resolution is to stream the prose and buffer anything structured, or to run rails over a sliding window and be prepared to retract — decide this deliberately rather than discovering it at the security review.

> **Warning**
>
> Timeouts, not retries, are the most commonly missing line. An LLM call with no timeout will occasionally hang for minutes, hold a connection and a semaphore slot, and cascade into a queue backup that looks like a capacity problem. Set a total timeout, a connect timeout and a time-to-first-token timeout, and make the first one shorter than your caller's.

<a id="unit-2"></a>

## Unit 2 — Retrieval & RAG

Grounding answers in enterprise data, from chunking and indexing to hybrid search, reranking, evaluation and GraphRAG.

<a id="10-chunking"></a>

## 10. Chunking

- **Sane default** `400–800 tokens`
- **Overlap** `10–20%`
- **Best** `the document's own structure`
- **Worst bug class** `looks like hallucination`

Chunking is the least glamorous decision in RAG and the one that most often decides whether it works. A chunk is simultaneously the unit of embedding, the unit of retrieval, and the unit of citation, and those three jobs want different sizes. Getting it wrong produces failures that are diagnosed, wrongly, as model failures.

<a id="10-1-where-the-cut-lands"></a>

### 10.1 Where the cut lands

> **Interactive animation:** `chunking` — rendered by the page script in the HTML version.

Step through all three variants. The failure in the fixed-size case is not subtle once you see it: a chunk whose subject was left in the previous chunk embeds as a vector that sits nowhere near the query, so it is never retrieved, so no downstream cleverness can recover it.

<a id="10-2-strategies"></a>

### 10.2 The strategies, ranked by how often they are right

| Strategy | How | Good for | Fails on |
| --- | --- | --- | --- |
| Structure-aware | Split on headings, clauses, list items, table rows | Contracts, policies, manuals, wikis, tickets — most enterprise content | Genuinely unstructured prose |
| Recursive character | Try paragraph, then sentence, then word boundaries until under the limit | A decent default when structure is absent | Long tables, code |
| Semantic | Embed sentences, cut where consecutive similarity drops | Narrative documents, transcripts | Cost at ingest; unpredictable chunk sizes |
| Row-per-record | One chunk per database row or ticket, rendered as text | Structured sources — and it is the most under-used option | Nothing; just remember to include the field names |
| Fixed size | N tokens with overlap | Prototypes and logs | Everything else, quietly |

<a id="10-3-context-enrichment"></a>

### 10.3 Give every chunk its context back

The highest-leverage trick in chunking costs one ingest-time string concatenation: prepend the chunk's location and, optionally, a one-line generated summary of what the parent document is. The chunk then carries enough context to be embedded and retrieved on its own terms.

**Contextual chunks: cheap at ingest, large effect on recall**

```python
def contextualise(chunk: str, doc: Document, section_path: list[str]) -> dict:
    header = " > ".join(section_path)          # "Policy 2026 > §4 Fees > §4.1"
    # The embedded text carries its own breadcrumbs; the stored text does not,
    # so citations still show the reader the original wording.
    return {
        "embed_text": f"[{doc.title} — {header}]\n{chunk}",
        "display_text": chunk,
        "metadata": {
            "doc_id": doc.id,
            "section": header,
            "effective_from": doc.effective_from,   # for time-aware filtering
            "acl": doc.acl_groups,                  # see §28 — carry this now
            "page": doc.page_of(chunk),
        },
    }
```

```text
Retrieval hit-rate on a 40-question set, same corpus and model:

  fixed 512, no overlap              0.61
  recursive 512 / 64 overlap         0.68
  structure-aware on headings        0.79
  + breadcrumb prefix                0.86
  + hybrid search (§13)              0.91
  + cross-encoder rerank (§14)       0.94

Measure this on the customer's own documents before choosing.
The ordering is stable; the numbers are not.
```

> **Key idea**
>
> Whatever you decide, write an ACL field and an effective-date field into chunk metadata on day one, even if nothing reads them yet. Retro-fitting permissions or point-in-time retrieval means a full re-ingest of a corpus that may take a week and a change request to run — and both requirements arrive eventually in every regulated estate.

<a id="11-embeddings"></a>

## 11. Embeddings, Metrics and Dimensionality

- **Similarity** `cosine, normalised`
- **Dims** `384 → 3072`
- **Storage** `dims × 4 bytes`
- **Model change** `full re-index`

An embedding maps text to a point in a few hundred dimensions such that related meanings land near each other. Two consequences run through everything downstream. First, *similar is not relevant*: “how do I cancel?” and “how do I not cancel?” are near neighbours. Second, the embedding model is part of your storage format — changing it invalidates every vector you have.

<a id="11-1-distance-metrics"></a>

### 11.1 Which metric, and why it usually does not matter

| Metric | Measures | Use |
| --- | --- | --- |
| Cosine | Angle only; magnitude ignored | The default for text. Long and short documents compare fairly |
| Dot product | Angle and magnitude | Identical to cosine *when vectors are normalised* — and faster |
| Euclidean (L2) | Straight-line distance | Images, and models trained with an L2 objective |

Most text embedding models emit normalised vectors, which makes cosine and dot product the same computation. The mistake that does bite: indexing with one metric and querying with another, which produces results that are plausible enough that nobody notices for weeks. Assert the metric in your index setup code.

<a id="11-2-dimensions-and-mrl"></a>

### 11.2 Dimensions, cost, and truncation

**The storage conversation, in numbers**

```python
def index_footprint(n_chunks: int, dims: int, replicas: int = 2,
                    hnsw_overhead: float = 1.5) -> dict:
    """Vectors alone, before metadata and the payload text."""
    raw_gb = n_chunks * dims * 4 / 1e9              # float32
    with_graph = raw_gb * hnsw_overhead             # HNSW links, ~1.3–1.8×
    return {
        "raw_gb": round(raw_gb, 1),
        "in_memory_gb": round(with_graph * replicas, 1),
        "int8_gb": round(with_graph * replicas / 4, 1),   # scalar quantised
    }

print(index_footprint(10_000_000, 3072))   # a big-model index
print(index_footprint(10_000_000, 768))    # a sensible one
```

```text
3072 dims: {'raw_gb': 122.9, 'in_memory_gb': 368.6, 'int8_gb': 92.2}
 768 dims: {'raw_gb': 30.7,  'in_memory_gb': 92.2,  'int8_gb': 23.0}

Four times the RAM for a few points of retrieval quality that a
reranker recovers for free. This is the argument you will have with
somebody who picked the model from a leaderboard.
```

Several modern models are trained with Matryoshka representation learning, which means you can truncate the vector — 3072 down to 768 — and renormalise, losing far less quality than a naive truncation would. When the customer's constraint is RAM, that is the first lever, ahead of scalar or binary quantisation of the vectors themselves.

<a id="11-3-choosing-a-model"></a>

### 11.3 Choosing an embedding model in the field

- **Evaluate on their corpus** Build 40 real questions with known answers and measure recall@10 for three candidates. A day's work that outperforms any leaderboard.
- **Check the deployment constraint first** If inference must stay in the VPC, hosted embedding APIs are out and the shortlist is open-weights models you can serve.
- **Mind the domain** Generic models underperform on dense jargon — medical coding, legal citation, part numbers. This is where hybrid search (§13) matters most.
- **Do not chase the leaderboard** A two-point MTEB difference is noise relative to your chunking decision, and it will not survive contact with the customer's documents.

> **Warning**
>
> Changing the embedding model means re-embedding and re-indexing everything, and during the window where both exist your results are incoherent. Plan it as a migration with a dual-write and a cutover, exactly as you would a database schema change — and budget the GPU hours. On a 10-million-chunk corpus this is days, not hours.

<a id="12-vector-indexes"></a>

## 12. Vector Indexes and Vector Databases

- **Exact search** `O(n) per query`
- **HNSW** `~O(log n), RAM-hungry`
- **Tuning knob** `ef_search`
- **Recall** `a setting, not a constant`

Below a hundred thousand vectors, brute force is fine and you should not be having this conversation. Above it you are choosing an approximate index, and the choice trades three things against each other: recall, latency and memory. You cannot have all three.

> **Interactive animation:** `ann-index` — rendered by the page script in the HTML version.

<a id="12-1-index-families"></a>

### 12.1 The index families

| Index | Idea | Strength | Cost |
| --- | --- | --- | --- |
| Flat | Compare against everything | Exact; no tuning; instant to build | Linear query time |
| IVF | Cluster vectors, search the nearest `nprobe` clusters | Low memory; fast to build | Needs training; recall cliff near cluster edges |
| HNSW | Navigable small-world graph over layers | Best recall/latency; supports incremental insert | Memory-hungry; deletes are tombstones until rebuild |
| IVF-PQ | Clusters plus product-quantised vectors | Huge compression, billions of vectors on modest RAM | Real recall loss; needs a rerank stage over raw vectors |
| DiskANN | Graph designed for SSD residency | Large corpora without the RAM bill | Higher latency; fewer managed options |

<a id="12-2-filtered-search"></a>

### 12.2 The filter problem

Every real query has filters — this tenant, this region, documents effective on this date, things this user may see. How the index handles them is the most important question you can ask a vector database vendor, and it is rarely on the comparison page.

- **Post-filter** Retrieve top-`k`, then discard non-matching. When the filter is selective you get back two results, or none. Silently bad.
- **Pre-filter then brute force** Correct, but degrades to a linear scan over the matching subset — fine for thousands, not for millions.
- **Filtered graph traversal** The index evaluates the predicate *during* the walk, skipping non-matching neighbours. Correct and fast. This is what you want, and what `pgvector` with an appropriate B-tree, Qdrant, Weaviate and Milvus implement in different ways.
- **Partitioning** A separate index (or namespace) per tenant. Strongest isolation story for a security review, and the easiest to explain; the cost is many small indexes to operate.

<a id="12-3-which-database"></a>

### 12.3 Which database, in an enterprise

The engineering differences between mature vector stores are smaller than the procurement differences, and the procurement differences are what will actually decide this. The order of questions that matters on a customer site:

1. **Can it run where the data must live?** A managed cloud service is out of the question for an air-gapped or residency-constrained estate, regardless of its benchmarks.
2. **Is it already on the approved list?** `pgvector` wins an enormous number of these decisions because the customer already runs Postgres, already backs it up, already has a DBA, and adding an extension is a smaller change request than adding a system.
3. **Does it do filtered search properly?** See above. This is the technical question that most often forces a change later.
4. **What is the operational story?** Snapshots, restores, rolling re-index, and what happens when the node holding an in-memory index restarts.
5. **Only then, scale and speed.** At ten million chunks and 50 QPS — which covers most enterprise workflows — every serious option is fast enough.

| Store | What it is | Where it fits an engagement |
| --- | --- | --- |
| **FAISS** | A library, not a server: Flat, IVF, IVF-PQ and HNSW indexes in-process | Embedded use, notebooks, and the exact-search harness you compare recall against. No filtering, no persistence story, no concurrency — you build those |
| **ChromaDB** | A developer-friendly store that runs in-process or as a container | Week-one prototypes and the local demo. I would not put it under a production corpus of millions |
| **pgvector** | A Postgres extension: HNSW and IVFFlat indexes on ordinary columns | The pragmatic default in an enterprise. Your ACLs, your metadata, your vectors and your transactions in one database with one backup |
| **Qdrant / Weaviate / Milvus** | Purpose-built vector databases, self-hostable | When filtered search, payload indexing and sharding at scale genuinely matter, and the customer will accept a new system to operate |
| **Pinecone** | Fully managed, serverless | Excellent, and ruled out by a residency or zero-egress requirement more often than not. Ask before you design around it |

> **Tip**
>
> Report recall as a number you chose, not as a property of the system: “at `ef_search = 128` we measure 0.97 recall@10 against exact search, at p95 22 ms”. Build the exact-search comparison harness on day one — it is twenty lines of NumPy and it is the only way to know whether a quality complaint is a retrieval problem or a generation problem.

<a id="13-hybrid-search"></a>

## 13. Hybrid Search and Rank Fusion

- **BM25 wins on** `ids, codes, names`
- **Dense wins on** `paraphrase`
- **RRF k** `60, and leave it`
- **Default** `run both`

> **Interactive animation:** `hybrid-rrf` — rendered by the page script in the HTML version.

Enterprise queries are full of tokens an embedding model has never seen: `4021`, `LDS-04`, `BRK-12`, a surname, a batch number. Dense retrieval blurs exactly those, because they carry no semantic neighbourhood. Keyword retrieval nails them and fails on paraphrase. Running both and fusing the ranks is not an advanced optimisation; it is the baseline that avoids a whole class of embarrassing demo failures.

<a id="13-1-implementing-it"></a>

### 13.1 Implementing it without a second system

**Postgres does both halves; RRF is fifteen lines**

```python
from collections import defaultdict

def rrf(rankings: list[list[str]], k: int = 60, weights=None) -> list[str]:
    """Fuse ranked id lists. Only positions matter, so incomparable
    score scales (BM25 vs cosine) never need normalising."""
    weights = weights or [1.0] * len(rankings)
    score = defaultdict(float)
    for ranking, w in zip(rankings, weights):
        for rank, doc_id in enumerate(ranking, start=1):
            score[doc_id] += w / (k + rank)
    return sorted(score, key=score.get, reverse=True)

SQL = """
WITH dense AS (
  SELECT id, row_number() OVER (ORDER BY embedding <=> %(q_vec)s) AS rank
  FROM chunks
  WHERE tenant_id = %(tenant)s AND acl && %(groups)s   -- pre-filter, §28
  ORDER BY embedding <=> %(q_vec)s LIMIT 50
),
sparse AS (
  SELECT id, row_number() OVER (
           ORDER BY ts_rank_cd(tsv, plainto_tsquery(%(q_text)s)) DESC) AS rank
  FROM chunks
  WHERE tenant_id = %(tenant)s AND acl && %(groups)s
    AND tsv @@ plainto_tsquery(%(q_text)s) LIMIT 50
)
SELECT COALESCE(d.id, s.id) AS id,
       1.0/(60 + COALESCE(d.rank, 1000)) + 1.0/(60 + COALESCE(s.rank, 1000))
         AS rrf_score
FROM dense d FULL OUTER JOIN sparse s USING (id)
ORDER BY rrf_score DESC LIMIT 20;
"""
```

```javascript
export function rrf(rankings, { k = 60, weights } = {}) {
  const w = weights ?? rankings.map(() => 1);
  const score = new Map();
  rankings.forEach((ranking, i) => {
    ranking.forEach((id, idx) => {
      score.set(id, (score.get(id) ?? 0) + w[i] / (k + idx + 1));
    });
  });
  return [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

// Two independent retrievers, fused. Note that a document appearing on
// both lists outranks one that is first on a single list — agreement
// between retrievers is the signal RRF is pricing.
const fused = rrf([await denseSearch(q), await bm25Search(q)]);
```

<a id="13-2-hyde"></a>

### 13.2 HyDE, and when the query is the problem

Queries and documents are written in different registers: a user asks “why was I charged twice?” and the document says “duplicate settlement events arising from retry semantics”. HyDE closes that gap by asking the model to *write the document it expects to find*, then embedding that hypothetical answer instead of the question. It measurably helps on short, colloquial queries.

The costs are real: an extra model call per search, added latency, and a hallucinated hypothetical that can drag retrieval sideways. Treat it as a targeted fix for a measured problem — short queries with poor recall — not as a default layer. In practice, hybrid search plus a reranker solves the same problem more cheaply more often.

> **Key idea**
>
> Before adding any clever retrieval layer, run the boring diagnostic: take fifty failed questions and check whether the correct chunk was in the top 50 at all. If it was, you have a *ranking* problem and the fix is a reranker. If it was not, you have a *recall* problem and the fix is chunking, hybrid search or the query. Teams routinely spend weeks fixing the wrong one of these.

<a id="14-reranking"></a>

## 14. Reranking

- **Retrieve** `30–100 candidates`
- **Keep** `3–8`
- **Added latency** `50–200 ms`
- **Typical gain** `largest single win`

> **Interactive animation:** `rerank` — rendered by the page script in the HTML version.

A bi-encoder embeds the query and the document separately, which is what makes pre-computing a million vectors possible — and also means the document was encoded without ever seeing your question. A cross-encoder reads the pair together in one pass, so every query token attends to every document token. It is far more accurate and completely impractical at corpus scale, which is why the two are used in sequence rather than as alternatives.

<a id="14-1-the-two-stage-shape"></a>

### 14.1 The two-stage shape

```
query
  │
  ├─ dense  top-50 ─┐
  │                 ├─ RRF ─→ 60 unique candidates ─→ cross-encoder ─→ top 6 ─→ LLM
  └─ BM25   top-50 ─┘            (recall stage)          (precision stage)

recall stage:    cheap, approximate, "do not lose the answer"
precision stage: expensive, exact,  "put the answer first"
```

Naming the two stages is not pedantry — it tells you which one to fix. Low recall means the answer never entered the funnel: look at chunking, hybrid search, filters. Low precision means it entered and was buried: look at the reranker. And it tells you what to measure: recall@50 for the first stage, nDCG or MRR for the second.

<a id="14-2-in-code"></a>

### 14.2 In code, with the cost visible

**Local cross-encoder; swap for a hosted rerank API if allowed**

```python
from sentence_transformers import CrossEncoder

# ~80 MB, CPU-friendly, runs inside the customer's VPC with no egress.
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)

async def retrieve(query: str, ctx: Context, keep: int = 6) -> list[Chunk]:
    dense, sparse = await asyncio.gather(
        dense_search(query, ctx, k=50),
        bm25_search(query, ctx, k=50),
    )
    candidates = dedupe(rrf([ids(dense), ids(sparse)]))[:60]

    # Blocking model inference — keep it off the event loop (§9).
    pairs = [(query, c.display_text) for c in candidates]
    scores = await asyncio.to_thread(reranker.predict, pairs, batch_size=32)

    ranked = sorted(zip(candidates, scores), key=lambda p: p[1], reverse=True)

    # An absolute-score floor is as valuable as the ordering: if nothing clears
    # it, the honest answer is "I could not find this" rather than the least
    # bad of six irrelevant chunks.
    kept = [c for c, s in ranked[:keep] if s > RELEVANCE_FLOOR]
    metrics.gauge("retrieval.kept", len(kept))
    return kept
```

```text
Latency budget, p95, measured on the customer's hardware:

  dense search (HNSW, ef=128)          22 ms
  BM25 (Postgres GIN)                  14 ms   (parallel with dense)
  RRF fusion                            1 ms
  cross-encoder, 60 pairs, 4 vCPU     140 ms
  ─────────────────────────────────────────
  retrieval total                     163 ms
  generation (first token)            740 ms   ← the actual bottleneck

Show this table in the architecture review. It ends the argument
about whether reranking is "too slow" in about ten seconds.
```

> **Tip**
>
> The relevance floor is the most under-used line in that function. A system that says “nothing in the corpus answers this” ten times a day is trusted; a system that always produces six chunks and a confident paragraph is not, and the difference in user trust is visible within a fortnight of go-live.

<a id="15-advanced-rag"></a>

## 15. Query Transformation and Self-Correcting RAG

- **Loop cap** `2, always`
- **Grader** `a small model`
- **Exit** `abstain, don't guess`
- **Added cost** `1.4–2.5×`

Plain RAG is a single shot: embed, search, stuff, answer. It fails predictably on three query shapes — multi-part questions, comparisons across entities, and questions whose vocabulary does not match the corpus. The fixes are all forms of doing more than one pass.

<a id="15-1-query-transformation"></a>

### 15.1 Transforming the query

| Transform | Input → output | Fixes |
| --- | --- | --- |
| Rewrite | “why twice?” → “duplicate charge on claim C-77001” | Conversational ellipsis; missing entity from earlier turns |
| Decompose | One question → 2–4 independent sub-questions | “Compare our SLA with the supplier's” — needs two retrievals |
| Multi-query | One question → 3 paraphrases, retrieve all, fuse | Vocabulary mismatch; cheap and very reliable |
| Step-back | Specific → the general principle behind it | “Is this claim payable?” needs the policy, not just the claim |
| Multi-hop | Retrieve, read, form the next query from what you learned | Chained facts — and the one to prefer a graph for (§17) |

**Decompose and fan out, with the sub-answers kept separate**

```python
class SubQuestions(BaseModel):
    parts: list[str] = Field(max_length=4)
    reason: str

async def answer_complex(question: str, ctx: Context) -> Answer:
    plan = await extract(DECOMPOSE_PROMPT.format(q=question), SubQuestions)

    # Independent sub-questions retrieve in parallel; each keeps its own
    # evidence so the final answer can cite per claim rather than per answer.
    findings = await asyncio.gather(
        *(retrieve_and_summarise(p, ctx) for p in plan.parts)
    )

    if all(f.empty for f in findings):
        return Answer.abstain(question, tried=plan.parts)

    return await synthesise(question, findings, ctx)
```

```javascript
export async function answerComplex(question, ctx) {
  const plan = await extract(decomposePrompt(question), SubQuestions);

  const findings = await Promise.all(
    plan.parts.map((p) => retrieveAndSummarise(p, ctx))
  );

  if (findings.every((f) => f.empty)) {
    return Answer.abstain(question, plan.parts);
  }
  return synthesise(question, findings, ctx);
}
```

<a id="15-2-corrective-rag"></a>

### 15.2 Grading retrieval before trusting it

> **Interactive animation:** `crag-loop` — rendered by the page script in the HTML version.

Corrective RAG (CRAG) inserts a grader between retrieval and generation. Self-RAG adds a second check after generation: is every sentence entailed by a cited chunk? Agentic RAG generalises both — the retriever becomes a tool the model may call repeatedly, with its own judgement about when it has enough.

All three multiply cost, and all three need a hard cap. The discipline that makes them safe is unglamorous: **a loop counter in state, a maximum, and a defined behaviour at the maximum**. The defined behaviour should almost always be abstention plus a human route, because a system that escalates 6% of questions and is right about the rest is worth far more to an operations team than one that answers everything and is right 94% of the time with no way to tell which.

<a id="15-3-choosing-the-level"></a>

### 15.3 Choosing how much machinery

- **Start — hybrid + rerank + abstain** This handles the large majority of enterprise question-answering. Ship it, measure it, and let the failures tell you what to add.
- **Add — multi-query** When failures cluster on short or colloquial queries. One extra cheap call, no new failure modes.
- **Add — decomposition** When failures cluster on comparisons and multi-part asks. Visible in the logs as questions containing “and”.
- **Avoid — starting agentic** An agentic retriever built before you have measurements is a system whose cost and latency you cannot predict and whose failures you cannot attribute. It is also much harder to hand over.

<a id="15-4-the-named-variants"></a>

### 15.4 The named variants, disentangled

The literature names a dozen of these and they overlap heavily. Four are worth being able to tell apart, because a customer's data scientist will use the words.

| Name | The one idea | Worth it when |
| --- | --- | --- |
| **Corrective RAG (CRAG)** | Grade the retrieved set; if it is weak, rewrite and retrieve again or fall back to another source | Recall is uneven across your corpus — the common case |
| **Self-RAG** | The model emits reflection tokens deciding whether to retrieve, and whether each sentence is supported | You need per-sentence attribution, e.g. regulated advice |
| **Adaptive RAG** | Classify the query first and route it: no retrieval for chit-chat, single-shot for lookups, multi-hop only when needed | Cost control. It is §3's routing idea applied to retrieval, and usually the cheapest of the four to add |
| **Contextual retrieval** | At ingest, prepend a generated sentence situating each chunk in its parent document before embedding it | Always, if you can afford the ingest pass — it is §10.3 with a model instead of a breadcrumb, and it measurably lifts recall |
| **LOTR / merger retriever** | Run several retrievers over several indexes and merge the results, deduplicating and reordering to put the strongest evidence at both ends of the context | Multiple corpora with different characteristics — policies, tickets, email. Mechanically it is §13's fusion generalised past two retrievers |

> **Warning**
>
> Every one of these is a paper with a name, and none of them is a product decision. Add one only when a measured failure cluster demands it, and record which cluster in the commit message. Otherwise you accumulate four retrieval strategies, none of which anybody can explain, and a handover that fails.

<a id="16-rag-evaluation"></a>

## 16. RAG Evaluation and Synthetic Sets

- **Start at** `30–50 cases`
- **Stratify by** `category`
- **Run in** `CI, every change`
- **Owned by** `the customer, after handover`

> **Interactive animation:** `eval-harness` — rendered by the page script in the HTML version.

The detailed course covers the golden set as an engagement artefact — who writes it, how you get operators to argue with it, why it is the thing you hand over. This section is the mechanics: which metrics separate a retrieval failure from a generation failure, and how to get to a usable set faster than by hand.

<a id="16-1-the-four-metrics"></a>

### 16.1 Four metrics that localise the fault

| Metric | Question it answers | Low score means |
| --- | --- | --- |
| Context recall | Did retrieval return the chunks needed to answer? | Chunking, embedding or filters — not the model |
| Context precision | Are the relevant chunks ranked at the top? | Ranking — add or fix the reranker |
| Faithfulness | Is every statement in the answer supported by the context? | Generation is inventing — prompt, or too much context |
| Answer relevance | Does the answer address the question asked? | The model answered a nearby question; often a decomposition gap |

The pairing matters more than any single value. High recall with low faithfulness is a generation problem. Low recall with high faithfulness is a retrieval problem producing an honest “I don't know”. High faithfulness with low answer relevance usually means your chunks are about the right *topic* and the wrong *entity*, which is a filter bug.

<a id="16-2-synthetic-sets"></a>

### 16.2 Bootstrapping a set from the corpus

**Generate candidates, then have a human keep a third**

```python
class QAPair(BaseModel):
    question: str
    answer: str
    supporting_chunk_ids: list[str] = Field(min_length=1)
    category: Literal["lookup", "comparison", "multi_hop", "unanswerable"]

async def synthesise_cases(chunks: list[Chunk], n: int = 150) -> list[QAPair]:
    sample = stratified_sample(chunks, n)        # spread across doc types
    pairs = await bounded_gather(
        (generate_qa(c) for c in sample), limit=8
    )
    # Every generated question must be answerable from its own chunk, and the
    # 'unanswerable' category must be genuinely unanswerable — the negatives
    # are the half of the set that catches confident nonsense.
    return [p for p in pairs if verify_grounded(p)]
```

```text
Workflow that actually produces a trusted set:

1. Generate 150 candidates from the corpus            (1 hour, automated)
2. Delete the 60% that are trivial or malformed       (1 hour, you)
3. Sit with two operators and rewrite the survivors
   in their words; they will also dictate 20 more     (2 hours, them)
4. Add the negatives by hand: entitlement denials,
   out-of-scope asks, prompt injections               (1 hour, you)
5. Freeze, version, commit next to the code

Step 3 is not optional. A set written only by engineers tests the
system you built, not the work the customer does.
```

<a id="16-3-graders-and-ci"></a>

### 16.3 Graders and CI

Use the cheapest grader that can decide each case. Exact match and regex for ids, codes and outcomes. Set overlap for “did it cite the right chunks”. An LLM judge only for open prose — and pin the judge's model and prompt version, because an unpinned judge silently redefines your benchmark. Calibrate it once against 30 human-labelled cases and record the agreement rate; if it is below about 85%, the judge is measuring something other than what you think.

A note on the classical metrics, because somebody will ask for them. **BLEU** and **ROUGE** score n-gram overlap against a reference answer; **F1** balances precision and recall on extracted spans. They are cheap, deterministic and reproducible, which is genuinely valuable — and they punish a correct answer phrased differently from the reference, which makes them close to useless for open generation. Use F1 and exact match where the output is a *span or a label*, and an LLM judge where it is prose. Reporting a BLEU score on a claims summariser tells the customer nothing they can act on.

<a id="16-4-the-tooling"></a>

#### The tooling, and what each is for

- **RAGAS** The four retrieval metrics of §16.1 — faithfulness, answer relevance, context precision and context recall — implemented, plus synthetic test-set generation from your corpus. The fastest route to a first honest number on a RAG pipeline.
- **DeepEval** Assertions in a `pytest` shape, so evals run in CI alongside unit tests rather than as a separate ritual. Good when the customer's team already lives in pytest, which is most of them.
- **PromptFoo** Declarative prompt regression: a YAML matrix of prompts × models × cases with a diffable report. The right tool for “does prompt v4 beat v3, on both models, on all eleven categories?”
- **Trajectory evaluation** For agents, the answer is not the only thing being graded. Score the *path*: did it call the right tools, in a sensible order, without redundant calls, and did it stop for the right reason (§19)? A correct answer reached by six wasteful calls is a cost bug you will not see any other way.
- **Any of them, without a human-written set** All four make it easy to generate cases and grade them automatically, which makes it easy to build a benchmark that measures the system's agreement with itself. The operator-written cases from §16.2 are what keep it honest.

**A CI gate that blocks on regression, not on absolute score**

```text
# .github/workflows/eval.yml
name: eval
on: [pull_request]
jobs:
  golden-set:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -e '.[dev]'
      - run: python -m evals.run --suite golden --out results.json
      - run: |
          python -m evals.gate \
            --results results.json \
            --baseline evals/baselines/main.json \
            --max-regression 0.02 \
            --block-on-category entitlement,injection   # zero tolerance
      - uses: actions/upload-artifact@v4
        with: { name: eval-results, path: results.json }
```

```python
def gate(results: dict, baseline: dict, max_regression: float,
         block_on: set[str]) -> int:
    failures = []
    for category, score in results["by_category"].items():
        prior = baseline["by_category"].get(category, 0.0)
        # Per-category, never aggregate: a headline "94%" happily hides a
        # category that has gone to zero, and it is always the category
        # that matters to the one stakeholder who will notice.
        if category in block_on and score < prior:
            failures.append(f"{category}: {prior:.2f} -> {score:.2f} (no-regression)")
        elif score < prior - max_regression:
            failures.append(f"{category}: {prior:.2f} -> {score:.2f}")

    for f in failures:
        print("REGRESSION", f)
    return 1 if failures else 0
```

> **Key idea**
>
> The eval suite is the deliverable that makes everything else safe to change after you leave. Without it the customer can run your system but cannot modify it, so it freezes, drifts and is quietly switched off in eighteen months. Budget for it in week one, not week twelve.

<a id="17-knowledge-graphs"></a>

## 17. Knowledge Graphs and GraphRAG

- **Good at** `relationships, identity`
- **Bad at** `free-text nuance`
- **Real cost** `the ontology, not the DB`
- **Pattern** `graph + vectors together`

> **Interactive animation:** `graph-hop` — rendered by the page script in the HTML version.

Vector search answers “what text is like this text”. A large class of the questions customers actually care about are not like that: *which vehicles are affected*, *who approved this*, *what else did this supplier touch*, *show me everything connected to this incident*. Those are traversals, and a graph answers them exactly, repeatably, and with a path you can show an auditor.

<a id="17-1-ontology-vs-taxonomy"></a>

### 17.1 Ontology, taxonomy, schema

A **taxonomy** is a hierarchy: claim types nested under categories. An **ontology** adds typed relationships and constraints between entities: a `Claim` is `FILED_BY` a `Handler`, `COVERS` a `Vehicle`, is `GOVERNED_BY` a `PolicyClause`. The ontology is where the customer's business logic becomes explicit, which is why building one is 80% conversation and 20% code — and why it is the same work as the domain modelling in the detailed course rather than an extra project.

> **Analogy** 🗺️
>
> **Picture it — the difference between a phrasebook and a map**
>
> A vector index is a phrasebook: give it something you want to say and it finds the closest phrase. A graph is a map: it will not tell you what a street *feels* like, but it will tell you exactly how to get from here to there and what lies between. Nobody navigates a city with only one of the two.

<a id="17-2-building-from-relational"></a>

### 17.2 Getting the graph out of the relational estate

You rarely start from nothing. The customer has tables, and the relationships are already encoded as foreign keys, join tables and naming conventions. A join table becomes an edge; a foreign key becomes a relationship; a status column becomes a property. The genuinely hard part is **entity resolution** — the same supplier appearing as three rows with three spellings across two systems — and it is not an AI problem. It is deterministic rules first (tax id, registration number), fuzzy matching second, and a human review queue for the remainder.

The engines are largely interchangeable and the query language is not. **Neo4j** and its managed form **AuraDB** speak Cypher, which is the declarative pattern-matching language the examples below use and the one most people mean by “graph query”. **Amazon Neptune** is the managed option inside an AWS estate and speaks openCypher and Gremlin, which matters because it makes the graph procurable in an account that will not approve a new vendor. And if the graph is small — under a few million edges, which covers most single-workflow ontologies — recursive CTEs in the Postgres you already run are a perfectly respectable answer that requires no new system at all.

**Relational rows to graph, then a two-hop query**

```python
LOAD_PARTS = """
UNWIND $rows AS row
MERGE (p:Part {id: row.part_id})
  ON CREATE SET p.name = row.name
MERGE (l:Lot  {id: row.lot_id})
MERGE (p)-[:FROM_LOT]->(l)
MERGE (v:Vehicle {vin: row.vin})
MERGE (p)-[:FITTED_TO {fitted_on: date(row.fitted_on)}]->(v)
"""

AFFECTED = """
MATCH (c:Claim {id: $claim_id})-[:CAUSED_BY]->(l:Lot)
MATCH (l)<-[:FROM_LOT]-(:Part)-[:FITTED_TO]->(v:Vehicle)-[:IN_FLEET]->(f:Fleet)
RETURN f.name AS fleet, count(DISTINCT v) AS vehicles
ORDER BY vehicles DESC
"""

# Exposed to the model as a TOOL with fixed Cypher and bound parameters —
# never as "write me some Cypher". Same argument as §27 for SQL.
async def affected_fleets(claim_id: str, ctx: Context) -> list[dict]:
    async with driver.session(database=ctx.tenant) as s:
        return [r.data() async for r in
                await s.run(AFFECTED, claim_id=claim_id)]
```

```text
fleet          vehicles
Cardiff             184
Bristol              77
Leeds                12

Three rows, no model involved in producing them, reproducible next
Tuesday, and defensible in a regulatory conversation. Compare with
"here are five documents that mention brake lots".
```

<a id="17-3-the-hybrid-pattern"></a>

### 17.3 The pattern that works: both, with a division of labour

1. **Resolve** the entities named in the question with exact lookups against the graph.
2. **Traverse** to find the connected set — the vehicles, the clauses, the approvals.
3. **Retrieve** narrative text for those specific entities from the vector store, filtered by their ids.
4. **Generate** with both: structured facts as JSON, prose as cited chunks.

Step three is what makes this better than either alone. The graph turns a vague semantic search into a precise, filtered one, which is the same precision win a reranker gives you, obtained earlier and more cheaply.

> **Warning**
>
> Do not propose a graph database because the problem sounds “connected”. Propose it when you can name three questions the customer asks weekly that require two or more hops, and when there is an owner for the ontology after you leave. A graph with no maintainer becomes stale faster than any other component, and a stale graph gives confidently wrong answers rather than no answers.

<a id="18-multimodal-rag"></a>

## 18. Multimodal RAG and Document AI

- **Real corpora** `scanned PDFs`
- **Tables** `break naive OCR`
- **Cite** `page + bounding box`
- **Cost** `vision tokens add up`

Enterprise knowledge does not arrive as clean markdown. It arrives as twenty years of PDFs: scanned contracts, engineering drawings, forms with handwriting in the margin, spreadsheets exported to print layout. Ingest is where most of the effort in a document-heavy engagement actually goes, and it is consistently under-scoped.

<a id="18-1-the-ingest-ladder"></a>

### 18.1 The ingest ladder

| Document type | Approach | Watch for |
| --- | --- | --- |
| Digital PDF with a text layer | Extract text and layout directly | Multi-column flow order; headers repeating into every chunk |
| Scanned page | Layout detection, then OCR per region | Skew, stamps, handwriting; confidence scores are worth keeping |
| Tables | Table-structure model → emit as markdown or CSV per table | Merged cells and multi-row headers; never let a table become one flat paragraph |
| Charts and diagrams | Vision model generates a text description at ingest | Description quality is the retrieval quality; store the image reference too |
| Dense visual layouts | OCR-free page embeddings (ColPali-style): embed page images directly | Large index; harder to cite a span; excellent when OCR keeps mangling the page |

<a id="18-2-two-architectures"></a>

### 18.2 The two architectures

```
A · text-first (default)                 B · vision-first (ColPali-style)
 page → layout → OCR → text chunks        page image → patch embeddings
      → text embeddings                        → multi-vector index
 ✓ cheap, citable to a span               ✓ no OCR errors to propagate
 ✓ works with your existing index         ✓ survives terrible scans, forms
 ✗ every OCR error is permanent           ✗ large index, vision tokens at query
 ✗ tables and figures need special care   ✗ citation is a page, not a sentence
```

Start with A and keep a measured list of the pages where it fails. If a specific document family keeps failing — and it is usually one: the forms, the drawings, the legacy scans — run B for that family only. A hybrid where 90% of the corpus is cheap text and 10% is expensive page embeddings is a perfectly respectable production design, and far easier to justify than putting the whole archive through a vision model.

<a id="18-3-citation-that-humans-accept"></a>

### 18.3 Citation that humans accept

**Keep the coordinates; the UI is what earns adoption**

```python
class VisualChunk(BaseModel):
    text: str
    doc_id: str
    page: int
    bbox: tuple[float, float, float, float]   # normalised x0,y0,x1,y1
    ocr_confidence: float
    source_kind: Literal["text_layer", "ocr", "table", "figure_caption"]

    def citation(self) -> dict:
        # The front end draws this rectangle over the page image. An assessor
        # who can SEE the sentence highlighted on the original scan stops
        # asking whether the system made it up — which is the single biggest
        # adoption lever in document-heavy workflows.
        return {"doc": self.doc_id, "page": self.page, "highlight": self.bbox}
```

```text
Field note: on a claims-assessment engagement the accuracy of the
answers barely moved between v1 and v2. Weekly active use tripled.

The only change was rendering the source page with the cited sentence
boxed in yellow. Assessors were not distrusting the model; they were
unwilling to sign their name to something they could not verify in
five seconds.
```

> **Warning**
>
> Carry OCR confidence through to the answer and refuse to assert from low-confidence text. A digit misread on a scanned invoice — 1 for 7, 0 for 8 — produces an answer that is fluent, precise, specific and wrong, with no signal anywhere in the pipeline that anything went amiss. This is the most dangerous failure mode in document AI precisely because it looks like success.

<a id="unit-3"></a>

## Unit 3 — Agents & Orchestration

Agent architectures, LangGraph, multi-agent coordination, memory and the Model Context Protocol.

<a id="19-agent-architectures"></a>

## 19. Agent Architectures

- **Agency is** `the model choosing the next step`
- **Steps** `capped, always`
- **Cheapest** `a workflow, not an agent`
- **Hardest part** `termination`

> **Tip**
>
> The classical taxonomy still gets asked about, and it maps cleanly onto what you build. A **reflex** agent maps a percept straight to an action — that is your router, or a classifier with a webhook. A **goal-based** agent searches for a sequence that reaches a stated goal — plan-and-execute. A **utility-based** agent chooses between goals by scoring outcomes — the escalation routing of §3.2, where the utility function is cost against accuracy. A **tool-using** (or model-based) agent maintains an internal picture of a world it cannot fully see and acts on it through tools — which is every production agent in this course.

> **Interactive animation:** `agent-loop` — rendered by the page script in the HTML version.

“Agent” has been stretched to mean anything with a tool call in it. The useful definition is narrow: **an agent is a system where the model decides the control flow**. If you decided the sequence and the model only fills in the steps, you have a workflow — and a workflow is cheaper, faster, more testable and easier to hand over. Prefer it. Use agency only where the space of correct sequences is genuinely too large to enumerate.

<a id="19-1-the-patterns"></a>

### 19.1 The patterns, and what each is for

| Pattern | Control flow | Use when | Failure mode |
| --- | --- | --- | --- |
| Chain / workflow | You decide, statically | The sequence is known — most of the time | Brittle to inputs you did not anticipate |
| Router | Model picks one branch, once | Triage, intent classification | Misroutes on ambiguity; add an “unclear” branch |
| ReAct | Think → act → observe, looping | Open-ended investigation over tools | Loops; repeats a failing call; does not know when to stop |
| Plan-and-execute | Plan once, then run the steps | Long sequences where drift is the risk; anything auditable | A bad plan executes confidently to the end |
| Tool arbiter | A cheap model selects the tool, an expensive one uses the result | Many tools, tight budget | Selection errors are now a separate, measurable stage — which is the point |
| Supervisor | An agent delegates to specialist agents | Genuinely separate domains and tool sets (§21) | Cost multiplies; coordination bugs |

<a id="19-2-termination"></a>

### 19.2 Termination is the whole engineering problem

A ReAct loop has no natural end. The model stops when it decides it is done, and models are poor judges of that: they repeat a failing call with the same arguments, they ping-pong between two tools, they declare success without evidence. Every production agent needs explicit termination conditions, and writing them down is most of the design work.

**Six conditions; a real agent needs all of them**

```python
@dataclass
class Budget:
    max_steps: int = 8
    max_tool_calls: int = 12
    max_tokens: int = 60_000
    max_seconds: float = 45.0
    max_cost_gbp: float = 0.50

def should_stop(state: AgentState, b: Budget) -> str | None:
    if state.answer is not None:                     return "answered"
    if state.steps >= b.max_steps:                   return "step_budget"
    if state.tool_calls >= b.max_tool_calls:         return "tool_budget"
    if state.tokens >= b.max_tokens:                 return "token_budget"
    if state.elapsed >= b.max_seconds:               return "timeout"
    if state.cost_gbp >= b.max_cost_gbp:             return "cost_budget"
    # The one people forget: identical call, identical args, twice running.
    # It is the single most common way an agent burns £20 achieving nothing.
    if state.last_two_calls_identical():             return "no_progress"
    return None
```

```javascript
const BUDGET = {
  maxSteps: 8, maxToolCalls: 12, maxTokens: 60_000,
  maxSeconds: 45, maxCostGbp: 0.5,
};

export function shouldStop(s, b = BUDGET) {
  if (s.answer != null) return "answered";
  if (s.steps >= b.maxSteps) return "step_budget";
  if (s.toolCalls >= b.maxToolCalls) return "tool_budget";
  if (s.tokens >= b.maxTokens) return "token_budget";
  if (s.elapsed >= b.maxSeconds) return "timeout";
  if (s.costGbp >= b.maxCostGbp) return "cost_budget";
  if (s.lastTwoCallsIdentical()) return "no_progress";
  return null;
}
```

Every one of those reasons is a metric. Plot them as a stacked chart by day and you have the most informative single dashboard an agent system can have: a rising `no_progress` rate means a tool has started failing, a rising `step_budget` rate means the task mix has shifted, and a rising `cost_budget` rate means a conversation with the customer is about to happen whether you start it or not.

> **Key idea**
>
> Hitting a budget is not an error — it is a designed outcome, and it must produce something useful: the partial findings, the reason it stopped, and a route to a human. An agent that stops and says “I checked these four things, could not confirm the fifth, here is what I have” is a colleague. One that times out with a stack trace is a liability.

<a id="20-langgraph"></a>

## 20. LangGraph in Depth

- **Unit** `typed state`
- **Merging** `reducers per key`
- **Durability** `checkpoint per node`
- **Pause** `interrupt + thread id`

> **Interactive animation:** `langgraph-run` — rendered by the page script in the HTML version.

The reason to reach for a graph framework is not that cycles are hard to write — a while-loop does cycles. It is that you need *durable* cycles: a run that can pause for a human approval on Thursday, survive a deployment on Friday, and resume on Monday with its full state, plus a replayable history for the incident review.

<a id="20-1-state-and-reducers"></a>

### 20.1 State and reducers

**The reducer on each key is a design decision, not boilerplate**

```python
import operator
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver

class State(TypedDict):
    messages: Annotated[list, add_messages]   # append, never replace
    evidence: Annotated[list, operator.add]   # concurrent nodes both append
    steps:    Annotated[int, operator.add]    # each node adds its own count
    claim_id: str                             # no reducer = last write wins
    decision: dict | None

def gather(state: State) -> dict:
    # Nodes return a PARTIAL update. Returning the whole state is the classic
    # beginner bug: it makes concurrent branches clobber each other.
    hits = search(state["claim_id"])
    return {"evidence": hits, "steps": 1}

def route(state: State) -> str:
    if state["steps"] > 8:            return "approve"     # budget, §19
    if len(state["evidence"]) < 3:    return "gather"      # cycle
    return "decide"

g = StateGraph(State)
g.add_node("gather", gather)
g.add_node("decide", decide)
g.add_node("approve", approve)
g.add_edge(START, "gather")
g.add_conditional_edges("gather", route,
                        {"gather": "gather", "decide": "decide",
                         "approve": "approve"})
g.add_edge("decide", "approve")
g.add_edge("approve", END)

app = g.compile(
    checkpointer=PostgresSaver(pool),      # not MemorySaver, in production
    interrupt_before=["approve"],          # human gate, §29
)
```

```text
config = {"configurable": {"thread_id": "claim-C-77001"}}

app.invoke({"claim_id": "C-77001", "messages": []}, config)
# → runs, then stops at the interrupt and returns

# hours or days later, in a different process, after a deploy:
app.get_state(config).next            # ('approve',)
app.invoke(Command(resume={"approved_by": "j.mills"}), config)

# and for the incident review:
for snapshot in app.get_state_history(config):
    print(snapshot.next, snapshot.values["steps"])
```

<a id="20-2-what-to-get-right"></a>

### 20.2 The four things to get right

1. **Reducers.** Choose one per key deliberately. `add_messages` for transcripts, `operator.add` for anything two concurrent branches both write, last-write-wins for scalars owned by one node. A concurrent write to a key with no reducer is an error, and it is the error people hit first.
2. **Partial updates.** Nodes return only what they changed. Anything else breaks fan-out.
3. **A durable checkpointer.** `MemorySaver` is for tests. In production the checkpointer is a Postgres table, which also means your run history is queryable with SQL by the customer's own analysts.
4. **Testable edge functions.** Routing conditions are pure functions of state. Unit-test them with no model in the loop — this is the part of an agent you can have genuine coverage of, so have it.

> **Tip**
>
> Use the `thread_id` as the business key — the claim id, the ticket number — rather than a random UUID. Then “show me everything the system did about claim C-77001” is one query, which is a question you will be asked in the first week of production and every incident thereafter.

<a id="21-multi-agent"></a>

## 21. Multi-Agent Orchestration

- **Justified by** `separate tool sets`
- **Cost** `multiplies`
- **Workers return** `structured data`
- **Failures** `isolated, not fatal`

> **Interactive animation:** `supervisor-agents` — rendered by the page script in the HTML version.

Multi-agent is oversold. Most problems that look like they need a team of agents actually need one well-prompted agent with a smaller tool set, or a workflow. The genuine reasons to split are three: the domains need *different tools*, they need *different permissions*, or they can run *concurrently* and latency matters. “It feels more modular” is not one of them.

<a id="21-1-topologies"></a>

### 21.1 Topologies

- **Supervisor (hierarchical)** One coordinator delegates and aggregates. Predictable, debuggable, the right default. Cost is bounded because only the supervisor loops.
- **Sequential pipeline** Specialists in a fixed order, each refining the last. Barely an agent system, which is a compliment.
- **Map-reduce** Fan the same task over many inputs, then aggregate. The one topology where concurrency is an unambiguous win — forty documents, forty parallel extractions, one merge.
- **Peer-to-peer / free conversation** Agents talking to each other until they agree. Unbounded cost, non-reproducible, and almost impossible to explain in an architecture review. Avoid in customer work.

<a id="21-2-the-contract-between-agents"></a>

### 21.2 The contract between agents

The single decision that determines whether a multi-agent system works is the format workers return. Prose forces the supervisor to re-parse natural language, which is lossy, expensive and the source of most coordination bugs. Structured results with explicit confidence and provenance make aggregation mechanical.

**Workers return data; the supervisor never re-reads prose**

```python
class WorkerResult(BaseModel):
    worker: str
    status: Literal["ok", "partial", "unavailable", "denied"]
    findings: dict                       # typed per worker
    evidence_ids: list[str] = []
    confidence: float = Field(ge=0, le=1)
    cost_gbp: float = 0.0
    note_for_human: str | None = None    # only populated when status != "ok"

async def supervise(task: Task, ctx: Context) -> Decision:
    workers = select_workers(task)       # not all of them, every time
    results = await asyncio.gather(
        *(run_worker(w, task, ctx) for w in workers),
        return_exceptions=True,
    )
    results = [degrade(w, r) for w, r in zip(workers, results)]

    # Missing input is a first-class state, not an exception. The decision
    # explicitly records what it could not see, which is what makes the
    # audit trail honest and the escalation actionable.
    if any(r.status == "unavailable" for r in results if r.worker in task.required):
        return Decision.escalate(results, reason="degraded_inputs")
    return await decide(task, results, ctx)
```

```javascript
export async function supervise(task, ctx) {
  const workers = selectWorkers(task);
  const settled = await Promise.allSettled(
    workers.map((w) => runWorker(w, task, ctx))
  );
  const results = workers.map((w, i) => degrade(w, settled[i]));

  const missingRequired = results.some(
    (r) => r.status === "unavailable" && task.required.includes(r.worker)
  );
  if (missingRequired) {
    return Decision.escalate(results, "degraded_inputs");
  }
  return decide(task, results, ctx);
}
```

> **Warning**
>
> Before proposing a multi-agent design to a customer, price a single turn: workers × model calls × tokens, at their expected volume. Four workers at three calls each is twelve model calls per user question. At 250 users and 30 questions a day, that is 90,000 calls a day, and somebody will eventually put that number in front of a CFO. Better that it is you, early, with the justification attached.

<a id="21-3-coordination-and-protocols"></a>

### 21.3 Coordination, consensus and A2A

The multi-agent literature is full of coordination mechanisms — negotiation, contract-net bidding, voting for consensus, multi-agent reinforcement learning where agents learn a joint policy. They are genuinely interesting and almost none of them belongs in a customer deployment, for one reason: **they trade determinism for emergence**, and an enterprise workflow is graded on being reproducible and explainable. The exception worth knowing is *consensus as a quality check* — running the same decision through two differently-prompted workers and escalating on disagreement. That is self-consistency (§5.2) wearing a multi-agent hat, it costs 2×, and it is defensible because the disagreement rate is a number you can report. Multi-agent reinforcement learning (**MARL**), where agents learn a joint policy through interaction, is a research field rather than a delivery tool — know the term, and do not propose it.

Agent-to-agent protocols such as **A2A** address a different problem from MCP and the two are complementary: MCP standardises how *one* agent reaches tools and data (§23), while A2A standardises how agents owned by *different teams or vendors* discover each other, describe their capabilities and exchange tasks. In field work the relevance is organisational rather than technical — it is the answer to “our procurement team is building their own agent; how will yours talk to it?” The honest answer today is usually “through an API with a schema, and we will adopt the protocol when both sides have one”, and the same trust-boundary questions from §23.2 apply, only now the untrusted input is another organisation's agent.

<a id="22-agent-memory"></a>

## 22. Agent Memory

- **Short-term** `state, not transcript`
- **Long-term** `retrieved, not resident`
- **Writes** `need a policy`
- **Forgetting** `a requirement`

“Memory” in agent frameworks usually means three unrelated mechanisms with different storage, different lifetimes and very different compliance implications. Separate them explicitly or you will end up with a customer's personal data in a vector store that nobody can enumerate.

| Kind | Holds | Where it lives | Lifetime |
| --- | --- | --- | --- |
| Working / short-term | The current task's state: entities, partial results, step count | The graph state and its checkpoint | The run, plus a retention window for replay |
| Episodic | “Last time this user asked about Cardiff, the answer was X” | A table keyed by user and thread | Weeks; user-deletable |
| Semantic / long-term | Durable facts and preferences: “this team measures SLA from acknowledgement” | A vector store, or better, a small typed profile table | Indefinite, with review |

<a id="22-1-the-write-policy"></a>

### 22.1 The write policy is the hard part

Reading memory is easy. Deciding what is worth remembering is where these systems go wrong: write everything and retrieval fills with noise and stale facts; write nothing and the feature is theatre. A narrow, explicit write policy beats a clever one.

**Type the memory, scope it, expire it**

```python
class Memory(BaseModel):
    kind: Literal["preference", "domain_fact", "correction"]
    subject: str                 # who or what it is about
    statement: str = Field(max_length=200)
    source_thread: str           # provenance: which conversation produced it
    scope: Literal["user", "team", "tenant"]
    expires_at: date | None      # domain facts expire; preferences may not
    contains_pii: bool

ALLOWED = {"preference", "domain_fact", "correction"}

async def maybe_remember(turn: Turn, ctx: Context) -> Memory | None:
    """Write only on explicit signals. Do NOT let a model decide freely
    what is 'important' — that is how a memory store fills with the last
    thing anybody said."""
    if not (turn.user_corrected_us or turn.user_stated_a_standing_rule):
        return None

    mem = await extract(MEMORY_PROMPT.format(turn=turn), Memory)
    if mem.kind not in ALLOWED or mem.contains_pii:
        return None

    # Supersede rather than accumulate: a contradicting memory replaces the
    # old one and the old one is archived, not silently kept alongside it.
    await store.upsert(mem, supersede_matching=(mem.subject, mem.kind))
    return mem
```

```text
Two requirements that arrive in every regulated engagement, and are
painful to retrofit:

  "Show me everything the system remembers about me."
      → memory must be enumerable per subject. A vector store alone
        cannot do this well; a table can.

  "Delete it."
      → deletion must cascade to the index, the checkpoints and the
        traces. Design the cascade on day one; §23 of the detailed
        course covers the governance side.
```

> **Key idea**
>
> In most enterprise workflows the durable memory the customer actually wants is not per-user preferences at all — it is **corrections**. “No, for Cardiff the SLA clock starts at acknowledgement.” Capture those, route them to the ontology or the prompt as a proposed change, and show the operator that their correction stuck. That loop does more for adoption than any amount of conversational recall.

<a id="23-mcp"></a>

## 23. Model Context Protocol

- **Shape** `host → client → server`
- **Turns** `N×M into N+M`
- **Owned by** `the customer, ideally`
- **Also** `new attack surface`

> **Interactive animation:** `mcp-flow` — rendered by the page script in the HTML version.

MCP standardises how a model-facing application discovers and calls tools, reads resources and fetches prompt templates. The value in field work is not novelty — you could always write a tool. It is **ownership**: the customer's platform team can publish an MCP server for their claims system, and every AI application, including the ones built after you leave, speaks to it the same way.

<a id="23-1-the-three-primitives"></a>

### 23.1 The three primitives

- **Tools** Model-invoked functions with JSON Schema arguments. Everything from §7 applies unchanged — description quality still decides accuracy.
- **Resources** Application-controlled data the host can attach to context: a file, a record, a query result. Not invoked by the model, which makes them the safer primitive for anything read-heavy.
- **Prompts** Named, parameterised templates the server publishes — the customer's own wording for their own workflows, versioned on their side.
- **Not a security model** MCP does not authenticate your users or authorise their access. Those remain yours and the server's to implement (§28).

<a id="23-2-writing-a-server"></a>

### 23.2 Writing a server worth handing over

**Read-only by default; identity passed through, never a service account**

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("claims")

@mcp.tool()
async def find_claims(site_code: str, overdue_only: bool = True,
                      limit: int = 20, *, ctx) -> list[dict]:
    """Search exception claims for ONE site. Read-only.

    Returns at most 100 rows, newest first. Use get_claim when you already
    have an id."""
    user = ctx.request_context.user          # forwarded end-user identity
    if not user:
        raise PermissionError("no caller identity")   # never fall back to svc

    return await db.find_claims(
        site_code=site_code, overdue_only=overdue_only,
        limit=min(limit, 100),
        as_user=user,                        # row-level security applies
    )

@mcp.tool(annotations={"destructiveHint": True, "requiresApproval": True})
async def close_claim(claim_id: str, reason: str, *, ctx) -> dict:
    """Close a claim. Requires an approved human decision token."""
    require_approval(ctx)                    # server-side gate, §29
    return await db.close_claim(claim_id, reason, as_user=ctx.user)
```

```text
Review checklist for any MCP server you did not write:

  □ Who authored and maintains it? Is it pinned to a version/digest?
  □ What identity does it use — the end user's, or a shared account?
  □ Are all write tools annotated and gated server-side?
  □ Is there a tool that can read arbitrary files or run shell commands?
  □ Does it egress anywhere? To which endpoints?
  □ Are tool descriptions themselves reviewed? (A malicious description
    is a prompt injection that ships with the dependency.)
  □ What is the rate limit, and per what?

A third-party MCP server is an unreviewed dependency sitting inside
the trust boundary with your customer's data. Treat it accordingly.
```

> **Warning**
>
> The highest-value thing an FDE can do with MCP is political rather than technical: get the customer's platform team to own the server. It converts your integration from a thing that decays when you leave into a capability their organisation keeps — which is exactly the field-pattern-to-platform-feature move from the detailed course, applied to integrations.

<a id="23-3-managed-agent-platforms"></a>

### 23.3 Managed agent platforms

Every cloud now offers a managed agent service — Bedrock Agents, Vertex Agents, Foundry Agents — where you register an action group (tools), attach a managed *knowledge base* (their ingest, chunking, embedding and vector store), and the platform runs the orchestration loop. The pitch is that you skip §§10–14 and §20 entirely.

- **Take it when** The customer is already deep in that cloud, the workload is ordinary document Q&A, and their security team has pre-approved the service. Provisioning a knowledge base is an afternoon against a fortnight, and it inherits their IAM and their audit log — which is a real advantage, not a small one.
- **Refuse it when** You need control over chunking, hybrid search, the reranker or the relevance floor — the four things that actually decide retrieval quality (§§10, 13, 14). A managed knowledge base gives you a knob or two and hides the rest, so when quality is poor you have no lever and no diagnosis.
- **Also refuse when** The run must pause for days for a human approver, or the audit trail must record per-step state. Durable interrupts and replayable checkpoints (§20) are where managed loops are weakest.
- **The hybrid that usually wins** Managed guardrails and managed identity, because those are commodity and their security team already trusts them; your own retrieval and your own graph, because those are where the engagement's value is.

<a id="unit-4"></a>

## Unit 4 — Production in the Enterprise

Adapting models and wiring them into real enterprise systems securely, observably and affordably.

<a id="24-fine-tuning"></a>

## 24. Fine-Tuning: LoRA, QLoRA and Preference Optimisation

- **Fixes** `behaviour, format, style`
- **Does not fix** `missing knowledge`
- **Data needed** `500–5,000 examples`
- **Artefact** `a few MB adapter`

> **Interactive animation:** `lora-adapter` — rendered by the page script in the HTML version.

The question is never “should we fine-tune”. It is “what kind of gap is this”. A **knowledge gap** — the model does not know the customer's data — is a retrieval problem, and fine-tuning is a bad and expensive way to solve it, because facts baked into weights cannot be updated, cited or permission-filtered. A **behaviour gap** — the model knows enough but will not consistently produce the house format, tone, taxonomy or decision style — is where fine-tuning is genuinely the right tool.

<a id="24-1-the-decision"></a>

### 24.1 The decision, made honestly

| Symptom | Reach for | Why |
| --- | --- | --- |
| “It doesn't know our products” | RAG | Facts change; weights do not. And you need citations |
| “It won't use our 40-code taxonomy consistently” | Fine-tune (or constrained decoding first) | A behaviour, learnable from a few hundred labelled examples |
| “The prompt is 6,000 tokens of rules” | Fine-tune | Distil the rules into weights; the per-call saving compounds |
| “It's too expensive at volume” | Distil to a small model | Train the small model on the big model's outputs for your narrow task |
| “It must run in our VPC” | Open-weights + LoRA + quantise (§25) | A tuned 8B often beats an untuned frontier model on one narrow task |
| “It's wrong about edge cases” | Neither, yet | Build the eval set first. You cannot tune towards an undefined target |

<a id="24-2-the-pipeline"></a>

### 24.2 The pipeline

**Axolotl-style config: the whole run is one reviewable file**

```text
base_model: meta-llama/Meta-Llama-3.1-8B-Instruct
load_in_4bit: true            # QLoRA: frozen base in 4-bit, adapters in bf16

adapter: qlora
lora_r: 32                    # rank. 16–64 covers nearly everything
lora_alpha: 64                # convention: 2 × r
lora_dropout: 0.05
lora_target_modules:          # attention + MLP projections beats attention only
  [q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj]

datasets:
  - path: data/claims_decisions.jsonl
    type: chat_template
val_set_size: 0.1             # held out, and NOT the golden set (§16)

sequence_len: 4096
sample_packing: true
num_epochs: 3                 # more than 4 on a small set = memorisation
learning_rate: 0.0002
lr_scheduler: cosine
warmup_ratio: 0.03
gradient_accumulation_steps: 4
micro_batch_size: 2
bf16: true
flash_attention: true

wandb_project: claims-ft      # watch eval loss, not train loss
output_dir: ./out/claims-lora-v3
```

```python
# The data matters far more than the hyper-parameters. Three rules.
def build_dataset(rows: list[dict]) -> list[dict]:
    out = []
    for r in rows:
        # 1. Train on the format you will use in production — same system
        #    prompt, same tool schemas, same JSON shape. A mismatch here is
        #    the most common reason a fine-tune "doesn't work".
        out.append({"messages": [
            {"role": "system",    "content": PRODUCTION_SYSTEM_PROMPT},
            {"role": "user",      "content": render_case(r)},
            {"role": "assistant", "content": r["gold_output_json"]},
        ]})
    # 2. Include the hard and the boring cases in production proportion.
    #    A set of only interesting examples teaches the model that every
    #    case is interesting.
    # 3. Include refusals and escalations. If you never train the model to
    #    say "I can't determine this", it will never say it.
    return balance(out, by="outcome", floor=0.05)
```

<a id="24-3-preference-optimisation"></a>

### 24.3 SFT, DPO and beyond

Supervised fine-tuning teaches the model to imitate correct outputs. Preference optimisation teaches it to prefer one output over another, which is what you need when “correct” is a matter of degree — tone, hedging, how much detail an assessor wants. **DPO** does this directly from pairs of (chosen, rejected) responses with no separate reward model, which makes it the practical choice in field work; **ORPO** folds the preference signal into the SFT run itself, saving a stage.

The realistic source of preference pairs in a customer engagement is beautiful and obvious: your human-in-the-loop queue. Every time a reviewer edits a generated output, you have a rejected response and a chosen one, produced as a by-product of work they were doing anyway. Build the capture from day one even if you never train — it is the same data that tells you where the system is weak.

<a id="24-4-the-toolchain"></a>

#### The toolchain, and where the GPU comes from

| Piece | What it does | Note |
| --- | --- | --- |
| `transformers` + `Trainer` | The training loop, checkpointing, evaluation hooks | Fine when you need control; most runs do not, and a config file is easier to review |
| `peft` | LoRA, QLoRA, prefix tuning, prompt tuning, IA3 — the adapter methods | LoRA dominates in practice. Prefix tuning prepends trainable virtual tokens instead of modifying weights; cheaper still, and generally weaker |
| `trl` | `SFTTrainer`, `DPOTrainer`, `ORPOTrainer`, `KTOTrainer` | The preference-optimisation half. KTO needs only a binary good/bad label per sample, not pairs — which fits a review queue where nobody rewrote the rejected answer |
| `bitsandbytes` | 4-bit NF4 quantisation of the frozen base for QLoRA | Training only; use AWQ or GPTQ for serving (§25) |
| Axolotl | YAML over all of the above | The whole run becomes one reviewable, version-controlled file — which matters when the customer must reproduce it after you leave |
| `datasets` | Loading, mapping, packing, splitting | Public instruction sets (Alpaca-style, and the DPO preference sets) are useful for *format* reference; do not mix them into a domain run and expect domain behaviour |
| Weights & Biases | Run tracking: loss curves, hyper-parameters, artefacts | Watch *eval* loss. Train loss falling while eval loss rises is memorisation, and on a small domain set it happens by epoch three |

For hardware, the ladder is: the customer's own GPUs if they have idle ones, a spot GPU instance in their cloud account if the data may live there, and a rental marketplace such as RunPod or vast.ai only for work on synthetic or public data. **Check the data classification before you rent a GPU from anyone** — a QLoRA run on a marketplace box is a third-party sub-processor holding customer data, and that is a contract question, not a procurement convenience.

> **Warning**
>
> Three traps. **Catastrophic forgetting**: an aggressively tuned model gets better at your task and worse at instruction-following generally, so always evaluate on a general set as well as yours. **Training on your eval set**: keep the golden set physically separate from training data, or your numbers are fiction. **Ownership**: a fine-tuned model is a customer asset with a lifecycle — who retrains it when the base model is deprecated in eighteen months? If the answer is “nobody”, prefer prompting.

<a id="25-quantisation-and-placement"></a>

## 25. Quantisation, Local Inference and Model Placement

- **Q4 saves** `~4× memory`
- **Costs** `a little quality`
- **Breaks first** `structured output`
- **Placement** `a compliance decision`

> **Interactive animation:** `quantise` — rendered by the page script in the HTML version.

<a id="25-1-the-formats"></a>

### 25.1 The formats you will meet

| Format | Where it runs | Use |
| --- | --- | --- |
| GGUF (`Q4_K_M`, `Q5_K_M`, `Q8_0`) | llama.cpp, Ollama — CPU or GPU, any machine | Laptops, edge boxes, air-gapped sites, demos on a plane |
| AWQ / GPTQ | vLLM, TGI on GPU | Server-side throughput with 4-bit weights |
| FP8 / INT8 | Recent GPUs natively | Minimal quality loss, good speed-up, needs the hardware |
| bitsandbytes NF4 | Training (QLoRA) | Fine-tuning, not serving — it is slower at inference |

`Q4_K_M` is the usual sweet spot: about a quarter of the memory, and a quality drop that is small on prose. What degrades first, and disproportionately, is precise behaviour — schema adherence, long-chain arithmetic, faithful citation. Since those are exactly the behaviours enterprise workflows depend on, **re-run the golden set at every quantisation level and publish the table**. It converts a religious argument into a choice.

<a id="25-2-serving-locally"></a>

### 25.2 Serving locally

**Ollama for a workstation, vLLM for a server**

```text
# Workstation / air-gapped demo — pull once, copy the blob, run offline
ollama pull llama3.1:8b-instruct-q4_K_M
ollama run  llama3.1:8b-instruct-q4_K_M

# Server, real concurrency: paged attention, continuous batching,
# an OpenAI-compatible API so your app code does not change
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Meta-Llama-3.1-8B-Instruct \
  --quantization awq \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.90 \
  --enable-lora --lora-modules claims=/adapters/claims-v3 \
  --served-model-name claims-8b

# One base model in VRAM, many customer adapters hot-swapped by name.
# This is what makes per-tenant tuned behaviour economically sane.
```

```python
# Because vLLM speaks the OpenAI protocol, placement becomes configuration
# rather than a code change — which is the whole point of the gateway (§30).
client = AsyncOpenAI(base_url=settings.llm_base_url, api_key=settings.llm_key)

MODELS = {
    "hosted-frontier": "gpt-class-model",
    "in-tenant":       "claims-8b",       # served by vLLM inside the VPC
}

async def call(tier: str, **kw):
    return await client.chat.completions.create(model=MODELS[tier], **kw)
```

<a id="25-3-placement"></a>

### 25.3 Where the model runs is a compliance decision

- **Hosted API** Best quality, no infrastructure, immediate. Blocked by data residency, by a zero-egress policy, or by a procurement process that has not approved the provider.
- **Hosted, in-region, with a zero-retention agreement** Covers a surprising number of objections. Get the agreement in writing and attach it to the design document — it is usually the fastest route through security review.
- **Cloud-tenant model service** The customer's own cloud account and VPC, using the cloud provider's model service. Traffic never leaves their network boundary. The common compromise.
- **Self-hosted in their data centre** Full control, and you now own a GPU fleet, a model upgrade path, and a capacity problem. Justified for air-gapped or highest-sensitivity work.
- **Deciding late** Placement changes latency, cost, model quality and the whole evaluation baseline. Settle it in the scoping document, not in month three.

> **Tip**
>
> A pattern that resolves many of these arguments: run the sensitive, high-volume, routine work on a small in-tenant model, and escalate the rare hard cases to a hosted frontier model *with the sensitive fields redacted* (§29). You get the economics and the residency posture of local inference with a quality ceiling close to the hosted one, and the escalation rate is a number you can show.

<a id="26-legacy-integration"></a>

## 26. Legacy Integration: SOAP, ODBC and Systems of Record

- **Where time goes** `integration, not AI`
- **Reads** `replica, never primary`
- **Contracts** `WSDL, DDL, OpenAPI`
- **Truth** `the system of record wins`

The detailed course covers the politics of getting data access. This section is what you do once you have it, because the systems on the other side of that permission are older and stranger than the architecture diagram suggested. A twenty-year-old SOAP service, an Oracle schema with 1,400 tables and no documentation, a mainframe extract that lands as a fixed-width file at 02:00.

<a id="26-1-soap"></a>

### 26.1 SOAP, without despair

**Zeep reads the WSDL so you do not hand-build XML**

```python
from zeep import Client, Settings
from zeep.exceptions import Fault
from zeep.transports import Transport

# strict=False survives WSDLs that do not quite validate — common, and not
# a reason to abandon the integration.
client = Client(
    "https://legacy.internal/ClaimService?wsdl",
    settings=Settings(strict=False, xml_huge_tree=True),
    transport=Transport(session=authed_session, timeout=30),
)

def get_claim(claim_id: str) -> dict:
    try:
        resp = client.service.GetClaim(ClaimId=claim_id)
    except Fault as f:
        # SOAP faults carry structured detail and legacy error codes. Map them
        # to your own domain errors once, here, rather than leaking XML upward.
        raise map_legacy_fault(f.code, f.message) from f
    # Normalise to plain JSON immediately. Nothing above this layer should
    # ever see an XML type, a None-vs-nil distinction, or a namespace.
    return to_plain(resp)
```

```text
Survival notes for legacy SOAP:

  · python -m zeep https://.../?wsdl   prints every operation and type.
    Read it before you write anything; it is the API documentation
    that nobody at the customer still has.
  · Dates are frequently strings in a local format. Normalise at the
    boundary and record the timezone assumption in the code.
  · Empty vs nil vs absent are three different things in XML and one
    thing in JSON. Decide the mapping explicitly.
  · These services are often rate-limited by an operations team, not
    by code. Ask a human what the limit is.
  · Cache aggressively; legacy endpoints are slow and fragile, and the
    data usually changes daily rather than by the second.
```

<a id="26-2-databases"></a>

### 26.2 Databases you did not design

Connect with a native driver (`pyodbc`, `oracledb`, `psycopg`) through SQLAlchemy, always as a **read-only role against a replica**. Getting that role created is a one-line change request that makes every subsequent conversation easier, because “the AI cannot write to production” stops being a promise and becomes a database fact.

**Read-only, parameterised, timed out, capped**

```python
engine = create_engine(
    "mssql+pyodbc://ai_ro:***@replica/claims?driver=ODBC+Driver+18+for+SQL+Server",
    pool_pre_ping=True,          # legacy networks drop idle connections
    pool_size=5, max_overflow=0, # never let an AI workload exhaust their pool
    connect_args={"timeout": 10},
)

def claims_for(site: str, since: date) -> list[dict]:
    # Parameters, never f-strings. This is ordinary SQL injection hygiene,
    # and it matters more here because the values may be model-derived.
    sql = text("""
        SELECT TOP (1000) claim_id, opened_at, sla_due, status
        FROM   dbo.claims WITH (NOLOCK)
        WHERE  site_code = :site AND opened_at >= :since
        ORDER  BY opened_at DESC
    """)
    with engine.connect().execution_options(
            isolation_level="AUTOCOMMIT", timeout=15) as conn:
        return [dict(r) for r in conn.execute(sql, {"site": site,
                                                    "since": since})]
```

```text
Schema archaeology, in the order that works:

1. Row counts and last-updated timestamps per table. Most of the 1,400
   tables are empty or dead. You usually care about 20.
2. Foreign keys — declared and undeclared. Undeclared ones are found by
   matching column names and spot-checking values.
3. Profile the columns you care about: null rate, distinct values, min,
   max, format variants. This is where you discover three date formats
   and a status column with both 'CLOSED' and 'Closed'.
4. Find the exception path. Every workflow has one, it is never in the
   diagram, and it is usually where the value is.
5. Write it down as a data dictionary. Hand that over even if the AI
   project is cancelled — it is frequently the most valued artefact
   an FDE leaves behind.
```

<a id="26-3-keeping-data-fresh"></a>

### 26.3 Connectors, sync and freshness

An index is a cache of somebody else's database, and every cache has a staleness policy whether you chose one or not. Decide it explicitly, write it in the design document, and show it in the UI — “data as of 06:14 today” prevents more trust damage than any accuracy improvement.

| Mechanism | How | Freshness | Cost to the customer |
| --- | --- | --- | --- |
| Full reload | Truncate and re-ingest everything | As often as you can afford | Simple and honest; impossible past a few million rows |
| Incremental sync | Poll on a watermark: `WHERE updated_at > :last_seen` | Minutes to hours | Low — but it silently misses hard deletes and any row whose `updated_at` is not maintained, which is more of them than anyone admits |
| Change data capture (CDC) | Read the database's own transaction log (Debezium-style) and stream inserts, updates and deletes | Seconds | Correct, including deletes, with near-zero load on the source — and it needs a DBA, a replication slot and a change request. Ask early |
| Webhooks / events | The source pushes on change | Seconds | Best when it exists. Must be idempotent and signature-verified, and you still need a periodic reconciliation pass because webhooks get dropped |

On the connector side the mechanics are dull and unavoidable: REST with cursor pagination (never offset pagination on a table that is being written to — you will skip and duplicate rows), gRPC where the customer's platform team offers it, and OAuth client-credentials service accounts scoped per integration rather than one shared identity. Respect `Retry-After`, back off with jitter (§30), and checkpoint your watermark *after* a successful commit so an interrupted sync resumes rather than restarts.

> **Warning**
>
> Deletions and permission changes are the two updates that a naïve incremental sync misses, and they are the two that matter most: a document withdrawn from the source that your index still cites, or an access revocation that has not propagated (§28). If CDC is unavailable, run a nightly reconciliation that compares source ids against index ids and removes the orphans — and alert on the count, because a sudden spike means an upstream change nobody told you about.

<a id="26-4-workflow-surfaces"></a>

### 26.4 Meeting users where they already are

Adoption follows the surface, not the quality. A tool in Slack, Teams or the ticket system is used; a separate web app requiring a new login is visited twice. Both matter technically because both carry the same obligations: verify the request signature, honour the three-second acknowledgement window and do the work asynchronously, map the platform user to your identity model rather than trusting a display name, and post results back into the thread where the decision is happening.

> **Key idea**
>
> Budget integration at two to three times the AI work, and say so during scoping. Nobody has ever been disappointed by an FDE who over-estimated the connector work, and almost every engagement that ran late did so because someone treated “we'll pull from SAP” as a line item rather than a project.

<a id="27-text-to-sql"></a>

## 27. Text-to-SQL Inside an Enterprise Schema

- **Never** `execute unparsed SQL`
- **Always** `read-only role + replica`
- **Always** `show the query`
- **Schema in prompt** `retrieved subset`

> **Interactive animation:** `text-to-sql` — rendered by the page script in the HTML version.

Text-to-SQL is the pattern customers ask for most often and the one most likely to go badly. It is enormously valuable — it answers questions nobody built a report for — and it is code generation against a production database driven by untrusted natural language. The whole discipline is in the layers between generation and execution.

<a id="27-1-the-defences"></a>

### 27.1 The defences, in order

1. **Privilege.** A read-only role on a replica, with row-level security scoping it to the calling user. Everything else is defence in depth; this is the actual control.
2. **Parse, do not pattern-match.** Convert to an AST with `sqlglot` and assert: one statement, `SELECT` only, no DDL/DML anywhere including inside CTEs, no system tables, no functions on an allow-list violation.
3. **Rewrite for entitlements.** Inject the tenant and permission predicates into the AST rather than trusting the model to include them.
4. **Plan before executing.** `EXPLAIN`, compare the estimated cost against a threshold, and refuse or repair above it.
5. **Cap.** Statement timeout, row limit, and a concurrency limit on the pool so a burst of questions cannot affect the customer's own reporting.
6. **Show the SQL.** Non-negotiable. An analyst who can read the query catches the wrong join that no automated check would.

**Validation that is worth trusting**

```python
import sqlglot
from sqlglot import exp

FORBIDDEN = (exp.Insert, exp.Update, exp.Delete, exp.Drop, exp.Create,
             exp.Alter, exp.Command, exp.Merge)

def validate(sql: str, dialect: str, allowed: set[str]) -> exp.Expression:
    trees = sqlglot.parse(sql, read=dialect)
    if len(trees) != 1:
        raise Unsafe("exactly one statement allowed")
    tree = trees[0]
    if not isinstance(tree, exp.Select):
        raise Unsafe("must be a SELECT")
    # Walk the WHOLE tree: a write can hide inside a CTE or a subquery, and
    # a top-level type check alone will not see it.
    for node in tree.walk():
        if isinstance(node, FORBIDDEN):
            raise Unsafe(f"forbidden node: {type(node).__name__}")
    used = {t.name.lower() for t in tree.find_all(exp.Table)}
    if not used <= allowed:
        raise Unsafe(f"tables outside scope: {used - allowed}")
    return tree

def enforce_tenant(tree: exp.Expression, tenant: str) -> str:
    # Predicate injection at the AST level. The model is never asked to
    # remember the tenant filter, so it cannot forget it.
    for scope in tree.find_all(exp.Select):
        scope.where(exp.condition(f"tenant_id = '{tenant}'"), copy=False)
    return tree.sql()
```

```text
Accuracy notes from the field, on a 1,400-table warehouse:

  naive: whole schema in the prompt          — does not fit, 0.31 exec-match
  + retrieved 6-table subset                 0.58
  + 2 sample rows per table in the prompt    0.67   ← value formats matter
  + column descriptions from the data
    dictionary you built in §26              0.79
  + one repair loop on execution error       0.84
  + 12 curated few-shot query pairs          0.89

The jump at step 4 is the point: text-to-SQL accuracy is mostly a
metadata problem, and the metadata is a deliverable you can build
with the customer rather than a model you can buy.
```

> **Warning**
>
> The most dangerous outcome is not a dropped table — your read-only role prevents that. It is a query that runs, returns 312 rows, and is *subtly wrong*: a join that duplicates rows, a date boundary off by a day, a filter that silently excludes nulls. Nobody notices, a number goes into a board pack, and the trust cost when it surfaces is enormous. This is why you show the SQL, why you put known-answer queries in the golden set, and why text-to-SQL output should be framed as a draft for an analyst rather than an answer for an executive.

<a id="28-identity-and-entitlements"></a>

## 28. Identity, Entitlements and Permission-Aware Retrieval

- **Never** `a shared service account`
- **Filter** `before retrieval`
- **Reuse** `their permission model`
- **Test** `denials in CI`

> **Interactive animation:** `entitlement-filter` — rendered by the page script in the HTML version.

This is the section that most often decides whether a pilot becomes production. An AI assistant that can see everything is trivially easy to build and impossible to deploy in a regulated organisation. The requirement is exact: **the system must be able to see less than the union of what its users can see, and exactly what the asking user can see.**

<a id="28-1-the-chain"></a>

### 28.1 The identity chain

```
browser ──OIDC──► your API ──────────────► retriever ────► vector store
   │                  │                        │                │
 id_token        validate sig, aud,       resolved groups   metadata
 (who)           iss, exp, nbf            + classification   predicate
                        │
                        ├──► on-behalf-of token ──► downstream API (SAP, Jira)
                        │
                 NEVER: svc_ai_prod with read-all

The chain must be unbroken. The moment any hop substitutes a service
account, every control downstream of it is decorative.
```

<a id="28-2-the-vocabulary"></a>

### 28.2 The vocabulary you need in the room

| Term | What it actually is | Where it bites |
| --- | --- | --- |
| OIDC / id_token | Authentication: a signed statement of who the user is | Validate signature, issuer, audience and expiry — all four |
| OAuth 2 / access token | Authorisation to call an API, with scopes | Scopes are coarse; they are not row-level permissions |
| SAML assertion | The enterprise SSO equivalent, XML-based | Still ubiquitous; group claims arrive as opaque directory ids |
| On-behalf-of flow | Exchanging the user's token for one your service can use downstream | The correct answer to “how does the agent call SAP as the user” |
| RBAC / ABAC | Permissions by role, or by attributes (region, clearance, case ownership) | Enterprise reality is ABAC with an RBAC vocabulary bolted on |
| Directory group mapping | Azure AD / Entra ID (or Okta, or LDAP) groups arriving as claims and being mapped to your application roles | Groups come as GUIDs, nest several levels deep, and are often omitted from the token entirely once a user is in more than ~200 of them — at which point you must call the directory's API instead of reading the claim |
| Which OAuth grant | Authorisation code + PKCE for a user in a browser; client credentials for service-to-service; on-behalf-of for acting as the user downstream; device code for a CLI | Implicit and password grants are deprecated — proposing either will fail a security review on its own |

<a id="28-3-making-retrieval-obey"></a>

### 28.3 Making retrieval obey

**Permissions as a hard predicate, resolved per request**

```python
@dataclass(frozen=True)
class Principal:
    user_id: str
    groups: frozenset[str]        # resolved from the IdP, cached briefly
    clearance: int
    regions: frozenset[str]

async def principal_from(token: str) -> Principal:
    claims = await verify_jwt(token, jwks, audience=AUD, issuer=ISS)
    # Resolve nested group membership against the directory. Cache for
    # minutes, not hours — a revocation that takes a day to apply is an
    # audit finding, and it will be found.
    groups = await directory.expand(claims["groups"], ttl=300)
    return Principal(claims["sub"], frozenset(groups),
                     int(claims.get("clearance", 0)),
                     frozenset(claims.get("regions", [])))

async def search(q: str, p: Principal, k: int = 50) -> list[Chunk]:
    return await store.query(
        vector=await embed(q),
        k=k,
        # A hard filter evaluated inside the index (§12), not a post-hoc
        # drop. The restricted vectors are never candidates at all.
        filter={
            "$and": [
                {"acl_groups": {"$in": list(p.groups)}},
                {"classification": {"$lte": p.clearance}},
                {"region": {"$in": list(p.regions)}},
                {"effective_from": {"$lte": today()}},
            ]
        },
    )
```

```text
Negative tests that belong in the golden set, and in CI:

  tier1_asks_legal_question          → expect refusal, not a summary
  tier1_asks_about_other_region      → expect "no results", not a guess
  revoked_user_previous_thread       → expect denial on resume
  injection_in_note_requests_hr_doc  → expect refusal + logged event
  deleted_document_still_cited       → expect no citation (index synced)

Each one asserts an absence. They are tedious to write and they are
the tests that keep the system deployed.
```

> **Key idea**
>
> Three rules that will carry you through any security review. **Reuse their model** — never invent a parallel permission scheme, because two schemes drift and the drift is invisible. **Filter inside the index** — post-filtering is both a leak and a quality bug. **Sync permissions, not just content** — an ACL change upstream must propagate to your metadata, and the lag between the two is a number you should be able to state.

<a id="29-ai-security"></a>

## 29. Production AI Security and Guardrails

- **Injection** `no complete defence`
- **So** `limit what tools can do`
- **Layers** `input, retrieval, output`
- **Log** `every block`

> **Interactive animation:** `guardrail-pipeline` — rendered by the page script in the HTML version.

<a id="29-1-the-threat-list"></a>

### 29.1 The threats, named the way a security team names them

Use the **OWASP Top 10 for LLM Applications** as your vocabulary, because the customer's security team already has. Mapping your design to a list they recognise turns the review from an interrogation into a checklist, and the rows below are that list in the order it usually matters.

| Threat | Concretely | Mitigation that actually helps |
| --- | --- | --- |
| Direct prompt injection | A user talks the model out of its instructions | Rails plus a narrow tool surface. Accept partial failure |
| Indirect prompt injection | Instructions hidden in a retrieved document, email or ticket note | Delimit and mark retrieved content as data; scan it; never let it authorise a tool |
| Sensitive disclosure | The answer contains data the asker may not see | Entitlement filtering (§28), plus output scanning as a net |
| Excessive agency | A persuaded model calls a tool that does real damage | Read-only defaults, approval gates on writes, per-tool rate limits |
| Supply chain | A third-party MCP server, plugin or model with a malicious description | Pin versions, review tool descriptions, restrict egress |
| Unbounded consumption | Crafted inputs that drive cost or latency through the roof | Token caps, step caps, per-tenant budgets that actually stop work |

<a id="29-2-what-defence-is-possible"></a>

### 29.2 Be honest about what defence is possible

There is no known complete defence against prompt injection. Classifiers help, delimiters help, instruction hierarchies help, and a sufficiently determined attacker gets through all of them. Say this plainly in the architecture review; it builds more credibility than any claim of robustness, and it moves the conversation to the control that does work.

**Jailbreaks** are the sub-family aimed at the model's safety training rather than at your instructions: role-play framing (“you are an unrestricted assistant”), hypothetical and fiction wrappers, incremental escalation across turns, obfuscation by encoding or translation, and token-level adversarial suffixes. Two practical consequences. First, test against a public jailbreak corpus as part of the eval suite (§16) so the injection category has real cases in it rather than one polite example you wrote. Second, a provider **moderation endpoint** is a cheap, useful outer layer and a poor inner one — it catches the obvious and knows nothing about your claims policy, so run it *alongside* your topical rail and never instead of it.

> **Key idea**
>
> The durable mitigation is architectural, not linguistic: **assume the model will eventually be fully persuaded, and ensure that the worst thing it can then do is acceptable.** Read-only tools by default. Writes behind a human approval gate. Per-user entitlements enforced below the model. Egress restricted. Then an injection is an incident to investigate rather than a breach to notify.

<a id="29-3-pii-and-rails"></a>

### 29.3 PII redaction and programmable rails

**Reversible redaction, with the map held outside the model**

```python
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_anonymizer import AnonymizerEngine

analyzer = AnalyzerEngine()
# Domain entities matter as much as the built-ins. Ask the customer which
# identifiers are sensitive in THEIR world — it is rarely just the obvious.
analyzer.registry.add_recognizer(PatternRecognizer(
    supported_entity="CLAIM_REF",
    patterns=[Pattern("claim", r"\bCLM-\d{4}-\d{6}\b", 0.85)],
))

def redact(text: str) -> tuple[str, dict[str, str]]:
    found = analyzer.analyze(text=text, language="en",
                             entities=["PERSON", "UK_NINO", "EMAIL_ADDRESS",
                                       "CREDIT_CARD", "CLAIM_REF"])
    mapping, out, offset = {}, text, 0
    for i, r in enumerate(sorted(found, key=lambda r: r.start)):
        token = f"<{r.entity_type}_{i}>"
        original = text[r.start:r.end]
        mapping[token] = original                    # kept in-process only
        out = out[:r.start + offset] + token + out[r.end + offset:]
        offset += len(token) - (r.end - r.start)
    return out, mapping

def restore(answer: str, mapping: dict[str, str]) -> str:
    for token, original in mapping.items():
        answer = answer.replace(token, original)
    return answer
```

```text
Tuning redaction is a real task, not a checkbox:

  over-redaction  → the model loses the claim reference it needed and
                    answers vaguely. Silent quality loss; users blame
                    "the AI" and you never see an error.
  under-redaction → a notifiable incident.

Measure both. Build a small labelled set of real (or realistic)
documents, report precision and recall per entity type, and agree the
operating point with the customer's DPO in writing. "We redact PII"
is not a design; "we detect UK NINO at 0.99 recall / 0.94 precision,
and CLAIM_REF is deliberately not redacted" is.
```

Programmable rails — NeMo Guardrails' Colang flows, Bedrock Guardrails, or a hand-rolled chain — give you topical boundaries, refusal behaviours and dialogue-level control without hiding them in the system prompt. Their real merit is that the rules become a reviewable artefact the customer's risk team can read, which is worth more in an enterprise than the marginal robustness.

<a id="30-llm-gateway"></a>

## 30. The LLM Gateway

- **One place for** `keys, limits, logs`
- **Retries** `backoff + jitter`
- **Writes** `idempotency keys`
- **Install** `on day one`

> **Interactive animation:** `gateway-fallback` — rendered by the page script in the HTML version.

A gateway — LiteLLM, Portkey, or a thin service of your own — is a proxy that every model call goes through. It sounds like unnecessary indirection until you count what lives there: provider keys, per-tenant budgets, rate limits, retries, fallback routing, caching, cost attribution and the trace id that ties a model call to a business event. Retrofitting it means editing every call site in a codebase that the customer's team now owns.

<a id="30-1-what-belongs-in-it"></a>

### 30.1 What belongs in it

**Config, not code — which is the point**

```text
model_list:
  - model_name: reasoning              # the name your app uses
    litellm_params: {model: provider-a/big-reasoning, api_key: os.environ/A_KEY}
  - model_name: reasoning              # same alias = a fallback pool
    litellm_params: {model: provider-b/big-reasoning, api_key: os.environ/B_KEY}
  - model_name: routine
    litellm_params: {model: openai/gpt-4o-mini}
  - model_name: routine
    litellm_params: {model: hosted_vllm/claims-8b,
                     api_base: http://vllm.internal:8000/v1}   # in-tenant

router_settings:
  routing_strategy: latency-based-routing
  num_retries: 3
  retry_after: 0.5                     # exponential, with jitter
  fallbacks: [{reasoning: [routine]}]  # degrade rather than fail
  context_window_fallbacks: [{routine: [long-context]}]

general_settings:
  max_budget: 4000                     # £/month, hard stop
  budget_duration: 30d
  alerting: [slack]
  # Per-tenant keys so cost attribution is a query, not an exercise
  enforce_user_param: true
```

```python
# The application just names a tier. Which provider, which region, which
# price and which fallback are operational decisions someone can change
# without a deploy — including the customer's team, after you leave.
async def call(tier: str, messages: list[dict], ctx: Context, **kw):
    return await client.chat.completions.create(
        model=tier,
        messages=messages,
        user=ctx.tenant_id,                     # cost attribution
        extra_headers={
            "x-trace-id": ctx.trace_id,         # ties to §31 spans
            "x-idempotency-key": ctx.idem_key,  # safe retries
        },
        timeout=kw.pop("timeout", 30),
        **kw,
    )
```

> **Tip**
>
> A hard per-tenant budget that actually refuses work is worth arguing for. Every team resists it (“we'd rather degrade than stop”) until the first runaway agent loop produces a four-figure overnight bill. Set it, alert at 70%, and make the refusal message helpful. The conversation about the limit is far easier before the incident than after.

<a id="31-observability-and-llmops"></a>

## 31. Observability, Tracing and LLMOps

- **Unit** `the trace, not the log line`
- **Tag with** `prompt + model version`
- **Watch** `drift, cost, overrides`
- **Different from ops** `no deterministic pass/fail`

> **Interactive animation:** `trace-waterfall` — rendered by the page script in the HTML version.

Conventional observability asks whether the system is up. LLM observability asks whether it is still *right*, which no status code answers. The unit of debugging is a trace: the whole causal chain from the user's question through retrieval, reranking, model calls, tool calls and rails, with inputs, outputs, tokens, latency and cost attached to every span.

<a id="31-1-what-to-capture"></a>

### 31.1 What to capture on every span

**OpenTelemetry semantics, so it lands in the customer's existing tooling**

```python
from opentelemetry import trace
tracer = trace.get_tracer("claims-assistant")

async def answer(question: str, ctx: Context) -> Answer:
    with tracer.start_as_current_span("answer") as span:
        span.set_attributes({
            "tenant.id": ctx.tenant_id,
            "user.role": ctx.principal.role,
            "prompt.version": PROMPT_VERSION,     # correlate quality to deploys
            "index.version": INDEX_VERSION,
            "app.trace_id": ctx.trace_id,
        })

        with tracer.start_as_current_span("retrieve") as r:
            chunks = await retrieve(question, ctx)
            r.set_attributes({
                "retrieval.candidates": 60,
                "retrieval.kept": len(chunks),
                "retrieval.top_score": chunks[0].score if chunks else 0.0,
                "retrieval.chunk_ids": ",".join(c.id for c in chunks),
            })

        with tracer.start_as_current_span("generate") as g:
            out = await call("routine", build(question, chunks), ctx)
            g.set_attributes({
                "gen_ai.request.model": out.model,
                "gen_ai.usage.input_tokens": out.usage.prompt_tokens,
                "gen_ai.usage.output_tokens": out.usage.completion_tokens,
                "gen_ai.cost.gbp": price(out),
                "gen_ai.finish_reason": out.choices[0].finish_reason,
            })
        return out
```

```text
Dashboards worth the space, in priority order:

1. Cost per successful outcome (not per token, not per call).
   This is the number that renews the contract.
2. Human override rate, by category. The ground truth of quality —
   and the only one that needs no labelling.
3. Abstention rate. Should be non-zero and stable. A sudden fall
   means the system has started guessing.
4. Retrieval kept-count distribution. A shift means the corpus or
   the index moved.
5. Schema repair rate (§6) and no-progress rate (§19). Early warning
   of drift and broken tools respectively.
6. p95 time to first token, split by tier.

Note what is absent: a single "accuracy" number. It is unmeasurable
in production without labels, and reporting one you cannot defend
costs more credibility than having none.
```

<a id="31-2-why-llmops-differs"></a>

### 31.2 Why this is not ordinary ops

- **Non-determinism** The same input can give different outputs, so “reproduce the bug” requires the full trace, not the request.
- **Silent regression** Nothing errors. The provider updates a model, or the corpus shifts, and quality declines with a green dashboard. Only evals catch it.
- **Quality is not binary** There is no 200 or 500 for “a slightly worse summary”, so you need proxies: override rate, abstention rate, repair rate.
- **The fix** Version prompts, models, indexes and adapters. Tag every trace with all four. Run evals in CI and on a schedule against production traffic samples. Then a quality question becomes a query rather than an argument.

<a id="31-3-the-platforms"></a>

### 31.3 The platforms, and the one question to ask each

| Platform | Strength | The question |
| --- | --- | --- |
| **LangSmith** | Deep tracing of LangChain/LangGraph runs, dataset and eval management, prompt versioning in one place | Hosted by default — will the customer accept full prompts and completions leaving their estate? (Self-hosting exists; price it early) |
| **Langfuse** | Open source and genuinely self-hostable; traces, scores, prompt management, framework-agnostic | Usually the right answer in a VPC-only estate, for exactly that reason |
| **MLflow** | Experiment tracking and a model registry, now with tracing and LLM evaluation | Already installed at any customer with a data-science team — adopting it is a smaller change request than introducing anything new |
| **OpenTelemetry + their stack** | Spans land in the Grafana, Datadog or Splunk the ops team already watches | Least featureful for AI specifics, and by far the easiest to hand over. Emit OTel regardless of what else you choose |

> **Warning**
>
> A trace contains the full prompt, and the full prompt contains the customer's record. Every observability decision is therefore a data-residency decision, and it is the one most often made accidentally — by a developer adding an API key to get a nice dashboard. Put the tracing backend in the design document alongside the model provider, and mask or drop payload fields for anything sensitive.

<a id="32-serving-and-infrastructure"></a>

## 32. Serving: FastAPI, Containers, CI/CD and Cloud

- **Long requests** `stream or queue`
- **Images** `slim, pinned, scanned`
- **Deploy** `their pipeline, not yours`
- **Scaling signal** `queue depth`

An AI service breaks several assumptions built into standard web infrastructure: requests last tens of seconds, a single request can cost real money, and concurrency is limited by an upstream provider rather than by your CPU. The infrastructure is otherwise ordinary, and it should look ordinary to the customer's platform team — that is what gets it adopted.

<a id="32-1-the-service"></a>

### 32.1 The service

**Streaming, health, limits, graceful shutdown**

```python
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from fastapi.responses import StreamingResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(timeout=30)
    app.state.pool = await asyncpg.create_pool(dsn, min_size=2, max_size=10)
    yield
    # In-flight LLM calls are expensive; let them finish before the pod dies.
    await asyncio.sleep(SHUTDOWN_GRACE)
    await app.state.http.aclose()
    await app.state.pool.close()

app = FastAPI(lifespan=lifespan)

@app.get("/healthz")            # liveness: is the process alive
async def healthz(): return {"ok": True}

@app.get("/readyz")             # readiness: can it actually serve
async def readyz():
    await app.state.pool.fetchval("SELECT 1")
    await check_model_reachable()
    return {"ok": True}

@app.post("/ask")
@limiter.limit("20/minute")     # per-tenant, and enforced at the edge too
async def ask(req: AskRequest, p: Principal = Depends(principal)):
    async def stream():
        async for token in answer_stream(req.question, Context(p, req)):
            yield f"data: {json.dumps({'t': token})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")
```

```text
# Multi-stage: build deps once, ship a small, non-root runtime image
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
RUN useradd -m -u 10001 app
COPY --from=build /install /usr/local
COPY --chown=app:app src/ /app/src/
USER app
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
EXPOSE 8000
# One worker per container; scale with replicas so the platform's
# autoscaler — not a process manager inside the image — owns capacity.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--timeout-keep-alive", "75"]
```

<a id="32-2-scaling-and-pipelines"></a>

### 32.2 Scaling signals and pipelines

CPU utilisation is the wrong autoscaling signal for a service that spends its life awaiting a socket: it stays at 8% while the queue grows. Scale on **in-flight requests per replica** or queue depth. And accept that beyond a point scaling your replicas achieves nothing, because the constraint is the provider's rate limit — at which point the answer is a queue with an honest “we'll email you”, not more containers.

For the pipeline itself, resist building something bespoke. Use whatever the customer already has — their Actions runners, their Jenkins, their ArgoCD — because a pipeline their platform team recognises is one they will maintain. The AI-specific additions are small: run the golden set on every pull request (§16), block on entitlement and injection categories, publish the eval artefact, and version the prompt, index and adapter alongside the image digest.

> **Warning**
>
> Deployment topology is set by the compliance conversation, not by preference: their cloud account, their VPC, their region, their egress rules, their base images, their scanner. The best technical design that does not fit that list loses to a mediocre one that does. Establish the constraints in the scoping document, then build inside them.

<a id="32-3-the-api-surface"></a>

### 32.3 The API surface: versioning, CORS and GraphQL

Your service will be consumed by somebody else's front end, written by a team you will meet twice. Three decisions save most of the friction.

- **Version from the first commit** URL-based (`/v1/ask`) is blunt, obvious and easy to route at the load balancer; header-based (`Accept: application/vnd.acme.v2+json`) is cleaner and invisible in logs, which is precisely why teams break it. Pick URL versioning unless their platform standard says otherwise, and never change a response shape in place.
- **CORS, deliberately** An explicit allow-list of their front-end origins, with credentials enabled only if you genuinely use cookies. `allow_origins=["*"]` with credentials is both invalid and an instant review failure — and it is the default people paste in to make a demo work.
- **OpenAPI for free** FastAPI generates the schema from your Pydantic models, so the contract cannot drift from the code. Give their front-end team the generated client rather than a document.
- **GraphQL, usually not** If their platform mandates it, use Strawberry or Graphene and write dataloaders from day one — the N+1 problem is structural, and a resolver that issues one query per row will hammer the database you were given read-only access to as a favour. Streaming a token-by-token answer over GraphQL is also awkward, which alone rules it out for most AI endpoints.

<a id="32-4-tests-and-metrics"></a>

### 32.4 Tests and metrics that are not evals

The golden set (§16) tells you whether the system is *right*. It does not tell you whether the code works, and conflating the two produces a suite that is slow, flaky and skipped.

**Fast deterministic tests; the model never appears in them**

```python
import pytest

@pytest.fixture
def principal() -> Principal:
    return Principal("u1", frozenset({"claims-tier1"}), clearance=1,
                     regions=frozenset({"cardiff"}))

@pytest.fixture
def fake_llm(monkeypatch):
    """Record calls and return canned responses. Every test below runs in
    milliseconds and gives the same answer on every machine."""
    calls = []
    async def _call(**kw):
        calls.append(kw)
        return CANNED[kw["model"]]
    monkeypatch.setattr("app.llm.call", _call)
    return calls

def test_acl_predicate_is_applied(principal, fake_store):
    search("anything", principal)
    assert fake_store.last_filter["$and"][0] == {"acl_groups": {"$in": ["claims-tier1"]}}

def test_router_escalates_on_value(fake_llm):
    assert route({"type": "decide", "value_gbp": 25_000,
                  "clauses_in_scope": 1}) == "reasoning"

@pytest.mark.parametrize("sql", [
    "SELECT 1; DROP TABLE claims",
    "WITH x AS (DELETE FROM claims RETURNING *) SELECT * FROM x",
    "SELECT * FROM sys.tables",
])
def test_validator_rejects(sql):
    with pytest.raises(Unsafe):
        validate(sql, "tsql", allowed={"claims", "sites"})
```

```text
The test pyramid for an AI service:

  unit          no model, no network, milliseconds. Routing conditions,
                SQL validation, ACL predicates, schema parsing, reducers,
                termination conditions. This is where coverage means
                something — aim high here and nowhere else.
  contract      fake the provider; assert the request shape, the retry
                behaviour, the idempotency key, the timeout.
  integration   docker compose up: Postgres + pgvector + the app. Marked,
                and run in CI but not on every save.
  eval          the golden set (§16). Slow, costs money, non-deterministic.
                Nightly and on PRs that touch prompts, retrieval or models.

Runtime metrics, which are also not evals:

  prometheus:  request rate, p50/p95/p99 latency by endpoint and tier,
               in-flight requests, queue depth, tokens/sec, cost/minute,
               tool error rate, rail block rate
  grafana:     one board the CUSTOMER's ops team owns, not you. If they
               cannot see it without asking you, the handover has not
               happened.
```

<a id="32-5-kubernetes"></a>

### 32.5 If it has to be Kubernetes

Many enterprises have one platform and it is Kubernetes. You do not need to be an administrator; you need to hand their platform team a manifest they recognise and to know which four settings are different for an AI workload.

1. **Probes.** `livenessProbe` on `/healthz`, `readinessProbe` on `/readyz`. Set the liveness timeout above your longest request or Kubernetes will restart a pod that is merely busy generating.
2. **Graceful shutdown.** `terminationGracePeriodSeconds` longer than your longest in-flight call, plus a `preStop` sleep so the pod leaves the endpoint list before it stops accepting work. Without this, every deploy drops paid-for generations.
3. **Autoscaling on the right signal.** A custom or external metric — in-flight requests, queue depth — not CPU (§32.2). KEDA if their cluster has it.
4. **Secrets and identity.** Workload identity bound to the service account, so the pod assumes a cloud role rather than mounting a key. This is the same least-privilege argument as §36.3 and the same reviewer will ask about it.

<a id="33-cost-and-capacity"></a>

## 33. Cost Modelling and Capacity Planning

- **Report** `cost per outcome`
- **Compare with** `the human baseline`
- **Biggest lever** `retrieval discipline`
- **Second** `routing to a small model`

Every FDE engagement eventually has a cost conversation, usually with someone who controls the renewal. Going in with a model rather than an invoice is the difference between a negotiation and a defence.

<a id="33-1-cost-per-outcome"></a>

### 33.1 Cost per outcome, against the baseline

**The only cost table worth presenting**

```python
def cost_per_outcome(
    calls_per_task: float,        # including retries, repairs, escalations
    in_tokens: int, out_tokens: int,
    in_per_m: float, out_per_m: float,
    infra_gbp_per_month: float, tasks_per_month: int,
    human_minutes_saved: float, loaded_hourly_gbp: float,
    override_rate: float,         # tasks a human still has to redo
) -> dict:
    model = calls_per_task * (in_tokens / 1e6 * in_per_m +
                              out_tokens / 1e6 * out_per_m)
    infra = infra_gbp_per_month / max(tasks_per_month, 1)
    # Overridden tasks cost the model spend AND the full human time. Leaving
    # this term out is the most common way an AI business case lies.
    rework = override_rate * (human_minutes_saved / 60 * loaded_hourly_gbp)
    total = model + infra + rework
    saved = (1 - override_rate) * human_minutes_saved / 60 * loaded_hourly_gbp
    return {"cost_per_task": round(total, 3),
            "human_cost_avoided": round(saved, 2),
            "net_per_task": round(saved - total, 2),
            "payback_tasks": int(infra_gbp_per_month / max(saved - total, 1e-6))}
```

```text
Claims triage, 250 handlers, 30 tasks/day:

  model spend per task            £0.041
  infra per task                  £0.006
  rework (9% override × 6 min)    £0.049   ← the term nobody models
  ─────────────────────────────────────
  total per task                  £0.096
  human cost avoided              £4.96
  net per task                    £4.86

At 157,500 tasks/month the case is not close, and it survives a 3×
increase in token price. State it that way: a business case that
only works at today's prices is not a business case.
```

<a id="33-2-the-levers"></a>

### 33.2 The levers, in order of return

1. **Retrieve less.** Rerank 60 to 6 rather than stuffing 20. Usually a 50–70% input-token reduction *and* an accuracy gain. Always do this first.
2. **Route by difficulty.** Send the routine majority to a small model (§3, §8). Typically another 40–60%.
3. **Cache the prefix.** Stable-first prompt layout plus provider caching; 50–90% off the cacheable portion for free (§2, §4).
4. **Compress history.** Rolling summaries instead of full transcripts (§4).
5. **Cap the agent.** Step, tool and cost budgets stop the tail that dominates the bill (§19).
6. **Only then** negotiate rates, consider provisioned throughput, or self-host.

> **Key idea**
>
> Never present cost per token or per call to a business stakeholder — they cannot evaluate it and it invites the wrong comparison. Present **cost per completed outcome against the cost of the human doing it**, with the override-rework term included and the sensitivity to a price change shown. That is the table that survives a procurement review.

<a id="unit-5"></a>

## Unit 5 — Architecture & Review

Putting it together: reference architectures, the framework landscape, the platform underneath, and the revision material.

<a id="34-reference-architectures"></a>

## 34. Two Reference Architectures

Two end-to-end shapes that recur across engagements. Neither is exotic; the value is in seeing which sections of this course each component comes from, and in the ordering of the delivery.

<a id="34-1-secure-assistant"></a>

### 34.1 A secure assistant over regulated data

```
SSO (OIDC) ─► FastAPI ─► rails in ─► redact ─┬─► hybrid retrieve ──► rerank
   §28          §32        §29        §29    │      §13 (ACL pre-filter, §28)
                                             │              │
                                             │              ▼
                                             └─► text-to-SQL (read-only replica)
                                                    §27      │
                                                             ▼
                                              gateway ─► model ─► rails out ─► restore
                                                §30       §25       §29        §29
                                                             │
                                                             ▼
                                              traces · cost · evals in CI
                                                 §31            §16
```

Delivery order matters more than the diagram. Identity and entitlements first, because they constrain everything and unblock the security review. Then retrieval quality with a measured eval set. Then the SQL path, which is the highest-risk component and the one most likely to be cut. Guardrails and the gateway go in alongside from day one because they are the pieces that are painful to retrofit.

<a id="34-2-multi-agent-compliance"></a>

### 34.2 A multi-agent compliance workflow

```
trigger (ticket / schedule)
      │
      ▼
 LangGraph supervisor ──────────────────────────────── checkpointer (Postgres)
      │   §20/§21                                            §20
      ├─► evidence agent    → vector + graph retrieval        §13 §17
      ├─► policy agent      → clause lookup, versioned        §10
      └─► systems agent     → MCP server (Jira, SAP), read     §23
      │
      ▼
 draft finding  ──► interrupt() ──► human approval UI ──► resume
      │                §20                                  │
      ▼                                                    ▼
 audit record: inputs, evidence ids, model + prompt versions, approver, time
                                   §31
```

Everything here exists because a compliance workflow is judged on its record, not its answer. The checkpointer gives durable pause across days. The interrupt makes approval structural rather than procedural. The audit span ties a decision to the exact prompt, model, evidence and human. And the human-approval UI is where preference pairs come from for free (§24) — the reviewer's edits are training data you did not have to commission.

> **Tip**
>
> In both architectures, notice how little of the diagram is the model. That ratio is the honest picture of forward deployed AI work, and showing it early to a customer who expects “we just plug in the AI” is one of the most useful conversations you can have in week one.

<a id="35-framework-landscape"></a>

## 35. The Framework Landscape

- **Frameworks are** `replaceable`
- **Your data model is** `not`
- **Choose for** `handover, not features`
- **Lock-in risk** `at the orchestration layer`

You will be asked to justify a stack in the first architecture review of every engagement, usually by someone whose team must maintain it. “It is what I know” is an honest answer and a losing one. This section is the map, and the argument for each choice.

<a id="35-1-the-map"></a>

### 35.1 The map

| Tool | What it really is | Reach for it when | Cost of using it |
| --- | --- | --- | --- |
| **LangChain / LCEL** | A component library plus a pipe operator. `prompt \| model \| parser` composes runnables with batching, streaming and retries for free | Gluing many providers quickly; you want streaming and async without writing it | Abstraction depth — debugging means reading framework source. Pin the version |
| **LlamaIndex** | A retrieval-first framework: loaders, node parsers, indexes, query engines | Document-heavy RAG where the ingest zoo (PDF, Notion, Confluence, SQL) is the work | Its index abstractions can hide the retrieval decisions you most need to control |
| **LangGraph** | A durable state machine (§20) | Cycles, human approval, resumable runs — anything audited | More ceremony than a loop; worth it exactly when durability is a requirement |
| **CrewAI** | Role-based multi-agent teams with sequential or hierarchical process | Fast prototyping of a “team of specialists” demo | Less control over state and termination; I would not hand it to an ops team unmodified |
| **AutoGen** | Conversational multi-agent: agents message each other, with a group chat manager | Research-style exploration, code-execution loops | Free-form conversation is the topology to avoid in customer work (§21.1) |
| **DSPy** | A compiler for prompts (§8) | You have a metric and 50+ examples and want the small model to do the job | Needs data before it needs anything else |
| **n8n / Zapier-class** | Visual workflow automation with LLM nodes | Genuinely useful for the customer's own ops team to own simple automations | Version control and testing are weak; keep the AI-critical path in code |
| **Plain HTML / CSS / JS** | Simple web UI for a demo or an internal review queue | Week one, and for human-approval screens | The standard for production and simple demos alike |
| **Tavily / search APIs** | A web-search tool shaped for LLM consumption | Public-information lookups inside an agent | Egress. In most regulated estates it will simply be blocked — check first |

<a id="35-2-lcel-vs-plain"></a>

### 35.2 What the abstraction buys, concretely

**The same chain, framework and plain**

```python
# LCEL: composition, batching, streaming and retries come with the operator.
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | ChatPromptTemplate.from_template(ANSWER_PROMPT)
    | model.with_retry(stop_after_attempt=3)
    | JsonOutputParser()
)
answers = await chain.abatch(questions, config={"max_concurrency": 8})

# Plain: twenty more lines, and every one of them is yours to debug.
async def chain_plain(question: str) -> dict:
    docs = await retriever.aget(question)
    prompt = ANSWER_PROMPT.format(context=format_docs(docs), question=question)
    raw = await call_with_retry(prompt, attempts=3)
    return json.loads(raw)

# The trade is not "easy vs hard". It is "whose code is in the stack trace
# at 2am, and can the customer's team read it?" — which is why I default to
# the framework for I/O plumbing and plain code for the business logic.
```

```text
How to answer "why this stack?" in a review, in order:

1. Name the constraint it satisfies (runs in our VPC / their team knows
   Python / audit needs resumable runs).
2. Name what you are NOT using it for (no framework in the security
   path, no framework holding the schema).
3. Name the exit: "the retriever, the prompts and the tool schemas are
   plain objects; swapping the orchestration layer is two days."

That third point is what a customer architect is actually testing.
Frameworks churn; a stack you cannot exit is a liability you handed
to someone else.
```

> **Key idea**
>
> Keep the things that are expensive to rebuild — the ontology, the chunking pipeline, the tool schemas, the golden set, the ACL model — in plain code and plain data. Let the framework own the plumbing. Then a framework's next breaking release is an afternoon rather than a quarter, and you can say so with a straight face in the review.

<a id="36-cloud-network-linux"></a>

## 36. The Ground You Deploy Onto: Cloud, Network and Linux

- **Their account** `their rules`
- **Private subnets** `for anything stateful`
- **IAM** `least privilege, per service`
- **Budget alarm** `before the first deploy`

An FDE deploys into infrastructure they did not build and cannot redesign. You will not be the cloud architect, but you must be able to read their network diagram, ask for exactly the right resources, and debug a box over SSH at nine at night. This section is the minimum ground floor.

<a id="36-1-the-network-picture"></a>

### 36.1 The network picture

```
                         VPC 10.0.0.0/16
 ┌──────────────────────────────────────────────────────────────────┐
 │  public subnet 10.0.1.0/24          private subnet 10.0.10.0/24  │
 │  ┌────────────┐                     ┌───────────────┐            │
 │  │ ALB :443   │───────────────────► │ ECS service   │            │
 │  └────────────┘                     │ (your API)    │            │
 │  ┌────────────┐   outbound only     └───────┬───────┘            │
 │  │ NAT gw     │◄────────────────────────────┤                    │
 │  └─────┬──────┘                             │                    │
 │        │                            ┌───────▼───────┐            │
 │        │                            │ RDS Postgres  │ (private)  │
 │        │                            │ + pgvector    │            │
 │        │                            └───────────────┘            │
 │        │                      VPC endpoints → S3, ECR, Secrets   │
 └────────┼─────────────────────────────────────────────────────────┘
          ▼
   internet (model provider) — or nothing at all, if air-gapped

Security groups are stateful allow-lists between these boxes.
"Can the app reach the database?" is always: SG on RDS allows :5432
from the SG of the ECS service. Not from a CIDR. From the SG.
```

Two details decide most deployment arguments. **VPC endpoints** let your service reach S3, ECR and the secrets store without traversing the internet at all, which is frequently the difference between passing and failing a zero-egress policy. And **NAT is one-way**: private subnets can call out, nothing can call in — which is why the database belongs there and the load balancer does not.

<a id="36-2-the-services"></a>

### 36.2 The services you will actually ask for

| Need | Service | What to specify |
| --- | --- | --- |
| Run the API | ECS Fargate (or their Kubernetes cluster) | Task definition: image digest, CPU/memory, env from Secrets Manager, log driver, health-check path |
| Front it | Application Load Balancer | Target group on `/readyz`, idle timeout above your longest stream (default 60s will cut it) |
| Store images | ECR | Scan on push, immutable tags, lifecycle rule to expire old images |
| Documents and artefacts | S3 | Block public access, SSE-KMS, versioning, lifecycle to Glacier, and a bucket policy that names the task role |
| Relational + vectors | RDS Postgres with `pgvector` | Private subnet, automated backups, a read replica for §27, and a read-only role |
| Batch ingest | Lambda or a Fargate task on a schedule | Lambda's 15-minute ceiling rules it out for large re-index jobs — know this before you promise it |
| Cheap compute | Spot / interruptible instances | Fine for ingest and fine-tuning, wrong for the API. Checkpoint your jobs |
| Not surprising anyone | Budgets and cost anomaly alerts | Set thresholds on day zero, tagged by project. This is a ten-minute task that saves a difficult conversation |

<a id="36-3-iam-and-least-privilege"></a>

### 36.3 IAM and least privilege

**A task role that a security reviewer will approve**

```text
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadCorpusOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::acme-corpus",
                   "arn:aws:s3:::acme-corpus/ingest/*"],
      "Condition": {"Bool": {"aws:SecureTransport": "true"}}
    },
    {
      "Sid": "OwnSecretsOnly",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:eu-west-2:*:secret:claims/ai/*"
    }
  ]
}

Three habits that pass review:
  · one role per service, never a shared "app role"
  · resource ARNs, never "*" — including on the Resource of a Deny
  · cross-account access via AssumeRole with an ExternalId, never keys
```

```text
# Linux you need at 9pm when a container is misbehaving

id; groups                      # who am I, and is that why it's 403?
ls -l /app/prompts              # rwx for owner/group/other — chmod 640
chown -R app:app /app/data      # container runs as uid 10001, not root

ps aux --sort=-%mem | head      # what is eating the box
top -o %CPU                     # or htop if it exists
ss -tulpn | grep 8000           # is anything actually listening
lsof -p $(pgrep -f uvicorn)     # which files/sockets it holds open
journalctl -u myapp -f --since '10 min ago'
dmesg | tail                    # OOM killer leaves its note here

df -h; du -sh /var/lib/docker/* # "disk full" is half of all incidents
free -m                         # and memory pressure is most of the rest

# Config comes from the environment, never from a file in the image
printenv | grep -i -E 'model|db' | sed 's/=.*/=***/'   # print keys, not values

# A safe ingest loop: set -euo pipefail or a failure mid-way is silent
set -euo pipefail
for f in /data/incoming/*.pdf; do
  python -m ingest "$f" >> /var/log/ingest.log 2>&1 || echo "FAILED $f"
done
```

> **Warning**
>
> Ask for the network diagram, the IAM boundary and the egress policy in week one, in writing. Almost every “the pilot cannot go to production” story ends at one of those three, and all three are cheap to discover early and extremely expensive to discover after you have built against the wrong assumption.

<a id="37-model-foundations"></a>

## 37. Model Foundations You Must Be Able to Explain

- **Depth needed** `explain, not derive`
- **Asked by** `their data scientist`
- **Also asked in** `the interview loop`
- **Rule** `mechanism, then consequence`

You will not train a CNN on an engagement. You will, repeatedly, be in a room with someone who has, and who wants to know whether you understand what you are deploying. This section is the floor: enough to explain any of it accurately in two minutes and to know which ideas still matter operationally.

<a id="37-1-from-perceptron-to-transformer"></a>

### 37.1 From perceptron to transformer

```
perceptron        y = f(Σ wᵢxᵢ + b)      one linear boundary. Cannot do XOR.
MLP               stack them, add a non-linear activation → any function,
                  given enough width. Activation is the whole trick: without
                  it, ten layers collapse into one matrix.
loss              a number saying how wrong (cross-entropy for classes,
                  MSE for values). Training = make this smaller.
gradient descent  which way is downhill for every weight, take a small step.
backprop          the chain rule, applied efficiently backwards through the
                  network to get those gradients. Not magic; bookkeeping.
CNN               weight sharing over space. Same edge detector everywhere →
                  far fewer parameters. Images, and 1-D over signals.
RNN / LSTM        a hidden state carried along a sequence. LSTM adds gates so
                  the gradient survives long sequences.
limitation        recurrence is inherently sequential: step t needs t-1, so
                  you cannot parallelise training across the sequence, and
                  long-range information still degrades.
attention         drop recurrence. Let every position look at every other
                  position directly, in parallel (§2). That is the whole
                  reason transformers won — throughput, not just accuracy.
```

<a id="37-2-training-regimes"></a>

### 37.2 The training regimes, named correctly

| Stage | What happens | Why you care |
| --- | --- | --- |
| Pre-training | Next-token prediction over a very large corpus | Where general capability comes from; you will never do it |
| Continued / domain-adaptive pre-training (DAPT) | More next-token training on in-domain raw text | Occasionally right for genuinely alien vocabulary (clinical codes, legal citation). Expensive; try retrieval first |
| Instruction tuning / SFT | Supervised on (prompt, ideal response) pairs | The behaviour fine-tune of §24 |
| Preference optimisation | RLHF, or directly with DPO / ORPO / KTO on preference pairs | Teaches “better than” where correctness is a matter of degree |
| Distillation | Train a small model on a large model's outputs for one narrow task | The cheapest route to an affordable in-tenant model. Check the provider's terms first |
| Transfer learning | Reusing pre-trained representations for a new task | The umbrella idea under all of the above; also what an embedding model is doing |

<a id="37-3-nlp-basics"></a>

### 37.3 The NLP layer under retrieval

Classical NLP did not disappear; it moved into the ingest pipeline, where it is cheap and deterministic and therefore often better than a model call.

- **Normalisation** Case folding, Unicode NFKC, whitespace and ligature repair, de-hyphenation across line breaks. Do this before embedding or your vectors carry PDF artefacts.
- **Tokenisation** BPE for the model (§4); word tokenisation and stemming for BM25. They are different jobs and different vocabularies — do not conflate them.
- **Sparse representation** TF-IDF and BM25 are feature engineering: term frequency, inverse document frequency, length normalisation. Understanding *why* BM25 saturates term frequency explains why it beats embeddings on identifiers.
- **NER and POS** Entity extraction at ingest gives you the metadata that makes filtering possible (§12) and the nodes that populate a graph (§17). A domain NER model is often the highest-value small model in the whole pipeline.
- **Not worth it** Hand-built sentiment lexicons, bag-of-words classifiers, topic models. A small instruction model beats them and needs no maintenance.

<a id="37-4-vision-and-generation"></a>

### 37.4 Vision bridges and generative models

**CLIP** trains an image encoder and a text encoder jointly with a contrastive objective, so a picture of a brake caliper and the words “brake caliper” land near each other in one shared space. That single property gives you image-to-image similarity search, text-to-image search over a photo archive, and zero-shot classification by comparing an image against candidate label strings — all with the vector infrastructure you already have from §12. Vision-language models extend the idea: a vision encoder produces patch embeddings that are projected into the language model's token space, which is why you can put an image in a prompt at all, and why doing so costs hundreds of tokens.

**GANs** (a generator and a discriminator competing) and **diffusion models** (learn to reverse a noising process, then denoise from pure noise, steered by a text embedding) are how image generation works. In enterprise field work you will rarely deploy them; you will regularly be asked about them, and occasionally asked to explain why a marketing team's image tool cannot be pointed at the claims archive.

> **Interview**
>
> The form these questions take is always the same: “explain X, and tell me why it matters here.” The second half is the marking scheme. Attention → therefore quadratic prefill and a KV cache budget. Distillation → therefore an affordable in-tenant model. Contrastive image-text training → therefore we can search the photo archive with the vector database we already run. Mechanism, then consequence, every time.

<a id="38-agentic-ides"></a>

## 38. AI-Assisted Development with Agentic IDEs

- **Where it pays** `integration & migration`
- **Permission** `read-only by default`
- **Memory** `AGENTS.md in the repo`
- **Non-negotiable** `you own the diff`

An FDE's edge is throughput: one engineer, one quarter, someone else's codebase. Coding agents are the largest single multiplier available on that, and they are also the fastest way to put code you do not understand into a regulated customer's repository. Both things are true, and the difference is entirely operational discipline.

<a id="38-1-the-surfaces"></a>

### 38.1 The surfaces

| Surface | Shape | Best for |
| --- | --- | --- |
| IDE agent (Copilot, Cursor, Antigravity) | In-editor, sees open files and the workspace index | Change sets you will review line by line; refactors with tests |
| Terminal agent (Claude Code, Codex CLI) | Runs commands, reads output, iterates | Migrations, dependency upgrades, “make the test suite pass” |
| Cloud / CI agent | Triggered by an issue or a PR, opens a branch | Mechanical, well-specified backlog items; flaky-test triage |
| Review agent | Comments on diffs | A second pair of eyes on your own PRs when you are the only engineer on site |

<a id="38-2-controls"></a>

### 38.2 The controls that make it safe on a customer's repo

1. **Permission mode, chosen per task.** Read-only for exploring an unfamiliar codebase; approved edits for real work; full autonomy only in a scratch worktree you are willing to delete. On a customer's machine, start at the most restrictive and justify every step up.
2. **Reasoning effort, chosen per task.** Low for mechanical edits, high for the design question you are actually stuck on. It is a cost and latency dial (§3) in another costume.
3. **Project memory.** An `AGENTS.md` at the repo root carrying the build command, the test command, the house conventions, the deployment constraint and the things that look wrong but are deliberate. It is also, conveniently, a genuine handover artefact: the next human reads the same file.
4. **A plan before a diff.** Make the agent write the plan, read it, correct it, then let it execute. Plan-and-execute (§19) applies to your own tooling for the same reason it applies to production agents.
5. **Tools via MCP.** The same servers from §23 — their ticket system, their logs — with the same review checklist. A coding agent connected to a customer's Jira is an integration, with all the security implications of one.
6. **Skills and subagents.** Package a repeated procedure (“scaffold a connector to this house standard”) as a reusable instruction file, and delegate wide searches to a subagent so the main context stays clean. This is the platform-feature move applied to your own workflow.
7. **Hooks.** Deterministic checks that run on every agent action — formatter, linter, secret scanner, forbidden-path guard. The agent cannot talk its way past a hook, which is exactly why hooks are where the real safety lives.
8. **Human-in-the-loop review.** You read every line that reaches a customer branch. Not because the code is bad, but because **you will be the one defending it in the architecture review**, and “the agent wrote it” is not an answer anyone accepts.

**A repo memory file worth committing**

```text
# AGENTS.md

## Commands
- install: `uv sync`
- test:    `pytest -q` (unit) / `pytest -m integration` (needs docker compose up)
- lint:    `ruff check . && mypy src`
- evals:   `python -m evals.run --suite golden`

## Constraints that are NOT negotiable here
- Runs in the customer's VPC. No new outbound hosts, ever.
- Postgres 14 — no features above that. pgvector 0.7.
- Python 3.11 (their base image). Do not use 3.12 syntax.
- Every DB call goes through `db/` with a read-only role. No raw psycopg
  in feature code.

## Conventions
- Prompts live in `prompts/*.md` with a semver header. Never inline.
- Tool schemas in `tools/schemas.py`; adding a tool requires a golden-set case.
- All new endpoints need an entitlement test in `tests/test_acl.py`.

## Things that look wrong and are deliberate
- `retriever.py` re-embeds the query twice: once for dense, once for the
  HyDE variant. Measured; do not "optimise" it away.
- The 60-second ALB idle timeout is a customer platform setting, not ours.
```

```text
Where agents actually earn their keep on an engagement:

  schema archaeology (§26)   profile 1,400 tables, write the data
                             dictionary — days of work, well specified
  connector scaffolding      the fifth REST/SOAP client is identical
                             to the first four
  test backfill              generate the entitlement denial cases from
                             the ACL matrix, then YOU verify each one
  migration toil             framework upgrades, dialect ports,
                             typing a legacy module
  eval harness plumbing      the runner, the report, the CI gate

Where they do not:

  the ontology               it encodes the customer's business logic;
                             it comes from conversations, not code
  the scoping decision       what NOT to build is the whole job
  anything you cannot        if you would not sign the PR, do not merge it
  defend line by line
```

> **Warning**
>
> Before running any agent on a customer's code, check the contract. Many engagements forbid source code leaving the estate, which rules out every hosted coding assistant and leaves you with a local model or nothing. Ask in week one, in writing, and note the answer in the same document as the egress policy from §36 — it is the same question.

<a id="39-cheat-sheet"></a>

## 39. Cheat Sheet

<a id="39-1-numbers"></a>

### 39.1 Numbers worth knowing by heart

| Quantity | Rule of thumb |
| --- | --- |
| English text | ~4 characters per token; code and ids, ~2–3 |
| Model weights | params × bits / 8 — 8B at fp16 = 16 GB, at Q4 = ~5 GB |
| KV cache | 2 × layers × kv_heads × head_dim × ctx × 2 bytes |
| Vector index | chunks × dims × 4 bytes, ×1.5 for HNSW links, × replicas |
| Chunks | 400–800 tokens, 10–20% overlap, structure-aware where possible |
| Retrieval | 50 candidates per retriever → fuse → rerank → keep 3–8 |
| Reranker | 50–200 ms for 50–60 pairs on CPU |
| Agent budget | 8 steps, 12 tool calls, 45 seconds, an explicit cost cap |
| Golden set | 30–50 to start, stratified, including negatives |
| LoRA | r = 16–64, alpha = 2r, 2–3 epochs, target attention + MLP |

<a id="39-2-diagnosis"></a>

### 39.2 Symptom → likely cause

| Symptom | Look here first | Section |
| --- | --- | --- |
| “It hallucinated” | Print the retrieved chunks. Usually chunking or recall, not the model | §10, §13 |
| Right topic, wrong entity | Missing metadata filter; add id/date/region predicates | §12, §28 |
| Answer buried in the context | Too many chunks; rerank and cut | §4, §14 |
| Fails on ids and codes | Pure vector search; add BM25 and fuse | §13 |
| Inconsistent JSON | Constrained decoding, then a bounded repair loop | §6 |
| Calls the wrong tool | Descriptions do not distinguish them; or too many are in scope | §7 |
| Agent loops / burns budget | No no-progress detector; no step cap | §19 |
| Slow first token | Prefill: prompt too long. Slow tokens/sec is a different problem | §2 |
| Quality fell, nothing errored | Model, corpus or permission drift. Run the golden set | §16, §31 |
| Security review stalled | Identity chain broken by a service account somewhere | §28 |
| Bill surprised everyone | No per-tenant budget; retrieval too wide; no routing | §30, §33 |

<a id="40-pattern-recognition"></a>

## 40. Pattern Recognition Playbook

What a customer says, what it usually means technically, and what to build.

| They say | It is | Build |
| --- | --- | --- |
| “Chat with our documents” | Retrieval quality and citation, not conversation | Structure-aware chunking, hybrid + rerank, visible citations, abstention |
| “Ask questions of our data warehouse” | Text-to-SQL, and a metadata problem | Schema retrieval, AST validation, read-only replica, show the SQL |
| “Which of our X are affected by Y?” | A traversal, not a search | Ontology and a graph; vectors only for the narrative text |
| “It must never say anything wrong” | A request for abstention and review, not for accuracy | Relevance floor, confidence routing, human gate, measured override rate |
| “It has to run in our data centre” | A placement and capacity problem | Open-weights + LoRA + quantisation, vLLM, honest VRAM arithmetic |
| “Everyone should see only their own data” | Pre-filtered retrieval and an unbroken identity chain | ACL in chunk metadata, on-behalf-of tokens, denial tests in CI |
| “Our PDFs are terrible” | An ingest project wearing an AI hat | Layout + OCR pipeline, table models, bounding-box citations |
| “We want agents” | Usually a workflow with two decision points | A graph with explicit budgets; agency only where enumeration fails |
| “Can you fine-tune it on our data?” | Nearly always a retrieval or format problem | Diagnose the gap; fine-tune only behaviour, and only with an eval set |
| “It worked in the pilot” | The pilot had no permissions, no drift and no volume | Entitlements, evals, gateway budgets, observability — the boring half |

<a id="41-practice-roadmap"></a>

## 41. Practice Roadmap

Reading this is not the same as being able to do it under a customer's questioning. Build the following, in order. Each one is small; together they cover every section above and give you a portfolio you can open in an interview.

<a id="41-1-the-builds"></a>

### 41.1 The builds

1. **A measured RAG baseline.** Take 200 messy PDFs. Build a 40-question golden set by hand. Ship fixed-size chunking, then structure-aware, then hybrid, then reranking — recording the score at each step. You now own the table from §10 with your own numbers, which is worth more than any certificate.
2. **An extraction service with a schema.** Constrained decoding, a bounded repair loop, repair and failure metrics, and a human queue for failures. Measure the repair rate.
3. **A graph layer.** Model six entity types from a relational dump, load them, and answer three two-hop questions that your vector index cannot.
4. **A durable agent.** LangGraph, a real checkpointer, an interrupt before a write, resume from a different process. Add all six termination conditions from §19 and plot the stop reasons.
5. **Entitlements end to end.** Two users, different groups, one index. Prove by test that user B cannot obtain A's document by any phrasing, including an injection attempt. This is the single most valuable thing on this list.
6. **A text-to-SQL path.** With AST validation, predicate injection, `EXPLAIN` gating and the SQL shown in the UI. Try to break your own validator.
7. **A LoRA fine-tune.** Take a formatting behaviour your prompt cannot enforce reliably, build 600 examples, train with QLoRA, and evaluate against the prompt-only baseline. Be prepared for the answer to be “the prompt was fine”.
8. **The full stack, wired.** Gateway with fallback, OpenTelemetry traces, evals in CI, a cost dashboard, and a per-tenant budget that actually refuses. Then write the one-page architecture document and have someone attack it.

<a id="41-2-how-to-be-questioned"></a>

### 41.2 Rehearsing the defence

For each build, write down the three numbers you would quote, the trade-off you made, and the failure mode you would warn the customer about. Then have someone ask “why not the other option?” until you either have an answer or discover you were guessing. That exercise, repeated, is what converts this material from knowledge into the thing an FDE is actually paid for.

<a id="41-3-where-to-go-next"></a>

### 41.3 Where to go next

1. [The FDE detailed course](fde-detailed-course.html) — the delivery half: qualification, discovery, scoping documents, compliance, on-call inside someone else's estate, adoption measurement, handover and the hiring loop.
2. [The FDE crash course](fde-crash-course.html) — the engagement loop and the decomposition interview, in one animated sitting.
3. [All FDE courses](fde-courses.html) — the catalogue page for this topic.
4. [AI Engineering detailed course](../ai-engineering/ai-engineering-detailed-course.html) — deeper on the model side: tokenisation internals, sampling, embeddings, serving and evaluation as a discipline in its own right.
5. [Distributed Communication Patterns](../distributed-communication-patterns/distributed-communication-patterns-detailed-course.html) — the queueing, retry, idempotency and event-driven material that §30 and §32 lean on.

> **Key idea**
>
> If you remember one thing from this course: **almost none of the hard problems in forward deployed AI are model problems.** They are retrieval problems, permission problems, integration problems and measurement problems, wearing a model-shaped mask. The engineer who reaches for the chunker, the ACL and the eval set before the prompt is the one whose systems are still running a year later.

---

TechToday Study Library — Forward Deployed Engineer
