[<- README](../../README.md) | [Notes](docker.html)

# Docker

# My Notes

## 1. Why Docker Exists — "But It Works on My Machine!"

Docker solves the universal developer nightmare: your code runs perfectly on your laptop, crashes on your teammate's, and let's not talk about production. The root cause is always environment differences — Python version, package version, operating system details.

**The Dabbawala Insight:** Mumbai's dabbawalas deliver 200,000 lunch boxes every day with Six Sigma accuracy — without an app. How? They *standardised the packaging and the delivery system*. It doesn't matter where a tiffin comes from or where it's going; the system is identical. **Docker is the dabbawala system for software.**

In this class you dockerize three real projects at increasing difficulty:
1. A classic ML model (Dockerfile basics)
2. An LLM-powered RAG app (Compose, volumes, secrets)
3. A multi-agent system (microservices, private networking)

---

## 2. The Master Analogy — The Tiffin System 🍱

Come back to this every time a new term confuses you:

- **Dockerfile** → Recipe card 📝 — step-by-step written instructions for how to prepare the meal
- **Image** → Master tiffin (sealed, ready) 🍱 — the packed box produced from the recipe, frozen in time, ready to ship
- **Container** → One delivered tiffin 🚚 — a running copy of the image; one image can produce a hundred tiffins
- **Docker Hub** → Central kitchen / warehouse 🏭 — where ready-made boxes for every recipe live (Python's, Ubuntu's, Redis's)
- **Port mapping** → The building's gate number 🚪 — the box lives in flat 8000 inside the building, but deliveries come through gate 8000 — `-p 8000:8000`
- **Volume** → The steel box that comes back ♻️ — delete the container, the data survives, like the reusable steel dabba
- **docker compose** → Ordering a full thali 🍽️ — one order gets you dal, rice, sabzi, roti — all containers together

### ⭐ The Most Important Rule

> **"An image is a photograph, not a mirror."** When you build an image, Docker takes a *photo* of your code at that moment. If you edit your code afterwards, the photo does NOT update by itself — you must take a new photo (rebuild). Forgetting this causes 90% of beginner confusion.

---

## 3. VM vs Docker — The One Diagram

Picture two kinds of housing:

- **Virtual Machine = a standalone bungalow.** Every app gets an entire house: its own kitchen, bathroom, and security guard (a full operating system). Heavy, slow to start, expensive.
- **Docker = apartment flats.** One building (the host OS kernel) is shared, but every flat (container) has its own lock, its own belongings, its own privacy. Lightweight, starts in seconds.

**The punchline:** a VM takes minutes to boot; a container takes milliseconds. That's why at Swiggy/Zomato scale you don't run VMs — you run containers. Traffic spike? Open 50 new flats in seconds.

---

## 4. Mac Setup — Do This First

Open **Terminal** (press `Cmd + Space`, type "Terminal", press Enter).

```bash
# Terminal — install & verify
brew install --cask docker

docker --version
docker compose version
docker run hello-world
```

**Command decoder:**

- `brew` — Homebrew, the "app store for your terminal" on Mac. It downloads and installs software for you. No Homebrew? Download the `.dmg` from docker.com/products/docker-desktop instead.
- `--cask` — tells brew this is a full desktop application (with an icon), not just a command-line tool.
- `docker --version` — asks Docker "which version are you?" If it answers, Docker is installed correctly.
- `docker compose version` — checks Compose, which manages multiple containers at once. It comes bundled with Docker Desktop.
- `docker run hello-world` — "run a container from the image called hello-world." Docker looks for it on your Mac, doesn't find it, downloads it from Docker Hub, and runs it. Your first tiffin, delivered from the central kitchen.

**⚠️ The step most people miss:** after installing, **open the Docker Desktop app once** (Cmd+Space → "Docker" → Enter). A whale 🐳 icon appears in the menu bar. Docker commands only work while that whale is there — the app runs the Docker "engine" (daemon) in the background. No whale = every command fails with *"Cannot connect to the Docker daemon"*. ("Daemon" is just an old Unix word for a background program.)

When `hello-world` prints *"Hello from Docker!"* — you have just pulled an image from Docker Hub and turned it into a running container. First tiffin delivered. 🎉

---

## 5. Two Mac Traps

### Trap 1: Apple Silicon chips speak a different language

M-series Macs (M1/M2/M3/M4) use **ARM64**; most cloud servers use **AMD64 (x86)**. An image "written in AMD64" may not run on an ARM Mac.

```bash
# The fix when you hit a platform error
docker run --platform linux/amd64 <image-name>
```

- `--platform linux/amd64` — "Pretend to be an AMD64 machine." Your Mac translates on the fly (via Rosetta). Like watching a dubbed movie — slightly slower, but it works.

### Trap 2: zsh and the stuck `quote>` prompt

The Mac terminal uses **zsh**. If you paste a command that has a `#` comment at the end AND that comment contains an apostrophe (like *you'll*), zsh gets confused and shows `quote>`, waiting forever. **Fix: press Ctrl+C and re-type the command without the comment.**

---

## 6. Dockerize an ML Project — "QuickBite ETA" 🛵

**What you build:** a sklearn model (food-delivery ETA predictor) served via FastAPI, packed into a container. This is where the **core fundamentals** live: Dockerfile anatomy, layers, caching, port mapping, `.dockerignore`.

### The Situation

You're an ML engineer at a Zomato-style startup. You've built a model that predicts *how many minutes until an order arrives*. It runs beautifully on your laptop. Then DevOps says: *"Ship it to the server."* The server has Python 3.9; you have 3.12. Different sklearn version. Don't even ask about NumPy. Welcome to dependency hell 🔥 — and Docker is the air conditioning.

### 6.1 Project Structure

```bash
# Terminal
mkdir quickbite-eta && cd quickbite-eta
touch train.py app.py requirements.txt Dockerfile .dockerignore
```

- `mkdir` — "Make directory" — creates a new folder
- `&&` — "Then" — run the next command only if the first one succeeded
- `cd` — "Change directory" — step inside that folder
- `touch` — creates empty files with these names

```text
# requirements.txt
scikit-learn==1.5.2
pandas==2.2.3
fastapi==0.115.6
uvicorn==0.34.0
joblib==1.4.2
```

This file is your shopping list. Python doesn't come with these tools built in, so you list exactly which extra packages and *exactly which version* of each. **scikit-learn** trains the model, **pandas** handles data tables, **FastAPI** turns Python functions into a web API, **uvicorn** is the web server that actually runs FastAPI, and **joblib** saves/loads the trained model to a file. Pinning versions with `==` is like writing "1 cup of rice" in a recipe instead of "some rice" — you get the same dish every time.

### 6.2 train.py — A 60-Second Model

```python
# train.py
import pandas as pd, numpy as np, joblib
from sklearn.ensemble import RandomForestRegressor

np.random.seed(42)
n = 5000
df = pd.DataFrame({
    "distance_km": np.random.uniform(0.5, 12, n),
    "prep_time_min": np.random.uniform(5, 30, n),
    "rider_available": np.random.randint(0, 2, n),
    "is_raining": np.random.randint(0, 2, n),
})
# ETA = base + distance*3 + prep + rain penalty + rider penalty + noise
df["eta_min"] = (8 + df.distance_km*3 + df.prep_time_min*0.7
                 + df.is_raining*9 + (1-df.rider_available)*6
                 + np.random.normal(0, 2, n))

X, y = df.drop(columns=["eta_min"]), df["eta_min"]
model = RandomForestRegressor(n_estimators=60, random_state=42).fit(X, y)
joblib.dump(model, "eta_model.pkl")
print("Model saved: eta_model.pkl ✅")
```

**In plain words:** you invent 5,000 fake food orders (so the demo is fast and needs no real dataset). For each order you compute a "true" delivery time with a simple formula: rain adds ~9 minutes, no rider available adds ~6, every km adds ~3. Then you train a RandomForest — think of it as *60 junior analysts each making a guess, and you take their average* — to learn that pattern. `joblib.dump` saves the trained brain into `eta_model.pkl` so the API can load it later without retraining. The `seed(42)` line means "use the same randomness every time" so your results match everyone else's.

### 6.3 app.py — FastAPI Serving

```python
# app.py
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, pandas as pd

app = FastAPI(title="QuickBite ETA")
model = joblib.load("eta_model.pkl")

class Order(BaseModel):
    distance_km: float
    prep_time_min: float
    rider_available: int
    is_raining: int

@app.get("/")
def health():
    return {"status": "QuickBite ETA is live 🛵"}

@app.post("/predict")
def predict(order: Order):
    X = pd.DataFrame([order.model_dump()])
    eta = round(float(model.predict(X)[0]), 1)
    return {"eta_minutes": eta, "message": f"Your food arrives in {eta} min 🍔"}
```

**In plain words:** this file is the *counter window* of your shop. An "API" is a way for programs to talk to each other over the network — send a request, get a response. FastAPI lets you say "when someone sends order details to `/predict`, run this Python function." The `Order` class is the order form: it declares exactly which fields a request must contain and their types — send text where a number belongs and FastAPI politely rejects it *for free*. At startup you load the saved model brain from `eta_model.pkl` once; then every request is: read form → ask model → return the answer as JSON. The `/` route is a health check — a doorbell to confirm the shop is open.

### 6.4 Dockerfile Anatomy — Learning to Read the Recipe

A Dockerfile is a plain text file (no extension!) with instructions Docker executes top to bottom to produce an image:

```dockerfile
# Dockerfile
# 1. Base image = rent a ready-made kitchen (from Docker Hub)
FROM python:3.12-slim

# 2. Set up your counter inside that kitchen
WORKDIR /app

# 3. Copy ONLY the shopping list first (caching trick — explained below)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. NOW copy the rest of your code
COPY . .

# 5. Train the model INSIDE the image (baked in at build time)
RUN python train.py

# 6. Declare which window the food comes out of (documentation)
EXPOSE 8000

# 7. What runs the moment the tiffin is opened
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Line-by-line decoder:**

- `FROM python:3.12-slim` — don't start from an empty computer — start from a ready-made image that already has Linux + Python 3.12 installed. "slim" = the lightweight version. Docker downloads it from Docker Hub automatically.
- `WORKDIR /app` — "from now on, work inside the folder /app" (inside the container). Creates it if missing. Like choosing which counter you'll cook on.
- `COPY requirements.txt .` — copy one file from your Mac into the image. The `.` means "into the current folder" (which is /app because of WORKDIR).
- `RUN pip install ...` — RUN executes a command *while building* the image. pip is Python's package installer; `-r requirements.txt` means "install everything on this list". `--no-cache-dir` tells pip not to keep downloaded files around — smaller image.
- `COPY . .` — "copy everything in the current folder on my Mac → into /app in the image." (Everything except what `.dockerignore` excludes.)
- `RUN python train.py` — trains the model during the build, so the finished image already contains `eta_model.pkl`. The container never needs to train.
- `EXPOSE 8000` — a label saying "this app listens on port 8000". It's documentation — it doesn't open anything by itself (that's `-p`'s job later).
- `CMD [...]` — the one command that runs when a container starts. Here: start the uvicorn web server, serving the `app` object from `app.py`. `--host 0.0.0.0` means "accept connections from outside the container, not just from inside" — without it, port mapping silently fails. A classic gotcha.

### 6.5 The Layer Caching Trick — Why requirements.txt Goes First

Picture a stack of layers (like a stack of parathas 🫓). Docker turns each instruction into a **layer** and caches it. When you rebuild, Docker checks each layer top-down: "did anything this layer depends on change?" If not, it reuses the cached layer instantly. But the moment one layer changes, **every layer below it must rebuild too**.

If you did `COPY . .` first and installed dependencies after, then *every tiny code edit* would invalidate the copy layer — and force the slow 2-minute pip install to re-run below it. By copying only `requirements.txt` first, the pip layer only rebuilds when the shopping list itself changes.

**The rule:** if the shopping list hasn't changed, why go back to the store? Code changes daily; dependencies change monthly. *Rarely-changing things at the top, frequently-changing things at the bottom.* This one trick makes builds 10x faster.

### 6.6 .dockerignore

```text
# .dockerignore
__pycache__/
*.pyc
venv/
.venv/
.git/
.env
*.ipynb
eta_model.pkl
data/raw/
```

When Docker sees `COPY . .`, it grabs *everything* in the folder — unless it's listed here. Same idea as `.gitignore`. You exclude: Python's junk cache files, virtual environments (can be 500MB!), git history, secrets (`.env`), and notebooks. You also exclude `eta_model.pkl` — if you ever trained locally, you do NOT want that stale local file copied in; the image trains its own fresh copy in step 5. *"Only the food goes into the tiffin — not your diary and house keys."*

### 6.7 Milestone #1 — Build, Run, Predict

```bash
# Terminal — the big moment
docker build -t quickbite-eta:v1 .

docker images

docker run -d -p 8000:8000 --name eta-service quickbite-eta:v1

curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"distance_km": 4.5, "prep_time_min": 15, "rider_available": 1, "is_raining": 1}'
```

**Command decoder:**

- `docker build` — "follow the Dockerfile recipe and produce an image"
- `-t quickbite-eta:v1` — "tag" — give the image a name and version label (`name:version`). Without it you get an unmemorable ID like `a7f3c9`
- `.` — the lonely dot means "the recipe and files are in THIS folder." Forgetting the dot is the #1 first-day error
- `docker images` — list all images (master tiffins) stored on your machine
- `docker run` — "create and start a container from this image"
- `-d` — "detached" — run in the background and give my terminal back. Without `-d`, logs take over your terminal until you press Ctrl+C (which also stops the container!)
- `-p 8000:8000` — port mapping, format **host:container** — "connect gate 8000 of my Mac to flat 8000 inside the container." Traffic to `localhost:8000` gets forwarded inside
- `--name eta-service` — a friendly name so you can say "eta-service" in later commands instead of a random ID
- `curl` — a terminal tool for sending web requests — a browser without the window
- `-X POST` — the request type. GET = "give me something", POST = "here's data, process it"
- `-H "Content-Type..."` — a header telling the server "the data I'm sending is JSON"
- `-d '{...}'` — the data itself — one order, as JSON. The backslash `\` at line ends just means "command continues on the next line"

The response comes back as `{"eta_minutes": 41.2, ...}`. Open **http://localhost:8000/docs** in your browser: FastAPI auto-generates a clickable "Swagger" page where you can test the API with buttons instead of curl.

**Notice what you did NOT do on your Mac:** no Python environment, no pip install, no version checking. Everything lives inside the box. And this exact box will run on AWS, on a Windows laptop, anywhere — *identically*.

### 6.8 Peek Inside the Container + Everyday Commands

```bash
# Terminal — daily-driver commands
docker ps
docker ps -a
docker logs -f eta-service
docker exec -it eta-service bash
docker stop eta-service
docker rm eta-service
```

- `docker ps` — list **running** containers only. Comes from "process status"
- `docker ps -a` — list ALL containers, including dead/exited ones. ⚠️ Memorise this: if a container crashed, plain `ps` hides it. `-a` = "all"
- `docker logs -f eta-service` — show everything the container has printed. `-f` = "follow" — keep streaming new lines live (Ctrl+C to stop watching; the container keeps running)
- `docker exec -it ... bash` — "execute a command inside a running container." The command here is `bash` — a shell — so you get a terminal INSIDE the box. `-it` = interactive + terminal, i.e. "let me type." Try `ls` and `cat app.py` inside, then `exit` to come back out
- `docker stop / rm` — stop = pause the delivery (container still exists, restartable). rm = remove the stopped container entirely. The image is untouched — you can always run a fresh one

`docker exec` is the moment it clicks: you are standing inside a tiny, separate Linux world living inside your Mac.

### 6.9 The Photograph Rule in Action

Edit the message string in `app.py`, then restart the container. **Nothing changes.** Why? The container runs the image — the photograph — and the photo was taken before your edit. The fix is always:

```bash
# After ANY code edit
docker build -t quickbite-eta:v1 .
docker rm -f eta-service
docker run -d -p 8000:8000 --name eta-service quickbite-eta:v1
```

Rebuild → remove old container (`rm -f` = force-remove even if running) → run fresh. Losing ten minutes to a stale image is a rite of passage. Do it once on purpose and you'll never lose those ten minutes again.

---

## 7. Dockerize an LLM Project — "ScalerGPT" RAG Bot 📚

**What you build:** a RAG chatbot (FastAPI + OpenAI API + ChromaDB). New concepts: **secrets/env vars, docker compose, volumes, multi-container networking, startup readiness**. Battle-tested code with fixes for two real bugs.

### What Changes at Level 2

LLM projects bring three problems classic ML didn't have:
1. **Secrets** — bake your API key into the image and you've written your PIN on your ATM card
2. **Multiple services** — an app plus a vector database. Two boxes, one order
3. **State** — the database's data must survive even after its container dies

The three solutions: **.env files, docker compose, and volumes.**

### 7.1 RAG in 60 Seconds

**RAG = Retrieval Augmented Generation** — an open-book exam for the LLM. Instead of answering from memory (where it hallucinates), the model is handed the relevant pages from *your* notes and told "answer using only this."

- **Embedding:** turning text into a list of numbers such that similar meanings get similar numbers. It's how the machine "feels" that *"container"* and *"Docker box"* are related even though they share no words
- **Vector database (Chroma):** a library that stores those numbers and can instantly find "the 3 most similar passages to this question"
- **The pipeline:** question → find relevant chunks (retrieve) → paste them into the prompt (augment) → let the LLM write the answer (generate)

### 7.2 Project Structure

```bash
# Terminal
mkdir scalergpt && cd scalergpt
mkdir docs
touch app.py ingest.py requirements.txt Dockerfile docker-compose.yml .env.example .dockerignore .gitignore
```

```text
# requirements.txt
fastapi==0.115.6
uvicorn==0.34.0
openai==1.59.7
chromadb-client==0.6.3
python-dotenv==1.0.1
```

Note it's `chromadb-client` — the *thin client* — not the full `chromadb` package. The full package IS the database (heavy); the client just *talks* to a database running elsewhere. Since Chroma will live in its own container, your app only needs the phone, not the whole telephone exchange. This keeps the app image small. Drop some `.txt` or `.md` notes into `docs/` — they become the bot's knowledge.

### 7.3 Secrets 101 — The ATM PIN Rule

> **Golden rule:** *"Image = ATM card (safe to share). Env var = PIN (inject at runtime, never write it on the card)."*

An **environment variable** is a named value the OS hands to a program when it starts — like a sticky note passed to the chef as they walk in, rather than printed in the recipe book everyone can read. A **.env file** is simply a text file of such notes, one per line.

```bash
# .env.example → copy to .env and add your real key
# Copy this file:  cp .env.example .env   — then paste your real key.
OPENAI_API_KEY=sk-paste-your-real-key-here
```

- No quotes, no spaces around the `=`
- Add `.env` to BOTH `.dockerignore` AND `.gitignore`. You ship a safe `.env.example` template instead
- If you ever write `ENV OPENAI_API_KEY=sk-...` in a Dockerfile, anyone can read it back with `docker history`. This is a favourite interview question

### 7.4 app.py — RAG with a Retry Loop (Fixed Version)

```python
# app.py
import os, sys, time
import chromadb
from chromadb.utils import embedding_functions
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI(title="ScalerGPT")

# Fail LOUDLY and clearly if the key is missing - not with a cryptic traceback
API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
if not API_KEY or API_KEY.startswith("sk-paste"):
    sys.exit("[ScalerGPT] OPENAI_API_KEY missing. Put a real key in .env")

llm = OpenAI(api_key=API_KEY)

# The thin client has no built-in embedder - we must supply one explicitly
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=API_KEY, model_name="text-embedding-3-small")

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

