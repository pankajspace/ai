import os

BASE_DIR = "/home/pankaj/Workspace/ai/projects/docker/src/info"
os.makedirs(BASE_DIR, exist_ok=True)

TEMPLATE_START = """<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description"
        content="How the {demo} demo works." />
    <link rel="stylesheet" href="../css/style.css" />
    <link rel="stylesheet" href="../css/info.css" />
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
</head>

<body>
    <header>
        <nav class="nav container">
            <a href="../" class="brand">
                <span class="logo">🐳</span>
                <span>Docker Demo Lab</span>
            </a>
            <a href="../" class="back-link">&larr; Go Back</a>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <h1>{hero_title}</h1>
                <p class="subtitle">{hero_subtitle}</p>
            </div>
        </section>

        <section>
            <div class="container info-content">
"""

TEMPLATE_END = """
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2026 TechToday.</p>
        </div>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        // Theme the flowchart to match the site's dark palette.
        mermaid.initialize({
            startOnLoad: true,
            theme: "base",
            themeVariables: {
                background: "#1e1e1e",
                primaryColor: "#2a2a2a",
                primaryTextColor: "#e0e0e0",
                primaryBorderColor: "#90caf9",
                lineColor: "#90caf9",
                secondaryColor: "#2a2a2a",
                tertiaryColor: "#2a2a2a",
                fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif",
                fontSize: "14px",
            },
        });
    </script>
    <script src="../js/info.js"></script>
</body>

</html>
"""

import html

def escape_html(code):
    return html.escape(code)

