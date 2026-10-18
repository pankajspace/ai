# 03-ai-rag-chroma · AI RAG & Chroma

Retrieval-Augmented Generation (RAG) and semantic search infrastructure: recursive character text chunking, dense vector embeddings with SentenceTransformer, and in-memory Chroma vector database retrieval.

## 1. Overview and Features

1. **Text Chunking**: Splits documents using `RecursiveCharacterTextSplitter` respecting paragraphs, sentences, and words with customizable chunk size and overlap.
2. **Semantic Embeddings**: Encodes texts into 384-dimensional dense vectors using `all-MiniLM-L6-v2` and calculates cosine similarity.
3. **Paragraph RAG**: Indexes paragraph context into an in-memory Chroma vector collection and generates grounded answers strictly from retrieved context with `gpt-4o-mini`.

## 2. Project Details

1. Project folder: `projects/03-ai-rag-chroma`
2. Local URL: `http://localhost:8082`
3. Production URL: `https://app.techtoday.click/03-ai-rag-chroma/`
4. Local published port: `8082`
5. Container port: `5000`
6. EC2 host port: `5002`
7. ECR repository: `techtoday/03-ai-rag-chroma`
8. Production service name: `03-ai-rag-chroma`
9. Production path prefix: `/03-ai-rag-chroma`
10. Deploy workflow: `.github/workflows/deploy-03-ai-rag-chroma.yml`
11. Trigger path: `projects/03-ai-rag-chroma/**`

## 3. Environment Variables

1. `OPENAI_API_KEY`: Required for RAG generation (`gpt-4o-mini`).
2. `OPENAI_MODEL`: Optional. Default `gpt-4o-mini`.
3. `OPENAI_BASE_URL`: Optional. Default `https://api.openai.com/v1`.

## 4. Local Development

1. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   # add your OPENAI_API_KEY
   ```
2. Build and run locally via Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:8082` in your browser.

## 5. Deployment and Verification

1. Automatic deployment on push to any branch when files change under `projects/03-ai-rag-chroma/**`.
2. Verify live deployment:
   ```bash
   curl -I https://app.techtoday.click/03-ai-rag-chroma/
   ```
3. Rollback: pull previous image tag from `techtoday/03-ai-rag-chroma` ECR repository on EC2.
