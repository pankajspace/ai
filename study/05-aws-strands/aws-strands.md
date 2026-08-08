[<- README](../../README.md) | [Notes](aws-strands.html)

# AI Infused Learning - 5

# My Notes

This class builds AI agents on AWS using the **Strands Agents SDK** on top of **Amazon Bedrock**. It runs in two modules — Module 1 (concepts + first agents) and Module 2 (tools) — and finishes with a capstone Travel Assistant. Everything runs locally on your laptop and calls models hosted on AWS; you pay only per model call (a fraction of a cent for the whole class).

## 0. AWS setup from zero

Two things must be arranged, nothing else:

1. **Credentials** — so your laptop can talk to AWS.
2. **Model access** — so AWS lets you use the models.

Running code locally is free; you only pay per model call, priced per token. Nothing keeps running in the background, so there's nothing to switch off afterwards.

### 0.1 · Create an access key (browser, once)

Signed in to the AWS console as an admin:

1. Top search bar → type **IAM** → open it.
2. Left menu → **Users** → click your username.
3. Open the **Security credentials** tab.
4. Scroll to **Access keys** → **Create access key**.
5. Use case → **Command Line Interface (CLI)** → tick the box → **Next** → **Create access key**.
6. Copy the **Access key ID** and **Secret access key** now — the secret is shown only once.

Treat the secret like a password: never paste it into chat, screenshots, or a Git repo. `aws configure` stores it locally in `~/.aws/credentials`, which is where it belongs.

### 0.2 · Connect your laptop

```bash
aws configure
# AWS Access Key ID     → paste the key id
# AWS Secret Access Key → paste the secret
# Default region name   → us-east-1
# Default output format → (press Enter, leave blank)
```

Check it worked:

```bash
aws sts get-caller-identity
```

Success prints your `Account`, `UserId`, and `Arn`. If you get `InvalidClientTokenId`, the key is wrong or deactivated — create a fresh one and run `aws configure` again.

### 0.3 · Enable the models in Bedrock

Models are switched off by default. In the console:

1. Top-right region selector → **US East (N. Virginia) · us-east-1**.
2. Search **Bedrock** → open it → left menu → **Model access**.
3. **Modify model access** → tick the models below → submit.

The models to enable:

1. **Amazon Nova Lite** — Module 1 Hello World (cheap, fast).
2. **Claude Haiku 4.5** — Module 1 LangGraph example, Module 2 tools.
3. **Claude Sonnet 4.5** — heavier reasoning; useful later.

Verify from the terminal which Anthropic models are live in your account:

```bash
aws bedrock list-foundation-models --region us-east-1 \
  --query "modelSummaries[?contains(modelId,'anthropic.claude')].modelId" \
  --output table
```

**The single most common error you will hit:** the repo pins older model IDs that AWS has since retired. You'll see `ResourceNotFoundException … model version has reached the end of its life` or `… marked by provider as Legacy`. **The fix is always the same:** list the live models with the command above, pick one, prefix it with `us.`, and swap it into the code. Treat this as a skill worth learning, not as a bug.

### 0.4 · The project folder

All the code ships with the guide, already fixed and ready to run. You can rename the folder to anything — nothing depends on its name.

```text
.
├── GUIDE.html            # this file
├── README.md             # how to run everything
├── config.py             # model IDs — change once, applies everywhere
├── requirements.txt
├── setup.sh / setup.bat
├── 00_check_setup.py     # run this FIRST
├── 01_list_models.py     # use when a model is retired
├── shivank1/             # 2 examples
├── shivank2/             # 9 examples
└── shivank3/             # capstone project
```

### 0.5 · Install the packages

```bash
# macOS / Linux
./setup.sh

# Windows
setup.bat
```

Or manually:

```bash
python3 --version          # must be 3.10 or higher
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

If you're in conda (your prompt shows `(base)`), the venv keeps this project isolated. After activating you should see `(.venv)` at the front of your prompt. In VS Code, also pick the interpreter: `⌘⇧P` → *Python: Select Interpreter* → choose the `.venv` one.

### 0.6 · Run the readiness check

The single most useful command in the whole project. It verifies Python, packages, credentials, region, Bedrock access, **and makes a real model call** — so if it passes, every example will run.

```bash
source .venv/bin/activate
export AWS_DEFAULT_REGION=us-east-1
python 00_check_setup.py
```

Success = six `[ OK ]` lines ending with *"All checks passed."* If anything fails it prints the exact fix. Do not move past this section until `get-caller-identity` returns your account details — setup failures are the number-one reason people abandon hands-on AI work.

## 1. Why agents exist at all

A standard LLM has two hard limits:

1. **Knowledge cutoff** — it only knows what it was trained on. Ask about yesterday's news and it cannot help.
2. **No access to your world** — it cannot read your company database, check today's weather, or send an email.

There are two ways to fix this without retraining the model:

1. **RAG** — adds relevant context fetched from your data. The model becomes a better-informed *knowledge retriever*.
2. **Agents** — add the ability to reason and *use tools*. The model becomes an *actor* that gets things done.

The framing that matters: many teams build a RAG system, then find users want the AI to **actually do the work** — book the meeting, update the record, run the workflow. Moving from passive retriever to active agent is exactly where people get stuck. That is what these two modules fix.

## 2. RAG and how it works

RAG combines an LLM with a search system in three steps:

1. **Retrieve** — search an external knowledge base for information relevant to the question.
2. **Augment** — glue that retrieved context onto the original question to form a richer prompt.
3. **Generate** — the LLM answers using the supplied context.

The flow: `User query → 1·Retrieve (search the data) → 2·Augment (context + query) → 3·Generate (grounded answer) → answer`.

For example: *"Who won the 2024 Nobel Prize in Physics?"* The system queries a real-time news database, finds the fact, adds it to the prompt, and the LLM produces an accurate answer — despite that fact being past its training cutoff.

### The full RAG pipeline

The real system has seven stages, split into indexing (done once) and query time (every question):

**INDEXING (done once, ahead of time):**

1. **Load** — bring in the documents you want to query.
2. **Chunk** — split them into small pieces. Two reasons: models have a limited context window, and it avoids the *lost-in-the-middle* effect where details buried in a long passage get overlooked.
3. **Embed** — convert each chunk into a vector, a numerical representation of its meaning (using an embedding model such as Amazon Titan).
4. **Store** — keep chunks plus vectors in a vector database that supports similarity search. Common examples: Amazon OpenSearch Service, Pinecone, FAISS, Chroma, PostgreSQL with pgvector.

**QUERY TIME (every question):**

5. **Retrieve** — turn the user's question into a vector too, and pull the *top-k* most similar chunks (k = 3, 5, 10…).
6. **Filter & rerank** — optionally re-sort for quality. Improves results but adds cost and complexity (this step is optional).
7. **Generate** — hand the retrieved chunks plus the original question to the LLM, which writes the final answer.

**Analogy that lands:** RAG is an **open-book exam**. The model hasn't memorised the textbook, but you let it flip to the three most relevant pages before answering. Chunking is deciding how big each page is; embedding is the index at the back that tells you which pages to flip to.

## 3. What is an agent?

The word *agent* just means something that performs a task on your behalf. Working definition: **AI agents are autonomous software systems that use AI to reason, plan, and carry out tasks** for humans or other systems. They make decisions, adapt to new information, and act without needing explicit instructions for every step.

What makes them powerful is **iterative thinking** — they evaluate results, adjust, and keep working toward a goal. And they often use RAG *as one part* of that workflow.

**Worked example — the travel planner.** Given *"What should I pack for New York summer?"* the agent does **not** just look one thing up. It:

1. Uses RAG to retrieve historical weather data.
2. Checks a real-time forecast via an API.
3. Analyses user preferences (pack light, but avoid being cold).
4. Synthesises all of it into a personalised recommendation.

That final synthesis — combining three different sources into a judgement — is the decision-making that separates an agent from simple retrieval.

**The one-line distinction to drill:** **RAG answers questions. Agents accomplish goals.** RAG gives the model better information; an agent gives it the ability to act, check the result, and try again.

## 4. From LLMs to multi-agent systems

Think of this as a progression where **each step adds exactly one capability**:

1. **Plain LLM** — answers from training data alone. Knows a lot, can do nothing.
2. **Chatbot** — adds memory of the conversation. Now it can hold a dialogue.
3. **RAG chatbot** — adds retrieval. Now it is grounded in your data and current facts.
4. **Agent** — adds tools + a reasoning loop. Now it can act, check, and retry.
5. **Multi-agent system** — specialised agents cooperating on one goal.

The line to hold on to: memory, then grounding, then action, then teamwork. If you can name what each level adds, you understand the shape of the entire field.

## 5. Agent protocols — MCP and A2A

Once agents need to reach the outside world and each other, you need standard ways to connect. Two protocols matter and are constantly confused with each other.

### MCP — Model Context Protocol

MCP connects an agent to **tools and data**. A server exposes capabilities; a client (your agent) discovers and calls them. Think of it as **USB for AI tools** — plug in a new server, gain new abilities, without changing your agent's code.

The workflow: the agent (MCP client, holds the model and reasoning) asks the server *"what can you do?"*; the server returns a list of tools/resources/prompts; the client then calls them. An MCP server exposes:

1. **Tools** — actions the agent can perform.
2. **Resources** — data the agent can read.
3. **Prompts** — reusable prompt templates.

### A2A — Agent to Agent

A2A connects an agent to **other agents**. Each agent publishes an *agent card* (a small profile: name, skills, how to talk to it) at `/.well-known/agent-card.json`, and other agents read that card and send it messages. An orchestrator agent discovers and messages independent agents (e.g. a weather agent and a flights agent).

### MCP vs A2A, side by side

1. **Connects an agent to…** — MCP: tools, data, prompts. A2A: other agents.
2. **The other side is…** — MCP: a server exposing capabilities. A2A: a peer agent with its own brain.
3. **Discovery via** — MCP: listing tools/resources/prompts. A2A: the agent card.
4. **Analogy** — MCP: USB port for abilities. A2A: colleagues phoning each other.

Module 1 only *introduces* these protocols — building MCP servers and A2A agents is a much larger topic. Learn the vocabulary now, then move on and finish the agent fundamentals first.

## 6. The AWS agentic stack

AWS offers three layers for building agents. Always know which layer you are standing on:

1. **Frameworks · Strands Agents SDK** — where you write agent code (model + tools + prompt). *This masterclass lives here.*
2. **Runtime & services · Bedrock AgentCore, Lambda, ECS** — where agents run in production.
3. **Models · Amazon Bedrock** — the brains: Claude, Nova, and others, served on demand with no servers to manage.

**Amazon Bedrock** is the key one for today: a managed service that hosts foundation models behind a single API. Enabling model access in Section 0 is what makes these models callable from your code.

## 7. The Strands SDK and the agentic loop

Put simply: **Strands has three core components — model, tools, and prompt** — plus an agentic feedback loop.

The loop in plain terms:

1. The agent (the coordinator, holding model + tools + prompt) asks the model.
2. The model reasons, responds, and selects tools ("call tool X").
3. The agent executes those tools; they act on the real world and return a result.
4. Results feed back into the agent, which may re-invoke the model.
5. **This continues until the agent determines the prompt has been fully addressed** — then it compiles everything and returns the final response.

**The sentence that makes agents click:** *"A chatbot answers once. An agent keeps going until the job is done."* The loop **is** the difference. Everything else is detail.

## 8. Building a "Hello World" agent

**How to run every example:** run everything **from the project root** (the folder containing `config.py`), not from inside `shivank1/`. The scripts import shared settings from `config.py`, so running from a subfolder gives `ModuleNotFoundError: No module named 'config'`.

### 8.1 · The simplest possible agent — Strands + Nova Lite

```python
# shivank1/01_hello_world_agent.py
from strands import Agent
from strands.models.bedrock import BedrockModel
from config import NOVA_LITE

