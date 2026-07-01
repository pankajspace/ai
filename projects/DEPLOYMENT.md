[← README](../README.md) · [Development Guide](DEVELOPMENT.md)

# AWS Deployment Architecture — techtoday.click

This document covers the shared AWS infrastructure used by all projects. Project-specific deployment steps live in each project's own `DEPLOYMENT.md`:

1. [basic (ai-01) — DEPLOYMENT.md](basic/DEPLOYMENT.md)
2. [techtoday (home page) — DEPLOYMENT.md](techtoday/DEPLOYMENT.md)

---

## Architecture Overview

```
Internet
   │
   ▼
Route 53 (techtoday.click hosted zone)
   ├── techtoday.click          → A record → EC2 Elastic IP  (static home page)
   ├── www.techtoday.click      → A record → EC2 Elastic IP  (redirects to techtoday.click)
   └── app.techtoday.click      → A record → EC2 Elastic IP  (all app projects)
                                         │
                                         ▼
                              EC2 Instance (t2.micro, free tier / ~$8/month)
                              ┌────────────────────────────────────────────┐
                              │  Nginx (reverse proxy + static files)      │
                              │  HTTPS :443 (Let's Encrypt — free)         │
                              │  HTTP  :80  → redirect to HTTPS            │
                              │                                            │
                              │  techtoday.click/   → /var/www/techtoday  │
                              │  /ai-01/*           → localhost:5000       │
                              │  /ai-02/*           → localhost:5001 (future) │
                              └────────────────────────────────────────────┘
                                         │
                              Docker Compose (app subdomain only)
                              ├── ai-01  (port 5000, from ECR)
                              └── ai-02  (port 5001, future)

              ECR             → per-project image repositories (techtoday/ai-*)
              Secrets Manager → API keys injected as env vars at container start
              GitHub Actions  → CI/CD on push to main (per-project workflows)
```

---

## Why This Architecture

1. **No ALB** — Nginx replaces the Application Load Balancer, saving ~$16/month
2. **No Fargate** — Containers run directly on EC2; static files served directly by Nginx
3. **Free SSL** — Let's Encrypt / Certbot auto-renews certs; no ACM needed
4. **Path-based routing** — Nginx `location /ai-*/` blocks route requests to the correct container
5. **Single DNS record for apps** — One A record for `app.techtoday.click`; no new records per project
6. **Easy to add projects** — New app project = new Docker Compose service + new Nginx `location` block
7. **Secrets management** — Secrets Manager injects API keys at container startup

---

## Cost

1. **EC2 t2.micro** — free on AWS Free Tier (first 12 months); ~$8/month on-demand after that
2. **Elastic IP** — free while attached to a running instance
3. **Route 53 hosted zone** — $0.50/month
4. **Secrets Manager** — ~$0.40/secret/month
5. **ECR storage** — ~$0.10/GB/month
6. **Each additional project** — **+$0/month** (same EC2, new Docker Compose service + Nginx block)

> Use a `t2.small` (~$17/month) when running 3+ memory-intensive projects simultaneously.

---

## One-Time Infrastructure Setup

These steps are done once for the entire server and shared by all projects.

### Step 1 — Launch EC2 Instance

```bash
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" "Name=state,Values=available" \
  --query "sort_by(Images,&CreationDate)[-1].ImageId" --output text)

SG_ID=$(aws ec2 create-security-group \
  --group-name app-server-sg \
  --description "EC2 app server - allow SSH, HTTP, HTTPS" \
  --query "GroupId" --output text)

aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t2.micro \
  --key-name YOUR_KEY_PAIR \
  --security-group-ids $SG_ID \
  --query "Instances[0].InstanceId" --output text)
```

**AWS Console:**
1. Open **EC2** → **Instances** → **Launch instances**
2. Name: `app-server`, AMI: **Amazon Linux 2023**, Instance type: `t2.micro`
3. Key pair: select or create a key pair (save the `.pem` file)
4. Under **Network settings**: create a new security group, allow SSH (22), HTTP (80), HTTPS (443) from `0.0.0.0/0`
5. Click **Launch instance**

---

### Step 2 — Allocate Elastic IP

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query "AllocationId" --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOC_ID \
  --query "Addresses[0].PublicIp" --output text)
echo "Elastic IP: $ELASTIC_IP"
```

---

### Step 3 — Install Docker, Docker Compose, and Nginx on EC2

> **Connecting from Windows:** use `icacls YOUR_KEY.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"` instead of `chmod 400`.

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

