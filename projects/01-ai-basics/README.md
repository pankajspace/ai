# 01-ai-basics · AI Basics

Foundational large language model (LLM) API integration workflows: direct OpenAI chat completions with system personas and ultra-fast Groq Llama-3 completions.

## 1. Overview and Features

1. **Travel Guide** (`src/python/01_chat_openai.py`, `POST /api/travel`): Direct OpenAI `chat.completions.create` using `gpt-4o-mini` with a system persona and city prompt.
2. **Joke Generator** (`src/python/02_chat_groq.py`, `POST /api/joke`): Fast Groq chat completion generating punchy tech jokes via the OpenAI-compatible client interface.
3. **Demo Explanation Pages (ⓘ)**: Each card title in `src/index.html` includes an ⓘ info icon linking to its self-contained explainer page under `src/explanation/` (`travel-guide.html`, `joke-generator.html`), styled and powered by `src/css/info.css` and `src/js/info.js`.
4. **Theory Class Notes**: Self-contained LLMs & Prompting course notes (`src/theory/llms-prompting.html` and `llms-prompting.md`), served at `/theory/<path:filename>`.

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
10. Routes: `GET /`, `GET /explanation/<filename>`, `GET /theory/<filename>`, `POST /api/travel`, `POST /api/joke`
11. Deploy workflow: `.github/workflows/deploy-01-ai-basics.yml`
12. Trigger path: `projects/01-ai-basics/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required for Travel Guide. OpenAI API key used for chat completion.
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.
3. `OPENAI_BASE_URL`: Optional. Default `https://api.openai.com/v1`.
4. `GROQ_API_KEY`: Required for Joke Generator. Groq Cloud API key.
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
