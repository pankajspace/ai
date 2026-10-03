---
description: "Use when: creating a crash course and a detailed course for one or more topics on the TechToday study site, with units, collapsible topic accordions, animated visualisations, a catalog page, and a homepage hub tile"
name: "create-course"
argument-hint: "One or more topics (e.g. 'Kubernetes', or 'Rust, Go' for a shared tile)"
---

Per topic, build a **crash course** (weekly-use fundamentals via mental models and animations), a **detailed course** (the whole topic from first principles), a **catalog page**, and a **hub tile** in `projects/techtoday/index.html`.

Reference implementation: **DSA** (`projects/techtoday/study/dsa/`) for teaching style and the animation engine, and **Design Patterns** (`projects/techtoday/study/design-patterns/`) for the current page design: collapsible topic accordions, Theory/Questions parts, unit dividers and the diagram helpers, all self-contained in its CSS/JS. Copy their assets and structure; don't invent a new design system.

---

## 1. Layout and rules

```
projects/techtoday/study/<slug>/      ← <slug> = lowercase-hyphenated topic
├── <slug>-courses.html / .md         ← catalog page
├── <slug>-crash-course.md / .html
├── <slug>-detailed-course.md / .html
├── <slug>-study.css                  ← copied from design-patterns-study.css (§4)
└── <slug>-study.js                   ← copied from design-patterns-study.js, widgets stripped (§4)
```

- **Markdown first, then HTML.** Every `.html` has a same-named `.md` beside it; update both in the same change.
- **Incremental.** Write a few sections at a time, appending to the file. Never generate a whole course in one pass.
- No frameworks, build step or CDN. The folder is self-contained except the shared `../../site-header.css`.
- Catalog naming: always `<slug>-courses.html` (every catalog uses it, including git and devops). The one legacy exception is `programming-languages/programming-languages.html`; don't copy that name.
- **Related topics** (e.g. "Rust, Go" → Systems Languages): nest as `study/<tile-slug>/<slug>/` with one catalog at `study/<tile-slug>/<tile-slug>-courses.html` and one hub tile. Nested pages need an extra `../` (`../../../site-header.css`). See `study/programming-languages/` and `study/devops/`.

---

## 2. Plan the syllabus first

Confirm both TOCs before writing; every Markdown anchor and HTML ID hangs off them. IDs are `<n>-<kebab-title>` and numbering runs 1…N straight through the course. The Markdown heading carries the number (`## 14. Sorting`); in HTML the number moves into the topic badge and the title stays clean (`<span class="topic-badge">14</span><h2 id="14-sorting" class="topic-title">Sorting</h2>`, see §5).

**Group sections into broad units.** Both courses split their sections into 3–7 units (crash courses usually 3–5, detailed courses 5–7), like the DSA crash course (Foundational Linear Structures → High-Speed & Relational Structures → Core Algorithms) or Design Patterns (Design Principles → Creational → Structural → Behavioural → Patterns in Practice). A unit is a teaching arc, not a filing label: order sections so each unit builds on the previous one, and move a section rather than leave it in the wrong unit. Units get a divider with a one-sentence description; they don't appear in the TOC or the sidebar, and they don't restart section numbering. A single prerequisite section may sit before Unit 1, and the closing summary sits inside the last unit.

1. **Crash course** (`<body class="is-crash">`) — 12–16 sections: what a practitioner touches weekly plus the fundamentals that make it legible. Mental model first; idiomatic code only. Open with the one prerequisite idea (DSA: Big-O); close with a one-page summary and "Where to go next" (numbered links to the detailed course, the catalog, and 2–3 external resources). ~2,200–3,200 HTML lines.
2. **Detailed course** (no body class) — 35–45 sections, each depending only on earlier ones. First principles, then proof and edge cases; full implementations in both languages, plus from-scratch versions where a language lacks the feature. Section 1 has a `callout-key` pointing to the crash course. End with a cheat sheet, pattern-recognition playbook, and practice roadmap. ~5,000–7,000 HTML lines (DSA and Design Patterns run longer because of their full implementations).

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

---

<a id="unit-1"></a>

## Unit 1 — Foundations

One sentence on what this unit covers and why it comes first.

