<!--
Source: kubernetes-crash-course.html
Title: Kubernetes Crash Course for Developers | TechToday
Description: A developer-centric Kubernetes crash course — the reconciliation loop, Pods and Deployments, rollouts, readiness and liveness probes, requests and limits, ConfigMaps and Secrets, Services, DNS and Ingress, the kubectl commands you actually need, debugging CrashLoopBackOff and 502s, storage, and scaling.
Theme-color: #0b0d10
Stylesheets: kubernetes-study.css, ../../../site-header.css
Scripts: kubernetes-study.js
-->

Navigation: [TechToday](../../../index.html) · [← DevOps Courses](../devops-courses.html)

<a id="kubernetes-crash-course"></a>

# Kubernetes

Kubernetes has hundreds of resource types and, as an application developer, you will write about six of them. This course covers those six properly and ignores the rest. You will not be asked to install a cluster, choose a CNI plugin or plan an upgrade — you will learn how to get your container running, keep it reachable, stop it being killed, and work out what happened when it is not doing any of those. Every mechanism worth seeing is an animation: press **Play**, then step through it with the arrows. Code appears as YAML, shell and Python, and the tabs remember your choice.

> **Key idea**
>
> Three ideas carry almost all of Kubernetes. **You declare, a loop reconciles** — nothing you write is a command, it is a record of the state you want, and controllers spend their lives closing the gap. **Pods are cattle** — they are never repaired, only replaced, so your application must tolerate being deleted at any instant. And **readiness is the contract** — almost every "the deploy broke it" story is a missing or wrong probe. Hold those three and the YAML stops being arbitrary.

> **Tip**
>
> This course assumes you already know what a container is. If images, layers, ports and volumes are not yet second nature, read the [Docker crash course](../docker/docker-crash-course.html) first — it is the direct prerequisite, and most "Kubernetes problems" in a first month are really container problems.

<a id="table-of-contents"></a>

## Table of Contents

