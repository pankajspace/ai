[<- README](../../README.md) | [Notes](ai-infused-learning-1.html)

# AI Infused Learning - 1

# Links
1. [Class 1 Notes](https://22f1001418.github.io/AI-engg-scripts-SL/)

# My Notes

## 1. Why AI Is Suddenly Everywhere
AI is ~70 years old, but two shifts flipped it from research curiosity to everyday tool:

1. **The 2017 Transformer** — the architecture that powers GPT, Claude, and Gemini (the "engine").
2. **November 2022 — ChatGPT launches** — the fastest-adopted product in history.

These produced two structural changes:

1. **The model became general-purpose.** Old AI did *one* task (spam-or-not). Today's AI does *thousands* — write, summarise, translate, code, answer — all from one brain.
2. **The barrier to entry collapsed.** You don't build the AI; you *use* it through a simple API — like ordering food through an app instead of running a kitchen. If you can call a function, you can build with AI.

## 2. What an LLM Really Is
The core mental model: an LLM is **super-autocomplete** — your phone's next-word suggestion scaled up a billion times and trained on much of the internet. Every visible ability (chat, code, summaries, translation) *emerges* from that single next-token trick — nothing is separately programmed.

### Tokens
A model doesn't read letters or words — it reads **tokens** (pieces roughly ¾ of a word, ≈ 4 characters). It thinks in tokens and you're billed per token. Tokens are an engineering trade-off between two failing extremes:

1. **One token per word** — millions of words across all languages, plus names, typos, slang and new words daily. The vocabulary would be impossibly huge and would freeze on any unseen word.
2. **One token per letter** — only ~100 symbols (tiny vocabulary), but every sentence becomes hundreds of tokens: slow, expensive, and it must relearn spelling constantly.
3. **Tokens (sub-words)** ✅ — a vocabulary of ~100k common chunks. Frequent words stay whole; rare ones are built from pieces.

Example — a word the model never saw still works because it's assembled from familiar pieces:

```text
"unbelievableness"  →  un + believ + able + ness
```

Meanwhile `"the"`, `"cat"`, `"is"` are each a single token. **Engineer's note:** English is "cheap" (≈¾ word per token); code, emojis, and non-English scripts (Hindi, Tamil) cost more tokens per character — which matters when you price an app.

### Next-Token Prediction
Given the tokens so far, the model scores **every possible next token** with a probability, picks one, appends it, and repeats. That loop *is* "generating text" — a whole paragraph is just this one-token-at-a-time step run over and over.

### Temperature — the creativity dial
- **Low (≈ 0.2)** → almost always picks the most likely token → focused, repeatable, near-deterministic. A support bot wants this.
- **High (≈ 1.0)** → sometimes picks surprising tokens → creative, varied. A brainstorming tool wants this.

This is a real engineering choice you set on day one of any project.

### No Memory + Context Window
Between calls, an LLM **forgets everything**. Anything it should "know" in a conversation must be **re-sent every time**, inside a limited **context window** (measured in tokens). This single fact quietly explains a huge amount of AI engineering.

## 3. The Trick That Made It Possible — Self-Supervision
How do you teach a machine language without an army of humans labelling billions of examples?

1. **The old, slow way:** humans hand-label data ("this email = spam", "this review = positive"). Accurate, but needs millions of labelled examples.
2. **The clever shortcut — self-supervision:** take any sentence from the web, *hide a word*, and ask the model to guess it. The answer is *already in the text*, so the internet becomes its own teacher — trillions of free practice questions, no humans needed.

To reliably fill in *"the barista handed me a hot cup of ___"* with "coffee", the model must quietly learn grammar, context, and how the world works. **Understanding emerges as a side-effect of getting good at fill-in-the-blank** — that's the whole secret behind ChatGPT.

**Hallucinations:** because it learned by predicting *plausible* text (not looking up facts), an LLM can produce confident-sounding *wrong* answers. Designing around this — e.g. feeding it real documents (RAG) — is a big part of the job. Trust, but verify.

## 4. What You Can Build

### Foundation & Multimodal Models
A **foundation model** is one giant general-purpose brain you adapt to many jobs. **Multimodal** models add more *senses* — text, images, audio, video in and out. Show it a photo of your fridge → get a recipe; speak to it → it talks back. Same idea as text, more senses.

### The 8 Things People Build With AI
1. **Coding** — write, explain, fix code. The #1 use case (Copilot, Cursor).
2. **Writing** — emails, blogs, marketing copy (Jasper, Notion AI).
3. **Image & Video** — generate art, edit photos, make clips (Midjourney).
4. **Education** — personal tutors at your pace (Khanmigo).
5. **Chatbots** — support, sales, assistants (Intercom Fin).
6. **Info Aggregation** — summarise & search mountains of text (★ today's project).
7. **Data Organization** — tag, sort, structure messy info (classification).
8. **Workflow / Agents** — multi-step actions (the frontier).

Under the hood they all do one thing: *connect to a model, give it the right context, get a useful answer, wrap it in a UI.*

## 5. Where You Fit In — AI Engineering
**AI Engineering is building real products on top of pre-trained models** (GPT, Claude, Gemini) without training the models yourself.

**The car analogy:** an ML engineer *builds the engine*; an AI Engineer *builds the car around an engine someone else already built*. Three roles, cleanly separated:

1. **ML / Data Scientist — builds the engine.** Trains models from raw data; cares about datasets, GPUs, accuracy. "How do I *create* a model?"
2. **AI Engineer — builds the car (you, today).** Takes a powerful existing model and makes it a product; cares about prompts, APIs, cost, reliability. "How do I *use* GPT to summarise 10,000 articles a day?"
3. **Software Engineer — builds the road.** The app, the buttons, the database.

The hardest, most expensive part (training) is already done — so Python + an API key is genuinely enough to begin.

## 6. Your First API Call

### Setup (once)
1. Install a code editor — VS Code (classic standard) or Cursor (VS Code + baked-in AI). Either is fine.
2. Add the **Python** and **Jupyter** extensions.
3. Get an OpenAI API key.
4. Put the key in a `.env` file — **never in your code**.

### The `.env` file + loading the key
```bash
# .env  — keep this file private! Add it to .gitignore
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

```python
# load_key.py — read it in your code
# pip install python-dotenv
from dotenv import load_dotenv
load_dotenv()                 # loads everything from .env

# now OpenAI() finds the key automatically — no key in your code 🎉
```

**The one habit that saves careers:** add `.env` to `.gitignore` so it never reaches GitHub. Leaked keys are found by bots in minutes and can run up real bills. API keys are a password to your wallet.

### The 6 lines that actually talk to an AI
```python
# first_call.py
# pip install python-dotenv openai
from dotenv import load_dotenv
from openai import OpenAI
load_dotenv()                 # loads everything from .env

client = OpenAI()             # reads your API key from the environment

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a witty travel guide."},
        {"role": "user",   "content": "Suggest one thing to do in Bangalore."},
    ],
)
print(response.choices[0].message.content)
```

### The 3 roles — the entire grammar of chat models
1. **`system`** — sets personality & rules ("You are a careful tutor. Never give the full answer."). Written once, applies throughout.
2. **`user`** — what the human asks; the actual request.
3. **`assistant`** — the model's reply. To continue a chat, append it back and resend the whole list (remember: no memory!).

(A fourth role, `tool`, arrives in Class 2 for agents.)

### Model swappability (Groq + Llama)
Because most providers speak the same OpenAI-style interface, you swap the "brain" by changing only the **key**, the **`base_url`**, and the **model name** — the rest of your code is untouched:

```python
# groq_call.py
# pip install openai   (yes — the same library!)
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# point the SAME client at Groq instead of OpenAI 👇
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",        # a free Llama model on Groq
    messages=[
        {"role": "system", "content": "You are a witty travel guide."},
        {"role": "user",   "content": "Suggest one thing to do in Bangalore."},
    ],
)
print(response.choices[0].message.content)
```

Get a free key at `console.groq.com`. There's even a free, runs-on-your-laptop option (Ollama) that uses the exact same code pointed at a local address.

## 7. Mini-Project — AI Website Summarizer
**Goal:** give it any web page URL → it reads the page and hands back a clean summary. The whole app is five boxes:

```
🔗 URL → 🕷️ Scrape → 🧩 Prompt → 🧠 LLM → 📄 Summary
```

### Step 1 — the scraper (treat as a black box)
Plain web scraping, *not* AI. It turns a URL into the page's readable text as a string:

```python
# scraper.py
# pip install requests beautifulsoup4
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

