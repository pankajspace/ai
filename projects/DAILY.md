[← README](../README.md) · [Projects Guide](README.md) · [Setup Guide](SETUP.md)

# Daily Development Cheatsheet

Shared git flow for all projects. Per-project develop / commit / deploy / rollback commands live in each project's own cheatsheet:

1. **TechToday Home Page** — [techtoday/DAILY.md](techtoday/DAILY.md)
2. **AI Playground (basic)** — [basic/DAILY.md](basic/DAILY.md)
3. **LangChain Lab (langchain)** — [langchain/DAILY.md](langchain/DAILY.md)

Assumes all setup from the [Setup Guide](SETUP.md) is already complete.

---

## 1. Start a Feature

```bash
git checkout main && git pull origin main
git checkout -b feat/short-description
```

---

## 2. Develop, Commit & Deploy

Follow your project's cheatsheet for the local dev loop, commit scope, and deployment:

1. [techtoday/DAILY.md](techtoday/DAILY.md) — static preview; deploys to the root domain
2. [basic/DAILY.md](basic/DAILY.md) — web UI on port 8080; deploys to `/basic/`
3. [langchain/DAILY.md](langchain/DAILY.md) — web UI on port 8081; deploys to `/langchain/`

Each project scopes its commits to its own folder (e.g. `git add projects/basic/`), then opens a PR and **squash-merges** into `main`.

---

## 3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed. Each project has its own workflow, triggered only when that project's files change:

1. **techtoday** — `deploy-techtoday.yml` — trigger path `projects/techtoday/**`
2. **basic** — `deploy-basic.yml` — trigger path `projects/basic/**`
3. **langchain** — `deploy-langchain.yml` — trigger path `projects/langchain/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 4. Verify Production

```bash
curl -I https://techtoday.click/
curl -I https://app.techtoday.click/basic/
curl -I https://app.techtoday.click/langchain/
```

Or just open the URLs in a browser.

---

## 5. Rollback & Manual Deploy

These are project-specific — see the **Rollback** and **Manual Deploy** sections in each project's cheatsheet:

1. [techtoday/DAILY.md](techtoday/DAILY.md)
2. [basic/DAILY.md](basic/DAILY.md)
3. [langchain/DAILY.md](langchain/DAILY.md)

> Reminder: `$ELASTIC_IP` is the public IP of the EC2 instance (AWS console → EC2 → Instances → techtoday-server). For us it is `44.193.134.238`.
