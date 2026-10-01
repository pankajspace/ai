/* ==========================================================================
   TechToday - Design Patterns study guide
   Page chrome, syntax highlighting, language tabs and the animation engine.
   ========================================================================== */

/* ------------------------------------------------------------------ chrome */

const progress = document.querySelector(".progress");
const backToTop = document.querySelector(".back-to-top");
const toc = document.querySelector(".table-of-contents");
const article = document.querySelector("article.study");
const main = document.querySelector("main");
const desktopMenu = window.matchMedia("(min-width: 961px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setupTopicMenu = () => {
    let nav = document.querySelector(".topic-menu");
    let panel, list;
    if (nav) {
        panel = nav.querySelector(".topic-menu-panel");
        list = nav.querySelector(".table-of-contents");
    } else {
        if (!toc || !article || !main) return null;

        nav = document.createElement("nav");
        nav.className = "topic-menu";
        nav.setAttribute("aria-label", "Topics");

        panel = document.createElement("details");
        panel.className = "topic-menu-panel";

        const summary = document.createElement("summary");
        summary.textContent = "Topics";

        list = toc.cloneNode(true);
        panel.append(summary, list);
        nav.append(panel);
        main.classList.add("study-layout");
        main.prepend(nav);
    }
    if (!panel || !list) return nav;

    const links = [...list.querySelectorAll("a")];
    const sections = links
        .map((link) => {
            const href = link.getAttribute("href") || "";
            if (!href.startsWith("#")) return null;
            const id = decodeURIComponent(href.slice(1));
            return { link, heading: document.getElementById(id) };
        })
        .filter((item) => item && item.heading);

    const syncPanel = () => {
        panel.open = desktopMenu.matches;
    };

    const setActive = () => {
        const marker = 96;
        let current = sections[0];
        for (const item of sections) {
            if (item.heading.getBoundingClientRect().top <= marker) current = item;
        }
        links.forEach((link) => link.classList.toggle("is-active", link === current?.link));
    };

    list.addEventListener("click", (event) => {
        if (!desktopMenu.matches && event.target.closest("a")) panel.open = false;
    });

    desktopMenu.addEventListener("change", syncPanel);
    window.addEventListener("scroll", setActive, { passive: true });
    syncPanel();
    setActive();
    return nav;
};

setupTopicMenu();

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

document.querySelectorAll("table").forEach((table) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrap";
    table.before(wrapper);
    wrapper.append(table);
});

const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(percentage, 100)}%`;
    backToTop.classList.toggle("visible", window.scrollY > 600);
};

window.addEventListener("scroll", updateScroll, { passive: true });
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
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
    ("abs all any bin bool chr dict divmod enumerate filter float format frozenset getattr hash " +
        "hex id input int isinstance issubclass iter len list map max min next object ord pow print " +
        "range repr reversed round set setattr slice sorted str sum super tuple type zip " +
        "deque defaultdict Counter dataclass field Enum Optional List Dict Any Literal " +
        "Protocol ABC abstractmethod property staticmethod classmethod Callable Iterator Iterable " +
        "Generic TypeVar Self Final ClassVar functools partial wraps lru_cache cache singledispatch " +
        "copy deepcopy weakref contextmanager itertools threading uuid " +
        "pytest asyncio json os time math random logging").split(" ")
);
const JS_KW = new Set(
    ("await break case catch class const continue debugger default delete do else export extends " +
        "finally for function if import in instanceof let new of return static super switch this " +
        "throw try typeof var void while yield async get set null undefined true false").split(" ")
);
const JS_BUILTIN = new Set(
    ("Array Object Map Set WeakMap WeakSet WeakRef Math JSON Number String Boolean Symbol Promise " +
        "Infinity NaN globalThis console parseInt parseFloat isNaN isFinite BigInt Proxy Reflect Date " +
        "RegExp Error TypeError RangeError SyntaxError ReferenceError AggregateError Int32Array " +
        "Uint8Array ArrayBuffer structuredClone queueMicrotask require module exports process Buffer " +
        "setTimeout setInterval clearTimeout clearInterval setImmediate fetch AbortController URL " +
        "URLSearchParams Headers Response Request document window Intl localStorage").split(" ")
);
/* TypeScript = JavaScript plus the words that make interfaces and access modifiers visible. */
const TS_KW = new Set([
    ...JS_KW,
    ...("interface implements type enum abstract private protected public readonly declare namespace " +
        "keyof is as satisfies override infer asserts").split(" "),
]);
const TS_BUILTIN = new Set([
    ...JS_BUILTIN,
    ...("string number boolean void never unknown any object bigint symbol " +
        "Record Partial Readonly Required Pick Omit ReturnType Parameters Awaited " +
        "Iterable Iterator IterableIterator Generator PropertyKey ReadonlyArray").split(" "),
]);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    typescript: [TS_KW, TS_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python";
    const comment = hashComment ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
    const strings =
        lang === "python"
            ? "[rbfu]{0,2}\"\"\"[\\s\\S]*?\"\"\"|[rbfu]{0,2}'''[\\s\\S]*?'''|[rbfu]{0,2}\"(?:\\\\.|[^\"\\\\])*\"|[rbfu]{0,2}'(?:\\\\.|[^'\\\\])*'"
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
    const [kw, builtin] = LANG_SPEC[lang] || LANG_SPEC.javascript;
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
            else if (/^[A-Z][A-Za-z0-9_]*$/.test(word)) cls = "tok-typ";
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
    out += esc(code.slice(last));
    return out;
};

const dedent = (text) => {
    const lines = text.replace(/\t/g, "    ").replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
    const pad = indents.length ? Math.min(...indents) : 0;
    return lines.map((l) => l.slice(pad)).join("\n");
};

document.querySelectorAll("pre > code").forEach((block) => {
    const lang = block.dataset.lang || "text";
    const source = dedent(block.textContent);
    block.dataset.source = source;
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

/* -------------------------------------------------------------- code tabs */

const LANG_LABEL = {
    python: "Python",
    typescript: "TypeScript",
    javascript: "JavaScript",
    text: "Output",
};
const LANG_KEY = "tt-design-patterns-lang";
const tabGroups = [];

const selectLang = (lang, persist = true) => {
    tabGroups.forEach((group) => group(lang));
    if (persist) {
        try {
            localStorage.setItem(LANG_KEY, lang);
        } catch {
            /* storage unavailable - preference is simply not remembered */
        }
    }
};

document.querySelectorAll(".code-tabs").forEach((wrap) => {
    const panes = [...wrap.querySelectorAll(".tab-pane")];
    if (panes.length < 2) return;

    const bar = document.createElement("div");
    bar.className = "tab-bar";
    bar.setAttribute("role", "tablist");

    if (wrap.dataset.label) {
        const label = document.createElement("span");
        label.className = "tab-label";
        label.textContent = wrap.dataset.label;
        bar.append(label);
    }

    const buttons = panes.map((pane) => {
        const lang = pane.dataset.lang;
        const button = document.createElement("button");
        button.className = "tab";
        button.type = "button";
        button.textContent = LANG_LABEL[lang] || lang;
        button.setAttribute("role", "tab");
        button.addEventListener("click", () => selectLang(lang));
        bar.append(button);
        return { button, pane, lang };
    });

    wrap.prepend(bar);

    const apply = (lang) => {
        const known = buttons.some((b) => b.lang === lang) ? lang : buttons[0].lang;
        buttons.forEach(({ button, pane, lang: own }) => {
            const on = own === known;
            button.setAttribute("aria-selected", String(on));
            pane.hidden = !on;
        });
    };

    tabGroups.push(apply);
    apply("python");
});

let storedLang = "python";
try {
    storedLang = localStorage.getItem(LANG_KEY) || "python";
} catch {
    /* ignore */
}
selectLang(storedLang, false);

/* ==========================================================================
   Animation engine
   Every widget precomputes an array of frames: { stage, note }.
   The player just swaps innerHTML, so playback is always deterministic.
   ========================================================================== */

const VIZ = {};

/* ---- render helpers ---- */

const cellsHTML = (arr, marks = {}, tags = {}) =>
    `<div class="cells">${arr
        .map((value, i) => {
            const cls = marks[i] ? ` ${marks[i]}` : "";
            const tag = tags[i] ? `<span class="cell-tag">${tags[i]}</span>` : "";
            return `<div class="cell${cls}">${tag}<div class="cell-box">${esc(value)}</div><div class="cell-idx">${i}</div></div>`;
        })
        .join("")}</div>`;

const barsHTML = (arr, marks = {}) => {
    const max = Math.max(...arr, 1);
    return `<div class="bars">${arr
        .map((value, i) => {
            const cls = marks[i] ? ` ${marks[i]}` : "";
            const h = Math.round((value / max) * 155) + 12;
            return `<div class="bar${cls}" style="height:${h}px"><span>${value}</span></div>`;
        })
        .join("")}</div>`;
};

const gridHTML = (rows, marks = {}) =>
    `<div class="gridviz" style="grid-template-columns:repeat(${rows[0].length},auto)">${rows
        .map((row, r) =>
            row
                .map((value, c) => {
                    const cls = marks[`${r},${c}`] || "";
                    const empty = value === "" || value === null ? " is-empty" : "";
                    return `<div class="gcell ${cls}${empty}">${esc(value ?? "")}</div>`;
                })
                .join("")
        )
        .join("")}</div>`;

const svgHTML = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-hidden="true">${body}</svg>`;

const nodeHTML = (x, y, label, state = "n-idle", r = 20, sub = "") => {
    const dark = state !== "n-idle" ? " n-label-dark" : "";
    return (
        `<circle cx="${x}" cy="${y}" r="${r}" class="${state}" stroke-width="2"/>` +
        `<text x="${x}" y="${y}" class="n-label${dark}">${esc(label)}</text>` +
        (sub ? `<text x="${x}" y="${y + r + 14}" class="n-sub">${esc(sub)}</text>` : "")
    );
};

const edgeHTML = (x1, y1, x2, y2, state = "e-idle") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${state}"/>`;

const clone = (a) => a.slice();

/* ---- shared shapes ---- */

const boxHTML = (x, y, w, h, label, state = "n-idle", sub = "") => {
    const dark = state !== "n-idle" ? " n-label-dark" : "";
    return (
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${state}" stroke-width="2"/>` +
        `<text x="${x + w / 2}" y="${y + h / 2}" class="n-label${dark}">${esc(label)}</text>` +
        (sub ? `<text x="${x + w / 2}" y="${y + h + 14}" class="n-sub">${esc(sub)}</text>` : "")
    );
};

const capHTML = (x, y, text, anchor = "middle") =>
    `<text x="${x}" y="${y}" class="n-sub" style="text-anchor:${anchor}">${esc(text)}</text>`;

const bandHTML = (x, y, w, h, label) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="#28303a" stroke-dasharray="5 5"/>` +
    capHTML(x + 12, y + 18, label, "start");

const pathHTML = (d, state = "e-idle") => `<path d="${d}" class="${state}"/>`;

/* gridHTML sizes cells for matrices; these tables hold addresses and states,
   so they need the wider .is-text variant. */
const dataGridHTML = (rows, marks = {}) =>
    `<div class="gridviz is-text" style="grid-template-columns:repeat(${rows[0].length},auto)">${rows
        .map((row, r) =>
            row
                .map((value, c) => {
                    const cls = marks[`${r},${c}`] || "";
                    const empty = value === "" || value === null ? " is-empty" : "";
                    return `<div class="gcell ${cls}${empty}">${esc(value ?? "")}</div>`;
                })
                .join("")
        )
        .join("")}</div>`;

/* An arrow whose head is stroked, not filled - the .e-* classes set fill:none. */
const arrowHTML = (x1, y1, x2, y2, state = "e-idle", label = "") => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 9 * Math.cos(a);
    const hy = y2 - 9 * Math.sin(a);
    const wing = 5;
    const p1x = hx - wing * Math.sin(a);
    const p1y = hy + wing * Math.cos(a);
    const p2x = hx + wing * Math.sin(a);
    const p2y = hy - wing * Math.cos(a);
    return (
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${state}"/>` +
        `<path d="M${p1x.toFixed(1)} ${p1y.toFixed(1)} L${x2} ${y2} L${p2x.toFixed(1)} ${p2y.toFixed(1)}" class="${state}"/>` +
        (label ? capHTML((x1 + x2) / 2, Math.min(y1, y2) - 8, label) : "")
    );
};

/* A sequence diagram: vertical lifelines with labelled arrows between them. */
const seqHTML = (W, H, lanes, msgs, marks = []) => {
    let s = "";
    lanes.forEach((ln) => {
        s += `<line x1="${ln.x}" y1="80" x2="${ln.x}" y2="${H - 10}" class="e-idle" stroke-dasharray="4 6"/>`;
        s += boxHTML(ln.x - 84, 14, 168, 40, ln.label, ln.state || "n-idle", ln.sub || "");
    });
    msgs.forEach((m) => {
        const x1 = lanes[m.from].x;
        const x2 = lanes[m.to].x;
        const dir = x2 > x1 ? 1 : -1;
        s += arrowHTML(x1 + 4 * dir, m.y, x2 - 6 * dir, m.y, m.state || "e-idle", m.text);
    });
    marks.forEach((k) => {
        s += capHTML(k.x, k.y, k.text, k.anchor || "middle");
    });
    return svgHTML(W, H, s);
};

/* ==========================================================================
   Extra render helpers
   ========================================================================== */

/* A source listing with per-line state: marks is { lineIndex: "is-act" }. */
const codeHTML = (lines, marks = {}) =>
    `<div class="codeviz">${lines
        .map((src, i) => {
            const cls = marks[i] ? ` ${marks[i]}` : "";
            return `<div class="cline${cls}"><span class="cline-no">${i + 1}</span><span class="cline-src">${esc(src)}</span></div>`;
        })
        .join("")}</div>`;

/* Side-by-side panels. Each pane is { title, items, stack, empty }, where an
   item is a string or { text, cls }. */
const panesHTML = (panes) =>
    `<div class="panes">${panes
        .map((p) => {
            const items = (p.items || []).map((it) => (typeof it === "string" ? { text: it } : it));
            const body = items.length
                ? `<div class="pane-items">${items
                    .map((it) => `<div class="pane-item${it.cls ? ` ${it.cls}` : ""}">${esc(it.text)}</div>`)
                    .join("")}</div>`
                : `<div class="pane-empty">${esc(p.empty || "empty")}</div>`;
            return `<div class="pane${p.stack ? " is-stack" : ""}"><div class="pane-title">${esc(p.title)}</div>${body}</div>`;
        })
        .join("")}</div>`;

/* A horizontal time axis with events plotted on lanes. */
const timelineHTML = (W, lanes, ticks, now) => {
    const H = 44 + lanes.length * 54;
    const x0 = 92;
    const x1 = W - 24;
    const at = (t) => x0 + (x1 - x0) * t;
    let s = `<line x1="${x0}" y1="${H - 20}" x2="${x1}" y2="${H - 20}" class="e-idle"/>`;
    ticks.forEach((t) => {
        s += `<line x1="${at(t.at)}" y1="${H - 26}" x2="${at(t.at)}" y2="${H - 14}" class="e-idle"/>`;
        s += capHTML(at(t.at), H - 2, t.label);
    });
    lanes.forEach((lane, i) => {
        const y = 30 + i * 54;
        s += capHTML(x0 - 10, y + 20, lane.label, "end");
        s += `<line x1="${x0}" y1="${y + 15}" x2="${x1}" y2="${y + 15}" class="e-idle" stroke-dasharray="3 6"/>`;
        (lane.marks || []).forEach((m) => {
            const w = m.width ? (x1 - x0) * m.width : 0;
            if (w) s += `<rect x="${at(m.at)}" y="${y + 2}" width="${w}" height="26" rx="5" class="${m.state || "n-idle"}" stroke-width="2"/>`;
            else s += nodeHTML(at(m.at), y + 15, m.label || "", m.state || "n-idle", 12);
            if (w) s += `<text x="${at(m.at) + w / 2}" y="${y + 15}" class="n-label${m.state && m.state !== "n-idle" ? " n-label-dark" : ""}">${esc(m.label || "")}</text>`;
        });
    });
    if (now !== undefined) s += `<line x1="${at(now)}" y1="14" x2="${at(now)}" y2="${H - 14}" class="e-act"/>`;
    return svgHTML(W, H, s);
};

/* ==========================================================================
   Design pattern widgets
   ========================================================================== */

/* Most widgets are object diagrams: a fixed set of boxes and arrows whose
   states change frame by frame. A node is { x, y, w, h, label, iface?, sub? };
   an edge is { a, b, id?, label?, off?, dash? }. A frame's state object is
   { n: {id: state}, e: {edgeId: state}, sub: {id: text}, label: {id: text},
     elabel: {edgeId: text}, caps: [[x, y, text, anchor]] }.
   Node states: n-idle n-act n-cmp n-done n-out, plus "n-ghost" and "hide". */

const edgeId = (e) => e.id || `${e.a}>${e.b}`;

/* Where the line from box a towards box b leaves a's border. */
const borderPt = (a, b, pad = 0) => {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const dx = b.x + b.w / 2 - ax;
    const dy = b.y + b.h / 2 - ay;
    if (Math.abs(dx) * a.h >= Math.abs(dy) * a.w) {
        const sx = Math.sign(dx) || 1;
        return [ax + sx * (a.w / 2 + pad), ay + (dy * (a.w / 2 + pad)) / Math.abs(dx || 1)];
    }
    const sy = Math.sign(dy) || 1;
    return [ax + (dx * (a.h / 2 + pad)) / Math.abs(dy || 1), ay + sy * (a.h / 2 + pad)];
};

const linkHTML = (A, B, state = "e-idle", label = "", off = 0, dash = false) => {
    let [x1, y1] = borderPt(A, B, 2);
    let [x2, y2] = borderPt(B, A, 4);
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    let ny = 0;
    if (off) {
        const nx = (-(y2 - y1) / len) * off;
        ny = ((x2 - x1) / len) * off;
        x1 += nx;
        x2 += nx;
        y1 += ny;
        y2 += ny;
    }
    const a = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 9 * Math.cos(a);
    const hy = y2 - 9 * Math.sin(a);
    const wing = 5;
    const da = dash ? ' stroke-dasharray="6 5"' : "";
    let s =
        `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="${state}"${da}/>` +
        `<path d="M${(hx - wing * Math.sin(a)).toFixed(1)} ${(hy + wing * Math.cos(a)).toFixed(1)} ` +
        `L${x2.toFixed(1)} ${y2.toFixed(1)} L${(hx + wing * Math.sin(a)).toFixed(1)} ${(hy - wing * Math.cos(a)).toFixed(1)}" class="${state}"/>`;
    if (label) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const flat = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
        // A line pushed below its twin carries its label underneath, so paired labels never collide.
        const below = ny > 0 && flat;
        s += flat
            ? capHTML(mx, below ? my + 15 : my - 7, label)
            : capHTML(mx + 8, my + 4, label, "start");
    }
    return s;
};

const classHTML = (n, state = "n-idle", sub = "", label = n.label) => {
    const { x, y, w, h } = n;
    const ghost = state === "n-ghost";
    const cls = ghost ? "n-idle" : state;
    const dash = n.iface || ghost ? ' stroke-dasharray="6 4"' : "";
    const dark = !ghost && state !== "n-idle" ? " n-label-dark" : "";
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${cls}" stroke-width="2"${dash}/>`;
    if (n.iface) {
        s += `<text x="${x + w / 2}" y="${y + 13}" class="n-label${dark}" style="font-size:10px">\u00abinterface\u00bb</text>`;
        s += `<text x="${x + w / 2}" y="${y + h / 2 + 7}" class="n-label${dark}">${esc(label)}</text>`;
    } else if (ghost) {
        s += `<text x="${x + w / 2}" y="${y + h / 2 + 4}" class="n-sub">${esc(label)}</text>`;
    } else {
        s += `<text x="${x + w / 2}" y="${y + h / 2}" class="n-label${dark}">${esc(label)}</text>`;
    }
    if (sub) s += `<text x="${x + w / 2}" y="${y + h + 15}" class="n-sub">${esc(sub)}</text>`;
    return s;
};

const headlineHTML = (x, y, text, anchor = "middle") =>
    `<text x="${x}" y="${y}" class="vz-text" style="text-anchor:${anchor}">${esc(text)}</text>`;

