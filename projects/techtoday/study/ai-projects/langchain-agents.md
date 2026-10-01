<!--
Source: langchain-agents.html
Title: LangChain & Agents | TechToday
Theme-color: #0b0d10
Stylesheets: ../dsa/dsa-study.css, ../../site-header.css
Scripts: ../dsa/dsa-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Projects](ai-projects.html)

100% Hands-On · Build Your First Agent

<a id="langchain-agents"></a>

# Today your AI stops talking and starts *doing*.

First you talked to a model. Now you give it **hands**. You'll meet LangChain, snap your first chain together, then build an **agent that decides — on its own — when to use a tool.** Watch it happen live below. 👇

🧭 3 ways to steer a model · 🔗 LangChain, hands-on · 🤖 A real tool-using agent · 🎮 "Tool or No Tool?" game

**🛍️ Smart Shop Assistant** — live

*Control:* ↻ Replay

**Scaler Academy** — type along. Every code block has 📋 Copy; every demo is clickable.

6 Topics · Concepts, Live Simulators & a Tool-Using Agent

<a id="table-of-contents"></a>

## Table of Contents

1. [10-Second Recap](#recap)
2. [3 Ways to Steer a Model](#adapt)
3. [LangChain Fundamentals](#langchain)
4. [Your First Tool-Using Agent](#agent)
5. [Hands-On Project](#project)
6. [What's Next](#next)

<a id="recap"></a>

## 1. You Already Did the Hard Part

<a id="recap-basics"></a>

### 10-Second Recap

**Recap** 10 seconds

- ✅ Called an LLM with the OpenAI library
- ✅ `system` / `user` / `assistant` messages
- ✅ Key safely in `.env`
- ✅ Shipped a Summarizer + an LLM Arena

> 💡 **🛠️ The deal — minimal slides, maximum doing.** Everything here is the *same OpenAI call you already know*, organised more cleverly. Keep your LLMs & Prompting project folder open; we build directly on top of it.

<a id="adapt"></a>

## 2. 3 Ways to Make a Model Do *What You Want*

<a id="adapt-three-ways"></a>

### Prompting, RAG & Fine-Tuning

**Block 9** ~5 min · the map

Before we build: the entire field of AI engineering boils down to **three** ways of steering a pre-trained model. You'll live in the first, visit the second soon, and almost never need the third.

- **✍️ 1. Prompting** — Just *tell* it clearly. Free, instant, no training. **90% of real work lives here** — including everything on this page.
- **📚 2. RAG** — Hand it *your* documents at question-time so it answers from real data. Coming up next.
- **🎓 3. Fine-tuning** — Actually re-train on examples. Powerful, costly, rarely needed. Reach for it last.

> 💡 **🧭 Why this matters here.** Chains, tools, agents — it's all still **option 1, organised cleverly**. Nothing new to fear. Let's build.

<a id="langchain"></a>

## 3. LangChain: Snap It Together

<a id="langchain-why"></a>

### Why LangChain (and Install It)

**Block 10** ~35 min · hands-on

With the raw OpenAI API you called the model by hand — perfect for one call. The moment you want **reusable prompts, multi-step pipelines, and memory**, you'd be rebuilding the same plumbing forever. **LangChain is that plumbing, pre-built.**

> **Analogy** 🧰 — **One-line intuition**
>
> The raw OpenAI call is a Lego brick. LangChain is the box of connectors that snaps bricks into machines.

#### Install it

bash

```text
$ pip install langchain langchain-openai
```

<a id="langchain-new-words"></a>

### First: the 3 New Words, in Plain English

LangChain code uses three names that look scary. They aren't. Read these *before* we touch code — each one is a thing you already understand:

- **`ChatPromptTemplate` = a prompt with blanks** — A normal prompt where some parts are left as `{blanks}` to fill in later. Like a wedding-invite template: "Dear `{name}`, join us on `{date}`". Write once, reuse for every guest. *say it as: "my reusable prompt"*
- **`ChatOpenAI` = the model, in a LangChain wrapper** — The exact same GPT you called with the raw OpenAI API — just wrapped so it can snap onto other LangChain pieces. Same `model=`, same `temperature=`. *say it as: "the model"*
- **`StrOutputParser` = unwraps the answer** — The model doesn't return plain text — it returns a *package* (text + metadata like token counts). This piece opens the package and hands you just the string. ("Str" = string, i.e. plain text.) *say it as: "give me just the text"*

> **Analogy** 🗣️ — **Why is it called "Chat"PromptTemplate?**
>
> Because it builds prompts in the **chat format you already know** from the raw OpenAI API — system / user / assistant messages. Same grammar, now reusable.

<a id="langchain-template"></a>

### Feel a Template (Before Coding One)

This is all a template is — blanks you fill. Pick values and watch the final prompt assemble. The dict you pass to LangChain (`{"tone": "witty", ...}`) is just "here's what goes in each blank":

**Live sim · Template playground** — pick a value for each blank

Template: Write a `{tone}` `{length}` post about `{topic}`

*Control:* tone — witty · professional · inspiring

*Control:* length — short · medium · detailed

*Control:* topic — AI agents · LangChain · your first job

<a id="langchain-parser"></a>

### What Does the Model Actually Return? (the Parser's Job)

Here's the bit nobody explains. When the model replies, you don't get plain text — you get a **package called an `AIMessage`** with the text inside it, plus bookkeeping. Press the button to see the package, and what the parser does to it:

**Live sim · Open the package** — why StrOutputParser exists

AIMessage ← the package: **content: "Anthropic builds safe AI…"** · tokens_used: 213 · model: "gpt-4o-mini" · finish_reason: "stop"

➜ 🧹 parser ➜ "Anthropic builds safe AI…" — just the text. ready to print, show in your app, or save.

*Control:* 📦 Ask the model → open the package

Without the parser you'd write `response.content` by hand every time (with the raw OpenAI API it was `response.choices[0].message.content` — remember that mouthful?). The parser does it for you, forever.

<a id="langchain-builder"></a>

### Now Build the Chain — Literally

A chain is the three pieces joined by `|` (the pipe — read it as **"then"**): prompt *then* model *then* parser. Click the pieces in the right order, then run data through:

**Live sim · Chain builder** — click pieces in order, then run

*Control:* 🤖 Model · 🧹 Parser · 📝 Prompt

*Control:* ▶ Run the chain · ↺ Reset

<a id="langchain-code"></a>

### The Same Chain, in Real Code — Decoded Line by Line

Rebuilding the earlier website summarizer the LangChain way. The numbered comments match the decoder below — nothing here is mystery code:

summarizer_langchain.py

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from scraper import fetch_website_contents   # reuse the earlier scraper
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

**🔍 Decoder — what each numbered line does**

1. **`from_template(...)`** turns my text into a **reusable prompt**. The `{website}` part is the blank — it will be filled in later, just like the playground above.
2. **The model.** The **same model you called with the raw OpenAI API**, wrapped for LangChain. `temperature=0.3` = mostly focused (summaries shouldn't be wildly creative).
3. **The parser.** The **package-opener** you just saw in the animation: takes the model's `AIMessage` package, hands back plain text.
4. **The pipe `|`** means **"then"**. Read aloud: "the prompt, *then* the model, *then* the parser." Data flows left → right, exactly like the builder.
5. **`invoke`** means **"run it"**. The dict `{"website": ...}` says which blank gets what — the key `"website"` matches the `{website}` blank by name.

> 🔑 **✨ The unlock.** `chain` is now a **reusable building block**. New task? Swap the template. Different model? Swap line ②. Hindi summaries? Add one word to the prompt. That composability is LangChain's entire point.

<a id="langchain-memory"></a>

### Bonus Piece — Memory (Decoded Too)

Remember the basic truth: models forget everything between calls. The fix is simple — **re-send the old messages every time**. LangChain gives that a tidy home. Two tiny new words first:

- **`HumanMessage` / `AIMessage` = labelled chat bubbles** — Just a way to store "the human said X" and "the AI replied Y" — the same user/assistant roles from the raw OpenAI API, as Python objects.
- **`MessagesPlaceholder` = a parking spot for history** — A blank in your prompt that holds *a list of past messages* instead of one word. "Insert the whole conversation so far, right here."

memory_demo.py

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly tutor."),     # ① personality, like the raw API
    MessagesPlaceholder("history"),              # ② past turns park here
    ("human", "{question}"),                     # ③ the new question
])
chain = prompt | model

history = [HumanMessage("My name is Aarav."), AIMessage("Hi Aarav!")]
print(chain.invoke({"history": history, "question": "What's my name?"}).content)
# → "Your name is Aarav."  ✅ it "remembered" — because WE re-sent the history
```

> 💡 **💡 De-mystify this for them.** The model didn't magically remember. **We re-sent the old messages**, and the placeholder slotted them in. All "chatbot memory" everywhere is exactly this trick. (One thing: this invoke returns the *package* — that's why we wrote `.content`. Add `| parser` to the chain and you wouldn't need it. See how the pieces connect?)

> 💡 **🎙️ Speaker note.** Run the summarizer live and change the template in front of them ("now make it snarky"). The target feeling: *"oh — it's just my raw OpenAI code, tidied up."*

<a id="agent"></a>

## 4. Your First (Tiny) Agent

<a id="agent-intro"></a>

### Agent = LLM + Tool + Loop

**Block 11** ~30 min · the leap

Everything so far *talks*. An **agent** is a model with a **tool** and the freedom to **decide when to use it**. We'll build the smallest one possible — a shop assistant with exactly one skill: looking up real prices.

> **agent = LLM + tool + loop.** The model thinks "do I need a tool here?" → if yes, calls it → reads the result → answers. Nobody hard-codes *when*. **That decision is the entire difference between a chatbot and an agent.**

> **Analogy** 🧮 — **Why tools?**
>
> LLMs are great with language, terrible with facts they don't have — today's price, live stock, exact math. A tool lets the model *fetch truth* instead of guessing. Tools cure "confident but wrong."

<a id="agent-build"></a>

### Our Shop's "Database" (Kept Deliberately Tiny)

👟 shoes — **₹799** · 🧢 hat — **₹399** · 🎒 bag — **₹1420** · 🩳 shorts — **₹1299** · 👖 pants — **₹1699**

#### Step 1 — the tool is just a Python function

agent.py · part 1

```python
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

```python
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

**🔍 Decoder — the menu card, four facts**

1. **What kind of tool?** A function. (That's the only kind you'll use for a long time — just write this line as-is.)
2. **Its name** — must exactly match your Python function's name, so we can find it when the model asks for it.
3. **When to use it** — written for the *model* to read. This sentence is literally how the model decides whether to call your tool. Write it clearly!
4. **What inputs it needs** — one input called `item`, which is text (`"string"`), and it's `required`. That's all the nesting says.

> 💡 **✍️ The non-obvious insight.** Line ③ is **prompt engineering in disguise**. A vague description ("does stuff with items") → the model misuses the tool. A clear one → it behaves. Your words steer the machine, even inside JSON.

#### Step 3 — the loop: think → maybe call tool → answer

agent.py · part 3

```python
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

**🔍 Decoder — the loop, step by step**

1. **Send message + menu.** We send the user's message *plus our tools menu*. The model now knows a tool exists and may ask to use it.
2. **Check for a tool request.** `msg.tool_calls` = "did the model ask to run a tool?" If it did, this holds *which tool* and *with what input* — e.g. `get_price`, `item="shoes"`. If not, it's empty and we skip straight to the answer.
3. **Run the tool.** The model's request arrives as text, so `json.loads(...)` converts it into a Python dict we can read — then **we** run the real function. (Important: the model never runs code itself. It *asks*; your Python *does*.)
4. **Send it all back.** We append the tool's result to the conversation with `role: "tool"` (a third role, joining system/user/assistant!) and send everything back, so the model can write a friendly final answer using the real data.

<a id="agent-messages"></a>

### Watch the Conversation Grow (This Makes It Click)

The whole agent is just **a list of messages getting longer**. Step through one question and watch each card get appended — this is exactly what your code's `messages.append(...)` lines do:

**Live sim · The messages list, live** — "How much are the shoes?"

`messages = [ ]`

Press ▶ to start. We begin with just the user's question.

*Control:* ▶ Next step · ↺ Reset

> 🔑 **🤯 `if msg.tool_calls` is the entire secret.** The model asked to run `get_price("shoes")` *on its own*. Give it ten tools and it picks among them. You now understand how Cursor, support bots, and every "AI agent" headline actually works — same pattern, bigger toolbox.

<a id="agent-game"></a>

### 🎮 Quick Game: Think Like the Agent

Before you trust the agent, prove you understand it. For each question, predict: **will the model call the tool or answer directly?** Get 5 in a row:

**🎮 Tool or No Tool?** — question 1 of 5

*Control:* 🔧 Calls the tool · 💬 Just answers

*Control:* Next → · ↺ Play again

> 💡 **🎙️ Speaker note.** Play this as a class — hands up for tool vs chat before revealing. The "ooh" on question 4 (the trick one) is reliably the best moment of the session.

<a id="project"></a>

## 5. Project: Smart Shop Assistant

<a id="project-build"></a>

### Give the Agent a Chat Loop & Run It

**Block 12** ~25 min · 🏁 THE BUILD

Same `agent()` from Block 11 — we give it a simple chat loop in the terminal, so this takes a few lines:

main.py

```python
from agent import agent              # the function you just wrote

while True:                          # ① keep chatting until you type quit
    message = input("You: ")
    if message.strip().lower() in ("quit", "exit"):
        break
    print("Shop:", agent(message))   # ②
```

**🔍 Decoder**

1. **The chat loop.** `input()` reads each new message you type, and the loop keeps going until you type `quit`. We only pass the message today; *your homework hint:* keep a `history` list of past turns and pass it into the agent and it gains memory — exactly the trick from the memory section.
2. **One agent turn.** `agent(message)` runs the full think → maybe-tool → answer loop, and we print its reply.

#### Run it

bash — your project folder

```text
$ pip install openai python-dotenv
$ python main.py

You: How much are the pants?
🔧 tool called: get_price(pants)
Shop: The pants are ₹1699.
```

1. **Ask a price question.** "How much are the pants?" — watch your terminal print `🔧 tool called: get_price(pants)`. Your agent used its tool!
2. **Then ask small talk.** "What's your return policy?" — no tool fires. It's *deciding*, not following a script.
3. **Compare the two.** One tool question, one chat question, terminal visible — that contrast is the whole agent idea in 15 seconds.

<a id="project-demo"></a>

### Try the Working Agent 👇

A live, in-browser version with the real chat feel — typing dots, tool-call chips, the works. Watch *when* the 🔧 appears (and when it doesn't):

**🛍️ Smart Shop Assistant** — live demo

Hi! I'm your shop assistant. Ask me the price of anything 🙂

*Control:* Send

*Control:* How much are the shoes? · Is the hat cheaper than the bag? · Do you sell laptops? · Hi! What can you do? · What's your return policy?

**0** tool calls · **0** direct answers

⚙️ Simulated in-browser (keyword matching plays the "model") so it runs key-free. Your real `agent.py` lets GPT make that decision far more flexibly — same loop, same trace.

> 🎯 **Industry spotlight · this IS how real agents work — one tool today → a toolbox tomorrow.** Add tools for your database, email and calendar and this becomes a real assistant: "find my order, refund it, email the customer." Every production agent — coding agents included — is this exact loop with a bigger toolbox. You now own the core pattern.
>
> Support bots · Booking assistants · Coding agents · Ops automation

<a id="next"></a>

## 6. What You Did & What's *Next*

<a id="next-recap"></a>

### What You Did

**Block 14** ~10 min

- **🧭 3 ways to steer** — Prompting, RAG, fine-tuning — you'll mostly prompt.
- **🔗 LangChain** — prompt | model | parser — chains you can snap together.
- **🤖 Agents** — LLM + tool + loop. The model decides. You saw it.
- **🛍️ You shipped** — A working tool-using agent. 🎉

<a id="next-road"></a>

### The Road Ahead (Still Hands-On)

1. **More tools (your homework).** Add `check_stock(item)` or `apply_discount(item)` and watch the agent pick the right one.
2. **RAG — chat with your own PDFs.** The next big build: a model that answers from *your* documents.
3. **Multi-agent teams.** Several agents handing work to each other — once one agent feels easy.

> 💡 **📚 A note on theory.** We're deliberately deferring the deep "how models are built" topics — attention, training, scaling — until you're comfortable building. They'll land as "*oh, that's why it works*" instead of abstract lecture.
