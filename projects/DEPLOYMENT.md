# Git Branch Deployment Runbook (Strategy 2: Staging & Main)

This document defines the deployment lifecycle, branch management rules, testing procedures, and rollback commands for projects deployed to `app.techtoday.click` using the dual-branch strategy (`staging` and `main`).

---

## 1. Strategy Overview

Strategy 2 separates experimental development and staging validation from live production releases through two long-lived branches:

1. **`main` (Production)**:
   - Represents the verified, stable, and live production environment.
   - Deployments are triggered automatically whenever commits are merged into `main`.
   - Direct pushes to `main` should be restricted; all code enters `main` via PR or after verification in `staging`.
2. **`staging` (Pre-Production / Testing)**:
   - Mirrors the production build and deployment pipeline.
   - Pushes to `staging` automatically build the container, update Nginx configuration (including rate limiting), and deploy the application for live verification.
   - Used to validate breaking changes, reverse proxy routing, rate limit rules, and database migrations before touching production.
3. **`feat/<name>` or `fix/<name>` (Feature Branches)**:
   - Short-lived branches created off `main` for individual features or fixes.
   - Merged into `staging` for testing, and into `main` for release.

---

## 2. Daily Development & Deployment Lifecycle

Follow these numbered steps for any new feature, bugfix, or architectural update:

### Step 1: Start from Clean Production Code
1. Switch to `main` and pull the latest changes:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create and switch to your feature branch:
   ```bash
   git checkout -b feat/my-new-feature
   ```

### Step 2: Implement and Test Locally
1. Make your code changes under `projects/<project-name>/`.
2. Run local tests and verify the container runs properly:
   ```bash
   cd projects/<project-name>
   docker compose up --build
   ```
3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(project): implement new feature"
   ```

### Step 3: Deploy to Staging for Live Verification
1. Ensure your local `staging` branch is up to date:
   ```bash
   git checkout staging
   git pull origin staging
   ```
2. Merge your feature branch into `staging`:
   ```bash
   git merge feat/my-new-feature
   ```
3. Push to `origin staging`:
   ```bash
   git push origin staging
   ```
4. GitHub Actions automatically executes the deploy workflow for the modified project, builds the container with the git commit SHA and `:latest`, pushes to Amazon ECR, provisions Nginx on EC2, and restarts the service.

### Step 4: Verify in Staging
1. Check the GitHub Actions run tab to confirm the workflow succeeded.
2. Verify rate limiting by sending rapid POST requests:
   ```bash
   for i in {1..12}; do
     curl -s -o /dev/null -w "POST $i: HTTP %{http_code}\n" -X POST https://app.techtoday.click/<project-name>/
   done
   ```
3. Confirm unthrottled GET requests:
   ```bash
   curl -s -o /dev/null -w "GET: HTTP %{http_code}\n" https://app.techtoday.click/<project-name>/
   ```
4. Check service logs on EC2 if needed:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click "docker compose -f ~/apps/<project-name>/docker-compose.yml logs --tail 50"
   ```

### Step 5: Promote Verified Staging to Production
Once staging verification is successful:
1. Switch to `main`:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Merge your tested feature branch (or `staging`):
   ```bash
   git merge feat/my-new-feature
   ```
3. Push to `origin main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions deploys the verified artifact directly to production.

---

## 3. Rollback & Recovery Procedures

Because all deployments are driven by Git commits, rollbacks are fast, repeatable, and audit-logged.

### Scenario A: Staging Deployment Fails or Needs Reset
If a test on `staging` fails and you want to reset the staging environment back to the stable production state:
1. Reset local `staging` to match remote `main`:
   ```bash
   git checkout staging
   git reset --hard origin/main
   ```
2. Force push `staging` to remote:
   ```bash
   git push origin staging --force
   ```
3. GitHub Actions triggers and redeploys the stable production code to the host.

### Scenario B: Production Issue After Merging to `main`
If an issue occurs in production after merging to `main`:
1. Check out `main` and find the merge commit hash:
   ```bash
   git checkout main
   git pull origin main
   git log -n 5 --oneline
   ```
2. Revert the commit using Git:
   ```bash
   git revert -m 1 <commit-sha>
   ```
3. Push the revert to `main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions detects the push on `main` and automatically redeploys the previous working code and configuration.

### Scenario C: Instant Zero-Downtime Nginx Rate Limit Disable (Emergency)
If legitimate users are being blocked by a rate limit in production and you need an immediate fix without waiting for CI/CD:
1. SSH into the EC2 instance:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click
   ```
2. Remove the `limit_req` line from the project's location config:
   ```bash
   sudo sed -i '/limit_req/d' /etc/nginx/conf.d/app-locations/<project-name>.conf
   ```
3. Reload Nginx:
   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```
   *Rate limiting is instantly disabled while containers continue running.*

---

## 4. Quick Reference Cheatsheet

1. **Create feature branch**:
   `git checkout -b feat/<name> main`
2. **Deploy to staging**:
   `git checkout staging && git merge feat/<name> && git push origin staging`
3. **Reset staging to production state**:
   `git checkout staging && git reset --hard origin/main && git push origin staging --force`
4. **Deploy to production**:
   `git checkout main && git merge feat/<name> && git push origin main`
5. **Rollback production via Git**:
   `git checkout main && git revert -m 1 <commit-sha> && git push origin main`
6. **Test rate limiting endpoint**:
   `for i in {1..12}; do curl -s -o /dev/null -w "POST $i: HTTP %{http_code}\n" -X POST https://app.techtoday.click/<project-name>/; done`

