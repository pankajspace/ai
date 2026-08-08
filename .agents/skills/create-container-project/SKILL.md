---
description: "Use when: creating or reshaping a container project from projects/template with a self-contained README for local development, deployment, rollback, and troubleshooting"
name: "Create Container Project"
argument-hint: "projectName, feature idea, optional local/prod ports, and whether Python files already exist"
agent: "gemini"
---

Create or adapt a container project named `${input:projectName}` under `projects/`, using `projects/template` as the reference implementation and matching the structure and deployment conventions of the existing projects.

`${input:projectName}` is the project folder name, Docker Compose service name, ECR repository suffix, production `PATH_PREFIX`, and deploy-workflow suffix, unless the user overrides one explicitly.

## Required Context

Read before editing:

1. [projects/ADD_PROJECT.md](../../projects/ADD_PROJECT.md) — `Pick Project Values` and the final documentation steps.
2. [projects/ARCHITECTURE.md](../../projects/ARCHITECTURE.md) — `Shared Runtime Conventions`.
3. [projects/template/README.md](../../projects/template/README.md) and [projects/template/src/python/app.py](../../projects/template/src/python/app.py).
4. A neighboring project ([basic](../../projects/basic), [langchain](../../projects/langchain), or [rag](../../projects/rag)) when its structure helps.
5. The matching `study/` file, if one exists, for feature context and source material.

## Inputs To Resolve

Identify or ask for: project name; next free local port (`808x`) and EC2 host port (`500x`) from `ADD_PROJECT.md`, confirmed against existing READMEs/Compose files; whether Python feature files already exist and where from; required env vars (new secrets vs. already in `techtoday/secrets`); whether the project is production-documented; and whether it includes standalone example sub-projects (see **Complex Projects**).

Proceed without extra questions if you have enough information.

## Workflow

1. Confirm the next-port allocation from `ADD_PROJECT.md`.
2. Create `projects/<project-name>/` by copying `projects/template/` if it does not exist.
3. Set the `web` service to publish `<local-port>:5000` in `docker-compose.yml`.
4. Keep the template structure unless the user asks otherwise: `Dockerfile`, `docker-compose.yml`, `requirements.txt`, `.env.example`, `.gitignore`, `deploy.yml.template`, `linkedin.txt`, `README.md`, `src/index.html`, `src/css/style.css`, `src/js/main.js`, `src/python/app.py`, `src/python/config.py`, feature modules under `src/python/`, and standalone example sub-projects under `src/<example-name>/`.
5. Integrate user-provided Python files under `src/python/`.
6. Expose new feature routes through the Blueprint in `app.py`, preserving:
   - `PATH_PREFIX = os.environ.get("PATH_PREFIX", "")`
   - `app.register_blueprint(bp, url_prefix=PATH_PREFIX)`
   - the `index()` route injecting `data-api-base="<PATH_PREFIX>"`
   - static routes for `/css/<path:filename>` and `/js/<path:filename>`
   - one `POST` route per feature that validates a non-empty input (→ `400`), wraps the feature call in `try/except` (→ `500`), and returns `{"result": ...}`.
7. Update `index.html`, `style.css`, and `main.js` following **Consistent UI and Working Demo Tiles** so the project matches every sibling project and every feature is a live, working demo tile — never a static, read-only, or "view source" card.
8. Update `requirements.txt` and `.env.example` for the project's Python files and secrets.
9. Replace the template `README.md` with a self-contained runbook (see **README Requirements**).
10. **Create the deploy workflow** whenever the project is production-documented or the user wants deployment support. This is mandatory for any project you call deploy-ready — a missing workflow causes a production 404 even after the home-page tile is added. From the repo root:
    ```bash
    cp projects/<project-name>/deploy.yml.template .github/workflows/deploy-<project-name>.yml
    sed -i "s/PROJECT_NAME/<project-name>/g" .github/workflows/deploy-<project-name>.yml   # macOS: sed -i ''
    grep -n PROJECT_NAME .github/workflows/deploy-<project-name>.yml   # must print nothing
    ```
    The substituted template is complete for a single-service project. For a complex multi-container project it is only a starting point — extend it per **CI/CD Workflow for Complex Projects** before calling the project deploy-ready.
