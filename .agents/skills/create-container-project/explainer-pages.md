# Demo Explainer Pages (ⓘ)

Part of the `create-container-project` skill. **Input:** the project folder (e.g. `projects/basic`) and which card(s)/demo(s) to explain; defaults to all cards.

Add a green ⓘ info icon to one or more demo cards in `projects/<project>/src/index.html`. Clicking it opens a dedicated, self-contained explainer page under `src/info/<demo>.html` that teaches how the demo works: the concept, a request-flow diagram, a code-flow diagram, and the actual backend source code with comments.

This assumes the project already follows the standard template layout (`src/index.html`, `src/css/style.css`, `src/js/main.js`, `src/python/app.py` with a Flask Blueprint serving `/css/<f>` and `/js/<f>`). See [SKILL.md](SKILL.md) for that layout.

## 1. Info icon on the card

In `index.html`, wrap each card's existing title text in a `<span class="card-title">` and add a sibling info link inside the `<h2>`:

```html
<h2>
    <span class="card-title">😂 Joke Generator</span>
    <a class="info-link" href="info/joke.html"
        data-tooltip="Explanation" aria-label="Explanation">&#x24D8;</a>
</h2>
```

- Use `data-tooltip` (not `title`) — a custom CSS tooltip reads it via `content: attr(data-tooltip)`, avoiding a duplicate native browser tooltip.
- Opens the explainer in the same tab (no `target="_blank"`), allowing users to navigate directly and return via the "&larr; Go Back" link.
- One link per card, `href="info/<demo>.html"` — a relative path so it still resolves correctly in production behind an Nginx `PATH_PREFIX`.

In `style.css`, add (the card `h2` must already be `display:flex` so `margin-left:auto` pushes the icon to the right):

```css
.info-link {
    position: relative;
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    font-size: 1rem;
    line-height: 1;
    color: #4caf50; /* green by default */
}

.info-link:hover {
    color: #ff9800; /* orange on hover */
    text-decoration: none;
}

.info-link::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 135%;
    right: 0;
    white-space: nowrap;
    background: var(--bg-elevated-2);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.6875rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
    pointer-events: none;
    z-index: 20;
}

.info-link:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
```

## 2. Flask route to serve the explainer pages

Add one route next to the existing `/css/<path:filename>` and `/js/<path:filename>` routes in `app.py`:

```python
@bp.route("/info/<path:filename>")
def info(filename):
    """Serve the "how this demo works" explainer pages from src/info."""
    return app.send_static_file(os.path.join("info", filename))
```

## 3. Shared assets

Create once per project (not once per demo) by copying these two files verbatim from `projects/basic/src/`:

- `src/css/info.css` — the TechToday course-page design, self-contained (projects can't reach `techtoday/site-header.css`): `.tt-site-header`, `.progress`, `.study-layout` with sticky `.topic-menu`, `.course-toolbar`, `.unit-divider`, collapsible `.topic-section` accordions, code blocks + `.tok-*` highlight colours, `.flow-diagram` and `.mermaid-wrap`.
- `src/js/info.js` — topic-menu scroll-spy, progress bar, back-to-top, the built-in Python/JavaScript highlighter (no highlight.js), Copy buttons, accordions with Expand/Collapse All and hash deep-links, and Mermaid init. Mermaid diagrams render lazily when their topic opens (Mermaid can't measure text inside a collapsed topic).

Every project (`ai-reliability`, `ai-systems`, `aws-strands`, `basic`, `docker`, `langchain`, `rag`) carries byte-identical copies, and `projects/techtoday/js/info.js` is identical too; only `projects/techtoday/css/info.css` differs, in its logo path (`../logo.svg`). If you change one copy, re-copy it to all of them. `info.css` loads the header logo from `src/css/logo.svg`, which the template already ships; copy it from `projects/template/src/css/` if it is missing.

## 4. One page per demo — `src/info/<demo>.html`

Copy the shell of an existing page (e.g. `projects/basic/src/info/joke.html`): `header.tt-site-header` → `div.progress` → `main.study-layout > nav.topic-menu + inline auto-open script + article.study` → `footer.study-footer` → `button.back-to-top` → Mermaid `@11` CDN script → `../js/info.js`. Load only `../css/info.css` (not the project's `style.css`).

- **Header** — brand link back to `../` (not `../index.html` — the Flask index route only matches `/`) plus a `&larr; <Project>` `nav-back-link`.
- **`<h1 id="how-it-works">`** — the card's emoji + title (CSS adds the "How it works" eyebrow), then a `p.lede` with the models/providers used.
- **Toolbar** — topic count, explainer count, Python-file count, then Expand All / Collapse All.
- **Unit 1 — How It Works**, one collapsed numbered `.topic-section` each:
  1. **Concept** — what the demo does and *why* that model/provider/approach was chosen.
  2. **Theory & Concepts** — the ideas the demo teaches.
  3. **Request flow** — a plain CSS box+arrow diagram (`.flow-diagram`): browser → Flask route → module function → provider API → browser. Use `.flow-diagram.flow-vertical` + `.flow-branch` when a step fans out into parallel calls.
  4. **Code flow** — a Mermaid flowchart (see below).
- **Unit 2 — Source Code** — one topic per Python file the demo runs, **complete and unedited** (never excerpts or rewritten comments): feature module(s) first, then the project-local modules they import (`config.py`, helpers), then `app.py`. Leave out `rate_limiter.py` — it is shared plumbing, not AI-specific code. Before embedding, make sure each file carries numbered step comments (`# ① load the documents …`, see **Numbered step comments** below) in the real source file, so the page and the code stay identical. Title the topic with the file name (`class="topic-title is-file"`), add a `topic-meta-chip` with the line count, a `span.file-path` (`src/python/joke.py`), a `p.file-label` with the module docstring's first paragraph, and `<pre><code data-lang="python">` holding the HTML-escaped file.
- Do **not** include the generic front-end `setupCard()` wiring.

Every topic header is `div.topic-header[role=button][tabindex=0][aria-expanded=false]` with a `.topic-badge` number, an `<h2 id>` + `.headerlink`, and a `.topic-chevron`; list every topic in the `.topic-menu` `<ol>`. Use the same topic IDs on every page so deep links are predictable: `concept`, `theory-concepts`, `request-flow`, `code-flow`, then `source-<file-name-kebab>-py` per file (`source-joke-py`, `source-app-py`). Units are `unit-1` and `unit-2`. End with `<footer class="study-footer"><Project> &mdash; <emoji> <Demo> &middot; How it works</footer>`.

### Numbered step comments

Every embedded file (and every code snippet on a class-notes page) carries numbered step comments so a learner can read the logic in order:

```python
# ① split the pasted text into overlapping chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
chunks = splitter.create_documents([pdf_text])

# ② embed the chunks into an in-memory Chroma store
db = Chroma.from_documents(chunks, get_embedder())
```

- Circled numerals `①`–`⑩` (then `⑪`…), one full-line comment directly above each step, indented to match it (`//` in JavaScript).
- Restart at `①` in each function, route handler, `__main__` block or script top level; group lines into 2–7 meaningful steps rather than numbering every line; skip trivial one-liners, imports and constants.
- Turn an existing comment that already describes a step into the numbered one instead of duplicating it, but keep all of its original explanation.
- Only comments change — `ast.dump(ast.parse(...))` of the file must be identical before and after.
- Add them to the real source file first, then re-embed, so the page stays a verbatim copy.

### Code-flow diagram — use Mermaid, not a hand-rolled tree

A first iteration used a nested `<ul>` call-stack tree styled with CSS. It was rejected as not showing "proper arrows" for how logic and data flow. Use a Mermaid `flowchart TD` instead — it draws real directional, labeled arrows and handles branching/merging automatically:

```html
<div class="mermaid-wrap">
    <div class="mermaid">
flowchart TD
    A[Browser<br/>topic] -->|POST /joke| B[app.py<br/>joke route]
    B -->|topic| C[joke.py<br/>get_joke]
    C -->|prompt + temperature| D[Groq API<br/>Llama 3.3 70B]
    D -->|joke text| C
    C -->|joke text| B
    B -->|JSON result| A
    </div>
</div>
```

- Label every arrow with the actual data being passed (`topic`, `prompt`, `joke text`, `JSON result`, …) — that's what makes it a *data*-flow diagram, not just a call graph.
- Draw the return trip as separate arrows going back up (`D -->|joke text| C`), not just one arrow down — this is what visually distinguishes "calls" from "returns".
- For a fan-out (e.g. LLM Arena calling two providers), branch from one node into two, then merge both back into the next node:
  ```
  C -->|prompt| D[OpenAI API]
  C -->|prompt| E[Groq API]
  D -->|reply A| C
  E -->|reply B| C
  ```
- `<br/>` inside a node label (`A[Browser<br/>topic]`) is safe and renders as a line break — Mermaid supports it.
- Keep each edge on **one line** — `A -->|label|` followed by a newline and the target node is a parse error.

Load Mermaid with a plain script tag before `info.js`; `info.js` calls `mermaid.initialize({ startOnLoad: false, … })` with the course palette and renders each diagram when its topic opens. No inline init script and no highlight.js:

```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script src="../js/info.js"></script>
```

## 5. Verify

- Check for errors on every edited/created file.
- Open `src/index.html` in the integrated browser, confirm each card shows the green ⓘ icon that turns orange on hover with a tooltip reading "Explanation".
- Open each `src/info/<demo>.html`, click **Expand All**, and confirm: every `.mermaid` holds an `svg` with no `.error-icon`, every `pre code` is highlighted (contains `span`s) with a working Copy button, there's no horizontal overflow at 390px, and the back link returns to the project index.
- Diff each embedded file against its source (`html.unescape(code) == file.read_text().rstrip("\n")`) — the source topics must be complete and unedited.
- Confirm the shared assets are still identical: `md5sum projects/*/src/css/info.css projects/*/src/js/info.js projects/techtoday/js/info.js` shows one hash per file type.

## 6. Docs

Update the project's `README.md` project-structure listing and module-responsibilities section to mention `src/info/` (one page per demo), `src/css/info.css`, and `src/js/info.js`, and that each card's title has an ⓘ info icon linking to its explainer page.

## 7. Project-level explainer on the TechToday site (optional)

Some projects also get one "how the whole project works" page on the static site, linked from their card in the AI Demos catalog. Use this for projects without per-card explainers (`interviewiq`, `shipment-exception-desk`) or when the project needs an overview across all its demos (`ai-reliability`).

1. **Location** — `projects/techtoday/info/<project-name>.html`, using the TechToday copies `../css/info.css` and `../js/info.js` (no Flask route needed; the site is static).
2. **Shell** — same as a demo page (§4) except: the brand links to `../`, the back link is `<a href="../study/ai-demos/ai-demos.html" class="nav-back-link">&larr; AI Demos</a>`, the `<h1 id="how-it-works">` is the project's emoji + name, the lede lists the demos it covers, and the footer reads `TechToday &mdash; <emoji> <Project> &middot; How it works`.
3. **Topics** — Unit 1 has the same four topics, covering the whole project (request and code flow for every demo, with Mermaid fan-outs where demos share modules). Unit 2 embeds every Python file the project runs, complete and unedited, with `span.file-path` written from the `projects/` root (`interviewiq/src/python/agent.py`).
4. **Catalog link** — in `projects/techtoday/study/ai-demos/ai-demos.html`, the project's card starts with a corner icon `<a class="info-link corner-link" href="../../info/<project-name>.html" data-tooltip="Explanation" title="Explanation" aria-label="Explanation">&#x24D8;</a>` (class-notes cards use `data-tooltip="Theory"` pointing at their study page instead). Mirror it in `ai-demos.md` as `[ⓘ](../../info/<project-name>.html)` above the card's `###` title.
5. **Docs** — add the page to the `info/` listing in `projects/techtoday/README.md` *Project Structure*.
