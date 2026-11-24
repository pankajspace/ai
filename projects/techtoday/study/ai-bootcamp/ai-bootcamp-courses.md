<!--
Source: ai-bootcamp-courses.html
Title: TechToday - AI Bootcamp
Description: Hands-on AI Bootcamp covering LLM system basics, memory, MCP, observability, guardrails and evals, RAG labs, Agentic AI on AWS with Strands Agents, Bedrock, AgentCore and A2A, Codex for backend engineering, and financial AI agent projects.
Stylesheets: ../../style.css
-->

Navigation: [TechToday](../../index.html) · [← Home](../../index.html)

# AI Bootcamp

Hands-on Agentic AI on AWS & real-world financial agent systems

1. **[01. LLM System Building Blocks](llm-system-building-blocks.html)** — LLM System Design chapter 1: tokens, embeddings, prompts and context windows, temperature, RAG and GraphRAG, context engineering, agents, modalities, measuring performance, and what to do when things go wrong.
2. **[02. Agentic Bug Fixing](agentic-bug-fixing-code-explainer.html)** — A LangGraph agent with an OpenAI model that diagnoses and repairs crashing Python functions: the state, the prompt, the agent graph and the Gradio app, walked through line by line with seven worked examples.
3. **[03. Memory & MCP](memory-and-mcp-1-memory-explained.html)** — Make agents remember and evolve with short- and long-term memory, then connect them to tools through one standard plug, the Model Context Protocol, explained slide by slide and in code.
    - [Adding memory to agents](memory-and-mcp-1-memory-explained.html)
    - [Model Context Protocol (MCP)](memory-and-mcp-2-mcp-explained.html)
    - [Memory & MCP code explainer](memory-and-mcp-3-code-explainer.html)
4. **[04. Observability & Guardrails](observability-and-guardrails-1-observability-explained.html)** — See inside your AI agent with LLM observability and LangSmith tracing, then build safe systems with responsible AI and NeMo Guardrails, plus an inventory agent grown from v0 to v7.
    - [LLM observability explained](observability-and-guardrails-1-observability-explained.html)
    - [Observability demo with LangSmith](observability-and-guardrails-2-langsmith-code-explainer.html)
    - [Responsible AI & guardrails explained](observability-and-guardrails-3-guardrails-explained.html)
    - [Guardrails demo with NeMo Guardrails](observability-and-guardrails-4-guardrails-code-explainer.html)
    - [Inventory agent v0 to v7](observability-and-guardrails-5-inventory-agent-code-explainer.html)
5. **[05. Agent Evals](agent-evals-1-evals-explained.html)** — Tell, with evidence, whether your agent is doing its job: evaluation concepts slide by slide, then component evals in code that score a router, prompt, search and tools and check the LLM judge against a human.
    - [Evaluating your agent explained](agent-evals-1-evals-explained.html)
    - [Component evals code explainer](agent-evals-2-component-evals-code-explainer.html)
6. **[06. AI Evals in Practice](ai-evals-in-practice-1-why-ai-evals.html)** — A five-chapter evals playbook: the framework and team, qualitative and quantitative methods, metrics, AI judges and test sets, experiments and monitoring after launch, governance, and an adaptive learning app case study.
    - [1. Why AI evals](ai-evals-in-practice-1-why-ai-evals.html)
    - [2. Evaluation methods & qualitative evals](ai-evals-in-practice-2-evaluation-methods-and-qualitative-evals.html)
    - [3. Metrics, AI judges & test sets](ai-evals-in-practice-3-quantitative-evals-metrics-ai-judges-and-test-sets.html)
    - [4. After launch: experiments & monitoring](ai-evals-in-practice-4-after-launch-experiments-monitoring-and-business-impact.html)
    - [5. Tools, governance & advanced topics](ai-evals-in-practice-5-tools-governance-and-advanced-topics.html)
    - [Case study: adaptive learning app](ai-evals-in-practice-case-study-adaptive-learning-app.html)
