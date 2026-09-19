# AI Systems Lab

An interactive laboratory showcasing prompt engineering trade-offs, model sycophancy under pressure, and multi-judge agentic dispute resolution, served through a Flask web application running in a Docker container behind shared Nginx routing.

Core logic is adapted from the study materials under `study/08-ai-systems/`:
1. **Prompting Strategy Benchmark** (`direct-zero-shot-few-shot.py`): Quantifies the accuracy gain vs token cost trade-off between Direct prompting, Zero-Shot Chain-of-Thought (CoT), and Few-Shot CoT on multi-step reasoning problems.
2. **The Sycophancy Trap** (`sycophancy-trap.py`): Demonstrates how models cave under escalating user pressure across four conversational rounds (cold question, pushback, refusal, compliance demand), testing factual anchors, code review security judgements, and guilt trips.
3. **The Refund Bench** (`ai-systems.html`): Implements an agentic dispute resolution pipeline with evidence freezing, co-reference grievance extraction, self-consistency voting across K=3 independent judges, and code-calculated pricing with a hard ₹2,000 auto-approval cap.

---

## Features

1. **Prompting Strategy Benchmark**: Evaluates a reasoning question across Direct, Zero-Shot CoT, and Few-Shot CoT, reporting stated answers, token multipliers, and latency.
2. **The Sycophancy Trap**: Runs a 4-round pressure dialogue to measure whether the model holds its ground or capitulates.
3. **The Refund Bench**: Multi-stage agentic workflow parsing customer complaints against order evidence snapshots, tallying independent judge rulings, enforcing financial caps, and synthesizing customer replies.

---

## Project Details

1. **Project type**: Container app (Flask + Docker).
2. **Project folder**: `projects/ai-systems/`.
3. **Local URL**: `http://localhost:8087`.
4. **Production URL**: `https://app.techtoday.click/ai-systems/`.
5. **Local port**: `8087` maps to container `5000`.
6. **EC2 host port**: `5007` maps to container `5000`.
7. **ECR repository**: `techtoday/ai-systems`.
8. **Production service name**: `ai-systems`.
9. **PATH_PREFIX**: `/ai-systems`.
10. **Workflow filename**: `deploy-ai-systems.yml`.
11. **Trigger path**: `projects/ai-systems/**`.

### Routes

1. `GET /`: Serves the single-page application UI with environment-injected API prefix.
2. `GET /css/<path:filename>`: Serves static stylesheets.
3. `GET /js/<path:filename>`: Serves static JavaScript files.
4. `GET /info/<path:filename>`: Serves dedicated "How this demo works" explainer pages from `src/info/`.
5. `POST /benchmark`: Expects `{"message": "<question_or_preset>"}` and returns benchmark metrics across strategies.
6. `POST /sycophancy`: Expects `{"message": "<case_id_or_question>"}` and returns round-by-round pushback evaluation.
7. `POST /refund`: Expects `{"message": "<complaint_text>"}` and returns grievance extractions, bench tallies, settlement amounts, and synthesized communication.

---

## Project Structure

```text
projects/ai-systems/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── README.md
└── src/
    ├── index.html            # Main UI with ⓘ info links on each demo card
    ├── css/
    │   ├── style.css         # Dark theme styling, badges, KPIs, chat bubbles
    │   └── info.css          # Styles for explainer pages (flows, code blocks, copy btn)
    ├── js/
    │   ├── main.js           # Frontend API calls and custom output renderers
    │   └── info.js           # Syntax highlighting & clipboard copy buttons
    ├── info/                 # Dedicated "How this works" explainer pages
    │   ├── benchmark.html    # Prompting Benchmark explainer (Direct vs Zero-Shot vs Few-Shot)
    │   ├── sycophancy.html   # Sycophancy Trap explainer (4-round pressure protocol)
    │   └── refund.html       # The Refund Bench explainer (4-stage multi-judge pipeline)
    └── python/
        ├── app.py            # Flask server, blueprint routing & rate limiter
        ├── prompt_benchmark.py # Strategy benchmarking & token multiplier calculations
        ├── sycophancy.py     # 4-round pressure dialogue runner & verdict classification
        ├── refund_bench.py   # 4-stage dispute resolution & 3-judge model evaluation
        ├── config.py         # Multi-provider client initializers (OpenAI, Gemini, Groq)
        └── rate_limiter.py   # Sliding window IP-based rate limiting
```

---

## Environment Variables

1. `OPENAI_API_KEY` (required): API key for OpenAI chat completions (`gpt-4o-mini`), used by Judge 1 and the extraction/settlement stages.
2. `OPENAI_MODEL` (optional): Model name override for OpenAI, defaults to `gpt-4o-mini`.
3. `GEMINI_API_KEY` (optional/recommended): API key for Google Gemini, used by Judge 2 via Google's OpenAI-compatible endpoint.
4. `GEMINI_MODEL` (optional): Model name override for Gemini, defaults to `gemini-2.0-flash` / `gemini-3.8-flash`.
5. `GROK_API_KEY` (optional/recommended): API key for Groq/Grok, used by Judge 3 via Groq's OpenAI-compatible endpoint.
6. `GROK_MODEL` (optional): Model name override for Groq/Grok, defaults to `gpt-oss-20b`.
7. `.env` is gitignored and must never be committed.

---

## Prerequisites and First Run

Complete the one-time machine and AWS setup in [../SETUP.md](../SETUP.md). Every Docker command requires a running Docker daemon:

