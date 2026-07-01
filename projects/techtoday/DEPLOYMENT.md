[← README](README.md) · [Development Guide](DEVELOPMENT.md) · [Common Deployment Guide](../DEPLOYMENT.md)

# Deployment — TechToday Home Page

This document covers everything needed to deploy the `techtoday` static site to production at `techtoday.click`. For shared AWS infrastructure (EC2, Route 53, Nginx, SSL, IAM) see the [common deployment guide](../DEPLOYMENT.md).

---

## Deployment Target

1. `techtoday.click` — path `/` — Static files (HTML, CSS, JS)
2. `www.techtoday.click` — path `/` — Redirect → `techtoday.click`

The static files in `src/` are served directly from the root of the main domain. No Docker container or application server is needed.

---

## Secrets & Environment Variables Used By This Project

Shared CI/CD secrets (`AWS_REGION`, `AWS_ACCOUNT_ID`, `AWS_DEPLOY_ROLE_ARN`, `EC2_HOST`, `EC2_SSH_KEY`) are documented once in the [common deployment guide](../DEPLOYMENT.md#secrets--environment-variables-reference) — set them in GitHub repo Settings, not here.

This project has no project-specific secrets or environment variables — it's a static site with no server-side API keys.

---

## Local Machine Prerequisites

In addition to the shared tools in the [common Deployment Guide](../DEPLOYMENT.md#local-machine-prerequisites) (AWS CLI, SSH client, git):

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

---

### Option B — S3 + CloudFront (Zero-Maintenance)

Best for pure static hosting with global CDN, no EC2 involvement.

**1. Create an S3 bucket:**

```bash
aws s3api create-bucket \
  --bucket techtoday-site \
  --region us-east-1
```

**2. Upload site files:**

```bash
aws s3 sync projects/techtoday/src/ s3://techtoday-site/ \
  --delete \
  --cache-control "public, max-age=86400"

# Set shorter cache for HTML so updates propagate quickly
aws s3 cp projects/techtoday/src/index.html s3://techtoday-site/index.html \
  --cache-control "public, max-age=60"
```

**3. Create a CloudFront distribution** pointing to the S3 bucket, with:
- Default root object: `index.html`
- HTTPS redirect enforced
- Custom domain: `techtoday.click` and `www.techtoday.click`
- ACM certificate (us-east-1 region required for CloudFront)

**4. Create Route 53 A alias records** pointing `techtoday.click` and `www.techtoday.click` to the CloudFront distribution domain.

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

---

## CI/CD (Automatic Deploy on Push)

See [.github/workflows/deploy-techtoday.yml](../../.github/workflows/deploy-techtoday.yml) for the automated deploy pipeline. It triggers on any push to `main` that touches `projects/techtoday/src/**` and runs `rsync` (Option A) to copy the updated static files to EC2.
