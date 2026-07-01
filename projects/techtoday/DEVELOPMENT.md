[← README](README.md) · [Deployment Guide](DEPLOYMENT.md) · [Common Development Guide](../DEVELOPMENT.md)

# Development — TechToday Home Page

This guide covers local development for the `techtoday` static site.

---

## Prerequisites

No tools required beyond a modern browser. Optionally, Python 3 for a local server.

---

## Local Preview

**Direct file open (fastest):**

```bash
open projects/techtoday/src/index.html
```

**Local HTTP server** (better for testing — matches production serving behavior):

```bash
cd projects/techtoday/src
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Day-to-Day Workflow

1. Sync `main` before starting:
   ```bash
   git checkout main && git pull origin main
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```
3. Edit files under `src/` — save and reload the browser to see changes.
4. Commit and push:
   ```bash
   git add projects/techtoday/
   git commit -m "feat(techtoday): short description"
   git push -u origin feat/short-description
   ```
5. Open a pull request targeting `main`.

---

## Key Files

1. `src/index.html` — single HTML page; all content lives here
2. `src/css/style.css` — all styles; dark-theme design tokens are CSS custom properties at the top of the file
3. `src/js/main.js` — mobile nav toggle only; keep this file minimal

---

## Adding a New Project Card

1. Open `src/index.html`.
2. Locate the `<div class="grid">` inside `<section id="projects">`.
3. Copy an existing `<div class="card">` block and update the icon, title, description, link, and status badge.
4. Status values: `<span class="status live">Live</span>` or `<span class="status soon">Coming soon</span>`.

---

## Production Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md).
