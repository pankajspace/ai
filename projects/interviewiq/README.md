# InterviewIQ

An AI-powered mock interview coach that evaluates candidate answers using
**tool-calling agents**.  The LLM dynamically chooses which evaluation tools
to invoke (filler-word detection, STAR structure analysis, keyword relevance
scoring), then synthesises coaching feedback.  Session memory tracks
performance across turns and identifies the weakest area without recency bias.

Built from the best parts of two study implementations:
- Authentic **ReAct-style tool-calling loop** (the LLM decides which tools
  to call) from the class instructor's reference.
- **Regex-based evaluation tools** with grammatical inflection matching and
  calibrated scoring from the student's extended version.
- **OOP session memory** with anti-recency-bias weakest-area detection.

---

## Features

1. **Mock Interview** — answer interview questions and get AI-powered
   evaluation with relevance score, STAR coverage, and filler-word analysis.
2. **Ask the Coach** — ask meta-questions mid-session ("What's my weakest
   area?") and the agent calls `generate_final_report` via the tool-calling
   loop to answer.
3. **Session Report** — aggregated report across all answered questions with
   average relevance, weakest area, and total filler count.
4. **Reset Session** — clear memory and start a fresh mock interview.

---

## Project Details

1. **Project type**: Container app (Flask + Docker).
2. **Project folder**: `projects/interviewiq/`.
3. **Local URL**: http://localhost:8085
4. **Production URL**: https://app.techtoday.click/interviewiq/
5. **Local port**: `8085` → container `5000`.
6. **EC2 host port**: `5005` → container `5000`.
7. **ECR repository**: `techtoday/interviewiq`.
8. **Production service name**: `interviewiq`.
9. **PATH_PREFIX**: `/interviewiq`.
10. **Workflow filename**: `deploy-interviewiq.yml`.
11. **Trigger path**: `projects/interviewiq/**`.

### Routes

1. `GET /` — serve the SPA.
2. `GET /questions` — return all interview questions from the bank.
3. `POST /evaluate` — evaluate a candidate answer (`{question_id, answer}`).
4. `POST /coach` — handle a meta-question (`{message}`).
5. `GET /report` — generate the aggregated session report.
6. `POST /reset` — clear session memory.

---

## Project Structure

```
projects/interviewiq/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service on 8085:5000
├── requirements.txt        # flask, flask-cors, python-dotenv, requests, openai
├── .env.example            # GROQ_API_KEY (required), OPENAI_API_KEY (optional)
├── .gitignore              # ignores .env, caches, venvs
├── deploy.yml.template     # CI/CD workflow to copy into .github/workflows/
├── linkedin.txt            # launch/update copy (empty until ready)
└── src/
    ├── python/
    │   ├── app.py           # Flask server: Blueprint + PATH_PREFIX routing
    │   ├── config.py        # .env loader, Groq/OpenAI provider switch
    │   ├── agent.py         # Tool-calling evaluator agent + session memory
    │   ├── tools.py         # Deterministic evaluation tools (regex-based)
    │   └── interview_bank.py # 5 categorized questions with keywords + samples
    ├── index.html           # single-page UI (served by Flask)
    ├── css/style.css        # dark theme (shares TechToday design tokens)
    └── js/main.js           # front-end behavior, no frameworks
```

---

## Environment Variables

1. **`GROQ_API_KEY`** (required) — free-tier Groq API key for LLM calls.
   Get one at https://console.groq.com/keys.  Used by the evaluator agent
   for tool-calling and feedback synthesis.
2. **`OPENAI_API_KEY`** (optional) — OpenAI API key used as a fallback when
   `GROQ_API_KEY` is not set.  The evaluator agent works in deterministic
   mode (tools only, no LLM feedback) when neither key is available.
3. `.env` is gitignored and must never be committed.

---

## Prerequisites and First Run

Complete the one-time prerequisites in [../SETUP.md](../SETUP.md), then
start Docker and verify it with `docker info`.  On Linux, use
`sudo systemctl start docker`; on macOS or Windows, start Docker Desktop.

```bash
cd projects/interviewiq
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
docker compose build web
docker compose up web
```

Open http://localhost:8085.

---

## Daily Local Development

Source files under `src/` are mounted into the container, so normal edits do
not need a rebuild.  Rebuild after changing `Dockerfile` or
`requirements.txt`:

```bash
docker compose build web
```

Useful commands:

```bash
docker compose logs -f web          # follow logs
docker compose run --rm web bash    # shell into the container
docker compose ps                   # check running services
docker compose down                 # stop and remove containers
```

---

## Production Setup

The self-provisioning deploy workflow creates the ECR repository, seeds the
image, writes `~/secrets/interviewiq.env`, adds the Nginx
`/interviewiq/` location file under `/etc/nginx/conf.d/app-locations/`,
auto-ensures the `app-locations/*.conf` include in the `app.techtoday.click`
SSL server block, and creates the per-project Compose service automatically
on every push.

**One manual step**: if `GROQ_API_KEY` or `OPENAI_API_KEY` are not already
in `techtoday/secrets`, add them before the first deploy:

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['GROQ_API_KEY']='your-key'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

---

## Commit and Automatic Deployment

```bash
git checkout main
git add projects/interviewiq .github/workflows/deploy-interviewiq.yml
git commit -m "Add interviewiq project"
git push origin main
```

The push under `projects/interviewiq/**` triggers `deploy-interviewiq.yml`,
which builds, pushes to `techtoday/interviewiq` on ECR, and restarts only
the `interviewiq` service on EC2.

---

## Production Verification and Troubleshooting

```bash
curl -I https://app.techtoday.click/interviewiq/
```

If the response is not `200`, check the service:

```bash
# SSH into EC2
docker compose -f ~/apps/interviewiq/docker-compose.yml logs --tail 50
docker compose -f ~/apps/interviewiq/docker-compose.yml ps
docker compose -f ~/apps/interviewiq/docker-compose.yml restart
```

---

## Rollback

1. Find the desired image tag in the ECR console or via CLI:
   ```bash
   aws ecr describe-images --repository-name techtoday/interviewiq \
     --region us-east-1 --query 'imageDetails[*].imageTags' --output table
   ```
2. On EC2, update the image tag and restart:
   ```bash
   cd ~/apps/interviewiq
   # Edit docker-compose.yml: change :latest to the rollback tag
   docker compose pull
   docker compose up -d
   ```
3. Verify: `curl -I https://app.techtoday.click/interviewiq/`

---

## Manual Deployment

If the workflow fails, deploy manually:

```bash
# Build from the project directory (linux/amd64 for EC2)
cd projects/interviewiq
docker build --platform linux/amd64 -t interviewiq .

# Tag and push to ECR
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
ECR=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR
docker tag interviewiq $ECR/techtoday/interviewiq:latest
docker push $ECR/techtoday/interviewiq:latest

# On EC2: pull and restart
docker compose -f ~/apps/interviewiq/docker-compose.yml pull
docker compose -f ~/apps/interviewiq/docker-compose.yml up -d

# Recover disk space
docker image prune -af
```

---

## Deployment Status

Deployment automation is ready.  The self-provisioning workflow
(`deploy-interviewiq.yml`) handles all AWS and EC2 provisioning on the
first push.