<a id="1-the-first-idea"></a>

## 1. The first idea

- **Access** `O(1)` <!-- great -->

One paragraph of plain-language definition.

> **Analogy** 🎬
>
> **Picture it — cinema seats**
>
> The everyday mental model.

> **Interactive animation:** `cache-eviction` — rendered by the page script in the HTML version.

- **Strength — …** …                        <!-- card-grid: Strength → is-good, Weakness → is-bad -->
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
4. `**Term**` + value bullets ⇤ `ul.meta-strip`, where a trailing `<!-- great | good | ok | bad -->` picks the `.big-o` colour; `**Strength — …**` bullets ⇤ `ul.card-grid`.
5. `**Interview question**` + italic question + prose ⇄ `.worked` with `.worked-q`.
6. Consecutive fenced blocks under a bold label ⇄ `.code-tabs[data-label]`, one `.tab-pane` per language.
7. `> **Interactive animation:** \`name\`` ⇤ `<div class="viz" data-viz="name"></div>` — the widget work list for §6. Pin a variant with `` `name` (variant `opt`) `` ⇤ `data-option="opt"`.
8. Fenced `text` ⇤ `div.ascii`; italic caption ⇤ `figcaption.viz-caption`; table ⇤ `<table>`; a raw `<figure class="figure">` block passes through unchanged.
9. `## Unit n — Title` + its description paragraph ⇤ `.unit-divider` (§5).
10. Everything in a section except `.worked` blocks ⇤ the **Theory** part; every `.worked` block ⇤ the **Questions** part (§5). So end a worked question at a heading, a blockquote or the next question, never mid-theory.

The Markdown must read as a complete course before HTML starts. Because the mapping is mechanical, a throwaway converter script (kept in `/tmp`, never committed) is the recommended way to produce the HTML; have it fail loudly when the TOC and section IDs disagree or a `data-viz` has no `VIZ` key.

---

## 4. Scaffold assets

```bash
cd projects/techtoday/study && mkdir -p <slug>
cp design-patterns/design-patterns-study.css <slug>/<slug>-study.css
cp design-patterns/design-patterns-study.js  <slug>/<slug>-study.js
```

Copy from Design Patterns, not DSA: DSA's own `dsa-study.css`/`.js` lack the accordion (DSA keeps it in inline `<style>`/`<script>` blocks), while the Design Patterns files carry the DSA engine plus the accordion, collapsible questions and diagram helpers in one place.

1. **CSS** — update the header comment and both eyebrows: `.study>h1:first-child::before { content: "<Topic>"; }` and `body.is-crash .study>h1:first-child::before { content: "<Topic> crash course"; }`. Strip any eyebrow rules for other body classes (`is-quick`, `is-advanced`) you don't use.
2. **JS** — update the header comment and `const LANG_KEY = "tt-<slug>-lang";`. Delete the copied topic widgets (every `VIZ[...]` between the `Design pattern widgets` banner and the `viz player` marker, including the whole `Detailed-course widgets` section) but keep everything above the banner (the engine helpers, including `bandHTML`/`pathHTML`, and the `Extra render helpers`), the shared helpers just under it (`linkHTML`, `classHTML`, `scene`, `chipHTML`/`rowHTML`/`stackHTML`), the player, the collapsible-questions block and the accordion block at the end. Rename the banner to `<Topic> widgets`. Run `node --check <slug>-study.js`.
3. **Other languages** — extend the built-in highlighter (keyword/builtin `Set`, a `LANG_SPEC` entry, a `buildTokenizer` branch, a `LANG_LABEL` entry). No highlighting library. Typed languages can reuse a parent's sets (TypeScript = JavaScript sets plus `interface implements private readonly …`).

---

## 5. HTML page and components

Convert the approved Markdown section by section: headings, IDs, prose and code verbatim; only wrappers are new. Copy the shell from `design-patterns/design-patterns-crash-course.html` (`header.tt-site-header` → `div.progress` → `main.study-layout > nav.topic-menu + script + article.study` → `footer.study-footer` → `button.back-to-top` → `<script src="<slug>-study.js">`) and change the `<title>`, meta description (one specific sentence), CSS/JS filenames, `body` class, back link (`<slug>-courses.html`, or `../<tile-slug>-courses.html` when nested), `<h1>` and footer text.

