<!--
Source: docker-crash-course.html
Title: Docker Crash Course for Developers | TechToday
Description: A developer-centric Docker crash course — what a container really is, images and layers, writing a Dockerfile you will not regret, the layer cache, multi-stage builds, ports and volumes, Compose, graceful shutdown, registries and digests, and how to debug a container that will not start.
Theme-color: #0b0d10
Stylesheets: docker-study.css, ../../../site-header.css
Scripts: docker-study.js
-->

Navigation: [TechToday](../../../index.html) · [← DevOps Courses](../devops-courses.html)

<a id="docker-crash-course"></a>

# Docker

This course is written for the person who *writes the application*, not the person who runs the cluster. You will not be asked to configure a registry, tune a storage driver or operate a build farm. You will learn exactly what you need to package your own service so that it runs the same on your laptop, in CI and in production — and, just as importantly, what to check when it does not. Every mechanism worth seeing is an animation: press **Play**, then step through it with the arrows. Code appears in shell, YAML and Python, and the tabs remember your choice.

> **Key idea**
>
> Three ideas carry almost all of Docker. **A container is a process, not a machine** — the kernel just restricts what it can see and use, which is why it starts in milliseconds and why "isolated" has limits. **An image is a stack of layers and the order is a cache key** — which explains every fast build and every slow one. And **containers are disposable**, so anything you want to keep must be deliberately put somewhere that outlives them. Hold those three and the commands stop needing to be memorised.

<a id="table-of-contents"></a>

## Table of Contents