const scene = (W, H, nodes, edges, st = {}) => {
    const ns = st.n || {};
    const es = st.e || {};
    const shown = (id) => (ns[id] ?? nodes[id].state ?? "n-idle") !== "hide";
    let s = "";
    edges.forEach((e) => {
        const key = edgeId(e);
        const state = es[key] ?? e.state ?? "e-idle";
        if (state === "hide" || !shown(e.a) || !shown(e.b)) return;
        const label = st.elabel?.[key] ?? e.label ?? "";
        s += linkHTML(nodes[e.a], nodes[e.b], state, label, e.off || 0, e.dash);
    });
    Object.entries(nodes).forEach(([id, n]) => {
        const state = ns[id] ?? n.state ?? "n-idle";
        if (state === "hide") return;
        s += classHTML(n, state, st.sub?.[id] ?? n.sub ?? "", st.label?.[id] ?? n.label);
    });
    (st.caps || []).forEach(([x, y, text, anchor]) => (s += headlineHTML(x, y, text, anchor)));
    return svgHTML(W, H, s);
};

/* HTML building blocks for widgets that are lists rather than diagrams. */
const chipHTML = (item) => {
    const it = typeof item === "string" ? { t: item } : item;
    return `<span class="chip${it.c ? ` ${it.c}` : ""}">${esc(it.t)}</span>`;
};
const rowHTML = (label, items) =>
    `<div class="vrow"><span class="vrow-label">${esc(label)}</span><div class="chips">${items.map(chipHTML).join("")}</div></div>`;
const stackHTML = (...parts) => `<div class="vstack">${parts.join("")}</div>`;

/* ---- 1. Coupling: how far one change spreads ---- */

VIZ["change-ripple"] = {
    title: "One business decision: how many files change?",
    legend: [["lg-out", "must be edited"], ["lg-act", "the one edit"], ["lg-done", "new or unchanged"], ["lg-idle", "untouched"]],
    options: [
        { value: "concrete", label: "Callers wired to the vendor" },
        { value: "interface", label: "Callers behind an interface" },
    ],
    build(option = "concrete") {
        const W = 860;
        const H = 380;
        const callers = ["OrderService", "RefundService", "InvoiceJob", "Renewals"];
        const nodes = {};
        callers.forEach((c, i) => (nodes[c] = { x: 30, y: 30 + i * 86, w: 190, h: 48, label: c }));
        const frames = [];

        if (option === "interface") {
            nodes.Gateway = { x: 335, y: 150, w: 200, h: 58, label: "PaymentGateway", iface: true };
            nodes.Stripe = { x: 640, y: 60, w: 190, h: 48, label: "StripeGateway" };
            nodes.Adyen = { x: 640, y: 250, w: 190, h: 48, label: "AdyenGateway" };
            nodes.Root = { x: 335, y: 290, w: 200, h: 48, label: "main()", sub: "composition root" };
            const edges = [
                ...callers.map((c) => ({ a: c, b: "Gateway" })),
                { a: "Stripe", b: "Gateway", id: "impl-s", dash: true, label: "implements" },
                { a: "Adyen", b: "Gateway", id: "impl-a", dash: true, label: "implements" },
            ];
            const base = { n: { Adyen: "hide" } };
            const push = (st, note) => frames.push({ stage: scene(W, H, nodes, edges, st), note });
            push({ ...base, caps: [[845, 22, "files touched: 0", "end"]] },
                "Four callers depend on <code>PaymentGateway</code>, an interface with one method, <code>charge()</code>. Only <code>StripeGateway</code> knows Stripe exists.");
            push({ n: { Adyen: "hide", Stripe: "n-out" }, sub: { Stripe: "being retired" }, caps: [[845, 22, "files touched: 0", "end"]] },
                "The business decision: move from Stripe to Adyen. Exactly one class in the codebase knows the word <em>Stripe</em>.");
            push({ n: { Stripe: "n-out", Adyen: "n-done" }, e: { "impl-a": "e-done" }, sub: { Stripe: "being retired", Adyen: "new file" }, caps: [[845, 22, "files touched: 1", "end"]] },
                "Write one new class, <code>AdyenGateway</code>, that implements <code>charge()</code> using Adyen's SDK.");
            push({ n: { Stripe: "n-out", Adyen: "n-done", Root: "n-act" }, e: { "impl-a": "e-done" }, sub: { Stripe: "being retired", Adyen: "new file", Root: "one line edited" }, caps: [[845, 22, "files touched: 2", "end"]] },
                "Edit one line in the composition root, so it builds <code>AdyenGateway</code> instead of <code>StripeGateway</code>.");
            const done = {};
            callers.forEach((c) => (done[c] = "n-done"));
            push({ n: { ...done, Stripe: "n-ghost", Adyen: "n-done", Root: "n-act" }, e: { "impl-a": "e-done", "impl-s": "hide" }, sub: { Adyen: "new file", Root: "one line edited", OrderService: "unchanged", Renewals: "unchanged" }, caps: [[845, 22, "files touched: 2", "end"]] },
                "The four callers never notice. They still call <code>gateway.charge()</code>, and their tests still pass with the same fake.");
            push({ n: { ...done, Stripe: "hide", Adyen: "n-done", Root: "n-act" }, e: { "impl-a": "e-done" }, caps: [[845, 22, "files touched: 2", "end"]] },
                "<b>Conclusion.</b> One new file and one edited line. The interface acted as a <b>firewall for change</b>: the vendor decision stopped at the boundary instead of spreading through every caller.");
            return frames;
        }

        nodes.Stripe = { x: 600, y: 150, w: 230, h: 56, label: "StripeClient", sub: "vendor SDK" };
        const edges = callers.map((c) => ({ a: c, b: "Stripe" }));
        const why = [
            "builds the client in its constructor and calls <code>charges.create()</code>",
            "parses Stripe's refund IDs, which look nothing like Adyen's",
            "catches <code>stripe.CardError</code> by name",
            "has its own copy of the retry logic around Stripe calls",
        ];
        const ns = {};
        const es = {};
        const subs = { Stripe: "vendor SDK" };
        frames.push({
            stage: scene(W, H, nodes, edges, { caps: [[845, 22, "files touched: 0", "end"]] }),
            note: "Four classes each create a <code>StripeClient</code> and call it directly, using Stripe's method names, IDs and error types.",
        });
        ns.Stripe = "n-out";
        subs.Stripe = "now Adyen: new API";
        frames.push({
            stage: scene(W, H, nodes, edges, { n: { ...ns }, sub: { ...subs }, label: { Stripe: "AdyenClient" }, caps: [[845, 22, "files touched: 0", "end"]] }),
            note: "The business decision: move to Adyen. Its SDK has different method names, different arguments and different errors.",
        });
        callers.forEach((c, i) => {
            ns[c] = "n-out";
            es[`${c}>Stripe`] = "e-act";
            subs[c] = "must be edited";
            frames.push({
                stage: scene(W, H, nodes, edges, { n: { ...ns }, e: { ...es }, sub: { ...subs }, label: { Stripe: "AdyenClient" }, caps: [[845, 22, `files touched: ${i + 1}`, "end"]] }),
                note: `<code>${c}</code> has to change: it ${why[i]}.`,
            });
            es[`${c}>Stripe`] = "e-idle";
        });
        frames.push({
            stage: scene(W, H, nodes, edges, { n: { ...ns }, sub: { ...subs }, label: { Stripe: "AdyenClient" }, caps: [[845, 22, "files touched: 4 + their tests", "end"]] }),
            note: "<b>Conclusion.</b> One decision forced edits to four classes and all their tests, and each edit is a chance for a bug. The vendor's details had <b>leaked into every caller</b>. That spread is what coupling means, and what patterns exist to stop.",
        });
        return frames;
    },
};

/* ---- 2. Composition over inheritance ---- */

VIZ["class-explosion"] = {
    title: "Two axes of change: multiply or add?",
    legend: [["lg-act", "just added"], ["lg-cmp", "touched by one fix"], ["lg-done", "chosen"], ["lg-idle", "existing"]],
    options: [
        { value: "inheritance", label: "A subclass per combination" },
        { value: "composition", label: "One collaborator per axis" },
    ],
    build(option = "inheritance") {
        const frames = [];
        const count = (n, c) => rowHTML("classes", [{ t: String(n), c }]);

        if (option === "composition") {
            const pane = (title, items, act = [], cmp = [], done = []) => ({
                title,
                items: items.map((t) => ({ text: t, cls: act.includes(t) ? "is-act" : cmp.includes(t) ? "is-cmp" : done.includes(t) ? "is-done" : "" })),
                empty: "none yet",
            });
            const F = ["PdfFormatter", "CsvFormatter"];
            const D = [];
            const push = (n, panes, note, report = "Report(formatter, delivery)") =>
                frames.push({ stage: stackHTML(count(n, n > 5 ? "is-cmp" : "is-done"), panesHTML([...panes, { title: "Report holds one of each", items: [{ text: report }] }])), note });
            push(2, [pane("Formatters", F, F), pane("Deliveries", D)],
                "Same requirements, different shape. Format is one small interface, <code>Formatter</code>, with one class per format.");
            D.push("EmailDelivery", "S3Delivery");
            push(4, [pane("Formatters", F), pane("Deliveries", D, D)],
                "Delivery becomes a second interface. Two new classes, and no formatter is touched.");
            F.push("ExcelFormatter");
            push(5, [pane("Formatters", F, ["ExcelFormatter"]), pane("Deliveries", D)],
                "Excel arrives: <b>one</b> new class. The inheritance version needed three here.");
            D.push("SlackDelivery");
            push(6, [pane("Formatters", F), pane("Deliveries", D, ["SlackDelivery"])],
                "Slack arrives: <b>one</b> new class, where inheritance needed three. 3 + 3 = 6, versus 3 &times; 3 = 9.");
            push(6, [pane("Formatters", F, [], [], ["ExcelFormatter"]), pane("Deliveries", D, [], [], ["SlackDelivery"])],
                "The combination is picked when the object is built, for example from a user's settings: <code>Report(ExcelFormatter(), SlackDelivery(channel))</code>.",
                "Report(Excel, Slack)");
            push(6, [pane("Formatters", F), pane("Deliveries", D, [], ["S3Delivery"])],
                "A bug in the S3 upload? It lives in <code>S3Delivery</code>, once. Fix it there and every report that uploads to S3 is fixed.");
            push(6, [pane("Formatters", F), pane("Deliveries", D)],
                "<b>Conclusion.</b> Composition turns <b>M &times; N</b> into <b>M + N</b>, and lets you choose the combination at runtime. Each axis can grow without touching the other.");
            return frames;
        }

        const grid = (formats, deliveries, fresh = [], cmpCol = -1) => {
            const rows = [["", ...(deliveries.length ? deliveries : ["\u2014"])]];
            formats.forEach((f) => rows.push([f, ...(deliveries.length ? deliveries.map((d) => `${f}${d}Report`) : [`${f}Report`])]));
            const marks = {};
            rows[0].forEach((_, c) => (marks[`0,${c}`] = "is-head"));
            rows.forEach((_, r) => (marks[`${r},0`] = "is-head"));
            fresh.forEach((k) => (marks[k] = "is-act"));
            if (cmpCol > 0) rows.forEach((_, r) => r > 0 && (marks[`${r},${cmpCol}`] = "is-cmp"));
            return dataGridHTML(rows, marks);
        };
        frames.push({
            stage: stackHTML(count(2, "is-done"), grid(["Pdf", "Csv"], [])),
            note: "One axis of variation, format, and two subclasses of <code>Report</code>. Inheritance is perfectly fine here."
        });
        frames.push({
            stage: stackHTML(count(4, "is-cmp"), grid(["Pdf", "Csv"], ["Email", "S3"], ["1,1", "1,2", "2,1", "2,2"])),
            note: "Product adds a <b>second, independent axis</b>: delivery by email or S3. A subclass hierarchy needs one class per <em>combination</em>."
        });
        frames.push({
            stage: stackHTML(count(6, "is-out"), grid(["Pdf", "Csv", "Excel"], ["Email", "S3"], ["3,1", "3,2"])),
            note: "Excel arrives. That's not one new class, it's one per delivery method: <b>two</b>."
        });
        frames.push({
            stage: stackHTML(count(9, "is-out"), grid(["Pdf", "Csv", "Excel"], ["Email", "S3", "Slack"], ["1,3", "2,3", "3,3"])),
            note: "Slack arrives: one per format, so <b>three</b> more. Nine classes, and the next value on either axis adds three more."
        });
        frames.push({
            stage: stackHTML(count(9, "is-out"), grid(["Pdf", "Csv", "Excel"], ["Email", "S3", "Slack"], [], 2)),
            note: "A bug in the S3 upload code. It's copied into three classes, or hidden in a shared parent that the PDF and CSV classes also inherit from. Either way, the fix touches every row."
        });
        frames.push({
            stage: stackHTML(count(9, "is-out"), grid(["Pdf", "Csv", "Excel"], ["Email", "S3", "Slack"])),
            note: "<b>Conclusion.</b> Inheritance <b>multiplies</b> independent axes: M formats &times; N deliveries = M &times; N classes, and the combination is fixed when the object is created. Switch to the other variant to see composition add them instead."
        });
        return frames;
    },
};

/* ---- 9. Strategy ---- */

VIZ["strategy-swap"] = {
    title: "Same Checkout, three interchangeable shipping rules",
    legend: [["lg-act", "running"], ["lg-done", "result"], ["lg-cmp", "held strategy"], ["lg-idle", "available"]],
    build() {
        const W = 860;
        const H = 380;
        const nodes = {
            Cart: { x: 20, y: 150, w: 170, h: 56, label: "Cart" },
            Checkout: { x: 255, y: 150, w: 170, h: 56, label: "Checkout" },
            Flat: { x: 560, y: 40, w: 270, h: 50, label: "FlatRate(\u00a34.95)" },
            Weight: { x: 560, y: 155, w: 270, h: 50, label: "ByWeight(\u00a31.20/kg)" },
            Free: { x: 560, y: 270, w: 270, h: 50, label: "FreeOver(\u00a350, otherwise)" },
        };
        const edges = [
            { a: "Cart", b: "Checkout", id: "call", label: "total(cart)" },
            { a: "Checkout", b: "Flat", id: "hold-flat" },
            { a: "Checkout", b: "Weight", id: "hold-weight" },
            { a: "Checkout", b: "Free", id: "hold-free" },
            { a: "Free", b: "Weight", id: "inner", dash: true, label: "otherwise" },
        ];
        const hidden = { "hold-flat": "hide", "hold-weight": "hide", "hold-free": "hide", inner: "hide", call: "hide" };
        const frames = [];
        const push = (e, n, sub, caps, note) =>
            frames.push({ stage: scene(W, H, nodes, edges, { e: { ...hidden, ...e }, n, sub, caps }), note });
        const small = { Cart: "\u00a342.00 \u00b7 4 kg" };
        const big = { Cart: "\u00a360.00 \u00b7 4 kg" };

        push({ "hold-flat": "e-done" }, { Flat: "n-cmp" }, small, [],
            "<code>Checkout</code> holds a <code>ShippingRule</code>. It was given <code>FlatRate</code> in its constructor and knows nothing else about it.");
        push({ "hold-flat": "e-done", call: "e-act" }, { Flat: "n-cmp", Cart: "n-act", Checkout: "n-act" }, small, [],
            "A cart arrives: <code>total(cart)</code>. Checkout's only job is <code>subtotal + shipping.cost(cart)</code>.");
        push({ "hold-flat": "e-act" }, { Flat: "n-act", Checkout: "n-act" }, small, [],
            "It calls <code>cost(cart)</code> on whatever rule it holds. <code>FlatRate</code> ignores the cart and returns <code>\u00a34.95</code>.");
        push({ "hold-flat": "e-done" }, { Flat: "n-cmp", Checkout: "n-done" }, small, [[W / 2, 360, "total = \u00a342.00 + \u00a34.95 = \u00a346.95"]],
            "Total: <code>\u00a346.95</code>.");
        push({ "hold-weight": "e-done" }, { Weight: "n-cmp" }, small, [],
            "Marketing switches to weight-based pricing. <b>Swap the strategy</b>: <code>Checkout(ByWeight(...))</code>. Not one character of <code>Checkout</code> changed.");
        push({ "hold-weight": "e-act", call: "e-act" }, { Weight: "n-act", Checkout: "n-act", Cart: "n-act" }, small, [],
            "Same call, different object: <code>max(\u00a33.00, 4 kg &times; \u00a31.20)</code> = <code>\u00a34.80</code>.");
        push({ "hold-weight": "e-done" }, { Weight: "n-cmp", Checkout: "n-done" }, small, [[W / 2, 360, "total = \u00a342.00 + \u00a34.80 = \u00a346.80"]],
            "Total: <code>\u00a346.80</code>.");
        push({ "hold-free": "e-done", inner: "e-idle" }, { Free: "n-cmp" }, small, [],
            "Summer promotion: free shipping over \u00a350. <code>FreeOver</code> <b>wraps another strategy</b>, <code>ByWeight</code>, for when the threshold isn't met.");
        push({ "hold-free": "e-act", call: "e-act", inner: "e-idle" }, { Free: "n-act", Checkout: "n-act", Cart: "n-act" }, small, [],
            "The cart is \u00a342, under the threshold, so <code>FreeOver</code> can't make it free...");
        push({ "hold-free": "e-done", inner: "e-act" }, { Free: "n-cmp", Weight: "n-act" }, small, [[W / 2, 360, "total = \u00a342.00 + \u00a34.80 = \u00a346.80"]],
            "...and delegates to its <code>otherwise</code> rule. One strategy composed from another, and no copy-pasted <code>if</code> logic.");
        push({ "hold-free": "e-act", call: "e-act", inner: "e-idle" }, { Free: "n-done", Checkout: "n-done", Cart: "n-act" }, big, [[W / 2, 360, "total = \u00a360.00 + \u00a30.00 = \u00a360.00"]],
            "A \u00a360 cart clears the threshold: <code>cost()</code> returns <code>0</code> without consulting the inner rule.");
        push({ "hold-free": "e-done", inner: "e-idle" }, { Free: "n-cmp" }, big, [],
            "<b>Conclusion.</b> The context asked the same question every time and got different answers because it held different objects. New rules are <b>new classes, not new branches</b>, and the caller never needs an <code>if</code>.");
        return frames;
    },
};

/* ---- 6. Factory with a registry ---- */