11. When the project is ready to document: keep project-specific values in its `README.md`; advance the next-port allocation in `ADD_PROJECT.md`; update shared-secret setup notes only if the shared process changed; and add a home-page card under `projects/techtoday/src/` if the project should be public.

## README Requirements

`projects/<project-name>/README.md` is the source of truth for developing, operating, and deploying the project. Someone who has finished the one-time prerequisites in `projects/SETUP.md` must not need any other shared guide for routine work. Use concrete values, not placeholders. Link to `SETUP.md` only for one-time local/AWS setup; never store missing project instructions in shared index docs.

Include all applicable sections:

1. **Overview and features** — purpose, behavior, architecture, project structure.
2. **Project details** — type/folder, local and production URLs, local/container/EC2 ports, ECR repository, production service name, `PATH_PREFIX`, routes, workflow filename, trigger path.
3. **Environment variables** — each required/optional variable, which feature uses it, where to obtain it, and that `.env` is never committed.
4. **Prerequisites and first run** — OS-specific Docker startup, `docker info`, `.env` creation, build/start commands, URL to open.
5. **Daily local development** — reload/volume behavior, when to rebuild, one-off feature commands, logs, shell access, status, shutdown, persistent-data reset.
6. **One-time production setup** — the server wiring needed before the first deploy and to recover a rebuilt host: create the ECR repository (one per buildable service for a complex project), seed the initial image(s), add required keys to `techtoday/secrets`, add the Nginx `/<project-name>/` location block for the host port, write the `~/secrets/<project-name>.env` file, add the production Compose service(s) (image URL not `build:`, `PATH_PREFIX=/<project-name>`, host-port mapping), first start, and verify. Label every step **(local)** or **(EC2)**: repo creation, image seeding, and Secrets Manager writes must run locally as the `techtoday` IAM user — the EC2 instance role (`ec2-techtoday-server-role`) can only pull images and read secrets, so running `ecr:CreateRepository` or `secretsmanager:PutSecretValue` on EC2 fails with `AccessDeniedException` by design. Automatic deploys do not create this wiring — a project is unreachable (production 404) until it exists, even with a valid workflow and home-page tile.
7. **Commit and automatic deployment** — branch, `git add`/commit/push, PR expectations, workflow path, trigger path, ECR repository, affected EC2 service.
8. **Production verification and troubleshooting** — verification `curl` URL, service logs, Compose inspection, required production command, health/dependency checks, scoped restart.
9. **Rollback** — ECR repository, region, production service, image-tag procedure, verification URL.
10. **Manual deployment** — build context, image name, architecture, ECR path, production service, disk-space recovery, retry commands.
11. **Deployment status** — state clearly when automation is incomplete. Never claim auto-deploy unless the workflow exists and covers all required services.

## Consistent UI and Working Demo Tiles

Every project must share one look and feel and present each feature as an interactive demo tile. The template (`projects/template/src/`) is the single source of truth for the UI; copy its structure verbatim and change only the project-specific content below. Sibling projects (`basic`, `langchain`, `rag`) show the pattern applied. Never let a project diverge into a different layout, a static code-reference browser, or read-only "view source" cards.

### CSS — copy verbatim, never restyle

Copy `projects/template/src/css/style.css` unchanged into the new project. The only permitted edit is the top-of-file header comment naming the project. Do not fork colors, fonts, spacing, the CSS variables (`--bg`, `--bg-elevated`, `--accent`, `--text`, `--border`), the `.grid`, `.card`, `.card-wide`, `.spinner`, `.validation`, `.result`, or `.error` rules. If a design change is genuinely needed, change the template and re-copy so all projects stay in sync — do not patch one project.

### index.html — keep the shell, swap the cards

Keep the template's `<head>`, `<header>`/`nav`, `.hero`, and `<footer>` structure and the `<body data-api-base="">` attribute exactly. Change only: `<title>`, `<meta name="description">`, the favicon emoji, the hero `<h1>` and `<p class="subtitle">`, and the feature cards inside `<div class="grid">`.

Each feature is one interactive card with this exact shape (no extra widgets, no source-code toggles):