sudo dnf update -y
sudo dnf install -y docker nginx certbot python3-certbot-nginx aws-cli
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

exit  # log out and back in for docker group to take effect
```

---

### Step 4 — Create Route 53 A Records

```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='techtoday.click.'].Id" --output text | sed 's|/hostedzone/||')

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {"Action":"UPSERT","ResourceRecordSet":{"Name":"techtoday.click","Type":"A","TTL":300,"ResourceRecords":[{"Value":"'"$ELASTIC_IP"'"}]}},
      {"Action":"UPSERT","ResourceRecordSet":{"Name":"www.techtoday.click","Type":"A","TTL":300,"ResourceRecords":[{"Value":"'"$ELASTIC_IP"'"}]}},
      {"Action":"UPSERT","ResourceRecordSet":{"Name":"app.techtoday.click","Type":"A","TTL":300,"ResourceRecords":[{"Value":"'"$ELASTIC_IP"'"}]}}
    ]
  }'
```

---

### Step 5 — Request SSL Certificates

> **Skip if already done.** If Let's Encrypt certs are already installed on this EC2 instance (check with `sudo certbot certificates`), skip this step.
>
> **Note:** ACM certificates (visible in AWS Certificate Manager console) are for CloudFront/ALB only and cannot be used directly with Nginx on EC2. This step installs separate Let's Encrypt certs via Certbot.

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

# Wait ~2 minutes for DNS propagation, then:
sudo certbot --nginx -d techtoday.click -d www.techtoday.click
sudo certbot --nginx -d app.techtoday.click

sudo certbot renew --dry-run  # verify auto-renewal
```

---

### Step 6 — Configure Nginx

```bash
sudo mkdir -p /var/www/techtoday

sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
# Redirect all HTTP to HTTPS
server {
    listen 80;
    server_name techtoday.click www.techtoday.click app.techtoday.click;
    return 301 https://$host$request_uri;
}

# Main domain — static home page
server {
    listen 443 ssl;
    server_name techtoday.click;

    ssl_certificate     /etc/letsencrypt/live/techtoday.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techtoday.click/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    root  /var/www/techtoday;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# www → main domain redirect
server {
    listen 443 ssl;
    server_name www.techtoday.click;

    ssl_certificate     /etc/letsencrypt/live/techtoday.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techtoday.click/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    return 301 https://techtoday.click$request_uri;
}

# App subdomain — Docker container projects
server {
    listen 443 ssl;
    server_name app.techtoday.click;

    ssl_certificate     /etc/letsencrypt/live/app.techtoday.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.techtoday.click/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    location /ai-01/ {
        proxy_pass         http://localhost:5000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Add new projects here:
    # location /ai-02/ {
    #     proxy_pass http://localhost:5001;
    #     ...
    # }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

---

### Step 7 — Create IAM Role for EC2 (ECR + Secrets Access)

> **One-time.** All projects on this EC2 instance share this role.

```bash
aws iam create-role \
  --role-name ec2-app-server-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},
    "Action":"sts:AssumeRole"}]}'

aws iam put-role-policy \
  --role-name ec2-app-server-role \
  --policy-name AllowAppSecrets \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[
      {"Effect":"Allow","Action":["secretsmanager:GetSecretValue"],
       "Resource":"arn:aws:secretsmanager:*:*:secret:techtoday/*"},
      {"Effect":"Allow","Action":["ecr:GetAuthorizationToken",
        "ecr:BatchGetImage","ecr:GetDownloadUrlForLayer"],
       "Resource":"*"}
    ]}'

aws iam create-instance-profile --instance-profile-name ec2-app-server-profile
aws iam add-role-to-instance-profile \
  --instance-profile-name ec2-app-server-profile \
  --role-name ec2-app-server-role
aws ec2 associate-iam-instance-profile \
  --instance-id $INSTANCE_ID \
  --iam-instance-profile Name=ec2-app-server-profile
```

---

### Step 8 — Set Up GitHub OIDC and Deploy Role (CI/CD)

> **One-time.** Shared by all projects' GitHub Actions workflows.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

aws iam create-role \
  --role-name github-actions-deploy \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Federated":"arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"},
      "Action":"sts:AssumeRoleWithWebIdentity",
      "Condition":{
        "StringEquals":{"token.actions.githubusercontent.com:aud":"sts.amazonaws.com"},
        "StringLike":{"token.actions.githubusercontent.com:sub":"repo:YOUR_GITHUB_ORG/YOUR_REPO_NAME:ref:refs/heads/main"}
      }
    }]}'

aws iam put-role-policy \
  --role-name github-actions-deploy \
  --policy-name ECRPushAndSSH \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[
      {"Effect":"Allow","Action":["ecr:GetAuthorizationToken"],"Resource":"*"},
      {"Effect":"Allow","Action":["ecr:BatchCheckLayerAvailability","ecr:PutImage",
        "ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload"],
        "Resource":"arn:aws:ecr:*:ACCOUNT_ID:repository/techtoday/*"}
    ]}'
```