1. [What a Container Actually Is](#1-what-a-container-is)
2. [Images, Layers & the Disposable Container](#2-images-layers)
3. [Your First Real Dockerfile](#3-first-dockerfile)
4. [The Layer Cache — Why Rebuilds Are Slow](#4-layer-cache)
5. [Multi-Stage Builds & Small Images](#5-multi-stage)
6. [Dependencies, Lockfiles & Build Secrets](#6-dependencies)
7. [Ports & Talking to Other Containers](#7-ports)
8. [Volumes — Where Your Data Lives](#8-volumes)
9. [Compose — Your App Plus Its Real Dependencies](#9-compose)
10. [Microservices — Many Containers, One System](#10-microservices)
11. [Signals, PID 1 & Graceful Shutdown](#11-signals)
12. [Registries, Tags & Digests](#12-registries)
13. [Debugging a Container That Will Not Start](#13-debugging)
14. [Making It Production-Ready](#14-production)
15. [The Whole Thing on One Page](#15-one-page)

<a id="unit-1"></a>

## Unit 1 — The Model

Three sections that make everything else obvious. What the kernel is actually doing, what an image is made of, and how to write a Dockerfile that a reviewer would approve.

<a id="1-what-a-container-is"></a>

### 1. What a Container Actually Is

- **Start time** `~50 ms`
- **Kernel** `shared with host`
- **Sees** `namespaces`
- **Uses** `cgroups`

A container is not a small virtual machine, and the difference matters the first time something goes wrong. A VM boots its own kernel on virtualised hardware. A container is an **ordinary Linux process** that the kernel has been asked to answer questions differently for. Two features do all of the work: **namespaces** change what the process can *see* — its own process table, its own filesystem root, its own network interfaces — and **cgroups** limit what it can *consume*.

That is the whole trick, and every practical consequence follows from it. Containers start in milliseconds because nothing is being booted. A Linux image cannot run on a Windows kernel, because there is no kernel inside the image to run it. And a container that gets root and finds a kernel vulnerability is on the host, because the host's kernel is the one it was using all along.

> **Analogy** 🏨
>
> **Picture it — a hotel room, not a house**
>
> A virtual machine is a house: its own foundations, plumbing and roof. Expensive to build, and genuinely independent. A container is a hotel room: your own door, your own furniture, your own view — but the walls, the water supply and the fire safety belong to the building and are shared with two hundred other rooms. That is why a room is ready in minutes and a house takes months. It is also, precisely, why a problem with the building's foundations is your problem too.

> **Interactive animation:** `container-isolation` — rendered by the page script in the HTML version.

- **Strength — the dependency argument ends** The image carries the runtime, the libraries and the system packages, so "works on my machine" becomes "works, because it is the same filesystem". Nothing else you can do to a project buys as much reproducibility for as little effort.
- **Weakness — isolation is about tidiness, not security** Root in a container is root on the host if anything escapes, and a namespace does not contain a kernel bug. Run as a non-root user, and treat a container boundary as a guard rail rather than a wall.

**Interview question**

*A colleague says "just use a VM, it is basically the same thing and it is safer". What is your response?*

They are right about the safety and wrong about the sameness, and the useful answer separates the two. A VM has its own kernel, so the isolation boundary is the hypervisor and it is genuinely stronger — if you are running untrusted third-party code, that is the correct choice, and the sandboxed runtimes that exist (Firecracker, gVisor, Kata) are exactly the industry admitting it. But the properties I actually want day to day are not isolation. I want a build artifact that contains my dependencies, starts in fifty milliseconds so a test suite can spin up twenty of them, is a hundred megabytes rather than several gigabytes so CI can pull it on every run, and is described by a file in my repository that a reviewer can read. A VM image gives me none of those cheaply. The honest framing is that they solve different problems that happen to look similar from a distance — and in practice most production containers run inside VMs anyway, which is the industry taking both.

**See that it is just a process**

```bash
docker run -d --name web nginx

# From the HOST: an ordinary process in the ordinary process table.
ps -ef | grep [n]ginx
pgrep -f 'nginx: master'          # e.g. 48213

# From INSIDE: it believes it is PID 1 and that nothing else exists.
docker exec web ps -ef
# PID  USER  COMMAND
#   1  root  nginx: master process nginx -g daemon off;

# The namespaces it belongs to - one symlink each.
sudo ls -l /proc/48213/ns/
# ipc -> ipc:[4026532281]   mnt -> mnt:[4026532279]
# net -> net:[4026532284]   pid -> pid:[4026532282]

# "docker exec" is just: join those namespaces and run a command.
sudo nsenter -t 48213 -a ps -ef
```

```python
"""Ask the same question from inside and outside the container."""
import os, platform, subprocess

# The kernel is the HOST's kernel - this is the single most important
# consequence of the container model.
print(platform.uname().release)      # e.g. 6.6.16-linuxkit

# Am I in a container? There is no official answer; these are the signals.
print(os.path.exists("/.dockerenv"))                     # Docker writes this
print("docker" in open("/proc/1/cgroup").read())         # cgroup path hint
print(open("/proc/1/comm").read().strip())               # who is PID 1?

# What the kernel allows this process to use, straight from cgroup v2:
for f in ("memory.max", "cpu.max", "pids.max"):
    print(f, open(f"/sys/fs/cgroup/{f}").read().strip())
# memory.max 536870912     -> 512 MiB, and exceeding it is instant death
# cpu.max    50000 100000  -> 0.5 CPU, and exceeding it only slows you down
```

> **Warning**
>
> **The asymmetry between CPU and memory limits catches everyone once.** Going over your CPU limit gets you *throttled* — slow, survivable, and it shows up as unexplained latency. Going over your memory limit gets you *killed* immediately by the kernel's OOM killer, with exit code 137 and no stack trace, because `SIGKILL` cannot be caught. That is why "it just disappeared and logged nothing" almost always means memory.

<a id="2-images-layers"></a>

### 2. Images, Layers & the Disposable Container

- **Image** `read-only, shared`
- **Container** `+ 1 writable layer`
- **On `rm`** `writable layer gone`
- **To keep data** `use a volume`

An **image** is a stack of read-only layers, each one the filesystem diff produced by a single Dockerfile instruction and addressed by the hash of its contents. A **container** is that stack plus one thin writable layer on top. Writes use copy-on-write: modifying a file that came from an image layer copies it upward first, so the image itself is never touched and a hundred containers can share the same layers on disk.

The consequence developers care about is the last one in the strip above. The writable layer belongs to *that container* and dies with it, and containers are replaced constantly — on every rebuild locally, on every deploy in production. Anything written to it is temporary by design.

> **Analogy** 📄
>
> **Picture it — a stack of transparencies**
>
> Think of an old overhead projector. The image is a stack of printed transparencies, and you can never write on them. To run a container you lay one blank sheet on top and write only on that. Looking down through the stack, you see the combined picture — and anything you wrote covers what was underneath. Take the top sheet away and the printed ones are exactly as they were, ready for the next person. Everything you wrote is gone, which is fine, because the top sheet was always meant to be thrown away.

> **Interactive animation:** `container-lifecycle` — rendered by the page script in the HTML version.

- **Strength — sharing makes pulls cheap** Ten services built on the same base image store that base once and pull it once. It is also why pushing a new build of your app usually uploads a few megabytes rather than the whole image.
- **Weakness — layers are append-only, so nothing is ever really deleted** Removing a file in a later layer only adds a marker hiding it. The bytes stay in the earlier layer and anyone who can pull the image can extract them — which is why a secret copied in and then deleted is still a leaked secret.

**Interview question**

*Your service writes uploaded files to `/app/uploads` and it works perfectly in development. What happens in production, and what should you have done?*

It keeps working right up until the container is replaced, and then every upload is gone. In development that happens when you rebuild; in production it happens on the next deploy, or when a node is drained, or when the process is restarted after a crash — so the failure is not just likely, it is scheduled. Worse, if there is more than one replica, the behaviour is incoherent before anything is even deleted: a file uploaded through replica A is simply not there when the next request lands on replica B, which presents as a mysterious intermittent 404 rather than as a storage problem. The fix depends on how much you want to change. The minimum is a volume mounted at that path, which survives container replacement — but a volume is usually tied to one node, so it fixes durability and not the multiple-replica problem. The real answer for anything user-facing is object storage: the container holds no state at all, any replica can serve any request, and scaling and rollback become uninteresting. The general rule I would state is that a container should be safe to delete at any instant without losing anything that matters.

**Watch the writable layer disappear**

```bash
docker run -d --name app myapp
docker exec app sh -c 'echo "invoice-2026.pdf" > /app/uploads/list.txt'
docker exec app cat /app/uploads/list.txt        # invoice-2026.pdf

# How much has this container written? That is the writable layer.
docker ps -s --filter name=app
# SIZE
# 4.1kB (virtual 190MB)     <- 4.1 kB is yours; 190 MB is the shared image

# Replace the container - exactly what a deploy does.
docker rm -f app && docker run -d --name app myapp
docker exec app cat /app/uploads/list.txt
# cat: /app/uploads/list.txt: No such file or directory

# With a volume, the same replacement is harmless.
docker run -d --name app -v appdata:/app/uploads myapp
docker exec app sh -c 'echo "invoice-2026.pdf" > /app/uploads/list.txt'
docker rm -f app && docker run -d --name app -v appdata:/app/uploads myapp
docker exec app cat /app/uploads/list.txt        # invoice-2026.pdf
```

```python
"""The stateless version: the container holds nothing worth keeping."""
import os, uuid
import boto3

BUCKET = os.environ["UPLOAD_BUCKET"]          # injected, not baked in
s3 = boto3.client("s3")

def save_upload(file_obj, filename: str) -> str:
    key = f"uploads/{uuid.uuid4()}/{filename}"
    s3.upload_fileobj(file_obj, BUCKET, key)
    return key                                 # store the KEY in the database

def read_upload(key: str):
    return s3.get_object(Bucket=BUCKET, Key=key)["Body"]

# Why this is worth the extra dependency:
#   - any replica can serve any request, so scaling is trivial
#   - a deploy, a crash or a node failure loses nothing
#   - local /tmp is now genuinely scratch space, which is what it should be
```

> **Tip**
>
> Write logs to **stdout and stderr**, never to a file inside the container. The runtime captures both, `docker logs` and `kubectl logs` read them, and the platform handles rotation and shipping. A log file in the writable layer disappears with the container — which means it disappears at exactly the moment you most want to read it.

<a id="3-first-dockerfile"></a>

### 3. Your First Real Dockerfile

- **Instructions** `1 layer each`
- **Order by** `rate of change`
- **`CMD`** `exec form`
- **`USER`** `non-root`

A Dockerfile is a recipe read from top to bottom, where each instruction produces a layer. Most of the craft is in two decisions: what goes in, and in what order. Everything else is a handful of instructions you will use every day.

| Instruction | What it does | The thing people get wrong |
| --- | --- | --- |
| `FROM` | The base image to start from | Using a floating tag, so your build changes when upstream rebuilds |
| `WORKDIR` | Sets (and creates) the working directory | Using `RUN cd /app`, which does not persist to the next layer |
| `COPY` | Copies from the build context into the image | `COPY . .` too early — it destroys the cache (§4) |
| `RUN` | Executes a command at build time | Cleaning up in a *later* `RUN`, which shrinks nothing |
| `ENV` | Sets an environment variable in the image | Putting a secret in it — permanently readable |
| `EXPOSE` | Documents a port | Believing it publishes the port; it does not (§7) |
| `USER` | Switches the user for later steps and runtime | Omitting it, so the process runs as root |
| `ENTRYPOINT` / `CMD` | What runs when the container starts | Shell form, which breaks signal handling (§11) |

Here is a Dockerfile that would pass review, annotated with the reason for each decision. It is worth reading closely — sections 4 to 6 are essentially explanations of why it is written this way.

**A Dockerfile you would not have to apologise for**

```bash
# syntax=docker/dockerfile:1.7

# Pinned by digest: a tag can be rebuilt upstream, a digest cannot change.
FROM python:3.12-slim@sha256:2f9a3c1e0b7d5a4c8e2f1b6d3a9c7e5f0b8d2a4c6e1f3b5d AS runtime

# Fail fast and unbuffered, so logs appear immediately in docker logs.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System packages change rarely, so they go near the top. Install and clean
# in ONE RUN - a later "rm" cannot shrink an earlier layer.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq5=15.* \
 && rm -rf /var/lib/apt/lists/*

# The single highest-value line in the file: copy ONLY the dependency
# manifest, so editing your source does not invalidate the install below.
COPY requirements.lock .
RUN pip install --require-hashes -r requirements.lock

# Source last, because it changes on every commit.
COPY . .

# A real user, created here rather than assumed to exist.
RUN useradd --system --uid 10001 app && chown -R app:app /app
USER 10001

EXPOSE 8080
# Exec form: your process is PID 1 and receives SIGTERM directly (§11).
CMD ["python", "-m", "app"]
```

```text
.dockerignore - as important as the Dockerfile, and usually missing
───────────────────────────────────────────────────────────────────
The build context is everything sent to the builder before the first
instruction runs. Without this file you are uploading your .git history
on every build, and any COPY . . bakes it into the image.

.git
.gitignore
node_modules
__pycache__
*.pyc
.venv
.env
.env.*
.pytest_cache
.mypy_cache
dist
build
coverage
*.md
tests

Why each matters
  .git         often larger than the application itself
  node_modules reinstalled inside; copying breaks native modules
  .env         the single most common way a secret enters an image
  __pycache__  changes constantly, invalidating COPY for no reason
  tests        not needed at run time; more code for a scanner to flag
```

> **Key idea**
>
> **`ENTRYPOINT` and `CMD` divide one job.** `ENTRYPOINT` is the thing that always runs; `CMD` is the default arguments, replaceable from the command line. Setting `ENTRYPOINT ["python", "-m", "app"]` and `CMD ["--port", "8080"]` means `docker run myapp --port 9000` does the obvious thing. If you set only `CMD`, then anything a user appends replaces the whole command — which is convenient for `docker run myapp sh` and surprising otherwise.

> **Tip**
>
> Pin the base image by **digest**, not by tag. `python:3.12-slim` is rebuilt upstream regularly, so the same Dockerfile produces a different image next month — which is exactly the non-reproducibility containers were meant to remove. Let a bot bump the digest in a pull request, so the change is reviewed rather than absorbed silently.

<a id="unit-2"></a>

## Unit 2 — Building Images You Will Not Regret

Three sections about the build itself: why it is slow, why the image is enormous, and how a credential ends up permanently readable inside it.

<a id="4-layer-cache"></a>

### 4. The Layer Cache — Why Rebuilds Are Slow

- **Cache key** `instruction + layers below`
- **One miss** `invalidates everything below`
- **Rule** `stable first, volatile last`

Each layer's cache key is the instruction text plus the digest of everything beneath it. For `COPY`, the checksum of the copied files is part of the key. That one sentence explains every fast build and every slow one: **invalidating a layer invalidates every layer below it**, so instructions must be ordered from least to most frequently changing.

> **Analogy** 🥞
>
> **Picture it — a stack of pancakes made in order**
>
> You are making a stack, and each pancake must be placed on the one below it. If you change the recipe for the third pancake, you can keep the first two — but the third and everything above it must be made again, because they were all cooked on top of the old third. Now imagine the third pancake takes four minutes and the top one takes two seconds. Whether your rebuild takes four minutes or two seconds depends entirely on *which* pancake you changed, and that is a decision you make when you write the order.

> **Interactive animation:** `image-layers` — rendered by the page script in the HTML version.

- **Strength — a correctly ordered file is dramatically faster for free** Moving one line usually takes a four-minute rebuild to four seconds, on every commit, for every developer and every CI run. There are very few changes with that ratio of effort to payoff.
- **Weakness — the cache is per machine unless you export it** A fresh CI runner has no cache and rebuilds everything, which is why builds are fast locally and slow in CI. BuildKit can push the cache to the registry (`--cache-to`) so runners share it.

**Interview question**

*Your CI build takes eight minutes and the only thing that changed is a comment in one Python file. Walk me through what you would look at.*

I would look at the Dockerfile before touching the CI configuration, because eight minutes for a comment change is the signature of a cache problem rather than a capacity one. The first thing to check is where `COPY . .` sits: if it appears before the dependency install, then any change to any file invalidates the install, and there is no ordering of your source edits that avoids it. The fix is to copy the manifest alone, install, then copy the source. The second thing is whether there is a cache at all — a CI runner is usually fresh, so unless the build exports and imports a cache (`--cache-from` and `--cache-to` pointing at the registry or the CI's own cache backend), every run starts cold and the layer ordering is irrelevant because nothing is ever reused. The third is the build context: a missing `.dockerignore` means the whole `.git` directory is uploaded before the build even starts, which also makes `COPY . .` hash a moving target. In my experience those three account for nearly all of it, and I would only look at bigger runners once they were ruled out — more CPU makes a badly ordered build slightly less slow at permanent extra cost.

**Measure the cache, then fix the order**

```bash
# BuildKit prints CACHED for every reused layer. Count them.
docker build -t myapp . 2>&1 | grep -cE '^#[0-9]+ CACHED'

# Which step is expensive? --progress=plain shows per-step timing.
docker build --progress=plain --no-cache -t myapp . 2>&1 \
  | grep -E '^#[0-9]+ DONE' | sort -t' ' -k3 -rn | head

# How big is the build context you are uploading before anything runs?
du -sh . && cat .dockerignore
# "transferring context: 412.83MB" in the output = a missing .dockerignore

# Share the cache between CI runners by pushing it to the registry.
docker buildx build \
  --cache-from type=registry,ref=ghcr.io/acme/myapp:buildcache \
  --cache-to   type=registry,ref=ghcr.io/acme/myapp:buildcache,mode=max \
  -t ghcr.io/acme/myapp:"$GIT_SHA" --push .
```

```yaml
# The same idea in a workflow. GitHub's cache backend needs no registry.
- uses: docker/setup-buildx-action@v3
- uses: docker/build-push-action@v6
  with:
    push: true
    tags: ghcr.io/acme/myapp:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max      # mode=max caches intermediate stages
                                     # too - important for multi-stage builds

# For dependency caches OUTSIDE the image, key on content, never on the
# branch name: a branch key hits across unrelated dependency changes and
# misses entirely for every new branch.
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: pip-${{ runner.os }}-${{ hashFiles('**/requirements.lock') }}
    restore-keys: pip-${{ runner.os }}-
```

> **Warning**
>
> **Cleaning up in a later `RUN` saves nothing.** `RUN apt-get install …` followed by `RUN rm -rf /var/lib/apt/lists/*` produces two layers: one containing the files and one containing a marker that hides them. The image still carries the bytes. Install and clean in a single `RUN`, joined with `&&`, or the cleanup is theatre.

<a id="5-multi-stage"></a>

### 5. Multi-Stage Builds & Small Images

- **Typical saving** `5–10×`
- **Build tools** `left behind`
- **distroless** `no shell`

A multi-stage build lets you compile in one image and ship another. The build stage can contain a compiler, development headers, test dependencies and build-time credentials; the final stage contains only what runs. You get three benefits at once and they compound: faster pulls on every deploy and every scale-up, a much shorter vulnerability report, and a container that is a far worse place for an attacker to land because there is no compiler and no package manager in it.

> **Interactive animation:** `multi-stage` — rendered by the page script in the HTML version.

- **Strength — the guarantee is structural** Build-time material cannot reach production by accident, because the final stage starts from a clean base and you name exactly what crosses. That is stronger than remembering to delete things.
- **Weakness — a tiny image is harder to debug** Distroless has no shell, so `docker exec … sh` fails and so does `kubectl exec -it … -- bash`. Keep a `:debug` variant of the same image, or use ephemeral debug containers that attach a toolbox alongside.

**Interview question**

*How do you get a 1.2 GB Node image down to something reasonable, and how do you know where the weight is?*

I would measure before changing anything, because the intuition is often wrong. `docker history` shows the size contributed by each layer, which maps directly back to a line in the Dockerfile, and `dive` shows what is actually inside each one — that is usually the moment someone discovers that the `.git` directory is in there. Then there are three fixes in decreasing order of size. Multi-stage is the big one: build with `npm ci` including devDependencies, then start a fresh stage and copy only `dist` and the production dependencies across, which typically removes half a gigabyte of compiler and cache. Second, choose a smaller base — `node:20-slim` instead of `node:20` is 260 MB for a one-word change, and distroless is smaller again if I can live without a shell. Third, add a `.dockerignore`, which stops `.git`, `node_modules` and local `.env` files from being copied in at all. What I would *not* do is chase the last few megabytes by combining every `RUN` into one line: it hurts the layer cache, which costs developer time on every single build, and the trade is a bad one below about a hundred megabytes.

**Find the weight, then remove it**

```bash
# Which instruction added the megabytes?
docker history --human --format 'table {{.Size}}\t{{.CreatedBy}}' myapp:v1 \
  | head -20

# What is actually inside each layer, and what is wasted?
dive myapp:v1            # shows duplicated files and "efficiency score"

# Compare bases before committing to one.
for b in node:20 node:20-slim node:20-alpine \
         gcr.io/distroless/nodejs20-debian12; do
  docker pull -q "$b" >/dev/null
  printf '%-42s %s\n' "$b" "$(docker image inspect "$b" \
    --format '{{.Size}}' | numfmt --to=iec)"
done

# Prove the final image has no build tooling left in it.
docker run --rm myapp:v2 sh -c 'command -v gcc npm git || echo "clean"'
```

```bash
# The Go / Rust extreme: a static binary needs no operating system at all.
FROM golang:1.23 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download                      # cached unless go.sum changes
COPY . .
RUN CGO_ENABLED=0 go build -ldflags='-s -w' -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
# Final image: ~12 MB. No shell, no package manager, no libc, nothing to
# exploit that is not your own binary - and nothing to debug with either,
# which is the trade you are making.
```

> **Tip**
>
> You can build only part of a multi-stage file with `--target`. That is how one Dockerfile serves both environments: `--target build` gives development a stage that still has the toolchain and the test dependencies, while the default final stage is what ships. A Compose file for local work simply sets `target: build`.

<a id="6-dependencies"></a>

### 6. Dependencies, Lockfiles & Build Secrets

- **Manifest** `a range`
- **Lockfile** `exact + hashes`
- **`ENV` secret** `permanent`
- **Secret mount** `leaves nothing`

A build is only reproducible if its inputs are. The **manifest** (`package.json`, `pyproject.toml`) records your intent — usually a range like `^4.17.0`. The **lockfile** records the resolution: the exact version and hash of every package in the transitive graph. Commit the lockfile and install from it, or two builds of the same commit will contain different code and every test result becomes an opinion about a program you did not ship.

The second half of this section is the one that causes real incidents. A private package index, a licence key, a token for a protected artifact — these are needed *during* the build and must not survive it. `ENV` keeps the value in the image configuration permanently. `ARG` does not persist as an environment variable but is recorded in the build history, which `docker history` prints without pulling the layers at all. And deleting the file in a later layer does nothing, because layers are append-only.

> **Analogy** 🧾
>
> **Picture it — a receipt you cannot shred**
>
> Imagine every step of assembling a product is photographed and the photographs are shipped inside the box. If you held up a password at step three, then crossing it out at step seven does not help — the photograph from step three is still in the box, and anyone who opens it can read it. That is a container image: an append-only record of how it was made, distributed to everyone who pulls it. The only safe approach is not to hold the password up in the first place, which is exactly what a secret mount does.

**Pin the inputs, and keep the credential out of the image**

```bash
# syntax=docker/dockerfile:1.7        <- required for the mounts below

FROM python:3.12-slim@sha256:2f9a3c... AS build
WORKDIR /app

COPY requirements.lock .

# --mount=type=cache keeps the wheel cache OUTSIDE the layer: fast rebuilds
# without shipping the cache. --require-hashes refuses to install anything
# not pinned by hash, turning a supply-chain surprise into a build failure.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --require-hashes --prefix=/install -r requirements.lock

# A private index needs a token. --mount=type=secret exposes it to THIS
# command only; it is never written to a layer or to the build history.
RUN --mount=type=secret,id=index_token \
    PIP_INDEX_URL="https://$(cat /run/secrets/index_token)@pypi.acme.dev" \
    pip install --prefix=/install acme-internal==2.1.0

# ---- and how you pass it in ----
#   docker build --secret id=index_token,env=INDEX_TOKEN .
#   docker build --secret id=index_token,src=./token.txt .

# Verify nothing leaked - this prints the build history WITHOUT pulling:
#   docker history --no-trunc myapp | grep -i -E 'token|secret|password'
```

```bash
# Generate a lockfile with hashes from a loose manifest.
pip-compile --generate-hashes --output-file requirements.lock requirements.in

# Install from the lock in CI - never let the install re-resolve.
pip install --require-hashes -r requirements.lock   # Python
npm ci                                              # Node: fails if lock
                                                    # and manifest disagree
go mod download && go mod verify                    # Go: checks go.sum

# What is in the graph, and who pulled it in?
pipdeptree --reverse --packages urllib3
npm ls lodash --all

# THE ANTI-PATTERNS, for completeness:
#   ENV NPM_TOKEN=...          -> in the image config, forever
#   ARG NPM_TOKEN              -> in docker history, readable without a pull
#   COPY .npmrc . && RUN ... && RUN rm .npmrc
#                              -> the bytes are still in the earlier layer
```

- **Strength — a locked build is a build you can reason about** Same commit, same bytes. That is what makes "it passed CI" a statement about the artifact you are about to run rather than about a similar one.
- **Weakness — pinning without updating is its own risk** A lockfile guarantees you install the same thing every time, including the same known-vulnerable version. Pair it with automated weekly updates, batched so that review is possible.

> **Warning**
>
> **Check your images for leaked build secrets today, not eventually.** `docker history --no-trunc <image>` prints every build instruction and requires only pull access — no layer download. If a token appears there, it is compromised: revoke it first, then fix the Dockerfile. Rewriting or deleting the image does not help, because anyone who pulled it already has the bytes.

<a id="unit-3"></a>

## Unit 3 — Running It on Your Machine

The image is built. Now five things that decide whether working inside containers is pleasant or miserable: reaching your app, keeping your data, starting the dependencies, splitting into several services, and stopping cleanly.

<a id="7-ports"></a>

### 7. Ports & Talking to Other Containers

- **`-p`** `host:container`
- **`EXPOSE`** `documentation only`
- **`localhost`** `is the container`
- **Container to container** `by name`

Each container gets its own **network namespace**: its own interfaces, its own routing table and its own port space. That is why a service listening on port 5000 inside a container is not on your machine's port 5000, and why the first thing everyone does is get a connection refused on an application that is running perfectly.

> **Analogy** 🏢
>
> **Picture it — extensions in an office building**
>
> Every office has an internal phone system, and every one of them has an extension 200. Dialling 200 from inside an office reaches that office's own extension — never the one next door, never the street. To be reachable from outside, the building's switchboard must publish an external number that forwards to your extension. `-p 8080:5000` is exactly that forwarding rule, and `localhost` is exactly "dial 200 from where I am standing".

> **Interactive animation:** `port-mapping` — rendered by the page script in the HTML version.

- **Strength — ports stop colliding** Five services can all listen on 8080 internally and be published on five different host ports, or on none at all. You never again edit a config file because two projects both wanted 3000.
- **Weakness — the indirection is invisible in error messages** `ECONNREFUSED 127.0.0.1:5432` looks identical whether the database is down or simply in a different namespace, and the second is far more likely. Check *where* before checking *whether*.

**Interview question**

*Your API container cannot reach the database container. Both are running. How do you find the problem?*

I would work outwards from the API container rather than guessing, because there are only about four possible causes and each is one command away. First, what address is it using? If the connection string says `localhost` or `127.0.0.1`, that is the answer immediately — inside the container, that loopback is the container's own, and it should be the other container's service name. Second, does that name resolve? `docker compose exec api getent hosts db` answers it; if it does not resolve, the two containers are not on the same user-defined network, which also happens when someone runs one of them outside Compose. Third, is anything listening on the port I am dialling? A quick `nc -zv db 5432` from inside separates "name resolves but nothing is there" from "cannot resolve", and the former is usually the wrong port or a database that binds only to its own loopback. Fourth — and this is the one that catches people in CI — the database may still be starting: the container is *running* but Postgres has not opened its socket yet, which is the healthcheck problem in the next-but-one section. Notice that the host's published ports are irrelevant to all of this; container-to-container traffic never goes through them.

**Four checks, from inside the container**

```bash
# 1. What is the app actually dialling?
docker compose exec api printenv DATABASE_URL
# postgres://app@localhost:5432/app     <- found it: localhost is wrong

# 2. Does the service name resolve on the shared network?
docker compose exec api getent hosts db
# 172.19.0.3   db

# 3. Is something listening there?
docker compose exec api nc -zv db 5432
# db (172.19.0.3:5432) open

# 4. Which network is each container on? They must share one.
docker inspect -f '{{.Name}} {{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' \
  $(docker ps -q)

# Bonus: is the service bound to the right interface INSIDE its container?
docker compose exec db ss -tlnp
# LISTEN 0.0.0.0:5432   good
# LISTEN 127.0.0.1:5432 bad - only reachable from inside that container
```

```yaml
services:
  api:
    build: .
    environment:
      # The SERVICE NAME, not localhost. Compose's embedded DNS resolves it
      # to whatever IP the db container currently has.
      DATABASE_URL: postgres://app:app@db:5432/app
    ports:
      - "8080:8080"        # published ONLY because a browser needs it

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    # No "ports:" at all. The API reaches it on the project network at
    # db:5432. Publishing 5432 to the host is a habit worth dropping - it
    # collides with a local Postgres and exposes the database to your LAN.
    # If you want a GUI client, publish it deliberately:
    #   ports: ["127.0.0.1:5433:5432"]   <- bind to loopback, not 0.0.0.0
```

> **Warning**
>
> **Your application must bind to `0.0.0.0`, not to `127.0.0.1`.** Many frameworks default to loopback for safety, which inside a container means "reachable only from this container" — so the port mapping is correct, the process is running, and the connection is still refused. In Flask that is `--host=0.0.0.0`; in Node it is the address argument to `listen`. It is the single most common "my container does not work" cause after `localhost` itself.

<a id="8-volumes"></a>

### 8. Volumes — Where Your Data Lives

- **Named volume** `survives`
- **Bind mount** `dev only`
- **Writable layer** `lost on replace`
- **`down -v`** `deletes volumes`

There are exactly three places a container can write, and choosing the wrong one is behind most of the confusing behaviour people hit in their first month. The **writable layer** is the default and dies with the container. A **named volume** is managed by the runtime and outlives the container. A **bind mount** is a host directory grafted into the container, which is how live-reload development works and is tied to one machine's filesystem.

> **Interactive animation:** `volumes` — rendered by the page script in the HTML version.

- **Strength — state becomes an explicit decision** Because the default is "everything is lost", you are forced to say what matters. Teams that internalise this write services that survive being restarted, which is the same property that makes rolling deploys possible.
- **Weakness — a bind mount hides what was underneath** Mounting your project over `/app` also replaces the dependencies installed during the build with whatever is on your laptop — compiled for the wrong platform. Mask the dependency directory with an anonymous volume.

**Interview question**

*A developer says "my local database resets every time I rebuild, but only sometimes". What is happening?*

Two different things are being conflated, and separating them is the answer. If there is no volume at all, the database lives in the container's writable layer, so it is lost whenever the container is *replaced* — and `compose up --build` replaces it while a plain `compose restart` does not. That explains the "only sometimes": the data survives the operations that keep the container and vanishes on the ones that recreate it, which from the outside looks random. The second cause, if there *is* a named volume, is `docker compose down -v` — the `-v` deletes named volumes, and it is often in a Makefile target or a shell alias someone added months ago to "clean up". I would check `docker volume ls` before and after the operation to see which of the two it is. The fix for the first is a named volume on the data directory; the fix for the second is to stop passing `-v` by reflex and to have a separate, obviously-named command for deliberately starting from a clean database.

**Inspect, back up and restore a volume**

```bash
docker volume ls
docker volume inspect myproject_pgdata     # where it lives, when it was made

# Which containers are using it? (Deleting a volume in use is refused.)
docker ps -a --filter volume=myproject_pgdata

# Back up a named volume: mount it into a throwaway container and tar it.
docker run --rm \
  -v myproject_pgdata:/data:ro \
  -v "$PWD":/backup \
  alpine tar czf /backup/pgdata-$(date +%F).tgz -C /data .

# Restore into a fresh volume.
docker run --rm \
  -v myproject_pgdata:/data \
  -v "$PWD":/backup \
  alpine sh -c 'rm -rf /data/* && tar xzf /backup/pgdata-2026-09-10.tgz -C /data'

# Reclaim space - note that "prune" only removes UNUSED volumes.
docker system df -v | head -30
docker volume prune                        # asks first; -f skips the prompt
```

```yaml
services:
  api:
    build:
      context: .
      target: build            # dev uses the stage that still has the tools
    volumes:
      - ./src:/app/src         # bind mount: edit on the host, run in here
      - /app/.venv             # anonymous volume MASKS the host directory,
                               # so the container keeps its own Linux-built
                               # dependencies instead of your macOS ones
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data      # named: survives compose down
      - ./seed.sql:/docker-entrypoint-initdb.d/seed.sql:ro   # read-only

volumes:
  pgdata:                      # declared here, managed by Docker
```

> **Key idea**
>
> **The rule that generalises to production:** a container should be safe to delete at any instant. Code and dependencies go in the image; anything durable goes in a volume, a database or object storage; logs go to stdout. Once that holds, restarts, rebuilds, rollbacks and scaling all become uninteresting operations — which is the entire point.

<a id="9-compose"></a>

### 9. Compose — Your App Plus Its Real Dependencies

- **Goal** `one command to run`
- **`depends_on`** `order, not readiness`
- **Fix** `+ healthcheck`

Compose describes a set of containers, a network and some volumes in one file. Its value for a developer is narrow and large: **one command produces a working system**, with the real database and the real message broker rather than mocks, and a new colleague is productive in minutes rather than after a page of setup instructions.

The trap is `depends_on`. It reads like "wait until the database is ready" and it means "start the database's container first" — which is roughly a hundred milliseconds of head start against a database that needs several seconds to accept connections.

> **Interactive animation:** `compose-up` — rendered by the page script in the HTML version.

- **Strength — parity with production where it matters** The same image, the same database engine and version, the same environment variable names. What it cannot give you is orchestration behaviour — probes, resource limits, rolling updates — so those bugs are only findable in a real cluster.
- **Weakness — the file rots quietly** A service is added to production and not to Compose, a version diverges, a seed script stops matching the schema. Running `compose up` in CI on a schedule is the cheapest way to notice before a new joiner does.

**Interview question**

*Your service works locally but fails in CI with a connection error on start-up, roughly one run in four. Why, and what is the right fix?*

That ratio is the signature of a start-up race rather than a configuration problem — a genuine misconfiguration fails every time. What is happening is that the application starts before its dependency is accepting connections. Locally it passes because the database container layer is warm and Postgres initialises in under a second; on a cold CI runner the image is freshly pulled and initialisation takes four or five, so the application wins the race and exits. There are two fixes and I would do both, because they solve different problems. The immediate one is a `healthcheck` on the dependency plus `condition: service_healthy` on `depends_on`, which makes Compose actually wait for readiness rather than for the container to exist. The durable one is in the application: retry the initial connection with backoff and fail your readiness endpoint until it succeeds. That second fix matters more than it looks, because Kubernetes has no `depends_on` at all — a service that only works when things start in the right order will fail the first time a database is restarted underneath it in production.

**Wait for readiness, and tolerate its absence anyway**

```yaml
services:
  api:
    build: .
    ports: ["8080:8080"]
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      db:
        condition: service_healthy      # waits for the CHECK, not the process
      cache:
        condition: service_started      # redis is fast; ordering is enough
    develop:
      watch:                            # rebuild/sync on file change
        - { action: sync, path: ./src, target: /app/src }
        - { action: rebuild, path: requirements.lock }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 2s
      timeout: 3s
      retries: 15
      start_period: 5s                  # failures here do not count yet
    volumes: [pgdata:/var/lib/postgresql/data]

  cache:
    image: redis:7-alpine

volumes:
  pgdata:
```

```python
"""Connect with backoff and gate readiness on it.

This is the half that survives into production, where nothing waits for
your dependencies on your behalf.
"""
import time, logging
import psycopg

log = logging.getLogger("api")
ready = False

def connect_with_backoff(url: str, attempts: int = 10):
    delay = 0.25
    for attempt in range(1, attempts + 1):
        try:
            return psycopg.connect(url, connect_timeout=3)
        except psycopg.OperationalError as exc:
            if attempt == attempts:
                raise
            log.warning("db not ready (attempt %d/%d): %s", attempt, attempts, exc)
            time.sleep(delay)
            delay = min(delay * 2, 5)      # exponential, capped

def startup():
    global ready
    app.db = connect_with_backoff(os.environ["DATABASE_URL"])
    ready = True                            # only now do we accept traffic

def readyz():
    # The container being up is not the same as the service being usable.
    return (200, "ok") if ready else (503, "starting")
```

> **Tip**
>
> Keep **one** `compose.yaml` and layer environment-specific overrides on top with `compose.override.yaml` (applied automatically) or `-f compose.yaml -f compose.ci.yaml`. Two full copies of the file drift within weeks, and the drift is always discovered by whoever is trying to reproduce a CI failure locally.

<a id="10-microservices"></a>

### 10. Microservices — Many Containers, One System

- **Unit of deploy** `one image per service`
- **They find each other** `by service name`
- **Shared database** `not microservices`
- **New cost** `the network`

Containers made microservices practical, which is why the two words are so often used together — and why so many teams end up with the costs of a distributed system and none of the benefits. The mechanical part is genuinely easy and you have already seen all of it: one image per service, one container each, one user-defined network, and they call each other by name. The hard part is not mechanical at all.

Start from what actually changes. In a single process, a call from the order module to the payment module is a function call: it cannot half-succeed, it cannot time out, and the compiler checks it. Move payments into its own container and that same call becomes a network request that can be slow, can be retried into a duplicate charge, and whose contract is now a convention rather than a type. **You have converted a compile-time problem into a run-time one**, and everything below is the consequence of that trade.

> **Analogy** 🍽️
>
> **Picture it — one kitchen or several restaurants**
>
> One kitchen: the chef shouts to the pastry section and gets an answer immediately. Everyone shares an order book, a fridge and a rota. It is efficient and it does not scale past a certain size, because eventually nobody can move without colliding. Several restaurants: each has its own kitchen, its own suppliers and its own opening hours, and any of them can be refurbished without closing the others. But now the pastry order goes by courier — it can arrive late, arrive twice, or not arrive — and "is the dessert ready?" is no longer a question you can simply shout. That courier is your network, and pretending it is reliable is the single most expensive mistake in this model.

> **Interactive animation:** `service-topology` — rendered by the page script in the HTML version.

The packaging rules follow directly, and they are the part Docker is responsible for. **One service, one image, one repository of truth for its dependencies.** Do not build a single image containing three services selected by an environment variable — that image cannot be deployed or rolled back per service, which removes the only reason you split them. And each service gets its own configuration through its own environment variables, so that the same image runs unchanged in every environment.

- **Strength — independent deployability is the whole point** If a change to search can be built, tested, released and rolled back without coordinating with anyone, the split has paid for itself. That is the property to test a proposed boundary against, and it is the only one that matters.
- **Weakness — a shared database undoes all of it** If two services write the same tables, they cannot change schema independently, cannot be released independently and cannot fail independently. That is a *distributed monolith*: every cost of both models and the benefits of neither.

**Interview question**

*A team wants to break their application into eight services because "it will scale better". What questions do you ask, and what would you actually recommend?*

My first question is what "scale" means here, because the word covers two completely different problems and only one of them is solved by splitting. If they mean *load*, then a monolith scales horizontally perfectly well — you run ten copies behind a load balancer, and the constraint is almost always the database rather than the application tier, which splitting does not fix and often makes worse. If they mean *people* — teams blocking each other on releases, a merge queue that is permanently full, one team's bug delaying another's launch — then service boundaries genuinely help, and the boundary should follow the team boundary rather than a diagram of nouns. So I would ask: are you currently blocked on each other, does any part of the system need to scale differently from the rest, and does any part have a different availability requirement. If the answer to all three is no, I would recommend staying with one deployable and investing in modular boundaries inside it — separate modules, no cross-module database access, an explicit interface between them. That is nearly all of the benefit and none of the network. And I would name the costs plainly, because they are usually invisible in the proposal: eight pipelines, eight images, eight sets of dashboards and alerts, distributed tracing becoming mandatory rather than nice, a local development story that no longer fits on a laptop, and every cross-service call needing timeouts, retries and an answer to "what do we do when it is down". Eight services is a reasonable destination and a terrible starting point — and the modular monolith is the thing that makes the eventual split cheap, because the seams are already there.

**Several services, one file, and the profiles that keep it usable**

```yaml
# compose.yaml — the whole system, with profiles so nobody has to run it all.
services:
  web:
    build: ./services/web          # its OWN Dockerfile
    ports: ["8080:8080"]           # the only service the browser reaches
    environment:
      # Service names, never localhost, never an IP. The embedded DNS on
      # the project network resolves these.
      ORDERS_URL: http://orders:8080
      REQUEST_TIMEOUT_MS: "2000"   # ALWAYS set a timeout - a missing one is
                                   # how one slow service stops the whole system
    depends_on:
      orders: { condition: service_started }

  orders:
    build: ./services/orders
    environment:
      PAYMENTS_URL: http://payments:8080
      REQUEST_TIMEOUT_MS: "1000"   # shorter than the caller's, deliberately
      DATABASE_URL: postgres://orders:orders@orders-db:5432/orders
    depends_on:
      orders-db: { condition: service_healthy }

  payments:
    build: ./services/payments
    profiles: ["full"]             # not started by default
    environment:
      DATABASE_URL: postgres://pay:pay@payments-db:5432/payments

  # ONE DATABASE PER SERVICE. A shared database is the line between
  # "microservices" and "a distributed monolith".
  orders-db:
    image: postgres:16-alpine
    environment: { POSTGRES_USER: orders, POSTGRES_PASSWORD: orders }
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orders"]
      interval: 2s
      retries: 15
    volumes: [orders-data:/var/lib/postgresql/data]

  payments-db:
    image: postgres:16-alpine
    profiles: ["full"]
    environment: { POSTGRES_USER: pay, POSTGRES_PASSWORD: pay }
    volumes: [payments-data:/var/lib/postgresql/data]

volumes:
  orders-data:
  payments-data:
```

```bash
# Start only what you are changing; point the rest at a shared environment.
docker compose up -d                      # web + orders + orders-db
docker compose --profile full up -d       # everything, when you need it

# One repository or several? Either works; keep the Dockerfiles per service.
#   monorepo:  services/web/Dockerfile, services/orders/Dockerfile, ...
#              build only what changed, using path filters in CI
#   polyrepo:  one repo per service, one pipeline each, shared templates

# Build and tag each service independently - this is the point of the split.
for svc in web orders payments; do
  docker build -t "ghcr.io/acme/$svc:$GIT_SHA" "./services/$svc"
done

# Verify they talk over the project network by NAME, not by published port.
docker compose exec web getent hosts orders
docker compose exec web curl -m 2 -s http://orders:8080/readyz

# The check that catches a distributed monolith early: does any service
# connect to another service's database?
grep -rn 'DATABASE_URL' services/*/  | sort
# each service must point at its OWN database, or you have not split anything
```

> **Warning**
>
> **Every cross-service call needs a timeout, and most HTTP clients do not have one by default.** Without it, one slow service occupies every worker in its callers, and the callers' callers, until the whole system stops responding — with nothing crashed and every health check green. Set a timeout on every call, make the inner one shorter than the outer one, and only retry operations that are safe to run twice. The [Kubernetes crash course](../kubernetes/kubernetes-crash-course.html#9-microservices) walks through this failure and the three patterns that contain it.

> **Key idea**
>
> **The test for a good boundary is deployability, not tidiness.** If two services must be released together, share a database, or break each other when either changes shape, they are one service that has been given a network in the middle. Splitting is cheap to do and expensive to undo — so split along seams that already exist in your teams and your data, and leave everything else in one deployable until it hurts.

<a id="11-signals"></a>

### 11. Signals, PID 1 & Graceful Shutdown

- **`docker stop`** `SIGTERM, then 10 s`
- **Then** `SIGKILL`
- **Shell form** `swallows signals`
- **Exec form** `your app is PID 1`

Stopping a container is a two-step conversation. The runtime sends `SIGTERM` and waits ten seconds; if the process is still alive it sends `SIGKILL`, which cannot be caught, blocked or handled. Whether you get a clean shutdown or a killed process comes down to one question: **does the signal reach your code?**

It very often does not, because of a syntax detail. `CMD python app.py` — shell form — is rewritten to `/bin/sh -c "python app.py"`, making the shell PID 1 and your application its child. A plain `sh` running one command does not forward signals, so your handler never runs, every stop takes the full ten seconds, and every deploy drops the requests that were in flight.

> **Interactive animation:** `signals-pid1` — rendered by the page script in the HTML version.

- **Strength — the fix is one line and it pays off in production** Exec form plus a `SIGTERM` handler is what makes a rolling deploy invisible to users. The same code path is exercised on every single deploy, so it is well tested by accident.
- **Weakness — PID 1 has no default handlers and no reaper** Signals with default actions are ignored for PID 1, and orphaned grandchildren become zombies that nothing cleans up. If your process spawns children, add an init: `docker run --init`, or `tini` as the entrypoint.

**Interview question**

*Every deploy produces a small spike of 502s, and `docker stop` always takes exactly ten seconds. What is the connection?*

They are the same bug seen from two angles. Exactly ten seconds is the default grace period, and hitting it precisely every time means the process is never exiting voluntarily — it is being `SIGKILL`ed at the deadline. So `SIGTERM` is either not reaching the application or not being handled, and the usual cause is shell form making `/bin/sh` PID 1. I would confirm with `docker exec <c> ps -o pid,cmd` and by checking whether the exit code is 137. The 502s follow directly: because the process is killed rather than drained, every request in flight at that moment is severed, and a deploy that replaces several containers severs a batch each time. The fix has two parts. Switch to exec form so the signal arrives, and add a handler that stops accepting new connections, finishes what is in flight and then exits — which typically takes a second or two rather than ten. The subtle third part, which matters more once you are on an orchestrator, is to delay the shutdown slightly: removal from the load balancer and the `SIGTERM` happen concurrently, so a short sleep before you stop listening prevents requests that were already routed to you from arriving at a closed socket.

**Handle the signal, drain, then exit**

```python
import signal, threading, sys, time

draining = threading.Event()

def handle_sigterm(signum, frame):
    # 1. Fail readiness FIRST so the load balancer stops sending new work.
    draining.set()

    # 2. Keep serving for a moment: endpoint removal is not instantaneous,
    #    and requests already routed to us are still arriving.
    time.sleep(5)

    # 3. Stop accepting, finish in-flight work, close resources, exit 0.
    server.shutdown(graceful_timeout=20)
    db.close()
    sys.exit(0)

signal.signal(signal.SIGTERM, handle_sigterm)
signal.signal(signal.SIGINT, handle_sigterm)     # Ctrl-C locally

def readyz():
    return (503, "draining") if draining.is_set() else (200, "ok")

# Set the grace period ABOVE your longest request, or the runtime will
# SIGKILL you mid-drain and you are back where you started:
#   docker run --stop-timeout 45 ...
#   compose:    stop_grace_period: 45s
```

```bash
# Who is PID 1? This one command decides whether you have the bug.
docker exec api ps -o pid,ppid,cmd
#   PID  PPID CMD
#     1     0 /bin/sh -c python app.py      <- BAD: shell swallows SIGTERM
#     7     1 python app.py

#     1     0 python app.py                 <- GOOD: exec form

# Prove it: time the stop and read the exit code.
time docker stop api
docker inspect api --format '{{.State.ExitCode}}'
# 137 (128+9 SIGKILL) after ~10s  -> the signal never reached your handler
# 0   after ~1s                   -> handled correctly

# If your entrypoint must be a script, end it with exec:
#   #!/bin/sh
#   set -e
#   ./manage.py migrate
#   exec python app.py       <- replaces the shell; same PID; signals arrive

# If your process spawns children, give it a real init to reap them:
docker run --init myapp
```

> **Warning**
>
> **Increase the grace period if your requests are long.** The default ten seconds is a *deadline*, not a suggestion — a report that takes thirty seconds to generate will be killed at ten however well you handle the signal. Set `stop_grace_period` in Compose or `terminationGracePeriodSeconds` in Kubernetes to comfortably exceed your longest request, and make sure your drain finishes before it.

<a id="unit-4"></a>

## Unit 4 — Shipping It

Three sections on what happens after it works on your machine: how the image gets somewhere else, what to do when it will not start there, and the short list that separates a demo image from one you would run in production.

<a id="12-registries"></a>

### 12. Registries, Tags & Digests

- **Push uploads** `only new layers`
- **Tag** `mutable pointer`
- **Digest** `immutable`
- **`latest`** `not a version`

A registry stores **manifests** and **blobs**. A manifest is a small JSON document listing the config and the layers, each by digest; the image digest is the hash of that manifest. Because layers are content-addressed, a push uploads only the digests the registry does not already have — which is why the first push of an image is slow and every subsequent one moves a few megabytes.

> **Interactive animation:** `registry-push` — rendered by the page script in the HTML version.

- **Strength — the digest is a fact** "What is running in production?" has exactly one answer when the deployment references `myapp@sha256:9f2c…`, and rollback becomes "deploy the previous digest", which is always available because it is still in the registry.
- **Weakness — tags invite the opposite** `latest` is not a version, it is the tag applied when you give none. Two containers started an hour apart can be on different code with the same tag, and nothing anywhere will tell you.

**Interview question**

*A teammate's Mac-built image crashes immediately on the Linux server with `exec format error`. What happened?*

They built for the wrong CPU architecture. An Apple Silicon Mac builds `linux/arm64` by default, and the server is `linux/amd64`, so the kernel is handed a binary it cannot execute — `exec format error` is exactly that message, and the exit code is usually 127. It surprises people because the image pulled and started, so it feels like a runtime bug rather than a packaging one. There are two fixes and the second is the real one. Quickly, `docker build --platform linux/amd64` produces the right single-architecture image, at the cost of emulation and a much slower build. Properly, publish a `buildx` multi-architecture image: one manifest list covering both platforms, so the Mac and the server each pull the variant that suits them and nobody has to remember a flag. I would also add a check to the pipeline — `docker manifest inspect` or `crane` can assert that the published image contains the platforms you expect, which turns this from a production surprise into a build failure.

**Build for the right platforms, and prove it**

```bash
# What architectures does this image actually contain?
docker buildx imagetools inspect ghcr.io/acme/api:v1.9.0 --raw \
  | jq -r '.manifests[] | "\(.platform.os)/\(.platform.architecture)"'
# linux/amd64
# linux/arm64

# Build both at once and push a manifest list.
docker buildx create --use --name multi 2>/dev/null || true
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/acme/api:"$GIT_SHA" --push .

# Capture the immutable digest of what you just pushed.
DIGEST=$(docker buildx imagetools inspect ghcr.io/acme/api:"$GIT_SHA" \
           --format '{{.Manifest.Digest}}')
echo "$DIGEST"       # sha256:9f2c1ab...

# Promotion is a retag of the SAME manifest - never a rebuild.
docker buildx imagetools create -t ghcr.io/acme/api:prod \
  "ghcr.io/acme/api@$DIGEST"

# Gate the pipeline on it.
docker buildx imagetools inspect ghcr.io/acme/api:"$GIT_SHA" --raw \
  | jq -e '[.manifests[].platform.architecture] | contains(["amd64"])' \
  || { echo "missing amd64 build"; exit 1; }
```

```yaml
# The pipeline writes the digest; the deployment reads it.
- uses: docker/setup-qemu-action@v3        # emulation for cross-building
- uses: docker/setup-buildx-action@v3
- id: build
  uses: docker/build-push-action@v6
  with:
    push: true
    platforms: linux/amd64,linux/arm64
    tags: |
      ghcr.io/acme/api:${{ github.sha }}
      ghcr.io/acme/api:v1.9.0
    cache-from: type=gha
    cache-to: type=gha,mode=max
    provenance: true                       # who built it, from what

- name: Record the digest for the deploy step
  run: echo "IMAGE=ghcr.io/acme/api@${{ steps.build.outputs.digest }}" >> "$GITHUB_ENV"
```

> **Key idea**
>
> **Tag for humans, deploy by digest.** Apply three tags to every build — the commit SHA, a semantic version on releases, and a moving alias like `prod` — but let the manifest that actually runs reference `@sha256:…`. It makes `imagePullPolicy: IfNotPresent` correct and fast, it makes rollback trivial, and it means a restart during an incident can never quietly upgrade you.

<a id="13-debugging"></a>

### 13. Debugging a Container That Will Not Start

- **137** `OOM killed`
- **127** `command not found`
- **139** `segfault`
- **143** `terminated`

The instinct when a container will not start is to edit the Dockerfile and rebuild. Resist it for ninety seconds: the exit code and the logs almost always name the problem, and rebuilding blind turns a two-minute diagnosis into an afternoon.

> **Interactive animation:** `debug-container` — rendered by the page script in the HTML version.

| Exit code | Means | Usual cause |
| --- | --- | --- |
| `0` | Finished normally | Your process was not meant to be long-running — e.g. a shell with no TTY |
| `1` | Application error | Missing environment variable, unreachable dependency — read the traceback |
| `126` | Found but not executable | Missing execute bit on an entrypoint script |
| `127` | Command not found | Typo, binary not in the runtime stage, or wrong CPU architecture |
| `137` | `SIGKILL` | Memory limit exceeded — no traceback, because it cannot be caught |
| `139` | `SIGSEGV` | Native module built for a different platform or libc |
| `143` | `SIGTERM` | Asked to stop and did not handle it (§11) |

**Interview question**

*A container exits immediately and `docker logs` shows nothing at all. What do you do?*

No output at all is informative, because it means the failure happened before your code printed anything — so the application is probably not the problem. My first move is to get inside the image without running its entrypoint: `docker run --rm -it --entrypoint sh myapp`. That is the fastest way to answer the questions that matter: is the file the entrypoint refers to actually there, is it executable, does the interpreter exist, and does running the command manually produce an error message. Very often it prints something immediately that the container never got to log. If the image has no shell — distroless — I would use `docker create` plus `docker cp` to extract the filesystem, or run the same command in a debug variant of the image. Two other causes worth ruling out early: buffered output, where the process did log but the buffer was never flushed because it was killed, which `PYTHONUNBUFFERED=1` or an unbuffered logger fixes; and an architecture mismatch, which produces `exec format error` on stderr and exit 127. And I would always check the exit code first, because 137 with no logs is the memory limit and no amount of looking at the entrypoint will reveal that.

**Get inside the image, not the container**

```bash
# The exit code, before anything else.
docker ps -a --filter name=api --format 'table {{.Names}}\t{{.Status}}'
docker inspect api --format '{{.State.ExitCode}} {{.State.OOMKilled}} {{.State.Error}}'

# Logs of the container that DIED (not its replacement).
docker logs --tail 100 api
docker compose logs --no-log-prefix api

# Bypass the entrypoint and look around inside the exact image.
docker run --rm -it --entrypoint sh myapp:v1
  ls -la /app
  cat /app/entrypoint.sh
  python -c 'import app'          # reproduce the import error by hand

# No shell in the image? Extract the filesystem instead.
cid=$(docker create myapp:v1) && docker cp "$cid":/app ./app-copy \
  && docker rm "$cid"

# What did the image say it would run?
docker inspect myapp:v1 --format '{{json .Config}}' \
  | jq '{Entrypoint, Cmd, WorkingDir, User, Env}'

# Attach a toolbox to a RUNNING container that has no tools of its own.
docker run --rm -it --pid=container:api --network=container:api \
  nicolaka/netshoot
```

```bash
# Symptom-driven quick reference.

# "exec format error"  -> wrong architecture
docker image inspect myapp:v1 --format '{{.Architecture}} {{.Os}}'
uname -m                          # compare with the host

# "permission denied" on an entrypoint script
docker run --rm myapp:v1 ls -l /app/entrypoint.sh
# fix in the Dockerfile: COPY --chmod=755 entrypoint.sh /app/

# Exits 0 immediately -> nothing to keep it in the foreground.
# A container lives exactly as long as PID 1. Daemonising INSIDE the
# container ends it: run in the foreground (nginx -g 'daemon off;').

# No logs, but you expect some -> buffering.
docker run --rm -e PYTHONUNBUFFERED=1 myapp:v1

# Killed under load but fine at rest -> memory.
docker stats --no-stream api
docker inspect api --format '{{.HostConfig.Memory}}'
```

> **Tip**
>
> Keep a **debug image** alongside the production one: the same Dockerfile with an extra stage that adds `curl`, `ss`, `dig` and a shell. It costs nothing because it is never deployed, and it means the answer to "the production image has no shell" is a tag change rather than a rebuild in the middle of an incident.

<a id="14-production"></a>

### 14. Making It Production-Ready

- **User** `non-root`
- **Root filesystem** `read-only`
- **Config** `injected`
- **Logs** `stdout`

Everything to this point makes the image work. This section is the short list that makes it acceptable to run somewhere you cannot log into. None of it is difficult; all of it is routinely missing, and each item removes a specific failure you would otherwise meet in production.

| Item | Why | How |
| --- | --- | --- |
| Run as non-root | A container escape lands as an unprivileged user | `USER 10001` after creating the user |
| Read-only root filesystem | Nothing can be written into the image at run time | `--read-only` plus a `tmpfs` for scratch |
| Drop capabilities | Almost no service needs any of them | `--cap-drop ALL` |
| No secrets in the image | Layers and history are readable by anyone who can pull | Environment or mounted file at run time |
| Config from the environment | One artifact must serve every environment | Read env vars, validate at start-up, exit on missing |
| Logs to stdout | Files in the writable layer die with the container | Structured JSON to stdout, no rotation of your own |
| A health endpoint | The orchestrator needs to know when you can serve | `/readyz` reflecting real readiness |
| Handle `SIGTERM` | Otherwise every deploy drops in-flight requests | Exec form plus a drain handler (§11) |
| Pin the base by digest | The same Dockerfile must produce the same image | `FROM image@sha256:…`, bumped by a bot |
| Scan before pushing | Base images age; you inherit their vulnerabilities | `trivy image --severity CRITICAL` in CI |

**The hardened run, and the CI gate**

```bash
# Everything the checklist asks for, as flags - so you can see the shape
# before it becomes YAML in an orchestrator.
docker run -d --name api \
  --user 10001:10001 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --memory 512m --cpus 1 \
  --restart unless-stopped \
  --stop-timeout 45 \
  -e DATABASE_URL \
  -e LOG_LEVEL=info \
  -p 8080:8080 \
  ghcr.io/acme/api@sha256:9f2c1ab...

# Verify the hardening actually applied.
docker exec api id                       # uid=10001 - not root
docker exec api touch /oops              # Read-only file system
docker exec api capsh --print | head -2  # no capabilities

# Scan before it ever reaches a registry.
trivy image --severity HIGH,CRITICAL --ignore-unfixed \
  --exit-code 1 ghcr.io/acme/api:"$GIT_SHA"
```

```yaml
# The same requirements expressed where they will actually live.
# Recognising this shape is most of what Kubernetes asks of you.
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    fsGroup: 10001
  containers:
    - name: api
      image: ghcr.io/acme/api@sha256:9f2c1ab...
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities: { drop: ["ALL"] }
      resources:
        requests: { cpu: 250m, memory: 512Mi }
        limits:   { memory: 512Mi }
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef: { name: api-db, key: url }
      volumeMounts:
        - { name: tmp, mountPath: /tmp }     # required with a read-only root
      readinessProbe:
        httpGet: { path: /readyz, port: 8080 }
  terminationGracePeriodSeconds: 45
  volumes:
    - name: tmp
      emptyDir: { medium: Memory, sizeLimit: 64Mi }
```

> **Warning**
>
> **A read-only root filesystem breaks anything that writes to a path you forgot about** — temporary files, a framework's cache directory, a socket. That is the point: it forces you to declare where writes happen and mount a `tmpfs` there. Turn it on in development rather than in production, so the surprises arrive while you are looking.

<a id="15-one-page"></a>

### 15. The Whole Thing on One Page

```text
Dockerfile ──build──▶ IMAGE  (read-only layers, addressed by digest)
                        │
                        ├──push──▶ registry   (only new layers move)
                        │
                        └──run───▶ CONTAINER = image
                                             + 1 writable layer
                                             + namespaces  (what it sees)
                                             + cgroups     (what it uses)

order layers by rate of change        the writable layer dies with it
   base → deps → source                 → volumes for data
                                        → stdout for logs
                                        → env vars for config
```

- **A container is a process** Namespaces limit what it sees, cgroups limit what it uses, and the kernel is the host's. Fast to start, cheap to replace, not a security boundary.
- **Layer order is a cache key** Stable things first, volatile things last, and copy the dependency manifest before the source. One line of ordering is usually the difference between a four-second and a four-minute rebuild.
- **Build fat, ship thin** Multi-stage keeps compilers, test dependencies and build secrets out of the image that runs. Smaller pull, smaller attack surface, shorter scan report.
- **Assume it will be deleted** Data in volumes or a database, logs to stdout, config from the environment. Then restart, rebuild, rollback and scale are all the same boring operation.
- **The traps** `COPY . .` above the install. Secrets in `ENV` or `ARG`. Shell-form `CMD`. Binding to `127.0.0.1`. Deploying `:latest`. `depends_on` without a healthcheck. Every one looks harmless on the day it is written.
- **The limits** Docker packages and runs *one* container. It does not give you rollouts, self-healing, service discovery across machines or autoscaling — which is what the next course is about.

**The commands worth memorising**

```bash
# ---- build ----
docker build -t app:dev .
docker build --target build -t app:test .        # stop at an earlier stage
docker buildx build --platform linux/amd64,linux/arm64 -t app:v1 --push .

# ---- run ----
docker run --rm -it -p 8080:8080 --env-file .env app:dev
docker run --rm -it --entrypoint sh app:dev      # look inside, do not start
docker compose up -d --build
docker compose down                              # -v ALSO deletes volumes

# ---- inspect ----
docker ps -a                                     # exit codes live here
docker logs -f --tail 100 api
docker exec -it api sh
docker stats --no-stream
docker history --no-trunc app:dev                # secrets hide here
docker inspect app:dev --format '{{json .Config}}' | jq

# ---- clean up ----
docker system df
docker system prune -af --filter 'until=168h'    # not volumes
docker volume prune                              # unused volumes only
```

```text
Decision table
──────────────
Where does this data go?
  needed after the container is replaced?  -> volume / database / object store
  scratch, regenerable?                    -> writable layer or tmpfs
  a log line?                              -> stdout

How do I reach it?
  from the host / a browser?               -> -p host:container
  from another container?                  -> service name on the real port
  from inside the same container?          -> localhost

Which base image?
  need a shell and apt?                    -> debian-slim
  static binary (Go, Rust)?                -> distroless/static or scratch
  smallest possible, no debugging?         -> distroless
  Alpine?                                  -> only if musl libc is fine;
                                              expect surprises with wheels,
                                              DNS resolution and native deps

What identifies this build?
  for a human reading a changelog          -> :v1.9.0
  for tracing back to a commit             -> :9f2c1ab
  for anything that deploys or verifies    -> @sha256:...
```

> **Key idea**
>
> **If you remember one sentence:** the image holds everything that should be identical everywhere, and everything that differs — config, secrets, data, scale — arrives from outside at run time. Hold that line and containers deliver what they promised; break it in one place and you are back to environments that differ in ways nobody can enumerate.

<a id="where-next"></a>

### Where to go next

1. [The Kubernetes crash course](../kubernetes/kubernetes-crash-course.html) — the natural sequel, also written for developers: what happens to your container once something else is responsible for running it.
2. [The DevOps crash course](../devops/devops-crash-course.html) — where containers sit in the wider delivery loop: pipelines, deployment strategies, observability and reliability.
3. [All DevOps courses](../devops-courses.html) — the catalogue page for this topic.
4. [The Operating Systems crash course](../../os/os-crash-course.html) — namespaces, cgroups, signals and the page cache from the kernel's side, which makes container behaviour stop being surprising.
5. The *Dockerfile reference* and the *BuildKit* documentation are unusually good primary sources — particularly the pages on cache mounts, secret mounts and multi-platform builds, all of which are under-used.

---

TechToday Study Library — Docker