VIZ["factory-registry"] = {
    title: "A registry factory: names in, objects out",
    legend: [["lg-act", "running"], ["lg-cmp", "looked up"], ["lg-done", "created / registered"], ["lg-out", "error"]],
    build() {
        const W = 860;
        const H = 380;
        const nodes = {
            Handle: { x: 20, y: 150, w: 180, h: 54, label: "handle(job)" },
            Factory: { x: 290, y: 150, w: 190, h: 54, label: "make_sender()" },
            email: { x: 580, y: 46, w: 260, h: 40, label: "\"email\" \u2192 EmailSender" },
            push: { x: 580, y: 96, w: 260, h: 40, label: "\"push\" \u2192 PushSender" },
            sms: { x: 580, y: 146, w: 260, h: 40, label: "\"sms\" \u2192 SmsSender" },
            slack: { x: 580, y: 196, w: 260, h: 40, label: "\"slack\" \u2192 SlackSender" },
            Product: { x: 290, y: 290, w: 190, h: 50, label: "SmsSender(settings)" },
        };
        const edges = [
            { a: "Handle", b: "Factory", id: "ask", label: "make_sender(\"sms\")" },
            { a: "Factory", b: "sms", id: "look" },
            { a: "Factory", b: "Product", id: "make", label: "construct" },
            { a: "Handle", b: "Product", id: "use", label: ".send()" },
        ];
        const all = { ask: "hide", look: "hide", make: "hide", use: "hide" };
        const reg = (...on) => {
            const n = {};
            ["email", "push", "sms", "slack"].forEach((k) => (n[k] = on.includes(k) ? "n-idle" : "hide"));
            return n;
        };
        const job = (t) => [[110, 132, t]];
        const frames = [];
        const push = (n, e, caps, note, extra = {}) =>
            frames.push({ stage: scene(W, H, nodes, edges, { n: { Product: "hide", ...n }, e: { ...all, ...e }, caps: [[710, 28, "registry"], ...caps], ...extra }), note });

        push(reg(), {}, [], "When the program starts, the registry is an empty dictionary. The factory names no concrete classes at all.");
        push({ ...reg("email"), email: "n-done" }, {}, [], "Importing <code>email.py</code> runs <code>@register(\"email\")</code>: <code>EmailSender</code> adds itself, next to its own definition.");
        push({ ...reg("email", "push"), push: "n-done" }, {}, [], "<code>push.py</code> registers <code>PushSender</code>.");
        push({ ...reg("email", "push", "sms"), sms: "n-done" }, {}, [], "<code>sms.py</code> registers <code>SmsSender</code>. Three entries, and no file lists them all in an <code>if</code> chain.");
        push({ ...reg("email", "push", "sms"), Handle: "n-act" }, {}, job("{\"channel\": \"sms\"}"), "A job arrives from the queue with <code>channel: \"sms\"</code>.");
        push({ ...reg("email", "push", "sms"), Handle: "n-act", Factory: "n-act" }, { ask: "e-act" }, job("{\"channel\": \"sms\"}"), "The consumer asks the factory for <em>a sender</em>, by name.");
        push({ ...reg("email", "push", "sms"), Factory: "n-act", sms: "n-cmp" }, { ask: "e-done", look: "e-act" }, job("{\"channel\": \"sms\"}"), "The factory does a dictionary lookup, not an <code>if/elif</code>. The cost is the same whether there are three channels or thirty.");
        push({ ...reg("email", "push", "sms"), Factory: "n-act", sms: "n-cmp", Product: "n-done" }, { ask: "e-done", look: "e-done", make: "e-act" }, job("{\"channel\": \"sms\"}"),
            "It calls the registered constructor with the settings. Reading secrets and choosing timeouts happens here, not in business code.");
        push({ ...reg("email", "push", "sms"), Handle: "n-act", Product: "n-done" }, { use: "e-act" }, job("{\"channel\": \"sms\"}"),
            "The consumer calls <code>.send()</code> on whatever came back. It never wrote the word <code>SmsSender</code>.");
        push({ ...reg("email", "push", "sms", "slack"), slack: "n-done" }, {}, [], "Product wants Slack. Add <b>one new file</b>, <code>slack.py</code>, whose decorator registers it. No existing file was edited.");
        push({ ...reg("email", "push", "sms", "slack"), Handle: "n-act", Factory: "n-out" }, { ask: "e-act" }, job("{\"channel\": \"slak\"}"),
            "A typo in config: <code>\"slak\"</code>. The factory fails loudly: <code>unknown channel 'slak'; known: email, push, slack, sms</code>. Run this check at startup, not on the first message.",
            { elabel: { ask: "make_sender(\"slak\")" } });
        push(reg("email", "push", "sms", "slack"), {}, [],
            "<b>Conclusion.</b> Exactly <b>one place maps names to classes</b>, and it grows by registration rather than by editing. Callers depend on <code>Sender</code>, and creation stays out of business logic.");
        return frames;
    },
};

/* ---- 4. Builder ---- */

VIZ["builder-steps"] = {
    title: "Assembling a request step by step, validating once",
    legend: [["lg-act", "this step"], ["lg-done", "valid / built"], ["lg-out", "rejected"], ["lg-cmp", "checking"]],
    build() {
        const good = [
            "request = (",
            "    RequestBuilder()",
            "    .method(\"post\")",
            "    .url(\"https://api.example.com/orders\")",
            "    .header(\"Authorization\", \"Bearer <token>\")",
            "    .json({\"sku\": \"A-17\", \"qty\": 2})",
            "    .timeout(5)",
            "    .build()",
            ")",
        ];
        const fields = { method: "GET", url: "\u2014", headers: "{}", body: "\u2014", timeout: "10s" };
        const order = ["method", "url", "headers", "body", "timeout"];
        const builderPane = (act = []) => ({
            title: "RequestBuilder (mutable)",
            items: order.map((k) => ({ text: `${k}: ${fields[k]}`, cls: act.includes(k) ? "is-act" : "" })),
        });
        const frames = [];
        const push = (code, marks, panes, note) => frames.push({ stage: stackHTML(codeHTML(code, marks), panesHTML(panes)), note });
        const empty = { title: "Request (frozen)", items: [], empty: "not built yet" };

        push(good, {}, [builderPane(), empty], "A builder starts with sensible defaults. Nothing is validated yet, because the object isn't finished.");
        const steps = [
            [2, ["method"], () => (fields.method = "POST"), "<code>.method(\"post\")</code> normalises to <code>POST</code> and returns the builder, so the next call can chain."],
            [3, ["url"], () => (fields.url = "https://api\u2026/orders"), "<code>.url(...)</code>. Each step does one small, readable thing."],
            [4, ["headers"], () => (fields.headers = "{authorization}"), "<code>.header(...)</code> stores names in lower case, so lookups later are case-insensitive."],
            [5, ["body", "headers"], () => { fields.body = "{\"sku\": \"A-17\", \u2026}"; fields.headers = "{authorization, content-type}"; }, "<code>.json(...)</code> sets the body <em>and</em> the content type: one step, two fields kept consistent."],
            [6, ["timeout"], () => (fields.timeout = "5s"), "<code>.timeout(5)</code>. The builder is still mutable and still unchecked."],
        ];
        steps.forEach(([line, act, apply, note]) => {
            apply();
            const marks = {};
            for (let i = 1; i < line; i++) marks[i] = "is-done";
            marks[line] = "is-act";
            push(good, marks, [builderPane(act), empty], note);
        });
        const checks = (states) => ({
            title: "build() checks",
            items: ["url is present", "POST may carry a body", "timeout > 0"].map((t, i) => ({ text: t, cls: states[i] })),
        });
        const allDone = { 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-done", 5: "is-done", 6: "is-done", 7: "is-act" };
        push(good, allDone, [builderPane(), checks(["is-cmp", "is-cmp", "is-cmp"])],
            "<code>build()</code> is the only place that sees <b>every field at once</b>, so rules that span fields live here.");
        push(good, { ...allDone, 7: "is-done" }, [checks(["is-done", "is-done", "is-done"]), {
            title: "Request (frozen)",
            items: [`POST ${fields.url}`, "2 headers (read-only)", "body: 32 bytes", "timeout: 5s"].map((t) => ({ text: t, cls: "is-done" })),
        }], "All rules pass, and <code>build()</code> returns a <b>separate, frozen</b> <code>Request</code>. Changing the builder later can't change it.");

        const bad = [
            "request = (",
            "    RequestBuilder()",
            "    .url(\"https://api.example.com/orders\")",
            "    .json({\"sku\": \"A-17\", \"qty\": 2})",
            "    .method(\"get\")",
            "    .build()",
            ")",
        ];
        fields.method = "GET";
        fields.timeout = "10s";
        fields.headers = "{content-type}";
        push(bad, { 2: "is-done", 3: "is-done", 4: "is-act" }, [builderPane(["method"]), empty],
            "Another caller sets the body <em>first</em> and the method <em>last</em>. Neither <code>.json()</code> nor <code>.method()</code> can object, because each sees only its own field.");
        push(bad, { 2: "is-done", 3: "is-done", 4: "is-done", 5: "is-out" }, [checks(["is-done", "is-out", "is-done"]), { title: "Request (frozen)", items: [], empty: "nothing built" }],
            "<code>build()</code> catches it: <code>GET requests cannot have a body</code>. No half-valid request ever escapes.");
        push(good, {}, [builderPane(), empty],
            "<b>Conclusion.</b> Steps make construction <b>readable</b>; <code>build()</code> makes it <b>safe</b>, because it validates the whole object exactly once and returns something immutable.");
        return frames;
    },
};

/* ---- 3. Singleton versus dependency injection ---- */

VIZ["singleton-vs-di"] = {
    title: "One shared instance: looked up, or passed in?",
    legend: [["lg-act", "running"], ["lg-cmp", "state changed"], ["lg-done", "passes / created"], ["lg-out", "fails"]],
    options: [
        { value: "singleton", label: "Global singleton" },
        { value: "injected", label: "Injected from a composition root" },
    ],
    build(option = "singleton") {
        const W = 860;
        const H = 360;
        const frames = [];

        if (option === "injected") {
            const nodes = {
                Root: { x: 20, y: 150, w: 180, h: 54, label: "main()", sub: "composition root" },
                Db: { x: 300, y: 150, w: 200, h: 54, label: "Database" },
                Rep: { x: 610, y: 60, w: 230, h: 50, label: "ReportService(db)" },
                Inv: { x: 610, y: 240, w: 230, h: 50, label: "InvoiceService(db)" },
                TestA: { x: 20, y: 50, w: 180, h: 50, label: "test_a" },
                FakeA: { x: 300, y: 50, w: 200, h: 50, label: "FakeDb" },
                RepA: { x: 610, y: 50, w: 230, h: 50, label: "ReportService(fake)" },
                TestB: { x: 20, y: 240, w: 180, h: 50, label: "test_b" },
                FakeB: { x: 300, y: 240, w: 200, h: 50, label: "FakeDb" },
                RepB: { x: 610, y: 240, w: 230, h: 50, label: "ReportService(fake)" },
            };
            const edges = [
                { a: "Root", b: "Db", label: "creates once" },
                { a: "Db", b: "Rep", label: "passed in" },
                { a: "Db", b: "Inv", label: "passed in" },
                { a: "TestA", b: "FakeA", label: "builds" },
                { a: "FakeA", b: "RepA", label: "passed in" },
                { a: "TestB", b: "FakeB", label: "builds" },
                { a: "FakeB", b: "RepB", label: "passed in" },
            ];
            const prod = { TestA: "hide", FakeA: "hide", RepA: "hide", TestB: "hide", FakeB: "hide", RepB: "hide" };
            const test = { Root: "hide", Db: "hide", Rep: "hide", Inv: "hide" };
            const push = (n, e, note, sub = {}) => frames.push({ stage: scene(W, H, nodes, edges, { n, e, sub }), note });
            push({ ...prod, Root: "n-act", Db: "hide", Rep: "hide", Inv: "hide" }, {},
                "<code>main()</code> is the <b>composition root</b>: the one place that decides which concrete objects exist.");
            push({ ...prod, Root: "n-act", Db: "n-done", Rep: "hide", Inv: "hide" }, { "Root>Db": "e-act" },
                "It creates the <code>Database</code> exactly once. The useful part of Singleton, <em>one instance</em>, survives.");
            push({ ...prod, Db: "n-done", Rep: "n-act", Inv: "hide" }, { "Db>Rep": "e-act" },
                "It passes the database into <code>ReportService</code>'s constructor. Nothing calls <code>get_instance()</code>.");
            push({ ...prod, Db: "n-done", Rep: "n-done", Inv: "n-act" }, { "Db>Inv": "e-act" },
                "And into <code>InvoiceService</code>. Every dependency now appears in a signature, so you can see it in a code review.");
            push({ ...test, TestA: "n-act", FakeA: "n-done", RepA: "n-act", TestB: "hide", FakeB: "hide", RepB: "hide" }, { "TestA>FakeA": "e-act", "FakeA>RepA": "e-act" },
                "Tests have no <code>main()</code>. <code>test_a</code> builds its own <code>FakeDb</code> and passes it in.");
            push({ ...test, TestA: "n-done", FakeA: "n-cmp", RepA: "n-done", TestB: "hide", FakeB: "hide", RepB: "hide" }, {},
                "It can set <code>read_only=True</code> freely, because the fake belongs to this test alone.", { FakeA: "read_only=True", TestA: "passes" });
            push({ ...test, TestA: "n-done", FakeA: "n-cmp", RepA: "n-done", TestB: "n-done", FakeB: "n-done", RepB: "n-done" }, { "TestB>FakeB": "e-act", "FakeB>RepB": "e-act" },
                "<code>test_b</code> builds a fresh fake. Nothing is shared, so the order doesn't matter and the tests can run in parallel.", { FakeA: "read_only=True", TestA: "passes", TestB: "passes", FakeB: "read_only=False" });
            push({ ...prod, Root: "n-act", Db: "n-done", Rep: "n-done", Inv: "n-done" }, {},
                "<b>Conclusion.</b> Dependency injection keeps <b>one instance</b> and drops <b>global access</b>. Collaborators are created in one place and passed down, so tests just pass different ones.");
            return frames;
        }

        const nodes = {
            TestA: { x: 20, y: 50, w: 170, h: 50, label: "test_a" },
            SvcA: { x: 280, y: 50, w: 210, h: 50, label: "ReportService()" },
            TestB: { x: 20, y: 250, w: 170, h: 50, label: "test_b" },
            SvcB: { x: 280, y: 250, w: 210, h: 50, label: "ReportService()" },
            Db: { x: 600, y: 145, w: 240, h: 60, label: "Database._instance" },
        };
        const edges = [
            { a: "TestA", b: "SvcA", label: "builds" },
            { a: "SvcA", b: "Db", label: "get_instance()" },
            { a: "TestB", b: "SvcB", label: "builds" },
            { a: "SvcB", b: "Db", label: "get_instance()" },
        ];
        const push = (n, e, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, e, sub }), note });
        push({}, {}, { Db: "read_only=False" },
            "<code>Database.get_instance()</code> hands the <b>same object</b> to every caller: in production, and in every test in the run.");
        push({ TestA: "n-act", SvcA: "n-act" }, { "TestA>SvcA": "e-act", "SvcA>Db": "e-act" }, { Db: "read_only=False" },
            "<code>test_a</code> builds a <code>ReportService</code>, and inside it the service calls <code>get_instance()</code>. That dependency doesn't appear in the constructor's signature.");
        push({ TestA: "n-act", Db: "n-cmp" }, { "SvcA>Db": "e-act" }, { Db: "read_only=True" },
            "To test the read-only path, <code>test_a</code> sets a flag on the shared instance...");
        push({ TestA: "n-done", Db: "n-cmp" }, {}, { Db: "read_only=True", TestA: "passes" },
            "...and passes. It never resets the flag, because nothing told it the object was shared.");
        push({ TestA: "n-done", TestB: "n-act", SvcB: "n-act", Db: "n-cmp" }, { "TestB>SvcB": "e-act", "SvcB>Db": "e-act" }, { Db: "read_only=True", TestA: "passes" },
            "<code>test_b</code> runs next. Its service grabs <b>the same instance</b>, with the flag still set.");
        push({ TestA: "n-done", TestB: "n-out", Db: "n-out" }, { "SvcB>Db": "e-act" }, { Db: "read_only=True", TestA: "passes", TestB: "fails" },
            "<code>test_b</code> tries to write and gets <code>database is read-only</code>. Run it alone and it passes. Change the test order and the failure moves.");
        push({ TestA: "n-done", TestB: "n-out", Db: "n-out" }, {}, { Db: "shared by everyone", TestA: "passes", TestB: "fails" },
            "<b>Conclusion.</b> The problem isn't <em>one instance</em>. It's <b>global access</b>. Hidden dependencies plus shared mutable state give you tests that depend on run order and code you can't reason about locally.");
        return frames;
    },
};

/* ---- 7. Adapter and Facade ---- */

VIZ["adapter-facade"] = {
    title: "Wrappers that change the interface",
    legend: [["lg-act", "call in flight"], ["lg-done", "returned"], ["lg-cmp", "our type"], ["lg-out", "vendor error / change"]],
    options: [
        { value: "adapter", label: "Adapter: fit a vendor SDK to our interface" },
        { value: "facade", label: "Facade: one call over a subsystem" },
    ],
    build(option = "adapter") {
        const W = 860;
        const frames = [];

        if (option === "facade") {
            const H = 330;
            const subs = [
                ["Inv", "Inventory.reserve()", "hold 2 \u00d7 A-17"],
                ["Price", "Pricing.quote()", "\u00a384.00 incl. VAT"],
                ["Pay", "Payments.charge()", "card authorised"],
                ["Ship", "Shipping.book()", "courier slot booked"],
                ["Mail", "Email.send_receipt()", "receipt queued"],
            ];
            const nodes = {
                Ctrl: { x: 20, y: 140, w: 190, h: 50, label: "CheckoutController" },
                Facade: { x: 280, y: 140, w: 190, h: 50, label: "CheckoutFacade" },
            };
            subs.forEach(([id, label], i) => (nodes[id] = { x: 570, y: 14 + i * 62, w: 270, h: 40, label }));
            const edges = [
                { a: "Ctrl", b: "Facade", id: "in", label: "place_order(cart)", off: -10 },
                { a: "Facade", b: "Ctrl", id: "out", label: "Order #A-17", off: -10 },
                ...subs.map(([id]) => ({ a: "Ctrl", b: id, id: `d-${id}` })),
                ...subs.map(([id]) => ({ a: "Facade", b: id, id: `f-${id}` })),
            ];
            const base = { in: "hide", out: "hide" };
            subs.forEach(([id]) => {
                base[`d-${id}`] = "hide";
                base[`f-${id}`] = "hide";
            });
            const push = (n, e, note, sub = {}) => frames.push({ stage: scene(W, H, nodes, edges, { n, e: { ...base, ...e }, sub }), note });
            const direct = {};
            subs.forEach(([id]) => (direct[`d-${id}`] = "e-act"));
            push({ Facade: "hide", Ctrl: "n-act" }, direct,
                "Without a facade, every caller (the web controller, the mobile API, the admin tool) makes all five calls itself, in the right order, with the right rollback.");
            push({ Ctrl: "n-act", Facade: "n-act" }, { in: "e-act" },
                "With a facade, the controller makes <b>one call</b>: <code>place_order(cart)</code>. The order of the steps is now written down in exactly one place.");
            const lit = {};
            subs.forEach(([id, , what], i) => {
                const n = { Facade: "n-act", [id]: "n-act" };
                subs.slice(0, i).forEach(([d]) => (n[d] = "n-done"));
                const e = { in: "e-done", [`f-${id}`]: "e-act" };
                subs.slice(0, i).forEach(([d]) => (e[`f-${d}`] = "e-done"));
                lit[id] = what;
                const notes = [
                    "The facade reserves stock first, so nothing is charged for an item that's out of stock.",
                    "It prices the cart, including tax and discounts.",
                    "It charges the card. If this fails, the facade releases the reservation from step 1, so callers never have to remember to.",
                    "It books the courier.",
                    "It queues the receipt email.",
                ];
                push(n, e, `<b>Step ${i + 1}.</b> ${notes[i]}`, { ...lit });
            });
            const doneN = { Ctrl: "n-done", Facade: "n-done" };
            const doneE = { out: "e-done" };
            subs.forEach(([id]) => {
                doneN[id] = "n-done";
                doneE[`f-${id}`] = "e-done";
            });
            push(doneN, doneE, "The controller gets an <code>Order</code> back. It made one call; the facade made five.", { ...lit });
            push({}, {}, "<b>Conclusion.</b> A facade <b>invents a simpler interface</b> over a subsystem and owns the order of its steps. The subsystems stay public for code that needs fine control. The facade only coordinates; the business rules stay inside the subsystems.");
            return frames;
        }

        const H = 340;
        const nodes = {
            Storage: { x: 230, y: 30, w: 200, h: 58, label: "Storage", iface: true },
            Domain: { x: 20, y: 200, w: 170, h: 50, label: "UploadAvatar" },
            Adapter: { x: 300, y: 200, w: 230, h: 50, label: "BlobStorageAdapter" },
            Sdk: { x: 640, y: 200, w: 200, h: 50, label: "BlobClient", sub: "vendor SDK" },
        };
        const edges = [
            { a: "Domain", b: "Storage", id: "uses", dash: true, label: "depends on" },
            { a: "Adapter", b: "Storage", id: "impl", dash: true, label: "implements" },
            { a: "Domain", b: "Adapter", id: "call", off: -10 },
            { a: "Adapter", b: "Domain", id: "ret", off: -10 },
            { a: "Adapter", b: "Sdk", id: "vcall", off: -10 },
            { a: "Sdk", b: "Adapter", id: "vret", off: -10 },
        ];
        const quiet = { call: "hide", ret: "hide", vcall: "hide", vret: "hide" };
        const push = (n, e, el, note, sub = {}) =>
            frames.push({ stage: scene(W, H, nodes, edges, { n, e: { ...quiet, ...e }, elabel: el, sub: { Sdk: "vendor SDK", ...sub } }), note });

        push({}, {}, {}, "Domain code depends on <code>Storage</code>, an interface <em>we</em> own. <code>BlobStorageAdapter</code> implements it using the vendor's SDK.");
        push({ Domain: "n-act", Adapter: "n-act" }, { call: "e-act" }, { call: "put(\"avatars/42.png\", data)" },
            "The domain calls <code>put(key, data)</code>. It has no idea a vendor is involved.");
        push({ Adapter: "n-act", Sdk: "n-act" }, { call: "e-done", vcall: "e-act" }, { call: "put(\"avatars/42.png\", data)", vcall: "upload_blob(\"media\", \u2026)" },
            "The adapter <b>translates arguments</b>: the key becomes a container and a blob name, the bytes become a stream, and it adds <code>overwrite=True</code>.");
        push({ Sdk: "n-done", Adapter: "n-done", Domain: "n-done" }, { call: "e-done", vcall: "e-done", vret: "e-done", ret: "e-done" }, { call: "put(\u2026)", vcall: "upload_blob(\u2026)", vret: "ok", ret: "None" },
            "Success comes back the way <code>Storage.put</code> promises: nothing returned, nothing vendor-specific.");
        push({ Domain: "n-act", Adapter: "n-act" }, { call: "e-act" }, { call: "get(\"avatars/99.png\")" },
            "Now <code>get()</code> for a key that doesn't exist.");
        push({ Adapter: "n-act", Sdk: "n-out" }, { call: "e-done", vcall: "e-act" }, { call: "get(\u2026)", vcall: "download_blob(\"media\", \u2026)" },
            "The SDK raises <code>BlobNotFound</code>, its own exception type.", { Sdk: "raises BlobNotFound" });
        push({ Adapter: "n-act", Sdk: "n-out" }, { call: "e-done", vcall: "e-done", vret: "e-act" }, { call: "get(\u2026)", vcall: "download_blob(\u2026)", vret: "BlobNotFound" },
            "If the adapter let that through, every caller would have to import the vendor's package to handle a missing key.", { Sdk: "raises BlobNotFound" });
        push({ Adapter: "n-done", Domain: "n-cmp" }, { call: "e-done", vcall: "e-done", vret: "e-done", ret: "e-act" }, { call: "get(\u2026)", vcall: "download_blob(\u2026)", vret: "BlobNotFound", ret: "KeyNotFound" },
            "So the adapter <b>translates errors too</b>. The domain catches <code>KeyNotFound</code>, which is our type.");
        push({ Sdk: "n-out", Adapter: "n-act", Domain: "n-done" }, {}, {},
            "The vendor ships v3 and renames <code>upload_blob</code> to <code>put_blob</code>. One class changes, the adapter. The domain doesn't even recompile.",
            { Sdk: "v3: renamed methods", Adapter: "edited", Domain: "unchanged" });
        push({}, {}, {}, "<b>Conclusion.</b> An adapter <b>conforms someone else's interface to yours</b>, translating calls, values and errors. It keeps the vendor at the edge of the system, so vendor changes stop at one class.");
        return frames;
    },
};

