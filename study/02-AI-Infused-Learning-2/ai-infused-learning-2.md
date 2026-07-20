[<- README](../../README.md) | [Notes](ai-infused-learning-2.html)

# AI Infused Learning - 2

# Links
1. [Class 2 Notes](https://scaler-content.github.io/class-2-AI-engg/)

# My Notes

# Quick Review of Concepts
1. **Three Ways to Steer a Model** — Prompting (telling the model clearly what you want), RAG (feeding it your own documents at question-time), and Fine-tuning (retraining on examples). Prompting covers ~90% of real work; RAG and fine-tuning are for when prompting isn't enough.
2. **LangChain** — A Python library that provides pre-built "plumbing" (reusable prompts, multi-step pipelines, memory) so you don't rebuild the same wiring around raw OpenAI calls every time.
3. **ChatPromptTemplate** — A reusable prompt with `{blanks}` you fill in later, like a mail-merge template. Created with `ChatPromptTemplate.from_template(...)` or `.from_messages(...)`.
4. **ChatOpenAI** — The same GPT model from a raw OpenAI call, wrapped in a LangChain-compatible interface so it can snap onto other LangChain pieces. Same `model=` and `temperature=` params.
5. **StrOutputParser** — Unwraps the model's `AIMessage` package (which contains text + metadata like token counts) and returns just the plain-text string you actually want.
6. **Chains (the Pipe Operator `|`)** — Joining prompt, model, and parser with `|` (read as "then") creates a chain: `prompt | model | parser`. Data flows left-to-right; `chain.invoke({...})` runs it.
7. **Memory / MessagesPlaceholder** — LLMs are stateless; they forget between calls. "Memory" is simply re-sending past messages each time. `MessagesPlaceholder("history")` reserves a slot in the prompt for that conversation history list.
8. **HumanMessage / AIMessage** — LangChain's Python objects for labelling chat turns ("the human said X", "the AI replied Y"), equivalent to the `user` / `assistant` roles from the raw API.
9. **Agents (LLM + Tool + Loop)** — An agent is a model given one or more tools and the freedom to decide on its own when to call them. The key difference from a chatbot: nobody hard-codes when the tool fires — the model chooses.
10. **Tools** — Any Python function can become a tool. You describe it to the model via a JSON "menu card" (name, description, parameters) so the model knows the tool exists and when to invoke it.
11. **Tool Description as Prompt Engineering** — The `description` field in the tool spec is read by the model to decide whether to call the tool. A vague description leads to misuse; a clear one guides correct behavior.
12. **The Agent Loop** — Send user message + tools menu → model replies (possibly requesting a tool call via `msg.tool_calls`) → your code runs the function → append the result with `role: "tool"` → send everything back → model writes a final answer using real data.
13. **The `tool` Role** — A third message role (alongside `system`, `user`, `assistant`) used to feed tool results back into the conversation so the model can incorporate real data into its answer.
14. **Gradio ChatInterface** — A ready-made chat UI (bubbles, input box, send button) that wraps any Python function. `share=True` generates a public URL, turning a local agent into a shareable app.

