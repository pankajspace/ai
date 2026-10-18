# 06-ai-systems · AI Systems

System-level evaluation and agentic arbitration architectures: reasoning strategy benchmarking (Direct vs Zero-Shot CoT vs Few-Shot CoT), multi-turn sycophancy trap resilience, and the Refund Bench multi-judge dispute resolution engine.

## 1. Overview and Features

1. **Prompting Strategies**: Runs Direct, Zero-Shot CoT, and Few-Shot CoT side-by-side to measure accuracy, tokens, and latency trade-offs on multi-step reasoning.
2. **Sycophancy Trap**: Multi-turn gaslight benchmark subjecting models to escalating false claims, consensus appeals, and compliance demands.
3. **Refund Bench**: 4-stage food dispute adjudication engine: Intake Evidence Snapshot &rarr; Atomic Grievance Extraction &rarr; Multi-Judge Voting Bench &rarr; Policy-driven settlement.

## 2. Project Details

1. Project folder: `projects/06-ai-systems`
2. Local URL: `http://localhost:8087`
3. Production URL: `https://app.techtoday.click/06-ai-systems/`
4. Local published port: `8087`
5. Container port: `5000`
6. EC2 host port: `5007`
7. ECR repository: `techtoday/06-ai-systems`
8. Production service name: `06-ai-systems`
9. Production path prefix: `/06-ai-systems`
10. Deploy workflow: `.github/workflows/deploy-06-ai-systems.yml`
11. Trigger path: `projects/06-ai-systems/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required.
2. `GROQ_API_KEY`: Optional for multi-provider judges.
3. `GEMINI_API_KEY`: Optional for multi-provider judges.

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
3. Open `http://localhost:8087`.

## 5. Deployment and Verification

1. Automatic deployment on push when files change under `projects/06-ai-systems/**`.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/06-ai-systems/
   ```
3. Rollback: pull previous image tag from `techtoday/06-ai-systems` ECR repository on EC2.
