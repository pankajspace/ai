---
description: "Use when: creating a crash course and a detailed course for one or more topics on the TechToday study site, with animated visualisations, a catalog page, and a homepage hub tile"
name: "create-course"
argument-hint: "One or more topics (e.g. 'Kubernetes', or 'Rust, Go' for a shared tile)"
---

Build a complete, self-contained study unit for each topic given as an argument:

1. **Crash course** — the most-used and most-fundamental parts of the topic, taught through mental models and animations.
2. **Detailed course** — the whole topic, section by section, from first principles.
3. **Catalog page** + **homepage hub tile** wiring both courses into `projects/techtoday/index.html`.

Author each course in **Markdown first, then HTML**. The `.md` file is where the teaching is written and reviewed; the `.html` file is that same content wired into the site's components and animation engine. Every `.html` page in `study/` has a `.md` counterpart next to it, and the two must stay in sync.

The reference implementation is **DSA** (`projects/techtoday/study/dsa/`). It is the most complete unit on the site — it carries the animation engine. Copy its assets and match its structure; do not invent a new design system.

---

## 0. Conventions and naming

Given a topic, derive a lowercase hyphenated `<slug>` (`kubernetes`, `system-design`, `dsa`).

```
projects/techtoday/
├── index.html                        ← add/extend one hub tile
└── study/
    └── <slug>/
        ├── <slug>-courses.html       ← catalog page (2 cards)
        ├── <slug>-courses.md         ← Markdown counterpart
        ├── <slug>-crash-course.md    ← written first
        ├── <slug>-crash-course.html
        ├── <slug>-detailed-course.md ← written first
        ├── <slug>-detailed-course.html
        ├── <slug>-study.css          ← copy of dsa-study.css
        └── <slug>-study.js           ← copy of dsa-study.js
```

Rules that hold across the whole site:

- **Markdown first.** Write `<slug>-crash-course.md` and `<slug>-detailed-course.md` before their HTML, and keep every `.html` page paired with a same-named `.md` in the same folder.
- **No frameworks, no build step, no CDN.** Plain HTML + one CSS file + one JS file per topic folder.
- Each topic folder is **self-contained** except for `../../site-header.css`, which is shared.
- Catalog page naming follows the topic's own noun: `-courses.html` for courses, `-guides.html` where the existing site already used that (`git-guides.html`, `devops-guides.html`). For a new topic prefer `-courses.html`.
- When the argument is **multiple topics that belong together** (e.g. "Rust, Go" → *Systems Languages*), nest each topic folder under a parent folder named after the hub tile — `study/<tile-slug>/<slug>/` — with a **single catalog page at `study/<tile-slug>/<tile-slug>-courses.html`** listing every topic's cards, and a **single hub tile with a final `Show All &rarr;` bullet**. Follow `study/programming-languages/{python,javascript}/` and `study/devops/{devops,docker,kubernetes}/`. Paths inside the nested course pages need one extra `../` level (`../../../site-header.css`).

---

## 1. Plan the syllabus before writing anything

Write the two tables of contents first and confirm them, because everything else — Markdown anchors and HTML section IDs alike — hangs off the section IDs.

- **Crash course** — 10–14 entries. Only what a practitioner touches weekly plus the fundamentals that make the rest legible. Group into 2–4 "Units" using `<h2 id="unit-1">Unit 1 — …</h2>` with `<h3>` sections beneath, exactly as the DSA crash course does. Start with the one prerequisite idea the whole topic rests on (DSA opens with Big-O) and end with a "the whole thing on one page" summary.
- **Detailed course** — 25–40 numbered `<h2>` sections, ordered so each depends only on earlier ones. Number them in both the ID and the visible heading: `<h2 id="14-sorting">14. Sorting</h2>`. End with a cheat sheet, a pattern-recognition playbook, and a practice roadmap.

Every section ID must be `#<n>-<kebab-title>` and every TOC entry links to it. The same IDs become the anchors in the Markdown file, so fix them once, here.

---

## 2. Write the Markdown course first

Write `<slug>-crash-course.md` and `<slug>-detailed-course.md` before touching HTML. Prose, examples, code and diagrams get reviewed here, where they are cheap to change; the HTML pass is then mechanical.

Work **incrementally, a few sections at a time**, appending to the file. Do not attempt a single generation of a whole course.

Use this shape, which is exactly what the HTML converts to and from:

