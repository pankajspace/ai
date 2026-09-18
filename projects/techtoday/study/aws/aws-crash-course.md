<!--
Source: aws-crash-course.html
Title: AWS Crash Course | TechToday
Description: A visual crash course in AWS — Regions and Availability Zones, IAM policy evaluation, VPCs and security groups, S3, EC2 and Lambda, RDS and DynamoDB, load balancing, SQS and EventBridge, CloudWatch, KMS and infrastructure as code, each explained with a step-by-step animation.
Theme-color: #0b0d10
Stylesheets: aws-study.css, ../../site-header.css
Scripts: aws-study.js
-->

Navigation: [TechToday](../../index.html) · [← AWS Courses](aws-courses.html)

<a id="aws-crash-course"></a>

# Amazon Web Services

AWS has over two hundred services and you need about fifteen of them. This page teaches those fifteen — not as a feature list, but as a set of mechanisms: how a request is authorised, where a packet actually goes, what happens when an Availability Zone dies, why your bill has a line item you cannot explain. Every non-obvious process here is an animation. Press **Play**, then step through it with the arrows; the language tabs switch the same example between boto3, the AWS CLI, the JavaScript SDK and CloudFormation.

> **Key idea**
>
> Four ideas carry almost all of AWS. **Everything is an API call** — the console is just a client, and so is Terraform. **Every API call is authorised the same way**, by the IAM evaluation you will see in section 2. **Everything fails**, so capacity is spread across Availability Zones and you design for one being gone. And **you pay for what is running, not what is used** — which is why an idle NAT Gateway costs more than a busy Lambda function. Learn those four and the two hundred services become variations.

<a id="table-of-contents"></a>

## Table of Contents

