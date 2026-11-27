# Inventory Planning Agent — AWS edition

Author: **Shivank Agrawal**

AI-powered reorder assistant: Gradio chat UI → FastAPI backend → LangChain agent
(OpenAI) with two tools (DB lookup + reorder calculator) → SQLite on a persistent
EFS volume. Deployed on **AWS ECS Fargate** with one CloudFormation stack per version.

**New here? Open [`../inventory-agent-aws-deployment-notes/index.html`](../inventory-agent-aws-deployment-notes/index.html) in a browser.** The learner guide explains the agent, every AWS service,
the manual deployment and the CI/CD pipeline, with analogies, worked examples and quizzes.

```
Browser ──HTTP──▶ ALB (public) ──▶ frontend task :7860 (Gradio)
                                        │ http://backend.inventory-<ver>.local:8000  (private DNS, VPC only)
                                        ▼
                                  backend task :8000 (FastAPI + LangChain agent) ──▶ OpenAI API
                                        │
                                        ▼
                                  EFS volume  /app/data/inventory.db  (persists across restarts)
```

## Layout

| Path | What |
|---|---|
| `backend/` | FastAPI API + LangChain tool-calling agent (`agent.py`, `api.py`, `tools/`) |
| `frontend/` | Gradio UI (`app.py`) |
| `db/schema.sql` | SQLite schema (inventory + sessions tables) |
| `infra/inventory-stack.yaml` | CloudFormation: VPC, security groups, EFS, ECS cluster, Cloud Map, ALB, IAM, logs, 2 Fargate services |
| `infra/github-oidc.yaml` | One-time IAM role + OIDC provider so GitHub Actions can deploy without stored keys |
| `.github/workflows/` | `deploy.yml` (push to main → full deployment), `destroy.yml` (manual teardown with confirmation) |
| `../inventory-agent-aws-deployment-notes/` | Learner guide as self-contained HTML pages (kept in the sibling notes folder): `index.html` (start here), `01-understand-the-system.html`, `02-deploy-by-hand.html`, `03-automate-with-github-actions.html` |
| `docker-compose.yaml` | Local run |

## Deploy to AWS

Follow **[`../inventory-agent-aws-deployment-notes/02-deploy-by-hand.html`](../inventory-agent-aws-deployment-notes/02-deploy-by-hand.html)** (open it in a browser) — 11 steps, all AWS CLI, each explained. Short version:

```bash
VERSION=v1; REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# secrets (once)
aws ssm put-parameter --name /inventory/openai-api-key --type SecureString --value "$OPENAI_API_KEY" --overwrite --region $REGION
aws ssm put-parameter --name /inventory/api-key        --type SecureString --value "$API_KEY"        --overwrite --region $REGION

# images
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR
docker build --platform linux/amd64 -f backend/Dockerfile  -t $ECR/inventory-backend:$VERSION  . && docker push $ECR/inventory-backend:$VERSION
docker build --platform linux/amd64 -f frontend/Dockerfile -t $ECR/inventory-frontend:$VERSION . && docker push $ECR/inventory-frontend:$VERSION

# everything else
aws cloudformation deploy --region $REGION --stack-name inventory-stack-$VERSION \
  --template-file infra/inventory-stack.yaml --capabilities CAPABILITY_IAM --disable-rollback --no-fail-on-empty-changeset \
  --parameter-overrides Version=$VERSION BackendImage=$ECR/inventory-backend:$VERSION FrontendImage=$ECR/inventory-frontend:$VERSION

# cleanup (removes every resource of this version)
aws cloudformation delete-stack --stack-name inventory-stack-$VERSION --region $REGION
```

## Deploy with GitHub Actions (push to deploy)

`.github/workflows/deploy.yml` runs the same steps on every push to `main`: build → push to ECR
(tag = commit SHA) → secrets to SSM → `cloudformation deploy` → smoke test → URL in the run summary.
Authentication is GitHub OIDC → IAM role (no AWS keys in GitHub). Full walkthrough and explainer:
**[`../inventory-agent-aws-deployment-notes/03-automate-with-github-actions.html`](../inventory-agent-aws-deployment-notes/03-automate-with-github-actions.html)**. One-time setup in short:

```bash
# 1. AWS: create the role GitHub may assume (once)
aws cloudformation deploy --region us-east-1 --stack-name github-oidc-inventory-agent \
  --template-file infra/github-oidc.yaml --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubRepo=<owner>/inventory-agent-aws
aws cloudformation describe-stacks --region us-east-1 --stack-name github-oidc-inventory-agent \
  --query "Stacks[0].Outputs[?OutputKey=='DeployRoleArn'].OutputValue" --output text

# 2. GitHub: Settings -> Secrets and variables -> Actions
#    variables: AWS_ROLE_ARN (from above), AWS_REGION=us-east-1, DEPLOY_VERSION=v1, OPENAI_MODEL=gpt-4o-mini
#    secrets:   OPENAI_API_KEY, API_KEY

# 3. push to main (or Actions -> "Deploy to AWS" -> Run workflow)
```

Tear down: **Actions → "Destroy AWS deployment" → Run workflow** (type `DELETE`), then delete the
`github-oidc-inventory-agent` stack from your laptop.

## Run locally

```bash
cp .env.example .env            # fill in OPENAI_API_KEY and API_KEY
docker compose up --build       # UI on http://localhost:7860, API on http://localhost:8000
```

## What changed vs. the Azure version

- **LLM:** Groq / Llama 3.3 → **OpenAI** (`langchain-openai`, model via `OPENAI_MODEL`, default `gpt-4o-mini`).
- **Volume path:** persistent volume now mounts at `/app/data` (was `/app/db`). Mounting at `/app/db`
  hides `schema.sql` that ships in the image and crashes `init_db` on a real cloud mount.
- **Health check:** uses `python -c urllib` instead of `curl` (not installed in `python:3.11-slim`).
- **Seeding:** sample SKUs are inserted only if missing (`INSERT OR IGNORE`), so edits survive restarts.
- **Errors:** `/chat` returns HTTP 502 with the agent/LLM error text instead of a bare 500.
- **Gradio:** pinned to `>=6,<7` (6.x removed the `type=` argument on `Chatbot`).
- Azure App Service `startup.sh` files removed; `infra/` CloudFormation added.