````markdown
<!--
Source: <slug>-crash-course.html
Title: <Topic> Crash Course | TechToday
Description: One sentence, specific, no marketing.
-->

<a id="<slug>-crash-course"></a>

# <Topic>

Two or three sentences on how to read the page.

<a id="table-of-contents"></a>

## Table of Contents

1. [The first idea](#1-the-first-idea)

<a id="1-the-first-idea"></a>

## 1. The first idea

- **Access** `O(1)`                         <!-- meta-strip: the numbers to memorise -->

One paragraph of plain-language definition.

> **Analogy** 🎬
>
> **Picture it — cinema seats**
>
> The everyday mental model.

> **Interactive animation:** `cache-eviction` — rendered by the page script in the HTML version.

- **Strength — …** …                        <!-- card-grid -->
- **Weakness — …** …

**Interview question**

*The question.*

The reasoning, in prose, before any code.

**Answer — move zeroes in place**

```python
…
```

```javascript
…
```

> **Key idea**
>
> The gotcha people actually hit.
````

Markdown ↔ HTML mapping to keep the pair in sync:

1. `<a id="…"></a>` before a heading ⇄ the `id` on `<h1>`–`<h4>` (and its `.headerlink` anchor).
2. `> **Key idea** / **Tip** / **Warning** / **Interview**` ⇄ `.callout.callout-key` / `-tip` / `-warn` / `-interview`.
3. `> **Analogy** 🎬` + bold title ⇄ `.analogy` with `.analogy-icon` and `.analogy-body`.
4. Bullet list of `**Term**` + value ⇄ `ul.meta-strip`; bullets of `**Strength — …**` ⇄ `ul.card-grid`.
5. `**Interview question**` + italic question + prose ⇄ `.worked` with `.worked-q`.
6. Consecutive fenced blocks under a bold label ⇄ `.code-tabs[data-label]` with one `.tab-pane` per language.
7. `> **Interactive animation:** \`name\`` ⇄ `<div class="viz" data-viz="name"></div>` — one line per widget you intend to build, so §6 has a checklist.
8. Fenced `text` block ⇄ `div.ascii`; italic caption line ⇄ `figcaption.viz-caption`; Markdown table ⇄ `<table>`.

Confirm the Markdown reads as a complete course on its own before starting the HTML. If the HTML is edited later, update the `.md` in the same change — they are counterparts, not a one-way export.

---

## 3. Scaffold the topic assets

```bash
cd projects/techtoday/study
mkdir -p <slug>
cp dsa/dsa-study.css <slug>/<slug>-study.css
cp dsa/dsa-study.js  <slug>/<slug>-study.js
```

Then make exactly these edits to the copies:

**`<slug>-study.css`** — three strings:

```css
.study>h1:first-child::before { content: "<Topic name>"; }        /* eyebrow, detailed course */
body.is-crash .study>h1:first-child::before { content: "<Topic> crash course"; }
```
(the file header comment naming the guide is the third).

**`<slug>-study.js`** — the persistence key and the header comment:

```js
const LANG_KEY = "tt-<slug>-lang";   // was tt-dsa-lang
```

Keep the whole animation engine even if the first draft uses few widgets — the `VIZ` registry is additive and unused entries cost nothing at runtime (the player only mounts `[data-viz]` elements present in the page).

If the topic's code samples are not Python/JavaScript, extend the highlighter: add a keyword/builtin `Set` and a `buildTokenizer` branch, and add the label to `LANG_LABEL`. Do **not** pull in a highlighting library.

---

## 4. Page skeleton (identical for both courses)

With the Markdown approved, build the HTML page from it section by section — the headings, IDs, prose and code come across verbatim; only the wrappers are new.

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b0d10" />
    <title><Topic> Crash Course | TechToday</title>
    <meta name="description" content="One sentence, specific, no marketing." />
    <link rel="icon" href="../../logo.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="<slug>-study.css" />
    <link rel="stylesheet" href="../../site-header.css" />
</head>

<body class="is-crash">   <!-- omit the class on the detailed course -->
    <header class="tt-site-header">
        <nav class="tt-site-nav" aria-label="Main navigation">
            <a class="tt-site-brand" href="../../index.html">
                <span class="tt-site-logo" aria-hidden="true"></span>
                <span>TechToday</span>
            </a>
            <a href="../<slug>-courses.html" class="nav-back-link">&larr; <Topic> Courses</a>
        </nav>
    </header>
    <div class="progress" aria-hidden="true"></div>
    <main>
        <article class="study">
            <h1 id="<slug>-crash-course"><Topic><a class="headerlink" href="#<slug>-crash-course"
                    title="Permanent link">#</a></h1>

            <p class="lede">Two or three sentences on how to read the page. Tell the reader to press
                <strong>Play</strong> on the animations.</p>

            <h2 id="table-of-contents">Table of Contents<a class="headerlink" href="#table-of-contents"
                    title="Permanent link">#</a></h2>
            <ol class="table-of-contents table-of-contents-numbered">
                <li><a href="#1-…">…</a></li>
            </ol>

            <!-- sections -->
        </article>
    </main>
    <footer class="study-footer">TechToday Study Library &mdash; <Topic></footer>
    <button class="back-to-top" type="button" aria-label="Back to top">&uarr;</button>
    <script src="<slug>-study.js"></script>
</body>

</html>
```

Non-negotiables:

- The base-path script is the **first** element in `<head>` (production serves the site under `/ai`).
- Every `<h1>`/`<h2>`/`<h3>`/`<h4>` carries a trailing `<a class="headerlink" href="#id" title="Permanent link">#</a>`.
- `.table-of-contents` is cloned by the JS into the sticky sidebar and the mobile "Topics" drawer, and scroll-spy highlights it. If the TOC is missing or its links do not resolve to real IDs, the sidebar silently disappears.
- Insert `<!-- ====== n -->` comment rulers between sections. These files run into the thousands of lines; the rulers are how you navigate them later.

---

## 5. Section anatomy and content components

Each crash-course section follows the same rhythm, and this is what makes the pages teach rather than list:

1. `<ul class="meta-strip">` — the 2–4 numbers worth memorising.
2. One paragraph of plain-language definition.
3. `<div class="analogy">` — an everyday mental model.
4. An animation or a diagram.
5. Strength/weakness contrast via `.card-grid`.
6. `<div class="worked">` — question, reasoning, then Python/JavaScript tabs.
7. A `.callout` for the gotcha people actually hit.

Available components (all styled by the copied CSS — use these, never ad-hoc inline styles):

```html
<div class="callout callout-key">…</div>       <!-- the one idea to retain -->
<div class="callout callout-tip">…</div>
<div class="callout callout-warn">…</div>      <!-- gotcha / footgun -->
<div class="callout callout-interview">…</div>

<div class="analogy">
    <span class="analogy-icon">🎬</span>
    <div class="analogy-body"><b>Picture it — cinema seats</b><p>…</p></div>
</div>

<ul class="meta-strip">
    <li><b>Access</b> <code class="big-o o-great">O(1)</code></li>
</ul>

<ul class="card-grid">
    <li class="is-good"><b>Strength — …</b>…</li>
    <li class="is-bad"><b>Weakness — …</b>…</li>
</ul>

<div class="ascii">plain-text diagram, preserved whitespace</div>

<div class="worked">
    <b>Interview question</b>
    <p class="worked-q">The question.</p>
    <p>The reasoning, in prose, before any code.</p>
    <div class="code-tabs" data-label="Answer — move zeroes in place">
        <div class="tab-pane" data-lang="python"><pre><code data-lang="python">
…
</code></pre></div>
        <div class="tab-pane" data-lang="javascript"><pre><code data-lang="javascript">
…
</code></pre></div>
    </div>
</div>
```

- `.big-o` colour classes: `o-great`, `o-good`, `o-ok`, `o-bad`.
- Code blocks: escape `<` `>` `&` as `&lt;` `&gt;` `&amp;` inside `<code>`. Leading/trailing blank lines are stripped by the `dedent` helper, so start the code on the line after `<code …>`.
- `data-lang` must be one of the keys in `LANG_LABEL` (`python`, `javascript`, `text`). The tab bar is generated from the panes; the reader's choice persists site-wide via `LANG_KEY`.
- Tables need no wrapper — the JS wraps every `<table>` in `.table-wrap` for horizontal scroll.
- Prose rule: explain the *why* and the trade-off. Never write a section that is only a definition and a code block.

---

## 6. Animations — the part that matters most

The requirement is "explain everything using animations, images or diagrams where it makes sense". Order of preference: **animated widget → SVG/ASCII diagram → table → prose**. Any process with steps (a request travelling, a rebase rewriting history, a scheduler switching, a packet being fragmented) should be a widget, not a paragraph.

The `> **Interactive animation:** \`name\`` markers left in the Markdown are the work list: each one becomes a mounted widget here, with the same name.

Mount a widget with a single element:

```html
<div class="viz" data-viz="linked-list"></div>
<div class="viz" data-viz="sorting" data-option="merge"></div>   <!-- pins one variant -->
<div class="viz" data-viz="sorting"></div>                        <!-- shows the variant picker -->
```

Register it in `<slug>-study.js` above the `viz player` section:

```js
VIZ["cache-eviction"] = {
    title: "LRU cache eviction",
    legend: [["lg-act", "touched"], ["lg-out", "evicted"], ["lg-idle", "cold"]],
    options: [{ value: "lru", label: "LRU" }, { value: "lfu", label: "LFU" }],  // optional
    build(option) {
        const frames = [];
        frames.push({ stage: cellsHTML(arr, marks, tags), note: "Explain <em>this</em> step." });
        return frames;
    },
};
```

The contract:

- `build()` **precomputes every frame up front** and returns `[{ stage, note }]`. `stage` and `note` are HTML strings; the player only swaps `innerHTML`, so playback is deterministic, scrubbable and reversible. Never animate with `setTimeout` inside a widget.
- The player supplies restart / prev / play / next / scrubber / speed, a `step n / N` counter, autoplay on scroll-in (once, respecting `prefers-reduced-motion`) and auto-pause on scroll-out. You get all of this for free.
- `note` is where the teaching happens — one sentence naming what changed and why, with `<code>` for state (`lo=0`, `hi=10`). Aim for 8–20 frames; more than ~30 and the reader loses the thread.

Render helpers already in the file: `cellsHTML(arr, marks, tags)`, `barsHTML(arr, marks)`, `gridHTML(rows, marks)`, `svgHTML(w, h, body)`, `nodeHTML(x, y, label, state, r, sub)`, `edgeHTML(x1, y1, x2, y2, state)`, `esc()`, `clone()`.

**Use only these state classes — mismatches fail silently (no error, just an unstyled frame):**

| Helper | Valid modifier values |
| --- | --- |
| `cellsHTML` marks | `is-active`, `is-cmp`, `is-done`, `is-out`, `is-window`, `is-dim`, `is-ghost` |
| `barsHTML` marks | `is-cmp`, `is-act`, `is-done`, `is-out`, `is-aux` |
| `gridHTML` marks (keyed `"r,c"`) | `is-head`, `is-act`, `is-cmp`, `is-done`, `is-empty` |
| `nodeHTML` state | `n-idle`, `n-act`, `n-cmp`, `n-done`, `n-out` |
| `edgeHTML` state | `e-idle`, `e-act`, `e-done` |
| `legend` class | `lg-cmp`, `lg-act`, `lg-done`, `lg-out`, `lg-idle` |

> The DSA `binary-search` widget passes `is-act` to `cellsHTML`, but cells only style `is-active` — the highlight never renders. Do not copy that bug; check the table above when reusing a widget as a template.

For static pictures use inline `<svg>` (no external images) wrapped as:

```html
<figure class="figure">
    <svg viewBox="0 0 640 220" role="img" aria-label="…">…</svg>
    <figcaption class="viz-caption">What to notice in the picture.</figcaption>
</figure>
```

---

## 7. Crash course vs detailed course

|  | Crash | Detailed |
| --- | --- | --- |
| `<body>` class | `is-crash` | none |
| Sections | 10–14, grouped into Units | 25–40, numbered |
| Framing | mental model first, code second | first principles, then proof and edge cases |
| Code | the idiomatic form only | full implementations, both languages, plus the from-scratch version where a language lacks the feature |
| Length guide | ~2,500–3,000 lines of HTML | ~8,000–10,000 lines of HTML |

Cross-link them both ways:

- Detailed course, inside section 1: a `callout-key` pointing new readers at the crash course.
- Crash course, in the closing "Where to go next": a numbered list linking the detailed course, the catalog page, and 2–3 genuinely useful external resources.

Write these files **incrementally, a few sections at a time**, appending to the file — in Markdown first, then in HTML. Do not attempt a single generation of a 400 KB document.

---

## 8. Catalog page — `study/<slug>/<slug>-courses.html`

Copy `study/dsa/dsa-courses.html` and change the title, description, favicon emoji, hero copy and cards. It uses the site-wide `../../style.css` (not the study CSS), `.grid.grid-2` for two cards, plain `.grid` for four or more:

```html
<div class="card">
    <div class="card-header">
        <span class="icon">💡</span>
        <h3><Topic> Crash Course</h3>
    </div>
    <p>Two lines naming the actual sections covered — not adjectives.</p>
    <a href="<slug>-crash-course.html">Start learning &rarr;</a>
</div>
```

For a multi-topic tile, the single catalog page sits in the tile folder and lists every topic's crash + detailed card, ordered crash/detailed per topic.

Give the catalog page a `<slug>-courses.md` counterpart too — title, hero copy and one bullet per card with its link.

---

## 9. Homepage hub tile — `projects/techtoday/index.html`

Append or update one `.hub-tile` inside `.hub-grid`, preceded by an HTML comment naming it:

```html
<!-- <Topic> Tile -->
<div class="hub-tile is-collapsed" data-tile-id="<slug>">
    <div class="hub-tile-header" role="button" tabindex="0" aria-expanded="false"
        aria-label="Expand <Topic> tile">
        <div class="hub-tile-title">
            <span class="icon" aria-hidden="true">
                <svg ...>...</svg>
            </span>
            <h2><Topic></h2>
        </div>
        <span class="hub-status live">Live</span>
    </div>
    <div class="hub-tile-body">
        <ul class="hub-bullet-list">
            <li><a href="study/<slug>/<slug>-crash-course.html"><Topic> Crash Course</a></li>
            <li><a href="study/<slug>/<slug>-detailed-course.html"><Topic> Detailed Course</a></li>
            <li><a href="study/<slug>/<slug>-courses.html">Show All &rarr;</a></li>
        </ul>
    </div>
</div>
```

Tile structure rules:

1. **Collapsible container**: Include `is-collapsed` on `.hub-tile`, with `data-tile-id="<slug>"` and accessibility attributes on `.hub-tile-header` (`role="button"`, `tabindex="0"`, `aria-expanded="false"`, `aria-label="Expand <Topic> tile"`).
2. **SVG Icon**: In `.hub-tile-title .icon`, use an inline SVG with glowing gradients/filters matching the dark theme design system.
3. **Status badge**: Use `<span class="hub-status live">Live</span>` (or `wip` for upcoming topics).
4. **No main tile description**: Omit `<p class="hub-tile-desc">` on live tiles to keep vertical space compact.
5. **Horizontal bullet list**: Replace old card-box items and bottom CTA blocks with `<ul class="hub-bullet-list">` inside `<div class="hub-tile-body">`. All course links render horizontally as compact, flex-wrapped pill badges.
6. **Course bullets**: For a single topic, list its crash course and detailed course. For multi-topic tiles (e.g. Programming Languages, DevOps), list the relevant crash and detailed courses for each topic.
7. **Show All link**: The final bullet in `<ul class="hub-bullet-list">` must always link to the topic's courses catalog landing page using `Show All &rarr;` (e.g. `<li><a href="study/<slug>/<slug>-courses.html">Show All &rarr;</a></li>`). Do not add a separate bottom `.hub-cta` block.

---

## 10. Update the docs

1. **Root `README.md`** — add under `# Learn` a `## <Topic>` block with the two relative HTML links, matching the existing Python and DSA entries.
2. **`projects/techtoday/README.md`** — add the new folder and catalog page to the *Project Structure* tree, and bump the tile count and category list in *Design* item 3 ("8 category tiles…").

---

## 11. Verification checklist

Run through this before reporting done:

- [ ] Every `.html` page in the topic folder has a `.md` counterpart of the same name, and the two carry the same sections, prose and code.
- [ ] Both courses open; the sticky sidebar renders and highlights the section you are in (proves the TOC IDs resolve).
- [ ] Every `data-viz` value in the HTML has a matching key in `VIZ` — grep both and diff:
      `grep -o 'data-viz="[a-z-]*"' study/<slug>/*.html | sort -u`
- [ ] Every widget plays, scrubs, reverses, and its final frame states the conclusion.
- [ ] Widget state classes are in the table from §6.
- [ ] Language tabs switch, and the choice persists after reload.
- [ ] Copy-code buttons work; no raw `<` `>` breaking a code block.
- [ ] Crash ↔ detailed ↔ catalog ↔ homepage links all resolve, including `../../index.html` and `../<slug>-courses.html`.
- [ ] Page works at 390 px wide: the sidebar collapses into the "Topics" drawer.
- [ ] No external network requests — no CDN scripts, fonts or images.
- [ ] Root README and techtoday README updated.
