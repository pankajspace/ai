<!--
Source: git-crash-course.html
Title: Git Crash Course | TechToday
Description: A visual crash course in Git — the three trees, commits as snapshots, branches as pointers, staging, diffing, reset and revert, merging and conflicts, rebase, interactive rebase, stash and cherry-pick, remotes, reflog and bisect, each explained with a step-by-step animation.
Theme-color: #0b0d10
Stylesheets: git-study.css, ../../site-header.css
Scripts: git-study.js
-->

Navigation: [TechToday](../../index.html) · [← Git Courses](git-courses.html)

<a id="git-crash-course"></a>

# Git

Most people learn Git as a list of incantations: `add`, `commit`, `push`, and a memorised spell for when something goes wrong. That works right up until the day it doesn't, because the commands only make sense once you can see the data structure underneath them. This page teaches the structure first — three trees, a graph of immutable snapshots, and a handful of pointers — and then shows every command as a move on that structure. Each mechanism is an **animation**: press **Play**, then walk it with the arrow buttons and read the note under each step. Code examples use the **Shell** tab by default; where a config file or a script is the better answer, the other tabs hold it.

> **Key idea**
>
> Three ideas carry almost all of Git. **Everything is content-addressed** — an object's name is the hash of what is inside it, so nothing can be modified, only added. **A commit is a full snapshot plus a pointer to its parent** — history is a graph of snapshots, and diffs are computed on demand, never stored. And **a branch is a 41-byte file holding one commit id** — so branching, merging and “moving” work are all just writing a different id into a small file. Hold those three and the command list stops being arbitrary.

<a id="table-of-contents"></a>

## Table of Contents

