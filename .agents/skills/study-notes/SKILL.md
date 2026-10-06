---
description: "Populate a study-class Markdown file's '# My Notes' section (detailed concepts and fully-decoded code examples) and/or its '# Quick Review of Concepts' section (skimmable summary of the main ideas) from its companion HTML/PDF/notes sources"
name: "study-notes"
argument-hint: "File(s) to populate (defaults to the active file), and which section: notes, review, or both (default both)"
---
Create or update the study sections of a study-class Markdown file. If no file is given, use the active file. Which sections to write:

1. **`# My Notes`** — a thorough, self-contained set of learning notes covering every main concept AND every code example (with explanations) from the class's source material. This is the full walkthrough a learner reads to actually understand and re-implement the class.
2. **`# Quick Review of Concepts`** — a fast, skimmable refresher of the main ideas.

Write both unless the user asks for only one. When writing both, read the sources once, write `# My Notes` first, then derive `# Quick Review of Concepts` from the same sources so the two stay consistent.

## Where these files live
- Study notes live at `study/NN-<class-slug>/<class-slug>.md` (e.g. [study/01-llms-prompting/llms-prompting.md](../../../study/01-llms-prompting/llms-prompting.md)); project classes use `study/NN-project-<name>/project-<name>.md`. Each is listed with its class date in the root `README.md` under `# Study AI`.
- Sources sit in the SAME folder, and a folder may have any mix of them:
  - a companion `.html` slide/lecture deck with the same base name (folders 01–05 and 08), occasionally a `.pdf`;
  - a `notes/` subfolder with the class's code files (`*.py`, `README.md`, `requirements.txt`, sub-project folders, sometimes a `GUIDE.html`);
  - for project classes, the problem statement and instructor script under `notes/` (`Problem_Statement_and_Milestones.md`, `Instructor_Class_Script.md`), plus a reference solution folder beside `notes/` (e.g. `inretviewiq/`, `shipment-exception-desk/`).
- Some folders (e.g. `09-ai-reliability`, `10-mcp`) have no `.html` deck; use `notes/` and the links in the `.md` itself. If a folder has no source at all, tell the user rather than inventing notes.
- The `.md` typically contains: a top nav line (`[<- README](../../README.md) | [Notes](<class-slug>.html)`, or a bare `[Notes]` when there is no deck), `# <Class Title>`, optionally `# Contact` / `# Links` / `# Homework`, then `# My Notes`, then optionally `# Quick Review of Concepts`.
- The target may also be some other notes file (Markdown, HTML, plain text) rather than a study class. For such files, summarise the given file(s) themselves; only the Quick Review applies unless the user asks for full notes.

## Source
- Read the target `.md` file first to see existing structure, links, and any notes already present.
- Then read every source in the folder **fully** before writing:
  - **HTML decks**: the top ~300 lines are usually CSS; real content starts after `<body>` / `<header class="hero">`. Grep for `<h2`, `<h3`, `<h4`, `<pre`, `class="def"`, `class="lab"`, `class="analogy"`, `class="note"`, `class="tag"` to jump to concept sections and code blocks fast.
  - **`notes/` code files**: these are plain source, so copy them verbatim (no HTML decoding). When the same code also appears in the deck, prefer the `notes/` file and use the deck for the explanation around it.
  - **PDF**: read the whole document; extract concepts and code in reading order.
  - **Markdown notes**: concepts usually appear as `##` headings followed by an explanation.
  - **Other formats**: pull the main ideas from the substantive content and skip presentation/markup noise.
- The target `.md` may hold only a subset of the class, so always read its companion sources too and cover every distinct concept in them.
- Ignore boilerplate such as `<style>`, `<script>`, navigation, hero/agenda filler, and interactive-demo scaffolding. Capture the ideas those demos teach, not their UI.
- Base the notes ONLY on content actually present in the source — do not invent concepts, code, or APIs.
- Process the source in the order it appears so the notes follow the class's teaching flow.

