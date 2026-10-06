# Git Branch Deployment Runbook (Deploy Any Branch)

This document defines the deployment lifecycle, branch rules, testing procedures, and rollback commands for projects deployed to `app.techtoday.click` (and the `techtoday.click` static site). **Every branch deploys on push**, so any branch can be tested live without a dedicated staging branch.

See [SETUP.md](SETUP.md) for the one-time infrastructure setup, [ADD_PROJECT.md](ADD_PROJECT.md) for adding a new container project, and [ARCHITECTURE.md](ARCHITECTURE.md) for the pipeline internals.

---

## 1. Strategy Overview

1. **Any branch deploys on push**:
   - Every `deploy-<project>.yml` workflow triggers on pushes to **any** branch (`branches: ['**']`) that touch `projects/<project-name>/**` or the workflow file itself.
   - The workflow builds the Docker image, configures Nginx routing and secrets on EC2, and restarts only that project's service — exactly as for `main`.
   - Use a short-lived feature branch per change (for example `feat/<project>-short-description`) and push it to test it live.
2. **One shared live environment**:
   - All branches deploy to the **same** EC2 host, URL, and container. Whichever branch deployed a project **last** is what is live for that project.
   - Each workflow has a `concurrency` group, so deploys of the same project run one at a time (queued, never cancelled mid-deploy). If several pushes queue up, GitHub keeps only the newest pending run.
   - Each run's job summary records the **branch** and image tags, so the Actions tab always shows which branch is live.
3. **`main` is the stable release**:
   - `main` holds verified, stable code. Merging into `main` redeploys the project from `main`.
   - After testing a branch, always leave the project running `main` again — either by merging the branch into `main`, or by redeploying `main` if the branch is abandoned (§ 2, Step 5).
4. **Manual deploys of any branch**:
   - Every workflow also has a `workflow_dispatch` trigger. Use **Actions → Deploy `<project>` → Run workflow** and pick a branch, or `gh workflow run deploy-<project>.yml --ref <branch>`, to deploy a branch without a new commit (for example, a freshly created branch with no new commits under the project path, which does not trigger the path filter).

---

## 2. Daily Development & Deployment Lifecycle

### Step 1: Create a Branch from `main`
```bash
git checkout main
git pull origin main
git checkout -b feat/<project-name>-short-description
```

### Step 2: Make Changes, Commit, and Push
1. Make your code, UI, or configuration changes under `projects/<project-name>/`.
2. Commit and push the branch:
   ```bash
   git add projects/<project-name>/
   git commit -m "feat(<project-name>): describe your changes here"
   git push -u origin feat/<project-name>-short-description
   ```
3. GitHub Actions detects the push and runs `deploy-<project-name>.yml`. Each workflow is path-scoped, so only the projects you changed are redeployed. The workflow:
   - Builds the Docker image and tags it with the Git commit SHA, build tag, and `:latest`.
   - Pushes the image to Amazon ECR.
   - Auto-provisions Nginx location blocks and secrets on EC2.
   - Pulls the new image and restarts only this container (`docker compose up -d`).
4. Every further push to the branch redeploys it.

### Step 3: Verify on the Live Environment
1. Check the **Actions** tab: confirm the run succeeded and the job summary shows your branch.
2. Open `https://app.techtoday.click/<project-name>/` and test the new or updated functionality.
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
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click "docker compose -f ~/apps/<project-name>/docker-compose.yml logs --tail 50"
   ```

### Step 4: If Verification SUCCEEDS — Merge into `main`
Open a pull request and merge it into `main` (squash-merge recommended), or merge locally:
```bash
git checkout main
git pull origin main
git merge feat/<project-name>-short-description
git push origin main
```
The push to `main` redeploys the project from `main`. Delete the feature branch afterwards:
```bash
git branch -d feat/<project-name>-short-description
git push origin --delete feat/<project-name>-short-description
```

### Step 5: If Verification FAILS — Redeploy `main`
The broken branch is still live, so put `main` back (no force-push needed):
```bash
gh workflow run deploy-<project-name>.yml --ref main
```
Or use **Actions → Deploy `<project-name>` → Run workflow → Branch: `main`**. Then keep fixing on the branch and push again, or delete the branch if it is abandoned.

---

## 3. Production Rollback & Emergency Procedures

### Scenario A: Reverting a Release on `main` via Git
If a change merged into `main` causes unexpected issues:
1. Find the commit on `main`:
   ```bash
   git checkout main
   git pull origin main
   git log -n 5 --oneline
   ```
2. Revert it (use `-m 1` for a merge commit; omit it for a squash-merge commit):
   ```bash
   git revert <commit-sha>
   ```
3. Push to `main`:
   ```bash
   git push origin main
   ```
4. GitHub Actions automatically builds and redeploys the previous stable state.

### Scenario B: Direct Container Rollback on EC2 (Fastest Recovery)
If you need an instant container rollback on the server without waiting for a new CI/CD build:
1. SSH into the EC2 instance:
   ```bash
   ssh -i /path/to/techtoday.pem ec2-user@app.techtoday.click
   ```
2. List available cached image tags:
   ```bash
   docker images | grep techtoday/<project-name>
   ```
3. Update the image tag in the project compose file:
   ```bash
   nano ~/apps/<project-name>/docker-compose.yml
   # Change image tag from :latest or <broken-sha> to <previous-working-sha>
   # For the multi-service `docker` project the file is ~/docker-compose.yml
   ```
4. Restart the service:
   ```bash
   docker compose -f ~/apps/<project-name>/docker-compose.yml up -d
   ```

> This pin is temporary: the next deploy of that project (from any branch)
> rewrites `~/apps/<project-name>/docker-compose.yml` back to `:latest`. Follow
> up with Scenario A so the fix lands in Git.

---

## 4. Quick Reference Cheatsheet

1. **Start a branch**:
   `git checkout main && git pull origin main && git checkout -b feat/<project-name>-desc`
2. **Deploy the branch for testing**:
   `git add projects/<project-name>/ && git commit -m "feat: description" && git push -u origin feat/<project-name>-desc`
3. **Redeploy any branch without a new commit**:
   `gh workflow run deploy-<project-name>.yml --ref <branch>`
4. **Verify the live endpoint**:
   `curl -I https://app.techtoday.click/<project-name>/`
5. **Release (when good)**:
   `git checkout main && git pull origin main && git merge feat/<project-name>-desc && git push origin main`
6. **Restore `main` on the host (when bad)**:
   `gh workflow run deploy-<project-name>.yml --ref main`
7. **Roll back `main` via Git**:
   `git checkout main && git revert <commit-sha> && git push origin main`
