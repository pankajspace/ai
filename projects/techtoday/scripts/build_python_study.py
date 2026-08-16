from __future__ import annotations

import html
import re
from pathlib import Path

import markdown
from markdown.util import AtomicString


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STUDY_DIR = PROJECT_ROOT / "src" / "study" / "python"
GUIDES = (
    ("python-crash-course", "Python Crash Course", "Crash course"),
    ("python-course", "Python Course", "Full course"),
)


def github_slugify(value: str, separator: str) -> str:
    value = str(AtomicString(value)).strip().lower()
    value = re.sub(r"[^\w\- ]", "", value, flags=re.UNICODE)
    return re.sub(r"\s", separator, value)


def render_navigation(current_slug: str) -> str:
    links = []
    for slug, title, short_title in GUIDES:
        current = ' aria-current="page"' if slug == current_slug else ""
        links.append(f'<a href="{slug}.html"{current}>{html.escape(short_title)}</a>')
    return "".join(links)


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
</head>
<body>
    <div class="progress" aria-hidden="true"></div>
    <header class="topbar">
        <div class="topbar-inner">
            <a class="brand" href="../../index.html">TechToday <span>Python</span></a>
            <nav class="guide-nav" aria-label="Python study guides">
                {render_navigation(slug)}
            </nav>
        </div>
    </header>
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