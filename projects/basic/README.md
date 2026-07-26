# AI Infused Learning

A collection of LLM-powered demos that show how to connect to two different AI providers — **OpenAI** (GPT-4o mini) and **Groq** (Llama 3.3 70B) — using the same OpenAI-compatible Python client, served through a Flask web UI running in a Docker container.

The project is structured so that each feature lives in its own module (`joke.py`, `travel.py`, etc.) and is exposed through a thin Flask endpoint.  This makes it easy to add, remove, or modify individual features without touching unrelated code.

---

## Features

### 😂 Joke Generator
Calls **Groq** (Llama 3.3 70B Versatile) to generate a joke on a topic you provide.  `temperature=1.3` pushes the model toward creative, varied responses so you get a fresh joke on every request.

### ✈️ Travel Suggestion
Calls **OpenAI** (GPT-4o mini) with a witty-travel-guide persona to suggest one thing to do in any city you enter.

### 🔎 Website Summarizer
Takes any URL, fetches the page with a browser-like User-Agent, strips away scripts / navigation / footer noise, then asks **GPT-4o mini** to produce a short markdown summary of what remains.

### 🥊 LLM Arena
Sends the exact same prompt to both **GPT-4o mini** (OpenAI) and **Llama 3.3 70B** (Groq) and displays both replies side by side, making it easy to compare how a proprietary model and an open-source model handle the same question.

---

## Environment Variables

