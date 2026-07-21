---
description: "Generate a '# Quick Review of Concepts' section summarizing the main ideas from study notes files"
name: "Quick Review of Concepts"
argument-hint: "File(s) to summarize (defaults to the active file)"
agent: "gemini"
---
Create or update a `# Quick Review of Concepts` section that summarizes the main ideas covered in the source material. If no files are given, use the active file.

## Source
- Read the target file(s) fully before writing.
- Source material may be in any format — Markdown notes, HTML slide decks/notes, plain text, or a mix. Handle each accordingly:
  - **Markdown notes**: concepts usually appear as `##` headings followed by an explanation.
  - **HTML notes/decks**: extract concepts from the meaningful content (section headings like `<h2>`/`<h3>`/`<h4>`, definition/callout/analogy boxes, term labels, and key explanatory prose). Ignore boilerplate such as `<style>`, `<script>`, navigation, hero/agenda filler, speaker notes, and interactive-demo scaffolding — capture the ideas those demos teach, not the UI.
  - **Other formats**: pull the main ideas from the substantive content and skip presentation/markup noise.
- If the active Markdown file references a companion source (e.g., a linked `.html` notes file), read that source too and extract concepts from it — the Markdown file may only contain a subset.
- Base the review only on concepts actually present in the source (do not invent new topics).
- Be comprehensive: capture all distinct main concepts, not just the ones already written up in the target file.

## Concept Classification
When the companion HTML source is a class/lecture with sequential classes (e.g., Class 1, Class 2, Class 3), classify each concept into one of three categories:

- **Substantive** — the concept is taught in detail in the current class's HTML (dedicated section, code walkthrough, simulator, or detailed explanation). Use a plain `##` heading with no label.
- **Recap** — the concept was taught in a *previous* class and is only briefly revisited (e.g., a "what you already know" checklist or a 30-second recap section). Append `(recap)` to the `##` heading, e.g., `## LLM API Calls (recap)`.
- **Preview** — the concept is teased for a *future* class (e.g., a "peek at where this is going" or "road ahead" section). Append `(preview)` to the `##` heading, e.g., `## RAG (preview)`.

Place recap concepts at the top of the Quick Review section, substantive concepts in the middle (in the order they appear in the HTML), and preview concepts at the bottom.

## Output
- Write the review into the target Markdown file (the active file unless another is specified).
- Place the content under the existing `# Quick Review of Concepts` heading. If that heading does not exist, add it at the end of the file.
- Summarize each concept as its own `##` subsection: use the concept name as the `##` heading (with the appropriate `(recap)` or `(preview)` label if applicable), followed by a short paragraph (two to four sentences) that recaps the idea in plain language.
- Give enough detail to genuinely refresh the concept — explain what it is and why it matters — but stay skimmable; this is a fast refresher, not a full re-teach.
- Do not use numbered lists or tables for the concept entries (per workspace convention). Ordinary prose within a subsection is fine; if a subsection needs to enumerate items, use bullet points rather than a table.
- Preserve all existing content and the file's existing links/structure.