1. [What Kubernetes Is For — and the One Idea Behind It](#1-what-it-is-for)
2. [Pods — the Thing That Actually Runs](#2-pods)
3. [Deployments & Rollouts](#3-deployments)
4. [Probes — Ready, Alive, Starting](#4-probes)
5. [Resources — Requests, Limits & Exit Code 137](#5-resources)
6. [Config & Secrets](#6-config)
7. [Services, DNS & Endpoints](#7-services)
8. [Ingress — Getting Traffic In](#8-ingress)
9. [Microservices — Many Services, One Cluster](#9-microservices)
10. [kubectl — The Commands You Actually Need](#10-kubectl)
11. [Debugging — Pending, CrashLoop, 502](#11-debugging)
12. [State & Storage (and Why You Probably Do Not Want It)](#12-storage)
13. [Scaling & What It Costs](#13-scaling)
14. [Shipping Safely — Rollbacks, Budgets & What You Own](#14-shipping)
15. [The Whole Thing on One Page](#15-one-page)

<a id="unit-1"></a>

## Unit 1 — The Model

One idea and two objects. Once you can predict what a controller will do, the rest of the API stops being a hundred unrelated things to memorise.

<a id="1-what-it-is-for"></a>

### 1. What Kubernetes Is For — and the One Idea Behind It

- **Model** `declarative`
- **You write** `desired state`
- **It reports** `actual state`
- **Debugging** `spec vs status`

Docker runs a container on *a* machine. Kubernetes answers the questions that appear the moment you have several machines and more than one copy of your service: which machine should this run on, what happens when that machine dies, how do callers find it when its address keeps changing, how do I replace version 1 with version 2 without dropping requests, and how do I run twenty services without twenty bespoke deployment scripts.

It answers all of them with a single mechanism. You write down the state you want and store it in the API server. A **controller** watches that record, compares it with what actually exists, and takes the smallest action that reduces the difference — then does it again, forever. Nothing in Kubernetes is a command; there is no "start this container" instruction anywhere in the system.

> **Analogy** 🌡️
>
> **Picture it — a thermostat, not a light switch**
>
> A light switch is imperative: you say "on", and if someone turns it off, it stays off. A thermostat is declarative: you say "twenty degrees", and it spends the rest of its life measuring, comparing and nudging. Open a window and it does not complain — it works harder. You cannot tell a thermostat to "turn the heating on for ten minutes"; the only vocabulary it has is the temperature you want. That constraint is why it keeps working while you are asleep, and it is exactly why a change you make with `kubectl edit` during an incident quietly disappears.

> **Interactive animation:** `k8s-reconcile` — rendered by the page script in the HTML version.

This single idea has a practical payoff that is worth stating early: **every object you will ever debug has the same shape.** A `spec` section describing what you asked for, a `status` section describing what is true, and a stream of events explaining the journey between them. When something is not working, you are always comparing those three — whether the object is a Pod, a Service, an Ingress or something a third-party operator invented.

- **Strength — you stop writing deployment scripts** Rollouts, restarts, health checking, service discovery, secret distribution, scaling and node failure all have one portable vocabulary. That is a large amount of undifferentiated work to stop maintaining yourself, and it is the same in every cluster you will ever work in.
- **Weakness — the floor is high and the failure modes are indirect** The thing you changed and the thing that broke are often several controllers apart, so error messages point at symptoms. For three services with steady load it is a poor trade — Compose or a managed container platform costs far less attention.

**Interview question**

*You run `kubectl apply -f deployment.yaml` and it returns immediately. Is your application running?*

No, and the reason is the most useful thing to understand about the whole system. `apply` is a write to the API server: it authenticates you, runs admission control, validates the object and stores it in etcd, then returns. At that point exactly one thing has happened — a record of intent exists. Everything after that is asynchronous and carried out by components that are watching the API server rather than being called by it. The Deployment controller notices a Deployment with no ReplicaSet and creates one; the ReplicaSet controller notices zero Pods against three desired and creates three Pod objects; the scheduler notices Pods with no node assigned and binds each to a node; the kubelet on that node notices a Pod bound to itself and pulls the image and starts the container; the endpoints controller notices a ready Pod matching a Service and adds it. Any of those steps can fail long after your command succeeded — the image may not exist, no node may have room, the probe may never pass. That is why `kubectl apply` succeeding tells you almost nothing, and why the real command is `kubectl rollout status`, which waits for the reconciliation to converge or to give up.

**Apply is a write; convergence is separate**

```bash
kubectl apply -f deployment.yaml
# deployment.apps/api configured        <- this means "stored", not "running"

# The command that actually waits for the outcome.
kubectl rollout status deployment/api --timeout=120s
# Waiting for deployment "api" rollout to finish: 1 of 3 updated replicas...
# deployment "api" successfully rolled out

# Watch the controllers do their work, in order.
kubectl get events --sort-by=.lastTimestamp -w
# Scheduled           Successfully assigned prod/api-7d4-x9k to node-3
# Pulling             Pulling image "ghcr.io/acme/api@sha256:9f2c..."
# Created             Created container api
# Started             Started container api

# The universal debugging move: compare what you asked for with what is true.
kubectl get deployment api -o jsonpath='{.spec.replicas}{"\n"}'    # desired
kubectl get deployment api -o jsonpath='{.status.readyReplicas}{"\n"}'  # actual
kubectl get deployment api -o jsonpath='{.status.conditions}' | jq
```

```yaml
# Every object has this shape. Learn to read it once and the whole API
# becomes familiar, including resources you have never seen before.
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: prod
  labels: { app: api }

spec:                       # WHAT YOU WANT - the only part you write
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:9f2c1ab...

status:                     # WHAT IS TRUE - written by the controller,
  replicas: 3               # never edited by you
  readyReplicas: 2          # <- 2, not 3: something is not converging
  conditions:
    - type: Progressing
      status: "True"
      reason: ReplicaSetUpdated
    - type: Available
      status: "False"       # <- and this is why your Service has no traffic
      reason: MinimumReplicasUnavailable
```

> **Warning**
>
> **Never fix production with `kubectl edit`.** It works, and then it is silently undone — by the next deploy, which reapplies the manifest, or within a minute by a GitOps agent reconciling from Git. Worse, the change exists in no reviewable record, so the next person to debug the same problem finds a cluster that does not match the repository. Change the manifest and apply it; use `edit` only to look.

<a id="2-pods"></a>

### 2. Pods — the Thing That Actually Runs

- **Pod** `1+ containers, 1 IP`
- **Shared** `network + volumes`
- **Repaired** `never — replaced`
- **Running ≠ Ready** `important`

A **Pod** is the unit of scheduling: one or more containers that share a network namespace, an IPC namespace and optionally some volumes. Sharing the network namespace is what makes sidecars work — containers in a Pod reach each other on `localhost` — and it is also why two containers in one Pod cannot both bind port 8080.

Almost always you want **one application container per Pod**. The exceptions are helpers whose lifecycle is genuinely identical to the main container's: a log shipper, a service-mesh proxy, a credential refresher. If the second container could sensibly be scaled or restarted independently, it belongs in its own Pod.

> **Analogy** 🚚
>
> **Picture it — a shipping pallet, not a crate**
>
> A container is a crate. A Pod is the pallet the crate is strapped to: it is what the forklift actually moves, what gets a place in the warehouse, and what has an address. Usually a pallet carries one crate. Sometimes it carries a small second crate that must travel with the first — documentation, a temperature logger — but nobody straps two unrelated deliveries to one pallet, because then they can never go to different places or leave at different times.

> **Interactive animation:** `pod-lifecycle` — rendered by the page script in the HTML version.

- **Strength — replacement is the only repair mechanism, and that is simplifying** There is no "fix this Pod" path, so there is no half-repaired state to reason about. It also means the recovery path is exercised on every deploy rather than discovered during an incident.
- **Weakness — your application must actually tolerate that** New name, new IP, empty local disk, no warm cache, and it can happen at any moment because a node was drained for an upgrade. Anything that assumes it will keep running is going to be disappointed.

**Interview question**

*Should your web server and your database run in the same Pod?*

No, and the reasoning is a good test of whether the Pod abstraction has landed. Containers in a Pod are scheduled together, scaled together and restarted together, so putting them in one Pod asserts that those three things should always happen at the same time — which is plainly false here. Scaling the web tier to ten replicas would give you ten databases, each with its own data, and requests would see different state depending on which replica served them. A crash of either container restarts the Pod, so a web server bug would take the database down. And the database would inherit the web server's deployment cadence, being replaced every time someone ships a CSS change. The correct arrangement is a Deployment for the stateless web tier and, if the database really must run in the cluster, a StatefulSet with its own storage — or better, a managed database outside it. The general rule I would give is that two containers belong in one Pod only when it is impossible to imagine wanting to scale or restart them independently, which is true of a sidecar proxy and almost nothing else.

**One app container, plus a sidecar only when it is genuinely tied**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: api
  labels: { app: api }
spec:
  # initContainers run to completion, in order, BEFORE the app starts.
  # This is where "wait for the database" or "run migrations" belongs.
  initContainers:
    - name: wait-for-db
      image: busybox:1.36
      command: ["sh", "-c", "until nc -z db 5432; do sleep 1; done"]

  containers:
    - name: api                       # the application
      image: ghcr.io/acme/api@sha256:9f2c...
      ports: [{ containerPort: 8080 }]
      volumeMounts:
        - { name: shared, mountPath: /var/log/app }

    - name: log-shipper               # a legitimate sidecar: same lifecycle,
      image: fluent/fluent-bit:3.0    # meaningless on its own, cannot be
      volumeMounts:                   # scaled independently
        - { name: shared, mountPath: /var/log/app, readOnly: true }

  volumes:
    - name: shared
      emptyDir: {}                    # shared between containers in THIS pod,
                                      # and deleted with the pod
```

```bash
# Containers in a pod share a network namespace - prove it.
kubectl exec api -c log-shipper -- wget -qO- http://localhost:8080/readyz
# the sidecar reaches the app on localhost; nothing is published

# One IP for the whole pod, and it changes on every replacement.
kubectl get pods -o custom-columns=NAME:.metadata.name,IP:.status.podIP,NODE:.spec.nodeName

# Watch a pod be replaced rather than repaired.
kubectl delete pod api-7d4-x9k
kubectl get pods -w
# api-7d4-x9k   1/1  Terminating   ...
# api-7d4-t3c   0/1  Pending       <- a NEW pod: new name, new IP
# api-7d4-t3c   0/1  ContainerCreating
# api-7d4-t3c   1/1  Running

# Which container in the pod do you want? Everything takes -c.
kubectl logs api -c log-shipper --tail=20
kubectl exec -it api -c api -- sh
```

> **Key idea**
>
> **`Running` and `Ready` are different, and the difference causes real outages.** `Running` means the container process started. `Ready` means a readiness probe said it can serve, which is what puts it into a Service's endpoint list. `kubectl get pods` shows both — the `READY` column is `0/1` or `1/1`, and it is the one that decides whether users reach you.

<a id="3-deployments"></a>

### 3. Deployments & Rollouts

- **Deployment** `→ ReplicaSet → Pods`
- **Template change** `= new ReplicaSet`
- **Rollback** `scale the old one back up`
- **Gate** `readiness`

You rarely create Pods directly. A **Deployment** owns a **ReplicaSet**, which owns the Pods, and that two-level structure is exactly what makes rollouts and rollbacks work. Changing anything in the Pod template creates a *new* ReplicaSet; the Deployment controller then scales the new one up and the old one down, keeping the old one at zero replicas rather than deleting it.

That last detail is why `kubectl rollout undo` is fast: the previous ReplicaSet already exists, its images are already on the nodes, and rolling back is just scaling it in the other direction. No rebuild, no registry pull, no pipeline run.

> **Interactive animation:** `rollout` — rendered by the page script in the HTML version.

| Object | Use for | Key property |
| --- | --- | --- |
| **Deployment** | Stateless services — almost everything you write | Interchangeable Pods, rolling updates, one-command rollback |
| **StatefulSet** | Databases, brokers — anything with a peer identity | Stable names `api-0`, `api-1`; a PVC each |
| **DaemonSet** | Node agents — log shippers, metrics exporters | Exactly one Pod per node, following the cluster as it scales |
| **Job** | Migrations, one-off batch work | Runs to completion; retries up to `backoffLimit` |
| **CronJob** | Scheduled reports, cleanup | Creates Jobs on a schedule; has a concurrency policy |

**Interview question**

*Your rollout is stuck. `kubectl rollout status` has been waiting for ten minutes. How do you find out why?*

A stuck rollout always means new Pods are not becoming *available*, and there are only a few reasons for that, so I would narrow it in three steps. First, the Deployment's conditions: `ProgressDeadlineExceeded` tells me the new Pods never became ready, while `ReplicaFailure` tells me the Pods could not even be created — a resource quota, an RBAC problem, or an admission policy rejecting them. Those are quite different investigations, so it is worth knowing which one before going further. Second, if Pods exist, I look at them: `Pending` means the scheduler cannot place them and the events say exactly why; `ImagePullBackOff` means the digest or the pull secret is wrong; `CrashLoopBackOff` means my process is exiting and `logs --previous` will show the traceback; and `Running` with `0/1 READY` means the readiness probe is failing, with `describe` showing the probe's own error. Third — the configuration mistake worth ruling out early — if `maxSurge` and `maxUnavailable` are both zero, the rollout is deadlocked by definition: nothing may be added and nothing removed. While I investigate I would `kubectl rollout pause` so the controller stops churning Pods, and if the cause is not obvious within a couple of minutes I would `rollout undo` and diagnose with the old version serving.

**Diagnose, pause, then decide**

```bash
# 1. What does the Deployment itself say?
kubectl get deployment api -o jsonpath='{.status.conditions}' | jq
#   ProgressDeadlineExceeded -> new pods never became ready
#   ReplicaFailure           -> pods could not be created at all

# 2. Which ReplicaSet is stuck, and what are its pods doing?
kubectl get rs -l app=api \
  -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,READY:.status.readyReplicas
kubectl get pods -l app=api
kubectl describe pod  | sed -n '/Events/,$p'

# 3. Stop the churn while you look.
kubectl rollout pause deployment/api
kubectl logs -l app=api --tail=50 --prefix
kubectl rollout resume deployment/api

# 4. Or reverse it and diagnose calmly.
kubectl rollout history deployment/api
kubectl rollout undo deployment/api                  # previous revision
kubectl rollout undo deployment/api --to-revision=7  # a specific one
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 4
  revisionHistoryLimit: 5         # how many ReplicaSets to keep for rollback
  minReadySeconds: 10             # "ready" must HOLD for 10s before counting,
                                  # which catches a pod that is ready then
                                  # immediately crashes
  progressDeadlineSeconds: 600    # after this the rollout is marked Failed
                                  # rather than waiting forever
  selector:
    matchLabels: { app: api }     # IMMUTABLE after creation - choose carefully
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                 # one extra pod allowed during the rollout
      maxUnavailable: 0           # never drop below 4 ready pods
                                  # NEVER set both of these to 0: deadlock
  template:
    metadata:
      labels: { app: api }
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:9f2c1ab...
          readinessProbe:         # without this, the rollout has no gate
            httpGet: { path: /readyz, port: 8080 }
            periodSeconds: 5
```

> **Warning**
>
> **Both versions of your code are live for the whole rollout.** That is not an edge case, it is the normal state of every rolling update. Your v2 must therefore work with v1's database schema, v1's cache entries and v1's message formats — and after a rollback, v1 must work with whatever v2 left behind. Keep schema changes additive and backward-compatible, or the deployment is reversible and the data is not.

<a id="unit-2"></a>

## Unit 2 — Making It Behave

Three sections that account for most of the incidents a developer causes in their first year: probes, resources, and configuration that does not take effect.

<a id="4-probes"></a>

### 4. Probes — Ready, Alive, Starting

- **readiness** `gates traffic`
- **liveness** `kills the container`
- **startup** `buys boot time`
- **Missing readiness** `502s on deploy`

Probes are the only way your application can tell Kubernetes anything about itself, and getting them wrong causes more developer-visible outages than any other single setting. The three answer three different questions, and the consequences of a failure are completely different in each case.

> **Analogy** 📞
>
> **Picture it — a call centre**
>
> **Readiness** is an agent setting themselves to "not available": calls stop being routed to them, they stay employed, and they flip back when they are free. **Liveness** is the supervisor deciding someone is unresponsive and sending them home to be replaced — occasionally necessary, expensive, and disastrous if the criterion is wrong. **Startup** is the grace given to a new hire on their first morning, before either of the other judgements applies. Now notice the failure mode: if "available" is defined as "can reach the central database", then when the database is slow, *every* agent is sent home at once.

> **Interactive animation:** `probes` — rendered by the page script in the HTML version.

- **Strength — readiness makes zero-downtime deploys automatic** The rollout waits for each new Pod to say it can serve before removing an old one, and a temporarily overloaded Pod removes itself from rotation and comes back on its own. You get both for four lines of YAML.
- **Weakness — a bad liveness probe amplifies failures** Any check shared by every replica turns a degraded dependency into a total outage plus a thundering herd of reconnections. Liveness is the one setting where the conservative choice is almost always correct.

**Interview question**

*Your service depends on a database. Should the health endpoint check the database connection?*

It depends entirely on which probe is calling it, and answering "which one?" is the whole point of the question. For **liveness**, absolutely not. Liveness asks whether this process is irrecoverably broken, and a slow database does not make my process broken — but if the check fails, Kubernetes kills the container. Since every replica shares the same database, a bad thirty seconds from the database would restart every replica of my service simultaneously, turning a degradation into a full outage and then hitting the recovering database with a thundering herd of new connections. For **readiness** it is defensible, because failing readiness only removes the Pod from the Service and it rejoins automatically. But even there I would think twice: if the database is down, removing every Pod from every endpoint list means even the requests that do not touch the database now fail, and you have traded partial degradation for total unavailability. My default is a liveness probe that returns 200 unconditionally, a readiness probe that reflects only local state — have I finished starting, am I draining, is my connection pool exhausted — and dependency health surfaced through metrics and alerts rather than through a mechanism that deletes things.

**Three probes, and the endpoints behind them**

```yaml
containers:
  - name: api
    # Should I receive traffic right now? Local state only.
    readinessProbe:
      httpGet: { path: /readyz, port: 8080 }
      periodSeconds: 5
      timeoutSeconds: 2
      failureThreshold: 2        # react quickly - the cost is just no traffic
      successThreshold: 1

    # Is this process irrecoverably broken? Be very reluctant to say yes.
    livenessProbe:
      httpGet: { path: /livez, port: 8080 }
      periodSeconds: 15
      timeoutSeconds: 3
      failureThreshold: 6        # 90 seconds of failure before killing it
                                 # - a restart is expensive and rarely the fix

    # Slow boot? Use this rather than a long initialDelaySeconds on liveness:
    # while it runs, the other two probes are disabled entirely.
    startupProbe:
      httpGet: { path: /livez, port: 8080 }
      periodSeconds: 2
      failureThreshold: 60       # up to 120 s to start, then liveness begins

    lifecycle:
      preStop:
        exec:
          # Endpoint removal and SIGTERM race. Sleep so in-flight requests
          # that were already routed here can finish arriving.
          command: ["sh", "-c", "sleep 5"]
```

```python
"""/readyz and /livez must answer different questions."""
import threading

started = threading.Event()
draining = threading.Event()

def on_startup():
    db.connect()               # do the slow work explicitly...
    cache.warm()
    started.set()              # ...and only then admit traffic

def readyz():
    """Should I receive requests right now?

    Local state only. Adding `db.ping()` here means that when the database
    has a bad minute, every replica leaves the load balancer at once and
    even requests that never touch the database start failing.
    """
    if draining.is_set():
        return 503, "draining"
    if not started.is_set():
        return 503, "starting"
    if db_pool.exhausted():    # local, per-pod, recovers on its own
        return 503, "pool exhausted"
    return 200, "ok"

def livez():
    """Is this process irrecoverably broken?

    For almost every service the honest answer is a flat 200. Only return
    503 for a condition a RESTART would actually fix - a detected deadlock,
    a corrupted in-memory state machine.
    """
    return 200, "ok"
```

> **Key idea**
>
> **If you add one thing to your manifests, make it a readiness probe.** Without it Kubernetes treats *Running* as *Ready*, so a rollout removes old Pods in exchange for new ones that are not listening yet — and the rollout reports success while your users get 502s. Point it at an endpoint that reflects your actual ability to serve, not at a static `/ping` that returns 200 before anything is connected.

<a id="5-resources"></a>

### 5. Resources — Requests, Limits & Exit Code 137

- **requests** `scheduling`
- **limits** `enforcement`
- **CPU over limit** `throttled`
- **Memory over limit** `killed`

Two fields, two completely different jobs, and treating them as one knob causes both of the most common resource problems. **`requests`** is what the scheduler subtracts from a node's capacity when deciding whether your Pod fits — it is a reservation, and it is compared against other Pods' reservations rather than against real usage. **`limits`** is the ceiling the kernel enforces at run time.

The asymmetry between the two resources is the thing to internalise. Exceeding your CPU limit gets you *throttled*: slow, survivable, and visible only as unexplained latency. Exceeding your memory limit gets you *killed* instantly, with exit code 137 and no stack trace, because `SIGKILL` cannot be caught.

> **Interactive animation:** `resources-qos` — rendered by the page script in the HTML version.

- **Strength — honest requests make the cluster predictable** The scheduler can pack nodes safely, noisy neighbours are bounded, and capacity planning becomes arithmetic instead of guesswork.
- **Weakness — the numbers are almost always copied rather than measured** Requests set far above real usage waste most of a cluster while Pods sit `Pending`; set far below, everything is evicted the first time a node is under pressure. Both come from pasting values out of another service's manifest.

**Interview question**

*Your Pod restarts every few hours with exit code 137 and no logs. Then someone doubles the memory limit and it still happens, just less often. What is going on?*

137 is 128 + 9, so the container received `SIGKILL`, and in a container context that is essentially always the cgroup memory limit being enforced by the kernel's OOM killer. There is no traceback precisely because `SIGKILL` cannot be caught — the process gets no chance to log anything, which is why this failure feels so mysterious the first time. I would confirm it rather than assume, by reading `lastState.terminated.reason` on the Pod, which will say `OOMKilled`. The interesting part is the second half of the question: doubling the limit changing the *frequency* but not the *outcome* is the signature of a leak rather than of under-provisioning. If the working set were simply larger than the limit, the Pod would die at a consistent point after start-up, and a correct limit would fix it permanently. Growing until it hits whatever ceiling exists means memory is being retained — an unbounded cache, an accumulating list, connections that are never closed. So I would look at the memory graph for the shape: a sawtooth that climbs to the limit each time is a leak, and the fix is in the application. Two secondary things worth checking: whether the runtime is cgroup-aware, since an older JVM or Node process sizes its heap from the *host's* memory and will happily exceed a much smaller container limit; and whether the request and the limit are equal, because a Pod with a request well below its limit is `Burstable` and can also be evicted when the node is under pressure, which looks similar and is not the same thing.

**Confirm the kill, then size it from data**

```bash
# Confirm, do not guess. This is the container that DIED.
kubectl get pod api-7d4-x9k \
  -o jsonpath='{.status.containerStatuses[0].lastState.terminated}' | jq
# { "exitCode": 137, "reason": "OOMKilled",
#   "startedAt": "...T08:14:02Z", "finishedAt": "...T08:41:37Z" }

# 27 minutes from start to kill, every time -> a leak, not a small limit.
kubectl get pod api-7d4-x9k -o jsonpath='{.status.containerStatuses[0].restartCount}'

# What is it using now, against what it asked for?
kubectl top pod -l app=api --containers
kubectl get pod api-7d4-x9k -o jsonpath='{.spec.containers[0].resources}' | jq

# Is CPU being throttled? This is the invisible latency cause.
kubectl exec api-7d4-x9k -- cat /sys/fs/cgroup/cpu.stat
# nr_periods 21400
# nr_throttled 4820        <- 22% of periods hit the ceiling

# Right-size from a week of data rather than from another team's manifest:
#   quantile_over_time(0.95,
#     container_memory_working_set_bytes{pod=~"api-.*"}[7d])
```

```yaml
resources:
  requests:
    cpu: "250m"          # observed p50; this is the SCHEDULING reservation
    memory: "512Mi"      # observed p95 plus headroom
  limits:
    memory: "512Mi"      # equal to the request => Guaranteed QoS, and this
                         # pod is the LAST to be evicted under node pressure
    # No CPU limit. Deliberate: the request already guarantees a share, and
    # a limit only adds throttling when there is idle CPU sitting next to
    # you. Set one for batch work or hard multi-tenancy, not for a
    # latency-sensitive API.

# Tell the runtime the truth about its ceiling, or it will size its heap
# from the HOST's memory and be OOM-killed at "100% healthy" usage.
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=384"     # below the 512Mi limit
  # Modern JVMs read the cgroup themselves:
  # - name: JAVA_TOOL_OPTIONS
  #   value: "-XX:MaxRAMPercentage=75"
```

> **Warning**
>
> **A Pod with no resources set at all is `BestEffort`, and it is evicted first.** Many people read "no limits" as "unlimited"; the kubelet reads it as "nothing was promised to this Pod", so when a node runs short of memory, yours is the first one thrown overboard. Setting requests is not bureaucracy — it is how you avoid being at the front of that queue.

<a id="6-config"></a>

### 6. Config & Secrets

- **ConfigMap** `non-sensitive`
- **Secret** `base64, not encrypted`
- **As env** `never updates`
- **As volume** `updates, app must re-read`

The same rule as containers generally: the image is identical everywhere and everything that differs arrives at run time. In Kubernetes that means a **ConfigMap** for non-sensitive values and a **Secret** for sensitive ones — and the single most important thing to know about a Secret is that it is *base64-encoded, not encrypted*. Anyone who can `get secrets` in your namespace can read every value.

Both can be consumed as environment variables or as mounted files, and the two behave differently on update in a way that produces a lot of confusion. Environment is fixed when a process starts, so editing the ConfigMap changes nothing until the Pods are recreated. Mounted files *are* refreshed by the kubelet — but only the files; your application still has to re-read them.

> **Interactive animation:** `config-update` — rendered by the page script in the HTML version.

- **Strength — one image, every environment** The same digest runs in dev, staging and production with different ConfigMaps, which is what makes "it passed in staging" a statement about the same program rather than a hopeful analogy.
- **Weakness — an edited-but-not-rolled ConfigMap is a time bomb** Nothing changes today. Then a scale-up next week produces Pods with different configuration from their siblings, and behaviour starts depending on which replica served the request.

**Interview question**

*How do you make a config change take effect, and how do you make sure it is auditable?*

The direct answer is that a config change should be a deploy, and the way to guarantee that is to make the configuration part of the Pod template's identity. If I inject values as environment variables, editing the ConfigMap does nothing to running Pods — environment is fixed at process start — so at minimum I need `kubectl rollout restart`. But relying on someone remembering to run that is exactly how you get the time-bomb case where old and new Pods disagree. The robust pattern is to hash the config into the template: Kustomize's `configMapGenerator` appends a content hash to the ConfigMap's name, and Helm charts add a checksum annotation. Either way, changing a value changes the Pod template, which creates a new ReplicaSet, which triggers an ordinary rolling update — observable, gated by readiness, and revertible with `rollout undo`. On auditability, the same mechanism gives it to me for free if the manifests live in Git: the change is a commit with a diff, a reviewer and a timestamp, rather than an edit that exists only in the cluster. For secrets specifically I would add that a Kubernetes Secret should not be the system of record — I would keep the value in a real secret store and sync it in with an external secrets operator, so that reads are audited and rotation does not require a rebuild.

**Make a config change into a normal, revertible deploy**

```yaml
# Kustomize appends a content hash to the generated name, so editing a
# value produces api-config-8g4k2m9t7c and therefore a new pod template.
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources: [deployment.yaml, service.yaml]

configMapGenerator:
  - name: api-config
    literals:
      - LOG_LEVEL=info
      - FEATURE_NEW_PRICING=false
      - REQUEST_TIMEOUT_S=5

generatorOptions:
  disableNameSuffixHash: false     # the hash IS the mechanism - keep it
---
# And in the Deployment, consume it by name:
spec:
  template:
    spec:
      containers:
        - name: api
          envFrom:
            - configMapRef: { name: api-config }
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef: { name: api-db, key: url }
```

```bash
# A Secret is base64. Anyone with "get secrets" can read every value.
kubectl get secret api-db -o jsonpath='{.data.url}' | base64 -d

# So restrict the verb rather than trusting the encoding.
kubectl auth can-i get secrets -n prod \
  --as system:serviceaccount:prod:api

# Force a rollout when the config changed but the template did not.
# This patches an annotation with the current time - a normal deploy.
kubectl rollout restart deployment/api
kubectl rollout status deployment/api

# Which pods are running which config? The time-bomb check.
kubectl get pods -l app=api \
  -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].envFrom[0].configMapRef.name}{"\n"}{end}' \
  | sort -k2 | uniq -f1 -c
# more than one config name = your replicas disagree
```

> **Warning**
>
> **Do not put a secret in a ConfigMap, and do not treat a Secret as encryption.** Secrets are stored in etcd, base64-encoded, and are only as protected as your RBAC and your etcd encryption settings. For anything genuinely sensitive, keep the value in an external store and sync it in with an operator or a CSI driver — then reads are audited, rotation is minutes rather than a redeploy, and the value is never a durable object you have to remember to protect.

<a id="unit-3"></a>

## Unit 3 — Being Reachable

Pod IPs change constantly, so something has to stand between your callers and that churn. A Service handles it inside the cluster and an Ingress handles the outside world — and once several services are calling each other, a third problem appears that neither of them solves.

<a id="7-services"></a>

### 7. Services, DNS & Endpoints

- **Service** `stable name + IP`
- **Join** `label selector`
- **Members** `only Ready Pods`
- **DNS** `svc.ns.svc.cluster.local`

A **Service** gives a set of Pods a name and a virtual IP that never change. There is no process behind that IP — it exists only as routing rules programmed into every node's kernel, which is why you cannot ping it and why `tcpdump` on it shows nothing. Membership comes from a **label selector**, and an **endpoints** list, maintained by yet another controller, tracks which of the matching Pods are currently *Ready*.

That indirection is the whole point: you can replace every Pod behind a Service without the Service or its callers noticing, because nothing anywhere refers to a Pod IP.

> **Analogy** 📮
>
> **Picture it — a department, not a desk**
>
> You do not address a letter to "the third desk on the left"; you address it to "Accounts Payable". People join and leave that department constantly, and the post room maintains the list of who is currently in it and currently at work. Someone off sick is temporarily off the list and the post goes to their colleagues — that is exactly the readiness probe. And the reason it works is that the name refers to a *role*, matched by a label, rather than to a person.

> **Interactive animation:** `k8s-networking` — rendered by the page script in the HTML version.

| Type | Reachable from | Use for |
| --- | --- | --- |
| `ClusterIP` (default) | Inside the cluster only | Service-to-service calls — almost everything |
| `NodePort` | Any node's IP on a high port | Local clusters and quick tests |
| `LoadBalancer` | The internet | One per *cluster* edge, not one per service |
| `ExternalName` | Inside the cluster | A CNAME to something outside; no proxying |
| Headless (`clusterIP: None`) | Inside the cluster | DNS returns every Pod IP — StatefulSets, client-side balancing |

**Interview question**

*Your Service returns "connection refused" but all the Pods are `Running`. Where do you look?*

Almost certainly the endpoint list is empty, and there are exactly three reasons for that, so I would check them in order with one command each. First, `kubectl get endpointslice -l kubernetes.io/service-name=api`: if it lists no addresses, the Service has nothing behind it and every request will be refused immediately rather than timing out — which is itself a useful signal, because a timeout usually means a network policy and a refusal usually means no backend. Second, if there are no endpoints, the question is why: either the label selector does not match the Pods, which I compare directly between `kubectl describe svc` and `kubectl get pods --show-labels`, or the Pods match but are not *Ready*, which the `READY` column shows as `0/1`. Note that the second is far more common and it points straight back at the readiness probe. Third, if endpoints do exist, then the wiring is fine and the mismatch is on ports: `targetPort` must be the port the container actually listens on, and a Service happily accepts a `targetPort` that nothing is bound to. The fourth thing, if all of that checks out, is whether the application is bound to `127.0.0.1` inside its container rather than `0.0.0.0` — in which case the port is genuinely open and reachable by nobody.

**Four checks, in order**

```bash
# 1. Does the Service have any backends at all?
kubectl get endpointslice -l kubernetes.io/service-name=api -o wide
# ADDRESSES       <- the cause is one of the next two checks

# 2a. Does the selector match?
kubectl describe svc api | grep -i selector      # app=api
kubectl get pods --show-labels                   # app=api-server  <- typo

# 2b. Are the pods Ready? (Matching but not Ready = no endpoint.)
kubectl get pods -l app=api
# NAME           READY   STATUS
# api-7d4-x9k    0/1     Running     <- readiness probe is failing

# 3. Ports: targetPort must be what the container actually listens on.
kubectl get svc api -o jsonpath='{.spec.ports}' | jq
kubectl get pod api-7d4-x9k -o jsonpath='{.spec.containers[0].ports}' | jq

# 4. Is the app bound to 0.0.0.0 rather than 127.0.0.1 inside the container?
kubectl exec api-7d4-x9k -- ss -tlnp
# LISTEN 127.0.0.1:8080   <- open, and reachable by nobody

# Test the whole path from inside the cluster.
kubectl run tmp --rm -it --image=nicolaka/netshoot -- \
  curl -sv http://api.prod.svc.cluster.local/readyz
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: api              # MUST match the pod template's labels exactly
  ports:
    - name: http
      port: 80            # the port the Service is reached on
      targetPort: 8080    # the port the CONTAINER listens on
      protocol: TCP
---
# DNS names this creates, and the search path that makes short names work:
#   api                            (same namespace)
#   api.prod                       (from another namespace)
#   api.prod.svc.cluster.local     (fully qualified - use this in configs)
#
# A headless Service for a StatefulSet returns every pod's IP instead of
# one virtual IP, and gives each pod its own DNS name:
#   db-0.db.prod.svc.cluster.local
#   db-1.db.prod.svc.cluster.local
```

> **Key idea**
>
> **Three checks resolve almost every "the Service is broken" ticket, in this order:** does the label selector match the Pods, are the Pods *Ready*, and is `targetPort` the port the container really listens on. `kubectl get endpointslice` answers the first two in one command. Suspect DNS, the CNI or the load balancer only after all three pass.

<a id="8-ingress"></a>

### 8. Ingress — Getting Traffic In

- **Ingress** `host + path rules`
- **Controller** `the actual proxy`
- **TLS** `terminates here`
- **One LB** `many services`

A Service of type `LoadBalancer` provisions a cloud load balancer, and one per application gets expensive and unmanageable quickly. An **Ingress** is a set of host and path rules; an **ingress controller** — NGINX, Traefik, Envoy — is a real proxy running in the cluster that reads those rules and configures itself. One cloud load balancer points at the controller, and the controller fans out to every service. That is the entire economic argument.

Two other things happen at this boundary and are worth knowing where to look for. **TLS terminates** here, with the certificate stored as a Secret — typically issued and renewed automatically by cert-manager. And most edge concerns are configured here rather than in your application: request size limits, timeouts, rate limiting, redirects and CORS.

**Routing, TLS and the newer Gateway API**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: acme
  namespace: prod
  annotations:
    # cert-manager watches this and issues + renews the certificate into
    # the Secret named below. Nobody has to remember an expiry date.
    cert-manager.io/cluster-issuer: letsencrypt
    # Most edge behaviour is controller-specific and lives in annotations.
    nginx.ingress.kubernetes.io/proxy-body-size: 10m
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
spec:
  ingressClassName: nginx
  tls:
    - hosts: [api.acme.dev]
      secretName: acme-tls        # created and rotated by cert-manager
  rules:
    - host: api.acme.dev
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service: { name: orders, port: { number: 80 } }
          - path: /users
            pathType: Prefix
            backend:
              service: { name: users, port: { number: 80 } }
---
# The Gateway API is the newer, portable replacement. It splits the
# infrastructure owner's concern (Gateway) from the app team's (Route),
# so routing stops being a pile of vendor annotations.
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: orders, namespace: prod }
spec:
  parentRefs: [{ name: acme-gateway, namespace: infra }]
  hostnames: ["api.acme.dev"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: /orders } }]
      backendRefs: [{ name: orders, port: 80 }]
```

```bash
# Work inwards. Each step rules out one layer.

# 1. Does DNS point at the load balancer the controller owns?
dig +short api.acme.dev
kubectl get svc -n ingress-nginx ingress-nginx-controller

# 2. Did the Ingress get an address, and did the rules parse?
kubectl get ingress -n prod
kubectl describe ingress acme -n prod | sed -n '/Rules/,$p'

# 3. Is the certificate actually issued? (Ready=False is very common.)
kubectl get certificate -n prod
kubectl describe certificate acme-tls -n prod | tail -20

# 4. Does the backend Service have endpoints? (This is usually the answer.)
kubectl get endpointslice -n prod -l kubernetes.io/service-name=orders

# 5. Bypass the ingress entirely to split "routing" from "app".
kubectl port-forward -n prod svc/orders 8080:80
curl -s localhost:8080/healthz        # works? then the problem is the edge

# The controller's own logs contain every request and every config reload.
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller --tail=50
```

- **Strength — the edge becomes declarative too** Hostnames, paths, certificates and timeouts live in the same repository as everything else, reviewed the same way, and a new service is a few lines rather than a ticket to a networking team.
- **Weakness — Ingress is under-specified, so behaviour is in annotations** Anything beyond host and path routing is controller-specific, which makes manifests non-portable and the documentation you need the controller's rather than Kubernetes'. The Gateway API exists to fix precisely this.

> **Tip**
>
> **`kubectl port-forward` is the fastest way to split a problem in half.** Forward straight to the Service and try again: if it works, your application and its Service are fine and the problem is at the edge — DNS, the load balancer, the certificate, the routing rules. If it does not, stop looking at the Ingress entirely.

<a id="9-microservices"></a>

### 9. Microservices — Many Services, One Cluster

- **Calls** `by Service DNS name`
- **Timeout** `client default: none`
- **Retry** `amplifies without backoff`
- **Fixed in** `your code, not the platform`

Everything so far has been about running *one* service well. A real system is a dozen of them calling each other, and the mechanics of that are the easy part: each service is a Deployment, each gets a Service, and they call each other by DNS name over the cluster network. You already know how to do all of it.

What changes is failure. In one process a call between modules cannot half-succeed. Across services it can be slow, time out, be retried into a duplicate write, or succeed while the caller has already given up. And crucially, **the platform cannot fix any of that for you** — Kubernetes will happily keep a saturated call chain running, because nothing in it has crashed.

> **Analogy** 🚦
>
> **Picture it — one blocked junction**
>
> A single junction gets slow. Cars queue back into the previous junction, which fills, which blocks the one before it. Within minutes the whole district is gridlocked, and the striking thing is that *nothing is broken* — every traffic light works, every road is open, every car is fine. Sending a mechanic to inspect the cars is useless; restarting them is worse. The only things that help are drivers who turn around after waiting too long (timeouts) and a barrier that stops feeding the blocked junction until it clears (a circuit breaker). That is precisely the shape of a cascading failure.

> **Interactive animation:** `cascading-failure` — rendered by the page script in the HTML version.

The four patterns in that animation are worth naming, because they are the vocabulary every discussion of service resilience uses. A **timeout** bounds how long a caller waits. **Retries with backoff and jitter** recover from a blip without arriving as a herd. A **circuit breaker** stops calling a dependency that is clearly broken, which protects both sides. And a **bulkhead** — separate connection pools per dependency — stops one slow dependency consuming all the capacity needed to serve everything else.

| Concern | Kubernetes gives you | You still have to |
| --- | --- | --- |
| Finding a service | DNS and a stable Service IP | Configure the name, never an IP |
| Load balancing | Across ready Pods, per connection | Know it is per *connection* — long-lived gRPC channels pin to one Pod |
| A slow dependency | **Nothing** | Timeouts, retries, breakers, bulkheads |
| Isolation between teams | Namespaces, quotas, NetworkPolicy | Ask for them — none are on by default |
| Following one request | **Nothing** | Propagate a trace ID through every hop |
| Data consistency | **Nothing** | One database per service; idempotent writes |

- **Strength — the cluster makes the wiring trivial** A new service is a Deployment and a Service; discovery, load balancing and rollouts come free. That is genuinely a large amount of work you no longer do per service.
- **Weakness — it makes the wiring trivial** Adding a service is so cheap that boundaries get drawn casually, and every casual boundary is a network call that can fail in ways a function call could not. The platform removes the friction that used to make you think twice.

**Interview question**

*During an incident, one downstream service is slow — not down, just slow. Every Pod of every service starts failing its health checks and Kubernetes restarts all of them. What went wrong, and what would you change?*

Two separate mistakes compounded, and separating them is the answer. The first is that the callers had no timeouts, so each worker waiting on the slow dependency was occupied for however long that dependency took. Once every worker is blocked, the service cannot answer *anything*, including requests that never touch the slow dependency — so the outage spreads upwards through the call chain even though only one service is degraded. The second mistake is that the liveness probes were doing real work, or were reaching a dependency, so when the service saturated they started timing out and Kubernetes concluded the containers were broken. They were not broken; they were busy. Restarting them threw away every in-flight request and produced a reconnection storm against a dependency that was already struggling, which makes recovery slower, not faster. What I would change: a timeout on every outbound call, shorter the further in you go; retries only on idempotent operations, with exponential backoff and jitter and a retry budget; a circuit breaker so a clearly broken dependency stops being called at all; and a liveness probe that is a flat 200 with a generous failure threshold, moving any dependency checking into readiness where the consequence is shedding traffic rather than destroying the process. The deeper point I would make is that this is an *application* problem wearing a platform costume — no Kubernetes setting fixes a call chain with no timeouts.

**Resilient calls, and the isolation to go with them**

```python
"""Every outbound call: a timeout, a bounded retry, and a breaker."""
import httpx, random, time

# Bulkhead: a SEPARATE pool per dependency, so a slow payments service
# cannot consume the connections orders needs for everything else.
payments = httpx.Client(
    base_url="http://payments.prod.svc.cluster.local:8080",
    timeout=httpx.Timeout(connect=0.3, read=1.0, write=1.0, pool=0.2),
    limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
)

class Breaker:
    def __init__(self, threshold=0.5, window=100, cooldown=30):
        self.failures, self.total = 0, 0
        self.threshold, self.window, self.cooldown = threshold, window, cooldown
        self.opened_at = None

    def allow(self) -> bool:
        if self.opened_at is None:
            return True
        if time.monotonic() - self.opened_at > self.cooldown:
            self.opened_at = None          # half-open: let ONE call through
            return True
        return False                        # open: fail instantly, no request

    def record(self, ok: bool):
        self.total += 1
        self.failures += 0 if ok else 1
        if self.total >= self.window:
            if self.failures / self.total > self.threshold:
                self.opened_at = time.monotonic()
            self.failures = self.total = 0

breaker = Breaker()

def charge(order_id: str, amount: int):
    if not breaker.allow():
        raise PaymentsUnavailable("circuit open")   # degrade, do not hang

    for attempt in range(3):
        try:
            r = payments.post("/charge", json={"order": order_id,
                                               "amount": amount},
                              # An idempotency key makes a retry safe. Without
                              # one, retrying a payment is a duplicate charge.
                              headers={"Idempotency-Key": order_id})
            r.raise_for_status()
            breaker.record(True)
            return r.json()
        except (httpx.TimeoutException, httpx.HTTPStatusError):
            breaker.record(False)
            if attempt == 2:
                raise
            # Exponential backoff PLUS jitter: without jitter every caller
            # retries at the same instant and arrives as one herd.
            time.sleep((0.2 * 2 ** attempt) * (0.5 + random.random()))
```

```yaml
# A namespace per team or per domain: the unit of quota, RBAC and policy.
apiVersion: v1
kind: ResourceQuota
metadata: { name: team-orders, namespace: orders }
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    pods: "60"
---
# Default deny, then allow only the calls that should exist. Without this,
# every pod in the cluster can reach every other pod - including your
# database from a compromised frontend.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: payments }
spec:
  podSelector: {}
  policyTypes: [Ingress]
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: only-orders-may-call-payments, namespace: payments }
spec:
  podSelector:
    matchLabels: { app: payments }
  policyTypes: [Ingress]
  ingress:
    - from:
        - namespaceSelector:
            matchLabels: { kubernetes.io/metadata.name: orders }
          podSelector:
            matchLabels: { app: orders }
      ports: [{ protocol: TCP, port: 8080 }]
```

> **Warning**
>
> **Kubernetes load-balances per *connection*, not per request.** For plain HTTP/1.1 that is fine, because connections come and go. For long-lived HTTP/2 or gRPC channels it means one client pins to one Pod for the life of the channel — so you scale to ten replicas and the traffic stays on two. The fixes are a client that does its own load balancing over the headless Service, periodic connection recycling, or a proxy that balances at the request layer.

> **Key idea**
>
> **A service mesh gives you all of this as configuration rather than code** — timeouts, retries, circuit breaking, mutual TLS between services and traces you did not have to instrument. It is genuinely valuable at a few dozen services and a large operational commitment before that: a sidecar in every Pod, another control plane to upgrade, and a new place for traffic to go wrong. Implement the four patterns in a shared library first; adopt a mesh when keeping that library consistent across languages has become the harder problem.

> **Tip**
>
> The moment you have more than about three services, **distributed tracing stops being optional**. With one service, a log file answers "why was this slow?". With eight, per-service dashboards all look slightly bad and none of them says where the time went. Propagate the `traceparent` header through every hop — including message queues — and put the trace ID on every log line.

<a id="unit-4"></a>

## Unit 4 — Living With It

The day-to-day: the commands worth knowing by heart, a systematic way to debug, and the three subjects — storage, scaling and safe shipping — where a developer's decisions have the largest consequences.

<a id="10-kubectl"></a>

### 10. kubectl — The Commands You Actually Need

- **Start with** `describe + events`
- **Logs of a dead pod** `--previous`
- **No shell in the image** `kubectl debug`
- **Never** `edit in production`

`kubectl` has hundreds of flags and you need about fifteen commands. The most valuable habit is not knowing more of them — it is reaching for `describe` and `events` before anything else, because every controller that touched an object left a note there.

**The fifteen commands, grouped by what you are doing**

```bash
# ---- orientate --------------------------------------------------------
kubectl config current-context               # WHICH CLUSTER am I in?
kubectl config set-context --current --namespace=prod
kubectl get pods -o wide                     # includes node and pod IP
kubectl get all -l app=api                   # everything for one app

# ---- understand -------------------------------------------------------
kubectl describe pod api-7d4-x9k             # conditions + events: start here
kubectl get events --sort-by=.lastTimestamp | tail -30
kubectl logs -f -l app=api --tail=100 --prefix    # all pods of a label
kubectl logs api-7d4-x9k --previous          # the container that DIED

# ---- get inside -------------------------------------------------------
kubectl exec -it api-7d4-x9k -- sh
kubectl debug -it api-7d4-x9k --image=nicolaka/netshoot --target=api
kubectl port-forward svc/api 8080:80         # test bypassing the edge
kubectl cp api-7d4-x9k:/tmp/heap.hprof ./heap.hprof

# ---- change (carefully) ------------------------------------------------
kubectl apply -f deploy.yaml                 # the only way you should change
kubectl diff -f deploy.yaml                  # a plan step - use it every time
kubectl rollout status deployment/api
kubectl rollout undo deployment/api
kubectl scale deployment/api --replicas=6

# ---- when something is odd ---------------------------------------------
kubectl auth can-i --list                    # why is it forbidden?
kubectl get pod api-7d4-x9k -o yaml | less   # the whole truth, spec + status
kubectl top pod --containers | sort -k3 -h | tail
```

```bash
# Worth putting in your shell profile on day one.
alias k=kubectl
source <(kubectl completion bash)   # or zsh
complete -o default -F __start_kubectl k

# JSONPath and custom columns turn kubectl into a query tool.
kubectl get pods -o custom-columns=\
NAME:.metadata.name,\
READY:.status.containerStatuses[0].ready,\
RESTARTS:.status.containerStatuses[0].restartCount,\
IMAGE:.status.containerStatuses[0].imageID

# Which pods have restarted more than five times, across all namespaces?
kubectl get pods -A -o json | jq -r '
  .items[]
  | select(any(.status.containerStatuses[]?; .restartCount > 5))
  | "\(.metadata.namespace)/\(.metadata.name) \(.status.containerStatuses[0].restartCount)"'

# Which pods have no resource requests? (They are evicted first.)
kubectl get pods -A -o json | jq -r '
  .items[] | select(any(.spec.containers[]; .resources.requests == null))
  | "\(.metadata.namespace)/\(.metadata.name)"'

# Everything that is NOT running right now.
kubectl get pods -A --field-selector=status.phase!=Running
```

> **Warning**
>
> **Check your context before every destructive command.** The most common serious mistake a developer makes with Kubernetes is running the right command in the wrong cluster, because `kubectl` gives no indication of which one you are pointed at. Put the current context and namespace in your shell prompt (`kube-ps1`, or the equivalent in your prompt tool) — it takes five minutes and it removes an entire category of incident.

<a id="11-debugging"></a>

### 11. Debugging — Pending, CrashLoop, 502

- **Pending** `scheduler`
- **ImagePullBackOff** `registry`
- **CrashLoopBackOff** `your process`
- **0/1 Ready** `probe`

The `STATUS` column picks the branch, and each branch has essentially one command that resolves it. Working through them in order takes about two minutes and beats guessing every time.

> **Interactive animation:** `kubectl-debug` — rendered by the page script in the HTML version.

| Symptom | Command | Usual cause |
| --- | --- | --- |
| `Pending` | `describe pod` → Events | Insufficient CPU/memory, untolerated taint, volume in another zone |
| `ImagePullBackOff` | `describe pod` → Events | Wrong tag or digest, private registry with no pull secret |
| `CrashLoopBackOff` | `logs --previous` | Missing env var, unreachable dependency, failed migration |
| Exit 137, no logs | `lastState.terminated` | OOM-killed against the memory limit |
| `Running`, `0/1` | `describe pod` → probe error | Readiness failing — wrong port, wrong path, too slow |
| Ready but 502s | `get endpointslice` | Selector mismatch, or wrong `targetPort` |
| `Terminating` forever | `describe pod` | A finalizer, or a grace period longer than you think |
| `Evicted` | `describe node` | Node under memory or disk pressure; you were BestEffort |

**Interview question**

*Users report intermittent 502s. Some requests work, some do not. Where do you start?*

"Intermittent" is the important word, because it says the routing is fundamentally correct and some subset of backends is bad — which immediately rules out the whole class of selector-and-port mistakes that cause *total* failure. So the first thing I want is the per-Pod picture: `kubectl get pods -l app=api` and look at the `READY` and `RESTARTS` columns. If one of four Pods is `0/1` or restarting, I have my answer and the question becomes why — usually an OOM kill on one replica that has more traffic, or a readiness probe flapping. If all Pods look healthy, my next suspicion is the deploy: during a rolling update, requests can be routed to a Pod that is shutting down, because endpoint removal and `SIGTERM` happen concurrently rather than in order. That produces exactly this symptom, correlated with deploy times, and the fix is a `preStop` sleep plus graceful shutdown rather than anything about the Service. The third possibility is that the errors are not intermittent at all but sticky per user, which would point at two versions of the code being live with incompatible behaviour. I would check the ingress controller's logs for the upstream address on failed requests — that tells me definitively *which* Pod refused, and whether the failures are spread evenly or concentrated.

**Narrow it to a Pod, then to a moment**

```bash
# 1. Is it one pod, or all of them?
kubectl get pods -l app=api
# NAME          READY   STATUS    RESTARTS   AGE
# api-7d4-x9k   1/1     Running   0          4h
# api-7d4-mq2   0/1     Running   3          4h    <- there it is

# 2. Why is that one unhealthy?
kubectl describe pod api-7d4-mq2 | sed -n '/Events/,$p'
kubectl logs api-7d4-mq2 --previous --tail=50
kubectl get pod api-7d4-mq2 \
  -o jsonpath='{.status.containerStatuses[0].lastState.terminated}' | jq

# 3. If all pods look fine: does it correlate with deploys?
kubectl rollout history deployment/api
kubectl get events --sort-by=.lastTimestamp | grep -i 'killing\|unhealthy'

# 4. Which upstream actually refused? The controller logs know.
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller \
  | grep ' 502 ' | awk '{print $NF}' | sort | uniq -c | sort -rn

# 5. Reproduce against one pod, bypassing the Service and the Ingress.
kubectl port-forward pod/api-7d4-mq2 8080:8080
curl -s -o /dev/null -w '%{http_code}\n' localhost:8080/readyz
```

```yaml
# The fix for 502s at the END of a rollout, which is the most common
# "intermittent" cause and is invisible in application logs.
spec:
  terminationGracePeriodSeconds: 45     # must exceed your longest request
  containers:
    - name: api
      lifecycle:
        preStop:
          exec:
            # Endpoint removal and SIGTERM are sent CONCURRENTLY. Without
            # this pause, the pod can close its listener while proxies are
            # still sending it traffic - the requests in flight become 502s.
            command: ["sh", "-c", "sleep 5"]

      readinessProbe:
        httpGet: { path: /readyz, port: 8080 }
        periodSeconds: 5
        failureThreshold: 2             # leave rotation quickly when unwell

# And in the application: on SIGTERM, fail readiness FIRST, keep serving
# for a few seconds, then drain and exit. See the Docker crash course §11.
```

> **Key idea**
>
> **`kubectl describe` and `kubectl get events` answer most questions before you reach for anything cleverer.** Every controller that touched the object — scheduler, kubelet, endpoints controller — recorded what it did and why. And when the image has no shell, `kubectl debug --image=nicolaka/netshoot --target=api` attaches a toolbox container that shares the Pod's network and process namespaces, so you get a prompt without shipping one.

<a id="12-storage"></a>

### 12. State & Storage (and Why You Probably Do Not Want It)

- **PVC** `a request for storage`
- **ReadWriteOnce** `one node at a time`
- **Per-replica disk** `StatefulSet`
- **Best option** `no state at all`

A **PersistentVolumeClaim** is a request for storage; a **StorageClass** describes how to satisfy it; a **PersistentVolume** is the provisioned result. As a developer the mechanics matter less than two constraints that will bite you, and they are both consequences of the same fact: most cloud block storage is a disk attached to one machine.

> **Interactive animation:** `pvc-pending` — rendered by the page script in the HTML version.

- **Strength — a StatefulSet does give real per-replica identity** Stable names, stable DNS, a volume that follows each Pod, ordered start-up. Databases and brokers are deployed this way for good reasons and it works.
- **Weakness — you have taken on running a database** Backups, restores, failover, version upgrades and capacity are now yours, and the day you find out whether the restore procedure works is the day the primary fails. A managed database is usually the better trade by a wide margin.

**Interview question**

*You add a PVC to a Deployment and scale to three replicas. Two Pods stay `Pending`. Why?*

Because all three replicas of a Deployment share the single PVC named in the template, and that PVC is almost certainly `ReadWriteOnce` — which means the volume can be attached to one *node* at a time. The first Pod gets scheduled and mounts it; the other two cannot be placed anywhere the volume can be attached, so they sit `Pending` with a multi-attach error in their events. It looks like a scheduling problem and it is a storage constraint. There are three ways forward and they say quite different things about the design. If each replica genuinely needs its own disk, the right object is a StatefulSet, whose `volumeClaimTemplates` create one PVC per Pod with stable names. If all replicas genuinely need to share the same files, I need a `ReadWriteMany` volume — NFS or a managed file service — which is slower and often not available. But the question I would ask first is what is actually being stored, because in most cases the honest answer is user uploads or a cache, and neither belongs on a disk attached to a Pod. Object storage removes the constraint entirely and makes the replicas interchangeable again, which is the property that made the Deployment attractive in the first place.

**Per-replica volumes, and the option to avoid them**

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: db }
spec:
  serviceName: db              # a headless Service, for stable DNS names
  replicas: 3
  selector:
    matchLabels: { app: db }
  template:
    metadata:
      labels: { app: db }
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: postgres
          image: postgres:16
          volumeMounts:
            - { name: data, mountPath: /var/lib/postgresql/data }

  # One PVC per pod, created automatically and NOT deleted with the pod:
  #   data-db-0, data-db-1, data-db-2
  # If db-1 is rescheduled to another node, its volume follows it.
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: gp3
        resources:
          requests: { storage: 100Gi }
---
# And set the reclaim policy deliberately, or a deleted namespace also
# deletes the disks:
#   kubectl patch pv  -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
```

```bash
# Why is a PVC not binding?
kubectl get pvc
# NAME        STATUS    VOLUME   CAPACITY   STORAGECLASS
# data-api    Pending                       gp3

kubectl describe pvc data-api | sed -n '/Events/,$p'
#   waiting for first consumer to be created before binding   <- normal,
#     with WaitForFirstConsumer; the volume is made when a pod is scheduled
#   no persistent volumes available for this claim            <- no dynamic
#     provisioner, or the storageClassName is wrong

# Multi-attach: the Deployment-plus-PVC mistake.
kubectl describe pod api-7d4-mq2 | grep -i multi-attach
# Multi-Attach error for volume "pvc-0abc": Volume is already used by pod(s) api-7d4-x9k

# What access modes does this storage class actually support?
kubectl get storageclass
kubectl get pv -o custom-columns=\
NAME:.metadata.name,MODES:.spec.accessModes,RECLAIM:.spec.persistentVolumeReclaimPolicy,ZONE:.metadata.labels

# Deleting a StatefulSet does NOT delete its PVCs - that is deliberate,
# and it is also how a "clean reinstall" quietly reuses old data.
kubectl delete statefulset db
kubectl get pvc          # data-db-0, data-db-1, data-db-2 still there
```

> **Tip**
>
> As an application developer, the best storage decision is usually **not to need any**. Put durable data in a managed database, put files in object storage, keep caches in Redis, and let your Pods hold nothing that matters. Then rescheduling, rollbacks, node failures and scaling are all uninteresting — which is the entire benefit you came to Kubernetes for.

<a id="13-scaling"></a>

### 13. Scaling & What It Costs

- **HPA reaction** `60–90 s`
- **New node** `2–5 min`
- **Scale up** `fast`
- **Scale down** `deliberately slow`

The **Horizontal Pod Autoscaler** watches a metric and adjusts the replica count. It is excellent at following a daily traffic curve and cutting your bill, and it is close to useless against a spike that arrives in ten seconds — because between the metric being scraped, the controller evaluating it, a Pod being scheduled, an image being pulled and the application warming up, there is roughly a minute and a half you cannot remove.

> **Interactive animation:** `autoscaling` — rendered by the page script in the HTML version.

- **Strength — capacity follows demand without anyone watching** Overnight you run three replicas and at lunchtime you run thirty, and nobody had to predict it. For most services that is a large, permanent cost reduction for a dozen lines of YAML.
- **Weakness — it scales the tier that was never the bottleneck** Ten times the Pods means ten times the database connections, and the database cannot scale with them. Autoscaling the stateless tier without bounding its effect on the shared dependency has caused real outages.

**Interview question**

*You add an HPA on CPU at 70% and it never scales, even though the service is clearly overloaded. Why?*

Because CPU is not what is saturating. A service that spends its time waiting on a database or an external API is I/O-bound: it sits at twenty percent CPU while its request queue grows without bound, latency climbs, and the autoscaler correctly observes that CPU is nowhere near seventy percent and does nothing. The metric has to be the resource that is actually constrained — in-flight requests or requests-per-second per Pod for an API, queue depth for a worker, p95 latency if the platform supports it. Kubernetes supports custom and external metrics for exactly this, and KEDA makes queue-driven scaling straightforward. Two other things I would rule out while I was there, because they produce the same symptom. If the Pod has no CPU `request`, the HPA has nothing to compute a percentage *of* and will report unknown metrics rather than scaling — utilisation is always relative to the request. And if metrics-server is not installed or is failing, `kubectl top` and the HPA both go blind, which `kubectl describe hpa` will say explicitly in its conditions.

**Scale on the real constraint, and damp the oscillation**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 4              # headroom, NOT the minimum that works:
  maxReplicas: 30             # minReplicas is your defence against a spike
  metrics:
    - type: Pods
      pods:
        metric: { name: http_inflight_requests }   # the real constraint
        target: { type: AverageValue, averageValue: "30" }
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0        # react immediately
      policies:
        - { type: Percent, value: 100, periodSeconds: 30 }   # may double
    scaleDown:
      stabilizationWindowSeconds: 300      # wait 5 minutes before shrinking:
      policies:                            # being briefly over-provisioned
        - { type: Percent, value: 10, periodSeconds: 60 }    # costs money;
                                                             # flapping costs
                                                             # user errors
---
# Queue-driven work, where "how much is waiting" is the obvious signal.
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata: { name: worker }
spec:
  scaleTargetRef: { name: worker }
  minReplicaCount: 0          # scale to zero when the queue is empty
  maxReplicaCount: 50
  triggers:
    - type: aws-sqs-queue
      metadata:
        queueURL: https://sqs.us-east-1.amazonaws.com/1234/jobs
        queueLength: "20"     # target messages per pod
```

```bash
# Why is the HPA not doing anything? Its conditions say so directly.
kubectl describe hpa api | sed -n '/Conditions/,$p'
#   ScalingActive  False  FailedGetResourceMetric
#     -> metrics-server missing, or the pod has no CPU request

kubectl get hpa api -o wide
# NAME  REFERENCE       TARGETS         MINPODS  MAXPODS  REPLICAS
# api   Deployment/api  /70%   4        30       4

# Is metrics-server working at all?
kubectl top pod -l app=api

# Are you paying for idle? Compare requests against real p95 usage.
kubectl get pods -A -o json | jq -r '
  .items[] | .spec.containers[] |
  "\(.name)\t\(.resources.requests.cpu // "none")\t\(.resources.requests.memory // "none")"' \
  | sort | uniq -c | sort -rn | head

# The three cost levers, largest first:
#   1. right-size requests           usually 30-50% of a cluster bill
#   2. spot nodes for interruptible  50-90% off, needs PDBs and tolerations
#   3. commitments / savings plans   30-60% off the stable baseline
```

> **Warning**
>
> **Autoscaling is a cost tool that helps with load, not a defence against spikes.** If your traffic can double in ten seconds, the answers are a higher `minReplicas`, pre-scaling before known events, and shedding load at the edge — not a more aggressive threshold. And bound the second-order effect: connection pooling with a hard maximum, so that thirty Pods cannot open thirty times as many database connections as four.

<a id="14-shipping"></a>

### 14. Shipping Safely — Rollbacks, Budgets & What You Own

- **Rollback** `rollout undo`
- **Not reversible** `migrations`
- **PDB** `survives node drains`
- **Deploy by** `digest`

Kubernetes gives you a fast, boring rollback: the previous ReplicaSet still exists, its images are already on the nodes, and `kubectl rollout undo` scales it back up. That single property is what makes frequent deployment reasonable — and it has one large exception, which is everything the deploy changed *outside* the cluster.

The exception is the database. A rolling update means both versions of your code are live at once, so the schema must serve both; and after a rollback the *old* code must work against the *new* schema. A migration that renames or drops a column defeats the rollback entirely: the deployment is reversible and the data is not.

| Change | Reversible? | What to do instead |
| --- | --- | --- |
| New image version | Yes — seconds to minutes | `kubectl rollout undo` |
| Config change (hashed into the template) | Yes | Revert the commit and reapply |
| Add a nullable column | Yes — old code ignores it | Safe to ship any time |
| Rename or drop a column | **No** | Expand and contract across several deploys |
| Change a message format | **No** — messages are already in flight | Add fields, never repurpose them |
| Change a shared cache format | **No** | Put a schema version in the cache key |

**A safe deploy, and the guard rails around it**

```yaml
# A PodDisruptionBudget protects you from VOLUNTARY disruption: node
# drains, cluster upgrades, descheduling. Without one, a routine node
# upgrade can evict every replica you have at the same moment.
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api }
spec:
  minAvailable: 3            # or maxUnavailable: 1
  selector:
    matchLabels: { app: api }
# NOTE: it does NOT help when a node crashes - that is involuntary and no
# budget applies. And minAvailable == replicas deadlocks every drain,
# which turns a cluster upgrade into an outage of the upgrade itself.
---
# Spread replicas so one zone failure cannot take all of them.
spec:
  template:
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway    # degrade, do not go Pending
          labelSelector:
            matchLabels: { app: api }
---
# Migrations run as their own step, BEFORE the app deploy, and are
# forward-only: rolling back the code must never need a schema rollback.
apiVersion: batch/v1
kind: Job
metadata: { name: migrate-9f2c1ab }
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/acme/api@sha256:9f2c1ab...   # the SAME image
          command: ["python", "-m", "migrate", "up"]
```

```bash
# Deploy by digest, never by a mutable tag. The pipeline writes this line.
kubectl set image deployment/api \
  api=ghcr.io/acme/api@sha256:9f2c1ab... --record=false
kubectl rollout status deployment/api --timeout=300s

# Review before you apply - kubectl diff is a plan step and it is free.
kubectl diff -f overlays/prod/ | head -50

# Rollback, and the two things to check afterwards.
kubectl rollout undo deployment/api
kubectl rollout status deployment/api
#   1. did a migration run in this deploy?  -> the code rollback may not be enough
#   2. are there messages in flight in the old format?

# Prove what is actually running right now.
kubectl get pods -l app=api \
  -o jsonpath='{range .items[*]}{.status.containerStatuses[0].imageID}{"\n"}{end}' \
  | sort -u
# more than one line = you are running mixed versions

# Before a cluster upgrade, check nothing will deadlock the drain.
kubectl get pdb -A
kubectl drain node-3 --ignore-daemonsets --dry-run=server
```

> **Key idea**
>
> **The division of responsibility, stated plainly.** The platform owns nodes, upgrades, networking and the control plane. *You* own your image, your probes, your resource requests, your graceful shutdown, your configuration and your database compatibility. Every incident in this course that a developer can cause is in that second list — which is good news, because it is a short list and all of it is in your manifest.

<a id="15-one-page"></a>

### 15. The Whole Thing on One Page

```text
you write                    controllers reconcile
──────────────────────       ─────────────────────────────────────────
Deployment                   ReplicaSet ──▶ Pods
  replicas: 4                  scheduler picks a node
  image: api@sha256:…          kubelet pulls the image and starts it
  readinessProbe                 │
  resources.requests             ▼  probe passes ⇒ Ready
  labels: app=api              EndpointSlice   (Ready pods only)
                                 ▲
ConfigMap / Secret ──▶ env       │ label selector
                                 │
users ──▶ Ingress ──▶ Service ───┘    host + path ⇒ svc ⇒ pod IP:port

debugging is always:   spec   (what you asked for)
                    vs status (what is true now)
                     + events (what happened in between)
```

- **Declare, do not command** You write desired state; controllers close the gap forever. That is why self-healing works and why a manual `kubectl edit` is quietly undone.
- **Readiness is the contract** It gates traffic and it gates rollouts. A missing or wrong readiness probe is behind most deploy-time outages a developer causes.
- **requests schedule, limits kill** CPU over the limit is throttled and slow; memory over the limit is exit code 137 with no stack trace. Set both from measurements.
- **Pods are cattle** New name, new IP, empty disk, at any moment. Keep state outside, logs on stdout, config in the environment.
- **The traps** Liveness probes that check the database. Both `maxSurge` and `maxUnavailable` at zero. An edited ConfigMap with no rollout. A PVC shared by a scaled Deployment. Deploying `:latest`. A migration that renames a column.
- **The limits** Kubernetes will not make a badly-behaved application reliable. If it cannot start twice, cannot be killed safely, or holds state locally, the platform will expose that rather than hide it.

**The manifest that covers 90% of what you will write**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: prod, labels: { app: api } }
spec:
  replicas: 4
  revisionHistoryLimit: 5
  minReadySeconds: 10
  progressDeadlineSeconds: 600
  selector: { matchLabels: { app: api } }
  strategy:
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  template:
    metadata: { labels: { app: api } }
    spec:
      terminationGracePeriodSeconds: 45
      securityContext: { runAsNonRoot: true, runAsUser: 10001 }
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector: { matchLabels: { app: api } }
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:9f2c1ab...
          ports: [{ containerPort: 8080 }]
          envFrom: [{ configMapRef: { name: api-config } }]
          env:
            - name: DATABASE_URL
              valueFrom: { secretKeyRef: { name: api-db, key: url } }
          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits:   { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /readyz, port: 8080 }
            periodSeconds: 5
            failureThreshold: 2
          livenessProbe:
            httpGet: { path: /livez, port: 8080 }
            periodSeconds: 15
            failureThreshold: 6
          lifecycle:
            preStop: { exec: { command: ["sh", "-c", "sleep 5"] } }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          volumeMounts: [{ name: tmp, mountPath: /tmp }]
      volumes:
        - name: tmp
          emptyDir: { medium: Memory, sizeLimit: 64Mi }
---
apiVersion: v1
kind: Service
metadata: { name: api, namespace: prod }
spec:
  selector: { app: api }
  ports: [{ name: http, port: 80, targetPort: 8080 }]
```

```text
Decision table
──────────────
Which workload object?
  stateless service                 -> Deployment
  needs stable identity + own disk  -> StatefulSet
  one per node (agent)              -> DaemonSet
  runs once to completion           -> Job
  on a schedule                     -> CronJob

How is it reached?
  from another service              -> Service (ClusterIP), by DNS name
  from the internet                 -> Ingress -> Service
  needs each pod addressable        -> headless Service

Where does config go?
  non-sensitive                     -> ConfigMap
  sensitive                         -> external store -> synced Secret
  must take effect on change        -> hash it into the pod template

Where does data go?
  durable + shared                  -> managed database / object storage
  durable + per replica             -> StatefulSet + volumeClaimTemplates
  scratch                           -> emptyDir
  logs                              -> stdout

Which probe?
  should I get traffic?             -> readiness   (removes from endpoints)
  is this process wedged?           -> liveness    (restarts the container)
  am I still booting?               -> startup     (suspends the other two)
```

> **Key idea**
>
> **If you remember one sentence:** Kubernetes will faithfully do what your manifest says, over and over, forever — so almost every surprise is a controller correctly enforcing something you did not realise you had declared. Read `spec`, then `status`, then the events, and the surprise usually explains itself.

<a id="where-next"></a>

### Where to go next

1. [The Docker crash course](../docker/docker-crash-course.html) — the prerequisite, if any of the image, layer or volume material here felt thin.
2. [The DevOps detailed course](../devops/devops-detailed-course.html) — sections 14 to 18 cover Kubernetes architecture, workloads, networking and scheduling in far more depth, including the control plane and RBAC.
3. [The DevOps crash course](../devops/devops-crash-course.html) — where all of this sits in the delivery loop: pipelines, deployment strategies, GitOps, observability and SLOs.
4. [All DevOps courses](../devops-courses.html) — the catalogue page for this topic.
5. The Kubernetes documentation is unusually good as a primary source — particularly the *Configure Liveness, Readiness and Startup Probes* task page and the *Managing Resources for Containers* concept page, both of which are worth reading in full once.

---

TechToday Study Library — Kubernetes
