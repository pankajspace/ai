# Terraform — techtoday.click Infrastructure

Infrastructure-as-Code for the shared `techtoday.click` AWS setup described in
[../../projects/SETUP.md](../../projects/SETUP.md) and
[../../projects/ADD_PROJECT.md](../../projects/ADD_PROJECT.md).

It exists for two reasons:

1. **Disaster recovery** — rebuild the entire AWS footprint from code if
   something breaks.
2. **Zero manual per-project steps** — onboarding a new container app becomes
   one entry in a map plus `terraform apply`, instead of the manual ECR / Nginx
   / Compose / secrets steps in ADD_PROJECT.md § 4–§ 7.

## What Terraform manages

1. Security group (ports 22/80/443) in the default VPC.
2. EC2 instance (Amazon Linux 2023) + Elastic IP, bootstrapped with Docker,
   Docker Compose, Nginx, and Certbot via `user_data`.
3. Route 53 A records for `techtoday.click`, `www`, and `app`.
4. IAM: EC2 instance role (ECR pull + Secrets read), GitHub OIDC provider, and
   the `github-actions-deploy` role.
5. One ECR repository per container app + registry-level image scanning.
6. The `techtoday/secrets` Secrets Manager container (values managed
   out-of-band — never in state).
7. The EC2 in-box config: per-project Nginx location blocks,
   `~/docker-compose.yml`, and `~/secrets/<name>.env` files — rendered from the
   `container_projects` map and pushed over SSH.

## What Terraform does NOT manage

1. **Secret values.** Terraform creates the `techtoday/secrets` container only.
   Add/rotate keys with the CLI pattern in ADD_PROJECT.md § 6 or the Console.
2. **Image builds / container starts.** The per-project GitHub Actions workflow
   (see [../../projects/DAILY.md](../../projects/DAILY.md)) builds the image,
   pushes to ECR, and runs `docker compose up` on EC2.
3. **TLS certificate issuance at steady state.** Certbot runs once in
   `user_data` on a rebuild and auto-renews on the host thereafter.
4. **GitHub repository secrets.** Set `AWS_REGION`, `AWS_ACCOUNT_ID`,
   `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY` in GitHub (SETUP.md
   § 2.11.4). Terraform outputs give you the values.

## Layout

```text
infra/terraform/
├── bootstrap/              # one-time: S3 state bucket + DynamoDB lock table
├── Makefile                # make bootstrap / init / plan / apply / new-project
├── backend.tf              # S3 remote-state backend config
├── providers.tf            # AWS provider + default tags
├── versions.tf             # required Terraform + provider versions
├── variables.tf            # inputs incl. the container_projects map
├── projects.auto.tfvars.json  # container app list (source of truth, committed)
├── main.tf                 # module wiring
├── outputs.tf              # EIP, account ID, role ARNs, ECR URLs
├── terraform.tfvars.example
├── IMPORT.md               # adopt existing live resources
├── modules/
│   ├── network/            # security group
│   ├── compute/            # EC2 + Elastic IP + user_data
│   ├── dns/                # Route 53 records
│   ├── iam/                # EC2 role + OIDC + deploy role
│   ├── ecr/                # per-project repositories
│   ├── secrets/            # Secrets Manager container
│   └── config/             # renders + pushes Nginx/Compose/env to EC2
└── templates/              # user_data + Nginx/Compose/env templates

scripts/new-project.sh      # scaffolds a new app folder + workflow + tfvars entry
```

## Prerequisites

1. Terraform >= 1.6 (or OpenTofu >= 1.6).
2. AWS CLI authenticated as the `techtoday` IAM user (SETUP.md § 2.2):
   `aws login` then `aws sts get-caller-identity`.
3. The EC2 `.pem` key at `ssh_private_key_path` (default `~/.ssh/techtoday.pem`)
   with `chmod 400`.
4. `jq` and `make` for the `new-project` scaffolding helper
   (`brew install jq`; `make` ships with the Xcode command line tools).

## Load credentials before every session

If you use `aws login` (session credentials cached under `~/.aws/login`), the
AWS CLI sees them but the Terraform/OpenTofu provider does not — you get
`Error: No valid credential sources found`. Bridge them into standard
environment variables in **every new terminal** before any `tofu`/`terraform`/
`make` command:

```bash
eval "$(aws configure export-credentials --format env)"
```

These are temporary and expire; re-run the `eval` when you open a new shell or
hit a credentials error (run `aws login` first if the session itself expired).
`make` targets do not load these automatically.

## 1. First-time setup

### 1a. Bootstrap remote state

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply       # creates the S3 bucket + DynamoDB lock table
```

If you change the bucket/table names, update both `bootstrap/variables.tf` and
`backend.tf` to match.

### 1b. Initialize the main configuration

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # then edit github_org / github_repo
terraform init
```

### 1c. Adopt existing infrastructure

Your production infra already exists, so **import it** before applying — see
[IMPORT.md](IMPORT.md). Skip this only for a clean rebuild into a fresh account.

```bash
terraform plan   # after imports: expect no destroy/replace
terraform apply
```

## 2. Add a new container app (the payoff)

Replaces the manual AWS/EC2 steps in ADD_PROJECT.md § 4–§ 7 **and** the repo
scaffolding in § 2 / § 8. From `infra/terraform/`:

```bash
make new-project NAME=insights LOCAL=8083 HOST=5003
```

That single command:

1. Copies `projects/template/` to `projects/insights/` and sets its local dev
   port (ADD_PROJECT.md § 2).
2. Creates `.github/workflows/deploy-insights.yml` from the template
   (ADD_PROJECT.md § 8).
3. Registers `insights` in `projects.auto.tfvars.json`.
4. Runs `terraform apply`, which creates the `techtoday/insights` ECR repo, the
   Nginx `location /insights/` block, the `insights` service in
   `~/docker-compose.yml`, and `~/secrets/insights.env` on EC2.

Then finish up:

1. Build the app under `projects/insights/` (routes, UI, `requirements.txt`).
2. If it needs a new API key, add it to `techtoday/secrets` (ADD_PROJECT.md
   § 6), then re-run `make apply` to refresh env files.
3. Commit and push — the workflow builds the image and starts the container on
   its first run.
4. Update [../../projects/PROJECTS.md](../../projects/PROJECTS.md) (registry +
   next available ports).

Use `make scaffold NAME=... LOCAL=... HOST=...` to do the repo-side steps
without applying. Pick the next free `808x` local port and `500x` host port
from PROJECTS.md. Requires `jq` (`brew install jq`).

> **Prefer editing by hand?** You can also add the entry directly to
> `projects.auto.tfvars.json` and run `make apply`, then scaffold the folder and
> workflow yourself.

## 3. Disaster recovery (rebuild from scratch)

1. Ensure the state backend still exists (re-run bootstrap if the account was
   wiped).
2. In `modules/compute/main.tf`, temporarily remove `user_data` from the
   instance's `lifecycle { ignore_changes }` so the bootstrap script runs on the
   new instance (or `terraform taint module.compute.aws_instance.server`).
3. `terraform apply` recreates EC2, EIP, DNS, IAM, ECR, and Secrets container.
4. After DNS propagates, issue TLS certs on the host (SETUP.md § 2.9):

   ```bash
   ssh -i ~/.ssh/techtoday.pem ec2-user@$(terraform output -raw elastic_ip)
   sudo certbot --nginx -d techtoday.click -d www.techtoday.click
   sudo certbot --nginx -d app.techtoday.click
   ```

5. Restore secret values into `techtoday/secrets`, then push each project so
   CI/CD repopulates ECR and starts the containers.
6. Redeploy the static home page (`projects/techtoday`) per DAILY.md.

## Outputs

Run `terraform output` for the values you need in GitHub secrets:

1. `elastic_ip` → `EC2_HOST`
2. `account_id` → `AWS_ACCOUNT_ID`
3. `github_deploy_role_arn` → `AWS_DEPLOY_ROLE_ARN`
4. `ecr_repository_urls`, `app_url` → reference/verification

## Safety notes

1. `terraform.tfvars` and all `*.tfstate` files are git-ignored — never commit
   them.
2. The live EC2 instance ignores `ami`/`user_data` changes so `apply` never
   replaces it in place. Overriding that is a deliberate rebuild step (§ 3).
3. State lives in S3 with versioning + a DynamoDB lock, so concurrent applies
   are serialized and history is recoverable.
