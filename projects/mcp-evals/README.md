# MCP & Evals Lab

Three live demos that show how an AI app gets new abilities through the
**Model Context Protocol (MCP)**, and how you test that app with **evals**
before real users depend on it. Everything uses a small cricket-score
assistant. All scores and player stats are made-up demo data; no real cricket
API is called.

Core logic is adapted from the class code in `study/10-mcp-evals/notes/`
(theory: [study/ai-demos/mcp-evals.html](../techtoday/study/ai-demos/mcp-evals.html)):

1. **MCP Plumbing** (`step1_client.py`) — talk to an MCP server with no LLM.
2. **Cricket Agent** (`step2_agent.py`) — the LLM picks the MCP tool; our code calls it.
3. **Eval Suite** (`step3_evals.py`) — five test cases, two code checks, a score.

The MCP server itself (`cricket_server.py`) is the class file with numbered step
comments added (code unchanged).

Each tile's title has a green ⓘ icon that opens its explainer page under
`src/info/` (`plumbing.html`, `agent.html`, `evals.html`): the concept, the
theory, a request-flow diagram, a Mermaid code-flow diagram, and every Python
file the demo runs, complete and unedited. After editing a Python file, re-embed
it in every explainer that shows it so the pages stay verbatim copies.

---

## Features

