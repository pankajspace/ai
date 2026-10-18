/* ==========================================================================
   "How it works" explainer pages (info/*.html)
   Page chrome, topic menu, syntax highlighting, copy buttons, topic
   accordions and lazily rendered Mermaid code-flow diagrams.
   ========================================================================== */

/* ------------------------------------------------------------------ chrome */

const progress = document.querySelector(".progress");
const backToTop = document.querySelector(".back-to-top");
const desktopMenu = window.matchMedia("(min-width: 961px)");

(() => {
    const panel = document.querySelector(".topic-menu-panel");
    const list = panel?.querySelector(".table-of-contents");
    if (!panel || !list) return;

    const links = [...list.querySelectorAll("a")];
    const sections = links
        .map((link) => ({ link, heading: document.getElementById(link.hash.slice(1)) }))
        .filter((item) => item.heading);

    const setActive = () => {
        let current = sections[0];
        for (const item of sections) {
            if (item.heading.getBoundingClientRect().top <= 96) current = item;
        }
        links.forEach((link) => link.classList.toggle("is-active", link === current?.link));
    };

    list.addEventListener("click", (event) => {
        if (!desktopMenu.matches && event.target.closest("a")) panel.open = false;
    });
    desktopMenu.addEventListener("change", () => {
        panel.open = desktopMenu.matches;
    });
    window.addEventListener("scroll", setActive, { passive: true });
    setActive();
})();

const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(percentage, 100)}%`;
    backToTop?.classList.toggle("visible", window.scrollY > 600);
};

window.addEventListener("scroll", updateScroll, { passive: true });
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
updateScroll();

/* ------------------------------------------------------------ highlighting */

const esc = (s) =>
    String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const PY_KW = new Set(
    ("False None True and as assert async await break class continue def del elif else except " +
        "finally for from global if import in is lambda nonlocal not or pass raise return try " +
        "while with yield match case self cls").split(" ")
);
const PY_BUILTIN = new Set(
    ("abs all any bin bool chr dict divmod enumerate filter float format frozenset getattr hasattr " +
        "hash hex id input int isinstance issubclass iter len list map max min next object open ord " +
        "pow print range repr reversed round set setattr slice sorted str sum super tuple type zip " +
        "Exception ValueError KeyError TypeError RuntimeError " +
        "Optional List Dict Any Literal Tuple Callable Iterable dataclass field " +
        "json os re time math random logging").split(" ")
);
const JS_KW = new Set(
    ("await break case catch class const continue debugger default delete do else export extends " +
        "finally for function if import in instanceof let new of return static super switch this " +
        "throw try typeof var void while yield async get set null undefined true false").split(" ")
);
const JS_BUILTIN = new Set(
    ("Array Object Map Set Math JSON Number String Boolean Promise console parseInt parseFloat " +
        "Date Error fetch document window localStorage setTimeout clearTimeout").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
};

const buildTokenizer = (lang) => {
    const python = lang === "python";
    const comment = python ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
    const strings = python
        ? "[rbfuRBFU]{0,2}\"\"\"[\\s\\S]*?\"\"\"|[rbfuRBFU]{0,2}'''[\\s\\S]*?'''|[rbfuRBFU]{0,2}\"(?:\\\\.|[^\"\\\\\\n])*\"|[rbfuRBFU]{0,2}'(?:\\\\.|[^'\\\\\\n])*'"
        : "`(?:\\\\.|[^`\\\\])*`|\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'";
    return new RegExp(
        `(${comment})|(${strings})` +
        "|(\\b0[xXbBoO][0-9a-fA-F_]+\\b|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)" +
        "|(@?[A-Za-z_$][\\w$]*)" +
        "|([{}()\\[\\],;])" +
        "|([+\\-*/%=<>!&|^~?:.]+)",
        "g"
    );
};

const highlight = (code, lang) => {
    const [kw, builtin] = LANG_SPEC[lang];
    const re = buildTokenizer(lang);
    let out = "";
    let last = 0;
    let previous = "";
    let match;

    while ((match = re.exec(code)) !== null) {
        out += esc(code.slice(last, match.index));
        last = match.index + match[0].length;
        const [, com, str, num, word, pun, op] = match;

        if (com !== undefined) {
            out += `<span class="tok-com">${esc(com)}</span>`;
        } else if (str !== undefined) {
            out += `<span class="tok-str">${esc(str)}</span>`;
        } else if (num !== undefined) {
            out += `<span class="tok-num">${esc(num)}</span>`;
        } else if (word !== undefined) {
            const after = code.slice(last).match(/^\s*\(/);
            let cls = "";
            if (word.startsWith("@")) cls = "tok-fn";
            else if (kw.has(word)) cls = "tok-kw";
            else if (previous === "def" || previous === "function") cls = "tok-fn";
            else if (previous === "class") cls = "tok-typ";
            else if (builtin.has(word)) cls = "tok-bui";
            else if (after) cls = "tok-fn";
            else if (/^[A-Z][A-Za-z0-9_]*$/.test(word) && !/^[A-Z0-9_]+$/.test(word)) cls = "tok-typ";
            out += cls ? `<span class="${cls}">${esc(word)}</span>` : esc(word);
            previous = word;
            continue;
        } else if (pun !== undefined) {
            out += `<span class="tok-pun">${esc(pun)}</span>`;
        } else if (op !== undefined) {
            out += `<span class="tok-op">${esc(op)}</span>`;
        }
        previous = "";
    }
    return out + esc(code.slice(last));
};

const copyText = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Copy failed");
};

document.querySelectorAll("pre > code").forEach((block) => {
    const source = block.textContent.replace(/^\n/, "").replace(/\s+$/, "");
    block.dataset.source = source;
    const lang = block.dataset.lang;
    block.innerHTML = LANG_SPEC[lang] ? highlight(source, lang) : esc(source);
});

document.querySelectorAll("pre").forEach((block) => {
    const button = document.createElement("button");
    button.className = "copy-code";
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code");
    button.addEventListener("click", async () => {
        try {
            const code = block.querySelector("code");
            await copyText(code.dataset.source ?? code.textContent);
            button.textContent = "Copied";
        } catch {
            button.textContent = "Copy failed";
        }
        window.setTimeout(() => {
            button.textContent = "Copy";
        }, 1400);
    });
    block.append(button);
});

/* ------------------------------------------------------- mermaid diagrams */

if (window.mermaid) {
    mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
            background: "#11151a",
            primaryColor: "#171c22",
            primaryTextColor: "#dce4ec",
            primaryBorderColor: "#8cc8ff",
            lineColor: "#94a0ad",
            secondaryColor: "#171c22",
            tertiaryColor: "#171c22",
            edgeLabelBackground: "#11151a",
            fontFamily: '"Avenir Next", Avenir, "Segoe UI", sans-serif',
            fontSize: "12px",
        },
        flowchart: { nodeSpacing: 45, rankSpacing: 50, padding: 12 },
    });
}