def connect_to_chroma(retries=30, delay=2):
    # Chroma takes a few seconds to boot. depends_on only waits for its
    # container to START, not to be READY - so we knock politely and retry.
    for attempt in range(1, retries + 1):
        try:
            client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
            client.heartbeat()
            print(f"[ScalerGPT] Connected to chroma at {CHROMA_HOST}:{CHROMA_PORT}", flush=True)
            return client
        except Exception as e:
            print(f"[ScalerGPT] Waiting for chroma ({attempt}/{retries}): {type(e).__name__}", flush=True)
            time.sleep(delay)
    sys.exit(f"[ScalerGPT] Could not reach chroma at {CHROMA_HOST}:{CHROMA_PORT}")

chroma = connect_to_chroma()
collection = chroma.get_or_create_collection(name="notes", embedding_function=openai_ef)

class Question(BaseModel):
    query: str

@app.get("/")
def health():
    return {"status": "ScalerGPT is live 📚", "docs_indexed": collection.count(),
            "chroma_host": CHROMA_HOST, "chroma_port": CHROMA_PORT}

@app.post("/ask")
def ask(q: Question):
    if collection.count() == 0:
        raise HTTPException(status_code=400,
            detail="No documents indexed. Run: docker compose exec app python ingest.py")
    # 1. RETRIEVE - find the 3 most relevant chunks
    hits = collection.query(query_texts=[q.query], n_results=3)
    documents = hits.get("documents") or [[]]
    context = "\n\n---\n\n".join(documents[0])
    # 2. AUGMENT - paste those chunks into the prompt
    system_prompt = ("You are ScalerGPT, a helpful teaching assistant. "
        "Answer using ONLY the context below. If it does not contain the answer, "
        f"say you don't know.\n\nCONTEXT:\n{context}")
    # 3. GENERATE - let the LLM write the final answer
    resp = llm.chat.completions.create(model="gpt-4o-mini",
        messages=[{"role": "system", "content": system_prompt},
                  {"role": "user", "content": q.query}])
    return {"question": q.query, "answer": resp.choices[0].message.content,
            "sources_used": len(documents[0])}