Must-haves:

- `<p class="lede">` after the `<h1>`, telling the reader to press **Play** on animations; an optional intro `callout-key` may follow it.
- Every `<h1>`–`<h4>` ends with `<a class="headerlink" href="#id" title="Permanent link">#</a>`.
- Pre-rendered `<nav class="topic-menu" aria-label="Topics">` containing `<details class="topic-menu-panel"><summary>Topics</summary><ol class="table-of-contents table-of-contents-numbered">...</ol></details></nav>` and the desktop auto-open `<script>` directly inside `<main class="study-layout">` before `<article class="study">`. One `<li>` per section (no units), title without its number. JS attaches scroll-spy, active link tracking, and mobile drawer toggles without causing layout shift.
- The course toolbar, the unit dividers and the topic accordions below.
- `<!-- ============================================================ n -->` rulers before each section, for navigating these long files.

### The accordion layout

Every course page is a stack of collapsed cards: the reader sees a scannable list of numbered topics, opens one, then opens its **Theory** or **Questions** part. Nothing is expanded on load. Right after the lede (and intro callout), add the toolbar:

```html
<div class="course-toolbar">
    <div class="course-toolbar-info">
        <span>14 Topics</span>
        <span class="dot">&bull;</span>
        <span>Mental Models, Interactive Animations &amp; Worked Questions</span>
    </div>
</div>
<div class="course-toolbar-actions">
    <button type="button" class="action-btn" data-course-action="expand-all">…svg…<span>Expand All</span></button>
    <button type="button" class="action-btn" data-course-action="collapse-all">…svg…<span>Collapse All</span></button>
</div>
```

A unit divider sits between sections, never inside one:

```html
<div class="unit-divider" id="unit-2">
    <div class="unit-divider-badge">Unit 2</div>
    <div class="unit-divider-text">
        <h2 class="unit-divider-title">Creational Patterns<a class="headerlink" href="#unit-2" title="Permanent link">#</a></h2>
        <p class="unit-divider-desc">One sentence from the Markdown.</p>
    </div>
</div>
```

Each section is a topic card with a Theory part and, when it has worked questions, a Questions part (`<id>` is the section ID; copy the chevron/arrow SVGs from the reference page):

```html
<section class="topic-section is-collapsed" id="sec-<id>" data-topic="<id>">
    <div class="topic-header" role="button" tabindex="0" aria-expanded="false" aria-controls="content-<id>">
        <div class="topic-header-main">
            <span class="topic-badge">3</span>
            <h2 id="<id>" class="topic-title">Factories<a class="headerlink" href="#<id>" title="Permanent link">#</a></h2>
        </div>
        <div class="topic-header-meta"><span class="topic-chevron" aria-hidden="true">…svg…</span></div>
    </div>
    <div class="topic-content" id="content-<id>">
        <div class="part-section is-collapsed" id="<id>-theory">
            <div class="part-header" role="button" tabindex="0" aria-expanded="false" aria-controls="body-<id>-theory">
                <div class="part-header-left">
                    <span class="part-indicator ind-theory"></span>
                    <h3 class="part-heading">Theory<a class="headerlink" href="#<id>-theory" title="Permanent link">#</a></h3>
                </div>
                <div class="part-header-right"><span class="part-arrow" aria-hidden="true">…svg…</span></div>
            </div>
            <div class="part-body" id="body-<id>-theory">
                …meta-strip, prose, analogy, viz, card-grid, h3 subsections, callouts…
            </div>
        </div>
        <div class="part-section is-collapsed" id="<id>-questions">
            …same header with ind-questions, "Questions", and <span class="part-counter">1</span> before the arrow…
            <div class="part-body" id="body-<id>-questions">…every .worked block of the section…</div>
        </div>
    </div>
</section>
```

