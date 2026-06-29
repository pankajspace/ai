[<- README](../../README.md)

# AI Infused Learning

LLM-powered demos showing how to make prompt calls against two different AI
providers — **OpenAI** (GPT-4o mini) and **Groq** (Llama 3.3 70B) — using the
same OpenAI-compatible Python client.

---

## Prerequisites

- An [OpenAI API key](https://platform.openai.com/api-keys) (for `travel`)
- A [Groq API key](https://console.groq.com/keys) (for `joke`) — free tier available

---

## Setup

1. Install Podman:

   **macOS**:
   ```bash
   brew install podman podman-compose
   podman machine init
   podman machine start
   ```

   **Linux**:
   ```bash
   # Debian/Ubuntu
   sudo apt install podman podman-compose

   # Fedora/RHEL
   sudo dnf install podman podman-compose
   ```

   **Windows** — [Podman Desktop](https://podman-desktop.io/) (includes WSL 2 backend)

2. Configure API keys:

```bash
cp .env.example .env
# then open .env and replace the placeholder values:
#   OPENAI_API_KEY=sk-...
#   GROQ_API_KEY=gsk_...
```

3. Build the image:

```bash
# INSIDE THE PROJECT FOLDER i.e., projects/basic
podman-compose build
```

---

## Running

```bash
podman-compose run --rm joke
podman-compose run --rm travel
```

---

## Environment Variables

1. `OPENAI_API_KEY` — required by the `travel` feature; get it from [platform.openai.com](https://platform.openai.com/api-keys)
2. `GROQ_API_KEY` — required by the `joke` feature; get it from [console.groq.com](https://console.groq.com/keys) (free tier available)

These are loaded from a `.env` file at runtime. See `.env.example` for the
expected format. Never commit your `.env` file — it is listed in `.gitignore`.

---

## What it does

1. **`joke`** — calls Groq (Llama 3.3 70B Versatile) to generate a random joke
2. **`travel`** — calls OpenAI (GPT-4o mini) to suggest one thing to do in a given city

Groq hosts open-source models behind an OpenAI-compatible API, so both features
use the same `openai` Python package — only the `base_url` and `api_key` differ.

---

## Project structure

```
projects/basic/
├── requirements.txt        # runtime dependencies
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example            # template — copy to .env and fill in API keys
├── .gitignore
├── README.md
└── src/
    ├── config.py           # env loading + API client factories
    ├── joke.py             # joke feature: builds prompt + calls Groq
    └── travel.py           # travel feature: builds prompt + calls OpenAI
```

### Module responsibilities

**`config.py`** — single source of truth for environment and clients.
- Loads `.env` via `python-dotenv`
- Provides `get_openai_client()` and `get_groq_client()` factory functions

**`joke.py`** — thin feature module.
- Imports `get_groq_client()` from `config`
- Sends a two-message chat completion to `llama-3.3-70b-versatile`
- Returns the assistant's reply as a plain string

**`travel.py`** — thin feature module.
- Imports `get_openai_client()` from `config`
- Accepts a `city` parameter (default: `"Bangalore"`)
- Sends a two-message chat completion to `gpt-4o-mini`
- Returns the assistant's reply as a plain string

---

## How the Groq integration works

Groq provides an **OpenAI-compatible REST API** at `https://api.groq.com/openai/v1`.
This means the standard `openai` Python package can target Groq simply by
overriding `base_url`:

```python
from openai import OpenAI

client = OpenAI(
    api_key="<your-groq-key>",
    base_url="https://api.groq.com/openai/v1",
)
```

No extra SDK is needed. The same `client.chat.completions.create(...)` call works
for both providers.
