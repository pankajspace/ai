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

You already talked to a model. Now you give it **tools**. You will learn LangChain, build your first chain, and create an **agent that decides when to use a tool.** The examples below show each step.

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

---

<a id="unit-1"></a>

## Unit 1 — Mental Models & Adaptation

Review core LLM limits. Compare prompt engineering, fine-tuning, and tool workflows.

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

Remember the **three** main ways to steer a pre-trained model. You will use the first one most often. You will use the second one soon. You will rarely need the third.

- **✍️ 1. Prompting**Just *tell* it clearly. It is free, instant, and requires no training.
  **90% of real work happens here** — including everything on this page.
- **📚 2. RAG**Give it *your* documents at question-time. It will answer using real data.
  Coming up next.
- **🎓 3. Fine-tuning**Re-train the model on examples. It is powerful and costly but rarely needed. Use this last.

> **🧭 Why this matters here.** Chains, tools, agents — it's all still **option 1,
> organised cleverly**. Nothing new to fear. Let's build.

---

<a id="unit-2"></a>

## Unit 2 — LangChain Core & LCEL

Build prompt templates, models, and parsers using LangChain Expression Language (LCEL).

<a id="langchain"></a>

## 3. LangChain connects the pieces

<a id="langchain-why"></a>

### Why LangChain (and Install It)

- **Block 10** ~35 min · hands-on

You called the model by hand with the raw OpenAI API. This is perfect for one call. If you want **reusable prompts, pipelines, and memory**, you must build the plumbing yourself. **LangChain provides this plumbing.**

> **Analogy** 🧰 — **One-line intuition**
> The raw OpenAI call is a Lego brick. LangChain connects these bricks into machines.

#### Install it

**bash**

```bash
$ pip install langchain langchain-openai
```

<a id="langchain-new-words"></a>

### The 3 new words in plain English

LangChain code uses three names. They look scary, but they are simple. Read these *before* we write code. You already understand each one:

- **`ChatPromptTemplate` = a prompt with blanks**This is a normal prompt with `{blanks}` to fill in later. It is like a wedding invite: 'Dear `{name}`, join us on `{date}`'. Write it once and reuse it.
  *say
  it as: "my reusable prompt"*
- **`ChatOpenAI` = the model, in a LangChain wrapper**This is the same GPT you called with the raw OpenAI API. It is wrapped to connect with LangChain pieces. It uses the same `model=` and `temperature=`.
  *say it as: "the model"*
- **`StrOutputParser` = unwraps the answer**The model returns a *package* with text and metadata, not plain text. This piece opens the package and gives you the text string.
  *say it as: "give me just the
  text"*

> **Analogy** 🗣️ — **Why is it called "Chat"PromptTemplate?**
> It builds prompts in the **chat format you already know** from the raw OpenAI API. It uses system, user, and assistant messages. It is the same grammar, but reusable.

<a id="langchain-template"></a>

### Feel a Template (Before Coding One)

A template is text with blanks. You fill the blanks with a dictionary. The dictionary tells LangChain what value goes into each blank.

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

The model does not return plain text. It returns a **package called an `AIMessage`**. This holds the text and data. The parser opens the package and returns only the text.

**Example · Open the package** — why StrOutputParser exists

AIMessage ← the package

content: "Anthropic builds safe AI…"

tokens_used: 213

model: "gpt-4o-mini"

finish_reason: "stop"

➜ 🧹 parser ➜

"Anthropic builds safe AI…"Just the text. It is ready to print, show in your app, or save.

Without the parser, you write `response.content` each time. With the OpenAI API, you wrote `response.choices[0].message.content`. The parser does this cleanup for you.

<a id="langchain-builder"></a>

### Build the chain in order

A chain joins three pieces with `|`, the pipe. Read the pipe as **'then'**: prompt *then* model *then* parser.

**Example · Chain builder** — pieces, order, and output

📝 Prompt

|

🤖 Model

|

🧹 Parser

1. **📝 Prompt**: The prompt comes first. It shapes the request.
2. **🤖 Model**: The model goes in the middle. It does the thinking.
3. **🧹 Parser**: The parser comes last. It cleans the output into plain text.
The tray showed the pieces in this order: 🤖 Model, 🧹 Parser, 📝 Prompt. If you picked a piece too early, feedback explained what was expected next.