7. **[07. Inventory Agent on AWS](inventory-agent-aws-0-start-here.html)** — Ship an inventory-planning agent (Gradio, FastAPI, LangChain, OpenAI) from a laptop to a secured deployment on AWS ECS Fargate: understand every AWS service, deploy by hand, then automate with GitHub Actions.
    - [Start here](inventory-agent-aws-0-start-here.html)
    - [1. Understand the system](inventory-agent-aws-1-understand-the-system.html)
    - [2. Deploy by hand](inventory-agent-aws-2-deploy-by-hand.html)
    - [3. Automate with GitHub Actions](inventory-agent-aws-3-automate-with-github-actions.html)
8. **[08. AI Agents in Finance](ai-agents-in-finance-sections-01-02.html)** — A finance-first, code-first course: agent frameworks, a fundamental analysis system, deep search research agents, reasoning patterns, teams of agents, agentic RAG on filings, and evaluating agents in production.
    - [Sections 1–2: finance-first foundations](ai-agents-in-finance-sections-01-02.html)
    - [Sections 3–4: frameworks & analyst in a box](ai-agents-in-finance-sections-03-04.html)
    - [Section 5: deep search agents](ai-agents-in-finance-section-05.html)
    - [Section 6: reasoning paradigms](ai-agents-in-finance-section-06.html)
    - [Sections 7–9: teams of agents](ai-agents-in-finance-sections-07-09.html)
    - [Section 10: agentic RAG in finance](ai-agents-in-finance-section-10.html)
    - [Sections 11–12: evaluation & production](ai-agents-in-finance-sections-11-12.html)
9. **[09. RAG Lab Setup Guide](rag-lab-setup-guide.html)** — Get your laptop ready for the hands-on RAG modules in 20–30 minutes: Python, a virtual environment, the libraries, an API key, and a one-click check script that confirms everything works.
10. **[10. Embeddings, Similarity Search & Reranking](rag-lab-1-embeddings-similarity-reranking-exercises.html)** — Hands-on RAG module 1: turn text into embeddings, find the nearest passages with similarity search, and rerank the results. Try every TODO first, then compare with the step-by-step solution.
    - [Exercises](rag-lab-1-embeddings-similarity-reranking-exercises.html)
    - [Solution explainer](rag-lab-1-embeddings-similarity-reranking-solution.html)
11. **[11. Chunking Strategies & HyDE](rag-lab-2-chunking-strategies-exercises.html)** — Hands-on RAG module 2: find a good chunk size, compare fixed-length, semantic and Markdown structure-based chunking, and search with a fake answer using HyDE, plus when to use which strategy.
    - [Exercises](rag-lab-2-chunking-strategies-exercises.html)
    - [Solution explainer](rag-lab-2-chunking-strategies-solution.html)
12. **[12. Tool Calling Basics](rag-lab-3-tool-calling-basics-exercises.html)** — Hands-on RAG module 3: tool calling from scratch, the same flow with LangChain, and letting the model choose between four tools, with the full message flow behind every call.
    - [Exercises](rag-lab-3-tool-calling-basics-exercises.html)
    - [Solution explainer](rag-lab-3-tool-calling-basics-solution.html)
13. **[13. Build an Inventory Planning Agent](rag-lab-4-inventory-agent-exercises.html)** — Hands-on RAG module 4: build an inventory planning agent in eight steps, from SQLite, embeddings and ChromaDB retrieval to RAG chains, an agent tool loop and the full app, with the inventory maths in real numbers.
    - [Exercises](rag-lab-4-inventory-agent-exercises.html)
    - [Solution explainer](rag-lab-4-inventory-agent-solution.html)