def fetch_website_contents(url):
    # add scheme if the user forgot it
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return f"Could not fetch the website. Error: {e}"

    soup = BeautifulSoup(response.text, "html.parser")
    title = soup.title.string if soup.title else "No title found"

    for tag in soup(["script", "style", "nav", "footer", "header", "img", "input"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    return f"Title: {title}\n\nPage contents:\n{text}"
```

### Step 2 — the brain (prompt + LLM call)
```python
# summarizer.py
from openai import OpenAI
from dotenv import load_dotenv
from scraper import fetch_website_contents

load_dotenv()          # <-- this reads your .env file
client = OpenAI()

system_prompt = """You analyze the contents of a website and
give a short, friendly summary. Ignore navigation menus.
Respond in markdown."""

def summarize(url):
    website = fetch_website_contents(url)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role":"system", "content": system_prompt},
            {"role":"user",   "content": f"Summarize this website:\n\n{website}"},
        ],
    )
    return response.choices[0].message.content
```

**The "wow" lever — prompt engineering.** Edit one line of the `system_prompt` — "give a *snarky, humorous* summary", "explain it to a 10-year-old", or "respond in Hindi" — and the whole app behaves differently. You change behaviour by changing the prompt, not the code.

### Step 3 — the face (Gradio = a web app in 4 lines)
Gradio wraps any function in a shareable web UI — no HTML, CSS, or JS:

```python
# app.py
# pip install gradio
import gradio as gr
from summarizer import summarize

