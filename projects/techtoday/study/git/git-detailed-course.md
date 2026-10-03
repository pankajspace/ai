<!--
Source: git-detailed-course.html
Title: Git Detailed Course | TechToday
Description: A forty-section course on Git from first principles — the object database, trees and commits, the index, refs and reflog, diffing and archaeology, reset and revert, merge strategies and conflicts, rebase and history surgery, remotes and refspecs, tags, hooks, bisect, worktrees, submodules, LFS and partial clone, packfiles and maintenance, signing and secret scrubbing.
Theme-color: #0b0d10
Stylesheets: git-study.css, ../../site-header.css
Scripts: git-study.js
-->

Navigation: [TechToday](../../index.html) · [← Git Courses](git-courses.html)

<a id="git-detailed-course"></a>

# Git

Forty sections, built from the bottom up. We start with the four object types in `.git/objects` and never once ask you to take a command on faith — every behaviour further up the stack is derived from the storage model underneath it. The order is deliberate: nothing here depends on anything later. Processes are shown as **animations** — press **Play** and step through with the arrows — and code blocks default to the **Shell** tab, with **git config**, **YAML** and script tabs where those are the better answer.

<a id="table-of-contents"></a>

## Table of Contents

1. [What Git Is, and Why It Won](#1-what-git-is)
2. [Installing and Configuring Git](#2-configuring)
3. [The Repository on Disk](#3-repository-on-disk)
4. [Content-Addressable Storage — Blobs and Hashes](#4-content-addressing)
5. [Trees — How Git Stores Directories](#5-trees)
6. [Commits, Parents, and the DAG](#6-commits)
7. [The Three Trees in Depth](#7-three-trees)
8. [Staging — `add`, Pathspecs and `.gitignore`](#8-staging)
9. [Committing Well](#9-committing)
10. [Refs, HEAD, and Detached HEAD](#10-refs)
11. [Branches](#11-branches)
12. [Reading History with `git log`](#12-log)
13. [The Four Diffs and Range Syntax](#13-diffs)
14. [show, blame, and Archaeology](#14-archaeology)
15. [Undoing Work — `restore`, `checkout`, `clean`](#15-restore)
16. [reset in Depth](#16-reset)
17. [revert and the Safe Undo](#17-revert)
18. [Merging — Fast-Forward, Three-Way, and the Merge Base](#18-merging)
19. [Merge Conflicts](#19-conflicts)
20. [Merge Strategies and Options](#20-merge-strategies)
21. [Rebase](#21-rebase)
22. [Interactive Rebase](#22-interactive-rebase)
23. [rebase --onto and History Surgery](#23-rebase-onto)
24. [Cherry-pick and Patches](#24-cherry-pick)
25. [Stash](#25-stash)
26. [Reflog and Recovery](#26-reflog)
27. [The Remote Model](#27-remote-model)
28. [fetch, push, and Refspecs](#28-refspecs)
29. [Tracking Branches and Upstreams](#29-tracking)
30. [Tags and Releases](#30-tags)
31. [Branching Strategies and Pull Requests](#31-workflows)
32. [Hooks and Automation](#32-hooks)
33. [Bisect](#33-bisect)
34. [Worktrees](#34-worktrees)
35. [Submodules, Subtrees, and Scaling Big Repos](#35-scaling)
36. [Maintenance and Internals — gc, Packfiles, fsck](#36-maintenance)
37. [Security — Signing and Scrubbing Secrets](#37-security)
38. [Cheat Sheet](#38-cheat-sheet)
39. [Pattern-Recognition Playbook](#39-playbook)
40. [Practice Roadmap](#40-roadmap)

<a id="unit-1"></a>

## Unit 1 — Foundations & the Object Model

Git from the inside out: the repository on disk and its content-addressed objects.

<a id="1-what-git-is"></a>

## 1. What Git Is, and Why It Won

> **Key idea**
>
> New to Git, or here to fix a specific problem? Start with the [Git Crash Course](git-crash-course.html) — it covers the three trees, branches, merging, rebasing and recovery in fourteen animated sections. This page is the long form: same material, derived from the storage layer, with the edge cases left in.

Git is a **content-addressable filesystem with a version control interface written on top of it**. That phrasing is Linus Torvalds's and it is not a joke — the bottom layer is a key-value store where the key is the SHA of the value, and everything you think of as Git (branches, merges, history) is a thin set of conventions over that store. Learning Git in that order is far easier than learning it as a command list, because the commands are irregular and the storage model is not.

It was written in 2005, in about two weeks, after the Linux kernel project lost access to the proprietary system it had been using. The requirements were unusually specific and they explain almost every design decision Git made. It had to be *fast* on a project with tens of thousands of files and hundreds of contributors. It had to be *fully distributed*, because kernel development happens by email between people who do not share a server. It had to make *branching and merging cheap*, because the kernel's development model is thousands of concurrent topic branches. And it had to provide *strong integrity guarantees*, because patches arrive from strangers and the project needed to be able to prove that history had not been altered.

| Requirement | Design decision | Consequence you feel daily |
| --- | --- | --- |
| Integrity | Objects named by the hash of their content | Nothing can be edited in place; rewriting history changes every later id |
| Speed | Full local clone, snapshots not deltas | `log`, `diff`, `blame` work offline and instantly |
| Distribution | No central authority; remotes are peers | You must explicitly `fetch`; nothing is ever automatic |
| Cheap branching | A branch is a file holding one id | Branch per task is normal; merging is a first-class operation |
| Merge quality | Commits record parents, so a merge base is computable | Three-way merges that usually just work |

Two distinctions are worth fixing early because they cause persistent confusion. First, **Git is not GitHub**. Git is the version control system; GitHub, GitLab and Bitbucket are hosting products that add pull requests, permissions, issue tracking and CI — none of which are Git concepts. Pull requests do not exist in Git; a merge does. Second, **Git is not a backup system**. It protects committed objects extremely well and protects your working tree not at all, which is the single most important asymmetry to internalise.

> **Tip**
>
> The vocabulary split used throughout this course: **porcelain** commands are the user-facing ones (`add`, `commit`, `log`, `merge`) and their output is designed for humans and may change between versions. **Plumbing** commands (`hash-object`, `cat-file`, `ls-tree`, `update-ref`, `rev-parse`) are the stable, scriptable primitives. Plumbing is also the best teaching tool, because it shows the data structure with no interpretation layered on top.

<a id="2-configuring"></a>

## 2. Installing and Configuring Git

Git reads configuration from a cascade of files, and the later ones win. **System** (`/etc/gitconfig`, applied with `--system`), **global** (`~/.gitconfig` or `~/.config/git/config`, `--global`), **local** (`.git/config`, the default), and **worktree** for per-worktree overrides. When a setting behaves unexpectedly, `git config --show-origin --get <key>` tells you which file set it — that one command resolves most configuration mysteries.

**A working baseline configuration**

```ini
[user]
    name = Ada Lovelace
    email = ada@example.com
[init]
    defaultBranch = main
[core]
    editor = code --wait
    autocrlf = input        # Windows: true. macOS/Linux: input.
    pager = less -FRX
[pull]
    ff = only
[push]
    autoSetupRemote = true
    followTags = true
[fetch]
    prune = true
[merge]
    conflictStyle = zdiff3
[rebase]
    autosquash = true
    autostash = true
    updateRefs = true
[rerere]
    enabled = true
[diff]
    algorithm = histogram
    colorMoved = zebra
[help]
    autocorrect = prompt
```

```bash
git --version                         # 2.40+ for most features here
git config --global --edit            # open the file directly
git config --list --show-origin       # every setting and its source
git config --show-origin --get pull.ff
git config --get-regexp '^alias\.'     # what aliases do I have?

# Repository-local override (no --global)
git config user.email me@work-example.com
```

**Conditional includes** solve the problem everyone eventually has: a personal identity and a work identity, and commits authored under the wrong one. Rather than remembering to set `user.email` per repository, key it off the directory.

**One identity per directory tree**

```ini
# ~/.gitconfig
[user]
    name = Ada Lovelace
    email = ada@personal.example

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work

[includeIf "gitdir:~/oss/"]
    path = ~/.gitconfig-oss

# ~/.gitconfig-work
[user]
    email = ada@corp.example
    signingkey = ssh-ed25519 AAAAC3Nz...
[commit]
    gpgsign = true
```

Three settings deserve their own explanation because they change behaviour in ways that are hard to debug. `core.autocrlf` controls line-ending translation: `input` on Unix (commit LF, check out LF), `true` on Windows (commit LF, check out CRLF). Getting it wrong produces diffs where every line changed. `core.ignorecase` defaults to `true` on macOS and Windows, which is why renaming `Foo.js` to `foo.js` sometimes appears to do nothing — use `git mv` with a temporary name. And `core.fsmonitor true` plus `core.untrackedCache true` can turn a multi-second `git status` into a sub-100ms one on a large repository.

> **Warning**
>
> **Set `.gitattributes` rather than relying on everyone's `core.autocrlf`.** A committed `.gitattributes` containing `* text=auto` makes line-ending normalisation a property of the repository rather than of each developer's machine, which is the only version that survives contact with a mixed-platform team.

<a id="3-repository-on-disk"></a>

## 3. The Repository on Disk

`git init` creates one directory, `.git`, and everything Git knows lives inside it. Deleting it turns your project back into an ordinary folder; copying it copies the entire history. There is no database server, no lock file coordinating with anyone else, and no hidden state anywhere on the machine. That is the whole of “distributed”.

```text
.git/
  HEAD          ref: refs/heads/main     <- which branch am I on
  config        repository configuration
  index         the staging area (binary)
  objects/      the content-addressed object database
    3b/18e512db...        a loose object, zlib-compressed
    pack/
      pack-a1b2.pack      many objects, deltified
      pack-a1b2.idx       id -> offset lookup table
  refs/
    heads/main            40 hex chars: a branch
    tags/v2.4.0           40 hex chars: a tag
    remotes/origin/main   a remote-tracking branch
  logs/
    HEAD                  the reflog: every HEAD movement
    refs/heads/main       per-branch reflog
  hooks/        executable scripts run at lifecycle points
  info/exclude  ignore rules that are not committed
```

Two files in there are not plain text. `index` is a binary format holding one entry per tracked path — path, mode, blob id, stage number, and cached `stat` data so `git status` can skip files whose size and mtime have not changed. That caching is why `status` is fast and also why `touch`-ing every file makes it slow for one run. The packfiles are the other binary format, covered in section 36.

Refs have one more wrinkle: they may not exist as files at all. Git periodically *packs* refs into a single `.git/packed-refs` file, so `cat .git/refs/heads/main` can fail on a branch that definitely exists. Always read refs through plumbing — `git rev-parse` or `git for-each-ref` — rather than by reading files, and newer Git versions may use the `reftable` backend where no per-ref files exist at all.

**Read the repository the supported way**

```bash
git rev-parse --git-dir           # where is .git for this worktree?
git rev-parse --show-toplevel     # the working tree root
git rev-parse HEAD                # resolve any revision to a full id
git rev-parse --abbrev-ref HEAD   # current branch name, or 'HEAD' if detached

git for-each-ref --format='%(refname:short) %(objectname:short) %(subject)'
git symbolic-ref HEAD             # refs/heads/main, or fails if detached
git count-objects -vH             # loose vs packed, on-disk size
```

```text
$ git rev-parse --abbrev-ref HEAD
feature/retry-policy

$ git for-each-ref --format='%(refname:short) %(objectname:short)'
main 4a7b8c9
feature/retry-policy 9c1d2e3
origin/main 4a7b8c9
v2.4.0 4a7b8c9
```

> **Tip**
>
> A **bare** repository (`git init --bare`) is exactly the contents of `.git` with no working tree, which is what a server hosts. This is why cloning a bare repo and cloning a normal one give identical history: there was never anything in the working tree that Git needed.

<a id="4-content-addressing"></a>

## 4. Content-Addressable Storage — Blobs and Hashes

The bottom layer is a key-value store. To store a value, Git builds a header of the form `<type> <byte-length>\0`, prepends it to the content, takes the SHA-1 of the result, and writes the zlib-compressed bytes to `.git/objects/<first two hex chars>/<remaining 38>`. The key is therefore a deterministic function of the value, which produces three properties simultaneously: identical content is stored once, nothing can be modified in place, and any object can be verified by recomputing its id.

> **Interactive animation:** `content-addressing` — rendered by the page script in the HTML version.

You can compute a Git object id without Git, which is the clearest way to see there is no magic in it. The header is part of the hashed input, which is why a Git blob id differs from a plain `sha1sum` of the same file.

**Compute a blob id from first principles**

```bash
printf 'hello world\n' | git hash-object --stdin
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad

# The same number, without Git:
printf 'blob 12\0hello world\n' | shasum
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad

git hash-object -w file.txt     # -w actually writes it to the database
git cat-file -t 3b18e51         # blob
git cat-file -s 3b18e51         # 12  (size in bytes)
git cat-file -p 3b18e51         # hello world
```

```python
import hashlib
import zlib
from pathlib import Path

def git_blob_id(data: bytes) -> str:
    """Reproduce `git hash-object` exactly: type, space, length, NUL, content."""
    store = b"blob " + str(len(data)).encode() + b"\0" + data
    return hashlib.sha1(store).hexdigest()

def read_loose_object(repo: Path, oid: str) -> bytes:
    """Loose objects are zlib streams; the header ends at the first NUL."""
    path = repo / ".git" / "objects" / oid[:2] / oid[2:]
    raw = zlib.decompress(path.read_bytes())
    return raw.split(b"\0", 1)[1]

print(git_blob_id(b"hello world\n"))
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad
```

A blob stores **contents only**. No filename, no path, no permissions, no timestamp, no author. Everything else lives in the tree that references it, which is what makes renames cheap: a file moved to a new path reuses the identical blob, and only the tree entries change. It is also why Git does not “track renames” — it detects them after the fact, by noticing that a deleted path and an added path share content.

> **Tip**
>
> **On SHA-1.** SHA-1 is broken for collision resistance, and Git has shipped a hardened variant since 2017 that detects the known attack pattern and refuses the object. SHA-256 repositories are supported (`git init --object-format=sha256`) but interoperate poorly with existing tooling, so most repositories remain SHA-1. In practice Git's integrity story leans on signed commits and tags for authenticity, and on hashing for accidental corruption — and `git fsck` is the command that checks the latter.

<a id="5-trees"></a>

## 5. Trees — How Git Stores Directories

A **tree** object is a sorted list of entries, each being `<mode> <type> <object id>\t<name>`. Entries pointing at blobs are files; entries pointing at other trees are subdirectories. A tree is therefore a complete, immutable description of one directory, and because subdirectory entries are themselves content-addressed, the root tree's id summarises the entire project.

> **Interactive animation:** `object-graph` — rendered by the page script in the HTML version.

Git stores only a handful of modes, and they are not POSIX permissions — the only bit Git records for a regular file is whether it is executable.

| Mode | Meaning |
| --- | --- |
| `100644` | regular file |
| `100755` | executable file |
| `120000` | symbolic link (the blob holds the target path) |
| `040000` | subdirectory (a tree) |
| `160000` | gitlink — a submodule's commit id |

**Build a commit with nothing but plumbing**

```bash
git init demo && cd demo

# 1. A blob
echo 'hello world' | git hash-object -w --stdin
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad

# 2. Put it in the index under a name, then write a tree from the index
git update-index --add --cacheinfo 100644,3b18e512dba79e4c8300dd08aeb37f8e728b8dad,a.txt
tree=$(git write-tree)
git cat-file -p $tree
# 100644 blob 3b18e512...    a.txt

# 3. A commit pointing at that tree
commit=$(echo "first" | git commit-tree $tree)

# 4. Point a branch at it. That is all a branch is.
git update-ref refs/heads/main $commit
git log --oneline        # a real commit, made without add or commit
```

```text
$ git ls-tree HEAD
100644 blob 3b18e512dba79e4c8300dd08aeb37f8e728b8dad    a.txt
040000 tree eee380db367138277795e607702075fcb3a0953d    docs

$ git ls-tree -r HEAD            # recurse into subtrees
100644 blob 3b18e512dba79e4c8300dd08aeb37f8e728b8dad    a.txt
100644 blob 3b18e512dba79e4c8300dd08aeb37f8e728b8dad    docs/b.txt
```

Two consequences follow from this structure and both surprise people. **Git cannot store an empty directory**, because a directory only exists as a tree entry and a tree with no entries has nothing to reference it — hence the `.gitkeep` convention. And **changing a deeply nested file rewrites every tree above it**: a new blob means a new leaf tree, which means a new parent tree, all the way to the root. Those trees are tiny, so the cost is negligible, but it is why every commit has a distinct root tree id.

<a id="6-commits"></a>

## 6. Commits, Parents, and the DAG

A commit object is a short, readable text file. It names one root tree, zero or more parents, an author (who wrote the change) and a committer (who applied it — these differ after a rebase or when applying a patch by email), and a message. That is the complete format, and you can read any commit in the repository with `git cat-file -p`.

**A commit object, verbatim**

```text
$ git cat-file -p HEAD
tree 1a1ba4a76f545cd5462ab48b04a807c363b13d9f
parent 9f2c1ab0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9
author Ada Lovelace <ada@example.com> 1789110842 +0530
committer Ada Lovelace <ada@example.com> 1789110842 +0530

fix: reject config keys that are empty strings

The loader accepted "" as a key, so a typo'd entry silently
overwrote the default section instead of failing.
```

```bash
git cat-file -p HEAD          # the raw object above
git rev-list --count HEAD     # how many commits are reachable
git cat-file -p HEAD^{tree}   # its root directory

# Parents, and the notation for them
git rev-parse HEAD^           # first parent
git rev-parse HEAD^2          # second parent (only on a merge)
git rev-parse HEAD~3          # three first-parents back
git log --merges --oneline    # commits with more than one parent
```

Parent count is what distinguishes the three shapes of commit. **Zero parents** is a root commit — usually the first in the repository, but `git checkout --orphan` can make more, which is how documentation branches like `gh-pages` are created. **One parent** is an ordinary commit. **Two or more** is a merge, and the order matters enormously: the *first parent* is the branch you were on when you merged, which is why `git log --first-parent main` reads as one entry per feature landed and why `git revert -m 1` means “keep the mainline”.

Because every commit names its parents and nothing names its children, history is a **directed acyclic graph** that can only be traversed backwards. Every Git command that shows you history is doing a graph walk from a set of starting points, and the revision syntax is how you describe that set.

| Syntax | Means |
| --- | --- |
| `HEAD~3` | follow the first parent three times |
| `HEAD^2` | the second parent of HEAD (merges only) |
| `A..B` | reachable from B but not from A |
| `A...B` | reachable from either but not both (symmetric difference) |
| `^A B C` | reachable from B or C, excluding A |
| `HEAD@{2}` | where HEAD was two moves ago (reflog) |
| `main@{yesterday}` | where `main` pointed yesterday (reflog, local only) |
| `:/fix parser` | the newest commit whose message matches |
| `HEAD:path/file` | the blob at that path in that commit |

> **Warning**
>
> `A..B` and `A...B` mean *different things* to `git log` and to `git diff`. For `log`, two dots is set subtraction and three dots is symmetric difference. For `diff`, two dots compares the two endpoints directly and three dots compares B against the *merge base* — the latter is what a pull request shows. Mixing them up is why a diff sometimes contains other people's commits.

<a id="unit-2"></a>

## Unit 2 — The Working Model

How changes flow from the working tree into commits, and how refs and branches name them.

<a id="7-three-trees"></a>

## 7. The Three Trees in Depth

The working tree, the index and HEAD are the three places a tracked file exists, and almost every porcelain command is a copy between two of them. The index is the one people have no intuition for, so it is worth being precise: `.git/index` is a binary file containing, for every tracked path, the path itself, the file mode, the blob id of its staged content, a *stage number*, and cached `stat` information from the last time Git looked at the file on disk.

> **Interactive animation:** `three-trees` — rendered by the page script in the HTML version.

The stage number is normally 0. During a conflicted merge it is 1, 2 or 3 — base, ours, theirs — and a path with entries at stages 1–3 and none at stage 0 is precisely the definition of an unmerged path. The cached `stat` data is the performance trick: if a file's size and mtime match what the index recorded, Git assumes the content is unchanged and skips hashing it, which is what makes `git status` fast on a large repository.

| Command | Copies | Note |
| --- | --- | --- |
| `git add <p>` | working tree → index | hashes the file, writes a blob, updates the entry |
| `git commit` | index → new commit | writes trees from the index, then a commit object |
| `git restore <p>` | index → working tree | **destructive**; no reflog covers this |
| `git restore --staged <p>` | HEAD → index | unstage; the file on disk is untouched |
| `git restore --source=X <p>` | commit X → working tree | add `--staged` to hit the index too |
| `git reset --soft X` | moves the branch only | index and working tree untouched |
| `git reset X` | branch, then X → index | the default (`--mixed`); disk untouched |
| `git reset --hard X` | branch, then X → index → working tree | **destructive** for uncommitted work |
| `git switch <b>` | branch tip → index → working tree | refuses if it would overwrite local changes |

**Inspect the index directly**

```bash
git ls-files --stage                # mode, blob id, stage, path
git ls-files -u                     # unmerged paths only (stages 1/2/3)
git diff-index --cached HEAD        # index vs HEAD, plumbing form

git update-index --skip-worktree config.local.yml   # ignore local edits
git update-index --no-skip-worktree config.local.yml

# Rebuild the index from scratch if stat caching goes wrong
rm .git/index && git reset
```

> **Warning**
>
> `--assume-unchanged` and `--skip-worktree` are frequently suggested as a way to ignore a tracked config file, and they are a trap. Both are local-only promises to Git, both are invisible in `git status`, and both cause merges and checkouts to behave in ways that look like Git bugs. If a file must differ per developer, do not track it: commit a `.example` template, add the real path to `.gitignore`, and generate it.

<a id="8-staging"></a>

## 8. Staging — `add`, Pathspecs and `.gitignore`

`git add` does three things per path: read the file, write a blob if that content is not already stored, and update the index entry. It is not a queue of filenames — it captures *contents at the moment you run it*, which is the whole explanation for the classic “I staged it, then edited it, and the commit is wrong” surprise.

The `-p` / `--patch` mode is where the index earns its existence. Git splits the diff into hunks and asks about each one; `y` and `n` stage or skip, `s` splits a hunk into smaller pieces, and `e` drops you into an editor where you can stage individual lines by deleting the ones you do not want (changing a `-` to a space keeps the original line). The same interface is available on `git restore -p`, `git stash -p`, `git reset -p` and `git checkout -p`.

**Staging, and the pathspec magic words**

```bash
git add -p                      # hunk by hunk
git add -u                      # only already-tracked files
git add -A                      # everything, including deletions
git add -N newfile.py           # 'intent to add' - makes it visible to git diff

# Pathspec magic: prefixes that change matching rules
git add ':(exclude)**/*.log' .        # add everything except logs
git log -- ':(glob)src/**/*.ts'       # ** crosses directory boundaries
git grep -n ':(icase)todo'            # case-insensitive
git add ':(top)Makefile'              # relative to repo root, not cwd
git add ':(attr:text)'                # every path with the 'text' attribute
```

**Ignoring files** is a layered system and the layering matters when a rule does not behave. Git consults, in order of increasing precedence: `$GIT_DIR/info/exclude` (local, uncommitted), `core.excludesFile` (usually `~/.config/git/ignore`, global for you), and then every `.gitignore` from the repository root down to the file's own directory, with deeper files winning. Within one file, the *last* matching pattern wins, which is how negation works.

**A .gitignore that behaves**

```text
# Anchored to the repo root because it contains a slash
/build/
/dist/

# Matches at any depth - no slash
*.log
__pycache__/
node_modules/

# Negation: ignore the directory but keep one file.
# This FAILS if the directory itself is excluded, because Git never
# descends into an ignored directory to find the exception.
logs/*
!logs/.gitkeep

# Only in this directory, not subdirectories
/config.local.yml

# Escape a literal '!' or '#'
\#not-a-comment.txt
```

```bash
# Why is this file ignored? Prints the file, line and pattern.
git check-ignore -v path/to/file

git status --ignored             # show what is being ignored
git ls-files --others --ignored --exclude-standard

# .gitignore only affects UNTRACKED files. Already tracked? Untrack it:
git rm --cached secrets.env
echo 'secrets.env' >> .gitignore
git commit -m "chore: stop tracking secrets.env"

# Personal ignores that should not be committed
echo '.idea/' >> .git/info/exclude
```

> **Warning**
>
> The single most common `.gitignore` complaint is “I added it and the file is still showing”. `.gitignore` governs **untracked** files only; once a path is in the index, Git tracks it regardless. `git rm --cached` removes it from the index while leaving it on disk. The second most common is the negation-inside-an-ignored-directory case above — Git never descends into an excluded directory, so `!` cannot rescue anything inside it unless the directory itself is re-included.

**`.gitattributes`** is the other per-path configuration file, and unlike personal Git config it is committed, so it applies to everyone. It controls line endings, diff behaviour, merge drivers, export filtering and clean/smudge filters.

**.gitattributes — repo-wide per-path rules**

```text
# Normalise line endings for everyone, regardless of local config
* text=auto
*.sh text eol=lf
*.bat text eol=crlf

# Never try to merge or diff these
*.png binary
*.pdf binary
package-lock.json -diff merge=ours

# Append-only files: keep both sides instead of conflicting
CHANGELOG.md merge=union

# Teach diff about a language, so hunk headers show function names
*.py diff=python
*.md diff=markdown

# Keep test fixtures out of `git archive` tarballs
tests/fixtures/ export-ignore
```

<a id="9-committing"></a>

## 9. Committing Well

A commit is the atom every other Git tool operates on. `revert` undoes one, `bisect` tests one, `blame` attributes a line to one, `log -S` finds one. A commit that mixes a bug fix with a rename and a dependency bump degrades all four of those tools simultaneously. The discipline is not “commit often” but “each commit is one complete idea that leaves the tree working”.

Messages have a strong convention that is worth following even if nothing enforces it: a subject line under about 50 characters in the imperative mood, a blank line, then a body wrapped near 72 columns explaining *why*. The imperative mood is not pedantry — it makes the subject complete the sentence “applying this commit will…”, which matches what Git's own generated messages do (“Merge branch…”, “Revert…”).

**A message that will still be useful in two years**

```text
fix(config): reject keys that are empty strings

Config.load accepted "" as a key, so a typo'd YAML entry silently
merged into the default section instead of raising. Two incidents
last quarter traced back to this.

Validate in Config.load rather than at each call site, so callers
that never touch the loader benefit too. Rejected the alternative
of coercing "" to None: silent coercion is what caused this.

Fixes: #412
Co-authored-by: Grace Hopper <grace@example.com>
```

```bash
git commit                          # opens the editor - use it
git config --global commit.verbose true   # show the staged diff while writing

git commit --amend                  # replace the last commit (new id!)
git commit --amend --no-edit        # ... keeping the message
git commit --fixup=<sha>            # mark as a fix for an earlier commit
git commit --squash=<sha>           # ... and edit the combined message
git commit --allow-empty -m "ci: trigger pipeline"
git commit -s                       # add a Signed-off-by trailer

git interpret-trailers --parse <<< "$(git log -1 --format=%B)"
git log --format='%(trailers:key=Fixes,valueonly)' -5
```

**Conventional Commits** — the `type(scope): subject` form, with types like `feat`, `fix`, `docs`, `refactor`, `test`, `chore` and a `BREAKING CHANGE:` trailer — is worth adopting when you want automated changelogs and semantic version bumps, and worth skipping when you do not, because it is machine-readable structure and its only real benefit is machines reading it.

> **Key idea**
>
> `--amend` does not edit a commit; it creates a replacement with a new id and moves the branch. The author date is preserved, the committer date is not. Because the id changes, amending a pushed commit means everyone else's history disagrees with yours — the same constraint that governs rebase. Amend freely before you push; use `revert` or a follow-up commit after.

<a id="10-refs"></a>

## 10. Refs, HEAD, and Detached HEAD

A **ref** is a name for a commit id. Branches live under `refs/heads/`, tags under `refs/tags/`, remote-tracking branches under `refs/remotes/<remote>/`, and notes, stashes and replacements have their own namespaces. When you type a bare name, Git resolves it through a fixed search order — `refs/<name>`, `refs/tags/<name>`, `refs/heads/<name>`, `refs/remotes/<name>`, `refs/remotes/<name>/HEAD` — which is why a tag and a branch with the same name is a bad idea.

`HEAD` is a *symbolic ref*: a ref whose contents are the name of another ref. Its normal value is the literal text `ref: refs/heads/main`. That indirection is what makes “commit to the branch I am on” work — `git commit` writes the object, then resolves HEAD to find which ref to update.

> **Interactive animation:** `detached-head` — rendered by the page script in the HTML version.

**Detached HEAD** is the state where `.git/HEAD` holds a commit id directly. You reach it by checking out a commit, a tag, or a remote-tracking ref. Everything still works, but there is no branch beneath HEAD to advance, so commits made there are referenced only by HEAD itself and become unreachable the moment you switch away. It is not a broken state — CI systems and `git bisect` use it deliberately — but it needs a branch before you walk away.

**Working with refs as data**

```bash
git symbolic-ref HEAD                 # refs/heads/main (fails if detached)
git rev-parse --abbrev-ref HEAD       # main, or literally 'HEAD' if detached
git update-ref refs/heads/main <sha>  # move a branch without checking it out
git update-ref -d refs/heads/old      # delete a ref

git for-each-ref --sort=-committerdate refs/heads \
  --format='%(refname:short)|%(committerdate:relative)|%(upstream:track)'

git show-ref --heads
cat .git/packed-refs                  # refs that have been packed into one file
```

```text
$ git switch --detach v2.4.0
Note: switching to 'v2.4.0'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>
```

> **Tip**
>
> `@` is shorthand for `HEAD`, and `@{u}` or `@{upstream}` for the tracking branch, so `git log @{u}..@` reads “what do I have that upstream does not”. `@{push}` is the ref you would push to, which differs from `@{upstream}` in triangular workflows where you pull from upstream and push to your own fork.

<a id="11-branches"></a>

## 11. Branches

A branch is a 41-byte file under `refs/heads/` holding one commit id. Creating one is writing the file, moving one is overwriting it, and deleting one is removing it. Nothing is copied, which is why branch-per-task is the normal Git workflow rather than an expensive ceremony.

> **Interactive animation:** `branch-pointers` — rendered by the page script in the HTML version.

`git switch` and `git restore` were introduced in Git 2.23 to split the two unrelated jobs that `git checkout` had been doing: moving HEAD, and overwriting files. `checkout` still works and always will, but `git checkout <file>` silently destroying uncommitted work while `git checkout <branch>` refuses to is exactly the kind of inconsistency the split removed. Prefer the new commands.

**Branch operations worth knowing**

```bash
git switch -c feature             # create and switch
git switch -c hotfix main         # create from a specific start point
git switch -                      # the previous branch
git switch --detach v2.4.0        # deliberate detached HEAD

git branch -m old new             # rename (add -M to force)
git branch -d feature             # delete; refuses if not merged
git branch -D feature             # delete regardless
git branch --merged main          # safe to delete
git branch --no-merged main       # NOT safe to delete
git branch --contains <sha>       # which branches include this commit?
git branch -vv                    # tip, upstream, ahead/behind

# Delete every local branch already merged into main
git branch --merged main | grep -vE '^\*|main' | xargs -r git branch -d
```

> **Warning**
>
> `git branch --merged` answers a *reachability* question, not “did this work land”. After a squash-merge or a rebase-merge the branch's original commits are not ancestors of `main`, so the branch is reported as unmerged and `-d` refuses to delete it. That is correct and it is also why teams using squash-merge end up typing `-D` routinely. `git cherry -v main feature` answers the content question instead: it lists commits whose changes are not already upstream.

<a id="unit-3"></a>

## Unit 3 — Inspecting & Undoing

Reading history and undoing work at every level, safely.

<a id="12-log"></a>

## 12. Reading History with `git log`

`git log` is a graph walk with filters and a formatter, and almost all of its power is in options nobody reads. It starts from the commits you name (HEAD by default), follows parent pointers, applies the filters, and prints. Understanding it as a walk explains the behaviours that otherwise look arbitrary — including why `--graph` changes the *order* of output, since it switches to topological sorting so a parent never prints before its child.

**Selecting commits**

```bash
git log --oneline --graph --decorate --all     # the shape of everything
git log --first-parent main                    # one entry per merged feature
git log main..feature                          # what feature adds
git log --left-right --oneline main...feature  # both sides, marked < and >

git log --since='2 weeks ago' --until=yesterday
git log --author='Ada' --no-merges
git log --grep='timeout' --all-match --grep='retry'
git log -- src/config.py                       # commits touching a path
git log --follow -- src/config.py              # ... across renames
git log --merges / --no-merges
git log --cherry-pick --left-right main...release  # ignore duplicated patches
```

```bash
# Content searches - the ones that find things nothing else can
git log -S 'DEFAULT_TIMEOUT'          # commits where the COUNT of that string changed
git log -S 'DEFAULT_TIMEOUT' --pickaxe-regex
git log -G 'def .*timeout'            # commits whose DIFF matches this regex
git log -L 40,60:src/config.py        # history of those lines only
git log -L :Config.load:src/config.py # history of one function

# Formatting
git log --stat                        # files changed, insertions, deletions
git log -p                            # full patches
git log --format='%h %ad %an %s' --date=short
git shortlog -sne                     # contributors by commit count
```

The difference between `-S` and `-G` is worth internalising because they answer different questions. `-S` finds commits where the *number of occurrences* of a string changed — so it finds where a symbol was introduced or removed, and ignores commits that merely moved it. `-G` finds commits whose diff text matches a regex at all, so it also catches lines that were moved or reformatted. When hunting for the origin of a value, start with `-S`.

> **Tip**
>
> Aliases turn these into muscle memory. `lg = log --oneline --graph --decorate --all` and `lgm = log --oneline --first-parent main` together cover most of what you actually want — the first for “what is the shape of this repo”, the second for “what has landed on the trunk”.

<a id="13-diffs"></a>

## 13. The Four Diffs and Range Syntax

There are three trees, so there are three adjacent gaps, and `git diff` has a form for each. The fourth form takes no working tree at all and compares two commits. Most confusion about `git diff` is confusion about which two things it chose.

> **Interactive animation:** `four-diffs` — rendered by the page script in the HTML version.

| Command | Compares | Answers |
| --- | --- | --- |
| `git diff` | working tree vs index | what have I changed but not staged? |
| `git diff --staged` | index vs HEAD | what exactly will my next commit contain? |
| `git diff HEAD` | working tree vs HEAD | everything I have changed, staged or not |
| `git diff A B` | two commits, directly | how do these two snapshots differ? |
| `git diff A...B` | B vs merge-base(A, B) | what did this branch introduce? (the PR view) |

**Diff options that change what you can see**

```bash
git diff --stat                    # summary instead of the patch
git diff --name-only               # just the paths
git diff --word-diff=color         # prose and config files
git diff -w                        # ignore whitespace changes
git diff --ignore-blank-lines
git diff -M -C                     # detect renames and copies
git diff --find-renames=40%        # loosen the similarity threshold

git diff --color-moved=zebra       # moved blocks get their own colour
git diff --diff-filter=D           # only deleted files (A/M/D/R/C/T)
git diff HEAD@{2} HEAD -- src/     # against a reflog position

git range-diff main old-tip new-tip   # diff two VERSIONS of a branch
```

```ini
[diff]
    algorithm = histogram   # better hunks on refactored code than 'myers'
    colorMoved = zebra
    renames = copies
    mnemonicPrefix = true   # i/ for index, w/ for worktree, c/ for commit
[diff "python"]
    xfuncname = "^[ \t]*((class|def)[ \t].*)$"
[pager]
    diff = delta            # if you use an external pager
```

`git range-diff` is the one most people have never used and immediately want. It compares two *versions of the same branch* — before and after a rebase, or v1 and v2 of a patch series — and tells you what actually changed between them, ignoring the fact that every commit has a different id. On a rebase that was supposed to be mechanical, it is the fastest way to confirm nothing was lost.

<a id="14-archaeology"></a>

## 14. show, blame, and Archaeology

Sooner or later you need to answer “why is this line here?” about code written by someone who left two years ago. Git can answer it, but the naive approach — `git blame` — fails in a specific and very common way: it reports the commit that last *touched* a line, so any reformatting, rename, or file move resets the attribution to something useless.

**Making blame tell the truth**

```bash
git blame -w -M -C -C -- src/config.py
#   -w  ignore whitespace-only changes
#   -M  detect lines moved within the file
#   -C  detect lines copied from other files in the same commit
#   -CC also look at files the commit did not touch (slower, better)

git blame -L 40,60 -- src/config.py    # just those lines
git blame <sha>~1 -- src/config.py     # blame as of BEFORE that commit

# Permanently hide formatting commits from every blame
cat >> .git-blame-ignore-revs <<'EOF'
# Ran the formatter across the repo, 2026-03-14
9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d
EOF
git config blame.ignoreRevsFile .git-blame-ignore-revs
git add .git-blame-ignore-revs && git commit -m "chore: ignore format commits in blame"
```

```bash
# When blame is not enough - go straight to the content
git log -S 'TIMEOUT = 0' --oneline -- src/config.py
git log -L :load_config:src/config.py      # the function's whole history

git show <sha>                    # the commit: metadata + patch
git show <sha> --stat             # ... just the file list
git show <sha>:src/config.py      # the FILE as of that commit
git show <sha>^:src/config.py     # ... as of its parent

git log --diff-merges=first-parent -p <merge-sha>   # what a merge changed
git show -m <merge-sha>           # a merge, diffed against each parent

# Which release first contained this commit?
git tag --contains <sha> | sort -V | head -1
git describe --contains <sha>
git name-rev --name-only <sha>
```

`git show` on a merge commit prints nothing by default, which surprises people who assume a merge “contains” changes. It does not: a merge's tree is normally derivable from its parents, so the default combined diff shows only the parts Git had to resolve by hand. Use `-m` to see the merge against each parent separately, or `--diff-merges=first-parent` to see what the merge brought into the mainline — the latter is usually the question you meant to ask.

> **Interview**
>
> **The archaeology sequence, in order.** `git log -S <value>` to find where a value first appeared; `git show <sha>` to read the reasoning in the message; `git blame -w -M -C` if you need line-level attribution; `git log -L` if you want a function's whole life; and `git tag --contains` to learn which release shipped it. Every one of these works offline, instantly, on a ten-year repository.

<a id="15-restore"></a>

## 15. Undoing Work — `restore`, `checkout`, `clean`

These are the commands that operate below the commit level, and they are the only ones in Git that can destroy work irrecoverably. Everything else moves pointers around objects that still exist; these overwrite or delete files that Git has never stored.

| Command | Effect | Recoverable? |
| --- | --- | --- |
| `git restore <p>` | index → working tree | **No** — the edit was never stored |
| `git restore --staged <p>` | HEAD → index | Yes — the file on disk is untouched |
| `git restore -SW <p>` | HEAD → index and working tree | **No** |
| `git restore -s <rev> <p>` | that commit → working tree | **No** for what it overwrote |
| `git clean -fd` | deletes untracked files and directories | **No** — Git never saw them |
| `git stash -u` | saves everything, including untracked | Yes — this is the safe version of all of the above |

**Discarding changes, with a net**

```bash
git restore src/app.py            # discard unstaged changes to one file
git restore .                     # ... to everything tracked
git restore --staged src/app.py   # unstage, keep the edit
git restore -SW src/app.py        # both: back to HEAD entirely
git restore -p src/app.py         # discard selected hunks only
git restore --source=HEAD~2 src/app.py   # bring back an older version

git clean -nd                     # DRY RUN first. always.
git clean -fd                     # delete untracked files + directories
git clean -fdx                    # ... including ignored files (build output)
git clean -i                      # interactive

# The safe habit before any of the above
git stash push -u -m "before I do something rash"
```

> **Warning**
>
> `git clean -fdx` deletes ignored files too, which typically means `node_modules`, virtualenvs, build output *and* any local `.env` that was deliberately ignored. It is the correct command for “give me a pristine tree” and a very effective way to lose an afternoon of local configuration. Run `git clean -ndx` first, every time, without exception.

<a id="16-reset"></a>

## 16. reset in Depth

`git reset` does up to three things, in order, and the mode decides where it stops. **Step one:** move the branch that HEAD points at to the target commit. **Step two (`--mixed`, the default):** make the index match that commit. **Step three (`--hard`):** make the working tree match too. `--soft` stops after step one. Seen this way there are no flags to memorise, only a question of how far the copying goes.

> **Interactive animation:** `reset-modes` — rendered by the page script in the HTML version.

The commits “removed” by a reset are not deleted — they become unreachable, and the reflog still names them, so `git reset --hard <old-sha>` undoes the undo. The only thing a reset can permanently destroy is *uncommitted* work in the index and working tree, which is exactly what `--hard` overwrites.

**The idioms, and what each one is for**

```bash
# Squash the last 3 local commits into one, losing nothing
git reset --soft HEAD~3
git commit -m "feat: add retry policy with backoff"

# Uncommit, keep the changes unstaged
git reset HEAD~1

# Abandon local commits AND local changes entirely
git stash -u                       # net first
git reset --hard origin/main

# Unstage one path (older spelling of git restore --staged)
git reset HEAD -- src/app.py
git reset -p                       # unstage selected hunks

# Move a branch without checking it out
git branch -f feature origin/main
git update-ref refs/heads/feature <sha>

# --keep: reset, but refuse if it would clobber local changes
git reset --keep <sha>
```

Two lesser-known modes are worth knowing. `--keep` resets the branch and index but aborts if any file with local modifications differs between the two commits — a safer `--hard` for “move me back but do not eat my work”. `--merge` is similar and is what `git merge --abort` uses internally. Neither is a substitute for stashing first, but both fail loudly rather than silently.

> **Key idea**
>
> Three commands are constantly confused. `reset` moves a **branch pointer**. `restore` copies **file contents** between trees. `revert` creates a **new commit** that undoes an old one. Pick by asking what you want to move: a pointer, a file, or history-that-other-people-have.

<a id="17-revert"></a>

## 17. revert and the Safe Undo

`git revert <sha>` computes the diff between that commit and its parent, applies the inverse to your working tree and index, and commits. Every existing commit id stays valid, so nobody has to re-clone or force-pull. On any branch other people have, this is the correct undo.

> **Interactive animation:** `revert-flow` — rendered by the page script in the HTML version.

**Reverting, including the awkward cases**

```bash
git revert <sha>                  # one commit
git revert --no-edit <sha>        # keep the generated message
git revert -n <sha1> <sha2>       # stage both, commit once
git revert <old>..<new>           # a range, newest first
git revert --abort                # on conflict, back out cleanly

# Reverting a merge: -m says which parent is the mainline
git revert -m 1 <merge-sha>       # keep what was on the branch you merged INTO

# Undo a revert (yes, this is normal and sometimes required)
git revert <revert-sha>
```

Reverting a merge has a consequence that catches teams out at least once. `git revert -m 1` undoes the merge's *content*, but the merge commit remains in the graph, so Git still considers that branch merged. If the feature is later fixed and the branch re-merged, Git sees no new commits to bring in and the merge is a no-op — the feature stays absent. The fix is to revert the revert before re-merging, or to rebuild the branch on top of current `main`. Say this out loud in an interview and it reliably registers.

> **Warning**
>
> A revert removes a change from the current *state*; it does not remove it from *history*. For a leaked credential this is not enough — the value is still in the object database and in every existing clone. Rotate the credential first (section 37), then decide separately whether a history rewrite is worth its cost.

<a id="unit-4"></a>

## Unit 4 — Integrating & Rewriting History

Merging, rebasing, cherry-picking and stashing, with the reflog as the safety net.

<a id="18-merging"></a>

## 18. Merging — Fast-Forward, Three-Way, and the Merge Base

A merge starts by computing the **merge base**: the best common ancestor of the two tips, found by walking both histories backwards. With that, the work becomes a three-way comparison per path. If a path changed on only one side relative to the base, take that side. If it changed on both sides in non-overlapping regions, take both. If it changed on both sides in the same region, stop and ask.

> **Interactive animation:** `merge-types` — rendered by the page script in the HTML version.

Two special cases explain most surprises. If the merge base equals your current tip, your branch has nothing the other lacks, so Git just advances the pointer — a **fast-forward**, with no new commit and no record that a branch existed. And if the two histories have *multiple* equally-good common ancestors — which happens after cross-merges between branches — the default strategy recursively merges those ancestors into a virtual base first, which is where the strategy got its old name, `recursive`.

**Merging, and inspecting what it will do**

```bash
git merge feature                 # fast-forward when possible
git merge --no-ff feature         # always create a merge commit
git merge --ff-only feature       # fail rather than create one
git merge --squash feature        # one ordinary commit, no merge link
git merge --no-commit feature     # merge but stop before committing

git merge-base main feature              # the common ancestor
git merge-base --all main feature        # more than one? expect surprises
git merge-base --is-ancestor A B && echo "A is an ancestor of B"

git log --oneline --first-parent main    # one line per merged feature
git log --merges --oneline -5
git diff main...feature                  # what the branch adds (PR view)
```

```ini
[merge]
    ff = false           # merges always record a merge commit
    conflictStyle = zdiff3
[pull]
    ff = only            # ... but a pull must never invent one
[alias]
    mergeff = merge --ff-only
    graph = log --oneline --graph --decorate --all
```

`--squash` is not a merge at all, despite the name. It applies the branch's combined change to the index and stops, leaving you to make an ordinary single-parent commit. Git therefore records no link to the branch, `git branch --merged` will not list it, and re-merging the branch later will try to apply everything again. Squash-merge is a legitimate policy — it keeps `main` at one commit per change — but it obliges you to delete the branch immediately.

<a id="19-conflicts"></a>

## 19. Merge Conflicts

A conflict is Git declining to guess. Mechanically it does two things: writes both versions into the working file surrounded by markers, and replaces the single stage-0 index entry for that path with three entries — stage 1 (base), stage 2 (ours), stage 3 (theirs). A path with stages 1–3 and no stage 0 *is* the definition of “unmerged”, and `git add` during a merge means nothing more than “collapse these three stages back to one”.

> **Interactive animation:** `merge-conflict` — rendered by the page script in the HTML version.

Set `merge.conflictStyle = zdiff3` once and never look back. The default `merge` style shows only the two sides, which forces you to guess what each one changed *from*. `zdiff3` includes the merge base between them, so you can see that (say) one side changed 30 to 60 while the other changed 30 to 10 — information that frequently makes the correct resolution obvious.

**Resolving, and the escape hatches**

```bash
git status                        # 'both modified' lists the conflicts
git diff                          # combined diff, conflicts only
git ls-files -u                   # the three stages, as proof

git show :1:config.yml            # base
git show :2:config.yml            # ours
git show :3:config.yml            # theirs
git diff --base config.yml        # ours vs base
git diff --theirs config.yml      # what they changed

# Take one whole side, when that is genuinely right
git checkout --ours   config.yml
git checkout --theirs config.yml
git checkout --merge  config.yml  # put the markers back, start again

git add config.yml                # mark resolved
git merge --continue              # or plain: git commit
git merge --abort                 # restore the exact pre-merge state
```

```ini
[merge]
    conflictStyle = zdiff3     # include the merge base in markers
    tool = vscode
[mergetool "vscode"]
    cmd = code --wait --merge $REMOTE $LOCAL $BASE $MERGED
[mergetool]
    keepBackup = false
    prompt = false
[rerere]
    enabled = true             # record and replay resolutions
    autoUpdate = true
```

**`rerere`** — reuse recorded resolution — is the single best return on a one-line config change in Git. With it enabled, every conflict you resolve is recorded as a (conflict-shape → resolution) pair under `.git/rr-cache`, and the next time the identical conflict appears Git applies your previous answer automatically. On a long rebase where the same file conflicts at every commit, this is the difference between one resolution and fifteen.

> **Warning**
>
> During a **rebase**, `--ours` and `--theirs` are reversed relative to a merge. A rebase checks out the upstream branch and replays your commits onto it, so “ours” is upstream and “theirs” is your own work. Reaching for `--theirs` from muscle memory mid-rebase is a reliable way to discard exactly the code you were trying to preserve.

<a id="20-merge-strategies"></a>

## 20. Merge Strategies and Options

The default strategy since Git 2.34 is **`ort`** (“ostensibly recursive's twin”), a rewrite of the old `recursive` strategy that is faster, handles rename detection better, and produces fewer spurious conflicts on directory renames. You almost never choose a strategy explicitly; you occasionally choose a strategy *option*.

| Flag | Does | Use when |
| --- | --- | --- |
| `-X ours` | on conflicting hunks only, keep our side | you know your side is authoritative for conflicts |
| `-X theirs` | on conflicting hunks only, keep their side | regenerating from an upstream source of truth |
| `-s ours` | record the merge, discard *all* their content | marking a branch as merged without taking it |
| `-X ignore-space-change` | ignore whitespace when merging | a reformatting commit is fighting you |
| `-X renormalize` | re-apply line-ending normalisation first | CRLF/LF chaos across platforms |
| `-X find-renames=40%` | loosen rename detection | a file was renamed *and* heavily edited |
| `--allow-unrelated-histories` | merge two repos with no common ancestor | joining projects; almost never otherwise |

The distinction between `-X ours` and `-s ours` is important and the naming is unhelpful. `-X ours` is a conflict-resolution preference: everything that merges cleanly merges normally, and only genuinely conflicting hunks are resolved in your favour. `-s ours` is a different animal — it produces a merge commit whose tree is *identical to yours*, discarding the other branch's content entirely while recording it as merged. That is occasionally exactly what you want (retiring an abandoned branch so it stops showing up as unmerged) and is otherwise a way to silently lose an entire feature.

Custom **merge drivers** handle files where the generic algorithm is always wrong. A `union` driver keeps both sides of an append-only file. A driver that runs a generator can resolve a lockfile properly instead of producing a conflict nobody can read.

**A merge driver for a generated lockfile**

```ini
# .git/config  (or ~/.gitconfig - drivers are not committed)
[merge "npm-lock"]
    name = regenerate package-lock.json
    driver = npm-merge-driver merge %A %O %B %P
[merge "union-append"]
    name = keep both sides of an append-only file
    driver = git merge-file --union -- %A %O %B
```

```text
# .gitattributes  (this part IS committed)
package-lock.json merge=npm-lock
CHANGELOG.md      merge=union-append
*.generated.go    merge=ours -diff
docs/api.json     -diff linguist-generated=true
```

> **Tip**
>
> Recurring conflicts in the same file are almost always a **file-layout** problem rather than a Git problem. A shared changelog, a single alphabetical list of feature flags, a monolithic fixtures file — every one of these conflicts by construction. Splitting the file per change (the model behind tools like `towncrier` and Changesets) eliminates the conflict class entirely, which no merge driver can.

<a id="21-rebase"></a>

## 21. Rebase

`git rebase <upstream>` finds the commits reachable from HEAD but not from `<upstream>`, saves each as a patch, checks out `<upstream>`, and replays the patches one at a time. Each replayed commit gets a new parent, therefore a new id. The content may be identical; the objects are not, and the originals become unreachable.

> **Interactive animation:** `rebase-vs-merge` — rendered by the page script in the HTML version.

That single fact generates the entire rule set. Because ids change, anyone who already has the old commits now has a history that disagrees with yours; their `git pull` will merge the two versions and duplicate every change. Hence: **rebase only commits that exist nowhere but your machine.** The corollary is that rebasing a feature branch you alone are working on — even a pushed one, provided you tell the people who might have it — is completely normal, and is how most teams keep branches current.

**Rebasing safely**

```bash
git fetch origin
git rebase origin/main             # replay my commits onto the new tip
#   conflict:   fix, git add, git rebase --continue
#   bad idea:   git rebase --abort              (always safe)
#   commit now redundant: git rebase --skip

git rebase --update-refs origin/main   # carry stacked branches along
git rebase -r origin/main              # preserve merges (--rebase-merges)
git rebase --exec 'pytest -q' origin/main   # run tests after EVERY commit

git push --force-with-lease            # never plain --force
git range-diff origin/main @{1} HEAD   # prove the rebase changed nothing else
```

```ini
[rebase]
    autosquash = true
    autostash = true      # stash a dirty tree around the rebase
    updateRefs = true     # move branches inside the rebased range
    missingCommitsCheck = error   # warn if the todo list drops a commit
[alias]
    please = push --force-with-lease
    sync = "!git fetch origin && git rebase origin/main"
```

`--exec` deserves more attention than it gets. `git rebase --exec 'pytest -q' origin/main` runs the test suite after every replayed commit and stops at the first failure, which is how you verify the claim that “every commit on this branch builds” instead of asserting it. On a five-commit branch it costs five test runs and turns a bisectable history from an aspiration into a checked property.

> **Key idea**
>
> Use `--force-with-lease`, always, and alias it so `--force` never gets typed. Plain `--force` overwrites the remote unconditionally. `--force-with-lease` first verifies the remote ref is still where your last fetch saw it, converting “I deleted a colleague's commits” into “the push was rejected”. Add `--force-if-includes` (Git 2.30+) to also require that your local branch has incorporated everything you have fetched.

<a id="22-interactive-rebase"></a>

## 22. Interactive Rebase

`git rebase -i <base>` writes a **todo list** to a file and opens it: one line per commit in the range, *oldest first*. You edit the verb at the start of each line, save, and Git executes the list. Because the list is just a file, everything about interactive rebase is scriptable and, until it finishes, abortable.

> **Interactive animation:** `interactive-rebase` — rendered by the page script in the HTML version.

| Verb | Effect |
| --- | --- |
| `pick` / `p` | replay the commit unchanged |
| `reword` / `r` | replay it, then open an editor for the message |
| `edit` / `e` | replay it, then stop so you can amend or split it |
| `squash` / `s` | fold into the previous commit, combine both messages |
| `fixup` / `f` | fold in, discard this message |
| `drop` / `d` | delete the commit (deleting the line does the same) |
| `exec` / `x` | run a shell command at this point |
| `break` / `b` | stop here, for no reason other than to look around |

**The workflow you will actually use**

```bash
git log --oneline main..HEAD       # exactly what you are about to rewrite

# Don't hand-edit the todo list. Mark fixes as you make them:
git add src/parser.py
git commit --fixup=9c1d2e3         # message becomes "fixup! add parser"
git commit --squash=9c1d2e3        # ... if you also want to edit the message

git rebase -i --autosquash main    # reorders and folds them for you
git log --oneline main..HEAD       # verify
git push --force-with-lease

# Split one commit into two
git rebase -i main                 # mark the commit 'edit'
git reset HEAD~                    #   its changes are now unstaged
git add -p && git commit -m "part one"
git add -A  && git commit -m "part two"
git rebase --continue
```

```text
pick   b2c3d4e add parser
fixup  7a8b9c0 fixup! add parser
reword d4e5f6a add tests
drop   1f2e3d4 wip
exec   pytest -q

# Rebase 9c1d2e3..1f2e3d4 onto 9c1d2e3 (5 commands)
#
# Commands:
#  p, pick    = use commit
#  r, reword  = use commit, but edit the message
#  e, edit    = use commit, but stop for amending
#  s, squash  = meld into previous commit
#  f, fixup   = like squash but discard this commit's message
#  x, exec    = run command (the rest of the line) using shell
#  b, break   = stop here (continue with 'git rebase --continue')
#  d, drop    = remove commit
#
# These lines can be re-ordered; they are executed from top to bottom.
# If you remove a line here THAT COMMIT WILL BE LOST.
```

> **Tip**
>
> `rebase.updateRefs = true` (Git 2.38+) makes stacked branches practical. If `feature-b` sits on top of `feature-a` which sits on `main`, rebasing the bottom of the stack normally strands everything above it; with this setting Git moves every branch pointer that falls inside the rebased range. Combined with `--autosquash` it removes most of the reason people reach for stacked-PR tooling.

<a id="23-rebase-onto"></a>

## 23. rebase --onto and History Surgery

Plain `git rebase <upstream>` conflates two questions: which commits to move, and where to put them. `git rebase --onto <newbase> <upstream> <branch>` separates them, and once you read the three arguments as three answers — *onto* where, *after* what, *which* branch — a whole class of surgery becomes routine.

> **Interactive animation:** `rebase-onto` — rendered by the page script in the HTML version.

**Four jobs, one command shape**

```bash
# 1. Branched off the wrong branch. Move feature-b from feature-a to main.
git rebase --onto main feature-a feature-b

# 2. Drop one commit from the middle of a branch.
git rebase --onto <bad>~1 <bad> feature

# 3. Move only the last three commits of this branch onto release/2.4
git rebase --onto release/2.4 HEAD~3 feature

# 4. Recover after someone force-pushed the branch you were building on.
git rebase --onto origin/feature origin/feature@{1} my-work
#                 ^ new upstream  ^ where it used to be, from the reflog

# Always verify a rewrite did only what you intended
git range-diff @{1}...HEAD
```

Two more history-rewriting tools sit beyond rebase. `git filter-repo` (the supported replacement for the slow and footgun-laden `git filter-branch`) rewrites every commit in a repository according to rules — remove a path from all history, rewrite author emails, extract a subdirectory into its own repo. `git replace` is the gentler alternative: it records “when you see commit A, use commit B instead” without changing any id, which lets you graft an imported history onto an existing one non-destructively.

**Whole-history rewrites**

```bash
pip install git-filter-repo

# Remove a path from every commit that ever contained it
git filter-repo --invert-paths --path config/secrets.yml

# Extract a subdirectory into its own repository, keeping its history
git filter-repo --subdirectory-filter services/billing

# Fix author addresses across all history
git filter-repo --mailmap ../mailmap.txt

# Non-destructive alternative: graft without changing ids
git replace --graft <first-commit-of-new-history> <tip-of-old-history>
git replace -l
git filter-repo --force          # make the replacements permanent
```

```text
# .mailmap - fix names and addresses WITHOUT rewriting history.
# Git applies this to log, blame and shortlog output.
Ada Lovelace <ada@example.com> <ada@old-employer.example>
Ada Lovelace <ada@example.com> Ada L <ada.l@example.com>
Grace Hopper <grace@example.com> <ghopper@example.com>
```

> **Warning**
>
> A whole-history rewrite changes **every commit id in the repository**. Every clone, every open pull request, every CI cache, every commit id quoted in an issue and every deployment pinned to a SHA becomes invalid. Treat it as a migration with an announcement and a cut-over, not as a command. If the goal is merely to make a `.mailmap`-style correction, use `.mailmap` — it changes output without touching a single object.

<a id="24-cherry-pick"></a>

## 24. Cherry-pick and Patches

`git cherry-pick` takes the diff between a commit and its parent and applies it where you are, committing the result. The new commit has the same content change, a different parent, and therefore a different id. This is the standard mechanism for backporting a fix to a release branch.

> **Interactive animation:** `cherry-pick` — rendered by the page script in the HTML version.

**Cherry-pick, and its flags**

```bash
git cherry-pick <sha>
git cherry-pick -x <sha>        # record '(cherry picked from commit ...)'
git cherry-pick A..B            # a range, EXCLUDING A
git cherry-pick A^..B           # a range, INCLUDING A
git cherry-pick -n <sha>        # apply and stage, do not commit
git cherry-pick -m 1 <merge>    # pick a merge, relative to parent 1
git cherry-pick --continue | --skip | --abort

# Which of my commits are not upstream yet? (compares by patch, not id)
git cherry -v origin/main
git log --cherry-pick --left-right --oneline main...release/2.4
```

Always use `-x` on release branches. The trailer it adds is how a maintainer six months later discovers that the mysterious commit on `release/2.4` corresponds to a well-discussed commit on `main`. Git also compares commits by *patch id* — a hash of the diff itself, ignoring context and ids — which is how `git cherry` and `--cherry-pick` can tell that two different commits are the same change, and why a cherry-picked fix usually does not conflict when the branch is finally merged.

Below cherry-pick sits the **email patch workflow** that Git was originally built for and that the Linux kernel still uses. `format-patch` turns commits into mbox files; `am` applies them, preserving authorship. It remains the best way to move commits between repositories that have no common remote.

**Patches as files**

```bash
git format-patch -3                      # last 3 commits as .patch files
git format-patch origin/main --cover-letter
git am < 0001-fix-parser.patch           # apply, keeping the original author
git am --3way < broken.patch             # fall back to a 3-way merge
git am --abort

# The simpler, authorship-losing version
git diff main..feature > feature.diff
git apply --check feature.diff           # will it apply cleanly?
git apply --3way feature.diff

# A self-contained repository fragment, for moving history offline
git bundle create repo.bundle --all
git clone repo.bundle restored/
```

<a id="25-stash"></a>

## 25. Stash

A stash is not a scratch file: `git stash` creates real commit objects — one for the index state and one for the working tree, with the current HEAD as a parent — and points `refs/stash` at them. The reflog on that ref is what makes `stash@{1}`, `stash@{2}` and so on behave like a stack.

> **Interactive animation:** `stash-flow` — rendered by the page script in the HTML version.

**Stash, with the flags that prevent surprises**

```bash
git stash push -u -m "wip: parser"   # -u INCLUDES untracked files
git stash push -p                    # choose hunks interactively
git stash push -- src/parser.py      # only these paths
git stash push --keep-index          # stash the unstaged remainder only

git stash list
git stash show -p stash@{1}          # what is in it
git stash apply stash@{1}            # keep the entry (safer)
git stash pop                        # apply + drop
git stash branch fix-parser stash@{0}   # new branch from the entry
git stash drop stash@{0}
git stash clear                      # DANGEROUS - no confirmation
```

Three behaviours surprise people. Untracked files are *not* stashed without `-u`, so the new file you just created stays on disk and travels with you across branches. `pop` does *not* drop the entry if the apply conflicts, which is a safety feature that reads like a bug. And a stash entry records the commit it was made on, so applying it to a branch that has moved on is a three-way merge that can conflict — `git stash branch` exists precisely for that case, recreating the original base before applying.

> **Warning**
>
> Stashes are unreachable commits with no branch: never pushed, invisible to `git log`, and `git stash clear` discards them with no confirmation and no reflog to lean on. Recovery afterwards means `git fsck --unreachable | grep commit` and reading candidate objects by hand, and only until `gc` runs. For anything you would mind losing, make a throwaway branch and commit. Stashes are for the next ten minutes.

<a id="26-reflog"></a>

## 26. Reflog and Recovery

Every time a ref changes value, Git appends a line to `.git/logs/<ref>` recording the old id, the new id, who did it, when, and what command caused it. That journal is the **reflog**, and because it records *pointer movements* rather than commits, it survives every operation that makes commits unreachable — reset, rebase, amend, branch deletion, a botched merge.

> **Interactive animation:** `reflog-rescue` — rendered by the page script in the HTML version.

**The recovery ladder, in order**

```bash
# 1. Reflog: covers anything that was ever committed or checked out
git reflog
git reflog show feature             # per-branch, not just HEAD
git reflog --date=iso
git reset --hard HEAD@{1}           # undo the last HEAD move
git branch rescue HEAD@{3}          # name a position from the journal
git checkout -b recovered <sha>

# 2. Time-based revision syntax, backed by the same journal
git show main@{yesterday}
git diff main@{'2 hours ago'} main

# 3. fsck: objects the reflog no longer mentions
git fsck --lost-found --unreachable
git cat-file -p <dangling-sha>      # read it before deciding
ls .git/lost-found/commit/

# 4. Nothing above helps for edits that were never staged or stashed.
```

The limits are as important as the capability. The reflog is **per-repository and never transferred** — it is not cloned, fetched or pushed, so a colleague's reflog cannot rescue you and a server's reflog is not yours. Entries expire: `gc.reflogExpire` defaults to 90 days for reachable commits and `gc.reflogExpireUnreachable` to 30 days for the rest. And it only knows about things that became objects, so an edit you never staged, committed or stashed has no entry anywhere.

> **Tip**
>
> Two settings worth applying globally: `git config --global gc.reflogExpireUnreachable 90.days` keeps orphaned commits for a quarter instead of a month, and `git config --global gc.pruneExpire 30.days` gives unreachable objects a longer stay of execution. Neither costs anything you will notice on a normal repository.

<a id="unit-5"></a>

## Unit 5 — Remotes & Collaboration

How repositories talk to each other, and the workflows teams build on top.

<a id="27-remote-model"></a>

## 27. The Remote Model

A **remote** is a named URL plus a fetch refspec. It is not a copy of anything; it is an address. What your repository actually holds is a set of **remote-tracking branches** under `refs/remotes/<remote>/`, which record where each branch was on that remote the last time you communicated with it. `origin/main` is a local ref you cannot push to and should not try to edit — a cached photograph of the server, not a window onto it.

> **Interactive animation:** `remote-model` — rendered by the page script in the HTML version.

Nothing in Git contacts the network unless you tell it to. There is no polling, no background sync, no notification. Every statement `git status` makes about “ahead” or “behind” is measured against your cached remote-tracking ref, and is therefore exactly as fresh as your last `git fetch`.

**Managing remotes**

```bash
git remote -v
git remote add upstream https://github.com/org/project.git
git remote set-url origin git@github.com:me/project.git
git remote rename origin github
git remote show origin              # tracking config, stale branches
git remote prune origin             # delete refs for branches gone upstream

# The fork workflow: pull from upstream, push to your own
git remote add upstream https://github.com/org/project.git
git fetch upstream
git switch -c fix upstream/main
git push -u origin fix              # push to MY fork
```

```ini
[remote "origin"]
    url = git@github.com:me/project.git
    fetch = +refs/heads/*:refs/remotes/origin/*
[remote "upstream"]
    url = https://github.com/org/project.git
    fetch = +refs/heads/*:refs/remotes/upstream/*
[fetch]
    prune = true
    pruneTags = true
# Use SSH even when a URL says https, without editing every remote
[url "git@github.com:"]
    insteadOf = https://github.com/
```

Clone options matter more than they look on a large repository. `--depth=1` gives a shallow clone with no history (fast, but `log` and `blame` are useless and some operations refuse to run). `--filter=blob:none` gives a *blobless* clone: full history and trees, but file contents fetched on demand — usually the better trade for CI and increasingly for humans. `--single-branch` fetches one branch instead of all of them.

<a id="28-refspecs"></a>

## 28. fetch, push, and Refspecs

A **refspec** is `[+]<source>:<destination>` — the mapping that tells Git which refs on one side correspond to which refs on the other. The leading `+` means “allow a non-fast-forward update”. Every remote has a default fetch refspec in its config, and once you can read it, `fetch` and `push` stop being magic.

> **Interactive animation:** `fetch-pull-push` — rendered by the page script in the HTML version.

**Refspecs, explicitly**

```bash
# The default, from .git/config:
#   fetch = +refs/heads/*:refs/remotes/origin/*
# "take every branch on origin, store it under refs/remotes/origin/"

git fetch origin                             # use the configured refspec
git fetch origin main:refs/remotes/origin/main
git fetch origin refs/pull/42/head:refs/heads/pr-42   # fetch a PR

git push origin feature                      # feature -> refs/heads/feature
git push origin HEAD:main                    # push my HEAD onto their main
git push origin :old-branch                  # empty source = DELETE
git push origin --delete old-branch          # the readable spelling
git push origin +feature                     # force, via the refspec. avoid.

git ls-remote origin                         # what refs exist, without fetching
git ls-remote --heads origin 'refs/heads/release/*'
```

A push is accepted only if the update is a **fast-forward** — the new id must have the old id as an ancestor. If not, the server rejects it as *non-fast-forward*, because accepting would make commits it currently has unreachable. This is the single most common push failure, and the fix is always the same shape: fetch, integrate, push. Forcing at that moment is how other people's work disappears.

| Command | Touches | Risk |
| --- | --- | --- |
| `git fetch` | remote-tracking refs only | None — cannot conflict or lose work |
| `git pull` | fetch, then merge or rebase your branch | Can conflict; can rewrite local commits with `--rebase` |
| `git push` | the remote's branch | Rejected unless fast-forward |
| `git push --force-with-lease` | the remote's branch, checked | Refuses if the remote moved since your last fetch |
| `git push --force` | the remote's branch, unconditionally | **Destroys** commits you have never seen |

> **Key idea**
>
> `git pull` is not a primitive. It is `git fetch` plus a second command, and which second command is a configuration choice. Set it deliberately: `pull.ff = only` to make pull a strict update that fails rather than guessing, or `pull.rebase = true` to replay your local commits on top. Modern Git refuses to run a bare pull on a diverged branch until you choose — that prompt is a feature, not an annoyance.

<a id="29-tracking"></a>

## 29. Tracking Branches and Upstreams

A local branch may have an **upstream**: a remote-tracking ref it is associated with, stored as `branch.<name>.remote` and `branch.<name>.merge` in `.git/config`. The upstream is what makes bare `git pull` and `git push` work with no arguments, what `@{u}` resolves to, and what `git status` compares against to say “ahead 2, behind 1”.

**Upstreams and the triangular workflow**

```bash
git push -u origin feature          # push and set the upstream
git branch --set-upstream-to=origin/main main
git branch --unset-upstream
git branch -vv                      # every branch and its upstream
git rev-parse --abbrev-ref @{u}     # what is my upstream?

git log @{u}..                      # what I have that upstream does not
git log ..@{u}                      # what upstream has that I do not
git status -sb                      # ahead/behind, compactly

# Triangular: fetch from upstream, push to my fork
git config remote.pushDefault origin
git config branch.main.remote upstream
git rev-parse --abbrev-ref @{push}  # where a bare push would go
```

```ini
[branch "main"]
    remote = upstream      # pull from here
    merge = refs/heads/main
[remote]
    pushDefault = origin   # ... but push to my fork
[push]
    default = simple       # push the branch of the same name; refuse otherwise
    autoSetupRemote = true # first push needs no -u
[branch]
    autoSetupMerge = simple
    sort = -committerdate
```

> **Warning**
>
> Remote-tracking refs are **not** deleted when the branch disappears upstream, so `git branch -r` slowly fills with branches that no longer exist and `git switch <name>` can silently recreate one from a stale ref. Set `fetch.prune = true` and `fetch.pruneTags = true` once and the problem disappears permanently.

<a id="30-tags"></a>

## 30. Tags and Releases

A tag is a ref that does not move. There are two kinds and the difference is not cosmetic. A **lightweight** tag is just a file under `refs/tags/` holding a commit id. An **annotated** tag creates a fourth kind of Git object — a tag object with its own id, containing the target, a tagger, a date, a message, and optionally a GPG or SSH signature. Releases should always be annotated: the metadata is the point.

**Tagging properly**

```bash
git tag v2.4.0                          # lightweight - avoid for releases
git tag -a v2.4.0 -m "Release 2.4.0"    # annotated
git tag -s v2.4.0 -m "Release 2.4.0"    # annotated + signed
git tag -a v2.3.9 <sha>                 # tag an older commit

git tag -l 'v2.*' --sort=-v:refname
git show v2.4.0                         # tag object, then the commit
git cat-file -p v2.4.0                  # the raw tag object
git tag --contains <sha>                # which releases include this fix?

# Tags are NOT pushed by default
git push origin v2.4.0
git push --follow-tags                  # push annotated tags on the branch
git push origin --delete v2.4.0         # delete remotely
git tag -d v2.4.0                       # ... and locally

git describe --tags                     # v2.4.0-14-g9c1d2e3
git describe --tags --always --dirty    # good for build metadata
```

```yaml
# Release on tag push - the common CI shape
name: release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # tags and history: git describe needs them
      - run: git describe --tags --always --dirty
      - run: make build
      - run: gh release create "${GITHUB_REF_NAME}" --generate-notes
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`git describe` deserves a mention as the standard way to stamp a build. It produces `<nearest-tag>-<commits-since>-g<short-sha>`, which is human-readable, sorts sensibly, and identifies an exact commit. Add `--dirty` and a build made from a modified working tree says so, which is worth a great deal the first time an unreproducible binary turns up in production.

> **Warning**
>
> Never move a published tag. `git tag -f` plus a force-push will update the server, but clients that already fetched the old tag keep it — Git does not update an existing tag on fetch unless forced — so different machines end up disagreeing about what `v2.4.0` means, silently. If a release is wrong, publish `v2.4.1`.

<a id="31-workflows"></a>

## 31. Branching Strategies and Pull Requests

A branching strategy is a decision about *batch size* wearing Git clothing. Every difference between the three common models reduces to how long a change is allowed to live outside the trunk, and every pathology — painful merges, week-long reviews, release branches that drift — is a symptom of that number being large.

> **Interactive animation:** `branching-strategies` — rendered by the page script in the HTML version.

| Model | Branch lifetime | Fits | Cost |
| --- | --- | --- | --- |
| Trunk-based | hours | continuous delivery, strong CI, feature flags | requires flags and real test discipline |
| GitHub Flow | days | most teams; all open source | degrades badly when PRs sit open |
| Git Flow | weeks | versioned software with supported releases | two permanent branches, every fix merged twice |

The **pull request** is not a Git concept — it is a hosting-product feature wrapped around a branch and a merge. What it adds is review, CI status and a merge policy. The policy choice shows up directly in your history:

- **Merge commit** Keeps every commit and records the branch as a unit. `--first-parent` reads as one entry per feature, and the whole feature can be reverted with `revert -m 1`. Costs a branchy graph.
- **Squash** One commit per PR on the trunk: a clean, linear, bisectable history. Costs the individual commits and, crucially, makes the source branch look unmerged — delete it immediately or it will be re-proposed.
- **Rebase-merge** Linear history with every commit preserved — appealing, but each commit gets a new id and none of them were ever tested in that arrangement unless the forge re-runs CI after the rebase.
- **Long-lived branches** Whatever the merge policy, a branch open for three weeks is a conflict with a countdown timer, and a review nobody can do properly in one sitting.

A **merge queue** is the fix for the subtle failure that all of these share: CI tested your branch against the `main` of an hour ago, not against the `main` that will exist after the three PRs ahead of you land. The queue re-tests each change against the actual resulting trunk before merging, which is the only way to make “green means safe to merge” literally true.

**Keeping a branch reviewable**

```bash
git switch -c feat/retry origin/main
# ... work, committing freely, using --fixup for corrections ...

git fetch origin
git rebase -i --autosquash origin/main    # tidy AND update in one step
git rebase --exec 'pytest -q' origin/main # prove every commit passes
git push --force-with-lease

git log --oneline origin/main..HEAD       # exactly what the reviewer sees
git diff origin/main...HEAD --stat        # the PR diff
```

```yaml
# Enforce the policy in CI rather than in a wiki page
name: pr-hygiene
on: pull_request

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Reject fixup! commits
        run: |
          git log --format=%s origin/${{ github.base_ref }}..HEAD \
            | grep -E '^(fixup|squash)!' && exit 1 || true
      - name: Every commit must build
        run: |
          git rebase --exec 'make test' origin/${{ github.base_ref }}
```

<a id="unit-6"></a>

## Unit 6 — Power Tools & Maintenance

Hooks, bisect, worktrees, big repos, maintenance and security, plus the revision material.

<a id="32-hooks"></a>

## 32. Hooks and Automation

Hooks are executable files in `.git/hooks/` that Git runs at defined points. They are **not committed** and **not cloned**, which is a deliberate security decision — cloning a repository must never execute code the author chose. That is also why sharing hooks across a team requires either `core.hooksPath` pointing at a committed directory, or a manager like `pre-commit` or Husky.

| Hook | Runs | Can block? | Good for |
| --- | --- | --- | --- |
| `pre-commit` | before the message editor | Yes | lint, format, secret scan |
| `prepare-commit-msg` | before the editor opens | No | insert a ticket id from the branch name |
| `commit-msg` | after the message is written | Yes | enforce message format |
| `pre-push` | before objects are sent | Yes | run tests; refuse pushes to `main` |
| `post-checkout` | after switching | No | reinstall dependencies when the lockfile changed |
| `pre-receive` | *server side*, before accepting | Yes | the only place a policy is truly enforced |

**A pre-commit hook that tests what you are committing**

```bash
#!/usr/bin/env bash
# .githooks/pre-commit   (then: git config core.hooksPath .githooks)
set -euo pipefail

# Only the staged files, and only ones that still exist
mapfile -t files < <(git diff --cached --name-only --diff-filter=ACM -- '*.py')
[ ${#files[@]} -eq 0 ] && exit 0

# Hide unstaged work so the checks see exactly the commit content.
stash=$(git stash create) || true
if [ -n "${stash}" ]; then
    git stash store -m "pre-commit backup" "${stash}"
    git checkout-index -a -f --prefix="$(git rev-parse --show-toplevel)/"
fi

ruff check "${files[@]}"
ruff format --check "${files[@]}"
pytest -q --testmon || { echo "tests failed - commit aborted"; exit 1; }
```

```yaml
# .pre-commit-config.yaml - committed, versioned, installed per clone
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict     # refuse leftover <<<<<<< markers
      - id: check-added-large-files
        args: ['--maxkb=500']
      - id: detect-private-key
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
```

> **Warning**
>
> Client-side hooks are a convenience, never a control. `git commit --no-verify` skips them, they are not installed on a fresh clone, and CI runners do not run them. Anything that genuinely must hold — no secrets, no direct pushes to `main`, signed commits — belongs in a server-side `pre-receive` hook or a branch protection rule. Use client hooks to give fast feedback, and the server to enforce.

<a id="33-bisect"></a>

## 33. Bisect

`git bisect` binary-searches history for the commit that introduced a behaviour change. You supply one commit known good and one known bad; Git checks out the midpoint, you report the result, and it halves the remaining range. A 10,000-commit range takes about fourteen tests.

> **Interactive animation:** `bisect` — rendered by the page script in the HTML version.

**Manual and automated bisection**

```bash
git bisect start
git bisect bad                 # HEAD is broken
git bisect good v2.3.0         # this release was fine
#   ... test, then one of:
git bisect good | git bisect bad | git bisect skip
git bisect reset               # return to where you started

# Automated: exit 0 = good, 1-124 = bad, 125 = untestable (skip)
git bisect start HEAD v2.3.0
git bisect run ./scripts/probe.sh

# Narrow the search to commits that touched relevant code
git bisect start -- src/retry/

# Save and replay a run you want to correct
git bisect log > bisect.log
git bisect reset
git bisect replay bisect.log

# Rename the terms when 'good/bad' is the wrong polarity
git bisect start --term-old=fast --term-new=slow
```

```bash
#!/usr/bin/env bash
# scripts/probe.sh - a bisect probe that will not lie to you
set -u

# A commit that cannot even build is untestable, not bad.
make build >/dev/null 2>&1 || exit 125

# One focused test. Bisect runs this ~log2(n) times; speed matters.
timeout 120 pytest -q tests/test_retry.py::test_backoff_is_capped
rc=$?

# A timeout is not evidence of the bug either.
[ $rc -eq 124 ] && exit 125
exit $rc
```

Bisect assumes a single clean transition from good to bad. Intermittent failures break that assumption and bisect will confidently report a wrong commit, so make the probe deterministic before you start — run the flaky test five times and require all five to pass, or find a more reliable reproduction. Exit code `125` is the pressure valve for commits that cannot be evaluated at all, and `git bisect log` before `reset` means a run you later doubt can be replayed and corrected rather than restarted.

<a id="34-worktrees"></a>

## 34. Worktrees

`git worktree` gives one repository several working directories, each with its own HEAD and index, all sharing a single object database. It replaces the habit of cloning the repository three times to work on three branches — without duplicating history, and without the clones drifting out of sync.

**Several checkouts, one object database**

```bash
git worktree add ../proj-hotfix hotfix/2.4.1     # existing branch
git worktree add -b review/pr-42 ../proj-review origin/pr-42
git worktree add --detach ../proj-bisect HEAD    # a scratch tree to bisect in

git worktree list
git worktree remove ../proj-review
git worktree prune                # clean up after deleting a directory

# Typical use: review a PR without disturbing your in-progress branch
git fetch origin pull/42/head:pr-42
git worktree add ../review pr-42
cd ../review && pytest -q
```

Three constraints. A branch can be checked out in only one worktree at a time — Git refuses rather than let two trees fight over one ref. Each worktree has its own HEAD, index and reflog but shares objects, refs, config and stashes. And submodules interact poorly with worktrees, so a submodule-heavy repository may still need separate clones.

> **Tip**
>
> Worktrees make long-running builds painless. Keep your feature branch in the main tree and add a second worktree pinned to `main` for benchmarks, or a third for a bisect run — each has its own build output directory, so nothing is invalidated when you switch. The disk cost is one checkout, not one repository.

<a id="35-scaling"></a>

## 35. Submodules, Subtrees, and Scaling Big Repos

A **submodule** is a tree entry with mode `160000` holding a commit id from another repository. The parent repo records “at this path, that project at exactly this commit”, and `.gitmodules` records where to clone it from. The pointer is exact, which is the feature; the fact that it must be updated by hand is the cost.

**Submodules, with the flags that avoid the usual pain**

```bash
git submodule add https://github.com/org/lib.git vendor/lib
git clone --recurse-submodules <url>        # or people get empty directories
git submodule update --init --recursive     # the fix after a plain clone

cd vendor/lib && git switch main && git pull    # submodules start DETACHED
cd ../.. && git add vendor/lib && git commit -m "chore: bump lib"

git submodule update --remote               # move every submodule to its tip
git submodule foreach 'git switch main && git pull'
git submodule status
git diff --submodule=log                    # readable submodule diffs

git config --global submodule.recurse true
git config --global diff.submodule log
git config --global status.submodulesummary 1
```

```text
# .gitmodules - committed, so everyone gets the same mapping
[submodule "vendor/lib"]
    path = vendor/lib
    url = https://github.com/org/lib.git
    branch = main
    shallow = true
```

**Subtree** is the alternative: the other project's files are copied into your repository as ordinary files, with its history merged in under a prefix. Nobody needs special commands to clone or build, which is its whole advantage. The cost is a larger repository and a clumsier path for contributing changes back upstream.

**Subtree — vendoring with history**

```bash
git subtree add --prefix=vendor/lib https://github.com/org/lib.git main --squash
git subtree pull --prefix=vendor/lib https://github.com/org/lib.git main --squash
git subtree push --prefix=vendor/lib git@github.com:me/lib.git my-fix
```

For repositories that are simply **large**, the modern answers are all about fetching less. **Partial clone** (`--filter=blob:none`) downloads commits and trees but no file contents, fetching blobs on demand — history and `log` still work, and clone time collapses. **Sparse-checkout** materialises only some directories in the working tree. **Shallow clone** (`--depth=1`) is the blunt instrument: fast, but it breaks `log`, `blame`, `describe` and merge-base calculations, so reserve it for throwaway CI jobs. **Git LFS** replaces large binaries with small pointer files and stores the real content elsewhere.

**Making a huge repository usable**

```bash
# Blobless clone: full history, file contents on demand. Usually the best trade.
git clone --filter=blob:none <url>

# Only check out the directories you work in
git sparse-checkout init --cone
git sparse-checkout set services/billing libs/common
git sparse-checkout list
git sparse-checkout disable

# Shallow: fast, but log/blame/describe stop working
git clone --depth=1 --single-branch --branch main <url>
git fetch --unshallow            # undo it when you need history

# Large binaries
git lfs install
git lfs track '*.psd' '*.mp4'
git add .gitattributes
git lfs ls-files
git lfs migrate import --include='*.psd'   # rewrites history!

# Speed up status and checkout on a big tree
git config core.fsmonitor true
git config core.untrackedCache true
git maintenance start            # background gc, commit-graph, prefetch
```

> **Warning**
>
> Submodules fail in a predictable pattern: someone clones without `--recurse-submodules` and gets empty directories, or commits in the submodule without pushing them, leaving the parent pointing at a commit nobody else can fetch. Set `submodule.recurse = true` globally and `push.recurseSubmodules = check` to catch the second case before it ships.

<a id="36-maintenance"></a>

## 36. Maintenance and Internals — gc, Packfiles, fsck

New objects are written *loose*: one zlib-compressed file each. Once enough accumulate, Git runs `gc`, which collects them into a **packfile** where similar objects are stored as deltas against one another, plus an `.idx` index mapping ids to offsets. Deltas here are purely a storage optimisation chosen by content similarity — not by commit order — so Git can still reconstruct any snapshot directly.

> **Interactive animation:** `packfile` — rendered by the page script in the HTML version.

**Measuring and maintaining a repository**

```bash
git count-objects -vH             # loose vs packed, and on-disk size
git gc                            # pack loose objects, prune, update indexes
git gc --prune=now                # also drop unreachable objects immediately
git repack -adf                   # repack everything into one pack
git fsck --full                   # verify every object's hash and links

# Find what is actually making the repository big
git verify-pack -v .git/objects/pack/*.idx \
  | sort -k3 -n -r | head -20 \
  | while read -r sha _ size _; do
      printf '%10s  %s\n' "$size" "$(git rev-list --objects --all \
        | grep "$sha" | cut -d' ' -f2-)"
    done

# Speed features worth enabling on any repo you use daily
git commit-graph write --reachable    # makes log --graph dramatically faster
git maintenance start                  # schedules gc, commit-graph, prefetch
git config feature.manyFiles true
```

`gc` runs automatically and you rarely need to call it, but two of its behaviours matter. It only prunes objects that are *unreachable and older than* `gc.pruneExpire` (two weeks by default), which is the grace period that makes reflog recovery possible — so `git gc --prune=now` is the command that genuinely deletes your safety net. And `--aggressive`, widely recommended on the internet, discards existing delta chains and recomputes them from scratch: hours of CPU for a marginal size win. Plain `git gc` is almost always the right call.

> **Tip**
>
> `git commit-graph write --reachable` builds a cache of the commit DAG, turning `git log --graph` and merge-base computations from repeated object parsing into index lookups. On a repository with hundreds of thousands of commits the difference is seconds versus tens of seconds, and `git maintenance start` keeps it current in the background.

<a id="37-security"></a>

## 37. Security — Signing and Scrubbing Secrets

Git's hashing proves *integrity* — that objects have not been corrupted or silently altered. It proves nothing about *authenticity*: the author and committer fields are free text and anyone can set them to your name. Signing is what closes that gap, and SSH signing (Git 2.34+) has made it far easier than the GPG era.

**Signing commits and tags with an SSH key**

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# Who is allowed to sign? Verification needs this file.
echo "ada@example.com $(cat ~/.ssh/id_ed25519.pub)" >> ~/.git-allowed-signers
git config --global gpg.ssh.allowedSignersFile ~/.git-allowed-signers

git commit -S -m "feat: signed"
git log --show-signature -3
git verify-commit HEAD
git verify-tag v2.4.0
git log --format='%h %G? %aN %s' -5    # G=good, B=bad, N=none, U=untrusted
```

```yaml
# Scan every push and every PR for credentials
name: secret-scan
on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0        # scan history, not just the tip
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

A leaked credential has a fixed response order, and getting the order wrong wastes the only time that matters. **Rotate first.** The moment a secret reaches a shared server it is compromised — it is in CI logs, in other clones, possibly in a fork or a cached pull request view, and no Git command retrieves it from any of those places. Only after rotation is it worth deciding whether scrubbing history is worth its cost, because a rewrite invalidates every clone, every open PR, and every commit id quoted anywhere.

**If a secret was committed**

```bash
# 1. ROTATE THE CREDENTIAL. Nothing below is a substitute for this.

# 2. Remove it from the current state (safe on a shared branch)
git revert <sha>   # or: git rm --cached .env && commit

# 3. Prevent a repeat
echo '.env' >> .gitignore
git config core.hooksPath .githooks    # with a gitleaks pre-commit hook

# 4. Only if policy requires the bytes gone from history:
pip install git-filter-repo
git filter-repo --invert-paths --path .env
git filter-repo --replace-text ../secrets-to-redact.txt
git push --force --all && git push --force --tags
#    ... then ask the host to run gc, and tell everyone to RE-CLONE.
#    Old commits stay reachable via forks and PR refs until they do.
```

> **Key idea**
>
> The controls that actually prevent this class of incident are all preventative: `.gitignore` entries for every credential file shape, a secret-scanning `pre-commit` hook for fast local feedback, a server-side `pre-receive` hook or push protection that cannot be bypassed with `--no-verify`, and secrets injected at runtime from a secret manager so there is nothing in the repository to leak in the first place.

<a id="38-cheat-sheet"></a>

## 38. Cheat Sheet

The mental model in one picture, then the commands grouped by what they move.

```text
  working tree        index          objects (immutable)
  ------------        -----          ------------------
   files on disk  ->  staged     ->   commit -> tree -> blob

        add ------------>|                 ^
        commit ----------------------->    |
        restore   <------|                 |
        restore --staged <-------------- HEAD
        reset --soft     : move the branch only
        reset --mixed    : + rewrite the index
        reset --hard     : + rewrite the working tree  (DESTRUCTIVE)

  refs/heads/main -> a commit    HEAD -> refs/heads/main
  refs/remotes/origin/main       (a cached photo of the server)
  refs/tags/v2.4.0               (a name that must not move)
  refs/stash                     (a stack of nameless commits)
  logs/HEAD                      (the reflog: every move, 90 days)
```

| Goal | Command |
| --- | --- |
| See everything at once | `git status -sb` |
| See exactly what will be committed | `git diff --staged` |
| Stage part of a file | `git add -p` |
| Unstage, keep the edit | `git restore --staged <p>` |
| Discard an uncommitted edit | `git restore <p>` **(unrecoverable)** |
| Fix the last local commit | `git commit --amend` |
| Squash the last N local commits | `git reset --soft HEAD~N && git commit` |
| Undo a pushed commit | `git revert <sha>` |
| Undo a pushed merge | `git revert -m 1 <sha>` |
| Bring a branch up to date | `git fetch && git rebase origin/main` |
| Tidy a branch before review | `git rebase -i --autosquash origin/main` |
| Move a branch to a different base | `git rebase --onto main old-base feature` |
| Push a rewritten branch | `git push --force-with-lease` |
| Backport one commit | `git cherry-pick -x <sha>` |
| Park work for ten minutes | `git stash push -u -m "…"` |
| Find lost commits | `git reflog` |
| Find objects even the reflog forgot | `git fsck --lost-found` |
| Find the commit that broke it | `git bisect run ./probe.sh` |
| Find where a value came from | `git log -S "value"` |
| Blame, ignoring formatting | `git blame -w -M -C` |
| Verify a rewrite changed nothing else | `git range-diff @{1}...HEAD` |
| Review a PR without switching branches | `git worktree add ../review pr-42` |
| Clone a huge repo quickly | `git clone --filter=blob:none <url>` |
| Make a big repo fast | `git maintenance start` |

**The configuration this course assumes**

```ini
[init]
    defaultBranch = main
[pull]
    ff = only
[push]
    autoSetupRemote = true
    followTags = true
[fetch]
    prune = true
    pruneTags = true
[merge]
    conflictStyle = zdiff3
[rebase]
    autosquash = true
    autostash = true
    updateRefs = true
[rerere]
    enabled = true
[diff]
    algorithm = histogram
    colorMoved = zebra
[blame]
    ignoreRevsFile = .git-blame-ignore-revs
[gc]
    reflogExpireUnreachable = 90.days
[alias]
    st = status --short --branch
    lg = log --oneline --graph --decorate --all
    lgm = log --oneline --first-parent main
    ap = add --patch
    fixup = commit --fixup
    ri = rebase --interactive --autosquash
    please = push --force-with-lease
    undo = reset --soft HEAD~1
    last = log -1 --stat
    unstage = restore --staged
```

<a id="39-playbook"></a>

## 39. Pattern-Recognition Playbook

Symptom on the left, diagnosis and command on the right. Almost every Git emergency is one of these.

| Symptom | What is actually true | Do |
| --- | --- | --- |
| “I committed but my change isn't in it” | You staged, then edited, then committed the stage | `git add` then `git commit --amend` |
| “My commits disappeared” | They are unreachable, not deleted | `git reflog`, then `git branch rescue <sha>` |
| “Push rejected, non-fast-forward” | The remote has commits you lack | `git fetch`, rebase or merge, push again |
| “Everything is duplicated after a pull” | Someone rebased and force-pushed | `git reset --hard origin/<branch>`, or `git pull --rebase` |
| “Up to date, but the PR shows conflicts” | Your `origin/main` is a stale cache | `git fetch --prune`, then look again |
| “Detached HEAD” | HEAD names a commit, not a branch | `git switch -c <name>` to keep the work |
| “`branch -d` says not merged, but it is” | It was squash- or rebase-merged, so ids differ | `git cherry -v main <branch>`, then `-D` |
| “Every line shows as changed” | Line endings or a reformat | `git diff -w`; fix with `* text=auto` |
| “`.gitignore` is ignored” | The file is already tracked | `git rm --cached <p>`; check `git check-ignore -v <p>` |
| “`blame` points at a formatter” | blame shows the last touch, not the origin | `git log -S`; add `.git-blame-ignore-revs` |
| “Same conflict, over and over” | A rebase asks per commit; the file is a shared list | `rerere.enabled`; `merge=union`; split the file |
| “The merge was clean but it's broken” | Git merges lines, not meaning | Run the tests after every merge; use a merge queue |
| “Feature vanished after we reverted the merge” | The merge commit still marks it merged | Revert the revert, or rebuild the branch |
| “Clone is enormous / slow” | Blobs, usually binaries in old history | `--filter=blob:none`; LFS; `verify-pack` to find them |
| “Submodule directory is empty” | Cloned without `--recurse-submodules` | `git submodule update --init --recursive` |
| “`git status` takes seconds” | Stat-ing a huge tree on every run | `core.fsmonitor`, `core.untrackedCache`, `git maintenance start` |
| “A secret got committed” | It is compromised the instant it is pushed | Rotate, then revert, then decide about `filter-repo` |

<a id="40-roadmap"></a>

## 40. Practice Roadmap

Reading about Git does not produce fluency; the commands only stick once you have watched them move real pointers. Every exercise below runs in a scratch repository you can delete afterwards, and none takes long.

1. **Build a commit with plumbing only.** In an empty repo, use `hash-object -w`, `update-index`, `write-tree`, `commit-tree` and `update-ref` to create a commit without ever running `git add` or `git commit`. Then `git log` it. Nothing else teaches the object model this quickly.
2. **Watch deduplication happen.** Create two files with identical contents in different directories, commit, and confirm with `git ls-tree -r HEAD` that both point at one blob. Change one byte and watch the id change completely.
3. **Break and restore three trees.** Stage a file, edit it further, commit, and predict what the commit contains before you check with `git diff --staged`. Repeat until the prediction is always right.
4. **Lose a commit on purpose.** Commit on a detached HEAD, switch away, then recover it with `reflog` and `branch`. Then do it again after a `git reset --hard HEAD~3`.
5. **Cause a conflict deliberately.** Two branches, same line, then merge. Inspect `git ls-files -u` and `git show :1:/:2:/:3:` before resolving. Turn on `zdiff3` and do it again to see the difference.
6. **Rebase the same divergence you just merged.** Reset both branches and redo it with `rebase`. Compare the two graphs with `git log --graph --all --oneline`.
7. **Clean up a scrappy branch.** Make five commits including a typo fix and a `wip`. Use `--fixup` plus `rebase -i --autosquash` to land two clean commits, then verify with `git rebase --exec 'echo ok' main`.
8. **Move a branch with `--onto`.** Branch off a branch, then relocate the top branch onto `main`. Confirm with `git log --oneline main..feature-b` that none of the middle branch's commits came along.
9. **Simulate a force-push collision.** Clone your own repo into two directories. Rebase and force-push from one; pull from the other and watch the duplication. Recover both ways.
10. **Automate a bisect.** Write a script that fails when a specific string is present, introduce that string 40 commits back, and let `git bisect run` find it.
11. **Review a pull request in a worktree.** Fetch a PR ref into a new worktree, run its tests, then remove the worktree — all without touching your current branch.
12. **Find the biggest objects in a real repository.** Run the `verify-pack` pipeline from section 36 on any large open-source clone and see what is actually taking the space.

> **Key idea**
>
> If you remember five things from forty sections: objects are named by their content, so nothing is ever modified — only added. A commit is a full snapshot plus its parents, so diffs are computed rather than stored. A branch is a file holding one id, so branching and merging are pointer arithmetic. HEAD points at a branch, and losing that indirection is detached HEAD. And “lost” almost always means *unreachable*, which the reflog undoes — except in the working tree, which Git does not protect at all.

<a id="further-reading"></a>

### Further Reading

1. [The Git Crash Course](git-crash-course.html) — the same material in fourteen animated sections, if you want the short version or a refresher.
2. [All Git courses](git-courses.html) — the catalog page for this topic.
3. [Pro Git](https://git-scm.com/book/en/v2) — free and complete; chapter 10, “Git Internals”, is the canonical write-up of the object database.
4. [The Git reference manual](https://git-scm.com/docs) — and in particular `git help revisions` and `git help glossary`, which answer far more questions than their reputation suggests.
5. [Learn Git Branching](https://learngitbranching.js.org/) — an interactive sandbox; the best place to drill `rebase --onto` and `cherry-pick`.
6. [git-filter-repo](https://github.com/newren/git-filter-repo) — the supported tool for history rewrites, with documentation that explains why `filter-branch` should not be used.

---

TechToday Study Library — Git
