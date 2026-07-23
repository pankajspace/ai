[<- README](../../README.md)

# Revision AI Infused Learning

## Basic chat with model

```python
from openai import OpenAI

# STEP 1: Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Alternatively, point the SAME client at Groq instead of OpenAI 👇
# client = OpenAI(
#     api_key=GROQ_API_KEY,
#     base_url="https://api.groq.com/openai/v1",
# )

# STEP 2: Call the chat completions endpoint
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a witty travel guide."},
        {"role": "user",   "content": "Suggest one thing to do in Bangalore."},
    ],
)

# STEP 3: Extract and print the response
print(response.choices[0].message.content)
```

## Langchain + Memory

```python
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

## Agent with one tool

```python
import json
from openai import OpenAI

# STEP 1: Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# STEP 2: Define single tool
def get_price(item):
    PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}
    print(f"🔧 tool called: get_price({item})")     # so you SEE it happen
    return f"₹{PRICES.get(item.lower(), 'unknown')}"

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

## Agent with multiple tools

```python
import json
from openai import OpenAI

# STEP 1: Initialize the OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# STEP 2: Define two tools
def get_price(item):
    PRICES = {"shoes": 799, "hat": 399, "bag": 1420, "shorts": 1299, "pants": 1699}
    print(f"🔧 tool called: get_price({item})")     # so you SEE it happen
    return f"₹{PRICES.get(item.lower(), 'unknown')}"

def get_category(item):
    """Classifies an item into one of three categories."""
    item_lower = item.lower()
    if item_lower in ["shoes", "hat", "bag"]:
        return f"The category of {item} is Accessories."
    elif item_lower in ["shorts", "pants"]:
        return f"The category of {item} is Clothing."
    else:
        return "This item does not belong to any of the three categories."

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
}, {
    "type": "function",
    "function": {
        "name": "get_category",
        "description": "Classifies an item into one of three categories.",
        "parameters": {
            "type": "object",
            "properties": {"item": {"type": "string", "description": "the item name"}},
            "required": ["item"],
        },
    },
}]

# STEP 3.1: Create a dictionary of tool functions
TOOL_NAMES = {"get_price", "get_category"}

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
            fn_name = call.function.name

            # The model’s arguments arrive as a JSON string, e.g. '{"item": "shoes"}' — parse it into a Python dict so we can read args["item"]
            args = json.loads(call.function.arguments)

            # get tool function
            fn = TOOL_NAMES.get(fn_name)

            # STEP 7: run the real Python function — the model never runs code itself, it *asks*, and your Python *does*
            result = fn(args["item"]) if fn else f"Unknown tool: {fn_name}"

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