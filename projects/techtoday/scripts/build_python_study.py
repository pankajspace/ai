from __future__ import annotations

import html
import re
from pathlib import Path

import markdown
from markdown.util import AtomicString


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STUDY_DIR = PROJECT_ROOT / "study" / "python"
GUIDES = (
    ("python-crash-course", "Python Crash Course", "Crash course"),
    ("python-course", "Python Course", "Full course"),
)


def github_slugify(value: str, separator: str) -> str:
    value = str(AtomicString(value)).strip().lower()
    value = re.sub(r"[^\w\- ]", "", value, flags=re.UNICODE)
    return re.sub(r"\s", separator, value)


def render_site_header(current_slug: str) -> str:
    crash_current = ' aria-current="page"' if current_slug == "python-crash-course" else ""
    course_current = ' aria-current="page"' if current_slug == "python-course" else ""
    return f"""<header class="tt-site-header">
        <nav class="tt-site-nav" aria-label="Main navigation">
            <a class="tt-site-brand" href="../../index.html">
                <span class="tt-site-logo" aria-hidden="true">⚡</span>
                <span>TechToday</span>
            </a>
            <details class="tt-study-menu">
                <summary>Study</summary>
                <nav class="tt-study-menu-panel" aria-label="Study guides">
                    <details class="tt-study-group">
                        <summary>Python</summary>
                        <div class="tt-study-links">
                            <a href="../python/python-crash-course.html"{crash_current}>Python Crash Course</a>
                            <a href="../python/python-course.html"{course_current}>Python Course</a>
                        </div>
                    </details>
                    <details class="tt-study-group">
                        <summary>AI</summary>
                        <div class="tt-study-links">
                            <a href="../ai/llms-prompting.html">LLMs &amp; Prompting</a>
                            <a href="../ai/langchain-agents.html">LangChain &amp; Agents</a>
                            <a href="../ai/rag-embeddings.html">RAG &amp; Embeddings</a>
                            <a href="../ai/docker.html">Docker</a>
                            <a href="../ai/aws-strands.html">AWS Strands</a>
                        </div>
                    </details>
                </nav>
            </details>
        </nav>
    </header>"""


def render_guide(slug: str, title: str) -> str:
    source_path = STUDY_DIR / f"{slug}.md"
    source = source_path.read_text(encoding="utf-8")
    source = re.sub(r"^\[<- README\]\([^\n]+\)\s*", "", source, count=1)

    content = markdown.markdown(
        source,
        extensions=("fenced_code", "codehilite", "tables", "toc", "sane_lists"),
        extension_configs={
            "codehilite": {
                "css_class": "highlight",
                "guess_lang": False,
                "use_pygments": True,
            },
            "toc": {
                "permalink": "#",
                "permalink_class": "headerlink",
                "slugify": github_slugify,
            }
        },
    )
    content = re.sub(
        r'(<h2 id="table-of-contents".*?</h2>\s*)<ol>',
        r'\1<ol class="table-of-contents">',
        content,
        count=1,
        flags=re.DOTALL,
    )
    if not re.search(
        r'<ol class="table-of-contents">\s*<li><a[^>]*>\d+\.', content
    ):
        content = content.replace(
            'class="table-of-contents"',
            'class="table-of-contents table-of-contents-numbered"',
            1,
        )
    content = content.replace('href="python-course.md', 'href="python-course.html')
    content = content.replace('href="python-crash-course.md', 'href="python-crash-course.html')

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b0d10" />
    <title>{html.escape(title)} | TechToday</title>
    <link rel="stylesheet" href="python-study.css" />
    <link rel="stylesheet" href="../site-header.css" />
</head>
<body>
    {render_site_header(slug)}
    <div class="progress" aria-hidden="true"></div>
    <main>
        <article class="study">
            {content}
        </article>
    </main>
    <footer class="study-footer">TechToday Python Study Library</footer>
    <button class="back-to-top" type="button" aria-label="Back to top">&uarr;</button>
    <script src="python-study.js"></script>
</body>
</html>
"""


def main() -> None:
    for slug, title, _ in GUIDES:
        output_path = STUDY_DIR / f"{slug}.html"
        output_path.write_text(render_guide(slug, title), encoding="utf-8")
        print(f"Generated {output_path.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()