# Nova Lite: Amazon's cheapest model — ideal for a first run.
model = BedrockModel(model_id=NOVA_LITE)

agent = Agent(model=model)

response = agent("Hello! Tell me a fun fact about AI agents.")
print(response)
```

```bash
python shivank1/01_hello_world_agent.py
```

**Four lines is a whole agent.** Read each one: choose a model, wrap it in an `Agent`, call the agent like a function, print the answer. There are no tools here yet, so the loop runs exactly once — this is the "before" picture for Module 2.

### 8.2 · Same idea in LangGraph, with a tool

Strands is not the only framework. This version uses LangGraph and adds a small tool, so you can watch the loop actually loop.

```python
# shivank1/02_hello_world_langgraph.py
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.prebuilt import create_react_agent
from config import MODEL_ID


# Define a simple tool
@tool
def greet(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}! Welcome to the world of AI agents."


# Initialize the LLM via Bedrock
llm = init_chat_model(
    MODEL_ID,
    model_provider="bedrock_converse",
)

# Create a ReAct agent with the tool
agent = create_react_agent(model=llm, tools=[greet])

# Run the agent
response = agent.invoke(
    {"messages": [{"role": "user", "content": "Please greet Alice and Bob."}]}
)

# Print every step so you can see the loop
for message in response["messages"]:
    print(f"{message.type}: {message.text}")
