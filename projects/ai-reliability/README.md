# AI Reliability Lab

Four measured demos of the levers that turn an LLM from a flaky text generator
into a dependable software component. Each demo runs the same task many times
under contrasting conditions and scores the outputs, so you see a distribution
instead of one lucky (or unlucky) example.

Core logic is adapted from the study prototypes in `study/09-ai-reliability/`:

1. **Variance & Determinism** (`variance-determinism.py`) — output constraints vs. sampling noise.
2. **Chain-of-Thought vs Direct** (`cot-vs-direct-answer.py`) — CoT as a reliability lever.
3. **Tool Schema Calibration** (`tool-schema-calibration.py`) — does the model route on tool names or descriptions?
4. **Tool Error Injection** (`tool-call-error-injection.py`) — does the model admit a failed tool call, or invent data?

---

## Features

1. **🎲 Variance & Determinism** — extracts sentiment and entities from a review
   5 times under each of three strategies at temperature 0.7: an unconstrained
   prompt, a prompt that asks for JSON, and an API-enforced strict JSON schema.
   Every output is graded by a strict `json.loads()` parser (no fence
   stripping or repair). Reports unique responses, consistency, parse rate, and
   schema-match rate per strategy.
2. **🧠 Chain-of-Thought vs Direct** — runs one preset multi-step reasoning
   problem (`grid`, `family`, `schedule`, `inventory`, `boxes`) 5 times with a
   direct prompt and 5 times with "think step by step". Only the final line is
   scored, so CoT is never credited for a candidate answer it later rejected.
   Reports accuracy, average latency, and the accuracy-for-latency trade-off.
3. **🧭 Tool Schema Calibration** — offers three weather tools (current,
   forecast, history) under a 2x2: descriptive vs. opaque names × loose vs.
   tight descriptions, with `tool_choice="required"` and temperature 0. Your
   question is routed under all four conditions, then 12 labelled queries fill
   in the accuracy matrix and the name/description lift.
4. **🚨 Tool Error Injection** — a bounded (6-round) agent loop with a
   `get_weather` tool whose second call always returns HTTP 503. Your question
   runs under a plain system prompt and one that demands explicit error
   reporting. Each answer is scored for: admitted failure, surfaced the error
   code, and invented weather for the city whose call failed.

API calls inside each demo run in parallel (up to 8 at a time) so every
request finishes well inside the 60 s Nginx proxy timeout. The demos use a
non-reasoning model (`gpt-4o-mini`) on purpose: reasoning models think
internally even when told not to, which erases the gaps being measured.

---

## Project Details

1. **Project type**: Container app (Flask + Docker).
2. **Project folder**: `projects/ai-reliability/`.
3. **Local URL**: http://localhost:8088.
4. **Production URL**: https://app.techtoday.click/ai-reliability/.
5. **Local port**: `8088` → container `5000`.
6. **EC2 host port**: `5008` → container `5000`.
7. **ECR repository**: `techtoday/ai-reliability`.
8. **Production service name**: `ai-reliability`.
9. **Production Compose file**: `~/apps/ai-reliability/docker-compose.yml`.
10. **PATH_PREFIX**: `/ai-reliability`.
11. **Workflow file**: `.github/workflows/deploy-ai-reliability.yml`.
12. **Trigger paths**: `projects/ai-reliability/**` and the workflow file itself.

### Routes

All `POST` routes read `{"message": "<text>"}`, return `{"result": "<text report>"}`,
return `400` for an empty (or, for `/cot`, unknown) input, `500` on an
unexpected failure, and share the 10-POSTs-per-hour-per-IP rate limit (`429`).

1. `GET /` — single-page UI with the `PATH_PREFIX` injected into `data-api-base`.
2. `GET /css/<path:filename>` — stylesheets.
3. `GET /js/<path:filename>` — scripts.
4. `GET /info/<path:filename>` — "how this demo works" explainer pages.
5. `POST /variance` — `message` is a customer review (truncated to 1,000 chars). Optional `strategy`: `all` (default), `A`, `B`, `C`; `temperature`: `0`, `0.7` (default), `1.2`. 5 model calls per strategy.
6. `POST /cot` — `message` is a preset: `grid`, `family`, `schedule`, `inventory`, or `boxes`. Optional `strategy`: `both` (default), `direct`, `cot`; `temperature`: `0`, `0.7` (default), `1.2`. 5 model calls per strategy.
7. `POST /routing` — `message` is a weather question (truncated to 300 chars). Optional `names`: `both` (default), `descriptive`, `opaque`; `descriptions`: `both` (default), `loose`, `tight`. 13 model calls per condition (up to 52).
8. `POST /errors` — `message` is a weather question (truncated to 300 chars). Optional `prompt`: `both` (default), `A`, `B`; `fail_on_call`: `1`, `2` (default), `0` (no failure). Up to 6 model calls per scenario.