```

**In plain words:** at startup the app does three checks:
1. Is the API key present? If not, exit with a human-readable message instead of a scary traceback
2. Set up the *embedder* — the machine that converts text to numbers (the thin client doesn't include one, so you hand it OpenAI's)
3. **Knock on Chroma's door politely** — try to connect, and if refused, wait 2 seconds and knock again, up to 30 times, printing progress so you can watch it in the logs

Then `/ask` is the three-step RAG dance: find the 3 most relevant passages, paste them into the instructions, let GPT write the answer. The `if count() == 0` guard gives a helpful "you forgot to ingest" message instead of a confusing empty answer.

You'll also need `ingest.py` — it reads every file in `docs/`, splits them into paragraph chunks, and loads them into Chroma, using the same retry pattern.

### 7.5 The Bug That WILL Bite You: Started ≠ Ready

Here's the exact sequence:
1. You run `docker compose up -d`. Then `docker compose ps` shows… **only chroma**. The app has vanished.
2. Lesson 1: `ps` hides dead containers. `docker compose ps -a` reveals the app: **Exited (1)**.
3. Lesson 2: `docker compose logs app` shows the reason: *"Connection refused… Could not connect to a Chroma server."*
4. Lesson 3 (the real one): the compose file says `depends_on: chroma` — so why did it fail? Because **`depends_on` only waits for chroma's container to START, not for the database inside it to be READY.** Chroma needs a few seconds to boot. The app knocked immediately, got no answer, and gave up.

**Analogy:** the restaurant unlocked its door (container started) but the chef hasn't tied his apron yet (service not ready). If you shout your order at the locked kitchen and storm out, that's a crash. The retry loop in `app.py` is the polite customer who waits and knocks again.

### 7.6 docker-compose.yml — The Thali Order System (Fixed Version)

So far you ordered tiffins one at a time — `docker run` this, `docker run` that. Compose says: *write one menu, then just say "serve the thali."* YAML is a way of writing structured settings where **indentation shows what belongs to what**. (Careful: YAML is picky — use spaces, never tabs.)

```yaml
# docker-compose.yml
services:
  app:
    build: .
    container_name: scalergpt-app
    ports:
      - "8000:8000"
    env_file: .env
    environment:
      - CHROMA_HOST=chroma
      - CHROMA_PORT=8000     # INTERNAL port - see the port trap below!
    depends_on:
      - chroma
    restart: unless-stopped

  chroma:
    image: chromadb/chroma:0.6.3
    container_name: scalergpt-chroma
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma
    restart: unless-stopped