/* ---- 8. Decorator (crash) and Proxy (detailed) ---- */

VIZ["wrapper-layers"] = {
    title: "Same interface, extra layers",
    legend: [["lg-act", "running"], ["lg-done", "returned / stored"], ["lg-cmp", "deciding"], ["lg-out", "failed / refused"]],
    options: [
        { value: "decorator", label: "Decorators: Timed(Retrying(Cached(client)))" },
        { value: "proxy", label: "Proxy: guard and lazily create the real object" },
    ],
    build(option = "decorator") {
        const W = 860;
        const H = 260;
        const frames = [];

        if (option === "proxy") {
            const nodes = {
                Caller: { x: 20, y: 110, w: 170, h: 52, label: "caller" },
                Proxy: { x: 310, y: 110, w: 210, h: 52, label: "ReportProxy" },
                Real: { x: 640, y: 110, w: 200, h: 52, label: "RealReport" },
            };
            const edges = [
                { a: "Caller", b: "Proxy", id: "in", off: -10 },
                { a: "Proxy", b: "Caller", id: "out", off: -10 },
                { a: "Proxy", b: "Real", id: "fwd", off: -10 },
                { a: "Real", b: "Proxy", id: "back", off: -10 },
            ];
            const q = { in: "hide", out: "hide", fwd: "hide", back: "hide" };
            const push = (n, e, el, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, e: { ...q, ...e }, elabel: el, sub }), note });
            push({ Real: "n-ghost" }, {}, {}, { Real: "not created yet" },
                "Callers hold a <code>ReportProxy</code>. It has the same interface as <code>RealReport</code>, <code>export_pdf()</code>. The real report loads 40 MB of data, so it hasn't been created yet.");
            push({ Caller: "n-act", Proxy: "n-act", Real: "n-ghost" }, { in: "e-act" }, { in: "export_pdf()" }, { Caller: "role = viewer", Real: "not created yet" },
                "A viewer calls <code>export_pdf()</code> on what looks like the report.");
            push({ Caller: "n-out", Proxy: "n-out", Real: "n-ghost" }, { out: "e-act" }, { out: "PermissionDenied" }, { Caller: "role = viewer", Proxy: "checks role", Real: "never created" },
                "<b>Protection proxy:</b> the proxy checks the role first and refuses. The expensive object is never even built.");
            push({ Caller: "n-act", Proxy: "n-cmp", Real: "n-ghost" }, { in: "e-act" }, { in: "export_pdf()" }, { Caller: "role = admin", Proxy: "role ok", Real: "not created yet" },
                "An admin makes the same call. The permission check passes.");
            push({ Proxy: "n-act", Real: "n-act" }, { in: "e-done", fwd: "e-act" }, { fwd: "create (lazy)" }, { Caller: "role = admin", Real: "loading 40 MB\u2026" },
                "<b>Virtual proxy:</b> only now, on the first real use, does the proxy create the <code>RealReport</code>.");
            push({ Proxy: "n-act", Real: "n-done" }, { in: "e-done", fwd: "e-act" }, { fwd: "export_pdf()" }, { Caller: "role = admin", Real: "created" },
                "It forwards the call, unchanged, to the real object.");
            push({ Caller: "n-done", Proxy: "n-done", Real: "n-done" }, { back: "e-done", out: "e-done" }, { back: "report.pdf", out: "report.pdf" }, { Real: "created" },
                "The PDF comes back through the proxy. The caller can't tell it was ever talking to a stand-in.");
            push({ Caller: "n-act", Proxy: "n-act", Real: "n-done" }, { in: "e-act", fwd: "e-act" }, { in: "export_pdf()", fwd: "export_pdf()" }, { Caller: "role = admin", Proxy: "reuses instance", Real: "already loaded" },
                "The next call reuses the instance it already created. Nothing is loaded twice.");
            push({}, {}, {}, { Real: "created on demand" },
                "<b>Conclusion.</b> A proxy has the decorator's shape but a different job: it <b>controls access to the real object</b>. It decides whether to call it, when to create it, or where it runs. RPC client stubs and ORM lazy-loading are proxies too.");
            return frames;
        }

        const ids = ["Caller", "Timed", "Retry", "Cached", "Client", "Net"];
        const nodes = {
            Caller: { x: 10, y: 110, w: 100, h: 50, label: "caller" },
            Timed: { x: 150, y: 110, w: 120, h: 50, label: "Timed" },
            Retry: { x: 305, y: 110, w: 125, h: 50, label: "Retrying" },
            Cached: { x: 465, y: 110, w: 115, h: 50, label: "Cached" },
            Client: { x: 615, y: 110, w: 130, h: 50, label: "RatesClient" },
            Net: { x: 775, y: 110, w: 75, h: 50, label: "net" },
        };
        const edges = [];
        for (let i = 0; i < ids.length - 1; i++) {
            edges.push({ a: ids[i], b: ids[i + 1], id: `in${i}`, off: -10 });
            edges.push({ a: ids[i + 1], b: ids[i], id: `out${i}`, off: -10 });
        }
        const head = [[W / 2, 34, "rates = Timed(Retrying(Cached(RatesClient())))"]];
        const fr = (n, e, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, e, sub, caps: head }), note });
        const path = (from, to, state) => {
            const e = {};
            for (let i = from; i < to; i++) e[`in${i}`] = state;
            return e;
        };
        const back = (from, to, state) => {
            const e = {};
            for (let i = from; i < to; i++) e[`out${i}`] = state;
            return e;
        };

        fr({}, {}, {}, "Three decorators around one client. Each implements the same interface, <code>rate(currency)</code>, so the caller can't tell how many layers there are.");
        fr({ Caller: "n-act", Timed: "n-act" }, path(0, 1, "e-act"), { Timed: "timer started" },
            "The call enters the outermost layer. <code>Timed</code> starts a timer <em>on the way in</em>...");
        fr({ Timed: "n-cmp", Retry: "n-act" }, { ...path(0, 1, "e-done"), ...path(1, 2, "e-act") }, { Timed: "timer started", Retry: "attempt 1" },
            "...and forwards to <code>Retrying</code>, which starts attempt 1.");
        fr({ Timed: "n-cmp", Retry: "n-cmp", Cached: "n-act" }, { ...path(0, 2, "e-done"), ...path(2, 3, "e-act") }, { Retry: "attempt 1", Cached: "miss: EUR" },
            "<code>Cached</code> looks up EUR. It's a miss, so the call goes on inwards.");
        fr({ Client: "n-act", Net: "n-out" }, { ...path(0, 3, "e-done"), ...path(3, 5, "e-act") }, { Retry: "attempt 1", Cached: "miss: EUR", Net: "timeout" },
            "The real client calls the network, which times out.");
        fr({ Retry: "n-cmp", Cached: "n-idle", Net: "n-out" }, back(1, 5, "e-act"), { Retry: "waits 0\u2013200 ms", Cached: "won't store errors", Net: "timeout" },
            "The error travels back out through <code>Cached</code>, which doesn't store failures. <code>Retrying</code> catches the timeout and waits a random backoff...");
        fr({ Retry: "n-act", Cached: "n-act" }, path(2, 3, "e-act"), { Retry: "attempt 2", Cached: "miss again" },
            "...then tries again. The cache sits <em>inside</em> the retry layer, so it's checked again on every attempt.");
        fr({ Retry: "n-cmp", Client: "n-done", Net: "n-done" }, { ...path(2, 3, "e-done"), ...path(3, 5, "e-act") }, { Retry: "attempt 2", Net: "200 OK" },
            "This time the network answers: <code>1.08</code>.");
        fr({ Cached: "n-done", Client: "n-done" }, back(3, 5, "e-done"), { Cached: "stored EUR = 1.08" },
            "On the way out, <code>Cached</code> stores the result before passing it back.");
        fr({ Caller: "n-done", Timed: "n-done", Retry: "n-done", Cached: "n-done" }, back(0, 3, "e-done"), { Timed: "recorded 312 ms", Retry: "returned", Cached: "stored EUR = 1.08" },
            "<code>Retrying</code> returns it, and <code>Timed</code> records 312 ms, a figure that includes the retry. The caller just sees <code>1.08</code>.");
        fr({ Caller: "n-act", Timed: "n-done", Retry: "n-done", Cached: "n-done" }, { ...path(0, 3, "e-act"), ...back(0, 3, "e-done") }, { Timed: "recorded 2 ms", Cached: "hit: 1.08", Client: "not called" },
            "A second call for EUR stops at <code>Cached</code>: it's a hit. The client and the network never run.");
        fr({}, {}, {},
            "<b>Conclusion.</b> Each decorator adds one behaviour and keeps the interface, so they <b>stack in any order</b>. But the order is part of the design. Put <code>Cached</code> outside <code>Retrying</code> and a hit skips the retry machinery entirely.");
        return frames;
    },
};

/* ---- 10. Observer ---- */

VIZ["observer-notify"] = {
    title: "Publish once, notify whoever subscribed",
    legend: [["lg-act", "notified / subscribing"], ["lg-done", "handled"], ["lg-out", "handler failed"], ["lg-idle", "waiting"]],
    build() {
        const W = 860;
        const H = 330;
        const subs = ["Email", "Loyalty", "Analytics", "Fraud"];
        const labels = { Email: "send_receipt", Loyalty: "award_points", Analytics: "track_sale", Fraud: "score_fraud" };
        const nodes = { Order: { x: 30, y: 135, w: 210, h: 60, label: "OrderService" } };
        subs.forEach((s, i) => (nodes[s] = { x: 590, y: 20 + i * 76, w: 240, h: 44, label: labels[s] }));
        const edges = [];
        subs.forEach((s) => {
            edges.push({ a: s, b: "Order", id: `s-${s}`, dash: true, off: -8 });
            edges.push({ a: "Order", b: s, id: `n-${s}`, off: -8 });
        });
        const frames = [];
        let list = [];
        const push = (n, e, el, note, sub = {}) => {
            const hidden = {};
            subs.forEach((s) => {
                hidden[`s-${s}`] = "hide";
                hidden[`n-${s}`] = "hide";
            });
            const ns = { ...n };
            subs.forEach((s) => ns[s] === undefined && !list.includes(s) && (ns[s] = "hide"));
            frames.push({
                stage: scene(W, H, nodes, edges, { n: ns, e: { ...hidden, ...e }, elabel: el, sub: { Order: `subscribers: ${list.length}`, ...sub } }),
                note,
            });
        };
        push({}, {}, {}, "<code>OrderService</code> keeps a list of subscribers, empty for now. It knows the shape of a handler, nothing more.");
        list = ["Email"];
        push({ Email: "n-act" }, { "s-Email": "e-act" }, { "s-Email": "subscribe" },
            "The email module subscribes <code>send_receipt</code> to <code>order_placed</code>. Look at the arrow: the edge depends on the core, not the other way round.");
        list = ["Email", "Loyalty"];
        push({ Loyalty: "n-act" }, { "s-Loyalty": "e-act" }, { "s-Loyalty": "subscribe" }, "The loyalty module subscribes <code>award_points</code>.");
        list = ["Email", "Loyalty", "Analytics"];
        push({ Analytics: "n-act" }, { "s-Analytics": "e-act" }, { "s-Analytics": "subscribe" }, "Analytics subscribes <code>track_sale</code>.");
        push({ Order: "n-act", Email: "n-done" }, { "n-Email": "e-act" }, { "n-Email": "order_placed" },
            "<code>place_order()</code> commits, then publishes <code>order_placed</code>. The bus loops over a <em>copy</em> of the list. First, the receipt.");
        push({ Order: "n-act", Email: "n-done", Loyalty: "n-done" }, { "n-Loyalty": "e-act" }, { "n-Loyalty": "order_placed" }, "Next, the points.");
        push({ Order: "n-act", Email: "n-done", Loyalty: "n-done", Analytics: "n-out" }, { "n-Analytics": "e-act" }, { "n-Analytics": "order_placed" },
            "Analytics raises. The bus logs it and <b>carries on</b>. One broken subscriber must not stop the others, or roll back the order.", { Analytics: "raised: timeout (logged)" });
        list = ["Email", "Loyalty", "Analytics", "Fraud"];
        push({ Fraud: "n-done" }, { "s-Fraud": "e-act" }, { "s-Fraud": "subscribe" },
            "New requirement: fraud scoring. It subscribes from its own module. <code>OrderService</code> wasn't edited.", { Fraud: "new module" });
        list = ["Email", "Analytics", "Fraud"];
        push({ Loyalty: "n-ghost" }, { "s-Loyalty": "e-act" }, { "s-Loyalty": "unsubscribe()" },
            "The loyalty feature is switched off. It calls the <code>unsubscribe</code> function that <code>subscribe</code> returned. Without that call, the bus would keep the handler alive forever.");
        push({ Order: "n-act", Email: "n-done", Analytics: "n-done", Fraud: "n-done" }, { "n-Email": "e-act", "n-Analytics": "e-act", "n-Fraud": "e-act" }, {},
            "The next order notifies the current subscribers. The publisher's code is the same as it was on day one.");
        push({}, {}, {}, "<b>Conclusion.</b> Observer <b>inverts the dependency</b>: the core announces facts and the features listen. You can add reactions without editing the publisher. The price is that \u201cwhat happens next?\u201d is no longer visible in one place.");
        return frames;
    },
};

/* ---- Command with undo and redo ---- */

VIZ["command-undo"] = {
    title: "Commands on two stacks: undo and redo",
    legend: [["lg-act", "just moved"], ["lg-done", "document"], ["lg-out", "discarded"], ["lg-idle", "stored command"]],
    build() {
        const frames = [];
        const ins1 = "Insert(0, 'Hello world')";
        const del = "Delete(5, 6) removed=' world'";
        const ins2 = "Insert(11, '!')";
        const push = (action, doc, undo, redo, note, act = {}) => {
            const items = (list, which) => list.map((t) => ({ text: t, cls: act[which] === t ? "is-act" : act.out?.includes(t) && which === "redo" ? "is-out" : "" }));
            frames.push({
                stage: stackHTML(
                    rowHTML("action", [{ t: action, c: action === "\u2014" ? "is-ghost" : "is-act" }]),
                    panesHTML([
                        { title: "Document", items: [{ text: `"${doc}"`, cls: "is-done" }] },
                        { title: "Undo stack (top first)", items: items(undo, "undo"), empty: "empty" },
                        { title: "Redo stack (top first)", items: items(redo, "redo"), empty: "empty" },
                    ])
                ),
                note,
            });
        };
        push("\u2014", "", [], [], "An editor with an empty document and two empty stacks of command objects.");
        push(`run(${ins1})`, "Hello world", [ins1], [], "<code>run()</code> executes the command, then pushes it onto <b>undo</b>.", { undo: ins1 });
        push("run(Delete(5, 6))", "Hello", [del, ins1], [],
            "<code>Delete</code> <b>captures the text it removes</b> as it runs, <code>' world'</code>. Without that, it couldn't be undone.", { undo: del });
        push("undo()", "Hello world", [ins1], [del], "<code>undo()</code> pops the delete, calls its <code>undo()</code> to put <code>' world'</code> back, and pushes it onto <b>redo</b>.", { redo: del });
        push("undo()", "", [], [ins1, del], "Undo again: the insert removes exactly what it inserted. Both commands are now on the redo stack.", { redo: ins1 });
        push("redo()", "Hello world", [ins1], [del], "<code>redo()</code> pops the insert, executes it again, and returns it to the undo stack.", { undo: ins1 });
        push(`run(${ins2})`, "Hello world!", [ins2, ins1], [del],
            "A <b>new</b> edit. The delete on the redo stack was recorded against a document that is about to stop existing...", { undo: ins2, out: [del] });
        push(`run(${ins2})`, "Hello world!", [ins2, ins1], [],
            "...so <code>run()</code> clears redo. Replaying that delete now would remove the wrong characters.", { undo: ins2 });
        push("undo()", "Hello world", [ins1], [ins2], "Undo still works on the new branch of history: the <code>'!'</code> comes off.", { redo: ins2 });
        push("\u2014", "Hello world", [ins1], [ins2],
            "<b>Conclusion.</b> Turning each edit into an object with <code>execute()</code> and <code>undo()</code> gives you history for free: two stacks and three rules. The rule people forget is that <b>a new command clears redo</b>.");
        return frames;
    },
};

/* ---- State ---- */