- The badge number is the section number; the `h2` text has no number. IDs follow the pattern exactly (`sec-`, `content-`, `-theory`, `body-…`), because the script and deep links rely on them.
- `part-counter` equals the number of `.worked` blocks in that part. Omit the Questions part when a section has none (summaries, cheat sheets, roadmaps).
- The copied JS supplies all behaviour; don't add inline scripts: header click/Enter/Space toggles a card (headerlink clicks don't); TOC and `#hash` links open the target's topic and part, then scroll to it; Expand All/Collapse All drive every topic, part and answer; each `.worked` becomes a collapsible question whose answer is `hidden="until-found"`, so browser find-in-page still reaches it; code-tab labels move above the code box.

### Components

Styled by the copied CSS; never ad-hoc inline styles:

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
- `data-lang` must be a `LANG_LABEL` key (`python`, `javascript`, `text`, plus any you add); tabs are generated from panes and the choice persists via `LANG_KEY`.
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
- Array/graph helpers: `cellsHTML(arr, marks, tags)`, `barsHTML(arr, marks)`, `gridHTML(rows, marks)`, `dataGridHTML(rows, marks)` (wide text cells), `svgHTML(w, h, body)`, `nodeHTML(x, y, label, state, r, sub)`, `edgeHTML(x1, y1, x2, y2, state)`, `esc()`, `clone()`.
- Diagram helpers for systems and object designs: `boxHTML`, `arrowHTML`, `capHTML`, `seqHTML` (sequence diagrams), `timelineHTML`, `codeHTML(lines, marks)` (step through source lines), `panesHTML(panes)` (side-by-side stacks, queues, documents), and `chipHTML`/`rowHTML`/`stackHTML` (labelled rows of chips).
- `scene(W, H, nodes, edges, state)` is the workhorse for anything with boxes and arrows. Declare the layout once (`nodes = { id: { x, y, w, h, label, iface?, sub? } }`, `edges = [{ a, b, id?, label?, off?, dash? }]`), then each frame passes only what changed: `{ n: { id: state }, e: { edgeId: state }, sub, label, elabel, caps }`. Arrows clip to box borders automatically; `off` separates a request/response pair and puts each label on its own side; `iface: true` draws a dashed `«interface»` box.

Valid state classes — anything else fails silently as an unstyled frame:

1. `cellsHTML`: `is-active`, `is-cmp`, `is-done`, `is-out`, `is-window`, `is-dim`, `is-ghost`. Not `is-act` — the DSA `binary-search` widget has that bug; don't copy it.
2. `barsHTML`: `is-cmp`, `is-act`, `is-done`, `is-out`, `is-aux`.
3. `gridHTML` / `dataGridHTML` (keyed `"r,c"`): `is-head`, `is-act`, `is-cmp`, `is-done`, `is-empty`.
4. `nodeHTML`, `boxHTML`, `scene` nodes: `n-idle`, `n-act`, `n-cmp`, `n-done`, `n-out`; `scene` also accepts `n-ghost` (dashed, not created yet) and `hide`.
5. `edgeHTML`, `arrowHTML`, `scene` edges: `e-idle`, `e-act`, `e-done`; `scene` also accepts `hide`.
6. `codeHTML` lines and `panesHTML` items: `is-act`, `is-cmp`, `is-done`, `is-out` (panes also `is-ghost`).
7. Chips: `is-act`, `is-cmp`, `is-done`, `is-out`, `is-ghost`.
8. `legend`: `lg-cmp`, `lg-act`, `lg-done`, `lg-out`, `lg-idle`.

### Widget design rules

The widgets are what make these pages feel polished, so hold them to a standard:

1. **One idea per widget.** The title states it ("One business decision: how many files change?"), and every frame serves it.
2. **Set the scene, then move one thing per frame.** Frame 1 shows the layout with nothing active. Each later frame changes one or two states, and its note says what changed and why.
3. **Finish on the lesson.** The last note starts with `<b>Conclusion.</b>` and names the trade-off, not just the outcome.
4. **Compare with variants.** Before/after designs (inheritance vs composition, singleton vs injected, adapter vs facade) are one widget with `options`, so the reader flips between them on the same layout. Pin a variant with `data-option` when the prose discusses only one.
5. **Colour means something.** Use the same meaning across the course (`n-act` running, `n-done` finished or unchanged, `n-out` failed or must change, `n-cmp` being checked or chosen) and give every colour a legend entry.
6. **Labels fit.** Keep text inside its box, give long values a `sub` line under the box, and use counters (`caps`, e.g. `files touched: 2`) for the number the widget is really about.
7. **Check widgets headlessly.** Build every widget and every variant in Node (slice the JS from `const VIZ = {};` to the `viz player` marker) and assert frame counts, a closing conclusion, no `undefined`/`NaN`, and only the state classes above. In the browser, check text overlap and overflow numerically with `getBBox()` on each frame rather than taking screenshots.

