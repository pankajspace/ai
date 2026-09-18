# The Structured FDE Curriculum You'll Follow

A comprehensive curriculum for Forward Deployed Engineering (FDE), spanning LLM fundamentals, prompt engineering, RAG, agentic systems, fine-tuning, production LLMOps, enterprise client deployments, and interview prep.

---

## Curriculum Overview

1. [Module 1: Prompt Engineering & LLM Mastery](#module-1-prompt-engineering--llm-mastery) (3 Weeks)
2. [Module 2: Python & API Foundations for AI](#module-2-python--api-foundations-for-ai) (2 Weeks)
3. [Module 3: RAG Systems & Vector Intelligence](#module-3-rag-systems--vector-intelligence) (3 Weeks)
4. [Module 4: Advanced RAG & LLM Fine-Tuning](#module-4-advanced-rag--llm-fine-tuning) (3 Weeks)
5. [Module 5: Agentic AI Systems](#module-5-agentic-ai-systems) (4 Weeks)
6. [Module 6: LLMOps & Deployment](#module-6-llmops--deployment) (2 Weeks)
7. [Module 7: Forward Deployed AI Engineering](#module-7-forward-deployed-ai-engineering) (5 Weeks)
8. [Module 8: Electives](#module-8-electives) (Self-paced)

---

## Module 1: Prompt Engineering & LLM Mastery

- **Duration:** 3 Weeks
- **Overview:** You will understand how modern LLMs work, learn to control their outputs precisely, and know how to use the AI tools that engineers and product managers rely on every day.
- **Capstone Project:** AI Interview Coach

### Topics Covered

#### 1. LLM Fundamentals
1. Transformer architecture, attention, KV Cache, MoE
2. Reasoning models - o1, Claude Extended Thinking
3. ChatGPT, Claude, Copilot, Cursor - strengths & when to use each
4. No-code AI tools: Bolt, Lovable, V0, n8n

#### 2. Prompt Design
1. Zero-shot, few-shot, role, task, context, format, persona & tone
2. Chain-of-Thought, Tree of Thought, self-consistency
3. Reflection, self-critique & Plan-and-Execute
4. Prompt chaining patterns
5. System prompt architecture & multi-turn design
6. Prompt injection defence

#### 3. Advanced Techniques
1. Function calling, tool-integrated LLMs & structured outputs
2. Pydantic, instructor, json_schema
3. Tokenization & cost - tiktoken, BPE, prompt compression
4. Few-shot optimisation & DSPy
5. ReAct, safety prompting & responsible AI
6. Multimodal inputs, document understanding, code review prompting
7. LLM APIs (OpenAI, Anthropic, Gemini) & prompt versioning

---

## Module 2: Python & API Foundations for AI

- **Duration:** 2 Weeks
- **Overview:** By the end of this module you will be comfortable reading, writing, and debugging Python code independently.
- **Capstone Project:** Personal AI Morning Briefing

### Topics Covered

#### 1. Python Foundations
1. All concepts of Python programming language covered
2. File handling, JSON (`json.load`, `json.dumps`)
3. OOP and error handling
4. Async Python - `async def`, `await`, `asyncio` for non-blocking API calls
5. `venv`, `python-dotenv`, secrets hygiene & Git
6. Project structure: `src/`, `prompts/`, `tests/`, `notebooks/`

#### 2. APIs & SDKs
1. HTTP & API calls - requests, status codes, pagination, JSON parsing
2. OpenAI SDK - chat completions & streaming
3. Anthropic SDK - prompt caching (`cache_control`)
4. DSPy hands-on - automatic prompt compilation & optimisation

---

## Module 3: RAG Systems & Vector Intelligence

- **Duration:** 3 Weeks
- **Overview:** After this module you can build systems that search, retrieve, and answer questions from any document library - accurately, with sources.
- **Capstone Project:** Chat with Your Own Documents

### Topics Covered

#### 1. Embeddings & Retrieval
1. OpenAI `text-embedding-3`, `sentence-transformers`, `bge`
2. Cosine similarity
3. Vector databases - Pinecone, ChromaDB, FAISS
4. Document chunking strategies & their impact on quality

#### 2. RAG Pipeline
1. LangChain - LCEL, chains, retrievers, prompt templates
2. End-to-end retrieval pipeline design
3. Production RAG evaluation - RAGAS (faithfulness, answer relevancy, context recall)
4. Context window: stuffing vs map-reduce vs refine, LostInTheMiddle

#### 3. Hybrid Search
1. BM25 keyword search
2. HyDE (Hypothetical Document Embeddings)
3. RRF (Reciprocal Rank Fusion)
4. Cross-encoder reranking with `sentence-transformers` CrossEncoder

---

## Module 4: Advanced RAG & LLM Fine-Tuning

- **Duration:** 3 Weeks
- **Overview:** You will master production RAG patterns for complex retrieval, then learn to fine-tune and deploy your own models on custom data at low cost.
- **Capstone Project:** Train Your Own Mini AI on Custom Data

### Topics Covered

#### 1. Advanced RAG
1. Query rewriting & multi-hop retrieval
2. Cross-encoder reranking
3. Self-correcting RAG - CRAG, Self-RAG, Agentic RAG

#### 2. Fine-Tuning
1. LoRA, QLoRA (`bitsandbytes` for 4-bit quantisation)
2. Adapters, Prefix Tuning - HuggingFace (`transformers`, `PEFT`, `datasets`)
3. Fine-tuning pipeline with Axolotl (YAML-driven)
4. GPU rental on RunPod and vast.ai
5. Knowledge distillation, RLHF & DPO - alignment training using `trl`
6. Training monitoring with Weights & Biases (`wandb`)

#### 3. Local Deployment
1. Ollama for local inference
2. GGUF quantisation (`Q4_K_M`, `Q8_0`)
3. Llama 3, Phi-3, Mistral
4. Model selection & cost-performance trade-offs

---

## Module 5: Agentic AI Systems

- **Duration:** 4 Weeks
- **Overview:** You will build agents that work autonomously - searching, reasoning, using tools, remembering, and completing multi-step tasks without human intervention at every step.
- **Capstone Project:** Personal AI Assistant That Works On Its Own

### Topics Covered

#### 1. Agent Architecture
1. ReAct loop, planner-executor pattern
2. Tool Arbiter pattern
3. Function calling & MCP (Model Context Protocol)
4. Agent tool use - web search with Tavily, parallel tool calls

#### 2. Frameworks
1. LangGraph - state machines, nodes, edges, checkpointing, human-in-the-loop
2. CrewAI - role-based multi-agent teams
3. Sequential vs hierarchical process
4. Agentic RAG & n8n workflow automation

#### 3. Memory & Safety
1. Short-term (conversation buffer), long-term (vector store), episodic
2. Multi-agent orchestration - supervisor, peer-to-peer, fault isolation
3. LLM evaluation - RAGAS, DeepEval, PromptFoo, trajectory evaluation
4. Guardrails AI, prompt injection defence, PII scrubbing, output filtering

---

## Module 6: LLMOps & Deployment

- **Duration:** 2 Weeks
- **Overview:** You'll build autonomous and multi-agent AI systems that can reason, plan, use tools, retain context, and execute complex workflows. With a strong FDE focus, you'll also learn how to work backwards from real customer problems, understand workflows, scope the right solution, make architecture trade-offs, and take GenAI products from discovery and prototype to deployment, evaluation, adoption, and measurable business impact.
- **Capstone Project:** Put Your AI on the Internet

### Topics Covered

#### 1. Infrastructure & DevOps
1. FastAPI - async endpoints, streaming SSE, auth middleware, rate limiting (`slowapi`)
2. Docker - Dockerfile, `docker-compose` (API + ChromaDB + Redis), slim images
3. GitHub Actions CI/CD - automated test, build, push, deploy; prompt regression in CI
4. AWS - EC2, ECS Fargate (task definition, ALB), ECR (container registry), S3, RDS (PostgreSQL), Spot instances, auto-scaling

#### 2. Observability & Safety
1. LangSmith - full LLM call tracing, cost & latency dashboards, debugging
2. Guardrails AI & OpenAI moderation API - PII scrubbing, output filtering
3. LLM evaluation suites - DeepEval in CI, PromptFoo prompt regression
4. LLMOps - why non-deterministic AI needs different ops than regular software

---

## Module 7: Forward Deployed AI Engineering

- **Duration:** 5 Weeks
- **Overview:** You will take an AI system into an environment you do not control - scoping the real problem with a client, extracting from undocumented systems, deploying under security constraints, and defending your architecture to people paid to find holes in it.
- **Capstone Project:** Run A Full Client Engagement End To End

### Topics Covered

#### 1. Discovery & Scoping
1. Discovery calls - stated problem vs actual problem
2. Use case qualification - LLM vs deterministic software
3. Scoping under political and budget constraint
4. Defining non-goals and acceptance criteria
5. Engagement artefacts - PRD-lite, SOW, ADRs
6. Baseline capture and success metric design

#### 2. Enterprise Data Access
1. Legacy databases - read replicas, change data capture
2. Schema archaeology on undocumented systems
3. Entity resolution across fragmented sources
4. PII identification and masking at extraction
5. Connectors - REST, gRPC, OAuth service accounts
6. Pagination, rate limits, incremental sync

#### 3. Deploying Into Someone Else's Environment
1. VPC-only, private endpoint & air-gapped inference
2. Enterprise auth - SSO, SAML, OIDC, RBAC
3. Multi-tenant isolation and per-client data separation
4. Model placement - hosted, in-tenant, self-hosted
5. Inference throughput, vector search at 10M+ docs
6. Cost modelling & token economics with a CTO

#### 4. Compliance, Security & The Human Loop
1. DPDP Act, GDPR, data residency requirements
2. Audit logging, model cards, retention policy
3. SOC 2 and ISO 27001 evidence requests
4. Prompt injection in a multi-tenant enterprise context
5. Human-in-the-loop approval gates
6. Incident response inside client environments

#### 5. Stakeholder Defence & Handover
1. Architecture review under a hostile panel
2. Defending trade-offs to client architects
3. Demoing failure modes deliberately
4. Handling the question you cannot answer
5. Deployment runbooks and client team enablement
6. Pilot to rollout, adoption tracking, impact reporting

---

## Module 8: Electives

- **Duration:** Self-paced
- **Overview:** Two self-paced interview tracks that run alongside the core modules. Take either or both — they cover the fundamentals hiring panels still screen for, on your own schedule.

### Topics Covered

#### 1. System Design for Tech Interviews
1. Load balancing, caching, CDN strategy
2. SQL vs NoSQL, sharding, replication
3. Consistency models, CAP in practice
4. Message queues, event-driven architecture
5. Rate limiting, retries, circuit breakers
6. Capacity estimation - QPS, storage, bandwidth
7. URL shortener and key-value store
8. News feed and timeline fan-out
9. Chat and notification systems
10. Search and autocomplete at scale

#### 2. DSA for Tech Interviews
1. Arrays, strings, two pointers, sliding window
2. Hashing, prefix sums, frequency maps
3. Stacks, queues, monotonic structures
4. Linked lists, trees, BSTs, traversals
5. Heaps, tries, union-find
6. Recursion, backtracking, pruning
7. Binary search on answer, sorting patterns
8. Graphs - BFS, DFS, shortest paths
9. Dynamic programming - 1D, 2D, state design
10. Complexity analysis under questioning