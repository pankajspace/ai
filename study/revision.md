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