1. [The Three Trees — Working Tree, Index, HEAD](#1-three-trees)
2. [Commits Are Snapshots, and the Hash Is the Name](#2-snapshots)
3. [Branches Are Pointers — and So Is HEAD](#3-branches)
4. [Staging Deliberately — `add -p` and Good Commits](#4-staging)
5. [Reading What Changed — `status`, `diff`, `log`](#5-reading)
6. [Undoing — `restore`, `reset`, `revert`](#6-undo)
7. [Branching and Merging](#7-merging)
8. [Conflicts — What They Are and How to End Them](#8-conflicts)
9. [Rebase vs Merge, and the Golden Rule](#9-rebase)
10. [Interactive Rebase — Tidying Up Before Review](#10-interactive-rebase)
11. [Moving Work Around — `stash` and `cherry-pick`](#11-moving-work)
12. [Remotes — `fetch`, `pull`, `push`](#12-remotes)
13. [Getting Out of Trouble — `reflog` and `bisect`](#13-recovery)
14. [The Whole Thing on One Page](#14-one-page)

<a id="unit-1"></a>

## Unit 1 — How Git Thinks

The mental model: three trees, snapshot commits and branches that are just pointers.

<a id="1-three-trees"></a>

## 1. The Three Trees — Working Tree, Index, HEAD

- **Working tree** `not backed up`
- **Index** `one file`
- **HEAD** `immutable`

At any moment a tracked file exists in three places at once, and they can all disagree. The **working tree** is the ordinary directory you edit — real files on disk, with no Git magic in them. The **index** (also called the staging area, or the cache) is a single binary file, `.git/index`, that holds a complete proposed next commit: every path, its mode, and the id of its content. **HEAD** resolves to your last commit, which is immutable and stored in the object database. Almost every Git command is best understood as “copy content from one of these three into another”.

> **Analogy** 📦
>
> **Picture it — packing a parcel**
>
> Your desk is the working tree: things are half-finished, scattered, and you move them around freely. The open box is the index: you put in only the items that belong in *this* parcel, and you can take things back out until you seal it. Sealing the box and writing the label is the commit — after that the contents are fixed, and the only way to change your mind is to send a second parcel. The reason Git has a box at all, when other version control systems just ship your whole desk, is that it lets you send one coherent parcel even when your desk is a mess.

> **Interactive animation:** `three-trees` — rendered by the page script in the HTML version.

The single most useful habit in Git is to translate every command into the trees it touches, because the names are otherwise unhelpful. `git add` copies working tree → index. `git commit` copies index → a new commit. `git restore` copies index → working tree. `git restore --staged` copies HEAD → index. And `git reset` moves the branch pointer and then optionally copies HEAD → index (`--mixed`) and HEAD → working tree (`--hard`). Once you have that table, the flags stop needing to be memorised.

- **Strength — the index makes small commits possible** Because staging is separate from committing, you can have five unrelated edits on disk and ship them as five clean commits. Reviewers get changes they can actually reason about, and `git bisect` and `git revert` get commits small enough to be useful.
- **Weakness — the working tree has no safety net** Everything Git protects lives in the object database. An uncommitted, unstaged edit exists in exactly one place, so `git restore <file>` and `git checkout .` destroy work permanently and no reflog can help. Stage or stash before any destructive command.

**Ask each tree what it holds**

```bash
# The short status is two columns: index state, then working-tree state.
git status --short
# MM app.py      staged changes AND further unstaged changes
#  M README.md   modified, nothing staged
# A  new.py      newly staged
# ?? scratch.txt untracked - Git does not know about it at all

# What each tree actually contains
git ls-files --stage        # the index: mode, blob id, stage, path
git cat-file -p HEAD^{tree} # the last commit's root directory
ls -la                      # the working tree; just files
```

> **Warning**
>
> **The classic confusion.** You stage a file, then keep editing it, then commit — and the commit does not contain your latest edit. That is not a bug: `git add` snapshotted the bytes at the moment you ran it, and `git commit` ships the index, not your disk. The `MM` line in `git status --short` is Git telling you this has happened. `git add` again, or use `git commit -a` to stage all tracked modifications first.

**Interview question**

*You have edits to six files on disk. Two belong to a bug fix, three to a refactor, and one is a debug `print` you must not ship. How do you get two clean commits out of that, and what is the risk in the approach you choose?*

The instinct is to commit everything and sort it out later, which produces a commit that cannot be reverted or bisected usefully. The index exists for exactly this. Stage the two bug-fix files by path and commit them; stage the three refactor files and commit those; then deal with the debug line separately. The risk is the one above: what you committed is what you *staged*, so if the debug `print` is inside one of the files you staged, it ships. That is why the honest answer mentions verifying with `git diff --staged` before every commit — it shows precisely the contents of the commit you are about to make, and nothing else.

**Answer — split one messy tree into two clean commits**

```bash
git add src/parser.py src/parser_test.py
git diff --staged                 # read it. this IS the commit.
git commit -m "fix: reject empty config keys"

git add -p src/client.py src/http.py src/retry.py   # hunk by hunk
git diff --staged
git commit -m "refactor: extract retry policy"

git restore src/debug_helper.py   # throw the print away
git status --short                # expect: clean
```

<a id="2-snapshots"></a>

## 2. Commits Are Snapshots, and the Hash Is the Name

- **Object types** `4`
- **Commit lookup** `O(1)`
- **Stored diffs** `none`

A commit does not store a diff. It stores the id of a *complete snapshot* of your project, plus author, committer, message, and the ids of its parents. Every diff you have ever seen in Git was computed on the fly by comparing two snapshots. This sounds wasteful until you see the other half of the design: an object's filename *is* the SHA-1 of its contents, so two files with identical bytes are one object, and a file that did not change between commits is not stored twice. Storage cost tracks the amount of *distinct content*, not the number of commits.

> **Analogy** 🗄️
>
> **Picture it — a library that files books by their text**
>
> Imagine a library where a book's shelf number is computed from every word inside it. Two copies of the same book get the same number, so you only ever keep one. Changing a single comma produces a completely different number, so the old edition stays exactly where it was and the new one is filed elsewhere — nothing is ever overwritten. And if someone claims a book is unaltered, you can check by recomputing the number. That is content addressing, and it is simultaneously Git's deduplication, its immutability and its tamper detection.

> **Interactive animation:** `content-addressing` — rendered by the page script in the HTML version.

There are exactly four object types and you can inspect all of them. A **blob** is file contents with no name and no metadata. A **tree** is a directory listing: mode, type, object id, name — and a tree entry may point at another tree, which is how nesting works. A **commit** points at one root tree plus zero or more parents. A **tag** object is an annotated tag: a pointer plus a message and a signature. That is the whole database.

> **Interactive animation:** `object-graph` — rendered by the page script in the HTML version.

**Walk the object database by hand**

```bash
printf 'hello world\n' | git hash-object --stdin
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad

git cat-file -t HEAD          # commit
git cat-file -p HEAD          # tree / parent / author / committer / message
git cat-file -p HEAD^{tree}   # the root directory listing
git cat-file -p HEAD:README.md    # the blob behind one path

# Prove the commit id is a hash of the commit text:
git cat-file commit HEAD | git hash-object -t commit --stdin
git rev-parse HEAD            # ... the same 40 characters
```

```text
$ git cat-file -p HEAD
tree 1a1ba4a76f545cd5462ab48b04a807c363b13d9f
parent 9f2c1ab0d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9
author Ada <ada@example.com> 1789110842 +0530
committer Ada <ada@example.com> 1789110842 +0530

fix: reject empty config keys
```

- **Strength — history is verifiable, not just recorded** Each commit id covers its tree, which covers every file, and also its parent id, which covers all of history. Altering any past byte changes every id from there forward, so a shared commit id is a cryptographic statement about an entire history. `git fsck` checks this on demand.
- **Weakness — rewriting is contagious** The same property means you cannot quietly fix an old commit. Amending or rebasing produces new ids for that commit *and everything after it*, which is why history rewriting breaks other people's clones and why a leaked secret cannot simply be edited out of the past.

> **Tip**
>
> **SHA-1 and the collision question.** Git uses SHA-1, which is broken for collision resistance — but Git has shipped a hardened variant since 2017 that detects the known attack and refuses the object, and SHA-256 repositories are supported. It matters far less than it sounds: Git's threat model is accidental corruption plus casual tampering, and signed commits and tags are what you reach for when you need real authenticity.

**Interview question**

*If every commit stores a complete snapshot of the repository, why is a ten-year-old repository with 100,000 commits only a few hundred megabytes?*

Two mechanisms, and the interesting one is not compression. First, content addressing means unchanged files are not re-stored: a commit's tree simply reuses the same blob id, so a commit touching one file adds one blob and a handful of trees, not a copy of the project. Second, Git periodically runs `git gc`, which collects loose objects into a *packfile* where similar objects are stored as deltas against one another — and unlike systems that store deltas as the source of truth, these deltas are purely a storage optimisation chosen by similarity, so Git can always reconstruct any snapshot directly. The conceptual model stays “snapshots”; the physical layout is free to be clever.

**Answer — measure it yourself**

```bash
git count-objects -vH
# count: 214            <- loose objects
# size-pack: 41.20 MiB  <- everything else, packed and deltified
# in-pack: 182451

# The 20 largest objects actually in the pack
git verify-pack -v .git/objects/pack/*.idx \
  | sort -k3 -n -r | head -20
```

<a id="3-branches"></a>

## 3. Branches Are Pointers — and So Is HEAD

- **Cost to branch** `41 bytes`
- **Time to branch** `O(1)`
- **Files copied** `0`

In most version control systems a branch is a copy of the tree. In Git it is a file under `.git/refs/heads/` containing forty hex characters and a newline — 41 bytes. Creating one is writing that file. Moving one is overwriting it. Deleting one is `rm`. This is not a curiosity; it is the reason Git culture is built around branching at all, because an operation that costs nothing gets used constantly.

**HEAD** is one more level of indirection, and it is where the confusion usually lives. `.git/HEAD` normally contains the text `ref: refs/heads/main` — a pointer to a *branch name*, not to a commit. So when you commit, Git writes the commit object, then follows HEAD to find which branch to advance. That indirection is what makes “commit on the branch I am on” work, and losing it is what *detached HEAD* means.

> **Analogy** 🔖
>
> **Picture it — sticky notes on a shelf of books**
>
> The commits are books on a shelf, in order, and nobody ever removes or rewrites a book. A branch is a sticky note with a book's title on it; you move the note along as new books arrive. HEAD is a second note that says *“whichever book the note labelled main is on”*. Creating a branch costs one sticky note. Deleting a branch throws away the note, not the books — which is exactly why a deleted branch's commits can be recovered, and why `git branch -d` warns you only when no other note can reach them.

> **Interactive animation:** `branch-pointers` — rendered by the page script in the HTML version.

Detached HEAD is the state where `.git/HEAD` holds a commit id directly instead of a branch name. You get there by checking out a commit, a tag, or a remote-tracking ref. Everything still works — you can edit, commit, even build — but there is no branch underneath to advance, so the moment you switch away your new commits have nothing pointing at them. Git tells you this in a famously long warning that almost nobody reads.

> **Interactive animation:** `detached-head` — rendered by the page script in the HTML version.

- **Strength — branching is free, so experiments are cheap** Try the risky refactor on a branch; if it fails, delete a 41-byte file. Teams that branch freely get more parallel work and smaller reviews, and the mechanism imposes no cost at all on the repository.
- **Weakness — a pointer carries no history of its own** A branch does not record where it came from or what was merged into it. Deleting it removes the only name for its commits, and after a fast-forward merge nothing in the graph says a branch ever existed. If that record matters, you need `--no-ff` merges or tags.

**Look at the pointers directly**

```bash
cat .git/HEAD               # ref: refs/heads/main
cat .git/refs/heads/main    # 40 hex characters
git rev-parse HEAD          # the same, via the plumbing

git switch -c feature       # create + point HEAD at it
git switch -                # back to the previous branch
git branch -vv              # local branches, tips, upstreams
git for-each-ref --sort=-committerdate refs/heads \
  --format='%(refname:short) %(committerdate:relative)'
```

```text
$ git branch -vv
* feature  9c1d2e3 [origin/feature: ahead 2] add retry policy
  main     4a7b8c9 [origin/main] release 2.4.0
  spike    1122334 experiment with async client
```

> **Key idea**
>
> Read `git log` output as a walk, not a list. Git starts at HEAD, follows parent pointers, and prints what it reaches — which is why a commit vanishes from `git log` the instant nothing points at it, even though the object is still on disk. “Lost” in Git almost always means *unreachable*, and unreachable is recoverable.

**Interview question**

*A colleague says they “lost two hours of work”. They had been committing on what they now realise was a detached HEAD, then ran `git switch main`. Walk through how you get the commits back and explain why it works.*

The commits exist — committing always writes objects to the database, and nothing deletes objects except garbage collection, which will not touch anything younger than its expiry window (90 days for reachable-then-orphaned objects, 14 days for the rest, by default). What they lost is a *name*. HEAD's own movements are journalled in `.git/logs/HEAD`, so `git reflog` lists every position HEAD held including the detached commits. Find the id, create a branch at it, and the commits are reachable again. The general lesson is worth stating in an interview: Git loses names far more often than it loses data, and the reflog is the index of names it used to have.

**Answer — recover commits made on a detached HEAD**

```bash
git reflog
# 4a7b8c9 HEAD@{0}: checkout: moving from 9c1d2e3 to main
# 9c1d2e3 HEAD@{1}: commit: finish the parser      <- here
# 55aa66b HEAD@{2}: commit: sketch the parser
# 4a7b8c9 HEAD@{3}: checkout: moving from main to 4a7b8c9

git branch rescue 9c1d2e3   # name it, and it is reachable again
git log --oneline rescue -3 # confirm both commits are there
git switch rescue

# If even the reflog was pruned:
git fsck --lost-found
```

<a id="unit-2"></a>

## Unit 2 — Everyday Work

The daily loop: stage deliberately, read what changed, and undo safely.

<a id="4-staging"></a>

## 4. Staging Deliberately — `add -p` and Good Commits

- **Good commit size** `one idea`
- **Subject line** `≤ 50 chars`
- **Amend safety** `unpushed only`

A commit is the unit that every other Git tool operates on. `git revert` undoes one. `git bisect` tests one. `git log -S` finds one. A commit that mixes a bug fix with a rename and a dependency bump cannot be reverted without collateral damage, cannot be bisected to a cause, and cannot be reviewed in one thought. So the skill is not “committing often” — it is making each commit a single, complete, self-consistent change. The index is the tool that makes this possible even when your working tree is chaos.

`git add -p` is the command most people never learn and then use daily. It walks the diff hunk by hunk and asks what to do with each one, so you can stage half a file. `s` splits a hunk into smaller ones; `e` opens the hunk in an editor so you can stage individual lines. `git restore -p` and `git stash -p` take the same interface.

> **Analogy** ✂️
>
> **Picture it — editing a film**
>
> A director does not hand the studio every hour of footage shot that day and say “the good bits are in there”. They cut a scene: one idea, beginning to end, watchable on its own. `git add -p` is the cutting room. The footage on your desk is messy and that is fine — nobody sees the working tree. What ships is the cut, and a reviewer's time is the scarce resource you are optimising.

**Stage half a file, then write a message worth reading**

```bash
git add -p src/client.py
#  y stage this hunk      n skip it        q quit
#  s split into smaller   e edit by line   ? help

git diff --staged          # read exactly what the commit will contain
git commit                 # opens an editor - use it, not -m

# Fix the commit you just made (only if it is not pushed)
git commit --amend                 # change message and/or add staged files
git commit --amend --no-edit       # add staged files, keep the message
```

```text
fix: reject config keys that are empty strings

The loader accepted "" as a key, so a typo'd YAML entry silently
overwrote the default section instead of failing. Validate in
Config.load rather than at use sites, so every caller benefits.

Refs: #412
```

The message convention above is worth adopting wholesale: a short imperative subject (“fix”, not “fixed” — it completes the sentence *“applying this commit will…”*), a blank line, then a body that explains **why**. The diff already says what changed; it can never say what you were trying to achieve or what you ruled out. Six months later that paragraph is the only thing standing between a future reader and reverting your fix by accident.

- **Strength — small commits make every other tool sharper** `bisect` lands on a 20-line change instead of a 2,000-line merge; `revert` removes a feature without dragging a refactor with it; `blame` points at a commit whose message actually explains the line.
- **Weakness — partial staging can stage code that does not compile** `add -p` happily lets you stage a call to a function whose definition you skipped. The fix is mechanical: `git stash --keep-index` hides the unstaged remainder so you can run the tests against exactly what you are about to commit.

> **Warning**
>
> **`--amend` creates a new commit.** It does not edit the old one — it builds a replacement with a new id and repoints the branch. Harmless while the commit is local; if it has been pushed, everyone else's history now disagrees with yours and your next push is rejected. The rule is the same one that governs rebase: amend freely before you push, never after.

**Interview question**

*You are about to commit, and you want to be certain the tests pass against exactly the code you are staging — not against the extra half-finished changes still sitting in your working tree. How?*

Running the test suite now proves nothing about the commit, because the suite sees the working tree and the commit will contain the index. The trick is `git stash --keep-index`: it stashes everything but leaves the staged content in place on disk, so the working tree and the index now match. Run the tests; if they pass, commit; then `git stash pop` brings the remainder back. A pre-commit hook is the automated version of the same idea, and a good one does precisely this stash-test-unstash dance rather than testing a dirty tree.

**Answer — test the index, not the working tree**

```bash
git add -p                       # stage the coherent change
git stash push --keep-index -m "rest of the work"
pytest -q                        # tests now see ONLY the staged code
git commit -m "fix: reject empty config keys"
git stash pop                    # get the unfinished work back
```

```ini
# ~/.gitconfig - make the good path the easy path
[alias]
    ap = add --patch
    st = status --short --branch
    amend = commit --amend --no-edit
[commit]
    verbose = true      # show the staged diff in the message editor
```

<a id="5-reading"></a>

## 5. Reading What Changed — `status`, `diff`, `log`

- **Diffs to know** `4`
- **Two dots** `A..B`
- **Three dots** `merge base`

Every confusing moment in Git begins with not knowing which two things are being compared. There are three trees, so there are three adjacent gaps, and `git diff` takes a different form for each. Learn the table once and `--staged`, `--cached` and bare `git diff` stop being interchangeable noise.

> **Interactive animation:** `four-diffs` — rendered by the page script in the HTML version.

The range syntax is the other half. `git log A..B` means “commits reachable from B but not from A” — that is, what B has that A does not. `git diff A...B` with three dots compares B against the *merge base* of A and B, which is what a pull request shows you: the changes the branch introduced, ignoring whatever landed on main in the meantime. Confusing the two is why a diff sometimes shows other people's work.

**The commands that answer 'what is going on here'**

```bash
git status --short --branch          # the whole state in a few lines
git diff                             # working tree vs index
git diff --staged                    # index vs HEAD - your next commit
git diff HEAD                        # everything you changed

git log --oneline --graph --decorate --all   # the shape of the repo
git log main..feature                # what feature adds to main
git diff main...feature              # what a PR would show
git log -p -- src/config.py          # history of one file, with diffs
git log -S "DEFAULT_TIMEOUT"         # commits where that string appeared
git log -L 40,60:src/config.py       # history of those lines only
```

```text
$ git status --short --branch
## feature...origin/feature [ahead 2, behind 1]
MM src/client.py
 M README.md
A  tests/test_retry.py
?? scratch.txt
```

`git log -S` deserves its own mention because nothing else does its job. It searches for commits where the *number of occurrences* of a string changed — so it finds the commit that introduced a constant, or the one that deleted the function you are looking for, in a repository with a decade of history. It is the fastest way to answer “where did this come from?” when `blame` only shows you a reformatting commit.

- **Strength — history is queryable, not just browsable** Because commits are a graph with full snapshots, Git can answer set questions (`A..B`), content questions (`-S`, `-G`) and line questions (`-L`) without any external index.
- **Weakness — the defaults hide the graph** Plain `git log` prints a flat chronological list that makes a branchy history look linear and a merge look like nothing happened. `--graph --oneline --decorate` should be an alias you type without thinking.

> **Tip**
>
> **Two settings that pay for themselves.** `git config --global diff.algorithm histogram` produces noticeably more readable diffs on refactored code, and `git config --global diff.colorMoved zebra` colours moved-but-unchanged blocks differently from real edits, so a large reorganisation stops looking like a rewrite.

**Interview question**

*A constant in production has the wrong value. `git blame` on the line points at a commit called “run formatter” from last week, which is clearly not the culprit. How do you find the commit that actually set that value?*

`blame` reports the commit that last *touched* the line, so any bulk reformatting, rename or move resets it. Two ways forward. Re-run blame telling it to ignore whitespace and detect moved code (`-w -M -C`), or, better, keep a `.git-blame-ignore-revs` file listing your formatting commits and point `blame.ignoreRevsFile` at it, which makes every future blame skip them automatically. The blunt instrument that always works is `git log -S` on the value itself: it goes straight to the commit where that string first appeared, regardless of how many times the line has been shuffled since.

**Answer — find who really set the value**

```bash
git log -S "TIMEOUT = 0" --oneline -- src/config.py
# 3f9a1c2 perf: drop the client timeout for the batch job

git blame -w -M -C -- src/config.py       # ignore whitespace + moves
git log --oneline -1 3f9a1c2 --format=%B  # read the reasoning

# Make formatting commits invisible to blame, permanently
echo "9c1d2e3f  # run formatter across repo" >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

<a id="6-undo"></a>

## 6. Undoing — `restore`, `reset`, `revert`

- **restore** `destroys edits`
- **reset** `moves the branch`
- **revert** `adds a commit`

“Undo” in Git is four different operations, and picking the wrong one is how people lose work. Ask two questions and the choice is forced. *What do I want to undo* — an uncommitted edit, a staging decision, or a commit? And *has anyone else seen it* — because rewriting shared history is the one genuinely antisocial thing you can do with Git.

> **Analogy** 📖
>
> **Picture it — correcting a published book**
>
> If the manuscript is still on your desk, you cross out the paragraph: that is `reset`, and it is fine because nobody has read it. If the book has already been printed and shipped to ten thousand readers, you cannot un-print it — you publish an *erratum*, a new page that corrects the old one. That is `revert`. Trying to recall every copy and reissue the book with a page quietly changed is `push --force`, and it is exactly as disruptive as it sounds.

> **Interactive animation:** `reset-modes` — rendered by the page script in the HTML version.

Notice what all three `reset` modes share: they move the branch pointer first, and the discarded commits are never deleted — they only become unreachable, and the reflog still knows them. What differs is how far the copying goes. `--soft` stops at the pointer, leaving your changes staged, which is the trick for squashing several commits into one. `--mixed` (the default) also resets the index, leaving changes unstaged. `--hard` additionally overwrites your working tree, and that last step is the only part that can lose something the reflog cannot recover.

> **Interactive animation:** `revert-flow` — rendered by the page script in the HTML version.

- **Strength — `revert` is safe by construction** It only ever adds a commit, so every existing id stays valid and nobody has to re-clone or force-pull. On a shared branch it is almost always the right answer, even when it feels less tidy.
- **Weakness — reverting a merge has a long tail** `git revert -m 1` undoes the merge's content but the merge itself stays in the graph, so Git still believes that branch is merged. Re-merging later silently brings back nothing until you revert the revert — a trap worth knowing before you meet it at 2am.

**The undo decision table, as commands**

```bash
# Uncommitted edit, want it gone            (DESTRUCTIVE)
git restore path/to/file
git restore .                    # everything tracked

# Staged it by mistake, keep the edit
git restore --staged path/to/file

# Last commit is local and wrong
git commit --amend               # message or content
git reset --soft HEAD~1          # uncommit, keep everything staged
git reset HEAD~1                 # uncommit, keep changes unstaged

# Squash the last three local commits into one
git reset --soft HEAD~3 && git commit

# The commit is already pushed
git revert <sha>                 # new commit with the inverse patch
git revert -m 1 <merge-sha>      # undo a merge, mainline = first parent
```

> **Warning**
>
> **Before any `--hard`, run `git stash -u`.** It costs two seconds and converts the one irreversible command in Git into a reversible one. The same goes for `git clean -fd`, which deletes untracked files that Git has never seen and therefore cannot recover — always dry-run it with `git clean -nd` first.

**Interview question**

*You pushed a commit to `main` an hour ago that leaked an API key into a config file. Your colleague suggests `git reset --hard HEAD~1 && git push --force`. What do you do instead, and why is their suggestion insufficient rather than merely rude?*

Two separate problems, and the force-push addresses neither properly. The *security* problem is that the key is compromised the moment it reaches a server other people can read — it is in CI logs, in other clones, possibly in a fork. Rotating the key is the first and non-negotiable step, and no Git command substitutes for it. The *history* problem is that the object still exists on the remote even after a force-push, reachable through the reflog and through any fork or pull request that referenced it, so scrubbing requires `git filter-repo` plus the hosting provider's garbage collection, and it invalidates every downstream clone. Meanwhile, to stop the bleeding in the repository itself, `git revert` removes the value from `main`'s current state without breaking anyone. Order matters: rotate, revert, then decide whether a full history rewrite is worth its cost.

**Answer — rotate first, then clean up**

```bash
# 1. Rotate the credential at the provider. Nothing below replaces this.

# 2. Remove it from the current state, safely, on a shared branch
git revert <sha>
git push

# 3. Stop it happening again
echo ".env" >> .gitignore
git rm --cached .env && git commit -m "chore: stop tracking .env"

# 4. Only if policy demands the bytes are gone from history:
pip install git-filter-repo
git filter-repo --invert-paths --path config/secrets.yml
#    ... then force-push, and tell every clone to re-clone.
```

<a id="unit-3"></a>

## Unit 3 — Branching, Merging & Rewriting History

Combining lines of work, resolving conflicts and reshaping history before anyone else sees it.

<a id="7-merging"></a>

## 7. Branching and Merging

- **Merge base** `1 commit`
- **Fast-forward** `no new commit`
- **Merge commit** `2 parents`

A merge answers one question: how do I get the work from over there into here? Git begins by finding the **merge base** — the newest commit reachable from both branch tips, which is where the two histories last agreed. Everything after that is arithmetic on three snapshots: base, ours, theirs. If a file changed on only one side, take that side. If it changed on both sides in different places, take both. If it changed on both sides in the same place, stop and ask the human.

There is a shortcut worth understanding because it explains most surprised reactions to merging. If the merge base turns out to *be* your current tip — meaning your branch has no commits the other one lacks — there is nothing to reconcile, so Git simply slides your branch pointer forward. That is a **fast-forward**: no merge commit, no new object, and afterwards nothing in the history records that a branch existed.

> **Analogy** 🛣️
>
> **Picture it — two cars leaving the same junction**
>
> The merge base is the junction where you parted. If one car never moved, the other simply drives back and the two are together again — a fast-forward, no negotiation required. If both drove off in different directions, someone has to work out a route that gets both journeys represented, and that route is the merge commit: it has two roads leading into it, and following either one backwards gives you a complete, honest history of that car's trip.

> **Interactive animation:** `merge-types` — rendered by the page script in the HTML version.

The third variant, `--no-ff`, forces a merge commit even when a fast-forward was possible. It is what most forges do for pull requests, and the argument for it is retrospective: the merge commit is a durable record that these commits were one reviewed unit, it makes `git log --first-parent` read as one line per feature, and it gives you a single commit to revert if the whole feature has to come out.

- **Strength — merging never rewrites anything** Every original commit keeps its id, so a merge is always safe on a branch other people have pulled. The graph records what actually happened, including when.
- **Weakness — the graph gets hard to read** A busy repository merged frequently in both directions produces a history nobody can follow without `--first-parent`. This is the real argument for rebasing feature branches before they land, rather than any claim about safety.

**Merging, and choosing a repo-wide policy**

```bash
git switch main
git merge feature                 # fast-forward if possible
git merge --no-ff feature         # always create a merge commit
git merge --squash feature        # one commit, no merge link, no parents

git merge-base main feature       # where they last agreed
git log --oneline --first-parent main   # one line per merged feature
git branch --merged main          # branches safe to delete
git branch -d feature             # refuses if not merged; -D forces
```

```ini
# Decide once, in config, instead of per merge
[merge]
    ff = false          # always record a merge commit on merges
    conflictStyle = zdiff3   # show the merge base inside conflicts
[pull]
    ff = only           # a pull must never invent a merge commit
[branch]
    sort = -committerdate
```

> **Key idea**
>
> `--squash` is not a merge. It applies the branch's combined change to your working tree and stages it, producing one ordinary commit with *one* parent. Git therefore has no record that the branch was merged, so `git branch --merged` will not list it and merging that branch again later will try to apply everything a second time. Delete squashed branches immediately.

**Interview question**

*Your team squash-merges every pull request. A colleague keeps a long-running `feature` branch, squash-merges part of it, then continues working on the same branch and opens a second PR. The second PR shows the first PR's changes again. Why, and what should they do?*

Squash-merging created a brand-new commit on `main` whose content matches the branch but whose id and parentage have nothing to do with it. The branch's own commits are still there and still unreachable from `main`, so when the forge computes the second PR's diff against the merge base, that base is still the original branch point — the first batch of changes looks unmerged. Git is not confused; the branch genuinely does contain commits that `main` does not have. The fix is to stop reusing the branch: after a squash-merge, delete it and branch again from the updated `main`. If work is already in progress, `git rebase --onto main <last-squashed-commit> feature` replays only the new commits onto the new base.

**Answer — reset a branch after a squash-merge**

```bash
# The clean habit
git switch main && git pull
git branch -D feature
git switch -c feature-part-2

# If work is already in flight on the old branch
git fetch origin
git rebase --onto origin/main <sha-of-last-squashed-commit> feature
git log --oneline origin/main..feature    # only the NEW commits
```

<a id="8-conflicts"></a>

## 8. Conflicts — What They Are and How to End Them

- **Index entries** `3 per file`
- **Escape hatch** `--abort`
- **Replay resolutions** `rerere`

A conflict is not an error and it is not Git failing. It is Git reaching a decision it has no information to make: the same region of the same file changed on both sides since the merge base, and no rule can say which one is correct. What Git does next is precise and worth knowing, because the folklore around conflicts mostly consists of guessing. It writes **both** versions into your working file surrounded by markers, and it puts **three** entries for that path into the index — stage 1 is the base, stage 2 is yours, stage 3 is theirs. That is literally what “unmerged path” means.

> **Analogy** 📝
>
> **Picture it — two editors marking up the same paragraph**
>
> Two copy-editors work from the same original. One changes a sentence to read *“sixty seconds”*, the other changes the same sentence to *“ten seconds”*. The typesetter cannot set both and has no basis for preferring either, so they paste both suggestions into the proof with a note, and the author decides. Crucially the author often writes a *third* thing — the right answer is frequently neither version verbatim, and a conflict resolution that only ever picks a side is a resolution that has not been thought about.

> **Interactive animation:** `merge-conflict` — rendered by the page script in the HTML version.

Three settings turn conflicts from folklore into mechanics. `merge.conflictStyle = zdiff3` adds the merge base into the markers, so you can see what *both* sides changed from rather than guessing. `rerere.enabled = true` makes Git record every resolution you perform and replay it automatically the next time the identical conflict appears — which on a long rebase is the difference between resolving a conflict once and resolving it fifteen times. And `git config merge.tool` wires up a three-pane visual tool for the cases where markers are genuinely hard to read.

**Working through a conflict**

```bash
git merge feature
# CONFLICT (content): Merge conflict in config.yml

git status                 # lists 'both modified'
git diff                   # combined diff of just the conflicts
git ls-files -u            # the three index stages, proof of the model

# Look at each side on its own
git show :1:config.yml     # base
git show :2:config.yml     # ours
git show :3:config.yml     # theirs

# Resolve by editing, then:
git add config.yml
git merge --continue       # or: git commit

# Or walk away entirely - the pre-merge state is restored exactly
git merge --abort
```

```ini
[merge]
    conflictStyle = zdiff3   # include the base in the markers
[rerere]
    enabled = true           # remember and replay my resolutions
    autoUpdate = true
[mergetool]
    keepBackup = false
```

- **Strength — conflicts are always local and always abortable** Nothing is committed, pushed or lost while a merge is in progress. `git merge --abort` and `git rebase --abort` restore the exact previous state, which means the correct response to a confusing conflict is to back out and look at it again.
- **Weakness — Git only sees lines, not meaning** A clean automatic merge can still be wrong: one branch renames a function, the other adds a call to the old name, and both edits are in different places so Git merges them happily. *No conflict is not the same as correct* — run the tests after every merge.

> **Warning**
>
> **`--ours` and `--theirs` flip meaning during a rebase.** In a merge, “ours” is the branch you are on. In a rebase, Git checks out the *upstream* branch and replays your commits onto it, so “ours” is upstream and “theirs” is your own work. Reaching for `--theirs` from muscle memory during a rebase is a reliable way to throw away exactly the code you were trying to keep.

**Interview question**

*Two developers both add an entry to the end of a `CHANGELOG.md`. Git reports a conflict even though the changes are logically independent. Why, and what can a team do about files like this?*

Git's merge operates on line regions, not on meaning. Both sides inserted lines at the same position relative to the merge base, so the regions overlap and there is no rule for ordering them — the result is a conflict every single time, on a file where the resolution is always “keep both”. Three fixes, in increasing order of how much they actually solve. Set a `union` merge driver in `.gitattributes` for that path, which tells Git to keep both sides automatically. Enable `rerere` so at least the repeated resolutions are replayed. Or — the answer that shows judgement — remove the shared file: generate the changelog from commit messages or use one fragment file per change, which is what tools like `towncrier` and Changesets exist for. Recurring conflicts are usually a file-layout problem wearing a Git costume.

**Answer — stop a file from conflicting every time**

```bash
# .gitattributes - keep both sides of an append-only file
echo "CHANGELOG.md merge=union" >> .gitattributes

# Generated / binary files: never even try to merge
echo "package-lock.json merge=ours -diff" >> .gitattributes
echo "*.png binary" >> .gitattributes

git config rerere.enabled true
git add .gitattributes && git commit -m "chore: merge strategies"
```

<a id="9-rebase"></a>

## 9. Rebase vs Merge, and the Golden Rule

- **Merge** `never rewrites`
- **Rebase** `new ids`
- **Golden rule** `unpushed only`

Both commands answer “my branch is out of date, bring it up to date”, and they do completely different things. **Merge** creates one new commit with two parents; every existing commit keeps its id, and the graph honestly records that two lines of work converged. **Rebase** takes each of your commits, turns it into a patch, and re-applies it on top of the new base — producing *new commits with new ids*, and abandoning the originals. The content may be identical; the objects are not.

> **Analogy** 🧳
>
> **Picture it — moving house with your furniture**
>
> Merging is building a corridor between the old house and the new one: both buildings still stand, and anyone who knows the old address can still find it. Rebasing is rebuilding your furniture, identically, inside the new house and demolishing the old one. The result is tidier — one house instead of two — but if you gave someone the old address last week, they now arrive at a demolition site. That is the entire argument, and it is why the rule is about *who else has the address*, not about which is better.

> **Interactive animation:** `rebase-vs-merge` — rendered by the page script in the HTML version.

The golden rule follows directly: **never rebase commits that exist in someone else's repository.** When you rewrite and force-push, everyone who already fetched your branch has commits your branch no longer contains; their next pull creates a merge between the old and new versions, and the same change appears twice. On your own unpushed work, rebase freely — it is private, it costs nothing, and it makes review far easier.

The practical compromise most teams land on is: rebase your feature branch onto `main` while you work on it so conflicts are dealt with in small doses, then merge it into `main` at the end (or let the forge squash it). Rebasing gives you a clean, linear branch to review; merging gives the trunk a truthful record of when things landed.

- **Strength — rebase makes a branch reviewable** A branch rebased onto current `main` contains only your changes, in order, with no merge noise. Reviewers see one coherent story, and `git log --oneline main..feature` is the pull request.
- **Weakness — conflicts are resolved per commit** A merge asks each question once. A rebase replays five commits, so a conflict in a file all five touch is asked five times. `rerere` mitigates it; a long-lived branch that has drifted for weeks is usually better merged than rebased.

**The workflow, and the one safe force-push**

```bash
git switch feature
git fetch origin
git rebase origin/main            # replay my commits on the new base
#   conflict? fix, git add, git rebase --continue
#   wrong turn? git rebase --abort        (always safe)
#   commit no longer needed? git rebase --skip

# Pushing a rebased branch: never plain --force
git push --force-with-lease
# refuses if origin/feature moved since your last fetch,
# i.e. if a colleague pushed while you were rebasing

git config --global rebase.autosquash true
git config --global rebase.autostash true   # stash dirty tree around a rebase
```

> **Key idea**
>
> Use `--force-with-lease` instead of `--force`, always, and put it in an alias so you never type the other one. Plain `--force` overwrites the remote branch unconditionally, including commits you have never seen. `--force-with-lease` first checks that the remote is still where your last fetch said it was, and refuses otherwise — turning “I destroyed a colleague's work” into “the push was rejected”.

**Interview question**

*You rebase your branch onto `main` and force-push. A colleague, who had already pulled your branch, runs `git pull` and ends up with every commit duplicated. Explain what happened and how they should recover.*

Their local `feature` still points at your *old* commits; the remote now holds new commits with different ids but identical content. A default `git pull` is fetch-plus-merge, so Git dutifully merges two histories that share no recent ancestry, and since the same changes appear on both sides with different ids, the result contains both copies. Nothing is corrupt — Git did precisely what it was asked. Recovery: if they have no local work on that branch, discard their version entirely with `git reset --hard origin/feature`. If they do have local commits, rebase just those onto the new upstream with `git rebase --onto origin/feature <old-upstream-tip> feature`, which is exactly what `git pull --rebase` attempts automatically using the reflog. The real lesson is the one about coordination: force-pushing a branch someone else is working on requires telling them, whatever the tooling can do afterwards.

**Answer — recover from someone else's rebase**

```bash
git fetch origin

# Case A: no local commits of my own on this branch
git reset --hard origin/feature

# Case B: I have local commits; keep only those
git rebase --onto origin/feature origin/feature@{1} feature
#            ^ new base          ^ where origin/feature used to be

# Case B, the easy way - Git reads the reflog for you
git pull --rebase

git log --oneline --graph -12    # verify: no duplicated subjects
```

<a id="10-interactive-rebase"></a>

## 10. Interactive Rebase — Tidying Up Before Review

- **Verbs** `6 that matter`
- **Todo order** `oldest first`
- **Abortable** `until the end`

Your commits as you write them are a log of your confusion: a false start, a typo fix, a `wip`, then the real thing. Your commits as a reviewer reads them should be a sequence of complete, working steps. Interactive rebase is how you get from the first to the second, and it is the single highest-leverage Git skill after understanding the three trees.

`git rebase -i <base>` opens a **todo list**: one line per commit, *oldest first* — the opposite order to `git log`, which catches everyone once. You change the verb at the start of each line and save. Six verbs cover almost everything: `pick` keeps it, `reword` keeps the change but opens an editor for the message, `squash` folds it into the previous commit and combines the messages, `fixup` folds it in and discards the message, `edit` stops the rebase so you can amend, and `drop` deletes it. Deleting the line does the same as `drop`, which is the one genuinely dangerous surprise.

> **Analogy** 🎞️
>
> **Picture it — a director's cut**
>
> The shoot happened in whatever order the schedule allowed, with retakes and a scene that was abandoned halfway. Nobody releases that. The edit reorders, trims, merges two takes into one scene, and cuts the abandoned one entirely — and the audience sees a film that appears to have been made in exactly that order. History rewriting has the same honesty question attached: cleaning up your own unreleased footage is craft; re-cutting a film people already watched is revisionism.

> **Interactive animation:** `interactive-rebase` — rendered by the page script in the HTML version.

In practice you rarely hand-edit the todo list, because there is a better workflow. When you spot a problem in an earlier commit, fix it and commit with `git commit --fixup=<sha>`. That creates a commit whose message marks it as belonging to that earlier one. Then `git rebase -i --autosquash <base>` reorders and folds every such commit automatically — you just save the file. Turn it on permanently with `rebase.autosquash = true` and the whole thing becomes two commands.

- **Strength — it separates how you worked from what you ship** You can commit constantly, in any state, as a safety net, and still deliver a branch where every commit builds and does one thing. That is a genuinely better trade than trying to write perfect commits the first time.
- **Weakness — it is a rewrite, with everything that implies** New ids for every commit from the base forward, a force-push required, and any commit signature invalidated and re-created. Confined to an unmerged branch this is fine; applied to `main` it is an incident.

**The realistic workflow**

```bash
git log --oneline main..HEAD      # exactly the commits you will rewrite

# Spot a bug that belongs to an earlier commit
git add src/parser.py
git commit --fixup=9c1d2e3        # message: "fixup! add parser"

# Fold everything into place, then review
git rebase -i --autosquash main
git log --oneline main..HEAD      # now two clean commits
git push --force-with-lease

# Change an old commit's content interactively
git rebase -i main                # mark it 'edit'
#   ... make changes ...
git add -A && git commit --amend
git rebase --continue
```

```ini
[rebase]
    autosquash = true    # honour fixup!/squash! without the flag
    autostash = true     # stash a dirty tree, restore it afterwards
    updateRefs = true    # move dependent branches along with the rebase
[alias]
    fixup = commit --fixup
    ri = rebase --interactive --autosquash
    please = push --force-with-lease
```

> **Tip**
>
> **`rebase.updateRefs = true` is newer and underused.** If you stack branches — `feature-b` built on `feature-a` built on `main` — a rebase of the bottom branch normally strands the ones above it. With this on, Git moves every branch pointer that lives inside the rebased range, which makes stacked pull requests practical without extra tooling.

**Interview question**

*Halfway through an interactive rebase of eight commits you realise the plan is wrong — you squashed two commits that should have stayed separate, and you have already resolved three conflicts. What are your options?*

The first and best option is `git rebase --abort`, which restores the branch exactly as it was before the rebase started, conflicts and all discarded. Nothing has been pushed and nothing is lost, because the original commits were never deleted — the branch pointer simply goes back. If you have already finished the rebase and only then noticed, the reflog has the pre-rebase tip: `git reflog` shows a `rebase (start)` entry, and `git reset --hard HEAD@{n}` on the commit just before it puts you back. The third option, if you want to keep the conflict resolutions, is to enable `rerere` *before* you retry, so the second attempt replays everything you already solved. Knowing that every rebase is reversible is what makes rebasing a reasonable thing to do at all.

**Answer — back out of a rebase, before or after**

```bash
# Mid-rebase
git rebase --abort

# Already finished it
git reflog
# 7d8e9f0 HEAD@{0}: rebase (finish): returning to refs/heads/feature
# ...
# 1a2b3c4 HEAD@{7}: rebase (start): checkout main
# 9c1d2e3 HEAD@{8}: commit: add retry policy     <- the old tip
git reset --hard HEAD@{8}

# Keep my conflict resolutions for the second attempt
git config rerere.enabled true
```

<a id="11-moving-work"></a>

## 11. Moving Work Around — `stash` and `cherry-pick`

- **Stash** `a stack`
- **Untracked files** `need -u`
- **Cherry-pick** `new id`

Two commands for the same category of problem: a change is in the wrong place. `git stash` moves uncommitted work out of the way temporarily. `git cherry-pick` copies a committed change onto a different branch. Neither is complicated, but both have a detail that bites.

The stash is not a scratch file — it is real commit objects stored under `refs/stash`, arranged as a stack. `stash@{0}` is the newest. The detail that bites is that a plain `git stash` ignores **untracked** files, so the new file you just created stays on disk while everything else disappears, and you switch branches carrying it with you. Use `-u`.

> **Interactive animation:** `stash-flow` — rendered by the page script in the HTML version.

Cherry-pick takes the diff between a commit and its parent and applies it where you are, as a new commit with a new id. The content is the same; the object is not. That is fine and expected — backporting a fix to a release branch is exactly this — but it means the change now exists twice in the repository, and the two copies are only related by the fact that they look alike.

> **Interactive animation:** `cherry-pick` — rendered by the page script in the HTML version.

- **Strength — cherry-pick is the right tool for backports** One fix, many supported release branches, no merging of unrelated work. With `-x` the new commit records which commit it came from, which is the difference between a maintainable release branch and a mystery.
- **Weakness — duplicated commits confuse later merges** Git usually detects the identical patch and merges cleanly, but if either copy was modified, you get a conflict that looks like nonsense. Cherry-picking a long series is a sign you actually wanted `rebase --onto` or a proper merge.

**Both commands, with the flags that matter**

```bash
git stash push -u -m "wip: parser"   # -u INCLUDES untracked files
git stash list
git stash show -p stash@{0}          # what is actually in there
git stash apply stash@{0}            # keep the entry (safer than pop)
git stash pop                        # apply + drop
git stash branch fix-parser          # make a branch from the entry

git cherry-pick <sha>                # copy one commit here
git cherry-pick -x <sha>             # ... and record its origin
git cherry-pick A..B                 # a range, excluding A
git cherry-pick --abort              # on conflict, back out cleanly
git cherry -v origin/main            # commits not yet upstream
```

> **Warning**
>
> **Stashes are unreachable commits with no branch.** They do not appear in `git log`, they are never pushed, and `git stash clear` discards them with no confirmation and no reflog entry to lean on — after that only `git fsck --unreachable` can find them, and only until garbage collection runs. For anything you would be upset to lose, make a throwaway branch and commit instead. Stashes are for the next ten minutes, not the next three days.

**Interview question**

*A production bug needs a one-line fix that already exists as commit `c4` on a feature branch that is nowhere near ready to merge. The release branch is `release/2.4`. Walk through what you run, and what you do about the feature branch afterwards.*

Cherry-pick the single commit onto the release branch with `-x` so the new commit records where it came from — a future maintainer looking at `release/2.4` can then find the original discussion. Do not merge the feature branch, and do not cherry-pick its neighbours “while you are there”: the value of a release branch is that it contains only what was deliberately put in it. Afterwards, the feature branch keeps its own copy of the commit, which is correct — when it eventually merges into `main`, Git will usually see the identical patch already applied and merge cleanly. The part worth saying out loud is the follow-up: the fix must also reach `main`, and the common failure mode is a hotfix that lives only on the release branch and is silently reintroduced as a regression by the next release.

**Answer — backport one commit to a release branch**

```bash
git fetch origin
git switch -c hotfix-2.4.1 origin/release/2.4
git cherry-pick -x c4
#   conflict? resolve, git add, git cherry-pick --continue
#   wrong call? git cherry-pick --abort

pytest -q tests/test_that_bug.py
git push -u origin hotfix-2.4.1
git tag -a v2.4.1 -m "hotfix: retry on 503" && git push --tags

# Make sure main is not missing the fix
git switch main && git cherry -v origin/release/2.4
```

<a id="unit-4"></a>

## Unit 4 — Collaboration & Recovery

Sharing work through remotes, and getting out of trouble when things go wrong.

<a id="12-remotes"></a>

## 12. Remotes — `fetch`, `pull`, `push`

- **fetch** `always safe`
- **pull** `fetch + integrate`
- **origin/main** `a cache`

Git is distributed: your clone is a complete repository with full history, not a checkout of a server. Nothing happens over the network unless you ask, and nothing polls. This is why Git is fast offline, and it is also the source of the single most common misconception — that `origin/main` is the server. It is not. It is a **remote-tracking branch**: a local ref recording where `main` was on `origin` the last time you talked to it. A photograph, not a window.

> **Analogy** 📸
>
> **Picture it — a photograph of a noticeboard**
>
> You walk past the office noticeboard and take a photo. Back at your desk you can read the photo all day, but notices pinned up since then are not in it — and the photo does not know it is out of date. `git fetch` is walking back and taking a fresh photo. `git status` saying “up to date with origin/main” means *“you match your photo”*, which is a much weaker statement than most people read it as.

> **Interactive animation:** `remote-model` — rendered by the page script in the HTML version.

With that model, the three network commands are obvious. `git fetch` downloads new objects and updates remote-tracking refs — it touches nothing you are working on and can never cause a conflict or lose work. `git push` uploads objects and asks the server to move its branch, which it will do only if the move is a fast-forward. And `git pull` is not a primitive at all: it is a fetch followed by a merge, or a rebase, depending on configuration.

> **Interactive animation:** `fetch-pull-push` — rendered by the page script in the HTML version.

That configurability is why modern Git refuses to run a bare `git pull` on a diverged branch until you have declared a policy. Pick one deliberately. `pull.ff = only` makes `pull` a strict update that fails rather than guessing, leaving you to merge or rebase explicitly. `pull.rebase = true` replays your local commits on top — a good default for feature work, since those commits are usually unpushed.

- **Strength — fetch is risk-free, so look before you integrate** `git fetch && git log --oneline HEAD..@{u}` shows exactly what arrived before anything touches your branch. Making this the first command of the day removes most surprise merges.
- **Weakness — deleted remote branches linger forever** Remote-tracking refs are not removed when the branch disappears upstream, so `git branch -r` slowly fills with ghosts. `git fetch --prune` fixes it; set `fetch.prune = true` and forget about it.

**Talking to a remote, deliberately**

```bash
git fetch --all --prune
git log --oneline HEAD..@{u}     # what upstream has that I do not
git log --oneline @{u}..HEAD     # what I have that upstream does not
git status -sb                   # ahead / behind counts

git push -u origin feature       # push and set the upstream
git push --force-with-lease      # after a rebase, never plain --force
git push origin --delete old-branch

git remote -v
git remote show origin           # stale branches, tracking config
```

```ini
[pull]
    ff = only              # refuse to invent a merge; you decide
[push]
    default = simple
    autoSetupRemote = true # first push needs no -u
    followTags = true
[fetch]
    prune = true           # delete refs for branches gone upstream
    pruneTags = true
```

> **Key idea**
>
> When `git push` is rejected as *non-fast-forward*, the server is telling you it has commits your branch does not contain, and accepting would lose them. The fix is always the same shape: `git fetch`, integrate (merge or rebase), push again. Reaching for `--force` at this moment is how colleagues' work disappears.

**Interview question**

*A teammate reports that `git status` says their branch is “up to date with `origin/main`”, yet the pull request shows conflicts and CI is testing code they do not recognise. What is going on?*

They have not fetched. `git status` compares their branch against the local `origin/main` ref, which is a cached copy from whenever they last fetched — possibly days ago. The forge, meanwhile, is comparing against the actual current `main`. Nothing is broken; the two are answering different questions. The fix is `git fetch`, after which `git status` will report the real divergence, and `git log --oneline HEAD..origin/main` will list precisely what they were missing. The broader point worth making: Git never contacts the network on its own, so any statement it makes about a remote is only as fresh as your last fetch.

**Answer — refresh the cache, then look**

```bash
git fetch origin --prune
git status -sb
# ## feature...origin/feature [ahead 2, behind 17]

git log --oneline HEAD..origin/main      # what landed while I was away
git diff origin/main...HEAD --stat       # what my branch actually adds

git rebase origin/main                   # or: git merge origin/main
```

<a id="13-recovery"></a>

## 13. Getting Out of Trouble — `reflog` and `bisect`

- **Reflog retention** `90 days`
- **Reflog scope** `local only`
- **Bisect cost** `O(log n)`

These two commands are the reason Git is forgiving, and most people learn them years too late. **`git reflog`** is a local journal of every value HEAD has held: every checkout, commit, merge, rebase and reset, with timestamps. It records *pointer movements*, not commits, which is exactly why it survives operations that make commits unreachable. If work has “disappeared”, this is the first command, every time.

> **Interactive animation:** `reflog-rescue` — rendered by the page script in the HTML version.

Its limits are worth stating precisely, because “the reflog saves everything” is not true. It is **never cloned, fetched or pushed** — it is per-repository, so a colleague's reflog cannot help you. Entries expire (90 days for reachable commits, 30 for unreachable ones, by default). And it can only recover things that were *committed* — an edit you never staged or stashed exists in one place and is gone when overwritten.

**`git bisect`** answers a different question: not “where did my work go” but “which commit broke this”. You supply one commit known good and one known bad, and Git binary-searches between them, checking out a midpoint for you to test each round. Ten thousand commits take fourteen tests.

> **Interactive animation:** `bisect` — rendered by the page script in the HTML version.

- **Strength — `bisect run` turns hours into a coffee break** Give it a script that exits 0 for good and 1 for bad and it will find the culprit unattended. This is where small, individually-working commits pay off: the search is only as precise as the commits are granular.
- **Weakness — it assumes one clean transition** If the bug is intermittent, or was introduced then masked then re-exposed, bisect confidently reports a wrong answer. Exit code `125` tells it to skip an untestable commit, and `git bisect log` / `replay` let you redo a run you no longer trust.

**The two rescue commands**

```bash
git reflog                          # every position HEAD has held
git reflog show feature             # per-branch reflog
git reset --hard HEAD@{1}           # undo the last HEAD move
git branch rescue <sha>             # name an orphaned commit
git fsck --lost-found               # objects even the reflog forgot

git bisect start
git bisect bad                      # current commit is broken
git bisect good v2.3.0              # this tag was fine
#   ... test, then: git bisect good | git bisect bad | git bisect skip
git bisect reset                    # back to where you started

# Automated: exit 0 = good, 1-124 = bad, 125 = skip this commit
git bisect start HEAD v2.3.0
git bisect run ./scripts/reproduce.sh
```

```bash
#!/usr/bin/env bash
# scripts/reproduce.sh - a bisect probe worth writing
set -u

# Cannot even build this commit? Tell bisect to skip it.
make build >/dev/null 2>&1 || exit 125

# One focused test, not the whole suite - speed matters here.
if pytest -q tests/test_retry.py::test_backoff_is_capped; then
    exit 0      # good
else
    exit 1      # bad
fi
```

> **Tip**
>
> **Make the reflog even harder to outrun.** `git config --global rerere.enabled true` remembers conflict resolutions, and `git config --global gc.reflogExpireUnreachable 90.days` keeps orphaned commits around for a full quarter instead of thirty days. Neither costs anything measurable, and both have saved afternoons.

**Interview question**

*A performance regression appeared somewhere in the last 400 commits. The only reliable reproduction is a 90-second benchmark. How do you find the commit, and what makes this harder than a normal bisect?*

Bisect handles it in roughly nine iterations — `log2(400)` — so about fourteen minutes of benchmarking rather than reading 400 diffs. The wrinkle is that “good” and “bad” are not binary for a performance number, so the probe script has to impose a threshold: run the benchmark, compare against a budget, exit 0 or 1. Pick the threshold from the known-good and known-bad measurements with clear headroom, or a noisy run will send the search down the wrong half and every subsequent answer is garbage. Two more details worth mentioning: exit `125` for commits that fail to build so they are skipped rather than misclassified, and `git bisect log` before you finish, so a run you later doubt can be replayed and corrected rather than restarted.

**Answer — bisect a performance regression**

```bash
cat > /tmp/probe.sh <<'SH'
#!/usr/bin/env bash
make build >/dev/null 2>&1 || exit 125      # untestable: skip
ms=$(./bench --json | jq '.p95_ms')
awk "BEGIN { exit !($ms < 250) }"           # 250ms budget, chosen with headroom
SH
chmod +x /tmp/probe.sh

git bisect start HEAD v2.3.0
git bisect run /tmp/probe.sh
git bisect log > /tmp/bisect.log    # keep the run; replay if it looks wrong
git bisect reset
```

<a id="14-one-page"></a>

## 14. The Whole Thing on One Page

Everything above collapses into one picture. There are three trees and a graph of immutable snapshots; refs are small files naming commits in that graph; and every command is a move between trees, a move of a ref, or a new object. If you can place a command on this diagram, you know what it will do.

```text
  working tree        index          objects (immutable)
  ------------        -----          ------------------
   files on disk  ->  staged     ->   commit -> tree -> blob
                                          ^
        add ------------>|                |
        commit ----------------------->   |
        restore  <-------|                |
        restore --staged <-------------- HEAD
        reset --soft     : move branch only
        reset --mixed    : + rewrite index
        reset --hard     : + rewrite working tree  (DESTRUCTIVE)

  refs/heads/main -> commit    HEAD -> refs/heads/main
  refs/remotes/origin/main     (a cached photo of the server)
  refs/tags/v2.4.0             (a name that does not move)
```

> **Key idea**
>
> **The five sentences.** Objects are named by the hash of their contents, so nothing is ever modified, only added. A commit is a whole snapshot plus its parents, so diffs are computed rather than stored. A branch is a file holding one commit id, so branching and merging are pointer arithmetic. HEAD points at a branch, and losing that indirection is what detached HEAD means. And “lost” almost always means *unreachable*, which the reflog can undo — except in the working tree, which Git does not protect at all.

The commands, grouped by the question they answer:

| When you want to… | Run | Because it… |
| --- | --- | --- |
| see the whole state | `git status -sb` | prints index and working-tree columns plus ahead/behind |
| know what you are about to commit | `git diff --staged` | compares index to HEAD — exactly the next commit |
| build one clean commit from a messy tree | `git add -p` | stages hunk by hunk, so the commit is one idea |
| throw away an uncommitted edit | `git restore <file>` | copies the index over your file — unrecoverable |
| unstage without losing the edit | `git restore --staged <file>` | copies HEAD into the index only |
| undo local commits, keep the work | `git reset --soft HEAD~n` | moves the branch, leaves everything staged |
| undo a pushed commit | `git revert <sha>` | adds an inverse commit, breaking nobody's clone |
| update a branch from main | `git rebase origin/main` | replays your commits on the new base (unpushed only) |
| tidy a branch before review | `git rebase -i --autosquash main` | folds `fixup!` commits into their targets |
| see what upstream has | `git fetch && git log HEAD..@{u}` | fetch never touches your work |
| push after a rebase | `git push --force-with-lease` | refuses if the remote moved since your last fetch |
| find lost commits | `git reflog` | journals every position HEAD has held |
| find the commit that broke it | `git bisect run ./probe.sh` | binary-searches history without you watching |
| find where a line came from | `git log -S "text"` | finds commits that changed how often that string occurs |

A configuration file worth copying wholesale. None of it changes what Git can do; all of it removes a category of mistake.

**A ~/.gitconfig that prevents whole classes of accident**

```ini
[user]
    name = Your Name
    email = you@example.com
[init]
    defaultBranch = main
[pull]
    ff = only                 # never silently invent a merge commit
[push]
    autoSetupRemote = true    # first push needs no -u
    followTags = true
[fetch]
    prune = true              # drop refs for branches deleted upstream
[merge]
    conflictStyle = zdiff3    # show the base inside conflict markers
[rebase]
    autosquash = true
    autostash = true
    updateRefs = true         # carry stacked branches along
[rerere]
    enabled = true            # replay conflict resolutions
[diff]
    algorithm = histogram
    colorMoved = zebra        # moved code looks different from new code
[alias]
    st = status --short --branch
    lg = log --oneline --graph --decorate --all
    ap = add --patch
    fixup = commit --fixup
    ri = rebase --interactive --autosquash
    please = push --force-with-lease
```

```bash
# The same thing, one line at a time
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global push.autoSetupRemote true
git config --global fetch.prune true
git config --global merge.conflictStyle zdiff3
git config --global rebase.autosquash true
git config --global rebase.autostash true
git config --global rerere.enabled true
git config --global diff.algorithm histogram
git config --global diff.colorMoved zebra

git config --global --list         # check what you actually have
git config --show-origin --get pull.ff   # which file set this?
```

> **Interview**
>
> **The five questions that come up most.** *Merge or rebase?* — rebase private work, merge anything shared; the rule is about who has the commits, not about taste. *What is the difference between reset and revert?* — reset moves a pointer and rewrites history; revert adds a commit and preserves it. *What is detached HEAD?* — HEAD naming a commit instead of a branch, so new commits have nothing pointing at them. *Why is my push rejected?* — the remote has commits you lack; fetch and integrate, never force. *How do you recover lost work?* — reflog for anything committed, `fsck --lost-found` beyond that, and nothing at all for edits that were never staged.

<a id="where-to-go-next"></a>

### Where to Go Next

1. [The Git Detailed Course](git-detailed-course.html) — forty sections from the object database upward: refspecs, merge strategies, hooks, worktrees, submodules, LFS and partial clone, signing, `filter-repo`, and repository maintenance.
2. [All Git courses](git-courses.html) — the catalog page for this topic.
3. [Pro Git](https://git-scm.com/book/en/v2), by Chacon and Straub — free, complete, and chapter 10 (“Git Internals”) is the best written explanation of the object database anywhere.
4. [Learn Git Branching](https://learngitbranching.js.org/) — an interactive sandbox for rebase, cherry-pick and `--onto`. Doing them beats reading about them.
5. [The reference manual](https://git-scm.com/docs) — dry, but `git help revisions` and `git help glossary` answer more questions than their reputation suggests.

---

TechToday Study Library — Git