1. `OPENAI_API_KEY` — used by `travel`, `summarize`, and `arena` (Model A).  Get it from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. `GROQ_API_KEY` — used by `joke` and `arena` (Model B).  Get it from [console.groq.com/keys](https://console.groq.com/keys) — free tier available.
3. `PATH_PREFIX` — optional, set by the deployment environment (e.g. `"/basic"`).  Controls the URL prefix the Flask Blueprint is mounted under.  Leave it unset for local development.

Variables are loaded from `.env` at runtime via `python-dotenv`.  See `.env.example` for the expected format.

---

## Project Structure

```
projects/basic/
├── Dockerfile              # single image used by all services
├── docker-compose.yml      # defines web, joke, travel, summarize, and arena services
├── requirements.txt        # runtime dependencies
├── .env.example            # template — copy to .env and fill in keys
├── .gitignore
├── .dockerignore
├── README.md
└── src/
    ├── python/
    │   ├── config.py       # loads .env; exposes get_openai_client() / get_groq_client()
    │   ├── joke.py         # Groq → Llama 3.3 70B → random joke
    │   ├── travel.py       # OpenAI → GPT-4o mini → city activity suggestion
    │   ├── scraper.py      # requests + BeautifulSoup → cleaned page text
    │   ├── summarizer.py   # scraper + OpenAI → markdown page summary
    │   ├── arena.py        # OpenAI + Groq → side-by-side model comparison
    │   └── app.py          # Flask server — Blueprint routes + index.html serving
    └── index.html          # single-page web UI (vanilla JS, no build step)
```

---

## Module Responsibilities

**`config.py`**
- Calls `load_dotenv()` at import time so every module that imports `config` automatically has `.env` values in `os.environ`.
- `get_openai_client()` — constructs an `OpenAI` client with `OPENAI_API_KEY`.
- `get_groq_client()` — constructs an `OpenAI` client with `GROQ_API_KEY` and `base_url` set to `https://api.groq.com/openai/v1`.  No extra SDK is needed because Groq's API is wire-compatible with OpenAI's.

**`joke.py`**
- `get_joke(topic)` — sends a user prompt to `llama-3.3-70b-versatile` on Groq with `temperature=1.3`.  Falls back to the word `"random"` if no topic is given so the prompt is always explicit.
- Can be run directly from the project root: `python src/python/joke.py`.

**`travel.py`**
- `get_travel_suggestion(city)` — sends a prompt to `gpt-4o-mini` on OpenAI using a witty travel-guide system prompt.  Defaults to `"Bangalore"` if no city is provided.
- Can be run directly from the project root: `python src/python/travel.py`.

**`scraper.py`**
- `fetch_website_contents(url)` — prepends `https://` if missing, downloads the page with a browser-like `User-Agent` header, and uses BeautifulSoup to strip `<script>`, `<style>`, `<nav>`, `<footer>`, `<header>`, `<img>`, and `<input>` tags before extracting plain text.
- Returns a formatted string (`Title: …\n\nPage contents:\n…`) ready to embed in an LLM prompt, or an error message string if the fetch fails.

**`summarizer.py`**
- `summarize(url)` — chains `fetch_website_contents(url)` (scraper) → `gpt-4o-mini` chat completion with a markdown-summary system prompt.
- The two steps are deliberately separate so the scraper can be reused by other features independently.
- Can be run directly from the project root: `python src/python/summarizer.py`.

**`arena.py`**
- `_ask(client, model, prompt)` — private helper that fires one chat completion and returns the reply text.  Kept separate so `battle()` stays readable.
- `battle(prompt)` — calls `_ask` twice (OpenAI then Groq) and returns a dict `{ "model_a": {model, reply}, "model_b": {model, reply} }`.
- Can be run directly from the project root: `python src/python/arena.py`.

**`app.py`**
- All routes are attached to a Flask `Blueprint` so the entire API surface can be mounted under a runtime `PATH_PREFIX` without changing individual route strings.
- `GET /` — reads `index.html`, replaces the `const API = "";` placeholder with `PATH_PREFIX`, and returns the patched HTML.  This keeps the same HTML file working both locally (empty prefix) and in production (e.g. `/basic`).
- `POST /joke` — body: `{ "topic": "..." }` (optional) → `{ "result": "..." }` with `Cache-Control: no-store`.
- `POST /travel` — body: `{ "city": "..." }` (required) → `{ "result": "..." }`.
- `POST /summarize` — body: `{ "url": "..." }` (required) → `{ "result": "..." }`.  Returns HTTP 400 if `url` is missing.
- `POST /arena` — body: `{ "prompt": "..." }` (required) → `{ "result": { "model_a": {…}, "model_b": {…} } }`.  Returns HTTP 400 if `prompt` is missing.
- Listens on `0.0.0.0:5000` inside the container (mapped to host port `8080` by `docker-compose.yml`).

**`index.html`**
- Self-contained single-page app — no framework, no build step, no dependencies.
- Four cards: Joke Generator, Travel Suggestion, Website Summarizer, LLM Arena.
- Each card disables its button until the required input has a value, shows a spinner during the request, and renders errors inline without a page reload.
- Uses `const API = "";` as a base URL placeholder.  At runtime the Flask `index` route replaces this with `PATH_PREFIX` so the same file works locally and behind an Nginx path prefix.

---

## How the Groq Integration Works

Groq exposes an **OpenAI-compatible REST API** at `https://api.groq.com/openai/v1`.  Because the request/response format is identical to OpenAI's, the official `openai` Python package can target Groq by overriding `base_url`:

```python
from openai import OpenAI

groq_client = OpenAI(
    api_key="<your-groq-key>",
    base_url="https://api.groq.com/openai/v1",
)

response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)
```

No extra SDK is needed.  The `config.py` module handles this so the rest of the codebase never needs to know which provider it is talking to — it just calls `get_openai_client()` or `get_groq_client()` and uses the same `.chat.completions.create(...)` interface either way.

---

## How the Scraper Works

The Website Summarizer feature cannot just give a raw URL to the model — LLMs don't browse the internet during inference.  Instead, `scraper.py` acts as the model's eyes:

1. **Fetch** — `requests.get()` downloads the raw HTML using a browser-like `User-Agent` header so most servers respond normally.
2. **Parse** — `BeautifulSoup` builds a DOM tree from the HTML.
3. **Clean** — Tags that carry no useful text content (`<script>`, `<style>`, `<nav>`, `<footer>`, `<header>`, `<img>`, `<input>`) are removed from the tree.
4. **Extract** — `soup.get_text(separator="\n", strip=True)` collapses what remains into a block of plain text.
5. **Format** — The title and body text are combined into a single string and embedded in the GPT-4o mini prompt by `summarizer.py`.

---

## Development and Deployment

### Prerequisites

Complete the one-time machine and AWS setup in [../SETUP.md](../SETUP.md). Every
Docker command requires a running Docker daemon:

```bash
# Linux
sudo systemctl start docker

# macOS or Windows: start Docker Desktop, then verify on any OS
docker info
```

### First Local Run

From the repository root:

```bash
cd projects/basic
cp .env.example .env
# Add OPENAI_API_KEY and GROQ_API_KEY to .env. Never commit this file.
docker compose build web
docker compose up web
```

Open http://localhost:8080. Source files under `src/` are mounted into the
container, so normal source edits do not require an image rebuild. Rebuild
after changing `Dockerfile` or `requirements.txt`:

```bash
docker compose build web
```

Run an individual feature from the command line when needed:

```bash
docker compose run --build --rm joke
docker compose run --build --rm travel
docker compose run --build --rm summarize
docker compose run --build --rm arena
```

Useful local commands:

```bash
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
docker compose down
```

### Commit and Automatic Deployment

Create a feature branch from the repository root, then commit only this
project's files:

```bash
git checkout main && git pull origin main
git checkout -b feat/basic-short-description

git add projects/basic/
git commit -m "feat(basic): short description"
git push -u origin feat/basic-short-description
```

Open a pull request and squash-merge it into `main`. Changes under
`projects/basic/**` trigger `.github/workflows/deploy-basic.yml`, which builds
the image, pushes it to `techtoday/basic` in ECR, and restarts only the `basic`
service on EC2.

Verify production after the workflow succeeds:

```bash
curl -I https://app.techtoday.click/basic/
```

### Production Troubleshooting

A `502 Bad Gateway` usually means the container is not running behind Nginx.
On the EC2 host:

```bash
docker compose -f ~/docker-compose.yml ps
docker compose -f ~/docker-compose.yml logs --tail=50 basic
grep -A12 "^  basic:" ~/docker-compose.yml
```

The production service must use `command: python src/python/app.py`. After
correcting `~/docker-compose.yml`, validate it and restart only this service:

```bash
docker compose -f ~/docker-compose.yml config >/dev/null && echo "compose file OK"
docker compose -f ~/docker-compose.yml up -d --no-deps basic
```

### Rollback

Find a previous image tag locally, then connect to EC2 and repoint `latest` to
that image:

```bash
aws ecr describe-images --repository-name techtoday/basic --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-10:].imageTags' --output table

ssh -i techtoday.pem ec2-user@44.193.134.238

ACCOUNT_ID=<your-aws-account-id>
ROLLBACK_TAG=<build-tag>
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker pull $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/basic:$ROLLBACK_TAG
docker tag $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/basic:$ROLLBACK_TAG \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/basic:latest
docker compose -f ~/docker-compose.yml up -d --no-deps basic
curl -I https://app.techtoday.click/basic/
```

Fix the underlying issue and merge it promptly because the next deployment to
`main` overwrites the `latest` tag.

### Manual Deployment

Use this only when GitHub Actions is unavailable. Build and push locally:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

cd projects/basic
docker build --platform linux/amd64 -t techtoday/basic .
docker tag techtoday/basic:latest \
    $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/basic:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techtoday/basic:latest
ssh -i techtoday.pem ec2-user@44.193.134.238
```

Then run on EC2:

```bash
docker compose -f ~/docker-compose.yml pull basic
docker compose -f ~/docker-compose.yml up -d --no-deps basic
```

If the pull fails with `no space left on device`, inspect and prune unused
Docker data before retrying:

```bash
df -h
docker system df
docker container prune -f
docker builder prune -af
docker image prune -af
docker compose -f ~/docker-compose.yml pull basic
docker compose -f ~/docker-compose.yml up -d --no-deps basic
```