volumes:
  chroma_data:
```

**Line-by-line decoder:**

- `services:` — the menu. Each entry below is one container you want
- `build: .` — "build this service's image from the Dockerfile in this folder"
- `image: chromadb/chroma:0.6.3` — don't build — download this ready-made image from Docker Hub. You never write a Dockerfile for Chroma; someone already packed that tiffin
- `env_file: .env` — "at startup, hand this container all the sticky notes from `.env`" — the PIN gets injected at runtime, never baked into the image
- `environment:` — more sticky notes, written directly here (fine for non-secrets like hostnames)
- `CHROMA_HOST=chroma` — not an IP address — the **service name**! Compose creates a private network where every service is reachable by its name, like flats on an intercom. The app dials "chroma" and Docker connects the call
- `depends_on:` — "start chroma before me." ⚠️ Start — not ready. That's why `app.py` retries
- `restart: unless-stopped` — "if I crash, bring me back automatically" — unless a human explicitly stopped me. A free safety net
- `volumes:` (on chroma) — "mount the storage box named `chroma_data` at the path `/chroma/chroma` inside the container" — that's where Chroma keeps its data, so the data now lives OUTSIDE the disposable container
- `volumes:` (bottom) — declares the storage box itself so Docker creates and tracks it

### 7.7 The Port Trap: Published vs Internal

Look at chroma's line: `"8001:8000"`. Two different numbers — this is where everyone gets burned:

- Chroma listens on port **8000 inside its own container** (the flat number)
- You publish it as **8001 on the Mac** (the street gate) — only so YOU can poke it from outside for debugging, and because the app already took the Mac's 8000
- The app container is **already inside the building** — it's a neighbour, not a street visitor. Neighbours use flat numbers. So the app must use `CHROMA_PORT=8000`

**Setting `CHROMA_PORT=8001` is the single most common bug in this setup** — it produces "connection refused" and an exited app container. Say it twice: *containers talking to containers use INTERNAL ports. Only your Mac uses the published port.*

### 7.8 Milestone #2 — Serve the Thali

```bash
# Terminal
cp .env.example .env         # then put your REAL key inside .env

