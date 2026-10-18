# 04-ai-aws-strands · AWS Strands Agents

12 production-grade AI agent patterns leveraging the AWS Strands Agent SDK, Amazon Bedrock foundation models (Amazon Nova Lite), and LangGraph ReAct state machines.

## 1. Overview and Features

1. **Hello World Agent**: Direct Bedrock agent loop with minimal single-turn invocation.
2. **LangGraph Agent**: ReAct state graph cycle on Bedrock.
3. **Function to Tool**: Automatic Python function signature reflection into Bedrock tool definitions.
4. **Tip Calculator**: Real-time arithmetic agent calculating bill tip and group split.
5. **Multi-Tool Sales**: Sequential multi-tool pipeline (discount, tax, total invoice).
6. **Custom Inventory**: Safe database lookup tool for warehouse stock verification.
7. **Prebuilt Calculator**: Mathematical expression evaluation with AST verification.
8. **Multi-Prebuilt Tools**: Prebuilt system utilities combined in a single ReAct loop.
9. **Use AWS Agent**: AWS cloud infrastructure guidance agent using Bedrock Nova.
10. **Class-Based Tools**: Object-oriented stateful tool definitions with encapsulated session state.
11. **Async Tools**: Parallel asynchronous tool execution demonstrating non-blocking latency reduction.
12. **Travel Assistant**: 5-tool capstone travel coordinator orchestrating weather, currency, flights, hotels, and packing suggestions.

## 2. Project Details

1. Project folder: `projects/04-ai-aws-strands`
2. Local URL: `http://localhost:8084`
3. Production URL: `https://app.techtoday.click/04-ai-aws-strands/`
4. Local published port: `8084`
5. Container port: `5000`
6. EC2 host port: `5004`
7. ECR repository: `techtoday/04-ai-aws-strands`
8. Production service name: `04-ai-aws-strands`
9. Production path prefix: `/04-ai-aws-strands`
10. Deploy workflow: `.github/workflows/deploy-04-ai-aws-strands.yml`
11. Trigger path: `projects/04-ai-aws-strands/**`

## 3. Environment Variables

1. `AWS_ACCESS_KEY_ID`: Optional locally (uses EC2 instance role in production).
2. `AWS_SECRET_ACCESS_KEY`: Optional locally.
3. `AWS_DEFAULT_REGION`: Required. Default `us-east-1`.
4. `BEDROCK_MODEL_ID`: Optional. Default `amazon.nova-lite-v1:0`.

## 4. Local Development

1. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   # add AWS credentials if testing Bedrock locally
   ```
2. Build and run locally:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8084`.

## 5. Deployment and Verification

1. Automatic deployment triggers on push to GitHub.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/04-ai-aws-strands/
   ```
3. Rollback: pull previous image tag from `techtoday/04-ai-aws-strands` ECR repository on EC2.
