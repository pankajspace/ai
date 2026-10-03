---
description: "Use when: creating or reshaping a container project from projects/template with a self-contained README for local development, deployment, rollback, and troubleshooting; adding info (ⓘ) 'how this works' explainer pages (concept, request flow, code flow, source code) to a project's demo cards or to the TechToday site; or simplifying a TechToday AI class-notes HTML page (study/ai-demos/*.html) into the DSA-course design (removing Gradio, agenda, LinkedIn content and class numbers) and regenerating its .md"
name: "create-container-project"
argument-hint: "projectName, feature idea, optional local/prod ports, and whether Python files already exist — or a project + card(s) to explain — or a study/ai-demos/*.html class-notes page to simplify"
---

This skill covers a container project and its two kinds of companion teaching page. Pick the task, then read only the file it needs:

1. **Create or reshape a container project** — follow the rest of this file, starting at **Container Project**.
2. **Add ⓘ explainer pages** ("how this works": concept, request flow, code flow, source code) to a project's demo cards, or one project-level explainer on the TechToday site — read [explainer-pages.md](explainer-pages.md).
3. **Simplify a class-notes (Theory) page** in `projects/techtoday/study/ai-demos/*.html` into the DSA-course design and regenerate its `.md` — read [class-notes-page.md](class-notes-page.md).

When a new public project needs its catalog ⓘ link (Workflow step 11), build the target page with task 2 or 3.

## Container Project

Create or adapt a container project named `${input:projectName}` under `projects/`, using `projects/template` as the reference implementation and matching the structure and deployment conventions of the existing projects.

`${input:projectName}` is the project folder name, Docker Compose service name, ECR repository suffix, production `PATH_PREFIX`, and deploy-workflow suffix, unless the user overrides one explicitly.

## Required Context

Read before editing:

1. [projects/ADD_PROJECT.md](../../../projects/ADD_PROJECT.md) — `Pick Project Values` and the final documentation steps.
2. [projects/ARCHITECTURE.md](../../../projects/ARCHITECTURE.md) — `§ 5. Application and Container Runtime Architecture`.
3. [projects/DEPLOYMENT.md](../../../projects/DEPLOYMENT.md) — the `staging` → `main` branch flow the README must describe.
4. [projects/template/README.md](../../../projects/template/README.md) and [projects/template/src/python/app.py](../../../projects/template/src/python/app.py).
5. A neighboring project ([basic](../../../projects/basic), [langchain](../../../projects/langchain), or [rag](../../../projects/rag)) when its structure helps.
6. The matching `study/NN-<topic>/` folder, if one exists, for feature context and source material: its `.md`, the companion `.html` deck, and the class code under `notes/` (project classes also ship a reference solution folder beside `notes/`).

## Inputs To Resolve

Identify or ask for: project name; next free local port (`808x`) and EC2 host port (`500x`) from `ADD_PROJECT.md`, confirmed against existing READMEs/Compose files; whether Python feature files already exist and where from; required env vars (new secrets vs. already in `techtoday/secrets`); whether the project is production-documented; and whether it includes standalone example sub-projects (see **Complex Projects**).

Proceed without extra questions if you have enough information.

## Workflow

1. Confirm the next-port allocation from `ADD_PROJECT.md`. Local `8090` is taken by `projects/template` itself, so skip it when allocating or advancing local ports.
2. Create `projects/<project-name>/` by copying `projects/template/` if it does not exist.
3. Set the `web` service to publish `<local-port>:5000` in `docker-compose.yml`.
4. Keep the template structure unless the user asks otherwise: `Dockerfile`, `docker-compose.yml`, `requirements.txt`, `.env.example`, `.gitignore`, `deploy.yml.template`, `linkedin.txt`, `README.md`, `src/index.html`, `src/css/style.css`, `src/js/main.js`, `src/python/app.py`, `src/python/config.py`, feature modules under `src/python/`, and standalone example sub-projects under `src/<example-name>/`.
5. Integrate user-provided Python files under `src/python/`.
6. Expose new feature routes through the Blueprint in `app.py`, preserving:
   - `PATH_PREFIX = os.environ.get("PATH_PREFIX", "")`
   - `app.register_blueprint(bp, url_prefix=PATH_PREFIX)`
   - the `index()` route injecting `data-api-base="<PATH_PREFIX>"`
   - static routes for `/css/<path:filename>` and `/js/<path:filename>`
   - one `POST` route per feature that validates a non-empty input (→ `400`), validates any dropdown choices against an allowlist (→ `400`, see **Dropdowns for Choices**), wraps the feature call in `try/except` (→ `500`), and returns `{"result": ...}`.
