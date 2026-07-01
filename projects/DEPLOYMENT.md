[← README](../README.md) · [Development Guide](DEVELOPMENT.md)

# AWS Deployment Architecture — techtoday.click

This document covers the shared AWS infrastructure used by all projects as well as project-specific deployment steps.

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
                              ┌───────────────────────────────────────────────┐
                              │  Nginx (reverse proxy + static files)         │
                              │  HTTPS :443 (Let's Encrypt — free)            │
                              │  HTTP  :80  → redirect to HTTPS               │
                              │                                               │
                              │  techtoday.click/   → /var/www/techtoday      │
                              │  /ai-01/*           → localhost:5000          │
                              │  /ai-02/*           → localhost:5001 (future) │
                              └───────────────────────────────────────────────┘
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

> Use a `t3.small` (~$17/month) when running 3+ memory-intensive projects simultaneously.

---

## Local Machine Prerequisites

Install and configure these on your local machine before running any of the one-time setup steps below, or before doing any manual deploy/rollback (see [DEVELOPMENT.md](DEVELOPMENT.md)):

### 1. AWS CLI v2

Runs every `aws ec2`, `aws route53`, `aws iam`, `aws secretsmanager`, and `aws ecr` command in this guide.

> **Zero-install alternative — AWS CloudShell:** If you don't want to install the AWS CLI locally, you can run any `aws` command directly in your browser via [AWS CloudShell](https://console.aws.amazon.com/cloudshell/). Click the **CloudShell** icon (terminal prompt `>_`) in the top navigation bar of the AWS Console. CloudShell comes with the AWS CLI pre-installed and pre-authenticated with your console session — no `aws configure` needed. It works for all pure `aws` commands in this guide (EC2, Route 53, IAM, ECR, Secrets Manager, S3). It does **not** work for steps that require local files (e.g., `docker build`, `rsync`, SSH with a local `.pem` key).

**macOS**

```bash
# Option A — Homebrew (recommended)
brew install awscli

# Option B — Official installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
rm AWSCLIV2.pkg
```

**Linux (Debian/Ubuntu)**

```bash
sudo apt update && sudo apt install -y unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
```

**Linux (Fedora/RHEL)**

```bash
sudo dnf install -y unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
```

> **ARM64 (e.g., Graviton, Apple Silicon under Linux):** replace `x86_64` with `aarch64` in the URL above.

**Windows**

1. Download and run the [AWS CLI MSI installer](https://awscli.amazonaws.com/AWSCLIV2.msi).
2. Follow the on-screen prompts (defaults are fine).
3. Alternatively, install via `winget`:
   ```powershell
   winget install Amazon.AWSCLI
   ```

**Verify installation (all platforms):**

```bash
aws --version
# Expected output: aws-cli/2.x.x Python/3.x.x ...
```

**Create an IAM user for CLI access:**

> **One-time.** You need an IAM user with programmatic access to run the `aws` commands in this guide from your local machine (or to configure CloudShell when not using the console session). If you already have an IAM user with the required permissions, skip to [Configure credentials](#configure-credentials) below.
>
> **Why an IAM user and not the root account?** The root account has unrestricted access and cannot be scoped down. AWS strongly recommends creating IAM users with only the permissions they need ([least privilege](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege)). The IAM roles in [Step 7](#step-7--create-iam-role-for-ec2-ecr--secrets-access) and [Step 8](#step-8--set-up-github-oidc-and-deploy-role-cicd) are for EC2 and GitHub Actions respectively — this IAM user is for **your local machine**.

**CLI:**

```bash
# 1. Create the IAM user
aws iam create-user --user-name techtoday-admin

# 2. Create a custom policy with the permissions needed for this guide
#    (EC2, Route 53, IAM, Secrets Manager, ECR, S3, CloudFront, STS)
aws iam create-policy \
  --policy-name TechTodayAdminPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "EC2Full",
        "Effect": "Allow",
        "Action": [
          "ec2:RunInstances",
          "ec2:DescribeInstances",
          "ec2:DescribeImages",
          "ec2:CreateSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AllocateAddress",
          "ec2:AssociateAddress",
          "ec2:DescribeAddresses",
          "ec2:AssociateIamInstanceProfile",
          "ec2:CreateKeyPair",
          "ec2:DescribeKeyPairs"
        ],
        "Resource": "*"
      },
      {
        "Sid": "Route53",
        "Effect": "Allow",
        "Action": [
          "route53:ListHostedZones",
          "route53:ChangeResourceRecordSets",
          "route53:GetHostedZone"
        ],
        "Resource": "*"
      },
      {
        "Sid": "IAMRolesAndPolicies",
        "Effect": "Allow",
        "Action": [
          "iam:CreateRole",
          "iam:PutRolePolicy",
          "iam:CreateInstanceProfile",
          "iam:AddRoleToInstanceProfile",
          "iam:CreateOpenIDConnectProvider",
          "iam:CreateUser",
          "iam:CreatePolicy",
          "iam:AttachUserPolicy",
          "iam:CreateAccessKey",
          "iam:ListUsers",
          "iam:GetRole",
          "iam:GetPolicy",
          "iam:ListAttachedUserPolicies"
        ],
        "Resource": "*"
      },
      {
        "Sid": "SecretsManager",
        "Effect": "Allow",
        "Action": [
          "secretsmanager:CreateSecret",
          "secretsmanager:GetSecretValue",
          "secretsmanager:PutSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        "Resource": "arn:aws:secretsmanager:*:*:secret:techtoday/*"
      },
      {
        "Sid": "ECR",
        "Effect": "Allow",
        "Action": [
          "ecr:CreateRepository",
          "ecr:DescribeRepositories",
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImageScanningConfiguration",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ],
        "Resource": "*"
      },
      {
        "Sid": "S3ForStaticSite",
        "Effect": "Allow",
        "Action": [
          "s3:CreateBucket",
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        "Resource": [
          "arn:aws:s3:::techtoday-site",
          "arn:aws:s3:::techtoday-site/*"
        ]
      },
      {
        "Sid": "CloudFront",
        "Effect": "Allow",
        "Action": [
          "cloudfront:CreateDistribution",
          "cloudfront:CreateInvalidation",
          "cloudfront:GetDistribution"
        ],
        "Resource": "*"
      },
      {
        "Sid": "STS",
        "Effect": "Allow",
        "Action": ["sts:GetCallerIdentity"],
        "Resource": "*"
      }
    ]
  }'

# 3. Attach the policy to the user
#    Replace ACCOUNT_ID with your 12-digit AWS account ID
aws iam attach-user-policy \
  --user-name techtoday-admin \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/TechTodayAdminPolicy

# 4. Create an access key pair for programmatic access
aws iam create-access-key --user-name techtoday-admin
#    Save the AccessKeyId and SecretAccessKey from the output — the secret
#    is shown only once and cannot be retrieved later.
```

> **Note:** If this is a brand-new AWS account and you are running the commands above as the root user, you can use the root credentials temporarily. After creating the IAM user, switch to the IAM user's credentials immediately (see "Configure credentials" below) and avoid using root credentials for day-to-day work.

**AWS Console:**

1. Open **IAM** → **Users** → **Create user**
2. **User name:** `techtoday-admin` → **Next**
3. **Set permissions:** select **Attach policies directly**
   - Click **Create policy** (opens a new tab):
     - Switch to the **JSON** editor and paste the policy document from the CLI section above
     - **Policy name:** `TechTodayAdminPolicy` → **Create policy**
   - Back on the user creation tab, click the refresh icon (🔄) next to the policy search box
   - Search for `TechTodayAdminPolicy`, check the box → **Next**
4. Review and click **Create user**
5. **Generate access keys:** Click the new user name → **Security credentials** tab → **Create access key**
   - **Use case:** select **Command Line Interface (CLI)** → check the confirmation box → **Next**
   - **Description tag:** `local-cli` (optional) → **Create access key**
   - **Copy both the Access Key ID and Secret Access Key** — the secret is shown only once. Store them securely (e.g., a password manager). → **Done**

> **Security tip:** Enable MFA on this IAM user. Go to **IAM** → **Users** → `techtoday-admin` → **Security credentials** → **Assign MFA device** → follow the prompts with an authenticator app.

#### Configure credentials

```bash
aws configure
```

You will be prompted for:

1. **AWS Access Key ID** — from the IAM user access key created above
2. **AWS Secret Access Key** — from the IAM user access key created above
3. **Default region name** — e.g., `us-east-1`
4. **Default output format** — `json` (recommended)

> These credentials are stored in `~/.aws/credentials` and `~/.aws/config`. They are never committed to git. If you need to switch between multiple AWS accounts or users, use [named profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html): `aws configure --profile techtoday`, then add `--profile techtoday` to each command or set `export AWS_PROFILE=techtoday`.
>
> The IAM roles in [Step 7](#step-7--create-iam-role-for-ec2-ecr--secrets-access) (EC2 instance role) and [Step 8](#step-8--set-up-github-oidc-and-deploy-role-cicd) (GitHub Actions OIDC role) are separate from this IAM user — they are assumed by AWS services, not by your local CLI.

---

### 2. SSH Client

Connects to the EC2 instance (`ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP`).

- **macOS/Linux:** preinstalled
- **Windows:** built-in OpenSSH client (Windows 10+), Git Bash, or WSL

Download the `.pem` key pair created in Step 1 and restrict its permissions:

```bash
# macOS / Linux
chmod 400 YOUR_KEY.pem
```

```powershell
# Windows PowerShell
icacls YOUR_KEY.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

---

### 3. git

Clones this repository and pushes the changes that trigger CI/CD.

**macOS**
```bash
brew install git
# or: xcode-select --install  (includes git)
```

**Linux (Debian/Ubuntu)**
```bash
sudo apt install git
```

**Linux (Fedora/RHEL)**
```bash
sudo dnf install git
```

**Windows** — [Git for Windows](https://git-scm.com/download/win)

> Docker is only needed for local dev, manual container deploys, or rollback — see the [common Development Guide](DEVELOPMENT.md#local-machine-prerequisites).

---

## One-Time Infrastructure Setup

These steps are done once for the entire server and shared by all projects.

### Step 1 — Launch EC2 Instance

> **CloudShell / Console alternative:** This step uses only `aws ec2` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the AWS Console UI shown below.

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

> **CloudShell / Console alternative:** This step uses only `aws ec2` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query "AllocationId" --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOC_ID \
  --query "Addresses[0].PublicIp" --output text)
echo "Elastic IP: $ELASTIC_IP"
```

**AWS Console:**
1. Open **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. Leave defaults (Amazon's pool of IPv4 addresses) → click **Allocate**
3. Select the new Elastic IP → **Actions** → **Associate Elastic IP address**
4. Choose the `app-server` instance → click **Associate**
5. Note the allocated IP — you'll use it as `$ELASTIC_IP` in subsequent steps

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

> **CloudShell / Console alternative:** This step uses only `aws route53` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

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

**AWS Console:**
1. Open **Route 53** → **Hosted zones** → click the `techtoday.click` zone
2. Click **Create record** for each of the three records below:
   - **Record name:** leave blank (for `techtoday.click`), **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
   - **Record name:** `www`, **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
   - **Record name:** `app`, **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
3. Click **Create records** after each

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
>
> **CloudShell / Console alternative:** This step uses only `aws iam` and `aws ec2` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

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

**AWS Console:**
1. Open **IAM** → **Roles** → **Create role**
2. **Trusted entity type:** AWS service → **Use case:** EC2 → **Next**
3. Skip adding policies for now (we'll add an inline policy) → **Next**
4. **Role name:** `ec2-app-server-role` → **Create role**
5. Open the newly created role → **Permissions** tab → **Add permissions** → **Create inline policy**
6. Switch to the **JSON** editor and paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["secretsmanager:GetSecretValue"],
         "Resource": "arn:aws:secretsmanager:*:*:secret:techtoday/*"
       },
       {
         "Effect": "Allow",
         "Action": ["ecr:GetAuthorizationToken", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"],
         "Resource": "*"
       }
     ]
   }
   ```
7. **Policy name:** `AllowAppSecrets` → **Create policy**
8. Attach the role to the EC2 instance: open **EC2** → **Instances** → select `app-server` → **Actions** → **Security** → **Modify IAM role** → select `ec2-app-server-role` → **Update IAM role**

---

### Step 8 — Set Up GitHub OIDC and Deploy Role (CI/CD)

> **One-time.** Shared by all projects' GitHub Actions workflows.
>
> **CloudShell / Console alternative:** This step uses only `aws iam` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

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

**AWS Console:**
1. **Create the OIDC provider:** Open **IAM** → **Identity providers** → **Add provider**
   - **Provider type:** OpenID Connect
   - **Provider URL:** `https://token.actions.githubusercontent.com` → click **Get thumbprint**
   - **Audience:** `sts.amazonaws.com` → **Add provider**
2. **Create the deploy role:** Open **IAM** → **Roles** → **Create role**
   - **Trusted entity type:** Web identity
   - **Identity provider:** select `token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com` → **Next**
   - Skip managed policies → **Next**
   - **Role name:** `github-actions-deploy` → **Create role**
3. **Edit the trust policy:** Open the role → **Trust relationships** tab → **Edit trust policy** → add the `StringLike` condition for your repo:
   ```json
   "Condition": {
     "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
     "StringLike": { "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO_NAME:ref:refs/heads/main" }
   }
   ```
4. **Add inline policy:** On the role's **Permissions** tab → **Add permissions** → **Create inline policy** → switch to **JSON** editor and paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       { "Effect": "Allow", "Action": ["ecr:GetAuthorizationToken"], "Resource": "*" },
       {
         "Effect": "Allow",
         "Action": ["ecr:BatchCheckLayerAvailability", "ecr:PutImage", "ecr:InitiateLayerUpload", "ecr:UploadLayerPart", "ecr:CompleteLayerUpload"],
         "Resource": "arn:aws:ecr:*:ACCOUNT_ID:repository/techtoday/*"
       }
     ]
   }
   ```
5. **Policy name:** `ECRPushAndSSH` → **Create policy**

**GitHub Secrets to create** (repo → Settings → Secrets and variables → Actions):

1. `EC2_SSH_KEY` — full content of the `.pem` file
2. `EC2_HOST` — the Elastic IP
3. `AWS_DEPLOY_ROLE_ARN` — ARN of the `github-actions-deploy` role
4. `AWS_REGION` — e.g., `us-east-1`
5. `AWS_ACCOUNT_ID` — your 12-digit account ID

---

## Adding a New App Project

1. Create ECR repo:
   ```bash
   aws ecr create-repository --repository-name techtoday/ai-02
   ```
   **CloudShell / Console alternative:** Run the command above in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/), or use the Console: **ECR** → **Repositories** → **Create repository** → name `techtoday/ai-02` → **Create repository**
2. Add a new service to `~/docker-compose.yml` on EC2 with a new port (e.g., 5001)
3. Add a new `location /ai-02/` block to `/etc/nginx/conf.d/app.conf`
4. Deploy: `docker compose -f ~/docker-compose.yml up -d --no-deps ai-02` + `sudo nginx -t && sudo systemctl reload nginx`
5. Add a new project-specific deployment section to this file, following the `basic (ai-01)` section below as a template
6. **No new DNS record, no new EC2, no new SSL cert needed**

---

## Best Practices

### IAM & Security

1. **Dedicated IAM user for CLI** — use the `techtoday-admin` IAM user (see [Create an IAM user](#1-aws-cli-v2)) instead of root credentials for all local `aws` commands
2. **Enable MFA** — turn on multi-factor authentication for the IAM user and the root account
3. **Rotate access keys** — rotate the IAM user's access keys periodically (`aws iam create-access-key` → update `aws configure` → `aws iam delete-access-key` for the old key)
4. **Least privilege** — EC2 role allows only `secretsmanager:GetSecretValue` on `techtoday/*` and ECR read; the IAM user policy is scoped to the specific services used in this guide
5. **No static credentials in CI/CD** — GitHub Actions uses OIDC; SSH key is a GitHub Secret
6. **Secrets Manager only** — API keys are never in `docker-compose.yml`, repo files, or images
7. **Restrict SSH** — after setup, tighten the security group SSH rule to your IP only (`YOUR_IP/32`)
8. **HTTPS enforced** — Nginx redirects all HTTP to HTTPS; certs auto-renew via Certbot cron

### Container & Image

9. **Tag images three ways** — full git SHA, build tag (`YYYYMMDD-HHMMSS-<run>-<sha>`), and `latest`
10. **ECR scan on push** — `scanOnPush=true` on every repository
11. **`restart: unless-stopped`** — containers restart automatically after EC2 reboots

### Cost

12. **Free Tier** — `t2.micro` is free for 750 hrs/month in the first AWS year (= free 24/7)
13. **ECR lifecycle policy** — delete untagged images older than 7 days to avoid storage accumulation

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


---

# Deployment — AI Playground (basic / ai-01)

This section covers deployment steps specific to the `basic` project (`app.techtoday.click/ai-01/`). For shared AWS infrastructure (EC2, Route 53, Nginx, SSL, IAM, OIDC) see the [common deployment guide](#aws-deployment-architecture--techtodayclick) above.

---

## Deployment Target

- **URL:** `https://app.techtoday.click/ai-01/`
- **Container port:** `5000` (mapped to EC2 port `5000`)
- **ECR repository:** `techtoday/ai-01`
- **Path prefix env var:** `PATH_PREFIX=/ai-01`

---

## Secrets & Environment Variables Used By This Project

Shared CI/CD secrets (`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) are documented once in the [Secrets & Environment Variables Reference](#secrets--environment-variables-reference) section above — set them in GitHub repo Settings, not here.

Project-specific values (set as described in the steps below):

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key`
2. `GROQ_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key`
3. `PATH_PREFIX` — set directly in `~/docker-compose.yml` on EC2 (not secret)

---

## Local Machine Prerequisites

In addition to the shared tools in the [Local Machine Prerequisites](#local-machine-prerequisites) section above (AWS CLI, SSH client, git), Steps 3 and 5 below require:

1. **Docker CLI** — builds/tags/pushes the image in Step 3, and logs in to ECR in Step 5 (see [DEVELOPMENT.md](DEVELOPMENT.md)).

---

## Step 1 — Store API Keys in Secrets Manager

> **One-time per project.** Repeat only when rotating keys (`aws secretsmanager put-secret-value`).
>
> **CloudShell / Console alternative:** This step uses only `aws secretsmanager` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

```bash
aws secretsmanager create-secret \
  --name "techtoday/ai-01/openai-api-key" \
  --secret-string '{"OPENAI_API_KEY":"sk-...", "GROQ_API_KEY":"gsk_..."}'
```

**AWS Console:**
1. Open **Secrets Manager** → **Store a new secret** → **Other type of secret**
2. Add keys `OPENAI_API_KEY` and `GROQ_API_KEY` with their values → Next
3. Set secret name to `techtoday/ai-01/openai-api-key` → Store

---

## Step 2 — Create ECR Repository

> **One-time.**
>
> **CloudShell / Console alternative:** This step uses only `aws ecr` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

```bash
REGION=us-east-1
REPO_NAME=techtoday/ai-01

aws ecr create-repository --repository-name $REPO_NAME --region $REGION

aws ecr put-image-scanning-configuration \
  --repository-name $REPO_NAME \
  --image-scanning-configuration scanOnPush=true
```

**AWS Console:**
1. Open **ECR** → **Repositories** → **Create repository**
2. **Repository name:** `techtoday/ai-01`
3. **Image scan settings:** enable **Scan on push**
4. Leave other defaults → **Create repository**

---

## Step 3 — Initial Image Build and Push

> **One-time.** Subsequent pushes are handled automatically by CI/CD.
>
> **Note:** This step requires Docker and local project files — it cannot be run from AWS CloudShell or the Console. Use your local terminal.

```bash
REGION=us-east-1
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_NAME=techtoday/ai-01

aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

cd projects/basic
docker build -t $REPO_NAME .
docker tag $REPO_NAME:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest
```

---

## Step 4 — Add Nginx Location Block

> **One-time.** Adds the `/ai-01/` route to the existing Nginx config on EC2.

SSH into the EC2 instance and add to the `server { listen 443 ... server_name app.techtoday.click; }` block in `/etc/nginx/conf.d/app.conf`:

```nginx
location /ai-01/ {
    proxy_pass         http://localhost:5000;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 5 — Add Service to Docker Compose on EC2

> **One-time.** Adds the `ai-01` service to `~/docker-compose.yml` on EC2.

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

# Fetch secrets into env file
mkdir -p ~/secrets
aws secretsmanager get-secret-value \
  --secret-id techtoday/ai-01/openai-api-key \
  --query SecretString --output text | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join(f'{k}={v}' for k,v in d.items()))" \
  > ~/secrets/ai-01.env
chmod 600 ~/secrets/ai-01.env
```

Add to `~/docker-compose.yml`:

```yaml
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
```

Authenticate and start:

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

docker compose -f ~/docker-compose.yml pull ai-01
docker compose -f ~/docker-compose.yml up -d --no-deps ai-01
```

---

## Step 6 — Verify

```bash
curl -I https://app.techtoday.click/ai-01/
```

**Browser alternative:** Simply open [https://app.techtoday.click/ai-01/](https://app.techtoday.click/ai-01/) in your browser and confirm the page loads.

---

## Flask Path Prefix Configuration

Because Nginx forwards the full path (e.g., `/ai-01/joke`) to the container, Flask mounts routes under a `PATH_PREFIX` env var via a Blueprint:

```python
# src/app.py (abbreviated)
PATH_PREFIX = os.environ.get("PATH_PREFIX", "")  # /ai-01 in production, empty locally
app.register_blueprint(bp, url_prefix=PATH_PREFIX)
```

- **Locally:** `PATH_PREFIX` unset → routes are `/`, `/joke`, `/travel`
- **On EC2:** `PATH_PREFIX=/ai-01` → routes are `/ai-01/`, `/ai-01/joke`, `/ai-01/travel`

The served `index.html` also needs to know the prefix so its `fetch()` calls hit `/ai-01/joke` instead of `/joke`. The `index` route injects it by rewriting the page's `const API = "";` line with the current `PATH_PREFIX` value before returning the HTML.

---

## CI/CD

Automated via [.github/workflows/deploy-ai-01.yml](../.github/workflows/deploy-ai-01.yml). Triggers on any push to `main` touching `projects/basic/**`. See the [OIDC and GitHub Secrets setup](#step-8--set-up-github-oidc-and-deploy-role-cicd) section above.

---

# Deployment — TechToday Home Page

This section covers everything needed to deploy the `techtoday` static site to production at `techtoday.click`. For shared AWS infrastructure (EC2, Route 53, Nginx, SSL, IAM) see the [common deployment guide](#aws-deployment-architecture--techtodayclick) above.

---

## Deployment Target

1. `techtoday.click` — path `/` — Static files (HTML, CSS, JS)
2. `www.techtoday.click` — path `/` — Redirect → `techtoday.click`

The static files in `src/` are served directly from the root of the main domain. No Docker container or application server is needed.

---

## Secrets & Environment Variables Used By This Project

Shared CI/CD secrets (`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) are documented once in the [Secrets & Environment Variables Reference](#secrets--environment-variables-reference) section above — set them in GitHub repo Settings, not here.

This project has no project-specific secrets or environment variables — it's a static site with no server-side API keys.

---

## Local Machine Prerequisites

In addition to the shared tools in the [Local Machine Prerequisites](#local-machine-prerequisites) section above (AWS CLI, SSH client, git):

1. **rsync** — required for deploying updates via Option A (Nginx on EC2). Preinstalled on macOS/Linux; Windows users can use WSL or Git Bash.
2. **AWS CLI** — also required for Option B (S3 + CloudFront) `s3 sync` / `cloudfront create-invalidation` commands, and for the Route 53 A record command in Option A.

---

## Recommended Options

### Option A — Nginx on Existing EC2 (Simplest)

Serve the static files from the same EC2 instance that hosts `app.techtoday.click`. Nginx already runs there.

**One-time setup: add a server block for `techtoday.click`**

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP

sudo mkdir -p /var/www/techtoday
sudo chown ec2-user:ec2-user /var/www/techtoday
```

Add to `/etc/nginx/conf.d/app.conf` (alongside the existing `app.techtoday.click` block):

```nginx
server {
    listen 80;
    server_name techtoday.click www.techtoday.click;
    return 301 https://techtoday.click$request_uri;
}

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

server {
    listen 443 ssl;
    server_name www.techtoday.click;

    ssl_certificate     /etc/letsencrypt/live/techtoday.click/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/techtoday.click/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;

    return 301 https://techtoday.click$request_uri;
}
```

**Request SSL cert for the main domain (skip if already issued):**

> **Skip if already done.** ACM certs in the AWS console are for CloudFront/ALB only and do not apply here. Run this only if Let's Encrypt certs for `techtoday.click` are not yet installed on EC2 (verify with `sudo certbot certificates`).

```bash
sudo certbot --nginx -d techtoday.click -d www.techtoday.click
sudo nginx -t && sudo systemctl reload nginx
```

**Add Route 53 A records for `techtoday.click` and `www.techtoday.click`:**

> **CloudShell / Console alternative:** The `aws route53` command below can be run in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/), or use the Console UI shown after the CLI block.

```bash
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='techtoday.click.'].Id" --output text | sed 's|/hostedzone/||')

aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "techtoday.click",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'"$ELASTIC_IP"'"}]
        }
      },
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "www.techtoday.click",
          "Type": "A",
          "TTL": 300,
          "ResourceRecords": [{"Value": "'"$ELASTIC_IP"'"}]
        }
      }
    ]
  }'
```

**AWS Console:**
1. Open **Route 53** → **Hosted zones** → click `techtoday.click`
2. **Create record:** leave name blank, **Type:** `A`, **Value:** paste Elastic IP, **TTL:** `300` → **Create records**
3. **Create record:** name `www`, **Type:** `A`, **Value:** paste Elastic IP, **TTL:** `300` → **Create records**

---

### Option B — S3 + CloudFront (Zero-Maintenance)

Best for pure static hosting with global CDN, no EC2 involvement.

> **CloudShell / Console alternative:** The S3 and CloudFront commands in this section can be run in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) (except `s3 sync` from local files — use the Console upload UI instead). Console UI steps are shown alongside each CLI command below.

**1. Create an S3 bucket:**

```bash
aws s3api create-bucket \
  --bucket techtoday-site \
  --region us-east-1
```

**AWS Console:** Open **S3** → **Create bucket** → **Bucket name:** `techtoday-site` → **Region:** `us-east-1` → **Create bucket**

**2. Upload site files:**

```bash
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete \
  --cache-control "public, max-age=86400"

# Set shorter cache for HTML so updates propagate quickly
aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"
```

**AWS Console:** Open the `techtoday-site` bucket → **Upload** → drag and drop all files from `projects/techtoday/src/` → **Upload**. To set cache headers, select the uploaded files → **Actions** → **Edit metadata** → add `Cache-Control` = `public, max-age=86400` (use `max-age=60` for `index.html`).

**3. Create a CloudFront distribution** pointing to the S3 bucket, with:
- Default root object: `index.html`
- HTTPS redirect enforced
- Custom domain: `techtoday.click` and `www.techtoday.click`
- ACM certificate (us-east-1 region required for CloudFront)

**AWS Console:** Open **CloudFront** → **Create distribution** → **Origin domain:** select the `techtoday-site.s3.amazonaws.com` bucket → **Default root object:** `index.html` → **Viewer protocol policy:** Redirect HTTP to HTTPS → **Alternate domain names (CNAMEs):** add `techtoday.click` and `www.techtoday.click` → **Custom SSL certificate:** select your ACM certificate (must be in `us-east-1`) → **Create distribution**

**4. Create Route 53 A alias records** pointing `techtoday.click` and `www.techtoday.click` to the CloudFront distribution domain.

**AWS Console:** Open **Route 53** → **Hosted zones** → `techtoday.click` → **Create record** → **Record type:** `A` → toggle **Alias** on → **Route traffic to:** CloudFront distribution → select your distribution → **Create records**. Repeat for `www`.

---

## Deploying Updates (Option A — Nginx on EC2)

After any change to files in `src/`:

```bash
# From the repo root
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

No Nginx reload is needed — static files are served directly.

---

## Deploying Updates (Option B — S3 + CloudFront)

> **Note:** The `s3 sync` command below requires access to local project files — it cannot be run from AWS CloudShell. Use your local terminal, or upload files via the S3 Console UI (**S3** → `techtoday-site` bucket → **Upload**). The `cloudfront create-invalidation` command can be run in CloudShell.

```bash
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete \
  --cache-control "public, max-age=86400"

aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"

# Invalidate the CloudFront cache so visitors see the new version immediately
DISTRIBUTION_ID=<your-cloudfront-distribution-id>
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

## Verify

```bash
curl -I https://techtoday.click/
# Expect: HTTP/2 200, content-type: text/html
```

**Browser alternative:** Open [https://techtoday.click/](https://techtoday.click/) in your browser and confirm the home page loads.

---

## CI/CD (Automatic Deploy on Push)

See [.github/workflows/deploy-techtoday.yml](../.github/workflows/deploy-techtoday.yml) for the automated deploy pipeline. It triggers on any push to `main` that touches `projects/techtoday/src/**` and runs `rsync` (Option A) to copy the updated static files to EC2.