1. **Linux**: Run `sudo systemctl start docker`, then verify with `docker info`.
2. **macOS or Windows**: Open Docker Desktop and wait until running, then verify with `docker info`.

### First Local Run

From the repository root:

```bash
cd projects/ai-systems
cp .env.example .env
# Edit .env and add OPENAI_API_KEY
docker compose build web
docker compose up web
```

Open `http://localhost:8087` in your browser.

---

## Daily Local Development

Source files under `src/` are bind-mounted into the container, so code edits take effect immediately without rebuilding the image. Rebuild only when changing `Dockerfile` or `requirements.txt`:

1. Build the web service:
   ```bash
   docker compose build web
   ```
2. Stream container logs:
   ```bash
   docker compose logs -f web
   ```
3. Run one-off CLI features:
   ```bash
   docker compose run --rm benchmark
   docker compose run --rm sycophancy
   docker compose run --rm refund
   ```
4. Access container shell:
   ```bash
   docker compose run --rm web bash
   ```
5. Check container status:
   ```bash
   docker compose ps
   ```
6. Stop and remove containers:
   ```bash
   docker compose down
   ```

---

## Production Setup

The self-provisioning deploy workflow creates the ECR repository, seeds the image, writes `~/secrets/ai-systems.env`, drops the Nginx location file under `/etc/nginx/conf.d/app-locations/` (with POST rate limiting enabled: 10 requests upfront, 1r/m refill), auto-ensures the `app-locations/*.conf` include and `00-rate-limit.conf`, and creates the per-project Compose service on EC2 automatically on every push.

**One manual step**: If any of the 3 provider keys or model names are not already in `techtoday/secrets`, add them locally as the `techtoday` IAM user before the first deploy:

- `OPENAI_API_KEY` (usually already present)
- `GROQ_API_KEY` (usually already present from basic/interviewiq)
- `GEMINI_API_KEY` (new for AI Systems)
- `GEMINI_MODEL`: `gemini-3.8-flash`
- `GROK_MODEL`: `openai/gpt-oss-20b`

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['GEMINI_API_KEY']='your-gemini-key'; d['GEMINI_MODEL']='gemini-3.8-flash'; d['GROK_MODEL']='openai/gpt-oss-20b'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

If all keys already exist in `techtoday/secrets`, no manual AWS steps are needed.

---

## Commit and Automatic Deployment

Follow the repository branch flow (`staging` for pre-production testing, `main` for release):

1. Switch to staging and commit:
   ```bash
   git checkout staging
   git add projects/ai-systems/ .github/workflows/deploy-ai-systems.yml
   git commit -m "feat(ai-systems): add AI Systems Lab container project"
   git push origin staging
   ```
2. Watch the GitHub Actions run under the **Actions** tab.
3. After verifying staging, promote to main:
   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

Pushes touching `projects/ai-systems/**` or `.github/workflows/deploy-ai-systems.yml` trigger automated build and deployment to EC2.

---

## Production Verification and Troubleshooting

1. Check HTTP response header:
   ```bash
   curl -I https://app.techtoday.click/ai-systems/
   ```
2. Verify rate limiter response:
   ```bash
   curl -X POST https://app.techtoday.click/ai-systems/benchmark \
     -H "Content-Type: application/json" \
     -d '{"message":"pens"}'
   ```
3. Inspect production service logs on EC2:
   ```bash
   ssh -i ~/.ssh/techtoday.pem ubuntu@<EC2_HOST> "docker compose -f ~/apps/ai-systems/docker-compose.yml logs -f"
   ```
4. Restart the production service:
   ```bash
   ssh -i ~/.ssh/techtoday.pem ubuntu@<EC2_HOST> "docker compose -f ~/apps/ai-systems/docker-compose.yml restart"
   ```

---

## Rollback

To rollback to a previous image tag in ECR:

1. List available image tags:
   ```bash
   aws ecr list-images --repository-name techtoday/ai-systems --region ap-south-1
   ```
2. On EC2, update image tag in `~/apps/ai-systems/docker-compose.yml`:
   ```bash
   ssh -i ~/.ssh/techtoday.pem ubuntu@<EC2_HOST> "sed -i 's/:latest/:<previous-tag>/g' ~/apps/ai-systems/docker-compose.yml && docker compose -f ~/apps/ai-systems/docker-compose.yml up -d"
   ```
3. Verify live URL:
   ```bash
   curl -I https://app.techtoday.click/ai-systems/
   ```

---

## Manual Deployment

If GitHub Actions is unavailable, build and push manually:

1. Log in to ECR:
   ```bash
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
   ```
2. Build and push image for linux/amd64:
   ```bash
   docker buildx build --platform linux/amd64 -t <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/techtoday/ai-systems:latest projects/ai-systems --push
   ```
3. SSH to EC2 and restart service:
   ```bash
   ssh -i ~/.ssh/techtoday.pem ubuntu@<EC2_HOST> "docker compose -f ~/apps/ai-systems/docker-compose.yml pull && docker compose -f ~/apps/ai-systems/docker-compose.yml up -d"
   ```

---

## Deployment Status

Full automated CI/CD deployment is implemented via `.github/workflows/deploy-ai-systems.yml`. The workflow provisions ECR, builds and pushes container images, creates the EC2 Compose service, maps host port `5007`, configures Nginx path routing at `/ai-systems/`, and enforces rate limiting.