/* Mermaid measures text while drawing, so a diagram inside a collapsed
   topic is only rendered once that topic is opened. */
const renderDiagrams = (root) => {
    if (!window.mermaid) return;
    const nodes = [...root.querySelectorAll(".mermaid:not([data-processed])")];
    if (!nodes.length) return;
    mermaid
        .run({ nodes })
        .then(() => {
            // Never upscale small graphs; shrink wide ones only to a readable floor, then scroll.
            nodes.forEach((node) => {
                const svg = node.querySelector("svg");
                const natural = parseFloat(svg?.style.maxWidth);
                if (!natural) return;
                svg.style.width = `${natural}px`;
                svg.style.maxWidth = "100%";
                svg.style.minWidth = `${Math.min(natural, Math.max(560, natural * 0.7))}px`;
            });
        })
        .catch(() => {});
};

/* ------------------------------------------------ topic accordions */

(() => {
    const toggleCard = (card, forceOpen = null) => {
        if (!card) return;
        const willOpen = forceOpen !== null ? forceOpen : card.classList.contains("is-collapsed");
        card.classList.toggle("is-collapsed", !willOpen);
        card.querySelector(".topic-header")?.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) renderDiagrams(card);
    };

    const openAndScrollTo = (hash) => {
        if (!hash || hash.length < 2) return;
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!target) return;
        const section = target.closest(".topic-section");
        if (section) toggleCard(section, true);
        setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    };

    document.addEventListener("click", (event) => {
        const action = event.target.closest("[data-course-action]");
        if (action) {
            const open = action.dataset.courseAction === "expand-all";
            document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, open));
            return;
        }

        if (event.target.closest(".headerlink")) return;

        const header = event.target.closest(".topic-header");
        if (header) {
            toggleCard(header.closest(".topic-section"));
            return;
        }

        const link = event.target.closest('a[href^="#"]');
        if (link) openAndScrollTo(link.getAttribute("href"));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const header = event.target.closest(".topic-header");
        if (!header) return;
        event.preventDefault();
        toggleCard(header.closest(".topic-section"));
    });

    if (window.location.hash) setTimeout(() => openAndScrollTo(window.location.hash), 150);
    window.addEventListener("hashchange", () => openAndScrollTo(window.location.hash));
})();