docker compose up -d --build

docker compose ps -a
docker compose logs app

docker compose exec app python ingest.py

curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Docker?"}'
```

**Command decoder:**

- `docker compose up` — "read `docker-compose.yml` and make reality match it" — create the network, the volume, and all containers, in dependency order
- `-d` — detached / background
- `--build` — "rebuild my images first if code changed." ⚠️ Make this a habit: after ANY file edit, `up -d --build`. Without it, Compose happily reuses the old photograph and your edit never arrives. This single mistake costs most people 15 minutes
- `docker compose ps -a` — list this project's containers **including dead ones**. Expect both "Up". If app says "Exited", read its logs
- `docker compose logs app` — the app's diary. You want to see: *[ScalerGPT] Connected to chroma at chroma:8000* — you may first see a few "Waiting for chroma (1/30)" lines. That's the retry loop doing its job!
- `docker compose exec app python ingest.py` — "inside the already-running **app** container, execute `python ingest.py`." This is how you run one-off jobs (migrations, imports) in production — you don't start a new container, you step into the live one

Then open **http://localhost:8000/docs** and ask questions from the Swagger UI. The test worth doing: ask *"What is the capital of France?"* — ScalerGPT says it doesn't know, because the answer isn't in your docs. **That's proof the answers are grounded in YOUR documents, not the model's memory.**

### 7.9 Milestone #2.5 — The Volume Magic Trick

```bash
# Destroy everything. Data survives.
docker compose down
docker compose up -d
curl http://localhost:8000/
```

- `docker compose down` — the opposite of up: stop and DELETE all containers and the network. The thali is cleared. But volumes survive by default
- `docker compose up -d` — brand-new containers from scratch
- `curl http://localhost:8000/` — `docs_indexed` is STILL > 0 — you never re-ingested, yet the data is there. It lives in the volume, not the container ♻️
- `docker compose down -v` — know it, don't run it casually: `-v` also deletes volumes. THIS is how you actually lose the data. The steel dabba goes to the scrapyard

