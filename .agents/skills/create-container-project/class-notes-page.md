# Class Notes (Theory) Page

Part of the `create-container-project` skill. This is the "Theory" page a project's card links to from the AI Demos catalog.

Rewrite one class-notes HTML page into the same simple design as the DSA courses, in plain, simple language, without losing teaching content. Replace every interactive example with static information, then regenerate the companion Markdown file.

**Input:** the HTML file path, e.g. `projects/techtoday/study/ai-demos/rag-embeddings.html`. If none was given, ask for it.

**Reference implementation:** `projects/techtoday/study/ai-demos/llms-prompting.html` (and its `.md`). It is the finished result of this workflow. Copy its `<head>` styles, topic/part markup, accordion script and static-example patterns (`.viz` panels that hold tables, token chips and worked examples) instead of inventing new ones.

**Design source:** `projects/techtoday/study/dsa/dsa-study.css`, `projects/techtoday/study/ai-demos/ai-demos.css`, and `dsa-study.js`. The page links them directly; do not copy them.

## 1. Prepare

1. Read the target HTML in full. Also read the reference page.
2. Run `git status --short <file>` and confirm the file is committed. If it has uncommitted changes, tell the user before rewriting.
3. Inventory the content: every `h2`/`h3`, paragraph, list, callout, code block, diagram and interactive element (sims, sliders, quizzes, games, checklists, flashcards, filters, print buttons). This list is the checklist for "nothing lost". For each interactive element, also note the facts it teaches: its preset data, the outputs it can show, and its notes and hints.

## 2. Decide what to remove

Remove only these. Keep everything else, reworded only where a removal leaves a dangling reference.

1. **Gradio UI content.** This covers `import gradio`, `gr.Interface`/`gr.Blocks` apps, `share=True` links, `*.gradio.live` and `127.0.0.1:7860` instructions, Hugging Face Spaces hosting tips, "wrap it in Gradio" wording, and Gradio in `pip install` lines.
   - Replace each Gradio app with a minimal terminal entry point so the project still runs, e.g. a `main.py` that calls `input()` then `print(fn(...))`.
   - Arena-style voting apps become `input("A/B")`.
   - Update run steps, file lists and footnotes (`app.py` → `main.py`) to match.
2. **Agenda / "flight plan" / "plan for today" section.** It duplicates the topics sidebar. Remove the section and its sidebar entry.
3. **LinkedIn / social-posting content.** This covers ship checklists, caption templates, profile-tag instructions, "post it" speaker notes and hero chips.
   - Scrub every remaining mention: lede, promise text, takeaways ("and posted it"), tips ("eye-catching on LinkedIn"), and examples whose goal is a LinkedIn post (retarget to a neutral artifact such as a blog post).
   - Move non-LinkedIn content from those sections into the most relevant topic instead of deleting it (e.g. "project ideas" → the project topic).
4. **Class numbers.** Pages must stand alone, not as "Class N" of a series. This covers "Class 2 ·" prefixes in the kicker/eyebrow, `<title>`, meta description and h1, plus every in-text and code-comment reference such as "Class 1's scraper" or "Recap from Class 2".
   - Drop the prefix where it is just a label: "Class 3 · RAG · Talk to your own documents" → "RAG · Talk to your own documents".
   - Where it refers to earlier material, name that material instead: "In Class 1 you called the API by hand" → "With the raw OpenAI API you called it by hand"; "Recap from Class 2" → "Recap: LangChain agents"; "# reuse Class 1's scraper" → "# reuse the earlier scraper".
   - Also drop "today's class" / "this class" phrasing tied to a numbered session where it reads oddly once the number is gone.
5. **Interactive examples.** This covers live sims, sliders, "type here" playgrounds, step/play buttons, games and quizzes, tickable checklists, flip-card flashcards, search/filter boxes and print buttons. Replace each one with static information as described in §5, so the facts it taught stay on the page.

## 2a. Write in plain language

Reword all prose (paragraphs, list items, callouts, analogies, captions, card text) so it is simple and direct. Keep every fact, number, name, command, example and analogy.

1. Use short sentences with one idea each. Split long sentences that are joined by dashes, semicolons or brackets.
2. Use common words. Explain a technical term in a few words the first time it appears. Keep the term itself; learners need it.
3. Say things directly. Drop filler and hype ("surprisingly", "magic", "the aha", "let's dive in", "super", "zero panic"), rhetorical questions and jokes that carry no information.
4. Use active voice and address the reader as "you".
5. Turn a dense paragraph that lists steps or options into a short list.
6. Headings say what the section covers ("How the model picks the next token"), not a teaser.
7. Do not change code, commands, file names, outputs, ids, links or numbers. Change code comments only to simplify their wording.
8. Do not shorten by deleting content. If a sentence holds a fact, keep the fact.

## 3. Rebuild the page structure

