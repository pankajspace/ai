[<- README](../../README.md) | [Notes](ai-infused-learning-2.html)

# AI Infused Learning - 2

# Links
1. [Class 2 Notes](https://scaler-content.github.io/class-2-AI-engg/)

# My Notes

## 0. Where This Class Fits
Class 1 = you *talked* to a model. Class 2 = you give it **hands**. Everything today is the *same OpenAI call* you already know, just organised more cleverly: first LangChain (reusable plumbing), then a real **agent** that decides on its own when to use a tool.

## 1. Three Ways to Steer a Model
The entire field of AI engineering boils down to three ways of steering a pre-trained model:

1. **✍️ Prompting** — just *tell* it clearly. Free, instant, no training. **~90% of real work lives here** — including everything today.
2. **📚 RAG** — hand it *your* documents at question-time so it answers from real data. (A coming class.)
3. **🎓 Fine-tuning** — actually re-train on examples. Powerful, costly, rarely needed. Reach for it last.

Chains, tools, and agents are all still "option 1, organised cleverly" — nothing new to fear.

## 2. LangChain — the Pre-Built Plumbing
In Class 1 you called the API by hand — fine for one call. The moment you want **reusable prompts, multi-step pipelines, and memory**, you'd be rebuilding the same wiring forever. **LangChain is that plumbing, pre-built.**

**One-line intuition:** the raw OpenAI call is a single Lego brick; LangChain is the box of connectors that snaps bricks into machines.

```bash
pip install langchain langchain-openai
```

### The 3 new words, in plain English
1. **`ChatPromptTemplate`** = *a prompt with blanks.* A normal prompt where some parts are left as `{blanks}` to fill in later — like a wedding-invite template ("Dear `{name}`, join us on `{date}`"): write once, reuse for every guest. It's called *Chat*PromptTemplate because it builds prompts in the same system/user/assistant chat format from Class 1. Say it as *"my reusable prompt."*
2. **`ChatOpenAI`** = *the model, in a LangChain wrapper.* The exact same GPT you called in Class 1 — just wrapped so it can snap onto other LangChain pieces. Same `model=`, same `temperature=`. Say it as *"the model."*
3. **`StrOutputParser`** = *unwraps the answer.* The model doesn't return plain text — it returns a *package* called an `AIMessage` (text + bookkeeping metadata like `tokens_used`, `model`, `finish_reason`). This piece opens the package and hands back just the string. Without it you'd write `response.content` by hand every time (in Class 1 it was the mouthful `response.choices[0].message.content`). Say it as *"give me just the text."*

### Chains — the pipe operator `|`
A chain is the three pieces joined by `|` (read it as **"then"**): prompt *then* model *then* parser. Data flows left → right.

```python
# summarizer_langchain.py
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from scraper import fetch_website_contents # reuse Class 1's scraper
load_dotenv()

prompt = ChatPromptTemplate.from_template("Give a short, friendly summary of this website:\n\n{website}") # ①

model  = ChatOpenAI(model="gpt-4o-mini", temperature=0.3) # ②

parser = StrOutputParser() # ③

chain = prompt | model | parser # ④

def summarize(url):
    return chain.invoke({"website": fetch_website_contents(url)}) # ⑤

print(summarize("https://anthropic.com"))
```

Line by line:

1. `from_template(...)` turns text into a **reusable prompt**; `{website}` is the blank, filled later.
2. The **same model from Class 1**, wrapped for LangChain. `temperature=0.3` = mostly focused (summaries shouldn't be wildly creative).
3. The **package-opener**: takes the model's `AIMessage`, hands back plain text.
4. The pipe `|` means **"then"**: "the prompt, then the model, then the parser." Data flows left → right.
5. `invoke` means **"run it."** The dict `{"website": ...}` says which blank gets what — key `"website"` matches the `{website}` blank by name.

**The unlock:** `chain` is now a reusable building block. New task? Swap the template. Different model? Swap line ②. Hindi summaries? Add one word to the prompt. That composability is LangChain's entire point.

## 3. Memory — Why Models Forget & How LangChain Remembers
Class 1 truth: models forget everything between calls. The fix is simply to **re-send the old messages every time** — the model never magically remembers. LangChain gives that a tidy home with two new words:

1. **`HumanMessage` / `AIMessage`** = labelled chat bubbles ("the human said X", "the AI replied Y") — the same user/assistant roles from Class 1, as Python objects.
2. **`MessagesPlaceholder`** = a parking spot for history — a blank in your prompt that holds *a list of past messages* (not just one word). "Insert the whole conversation so far, right here."

```python
# memory_demo.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

# STEP 1: Prompt with placeholders
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly tutor."),     # ① personality, like Class 1
    MessagesPlaceholder("history"),              # ② past turns park here
    ("human", "{question}"),                     # ③ the new question
])

# STEP 2: Model - using the same model from Class 1, wrapped for LangChain
model = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)

# STEP 3: Chain - using the pipe (|) operator
chain = prompt | model

# STEP 4: Adding Memory / History - list of messages
history = [HumanMessage("My name is Aarav."), AIMessage("Hi Aarav!")]

# STEP 5: Invoke the chain with history and the new question
response = chain.invoke({"history": history, "question": "What's my name?"}).content

# STEP 6: Prints the final response.
print(response)
# → "Your name is Aarav."  ✅ it "remembered" — because WE re-sent the history
```

The model didn't magically remember — **we re-sent the old messages**, and the placeholder slotted them in. All "chatbot memory" everywhere is exactly this trick. (This `invoke` returns the *package*, which is why we wrote `.content`; add `| parser` to the chain and you wouldn't need it.)

## 4. Your First (Tiny) Agent
Everything so far *talks*. An **agent** is a model with a **tool** and the freedom to **decide when to use it**.

**Definition — agent = LLM + tool + loop:** the model thinks "do I need a tool here?" → if yes, calls it → reads the result → answers. Nobody hard-codes *when*. **That decision is the entire difference between a chatbot and an agent.**

**Why tools?** LLMs are great with language, terrible with facts they don't have — today's price, live stock, exact math. A tool lets the model *fetch truth* instead of guessing. Tools cure "confident but wrong."

We build the smallest agent possible — a shop assistant whose one skill is looking up real prices (shoes ₹799 · hat ₹399 · bag ₹1420 · shorts ₹1299 · pants ₹1699).

### Step 1 — the tool is just a Python function
```python
# agent.py · part 1
import json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# STEP 1: Initialize the OpenAI client
client = OpenAI()

# STEP 2: Define single tool
def get_price(item):
    PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}
    print(f"🔧 tool called: get_price({item})")     # so you SEE it happen
    return f"₹{PRICES.get(item.lower(), 'unknown')}"
```

`PRICES` is an ordinary dict standing in for a database; `.get(item, 'unknown')` means "look it up, and if it's not there say *unknown* instead of crashing." **Any function you can write can become an agent's tool.**

### Step 2 — describe the tool so the model knows it exists
The model can't see your Python. You hand it a **menu card** describing the tool, written as a dict:

```python
# agent.py · part 2
# STEP 3: Define tools menu for the model
tools = [{
    "type": "function",
    "function": {
        "name": "get_price",
        "description": "Get the price of a shop item the user asks about.",
        "parameters": {
            "type": "object",
            "properties": {"item": {"type": "string", "description": "the item name"}},
            "required": ["item"],
        },
    },
}]
```

The menu card's four facts:

1. **What kind of tool?** A function (the only kind you'll use for a long time — write this line as-is).
2. **Its name** — must exactly match your Python function's name, so it can be found when the model asks for it.
3. **When to use it** — written for the *model* to read. This sentence is literally how the model decides whether to call your tool.
4. **What inputs it needs** — one input called `item`, which is text (`"string"`) and is `required`.

**Non-obvious insight:** line ③ is **prompt engineering in disguise.** A vague description ("does stuff with items") makes the model misuse the tool; a clear one makes it behave. Your words steer the machine, even inside JSON.

### Step 3 — the loop: think → maybe call tool → answer
```python
# agent.py · part 3
# STEP 4: Create agent function
def agent(user_message):
    # Initialize messages
    messages = [{"role": "user", "content": user_message}]

    # Send message + tools menu
    response = client.chat.completions.create(model="gpt-4o-mini", messages=messages, tools=tools)
    msg = response.choices[0].message

    # STEP 5: Check if it asked for a tool
    if msg.tool_calls: # did it ask for a tool?

        # add the tool REQUEST first — required: every "tool" result must follow the assistant message that asked for it (matched by tool_call_id), or the API rejects the next call for context
        messages.append(msg)

        # STEP 6: Loop over tools
        for call in msg.tool_calls:
            # The model’s arguments arrive as a JSON string, e.g. '{"item": "shoes"}' — parse it into a Python dict so we can read args["item"]
            args = json.loads(call.function.arguments)

            # STEP 7: run the real Python function — the model never runs code itself, it *asks*, and your Python *does*
            result = get_price(args["item"])

            # Add the tool's result to the conversation
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

        # Create response for the agent with tool's result.
        response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)

        # Get the final answer.
        msg = response.choices[0].message

    # Return the final answer.
    return msg.content

# STEP 8: Print the final answer.
print(agent("How much are the shoes?")) # → tool fires → "₹799"
print(agent("Hi! What can you help with?")) # → no tool → just chats
```

The loop, step by step:

1. Send the user's message *plus the tools menu*. The model now knows a tool exists and may ask to use it.
2. `msg.tool_calls` = "did the model ask to run a tool?" If it did, this holds *which tool* and *with what input* — e.g. `get_price(item="shoes")`. If not, it's empty and we skip to the answer.
3. The request arrives as text, so `json.loads(...)` converts it into a Python dict — then **we** run the real function. The model never runs code itself; it *asks*, and your Python *does*.
4. We append the tool's result with `role: "tool"` (a third role, joining system/user/assistant!) paired with the `tool_call_id`, then send everything back so the model writes a friendly final answer using the real data.

**Watch the conversation grow** — the whole agent is just *a list of messages getting longer*:

1. **user** — `"How much are the shoes?"` (plus the tools menu on the side).
2. **assistant (tool request)** — `→ wants: get_price(item="shoes")`. The model doesn't answer yet; it asks to run the tool. This is what `msg.tool_calls` holds.
3. **tool** — `"₹799"`. Our Python runs `get_price("shoes")` and we append the result with the new role `"tool"`.
4. **assistant (final)** — `"The shoes are ₹799! Anything else? 🙂"`. Send the whole longer list back; the model writes a friendly answer using the real price. That's one full agent loop.

**`if msg.tool_calls` is the entire secret.** Give the model ten tools and it picks among them. This is exactly how Cursor, support bots, and every "AI agent" headline actually work — same pattern, bigger toolbox.

### 🎮 "Tool or No Tool?" — think like the agent
Will the model call the tool or answer directly?

1. "How much is the bag?" → **tool** — a price question needs real data → `get_price("bag")`.
2. "Hi! How are you today?" → **chat** — small talk, no facts needed.
3. "Is the hat cheaper than the shorts?" → **tool** — comparing prices needs the real numbers (calls it *twice*).
4. "What's the capital of France?" → **chat** — *trick one!* The model already knows this; the price tool can't help.
5. "I have ₹1500 — can I afford the pants?" → **tool** — must check the real price (₹1699) first, then "not quite!"

## 5. Mini-Project — Smart Shop Assistant
Take the same `agent()` and give it a face. Gradio has a ready-made **chat interface**, so this takes four lines:

```python
# app.py
import gradio as gr
from agent import agent # the function you just wrote

def chat(message, history): # ① Gradio fills these two in for you
    return agent(message)

gr.ChatInterface(fn=chat, title="🛍️ Smart Shop Assistant").launch(share=True)  # ②
```

1. Gradio's chat box calls your function for you, handing it the user's new `message` and the chat `history` (a list of past turns). We only need the message today; **homework hint:** pass `history` into the agent and it gains memory — the trick from the memory section.
2. `ChatInterface` = a ready-made chat UI (bubbles, input box, send button) around any function. `share=True` also gives a public link.

```bash
$ pip install openai gradio python-dotenv
$ python app.py

Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://shop-xyz.gradio.live # ← your shareable agent!
```

Ask a price question ("How much are the pants?") and watch the terminal print `🔧 tool called: get_price(pants)` — your agent used its tool. Then ask small talk ("What's your return policy?") and no tool fires. It's *deciding*, not following a script. That 15-second contrast is your LinkedIn clip.

**How real agents work:** add tools for your database, email and calendar and this becomes a real assistant — "find my order, refund it, email the customer." Every production agent (coding agents included) is this exact loop with a bigger toolbox.

## 6. A Peek Ahead
1. **More tools (homework)** — add `check_stock(item)` or `apply_discount(item)` and watch the agent pick the right one.
2. **RAG — chat with your own PDFs** — a model that answers from *your* documents.
3. **Multi-agent teams** — several agents handing work to each other, once one agent feels easy.


# Quick Review of Concepts

## LLM API Calls (recap)
In Class 1 you called an LLM using the OpenAI library with three message roles — `system`, `user`, `assistant` — kept your API key safe in a `.env` file, and shipped a Website Summarizer plus an LLM Arena. Everything in Class 2 is the *same* OpenAI call, just organised more cleverly.

## Three Ways to Steer a Model
The entire field of AI engineering boils down to three ways of steering a pre-trained model:
1. **prompting** (just tell it clearly — free, instant, no training),
2. **RAG** (hand it your own documents at question-time so it answers from real data),
3. **fine-tuning** (actually re-train on examples — powerful, costly, reach for it last).

Prompting handles roughly 90% of real work; chains, tools, and agents are all still "option 1, organised cleverly."

## LangChain
LangChain is a Python library that provides pre-built "plumbing" — reusable prompts, multi-step pipelines, and memory — so you don't rebuild the same wiring around raw OpenAI calls every time. The one-line intuition: a raw OpenAI call is a single Lego brick, and LangChain is the box of connectors that snaps bricks into machines. Install it with `pip install langchain langchain-openai`.

## ChatPromptTemplate
A `ChatPromptTemplate` is a reusable prompt with `{blanks}` you fill in later, much like a wedding-invite template ("Dear `{name}`, join us on `{date}`") — write once, reuse for every guest. It's called **ChatPromptTemplate** because it builds prompts in the same system/user/assistant chat format from Class 1. Create one with `.from_template(...)` for a single string or `.from_messages(...)` for multi-role conversations, then supply the values at run time.

## ChatOpenAI
`ChatOpenAI` is the exact same GPT model you called in Class 1, just wrapped so it can snap onto other LangChain pieces. It takes the familiar `model=` and `temperature=` parameters (e.g. `temperature=0.3` for mostly-focused summaries), so nothing about the model changes — only how it connects. Say it simply as "the model."

## StrOutputParser
The model doesn't return plain text — it returns a *package* called an `AIMessage` that bundles the text with bookkeeping metadata (token counts, model name, finish reason). `StrOutputParser` opens that package and hands back just the string ("Str" = string). Without it you'd write `response.content` by hand every time (in Class 1 it was the mouthful `response.choices[0].message.content`); the parser does it for you, forever. Say it as "give me just the text."

## Chains (the Pipe Operator `|`)
Joining a prompt, model, and parser with the pipe operator `|` (read aloud as "then") creates a **chain**: `prompt | model | parser` = "the prompt, then the model, then the parser." Data flows left-to-right through each stage, and `chain.invoke({...})` runs the whole pipeline in one step, with the dict keys matching the template's `{blanks}` by name. The payoff is composability: new task? swap the template; different model? swap one line; Hindi output? add a word to the prompt.

## Memory / MessagesPlaceholder
LLMs are stateless — they forget everything between calls — so "memory" is simply re-sending the past messages each time you make a new request; the model never magically remembers. `MessagesPlaceholder("history")` reserves a parking spot inside the prompt that holds a *list* of past messages (not just one word), and every chatbot's "memory" everywhere is exactly this trick.

## HumanMessage / AIMessage
`HumanMessage` and `AIMessage` are LangChain's Python objects for labelling chat turns — "the human said X", "the AI replied Y" — like labelled chat bubbles. They are the LangChain equivalents of the `user` and `assistant` roles from the raw API, giving conversation history a clear, typed structure to feed into a `MessagesPlaceholder`.

## Agents (LLM + Tool + Loop)
An agent is a model given a tool and the freedom to decide *when* to use it: it thinks "do I need a tool here?" → if yes, calls it → reads the result → answers. Nobody hard-codes when the tool fires, and that decision is the entire difference between a chatbot and an agent. Tools matter because LLMs are great with language but terrible with facts they don't have (today's price, live stock, exact math) — a tool lets the model *fetch truth* instead of guessing, curing "confident but wrong."

## Tools
Any Python function you can write can become a tool — even a one-liner that looks up a price in a dict. The model can't see your Python, so you hand it a "menu card" describing the tool as a dict with four facts: `type` (a function), `name` (must match your Python function), `description` (when to use it), and `parameters` (the inputs it needs and their types). The function stays ordinary Python; the menu card is what the model reads.

## Tool Description as Prompt Engineering
The `description` field is written for the *model* to read and is literally how it decides whether to call your tool — so it's prompt engineering in disguise. A vague description ("does stuff with items") leads the model to misuse the tool, while a clear one ("Get the price of a shop item the user asks about") makes it behave. Your words steer the machine, even inside JSON.

## The Agent Loop
The agent loop: send the user message plus the tools menu → the model replies, possibly requesting a tool via `msg.tool_calls` (which holds *which* tool and *what* arguments, e.g. `get_price(item="shoes")`) → you `json.loads` its request and run the real Python function → append the result with `role: "tool"` → send everything back → the model writes a friendly final answer using the real data. Crucially, the model never runs code itself — it *asks*, and your Python *does*. The whole agent is really just a list of messages getting longer, and `if msg.tool_calls` is the entire secret.

## The `tool` Role
The `tool` role is a third role joining `system`, `user`, and `assistant`, used to feed a tool's result back into the conversation (paired with the `tool_call_id` so the model knows which call it answers). Tagging results this way lets the model clearly distinguish real data returned by a function from its own text and incorporate it into the final answer.

## Gradio ChatInterface
`gr.ChatInterface(fn=chat)` is a ready-made chat UI — bubbles, input box, send button — that wraps any function into a working chatbot in about four lines. Gradio hands your function the new `message` and the `history` list automatically (passing `history` into your agent is how it gains memory), and `launch(share=True)` generates a public link, instantly turning a local agent into a shareable app.

## RAG (preview)
The next big build: a model that answers from *your* documents. You retrieve the relevant snippets from your PDFs/data and paste them into the prompt so the AI answers grounded in real text instead of guessing.

## Multi-Agent Systems (preview)
Several agents handing work to each other — once one agent feels easy, you split bigger tasks across specialist agents that collaborate, the same way a company divides roles.