📝 prompt fills the blank → "Summarize this website: anthropic.com…"🤖 model thinks… generates the summary🧹 parser returns clean text → "Anthropic builds safe AI systems, including Claude…" ✅

This is why `prompt | model | parser` reads like a small assembly line.

<a id="langchain-code"></a>

### The same chain in real code, decoded line by line

Let's rebuild the website summarizer using LangChain. The numbered comments match the decoder below. There is no mystery code here:

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

1. **`from_template(...)`** turns text into a **reusable prompt**. The `{website}` part is the blank. It will be filled in later.
2. **The model.** This is the **same model you called with the OpenAI API**, wrapped for LangChain. A `temperature=0.3` makes it focused. Summaries should not be wildly creative.
3. **The parser.** This is the **package-opener**. It takes the model's `AIMessage` package and returns plain text.
4. **The pipe `|`** means **'then'**. Read it as: 'the prompt, *then* the model, *then* the parser.' Data flows left to right.
5. **`invoke`** means **'run it'**. The dictionary `{"website": ...}` links the values to the blanks.

> **✨ The unlock.** `chain` is now a **reusable building
> block**. New task? Swap the template. Different model? Swap line ②. Hindi summaries? Add
> one word to the prompt. That composability is LangChain's entire point.

<a id="langchain-memory"></a>

### Bonus piece: memory, decoded

Models forget everything between calls. The fix is simple: **re-send old messages every time**. LangChain makes this easy. Let's learn two new words:

- **`HumanMessage` / `AIMessage` = labelled chat bubbles**These store 'the human said X' and 'the AI replied Y'. They are the user and assistant roles from the OpenAI API, as Python objects.
- **`MessagesPlaceholder` = a parking spot for history**This is a blank in your prompt that holds *a list of past messages*. It inserts the conversation history.

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

---

<a id="unit-3"></a>

## Unit 3 — Tool-Using Agents & Capstone

Define custom Python tools. Run a reasoning loop. Build a Smart Shop Assistant, and explore memory.

<a id="agent"></a>

## 4. Your first small agent

<a id="agent-intro"></a>

### Agent = LLM + tool + loop

- **Block 11** ~30 min · the leap

Everything so far only *talks*. An **agent** is a model with a **tool** and the freedom to **decide when to use it**. You will build a shop assistant with one skill: looking up prices.

> **agent = LLM + tool + loop.** The model asks, 'Do I need a tool here?' If yes, it calls the tool, reads the result, and answers. You do not hard-code *when*. **This decision makes it an agent, not just a chatbot.**

> **Analogy** 🧮 — **Why tools?**
> LLMs are great with language, but terrible with unknown facts. They struggle with live prices, stock, and exact math. A tool lets the model *fetch truth* instead of guessing. Tools fix confident but wrong answers.

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

`PRICES` is a dictionary acting as a database. `.get(item, 'unknown')` looks up an item. If it is not found, it returns *unknown* instead of crashing. **Any function can be an agent's tool.**

#### Step 2 — describe the tool so the model knows it exists

The model cannot see your Python code. You give it a **menu card describing the tool**. This is written as a dictionary with four facts. See the decoder below:

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

1. **What kind of tool?** A function. This is the only kind you will use for now. Just write this line as-is.
2. **Its name** — This must exactly match the Python function's name. This helps find it when the model asks for it.
3. **When to use it** — This is written for the *model* to read. The model uses this sentence to decide if it should call the tool. Write it clearly!
4. **What inputs it needs** — It needs one input called `item`. It is text (`'string'`), and it is `required`.

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

1. **Send message + menu.** We send the user's message *and our tools menu*. The model knows a tool exists and may use it.
2. **Check for a tool request.** `msg.tool_calls` checks if the model asked to run a tool. If yes, it holds *which tool* and *with what input*. If no, it is empty and we skip to the answer.
3. **Run the tool.** The model's request arrives as text. `json.loads(...)` converts it into a Python dictionary. Then, **we** run the real function. The model never runs code itself. It *asks*, and your Python *does* the work.
4. **Send it all back.** We append the tool's result to the conversation using `role: 'tool'`. Then, we send everything back. The model uses the real data to write a final answer.

<a id="agent-messages"></a>

### Watch the message list grow

