# 06-ai-reliability · AI Reliability

Techniques and empirical benchmarks for deterministic, calibrated, and error-resilient AI systems: Chain-of-Thought (CoT) vs Direct reasoning, Structured Output determinism, tool schema routing calibration, and upstream error injection with hallucination scoring.

## 1. Overview and Features

1. **Chain-of-Thought vs Direct**: Evaluates step-by-step thinking against direct zero-shot responses on complex relational and spatial reasoning puzzles.
2. **Variance & Determinism**: Compares Unconstrained, Prompt-Constrained, and Schema-Enforced JSON extraction across review text.
3. **Tool Schema Calibration**: 2x2 matrix testing how models route between functions based on tool names versus semantic docstrings.
4. **Tool Error Injection**: Simulates upstream HTTP 503 outages and automatically scores whether the model acknowledges the failure or hallucinates data.

## 2. Project Details

1. Project folder: `projects/06-ai-reliability`
2. Local URL: `http://localhost:8088`
3. Production URL: `https://app.techtoday.click/06-ai-reliability/`
4. Local published port: `8088`
5. Container port: `5000`
6. EC2 host port: `5008`
7. ECR repository: `techtoday/06-ai-reliability`
8. Production service name: `06-ai-reliability`
9. Production path prefix: `/06-ai-reliability`
10. Deploy workflow: `.github/workflows/deploy-06-ai-reliability.yml`
11. Trigger path: `projects/06-ai-reliability/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required.
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.

## 4. Local Development

1. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   # fill in OPENAI_API_KEY
   ```
2. Build and run locally:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8088`.

## 5. Deployment and Verification

1. Automatic deployment on push when files change under `projects/06-ai-reliability/**`.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/06-ai-reliability/
   ```
3. Rollback: pull previous image tag from `techtoday/06-ai-reliability` ECR repository on EC2.