7. Update `index.html`, `style.css`, and `main.js` following **Consistent UI and Working Demo Tiles** so the project matches every sibling project and every feature is a live, working demo tile — never a static, read-only, or "view source" card — with a dropdown for every discrete choice in the feature code.
8. Update `requirements.txt` and `.env.example` for the project's Python files and secrets.
9. Replace the template `README.md` with a self-contained runbook (see **README Requirements**).
10. **Create the deploy workflow** whenever the project is production-documented or the user wants deployment support. This is mandatory for any project you call deploy-ready. The template is self-provisioning: on the first push it creates the ECR repository, seeds the image, writes the project's `~/secrets/<project-name>.env`, drops the Nginx `/<project-name>/` location file under `/etc/nginx/conf.d/app-locations/` (with POST rate limiting: 10 requests upfront, 1r/m continuous refill, 429 status on excess), and creates the per-project Compose file on EC2 — so no manual ECR, SSH, Nginx, or Compose wiring is needed. Replace **both** placeholders (`PROJECT_NAME` and the `HOSTPORT` host port). From the repo root:
    ```bash
    cp projects/<project-name>/deploy.yml.template .github/workflows/deploy-<project-name>.yml
    sed -i -e "s/PROJECT_NAME/<project-name>/g" -e "s/HOSTPORT/<host-port>/g" .github/workflows/deploy-<project-name>.yml   # macOS: sed -i ''
    grep -nE 'PROJECT_NAME|HOSTPORT' .github/workflows/deploy-<project-name>.yml   # must print nothing
    ```
    The substituted template is complete for a single-service project. For a complex multi-container project it is only a starting point — extend it per **CI/CD Workflow for Complex Projects** before calling the project deploy-ready. The workflow auto-ensures the host's `/etc/nginx/conf.d/app-locations/*.conf` include, `/etc/nginx/conf.d/00-rate-limit.conf`, and `/etc/nginx/conf.d/app-locations/00-rate-limit-response.conf` on its first run, so no manual per-host Nginx step is needed (fresh hosts already get it from `SETUP.md` § 2.8).
11. When the project is ready to document: keep project-specific values in its `README.md`; advance the next-port allocation in `ADD_PROJECT.md`; update shared-secret setup notes only if the shared process changed; and add the root `README.md` runbook entry under `## Project Runbooks` (`N. [<Display Name>](projects/<project-name>/README.md)`, above *Container App Template*). If the project should be public, follow `ADD_PROJECT.md` § 8 *Public project catalog card update*:
    1. Add a card to `projects/techtoday/study/ai-demos/ai-demos.html` (copy an existing `.card`: icon SVG, `h3`, description, `Open project →` link to `https://app.techtoday.click/<project-name>/`) and mirror it in `ai-demos.md`.
    2. Start the card with the corner ⓘ link: `data-tooltip="Theory"` to the class's study page in `study/ai-demos/` (built per [class-notes-page.md](class-notes-page.md)), or `data-tooltip="Explanation"` to `../../info/<project-name>.html` (built per [explainer-pages.md](explainer-pages.md) §7).
    3. If featured on the homepage, add `<li><a href="https://app.techtoday.click/<project-name>/"><Display Name></a></li>` to the **AI Demos** tile's `ul.hub-bullet-list` in `projects/techtoday/index.html`, just above `Show All &rarr;`.

## README Requirements

`projects/<project-name>/README.md` is the source of truth for developing, operating, and deploying the project. Someone who has finished the one-time prerequisites in `projects/SETUP.md` must not need any other shared guide for routine work. Use concrete values, not placeholders. Link to `SETUP.md` only for one-time local/AWS setup; never store missing project instructions in shared index docs.

Include all applicable sections:

1. **Overview and features** — purpose, behavior, architecture, project structure.
2. **Project details** — type/folder, local and production URLs, local/container/EC2 ports, ECR repository, production service name, `PATH_PREFIX`, routes, workflow filename, trigger path.
3. **Environment variables** — each required/optional variable, which feature uses it, where to obtain it, and that `.env` is never committed.
4. **Prerequisites and first run** — OS-specific Docker startup, `docker info`, `.env` creation, build/start commands, URL to open.
5. **Daily local development** — reload/volume behavior, when to rebuild, one-off feature commands, logs, shell access, status, shutdown, persistent-data reset.
6. **Production setup** — the self-provisioning deploy workflow creates the ECR repository, seeds the image, writes `~/secrets/<project-name>.env`, adds the Nginx `/<project-name>/` location file under `/etc/nginx/conf.d/app-locations/` (with POST rate limiting enabled), auto-ensures the `app-locations/*.conf` include, `/etc/nginx/conf.d/00-rate-limit.conf`, and `/etc/nginx/conf.d/app-locations/00-rate-limit-response.conf` (for JSON 429 responses), and creates the per-project Compose service (image URL not `build:`, `PATH_PREFIX=/<project-name>`, host-port mapping) automatically on every push. Document only the one manual item that remains: if the project introduces brand-new keys, add them to `techtoday/secrets` locally as the `techtoday` IAM user before the first deploy (the EC2 instance role can only read secrets and pull images — `secretsmanager:PutSecretValue` on EC2 fails with `AccessDeniedException` by design). No manual ECR, image seed, Nginx, env-file, or Compose wiring is needed.
7. **Commit and automatic deployment** — branches (`staging` for pre-production testing, `main` for production release; see `projects/DEPLOYMENT.md`), `git add`/commit/push, PR expectations, workflow path, trigger path, ECR repository, affected EC2 service.
8. **Production verification and troubleshooting** — verification `curl` URL, service logs, Compose inspection, required production command, health/dependency checks, scoped restart.
9. **Rollback** — ECR repository, region, production service, image-tag procedure, verification URL.
10. **Manual deployment** — build context, image name, architecture, ECR path, production service, disk-space recovery, retry commands.
11. **Deployment status** — state clearly when automation is incomplete. Never claim auto-deploy unless the workflow exists and covers all required services.

## Consistent UI and Working Demo Tiles

Every project must share one look and feel and present each feature as an interactive demo tile. The template (`projects/template/src/`) is the single source of truth for the UI; copy its structure verbatim and change only the project-specific content below. Sibling projects (`basic`, `langchain`, `rag`) show the pattern applied. Never let a project diverge into a different layout, a static code-reference browser, or read-only "view source" cards.

### CSS — copy verbatim, never restyle

Copy `projects/template/src/css/style.css` unchanged into the new project. The only permitted edits are the top-of-file header comment naming the project and the two documented opt-in blocks: the `.options`/`.option` dropdown row (see **Dropdowns for Choices**) and the `.info-link` icon (see [explainer-pages.md](explainer-pages.md) §1). Do not fork colors, fonts, spacing, the CSS variables (`--bg`, `--bg-elevated`, `--accent`, `--text`, `--border`), the `.grid`, `.card`, `.card-wide`, `.spinner`, `.validation`, `.result`, or `.error` rules. If a design change is genuinely needed, change the template and re-copy so all projects stay in sync — do not patch one project.

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

Add a bespoke `render` function only when the response is richer than a single text string (e.g. rendering a list or table); reuse `renderText` for the common `{"result": "<text>"}` case. Every `endpoint` must correspond to a real `@bp.route(..., methods=["POST"])` in `app.py`, and every `field` must match the key that route reads from the JSON body. The shared `callApi` helper automatically intercepts non-OK responses (`!res.ok`), extracts JSON error details if present, safely falls back on HTTP 429 rate limit errors (`Rate limit exceeded (10 requests per hour). Please wait an hour and try again.`), and prevents raw HTML or JSON parse crashes.

### Dropdowns for Choices

Whenever a feature's code has a discrete choice that changes the outcome — a strategy, prompt variant, preset question/case, temperature, number of rounds, judge/provider layout, threshold, failure mode, model — expose it as a dropdown on that card so visitors can re-run and **see the difference**. Do not hide such choices as hardcoded constants or make users type magic preset IDs into a text box. Only offer values the code genuinely supports; do not invent options the source material has no basis for.

**Which choices to expose** (scan each feature module for these):

