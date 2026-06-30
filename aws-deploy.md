# AWS Deployment Architecture — techtoday.click

## Goal

- `techtoday.click` / `www.techtoday.click` → **Reserved** for future use (untouched)
- `app.techtoday.click` → **Single subdomain for all projects**, separated by URL path
  - `app.techtoday.click/ai-01/` → Current Flask/AI project
  - `app.techtoday.click/ai-02/` → Future project
  - `app.techtoday.click/ai-03/` → Future project

---

## Recommended Architecture: EC2 + Nginx + Docker Compose

No ALB. No Fargate. Nginx runs on the EC2 instance and routes paths to Docker containers.

```
Internet
   │
   ▼
Route 53 (techtoday.click hosted zone)
   ├── techtoday.click          → (reserved — not configured here)
   ├── www.techtoday.click      → (reserved — not configured here)
   └── app.techtoday.click      → A record → EC2 Elastic IP
                                         │
                                         ▼
                              EC2 Instance (t2.micro, free tier / ~$8/month)
                              ┌────────────────────────────────────┐
                              │  Nginx (reverse proxy + SSL)       │
                              │  HTTPS :443 (Let's Encrypt — free) │
                              │  HTTP  :80  → redirect to HTTPS    │
                              │                                    │
                              │  /ai-01/* → localhost:5000          │
                              │  /ai-02/* → localhost:5001 (future) │
                              │  /ai-03/* → localhost:5002 (future) │
                              └────────────────────────────────────┘
                                         │
                              Docker Compose
                              ├── ai-01  (port 5000, from ECR)
                              ├── ai-02  (port 5001, future)
                              └── ai-03  (port 5002, future)

              ECR (per-project image repositories)
              ├── techtoday/ai-01
              └── techtoday/ai-02 (future)

              Secrets Manager → API keys injected as env vars at container startup
              CloudWatch Agent → logs from EC2 + containers
              GitHub Actions   → CI/CD on push to main (SSH + docker compose)
```

---

## Why This Architecture

1. **No ALB** — Nginx replaces the Application Load Balancer, saving ~$16/month
2. **No Fargate** — Containers run directly on EC2, saving ~$9/month per service vs Fargate
3. **Free SSL** — Let's Encrypt / Certbot provides a free, auto-renewing HTTPS cert; no ACM needed
4. **Path-based routing** — Nginx `location /ai-01/` blocks route requests to the correct container port
5. **Single DNS record** — One A record for `app.techtoday.click`; no new records for new projects
6. **Easy to add projects** — New project = new Docker Compose service + new Nginx `location` block
7. **Main domain untouched** — Only `app.techtoday.click` A record is added to Route 53
8. **Secrets management** — Secrets Manager injects API keys at container startup via `aws secretsmanager get-secret-value`

---

## Cost Comparison

**Before (Fargate + ALB):**
1. ALB — ~$16/month
2. Fargate per task (0.25 vCPU / 0.5 GB) — ~$9/month per project
3. Route 53 — $0.50/month
4. **Total for 1 project — ~$26/month**
5. Each additional project — +~$9/month

**After (EC2 + Nginx, t2.micro):**
1. EC2 t2.micro (1 vCPU, 1 GB RAM) — **free** on AWS Free Tier (750 hrs/month, first 12 months); ~$8/month after that
2. Elastic IP — free while attached to a running instance
3. Route 53 — $0.50/month
4. **Total for 1 project — $0.50/month on Free Tier, ~$9/month after**
5. Each additional project — **+$0/month** (same EC2 instance, new Docker Compose service)

> A `t2.small` (~$17/month, 2 GB RAM) is recommended when running 3+ memory-intensive projects simultaneously.

---

## Step-by-Step Deployment: `app.techtoday.click/ai-01`

### Prerequisites
- AWS CLI configured (`aws configure`)
- An SSH key pair created in AWS (used to access the EC2 instance)
- Domain already in Route 53

---

