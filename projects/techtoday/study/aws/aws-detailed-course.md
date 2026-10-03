<!--
Source: aws-detailed-course.html
Title: AWS Detailed Course | TechToday
Description: A 38-section deep dive into AWS from first principles — global infrastructure, Organizations, IAM policy evaluation, VPC networking and PrivateLink, EC2 and Auto Scaling, S3, RDS and Aurora, DynamoDB, Lambda, containers, Step Functions, messaging, streaming, analytics, Route 53, CloudFront, observability, KMS and security services, infrastructure as code, CI/CD, cost optimisation and the Well-Architected Framework.
Theme-color: #0b0d10
Stylesheets: aws-study.css, ../../site-header.css
Scripts: aws-study.js
-->

Navigation: [TechToday](../../index.html) · [← AWS Courses](aws-courses.html)

<a id="aws-detailed-course"></a>

# Amazon Web Services

Thirty-eight sections, ordered so that each one depends only on the ones before it. This is the long version: not a tour of the console, but an explanation of the mechanisms — how a request is authorised, how a packet is routed, how a partition key becomes a physical placement, how a deployment rolls back. Animations appear wherever a process has steps; press **Play** and step through them. Code samples switch between boto3, the AWS CLI, the JavaScript SDK and CloudFormation with the language tabs.

> **Key idea**
>
> **New to AWS?** Read the [AWS Crash Course](aws-crash-course.html) first. It covers the fifteen services you will actually touch, in fourteen sections, and gives you the mental models this page assumes. Come back here when you want the parts that were deliberately left out.

<a id="table-of-contents"></a>

## Table of Contents