1. A set of compared strategies/conditions → `All` (default, the full comparison) plus each one individually.
2. Each axis of a factorial design (e.g. names × descriptions) → one dropdown per axis with `Both` plus each level.
3. Preset inputs (questions, test cases, sample complaints) → a picker. If the feature only accepts presets, the `<select>` **replaces** the text input and takes its `<name>Input` id. If free text is also valid, keep the text box and add a preset picker that fills it, with a final `Custom…` option.
4. Sampling knobs (`temperature`) → a small fixed set such as `0`, `0.7`, `1.2`.
5. Counts and thresholds (rounds, judges, caps, which call fails) → a small fixed set including the original value as the default.

The default `selected` option must reproduce the original behaviour exactly, so a request without the extra fields behaves as before.

**index.html** — place a labelled row of dropdowns between the card `<p>` and the input:

```html
<div class="options">
    <label class="option">Strategy
        <select id="fooStrategy">
            <option value="all" selected>All three</option>
            <option value="A">A · Unconstrained</option>
        </select>
    </label>
    <label class="option">Temperature
        <select id="fooTemperature">
            <option value="0">0</option>
            <option value="0.7" selected>0.7</option>
            <option value="1.2">1.2</option>
        </select>
    </label>
</div>
```

Name each select `<name><Choice>` (e.g. `cotStrategy`, `routingNames`). Update the card text and button label so they no longer state a fixed count or setting ("Run extractions", not "Run 15 extractions").

A preset picker that fills a text box uses `data-target` on the `<select>` and `data-text` on each option (empty `data-text` = the Custom option):

```html
<select id="fooPreset" data-target="fooInput">
    <option selected data-text="Full preset question text…">Short label</option>
    <option data-text="">Custom question…</option>
</select>
```

**style.css** — add this block once, directly above `/* Form controls */` (a project that already has a `.model-select-wrap`/`.model-select` pattern may reuse it instead, wrapping several wraps in a flex-wrap row):

```css
/* A row of labelled dropdowns that vary one choice in the demo. */
.options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
}

.option {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
}

.option select {
    background: var(--bg-elevated-2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    color: var(--text);
    cursor: pointer;
    outline: none;
}

.option select:hover,
.option select:focus {
    border-color: var(--accent);
}
```

**main.js** — extend `setupCard` with one optional `selects` map (JSON body key → select id); this is the only permitted change to the shared helpers. In the click handler, replace the inline body with:

```js
const body = { [config.field]: value };
// config.selects maps a JSON body key to the id of a <select> on the card.
for (const [key, id] of Object.entries(config.selects || {})) {
    body[key] = document.getElementById(id).value;
}
callApi({ btn, result, endpoint: config.endpoint, body, render: config.render });
```

and pass it per card: `selects: { strategy: "fooStrategy", temperature: "fooTemperature" }`. A `<select>` used as the card input works with `setupCard` unchanged (it fires `input` and has a non-empty `value`). Only when a card has a preset picker, add this helper and call `bindPresetSelects()` first in the `DOMContentLoaded` handler:

```js
function bindPresetSelects() {
    document.querySelectorAll("select[data-target]").forEach((select) => {
        const target = document.getElementById(select.dataset.target);
        const apply = () => {
            const text = select.selectedOptions[0].dataset.text || "";
            target.value = text;
            target.dispatchEvent(new Event("input"));
            if (!text) target.focus();
        };
        select.addEventListener("change", apply);
        // Hand-editing the text switches the picker to its Custom option.
        target.addEventListener("input", () => {
            if (target.value !== (select.selectedOptions[0].dataset.text || "")) {
                select.value = [...select.options].find((o) => !o.dataset.text)?.value ?? select.value;
            }
        });
        apply();
    });
}
```

**Backend** — the dropdown values are untrusted input. Validate each against an allowlist defined next to the feature code and return `400` for anything else:

1. Define the allowed values as module constants beside the feature, e.g. `STRATEGY_CHOICES = ("all", "A", "B", "C")`, `TEMPERATURE_CHOICES = {"0": 0.0, "0.7": 0.7, "1.2": 1.2}` (shared ones in `config.py`). Map strings to numbers through a dict; never `float()`/`int()` raw input.
2. In `app.py` add two helpers and use them in every route that takes choices:
   ```python
   def read_choice(name: str, allowed, default: str) -> str | None:
       """Return a dropdown value from the JSON body, ``default`` if absent, or None if not allowed."""
       data = request.get_json(force=True, silent=True) or {}
       value = str(data.get(name) or default)
       return value if value in allowed else None


   def invalid_choice(name: str, allowed):
       return jsonify({"error": f"Invalid {name}. Choose one of: {', '.join(map(str, allowed))}."}), 400
   ```
   Route pattern: validate `message` (→ 400), then each choice (`if value is None: return invalid_choice(...)`), then call the feature inside `try/except` (→ 500).