```

```bash
python shivank1/02_hello_world_langgraph.py
```

**Expected output — and the moment it clicks:** you'll see five lines: `human:` the request · `ai:` (empty) · `tool:` Hello, Alice! · `tool:` Hello, Bob! · `ai:` a summary. **Stop and unpack this.** The empty `ai:` line is the model *choosing to use a tool instead of answering*. That is the agentic loop, visible in your terminal.

**Note on models:** older tutorials pin `anthropic.claude-3-5-haiku-20241022-v1:0`, which AWS retired. These files already use the current model via `config.py`, so there's nothing to patch. If a model is retired in future, run `python 01_list_models.py`, pick a live one, and change the single line in `config.py` — every example picks it up.

## 9. LLM, agent, and tools — who does what

The cleanest mental model — the division of labour:

1. **The LLM is the brain** — it understands requests, reasons about what needs doing, and decides which tools to use.
2. **Tools are the hands and senses** — they perform actions and gather information from the outside world.
3. **The agent is the coordinator** — it manages the conversation between the LLM and the tools, carrying messages both ways until the task is complete.

### Types of tools

By category:

1. **Data access** — databases, files, search, APIs.
2. **Computation** — calculator, code, data analysis.
3. **Communication** — email, Slack, notifications.
4. **Cloud / systems** — AWS services, internal systems.

By origin:

1. **Pre-built (community)** — import and use, e.g. `strands_tools`.
2. **Custom (yours)** — any Python function + `@tool`.

## 10. From function to tool

The most important idea in this module. Start with an ordinary Python function that checks whether a server is up:

```python
# plain python — the agent cannot use this
import requests

def check_server_status(server_url):
    """Check if a server is responding."""
    try:
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException:
        return "Server is down or unreachable"

# You use it like this:
status = check_server_status("https://staging.myapp.com")
print(status)
# "Server is up. Status code: 200"
```

Ask the agent *"Is the staging server running?"* and it replies that it has no ability to check server status. **The agent cannot magically discover your function.** That's the gap.

The bridge is **function calling** (also called tool use). Add three things:

1. **`@tool` decorator** — tells Strands to make this function available to agents.
2. **Type hints** — tell the agent what data types to expect.
3. **A proper docstring** — describes what it does, so the agent knows *when* to use it.

```python
# shivank2/01_function_to_tool.py
from strands import Agent, tool
import requests

@tool                                              # 1. decorator
def check_server_status(server_url: str) -> str:      # 2. type hints
    """Check if a server is responding by making an HTTP request.

    Args:
        server_url: The URL of the server to check

    Returns:
        A message indicating whether the server is up or down
    """                                           # 3. docstring
    try:
        response = requests.get(server_url, timeout=5)
        return f"Server is up. Status code: {response.status_code}"
    except requests.exceptions.RequestException:
        return "Server is down or unreachable"
```

Give it to the agent:

```python
agent = Agent(tools=[check_server_status])
response = agent("Is the staging server running? Check https://httpbin.org/get")
```

```bash
python shivank2/01_function_to_tool.py
```

**The one thing to take away:** the docstring is **not a comment — it is the user manual the model reads.** The model decides whether to call your tool based on that description alone. Vague docstring, unreliable agent. Deliberately break one: change the docstring to `"Does a thing."` and watch the agent stop calling it. That single experiment teaches more than any amount of reading.

In short: this pattern works for any function. Add `@tool`, give it to your `Agent`, and the agent can now execute it.

## 11. Your first tool-enabled agent — the tip calculator

A practical, self-contained example. Nothing external to configure.

```python
# shivank2/01_function_to_tool.py
from strands import Agent, tool

@tool
def calculate_tip(bill_amount: float, tip_percentage: float, num_people: int = 1) -> dict:
    """Calculate tip and split the bill among people.

    Args:
        bill_amount: Total bill amount in dollars
        tip_percentage: Tip percentage (e.g., 15, 18, 20)
        num_people: Number of people splitting the bill (default: 1)
    """
    tip = bill_amount * (tip_percentage / 100)
    total = bill_amount + tip
    per_person = total / num_people

    return {
        "bill": bill_amount,
        "tip": round(tip, 2),
        "total": round(total, 2),
        "per_person": round(per_person, 2)
    }

agent = Agent(tools=[calculate_tip])

response = agent("The bill is $85. What's a 20% tip, and how much does each person pay if we're splitting it 4 ways?")
print(response.message['content'][0]['text'])
```

The agent understands *intent*, not keywords — all three of these work without any extra code:

```python
# shivank2/02_tip_calculator.py
agent("What's a 15% tip on $42?")
agent("Bill is $120, we want to tip 18%, split between 3 people")
agent("Calculate tip for $67.50 at 20%")
```

```bash
python shivank2/02_tip_calculator.py
```

**Contrast worth drawing:** in traditional chatbot development you'd write regex patterns and intent classifiers to handle those three phrasings, and separately extract the numbers. Here you wrote one function with a clear description and the model did the intent recognition *and* the parameter extraction. That is the leap.

## 12. When one tool isn't enough

The scenario: you ask a sales assistant to *"pull last quarter's sales data and email a summary to the team."* That's not one task — it's three: query the database, analyse the numbers, send an email.

```python
# shivank2/03_multi_tool_sales.py
from strands import Agent, tool

@tool
def get_sales_data(quarter: str) -> dict:
    """Retrieve sales data for a specific quarter."""
    return {"revenue": 1250000, "deals": 47, "quarter": quarter}

