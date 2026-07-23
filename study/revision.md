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