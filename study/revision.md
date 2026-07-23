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
    "type": "function", # ①
    "function": {
        "name": "get_price", # ②
        "description": "Get the price of a shop item the user asks about.", # ③
        "parameters": {
            "type": "object",
            "properties": {"item": {"type": "string", "description": "the item name"}},
            "required": ["item"],
        },
    },
}]

def agent(user_message):
    messages = [{"role": "user", "content": user_message}]

    # STEP 4: Send message + tools menu
    response = client.chat.completions.create(model="gpt-4o-mini", messages=messages, tools=tools)
    msg = response.choices[0].message

    # STEP 5: Check if it asked for a tool
    if msg.tool_calls: # did it ask for a tool?

        # add the tool REQUEST first — required: every "tool" result must follow the assistant message that asked for it (matched by tool_call_id), or the API rejects the next call for context
        messages.append(msg)

        for call in msg.tool_calls:
            # The model’s arguments arrive as a JSON string, e.g. '{"item": "shoes"}' — parse it into a Python dict so we can read args["item"]
            args = json.loads(call.function.arguments)

            # STEP 5.1: run the real Python function — the model never runs code itself, it *asks*, and your Python *does*
            result = get_price(args["item"])

            # STEP 5.2: add the tool's result to the conversation
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

        # STEP 5.3: Create response for the agent with tool's result.
        response = client.chat.completions.create(model="gpt-4o-mini", messages=messages)

        # STEP 5.4: Get the final answer.
        msg = response.choices[0].message

    # STEP 5.5: Return the final answer.
    return msg.content

# STEP 6: Test the agent.
print(agent("How much are the shoes?")) # → tool fires → "₹799"
print(agent("Hi! What can you help with?")) # → no tool → just chats
```