VIZ["state-machine"] = {
    title: "An order delegating to its current state",
    legend: [["lg-act", "current state"], ["lg-done", "transition taken"], ["lg-out", "rejected event"], ["lg-idle", "other states"]],
    build() {
        const W = 860;
        const H = 340;
        const nodes = {
            pending: { x: 30, y: 70, w: 150, h: 48, label: "Pending" },
            paid: { x: 245, y: 70, w: 150, h: 48, label: "Paid" },
            shipped: { x: 460, y: 70, w: 150, h: 48, label: "Shipped" },
            delivered: { x: 675, y: 70, w: 160, h: 48, label: "Delivered" },
            cancelled: { x: 30, y: 230, w: 150, h: 48, label: "Cancelled" },
            refunded: { x: 460, y: 230, w: 150, h: 48, label: "Refunded" },
        };
        const edges = [
            { a: "pending", b: "paid", id: "pay", label: "pay" },
            { a: "paid", b: "shipped", id: "ship", label: "ship" },
            { a: "shipped", b: "delivered", id: "deliver", label: "deliver" },
            { a: "pending", b: "cancelled", id: "cancel1", label: "cancel" },
            { a: "paid", b: "refunded", id: "cancel2", label: "cancel" },
            { a: "delivered", b: "refunded", id: "refund", label: "refund" },
        ];
        const frames = [];
        const hist = [];
        const push = (n, e, note, sub = {}, extra = []) =>
            frames.push({ stage: scene(W, H, nodes, edges, { n, e, sub, caps: [[W / 2, 326, `history: ${hist.join(" \u2192 ")}`], ...extra] }), note });
        hist.push("pending");
        push({ pending: "n-act" }, {}, "A new order starts in <code>Pending</code>. The <code>Order</code> object forwards every event to whichever state object it currently holds.");
        hist.push("paid");
        push({ paid: "n-act" }, { pay: "e-done" }, "<code>order.pay()</code> runs <code>Pending.pay()</code>, which swaps the state to <code>Paid</code>. A transition is one assignment.");
        push({ paid: "n-out" }, { pay: "e-done" }, "<code>order.deliver()</code> on a paid order. <code>Paid</code> has no <code>deliver</code>, so the base class rejects it: <code>cannot deliver an order that is paid</code>. No <code>if</code> required.",
            {}, [[W / 2, 30, "deliver() \u2192 InvalidTransition"]]);
        hist.push("shipped");
        push({ shipped: "n-act" }, { pay: "e-done", ship: "e-done" }, "<code>order.ship(\"1Z999\")</code>: <code>Paid.ship()</code> records the tracking number and moves to <code>Shipped</code>.", { shipped: "tracking 1Z999" });
        push({ shipped: "n-out" }, { pay: "e-done", ship: "e-done" }, "The customer tries to cancel. Look at the diagram: <code>cancel</code> arrows only leave <code>Pending</code> and <code>Paid</code>, so <code>Shipped</code> rejects it.",
            { shipped: "tracking 1Z999" }, [[W / 2, 30, "cancel() \u2192 InvalidTransition"]]);
        hist.push("delivered");
        push({ delivered: "n-act" }, { pay: "e-done", ship: "e-done", deliver: "e-done" }, "The courier confirms delivery: <code>Shipped.deliver()</code> moves to <code>Delivered</code>.");
        hist.push("refunded");
        push({ refunded: "n-act" }, { pay: "e-done", ship: "e-done", deliver: "e-done", refund: "e-done" }, "The item is returned: <code>Delivered.refund()</code> moves to <code>Refunded</code>. No events leave it, so every further call is rejected.");
        push({}, { pay: "e-done", ship: "e-done", deliver: "e-done", cancel1: "e-done", cancel2: "e-done", refund: "e-done" },
            "<b>Conclusion.</b> The diagram <em>is</em> the code. Each arrow is one method on one state class, and each missing arrow is the base class's rejection. To add a state, you add a class; you don't edit an <code>if</code> in every method.");
        return frames;
    },
};

/* ---- Chain of Responsibility as middleware ---- */

VIZ["middleware-chain"] = {
    title: "A request through an onion of middleware",
    legend: [["lg-act", "running"], ["lg-done", "passed / returned"], ["lg-out", "stopped the chain"], ["lg-idle", "not reached"]],
    build() {
        const W = 860;
        const H = 260;
        const ids = ["Client", "Timing", "Auth", "Endpoint"];
        const nodes = {
            Client: { x: 10, y: 110, w: 120, h: 52, label: "client" },
            Timing: { x: 200, y: 110, w: 150, h: 52, label: "timing" },
            Auth: { x: 420, y: 110, w: 180, h: 52, label: "require_user" },
            Endpoint: { x: 670, y: 110, w: 180, h: 52, label: "list_orders" },
        };
        const edges = [];
        for (let i = 0; i < 3; i++) {
            edges.push({ a: ids[i], b: ids[i + 1], id: `in${i}`, off: -10 });
            edges.push({ a: ids[i + 1], b: ids[i], id: `out${i}`, off: -10 });
        }
        const head = [[W / 2, 34, "app = compose([timing, require_user(verify)], list_orders)"]];
        const frames = [];
        const push = (n, e, el, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, e, elabel: el, sub, caps: head }), note });

        push({}, {}, {}, {}, "Two middlewares around one endpoint. Each is a function <code>(request, next)</code>. <code>compose</code> wraps them from the inside out.");
        push({ Client: "n-act", Timing: "n-act" }, { in0: "e-act" }, { in0: "no token" }, { Timing: "start timer" },
            "Request A has no token. <code>timing</code> runs its <em>before</em> code, noting the start time, and then calls <code>next</code>.");
        push({ Timing: "n-cmp", Auth: "n-out" }, { in0: "e-done", in1: "e-act" }, {}, { Timing: "start timer", Auth: "no user \u2192 401", Endpoint: "never runs" },
            "<code>require_user</code> finds no valid token, so it returns a 401 <b>without calling next</b>. The chain stops here.");
        push({ Timing: "n-act", Auth: "n-out" }, { out1: "e-act" }, { out1: "401" }, { Timing: "adds server-timing", Endpoint: "never runs" },
            "The 401 travels back out through <code>timing</code>, which still runs its <em>after</em> code and adds a header.");
        push({ Client: "n-out", Timing: "n-done", Auth: "n-out" }, { out1: "e-done", out0: "e-act" }, { out0: "401" }, { Endpoint: "never runs" },
            "The client gets a 401. The endpoint was never touched, and it needed no <code>if</code> of its own.");
        push({ Client: "n-act", Timing: "n-act" }, { in0: "e-act" }, { in0: "Bearer \u2026" }, { Timing: "start timer" },
            "Request B carries a valid token. Same chain, same first step.");
        push({ Timing: "n-cmp", Auth: "n-done" }, { in0: "e-done", in1: "e-act" }, {}, { Timing: "start timer", Auth: "user = ana" },
            "<code>require_user</code> verifies the token and finds the user, <code>ana</code>...");
        push({ Auth: "n-done", Endpoint: "n-act" }, { in0: "e-done", in1: "e-done", in2: "e-act" }, { in2: "request + user" }, { Auth: "user = ana" },
            "...and calls <code>next</code> with the user attached. The endpoint can rely on <code>request.user</code> being there.");
        push({ Endpoint: "n-done", Auth: "n-done", Timing: "n-act" }, { out2: "e-done", out1: "e-act" }, { out2: "200", out1: "200" }, { Timing: "adds server-timing" },
            "The 200 unwinds: <code>require_user</code> has no after-code, and <code>timing</code> measures everything that ran inside it.");
        push({ Client: "n-done", Timing: "n-done", Auth: "n-done", Endpoint: "n-done" }, { out2: "e-done", out1: "e-done", out0: "e-done" }, { out0: "200" }, {},
            "The client gets the orders.");
        push({}, {}, {}, {},
            "<b>Conclusion.</b> Each handler either passes the request on or stops it, and onion middleware also gets a turn on the way out. <b>Order is part of the design.</b> If <code>timing</code> ran after <code>require_user</code>, it would never time the rejected requests.");
        return frames;
    },
};

/* ---- 11. Patterns that collapse into functions ---- */

VIZ["pattern-to-function"] = {
    title: "When a Strategy class is really a function",
    legend: [["lg-act", "focus"], ["lg-out", "removed"], ["lg-cmp", "stays a class"], ["lg-done", "result"]],
    build() {
        const classic = [
            "class ByTotal:",
            "    def key(self, order):",
            "        return order.total",
            "",
            "class ByDate:",
            "    def key(self, order):",
            "        return order.created_at",
            "",
            "def sort_orders(orders, strategy):",
            "    return sorted(orders, key=strategy.key)",
            "",
            "sort_orders(orders, ByTotal())",
        ];
        const fns = [
            "def by_total(order):",
            "    return order.total",
            "",
            "def by_date(order):",
            "    return order.created_at",
            "",
            "def sort_orders(orders, key):",
            "    return sorted(orders, key=key)",
            "",
            "sort_orders(orders, by_total)",
        ];
        const final = [
            "from operator import attrgetter",
            "",
            "sorted(orders, key=attrgetter(\"total\"))",
            "sorted(orders, key=attrgetter(\"created_at\"))",
        ];
        const stateful = [
            "class TieredDiscount:",
            "    def __init__(self, tiers: list[tuple[int, float]]):",
            "        self.tiers = sorted(tiers, reverse=True)",
            "",
            "    def applies_to(self, cart) -> bool:",
            "        return cart.subtotal >= self.tiers[-1][0]",
            "",
            "    def discount(self, cart) -> float:",
            "        for threshold, rate in self.tiers:",
            "            if cart.subtotal >= threshold:",
            "                return cart.subtotal * rate",
            "        return 0.0",
        ];
        const frames = [];
        const push = (code, marks, note) => frames.push({ stage: codeHTML(code, marks), note });
        push(classic, {}, "A textbook Strategy: an interface method, <code>key()</code>, two strategy classes, and a context, <code>sort_orders</code>, that holds one.");
        push(classic, { 0: "is-act", 1: "is-act", 4: "is-act", 5: "is-act" }, "Each class has <b>exactly one method and no state</b>. Nothing is stored in <code>self</code>.");
        push(classic, { 0: "is-out", 1: "is-out", 4: "is-out", 5: "is-out" }, "A class with one method and no state is a function dressed up as a class. The class lines go.");
        push(fns, { 0: "is-done", 3: "is-done", 9: "is-act" }, "The strategies are plain functions now, and you pass them in directly. The decoupling is identical: <code>sort_orders</code> still doesn't know which key it got.");
        push(fns, { 6: "is-out", 7: "is-out" }, "And <code>sort_orders</code> was only ever a thin wrapper, because <code>sorted</code> <em>already</em> accepts a strategy: <code>key=</code>.");
        push(final, { 2: "is-done", 3: "is-done" }, "What's left is a standard-library call. Twelve lines became one, and every Python developer can read it.");
        push(stateful, { 0: "is-cmp", 1: "is-cmp", 4: "is-cmp", 7: "is-cmp" }, "Now a strategy with <b>configuration</b> (the tiers) and <b>two operations</b>. Here a class is the clearer shape: promote a function back to a class when it gains state or a second method.");
        push(final, {}, "<b>Conclusion.</b> The pattern, separating what varies, survives in every language. The <b>ceremony</b> doesn't. Use a function when one will do, and a class when the behaviour needs state, more than one method, or a name.");
        return frames;
    },
};

/* ==========================================================================
   Detailed-course widgets
   ========================================================================== */

/* ---- SOLID: open/closed ---- */

VIZ["ocp-switch"] = {
    title: "Adding a shape: edit every switch, or add one class?",
    legend: [["lg-cmp", "must be found"], ["lg-out", "edited tested code"], ["lg-done", "new code only"], ["lg-act", "focus"]],
    build() {
        const before = [
            "def area(shape):",
            "    if shape.kind == \"circle\": return pi * shape.r ** 2",
            "    if shape.kind == \"square\": return shape.side ** 2",
            "",
            "def perimeter(shape):",
            "    if shape.kind == \"circle\": return 2 * pi * shape.r",
            "    if shape.kind == \"square\": return 4 * shape.side",
            "",
            "def to_svg(shape):",
            "    if shape.kind == \"circle\": return f\"<circle r={shape.r}/>\"",
            "    if shape.kind == \"square\": return f\"<rect w={shape.side}/>\"",
        ];
        const edited = [...before];
        edited.splice(11, 0, "    if shape.kind == \"triangle\": return f\"<polygon \u2026/>\"");
        edited.splice(7, 0, "    if shape.kind == \"triangle\": return shape.a + shape.b + shape.c");
        edited.splice(3, 0, "    if shape.kind == \"triangle\": return heron(shape)");
        const after = [
            "class Shape(ABC):",
            "    @abstractmethod",
            "    def area(self): ...",
            "    @abstractmethod",
            "    def perimeter(self): ...",
            "    @abstractmethod",
            "    def to_svg(self): ...",
            "",
            "class Circle(Shape): ...      # unchanged",
            "class Square(Shape): ...      # unchanged",
            "",
            "class Triangle(Shape):        # the new requirement",
            "    def area(self): return heron(self)",
            "    def perimeter(self): return self.a + self.b + self.c",
            "    def to_svg(self): return f\"<polygon \u2026/>\"",
        ];
        const frames = [];
        const push = (code, marks, note) => frames.push({ stage: codeHTML(code, marks), note });
        push(before, {}, "Three functions, each switching on <code>shape.kind</code>. Every function knows about every shape.");
        push(before, { 0: "is-cmp", 4: "is-cmp", 8: "is-cmp" }, "Requirement: support triangles. First you have to <b>find</b> every function that switches on <code>kind</code>. Here there are three; in a real codebase, they're spread across files.");
        push(edited, { 3: "is-out", 8: "is-out", 13: "is-out" }, "Each one gets a new branch. That's three edits to code that was already tested, and three chances to get one wrong.");
        push(edited.filter((_, i) => i !== 13), { 3: "is-out", 8: "is-out", 11: "is-act" }, "Miss one, and nothing complains: <code>to_svg(triangle)</code> falls through every <code>if</code> and quietly returns <code>None</code>.");
        push(after.slice(0, 10), { 0: "is-act" }, "The polymorphic version: each shape is a class that implements all three operations, behind an abstract base.");
        push(after, { 11: "is-done", 12: "is-done", 13: "is-done", 14: "is-done" }, "Adding triangles is <b>one new class</b>. <code>Circle</code>, <code>Square</code> and every caller stay untouched, and so do their tests.");
        push(after, { 1: "is-cmp", 3: "is-cmp", 5: "is-cmp", 11: "is-done" }, "And you can't forget an operation: the abstract methods make Python refuse to create a <code>Triangle</code> that lacks one.");
        push(after, { 2: "is-act", 4: "is-act", 6: "is-act" }, "<b>Conclusion.</b> The code is now <b>closed against new shapes</b>. The trade-off: a new <em>operation</em>, like <code>to_json</code>, now touches every class. OCP protects the axis you choose, and section 29 shows the other side of that choice.");
        return frames;
    },
};

/* ---- SOLID: Liskov substitution ---- */

VIZ["lsp-square"] = {
    title: "A Square that breaks Rectangle's promise",
    legend: [["lg-act", "running"], ["lg-done", "as promised"], ["lg-cmp", "side effect"], ["lg-out", "promise broken"]],
    build() {
        const code = [
            "def test_resize(rect: Rectangle) -> None:",
            "    rect.set_width(5)",
            "    rect.set_height(4)",
            "    assert rect.area() == 20",
        ];
        const frames = [];
        const push = (marks, cls, w, h, area, note, areaCls = "") =>
            frames.push({
                stage: stackHTML(
                    codeHTML(code, marks),
                    rowHTML("object", [{ t: cls, c: "is-act" }]),
                    rowHTML("state", [{ t: `width = ${w}`, c: w.c || "" }, { t: `height = ${h}`, c: h.c || "" }, { t: `area = ${area}`, c: areaCls }])
                ),
                note,
            });
        const v = (n, c = "") => ({ toString: () => String(n), c });
        push({}, "Rectangle(2, 2)", v(2), v(2), "4", "A function written against <code>Rectangle</code>. It relies on a promise every rectangle makes: <b>setting the width leaves the height alone</b>.");
        push({ 1: "is-act" }, "Rectangle(2, 2)", v(5, "is-done"), v(2), "10", "<code>set_width(5)</code>: the width changes, and the height stays 2.");
        push({ 1: "is-done", 2: "is-act" }, "Rectangle(2, 2)", v(5), v(4, "is-done"), "20", "<code>set_height(4)</code>: the height changes, and the width stays 5.");
        push({ 1: "is-done", 2: "is-done", 3: "is-done" }, "Rectangle(2, 2)", v(5), v(4), "20", "<code>area() == 20</code>. The test passes.", "is-done");
        push({}, "Square(2)", v(2), v(2), "4", "Now pass a <code>Square</code>. Mathematically a square <em>is</em> a rectangle, so <code>class Square(Rectangle)</code> type-checks without complaint.");
        push({ 1: "is-act" }, "Square(2)", v(5, "is-done"), v(5, "is-cmp"), "25", "<code>Square.set_width(5)</code> keeps itself square by setting the height too. That's a side effect the caller never asked for.");
        push({ 1: "is-done", 2: "is-act" }, "Square(2)", v(4, "is-cmp"), v(4, "is-done"), "16", "<code>set_height(4)</code> does the same in reverse, and the width the caller set is silently overwritten.");
        push({ 1: "is-done", 2: "is-done", 3: "is-out" }, "Square(2)", v(4), v(4), "16 \u2260 20", "<code>AssertionError</code>. The same code, given a subtype, behaves differently. <code>Square</code> <b>weakened a postcondition</b> of <code>set_width</code>.", "is-out");
        push({}, "Square(2)", v(4), v(4), "16", "<b>Conclusion.</b> Subtyping is about <b>behaviour</b>, not taxonomy. Fix it by not relating the two through inheritance: make both immutable shapes with an <code>area()</code>, or give them a common read-only interface, so no caller can rely on independent setters.");
        return frames;
    },
};

/* ---- Abstract Factory ---- */

VIZ["abstract-factory-families"] = {
    title: "One factory, one consistent family of products",
    legend: [["lg-act", "deciding"], ["lg-done", "created"], ["lg-cmp", "asking"], ["lg-out", "not allowed / cost"]],
    build() {
        const W = 860;
        const H = 340;
        const nodes = {
            Root: { x: 20, y: 40, w: 190, h: 50, label: "build_factory()" },
            App: { x: 20, y: 250, w: 190, h: 50, label: "ReceiptService" },
            Factory: { x: 300, y: 145, w: 200, h: 56, label: "CloudFactory", iface: true },
            Blob: { x: 600, y: 30, w: 240, h: 44, label: "BlobStore" },
            Queue: { x: 600, y: 100, w: 240, h: 44, label: "Queue" },
            Secrets: { x: 600, y: 170, w: 240, h: 44, label: "SecretStore" },
            Cache: { x: 600, y: 255, w: 240, h: 44, label: "Cache" },
        };
        const edges = [
            { a: "Root", b: "Factory", id: "pick" },
            { a: "App", b: "Factory", id: "ask", dash: true, label: "asks" },
            { a: "Factory", b: "Blob", id: "mk-blob" },
            { a: "Factory", b: "Queue", id: "mk-queue" },
            { a: "Factory", b: "Secrets", id: "mk-secrets" },
            { a: "Factory", b: "Cache", id: "mk-cache" },
        ];
        const local = { Factory: "LocalFactory", Blob: "InMemoryBlobStore", Queue: "InMemoryQueue", Secrets: "EnvSecretStore" };
        const aws = { Factory: "AwsFactory", Blob: "S3BlobStore", Queue: "SqsQueue", Secrets: "SecretsManagerStore" };
        const frames = [];
        const push = (n, e, label, note, extra = {}) =>
            frames.push({ stage: scene(W, H, nodes, edges, { n: { Cache: "hide", ...n }, e, label, ...extra }), note });

        push({ Root: "n-act", Factory: "n-act", Blob: "n-ghost", Queue: "n-ghost", Secrets: "n-ghost" }, { pick: "e-act" }, local,
            "At startup the composition root reads <code>APP_ENV=local</code> and picks <b>one</b> factory: <code>LocalFactory</code>.", { elabel: { pick: "APP_ENV=local" } });
        push({ App: "n-cmp", Blob: "n-done", Queue: "n-ghost", Secrets: "n-ghost" }, { ask: "e-act", "mk-blob": "e-act" }, local,
            "The application asks for <code>blob_store()</code> and gets an in-memory store. It only ever sees the <code>BlobStore</code> interface.");
        push({ App: "n-cmp", Blob: "n-done", Queue: "n-done", Secrets: "n-ghost" }, { ask: "e-act", "mk-queue": "e-act" }, local,
            "<code>queue(\"orders\")</code> comes from the same factory, so it's from the same family: in memory.");
        push({ App: "n-cmp", Blob: "n-done", Queue: "n-done", Secrets: "n-done" }, { ask: "e-act", "mk-secrets": "e-act" }, local,
            "So does <code>secrets()</code>. Three products, one family, and no code below the root named a concrete class.");
        push({ Root: "n-act", Factory: "n-act", Blob: "n-done", Queue: "n-done", Secrets: "n-done" }, { pick: "e-act", "mk-blob": "e-done", "mk-queue": "e-done", "mk-secrets": "e-done" }, aws,
            "In production the root picks <code>AwsFactory</code> instead. <b>One decision</b> swaps the whole family: S3, SQS and Secrets Manager, all in the same account and region.",
            { elabel: { pick: "APP_ENV=production" } });
        push({ Blob: "n-done", Queue: "n-out", Secrets: "n-done" }, {}, { ...aws, Queue: "InMemoryQueue ?" },
            "What it prevents: an S3 blob store paired with an in-memory queue. If the only way to get a product is through the one chosen factory, that mix can't happen.",
            { sub: { Queue: "can't be created here" } });
        push({ Factory: "n-out", Blob: "n-done", Queue: "n-done", Secrets: "n-done", Cache: "n-out" }, { "mk-cache": "e-act" }, { ...aws, Cache: "cache() ?" },
            "The cost: a new <em>kind</em> of product, like <code>cache()</code>, means editing the interface <b>and every factory</b>, local and AWS alike.",
            { sub: { Factory: "every factory edited" } });
        push({ Blob: "n-done", Queue: "n-done", Secrets: "n-done" }, { "mk-blob": "e-done", "mk-queue": "e-done", "mk-secrets": "e-done" }, aws,
            "<b>Conclusion.</b> Abstract Factory makes <b>new families cheap</b> and guarantees products are never mixed. It makes <b>new product kinds expensive</b>, so use it where the family is the thing that varies.");
        return frames;
    },
};