### Step 1 — Launch EC2 Instance
> **One-time.** Done once for the entire server. Repeat only if you ever need to replace or recreate the EC2 instance.

```bash
# Get the latest Amazon Linux 2023 AMI ID
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" "Name=state,Values=available" \
  --query "sort_by(Images,&CreationDate)[-1].ImageId" --output text)

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name app-server-sg \
  --description "EC2 app server - allow SSH, HTTP, HTTPS" \
  --query "GroupId" --output text)

aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

# Launch t3.micro instance (replace YOUR_KEY_PAIR with your key name)
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t2.micro \
  --key-name YOUR_KEY_PAIR \
  --security-group-ids $SG_ID \
  --query "Instances[0].InstanceId" --output text)

echo "Instance ID: $INSTANCE_ID"
```

**AWS Console:**
1. Open **EC2** → **Instances** → **Launch instances**
2. Name: `app-server`, AMI: **Amazon Linux 2023**, Instance type: `t2.micro`
3. Key pair: select or create a key pair (save the `.pem` file)
4. Under **Network settings**: create a new security group, allow SSH (22), HTTP (80), HTTPS (443) from `0.0.0.0/0`
5. Click **Launch instance**

---

### Step 2 — Allocate Elastic IP
> **One-time.** Done once. The Elastic IP remains assigned even when the instance is stopped, so the DNS record never needs updating.

```bash
# Allocate an Elastic IP
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query "AllocationId" --output text)

# Associate it with the instance
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID

# Get the public IP
ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOC_ID \
  --query "Addresses[0].PublicIp" --output text)

echo "Elastic IP: $ELASTIC_IP"
```

**AWS Console:**
1. Open **EC2** → **Elastic IPs** → **Allocate Elastic IP address** → **Allocate**
2. Select the new IP → **Actions** → **Associate Elastic IP address**
3. Select your instance → **Associate**
4. Note the IP address — used in Route 53 Step 7

---

### Step 3 — Install Docker, Docker Compose, and Nginx on EC2
> **One-time.** Done once when the instance is first provisioned. Repeat only if the instance is rebuilt from scratch.
, then run:

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

# Install Docker
sudo dnf update -y
sudo dnf install -y docker nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# Install Docker Compose v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install AWS CLI (for pulling secrets)
sudo dnf install -y aws-cli

# Log out and back in so the docker group takes effect
exit
```

---

### Step 4 — Create Route 53 A Record
> **One-time.** Done once for all projects. Every future project reuses this same DNS record — no updates needed.


**CLI:**
```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='techtoday.click.'].Id" --output text | sed 's|/hostedzone/||')

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.techtoday.click",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'"$ELASTIC_IP"'"}]
      }
    }]
  }'
```

**AWS Console:**
1. Open **Route 53** → **Hosted zones** → click `techtoday.click`
2. Click **Create record**, name `app`, type **A**
3. Enter the Elastic IP as the value → **Create records**

---

### Step 5 — Request SSL Certificate with Let's Encrypt
> **One-time.** Certbot sets up a cron job that auto-renews the certificate every 90 days. No manual action needed after the initial setup.


```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

# Wait ~2 minutes for DNS propagation first, then:
sudo certbot --nginx -d app.techtoday.click

# Verify auto-renewal works
sudo certbot renew --dry-run
```

Certbot automatically edits the Nginx config to add HTTPS and sets up a cron for renewal.

---

### Step 6 — Configure Nginx Path Routing
> **Repeat per new project.** The initial `location /ai-01/` block is set up once. Each time a new project is added, append a new `location /ai-XX/` block and reload Nginx.


```bash
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.techtoday.click;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name app.techtoday.click;

    # SSL managed by Certbot — do not edit these lines
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

### Step 7 — Store Secrets in Secrets Manager
> **One-time per project.** Repeat only when rotating or updating an API key for a specific project (`aws secretsmanager put-secret-value ...`).

