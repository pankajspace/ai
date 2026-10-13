---
description: "Add a new AI backend service to the ai-projects multi-container application: creates the self-contained service module under server/services/, registers the endpoint in FastAPI main.py, adds a matching interactive demo card in React client/src/App.tsx, and updates environment variables and documentation."
name: "add-ai-service"
argument-hint: "serviceName (e.g. chat_groq, summarize_text), model/provider (e.g. Groq llama-3.3, Anthropic claude-3-5), input prompt or feature logic"
---

# Add AI Service to ai-projects

This skill guides the end-to-end integration of a new AI service into the `projects/ai-projects` full-stack multi-container application.

## Overview & Architecture Rules

1. **Self-contained Service Files**:
   - Each service is a single, self-contained Python module inside `projects/ai-projects/server/services/<service_name>.py` (use snake_case, e.g. `chat_groq.py`, `summarizer.py`).
   - Do NOT create nested subdirectories or `__init__.py` files for individual services.
   - The service file must contain:
     - `from dotenv import find_dotenv, load_dotenv; load_dotenv(find_dotenv())`
     - Pydantic models: `<Feature>Request` and `<Feature>Response`
     - The business/model execution function: `get_<feature>(input_val: str) -> str`
     - Standalone runnable block: `if __name__ == "__main__": ...`

2. **Single Environment Source of Truth**:
   - All `.env` variables live solely at the project root: `projects/ai-projects/.env` and `projects/ai-projects/.env.example`.
   - Never create duplicate `.env` files inside `server/` or `client/`.

3. **FastAPI Application Wiring**:
   - Routes are registered in `projects/ai-projects/server/main.py`.
   - Directly import schemas and the handler:
     `from services.<service_name> import <Feature>Request, <Feature>Response, get_<feature>`
   - Expose endpoint under `/api/<feature>` with status codes and clean exception handling.

4. **Consistent UI Tile in React Client**:
   - Each service tile is a standalone React component inside `projects/ai-projects/client/src/components/<Feature>Card.tsx`.
   - Re-exported from `projects/ai-projects/client/src/components/index.ts` and mounted inside `projects/ai-projects/client/src/App.tsx`.
   - Every service is displayed as a standard half-width card: `<div className="card card-half">`.
   - Must include:
     - Title with emoji and a provider badge (e.g. `<span className="badge badge-healthy">Groq</span>`).
     - Brief explanatory subtitle.
     - Input control (text input or select).
     - Preset chips row (`.preset-row` / `.preset-chip`) for fast 1-click testing.
     - Action button with loading spinner (`.spinner`).
     - Result container (`.result.visible`) to display outputs cleanly.

---

## Step-by-Step Workflow

### Step 1: Create the Service Module

Create `projects/ai-projects/server/services/<service_name>.py`:

```python
import os
from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field

# Locate root .env automatically
load_dotenv(find_dotenv())


class FeatureRequest(BaseModel):
    query: str = Field(default="example", description="Input parameter description")


class FeatureResponse(BaseModel):
    query: str
    result: str


def run_feature(query: str = "example") -> str:
    """Execute feature using the configured AI model/provider."""
    api_key = os.getenv("PROVIDER_API_KEY")
    base_url = os.getenv("PROVIDER_BASE_URL", "https://api.provider.com/v1")
    client = OpenAI(api_key=api_key, base_url=base_url)

    response = client.chat.completions.create(
        model=os.getenv("PROVIDER_MODEL", "model-name"),
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": query},
        ],
    )
    return response.choices[0].message.content or ""


if __name__ == "__main__":
    print(run_feature())
```

### Step 2: Register Endpoint in FastAPI

In `projects/ai-projects/server/main.py`:

1. Import models and function:
   ```python
   from services.<service_name> import FeatureRequest, FeatureResponse, run_feature
   ```

2. Add the route:
   ```python
   @app.post("/api/<feature>", response_model=FeatureResponse)
   def feature_endpoint(req: FeatureRequest):
       query_val = req.query.strip() if req.query else "example"
       if not query_val:
           raise HTTPException(status_code=400, detail="Query cannot be empty")
       try:
           output = run_feature(query_val)
           return FeatureResponse(query=query_val, result=output)
       except Exception as exc:
           raise HTTPException(status_code=500, detail=str(exc))
   ```

### Step 3: Configure Environment Variables

