---
description: "Use when: creating a crash course and a detailed course for one or more topics on the TechToday study site, with animated visualisations, a catalog page, and a homepage hub tile"
name: "create-course"
argument-hint: "One or more topics (e.g. 'Kubernetes', or 'Rust, Go' for a shared tile)"
---

Per topic, build a **crash course** (weekly-use fundamentals via mental models and animations), a **detailed course** (the whole topic from first principles), a **catalog page**, and a **hub tile** in `projects/techtoday/index.html`.

Reference implementation: **DSA** (`projects/techtoday/study/dsa/`), which carries the animation engine. Copy its assets and structure; don't invent a new design system.

---

## 1. Layout and rules

```
projects/techtoday/study/<slug>/      ← <slug> = lowercase-hyphenated topic
├── <slug>-courses.html / .md         ← catalog page
├── <slug>-crash-course.md / .html
├── <slug>-detailed-course.md / .html
├── <slug>-study.css                  ← copy of dsa-study.css
└── <slug>-study.js                   ← copy of dsa-study.js
```

- **Markdown first, then HTML.** Every `.html` has a same-named `.md` beside it; update both in the same change.
- **Incremental.** Write a few sections at a time, appending to the file. Never generate a whole course in one pass.
- No frameworks, build step or CDN. The folder is self-contained except the shared `../../site-header.css`.
- Catalog naming: `-courses.html` (`-guides.html` only where it already exists, e.g. git, devops).
- **Related topics** (e.g. "Rust, Go" → Systems Languages): nest as `study/<tile-slug>/<slug>/` with one catalog at `study/<tile-slug>/<tile-slug>-courses.html` and one hub tile. Nested pages need an extra `../` (`../../../site-header.css`). See `study/programming-languages/` and `study/devops/`.

---

## 2. Plan the syllabus first

Confirm both TOCs before writing; every Markdown anchor and HTML ID hangs off them. IDs are `<n>-<kebab-title>`, numbered in both ID and heading: `<h2 id="14-sorting">14. Sorting</h2>`.

1. **Crash course** (`<body class="is-crash">`) — 10–14 sections: what a practitioner touches weekly plus the fundamentals that make it legible. Mental model first; idiomatic code only. Open with the one prerequisite idea (DSA: Big-O); close with a one-page summary and "Where to go next" (numbered links to the detailed course, the catalog, and 2–3 external resources). ~2,500–3,000 HTML lines.
2. **Detailed course** (no body class) — 25–40 sections, each depending only on earlier ones. First principles, then proof and edge cases; full implementations in both languages, plus from-scratch versions where a language lacks the feature. Section 1 has a `callout-key` pointing to the crash course. End with a cheat sheet, pattern-recognition playbook, and practice roadmap. ~8,000–10,000 HTML lines.

Each crash-course section follows this rhythm:

1. Meta-strip — the 2–4 numbers worth memorising.
2. One plain-language definition paragraph.
3. Analogy — an everyday mental model.
4. Animation or diagram.
5. Strength/weakness card-grid.
6. Worked interview question — reasoning in prose, then Python/JavaScript tabs.
7. Callout for the gotcha people actually hit.

Always explain the *why* and the trade-off; never write a section that is only a definition and a code block.

---

## 3. Markdown course

Teaching is reviewed here while it's cheap to change; the HTML pass is then mechanical. Use this shape:

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

Markdown ⇄ HTML mapping:

1. `<a id="…"></a>` before a heading ⇄ `id` on `<h1>`–`<h4>` plus its `.headerlink`.
2. `> **Key idea** / **Tip** / **Warning** / **Interview**` ⇄ `.callout-key` / `-tip` / `-warn` / `-interview`.
3. `> **Analogy** 🎬` + bold title ⇄ `.analogy` (`.analogy-icon`, `.analogy-body`).
4. `**Term**` + value bullets ⇄ `ul.meta-strip`; `**Strength — …**` bullets ⇄ `ul.card-grid`.
5. `**Interview question**` + italic question + prose ⇄ `.worked` with `.worked-q`.
6. Consecutive fenced blocks under a bold label ⇄ `.code-tabs[data-label]`, one `.tab-pane` per language.
7. `> **Interactive animation:** \`name\`` ⇄ `<div class="viz" data-viz="name"></div>` — the widget work list for §6.
8. Fenced `text` ⇄ `div.ascii`; italic caption ⇄ `figcaption.viz-caption`; table ⇄ `<table>`.