```html
<div class="card">
    <h2>🧩 Feature Name</h2>
    <p>One or two sentences on what it does and what to try.</p>
    <input type="text" id="fooInput" placeholder="e.g. a concrete example…" />
    <span class="validation" id="fooValidation"></span>
    <button id="fooBtn" disabled>Action label</button>
    <div class="result" id="fooResult"></div>
</div>
```

Rules for cards:

1. Use consistent ID naming per card: `<name>Input`, `<name>Validation`, `<name>Btn`, `<name>Result`.
2. Start every button `disabled`; `main.js` enables it once the input has a value.
3. Order cards simplest → most complex, matching the study source and the README.
4. Use the two-column `.grid` by default. Apply `card-wide` (full width via `grid-column: 1 / -1`) only for a genuine capstone that needs more room, and place it last; never make a lone tile `card-wide` just to fill a row.
5. Give a textarea (`<textarea id="fooInput">`) instead of `<input>` only when the feature needs multi-line input; the ID/wiring rules are unchanged.

### main.js — reuse the shared helpers

Copy the template `main.js` and keep the shared helpers **unchanged**: `const API = document.body.dataset.apiBase || ""`, `setLoading`, `callApi`, `setupCard`, and `renderText`. Do not introduce a framework, a bundler, or a different fetch/render approach. For each card, add exactly one `setupCard({...})` call inside the `DOMContentLoaded` handler:

```js
setupCard({
    inputId: "fooInput",
    buttonId: "fooBtn",
    resultId: "fooResult",
    validationId: "fooValidation",
    requiredMessage: "Please enter …",
    endpoint: "/foo",
    field: "message",
    render: renderText,
});
```

Add a bespoke `render` function only when the response is richer than a single text string (e.g. rendering a list or table); reuse `renderText` for the common `{"result": "<text>"}` case. Every `endpoint` must correspond to a real `@bp.route(..., methods=["POST"])` in `app.py`, and every `field` must match the key that route reads from the JSON body.

### Working-demo requirement

A tile is only "done" when clicking its button calls a live backend route and renders a real response. Do not ship placeholder tiles, cards that only display static text or source code, or buttons wired to nothing. Only build tiles the study HTML/PDF source supports (see Constraints); each tile maps to one backend route and one exercise or capability in the source. If a capability is unsafe to expose to public input (e.g. arbitrary cloud API calls, file writes), omit the tile rather than shipping a fake or unsafe one, and note the omission.

## Complex Projects — Standalone Example Sub-Projects

Some projects bundle standalone example sub-projects (each a complete Docker project with its own Dockerfile, compose file, and possibly multiple containers) alongside the main Flask app. This is common for study projects that ship the study material's examples as reference implementations.

Use this pattern when the examples are complete Docker projects that run independently from the Flask app rather than as Flask Blueprint features, and each may have its own containers (e.g. app + database, or agent + tools + Redis). Add them to the main `docker-compose.yml` and proxy browser requests through the Flask gateway — the front-end never calls internal services directly.

**Structure** — place example sub-projects as siblings under `src/`, never inside `src/python/` (they are full projects, not importable modules):

```
src/
├── python/              # Main Flask app (app.py, config.py, features)
├── css/, js/, index.html
├── example-one/         # Standalone example (own Dockerfile)
├── example-two/         # Standalone example (Dockerfile + compose)
└── example-three/       # Standalone example (multiple Dockerfiles + compose)
```

**Ordering** — arrange examples simplest → most complex in both README and UI, with explicit labels ("Level 1 · 1 container", "Level 2 · 2 containers", …). Use the study material to determine the pedagogical order.

**Integrating user-provided files** — when the user says files already exist:

1. List the project directory to discover all provided files.
2. Classify each as a Flask feature (`src/python/`) or a standalone example (`src/<name>/`).
3. Move standalone projects to their correct location.
4. Remove secrets and artifacts: `.env` files with real keys, `.venv/`/`venv/`, `.DS_Store`, `__pycache__/`, `*.pkl`/`*.h5` and similar.
5. Update README and `index.html` to reference each example with its path, level, and container count.
6. Ensure the project `.gitignore` catches those artifacts in subdirectories too.

**README additions** — a Project Structure tree; an Example Projects section with Level ordering; per-example container count, Docker concepts covered, keys needed, and quick-start block; a note that examples are standalone; full-stack and per-level Compose/logs/health/reset commands and rebuild rules; and production image/dependency coverage for every service.

