<!--
Source: devops-detailed-course.html
Title: DevOps Detailed Course | TechToday
Description: A forty-section DevOps course from first principles — flow metrics and batch size, Git workflow, reproducible builds and lockfiles, container internals, Dockerfiles, Kubernetes architecture and networking, Terraform state, CI pipeline design, deployment strategies, GitOps, zero-downtime migrations, secrets, OpenTelemetry, SLOs, incident response, autoscaling, cost and supply-chain security.
Theme-color: #0b0d10
Stylesheets: devops-study.css, ../../../site-header.css
Scripts: devops-study.js
-->

Navigation: [TechToday](../../../index.html) · [← DevOps Courses](../devops-courses.html)

<a id="devops-detailed-course"></a>

# DevOps

Forty sections, ordered so that each one depends only on the ones before it. We start with why the discipline exists and how to measure whether it is working, then build upwards: version control, builds and artifacts, the Linux mechanisms containers are made of, orchestration, infrastructure as code, pipeline design, delivery, data migrations, observability, reliability practice, and the security of everything between a dependency and a running process. Animations mark the processes worth watching rather than reading — press **Play** and step through them. Code appears in shell, YAML, Terraform and Python; the tabs remember your choice across the site.

> **Key idea**
>
> **New to this?** Read the [DevOps crash course](devops-crash-course.html) first. It covers the same ground in fourteen sections built around mental models and animations, and it will make this course a set of details rather than a set of surprises. Come back here when you want the mechanism underneath each idea — how the cache key of a Docker layer is computed, what exactly a Service does to a packet, why a plan proposes to replace a database.

<a id="table-of-contents"></a>

## Table of Contents

