# Terraform Getting Started — Set Up Without Touching Prod

Step-by-step guide to set up Terraform/OpenTofu for the `techtoday.click`
infrastructure and **import your existing production resources into state
without changing anything in prod**. You stop at `plan` and never run `apply`,
so the live EC2, DNS, and containers stay exactly as they are.

For the full reference, see [README.md](README.md) and [IMPORT.md](IMPORT.md).

## Reference Values (fill these in for your account)

Look these up once with the read-only commands in the
[Appendix](#appendix-how-to-look-up-the-values), then keep them here for future
runs. Replace every `<PLACEHOLDER>` below.

1. **AWS account ID:** `<ACCOUNT_ID>`
2. **AWS region:** `<REGION>` (default `us-east-1`)
3. **IAM user for CLI:** `<IAM_USER>` (e.g. `techtoday`)
4. **EC2 instance ID:** `<INSTANCE_ID>`
5. **EC2 public / Elastic IP:** `<ELASTIC_IP>`
6. **Elastic IP allocation ID:** `<EIP_ALLOC_ID>`
7. **Security group attached to instance:** `<INSTANCE_SG_ID>` (name: `<INSTANCE_SG_NAME>`)
8. **Route 53 hosted zone ID:** `<HOSTED_ZONE_ID>`
9. **ECR repositories:** `techtoday/basic`, `techtoday/langchain`, `techtoday/rag`
10. **Secret name:** `techtoday/secrets`
11. **EC2 IAM role:** `ec2-techtoday-server-role` (inline policy `AllowAppSecrets`, instance profile `ec2-techtoday-server-profile`)
12. **GitHub deploy role:** `github-actions-deploy`
13. **GitHub OIDC provider ARN:** `arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com`
14. **IaC CLI in use:** `<tofu|terraform>` (this repo's `make` targets auto-detect `tofu`, else `terraform`)

## Prerequisites

1. AWS CLI authenticated as the IAM user (`aws login`, then `aws sts get-caller-identity`).
2. OpenTofu **or** Terraform installed (`tofu version` or `terraform version`).
3. `jq` and `make` installed (see [../../projects/SETUP.md](../../projects/SETUP.md) § 1.6–§ 1.8).
4. The EC2 `.pem` key at `~/.ssh/techtoday.pem` with `chmod 400` (only needed later for `apply`, not for this import-only setup).

## Credentials: Load Before Every Session

If you authenticate with `aws login` (session credentials cached under
`~/.aws/login`), the AWS CLI can see them but the **Terraform/OpenTofu provider
cannot** — you get `Error: No valid credential sources found`. Bridge them into
standard environment variables the provider understands, in **every new
terminal** before running any `tofu`/`make` command:

```bash
eval "$(aws configure export-credentials --format env)"
```

Notes:

1. These are **temporary session credentials** and expire (they include an
   `AWS_CREDENTIAL_EXPIRATION`). Re-run the `eval` when you open a new shell or
   hit a credentials error. If the session itself expired, run `aws login`
   first, then the `eval`.
2. `make` targets do not load these automatically, so always run the `eval`
   line first in the same shell. Verify with:
   ```bash
   env | grep AWS_ACCESS_KEY_ID   # should print a value
   ```

> **Which CLI command do I type?** In the import step below, use whichever you
> installed — `tofu` or `terraform`. They are interchangeable here. The `make`
> targets (`make bootstrap`, `make init`, `make plan`) auto-detect the CLI, so
> only the raw `import` commands need the right binary name.

## Known Mismatches to Watch For

These are safe because you will NOT run `apply`, but you must know them:

1. **Security group:** If the instance uses the account **`default`** security
   group instead of a `techtoday-server-sg`, there is nothing to import for the
   SG. `plan` will show Terraform wanting to CREATE a new SG and re-point the
   instance — do not apply. Skip the SG import line.
2. **GitHub deploy role inline policy:** If `github-actions-deploy` has no
   inline policy, skip importing `module.iam.aws_iam_role_policy.github_ecr_push`.
   `plan` will show it as "to create" — harmless until applied.

---

## Step 1 — Confirm the AWS Account and Load Credentials

```bash
cd infra/terraform
aws sts get-caller-identity                          # Account should be <ACCOUNT_ID>
eval "$(aws configure export-credentials --format env)"   # load creds for the provider
```

## Step 2 — Create Remote State (once, ever)

Creates a NEW S3 bucket + DynamoDB lock table for state. These are brand-new,
isolated resources — they do not touch prod.

```bash
make bootstrap    # type "yes" when prompted
```

> **Already done.** If `techtoday-terraform-state` (S3) and
> `techtoday-terraform-locks` (DynamoDB) already exist, this step is complete —
> skip to Step 3.
>
> **`No valid credential sources found`?** You skipped the `eval` line in
> Step 1. Run it in this shell, then retry.

## Step 3 — Configure and Initialize

```bash
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: set github_org and github_repo
make init
```

## Step 4 — Import Existing Prod Resources (state-only, no prod impact)

Run these one at a time. Replace `<...>` with your Reference Values above.
Use `tofu` or `terraform` to match what you installed.

> **Skip on purpose:** the security group import (if the instance uses the
> `default` SG) and `module.iam.aws_iam_role_policy.github_ecr_push` (if the
> deploy role has no inline policy). Also skip IMPORT.md § 8 (the Nginx host
> edit) — that changes prod.

```bash
# --- Compute ---
tofu import 'module.compute.aws_instance.server' <INSTANCE_ID>
tofu import 'module.compute.aws_eip.server'      <EIP_ALLOC_ID>

# --- IAM ---
tofu import 'module.iam.aws_iam_role.ec2_server'             ec2-techtoday-server-role
tofu import 'module.iam.aws_iam_role_policy.ec2_app_secrets' 'ec2-techtoday-server-role:AllowAppSecrets'
tofu import 'module.iam.aws_iam_instance_profile.ec2_server' ec2-techtoday-server-profile
tofu import 'module.iam.aws_iam_openid_connect_provider.github' arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com
tofu import 'module.iam.aws_iam_role.github_deploy'          github-actions-deploy

# --- ECR ---
tofu import 'module.ecr.aws_ecr_repository.this["techtoday/basic"]'     techtoday/basic
tofu import 'module.ecr.aws_ecr_repository.this["techtoday/langchain"]' techtoday/langchain
tofu import 'module.ecr.aws_ecr_repository.this["techtoday/rag"]'       techtoday/rag
tofu import 'module.ecr.aws_ecr_registry_scanning_configuration.this'   <ACCOUNT_ID>

# --- Secrets Manager ---
tofu import 'module.secrets.aws_secretsmanager_secret.app' techtoday/secrets

# --- Route 53 records (format: ZONEID_NAME_TYPE) ---
tofu import 'module.dns.aws_route53_record.root' <HOSTED_ZONE_ID>_techtoday.click_A
tofu import 'module.dns.aws_route53_record.www'  <HOSTED_ZONE_ID>_www.techtoday.click_A
tofu import 'module.dns.aws_route53_record.app'  <HOSTED_ZONE_ID>_app.techtoday.click_A
```

## Step 5 — Plan, Then STOP

```bash
make plan
```

1. Confirm the plan shows **no destroy** of your EC2, Elastic IP, DNS records,
   ECR repos, or secret.
2. Expected "to create" (all fine because you will not apply): the new
   `techtoday-server-sg` + instance SG change, the `github_ecr_push` inline
   policy, and `module.config.null_resource.push_config`.
3. **Do not run `apply`.** Prod stays exactly as-is.

---

## What to Do Later (when ready to activate automation)

Only when you have a calm, low-traffic window and want Terraform to actively
manage config:

1. Reconcile the security group mismatch first (so `apply` will not change prod
   networking) — ask before doing this.
2. Do the one-time Nginx `include` migration in [IMPORT.md](IMPORT.md) § 8.
3. Run `make apply`.
4. Afterward, onboard new apps with `make new-project NAME=x LOCAL=8083 HOST=5003`.

## When to Run Terraform Going Forward

1. **Adding a container app:** `make new-project NAME=x LOCAL=8083 HOST=5003`.
2. **Any infra change:** edit `.tf` or `projects.auto.tfvars.json`, then
   `make plan` → `make apply`.
3. **After adding a key to `techtoday/secrets`:** `make apply` to refresh env files.
4. **Disaster-recovery rebuild:** see [README.md](README.md) § 3.

## The Golden Rule

Always `make plan` before `make apply`, and read it. Terraform tells you exactly
what it will create, change, or destroy — review that before typing `yes`,
especially anything touching `aws_instance` or `aws_eip`.

---

## Appendix: How to Look Up the Values

Read-only commands (nothing is changed). Fill the results into the Reference
Values section above.

```bash
# Account + identity
aws sts get-caller-identity

# EC2 instance ID + public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=techtoday-server" \
  --query "Reservations[].Instances[].{InstanceId:InstanceId,PublicIp:PublicIpAddress}" --output json

# Elastic IP allocation ID
aws ec2 describe-addresses \
  --query "Addresses[].{AllocationId:AllocationId,PublicIp:PublicIp,InstanceId:InstanceId}" --output json

# Security group(s) attached to the instance
aws ec2 describe-instances --instance-ids <INSTANCE_ID> \
  --query "Reservations[].Instances[].SecurityGroups[].{Id:GroupId,Name:GroupName}" --output json

# Route 53 hosted zone ID
aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='techtoday.click.'].Id" --output text | sed 's|/hostedzone/||'

# ECR repositories
aws ecr describe-repositories \
  --query "repositories[?starts_with(repositoryName, 'techtoday/')].repositoryName" --output json

# Secret
aws secretsmanager list-secrets \
  --query "SecretList[?Name=='techtoday/secrets'].Name" --output json

# IAM roles / policies / instance profile
aws iam list-role-policies --role-name ec2-techtoday-server-role --query "PolicyNames" --output json
aws iam list-instance-profiles-for-role --role-name ec2-techtoday-server-role \
  --query "InstanceProfiles[].InstanceProfileName" --output json
aws iam list-role-policies --role-name github-actions-deploy --query "PolicyNames" --output json

# OIDC provider ARN
aws iam list-open-id-connect-providers --output json
```