The Markdown must read as a complete course before HTML starts.

---

## 4. Scaffold assets

```bash
cd projects/techtoday/study && mkdir -p <slug>
cp dsa/dsa-study.css <slug>/<slug>-study.css
cp dsa/dsa-study.js  <slug>/<slug>-study.js
```

1. **CSS** — update the header comment and both eyebrows: `.study>h1:first-child::before { content: "<Topic>"; }` and `body.is-crash .study>h1:first-child::before { content: "<Topic> crash course"; }`.
2. **JS** — update the header comment and `const LANG_KEY = "tt-<slug>-lang";` (was `tt-dsa-lang`). Keep the whole animation engine; the player only mounts `[data-viz]` elements on the page.
3. **Other languages** — extend the built-in highlighter (keyword/builtin `Set`, a `buildTokenizer` branch, a `LANG_LABEL` entry). No highlighting library.

---

## 5. HTML page and components

Convert the approved Markdown section by section: headings, IDs, prose and code verbatim; only wrappers are new. Copy the shell from `dsa/dsa-crash-course.html` (`header.tt-site-header` → `div.progress` → `main.study-layout > nav.topic-menu + script + article.study` → `footer.study-footer` → `button.back-to-top` → `<script src="<slug>-study.js">`) and change the `<title>`, meta description (one specific sentence), CSS/JS filenames, `body` class, back link (`<slug>-courses.html`, or `../<tile-slug>-courses.html` when nested), `<h1>` and footer text.

Must-haves:

- `<p class="lede">` after the `<h1>`, telling the reader to press **Play** on animations.
- Every `<h1>`–`<h4>` ends with `<a class="headerlink" href="#id" title="Permanent link">#</a>`.
- Pre-rendered `<nav class="topic-menu" aria-label="Topics">` containing `<details class="topic-menu-panel"><summary>Topics</summary><ol class="table-of-contents table-of-contents-numbered">...</ol></details></nav>` and the desktop auto-open `<script>` directly inside `<main class="study-layout">` before `<article class="study">`. JS attaches scroll-spy, active link tracking, and mobile drawer toggles without causing layout shift.
- `<!-- ====== n -->` rulers between sections, for navigating these long files.

Components (styled by the copied CSS; never ad-hoc inline styles):

