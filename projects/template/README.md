[← README](../../README.md)

# Project Template

A copy-me starter for a new **container project** on `app.techtoday.click`. It
is a minimal Flask + Docker app, already wired for the shared Nginx
path-prefix routing, so a new project is deploy-ready after a folder copy and a
few find-and-replace edits.

---

## What's Inside

```
projects/template/
├── Dockerfile              # Python 3.12 image; installs deps, copies src/
├── docker-compose.yml      # web service + one-off CLI service per feature
├── requirements.txt        # flask, flask-cors, python-dotenv, requests
├── .env.example            # copy to .env for local secrets (gitignored)
├── .gitignore              # ignores .env, caches, venvs
├── deploy.yml.template     # CI/CD workflow to copy into .github/workflows/
└── src/
   ├── python/
   │   ├── app.py          # Flask server: Blueprint + PATH_PREFIX routing
   │   ├── config.py       # loads .env; place to build API clients
   │   └── echo.py         # starter feature (no API key needed)
    ├── index.html          # single-page UI (served by Flask)
    ├── css/style.css       # dark theme (shares TechToday design tokens)
    └── js/main.js          # front-end behavior, no frameworks
```

---

## Why a Template

Every container project on this server shares the same shape:

1. A Flask app whose routes hang off a Blueprint registered under a runtime
   `PATH_PREFIX`, so the exact same code serves `/` locally and
   `/<project-name>/` in production behind Nginx.
2. A `Dockerfile` + `docker-compose.yml` that build a Python 3.12 image and run
   `python src/python/app.py` on container port `5000`.
3. A per-project GitHub Actions workflow that builds, pushes to ECR, and
   restarts only this project's container on the shared EC2 host.

The template captures all of that so you never re-derive it. Keep the
`PATH_PREFIX` wiring intact — it is what lets a new project slot in behind the
shared Nginx config with only a new `location` block.

---

## Path Prefix Routing

Because Nginx forwards the full path (e.g. `/<project-name>/echo`) to the
container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/python/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # "/<project-name>" in prod, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

1. **Locally:** `PATH_PREFIX` unset → routes are `/`, `/echo`.
2. **On EC2:** `PATH_PREFIX=/<project-name>` → routes are `/<project-name>/`,
   `/<project-name>/echo`.

The served `index.html` also needs the prefix so its `fetch()` calls hit the
right endpoint. The `index` route injects it by rewriting the page's
`data-api-base=""` attribute with the current `PATH_PREFIX` value before
returning the HTML.

---

## Try It Locally & Create a New Project

The starter `echo` feature needs no keys, so a fresh copy runs immediately with
`docker compose up web` (→ http://localhost:8090). The copy-and-rename checklist
and full initial deployment walkthrough live in [ADD_PROJECT.md](../ADD_PROJECT.md).
Daily development and deployment live in [DAILY.md](../DAILY.md).