/* ---- Prototype: shallow versus deep copies ---- */

VIZ["prototype-copy"] = {
    title: "Cloning a template: what does the copy share?",
    legend: [["lg-act", "new object"], ["lg-done", "independent"], ["lg-out", "shared and changed"], ["lg-cmp", "shared on purpose"]],
    options: [
        { value: "shallow", label: "Shallow copy" },
        { value: "deep", label: "Deep copy" },
    ],
    build(option = "shallow") {
        const W = 860;
        const H = 360;
        const nodes = {
            Template: { x: 20, y: 60, w: 200, h: 50, label: "template" },
            Clone: { x: 20, y: 240, w: 200, h: 50, label: "tenant_a" },
            FlagsA: { x: 330, y: 20, w: 250, h: 44, label: "features {beta: false}" },
            TagsA: { x: 330, y: 95, w: 250, h: 44, label: "regions [\"eu\"]" },
            Cache: { x: 650, y: 60, w: 190, h: 44, label: "TemplateCache" },
            FlagsB: { x: 330, y: 215, w: 250, h: 44, label: "features {beta: false}" },
            TagsB: { x: 330, y: 290, w: 250, h: 44, label: "regions [\"eu\"]" },
        };
        const edges = [
            { a: "Template", b: "FlagsA" },
            { a: "Template", b: "TagsA" },
            { a: "Template", b: "Cache" },
            { a: "Clone", b: "FlagsA", id: "c-fa" },
            { a: "Clone", b: "TagsA", id: "c-ta" },
            { a: "Clone", b: "FlagsB", id: "c-fb" },
            { a: "Clone", b: "TagsB", id: "c-tb" },
            { a: "Clone", b: "Cache", id: "c-cache" },
        ];
        const frames = [];
        const push = (n, e, label, note, caps = []) => frames.push({ stage: scene(W, H, nodes, edges, { n, e, label, caps }), note });
        const none = { "c-fa": "hide", "c-ta": "hide", "c-fb": "hide", "c-tb": "hide", "c-cache": "hide" };

        push({ Clone: "hide", FlagsB: "hide", TagsB: "hide" }, none, {},
            "A configured template: a top-level object pointing at a <code>features</code> dict, a <code>regions</code> list and an expensive, read-only <code>TemplateCache</code>.");

        if (option === "deep") {
            push({ Clone: "n-act", FlagsB: "n-done", TagsB: "n-done", Cache: "n-cmp" }, { ...none, "c-fb": "e-act", "c-tb": "e-act", "c-cache": "e-act" }, {},
                "A controlled deep copy walks the graph and copies every <em>mutable</em> part. The read-only cache is shared on purpose, as <code>__deepcopy__</code> decided.");
            push({ Clone: "n-act", FlagsB: "n-done", TagsB: "n-done" }, { ...none, "c-fb": "e-done", "c-tb": "e-done", "c-cache": "e-done" }, {},
                "Identity check: <code>tenant_a.features is template.features</code> is now <code>False</code>.", [[W - 20, 345, "features: separate objects", "end"]]);
            push({ Clone: "n-act", FlagsB: "n-act" }, { ...none, "c-fb": "e-act", "c-tb": "e-done", "c-cache": "e-done" }, { FlagsB: "features {beta: true}" },
                "Support turns on <code>beta</code> for tenant A. The write lands in tenant A's own dict...");
            push({ Template: "n-done", FlagsA: "n-done" }, { ...none, "c-fb": "e-done", "c-tb": "e-done", "c-cache": "e-done" }, { FlagsB: "features {beta: true}" },
                "...and the template, plus every tenant cloned from it, still has <code>beta: false</code>.");
            push({ Cache: "n-cmp" }, { ...none, "c-fb": "e-done", "c-tb": "e-done", "c-cache": "e-act" }, { FlagsB: "features {beta: true}" },
                "The cost: a deep copy is proportional to the size of the graph, and it copies whatever it reaches unless you say otherwise, including locks and connections.");
            push({}, { ...none, "c-fb": "e-done", "c-tb": "e-done", "c-cache": "e-done" }, { FlagsB: "features {beta: true}" },
                "<b>Conclusion.</b> A deep copy gives every clone its own mutable state. Decide, field by field, what must be copied and what can be shared, or make the state immutable so sharing is always safe.");
            return frames;
        }

        push({ Clone: "n-act", FlagsB: "hide", TagsB: "hide" }, { ...none, "c-fa": "e-act", "c-ta": "e-act", "c-cache": "e-act" }, {},
            "<code>copy.copy(template)</code>, <code>{ ...template }</code>: a <b>new top-level object</b>, but its fields point at the <b>same nested objects</b>.");
        push({ Clone: "n-act", FlagsB: "hide", TagsB: "hide" }, { ...none, "c-fa": "e-done", "c-ta": "e-done", "c-cache": "e-done" }, {},
            "Identity check: <code>tenant_a is template</code> is <code>False</code>, but <code>tenant_a.features is template.features</code> is <code>True</code>.", [[W - 20, 345, "features: ONE shared object", "end"]]);
        push({ Clone: "n-act", FlagsA: "n-out", FlagsB: "hide", TagsB: "hide" }, { ...none, "c-fa": "e-act", "c-ta": "e-done", "c-cache": "e-done" }, { FlagsA: "features {beta: true}" },
            "Support turns on <code>beta</code> for tenant A by writing <code>tenant_a.features[\"beta\"] = True</code>. That writes into the shared dict.");
        push({ Template: "n-out", FlagsA: "n-out", FlagsB: "hide", TagsB: "hide" }, { ...none, "c-fa": "e-done", "c-ta": "e-done", "c-cache": "e-done" }, { FlagsA: "features {beta: true}" },
            "The template now has <code>beta: true</code>, and so does every tenant cloned from it, past and future.");
        push({ FlagsA: "n-out", FlagsB: "hide", TagsB: "hide" }, { ...none, "c-fa": "e-done", "c-ta": "e-done", "c-cache": "e-done" }, { FlagsA: "features {beta: true}" },
            "<b>Conclusion.</b> A shallow copy duplicates <b>one level</b>. Anything nested is shared, so mutating it through one copy changes them all. Switch to the deep-copy variant to see the fix.");
        return frames;
    },
};

/* ---- Dependency injection container ---- */

VIZ["di-container"] = {
    title: "A container resolving an object graph with lifetimes",
    legend: [["lg-act", "building"], ["lg-done", "built"], ["lg-cmp", "reused from cache"], ["lg-out", "rejected"]],
    build() {
        const W = 860;
        const H = 330;
        const nodes = {
            Svc: { x: 30, y: 150, w: 210, h: 50, label: "OrderService" },
            Uow: { x: 330, y: 60, w: 200, h: 50, label: "UnitOfWork" },
            Clock: { x: 330, y: 240, w: 200, h: 50, label: "Clock" },
            Db: { x: 630, y: 60, w: 200, h: 50, label: "Database" },
            Cache: { x: 30, y: 30, w: 210, h: 50, label: "PricingCache" },
        };
        const edges = [
            { a: "Svc", b: "Uow", id: "s-u" },
            { a: "Svc", b: "Clock", id: "s-c" },
            { a: "Uow", b: "Db", id: "u-d" },
            { a: "Cache", b: "Uow", id: "cache-u" },
        ];
        const life = { Svc: "transient", Uow: "scoped", Clock: "singleton", Db: "singleton", Cache: "singleton" };
        const frames = [];
        const push = (scope, n, e, sub, note) =>
            frames.push({
                stage: scene(W, H, nodes, edges, { n: { Cache: "hide", ...n }, e: { "cache-u": "hide", ...e }, sub: { ...life, ...sub }, caps: [[W - 20, 22, scope, "end"]] }),
                note,
            });
        push("request 1", { Svc: "n-act" }, {}, {}, "<code>scope.resolve(OrderService)</code> in request 1. It's <b>transient</b>, so a new one is built every time. Its constructor needs a <code>UnitOfWork</code> and a <code>Clock</code>.");
        push("request 1", { Svc: "n-act", Uow: "n-act" }, { "s-u": "e-act" }, {}, "<code>UnitOfWork</code> is <b>scoped</b>, and this scope hasn't built one yet. It needs a <code>Database</code>.");
        push("request 1", { Svc: "n-act", Uow: "n-act", Db: "n-done" }, { "s-u": "e-act", "u-d": "e-act" }, { Db: "singleton: built once" }, "<code>Database</code> is a <b>singleton</b> that doesn't exist yet, so the container builds it once and caches it on the <em>container</em>.");
        push("request 1", { Svc: "n-act", Uow: "n-done", Db: "n-done" }, { "s-u": "e-done", "u-d": "e-done" }, { Uow: "scoped: cached in request 1" }, "The <code>UnitOfWork</code> is finished and cached in <em>this scope</em>.");
        push("request 1", { Svc: "n-act", Uow: "n-done", Db: "n-done", Clock: "n-done" }, { "s-u": "e-done", "u-d": "e-done", "s-c": "e-act" }, {}, "<code>Clock</code> is another singleton: built once, cached.");
        push("request 1", { Svc: "n-done", Uow: "n-done", Db: "n-done", Clock: "n-done" }, { "s-u": "e-done", "u-d": "e-done", "s-c": "e-done" }, {}, "Every dependency is ready, so <code>OrderService</code> is built. The whole graph was assembled from the registrations.");
        push("request 1", { Svc: "n-act", Uow: "n-cmp", Db: "n-cmp", Clock: "n-cmp" }, { "s-u": "e-act", "s-c": "e-act" }, { Svc: "transient: new again", Uow: "same instance (scope)" },
            "A second <code>resolve(OrderService)</code> in the same request: a <em>new</em> service, but the <b>same</b> unit of work, clock and database.");
        push("request 2", { Svc: "n-act", Uow: "n-act", Db: "n-cmp", Clock: "n-cmp" }, { "s-u": "e-act", "u-d": "e-act", "s-c": "e-act" }, { Uow: "new scope: new instance" },
            "Request 2 has a new scope, so it gets a <b>fresh</b> unit of work. The singletons are still shared.");
        push("startup check", { Cache: "n-out", Uow: "n-out" }, { "cache-u": "e-act" }, { Cache: "singleton", Uow: "scoped" },
            "A singleton <code>PricingCache</code> that wants a scoped <code>UnitOfWork</code> is a <b>captive dependency</b>: it would keep request 1's unit of work forever. The container refuses at startup.");
        push("", { Svc: "n-done", Uow: "n-done", Db: "n-done", Clock: "n-done" }, { "s-u": "e-done", "u-d": "e-done", "s-c": "e-done" }, {},
            "<b>Conclusion.</b> A container is a factory driven by registrations, plus <b>lifetime caches</b>: per application, per scope, or none. Its most valuable feature is refusing illegal lifetimes before the first request.");
        return frames;
    },
};

/* ---- Bridge ---- */

VIZ["bridge-matrix"] = {
    title: "Two hierarchies: classes add, combinations multiply",
    legend: [["lg-act", "new combinations"], ["lg-done", "works already"], ["lg-cmp", "one call path"], ["lg-out", "inheritance cost"]],
    build() {
        const frames = [];
        const grid = (abs, imps, fresh = new Set(), focus = null) => {
            const rows = [["", ...imps], ...abs.map((a) => [a, ...imps.map(() => "\u2713")])];
            const marks = {};
            rows[0].forEach((_, c) => (marks[`0,${c}`] = "is-head"));
            rows.forEach((_, r) => (marks[`${r},0`] = "is-head"));
            for (let r = 1; r < rows.length; r++) {
                for (let c = 1; c < rows[0].length; c++) {
                    const key = `${r},${c}`;
                    marks[key] = focus === key ? "is-cmp" : fresh.has(key) ? "is-act" : "is-done";
                }
            }
            return dataGridHTML(rows, marks);
        };
        const counts = (classes, combos, inherit) =>
            rowHTML("classes", [{ t: `${classes} with Bridge`, c: "is-done" }, { t: `${combos} combinations`, c: "is-cmp" }, { t: `${inherit} with a subclass each`, c: "is-out" }]);
        const push = (abs, imps, fresh, note, focus = null) =>
            frames.push({ stage: stackHTML(counts(abs.length + imps.length, abs.length * imps.length, abs.length * imps.length), grid(abs, imps, fresh, focus)), note });
        const col = (rows, c) => new Set(Array.from({ length: rows }, (_, i) => `${i + 1},${c}`));
        const row = (r, cols) => new Set(Array.from({ length: cols }, (_, i) => `${r},${i + 1}`));

        push(["Alert", "Digest"], ["Email", "SMS"], new Set(), "Rows are <b>abstractions</b> (what clients use). Columns are <b>implementors</b> (channels). Each cell is a combination that works because the abstraction holds a channel.");
        push(["Alert", "Digest"], ["Email", "SMS", "Slack"], col(2, 3), "Add <code>SlackChannel</code>: <b>one</b> class, and it immediately works with every notification type.");
        push(["Alert", "Digest", "Reminder"], ["Email", "SMS", "Slack"], row(3, 3), "Add <code>Reminder</code>: <b>one</b> class, and it immediately works on every channel.");
        push(["Alert", "Digest", "Reminder"], ["Email", "SMS", "Slack", "WhatsApp"], col(3, 4), "Add WhatsApp: one class, three new combinations. Seven classes now cover twelve combinations.");
        push(["Alert", "Digest", "Reminder"], ["Email", "SMS", "Slack", "WhatsApp"], new Set(), "One cell, traced: <code>Alert.notify()</code> builds a subject and body, trims them with <code>fit()</code>, and calls the primitive <code>SmsChannel.send(to, subject, body)</code>.", "1,2");
        push(["Alert", "Digest", "Reminder"], ["Email", "SMS", "Slack", "WhatsApp"], new Set(),
            "<b>Conclusion.</b> Bridge keeps two dimensions of change in two hierarchies joined by a small set of primitives. Classes grow as <b>M + N</b> while the combinations grow as M &times; N, for free.");
        return frames;
    },
};

/* ---- Composite ---- */

VIZ["composite-tree"] = {
    title: "price() on a bundle of bundles",
    legend: [["lg-act", "asking children"], ["lg-done", "answered"], ["lg-idle", "waiting"], ["lg-out", "rejected"]],
    build() {
        const W = 860;
        const H = 330;
        const nodes = {
            Kit: { x: 300, y: 20, w: 260, h: 50, label: "Bundle \"Starter kit\" \u221210%" },
            Keyboard: { x: 60, y: 140, w: 220, h: 46, label: "Product \"Keyboard\"" },
            Audio: { x: 470, y: 140, w: 260, h: 46, label: "Bundle \"Audio\" \u22125%" },
            Headset: { x: 330, y: 260, w: 220, h: 46, label: "Product \"Headset\"" },
            Stand: { x: 610, y: 260, w: 220, h: 46, label: "Product \"Stand\"" },
        };
        const edges = [
            { a: "Kit", b: "Keyboard" },
            { a: "Kit", b: "Audio" },
            { a: "Audio", b: "Headset" },
            { a: "Audio", b: "Stand" },
            { a: "Audio", b: "Kit", id: "cycle", dash: true, label: "add(kit)?" },
        ];
        const frames = [];
        const push = (n, e, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, e: { cycle: "hide", ...e }, sub }), note });
        push({ Kit: "n-act" }, {}, {}, "The client calls <code>kit.price()</code>. It doesn't know, or care, that the kit contains another bundle.");
        push({ Kit: "n-act", Keyboard: "n-done" }, { "Kit>Keyboard": "e-act" }, { Keyboard: "25.00" }, "The bundle asks each child the <b>same question</b>. A product, a leaf, answers directly: <code>25.00</code>.");
        push({ Kit: "n-act", Keyboard: "n-done", Audio: "n-act" }, { "Kit>Audio": "e-act" }, { Keyboard: "25.00" }, "The second child is itself a bundle, so it asks <em>its</em> children. The recursion goes one level deeper.");
        push({ Kit: "n-act", Keyboard: "n-done", Audio: "n-act", Headset: "n-done" }, { "Audio>Headset": "e-act" }, { Keyboard: "25.00", Headset: "30.00" }, "Headset: <code>30.00</code>.");
        push({ Kit: "n-act", Keyboard: "n-done", Audio: "n-act", Headset: "n-done", Stand: "n-done" }, { "Audio>Stand": "e-act" }, { Keyboard: "25.00", Headset: "30.00", Stand: "13.20" }, "Stand: <code>13.20</code>.");
        push({ Kit: "n-act", Keyboard: "n-done", Audio: "n-done", Headset: "n-done", Stand: "n-done" }, { "Kit>Audio": "e-done" }, { Keyboard: "25.00", Headset: "30.00", Stand: "13.20", Audio: "0.95 \u00d7 43.20 = 41.04" },
            "With both children answered, the inner bundle applies its own rule: 5% off <code>43.20</code> is <code>41.04</code>. Children first, then the parent: <b>post-order</b>.");
        push({ Kit: "n-done", Keyboard: "n-done", Audio: "n-done", Headset: "n-done", Stand: "n-done" }, {}, { Keyboard: "25.00", Headset: "30.00", Stand: "13.20", Audio: "41.04", Kit: "0.9 \u00d7 66.04 = 59.44" },
            "The root does the same with its children's answers: 10% off <code>66.04</code> is <code>59.44</code>.");
        push({ Kit: "n-out", Audio: "n-out" }, { cycle: "e-act" }, { Audio: "would contain itself" },
            "Someone tries <code>audio.add(kit)</code>. The kit already contains Audio, so that would create a cycle and <code>price()</code> would never return. <code>add</code> rejects it.");
        push({}, {}, { Kit: "59.44" },
            "<b>Conclusion.</b> Leaves and groups answer the <b>same call</b>, so clients treat any subtree as a single item. Guard against cycles, and switch to an iterative walk when trees get very deep.");
        return frames;
    },
};

/* ---- Flyweight ---- */

