[<- README](../../README.md) | [Notes](ai_engineering_class1.html)

# AI Infused Learning - 1

# Links
1. [Class 1 Notes](https://22f1001418.github.io/AI-engg-scripts-SL/)

# My Notes

## Temperature
    Temperature is a sampling setting that controls how random a model's output is. A temperature close to 0 makes the output more deterministic by strongly favoring the highest-probability next token, while a higher temperature increases variety by making lower-probability tokens more likely to be chosen.
## Foundation Models
    Foundation models are large pre-trained models trained on broad and diverse datasets. They learn general-purpose patterns that allow them to perform many different tasks and can often be adapted further through prompting or fine-tuning.
## Multimodal Models
    Multimodal models can understand, combine, and sometimes generate more than one type of data, such as text, images, audio, or video. This allows them to reason across different input and output formats in a single system.

# Quick Review of Concepts

1. **Why AI Exploded Now** — AI is ~70 years old, but the 2017 Transformer and 2022 ChatGPT made it usable by everyone; the two big shifts are general-purpose models and a collapsed barrier to entry (you use models via API instead of building them).
2. **LLM (Large Language Model)** — At its core it is "super-autocomplete": it predicts the next chunk of text, and all abilities (chat, code, summaries) emerge from that single trick.
3. **Tokens** — Models read, think, and bill in tokens (sub-word pieces, ~¾ of a word), a sweet spot between whole-word and single-letter vocabularies that can represent any word in any language.
4. **Next-Token Prediction** — The model scores every possible next token, picks one, appends it, and repeats; that loop is how text is generated.
5. **Temperature** — The creativity dial: low (near 0) gives focused, repeatable output; high adds variety and surprise.
6. **No Memory & Context Window** — An LLM forgets everything between calls, so all needed context must be re-sent each time within a limited token budget (the context window).
7. **Self-Supervision** — Models learn by playing fill-in-the-blank on internet text (the answer is already in the text), so no human labeling is needed; understanding emerges as a side-effect.
8. **Hallucinations** — Because it predicts plausible text, an LLM can produce confident but wrong answers, so outputs must be verified and grounded.
9. **Foundation Models** — Large, broadly pre-trained general-purpose models adaptable to many tasks via prompting or fine-tuning.
10. **Multimodal Models** — Models that handle multiple data types (text, images, audio, video) as inputs and outputs in a single system.
11. **8 AI Use Cases** — Most AI products fall into: coding, writing, image/video, education, chatbots, info aggregation, data organization, and workflow/agents.
12. **AI Engineering** — Building real products on top of pre-trained models; "you build the car, not the engine," distinct from ML engineers (build the engine) and software engineers (build the road).
13. **API Call & Roles** — Calling an LLM uses three message roles: `system` (personality/rules), `user` (the request), and `assistant` (the reply).
14. **API Keys & `.env`** — Keys are secret passwords to your wallet; store them in a `.env` file (git-ignored), never in shared code.
15. **Model Swappability** — Because providers share the OpenAI-style interface, you can switch brains (OpenAI, Groq/Llama, Ollama local) by changing just the key, base URL, and model name.
16. **Web Scraping** — Non-AI step to fetch a page's readable text (e.g., requests + BeautifulSoup), treated as a black box that turns a URL into a string.
17. **Prompt Engineering** — Changing the system prompt (e.g., "snarky" or "explain to a 10-year-old") reshapes app behavior without changing code.
18. **Gradio** — A library that turns a Python function into a shareable web app in a few lines, with an optional public link.
19. **LLM Arena & Voting** — Sending one prompt to two models and voting on the better answer; blind side-by-side votes are how models are ranked and selected.
20. **LangChain** — A framework for bigger apps, adding reusable prompts, multi-step pipelines, memory, and connectors on top of raw API calls.
21. **RAG (Retrieval-Augmented Generation)** — "Chat with your own data": retrieve relevant document snippets and inject them into the prompt so answers come from your data and hallucinations are reduced.
22. **Agents (ReAct)** — An LLM given tools and a loop that thinks, acts, observes the result, and repeats until done — the jump from chatbot to autonomous action.
23. **Multi-Agent Systems** — Splitting work across specialized agents (e.g., manager, researcher, writer, editor) that hand off to each other to solve larger problems.
