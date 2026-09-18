# FDE 2 Curriculum

A comprehensive Forward Deployed Engineering (FDE) curriculum covering Prompt Engineering, RAG Systems, AI Agents, Deployment & MLOps, Agentic IDEs, Neural Networks, Fine-Tuning LLMs, and Enterprise AI Consulting.

---

## Curriculum Overview

1. [Module 1: Prompt Engineering and API Integration](#module-1-prompt-engineering-and-api-integration)
2. [Module 2: Basics of NLP and Retrieval-Augmented Generation (RAG)](#module-2-basics-of-nlp-and-retrieval-augmented-generation-rag)
3. [Module 3: AI Agents and Multi-Agent Systems](#module-3-ai-agents-and-multi-agent-systems)
4. [Module 4: Deployment and Project Integration](#module-4-deployment-and-project-integration)
5. [Module 5: AI-Assisted Development with Agentic IDEs (Optional)](#module-5-ai-assisted-development-with-agentic-ides-optional)
6. [Module 6: Foundations of Neural Networks and Transformers](#module-6-foundations-of-neural-networks-and-transformers)
7. [Module 7: Fine-Tuning LLMs](#module-7-fine-tuning-llms)
8. [Consulting](#consulting)

---

## Module 1: Prompt Engineering and API Integration

### Topics
1. AI vs ML vs Deep Learning
2. Introduction to Generative AI (GenAI)
3. Open-source vs Closed-source AI Models
4. GenAI Platforms Overview (OpenAI, Anthropic, Mistral, Stable Diffusion, Midjourney)
5. Ethics & Responsible AI Usage
6. Prompt Anatomy (Role, Instruction, Input, Output)
7. Prompting Techniques (Zero-shot, Few-shot, Role-based Prompting)
8. Advanced Prompting (CoT, ToT, ReAct, Self-Consistency)
9. Handling AI Responses (JSON parsing, streaming, batch outputs, error handling)
10. AI Guardrails & Output Validation
11. Conversation Memory & Context Management
12. Working with OpenAI/Gemini APIs (Chat, Embeddings, Function Calling)
13. API Security, Rate Limits & Key Management
14. Debugging & Evaluating GenAI Outputs (Accuracy, Relevance, Reliability)

### Tools
1. Python
2. Hugging Face
3. Hugging Face API
4. LLM API
5. Postman

---

## Module 2: Basics of NLP and Retrieval-Augmented Generation (RAG)

### Topics
1. Text Preprocessing & Tokenization
2. Text Representation & Feature Engineering
3. Named Entity Recognition (NER) & POS Tagging
4. Embeddings, Vectorization & Semantic Search
5. Chunking Strategies for LLM Applications
6. RAG Fundamentals & Architecture
7. Retrieval + Generation Workflow in RAG
8. Data Handling, Chunking & Indexing
9. Vector Databases & Vector Stores
10. Dense vs Sparse Retrieval & Hybrid Search
11. Working with Text/Image Embeddings in Vector DBs
12. Building a Simple RAG Pipeline with LlamaIndex
13. Query Rewriting, Multi-hop & Multi-query Retrieval
14. Reducing Hallucinations & Context Optimization
15. Advanced RAG Techniques (Self-RAG, Corrective RAG, Adaptive RAG, Contextual Retrieval, LOTR)
16. Why Basic RAG Fails & Advanced Improvement Strategies
17. RAG Evaluation & Fallback Mechanisms
18. RAGAS Metrics (Faithfulness, Relevance, Context Recall & Precision)

### Tools
1. LangChain
2. LlamaIndex
3. Hugging Face
4. Embeddings
5. FAISS
6. VectorDB
7. Pinecone

---

## Module 3: AI Agents and Multi-Agent Systems

### Topics
1. Introduction to AI Agents & Agent Architectures
2. Types of AI Agents (Reflex, Goal-based, Utility-based, Tool-based)
3. Reactive Agents & Agent Design Patterns
4. Tool Calling, Execution Flows & Prompting Strategies
5. Multi-Agent Systems (MAS) & Collaborative AI
6. Agent Coordination, Negotiation & Consensus Mechanisms
7. Popular Agent Frameworks (LangChain, LlamaIndex, AutoGen, CrewAI, LangGraph)
8. ReAct Agents & Tool-Using Agents
9. LangGraph for Stateful Agent Orchestration
10. Framework Comparison: Choosing the Right Agent Stack
11. Planning, Reasoning & Tool Orchestration in Agents
12. Hierarchical & Collaborative Multi-Agent Patterns
13. Goal-Oriented Agent System Design
14. Multi-Agent Reinforcement Learning (MARL) Basics
15. MCP (Model Context Protocol): Servers, Clients, Tools & Resources
16. A2A (Agent-to-Agent) Communication Protocols
17. Agentic RAG: Autonomous Retrieval + Reasoning Pipelines
18. Single-Agent vs Multi-Agent Agentic RAG
19. Agent Debugging, Tracing & Monitoring with LangSmith
20. Latency, Performance & Cost Optimization for AI Agents

### Tools
1. LangChain
2. LangGraph
3. AutoGen
4. CrewAI
5. Hugging Face
6. LangSmith
7. MCP SDK

---

## Module 4: Deployment and Project Integration

### Topics
1. Web API Fundamentals (HTTP Methods: GET, POST, PUT, DELETE)
2. Building APIs with FastAPI & Pydantic
3. API Documentation with Swagger/OpenAPI
4. Deploying AI Apps (Render, Railway, Replit, Hugging Face Spaces)
5. Dockerization for AI Applications
6. CI/CD Pipelines with GitHub Actions
7. Kubernetes (K8s) Basics for GenAI Scaling
8. GenAI System Architecture Review (Agents, RAG, APIs)
9. Designing Modular AI Systems & Microservices
10. FastAPI for LLM Orchestration & LangChain Servers
11. Frontend Integration with Gradio & Streamlit
12. UI/UX Basics for LLM Applications
13. API Security, Environment Variables & Rate Limiting
14. Monitoring, Logging & Error Handling
15. Introduction to LLMOps & Production AI Workflows
16. Prompt Versioning, Tracing & Performance Monitoring
17. LLMOps Platforms (Langfuse, MLflow, LangGraph)
18. Observability with Prometheus & Grafana
19. Live Deployment Demo & Project Showcase

### Tools
1. LangChain
2. LangGraph
3. FastAPI
4. Streamlit
5. Langfuse
6. FAISS
7. Docker
8. GCP
9. LangServe
10. Kubernetes

---

## Module 5: AI-Assisted Development with Agentic IDEs (Optional)

### Topics
1. Set up and run AI coding agents across Terminal, IDEs, Cloud, and GitHub
2. Choose and switch between leading AI models for different tasks
3. Optimize performance with Low, Medium, and High reasoning modes
4. Control agent permissions with Read-Only, Auto, and Full Access modes
5. Master AI-powered terminals, commands, workflows, and planning tools
6. Build persistent project memory using AGENTS.md, PLANS.md, and context files
7. Connect external tools and services through MCP (Model Context Protocol)
8. Create reusable Skills and Subagents for faster development
9. Automate coding, testing, code reviews, CI/CD pipelines, and GitHub workflows
10. Orchestrate multiple AI agents working together on complex projects
11. Extend agents with Hooks, custom tools, and production-ready automations
12. Understand AI limitations, hallucinations, security risks, and best practices
13. Implement human-in-the-loop review, approval, and quality-control processes
14. Deploy reliable, scalable, and secure AI-assisted development workflows

### Tools
1. CodeX
2. Claude Code
3. Antigravity
4. MCP Server
5. Github
6. CI/CD

---

## Module 6: Foundations of Neural Networks and Transformers

### Topics
1. Machine Learning Foundations (Linear & Logistic Regression)
2. Perceptrons & Multi-Layer Perceptrons (MLPs)
3. Loss Functions & Activation Functions
4. Gradient Descent & Backpropagation
5. Introduction to Deep Neural Networks
6. CNNs for Computer Vision Applications
7. RNNs & LSTMs for Sequential Data
8. Limitations of RNNs & Rise of Transformers
9. Attention Mechanism (Query, Key, Value)
10. Transformer Architecture Explained
11. Pretraining vs Fine-tuning in LLMs
12. Transfer Learning Concepts & Applications
13. Introduction to GANs & Diffusion Models
14. Foundations of Modern Image Generation Systems (DALL·E, Stable Diffusion, Midjourney)

### Tools
1. Pytorch
2. Tensorflow
3. Keras
4. Huggingface
5. BertViz

---

## Module 7: Fine-Tuning LLMs

### Topics
1. Introduction to Fine-Tuning & Domain Adaptation
2. Fine-Tuning vs RAG: When to Use Each
3. Hybrid Workflows: RAG + Fine-Tuning
4. SLM vs LLM for Fine-Tuning
5. Choosing Models (LLaMA, Mistral, Phi)
6. Domain-Adaptive Pre-Training (DAPT)
7. Dataset Preparation & Instruction Tuning
8. Popular Datasets (Alpaca, DPO, Preference Datasets)
9. Data Cleaning, Formatting & Labeling Best Practices
10. PEFT Techniques (LoRA, QLoRA)
11. Fine-Tuning Pipelines with Hugging Face & PEFT
12. Trainer API, Configurations & Training Workflows
13. Preference Optimization (DPO, ORPO, KTO)
14. Quantization & Efficient Inference
15. GGUF, AWQ & Model Compression Techniques
16. Serving Models with vLLM & Ollama
17. Evaluation Metrics (Accuracy, F1, BLEU, ROUGE)
18. Fine-Tuning Performance Comparison & Benchmarking
19. Cost Optimization & Resource Estimation for Training/Inference

### Tools
1. Huggingface
2. Ollama
3. Datasets
4. vLLM
5. Transformers

---

## Consulting

### 1. Client Discovery & Diagnostic Engineering
1. Problem diagnosis frameworks (Root-Cause Analysis, MECE).
2. Client discovery methodologies: Leading structured discovery calls and stakeholder interviews.
3. Master-level stakeholder communication: Translating technical debt into business risk.

### 2. Solution Scoping & Business Value Creation
1. Designing and running collaborative solution scoping workshops.
2. AI Business case development (calculating ROI, token costs, productivity gains vs. infrastructure costs).
3. Technical writing and architecture presentation for non-technical enterprise executives.

### 3. Change Management & Long-Term Governance
1. Change management strategies for introducing disruptive AI workflows into legacy workforces. Pilot execution and adoption.
2. Defining enterprise success metrics & reporting structures (KPIs, accuracy guardrails, SLA management).
3. Long-term client engagement models and expanding scope post-delivery.