VIZ["flyweight-share"] = {
    title: "Millions of markers, a handful of shared styles",
    legend: [["lg-act", "requested / created"], ["lg-cmp", "cache hit"], ["lg-done", "shared flyweight"], ["lg-out", "mutated: everyone affected"]],
    build() {
        const W = 860;
        const H = 340;
        const wants = ["pin/red", "pin/blue", "pin/red", "star/gold", "pin/red", "pin/blue"];
        const nodes = { Factory: { x: 330, y: 140, w: 180, h: 50, label: "marker_style()" } };
        wants.forEach((_, i) => (nodes[`M${i}`] = { x: 20, y: 14 + i * 52, w: 200, h: 38, label: `marker ${i + 1} (lat, lon)` }));
        const styles = { "pin/red": 40, "pin/blue": 140, "star/gold": 240 };
        Object.entries(styles).forEach(([s, y]) => (nodes[s] = { x: 610, y, w: 230, h: 46, label: `MarkerStyle ${s}` }));
        const edges = [];
        wants.forEach((s, i) => {
            edges.push({ a: `M${i}`, b: "Factory", id: `ask${i}` });
            edges.push({ a: `M${i}`, b: s, id: `ref${i}` });
        });
        Object.keys(styles).forEach((s) => edges.push({ a: "Factory", b: s, id: `mk-${s}` }));
        const frames = [];
        const hidden = () => {
            const e = {};
            edges.forEach((ed) => (e[edgeId(ed)] = "hide"));
            return e;
        };
        const created = new Set();
        const linked = [];
        const base = () => {
            const n = {};
            wants.forEach((_, i) => (n[`M${i}`] = i < linked.length ? "n-idle" : "hide"));
            Object.keys(styles).forEach((s) => (n[s] = created.has(s) ? "n-done" : "hide"));
            const e = hidden();
            linked.forEach((i) => (e[`ref${i}`] = "e-done"));
            return { n, e };
        };
        const caps = () => [[W - 20, 330, `markers: ${linked.length} \u00b7 style objects: ${created.size}`, "end"]];
        frames.push({ stage: scene(W, H, nodes, edges, { ...base(), caps: caps() }), note: "Each marker needs a style: an icon bitmap (~24 KB), a colour and a font. Most markers share one of a few styles." });
        wants.forEach((s, i) => {
            const hit = created.has(s);
            created.add(s);
            const { n, e } = base();
            n[`M${i}`] = "n-act";
            n.Factory = "n-act";
            n[s] = hit ? "n-cmp" : "n-act";
            e[`ask${i}`] = "e-act";
            e[`mk-${s}`] = hit ? "e-idle" : "e-act";
            linked.push(i);
            e[`ref${i}`] = "e-act";
            frames.push({
                stage: scene(W, H, nodes, edges, { n, e, caps: caps() }),
                note: hit
                    ? `Marker ${i + 1} asks for <code>${s}</code>: a <b>cache hit</b>. It gets a reference to the existing object, and no new icon is loaded.`
                    : `Marker ${i + 1} asks for <code>${s}</code>. It doesn't exist yet, so the factory creates it <b>once</b> and caches it.`,
            });
        });
        const end = base();
        frames.push({
            stage: scene(W, H, nodes, edges, { ...end, caps: [[W - 20, 330, "1,000,000 markers \u2192 3 styles (72 KB) + 17 MB of coordinates", "end"]] }),
            note: "Scale it up: a million markers still share three style objects. Each marker keeps only its <b>extrinsic</b> state: position, label and a reference."
        });
        const bad = base();
        bad.n["pin/red"] = "n-out";
        [0, 2, 4].forEach((i) => {
            bad.n[`M${i}`] = "n-out";
            bad.e[`ref${i}`] = "e-act";
        });
        frames.push({
            stage: scene(W, H, nodes, edges, { ...bad, label: { "pin/red": "MarkerStyle pin/YELLOW" }, caps: caps() }),
            note: "The trap: one marker sets <code>style.colour = \"yellow\"</code> to show it's selected. Every marker sharing that flyweight turns yellow."
        });
        frames.push({
            stage: scene(W, H, nodes, edges, { ...base(), caps: caps() }),
            note: "<b>Conclusion.</b> Flyweight shares <b>immutable intrinsic state</b> through a caching factory and leaves per-object state with the client. Freeze the flyweights, and keep \"selected\" and other per-object variation extrinsic."
        });
        return frames;
    },
};

/* ---- Template Method ---- */

VIZ["template-method"] = {
    title: "The base class runs the skeleton; the subclass fills the steps",
    legend: [["lg-act", "running now"], ["lg-done", "subclass step"], ["lg-cmp", "base-class default"], ["lg-out", "item failed"]],
    build() {
        const code = [
            "def run(self):                        # template method, @final",
            "    started = time.perf_counter()",
            "    self.before()                     # hook",
            "    for item in self.fetch():         # abstract step",
            "        try:",
            "            self.process(item)        # abstract step",
            "            ok += 1",
            "        except Exception as exc:",
            "            self.on_error(item, exc)  # hook",
            "    self.after(ok, failed)            # hook",
            "    return {\"ok\": ok, \"failed\": failed, \"ms\": ...}",
        ];
        const frames = [];
        const push = (line, who, cls, results, note) =>
            frames.push({
                stage: stackHTML(
                    codeHTML(code, line === null ? {} : { [line]: "is-act" }),
                    rowHTML("runs", [{ t: who, c: cls }]),
                    rowHTML("rows", results)
                ),
                note,
            });
        const rows = (states) => ["A-1,9.99", "bad row", "B-2,4.50"].map((t, i) => ({ t, c: states[i] || "" }));
        push(null, "PriceImport(...).run()", "is-act", rows([]), "<code>PriceImport</code> only defines <code>fetch</code>, <code>process</code> and <code>after</code>. Calling <code>run()</code> starts the base class's skeleton.");
        push(1, "BatchJob.run (base)", "is-cmp", rows([]), "The timing bookkeeping belongs to the base class. No subclass can forget it.");
        push(2, "BatchJob.before (default: no-op)", "is-cmp", rows([]), "<code>before()</code> is a <b>hook</b>. <code>PriceImport</code> didn't override it, so the base's empty default runs.");
        push(3, "PriceImport.fetch", "is-done", rows([]), "<code>fetch()</code> is <b>abstract</b>: every job must supply it. Control passes down to the subclass.");
        push(5, "PriceImport.process", "is-done", rows(["is-done"]), "Row 1 is processed by the subclass: <code>A-1</code> costs 999 pence.");
        push(5, "PriceImport.process", "is-done", rows(["is-done", "is-out"]), "Row 2 can't be parsed, and <code>process</code> raises...");
        push(8, "BatchJob.on_error (default)", "is-cmp", rows(["is-done", "is-out"]), "...and the <b>base class</b> catches it and calls the <code>on_error</code> hook. Error isolation is part of the skeleton, so one bad row can't stop the job.");
        push(5, "PriceImport.process", "is-done", rows(["is-done", "is-out", "is-done"]), "Row 3 succeeds. The loop is the base class's, and the work inside it is the subclass's.");
        push(9, "PriceImport.after (override)", "is-done", rows(["is-done", "is-out", "is-done"]), "<code>after()</code> is a hook this subclass <em>did</em> override, to print a summary.");
        push(10, "BatchJob.run (base)", "is-cmp", rows(["is-done", "is-out", "is-done"]), "The base class returns the result: <code>{ok: 2, failed: 1, ms: \u2026}</code>.");
        push(null, "BatchJob + PriceImport", "is-act", rows(["is-done", "is-out", "is-done"]),
            "<b>Conclusion.</b> The <b>order</b> of steps, error handling and timing are fixed in one place, and subclasses only fill in the steps. That's the Hollywood principle: the base class calls you.");
        return frames;
    },
};

/* ---- Iterator: lazy, pull-based pipelines ---- */

VIZ["iterator-lazy"] = {
    title: "take(2, map(square, filter(is_even, source))) pulls one value at a time",
    legend: [["lg-act", "pulled now"], ["lg-done", "passed on"], ["lg-out", "rejected"], ["lg-idle", "never computed"]],
    build() {
        const source = [1, 2, 3, 4, 5, 6, 7, 8];
        const state = { src: {}, filt: [], mapped: [], out: [] };
        const frames = [];
        let reads = 0;
        const push = (note, act = {}) => {
            const srcChips = source.map((v, i) => ({ t: String(v), c: act.src === i ? "is-act" : state.src[i] || "is-ghost" }));
            frames.push({
                stage: stackHTML(
                    rowHTML("source", srcChips),
                    rowHTML("filter even", state.filt.length ? state.filt.map((v) => ({ t: String(v), c: act.filt === v ? "is-act" : "is-done" })) : [{ t: "\u2014", c: "is-ghost" }]),
                    rowHTML("map square", state.mapped.length ? state.mapped.map((v) => ({ t: String(v), c: act.map === v ? "is-act" : "is-done" })) : [{ t: "\u2014", c: "is-ghost" }]),
                    rowHTML("take 2 \u2192 out", state.out.length ? state.out.map((v) => ({ t: String(v), c: "is-done" })) : [{ t: "\u2014", c: "is-ghost" }]),
                    rowHTML("reads", [{ t: `source items read: ${reads}`, c: "is-cmp" }])
                ),
                note,
            });
        };
        push("Nothing has run yet. Building the pipeline creates three generator objects, but no values are computed until someone asks.");
        const pull = (i) => {
            reads++;
            state.src[i] = source[i] % 2 === 0 ? "is-done" : "is-out";
        };
        pull(0);
        push("The consumer asks <code>take</code> for a value. <code>take</code> asks <code>map</code>, <code>map</code> asks <code>filter</code>, and <code>filter</code> asks the source: <code>1</code>.", { src: 0 });
        push("<code>1</code> is odd, so <code>filter</code> rejects it and pulls again, without the consumer having to do anything.");
        pull(1);
        state.filt.push(2);
        push("The source yields <code>2</code>. It passes the filter.", { src: 1, filt: 2 });
        state.mapped.push(4);
        push("<code>map</code> squares it: <code>4</code>.", { map: 4 });
        state.out.push(4);
        push("<code>take</code> hands <code>4</code> to the consumer. Every stage is now paused at its <code>yield</code>, holding its place.");
        pull(2);
        push("The consumer asks for the next value. The source yields <code>3</code>, and the filter rejects it.", { src: 2 });
        pull(3);
        state.filt.push(4);
        state.mapped.push(16);
        push("<code>4</code> passes the filter and is squared to <code>16</code>.", { src: 3, filt: 4, map: 16 });
        state.out.push(16);
        push("<code>take</code> has its two values, so it <b>stops</b>, and stops pulling from everything upstream.");
        push("<b>Conclusion.</b> Lazy iterators do <b>only the work the consumer asks for</b>: 4 of 8 source items were read, and items 5 to 8 were never computed. The same pipeline over a billion-row file, or an infinite generator, uses constant memory.");
        return frames;
    },
};

/* ---- Mediator ---- */

VIZ["mediator-hub"] = {
    title: "Five form fields: a web of links, or one hub?",
    legend: [["lg-act", "change in flight"], ["lg-done", "updated"], ["lg-cmp", "the coordinator"], ["lg-idle", "a dependency"]],
    options: [
        { value: "mesh", label: "Peers talk to each other" },
        { value: "hub", label: "Peers talk to a mediator" },
    ],
    build(option = "mesh") {
        const W = 860;
        const H = 330;
        const ids = ["Country", "Postcode", "Shipping", "Tax", "Total"];
        const nodes = {
            Country: { x: 355, y: 14, w: 150, h: 42, label: "country" },
            Postcode: { x: 660, y: 110, w: 150, h: 42, label: "postcode" },
            Shipping: { x: 560, y: 270, w: 150, h: 42, label: "shipping" },
            Tax: { x: 150, y: 270, w: 150, h: 42, label: "tax" },
            Total: { x: 50, y: 110, w: 150, h: 42, label: "total" },
            Hub: { x: 345, y: 140, w: 170, h: 50, label: "CheckoutForm" },
        };
        const frames = [];

        if (option === "hub") {
            const edges = ids.map((id) => ({ a: id, b: "Hub", id }));
            const push = (n, e, caps, note) => frames.push({ stage: scene(W, H, nodes, edges, { n: { Hub: "n-cmp", ...n }, e, caps }), note });
            const count = [[W - 20, 322, "links: 5", "end"]];
            push({}, {}, count, "Every field knows exactly one other object: the mediator. Five fields, five links.");
            push({ Country: "n-act" }, { Country: "e-act" }, count, "The user picks Germany. The country field does the only thing it knows: it tells the mediator it changed.");
            push({ Hub: "n-act", Shipping: "n-done" }, { Shipping: "e-act" }, count, "The mediator holds the rules. Express isn't offered in Germany, so shipping falls back to standard.");
            push({ Hub: "n-act", Shipping: "n-done", Tax: "n-done" }, { Tax: "e-act" }, count, "The tax rate becomes 19%.");
            push({ Hub: "n-act", Shipping: "n-done", Tax: "n-done", Postcode: "n-done" }, { Postcode: "e-act" }, count, "Postcode validation switches to German rules.");
            push({ Hub: "n-act", Shipping: "n-done", Tax: "n-done", Postcode: "n-done", Total: "n-done" }, { Total: "e-act" }, count, "The total is recalculated. Every reaction lives in one method you can read top to bottom.");
            push({}, {}, count, "<b>Conclusion.</b> A mediator turns a web of N(N\u22121)/2 links into N, and makes each field reusable on any form. The cost is that the mediator gathers all the interaction rules, so keep it organised, for example as a rule table.");
            return frames;
        }

        const edges = [];
        ids.forEach((a, i) => ids.slice(i + 1).forEach((b) => edges.push({ a, b, id: `${a}-${b}` })));
        const push = (n, e, caps, note) => frames.push({ stage: scene(W, H, nodes, edges, { n: { Hub: "hide", ...n }, e, caps }), note });
        const count = [[W - 20, 322, "links: 10", "end"]];
        push({}, {}, count, "Five fields that affect each other, wired directly. Every pair may need a link: 5 \u00d7 4 / 2 = 10.");
        push({ Country: "n-act", Shipping: "n-done" }, { "Country-Shipping": "e-act" }, count, "The user picks Germany. The country field itself must know to update the shipping options...");
        push({ Country: "n-act", Shipping: "n-done", Tax: "n-done" }, { "Country-Tax": "e-act" }, count, "...and the tax line...");
        push({ Country: "n-act", Shipping: "n-done", Tax: "n-done", Postcode: "n-done" }, { "Country-Postcode": "e-act" }, count, "...and the postcode validator.");
        push({ Shipping: "n-act", Tax: "n-act", Total: "n-done" }, { "Shipping-Total": "e-act", "Tax-Total": "e-act" }, count, "Shipping and tax each tell the total to recalculate, so it recalculates twice. The order of updates now matters.");
        push({}, {}, count, "<b>Conclusion.</b> In a mesh every field depends on its neighbours, so none of them can be reused, and the rules are scattered across five classes. Switch to the hub variant to see the alternative.");
        return frames;
    },
};

/* ---- Memento ---- */

VIZ["memento-history"] = {
    title: "Opaque snapshots in a bounded history",
    legend: [["lg-act", "just changed"], ["lg-done", "editor state"], ["lg-cmp", "restored from"], ["lg-out", "dropped (limit 3)"]],
    build() {
        const frames = [];
        let text = "";
        const history = [];
        let n = 0;
        const push = (action, note, marks = {}) =>
            frames.push({
                stage: stackHTML(
                    rowHTML("action", [{ t: action, c: action === "\u2014" ? "is-ghost" : "is-act" }]),
                    panesHTML([
                        { title: "Editor (originator)", items: [{ text: `text: "${text}"`, cls: marks.editor || "is-done" }] },
                        {
                            title: "History (caretaker, max 3)",
                            items: history.map((h) => ({ text: `\uD83D\uDD12 snapshot #${h.id}`, cls: marks[h.id] || "" })),
                            empty: "no snapshots",
                        },
                    ])
                ),
                note,
            });
        const checkpoint = () => history.push({ id: ++n, text });
        push("\u2014", "The editor is the <b>originator</b>: only it knows its fields. The history is the <b>caretaker</b>: it stores snapshots but can't read them.");
        checkpoint();
        push("checkpoint()", "<code>editor.save()</code> returns an opaque memento, and the history stores it. The lock means the history can't look inside.", { 1: "is-act" });
        text = "Hello";
        push("type(\"Hello\")", "The user types. The editor's state changes, and the snapshot doesn't.", { editor: "is-act" });
        checkpoint();
        text = "Hello, world";
        push("checkpoint(); type(\", world\")", "Another checkpoint, then more typing.", { 2: "is-act", editor: "is-act" });
        checkpoint();
        text = "Hello, world!";
        push("checkpoint(); type(\"!\")", "A third snapshot. The history now holds three.", { 3: "is-act", editor: "is-act" });
        checkpoint();
        push("checkpoint()", "A fourth snapshot exceeds the limit of 3. The <b>oldest</b> is dropped, which keeps memory bounded.", { 1: "is-out", 4: "is-act" });
        history.shift();
        push("\u2014", "Snapshot #1 is gone. You can undo three steps, not forever.");
        const last = history.pop();
        text = last.text;
        push("undo()", `The history pops snapshot #${last.id} and passes it back to <code>editor.restore()</code>. Only the editor can read it, so the editor's internals can change freely.`, { editor: "is-cmp" });
        const prev = history.pop();
        text = prev.text;
        push("undo()", `Undo again: snapshot #${prev.id} restores <code>"${prev.text}"</code>.`, { editor: "is-cmp" });
        push("\u2014", "<b>Conclusion.</b> Memento keeps <b>encapsulation</b> while saving state: the caretaker stores opaque snapshots, and only the originator reads them. Bound the history, and make state immutable so each snapshot can be a cheap shared reference.");
        return frames;
    },
};

/* ---- Visitor: double dispatch ---- */

VIZ["visitor-dispatch"] = {
    title: "Evaluate visiting 2 + x \u00d7 3, one dispatch at a time",
    legend: [["lg-act", "accept() called"], ["lg-cmp", "visit_*() running"], ["lg-done", "result"], ["lg-idle", "not yet"]],
    build() {
        const W = 860;
        const H = 345;
        const nodes = {
            Add: { x: 340, y: 20, w: 180, h: 46, label: "Add" },
            Num2: { x: 120, y: 140, w: 160, h: 46, label: "Num 2" },
            Mul: { x: 560, y: 140, w: 180, h: 46, label: "Mul" },
            Var: { x: 440, y: 260, w: 160, h: 46, label: "Var x" },
            Num3: { x: 680, y: 260, w: 160, h: 46, label: "Num 3" },
        };
        const edges = [
            { a: "Add", b: "Num2" },
            { a: "Add", b: "Mul" },
            { a: "Mul", b: "Var" },
            { a: "Mul", b: "Num3" },
        ];
        const frames = [];
        const push = (n, sub, call, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, sub, caps: [[20, 338, call, "start"]] }), note });
        push({}, {}, "expr.accept(Evaluate({x: 4}))", "One visitor, <code>Evaluate</code>, carrying the environment <code>{x: 4}</code>. The nodes have no <code>evaluate()</code> method, only <code>accept()</code>.");
        push({ Add: "n-act" }, {}, "Add.accept(v)", "First dispatch, on the <b>node</b>: <code>Add.accept(v)</code> runs because the node is an <code>Add</code>...");
        push({ Add: "n-cmp" }, {}, "\u2192 v.visit_add(add)", "...and it calls <code>v.visit_add(self)</code>. Second dispatch, on the <b>visitor</b>: the <code>Evaluate</code> version of <code>visit_add</code> runs.");
        push({ Add: "n-cmp", Num2: "n-act" }, {}, "Num.accept(v) \u2192 v.visit_num", "<code>visit_add</code> evaluates its left child the same way: <code>accept</code>, then <code>visit_num</code>.");
        push({ Add: "n-cmp", Num2: "n-done" }, { Num2: "2" }, "visit_num \u2192 2", "<code>visit_num</code> returns the literal: <code>2</code>.");
        push({ Add: "n-cmp", Num2: "n-done", Mul: "n-cmp" }, { Num2: "2" }, "Mul.accept(v) \u2192 v.visit_mul", "The right child is a <code>Mul</code>, so the two dispatches land in <code>visit_mul</code>.");
        push({ Add: "n-cmp", Num2: "n-done", Mul: "n-cmp", Var: "n-done" }, { Num2: "2", Var: "x = 4" }, "Var.accept(v) \u2192 v.visit_var", "<code>visit_var</code> looks <code>x</code> up in the visitor's own state: <code>4</code>. Visitors can carry context like this.");
        push({ Add: "n-cmp", Num2: "n-done", Mul: "n-cmp", Var: "n-done", Num3: "n-done" }, { Num2: "2", Var: "x = 4", Num3: "3" }, "Num.accept(v) \u2192 v.visit_num", "<code>3</code>.");
        push({ Add: "n-cmp", Num2: "n-done", Mul: "n-done", Var: "n-done", Num3: "n-done" }, { Num2: "2", Var: "4", Num3: "3", Mul: "4 \u00d7 3 = 12" }, "visit_mul \u2192 12", "<code>visit_mul</code> combines its children: <code>12</code>.");
        push({ Add: "n-done", Num2: "n-done", Mul: "n-done", Var: "n-done", Num3: "n-done" }, { Num2: "2", Mul: "12", Add: "2 + 12 = 14" }, "visit_add \u2192 14", "And <code>visit_add</code> returns <code>14</code>.");
        push({}, {}, "expr.accept(Show()) \u2192 \"(2 + x * 3)\"",
            "<b>Conclusion.</b> The same <code>accept</code> calls drive <em>any</em> visitor: a <code>Show</code> visitor walks the identical path and returns text. New operations are new visitors, but a new node type means a new method on every visitor.");
        return frames;
    },
};