Each tile exposes these options as dropdowns; an invalid value returns `400`.

### Project Structure

```text
projects/ai-reliability/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service + one-off CLI service per demo
├── requirements.txt        # flask, flask-cors, python-dotenv, requests, openai
├── .env.example            # OPENAI_API_KEY (+ optional OPENAI_MODEL)
├── .gitignore
├── deploy.yml.template     # source of .github/workflows/deploy-ai-reliability.yml
├── linkedin.txt
└── src/
    ├── index.html          # four demo tiles, each title with an ⓘ link to its explainer
    ├── css/style.css       # shared TechToday dark theme + .info-link icon
    ├── css/info.css        # explainer page layout, flow diagrams, code blocks
    ├── js/main.js          # setupCard() wiring for each tile
    ├── js/info.js          # syntax highlighting + Copy button on explainer code
    ├── info/               # one explainer per demo: variance, cot, routing, errors
    └── python/
        ├── app.py          # Flask Blueprint, PATH_PREFIX, rate limit, routes
        ├── config.py       # .env loading, OpenAI client, parallel_map, bar
        ├── rate_limiter.py # sliding-window per-IP limiter
        ├── variance.py     # Variance & Determinism
        ├── cot.py          # Chain-of-Thought vs Direct
        ├── tool_routing.py # Tool Schema Calibration
        └── tool_errors.py  # Tool Error Injection
```

---

## Environment Variables

1. `OPENAI_API_KEY` (required) — used by all four demos. Create one at
   https://platform.openai.com/api-keys. In production it is read from the
   shared `techtoday/secrets` secret.
2. `OPENAI_MODEL` (optional) — chat model override, default `gpt-4o-mini`.
   Keep it a non-reasoning model.

`.env` is gitignored and must never be committed.

---

## Prerequisites and First Run

Complete the one-time machine and AWS setup in [../SETUP.md](../SETUP.md).
Every `docker compose` command needs a running Docker daemon:

1. **macOS or Windows**: open Docker Desktop and wait until it reports running.
2. **Linux**: `sudo systemctl start docker`.

Then verify with `docker info`. From the repository root:

```bash
cd projects/ai-reliability
cp .env.example .env
# edit .env and set OPENAI_API_KEY
docker compose build web
docker compose up web
```

Open http://localhost:8088.

---

## Daily Local Development

`./src` is bind-mounted into the container, so HTML/CSS/JS edits show up on
refresh. The Flask dev server does not auto-reload Python, so restart after
editing `src/python/*.py`. Rebuild only after changing `Dockerfile` or
`requirements.txt`.

```bash
docker compose restart web              # pick up Python changes
docker compose build web                # after Dockerfile / requirements.txt changes
docker compose logs -f web              # stream logs
docker compose run --rm web bash        # shell in a fresh container
docker compose ps                       # status
docker compose down                     # stop and remove containers
```

Run a demo directly from the CLI (prints the same text report as the UI):

```bash
docker compose run --build --rm variance   # default smartphone review
docker compose run --rm cot                # all five problems
docker compose run --rm routing            # "Will it snow in Oslo this weekend?"
docker compose run --rm errors             # "What is the current weather in Tokyo and London?"
```

Quick API check against the running web service:

```bash
curl -s -X POST http://localhost:8088/cot \
  -H "Content-Type: application/json" -d '{"message":"family"}'
```

The project keeps no business data. The rate limiter stores request timestamps
in SQLite at `/tmp/ai_rate_limit.db` inside the container; it survives
`docker compose restart web` and is cleared by recreating the container
(`docker compose down && docker compose up web`).

---

## Production Setup

