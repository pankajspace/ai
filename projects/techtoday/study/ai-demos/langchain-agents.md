<!--
Source: langchain-agents.html
Title: LangChain & Agents | TechToday
Theme-color: #0b0d10
Stylesheets: ../dsa/dsa-study.css, ../../site-header.css, ai-demos.css
Scripts: ../dsa/dsa-study.js
-->

Navigation: [TechToday](../../index.html) · [← AI Demos](ai-demos.html)

100% Hands-On · Build Your First Agent

<a id="langchain-agents"></a>

# Make your AI answer questions and use tools.

You already talked to a model. Now you give it **tools**. You will meet LangChain, build your first chain, and then build an **agent that decides when to use a tool.** The examples below show each step.

- 🧭 3 ways to steer a model
- 🔗 LangChain, hands-on
- 🤖 A real tool-using agent
- 🎮 "Tool or No Tool?" questions

**Example · Smart Shop Assistant** — tool decision transcript

How much are the shoes?

🔧 get_price("shoes") → ₹799

The shoes are ₹799! Anything else? 🙂

Nice. What can you do?

I can look up any item's price. I decide when to check the database myself. 😎

The assistant calls `get_price` for a price question. It answers directly when the user only asks what it can do.

**Scaler Academy** — type along. Every code block has 📋 Copy. Every example shows its full input and output.

6 Topics

•

Concepts, Worked Examples & a Tool-Using Agent

<a id="table-of-contents"></a>

## Table of Contents

