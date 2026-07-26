# LangChain Lab

A collection of LangChain-powered demos that show three core building blocks of AI engineering — **chains**, **memory**, and **agents** — using **OpenAI** (GPT-4o mini), served through a Flask web UI running in a Docker container.

This project mirrors the architecture of the AI Playground (basic) project: each feature lives in its own module (`summarizer.py`, `chat.py`, `agent.py`) and is exposed through a thin Flask endpoint. This makes it easy to add, remove, or modify individual features without touching unrelated code.

---

## Development and Deployment

### Prerequisites and First Run

Complete the one-time setup in [../SETUP.md](../SETUP.md), start Docker, and
verify the daemon with `docker info`. Then run from the repository root:

```bash
cd projects/langchain
cp .env.example .env
# Add OPENAI_API_KEY to .env. Never commit this file.
docker compose build web
docker compose up web
```

Open http://localhost:8081. Source files under `src/` are mounted into the
container. Rebuild only after changing `Dockerfile` or `requirements.txt`:

```bash
docker compose build web
```

Run individual features from the command line when needed:

```bash
docker compose run --build --rm summarize
docker compose run --build --rm chat
docker compose run --build --rm agent
```

Useful local commands:

```bash
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
docker compose down
```

On Linux, start Docker with `sudo systemctl start docker`. On macOS or Windows,
start Docker Desktop and wait until Docker reports that it is running.

### Commit and Automatic Deployment

Create a feature branch and commit only this project from the repository root:

```bash
git checkout main && git pull origin main
git checkout -b feat/langchain-short-description
git add projects/langchain/
git commit -m "feat(langchain): short description"
git push -u origin feat/langchain-short-description
```

Open a pull request and squash-merge it into `main`. Changes under
`projects/langchain/**` trigger `.github/workflows/deploy-langchain.yml`, which
pushes the image to `techtoday/langchain` in ECR and restarts only the
`langchain` service on EC2. The production Compose service maps EC2 host port
`5001` to container port `5000`.

```bash
curl -I https://app.techtoday.click/langchain/
```

### Production Troubleshooting

For a `502 Bad Gateway`, run on EC2:

```bash
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 langchain
grep -A12 "^  langchain:" ~/docker-compose.yml
```

The service must use `command: python src/python/app.py`. After correcting the
production Compose file, validate and restart only this project:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d --no-deps langchain
```

### Rollback

List previous tags locally, then connect to EC2 and promote the chosen tag:

```bash
aws ecr describe-images --repository-name techtoday/langchain --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table
ssh -i techtoday.pem ec2-user@44.193.134.238

ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker pull $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/langchain:$ROLLBACK_TAG
docker tag $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/langchain:$ROLLBACK_TAG \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/langchain:latest
docker compose -f ~/docker-compose.yml up -d --no-deps langchain
curl -I https://app.techtoday.click/langchain/
```

The next successful deployment to `main` replaces the `latest` tag.

### Manual Deployment

Use this only when GitHub Actions is unavailable. Build and push locally:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
cd projects/langchain
docker build --platform linux/amd64 -t techtoday/langchain .
docker tag techtoday/langchain:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/langchain:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/langchain:latest
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
docker compose -f ~/docker-compose.yml pull langchain
docker compose -f ~/docker-compose.yml up -d --no-deps langchain
```

If the pull reports `no space left on device`, run `docker system df`, then
remove unused data with `docker container prune -f`, `docker builder prune -af`,
and `docker image prune -af` before retrying the two commands above.



---

## Features

### 🕷️ Web Scraper
Fetches and cleans the readable text contents of a web page using LangChain's `WebBaseLoader`. This differentiates it from basic scraping projects by leveraging the LangChain ecosystem. It acts as a foundational utility that provides clean text for other LangChain features (like the Website Summarizer) to process without wasting tokens on HTML boilerplate.

### 🔎 Website Summarizer
Takes any URL, fetches the page with a browser-like User-Agent, strips away scripts / navigation / footer noise, then runs the cleaned text through a LangChain `prompt | model | parser` chain to produce a short markdown summary. This is the classic summarizer rebuilt "the LangChain way".

### 🧠 Memory Chat
A chatbot that remembers the conversation. An LLM has no memory of its own — it only "remembers" because the prior turns are re-sent with every request. The chain uses a `MessagesPlaceholder` to inject the running history, and the browser keeps that history and sends it with each message, so the server stays stateless.

### 🛍️ Shop Agent
A tiny tool-using agent: an LLM plus one tool (`get_price`) plus a loop. The model decides on its own when to call the tool to look up prices for shoes, hat, bag, shorts, or pants, then phrases a natural-language answer. Built with the native OpenAI function-calling protocol.

---

## Architecture

```
projects/langchain/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service + one-off CLI services per feature
├── requirements.txt        # openai, langchain, flask, requests, ...
├── .env.example            # OPENAI_API_KEY placeholder
└── src/
    ├── python/
    │   ├── app.py          # Flask server: Blueprint + PATH_PREFIX routing
    │   ├── config.py       # loads .env; builds LangChain + OpenAI clients
    │   ├── scraper.py      # URL → cleaned page text (plain web scraping)
    │   ├── summarizer.py   # LangChain chain: prompt | model | parser
    │   ├── chat.py         # memory chat: MessagesPlaceholder + history
    │   └── agent.py        # tool-using shop agent (function calling)
    ├── index.html          # single-page UI (served by Flask)
    ├── css/style.css       # dark theme (shares TechToday design tokens)
    └── js/main.js          # front-end behavior, no frameworks
```

### Backend layout

1. `config.py` is the single place that knows about API keys and the model name. Every other module calls `get_chat_model()` (LangChain `ChatOpenAI`) or `get_openai_client()` (raw OpenAI SDK) instead of constructing a client itself.
2. `summarizer.py` and `chat.py` are built as LangChain chains (`prompt | model | parser`), which is the Class 2 way of composing a request.
3. `agent.py` uses the native OpenAI SDK because the function-calling request/response shape is clearest in the raw API.
4. `scraper.py` uses LangChain's `WebBaseLoader` to perform web scraping — integrating with the LangChain ecosystem — so it can be reused by any feature that needs page text.
5. `app.py` attaches every route to a Blueprint and registers it once under a runtime `PATH_PREFIX`, so the same code runs at `/` locally and under `/langchain/` in production.

### Path prefix routing

Because Nginx forwards the full path (e.g. `/langchain/chat`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/python/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /langchain in prod, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

1. **Locally:** `PATH_PREFIX` unset → routes are `/`, `/summarize`, `/chat`, `/agent`.
2. **On EC2:** `PATH_PREFIX=/langchain` → routes are `/langchain/`, `/langchain/summarize`, `/langchain/chat`, `/langchain/agent`.

The served `index.html` also needs the prefix so its `fetch()` calls hit the right endpoint. The `index` route injects it by rewriting the page's `data-api-base=""` attribute with the current `PATH_PREFIX` value before returning the HTML.

---

## API Endpoints

1. `POST /summarize` — body `{ "url": "<website URL>" }` → `{ "result": "<markdown summary>" }`
2. `POST /chat` — body `{ "message": "<text>", "history": [ {"role", "content"}, ... ] }` → `{ "result": "<reply>" }`
3. `POST /agent` — body `{ "message": "<text>" }` → `{ "result": "<reply>" }`
4. `POST /scrape` — body `{ "url": "<website URL>" }` → `{ "result": "<cleaned text>" }`

All endpoints return `{ "error": "<message>" }` with an HTTP 400 (missing input) or 500 (API error) on failure.
