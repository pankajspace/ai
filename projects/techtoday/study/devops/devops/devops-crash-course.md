<!--
Source: devops-crash-course.html
Title: DevOps Crash Course | TechToday
Description: A visual crash course in DevOps — the delivery loop and DORA metrics, trunk-based development, immutable artifacts, containers, Kubernetes, infrastructure as code, CI pipelines, deployment strategies, secrets, feature flags, observability, SLOs and supply-chain security, each explained with a step-by-step animation.
Theme-color: #0b0d10
Stylesheets: devops-study.css, ../../../site-header.css
Scripts: devops-study.js
-->

Navigation: [TechToday](../../../index.html) · [← DevOps Courses](../devops-courses.html)

<a id="devops-crash-course"></a>

# DevOps

DevOps is taught as a pile of tools — Docker, Kubernetes, Terraform, Jenkins, Prometheus — and learned as a pile of tools, which is why so many people can operate them and so few can explain why any of them exist. This page teaches the mechanisms instead: what a container actually is at the kernel level, why a rebuild invalidates half your image, how Kubernetes decides anything at all, what a deploy strategy is really buying you, and why the fastest teams are also the safest. Every process here is an animation — press **Play**, then walk it with the arrows. The language tabs switch the same example between shell, YAML, Terraform and Python.

> **Key idea**
>
> Four ideas carry almost all of DevOps. **Small changes are safer than large ones** — every practice below exists to make the batch smaller. **Everything is declared and reconciled** — you write down the state you want, and a loop makes reality match it, whether that loop is Terraform, Kubernetes or Argo CD. **Artifacts are immutable and configuration is injected** — build once, promote the same bytes, change only the environment. And **you cannot improve what you cannot see**, so measurement comes before optimisation, both for the system and for the team that runs it. Hold those four and the tools stop being a syllabus and become implementations.

<a id="table-of-contents"></a>

## Table of Contents