gr.Interface(
    fn=summarize,                                  # your function
    inputs=gr.Textbox(label="Website URL"),
    outputs=gr.Markdown(label="Summary"),
    title="🔎 AI Website Summarizer",
).launch(share=True)   # share=True → a public link you can post! 🎉
```

### Step 4 — run it
```bash
# 1. install everything you need (one time)
$ pip install openai gradio requests beautifulsoup4 python-dotenv

# 2. launch the app
$ python app.py

# 3. Gradio prints two links:
Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://a1b2c3.gradio.live   # ← share this!
```

The `*.gradio.live` link works for anyone for ~72 hours — perfect to screen-record for LinkedIn. Stop the app anytime with `Ctrl + C`. **Debug tip:** 90% of first errors are a missing `pip install` or a key not loaded from `.env` — check those two first.

## 8. Bonus Build — LLM Arena
Inspired by arena-style leaderboards: send one prompt to **two** models, show both answers side by side, and let people **vote**. Millions of blind votes on anonymous model pairs are how the AI world (and companies internally) rank which model is actually best.

The core idea — one prompt, two brains:

```python
# arena.py — the whole idea
def battle(prompt):
    msgs = [{"role": "user", "content": prompt}]

    # Model A — OpenAI's GPT
    a = openai_client.chat.completions.create(model="gpt-4o-mini", messages=msgs)

    # Model B — Llama on Groq (same code, different brain!)
    b = groq_client.chat.completions.create(model="llama-3.3-70b-versatile", messages=msgs)

    return a.choices[0].message.content, b.choices[0].message.content
```

The full app wraps this in Gradio `Blocks` with two columns and 👍/👎 voting:

```python
# arena_app.py
# pip install openai gradio python-dotenv
import os
import gradio as gr
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

openai_client = OpenAI()                                  # uses OPENAI_API_KEY
groq_client   = OpenAI(api_key=os.getenv("GROQ_API_KEY"),
                            base_url="https://api.groq.com/openai/v1")

def ask(client, model, prompt):
    r = client.chat.completions.create(
        model=model, messages=[{"role": "user", "content": prompt}])
    return r.choices[0].message.content

def battle(prompt):
    a = ask(openai_client, "gpt-4o-mini", prompt)
    b = ask(groq_client, "llama-3.3-70b-versatile", prompt)
    return a, b

def vote(label):
    return f"🗳️ Thanks! You voted: **{label}**"   # in real apps, save this to a file/DB

with gr.Blocks(title="LLM Arena") as demo:
    gr.Markdown("# 🥊 LLM Arena — one prompt, two models")
    prompt = gr.Textbox(label="Ask both models the same thing")
    go = gr.Button("⚔️ Battle!", variant="primary")

    with gr.Row():
        with gr.Column():
            gr.Markdown("### 🤖 Model A")
            out_a = gr.Markdown()
            with gr.Row():
                up_a   = gr.Button("👍");  down_a = gr.Button("👎")
        with gr.Column():
            gr.Markdown("### 🤖 Model B")
            out_b = gr.Markdown()
            with gr.Row():
                up_b   = gr.Button("👍");  down_b = gr.Button("👎")

    verdict = gr.Markdown()

    go.click(battle, inputs=prompt, outputs=[out_a, out_b])
    up_a.click(lambda: vote("👍 Model A"), outputs=verdict)
    down_a.click(lambda: vote("👎 Model A"), outputs=verdict)
    up_b.click(lambda: vote("👍 Model B"), outputs=verdict)
    down_b.click(lambda: vote("👎 Model B"), outputs=verdict)