pages = [
    {
        "filename": "quickbite.html",
        "demo": "QuickBite ETA",
        "title": "How it works — QuickBite ETA · Docker Demo Lab",
        "hero_title": "&#x1F6F5; QuickBite ETA",
        "hero_subtitle": "Level 1 &middot; 1 container",
        "content": """
                <h2>Concept</h2>
                <p>This demo runs a single FastAPI container holding a pre-trained scikit-learn model. The browser sends a POST request to the flask proxy, which forwards it to the <code>quickbite</code> container. The container extracts features, runs <code>model.predict()</code>, and returns the ETA in minutes. There are no external API calls and no API keys required.</p>

                <h2>Request flow</h2>
                <div class="flow-diagram">
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">POST /quickbite/predict</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">app.py</span>
                        <span class="flow-detail">proxy_request</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">QuickBite Container</span>
                        <span class="flow-detail">FastAPI POST /predict</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">model.predict()</span>
                        <span class="flow-detail">returns ETA</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">JSON result</span>
                    </div>
                </div>

                <h2>Code flow</h2>
                <div class="mermaid-wrap">
                    <div class="mermaid">
flowchart TD
    A["Browser"] -->|POST /quickbite/predict| B["app.py<br/>quickbite_predict"]
    B -->|proxy_request| C["quickbite:8000<br/>POST /predict"]
    C -->|features| D["joblib.load('eta_model.pkl')"]
    D -->|eta_minutes| C
    C -->|JSON result| B
    B -->|JSON result| A
                    </div>
                </div>

                <h2>Backend</h2>
                <span class="file-label">Handles predictions using the loaded scikit-learn model.</span>
                <pre><code class="language-python">from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="QuickBite ETA")
model = joblib.load("eta_model.pkl")

class Order(BaseModel):
    distance_km: float
    prep_time_min: float
    rider_available: int
    is_raining: int

@app.post("/predict")
def predict(order: Order):
    X = pd.DataFrame([order.model_dump()])
    eta = round(float(model.predict(X)[0]), 1)
    return {"eta_minutes": eta, "message": f"Your food arrives in {eta} min 🍔"}</code></pre>
"""
    },
    {
        "filename": "scalergpt.html",
        "demo": "ScalerGPT",
        "title": "How it works — ScalerGPT · Docker Demo Lab",
        "hero_title": "&#x1F4DA; ScalerGPT",
        "hero_subtitle": "Level 2 &middot; 2 containers",
        "content": """
                <h2>Concept</h2>
                <p>This demo runs two containers: a FastAPI backend and a ChromaDB vector database. It uses Retrieval-Augmented Generation (RAG). The user's query is first embedded and used to search ChromaDB for relevant notes. The matched notes are stuffed into the prompt, and GPT-4o-mini generates an answer using only that context.</p>

                <h2>Request flow</h2>
                <div class="flow-diagram">
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">POST /scalergpt/ask</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">app.py</span>
                        <span class="flow-detail">proxy</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">ScalerGPT Container</span>
                        <span class="flow-detail">FastAPI /ask</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">ChromaDB Container</span>
                        <span class="flow-detail">query</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">OpenAI API</span>
                        <span class="flow-detail">completion</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">answer</span>
                    </div>
                </div>

                <h2>Code flow</h2>
                <div class="mermaid-wrap">
                    <div class="mermaid">
flowchart TD
    A["Browser"] -->|POST /scalergpt/ask| B["app.py<br/>scalergpt_ask"]
    B -->|proxy_request| C["scalergpt:8000<br/>POST /ask"]
    C -->|query| D["chroma container<br/>collection.query"]
    D -->|relevant chunks| C
    C -->|context + query| E["OpenAI API<br/>gpt-4o-mini"]
    E -->|answer text| C
    C -->|JSON result| B
    B -->|JSON result| A
                    </div>
                </div>

                <h2>Backend</h2>
                <span class="file-label">Retrieves context from ChromaDB and calls OpenAI for RAG.</span>
                <pre><code class="language-python">@app.post("/ask")
def ask(q: Question):
    if collection.count() == 0:
        raise HTTPException(
            status_code=400,
            detail="No documents indexed yet. Run: docker compose exec scalergpt python ingest.py",
        )

    # 1. RETRIEVE - find the most relevant chunks from the vector DB
    hits = collection.query(query_texts=[q.query], n_results=3)
    documents = hits.get("documents") or [[]]
    context = "\\n\\n---\\n\\n".join(documents[0])

    # 2. AUGMENT - stuff that context into the prompt
    system_prompt = (
        "You are ScalerGPT, a helpful teaching assistant. "
        "Answer the user's question using ONLY the context below. "
        "If the context does not contain the answer, say you don't know.\\n\\n"
        f"CONTEXT:\\n{context}"
    )

    # 3. GENERATE - let the LLM write the final answer
    resp = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": q.query},
        ],
    )

    return {
        "question": q.query,
        "answer": resp.choices[0].message.content,
        "sources_used": len(documents[0]),
    }</code></pre>
"""
    },
    {
        "filename": "deskbuddy.html",
        "demo": "DeskBuddy",
        "title": "How it works — DeskBuddy · Docker Demo Lab",
        "hero_title": "&#x1F916; DeskBuddy",
        "hero_subtitle": "Level 3 &middot; 3 containers",
        "content": """
                <h2>Concept</h2>
                <p>A multi-container agentic system with three containers: the <code>deskbuddy-agent</code> (FastAPI + LLM logic), a <code>tools</code> service (for executing functions like calculator/datetime), and <code>redis</code> for conversation memory. The LLM decides when to call a tool, the agent pauses to call the <code>tools</code> service, and the result is fed back into the prompt in a loop until the final answer is reached.</p>

                <h2>Request flow</h2>
                <div class="flow-diagram">
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">POST /deskbuddy/chat</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">app.py</span>
                        <span class="flow-detail">proxy</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">DeskBuddy Agent Container</span>
                        <span class="flow-detail">Chat route</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Redis</span>
                        <span class="flow-detail">load history</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Agent Loop</span>
                        <span class="flow-detail">OpenAI &harr; Tools Container</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Redis</span>
                        <span class="flow-detail">save history</span>
                    </div>
                    <div class="flow-arrow">&rarr;</div>
                    <div class="flow-step">
                        <span class="flow-title">Browser</span>
                        <span class="flow-detail">answer</span>
                    </div>
                </div>

                <h2>Code flow</h2>
                <div class="mermaid-wrap">
                    <div class="mermaid">
flowchart TD
    A["Browser"] -->|POST /deskbuddy/chat| B["app.py<br/>deskbuddy_chat"]
    B -->|proxy_request| C["deskbuddy-agent:9000<br/>POST /chat"]
    C -->|load history| D["Redis<br/>history:session_id"]
    D -->|history| C
    C -->|messages + tools| E["OpenAI API<br/>gpt-4o-mini"]
    E -.->|tool_calls| C
    C -.->|call_tool| F["tools:7000<br/>/calculator or /datetime"]
    F -.->|result| C
    C -.->|append tool result| E
    E -->|final answer| C
    C -->|save history| D
    C -->|answer| B
    B -->|answer| A
                    </div>
                </div>

                <h2>Backend</h2>
                <span class="file-label">Agent loop handling tool calls and Redis memory.</span>
                <pre><code class="language-python">@app.post("/chat")
def chat(req: Chat):
    # --- 1. Load this session's memory from Redis ---------------------------
    key = f"history:{req.session_id}"
    history = [json.loads(m) for m in r.lrange(key, 0, -1)]
    history.append({"role": "user", "content": req.message})

    # --- 2. The agent loop: think -> act -> observe -> repeat ---------------
    msg = None
    for _ in range(5):  # safety fuse: max 5 laps
        resp = llm.chat.completions.create(
            model="gpt-4o-mini",
            messages=history,
            tools=TOOL_DEFS,
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:
            break  # the LLM answered in words - we're done

        # The LLM asked to run one or more tools
        history.append(msg.model_dump(exclude_none=True))
        for tc in msg.tool_calls:
            result = call_tool(tc.function.name, json.loads(tc.function.arguments))
            history.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result),
                }
            )

    # --- 3. Save memory back to Redis and return the answer -----------------
    history.append({"role": "assistant", "content": msg.content})
    r.delete(key)
    for m in history:
        r.rpush(key, json.dumps(m))

    return {"answer": msg.content}</code></pre>
"""
    }
]

for p in pages:
    html_content = TEMPLATE_START.format(title=p["title"], demo=p["demo"], hero_title=p["hero_title"], hero_subtitle=p["hero_subtitle"])
    html_content += p["content"]
    html_content += TEMPLATE_END
    with open(os.path.join(BASE_DIR, p["filename"]), "w") as f:
        f.write(html_content)

print("Pages created successfully!")