```bash
aws secretsmanager create-secret \
  --name "techtoday/ai-01/openai-api-key" \
  --secret-string '{"OPENAI_API_KEY":"sk-..."}'
```

**AWS Console:**
1. Open **Secrets Manager** → **Store a new secret**
2. Choose **Other type of secret**
3. Add key `OPENAI_API_KEY` with your actual key value → Next
4. Set secret name to `techtoday/ai-01/openai-api-key` → Next → Store

---

### Step 8 — Create IAM Role for EC2 (Secrets + ECR Access)
> **One-time.** Done once for the whole server. All projects deployed to this EC2 instance share this role — no changes needed when adding new projects.

```bash
# Create role for EC2 instance
aws iam create-role \
  --role-name ec2-app-server-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},
    "Action":"sts:AssumeRole"}]}'

# Allow reading secrets scoped to techtoday/*
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

# Create instance profile and attach
aws iam create-instance-profile --instance-profile-name ec2-app-server-profile
aws iam add-role-to-instance-profile \
  --instance-profile-name ec2-app-server-profile \
  --role-name ec2-app-server-role

aws ec2 associate-iam-instance-profile \
  --instance-id $INSTANCE_ID \
  --iam-instance-profile Name=ec2-app-server-profile
```

**AWS Console:**
1. Open **IAM** → **Roles** → **Create role** → **AWS service** → **EC2** → Next
2. Click **Create inline policy**, use JSON editor — add `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read permissions
3. Name the role `ec2-app-server-role` → **Create role**
4. Open **EC2** → select your instance → **Actions** → **Security** → **Modify IAM role** → select `ec2-app-server-role`

---

### Step 9 — Create ECR Repository & Push Image
> **One-time per project** to create the repository. The initial manual image push is also done once here. All subsequent pushes after code changes are handled automatically by CI/CD (see the GitHub Actions section).

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/ai-01

aws ecr create-repository --repository-name $REPO_NAME --region $REGION

# Enable scan on push
aws ecr put-image-scanning-configuration \
  --repository-name $REPO_NAME \
  --image-scanning-configuration scanOnPush=true

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
```

**AWS Console:**
1. Open **Elastic Container Registry** → **Repositories** → **Create repository**
2. Name `techtoday/ai-01`, enable **Scan on push** → **Create**
3. Click the repo → **View push commands** → follow the 4 steps shown

---

### Step 10 — Create Docker Compose File on EC2
> **One-time per project** to add the service entry. Update this file when adding a new project (uncomment the next service block) or when environment variables change.
 `/home/ec2-user/docker-compose.yml`:

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

cat > ~/docker-compose.yml << 'EOF'
services:
  ai-01:
    image: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/techtoday/ai-01:latest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - PATH_PREFIX=/ai-01
    env_file:
      - ~/secrets/ai-01.env

  # ai-02 (future):
  # ai-02:
  #   image: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/techtoday/ai-02:latest
  #   restart: unless-stopped
  #   ports:
  #     - "5001:5000"
  #   environment:
  #     - PATH_PREFIX=/ai-02
EOF
```

Fetch secrets from Secrets Manager into the env file:

```bash
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/ai-01/openai-api-key \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/ai-01.env
chmod 600 ~/secrets/ai-01.env

# Authenticate Docker to ECR, then start
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

docker compose pull && docker compose up -d
```

---

### Step 11 — Verify
> **Repeat after every deployment** to confirm the update is live and the container is responding correctly.

curl -I https://app.techtoday.click/ai-01/
```

---

## Adding a New Project (Future Pattern)

1. Create ECR repo: `aws ecr create-repository --repository-name techtoday/ai-02`
2. Build and push image to ECR
3. Add a new service to `~/docker-compose.yml` on EC2 with a new port (e.g., 5001)
4. Add a new `location /ai-02/` block to `/etc/nginx/conf.d/app.conf` pointing to `localhost:5001`
5. Run `docker compose pull && docker compose up -d` and `sudo nginx -t && sudo systemctl reload nginx`
6. **No new DNS record, no new EC2, no new SSL cert** — everything reuses what's already there