**index.html** — interactive demo forms (not static cards) for each example, with inputs and buttons calling the Flask proxy routes, a level/container-count badge (e.g. `<span class="badge">Level 1 · 1 container</span>`), ordered simplest → most complex.

**Healthchecks and dependency ordering** — add a healthcheck to every service and use `depends_on` with `condition: service_healthy` (started ≠ ready):

```yaml
services:
  my-app:
    depends_on:
      my-db:
        condition: service_healthy
  my-db:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 5s
```

Healthcheck tests: Python/FastAPI → `python -c "import urllib.request; urllib.request.urlopen('http://localhost:<port>/')"`; Redis → `redis-cli ping`; ChromaDB → the heartbeat endpoint.

### CI/CD Workflow for Complex Projects

The stock `deploy.yml.template` builds one image at the project root and pulls/restarts one service (the `PROJECT_NAME` service). A complex project builds several images from different contexts (e.g. `web` plus example sub-projects) and runs multiple services, so the unmodified template deploys only the gateway and leaves the rest stale. When adding the workflow:

1. Still create `.github/workflows/deploy-<project-name>.yml` — never skip it.
2. Build and push an ECR image for **every** build context, or build them together via `docker compose build` against the production Compose file.
3. On EC2, pull and restart **all** of the project's services, not a single `PROJECT_NAME` service.
4. If examples are keyless and rarely change, automating only the gateway is acceptable — but say so explicitly in the README's deployment-status section and do not describe the project as fully auto-deploying.
5. Never call a complex project deploy-ready while the workflow covers only the gateway image.

## Validation

Run the cheapest relevant checks after editing:

1. `python3 -m py_compile src/python/*.py` from the project folder.
2. `docker compose config` from the project folder (copy `.env` from `.env.example` first if needed).
3. Optional runtime check if Docker is running and the user wants it: `docker compose up web`, then open the local URL.
4. If a workflow was generated, confirm no `PROJECT_NAME` placeholders remain and that every workflow/file named by the README exists.
5. Confirm the README has concrete start, deploy, verification, rollback, manual-fallback, and troubleshooting commands, and that intentionally incomplete deployment is stated as such.
6. Search the README for stray placeholders (`<project-name>`, `<local-port>`, `PROJECT_NAME`, generic feature-service names) and remove them unless part of a labeled template example.
7. Verify UI consistency against the template: `style.css` differs from `projects/template/src/css/style.css` only in the header comment; `index.html` keeps the template head/nav/hero/footer shell and `data-api-base=""`; `main.js` keeps the shared `setLoading`/`callApi`/`setupCard`/`renderText` helpers unchanged. Confirm every feature card has the full `<name>Input`/`<name>Validation`/`<name>Btn`/`<name>Result` set, each `setupCard` `endpoint` maps to a real `POST` route in `app.py`, and no card is static, read-only, or a source-code viewer.

Stop before any AWS, SSH, ECR, Secrets Manager, Nginx, or production step unless the user explicitly asks. Local repo changes come first; production wiring is a separate step.

## Constraints

1. Do not create a new DNS record, EC2 instance, SSL certificate, or separate Secrets Manager secret for a normal container project.
2. Do not remove path-prefix routing from Flask.
3. Keep main app Python modules in `src/python/`; standalone example sub-projects go under `src/<name>/`, never inside `src/python/`.
4. Do not commit changes or create branches unless asked; keep edits scoped to the new project folder and directly related shared files.
5. Always remove leaked secrets and local artifacts (`.venv/`, `.DS_Store`, `__pycache__/`) from user-provided files on discovery.
6. Only build demos and features covered by the study HTML/PDF source. Do not invent extras (quiz, flashcards, summary generator, etc.); every UI tile and route must map to a project or exercise in the source.
7. Keep the UI consistent with `projects/template/src/`: copy `style.css` verbatim, reuse the template `index.html` shell and the shared `main.js` helpers, and make every feature an interactive working demo tile. Never ship a divergent layout, a static code-reference browser, or read-only "view source" cards.
8. Keep routine development, deployment, rollback, and troubleshooting instructions in the project README, not in shared guides.
