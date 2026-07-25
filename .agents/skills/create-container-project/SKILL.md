---
description: "Use when: creating or reshaping a new local container project folder from projects/template in this repo"
name: "Create Container Project"
argument-hint: "projectName, feature idea, optional local/prod ports, and whether Python files already exist"
agent: "gemini"
---

Create or adapt a new container project folder named `${input:projectName}` in this repository using `projects/template` as the reference implementation.

Use this prompt when the user wants to add a new project under `projects/`, copy the template locally, add or integrate Python files, and then make the resulting folder follow the same structure and deployment conventions as the existing container projects.

Project name parameter: `${input:projectName}`. Treat this as the required project folder name, Docker Compose service name, ECR repository suffix, production path prefix, and deploy workflow suffix unless the user explicitly overrides one of those names.

## Required Context

Read these files before editing:

1. [projects/PROJECTS.md](../../projects/PROJECTS.md), especially `Container App Shared Conventions` and `Adding a new Container App`.
2. [projects/template/README.md](../../projects/template/README.md).
3. [projects/template/src/python/app.py](../../projects/template/src/python/app.py).
4. Neighboring project files from [projects/basic](../../projects/basic), [projects/langchain](../../projects/langchain), or [projects/rag](../../projects/rag) when their structure helps decide how the new project should look.
5. The matching study file under `study/` (if one exists) to understand the project's feature context and source material.

## Inputs To Resolve

Before making changes, identify or ask for:

1. Project folder/service name from `${input:projectName}`, for example `ai-04`.
2. Next free local development port, usually the next `808x` after existing container apps.
3. Next free EC2 host port, usually the matching next `500x` after existing container apps.
4. Whether Python feature files already exist, and where they should be copied from.
5. Required environment variables and whether they are new secrets or already present in `techtoday/secrets`.
6. Whether the project is production-documented. If yes, create the matching GitHub Actions workflow from `deploy.yml.template` in the same change.
7. Whether the project includes standalone example sub-projects (each with their own Dockerfiles, compose files, or multiple containers). See the **Complex Projects** section below.

If the user gives enough information, proceed without asking extra questions. If ports are not provided, infer them from `projects/PROJECTS.md` and existing project specs.

## Workflow

1. Inspect existing project allocations in `projects/PROJECTS.md` and confirm the next local and EC2 host ports.
2. Create `projects/<project-name>/` by copying `projects/template/` if the folder does not already exist.
3. Update `docker-compose.yml` so the `web` service publishes `<local-port>:5000` and the service names follow the new project where applicable.
4. Keep this structure unless the user explicitly asks otherwise:
   1. `Dockerfile`
   2. `docker-compose.yml`
   3. `requirements.txt`
   4. `.env.example`
   5. `.gitignore`
   6. `deploy.yml.template`
   7. `linkedin.txt`
   8. `README.md`
   9. `src/index.html`
   10. `src/css/style.css`
   11. `src/js/main.js`
   12. `src/python/app.py`
   13. `src/python/config.py`
   14. feature modules under `src/python/`
   15. standalone example sub-projects under `src/<example-name>/` (see **Complex Projects**)
5. Integrate user-provided Python files under `src/python/`.
6. Modify `src/python/app.py` to expose the new feature routes through the Blueprint while preserving:
   1. `PATH_PREFIX = os.environ.get("PATH_PREFIX", "")`
   2. `app.register_blueprint(bp, url_prefix=PATH_PREFIX)`
   3. the `index()` route that injects `data-api-base="<PATH_PREFIX>"`
   4. static routes for `/css/<path:filename>` and `/js/<path:filename>`
7. Update `src/index.html`, `src/css/style.css`, and `src/js/main.js` so the browser calls the new API routes through the injected API base.
8. Update `requirements.txt` and `.env.example` for the Python files and secrets the project needs.
9. Update `README.md` with the project purpose, local URL, production URL, ports, path prefix, routes, environment variables, local run commands, and deployment notes.
10. If the project is production-documented or the user asks for deployment support, copy `projects/<project-name>/deploy.yml.template` to `.github/workflows/deploy-<project-name>.yml` and replace every `PROJECT_NAME` token with the project name.
11. Update shared docs only when the user asks or when the project is ready to be documented:
    1. Add a new spec in `projects/PROJECTS.md` under `Container App Specs`.
    2. Add any new secrets to the shared setup notes.
    3. Add a public home-page card under `projects/techtoday/src/` if the project should be visible from the main site.

