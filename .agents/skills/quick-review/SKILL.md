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

## Output
- Write the review into the target Markdown file (the active file unless another is specified).
- Place the content under the existing `# Quick Review of Concepts` heading. If that heading does not exist, add it at the end of the file.
- Summarize each concept as a numbered list item in the format: `**Concept Name** — one-to-two sentence plain-language recap.`
- Keep it concise and skimmable — this is a fast refresher, not a re-teach.
- Use numbered lists, not tables (per workspace convention).
- Preserve all existing content and the file's existing links/structure.