1. **🔌 MCP Plumbing** — the client starts `cricket_server.py` as a child
   process over the `stdio` transport, then shows the three JSON-RPC steps:
   `initialize` (handshake, server name, protocol version), `tools/list` (each
   tool's name, description, and auto-generated input schema), and
   `tools/call` (one tool called by hand). The report ends with the server's
   own stderr log. No API key and no LLM are involved.
2. **🏏 Cricket Agent** — sends your question plus the MCP tool menu cards
   (converted with `to_openai_format`) to a Groq model. The model replies with
   a tool call ("prescription"); our code runs it through MCP, sends the result
   back, and the model writes the final answer. The report shows every
   `LLM SAYS`, `[server]`, `TOOL RETURNED`, and `FINAL ANSWER` line. With
   tools **Off**, the model has only its frozen knowledge (it either refuses or
   makes up a score).
3. **🧪 Eval Suite** — runs the five class test cases against the agent. Each
   case checks (1) the agent called the expected tool, or no tool for
   "2 + 2", and (2) the final answer contains the key fact (`287`, `90`,
   `164`, `78`, `4`). Choosing **Both** scores the agent with and without MCP
   tools side by side (typically 5/5 vs 1/5).

Every agent run starts its own MCP server process, so runs are isolated. Eval
runs execute in parallel (up to 8 at a time); the largest choice (10 agent runs)
finishes in a few seconds, well inside the 60 s Nginx proxy timeout.

### Architecture

```text
Browser ──POST──▶ Flask (app.py) ──▶ mcp_client.py / agent.py / evals.py
                                         │  MCP client (ClientSession)
                                         ▼  stdio: initialize · tools/list · tools/call
                                     cricket_server.py (FastMCP, child process)
                    agent.py ──HTTPS──▶ Groq (OpenAI-compatible API, tool calling)
```

The MCP SDK passes the server child process only a minimal environment, so
`GROQ_API_KEY` never reaches the tool server.

---

## Project Details

1. **Project type**: Container app (Flask + Docker).
2. **Project folder**: `projects/mcp-evals/`.
3. **Local URL**: http://localhost:8089.
4. **Production URL**: https://app.techtoday.click/mcp-evals/.
5. **Local port**: `8089` → container `5000`.
6. **EC2 host port**: `5009` → container `5000`.
7. **ECR repository**: `techtoday/mcp-evals`.
8. **Production service name**: `mcp-evals`.
9. **Production Compose file**: `~/apps/mcp-evals/docker-compose.yml`.
10. **PATH_PREFIX**: `/mcp-evals`.
11. **Workflow file**: `.github/workflows/deploy-mcp-evals.yml`.
12. **Trigger paths**: `projects/mcp-evals/**` and the workflow file itself.

### Routes

All `POST` routes read `{"message": "<text>"}` plus optional dropdown fields,
return `{"result": "<text report>"}`, return `400` for an empty message or any
value outside the allowed list, `500` on an unexpected failure (or a missing
`GROQ_API_KEY`), and share the 10-POSTs-per-hour-per-IP rate limit (`429`).

1. `GET /` — single-page UI with the `PATH_PREFIX` injected into `data-api-base`.
2. `GET /css/<path:filename>` — stylesheets.
3. `GET /js/<path:filename>` — scripts.
4. `GET /info/<path:filename>` — "how this demo works" explainer pages.
5. `POST /plumbing` — `message` is the tool argument: team names or a player name (truncated to 100 chars). Optional `tool`: `get_live_score` (default), `get_player_stats`. No model calls.
6. `POST /agent` — `message` is a cricket question (truncated to 300 chars). Optional `tools`: `on` (default), `off`, `both`; `temperature`: `0` (default), `0.7`, `1.2`. Up to 5 model calls per run (2 runs for `both`).
7. `POST /evals` — `message` is the test case: `all` (default in the UI) or `1`–`5`. Optional `agent`: `on` (default), `off`, `both`; `temperature`: `0` (default), `0.7`, `1.2`. One agent run per case per agent (up to 10 runs).

Each tile exposes these options as dropdowns. The defaults reproduce the class
scripts exactly (tools on, temperature 0, all five cases).

### Project Structure

```text
projects/mcp-evals/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service + one-off CLI service per class step
├── requirements.txt        # flask, flask-cors, python-dotenv, requests, openai, mcp<2
├── .env.example            # GROQ_API_KEY (+ optional DEMO_MODEL)
├── .gitignore
├── deploy.yml.template     # source of .github/workflows/deploy-mcp-evals.yml
├── linkedin.txt
└── src/
    ├── index.html          # three demo tiles with dropdowns; each title has an ⓘ link to its explainer
    ├── css/style.css       # shared TechToday dark theme + .options dropdown row + .info-link icon
    ├── css/info.css        # explainer page layout, flow diagrams, code blocks (shared, byte-identical)
    ├── js/main.js          # setupCard() wiring + preset pickers
    ├── js/info.js          # explainer accordions, syntax highlighting, Copy buttons, Mermaid (shared)
    ├── info/               # one explainer per demo: plumbing, agent, evals
    └── python/
        ├── app.py            # Flask Blueprint, PATH_PREFIX, rate limit, routes
        ├── config.py         # .env loading, Groq client, MCP server params, parallel_map
        ├── rate_limiter.py   # sliding-window per-IP limiter
        ├── cricket_server.py # MCP server: get_live_score, get_player_stats (demo data)
        ├── mcp_client.py     # Step 1 — MCP Plumbing
        ├── agent.py          # Step 2 — Cricket Agent
        └── evals.py          # Step 3 — Eval Suite
```

---

## Environment Variables

1. `GROQ_API_KEY` (required for Cricket Agent and Eval Suite; MCP Plumbing
   works without it) — free key from https://console.groq.com/keys. In
   production it is read from the shared `techtoday/secrets` secret, where it
   already exists (used by `basic`, `interviewiq`, and `ai-systems`).
2. `DEMO_MODEL` (optional) — Groq model override, default
   `openai/gpt-oss-20b`. It must support tool calling.

`.env` is gitignored and must never be committed.

---

## Prerequisites and First Run

Complete the one-time machine and AWS setup in [../SETUP.md](../SETUP.md).
Every `docker compose` command needs a running Docker daemon:

1. **macOS or Windows**: open Docker Desktop and wait until it reports running.
2. **Linux**: `sudo systemctl start docker`.

Then verify with `docker info`. From the repository root:

```bash
cd projects/mcp-evals
cp .env.example .env
# edit .env and set GROQ_API_KEY
docker compose build web
docker compose up web
```

Open http://localhost:8089.

---

## Daily Local Development

`./src` is bind-mounted into the container, so HTML/CSS/JS edits show up on
refresh. The Flask dev server does not auto-reload Python, so restart after
editing `src/python/*.py`. Edits to `cricket_server.py` apply on the next
request, because every request starts a fresh server process. Rebuild only
after changing `Dockerfile` or `requirements.txt`.

```bash
docker compose restart web              # pick up Python changes
docker compose build web                # after Dockerfile / requirements.txt changes
docker compose logs -f web              # stream logs
docker compose run --rm web bash        # shell in a fresh container
docker compose ps                       # status
docker compose down                     # stop and remove containers
```

Run a class step directly from the CLI (prints the same text report as the UI):

```bash
docker compose run --build --rm plumbing                       # Step 1, no key needed
docker compose run --rm agent "How many runs has Shubman Gill scored this series?"
docker compose run --rm agent --no-tools "What is the live score of India vs West Indies?"
docker compose run --rm evals                                  # all five cases
docker compose run --rm evals 5                                # one case
```

Quick API checks against the running web service:

```bash
curl -s -X POST http://localhost:8089/plumbing \
  -H "Content-Type: application/json" -d '{"message":"Shai Hope","tool":"get_player_stats"}'
curl -s -X POST http://localhost:8089/evals \
  -H "Content-Type: application/json" -d '{"message":"all","agent":"both"}'
```

The project keeps no business data. The rate limiter stores request timestamps
in SQLite at `/tmp/ai_rate_limit.db` inside the container; it survives
`docker compose restart web` and is cleared by recreating the container
(`docker compose down && docker compose up web`).

---

## Production Setup

The self-provisioning workflow `.github/workflows/deploy-mcp-evals.yml`
creates the `techtoday/mcp-evals` ECR repository, seeds the image, writes
`~/secrets/mcp-evals.env`, adds the Nginx `/mcp-evals/` location file under
`/etc/nginx/conf.d/app-locations/` (POST rate limiting: 10 requests upfront,
1r/m refill, `429` on excess), auto-ensures the `app-locations/*.conf`
include, `/etc/nginx/conf.d/00-rate-limit.conf`, and
`/etc/nginx/conf.d/app-locations/00-rate-limit-response.conf`, and creates
`~/apps/mcp-evals/docker-compose.yml` (image from ECR,
`PATH_PREFIX=/mcp-evals`, `5009:5000`) on every push. No manual ECR, image
seed, Nginx, env-file, or Compose wiring is needed.

**One manual step, only if missing**: `GROQ_API_KEY` is normally already in
`techtoday/secrets`. If it is not, add it locally as the `techtoday` IAM user
before the first deploy (the EC2 role is read-only, so `PutSecretValue` on EC2
fails with `AccessDeniedException`):

```bash
CURRENT=$(aws secretsmanager get-secret-value --secret-id techtoday/secrets --query SecretString --output text)
UPDATED=$(echo "$CURRENT" | python3 -c "import sys,json; d=json.load(sys.stdin); d['GROQ_API_KEY']='your-key'; print(json.dumps(d))")
aws secretsmanager put-secret-value --secret-id techtoday/secrets --secret-string "$UPDATED"
```

---

## Commit and Automatic Deployment

Push a branch to deploy it live for testing, verify, then merge into `main`
(see [../DEPLOYMENT.md](../DEPLOYMENT.md)):

```bash
git checkout main && git pull origin main
git checkout -b feat/mcp-evals-short-description
git add projects/mcp-evals .github/workflows/deploy-mcp-evals.yml
git commit -m "feat(mcp-evals): short description"
git push -u origin feat/mcp-evals-short-description
```

Watch the run under the repository's **Actions** tab. After verifying, merge
into `main` (via a pull request, or locally):

```bash
git checkout main
git pull origin main
git merge feat/mcp-evals-short-description
git push origin main
```

Pushes to any branch touching `projects/mcp-evals/**` or the workflow file trigger
`deploy-mcp-evals.yml`, which pushes the image to `techtoday/mcp-evals` and
restarts only the `mcp-evals` service on EC2 (host port `5009`).

---

## Production Verification and Troubleshooting

```bash
curl -I https://app.techtoday.click/mcp-evals/
curl -s -X POST https://app.techtoday.click/mcp-evals/plumbing \
  -H "Content-Type: application/json" -d '{"message":"India vs West Indies"}'
```

The `/plumbing` check needs no API key, so it isolates MCP/container problems
from Groq problems. For a `502 Bad Gateway` or failing demos, connect to EC2:

```bash
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
docker compose -f ~/apps/mcp-evals/docker-compose.yml ps
docker compose -f ~/apps/mcp-evals/docker-compose.yml logs --tail=50 mcp-evals
cat ~/apps/mcp-evals/docker-compose.yml
grep -c GROQ_API_KEY ~/secrets/mcp-evals.env   # must print 1
curl -I http://localhost:5009/mcp-evals/
```

The service must run `command: python src/python/app.py` with
`PATH_PREFIX=/mcp-evals`. Common symptoms:

1. **`GROQ_API_KEY is not set`** on the Agent/Eval tiles — the key is missing
   from `techtoday/secrets`. Add it (see Production Setup) and re-run the workflow.
2. **`API ERROR: … 401 Invalid API Key`** or **`429`** inside a report — the
   Groq key is wrong or its free-tier limit is reached. Check
   https://console.groq.com.
3. **`MODEL TRIED TO CALL A TOOL WE NEVER GAVE IT`** — `gpt-oss` sometimes
   tries its built-in browser tool; the app already retries twice. Run again.
4. **Plumbing fails too** — the MCP server process cannot start; check the
   logs above for an `mcp` import error (rebuild the image).

Restart only this project:

```bash
docker compose -f ~/apps/mcp-evals/docker-compose.yml up -d
```

---

## Rollback

List recent tags locally, then pin one on EC2:

```bash
aws ecr describe-images --repository-name techtoday/mcp-evals --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
cd ~/apps/mcp-evals
sed -i 's/:latest/:<build-tag>/' docker-compose.yml   # <build-tag> from the list above
docker compose pull
docker compose up -d
curl -I https://app.techtoday.click/mcp-evals/
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
cd projects/mcp-evals
docker build --platform linux/amd64 -t techtoday/mcp-evals .
docker tag techtoday/mcp-evals:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/mcp-evals:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/mcp-evals:latest
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2 (the Compose file must already exist from a previous workflow run):

```bash
docker compose -f ~/apps/mcp-evals/docker-compose.yml pull
docker compose -f ~/apps/mcp-evals/docker-compose.yml up -d
```

If the pull reports `no space left on device`, run `docker system df`, then
`docker container prune -f`, `docker builder prune -af`, and
`docker image prune -af` before retrying the two commands above.

---

## Deployment Status

Single-service project, fully automated: `.github/workflows/deploy-mcp-evals.yml`
builds and pushes the one image, provisions ECR, the env file, Nginx, and the
Compose service, and restarts `mcp-evals` on every push to any branch
that touches the trigger paths. The MCP server is not a separate service; it
runs as a child process inside the `mcp-evals` container.