## Complex Projects — Standalone Example Sub-Projects

Some projects contain multiple standalone example sub-projects (each with their own Dockerfiles, docker-compose files, and independent containers) alongside the main Flask app. This is common for study-related projects where the examples from the study material are included as reference implementations.

### When to use this pattern

Use standalone example sub-projects when:
- The user provides pre-existing project folders that are complete Docker projects (have their own Dockerfile, docker-compose.yml, requirements.txt).
- The examples run independently from the main Flask web app and are not Flask Blueprint features.
- Each example may have its own multiple containers (e.g. app + database, or agent + tools + Redis).

### Structure for complex projects

Place standalone example sub-projects as sibling directories under `src/`, NOT inside `src/python/`:

```
src/
├── python/              # Main Flask app source (app.py, config.py, features)
├── css/, js/            # Main app front-end
├── index.html
├── example-one/         # Standalone example (own Dockerfile)
├── example-two/         # Standalone example (own Dockerfile + compose)
└── example-three/       # Standalone example (multiple Dockerfiles + compose)
```

The rationale: these are complete Docker projects, not Python modules of the main app. Placing them under `src/python/` wrongly implies they are importable modules.

### Ordering

Always arrange example sub-projects from **simpler to more complex**, both in the README and the UI cards. Use explicit labels like "Level 1 · 1 container", "Level 2 · 2 containers", etc. Reference the study material (HTML/MD files under `study/`) to determine the correct pedagogical order.

### Integrating user-provided example files

When the user says they have already added Python/project files:

1. **Discover** — list the project directory to find all user-provided files before making changes.
2. **Assess** — determine whether each file/folder is a Flask-integrated feature (belongs in `src/python/`) or a standalone example project (belongs in `src/<name>/`).
3. **Restructure** — move standalone projects to their correct location under `src/`.
4. **Clean up** — always check for and remove:
   - `.env` files containing real API keys or secrets (these must never be committed).
   - `.venv/` or `venv/` directories (local virtual environments).
   - `.DS_Store` files.
   - `__pycache__/` directories.
   - Any `*.pkl`, `*.h5`, or other model artifacts.
5. **Document** — update README and index.html to reference each example with its correct path, complexity level, and container count.
6. **Update .gitignore** — ensure the project-level `.gitignore` catches `.env`, `.venv/`, `*.pkl`, `.DS_Store`, and similar artifacts in subdirectories too.

### README for complex projects

The README should include:
- A **Project Structure** tree showing where everything lives.
- An **Example Projects** section with explicit complexity ordering (Level 1/2/3).
- Each example's container count, what Docker concepts it covers, what keys it needs, and a quick-start command block.
- A note clarifying that examples are standalone and not part of the main Flask app.

### index.html for complex projects

Add info cards for each example with a badge showing the level and container count (e.g. `<span class="badge">Level 1 · 1 container</span>`). Order the cards from simplest to most complex.

## Validation

After edits, run the cheapest relevant checks:

1. `python3 -m py_compile src/python/*.py` from the new project folder. Use `python3` (not `python`) on macOS.
2. `docker compose config` from the new project folder (requires `.env` to exist — copy from `.env.example` first if needed).
3. If Docker is running and the user wants a runtime check, run `docker compose up web` and verify the local URL.
4. If `projects/PROJECTS.md` lists `.github/workflows/deploy-<project-name>.yml`, confirm that file exists.
5. If a GitHub Actions workflow was generated, confirm no `PROJECT_NAME` placeholders remain in `.github/workflows/deploy-<project-name>.yml`.

Stop before any AWS, SSH, ECR, Secrets Manager, Nginx, or production deploy step unless the user explicitly asks for it. For this workflow, local repo changes come first; production wiring can be handled as a separate step.

## Constraints

1. Do not create a new DNS record, EC2 instance, SSL certificate, or separate Secrets Manager secret for a normal container project.
2. Do not remove path-prefix routing from Flask.
3. Do not put main app Python modules outside `src/python/` unless the user explicitly changes the project architecture.
4. Standalone example sub-projects go under `src/<name>/`, never inside `src/python/`.
5. Do not commit changes or create branches unless the user asks.
6. Keep edits scoped to the new project folder and directly related shared files.
7. Always remove leaked secrets (`.env` files with real keys) immediately upon discovery.
8. Always clean up local artifacts (`.venv/`, `.DS_Store`, `__pycache__/`) from user-provided files.
