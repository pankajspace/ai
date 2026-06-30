# AWS Resource Cleanup Guide

Cleanup order for: CloudFront distributions, S3 buckets, EC2 instances — while keeping the domain `techtoday.click`.

---

## Step 1: Disable CloudFront Distributions (Do this first — takes ~15 min)

1. Go to **CloudFront → Distributions**
2. Select `E1QI9RWG3DPB12` (aws-s3-basic-static-website) → click **Disable** → confirm
3. Select `E3GH4YA87MGW77` (Microfrontend/techtoday.click) → click **Disable** → confirm
4. Wait until Status changes from `Disabling` to `Disabled` (~15 minutes)
5. Then select each → click **Delete**

---

## Step 2: Clean Up Route 53 Records

Keep the **NS** and **SOA** records for `techtoday.click`. Delete only the records tied to resources being removed:

- `aws-ec2-basic.techtoday.click` (A → EC2 IP)
- `aws-s3-basic-static-website.techtoday.click` (A alias → CloudFront/S3)
- `www.techtoday.click` (A alias → CloudFront)
- `techtoday.click` A record (alias to CloudFront `d16tuphn...`) — delete if removing that CloudFront distribution
- All CNAME records for ACM certificate validation (`_82208d...`, `_fc0cf...`, `_80d11...`, `_94f34...`) — safe to delete once distributions are gone

> Do NOT delete the hosted zone or the domain registration.

---

## Step 3: Empty and Delete S3 Buckets

For each of the 4 buckets (`aws-s3-basic`, `aws-s3-basic-private`, `aws-s3-basic-static-website`, `mf-sg-dashboard`):

1. Click the bucket name → click **Empty** → type `permanently delete` → confirm
2. Go back → select the bucket → click **Delete** → type bucket name → confirm

> Buckets with versioning enabled need the **Empty** step to remove all versions first.

---

## Step 4: Terminate EC2 Instances

1. Go to **EC2 → Instances**
2. Select `aws-ec2-basic` → **Instance state → Terminate instance** → confirm
3. Select `complete-nodejs-dev-ztm` → **Instance state → Terminate instance** → confirm

> Both instances are already Stopped, so termination is straightforward.

---

## Step 5: Clean Up Remaining EC2 Resources

After instances terminate, clean up in this order:

### Key Pairs (4)
1. Go to **EC2 → Network & Security → Key Pairs**
2. Select each key pair you no longer need (`aws-ec2-basic`, `complete-nodejs-dev-ztm`, etc.)
3. Click **Actions → Delete** → type `Delete` → confirm

> Deleting a key pair only removes it from AWS — it does not affect any already-running instances.

### EBS Volumes (1)
1. Go to **EC2 → Elastic Block Store → Volumes**
2. Wait for instances to finish terminating (volume state becomes `available`)
3. Select the volume → **Actions → Delete volume** → confirm

> Volumes that were set to "delete on termination" are removed automatically. Only manually-attached volumes remain.

### Security Groups (3)
1. Go to **EC2 → Network & Security → Security Groups**
2. You will see 3 groups — the `default` security group **cannot be deleted**
3. Select each custom group → **Actions → Delete security groups** → confirm

> If a security group is still referenced by another group or a network interface, delete the referencing resource first.

### Elastic IPs (0)
Your dashboard shows 0 Elastic IPs — nothing to do here.

### Snapshots (0) / Load Balancers (0) / Auto Scaling Groups (0)
Your dashboard shows 0 for all of these — nothing to clean up.

---

## Step 6: Certificate Manager (ACM)

1. Go to **Certificate Manager** (visible in your console bookmarks)
2. Delete any certificates that were created for `techtoday.click` subdomains used by the CloudFront distributions
3. Select the certificate → **Actions → Delete** → confirm

> ACM certificates are free, but leaving unused ones creates clutter. You cannot delete a certificate that is still attached to a CloudFront distribution — delete the distributions first (Step 1).

---

## Step 7: IAM Cleanup

1. Go to **IAM → Users**: Delete any users created specifically for these projects (e.g., programmatic access users for S3/EC2)
2. Go to **IAM → Roles**: Delete any roles created for EC2 instance profiles or Lambda
3. Go to **IAM → Policies**: Delete any custom inline policies tied to deleted resources

> Never delete your primary admin user. Only remove project-specific users/roles.

---

## Step 8: CloudWatch Cleanup

1. Go to **CloudWatch → Logs → Log groups**
2. Delete log groups created by EC2 instances or any Lambda functions (named after your resources)
3. Go to **CloudWatch → Alarms**: Delete any billing or resource alarms set up for these projects

> Log groups continue to incur storage costs even after the resource that created them is deleted.

---

## Step 9: VPC Cleanup

1. Go to **VPC → Your VPCs**
2. If you created a **custom VPC** for these projects, delete it along with its:
   - Subnets
   - Internet Gateway (detach first, then delete)
   - Route Tables (delete custom ones; the main route table is deleted with the VPC)
   - NAT Gateways — **delete these immediately if any exist, they are expensive (~$32/month each)**
3. The `default` VPC should be left as-is

---

## Step 10: AWS WAF Cleanup

AWS WAF Web ACLs show up in your billing and cost ~$5/month each even when not actively used.

1. Go to **AWS WAF & Shield** (search in the AWS console)
2. Click **Web ACLs** — make sure the region selector is set to the correct region (also check **Global (CloudFront)** scope separately)
3. Select each Web ACL that was associated with your CloudFront distributions → click **Delete**
4. Also check **IP sets**, **Regex pattern sets**, and **Rule groups** — delete any that were created for these projects

> WAF Web ACLs must be disassociated from CloudFront before they can be deleted. Since you're deleting CloudFront distributions in Step 1, WAF cleanup should happen after that.

---

## Step 11: Review & Fix Budget Alerts

Your billing dashboard shows 1 exceeded budget and 3 triggered budget alerts.

1. Go to **Billing → Budgets**
2. Review which budget was exceeded — check if it's due to resources being cleaned up now
3. Once cleanup is complete, either:
   - **Update** the budget thresholds to match your expected spend going forward
   - **Delete** budgets that were created for these specific projects
4. Go to **Billing → Budget alerts** and dismiss or reconfigure alerts accordingly

> Consider creating a new budget after cleanup (e.g., $5/month alert) to catch any accidentally left-on resources.

---

## Step 12: Verify with Cost Explorer

After cleanup, confirm no resources are still billing:

1. Go to **Billing → Cost Explorer**
2. Check the current month's spend by service
3. Any service still showing ongoing cost means a resource was missed
4. Also check **Billing → Bills** for any pending charges

---

## Cleanup Order Summary

```
CloudFront disable → wait → CloudFront delete
    ↓
ACM certificates delete
    ↓
AWS WAF Web ACLs delete
    ↓
Route 53 records cleanup (keep NS + SOA)
    ↓
S3 empty → S3 delete
    ↓
EC2 terminate → Volumes → Security Groups → Key Pairs
    ↓
NAT Gateways delete (if any — high cost!)
    ↓
Custom VPC delete
    ↓
CloudWatch Log Groups delete
    ↓
IAM users/roles/policies cleanup
    ↓
Budgets — update or delete exceeded budgets
    ↓
Cost Explorer — verify $0 ongoing spend
```