```html
<div class="callout callout-key">…</div>   <!-- also callout-tip, -warn (gotcha), -interview -->

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

- `.big-o` colours: `o-great`, `o-good`, `o-ok`, `o-bad`.
- Escape `<` `>` `&` inside `<code>`. Start code on the line after `<code …>` (`dedent` strips edge blank lines).
- `data-lang` must be a `LANG_LABEL` key (`python`, `javascript`, `text`); tabs are generated from panes and the choice persists via `LANG_KEY`.
- Tables need no wrapper (JS adds `.table-wrap`).

---

## 6. Animations — the part that matters most

Preference: **animated widget → SVG/ASCII diagram → table → prose**. Any stepwise process (a request travelling, a rebase, a scheduler switch) is a widget, not a paragraph. Each Markdown animation marker becomes a widget of the same name.

```html
<div class="viz" data-viz="linked-list"></div>
<div class="viz" data-viz="sorting" data-option="merge"></div>   <!-- pins a variant; omit for the picker -->
```

Register in `<slug>-study.js` above the `viz player` section:

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

- `build()` precomputes every frame as `[{ stage, note }]` HTML strings; the player only swaps `innerHTML`, so playback is deterministic, scrubbable and reversible. Never use `setTimeout` in a widget.
- The player provides controls, scrubber, speed, `step n / N`, autoplay on scroll-in (once, respecting `prefers-reduced-motion`) and auto-pause on scroll-out.
- `note` is where teaching happens: one sentence on what changed and why, with `<code>` for state (`lo=0`). Aim for 8–20 frames; never more than ~30.
- Helpers: `cellsHTML(arr, marks, tags)`, `barsHTML(arr, marks)`, `gridHTML(rows, marks)`, `svgHTML(w, h, body)`, `nodeHTML(x, y, label, state, r, sub)`, `edgeHTML(x1, y1, x2, y2, state)`, `esc()`, `clone()`.

Valid state classes — anything else fails silently as an unstyled frame:

1. `cellsHTML`: `is-active`, `is-cmp`, `is-done`, `is-out`, `is-window`, `is-dim`, `is-ghost`. Not `is-act` — the DSA `binary-search` widget has that bug; don't copy it.
2. `barsHTML`: `is-cmp`, `is-act`, `is-done`, `is-out`, `is-aux`.
3. `gridHTML` (keyed `"r,c"`): `is-head`, `is-act`, `is-cmp`, `is-done`, `is-empty`.
4. `nodeHTML`: `n-idle`, `n-act`, `n-cmp`, `n-done`, `n-out`.
5. `edgeHTML`: `e-idle`, `e-act`, `e-done`.
6. `legend`: `lg-cmp`, `lg-act`, `lg-done`, `lg-out`, `lg-idle`.

Static pictures: inline `<svg role="img" aria-label="…">` inside `<figure class="figure">` with `<figcaption class="viz-caption">`. No external images.

---

## 7. Catalog page

Copy `study/dsa/dsa-courses.html`; change title, description, favicon emoji, hero copy and cards. It uses `../../style.css` (not the study CSS), `.grid.grid-2` for two cards, `.grid` for four or more. Each card is `.card > .card-header (span.icon + h3)`, a `<p>` naming the actual sections covered (not adjectives), and `<a href="…">Start learning &rarr;</a>`. Multi-topic catalogs list crash then detailed for each topic. Add the `.md` counterpart: title, hero copy, one bullet per card with its link.

---

## 8. Homepage hub tile

Append or update one `.hub-tile` in `.hub-grid` of `projects/techtoday/index.html`:

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

- Keep `is-collapsed`, `data-tile-id` and the header's `role`/`tabindex`/`aria-*` attributes (collapsible, accessible).
- Icon: inline SVG with glowing gradients/filters matching the dark theme.
- Status: `live`, or `wip` for upcoming topics.
- No `<p class="hub-tile-desc">` and no `.hub-cta` block; links go only in `ul.hub-bullet-list` (renders as horizontal pills).
- Multi-topic tiles list crash + detailed for each topic. The last bullet is always `Show All &rarr;` to the catalog.

---

## 9. Update the docs

1. Root `README.md` — under `# Learn`, add a `## <Topic>` block with the two course links, like the Python and DSA entries.
2. `projects/techtoday/README.md` — add the folder and catalog to *Project Structure*; bump the tile count and category list in *Design* item 3.

---

## 10. Verification checklist

- [ ] Each `.html` has a matching `.md` with the same sections, prose and code.
- [ ] Sidebar renders and scroll-spy highlights (TOC IDs resolve); at 390 px it collapses into the "Topics" drawer.
- [ ] Every `data-viz` has a `VIZ` key: `grep -o 'data-viz="[a-z-]*"' study/<slug>/*.html | sort -u`.
- [ ] Widgets play, scrub and reverse; the final frame states the conclusion; state classes come from §6.
- [ ] Language tabs switch and persist after reload; copy buttons work; no unescaped `<` `>` in code.
- [ ] Crash ↔ detailed ↔ catalog ↔ homepage links resolve, including `../../index.html`.
- [ ] No external network requests (CDN scripts, fonts, images).
- [ ] Both READMEs updated.
