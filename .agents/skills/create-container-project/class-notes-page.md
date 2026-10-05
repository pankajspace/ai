# Class Notes (Theory) Page

Part of the `create-container-project` skill. This is the "Theory" page a project's card links to from the AI Demos catalog.

Rewrite one class-notes HTML page into the same simple design as the DSA courses, without losing teaching content, then regenerate its companion Markdown file.

**Input:** the HTML file path, e.g. `projects/techtoday/study/ai-demos/rag-embeddings.html`. If none was given, ask for it.

**Reference implementation:** `projects/techtoday/study/ai-demos/llms-prompting.html` (and its `.md`). It is the finished result of this workflow. Copy its `<head>` styles, topic/part markup, accordion script and sim patterns instead of inventing new ones.

**Design source:** `projects/techtoday/study/dsa/dsa-study.css` and `dsa-study.js`. The page links both directly; do not copy them.

## 1. Prepare

1. Read the target HTML in full. Also read the reference page.
2. Run `git status --short <file>` and confirm the file is committed. If it has uncommitted changes, tell the user before rewriting.
3. Inventory the content: every `h2`/`h3`, paragraph, list, callout, code block, diagram and interactive sim. This list is the checklist for "nothing lost".

## 2. Decide what to remove

Remove only these. Keep everything else, reworded only where a removal leaves a dangling reference.

1. **Gradio UI content.** This covers `import gradio`, `gr.Interface`/`gr.Blocks` apps, `share=True` links, `*.gradio.live` and `127.0.0.1:7860` instructions, Hugging Face Spaces hosting tips, "wrap it in Gradio" wording, and Gradio in `pip install` lines.
   - Replace each Gradio app with a minimal terminal entry point so the project still runs, e.g. a `main.py` that calls `input()` then `print(fn(...))`.
   - Arena-style voting apps become `input("A/B")`.
   - Update run steps, file lists and footnotes (`app.py` → `main.py`) to match.
2. **Agenda / "flight plan" / "plan for today" section.** It duplicates the topics sidebar. Remove the section and its sidebar entry.
3. **LinkedIn / social-posting content.** This covers ship checklists, caption templates, profile-tag instructions, "post it" speaker notes and hero chips.
   - Scrub every remaining mention: lede, promise text, takeaways ("and posted it"), tips ("eye-catching on LinkedIn"), and sims whose goal is a LinkedIn post (retarget to a neutral artifact such as a blog post).
   - Move non-LinkedIn content from those sections into the most relevant topic instead of deleting it (e.g. "project ideas" → the project topic).
4. **Class numbers.** Pages must stand alone, not as "Class N" of a series. This covers "Class 2 ·" prefixes in the kicker/eyebrow, `<title>`, meta description and h1, plus every in-text and code-comment reference such as "Class 1's scraper" or "Recap from Class 2".
   - Drop the prefix where it is just a label: "Class 3 · RAG · Talk to your own documents" → "RAG · Talk to your own documents".
   - Where it refers to earlier material, name that material instead: "In Class 1 you called the API by hand" → "With the raw OpenAI API you called it by hand"; "Recap from Class 2" → "Recap: LangChain agents"; "# reuse Class 1's scraper" → "# reuse the earlier scraper".
   - Also drop "today's class" / "this class" phrasing tied to a numbered session where it reads oddly once the number is gone.

## 3. Rebuild the page structure

1. **Head:** keep the meta tags, title and icon (`../../logo.svg`). Delete the legacy base-href `<script>` (the one that rewrites `<base>` when the path ends in `/ai`); it was removed from every AI Demos page. Link `../dsa/dsa-study.css` and `../../site-header.css`. Drop the old bespoke `<style>`, `ai-study-theme.css`, `ai-study.js` and Google-font links. Add a small inline `<style>`, copied from the reference, holding only the sim helpers you actually use.
2. **Body:** `<body class="is-ai">`. Set the h1 eyebrow with `body.is-ai .study>h1:first-child::before { content: "<original kicker text, minus the class number>"; }`.
3. **Layout** (same as the DSA courses), in this order:
   - site header: `header.tt-site-header > nav.tt-site-nav` with the `tt-site-brand` link to `../../index.html` and `<a href="ai-demos.html" class="nav-back-link">&larr; AI Demos</a>`
   - `.progress`
   - `main.study-layout`, containing:
     - `nav.topic-menu` with a numbered `ol.table-of-contents`. Its links point at the topic `h2` ids.
     - `article.study`, containing: h1 → `p.lede` → hero chips as `ul.meta-strip` → promise as `.callout.callout-key` → `.course-toolbar` ("N Topics • …") → Expand/Collapse buttons → topics.
4. **Topics:** one `section.topic-section.is-collapsed` per original block, with a `.topic-header`, `.topic-badge` (1..N, renumbered after removals) and `h2.topic-title` carrying the original section id.
5. **Parts:** split each topic into `.part-section.is-collapsed` blocks, one per original `h3` subsection. Content before the first `h3` goes into the first part.
   - Part ids are `<topic>-<slug>`.
   - Indicator `ind-theory` for concepts, `ind-assignments` for hands-on/code steps, `ind-questions` for live demos.
