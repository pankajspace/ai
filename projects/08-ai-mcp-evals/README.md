# 08-ai-mcp-evals · AI MCP & Evals

Model Context Protocol (MCP) plumbing, autonomous tool agents, and automated test evaluation suites: direct fast MCP client subprocess over stdio, MCP agent tool-calling loops, and assertions against ground truth.

## 1. Overview and Features

1. **Direct FastMCP Client**: Spawns `cricket_server.py` as an isolated subprocess, performs the MCP protocol handshake over stdio, discovers tools via `tools/list`, and invokes structured tool calls without an LLM.
2. **MCP-Enabled Agent**: Translates FastMCP tool definitions into OpenAI function-calling format and executes an autonomous tool-calling loop using Groq.
3. **MCP Evaluation Suite**: Automated assertion pipeline running 5 end-to-end evaluation test cases checking both tool routing accuracy and factual tokens in synthesized answers.

## 2. Project Details

1. Project folder: `projects/08-ai-mcp-evals`
2. Local URL: `http://localhost:8089`
3. Production URL: `https://app.techtoday.click/08-ai-mcp-evals/`
4. Local published port: `8089`
5. Container port: `5000`
6. EC2 host port: `5009`
7. ECR repository: `techtoday/08-ai-mcp-evals`
8. Production service name: `08-ai-mcp-evals`
9. Production path prefix: `/08-ai-mcp-evals`
10. Deploy workflow: `.github/workflows/deploy-08-ai-mcp-evals.yml`
11. Trigger path: `projects/08-ai-mcp-evals/**`

## 3. Environment Variables

1. `GROQ_API_KEY`: Required for MCP Agent and Evaluation Suite.
2. `GROQ_MODEL`: Optional. Default `openai/gpt-oss-20b`.
3. `GROQ_BASE_URL`: Optional. Default `https://api.groq.com/openai/v1`.

## 4. Local Development

1. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   # fill in GROQ_API_KEY
   ```
2. Build and run locally:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8089`.

## 5. Deployment and Verification

1. Automatic deployment on push when files change under `projects/08-ai-mcp-evals/**`.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/08-ai-mcp-evals/
   ```
3. Rollback: pull previous image tag from `techtoday/08-ai-mcp-evals` ECR repository on EC2.
