# Project Setup Guide — techtoday.click

The one-time setup shared by every project: **local development prerequisites** (§ 1) and the **one-time AWS infrastructure** (§ 2). Do these once. After setup, use `DAILY.md` for routine development and deployment, `ADD_PROJECT.md` for adding a new container project, `PROJECTS.md` for the project registry, and `ARCHITECTURE.md` for architecture and design decisions. Follow the sections below in order — each one builds on the previous.

---

## 1. Local Machine Prerequisites

Install and configure these tools on your local machine before running any other command in this guide.

### 1.1. Docker (CLI + Daemon + Compose Plugin)

Docker is required for building container images locally, running the local dev loop (`docker compose up`), and pushing images to ECR during manual deploys.

> **Important:** On macOS, `brew install docker` installs **only** the CLI — the daemon and Compose plugin are separate packages. This is the most common source of "Cannot connect to the Docker daemon" errors.

#### 1.1.1. macOS — Option A: Docker Desktop (recommended)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) bundles all three components (daemon, CLI, Compose plugin) in one installer — nothing else needed.

1. Download and run the [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) installer.
2. Open **Docker Desktop** from Applications. The first launch takes 15–30 seconds to start the VM.
3. Wait until the whale icon in the menu bar shows **"Docker Desktop is running"**.
4. Verify:
   ```bash
   docker info             # prints server details — not an error
   docker compose version  # prints: Docker Compose version v2.x.x
   ```

#### 1.1.2. macOS — Option B: Homebrew + Colima (no GUI, no license)

This is the path you will end up on if you installed Docker via `brew install docker`. It requires three separate install steps because Homebrew splits the components across separate packages.

##### Why Three Steps Are Needed

1. `brew install docker` — installs only the CLI client. There is no daemon, so `/var/run/docker.sock` does not exist and every `docker` command fails with `dial unix /var/run/docker.sock: no such file or directory`.
2. `brew install docker-compose` — installs the Compose plugin. Without it, `docker compose` is an unknown command.
3. `brew install colima` + `colima start` — installs and starts the lightweight Linux VM that runs the Docker daemon and creates the socket file.

##### Full Setup

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

#### 1.1.3. Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info
docker compose version
```

#### 1.1.4. Linux (Fedora/RHEL)

```bash
sudo dnf install -y docker docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out and back in after this

# Verify
docker info
docker compose version
```

#### 1.1.5. Windows

1. Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) — bundles WSL 2, the daemon, CLI, and Compose plugin.
2. Launch Docker Desktop and wait for **"Docker Desktop is running"** in the system tray.
3. Verify in PowerShell or Command Prompt:
   ```powershell
   docker info
   docker compose version
   ```

#### 1.1.6. Common Errors and Fixes

1. Error: `Cannot connect to the Docker daemon`
  Cause: Daemon not running
  Fix: macOS: open Docker Desktop or run `colima start`; Linux: `sudo systemctl start docker`
2. Error: `docker compose: unknown command`
  Cause: Compose plugin missing
  Fix: `brew install docker-compose` (macOS) or `sudo apt install docker-compose-plugin` (Linux)
3. Error: `permission denied ... docker.sock`
  Cause: User not in docker group
  Fix: `sudo usermod -aG docker $USER` then log out and back in

---

### 1.2. AWS CLI v2

Runs every `aws ec2`, `aws route53`, `aws iam`, `aws secretsmanager`, and `aws ecr` command in this guide.

> **Prefer not to install anything?** You can run every `aws` command in this guide from your browser instead — see [§ 1.2.6. AWS CloudShell](#126-aws-cloudshell-zero-install-alternative).

#### 1.2.1. macOS

```bash
# Option A — Homebrew (recommended)
brew install awscli