@tool
def analyze_sales(revenue: int, deals: int, quarter: str) -> str:
    """Calculate key metrics from sales data."""
    avg_deal = revenue / deals
    return f"Q{quarter}: ${revenue:,} revenue, {deals} deals, ${avg_deal:,.0f} avg deal size"

@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email message."""
    return f"Email sent to {to}"

agent = Agent(tools=[get_sales_data, analyze_sales, send_email])

response = agent("Pull last quarter's sales data and email a summary to the team")
```

The agent plans the order itself: `1·get_sales_data` (revenue, deals) → `2·analyze_sales` (avg deal size) → `3·send_email` (delivers summary).

```bash
python shivank2/03_multi_tool_sales.py
```

You never told the agent the sequence. It recognised it needed data first, then analysis, then delivery — and chained them. **That is planning.**

**Rule of thumb:** build focused, single-purpose tools. Avoid the temptation to create one mega-tool that does everything: it becomes harder to maintain, harder for the agent to reason about, and impossible to reuse. Small tools recombine — the same `analyze_sales` works with data from any source.

## 13. Pre-built community tools

You don't have to write everything. `strands_tools` ships ready-made tools — import and go.

### 13.1 · Calculator

```python
# shivank2/05_prebuilt_tools.py
from strands import Agent
from strands_tools import calculator

agent = Agent(
    tools=[calculator],
    system_prompt="You are a helpful math assistant."
)

agent("What's 42 raised to the power of 9?")
agent("Solve the equation x^2 + 5x + 6 = 0")
agent("What's the derivative of sin(x) * cos(x)?")
```

This also introduces the **system prompt** — standing instructions that shape the agent's behaviour across every request.

```bash
python shivank2/05_prebuilt_tools.py
```

### 13.2 · Combining several pre-built tools

Fetch data from the web, do maths on it, and write a file — one request, three tools.

```python
# shivank2/06_multi_prebuilt_tools.py
import os
from strands import Agent
from strands_tools import http_request, calculator, file_write

agent = Agent(
    tools=[http_request, calculator, file_write],
    system_prompt="You help with data analysis tasks."
)

os.environ["BYPASS_TOOL_CONSENT"] = "true"

agent("""
Fetch stock data from https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=5d,
extract the latest closing prices,
calculate the average price over the period,
and save the results to stock_summary.txt
""")
```

```bash
python shivank2/06_multi_prebuilt_tools.py
```

**`BYPASS_TOOL_CONSENT` explained:** some tools are sensitive — they write files or touch cloud resources — so Strands **pauses and asks permission** before running them. Setting `BYPASS_TOOL_CONSENT="true"` turns that prompt off so the cell runs unattended. It's a real safety feature: in production you often *want* a human approving actions. If a cell seems to hang with `[*]`, it's waiting for your `y` at a hidden prompt.

## 14. AWS integration with `use_aws`

One tool, many services. `use_aws` translates plain English into AWS API calls.

```python
# shivank2/07_use_aws.py
from strands import Agent
from strands_tools import use_aws

agent = Agent(
    tools=[use_aws],
    system_prompt="You are an AWS assistant that helps manage cloud resources."
)

agent("List all S3 buckets in my account")
```

The same single tool handles completely different services:

```python
# one tool, three services
# DynamoDB
agent("Look up customer ID 12345 in the DynamoDB customers table and update their email to newemail@example.com")

# Lambda
agent("Invoke the Lambda function 'order-processor' with order ID 67890")
```

These examples assume the AWS resources already exist in your account. While learning, **stick to the S3 listing example** — it works on any account, even an empty one (an empty list is a valid result, not an error).

```bash
python shivank2/07_use_aws.py
```

You described what you wanted in plain English, and the agent figured out the AWS API calls. **You didn't write boto3 code, didn't handle AWS responses, and didn't even specify which operation to use.**

**Handle with care:** `use_aws` can *modify* real resources. Stick to read-only requests ("list", "describe") while you learn, and always work in a sandbox account, never production. This is exactly why the consent prompt exists — read it before you type `y`.

## 15. Building custom tools

When community tools don't fit — an internal API, a proprietary database, something new — you write your own. Example: an online store checking inventory.

```python
# shivank2/04_custom_tool_inventory.py
from strands import Agent, tool

@tool
def check_inventory(product_id: str) -> str:
    """Check if a product is in stock.

    Args:
        product_id: The product ID to check (e.g., "PROD-123")
    """
    # This is where you'd query your actual database
    inventory = {
        "PROD-123": 15,
        "PROD-456": 0,
        "PROD-789": 8
    }

    quantity = inventory.get(product_id, 0)

    if quantity > 0:
        return f"Product {product_id} is in stock. We have {quantity} units available."
    else:
        return f"Product {product_id} is currently out of stock."

agent = Agent(tools=[check_inventory])

# All of these work — the agent understands intent, not just keywords
agent("Is PROD-123 in stock?")
agent("Do we have PROD-456 available?")
agent("Check inventory for PROD-789")
agent("Can I order PROD-123 right now?")
```

```bash
python shivank2/04_custom_tool_inventory.py
```

Note the mock dictionary: in production you'd replace it with real database queries or an API call. The *agent-facing* part — decorator, type hints, docstring — stays identical either way.

**Exercise — pick one:** build a tool for a problem you actually care about. Ideas: check the weather in your city (call a weather API) · validate email format · calculate age from birthdate · calculate BMI · calculate shipping costs from weight and distance. Don't worry if the logic is simple — what matters is seeing how a custom tool fits into the agent workflow.

## 16. When simple tools aren't enough

Three scenarios where the plain `@tool` approach strains. Learn these as *"recognise it when it happens"*, not as something to memorise.

### 16.1 · The database connection problem → class-based tools

The story: your agent has five tools, each opening its own database connection. Your DBA messages: *"Why is your agent opening 50 database connections per minute?"* Each tool call opens and closes a connection; multiply by concurrent users and the database drowns.

**The fix:** group related tools in a class so they share one connection.

```python
# shivank2/08_class_based_tools.py
from strands import Agent, tool

class InventoryTools:
    def __init__(self):
        # Shared resource: all tools access the same data store.
        # In production: self.db = connect_to_database()
        self.products = {
            "PROD-123": {"name": "Wireless Mouse", "quantity": 15, "price": 29.99},
            "PROD-456": {"name": "USB-C Hub", "quantity": 0, "price": 49.99},
            "PROD-789": {"name": "Mechanical Keyboard", "quantity": 8, "price": 89.99},
        }

    @tool
    def check_stock(self, product_id: str) -> str:
        """Check product stock level.

        Args:
            product_id: The product ID to check
        """
        product = self.products.get(product_id)
        if not product:
            return f"Product {product_id} not found"
        return f"{product['name']}: {product['quantity']} units at ${product['price']}"

    @tool
    def update_stock(self, product_id: str, quantity: int) -> str:
        """Update product stock quantity.

        Args:
            product_id: The product ID to update
            quantity: New quantity to set
        """
        if product_id in self.products:
            self.products[product_id]["quantity"] = quantity
            return f"Updated {product_id} to {quantity} units"
        return f"Product {product_id} not found"

# One instance, shared state, multiple tools
inventory = InventoryTools()
agent = Agent(tools=[inventory.check_stock, inventory.update_stock])

agent("Check stock for PROD-123")
agent("Update PROD-456 stock to 25 units, then confirm the new level")
```

```bash
python shivank2/08_class_based_tools.py
```

The key line is `inventory = InventoryTools()` followed by passing the *bound methods* `inventory.check_stock` and `inventory.update_stock` as tools — both share the single instance's state (`self.products`), so in production they'd share one database connection instead of opening one per call.

### 16.2 · Slow sequential calls → async tools

If three warehouse lookups take 2 seconds each, doing them one after another costs 6 seconds. Make the tool `async` and they run in parallel.

```python
# shivank2/09_async_tools.py
import asyncio
import time
from strands import Agent, tool

@tool
async def check_warehouse_inventory(product_id: str, warehouse: str) -> dict:
    """Check inventory at a specific warehouse.

    Args:
        product_id: Product ID to check
        warehouse: Warehouse identifier (e.g., "east", "west", "central")
    """
    # Simulate API call delay
    await asyncio.sleep(2)

    data = {
        "east":    {"PROD-123": 45, "PROD-456": 12},
        "west":    {"PROD-123": 30, "PROD-456": 0},
        "central": {"PROD-123": 60, "PROD-456": 25},
    }

    quantity = data.get(warehouse, {}).get(product_id, 0)
    return {
        "warehouse": warehouse,
        "product_id": product_id,
        "quantity": quantity
    }

async def main():
    agent = Agent(tools=[check_warehouse_inventory])
    start = time.time()
    response = await agent.invoke_async(
        "Can we ship 100 units of PROD-123? Check all warehouses: east, west, and central."
    )
    elapsed = time.time() - start
    print(response.message['content'][0]['text'])
    print(f"\nTotal time: {elapsed:.1f}s (sequential would be ~6s)")

await main()
```

```bash
python shivank2/09_async_tools.py
```

**Great demo moment:** the printed timing is the lesson — roughly 2 seconds instead of 6. Run it yourself and you *see* concurrency instead of just reading about it. The key call is `agent.invoke_async(...)`, the async counterpart to calling the agent directly. (The bare `await main()` works in a Jupyter cell; in a plain script use `asyncio.run(main())`.)

## 17. Capstone project — build a Travel Assistant Agent

This project deliberately mirrors the travel planner from Section 3, so you finish where Module 1 began — except this time you build it yourself. It exercises every skill: custom tools, multiple tools, a pre-built tool, a system prompt, and the agentic loop.

### The brief

Build an agent that answers: *"I'm going to Goa for 3 days next week with a budget of ₹20,000. What should I pack and what will it cost?"* — and actually reasons across weather, packing, and budget.

The four tools:

1. `get_weather_forecast` — return conditions for a city and date range (custom tool, mock data).
2. `suggest_packing_list` — turn weather + trip length into a packing list (a tool that consumes another tool's output).
3. `estimate_trip_cost` — rough cost from city, days, travellers (numeric logic + dict return).
4. `calculator` — budget maths (pre-built community tool).

### Starter code

```python
# shivank3/travel_assistant.py
"""Capstone: Travel Assistant Agent (Modules 1 & 2)."""

from strands import Agent, tool
from strands.models.bedrock import BedrockModel
from strands_tools import calculator


@tool
def get_weather_forecast(city: str, days: int) -> dict:
    """Get the weather forecast for a city over a number of days.

    Args:
        city: Destination city name (e.g., "Goa", "Bangalore")
        days: Number of days in the trip
    """
    # Mock data — replace with a real weather API to go further
    forecasts = {
        "goa":       {"high_c": 32, "low_c": 26, "conditions": "humid, occasional showers"},
        "bangalore": {"high_c": 27, "low_c": 18, "conditions": "mild, light evening rain"},
        "jaipur":    {"high_c": 38, "low_c": 25, "conditions": "hot and dry"},
        "manali":    {"high_c": 14, "low_c": 3,  "conditions": "cold, chance of snow"},
    }
    data = forecasts.get(city.lower(), {"high_c": 28, "low_c": 20, "conditions": "moderate"})
    return {"city": city, "days": days, **data}


@tool
def suggest_packing_list(high_c: int, low_c: int, days: int, conditions: str) -> list:
    """Suggest what to pack based on temperatures, trip length and conditions.

    Args:
        high_c: Daytime high in Celsius
        low_c: Night-time low in Celsius
        days: Number of days in the trip
        conditions: Short description of expected weather
    """
    items = [f"{days + 1} sets of clothes", "toiletries", "phone charger"]

    if high_c >= 30:
        items += ["light cotton clothing", "sunscreen", "sunglasses", "reusable water bottle"]
    if low_c <= 15:
        items += ["warm jacket", "thermal layer"]
    elif low_c <= 22:
        items += ["light jacket for evenings"]
    if "rain" in conditions.lower() or "shower" in conditions.lower():
        items += ["compact umbrella", "quick-dry footwear"]
    if "snow" in conditions.lower():
        items += ["gloves", "woollen cap", "waterproof boots"]

    return items


@tool
def estimate_trip_cost(city: str, days: int, travellers: int = 1) -> dict:
    """Estimate the cost of a trip in Indian rupees.

    Args:
        city: Destination city
        days: Number of days
        travellers: Number of people travelling (default: 1)
    """
    per_night = {"goa": 3500, "bangalore": 3000, "jaipur": 2500, "manali": 2800}
    stay = per_night.get(city.lower(), 3000) * days
    food = 1200 * days * travellers
    local_travel = 800 * days
    total = stay + food + local_travel

    return {
        "city": city,
        "days": days,
        "travellers": travellers,
        "stay_inr": stay,
        "food_inr": food,
        "local_travel_inr": local_travel,
        "total_inr": total,
    }


model = BedrockModel(model_id="us.anthropic.claude-haiku-4-5-20251001-v1:0")

agent = Agent(
    model=model,
    tools=[get_weather_forecast, suggest_packing_list, estimate_trip_cost, calculator],
    system_prompt=(
        "You are a practical travel assistant. "
        "When asked about a trip: check the weather first, then suggest what to pack "
        "based on that weather, then estimate the cost. "
        "Always say whether the trip fits the user's budget, and keep advice concise."
    ),
)

if __name__ == "__main__":
    response = agent(
        "I'm going to Goa for 3 days with 2 friends. My budget is 20000 rupees. "
        "What should I pack, and does it fit my budget?"
    )
    print(response)
```

```bash
python shivank3/travel_assistant.py

# or ask your own question:
python shivank3/travel_assistant.py "I'm going to Manali for 4 days, budget 15000"
```

### What to observe together

The agent calls `get_weather_forecast` **first**, then feeds those numbers into `suggest_packing_list`, then prices the trip and compares against the budget. Nobody wrote that sequence — the agentic loop worked it out. That is the Strands loop running in your own terminal.

### Extension challenges

1. **Easy** — add a `get_visa_requirements(country)` tool and ask about an international trip.
2. **Medium** — replace the mock weather with a real API call using `requests` (the pattern from Section 10).
3. **Medium** — regroup the three tools into a `TravelTools` class with shared state (Section 16.1).
4. **Harder** — make the weather and cost lookups `async` so a multi-city comparison runs in parallel (Section 16.2).
5. **Harder** — add `file_write` from `strands_tools` and have the agent save an itinerary to disk.

**How to know you've really got it:** you understand these two modules if you can (1) explain why the docstring matters, (2) add a fourth tool without help, (3) predict which tools the agent will call for a given question, and (4) debug a retired-model error on your own.

## 18. Every command in one place

Copy-paste reference. Run all of these from the project root — the folder containing `config.py`.

### Setup (once)

```bash
./setup.sh                       # macOS / Linux  (Windows: setup.bat)
source .venv/bin/activate
export AWS_DEFAULT_REGION=us-east-1
python 00_check_setup.py         # verifies everything, makes a real model call
```

### Every example, in learning order

```bash
# ---- Module 1 · first agents ----
python shivank1/01_hello_world_agent.py        # simplest agent, no tools
python shivank1/02_hello_world_langgraph.py    # with a tool — watch the loop

# ---- Module 2 · tools ----
python shivank2/01_function_to_tool.py         # THE core idea: @tool
python shivank2/02_tip_calculator.py           # first useful tool agent
python shivank2/03_multi_tool_sales.py         # 3 tools, agent picks the order
python shivank2/04_custom_tool_inventory.py    # build your own tool
python shivank2/05_prebuilt_tools.py           # community tools + system prompt
python shivank2/06_multi_prebuilt_tools.py     # combining several tools
python shivank2/07_use_aws.py                  # one tool, many AWS services
python shivank2/08_class_based_tools.py        # shared-resource pattern
python shivank2/09_async_tools.py              # parallel tools: 2s not 6s

# ---- Module 3 · capstone ----
python shivank3/travel_assistant.py
```

### Helpers

```bash
python 00_check_setup.py     # run whenever something breaks
python 01_list_models.py     # when a model is retired, pick a new one
aws sts get-caller-identity  # are my credentials alive?
env | grep AWS               # what credentials are actually set?
```

### Suggested 3-hour study plan

1. **0:00–0:20** — AWS setup (Section 0). Do not skip. Run `python 00_check_setup.py` and wait for all six OK lines.
2. **0:20–0:50** — Concepts: RAG → agents → the loop. Keep moving; you'll revisit them.
3. **0:50–1:15** — Hello World agents. Both files. Unpack the tool-call output line by line.
4. **1:15–1:25** — Break.
5. **1:25–2:00** — Function → tool → tip calculator. Do the docstring experiment here.
6. **2:00–2:30** — Multi-tool + pre-built + `use_aws`. Read-only AWS calls only.
7. **2:30–3:00** — Capstone project. Build the skeleton now, finish it in your own time.

### Troubleshooting — keep this open while you work

1. `ResourceNotFoundException … end of its life` / `marked by provider as Legacy` — retired model. Run `python 01_list_models.py`, pick a live one, change `MODEL_ID` in `config.py`.
2. `AccessDeniedException` — model not enabled in Bedrock → Model access, or wrong region. Check both.
3. `InvalidClientTokenId` — credentials stale or deleted. Create a new access key and re-run `aws configure`.
4. `ModuleNotFoundError: No module named 'strands'` — wrong Python. Activate the venv; in Jupyter, switch the kernel.
5. Notebook cell stuck on `[*]` — a tool is waiting for consent. Type `y` at the hidden prompt, or set `BYPASS_TOOL_CONSENT="true"` in an earlier cell.
6. Terminal shows `quote>` or `:` and seems frozen — `quote>` = unclosed quote, press Ctrl+C. `:` = the AWS CLI pager, press `q`. Set `export AWS_PAGER=""` to stop it.
7. Agent ignores your tool — weak docstring or missing type hints. Rewrite the description to say plainly when it should be used.
8. `ModuleNotFoundError: No module named 'config'` — you ran from inside a subfolder. Run from the project root.
9. Worked yesterday, fails today — almost always expired SSO credentials. Paste a fresh block, then `python 00_check_setup.py`.

### The five sentences to remember

1. RAG gives a model better *information*; tools give it the ability to *act*.
2. An agent is a loop: reason → call a tool → read the result → repeat until done.
3. A tool is just a Python function plus a decorator, type hints, and a good docstring.
4. The docstring is the model's user manual — write it for the model, not for yourself.
5. Build small, single-purpose tools; the agent handles the sequencing.

