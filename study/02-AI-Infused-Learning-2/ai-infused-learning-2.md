[<- README](../../README.md) | [Notes](ai-infused-learning-2.html)

# AI Infused Learning - 2

# Links
1. [Class 2 Notes](https://scaler-content.github.io/class-2-AI-engg/)

# My Notes


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