1. [What DevOps Is and the Problem It Solves](#1-what-devops-is)
2. [The Four Key Metrics and Measuring Flow](#2-metrics)
3. [Value Streams, Batch Size and Queueing](#3-batch-size)
4. [Git as the System of Record](#4-git)
5. [Branching, Review and Merge Queues](#5-branching)
6. [Builds, Determinism and Reproducibility](#6-builds)
7. [Dependencies and Lockfiles](#7-dependencies)
8. [Artifacts, Versioning and Promotion](#8-artifacts)
9. [Linux Foundations for DevOps](#9-linux)
10. [Container Internals](#10-container-internals)
11. [Writing Dockerfiles](#11-dockerfiles)
12. [Registries, Tags and Digests](#12-registries)
13. [Running Containers — Compose, Networks, Volumes](#13-running-containers)
14. [Kubernetes Architecture](#14-k8s-architecture)
15. [Kubernetes Workloads](#15-k8s-workloads)
16. [Kubernetes Networking](#16-k8s-networking)
17. [Kubernetes Configuration, Storage and Scheduling](#17-k8s-config)
18. [Helm, Kustomize and Manifest Management](#18-helm)
19. [Infrastructure as Code — the Declarative Model](#19-iac-model)
20. [Terraform in Practice](#20-terraform)
21. [Immutable Infrastructure and Configuration Management](#21-immutable)
22. [Cloud Foundations for DevOps](#22-cloud)
23. [Continuous Integration — Designing the Pipeline](#23-ci-design)
24. [Test Strategy](#24-test-strategy)
25. [Pipelines as Code — GitHub Actions in Depth](#25-actions)
26. [Continuous Delivery vs Continuous Deployment](#26-cd)
27. [Deployment Strategies in Depth](#27-deploy-strategies)
28. [GitOps and Pull-Based Delivery](#28-gitops)
29. [Database Changes Without Downtime](#29-migrations)
30. [Configuration, Secrets and Rotation](#30-secrets)
31. [Feature Flags and Progressive Delivery](#31-flags)
32. [Observability I — Logs and Metrics](#32-observability-1)
33. [Observability II — Tracing and OpenTelemetry](#33-observability-2)
34. [SLIs, SLOs, Error Budgets and Alerting](#34-slo)
35. [Incident Response and Postmortems](#35-incidents)
36. [Capacity, Autoscaling and Cost](#36-capacity)
37. [Supply Chain Security and DevSecOps](#37-supply-chain)
38. [Cheat Sheet](#38-cheat-sheet)
39. [Pattern-Recognition Playbook](#39-playbook)
40. [Practice Roadmap](#40-roadmap)

<a id="unit-1"></a>

## Unit 1 — DevOps Foundations

The problem DevOps solves and how to measure the flow of work from idea to production.

<a id="1-what-devops-is"></a>

## 1. What DevOps Is and the Problem It Solves

DevOps is a response to a specific organisational failure, and it is worth stating the failure precisely because every practice in this course is a countermeasure to some part of it. In the arrangement it replaced, a development group was measured on features delivered and an operations group was measured on stability. Those two incentives are not merely different, they are opposed: every change a developer produces is a risk an operator is penalised for accepting. The predictable equilibrium is a change-approval process, a release calendar, and a batch of six weeks of changes arriving at once — which is the configuration in which failures are both most likely and least diagnosable.

The proposal was to give both groups the same measure of success: *working software in front of users, continuously*. That single change reframes everything. Automation stops being a convenience and becomes the only way to make frequent change safe. Monitoring stops being an operations concern and becomes feedback developers act on. And the release ceases to be an event that a committee approves and becomes a routine consequence of merging.

The three ideas usually quoted as the foundation are **flow**, **feedback** and **continual learning**. Flow is about making work move quickly and visibly from idea to production; feedback is about shortening the distance between a mistake and its discovery; continual learning is about treating incidents and failures as information rather than as fault. They map neatly onto what the rest of this course builds: sections 4–8 and 23–28 are flow, sections 32–36 are feedback, and sections 3, 35 and 40 are learning.

> **Interactive animation:** `feedback-loop` — rendered by the page script in the HTML version.

<a id="1-1-what-it-is-not"></a>

### What it is not

Three misreadings are common enough to name. The first is **DevOps as a tool category** — the belief that installing Jenkins, Docker and Kubernetes constitutes adoption. Tools are necessary and they are downstream; a team with all three and a two-week manual release has not adopted anything. The second is **DevOps as a job title that replaced "sysadmin"**, which is now so widespread that arguing about it is unproductive, but it is worth knowing that the original proposal was about removing the hand-off rather than renaming the person on the receiving end of it. The third is **"you build it, you run it" taken literally at any scale**: shared ownership is the goal, but without a platform team building a paved road, it means every team independently solving logging, deployment and secrets, badly.

| Symptom | Underlying cause | Where it is addressed |
| --- | --- | --- |
| Releases need a maintenance window | Deploy is coupled to downtime and is irreversible | §27, §29 |
| "It worked in staging" | Environments run different artifacts or different config | §6, §8, §30 |
| Merges take days | Branches live for weeks; integration is deferred | §5 |
| Nobody knows what is running | Mutable tags, manual changes, no reconciliation | §12, §28 |
| Incidents take hours to diagnose | Alerting on causes; no traces; no deploy markers | §33, §34, §35 |
| Nobody will deploy on Friday | Rollback is slow, untested, or blocked by the database | §27, §29 |

> **Interview**
>
> **Framing that works in an interview.** When asked to define DevOps, resist both the slogan ("it's a culture") and the tool list. Define it by the problem: development and operations optimised for opposing measures, which produced large, infrequent, risky releases. Then say that the countermeasure is to make change small, automated and reversible, and that the tools follow from that requirement. Naming a concrete practice you have used — and what it cost — is what separates an answer from a recital.

<a id="2-metrics"></a>

## 2. The Four Key Metrics and Measuring Flow

The DORA research programme spent a decade surveying tens of thousands of engineers and looking for measures that predicted organisational performance. Four survived. Two are throughput measures and two are stability measures, and the headline finding is that they move *together* rather than trading off.

- **Deployment frequency** `on demand`
- **Lead time for change** `< 1 h`
- **Change failure rate** `0–15%`
- **Failed deployment recovery** `< 1 h`

**Deployment frequency** is how often you successfully release to production. **Lead time for change** is the elapsed time from a commit landing on the trunk to that commit running in production — not from ticket creation, which measures product process rather than delivery. **Change failure rate** is the proportion of deploys that require remediation: a rollback, a hotfix, a forward fix within the hour. **Failed deployment recovery time** is how long it takes to restore service when one of those happens.

Definitions matter more than instrumentation here, because each of these has a defensible-sounding variant that makes the number look better and the signal useless. Lead time measured from "code complete" excludes review and CI, which is usually where the time goes. Change failure rate that counts only incidents with a formal severity excludes the quiet rollbacks. Agree the definitions first, write them down, then automate.

<a id="2-1-computing-them"></a>

### Computing them from data you already have

All four can be derived from two event streams: deployments and incidents. If your pipeline tags a commit on every production deploy, and your incident tool records start and resolution timestamps, nothing else is needed.

**Derive the four metrics from deploy tags and incident records**

```python
"""Four key metrics from two event streams. No vendor required."""
from datetime import datetime, timedelta
from statistics import median

def deployment_frequency(deploys, days=30):
    recent = [d for d in deploys if d["at"] > datetime.utcnow() - timedelta(days=days)]
    return len(recent) / days                     # deploys per day

def lead_time(deploys):
    """Median hours from commit authored to that commit deployed.

    Measure every commit in the release, not just the last one: a release
    containing a three-week-old commit has a three-week lead time for that
    change, however fast the pipeline was.
    """
    samples = []
    for d in deploys:
        for commit in d["commits"]:
            samples.append((d["at"] - commit["authored_at"]).total_seconds() / 3600)
    return median(samples)

def change_failure_rate(deploys):
    failed = sum(1 for d in deploys if d["remediated"])
    return failed / len(deploys)

def recovery_time(incidents):
    """Median, never mean - one 14-hour outage should not define the norm."""
    return median((i["resolved_at"] - i["started_at"]).total_seconds() / 60
                  for i in incidents)

print(f"deploys/day     {deployment_frequency(deploys):.1f}")
print(f"lead time       {lead_time(deploys):.1f} h")
print(f"change failure  {change_failure_rate(deploys):.0%}")
print(f"recovery        {recovery_time(incidents):.0f} min")
```

```bash
# The pipeline's only job here: mark every production deploy immutably.
git tag -a "deploy-$(date -u +%Y%m%dT%H%M%SZ)" -m "$GIT_SHA" && git push --tags

# Deployment frequency over the last 30 days.
git tag --list 'deploy-*' --sort=-creatordate \
  --format='%(creatordate:short)' | head -100 \
  | awk -v cutoff="$(date -u -v-30d +%Y-%m-%d)" '$1 >= cutoff' | wc -l

# Lead time: age of every commit at the moment it was deployed.
prev=""
git tag --list 'deploy-*' --sort=creatordate | while read -r tag; do
  [ -n "$prev" ] && {
    deployed=$(git log -1 --format=%ct "$tag")
    git log --format=%ct "$prev..$tag" | while read -r authored; do
      echo $(( (deployed - authored) / 60 ))          # minutes
    done
  }
  prev="$tag"
done | sort -n | awk '{a[NR]=$1} END {print "median", a[int(NR/2)], "min"}'
```

<a id="2-2-gaming"></a>

### How each metric is gamed

Any metric used as a target will be optimised, including in ways that make the underlying system worse. It is worth knowing the specific distortions so that you recognise them in your own dashboards as well as in someone else's.

| Metric | The cheap way to move it | The check that catches it |
| --- | --- | --- |
| Deployment frequency | Count deploys to every environment, or split one release into five | Count production deploys only, and read alongside lead time |
| Lead time | Start the clock at "ready to deploy" rather than at the commit | Derive from commit timestamps, not from pipeline start |
| Change failure rate | Reclassify rollbacks as "planned changes" | Any deploy followed by an unplanned deploy within an hour |
| Recovery time | Declare the incident resolved when mitigated, not when verified | Measure to the return of the SLI, not to a status change |

> **Warning**
>
> **Never set these as team targets.** The moment "deploys per week" appears on a performance review, it stops measuring anything. They are diagnostic instruments: you read them to find which part of the system is slow, then you fix that part and watch the number respond. Reading all four together is the discipline — frequency rising while change failure rate rises is a queue of incidents forming, not an improvement.

> **Tip**
>
> A fifth measure, **reliability**, was added in later DORA reports and is worth adopting: it is the SLO attainment covered in §34. Its role is to stop the other four being pursued at the expense of the users, and it is the bridge between delivery metrics and site-reliability practice.

<a id="3-batch-size"></a>

## 3. Value Streams, Batch Size and Queueing

Delivery is a manufacturing system, and the mathematics of manufacturing systems applies to it surprisingly well. The two results worth knowing are **Little's Law** and the behaviour of utilisation near capacity, because together they explain why "everyone is busy" and "nothing ships" are the same observation.

Little's Law states that for a stable system, `lead time = work in progress ÷ throughput`. If ten changes are in flight and you complete two per day, the average change takes five days, regardless of how hard anyone works. There are exactly two ways to reduce lead time: raise throughput, or lower the amount of work in progress. The second is free and immediate, which is why limiting work in progress is the highest-leverage process change available to most teams.

The second result is about queues. As utilisation of any shared resource approaches 100%, waiting time does not rise linearly — it rises asymptotically. A CI runner pool at 60% utilisation has short queues; at 95% utilisation the same pool has queues an order of magnitude longer, because there is no slack to absorb variability. This is the reason a team that is fully allocated cannot absorb an incident, and the reason the answer to "the pipeline is slow" is sometimes "buy more runners" rather than "optimise the pipeline".

<a id="3-1-batch-size"></a>

### Why batch size dominates everything

Batch size is the amount of change released at once, and reducing it improves nearly every property of a delivery system simultaneously. The effect is not linear, because several costs scale super-linearly with batch size:

- **Diagnosis is O(1) instead of O(n)** A failure after a one-change deploy has one suspect. A failure after a fifty-change deploy has fifty, and the interactions between them. The time to identify a cause grows faster than the batch does.
- **Rollback is total instead of partial** Reverting a small batch loses one change. Reverting a large batch loses forty-nine good changes to undo one bad one, which is why teams with large batches argue about rolling back and then fix forward under pressure.
- **Integration risk is bounded** Merge conflicts and semantic conflicts scale with how long histories have diverged, not with lines written — see §5.
- **The cost is fixed overhead per release** Small batches only work if the per-release cost is near zero. A release that needs a change board, a manual checklist and a forty-minute pipeline cannot be made small; you must remove the overhead first, which is why automation precedes frequency.

> **Key idea**
>
> **This is the causal chain the entire course rests on.** Automating the release removes the fixed cost per deploy. Removing the fixed cost makes small batches affordable. Small batches make failure cheap to diagnose and cheap to reverse. Cheap reversal is what makes frequent deployment safe. Every practice in the following sections is an instance of one of those four links.

<a id="3-2-value-stream"></a>

### Mapping the value stream

A value stream map is a list of the steps between an idea and production, each annotated with two numbers: **process time** (how long the work takes) and **lead time** (how long it takes including waiting). The ratio of the two is the diagnosis. A step with 20 minutes of process time and two days of lead time is a queue, and queues are fixed by changing policy, not by working faster.

```text
step                    process   lead   waiting
────────────────────────────────────────────────────────────────────
write the change           4 h     4 h      0
open PR, wait review       5 m    31 h     31 h   ← policy, not effort
CI pipeline               42 m    42 m      0
wait for merge window      0      18 h     18 h   ← policy
deploy to staging          6 m     6 m      0
manual QA sign-off         2 h    26 h     24 h   ← policy
production deploy         11 m    11 m      0
────────────────────────────────────────────────────────────────────
totals                     7 h    80 h     73 h   ← 91% is waiting
```

The point of the exercise is almost always the same discovery: the great majority of elapsed time is waiting, not working, so optimising the working parts changes very little. In the map above, halving the pipeline duration saves 21 minutes out of 80 hours. Introducing a review service-level expectation and removing the merge window saves two days.

> **Tip**
>
> Run this exercise with the whole team and real timestamps from the last ten changes rather than from memory. Estimates of waiting time are consistently wrong in the same direction — people remember the work and not the queue — and the map is only persuasive if the numbers came from the tools.

<a id="unit-2"></a>

## Unit 2 — Source, Builds & Artifacts

From a commit to a reproducible, versioned artifact that can be promoted unchanged.

<a id="4-git"></a>

## 4. Git as the System of Record

Everything downstream assumes there is one authoritative description of what the system should be, and that it is a Git repository. Not just the application source: the Dockerfile, the manifests, the Terraform, the pipeline definition, the alert rules, the dashboards, the runbooks. If a fact about production lives only in a console, a wiki or someone's shell history, then no automation can act on it, no review can catch a mistake in it, and no history can tell you when it changed.

<a id="4-1-model"></a>

### The object model, briefly

Git stores four kinds of object, each addressed by the SHA of its contents: **blobs** (file contents), **trees** (directories, mapping names to blobs and trees), **commits** (a tree, a parent or parents, an author and a message) and **tags**. A branch is not a container of commits; it is a mutable file containing one commit SHA. This is worth internalising because it explains the operations that confuse people: a merge creates a commit with two parents, a rebase creates *new* commits with different SHAs and the same content, and "the branch was deleted" never means the commits are gone, only that a pointer was removed.

**Look at the objects directly**

```bash
# A commit is a tiny text object: a tree, parents, author, message.
git cat-file -p HEAD
# tree 9c4f0a...
# parent 3b1e77...
# author Ada  1767000000 +0000

# The tree is the directory listing at that commit.
git cat-file -p HEAD^{tree}
# 100644 blob 8e1a2c...    Dockerfile
# 040000 tree 5f7b90...    src

# A branch is one line of text containing a SHA.
cat .git/refs/heads/main

# Nothing is lost when a branch is deleted or a rebase rewrites history:
git reflog                  # every position HEAD has held, for 90 days
git fsck --lost-found       # commits no ref points at, still on disk
```

```text
        A---B---C   feature      each letter is a commit object
       /
  D---E---F---G     main         "main" is a file containing G's SHA

  merge:   creates H with parents G and C; A B C keep their SHAs
  rebase:  creates A' B' C' on top of G; A B C become unreferenced
           (still on disk, reachable via reflog, garbage-collected later)

  Consequence: rebasing a branch other people have pulled rewrites
  history they already have. That is why the rule is "rebase your own
  work before it is shared; merge after".
```

<a id="4-2-monorepo"></a>

### One repository or many

This decision affects the pipeline more than it affects the code, so it belongs here rather than in an architecture discussion. The honest summary is that both work and each moves a cost somewhere else.

|   | Monorepo | Many repositories |
| --- | --- | --- |
| Cross-cutting change | One atomic commit and one review | Coordinated PRs, merged in a careful order |
| Dependency versions | One version of everything; upgrades are org-wide events | Each service upgrades independently; drift is normal |
| CI cost | Needs change detection or it rebuilds the world | Naturally scoped, but duplicated configuration |
| Access control | Coarse; needs `CODEOWNERS` and tooling | Native, per repository |
| Tooling requirement | High — build graph, sparse checkout, caching | Low to start; grows into template sprawl |

> **Warning**
>
> **Never commit binaries or secrets, and understand why the second is not fixable.** Removing a secret from history with `filter-repo` rewrites every subsequent SHA, breaks every open branch, and does nothing about the clones, forks and CI caches that already have it. The commit is a distribution event: treat the credential as compromised, revoke it, then tidy up. Prevention — a pre-commit scanner and server-side push protection — is the only control that works.

<a id="5-branching"></a>

## 5. Branching, Review and Merge Queues

The central claim of this section is that merge pain is a function of *time apart*, not of tooling or of lines changed. Two histories that have diverged for six weeks contain six weeks of untested interaction, and no merge algorithm can evaluate that — Git resolves text, and the dangerous conflicts are semantic.

> **Interactive animation:** `branching` — rendered by the page script in the HTML version.

<a id="5-1-strategies"></a>

### The strategies, and what each optimises for

| Strategy | Shape | Good for | Cost |
| --- | --- | --- | --- |
| Trunk-based | One `main`; branches live hours | Continuous deployment of a web service | Requires flags, fast tests, additive migrations |
| GitHub flow | Short branch, PR, merge, deploy | Most teams; a good default | Degrades into long branches without discipline |
| Git flow | `develop`, `release/*`, `hotfix/*` | Versioned software with supported releases | Long-lived branches; large merges; slow lead time |
| Release branches | `main` plus a branch per supported version | Libraries, on-premise products, mobile apps | Backporting fixes to N branches |

Note that Git flow is not wrong — it was designed for software with multiple supported versions in the field, and it is still correct for that. It is simply a poor fit for a web service that deploys from `main`, where its release branches add days of lead time in exchange for a capability nobody uses.

<a id="5-2-review"></a>

### Review that catches things

Review effectiveness collapses with size. The research consistently shows defect detection falling sharply above roughly 400 changed lines, and any reviewer will confirm that a 2,000-line pull request receives an approval rather than a review. Small pull requests are therefore not a courtesy; they are the only condition under which review does anything.

The second lever is turnaround. A pull request waiting a day for review is a day of lead time and a day of divergence, and the author has context-switched away by the time comments arrive. Teams that treat review as an interrupt-driven activity with a target of a couple of hours see lead time fall more than they see it fall from any pipeline optimisation.

**Make the policy enforceable rather than aspirational**

```yaml
# CODEOWNERS routes review to people who know the code, automatically.
# Later rules win, so put the specific ones at the bottom.
*                       @acme/engineering
/infra/                 @acme/platform
/infra/prod/            @acme/platform @acme/security
/db/migrations/         @acme/dba
/.github/workflows/     @acme/platform          # pipeline = production access
Dockerfile              @acme/platform
```

```bash
# Branch protection: what "required" actually means at the API level.
gh api -X PUT repos/acme/api/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["ci/verify"] },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "require_code_owner_reviews": true,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

# How long are PRs actually waiting? Measure before prescribing.
gh pr list --state merged --limit 100 \
  --json createdAt,mergedAt --jq '.[]
    | ((.mergedAt|fromdate) - (.createdAt|fromdate)) / 3600' \
  | sort -n | awk '{a[NR]=$1} END {printf "median %.1f h, p90 %.1f h\n",
                                   a[int(NR/2)], a[int(NR*0.9)]}'
```

<a id="5-3-merge-queue"></a>

### The merge queue and the semantic conflict

Two pull requests can each be green against the `main` they branched from, and break when both are merged. One renames a function; the other adds a call to the old name. Neither branch ever contained both changes, so no pipeline run ever tested the combination, and Git reports no conflict because the two edits touched different files.

A **merge queue** solves this by building a speculative merge of the pull request with the current tip of `main`, running the checks against *that*, and merging only if it passes. With several pull requests queued it can test them optimistically in parallel — assuming each will pass — and discard the speculative results after a failure. The requirement it imposes is a test suite fast enough to run per-merge, which is the same requirement as everything else in this course.

> **Key idea**
>
> **"Green on my branch" is a statement about a state that will never exist in production.** The only useful question is whether the change is green *merged into the current trunk*. Either require branches to be up to date before merging (simple, serialises merges) or use a merge queue (parallel, needs tooling). Doing neither means you find out from production, which is where most "but CI was green" incidents come from.

<a id="6-builds"></a>

## 6. Builds, Determinism and Reproducibility

A build is a function from source to artifact, and the practical problem is that in almost every real project it is not a *pure* function. It also reads the network, the clock, the filesystem, the environment and the toolchain of whatever machine it ran on. Every one of those inputs is a way for two builds of the same commit to produce different programs, and that is the property that quietly invalidates test results.

<a id="6-1-nondeterminism"></a>

### Where non-determinism comes from

| Source | Example | Fix |
| --- | --- | --- |
| Floating base image | `FROM python:3.12-slim` rebuilt weekly upstream | Pin by digest: `python:3.12-slim@sha256:…` |
| Unpinned transitive dependency | `requests` pulls a new `urllib3` patch | Commit a lockfile covering the full graph (§7) |
| Network at build time | `curl … \| sh`, `apt-get install` without versions | Vendor, or pin exact versions and cache |
| Timestamps | Archive mtimes, `__DATE__`, build IDs | `SOURCE_DATE_EPOCH`, deterministic archive flags |
| Filesystem ordering | Glob expansion order differs between machines | Sort inputs explicitly |
| Toolchain drift | Different compiler minor version on a new runner | Build inside a pinned container image |

The strongest form of the goal is a **reproducible build**: the same source produces a byte-identical artifact on any machine at any time. Most teams do not need to go that far, but the distance you do go should be deliberate. The minimum that pays for itself immediately is: pin the base image by digest, commit the lockfile, and build inside a container so the toolchain is part of the pinned input rather than a property of the runner.

**Make a build a function of its inputs only**

```bash
# 1. Resolve the base image to a digest once, then commit that digest.
docker buildx imagetools inspect python:3.12-slim \
  --format '{{.Manifest.Digest}}'
# sha256:2f9a3c...   <- this is what belongs in the Dockerfile

# 2. Build with a fixed timestamp so archives and layers are stable.
export SOURCE_DATE_EPOCH=$(git log -1 --format=%ct)
docker buildx build \
  --build-arg SOURCE_DATE_EPOCH="$SOURCE_DATE_EPOCH" \
  --output type=image,name=ghcr.io/acme/api:"$GIT_SHA",rewrite-timestamp=true \
  .

# 3. Verify: build the same commit twice and compare digests.
a=$(docker buildx build -q --output type=image,push=false .)
b=$(docker buildx build -q --no-cache --output type=image,push=false .)
[ "$a" = "$b" ] && echo "reproducible" || echo "differs: $a vs $b"

# What actually differed? diffoci or dive will show the layer.
diffoci diff "docker://$a" "docker://$b" | head -40
```

```yaml
# Build in a pinned container so the runner's own toolchain is irrelevant.
# The job's inputs are then: the commit, the image digest, and the lockfile.
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/acme/builder@sha256:7c1e4b9d0a...   # not :latest
    steps:
      - uses: actions/checkout@v4
      - name: Fail if the lockfile does not match the manifest
        run: |
          pip install --require-hashes -r requirements.lock
          # --require-hashes refuses to install anything not pinned by hash,
          # which turns a supply-chain surprise into a build failure.
      - run: make build
```

<a id="6-2-caching"></a>

### Caching without losing correctness

Every build cache is a bet that a key identifies the output. Get the key wrong and you get the worst class of bug in delivery: a stale artifact that passes because it was built from different source than you think. The rule is that the key must contain *everything* the output depends on — the lockfile hash, the language version, the operating system, and the architecture — and nothing that it does not, or you will never get a hit.

> **Warning**
>
> **A cache keyed on the branch name is a correctness bug waiting to happen.** `key: deps-${{ github.ref }}` hits across unrelated dependency changes on the same branch and misses entirely for every new branch. Key on the content: `deps-${{ hashFiles('**/requirements.lock') }}`. Use `restore-keys` for a partial fallback, never for the primary key.

<a id="7-dependencies"></a>

## 7. Dependencies and Lockfiles

Most of the code you ship was written by strangers. A modest Node service resolves to a few thousand packages; a Python service with a data stack is not much better. You did not choose most of them — they arrived transitively — and you cannot read them. Dependency management is therefore not about curation but about *control*: knowing exactly what is in the build, being able to reproduce it, and being able to answer a vulnerability question quickly.

<a id="7-1-manifest-vs-lock"></a>

### Manifest versus lockfile

These two files do different jobs and conflating them is the root of most "works on my machine" dependency bugs. The **manifest** (`package.json`, `pyproject.toml`, `go.mod`) records your *intent*: usually a range, such as `^4.17.0`. The **lockfile** (`package-lock.json`, `poetry.lock`, `requirements.lock`) records the *resolution*: the exact version and hash of every package in the transitive graph, as decided at one moment in time.

The consequence is a rule with no exceptions: **commit the lockfile, and install from it in CI**. `npm install` may re-resolve and update the lock; `npm ci` installs exactly what is locked and fails if the manifest and lock disagree. The equivalents are `pip install --require-hashes -r`, `poetry install --no-update` and `go mod download` with a verified `go.sum`.

**Install from the lock, and know what is in it**

```bash
# In CI, never let the install step change the resolution.
npm ci                                  # fails if lock and manifest disagree
pip install --require-hashes -r requirements.lock
go mod download && go mod verify        # checks go.sum hashes

# Produce a lockfile with hashes from a loose manifest.
pip-compile --generate-hashes --output-file requirements.lock requirements.in

# What is actually in the graph, and who pulled it in?
npm ls urllib3 --all
pipdeptree --reverse --packages urllib3
go mod why -m golang.org/x/net

# Which of these have known vulnerabilities, and are they reachable?
npm audit --omit=dev
pip-audit -r requirements.lock
osv-scanner --lockfile=requirements.lock
```

```yaml
# Automated updates, batched so review is possible and noise is bounded.
version: 2
updates:
  - package-ecosystem: pip
    directory: /
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    groups:
      # One PR for all patch bumps: dozens of individual PRs get ignored,
      # which is how a team ends up a year behind.
      patch-updates:
        update-types: [patch]
      dev-dependencies:
        dependency-type: development
    ignore:
      - dependency-name: "numpy"
        update-types: [version-update:semver-major]   # needs a real migration

  - package-ecosystem: docker
    directory: /
    schedule: { interval: weekly }        # base images too - they age fastest

  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: monthly }       # pinned by SHA; this bumps the SHA
```

<a id="7-2-update-policy"></a>

### An update policy you will actually follow

The two failure modes are symmetrical. Never updating means that when a critical vulnerability lands you must jump four major versions under time pressure, which is the worst possible moment to discover a breaking API change. Updating everything immediately means a stream of pull requests nobody reviews and an occasional supply-chain surprise, since a compromised package is most dangerous in the hours after publication.

The workable middle is: automate patch and minor updates on a weekly batch, review major updates as real work with a ticket, apply security updates immediately but with a short cooling-off period for non-urgent ones, and keep the test suite good enough that an automated bump with a green pipeline is genuinely evidence.

- **Strength — lockfiles make the graph a fact** Once every dependency is pinned by version and hash, a build is reproducible, an SBOM is accurate, and "are we affected?" is a query rather than an investigation.
- **Weakness — pinning without updating is its own risk** A lockfile guarantees you install the same thing every time, including the same known-vulnerable version. Pinning is only half of the practice; the other half is a routine, low-drama update cadence.

<a id="8-artifacts"></a>

## 8. Artifacts, Versioning and Promotion

The artifact is the boundary between "code" and "a thing that runs". Everything before it is development; everything after it is delivery. The single rule that makes delivery tractable is that the artifact is built once and promoted unchanged — because that is what makes the evidence you collect at each gate apply to the thing you eventually run.

> **Interactive animation:** `build-promote` — rendered by the page script in the HTML version.

<a id="8-1-identity"></a>

### Identity: tags are names, digests are facts

A tag is a mutable pointer maintained by the registry; a digest is the SHA-256 of the image manifest. Anyone with push access can move a tag, and nobody can change a digest without producing a different digest. Deployments should therefore reference digests, and tags should exist for humans.

A useful convention is to apply three tags to every build — the commit SHA (immutable in practice, one per build), a semantic version on releases, and a moving environment alias such as `prod` that is updated by the promotion step. The manifest that the cluster reads always contains the digest.

**Promotion is a retag, never a rebuild**

```bash
IMAGE=ghcr.io/acme/api

# Build once. The SHA tag is the durable human-readable handle.
docker buildx build --push -t "$IMAGE:$GIT_SHA" .
DIGEST=$(docker buildx imagetools inspect "$IMAGE:$GIT_SHA" \
           --format '{{.Manifest.Digest}}')

# Promote by creating a new alias for the SAME manifest. No layers move,
# no bytes are rebuilt, and the digest is unchanged by construction.
docker buildx imagetools create -t "$IMAGE:staging" "$IMAGE@$DIGEST"
docker buildx imagetools create -t "$IMAGE:prod"    "$IMAGE@$DIGEST"

# Prove that staging and prod are the same artifact.
for env in staging prod; do
  docker buildx imagetools inspect "$IMAGE:$env" --format '{{.Manifest.Digest}}'
done | sort -u | wc -l          # must print 1
```

```python
"""Semantic versioning decided by commit messages, not by a human.

Conventional commits make the next version a function of what changed:
  fix:      -> patch      1.4.2 -> 1.4.3
  feat:     -> minor      1.4.2 -> 1.5.0
  BREAKING  -> major      1.4.2 -> 2.0.0
This removes a recurring argument and makes the changelog free.
"""
import re, subprocess

def next_version(current: str, commits: list[str]) -> str:
    major, minor, patch = (int(p) for p in current.lstrip("v").split("."))
    bump = "patch"
    for message in commits:
        if "BREAKING CHANGE" in message or re.match(r"^\w+(\(.+\))?!:", message):
            bump = "major"
            break
        if message.startswith("feat"):
            bump = "minor"
    if bump == "major":
        return f"{major + 1}.0.0"
    if bump == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

last = subprocess.check_output(["git", "describe", "--tags", "--abbrev=0"], text=True).strip()
log = subprocess.check_output(["git", "log", f"{last}..HEAD", "--format=%B"], text=True)
print(next_version(last, log.split("\n\n")))
```

<a id="8-2-environments"></a>

### What an environment actually is

If the artifact is identical everywhere, an environment is defined entirely by three things: its configuration, its data, and its scale. That is a useful definition because it tells you what a staging environment can and cannot prove. It can prove that the artifact starts, that migrations apply, that integrations connect. It cannot prove anything that depends on production data volume, production traffic shape or production concurrency — which is why the most valuable additions to a delivery system are usually production-side (canaries, flags, good telemetry) rather than another pre-production environment.

> **Key idea**
>
> **Everything that differs between environments must be injected, and the test is concrete:** can you run the production image on a laptop, pointing at a local database, changing nothing but environment variables? If yes, config is separated from code. If it needs a different build, a different tag, or an `if ENV == "prod"` branch, then your environments are running different programs and every "it worked in staging" is a coincidence.

<a id="unit-3"></a>

## Unit 3 — Containers & Kubernetes

The runtime layer, from Linux primitives to container images to a Kubernetes cluster.

<a id="9-linux"></a>

## 9. Linux Foundations for DevOps

Containers, orchestration and most production debugging are applications of a handful of Linux mechanisms. This section is the minimum that makes the next four sections mechanical rather than magical. If you want the full treatment, the [Operating Systems detailed course](../../os/os-detailed-course.html) covers each of these from first principles.

<a id="9-1-processes"></a>

### Processes, signals and exit codes

A container is a process, so process semantics are container semantics. The pieces that matter daily:

- **SIGTERM** `catchable`
- **SIGKILL** `not catchable`
- **Exit 137** `128 + 9 = killed`
- **Exit 143** `128 + 15 = terminated`

Graceful shutdown is entirely a `SIGTERM` story. The orchestrator sends `SIGTERM`, waits a grace period, then sends `SIGKILL`. If your process ignores `SIGTERM` — or never receives it, because it is a child of a shell that is PID 1 — every deploy drops in-flight requests, and the symptom is a small, permanent error spike at each rollout that nobody can explain.

**Signals, PID 1 and the shell-form trap**

```bash
# The classic bug: shell form makes /bin/sh PID 1, and sh does not forward
# signals to its child. SIGTERM is swallowed; every stop becomes a SIGKILL.
CMD python app.py                 # BAD  -> runs: /bin/sh -c "python app.py"

# Exec form: your process is PID 1 and receives the signal directly.
CMD ["python", "app.py"]          # GOOD

# If you genuinely need a shell wrapper, exec so the child replaces it:
#   entrypoint.sh
#!/bin/sh
set -e
run_migrations
exec python app.py                # exec = same PID, signals arrive

# PID 1 also has no default signal handlers and does not reap orphans.
# If your process spawns children, use an init: tini, or docker run --init.

# Confirm what a container is actually running as PID 1:
docker exec api ps -o pid,ppid,cmd
kubectl exec api-7d4-x9k -- cat /proc/1/cmdline | tr '\0' ' '
```

```python
"""Graceful shutdown in practice: fail readiness first, then drain."""
import signal, sys, threading

shutting_down = threading.Event()

def handle_term(signum, frame):
    # 1. Stop passing the readiness probe so the load balancer stops
    #    sending new work. This must happen BEFORE we stop accepting.
    shutting_down.set()

    # 2. Give endpoint removal time to propagate through kube-proxy and
    #    any external load balancer. Without this, requests arrive after
    #    the socket closes and users see 502s at every rollout.
    threading.Timer(5.0, drain_and_exit).start()

def drain_and_exit():
    server.shutdown(graceful_timeout=25)   # finish in-flight work
    db.close()
    sys.exit(0)                            # exit 0: an expected stop

signal.signal(signal.SIGTERM, handle_term)
signal.signal(signal.SIGINT, handle_term)
```

<a id="9-2-filesystem"></a>

### Filesystems, mounts and the things that fill up

Two production incidents recur often enough to be worth pre-empting. The first is a full disk on a node, almost always from container logs or unpruned images; the second is **inode** exhaustion, where `df -h` shows plenty of space and writes still fail, because millions of tiny files have consumed the inode table. Check both.

**Triage a node that has stopped accepting writes**

```bash
df -h                       # space
df -i                       # inodes - the one people forget
du -xh --max-depth=1 /var | sort -h | tail

# Almost always one of these two on a container host:
du -sh /var/lib/docker/containers/*/*-json.log | sort -h | tail
docker system df            # images, containers, volumes, build cache
docker system prune -af --filter 'until=168h'

# A deleted file still held open by a process keeps its blocks. This is why
# "I deleted the log and df did not change" happens.
lsof +L1 | head

# Bound it permanently instead of cleaning it repeatedly.
cat /etc/docker/daemon.json
# { "log-driver": "json-file",
#   "log-opts": { "max-size": "50m", "max-file": "3" } }
```

```text
Node pressure, and what Kubernetes does about it
────────────────────────────────────────────────
DiskPressure     kubelet garbage-collects images, then evicts pods
MemoryPressure   kubelet evicts pods, lowest QoS class first
PIDPressure      kubelet evicts pods

QoS class decides eviction order, and it is derived, not declared:
  Guaranteed   requests == limits for every resource   evicted last
  Burstable    requests < limits                       evicted next
  BestEffort   no requests or limits set               evicted first

Practical consequence: a pod with no resource requests is the first thing
thrown overboard when a node runs short - which is usually the pod whose
author assumed "no limits" meant "unlimited".
```

> **Tip**
>
> Learn four commands well and most production triage is covered: `ss -tlnp` (what is listening, and which process owns it), `lsof -p PID` (what a process has open), `strace -f -p PID` (what it is asking the kernel for, when it appears stuck) and `dmesg -T | tail` (what the kernel did to it — OOM kills appear here in full detail).

<a id="10-container-internals"></a>

## 10. Container Internals

There is no container object in the Linux kernel. A container is a normal process started with a set of restrictions applied, and the restrictions come from three independent mechanisms: namespaces (what it can see), cgroups (what it can use) and a union filesystem (what its root looks like). Understanding them separately is what makes container behaviour predictable.

> **Interactive animation:** `container-isolation` — rendered by the page script in the HTML version.

<a id="10-1-namespaces"></a>

### Namespaces

A namespace virtualises a global kernel resource so that processes inside it see their own instance. They are created with `clone()` or `unshare()` and are independent of one another — you can use one without the others, which is exactly what tools like `bubblewrap` do.

| Namespace | Virtualises | Why you notice it |
| --- | --- | --- |
| `pid` | Process IDs | Your app is PID 1 and inherits init duties (§9) |
| `mnt` | Mount points | The image's filesystem is the root; volumes are mounts |
| `net` | Interfaces, ports, routes | Port 5000 inside is not port 5000 on the host |
| `uts` | Hostname | The container has its own hostname |
| `ipc` | Shared memory, semaphores | Default `/dev/shm` is 64 MB — breaks Chrome, Postgres |
| `user` | UID/GID mapping | Root inside can be an unprivileged UID outside |
| `cgroup` | The cgroup root | The container cannot see the host's cgroup tree |

**Build a container by hand, to see there is no magic**

```bash
# A "container" with nothing but standard tools. unshare creates the
# namespaces; chroot swaps the root; that is essentially the whole idea.
sudo unshare --pid --mount --uts --net --ipc --fork --mount-proc \
     chroot /var/lib/rootfs /bin/sh

# Inside: your shell is PID 1 and sees nothing else.
ps aux
hostname container-1              # own UTS namespace, host is unaffected
ip addr                           # only lo - own net namespace

# From the host, the same process is perfectly ordinary:
ps -ef | grep '[/]bin/sh'
ls -l /proc//ns/             # one symlink per namespace it belongs to
nsenter -t  -a /bin/sh       # join those namespaces = docker exec
```

```text
What the runtime does, in order, when you "start a container"
─────────────────────────────────────────────────────────────
1. pull   fetch the manifest, then each missing layer by digest
2. unpack extract layers into the content store
3. mount  overlayfs: image layers = lowerdir (read-only)
                     new empty dir = upperdir (writable)
                     merged view    = the container's /
4. clone  create the process with CLONE_NEWPID|NEWNS|NEWNET|NEWUTS|...
5. cgroup place the PID in a cgroup with cpu.max, memory.max, pids.max
6. mount  /proc, /sys, /dev, plus every volume and bind mount
7. secure apply seccomp profile, drop capabilities, set no_new_privs,
          apply AppArmor/SELinux label, switch to the image's USER
8. exec   replace the process image with the container's ENTRYPOINT

Writes go to upperdir. Deleting a file from a lower layer creates a
"whiteout" marker - the original bytes remain in the layer below, which
is why "RUN rm secret.txt" does not remove the secret from the image.
```

<a id="10-2-cgroups"></a>

### cgroups v2 and what the limits really do

cgroups control resource consumption, and the asymmetry between CPU and memory is the single most practically important fact about them. CPU is compressible: exceed your share and you are throttled, which makes you slow. Memory is not: exceed the limit and the kernel's OOM killer terminates you immediately with `SIGKILL`, which is why exit code 137 comes with no stack trace.

CPU throttling is worth understanding in detail because it produces latency that looks like a network problem. The kernel enforces `cpu.max` over a period — by default 100 ms. A limit of `50000 100000` means 50 ms of CPU per 100 ms window. A request that needs 60 ms of CPU therefore runs for 50 ms, is stopped, and resumes at the start of the next window: a 50 ms pause with the CPU idle. Multi-threaded runtimes burn the quota even faster, which is why aggressive CPU limits on a JVM or Node service can produce p99 latency spikes while average utilisation looks healthy.

**Read the cgroup, and catch throttling**

```bash
# Inside the container, cgroup v2 exposes everything as files.
cat /sys/fs/cgroup/cpu.max           # "50000 100000" = 0.5 CPU per 100ms
cat /sys/fs/cgroup/memory.max        # bytes, or "max"
cat /sys/fs/cgroup/memory.current    # what you are using now
cat /sys/fs/cgroup/memory.peak       # the high-water mark

# The number that explains mysterious latency:
cat /sys/fs/cgroup/cpu.stat
# nr_periods 21400
# nr_throttled 4820        <- 22% of periods hit the ceiling
# throttled_usec 91234000  <- 91 seconds of enforced idleness

# The same signal in Prometheus, which is where you should alert on it:
#   rate(container_cpu_cfs_throttled_periods_total[5m])
# / rate(container_cpu_cfs_periods_total[5m]) > 0.25
```

```yaml
# A defensible default for a latency-sensitive service.
resources:
  requests:
    cpu: "500m"        # scheduling reservation; base it on observed p50
    memory: "512Mi"
  limits:
    # No CPU limit. Controversial, and correct more often than not: the
    # request already guarantees a share, and a limit only adds throttling
    # when there is idle CPU available. Set one when you need hard
    # multi-tenancy or predictable billing.
    memory: "512Mi"    # equal to the request => Guaranteed QoS, evicted last

# Batch work is the opposite case: throughput matters, latency does not,
# so a CPU limit is a reasonable way to stop it starving other pods.
```

> **Warning**
>
> **Containers share the host kernel, so "isolated" is a statement about tidiness, not about security.** A kernel vulnerability, a privileged container, a mounted Docker socket or a `hostPath` onto `/` each turn container access into host access. The defence in depth that actually helps: run as a non-root user, drop all capabilities and add back only what is needed, set `readOnlyRootFilesystem`, keep the default seccomp profile, and never mount `/var/run/docker.sock` into a workload.

<a id="11-dockerfiles"></a>

## 11. Writing Dockerfiles

A Dockerfile is a list of instructions, each producing one layer, and each layer's cache key is the instruction text plus the digest of everything beneath it. That single sentence explains nearly every optimisation and nearly every mistake: **invalidating a layer invalidates every layer below it**, so instructions must be ordered from least to most frequently changing.

> **Interactive animation:** `image-layers` — rendered by the page script in the HTML version.

<a id="11-1-multistage"></a>

### Multi-stage builds

A multi-stage build lets you compile in one image and ship another. The build stage may contain a compiler, development headers, test dependencies and build secrets; the final stage contains only what runs. The benefits compound: a smaller image pulls faster, has fewer packages to appear in a CVE scan, and gives an attacker a smaller toolkit if they get code execution — a container with no shell and no package manager is a meaningfully worse place to land.

**A production Dockerfile, annotated line by line**

```bash
# syntax=docker/dockerfile:1.7

# ---------- build stage: everything expensive and disposable -------------
FROM python:3.12-slim@sha256:2f9a3c... AS build
WORKDIR /app

# Only the dependency manifest, so this layer's cache survives source edits.
COPY requirements.lock .

# --mount=type=cache keeps the wheel cache OUTSIDE the layer: fast rebuilds
# without shipping the cache. --require-hashes refuses anything unpinned.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --require-hashes --prefix=/install -r requirements.lock

# A private index needs a token. --mount=type=secret keeps it out of the
# image entirely; an ARG or ENV would be permanently readable in the layer.
RUN --mount=type=secret,id=pip_token \
    PIP_INDEX_URL="https://$(cat /run/secrets/pip_token)@pypi.acme.dev" \
    pip install --prefix=/install acme-internal==2.1.0

COPY . .
RUN python -m compileall -q .

# ---------- runtime stage: only what is needed to serve -----------------
FROM python:3.12-slim@sha256:2f9a3c... AS runtime

# Non-root, created before anything is copied so ownership is right.
RUN groupadd -r app && useradd -r -g app -u 10001 app

COPY --from=build /install /usr/local
COPY --from=build --chown=app:app /app /app

WORKDIR /app
USER 10001
EXPOSE 8080

# Exec form: the process is PID 1 and receives SIGTERM directly.
ENTRYPOINT ["python", "-m", "app"]
```

```text
Ordering rules, and the reason for each
───────────────────────────────────────
1. FROM pinned by digest       reproducible; a moved tag cannot change you
2. system packages             change monthly; one RUN, cleaned in the same
                               layer (rm -rf /var/lib/apt/lists/*), because
                               a later RUN cannot shrink an earlier layer
3. dependency manifest only    the highest-value cache boundary there is
4. install dependencies        expensive; must sit above the source copy
5. application source          changes hourly; keep it last
6. USER, EXPOSE, ENTRYPOINT    metadata, free

.dockerignore is not optional
─────────────────────────────
.git/            often larger than the application
node_modules/    will be reinstalled inside; copying breaks native modules
**/.env          the single most common way a secret enters an image
__pycache__/     invalidates COPY for no reason
*.md, tests/     not needed at runtime

Base image, in decreasing size and increasing operational difficulty:
  ubuntu (~78 MB)      familiar, full package manager
  debian-slim (~30 MB) sensible default for most services
  alpine (~7 MB)       musl libc: subtle bugs with glibc wheels and DNS
  distroless (~2 MB)   no shell, no package manager - best security,
                       and "kubectl exec" no longer gives you a prompt
  scratch (0 B)        static binaries only (Go, Rust)
```

<a id="11-2-buildkit"></a>

### BuildKit features worth using

BuildKit is the default builder and it changes what a Dockerfile can express. Three features matter in a pipeline. **Cache mounts** (`--mount=type=cache`) persist a package cache between builds without adding it to a layer. **Secret mounts** (`--mount=type=secret`) expose a value to one `RUN` without recording it anywhere. And **parallel stages**: independent stages in the graph build concurrently, so splitting a build into stages can be faster as well as smaller.

> **Warning**
>
> **`ARG` and `ENV` are not places to put secrets.** `ENV` persists into the image's configuration and is visible to anyone who can pull it. `ARG` does not persist as an environment variable, but it is recorded in the build history and is visible in `docker history`. Use `--mount=type=secret`, or fetch the value at run time (§30). And remember the whiteout rule — deleting a secret file in a later layer does not remove the bytes from the earlier one.

> **Tip**
>
> `HEALTHCHECK` in a Dockerfile is useful for Compose and for plain Docker, and is ignored by Kubernetes, which uses its own probes. Do not rely on it for orchestration — but do keep the endpoint it would call, because that same endpoint is what your `readinessProbe` will use.

<a id="12-registries"></a>

## 12. Registries, Tags and Digests

A registry stores **manifests** and **blobs**. A manifest is a small JSON document listing the config blob and the layer blobs, each by digest; the image digest is the SHA-256 of that manifest. Layers are content-addressed and shared, which is why pushing a new version of an image that changed one file uploads a few megabytes rather than the whole thing.

For multi-architecture images there is a second level: a **manifest list** (or image index) that maps platforms to per-platform manifests. When you pull `api:v1.9.0` on an ARM laptop and on an x86 node, both resolve through the same list to different manifests — which is worth knowing because the digest you pin should usually be the *index* digest, not one platform's.

**Inspect a registry without pulling anything**

```bash
IMAGE=ghcr.io/acme/api

# The manifest list: which platforms exist, and their digests.
docker buildx imagetools inspect "$IMAGE:v1.9.0" --raw | jq '
  .manifests[] | {os: .platform.os, arch: .platform.architecture, digest: .digest}'

# The build history - visible WITHOUT pulling the layers. This is why a
# secret in an ENV or ARG line is public to anyone with read access.
crane config "$IMAGE:v1.9.0" | jq -r '.history[].created_by'

# Which tags point at the same digest? (Promotion should produce several.)
for t in $(crane ls "$IMAGE"); do
  printf '%-16s %s\n' "$t" "$(crane digest "$IMAGE:$t")"
done | sort -k2

# Copy between registries without a local pull - promotion across accounts.
crane copy "$IMAGE@sha256:9f2c..." registry.internal/acme/api:prod
```

```yaml
# Retention: registries grow without bound and storage is not the real cost -
# the real cost is that nobody can tell which of 4 000 tags is live.
# Keep every digest that is deployed anywhere; expire the rest on age.
rules:
  - description: keep semantic release tags forever
    tagPrefix: ["v"]
    action: retain

  - description: keep commit-SHA builds for 90 days
    tagPattern: "^[0-9a-f]{40}$"
    olderThanDays: 90
    action: delete

  - description: never delete a digest referenced by a running workload
    protect: referenced-by-cluster        # requires an inventory job

  - description: untagged manifests after 7 days
    untagged: true
    olderThanDays: 7
    action: delete
```

<a id="12-1-tag-hygiene"></a>

### Tag hygiene, and why `latest` is a bug

Tags are mutable references. `latest` is not a special version — it is simply the tag applied when none is given — and using it in a deployment produces three specific failures. You cannot say what is running, because Pods started at different times may differ. You cannot roll back, because the previous version has no stable name. And scaling becomes an unplanned deploy: a Pod scheduled during an incident pulls whatever `latest` means at that moment.

| Reference | Mutable? | Use for |
| --- | --- | --- |
| `api:latest` | Yes | Local experiments only |
| `api:v1.9.0` | Yes, in principle | Human communication, changelogs |
| `api:9f2c1ab` | Yes, unique in practice | Tracing an artifact back to a commit |
| `api@sha256:…` | No, by construction | Deployment manifests, policy, audit |

> **Key idea**
>
> **Deploy by digest and the whole class of "which version is running?" questions disappears.** It also makes `imagePullPolicy: IfNotPresent` correct and fast, since the content behind a digest cannot change, and it lets an admission policy (§37) reject anything referenced by a mutable tag. Let the pipeline resolve the digest at build time and write it into the manifest; humans keep reading the version tag next to it.

<a id="13-running-containers"></a>

## 13. Running Containers — Compose, Networks, Volumes

Before orchestration there is the local environment, and it deserves attention because it is where every developer spends their day. The goal is a single command that produces a working system: the application plus its real dependencies, with the same image that CI will build.

<a id="13-1-networking"></a>

### Container networking, concretely

Each container gets its own network namespace with a virtual interface, one end of a `veth` pair whose other end sits on a bridge on the host. Containers on the same user-defined bridge can reach each other by *container name*, because the runtime provides an embedded DNS resolver. Reaching a container from outside requires a published port, which is a NAT rule mapping a host port to the container's.

Two consequences catch people out. First, `localhost` inside a container is the container, not the host — a database on the host machine is reachable at `host.docker.internal`, not at `127.0.0.1`. Second, on the default bridge network there is no DNS between containers, which is why anything non-trivial should use an explicit user-defined network (Compose creates one for you).

**A local environment that matches CI**

```yaml
# compose.yaml - one command to a working system.
services:
  api:
    build:
      context: .
      target: build          # dev uses the build stage: it has the toolchain
    environment:
      # Service name, not localhost: Compose's DNS resolves "db" to the
      # container's IP on the project network.
      DATABASE_URL: postgres://app:app@db:5432/app
      LOG_LEVEL: debug
    ports: ["8080:8080"]
    volumes:
      - .:/app               # bind mount: edit locally, run in the container
      - /app/.venv           # anonymous volume masks the host's venv
    depends_on:
      db: { condition: service_healthy }   # wait for READY, not for "started"

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    volumes:
      - pgdata:/var/lib/postgresql/data    # named volume: survives down/up
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 2s
      timeout: 3s
      retries: 15

volumes:
  pgdata:
```

```bash
# Bring it up and watch it converge.
docker compose up -d --build
docker compose ps                         # health column, not just "Up"
docker compose logs -f api

# Where does data actually live? Three kinds of storage, three lifetimes.
docker volume ls                          # named: survives compose down
docker inspect api --format '{{json .Mounts}}' | jq

#   named volume   managed by Docker, survives, use for databases
#   bind mount     a host path, use for source in development only
#   tmpfs          memory only, use for secrets and scratch

# The classic "my database is empty again" cause:
docker compose down            # keeps named volumes
docker compose down -v         # DELETES them - this is the one that hurts

# Networking reality check.
docker compose exec api getent hosts db   # embedded DNS resolves the name
docker network inspect "$(basename "$PWD")_default" | jq '.[0].Containers'
```

<a id="13-2-dev-prod-parity"></a>

### Development/production parity, honestly

Compose gets you the same dependencies and the same image lineage; it does not get you the same orchestration. Probes, resource limits, rolling updates, service meshes and network policies do not exist locally, so bugs in those areas can only be found in a real cluster. The pragmatic split most teams settle on: Compose for the inner development loop, and a shared or ephemeral Kubernetes environment for anything that depends on orchestration behaviour.

- **Strength — onboarding measured in minutes** One file, one command, no "install these six services first" page in the wiki. Keeping that command working is one of the highest-return investments a team can make, because every developer pays the cost of it being broken every day.
- **Weakness — it drifts silently** Compose files rot: a service is added to production and not locally, a version diverges, a seed script stops matching the schema. Running `compose up` in CI on a schedule is the cheapest way to notice.

<a id="14-k8s-architecture"></a>

## 14. Kubernetes Architecture

Kubernetes is a distributed system whose components share one interaction pattern: they watch the API server for objects they care about, compute a difference against reality, act, and write the result back as status. There is no orchestrator co-ordinating them — every component is a level-based controller reading from a single source of truth.

> **Interactive animation:** `k8s-reconcile` — rendered by the page script in the HTML version.

<a id="14-1-components"></a>

### The components and what each is responsible for

| Component | Runs on | Responsibility | If it is down |
| --- | --- | --- | --- |
| `etcd` | Control plane | The only durable state; a consistent key-value store | Nothing can change; running workloads continue |
| `kube-apiserver` | Control plane | Validation, admission, auth, the only writer to etcd | No `kubectl`, no reconciliation; Pods keep running |
| `kube-scheduler` | Control plane | Assigns pending Pods to nodes | New Pods stay `Pending` |
| `kube-controller-manager` | Control plane | ReplicaSet, endpoints, node lifecycle and dozens more | No self-healing, no rollouts |
| `kubelet` | Every node | Starts containers, runs probes, reports node status | That node's Pods are unmanaged; node goes NotReady |
| `kube-proxy` / CNI | Every node | Programs Service routing and pod networking | Service IPs stop resolving to Pods |

The row worth pausing on is the last column. A control plane outage is serious but not immediately user-visible: existing Pods keep serving because the kubelet and the data plane are independent of the API server. What stops is *change* — no scaling, no rollouts, no replacement of failed Pods. That distinction matters when you are deciding how much to invest in control-plane availability.

<a id="14-2-request-path"></a>

### What happens when you run `kubectl apply`

```text
kubectl apply -f deployment.yaml
  │
  ├─ 1. authentication      cert / token / OIDC → user + groups
  ├─ 2. authorisation       RBAC: may this subject do this here?
  ├─ 3. mutating admission  webhooks and defaults edit the object
  ├─ 4. schema validation   is it a valid Deployment?
  ├─ 5. validating          policy engines may reject it
  └─ 6. persist to etcd     the object exists; the call returns
                            ↓  only now does anything happen
  deployment controller  no ReplicaSet  → creates one
  replicaset controller  0 of 3 Pods    → creates 3 Pod objects
  scheduler              no nodeName    → binds each to a node
  kubelet (per node)     Pod bound here → pulls image, starts it
  endpoints controller   Pod is Ready   → adds it to the Service
  kube-proxy / CNI       endpoint added → programs the data path
```

Read that list once more and notice that no component calls another. Each one watches the API server and writes back to it. That is why Kubernetes is extensible without modification: an operator you write is simply one more watcher in this list, and why the universal debugging technique is `kubectl describe` followed by `kubectl get events` — the events are the trail these controllers leave.

**Debug from the outside in**

```bash
# Always start here: spec vs status, then the events underneath.
kubectl describe deployment api | sed -n '/Conditions/,$p'
kubectl get events --sort-by=.lastTimestamp -n prod | tail -30

# A Pod that will not schedule tells you exactly why in its events:
#   0/8 nodes are available: 5 Insufficient cpu,
#                            2 node(s) had untolerated taint,
#                            1 node(s) didn't match node selector.
kubectl describe pod api-7d4-x9k | sed -n '/Events/,$p'

# Rollout stuck? The status message names the blocking condition.
kubectl rollout status deployment/api --timeout=60s
kubectl get rs -l app=api -o wide      # which ReplicaSet is scaling, or not

# What is the API server actually being asked? Audit at the source:
kubectl get --raw '/metrics' | grep apiserver_request_total | head

# Which permissions do I have here? Faster than reading RoleBindings.
kubectl auth can-i --list -n prod
kubectl auth can-i delete pods -n prod --as system:serviceaccount:prod:deployer
```

```yaml
# RBAC is additive and deny-by-default: no rule means no permission,
# and there is no explicit deny. Bind the smallest role that works.
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: prod
  name: deployer
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "patch", "update"]   # no delete, no create
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: []                                    # deliberately empty
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { namespace: prod, name: ci-deployer }
subjects:
  - kind: ServiceAccount
    name: ci
    namespace: prod
roleRef: { kind: Role, name: deployer, apiGroup: rbac.authorization.k8s.io }
```

> **Interview**
>
> **"What happens when a node dies?"** The answer traces the loop. The node stops sending heartbeats; after `node-monitor-grace-period` (40 s by default) the node controller marks it `NotReady` and applies a taint; after the toleration period (300 s by default) the Pods on it are marked for deletion; the ReplicaSet controller then observes fewer Pods than desired and creates replacements, which the scheduler places elsewhere. Note the total: roughly five and a half minutes by default before replacement Pods are even scheduled, which surprises people who expect instant recovery. If that is too slow, the knobs are the toleration seconds and a PodDisruptionBudget — and the real answer for a latency-sensitive service is to have had capacity in another zone all along.

<a id="15-k8s-workloads"></a>

## 15. Kubernetes Workloads

A **Pod** is the unit of scheduling: one or more containers that share a network namespace, an IPC namespace and optionally volumes. Sharing the network namespace is what makes sidecars work — containers in a Pod reach each other on `localhost` — and it is also why two containers in a Pod cannot both bind port 8080.

You rarely create Pods directly. Higher-level workload objects create them and manage their lifecycle, and choosing correctly between the five is mostly a question of what identity and ordering your application needs.

| Object | Creates | Use when | Key property |
| --- | --- | --- | --- |
| Deployment | ReplicaSet → Pods | Stateless services | Interchangeable Pods, rolling updates, easy rollback |
| StatefulSet | Pods with stable names | Databases, queues, anything with a peer identity | `api-0`, `api-1`; ordered start; own PVC |
| DaemonSet | One Pod per node | Log shippers, node exporters, CNI agents | Follows nodes automatically as the cluster scales |
| Job | Pods that must complete | Migrations, batch work | Retries to `backoffLimit`; tracks completions |
| CronJob | Jobs on a schedule | Reports, cleanup | Concurrency policy; misses if the controller was down |

<a id="15-1-rollouts"></a>

### How a Deployment rollout actually proceeds

Changing the Pod template creates a *new* ReplicaSet. The Deployment controller then scales the new one up and the old one down, respecting two numbers: `maxSurge` (how far above the desired count it may go) and `maxUnavailable` (how far below). Both default to 25%. The old ReplicaSet is kept at zero replicas, which is exactly what makes `kubectl rollout undo` fast — the rollback is a scale-up of something that already exists.

The gate at every step is readiness. A new Pod counts as available only once its `readinessProbe` passes and `minReadySeconds` has elapsed. Without a readiness probe, "available" means "the process started", and the rollout will happily terminate healthy old Pods in exchange for new ones that are not yet serving.

**A Deployment with the fields that matter set deliberately**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 6
  revisionHistoryLimit: 5          # how many ReplicaSets to keep for rollback
  minReadySeconds: 10              # "ready" must hold for 10s before counting
  progressDeadlineSeconds: 600     # after this, the rollout is marked Failed
  selector:
    matchLabels: { app: api }      # immutable after creation - choose carefully
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2                  # up to 8 pods briefly
      maxUnavailable: 0            # never dip below 6 - costs capacity, not risk
  template:
    metadata:
      labels: { app: api, version: v1-9-0 }
    spec:
      terminationGracePeriodSeconds: 45
      topologySpreadConstraints:   # do not let all 6 land in one zone
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels: { app: api }
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:9f2c1ab...
          readinessProbe:
            httpGet: { path: /readyz, port: 8080 }
            periodSeconds: 5
          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits:   { memory: 512Mi }
          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
---
# A PodDisruptionBudget protects you from VOLUNTARY disruption - node
# drains, cluster upgrades, descheduling. It does not help when a node
# crashes; that is involuntary and no budget applies.
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api }
spec:
  minAvailable: 4
  selector:
    matchLabels: { app: api }
```

```bash
# Watch a rollout as the two ReplicaSets cross over.
kubectl rollout status deployment/api
watch -n1 'kubectl get rs -l app=api \
  -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,READY:.status.readyReplicas'

# Stuck rollouts: the reason is always in the Deployment conditions.
kubectl get deployment api -o jsonpath='{.status.conditions}' | jq
#   ProgressDeadlineExceeded  -> new pods never became ready
#   ReplicaFailure            -> pods cannot be created (quota, RBAC, image)

# Pause mid-rollout to inspect the new version before it goes further.
kubectl rollout pause deployment/api
kubectl logs -l version=v1-9-0 --tail=50
kubectl rollout resume deployment/api      # or: rollout undo

# Rollback to a specific revision, not just the previous one.
kubectl rollout history deployment/api
kubectl rollout undo deployment/api --to-revision=7
```

> **Warning**
>
> **`maxUnavailable: 0` with `maxSurge: 0` deadlocks the rollout** — nothing may be removed and nothing may be added, so no progress is possible and the rollout sits until `progressDeadlineSeconds` expires. Similarly, a PodDisruptionBudget with `minAvailable` equal to `replicas` makes node drains hang forever, which turns a routine cluster upgrade into an outage of the upgrade itself.

<a id="16-k8s-networking"></a>

## 16. Kubernetes Networking

The Kubernetes network model has three rules, and everything else is an implementation of them: every Pod gets its own IP; every Pod can reach every other Pod without NAT; and agents on a node can reach all Pods on that node. A CNI plugin — Calico, Cilium, the cloud provider's — is what makes those rules true on your infrastructure.

> **Interactive animation:** `k8s-networking` — rendered by the page script in the HTML version.

<a id="16-1-services"></a>

### Service types, and what each actually programs

| Type | Reachable from | Mechanism |
| --- | --- | --- |
| `ClusterIP` | Inside the cluster only | iptables or IPVS rules on every node DNAT the virtual IP |
| `NodePort` | Any node's IP on a high port | ClusterIP plus a port opened on every node |
| `LoadBalancer` | The internet | NodePort plus a cloud load balancer, provisioned by a controller |
| `ExternalName` | Inside the cluster | A DNS CNAME; no proxying at all |
| Headless (`clusterIP: None`) | Inside the cluster | DNS returns every Pod IP; the client load-balances |

A ClusterIP has no process behind it. It is a virtual address that exists only as rules in each node's kernel, installed by `kube-proxy` from the Endpoints (or EndpointSlice) object. That is why you cannot ping a Service IP, why `tcpdump` on the Service IP shows nothing, and why a Service with an empty endpoint list produces "connection refused" rather than a timeout.

<a id="16-2-ingress"></a>

### Ingress, Gateway API and TLS

An Ingress object is a set of host and path rules; an ingress controller (NGINX, Traefik, Envoy) is the thing that reads them and configures a real proxy. One cloud load balancer fronts the controller, and the controller fans out to many services — which is the entire economic argument for Ingress over a LoadBalancer Service per application. The **Gateway API** is the newer replacement, designed to separate the infrastructure owner's concerns (the Gateway) from the application team's (the routes).

**Routing, DNS and policy**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt      # issues + renews the cert
    nginx.ingress.kubernetes.io/proxy-body-size: 10m
spec:
  ingressClassName: nginx
  tls:
    - hosts: [api.acme.dev]
      secretName: api-tls                            # populated by cert-manager
  rules:
    - host: api.acme.dev
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service: { name: orders, port: { number: 80 } }
---
# NetworkPolicy is deny-by-default ONCE a policy selects a pod, and
# ineffective before that. Start with a namespace-wide default deny.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: prod }
spec:
  podSelector: {}                                    # every pod
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: api-allows-ingress-controller, namespace: prod }
spec:
  podSelector:
    matchLabels: { app: api }
  policyTypes: [Ingress]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels: { kubernetes.io/metadata.name: ingress-nginx }
      ports:
        - { protocol: TCP, port: 8080 }
```

```bash
# Cluster DNS. The search path is why "orders" works from inside a namespace.
kubectl run tmp --rm -it --image=nicolaka/netshoot -- bash
  cat /etc/resolv.conf
  # search prod.svc.cluster.local svc.cluster.local cluster.local
  dig +short orders.prod.svc.cluster.local
  dig +short SRV _http._tcp.orders.prod.svc.cluster.local

# Debugging a Service that "does not work" - in this order:
kubectl get svc orders -o wide                 # does it have a ClusterIP?
kubectl get endpointslice -l kubernetes.io/service-name=orders -o yaml
#   no endpoints  -> selector does not match, or no pod is READY
kubectl get pods -l app=orders -o wide         # are they Ready?
kubectl describe svc orders | grep -i selector # compare with pod labels

# Is it the network policy? Test from an allowed and a denied namespace.
kubectl run probe -n prod --rm -it --image=nicolaka/netshoot \
  -- curl -m 3 -sv http://orders.prod.svc.cluster.local
```

> **Key idea**
>
> **Almost every "the Service is broken" ticket is one of three things:** the label selector does not match the Pods, the Pods are running but not *ready* so the endpoint list is empty, or a NetworkPolicy is dropping the traffic. Check them in that order — `kubectl get endpointslice` answers the first two in one command — before suspecting DNS, the CNI or the load balancer.

<a id="17-k8s-config"></a>

## 17. Kubernetes Configuration, Storage and Scheduling

<a id="17-1-configmaps"></a>

### ConfigMaps, Secrets and the update semantics nobody expects

A ConfigMap holds non-sensitive configuration; a Secret holds sensitive values and is *base64-encoded, not encrypted*. Both can be consumed in two ways, and the two behave differently on update in a way that causes real confusion.

- **Mounted as a volume — updates propagate** The kubelet refreshes the files (within about a minute), so a process that re-reads the file picks up the change without a restart. This is how certificate rotation works.
- **Injected as environment variables — updates do not** Environment is fixed at process start. Editing the ConfigMap changes nothing until the Pods are recreated, which is why "I updated the config and nothing happened" is such a common report.

The standard fix is to make the config part of the Pod template's identity: annotate the template with a hash of the ConfigMap, so that changing the config changes the template, which creates a new ReplicaSet and rolls the Pods automatically. Helm does this with a checksum annotation; Kustomize does it by generating name-suffixed ConfigMaps.

**Make config changes trigger a rollout**

```yaml
# Kustomize: configMapGenerator appends a content hash to the name, so
# editing the file produces api-config-8g4k2m9t7c and a new pod template.
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources: [deployment.yaml, service.yaml]

configMapGenerator:
  - name: api-config
    literals:
      - LOG_LEVEL=info
      - FEATURE_NEW_PRICING=false

secretGenerator:
  - name: api-tls
    files: [tls.crt, tls.key]

generatorOptions:
  disableNameSuffixHash: false     # the hash IS the mechanism - keep it
---
# Helm's equivalent, inside the Deployment template:
#   metadata:
#     annotations:
#       checksum/config: {{ include (print $.Template.BasePath "/cm.yaml") . | sha256sum }}
```

```bash
# Kubernetes Secrets are base64. Anyone with "get secrets" reads them.
kubectl get secret api-db -o jsonpath='{.data.url}' | base64 -d

# So restrict the verb, and encrypt at rest on the API server:
kubectl auth can-i get secrets -n prod --as system:serviceaccount:prod:api

# EncryptionConfiguration on kube-apiserver (managed clusters expose a flag):
#   resources:
#     - resources: [secrets]
#       providers:
#         - kms: { name: cloud-kms, endpoint: ... }
#         - identity: {}          # must be LAST, or nothing is encrypted

# Force a rollout when config changed but the template did not.
kubectl rollout restart deployment/api     # patches an annotation with "now"
```

<a id="17-2-storage"></a>

### Storage: PV, PVC and StorageClass

A **PersistentVolumeClaim** is a request for storage; a **StorageClass** describes a kind of storage and how to provision it; a **PersistentVolume** is the provisioned result. The property that catches people is the **access mode**: most block storage (EBS, GCE PD, Azure Disk) is `ReadWriteOnce` — mountable by one node at a time. A Deployment with several replicas and one RWO volume will schedule one Pod successfully and leave the others `Pending` forever, which looks like a scheduling bug and is a storage constraint.

The second property is **reclaim policy**. `Delete` — the default for most dynamic provisioners — destroys the underlying disk when the PVC is deleted. For anything holding real data, set `Retain` and accept the manual cleanup, because the alternative is a `kubectl delete namespace` that also deletes the data.

<a id="17-3-scheduling"></a>

### Scheduling: how a Pod is placed

The scheduler runs two phases. **Filtering** removes nodes that cannot run the Pod — insufficient resources, unmatched node selector, untolerated taint, unavailable volume zone. Then **scoring** ranks the survivors and the highest wins. Everything you can influence is one of a small set of knobs:

| Mechanism | Direction | Typical use |
| --- | --- | --- |
| `nodeSelector` | Pod chooses nodes | Simple hard constraint: `disktype=ssd` |
| Node affinity | Pod chooses nodes | Expressive; supports soft preferences |
| Taints and tolerations | Node repels Pods | Reserve GPU or spot nodes for workloads that opt in |
| Pod (anti-)affinity | Pod relative to Pods | Keep replicas apart; keep a cache near its client |
| Topology spread | Even distribution | Balance replicas across zones — prefer this to anti-affinity |
| PriorityClass | Preemption | Let critical Pods evict batch work under pressure |

> **Tip**
>
> Prefer `topologySpreadConstraints` over pod anti-affinity for spreading replicas. Anti-affinity is expensive to evaluate on large clusters and is all-or-nothing; spread constraints express "at most one more in any zone than in any other", which is what you actually want, and degrade gracefully with `whenUnsatisfiable: ScheduleAnyway` instead of leaving Pods `Pending`.

<a id="18-helm"></a>

## 18. Helm, Kustomize and Manifest Management

Raw manifests work until you have four environments, at which point you are maintaining four copies of the same Deployment that differ in three fields. The two mainstream answers take opposite approaches, and knowing which problem each solves prevents a lot of pointless tooling debate.

**Helm** is templating plus a package manager: charts contain Go templates, values files supply the variables, and the rendered output is tracked as a release with a revision history. **Kustomize** is template-free overlays: you keep valid YAML as a base and apply strategic-merge patches per environment. Helm is better for distributing software to other people; Kustomize is better for your own manifests, because the base is real YAML that an editor can validate.

**The same environment override, both ways**

```yaml
# --- Kustomize: overlays/prod/kustomization.yaml ------------------------
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: prod
resources:
  - ../../base
patches:
  - target: { kind: Deployment, name: api }
    patch: |-
      - op: replace
        path: /spec/replicas
        value: 6
      - op: replace
        path: /spec/template/spec/containers/0/resources/requests/cpu
        value: 500m
images:
  - name: ghcr.io/acme/api
    digest: sha256:9f2c1ab...        # the pipeline writes this line
---
# --- Helm: values-prod.yaml --------------------------------------------
replicaCount: 6
image:
  repository: ghcr.io/acme/api
  digest: sha256:9f2c1ab...
resources:
  requests: { cpu: 500m, memory: 512Mi }
  limits:   { memory: 512Mi }
ingress:
  enabled: true
  host: api.acme.dev
```

```bash
# ALWAYS render and read the output. Both tools are string manipulation
# until the moment they are not, and a mis-indented template is a silent
# change to something you did not intend to touch.
kustomize build overlays/prod | tee /tmp/rendered.yaml
helm template api ./chart -f values-prod.yaml | tee /tmp/rendered.yaml

# Diff against the live cluster before applying - this is the plan step.
kubectl diff -f /tmp/rendered.yaml
helm diff upgrade api ./chart -f values-prod.yaml      # helm-diff plugin

# Validate before it reaches the cluster.
kubeconform -strict -summary /tmp/rendered.yaml
kubectl apply --dry-run=server -f /tmp/rendered.yaml   # runs admission too

# Helm keeps release history in secrets; rollback is a first-class operation.
helm history api
helm rollback api 7 --wait --timeout 5m
```

<a id="18-1-pitfalls"></a>

### Where both go wrong

- **Helm — templating YAML with a text templater** Indentation is significant and Go templates do not know that, so a conditional block at the wrong indent produces valid-but-wrong YAML. Charts also accumulate `if` branches until nobody can predict the output; the discipline is to render and diff every time.
- **Kustomize — overlay depth** Three levels of overlay and a patch that silently no-ops because the target path changed. Keep overlays one level deep and prefer replacing whole fields over surgical JSON patches.
- **Both — render in CI and commit the output for review** Whatever you use, a pipeline step that renders the manifests and posts the diff on the pull request turns an invisible change into a reviewable one. This is the single highest-value habit in manifest management.

> **Warning**
>
> **Do not template what should be a separate resource.** A chart with forty conditional blocks to support five deployment shapes is harder to reason about than five explicit manifests. The test is whether a reader can predict the rendered output without running the renderer; when the answer is no, the abstraction has stopped paying for itself.

<a id="unit-4"></a>

## Unit 4 — Infrastructure as Code & Cloud

Declaring the environment itself as code, and the cloud foundations it runs on.

<a id="19-iac-model"></a>

## 19. Infrastructure as Code — the Declarative Model

The difference between a folder of provisioning scripts and infrastructure as code is not that one is in Git. It is that a declarative tool describes the *destination* and computes the path, which gives you three properties a script cannot have: it is safe to run from any starting state, it can show you the diff before acting, and running it twice does nothing the second time.

> **Interactive animation:** `iac-plan` — rendered by the page script in the HTML version.

<a id="19-1-state"></a>

### Why state exists

To compute a diff, the tool must answer "is this resource mine?" for every object it manages. Cloud APIs cannot answer that — a bucket does not know it was created by your Terraform module — so the tool keeps a **state file** mapping symbolic addresses like `aws_s3_bucket.reports` to real identifiers. Kubernetes solves the same problem differently, storing the desired state in etcd and using owner references; the underlying need is identical.

State is therefore both essential and the most dangerous file you own. It contains every attribute of every resource, which for a database includes the password in plain text. It has no concurrency control of its own, so two simultaneous applies corrupt it. And losing it does not delete anything — it does something worse, leaving every resource running and unmanaged, so the next apply tries to create duplicates of things that already exist.

| State requirement | Why | How |
| --- | --- | --- |
| Remote | A laptop is not a durable store, and teams need to share | S3, GCS, Azure Blob, Terraform Cloud |
| Locked | Two concurrent applies produce corruption, not a conflict | DynamoDB table, or native backend locking |
| Versioned | Recovering from a bad `state rm` or a partial apply | Bucket versioning, retained forever |
| Encrypted | It contains secrets, unavoidably | SSE-KMS, restricted bucket policy |
| Split | One state = one lock = one blast radius | Per environment and per layer (§20) |

<a id="19-2-drift"></a>

### Drift, and the only durable cure

Drift is reality diverging from the declaration — someone resized an instance in the console at 3 a.m., a service auto-created a resource, a provider changed a default. It is not primarily a tooling problem: it is the existence of a second way to change infrastructure. Detection helps (a scheduled `plan` that alerts on a non-empty diff), but the durable fix is to remove write access from the console so that the reviewed path is the only path.

When you find drift you have exactly two honest options, and "apply and hope" is not one of them. **Codify it** — change the code to match reality, because the 3 a.m. change was probably right — or **revert it deliberately**, in working hours, having checked why it was made. What you must not do is let a routine deploy of something unrelated silently undo an incident mitigation.

> **Key idea**
>
> **The plan is the artifact, not the code.** Generate it, read it, save it, and apply *that file* — not a fresh plan computed at apply time, which may differ if anything changed in between. In a pipeline this means `terraform plan -out=tfplan` on the pull request, human approval of the rendered diff, then `terraform apply tfplan` on merge. Anything else is reviewing one thing and executing another.

<a id="20-terraform"></a>

## 20. Terraform in Practice

Terraform's core loop is `init` (download providers, configure the backend), `plan` (refresh state, compute a diff) and `apply` (execute it, update state). Around that loop, the decisions that matter are how you split state, how you write modules, and how you keep the pipeline honest.

<a id="20-1-layout"></a>

### Repository layout and state splitting

Split state by **blast radius** and **rate of change**, not by team boundary. Networking and IAM change monthly and break everything; application resources change daily. In one state, every routine application deploy holds a lock on the VPC and can propose changes to it — which means the worst possible plan is attached to the most frequent operation.

**Layered state, wired with remote outputs**

```hcl
# live/prod/network/main.tf  - changes monthly, referenced by everything
terraform {
  required_version = "~> 1.9"
  backend "s3" {
    bucket         = "acme-tfstate"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "acme-tflocks"     # the lock; without it, corruption
    encrypt        = true
  }
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
}

module "vpc" {
  source = "../../../modules/vpc"       # local path: versioned with the repo
  cidr   = "10.40.0.0/16"
  azs    = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

output "private_subnet_ids" { value = module.vpc.private_subnet_ids }
output "vpc_id"             { value = module.vpc.id }

# ---------------------------------------------------------------------
# live/prod/app/main.tf  - changes daily, cannot touch the network
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "acme-tfstate"
    key    = "prod/network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_ecs_service" "api" {
  name    = "api"
  subnets = data.terraform_remote_state.network.outputs.private_subnet_ids
  # A bad plan here can destroy a service. It cannot destroy the VPC,
  # because the VPC is not in this state file at all.
}
```

```bash
# The pipeline: plan on the PR, apply the reviewed plan on merge.
terraform init -input=false -backend-config=backends/prod.hcl
terraform validate
terraform fmt -check -recursive
terraform plan -input=false -lock-timeout=5m -out=tfplan

# Render the plan for humans, and gate on destructive changes.
terraform show -no-color tfplan > plan.txt
terraform show -json tfplan | jq -r '
  .resource_changes[]
  | select(.change.actions != ["no-op"])
  | "\(.change.actions | join("+"))\t\(.address)"' | sort

DESTROYS=$(terraform show -json tfplan \
  | jq '[.resource_changes[] | select(.change.actions | index("delete"))] | length')
[ "$DESTROYS" -gt 0 ] && echo "::warning::plan destroys $DESTROYS resources"

# Apply the exact plan that was reviewed - never a fresh one.
terraform apply -input=false tfplan

# Recovering from mistakes without touching infrastructure:
terraform state list
terraform state mv 'aws_db_instance.db' 'aws_db_instance.primary'  # rename
terraform state rm 'aws_s3_bucket.legacy'      # forget it, do not delete it
terraform import 'aws_s3_bucket.legacy' acme-legacy-bucket          # adopt it
terraform force-unlock                # only after confirming no apply
```

<a id="20-2-modules"></a>

### Modules that stay useful

A module should encapsulate a decision, not just group resources. A good module has a small input surface, sensible defaults, and outputs that let it be composed; a bad one has forty variables and is a thin wrapper over the provider, which adds indirection without removing any decisions. Version shared modules and pin them per environment, so that upgrading a module is an explicit change to one environment rather than a surprise to all of them.

Two Terraform-specific behaviours cause most incidents. **Forced replacement**: some attributes cannot be updated in place, so changing them plans a destroy-and-create — the plan output says `# forces replacement` on the exact line responsible, and reading it is the difference between a routine change and a deleted database. **Resource addresses**: renaming a resource block changes its address, so Terraform sees the old one gone and a new one needed; a `moved` block declares the rename and produces a no-op plan.

> **Warning**
>
> **Put `prevent_destroy` on every resource you cannot recreate** — databases, stateful volumes, DNS zones, the state bucket itself. It converts the worst class of mistake from a successful apply into a failed plan. Pair it with `-lock-timeout` so concurrent runs queue instead of racing, and with a pipeline check that flags any plan containing a delete.

<a id="21-immutable"></a>

## 21. Immutable Infrastructure and Configuration Management

There are two philosophies for making a server look the way you want, and the industry moved decisively from one to the other for reasons worth understanding rather than assuming.

**Configuration management** — Ansible, Chef, Puppet, Salt — converges an existing machine towards a described state, repeatedly. It is powerful and it has a structural weakness: convergence is only as good as the description, and anything the description does not mention keeps whatever value it had. Servers therefore accumulate history. Two machines built from the same playbook six months apart are not identical, because the packages, the kernel and the manual fixes in between differ. This is the "snowflake server", and the practical symptom is that nobody dares rebuild one.

**Immutable infrastructure** replaces rather than converges. You bake an image — a container image, an AMI — and to change anything you build a new image and replace the instances. No machine is ever modified after it starts, so there is no history to accumulate and no drift to detect. Rollback is redeploying the previous image, which is the same operation as deploying.

- **Immutable — identical by construction** Every instance came from the same image, so "works on that one and not this one" stops being possible. Recovery is replacement, and replacement is exercised on every deploy rather than only during incidents.
- **Immutable — the artifact is the unit of change** It composes with everything else in this course: digests, promotion, rollback, admission policy, SBOMs.
- **Immutable — slower for small changes and awkward for state** A one-line config fix means a full image build and a rolling replacement, and anything holding data needs an explicit story for surviving the replacement.
- **Config management — still necessary somewhere** Something has to configure the machines that host the containers, bootstrap a bare-metal fleet, or manage network appliances. Ansible remains the right tool for that layer, and for ad-hoc operational tasks across a fleet.

**Bake the image; configure only what cannot be baked**

```bash
# Packer bakes a machine image the same way Docker bakes a container image:
# provision once, at build time, then never touch the running instance.
packer build -var "app_version=$GIT_SHA" ami.pkr.hcl
# => ami-0a1b2c3d4e  (immutable, versioned, referenced by the ASG)

# Terraform then rolls the fleet by replacing instances, not by patching:
terraform apply -var "ami_id=ami-0a1b2c3d4e"

# Ansible still earns its place for fleet-wide operational tasks, where
# the alternative is an SSH loop that nobody can review or repeat.
ansible all -i inventory/prod -m ansible.builtin.systemd \
  -a "name=node-exporter state=restarted" --limit 'monitoring:!maintenance'

# Ad-hoc facts across a fleet - genuinely useful, hard to replace:
ansible all -i inventory/prod -m setup \
  -a 'filter=ansible_kernel' --tree /tmp/kernels
```

```yaml
# cloud-init: the small amount of per-instance configuration that CANNOT
# be baked, because it differs per instance or contains secrets.
#cloud-config
write_files:
  - path: /etc/app/environment
    permissions: "0640"
    content: |
      ENVIRONMENT=prod
      REGION=us-east-1

runcmd:
  # Identity and secrets are fetched at boot from the platform, never
  # baked into the image - see §30.
  - ["/usr/local/bin/fetch-secrets", "--role", "api", "--out", "/run/secrets"]
  - ["systemctl", "start", "app"]

# Everything else - packages, the runtime, the application itself - was
# installed at bake time. If you find yourself installing packages here,
# the image is not immutable and boot time will grow without bound.
```

> **Tip**
>
> The phrase to keep is **cattle, not pets**, and the test is concrete: can you terminate any instance at random, during working hours, and have the system recover with no human action? If the answer is no, you have pets regardless of what tooling you use. Running that test deliberately — on a schedule, in production — is what chaos engineering actually is.

<a id="22-cloud"></a>

## 22. Cloud Foundations for DevOps

You do not need to be a cloud architect to do this work, but four areas come up constantly and being vague about them is expensive. This section is the DevOps-relevant subset; the [AWS detailed course](../../aws/aws-detailed-course.html) covers the rest.

<a id="22-1-identity"></a>

### Identity, and why static keys are the problem

Every cloud has the same shape: a **principal** (a role, a service account, a workload identity) makes a signed API call, and policies decide whether it is allowed. The DevOps-relevant consequence is that *every runtime has a way to receive an identity automatically* — an instance profile, a pod identity, a workload identity federation — and therefore a well-built environment contains no long-lived access keys anywhere.

This extends to CI. Rather than storing a cloud access key as a repository secret, the pipeline exchanges a short-lived OIDC token for a role session. The trust policy on the role restricts which repository and which branch may assume it, so a fork or a feature branch cannot deploy to production, and there is no static credential to leak.

**Federated CI credentials, scoped to one repository**

```hcl
# The trust policy is the security control. Get the condition wrong and
# ANY GitHub repository in the world can assume this role.
data "aws_iam_policy_document" "ci_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      # StringEquals, not StringLike with a wildcard on the whole value.
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:acme/api:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "ci_deploy" {
  name                 = "ci-deploy"
  assume_role_policy   = data.aws_iam_policy_document.ci_trust.json
  max_session_duration = 3600
  permissions_boundary = aws_iam_policy.ci_boundary.arn   # a hard ceiling
}
```

```yaml
# The workflow side: no secrets, just a token exchange.
permissions:
  id-token: write        # required to request the OIDC token
  contents: read

jobs:
  deploy:
    environment: production        # protection rules + required reviewers
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/ci-deploy
          aws-region: us-east-1
          role-duration-seconds: 900     # shortest that fits the job
      - run: aws sts get-caller-identity
      - run: ./deploy.sh
```

<a id="22-2-networking"></a>

### Networking: the four things that break deploys

Cloud networking failures in a delivery context are remarkably repetitive. A workload in a private subnet cannot reach the internet because there is no NAT gateway or VPC endpoint, so image pulls and package installs hang until a timeout. A security group allows the wrong direction — they are stateful, so a reply to an allowed inbound connection is automatically permitted, but an *outbound* call needs an egress rule. DNS resolves to a private address from inside and a public one from outside, which makes a health check behave differently from a user. And subnets are zonal, so a workload pinned to one subnet is pinned to one availability zone.

<a id="22-3-managed"></a>

### Managed services: what you are actually buying

The decision to run something yourself or buy the managed version is a DevOps decision because it determines what your on-call rotation is responsible for. The honest framing is that you are not buying software — PostgreSQL is free — you are buying *backups that are tested, failover that works, patching that happens, and someone else's pager*. The costs are real too: less control over versions and parameters, a hard ceiling on customisation, and a bill that grows with success.

> **Key idea**
>
> **The test for "should we run this ourselves?" is not whether you can — it is whether you will still be doing it well in eighteen months.** Running your own database is straightforward on day one and demanding on the day the primary fails at 3 a.m., which is the day you find out whether the restore procedure was ever tested. Choose self-hosting when you have a specific requirement the managed offering cannot meet, and be explicit about who owns the operational burden.

<a id="unit-5"></a>

## Unit 5 — Continuous Integration & Delivery

Turning every merge into a gated, safe and reversible release.

<a id="23-ci-design"></a>

## 23. Continuous Integration — Designing the Pipeline

A pipeline is a sequence of gates that answers one question about one change: may this proceed? Its design has two constraints. It must be *fast enough that people wait for it*, because a gate nobody waits for is not a gate; and it must be *trusted*, because a suite that fails randomly trains people to re-run rather than investigate.

> **Interactive animation:** `ci-pipeline` — rendered by the page script in the HTML version.

<a id="23-1-ordering"></a>

### Ordering stages, and the arithmetic behind it

Order stages by expected cost, which is duration divided by the probability of catching something. Lint runs in eight seconds and rejects a meaningful fraction of pull requests; end-to-end tests take fourteen minutes and reject a small fraction. Running the cheap one first means the common failure costs eight seconds instead of fifteen minutes.

| Stage | Typical duration | Trigger | Blocking? |
| --- | --- | --- | --- |
| Format, lint, type check | 10–60 s | Every push | Yes |
| Secret scan | 5–20 s | Every push | Yes |
| Unit tests | 30 s–3 min | Every push | Yes |
| Build image | 1–3 min | Every push (cached) | Yes |
| Integration tests | 3–10 min | Pull request | Yes |
| Image scan, SBOM, sign | 1–3 min | Merge to main | Yes (critical only) |
| End-to-end suite | 10–40 min | Post-merge or nightly | No — alerts instead |
| Load and soak tests | 30 min–hours | Nightly / release | No |

<a id="23-2-speed"></a>

### The four levers on pipeline duration

In order of return on effort: **cache** (dependency directories keyed on the lockfile hash, Docker layer cache, compiled artifacts), **parallelise** (independent jobs, and test sharding across runners), **reduce scope** (in a monorepo, detect which packages changed and test only those and their dependents), and **move work off the critical path** (anything slow and rarely-triggered becomes a scheduled job). Buying bigger runners is last, because it makes a badly-shaped pipeline slightly less slow at permanent extra cost.

**Sharding, caching and change detection**

```yaml
jobs:
  # Only test what changed - the single biggest win in a monorepo.
  changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            api:    ['services/api/**', 'libs/common/**']
            worker: ['services/worker/**', 'libs/common/**']
            web:    ['services/web/**']

  test:
    needs: changes
    if: needs.changes.outputs.packages != '[]'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false          # report ALL shard failures, not just the first
      matrix:
        package: ${{ fromJSON(needs.changes.outputs.packages) }}
        shard: [1, 2, 3, 4]     # split the suite four ways
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          # Key on CONTENT. A branch-name key is a correctness bug.
          key: pip-${{ runner.os }}-${{ hashFiles('**/requirements.lock') }}
          restore-keys: pip-${{ runner.os }}-
      - run: pip install --require-hashes -r requirements.lock
      - run: pytest services/${{ matrix.package }}
               --splits 4 --group ${{ matrix.shard }}
               --junitxml=results-${{ matrix.shard }}.xml
      - uses: actions/upload-artifact@v4
        if: always()            # upload results even when the tests failed
        with:
          name: results-${{ matrix.package }}-${{ matrix.shard }}
          path: results-*.xml
```

```bash
# Measure before optimising. Average duration per job, last 50 runs.
gh run list --workflow=ci.yml --limit 50 --json databaseId --jq '.[].databaseId' \
  | while read -r id; do
      gh api "repos/:owner/:repo/actions/runs/$id/jobs" --jq '.jobs[]
        | "\(.name)\t\((.completed_at|fromdate) - (.started_at|fromdate))"'
    done \
  | awk -F'\t' '{s[$1]+=$2; n[$1]++}
                END {for (j in s) printf "%-28s %6.0fs  ×%d\n", j, s[j]/n[j], n[j]}' \
  | sort -k2 -rn

# Cache hit rate - a cache that never hits is pure overhead.
gh run view --log | grep -c 'Cache restored from key' || true

# Flakiness: run the suite against one commit repeatedly and count
# tests that are not deterministic.
for i in $(seq 1 20); do pytest -q --tb=no; done 2>&1 \
  | grep -oE '^[a-zA-Z0-9_/]+\.py::[a-zA-Z0-9_]+' | sort | uniq -c | sort -rn
```

> **Warning**
>
> **Beyond roughly ten minutes, a pipeline stops changing behaviour.** Developers context-switch, review comments arrive after the author has moved on, and merges start happening on optimism. Treat the duration as a service level objective with an owner, alert when the median exceeds the target, and budget time for it — pipeline speed decays continuously and only improves deliberately.

<a id="24-test-strategy"></a>

## 24. Test Strategy

The pipeline is a container; the tests are what give it meaning. The shape of the suite determines both how fast the pipeline can be and how useful a failure is.

> **Interactive animation:** `test-pyramid` — rendered by the page script in the HTML version.

<a id="24-1-levels"></a>

### What each level can and cannot prove

**Unit tests** exercise one unit with no I/O. They are fast and they localise failure precisely, and their blind spot is everything *between* components — a suite of only unit tests can be entirely green on a system that cannot start.

**Integration tests** run against real dependencies started as containers. This is where mocking stops helping: a mocked database accepts SQL that the real one rejects, so the mock proves your code matches your assumptions rather than reality. Testcontainers-style libraries have made this cheap enough that there is no longer a good reason to mock a database in a service test.

**Contract tests** are the underused level. When service A calls service B, the consumer records the requests it makes and the responses it expects; the provider's pipeline replays those expectations against the real implementation. That gives you most of the confidence of an end-to-end test without needing both systems running together, and it fails on the *provider's* pipeline — where the breaking change is being made — rather than in an integration environment a week later.

**End-to-end tests** are the only ones that answer the question the business asks. Keep a small number covering the revenue paths, and resist growth: each one is a permanent tax on every deploy.

**Integration against the real thing; contracts across the boundary**

```python
"""Integration test with a real Postgres, started and disposed per session.

The point is that this exercises the actual SQL, the actual migrations and
the actual driver. A mock would pass on all three and fail in production.
"""
import pytest
from testcontainers.postgres import PostgresContainer

@pytest.fixture(scope="session")
def database():
    with PostgresContainer("postgres:16-alpine") as pg:
        url = pg.get_connection_url()
        run_migrations(url)          # migrations are part of what we test
        yield url

def test_orders_are_isolated_per_tenant(database):
    repo = OrderRepository(database)
    repo.create(tenant="acme", total=100)
    repo.create(tenant="globex", total=250)

    assert [o.total for o in repo.list(tenant="acme")] == [100]

def test_migration_is_backward_compatible(database):
    """The invariant from §29: old code must work against the new schema."""
    with old_schema_client(database) as old:
        assert old.read_order(1) is not None
```

```yaml
# A consumer-driven contract. The consumer publishes this; the provider's
# pipeline verifies it, so the breaking change fails where it is made.
consumer: { name: web }
provider: { name: orders-api }
interactions:
  - description: fetch an order
    request:
      method: GET
      path: /orders/91827
      headers: { Accept: application/json }
    response:
      status: 200
      headers: { Content-Type: application/json }
      body:
        # Matchers, not literals: the consumer asserts on SHAPE, so the
        # provider stays free to change values but not the contract.
        id:     { matcher: type, value: 91827 }
        total:  { matcher: decimal, value: 100.0 }
        status: { matcher: regex, regex: "pending|paid|shipped", value: paid }

  - description: an order that does not exist
    request: { method: GET, path: /orders/0 }
    response: { status: 404 }
```

<a id="24-2-flakiness"></a>

### Flakiness as an operational problem

Treat flaky tests as production incidents in miniature, because they have the same effect: they destroy trust in a signal. The arithmetic is unforgiving — a suite of 200 tests each with a 0.5% false-failure rate is green only 37% of the time. At that point the team has learned that red means "run it again", and a genuine regression gets the same treatment.

The operational answer is a quarantine: on detection, move the test out of the blocking suite immediately, open a ticket with an owner, and delete it if nobody fixes it within an agreed window. Track the quarantine size as a metric, because it is a direct measure of how much of your safety net is currently disconnected.

> **Key idea**
>
> **Coverage is a diagnostic, not a target.** High coverage with weak assertions proves that code was executed, not that it works, and a coverage requirement reliably produces tests written to satisfy the requirement. Useful questions instead: does a failure tell you where the bug is, does the suite catch the regressions you have actually had, and do you trust a green run enough to deploy on a Friday?

<a id="25-actions"></a>

## 25. Pipelines as Code — GitHub Actions in Depth

The concepts here transfer to GitLab CI, Buildkite, CircleCI and Jenkins pipelines; the vocabulary differs and the model does not. A **workflow** is triggered by an event and contains **jobs**; jobs run on separate runners in parallel unless a `needs` dependency orders them; each job is a sequence of **steps** sharing a workspace.

<a id="25-1-triggers"></a>

### Triggers, and the one that is a security boundary

The distinction between `pull_request` and `pull_request_target` is the most important security detail in GitHub Actions. `pull_request` runs the workflow from the *base* branch against the merge result, with a read-only token and no access to secrets for forks. `pull_request_target` runs with the base repository's full permissions *and* secrets — and if the workflow then checks out the pull request's head, it executes untrusted code with production credentials. That combination has been the root cause of a series of real supply-chain compromises.

**A hardened workflow, end to end**

```yaml
name: release
on:
  push: { branches: [main] }

# Least privilege at the top; widen per job, never globally.
permissions:
  contents: read

concurrency:
  group: release-${{ github.ref }}
  cancel-in-progress: false        # never cancel a deploy mid-flight

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write              # OIDC for keyless signing
    outputs:
      digest: ${{ steps.push.outputs.digest }}
    steps:
      # Third-party actions are pinned by commit SHA, not by tag: a tag
      # can be moved to point at malicious code in the same repository.
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
      - uses: docker/setup-buildx-action@d70bba72b1f3fd22344832f00baa16ece964efeb # v3.3.0
      - uses: docker/login-action@e92390c5fb421da1463c202d546fed0ec5c39f20 # v3.1.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: push
        uses: docker/build-push-action@2cdde995de11925a030ce8070c3d77a52ffcf1c0 # v5.3.0
        with:
          push: true
          tags: ghcr.io/acme/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          provenance: true         # SLSA attestation, generated for free
          sbom: true

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: production             # required reviewers + a deploy log live here
      url: https://api.acme.dev
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/ci-deploy
          aws-region: us-east-1
      - run: ./deploy.sh "ghcr.io/acme/api@${{ needs.build.outputs.digest }}"
```

```bash
# Reusable workflows and composite actions remove the copy-paste sprawl
# that every organisation grows. Centralise, version, and pin.
#   .github/workflows/ci.yml in each repo:
#     jobs:
#       ci:
#         uses: acme/.github/.github/workflows/python-ci.yml@v3
#         with: { python-version: "3.12" }
#         secrets: inherit

# Audit what your workflows are allowed to do, across the organisation.
gh api graphql -f query='
  { organization(login:"acme") { repositories(first:100) { nodes {
      name defaultBranchRef { name }
  }}}}' --jq '.data.organization.repositories.nodes[].name' \
| while read -r repo; do
    gh api "repos/acme/$repo/actions/permissions" \
      --jq "\"$repo \(.enabled) \(.allowed_actions)\"" 2>/dev/null
  done

# Find unpinned third-party actions - the most common real weakness.
grep -rhoE 'uses: [^ ]+@[^ ]+' .github/workflows/ \
  | grep -v '@[0-9a-f]\{40\}' | sort -u
```

> **Warning**
>
> **Three GitHub Actions rules that prevent real incidents.** Never use `pull_request_target` together with a checkout of the pull request head. Never interpolate untrusted input directly into a `run:` block — `${{ github.event.pull_request.title }}` in a shell command is script injection; pass it through `env:` instead. And pin third-party actions by full commit SHA, because a tag is mutable and an action runs with your token.

<a id="26-cd"></a>

## 26. Continuous Delivery vs Continuous Deployment

Both abbreviate to CD and they are different commitments. **Continuous delivery** means every change that passes the pipeline is *deployable* — the artifact is built, verified and promotable, and shipping it is a business decision that takes one click. **Continuous deployment** means every change that passes the pipeline *is deployed*, automatically, with no human in the path.

Continuous delivery is the goal for essentially every team, because it means the technical ability to ship is never the constraint. Continuous deployment is a further step that suits some products and not others: it requires excellent automated verification, progressive rollout, and the willingness for a merge to reach users within minutes.

|   | Continuous delivery | Continuous deployment |
| --- | --- | --- |
| Trigger to production | A human clicks | A merge to `main` |
| Requires | Reliable pipeline, promotable artifacts | All of that, plus canaries and automated rollback |
| Suits | Almost everything | High-traffic web services with strong telemetry |
| Poor fit for | — | Regulated releases, mobile apps, on-premise software |

<a id="26-1-approvals"></a>

### Approvals that add safety rather than delay

Most manual approval gates do not reduce risk; they add latency and produce a signature. The question to ask of any gate is what information the approver has that the pipeline does not. If the answer is "none" — they are reading the same green checks — the gate is theatre and should be replaced by an automated check. If the answer is real, such as knowing that a marketing campaign launches in an hour, the gate is doing work.

Where a change-approval process is imposed by regulation, the productive move is to make the evidence automatic rather than to argue against the control: an immutable record of the artifact digest, the tests that ran, the approvals given, and who deployed it. That is what a compliant pipeline is, and it is entirely compatible with deploying several times a day.

> **Interview**
>
> **"Do you deploy on Fridays?"** The revealing answer is not yes or no, it is what the question is really about. A team that avoids Friday deploys is telling you that its rollback is slow or untested and that failures are discovered by users rather than by monitoring. Fix those two and the day of the week stops mattering. Until they are fixed, avoiding Friday deploys is a reasonable mitigation — it is just important to name it as a mitigation rather than as a policy.

<a id="27-deploy-strategies"></a>

## 27. Deployment Strategies in Depth

Every strategy is a position on one axis: how much you pay, in infrastructure and in complexity, to shorten the time between shipping a mistake and undoing it.

> **Interactive animation:** `deploy-strategies` — rendered by the page script in the HTML version.

| Strategy | Downtime | Extra capacity | Rollback | Mixed versions live? |
| --- | --- | --- | --- | --- |
| Recreate | Yes | None | Another outage | No |
| Rolling | No | `maxSurge` | Minutes | Yes, throughout |
| Blue-green | No | 100% | Seconds | No (atomic switch) |
| Canary | No | One instance | Automatic | Yes, deliberately |
| Shadow / mirror | No | 100% | N/A — no user traffic | Yes, but new gets no responses |

**Shadow deployment** deserves a mention because it solves a problem the others cannot: mirroring production traffic to the new version without returning its responses to users. It is the only way to test a rewrite against real request shapes at real volume before anyone depends on it. The catch is side effects — the shadow must not write to the database, charge a card or send an email — which usually means the new version needs a mode in which its writes go somewhere else.

<a id="27-1-mixed-versions"></a>

### The constraint every strategy shares

Except for blue-green and recreate, two versions of your code are live at the same time. That imposes requirements people discover the hard way:

- **The database schema must serve both** — see §29. This is the constraint that breaks rollbacks, and no deployment strategy solves it for you.
- **Message formats must be compatible in both directions** A v2 producer may emit an event that a v1 consumer must tolerate, and vice versa. Add fields, never repurpose them, and never make a new field required.
- **Shared caches must be versioned** If v2 writes a cache entry in a new shape and v1 reads it, you get a deserialisation error in the version you did not change. Put the schema version in the cache key.
- **Sticky sessions are a workaround, not a fix** Pinning a user to one version hides the incompatibility for the rollout and leaves it in place for anything asynchronous — queues, cron jobs, webhooks — where there is no session to be sticky about.

**Progressive delivery, declared**

```yaml
# Argo Rollouts: a Deployment replacement with a canary strategy and
# automated analysis. The analysis is the part that matters - a canary
# that needs a human watching a dashboard is just a slow deploy.
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: { name: api }
spec:
  replicas: 10
  strategy:
    canary:
      canaryService: api-canary
      stableService: api-stable
      trafficRouting:
        nginx: { stableIngress: api }
      analysis:
        templates: [{ templateName: success-rate }]
        startingStep: 2                # let it warm before judging
      steps:
        - setWeight: 5
        - pause: { duration: 10m }
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 30m }
        - setWeight: 100
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata: { name: success-rate }
spec:
  metrics:
    - name: success-rate
      interval: 1m
      failureLimit: 3                  # 3 bad readings aborts and rolls back
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{job="api-canary",status!~"5.."}[2m]))
            /
            sum(rate(http_requests_total{job="api-canary"}[2m]))
      successCondition: result[0] >= 0.99
```

```bash
# Blue-green by hand, to see that there is no magic: the cutover is one
# label change on the Service selector, and it is atomic.
kubectl apply -f deployment-green.yaml            # v2, no traffic yet
kubectl rollout status deployment/api-green

# Smoke-test green directly, bypassing the public Service.
kubectl run smoke --rm -it --image=curlimages/curl -- \
  curl -fsS http://api-green.prod.svc.cluster.local/readyz

# Cut over. Every user moves at once.
kubectl patch service api -p '{"spec":{"selector":{"version":"green"}}}'

# Watch the SLI for the agreed bake time, then keep blue for an hour
# before deleting it - that hour is the whole value of the strategy.
kubectl patch service api -p '{"spec":{"selector":{"version":"blue"}}}'  # undo
```

> **Key idea**
>
> **Practise the rollback.** A rollback path that has never been exercised is a hypothesis, and an incident is a poor time to test one. Roll back a real service in a real environment on a quiet afternoon and time it; you will find the thing that does not work — a migration, a cache format, a message schema — while it is cheap to find.

<a id="28-gitops"></a>

## 28. GitOps and Pull-Based Delivery

GitOps applies the reconciliation loop to delivery itself. An agent running inside the cluster reads manifests from a Git repository, compares them with the live state, and converges. Git is not a trigger in this model — it is the desired state, continuously enforced.

> **Interactive animation:** `gitops` — rendered by the page script in the HTML version.

<a id="28-1-consequences"></a>

### What changes when you invert the direction

- **No cluster credentials in CI** The cluster pulls; nothing outside needs write access to it. This removes the largest standing privilege in a push pipeline, and it scales — adding a repository does not add another holder of production keys.
- **Deployment history is `git log`** Who changed production, when, what the diff was, and who approved it, in the tool you already use, with retention you already control.
- **Drift is detected and corrected** A manual `kubectl edit` is reverted within a sync interval. Occasionally infuriating, which is precisely the intent: the only durable way to change the cluster is to change the repository.
- **Secrets need a separate answer** You cannot commit them. The options are sealed secrets (encrypted with a cluster-held key), SOPS with a KMS key, or an external secrets operator that syncs from a real store — the last being the best fit for §30.

<a id="28-2-repo-layout"></a>

### Repository layout

Keep application source and deployment manifests in separate repositories. Not for tidiness: a commit to the manifest repository is a production change and should have production review rules, while a commit to the application repository is not. Mixing them also creates a loop, since the pipeline writes the new image digest back into the manifests and would re-trigger itself.

**An Argo CD application, and the promotion commit**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-prod
  namespace: argocd
spec:
  project: production
  source:
    repoURL: https://github.com/acme/deploy.git
    targetRevision: main
    path: overlays/prod                 # Kustomize overlay from §18
  destination:
    server: https://kubernetes.default.svc
    namespace: prod
  syncPolicy:
    automated:
      prune: true                       # delete resources removed from Git
      selfHeal: true                    # revert manual changes in the cluster
    syncOptions:
      - CreateNamespace=true
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 5
      backoff: { duration: 15s, factor: 2, maxDuration: 5m }
  # Fields legitimately owned by something else - the HPA owns replicas -
  # must be ignored, or the agent and the autoscaler fight forever.
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers: ["/spec/replicas"]
```

```bash
# The CI side of a GitOps release: build, then write one line to a repo.
DIGEST=$(docker buildx imagetools inspect "ghcr.io/acme/api:$GIT_SHA" \
           --format '{{.Manifest.Digest}}')

git clone --depth 1 https://github.com/acme/deploy.git && cd deploy
cd overlays/staging
kustomize edit set image "ghcr.io/acme/api@$DIGEST"
git commit -am "deploy(staging): api ${GIT_SHA:0:7}"
git push                                 # the agent does the rest

# Promotion to production is a pull request between overlays - reviewable,
# revertible, and the diff is exactly one line.
gh pr create --base main --head "promote-${GIT_SHA:0:7}" \
  --title "promote api ${GIT_SHA:0:7} to prod" \
  --body "Staging green for 6 h. Digest unchanged since build."

# Operating it:
argocd app get api-prod                  # Synced/OutOfSync, Healthy/Degraded
argocd app diff api-prod                 # live vs desired
argocd app history api-prod              # every sync, with the commit
argocd app rollback api-prod 42          # or, better: git revert
```

> **Warning**
>
> **Turn on `selfHeal` and know what you have signed up for.** During an incident, scaling a Deployment by hand will be reverted within the sync interval, which is a surprising way to make an outage worse. Agree a break-glass procedure in advance — usually disabling auto-sync for one application, with an alert that fires while it is off — and rehearse it, because the middle of an incident is not when to read the documentation.

<a id="29-migrations"></a>

## 29. Database Changes Without Downtime

This is the section that determines whether everything before it works. Deployments are reversible; schema changes are not. And during any rolling update two versions of your code run simultaneously, so the schema must satisfy both — and after a rollback, the *old* code must work against the *new* schema.

> **Interactive animation:** `db-migration` — rendered by the page script in the HTML version.

<a id="29-1-expand-contract"></a>

### Expand and contract, in full

The pattern splits a destructive change into a sequence of individually safe ones. Renaming `email` to `contact_email` becomes five steps across several deploys:

```text
deploy 1  ADD COLUMN contact_email text;      -- metadata only
          old code unaffected: it cannot see the column

deploy 2  app writes BOTH columns, reads the OLD one
          safe to roll back: nothing reads the new column yet

  (job)   backfill contact_email in batches of 5 000, with pauses
          resumable, cancellable, no long lock

deploy 3  app writes BOTH, reads the NEW one
          safe to roll back to deploy 2

deploy 4  app writes and reads only the NEW column
          safe to roll back to deploy 3

deploy 5  DROP COLUMN email;                 -- days later
          only once no rollback can reach deploy 2
```

The invariant that makes this work is stated once and applies to every schema change you will ever make: **each deploy must be compatible with the schema before it and the schema after it**. Hold that and rolling updates are safe, code rollback is safe, and migrations can run independently of deploys.

<a id="29-2-locks"></a>

### Locks, and the migration that takes the site down

A migration that holds a lock longer than a request timeout is an outage regardless of how quickly it finishes. Worse, in PostgreSQL an `ACCESS EXCLUSIVE` lock request *queues behind* running queries and every subsequent query queues behind it — so a migration waiting on one slow report blocks the entire table for the duration. Setting `lock_timeout` converts that from an outage into a failed migration you can retry.

**Operations by risk, and how to make each safe**

```text
PostgreSQL - what each operation actually costs
───────────────────────────────────────────────
SAFE (metadata only, milliseconds)
  ADD COLUMN (nullable, no default)
  ADD COLUMN ... DEFAULT      (PG 11+: stored in the catalogue)
  DROP COLUMN                 (marks it dropped; space reclaimed later)
  RENAME COLUMN / TABLE       (but breaks running code - avoid entirely)
  CREATE INDEX CONCURRENTLY   (no write lock; cannot run in a transaction)
  ADD CONSTRAINT ... NOT VALID then VALIDATE CONSTRAINT

DANGEROUS (rewrites the table or takes a long exclusive lock)
  ALTER COLUMN TYPE           (full rewrite, except for a few widenings)
  ADD COLUMN ... DEFAULT      on PG < 11
  SET NOT NULL                (full scan under ACCESS EXCLUSIVE)
  CREATE INDEX                (without CONCURRENTLY: blocks writes)
  ADD FOREIGN KEY             (locks BOTH tables; use NOT VALID first)

Always
  SET lock_timeout = '3s';           fail fast instead of queueing
  SET statement_timeout = '30s';     bound the damage of a slow step
  Run migrations as their own step, before the app deploy, forward-only.
```

```bash
# Add an index to a hot table without blocking writes.
psql -c "SET lock_timeout = '3s';
         CREATE INDEX CONCURRENTLY idx_orders_tenant ON orders (tenant_id);"
# CONCURRENTLY cannot run inside a transaction, takes ~2x as long, and can
# leave an INVALID index if it fails - so always check afterwards:
psql -c "SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;"

# Watch for the failure mode that matters, while it is happening.
psql -c "SELECT pid, state, wait_event_type, now() - query_start AS runtime,
                left(query, 60) AS query
         FROM pg_stat_activity
         WHERE state <> 'idle' ORDER BY runtime DESC LIMIT 10;"

# Who is blocking whom?
psql -c "SELECT blocked.pid AS blocked, blocking.pid AS blocking,
                left(blocked.query, 40)
         FROM pg_stat_activity blocked
         JOIN pg_stat_activity blocking
           ON blocking.pid = ANY(pg_blocking_pids(blocked.pid));"

# A migration is designed to be resumable, so cancelling one is safe.
psql -c "SELECT pg_cancel_backend(12345);"
```

> **Key idea**
>
> **Migrations are forward-only in practice, whatever your framework's `down()` promises.** Dropping a column is data loss, not a rollback. Design so that rolling back the code never requires rolling back the schema — keep every migration additive and backward-compatible, and ship removal as a separate change days later. This single rule is what lets someone roll back at 3 a.m. without a database expert on the call.

<a id="30-secrets"></a>

## 30. Configuration, Secrets and Rotation

Configuration is injected because the artifact must be identical everywhere (§8). Secrets are injected for a stronger reason: an image layer is a permanent, copyable, unauditable place to put a credential, and deleting it in a later layer does not remove it.

> **Interactive animation:** `secrets-flow` — rendered by the page script in the HTML version.

<a id="30-1-hierarchy"></a>

### A hierarchy of secret handling

| Approach | Rotation time | Audit | Verdict |
| --- | --- | --- | --- |
| Hard-coded in source | Never in practice | None | Compromised on commit |
| Baked into the image | Rebuild + redeploy everything | None | Breaks promotion too (§8) |
| CI secret → env var | Redeploy | Who changed it, not who read it | Workable minimum |
| Sealed / SOPS-encrypted in Git | Commit + sync | Git history | Good fit for GitOps |
| External store, static value | Minutes | Every read | Good |
| External store, dynamic credential | Automatic, per session | Every issue and revoke | Best — the credential expires by itself |

The last row deserves attention because it changes the problem rather than managing it. A secrets engine can create a database user on demand with a one-hour lease and revoke it automatically, so there is no shared long-lived password to rotate, and a leaked credential expires without anyone doing anything. The cost is an operational dependency in the request path at start-up, which is a real trade and usually a good one.

**Inject at run time, with an identity and a TTL**

```yaml
# External Secrets Operator: the value lives in a real store; Kubernetes
# holds a short-lived copy that is refreshed, and Git holds only a pointer.
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: api-db, namespace: prod }
spec:
  refreshInterval: 15m
  secretStoreRef: { name: aws-secrets, kind: ClusterSecretStore }
  target:
    name: api-db                 # the Secret this creates
    creationPolicy: Owner
  data:
    - secretKey: url
      remoteRef: { key: prod/api/database, property: url }
---
# The store authenticates with the pod's own identity - no bootstrap secret.
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata: { name: aws-secrets }
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef: { name: external-secrets, namespace: prod }
```

```python
"""Load and validate configuration at start-up, then fail loudly.

A service that starts with a missing DATABASE_URL and fails on the first
request has converted a start-up error into a user-visible one - and it
will pass its readiness probe on the way there.
"""
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    database_url: str
    redis_url: str
    log_level: str = "info"
    request_timeout_s: float = 5.0

    @classmethod
    def from_env(cls) -> "Config":
        missing = [k for k in ("DATABASE_URL", "REDIS_URL") if not os.getenv(k)]
        if missing:
            raise SystemExit(f"missing required configuration: {missing}")
        return cls(
            database_url=os.environ["DATABASE_URL"],
            redis_url=os.environ["REDIS_URL"],
            log_level=os.getenv("LOG_LEVEL", "info"),
            request_timeout_s=float(os.getenv("REQUEST_TIMEOUT_S", "5")),
        )

    def redacted(self) -> dict:
        """Log what was loaded, never the values."""
        return {k: ("" if "url" in k or "token" in k else v)
                for k, v in self.__dict__.items()}

config = Config.from_env()
log.info("configuration loaded", extra=config.redacted())
```

> **Warning**
>
> **Assume every secret will eventually appear in a log.** An exception that prints a connection string, a debug dump of the environment, a request body captured by an error tracker — these are ordinary, and careful handling does not survive contact with a real codebase. The control that does survive is a short lifetime: make the value worth an hour rather than making it impossible to leak.

<a id="31-flags"></a>

## 31. Feature Flags and Progressive Delivery

A feature flag separates **deploy** (the code is running) from **release** (users experience it). That separation is what makes deployment routine: the deploy carries almost no risk because the new path executes zero times, and the release becomes a runtime decision that can be reversed in seconds without a pipeline run.

> **Interactive animation:** `feature-flag` — rendered by the page script in the HTML version.

<a id="31-1-kinds"></a>

### Four kinds of flag, with different lifetimes

| Kind | Purpose | Lifetime | Who changes it |
| --- | --- | --- | --- |
| Release toggle | Ship incomplete work; roll out gradually | Days to weeks — then delete | Engineering |
| Operational toggle | Kill switch for an expensive path | Permanent | On-call |
| Experiment | A/B test with a measured outcome | The length of the experiment | Product |
| Permission / entitlement | Plan tiers, beta access | Permanent | Business rules |

Only the first is technical debt, and it is the one that accumulates. Release toggles that outlive their purpose become dead branches nobody dares remove, and each one multiplies the combinations that theoretically need testing. Give every release toggle an owner and an expiry date at creation, and treat an expired flag as a build warning.

**Evaluate consistently, fail safe, and clean up**

```python
"""Flag evaluation with the three properties that matter in production."""
import hashlib
from datetime import date

class Flags:
    def __init__(self, provider, defaults):
        self._provider = provider
        self._defaults = defaults      # used when the provider is unreachable

    def enabled(self, key: str, user_id: str) -> bool:
        try:
            rule = self._provider.get(key, timeout=0.05)
        except Exception:
            # 1. FAIL SAFE. A flag service outage must not be your outage;
            #    fall back to a compiled-in default, never to an exception.
            return self._defaults.get(key, False)

        if not rule.enabled:
            return False

        # 2. STICKY. Hash the user, do not sample randomly: the same user
        #    must get the same answer on every request, or they will see
        #    the feature appear and disappear between page loads.
        digest = hashlib.sha256(f"{key}:{user_id}".encode()).digest()
        bucket = int.from_bytes(digest[:4], "big") % 100
        return bucket < rule.percentage

# 3. EXPIRY. A flag with no removal date is permanent by accident.
FLAG_REGISTRY = {
    "new-pricing": {"owner": "payments", "expires": date(2026, 11, 1)},
    "async-export": {"owner": "reporting", "expires": date(2026, 10, 15)},
}

def check_expired_flags():
    """Run in CI; fail the build on flags past their date."""
    stale = [k for k, m in FLAG_REGISTRY.items() if m["expires"] < date.today()]
    if stale:
        raise SystemExit(f"expired flags must be removed: {stale}")
```

```bash
# Find flags in the code that are no longer in the registry, and vice
# versa. Both directions matter: orphaned code and orphaned config.
grep -rhoE 'flags\.enabled\("[a-z0-9-]+"' src/ \
  | sed 's/.*"\(.*\)"/\1/' | sort -u > /tmp/in-code.txt
jq -r 'keys[]' flags.json | sort -u > /tmp/in-config.txt

comm -23 /tmp/in-code.txt /tmp/in-config.txt   # referenced, never configured
comm -13 /tmp/in-code.txt /tmp/in-config.txt   # configured, never referenced

# How old is each flag? Age is the best proxy for "should be gone".
for f in $(cat /tmp/in-code.txt); do
  added=$(git log --diff-filter=A --format=%as -S"\"$f\"" -- src/ | tail -1)
  echo "$added  $f"
done | sort
```

> **Tip**
>
> Emit the flag state as a **span attribute and a log field**, not as a metric label — high-cardinality context belongs on traces (§32). Being able to ask "was this failing request on the new code path?" is what turns a flag from a switch into an experiment, and it costs one line at the point of evaluation.

<a id="unit-6"></a>

## Unit 6 — Operating & Securing Production

Observability, SLOs, incidents, capacity and supply-chain security, plus the revision material.

<a id="32-observability-1"></a>

## 32. Observability I — Logs and Metrics

Monitoring answers questions you thought of in advance; observability is the property of being able to answer new ones without shipping code. The practical test is concrete: when something breaks in a way you have never seen, can you find out why from data that already exists?

> **Interactive animation:** `observability-pillars` — rendered by the page script in the HTML version.

<a id="32-1-logs"></a>

### Logs: structured, sampled, correlated

Three properties turn logs from a text dump into a queryable dataset. **Structure**: emit JSON with consistent field names, so a query is a filter rather than a regular expression. **Correlation**: put a `trace_id` on every line, so a slow trace links to the lines it produced. **Levels used honestly**: `ERROR` means someone should look, `WARN` means it is recoverable but notable, `INFO` is the audit trail of what happened, and `DEBUG` is off in production and enabled per-request when needed.

The cost control that matters is volume. Ingestion is usually priced per gigabyte, and the most effective reduction is not shorter messages but **sampling the successful path**: keep every error, keep a small percentage of successes, and keep everything for a request that ended badly.

**Structured logging with correlation and sampling**

```python
import json, logging, random
from opentelemetry import trace

class JsonFormatter(logging.Formatter):
    def format(self, record):
        span = trace.get_current_span().get_span_context()
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S.%fZ"),
            "level": record.levelname,
            "msg": record.getMessage(),
            "logger": record.name,
            "service": "api",
            # The join key. Without it, logs and traces are separate tools.
            "trace_id": f"{span.trace_id:032x}" if span.is_valid else None,
            "span_id": f"{span.span_id:016x}" if span.is_valid else None,
        }
        payload.update(getattr(record, "context", {}))
        if record.exc_info:
            payload["error"] = self.formatException(record.exc_info)
        return json.dumps(payload)

class SampleSuccesses(logging.Filter):
    """Keep everything interesting; keep 1% of the boring."""
    def filter(self, record):
        if record.levelno >= logging.WARNING:
            return True
        if getattr(record, "context", {}).get("status", 200) >= 400:
            return True
        return random.random() < 0.01

log = logging.getLogger("api")
log.info("order created", extra={"context": {"order_id": 91827,
                                             "tenant": "acme",
                                             "status": 201}})
```

```yaml
# Write logs to stdout and let the platform collect them. A container
# should never manage log files, rotation or shipping - that is the
# platform's job, and doing it in-process breaks when the pod is killed.
apiVersion: v1
kind: ConfigMap
metadata: { name: vector-config, namespace: observability }
data:
  vector.yaml: |
    sources:
      k8s:
        type: kubernetes_logs

    transforms:
      parse:
        type: remap
        inputs: [k8s]
        source: |
          # Structured logs parse; anything else is kept as a message.
          . = merge(., object!(parse_json(.message) ?? {}))
          .env = "prod"

      drop_health_checks:
        type: filter
        inputs: [parse]
        condition: '!match(string!(.path ?? ""), r''^/(healthz|readyz|metrics)$'')'

    sinks:
      loki:
        type: loki
        inputs: [drop_health_checks]
        labels:
          # Labels are an INDEX. Keep them low-cardinality, exactly as
          # with metric labels - never put a request id or user id here.
          service: '{{ service }}'
          level: '{{ level }}'
```

<a id="32-2-metrics"></a>

### Metrics: types, and why cardinality is the bill

Four instrument types cover almost everything. A **counter** only increases and is always read as a rate. A **gauge** goes up and down and is read directly. A **histogram** buckets observations so that percentiles can be computed across instances — which is why you use one for latency rather than recording an average, since averages of percentiles are meaningless. A **summary** computes quantiles in-process and cannot be aggregated, which is usually a reason to prefer a histogram.

A time-series database stores one series per unique combination of label values. Labels with bounded values — route template, method, status class — cost tens of series. A label with unbounded values — user ID, request ID, raw URL — costs one series per distinct value, retained for the retention period. That is the mechanism behind almost every observability bill that triples overnight.

> **Key idea**
>
> **Alert on symptoms, at the service boundary.** "CPU above 80%" describes a healthy service under load. "Checkout success rate below target" describes something a user is experiencing. Cause-based alerts fill the pager with noise, and a noisy pager is worse than no pager because it teaches people to wait before looking. The full treatment of what to alert on and when is §34.

<a id="33-observability-2"></a>

## 33. Observability II — Tracing and OpenTelemetry

A trace is the tree of work done to serve one request. Each node is a **span** with a name, a start time, a duration, a parent and a set of attributes. Spans in different processes belong to the same trace because the `traceparent` header carries the trace ID across every hop.

> **Interactive animation:** `trace-spans` — rendered by the page script in the HTML version.

<a id="33-1-propagation"></a>

### Context propagation is the whole game

A trace is only as complete as its least-instrumented hop. One service that drops the `traceparent` header cuts the tree at that point and hides everything beyond it, which is why partial tracing adoption produces traces that are misleading rather than merely incomplete — the missing subtree looks like time spent in the last instrumented span.

The hop people forget is asynchronous work. When a request publishes to a queue and a worker consumes it later, the context must travel in the *message*, and the resulting span is a `link` rather than a child, because the consumer's lifetime is not contained within the producer's.

**Instrument once, propagate everywhere**

```python
from opentelemetry import trace, propagate
from opentelemetry.trace import Link, SpanKind

tracer = trace.get_tracer("orders")

def handle_request(request):
    # Auto-instrumentation extracts context from incoming headers; doing it
    # explicitly shows what is happening under the covers.
    ctx = propagate.extract(request.headers)

    with tracer.start_as_current_span("POST /orders", context=ctx,
                                      kind=SpanKind.SERVER) as span:
        # High-cardinality context is CHEAP here and ruinous on a metric
        # label - span attributes are stored per trace, not per series.
        span.set_attribute("user.id", request.user_id)
        span.set_attribute("tenant", request.tenant)
        span.set_attribute("feature.new_pricing", flags.enabled("new-pricing",
                                                                request.user_id))
        try:
            return create_order(request)
        except Exception as exc:
            span.record_exception(exc)
            span.set_status(trace.StatusCode.ERROR, str(exc))
            raise

def publish(message):
    with tracer.start_as_current_span("publish order.created",
                                      kind=SpanKind.PRODUCER):
        headers = {}
        propagate.inject(headers)        # traceparent travels IN the message
        queue.send(message, headers=headers)

def consume(message):
    ctx = propagate.extract(message.headers)
    link = Link(trace.get_current_span(ctx).get_span_context())
    # A LINK, not a child: the consumer outlives the producer's span, so
    # nesting it would produce a trace with a nonsensical duration.
    with tracer.start_as_current_span("process order.created",
                                      kind=SpanKind.CONSUMER, links=[link]):
        process(message)
```

```yaml
# The Collector sits between your services and your backend. Run one:
# it lets you change vendors, enforce sampling and strip PII in one place
# instead of redeploying every service.
receivers:
  otlp:
    protocols: { grpc: {}, http: {} }

processors:
  batch: { timeout: 5s, send_batch_size: 512 }

  # Tail sampling needs the whole trace, so it must run in a collector,
  # not in the application. This is the main reason to have one.
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: keep-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: keep-slow
        type: latency
        latency: { threshold_ms: 1000 }
      - name: baseline
        type: probabilistic
        probabilistic: { sampling_percentage: 2 }

  attributes/scrub:
    actions:
      - { key: http.request.header.authorization, action: delete }
      - { key: user.email, action: hash }

exporters:
  otlphttp: { endpoint: https://otel.acme.dev }

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [attributes/scrub, tail_sampling, batch]
      exporters: [otlphttp]
```

<a id="33-2-sampling"></a>

### Sampling: head, tail and what to keep

**Head sampling** decides at the first span whether to record the trace, which is cheap and stateless and means the decision is made before you know whether the request was interesting. **Tail sampling** buffers complete traces and decides afterwards, so you can keep every error and every slow request and a small percentage of the rest. Tail sampling costs memory in the collector and is almost always worth it, because the traces you want are exactly the ones head sampling throws away at random.

> **Tip**
>
> Start with **auto-instrumentation**. The OpenTelemetry agents cover HTTP servers and clients, database drivers and queue libraries, which is most of a useful trace for no code changes. Add manual spans only where the automatic ones leave a gap you actually need — a slow in-process computation, a batch loop, a third-party call made through an unusual client.

<a id="34-slo"></a>

## 34. SLIs, SLOs, Error Budgets and Alerting

An **SLI** is a measurement of something a user cares about, expressed as a ratio of good events to valid events. An **SLO** is a target for that ratio over a window. The **error budget** is what remains: one minus the target, expressed as an amount of failure you are permitted to spend.

> **Interactive animation:** `error-budget` — rendered by the page script in the HTML version.

<a id="34-1-choosing"></a>

### Choosing an SLI that means something

Two decisions determine whether an SLO is useful. First, **where you measure**: at the load balancer, not inside the application, because a request that never reached your process still failed for the user. Second, **what counts as valid**: exclude health checks and traffic from your own synthetic monitoring, and be explicit about whether a 4xx counts as a failure — usually it does not, since a client sending a malformed request is not your outage, but a 429 from your own rate limiter arguably is.

| Service type | Good SLI | Poor SLI |
| --- | --- | --- |
| Request/response API | Non-5xx responses under 300 ms ÷ valid requests | Server uptime |
| Async pipeline | Records processed within 5 min ÷ records received | Worker CPU |
| Batch job | Runs completing before the deadline ÷ scheduled runs | Job exit code alone |
| Storage | Successful reads ÷ attempted reads | Disk availability |

<a id="34-2-burn-rate"></a>

### Burn-rate alerting

Alerting on an instantaneous error rate produces noise, because a brief spike crosses any threshold you pick. Burn rate solves this by asking a different question: *at the current rate, how fast is the budget being consumed?* A burn rate of 1 exhausts the budget exactly at the end of the window. A burn rate of 14.4 exhausts a 30-day budget in two days, which is worth a phone call.

Each alert uses two windows — a long one for significance and a short one so that it resolves quickly once the burn stops. Two alerts, fast and slow, cover the range: a severe short burn pages, a mild long burn opens a ticket.

**Recording rules, then multi-window burn alerts**

```yaml
groups:
  # Compute the SLI once, in a recording rule. Every alert and dashboard
  # then uses the same definition - which is how you avoid three teams
  # disagreeing about what "availability" means.
  - name: slo-recording
    interval: 30s
    rules:
      - record: slo:error_ratio:rate5m
        expr: |
          sum by (service) (
            rate(http_requests_total{status=~"5..", route!="/healthz"}[5m])
          )
          /
          sum by (service) (
            rate(http_requests_total{route!="/healthz"}[5m])
          )
      - record: slo:error_ratio:rate1h
        expr: |
          sum by (service) (rate(http_requests_total{status=~"5..",route!="/healthz"}[1h]))
          / sum by (service) (rate(http_requests_total{route!="/healthz"}[1h]))
      - record: slo:error_ratio:rate6h
        expr: |
          sum by (service) (rate(http_requests_total{status=~"5..",route!="/healthz"}[6h]))
          / sum by (service) (rate(http_requests_total{route!="/healthz"}[6h]))

  - name: slo-alerts
    rules:
      - alert: FastBurn
        # 14.4x for an hour = 2% of a 30-day budget spent in one hour.
        expr: |
          slo:error_ratio:rate1h{service="checkout"} > 14.4 * 0.001
          and
          slo:error_ratio:rate5m{service="checkout"} > 14.4 * 0.001
        for: 2m
        labels: { severity: page }
        annotations:
          summary: "checkout burning error budget 14x too fast"
          runbook_url: https://runbooks.acme.dev/checkout
          dashboard: https://grafana.acme.dev/d/checkout

      - alert: SlowBurn
        expr: |
          slo:error_ratio:rate6h{service="checkout"} > 6 * 0.001
          and
          slo:error_ratio:rate30m{service="checkout"} > 6 * 0.001
        for: 15m
        labels: { severity: ticket }
```

```python
"""The arithmetic behind the thresholds, so they stop being magic."""

WINDOW_HOURS = 30 * 24          # a 30-day SLO window

def budget_minutes(slo: float) -> float:
    return (1 - slo) * WINDOW_HOURS * 60

def burn_rate_for(alert_window_h: float, budget_fraction: float,
                  slo_window_h: float = WINDOW_HOURS) -> float:
    """Burn rate that consumes `budget_fraction` of the budget in
    `alert_window_h` hours."""
    return budget_fraction * slo_window_h / alert_window_h

for slo in (0.99, 0.999, 0.9999, 0.99999):
    print(f"{slo:<9} {budget_minutes(slo):8.1f} min / 30 days")
# 0.99          432.0 min / 30 days
# 0.999          43.2 min / 30 days
# 0.9999          4.3 min / 30 days
# 0.99999         0.4 min / 30 days

print(burn_rate_for(1, 0.02))    # 14.4  -> page: 2% of budget in 1 hour
print(burn_rate_for(6, 0.05))    # 6.0   -> ticket: 5% of budget in 6 hours

# Serial dependencies multiply: you cannot promise more than your inputs.
deps = [0.999, 0.999, 0.9995]
ceiling = 1.0
for d in deps:
    ceiling *= d
print(f"dependency ceiling: {ceiling:.5f}")     # 0.99749 - below 99.9%
```

> **Warning**
>
> **An SLO with no policy attached is a dashboard.** Decide in advance, with the people who prioritise work, what happens when the budget is exhausted — typically a freeze on feature releases until it recovers, with reliability work taking priority. That agreement is the difficult part and the whole point; the arithmetic above is trivial by comparison.

<a id="35-incidents"></a>

## 35. Incident Response and Postmortems

Incidents are not preventable in aggregate. What you control is how long they last, and time to recover decomposes into segments that each respond to different investment.

> **Interactive animation:** `incident-timeline` — rendered by the page script in the HTML version.

<a id="35-1-roles"></a>

### Roles, declared early

The most common failure in incident response is not technical: it is six people investigating the same hypothesis while nobody is talking to the business and two people are making conflicting changes. Three roles fix it, and they should be declared in the first two minutes even for a small incident.

- **Incident commander** Decides, delegates, and does *not* debug. Their job is to keep one hypothesis being tested at a time and to be the single point of coordination.
- **Operations lead** The only person making changes to the system, so that every change is known and attributable. Everyone else proposes; this person executes.
- **Communications lead** Updates the status page and internal stakeholders on a fixed cadence, which prevents the commander from being interrupted every four minutes for a status update.
- **The anti-pattern** One senior engineer doing all three while also debugging. It works until it does not, and it is why the same person is in every incident and nobody else learns.

<a id="35-2-mitigate"></a>

### Mitigate before you diagnose

The strongest single habit in incident response is to stop the impact before understanding it. Roll back, flip the flag, fail over, shed load, scale up. Root cause analysis is far cheaper on a calm afternoon with the telemetry preserved than it is at 3 a.m. with users failing — and the instinct to understand first routinely turns a five-minute incident into an hour.

The corollary is that your mitigations must be fast and rehearsed. If rolling back takes twenty minutes and nobody is sure it works, "mitigate first" is not available to you, and that is a delivery problem rather than an incident-response one.

**The first five minutes, and what to capture**

```bash
# 1. Correlate with change. Most incidents are a deploy; check first.
kubectl rollout history deployment/api -n prod | tail -5
argocd app history api-prod | tail -5
gh run list --workflow=release.yml --limit 5

# 2. Mitigate with the fastest reversal available, and say so in channel.
flagctl set new-pricing --percentage 0        # seconds, if applicable
kubectl rollout undo deployment/api -n prod   # minutes
kubectl patch svc api -p '{"spec":{"selector":{"version":"blue"}}}'

# 3. Capture evidence BEFORE it rotates away. Pods are deleted on
#    rollback and their logs go with them.
kubectl logs -l app=api --previous --tail=2000 -n prod > /tmp/incident-logs.txt
kubectl get events -n prod --sort-by=.lastTimestamp > /tmp/incident-events.txt
kubectl describe deployment api -n prod > /tmp/incident-deploy.txt

# 4. Confirm recovery against the SLI, not against a feeling.
curl -sG http://prometheus:9090/api/v1/query \
  --data-urlencode 'query=slo:error_ratio:rate5m{service="api"}' | jq '.data.result'
```

```text
Postmortem template - the sections that make it useful
──────────────────────────────────────────────────────
Impact          who was affected, how, and for how long, in user terms
                ("14% of checkouts failed for 43 minutes", not "the API
                 was degraded")

Timeline        from data, not memory. Include the deploy, the first
                alert, the acknowledgement, each hypothesis tested, the
                mitigation, and the confirmation of recovery.

Contributing    plural, always. "The database was slow" is one link in a
factors         chain that also includes: why no alert fired earlier, why
                the retry storm amplified it, why rollback was not tried
                first, why the runbook was out of date.

What went well  genuinely useful, and routinely skipped. It tells you
                which investments are already paying.

Action items    each with an owner, a date, and a priority. An action
                item with no owner is a wish.

Rules
  Blameless. Not out of kindness - because the moment naming a person is
  a possible outcome, people stop telling you what actually happened, and
  you lose the only data that would have prevented a recurrence.
  Publish it. A postmortem read only by its authors has no leverage.
  Track the actions. Unfinished action items are how the same incident
  happens twice.
```

> **Key idea**
>
> **On-call is a system, not a rota.** It needs an alert volume low enough that pages are credible, a runbook link in every alert, a documented escalation path, an explicit handover, and time back for people who were woken. A rotation that pages nightly does not produce reliability — it produces attrition, and then it produces unreliability.

<a id="36-capacity"></a>

## 36. Capacity, Autoscaling and Cost

Autoscaling is frequently described as a defence against traffic spikes, and it is not. It is a reactive control loop with substantial dead time, which makes it an excellent cost-optimisation tool and a poor emergency response.

> **Interactive animation:** `autoscaling` — rendered by the page script in the HTML version.

<a id="36-1-layers"></a>

### Three layers, three time constants

| Layer | Scales | Latency | Watch out for |
| --- | --- | --- | --- |
| HPA | Pod count | ~60–90 s | Scaling on CPU for an I/O-bound service |
| Cluster autoscaler | Node count | ~2–5 min | Pods pending because no node fits their requests |
| VPA | Requests and limits | Hours | Conflicts with HPA on the same metric; restarts pods |
| KEDA | Pod count, event-driven | ~30–60 s | Best fit for queue depth; scales to zero |

The most common mistake is the signal. A service that spends its time waiting on a database sits at 20% CPU while its queue grows without bound, so a CPU-based HPA never triggers and latency climbs anyway. Scale on the resource that is actually saturating: queue depth for workers, in-flight requests or requests-per-pod for APIs.

**Scale on the right signal, and damp the oscillation**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 6              # headroom, not the minimum that "works":
  maxReplicas: 40             # this is your defence against a fast spike
  metrics:
    - type: Pods
      pods:
        metric: { name: http_inflight_requests }   # the real constraint
        target: { type: AverageValue, averageValue: "30" }
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0      # react immediately
      policies:
        - { type: Percent, value: 100, periodSeconds: 30 }   # can double
    scaleDown:
      stabilizationWindowSeconds: 300    # wait 5 min before shrinking:
      policies:                          # cheap to be briefly over-provisioned,
        - { type: Percent, value: 10, periodSeconds: 60 }    # expensive to flap
---
# Queue-driven work: scale on backlog, and scale to zero when idle.
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: { name: worker }
spec:
  scaleTargetRef: { name: worker }
  minReplicaCount: 0
  maxReplicaCount: 100
  cooldownPeriod: 300
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/123456789012/jobs
        queueLength: "20"        # target messages per pod
```

```bash
# Right-sizing: requests should be based on observed usage, not on a guess
# that was copied from another service two years ago.
kubectl get pods -n prod -o json | jq -r '
  .items[] | .spec.containers[] |
  "\(.name)\t\(.resources.requests.cpu // "none")\t\(.resources.requests.memory // "none")"' \
  | sort | uniq -c | sort -rn

# Compare requests with actual p95 usage over a week (Prometheus):
#   quantile_over_time(0.95,
#     rate(container_cpu_usage_seconds_total{namespace="prod"}[5m])[7d:5m])
#   / on(pod) kube_pod_container_resource_requests{resource="cpu"}
# < 0.3 sustained  -> over-provisioned, you are paying for idle capacity
# > 0.9 sustained  -> under-provisioned, you are one spike from trouble

# The three cost levers, in order of size:
#   1. right-size requests            typically 30-50% of a cluster bill
#   2. use spot/preemptible for       50-90% off, for anything that
#      interruptible workloads        tolerates a 2-minute eviction notice
#   3. commitments (savings plans)    30-60% off the stable baseline
kubectl cost namespace --window 7d    # kubecost, or the cloud's own tooling
```

<a id="36-2-cost"></a>

### Cost is an engineering property

Three facts make most cloud bills tractable. Idle capacity dominates: right-sizing requests is usually the single largest saving available, because containers are provisioned from a guess and never revisited. Data transfer is invisible and expensive: cross-zone chatter between microservices can cost more than the compute doing the work, and nothing in a console warns you. And unattached resources accumulate silently — orphaned volumes, old snapshots, idle load balancers, forgotten environments.

> **Warning**
>
> **Autoscaling has a second-order effect that has caused real outages.** Scaling a stateless tier ten-fold multiplies the connections arriving at a database that cannot scale at all, and the autoscaler will happily do it while the database saturates. Bound it: connection pooling with a hard maximum, a sensible `maxReplicas`, and load shedding at the edge so that excess traffic is rejected quickly rather than queued into a dependency.

<a id="37-supply-chain"></a>

## 37. Supply Chain Security and DevSecOps

Most security effort is spent reviewing code the team wrote. Most realistic compromises arrive through the parts nobody reviews: a transitive dependency, a stale base image, a build runner executing untrusted code with production credentials, a registry tag that someone moved.

> **Interactive animation:** `supply-chain` — rendered by the page script in the HTML version.

<a id="37-1-controls"></a>

### The controls that pay for themselves

**An SBOM** — a machine-readable inventory of everything in an artifact — turns "are we affected by this CVE?" from a week of archaeology into a query, including transitive dependencies you never chose and packages inherited from a base image. Generate one at build time and store it with the artifact.

**Signing and provenance** attach a verifiable claim about who built the artifact and from what. Keyless signing with an OIDC identity removes the key-management problem entirely: the signature is tied to the workflow, the repository and the commit, and there is no private key to protect.

**Admission policy** is what makes the first two enforceable rather than advisory. A cluster that refuses unsigned images, or images referenced by a mutable tag, does not rely on anyone remembering to check.

**Generate, sign, verify, enforce**

```bash
DIGEST=$(crane digest ghcr.io/acme/api:"$GIT_SHA")
REF="ghcr.io/acme/api@$DIGEST"

# 1. Inventory - what is actually in this artifact.
syft "$REF" -o spdx-json > sbom.spdx.json

# 2. Scan the SBOM, not the source tree: this covers the base image too.
grype "sbom:sbom.spdx.json" --fail-on critical --only-fixed

# 3. Sign keylessly. The identity is the workflow, recorded in a public
#    transparency log; there is no private key to leak or rotate.
cosign sign --yes "$REF"
cosign attest --yes --type spdxjson --predicate sbom.spdx.json "$REF"

# 4. Verify - in CI, and again at admission.
cosign verify "$REF" \
  --certificate-identity-regexp '^https://github\.com/acme/api/\.github/workflows/release\.yml@' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com

# 5. When the next critical CVE lands, this is the whole investigation:
for img in $(kubectl get pods -A -o jsonpath='{..imageID}' | tr ' ' '\n' | sort -u); do
  cosign download attestation "$img" 2>/dev/null \
    | jq -r --arg cve CVE-2026-1234 '.payload | @base64d | fromjson
        | select(.predicate.packages[]?.name == "log4j-core") | input_filename'
done
```

```yaml
# Enforcement at the cluster boundary. Advisory checks get skipped under
# deadline pressure; an admission policy does not.
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata: { name: supply-chain }
spec:
  validationFailureAction: Enforce
  background: false
  rules:
    - name: verify-signature
      match: { any: [{ resources: { kinds: [Pod] } }] }
      verifyImages:
        - imageReferences: ["ghcr.io/acme/*"]
          mutateDigest: true          # rewrite tags to digests on admission
          verifyDigest: true
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/acme/*"
                    issuer: "https://token.actions.githubusercontent.com"

    - name: require-hardened-pod
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "containers must run as non-root with no privilege escalation"
        pattern:
          spec:
            containers:
              - securityContext:
                  runAsNonRoot: true
                  allowPrivilegeEscalation: false
                  capabilities: { drop: ["ALL"] }
```

<a id="37-2-shift-left"></a>

### Shifting left without blocking everything

Security checks belong close to the change, but not all of them should block. Fast and precise checks — secret scanning, IaC misconfiguration, dependency policy — belong on the pull request where context is fresh and the fix is cheap. Slow or noisy checks belong on a schedule with triage, because a gate that fails a third of pull requests for reasons the author cannot act on will be routed around within a month.

> **Key idea**
>
> **The build runner is the highest-value target you own.** It holds registry credentials, signing material and often cloud access, and by design it executes code from the repository. Least-privilege job permissions, short-lived OIDC credentials instead of static keys, no privileged workflows triggered from forks, third-party actions pinned by commit SHA, and ephemeral runners that carry no state between jobs. None of these are exotic; all of them are routinely missing.

<a id="38-cheat-sheet"></a>

## 38. Cheat Sheet

<a id="38-1-numbers"></a>

### Numbers worth knowing by heart

| Quantity | Value | Why it matters |
| --- | --- | --- |
| 99.9% over 30 days | 43 minutes | The error budget most web services should start with |
| 99.99% over 30 days | 4.3 minutes | Requires multi-AZ, tested failover and staffed on-call |
| Burn rate 14.4× | Budget gone in 2 days | The standard page threshold |
| Pipeline feedback | < 10 minutes | Beyond this developers context-switch and stop waiting |
| Reviewable PR | < 400 lines | Defect detection falls sharply above this |
| HPA reaction time | 60–90 s | Why autoscaling does not save you from a fast spike |
| Node failure to reschedule | ~5.5 minutes (default) | 40 s heartbeat grace + 300 s toleration |
| CFS period | 100 ms | The window CPU limits are enforced over — the source of throttling |
| Exit 137 / 143 | SIGKILL / SIGTERM | 137 with no logs is almost always an OOM kill |
| Default `/dev/shm` | 64 MB | Breaks Chrome, Postgres parallel queries and some ML jobs |

<a id="38-2-commands"></a>

### Commands you will use weekly

**Triage, in the order you will need it**

```bash
# ---- Kubernetes ---------------------------------------------------------
kubectl get events --sort-by=.lastTimestamp -n prod | tail -30   # start here
kubectl describe pod  | sed -n '/Events/,$p'
kubectl logs  --previous --tail=200        # the container that DIED
kubectl get endpointslice -l kubernetes.io/service-name=    # empty = why
kubectl rollout status deployment/ --timeout=60s
kubectl rollout undo deployment/
kubectl auth can-i --list -n prod
kubectl top pod --containers | sort -k3 -h | tail
kubectl debug -it  --image=nicolaka/netshoot --target=

# ---- Containers ---------------------------------------------------------
docker history --no-trunc                # secrets hide here
docker inspect --format='{{.State.OOMKilled}}'
docker system df && docker system prune -af --filter 'until=168h'
crane digest :                      # resolve a tag to a digest
dive                                     # what is taking the space

# ---- Terraform ----------------------------------------------------------
terraform plan -out=tfplan && terraform show -json tfplan \
  | jq -r '.resource_changes[] | select(.change.actions|index("delete")).address'
terraform state list
terraform state mv                    # rename without recreating
terraform force-unlock                      # only after checking

# ---- Git ----------------------------------------------------------------
git log --oneline --graph --decorate -20
git bisect start HEAD               # works because commits are small
git reflog                                      # nothing is ever really lost

# ---- Linux --------------------------------------------------------------
ss -tlnp                                        # what is listening
df -h && df -i                                  # space AND inodes
dmesg -T | tail -40                             # OOM kills in full detail
journalctl -u  -f --since '10 min ago'
```

```yaml
# ---- The Kubernetes fields most often set wrong ------------------------
spec:
  terminationGracePeriodSeconds: 45   # must exceed your longest request
  containers:
    - readinessProbe: {}              # REQUIRED, or rollouts drop traffic
      livenessProbe: {}               # keep it local; never check a dependency
      startupProbe: {}                # for slow boots, instead of a long
                                      # initialDelaySeconds on liveness
      resources:
        requests: { cpu: ..., memory: ... }   # scheduling; always set these
        limits:   { memory: ... }             # killing; CPU limit optional
      securityContext:
        runAsNonRoot: true
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities: { drop: ["ALL"] }
  strategy:
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # never both 0

# ---- The GitHub Actions fields most often set wrong --------------------
permissions: { contents: read }       # least privilege; widen per job
concurrency: { group: ..., cancel-in-progress: true }   # not for deploys
timeout-minutes: 10                   # jobs hang; default is 6 hours
# uses: owner/action@<40-char-sha>    # never a tag for third-party actions
```

<a id="38-3-decisions"></a>

### Decision table

| Question | Default answer | Change it when |
| --- | --- | --- |
| Branching strategy | Short-lived branches off `main` | You ship multiple supported versions |
| Deployment strategy | Rolling | Slow rollback is unacceptable → blue-green; you have traffic and metrics → canary |
| Push or GitOps | Push, until several environments | Credential sprawl or drift becomes a real problem |
| Helm or Kustomize | Kustomize for your own manifests | You are distributing software to others → Helm |
| CPU limits | None on latency-sensitive services | Hard multi-tenancy or chargeback is required |
| Kubernetes at all | Not for a handful of services | Many services, many teams, real orchestration needs |
| Self-host or managed | Managed | A specific requirement it cannot meet, and an owner for the burden |
| Image reference | Digest | Never — tags are for humans |

<a id="39-playbook"></a>

## 39. Pattern-Recognition Playbook

Most production problems are one of a few dozen shapes. This is the mapping from symptom to likely cause, in the order worth checking.

<a id="39-1-deploys"></a>

### Deploys and rollouts

| Symptom | Check first | Usual cause |
| --- | --- | --- |
| 502s for two minutes after a deploy | `readinessProbe` exists? | Traffic sent to Pods that had not finished starting (§15) |
| Errors at the *end* of every rollout | `preStop`, grace period, SIGTERM handling | Endpoint removal races with socket close (§9) |
| Rollout never completes | `kubectl get deploy -o jsonpath='{.status.conditions}'` | New Pods never become ready; or quota/RBAC blocks creation |
| Rollback did not fix it | Did a migration run? | Schema changed irreversibly (§29) |
| Works in staging, fails in production | Same digest? Same config keys? | Rebuild per environment, or missing config (§8) |
| Manual fix reverted itself | GitOps agent with `selfHeal` | Working as designed — change the repository (§28) |

<a id="39-2-runtime"></a>

### Runtime and performance

| Symptom | Check first | Usual cause |
| --- | --- | --- |
| Exit 137, no stack trace | `lastState.terminated.reason` | OOM kill against the cgroup memory limit (§10) |
| p99 latency spikes, low average CPU | `cpu.stat` → `nr_throttled` | CFS throttling from an aggressive CPU limit (§10) |
| Every replica restarted at once | Does `livenessProbe` touch a dependency? | A slow database caused a cluster-wide restart (§15) |
| Latency doubled across all services | A trace, not eight dashboards | One shared dependency; often an N+1 (§33) |
| Service scales up, database falls over | Connection count vs pool max | Second-order effect of autoscaling (§36) |
| Pods `Pending` forever | `describe pod` → Events | Insufficient resources, taints, or an RWO volume (§17) |
| Node stopped accepting writes | `df -h` *and* `df -i` | Container logs, or inode exhaustion (§9) |

<a id="39-3-pipeline"></a>

### Pipeline and supply chain

| Symptom | Check first | Usual cause |
| --- | --- | --- |
| Every build takes four minutes | Is `COPY . .` above the install step? | Layer cache invalidated by every source edit (§11) |
| Cache never hits | The cache key | Keyed on branch or timestamp instead of content (§6) |
| Green on the branch, red on `main` | Was it tested against the tip? | Semantic conflict; needs a merge queue (§5) |
| "Just re-run it" is the team reflex | Flake rate | The suite is no longer believed (§24) |
| Terraform wants to replace a database | The `forces replacement` line | Resource renamed, or an immutable attribute changed (§20) |
| Observability bill tripled | Series count by metric name | A high-cardinality label, or DEBUG in production (§32) |
| Cannot say whether a CVE affects you | Do builds publish an SBOM? | No inventory; the answer takes days and is wrong (§37) |

> **Key idea**
>
> **The meta-pattern.** When something behaves unexpectedly, ask *which loop is reconciling this, and what does it think the desired state is?* Terraform, Kubernetes, the GitOps agent and the autoscaler are all doing the same thing, and most surprises are one of them faithfully enforcing something you forgot you declared — or two of them enforcing contradictory things.

<a id="40-roadmap"></a>

## 40. Practice Roadmap

Reading this course does not produce competence; building things does. What follows is a sequence where each project depends only on the previous ones, and each one produces something you can point at.

<a id="40-1-projects"></a>

### Six projects, in order

1. **Containerise a real application properly.** Multi-stage build, non-root user, pinned base image by digest, a `.dockerignore`, and a Compose file that starts it with a real database. *Done when* a colleague can clone and run it with one command, and the image is under 200 MB. *Covers* §10–13.
2. **Build a pipeline that gates `main`.** Lint, unit tests, build, image scan, push by digest. Branch protection making it required. *Done when* the median run is under ten minutes and a failing test blocks a merge. *Covers* §5, §23–25.
3. **Deploy it to Kubernetes, with the fields that matter set deliberately.** Readiness and liveness probes, requests and limits, a PodDisruptionBudget, topology spread. *Done when* you can delete any Pod during a load test and see no errors. *Covers* §14–18.
4. **Put the infrastructure in Terraform, with remote locked state.** Split into a network layer and an application layer. *Done when* you can destroy and recreate the whole environment from an empty account. *Covers* §19–22.
5. **Make it observable and give it an SLO.** Structured logs with trace IDs, RED metrics, one OpenTelemetry trace across two services, and a burn-rate alert. *Done when* you can answer "why was this specific request slow?" without adding code. *Covers* §32–34.
6. **Break it on purpose.** Kill a node during a deploy. Run a migration that renames a column and then try to roll back. Exhaust the memory limit. Point a liveness probe at the database and take the database down. *Done when* you have written a postmortem for each. *Covers* §29, §35, and most of what you will actually be asked in an interview.

<a id="40-2-platform"></a>

### Where this goes next: platform engineering

"You build it, you run it" scales badly without support: every team independently solving logging, deployment, secrets and alerting produces eight incompatible answers and eight sets of mistakes. The current name for the countermeasure is **platform engineering** — a small team whose product is a *paved road*: templates, pipelines, base images, a deployment path and defaults that are secure and observable without effort.

The distinction that matters is between a paved road and a fence. A paved road is optional and so good that teams choose it, and when someone leaves it they own the consequences knowingly. A fence is mandatory, and the moment it blocks a legitimate need it gets routed around, which produces exactly the fragmentation it was meant to prevent. Measure a platform the way you would measure any product: adoption, time from empty repository to running service, and how often teams need to leave the road.

<a id="40-3-further"></a>

### Further reading

1. [The DevOps crash course](devops-crash-course.html) — the same ground in fourteen sections, useful as a revision pass before an interview.
2. [All DevOps courses](../devops-courses.html) — the catalogue page for this topic.
3. [Operating Systems detailed course](../../os/os-detailed-course.html) — namespaces, cgroups, signals, the page cache and scheduling, from the kernel side.
4. [Networking detailed course](../../networking/networking-detailed-course.html) — what Services, Ingress, TLS termination and load balancing are doing to your packets.
5. [AWS detailed course](../../aws/aws-detailed-course.html) — the cloud primitives underneath §22, in depth.
6. *Accelerate* (Forsgren, Humble, Kim) for the DORA research; Google's *Site Reliability Engineering* and *The SRE Workbook*, both free online, for SLOs, alerting and incident practice; and the OpenTelemetry and Kubernetes documentation, which are unusually good primary sources.

> **Key idea**
>
> **The sentence to leave with.** The goal is not to prevent failure — it is to make failure small, visible and quickly reversible. Small comes from batch size and automation; visible comes from observability; reversible comes from immutable artifacts, flags and additive migrations. Every section of this course is an implementation of one of those three.

---

TechToday Study Library — DevOps