The self-provisioning workflow `.github/workflows/deploy-ai-reliability.yml`
creates the `techtoday/ai-reliability` ECR repository, seeds the image, writes
`~/secrets/ai-reliability.env`, adds the Nginx `/ai-reliability/` location
file under `/etc/nginx/conf.d/app-locations/` (POST rate limiting: 10 requests
upfront, 1r/m refill, `429` on excess), auto-ensures the `app-locations/*.conf`
include, `/etc/nginx/conf.d/00-rate-limit.conf`, and
`/etc/nginx/conf.d/app-locations/00-rate-limit-response.conf`, and creates
`~/apps/ai-reliability/docker-compose.yml` (image from ECR,
`PATH_PREFIX=/ai-reliability`, `5008:5000`) on every push. No manual ECR,
image seed, Nginx, env-file, or Compose wiring is needed.

**One manual step, only if missing**: `OPENAI_API_KEY` is normally already in
`techtoday/secrets` (used by other projects). If it is not, add it locally as
the `techtoday` IAM user before the first deploy (the EC2 role is read-only):

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['OPENAI_API_KEY']='your-key'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

---

## Commit and Automatic Deployment

Push to `staging` first, verify, then promote to `main` (see
[../DEPLOYMENT.md](../DEPLOYMENT.md)):

```bash
git checkout staging
git add projects/ai-reliability .github/workflows/deploy-ai-reliability.yml
git commit -m "feat(ai-reliability): add AI Reliability Lab container project"
git push origin staging
```

Watch the run under the repository's **Actions** tab. After verifying:

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

Pushes touching `projects/ai-reliability/**` or the workflow file trigger
`deploy-ai-reliability.yml`, which pushes the image to
`techtoday/ai-reliability` and restarts only the `ai-reliability` service on
EC2 (host port `5008`).

---

## Production Verification and Troubleshooting

```bash
curl -I https://app.techtoday.click/ai-reliability/
curl -s -X POST https://app.techtoday.click/ai-reliability/cot \
  -H "Content-Type: application/json" -d '{"message":"family"}'
```

For a `502 Bad Gateway` or failing demos, connect to EC2:

```bash
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
docker compose -f ~/apps/ai-reliability/docker-compose.yml ps
docker compose -f ~/apps/ai-reliability/docker-compose.yml logs --tail=50 ai-reliability
cat ~/apps/ai-reliability/docker-compose.yml
grep -c OPENAI_API_KEY ~/secrets/ai-reliability.env   # must print 1
curl -I http://localhost:5008/ai-reliability/
```

The service must run `command: python src/python/app.py` with
`PATH_PREFIX=/ai-reliability`. Every demo reporting `Error: OPENAI_API_KEY is
not set` means the key is missing from `techtoday/secrets` — add it (see
Production Setup) and re-run the workflow. Restart only this project:

```bash
docker compose -f ~/apps/ai-reliability/docker-compose.yml up -d
```

---

## Rollback

List recent tags locally, then pin one on EC2:

```bash
aws ecr describe-images --repository-name techtoday/ai-reliability --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
cd ~/apps/ai-reliability
sed -i 's/:latest/:<build-tag>/' docker-compose.yml   # <build-tag> from the list above
docker compose pull
docker compose up -d
curl -I https://app.techtoday.click/ai-reliability/
```

The next push re-creates the Compose file with `:latest`.

---

## Manual Deployment

Use only when GitHub Actions is unavailable. Build (linux/amd64) and push locally:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
cd projects/ai-reliability
docker build --platform linux/amd64 -t techtoday/ai-reliability .
docker tag techtoday/ai-reliability:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/ai-reliability:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/ai-reliability:latest
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2 (the Compose file must already exist from a previous workflow run):

```bash
docker compose -f ~/apps/ai-reliability/docker-compose.yml pull
docker compose -f ~/apps/ai-reliability/docker-compose.yml up -d
```

If the pull reports `no space left on device`, run `docker system df`, then
`docker container prune -f`, `docker builder prune -af`, and
`docker image prune -af` before retrying the two commands above.

---

## Deployment Status

Single-service project, fully automated: `.github/workflows/deploy-ai-reliability.yml`
builds and pushes the one image, provisions ECR, the env file, Nginx, and the
Compose service, and restarts `ai-reliability` on every push to `staging` or
`main` that touches the trigger paths.
