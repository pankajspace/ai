---
description: "Populate the '# My Notes' section of a study-class Markdown file with detailed concepts and fully-decoded code examples from its companion HTML/PDF source"
name: "Study Notes (My Notes)"
argument-hint: "Class Markdown file to populate (defaults to the active file)"
---
Create or update the `# My Notes` section of a study-class Markdown file so it becomes a thorough, self-contained set of learning notes — covering every main concept AND every code example (with explanations) from the class's source material. If no file is given, use the active file.

This skill is the detailed counterpart to the `quick-review` skill: `# Quick Review of Concepts` is a fast skimmable refresher, whereas `# My Notes` is the full walkthrough a learner reads to actually understand and re-implement the class.

## Where these files live
- Study notes live at `study/NN-<Class-Name>/<class-name>.md` (e.g. [study/03-AI-Infused-Learning-3/ai-infused-learning-3.md](../../../study/03-AI-Infused-Learning-3/ai-infused-learning-3.md)).
- Each `.md` has a companion source in the SAME folder — usually a `.html` slide/lecture deck with the same base name, and occasionally a `.pdf`. That companion is the source of truth.
- The `.md` typically contains: a top nav link line, `# AI Infused Learning - N`, `# Links`, optionally `# Contact` / `# Homework`, then `# My Notes` (the target), then `# Quick Review of Concepts`.

## Source
- Read the target `.md` file first to see existing structure, links, and any notes already present.
- Then read the companion source **fully** before writing:
  - **HTML decks**: the top ~300 lines are usually CSS; real content starts after `<body>` / `<header class="hero">`. Grep for `<h2`, `<h3`, `<h4`, `<pre`, `class="def"`, `class="lab"`, `class="analogy"`, `class="note"`, `class="tag"` to jump to concept sections and code blocks fast.
  - **PDF**: read the whole document; extract concepts and code in reading order.
- Base the notes ONLY on content actually present in the source — do not invent concepts, code, or APIs.
- Process the source in the order it appears so the notes follow the class's teaching flow.

## Extracting code from HTML (critical — get this exactly right)
HTML code blocks are inside `<pre>` tags with syntax-highlight `<span class="...">` wrappers and HTML-escaped characters. When copying code into the notes you MUST produce clean, runnable source:
- Decode HTML entities: `&lt;` → `<`, `&gt;` → `>`, `&amp;` → `&`, `&quot;` → `"`, `&#39;` → `'`, `&nbsp;` → space.
- Strip all `<span ...>` / `</span>` and other markup, keeping only the code text.
- Preserve indentation, blank lines, inline comments, and the filename/label shown in the code bar (e.g. `<span>rag.py</span>`) — put that filename as the first comment line inside the fenced block.
- After decoding a non-trivial block, spot-verify it against the raw HTML (e.g. `grep_search` for a distinctive function name) so no characters were dropped or mis-decoded.
- Never paraphrase or "improve" the code — reproduce it faithfully.

## Output — the `# My Notes` section
- Write into the target `.md` file, under the existing `# My Notes` heading, above `# Quick Review of Concepts`. If `# My Notes` is missing, add it.
- If the section already has content, modify/extend it to fully cover the source rather than duplicating.
- Preserve all existing content and sections, links, and the file's overall structure.
- Do not touch the `# Quick Review of Concepts` section.

### Structure and style
- Organize the notes as numbered `##` sections that follow the class's flow (e.g. `## 1. Why RAG Exists`, `## 2. The Mental Model`). Use `###` subsections for sub-topics and each build step.
- For every concept: explain what it is, why it matters, and include the memorable analogy/intuition the source uses (e.g. librarian, open-book exam, pizza slicing, clock hands, Lego bricks). Detail is expected here — this is a full re-teach, not a summary.
- For every code example: include the complete decoded code in a fenced block with the filename as the first comment, followed by a line-by-line or step-by-step explanation (mirror any ①②③ numbered callouts the source uses).
- Include terminal/run commands (in ```bash blocks) and any "wow lever" / gotcha / debug tips the source highlights.
- End with the source's "peek ahead" / preview of future classes if present.
- Follow workspace convention: prefer numbered lists and bullets over tables. Wrap symbol/API names in backticks. Use KaTeX (`$...$`) for any math.

## Quality bar
The finished `# My Notes` should let a reader who missed the class understand every concept and re-create every code example without opening the original deck. Be comprehensive: do not omit any concept or code block from the source.