1. **Head:** keep the meta tags, title and icon (`../../logo.svg`). Delete the legacy base-href `<script>` (the one that rewrites `<base>` when the path ends in `/ai`); it was removed from every AI Demos page. Link `../dsa/dsa-study.css`, `../../site-header.css`, and `ai-demos.css` (which provides the slick course styling, responsive data cards, and layout matching the main homepage courses). Drop the old bespoke `<style>`, `ai-study-theme.css`, `ai-study.js` and Google-font links. Add a small inline `<style>`, copied from the reference, holding only the static-example helpers you actually use (e.g. token chips, probability bars). Delete styles that only served removed interactive widgets.
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
   - Indicator `ind-theory` for concepts, `ind-assignments` for hands-on/code steps, `ind-questions` for worked examples and question-and-answer lists.
6. **Block timing labels** ("Block 3 · ~15 min · the aha") go in a `ul.meta-strip` at the top of the topic's first part.

## 4. Map components

1. Analogy boxes → `.analogy` with `.analogy-icon` and `.analogy-body` (`<b>` title + `<p>`).
2. "Wow" / good-news boxes → `.callout.callout-key`.
3. Notes / speaker notes / tips → `.callout.callout-tip`.
4. Warnings / security / hallucination notes → `.callout.callout-warn`.
5. Industry spotlights → `.callout.callout-interview`, with the company chips as a nested `ul.meta-strip`.
6. Definition boxes → `blockquote`.
7. Timelines, flow steps, run steps, agendas → `ol`/`ul` with a bold lead-in.
8. Card grids and responsive data cards (avoid `<table>` elements to ensure mobile responsiveness):
   - Use `ul.card-grid` with `<li><b>title</b> text</li>` (adding `is-good`/`is-bad` where applicable) for use cases, takeaways, and 2-column key-value comparisons.
   - Use `.data-cards` with `.data-card`, `.data-card-header`, `.data-card-body`, and `.data-field` (`.data-label` + `.data-val`) for multi-column structured datasets and traces.
9. Box-and-arrow diagrams → `figure.figure.mermaid-fig > pre.mermaid` (`flowchart LR`), plus a `figcaption`. Write line breaks inside labels as `&lt;br&gt;`; a literal `<br>` is parsed as HTML and lost.
10. Code blocks:
    - Use `<span class="code-tab-label">filename</span>` + `<pre><code data-lang="python">` holding raw, HTML-escaped code at column 0 (`&lt;`, `&gt;`, `&amp;`).
    - Label every block with its real language; `dsa-study.js` highlights `python`, `javascript`, `bash`, `yaml` and `json` (aliases `js`, `py`, `sh`, `shell`, `dockerfile`, `yml`). Use `bash` for shell commands and `$ …` run transcripts, Dockerfiles, `.env`, `requirements.txt` and `.dockerignore`; `yaml` for `docker-compose.yml` and workflows; `json` for JSON payloads.
    - Use `data-lang="text"` only for content that is not code: program output, logs, prompts, folder trees, decision trees, ASCII diagrams and worked arithmetic. Never label a Python, shell, Dockerfile or YAML snippet `text`, because it then renders without highlighting.
    - Remove all hand-written highlight spans and copy-button scripts; `dsa-study.js` highlights and adds Copy buttons itself.
    - Give every real code snippet (Python, Dockerfile, compose) numbered step comments — `# ① load your documents …` on its own line above each step — following [explainer-pages.md](explainer-pages.md) *Numbered step comments*. Skip output, prompts and one-line commands, and keep any numbering the prose already refers to.
11. Delete decorative-only markup: reveal-on-scroll classes and observers, hero orbs, the sticky top nav, and duplicate progress bars.

## 5. Replace interactive examples with information

Class-notes pages have no interactive examples. Turn each one into static content that shows what the reader would have seen by using it.

1. Keep the panel as a static `.viz` box: `.viz-head` (`.viz-title` + `.viz-step`), then `.viz-stage` for the content and `.viz-note` for the takeaway. Rename the title from "Live sim · X" to "Example · X". Drop `.viz-controls`, `.viz-btn`, `.viz-input`, `.viz-scrub` and every `<button>`, `<input>`, `<select>` and `<textarea>`.
2. Choose the static form that fits the widget:
   - **Playground / type-and-see** (tokenizer, chunker, template filler) → one or two worked examples: the input, then the output the code produced for it (e.g. token chips plus the token, character and cost counts).
   - **Slider / setting comparison** (temperature, top-k, chunk size) → a structured card grid (`.data-cards`) with one card per setting. Compute the values with the widget's own formula and data, so the numbers match what it showed.
   - **Step-through / play animation** (RAG pipeline, agent loop, API round trip) → a numbered `ol` with one item per step, stating what happens and what data moves.
   - **Before/after or A/B toggle** (reranker, BM25 vs vector vs hybrid) → a `ul.card-grid` with `is-good`/`is-bad` or `.data-cards` rather than a table.
   - **Game or quiz** (guess the word, tool-or-no-tool, flashcards) → a question-and-answer list: each question, the correct answer in bold, and the reason the widget gave.
   - **Checklist with tick boxes** → a plain `ul`/`ol` with the same items.
   - **Search/filter box over a list** → the full list or card grid (`ul.card-grid` / `.data-cards`), grouped if it is long.
   - **Fake generators** (e.g. "create an API key") → a short description plus one sample output, labelled as a sample.
   - **Print button** → delete it.
