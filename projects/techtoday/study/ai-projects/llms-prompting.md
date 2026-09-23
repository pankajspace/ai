<!--
Source: llms-prompting.html
Title: LLMs & Prompting | TechToday
Theme-color: #0b0d10
Stylesheets: ai-study-theme.css, ../../site-header.css
Scripts: ai-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Projects](ai-projects.html)

Class 1 · Beginner Friendly · Build & Ship Today

<a id="llms-and-prompting"></a>

# By the end of *today*, you'll have shipped *two* AI apps.

No PhD. No math. No machine learning background. In one class you'll understand how AI *actually* works — and you'll build **two** real, shareable apps: an **AI Website Summarizer** and a mini **LLM Arena** — then post them on LinkedIn. Let's go.

🧠 How LLMs really work · 🪄 The "fill-in-the-blank" trick · 🛠️ Your first 6 lines of code · 🎛️ Two real Gradio apps · 🥊 Summarizer + LLM Arena · 📣 A LinkedIn post you're proud of

**The promise of Class 1**

You walk in curious. You walk out having **built and shared two working AI apps** — ahead of 99% of people who only *talk* about AI.

**Scaler Academy** — everything below is interactive. **Click the simulators** as we go.

<a id="table-of-contents"></a>

## Table of Contents

1. [The Plan for Today](#agenda)
2. [Why Now: The AI Inflection](#why)
3. [How LLMs Really Work](#llm)
4. [The Fill-in-the-Blank Trick](#magic)
5. [What You'll Build](#build)
6. [The AI Engineer Role](#aie)
7. [Connect to Models in Code](#connect)
8. [Build & Ship Your Apps](#project)
9. [Post Your Project](#linkedin)
10. [Where We Go Next](#next)

**⏱**

**The plan for today**

## Our flight plan

We climb gently — a "wow" at every step, then we build. Timings are a guide; the ★ moment is when *you* ship.

0:00

**Why AI exploded right now**

70 years of AI, compressed — and why one person can suddenly build this

0:15

**What an LLM really is**

Super-autocomplete, tokens & temperature — with live simulators

0:40

**The trick behind the magic**

Self-supervision: how AI taught itself from the whole internet

0:55

**What can you actually build?**

Foundation & multimodal models + the 8 use-case categories

1:10

**What is AI Engineering?**

You build the car, not the engine — where you fit

1:25

**Your first connection in code**

6 lines of Python that talk to an AI

1:45

**Project 1: AI Website Summarizer**

Build it, wrap it in Gradio, watch it work

2:05

**Project 2: Mini LLM Arena**

One prompt, two models, 👍/👎 voting — like arena.ai

2:20

**Publish to LinkedIn**

Screenshot, caption template, post — today

2:30

**A peek ahead: Agents**

Where this course is going — AIs that take action

**1**

**Block 1 · ~15 min · the hook**

## Why is AI suddenly *everywhere*?

AI is not new — it's **70 years old**. So why did it explode in *your* feed only recently? Two things changed, and they changed everything about what *you* can build.

1950s–2000s

**AI is a research lab thing**

Decades of slow progress. You needed a PhD, a university, and years to do anything useful.

2017

**The "Transformer" is invented**

A new model design that learns language astonishingly well. This is the engine inside GPT, Claude, Gemini.

Nov 2022

**ChatGPT launches**

The fastest-adopted product in history. Suddenly everyone can *talk* to AI.

Now → you

**Anyone can build on top of it**

The hardest part is done by giant labs. You just *call* their AI with a few lines of code. That's this class.

🤯

**The wow that defines our era**

Something that used to need **a team + 6 months + a data warehouse** can now be built by **one person in an afternoon** with an internet connection. That collapse in cost is why "AI Engineer" is one of the fastest-growing jobs on the planet — and why you're in the right room.

### The two big shifts

> **Analogy**
>
> 🌐
>
> **1. The model is general-purpose**
>
> Old AI did *one* task (spam-or-not). Today's AI does *thousands* — write, summarise, translate, code, answer — all from the same model. One brain, endless uses.

> **Analogy**
>
> 🚪
>
> **2. The barrier to entry collapsed**
>
> You don't build the AI. You *use* it through a simple API — like ordering food through an app instead of running a kitchen. If you can call a function, you can build with AI.

> **Note**
>
> 🎙️
>
> **Speaker note**
>
> Make this personal: ask the room "what took you forever last week that an AI could've drafted in 30 seconds?" Everyone has an answer. *That* gap is the opportunity we're learning to fill.

**2**

**Block 2 · ~25 min**

## What is an LLM, *really?*

LLM = **Large Language Model**. Strip the hype and it does exactly one thing, unbelievably well: **it predicts the next chunk of text.** Everything — chat, code, summaries — is built on that single trick.

> **Analogy**
>
> ⌨️
>
> **The "super-autocomplete" mental model**
>
> Your phone suggests the next word as you type. An LLM is that idea scaled up *a billion times* and trained on much of the internet — so its guesses are good enough to write essays, code and answers.

### First: words become *tokens*

A model doesn't read letters or words — it reads **tokens** (pieces roughly ¾ of a word). It thinks in tokens and you pay per token, so let's *see* them. Type anything:

**Live sim — Tokenizer playground type → watch it split into tokens**

Your text AI Engineering is surprisingly approachable!

**0** — Tokens

**0** — Characters

**$0** — Cost @ $5/1M tok

Notice: common words = 1 token; rare/long words get chopped into pieces. **Rough rule: 1 token ≈ ¾ of a word ≈ 4 characters.**

#### But why *tokens* — why not just whole words, or single letters?

This is a clever engineering trade-off. The model needs a fixed list of "things it knows" (its **vocabulary**). Words and letters both fail at the extremes — tokens sit in the sweet spot:

❌ One token per word

There are *millions* of words across all languages, plus names, typos, slang & new words daily. The vocabulary would be impossibly huge — and it would freeze the first time it met a word it had never seen.

❌ One token per letter

Only ~100 symbols — tiny vocabulary — but now every sentence is hundreds of tokens long. Slow, expensive, and the model has to relearn spelling from scratch every time.

✅ Tokens (sub-words)

A vocabulary of ~100k common chunks. Frequent words stay whole; anything rare is built from pieces. Best of both: compact *and* it can spell out *any* word it's never seen.

Concrete example — a word the model probably never saw in training still works fine, because it's assembled from familiar pieces:

how a rare word gets built

`"unbelievableness"` → unbelievableness

Four known tokens, zero panic. Meanwhile `"the"`, `"cat"`, `"is"` are each a single token. That's why **tokens were chosen**: they let one fixed vocabulary handle every word in every language — even ones invented tomorrow.

> **Note**
>
> 💡
>
> **Why you'll feel this as an engineer**
>
> English is "cheap" (≈¾ word per token). Code, emojis, and many non-English scripts use *more* tokens per character — so the same sentence in Hindi or Tamil can cost noticeably more tokens than in English. Worth knowing when you price an app.

### Then: it predicts the *next* token — over and over

Given the tokens so far, the model scores **every possible next token** with a probability, picks one, adds it, and repeats. That loop *is* "generating text".

> **Analogy**
>
> 🎲
>
> **Temperature = the creativity dial**
>
> **Low** → always pick the most likely word → focused & repeatable. **High** → sometimes pick surprising words → creative & varied. Drag the slider and watch the probabilities reshape:

**Live sim — Next-token & temperature prompt: "I love building things in ___"**

Temperature **0.7** balanced

*Control:* 🎲 Sample a token

> **Note**
>
> 💡
>
> **This is a real engineering choice**
>
> A support bot wants *temperature ≈ 0.2* (consistent). A brainstorming tool wants *≈ 1.0* (varied). You'll set this on day one of any real project — including today's.

### One more truth: the model has *no memory*

Between calls, an LLM forgets everything. Anything it should "know" in a conversation must be **re-sent every time**, inside a limited **context window** (measured in tokens). This one fact quietly explains a huge amount of AI engineering.

🔤

**Tokens, not words**

It reads, thinks & bills in tokens.

🎯

**Predicts next token**

All abilities emerge from this loop.

🌡️

**Temperature**

Low = focused, high = creative.

🪟

**No memory**

You resend context each time.

**3**

**Block 3 · ~15 min · the "aha"**

## The trick that made all of this *possible*

Here's the part that makes people go "ohhh". How do you teach a machine language without an army of humans labelling billions of examples? You let it **play fill-in-the-blank with the entire internet.**

> **Analogy**
>
> 📚
>
> **The old way (slow & expensive)**
>
> Humans hand-label data: "this email = spam", "this review = positive". Accurate, but you need millions of labelled examples. Painfully slow.

> **Analogy**
>
> 🪄
>
> **The clever shortcut: self-supervision**
>
> Take any sentence from the web, *hide a word*, and ask the model to guess it. The answer is **already in the text** — so the internet becomes its own teacher. No humans needed. Trillions of free practice questions.

Try being the model for a second — guess the hidden word:

The barista handed me a hot cup of ______.

Pick the word you think fills the blank.

🤯

**Why this changes everything**

You just did what the model does **billions of times**. To guess "coffee", it had to quietly learn grammar, context, what baristas do, what's hot, what fits in a cup… *Understanding emerges as a side-effect of getting really good at fill-in-the-blank.* That's the whole secret behind ChatGPT.

> **Note**
>
> ⚠️
>
> **Keep it honest (mention this)**
>
> Because it learned by predicting plausible text, an LLM can sometimes produce confident-sounding *wrong* answers — called **hallucinations**. A big part of our job as AI engineers is designing around that (e.g. feeding it real documents — we'll see that later). Trust, but verify.

**4**

**Block 4 · ~15 min**

## So… what can you actually *build?*

First, a quick upgrade to your mental model. Modern AI isn't just about text anymore — it can also see, hear and speak. We call these **foundation models**: one giant general-purpose brain you adapt to many jobs.

### Multimodal: models with more *senses*

📝 Text

🖼️ Images

🎤 Audio

🎬 Video

➜

🧠**Foundation
Model**

➜

💬 An answer

🖌️ An image

🔊 A voice

📊 A report

Show it a photo of your fridge → get a recipe. Speak to it → it talks back. Same idea as text, more senses.

### The 8 things people build with AI

Almost every AI product you've seen falls into one of these buckets. Find *your* idea here:

💻

**Coding**

Write, explain & fix code. The #1 use case today.

Copilot · Cursor

✍️

**Writing**

Emails, blogs, marketing copy, rewriting.

Jasper · Notion AI

🎨

**Image & Video**

Generate art, edit photos, make clips.

Midjourney

🎓

**Education**

Personal tutors that explain anything, your pace.

Khanmigo

💬

**Chatbots**

Support, sales & assistants that converse.

Intercom Fin

📥

**Info Aggregation**

Summarise & search across mountains of text.

★ today's project

🗂️

**Data Organization**

Tag, sort & structure messy information.

classification

⚙️

**Workflow / Agents**

AI that takes multi-step actions for you.

the frontier

🏭 Industry spotlight · same skill, different product

#### The pattern is always the same

A coding tool, a legal-doc reader, a Swiggy-order chatbot — under the hood they all do one thing: *connect to a model, give it the right context, get a useful answer, wrap it in a UI.* Learn that once (today) and every one of these 8 becomes buildable.

GitHub Copilot · Harvey · legal · Klarna · support · Khan Academy · tutoring · Perplexity · search

**Today we build a 📥 Info-Aggregation tool** — an AI Website Summarizer. Simple, genuinely useful, and very shareable.

**5**

**Block 5 · ~15 min**

## So where do *you* fit in?

One line: **AI Engineering is building real products on top of pre-trained models** (GPT, Claude, Gemini) — without training those models yourself.

The car analogy

A Machine Learning engineer **builds the engine**. An AI Engineer **builds the car around an engine someone else already built** — wiring it to your data, your users, your problem, so it actually ships. *You don't forge the engine. You drive.*

### Three roles, cleanly separated

> **Analogy**
>
> 🔧
>
> **ML / Data Scientist — builds the engine**
>
> Trains models from raw data. Cares about datasets, GPUs, accuracy. "How do I *create* a model?"

> **Analogy**
>
> 🚗
>
> **AI Engineer — builds the car ← you, today**
>
> Takes a powerful existing model and makes it a product. Cares about prompts, APIs, cost, reliability. "How do I *use* GPT to summarise 10,000 articles a day?"

> **Analogy**
>
> 🏗️
>
> **Software Engineer — builds the road**
>
> The app, the buttons, the database. The AI Engineer is increasingly a software engineer who also speaks fluent "model".

✨

**The good news**

The hardest, most expensive part — training the model — is **already done for you** by giant labs. You get to start at the fun part: turning that intelligence into something people use. **Python + an API key is genuinely enough to begin.**

**6**

**Block 6 · ~20 min**

## Your first 6 lines that talk to an AI

### Step 0 — Get set up (do this once, ~10 min)

Before any code runs, three quick bits of plumbing. Don't worry — it's a one-time setup.

#### ① Install a code editor — Cursor or VS Code

You need one editor to write and run code. Both are free and work identically for this course — pick whichever you like:

> **Analogy**
>
> 🆚
>
> **Cursor vs VS Code — which one?**
>
> **VS Code** is the world's most popular editor (by Microsoft) — rock-solid and widely used. **Cursor** is built *on top of* VS Code with an AI assistant baked in. If you want AI help while coding, pick Cursor; if you want the classic standard, pick VS Code. *Either is totally fine — you only need one.*

a

**Download & install**

**Cursor:** go to `cursor.com` → Download. **VS Code:** go to `code.visualstudio.com` → Download. Install like any normal app (Windows / Mac / Linux).

b

**Add the Python & Jupyter extensions**

Open your editor → click the *Extensions* icon on the left → search `Python` (by Microsoft) and `Jupyter` → Install both. (Same steps in Cursor and VS Code.)

c

**Open a notebook & pick the kernel**

Open a `.ipynb` file → click *Select Kernel* (top-right) → choose your Python environment. You run a cell with **Shift + Enter**.

#### ② Get your OpenAI API key

An API key is a secret password that lets your code use OpenAI's models (you pay only for what you use — cents for this class). Here's the flow, simulated — click through it:

🔑 OpenAI Platform platform.openai.com/api-keys

Sign in, add a little credit under *Billing*, then create a key:

*Control:* + Create new secret key

your key will appear here…

⚠️ Copy it now — OpenAI shows a secret key only once. And never share it or commit it to GitHub.

🔁 Prefer free? You can skip this entirely and use **Ollama** (runs on your laptop, no key, same code) — we'll cover it next class.

#### ③ Put the key in a `.env` file (never in your code)

Create a file literally named `.env` in your project folder, and paste your key inside. Your code reads it from there — so the secret never appears in the code you share.

.env

```
# .env  — keep this file private! Add it to .gitignore
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

load_key.py — read it in your code

```
# pip install python-dotenv
from dotenv import load_dotenv
load_dotenv()                 # loads everything from .env

# now OpenAI() finds the key automatically — no key in your code 🎉
```

> **Note**
>
> 🔐
>
> **The one habit that saves careers**
>
> Add `.env` to your `.gitignore` so it's never uploaded to GitHub. Leaked keys get found by bots in minutes and can run up real bills. Secrets live in `.env`, never in code.

### Now — the 6 lines that actually talk to the AI

With setup done, calling an LLM is just an **API call** — like fetching the weather, except the reply is intelligence. Here's the whole thing:

first_call.py

```
# pip install python-dotenv
from dotenv import load_dotenv
# pip install openai
from openai import OpenAI
load_dotenv()                 # loads everything from .env

client = OpenAI()   # reads your API key from the environment

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a witty travel guide."},
        {"role": "user",   "content": "Suggest one thing to do in Bangalore."},
    ],
)
print(response.choices[0].message.content)

# now OpenAI() finds the key automatically — no key in your code 🎉
```

### The 3 "roles" — the entire grammar of chat models

S

**system**

Sets the personality & rules — "You are a careful tutor. Never give the full answer." Written once, applies throughout.

U

**user**

What the human asks. The actual request.

A

**assistant**

The model's reply. To continue a chat, append it back and resend the whole list (remember: no memory!).

**Live sim — Anatomy of one API round-trip press send → watch it travel**

🧑‍💻

**Your app**

➜

🧠

**LLM model**

*Control:* 📤 Send the request

> **Note**
>
> 🔐
>
> **Golden rule**
>
> Never paste your API key into shared/public code — it's a password to your wallet. Keep it in a `.env` file or environment variable, on the server side only.

🏭 Industry spotlight · the model is swappable

#### Same code, different brains

Change one string — `"gpt-4o-mini"` → a Claude or open-source model — and your whole product runs on a different engine. There's even a **free, runs-on-your-laptop** option (Ollama) that uses this exact same code, just pointed at a local address. We'll meet it soon.

OpenAI · GPT · Anthropic · Claude · Google · Gemini · Groq · Llama (free & fast) · Ollama · free & local

### Bonus: the *same* code on a free, blazing-fast model (Groq + Llama)

Don't want to add billing yet? **Groq** gives you a free API key and runs open models like Meta's **Llama** incredibly fast. Because Groq speaks the same "language" as OpenAI, you change just *two things* — the key and one line — and everything else stays identical:

groq_call.py

```
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

where to get the key

Sign up free at `console.groq.com` → *API Keys* → Create key, then add it to your `.env` as `GROQ_API_KEY=gsk_...`. **Notice how little changed** — just the key, the `base_url`, and the model name. The whole point of AI Engineering: the brain is swappable.

**7**

**Block 7 · ~30 min · 🏁 THE BUILD**

## Mini-Project: AI Website Summarizer

Time to build. Our app: **give it any web page URL → it reads the page and hands you a clean summary.** The Reader's Digest of the internet. It's simple, genuinely useful, and exactly the kind of thing that makes a great first LinkedIn post.

### How it works — the whole app in one picture

🔗

**URL** — user pastes it

➜

🕷️

**Scrape** — grab page text

➜

🧩

**Prompt** — text + instructions

➜

🧠

**LLM** — summarise

➜

📄

**Summary** — shown in UI

Five boxes. That's a real AI product. Let's write each piece.

### Step 1 — Grab the page text (the "scraper")

> **Note**
>
> 📦
>
> **Treat this one as a black box**
>
> You do **not** need to understand a single line below. This is plain web-scraping (not AI), and there's a library for it. All it does: *take a URL → return the page's readable text as a string.* That's it. Copy it, trust it, move on — the AI magic is in Step 2.

scraper.py

```
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

### Step 2 — The brain (prompt + LLM call)

summarizer.py

```
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

> **Note**
>
> 🪄
>
> **The "wow" lever — change the personality**
>
> Edit one line of the `system_prompt` — "give a *snarky, humorous* summary" or "explain it to a 10-year-old" or "respond in Hindi" — and the whole app behaves differently. **That's prompt engineering, and you just learned it.** Try the personality buttons in the live demo below 👇

### Step 3 — The face (Gradio = a web app in 4 lines)

Nobody will run your Python script. **Gradio turns your function into a shareable web app** — no HTML, no CSS, no JavaScript:

app.py

```
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

### Step 4 — Run it on your machine 👇

Save the three files (`scraper.py`, `summarizer.py`, `app.py`) and your `.env` in one folder. Then open the terminal in Cursor (*Terminal → New Terminal*) and run:

bash — your project folder

```
# 1. install everything you need (one time)
$ pip install openai gradio requests beautifulsoup4 python-dotenv

# 2. launch the app
$ python app.py

# 3. Gradio prints two links:
Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://a1b2c3.gradio.live   # ← share this!
```

**Open the local link**

Click `http://127.0.0.1:7860` — your app opens in the browser. This is your app running on *your* computer.

**Paste a URL and hit submit**

Try a blog or news site. In a second or two, the summary appears. 🎉 You just used your own AI app.

**Share the public link**

The `*.gradio.live` link works for anyone for ~72 hours — perfect to send a friend or screen-record for LinkedIn. (For a permanent home, deploy free to Hugging Face Spaces — a one-class topic for later.)

**Stop it anytime**

Press `Ctrl + C` in the terminal to shut the app down.

🐞 If you hit an error, 90% of the time it's a missing `pip install` or a key not loaded from `.env` — check those two first.

### Try the working version right here

Below is a **live, in-browser version** of exactly that app. Pick a sample site (or paste your own text), choose a personality, and hit summarize:

🔎 **AI Website Summarizer** live demo

Pick a sample "website"

…or paste any article text Personality (the system prompt)

*Control:* ✨ Summarize

Summary

Your summary will appear here…

⚙️ This demo summarizes *in your browser* (a simple method) so it runs with no API key. Your real `app.py` sends the text to GPT for a smarter summary — but the shape, the flow, and the personality switch are exactly what you see here.

🏭 Industry spotlight · you just built a real product category

#### Summarization quietly runs the business world

Summarizing news, earnings calls, support threads, legal contracts, research papers, meeting transcripts — it's one of the most-used AI features in companies today. Swap "website" for "PDF", "email thread", or "YouTube transcript" and you've got a dozen more apps from the same code.

News digests · Earnings-call summaries · Meeting notes · Contract review · Research papers

### 🥊 Bonus build: an *LLM Arena* (one prompt, two models, you judge)

Here's a second mini-project that's even more fun to post. Inspired by **arena.ai**, where people send one prompt to two AIs and *vote* on the better answer — that's literally how the world ranks AI models. You can build a tiny version with what you already know: **send the same prompt to two models, show both answers side by side.**

arena.py — the whole idea

```
def battle(prompt):
    msgs = [{"role": "user", "content": prompt}]

    # Model A — OpenAI's GPT
    a = openai_client.chat.completions.create(model="gpt-4o-mini", messages=msgs)

    # Model B — Llama on Groq (same code, different brain!)
    b = groq_client.chat.completions.create(model="llama-3.3-70b-versatile", messages=msgs)

    return a.choices[0].message.content, b.choices[0].message.content
# …now we wrap this in Gradio with two columns + thumbs up/down 👇
```

#### The full Gradio app (with 👍 / 👎 voting, like arena)

arena_app.py

```
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

#### Run it (same as before)

bash — your project folder

```
# install once, then launch
$ pip install openai gradio python-dotenv
$ python arena_app.py

Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://abcd12.gradio.live   # ← share this on LinkedIn!
```

**Open the local link & type a prompt**

Click `http://127.0.0.1:7860`, type any question, and hit *Battle!*

**Read both answers, then vote 👍 / 👎**

Give a thumbs up or down to each model's answer — just like on arena.ai.

**Screen-record & share the public link**

The `*.gradio.live` link works for ~72 hrs — perfect for your LinkedIn clip. Stop anytime with `Ctrl + C`.

> **Note**
>
> 💡
>
> **Why this is a brilliant first project**
>
> It uses *both* keys you set up (OpenAI + Groq), proves the "brain is swappable" idea live, and the side-by-side 👍/👎 format is genuinely eye-catching on LinkedIn. Try the working version below 👇

🥊 **Mini LLM Arena** live demo

Ask both models the same thing Explain recursion to a total beginner, in 2 sentences.

Or try:

*Control:* ⚔️ Battle!

Model A

*Control:* 👍 Good

*Control:* 👎 Bad

VS

Model B

*Control:* 👍 Good

*Control:* 👎 Bad

**0** — GPT-4o-mini score

**0** — Llama-3.3 score

⚙️ Responses here are simulated in your browser so it runs key-free. In your real `arena.py`, the two answers come from the actual models — and the voting is exactly how arena.ai builds its public leaderboard.

🏭 Industry spotlight · this is how models get ranked

#### Voting is serious science

Side-by-side "blind taste tests" like this — millions of human votes on anonymous model pairs — are how the AI world decides which model is actually best, beyond marketing claims. Companies use the same technique internally to choose which model to ship. Your toy arena is a real evaluation method in miniature.

Blind A/B votes · Public leaderboards · Model selection · arena.ai

**8**

**Block 8 · ~15 min · 📣 ship it**

## Now put it on LinkedIn — *today*

A project nobody sees doesn't build your name. The single highest-leverage thing you can do as a beginner is **build small & share loudly.** Let's get your summarizer out the door.

### The 3-step ship checklist

1

**Record a 15-second screen capture**

Show yourself pasting a URL and the summary appearing. A short video out-performs a screenshot. (Even a screenshot is great.)

2

**Write the caption**

Use the template below. Keep it human: what you built, what surprised you, and the lines of code it took.

3

**Post it & tag #AIEngineering**

Add 3–4 tags. Reply to every comment in the first hour — that's how the algorithm rewards you.

### Steal this caption (fill in the blanks)

You

Your Name

Aspiring AI Engineer · now · 🌐

🚀 I just built & shipped my very first AI app — on Day 1. Give it any website URL and it hands you a clean summary in seconds. The "Reader's Digest of the internet." ✨ The mind-blowing part? It's basically just: 🕷️ grab the page text 🧠 ask an LLM to summarise it 🎛️ wrap it in a tiny Gradio web app A few weeks ago I assumed this needed a PhD and months of study. Turns out it needs curiosity, an afternoon, and the right guide. And that's the real unlock here: I'm learning straight from @Shivank Agrawal — an industry expert who's not just teaching theory, but building real AI systems every single day and showing us exactly how it's done. 🙌 This is Day 1 of my AI Engineering journey with @Scaler, and I am ALL in. 👉 What should I point my summarizer at next? Drop a URL below. #AIEngineering #LLM #Python #BuildInPublic #100DaysOfCode

👍 You and others · 💬 Comments · ↗ Repost

👉 When you type "@Shivank Agrawal", LinkedIn will suggest the profile — pick [linkedin.com/in/shivankagrawal](https://www.linkedin.com/in/shivankagrawal/) so the tag links correctly. Tagging your instructor & Scaler boosts reach and lets us reshare your win.

> **Note**
>
> 🎙️
>
> **Speaker note — make it a class ritual**
>
> Give everyone 10 minutes *in class* to post. Then collect links and have people like & comment on each other's. Momentum is everything for a beginner — the first post is the hardest, so we do it together.

### Want a different flavour? Make it *yours*

Same 3-step recipe (input → prompt → Gradio), different idea. Pick whichever feels fun — all are beginner-simple:

✉️

**Email Subject Liner**

Paste an email → get 5 catchy subject lines.

📄

**CV → Cover Letter**

Paste your CV + a job ad → a tailored draft.

🏢

**Company Brochure**

Give a company site → a fun marketing brochure.

📺

**YouTube Summarizer**

Paste a transcript → the key takeaways.

🍳

**Recipe Formatter**

Messy recipe text → clean steps & a shopping list.

✈️

**Travel Planner**

"3 days in Goa" → a day-by-day itinerary.

💡 These are drawn from real beginner projects in your course's community folder — proof that "simple + shipped" beats "complex + someday".

**9**

**Block 9 · ~15 min · the exciting part**

## A peek at where this is *going*

You've built an app that *answers*. The rest of this journey is about apps that **do**. Here's a taste of three things coming up — no need to master them today, just get excited.

### 🔗 LangChain — the toolkit for bigger apps

Right now you call the API by hand. The moment you want **reusable prompts, multi-step pipelines, memory, or to plug in your own documents**, a framework like **LangChain** saves you re-inventing the wheel. Same idea as today — just with handy connectors:

langchain_taste.py

```
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Summarize this website: {content}")
model  = ChatOpenAI(model="gpt-4o-mini")

chain = prompt | model            # "|" = send the prompt INTO the model
chain.invoke({"content": website_text})   # reuse it for any page!
```

> **Analogy**
>
> 📚
>
> **The one to remember: RAG**
>
> "Chat with your own PDFs." You *retrieve* the relevant snippets from your documents and paste them into the prompt — so the AI answers from *your* data, not just its memory. It's the most common real-world pattern, and it tames hallucinations.

### 🤖 Agents — when the AI can take *action*

An **agent** is an LLM given **tools** (a calculator, web search, your database) and a **loop**: it thinks, acts, looks at the result, and repeats until done. Step through one:

**Live sim — ReAct agent · step-through "Should I carry an umbrella in Bangalore today?"**

*Control:* ▶ Next step

*Control:* ↺ Reset

> **Note**
>
> 💡
>
> **The leap**
>
> Nobody hard-coded "check the weather" — the agent *decided* to, because we gave it the tool and the goal. That autonomy is the jump from "chatbot" to "agent".

### 👥 Multi-Agent — a *team* of AIs

For bigger jobs, we do what companies do: split work across specialists that hand off to each other. Press run and watch a content team write a LinkedIn post:

**Live sim — Multi-agent content team goal: "Write a LinkedIn post on AI agents"**

*Control:* ▶ Run the team

*Control:* ↺ Reset

🚀

**Where this course ends**

By the end of the journey, you'll build a solution where **several agents collaborate** to solve a real business problem — the kind of thing companies are hiring for right now. But it all rests on what you did today: *connect to a model, give it context, get something useful, ship it.*

🧠

**LLMs**

Predict next token; tokens, temperature, context.

🪄

**Self-supervision**

Learned the internet via fill-in-the-blank.

🔌

**API call**

system / user / assistant.

🎛️

**You shipped**

A real Gradio app — and posted it. 🎉
