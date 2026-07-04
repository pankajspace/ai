[← README](../README.md) · [Projects Guide](README.md) · [Daily Cheatsheet](DAILY.md)

# Project Setup Guide — techtoday.click

Everything you need to go from a blank machine to running projects locally and in production. Follow the sections in order — each one builds on the previous.

---

## 1. Local Machine Prerequisites

Install and configure these tools on your local machine before running any other command in this guide.

### 1.1. Docker (CLI + Daemon + Compose Plugin)

Docker is required for building container images locally, running the local dev loop (`docker compose up`), and pushing images to ECR during manual deploys.

> **Important:** On macOS, `brew install docker` installs **only** the CLI — the daemon and Compose plugin are separate packages. This is the most common source of "Cannot connect to the Docker daemon" errors.

**macOS — Option A: Docker Desktop (recommended)**

[Docker Desktop](https://www.docker.com/products/docker-desktop/) bundles all three components (daemon, CLI, Compose plugin) in one installer — nothing else needed.

1. Download and run the [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) installer.
2. Open **Docker Desktop** from Applications. The first launch takes 15–30 seconds to start the VM.
3. Wait until the whale icon in the menu bar shows **"Docker Desktop is running"**.
4. Verify:
   ```bash
   docker info             # prints server details — not an error
   docker compose version  # prints: Docker Compose version v2.x.x
   ```

**macOS — Option B: Homebrew + Colima (no GUI, no license)**

This is the path you will end up on if you installed Docker via `brew install docker`. It requires three separate install steps because Homebrew splits the components across separate packages.

**Why three steps are needed:**

1. `brew install docker` — installs only the CLI client. There is no daemon, so `/var/run/docker.sock` does not exist and every `docker` command fails with `dial unix /var/run/docker.sock: no such file or directory`.
2. `brew install docker-compose` — installs the Compose plugin. Without it, `docker compose` is an unknown command.
3. `brew install colima` + `colima start` — installs and starts the lightweight Linux VM that runs the Docker daemon and creates the socket file.

**Full setup:**

```bash
# Step 1 — Docker CLI
brew install docker
docker --version          # verify: Docker version 29.x.x

# Step 2 — Compose plugin
brew install docker-compose
docker compose version    # verify: Docker Compose version v2.x.x

# Step 3 — Daemon runtime (Colima)
brew install colima
colima start              # starts the VM; creates /var/run/docker.sock
docker info               # verify: prints server version and container info
```

> **After every reboot** you must run `colima start` again before using Docker. Check if it is already running with `colima status`. Stop it with `colima stop`.

**Linux (Debian/Ubuntu)**

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info
docker compose version
```

**Linux (Fedora/RHEL)**

```bash
sudo dnf install -y docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info
docker compose version
```

**Windows**

1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) — bundles WSL 2, the daemon, CLI, and Compose plugin.
2. Launch Docker Desktop and wait for **"Docker Desktop is running"** in the system tray.
3. Verify in PowerShell or Command Prompt:
   ```powershell
   docker info
   docker compose version
   ```

**Common errors and fixes:**

| Error | Cause | Fix |
|---|---|---|
| `Cannot connect to the Docker daemon` | Daemon not running | macOS: open Docker Desktop or run `colima start`; Linux: `sudo systemctl start docker` |
| `docker compose: unknown command` | Compose plugin missing | `brew install docker-compose` (macOS) or `sudo apt install docker-compose-plugin` (Linux) |
| `permission denied … docker.sock` | User not in docker group | `sudo usermod -aG docker $USER` then log out and back in |

---

### 1.2. AWS CLI v2

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

> Credential configuration requires an IAM user — you'll create one in [§ 3.1](#31-create-iam-user-for-cli-access) and configure credentials in [§ 3.2](#32-configure-aws-cli-credentials).

---

### 1.3. SSH Client

Connects to the EC2 instance for initial server setup, manual deploys, and rollback.

**macOS / Linux** — preinstalled. Verify:

```bash
ssh -V
# Expected: OpenSSH_10.x ...
```

**Windows** — OpenSSH is built into Windows 10+. Verify in PowerShell:

```powershell
ssh -V
# If not found: Settings → Apps → Optional Features → Add "OpenSSH Client"
```

> Key pair setup comes later in [§ 3.3](#33-launch-ec2-instance) after you create the EC2 instance and download the `.pem` file.

---

### 1.4. git

Clones this repository and pushes the changes that trigger CI/CD.

**macOS**

```bash
# Option A — Homebrew
brew install git

# Option B — Xcode Command Line Tools (includes git)
xcode-select --install
```

**Linux (Debian/Ubuntu)**

```bash
sudo apt update && sudo apt install -y git
```

**Linux (Fedora/RHEL)**

```bash
sudo dnf install -y git
```

**Windows** — download and install from [git-scm.com/download/win](https://git-scm.com/download/win)

**Verify and configure (all platforms):**

```bash
git --version
# Expected: git version 2.x.x

# Set your identity (one-time, used in commit messages)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Verify config
git config --global --list
```

---

### 1.5. rsync

Deploys the `techtoday` static site to EC2.

- **macOS / Linux** — preinstalled. Verify: `rsync --version`
- **Windows** — use WSL, Git Bash, or `cwRsync`

---

### 1.6. Verification Checklist

Run all five commands. All must succeed before continuing to § 2:

```bash
aws --version          # ✓ aws-cli/2.x.x
docker info            # ✓ Server version printed
docker compose version # ✓ Docker Compose version v2.x.x
ssh -V                 # ✓ OpenSSH_10.x
git --version          # ✓ git version 2.x.x
```

---

## 2. Local Development Setup

### 2.1. AI Playground (basic / ai-01)

#### 2.1.1. Prerequisites

1. [Docker](https://www.docker.com/) + Docker Compose — installed in [§ 1.1](#11-docker-cli--daemon--compose-plugin)
2. [OpenAI API key](https://platform.openai.com/api-keys) — required for `travel`, `summarize`, and `arena`
3. [Groq API key](https://console.groq.com/keys) — required for `joke` and `arena`; free tier available

#### 2.1.2. One-Time Local Setup

```bash
cd projects/basic
cp .env.example .env
# Fill in OPENAI_API_KEY and GROQ_API_KEY in .env
docker compose build
```

#### 2.1.3. Day-to-Day Development Loop

1. Edit files under `src/` — changes are picked up immediately via volume mount, no rebuild needed.
2. Run the web UI:
   ```bash
   docker compose up web
   # open http://localhost:8080
   ```
3. Run individual features from the CLI:
   ```bash
   docker compose run --rm joke
   docker compose run --rm travel
   docker compose run --rm summarize
   docker compose run --rm arena
   ```
4. Rebuild only when `requirements.txt` or `Dockerfile` changes:
   ```bash
   docker compose build
   ```
5. Tear down when done:
   ```bash
   docker compose down
   ```

#### 2.1.4. Useful Commands

1. Tail logs: `docker compose logs -f web`
2. Shell into container: `docker compose run --rm web bash`
3. Container status: `docker compose ps`

---

### 2.2. TechToday Home Page

#### 2.2.1. Prerequisites

No tools required beyond a modern browser and `git`.

#### 2.2.2. Local Preview

**Direct file open (fastest):**

```bash
open projects/techtoday/src/index.html
```

**Local HTTP server** (better for testing — matches production serving behavior):

```bash
cd projects/techtoday/src
python3 -m http.server 8000
# open http://localhost:8000
```

#### 2.2.3. Key Files

1. `src/index.html` — single HTML page; all content lives here
2. `src/css/style.css` — all styles; dark-theme design tokens are CSS custom properties at the top of the file
3. `src/js/main.js` — mobile nav toggle only; keep this file minimal

---

## 3. One-Time AWS Infrastructure Setup

These steps are done **once** for the entire server and shared by all projects. Follow them in order.

### 3.1. Create IAM User for CLI Access

> **One-time.** You need an IAM user with programmatic access to run the `aws` commands in this guide from your local machine. If you already have an IAM user with the required permissions, skip to [§ 3.2](#32-configure-aws-cli-credentials).
>
> **Why an IAM user and not the root account?** The root account has unrestricted access and cannot be scoped down. AWS strongly recommends creating IAM users with only the permissions they need ([least privilege](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege)). The IAM roles in [§ 3.9](#39-create-iam-role-for-ec2-ecr--secrets-access) and [§ 3.10](#310-set-up-github-oidc-and-deploy-role-cicd) are for EC2 and GitHub Actions respectively — this IAM user is for **your local machine**.
>
> **CloudShell / Console alternative:** This step uses only `aws iam` commands — you can run them in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) or use the Console UI shown below.

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

> **Note:** If this is a brand-new AWS account and you are running the commands above as the root user, you can use the root credentials temporarily. After creating the IAM user, switch to the IAM user's credentials immediately (see [§ 3.2](#32-configure-aws-cli-credentials)) and avoid using root credentials for day-to-day work.

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

---

### 3.2. Configure AWS CLI Credentials

```bash
aws configure
```

You will be prompted for:

1. **AWS Access Key ID** — from the IAM user access key created in [§ 3.1](#31-create-iam-user-for-cli-access)
2. **AWS Secret Access Key** — from the IAM user access key created in [§ 3.1](#31-create-iam-user-for-cli-access)
3. **Default region name** — e.g., `us-east-1`
4. **Default output format** — `json` (recommended)

**Verify credentials are working:**

```bash
aws sts get-caller-identity
# Should print your Account, UserId, and Arn — not an error
```

> Credentials are stored in `~/.aws/credentials` and `~/.aws/config`. They are never committed to git. For multiple AWS accounts, use [named profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html): `aws configure --profile techtoday`, then add `--profile techtoday` to each command or set `export AWS_PROFILE=techtoday`.
>
> The IAM roles in [§ 3.9](#39-create-iam-role-for-ec2-ecr--secrets-access) (EC2 instance role) and [§ 3.10](#310-set-up-github-oidc-and-deploy-role-cicd) (GitHub Actions OIDC role) are separate from this IAM user — they are assumed by AWS services, not by your local CLI.

---

### 3.3. Launch EC2 Instance

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

**Set up your SSH key pair:**

After creating or downloading the `.pem` key file:

```bash
# macOS / Linux — restrict permissions (SSH refuses keys with open permissions)
chmod 400 YOUR_KEY.pem

# Verify permissions
ls -la YOUR_KEY.pem
# Expected: -r--------  (read-only for owner)
```

```powershell
# Windows PowerShell
icacls YOUR_KEY.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

> **Troubleshooting:** If you get `Permission denied (publickey)`, check: (1) key file permissions are `400`, (2) you're using the correct `.pem` file for this instance, (3) the username is `ec2-user` (Amazon Linux) not `ubuntu` or `root`.

---

### 3.4. Allocate Elastic IP

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

**Test SSH connection:**

```bash
ssh -i YOUR_KEY.pem ec2-user@$ELASTIC_IP
# Should open a shell on the EC2 instance
# Type 'exit' to disconnect
```

---

### 3.5. Install Docker, Docker Compose, and Nginx on EC2

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

### 3.6. Create Route 53 A Records

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

### 3.7. Request SSL Certificates

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

### 3.8. Configure Nginx

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

### 3.9. Create IAM Role for EC2 (ECR + Secrets Access)

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

### 3.10. Set Up GitHub OIDC and Deploy Role (CI/CD)

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

### 3.11. Secrets & Environment Variables Reference

A complete list of every secret and environment variable used across all projects, and where each one lives.

#### GitHub Actions Secrets

Set at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Shared by all project workflows (`deploy-ai-01.yml`, `deploy-techtoday.yml`):

1. `AWS_REGION` — AWS region, e.g. `us-east-1`
2. `AWS_ACCOUNT_ID` — your 12-digit AWS account ID
3. `AWS_DEPLOY_ROLE_ARN` — full ARN of the `github-actions-deploy` IAM role, e.g. `arn:aws:iam::123456789012:role/github-actions-deploy`
4. `EC2_HOST` — Elastic IP of the EC2 instance, e.g. `1.2.3.4`
5. `EC2_SSH_KEY` — full contents of the `.pem` private key file (include the `-----BEGIN RSA PRIVATE KEY-----` header/footer)

#### AWS Secrets Manager

Set at: **AWS Console → Secrets Manager → Store a new secret → Other type of secret**

Accessed by the EC2 instance at container startup (never stored in the repo or Docker image):

1. Secret name: `techtoday/ai-01/openai-api-key`
   - `OPENAI_API_KEY` — OpenAI API key (`sk-...`)
   - `GROQ_API_KEY` — Groq API key (`gsk_...`)

#### Docker Compose Environment Variables

Set in `~/docker-compose.yml` on the EC2 instance (not secret — safe to commit):

1. `PATH_PREFIX` — URL path prefix for the Flask app, e.g. `/ai-01` — tells Flask which prefix Nginx forwards under

#### Per-Project Secrets (ai-01)

Project-specific values (set as described in [§ 4.1.1](#411-store-api-keys-in-secrets-manager)):

1. `OPENAI_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key` — used by `travel`, `summarize`, and `arena`
2. `GROQ_API_KEY` — AWS Secrets Manager, secret `techtoday/ai-01/openai-api-key` — used by `joke` and `arena`
3. `PATH_PREFIX` — set directly in `~/docker-compose.yml` on EC2 (not secret)

> TechToday has no project-specific secrets or environment variables — it's a static site.

---

## 4. Project-Specific Production Setup

After completing § 3, follow the subsection for each project you want to deploy.

### 4.1. AI Playground (basic / ai-01)

Deploys to `https://app.techtoday.click/ai-01/` — container port `5000`, ECR repo `techtoday/ai-01`.

#### 4.1.1. Store API Keys in Secrets Manager

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

#### 4.1.2. Create ECR Repository

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

#### 4.1.3. Initial Image Build and Push

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

#### 4.1.4. Add Nginx Location Block

> **One-time.** Already included in the full Nginx config from [§ 3.8](#38-configure-nginx). Only repeat this step when adding `ai-01` to a server that was configured before this project existed.

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

#### 4.1.5. Add Service to Docker Compose on EC2

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

#### 4.1.6. Verify Production Deployment

```bash
curl -I https://app.techtoday.click/ai-01/
```

**Browser alternative:** Simply open [https://app.techtoday.click/ai-01/](https://app.techtoday.click/ai-01/) in your browser and confirm the page loads.

---

### 4.2. TechToday Home Page

Deploys to `https://techtoday.click/` — static files served by Nginx, no Docker container needed.

> **Already done** if you followed [§ 3](#3-one-time-aws-infrastructure-setup) above — Steps 3.6–3.8 create the DNS records, SSL certs, and Nginx config for all domains. The details below are kept for reference or for adding TechToday to a server set up independently.

#### 4.2.1. Add Nginx Server Block

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

#### 4.2.2. Request SSL Certificate

> **Skip if already done.** ACM certs in the AWS console are for CloudFront/ALB only and do not apply here. Run this only if Let's Encrypt certs for `techtoday.click` are not yet installed on EC2 (verify with `sudo certbot certificates`).

```bash
sudo certbot --nginx -d techtoday.click -d www.techtoday.click
sudo nginx -t && sudo systemctl reload nginx
```

#### 4.2.3. Add Route 53 DNS Records

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

#### 4.2.4. Deploy Static Files

```bash
# From the repo root
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

No Nginx reload is needed — static files are served directly.

#### 4.2.5. Verify Production Deployment

```bash
curl -I https://techtoday.click/
# Expect: HTTP/2 200, content-type: text/html
```

**Browser alternative:** Open [https://techtoday.click/](https://techtoday.click/) in your browser and confirm the home page loads.

---

## 5. Adding a New Project

1. Create ECR repo:
   ```bash
   aws ecr create-repository --repository-name techtoday/ai-02
   ```
   **CloudShell / Console alternative:** Run the command above in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/), or use the Console: **ECR** → **Repositories** → **Create repository** → name `techtoday/ai-02` → **Create repository**
2. Add a new service to `~/docker-compose.yml` on EC2 with a new port (e.g., 5001)
3. Add a new `location /ai-02/` block to `/etc/nginx/conf.d/app.conf`
4. Deploy: `docker compose -f ~/docker-compose.yml up -d --no-deps ai-02` + `sudo nginx -t && sudo systemctl reload nginx`
5. Add a new project-specific section to this file (§ 2 and § 4), following the `ai-01` sections as a template
6. **No new DNS record, no new EC2, no new SSL cert needed**