The agent builds **a list of messages**. One question adds four records. The `messages.append(...)` lines in the code create these records.

**Example · The messages list** — "How much are the shoes?"

messages = [

**user**"How much are the shoes?"

**assistant (tool request)**→ wants: get_price(item="shoes")

**tool**"₹799"

**assistant (final)**"The shoes are ₹799! Anything else? 🙂"

]

1. **Step 1.** The list starts with the user's question and the tools menu.
2. **Step 2.** The model does not answer yet. It asks to run `get_price` for `shoes`. This is inside `msg.tool_calls`.
3. **Step 3.** Your Python runs `get_price('shoes')`. It appends the result with the `tool` role. The model asks, and your Python works.
4. **Step 4.** You send the longer list back. The model writes an answer using the real price.

This is the agent loop: user → tool request → tool result → answer.

> **🤯 `if msg.tool_calls` is the core check.** The model asked to run `get_price("shoes")` by itself. If you give it ten tools, it can pick among them. Cursor, support bots, and many "AI agent" systems use this same pattern with a bigger toolbox.

<a id="agent-game"></a>

### Quick check: think like the agent

Before you trust the agent, check its rules. Decide if the model should **call the tool or answer directly** for each question. The answers are below.

**Example · Tool or No Tool?** — 5 questions with answers

1. **"How much is the bag?"**
  Correct answer: **Calls the tool.**
  Reason: A price question needs real data. The model calls `get_price('bag')`.
2. **"Hi! How are you today?"**
  Correct answer: **Just answers.**
  Reason: This is small talk. It does not need shop facts.
3. **"Is the hat cheaper than the shorts?"**
  Correct answer: **Calls the tool.**
  Reason: Comparing prices requires real numbers. The model calls the tool twice.
4. **"What's the capital of France?"**
  Correct answer: **Just answers.**
  Reason: This is a trick question. The model knows this. The price tool cannot help.
5. **"I have ₹1500 — can I afford the pants?"**
  Correct answer: **Calls the tool.**
  Reason: It must check the real price before answering. It calls the tool and explains the budget is too low.

The lesson is to ask if the available tool can improve the answer.

> **🎙️ Speaker note.** Use these as class questions. The fourth question shows that a tool should not run if it cannot help.

<a id="project"></a>

## 5. Project: Smart Shop Assistant

<a id="project-build"></a>

### Give the agent a chat loop and run it

- **Block 12** ~25 min · 🏁 THE BUILD

We use the same `agent()` from Block 11. We add a simple chat loop in the terminal:

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

1. **The chat loop.** `input()` reads each message. The loop runs until you type `quit`. We only pass the message today. *Hint:* Keep a `history` list of past turns and pass it into the agent for memory.
2. **One agent turn.** `agent(message)` runs the full loop, and we print its reply.

#### Run it

**bash — your project folder**

```bash
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

This trace shows a sample chat. Watch when the tool line appears and when the assistant answers directly.

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

**How this sample trace was made:** Keyword rules replace the model here. They look for item names and price words. Each item adds one tool call. A missing item adds an 'unknown' tool call. Everything else gets a direct answer.

In this sample, keyword matching replaces the model. In your real `agent.py`, GPT makes the decision. The loop stays the same.

> **Industry spotlight · real agents use this same loop.** Today, the assistant has one tool. Tomorrow, you can add tools for a database, email, and calendar. Then, it can handle tasks like 'find my order, refund it, email the customer.' Production agents use this loop with a bigger toolbox.
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

- **🧭 3 ways to steer**Prompting, RAG, and fine-tuning. You will mostly use prompting.
- **🔗 LangChain**prompt | model | parser. These are chains you can connect.
- **🤖 Agents**LLM + tool + loop. The model decides.
- **🛍️ You shipped**A working tool-using agent.

<a id="next-road"></a>

### The road ahead, still hands-on

1. **More tools (your homework).** Add `check_stock(item)` or `apply_discount(item)`. The agent will pick the right tool.
2. **RAG — chat with your own PDFs.** The next build is a model that answers from *your* documents.
3. **Multi-agent teams.** Several agents can hand work to each other.

> **📚 A note on theory.** We're deliberately deferring the deep "how models are built"
> topics — attention, training, scaling — until you're comfortable building. They'll land as "*oh,
> that's why it works*" instead of abstract lecture.