**GitHub Secrets to create** (repo → Settings → Secrets and variables → Actions):

1. `EC2_SSH_KEY` — full content of the `.pem` file
2. `EC2_HOST` — the Elastic IP
3. `AWS_DEPLOY_ROLE_ARN` — ARN of the `github-actions-deploy` role
4. `AWS_REGION` — e.g., `us-east-1`
5. `AWS_ACCOUNT_ID` — your 12-digit account ID

---

## Adding a New App Project

1. Create ECR repo: `aws ecr create-repository --repository-name techtoday/ai-02`
2. Add a new service to `~/docker-compose.yml` on EC2 with a new port (e.g., 5001)
3. Add a new `location /ai-02/` block to `/etc/nginx/conf.d/app.conf`
4. Deploy: `docker compose -f ~/docker-compose.yml up -d --no-deps ai-02` + `sudo nginx -t && sudo systemctl reload nginx`
5. Create the project's own `DEPLOYMENT.md` following `basic/DEPLOYMENT.md` as a template
6. **No new DNS record, no new EC2, no new SSL cert needed**

---

## Best Practices

### IAM & Security

1. **Least privilege** — EC2 role allows only `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read
2. **No static credentials in CI/CD** — GitHub Actions uses OIDC; SSH key is a GitHub Secret
3. **Secrets Manager only** — API keys are never in `docker-compose.yml`, repo files, or images
4. **Restrict SSH** — after setup, tighten the security group SSH rule to your IP only (`YOUR_IP/32`)
5. **HTTPS enforced** — Nginx redirects all HTTP to HTTPS; certs auto-renew via Certbot cron

### Container & Image

6. **Tag images three ways** — full git SHA, build tag (`YYYYMMDD-HHMMSS-<run>-<sha>`), and `latest`
7. **ECR scan on push** — `scanOnPush=true` on every repository
8. **`restart: unless-stopped`** — containers restart automatically after EC2 reboots

### Cost

9. **Free Tier** — `t2.micro` is free for 750 hrs/month in the first AWS year (= free 24/7)
10. **ECR lifecycle policy** — delete untagged images older than 7 days to avoid storage accumulation

---

## Secrets & Environment Variables Reference

A complete list of every secret and environment variable used across all projects, and where each one lives.

### GitHub Actions Secrets

Set at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Shared by all project workflows (`deploy-ai-01.yml`, `deploy-techtoday.yml`):

1. `AWS_REGION` — AWS region, e.g. `us-east-1`
2. `AWS_ACCOUNT_ID` — your 12-digit AWS account ID
3. `AWS_DEPLOY_ROLE_ARN` — full ARN of the `github-actions-deploy` IAM role, e.g. `arn:aws:iam::123456789012:role/github-actions-deploy`
4. `EC2_HOST` — Elastic IP of the EC2 instance, e.g. `1.2.3.4`
5. `EC2_SSH_KEY` — full contents of the `.pem` private key file (include the `-----BEGIN RSA PRIVATE KEY-----` header/footer)

### AWS Secrets Manager

Set at: **AWS Console → Secrets Manager → Store a new secret → Other type of secret**

Accessed by the EC2 instance at container startup (never stored in the repo or Docker image):

1. Secret name: `techtoday/ai-01/openai-api-key`
   - `OPENAI_API_KEY` — OpenAI API key (`sk-...`)
   - `GROQ_API_KEY` — Groq API key (`gsk_...`)

### Docker Compose Environment Variables

Set in `~/docker-compose.yml` on the EC2 instance (not secret — safe to commit):

1. `PATH_PREFIX` — URL path prefix for the Flask app, e.g. `/ai-01` — tells Flask which prefix Nginx forwards under

---

## When to Upgrade to ECS Fargate + ALB

Upgrade when a project needs to scale beyond a single EC2 instance, requires zero-downtime blue/green deployments, or sustained concurrent traffic consistently exceeds what a `t3.small` can handle.
