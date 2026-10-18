# 01-ai-basics · AI Basics

Foundational artificial intelligence agent patterns and API integration workflows: direct OpenAI chat completions, Groq Llama-3 completions, LangChain LCEL text summarization, multi-turn memory chat, OpenAI tool-calling agents, and LangChain ReAct agents.

## 1. Overview and Features

1. **Travel Guide**: Direct OpenAI `chat.completions.create` using `gpt-4o-mini` with system persona and city prompt.
2. **Joke Generator**: Fast Groq chat completion generating punchy tech jokes.
3. **LangChain Summarizer**: LangChain LCEL pipeline (`PromptTemplate | ChatOpenAI | StrOutputParser`) summarizing long texts.
4. **Memory Chat**: Multi-turn conversation preserving history buffer across dialogue turns.
5. **Raw Tool Agent**: Direct OpenAI function calling loop executing a local `get_price` Python function.
6. **LangChain One-Tool Agent**: Structured LangChain ReAct agent calling a weather lookup tool.
7. **LangChain Multi-Tool Agent**: Multi-tool agent orchestrating between weather, arithmetic, and population lookup tools.

## 2. Project Details

1. Project folder: `projects/01-ai-basics`
2. Local URL: `http://localhost:8081`
3. Production URL: `https://app.techtoday.click/01-ai-basics/`
4. Local published port: `8081`
5. Container port: `5000`
6. EC2 host port: `5001`
7. ECR repository: `techtoday/01-ai-basics`
8. Production service name: `01-ai-basics`
9. Production path prefix: `/01-ai-basics`
10. Deploy workflow: `.github/workflows/deploy-01-ai-basics.yml`
11. Trigger path: `projects/01-ai-basics/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required. OpenAI API key used for chat completion, summarizer, memory chat, and tool agents.
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.
3. `OPENAI_BASE_URL`: Optional. Default `https://api.openai.com/v1`.
4. `GROQ_API_KEY`: Required for joke generator. Groq Cloud API key.
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
3. Open `http://localhost:8081` in your browser.

## 5. Deployment and Verification

1. Deployment runs automatically on push to GitHub when files change under `projects/01-ai-basics/**`.
2. Self-provisioning workflow sets up ECR repository, EC2 Nginx location block, rate limiting, and Compose configuration.
3. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/01-ai-basics/
   ```
4. Rollback procedure: pull previous tag from `techtoday/01-ai-basics` ECR repository on EC2.
