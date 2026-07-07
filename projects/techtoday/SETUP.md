# TechToday Home Page — Setup

Setup for the **TechToday home page** only. Two groups of shared, one-time steps must be completed first:

1. **Local machine prerequisites** — git, rsync
2. **One-time AWS infrastructure** — EC2, Elastic IP, Route 53, Nginx, SSL

This is a static site — no Docker, no API keys, no application server.

---

## 1. Local Development

### 1.1. Prerequisites

No tools required beyond a modern browser and `git`.

### 1.2. Local Preview

#### Direct File Open (fastest)

```bash
open projects/techtoday/src/index.html
```

#### Local HTTP Server

```bash
cd projects/techtoday/src
python3 -m http.server 8000
# open http://localhost:8000
```

### 1.3. Key Files

1. `src/index.html` — single HTML page; all content lives here
2. `src/css/style.css` — all styles; dark-theme design tokens are CSS custom properties at the top of the file
3. `src/js/main.js` — mobile nav toggle only; keep this file minimal

---

## 2. Production Deployment

Deploys to `https://techtoday.click/` — static files served by Nginx, no Docker container needed.

> **Already done** if you completed the shared one-time AWS infrastructure setup — it creates the DNS records, Nginx config, and SSL certs for all domains. The details below are kept for reference or for adding TechToday to a server set up independently.

### 2.1. Add Nginx Server Block

```bash
ssh -i techtoday.pem ec2-user@$ELASTIC_IP

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

### 2.2. Request SSL Certificate

> **Skip if already done.** ACM certs in the AWS console are for CloudFront/ALB only and do not apply here. Run this only if Let's Encrypt certs for `techtoday.click` are not yet installed on EC2 (verify with `sudo certbot certificates`).

```bash
sudo certbot --nginx -d techtoday.click -d www.techtoday.click
sudo nginx -t && sudo systemctl reload nginx
```

### 2.3. Add Route 53 DNS Records

#### CloudShell / Console alternative
The `aws route53` command below can be run in [AWS CloudShell](https://console.aws.amazon.com/cloudshell/), or use the Console UI shown after the CLI block.

#### CLI

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

#### AWS Console
1. Open **Route 53** → **Hosted zones** → click `techtoday.click`
2. **Create record:** leave name blank, **Type:** `A`, **Value:** paste Elastic IP, **TTL:** `300` → **Create records**
3. **Create record:** name `www`, **Type:** `A`, **Value:** paste Elastic IP, **TTL:** `300` → **Create records**

### 2.4. Deploy Static Files

#### macOS / Linux

```bash
# From the repo root
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

#### Windows (WSL)

`rsync` is not available natively on Windows. The simplest option is to run the same command inside a **WSL terminal**:

```bash
# From the repo root inside WSL
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

> **WSL path to the .pem file:** if the key is stored on the Windows filesystem (e.g., `C:\Users\you\techtoday.pem`), reference it as `/mnt/c/Users/you/techtoday.pem` inside WSL and make sure permissions are set: `chmod 400 /mnt/c/Users/you/techtoday.pem`.

#### Windows (Git Bash)

If you have Git for Windows installed, open **Git Bash** and run the same command as the macOS/Linux section — Git Bash includes rsync and uses forward-slash paths:

```bash
rsync -avz --delete \
  projects/techtoday/src/ \
  ec2-user@$ELASTIC_IP:/var/www/techtoday/
```

#### Windows (CI/CD alternative)

If you prefer not to install WSL or Git Bash, push your changes to `main` — the `deploy-techtoday.yml` GitHub Actions workflow runs rsync automatically on a Linux runner. No local rsync installation needed.

No Nginx reload is needed — static files are served directly.

> **Troubleshooting:** If rsync fails with `Permission denied (13)` or `failed to set times`, the directory is owned by root. Fix it on the EC2 instance:
> ```bash
> ssh -i ~/techtoday.pem ec2-user@$ELASTIC_IP
> sudo chown -R ec2-user:ec2-user /var/www/techtoday
> ```
> Then re-run the rsync command or re-trigger the GitHub Actions workflow.

### 2.5. Verify Production Deployment

```bash
curl -I https://techtoday.click/
# Expect: HTTP/2 200, content-type: text/html
```

**Browser alternative:** Open [https://techtoday.click/](https://techtoday.click/) in your browser and confirm the home page loads.

---

## Secrets Reference

TechToday has no project-specific secrets or environment variables — it's a static site with no server-side API keys.
