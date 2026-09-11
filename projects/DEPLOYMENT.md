# Git Branch Deployment Runbook (Strategy 2: Staging & Main)

This document defines the deployment lifecycle, branch management rules, testing procedures, and rollback commands for projects deployed to `app.techtoday.click` using the dual-branch strategy (`staging` and `main`).

---

## 1. Strategy Overview

Strategy 2 provides a streamlined, direct workflow without requiring temporary feature branches:

1. **`staging` (Active Development & Testing Workbench)**:
   - All day-to-day development, rate-limiting rules, config adjustments, and bugfixes are made directly on this branch.
   - Pushes to `staging` automatically trigger GitHub Actions to build the Docker image, configure Nginx on EC2 (including rate limiting), and reload services for live testing.
2. **`main` (Production Release)**:
   - Represents the verified, stable production release.
   - You only merge `staging` into `main` after live verification on the host succeeds.
   - Merges pushed to `main` automatically deploy to production.
3. **Resolution of Failed Tests (Way 1 - Force Reset)**:
   - If changes deployed on `staging` fail or are not ready for release, `staging` is instantly reset to match `main` and force-pushed.
   - GitHub Actions detects the force-push and automatically redeploys the stable `main` state to the host.

---

## 2. Daily Development & Deployment Lifecycle

Follow these numbered steps for everyday development:

### Step 1: Make Changes Directly on `staging`
1. Switch to `staging` and make sure it is up to date:
   ```bash
   git checkout staging
   git pull origin staging
   ```
2. Make your code or configuration changes under `projects/<project-name>/`.
3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(project): update feature and rate limiting"
   ```
4. Push directly to `origin staging`:
   ```bash
   git push origin staging
   ```

### Step 2: Automated Deployment on Staging
1. GitHub Actions detects the push on `staging` and automatically triggers the corresponding `deploy-<project>.yml` workflow.
2. The workflow builds the container, pushes to Amazon ECR, ensures `/etc/nginx/conf.d/00-rate-limit.conf` and the project location block exist on EC2, and restarts the container.

### Step 3: Verify on Live Environment
1. Check the GitHub Actions tab to confirm the workflow run succeeded.
2. Test rate limiting by sending rapid POST requests:
   ```bash
   for i in {1..12}; do
     curl -s -o /dev/null -w "POST $i: HTTP %{http_code}\n" -X POST https://app.techtoday.click/<project-name>/
   done
   ```
   - Requests 1 through 10 should return normally (HTTP 200 / 400 / 405).
   - Requests 11 and 12 must return **HTTP 429 Too Many Requests** with clean JSON `{"error": "Rate limit exceeded (10 requests per hour). Please wait a minute and try again."}`.
   - In the web UI, hitting the limit will display a user-friendly error banner without crashing or showing raw HTML characters (`Unexpected token '<'`).
3. Verify GET requests are unthrottled:
   ```bash
   curl -s -o /dev/null -w "GET: HTTP %{http_code}\n" https://app.techtoday.click/<project-name>/
   ```
4. Inspect container logs if troubleshooting is needed:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click "docker compose -f ~/apps/<project-name>/docker-compose.yml logs --tail 50"
   ```

### Step 4: If Verification SUCCEEDS — Promote to `main`
Once your changes pass verification:
1. Switch to `main` and pull latest:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Merge `staging` into `main`:
   ```bash
   git merge staging
   ```
3. Push to `origin main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions runs the production deployment with the verified code.

### Step 5: If Verification FAILS — Rollback via Way 1 (Reset Staging to Main)
If the changes break or do not work as expected, discard them and restore the stable production state using Way 1:
1. Reset local `staging` to match remote `main`:
   ```bash
   git checkout staging
   git reset --hard origin/main
   ```
2. Force push `staging` to remote:
   ```bash
   git push origin staging --force
   ```
3. GitHub Actions triggers on the force-push and automatically redeploys the clean, working code from `main`.

---

## 3. Production Emergency Procedures

### Emergency Nginx Rate Limit Disable (Zero Downtime)
If rate limiting in production is blocking valid traffic and needs an immediate manual disable without waiting for CI/CD:
1. SSH into the EC2 instance:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click
   ```
2. Remove the `limit_req` directive from the project's location config:
   ```bash
   sudo sed -i '/limit_req/d' /etc/nginx/conf.d/app-locations/<project-name>.conf
   ```
3. Reload Nginx:
   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```
   *Rate limiting is instantly disabled while containers remain running.*

---

## 4. Quick Reference Cheatsheet

1. **Start working on staging**:
   `git checkout staging && git pull origin staging`
2. **Deploy changes to staging**:
   `git add . && git commit -m "feat: description" && git push origin staging`
3. **Test rate limiting**:
   `for i in {1..12}; do curl -s -o /dev/null -w "POST $i: HTTP %{http_code}\n" -X POST https://app.techtoday.click/<project-name>/; done`
4. **Promote staging to production (when good)**:
   `git checkout main && git pull origin main && git merge staging && git push origin main`
5. **Rollback staging to production (Way 1 - when bad)**:
   `git checkout staging && git reset --hard origin/main && git push origin staging --force`
6. **Rollback production via Git (if main has an issue)**:
   `git checkout main && git revert -m 1 <commit-sha> && git push origin main`