1. [Regions, Availability Zones & the Shape of AWS](#1-regions-and-azs)
2. [IAM — Who Can Do What](#2-iam)
3. [The VPC — Where Your Resources Live](#3-vpc)
4. [What You Are Actually Paying For](#4-cost)
5. [S3 — The Default Place to Put Things](#5-s3)
6. [Compute — Lambda, Containers & EC2](#6-compute)
7. [Databases — Choosing and Not Regretting It](#7-databases)
8. [Getting Traffic In — ALB, Route 53 & CloudFront](#8-traffic)
9. [Decoupling — SQS, SNS & EventBridge](#9-messaging)
10. [Observability — Knowing Before Your Users Do](#10-observability)
11. [Security Beyond IAM — KMS, Secrets & Blast Radius](#11-security)
12. [Infrastructure as Code & Deployment](#12-iac)
13. [Building Things That Survive](#13-resilience)
14. [The Whole Thing on One Page](#14-one-page)

<a id="unit-1"></a>

## Unit 1 — The Four Foundations

Four sections that sit underneath everything else: *where* your resources physically are, *who* is allowed to touch them, *what network* they live in, and *how the meter runs*. Every service in Unit 2 is an application of these four. If you skip them, AWS feels like an arbitrary pile of products; if you learn them, most services become predictable before you read their documentation.

<a id="1-regions-and-azs"></a>

### 1. Regions, Availability Zones & the Shape of AWS

> **In plain words**
>
> **In plain English**
>
> AWS is data centres all over the world, rented by the hour. A **Region** is the city you choose to run in (Mumbai, Virginia, Frankfurt). An **Availability Zone** is one of several separate buildings inside that city, each with its own power and network. Running in one building is risky; running in two or three is the normal way to stay up when one has a bad day.

- **Regions** `36+`
- **AZs per Region** `3+`
- **Inter-AZ latency** `< 2 ms`
- **Cross-AZ data** `$0.01/GB each way`

AWS is not one computer somewhere. It is a hierarchy: **Regions** are geographic areas (`us-east-1`, `eu-west-1`, `ap-south-1`), each containing several **Availability Zones**, each of which is one or more physically separate datacentres. Regions are isolated from each other by design — separate API endpoints, separate control planes, separate copies of your data. Nothing replicates across a Region boundary unless you deliberately set it up, and that isolation is a feature: it is what stops a bad day in Virginia from being a bad day everywhere.

> **Analogy** 🏢
>
> **Picture it — a company with offices in several cities**
>
> A **Region** is a city. Each city has several **office buildings** a few kilometres apart — those are the Availability Zones. The buildings have separate power supplies and separate flood risk, but a dedicated fibre link between them, so staff in different buildings can work on the same document in real time. If a building loses power, work continues in the other two. If the whole city floods, that is a different kind of event and you need an office in another city — which costs a great deal more to keep staffed, which is exactly why multi-Region is a decision and multi-AZ is a default.

> **Interactive animation:** `regions-az` — rendered by the page script in the HTML version.

- **Strength — independent failure is engineered, not hoped for** AZs are far enough apart to fail separately and close enough to replicate synchronously. That combination is difficult and expensive to build yourself, and it is why "spread across three AZs" is a checkbox on AWS and a project on-premises.
- **Weakness — the boundaries are invisible until they bill you** Traffic between AZs costs a cent per gigabyte in each direction. A chatty microservice mesh spread evenly across three AZs can spend more on cross-AZ transfer than on the instances doing the work, and nothing in the console warns you.

**Interview question**

*Your application runs on three EC2 instances behind a load balancer, all in `us-east-1a`. Someone asks you to "make it highly available". What do you change, and what does it cost?*

The instructive part of this question is that the answer is not "add more instances" — you already have three. The answer is that all three share a single failure domain, so three instances give you exactly the availability of one datacentre. You move them to `1a`, `1b` and `1c`, enable the load balancer in all three subnets, and make sure the Auto Scaling group is set to balance across them. The cost is cross-AZ traffic between the load balancer and the targets, plus any chatter between your own instances — usually small, but worth measuring before you spread a database tier the same way.

**Where am I running? — list your AZs and check the spread**

```bash
# which AZs exist in this Region, and are any constrained?
aws ec2 describe-availability-zones \
  --query 'AvailabilityZones[].{AZ:ZoneName,State:State,ID:ZoneId}' \
  --output table

# how are my running instances actually spread?
aws ec2 describe-instances \
  --filters Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].Placement.AvailabilityZone' \
  --output text | tr '\t' '\n' | sort | uniq -c
```

```python
import boto3
from collections import Counter

ec2 = boto3.client("ec2", region_name="us-east-1")

# AZ names are per-account aliases; ZoneId is the stable physical identifier.
# Two accounts' "us-east-1a" are usually different datacentres.
for az in ec2.describe_availability_zones()["AvailabilityZones"]:
    print(az["ZoneName"], az["ZoneId"], az["State"])

spread = Counter()
for page in ec2.get_paginator("describe_instances").paginate(
    Filters=[{"Name": "instance-state-name", "Values": ["running"]}]
):
    for res in page["Reservations"]:
        for inst in res["Instances"]:
            spread[inst["Placement"]["AvailabilityZone"]] += 1

print(spread)          # Counter({'us-east-1a': 3}) is the finding
```

> **Warning**
>
> **The AZ name is a lie, and knowing that will save you an argument.** `us-east-1a` in your account and `us-east-1a` in a colleague's account are almost certainly different physical datacentres — AWS randomises the mapping per account so that everyone does not pile into "the first one". The stable identifier is the **AZ ID** (`use1-az4`). If you are coordinating placement across accounts — for a shared VPC, or to keep a workload in the same physical AZ as its data — use the AZ ID, never the name.

> **Tip**
>
> Three edge concepts sit outside this hierarchy and are worth recognising by name. **Local Zones** put compute in a metro area far from the parent Region for single-digit latency. **Wavelength Zones** do the same inside telco 5G networks. **Edge locations** (600+ of them) are not for your code at all — they run CloudFront and Route 53. If a question mentions "closer to the user", the answer is usually an edge location, not a new Region.

<a id="2-iam"></a>

### 2. IAM — Who Can Do What

> **In plain words**
>
> **In plain English**
>
> IAM is the doorkeeper for everything on AWS. Every click, script, and service-to-service call is checked against written rules before it is allowed. Nothing is permitted until a rule says it is, and a single "no" beats every "yes". Most AWS problems that look mysterious are really an IAM rule you have not read yet.

- **Default** `deny`
- **Explicit deny** `always wins`
- **Role session** `15 min – 12 h`
- **Cost** `free`

Every single thing that happens on AWS is an API call, and every API call passes through IAM. That is worth sitting with for a moment: clicking a button in the console, running `terraform apply`, a Lambda function reading from DynamoDB, one service calling another — all of them are signed requests evaluated by the same engine against the same rules. There is no side door. Which means that once you understand how IAM reaches a decision, you can debug *any* permission problem on AWS with the same procedure.

> **Analogy** 🛂
>
> **Picture it — a building with several security desks in a row**
>
> You walk toward a meeting room. At the first desk they check who you are. At the second, a supervisor checks a list of people banned from the building today — and if you are on it, nothing else matters, you are out, even if you are the CEO. At the third desk they check whether your *company* is permitted in this building at all. At the fourth, whether the room's own booking sheet lists you. At the fifth, whether your badge grants that floor. At the sixth, whether your contract caps what your badge may ever open. Only after all six do you get in — and if *nobody* ever put you on a list, you are turned away by default, politely, with no explanation. That is IAM, exactly, in that order.

> **Interactive animation:** `iam-evaluation` — rendered by the page script in the HTML version.

A policy is JSON, and it has four parts worth knowing by sight: the `Effect` (`Allow` or `Deny`), the `Action` (which API calls), the `Resource` (which ARNs), and an optional `Condition` (under what circumstances). The `Condition` block is where policies stop being crude on/off switches and start being useful — require MFA, require a specific VPC endpoint, require the request to come from a particular Region.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadTheReportsPrefixOnly",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::acme-reports/2026/*",
      "Condition": {
        "Bool": { "aws:SecureTransport": "true" },
        "StringEquals": { "aws:PrincipalTag/team": "analytics" }
      }
    },
    {
      "Sid": "ListingNeedsTheBucketArnNotTheObjectArn",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::acme-reports",
      "Condition": { "StringLike": { "s3:prefix": "2026/*" } }
    }
  ]
}
```

The second half of IAM is **roles**, and roles are the part that separates people who are comfortable on AWS from people who are not. A role is a set of permissions with no permanent credentials attached. You do not log in as a role; you *assume* it, and STS hands you credentials that expire. Every runtime on AWS has a way to receive a role automatically, which means that in a well-built account there is no long-lived access key anywhere at all.

> **Interactive animation:** `assume-role` — rendered by the page script in the HTML version.

- **Strength — temporary by construction** A leaked role session is worth an hour. A leaked IAM user access key is worth however long it takes someone to notice, which historically is measured in months. Roles turn the worst-case credential leak from a catastrophe into an incident.
- **Weakness — the error messages are deliberately vague** `AccessDenied` rarely tells you which of the six gates rejected you, because saying so would leak information to an attacker. You need the procedure below rather than intuition.

**Interview question**

*A Lambda function gets `AccessDenied` writing to an S3 bucket. You attach `AdministratorAccess` to its execution role and it *still* fails. What is going on, and how do you find out?*

This is the one scenario that tells you an explicit `Deny` is involved, because adding permissions cannot defeat a Deny — the deny sweep happens before any Allow is read. There are only four places it can come from: a service control policy on the account's OU, the bucket's own resource policy, a permissions boundary on the role, or a VPC endpoint policy if the traffic goes through one. Check them in that order. In practice the two most common culprits are an SCP restricting Regions or unencrypted writes, and a bucket policy that denies anything not arriving through a specific VPC endpoint. The fastest tool is the IAM policy simulator, which will name the statement that produced the decision.

**Debugging a denial — simulate, then read the actual identity**

```bash
# 1. who does AWS think I am right now?
aws sts get-caller-identity

# 2. simulate the exact call - this names the deciding statement
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/report-writer \
  --action-names s3:PutObject \
  --resource-arns 'arn:aws:s3:::acme-reports/2026/q1.csv'

# 3. if that says allowed but reality says denied, look outward
aws s3api get-bucket-policy --bucket acme-reports
aws organizations list-policies-for-target --target-id ou-ab12-cdef3456 \
  --filter SERVICE_CONTROL_POLICY
```

```python
import boto3

sts = boto3.client("sts")
print(sts.get_caller_identity())     # Arn tells you the assumed-role session

iam = boto3.client("iam")
result = iam.simulate_principal_policy(
    PolicySourceArn="arn:aws:iam::123456789012:role/report-writer",
    ActionNames=["s3:PutObject"],
    ResourceArns=["arn:aws:s3:::acme-reports/2026/q1.csv"],
)
for r in result["EvaluationResults"]:
    print(r["EvalActionName"], r["EvalDecision"])
    # "explicitDeny" here means stop looking at identity policies
    for stmt in r.get("MatchedStatements", []):
        print("   matched:", stmt["SourcePolicyId"], stmt["SourcePolicyType"])
```

> **Key idea**
>
> **The rules, compressed.** Deny by default. One explicit `Deny` anywhere beats every `Allow`. Identity policies say what a principal may do; resource policies say who may touch a resource, and are the only way to grant cross-account access directly. SCPs and permissions boundaries only ever *subtract*. And the effective permission is the intersection of all of them — never the union.

> **Warning**
>
> **The habits that matter more than the theory.** Never create an IAM user with an access key unless you have exhausted every alternative — use IAM Identity Center for humans, instance profiles and execution roles for workloads, and OIDC federation for CI. Turn on MFA for the root user, put its credentials in a safe, and never use it again. And grant permissions with `Resource` ARNs rather than `"*"`: the difference between `s3:GetObject` on one prefix and `s3:*` on everything is the difference between an incident and a breach.

<a id="3-vpc"></a>

### 3. The VPC — Where Your Resources Live

> **In plain words**
>
> **In plain English**
>
> A VPC is your own private network inside AWS — a fenced plot of land that nobody else shares. Inside it you create **subnets** (rooms): public ones that can reach the internet, private ones that cannot. **Security groups** are the guards on each door, deciding which traffic gets in. If two things cannot talk to each other on AWS, the answer is almost always in here.

- **Typical CIDR** `10.0.0.0/16`
- **Subnet** `1 AZ, always`
- **Reserved per subnet** `5 IPs`
- **NAT Gateway** `~$32/mo + data`

A **VPC** is a logically isolated network inside AWS with an IP range you choose. Almost everything with an IP address lives in one: EC2 instances, RDS databases, Fargate tasks, Lambda functions attached to a VPC, load balancers. The three things you configure are the **address space** (the CIDR and its subnets), the **routes** (where packets go), and the **filters** (security groups and network ACLs). Almost every "it cannot connect" problem on AWS is one of those three, and the animation below shows how they compose.

> **Analogy** 🏘️
>
> **Picture it — a gated housing estate**
>
> The **VPC** is the estate wall and its range of house numbers. **Subnets** are the streets, and each street is entirely within one part of town (one AZ). The **route table** is the signpost at the end of each street: streets with a sign pointing to the main gate are "public"; streets without one are private, and residents there simply have no way out. The **NAT Gateway** is a courier who lives on a public street and will fetch parcels for private residents — but will not let strangers in. The **security group** is the lock on each individual front door, and the **network ACL** is a guard at the entrance to the street who checks everyone, in both directions, with no memory of who they let through a minute ago.

> **Interactive animation:** `vpc-anatomy` — rendered by the page script in the HTML version.

Now the filters. AWS gives you two and they behave completely differently — one has memory and one does not. Ninety-five percent of your work happens in security groups; NACLs exist for the blunt, subnet-wide cases. Run both variants of the animation and watch what happens to the *response* packet.

> **Interactive animation:** `sg-vs-nacl` — rendered by the page script in the HTML version.

- **Strength — security groups reference each other** Writing `allow 5432 from sg-app` instead of `allow 5432 from 10.0.11.0/24` means the rule keeps working as instances scale, get replaced and change IP. It also documents your architecture: reading the security groups tells you which tier talks to which.
- **Weakness — a private subnet is not free** The moment private resources need to reach the internet you are paying for NAT Gateways, one per AZ for real availability, plus a per-gigabyte processing charge. This is the most common six-figure surprise in a growing AWS bill, and VPC endpoints remove most of it.

**Interview question**

*An EC2 instance in a private subnet cannot reach the internet. Walk through your diagnosis.*

Work outward from the instance, because that is the order the packet experiences things and each step rules out a whole class of cause. First, the **route table** associated with that subnet — is there a `0.0.0.0/0` route, and does it point at a NAT Gateway rather than an Internet Gateway? A private subnet routed to an IGW cannot work, because the instance has no public IP for return traffic. Second, the **NAT Gateway itself** — is it in a *public* subnet, and does *that* subnet route to the IGW? A NAT Gateway placed in a private subnet is a common and silent mistake. Third, the **security group** — outbound rules are usually wide open by default, but a hardened one may not allow 443. Fourth, the **NACL** — check both directions, including the ephemeral port range for return traffic. Finally DNS: `enableDnsSupport` and `enableDnsHostnames` on the VPC. VPC Reachability Analyzer will do this whole walk for you and name the blocking component.

**Let AWS trace the path instead of guessing**

```bash
# ask AWS to prove whether a path exists, and where it breaks
aws ec2 create-network-insights-path \
  --source i-0abc123 --destination-port 443 \
  --destination igw-0def456 --protocol tcp

aws ec2 start-network-insights-analysis \
  --network-insights-path-id nip-0123456789

aws ec2 describe-network-insights-analyses \
  --network-insights-analysis-ids nia-0123456789 \
  --query 'NetworkInsightsAnalyses[0].{Reachable:NetworkPathFound,Blocked:Explanations[0]}'

# the manual version: what does this subnet's route table say?
aws ec2 describe-route-tables \
  --filters Name=association.subnet-id,Values=subnet-0abc123 \
  --query 'RouteTables[].Routes'
```

```yaml
# The shape you want: public subnet routes to the IGW,
# private subnet routes to a NAT that lives in the public subnet.
PublicRoute:
  Type: AWS::EC2::Route
  Properties:
    RouteTableId: !Ref PublicRouteTable
    DestinationCidrBlock: 0.0.0.0/0
    GatewayId: !Ref InternetGateway

NatGateway:
  Type: AWS::EC2::NatGateway
  Properties:
    SubnetId: !Ref PublicSubnetA        # public, or nothing works
    AllocationId: !GetAtt NatEip.AllocationId

PrivateRoute:
  Type: AWS::EC2::Route
  Properties:
    RouteTableId: !Ref PrivateRouteTable
    DestinationCidrBlock: 0.0.0.0/0
    NatGatewayId: !Ref NatGateway

# and the line that deletes most of your NAT bill:
S3Endpoint:
  Type: AWS::EC2::VPCEndpoint
  Properties:
    VpcId: !Ref Vpc
    ServiceName: !Sub com.amazonaws.${AWS::Region}.s3
    VpcEndpointType: Gateway
    RouteTableIds: [!Ref PrivateRouteTable]
```

> **Warning**
>
> **Choose the CIDR as if you will never change it, because you effectively cannot.** You can add secondary ranges to a VPC but you cannot shrink or renumber the primary one, and subnets are immutable. Two VPCs with overlapping ranges cannot be peered, ever — which turns a thoughtless `10.0.0.0/16` in every account into a migration project the day someone wants a Transit Gateway. Allocate ranges centrally, leave gaps, and use a `/16` per VPC with `/20` subnets unless you have a reason not to.

> **Tip**
>
> Two VPC features punch far above their weight. **VPC endpoints** let private resources reach AWS services without a NAT Gateway — gateway endpoints for S3 and DynamoDB are free and should be in every VPC you build. **VPC Flow Logs** record accepted and rejected connections and are the only way to answer "did the packet arrive and get rejected, or never arrive at all?" — a distinction that turns an afternoon of guessing into a two-minute query.

<a id="4-cost"></a>

### 4. What You Are Actually Paying For

> **In plain words**
>
> **In plain English**
>
> AWS is a metered utility: you pay for what is *switched on*, not for what you actually use. A server nobody visits still bills by the hour, a disk still bills whether it is full or empty, and moving data *out* of AWS costs money while moving it in is free. Surprise bills are nearly always idle resources and data transfer, not the thing you were focused on.

- **Savings Plan** `up to 66% off`
- **Spot** `up to 90% off`
- **Data in** `free`
- **Data out** `~$0.09/GB`

Cost is not a finance topic on AWS, it is an architecture topic — because the pricing model is what makes one design better than another. Serverless is attractive partly because it charges nothing when idle. Multi-AZ costs money in cross-zone transfer. A queue is cheaper than the extra instances you would need to absorb the same spike. You cannot design well on AWS while treating the bill as somebody else's problem, and the good news is that the model is simple: you pay for **resources that exist**, **requests that are made**, and **bytes that move**.

> **Analogy** 🚕
>
> **Picture it — a taxi meter that runs while parked**
>
> On-Demand is hailing a taxi: no commitment, highest rate, and the meter runs whether or not you are moving. A **Savings Plan** is a monthly travel pass — you promise to spend a certain amount and get a discount on everything, whichever taxi you take. **Spot** is riding with a driver heading that way anyway: ninety percent off, and they can drop you at the next corner with two minutes' notice. And the thing that catches everyone: an **idle** resource still runs the meter. A stopped EC2 instance still bills for its EBS volume; an unattached Elastic IP bills precisely *because* nothing is using it.

> **Interactive animation:** `pricing-models` — rendered by the page script in the HTML version.

- **Strength — the discount for commitment is enormous and easy** A Compute Savings Plan is one purchase, applies automatically across EC2, Fargate and Lambda in any Region and family, and needs no changes to your infrastructure. For any workload with a stable baseline it is close to free money, and the analysis takes twenty minutes in Cost Explorer.
- **Weakness — the bill hides its own causes** The line items are usage types, not applications. Without a consistent tagging policy applied from day one, "which team spent this?" is unanswerable, and cost allocation tags cannot be applied retroactively to data you have already been billed for.

**Interview question**

*Your bill jumped 40% this month with no traffic increase and no deployments. Where do you look first?*

Not at instance sizes. Open Cost Explorer, set the granularity to daily, and group by **usage type** rather than by service — grouping by service tells you "EC2 went up", which you already knew, while usage type tells you *which meter* moved. In practice the step-change causes cluster into a short list: `NatGateway-Bytes` (someone routed a large data flow through NAT instead of a VPC endpoint), `DataTransfer-Regional-Bytes` (a service moved and is now chatting across AZs), CloudWatch Logs ingestion (debug logging left on after an incident), unattached EBS volumes and snapshots accumulating from an autoscaling group that replaces instances, or a Savings Plan that quietly expired. AWS Cost Anomaly Detection will find most of these before you do, if you turn it on.

**Find the meter that moved**

```python
import boto3

ce = boto3.client("ce", region_name="us-east-1")   # Cost Explorer is global-ish

resp = ce.get_cost_and_usage(
    TimePeriod={"Start": "2026-02-01", "End": "2026-03-01"},
    Granularity="DAILY",
    Metrics=["UnblendedCost"],
    # USAGE_TYPE is the useful dimension: it names the meter, not the product
    GroupBy=[{"Type": "DIMENSION", "Key": "USAGE_TYPE"}],
)

for day in resp["ResultsByTime"]:
    rows = sorted(
        day["Groups"],
        key=lambda g: float(g["Metrics"]["UnblendedCost"]["Amount"]),
        reverse=True,
    )[:3]
    top = ", ".join(f"{r['Keys'][0]} ${float(r['Metrics']['UnblendedCost']['Amount']):.2f}"
                    for r in rows)
    print(day["TimePeriod"]["Start"], top)
```

```bash
# the five things worth checking on any account, right now

# 1. unattached EBS volumes - billed at full price for nothing
aws ec2 describe-volumes --filters Name=status,Values=available \
  --query 'Volumes[].{Id:VolumeId,GB:Size,Created:CreateTime}' --output table

# 2. unassociated Elastic IPs - charged precisely because they are idle
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==`null`].PublicIp'

# 3. log groups with no retention set - they keep data forever
aws logs describe-log-groups \
  --query 'logGroups[?retentionInDays==`null`].logGroupName'

# 4. how much NAT is actually costing
aws ce get-cost-and-usage --time-period Start=2026-02-01,End=2026-03-01 \
  --granularity MONTHLY --metrics UnblendedCost \
  --filter '{"Dimensions":{"Key":"USAGE_TYPE","Values":["NatGateway-Bytes"]}}'

# 5. old snapshots nobody owns
aws ec2 describe-snapshots --owner-ids self \
  --query 'length(Snapshots)'
```

> **Tip**
>
> **The five-minute setup every account should have.** A budget with an email alert at 80% of expected spend. Cost Anomaly Detection enabled. Log group retention set to something finite — the default is "forever", and CloudWatch Logs storage quietly becomes a top-five line item. A tagging policy with at least `owner`, `env` and `service`, activated as cost allocation tags. And S3 lifecycle rules that abort incomplete multipart uploads after seven days.

<a id="unit-2"></a>

## Unit 2 — The Services You Touch Every Week

Five sections covering the services that make up almost every application on AWS: somewhere to put objects, somewhere to run code, somewhere to put records, a way to get traffic in, and a way to keep the pieces from depending on each other. Each one has a decision at its heart — which storage class, which compute model, which database, which load balancer, which messaging service — and each section is built around making that decision well rather than listing features.

<a id="5-s3"></a>

### 5. S3 — The Default Place to Put Things

> **In plain words**
>
> **In plain English**
>
> S3 is unlimited file storage on the internet. You put a file into a **bucket**, it gets an address, and AWS quietly keeps several copies across different buildings so it does not get lost. It is cheap, it never fills up, and it is where uploads, backups, images, videos, logs and analytics data all end up. It is *not* a disk and not a database — you read and write whole objects, not parts of them.

- **Durability** `11 nines`
- **Max object** `5 TB`
- **Standard** `$0.023/GB-mo`
- **Deep Archive** `$0.00099/GB-mo`

S3 is object storage: a flat namespace of keys mapped to blobs, reachable over HTTP, with no filesystem semantics underneath. There are no directories — `reports/2026/q1.csv` is a single key that happens to contain slashes, and the console's folder view is a convenience built from key prefixes. There is no partial write and no append; you replace the whole object or you do not. Accepting that S3 is not a disk is the difference between using it well and fighting it.

> **Analogy** 🏛️
>
> **Picture it — a coat check, not a wardrobe**
>
> You hand over a coat and get a ticket. You cannot reach into the back and adjust a sleeve; you can only hand in a whole coat and get a whole coat back. The attendant will keep it essentially forever, will copy it into three separate buildings so a fire cannot destroy it, and will charge you almost nothing per day. But if you want to change a button, you take the whole coat out, change it, and hand the whole thing back — which is exactly why S3 is a superb place for logs, images, backups and data lakes, and a poor place for anything you want to edit in place.

> **Interactive animation:** `s3-durability` — rendered by the page script in the HTML version.

The second half of S3 is cost management, and it is almost entirely automatic once configured. An object's access pattern nearly always decays over time, and **lifecycle rules** move it down the storage-class ladder as it does — each step cheaper to store and slower or dearer to retrieve.

> **Interactive animation:** `s3-lifecycle` — rendered by the page script in the HTML version.

- **Strength — it scales without you thinking about it** There is no capacity to provision, no filesystem to grow, no sharding to plan. A bucket holding four objects and a bucket holding four billion are operated identically, and S3 will happily serve tens of thousands of requests per second per prefix.
- **Weakness — every request is a network round trip** Listing a million keys means a thousand paginated API calls. Reading ten thousand small files is ten thousand round trips, which is why analytics on S3 uses columnar formats and large files — and why "just put the small files in S3" is a performance trap.

**Interview question**

*How do you let a browser upload a 2 GB video directly to S3 without the file passing through your server, and without making the bucket public?*

A **presigned URL**. Your backend, which holds credentials, generates a URL that embeds a signature and an expiry; the browser `PUT`s straight to S3 using it. Your server never handles the bytes, so it needs no bandwidth and no large request limits, and the bucket stays private because the signature carries the authorisation. For a file this size you would use a **multipart upload** — presign each part, upload them in parallel with retries per part, then complete. The subtleties worth mentioning: the URL inherits the permissions of whoever signed it, so sign with a narrowly scoped role; set a short expiry; and pin the content type and a maximum size in the signed conditions so nobody uploads a 40 GB file to the key you offered.

**Presigned upload — generate on the server, use in the browser**

```python
import boto3

s3 = boto3.client("s3")

# Simple case: one PUT, expires in 15 minutes.
url = s3.generate_presigned_url(
    "put_object",
    Params={
        "Bucket": "acme-uploads",
        "Key": "raw/user-42/clip.mp4",
        "ContentType": "video/mp4",
        # forces server-side encryption; the client must send the header too
        "ServerSideEncryption": "aws:kms",
    },
    ExpiresIn=900,
)

# Better for browsers: a POST policy can cap the size, which a PUT URL cannot.
post = s3.generate_presigned_post(
    Bucket="acme-uploads",
    Key="raw/user-42/${filename}",
    Fields={"Content-Type": "video/mp4"},
    Conditions=[
        {"Content-Type": "video/mp4"},
        ["content-length-range", 1, 2_147_483_648],   # 1 byte .. 2 GB
    ],
    ExpiresIn=900,
)
print(post["url"], post["fields"])
```

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

// server side
const url = await getSignedUrl(
  s3,
  new PutObjectCommand({
    Bucket: "acme-uploads",
    Key: "raw/user-42/clip.mp4",
    ContentType: "video/mp4",
  }),
  { expiresIn: 900 }
);

// browser side - no credentials involved, the signature is the authorisation
await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": "video/mp4" },  // must match exactly, or 403
  body: file,
});
```

> **Warning**
>
> **The four settings that prevent the headline.** Leave **Block Public Access** on at the account level — every "company leaks data in S3 bucket" story is this setting turned off. Turn on **versioning**, because it is the only thing that survives an overwrite or a delete. Turn on **default encryption** (it is on by default for new buckets now, but verify). And serve public content through **CloudFront with an Origin Access Control** rather than by making the bucket readable — you get caching, a WAF, and logs, and the bucket stays private.

> **Tip**
>
> Three S3 features that solve problems people usually solve with code. **S3 Select** and **Athena** run SQL against objects in place, so you do not download a 5 GB CSV to count rows. **Event notifications** fire a Lambda, SQS or EventBridge event on upload, which is the backbone of most ingestion pipelines. And **Storage Lens** tells you, for free, which prefixes are large, cold and costing you money.

<a id="6-compute"></a>

### 6. Compute — Lambda, Containers & EC2

> **In plain words**
>
> **In plain English**
>
> Compute is simply "where your code runs", and AWS gives you three sizes of it. **Lambda** runs one function when something triggers it and charges only for those milliseconds. **Containers** (ECS/Fargate) run your packaged app continuously without you touching servers. **EC2** hands you a plain virtual machine and everything on it is yours to look after. The real choice is how much maintenance you want to own.

- **Lambda max** `15 min, 10 GB`
- **Fargate start** `~30–60 s`
- **Graviton** `~20% cheaper`
- **Spot** `up to 90% off`

AWS gives you a ladder of compute options that trade operational burden against control. At the top you write a function and AWS does everything else; at the bottom you get a virtual machine and a bill. The mistake is to pick by familiarity rather than by constraint — teams reach for Kubernetes because it is what they know, and inherit a platform to operate that their workload never required. The useful method is elimination, not comparison.

> **Interactive animation:** `compute-choice` — rendered by the page script in the HTML version.

> **Analogy** 🍽️
>
> **Picture it — catering**
>
> **Lambda** is a vending machine: you press a button, food appears, you pay per item, and there is nothing to clean. **Fargate** is a food truck that you stock — you decide the menu and the recipes, someone else owns and maintains the truck. **EC2** is a kitchen you rent: total control over the ovens, and every gas inspection, cleaning rota and broken extractor fan is yours. All three feed people. The question is never which is best, it is how much kitchen your meal actually needs.

Lambda deserves its own mental model, because its performance characteristics are unlike a server's. The unit is not a machine but a **sandbox**, one request at a time, created on demand and reused while traffic continues. Everything people find surprising about Lambda — cold starts, why globals are shared, why concurrency limits matter more than CPU — falls out of that one fact.

> **Interactive animation:** `lambda-lifecycle` — rendered by the page script in the HTML version.

At the other end of the ladder, EC2's answer to variable load is the **Auto Scaling group**: a launch template, a minimum, a maximum, and a policy that adds and removes instances to hold a metric at a target. It is a control loop, and like any control loop it is only as good as its feedback and its response time.

> **Interactive animation:** `autoscaling` — rendered by the page script in the HTML version.

- **Strength — serverless removes an entire job** No patching, no capacity planning, no scaling policy, no bill when idle. For event-driven and spiky workloads the operational saving dwarfs any compute-price comparison, and it is available to a team of one.
- **Weakness — the limits are hard, not soft** Fifteen minutes is fifteen minutes. No GPU is no GPU. A 250 MB unzipped package is a real ceiling. And a Lambda in a VPC talking to an RDS instance will exhaust the connection pool long before it exhausts the database — which is what RDS Proxy exists to fix.

**Interview question**

*A Lambda function processes S3 uploads. It works fine normally, but during a nightly batch of 5,000 files it starts timing out and the downstream API returns `ThrottlingException`. What is happening and how do you fix it?*

Two separate problems that look like one. First, 5,000 near-simultaneous S3 events mean Lambda creates thousands of concurrent sandboxes — most of them cold, all of them hammering the downstream API at once. Lambda scales *faster* than your dependencies, which is a liability as often as it is a feature. The fix is a buffer and a brake: put an SQS queue between S3 and the function so events are absorbed rather than amplified, then set the event source mapping's batch size and, critically, set **reserved concurrency** on the function to a number the downstream API can survive. Second, the timeouts: check whether the function is retrying internally without a total time budget, and whether the visibility timeout on the queue is at least six times the function timeout — if it is not, you are also doing duplicate work.

**Buffer the spike, then cap the concurrency**

```yaml
Resources:
  # S3 -> SQS -> Lambda, so a burst becomes a backlog instead of a stampede
  UploadQueue:
    Type: AWS::SQS::Queue
    Properties:
      VisibilityTimeout: 180              # >= 6x the function timeout
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt UploadDlq.Arn
        maxReceiveCount: 3

  UploadDlq:
    Type: AWS::SQS::Queue
    Properties:
      MessageRetentionPeriod: 1209600     # 14 days to investigate

  Processor:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: python3.12
      Handler: app.handler
      Timeout: 30
      MemorySize: 1024                    # more memory = more CPU = shorter run
      Architectures: [arm64]              # Graviton: ~20% cheaper
      ReservedConcurrentExecutions: 20    # the brake on the downstream API
      Events:
        Batch:
          Type: SQS
          Properties:
            Queue: !GetAtt UploadQueue.Arn
            BatchSize: 10
            FunctionResponseTypes: [ReportBatchItemFailures]
```

```python
import json
import os
import boto3

# Module scope: created once per sandbox, reused by every later invocation.
# Putting this inside the handler is the most common Lambda performance bug.
ddb = boto3.resource("dynamodb")
table = ddb.Table(os.environ["TABLE"])

def handler(event, context):
    failures = []
    for record in event["Records"]:
        try:
            body = json.loads(record["body"])
            # Conditional write makes a redelivery harmless - SQS is
            # at-least-once, so this WILL be called twice eventually.
            table.put_item(
                Item={"pk": body["key"], "size": body["size"]},
                ConditionExpression="attribute_not_exists(pk)",
            )
        except table.meta.client.exceptions.ConditionalCheckFailedException:
            pass                                  # already processed, fine
        except Exception:
            # Report only the failed messages; the rest are deleted.
            failures.append({"itemIdentifier": record["messageId"]})

    return {"batchItemFailures": failures}
```

> **Key idea**
>
> **The lever nobody expects on Lambda is memory.** CPU is allocated in proportion to memory, so going from 512 MB to 1,024 MB often halves the duration — and since you are billed in GB-seconds, the cost stays flat while latency improves. The smallest memory setting is almost never the cheapest. Measure with AWS Lambda Power Tuning before you assume.

> **Warning**
>
> **Two things that silently break autoscaling.** A health check that hits `/` instead of a real readiness endpoint will keep a broken instance in service forever. And any state on local disk — sessions, uploaded files, a SQLite database — means scaling in destroys user data. Autoscaling assumes instances are interchangeable and disposable; if yours are not, the group will still add capacity, it will just also lose things.

<a id="7-databases"></a>

### 7. Databases — Choosing and Not Regretting It

> **In plain words**
>
> **In plain English**
>
> This is where your structured data lives, and there are two families. **RDS and Aurora** are ordinary SQL databases (PostgreSQL, MySQL) that AWS patches, backs up and fails over for you — you can ask them any question later. **DynamoDB** is a key-value store that stays fast at any size but only answers the questions you designed for up front. Choose by the queries you will need, because changing your mind later is expensive.

- **RDS failover** `60–120 s`
- **Aurora replicas** `up to 15`
- **DynamoDB latency** `single-digit ms`
- **Partition ceiling** `3k RCU / 1k WCU`

The database decision is the hardest one to reverse, so it deserves more thought than the compute decision that usually gets it. The honest default is **a relational database** — RDS or Aurora running PostgreSQL — because SQL, joins, transactions and ad-hoc queries are worth a great deal and you rarely know your access patterns on day one. Choose DynamoDB when you *do* know them, when they are simple and stable, and when you need scale or latency that a single writer cannot give you.

> **Analogy** 📚
>
> **Picture it — a library versus a left-luggage locker room**
>
> A **relational database** is a library with a catalogue. You can ask questions nobody anticipated — every book by this author published before 1990, cross-referenced with loans — and the librarian will work it out, slowly if necessary. A **key-value store** is a room of numbered lockers. Give the number, get the contents, instantly, for any number of lockers and any number of people. Ask "which lockers contain something red?" and there is no answer except opening all of them. DynamoDB is spectacular when you always know the locker number and a liability when you do not.

> **Interactive animation:** `rds-failover` — rendered by the page script in the HTML version.

If you do choose DynamoDB, everything depends on the **partition key**. It is not an index you can add later — it determines the physical placement of every item, and a key with poor cardinality produces a table that throttles at a fraction of its provisioned capacity.

> **Interactive animation:** `dynamodb-partition` — rendered by the page script in the HTML version.

- **Strength — Aurora gives you relational without the operational cliff** A storage layer spread across three AZs, up to fifteen read replicas sharing it, failover in seconds rather than minutes, and backups that do not touch performance. It is PostgreSQL or MySQL compatible, so the migration is usually a connection string.
- **Weakness — DynamoDB punishes late requirements** A new access pattern means a new global secondary index, a backfill, and often a rethink of the key design. In SQL the same request is `CREATE INDEX` and an afternoon. The scale is real, but you buy it with flexibility.

**Interview question**

*Your PostgreSQL database on RDS is at 90% CPU. Reads are slow, writes are fine. List your options in order.*

Cheapest and most reversible first. **Find the query** — turn on Performance Insights, look at the top statements by total time, and check for a missing index or an accidental sequential scan; a single index has resolved more of these than every other option combined. **Add a cache** — if the same rows are read repeatedly, ElastiCache in front of the database removes the load entirely rather than absorbing it. **Add a read replica** and point reporting and analytics traffic at it, accepting that replica lag means it is eventually consistent. **Scale up** the instance class, which is a ten-minute failover and buys time but not a solution. And only then consider **sharding or moving to Aurora**, which are projects. Notice that "the database is too small" is the last hypothesis, not the first — it usually is not.

**Read the pressure before you spend money on it**

```bash
# what is the database actually spending its time on?
aws pi get-resource-metrics \
  --service-type RDS \
  --identifier db-ABCDEFGHIJKLMNOP \
  --metric-queries '[{"Metric":"db.load.avg","GroupBy":{"Group":"db.sql_tokenized"}}]' \
  --start-time 2026-02-10T00:00:00Z --end-time 2026-02-10T06:00:00Z \
  --period-in-seconds 300

# connections, not CPU, is often the real ceiling
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=prod-pg \
  --start-time 2026-02-10T00:00:00Z --end-time 2026-02-10T06:00:00Z \
  --period 300 --statistics Maximum
```

```python
import boto3

# DynamoDB's equivalent question: is one partition hot?
# Enable CloudWatch Contributor Insights on the table, then read the top keys.
ddb = boto3.client("dynamodb")
ddb.update_contributor_insights(
    TableName="orders",
    ContributorInsightsAction="ENABLE",
)

# And the query shape that matters: Query, never Scan.
res = boto3.resource("dynamodb").Table("orders").query(
    KeyConditionExpression=(
        boto3.dynamodb.conditions.Key("pk").eq("USER#42")
        & boto3.dynamodb.conditions.Key("sk").begins_with("ORDER#2026-02")
    ),
    # ask for what you need; RCUs are charged on bytes read, not returned
    ProjectionExpression="sk, #t, #s",
    ExpressionAttributeNames={"#t": "total", "#s": "status"},
)
print(res["Count"], res["ConsumedCapacity"] if "ConsumedCapacity" in res else "")
```

> **Tip**
>
> **A rough map of the rest.** `ElastiCache` (Redis or Valkey) for caching and sessions. `DocumentDB` for MongoDB workloads you are migrating. `Neptune` for graphs. `Timestream` for time series. `OpenSearch` for full-text search and log analytics. `Redshift` for a warehouse; `Athena` when the data is already in S3 and you want SQL without a cluster. Most applications need exactly one of these alongside a relational database, and adding a second is a decision worth defending.

> **Warning**
>
> **Multi-AZ is not a backup and a read replica is not a backup.** Both replicate your mistakes perfectly and immediately. Automated backups with a retention period, plus point-in-time recovery, plus an occasional restore test, are the backup. The restore test is the part that gets skipped and the part that matters — an untested backup is a hypothesis.

<a id="8-traffic"></a>

### 8. Getting Traffic In — ALB, Route 53 & CloudFront

> **In plain words**
>
> **In plain English**
>
> Three services get a user's browser to your code. **Route 53** is the phone book: it turns your domain name into an address. **CloudFront** is a network of local branches that keeps copies of your pages, images and videos close to the user so they load fast. The **load balancer** is the receptionist at your door, sending each request to a server that is currently healthy and quietly skipping the ones that are not.

- **ALB** `layer 7`
- **NLB** `layer 4, µs`
- **Edge locations** `600+`
- **DNS failover** `90–150 s`

Three services sit between a user and your code, and they operate at different layers of the stack: **Route 53** answers the DNS question, **CloudFront** terminates the connection near the user and may answer from cache, and a **load balancer** distributes what is left across your targets. Understanding which one to reach for is mostly a matter of knowing where in the request each one gets involved.

> **Analogy** 🗺️
>
> **Picture it — finding a shop**
>
> **Route 53** is directory enquiries: you ask for the address and get one back — and a clever operator gives you the *nearest branch*, or skips the one that is closed today. **CloudFront** is the local pickup point that already has the popular items in stock, so most people never travel to the warehouse at all. The **load balancer** is the person at the warehouse door directing each visitor to whichever counter is free, and quietly closing the queue at a counter whose till has crashed. Three different decisions, made at three different moments, by three different systems.

> **Interactive animation:** `alb-routing` — rendered by the page script in the HTML version.

DNS is the earliest decision point and the coarsest. Route 53's **routing policies** turn a name lookup into a decision — nearest Region, healthy endpoint, weighted split, or a fixed answer per country.

> **Interactive animation:** `route53-routing` — rendered by the page script in the HTML version.

And CloudFront changes the economics of the whole thing, because the cheapest request is the one your origin never sees.

> **Interactive animation:** `cloudfront-cache` — rendered by the page script in the HTML version.

- **Strength — CloudFront helps even when nothing is cacheable** Terminating TLS at an edge a few milliseconds away and carrying the request over AWS's backbone removes several long round trips. Dynamic APIs routinely get 20–40% faster with a zero-percent hit ratio.
- **Weakness — DNS decisions are cached beyond your control** A resolver that cached your record for an hour will keep sending users to a dead endpoint for an hour, whatever Route 53 now says. Lower TTLs before a planned change, and never rely on DNS for a failover with a tight recovery objective.

**Interview question**

*Design the traffic path for a global web application with an API and a single-page front end. Where does each piece go?*

Put the front-end build in **S3** and serve it through **CloudFront** with an Origin Access Control, so the bucket stays private. Give static assets content-hashed filenames and a one-year `max-age`, and give `index.html` a short TTL — that combination makes deploys atomic and invalidations unnecessary. Put the API behind the *same* CloudFront distribution on a `/api/*` behaviour pointing at an **ALB**: one domain, no CORS preflight, and a single place to attach **WAF**. Terminate TLS with an **ACM** certificate (in `us-east-1` for CloudFront, which catches everyone once). Use **Route 53** with an alias record to the distribution — alias records are free to query and can point at an apex domain, which a CNAME cannot. If the API is multi-Region, add latency-based routing with health checks, and be honest in the interview that failover then takes a couple of minutes.

**One distribution, two origins, one domain**

```yaml
Distribution:
  Type: AWS::CloudFront::Distribution
  Properties:
    DistributionConfig:
      Enabled: true
      Aliases: [app.example.com]
      ViewerCertificate:
        AcmCertificateArn: !Ref Cert     # MUST be issued in us-east-1
        SslSupportMethod: sni-only
        MinimumProtocolVersion: TLSv1.2_2021
      Origins:
        - Id: spa
          DomainName: !GetAtt SiteBucket.RegionalDomainName
          S3OriginConfig: {}
          OriginAccessControlId: !Ref Oac
        - Id: api
          DomainName: !GetAtt Alb.DNSName
          CustomOriginConfig:
            OriginProtocolPolicy: https-only
      DefaultCacheBehavior:
        TargetOriginId: spa
        ViewerProtocolPolicy: redirect-to-https
        Compress: true
        CachePolicyId: 658327ea-f89d-4fab-a63d-7e88639e58f6   # CachingOptimized
      CacheBehaviors:
        - PathPattern: /api/*
          TargetOriginId: api
          ViewerProtocolPolicy: https-only
          AllowedMethods: [GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE]
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad # CachingDisabled
          OriginRequestPolicyId: 216adef6-5c7f-47e4-b989-5492eafa07d3  # AllViewer
      CustomErrorResponses:
        - ErrorCode: 403          # SPA deep links: let the router handle it
          ResponseCode: 200
          ResponsePagePath: /index.html
```

```bash
# deploy the SPA: long cache for hashed assets, no cache for the entry point
aws s3 sync ./dist s3://acme-site --delete \
  --exclude index.html \
  --cache-control 'public,max-age=31536000,immutable'

aws s3 cp ./dist/index.html s3://acme-site/index.html \
  --cache-control 'public,max-age=0,must-revalidate'

# with hashed filenames this is the only path you ever need to invalidate
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC --paths '/index.html'
```

> **Warning**
>
> **Two certificate rules that waste an afternoon each.** A certificate used by CloudFront must be issued in `us-east-1`, regardless of where anything else lives — CloudFront's control plane is global and lives there. A certificate used by an ALB must be in the ALB's own Region. They are not interchangeable, and the console will not warn you until the certificate fails to appear in the dropdown.

> **Tip**
>
> **Always use an alias record, not a CNAME**, when pointing at an AWS endpoint. Alias records are resolved inside Route 53, cost nothing to query, update automatically when the target's addresses change, and — uniquely — can be created at the zone apex, where the DNS standard forbids a CNAME. There is no case where a CNAME to an ALB or CloudFront distribution is the better choice.

<a id="9-messaging"></a>

### 9. Decoupling — SQS, SNS & EventBridge

> **In plain words**
>
> **In plain English**
>
> If service A calls service B directly, A breaks whenever B is down or slow. Instead, A leaves a message and walks away. **SQS** is a to-do list — one worker picks up each job when it is ready. **SNS** is a megaphone — one announcement, everyone subscribed hears it. **EventBridge** is a smart sorting office — it reads each event and delivers it only to the services that asked for that kind.

- **SQS retention** `up to 14 days`
- **SQS delivery** `at-least-once`
- **SNS fan-out** `12.5M subs`
- **EventBridge latency** `~0.5 s`

Direct calls between services create a chain where every link is a shared failure. If the order service calls the email service synchronously, an email outage becomes an ordering outage, and a slow email service becomes a slow checkout. Messaging breaks the chain: the producer writes somewhere durable and returns, and the consumer works at its own pace. The three AWS services that do this differ in one dimension — *who decides where a message goes*.

> **Analogy** 📮
>
> **Picture it — three ways to move a message around an office**
>
> **SQS** is an in-tray. Work piles up, someone takes the top item, and if they drop it on the way to their desk it reappears in the tray a few minutes later. **SNS** is a distribution list: whatever you send is copied to everyone on it, immediately, with no tray and no second chance if someone is out. **EventBridge** is a mailroom clerk who reads the subject line and the contents of every message and decides which departments care — including departments that were added to the building this morning without telling you.

> **Interactive animation:** `sqs-visibility` — rendered by the page script in the HTML version.

The animation above hides a rule that governs all AWS messaging: delivery is **at-least-once**, so your consumer *will* see the same message twice eventually — on a redelivery, a timeout, a retry. Making that harmless is not optional, and it is not hard: key your writes on the message ID, use conditional puts, make the operation naturally idempotent.

> **Interactive animation:** `eventbridge-fanout` — rendered by the page script in the HTML version.

- **Strength — a queue converts a traffic spike into a backlog** Ten thousand orders in a minute do not need ten thousand workers, they need a queue and a consumer that is a bit behind for a while. This is the cheapest capacity planning there is, and it turns "we fell over" into "we were slow".
- **Weakness — asynchrony moves the difficulty rather than removing it** You now have ordering, duplicates, poison messages, partial failures and no single place to see what happened to a request. Distributed tracing and dead-letter queues are not nice-to-haves here; without them the system is genuinely hard to reason about.

**Interview question**

*An order must trigger an email, a warehouse job and an analytics record. The email service is flaky. Design it.*

Publish one **OrderPlaced** event to EventBridge and stop — the order service's responsibility ends there, and it must not know that three consumers exist. Each consumer gets its own rule, and here is the important part: put an **SQS queue between the rule and each consumer** rather than invoking Lambda directly. That gives every consumer independent retries, independent backlog, and its own dead-letter queue, so the flaky email service builds a queue while the warehouse and analytics carry on untouched. Set `maxReceiveCount` so poison messages land in the DLQ instead of cycling, alarm on DLQ depth, and make each consumer idempotent on the order ID because redelivery is certain. If someone asks about ordering, that is the moment for a FIFO queue with the order ID as the message group — and the moment to ask whether you truly need global ordering or just per-order ordering, because they cost very different amounts.

**Publish once; let the rules decide who cares**

```python
import json
import boto3

events = boto3.client("events")

def place_order(order):
    # ... write the order to the database first, transactionally ...
    events.put_events(
        Entries=[{
            "Source": "orders.api",
            "DetailType": "OrderPlaced",
            "Detail": json.dumps({
                "orderId": order["id"],
                "total": order["total"],
                "tier": order["customer_tier"],
            }),
            "EventBusName": "acme-bus",
        }]
    )
    # Returns in milliseconds whether there are zero consumers or fifty.
    # It does not know, and must not know, who is listening.
```

```yaml
EmailRule:
  Type: AWS::Events::Rule
  Properties:
    EventBusName: acme-bus
    EventPattern:
      source: [orders.api]
      detail-type: [OrderPlaced]
      detail:
        total: [{ numeric: [">", 0] }]     # content-based filtering
    Targets:
      - Id: email-queue
        Arn: !GetAtt EmailQueue.Arn        # queue, not the Lambda directly,
        DeadLetterConfig:                  # so a flaky consumer builds a
          Arn: !GetAtt RuleDlq.Arn         # backlog instead of losing events
        RetryPolicy:
          MaximumRetryAttempts: 4
          MaximumEventAgeInSeconds: 3600
```

> **Key idea**
>
> **The choice, in one line each.** **SQS** when work must survive a slow or absent consumer. **SNS** when one message must reach many subscribers as cheaply as possible, and losing it is acceptable. **EventBridge** when routing depends on the *content* of the event, or when the events come from AWS services or SaaS partners. **Step Functions** when there is a multi-step workflow with retries, branches and compensation — that is orchestration, not messaging, and hand-rolling it in Lambda is a well-trodden mistake.

> **Warning**
>
> **Set the visibility timeout deliberately.** If it is shorter than your processing time, SQS hands the message to a second consumer while the first is still working — guaranteed duplicate work, and it looks exactly like a bug in your code. For Lambda consumers, AWS recommends the queue's visibility timeout be at least six times the function timeout.

<a id="unit-3"></a>

## Unit 3 — Running It Like You Mean It

The first two units get an application running. This one is about the difference between an application that runs and a system a team can operate: knowing when it breaks, limiting what a breach can reach, being able to rebuild it from a file, and surviving the failures that are guaranteed to happen. This is also, not coincidentally, the material that separates a good AWS interview from a mediocre one.

<a id="10-observability"></a>

### 10. Observability — Knowing Before Your Users Do

> **In plain words**
>
> **In plain English**
>
> These are the instruments on the dashboard. **CloudWatch** collects numbers and logs and can wake someone up when a number goes wrong. **X-Ray** follows one single request across every service it touches, so you can see which hop was slow. **CloudTrail** is the security camera: it records who called which AWS API, when, and from where. Without these you find out about outages from your users.

- **Metric resolution** `1 s – 1 min`
- **Alarm states** `OK / ALARM / no data`
- **Logs default retention** `forever`
- **CloudTrail history** `90 days free`

There are five different questions you might ask about a production system, and AWS answers each with a different service. **What happened inside this request?** Logs. **How is the system behaving over time?** Metrics. **Where did the latency go across five services?** Traces, via X-Ray. **Who called what, and when?** CloudTrail. **What changed?** AWS Config. Reaching for logs when the question is really "what changed at 14:02" is how debugging sessions turn into all-nighters.

> **Analogy** 🩺
>
> **Picture it — a hospital**
>
> **Metrics** are the bedside monitor: heart rate, blood pressure, a number every few seconds. They tell you something is wrong and roughly when, but never why. **Logs** are the case notes: everything that happened, in detail, and unreadably long unless you know what you are searching for. **Traces** are the patient's journey through the building — forty minutes waiting in radiology is invisible in both the monitor and the notes, and obvious the moment you plot the path. And **CloudTrail** is the medication chart: who administered what, at what time, on whose authority.

> **Interactive animation:** `cloudwatch-alarm` — rendered by the page script in the HTML version.

- **Strength — structured logs turn text into a queryable table** Emit JSON with a request ID, a route and a duration, and CloudWatch Logs Insights will aggregate, filter and percentile it in seconds. The Embedded Metric Format goes further: one log line that is simultaneously a log entry and a custom metric, with no extra API call.
- **Weakness — CloudWatch bills for what you emit** Log ingestion is charged per gigabyte, custom metrics are charged per metric per month, and high-cardinality dimensions (a metric per user ID) explode both. Debug logging left on after an incident is a genuinely common top-five line item.

**Interview question**

*Users report the site is "sometimes slow". Your average latency dashboard looks fine. What do you do?*

The dashboard is the problem. An average of 120 ms is perfectly consistent with 5% of requests taking four seconds — and the 5% is what people report. Switch every latency panel and alarm to **p99**, or better, p50/p90/p99 side by side so you can see the spread rather than the centre. Then find the shape: query Logs Insights for the slow requests specifically and group by route, customer and time of day, because "sometimes" is usually a pattern — a particular endpoint, a particular tenant with more data, a cold start, a cron job contending for the database. If the request crosses services, turn on **X-Ray** and look at the service map: a trace showing 3.6 seconds waiting on one downstream call is an answer, and no amount of log reading gets you there as fast.

**Percentiles first, then the shape of the slowness**

```logs
# CloudWatch Logs Insights - where the slow requests actually are
fields @timestamp, @message
| filter ispresent(duration_ms)
| stats count(*) as n,
        pct(duration_ms, 50) as p50,
        pct(duration_ms, 90) as p90,
        pct(duration_ms, 99) as p99
  by route
| sort p99 desc
| limit 20

# and then: is it one tenant, or everyone?
fields @timestamp, tenant_id, route, duration_ms
| filter duration_ms > 2000
| stats count(*) as slow_requests by tenant_id
| sort slow_requests desc
```

```python
import json
import time

# Embedded Metric Format: this single log line is ALSO a CloudWatch metric.
# No PutMetricData call, no extra latency, no per-request API cost.
def log_request(route, tenant, duration_ms, status):
    print(json.dumps({
        "_aws": {
            "Timestamp": int(time.time() * 1000),
            "CloudWatchMetrics": [{
                "Namespace": "Acme/Api",
                # keep dimensions LOW cardinality - never tenant_id here,
                # or you create one metric per tenant and a large bill
                "Dimensions": [["Route"]],
                "Metrics": [{"Name": "Latency", "Unit": "Milliseconds"}],
            }],
        },
        "Route": route,
        "Latency": duration_ms,
        # high-cardinality fields are fine as plain log fields -
        # queryable in Insights, not charged as metrics
        "tenant_id": tenant,
        "status": status,
    }))
```

> **Warning**
>
> **The alarm state that quietly betrays you is `INSUFFICIENT_DATA`.** If the thing emitting a metric dies completely, no datapoints arrive, and an alarm configured with the default `treatMissingData: missing` stays grey rather than firing. Your service is entirely down and nobody is paged. For any metric whose *absence* is bad news, set `treatMissingData` to `breaching`.

> **Tip**
>
> **Alarm on symptoms, dashboard on causes.** Page on things users feel — error rate, p99 latency, the age of the oldest message in a queue, error-budget burn. Put CPU, memory, connection counts and queue depth on a dashboard where you look at them *after* being paged. An alarm on CPU produces pages during harmless batch jobs, and trains people to ignore the channel that will one day matter.

<a id="11-security"></a>

### 11. Security Beyond IAM — KMS, Secrets & Blast Radius

> **In plain words**
>
> **In plain English**
>
> IAM decides who may do what; these services limit the damage when something still goes wrong. **KMS** holds the encryption keys and never hands them out, so stolen data is unreadable. **Secrets Manager** stores passwords and API keys properly instead of in your code, and can rotate them. And splitting work across **separate accounts** means one mistake stays inside one account instead of taking down everything.

- **KMS payload limit** `4 KB`
- **Customer managed key** `$1/month`
- **Secrets Manager** `$0.40/secret/mo`
- **Encryption in transit** `always on`

IAM decides who may make a call. This section is about everything else: encrypting data so that access to storage is not access to content, keeping credentials out of code, and arranging accounts so that a compromise is contained. The organising idea is **blast radius** — not "can this be broken into" but "if it is, how far does the damage reach?"

> **Analogy** 🗝️
>
> **Picture it — a safe deposit box with two keys**
>
> The bank gives you a box and a small key. The box's contents are locked with *your* key, and the key itself is kept in a vault you can never enter — you can only ask the vault to use it on your behalf, and every such request is written in a ledger. Steal the box and you have a locked box. Steal a copy of the building's floor plan and you still cannot get the key out of the vault. And if you suspect something is wrong, one phone call disables the key and every box it ever locked becomes unopenable, instantly. That last property — the kill switch — is why customer managed KMS keys are worth the dollar a month.

> **Interactive animation:** `kms-envelope` — rendered by the page script in the HTML version.

The second thing worth internalising is where the responsibility line sits, because it moves with the service. On EC2 you patch the operating system; on Lambda you do not. On both, your data and your IAM configuration are yours. Run the animation for all three services and watch the line rise.

> **Interactive animation:** `shared-responsibility` — rendered by the page script in the HTML version.

- **Strength — encryption is nearly free and nearly automatic** S3, EBS, RDS and DynamoDB all encrypt at rest with a checkbox, TLS is on by default in transit, and Secrets Manager rotates database credentials without you writing rotation logic. There is very little reason left to run anything unencrypted.
- **Weakness — the default account layout has no blast radius at all** One account holding dev, staging and production means one over-broad policy, one leaked credential, or one `terraform apply` in the wrong terminal reaches everything. Separate accounts per environment, under Organizations, is the single highest-leverage security decision available to a small team.

**Interview question**

*A database password is in an environment variable in your task definition. Explain why that is a problem and what you would do instead.*

It is a problem for four separate reasons, and naming all four is the answer. It is **visible** to anyone with `ecs:DescribeTaskDefinition` — a read-only permission people hand out freely. It is **durable**: task definition revisions are immutable and kept forever, so the password remains readable in revision 14 long after you change it. It is **unrotatable** without a deployment, which in practice means it is never rotated. And it tends to be **duplicated** into CI variables, local `.env` files and someone's shell history. The replacement is **Secrets Manager** with the secret ARN in the task definition instead of the value: ECS fetches it at task start using the task's execution role, so the value never appears in the definition, access is logged in CloudTrail, and automatic rotation becomes a configuration rather than a project. For non-secret configuration, SSM Parameter Store does the same job for free.

**Reference the secret, never the value**

```yaml
TaskDefinition:
  Type: AWS::ECS::TaskDefinition
  Properties:
    ContainerDefinitions:
      - Name: api
        Image: !Sub ${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/api:1.4.2
        Environment:
          - Name: LOG_LEVEL          # fine: not a secret
            Value: info
        Secrets:                     # fetched at start-up, never stored here
          - Name: DB_PASSWORD
            ValueFrom: !Sub '${DbSecret}:password::'
          - Name: STRIPE_KEY
            ValueFrom: !Ref StripeSecretArn

DbSecret:
  Type: AWS::SecretsManager::Secret
  Properties:
    GenerateSecretString:            # nobody ever sees the value, including you
      SecretStringTemplate: '{"username":"app"}'
      GenerateStringKey: password
      PasswordLength: 32
      ExcludeCharacters: '"@/\'

RotationSchedule:
  Type: AWS::SecretsManager::RotationSchedule
  Properties:
    SecretId: !Ref DbSecret
    RotationRules:
      AutomaticallyAfterDays: 30
```

```python
import json
import boto3
from functools import lru_cache

sm = boto3.client("secretsmanager")

@lru_cache(maxsize=8)
def get_secret(name: str) -> dict:
    """Cache it: Secrets Manager is billed per API call, and a Lambda
    sandbox may serve thousands of invocations. Cache in module scope,
    not per request - but do give it a TTL if you enable rotation."""
    return json.loads(sm.get_secret_value(SecretId=name)["SecretString"])

creds = get_secret("prod/db")
# creds["username"], creds["password"] - and neither ever touched
# an environment variable, a config file, or your git history.
```

> **Key idea**
>
> **The account is the blast radius boundary, and it is free.** IAM boundaries within an account are complicated to get right and easy to get subtly wrong; an account boundary is absolute. Separate accounts for production, staging, development and security tooling, under AWS Organizations with SCPs setting the ceiling and IAM Identity Center providing human access, is the standard shape — and Control Tower will set it up for you.

> **Tip**
>
> **The detective controls worth turning on before you need them.** **GuardDuty** reads CloudTrail, VPC Flow Logs and DNS logs and flags credential exfiltration, crypto-mining and reconnaissance — it takes one click and finds real things. **Security Hub** aggregates findings against a benchmark. **Config** records what changed. **Access Analyzer** tells you which of your resources can be reached from outside the account, which is the question you actually want answered.

<a id="12-iac"></a>

### 12. Infrastructure as Code & Deployment

> **In plain words**
>
> **In plain English**
>
> Instead of clicking around the console and hoping you remember what you did, you write your infrastructure down in a file and let a tool build it — **CloudFormation**, the **CDK** or **Terraform**. The file goes in Git, so changes get reviewed, staging and production match, and rebuilding the whole environment is one command instead of an afternoon of remembering.

- **Rollback** `automatic`
- **Change set** `dry run`
- **Drift** `silent`
- **Stack limit** `500 resources`

Clicking in the console is how you learn a service and a poor way to run one. The problem is not effort but *memory*: nobody can reconstruct which of forty settings were changed by whom during last quarter's incident. Infrastructure as code makes the environment a reviewable, diffable, reproducible artefact — and makes "recreate this in another Region" a task rather than an archaeology project.

> **Analogy** 📐
>
> **Picture it — a recipe versus a memory of cooking**
>
> Console clicking is cooking from memory: it works, the result is fine, and nobody else can reproduce it — including you, in six months, at 3am. A template is the written recipe. It can be reviewed before anyone turns on the oven, followed identically in a different kitchen, and diffed against last week's version to see exactly what changed. And when a step fails halfway, CloudFormation does the thing a cook cannot: it puts every ingredient back in its jar.

> **Interactive animation:** `cfn-deploy` — rendered by the page script in the HTML version.

Deployment of the application on top follows the same principle — describe the desired revision and let the platform converge, safely, with a way back. Here is what that looks like on ECS, and the shape is the same for CodeDeploy, Lambda aliases and Kubernetes rollouts.

> **Interactive animation:** `ecs-deploy` — rendered by the page script in the HTML version.

- **Strength — CDK gives you a real language without losing the safety net** Write TypeScript or Python, get loops, types and unit tests, and synthesise CloudFormation — so you keep change sets, automatic rollback and drift detection. The L2 constructs also encode sensible defaults, which is worth more than the syntax.
- **Weakness — drift is silent and corrosive** One console change during an incident and your template no longer describes reality. The next deployment either reverts the fix or fails confusingly. Detect drift on a schedule, and make the emergency console change a thing you deliberately reconcile afterwards rather than forget.

**Interview question**

*You need to deploy a new version of a service with no downtime and a fast way back. Compare rolling, blue/green and canary.*

**Rolling** replaces instances or tasks a few at a time. It needs no extra capacity beyond a small overhead, it is the ECS and Kubernetes default, and its weakness is that during the roll you are running two versions simultaneously — so the new version must be backward compatible with the old one's database schema and message formats. Rollback means rolling forward to the previous revision, which takes as long again. **Blue/green** stands up a complete second environment, tests it, and switches traffic at the load balancer. Rollback is instantaneous because the old environment is still there, and the cost is double capacity during the switch plus real difficulty when there is a stateful database behind both. **Canary** sends a small percentage to the new version, watches the error rate and latency, and either proceeds or aborts automatically — the safest of the three and the only one that catches problems your tests did not, at the price of needing good enough metrics to make the decision on. In practice: canary for anything user-facing, rolling for internal services, blue/green when an instant rollback is worth the duplicate capacity. And in all three, decouple schema changes from code changes — expand, migrate, contract — because no deployment strategy saves you from a migration that only the new version understands.

**Deployment safety, declared**

```yaml
# ECS: rolling, with the circuit breaker doing the rollback for you
Service:
  Type: AWS::ECS::Service
  Properties:
    DesiredCount: 3
    DeploymentConfiguration:
      MinimumHealthyPercent: 100      # add before removing
      MaximumPercent: 200
      DeploymentCircuitBreaker:
        Enable: true
        Rollback: true                # failed health checks -> previous revision

# Lambda: canary, with an alarm that aborts the shift
Function:
  Type: AWS::Serverless::Function
  Properties:
    AutoPublishAlias: live
    DeploymentPreference:
      Type: Canary10Percent5Minutes   # 10% for 5 min, then everything
      Alarms:
        - !Ref ErrorRateAlarm         # if this fires, traffic snaps back
      Hooks:
        PreTraffic: !Ref SmokeTestFunction
```

```bash
# never run `deploy` blind - look at the diff first
aws cloudformation deploy \
  --template-file infra.yaml --stack-name prod-api \
  --no-execute-changeset            # creates the change set, does not run it

aws cloudformation describe-change-set \
  --change-set-name arn:aws:cloudformation:... \
  --query 'Changes[].ResourceChange.{Action:Action,Type:ResourceType,
           Id:LogicalResourceId,Replace:Replacement}' --output table
# "Replace: True" on a database is the line that ends careers - read it

# has anyone been clicking in the console?
aws cloudformation detect-stack-drift --stack-name prod-api
aws cloudformation describe-stack-resource-drifts --stack-name prod-api \
  --stack-resource-drift-status-filters MODIFIED DELETED
```

> **Tip**
>
> **Split stacks by rate of change, not by team.** Network and DNS change once a year; databases change a few times a year; the application changes hourly. Putting them in one stack means every application deploy carries the risk of touching the VPC, and a failed rollback can wedge everything. Three stacks, with outputs exported between them, makes the blast radius of a deployment match its actual scope.

> **Warning**
>
> **Put `DeletionPolicy: Retain` on everything that holds data** — databases, S3 buckets, EFS filesystems — before you need it. Renaming a logical ID, changing a property that requires replacement, or deleting a stack will otherwise take the data with it, and CloudFormation will do it obediently and quickly. A retained orphan resource is a small annoyance; a deleted production database is not.

<a id="13-resilience"></a>

### 13. Building Things That Survive

> **In plain words**
>
> **In plain English**
>
> Things break on AWS as a matter of routine — a server dies, a zone goes dark, a dependency gets slow. Resilience is designing so that none of those becomes an outage: spread copies across Availability Zones, health-check everything, set timeouts so a slow call cannot hang the whole system, retry sensibly, and actually test that your backups restore.

- **Assume** `everything fails`
- **Retry** `with jitter`
- **Timeout** `always`
- **Idempotency** `not optional`

Werner Vogels' line — "everything fails, all the time" — is not pessimism, it is a design instruction. Instances are terminated without warning, Availability Zones lose power, APIs throttle, networks partition, and DNS caches lie. A resilient system is not one where these do not happen; it is one where they happen and the user does not notice. Four techniques do most of the work, and three of them are in your application code rather than your infrastructure.

> **Analogy** 🚪
>
> **Picture it — a queue at a door that has jammed**
>
> Everyone pushes at once, which jams it harder. That is a retry storm. If instead each person waits a random few seconds before trying again, the pressure drops and the door opens. If someone notices the door is broken and starts directing people to the side entrance without anyone even touching the handle, that is a **circuit breaker**. And if the side entrance leads to a smaller room with fewer facilities but people can still get in, that is **graceful degradation** — which is almost always better than a locked building and an apology.

> **Interactive animation:** `retry-backoff` — rendered by the page script in the HTML version.

- **Strength — the SDKs already do the hard part** Every AWS SDK implements exponential backoff with jitter and sensible retry classification by default. You inherit correct behaviour for AWS calls for free — the work is applying the same discipline to calls between *your own* services, where nobody has done it for you.
- **Weakness — retries without budgets amplify outages** A retry at every layer of a five-service call chain means three attempts each, which is 243 requests hitting the struggling service at the bottom. Retry at one layer, cap the total time, and shed load rather than queueing it forever.

**Interview question**

*Design a payment endpoint that is safe to retry.*

The requirement is **idempotency**: the same logical request submitted twice must charge once. Have the client generate an idempotency key — a UUID it creates before the first attempt and reuses for every retry of that same intent. On the server, write that key to DynamoDB with `attribute_not_exists(pk)` as a condition *before* doing any work. If the write succeeds you are the first attempt: perform the charge, then store the result against the key. If the write fails with a conditional check exception you are a duplicate: return the stored result rather than charging again. The details that separate a good answer from a great one are the failure cases — put the record in a `PENDING` state first so a crash mid-charge does not let a retry double-charge; give the record a TTL so the table does not grow forever; and make sure the key is scoped per customer so two customers cannot collide. Then layer the ordinary hygiene on top: a timeout on the downstream call, retries with jitter, a circuit breaker so a dead payment provider fails fast instead of consuming every worker thread.

**Idempotency key, conditional write, stored result**

```python
import time
import boto3
from botocore.exceptions import ClientError

table = boto3.resource("dynamodb").Table("idempotency")

def charge(customer_id: str, amount: int, idem_key: str) -> dict:
    pk = f"{customer_id}#{idem_key}"          # scoped: no cross-customer collision
    try:
        table.put_item(
            Item={
                "pk": pk,
                "state": "PENDING",
                "ttl": int(time.time()) + 86_400,
            },
            ConditionExpression="attribute_not_exists(pk)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
            raise
        # Someone got here first. Either it finished, or it is still running.
        existing = table.get_item(Key={"pk": pk})["Item"]
        if existing["state"] == "DONE":
            return existing["result"]         # the whole point: charge once
        raise RetryLater("charge already in progress")

    result = payment_provider.charge(customer_id, amount, timeout=5)

    table.update_item(
        Key={"pk": pk},
        UpdateExpression="SET #s = :done, #r = :res",
        ExpressionAttributeNames={"#s": "state", "#r": "result"},
        ExpressionAttributeValues={":done": "DONE", ":res": result},
    )
    return result
```

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand }
  from "@aws-sdk/lib-dynamodb";

// The SDK's own retry behaviour, made explicit. This is already the
// default - the value of knowing it is applying the same shape to
// calls to YOUR services, where nobody configured it for you.
const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: "us-east-1",
    maxAttempts: 3,                 // total attempts, not extra retries
    requestHandler: { requestTimeout: 3000 },
  })
);

export async function charge(customerId, amount, idemKey) {
  const pk = `${customerId}#${idemKey}`;
  try {
    await ddb.send(new PutCommand({
      TableName: "idempotency",
      Item: { pk, state: "PENDING", ttl: Math.floor(Date.now() / 1000) + 86400 },
      ConditionExpression: "attribute_not_exists(pk)",
    }));
  } catch (err) {
    if (err.name !== "ConditionalCheckFailedException") throw err;
    const { Item } = await ddb.send(
      new GetCommand({ TableName: "idempotency", Key: { pk } })
    );
    if (Item?.state === "DONE") return Item.result;
    throw new Error("charge already in progress");
  }
  // ... perform the charge, then mark DONE ...
}
```

> **Key idea**
>
> **The four habits, in order of value.** **Timeouts on everything** — a call with no timeout is a thread you will never get back, and the default in most HTTP clients is "forever". **Retries with jitter**, at one layer only, with a total time budget. **Idempotency**, because at-least-once delivery and retries both guarantee duplicates. And **graceful degradation** — a page that renders without the recommendations panel beats a page that does not render.

> **Interview**
>
> **Say the numbers out loud when you are asked about resilience.** **RTO** is how long you may be down; **RPO** is how much data you may lose. They drive the architecture completely: RPO of zero means synchronous replication and therefore Multi-AZ or Aurora. RTO of minutes rules out restoring from a snapshot. RTO of seconds across Regions means active/active, which means conflict resolution, which is a substantial project. Candidates who ask for the RTO and RPO before proposing a design are immediately distinguishable from candidates who propose multi-Region for everything.

<a id="14-one-page"></a>

### 14. The Whole Thing on One Page

Everything above, compressed to what you would want on a card during an interview or an incident.

<a id="the-services-that-matter"></a>

#### The services that matter, and the one line each

| Need | Service | The thing to remember |
| --- | --- | --- |
| Store objects | S3 | 11 nines, flat namespace, lifecycle rules save most of the bill |
| Run a function | Lambda | One request per sandbox; memory buys CPU; 15-minute ceiling |
| Run a container | ECS Fargate | No instances to patch; circuit breaker rolls back for you |
| Run a VM | EC2 + ASG | Spread across 3 AZs; Graviton and Spot are the cheap wins |
| Relational data | RDS / Aurora | Multi-AZ for availability, replicas for reads; neither is a backup |
| Key-value at scale | DynamoDB | Design keys from access patterns; a hot partition throttles the table |
| Cache | ElastiCache | Removes read load rather than absorbing it |
| Buffer work | SQS | At-least-once; visibility timeout ≥ 6× handler timeout; always a DLQ |
| Route events | EventBridge | Content-based rules; the publisher never learns who listens |
| Orchestrate steps | Step Functions | Retries, branches and compensation you do not hand-roll |
| Balance traffic | ALB / NLB | ALB reads HTTP; NLB is layer 4 with a static IP |
| Serve globally | CloudFront | Helps even at a 0% hit ratio; version filenames instead of invalidating |
| Resolve names | Route 53 | Alias records, always; failover takes minutes, not seconds |
| See what happened | CloudWatch, X-Ray, CloudTrail | Metrics, traces, and who called what — three different questions |
| Encrypt | KMS | Envelope encryption; a customer managed key gives you a kill switch |
| Hold secrets | Secrets Manager | Reference the ARN, never the value; rotation is configuration |
| Define it all | CloudFormation / CDK | Change sets before deploys; `DeletionPolicy: Retain` on data |

<a id="the-rules"></a>

#### The rules that apply everywhere

- **Spread across three AZs, always** It is the cheapest availability you will ever buy, and it is the failure AWS actually has.
- **Roles, never access keys** Every runtime can receive one automatically. A static key in a config file is a finding waiting to be written up.
- **Deny by default; one Deny beats every Allow** If adding admin does not fix it, you are fighting an explicit Deny — SCP, resource policy, or boundary.
- **Everything is retried, so make everything idempotent** At-least-once delivery is the norm, not the exception.
- **Watch data transfer, not just compute** NAT Gateway processing and cross-AZ traffic are where unexplained bills live.
- **Managed is not backed up** Multi-AZ, replicas and versioning replicate your mistakes faithfully. Test a restore.
- **An account is the only real blast-radius boundary** Separate environments into separate accounts before you need to.
- **Console changes create drift** The template stops describing reality and the next deploy surprises you.

<a id="the-six-pillars"></a>

#### The Well-Architected pillars as questions

```text
Operational excellence → Can we deploy on a Friday? Do we know it broke?
                Security → If this credential leaks, how far does it reach?
                Reliability → What happens when one AZ disappears right now?
                Performance efficiency → Are we using the right service, or the familiar one?
                Cost optimisation → What are we paying for while nobody is using it?
                Sustainability → Right-sized, Graviton, and turned off out of hours?
```

> **Interview**
>
> **How to use this in a system design interview.** Ask for the scale, the RTO and the RPO before you draw anything. Start with the simplest thing that works — ALB, Auto Scaling group across three AZs, RDS Multi-AZ, S3 and CloudFront — and add complexity only when a stated requirement forces it. Say out loud where the state lives and how it survives a failure. Name a trade-off for every choice, because "DynamoDB, since the access pattern is a single lookup by user ID, and I accept that a new query pattern later means a GSI" is a far better answer than "DynamoDB, it scales". And when you do not know a service's limit, say so and say how you would find out.

<a id="where-to-go-next"></a>

#### Where to go next

1. [**The AWS Detailed Course**](aws-detailed-course.html) — the same ground and a great deal more, in 36 sections: Organizations and account structure, IAM policy evaluation in full, VPC connectivity including Transit Gateway and PrivateLink, EC2 instance families and storage, the whole storage line-up, Aurora and DynamoDB modelling, containers and Kubernetes, Step Functions, streaming and analytics, the security services, CI/CD, and a pattern-recognition playbook for design interviews.
2. [**All AWS courses**](aws-courses.html) on TechToday.
3. [**The AWS Well-Architected Framework**](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — short, readable, and the source of the questions every AWS design review will ask you.
4. [**The Amazon Builders' Library**](https://aws.amazon.com/builders-library/) — how Amazon actually implements timeouts, retries, health checks and deployments. The articles on jitter, load shedding and workload isolation are among the best free distributed-systems writing anywhere.
5. [**Overview of Amazon Web Services**](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html) — the official one-paragraph description of every service, useful for placing the hundred and eighty services this page deliberately ignored.

---

TechToday Study Library — Amazon Web Services
