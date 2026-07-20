---
description: "Generate a '# Quick Review of Concepts' section summarizing the main ideas from study notes files"
name: "Quick Review of Concepts"
argument-hint: "File(s) to summarize (defaults to the active file)"
agent: "agent"
---
Create or update a `# Quick Review of Concepts` section that summarizes the main ideas covered in the provided file(s). If no files are given, use the active file.

## Source
- Read the target file(s) fully before writing.
- Base the review only on concepts actually present in the notes (do not invent new topics).
- Each concept usually appears as a `##` heading followed by an explanation.

## Output
- Place the content under the existing `# Quick Review of Concepts` heading. If that heading does not exist, add it at the end of the file.
- Summarize each concept as a numbered list item: bold the concept name, then a one-to-two sentence plain-language recap.
- Keep it concise and skimmable — this is a fast refresher, not a re-teach.
- Use numbered lists, not tables (per workspace convention).
- Preserve all existing content and the file's existing links/structure.


