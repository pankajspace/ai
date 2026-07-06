[← Project README](README.md) | [Project Setup](SETUP.md) | [Architecture Guide](../ARCHITECTURE.md)

# TechToday Home Page — Daily Cheatsheet

Quick-reference commands for day-to-day work on the **TechToday home page**. Assumes setup from [SETUP.md](SETUP.md) is complete. For the shared git flow (branch, PR, merge), see the [Development Workflow](../ARCHITECTURE.md#development-workflow).

Deploys to `https://techtoday.click/` — static files served by Nginx, no container.

---

## 1. Develop Locally

```bash
# Quick preview
open projects/techtoday/src/index.html

# Or local HTTP server (matches production behavior)
cd projects/techtoday/src
python3 -m http.server 8000
# → http://localhost:8000
```

---

## 2. Commit & Push

```bash
git add projects/techtoday/
git commit -m "feat(techtoday): short description"
git push -u origin feat/short-description
```

Open a Pull Request → get it reviewed → **Squash and merge** into `main`.

---

## 3. Deploy (Automatic)

Merging to `main` triggers CI/CD automatically — no manual steps needed.

- Workflow: `deploy-techtoday.yml` — trigger path `projects/techtoday/**`

Watch the run under **GitHub → Actions** to confirm it succeeds.

---

## 4. Verify Production

```bash
curl -I https://techtoday.click/
```

Or just open the URL in a browser.

---

## 5. Manual Deploy (Fallback)

Use only if CI/CD is broken. Static files are synced directly — no build, no container.

```bash
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

No Nginx reload is needed — static files are served directly.

> **Troubleshooting:** If rsync fails with `Permission denied (13)`, fix ownership on EC2:
> ```bash
> ssh -i ~/techtoday.pem ec2-user@$ELASTIC_IP
> sudo chown -R ec2-user:ec2-user /var/www/techtoday
> ```
