---
description: "Use when: adding an info (ⓘ) icon to a project's demo card that links to a self-contained 'how this works' page explaining the concept, request flow, code flow, and source code for that demo"
name: "Code Explainer"
argument-hint: "Project folder (e.g. projects/basic) and which card(s)/demo(s) to explain (defaults to all cards)"
---

Add a green ⓘ info icon to one or more demo cards in `projects/<project>/src/index.html`. Clicking it opens a dedicated, self-contained explainer page under `src/info/<demo>.html` that teaches how the demo works: the concept, a request-flow diagram, a code-flow diagram, and the actual backend source code with comments.

This skill assumes the project already follows the standard template layout (`src/index.html`, `src/css/style.css`, `src/js/main.js`, `src/python/app.py` with a Flask Blueprint serving `/css/<f>` and `/js/<f>`). See `create-container-project` for that layout.

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

Create once per project (not once per demo):

- `src/css/info.css` — layout for the explainer pages: `.info-content` (prose), `.flow-diagram`/`.flow-step`/`.flow-arrow`/`.flow-branch` (the request-flow diagram), `.mermaid-wrap` (the code-flow diagram), and `pre`/`.copy-code` (syntax-highlighted code blocks with a gradient top edge, drop shadow, and a Copy button — see an existing `projects/basic/src/css/info.css` for the full rule set to copy).
- `src/js/info.js` — runs `hljs.highlightAll()` and injects a "Copy" button into every `.info-content pre` that copies the code block's text to the clipboard.

## 4. One page per demo — `src/info/<demo>.html`

Copy the structure of an existing page (e.g. `projects/basic/src/info/joke.html`) and adapt the content. Section order:

1. **Header** — brand link back to `../` (not `../index.html` — the Flask index route only matches `/`) plus a "&larr; Go Back" link.
2. **Hero** — the card's emoji + title as `<h1>`, and a one-line subtitle (models/providers used).
3. **Concept** — 1-2 short paragraphs: what the demo does and *why* that model/provider/approach was chosen.
4. **Request flow** — a plain CSS box+arrow diagram (`.flow-diagram`) showing the browser → Flask route → module function → provider API → browser round trip. Use `.flow-diagram.flow-vertical` + `.flow-branch` instead of the default horizontal layout when a step fans out into parallel calls (e.g. calling two providers at once).
5. **Code flow** — a Mermaid flowchart (see below) showing the actual function-call graph with labeled arrows for both directions: the data going *into* each call and the data *returned* back up.
6. **Backend** / **API route** (one `<h2>` per source file involved, e.g. **Backend**, **Scraper**, **Summarizer**, **API route**) — the real source code for that file's relevant function(s), reproduced with genuine explanatory comments (pull from the actual source file; don't invent comments), inside `<pre><code class="language-python">…</code></pre>`.
   - Do **not** put the file path in the `<h2>` — just "Backend", "API route", etc. A one-line `<span class="file-label">` under the heading can describe what the code does.
   - Do **not** include a "Front end" / JS-wiring code section — the explainer is about the demo's logic, not the generic `setupCard()` plumbing shared by every card.

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

Load Mermaid via the classic UMD CDN bundle (works with a plain `<script>` tag, no bundler/ESM needed) and theme it to match the site's dark palette with an inline `mermaid.initialize()` call placed **immediately after** the script tag (before `</body>`, so it runs before Mermaid's own `DOMContentLoaded` auto-render):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>
    mermaid.initialize({
        startOnLoad: true,
        theme: "base",
        themeVariables: {
            background: "#1e1e1e",
            primaryColor: "#2a2a2a",
            primaryTextColor: "#e0e0e0",
            primaryBorderColor: "#90caf9",
            lineColor: "#90caf9",
            secondaryColor: "#2a2a2a",
            tertiaryColor: "#2a2a2a",
            fontFamily: "Roboto, system-ui, -apple-system, Segoe UI, sans-serif",
            fontSize: "14px",
        },
    });
</script>
<script src="../js/info.js"></script>
```

Also load highlight.js's stylesheet in `<head>` for the code blocks:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
```

## 5. Verify

- Check for errors on every edited/created file.
- Open `src/index.html` in the integrated browser, confirm each card shows the green ⓘ icon that turns orange on hover with a tooltip reading "Explanation".
- Open each `src/info/<demo>.html`, confirm: the request-flow diagram renders, the Mermaid code-flow diagram renders with labeled arrows (both call and return directions), code blocks are syntax-highlighted with a working Copy button, and "&larr; Go Back" returns to `index.html`.

## 6. Docs

Update the project's `README.md` project-structure listing and module-responsibilities section to mention `src/info/` (one page per demo), `src/css/info.css`, and `src/js/info.js`, and that each card's title has an ⓘ info icon linking to its explainer page.
