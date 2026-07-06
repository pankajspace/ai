[← README](../../README.md) | [Project Setup](SETUP.md) | [Project Daily](DAILY.md) | [Architecture Guide](../ARCHITECTURE.md)

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

## Development Setup

Before running the project locally you need the Docker **daemon**, Docker **CLI**, and Docker **Compose plugin** all working together. On macOS these are three separate components. Follow the section for your OS fully — skipping any step is the most common cause of errors.

### macOS — Option A: Docker Desktop (recommended)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) bundles all three components in one installer.

1. Download and run the [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) installer.
2. Open **Docker Desktop** from Applications and wait for the whale icon in the menu bar to show **"Docker Desktop is running"** (15–30 seconds on first launch).
3. Verify:
   ```bash
   docker info             # prints server details — no error
   docker compose version  # prints: Docker Compose version v2.x.x
   ```

### macOS — Option B: Homebrew + Colima (no GUI)

If you installed Docker via Homebrew, three separate packages are required:

**Why three steps:**
1. `brew install docker` gives you only the CLI. Without a daemon, `/var/run/docker.sock` does not exist and every `docker` command fails.
2. `brew install docker-compose` installs the Compose plugin. Without it, `docker compose` is an unknown command.
3. `brew install colima` + `colima start` — installs and starts the lightweight Linux VM that runs the daemon and creates the socket file.

**Full setup:**
```bash
# 1 — CLI
brew install docker
docker --version           # verify: Docker version 29.x.x

# 2 — Compose plugin
brew install docker-compose
docker compose version     # verify: Docker Compose version v2.x.x

# 3 — Daemon (Colima)
brew install colima
colima start               # starts VM + creates /var/run/docker.sock
docker info                # verify: server version printed, no error
```

> **After every reboot** run `colima start` before using Docker. Check status: `colima status`. Stop: `colima stop`.

**Common errors and fixes:**

1. `docker: unknown command: docker compose`
   — Compose plugin missing.
   Fix: `brew install docker-compose`

2. `dial unix /var/run/docker.sock: connect: no such file or directory`
   — Docker daemon is not running.
   Fix: `colima start`

3. `permission denied while trying to connect to the Docker daemon socket`
   — User not in the `docker` group.
   Fix: `sudo usermod -aG docker $USER` then log out and back in.

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info && docker compose version
```

### Linux (Fedora/RHEL)

```bash
sudo dnf install docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info && docker compose version
```

### Windows

1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) — bundles WSL 2, daemon, CLI, and Compose plugin.
2. Launch Docker Desktop and wait for **"Docker Desktop is running"** in the system tray.
3. Verify in PowerShell:
   ```powershell
   docker info
   docker compose version
   ```

---

## Prerequisites

1. Docker + Docker Compose — installed and running per the [Development Setup](#development-setup) section above
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for `travel`, `summarize`, and `arena`
3. [Groq API key](https://console.groq.com/keys) — required for `joke` and `arena`; free tier available

---

## Quick Start

### 1. Enter the project folder

```bash
cd projects/basic
```

### 2. Configure API keys

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```dotenv
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
```

> Never commit `.env` — it is already listed in `.gitignore`.

### 3. Build the container image

```bash
docker compose build
```

> You only need to rebuild when `Dockerfile` or `requirements.txt` changes.  Edits to any file under `src/` are reflected immediately via a volume mount — save the file and reload the browser.

### 4. Run

**Web UI** — open [http://localhost:8080](http://localhost:8080):

```bash
docker compose up web
```

**CLI** — run each feature directly and print output to the terminal:

```bash
docker compose run --rm joke
docker compose run --rm travel
docker compose run --rm summarize
docker compose run --rm arena
```

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
    ├── config.py           # loads .env; exposes get_openai_client() / get_groq_client()
    ├── joke.py             # Groq → Llama 3.3 70B → random joke
    ├── travel.py           # OpenAI → GPT-4o mini → city activity suggestion
    ├── scraper.py          # requests + BeautifulSoup → cleaned page text
    ├── summarizer.py       # scraper + OpenAI → markdown page summary
    ├── arena.py            # OpenAI + Groq → side-by-side model comparison
    ├── app.py              # Flask server — Blueprint routes + index.html serving
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
- Can be run directly: `python joke.py`.

**`travel.py`**
- `get_travel_suggestion(city)` — sends a prompt to `gpt-4o-mini` on OpenAI using a witty travel-guide system prompt.  Defaults to `"Bangalore"` if no city is provided.
- Can be run directly: `python travel.py`.

**`scraper.py`**
- `fetch_website_contents(url)` — prepends `https://` if missing, downloads the page with a browser-like `User-Agent` header, and uses BeautifulSoup to strip `<script>`, `<style>`, `<nav>`, `<footer>`, `<header>`, `<img>`, and `<input>` tags before extracting plain text.
- Returns a formatted string (`Title: …\n\nPage contents:\n…`) ready to embed in an LLM prompt, or an error message string if the fetch fails.

**`summarizer.py`**
- `summarize(url)` — chains `fetch_website_contents(url)` (scraper) → `gpt-4o-mini` chat completion with a markdown-summary system prompt.
- The two steps are deliberately separate so the scraper can be reused by other features independently.
- Can be run directly: `python summarizer.py`.

**`arena.py`**
- `_ask(client, model, prompt)` — private helper that fires one chat completion and returns the reply text.  Kept separate so `battle()` stays readable.
- `battle(prompt)` — calls `_ask` twice (OpenAI then Groq) and returns a dict `{ "model_a": {model, reply}, "model_b": {model, reply} }`.
- Can be run directly: `python arena.py`.

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

## Production Routing

In production the app runs inside a Docker container on an EC2 instance behind Nginx.  Nginx is configured with a `location /basic { proxy_pass http://localhost:5000; }` block that strips the prefix and forwards requests to the container.  The `PATH_PREFIX` environment variable is set to `/basic` so the Flask Blueprint mounts all routes under that path and the `index.html` JavaScript sends API calls to the correct URL.  See [SETUP.md § 2](SETUP.md#2-production-deployment) for step-by-step deployment, or the [Architecture Guide](../ARCHITECTURE.md) for the full architecture.