---

## CI/CD: Auto-Deploy on Push to `main` (GitHub Actions)

Every push to the `main` branch that touches `projects/basic/` builds and pushes to ECR, then SSH-deploys to EC2.

### Setup

**Step A — Store SSH key in GitHub Secrets:**

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add secret `EC2_SSH_KEY` — paste the full content of your `.pem` file
3. Add secret `EC2_HOST` — the Elastic IP (e.g., `1.2.3.4`)
4. Add secret `AWS_DEPLOY_ROLE_ARN` — the role ARN for GitHub OIDC (see below)
5. Add secret `AWS_REGION` with value `us-east-1`
6. Add secret `AWS_ACCOUNT_ID` — your 12-digit AWS account ID

**Step B — Create GitHub OIDC provider and deploy role (one-time):**

CLI:
```bash
# Create OIDC provider
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Create role — replace YOUR_GITHUB_ORG and YOUR_REPO_NAME
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

# Attach ECR push permissions only
aws iam put-role-policy \
  --role-name github-actions-deploy \
  --policy-name ECRPush \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[
      {"Effect":"Allow","Action":["ecr:GetAuthorizationToken"],"Resource":"*"},
      {"Effect":"Allow","Action":["ecr:BatchCheckLayerAvailability","ecr:PutImage",
        "ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload"],
        "Resource":"arn:aws:ecr:*:ACCOUNT_ID:repository/techtoday/*"}
    ]}'
```

**Step C — Create the workflow file:**

Save as `.github/workflows/deploy-ai-01.yml`:

```yaml
name: Deploy ai-01

on:
  push:
    branches: [main]
    paths:
      - 'projects/basic/**'

env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  ECR_REPOSITORY: techtoday/ai-01
  IMAGE_TAG: ${{ github.sha }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # required for OIDC
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          cd projects/basic
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag  $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                      $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            # Re-authenticate Docker to ECR
            aws ecr get-login-password --region ${{ env.AWS_REGION }} | \
              docker login --username AWS --password-stdin \
              ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ env.AWS_REGION }}.amazonaws.com

            # Pull new image and restart only the ai-01 service (zero-downtime)
            docker compose -f ~/docker-compose.yml pull ai-01
            docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
```

> The `--no-deps` flag restarts only the `ai-01` container without touching other running services.

---

## Best Practices

### IAM & Security