## Extracting code from HTML for `# My Notes` (critical — get this exactly right)
HTML code blocks are inside `<pre>` tags with syntax-highlight `<span class="...">` wrappers and HTML-escaped characters. When copying code into the notes you MUST produce clean, runnable source:
- Decode HTML entities: `&lt;` → `<`, `&gt;` → `>`, `&amp;` → `&`, `&quot;` → `"`, `&#39;` → `'`, `&nbsp;` → space.
- Strip all `<span ...>` / `</span>` and other markup, keeping only the code text.
- Preserve indentation, blank lines, inline comments, and the filename/label shown in the code bar (e.g. `<span>rag.py</span>`) — put that filename as the first comment line inside the fenced block.
- After decoding a non-trivial block, spot-verify it against the raw HTML (e.g. search the file for a distinctive function name) so no characters were dropped or mis-decoded.
- Never paraphrase or "improve" the code — reproduce it faithfully.

## Output — the `# My Notes` section
- Write into the target `.md` file, under the existing `# My Notes` heading, above `# Quick Review of Concepts` when that section exists (otherwise at the end of the file). If `# My Notes` is missing, add it after the `# Links` / `# Homework` blocks.
- If the section already has content, modify/extend it to fully cover the source rather than duplicating.
- Preserve all existing content and sections, links, and the file's overall structure.

### Structure and style
- Organize the notes as numbered `##` sections that follow the class's flow (e.g. `## 1. Why RAG Exists`, `## 2. The Mental Model`). Use `###` subsections for sub-topics and each build step.
- For every concept: explain what it is, why it matters, and include the memorable analogy/intuition the source uses (e.g. librarian, open-book exam, pizza slicing, clock hands, Lego bricks). Detail is expected here — this is a full re-teach, not a summary.
- For every code example: include the complete decoded code in a fenced block with the filename as the first comment, followed by a line-by-line or step-by-step explanation (mirror any ①②③ numbered callouts the source uses).
- Include terminal/run commands (in ```bash blocks) and any "wow lever" / gotcha / debug tips the source highlights.
- End with the source's "peek ahead" / preview of future classes if present.
- Follow workspace convention: prefer numbered lists and bullets over tables. Wrap symbol/API names in backticks. Use KaTeX (`$...$`) for any math.

### Quality bar
The finished `# My Notes` should let a reader who missed the class understand every concept and re-create every code example without opening the original deck. Be comprehensive: do not omit any concept or code block from the source.

## Output — the `# Quick Review of Concepts` section
- Write into the target file under the existing `# Quick Review of Concepts` heading. If that heading does not exist, add it at the end of the file (after `# My Notes`).
- If the section already has content, update it to cover the source rather than duplicating.
- Preserve all existing content and sections, links, and the file's overall structure.

### Concept classification
When the source is a class/lecture in a sequence of classes (e.g., Class 1, Class 2, Class 3), classify each concept into one of three categories:

- **Substantive** — the concept is taught in detail in the current class (dedicated section, code walkthrough, simulator, or detailed explanation). Use a plain `##` heading with no label.
- **Recap** — the concept was taught in a *previous* class and is only briefly revisited (e.g., a "what you already know" checklist or a 30-second recap section). Append `(recap)` to the `##` heading, e.g., `## LLM API Calls (recap)`.
- **Preview** — the concept is teased for a *future* class (e.g., a "peek at where this is going" or "road ahead" section). Append `(preview)` to the `##` heading, e.g., `## RAG (preview)`.

Place recap concepts at the top of the section, substantive concepts in the middle (in the order they appear in the source), and preview concepts at the bottom.

### Structure and style
- Summarize each concept as its own `##` subsection: use the concept name as the heading (with the `(recap)` or `(preview)` label if applicable), followed by a short paragraph (two to four sentences) that recaps the idea in plain language.
- Give enough detail to genuinely refresh the concept — explain what it is and why it matters — but stay skimmable; this is a fast refresher, not a full re-teach.
- Do not use numbered lists or tables for the concept entries (per workspace convention). Ordinary prose within a subsection is fine; if a subsection needs to enumerate items, use bullet points rather than a table.
