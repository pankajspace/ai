Create or adapt a new container project folder in this repository using `projects/template` as the reference implementation.

`$ARGUMENTS` is required. Treat the first argument as the project name, for example:

```text
/create-container-project ai-04
/create-container-project ai-04 feature idea: PDF notes assistant; Python files already exist under /path/to/files
```

If `$ARGUMENTS` is empty, ask for the project name before editing. Parse the remaining arguments as optional feature notes, local/prod port overrides, Python file locations, secret names, and whether to create the GitHub Actions deploy workflow.

Use this command when the user wants to add a new project under `projects/`, copy the template locally, add or integrate Python files, and then make the resulting folder follow the same structure and deployment conventions as the existing container projects.

## Required Context

Read these files before editing:

1. `projects/PROJECTS.md`, especially `Container App Shared Conventions` and `Adding a new Container App`.
2. `projects/template/README.md`.
3. `projects/template/src/python/app.py`.
4. Neighboring project files from `projects/basic`, `projects/langchain`, or `projects/rag` when their structure helps decide how the new project should look.

## Inputs To Resolve

Before making changes, identify or ask for:

1. Project folder/service name from the first `$ARGUMENTS` token, for example `ai-04`.
2. Next free local development port, usually the next `808x` after existing container apps.
3. Next free EC2 host port, usually the matching next `500x` after existing container apps.
4. Whether Python feature files already exist, and where they should be copied from.
5. Required environment variables and whether they are new secrets or already present in `techtoday/secrets`.
6. Whether to create the matching GitHub Actions workflow from `deploy.yml.template` now.

If the user gives enough information, proceed without asking extra questions. If ports are not provided, infer them from `projects/PROJECTS.md` and existing project specs.

## Workflow

1. Inspect existing project allocations in `projects/PROJECTS.md` and confirm the next local and EC2 host ports.
2. Create `projects/<project-name>/` by copying `projects/template/` if the folder does not already exist.
3. Update `docker-compose.yml` so the `web` service publishes `<local-port>:5000` and service names follow the new project where applicable.
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
5. Integrate user-provided Python files under `src/python/`.
6. Modify `src/python/app.py` to expose the new feature routes through the Blueprint while preserving:
   1. `PATH_PREFIX = os.environ.get("PATH_PREFIX", "")`
   2. `app.register_blueprint(bp, url_prefix=PATH_PREFIX)`
   3. the `index()` route that injects `data-api-base="<PATH_PREFIX>"`
   4. static routes for `/css/<path:filename>` and `/js/<path:filename>`
7. Update `src/index.html`, `src/css/style.css`, and `src/js/main.js` so the browser calls the new API routes through the injected API base.
8. Update `requirements.txt` and `.env.example` for the Python files and secrets the project needs.
9. Update `README.md` with the project purpose, local URL, production URL, ports, path prefix, routes, environment variables, local run commands, and deployment notes.
10. If requested, copy `projects/<project-name>/deploy.yml.template` to `.github/workflows/deploy-<project-name>.yml` and replace every `PROJECT_NAME` token with the project name.
11. Update shared docs only when the user asks or when the project is ready to be documented:
    1. Add a new spec in `projects/PROJECTS.md` under `Container App Specs`.
    2. Add any new secrets to the shared setup notes.
    3. Add a public home-page card under `projects/techtoday/src/` if the project should be visible from the main site.

## Validation

After edits, run the cheapest relevant checks:

1. `python -m py_compile src/python/*.py` from the new project folder.
2. `docker compose config` from the new project folder.
3. If Docker is running and the user wants a runtime check, run `docker compose up web` and verify the local URL.
4. If a GitHub Actions workflow was generated, confirm no `PROJECT_NAME` placeholders remain in `.github/workflows/deploy-<project-name>.yml`.

Stop before any AWS, SSH, ECR, Secrets Manager, Nginx, or production deploy step unless the user explicitly asks for it. For this workflow, local repo changes come first; production wiring can be handled as a separate step.

## Constraints

1. Do not create a new DNS record, EC2 instance, SSL certificate, or separate Secrets Manager secret for a normal container project.
2. Do not remove path-prefix routing from Flask.
3. Do not put Python modules outside `src/python/` unless the user explicitly changes the project architecture.
4. Do not commit changes or create branches unless the user asks.
5. Keep edits scoped to the new project folder and directly related shared files.