1. **Least privilege** — The EC2 IAM role only allows `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read; nothing else
2. **No static credentials in CI/CD** — GitHub Actions uses OIDC for ECR push; the SSH key is a GitHub Secret, not a long-lived AWS key
3. **Secrets Manager only** — API keys are never in `docker-compose.yml`, `.env` files in the repo, or Docker images
4. **Restrict SSH access** — After initial setup, tighten the security group's SSH rule to your IP only (port 22 from `YOUR_IP/32`)
5. **HTTPS enforced** — Nginx redirects all HTTP to HTTPS; Let's Encrypt cert auto-renews via cron

### Container & Image

6. **Tag images with git SHA** — CI/CD tags with `github.sha` in addition to `latest` for traceable rollback
7. **ECR scan on push** — `scanOnPush=true` on every repository; review findings before promoting
8. **Non-root user in Dockerfile** — Add `RUN useradd -m appuser && USER appuser` to avoid running as root
9. **Container health checks** — Add a `healthcheck` in `docker-compose.yml` so Docker can detect and restart unhealthy containers

### EC2 & Nginx

10. **Use `restart: unless-stopped`** — Docker Compose restarts containers automatically after EC2 reboots
11. **Enable EC2 termination protection** — Prevent accidental deletion via CLI or console
12. **Use a `t2.small` when running 3+ projects** — `t2.micro` (1 GB RAM) may OOM with multiple LLM-calling services running simultaneously

### Observability

13. **CloudWatch Agent** — Install on EC2 to ship system metrics and Docker logs to CloudWatch
14. **Set up billing alerts** — Create a CloudWatch billing alarm at $15/month to catch unexpected charges early
15. **Structured logging** — Log in JSON from Flask; use `docker compose logs -f ai-01` locally and CloudWatch Logs Insights in production

### Cost

16. **Use Free Tier** — `t2.micro` is free for 750 hours/month in your first AWS year — running 24/7 is exactly 744 hours/month, so the instance runs at **zero compute cost** for 12 months
17. **Stop the instance when not needed** — The Elastic IP stays attached; start/stop the instance to pause billing on dev environments
18. **ECR lifecycle policy** — Delete untagged images older than 7 days to avoid storage accumulation

---

## Cost Estimate (us-east-1)

1. **EC2 t2.micro** — free on AWS Free Tier (first 12 months); ~$8/month on-demand after that
2. **Elastic IP** — free while attached to a running instance
3. **ECR storage** — ~$0.10/GB/month
4. **Route 53 hosted zone** — $0.50/month
5. **Secrets Manager** — ~$0.40/month per secret
6. **Total for 1 project** — ~$0.50/month on Free Tier; ~$9/month after Free Tier ends
7. **Each additional project** — **+$0/month** (same EC2, new Docker Compose service + Nginx location block)

---

## When to Upgrade to ECS Fargate + ALB

Upgrade when:

1. A single project needs to scale beyond what one EC2 instance can handle
2. You need zero-downtime blue/green deployments across multiple instances
3. You want managed container health replacement without SSH access
4. Monthly traffic consistently exceeds the capacity of a `t3.small`

The Nginx + EC2 setup handles hundreds of thousands of requests/month comfortably for AI projects like this one. A `t2.micro` is sufficient until you have sustained concurrent traffic.

---

## Main Domain Strategy

`techtoday.click` is **not touched** by this setup. Options for it later:
- **Static landing page**: S3 + CloudFront + Route 53 A record (very cheap)
- **Marketing site**: Amplify Hosting (git-push deploy)
- **Full app**: Add it to Nginx on the same EC2 as a new `server` block, or deploy to a separate instance

---

## Flask Path Prefix Configuration

Because Nginx forwards the full path (e.g., `/ai-01/joke`) to the container, each Flask app must mount routes under its path prefix. Use a Blueprint with an environment-variable-driven prefix:

```python
# src/app.py
import os
from flask import Blueprint, Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from joke import get_joke
from travel import get_travel_suggestion

app = Flask(__name__, static_folder=".")
CORS(app)

bp = Blueprint("main", __name__)

@bp.route("/")
def index():
    return send_from_directory(".", "index.html")

@bp.route("/joke", methods=["POST"])
def joke():
    data = request.get_json(force=True)
    topic = (data.get("topic") or "").strip()
    try:
        return jsonify({"result": get_joke(topic)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/travel", methods=["POST"])
def travel():
    data = request.get_json(force=True)
    city = (data.get("city") or "").strip() or "Bangalore"
    try:
        return jsonify({"result": get_travel_suggestion(city)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

PREFIX = os.environ.get("PATH_PREFIX", "")  # /ai-01 in production, empty locally
app.register_blueprint(bp, url_prefix=PREFIX)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

- **Locally**: `PATH_PREFIX` unset → routes are `/`, `/joke`, `/travel` (unchanged)
- **On EC2**: `PATH_PREFIX=/ai-01` → routes are `/ai-01/`, `/ai-01/joke`, `/ai-01/travel`

---

## Folder Structure

```
.github/
  workflows/
    deploy-ai-01.yml         ← CI/CD workflow (Step C above)
projects/
  basic/          → app.techtoday.click/ai-01/  (current, PATH_PREFIX=/ai-01)
  project-02/     → app.techtoday.click/ai-02/  (future,  PATH_PREFIX=/ai-02)
  project-03/     → app.techtoday.click/ai-03/  (future,  PATH_PREFIX=/ai-03)
```