# Option B — Official installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
rm AWSCLIV2.pkg
```

#### 1.2.2. Linux (Debian/Ubuntu)

```bash
sudo apt update && sudo apt install -y unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
```

#### 1.2.3. Linux (Fedora/RHEL)

```bash
sudo dnf install -y unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
```

> **ARM64 (e.g., Graviton, Apple Silicon under Linux):** replace `x86_64` with `aarch64` in the URL above.

#### 1.2.4. Windows

1. Download and run the [AWS CLI MSI installer](https://awscli.amazonaws.com/AWSCLIV2.msi).
2. Follow the on-screen prompts (defaults are fine).
3. Alternatively, install via `winget`:
   ```powershell
   winget install Amazon.AWSCLI
   ```

#### 1.2.5. Verify Installation

```bash
aws --version
# Expected output: aws-cli/2.x.x Python/3.x.x ...
```

> Credential configuration requires an IAM user — you'll create one in [§ 2.1](#21-create-iam-user-for-cli-access) and log in via [§ 2.2](#22-authenticate-aws-cli-with-aws-login).

#### 1.2.6. AWS CloudShell (Zero-Install Alternative)

If you would rather not install the AWS CLI locally at all, [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) gives you a browser-based terminal with the AWS CLI v2 pre-installed and automatically authenticated from your Console sign-in — no download, no `aws configure`, and no long-lived access keys to manage or rotate.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) (use the `techtoday` IAM user once it exists — see [§ 2.1](#21-create-iam-user-for-cli-access)).
2. Confirm the Region selector in the top-right shows `us-east-1` — CloudShell always runs in the Region currently selected in the Console.
3. Click the **CloudShell** icon (the `>_` terminal prompt) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
4. Wait a few seconds for the environment to start, then run any `aws` command from this guide exactly as written.

**What works and what doesn't:**

1. Works for every pure-`aws` step in this guide — EC2, Route 53, IAM, ECR, Secrets Manager, and S3.
2. Does **not** work for steps that touch your local machine — `docker build`, `docker push`, `rsync`, or SSH with a local `.pem` key — because CloudShell has no access to your local filesystem or Docker daemon.

**Handy to know:**

1. CloudShell includes 1 GB of persistent storage in your home directory that survives between sessions.
2. Sessions time out after roughly 20 minutes of inactivity; reconnecting starts a fresh shell while the home directory persists.
3. `git`, `python3`, `pip`, and `jq` are also pre-installed, so you can clone the repo and run helper scripts directly in CloudShell when a step doesn't need local Docker or SSH.

---

### 1.3. SSH Client

Connects to the EC2 instance for initial server setup, manual deploys, and rollback.

#### 1.3.1. macOS / Linux

Preinstalled. Verify:

```bash
ssh -V
# Expected: OpenSSH_10.x ...
```

#### 1.3.2. Windows

OpenSSH is built into Windows 10+. Verify in PowerShell:

```powershell
ssh -V
# If not found: Settings → Apps → Optional Features → Add "OpenSSH Client"
```

> Key pair setup comes later in [§ 2.4](#24-launch-ec2-instance) after you create the EC2 instance and download the `.pem` file.

---

### 1.4. git

Clones this repository and pushes the changes that trigger CI/CD.

#### 1.4.1. macOS

```bash
# Option A — Homebrew
brew install git

# Option B — Xcode Command Line Tools (includes git)
xcode-select --install
```

#### 1.4.2. Linux (Debian/Ubuntu)

```bash
sudo apt update && sudo apt install -y git
```

#### 1.4.3. Linux (Fedora/RHEL)

```bash
sudo dnf install -y git
```

#### 1.4.4. Windows

Download and install from [git-scm.com/download/win](https://git-scm.com/download/win)

#### 1.4.5. Verify and Configure

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
rsync --version        # ✓ openrsync: protocol version 29
```

---

## 2. One-Time AWS Infrastructure Setup

These steps are done **once** for the entire server and shared by all projects. Follow them in order.

### 2.1. Create IAM User for CLI Access