1. [What AWS Is, and How to Think About It](#1-what-aws-is)
2. [Global Infrastructure](#2-global-infrastructure)
3. [Accounts, Organizations & Landing Zones](#3-accounts-and-organizations)
4. [IAM I — Identities, Principals & Credentials](#4-iam-identities)
5. [IAM II — Policies & the Evaluation Engine](#5-iam-policies)
6. [IAM III — Roles, Federation & Identity Center](#6-iam-roles)
7. [Talking to AWS — CLI, SDKs & the Credential Chain](#7-clients-and-credentials)
8. [VPC Fundamentals — CIDR, Subnets & Routes](#8-vpc-fundamentals)
9. [VPC Connectivity — Gateways, NAT & PrivateLink](#9-vpc-connectivity)
10. [Firewalls — Security Groups & Network ACLs](#10-firewalls)
11. [Connecting Networks — Peering, TGW, VPN & DX](#11-connecting-networks)
12. [EC2 — Instances, Storage & Purchase Options](#12-ec2)
13. [Auto Scaling & Launch Templates](#13-auto-scaling)
14. [Elastic Load Balancing](#14-load-balancing)
15. [Amazon S3 in Depth](#15-s3)
16. [S3 Security, Versioning, Lifecycle & Replication](#16-s3-data-management)
17. [File Storage — EFS, FSx & Storage Gateway](#17-file-storage)
18. [RDS & Aurora](#18-rds-aurora)
19. [DynamoDB — Modelling, Capacity & Indexes](#19-dynamodb)
20. [Caching — ElastiCache & DAX](#20-caching)
21. [Lambda in Depth](#21-lambda)
22. [API Gateway](#22-api-gateway)
23. [Containers — ECR, ECS, Fargate & EKS](#23-containers)
24. [Step Functions & Orchestration](#24-step-functions)
25. [Messaging — SQS, SNS & EventBridge](#25-messaging)
26. [Streaming — Kinesis, Firehose & MSK](#26-streaming)
27. [Analytics — Athena, Glue, Redshift & OpenSearch](#27-analytics)
28. [Route 53 & DNS](#28-route53)
29. [CloudFront & the Edge](#29-cloudfront)
30. [Observability — CloudWatch, X-Ray & CloudTrail](#30-observability)
31. [Security Services — KMS, Secrets, GuardDuty, WAF](#31-security-services)
32. [Infrastructure as Code](#32-iac)
33. [CI/CD on AWS](#33-cicd)
34. [Cost Management & Optimisation](#34-cost)
35. [The Well-Architected Framework](#35-well-architected)
36. [Cheat Sheet](#36-cheat-sheet)
37. [Pattern-Recognition Playbook](#37-playbook)
38. [Practice Roadmap](#38-roadmap)

<a id="unit-1"></a>

## Unit 1 — Accounts, Identity & Access

How AWS is organised and how every single API request is authenticated and authorised.

<a id="1-what-aws-is"></a>

## 1. What AWS Is, and How to Think About It

> **In plain words**
>
> **In plain English**
>
> AWS is an enormous amount of hardware with a web API bolted to the front. The console, the CLI, Terraform and your own code are all just different callers of that same API — there is no secret back door. It also helps to know that every service has two halves: the *ordering desk* that creates and changes resources, and the *resource itself* doing the work. The second keeps running even when the first is having a bad day.

AWS is a set of APIs in front of a very large amount of hardware. That sentence is not a simplification — it is the most useful frame you can hold, because it explains almost every behaviour that otherwise seems arbitrary. The console is a web application that calls those APIs. The CLI is a program that calls those APIs. Terraform, CDK, the mobile app and your own code are all clients of the same interface, authenticated the same way, logged the same way, rate-limited the same way. There is no privileged path.

A second frame is nearly as useful: AWS services come in two halves, and they fail independently. The **control plane** is the part that creates, modifies and describes resources — `RunInstances`, `CreateBucket`, `UpdateService`. The **data plane** is the part that does the work — the instance running, the object being read, the packet being forwarded. Data planes are engineered to be far more available than control planes, and they are designed to keep working when the control plane is impaired. This is why AWS advice so often says "do not depend on a control plane call in your recovery path": an Auto Scaling group that must call `RunInstances` during a large regional event may be waiting behind everyone else's calls, while the instances you already have carry on serving traffic perfectly.

> **Analogy** 🏗️
>
> **Picture it — a very large equipment rental company**
>
> The **control plane** is the front desk: you fill in a form and they bring you a machine, change your booking, or tell you what you currently have out. The **data plane** is the machine itself, running on your site. If the front desk is overwhelmed on a busy morning you cannot rent anything new — but every machine already on your site keeps digging. A recovery plan that begins "phone the front desk and ask for six more excavators" is a plan that fails precisely when everyone else is phoning too. A recovery plan that begins "start the excavator we already have parked in the second yard" works.

<a id="1-1-the-api-shape"></a>

### 1.1 What an API call actually looks like

Every AWS request is HTTPS to a regional endpoint, signed with **Signature Version 4**. The signature is an HMAC over a canonical form of the request — method, path, query string, a selected set of headers, a hash of the body, and a timestamp — keyed by a value derived from your secret access key, the date, the Region and the service. Three consequences follow, and all three show up as real bugs:

- Your **secret key is never transmitted**. It is the HMAC key, not a password. This is why a network observer cannot replay your credentials, and why AWS can log every request without logging anything sensitive.
- The signature covers a **timestamp**, and requests more than fifteen minutes out of skew are rejected with `SignatureDoesNotMatch` or `RequestTimeTooSkewed`. A container with a broken clock cannot talk to AWS at all, and the error message does not mention time.
- The signature is scoped to a **Region and service**. Sending a request signed for `us-east-1` to the `eu-west-1` endpoint fails. Cross-Region access means creating a client for that Region, not adding a parameter.

```text
POST / HTTP/1.1
Host: dynamodb.us-east-1.amazonaws.com
X-Amz-Date: 20260210T142233Z
X-Amz-Target: DynamoDB_20120810.GetItem
Authorization: AWS4-HMAC-SHA256
    Credential=ASIA.../20260210/us-east-1/dynamodb/aws4_request,
    SignedHeaders=host;x-amz-date;x-amz-target,
    Signature=8f2c...        ← HMAC over the canonical request
X-Amz-Security-Token: IQoJb3JpZ2luX2Vj...   ← present only for role sessions

{"TableName":"orders","Key":{"pk":{"S":"USER#42"}}}
```

<a id="1-2-arns"></a>

### 1.2 ARNs, the universal address

Every resource on AWS has an **Amazon Resource Name**, and you will read and write thousands of them. The format is regular, and knowing the fields by position makes IAM policies far less mysterious:

```text
arn : aws : service : region : account-id : resource
                │ │ │ │ │ │
                │ │ │ │ │ └── s3 object key, table name, function name…
                │ │ │ │ └────────────── 12 digits, or empty for S3 and IAM
                │ │ │ └───────────────────────── us-east-1, or empty for global services
                │ │ └────────────────────────────────── s3, iam, lambda, dynamodb…
                │ └───────────────────────────────────────── aws, aws-cn, aws-us-gov
                └─────────────────────────────────────────────── always "arn"

                arn:aws:s3:::acme-reports ← the bucket (no region, no account)
                arn:aws:s3:::acme-reports/2026/q1.csv ← an object (different ARN!)
                arn:aws:iam::123456789012:role/deployer ← global service, so no region
                arn:aws:lambda:eu-west-1:123456789012:function:resize-image
```

> **Warning**
>
> **The bucket ARN and the object ARN are different resources, and this causes more IAM confusion than anything else.** `s3:ListBucket` operates on the bucket, so it needs `arn:aws:s3:::acme-reports`. `s3:GetObject` operates on an object, so it needs `arn:aws:s3:::acme-reports/*`. Grant only the second and listing fails; grant only the first and reading fails. Both errors are an undifferentiated `AccessDenied`.

<a id="1-3-quotas"></a>

### 1.3 Quotas, throttling and eventual consistency in the control plane

Every AWS API has a rate limit and every account has service quotas. Most quotas are adjustable through Service Quotas or a support ticket; some are hard. The two you will meet earliest are the number of VPCs per Region (5 by default), and Lambda concurrency (1,000 per Region by default, shared across every function in the account — which means one runaway function can starve all the others unless you set reserved concurrency).

Control planes are also frequently **eventually consistent**, even where data planes are not. Create an IAM role and immediately assume it and you may get a failure; create a security group and immediately reference it and you may get "does not exist". This is not a bug and it is not going to be fixed — it is a consequence of a globally distributed control plane. Infrastructure tools handle it with retries; your own automation must too.

> **Tip**
>
> **Read the error code, not the message.** AWS error codes are stable, documented, and classifiable: `ThrottlingException` and `ProvisionedThroughputExceededException` mean back off and retry; `AccessDeniedException` means never retry; `ValidationException` means fix the request; `ServiceUnavailable` and `InternalServerError` mean retry. Every SDK exposes the code separately from the message. Matching on message strings is how retry logic silently breaks after a service update.

<a id="2-global-infrastructure"></a>

## 2. Global Infrastructure

> **In plain words**
>
> **In plain English**
>
> Where AWS physically is. A **Region** is a city you choose to run in; an **Availability Zone** is one of several independent buildings in that city; **edge locations** are hundreds of small outposts near users that only do caching and DNS. Picking the right level is what decides your latency, your resilience and a surprising share of your bill.

AWS's physical layout is a three-level hierarchy plus an edge network, and every availability and latency decision you make is really a decision about which level to operate at.

> **Interactive animation:** `regions-az` — rendered by the page script in the HTML version.

<a id="2-1-regions"></a>

### 2.1 Regions

A Region is a named geographic area (`us-east-1`, `eu-central-1`, `ap-southeast-2`) containing at least three Availability Zones. Regions are **isolated by design**: separate API endpoints, separate control planes, separate capacity pools, separate physical infrastructure. Data does not leave a Region unless you configure a mechanism that moves it — cross-Region replication, a global table, a backup copy.

Two Regions have properties worth knowing. `us-east-1` (N. Virginia) is the oldest and largest; it hosts the control planes of several global services, which is why an IAM change, a CloudFront distribution update, or a Route 53 record change involves `us-east-1` regardless of where you live. It is also where new services land first and where capacity constraints bite last. `us-west-2` (Oregon) is the usual second choice, being similarly complete and slightly cheaper for some services.

Choosing a Region comes down to four questions, in this order: **where are the users** (latency), **where must the data live** (regulation, data residency), **is the service available there** (new services roll out over months), and **what does it cost** (prices differ by 10–40% between Regions for the same instance).

<a id="2-2-azs"></a>

### 2.2 Availability Zones

An Availability Zone is one or more discrete datacentres with independent power, cooling and physical security, connected to the other AZs in the Region by dedicated, redundant, low-latency fibre. The design target is that a single event — a flood, a fire, a power failure, a transformer explosion — affects one AZ and no others. Inter-AZ latency is typically under two milliseconds, which is the number that makes synchronous replication practical.

The mapping between an AZ *name* and a physical AZ is randomised per account. Your `us-east-1a` and another account's `us-east-1a` are usually different datacentres, and AWS does this deliberately so that "the first one in the list" does not become everyone's default. The stable identifier is the **AZ ID** (`use1-az1`…), which *is* consistent across accounts and is what you must use when coordinating placement between accounts.

| Scope | Examples | What you must do about failure |
| --- | --- | --- |
| Zonal | EC2 instance, EBS volume, subnet, RDS instance, ElastiCache node | Run more than one, in different AZs, behind something that distributes |
| Regional | S3, DynamoDB, SQS, Lambda, ECS, KMS, ELB | Nothing — AWS already spreads it across AZs for you |
| Global | IAM, Route 53, CloudFront, WAF (for CloudFront), Organizations | Nothing, but notice the `us-east-1` control-plane dependency |

<a id="2-3-edge"></a>

### 2.3 The edge network, Local Zones and Outposts

Outside the Region hierarchy sits a much larger network of **edge locations** — over 600 points of presence, in far more cities than there are Regions. You do not run code on them in the general sense; they run CloudFront, Route 53, AWS Global Accelerator, AWS Shield, and the small edge compute runtimes (CloudFront Functions and Lambda@Edge). Their purpose is to terminate the user's connection close to them and carry the traffic onward over AWS's own backbone, which is faster and far more predictable than the public internet.

- **Local Zones** place compute, storage and networking in a metro area far from the parent Region, for single-digit-millisecond latency to that city — used for real-time gaming, media production and interactive workloads.
- **Wavelength Zones** do the same inside telecom providers' 5G networks.
- **Outposts** is AWS hardware installed in *your* datacentre, running the same APIs, for workloads that genuinely cannot leave the building.
- **Global Accelerator** gives you two static anycast IPs at the edge that route traffic over the AWS backbone to regional endpoints — the answer when you need a static IP *and* global routing *and* fast failover, which CloudFront and DNS cannot provide together.

> **Key idea**
>
> **The default architecture on AWS is multi-AZ, single-Region.** It handles the failure mode AWS actually experiences, costs almost nothing extra, and requires no application changes. Multi-Region is a different order of problem — data replication, conflict resolution, split-brain, doubled cost and doubled operational surface — and it should be driven by a stated RTO/RPO or a regulatory requirement, never by ambition.

<a id="3-accounts-and-organizations"></a>

## 3. Accounts, Organizations & Landing Zones

> **In plain words**
>
> **In plain English**
>
> An AWS **account** is a sealed box: its own resources, its own permissions, its own bill. Real companies do not use one giant account — they use many (dev, prod, security) so a mistake in one cannot spill into another. **Organizations** groups those accounts under one bill with company-wide rules nobody can override, and a **landing zone** is the ready-made starting layout for all of it.

An AWS **account** is the fundamental container: a namespace for resources, a boundary for IAM, a unit of billing, and — most importantly — the only truly hard isolation boundary AWS offers. Everything inside an account can potentially reach everything else inside it, subject to IAM. Nothing crosses an account boundary without an explicit grant on both sides. Multi-account is therefore not an enterprise nicety; it is the primary security control.

<a id="3-1-organizations"></a>

### 3.1 AWS Organizations

**Organizations** groups accounts into a tree: a management account at the root, **organizational units** (OUs) below it, and member accounts in the OUs. It gives you three things: consolidated billing (volume discounts and Savings Plans apply across the whole organisation), centralised account creation, and **service control policies**.

```text
Root
                ├── Security OU
                │ ├── log-archive (immutable CloudTrail + Config destination)
                │ └── security-tooling (GuardDuty, Security Hub, Detective admin)
                ├── Infrastructure OU
                │ ├── network (Transit Gateway, shared VPCs, Route 53 zones)
                │ └── shared-services (CI runners, artifact registries)
                ├── Workloads OU
                │ ├── Prod OU → payments-prod, web-prod, data-prod
                │ └── NonProd OU → payments-dev, web-dev, sandbox-alice
                └── Suspended OU (SCP denying everything, for accounts being closed)

                Management account: Organizations, billing. NO workloads. SCPs do not apply to it.
```

<a id="3-2-scps"></a>

### 3.2 Service control policies

An SCP looks like an IAM policy and behaves completely differently in one respect: **it never grants anything**. It sets the maximum set of permissions available to principals in an account. The effective permission is the intersection of the SCP and the identity policy, so an account with `AdministratorAccess` and an SCP denying `us-east-1` simply cannot use `us-east-1`. Two more properties matter: SCPs do *not* apply to the management account (a strong argument for keeping no workloads in it), and they do not apply to service-linked roles.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RegionFence",
      "Effect": "Deny",
      "NotAction": [
        "iam:*", "organizations:*", "route53:*", "cloudfront:*",
        "support:*", "sts:*", "budgets:*", "waf:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-central-1"] }
      }
    },
    {
      "Sid": "ProtectSecurityControls",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging", "cloudtrail:DeleteTrail",
        "guardduty:DeleteDetector", "config:DeleteConfigurationRecorder"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RequireImdsV2",
      "Effect": "Deny",
      "Action": "ec2:RunInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringNotEquals": { "ec2:MetadataHttpTokens": "required" }
      }
    }
  ]
}
```

> **Warning**
>
> The `NotAction` exclusion list in the region-fence policy is not optional decoration. Global services are addressed through `us-east-1`, so a naive `aws:RequestedRegion` deny will break IAM, Route 53, CloudFront and Support for the entire account. This particular SCP has locked more people out of their own organisations than any other.

<a id="3-3-landing-zone"></a>

### 3.3 Landing zones and Control Tower

A **landing zone** is the pre-built account structure a team starts from: OUs, SCPs, centralised CloudTrail and Config into a dedicated log-archive account, GuardDuty enabled organisation-wide, IAM Identity Center for human access, a network account owning the Transit Gateway, and a repeatable process for vending new accounts. **AWS Control Tower** builds and maintains one of these with guardrails you can extend; **Account Factory for Terraform** or a similar pipeline does the same if you prefer to own the code.

Three services make multi-account tolerable rather than tedious:

- **IAM Identity Center** — one login for humans, federated from your identity provider, granting time-limited role sessions in whichever accounts a user is entitled to. This is what replaces IAM users entirely.
- **Resource Access Manager (RAM)** — shares specific resources across accounts: subnets from a central network account, Transit Gateways, Route 53 Resolver rules, License Manager configurations. Sharing subnets means workload accounts get networking without each one owning a VPC.
- **Delegated administration** — lets a member account (not the management account) administer GuardDuty, Security Hub, Config and others organisation-wide, so the management account can stay locked down and unused.

> **Tip**
>
> **Start with four accounts even as a team of two:** management (billing only, no workloads), production, development, and log-archive. It costs nothing — accounts are free, you pay only for resources — and it means a mistake in development physically cannot reach production. Retrofitting this separation onto a single account with two years of resources in it is a genuinely large project.

<a id="4-iam-identities"></a>

## 4. IAM I — Identities, Principals & Credentials

> **In plain words**
>
> **In plain English**
>
> This section is about *who* is knocking on the door. A **user** is a permanent login with a password or long-lived keys. A **role** is a temporary badge that anyone trusted can borrow for a few hours — a person, an EC2 instance, a Lambda function, a build pipeline. Modern AWS uses roles for almost everything, because a badge that expires cannot leak for long.

IAM answers one question for every API call: *is this principal permitted to perform this action on this resource under these conditions?* Before the evaluation logic in the next section, you need the vocabulary of who can be asking.

<a id="4-1-principals"></a>

### 4.1 The kinds of principal

| Principal | Credentials | Lifetime | Use it for |
| --- | --- | --- | --- |
| Root user | Email + password (+ MFA) | Permanent | The handful of tasks that require it, then never again |
| IAM user | Password and/or access key | Permanent | Almost nothing, in a well-run account |
| IAM role | Issued by STS on assumption | 15 min – 12 h | Everything: workloads, humans via SSO, cross-account, CI |
| AWS service | A service-linked or passed role | Managed by the service | ECS pulling an image, Lambda writing logs, ASG launching |
| Federated identity | SAML assertion or OIDC token, exchanged at STS | Session-bound | Corporate SSO, GitHub Actions, Kubernetes service accounts |

The **root user** is the account's owner and cannot be restricted by IAM policies at all (it can be restricted by SCPs in a member account). The correct handling is: enable MFA, remove any access keys, set a long random password, store it in a physical safe or a break-glass vault, and use it only for the operations that genuinely require it — closing the account, changing the account's root email or support plan, restoring an IAM configuration that has locked everyone out, and a small number of others.

<a id="4-2-why-not-users"></a>

### 4.2 Why IAM users are the wrong default

An IAM user with an access key is a permanent credential sitting in a file. It does not expire. It does not know where it is being used from. When it leaks — into a git repository, a container image layer, a CI log, a screenshot, a Stack Overflow question — it stays valid until a human notices and revokes it. Public repositories are scanned continuously by attackers precisely because this is such a productive attack.

Every context in which you might reach for a user has a role-based alternative:

| Context | Use this instead |
| --- | --- |
| Human on a laptop | IAM Identity Center + `aws sso login` |
| EC2 instance | Instance profile (a role delivered via IMDSv2) |
| Lambda function | Execution role |
| ECS task | Task role (distinct from the execution role) |
| EKS pod | EKS Pod Identity, or IRSA (IAM Roles for Service Accounts) |
| GitHub Actions / GitLab CI | OIDC federation to a role, scoped by repository and branch |
| On-premises server | IAM Roles Anywhere, with an X.509 certificate |
| Third-party SaaS vendor | Cross-account role with an `ExternalId` condition |

> **Warning**
>
> **ECS has two roles and confusing them is a rite of passage.** The **execution role** belongs to the ECS agent and is used to pull the image from ECR, fetch secrets, and write logs — it acts *before* your container starts. The **task role** is what your application code receives when it calls AWS. If your container cannot start, look at the execution role; if your code gets `AccessDenied`, look at the task role.

<a id="4-3-metadata"></a>

### 4.3 Where credentials physically come from on an instance

An EC2 instance with an instance profile receives credentials from the **Instance Metadata Service** at the link-local address `169.254.169.254`. The SDKs query it automatically, cache the result, and refresh before expiry. You should never need to call it yourself, but knowing it exists explains a class of security incidents: a server-side request forgery vulnerability in your application can be used to fetch that URL and steal the role's credentials.

**IMDSv2** is the mitigation and should be mandatory. It requires a `PUT` to obtain a session token before any read, sets a low IP TTL so the response cannot be forwarded, and thereby defeats the simple SSRF-to-credentials pivot. Enforce it with an SCP as shown in section 3.

```bash
# IMDSv2: get a token first, then use it. This is what the SDKs do.
TOKEN=$(curl -sX PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Verify enforcement across the fleet - anything "optional" is a finding
aws ec2 describe-instances \
  --query 'Reservations[].Instances[?MetadataOptions.HttpTokens!=`required`].InstanceId' \
  --output text
```

<a id="5-iam-policies"></a>

## 5. IAM II — Policies & the Evaluation Engine

> **In plain words**
>
> **In plain English**
>
> Permissions on AWS are written as short JSON rules: *who* may do *what* to *which thing*, *under what conditions*. This section is the exact order AWS checks those rules in. Two facts carry most of it: nothing is allowed unless a rule allows it, and one explicit "deny" anywhere beats every allow. Learn the order once and you can debug any "Access Denied" on the platform.

This section is the single highest-value piece of AWS knowledge there is, because every access problem on the platform — and every access *control* you design — reduces to it. Run all four variants of the animation before reading on.

> **Interactive animation:** `iam-evaluation` — rendered by the page script in the HTML version.

<a id="5-1-policy-types"></a>

### 5.1 The seven policy types

| Type | Attached to | Can grant? | Purpose |
| --- | --- | --- | --- |
| Identity-based | User, group, role | Yes | What this principal may do |
| Resource-based | Bucket, key, queue, function, API | Yes | Who may touch this resource — including other accounts |
| Permissions boundary | User or role | No | The ceiling on what that identity may ever be granted |
| Service control policy | OU or account | No | The ceiling for the whole account |
| Resource control policy | OU or account | No | The ceiling on resource-based policies in the account |
| Session policy | Passed at `AssumeRole` | No | Narrow a session below the role's own permissions |
| VPC endpoint policy | An interface or gateway endpoint | No | What may be done *through* this endpoint |

<a id="5-2-evaluation"></a>

### 5.2 The evaluation order, precisely

1. **Deny sweep.** Any explicit `Deny` in *any* applicable policy ends the evaluation. Final.
2. **SCPs and RCPs.** If an Organizations policy does not allow the action, deny.
3. **Resource-based policy.** An `Allow` here can be sufficient on its own for same-account access to most services, and is *required* for cross-account access.
4. **Identity-based policy.** An `Allow` matching action, resource and conditions.
5. **Permissions boundary.** If present, it must also allow the action.
6. **Session policy.** If present, it must also allow the action.
7. Otherwise, **implicit deny**.

The rule to carry: **a request is allowed only if every applicable gate allows it and no gate denies it.** Permissions are an intersection. This is why an admin-level identity policy is powerless against an SCP, and why granting more permissions never fixes an explicit deny.

**Cross-account access requires two sides.** The resource's policy must allow the external principal, *and* the external principal's identity policy must allow the action. One without the other fails. This symmetry is deliberate: it means no other account can grant itself access to your resources, and you cannot accidentally grant access that the other account's administrator has not also approved.

<a id="5-3-conditions"></a>

### 5.3 Conditions, where policies get interesting

Without conditions a policy is a blunt on/off switch. With them you can express real security requirements. The condition keys worth memorising:

| Key | Meaning | Typical use |
| --- | --- | --- |
| `aws:PrincipalOrgID` | The caller's AWS Organization | Restrict a bucket to your own organisation without listing accounts |
| `aws:SourceVpce` | The VPC endpoint the request came through | Force S3 access to stay on the private network |
| `aws:SourceIp` | Public IP of the caller | Office-only administration (breaks for VPC-endpoint traffic) |
| `aws:MultiFactorAuthPresent` | MFA used for this session | Require MFA for deletes and IAM changes |
| `aws:RequestedRegion` | Target Region of the call | Region fencing in SCPs |
| `aws:PrincipalTag/*`, `aws:ResourceTag/*` | Tags on the caller or the resource | Attribute-based access control |
| `aws:SourceArn`, `aws:SourceAccount` | The resource on whose behalf a service is calling | Confused-deputy protection in service trust policies |
| `s3:x-amz-server-side-encryption` | Encryption header on a PUT | Reject unencrypted uploads |

**Attribute-based access control** deserves a moment, because it is how you avoid a policy per team. Tag the role with `team=analytics`, tag the resources with `team=analytics`, and write one policy that says "allow if the tags match". Adding a new team then requires no policy change at all.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AbacOnlyYourTeamsResources",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::acme-data/*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/team": "${aws:ResourceTag/team}"
        }
      }
    },
    {
      "Sid": "DenyAnythingNotOnTheOrgNetwork",
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::acme-data", "arn:aws:s3:::acme-data/*"],
      "Condition": {
        "StringNotEquals": { "aws:SourceVpce": "vpce-0abc123def456" },
        "Bool": { "aws:ViaAWSService": "false" }
      }
    }
  ]
}
```

> **Warning**
>
> **Condition operators have a subtlety that produces silent holes.** If the condition key is *absent* from a request, a `StringNotEquals` deny will not match — the statement simply does not apply, and the request sails through. That is why the deny above adds `aws:ViaAWSService`: without it you also block AWS services acting on your behalf. When writing a deny based on a condition key, always ask "what happens when this key is not present at all?" and add a `Null` check if the answer is wrong.

<a id="5-4-debugging"></a>

### 5.4 A procedure for debugging AccessDenied

1. `aws sts get-caller-identity` — confirm which principal is actually making the call. A surprising share of these end here.
2. Read the error carefully. AWS increasingly names the cause: "with an explicit deny in a service control policy", "with an explicit deny in a resource-based policy", "because no identity-based policy allows".
3. Run `iam simulate-principal-policy` for the exact action and resource ARN. It reports the decision and the matching statements.
4. If the simulator says allow but reality says deny, the cause is outside identity policies: SCP, resource policy, permissions boundary, VPC endpoint policy, or a KMS key policy.
5. Look in CloudTrail for the event. The `errorCode` and `errorMessage` are recorded, along with the exact principal ARN and the request parameters.
6. Check the ARN granularity — bucket versus object, table versus index, function versus alias.
7. Check whether the target is encrypted with a KMS key whose *key policy* does not include your principal. An `AccessDenied` from KMS reads exactly like one from S3.

> **Interview**
>
> **A very common interview question:** "You have `AdministratorAccess` and still get `AccessDenied`. Name three causes." Good answers: an explicit `Deny` in an SCP; a resource policy that denies (an S3 bucket restricted to a VPC endpoint); a permissions boundary on the role; a KMS key policy that omits you; or an operation that only the root user can perform. Naming the evaluation order while you answer is what turns a correct answer into an impressive one.

<a id="6-iam-roles"></a>

## 6. IAM III — Roles, Federation & Identity Center

> **In plain words**
>
> **In plain English**
>
> How you actually get that temporary badge. A role carries a short note saying who is allowed to borrow it, and **STS** is the desk that hands out the badge for a few hours. **Federation** means your existing company login (Okta, Entra ID, Google) or your CI system can borrow one too — so nobody needs a permanent AWS password, and access disappears the moment someone leaves the company.

A role is a permission set with a **trust policy** instead of credentials. The trust policy is a resource-based policy on the role that answers "who may assume me?" — and it is evaluated independently of the assumer's own permissions. Both sides must agree.

> **Interactive animation:** `assume-role` — rendered by the page script in the HTML version.

<a id="6-1-trust-policies"></a>

### 6.1 Trust policies by scenario

```javascript
// An AWS service assuming the role (Lambda execution role)
{ "Effect": "Allow",
  "Principal": { "Service": "lambda.amazonaws.com" },
  "Action": "sts:AssumeRole" }

// A third-party vendor. The ExternalId prevents the confused-deputy problem:
// without it, the vendor could be tricked into using its own role to access
// YOUR account on behalf of a different customer.
{ "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::999999999999:root" },
  "Action": "sts:AssumeRole",
  "Condition": { "StringEquals": { "sts:ExternalId": "acme-9f3c1a77-unique" } } }

// GitHub Actions via OIDC - no stored credentials at all.
// The sub condition is the security boundary: scope it to repo AND ref,
// or any workflow in any branch of that repo can deploy to production.
{ "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:acme/api:ref:refs/heads/main"
    } } }

// Cross-account, restricted to one role and requiring MFA
{ "Effect": "Allow",
  "Principal": { "AWS": "arn:aws:iam::111111111111:role/deployer" },
  "Action": "sts:AssumeRole",
  "Condition": { "Bool": { "aws:MultiFactorAuthPresent": "true" } } }
```

> **Warning**
>
> **`"Principal": {"AWS": "arn:aws:iam::111111111111:root"}` does not mean the root user.** It means "delegate to account 111111111111", allowing that account's administrators to grant the permission to any of their principals. That is often what you want for a partner account and rarely what you want inside your own organisation, where naming the specific role ARN is tighter and just as easy.

<a id="6-2-sts"></a>

### 6.2 The STS operations

| Operation | Caller | Max duration |
| --- | --- | --- |
| `AssumeRole` | An existing AWS principal | Up to the role's max session duration (1–12 h) |
| `AssumeRoleWithWebIdentity` | Holder of an OIDC token (GitHub, Cognito, EKS) | Up to 12 h |
| `AssumeRoleWithSAML` | Holder of a SAML assertion (ADFS, Okta) | Up to 12 h |
| `GetSessionToken` | An IAM user adding MFA to a session | Up to 36 h |
| `GetFederationToken` | Creating a restricted session for a custom broker | Up to 36 h |

**Role chaining** — assuming role A, then using A to assume role B — works, but caps the session at one hour regardless of the roles' configured maximum. This catches long CI pipelines that chain roles and then fail an hour in with an expired token, and the failure is usually blamed on the wrong thing.

<a id="6-3-identity-center"></a>

### 6.3 IAM Identity Center

**IAM Identity Center** (formerly AWS SSO) is the answer for human access across a multi-account organisation. You connect an identity source (its own directory, Active Directory, or an external IdP like Okta or Entra ID), define **permission sets** — which are templates that become IAM roles in each account — and assign groups to (account, permission set) pairs. Users get a portal listing the accounts and roles available to them, and `aws sso login` gives the CLI a browser-based login with short-lived credentials.

```bash
# One-time configuration, then a browser login whenever the session expires
aws configure sso
# SSO start URL: https://d-1234567890.awsapps.com/start
# SSO region: eu-west-1
# then pick account + role, and name the profile

aws sso login --profile prod-admin
aws s3 ls --profile prod-admin

# ~/.aws/config - note there is no secret anywhere on this machine
# [profile prod-admin]
# sso_session = acme
# sso_account_id = 123456789012
# sso_role_name = AdministratorAccess
# region = eu-west-1
```

> **Key idea**
>
> **The end state to aim for: zero IAM users in the entire organisation.** Humans authenticate through Identity Center, workloads receive roles from their runtime, CI federates via OIDC, and external partners use cross-account roles with an `ExternalId`. Every credential in the system then has an expiry, which converts the whole class of "leaked key" incidents into a time-boxed problem.

<a id="7-clients-and-credentials"></a>

## 7. Talking to AWS — CLI, SDKs & the Credential Chain

> **In plain words**
>
> **In plain English**
>
> When you run an AWS command, something has to decide *which* credentials to use. Every SDK looks in the same places in the same fixed order: environment variables first, then your config file, then the role attached to the machine. This one list explains nearly every "it works on my laptop but not on the server" mystery.

Every SDK resolves credentials through the same ordered **default credential provider chain**. Knowing the order explains most "it works on my machine" problems, because the first source that yields credentials wins and the later ones are never consulted.

1. Explicit parameters passed to the client constructor in code
2. Environment variables — `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
3. The shared config and credentials files (`~/.aws/config`, `~/.aws/credentials`), selected by `AWS_PROFILE`
4. SSO cached credentials, or a `credential_process` command
5. Web identity token (`AWS_WEB_IDENTITY_TOKEN_FILE`) — this is how EKS IRSA and GitHub Actions work
6. ECS or EKS container credentials, via `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`
7. EC2 instance metadata (IMDSv2)

> **Warning**
>
> **A stale `AWS_ACCESS_KEY_ID` in your shell profile beats everything below it.** That is the whole explanation for "my SSO login succeeded but the CLI still uses the old account". `aws sts get-caller-identity` is the first command to run for any unexplained permission behaviour, and `env | grep AWS_` is the second.

<a id="7-1-sdk-behaviour"></a>

### 7.1 SDK behaviour worth configuring

**Clients are expensive to build and cheap to reuse**

```python
import boto3
from botocore.config import Config

# One client, module scope, reused for the process lifetime.
# Creating a client per request is the most common boto3 performance bug:
# it re-resolves credentials and re-parses the service model each time.
cfg = Config(
    region_name="eu-west-1",
    retries={"max_attempts": 5, "mode": "adaptive"},  # backoff + client-side rate limiting
    connect_timeout=3,
    read_timeout=10,
    max_pool_connections=50,      # raise for concurrent workloads
    user_agent_extra="acme-api/1.4.2",
)
s3 = boto3.client("s3", config=cfg)

# Paginators, not manual NextToken loops. Every List* API is paginated,
# and code that ignores that silently processes only the first page.
for page in s3.get_paginator("list_objects_v2").paginate(
    Bucket="acme-reports", Prefix="2026/"
):
    for obj in page.get("Contents", []):
        print(obj["Key"], obj["Size"])

# Waiters, not sleep loops
s3.get_waiter("object_exists").wait(Bucket="acme-reports", Key="2026/q1.csv")
```

```javascript
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { paginateListObjectsV2 } from "@aws-sdk/client-s3";

// v3 is modular: import only the commands you use, so the bundle stays small.
const s3 = new S3Client({
  region: "eu-west-1",
  maxAttempts: 5,
  requestHandler: { connectionTimeout: 3000, requestTimeout: 10000 },
});

for await (const page of paginateListObjectsV2(
  { client: s3 },
  { Bucket: "acme-reports", Prefix: "2026/" }
)) {
  for (const obj of page.Contents ?? []) console.log(obj.Key, obj.Size);
}
```

```bash
# --query is JMESPath and runs client-side; --filters runs server-side.
# For large result sets, filter on the server or you pay to transfer it all.
aws ec2 describe-instances \
  --filters Name=tag:env,Values=prod Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].{Id:InstanceId,Type:InstanceType,AZ:Placement.AvailabilityZone}' \
  --output table

# assume a role for a single command without touching your profile
eval $(aws sts assume-role --role-arn arn:aws:iam::123456789012:role/read-only \
  --role-session-name debug --query 'Credentials' --output json | \
  jq -r '"export AWS_ACCESS_KEY_ID=\(.AccessKeyId)
          export AWS_SECRET_ACCESS_KEY=\(.SecretAccessKey)
          export AWS_SESSION_TOKEN=\(.SessionToken)"')

# or, far better, define it once in ~/.aws/config and let the CLI do it:
# [profile prod-ro]
# role_arn = arn:aws:iam::123456789012:role/read-only
# source_profile = default
# duration_seconds = 3600
```

> **Tip**
>
> Three CLI habits worth forming. Use `--dry-run` on EC2 mutations to check permissions without acting. Use `--no-cli-pager` (or set `AWS_PAGER=""`) so output pipes cleanly in scripts. And prefer `--filters` over `--query` when both can express what you want, because filters are applied by the service and queries are applied after everything has been transferred to you.

<a id="7-2-retries"></a>

### 7.2 Retries, and the storm they can cause

Every SDK retries automatically, and the algorithm it uses is worth understanding because you will need to reimplement it for calls between *your own* services, where nobody has configured it for you. Run all three variants below.

> **Interactive animation:** `retry-backoff` — rendered by the page script in the HTML version.

boto3 offers three retry modes. `legacy` is the old default with few attempts; `standard` uses exponential backoff with full jitter and a consistent set of retryable error codes across services; `adaptive` adds a client-side rate limiter that slows the whole client down when it observes throttling, which is the right choice for bulk workloads that would otherwise keep a service saturated. The JavaScript SDK v3 uses the standard strategy by default and exposes `maxAttempts` and a `retryStrategy`.

Two rules cover the rest. **Classify before retrying:** throttling, 5xx, connection resets and timeouts are retryable; `AccessDenied`, `ValidationException`, `404` and conditional-check failures never are, and retrying them just burns your budget. **Retry at one layer only**, with a total time budget — three retries at each of five layers is 243 requests arriving at the service that is already struggling.

<a id="unit-2"></a>

## Unit 2 — Networking

Building the private network your resources live in, and connecting it safely to everything else.

<a id="8-vpc-fundamentals"></a>

## 8. VPC Fundamentals — CIDR, Subnets & Routes

> **In plain words**
>
> **In plain English**
>
> A VPC is your own private network inside AWS. You pick a block of IP addresses for it, carve that block into **subnets** (one per building, so per Availability Zone), and give each subnet a **route table** — a short list of "traffic for here goes there". A subnet is "public" purely because its route table points at the internet gateway; there is no other switch.

A **Virtual Private Cloud** is a software-defined network inside a Region. It is not a virtual switch and there is no real router — the whole thing is implemented in the hypervisor and the network fabric, which is why a route table change takes effect instantly across thousands of instances and why there is no device to run out of capacity. What you configure is a set of declarations that the fabric enforces.

> **Interactive animation:** `vpc-anatomy` — rendered by the page script in the HTML version.

<a id="8-1-addressing"></a>

### 8.1 Addressing

A VPC has a primary IPv4 CIDR block between `/16` (65,536 addresses) and `/28` (16). You may add secondary CIDRs later, but you cannot change or shrink the primary one, and you cannot renumber a subnet. Use RFC 1918 space — `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` — and plan the whole organisation's allocation before you create the second VPC, because **two VPCs with overlapping ranges can never be peered or attached to the same Transit Gateway**. IP Address Manager (IPAM) exists to do this allocation for you and is worth adopting early.

Every subnet loses five addresses: the network address, the VPC router, the DNS resolver (base + 2), one reserved for future use, and the broadcast address. A `/28` subnet therefore holds 11 usable addresses, not 16 — which matters when you are sizing subnets for Fargate tasks or Lambda ENIs, each of which consumes one.

```text
A conventional /16 laid out for three AZs, leaving room to grow:

                10.0.0.0/16 VPC
                ├── 10.0.0.0/20 (4091 usable) public AZ a ← ALB, NAT
                ├── 10.0.16.0/20 public AZ b
                ├── 10.0.32.0/20 public AZ c
                ├── 10.0.48.0/20 private-app AZ a ← ECS, EC2, Lambda ENIs
                ├── 10.0.64.0/20 private-app AZ b
                ├── 10.0.80.0/20 private-app AZ c
                ├── 10.0.96.0/24 private-db AZ a ← RDS, ElastiCache
                ├── 10.0.97.0/24 private-db AZ b
                ├── 10.0.98.0/24 private-db AZ c
                └── 10.0.128.0/17 reserved ← the space you will be glad of later
```

<a id="8-2-subnets"></a>

### 8.2 Subnets and what makes one public

A subnet lives in exactly one Availability Zone — that is the mechanism by which a regional VPC becomes tied to physical datacentres. There is no attribute called "public". A subnet is public if and only if its associated route table contains a route to an Internet Gateway. Change that route and the subnet's nature changes with it, silently and immediately.

An instance in a public subnet also needs a public IP to be reachable from the internet, because the IGW performs a one-to-one NAT between the private address and the public one. The instance itself never sees its public address; `ip addr` shows only the private one, which is why binding to a public IP inside the OS fails.

<a id="8-3-routing"></a>

### 8.3 Route tables

Each subnet is associated with exactly one route table (the VPC's main table by default). Routes are matched **most specific first**, so a `/24` beats a `/16` beats `0.0.0.0/0`. Every table contains an immutable `local` route for the VPC's CIDR, which is why anything in the VPC can address anything else in it without configuration.

| Target | Sends traffic to |
| --- | --- |
| `local` | Inside the VPC. Always present, cannot be deleted. |
| `igw-…` | The internet, with 1:1 NAT for instances that have a public IP |
| `nat-…` | A NAT Gateway, for outbound-only internet from private subnets |
| `vpce-…` (prefix list) | A gateway endpoint for S3 or DynamoDB |
| `pcx-…` | A peered VPC |
| `tgw-…` | A Transit Gateway attachment |
| `vgw-…` | A Virtual Private Gateway (VPN or Direct Connect) |
| `eni-…` | A specific network interface — used for appliance insertion |

<a id="8-4-dns-and-dhcp"></a>

### 8.4 DNS inside a VPC

Two VPC attributes control DNS and both must be on for most things to work. `enableDnsSupport` makes the Route 53 Resolver available at `VPC base + 2` and at `169.254.169.253`. `enableDnsHostnames` makes AWS assign DNS names to instances with public IPs. Interface VPC endpoints and private hosted zones both depend on these, and their absence produces failures that look like connectivity problems rather than name-resolution problems.

> **Tip**
>
> **Turn on VPC Flow Logs on day one, to S3 or CloudWatch Logs.** They record accepted and rejected flows with source, destination, ports, bytes and the security group decision. They are the only way to distinguish "the packet never arrived" from "the packet arrived and was rejected" — a distinction that decides whether you look at routing or at firewalls, and which cannot be reconstructed after the fact if logging was off.

<a id="9-vpc-connectivity"></a>

## 9. VPC Connectivity — Gateways, NAT & PrivateLink

> **In plain words**
>
> **In plain English**
>
> How your private network reaches the outside world. An **internet gateway** is the front door for public subnets. A **NAT gateway** lets private servers call out without anyone calling in — convenient, and one of the biggest line items on most AWS bills. **VPC endpoints** and **PrivateLink** are the cheaper, safer alternative: a private side-entrance straight to S3, DynamoDB or another team's service without touching the internet at all.

<a id="9-1-gateways"></a>

### 9.1 Internet and egress-only gateways

The **Internet Gateway** is attached to the VPC, is horizontally scaled and redundant by construction, has no bandwidth limit of its own and costs nothing. It performs one-to-one NAT between private and public IPv4 addresses. For IPv6, an **egress-only Internet Gateway** provides the outbound-only equivalent, since IPv6 addresses are globally routable and need no address translation.

<a id="9-2-nat"></a>

### 9.2 NAT Gateways, and why they dominate network bills

A **NAT Gateway** is a managed, AZ-scoped device that lets private subnets initiate outbound connections. It scales to 100 Gbps, supports 55,000 simultaneous connections per unique destination, and is zonal — meaning that for real availability you deploy one per AZ and route each AZ's private subnets to their local one. Doing otherwise both creates a single point of failure and generates cross-AZ transfer charges on every byte.

The cost has two components: roughly $0.045 per hour per gateway, and roughly $0.045 per gigabyte processed. Three gateways running all month is about $100 before a single byte moves; a workload pulling 20 TB a month from S3 through NAT adds roughly $900 that a free gateway endpoint would remove entirely.

<a id="9-3-endpoints"></a>

### 9.3 VPC endpoints and PrivateLink

|   | Gateway endpoint | Interface endpoint (PrivateLink) |
| --- | --- | --- |
| Services | S3 and DynamoDB only | Most AWS services, plus SaaS partners and your own services |
| Mechanism | A route-table entry to a prefix list | An ENI in your subnet with a private IP |
| DNS | Unchanged — routing does the work | Private DNS overrides the public name |
| Cost | Free | ~$0.01/hour per AZ + ~$0.01/GB |
| Cross-Region / on-prem | No | Yes, reachable over VPN, DX and peering |

**PrivateLink** generalises the interface endpoint: a service provider puts a Network Load Balancer behind an *endpoint service*, and consumers create interface endpoints to it in their own VPCs. Traffic flows over the AWS network, unidirectionally initiated by the consumer, with no VPC peering, no route exchange, and no requirement that the two VPCs have non-overlapping CIDRs. For exposing an internal API to another team, another account, or a customer, it is a much smaller security surface than peering.

```yaml
# Free, and removes most NAT charges for S3-heavy workloads
S3GatewayEndpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    VpcId: !Ref Vpc
    ServiceName: !Sub com.amazonaws.${AWS::Region}.s3
    VpcEndpointType: Gateway
    RouteTableIds: [!Ref PrivateRtA, !Ref PrivateRtB, !Ref PrivateRtC]
    PolicyDocument:                       # endpoint policies are a real control
      Statement:
        - Effect: Allow
          Principal: '*'
          Action: ['s3:GetObject', 's3:PutObject']
          Resource: 'arn:aws:s3:::acme-*/*'
          Condition:
            StringEquals:
              aws:PrincipalOrgID: o-abc123xyz   # nothing leaves the org

# Needed for private subnets with no NAT at all: SSM, ECR, logs, secrets
SsmEndpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    VpcId: !Ref Vpc
    ServiceName: !Sub com.amazonaws.${AWS::Region}.ssm
    VpcEndpointType: Interface
    PrivateDnsEnabled: true
    SubnetIds: [!Ref PrivateA, !Ref PrivateB, !Ref PrivateC]
    SecurityGroupIds: [!Ref EndpointSg]   # must allow 443 from the workload SG
```

> **Warning**
>
> **An interface endpoint has a security group and people forget it.** The endpoint ENI needs an inbound rule allowing TCP 443 from your workload's security group. Without it, every call to that service times out — and because private DNS has already redirected the service's hostname to the endpoint, the traffic does not fall back to the internet path. The symptom is a service that worked yesterday hanging today, right after someone "tightened up the network".

<a id="10-firewalls"></a>

## 10. Firewalls — Security Groups & Network ACLs

> **In plain words**
>
> **In plain English**
>
> Two layers of traffic filtering. A **security group** is a bouncer standing at each individual resource: it only lists what is allowed, and it remembers a conversation it let in, so replies come back automatically. A **network ACL** is a gate around a whole subnet that can also say "no", but has no memory, so you must allow both directions. In practice you use security groups and leave the ACLs alone.

> **Interactive animation:** `sg-vs-nacl` — rendered by the page script in the HTML version.

<a id="10-1-security-groups"></a>

### 10.1 Security groups

A security group attaches to an **elastic network interface**, not to a subnet or an instance — which is why two instances on the same subnet can have entirely different rules, and why an instance with two ENIs can have two different postures. Its properties:

- **Allow rules only.** There is no deny. Anything not explicitly allowed is dropped silently, which is why a missing rule presents as a hang rather than a refusal.
- **Stateful.** A permitted inbound connection's response is automatically permitted outbound, and vice versa. You almost never need to write outbound rules.
- **All rules are evaluated**, in no particular order, and the union applies. There is no first-match precedence.
- **Sources can be other security groups.** This is the idiom that makes AWS networking maintainable.
- Multiple groups can attach to one ENI; their rules are unioned.

```yaml
# The tiered pattern: each layer names the layer above it, never a CIDR.
# Instances can be replaced, scaled and re-IP'd and the rules keep working.
AlbSg:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: public entry point
    VpcId: !Ref Vpc
    SecurityGroupIngress:
      - {IpProtocol: tcp, FromPort: 443, ToPort: 443, CidrIp: 0.0.0.0/0}

AppSg:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: application tier
    VpcId: !Ref Vpc
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 8080
        ToPort: 8080
        SourceSecurityGroupId: !Ref AlbSg      # only the ALB, by identity

DbSg:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: database tier
    VpcId: !Ref Vpc
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        SourceSecurityGroupId: !Ref AppSg      # only the app, never 0.0.0.0/0
```

<a id="10-2-nacls"></a>

### 10.2 Network ACLs

A NACL is attached to a subnet, is **stateless**, supports both `ALLOW` and `DENY`, and evaluates numbered rules in ascending order with first-match-wins. Because it is stateless, return traffic must be permitted explicitly — typically the ephemeral port range `1024–65535` outbound for inbound connections, and the same inbound for outbound ones. Forgetting this is the classic NACL outage, and its signature is a connection that establishes and then times out.

The default NACL allows everything in both directions, which is the right setting for the vast majority of architectures. Reach for a NACL when you need something a security group structurally cannot express: blocking a specific IP range, or applying a subnet-wide deny during an incident.

<a id="10-3-other-firewalls"></a>

### 10.3 The other network controls

- **AWS Network Firewall** — a managed stateful firewall with Suricata-compatible rules, deployed into its own subnet and inserted into the route path. Used for deep packet inspection, domain-based egress filtering, and IPS signatures.
- **AWS WAF** — layer 7, attached to CloudFront, ALB, API Gateway, AppSync or Cognito. Managed rule groups for the OWASP top ten, rate-based rules, bot control, and geo-blocking.
- **Shield Standard** is automatic and free (L3/L4 DDoS); **Shield Advanced** adds L7 protection, a response team and billing protection for a substantial monthly fee.
- **Gateway Load Balancer** — inserts third-party virtual appliances transparently into the traffic path using GENEVE encapsulation.

<a id="11-connecting-networks"></a>

## 11. Connecting Networks — Peering, TGW, VPN & DX

> **In plain words**
>
> **In plain English**
>
> Joining separate networks together. **Peering** is a private cable between two VPCs — fine for a few, unmanageable for many. **Transit Gateway** is the hub everything plugs into instead. **VPN** connects your office over the public internet, cheap but variable. **Direct Connect** is a dedicated physical line to AWS: expensive, predictable, and what large companies use.

| Option | Connects | Topology | Watch out for |
| --- | --- | --- | --- |
| VPC peering | Two VPCs, any Region, any account | One-to-one, non-transitive | N² connections; no transit through a peer |
| Transit Gateway | Thousands of VPCs, VPNs, DX | Hub and spoke, with route tables for segmentation | Per-attachment hourly cost + per-GB data |
| PrivateLink | A consumer VPC to one service | Unidirectional, service-scoped | Exposes a service, not a network |
| Site-to-Site VPN | On-premises to AWS over the internet | IPsec, two tunnels per connection | ~1.25 Gbps per tunnel; internet-quality latency |
| Direct Connect | On-premises to AWS over private fibre | Dedicated 1/10/100 Gbps or hosted | Weeks to provision; single link is not redundant |
| Cloud WAN | Global, multi-Region, multi-account | Policy-driven global network | Overkill below a certain size |

**Peering is not transitive**, and this is the fact that drives most people to Transit Gateway. If A peers with B and B peers with C, A cannot reach C — you would need a third peering. Ten VPCs fully meshed is forty-five connections and forty-five sets of route-table entries to maintain. A Transit Gateway makes it ten attachments, and its route tables let you express policies like "every spoke may reach shared services, but spokes may not reach each other" — which is exactly the segmentation a full mesh cannot give you.

For hybrid connectivity, the production pattern is **Direct Connect with a VPN backup**. DX gives consistent latency and bandwidth but is a physical circuit that can be cut; the VPN costs little and takes over via BGP when DX drops. A single DX circuit with no backup is a single point of failure that takes weeks to replace.

> **Key idea**
>
> **Design the address plan before the connectivity.** Every one of these options fails identically when CIDRs overlap, and the fix is renumbering, which means downtime. Allocate non-overlapping ranges per account and per Region from a central plan, and use IPAM to enforce it. This is the cheapest hour of architecture you will ever spend.

<a id="unit-3"></a>

## Unit 3 — Compute, Load Balancing & Storage

Running servers that scale, spreading traffic across them, and storing objects and files durably.

<a id="12-ec2"></a>

## 12. EC2 — Instances, Storage & Purchase Options

> **In plain words**
>
> **In plain English**
>
> EC2 is renting a computer by the second. The odd names like `m7g.large` are just "what it is good at, which generation, how big". **EBS** is a virtual hard disk you attach to it that survives a reboot. And the same machine has several prices: pay as you go, commit for a year and save a third, or take AWS's spare capacity at a large discount on the condition it can be taken back with two minutes' notice.

<a id="12-1-families"></a>

### 12.1 Reading an instance type

```text
m 7 g d n . xlarge
                │ │ │ │ │ └── size: nano→micro→small→medium→large→xlarge→2xl…48xl
                │ │ │ │ └──────── n = network optimised
                │ │ │ └────────── d = local NVMe instance store
                │ │ └──────────── g = AWS Graviton (ARM64) · i = Intel · a = AMD
                │ └────────────── generation (higher = newer, faster, usually cheaper per unit)
                └──────────────── family:
                t burstable, CPU credits m general purpose
                c compute optimised r memory optimised
                x/z extra memory i/d storage optimised
                p/g/inf/trn GPU and ML accelerators
```

**Graviton** instances (the `g` suffix) are AWS's own ARM64 processors. They are typically 20% cheaper and 20–40% faster per dollar than the equivalent x86 instance. For anything running an interpreted language, a JVM, or a container built from a multi-arch base image, the migration is usually one line of a Dockerfile or one AMI change. It is the single highest-value, lowest-effort cost optimisation available on EC2.

**T-family burstable** instances accrue CPU credits while idle and spend them when busy. They are excellent for low-average, spiky workloads and a trap for sustained ones: when credits run out the instance is throttled to its baseline (as little as 5% of a vCPU for a `t3.micro`), or, in `unlimited` mode, silently billed for surplus credits. A production service pinned at 100% CPU on a T instance is either mysteriously slow or mysteriously expensive, and the CloudWatch metric to check is `CPUCreditBalance`.

<a id="12-2-storage"></a>

### 12.2 EBS and instance store

| Type | Performance | Use for |
| --- | --- | --- |
| `gp3` | 3,000 IOPS and 125 MB/s baseline, provisioned independently of size | The default for everything. Cheaper than `gp2` and more predictable. |
| `gp2` | 3 IOPS per GB, so performance is tied to size | Legacy. Migrate to `gp3`; it is a live modification. |
| `io2` Block Express | Up to 256,000 IOPS, 99.999% durability | Large transactional databases needing guaranteed IOPS |
| `st1` / `sc1` | Throughput-optimised / cold HDD | Big sequential reads, log processing, infrequent access |
| Instance store | Local NVMe, the fastest available | Scratch, caches, shuffle space. **Lost on stop or terminate.** |

EBS volumes are **zonal**: a volume in `us-east-1a` can only attach to an instance in `us-east-1a`. Snapshots are stored in S3, are incremental, and are regional — which is how you move a volume between AZs or Regions. EBS Multi-Attach allows one `io2` volume to attach to several instances, but only with a cluster-aware filesystem; mounting ext4 twice will corrupt it.

<a id="12-3-purchasing"></a>

### 12.3 Purchase options

> **Interactive animation:** `pricing-models` — rendered by the page script in the HTML version.

**Spot** deserves more use than it gets. The interruption notice is two minutes, delivered through instance metadata and as an EventBridge event, which is enough time to drain a load balancer target, checkpoint a job, or requeue a message. Combine it with an Auto Scaling group using multiple instance types and a capacity-optimised allocation strategy, and interruptions become rare and harmless. Workloads that suit it: CI runners, batch and ETL, rendering, ML training with checkpointing, and stateless web tiers where a mixed on-demand/Spot fleet keeps a guaranteed baseline.

<a id="12-4-operating"></a>

### 12.4 Operating instances without SSH

The modern pattern removes SSH entirely. **Systems Manager Session Manager** gives you a shell through an outbound-only connection from the SSM agent — no bastion host, no open port 22, no key pairs to distribute or rotate, and every session logged to CloudTrail and optionally recorded to S3. It works in fully private subnets given SSM interface endpoints. Alongside it, **Run Command** executes scripts across a fleet, **Patch Manager** handles OS patching on a schedule, and **Parameter Store** holds configuration.

```bash
# a shell on a private instance with no bastion and no inbound rules
aws ssm start-session --target i-0abc123def456

# port-forward a private database to localhost, through the instance
aws ssm start-session --target i-0abc123def456 \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters '{"host":["prod-pg.abc.eu-west-1.rds.amazonaws.com"],
                 "portNumber":["5432"],"localPortNumber":["5432"]}'

# why is an instance not managed by SSM? Almost always one of these three.
aws ssm describe-instance-information \
  --query 'InstanceInformationList[].{Id:InstanceId,Ping:PingStatus,Agent:AgentVersion}'
# 1. no AmazonSSMManagedInstanceCore in the instance profile
# 2. no route to the SSM endpoints (no NAT and no interface endpoints)
# 3. the agent is not installed or not running
```

<a id="13-auto-scaling"></a>

## 13. Auto Scaling & Launch Templates

> **In plain words**
>
> **In plain English**
>
> Instead of guessing how many servers you need, you write down a recipe for one server and a target such as "keep average CPU near 50%". AWS then adds machines when it gets busy, removes them when it goes quiet, and silently replaces any that stop answering health checks. It is also how you roll out a new version without downtime.

> **Interactive animation:** `autoscaling` — rendered by the page script in the HTML version.

An **Auto Scaling group** maintains a desired number of instances between a minimum and a maximum, replaces unhealthy ones, spreads them across the subnets you give it, and adjusts the desired count according to scaling policies. A **launch template** describes what to launch: AMI, instance type, key pair, security groups, IAM instance profile, user data, block device mapping. Templates are versioned, which is what makes an instance refresh a controlled operation.

<a id="13-1-policies"></a>

### 13.1 Scaling policy types

| Policy | You specify | When to use it |
| --- | --- | --- |
| Target tracking | A metric and a target value | The default. CPU at 50%, or requests-per-target at 1,000. |
| Step scaling | Alarm thresholds and instance counts per band | When the response should be non-linear |
| Simple scaling | One alarm, one adjustment, a cooldown | Legacy; step scaling supersedes it |
| Scheduled | A cron expression and a capacity | Known patterns: business hours, a Monday batch, a sale |
| Predictive | Nothing — it learns from history | Daily or weekly cycles, warming capacity *before* the peak |

The metric matters more than the policy. CPU is a poor proxy for load on an I/O-bound service; `ALBRequestCountPerTarget` is usually far better, because it scales on the thing that actually arrives rather than on a symptom. For queue-driven workers, scale on the queue's *backlog per instance* — approximate number of messages divided by running instances — which is the metric that keeps drain time constant as load changes.

<a id="13-2-lifecycle"></a>

### 13.2 Health checks, lifecycle hooks and instance refresh

By default an ASG uses EC2 status checks, which only tell you the hypervisor thinks the instance is alive. Switching the health-check type to `ELB` makes the group defer to the load balancer's application-level check, so a process that has crashed but left the instance running is replaced. Set the **health check grace period** to slightly more than your boot time, or the group will kill instances while they are still starting and loop forever.

**Lifecycle hooks** pause an instance in `Pending:Wait` or `Terminating:Wait` so you can run something — register with a config system, warm a cache, drain connections, upload final logs. The instance stays paused until you call `CompleteLifecycleAction` or the timeout expires, which makes an instance stuck in `Pending:Wait` a sign that your hook handler failed silently.

**Instance refresh** rolls the whole group onto a new launch template version with a minimum healthy percentage and optional checkpoints — a rolling deployment for AMI changes, with automatic rollback if the new version fails to become healthy.

> **Warning**
>
> **Two settings that quietly break scaling.** A health check that requests `/` instead of an endpoint that tests dependencies will keep a broken application in service indefinitely. And any local state — sessions on disk, uploaded files, a cache the app assumes is warm — means scale-in destroys data. Auto Scaling assumes instances are interchangeable; if yours are not, it will still scale, it will just also lose things.

<a id="14-load-balancing"></a>

## 14. Elastic Load Balancing

> **In plain words**
>
> **In plain English**
>
> A load balancer is the receptionist in front of your servers: one address for the world, and it hands each request to a server that is currently healthy. The **ALB** understands web traffic, so it can route by URL path or hostname and terminate HTTPS. The **NLB** does not look inside the traffic at all and is simply very fast. It also quietly hides failures — a dead server just stops receiving requests.

> **Interactive animation:** `alb-routing` — rendered by the page script in the HTML version.

|   | ALB | NLB | GWLB |
| --- | --- | --- | --- |
| Layer | 7 — HTTP/HTTPS, gRPC, WebSocket | 4 — TCP, UDP, TLS | 3 — GENEVE encapsulation |
| Routes on | Path, host, header, query, method, source IP | Port only | Everything, transparently |
| Latency | Milliseconds | Microseconds | Appliance-dependent |
| Static IP | No — a DNS name that changes | Yes, one per AZ; supports Elastic IPs | N/A |
| Preserves client IP | In `X-Forwarded-For` | Yes, at the TCP level | Yes |
| Extras | WAF, Cognito auth, OIDC auth, redirects, fixed responses | Extreme throughput, PrivateLink endpoint service | Inserts third-party firewalls |

<a id="14-1-target-groups"></a>

### 14.1 Target groups and health checks

A **target group** is a set of targets (instances, IPs, Lambda functions or another ALB) plus a health-check configuration and an algorithm. Listener rules route to target groups; the target group decides which member gets the request. Round robin is the default; **least outstanding requests** is usually better when request durations vary widely, because it stops a slow request from queueing behind another slow one on the same target.

Health checks are the control loop. Configure the path to exercise the dependencies that matter — a check that returns `200` without touching the database will happily keep a database-less instance in rotation. Set the **deregistration delay** (the drain time) to just above your slowest normal request: too low and you cut off in-flight work on every deploy, too high (the default is 300 s) and every deployment crawls.

<a id="14-2-connection-behaviour"></a>

### 14.2 Connection behaviour and the 5xx you will meet

| Symptom | Usual cause |
| --- | --- |
| 502 Bad Gateway | The target closed the connection, crashed, or returned a malformed response |
| 503 Service Unavailable | No healthy targets registered in the target group |
| 504 Gateway Timeout | The target did not respond within the idle timeout (60 s default) |
| Intermittent 502 under low load | The target's keep-alive timeout is *shorter* than the ALB's idle timeout, so the ALB reuses a connection the target has just closed |

> **Tip**
>
> **Set your application's keep-alive timeout higher than the load balancer's idle timeout** — 65 seconds against the ALB's default 60 is the conventional pairing. The race in the last row of that table produces rare, unreproducible 502s that survive every attempt to reproduce them locally, and this one-line change fixes it.

> **Key idea**
>
> **Cross-zone load balancing is on by default for ALB and off by default for NLB.** With it off, each AZ's load balancer node distributes only to targets in its own AZ — so an uneven number of targets per AZ produces uneven load. With it on for an NLB you pay cross-AZ data transfer charges. Both defaults are defensible and both surprise people; know which one you have.

<a id="15-s3"></a>

## 15. Amazon S3 in Depth

> **In plain words**
>
> **In plain English**
>
> S3 stores whole files, called objects, in buckets, and keeps copies of each one across several buildings so losing data is effectively impossible. There are no real folders — the slashes in a name are just part of the name. It never runs out of space, it gets faster the more you spread your names out, and you can even run SQL over data sitting in it without loading it anywhere first.

> **Interactive animation:** `s3-durability` — rendered by the page script in the HTML version.

<a id="15-1-model"></a>

### 15.1 The object model

A bucket is a globally unique name in one Region. An object is a key (up to 1,024 UTF-8 bytes), a value (up to 5 TB), metadata, and a version ID if versioning is on. There are **no directories**; the console's folder view is synthesised from key prefixes using the delimiter parameter of `ListObjectsV2`. There is no rename — a rename is a copy followed by a delete, which for a large object is a server-side copy you pay for. And there is no append or partial write: `PutObject` replaces the whole object atomically.

Since December 2020, S3 provides **strong read-after-write consistency** for all operations, including list. Any advice you find about "S3 is eventually consistent" predates that change and can be discarded — along with the workarounds (like S3Guard) that used to be necessary.

<a id="15-2-performance"></a>

### 15.2 Performance

S3 scales to at least **3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix**, and the number of prefixes is unlimited. Prefix here means the portion of the key up to the last delimiter, and partitions split automatically as load grows. Randomising the start of a key (the old advice) is no longer necessary; simply using multiple prefixes gives you linear scaling.

- **Multipart upload** is required above 5 GB and recommended above about 100 MB. Parts upload in parallel and retry individually, so a network blip costs one part rather than the whole file.
- **Byte-range GETs** let you fetch parts of a large object in parallel, and let columnar formats read only the columns they need.
- **S3 Transfer Acceleration** routes uploads through the nearest edge location and over the AWS backbone — worth it for cross-continent uploads, pointless for same-Region ones.
- **S3 Express One Zone** is a single-AZ, single-digit-millisecond storage class for latency-critical workloads — faster and dearer, and with no cross-AZ durability.

> **Warning**
>
> **Set a lifecycle rule to abort incomplete multipart uploads after seven days on every bucket.** Failed uploads leave parts that you are billed for and that do not appear in the object listing. On a bucket with a flaky upload path this can accumulate to terabytes of completely invisible storage, and it is a recurring cause of "our S3 bill does not match the data we can see".

<a id="15-3-querying"></a>

### 15.3 Querying data in place

Three ways to avoid downloading data to process it. **S3 Select** runs a simple SQL projection and filter on a single object server-side. **Athena** runs full SQL across many objects using a Glue Data Catalog schema, charging per terabyte scanned — which makes partitioning and columnar formats a cost decision, not just a speed one. **S3 Object Lambda** puts a function in the response path so a single stored object can be transformed per requester — redacting personal data for one consumer and not another, for instance.

> **Tip**
>
> **Parquet plus partitioning is the single biggest Athena cost lever.** A 1 TB CSV scan costs about $5; the same data as partitioned Parquet, with a query touching one day and three columns, may scan 2 GB and cost a cent. The conversion is one Glue job. Cost and latency improve together, by two orders of magnitude, which is rare enough to be worth remembering.

<a id="16-s3-data-management"></a>

## 16. S3 Security, Versioning, Lifecycle & Replication

> **In plain words**
>
> **In plain English**
>
> Four housekeeping jobs for your buckets: deciding who can read them (the answer to "how do S3 leaks happen" is always here), keeping old copies so a bad overwrite or deletion can be undone, automatically shuffling files nobody has touched in months into cheaper storage, and copying a bucket to another Region for compliance or disaster recovery.

<a id="16-1-access"></a>

### 16.1 The layers of access control

1. **Block Public Access** — an account-level and bucket-level override that defeats any policy or ACL granting public access. Leave it on at the account level. Every "company exposes data in S3 bucket" headline is this setting turned off.
2. **Bucket policy** — the resource-based policy; the primary tool. Use it to require TLS, require encryption headers, restrict to an organisation or a VPC endpoint, and grant cross-account access.
3. **IAM identity policies** — what your own principals may do.
4. **ACLs** — the legacy mechanism, disabled by default on new buckets via Object Ownership. Do not enable them.
5. **Access Points** — named endpoints with their own policies, so a shared bucket can present a narrow view per team without one enormous bucket policy.
6. **Presigned URLs** — time-limited delegated access using the signer's permissions.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::acme-data", "arn:aws:s3:::acme-data/*"],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    },
    {
      "Sid": "RequireKmsOnUpload",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::acme-data/*",
      "Condition": {
        "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" }
      }
    },
    {
      "Sid": "OnlyMyOrganisation",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::acme-data", "arn:aws:s3:::acme-data/*"],
      "Condition": {
        "StringNotEquals": { "aws:PrincipalOrgID": "o-abc123xyz" }
      }
    }
  ]
}
```

<a id="16-2-versioning"></a>

### 16.2 Versioning, delete markers and Object Lock

With versioning on, a `PUT` to an existing key creates a new version and keeps the old one; a `DELETE` without a version ID creates a **delete marker** that hides the object without removing it. Recovery is deleting the delete marker. This is the only protection against an application overwriting or deleting data, and it should be on for anything you would miss.

Two stronger controls exist. **MFA Delete** requires an MFA code to permanently delete a version or to suspend versioning — it can only be enabled by the root user with the CLI. **Object Lock** enforces write-once-read-many retention: in governance mode a privileged user can override, and in *compliance* mode nobody can, including the root user and AWS itself, until the retention period expires. Compliance mode is the ransomware and insider-threat answer, and it is genuinely irreversible — test it on a scratch bucket first.

<a id="16-3-lifecycle"></a>

### 16.3 Lifecycle and storage classes

> **Interactive animation:** `s3-lifecycle` — rendered by the page script in the HTML version.

Lifecycle rules apply to a prefix, a tag, or the whole bucket, and can act on current versions, non-current versions and incomplete uploads independently. The two most valuable rules are usually the least glamorous: expire non-current versions after 30–90 days (versioning otherwise grows without bound), and abort incomplete multipart uploads after 7 days.

<a id="16-4-replication"></a>

### 16.4 Replication

**Cross-Region Replication** copies new objects to a bucket in another Region; **Same-Region Replication** copies within one, typically into a locked-down log-archive account. Both require versioning on both sides. Replication is asynchronous and applies only to objects created *after* it is enabled — use S3 Batch Replication for the backlog. If you need a latency SLA, **Replication Time Control** commits to 99.99% of objects within 15 minutes, at extra cost.

> **Key idea**
>
> **The S3 backup posture that actually survives an incident:** versioning on, lifecycle expiring non-current versions, replication to a bucket in a *different account* that the production role cannot write to, and Object Lock in compliance mode on the replica. Compromised production credentials can then delete everything they can see and still not touch the copy.

<a id="17-file-storage"></a>

## 17. File Storage — EFS, FSx & Storage Gateway

> **In plain words**
>
> **In plain English**
>
> Sometimes your software insists on a real folder it can open, edit and save into — S3 cannot do that. **EFS** is a shared network drive many Linux machines can mount at once. **FSx** is the same idea for Windows file shares and high-performance computing. **Storage Gateway** puts an AWS-backed drive inside your own office. Use these only when an object store genuinely will not fit; they cost considerably more.

| Service | Protocol | Scope | Use for |
| --- | --- | --- | --- |
| EFS | NFSv4 | Regional, multi-AZ, elastic | Shared POSIX storage for many EC2/ECS/Lambda consumers |
| FSx for Windows | SMB | Multi-AZ option | Windows file shares with Active Directory integration |
| FSx for Lustre | Lustre | Single AZ, links to S3 | HPC and ML training needing hundreds of GB/s |
| FSx for NetApp ONTAP | NFS, SMB, iSCSI | Multi-AZ | Lift-and-shift of NetApp estates, snapshots and dedup |
| FSx for OpenZFS | NFS | Single or multi-AZ | Low-latency NFS with ZFS snapshots |
| Storage Gateway | NFS, SMB, iSCSI, VTL | Hybrid | On-premises applications backed by S3, with a local cache |

**EFS** is the one you are most likely to need. It grows and shrinks automatically, is mounted by any number of instances at once, and is the standard answer to "several containers need to share a directory". Its performance model is worth understanding: the default *Elastic* throughput mode scales with usage; *Bursting* mode ties throughput to stored size and can throttle a small-but-busy filesystem; *Provisioned* mode buys a fixed rate. It also has Infrequent Access and Archive classes with lifecycle policies, exactly like S3.

> **Warning**
>
> **EFS is NFS, with NFS's latency.** Per-file operations cost a network round trip, so an application that opens thousands of small files — a Node.js `node_modules` tree, a Python site-packages directory — will be dramatically slower on EFS than on EBS. Use EFS for shared *data*, not for shared *code*.

<a id="unit-4"></a>

## Unit 4 — Databases & Caching

Choosing and operating relational, key-value and in-memory data stores.

<a id="18-rds-aurora"></a>

## 18. RDS & Aurora

> **In plain words**
>
> **In plain English**
>
> A normal SQL database — PostgreSQL or MySQL — except AWS installs it, patches it, backs it up and keeps a standby copy in another building ready to take over. **Aurora** is AWS's own rebuild of those engines: the storage grows by itself, replicas share one copy of the data, and failover takes seconds rather than minutes. You give up root access on the server; you get your weekends back.

**RDS** is a managed relational database: AWS handles provisioning, patching, backups, failover and replication for PostgreSQL, MySQL, MariaDB, Oracle, SQL Server and Db2. You do not get the host, you do not get `SUPERUSER`, and you do get to stop thinking about most operational work.

> **Interactive animation:** `rds-failover` — rendered by the page script in the HTML version.

<a id="18-1-availability"></a>

### 18.1 Multi-AZ, replicas and backups

|   | Multi-AZ instance | Multi-AZ cluster | Read replica |
| --- | --- | --- | --- |
| Standbys | 1, serves nothing | 2, both readable | Up to 5 (15 on Aurora), readable |
| Replication | Synchronous | Semi-synchronous | Asynchronous |
| Failover | Automatic, 60–120 s | Automatic, under 35 s | Manual promotion |
| Data loss | None | None | Possible (replica lag) |
| Cross-Region | No | No | Yes |

Automated backups give **point-in-time recovery** to any second within the retention window (up to 35 days) by combining daily snapshots with continuously archived transaction logs. Manual snapshots persist until you delete them. A restore always creates a *new* instance with a new endpoint, which is why a recovery runbook has to include a step for repointing the application — and why you should have practised it.

<a id="18-2-aurora"></a>

### 18.2 Aurora

Aurora keeps the PostgreSQL and MySQL engines but replaces the storage layer with a distributed, log-structured service that keeps six copies of every 10 GB segment across three AZs. The consequences are architectural rather than incremental:

- Storage grows automatically to 128 TB, and all instances in the cluster share it — so adding a read replica copies no data and takes minutes, not hours.
- Failover is typically under 30 seconds, because there is no data to promote, only a role to change.
- Backups are continuous to S3 and have no performance impact.
- **Aurora Serverless v2** scales capacity in fine-grained increments, including scaling to a very low floor for idle databases.
- **Global Database** replicates to other Regions with typical lag under a second and cross-Region failover in about a minute.
- The cluster exposes two endpoints: a *writer* endpoint that follows the primary, and a *reader* endpoint that load-balances across replicas.

<a id="18-3-connections"></a>

### 18.3 Connection management

Relational databases have a hard limit on connections, and each one costs memory. Serverless compute is pathological here: a thousand concurrent Lambda invocations means a thousand attempted connections, each used for milliseconds. **RDS Proxy** sits in front, pools and multiplexes connections, and survives failovers transparently by holding the client connection while it reconnects underneath. For containers, an in-process pool with a sane maximum, multiplied by the number of tasks, must stay under the database's limit — a calculation worth doing explicitly rather than discovering.

> **Tip**
>
> **Turn on Performance Insights.** It is free at the default retention and shows database load broken down by SQL statement, wait event and user. "Which query is doing this to us?" is the first question in every database incident, and Performance Insights answers it in one screen without installing anything.

<a id="19-dynamodb"></a>

## 19. DynamoDB — Modelling, Capacity & Indexes

> **In plain words**
>
> **In plain English**
>
> DynamoDB is a giant, permanently fast lookup table. You choose a **key**, and AWS uses it to decide which machine your item lives on — which is why a well-chosen key stays fast at any size, and a bad one (everybody's data under one key) creates a hot spot. The trade is that you must know your questions in advance; there is no "just add a WHERE clause" later, only extra indexes you planned for.

> **Interactive animation:** `dynamodb-partition` — rendered by the page script in the HTML version.

<a id="19-1-keys"></a>

### 19.1 Keys and access patterns

An item is identified by a **partition key**, optionally with a **sort key**. The partition key is hashed to choose a physical partition; the sort key orders items within it. That is the entire storage model, and everything else follows: `GetItem` by full key is O(1); `Query` within one partition key with a sort-key condition is efficient; `Scan` reads the whole table and should be treated as a last resort.

Because a query must specify a partition key, **you must know your access patterns before you design the table**. This inverts the relational habit: in SQL you model the data and derive the queries; here you enumerate the queries and derive the keys. Single-table design takes this to its conclusion, storing several entity types in one table with generic `PK`/ `SK` attributes so that one query returns a whole object graph.

```text
Access patterns, written down first:
                1. get a user by id 4. get a user's orders, newest first
                2. get an order by id 5. get the items in an order
                3. list orders by status and date 6. get a user by email

                Resulting single-table design:
                PK SK GSI1PK GSI1SK
                USER#42 PROFILE EMAIL#a@b.com USER#42 ← 1, 6
                USER#42 ORDER#2026-02-11#A91 ← 4
                ORDER#A91 META STATUS#OPEN 2026-02-11 ← 2, 3
                ORDER#A91 ITEM#SKU-77 ← 5

                Query PK=USER#42, SK begins_with "ORDER#" → pattern 4, one request
                Query GSI1 PK=STATUS#OPEN, SK between … → pattern 3, one request
```

<a id="19-2-indexes"></a>

### 19.2 Secondary indexes

|   | Global secondary index | Local secondary index |
| --- | --- | --- |
| Partition key | Any attribute | Same as the table's |
| Created | Any time | Only at table creation — permanently |
| Consistency | Eventually consistent only | Strong consistency available |
| Capacity | Its own | Shares the table's |
| Limit | 20 per table | 5 per table, 10 GB per partition key |

A **sparse index** is the most useful trick here: an index only contains items that have its key attribute, so writing `gsi1pk` only on the items you care about produces a small, cheap index over a large table. Filtering "open orders" out of ten million orders becomes a query over the few thousand that are open.

<a id="19-3-capacity"></a>

### 19.3 Capacity, throttling and transactions

**On-demand** mode charges per request and needs no planning — the right default, and the only sane choice for unpredictable traffic. **Provisioned** mode is cheaper for steady, well-understood load and can be combined with auto scaling and reserved capacity. One RCU is one strongly consistent read of up to 4 KB per second (or two eventually consistent reads); one WCU is one write of up to 1 KB per second.

Throttling has two shapes. Table-level throttling means you have exceeded provisioned capacity — raise it or switch to on-demand. Partition-level throttling means one partition key is hot, and no amount of extra capacity helps because the 3,000 RCU / 1,000 WCU per-partition ceiling is fixed. The fix is key design: add a shard suffix, or choose a higher-cardinality key. Enable CloudWatch Contributor Insights on the table to see the top keys by traffic.

Other features worth knowing by name: **DynamoDB Streams** emits an ordered change log per partition key, which is how you drive Lambdas, replicate, or maintain a search index; **TTL** deletes expired items for free; **transactions** give ACID across up to 100 items at double the capacity cost; **global tables** provide multi-Region active-active with last-writer-wins conflict resolution; and **PartiQL** offers a SQL-like syntax that does not change any of the underlying constraints.

> **Warning**
>
> **Conditional writes are the concurrency-control mechanism, and using them is not optional.** `ConditionExpression` makes a write succeed only if the item's current state matches what you expect — `attribute_not_exists(pk)` for create-if-absent, or a version attribute check for optimistic locking. Read-modify-write without a condition will lose updates the first time two requests overlap, and the loss is silent.

<a id="20-caching"></a>

## 20. Caching — ElastiCache & DAX

> **In plain words**
>
> **In plain English**
>
> A cache keeps the answers everyone keeps asking for in memory, so the database is never asked the same question twice. **ElastiCache** is managed Redis or Memcached for that; **DAX** is the same trick bolted onto DynamoDB. Caching is usually a better answer to a struggling database than buying a bigger one — as long as you have thought about what happens when the cache is empty or the data goes stale.

A cache does not absorb load, it *removes* it — which is why it is usually a better first response to database pressure than a larger instance. AWS offers **ElastiCache** for Redis, Valkey and Memcached, **MemoryDB** as a durable Redis-compatible primary database, and **DAX** as a transparent write-through cache specifically for DynamoDB.

|   | Redis / Valkey | Memcached |
| --- | --- | --- |
| Data types | Strings, hashes, lists, sets, sorted sets, streams, HyperLogLog | Strings only |
| Persistence | Snapshots and AOF | None |
| Replication / failover | Yes, with Multi-AZ | No |
| Scaling | Cluster mode shards the keyspace | Add nodes, client-side hashing |
| Use for | Nearly everything: sessions, leaderboards, rate limits, pub/sub, locks | Pure, simple, multi-threaded object caching |

<a id="20-1-patterns"></a>

### 20.1 Caching patterns and their failure modes

- **Cache-aside (lazy loading)** — read the cache; on a miss read the database and populate. Only requested data is cached, and a cache failure degrades rather than breaks. The default choice.
- **Write-through** — write to the cache and the database together. The cache is never stale, at the price of writing data that may never be read.
- **Write-behind** — write to the cache, flush to the database asynchronously. Fast, and risks losing writes.

The three failure modes worth designing against: **thundering herd**, where a popular key expires and a thousand requests all miss and hit the database at once — mitigate with a per-key lock or by refreshing slightly before expiry; **cache stampede after a restart**, where an empty cache means every request is a miss — mitigate by warming; and **staleness**, which is a correctness question you must answer explicitly by choosing a TTL and an invalidation strategy rather than by hoping.

> **Key idea**
>
> **Every cached item needs a TTL, including the ones you invalidate explicitly.** Explicit invalidation will eventually be missed — a code path nobody remembered, a failed delete, a deploy that changed the key format. A TTL bounds how wrong you can be, and turns a permanent correctness bug into a temporary one.

<a id="unit-5"></a>

## Unit 5 — Serverless, Containers & Data Flow

Running code without servers or in containers, and moving data between services as messages, streams and queries.

<a id="21-lambda"></a>

## 21. Lambda in Depth

> **In plain words**
>
> **In plain English**
>
> You upload a function, something triggers it, AWS finds a machine to run it on, and you pay for the milliseconds it ran. No servers to patch and no capacity to plan. The details that matter in practice are the **cold start** (the first call waits while a new environment boots), the fact that a warm environment is reused — so anything you leave in memory is still there next time — and the concurrency limit that decides how many can run at once.

> **Interactive animation:** `lambda-lifecycle` — rendered by the page script in the HTML version.

<a id="21-1-execution"></a>

### 21.1 The execution environment

Each concurrent request gets its own **execution environment** — a Firecracker micro-VM with your code, your runtime, 512 MB to 10 GB of ephemeral `/tmp`, and memory from 128 MB to 10,240 MB. CPU is allocated *proportionally to memory*: roughly one full vCPU at 1,769 MB, and up to six vCPUs at the maximum. An environment handles one request at a time and is reused for subsequent requests while traffic continues, then frozen and eventually discarded.

The practical consequences: initialise SDK clients, database pools and configuration at **module scope** so they are shared across invocations; never store request state in a global, because the next request on that environment will see it; and remember that background work started but not awaited may be frozen mid-flight when the handler returns and resume unpredictably on the next invocation.

<a id="21-2-invocation"></a>

### 21.2 Invocation models

| Model | Callers | Retries | Failure destination |
| --- | --- | --- | --- |
| Synchronous | API Gateway, ALB, function URL, SDK `Invoke` | None — the caller decides | The caller sees the error |
| Asynchronous | S3, SNS, EventBridge | 2 automatic retries, with delay | On-failure destination or DLQ |
| Event source mapping | SQS, Kinesis, DynamoDB Streams, MSK | Lambda polls and retries per its config | Queue DLQ or stream failure destination |

Stream sources (Kinesis and DynamoDB Streams) are ordered per shard, which means **a failing batch blocks that shard** until it succeeds or expires. Configure `BisectBatchOnFunctionError`, `MaximumRetryAttempts` and an on-failure destination, or one poison record halts a partition for a day.

<a id="21-3-concurrency"></a>

### 21.3 Concurrency and cold starts

An account has a default limit of 1,000 concurrent executions per Region, **shared across every function**. *Reserved* concurrency carves out a guaranteed slice for one function and simultaneously caps it — which is how you both protect a critical function and protect a fragile downstream database from an aggressive one. *Provisioned* concurrency keeps a number of environments initialised and warm, eliminating cold starts at the cost of paying while idle.

Levers on cold start, in order of value: reduce package size; move rarely used imports inside the handler; increase memory (more CPU makes initialisation finish sooner); choose a fast-starting runtime; use **SnapStart**, which snapshots the initialised environment and restores it (available for Java, Python and .NET); and only then buy provisioned concurrency. Periodic "warming" pings are close to useless, because each ping warms exactly one environment while a burst needs hundreds.

> **Warning**
>
> **A Lambda in a VPC can reach private resources and cannot reach the internet** unless the subnet routes to a NAT Gateway or the relevant VPC endpoints exist. Since 2019 the ENIs are shared and the old cold-start penalty is gone, but the connectivity rule is unchanged — and "my function times out calling a third-party API after I put it in a VPC" remains one of the most frequently asked Lambda questions.

<a id="22-api-gateway"></a>

## 22. API Gateway

> **In plain words**
>
> **In plain English**
>
> A managed front door for your API. It gives you an HTTPS address and a custom domain, checks who the caller is, throttles anyone hammering you, and forwards the request to a Lambda function or a service behind it. It exists so that every one of your functions does not have to reimplement authentication, rate limiting and TLS for itself.

|   | HTTP API | REST API | WebSocket API |
| --- | --- | --- | --- |
| Cost | ~70% cheaper | Higher | Per message + connection-minute |
| Latency | Lower | Higher | — |
| Auth | JWT, IAM, Lambda authorizer | All of those, plus Cognito user pools, plus API keys | IAM, Lambda authorizer |
| Missing vs REST | No request/response transformation, no usage plans, no caching, no WAF | — | — |
| Choose it when | Default for new APIs | You need caching, usage plans, WAF or heavy transformation | Chat, live updates, streaming clients |

API Gateway gives you throttling and quotas, request validation against a JSON schema, stages and canary deployments, custom domains with ACM certificates, authorizers, and CloudWatch and X-Ray integration. Its direct **service integrations** are underused: an endpoint can put a message on SQS or an item in DynamoDB with no Lambda at all, which removes a whole component from the critical path.

<a id="22-1-cors"></a>

### 22.1 CORS, and why it is always the problem

A browser making a cross-origin request with a non-simple method or header first sends an `OPTIONS` preflight. Three failures account for nearly every CORS ticket: the `OPTIONS` route is not configured, so the preflight 403s; the error responses (4xx and 5xx generated by API Gateway itself, not your code) carry no CORS headers, so a real error appears in the browser as a CORS error and sends you looking in the wrong place; and CORS is configured in *both* API Gateway and the Lambda, which then double-set the header and invalidate it.

> **Tip**
>
> **The way to never think about CORS again is to remove the cross-origin part.** Serve the front end and the API from the same domain by putting both behind one CloudFront distribution, with `/api/*` routed to the API and everything else to the S3 origin. Same origin, no preflight, no headers to configure, and one WAF and one set of logs.

> **Key idea**
>
> **Decide early whether you need API Gateway at all.** A Lambda **function URL** is free and sufficient for a webhook receiver or an internal endpoint. An **ALB** is cheaper than API Gateway above roughly a million requests per day and integrates with Lambda too. API Gateway earns its price when you want authorizers, per-client throttling, request validation and staged deployments — not merely because the target happens to be a Lambda.

<a id="23-containers"></a>

## 23. Containers — ECR, ECS, Fargate & EKS

> **In plain words**
>
> **In plain English**
>
> Four pieces of the same story. **ECR** is the private shelf where your Docker images live. **ECS** is AWS's own, fairly simple scheduler that keeps N copies of your container running. **Fargate** means you never see the underlying servers at all. **EKS** is managed Kubernetes — far more power and far more moving parts, worth it mainly if you already speak Kubernetes.

<a id="23-1-ecr"></a>

### 23.1 ECR

The Elastic Container Registry stores images, scans them for vulnerabilities (basic scanning on push, or enhanced scanning through Inspector for continuous rescanning as new CVEs are published), and supports immutable tags — which you should turn on, because a mutable `latest` means you cannot say what is running. Lifecycle policies expire untagged and old images so the registry does not grow forever. Authentication is an IAM-derived token, so a pull requires `ecr:GetAuthorizationToken` plus repository permissions, and that is why an ECS *execution* role missing ECR permissions produces a task that never starts.

<a id="23-2-ecs"></a>

### 23.2 ECS

ECS has three objects. A **task definition** is an immutable revision describing one or more containers: image, CPU, memory, port mappings, environment, secrets, logging, and the task and execution roles. A **task** is a running instance of one. A **service** maintains a desired number of tasks, registers them with a load balancer, and performs deployments.

> **Interactive animation:** `ecs-deploy` — rendered by the page script in the HTML version.

**Fargate** is a launch type with no instances: you declare CPU and memory per task and AWS runs it. **EC2** launch type places tasks on instances you own, which is cheaper at sustained scale and necessary for GPUs, custom kernels, daemon containers and very high task density. Fargate is the right default; move to EC2 when a specific requirement or a modelled cost saving pushes you.

Networking on Fargate is always `awsvpc` mode: each task gets its own ENI with its own private IP and its own security groups, which makes per-task network policy straightforward. Service discovery comes from **Cloud Map** (DNS names for tasks) or from a load balancer. For one-off and scheduled work, **ECS Exec** gives you a shell inside a running task without SSH, and EventBridge Scheduler runs a task on a cron.

<a id="23-3-eks"></a>

### 23.3 EKS

EKS is managed Kubernetes: AWS runs the control plane across three AZs; you run the data plane as managed node groups, self-managed nodes, or Fargate profiles. The AWS-specific pieces you must understand are the ones that bridge Kubernetes concepts to AWS ones:

- **Pod Identity** or **IRSA** — maps a Kubernetes service account to an IAM role, so pods get AWS credentials without node-level roles.
- **VPC CNI** — pods get real VPC IP addresses, which is excellent for security-group integration and means *IP exhaustion is a real capacity limit*. Prefix delegation raises the density considerably.
- **AWS Load Balancer Controller** — turns Ingress objects into ALBs and Services into NLBs.
- **Karpenter** — provisions right-sized nodes in seconds based on pending pods, largely replacing the cluster autoscaler and node group capacity planning.
- **EBS/EFS CSI drivers** — persistent volumes.

> **Key idea**
>
> **Choose EKS for a reason you can name.** Portability across clouds, an existing Kubernetes investment, a required operator ecosystem, or a platform team that already runs it. If none of those apply, ECS on Fargate delivers the same outcome with a fraction of the operational surface — no control-plane upgrades, no CNI tuning, no CRD version drift. "It is the industry standard" is a description of popularity, not a requirement.

<a id="24-step-functions"></a>

## 24. Step Functions & Orchestration

> **In plain words**
>
> **In plain English**
>
> For a process with several steps — charge the card, reserve stock, send the email — you draw it as a flowchart instead of writing the glue yourself. Step Functions then runs it, remembers where each execution got to, retries the flaky steps, follows the branches, can wait for days if needed, and shows you a picture of exactly where a run failed.

Once a process has more than about three steps with retries, branches and partial failures, hand-rolling it in Lambda becomes a distributed-systems project you did not intend to start. **Step Functions** is a managed state machine: you declare states, transitions, retry policies and error handling, and AWS runs it durably, keeping the full execution history for inspection.

```json
{
  "Comment": "Order fulfilment with compensation on failure",
  "StartAt": "ReserveStock",
  "States": {
    "ReserveStock": {
      "Type": "Task",
      "Resource": "arn:aws:states:::dynamodb:updateItem",
      "Parameters": { "TableName": "inventory", "Key": {"sku": {"S.$": "$.sku"}} },
      "Retry": [{
        "ErrorEquals": ["States.TaskFailed", "DynamoDB.ThrottlingException"],
        "IntervalSeconds": 1, "MaxAttempts": 4, "BackoffRate": 2.0, "JitterStrategy": "FULL"
      }],
      "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "FailOrder" }],
      "Next": "ChargeCard"
    },
    "ChargeCard": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": { "FunctionName": "charge", "Payload.$": "$" },
      "Catch": [{ "ErrorEquals": ["States.ALL"], "Next": "ReleaseStock" }],
      "Next": "ShipInParallel"
    },
    "ShipInParallel": {
      "Type": "Parallel",
      "Branches": [
        { "StartAt": "NotifyWarehouse", "States": {
            "NotifyWarehouse": {"Type": "Task",
              "Resource": "arn:aws:states:::sqs:sendMessage",
              "Parameters": {"QueueUrl": "https://sqs…/warehouse",
                             "MessageBody.$": "$"}, "End": true}}},
        { "StartAt": "SendEmail", "States": {
            "SendEmail": {"Type": "Task",
              "Resource": "arn:aws:states:::lambda:invoke",
              "Parameters": {"FunctionName": "email", "Payload.$": "$"},
              "End": true}}}
      ],
      "End": true
    },
    "ReleaseStock": { "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {"FunctionName": "release-stock", "Payload.$": "$"},
      "Next": "FailOrder" },
    "FailOrder": { "Type": "Fail", "Error": "OrderFailed" }
  }
}
```

|   | Standard workflow | Express workflow |
| --- | --- | --- |
| Duration | Up to 1 year | Up to 5 minutes |
| Execution model | Exactly-once | At-least-once |
| Pricing | Per state transition | Per execution and duration — far cheaper at volume |
| History | Full visual history retained | CloudWatch Logs only |
| Use for | Long-running business processes, human approval steps | High-volume short pipelines, streaming ingestion |

Two capabilities to know by name. **Callback patterns** (`.waitForTaskToken`) pause a workflow until an external system — a human approver, a third party — calls back with the token, for up to a year. And **Map state**, especially distributed map, fans out over millions of items in S3 with controlled concurrency, which turns "process every object in this bucket" into a configuration.

> **Tip**
>
> **Step Functions can call over 200 AWS services directly**, without a Lambda in between. A workflow that reads DynamoDB, publishes to SNS, starts a Glue job and waits for it needs no function code at all — which removes the code you would otherwise have to test, patch, secure and observe. Look for the direct integration before writing a "glue" Lambda.

<a id="25-messaging"></a>

## 25. Messaging — SQS, SNS & EventBridge

> **In plain words**
>
> **In plain English**
>
> Ways for services to talk without waiting for each other. **SQS** is a to-do list: work piles up safely and one worker takes each job. **SNS** is a megaphone: one announcement, every subscriber gets a copy. **EventBridge** is a sorting office that reads each event and routes it to whoever asked for that type. The payoff is that a slow or broken consumer no longer breaks the producer.

> **Interactive animation:** `sqs-visibility` — rendered by the page script in the HTML version.

<a id="25-1-sqs"></a>

### 25.1 SQS

A queue holds messages up to 256 KB (larger payloads go to S3 with the extended client library) for up to 14 days. Consumers *receive* a message, which makes it invisible for the **visibility timeout**, and *delete* it when done — deletion is the acknowledgement. Failing to delete means redelivery, which is the entire durability model.

|   | Standard | FIFO |
| --- | --- | --- |
| Throughput | Effectively unlimited | 300/s, or 3,000/s batched; higher with high-throughput mode |
| Ordering | Best effort | Strict, per message group ID |
| Delivery | At-least-once | Exactly-once processing, with a 5-minute dedup window |

Use **long polling** (`WaitTimeSeconds` of 20) always: it reduces empty receives, cost and latency simultaneously, and there is no case where short polling is better. Configure a **redrive policy** to a dead-letter queue on every queue, and alarm on the DLQ's depth — a DLQ nobody watches is a folder of lost work.

The metric to alarm on is `ApproximateAgeOfOldestMessage`, not queue depth. Depth tells you how much work exists; age tells you whether you are keeping up, which is what actually matters to the person waiting.

<a id="25-2-sns"></a>

### 25.2 SNS

SNS is push-based publish/subscribe. A publisher sends to a topic and every subscriber gets a copy — Lambda, SQS, HTTPS endpoints, email, SMS, and mobile push. It has no storage of its own, so a subscriber that is down misses messages unless you set a retry policy and a DLQ. Message filtering on attributes (and now on the message body) lets subscribers receive only what they care about.

The canonical pattern is **fan-out to queues**: SNS topic → several SQS queues → one consumer each. That combines SNS's cheap duplication with SQS's durability and independent retries, and it is a better default than subscribing Lambdas directly.

<a id="25-3-eventbridge"></a>

### 25.3 EventBridge

> **Interactive animation:** `eventbridge-fanout` — rendered by the page script in the HTML version.

EventBridge routes structured JSON events using content-based rules, with three distinguishing capabilities: the **default bus** receives events from AWS services themselves (an EC2 state change, an ECS task stopping, a CodePipeline stage failing), **partner event sources** bring SaaS events in directly, and the **schema registry** can generate typed bindings from observed events. **EventBridge Pipes** connects a source to a target with optional filtering and enrichment, replacing a great deal of glue code, and **EventBridge Scheduler** is a managed cron for over 200 targets with millions of schedules.

> **Key idea**
>
> **The selection rule.** Work that must survive a slow consumer → SQS. One message to many subscribers, cheaply → SNS. Routing based on event content, or consuming AWS/SaaS events → EventBridge. A multi-step process with retries and compensation → Step Functions. Ordered, replayable, high-volume records with multiple independent readers → Kinesis. They compose: EventBridge → SQS → Lambda is one of the most common shapes on AWS.

<a id="26-streaming"></a>

## 26. Streaming — Kinesis, Firehose & MSK

> **In plain words**
>
> **In plain English**
>
> A queue throws a message away once it is handled. A **stream** keeps it, like a tape, so several different teams can read the same events at their own pace and rewind if their code was wrong. **Kinesis** is AWS's version, **MSK** is managed Apache Kafka, and **Firehose** is the no-code pipe that just dumps the stream into S3 or a warehouse.

Queues delete a message once it is processed. **Streams** keep an ordered log that many independent consumers read at their own positions, and that can be replayed. That difference — replay and multiple independent readers — is the reason to choose a stream.

| Service | Model | Use for |
| --- | --- | --- |
| Kinesis Data Streams | Sharded log, 1–365 day retention, ordered per shard | Real-time ingestion with multiple consumers and replay |
| Data Firehose | Fully managed delivery, no shards | Buffer and land data in S3, Redshift, OpenSearch or Splunk |
| MSK | Managed Apache Kafka | Existing Kafka ecosystems, Connect, Streams, exact API compatibility |
| Managed Flink | Apache Flink | Stateful stream processing, windowed aggregation, SQL over streams |

A Kinesis **shard** supports 1 MB/s or 1,000 records per second in, and 2 MB/s out shared across consumers — or 2 MB/s per consumer with enhanced fan-out. Records are ordered within a shard, and the partition key determines the shard, so the same hot-key problem as DynamoDB applies: a partition key with poor cardinality creates a hot shard that throttles while the stream is mostly idle. On-demand mode removes shard management at higher cost.

> **Tip**
>
> **If all you need is "get this data into S3 reliably", use Firehose.** No shards, no consumers, no checkpointing, automatic buffering, compression, Parquet conversion and partitioning. Teams routinely build a Kinesis stream plus a Lambda consumer plus retry logic to reproduce what Firehose does as configuration.

<a id="27-analytics"></a>

## 27. Analytics — Athena, Glue, Redshift & OpenSearch

> **In plain words**
>
> **In plain English**
>
> Asking questions of data that already sits in S3. **Athena** runs plain SQL straight over those files and charges by the data scanned. **Glue** keeps the catalogue of what those files contain and cleans them up. **Redshift** is a proper data warehouse for heavy, repeated reporting. **OpenSearch** is for free-text search and poking around in logs.

The AWS analytics story is built on the idea that **S3 is the data lake** and the engines are interchangeable readers of it. Storage and compute are separated, so you can point several tools at the same files.

- **Glue Data Catalog** — the shared metastore: databases, tables, schemas, partitions. Hive-compatible, and used by Athena, Redshift Spectrum, EMR and Glue ETL alike.
- **Glue ETL** — serverless Spark for transformation, with crawlers that infer schemas from files.
- **Athena** — serverless SQL over S3, billed per terabyte scanned. No cluster, no loading, no maintenance.
- **Redshift** — a columnar MPP warehouse for repeated, complex analytical queries over curated data. Redshift Serverless removes cluster management; Spectrum queries S3 directly.
- **EMR** — managed Spark, Hive, Presto and HBase when you need the full ecosystem or fine-grained control.
- **OpenSearch** — full-text search, log analytics and dashboards.
- **QuickSight** — BI dashboards, priced per user or per session.
- **Lake Formation** — fine-grained (column, row and cell level) permissions over the lake, layered on top of the catalog.

The performance and cost rules for a lake are the same three every time: **columnar format** (Parquet or ORC) so a query reads only the columns it needs; **partitioning** by the columns you filter on, usually date; and **file size** around 128–512 MB, because thousands of small files cost far more in request overhead than they save in granularity. Open table formats — Iceberg, Hudi, Delta — add ACID transactions, schema evolution and time travel on top, and Iceberg has become the default choice on AWS.

> **Key idea**
>
> **Athena or Redshift?** Athena when the queries are ad hoc, intermittent, and over data that already lives in S3 — you pay only when you query. Redshift when the same complex queries run constantly over curated data and you need consistent sub-second dashboards, joins across large fact tables, and concurrency scaling. Many organisations use both: Athena for exploration on the raw lake, Redshift for the modelled warehouse serving the business.

<a id="unit-6"></a>

## Unit 6 — The Edge & Operating at Scale

Serving users globally and running the estate well: DNS and CDN, observability, security, automation, cost and architecture review.

<a id="28-route53"></a>

## 28. Route 53 & DNS

> **In plain words**
>
> **In plain English**
>
> Route 53 is the phone book that turns `shop.example.com` into an address a browser can connect to. Because it also health-checks your endpoints, it can do more than answer blindly: send users to the nearest Region, split traffic 90/10 for a careful release, or stop handing out the address of a site that has just stopped responding.

> **Interactive animation:** `route53-routing` — rendered by the page script in the HTML version.

Route 53 is a global, authoritative DNS service with a 100% availability SLA, plus domain registration and health checking. Hosted zones are **public** (resolvable from the internet) or **private** (associated with VPCs, resolvable only inside them).

<a id="28-1-alias"></a>

### 28.1 Alias records

An **alias** is a Route 53 extension that points at an AWS resource — ALB, NLB, CloudFront, S3 website, API Gateway, another record in the zone. It is resolved inside Route 53 rather than by chaining a lookup, so it is free to query, it tracks the target's changing addresses automatically, and — uniquely — it can exist at the zone apex, where the DNS standard forbids a CNAME. There is no situation in which a CNAME to an AWS endpoint is preferable.

<a id="28-2-policies"></a>

### 28.2 Routing policies and health checks

| Policy | Chooses by |
| --- | --- |
| Simple | Nothing — one answer, no health awareness |
| Weighted | Relative weights — canaries, gradual migration, A/B |
| Latency | Measured network latency from the resolver to each Region |
| Failover | Primary while healthy, otherwise secondary |
| Geolocation | The user's country or continent — compliance and localisation |
| Geoproximity | Distance, with a bias dial to shift load between Regions |
| Multivalue answer | Up to 8 healthy records at random — poor man's load balancing |
| IP-based | The client's CIDR — useful for ISP-specific routing |

Health checks probe an endpoint (or watch a CloudWatch alarm, or aggregate other health checks) from multiple Regions. Attaching them to records is what turns a routing policy into a failover mechanism. Note the arithmetic: 30-second interval × 3 failures + the record TTL means realistic DNS failover takes roughly 90–150 seconds, and no configuration makes it seconds.

Inside a VPC, the **Route 53 Resolver** at base+2 answers for private hosted zones and forwards everything else. **Resolver endpoints** extend this to hybrid environments: inbound endpoints let on-premises resolvers query AWS private zones, outbound endpoints forward specified domains to on-premises DNS. **DNS Firewall** blocks queries to known-bad domains, which catches a great deal of malware command-and-control traffic.

<a id="29-cloudfront"></a>

## 29. CloudFront & the Edge

> **In plain words**
>
> **In plain English**
>
> CloudFront keeps copies of your pages, images and videos in hundreds of small sites around the world, so a user in Sydney is served locally instead of waiting on a server in Virginia. It makes things faster, cuts the load and the bandwidth bill on your origin, absorbs traffic spikes, and can even run small pieces of code at the edge.

> **Interactive animation:** `cloudfront-cache` — rendered by the page script in the HTML version.

CloudFront is a CDN with over 600 points of presence. It terminates TLS near the user, serves cached content from the edge, and carries cache misses to the origin over AWS's backbone. Its benefits divide into three, and only the first is what people expect:

1. **Caching** — a hit never reaches your origin, so a 95% hit ratio means your fleet handles a twentieth of the traffic.
2. **Connection termination** — even at a 0% hit ratio, terminating TLS a few milliseconds away and using the backbone typically saves 20–40% of latency for dynamic APIs.
3. **Security and economics** — it is where WAF and Shield attach, and CloudFront's data-transfer-out rate is lower than EC2's.

<a id="29-1-policies"></a>

### 29.1 Cache keys and policies

Three separate policies control behaviour and confusing them is the source of most CloudFront problems. The **cache policy** defines the cache key — which headers, cookies and query strings distinguish one cached variant from another — and the TTLs. The **origin request policy** defines what is *forwarded* to the origin, which can be more than is in the cache key. The **response headers policy** adds CORS and security headers at the edge without touching the origin.

Every value added to the cache key multiplies the number of variants and divides the hit ratio. Forwarding all headers is the single most common misconfiguration and effectively disables caching while still charging you for it.

<a id="29-2-security"></a>

### 29.2 Origin access and edge compute

**Origin Access Control** lets CloudFront sign requests to a private S3 bucket, so the bucket never needs public access. **Signed URLs and signed cookies** restrict content to authorised users with an expiry. **Field-level encryption** encrypts specific form fields at the edge so only a designated service can read them.

Two edge runtimes exist and they are not interchangeable. **CloudFront Functions** are sub-millisecond JavaScript at the edge location for header manipulation, URL rewrites, redirects and cache-key normalisation — extremely cheap, no network access. **Lambda@Edge** runs full Node or Python at the regional edge cache, can make network calls and take up to 30 seconds, and is correspondingly more expensive. Reach for Functions first; almost every request-manipulation task fits.

> **Warning**
>
> **Do not build a deployment process that depends on invalidations.** They take minutes, cost money past the free allowance, and are a manual step that will be skipped. Put a content hash in asset filenames, cache them for a year as immutable, and give the entry-point HTML a short TTL. Deploys then become atomic and instantaneous, with no purge at all.

<a id="30-observability"></a>

## 30. Observability — CloudWatch, X-Ray & CloudTrail

> **In plain words**
>
> **In plain English**
>
> Three different questions, three tools. **CloudWatch** answers "is anything wrong?" with metrics, logs and alarms that page someone. **X-Ray** answers "where exactly is the time going?" by following one request through every service it touches. **CloudTrail** answers "who did this?" by recording every AWS API call made in the account.

> **Interactive animation:** `cloudwatch-alarm` — rendered by the page script in the HTML version.

<a id="30-1-metrics"></a>

### 30.1 Metrics and alarms

A metric is identified by namespace, name and a set of dimensions. Note that **each unique combination of dimensions is a separate metric**, and a separate charge — which is why putting a user ID or a request ID in a dimension produces a spectacular bill. High-cardinality data belongs in logs, which are queryable, not in metric dimensions.

Alarms watch a metric or a metric-math expression over a number of periods, and support three types: static thresholds, **anomaly detection** (a learned band around expected behaviour, good for metrics with a daily cycle), and **composite** alarms that combine others with boolean logic to cut alert noise. Set `treatMissingData` deliberately for every alarm; the default of `missing` means a completely dead service produces `INSUFFICIENT_DATA` rather than a page.

<a id="30-2-logs"></a>

### 30.2 Logs

CloudWatch Logs organises streams into groups. **Set a retention period on every group** — the default is to keep data forever, and log storage silently becomes a major line item. **Logs Insights** queries with a purpose-built language; **metric filters** turn a log pattern into a metric you can alarm on; **subscription filters** stream logs onward to Firehose, OpenSearch or a third party in real time.

Emit **structured JSON** with a correlation ID, and Insights can aggregate and percentile it directly. The **Embedded Metric Format** goes further: a specially shaped JSON log line is extracted into a real CloudWatch metric with no separate API call, giving you metrics and the surrounding context from one write.

<a id="30-3-tracing"></a>

### 30.3 Tracing and auditing

**X-Ray** propagates a trace header through your services and assembles segments into a service map with timing per hop. It is the only practical way to answer "where did the 3 seconds go?" across several services, and it is what turns a vague latency complaint into a named dependency. **Application Signals** layers SLOs on top of the same data, using OpenTelemetry instrumentation.

**CloudTrail** records every API call: who, what, when, from which IP, with which parameters, and whether it succeeded. Management events are recorded free for 90 days; a trail to S3 gives you long-term retention, and CloudTrail Lake gives you SQL over the history. Data events (S3 object-level access, Lambda invocations) are opt-in and charged, but are often exactly what an investigation needs.

> **Key idea**
>
> **"Why did it break?" is usually answered by "what changed?"** — and CloudTrail plus AWS Config are the only services that know. Config records resource configuration over time, so you can see that a security group changed at 14:02 and what it looked like before. Turn both on organisation-wide into a locked-down log-archive account, and you have made every future incident investigation tractable.

<a id="31-security-services"></a>

## 31. Security Services — KMS, Secrets, GuardDuty, WAF

> **In plain words**
>
> **In plain English**
>
> The services that protect you when something has already gone wrong. **KMS** holds encryption keys that never leave it, so stolen data is unreadable. **Secrets Manager** keeps passwords and API keys out of your source code and rotates them. **GuardDuty** watches the account for suspicious behaviour. **WAF** filters malicious web requests before they reach your app.

> **Interactive animation:** `kms-envelope` — rendered by the page script in the HTML version.

<a id="31-1-kms"></a>

### 31.1 KMS

KMS holds keys inside FIPS-validated hardware security modules and never releases the key material. Because it only encrypts payloads up to 4 KB, everything of size uses **envelope encryption**: `GenerateDataKey` returns a data key in plaintext and encrypted under the KMS key; you encrypt locally, store the encrypted data key beside the ciphertext, and discard the plaintext.

A **key policy** is a resource policy on the key and is the primary access control — IAM alone is not sufficient unless the key policy delegates to IAM. This is why an `AccessDenied` reading an encrypted S3 object often has nothing to do with S3. Prefer **customer managed keys** where it matters: they give you a key policy, automatic annual rotation, grants, aliases and, decisively, the ability to disable the key and instantly revoke access to everything it protects. **CloudHSM** exists for single-tenant hardware and regulatory requirements that KMS cannot satisfy.

<a id="31-2-secrets"></a>

### 31.2 Secrets Manager and Parameter Store

|   | Secrets Manager | SSM Parameter Store |
| --- | --- | --- |
| Cost | ~$0.40 per secret per month + API calls | Standard tier free; advanced tier charged |
| Rotation | Built in, with Lambda rotation functions for RDS and others | None |
| Cross-account / cross-Region | Resource policy and replication | No |
| Use for | Credentials, API keys, anything that must rotate | Configuration, feature flags, non-rotating values |

<a id="31-3-detective"></a>

### 31.3 Detective and preventive services

- **GuardDuty** — continuously analyses CloudTrail, VPC Flow Logs, DNS logs, EKS audit logs and S3 data events for credential exfiltration, crypto-mining, reconnaissance and known-bad destinations. One click, no agents, and it finds real things.
- **Inspector** — continuous vulnerability scanning of EC2, ECR images and Lambda functions against the CVE database.
- **Macie** — discovers personal and sensitive data in S3.
- **Security Hub** — aggregates findings from all of the above against CIS and AWS Foundational benchmarks, organisation-wide.
- **Detective** — builds a behaviour graph so an investigation can follow a finding across resources and time.
- **IAM Access Analyzer** — identifies resources reachable from outside the account or organisation, validates policies, and generates least-privilege policies from CloudTrail history.
- **WAF** — layer 7 filtering on CloudFront, ALB, API Gateway and AppSync, with managed rule groups, rate limiting and bot control.
- **Shield Advanced** — L7 DDoS protection, a response team, and cost protection against attack-driven scaling charges.
- **Config** — records configuration history and evaluates rules, with automatic remediation.

> **Interactive animation:** `shared-responsibility` — rendered by the page script in the HTML version.

> **Key idea**
>
> **A minimum viable security baseline, in the order to do it.** Root MFA and no root access keys. Separate accounts per environment under Organizations. IAM Identity Center instead of IAM users. CloudTrail organisation-wide to a locked log-archive account. GuardDuty on everywhere. Block Public Access on at the account level. Default encryption on S3, EBS and RDS. Secrets in Secrets Manager. A budget alarm. That list takes an afternoon and eliminates the overwhelming majority of real-world AWS incidents.

<a id="32-iac"></a>

## 32. Infrastructure as Code

> **In plain words**
>
> **In plain English**
>
> Describe the infrastructure you want in a file and let a tool make reality match it, instead of clicking through the console and hoping. **CloudFormation** is AWS's built-in version, the **CDK** lets you write it in a real programming language, and **Terraform** does the same across clouds. The win is that the file lives in Git: reviewed, repeatable, and able to rebuild an entire environment from scratch.

> **Interactive animation:** `cfn-deploy` — rendered by the page script in the HTML version.

<a id="32-1-cloudformation"></a>

### 32.1 CloudFormation

A template declares resources; CloudFormation computes the difference between the declaration and reality and converges. A **stack** is the deployed instance of a template and owns the resources it created — which is what makes deletion, rollback and drift detection possible.

Template sections you will use: `Parameters` for inputs (with `AllowedValues` and `NoEcho`), `Mappings` for lookup tables, `Conditions` for environment differences, `Resources`, and `Outputs` (with `Export` for cross-stack references). Intrinsic functions — `!Ref`, `!GetAtt`, `!Sub`, `!If`, `!ImportValue`, `!FindInMap` — build the dependency graph automatically, so explicit `DependsOn` is rarely needed.

Behaviours to know: an **update** may modify in place, modify with interruption, or *replace* a resource, and a change set tells you which; a failure triggers automatic **rollback** of the whole stack; **drift detection** reports resources changed outside CloudFormation; **StackSets** deploy one template across many accounts and Regions; **nested stacks** and cross-stack exports compose large estates — noting that an exported value cannot be changed while another stack imports it, which is a common source of stuck updates.

<a id="32-2-cdk-sam-terraform"></a>

### 32.2 CDK, SAM and Terraform

**The same VPC and service, three ways**

```python
# AWS CDK - a real language that synthesises CloudFormation.
# L2 constructs encode sensible defaults; that is most of the value.
from aws_cdk import Stack, Duration, aws_ec2 as ec2, aws_ecs as ecs
from aws_cdk import aws_ecs_patterns as patterns
from constructs import Construct

class ApiStack(Stack):
    def __init__(self, scope: Construct, id: str, **kw):
        super().__init__(scope, id, **kw)

        # 3 AZs, public + private subnets, NAT, route tables - all of it
        vpc = ec2.Vpc(self, "Vpc", max_azs=3, nat_gateways=3)

        patterns.ApplicationLoadBalancedFargateService(
            self, "Api",
            vpc=vpc,
            cpu=512,
            memory_limit_mib=1024,
            desired_count=3,
            public_load_balancer=True,
            task_image_options=patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_registry("acme/api:1.4.2"),
                container_port=8080,
            ),
            circuit_breaker=ecs.DeploymentCircuitBreaker(rollback=True),
            health_check_grace_period=Duration.seconds(60),
        )
        # ~20 lines replacing several hundred lines of YAML - and it is
        # still CloudFormation underneath, so change sets and rollback remain.
```

```yaml
# AWS SAM - CloudFormation with a serverless-shaped shorthand.
# The Transform line expands these into full CloudFormation resources.
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: python3.12
    Timeout: 30
    MemorySize: 1024
    Architectures: [arm64]
    Tracing: Active                 # X-Ray, one line
    Environment:
      Variables:
        TABLE: !Ref Orders

Resources:
  Api:
    Type: AWS::Serverless::HttpApi
    Properties:
      StageName: prod

  CreateOrder:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.create
      Policies:
        - DynamoDBWritePolicy: {TableName: !Ref Orders}   # scoped, not s3:*
      Events:
        Post:
          Type: HttpApi
          Properties: {ApiId: !Ref Api, Path: /orders, Method: POST}

  Orders:
    Type: AWS::DynamoDB::Table
    DeletionPolicy: Retain          # the line that saves the data
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions: [{AttributeName: pk, AttributeType: S}]
      KeySchema: [{AttributeName: pk, KeyType: HASH}]
```

```bash
# Terraform - multi-cloud, its own state file, plan/apply.
# The tradeoff: no CloudFormation rollback, and the state file is
# now a critical, lockable, backed-up asset you own.
terraform init -backend-config="bucket=acme-tfstate" \
               -backend-config="dynamodb_table=tf-locks"
terraform plan -out=tfplan          # ALWAYS review before apply
terraform apply tfplan

# generate a least-privilege policy from the plan rather than guessing
terraform show -json tfplan > plan.json

# CDK and SAM equivalents
cdk diff                            # what will change
cdk deploy --require-approval any-change
sam build && sam deploy --guided
sam local start-api                 # run the API locally in Docker
```

|   | CloudFormation | CDK | SAM | Terraform |
| --- | --- | --- | --- | --- |
| Language | YAML/JSON | TypeScript, Python, Java, Go, C# | YAML shorthand | HCL |
| State | AWS-managed | AWS-managed (it is CFN) | AWS-managed | Your own state file |
| Rollback | Automatic | Automatic | Automatic | Manual |
| Multi-cloud | No | No (CDKTF exists) | No | Yes |
| Best for | Simple, stable stacks | Complex apps, reusable constructs | Serverless | Multi-cloud, existing Terraform estates |

> **Warning**
>
> **Structure stacks by rate of change.** Network and DNS change yearly; databases change a few times a year; the application changes hourly. One stack containing all three means every application deploy risks the VPC and a failed rollback can wedge everything. Three layered stacks with exported outputs make a deployment's blast radius match its actual scope.

<a id="33-cicd"></a>

## 33. CI/CD on AWS

> **In plain words**
>
> **In plain English**
>
> The conveyor belt from a commit to production: build the code, run the tests, then roll it out gradually — a few servers at a time, or to 5% of users first — while watching the alarms, and put the old version back automatically if anything goes red. AWS has its own CodePipeline family for this, though plenty of teams drive the same deployments from GitHub Actions.

The AWS-native chain is **CodePipeline** (orchestration) driving **CodeBuild** (build and test) and **CodeDeploy** (deployment strategies), with **CodeArtifact** for private packages and **CodeConnections** linking to GitHub, GitLab or Bitbucket. Many teams instead run GitHub Actions or GitLab CI and use AWS only as the deployment target — which is a perfectly good choice, and made much better by OIDC federation.

```yaml
# GitHub Actions deploying to AWS with no stored credentials at all.
# The role's trust policy pins the repo and the branch (see section 6).
name: deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write        # required to request the OIDC token
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v5
        with:
          role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
          aws-region: eu-west-1

      - uses: aws-actions/amazon-ecr-login@v2
        id: ecr

      - name: Build and push
        run: |
          IMAGE=${{ steps.ecr.outputs.registry }}/api:${{ github.sha }}
          docker build --platform linux/arm64 -t "$IMAGE" .
          docker push "$IMAGE"
          echo "IMAGE=$IMAGE" >> "$GITHUB_ENV"

      - name: Deploy
        run: |
          aws cloudformation deploy \
            --template-file infra/api.yaml \
            --stack-name api-prod \
            --parameter-overrides ImageUri="$IMAGE" \
            --capabilities CAPABILITY_IAM \
            --no-fail-on-empty-changeset
```

Deployment strategies, and what each buys you:

| Strategy | Extra capacity | Rollback | Catches bad releases? |
| --- | --- | --- | --- |
| Rolling | Small overhead | Roll forward to the previous revision | Only via health checks |
| Blue/green | Double, briefly | Instant — switch the target back | Only if you test the green environment |
| Canary | Small | Automatic on alarm | Yes — this is the point |
| Linear | Small | Automatic on alarm | Yes, more gradually |

All of them are defeated by a database migration that only the new code understands. The discipline is **expand, migrate, contract**: deploy a schema change that both versions tolerate, deploy the code, backfill, and only then remove the old column in a later release. Two deployments and a wait, instead of one deployment and an outage.

> **Tip**
>
> **Deploy the same artefact to every environment.** Build the container image or the Lambda zip once, promote that exact digest through staging to production, and inject configuration at runtime from Parameter Store or Secrets Manager. Rebuilding per environment means production runs something no one has actually tested.

<a id="34-cost"></a>

## 34. Cost Management & Optimisation

> **In plain words**
>
> **In plain English**
>
> Finding out where the money actually goes and then spending less of it. Tag everything so the bill can be split by team, switch off what nobody uses, right-size the machines that are far bigger than they need to be, commit to a year for the workloads that never stop, and set an alarm on the budget so you learn about a runaway cost in hours rather than at the end of the month.

Section 12.3 covered how compute is *bought*. This section is about seeing where the money actually goes and reducing it, which is a different skill: the bill is denominated in usage types, not in applications, and the largest surprises are rarely in the line item you expected.

<a id="34-1-tools"></a>

### 34.1 The tools

- **Cost Explorer** — the first stop. Group by *usage type*, not just by service, to see which meter moved.
- **Budgets** — alerts on actual and forecast spend, per account, service or tag.
- **Cost Anomaly Detection** — machine-learning alerts on unusual spend patterns. Free, and should be on everywhere.
- **Cost and Usage Report** — the full hourly, resource-level dataset in S3, queryable with Athena.
- **Compute Optimizer** — right-sizing recommendations for EC2, EBS, Lambda and ECS from actual utilisation.
- **Trusted Advisor** — idle resources, unassociated Elastic IPs, low utilisation, and a security checklist.
- **Cost allocation tags** — activate them early; they cannot be applied retroactively to already-billed usage.

<a id="34-2-levers"></a>

### 34.2 The levers, in order of return

1. **Turn things off.** Non-production environments stopped outside working hours cost about 70% less. Nothing else comes close, and it is a scheduled Lambda.
2. **Delete orphans.** Unattached EBS volumes, old snapshots, unassociated Elastic IPs, idle load balancers, unused NAT Gateways, forgotten dev clusters.
3. **Fix data transfer.** Add S3 and DynamoDB gateway endpoints, keep chatty services in one AZ where availability permits, and serve internet egress through CloudFront.
4. **Buy Savings Plans** for the steady baseline once you can see what it is.
5. **Move to Graviton.** Around 20% cheaper and usually faster; often a one-line change.
6. **Use Spot** for anything interruptible.
7. **Right-size.** Compute Optimizer will tell you which instances are oversized.
8. **Storage lifecycle.** S3 lifecycle rules, log retention periods, EBS snapshot expiry.
9. **Re-architect.** Serverless for spiky workloads, caching to remove database load, queues instead of over-provisioned capacity.

> **Warning**
>
> **The costs people never predict are all data movement or all idle resources.** NAT Gateway processing, cross-AZ transfer at a cent per gigabyte in each direction, internet egress, CloudWatch Logs ingestion after debug logging was left on, unattached volumes, and the S3 multipart-upload parts nobody can see. Check these before spending a week tuning instance sizes.

<a id="35-well-architected"></a>

## 35. The Well-Architected Framework

> **In plain words**
>
> **In plain English**
>
> AWS's standard checklist for reviewing a design, grouped into six themes: can we operate it, is it secure, does it survive failure, is it fast enough, does it cost a sensible amount, and is it wasteful. It is not paperwork — it is a set of uncomfortable questions that reliably catch the thing everyone forgot.

Six pillars, each of which is really a set of questions to ask about a design. The framework is worth knowing not because it is a certification topic but because it is the checklist every AWS design review runs, and it catches real omissions.

| Pillar | The question | Concrete practices |
| --- | --- | --- |
| Operational excellence | Can we deploy safely and do we know when it breaks? | IaC, small frequent deploys, runbooks, structured logs, game days |
| Security | If a credential leaks, how far does it reach? | Least privilege, roles not keys, encryption everywhere, account separation |
| Reliability | What happens when one AZ disappears right now? | Multi-AZ, health checks, retries with backoff, tested backups, quotas raised |
| Performance efficiency | Are we using the right service or the familiar one? | Managed services, caching, right-sizing from data, Graviton |
| Cost optimisation | What are we paying for while nobody uses it? | Savings Plans, Spot, lifecycle rules, shut-down schedules, tagging |
| Sustainability | Are we using more hardware than the job needs? | Right-sizing, Graviton, efficient formats, Regions with lower carbon intensity |

<a id="35-1-reference"></a>

### 35.1 Three reference architectures

```text
A. Classic three-tier web application
                Route 53 (alias) → CloudFront (+WAF) → ALB → ECS Fargate ×3 AZs
                ↓
                Aurora PostgreSQL Multi-AZ
                ElastiCache Redis
                Static assets: S3 + OAC behind the same distribution
                Secrets: Secrets Manager · Logs/metrics/traces: CloudWatch + X-Ray

                B. Event-driven serverless API
                CloudFront → API Gateway HTTP API → Lambda → DynamoDB
                ↓
                EventBridge → SQS → Lambda (async work)
                ↓ failures
                DLQ + alarm
                No servers, no scaling policy, nothing billed while idle

                C. Data lake and analytics
                Sources → Kinesis Data Streams → Firehose → S3 (raw, Parquet, partitioned)
                ↓ Glue crawler + catalog
                Glue ETL → S3 (curated, Iceberg)
                ↓
                Athena (ad hoc) · Redshift (modelled) · QuickSight
                Lake Formation for column- and row-level permissions
```

<a id="36-cheat-sheet"></a>

## 36. Cheat Sheet

<a id="36-1-numbers"></a>

### 36.1 Numbers worth knowing

| Limit | Value |
| --- | --- |
| S3 object size | 5 TB (5 GB per single PUT) |
| S3 requests per prefix | 3,500 write / 5,500 read per second |
| S3 durability / availability | 99.999999999% / 99.99% |
| Lambda timeout / memory / package | 15 min / 10 GB / 250 MB unzipped, 10 GB image |
| Lambda default concurrency | 1,000 per Region, shared across all functions |
| DynamoDB item / partition throughput | 400 KB / 3,000 RCU and 1,000 WCU |
| DynamoDB GSI / LSI per table | 20 / 5 |
| SQS message / retention / visibility | 256 KB / 14 days / 12 hours max |
| Kinesis shard | 1 MB/s or 1,000 rec/s in; 2 MB/s out |
| VPC subnet reserved IPs | 5 per subnet |
| VPCs per Region (default) | 5 |
| STS session | 15 min – 12 h; 1 h when role chaining |
| RDS backup retention | Up to 35 days for PITR |
| CloudFormation resources per stack | 500 |
| API Gateway payload / timeout | 10 MB / 29 s (REST) |

<a id="36-2-errors"></a>

### 36.2 Errors and what they mean

| Error | Usual cause | Retry? |
| --- | --- | --- |
| `AccessDenied` after adding admin | Explicit deny: SCP, resource policy, boundary or KMS key policy | Never |
| `ThrottlingException` | API rate limit | Yes, with jitter |
| `ProvisionedThroughputExceeded` | DynamoDB capacity or a hot partition | Yes, but fix the key |
| `RequestTimeTooSkewed` | Clock more than 15 minutes out | No — fix NTP |
| `InsufficientInstanceCapacity` | No capacity for that type in that AZ | Yes, with a different type or AZ |
| ALB 502 | Target closed the connection; keep-alive shorter than idle timeout | — |
| ALB 503 | No healthy targets | — |
| Lambda `Task timed out` | VPC with no NAT/endpoint, or a downstream call with no timeout | — |
| Instance not in SSM | Missing instance profile policy, no route to SSM endpoints, or no agent | — |

<a id="37-playbook"></a>

## 37. Pattern-Recognition Playbook

Design interviews and real design meetings are both pattern-matching exercises. These are the mappings from a stated requirement to the service that answers it.

> **Interactive animation:** `compute-choice` — rendered by the page script in the HTML version.

| When you hear… | Reach for | And say why |
| --- | --- | --- |
| "Users upload large files" | Presigned URL + multipart to S3 | Bytes never touch your server; bucket stays private |
| "Process a file after upload" | S3 event → SQS → Lambda | The queue absorbs bursts; the DLQ catches poison files |
| "Spiky, unpredictable traffic" | Lambda, or Fargate with target tracking | Pay per use; no capacity to guess |
| "Traffic spike overwhelms the database" | SQS in front, plus ElastiCache | Convert a spike into a backlog; remove read load |
| "Several services must react to one thing" | EventBridge → SQS per consumer | Independent retries and DLQs; publisher stays ignorant |
| "Multi-step process with retries" | Step Functions | Declarative retries, compensation, full execution history |
| "Global users complain about latency" | CloudFront, then latency-based Route 53 | Edge TLS and backbone help even at 0% hit ratio |
| "Sessions break when we scale" | ElastiCache or a JWT | State must leave the instance for it to be disposable |
| "Reads are slow, writes are fine" | Index, then cache, then read replica | Cheapest and most reversible first |
| "Millions of writes per second" | DynamoDB (or Kinesis if it is a stream) | Horizontal by key; no single writer |
| "We must never lose data on failover" | Multi-AZ or Aurora — synchronous replication | RPO of zero requires sync; replicas cannot promise it |
| "Protect against deletion and ransomware" | Versioning + cross-account replication + Object Lock | The copy must be somewhere production cannot reach |
| "Query logs and files with SQL" | Athena over partitioned Parquet | No cluster; cost scales with bytes scanned |
| "Private access to an AWS service" | VPC endpoint / PrivateLink | Never traverses the internet; removes NAT cost |
| "Third party needs access to our account" | Cross-account role with `ExternalId` | No shared keys; revocable; confused-deputy safe |
| "Deploy without downtime and roll back fast" | Canary with alarms, or blue/green | And expand/migrate/contract for the schema |
| "Our bill jumped and nothing changed" | Cost Explorer grouped by usage type | It is almost always data transfer or an orphan |

> **Interview**
>
> **The four questions to ask before designing anything.** What is the scale — requests per second, data volume, growth? What is the **RTO and RPO**? What are the read and write access patterns? What are the constraints — budget, compliance, team size, existing systems? Candidates who ask these first design appropriately; candidates who do not tend to propose multi-Region Kubernetes for a service with forty users.

<a id="38-roadmap"></a>

## 38. Practice Roadmap

Reading about AWS produces recognition; building on it produces knowledge. Each project below is deliberately small and adds exactly one new mechanism. Do them in order, in a personal account with a budget alarm set, and tear each one down afterwards.

1. **Secure the account.** Root MFA, no root keys, an IAM Identity Center user for yourself, a budget alert at $10, Cost Anomaly Detection on, CloudTrail on. Half an hour, and it is the habit that matters.
2. **Static site.** S3 + CloudFront with OAC, an ACM certificate in `us-east-1`, a Route 53 alias record. Deploy with hashed filenames and confirm you never need an invalidation.
3. **Build the VPC by hand once.** Three AZs, public and private subnets, IGW, one NAT, route tables, security groups. Then delete it and write it as CloudFormation. The second time teaches more than the first.
4. **Serverless CRUD API.** API Gateway + Lambda + DynamoDB with SAM. Add a GSI for a second access pattern and notice what it costs you to add it late.
5. **Break IAM on purpose.** Create a role with a deliberately narrow policy, watch it fail, and fix it using `simulate-principal-policy`. Then add a bucket policy that denies, and confirm that admin does not help.
6. **Containerise something.** Push an image to ECR, run it on ECS Fargate behind an ALB across three AZs, turn on the deployment circuit breaker, and deliberately deploy a broken image to watch it roll back.
7. **Add asynchrony.** S3 upload → EventBridge → SQS → Lambda → DynamoDB, with a DLQ and an alarm. Kill the consumer mid-message and watch the visibility timeout return it.
8. **Add a database.** RDS PostgreSQL Multi-AZ in private subnets, reached through Session Manager port forwarding. Trigger a failover from the console and time it.
9. **Observe it.** Structured JSON logs, a Logs Insights query for p99 by route, an alarm on p99 with `treatMissingData: breaching`, and X-Ray across the whole chain.
10. **Optimise it.** Add an S3 gateway endpoint and watch the NAT charge fall. Move a Lambda to `arm64`. Set log retention. Add S3 lifecycle rules.
11. **Automate the deployment.** GitHub Actions with OIDC — no stored credentials — building once and promoting the same image digest through two environments.
12. **Break it deliberately.** Terminate an instance, stop a task, revoke a security group rule, fill a disk. Write down what you saw, what alerted, and how long it took to notice. That document is worth more than another tutorial.

<a id="38-1-certifications"></a>

### 38.1 Certifications, if you want them

Certifications are a reasonable syllabus and a poor substitute for building. **Solutions Architect Associate** is the broadest and most useful; **Developer Associate** goes deeper on Lambda, DynamoDB and deployment; **SysOps Associate** on operations and monitoring. The Professional and Specialty exams are genuinely difficult and assume real experience. If you do take one, build each service before you revise it — the questions are scenario-based, and recognition from having actually done it beats memorisation every time.

> **Key idea**
>
> **The habit that compounds fastest.** Every time something on AWS surprises you, write down the mechanism that explains it. "The bucket policy denied it even though I was admin" → explicit deny beats allow. "The response timed out but the request arrived" → NACLs are stateless. "It only fails during deploys" → keep-alive versus idle timeout. Two dozen of those notes and AWS stops surprising you, because you have stopped learning services and started learning the small number of rules underneath them.

---

TechToday Study Library — Amazon Web Services
