<!--
Source: langchain-agents.html
Title: LangChain & Agents | TechToday
Theme-color: #0b0d10
Stylesheets: ai-study-theme.css, ../../site-header.css
Scripts: ai-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Projects](ai-projects.html)

Class 2 · 100% Hands-On · Build Your First Agent

<a id="langchain-agents"></a>

# Today your AI stops talking and starts *doing*.

Class 1: you talked to a model. Class 2: you give it **hands**. You'll meet LangChain, snap your first chain together, then build an **agent that decides — on its own — when to use a tool.** Watch it happen live on the right. 👉

🧭 3 ways to steer a model · 🔗 LangChain, hands-on · 🤖 A real tool-using agent · 🎮 "Tool or No Tool?" game · 📣 Ship agent #1 today

**Scaler Academy** — type along. Every code block has 📋 Copy; every demo is clickable.

🛍️ Smart Shop Assistant live

<a id="table-of-contents"></a>

## Table of Contents

1. [10-Second Recap](#recap)
2. [The Plan for Today](#agenda)
3. [3 Ways to Steer a Model](#adapt)
4. [LangChain Fundamentals](#langchain)
5. [Your First Tool-Using Agent](#agent)
6. [Hands-On Project](#project)
7. [Ship It to LinkedIn](#linkedin)
8. [What's Next](#next)

**↺**

**10-second recap**

## You already did the hard part

Called an LLM with the OpenAI library · system / user / assistant messages · Key safely in `.env` · Shipped a Summarizer + an LLM Arena

> **Note**
>
> 🛠️
>
> **Today's deal — minimal slides, maximum doing**
>
> Everything today is the *same OpenAI call you already know*, organised more cleverly. Keep your Class 1 folder open; we build directly on top of it.

**⏱**

**Plan for today**

## Our Class 2 flight plan

0:00

**Recap + 3 ways to steer a model**

Warm-up, prompting vs RAG vs fine-tuning

0:15

**LangChain: the new words, in plain English**

Template · model · parser — what each one IS, before any code

0:35

**Build your first chain**

Snap-it-together builder, then the real code, line by line

1:00

**Memory**

Why models forget & how LangChain remembers — decoded

1:10

**Your first tiny agent**

One tool, line by line, + watch the message list grow

1:40

**🎮 "Tool or No Tool?" game**

Prove you can think like the agent

1:50

**Project: Smart Shop Assistant**

Chat UI + public link

2:15

**Ship it to LinkedIn**

Caption + post — today 🎉

2:25

**Wrap & what's next**

Homework + the road ahead (ends ~2:30)

**9**

**Block 9 · ~5 min · the map**

## 3 ways to make a model do *what you want*

Before we build: the entire field of AI engineering boils down to **three** ways of steering a pre-trained model. You'll live in the first, visit the second soon, and almost never need the third.

✍️

**1. Prompting**

Just *tell* it clearly. Free, instant, no training. **90% of real work lives here** — including everything today.

📚

**2. RAG**

Hand it *your* documents at question-time so it answers from real data. A coming class.

🎓

**3. Fine-tuning**

Actually re-train on examples. Powerful, costly, rarely needed. Reach for it last.

> **Note**
>
> 🧭
>
> **Why this matters today**
>
> Chains, tools, agents — it's all still **option 1, organised cleverly**. Nothing new to fear. Let's build.

**10**

**Block 10 · ~35 min · hands-on**

## LangChain: snap it together

In Class 1 you called the API by hand — perfect for one call. The moment you want **reusable prompts, multi-step pipelines, and memory**, you'd be rebuilding the same plumbing forever. **LangChain is that plumbing, pre-built.**

> **Analogy**
>
> 🧰
>
> **One-line intuition**
>
> The raw OpenAI call is a Lego brick. LangChain is the box of connectors that snaps bricks into machines.

#### Install it

bash

```
$ pip install langchain langchain-openai
```

### First: the 3 new words, in plain English

LangChain code uses three names that look scary. They aren't. Read these *before* we touch code — each one is a thing you already understand:

ChatPromptTemplate**= a prompt with blanks**

A normal prompt where some parts are left as `{blanks}` to fill in later. Like a wedding-invite template: "Dear `{name}`, join us on `{date}`". Write once, reuse for every guest.

say it as: "my reusable prompt"

ChatOpenAI**= the model, in a LangChain wrapper**

The exact same GPT you called in Class 1 — just wrapped so it can snap onto other LangChain pieces. Same `model=`, same `temperature=`.

say it as: "the model"

StrOutputParser**= unwraps the answer**

The model doesn't return plain text — it returns a *package* (text + metadata like token counts). This piece opens the package and hands you just the string. ("Str" = string, i.e. plain text.)

say it as: "give me just the text"

> **Analogy**
>
> 🗣️
>
> **Why is it called "Chat"PromptTemplate?**
>
> Because it builds prompts in the **chat format you already know** from Class 1 — system / user / assistant messages. Same grammar, now reusable.

### Feel a template (before coding one)

This is all a template is — blanks you fill. Pick values and watch the final prompt assemble. The dict you pass to LangChain (`{"tone": "witty", ...}`) is just "here's what goes in each blank":

Template: Write a {tone} {length} post about {topic}

tone

length

topic

### What does the model actually return? (the parser's job)

Here's the bit nobody explains. When the model replies, you don't get plain text — you get a **package called an `AIMessage`** with the text inside it, plus bookkeeping. Press the button to see the package, and what the parser does to it:

**Live sim — Open the package why StrOutputParser exists**

AIMessage ← the package

content: "Anthropic builds safe AI…"

tokens_used: 213

model: "gpt-4o-mini"

finish_reason: "stop"

➜ 🧹 parser ➜

"Anthropic builds safe AI…"
just the text. ready to print, show in Gradio, or save.

*Control:* 📦 Ask the model → open the package

Without the parser you'd write `response.content` by hand every time (in Class 1 it was `response.choices[0].message.content` — remember that mouthful?). The parser does it for you, forever.

### Now build the chain — literally

A chain is the three pieces joined by `|` (the pipe — read it as **"then"**): prompt *then* model *then* parser. Click the pieces in the right order, then run data through:

**Live sim — Chain builder click pieces in order, then run**

your chain assembles here… (hint: what comes first?)

*Control:* ▶ Run the chain

*Control:* ↺ reset

### The same chain, in real code — decoded line by line

Rebuilding your Class 1 summarizer the LangChain way. The numbered comments match the decoder below — nothing here is mystery code:

summarizer_langchain.py

```
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from scraper import fetch_website_contents   # reuse Class 1's scraper
load_dotenv()

prompt = ChatPromptTemplate.from_template(            # ①
    "Give a short, friendly summary of this website:\n\n{website}")

model  = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)   # ②

parser = StrOutputParser()                             # ③

chain = prompt | model | parser                        # ④

def summarize(url):
    return chain.invoke({"website": fetch_website_contents(url)})   # ⑤

print(summarize("https://anthropic.com"))
```

🔍 decoder — what each numbered line does

①

`from_template(...)` turns my text into a **reusable prompt**. The `{website}` part is the blank — it will be filled in later, just like the playground above.

②

The **same model from Class 1**, wrapped for LangChain. `temperature=0.3` = mostly focused (summaries shouldn't be wildly creative).

③

The **package-opener** you just saw in the animation: takes the model's `AIMessage` package, hands back plain text.

④

The pipe `|` means **"then"**. Read aloud: "the prompt, *then* the model, *then* the parser." Data flows left → right, exactly like the builder.

⑤

`invoke` means **"run it"**. The dict `{"website": ...}` says which blank gets what — the key `"website"` matches the `{website}` blank by name.

✨

**The unlock**

`chain` is now a **reusable building block**. New task? Swap the template. Different model? Swap line ②. Hindi summaries? Add one word to the prompt. That composability is LangChain's entire point.

### Bonus piece — Memory (decoded too)

Class 1 truth: models forget everything between calls. The fix is simple — **re-send the old messages every time**. LangChain gives that a tidy home. Two tiny new words first:

HumanMessage / AIMessage**= labelled chat bubbles**

Just a way to store "the human said X" and "the AI replied Y" — the same user/assistant roles from Class 1, as Python objects.

MessagesPlaceholder**= a parking spot for history**

A blank in your prompt that holds *a list of past messages* instead of one word. "Insert the whole conversation so far, right here."

memory_demo.py

```
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly tutor."),     # ① personality, like Class 1
    MessagesPlaceholder("history"),              # ② past turns park here
    ("human", "{question}"),                     # ③ the new question
])
chain = prompt | model

history = [HumanMessage("My name is Aarav."), AIMessage("Hi Aarav!")]
print(chain.invoke({"history": history, "question": "What's my name?"}).content)
# → "Your name is Aarav."  ✅ it "remembered" — because WE re-sent the history
```

> **Note**
>
> 💡
>
> **De-mystify this for them**
>
> The model didn't magically remember. **We re-sent the old messages**, and the placeholder slotted them in. All "chatbot memory" everywhere is exactly this trick. (One thing: this invoke returns the *package* — that's why we wrote `.content`. Add `| parser` to the chain and you wouldn't need it. See how the pieces connect?)

> **Note**
>
> 🎙️
>
> **Speaker note**
>
> Run the summarizer live and change the template in front of them ("now make it snarky"). The target feeling: *"oh — it's just my Class 1 code, tidied up."*

**11**

**Block 11 · ~30 min · the leap**

## Your first (tiny) agent

Everything so far *talks*. An **agent** is a model with a **tool** and the freedom to **decide when to use it**. We'll build the smallest one possible — a shop assistant with exactly one skill: looking up real prices.

agent = LLM + tool + loop

The model thinks "do I need a tool here?" → if yes, calls it → reads the result → answers. Nobody hard-codes *when*. **That decision is the entire difference between a chatbot and an agent.**

> **Analogy**
>
> 🧮
>
> **Why tools?**
>
> LLMs are great with language, terrible with facts they don't have — today's price, live stock, exact math. A tool lets the model *fetch truth* instead of guessing. Tools cure "confident but wrong."

### Our shop's "database" (kept deliberately tiny)

👟 shoes — **₹799**

🧢 hat — **₹399**

🎒 bag — **₹1420**

🩳 shorts — **₹1299**

👖 pants — **₹1699**

#### Step 1 — the tool is just a Python function

agent.py · part 1

```
import json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI()

PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}

def get_price(item):
    print(f"🔧 tool called: get_price({item})")     # so you SEE it happen
    return f"₹{PRICES.get(item.lower(), 'unknown')}"
```

Two tiny notes for the Python: `PRICES` is an ordinary dict standing in for a database, and `.get(item, 'unknown')` means "look it up, and if it's not there, say *unknown* instead of crashing." That's the entire tool — **any function you can write can become an agent's tool.**

#### Step 2 — describe the tool so the model knows it exists

The model can't see your Python. You hand it a **menu card describing the tool** — written as a dict (the nested braces look busy, but it's only four facts). Decoder below:

agent.py · part 2

```
tools = [{
    "type": "function",                                      # ①
    "function": {
        "name": "get_price",                                 # ②
        "description": "Get the price of a shop item the user asks about.",  # ③
        "parameters": {                                       # ④
            "type": "object",
            "properties": {"item": {"type": "string", "description": "the item name"}},
            "required": ["item"],
        },
    },
}]
```

🔍 decoder — the menu card, four facts

①

**What kind of tool?** A function. (That's the only kind you'll use for a long time — just write this line as-is.)

②

**Its name** — must exactly match your Python function's name, so we can find it when the model asks for it.

③

**When to use it** — written for the *model* to read. This sentence is literally how the model decides whether to call your tool. Write it clearly!

④

**What inputs it needs** — one input called `item`, which is text (`"string"`), and it's `required`. That's all the nesting says.

> **Note**
>
> ✍️
>
> **The non-obvious insight**
>
> Line ③ is **prompt engineering in disguise**. A vague description ("does stuff with items") → the model misuses the tool. A clear one → it behaves. Your words steer the machine, even inside JSON.

#### Step 3 — the loop: think → maybe call tool → answer

agent.py · part 3

```
def agent(user_message):
    messages = [{"role": "user", "content": user_message}]

    response = client.chat.completions.create(          # ① send message + tools menu
        model="gpt-4o-mini", messages=messages, tools=tools)
    msg = response.choices[0].message

    if msg.tool_calls:                                  # ② did it ask for a tool?
        messages.append(msg)
        for call in msg.tool_calls:
            args = json.loads(call.function.arguments)  # ③ read its request, run it
            result = get_price(args["item"])
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
        response = client.chat.completions.create(      # ④ send it all back → nice answer
            model="gpt-4o-mini", messages=messages)
        msg = response.choices[0].message

    return msg.content

print(agent("How much are the shoes?"))      # → tool fires → "₹799"
print(agent("Hi! What can you help with?"))   # → no tool → just chats
```

🔍 decoder — the loop, step by step

1

We send the user's message *plus our tools menu*. The model now knows a tool exists and may ask to use it.

2

`msg.tool_calls` = "did the model ask to run a tool?" If it did, this holds *which tool* and *with what input* — e.g. `get_price`, `item="shoes"`. If not, it's empty and we skip straight to the answer.

3

The model's request arrives as text, so `json.loads(...)` converts it into a Python dict we can read — then **we** run the real function. (Important: the model never runs code itself. It *asks*; your Python *does*.)

4

We append the tool's result to the conversation with `role: "tool"` (a third role, joining system/user/assistant!) and send everything back, so the model can write a friendly final answer using the real data.

### Watch the conversation grow (this makes it click)

The whole agent is just **a list of messages getting longer**. Step through one question and watch each card get appended — this is exactly what your code's `messages.append(...)` lines do:

**Live sim — The messages list, live "How much are the shoes?"**

messages = [

]

Press ▶ to start. We begin with just the user's question.

*Control:* ▶ Next step

*Control:* ↺ Reset

🤯

**`if msg.tool_calls` is the entire secret**

The model asked to run `get_price("shoes")` *on its own*. Give it ten tools and it picks among them. You now understand how Cursor, support bots, and every "AI agent" headline actually works — same pattern, bigger toolbox.

<a id="game"></a>

### 🎮 Quick game: think like the agent

Before you trust the agent, prove you understand it. For each question, predict: **will the model call the tool or answer directly?** Get 5 in a row:

question 1 of 5

*Control:* 🔧 Calls the tool

*Control:* 💬 Just answers

*Control:* Next →

*Control:* ↺ Play again

> **Note**
>
> 🎙️
>
> **Speaker note**
>
> Play this as a class — hands up for tool vs chat before revealing. The "ooh" on question 4 (the trick one) is reliably the best moment of the session.

**12**

**Block 12 · ~25 min · 🏁 THE BUILD**

## Project: Smart Shop Assistant

Same `agent()` from Block 11 — we give it a face. Gradio has a ready-made **chat interface**, so this takes four lines:

app.py

```
import gradio as gr
from agent import agent              # the function you just wrote

def chat(message, history):          # ① Gradio fills these two in for you
    return agent(message)

gr.ChatInterface(fn=chat, title="🛍️ Smart Shop Assistant").launch(share=True)  # ②
```

🔍 decoder

①

Gradio's chat box calls your function for you, handing it the user's new `message` and the chat `history` (a list of past turns). We only need the message today; *your homework hint:* pass `history` into the agent and it gains memory — exactly the trick from the memory section.

②

`ChatInterface` = a ready-made chat UI (bubbles, input box, send button) around any function. `share=True` = also give me a public link.

#### Run it

bash — your project folder

```
$ pip install openai gradio python-dotenv
$ python app.py

Running on local URL:  http://127.0.0.1:7860
Running on public URL: https://shop-xyz.gradio.live   # ← your shareable agent!
```

**Ask a price question**

"How much are the pants?" — watch your terminal print `🔧 tool called: get_price(pants)`. Your agent used its tool!

**Then ask small talk**

"What's your return policy?" — no tool fires. It's *deciding*, not following a script.

**Record that contrast**

15 seconds: one tool question, one chat question, terminal visible. That's your LinkedIn clip.

### Try the working agent 👇

A live, in-browser version with the real chat feel — typing dots, tool-call chips, the works. Watch *when* the 🔧 appears (and when it doesn't):

🛍️ **Smart Shop Assistant** live demo

Hi! I'm your shop assistant. Ask me the price of anything 🙂

*Control:* Send

**0** — tool calls

**0** — direct answers

⚙️ Simulated in-browser (keyword matching plays the "model") so it runs key-free. Your real `agent.py` lets GPT make that decision far more flexibly — same loop, same trace.

🏭 Industry spotlight · this IS how real agents work

#### One tool today → a toolbox tomorrow

Add tools for your database, email and calendar and this becomes a real assistant: "find my order, refund it, email the customer." Every production agent — coding agents included — is this exact loop with a bigger toolbox. You now own the core pattern.

Support bots · Booking assistants · Coding agents · Ops automation

**13**

**Block 13 · ~15 min · 📣 ship it**

## Ship your first agent to LinkedIn

"I built an AI *agent*" lands harder than "I built a chatbot" — because most people have no idea how simple the trick is. Post the clip, use this caption, and hit the big button below when you're live. 😄

You

Your Name

AI Engineering learner · now · 🌐

🤖 I built my first AI agent today — and it can actually *use a tool*. Ask it "how much are the shoes?" → it decides, on its own, to look up the price. Ask it anything else → it just chats. Nobody told it when to use the tool. It figured that out. That tiny decision (LLM + a tool + a loop) is the exact pattern behind Cursor, support bots, and every "AI agent" you've read about. It's so much simpler than it sounds. 🤯 Stack: Python + LangChain + one function + Gradio. Learning this hands-on with @Shivank Agrawal — an industry expert who builds real AI systems every day and makes it genuinely click. 🙌 Day 2 with @Scaler. What tool should I give my agent next? 👇 #AIEngineering #LLM #Agents #Python #BuildInPublic

👍 You and others · 💬 Comments · ↗ Repost

👉 Tag [linkedin.com/in/shivankagrawal](https://www.linkedin.com/in/shivankagrawal/) and @Scaler so we can reshare and boost your reach.

*Control:* 🚀 I posted it!

> **Note**
>
> 🔥
>
> **Two classes, two ships**
>
> You're officially "building in public." Recruiters notice consistency far more than one flashy post. Keep the streak alive.

**14**

**Block 14 · ~10 min**

## What you did & what's *next*

🧭

**3 ways to steer**

Prompting, RAG, fine-tuning — you'll mostly prompt.

🔗

**LangChain**

prompt | model | parser — chains you can snap together.

🤖

**Agents**

LLM + tool + loop. The model decides. You saw it.

🛍️

**You shipped**

A working tool-using agent, in public. 🎉

### The road ahead (still hands-on)

→

**More tools (your homework)**

Add `check_stock(item)` or `apply_discount(item)` and watch the agent pick the right one. Post the clip!

→

**RAG — chat with your own PDFs**

The next big build: a model that answers from *your* documents.

→

**Multi-agent teams**

Several agents handing work to each other — once one agent feels easy.

> **Note**
>
> 📚
>
> **A note on theory**
>
> We're deliberately deferring the deep "how models are built" topics — attention, training, scaling — until you're comfortable building. They'll land as "*oh, that's why it works*" instead of abstract lecture.

---

TechToday AI Study Library — LangChain & Agents · Scaler Academy Class 2