1. [10-Second Recap](#recap)
2. [3 Ways to Steer a Model](#adapt)
3. [LangChain Fundamentals](#langchain)
4. [Your First Tool-Using Agent](#agent)
5. [Hands-On Project](#project)
6. [What's Next](#next)

<a id="recap"></a>

## 1. You already know the basics

<a id="recap-basics"></a>

### 10-Second Recap

- **Recap** 10 seconds

- ✅ Called an LLM with the OpenAI library
- ✅ `system` / `user` / `assistant` messages
- ✅ Key safely in `.env`
- ✅ Shipped a Summarizer + an LLM Arena

> **🛠️ The deal — minimal slides, maximum doing.** Everything here is the *same
> OpenAI call you already know*, organised more cleverly. Keep your LLMs & Prompting
> project folder open; we build directly on top of it.

<a id="adapt"></a>

## 2. 3 ways to steer a model

<a id="adapt-three-ways"></a>

### Prompting, RAG & Fine-Tuning

- **Block 9** ~5 min · the map

Before you build, remember the **three** main ways to steer a pre-trained model. You will use the first one most of the time. You will use the second one soon. You will rarely need the third.

- **✍️ 1. Prompting**Just *tell* it clearly. Free, instant, no training.
  **90% of real work lives here** — including everything on this page.
- **📚 2. RAG**Hand it *your* documents at question-time so it answers from real data.
  Coming up next.
- **🎓 3. Fine-tuning**Actually re-train on examples. Powerful, costly, rarely needed. Reach for
  it last.

> **🧭 Why this matters here.** Chains, tools, agents — it's all still **option 1,
> organised cleverly**. Nothing new to fear. Let's build.

<a id="langchain"></a>

## 3. LangChain connects the pieces

<a id="langchain-why"></a>

### Why LangChain (and Install It)

- **Block 10** ~35 min · hands-on

With the raw OpenAI API you called the model by hand — perfect for one call. The moment you want
**reusable prompts, multi-step pipelines, and memory**, you'd be rebuilding the same
plumbing forever. **LangChain is that plumbing, pre-built.**

> **Analogy** 🧰 — **One-line intuition**
> The raw OpenAI call is a Lego brick. LangChain is the box of connectors that snaps bricks into
machines.

#### Install it

**bash**

```text
$ pip install langchain langchain-openai
```

<a id="langchain-new-words"></a>

### The 3 new words in plain English

LangChain code uses three names that look scary. They aren't. Read these *before* we touch
code — each one is a thing you already understand:

- **`ChatPromptTemplate` = a prompt with blanks**A normal prompt where some parts are
  left as `{blanks}` to fill in later. Like a wedding-invite template: "Dear
  `{name}`, join us on `{date}`". Write once, reuse for every guest.
  *say
  it as: "my reusable prompt"*
- **`ChatOpenAI` = the model, in a LangChain wrapper**The exact same GPT you called
  with the raw OpenAI API — just wrapped so it can snap onto other LangChain pieces. Same
  `model=`, same `temperature=`.
  *say it as: "the model"*
- **`StrOutputParser` = unwraps the answer**The model doesn't return plain text — it
  returns a *package* (text + metadata like token counts). This piece opens the package and
  hands you just the string. ("Str" = string, i.e. plain text.)
  *say it as: "give me just the
  text"*

> **Analogy** 🗣️ — **Why is it called "Chat"PromptTemplate?**
> Because it builds prompts in the **chat format you already know** from the raw
OpenAI API — system / user / assistant messages. Same grammar, now reusable.

<a id="langchain-template"></a>

### Feel a Template (Before Coding One)

A template is text with blanks. You fill the blanks with a dict. The dict you pass to LangChain, such as `{"tone": "witty", ...}`, tells LangChain what value goes into each blank.

**Example · Template playground** — worked prompt fills

Template: Write a {tone} {length} post about {topic}.

1. **`tone`**: `witty`, `professional`, `inspiring`
2. **`length`**: `short`, `medium`, `detailed`
3. **`topic`**: `AI agents`, `LangChain`, `your first job`
Default call:
chain.invoke({"tone": "witty", "length": "short", "topic": "AI agents"})
→ Write a witty short post about AI agents.

1. **`tone="witty"`, `length="short"`, `topic="AI agents"`**: Write a **witty** **short** post about **AI agents**.
2. **`tone="professional"`, `length="medium"`, `topic="LangChain"`**: Write a **professional** **medium** post about **LangChain**.
3. **`tone="inspiring"`, `length="detailed"`, `topic="your first job"`**: Write an **inspiring** **detailed** post about **your first job**.
The keys in the dict match the blank names: `tone`, `length`, and `topic`.

<a id="langchain-parser"></a>

### What the model returns and why the parser helps

When the model replies, you do not get plain text. You get a **package called an `AIMessage`**. It holds the text and bookkeeping data. The parser opens the package and returns only the text.

**Example · Open the package** — why StrOutputParser exists

AIMessage ← the package

content: "Anthropic builds safe AI…"

tokens_used: 213

model: "gpt-4o-mini"

finish_reason: "stop"

➜ 🧹 parser ➜

"Anthropic builds safe AI…"Just the text. It is ready to print, show in your app, or save.

Without the parser, you would write `response.content` by hand each time. With the raw OpenAI API, you wrote `response.choices[0].message.content`. The parser does that cleanup for you.

<a id="langchain-builder"></a>

### Build the chain in order

A chain is three pieces joined by `|`, the pipe. Read the pipe as **"then"**: prompt *then* model *then* parser.

**Example · Chain builder** — pieces, order, and output

📝 Prompt

|

🤖 Model

|

🧹 Parser

1. **📝 Prompt**: The prompt comes first. It shapes the request.
2. **🤖 Model**: The model goes in the middle. It does the thinking.
3. **🧹 Parser**: The parser comes last. It cleans the output into plain text.
The challenge tray showed the pieces in this order: 🤖 Model, 🧹 Parser, 📝 Prompt. If you picked a later piece too early, the feedback explained which piece was expected next.

📝 prompt fills the blank → "Summarize this website: anthropic.com…"🤖 model thinks… generates the summary🧹 parser returns clean text → "Anthropic builds safe AI systems, including Claude…" ✅

This is why `prompt | model | parser` reads like a small assembly line.

<a id="langchain-code"></a>

### The same chain in real code, decoded line by line

Rebuilding the earlier website summarizer the LangChain way. The numbered comments match the decoder
below — nothing here is mystery code:

**summarizer_langchain.py**

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

1. **`from_template(...)`** turns my text into a **reusable
  prompt**. The `{website}` part is the blank — it will be filled in later, just
  like the playground above.
2. **The model.** The **same model you called with the raw OpenAI API**,
  wrapped for LangChain. `temperature=0.3` = mostly focused (summaries shouldn't be wildly
  creative).
3. **The parser.** The **package-opener** you just saw in the animation:
  takes the model's `AIMessage` package, hands back plain text.
4. **The pipe `|`** means **"then"**. Read aloud: "the prompt,
  *then* the model, *then* the parser." Data flows left → right, exactly like the
  builder.
5. **`invoke`** means **"run it"**. The dict
  `{"website": ...}` says which blank gets what — the key `"website"` matches
  the `{website}` blank by name.

> **✨ The unlock.** `chain` is now a **reusable building
> block**. New task? Swap the template. Different model? Swap line ②. Hindi summaries? Add
> one word to the prompt. That composability is LangChain's entire point.

<a id="langchain-memory"></a>

### Bonus piece: memory, decoded

Remember the basic truth: models forget everything between calls. The fix is simple —
**re-send the old messages every time**. LangChain gives that a tidy home. Two tiny new
words first:

- **`HumanMessage` / `AIMessage` = labelled chat bubbles**Just a way to
  store "the human said X" and "the AI replied Y" — the same user/assistant roles from the raw OpenAI
  API, as Python objects.
- **`MessagesPlaceholder` = a parking spot for history**A blank in your prompt that
  holds *a list of past messages* instead of one word. "Insert the whole conversation so far,
  right here."

**memory_demo.py**

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
# → "Your name is Aarav." It remembered because we re-sent the history
```

> **💡 De-mystify this for them.** The model didn't magically remember. **We
> re-sent the old messages**, and the placeholder slotted them in. All "chatbot memory"
> everywhere is exactly this trick. (One thing: this invoke returns the *package* — that's why
> we wrote `.content`. Add `| parser` to the chain and you wouldn't need it. See
> how the pieces connect?)

> **🎙️ Speaker note.** Run the summarizer live and change the template in front of them
> ("now make it snarky"). The target feeling: *"oh — it's just my raw OpenAI code, tidied
> up."*

<a id="agent"></a>

## 4. Your first small agent

<a id="agent-intro"></a>

### Agent = LLM + tool + loop

- **Block 11** ~30 min · the leap

Everything so far only *talks*. An **agent** is a model with a **tool** and the freedom to **decide when to use it**. You will build a small shop assistant with one skill: looking up real prices.

> **agent = LLM + tool + loop.** The model checks, "Do I need a tool here?" If yes, it asks for the tool, reads the result, and answers. You do not hard-code *when*. **That decision is the difference between a chatbot and an agent.**

> **Analogy** 🧮 — **Why tools?**
> LLMs are great with language, terrible with facts they don't have — today's price, live stock,
exact math. A tool lets the model *fetch truth* instead of guessing. Tools cure "confident
but wrong."

<a id="agent-build"></a>

### Our shop database is small on purpose

- 👟 shoes — **₹799**
- 🧢 hat — **₹399**
- 🎒 bag — **₹1420**
- 🩳 shorts — **₹1299**
- 👖 pants — **₹1699**

#### Step 1 — the tool is just a Python function

**agent.py · part 1**

```python
import json
from openai import OpenAI
from dotenv import load_dotenv
# ① load the API key and create the OpenAI client
load_dotenv()
client = OpenAI()

PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}

def get_price(item):
    # ① log the tool call so learners can see when it fired
    print(f"🔧 tool called: get_price({item})")     # show when the tool runs
    # ② look up the item and return a readable price string
    return f"₹{PRICES.get(item.lower(), 'unknown')}"
```

Two tiny notes for the Python: `PRICES` is an ordinary dict standing in for a database,
and `.get(item, 'unknown')` means "look it up, and if it's not there, say
*unknown* instead of crashing." That's the entire tool — **any function you can write
can become an agent's tool.**

#### Step 2 — describe the tool so the model knows it exists

The model can't see your Python. You hand it a **menu card describing the tool** —
written as a dict (the nested braces look busy, but it's only four facts). Decoder below:

**agent.py · part 2**

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

1. **What kind of tool?** A function. (That's the only kind you'll use for a long time —
  just write this line as-is.)
2. **Its name** — must exactly match your Python function's name, so we can find it
  when the model asks for it.
3. **When to use it** — written for the *model* to read. This sentence is
  literally how the model decides whether to call your tool. Write it clearly!
4. **What inputs it needs** — one input called `item`, which is text
  (`"string"`), and it's `required`. That's all the nesting says.

> **✍️ The non-obvious insight.** Line ③ is **prompt engineering in
> disguise**. A vague description ("does stuff with items") → the model misuses the tool. A
> clear one → it behaves. Your words steer the machine, even inside JSON.

#### Step 3 — the loop: think → maybe call tool → answer

**agent.py · part 3**

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

1. **Send message + menu.** We send the user's message *plus our tools menu*.
  The model now knows a tool exists and may ask to use it.
2. **Check for a tool request.** `msg.tool_calls` = "did the model ask to
  run a tool?" If it did, this holds *which tool* and *with what input* — e.g.
  `get_price`, `item="shoes"`. If not, it's empty and we skip straight to the
  answer.
3. **Run the tool.** The model's request arrives as text, so
  `json.loads(...)` converts it into a Python dict we can read — then **we**
  run the real function. (Important: the model never runs code itself. It *asks*; your Python
  *does*.)
4. **Send it all back.** We append the tool's result to the conversation with
  `role: "tool"` (a third role, joining system/user/assistant!) and send everything back,
  so the model can write a friendly final answer using the real data.

<a id="agent-messages"></a>

### Watch the message list grow

The whole agent is **a list of messages that gets longer**. One question adds four records. These are the same records created by the `messages.append(...)` lines in the code.

**Example · The messages list** — "How much are the shoes?"

messages = [

**user**"How much are the shoes?"

**assistant (tool request)**→ wants: get_price(item="shoes")

**tool**"₹799"

**assistant (final)**"The shoes are ₹799! Anything else? 🙂"

]

1. **Step 1.** The list starts with the user's question, plus the tools menu on the side.
2. **Step 2.** The model does not answer yet. It asks to run `get_price` for `shoes`. This is what `msg.tool_calls` holds.
3. **Step 3.** Your Python runs `get_price("shoes")` and appends the result with the new role: `tool`. The model never runs code. It asks, and your Python does the work.
4. **Step 4.** You send the longer list back. Now the model writes a friendly answer using the real price.

That is the whole agent loop: user → tool request → tool result → answer.

> **🤯 `if msg.tool_calls` is the core check.** The model asked to run `get_price("shoes")` by itself. If you give it ten tools, it can pick among them. Cursor, support bots, and many "AI agent" systems use this same pattern with a bigger toolbox.

<a id="agent-game"></a>

### Quick check: think like the agent

Before you trust the agent, check the rule. For each question, decide whether the model should **call the tool or answer directly**. The answers and reasons are below.

**Example · Tool or No Tool?** — 5 questions with answers

1. **"How much is the bag?"**
  Correct answer: **Calls the tool.**
  Reason: A price question needs real data, so the model calls `get_price("bag")`.
2. **"Hi! How are you today?"**
  Correct answer: **Just answers.**
  Reason: This is small talk. No shop facts are needed.
3. **"Is the hat cheaper than the shorts?"**
  Correct answer: **Calls the tool.**
  Reason: Comparing prices needs the real numbers, so it calls the tool twice.
4. **"What's the capital of France?"**
  Correct answer: **Just answers.**
  Reason: This is the trick question. The model already knows this, and the price tool cannot help.
5. **"I have ₹1500 — can I afford the pants?"**
  Correct answer: **Calls the tool.**
  Reason: It must check the real price, ₹1699, before answering. It calls the tool and then says the budget is not quite enough.

The score text was either **"Perfect 5/5 — you think like an agent"** or **"Final score: X/5 — solid"**. The lesson is to ask whether the available tool can improve the answer.

> **🎙️ Speaker note.** Use these as class questions. The fourth question is useful because it shows that a tool should not run when it cannot help.

<a id="project"></a>

## 5. Project: Smart Shop Assistant

<a id="project-build"></a>

### Give the agent a chat loop and run it

- **Block 12** ~25 min · 🏁 THE BUILD

Same `agent()` from Block 11 — we give it a simple chat loop in the terminal, so this
takes a few lines:

**main.py**

```python
from agent import agent              # use the function you wrote

while True:                          # ① keep chatting until the user types quit
    message = input("You: ")
    if message.strip().lower() in ("quit", "exit"):
        break
    print("Shop:", agent(message))   # ②
```

**🔍 Decoder**

1. **The chat loop.** `input()` reads each new message you type, and the loop
  keeps going until you type `quit`. We only pass the message today; *your homework
  hint:* keep a `history` list of past turns and pass it into the agent and it gains
  memory — exactly the trick from the memory section.
2. **One agent turn.** `agent(message)` runs the full think → maybe-tool →
  answer loop, and we print its reply.

#### Run it

**bash — your project folder**

```text
$ pip install openai python-dotenv
$ python main.py

You: How much are the pants?
🔧 tool called: get_price(pants)
Shop: The pants are ₹1699.
```

1. **Ask a price question.** "How much are the pants?" — watch your terminal print
  `🔧 tool called: get_price(pants)`. Your agent used its tool!
2. **Then ask small talk.** "What's your return policy?" — no tool fires. It's
  *deciding*, not following a script.
3. **Compare the two.** One tool question, one chat question, terminal visible — that
  contrast is the whole agent idea in 15 seconds.

<a id="project-demo"></a>

### Example run of the working agent

This trace shows a sample chat with the agent. Watch when the 🔧 tool line appears and when the assistant answers directly.

**Example · Smart Shop Assistant** — preset traces

**Starting message:** Hi! I'm your shop assistant. Ask me the price of anything 🙂

1. **How much are the shoes?**
   - **Trace**: `get_price("shoes") → ₹799`
   - **Assistant answer**: The shoes are **₹799**. Anything else? 🙂
2. **Is the hat cheaper than the bag?**
   - **Trace**: `get_price("hat") → ₹399`
     `get_price("bag") → ₹1420`
   - **Assistant answer**: hat: **₹399** · bag: **₹1420**
     So the **hat** is the cheaper one!
3. **Do you sell laptops?**
   - **Trace**: — no tool needed, answering directly —
   - **Assistant answer**: I'm your shop helper! Ask me any item's price and I'll look it up in the database. 🛍️
4. **Hi! What can you do?**
   - **Trace**: — no tool needed, answering directly —
   - **Assistant answer**: I'm your shop helper! Ask me any item's price and I'll look it up in the database. 🛍️
5. **What's your return policy?**
   - **Trace**: — no tool needed, answering directly —
   - **Assistant answer**: I'm your shop helper! Ask me any item's price and I'll look it up in the database. 🛍️
6. **How much is the laptop?**
   - **Trace**: `get_price(...) → unknown`
   - **Assistant answer**: Hmm, that item isn't in my shop. I've got shoes, hat, bag, shorts and pants!
**Shop data:** shoes ₹799, hat ₹399, bag ₹1420, shorts ₹1299, pants ₹1699.

**How this sample trace was made:** keyword rules stand in for the model. They look for item names, including simple singular forms. They treat `price`, `cost`, `how much`, `cheap`, `expensive`, `afford`, and `₹` as price-related words. Each item found adds one tool call. A price question about an unknown item adds one "unknown" tool call. Anything else is a direct answer.

In this sample, keyword matching stands in for the model. In your real `agent.py`, GPT makes the decision more flexibly, but the loop and trace stay the same.

> **Industry spotlight · real agents use this same loop.** Today the assistant has one tool. Tomorrow you can add tools for your database, email, and calendar. Then it can handle tasks such as "find my order, refund it, email the customer." Production agents, including coding agents, use this loop with a bigger toolbox.
>
> - Support bots
> - Booking assistants
> - Coding agents
> - Ops automation

<a id="next"></a>

## 6. What you did and what comes next

<a id="next-recap"></a>

### What You Did

- **Block 14** ~10 min

- **🧭 3 ways to steer**Prompting, RAG, fine-tuning — you'll mostly prompt.
- **🔗 LangChain**prompt | model | parser — chains you can snap together.
- **🤖 Agents**LLM + tool + loop. The model decides. You saw it.
- **🛍️ You shipped**A working tool-using agent. 🎉

<a id="next-road"></a>

### The road ahead, still hands-on

1. **More tools (your homework).** Add `check_stock(item)` or
  `apply_discount(item)` and watch the agent pick the right one.
2. **RAG — chat with your own PDFs.** The next big build: a model that answers from
  *your* documents.
3. **Multi-agent teams.** Several agents handing work to each other — once one agent
  feels easy.

> **📚 A note on theory.** We're deliberately deferring the deep "how models are built"
> topics — attention, training, scaling — until you're comfortable building. They'll land as "*oh,
> that's why it works*" instead of abstract lecture.
