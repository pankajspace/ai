[<- README](../../README.md) | [Notes](ai_engineering_class1.html)

# AI Infused Learning - 1

# Links
1. [Class 1 Notes](https://22f1001418.github.io/AI-engg-scripts-SL/)

# My Notes

# Quick Review of Concepts

## Why AI Exploded Now
AI is roughly 70 years old, but for most of that time (1950s–2000s) it was a research-lab thing needing a PhD and years of work. Two shifts changed everything: the **2017 Transformer** architecture (the "engine" inside GPT, Claude, and Gemini) and the **November 2022** launch of ChatGPT, the fastest-adopted product in history. That produced two big changes — the model became *general-purpose* (one brain doing thousands of tasks instead of one), and the *barrier to entry collapsed* (you use AI through a simple API, like ordering food through an app instead of running a kitchen). The upshot: something that once needed a team, six months, and a data warehouse can now be built by one person in an afternoon.

## LLM (Large Language Model)
At its core an LLM is "super-autocomplete" — the same next-word suggestion your phone makes, scaled up a billion times and trained on much of the internet. It predicts the next chunk of text given everything before it, and every visible ability (chat, coding, summarizing, translation) emerges from that single next-token trick rather than from separately programmed features.

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
Because the model learned by predicting *plausible* text rather than looking up facts, it can produce confident-sounding but wrong answers. Designing around this — for example by feeding the model real documents — is a big part of the AI engineer's job: trust, but verify.

## Foundation Models
Foundation models are large, broadly pre-trained, general-purpose models trained on diverse data — one giant general-purpose brain you adapt to many jobs. They learn reusable patterns that can be adapted to many downstream tasks through prompting or fine-tuning, rather than being built for one narrow task like old "spam-or-not" classifiers.

## Multimodal Models
Multimodal models understand, combine, and sometimes generate more than one type of data — text, images, audio, or video — reasoning across formats within a single system. Practically, that means showing it a photo of your fridge to get a recipe, or speaking to it and having it talk back: same idea as text, just more senses.

## 8 AI Use Cases
Almost every AI product falls into one of eight buckets: coding (the #1 use case — Copilot, Cursor), writing (Jasper, Notion AI), image/video generation (Midjourney), education (Khanmigo), chatbots (Intercom Fin), information aggregation (summarizers/search), data organization (tagging, classification), and workflow/agents (the frontier). Under the hood they all follow the same pattern — connect to a model, give it the right context, get a useful answer, wrap it in a UI.

## AI Engineering
AI Engineering is building real products on top of pre-trained models (GPT, Claude, Gemini) without training those models yourself — "you build the car around an engine someone else already built." It sits between the ML engineer/data scientist (who builds the engine, caring about datasets, GPUs, accuracy) and the software engineer (who builds the road — the app, buttons, database). The hardest, most expensive part — training the model — is already done, so Python plus an API key is genuinely enough to begin.

## API Call & Roles
Calling an LLM uses three message roles, the entire grammar of chat models: `system` (sets personality and rules, written once and applied throughout), `user` (the human's actual request), and `assistant` (the model's reply). To continue a chat you append the assistant's reply back and resend the whole list, since the model has no memory.

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
An LLM arena sends one prompt to two models and lets you vote on the better answer, often as a blind side-by-side "taste test" with model identities hidden. These millions of human votes on anonymous model pairs are how the AI world ranks which model is actually best beyond marketing claims — and companies use the same technique internally to decide which model to ship. The Class 1 mini-project builds a tiny version using both an OpenAI and a Groq/Llama model with 👍/👎 voting.

## LangChain
LangChain is a framework for bigger apps that adds reusable prompt templates, multi-step pipelines (chains joined with the `|` operator), memory, and connectors on top of raw API calls, so you don't reinvent the same plumbing. A taste: `prompt | model` sends the prompt into the model, and the chain can be reused for any input — the same idea as a raw call, just with handy connectors.

## RAG (Retrieval-Augmented Generation)
RAG is "chat with your own PDFs/data": you retrieve the relevant snippets from your documents and paste them into the prompt so the AI answers *from* your data, not just its training memory. It's the most common real-world pattern and it tames hallucinations by grounding answers in real text.

## Agents (ReAct)
An agent is an LLM given tools (a calculator, web search, your database) plus a loop: it thinks, acts, looks at the result, and repeats until done. The leap is autonomy — nobody hard-codes "check the weather"; the agent *decides* to, because you gave it the tool and the goal. That decision is the jump from "chatbot" to "agent."

## Multi-Agent Systems
For bigger jobs, multi-agent systems do what companies do: split work across specialist agents (e.g., a content team of manager, researcher, writer, editor) that hand off to one another. Dividing responsibilities lets the group tackle larger, more complex problems than a single agent could handle alone.