**The takeaway:** containers die all the time — deployments, crashes, scaling. Volumes are the steel box that comes back after every delivery. *Container = disposable. Volume = permanent.*

---

## 8. Dockerize an Agentic Project — "DeskBuddy" 🤖

**What you build:** a 3-container agentic system — an **agent service** (LLM + tool-calling loop), a **tools service** (separate microservice), and **Redis** (conversation memory). New concepts: microservice separation, private networking (no published port!), and one compose file running it all.

### 8.1 What an Agent Actually Is

An agent is an LLM that doesn't just answer — it *does things*. It thinks, picks up a tool, checks the result, and keeps going.

**Office analogy:** the *agent = the manager* (decides what needs doing), *tools = the departments* (they do the actual work), and *Redis = the office register* (remembers who said what).

Why three separate boxes? Because in production, the tools team is different from the agent team. You update the tools without touching the agent. That's *microservices* — and without Docker, microservices are just a slide in a deck.

### 8.2 What Is Redis, in 30 Seconds

Redis is a super-fast "sticky-note board" database: you store values under names (*key → value*) and read them back in microseconds. Here it remembers each conversation: key = the session ID, value = the message history. Why not a Python variable? Because containers die and restart — a variable dies with them. Redis in its own container (with a volume) means the agent can crash, restart, and still remember you. Someone already packed the Redis tiffin: you just write `image: redis:7-alpine`.

### 8.3 Project Structure + The Tools Service

```bash
# Terminal
mkdir deskbuddy && cd deskbuddy
mkdir agent tools
touch docker-compose.yml .env.example
touch agent/app.py agent/requirements.txt agent/Dockerfile
touch tools/app.py tools/requirements.txt tools/Dockerfile
```

Two subfolders = two separate services, each with its OWN code, OWN requirements, OWN Dockerfile. This is the microservice idea made physically visible in the folder structure. Redis needs no folder — it's a ready-made image.

```python
# tools/app.py — two simple tools
from fastapi import FastAPI
from pydantic import BaseModel
import datetime

app = FastAPI(title="DeskBuddy Tools")

class Calc(BaseModel):
    expression: str

@app.post("/calculator")
def calculator(c: Calc):
    try:
        # demo only - never use eval in production!
        return {"result": eval(c.expression, {"__builtins__": {}})}
    except Exception as e:
        return {"error": str(e)}

@app.get("/datetime")
def now():
    return {"now": datetime.datetime.now().isoformat()}
```

**In plain words:** the tools service is just another tiny FastAPI app with two endpoints: a calculator (evaluates a math expression) and a clock. Nothing AI about it — it's a plain worker department. Why does an LLM need a calculator at all? Because LLMs predict text; they're famously unreliable at arithmetic. Giving them a calculator is like giving an eloquent manager an actual accountant. Its Dockerfile ends in uvicorn on port 7000. **⚠️ Note:** `eval` is fine for a classroom demo and dangerous in production — it can execute arbitrary code. In a real service you'd use a safe expression parser.

### 8.4 The Agent — The Think → Act → Observe Loop

```python
# agent/app.py — the heart of it (core loop excerpt)
r = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, decode_responses=True)
TOOLS_URL = os.getenv("TOOLS_URL", "http://tools:7000")

@app.post("/chat")
def chat(req: Chat):
    key = f"history:{req.session_id}"
    history = [json.loads(m) for m in r.lrange(key, 0, -1)]   # load memory
    history.append({"role": "user", "content": req.message})

    for _ in range(5):                                  # the agent loop
        resp = llm.chat.completions.create(
            model="gpt-4o-mini", messages=history, tools=TOOL_DEFS)
        msg = resp.choices[0].message
        if not msg.tool_calls:                            # no tool needed?
            break                                         # then we're done
        history.append(msg.model_dump(exclude_none=True))
        for tc in msg.tool_calls:                        # run each requested tool
            result = call_tool(tc.function.name, json.loads(tc.function.arguments))
            history.append({"role": "tool", "tool_call_id": tc.id,
                            "content": json.dumps(result)})

    # save memory back to redis, return final answer
```

