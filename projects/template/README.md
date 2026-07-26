# Project Template

A copy-me starter for a new **container project** on `app.techtoday.click`. It
is a minimal Flask + Docker app, already wired for the shared Nginx
path-prefix routing, so a new project is deploy-ready after a folder copy and a
few find-and-replace edits.

---

## Development

### Run the Starter Locally

The starter `echo` feature needs no keys. Complete the one-time prerequisites
in [../SETUP.md](../SETUP.md), then start Docker and verify it with
`docker info`. On Linux, use `sudo systemctl start docker`; on macOS or Windows,
start Docker Desktop.

From the repository root:

```bash
cd projects/template
cp .env.example .env
docker compose build web
docker compose up web
```

Open http://localhost:8090. Source files under `src/` are mounted into the
container, so normal edits do not need a rebuild. Rebuild after changing
`Dockerfile` or `requirements.txt`.

```bash
docker compose run --build --rm echo
docker compose logs -f web
docker compose run --rm web bash
docker compose ps
docker compose down
```

The `template` project is a local starter and is never deployed to production.

### Create a Project From This Template

Use the `Create Container Project` skill or copy this folder to
`projects/<project-name>/`. Allocate ports and production values using
[../ADD_PROJECT.md](../ADD_PROJECT.md), integrate the feature, and replace this
README with project-specific documentation.

The resulting README must be the complete runbook for that project. Include:

1. Purpose, features, architecture, and project structure.
2. Local and production URLs, container/local/EC2 ports, ECR repository,
   `PATH_PREFIX`, routes, and every environment variable.
3. Docker prerequisites, first-run setup, exact start commands, feature-service
   commands, rebuild conditions, logs, shell access, shutdown, and data reset.
4. Exact branch, commit, and automatic deployment workflow, including the
   workflow filename and trigger path.
5. Production verification, `502` troubleshooting, rollback, disk cleanup, and
   manual deployment commands with the real project and service names.
6. An honest deployment status. Multi-service projects must document and deploy
   every required image and dependency; a gateway-only workflow is incomplete.

Link to [../SETUP.md](../SETUP.md) only for one-time machine and AWS
infrastructure setup, and keep all routine project work in the project's own
README.

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
