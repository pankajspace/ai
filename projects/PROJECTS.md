# Projects — Local Dev & Production Reference

An index of every project in this repo. Each project folder documents its own setup end to end; use this page to find the right folder for local development and production deployment.

> Complete the shared prerequisites in `SETUP.md` first — the local machine prerequisites (§ 1) before any local work, and the one-time AWS infrastructure (§ 2) before any production deployment.

---

## Local Development

Local development is project-specific. Each project folder documents its own prerequisites, one-time setup, and day-to-day loop:

1. **TechToday Home Page** — `projects/techtoday/`
2. **AI Playground (basic)** — `projects/basic/`
3. **LangChain Lab (langchain)** — `projects/langchain/`

---

## Production Deployment

After completing the one-time AWS infrastructure (SETUP.md § 2), each project folder documents its own deployment — secrets, ECR repo, image build/push, Nginx location block, Docker Compose service, and verification:

1. **TechToday Home Page** (static site) — `projects/techtoday/`
2. **AI Playground (basic)** (`/basic/`, port 5000) — `projects/basic/`
3. **LangChain Lab (langchain)** (`/langchain/`, port 5001) — `projects/langchain/`

> Adding a new project? Follow SETUP.md § 3 — Adding a New Project.