/* ---- Interpreter ---- */

VIZ["interpreter-eval"] = {
    title: "Evaluating plan == \"pro\" and (seats > 5 or not trial)",
    legend: [["lg-act", "evaluating"], ["lg-done", "true"], ["lg-out", "false"], ["lg-idle", "skipped (short-circuit)"]],
    options: [
        { value: "pro", label: "Context: plan=pro, seats=3, trial=false" },
        { value: "free", label: "Context: plan=free, seats=40, trial=false" },
    ],
    build(option = "pro") {
        const W = 860;
        const H = 345;
        const nodes = {
            And: { x: 340, y: 16, w: 180, h: 46, label: "And" },
            Plan: { x: 60, y: 140, w: 260, h: 46, label: "Cmp plan == \"pro\"" },
            Or: { x: 560, y: 140, w: 160, h: 46, label: "Or" },
            Seats: { x: 360, y: 260, w: 220, h: 46, label: "Cmp seats > 5" },
            Not: { x: 640, y: 260, w: 200, h: 46, label: "Not(trial == true)" },
        };
        const edges = [
            { a: "And", b: "Plan" },
            { a: "And", b: "Or" },
            { a: "Or", b: "Seats" },
            { a: "Or", b: "Not" },
        ];
        const frames = [];
        const ctx = option === "free" ? "{plan: \"free\", seats: 40, trial: false}" : "{plan: \"pro\", seats: 3, trial: false}";
        const push = (n, sub, note) => frames.push({ stage: scene(W, H, nodes, edges, { n, sub, caps: [[20, 338, `ctx = ${ctx}`, "start"]] }), note });
        push({}, {}, "The rule text was parsed once into this tree of objects. Evaluating it is one recursive call, <code>evaluate(ctx)</code>, starting at the root.");
        push({ And: "n-act" }, {}, "<code>And.evaluate</code> asks its left child first.");
        if (option === "free") {
            push({ And: "n-act", Plan: "n-out" }, { Plan: "\"free\" == \"pro\" \u2192 false" }, "<code>plan</code> is <code>\"free\"</code>, so the comparison is <code>false</code>.");
            push({ And: "n-out", Plan: "n-out", Or: "n-ghost", Seats: "n-ghost", Not: "n-ghost" }, { Plan: "false", And: "false" },
                "<code>And</code> <b>short-circuits</b>: with a false left side, the right side can't change the answer, so it's never evaluated.");
            push({ And: "n-out", Plan: "n-out", Or: "n-ghost", Seats: "n-ghost", Not: "n-ghost" }, { And: "false", Seats: "never looked up", Not: "never looked up" },
                "Forty seats doesn't matter: the <code>Or</code> branch, and its context lookups, never ran. Put cheap, selective conditions first in a rule, just as you would in code.");
            push({ And: "n-out", Plan: "n-out", Or: "n-ghost", Seats: "n-ghost", Not: "n-ghost" }, { And: "false" },
                "<b>Conclusion.</b> Each node evaluates itself by evaluating its children, and non-terminals can stop early. The rule is data, so it can be stored, edited and audited without a deployment, and it can never run code it wasn't built from.");
            return frames;
        }
        push({ And: "n-act", Plan: "n-done" }, { Plan: "\"pro\" == \"pro\" \u2192 true" }, "<code>Cmp</code> is a terminal: it looks up <code>plan</code> in the context and compares: <code>true</code>.");
        push({ And: "n-act", Plan: "n-done", Or: "n-act" }, { Plan: "true" }, "The left side is true, so <code>And</code> must evaluate its right side: the <code>Or</code>.");
        push({ And: "n-act", Plan: "n-done", Or: "n-act", Seats: "n-out" }, { Plan: "true", Seats: "3 > 5 \u2192 false" }, "<code>seats &gt; 5</code> is <code>false</code>, so <code>Or</code> must try its right side.");
        push({ And: "n-act", Plan: "n-done", Or: "n-act", Seats: "n-out", Not: "n-act" }, { Plan: "true", Seats: "false", Not: "trial == true \u2192 false" }, "<code>Not</code> evaluates its child: <code>trial == true</code> is <code>false</code>...");
        push({ And: "n-act", Plan: "n-done", Or: "n-act", Seats: "n-out", Not: "n-done" }, { Plan: "true", Seats: "false", Not: "not false \u2192 true" }, "...and negates it: <code>true</code>.");
        push({ And: "n-act", Plan: "n-done", Or: "n-done", Seats: "n-out", Not: "n-done" }, { Plan: "true", Seats: "false", Not: "true", Or: "false or true \u2192 true" }, "<code>Or</code>: <code>true</code>.");
        push({ And: "n-done", Plan: "n-done", Or: "n-done", Seats: "n-out", Not: "n-done" }, { Plan: "true", Or: "true", And: "true \u2192 flag ON" }, "<code>And</code>: both sides true. The feature flag is on for this account.");
        push({}, { And: "true" },
            "<b>Conclusion.</b> Each node evaluates itself by evaluating its children: Composite plus recursion. The rule is data, so it can be stored, edited and audited without a deployment, and it can never run code it wasn't built from. Try the other context to see short-circuiting.");
        return frames;
    },
};

/* ---- Unit of Work ---- */

VIZ["unit-of-work"] = {
    title: "transfer(a \u2192 b, 30): tracked in memory, committed once",
    legend: [["lg-act", "this step"], ["lg-cmp", "identity-map hit"], ["lg-done", "written / committed"], ["lg-out", "failed / rolled back"]],
    options: [
        { value: "commit", label: "Everything succeeds" },
        { value: "fail", label: "A step fails" },
    ],
    build(option = "commit") {
        const frames = [];
        const db = { a: 100, b: 0 };
        const map = {};
        const dirty = new Set();
        const sql = [];
        const push = (action, note, marks = {}) =>
            frames.push({
                stage: stackHTML(
                    rowHTML("step", [{ t: action, c: marks.step || "is-act" }]),
                    panesHTML([
                        { title: "Identity map (objects)", items: Object.entries(map).map(([k, v]) => ({ text: `Account ${k}: ${v}`, cls: marks[k] || "" })), empty: "nothing loaded" },
                        { title: "Unit of work: dirty", items: [...dirty].map((k) => ({ text: `Account ${k}`, cls: "is-act" })), empty: "no changes" },
                        {
                            title: "Database",
                            items: [...Object.entries(db).map(([k, v]) => ({ text: `${k} = ${v}`, cls: marks.db || "" })), ...sql.map((s) => ({ text: s, cls: marks.sql || "is-done" }))],
                        },
                    ])
                ),
                note,
            });
        push("with uow:", "A unit of work starts. Nothing is loaded, and the database holds the committed balances.");
        map.a = 100;
        push("uow.accounts.get(\"a\")", "The repository loads account <code>a</code> into the <b>identity map</b>.", { a: "is-act" });
        map.b = 0;
        push("uow.accounts.get(\"b\")", "And account <code>b</code>.", { b: "is-act" });
        if (option === "fail") {
            push("a.withdraw(130)", "The domain rejects the withdrawal: <code>insufficient funds</code>. The exception leaves the <code>with</code> block before <code>commit()</code>...", { a: "is-out", step: "is-out" });
            Object.keys(map).forEach((k) => delete map[k]);
            push("__exit__ \u2192 rollback()", "...so <code>__exit__</code> rolls back. Nothing was written, so there's nothing to undo in the database, and the in-memory objects are thrown away.", { db: "is-done", step: "is-out" });
            push("\u2014", "<b>Conclusion.</b> A failure anywhere in the use case leaves the database exactly as it was. All-or-nothing is the <b>default</b>, not something each handler has to remember.", { step: "is-out" });
            return frames;
        }
        map.a = 70;
        dirty.add("a");
        push("a.withdraw(30)", "The domain object changes <em>in memory</em>, and the unit of work marks it dirty. The database hasn't been touched.", { a: "is-act" });
        map.b = 30;
        dirty.add("b");
        push("b.deposit(30)", "Account <code>b</code> changes in memory too.", { b: "is-act" });
        push("uow.accounts.get(\"a\")", "Asking for <code>a</code> again returns the <b>same object</b>, balance 70, with no second query. Two copies can't disagree.", { a: "is-cmp" });
        sql.push("BEGIN", "UPDATE a = 70", "UPDATE b = 30");
        push("uow.commit()", "<code>commit()</code> writes every dirty object inside <b>one transaction</b>...", { sql: "is-act" });
        db.a = 70;
        db.b = 30;
        sql.push("COMMIT");
        dirty.clear();
        push("COMMIT", "...and commits. Both balances changed together.", { db: "is-done" });
        push("\u2014", "<b>Conclusion.</b> The domain code just changed objects. The unit of work tracked <b>what</b> changed and wrote it <b>once</b>, atomically, and the identity map kept one object per row.");
        return frames;
    },
};

/* ------------------------------------------------------------ viz player */

const mountViz = (root) => {
    const spec = VIZ[root.dataset.viz];
    if (!spec) return;

    const optValue = root.dataset.option;
    const optObj = spec.options ? spec.options.find((o) => o.value === optValue) : null;

    const head = document.createElement("div");
    head.className = "viz-head";
    const title = document.createElement("span");
    title.className = "viz-title";
    let defaultTitle = spec.title;
    if (optObj) {
        defaultTitle = `${optObj.label}, step by step`;
    }
    title.textContent = root.dataset.title || defaultTitle;
    const counter = document.createElement("span");
    counter.className = "viz-step";
    head.append(title, counter);

    const stage = document.createElement("div");
    stage.className = "viz-stage";

    const note = document.createElement("div");
    note.className = "viz-note";

    const controls = document.createElement("div");
    controls.className = "viz-controls";

    const button = (label, cls = "") => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `viz-btn ${cls}`.trim();
        b.innerHTML = label;
        controls.append(b);
        return b;
    };

    const resetBtn = button("&#x21BA;");
    resetBtn.title = "Restart";
    const prevBtn = button("&#x2039;");
    prevBtn.title = "Previous step";
    const playBtn = button("Play", "is-primary");
    const nextBtn = button("&#x203A;");
    nextBtn.title = "Next step";

    const scrub = document.createElement("input");
    scrub.type = "range";
    scrub.className = "viz-scrub";
    scrub.min = "0";
    scrub.setAttribute("aria-label", "Step");
    controls.append(scrub);

    const speed = document.createElement("select");
    speed.className = "viz-select";
    speed.setAttribute("aria-label", "Speed");
    [["900", "0.5×"], ["450", "1×"], ["200", "2×"], ["80", "4×"]].forEach(([v, l]) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = l;
        if (v === "450") opt.selected = true;
        speed.append(opt);
    });
    controls.append(speed);

    let picker = null;
    if (spec.options && !optValue) {
        picker = document.createElement("select");
        picker.className = "viz-select";
        picker.setAttribute("aria-label", "Variant");
        spec.options.forEach(({ value, label }) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = label;
            picker.append(opt);
        });
        head.append(picker);
    }

    root.append(head, stage, note, controls);

    if (spec.legend) {
        const legend = document.createElement("div");
        legend.className = "viz-legend";
        legend.innerHTML = spec.legend.map(([cls, label]) => `<span class="${cls}">${label}</span>`).join("");
        root.append(legend);
    }

    let frames = [];
    let index = 0;
    let timer = null;

    const draw = () => {
        const frame = frames[index];
        if (!frame) return;
        stage.innerHTML = frame.stage;
        note.innerHTML = frame.note;
        counter.textContent = `step ${index + 1} / ${frames.length}`;
        scrub.value = String(index);
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === frames.length - 1;
    };

    const stop = () => {
        window.clearInterval(timer);
        timer = null;
        playBtn.textContent = "Play";
    };

    const play = () => {
        if (timer) return stop();
        if (index === frames.length - 1) index = 0;
        playBtn.textContent = "Pause";
        timer = window.setInterval(() => {
            if (index >= frames.length - 1) return stop();
            index += 1;
            draw();
        }, Number(speed.value));
    };

    const load = () => {
        stop();
        frames = spec.build(picker ? picker.value : root.dataset.option);
        index = 0;
        scrub.max = String(frames.length - 1);
        draw();
    };

    resetBtn.addEventListener("click", () => {
        stop();
        index = 0;
        draw();
    });
    prevBtn.addEventListener("click", () => {
        stop();
        index = Math.max(0, index - 1);
        draw();
    });
    nextBtn.addEventListener("click", () => {
        stop();
        index = Math.min(frames.length - 1, index + 1);
        draw();
    });
    playBtn.addEventListener("click", play);
    scrub.addEventListener("input", () => {
        stop();
        index = Number(scrub.value);
        draw();
    });
    speed.addEventListener("change", () => {
        if (timer) {
            stop();
            play();
        }
    });
    picker?.addEventListener("change", () => {
        if (!root.dataset.title && spec.options) {
            const curOpt = spec.options.find((o) => o.value === picker.value);
            if (curOpt) title.textContent = `${curOpt.label}, step by step`;
        }
        load();
    });

    load();

    if (!reduceMotion.matches && "IntersectionObserver" in window) {
        let autoplayed = false;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !autoplayed && index === 0) {
                        autoplayed = true;
                        play();
                    } else if (!entry.isIntersecting && timer) {
                        stop();
                    }
                });
            },
            { threshold: 0.55 }
        );
        observer.observe(root);
    }
};

document.querySelectorAll("[data-viz]").forEach(mountViz);

/* ------------------------------------------------ collapsible questions */

(() => {
    const TRIGGER = ".worked.is-collapsible > .worked-q, .worked.is-collapsible > b:first-child, .worked-arrow";
    const cards = [];

    const setOpen = (card, open) => {
        card.classList.toggle("is-open", open);
        card.querySelector(":scope > .worked-q").setAttribute("aria-expanded", String(open));
        const body = card.querySelector(":scope > .worked-body");
        if (open) body.removeAttribute("hidden");
        // "until-found" lets the browser's find-in-page reveal collapsed answers.
        else body.setAttribute("hidden", "until-found");
    };

    document.querySelectorAll(".worked").forEach((card, i) => {
        const question = card.querySelector(":scope > .worked-q");
        if (!question) return;
        const label = card.querySelector(":scope > b:first-child");
        const rest = [...card.childNodes].filter((node) => node !== question && node !== label);
        if (!rest.some((node) => node.nodeType === Node.ELEMENT_NODE || node.textContent.trim())) return;

        const body = document.createElement("div");
        body.className = "worked-body";
        body.id = `worked-body-${i}`;
        body.append(...rest);
        body.addEventListener("beforematch", () => setOpen(card, true));

        const arrow = document.createElement("span");
        arrow.className = "worked-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><line class="worked-arrow-v" x1="12" y1="5" x2="12" y2="19"></line></svg>';

        question.setAttribute("role", "button");
        question.tabIndex = 0;
        question.setAttribute("aria-controls", body.id);
        card.classList.add("is-collapsible");
        card.append(arrow, body);
        setOpen(card, false);
        cards.push(card);
    });

    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(TRIGGER);
        if (trigger && !e.target.closest("a")) {
            const card = trigger.closest(".worked");
            setOpen(card, !card.classList.contains("is-open"));
            return;
        }
        const action = e.target.closest("[data-course-action]")?.dataset.courseAction;
        if (action === "expand-all" || action === "collapse-all") {
            cards.forEach((card) => setOpen(card, action === "expand-all"));
        }
    });

    document.addEventListener("keydown", (e) => {
        if ((e.key !== "Enter" && e.key !== " ") || !e.target.matches(".worked.is-collapsible > .worked-q")) return;
        e.preventDefault();
        const card = e.target.closest(".worked");
        setOpen(card, !card.classList.contains("is-open"));
    });

    const openHashTarget = () => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const card = id && document.getElementById(id)?.closest(".worked.is-collapsible");
        if (card) setOpen(card, true);
    };
    openHashTarget();
    window.addEventListener("hashchange", openHashTarget);
})();

/* ------------------------------------------------- shared header behaviour */

(() => {
    const isAiUrl = () => {
        const href = window.location.href.toLowerCase();
        const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, "");
        const search = window.location.search.toLowerCase();
        const hash = window.location.hash.toLowerCase();

        if (
            href.startsWith("https://techtoday.click/ai") ||
            href.startsWith("https://www.techtoday.click/ai") ||
            href.startsWith("http://techtoday.click/ai") ||
            href.startsWith("http://www.techtoday.click/ai")
        ) {
            return true;
        }
        if (pathname === "/ai" || pathname.endsWith("/ai")) return true;
        if (search.includes("ai") || hash === "#ai") return true;
        return false;
    };

    const updateAiMenuVisibility = () => {
        const aiGroup = document.getElementById("ai-study-group");
        if (!aiGroup) return;
        if (isAiUrl()) {
            aiGroup.removeAttribute("hidden");
            aiGroup.style.display = "";
        } else {
            aiGroup.setAttribute("hidden", "");
            aiGroup.style.display = "none";
        }
    };

    updateAiMenuVisibility();
    window.addEventListener("popstate", updateAiMenuVisibility);
    window.addEventListener("hashchange", updateAiMenuVisibility);
})();

/* ------------------------------------------------ topic & part accordions */

// Move code-tab labels above code boxes so tab-bar never cramps on narrow viewports
document.querySelectorAll(".code-tabs").forEach((wrap) => {
    let label = wrap.querySelector(".tab-bar .tab-label");
    if (!label && wrap.dataset.label) {
        label = document.createElement("span");
        label.textContent = wrap.dataset.label;
    }
    if (label && wrap.parentNode) {
        label.className = "code-tab-label";
        wrap.parentNode.insertBefore(label, wrap);
    }
});

// Topic & Inner Part Accordion Interactive Logic
(() => {
    const toggleCard = (card, headerSelector, forceOpen = null) => {
        if (!card) return;
        const header = card.querySelector(headerSelector);
        const willOpen = forceOpen !== null ? forceOpen : card.classList.contains("is-collapsed");
        card.classList.toggle("is-collapsed", !willOpen);
        if (header) {
            header.setAttribute("aria-expanded", String(willOpen));
        }
    };

    const openAndScrollTo = (targetId) => {
        if (!targetId) return;
        const cleanId = targetId.startsWith("#") ? targetId.slice(1) : targetId;
        const target = document.getElementById(decodeURIComponent(cleanId));
        if (!target) return;

        // Expand part if target is a part or inside a part
        const part = target.closest(".part-section");
        if (part) {
            toggleCard(part, ".part-header", true);
        }

        // Expand topic
        const section = target.closest(".topic-section");
        if (section) {
            toggleCard(section, ".topic-header", true);
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
        } else {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Click handler for topic and part headers
    document.addEventListener("click", (e) => {
        if (e.target.closest(".headerlink")) return;

        const partHeader = e.target.closest(".part-header");
        if (partHeader) {
            const part = partHeader.closest(".part-section");
            toggleCard(part, ".part-header");
            return;
        }

        const topicHeader = e.target.closest(".topic-header");
        if (topicHeader) {
            const section = topicHeader.closest(".topic-section");
            toggleCard(section, ".topic-header");
            return;
        }

        const link = e.target.closest("a");
        if (link) {
            const href = link.getAttribute("href");
            if (href && href.startsWith("#") && href.length > 1) {
                openAndScrollTo(href);
            }
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const partHeader = e.target.closest(".part-header");
            if (partHeader) {
                e.preventDefault();
                const part = partHeader.closest(".part-section");
                toggleCard(part, ".part-header");
                return;
            }

            const topicHeader = e.target.closest(".topic-header");
            if (topicHeader) {
                e.preventDefault();
                const section = topicHeader.closest(".topic-section");
                toggleCard(section, ".topic-header");
            }
        }
    });

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-course-action]");
        if (!btn) return;
        const action = btn.dataset.courseAction;
        if (action === "expand-all") {
            document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, ".topic-header", true));
            document.querySelectorAll(".part-section").forEach((p) => toggleCard(p, ".part-header", true));
        } else if (action === "collapse-all") {
            document.querySelectorAll(".topic-section").forEach((sec) => toggleCard(sec, ".topic-header", false));
            document.querySelectorAll(".part-section").forEach((p) => toggleCard(p, ".part-header", false));
        }
    });

    if (window.location.hash) {
        setTimeout(() => openAndScrollTo(window.location.hash), 150);
    }
    window.addEventListener("hashchange", () => openAndScrollTo(window.location.hash));
})();