1. Add required API keys and models to `projects/ai-projects/.env.example`:
   ```dotenv
   PROVIDER_API_KEY=your_key_here
   ```
2. Add the actual key to `projects/ai-projects/.env`.
3. If new variables must be passed to the Docker container, update `projects/ai-projects/docker-compose.yml` under the `server.environment` section:
   ```yaml
   - PROVIDER_API_KEY=${PROVIDER_API_KEY:-}
   ```

### Step 4: Add Interactive Card Component to Client UI

1. Create `projects/ai-projects/client/src/components/<Feature>Card.tsx`:
   ```tsx
   import { useState } from 'react'
   import { API_BASE } from '../config'

   export interface FeatureResponse {
     query: string
     result: string
   }

   export interface FeatureCardProps {
     apiBase?: string
   }

   const FEATURE_PRESETS = ['preset 1', 'preset 2', 'preset 3']

   export function FeatureCard({ apiBase = API_BASE }: FeatureCardProps = {}) {
     const [featureQuery, setFeatureQuery] = useState<string>('preset 1')
     const [submittingFeature, setSubmittingFeature] = useState<boolean>(false)
     const [featureResult, setFeatureResult] = useState<string | null>(null)
     const [featureError, setFeatureError] = useState<string | null>(null)

     const handleRunFeature = async (e?: React.FormEvent) => {
       if (e) e.preventDefault()
       if (!featureQuery.trim()) return

       setSubmittingFeature(true)
       setFeatureError(null)
       try {
         const res = await fetch(`${apiBase}/api/<feature>`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ query: featureQuery.trim() }),
         })
         if (!res.ok) {
           const errJson = await res.json().catch(() => null)
           throw new Error(errJson?.detail || `Server returned HTTP ${res.status}`)
         }
         const data: FeatureResponse = await res.json()
         setFeatureResult(data.result)
       } catch (err) {
         setFeatureError(err instanceof Error ? err.message : 'Request failed')
       } finally {
         setSubmittingFeature(false)
       }
     }

     return (
       <div className="card card-half">
         <h2>
           <span className="card-title">🧩 Feature Title</span>
           <span className="badge badge-healthy">Provider Name</span>
         </h2>
         <p>Description of feature via <code>POST /api/<feature></code>.</p>
         <form onSubmit={handleRunFeature} className="form-row">
           <input
             type="text"
             placeholder="Enter prompt or query…"
             value={featureQuery}
             onChange={(e) => setFeatureQuery(e.target.value)}
             required
           />
           <div className="preset-row">
             <span className="preset-label">Quick pick:</span>
             {FEATURE_PRESETS.map((preset) => (
               <button
                 type="button"
                 key={preset}
                 className="preset-chip"
                 onClick={() => setFeatureQuery(preset)}
               >
                 {preset}
               </button>
             ))}
           </div>
           <span className="validation">{featureError}</span>
           <div className="card-actions">
             <button type="submit" disabled={submittingFeature || !featureQuery.trim()}>
               {submittingFeature && <span className="spinner" />}
               {submittingFeature ? 'Processing…' : 'Run Feature'}
             </button>
           </div>
         </form>
         {featureResult && (
           <div className="result visible">
             {featureResult}
           </div>
         )}
       </div>
     )
   }

   export default FeatureCard
   ```

2. Export from `projects/ai-projects/client/src/components/index.ts`:
   ```typescript
   export { FeatureCard } from './FeatureCard'
   ```

3. Import and render in `projects/ai-projects/client/src/App.tsx` inside `<div className="grid">`:
   ```tsx
   import { FeatureCard } from './components/FeatureCard'

   // Inside <div className="grid">:
   <FeatureCard />
   ```

### Step 5: Update Documentation

1. Add the new endpoint to `projects/ai-projects/README.md` under `## Service URLs`.
2. Add the service module and endpoint description to `projects/ai-projects/server/README.md`.

### Step 6: Verification

1. Validate backend syntax:
   ```bash
   python3 -m py_compile projects/ai-projects/server/main.py projects/ai-projects/server/services/<service_name>.py
   ```
2. Clean up temporary caches:
   ```bash
   find projects/ai-projects/server -name "__pycache__" -type d -exec rm -rf {} +
   ```
3. Validate client linting and build:
   ```bash
   cd projects/ai-projects/client && npm run lint && npm run build
   ```
