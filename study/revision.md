[<- README](../../README.md)

# Revision AI Infused Learning

## Basic chat with model
1. Initialize the OpenAI client
2. Call the chat completions endpoint
3. Extract and print the response

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
1. Prompt with placeholders
2. Model - using the same model from Class 1, wrapped for LangChain
3. Chain - using the pipe (|) operator
4. Adding Memory / History - list of messages
5. Invoke the chain with history and the new question
6. Prints the final response.

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
1. Initialize the OpenAI client
2. Define single tool
3. Define tools menu for the model
4. Create agent function
5. Check if it asked for a tool
6. Loop over tools
7. Run the real Python function — the model never runs code itself, it *asks*, and your Python *does*
8. Prints the final answer.

```python
# This is for parsing JSON from strings
import json
# This is the OpenAI API
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
1. Initialize the OpenAI client
2. Define two tools
3. Define tools menu for the model
4. Create agent function
5. Check if it asked for a tool
6. Loop over tools for each function call
7. Run the real Python function — the model never runs code itself, it *asks*, and your Python *does*
8. Prints the final answer.

```python
# This is for parsing JSON from strings
import json
# This is the OpenAI API
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

        # STEP 6: Loop over tools for each function call
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

## RAG + LangChain
1. Load documents
2. Split documents into chunks
3. Pick an embedding model (free, runs locally, no API key)
4. Build the vector store from chunks + embeddings (saves to disk)
5. Initialize the LLM model
6. Define the RAG prompt template
7. Define the RAG function 
    - search chunks from vector store
    - join the chunks
    - create RAG chain
    - invoke chain for the answer
8. Print the final answer.

```python
# This is a splitter used to split the text into chunks
from langchain_text_splitters import RecursiveCharacterTextSplitter
# This is a model used to generate embeddings
from langchain_huggingface import HuggingFaceEmbeddings
# This is a vector database used to store embeddings
from langchain_chroma import Chroma
# This is an LLM model from OpenAI used for RAG 
from langchain_openai import ChatOpenAI
# This is a chat template for RAG
from langchain_core.prompts import ChatPromptTemplate

# STEP 1: Load the documents (any text — for now, hardcoded)
docs = [
    "Our return policy allows refunds within 30 days of purchase.",
    "Shipping is free for orders above ₹999 across India.",
    "For corporate orders above 50 units, contact sales@example.com.",
    "Our office is in Indiranagar, Bangalore. Open Mon-Fri 10am-7pm.",
]

# STEP 2: Split the documents into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.create_documents(docs)

# STEP 3: Pick an embedding model (free, runs locally, no API key)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# STEP 4: Build the vector store from chunks + embeddings (saves to disk)
db = Chroma.from_documents(chunks, embedder, persist_directory="./chroma_db")

# Print the number of chunks indexed
print(f"Indexed {len(chunks)} chunks 🎉")

# STEP 5: Initialize the LLM model
model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# STEP 6: Define the RAG prompt: instructions + chunks + question
prompt = ChatPromptTemplate.from_template("""
Answer the question using ONLY the context below. If the context doesn't contain
the answer, say "I don't know." Be concise and quote facts directly.

Context: {context}

Question: {question}
""")

# STEP 7: Define the RAG function
def rag_answer(question):
    chunks = db.similarity_search(question, k=3) # Retrieve top 3 chunks
    context = "\n\n".join(c.page_content for c in chunks) # Join the chunks
    chain = prompt | model # Build the RAG chain
    return chain.invoke({"context": context, "question": question}).content # Invoke the chain

# STEP 8: Print the final answer.
print(rag_answer("How long do I have to return something?"))
# → "30 days from the purchase date."  ✅ from your data, not a guess
```