# 02-langchain-agents · LangChain & Agents

LangChain Expression Language (LCEL) pipelines, stateful conversation memory buffers, raw OpenAI function calling, and structured single-tool and multi-tool LangChain ReAct agents.

## 1. Overview and Features

1. **LangChain Summarizer** (`src/python/01_langchain_summarizer.py`, `POST /api/summarize`): LangChain LCEL pipeline (`PromptTemplate | ChatOpenAI | StrOutputParser`) summarizing long texts into concise key points.
2. **Memory Chat** (`src/python/02_langchain_memory_chat.py`, `POST /api/memory-chat`): Multi-turn conversation preserving message history across dialogue turns using `MessagesPlaceholder`.
3. **OpenAI Tool Agent** (`src/python/03_agent_one_tool.py`, `POST /api/agent`): Direct OpenAI function calling loop executing a local `get_price` Python function against a store catalog.
4. **LangChain One-Tool Agent** (`src/python/04_langchain_one_tool.py`, `POST /api/langchain-one-tool`): Structured LangChain ReAct agent calling a `get_weather` lookup tool when needed.
5. **LangChain Multi-Tool Agent** (`src/python/05_langchain_multi_tools.py`, `POST /api/multi-tool-agent`): Multi-tool agent orchestrating across `get_weather`, `add`, `multiply`, and `get_population` lookup tools in a single turn.
6. **Demo Explanation Pages (ⓘ)**: Each card title in `src/index.html` includes an ⓘ info icon linking to its self-contained explainer page under `src/explanation/` (`summarizer.html`, `memory-chat.html`, `agent-one-tool.html`, `langchain-one-tool.html`, `multi-tool-agent.html`), styled and powered by `src/css/info.css` and `src/js/info.js`.
7. **Theory Class Notes**: Self-contained LangChain & Agents course notes (`src/theory/langchain-agents.html` and `langchain-agents.md`), served at `/theory/<path:filename>`.

## 2. Project Details

1. Project folder: `projects/02-langchain-agents`
2. Local URL: `http://localhost:8091`
3. Production URL: `https://app.techtoday.click/02-langchain-agents/`
4. Local published port: `8091`
5. Container port: `5000`
6. EC2 host port: `5010`
7. ECR repository: `techtoday/02-langchain-agents`
8. Production service name: `02-langchain-agents`
9. Production path prefix: `/02-langchain-agents`
10. Routes: `GET /`, `GET /explanation/<filename>`, `GET /theory/<filename>`, `POST /api/summarize`, `POST /api/memory-chat`, `POST /api/agent`, `POST /api/langchain-one-tool`, `POST /api/multi-tool-agent`
11. Deploy workflow: `.github/workflows/deploy-02-langchain-agents.yml`
12. Trigger path: `projects/02-langchain-agents/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required for LangChain Summarizer, Memory Chat, and OpenAI Tool Agent.
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.
3. `OPENAI_BASE_URL`: Optional. Default `https://api.openai.com/v1`.
4. `GROQ_API_KEY`: Required for LangChain One-Tool Agent and LangChain Multi-Tool Agent. Groq Cloud API key.
5. `GROQ_MODEL`: Optional. Default `openai/gpt-oss-20b`.
6. `GROQ_BASE_URL`: Optional. Default `https://api.groq.com/openai/v1`.

## 4. Local Development

1. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   # fill in your OPENAI_API_KEY and GROQ_API_KEY
   ```
2. Build and run locally via Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8091` in your browser.

## 5. Deployment and Verification

1. Deployment runs automatically on push to GitHub when files change under `projects/02-langchain-agents/**`.
2. Self-provisioning workflow sets up ECR repository, EC2 Nginx location block, rate limiting, and Compose configuration.
3. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/02-langchain-agents/
   ```
4. Rollback procedure: pull previous tag from `techtoday/02-langchain-agents` ECR repository on EC2.