3. Carry over all the information the widget held: preset data, every possible outcome or answer, hints, notes and feedback text. Data that lived only in the script (arrays, answers, explanations) must appear in the static version.
4. Reuse styles already in the reference `<style>` (token chips, `.prob-row` bars) for static output; set bar widths inline. Recolour light pastel inline colours for the dark theme.
5. Delete the widget's script and any styles used only by it. Keep only these scripts, in this order, at the end of body:
   1. `<script src="../dsa/dsa-study.js">`
   2. the accordion script copied from the reference
   3. the inline `topic-menu-panel` opener in the sidebar, if the reference has it

   Do not redeclare `dsa-study.js` globals (`progress`, `esc`, `copyText`, `VIZ`, …).
6. Reword the text around the widget. "Type anything", "drag the slider", "click Play" and "try it" become "Here is an example" or "The cards show".
7. Add `<footer class="study-footer">TechToday Study Library &mdash; AI Demos</footer>` and the `.back-to-top` button.

## 6. Write the files

1. Create `<name>.new.html` with the full rewritten page, then `mv` it over the original. Use the terminal only for the move.
2. Regenerate the companion `<name>.md` the same way (`.new.md` → `mv`). Mirror the new HTML exactly:
   - header comment with Source, Title, Theme-color, `Stylesheets: ../dsa/dsa-study.css, ../../site-header.css, ai-demos.css` and `Scripts: ../dsa/dsa-study.js`
   - navigation line `Navigation: [TechToday](../../index.html) · [← AI Demos](ai-demos.html)`, eyebrow, `# h1`, lede, chips, Table of Contents
   - `<a id="…"></a>` anchors before every `##` topic and `###` part
   - analogies as `> **Analogy** <icon> — **Title**` blockquotes, callouts as `> <icon> **Title.** …`
   - fenced code with the same language tag as the HTML `data-lang` (```` ```bash ````, ```` ```yaml ````, ```` ```python ````, ```` ```text ```` only for output/prompts/diagrams); diagrams as ```` ```mermaid ```` blocks
   - static examples as a bold `**Example · X**` title line, then the same card/dataset or worked example as numbered bullet points lists (avoiding markdown tables per workspace rules)

## 7. Validate

1. `grep -ci 'gradio\|linkedin'` and `grep -ciE 'class[ #]*[0-9]'` on both files must each return 0.
2. Open the page in the integrated browser and run one Playwright check that returns small JSON (avoid screenshots; at most one, if layout must be eyeballed):
   - no `pageerror` events
   - after clicking Expand All: topic and part counts
   - every sidebar link resolves to an element
   - `.mm-svg` count equals the number of mermaid figures
   - `pre code .tok-kw` > 0
   - every `pre code` without a `span` child is `data-lang="text"`, and each `text` block is output, a prompt, a tree or a diagram, never Python, shell, Dockerfile or YAML
   - `document.documentElement.scrollWidth <= innerWidth`
   - inside `article.study` there are no `button`, `input`, `select` or `textarea` elements other than the Expand/Collapse buttons and the Copy buttons `dsa-study.js` adds
3. `grep -ciE 'live sim|viz-btn|viz-input|viz-scrub|viz-controls|type="checkbox"|drag the|click (play|step|the button)'` on the HTML returns 0, and the page has no `<script>` besides those listed in §5.5.
4. `grep -c '<table' <file>` returns 0 (tables are converted to `.data-cards` or `ul.card-grid` components for responsive layout on all devices).
5. Check the content inventory from step 1: every non-removed item is present, including the facts each removed widget taught.
6. Read the rewritten prose against §2a: short sentences, plain words, no hype or filler, and no fact, number or example lost.
7. `grep -c 'base.href' <file>` returns 0, and the page's card in `ai-demos.html` has a corner ⓘ `data-tooltip="Theory"` link that resolves to it (add one, mirrored in `ai-demos.md`, if the card lacks it).

## 8. Report

Reply briefly with:

- what was removed
- what was moved
- any code that was added to replace Gradio apps
- each interactive example and the static form that replaced it
- each class-number reference that was reworded (not just dropped)
- any content you reworded beyond the plain-language pass and the removals