> **One-time.** You need an IAM user to run the `aws` commands in this guide from your local machine. If you already have an IAM user in the admin group with the `SignInLocalDevelopmentAccess` policy attached, skip to [§ 2.2](#22-authenticate-aws-cli-with-aws-login).
>
> **Why an IAM user and not the root account?** The root account has unrestricted access and cannot be scoped down. AWS strongly recommends creating separate IAM users for day-to-day work. The IAM roles in [§ 2.10](#210-create-iam-role-for-ec2-ecr-secrets-access) and [§ 2.11](#211-set-up-github-oidc-and-deploy-role-cicd) are for EC2 and GitHub Actions respectively — this IAM user is for **your local machine**.

#### 2.1.1. CLI

```bash
# 1. Create the IAM user
aws iam create-user --user-name techtoday

# 2. Add the user to the admin group (grants full AWS permissions)
aws iam add-user-to-group --user-name techtoday --group-name admin

# 3. Attach the SignInLocalDevelopmentAccess policy to enable `aws login`
#    Replace ACCOUNT_ID with your 12-digit AWS account ID
aws iam attach-user-policy \
  --user-name techtoday \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/SignInLocalDevelopmentAccess
```

> **Note:** If this is a brand-new AWS account and you are running the commands above as the root user, you can use the root credentials temporarily. After creating the IAM user, switch to the IAM user immediately via `aws login` (see [§ 2.2](#22-authenticate-aws-cli-with-aws-login)) and avoid using root credentials for day-to-day work.
>
> **Prerequisites:** The `admin` group must already exist in your AWS account with the `AdministratorAccess` policy attached. If it doesn't, create it first: **IAM** → **User groups** → **Create group** → name `admin` → attach the `AdministratorAccess` AWS managed policy → **Create group**.

#### 2.1.2. AWS Console

1. Open **IAM** → **Users** → **Create user**
2. **User name:** `techtoday` → **Next**
3. **Set permissions:** select **Add user to group**
   - Select the `admin` group → **Next**
4. Review and click **Create user**
5. **Attach SignInLocalDevelopmentAccess:** Click the new user name → **Permissions** tab → **Add permissions** → **Attach policies directly**
   - Search for `SignInLocalDevelopmentAccess`, check the box → **Next** → **Add permissions**

> **Security tip:** Enable MFA on this IAM user. Go to **IAM** → **Users** → `techtoday` → **Security credentials** → **Assign MFA device** → follow the prompts with an authenticator app.

#### 2.1.3. AWS CloudShell

Prefer the browser over a local install? [AWS CloudShell](https://console.aws.amazon.com/cloudshell/) is a terminal built into the AWS Console with the AWS CLI pre-installed and pre-authenticated from your Console sign-in — no `aws configure` or access keys required.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector in the top-right shows `us-east-1`.
2. Click the **CloudShell** icon (the `>_` terminal prompt) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Once the shell starts, paste the same `aws iam` commands from the [CLI](#211-cli) section above — they run unchanged. Remember to replace `ACCOUNT_ID` with your 12-digit AWS account ID.

> Every command in this step is a pure `aws iam` call, so CloudShell runs it identically to a local terminal. Because CloudShell is already signed in as your Console user, you can run these commands even before completing the local `aws login` in [§ 2.2](#22-authenticate-aws-cli-with-aws-login).

---

### 2.2. Authenticate AWS CLI with `aws login`

The `aws login` command opens a browser-based sign-in flow. It issues short-lived session credentials — no long-lived access keys to manage or rotate.

```bash
aws login
```

This opens your default browser to the AWS sign-in page. Sign in with the `techtoday` IAM user credentials (username + password). Once authenticated, the CLI receives temporary session credentials automatically.

> **First-time IAM user?** If the IAM user does not have a console password yet, set one in the AWS Console: **IAM** → **Users** → `techtoday` → **Security credentials** → **Console sign-in** → **Enable console access** → set a password.

#### 2.2.1. Verify Credentials

```bash
aws sts get-caller-identity
# Should print your Account, UserId, and Arn — not an error
```

#### 2.2.2. Re-authenticate When Sessions Expire

Session credentials from `aws login` are temporary. When they expire, simply run `aws login` again to get a fresh session.

> **Region configuration:** If you haven't set a default region, configure it once:
> ```bash
> aws configure set region us-east-1
> ```
>
> The IAM roles in [§ 2.10](#210-create-iam-role-for-ec2-ecr-secrets-access) (EC2 instance role) and [§ 2.11](#211-set-up-github-oidc-and-deploy-role-cicd) (GitHub Actions OIDC role) are separate from this IAM user — they are assumed by AWS services, not by your local CLI.

---

### 2.3. Create Default VPC and Subnets

> **Skip if your account already has a VPC in this region.** Check first:
> ```bash
> aws ec2 describe-vpcs --query "Vpcs[*].{VpcId:VpcId,IsDefault:IsDefault,State:State}" --output table
> ```
> If the output lists any VPCs, skip to [§ 2.4](#24-launch-ec2-instance).
>
> **Why this is needed:** Every EC2 instance, security group, and subnet must belong to a VPC. New AWS accounts and accounts where the default VPC was previously deleted have no VPC, which blocks instance and security group creation.

#### 2.3.1. CLI

```bash
# Create the default VPC (one per region; fails gracefully if one already exists)
aws ec2 create-default-vpc

# Verify the VPC
aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].{VpcId:VpcId,CidrBlock:CidrBlock,State:State}" --output table

# create-default-vpc creates default subnets automatically — verify them:
aws ec2 describe-subnets \
  --filters "Name=defaultForAz,Values=true" \
  --query "Subnets[*].{SubnetId:SubnetId,AZ:AvailabilityZone,CidrBlock:CidrBlock}" --output table
```

> **If the subnet list is empty** (subnets were deleted separately from the VPC), recreate one default subnet per Availability Zone:
> ```bash
> # List available AZs in the region
> aws ec2 describe-availability-zones \
>   --filters "Name=state,Values=available" \
>   --query "AvailabilityZones[*].ZoneName" --output text
>
> # Create a default subnet in each AZ (repeat for each zone shown above)
> aws ec2 create-default-subnet --availability-zone us-east-1a
> aws ec2 create-default-subnet --availability-zone us-east-1b
> aws ec2 create-default-subnet --availability-zone us-east-1c
> # Add more lines if your region has additional AZs
> ```

#### 2.3.2. AWS Console
1. Open **VPC** → **Your VPCs**
2. If no VPCs are listed, click **Actions** → **Create default VPC** → **Create default VPC**
   - Alternatively, from the EC2 **Launch instances** page, click **create a new default VPC** in the yellow warning banner at the top of the Network settings section
3. AWS creates the VPC (`172.31.0.0/16`) with a default subnet in every Availability Zone — verify under **VPC** → **Subnets**
4. **If subnets are missing** (the Subnets list is empty for this VPC), create them manually:
   > **Before doing anything else:** open **VPC** → **Subnets** and filter by this VPC's ID. If **any subnets appear** — even one — **stop completely.** You do not need to create subnets. Close the Create Subnet page and continue to [§ 2.4](#24-launch-ec2-instance). Getting a "CIDR overlaps" error when trying to create a subnet is itself proof that a subnet already exists.
   - Only proceed below if the filtered Subnets list is completely empty.
   - **VPC ID:** select the default VPC (`172.31.0.0/16`)
   - **Subnet name:** `techtoday-subnet`
   - **Availability Zone:** `us-east-1a`
   - **IPv4 subnet CIDR block:** try `172.31.96.0/20` — this is outside the range AWS assigns to default subnets, so it will not overlap
   - Click **Create subnet**
   - Select the new subnet → **Actions** → **Edit subnet settings** → enable **Auto-assign public IPv4 address** → **Save**

#### 2.3.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs the `aws ec2` commands for this step in the browser with no local install — the AWS CLI is pre-installed and pre-authenticated from your Console sign-in.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector shows `us-east-1` (VPCs and subnets are Region-scoped, so CloudShell must be in the target Region).
2. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Paste the `aws ec2 create-default-vpc` / `describe-*` / `create-default-subnet` commands from the [CLI](#231-cli) section above — they run unchanged.

> These are all pure `aws ec2` calls, so CloudShell behaves exactly like a local terminal for this step.

---

### 2.4. Launch EC2 Instance

#### 2.4.1. CLI

```bash
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" "Name=state,Values=available" \
  --query "sort_by(Images,&CreationDate)[-1].ImageId" --output text)

VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" --output text)

SG_ID=$(aws ec2 create-security-group \
  --group-name techtoday-server-sg \
  --description "EC2 app server - allow SSH, HTTP, HTTPS" \
  --vpc-id $VPC_ID \
  --query "GroupId" --output text)

# SSH — for terminal access; see security note below
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
# HTTP — required for Let's Encrypt ACME challenges and HTTP→HTTPS redirects
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
# HTTPS — serves all production traffic
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t2.micro \
  --key-name techtoday_PAIR \
  --security-group-ids $SG_ID \
  --query "Instances[0].InstanceId" --output text)
```

> **Security group rules explained:**
>
> | Rule | Port | Source | Why |
> |------|------|--------|-----|
> | SSH | 22 | `0.0.0.0/0` | Terminal access to the instance |
> | HTTP | 80 | `0.0.0.0/0` | Let's Encrypt ACME challenges + HTTP→HTTPS redirects |
> | HTTPS | 443 | `0.0.0.0/0` | Serves all production traffic |
>
> **Do not add** an "All traffic from self" rule (source = the security group itself) — it is unnecessary for a single-instance setup and widens the attack surface.
>
> **SSH hardening (optional):** For tighter security, restrict SSH to your IP only: replace `0.0.0.0/0` with your public IP (e.g., `203.0.113.42/32`). In the Console, choose **My IP** from the source dropdown. Downside: you'll need to update the rule whenever your IP changes (e.g., different WiFi network). For a personal project with key-based auth, `0.0.0.0/0` is acceptable.

#### 2.4.2. AWS Console
1. Open **EC2** → **Instances** → **Launch instances**
2. Name: `techtoday-server`, AMI: **Amazon Linux 2023**, Instance type: `t2.micro`
3. Key pair: select or create a key pair (save the `.pem` file). Choose `.pem` format for macOS/Linux or `.ppk` for Windows (PuTTY)
4. Under **Network settings**: the default VPC from [§ 2.3](#23-create-default-vpc-and-subnets) is auto-selected; create a new security group with these three inbound rules:
   - **SSH** (port 22) — source: `0.0.0.0/0` (or **My IP** for tighter security)
   - **HTTP** (port 80) — source: `0.0.0.0/0`
   - **HTTPS** (port 443) — source: `0.0.0.0/0`
5. Click **Launch instance**

#### 2.4.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) can run the `aws ec2` commands that create the security group and launch the instance, without a local AWS CLI install.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector shows `us-east-1`.
2. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Paste the block from the [CLI](#241-cli) section above **as a single session** — the `AMI_ID`, `VPC_ID`, `SG_ID`, and `INSTANCE_ID` shell variables are set along the way and reused by later commands here and in [§ 2.5](#25-allocate-elastic-ip) and [§ 2.7](#27-create-route-53-a-records), so keep the same CloudShell tab open.

> The `--key-name` value must reference a key pair that already exists in this Region. CloudShell cannot download the resulting `.pem` file to your machine, so create/download the key pair in the [AWS Console](#242-aws-console) first, then reference its name here. The SSH steps in [§ 2.4.4](#244-set-up-ssh-key-pair) still run from your local terminal.

#### 2.4.4. Set Up SSH Key Pair

After creating or downloading the `.pem` key file:

```bash
# macOS / Linux — restrict permissions (SSH refuses keys with open permissions)
chmod 400 techtoday.pem

# Verify permissions
ls -la techtoday.pem
# Expected: -r--------  (read-only for owner)
```

```powershell
# Windows PowerShell
icacls techtoday.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

> **Troubleshooting:** If you get `Permission denied (publickey)`, check: (1) key file permissions are `400`, (2) you're using the correct `.pem` file for this instance, (3) the username is `ec2-user` (Amazon Linux) not `ubuntu` or `root`.

---

### 2.5. Allocate Elastic IP

#### 2.5.1. CLI

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query "AllocationId" --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOC_ID \
  --query "Addresses[0].PublicIp" --output text)
echo "Elastic IP: $ELASTIC_IP"
```

#### 2.5.2. AWS Console
1. Open **EC2** → **Elastic IPs** → **Allocate Elastic IP address**
2. Leave defaults (Amazon's pool of IPv4 addresses) → click **Allocate**
3. Select the new Elastic IP → **Actions** → **Associate Elastic IP address**
4. Choose the `techtoday-server` instance → click **Associate**
5. Note the allocated IP — you'll use it as `$ELASTIC_IP` in subsequent steps

#### 2.5.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs the `aws ec2` address commands for this step in the browser.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector shows `us-east-1`.
2. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Paste the commands from the [CLI](#251-cli) section above. Run them in the **same CloudShell session** you used for [§ 2.4](#24-launch-ec2-instance) so that `$INSTANCE_ID` is still set; the block also exports `$ELASTIC_IP` for use in [§ 2.7](#27-create-route-53-a-records).

> The SSH connection test in [§ 2.5.4](#254-test-ssh-connection) needs your local `.pem` key, so run that part from your local terminal rather than CloudShell.

#### 2.5.4. Test SSH Connection

> **Before connecting:** open **EC2 → Instances**, click `techtoday-server`, and wait until **Instance state** shows `Running` and **Status checks** shows `2/2 checks passed`. This can take 1–3 minutes after the Elastic IP is associated.

> **Console path note:** if you followed the AWS Console steps above, `$ELASTIC_IP` is not set in your terminal. Use the actual IP directly (e.g., `xx.xxx.xxx.xxx`).

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP
# or, using the actual IP if the variable is not set:
# ssh -i techtoday.pem ec2-user@44.193.134.238
# Should open a shell on the EC2 instance
# Type 'exit' to disconnect
```

> **If SSH hangs silently (no output, have to Ctrl+C):**
> This means the security group is **dropping** port 22 packets. Go to **EC2 → Instances → techtoday-server → Security tab → click the security group → Inbound rules**. If there is no SSH / port 22 rule, click **Edit inbound rules → Add rule → Type: SSH → Source: Anywhere-IPv4 (0.0.0.0/0) → Save rules**. Then retry SSH.
>
> **If SSH immediately prints `Permission denied (publickey)`:**
> The connection reached the server but the key was rejected. Check: (1) key permissions are `400` (`chmod 400 techtoday.pem`), (2) username is `ec2-user` not `ubuntu` or `root`, (3) you are using the `.pem` that matches the key pair selected when launching the instance.
>
> **If you lost the original `.pem` file:**
> AWS only lets you download the private key **once** at creation time — there is no way to retrieve it later. To regain access:
>
> 1. **Connect via EC2 Instance Connect:** Go to **EC2 → Instances → select instance → Connect → EC2 Instance Connect tab → Connect**. This opens a browser-based SSH session with no key file needed.
> 2. **Create a new key pair locally:**
>    ```bash
>    # On your local machine — create a new key pair
>    aws ec2 create-key-pair --key-name techtoday-new \
>      --query "KeyMaterial" --output text > techtoday-new.pem
>    chmod 400 techtoday-new.pem
>    ```
>    Or create one in the Console: **EC2 → Key Pairs → Create key pair** → download the `.pem` file.
> 3. **Extract the public key from the new `.pem` file:**
>    ```bash
>    # On your local machine
>    ssh-keygen -y -f techtoday-new.pem
>    # Prints: ssh-rsa AAAA... (copy the entire output)
>    ```
> 4. **Add it on the EC2 instance** (in the EC2 Instance Connect browser session):
>    ```bash
>    echo "ssh-rsa AAAA...your-full-public-key..." >> ~/.ssh/authorized_keys
>    ```
> 5. **SSH from your local machine with the new key:**
>    ```bash
>    ssh -i techtoday-new.pem ec2-user@44.193.134.238
>    ```

---

### 2.6. Install Docker, Docker Compose, and Nginx on EC2

> **Connecting from Windows:** use `icacls techtoday.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"` instead of `chmod 400`.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

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

### 2.7. Create Route 53 A Records

#### 2.7.1. CLI

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

#### 2.7.2. AWS Console
1. Open **Route 53** → **Hosted zones** → click the `techtoday.click` zone
2. Click **Create record** for each of the three records below:
   - **Record name:** leave blank (for `techtoday.click`), **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
   - **Record name:** `www`, **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
   - **Record name:** `app`, **Type:** `A`, **Value:** paste the Elastic IP, **TTL:** `300`
3. Click **Create records** after each

#### 2.7.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs the `aws route53` commands for this step in the browser with no local install.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and open the **CloudShell** icon (`>_`) in the top navigation bar, or go to [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
2. Route 53 is a global service, so the Region selector does not matter here.
3. Paste the commands from the [CLI](#271-cli) section above. Run them in the **same CloudShell session** used for [§ 2.5](#25-allocate-elastic-ip) so `$ELASTIC_IP` is still set; otherwise set it first with `ELASTIC_IP=<your-elastic-ip>`.

> All commands here are pure `aws route53` calls, so CloudShell runs them identically to a local terminal.

---

### 2.8. Configure Nginx

> **Must be done before requesting SSL certificates.** Certbot's `--nginx` plugin needs an existing server block with a matching `server_name` directive to install certs into.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

sudo mkdir -p /var/www/techtoday

# Main domain — static home page
sudo tee /etc/nginx/conf.d/techtoday.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name techtoday.click www.techtoday.click;

    root  /var/www/techtoday;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# App subdomain — Docker container projects. Project location blocks are added
# later with ADD_PROJECT.md.
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.techtoday.click;

  location / {
    return 404;
  }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

> **What happens next:** These are HTTP-only configs. In the next step ([§ 2.9](#29-request-ssl-certificates)), Certbot will automatically modify these files to add `listen 443 ssl`, SSL certificate paths, and HTTP→HTTPS redirects.

---

### 2.9. Request SSL Certificates

> **Skip if already done.** If Let's Encrypt certs are already installed on this EC2 instance (check with `sudo certbot certificates`), skip this step.
>
> **Prerequisites:** Nginx must be configured with matching `server_name` blocks ([§ 2.8](#28-configure-nginx)) and DNS records must point to this instance ([§ 2.7](#27-create-route-53-a-records)).
>
> **Note:** ACM certificates (visible in AWS Certificate Manager console) are for CloudFront/ALB only and cannot be used directly with Nginx on EC2. This step installs separate Let's Encrypt certs via Certbot.

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

# Wait ~2 minutes for DNS propagation, then:
sudo certbot --nginx -d techtoday.click -d www.techtoday.click
sudo certbot --nginx -d app.techtoday.click

sudo certbot renew --dry-run  # verify auto-renewal
```

> Certbot automatically modifies the Nginx config files from [§ 2.8](#28-configure-nginx) to add SSL listeners, certificate paths, and HTTP→HTTPS redirects. No manual Nginx editing needed after this step.

> **If the browser shows "Not Secure" after setup:** the HTTP→HTTPS redirect for `app.techtoday.click` may be missing — this happens when the Nginx config is recreated after Certbot ran. Verify and fix:
> ```bash
> sudo grep -A3 "listen 80" /etc/nginx/conf.d/app.conf
> ```
> If the `listen 80` block does **not** contain `return 301 https://`, add it:
> ```bash
> sudo nano /etc/nginx/conf.d/app.conf
> ```
> Ensure a redirect-only `listen 80` block exists:
> ```nginx
> server {
>     listen 80;
>     server_name app.techtoday.click;
>     return 301 https://$host$request_uri;
> }
> ```
> Then: `sudo nginx -t && sudo systemctl reload nginx`

---

### 2.10. Create IAM Role for EC2 (ECR + Secrets Access)

> **One-time.** All projects on this EC2 instance share this role.

#### 2.10.1. CLI

```bash
aws iam create-role \
  --role-name ec2-techtoday-server-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},
    "Action":"sts:AssumeRole"}]}'

aws iam put-role-policy \
  --role-name ec2-techtoday-server-role \
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

aws iam create-instance-profile --instance-profile-name ec2-techtoday-server-profile

aws iam add-role-to-instance-profile \
  --instance-profile-name ec2-techtoday-server-profile \
  --role-name ec2-techtoday-server-role

aws ec2 associate-iam-instance-profile \
  --instance-id $INSTANCE_ID \
  --iam-instance-profile Name=ec2-techtoday-server-profile
```

#### 2.10.2. AWS Console
1. Open **IAM** → **Roles** → **Create role**
2. **Trusted entity type:** AWS service → **Use case:** EC2 → **Next**
3. Skip adding policies for now (we'll add an inline policy) → **Next**
4. **Role name:** `ec2-techtoday-server-role` → **Create role**
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
8. Attach the role to the EC2 instance: open **EC2** → **Instances** → select `techtoday-server` → **Actions** → **Security** → **Modify IAM role** → select `ec2-techtoday-server-role` → **Update IAM role**

#### 2.10.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs all of this step's `aws iam` and `aws ec2` commands in the browser with no local install.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and confirm the Region selector shows `us-east-1`.
2. Click the **CloudShell** icon (`>_`) in the top navigation bar, or open [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
3. Paste the block from the [CLI](#2101-cli) section above. Run it in the **same CloudShell session** used for [§ 2.4](#24-launch-ec2-instance) so `$INSTANCE_ID` is still set for the final `associate-iam-instance-profile` command; otherwise set it first with `INSTANCE_ID=<your-instance-id>`.

> IAM is a global service and the `aws ec2` calls here are Region-scoped, so keep CloudShell in `us-east-1` to match the instance.

---

### 2.11. Set Up GitHub OIDC and Deploy Role (CI/CD)

> **One-time.** Shared by all projects' GitHub Actions workflows.

#### 2.11.1. CLI

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

#### 2.11.2. AWS Console
1. **Create the OIDC provider:** Open **IAM** → **Identity providers** → **Add provider**
   - **Provider type:** OpenID Connect
   - **Provider URL:** `https://token.actions.githubusercontent.com` → click **Get thumbprint**
   - **Audience:** `sts.amazonaws.com` → **Add provider**
2. **Create the deploy role:** Open **IAM** → **Roles** → **Create role**
   - **Trusted entity type:** Web identity
   - **Identity provider:** select `token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
   - **GitHub Organization:** `YOUR_GITHUB_ORG` (replace with your org name or your username) → **Next**
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

#### 2.11.3. AWS CloudShell

[AWS CloudShell](https://console.aws.amazon.com/cloudshell/) runs this step's `aws iam` commands in the browser with no local install.

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and open the **CloudShell** icon (`>_`) in the top navigation bar, or go to [console.aws.amazon.com/cloudshell](https://console.aws.amazon.com/cloudshell/) directly.
2. IAM is a global service, so the Region selector does not matter here.
3. Paste the commands from the [CLI](#2111-cli) section above, replacing `ACCOUNT_ID` with your 12-digit AWS account ID and `YOUR_GITHUB_ORG` / `YOUR_REPO_NAME` with your GitHub org and repository.

> The GitHub repository secrets in [§ 2.11.4](#2114-github-secrets) are set in GitHub, not AWS, so CloudShell is not involved in that part.

#### 2.11.4. GitHub Secrets

Set at: repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

1. `EC2_SSH_KEY` — full content of the `.pem` file
2. `EC2_HOST` — the Elastic IP
3. `AWS_DEPLOY_ROLE_ARN` — ARN of the `github-actions-deploy` role
4. `AWS_REGION` — e.g., `us-east-1`
5. `AWS_ACCOUNT_ID` — your 12-digit account ID

---

### 2.12. Secrets & Environment Variables Reference

The shared locations for deployment secrets and runtime environment variables.
Project-specific secret keys are maintained in `PROJECTS.md`.

#### 2.12.1. GitHub Actions Secrets

Set at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Shared by all project workflows. Current workflow names are listed in `PROJECTS.md`.

1. `AWS_REGION` — AWS region, e.g. `us-east-1`
2. `AWS_ACCOUNT_ID` — your 12-digit AWS account ID
3. `AWS_DEPLOY_ROLE_ARN` — full ARN of the `github-actions-deploy` IAM role, e.g. `arn:aws:iam::123456789012:role/github-actions-deploy`
4. `EC2_HOST` — Elastic IP of the EC2 instance, e.g. `1.2.3.4`
5. `EC2_SSH_KEY` — full contents of the `.pem` private key file (include the `-----BEGIN RSA PRIVATE KEY-----` header/footer)

#### 2.12.2. AWS Secrets Manager

Set at: **AWS Console → Secrets Manager → Store a new secret → Other type of secret**

Accessed by the EC2 instance at container startup and never stored in the repo or
Docker image:

1. Secret name: `techtoday/secrets`
2. Contents: JSON key/value pairs for the API keys listed per project in `PROJECTS.md`.

#### 2.12.3. Docker Compose Environment Variables

Set in `~/docker-compose.yml` on the EC2 instance (not secret — safe to commit):

1. `PATH_PREFIX` — URL path prefix for the Flask app, e.g. `/<project-name>` — tells Flask which prefix Nginx forwards under

The same production service block must also use `command: python src/python/app.py`
for every container app. If it still points at the old `python src/app.py` path,
the container will restart and Nginx will return `502 Bad Gateway` for that
project URL.

#### 2.12.4. Per-Project Secrets

Which project uses which key, and which projects need no secret at all, is
documented per project in `PROJECTS.md`.
When a new project needs a new key, add it to the shared `techtoday/secrets`
secret in § 2.12.2 above.

> **Adding a new project?** The full end-to-end walkthrough lives in `ADD_PROJECT.md`.