Static pictures: inline `<svg role="img" aria-label="…">` inside `<figure class="figure">` with `<figcaption class="viz-caption">`, reusing the `n-*`/`e-*`/`vz-text` classes so diagrams match the widgets. No external images.

---

## 7. Catalog page

Copy `study/dsa/dsa-courses.html`; change title, description, favicon emoji, hero copy and cards. It uses `../../style.css` (not the study CSS), `.grid.grid-2` for two cards, `.grid` for four or more. Each card is `.card > .card-header (span.icon + h3)`, a `<p>` naming the actual sections covered (not adjectives), and `<a href="…">Start learning &rarr;</a>`. Multi-topic catalogs list crash then detailed for each topic. Add the `.md` counterpart: title, hero copy, one bullet per card with its link.

---

## 8. Homepage hub tile

Add or update one `.hub-tile` in `.hub-grid` of `projects/techtoday/index.html`. Many future topics already have a **WIP placeholder tile** (LLD, HLD, Databases, HTML & CSS, React Stack, MERN, Software Architecture, Software Projects, Web Performance, Web Security). If one matches, convert it in place rather than appending a duplicate: keep its position, `data-tile-id` and icon, switch `hub-status wip`/`WIP` to `live`/`Live`, and replace its `<p class="hub-tile-desc">coming soon...</p>` with the bullet list. Otherwise append a new tile:

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
- Live tiles have no `<p class="hub-tile-desc">` and no `.hub-cta` block; links go only in `ul.hub-bullet-list` (renders as horizontal pills). Only WIP placeholders use `hub-tile-desc`.
- Multi-topic tiles list crash + detailed for each topic. The last bullet is always `Show All &rarr;` to the catalog.

---

## 9. Update the docs

1. Root `README.md` — under `# Learn`, add a `## <Topic>` block with the two course links, like the Python and DSA entries.
2. `projects/techtoday/README.md` — add the folder and catalog to *Project Structure*. Keep the tile counts in sync with `index.html`: the `index.html` comment in the structure tree and *Design* item 3 (total tiles, the category list, and the "N are populated" count). Converting a WIP placeholder changes only the populated count; a new tile changes all three.
3. Root `TODO.md` — if the topic is listed under *Software & AI Engineering Courses*, mark it `// done`.

---

## 10. Verification checklist

- [ ] Each `.html` has a matching `.md` with the same sections, prose and code.
- [ ] Sections are grouped into units; dividers render between topic cards, and section numbers run 1…N across units.
- [ ] Every topic and part loads collapsed; header click and Enter/Space toggle; Expand All/Collapse All work; a `#section-id` URL and every sidebar link open and scroll to the right topic.
- [ ] Every section has a Theory part; every section with `.worked` blocks has a Questions part whose counter matches; answers start hidden and open on click.
- [ ] Sidebar renders and scroll-spy highlights (TOC IDs resolve); at 390 px it collapses into the "Topics" drawer.
- [ ] Every `data-viz` has a `VIZ` key: `grep -o 'data-viz="[a-z-]*"' study/<slug>/*.html | sort -u`.
- [ ] Widgets play, scrub and reverse; the final frame states the conclusion; state classes come from §6; the headless widget check passes for every variant.
- [ ] Language tabs switch and persist after reload; copy buttons work; no unescaped `<` `>` in code.
- [ ] Crash ↔ detailed ↔ catalog ↔ homepage links resolve, including `../../index.html`.
- [ ] No external network requests (CDN scripts, fonts, images).
- [ ] Both READMEs updated (tile counts match `grep -c 'class="hub-tile is-collapsed"' projects/techtoday/index.html`), and `TODO.md` marked done.