**In plain words:** the loop is the whole magic of "agents", and it's just 10 lines. Each cycle:
1. Show the LLM the full conversation plus a menu of available tools (`TOOL_DEFS` describes each tool's name and inputs — the menu card)
2. The LLM either answers in words — done, break — or replies "please run calculator with 23*47 for me"
3. You actually call the tools service over HTTP, paste the result back into the conversation, and go around again so the LLM can see what happened

Max 5 laps so a confused model can't loop forever (a "safety fuse"). Memory: before the loop you load this session's history from Redis; after, you save it back — that's how a follow-up like "now double it" works.

**Look at the two addresses:** `http://tools:7000` and `host="redis"`. Again — service names, not IPs.

### 8.5 The Full Thali — 3-Service Compose

```yaml
# docker-compose.yml
services:
  agent:
    build: ./agent
    ports:
      - "9000:9000"
    env_file: .env
    environment:
      - TOOLS_URL=http://tools:7000
      - REDIS_HOST=redis
    depends_on: [tools, redis]
    restart: unless-stopped

  tools:
    build: ./tools
    restart: unless-stopped
    # NOTE: no ports! Explained below - this is the security gem

  redis:
    image: redis:7-alpine
    volumes:
      - agent_memory:/data
    restart: unless-stopped

volumes:
  agent_memory:
```

**What's new here:**

- `build: ./agent` — each service builds from its own subfolder's Dockerfile. One compose file, two custom images, one ready-made
- `tools: (no ports!)` — **the security gem**. No `ports` section = no street gate = the outside world **cannot reach it at all**. Only fellow residents of the private network (the agent) can call it at `tools:7000`. Try `curl localhost:7000` from your Mac — connection refused, *by design*. "Never give internal departments a public entrance." One tiny omission; gold in interviews and in production
- `redis:7-alpine` — "alpine" = built on a tiny 5MB Linux. Whole Redis image ≈ 40MB
- `agent_memory` volume — same trick as Chroma: conversation memory survives container death

Note what you did **not** need here: the retry-loop lesson doesn't bite, because the Redis client only connects when first used (lazily), and Redis boots in under a second. `restart: unless-stopped` is the seatbelt anyway.

### 8.6 Milestone #3 — The Agent in Action + Memory Proof

Split your terminal in two. Left: `docker compose logs -f`. Right: the curls. You'll watch requests ripple across three containers live.

```bash
# Terminal
cp .env.example .env         # real key inside, same as before
docker compose up -d --build
docker compose ps -a

curl -X POST http://localhost:9000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "demo", "message": "What is 23*47, and what time is it right now?"}'

curl -X POST http://localhost:9000/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "demo", "message": "Now double that multiplication result"}'

docker compose logs -f
```

**What to watch for:**

- **First curl** — a two-tool task on purpose: the agent must call BOTH calculator and clock, then compose one answer. Watch the loop go around twice in the logs
- **Second curl** — same `session_id` = same Redis key = the agent remembers 1081 from a minute ago and answers 2162. Change `session_id` to "other" and ask again — no memory. That's isolation per user, for free
- `docker compose logs -f` — all three services' diaries interleaved, colour-coded by name. This is how you debug multi-service systems

**The point:** three services, one command, real memory, proper isolation. And this exact compose file works unchanged on an EC2 instance — *same commands, same result*. That bridge from laptop to production is Docker's superpower.

---

## 9. Cheatsheet — Essential Docker Commands

- `docker build -t name:tag .` — build an image from the Dockerfile here (pack the master box from the recipe)
- `docker run -d -p 8000:8000 img` — start a container, background, map ports (deliver the tiffin, set the gate)
- `docker ps` / `docker ps -a` — running containers / ALL incl. dead ones (today's deliveries / the full register)
- `docker logs -f name` — stream a container's output live (the box's diary)
- `docker exec -it name bash` — open a shell inside a running container (step inside the box)
- `docker images` — list all images on your machine (the shelf of master tiffins)
- `docker rm -f name` — force-remove a container, even if running (recall the delivery immediately)
- `docker compose up -d --build` — rebuild if needed + start all services (serve the thali, fresh)
- `docker compose ps -a` — this project's containers, incl. exited (which dishes made it, which didn't)
- `docker compose exec app CMD` — run a one-off command in a live service (ask the chef mid-service)
- `docker compose down` — stop + delete containers, volumes safe (clear the thali, keep the steel boxes)
- `docker compose down -v` — …and delete volumes too ⚠️ data gone (scrap the steel boxes)
- `docker compose logs -f` — all services' logs together (CCTV over the whole kitchen)
- `docker compose up -d --force-recreate` — recreate containers, e.g. after `.env` edits (fresh boxes, same recipe)
- `docker volume ls` — list volumes on your machine (count the steel dabbas in stock)
- `docker system df` — how much disk Docker is eating (check the pantry weight)
- `docker system prune -a` — delete unused images/containers, careful! (Diwali deep-clean 🧹)
- `docker run --platform linux/amd64` — the Mac ARM fix (dubbing for another audience)
- `docker history image` — show every layer + the command that made it (read the recipe backwards, find leaked secrets)
- `lsof -i :8000` — find which process is holding a port (who's blocking the gate?)

---

## 10. The Golden Rules — Read Before Any Interview

1. **The image is a photograph, not a mirror.** Edited a file? Rebuild: `docker compose up -d --build`
2. **`ps` hides the dead.** Service missing? `ps -a`, then `logs <service>`
3. **Started ≠ ready.** `depends_on` waits for the container, not the service inside. Retry in code or add a healthcheck
4. **Internal ports for neighbours, published ports for visitors.** Container→container uses the internal port
5. **Secrets are PINs.** `.env` + `env_file` at runtime; never `ENV` in a Dockerfile, never commit `.env`
6. **.env changed? Recreate.** Env vars load at container start: `--force-recreate`
7. **No `ports:` = no public entrance.** Internal services should stay internal
8. **Rarely-changing layers on top.** That's the whole caching game
9. **See `quote>` in zsh?** You pasted a # comment. Ctrl+C, re-run without it

---

## 11. The Debug Decision Tree

When something breaks, don't guess. Walk this:

```
Something is broken.
│
├─ Does docker ps show my container?
│   ├─ NO → run docker ps -a (or compose ps -a)
│   │     ├─ Status "Exited" → docker logs <name>  ← the answer is in here
│   │     │     ├─ "Connection refused"   → started ≠ ready, or wrong port/host
│   │     │     ├─ "KeyError / missing key" → .env not loaded → --force-recreate
│   │     │     └─ Python traceback        → your code, not Docker. Fix, then --build
│   │     └─ Not listed at all → the build failed. Scroll up in the build output.
│   └─ YES → keep going ↓
│
├─ Can I reach it from my Mac (curl localhost:PORT)?
│   ├─ NO → check three things, in order:
│   │     1. Is there a -p / ports: line at all?   (no ports = private, by design)
│   │     2. Is the LEFT number the one I'm curling?  (host:container)
│   │     3. Does the app bind to 0.0.0.0, not 127.0.0.1?
│   └─ YES → keep going ↓
│
├─ Can container A reach container B?
│   ├─ NO → am I using the SERVICE NAME as host (not localhost)?
│   │        am I using the INTERNAL port (not the published one)?
│   │        are both services in the same compose file?
│   └─ YES → keep going ↓
│
└─ Is my code change showing up?
    ├─ NO → you rebuilt? docker compose up -d --build
    │        edited .env? docker compose up -d --force-recreate
    └─ YES → it's a logic bug now. Congratulations, that's your job. 🙂
```

---

## 12. Top Mac Errors and Fixes

1. **"Cannot connect to the Docker daemon"** → Docker Desktop isn't open. Launch it, wait for the whale
2. **"port is already allocated"** → find the culprit with `lsof -i :8000`, or map another port: `-p 8080:8000`
3. **App container missing from `ps`** → it crashed: `ps -a` then `logs app`
4. **Platform warning (arm64/amd64)** → add `--platform linux/amd64`
5. **Build very slow / disk full** → `docker system df`, then `docker system prune`
6. **Edits not showing up** → rebuild: `up -d --build`
7. **Stuck at `quote>`** → Ctrl+C, re-run without the trailing comment

---

## 13. Practice Challenges

1. **Warm-up** — Push the QuickBite ETA image to Docker Hub (`docker tag` + `docker push`)
2. **Medium** — Replace ScalerGPT's retry loop with a compose `healthcheck` on chroma + `depends_on: condition: service_healthy`. Write two lines on which approach you'd pick and why
3. **Hard** — Add a *weather* tool to DeskBuddy by updating ONLY the tools service — no agent rebuild. This proves you understood microservices
4. **Boss level** — Multi-stage builds on all three projects; cut image sizes by 40%. Record before/after from `docker images`
5. **Bonus** — Break something on purpose (wrong port, missing `.env`, edit without rebuild), then fix it using only the debug tree above. This is the fastest way to make the knowledge stick

---

## 14. Interview Questions You Can Now Answer

1. **Explain the Docker build cache and how you'd optimise a slow Dockerfile.** Talk about layers, ordering, `COPY requirements.txt` first, `--no-cache-dir`, and multi-stage builds
2. **How do you handle secrets in a containerised app?** Runtime injection via env vars / secret managers, never `ENV` in the Dockerfile, `.env` in both ignore files, and `docker history` as the attack you're preventing
3. **Your service depends on a database that takes 20s to boot. How do you handle startup ordering?** `depends_on` isn't enough; use healthchecks with `condition: service_healthy`, or application-level retry with backoff. Mention that retry-in-code is more portable across orchestrators
4. **How do containers discover each other?** Compose/Kubernetes DNS by service name, internal ports, and why hardcoding IPs is wrong
5. **Container vs VM — when would you still choose a VM?** Different kernel required, strong hardware-level isolation for untrusted workloads, or legacy OS dependencies
6. **How do you persist state in a stateless system?** Volumes and external stores; containers are cattle, not pets
7. **How would you make this compose stack production-ready?** Healthchecks, resource limits, non-root user, pinned image digests, logging driver, secrets manager, and moving to an orchestrator
8. **What's in your image that shouldn't be?** Build tools, `.git`, credentials, test data, dev dependencies — and how multi-stage builds and `.dockerignore` fix it
9. **How do you debug a container that exits immediately?** `ps -a` → `logs` → check the CMD → run it interactively with an overridden entrypoint
10. **Why doesn't your internal service publish a port?** Attack surface. Only the edge service is reachable; everything else is on the private network

---

## 15. Glossary

- **Image** — a read-only, layered package of your app plus everything it needs to run
- **Container** — a running instance of an image, isolated from the host and from other containers
- **Layer** — the filesystem diff produced by one Dockerfile instruction. Cached and reused across builds
- **Build context** — the folder you pass to `docker build` (the lonely `.`). Everything in it, minus `.dockerignore`, is sent to the Docker engine
- **Registry / Docker Hub** — the remote store where images are pushed and pulled from
- **Tag** — the human-readable `name:version` label on an image
- **Daemon** — the background engine that actually does the work. Docker Desktop starts it; the whale icon means it's alive
- **Port publishing** — mapping a host port to a container port so the outside world can reach in (`-p host:container`)
- **Volume** — Docker-managed storage that outlives containers. For anything you can't afford to lose
- **Bind mount** — mapping a host folder straight into a container. Great for live-reload in development, avoided in production
- **Compose** — a tool that reads one YAML file and runs a whole multi-container application
- **Service** — one entry in a compose file — and also the DNS name other containers use to reach it
- **Healthcheck** — a command Docker runs periodically to decide whether a container is actually ready, not just started
- **Multi-stage build** — using one image to build and a second, smaller one to run — the standard way to shrink production images
- **Orchestrator** — the system that runs containers across many machines (Kubernetes, ECS). Compose is the single-machine version of the same idea

---

## 16. The One Line to Remember

> *"Writing code is half the job. Making it run anywhere in the world — that's engineering. Docker is the box that carries your work to the world."*

**Where to go next:** Kubernetes — for when you have 10,000 boxes to manage instead of three. Everything you learned here (images, ports, volumes, service names, readiness) maps directly onto it. You've already done the hard part. 🐳

