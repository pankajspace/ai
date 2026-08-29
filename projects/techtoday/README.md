# TechToday — Home Page

Static home page for [techtoday.click](https://techtoday.click), served directly from the main domain. No build step, no framework, no dependencies — plain HTML, CSS, and a small JavaScript file.

---

## Development and Deployment

### Preview Locally

The project folder *is* the web root: `index.html`, CSS, and `study/` sit
together. From the repository root:

```bash
cd projects/techtoday
python3 -m http.server 8000
```

Open http://localhost:8000. You can also open `index.html` directly, but a
local server is more reliable for relative asset paths.

Deploy copies the project directly and excludes non-public files like
`README.md`, `.env*`, and `.gitignore`.

### Commit and Automatic Deployment

This section was last verified on 2026-08-29.

Create a feature branch and commit only this project from the repository root:

```bash
git checkout main && git pull origin main
git checkout -b feat/techtoday-short-description
git add projects/techtoday/
git commit -m "feat(techtoday): short description"
git push -u origin feat/techtoday-short-description
```

Open a pull request and squash-merge it into `main`. Changes under
`projects/techtoday/**` trigger `.github/workflows/deploy-techtoday.yml`. The
workflow copies public files (home page, CSS, and study guides) and
synchronizes them to `/var/www/techtoday/` on EC2; Nginx serves the files
directly, so there is no container or service to restart.

Verify production after the workflow succeeds:

```bash
curl -I https://techtoday.click/
```

### Rollback

Revert the faulty commit on a new branch and merge the resulting pull request.
That keeps source control and production in sync:

```bash
git checkout main && git pull origin main
git checkout -b fix/techtoday-rollback
git revert <bad-commit-sha>
git push -u origin fix/techtoday-rollback
```

### Manual Deployment

Use this only if GitHub Actions is unavailable. From the repository root:

```bash
mkdir -p /tmp/techtoday-site
rsync -av --delete \
    --exclude '.env*' \
    --exclude '.gitignore' \
    --exclude 'README.md' \
    projects/techtoday/ /tmp/techtoday-site/
rsync -avz --delete /tmp/techtoday-site/ \
    ec2-user@44.193.134.238:/var/www/techtoday/
```

No Nginx reload is required. If `rsync` reports `Permission denied (13)`, run
this on EC2 and retry:

```bash
sudo chown -R ec2-user:ec2-user /var/www/techtoday
```

### S3 and CloudFront Deployment

Use this only if the site has been moved from EC2 to S3 and CloudFront:

```bash
S3_BUCKET=<bucket-name>
mkdir -p /tmp/techtoday-site
rsync -av --delete \
    --exclude '.env*' \
    --exclude '.gitignore' \
    --exclude 'README.md' \
    projects/techtoday/ /tmp/techtoday-site/
aws s3 sync /tmp/techtoday-site/ s3://$S3_BUCKET/ \
    --delete --cache-control "public, max-age=86400"
aws s3 cp /tmp/techtoday-site/index.html s3://$S3_BUCKET/index.html \
    --cache-control "public, max-age=60"

DISTRIBUTION_ID=<cloudfront-distribution-id>
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID --paths "/*"
```



---

## What This Is

The `techtoday` project is the public-facing home page for the TechToday site. It introduces the domain and links to active projects running under `app.techtoday.click`. Because it is pure static HTML, it can be deployed to any web server, S3 bucket, CDN, or served directly from the same EC2 instance that hosts the app subdomain.

---

## Project Structure

```
projects/techtoday/
├── README.md
├── index.html                   ← home page, entry point
├── style.css                    ← home-page styles
├── site-header.css              ← shared Study nav header
├── scripts/                     ← optional local tooling (if present)
└── study/
    ├── python/                  ← crash course + full course
    └── ai/                      ← LLM, RAG, Docker, Strands guides
```

---

## Design

1. **Dark theme** — background `#121212`, elevated surfaces `#1e1e1e`, accent `#90caf9` (Material Blue 200).
2. **No frameworks** — zero runtime dependencies; no Node.js, no bundler.
3. **Responsive** — mobile nav collapses to a hamburger toggle at ≤ 720 px.
4. **Accessible** — `aria-expanded` on the toggle button, semantic HTML5 landmarks.

---

## Adding a New Project Card

1. Open `index.html`.
2. Inside the `<div class="grid">` in the `#projects` section, copy an existing `<div class="card">` block.
3. Update the icon, heading, description, link `href`, and status badge (`live` or `soon`).
4. Set the status badge: `<span class="status live">Live</span>` for a running project, or `<span class="status soon">Coming soon</span>` for one that is not yet live.