3. Add keyword parameters with the original values as defaults to the feature function (`run_foo(message, strategy="all", temperature=0.7)`), and thread them down to the model call instead of reading module constants.
4. Make the report adapt to a subset: summary lines, lifts, trade-offs, or multipliers that need a comparison partner are printed only when that partner ran; otherwise print a one-line tip (e.g. "pick 'Both' to see the trade-off") or return `null` (and have the renderer omit it) instead of a misleading number.
5. Keep the worst-case choice inside the 60 s Nginx proxy timeout: count the model calls of the largest option and run independent calls in parallel with `concurrent.futures.ThreadPoolExecutor` (cap `max_workers` around 8).

**README** — in the Routes list, document every optional body field with its allowed values and default, and state that invalid values return `400`.

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

The stock `deploy.yml.template` is self-provisioning but single-service: it builds one image at the project root, creates one ECR repository, and provisions/pulls/restarts one service (the `PROJECT_NAME` service, mapped to the `HOSTPORT` host port). A complex project builds several images from different contexts (e.g. `web` plus example sub-projects) and runs multiple services, so the unmodified template deploys only the gateway and leaves the rest stale. When adding the workflow:

1. Still create `.github/workflows/deploy-<project-name>.yml` — never skip it.
2. Ensure an ECR repository exists and build/push an image for **every** build context, or build them together via `docker compose build` against the production Compose file.
3. On EC2, provision, pull, and restart **all** of the project's services, not a single `PROJECT_NAME` service. Name every service explicitly in both `docker compose pull` and `docker compose up -d --wait`, including dependency services (databases, Redis, Chroma) and services behind `--profile` flags. A bare `up -d --wait` acts on every service in the file, so a leftover or broken entry from another project in a shared Compose file aborts the whole rollout. Prefer the template's per-project `~/apps/<project-name>/docker-compose.yml`; `.github/workflows/deploy-docker.yml` is the working multi-service example (it still uses the shared `~/docker-compose.yml`, which is why it names its services).
4. If examples are keyless and rarely change, automating only the gateway is acceptable — but say so explicitly in the README's deployment-status section and do not describe the project as fully auto-deploying.
5. Never call a complex project deploy-ready while the workflow covers only the gateway image.

## Validation

Run the cheapest relevant checks after editing:

1. `python3 -m py_compile src/python/*.py` from the project folder.
2. `docker compose config` from the project folder (copy `.env` from `.env.example` first if needed).
3. Optional runtime check if Docker is running and the user wants it: `docker compose up web`, then open the local URL.
4. If a workflow was generated, confirm no `PROJECT_NAME` or `HOSTPORT` placeholders remain and that every workflow/file named by the README exists.
5. Confirm the README has concrete start, deploy, verification, rollback, manual-fallback, and troubleshooting commands, and that intentionally incomplete deployment is stated as such.
6. Search the README for stray placeholders (`<project-name>`, `<local-port>`, `PROJECT_NAME`, `HOSTPORT`, generic feature-service names) and remove them unless part of a labeled template example.
7. Verify UI consistency against the template: `style.css` differs from `projects/template/src/css/style.css` only in the header comment and the documented opt-in blocks (`.options`/`.option`, `.info-link`); `index.html` keeps the template head/nav/hero/footer shell and `data-api-base=""`; `main.js` keeps the shared `setLoading`/`callApi`/`setupCard`/`renderText` helpers unchanged apart from the optional `selects` map. Confirm every feature card has the full `<name>Input`/`<name>Validation`/`<name>Btn`/`<name>Result` set, each `setupCard` `endpoint` maps to a real `POST` route in `app.py`, and no card is static, read-only, or a source-code viewer.
8. Verify dropdowns: every discrete choice in the feature code is exposed on its card; each `selects` key matches a field the route reads; defaults reproduce the original behaviour; an out-of-allowlist value returns `400` (test with Flask's `test_client()`, sending a distinct `X-Real-IP` header per request because the SQLite rate limiter in `/tmp` persists across processes); preset pickers fill their text box and switch to Custom on manual edits; and the dropdown rows do not overflow their cards.

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