1. [The Delivery Loop & the Four Metrics That Matter](#1-delivery-loop)
2. [Version Control as the Source of Truth](#2-version-control)
3. [Build Once — Artifacts, Not Rebuilds](#3-artifacts)
4. [Containers — What They Actually Are](#4-containers)
5. [Kubernetes — One Loop, Repeated](#5-kubernetes)
6. [Infrastructure as Code](#6-iac)
7. [Continuous Integration — The Gate on `main`](#7-ci)
8. [Getting It Out — Deployment Strategies & GitOps](#8-deployment)
9. [Configuration & Secrets](#9-config-secrets)
10. [Deploy Is Not Release — Flags & Migrations](#10-release)
11. [Observability — Logs, Metrics & Traces](#11-observability)
12. [Reliability — SLOs, Capacity & Incidents](#12-reliability)
13. [Security in the Pipeline](#13-security)
14. [The Whole Thing on One Page](#14-one-page)

<a id="unit-1"></a>

## Unit 1 — The Ground It All Stands On

Three ideas come before any tool. If the loop is slow, no tool speeds it up. If the repository is not the source of truth, automation has nothing to automate. And if the thing you tested is not the thing you ship, every later guarantee is void.

<a id="1-delivery-loop"></a>

### 1. The Delivery Loop & the Four Metrics That Matter

- **Deploy frequency** `on demand`
- **Lead time** `< 1 hour`
- **Change failure rate** `< 15%`
- **Time to restore** `< 1 hour`

DevOps began as an argument about organisational structure, not tooling. Development was measured on how much change it produced and operations on how little disruption occurred, which is a design that guarantees the two groups will disagree about every single release. The proposed fix was not a piece of software; it was to give both groups the same goal — *working software in front of users, continuously* — and then to remove everything in the path that made that slow or dangerous. All the tooling in this course is downstream of that.

The useful model is a loop rather than a pipeline. A pipeline has an end, and treating deployment as the end is exactly the habit DevOps exists to break. The loop closes: what production tells you feeds the next change, and the speed of one lap — from an idea to knowing whether it worked — is the number that governs how fast an organisation can learn anything.

> **Analogy** 🔬
>
> **Picture it — a laboratory running experiments**
>
> A scientist who can run one experiment a year will publish very little, no matter how clever each experiment is, because most hypotheses are wrong and the only way to find out which is to run them. A lab that can run an experiment a day will be wrong far more often in absolute terms and will still learn ten times faster. That is the entire DevOps thesis, and it explains the finding that surprises people most: the teams that deploy hundreds of times a day are *not* being reckless. They have made each experiment so small and so reversible that being wrong costs almost nothing.

> **Interactive animation:** `feedback-loop` — rendered by the page script in the HTML version.

Those four numbers in the strip above are the **DORA metrics**, from a research programme that surveyed tens of thousands of engineers over a decade. Two measure throughput — how often you deploy, and how long a commit takes to reach production. Two measure stability — what fraction of deploys cause a problem, and how quickly you recover. The reason they are worth memorising is the correlation between them: the teams at the top of the throughput scale are also at the top of the stability scale. Speed and safety are not opposites, because both are produced by the same thing — small changes, automatically verified, released reversibly.

- **Strength — they are outcomes, not activity** Nothing on the list can be gamed by working harder or by buying a tool. Lead time falls only when something real in the path from commit to production gets shorter, which makes these four numbers unusually honest as metrics go.
- **Weakness — they say nothing about whether you built the right thing** A team can achieve elite DORA scores shipping a product nobody wants. These metrics measure the machinery of delivery, and they are silent on product judgement — treat them as a speedometer, not a destination.

**Interview question**

*Your team deploys every two weeks and each release takes a four-hour maintenance window with three people on a call. Leadership asks you to "deploy daily". Where do you start, and what do you refuse to do first?*

The instinct is to schedule the same release more often, and that is the one thing guaranteed to fail — you would be running the four-hour ritual ten times as often with no reduction in risk. The bottleneck is not the calendar. Start by *measuring the path*: for the last ten releases, how long did a commit sit before it merged, how long did the pipeline take, how much of the four hours was automated and how much was someone reading a checklist? Almost always the answer is that the release is manual and irreversible, and that everything else is a consequence. So the first work is making a rollback fast and boring, then automating the deploy itself, then shrinking the batch. Frequency is the *result* of that work, never the starting point: deploying more often without first making deploys reversible simply increases how often you are in trouble.

**Measure the path — lead time from commit to deploy**

```bash
# Lead time for change, roughly: how old is each commit when it reaches prod?
# Tag every production deploy, then measure back to the commits it contained.
git tag --sort=-creatordate --list 'deploy-*' | head -2 | tr '\n' ' ' \
  | read -r new old

git log --format='%H %ct' "$old..$new" | while read -r sha authored; do
  deployed=$(git log -1 --format=%ct "$new")
  echo "$sha $(( (deployed - authored) / 3600 )) hours"
done | sort -k2 -n | tail -5      # the slowest changes are the interesting ones
```

```python
"""Change failure rate and MTTR from deploy + incident records.

The point of computing these yourself is that the definition forces a
conversation: what counts as a failed deploy? Anything needing a rollback,
a hotfix, or a config change within an hour is the usual answer.
"""
from datetime import timedelta

def change_failure_rate(deploys):
    failed = sum(1 for d in deploys if d["needed_remediation"])
    return failed / len(deploys)

def mttr(incidents):
    durations = [i["resolved_at"] - i["started_at"] for i in incidents]
    durations.sort()
    return durations[len(durations) // 2]          # median, not mean:
                                                   # one 14-hour outage should
                                                   # not define your typical day

print(f"{change_failure_rate(deploys):.0%}", mttr(incidents))
```

> **Warning**
>
> **The metric that quietly ruins teams is deploy frequency on its own.** It is the easiest of the four to move and the easiest to fake — split one release into five, deploy an empty commit, count environments. Always read the four together: frequency rising while change failure rate rises means you are shipping faster into a system that cannot absorb it, which is not progress, it is a queue of incidents forming.

> **Interview**
>
> **"Is DevOps a role or a culture?"** The honest answer is that it was proposed as a culture and the industry turned it into a role, and both facts matter. Saying only "it is a culture, not a job title" sounds evasive; saying only "it is the person who runs the pipelines" misses the point. The strong answer names the goal — shared ownership of software from commit to production — and then observes that most organisations need a small group to build the paved road that makes shared ownership practical, which is what a platform team is.

<a id="2-version-control"></a>

### 2. Version Control as the Source of Truth

- **Branch lifetime** `< 1 day`
- **Merge conflict risk** `grows with time`
- **Reviewable PR** `< 400 lines`
- **In Git** `code + infra + config`

The rule is short: **if it is not in version control, it does not exist.** Not the application code — everyone has that in Git already — but the Dockerfile, the Kubernetes manifests, the Terraform, the pipeline definition, the alert rules, the dashboards, the runbooks. Everything that determines what production looks like should be a file that someone reviewed and merged, because that is the only mechanism that gives you history, review, rollback and attribution for free.

The second half of the rule is about *time*. Version control lets you work apart, and the mistake is to treat that as an invitation. Two histories that have been separate for six weeks have accumulated six weeks of untested interaction, and no tool can tell you what will happen when they meet. Continuous integration — the practice, before it was the name of a product — means integrating into the shared trunk at least daily, so the interaction is tested continuously instead of all at once.

> **Analogy** 📝
>
> **Picture it — two people editing the same document**
>
> Two authors take a copy of a chapter each and go away to write. If they exchange pages every morning, each reconciliation is a couple of sentences and takes a minute. If they meet after six weeks, they are holding two books that describe the same characters differently, and merging them is not clerical work — it is a rewrite. Notice that nothing about the tool changed between those two scenarios. What changed is how long the copies were allowed to drift, and the pain grew with that time, not with the amount written.

> **Interactive animation:** `branching` — rendered by the page script in the HTML version.

- **Strength — short-lived branches make everything downstream cheap** A small pull request gets a real review rather than an approving glance, a small merge cannot conflict much, a small commit can be reverted without collateral damage, and `git bisect` can actually find the change that broke something.
- **Weakness — it demands a test suite you trust** Merging to `main` several times a day is only safe if the automated checks are fast and honest. Teams without that suite adopt long-lived branches as a substitute for confidence, which trades a small problem they can see for a large one they cannot.

**Interview question**

*A team argues that they cannot do trunk-based development because their next feature will take two months to build. How do you respond?*

The objection conflates two different things: how long the *work* takes and how long the *code* stays unintegrated. A two-month feature is still made of small, individually harmless commits — a new table, a new endpoint that nothing calls yet, a UI component behind a switch. Each of those can be merged the day it is written, and none of them changes what a user sees, because the new path is guarded by a feature flag that is off in every environment. What you are trading is real and worth naming: you accept some inactive code in production and the discipline of removing the flag afterwards, in exchange for never facing a two-month merge and for having CI prove, every day, that the new code and everyone else's still work together. The follow-up worth pre-empting is the schema: keep migrations additive and backward-compatible for the same reason, so the database is never the thing that forces a big-bang cutover.

**Guard rails — what makes a fast trunk safe**

```yaml
# .github/workflows/pr.yml — the checks that must pass before merge.
# Branch protection makes these required; that is what turns a convention
# into a rule that survives a busy Friday.
name: pr
on: pull_request

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10          # a gate nobody waits for is not a gate
    steps:
      - uses: actions/checkout@v4
      - run: make lint
      - run: make test-unit
      - run: make build          # prove it still builds before review time
```

```bash
# Require review + green checks, and keep main linear so history is readable.
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=verify" \
  -F "required_pull_request_reviews[required_approving_review_count]=1" \
  -F "enforce_admins=true" \
  -F "allow_force_pushes=false"

# A merge queue re-tests each PR against the tip of main before merging,
# which removes the "green on my branch, red on main" race.
gh api -X POST repos/:owner/:repo/merge-queue 2>/dev/null || true
```

> **Key idea**
>
> **Green on your branch does not mean green on `main`.** Two pull requests can each pass every check in isolation and break the moment both are merged — one renames a function, the other adds a caller. This is called semantic conflict, and Git will never report it. The fixes are to re-test against the tip of `main` before merging (a merge queue) and to keep the window small enough that the race rarely happens.

> **Tip**
>
> Two habits pay for themselves immediately. **Conventional commit messages** (`feat:`, `fix:`, `chore:`) let you generate changelogs and pick version numbers automatically, which removes an argument nobody enjoys. And a **`CODEOWNERS` file** routes review to the people who know the code, which is the cheapest way to stop a repository becoming a place where everything is reviewed by whoever is online.

<a id="3-artifacts"></a>

### 3. Build Once — Artifacts, Not Rebuilds

- **Builds per release** `exactly 1`
- **Identity** `content digest`
- **Tags** `mutable`
- **Config** `injected at run time`

An artifact is the compiled, packaged output of a build: a container image, a jar, a wheel, a static bundle. The rule that everything else in delivery depends on is that it is produced **once** and then *promoted* unchanged through every environment. Not rebuilt for staging. Not rebuilt for production. The same bytes, moving forward, accumulating evidence as they pass each gate.

The reason is that a build is not a pure function of your source. It is a function of your source *and* whatever the network handed you at that moment — a base image tag that moved, a transitive dependency that published a patch, a compiler on a different runner. Rebuild the same commit next week and you may get different bytes. If each environment builds its own, then the thing QA approved and the thing production runs are two different programs that happen to share a commit SHA, and every test result you collected was about the wrong one.

> **Analogy** 💊
>
> **Picture it — a batch of medicine**
>
> A pharmaceutical company does not test the recipe; it tests the *batch*. Every vial carries a batch number, the tests are recorded against that number, and the vials that ship are from the batch that passed. Nobody would accept "we followed the same recipe in the other factory, so it must be equivalent" — the whole apparatus of quality control exists because that assumption is false often enough to matter. A container digest is a batch number, and rebuilding per environment is testing one batch and shipping another.

> **Interactive animation:** `build-promote` — rendered by the page script in the HTML version.

The corollary is where most of the practical work lies: if the artifact is identical everywhere, then everything that differs between environments must arrive from outside it. Database URLs, credentials, replica counts, log levels, feature-flag defaults — all injected at start-up as environment variables or mounted files. This is the third of the *twelve-factor* rules, and it has a sharp test attached: if you can take the production image, run it on a laptop against a local database with nothing but different environment variables, you have separated config from code. If you need a different build, you have not.

- **Strength — test results transfer** Because the digest that passed staging is the digest that runs in production, evidence collected early is still valid later. Rollback also becomes trivial and non-negotiable: deploy the previous digest, which is still sitting in the registry.
- **Weakness — it forces discipline you cannot half-adopt** One environment-specific build flag, one secret baked into a layer, one `if ENV == "prod"` branch, and the guarantee is gone — you are back to hoping the environments are similar. The model gives you a great deal and asks for consistency in return.

**Interview question**

*Your deployment manifest says `image: api:latest`. Everything works. Why is this a problem, and what breaks first?*

A tag is a mutable pointer, so `api:latest` is a question rather than an answer — it means "whatever was pushed most recently", which is a different program depending on when you ask. Three things break, in roughly this order. First, you cannot say what is running: two Pods started an hour apart can be on different code, and neither the manifest nor the deploy log will tell you. Second, rollback stops working, because the previous version has no stable name to return to. Third, scaling becomes a deployment: a new Pod scheduled during an incident pulls whatever `latest` means now, silently upgrading you at the worst possible moment. The fix is to deploy by digest — `api@sha256:9f2c…` — and to treat tags as human-readable aliases only. Keep a semantic tag for people and a digest for machines, and let the pipeline write the digest into the manifest.

**Pin by digest — and prove what is running**

```bash
# Build once, tag with the commit SHA, and capture the immutable digest.
docker build -t ghcr.io/acme/api:"$GIT_SHA" .
docker push ghcr.io/acme/api:"$GIT_SHA"

DIGEST=$(docker inspect --format='{{index .RepoDigests 0}}' \
  ghcr.io/acme/api:"$GIT_SHA")
echo "$DIGEST"      # ghcr.io/acme/api@sha256:9f2c1ab...

# Promotion is a retag, never a rebuild: same bytes, new alias.
docker buildx imagetools create -t ghcr.io/acme/api:prod "$DIGEST"

# What is actually running right now?
kubectl get pods -l app=api \
  -o jsonpath='{range .items[*]}{.status.containerStatuses[0].imageID}{"\n"}{end}' \
  | sort -u          # more than one line = you are running mixed versions
```

```yaml
# The manifest references the digest. The tag next to it is a comment
# for humans; the digest is what the cluster resolves.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          # v1.9.0
          image: ghcr.io/acme/api@sha256:9f2c1ab4e7d0c2b1a8f3e5d6c7b8a9f0e1d2c3b4
          imagePullPolicy: IfNotPresent   # safe: the digest cannot change
          env:
            - name: DATABASE_URL          # everything env-specific
              valueFrom:                  # arrives here, not in the image
                secretKeyRef: { name: api-db, key: url }
            - name: LOG_LEVEL
              value: "info"
```

> **Warning**
>
> **`imagePullPolicy: Always` with a mutable tag is a trap that looks like a safety measure.** It means every Pod restart re-resolves the tag, so a crash-looping Pod can come back on a different version than its siblings, and a node scaling event can deploy code nobody approved. With a digest, `IfNotPresent` is correct and faster — the content cannot have changed, so there is nothing to re-check.

> **Tip**
>
> The strongest version of this idea is a **reproducible build**: same source in, byte-identical artifact out, on any machine, at any time. It requires pinning the base image by digest, committing a lockfile, and zeroing timestamps — and it is worth the effort mainly for security, because it lets someone else rebuild your artifact and verify that what you published is what your source produces.

<a id="unit-2"></a>

## Unit 2 — Packaging and Running

Three technologies, one idea. A container makes an artifact runnable identically anywhere. Kubernetes makes a fleet of them converge on a state you declared. Infrastructure as code does the same for the machines underneath. Learn the declare-and-reconcile pattern once and all three become the same shape.

<a id="4-containers"></a>

### 4. Containers — What They Actually Are

- **Start time** `~50 ms`
- **Kernel** `shared with host`
- **Isolation** `namespaces + cgroups`
- **Writable layer** `dies with the container`

A container is not a lightweight virtual machine, and the difference is not a detail. A VM boots its own kernel on virtualised hardware; a container is an ordinary Linux process that the kernel has been asked to lie to. Two features do the lying. **Namespaces** change what the process can *see* — its own process table, its own filesystem root, its own network interfaces. **cgroups** change what it can *consume* — so much CPU, so much memory, so many PIDs. There is no emulation layer, which is why a container starts in milliseconds and a VM takes half a minute.

> **Analogy** 🏨
>
> **Picture it — a hotel room versus a house**
>
> A virtual machine is a house: its own foundations, its own plumbing, its own roof. Expensive to build, and what happens inside is genuinely nobody else's business. A container is a hotel room: your own door, your own view, your own furniture — but the walls, the water supply and the fire safety are the building's, shared with two hundred other rooms. That is why a room is ready in minutes and a house takes months, and it is also, precisely, why a problem with the building's foundations is your problem too. Shared kernel, shared fate.

> **Interactive animation:** `container-isolation` — rendered by the page script in the HTML version.

The *image* is the other half. It is a stack of read-only layers, each one the filesystem diff produced by a single Dockerfile instruction, addressed by the hash of its contents. Containers started from the same image share those layers on disk and in the registry, which is why pulling your fiftieth service is fast — you already have its base. It is also why layer *order* is the single largest lever on build time, and why one careless `ENV` line can publish your database password to everyone with pull access.

> **Interactive animation:** `image-layers` — rendered by the page script in the HTML version.

- **Strength — the dependency argument ends** The image carries the runtime, the libraries and the system packages, so "works on my machine" becomes "works, because it is the same filesystem". That single property is what made containers the unit of deployment rather than just another packaging format.
- **Weakness — a shared kernel is a shared blast radius** Root in a container is root on the host if anything escapes, and a kernel vulnerability is not contained by a namespace. Run as a non-root user, drop capabilities, mount the root filesystem read-only, and treat "containers are isolated" as a statement about tidiness rather than about security boundaries.

**Interview question**

*A container keeps dying with exit code 137 and no stack trace. What happened, and how do you confirm it?*

137 is 128 + 9, meaning the process received `SIGKILL`. Almost always that is the kernel's OOM killer acting on a cgroup memory limit: the container asked for more memory than its `limits.memory` allowed, and the kernel terminated it immediately. There is no stack trace precisely because `SIGKILL` cannot be caught — the process gets no chance to log anything, which is why this failure looks so mysterious the first time. Confirm it by reading the previous container's termination reason in the Pod status, where you will see `OOMKilled`, and cross-check the memory working set against the limit just before the kill. The fix depends on which of two situations you are in: if usage is stable and simply above the limit, raise the limit; if it grows without bound, you have a leak and raising the limit only changes how long you wait. The related trap worth mentioning is a JVM or Node process that reads the *host's* memory rather than the cgroup's and sizes its heap accordingly — modern runtimes are cgroup-aware, older ones need to be told explicitly.

**Diagnose an OOM kill**

```bash
# Why did the previous container die?
kubectl get pod api-7d4-x9k -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'
# {"exitCode":137,"reason":"OOMKilled","startedAt":"...","finishedAt":"..."}

# What was it using, against what limit?
kubectl top pod api-7d4-x9k --containers
kubectl get pod api-7d4-x9k -o jsonpath='{.spec.containers[0].resources}'

# Locally, the same story is in the cgroup files:
cat /sys/fs/cgroup/memory.max            # the ceiling
cat /sys/fs/cgroup/memory.peak           # how close it came
docker inspect --format='{{.State.OOMKilled}}' my-container
```

```yaml
# requests drive scheduling; limits drive killing. They are not the same knob.
resources:
  requests:
    cpu: "250m"        # what the scheduler reserves on a node for you
    memory: "256Mi"    # set this to the steady-state you actually use
  limits:
    cpu: "1000m"       # exceeding CPU throttles - slow, survivable
    memory: "512Mi"    # exceeding memory kills - instant, no stack trace

# Give the runtime the truth about its ceiling, or it will size its heap
# from the host's total memory and be OOM-killed at 100% "healthy" usage.
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=384"
```

> **Key idea**
>
> **Requests and limits do different jobs and people set them as if they were one.** `requests` is what the scheduler subtracts from a node's capacity when deciding where the Pod fits — too low and you overcommit the node, too high and you waste half the cluster. `limits` is the ceiling the kernel enforces at run time. CPU over the limit is throttled and merely slow; memory over the limit is killed instantly. Set memory `requests` and `limits` close together for predictability, and be deliberate about CPU limits — an aggressive one can throttle a latency-sensitive service that had plenty of idle CPU available next to it.

> **Tip**
>
> Three Dockerfile habits remove most production problems at once. **Multi-stage builds**: compile in a fat image, copy only the output into a slim one, so your compiler and build secrets never ship. **A non-root user**: `USER 1000` costs nothing and removes an entire class of escape. And **a `.dockerignore`** that excludes `.git`, `node_modules` and local `.env` files — which shrinks the build context, speeds up every build, and stops you accidentally baking credentials into a layer.

<a id="5-kubernetes"></a>

### 5. Kubernetes — One Loop, Repeated

- **Model** `declarative`
- **Unit** `Pod`
- **Pod IPs** `ephemeral`
- **Coupling** `by label`

Kubernetes looks like a hundred unrelated resources and is really one idea instantiated a hundred times. You write down a **desired state** and store it in the API server. A **controller** watches that state, compares it with what actually exists, and takes the smallest action that reduces the difference. Then it does it again, forever. Nothing in Kubernetes is a command — there is no "start this container" instruction anywhere in the system, only records of intent and loops closing the gap.

Everything people find surprising follows from that. Self-healing is not a feature; it is the loop having something to do after a node dies. A rolling update is the same loop with a controller that changes the desired state gradually. An operator you write yourself is the same loop applied to a database or a certificate. And the debugging procedure is always the same: compare `spec` with `status`, then read the events in between.

> **Analogy** 🌡️
>
> **Picture it — a thermostat, not a switch**
>
> A light switch is imperative: you say "on", and if someone else turns it off, it stays off. A thermostat is declarative: you say "twenty degrees", and it spends the rest of its life measuring, comparing and nudging. Open a window and it does not complain — it just works harder. You cannot ask a thermostat to "turn the heating on for ten minutes"; the only vocabulary it has is the temperature you want. That constraint is exactly why it keeps working while you are asleep, and it is exactly why `kubectl edit` during an incident gets quietly undone.

> **Interactive animation:** `k8s-reconcile` — rendered by the page script in the HTML version.

The second thing to internalise is how anything reaches a Pod, because Pod IPs change constantly and no client could possibly track them. A **Service** gives a stable name and virtual IP; an **endpoints** list, maintained by yet another controller, tracks which Pods are currently *ready*; and the join between them is a **label selector** rather than any address. Loose coupling by label is what lets you replace every Pod behind a Service without the Service noticing.

> **Interactive animation:** `k8s-networking` — rendered by the page script in the HTML version.

- **Strength — one API for the awkward parts of operations** Rollouts, health checking, restarts, service discovery, secret distribution, horizontal scaling and node failure all have a single, portable vocabulary. That is a genuinely large amount of undifferentiated work to stop writing yourself.
- **Weakness — the floor is high and it is a distributed system you now own** Networking plugins, ingress controllers, storage classes, RBAC, quarterly upgrades and a control plane that can itself be down. For three services on one machine it is a poor trade — Compose or a managed platform will cost you far less and lose you almost nothing.

**Interview question**

*A rollout completes successfully — every Pod is `Running` — but users get 502s for the first two minutes. What is wrong?*

The Pods are running but not *ready*, and something is treating those as the same thing. `Running` only means the container process started; it says nothing about whether the application inside has connected to its database, warmed its cache or begun listening. If the Deployment has no `readinessProbe`, Kubernetes assumes a Pod can serve the instant the process exists, adds it to the Service endpoints, and the rolling update happily terminates an old Pod in exchange — so traffic goes to a process that is not listening yet. Adding a readiness probe that checks a real "can I serve?" endpoint fixes it, because the rollout then waits for readiness before proceeding. The mirror-image problem accounts for the 502s at the *other* end: when a Pod is deleted, endpoint removal and `SIGTERM` happen concurrently, so a Pod can stop accepting connections while some proxy still lists it. That is what a `preStop` sleep of a few seconds and honest graceful shutdown are for. Note also what you must *not* do — point the readiness probe at your database, or a slow dependency will remove every Pod you own from rotation simultaneously.

**Probes and graceful shutdown**

```yaml
spec:
  terminationGracePeriodSeconds: 45
  containers:
    - name: api
      readinessProbe:                 # gates traffic, does NOT restart
        httpGet: { path: /readyz, port: 8080 }
        periodSeconds: 5
        failureThreshold: 2
      livenessProbe:                  # restarts the container - be conservative
        httpGet: { path: /livez, port: 8080 }
        periodSeconds: 15
        failureThreshold: 6           # tolerate a blip; do not restart on one
      startupProbe:                   # holds the other two off during a slow boot
        httpGet: { path: /livez, port: 8080 }
        failureThreshold: 30
        periodSeconds: 2
      lifecycle:
        preStop:
          exec:
            # Let endpoint removal propagate before we stop accepting work.
            command: ["sh", "-c", "sleep 5"]
```

```python
"""/readyz and /livez answer different questions - keep them different."""
import signal, threading

ready = threading.Event()
draining = threading.Event()

def on_startup():
    db.connect()                 # do the slow work explicitly...
    cache.warm()
    ready.set()                  # ...and only then admit traffic

def readyz():
    # "Should I receive requests right now?"  Local state only:
    # depending on the database here turns a slow DB into a full outage.
    return 200 if ready.is_set() and not draining.is_set() else 503

def livez():
    # "Is this process irrecoverably broken?"  Almost always just 200.
    return 200

def handle_sigterm(*_):
    draining.set()               # fail readiness, keep serving in-flight work
    server.shutdown(timeout=30)  # then exit before the grace period ends

signal.signal(signal.SIGTERM, handle_sigterm)
```

> **Warning**
>
> **A liveness probe that checks a dependency is a distributed-systems footgun.** If `/livez` queries the database, then a database with a bad thirty seconds causes Kubernetes to restart every replica of every service that depends on it, simultaneously, turning a degradation into an outage and adding a thundering herd of reconnections on top. Liveness should answer one question — is this process wedged? — and for most services the honest answer is a handler that returns 200 unconditionally.

> **Interview**
>
> **"Do we need Kubernetes?"** The strong answer is a question about scale and shape rather than a preference. Kubernetes pays for itself when you have many services, many teams, real multi-tenancy, and operational needs — bin-packing, rollouts, self-healing, autoscaling — that you would otherwise build yourself. It is a poor trade for a handful of services with steady load, where a managed container platform gives you 80% of the benefit for 10% of the operational surface. Naming the cost honestly — upgrades, networking, RBAC, an on-call rotation for the platform itself — reads as experience, not scepticism.

<a id="6-iac"></a>

### 6. Infrastructure as Code

- **Model** `declarative`
- **Dry run** `plan before apply`
- **State** `must be remote + locked`
- **Console edits** `drift`

Infrastructure as code applies the same declare-and-reconcile pattern to the machines, networks, databases and permissions underneath your applications. You describe the resources you want in files that live in Git; a tool computes the difference between that description and reality; and you review that difference before it is applied. The review step is the part that matters most and the part people skip — `terraform plan` is a diff of production, produced before anything happens to production.

The mechanism that makes this work is **state**: a record mapping your symbolic names to real-world identifiers. Without it the tool cannot distinguish "create a new database" from "this database is already the one I manage", and idempotence collapses. State is also the most dangerous file in the repository — it contains secrets in plain text, it corrupts if two people apply at once, and losing it orphans every resource you own. Remote, locked, versioned, encrypted, one per environment; there is no acceptable alternative.

> **Analogy** 🏗️
>
> **Picture it — blueprints versus a builder's memory**
>
> A building described only by what the builders remember doing can be maintained, extended and repaired — right up until the builders leave. A building described by blueprints can be inspected before a wall moves, reproduced somewhere else, and compared against what was actually constructed. Infrastructure as code is the blueprint, and *drift* is the moment somebody knocks a hole in a wall without updating the drawings. The hole may well have been the right call at the time; the problem is that from then on, two documents claim to describe the same building and only one of them is true.

> **Interactive animation:** `iac-plan` — rendered by the page script in the HTML version.

- **Strength — infrastructure gets code's tooling** Review, history, blame, branches, revert and testing all arrive at once, and an environment becomes something you can create rather than something you inherit. Rebuilding a region after a disaster stops being a heroic exercise and becomes a pipeline run.
- **Weakness — the abstraction leaks under pressure** Cloud APIs are eventually consistent, deletions can be irreversible, and a plan that shows `1 to destroy` on a database is a bad afternoon waiting to happen. It is also genuinely awkward for the first import of infrastructure that already exists.

**Interview question**

*A colleague reports that `terraform apply` is trying to destroy and recreate the production database. The code has not changed. What are the likely causes?*

Something has changed one of the resource's *immutable* attributes, so the provider cannot update in place and plans a replacement instead. The usual suspects are all mundane. Someone renamed the resource block, which changes its address in state, so Terraform sees the old one as gone and a new one as needed — a `moved` block or a `state mv` fixes it with no infrastructure change at all. Or a value that forces replacement was edited: the engine version, the availability zone, the identifier, the subnet group. Or a provider upgrade changed a default. Or the state file was lost or is the wrong one, so nothing appears to be managed. The procedure is the same in every case: read the plan for the line that says `forces replacement`, because Terraform tells you exactly which attribute is responsible; then decide whether to correct the code or to reconcile state. The permanent mitigation is `prevent_destroy` on stateful resources, so that this class of mistake fails the plan rather than succeeding at 5 p.m. on a Friday.

**Guard the resources you cannot recreate**

```hcl
resource "aws_db_instance" "primary" {
  identifier     = "acme-prod"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.r6g.large"

  lifecycle {
    prevent_destroy = true        # plan fails rather than proposing a delete
    ignore_changes  = [
      engine_version,             # patched out-of-band by the provider
    ]
  }
}

# Renaming a resource? Tell Terraform it moved, or it will replace it.
moved {
  from = aws_db_instance.db
  to   = aws_db_instance.primary
}
```

```bash
# Never apply from a plan you did not read. Save it, review it, apply that file.
terraform plan -out=tfplan
terraform show -json tfplan | jq -r '
  .resource_changes[]
  | select(.change.actions | index("delete"))
  | "\(.change.actions | join(",")): \(.address)"'

# Fail the pipeline automatically if anything is being destroyed.
terraform show -json tfplan | jq -e '
  [.resource_changes[].change.actions[]] | index("delete") | not' \
  || { echo "plan destroys resources - requires manual approval"; exit 1; }

terraform apply tfplan
```

> **Key idea**
>
> **The most valuable habit in infrastructure work is reading the plan, and the most valuable line is the summary.** `Plan: 2 to add, 1 to change, 0 to destroy` — the last number is the one that ends careers. Make the pipeline print it, make a destroy require a second human, and never run `apply` against a plan that was generated at a different moment than the one you reviewed.

> **Tip**
>
> Split state by **blast radius and change frequency**, not by tidiness. Networking and IAM change rarely and break everything; application resources change daily. Keeping them in one state means every routine deploy holds a lock on your VPC and can propose changes to it. Separate states, wired together with data sources or remote state outputs, keep a bad plan small.

<a id="unit-3"></a>

## Unit 3 — Shipping

Now the loop closes. Continuous integration decides whether a change may become a candidate; deployment decides how many users meet it and how fast you can take it back; configuration and feature flags decide what "released" even means. The theme running through all four sections is *reversibility*.

<a id="7-ci"></a>

### 7. Continuous Integration — The Gate on `main`

- **Target feedback** `< 10 min`
- **Order stages by** `cost, ascending`
- **Flaky test** `worse than none`
- **Output** `one signed artifact`

Continuous integration is two things wearing one name. The *practice* is merging everyone's work into a shared trunk at least daily so that integration problems surface while they are still small. The *system* is the automation that makes that practice safe: a series of gates that run on every change and answer one binary question — may this proceed? Buying the system without adopting the practice is extremely common and gets you a build server, not continuous integration.

The design principle for the pipeline is simple and almost always violated: **order the stages by cost, cheapest first.** Linting takes eight seconds and catches a third of the mistakes; end-to-end tests take fourteen minutes and catch the rare ones. Running them in that order means the common failure is reported before you have spent the compute on the rare one. And the whole pipeline has a deadline that is psychological rather than technical: past about ten minutes, developers switch to another task, and the tight feedback loop that justified the pipeline is gone.

> **Analogy** 🛂
>
> **Picture it — airport security, arranged sensibly**
>
> You show a boarding pass before you queue for the scanner, and you queue for the scanner before anyone opens your bag. Nobody would empty every passenger's suitcase first and check boarding passes at the gate — the cheap check that rejects most problems goes at the front, so the expensive one is only spent on people who passed it. A pipeline is that queue. The other half of the analogy is the part people forget: a scanner that alarms on one bag in twenty at random gets ignored by the staff within a week, and a flaky test does exactly the same thing to your team.

> **Interactive animation:** `ci-pipeline` — rendered by the page script in the HTML version.

What goes *in* those stages is the other half of the question, and the answer is the test pyramid: many fast unit tests, fewer integration tests that touch real dependencies, a handful of end-to-end tests covering the paths that make money. The reasoning is diagnostic rather than aesthetic — a failing unit test names a function, while a failing end-to-end test names the system and leaves you to find out which of forty components moved.

> **Interactive animation:** `test-pyramid` — rendered by the page script in the HTML version.

- **Strength — it converts hope into evidence** "It should be fine" becomes a list of checks that ran on this exact artifact, recorded and repeatable. That evidence is what makes it reasonable to deploy on a Friday afternoon, which is the real test of whether a pipeline is doing its job.
- **Weakness — it degrades quietly** Nobody decides to have a slow, flaky pipeline; it arrives one test at a time. Once "just re-run it" becomes normal, the suite has stopped being a signal while continuing to cost full price — and the failure is invisible on every dashboard.

**Interview question**

*Your pipeline takes 45 minutes and the team has started merging without waiting for it. What do you do?*

Treat it as an incident, because it is one — the gate is open. Start by measuring where the time goes per stage rather than guessing, because the answer is usually surprising: dependency installation with no cache, a container image rebuilt from scratch on every job, or an end-to-end suite with fixed sleeps in it. Then attack in this order. First, *parallelise* what is independent — lint, unit tests and build have no reason to be sequential. Second, *cache* aggressively: dependency directories keyed on the lockfile hash, Docker layer caching, compiled artifacts. Third, *move* what does not need to run per-commit: the full end-to-end suite and load tests go to a schedule or to a post-merge job. Fourth, *delete or quarantine* the flaky tests, which is uncomfortable but correct — a test with a 5% false-failure rate in a suite of two hundred means the suite is almost never green, and that is what taught the team to stop waiting. Only after all four would I add hardware, because a bigger runner makes a badly-shaped pipeline slightly less slow at permanent extra cost.

**Fast by construction — cache, parallelise, fail fast**

```yaml
name: ci
on: [push, pull_request]

concurrency:                       # a new push cancels the previous run:
  group: ci-${{ github.ref }}      # nobody needs the result for stale code
  cancel-in-progress: true

jobs:
  quick:                           # cheap gates, run first and in parallel
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: true
      matrix:
        check: [lint, types, unit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: pip               # keyed on the lockfile, not on time
      - run: pip install -r requirements.txt
      - run: make ${{ matrix.check }}

  image:
    needs: quick                   # only pay for a build that can succeed
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write              # OIDC: no long-lived registry password
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/acme/api:${{ github.sha }}
          cache-from: type=gha     # reuse layers across runs
          cache-to: type=gha,mode=max
```

```bash
# Before optimising anything, find out where the time actually goes.
gh run list --workflow=ci.yml --limit 50 --json databaseId \
  | jq -r '.[].databaseId' \
  | while read -r id; do
      gh api "repos/:owner/:repo/actions/runs/$id/jobs" \
        | jq -r '.jobs[] | "\(.name) \(((.completed_at|fromdate) -
                                        (.started_at|fromdate)))"'
    done | awk '{sum[$1]+=$2; n[$1]++}
                END {for (j in sum) printf "%-24s %6.0fs avg\n", j, sum[j]/n[j]}' \
         | sort -k2 -rn

# Find the flaky tests: same commit, different result.
pytest --count=20 -x -q tests/ 2>&1 | grep -E '^(FAILED|ERROR)' | sort | uniq -c
```

> **Warning**
>
> **A flaky test is worse than no test.** It costs the same to run, it fails often enough that people learn to re-run rather than investigate, and that habit generalises — once "re-run it" is the reflex, a genuine failure gets re-run too. Quarantine flakes out of the blocking suite the day you find them, fix them on a schedule, and delete the ones nobody will fix. A smaller suite that is always believed is worth more than a large one that is not.

> **Tip**
>
> Give the pipeline an identity instead of a password. GitHub Actions, GitLab and most CI systems can exchange a short-lived **OIDC token** for cloud credentials, so there is no static access key to leak, rotate or find in a log. And scope job permissions explicitly — `permissions: contents: read` by default, widened only where a job genuinely needs to write.

<a id="8-deployment"></a>

### 8. Getting It Out — Deployment Strategies & GitOps

- **Rolling** `no downtime, 1× cost`
- **Blue-green** `rollback in seconds`
- **Canary** `fails on 5%`
- **All of them** `need a compatible schema`

Every deployment strategy is an answer to one question, and it is not "how do we avoid downtime" but **how much do we pay to shorten the time between shipping a mistake and undoing it?** Recreate pays nothing and takes an outage. Rolling pays for one extra instance and gives you a gradual, minutes-long rollback. Blue-green pays for a duplicate fleet and gives you a rollback measured in seconds. Canary pays for traffic splitting and per-version metrics, and gives you an automated decision before most users are affected at all.

> **Analogy** 🌉
>
> **Picture it — replacing a bridge**
>
> Close the bridge and rebuild it: cheapest, and nobody crosses for a month — that is recreate. Replace it one lane at a time while traffic uses the others: no closure, but for a while half the bridge is old and half is new and they must fit together — that is a rolling update, and "they must fit together" is precisely why your two versions have to share a database schema. Build a complete second bridge alongside and divert everything in one evening: expensive, instantly reversible — blue-green. Or open the new bridge to buses only, watch it for a week, then let everyone on — canary.

> **Interactive animation:** `deploy-strategies` — rendered by the page script in the HTML version.

The second question is *who does the deploying*. The default is push: CI finishes and reaches into the cluster with production credentials. It is simple and it works, and it has two properties that get uncomfortable at scale — every repository that can deploy holds keys to production, and nothing in the system continuously checks that the cluster still matches what you declared. **GitOps** inverts it: an agent inside the cluster pulls the desired state from Git and reconciles, so a deploy is a commit, a rollback is a revert, and manual changes are detected and undone.

> **Interactive animation:** `gitops` — rendered by the page script in the HTML version.

- **Strength — deployment becomes a decision with evidence** Progressive strategies turn a release from an event into a measurement: you see the new version's error rate next to the old one's before committing to it, and the rollback path is exercised routinely rather than discovered during an incident.
- **Weakness — none of them roll back your data** Every strategy on this page assumes the two versions can share the database. A migration that renames a column defeats all four, because the code is reversible and the schema is not — which is why section 10 exists.

**Interview question**

*You deploy at 14:00 and errors climb at 14:05. Walk me through the next five minutes.*

Mitigate first, diagnose second — and be explicit that this ordering is the whole answer. The temptation is to look for the root cause while the graph is red, and it routinely turns a five-minute incident into an hour. So: confirm the correlation with the deploy marker on the error graph, then take the fastest reversal available. If the change is behind a feature flag, turn the flag off, because it is instant and touches nothing else. Otherwise roll back to the previous digest — `kubectl rollout undo`, a traffic switch back to blue, or a revert commit if the cluster is reconciled from Git. Announce what you did in the incident channel as you do it, because the second-worst outcome is two people mitigating in different directions. Only once errors are back to baseline do you start on *why*, with the failing version's traces and logs still available. The follow-up question is usually "what if rollback does not help?" — and the honest answer is that this is exactly when you must suspect a database migration or an external change, since those are the two things a code rollback does not undo.

**Reverse it — the three fast paths**

```bash
# 1. Rolling deployments keep the previous ReplicaSet - undo is one command.
kubectl rollout undo deployment/api
kubectl rollout status deployment/api --timeout=120s

# 2. GitOps: the deploy was a commit, so the rollback is a revert.
git revert --no-edit "$BAD_SHA" && git push      # the agent converges

# 3. Blue-green: flip the Service selector back. Sub-second.
kubectl patch service api -p '{"spec":{"selector":{"version":"blue"}}}'

# Confirm the correlation before you act, and after.
kubectl rollout history deployment/api
kubectl get events --sort-by=.lastTimestamp | tail -20
```

```yaml
# An automated canary: the analysis, not the traffic split, is the point.
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: api
spec:
  targetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  analysis:
    interval: 1m
    threshold: 5                # 5 failed checks aborts and rolls back
    maxWeight: 50
    stepWeight: 10              # 10% -> 20% -> ... with a check at each step
    metrics:
      - name: request-success-rate
        thresholdRange: { min: 99 }
        interval: 1m
      - name: request-duration
        thresholdRange: { max: 500 }   # p99 milliseconds
        interval: 1m
    webhooks:
      - name: load-test         # generate enough traffic to be significant
        url: http://flagger-loadtester/
        metadata: { cmd: "hey -z 1m -q 10 http://api-canary/" }
```

> **Key idea**
>
> **Practise the rollback, not just the deploy.** A rollback path that has never been exercised is a hypothesis, and incidents are a poor time to test hypotheses. Roll back a real service in a real environment on a quiet afternoon, time it, and find out which of the interesting things — the migration, the cache format, the message schema — makes it not work. Teams that do this discover their true recovery time is far worse than they assumed, which is much better learned deliberately.

> **Interview**
>
> **"Blue-green or canary?"** Answer with the constraint rather than the preference. Canary needs enough traffic for a 5% slice to be statistically meaningful and per-version metrics to judge it with — below that, you are guessing with extra machinery. Blue-green needs the budget for a duplicate fleet and a change that can cut over atomically, and it shines when a slow rollback is unacceptable. Rolling is the right default for most services, and knowing when the default is good enough is the part that signals experience.

<a id="9-config-secrets"></a>

### 9. Configuration & Secrets

- **Config** `env vars or mounted files`
- **Secrets** `fetched at run time`
- **Rotation target** `minutes`
- **In the image** `never`

Configuration is everything that differs between environments; secrets are the subset of that which must never be read by anyone who does not need it. Both are injected rather than built in, but for different reasons — configuration because the artifact must be identical everywhere, secrets because an image layer is a permanent, copyable, unauditable place to put a password.

The question that separates a real secrets design from a superficial one is not "where is it stored" but **how long does it take to rotate?** If a leaked database password can be changed in the secret store and picked up within the hour with no rebuild and no redeploy, the design works. If rotation means rebuilding every image that embedded it and coordinating a deploy across six services, then in practice it will never be rotated at all — and a credential that is never rotated is a credential you have already lost and do not know it.

> **Analogy** 🔑
>
> **Picture it — a hotel key card, not a cut key**
>
> A cut metal key is copyable, has no expiry and cannot be revoked — if one goes missing you change the lock, which means every other key must be reissued too. A hotel key card is issued to a guest, works for one room, expires at checkout, and can be cancelled from the front desk without touching anybody else's. Notice that the card is not more secret than the key; it is more *revocable*, and that is the property that actually matters when something goes wrong. Secrets baked into images are cut keys. Short-lived credentials issued against a workload identity are key cards.

> **Interactive animation:** `secrets-flow` — rendered by the page script in the HTML version.

- **Strength — identity removes the bootstrap problem** Cloud IAM roles, Kubernetes service accounts and OIDC federation let a workload prove who it is without holding a credential first, which is the only clean escape from "a secret to fetch the secret". Every read is then attributable in an audit log.
- **Weakness — secrets leak sideways** Into logs when an exception prints a connection string, into a Kubernetes `Secret` that is only base64-encoded, into CI output, into an error tracker's request context. Assume every value will eventually be printed somewhere, and prefer short lifetimes over careful handling.

**Interview question**

*A developer pushed an AWS access key to a public repository ten minutes ago. What do you do, in order?*

Revoke first, and be clear about why the order matters: the key is already scraped. Automated crawlers find keys on GitHub within seconds, so every minute spent tidying history is a minute the credential is live. So step one is to deactivate the key in IAM — not delete it yet, because you will want it for the investigation. Step two is to look for use: CloudTrail for calls made with that access key ID, particularly from unfamiliar regions or principals, and especially anything that creates users, roles or keys, since establishing persistence is the first thing an attacker does. Step three, issue a replacement through the proper channel and unblock the developer. Step four — and only now — deal with the repository: understand that removing the commit does *not* revoke anything and that forks, caches and clones persist regardless. Then the part that actually prevents a recurrence: a pre-commit secret scanner and push protection so the next one is blocked locally, and a longer-term move to short-lived credentials via OIDC so there is no static key to leak. The answer that just says "rotate the key and rewrite history" misses that the interesting work is detection and prevention.

**Contain, investigate, prevent**

```bash
# 1. Revoke immediately - deactivate, do not delete; you need it for the audit.
aws iam update-access-key --access-key-id AKIA... --status Inactive \
  --user-name build-bot

# 2. What was done with it?
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=AccessKeyId,AttributeValue=AKIA... \
  --start-time "$(date -u -v-24H '+%Y-%m-%dT%H:%M:%SZ')" \
  --query 'Events[].{t:EventTime,e:EventName,src:Username}' --output table

# 3. Stop the next one at the developer's machine, not in review.
pip install pre-commit detect-secrets
detect-secrets scan > .secrets.baseline
cat >> .pre-commit-config.yaml <<'YAML'
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks: [{ id: detect-secrets, args: ["--baseline", ".secrets.baseline"] }]
YAML
pre-commit install
```

```yaml
# The durable fix: no static key exists. CI exchanges a short-lived OIDC
# token for a role session, scoped to this repository and this branch.
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/ci-deploy
      aws-region: us-east-1
      # No AWS_ACCESS_KEY_ID anywhere. The trust policy on ci-deploy
      # restricts sub to repo:acme/api:ref:refs/heads/main, so a fork
      # or a feature branch cannot assume it.

  - run: aws sts get-caller-identity   # a 1-hour session, then it is gone
```

> **Warning**
>
> **A Kubernetes `Secret` is base64, not encryption.** Anyone who can read Secrets in a namespace can read the values, and by default they are stored in etcd unencrypted. Turn on encryption at rest, restrict `get secrets` with RBAC as tightly as you restrict anything, and for anything genuinely sensitive use an external store with a CSI driver or an operator so the value is never a durable Kubernetes object at all.

> **Tip**
>
> Fail fast on missing configuration. A service that starts happily with an unset `DATABASE_URL` and fails on the first request has converted a start-up error into a user-visible one, and it will pass its readiness probe on the way. Validate the complete config at boot, log the names of what you loaded (never the values), and exit non-zero if anything required is absent.

<a id="10-release"></a>

### 10. Deploy Is Not Release — Flags & Migrations

- **Deploy** `code is running`
- **Release** `users experience it`
- **Flag off** `seconds to reverse`
- **Migration** `not reversible`

These two words get used interchangeably and they name different events. **Deploy** is a technical act: the new code is on the servers. **Release** is a product act: users encounter the new behaviour. Conflating them is what makes deployment frightening, because it forces every deploy to carry the full risk of every behaviour change it contains. Separate them with a feature flag and the deploy becomes routine — the code is there, executing zero times — while the release becomes a runtime decision that can be reversed in seconds by someone who is not an engineer.

> **Interactive animation:** `feature-flag` — rendered by the page script in the HTML version.

Which leaves the one thing no flag and no deployment strategy can reverse: the database. During any rolling update two versions of your code are live simultaneously, so the schema must satisfy both. And after a rollback the *old* code must still work against the *new* schema. The pattern that satisfies both constraints is **expand and contract**: add the new structure, deploy code that writes both and reads the new, backfill, deploy code that uses only the new, and drop the old structure days later once you are certain no rollback will need it.

> **Analogy** 🚇
>
> **Picture it — moving a railway station**
>
> You do not close the old platform and open the new one at midnight and hope every train, timetable and signalling system agrees. You build the new platform, run services to both for a while, move the timetables across gradually, and only remove the old platform once nothing has referenced it for a month. It is slower and it is more work, and it is the only version where a mistake at any step leaves you somewhere you can retreat from. Expand-and-contract is that, applied to a column.

> **Interactive animation:** `db-migration` — rendered by the page script in the HTML version.

- **Strength — risk moves to where it can be controlled** Deploying becomes safe enough to do continuously, and the risky part — exposing new behaviour — becomes gradual, measurable and instantly reversible without a pipeline run.
- **Weakness — flags and migrations both accumulate** Every flag doubles the code paths that theoretically need testing, and stale flags rot into dead branches nobody dares remove. Every expand-and-contract migration leaves a "drop the old column" step that is easy to forget. Both need an owner and an expiry date at creation time.

**Interview question**

*You need to add a `NOT NULL` column with a default to a table with 200 million rows, on a live system. How?*

The naive statement is a trap whose danger depends entirely on the database version, so the first move is to say which one you are on. On older PostgreSQL and on MySQL, adding a column with a default rewrites the entire table under an exclusive lock — minutes to hours during which every query on that table blocks, which is a full outage even though nothing crashed. Modern PostgreSQL stores the default in the catalogue and makes this instant, so the answer may be "just do it, but verify on a copy first". Where a rewrite is a risk, split the operation: add the column as *nullable* with no default, which is a metadata-only change; deploy code that writes the value on every insert and update; backfill the historical rows in batches of a few thousand with a pause between them so replication and the buffer cache keep up; and only then add the `NOT NULL` constraint, using a validated check constraint where the database supports promoting it without a full scan. The general principle worth stating explicitly: *never let a migration hold a lock for longer than a request timeout*, and always set a `lock_timeout` so that if it cannot acquire the lock quickly it fails harmlessly instead of queueing every other query behind it.

**A migration that cannot take the site down**

```python
"""Expand → backfill → constrain. Three deploys, no long lock."""

# --- migration 1: metadata only, instant, safe on any version -------------
def expand():
    execute("SET lock_timeout = '3s'")      # fail fast rather than queue
    execute("ALTER TABLE orders ADD COLUMN currency text")

# --- between deploys: application writes the new column on every write ----

# --- migration 2: backfill in batches, never one big UPDATE ---------------
def backfill(batch=5_000):
    while True:
        n = execute("""
            UPDATE orders SET currency = 'USD'
            WHERE id IN (SELECT id FROM orders
                         WHERE currency IS NULL
                         ORDER BY id LIMIT %s
                         FOR UPDATE SKIP LOCKED)
        """, batch)
        if n == 0:
            return
        sleep(0.2)          # let replicas catch up; this is the whole trick

# --- migration 3: constrain without a full-table exclusive scan -----------
def constrain():
    execute("ALTER TABLE orders ADD CONSTRAINT currency_set "
            "CHECK (currency IS NOT NULL) NOT VALID")   # instant
    execute("ALTER TABLE orders VALIDATE CONSTRAINT currency_set")  # no write lock
```

```bash
# Migrations run as their own step, before the app deploy, and they are
# forward-only: rolling back code must never require rolling back schema.
kubectl create job --from=cronjob/migrate "migrate-$GIT_SHA"
kubectl wait --for=condition=complete "job/migrate-$GIT_SHA" --timeout=15m

# Watch for the failure mode that matters: a migration blocking live queries.
psql -c "SELECT pid, wait_event_type, left(query, 60) AS query,
                now() - query_start AS runtime
         FROM pg_stat_activity
         WHERE state <> 'idle' ORDER BY runtime DESC LIMIT 10;"

# If a migration is holding a lock, cancel it - it is designed to be resumable.
psql -c "SELECT pg_cancel_backend(PID);"
```

> **Key idea**
>
> **Migrations are forward-only in practice, whatever your framework promises.** A `down()` function that drops a column is not a rollback — it is data loss with good intentions. Design so that rolling back the *code* never requires rolling back the *schema*: keep every migration additive and backward-compatible, and make removal a separate change shipped days later. This single rule is what allows a rollback to be a decision someone can make at 3 a.m. without a database expert on the call.

> **Tip**
>
> Give every feature flag an owner, a created date and a removal date at the moment it is introduced, and put a recurring item on the team's board to clear expired ones. Flags are debt with a useful purpose — the interest is paid in test combinations and in the confusion of the next person who reads the code and cannot tell which branch production actually takes.

<a id="unit-4"></a>

## Unit 4 — Running It in Production

Shipping is half the loop. The other half is knowing what happened, deciding how reliable is reliable enough, recovering quickly when it is not, and making sure that what you shipped is what you intended to ship.

<a id="11-observability"></a>

### 11. Observability — Logs, Metrics & Traces

- **Metrics** `detect`
- **Traces** `localise`
- **Logs** `explain`
- **Cardinality** `is the bill`

Three signals, and the way to keep them straight is by the question each answers cheaply. Metrics are pre-aggregated numbers over time: cheap to store, cheap to query over a year, and therefore the right thing to *alert* on. Traces follow one request across every service it touched, so they tell you *where* the time or the error came from. Logs carry the full detail of a single event, so they tell you *why*. Reaching for the wrong one is the most common reason a debugging session takes an afternoon — grepping logs to find out whether error rates rose is both slow and expensive, and it is a question a metric answers instantly.

> **Analogy** 🏥
>
> **Picture it — a hospital**
>
> The bedside monitor is metrics: heart rate and blood pressure, sampled continuously, cheap, and the thing that sets off an alarm. It tells you something is wrong and almost nothing about what. The scan is a trace: expensive, not run continuously, and it shows you exactly which organ the problem is in. The patient's notes are logs: everything that happened, in detail, useful once you know where to look and overwhelming before that. Nobody diagnoses from the monitor alone, and nobody scans every patient every hour. You use each for the question it is cheap at.

> **Interactive animation:** `observability-pillars` — rendered by the page script in the HTML version.

Traces deserve their own walk-through, because they are the signal most teams have least experience with and the one that collapses the hardest problems. When latency doubles across eight services, per-service dashboards show eight graphs that all look slightly worse; a single trace shows where the time actually went, and the *shape* of the waterfall often names the bug before you read any code.

> **Interactive animation:** `trace-spans` — rendered by the page script in the HTML version.

- **Strength — it makes unfamiliar failures tractable** The point of observability is answering questions you did not anticipate, without shipping code to answer them. That is what turns "we have never seen this before" from a multi-day investigation into a query.
- **Weakness — it is easy to spend more on telemetry than on compute** Debug logs at full volume, a label with unbounded values, 100% trace sampling: any one of these can multiply the bill without improving a single decision. Instrument deliberately and measure what your telemetry costs.

**Interview question**

*Your observability bill tripled after a release, and nothing about the traffic changed. What happened?*

Almost certainly cardinality. A time-series database stores one series per unique combination of label values, so a metric like `http_requests_total{route, status}` might be forty series — while adding `user_id`, a request ID, or a raw URL path with identifiers in it makes that forty times the number of distinct values, forever, because old series are retained. The second candidate is a log-level change: someone shipped `DEBUG` to production, and volume-priced ingestion does the rest. The third is a trace sampling rate turned up for an investigation and never turned back down. The way to find out is to ask the backend which metric names have the most active series and which services grew their ingestion, then correlate with the release. The prevention is structural rather than disciplinary: *put high-cardinality context on logs and traces, never on metric labels*, normalise URL paths into route templates before they become labels, and enforce a limit so that a bad label rejects a metric instead of quietly costing money.

**Keep labels bounded, put detail on the trace**

```python
from prometheus_client import Counter
from opentelemetry import trace

# Labels must have a small, KNOWN set of values. route is the template
# "/orders/{id}", never the concrete "/orders/91827".
requests = Counter("http_requests_total", "", ["route", "method", "status"])

# WRONG - unbounded label sets, one series per user, retained forever:
# requests = Counter("http_requests_total", "", ["route", "user_id", "url"])

tracer = trace.get_tracer(__name__)

def handle(request):
    with tracer.start_as_current_span("handle_order") as span:
        # High-cardinality context belongs HERE. Span attributes are stored
        # per-trace, not per-series, so they cost nothing to add.
        span.set_attribute("user.id", request.user_id)
        span.set_attribute("order.id", request.order_id)
        span.set_attribute("tenant", request.tenant)

        response = process(request)
        requests.labels(request.route, request.method, response.status).inc()
        return response
```

```bash
# Which metric is responsible? Ask the server for the biggest offenders.
curl -s 'http://prometheus:9090/api/v1/status/tsdb' \
  | jq '.data.seriesCountByMetricName[:10]'

# Which label is exploding within that metric?
curl -s --data-urlencode 'query=count by (__name__)({__name__=~"http_.*"})' \
  http://prometheus:9090/api/v1/query | jq '.data.result'

# Enforce a ceiling so a bad deploy is rejected, not billed.
cat <<'YAML' >> prometheus.yml
  sample_limit: 5000          # per scrape; a target above this is dropped
  label_limit: 20
  label_value_length_limit: 128
YAML
```

> **Key idea**
>
> **Alert on symptoms, never on causes.** "CPU above 80%" is not an incident — a healthy service under load looks exactly like that. "Checkout error rate above the burn-rate threshold" is an incident, because it describes something a user is experiencing. Cause-based alerts are how pagers fill with noise, and a noisy pager is worse than a silent one: it teaches people to wait before looking.

> **Tip**
>
> Two small changes give you most of correlation for free. Emit **structured logs** — JSON with consistent field names, not formatted prose — so that a log becomes queryable rather than greppable. And put the **`trace_id` on every log line**, so that a slow trace links directly to the log lines it produced. Together they turn three separate tools into one investigation.

<a id="12-reliability"></a>

### 12. Reliability — SLOs, Capacity & Incidents

- **99.9% / month** `43 min`
- **99.99% / month** `4.3 min`
- **Each extra nine** `~10× cost`
- **Optimise** `MTTR`

"How reliable should this be?" has exactly one bad answer, and it is "as reliable as possible", because that is a request for an unbounded budget with no way to tell when you are done. The useful framing is a **service level objective**: pick something you can measure that reflects user experience — the fraction of requests served successfully and quickly — and set a target for it over a window. Everything below the target is the **error budget**, and the budget is not a threat but an allowance you are expected to spend on shipping.

> **Interactive animation:** `error-budget` — rendered by the page script in the HTML version.

The second half of reliability is what happens when you are spending that budget faster than planned. Note which variable you actually control: incident *frequency* is driven largely by complexity, dependencies and luck, while *time to recover* is a property of your alerting, your tooling and your practice. That is why mature teams optimise MTTR — it is the term in the equation that responds to effort.

> **Interactive animation:** `incident-timeline` — rendered by the page script in the HTML version.

And underneath both sits capacity. Autoscaling is what most teams reach for, and it is worth being precise about what it does: it is a reactive control loop with roughly ninety seconds of dead time between a metric crossing a threshold and a new instance serving traffic. That makes it excellent at following a daily traffic curve and cutting your bill, and close to useless against a spike that arrives in ten seconds.

> **Interactive animation:** `autoscaling` — rendered by the page script in the HTML version.

- **Strength — it converts an argument into a policy** With an SLO and a budget, "should we ship this or stabilise?" is answered by a number the whole organisation agreed on in advance, rather than by whoever is most senior in the room that day.
- **Weakness — an SLO with no consequence is decoration** If missing the target changes nothing about what the team works on next, you have built a dashboard. The policy — what a depleted budget actually stops — is the part that requires organisational agreement, and it is the part most often skipped.

**Interview question**

*You are asked to guarantee 99.99% availability for a new service. What do you say?*

Ask what it is for, then make the cost explicit, because the number is usually chosen by intuition rather than by need. 99.99% is 4.3 minutes of failure per month, which rules out anything with a single point of failure: you need multiple availability zones, a database with automatic failover that has been tested, deploys that cannot cause user-visible errors, alerting that fires in under a minute, and a staffed on-call rotation — because if a human must wake up and act, you have already spent most of the budget. Then the part that changes the conversation: your dependencies cap you. If the payment provider you call publishes 99.9%, your service cannot exceed that on any request that touches it, regardless of your own engineering. And it is worth noting that users on mobile networks experience more failure than the difference between three and four nines, so the extra investment may not be perceptible to anyone. I would propose starting at 99.9%, measuring the real SLI for a quarter, and revisiting with evidence — which is not hedging, it is refusing to spend ten times more before knowing whether the first target is even being met.

**Multi-window burn-rate alerts**

```yaml
# Two windows per alert: a long one for significance, a short one so the
# alert resolves quickly once the burn stops. This is the standard pattern
# and it removes most pager noise on its own.
groups:
  - name: slo-checkout
    rules:
      - alert: CheckoutBudgetBurnFast
        # 14.4x burn = the 30-day budget is gone in ~2 days. Page a human.
        expr: |
          (slo:error_ratio:rate1h{svc="checkout"}   > 14.4 * 0.001)
          and
          (slo:error_ratio:rate5m{svc="checkout"}   > 14.4 * 0.001)
        for: 2m
        labels: { severity: page }
        annotations:
          summary: "Checkout is burning error budget 14x too fast"
          runbook: https://runbooks.acme.dev/checkout

      - alert: CheckoutBudgetBurnSlow
        # 6x burn over 6 hours: real, but it can wait for working hours.
        expr: |
          (slo:error_ratio:rate6h{svc="checkout"}   > 6 * 0.001)
          and
          (slo:error_ratio:rate30m{svc="checkout"}  > 6 * 0.001)
        for: 15m
        labels: { severity: ticket }
```

```bash
# The arithmetic, so the target stops being an abstraction.
for slo in 0.99 0.999 0.9999 0.99999; do
  budget=$(echo "(1 - $slo) * 30 * 24 * 60" | bc -l)
  printf "%-9s %8.1f minutes per 30 days\n" "$slo" "$budget"
done
# 0.99         432.0 minutes per 30 days
# 0.999         43.2 minutes per 30 days
# 0.9999         4.3 minutes per 30 days
# 0.99999        0.4 minutes per 30 days

# And the dependency ceiling: serial dependencies multiply.
echo "0.999 * 0.999 * 0.9995" | bc -l   # .99799... -> you cannot promise 99.9%
```

> **Warning**
>
> **Autoscaling is a cost tool that helps with load, not a defence against spikes.** Between the metric scrape, the controller's evaluation, scheduling, the image pull and application warm-up there is roughly a minute and a half you cannot remove. If your traffic can double in ten seconds, the answers are pre-scaling on a schedule, permanent headroom, load shedding and queueing — not a more aggressive threshold. Watch the second-order effect too: scaling the stateless tier ten-fold multiplies the connections arriving at a database that cannot scale at all.

> **Interview**
>
> **"Tell me about a production incident."** The structure that lands is impact, mitigation, cause, prevention — in that order, with timings. Say what users experienced and for how long, what you did to stop it and why that was the fastest reversal available, what the underlying cause turned out to be, and which specific change came out of the postmortem. Naming a mistake of your own is a strength here, provided the sentence ends in a systemic fix rather than a promise to be more careful.

<a id="13-security"></a>

### 13. Security in the Pipeline

- **Dependencies** `1000s, unread`
- **Build runner** `holds every secret`
- **Deploy by** `digest, signed`
- **SBOM** `answers "are we affected?"`

Most security effort goes into reviewing code that the team wrote, and most realistic compromises arrive through the parts nobody reviews: a transitive dependency six levels deep, a base image that has not been rebuilt in a year, a build runner that executes arbitrary code from pull requests while holding production credentials, a registry tag that someone moved. The supply chain is every hand-off between a dependency and a running process, and each hand-off is a place where what you intended to ship can quietly become something else.

> **Analogy** 📦
>
> **Picture it — a food supply chain**
>
> A restaurant inspects its kitchen carefully and buys ingredients from twenty suppliers, each of whom buys from a hundred others. Nobody can taste every tomato. What actually works is structural: sealed packaging so tampering is visible, a certificate of origin for each delivery, a list of exactly which batch went into which dish, and a rule that unlabelled deliveries are refused at the door. That is signing, provenance, an SBOM and an admission policy — and note that not one of them requires reading the source of your dependencies, which is fortunate, because nobody can.

> **Interactive animation:** `supply-chain` — rendered by the page script in the HTML version.

- **Strength — a few structural controls beat unlimited vigilance** An SBOM turns "are we affected by this CVE?" from a week of archaeology into a query. Signing plus an admission policy means an unsigned image simply cannot run — no human judgement required at the moment it matters.
- **Weakness — scanners produce more findings than anyone can action** A typical image reports hundreds of vulnerabilities, most unreachable from your code. Blocking on all of them stops delivery and trains people to add exceptions; blocking on none of them makes the scan decorative. Gate on severity *and* reachability, and set a policy for the rest.

**Interview question**

*A critical vulnerability is announced in a widely-used library. Your manager asks whether you are affected. How long does that take you to answer, and what determines it?*

The answer time is a direct measure of how much supply-chain work you have already done, so I would answer in those terms. If every build publishes an SBOM to a queryable store, it is a single query across every image you run — minutes, including transitive dependencies you never chose. If not, it is a scan of every repository, which misses anything vendored, anything in a base image and anything pulled at build time, so the answer arrives in days and is not trustworthy. The second question is the one people forget: being affected is not the same as being exploitable. You need to know whether the vulnerable code path is reachable from your application, whether the input can come from outside, and whether some other control already blocks it — because that is what decides between an emergency deploy tonight and a patch in the next routine release. Then the remediation: bump the dependency, rebuild, and here the earlier discipline pays again, since a pipeline that can ship a patched image in under an hour is what turns this from a crisis into a task. Afterwards, the honest follow-up is to reduce surface — fewer dependencies, smaller base images, distroless where you can — because the next announcement is already scheduled.

**SBOM, scan, sign, and refuse the rest**

```bash
# 1. Know what is in it. Generate an SBOM at build time and keep it.
syft "ghcr.io/acme/api@$DIGEST" -o spdx-json > sbom.json

# 2. Are we affected? Query the SBOM, not the source tree.
grype sbom:sbom.json --fail-on critical

# Across the estate, once every image has an SBOM:
for img in $(kubectl get pods -A -o jsonpath='{..imageID}' | tr ' ' '\n' | sort -u); do
  grype "sbom:sboms/$(basename "$img").json" -o json \
    | jq -r --arg i "$img" '.matches[]
        | select(.vulnerability.id == "CVE-2026-1234") | $i'
done

# 3. Prove where it came from - keyless signing, no key to manage or leak.
cosign sign --yes "ghcr.io/acme/api@$DIGEST"
cosign attest --yes --predicate sbom.json --type spdxjson \
  "ghcr.io/acme/api@$DIGEST"

# 4. Verify before deploy; the cluster policy enforces the same thing.
cosign verify "ghcr.io/acme/api@$DIGEST" \
  --certificate-identity-regexp '^https://github.com/acme/api/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

```yaml
# Admission policy: unsigned or unpinned images are rejected by the cluster,
# so the control does not depend on anyone remembering to run a check.
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: supply-chain
spec:
  validationFailureAction: Enforce
  rules:
    - name: images-must-be-signed
      match:
        any: [{ resources: { kinds: [Pod] } }]
      verifyImages:
        - imageReferences: ["ghcr.io/acme/*"]
          attestors:
            - entries:
                - keyless:
                    subject: "https://github.com/acme/*"
                    issuer: "https://token.actions.githubusercontent.com"

    - name: no-mutable-tags
      match:
        any: [{ resources: { kinds: [Pod] } }]
      validate:
        message: "Images must be referenced by digest, not by tag."
        pattern:
          spec:
            containers:
              - image: "*@sha256:*"
```

> **Key idea**
>
> **The build runner is the highest-value target you own.** It holds registry credentials, signing material and often cloud access, and by design it executes code from the repository. The controls that matter are unglamorous: least-privilege job permissions, short-lived OIDC credentials instead of static keys, no privileged workflows triggered by pull requests from forks, pinned third-party actions by commit SHA rather than by tag, and ephemeral runners that do not carry state between jobs.

> **Tip**
>
> Shift left, but do not shift the *blocking* left indiscriminately. Fast, precise checks — secret scanning, dependency policy, IaC misconfiguration — belong on the pull request where the context is fresh. Slow or noisy ones belong on a schedule with triage, because a security gate that fails a third of pull requests for reasons the author cannot act on will be routed around within a month.

<a id="14-one-page"></a>

### 14. The Whole Thing on One Page

Everything above is one loop and four rules. Here is the whole course compressed to the point where you could reconstruct it.

```text
commit ─▶ CI gates ─▶ ONE artifact ─▶ promote ─▶ release ─▶ observe
  │       cheap first    (digest)     dev→stage   flag,     metrics,
  │                                   →prod      canary    traces,
  │                                                        logs
  │                                                         │
  └────────── what production taught you ◀─────────────────┘

declare desired state ─▶ controller diffs ─▶ acts ─▶ repeat
   (Terraform / Kubernetes / Argo CD are the same shape)
```

- **Small batches** Merge daily, deploy small, keep the blast radius equal to one change. Every DORA metric improves as batch size falls, and none of them improve by working faster.
- **Declare and reconcile** Write the state you want; let a loop close the gap. Terraform, Kubernetes and GitOps are three instances of one pattern, and drift is what happens when a second source of truth is allowed to exist.
- **Immutable artifact, injected config** Build once, promote the same digest, change only the environment. This is what makes "it passed staging" a statement about the same program.
- **Reversibility over prevention** You cannot prevent every bad change; you can make undoing one boring. Flags, digests, rollbacks and additive migrations all buy the same thing.
- **The traps** Mutable tags. Secrets in images. Liveness probes that check a database. Long-lived branches. Migrations that rename. Alerts on causes. Flaky tests. Every one of them looks harmless the day it is introduced.
- **The limits** None of this tells you what to build, and none of it survives an organisation that measures development on change and operations on stability. DevOps is a structural argument first and a toolchain second.

A useful way to check your own understanding: for each row below, say what the tool is *reconciling* and what the failure looks like when it cannot.

| Layer | Desired state | Reconciler | What drift looks like |
| --- | --- | --- | --- |
| Cloud resources | Terraform / CloudFormation files | `plan` then `apply` | A console edit that the next plan proposes to undo |
| Workloads | Deployment `spec` | Kubernetes controllers | `status` never reaches `spec`; read the events |
| Delivery | Manifests in Git | Argo CD / Flux | The agent reports `OutOfSync` and reverts your change |
| Capacity | Target utilisation | HPA / cluster autoscaler | Scaling lags the spike by ~90 seconds |
| Reliability | The SLO | The team, via the error budget | Budget exhausted and nothing changes about what you work on |

> **Key idea**
>
> **If you remember one sentence, make it this one:** the goal is not to prevent failure, it is to make failure small, visible and quickly reversible — and every practice in this course is a way of buying one of those three properties.

<a id="where-next"></a>

### Where to go next

1. [The DevOps detailed course](devops-detailed-course.html) — the same ground in forty numbered sections, from cgroups and Dockerfile internals through Kubernetes networking, Terraform state, pipeline design, OpenTelemetry and platform engineering, with full implementations rather than the idiomatic form only.
2. [All DevOps courses](../devops-courses.html) — the catalogue page for this topic.
3. [The Operating Systems crash course](../../os/os-crash-course.html) — containers are a kernel feature, and namespaces, cgroups, signals and the page cache are far easier to reason about once you have seen them from the OS side.
4. [The Networking crash course](../../networking/networking-crash-course.html) — Services, Ingress, TLS termination and load balancing all make more sense after encapsulation, NAT and TCP.
5. *Accelerate* (Forsgren, Humble, Kim) for the research behind the four metrics, and Google's *Site Reliability Engineering* book — free online — for SLOs, error budgets and incident practice in far more depth than any single page can carry.

---

TechToday Study Library — DevOps
