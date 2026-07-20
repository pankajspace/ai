# Project Registry

This is the single source of truth for the list of projects in this repository.
When a new project is added, update this file with its project-specific values.
Keep this file complete enough to answer: what projects exist, where they run,
which ports and workflows they use, which secrets they need, and what values are
available for the next project.

## Shared Conventions

### Static Site

1. Static sites live under `projects/<name>/src/`.
2. Static sites do not use Docker, ECR, `PATH_PREFIX`, or Secrets Manager.
3. The production deployment target and workflow are listed in the project entry below.

### Container Apps

1. Each container listens on port `5000` inside the container.
2. Each container app gets a unique EC2 host port in the `500x` range.
3. Each container app gets a unique local development port in the `808x` range, except the reusable `template` starter, which uses `8090`.
4. A project named `<project-name>` uses ECR repository `techtoday/<project-name>`, Nginx path `/<project-name>/`, Docker Compose service `<project-name>`, and production environment variable `PATH_PREFIX=/<project-name>`.
5. All API keys live in the shared AWS Secrets Manager secret `techtoday/secrets`.
6. All container apps share `https://app.techtoday.click`, the EC2 instance, the Nginx reverse proxy, and the SSL certificate.
7. Production services on EC2 must start with `command: python src/python/app.py`.

## Project List

### TechToday Home Page (`techtoday`)

1. **Type:** Static site.
2. **Folder:** `projects/techtoday/`.
3. **Production URL:** `https://techtoday.click/`.
4. **Redirect URL:** `https://www.techtoday.click/` redirects to `https://techtoday.click/`.
5. **Production path:** `/var/www/techtoday` on EC2.
6. **CI/CD workflow:** `.github/workflows/deploy-techtoday.yml`.
7. **Trigger path:** `projects/techtoday/**`.
8. **Deploy behavior:** `rsync`s `src/` to `/var/www/techtoday` on EC2.
9. **Secrets:** none.
10. **Notes:** no container, no application server, no `PATH_PREFIX`.

### AI Playground (`basic`)

1. **Type:** Container app.
2. **Folder:** `projects/basic/`.
3. **Production URL:** `https://app.techtoday.click/basic/`.
4. **Local dev URL:** `http://localhost:8080`.
5. **Container port:** `5000`.
6. **EC2 host port:** `5000`.
7. **ECR repository:** `techtoday/basic`.
8. **Path prefix:** `PATH_PREFIX=/basic`.
9. **Routes:** `/basic/`, `/basic/joke`, `/basic/travel`, `/basic/summarize`, `/basic/arena`.
10. **CI/CD workflow:** `.github/workflows/deploy-basic.yml`.
11. **Trigger path:** `projects/basic/**`.
12. **Secrets:** `OPENAI_API_KEY` for travel, summarize, and arena; `GROQ_API_KEY` for joke and arena.

### LangChain Lab (`langchain`)

1. **Type:** Container app.
2. **Folder:** `projects/langchain/`.
3. **Production URL:** `https://app.techtoday.click/langchain/`.
4. **Local dev URL:** `http://localhost:8081`.
5. **Container port:** `5000`.
6. **EC2 host port:** `5001`.
7. **ECR repository:** `techtoday/langchain`.
8. **Path prefix:** `PATH_PREFIX=/langchain`.
9. **Routes:** `/langchain/`, `/langchain/summarize`, `/langchain/chat`, `/langchain/agent`.
10. **CI/CD workflow:** `.github/workflows/deploy-langchain.yml`.
11. **Trigger path:** `projects/langchain/**`.
12. **Secrets:** `OPENAI_API_KEY` only.

### RAG Lab (`rag`)

1. **Type:** Container app.
2. **Folder:** `projects/rag/`.
3. **Production URL:** `https://app.techtoday.click/rag/`.
4. **Local dev URL:** `http://localhost:8082`.
5. **Container port:** `5000`.
6. **EC2 host port:** `5002`.
7. **ECR repository:** `techtoday/rag`.
8. **Path prefix:** `PATH_PREFIX=/rag`.
9. **Routes:** `/rag/`, `/rag/embeddings`, `/rag/chunk`, `/rag/rag`, `/rag/rerank`, `/rag/pdf-upload`, `/rag/pdf-chat`.
10. **CI/CD workflow:** `.github/workflows/deploy-rag.yml`.
11. **Trigger path:** `projects/rag/**`.
12. **Secrets:** `OPENAI_API_KEY` only. Embeddings run locally with no API key.

### Container App Template (`template`)

1. **Type:** Starter template, not a production project.
2. **Folder:** `projects/template/`.
3. **Local dev URL:** `http://localhost:8090`.
4. **Container port:** `5000`.
5. **Local host port:** `8090`.
6. **Starter feature:** keyless `echo` route.
7. **Use:** copy this folder when creating a new container app.

## Next Available Container App Values

Use these values for the next new container app, then update this section after the
project is added.

1. **Local dev port:** `8083`.
2. **EC2 host port:** `5003`.
3. **Container port:** `5000`.
4. **Production base URL:** `https://app.techtoday.click/<project-name>/`.
5. **ECR repository:** `techtoday/<project-name>`.
6. **Path prefix:** `PATH_PREFIX=/<project-name>`.

## When Adding a Project

When adding a project, update this registry:

1. Add the new project entry under Project List.
2. Advance Next Available Container App Values.
3. If the project should appear on the public home page, update `projects/techtoday/src/` as part of the project change.