6. **Block timing labels** ("Block 3 · ~15 min · the aha") go in a `ul.meta-strip` at the top of the topic's first part.

## 4. Map components

1. Analogy boxes → `.analogy` with `.analogy-icon` and `.analogy-body` (`<b>` title + `<p>`).
2. "Wow" / good-news boxes → `.callout.callout-key`.
3. Notes / speaker notes / tips → `.callout.callout-tip`.
4. Warnings / security / hallucination notes → `.callout.callout-warn`.
5. Industry spotlights → `.callout.callout-interview`, with the company chips as a nested `ul.meta-strip`.
6. Definition boxes → `blockquote`.
7. Timelines, flow steps, run steps, agendas → `ol`/`ul` with a bold lead-in.
8. Card grids (use cases, takeaways, good/bad comparisons) → `ul.card-grid` with `<li><b>title</b>text</li>`, adding `is-good`/`is-bad` where it applies.
9. Box-and-arrow diagrams → `figure.figure.mermaid-fig > pre.mermaid` (`flowchart LR`), plus a `figcaption`. Write line breaks inside labels as `&lt;br&gt;`; a literal `<br>` is parsed as HTML and lost.
10. Code blocks:
    - Use `<span class="code-tab-label">filename</span>` + `<pre><code data-lang="python">` holding raw, HTML-escaped code at column 0 (`&lt;`, `&gt;`, `&amp;`).
    - Use `data-lang="text"` for bash, `.env` and output.
    - Remove all hand-written highlight spans and copy-button scripts; `dsa-study.js` highlights and adds Copy buttons itself.
    - Give every real code snippet (Python, Dockerfile, compose) numbered step comments — `# ① load your documents …` on its own line above each step — following [explainer-pages.md](explainer-pages.md) *Numbered step comments*. Skip output, prompts and one-line commands, and keep any numbering the prose already refers to.
11. Delete decorative-only markup: reveal-on-scroll classes and observers, hero orbs, the sticky top nav, and duplicate progress bars.

## 5. Keep interactive sims working

1. Wrap each sim in `.viz` (`.viz-head` > `.viz-title` + `.viz-step`, then `.viz-stage`, `.viz-note`, `.viz-controls`). Use `.viz-btn` / `.viz-btn.is-primary` for buttons, `.viz-input` for textareas, and `.viz-scrub` for sliders.
2. Keep element ids so the existing JS logic still binds. Update only the class names the JS generates.
3. Recolour light pastel inline colours for the dark theme (see the reference tokenizer).
4. Any user-typed text inserted via `innerHTML` must go through the global `esc()` from `dsa-study.js`, or use `textContent` instead.
5. Script order at the end of body:
   1. `<script src="../dsa/dsa-study.js">`
   2. the accordion script copied from the reference
   3. the page's sim scripts, each in its own IIFE

   Do not redeclare `dsa-study.js` globals (`progress`, `esc`, `copyText`, `VIZ`, …).
6. Add `<footer class="study-footer">TechToday Study Library &mdash; AI Demos</footer>` and the `.back-to-top` button.

## 6. Write the files

1. Create `<name>.new.html` with the full rewritten page, then `mv` it over the original. Use the terminal only for the move.
2. Regenerate the companion `<name>.md` the same way (`.new.md` → `mv`). Mirror the new HTML exactly:
   - header comment with Source, Title, Theme-color, `Stylesheets: ../dsa/dsa-study.css, ../../site-header.css` and `Scripts: ../dsa/dsa-study.js`
   - navigation line `Navigation: [TechToday](../../index.html) · [← AI Demos](ai-demos.html)`, eyebrow, `# h1`, lede, chips, Table of Contents
   - `<a id="…"></a>` anchors before every `##` topic and `###` part
   - analogies as `> **Analogy** <icon> — **Title**` blockquotes, callouts as `> <icon> **Title.** …`
   - fenced code with language tags; diagrams as ```` ```mermaid ```` blocks
   - sims as a bold title line plus `*Control:*` lines

## 7. Validate

1. `grep -ci 'gradio\|linkedin'` and `grep -ciE 'class[ #]*[0-9]'` on both files must each return 0.
2. Open the page in the integrated browser and run one Playwright check that returns small JSON (avoid screenshots; at most one, if layout must be eyeballed):
   - no `pageerror` events
   - after clicking Expand All: topic and part counts
   - every sidebar link resolves to an element
   - `.mm-svg` count equals the number of mermaid figures
   - `pre code .tok-kw` > 0
   - `document.documentElement.scrollWidth <= innerWidth`
   - click each sim's primary button and confirm its output element changed
3. Check the content inventory from step 1: every non-removed item is present.
4. `grep -c 'base.href' <file>` returns 0, and the page's card in `ai-demos.html` has a corner ⓘ `data-tooltip="Theory"` link that resolves to it (add one, mirrored in `ai-demos.md`, if the card lacks it).

## 8. Report

Reply briefly with:

- what was removed
- what was moved
- any code that was added to replace Gradio apps
- each class-number reference that was reworded (not just dropped)
- any content you reworded beyond the removals
