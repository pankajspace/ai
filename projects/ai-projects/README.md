# AI Projects

A multi-container POC setup with a React (Vite) client and a FastAPI server powered by OpenAI GPT-4o mini.

## 1. Architecture

1. **Client**: React + Vite frontend served on port `5173`.
2. **Server**: Lightweight FastAPI backend service running on port `8000` exposing the travel guide service.
3. **Orchestration**: Docker Compose manages each service as an isolated container connected over a local bridge network.

---

## 2. Quickstart with Docker Compose

The simplest way to run both client and server together locally.

1. Ensure your `OPENAI_API_KEY` is exported or placed in a `.env` file in the root or server directory:
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

2. Navigate to the project directory:
   ```bash
   cd projects/ai-projects
   ```

3. Build and start both containers:
   ```bash
   docker compose up --build
   ```
   *(To run in the background, append the `-d` flag: `docker compose up -d --build`)*

4. View live container logs:
   ```bash
   docker compose logs -f
   ```

5. Stop all running containers:
   ```bash
   docker compose down
   ```

---

## 3. Service URLs

1. **React Client**: `http://localhost:5173`
2. **FastAPI Server**: `http://localhost:8000`

---

## 4. Testing Services Directly from the Command Line (.py Files)

Each service module in `server/services/` contains a standalone test and demonstration block (`if __name__ == "__main__":`) that can be executed directly from your terminal.

### 1. Prerequisites and Environment Setup

1. Navigate to the server directory:
   ```bash
   cd projects/ai-projects/server
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set your API keys in your environment or in `projects/ai-projects/.env`:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   export GROQ_API_KEY="your-groq-api-key"
   ```

### 2. Running Individual Service Files

Run each service file directly from `projects/ai-projects/server`:

1. **OpenAI Travel Guide Service**:
   ```bash
   python services/01_chat_openai.py
   ```
   Runs a sample query with `Bangalore` to test direct chat completion with OpenAI GPT-4o mini.

2. **Groq Joke Generator Service**:
   ```bash
   python services/02_chat_groq.py
   ```
   Runs a sample query with topic `programming` using Groq's high-speed inference API.

3. **LangChain Text Summarizer Service**:
   ```bash
   python services/03_langchain_summarizer.py
   ```
   Executes an LCEL prompt chain with OpenAI to summarize a sample multi-sentence paragraph.

4. **Conversational Memory Chat Service**:
   ```bash
   python services/04_langchain_memory_chat.py
   ```
   Starts an interactive multi-turn CLI chat session maintaining conversational memory. Type `exit` or `quit` to end.

5. **Single-Tool Autonomous Agent Service**:
   ```bash
   python services/05_agent_one_tool.py
   ```
   Executes an autonomous agent loop with a custom local tool (`get_price`), testing both tool-calling and non-tool queries.

6. **LangChain Single-Tool Agent Service**:
   ```bash
   python services/06_langchain_one_tool.py
   ```
   Executes a LangChain OpenAI tool agent equipped with the `get_weather` tool.

7. **LangChain Multi-Tool Agent Service**:
   ```bash
   python services/07_langchain_multi_tools.py
   ```
   Executes a LangChain agent equipped with multiple tools (`get_weather`, `multiply`, `add`, `get_population`) across single-tool, multi-tool, and general knowledge queries.

8. **Document Chunking Service**:
   ```bash
   python services/08-chunking.py
   ```
   Splits document text into overlapping passages using `RecursiveCharacterTextSplitter`.

9. **Sentence Embedding & Similarity Service**:
   ```bash
   python services/09-embedding.py
   ```
   Encodes sentences into dense vector representations and calculates cosine similarity using `all-MiniLM-L6-v2`.

10. **Paragraph RAG Service**:
    ```bash
    python services/10-rag.py
    ```
    Executes an end-to-end RAG query answering pipeline against a reference paragraph without requiring a PDF file.

### 3. Running Service Files Inside Docker

If the Docker containers are already running, you can execute the Python files directly inside the running container without installing Python dependencies locally on your host machine:

1. Test OpenAI Travel Guide in Docker:
   ```bash
   docker exec -it ai-projects-server python services/01_chat_openai.py
   ```

2. Test Groq Joke Generator in Docker:
   ```bash
   docker exec -it ai-projects-server python services/02_chat_groq.py
   ```

3. Test LangChain Summarizer in Docker:
   ```bash
   docker exec -it ai-projects-server python services/03_langchain_summarizer.py
   ```

4. Run Conversational Memory Chat interactively in Docker:
   ```bash
   docker exec -it ai-projects-server python services/04_langchain_memory_chat.py
   ```

5. Test Autonomous Single-Tool Agent in Docker:
   ```bash
   docker exec -it ai-projects-server python services/05_agent_one_tool.py
   ```

6. Test LangChain Single-Tool Agent in Docker:
   ```bash
   docker exec -it ai-projects-server python services/06_langchain_one_tool.py
   ```

7. Test LangChain Multi-Tool Agent in Docker:
   ```bash
   docker exec -it ai-projects-server python services/07_langchain_multi_tools.py
   ```

8. Test Document Chunking in Docker:
   ```bash
   docker exec -it ai-projects-server python services/08-chunking.py
   ```

9. Test Sentence Embedding in Docker:
   ```bash
   docker exec -it ai-projects-server python services/09-embedding.py
   ```

10. Test Paragraph RAG in Docker:
    ```bash
    docker exec -it ai-projects-server python services/10-rag.py
    ```

---

## 5. Useful Docker Commands

1. Check container status:
   ```bash
   docker ps
   ```

2. Follow server logs:
   ```bash
   docker logs -f ai-projects-server
   ```

3. Follow client logs:
   ```bash
   docker logs -f ai-projects-client
   ```

4. Open a shell inside the server container:
   ```bash
   docker exec -it ai-projects-server sh
   ```

5. Stop and clean up standalone containers:
   ```bash
   docker stop ai-projects-server ai-projects-client
   docker rm ai-projects-server ai-projects-client
   ```
