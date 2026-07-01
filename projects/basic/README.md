[<- README](../../README.md) | [Development & Deployment Guide](../DEVELOPMENT.md)

# AI Infused Learning

LLM-powered demos showing how to call two different AI providers — **OpenAI** (GPT-4o mini) and **Groq** (Llama 3.3 70B) — using the same OpenAI-compatible Python client, served through a Flask web UI running in a Podman container.

---

## Prerequisites

1. [Podman](https://podman.io/) + [podman-compose](https://github.com/containers/podman-compose) — container runtime (replaces Docker)
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for the `travel` feature
3. [Groq API key](https://console.groq.com/keys) — required for the `joke` feature; free tier available

### Install Podman

**macOS**
```bash
brew install podman podman-compose
podman machine init --provider applehv
podman machine start
```

**Linux (Debian/Ubuntu)**
```bash
sudo apt install podman podman-compose
```

**Linux (Fedora/RHEL)**
```bash
sudo dnf install podman podman-compose
```

**Windows** — [Podman Desktop](https://podman-desktop.io/) (includes WSL 2 backend)

---

## Quick Start

### 1. Clone and enter the project folder

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
podman-compose build
```

### 4. Run

**Web UI** — open [http://localhost:8080](http://localhost:8080) in your browser:

```bash
podman-compose up web
```

**CLI** — run each feature directly and print output to the terminal:

```bash
podman-compose run --rm joke
podman-compose run --rm travel
```

---

## Features

### 😂 Joke Generator
Calls **Groq** (Llama 3.3 70B Versatile) to generate a random joke. A random category (pun, dad joke, knock-knock, one-liner, etc.) is chosen on every request, and `temperature=1.3` ensures a different response each time.

### ✈️ Travel Suggestion
Calls **OpenAI** (GPT-4o mini) to suggest one thing to do in any city you enter. Defaults to Bangalore if no city is provided.

---

## Environment Variables

1. `OPENAI_API_KEY` — required by `travel`; get it from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. `GROQ_API_KEY` — required by `joke`; get it from [console.groq.com/keys](https://console.groq.com/keys) — free tier available

Variables are loaded from `.env` at runtime via `python-dotenv`. See `.env.example` for the expected format.

---

## Project Structure

```
projects/basic/
├── Dockerfile              # single image used by all services
├── docker-compose.yml      # defines web, joke, and travel services
├── requirements.txt        # runtime dependencies (openai, flask, …)
├── .env.example            # template — copy to .env and fill in keys
├── .gitignore
├── .dockerignore
├── README.md
└── src/
    ├── config.py           # loads .env; exposes get_openai_client() / get_groq_client()
    ├── joke.py             # calls Groq → returns a random joke string
    ├── travel.py           # calls OpenAI → returns a city suggestion string
    ├── app.py              # Flask server — serves the UI and exposes API endpoints
    └── index.html          # single-page web UI
```

### Module Responsibilities

**`config.py`**
- Calls `load_dotenv()` on import so every other module inherits the environment
- `get_openai_client()` — returns an `OpenAI` client using `OPENAI_API_KEY`
- `get_groq_client()` — returns an `OpenAI` client pointed at `https://api.groq.com/openai/v1`

**`joke.py`**
- Picks a random joke category on each call
- Calls `llama-3.3-70b-versatile` on Groq with `temperature=1.3` for variety
- Returns the joke as a plain string; can also be run directly via `python joke.py`

**`travel.py`**
- Accepts a `city` argument (defaults to `"Bangalore"`)
- Calls `gpt-4o-mini` on OpenAI with a witty travel-guide system prompt
- Returns the suggestion as a plain string; can also be run directly via `python travel.py`

**`app.py`**
- `GET /` — serves `index.html`
- `POST /joke` — accepts `{ "topic": "..." }` (optional), calls `get_joke(topic)`, returns `{ "result": "..." }` with `Cache-Control: no-store`
- `POST /travel` — accepts `{ "city": "..." }`, calls `get_travel_suggestion(city)`, returns `{ "result": "..." }`
- Listens on `0.0.0.0:5000` inside the container (mapped to host port `8080`)

**`index.html`**
- Self-contained single-page UI with two cards
- Uses `fetch()` with relative URLs (`/joke`, `/travel`) so it works on any host/port
- Displays a loading spinner while waiting and renders errors inline

---

## How the Groq Integration Works

Groq exposes an **OpenAI-compatible REST API** at `https://api.groq.com/openai/v1`, so the standard `openai` Python package can target it by overriding `base_url`:

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your-groq-key>",
    base_url="https://api.groq.com/openai/v1",
)

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[...],
)
```

No extra SDK is needed. Both providers use the exact same `client.chat.completions.create(...)` call — only `api_key` and `base_url` differ, which is why a shared `config.py` cleanly centralises the setup.