demo.launch(share=True)   # → local + public link 🎉
```

## 9. A Peek Ahead
1. **🔗 LangChain** — reusable prompt templates, multi-step pipelines (chains joined with `|`), memory, and connectors on top of raw API calls. Taste: `chain = prompt | model` then `chain.invoke({...})`.
2. **📚 RAG** — "chat with your own PDFs." Retrieve the relevant snippets from your documents and paste them into the prompt so the AI answers *from* your data. Tames hallucinations.
3. **🤖 Agents** — an LLM given *tools* + a *loop*: it thinks, acts, reads the result, and repeats. The leap is autonomy — nobody hard-codes "check the weather"; the agent *decides* to.
4. **👥 Multi-Agent** — split bigger jobs across specialist agents (manager, researcher, writer, editor) that hand off to each other.

# Quick Review of Concepts

## LLM (Large Language Model)
At its core an LLM is **super-autocomplete** — the same next-word suggestion your phone makes, scaled up a billion times and trained on much of the internet. It predicts the next chunk of text given everything before it, and every visible ability (chat, coding, summarizing, translation) emerges from that single next-token trick rather than from separately programmed features.

## Tokens
Models read, think, and bill in **tokens** — sub-word pieces averaging about ¾ of a word (~4 characters). Tokens are a sweet spot between a whole-word vocabulary (millions of words, would freeze on any new word) and single letters (tiny vocabulary but every sentence becomes hundreds of slow, expensive tokens). A vocabulary of ~100k common chunks keeps frequent words whole while building rare ones from pieces — e.g. `"unbelievableness"` becomes `un + believ + able + ness` — so one fixed vocabulary can spell any word in any language, even ones invented tomorrow. Note that English is "cheap" (~¾ word per token) while code, emojis, and non-English scripts cost more tokens per character.

## Next-Token Prediction
Generation is a loop: the model scores the probability of every possible next token, picks one (influenced by temperature), appends it to the text, and repeats. Producing a whole paragraph is just this one-token-at-a-time step run over and over.

## Temperature
Temperature is the creativity dial. Near 0 the model strongly favors the highest-probability token, giving focused, repeatable, near-deterministic output; higher values raise the odds of lower-probability tokens, adding variety and surprise. This is a real engineering choice you set on day one: a support bot wants temperature ≈ 0.2 (consistent), while a brainstorming tool wants ≈ 1.0 (varied).

## No Memory & Context Window
An LLM is stateless — it forgets everything between calls. To hold a conversation you must re-send all relevant history each time, and that history has to fit inside the **context window**, the model's limited token budget for a single request. This one fact quietly explains a huge amount of AI engineering.

## Self-Supervision
Models learn by playing fill-in-the-blank on massive amounts of internet text: take any sentence, hide a word, and have the model guess it — the correct answer is already in the text, so the internet becomes its own teacher with trillions of free practice questions and no human labeling. To reliably guess a word like "coffee" after "the barista handed me a hot cup of ___", the model must quietly learn grammar, context, and how the world works, so language understanding emerges as a side-effect of getting good at prediction.

## Hallucinations
Because the model learned by predicting **plausible** text rather than looking up facts, it can produce confident-sounding but wrong answers. Designing around this — for example by feeding the model real documents — is a big part of the AI engineer's job: trust, but verify.

## Foundation Models
Foundation models are large, broadly pre-trained, general-purpose models trained on diverse data — one giant general-purpose brain you adapt to many jobs. They learn reusable patterns that can be adapted to many downstream tasks through prompting or fine-tuning, rather than being built for one narrow task like old "spam-or-not" classifiers.

## Multimodal Models
Multimodal models understand, combine, and sometimes generate more than one type of data — text, images, audio, or video — reasoning across formats within a single system. Practically, that means showing it a photo of your fridge to get a recipe, or speaking to it and having it talk back: same idea as text, just more senses.

## 8 AI Use Cases
Almost every AI product falls into one of eight buckets:
1. **coding** (the #1 use case — Copilot, Cursor),
2. **writing** (Jasper, Notion AI),
3. **image/video generation** (Midjourney),
4. **education** (Khanmigo),
5. **chatbots** (Intercom Fin),
6. **information aggregation** (summarizers/search),
7. **data organization** (tagging, classification),
8. **workflow/agents** (the frontier).

Under the hood they all follow the same pattern — connect to a model, give it the right context, get a useful answer, wrap it in a UI.

## AI Engineering
AI Engineering is building real products on top of pre-trained models (GPT, Claude, Gemini) without training those models yourself — "you build the car around an engine someone else already built." It sits between the ML engineer/data scientist (who builds the engine, caring about datasets, GPUs, accuracy) and the software engineer (who builds the road — the app, buttons, database). The hardest, most expensive part — training the model — is already done, so Python plus an API key is genuinely enough to begin.

## API Call & Roles
Calling an LLM uses three message roles, the entire grammar of chat models:
1. `system` (sets personality and rules, written once and applied throughout).
2. `user` (the human's actual request).
3. `assistant` (the model's reply). Its also called as a `model` in case of some LLM's like Gemini.
4. `tool` (the tool's reply).

To continue a chat you append the assistant's reply back and resend the whole list, since the model has no memory.

## API Keys & `.env`
API keys are secret passwords to your wallet, tied to your billing account. Store them in a `.env` file, add that file to `.gitignore`, and load them at runtime — never hard-code them in shared code. Leaked keys get found by bots within minutes and can run up real bills, so this is the one habit that saves careers.

## Model Swappability
Because most providers speak the same OpenAI-style interface, you can swap the underlying "brain" — OpenAI's GPT, Anthropic's Claude, Google's Gemini, Groq's Llama, or a local Ollama model — by changing only the API key, `base_url`, and model name, leaving the rest of your code untouched. There's even a free, runs-on-your-laptop option (Ollama) that uses the exact same code pointed at a local address.

## Web Scraping
Web scraping is a non-AI preprocessing step that fetches a page's readable text (e.g., with `requests` + `BeautifulSoup`, stripping out scripts, styles, nav, and footer tags). Treat it as a black box that turns a URL into a plain string you can then feed to the model — no need to understand its internals; the AI magic is in the prompt step.

## Prompt Engineering
Prompt engineering reshapes an app's behavior by changing the prompt (especially the system prompt) rather than the code — edit one line to make a summarizer "snarky and humorous," "explain it to a 10-year-old," or "respond in Hindi," and the whole app behaves differently. It's the fastest, cheapest way to steer a model, and it's the "wow lever" of the website summarizer project.

## Gradio
Gradio is a Python library that wraps any function in a shareable web UI in just a few lines — no HTML, CSS, or JavaScript needed. `launch(share=True)` generates a public `*.gradio.live` link (good for ~72 hours) so you can send a friend or screen-record for LinkedIn, turning a local script into a demo people can try instantly.

## LLM Arena & Voting
An LLM arena sends one prompt to two models and lets you vote on the better answer, often as a blind side-by-side "taste test" with model identities hidden. These millions of human votes on anonymous model pairs are how the AI world ranks which model is actually best beyond marketing claims — and companies use the same technique internally to decide which model to ship. The Class 1 mini-project builds a tiny version using both an OpenAI and a Groq/Llama model.

## LangChain (preview)
LangChain is a framework for bigger apps that adds reusable prompt templates, multi-step pipelines (chains joined with the `|` operator), memory, and connectors on top of raw API calls, so you don't reinvent the same plumbing. A taste: `prompt | model` sends the prompt into the model, and the chain can be reused for any input — the same idea as a raw call, just with handy connectors.

## RAG (preview)
RAG is "chat with your own PDFs/data": you retrieve the relevant snippets from your documents and paste them into the prompt so the AI answers *from* your data, not just its training memory. It's the most common real-world pattern and it tames hallucinations by grounding answers in real text.

## Agents (preview)
An agent is an LLM given tools (a calculator, web search, your database) plus a loop: it thinks, acts, looks at the result, and repeats until done. The leap is autonomy — nobody hard-codes "check the weather"; the agent *decides* to, because you gave it the tool and the goal. That decision is the jump from "chatbot" to "agent."

## Multi-Agent Systems (preview)
For bigger jobs, multi-agent systems do what companies do: split work across specialist agents (e.g., a content team of manager, researcher, writer, editor) that hand off to one another. Dividing responsibilities lets the group tackle larger, more complex problems than a single agent could handle alone.