14. **[14. Your First AI Agent](01-your-first-ai-agent.html)** — From plain LLMs to RAG, agents, the AWS agentic stack, MCP and A2A, the Strands agent loop, and a hands-on Hello World agent on Amazon Bedrock.
15. **[15. Giving Agents Tools](02-giving-agents-tools.html)** — Turn Python functions into agent tools with `@tool`, combine multiple tools, use the prebuilt Strands toolbox and `use_aws`, and build custom, class-based, and async tools.
16. **[16. Agents That Remember](03-agents-that-remember.html)** — Short-term and long-term agent memory, memory on AWS, a personalised Strands agent with Mem0, context management, and Amazon Bedrock AgentCore Memory with a LangGraph checkpointer.
17. **[17. Agents That Work Together](04-agents-that-work-together.html)** — Multi-agent patterns with Strands Agents on Amazon Bedrock: supervisor-worker, agent-as-tool, sequential, parallel and collaborative communication, and swarm and graph orchestration.
18. **[18. How Agents Talk](05-how-agents-talk.html)** — Model Context Protocol (MCP) for connecting agents to tools, resources, and prompts, and the Agent-to-Agent (A2A) protocol for connecting agents to each other with FastMCP and Bedrock labs.
19. **[19. Shipping Agents to Production](06-shipping-agents-to-production.html)** — Taking Strands agents from laptop to production on AWS Lambda, Amazon ECS on Fargate, and Amazon Bedrock AgentCore (Runtime, Gateway, Identity), plus enterprise integration patterns.
20. **[20. Evals, Observability and Governance](07-evals-observability-and-governance.html)** — Evaluate agents with AgentCore Evaluations and LLM-as-a-judge, trace with OpenTelemetry into Jaeger and Langfuse, and govern with Bedrock Guardrails and Cedar.
21. **[21. AI Engineering — Interview Workshop](08-ai-engineering-interview-workshop.html)** — Four real-world AI engineering project walkthroughs with 24 follow-up questions and 50 practice questions covering architecture trade-offs, RAG, agents, memory, and senior interview prep.
22. **[22. Codex for Backend Engineering](codex-index.html)** — 26 hands-on guides that build an auction-house backend with the Codex coding agent: plan mode, PostgreSQL row locking, Playwright concurrency tests, Socket.io and Redis, RabbitMQ, Stripe checkout, code reviews, and Jaeger tracing.
    - [All guides](codex-index.html)
    - [1. Introduction & setup](codex-01-introduction.html)
    - [11. Understanding the concurrency problem](codex-11-understanding-the-concurrency-problem.html)
    - [17. Socket.io & Redis](codex-17-socket-io-and-redis.html)
    - [21. Messaging with RabbitMQ](codex-21-messaging-with-rabbitmq.html)
    - [26. Observability with Jaeger](codex-26-observability-with-jaeger.html)
23. **[23. Production RAG from Scratch](09-production-rag.html)** — From a 60-line demo to a production-ready RAG system: document ingestion, PDF text extraction and OCR, chunking strategies, embeddings, hybrid retrieval, reranking, and grounded evaluation.
24. **[24. Agentic RAG Guide](10-agentic-rag-guide.html)** — Build an AI team that answers questions from your PDF, routes to the internet when answers are missing, checks hallucination graders, and corrects its own work with line-by-line walkthroughs.
25. **[25. Deep Search Agents](11-deep-search-agents.html)** — Design and build multi-agent deep research systems: query planning, parallel web exploration, source credibility checking, cross-referencing conflicting facts, and synthesising cited reports.
26. **[26. RAG & Deep Search Revision Notes](12-rag-and-deep-search-revision-notes.html)** — Quick revision of Production RAG, Agentic RAG, Deep Search Agents and the AI Vendor Risk Assessor capstone: end-to-end architectures, mental maps, step-by-step guides for similar problems, project maps, decision rules, important numbers, cheat sheets and 5–10 minute super quick revisions.
27. **[Project 01: AI Agents in Finance](project-01-ai-agents-in-finance.html)** — Finance domain concepts and hands-on agent labs: earnings-call JSON summariser, live price agent, financial ratio retriever, rebalancing assistant with memory, and Buy/Hold/Sell pipeline.
28. **[Project 02: NPS Analyst in a Box](project-02-nps-analyst-in-a-box.html)** — A five-agent Net Promoter Score (NPS) analyst for banking: promoters, passives and detractors, revenue at risk, root-cause theme clustering, and leadership action briefs.
29. **[Project 03: AI Vendor Risk Assessor](project-03-ai-vendor-risk-assessor.html)** — End-to-end capstone system: automated vendor risk assessment combining a production RAG policy library, multi-agent router with graders, real-time web deep research, and human-in-the-loop review.

---

© 2026 TechToday.
