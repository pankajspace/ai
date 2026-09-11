# Git Branch Deployment Runbook (Strategy 2: Staging & Main)

This document defines the deployment lifecycle, branch management rules, testing procedures, and rollback commands for projects deployed to `app.techtoday.click` using the dual-branch strategy (`staging` and `main`).

---

## 1. Strategy Overview

Strategy 2 provides a streamlined, direct Git workflow for all application features, bugfixes, UI updates, and infrastructure adjustments:

1. **`staging` (Active Development & Testing Workbench)**:
   - All day-to-day development, feature work, bugfixes, UI changes, and configuration updates are made directly on this branch.
   - Pushes to `staging` automatically trigger GitHub Actions to build the Docker image, configure Nginx routing and secrets on EC2, and restart the project service for live pre-production testing.
2. **`main` (Production Release)**:
   - Represents the verified, stable, and live production environment.
   - You only merge `staging` into `main` after live verification on the host succeeds.
   - Pushes/merges to `main` automatically deploy the release to production.
3. **Rollback of Failed Tests (Way 1 - Force Reset)**:
   - If changes deployed on `staging` break, fail tests, or are abandoned, `staging` is instantly reset to match `main` and force-pushed.
   - GitHub Actions detects the force-push and automatically redeploys the stable `main` state to the host.

---

## 2. Daily Development & Deployment Lifecycle

Follow these numbered steps for any everyday feature, fix, or update:

### Step 1: Make Changes Directly on `staging`
1. Switch to `staging` and make sure it is up to date:
   ```bash
   git checkout staging
   git pull origin staging
   ```
2. Make your code, UI, or configuration changes under `projects/<project-name>/`.
3. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(project): describe your changes here"
   ```
4. Push directly to `origin staging`:
   ```bash
   git push origin staging
   ```

### Step 2: Automated Deployment on Staging
1. GitHub Actions detects the push on `staging` and automatically triggers the corresponding `deploy-<project>.yml` workflow.
2. The workflow:
   - Builds the Docker image and tags it with the Git commit SHA, build tag, and `:latest`.
   - Pushes the image to Amazon ECR.
   - Auto-provisions Nginx location blocks and secrets on EC2.
   - Pulls the new image and restarts only this container (`docker compose up -d`).

### Step 3: Verify on Live Environment
1. Check the GitHub Actions tab in your repository to confirm the workflow run succeeded.
2. Verify the project in your browser:
   Open `https://app.techtoday.click/<project-name>/` and test the newly added or updated functionality.
3. Verify endpoint responses via terminal:
   ```bash
   # Check page availability
   curl -I https://app.techtoday.click/<project-name>/

   # Test API endpoint
   curl -s -X POST https://app.techtoday.click/<project-name>/<endpoint> \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```
4. Inspect container logs if troubleshooting is needed:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click "docker compose -f ~/apps/<project-name>/docker-compose.yml logs --tail 50"
   ```

### Step 4: If Verification SUCCEEDS — Promote to `main`
Once your changes pass verification:
1. Switch to `main` and pull the latest changes:
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

## 3. Production Rollback & Emergency Procedures

### Scenario A: Reverting a Production Release via Git
If a merged release causes unexpected issues in production:
1. Find the merge commit hash on `main`:
   ```bash
   git checkout main
   git pull origin main
   git log -n 5 --oneline
   ```
2. Revert the commit:
   ```bash
   git revert -m 1 <commit-sha>
   ```
3. Push to `main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions automatically builds and redeploys the previous stable state to production.

### Scenario B: Direct Container Rollback on EC2 (Fastest Recovery)
If you need an instant container rollback on the server without waiting for a new CI/CD build:
1. SSH into the EC2 instance:
   ```bash
   ssh -i /path/to/key.pem ubuntu@app.techtoday.click
   ```
2. List available cached image tags:
   ```bash
   docker images | grep techtoday/<project-name>
   ```
3. Update the image tag in the project compose file:
   ```bash
   nano ~/apps/<project-name>/docker-compose.yml
   # Change image tag from :latest or <broken-sha> to <previous-working-sha>
   ```
4. Restart the service:
   ```bash
   docker compose -f ~/apps/<project-name>/docker-compose.yml up -d
   ```

---

## 4. Quick Reference Cheatsheet

1. **Start working on staging**:
   `git checkout staging && git pull origin staging`
2. **Deploy changes to staging**:
   `git add . && git commit -m "feat: description" && git push origin staging`
3. **Verify live staging endpoint**:
   `curl -I https://app.techtoday.click/<project-name>/`
4. **Promote staging to production (when good)**:
   `git checkout main && git pull origin main && git merge staging && git push origin main`
5. **Rollback staging to production (Way 1 - when bad)**:
   `git checkout staging && git reset --hard origin/main && git push origin staging --force`
6. **Rollback production via Git (if main has an issue)**:
   `git checkout main && git revert -m 1 <commit-sha> && git push origin main`
