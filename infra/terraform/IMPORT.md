# Importing Existing AWS Infrastructure

Your AWS resources already exist and serve production. This guide adopts them
into Terraform state **without recreating or interrupting anything**. Run these
`terraform import` commands once, after `terraform init` and before your first
`terraform apply`.

> After each import, run `terraform plan`. The goal is a plan with **no
> destroy/replace** actions — only in-place attribute tweaks (tags, etc.) or
> the `module.config` push. If a plan wants to destroy/recreate a resource,
> stop and reconcile the config to match reality before applying.

## 1. Prerequisites

1. Complete the bootstrap module so remote state exists (see [README.md](README.md) § 2).
2. `cd infra/terraform && terraform init`.
3. Set your real values in `terraform.tfvars` (copy from `terraform.tfvars.example`).
4. Have these IDs handy from the AWS Console or CLI:
   - EC2 instance ID (`i-0123...`)
   - Elastic IP allocation ID (`eipalloc-0123...`)
   - Security group ID (`sg-0123...`)
   - Route 53 hosted zone ID (`Z0123...`)
   - Your 12-digit AWS account ID

Helper lookups:

```bash
# Instance ID by Name tag
aws ec2 describe-instances --filters "Name=tag:Name,Values=techtoday-server" \
  --query "Reservations[].Instances[].InstanceId" --output text

# Elastic IP allocation ID
aws ec2 describe-addresses --query "Addresses[].AllocationId" --output text

# Security group ID
aws ec2 describe-security-groups --filters "Name=group-name,Values=techtoday-server-sg" \
  --query "SecurityGroups[0].GroupId" --output text

# Hosted zone ID
aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='techtoday.click.'].Id" --output text | sed 's|/hostedzone/||'

# Account ID
aws sts get-caller-identity --query Account --output text
```

## 2. Network

```bash
terraform import 'module.network.aws_security_group.server' sg-0123456789abcdef0
```

## 3. Compute

```bash
terraform import 'module.compute.aws_instance.server' i-0123456789abcdef0
terraform import 'module.compute.aws_eip.server'      eipalloc-0123456789abcdef0
```

## 4. IAM

```bash
terraform import 'module.iam.aws_iam_role.ec2_server'            ec2-techtoday-server-role
terraform import 'module.iam.aws_iam_role_policy.ec2_app_secrets' 'ec2-techtoday-server-role:AllowAppSecrets'
terraform import 'module.iam.aws_iam_instance_profile.ec2_server' ec2-techtoday-server-profile

terraform import 'module.iam.aws_iam_openid_connect_provider.github' \
  arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com

terraform import 'module.iam.aws_iam_role.github_deploy'             github-actions-deploy
terraform import 'module.iam.aws_iam_role_policy.github_ecr_push'    'github-actions-deploy:ECRPushAndSSH'
```

Replace `ACCOUNT_ID` with your 12-digit account ID.

## 5. ECR

```bash
terraform import 'module.ecr.aws_ecr_repository.this["techtoday/basic"]'     techtoday/basic
terraform import 'module.ecr.aws_ecr_repository.this["techtoday/langchain"]' techtoday/langchain
terraform import 'module.ecr.aws_ecr_repository.this["techtoday/rag"]'       techtoday/rag

# Registry-level scanning config is imported by account ID
terraform import 'module.ecr.aws_ecr_registry_scanning_configuration.this' ACCOUNT_ID
```

## 6. Secrets Manager

```bash
terraform import 'module.secrets.aws_secretsmanager_secret.app' techtoday/secrets
```

## 7. Route 53 records

Record import IDs use the format `ZONEID_NAME_TYPE`.

```bash
terraform import 'module.dns.aws_route53_record.root' ZONEID_techtoday.click_A
terraform import 'module.dns.aws_route53_record.www'  ZONEID_www.techtoday.click_A
terraform import 'module.dns.aws_route53_record.app'  ZONEID_app.techtoday.click_A
```

Replace `ZONEID` with your hosted zone ID (e.g. `Z0123456789ABCDEFGHIJ`).

> The hosted zone itself is read via a data source (not managed), so it does
> not need importing.

## 8. One-time Nginx migration (import only)

The config module keeps per-project Nginx `location` blocks in a dedicated file
(`/etc/nginx/app-locations/projects.conf`) that the `app.conf` server block
pulls in with an `include`. Your existing production `app.conf` instead has the
location blocks written **inline** (ADD_PROJECT.md § 7.1), and has no
`app-locations` directory. Migrate once, on the EC2 host, before the first
apply so the pushed file is actually used and does not clash with the inline
blocks:

```bash
ssh -i ~/.ssh/techtoday.pem ec2-user@<ELASTIC_IP>

# 1. Create the directory the config module writes into
sudo mkdir -p /etc/nginx/app-locations

# 2. Edit app.conf: remove the inline `location /<project>/ { ... }` blocks and
#    add a single include inside the `server { ... }` for app.techtoday.click
sudo nano /etc/nginx/conf.d/app.conf
#    Inside the 443 server block, add:
#        include /etc/nginx/app-locations/*.conf;

# 3. Validate (will pass even with the dir empty)
sudo nginx -t && sudo systemctl reload nginx
```

After this, `terraform apply` pushes `projects.conf` into that directory and the
existing routes keep working — now sourced from Terraform.

## 9. Verify

```bash
terraform plan
```

Expect: no resource destruction. The only "new" action should be
`module.config.null_resource.push_config`, which safely re-pushes the Nginx
location file, `docker-compose.yml`, and regenerates env files from the current
projects map. Apply when the plan looks clean:

```bash
terraform apply
```

## Note on `module.config`

`module.config` is not an AWS resource, so there is nothing to import. On the
first apply it renders the current `container_projects` into the existing files
on EC2. Because the render mirrors your current production layout (`basic`,
`langchain`, `rag` on ports 5000–5002), it produces the same content you
already run — no behavioral change. Verify afterwards:

```bash
curl -I https://app.techtoday.click/basic/
curl -I https://app.techtoday.click/langchain/
curl -I https://app.techtoday.click/rag/
```
