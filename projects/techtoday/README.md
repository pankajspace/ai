[← README](../../README.md) · [Project Setup](SETUP.md) · [Project Daily](DAILY.md) · [Projects Guide](../README.md)

# TechToday — Home Page

Static home page for [techtoday.click](https://techtoday.click), served directly from the main domain. No build step, no framework, no dependencies — plain HTML, CSS, and a small JavaScript file.

---

## What This Is

The `techtoday` project is the public-facing home page for the TechToday site. It introduces the domain and links to active projects running under `app.techtoday.click`. Because it is pure static HTML, it can be deployed to any web server, S3 bucket, CDN, or served directly from the same EC2 instance that hosts the app subdomain.

---

## Project Structure

```
projects/techtoday/
├── README.md
└── src/
    ├── index.html      ← single page, entry point
    ├── css/
    │   └── style.css   ← all styles, dark-theme design tokens as CSS variables
    └── js/
        └── main.js     ← mobile nav toggle, no external libraries
```

> Setup and project guides live in [../SETUP.md](../SETUP.md) and [../README.md](../README.md) (shared across all projects).

---

## Design

1. **Dark theme** — background `#121212`, elevated surfaces `#1e1e1e`, accent `#90caf9` (Material Blue 200).
2. **No frameworks** — zero runtime dependencies; no Node.js, no bundler.
3. **Responsive** — mobile nav collapses to a hamburger toggle at ≤ 720 px.
4. **Accessible** — `aria-expanded` on the toggle button, semantic HTML5 landmarks.

---

## Local Preview

Open `src/index.html` directly in any browser — no server needed:

```bash
open projects/techtoday/src/index.html
```

Or serve it locally with Python's built-in server (useful for testing relative asset paths):

```bash
cd projects/techtoday/src
python3 -m http.server 8000
# open http://localhost:8000
```

---

## Adding a New Project Card

1. Open `src/index.html`.
2. Inside the `<div class="grid">` in the `#projects` section, copy an existing `<div class="card">` block.
3. Update the icon, heading, description, link `href`, and status badge (`live` or `soon`).
4. Set the status badge: `<span class="status live">Live</span>` for a running project, or `<span class="status soon">Coming soon</span>` for one that is not yet live.

---

## Deployment

See the [Projects Guide](../README.md) for deployment options (S3 + CloudFront, or Nginx on EC2), or the [Setup Guide](../SETUP.md) for step-by-step production setup.
