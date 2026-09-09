/* ==========================================================================
   TechToday - JavaScript study guide
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
    if (!toc || !article || !main) return null;

    const nav = document.createElement("nav");
    nav.className = "topic-menu";
    nav.setAttribute("aria-label", "Topics");

    const panel = document.createElement("details");
    panel.className = "topic-menu-panel";

    const summary = document.createElement("summary");
    summary.textContent = "Topics";

    const list = toc.cloneNode(true);
    panel.append(summary, list);
    nav.append(panel);
    main.classList.add("study-layout");
    main.prepend(nav);

    const links = [...list.querySelectorAll("a")];
    const sections = links
        .map((link) => {
            const id = decodeURIComponent(link.getAttribute("href") || "").slice(1);
            return { link, heading: document.getElementById(id) };
        })
        .filter((item) => item.heading);

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
        "deque defaultdict Counter heappush heappop heapify").split(" ")
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
const SH_KW = new Set(
    ("case do done elif else esac fi for function if in select then time until while export local " +
        "readonly return set unset source sudo").split(" ")
);
const SH_BUILTIN = new Set(
    ("echo cat grep awk sed cut sort uniq head tail wc curl node npm npx pnpm yarn deno bun nvm " +
        "tsc eslint prettier vite webpack esbuild rollup jest vitest git mkdir cd ls rm cp mv chmod " +
        "export watch xargs jq time").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python" || lang === "bash";
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

const LANG_LABEL = { python: "Python", javascript: "JavaScript", bash: "Shell", text: "Output" };
const LANG_KEY = "tt-javascript-lang";
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
    apply("javascript");
});

let storedLang = "javascript";
try {
    storedLang = localStorage.getItem(LANG_KEY) || "javascript";
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
   JavaScript widgets
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

/* ---- 1. Hoisting and the temporal dead zone ---- */

VIZ["hoisting"] = {
    title: "Hoisting - what exists before the first line runs",
    legend: [["lg-act", "line executing"], ["lg-done", "already run"], ["lg-out", "throws"], ["lg-idle", "not yet"]],
    build() {
        const src = [
            "greet();            // works",
            "console.log(nick);  // undefined",
            "console.log(age);   // ReferenceError",
            "",
            "var nick = 'Ada';",
            "let age = 36;",
            "",
            "function greet() {",
            "  console.log('hi');",
            "}",
        ];
        const f = [];
        const env = (items, out) =>
            panesHTML([
                { title: "Variable environment", items },
                { title: "Console", items: out, empty: "no output yet" },
            ]);

        f.push({
            stage: codeHTML(src) + env([], []),
            note: "Before any line runs, the engine walks the whole scope and <em>creates</em> every binding it finds. This is the <b>creation phase</b> - nothing has executed yet.",
        });
        f.push({
            stage: codeHTML(src, { 7: "is-cmp", 8: "is-cmp", 9: "is-cmp" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }], []),
            note: "Function <em>declarations</em> are hoisted whole - body included. <code>greet</code> is callable before its own definition appears.",
        });
        f.push({
            stage: codeHTML(src, { 4: "is-cmp" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-cmp" }], []),
            note: "<code>var nick</code> is hoisted too, but only the <em>name</em>. It is initialised to <code>undefined</code> right away.",
        });
        f.push({
            stage: codeHTML(src, { 5: "is-out" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-cmp" }, { text: "age → <TDZ>", cls: "is-out" }], []),
            note: "<code>let age</code> is hoisted as well - but left <em>uninitialised</em>. That gap is the <b>temporal dead zone</b>: the name exists and reading it is an error.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-act" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-cmp" }, { text: "age → <TDZ>", cls: "is-out" }], []),
            note: "Execution starts. Line 1 calls <code>greet()</code> - already fully hoisted, so it just works.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-done", 8: "is-act" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-cmp" }, { text: "age → <TDZ>", cls: "is-out" }], [{ text: "hi", cls: "is-done" }]),
            note: "The call runs the body and logs <code>hi</code>. Hoisting a declaration is why the call site can precede the definition.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-done", 1: "is-act" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-act" }, { text: "age → <TDZ>", cls: "is-out" }], [{ text: "hi", cls: "is-done" }, { text: "undefined", cls: "is-cmp" }]),
            note: "Line 2 reads <code>nick</code>. The binding exists with the placeholder value, so you get <code>undefined</code> - no error, just a silent wrong answer.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-done", 1: "is-done", 2: "is-out" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → undefined", cls: "is-cmp" }, { text: "age → <TDZ>", cls: "is-out" }], [{ text: "hi", cls: "is-done" }, { text: "undefined", cls: "is-cmp" }, { text: "ReferenceError: Cannot access 'age'", cls: "is-out" }]),
            note: "Line 3 touches <code>age</code> while it is still in the TDZ. <code>let</code> turns the silent bug into a loud <b>ReferenceError</b>.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-done", 1: "is-done", 2: "is-done", 4: "is-act" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → 'Ada'", cls: "is-act" }, { text: "age → <TDZ>", cls: "is-out" }], [{ text: "hi", cls: "is-done" }, { text: "undefined", cls: "is-cmp" }, { text: "ReferenceError", cls: "is-out" }]),
            note: "Had the program survived, line 5 is where the <em>assignment</em> finally happens. Declarations hoist; assignments never do.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-done", 1: "is-done", 2: "is-done", 4: "is-done", 5: "is-act" }) + env([{ text: "greet → ƒ (complete)", cls: "is-done" }, { text: "nick → 'Ada'", cls: "is-done" }, { text: "age → 36", cls: "is-done" }], [{ text: "hi", cls: "is-done" }, { text: "undefined", cls: "is-cmp" }, { text: "ReferenceError", cls: "is-out" }]),
            note: "Line 6 leaves the TDZ and initialises <code>age</code>. <b>The rule:</b> declare with <code>const</code>/<code>let</code> above first use and hoisting never bites you.",
        });
        return f;
    },
};

/* ---- 2. Scope chain ---- */

VIZ["scope-chain"] = {
    title: "The scope chain - how a name is resolved",
    legend: [["lg-act", "scope being searched"], ["lg-done", "match found"], ["lg-out", "not here"], ["lg-idle", "not searched"]],
    build() {
        const src = [
            "const tax = 0.2;            // global",
            "",
            "function invoice(total) {   // outer",
            "  const fee = 5;",
            "",
            "  function line() {         // inner",
            "    const label = 'total';",
            "    return label + (total + fee) * (1 + tax);",
            "  }",
            "  return line();",
            "}",
        ];
        const scopes = (a, b, c) =>
            panesHTML([
                { title: "inner: line()", items: [{ text: "label = 'total'", cls: c }] },
                { title: "outer: invoice()", items: [{ text: "total = 100", cls: b }, { text: "fee = 5", cls: b }] },
                { title: "global", items: [{ text: "tax = 0.2", cls: a }, { text: "invoice = ƒ", cls: "" }] },
            ]);
        const f = [];
        f.push({
            stage: codeHTML(src, { 7: "is-act" }) + scopes("", "", ""),
            note: "Line 8 mentions four names: <code>label</code>, <code>total</code>, <code>fee</code>, <code>tax</code>. Each one is resolved <em>separately</em>, and always from the inside out.",
        });
        f.push({
            stage: codeHTML(src, { 6: "is-cmp", 7: "is-act" }) + scopes("", "", "is-done"),
            note: "<code>label</code>: found in the innermost scope on the first hop. The search stops immediately - nothing outer is consulted.",
        });
        f.push({
            stage: codeHTML(src, { 7: "is-act" }) + scopes("", "", "is-out"),
            note: "<code>total</code>: not in <code>line()</code>. Miss. The engine follows the link to the enclosing scope.",
        });
        f.push({
            stage: codeHTML(src, { 2: "is-cmp", 7: "is-act" }) + scopes("", "is-done", "is-out"),
            note: "<code>total</code> is a parameter of <code>invoice</code> - found one level out. Parameters live in the function scope like any other binding.",
        });
        f.push({
            stage: codeHTML(src, { 3: "is-cmp", 7: "is-act" }) + scopes("", "is-done", "is-out"),
            note: "<code>fee</code>: same hop, same hit. This chain is fixed by <em>where the code is written</em>, not who called it - that is <b>lexical scoping</b>.",
        });
        f.push({
            stage: codeHTML(src, { 7: "is-act" }) + scopes("", "is-out", "is-out"),
            note: "<code>tax</code>: miss in <code>line()</code>, miss in <code>invoice()</code>. One more hop remains.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-cmp", 7: "is-act" }) + scopes("is-done", "is-out", "is-out"),
            note: "Found in global scope. Had it missed here too, the result is <code>ReferenceError: tax is not defined</code> - the chain has no further link.",
        });
        f.push({
            stage: codeHTML(src, { 7: "is-done", 9: "is-act" }) + scopes("is-done", "is-done", "is-done"),
            note: "<b>The takeaway:</b> lookups only ever go <em>outward</em>. An outer scope can never see into an inner one - which is exactly what makes closures safe.",
        });
        return f;
    },
};

/* ---- 3. Closures ---- */

VIZ["closure"] = {
    title: "A closure - the scope that outlived its call",
    legend: [["lg-act", "executing"], ["lg-done", "kept alive"], ["lg-out", "popped"], ["lg-idle", "waiting"]],
    build() {
        const src = [
            "function makeCounter() {",
            "  let n = 0;",
            "  return () => ++n;",
            "}",
            "",
            "const next = makeCounter();",
            "next();  // 1",
            "next();  // 2",
        ];
        const view = (stack, heap, out) =>
            panesHTML([
                { title: "Call stack", stack: true, items: stack, empty: "empty" },
                { title: "Heap", items: heap, empty: "nothing retained" },
                { title: "Result", items: out, empty: "-" },
            ]);
        const f = [];
        f.push({
            stage: codeHTML(src, { 5: "is-act" }) + view([], [], []),
            note: "Calling <code>makeCounter()</code>. A fresh execution context is about to be pushed.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-act", 5: "is-act" }) + view([{ text: "makeCounter()", cls: "is-act" }], [], []),
            note: "The frame is on the stack. Its local environment will hold <code>n</code>.",
        });
        f.push({
            stage: codeHTML(src, { 1: "is-act" }) + view([{ text: "makeCounter()  { n: 0 }", cls: "is-act" }], [{ text: "env#1 { n: 0 }", cls: "is-cmp" }], []),
            note: "<code>let n = 0</code> creates the binding. The environment itself lives on the <em>heap</em> - the stack frame only points at it.",
        });
        f.push({
            stage: codeHTML(src, { 2: "is-act" }) + view([{ text: "makeCounter()", cls: "is-act" }], [{ text: "env#1 { n: 0 }", cls: "is-cmp" }, { text: "ƒ arrow → env#1", cls: "is-act" }], []),
            note: "The arrow function is created and <b>captures a reference to env#1</b>, not a copy of <code>n</code>. That link is the closure.",
        });
        f.push({
            stage: codeHTML(src, { 5: "is-done" }) + view([], [{ text: "env#1 { n: 0 }", cls: "is-done" }, { text: "next → env#1", cls: "is-done" }], []),
            note: "<code>makeCounter</code> returns and its frame is <b>popped</b> - yet <code>env#1</code> survives, because the returned function still references it. Nothing else can reach <code>n</code>.",
        });
        f.push({
            stage: codeHTML(src, { 6: "is-act", 2: "is-act" }) + view([{ text: "next()", cls: "is-act" }], [{ text: "env#1 { n: 0 → 1 }", cls: "is-act" }, { text: "next → env#1", cls: "is-done" }], [{ text: "1", cls: "is-done" }]),
            note: "First call: <code>++n</code> resolves <code>n</code> through the captured environment, mutates it to <code>1</code>, returns it.",
        });
        f.push({
            stage: codeHTML(src, { 7: "is-act", 2: "is-act" }) + view([{ text: "next()", cls: "is-act" }], [{ text: "env#1 { n: 1 → 2 }", cls: "is-act" }, { text: "next → env#1", cls: "is-done" }], [{ text: "1", cls: "is-cmp" }, { text: "2", cls: "is-done" }]),
            note: "Second call hits the <em>same</em> environment - hence <code>2</code>. State persists between calls without a single global variable.",
        });
        f.push({
            stage: codeHTML(src, { 5: "is-cmp" }) + view([], [{ text: "env#1 { n: 2 }", cls: "is-done" }, { text: "env#2 { n: 0 }", cls: "is-cmp" }], [{ text: "independent", cls: "is-cmp" }]),
            note: "Call <code>makeCounter()</code> again and you get <code>env#2</code> - a brand new <code>n</code>. <b>One closure per call</b>, which is what makes this a factory rather than a singleton.",
        });
        return f;
    },
};
/* ---- 4. this binding ---- */

VIZ["this-binding"] = {
    title: "What is `this`?",
    legend: [["lg-act", "call site"], ["lg-done", "this resolves here"], ["lg-out", "surprise"], ["lg-idle", "inert"]],
    options: [
        { value: "method", label: "Method call - the object before the dot" },
        { value: "lost", label: "A detached method - how `this` gets lost" },
        { value: "explicit", label: "call / apply / bind - forcing `this`" },
        { value: "new", label: "`new` - `this` is the fresh object" },
        { value: "arrow", label: "Arrow functions - `this` from the enclosing scope" },
    ],
    build(option) {
        const mode = option || "method";
        const box = (title, items, empty) => ({ title, items, empty });
        const f = [];

        if (mode === "method") {
            const src = [
                "const user = {",
                "  name: 'Ada',",
                "  hello() {",
                "    return `hi ${this.name}`;",
                "  },",
                "};",
                "",
                "user.hello();  // 'hi Ada'",
            ];
            f.push({ stage: codeHTML(src, { 7: "is-act" }), note: "The rule to internalise: <code>this</code> is decided by <b>how the function is called</b>, not where it was written." });
            f.push({
                stage: codeHTML(src, { 7: "is-act" }) + panesHTML([box("Call site", [{ text: "user.hello()", cls: "is-act" }]), box("Receiver (before the dot)", [{ text: "user", cls: "is-done" }]), box("this", [{ text: "{ name: 'Ada' }", cls: "is-done" }])]),
                note: "There is a dot, so JavaScript takes <em>whatever sits to the left of it</em> as the receiver: <code>user</code>.",
            });
            f.push({
                stage: codeHTML(src, { 3: "is-act" }) + panesHTML([box("Call site", [{ text: "user.hello()", cls: "is-cmp" }]), box("Receiver", [{ text: "user", cls: "is-done" }]), box("this.name", [{ text: "'Ada'", cls: "is-done" }])]),
                note: "Inside the body <code>this.name</code> reads through that receiver. Result: <code>'hi Ada'</code>.",
            });
        }

        if (mode === "lost") {
            const src = [
                "const user = { name: 'Ada', hello() { return this.name; } };",
                "",
                "const fn = user.hello;   // no dot any more",
                "fn();                    // undefined (or TypeError)",
                "",
                "setTimeout(user.hello, 0);  // same problem",
            ];
            f.push({ stage: codeHTML(src, { 2: "is-act" }), note: "Assigning the method to a variable copies the <em>function</em>. The object is not attached to it - functions do not remember their home." });
            f.push({
                stage: codeHTML(src, { 3: "is-out" }) + panesHTML([box("Call site", [{ text: "fn()", cls: "is-out" }]), box("Receiver", [], "nothing before the dot"), box("this", [{ text: "undefined (strict) / globalThis", cls: "is-out" }])]),
                note: "A plain call has no receiver. In modules and classes (always strict) <code>this</code> is <code>undefined</code>, so <code>this.name</code> throws <b>TypeError</b>.",
            });
            f.push({
                stage: codeHTML(src, { 5: "is-out" }) + panesHTML([box("Call site", [{ text: "timer invokes it", cls: "is-out" }]), box("Receiver", [], "the timer, not user"), box("this", [{ text: "undefined", cls: "is-out" }])]),
                note: "Passing a method as a callback is the same bug wearing a different hat - the callback is eventually called <em>without</em> the dot.",
            });
            f.push({
                stage: codeHTML(["const fn = user.hello.bind(user);", "fn();  // 'Ada'", "", "setTimeout(() => user.hello(), 0);"], { 0: "is-cmp", 3: "is-cmp" }) + panesHTML([box("Call site", [{ text: "bound / wrapped", cls: "is-done" }]), box("Receiver", [{ text: "user", cls: "is-done" }]), box("this", [{ text: "{ name: 'Ada' }", cls: "is-done" }])]),
                note: "Two fixes: <code>bind</code> the receiver permanently, or wrap the call in an arrow so the dot survives. <b>Prefer the arrow</b> - it reads better and allocates less.",
            });
        }

        if (mode === "explicit") {
            const src = [
                "function greet(greeting) {",
                "  return `${greeting}, ${this.name}`;",
                "}",
                "",
                "greet.call({ name: 'Ada' }, 'hi');    // args listed",
                "greet.apply({ name: 'Ada' }, ['hi']); // args as array",
                "const bound = greet.bind({ name: 'Ada' });",
                "bound('hi');",
            ];
            f.push({ stage: codeHTML(src, { 0: "is-act" }), note: "<code>greet</code> is a free function - it has no object at all. Explicit binding supplies one at the call site." });
            f.push({
                stage: codeHTML(src, { 4: "is-act" }) + panesHTML([box("Method", [{ text: "call(thisArg, ...args)", cls: "is-act" }]), box("this", [{ text: "{ name: 'Ada' }", cls: "is-done" }]), box("Returns", [{ text: "'hi, Ada'", cls: "is-done" }])]),
                note: "<code>call</code> invokes immediately with the receiver as the first argument, then the arguments one by one.",
            });
            f.push({
                stage: codeHTML(src, { 5: "is-act" }) + panesHTML([box("Method", [{ text: "apply(thisArg, argsArray)", cls: "is-act" }]), box("this", [{ text: "{ name: 'Ada' }", cls: "is-done" }]), box("Returns", [{ text: "'hi, Ada'", cls: "is-done" }])]),
                note: "<code>apply</code> is identical except the arguments arrive as an array. Spread has made it largely redundant: <code>greet.call(o, ...args)</code>.",
            });
            f.push({
                stage: codeHTML(src, { 6: "is-act", 7: "is-cmp" }) + panesHTML([box("Method", [{ text: "bind(thisArg)", cls: "is-act" }]), box("Produces", [{ text: "a NEW function", cls: "is-cmp" }]), box("this", [{ text: "permanently { name: 'Ada' }", cls: "is-done" }])]),
                note: "<code>bind</code> does <em>not</em> call - it returns a new function welded to that receiver. Binding twice does nothing: the first binding wins forever.",
            });
        }

        if (mode === "new") {
            const src = [
                "function User(name) {",
                "  // this = Object.create(User.prototype)  <- implicit",
                "  this.name = name;",
                "  // return this                           <- implicit",
                "}",
                "",
                "const u = new User('Ada');",
            ];
            f.push({ stage: codeHTML(src, { 6: "is-act" }), note: "<code>new</code> does four things in order. Watch each one." });
            f.push({
                stage: codeHTML(src, { 1: "is-act" }) + panesHTML([box("Step", [{ text: "1. create {}", cls: "is-act" }]), box("this", [{ text: "{}", cls: "is-cmp" }]), box("Prototype", [{ text: "→ User.prototype", cls: "is-cmp" }])]),
                note: "A fresh empty object is created and its internal prototype is set to <code>User.prototype</code>.",
            });
            f.push({
                stage: codeHTML(src, { 2: "is-act" }) + panesHTML([box("Step", [{ text: "2. run body with this = new object", cls: "is-act" }]), box("this", [{ text: "{ name: 'Ada' }", cls: "is-done" }]), box("Prototype", [{ text: "→ User.prototype", cls: "is-cmp" }])]),
                note: "The body runs with <code>this</code> bound to that object, so assignments land on the instance.",
            });
            f.push({
                stage: codeHTML(src, { 3: "is-act", 6: "is-cmp" }) + panesHTML([box("Step", [{ text: "3. return this implicitly", cls: "is-done" }]), box("u", [{ text: "User { name: 'Ada' }", cls: "is-done" }]), box("Gotcha", [{ text: "returning an object overrides it", cls: "is-out" }])]),
                note: "The object is returned automatically - <em>unless</em> the constructor explicitly returns some other object, in which case that one wins. <code>class</code> is this dance with guard rails.",
            });
        }

        if (mode === "arrow") {
            const src = [
                "const timer = {",
                "  label: 'tick',",
                "  startBad() {",
                "    setTimeout(function () {",
                "      console.log(this.label);  // undefined",
                "    }, 0);",
                "  },",
                "  startGood() {",
                "    setTimeout(() => {",
                "      console.log(this.label);  // 'tick'",
                "    }, 0);",
                "  },",
                "};",
            ];
            f.push({ stage: codeHTML(src, { 3: "is-act" }), note: "An arrow function has <b>no <code>this</code> of its own</b>. It is not 'auto-bound' - it simply has no binding, so the name resolves up the scope chain like any other variable." });
            f.push({
                stage: codeHTML(src, { 4: "is-out" }) + panesHTML([box("Callback kind", [{ text: "function () {}", cls: "is-out" }]), box("Own this?", [{ text: "yes - set by the caller", cls: "is-out" }]), box("Resolves to", [{ text: "undefined", cls: "is-out" }])]),
                note: "The classic function expression gets its own <code>this</code>, decided by whoever calls it - the timer. Result: <code>undefined</code>.",
            });
            f.push({
                stage: codeHTML(src, { 9: "is-cmp" }) + panesHTML([box("Callback kind", [{ text: "() => {}", cls: "is-done" }]), box("Own this?", [{ text: "no - looks outward", cls: "is-done" }]), box("Resolves to", [{ text: "timer", cls: "is-done" }])]),
                note: "The arrow finds <code>this</code> in the enclosing <code>startGood</code>, which was called as <code>timer.startGood()</code>. Result: <code>'tick'</code>.",
            });
            f.push({
                stage: codeHTML(["const obj = {", "  label: 'x',", "  bad: () => this.label,   // WRONG - no enclosing method", "};"], { 2: "is-out" }) + panesHTML([box("Enclosing scope", [{ text: "module top level", cls: "is-out" }]), box("this there", [{ text: "undefined / module.exports", cls: "is-out" }]), box("Rule", [{ text: "never arrow a method", cls: "is-out" }])]),
                note: "The mirror-image mistake: an arrow used <em>as</em> a method has nothing useful to inherit. <b>Arrows for callbacks, <code>method()</code> shorthand for methods.</b>",
            });
        }
        return f;
    },
};

/* ---- 5. Prototype chain ---- */

VIZ["prototype-chain"] = {
    title: "Property lookup walks the prototype chain",
    legend: [["lg-act", "searching here"], ["lg-done", "found"], ["lg-out", "miss"], ["lg-idle", "not reached"]],
    build() {
        const W = 660;
        const H = 290;
        const rows = [
            { y: 20, w: 220, label: "rex", sub: "own: { name: 'Rex' }" },
            { y: 85, w: 220, label: "Dog.prototype", sub: "bark()" },
            { y: 150, w: 220, label: "Animal.prototype", sub: "speak(), eat()" },
            { y: 215, w: 220, label: "Object.prototype", sub: "toString(), hasOwnProperty()" },
        ];
        const draw = (states, probe, hit) => {
            let s = "";
            rows.forEach((r, i) => {
                s += boxHTML(220, r.y, r.w, 44, r.label, states[i] || "n-idle", r.sub);
                if (i < rows.length - 1) s += arrowHTML(330, r.y + 44, 330, rows[i + 1].y - 2, states[i + 1] && states[i + 1] !== "n-idle" ? "e-act" : "e-idle", "");
            });
            s += capHTML(330, 285, "[[Prototype]] → null");
            if (probe) s += capHTML(110, 40, probe, "middle");
            if (hit) s += capHTML(560, 40, hit, "middle");
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw([]), note: "Every object holds a hidden link, <code>[[Prototype]]</code>, to another object. That column of links is the whole inheritance system - there are no classes underneath." });
        f.push({ stage: draw(["n-act"], "rex.name"), note: "Reading <code>rex.name</code>. The engine checks the object's <em>own</em> properties first." });
        f.push({ stage: draw(["n-done"], "rex.name", "'Rex' ✓"), note: "Hit on the first look. Own properties always shadow anything further down the chain." });
        f.push({ stage: draw(["n-out"], "rex.bark()"), note: "<code>bark</code> is not an own property of <code>rex</code>. Miss - follow the link." });
        f.push({ stage: draw(["n-out", "n-done"], "rex.bark()", "found on Dog ✓"), note: "Found on <code>Dog.prototype</code>. Methods live here, shared by <em>every</em> dog - which is why prototypes save memory." });
        f.push({ stage: draw(["n-out", "n-out"], "rex.speak()"), note: "<code>speak</code> misses on both the instance and <code>Dog.prototype</code>. Keep walking." });
        f.push({ stage: draw(["n-out", "n-out", "n-done"], "rex.speak()", "found on Animal ✓"), note: "Found two hops up. <code>class Dog extends Animal</code> is exactly this: it links <code>Dog.prototype</code> to <code>Animal.prototype</code>." });
        f.push({ stage: draw(["n-out", "n-out", "n-out", "n-done"], "rex.toString()", "found on Object ✓"), note: "Even <code>toString</code> comes from the chain. It ends at <code>Object.prototype</code>, whose own prototype is <code>null</code>." });
        f.push({ stage: draw(["n-out", "n-out", "n-out", "n-out"], "rex.fly", "undefined"), note: "A total miss returns <code>undefined</code> - not an error. Calling it does throw: <code>rex.fly is not a function</code>." });
        f.push({ stage: draw(["n-act", "n-idle", "n-idle", "n-idle"], "rex.bark = ƒ", "shadows Dog ⚠"), note: "<b>Writes never walk the chain.</b> Assigning always creates an <em>own</em> property, shadowing the inherited one for this object only." });
        return f;
    },
};

/* ---- 6. Call stack ---- */

VIZ["call-stack"] = {
    title: "The call stack - one thread, one pile of frames",
    legend: [["lg-act", "top frame"], ["lg-cmp", "waiting below"], ["lg-out", "unwinding"], ["lg-done", "returned"]],
    build() {
        const src = [
            "function total(items) {",
            "  return items.reduce((s, i) => s + price(i), 0);",
            "}",
            "function price(item) {",
            "  return taxed(item.net);",
            "}",
            "function taxed(net) {",
            "  return net * 1.2;",
            "}",
            "total(cart);",
        ];
        const view = (frames, out) =>
            panesHTML([
                { title: "Call stack", stack: true, items: frames, empty: "empty - the thread is idle" },
                { title: "Console", items: out, empty: "-" },
            ]);
        const f = [];
        f.push({ stage: codeHTML(src, { 9: "is-act" }) + view([], []), note: "The stack is empty. JavaScript has exactly <b>one</b> of these - one thread, one thing at a time." });
        f.push({ stage: codeHTML(src, { 0: "is-act", 9: "is-act" }) + view([{ text: "total(cart)", cls: "is-act" }], []), note: "Calling a function <em>pushes</em> a frame holding its arguments, locals and the return address." });
        f.push({ stage: codeHTML(src, { 1: "is-act" }) + view([{ text: "reduce callback", cls: "is-act" }, { text: "Array.reduce", cls: "is-cmp" }, { text: "total(cart)", cls: "is-cmp" }], []), note: "<code>reduce</code> and its callback are ordinary calls - they push frames too. Frames below are <em>frozen</em> until the top one returns." });
        f.push({ stage: codeHTML(src, { 3: "is-act" }) + view([{ text: "price(item)", cls: "is-act" }, { text: "reduce callback", cls: "is-cmp" }, { text: "Array.reduce", cls: "is-cmp" }, { text: "total(cart)", cls: "is-cmp" }], []), note: "Four deep. This pile, printed top to bottom, is precisely what a stack trace shows you." });
        f.push({ stage: codeHTML(src, { 6: "is-act" }) + view([{ text: "taxed(net)", cls: "is-act" }, { text: "price(item)", cls: "is-cmp" }, { text: "reduce callback", cls: "is-cmp" }, { text: "Array.reduce", cls: "is-cmp" }, { text: "total(cart)", cls: "is-cmp" }], []), note: "Five deep and about to return a number - the deepest point of this call." });
        f.push({ stage: codeHTML(src, { 7: "is-done", 4: "is-act" }) + view([{ text: "price(item)", cls: "is-act" }, { text: "reduce callback", cls: "is-cmp" }, { text: "Array.reduce", cls: "is-cmp" }, { text: "total(cart)", cls: "is-cmp" }], []), note: "<code>taxed</code> returns; its frame is <em>popped</em> and its locals become garbage. Control resumes exactly where it left off." });
        f.push({ stage: codeHTML(src, { 9: "is-done" }) + view([], [{ text: "84.00", cls: "is-done" }]), note: "Each return pops one frame until the stack is empty again and the value reaches the caller." });
        f.push({ stage: codeHTML(["function boom(n) { return boom(n + 1); }", "boom(1);"], { 0: "is-out" }) + panesHTML([{ title: "Call stack", stack: true, items: [{ text: "boom(11073)", cls: "is-out" }, { text: "boom(11072)", cls: "is-cmp" }, { text: "… ~11k frames", cls: "is-cmp" }], empty: "" }, { title: "Console", items: [{ text: "RangeError: Maximum call stack size exceeded", cls: "is-out" }] }]), note: "The stack is a <em>fixed-size</em> region. Recursion with no base case fills it and you get <b>RangeError</b> - the runtime refusing to overflow." });
        f.push({ stage: codeHTML(["setTimeout(() => step(n + 1), 0);"], { 0: "is-cmp" }) + panesHTML([{ title: "Call stack", stack: true, items: [{ text: "step(n)", cls: "is-act" }], empty: "" }, { title: "After the callback is queued", items: [{ text: "stack unwinds to empty", cls: "is-done" }] }]), note: "<b>The escape hatch:</b> deferring the next step through the event loop lets the stack drain between iterations, so depth never accumulates." });
        return f;
    },
};
/* ---- 7. The event loop ---- */

VIZ["event-loop"] = {
    title: "The event loop - why the order surprises you",
    legend: [["lg-act", "running now"], ["lg-cmp", "queued microtask"], ["lg-out", "queued macrotask"], ["lg-done", "printed"]],
    build() {
        const src = [
            "console.log('1 sync');",
            "",
            "setTimeout(() => console.log('4 timeout'), 0);",
            "",
            "Promise.resolve().then(() => console.log('3 micro'));",
            "",
            "console.log('2 sync');",
        ];
        const view = (stack, micro, macro, out) =>
            panesHTML([
                { title: "Call stack", stack: true, items: stack, empty: "empty" },
                { title: "Microtasks", items: micro, empty: "none" },
                { title: "Macrotasks", items: macro, empty: "none" },
                { title: "Console", items: out, empty: "-" },
            ]);
        const f = [];
        f.push({
            stage: codeHTML(src) + view([{ text: "run script", cls: "is-act" }], [], [], []),
            note: "The whole script is itself the first task. It runs top to bottom on the single call stack.",
        });
        f.push({
            stage: codeHTML(src, { 0: "is-act" }) + view([{ text: "console.log", cls: "is-act" }, { text: "run script", cls: "is-cmp" }], [], [], [{ text: "1 sync", cls: "is-done" }]),
            note: "Line 1 is synchronous: it runs and prints immediately.",
        });
        f.push({
            stage: codeHTML(src, { 2: "is-act" }) + view([{ text: "setTimeout", cls: "is-act" }, { text: "run script", cls: "is-cmp" }], [], [{ text: "() => log('4 timeout')", cls: "is-out" }], [{ text: "1 sync", cls: "is-done" }]),
            note: "<code>setTimeout</code> does <b>not</b> pause anything. It hands the callback to the host timer and returns instantly. <code>0</code> means <em>'as soon as allowed'</em>, not 'now'.",
        });
        f.push({
            stage: codeHTML(src, { 4: "is-act" }) + view([{ text: "Promise.then", cls: "is-act" }, { text: "run script", cls: "is-cmp" }], [{ text: "() => log('3 micro')", cls: "is-cmp" }], [{ text: "() => log('4 timeout')", cls: "is-out" }], [{ text: "1 sync", cls: "is-done" }]),
            note: "The promise is <em>already</em> resolved, so its callback goes straight onto the <b>microtask</b> queue - a separate, higher-priority queue.",
        });
        f.push({
            stage: codeHTML(src, { 6: "is-act" }) + view([{ text: "console.log", cls: "is-act" }, { text: "run script", cls: "is-cmp" }], [{ text: "() => log('3 micro')", cls: "is-cmp" }], [{ text: "() => log('4 timeout')", cls: "is-out" }], [{ text: "1 sync", cls: "is-done" }, { text: "2 sync", cls: "is-done" }]),
            note: "Line 7 prints second. <b>All synchronous code finishes before any queued callback runs</b> - that alone explains most ordering puzzles.",
        });
        f.push({
            stage: codeHTML(src, { 6: "is-done" }) + view([], [{ text: "() => log('3 micro')", cls: "is-cmp" }], [{ text: "() => log('4 timeout')", cls: "is-out" }], [{ text: "1 sync", cls: "is-done" }, { text: "2 sync", cls: "is-done" }]),
            note: "The script task ends and the stack empties. <em>Only now</em> does the event loop get a turn.",
        });
        f.push({
            stage: codeHTML(src, { 4: "is-cmp" }) + view([{ text: "() => log('3 micro')", cls: "is-act" }], [], [{ text: "() => log('4 timeout')", cls: "is-out" }], [{ text: "1 sync", cls: "is-done" }, { text: "2 sync", cls: "is-done" }, { text: "3 micro", cls: "is-done" }]),
            note: "Microtasks first. The loop drains the <em>entire</em> microtask queue before it will even look at a timer.",
        });
        f.push({
            stage: codeHTML(src, { 2: "is-cmp" }) + view([{ text: "() => log('4 timeout')", cls: "is-act" }], [], [], [{ text: "1 sync", cls: "is-done" }, { text: "2 sync", cls: "is-done" }, { text: "3 micro", cls: "is-done" }, { text: "4 timeout", cls: "is-done" }]),
            note: "Microtasks are empty, so one macrotask is taken. The <code>0 ms</code> timer runs <b>last</b> despite being registered first.",
        });
        f.push({
            stage: codeHTML(["queueMicrotask(function loop() {", "  queueMicrotask(loop);   // never yields", "});"], { 1: "is-out" }) + view([{ text: "loop", cls: "is-act" }], [{ text: "loop", cls: "is-out" }, { text: "loop", cls: "is-out" }, { text: "…forever", cls: "is-out" }], [{ text: "timer starves", cls: "is-out" }], [{ text: "page frozen", cls: "is-out" }]),
            note: "<b>The danger of that priority:</b> a microtask that queues another microtask never lets the loop reach rendering or timers. The tab locks up.",
        });
        f.push({
            stage: panesHTML([{ title: "One turn of the loop", items: [{ text: "1. run one macrotask", cls: "is-out" }, { text: "2. drain ALL microtasks", cls: "is-cmp" }, { text: "3. render (browser, ~60fps)", cls: "is-done" }, { text: "4. repeat", cls: "" }] }, { title: "Macrotask sources", items: ["setTimeout / setInterval", "I/O, DOM events", "MessageChannel"] }, { title: "Microtask sources", items: ["promise .then/.catch", "await resumption", "queueMicrotask()"] }]),
            note: "<b>Memorise this loop.</b> Every ordering question - promises vs timers, why a render is skipped, why an <code>await</code> resumes early - falls out of these four steps.",
        });
        return f;
    },
};

/* ---- 8. Promise states ---- */

VIZ["promise-states"] = {
    title: "A promise is a state machine with one transition",
    legend: [["lg-act", "current state"], ["lg-done", "fulfilled"], ["lg-out", "rejected"], ["lg-idle", "unreachable"]],
    build() {
        const W = 660;
        const H = 250;
        const draw = (p, ff, rr, caption) => {
            let s = "";
            s += boxHTML(40, 90, 150, 50, "pending", p, "no value yet");
            s += boxHTML(300, 30, 170, 50, "fulfilled", ff, "value = 42");
            s += boxHTML(300, 150, 170, 50, "rejected", rr, "reason = Error");
            s += arrowHTML(192, 105, 298, 62, ff !== "n-idle" ? "e-act" : "e-idle", "resolve(42)");
            s += arrowHTML(192, 126, 298, 168, rr !== "n-idle" ? "e-act" : "e-idle", "");
            s += capHTML(245, 200, "reject(err)");
            s += capHTML(555, 58, ".then runs");
            s += capHTML(555, 178, ".catch runs");
            if (caption) s += capHTML(330, 232, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw("n-act", "n-idle", "n-idle"), note: "A promise starts <b>pending</b>: the work is in flight and there is no value yet. Creating one starts the work <em>immediately</em> - promises are not lazy." });
        f.push({ stage: draw("n-act", "n-idle", "n-idle", "consumers attach and wait"), note: "You attach <code>.then</code>/<code>.catch</code> now, while it is still pending. They are just callbacks parked for later." });
        f.push({ stage: draw("n-out", "n-done", "n-idle", "settled - locked forever"), note: "<code>resolve(42)</code> moves it to <b>fulfilled</b>. This transition happens <em>at most once</em>: a settled promise can never change again." });
        f.push({ stage: draw("n-out", "n-done", "n-idle", "callbacks queued as microtasks"), note: "The registered <code>.then</code> callback is queued as a <b>microtask</b> - never called synchronously, even if the promise was already settled." });
        f.push({ stage: draw("n-out", "n-idle", "n-done", "the other branch"), note: "Had the work failed, <code>reject(err)</code> takes the lower path and <code>.catch</code> runs instead. Same machine, other exit." });
        f.push({
            stage: codeHTML(["fetchUser()", "  .then(u => u.id)      // returns a NEW promise", "  .then(id => load(id)) // a returned promise is awaited", "  .catch(err => null)   // handles ANY failure above", "  .finally(hideSpinner);"], { 1: "is-act" }) + draw("n-out", "n-done", "n-idle"),
            note: "Every <code>.then</code> returns a <b>new</b> promise, which is what makes chaining flat instead of nested. Returning a promise inside a <code>then</code> waits for it.",
        });
        f.push({
            stage: codeHTML(["fetchUser()", "  .then(u => u.id)", "  .then(id => load(id))", "  .catch(err => null)", "  .finally(hideSpinner);"], { 2: "is-out", 3: "is-cmp" }) + draw("n-out", "n-idle", "n-done"),
            note: "A rejection <em>skips</em> every <code>.then</code> until it finds a <code>.catch</code> - the same short-circuit as a <code>throw</code> travelling up a call stack.",
        });
        f.push({
            stage: codeHTML(["const p = fetchUser();   // starts NOW", "// ... 5 seconds pass ...", "p.then(render);          // still fine - value is replayed"], { 2: "is-cmp" }) + draw("n-out", "n-done", "n-idle", "attach late, still get the value"),
            note: "Because the state is stored, attaching a handler <em>after</em> settlement still works - the callback is simply queued at once. <b>An event you missed is gone; a promise you missed replays.</b>",
        });
        f.push({
            stage: codeHTML(["fetchUser();  // ⚠ no .catch, no await", "", "// → UnhandledPromiseRejection"], { 0: "is-out" }) + draw("n-out", "n-idle", "n-out", "nobody is listening"),
            note: "<b>The one rule to never break:</b> every promise chain must end in a <code>catch</code> or be <code>await</code>ed inside a <code>try</code>. An unhandled rejection crashes a Node process.",
        });
        return f;
    },
};

/* ---- 9. async / await ---- */

VIZ["async-await"] = {
    title: "await - a pause button built on microtasks",
    legend: [["lg-act", "executing"], ["lg-cmp", "suspended / queued"], ["lg-done", "finished"], ["lg-out", "waiting on I/O"]],
    build() {
        const src = [
            "async function load() {",
            "  console.log('A');",
            "  const r = await fetchUser();",
            "  console.log('C', r);",
            "  return r;",
            "}",
            "",
            "load();",
            "console.log('B');",
        ];
        const view = (stack, micro, out, extra) =>
            panesHTML([
                { title: "Call stack", stack: true, items: stack, empty: "empty" },
                { title: "Suspended", items: extra, empty: "none" },
                { title: "Microtasks", items: micro, empty: "none" },
                { title: "Console", items: out, empty: "-" },
            ]);
        const f = [];
        f.push({ stage: codeHTML(src, { 7: "is-act" }) + view([{ text: "load()", cls: "is-act" }], [], [], []), note: "An <code>async</code> function starts running <b>synchronously</b>, right away, like any other call. The <code>async</code> keyword changes only what it returns and where it may pause." });
        f.push({ stage: codeHTML(src, { 1: "is-act" }) + view([{ text: "load()", cls: "is-act" }], [], [{ text: "A", cls: "is-done" }], []), note: "Everything up to the first <code>await</code> runs immediately - <code>A</code> prints now." });
        f.push({ stage: codeHTML(src, { 2: "is-act" }) + view([{ text: "load()", cls: "is-act" }], [], [{ text: "A", cls: "is-done" }], [{ text: "fetchUser() in flight", cls: "is-out" }]), note: "<code>await</code> evaluates its operand, <code>fetchUser()</code>, which starts the request and returns a pending promise." });
        f.push({ stage: codeHTML(src, { 2: "is-cmp" }) + view([], [], [{ text: "A", cls: "is-done" }], [{ text: "load() paused at line 3", cls: "is-cmp" }]), note: "Now the trick: the function <b>suspends and returns</b>. Its frame leaves the stack, and <code>load()</code> hands its caller a pending promise. The thread is free - nothing is blocked." });
        f.push({ stage: codeHTML(src, { 8: "is-act" }) + view([{ text: "console.log('B')", cls: "is-act" }], [], [{ text: "A", cls: "is-done" }, { text: "B", cls: "is-done" }], [{ text: "load() paused", cls: "is-cmp" }]), note: "So the code <em>after</em> the call runs next: <code>B</code> prints before <code>C</code>. This is the ordering that trips people up." });
        f.push({ stage: codeHTML(src, { 2: "is-cmp" }) + view([], [{ text: "resume load() with r", cls: "is-cmp" }], [{ text: "A", cls: "is-done" }, { text: "B", cls: "is-done" }], [{ text: "load() paused", cls: "is-cmp" }]), note: "The fetch settles. The <em>continuation</em> - the rest of the function body - is queued as a <b>microtask</b>. It does not run instantly." });
        f.push({ stage: codeHTML(src, { 3: "is-act" }) + view([{ text: "load() resumed", cls: "is-act" }], [], [{ text: "A", cls: "is-done" }, { text: "B", cls: "is-done" }, { text: "C {…}", cls: "is-done" }], []), note: "The stack is empty, the loop drains microtasks, and <code>load</code> resumes at the exact line it left - locals intact." });
        f.push({ stage: codeHTML(src, { 4: "is-done" }) + view([], [], [{ text: "A", cls: "is-done" }, { text: "B", cls: "is-done" }, { text: "C {…}", cls: "is-done" }], [{ text: "load()'s promise → fulfilled(r)", cls: "is-done" }]), note: "<code>return r</code> <b>fulfils the promise that <code>load()</code> returned earlier</b>. An async function always returns a promise, never a bare value." });
        f.push({
            stage: codeHTML(["// serial - 600ms", "const a = await slow();  // 300ms", "const b = await slow();  // 300ms", "", "// parallel - 300ms", "const [a, b] = await Promise.all([slow(), slow()]);"], { 1: "is-out", 2: "is-out", 5: "is-done" }),
            note: "<b>The costly habit:</b> two independent awaits run one after the other. Start both promises first, then await together - same code, half the latency.",
        });
        return f;
    },
};

/* ---- 10. Promise combinators ---- */

VIZ["promise-concurrency"] = {
    title: "Running promises together",
    legend: [["lg-done", "fulfilled"], ["lg-out", "rejected"], ["lg-act", "settles the combinator"], ["lg-idle", "still running"]],
    options: [
        { value: "all", label: "Promise.all - all or nothing" },
        { value: "allsettled", label: "Promise.allSettled - always waits for everyone" },
        { value: "race", label: "Promise.race - first to settle, good or bad" },
        { value: "any", label: "Promise.any - first success" },
    ],
    build(option) {
        const mode = option || "all";
        const W = 640;
        const tasks = [
            { label: "A ✓ 100ms", end: 0.25, ok: true },
            { label: "B ✗ 200ms", end: 0.5, ok: false },
            { label: "C ✓ 400ms", end: 1.0, ok: true },
        ];
        const ticks = [{ at: 0, label: "0" }, { at: 0.25, label: "100ms" }, { at: 0.5, label: "200ms" }, { at: 1, label: "400ms" }];
        const frame = (now, states, resultLabel) =>
            timelineHTML(
                W,
                tasks.map((t, i) => ({
                    label: t.label,
                    marks: [{ at: 0, width: t.end, label: "", state: states[i] || "n-idle" }],
                })).concat([{ label: resultLabel ? "result" : "", marks: resultLabel ? [{ at: 0, width: Math.max(now, 0.02), label: resultLabel.text, state: resultLabel.state }] : [] }]),
                ticks,
                now
            );
        const f = [];
        f.push({ stage: frame(0, [], null), note: "Three requests are started <b>at the same moment</b>. The combinator does not start them - they were already running when you passed them in." });
        f.push({ stage: frame(0.25, ["n-done"], null), note: "At 100 ms <code>A</code> fulfils." });

        if (mode === "all") {
            f.push({ stage: frame(0.25, ["n-done"], null), note: "<code>Promise.all</code> is still pending - it needs <em>every</em> input to fulfil." });
            f.push({ stage: frame(0.5, ["n-done", "n-out"], { text: "rejects with B's error", state: "n-out" }), note: "At 200 ms <code>B</code> rejects. <code>all</code> rejects <b>immediately</b> with that one reason - it does not wait for C." });
            f.push({ stage: frame(1.0, ["n-done", "n-out", "n-done"], { text: "already rejected", state: "n-out" }), note: "<b>C still runs to completion</b> - rejecting does not cancel anything. Its result is simply discarded, and if it rejects too you get an unhandled rejection." });
            f.push({ stage: frame(1.0, ["n-done", "n-idle", "n-done"], { text: "[a, c] in input order", state: "n-done" }), note: "In the happy case you get an array in <b>input order</b>, not completion order, once the slowest one lands. Use it when you need all the data or none of it." });
        }
        if (mode === "allsettled") {
            f.push({ stage: frame(0.5, ["n-done", "n-out"], null), note: "<code>B</code> rejects at 200 ms - and <code>allSettled</code> shrugs. It <b>never rejects</b>; a failure is just another outcome to record." });
            f.push({ stage: frame(1.0, ["n-done", "n-out", "n-done"], { text: "settles at 400ms", state: "n-act" }), note: "It waits for the last one, always. Total time is the slowest input, no matter what." });
            f.push({
                stage: codeHTML(["[", "  { status: 'fulfilled', value: a },", "  { status: 'rejected',  reason: err },", "  { status: 'fulfilled', value: c },", "]"], { 2: "is-out" }),
                note: "You get a uniform record per input. <b>Use this for dashboards and batch jobs</b> - anywhere partial success is still useful.",
            });
        }
        if (mode === "race") {
            f.push({ stage: frame(0.25, ["n-done"], { text: "resolves with A", state: "n-done" }), note: "<code>race</code> settles with the <b>first promise to settle</b> - here A, after 100 ms. B and C keep running but are ignored." });
            f.push({ stage: frame(0.5, ["n-done", "n-out"], { text: "already settled", state: "n-done" }), note: "B's later rejection changes nothing. Note the sharp edge: had B been <em>first</em>, <code>race</code> would have <b>rejected</b> - it races errors too." });
            f.push({
                stage: codeHTML(["const timeout = ms => new Promise((_, rej) =>", "  setTimeout(() => rej(new Error('timeout')), ms));", "", "await Promise.race([fetchUser(), timeout(2000)]);"], { 3: "is-act" }),
                note: "<b>The classic use:</b> bolt a deadline onto anything. For real cancellation you still need <code>AbortController</code> - the losing fetch is not stopped by losing.",
            });
        }
        if (mode === "any") {
            f.push({ stage: frame(0.25, ["n-done"], { text: "resolves with A", state: "n-done" }), note: "<code>any</code> settles on the first <b>fulfilment</b>. A wins at 100 ms." });
            f.push({ stage: frame(0.5, ["n-done", "n-out"], { text: "rejections are ignored", state: "n-done" }), note: "Unlike <code>race</code>, a rejection does not settle it - errors are collected and set aside." });
            f.push({ stage: frame(1.0, ["n-out", "n-out", "n-out"], { text: "AggregateError", state: "n-out" }), note: "Only if <em>every</em> input rejects does <code>any</code> reject, with an <b>AggregateError</b> holding all the reasons. Use it for redundant mirrors: first one that works, wins." });
        }
        return f;
    },
};
/* ---- 11. Array iteration methods ---- */

VIZ["array-methods"] = {
    title: "Array methods, element by element",
    legend: [["lg-act", "current element"], ["lg-done", "kept / produced"], ["lg-out", "dropped"], ["lg-idle", "not visited"]],
    options: [
        { value: "map", label: "map - same length, each value transformed" },
        { value: "filter", label: "filter - a subset, values untouched" },
        { value: "reduce", label: "reduce - many values folded into one" },
        { value: "find", label: "find / some / every - the short-circuiting three" },
    ],
    build(option) {
        const mode = option || "map";
        const src = [3, 8, 2, 9, 4];
        const f = [];
        const dim = (upto) => {
            const m = {};
            src.forEach((_, i) => { if (i > upto) m[i] = "is-dim"; });
            return m;
        };

        if (mode === "map") {
            f.push({ stage: cellsHTML(src) + `<div class="pane-title">nums.map(n =&gt; n * 2)</div>`, note: "<code>map</code> builds a <b>new array of the same length</b>. The original is never touched." });
            const out = [];
            src.forEach((n, i) => {
                out.push(n * 2);
                const marks = { ...dim(i) };
                marks[i] = "is-active";
                f.push({
                    stage: cellsHTML(src, marks) + cellsHTML(out.concat(Array(src.length - out.length).fill("")), Object.fromEntries(out.map((_, j) => [j, j === i ? "is-done" : "is-cmp"]))),
                    note: `Element <code>${n}</code> at index <code>${i}</code> → callback returns <code>${n * 2}</code>, which is written to the <em>same index</em> of the output.`,
                });
            });
            f.push({ stage: cellsHTML(src, Object.fromEntries(src.map((_, i) => [i, "is-dim"]))) + cellsHTML(out, Object.fromEntries(out.map((_, i) => [i, "is-done"]))), note: "<b>Length in = length out, always.</b> If your callback has no <code>return</code>, you get an array of <code>undefined</code> - the single most common <code>map</code> bug." });
        }
        if (mode === "filter") {
            f.push({ stage: cellsHTML(src) + `<div class="pane-title">nums.filter(n =&gt; n &gt; 3)</div>`, note: "<code>filter</code> keeps the values as they are and decides only <em>whether</em> each survives - on the truthiness of the callback's return." });
            const out = [];
            src.forEach((n, i) => {
                const keep = n > 3;
                if (keep) out.push(n);
                const marks = { ...dim(i) };
                marks[i] = keep ? "is-done" : "is-out";
                f.push({
                    stage: cellsHTML(src, marks) + (out.length ? cellsHTML(out, Object.fromEntries(out.map((_, j) => [j, "is-done"]))) : ""),
                    note: keep
                        ? `<code>${n} > 3</code> is <b>true</b> → kept. Note it lands at output index <code>${out.length - 1}</code>, not <code>${i}</code>.`
                        : `<code>${n} > 3</code> is <b>false</b> → dropped. Indices in the result close up behind it.`,
                });
            });
            f.push({ stage: cellsHTML(out, Object.fromEntries(out.map((_, i) => [i, "is-done"]))), note: "<b>Output length ≤ input length</b>, and indices are renumbered. Chain it before <code>map</code> so the transform runs on fewer items." });
        }
        if (mode === "reduce") {
            f.push({ stage: cellsHTML(src) + panesHTML([{ title: "accumulator", items: [{ text: "0  (the seed)", cls: "is-cmp" }] }]), note: "<code>reduce</code> carries an <b>accumulator</b> across the whole array. Always pass the seed - without it the first element becomes the seed and an empty array throws." });
            let acc = 0;
            src.forEach((n, i) => {
                const before = acc;
                acc += n;
                const marks = { ...dim(i) };
                marks[i] = "is-active";
                f.push({
                    stage: cellsHTML(src, marks) + panesHTML([{ title: "accumulator", items: [{ text: `${before} + ${n} = ${acc}`, cls: "is-act" }] }]),
                    note: `The callback receives <code>(acc=${before}, value=${n})</code> and <b>returns the next accumulator</b>: <code>${acc}</code>. Forgetting that return is why <code>reduce</code> yields <code>undefined</code>.`,
                });
            });
            f.push({ stage: cellsHTML(src, Object.fromEntries(src.map((_, i) => [i, "is-done"]))) + panesHTML([{ title: "result", items: [{ text: String(acc), cls: "is-done" }] }]), note: "<b>reduce is the general case</b> - <code>map</code>, <code>filter</code> and <code>sum</code> are all reduces. Reach for it when the result is not an array of the same shape: a total, a lookup object, a grouping." });
        }
        if (mode === "find") {
            f.push({ stage: cellsHTML(src) + `<div class="pane-title">nums.find(n =&gt; n &gt; 5)</div>`, note: "These three stop early. That matters when the callback is expensive or the array is long." });
            f.push({ stage: cellsHTML(src, { 0: "is-out", 1: "is-dim", 2: "is-dim", 3: "is-dim", 4: "is-dim" }), note: "<code>3 > 5</code> is false - keep looking." });
            f.push({ stage: cellsHTML(src, { 0: "is-out", 1: "is-done", 2: "is-ghost", 3: "is-ghost", 4: "is-ghost" }), note: "<code>8 > 5</code> is true → <code>find</code> returns <b>8 immediately</b> and never visits indices 2-4. <code>findIndex</code> would return <code>1</code>." });
            f.push({ stage: cellsHTML(src, { 0: "is-out", 1: "is-done", 2: "is-ghost", 3: "is-ghost", 4: "is-ghost" }) + panesHTML([{ title: "some(n => n > 5)", items: [{ text: "true - stops at the first hit", cls: "is-done" }] }, { title: "every(n => n > 5)", items: [{ text: "false - stops at the first miss", cls: "is-out" }] }]), note: "<code>some</code> stops on the first <em>truthy</em>, <code>every</code> on the first <em>falsy</em>. Both are <code>find</code> with a boolean answer." });
            f.push({ stage: panesHTML([{ title: "Need the value", items: [{ text: "find", cls: "is-done" }] }, { title: "Need the position", items: [{ text: "findIndex / indexOf", cls: "is-cmp" }] }, { title: "Need yes/no", items: [{ text: "some / every / includes", cls: "is-act" }] }]), note: "<b>Pick by what you will do with the answer.</b> <code>filter(...)[0]</code> works but scans the whole array and allocates - use <code>find</code>." });
        }
        return f;
    },
};

/* ---- 12. Coercion and equality ---- */

VIZ["coercion"] = {
    title: "Comparing values",
    legend: [["lg-act", "step applied"], ["lg-done", "true"], ["lg-out", "false"], ["lg-cmp", "conversion"]],
    options: [
        { value: "loose", label: "== steps through the coercion algorithm" },
        { value: "strict", label: "=== compares without converting anything" },
        { value: "truthy", label: "Truthiness - what if() actually asks" },
    ],
    build(option) {
        const mode = option || "loose";
        const f = [];
        const row = (a, op, b, r) => panesHTML([{ title: "left", items: [{ text: a, cls: "is-act" }] }, { title: "operator", items: [{ text: op }] }, { title: "right", items: [{ text: b, cls: "is-act" }] }, { title: "result", items: [{ text: r, cls: r === "true" ? "is-done" : r === "false" ? "is-out" : "is-cmp" }] }]);

        if (mode === "loose") {
            f.push({ stage: row("0", "==", "'0'", "?"), note: "<code>==</code> allows the two sides to be <em>converted</em> until the types match. Here is the actual algorithm, step by step." });
            f.push({ stage: row("0 (number)", "==", "'0' (string)", "types differ"), note: "Step 1: are the types the same? No - number vs string. So coercion begins." });
            f.push({ stage: row("0 (number)", "==", "Number('0') → 0", "0 == 0"), note: "Step 2: when one side is a number and the other a string, the <b>string is converted to a number</b>. <code>'0'</code> becomes <code>0</code>." });
            f.push({ stage: row("0", "==", "0", "true"), note: "Now the types match and the values are equal → <code>true</code>. Perfectly logical, and almost never what you meant to ask." });
            f.push({ stage: row("null", "==", "undefined", "true"), note: "A hard-coded rule: <code>null</code> and <code>undefined</code> are loosely equal to <b>each other and to nothing else</b> - not even <code>0</code> or <code>''</code>." });
            f.push({ stage: row("[]", "==", "false", "?"), note: "Now the famous one. Both sides get converted, but not to what you expect." });
            f.push({ stage: row("[]", "==", "Number(false) → 0", "[] == 0"), note: "A boolean is always converted to a number first: <code>false</code> → <code>0</code>." });
            f.push({ stage: row("String([]) → ''", "==", "0", "'' == 0"), note: "An object is converted to a primitive via <code>valueOf</code>/<code>toString</code>. An empty array stringifies to the <b>empty string</b>." });
            f.push({ stage: row("Number('') → 0", "==", "0", "true"), note: "And <code>Number('')</code> is <code>0</code>. So <code>[] == false</code> is <b>true</b> - three conversions deep, which is exactly why nobody can predict it." });
            f.push({ stage: panesHTML([{ title: "Use ==", items: [{ text: "x == null  (null OR undefined)", cls: "is-done" }] }, { title: "Use === everywhere else", items: [{ text: "no conversions, no surprises", cls: "is-done" }] }, { title: "Never rely on", items: [{ text: "'' == 0, [] == false, '1' == true", cls: "is-out" }] }]), note: "<b>The practical rule:</b> always <code>===</code>, with the single idiomatic exception <code>x == null</code>, which is a deliberate shorthand for 'null or undefined'." });
        }
        if (mode === "strict") {
            f.push({ stage: row("0 (number)", "===", "'0' (string)", "false"), note: "<code>===</code> asks one question first: <b>are the types identical?</b> No → <code>false</code>, immediately. Nothing is converted." });
            f.push({ stage: row("2 (number)", "===", "2 (number)", "true"), note: "Same type, same value → <code>true</code>. For primitives that is the entire algorithm." });
            f.push({ stage: row("{a:1}", "===", "{a:1}", "false"), note: "Two objects are equal only if they are the <b>same object in memory</b>. Identical contents are irrelevant - this is reference equality." });
            f.push({ stage: row("NaN", "===", "NaN", "false"), note: "The one exception: <code>NaN</code> equals nothing, including itself. Test it with <code>Number.isNaN(x)</code> or <code>Object.is(x, NaN)</code>." });
            f.push({ stage: row("0", "===", "-0", "true"), note: "And the mirror exception: <code>0 === -0</code> is <code>true</code> even though they are distinguishable values. <code>Object.is</code> reports them as different - it is <code>===</code> with those two special cases repaired." });
        }
        if (mode === "truthy") {
            const falsy = ["false", "0", "-0", "0n", "''", "null", "undefined", "NaN"];
            f.push({ stage: panesHTML([{ title: "The 8 falsy values - memorise these", items: falsy.map((t) => ({ text: t, cls: "is-out" })) }]), note: "<code>if (x)</code> does not test for existence - it converts <code>x</code> to a boolean. <b>Eight values are falsy; literally everything else is truthy.</b>" });
            f.push({ stage: panesHTML([{ title: "Surprisingly truthy", items: [{ text: "'0'   (non-empty string)", cls: "is-done" }, { text: "'false'", cls: "is-done" }, { text: "[]    (empty array)", cls: "is-done" }, { text: "{}    (empty object)", cls: "is-done" }, { text: "function () {}", cls: "is-done" }] }]), note: "Every object is truthy, including empty arrays and objects. To test emptiness you must check <code>arr.length</code> or <code>Object.keys(o).length</code> yourself." });
            f.push({ stage: codeHTML(["if (count) render();      // ⚠ skips a legitimate 0", "if (name) greet();        // ⚠ skips a legitimate ''", "", "if (count !== undefined) render();", "if (name != null) greet();"], { 0: "is-out", 1: "is-out", 3: "is-cmp", 4: "is-cmp" }), note: "<b>The bug this causes:</b> valid values <code>0</code> and <code>''</code> are treated as missing. Test for what you actually mean." });
            f.push({ stage: codeHTML(["const port = input || 3000;   // 0 becomes 3000  ⚠", "const port = input ?? 3000;   // only null/undefined  ✓", "", "user.address?.city            // undefined instead of throwing"], { 0: "is-out", 1: "is-done", 3: "is-done" }), note: "<code>??</code> falls back only on <code>null</code>/<code>undefined</code>; <code>||</code> falls back on any falsy value. <b>Default with <code>??</code></b> unless you really do mean 'any falsy'." });
        }
        return f;
    },
};

/* ---- 13. References, copying and mutation ---- */

VIZ["copy-depth"] = {
    title: "Copying an object",
    legend: [["lg-act", "written to"], ["lg-done", "independent"], ["lg-out", "shared - mutation leaks"], ["lg-idle", "untouched"]],
    options: [
        { value: "assign", label: "Assignment - two names, one object" },
        { value: "shallow", label: "Spread - a new top level, shared insides" },
        { value: "deep", label: "structuredClone - fully independent" },
    ],
    build(option) {
        const mode = option || "assign";
        const W = 640;
        const H = 250;
        const draw = (aState, bState, topShared, innerShared, caption) => {
            let s = "";
            s += boxHTML(30, 40, 120, 40, "a", aState);
            s += boxHTML(30, 150, 120, 40, "b", bState);
            s += boxHTML(250, 40, 180, 44, "{ tags, name }", topShared ? "n-cmp" : "n-idle", "the outer object");
            if (!topShared) s += boxHTML(250, 146, 180, 44, "{ tags, name }", "n-done", "a separate outer object");
            s += boxHTML(490, 92, 120, 44, "['js']", innerShared ? "n-out" : "n-done", "the nested array");
            s += arrowHTML(152, 60, 248, 60, aState !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(152, 170, 248, topShared ? 74 : 168, bState !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(432, 66, 488, 100, innerShared ? "e-act" : "e-idle");
            if (!topShared) s += arrowHTML(432, 172, 488, 128, innerShared ? "e-act" : "e-idle");
            if (caption) s += capHTML(320, 232, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw("n-act", "n-idle", true, true, "const a = { name: 'x', tags: ['js'] }"), note: "A variable never holds an object - it holds a <b>reference</b> to one. The object itself lives on the heap." });

        if (mode === "assign") {
            f.push({ stage: draw("n-act", "n-act", true, true, "const b = a;"), note: "Assignment copies the <em>reference</em>, not the object. Two names, one object - nothing was duplicated." });
            f.push({ stage: draw("n-out", "n-act", true, true, "b.name = 'y'"), note: "Writing through <code>b</code> mutates the single shared object, so <code>a.name</code> is <code>'y'</code> too. This is how 'my state changed by itself' bugs are born." });
            f.push({ stage: draw("n-done", "n-done", true, true, "a === b → true"), note: "They are also <code>===</code>, which is a fast way to check whether two variables really are the same object. <b>When you want a copy, you must ask for one.</b>" });
        }
        if (mode === "shallow") {
            f.push({ stage: draw("n-act", "n-act", false, true, "const b = { ...a };"), note: "Spread (or <code>Object.assign({}, a)</code>) builds a <b>new outer object</b> and copies each own enumerable property into it." });
            f.push({ stage: draw("n-done", "n-done", false, true, "b.name = 'y'  →  a.name unchanged ✓"), note: "Top-level writes are now isolated - exactly what React state updates and reducers rely on." });
            f.push({ stage: draw("n-out", "n-out", false, true, "b.tags.push('ts')  →  a.tags changed ⚠"), note: "But the copied <em>property values</em> were references. The nested array is still <b>shared</b>, so mutating it is visible through both." });
            f.push({ stage: codeHTML(["const b = { ...a, tags: [...a.tags] };   // copy each level you touch", "const b = { ...a, meta: { ...a.meta } };"], { 0: "is-done" }), note: "<b>Shallow is usually enough</b> - just spread every level you intend to change. That is precisely the pattern in immutable state updates." });
        }
        if (mode === "deep") {
            f.push({ stage: draw("n-act", "n-act", false, false, "const b = structuredClone(a);"), note: "<code>structuredClone</code> walks the whole graph and rebuilds every level - built into browsers and Node, no library needed." });
            f.push({ stage: draw("n-done", "n-done", false, false, "b.tags.push('ts')  →  a.tags unchanged ✓"), note: "Nothing is shared at any depth. It even handles <code>Map</code>, <code>Set</code>, <code>Date</code>, typed arrays and <b>cycles</b>." });
            f.push({ stage: panesHTML([{ title: "structuredClone handles", items: [{ text: "Map, Set, Date, RegExp", cls: "is-done" }, { text: "ArrayBuffer, Blob", cls: "is-done" }, { text: "circular references", cls: "is-done" }] }, { title: "It throws on", items: [{ text: "functions", cls: "is-out" }, { text: "DOM nodes", cls: "is-out" }, { text: "class identity (→ plain object)", cls: "is-out" }] }]), note: "It is not free, though: deep cloning is O(size). <code>JSON.parse(JSON.stringify(x))</code> is the old trick and it silently destroys <code>undefined</code>, <code>Date</code> and <code>Map</code> - prefer <code>structuredClone</code>." });
        }
        return f;
    },
};
/* ---- 14. Destructuring ---- */

VIZ["destructuring"] = {
    title: "Destructuring - a pattern matched against a value",
    legend: [["lg-act", "being matched"], ["lg-done", "bound"], ["lg-cmp", "default applied"], ["lg-out", "left over"]],
    build() {
        const f = [];
        const view = (pattern, value, bindings, marks) =>
            codeHTML(pattern, marks) + panesHTML([{ title: "value", items: value }, { title: "bindings created", items: bindings, empty: "none yet" }]);
        const src = [
            "const { id, name = 'anon', ...rest } = user;",
        ];
        const val = [{ text: "id: 7" }, { text: "role: 'admin'" }, { text: "team: 'core'" }];
        f.push({ stage: view(src, val, [], { 0: "is-act" }), note: "Read the left side as a <b>picture of the shape you expect</b>. Each name in the pattern pulls out the property with that key." });
        f.push({ stage: view(src, [{ text: "id: 7", cls: "is-act" }, { text: "role: 'admin'" }, { text: "team: 'core'" }], [{ text: "id = 7", cls: "is-done" }], { 0: "is-act" }), note: "<code>id</code> matches the key <code>id</code> - object destructuring is <b>by key</b>, so the order you write them in is irrelevant." });
        f.push({ stage: view(src, val, [{ text: "id = 7", cls: "is-done" }, { text: "name = 'anon'", cls: "is-cmp" }], { 0: "is-act" }), note: "There is no <code>name</code> key, so the default fires. <b>Defaults trigger only on <code>undefined</code></b> - a stored <code>null</code> would win and give you <code>null</code>." });
        f.push({ stage: view(src, val, [{ text: "id = 7", cls: "is-done" }, { text: "name = 'anon'", cls: "is-cmp" }, { text: "rest = { role, team }", cls: "is-act" }], { 0: "is-act" }), note: "<code>...rest</code> sweeps up every remaining own enumerable property into a <b>new object</b>. Handy for 'everything except the props I handled'." });
        f.push({
            stage: codeHTML(["const [first, , third = 0] = [10, 20];"], { 0: "is-act" }) + panesHTML([{ title: "value", items: [{ text: "[10, 20]" }] }, { title: "bindings", items: [{ text: "first = 10", cls: "is-done" }, { text: "(hole skipped)", cls: "is-out" }, { text: "third = 0", cls: "is-cmp" }] }]),
            note: "Array destructuring is <b>by position</b>, not key. A blank slot skips an element, and a missing index gets the default. It works on <em>any iterable</em> - strings, Sets, Maps.",
        });
        f.push({
            stage: codeHTML(["const { data: { items: rows = [] } = {} } = response;"], { 0: "is-cmp" }) + panesHTML([{ title: "renaming", items: [{ text: "data.items → rows", cls: "is-done" }] }, { title: "why the ` = {}`", items: [{ text: "guards a missing data", cls: "is-cmp" }] }]),
            note: "<code>key: newName</code> renames; nested patterns dig deeper. Give every nested pattern its own default or a missing parent throws <b>'cannot destructure of undefined'</b>.",
        });
        f.push({
            stage: codeHTML(["function draw({ x = 0, y = 0, color = 'red' } = {}) { … }", "", "draw({ color: 'blue' });   // order-free, self-documenting", "draw();                    // works thanks to the = {}"], { 0: "is-done" }),
            note: "<b>The everyday use:</b> named parameters. Destructure the argument object in the signature and callers stop counting positional arguments.",
        });
        f.push({
            stage: codeHTML(["let a = 1, b = 2;", "[a, b] = [b, a];        // swap, no temp", "", "for (const [key, value] of Object.entries(obj)) { … }"], { 1: "is-done", 3: "is-done" }),
            note: "Two idioms worth keeping: the temp-free swap, and destructuring the <code>[key, value]</code> pairs that <code>Object.entries</code> and <code>Map</code> iteration hand you.",
        });
        return f;
    },
};

/* ---- 15. Generators ---- */

VIZ["generator"] = {
    title: "Generators - a function you can pause",
    legend: [["lg-act", "running"], ["lg-cmp", "suspended at yield"], ["lg-done", "done"], ["lg-idle", "not started"]],
    build() {
        const src = [
            "function* ids() {",
            "  let n = 1;",
            "  while (true) {",
            "    yield n++;",
            "  }",
            "}",
            "",
            "const it = ids();",
            "it.next();  // { value: 1, done: false }",
            "it.next();  // { value: 2, done: false }",
        ];
        const view = (line, state, n, out) =>
            codeHTML(src, line === null ? {} : { [line]: state }) +
            panesHTML([
                { title: "generator state", items: [{ text: state === "is-cmp" ? "suspended" : "running", cls: state === "is-cmp" ? "is-cmp" : "is-act" }, { text: `n = ${n}`, cls: "is-done" }] },
                { title: "yielded", items: out, empty: "nothing yet" },
            ]);
        const f = [];
        f.push({ stage: codeHTML(src, { 7: "is-act" }) + panesHTML([{ title: "generator state", items: [{ text: "created, not started", cls: "is-ghost" }] }, { title: "yielded", items: [], empty: "nothing yet" }]), note: "Calling <code>ids()</code> runs <b>none</b> of the body. It returns an iterator and waits - generators are lazy by construction." });
        f.push({ stage: view(1, "is-act", "1", []), note: "The first <code>next()</code> starts the body and runs until the first <code>yield</code>." });
        f.push({ stage: view(3, "is-cmp", "2", [{ text: "{ value: 1, done: false }", cls: "is-done" }]), note: "<code>yield n++</code> hands out <code>1</code> and <b>freezes the function right here</b> - locals and the loop position preserved. The infinite <code>while</code> is harmless because it is paused." });
        f.push({ stage: view(3, "is-act", "2", [{ text: "{ value: 1, done: false }", cls: "is-cmp" }]), note: "The second <code>next()</code> resumes at the exact same line, inside the same loop iteration - no re-entry from the top." });
        f.push({ stage: view(3, "is-cmp", "3", [{ text: "{ value: 1, done: false }", cls: "is-cmp" }, { text: "{ value: 2, done: false }", cls: "is-done" }]), note: "Yields <code>2</code> and freezes again. Values are produced <b>one at a time, on demand</b> - an infinite sequence in constant memory." });
        f.push({
            stage: codeHTML(["for (const id of ids()) {", "  if (id > 3) break;   // calls it.return() - cleanup runs", "  console.log(id);", "}"], { 1: "is-out" }) + panesHTML([{ title: "printed", items: [{ text: "1", cls: "is-done" }, { text: "2", cls: "is-done" }, { text: "3", cls: "is-done" }] }]),
            note: "A generator is iterable, so <code>for…of</code> drives it. Breaking out calls <code>return()</code> on the iterator, which runs any <code>finally</code> block - that is how generators clean up.",
        });
        f.push({
            stage: codeHTML(["function* take(n, iter) {", "  for (const v of iter) {", "    if (n-- <= 0) return;", "    yield v;", "  }", "}", "", "[...take(3, ids())];  // [1, 2, 3]"], { 7: "is-done" }),
            note: "Because they compose, generators give you <b>lazy pipelines</b>: <code>take</code>, <code>map</code>, <code>filter</code> over streams that never fully exist in memory.",
        });
        f.push({
            stage: codeHTML(["for await (const chunk of response.body) {", "  process(chunk);   // async generator - one chunk at a time", "}"], { 0: "is-done" }),
            note: "<code>async function*</code> plus <code>for await…of</code> is the same idea over asynchronous sources - streaming an HTTP response or paginating an API without buffering it all.",
        });
        return f;
    },
};

/* ---- 16. Modules ---- */

VIZ["module-graph"] = {
    title: "Loading modules",
    legend: [["lg-act", "current phase"], ["lg-done", "finished"], ["lg-cmp", "linked"], ["lg-idle", "not reached"]],
    options: [
        { value: "esm", label: "ES modules - parse, link, then evaluate" },
        { value: "cjs", label: "CommonJS - require runs the file right there" },
    ],
    build(option) {
        const mode = option || "esm";
        const W = 640;
        const H = 230;
        const draw = (states, caption) => {
            let s = "";
            s += boxHTML(240, 20, 160, 42, "main.js", states[0] || "n-idle");
            s += boxHTML(80, 110, 160, 42, "cart.js", states[1] || "n-idle");
            s += boxHTML(400, 110, 160, 42, "utils.js", states[2] || "n-idle");
            s += boxHTML(240, 190, 160, 34, "format.js", states[3] || "n-idle");
            s += arrowHTML(290, 64, 180, 106, states[1] && states[1] !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(350, 64, 460, 106, states[2] && states[2] !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(180, 154, 290, 186, states[3] && states[3] !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(460, 154, 350, 186, states[3] && states[3] !== "n-idle" ? "e-act" : "e-idle");
            if (caption) s += capHTML(320, 96, caption);
            return svgHTML(W, H, s);
        };
        const f = [];

        if (mode === "esm") {
            f.push({ stage: draw(["n-act"], "phase 1 - parse"), note: "<code>import</code> declarations are <b>static</b>: they must sit at the top level, so the whole graph can be discovered without running a line of code." });
            f.push({ stage: draw(["n-cmp", "n-act", "n-act"], "fetch dependencies"), note: "The two imports of <code>main.js</code> are fetched and parsed in turn. Everything so far is bookkeeping - no module body has executed." });
            f.push({ stage: draw(["n-cmp", "n-cmp", "n-cmp", "n-act"], "shared dependency - loaded once"), note: "Both import <code>format.js</code>. It is fetched and instantiated exactly <b>once</b>; the second import reuses the same module record." });
            f.push({ stage: draw(["n-cmp", "n-cmp", "n-cmp", "n-cmp"], "phase 2 - link"), note: "Linking wires each import to the exporting module's <em>binding</em>, not to a copied value. If the exporter reassigns it later, importers see the new value: <b>live bindings</b>." });
            f.push({ stage: draw(["n-cmp", "n-cmp", "n-cmp", "n-done"], "phase 3 - evaluate, depth first"), note: "Only now do bodies run, deepest first. <code>format.js</code> executes before anything that depends on it." });
            f.push({ stage: draw(["n-cmp", "n-done", "n-done", "n-done"], "then the dependents"), note: "Then <code>cart.js</code> and <code>utils.js</code>, each exactly once no matter how many modules import them. A module body is effectively a one-time singleton initialiser." });
            f.push({ stage: draw(["n-done", "n-done", "n-done", "n-done"], "finally main.js"), note: "<code>main.js</code> runs last, with every dependency ready. Because the graph is known up front, bundlers can <b>tree-shake</b> exports nobody imported." });
            f.push({
                stage: codeHTML(["import { one } from './x.js';   // named - tree-shakeable", "import all from './x.js';       // default", "import * as ns from './x.js';   // namespace object", "", "const mod = await import('./heavy.js');  // dynamic, lazy"], { 4: "is-cmp" }),
                note: "<code>import()</code> is the escape hatch: a function call that returns a promise, allowed anywhere. That is how <b>code splitting</b> and conditional loading work.",
            });
        }
        if (mode === "cjs") {
            f.push({ stage: draw(["n-act"], "require('./cart') - a function call"), note: "In CommonJS, <code>require</code> is an ordinary <b>synchronous function call</b> evaluated when execution reaches it. There is no separate parse phase." });
            f.push({ stage: draw(["n-cmp", "n-act"], "reads, wraps and RUNS cart.js now"), note: "The file is read from disk and executed immediately; <code>main.js</code> is blocked until it finishes. This is why <code>require</code> can sit inside an <code>if</code> - and why it cannot be tree-shaken." });
            f.push({ stage: draw(["n-cmp", "n-cmp", "n-idle", "n-act"], "its own require runs first"), note: "Dependencies resolve depth-first, on demand. Results are cached in <code>require.cache</code>, so the second <code>require</code> of the same file returns the same exports object." });
            f.push({ stage: draw(["n-done", "n-done", "n-done", "n-done"], "module.exports is a value snapshot"), note: "<code>require</code> copies the <b>current value</b> of <code>module.exports</code>. Reassigning it later does not reach anyone who already required you - the opposite of ESM live bindings." });
            f.push({
                stage: panesHTML([{ title: "ESM", items: [{ text: "import / export", cls: "is-done" }, { text: "static, hoisted", cls: "is-done" }, { text: "live bindings", cls: "is-done" }, { text: "top-level await ✓", cls: "is-done" }, { text: "always strict mode", cls: "is-done" }] }, { title: "CommonJS", items: [{ text: "require / module.exports", cls: "is-cmp" }, { text: "runtime, conditional", cls: "is-cmp" }, { text: "value copies", cls: "is-cmp" }, { text: "no top-level await", cls: "is-out" }, { text: "__dirname available", cls: "is-cmp" }] }]),
                note: "<b>Pick ESM for new code</b> - <code>\"type\": \"module\"</code> in package.json, or the <code>.mjs</code> extension. ESM can import CommonJS; CommonJS can only reach ESM through dynamic <code>import()</code>.",
            });
        }
        return f;
    },
};

/* ---- 17. Garbage collection ---- */

VIZ["garbage-collection"] = {
    title: "Mark and sweep - what keeps an object alive",
    legend: [["lg-act", "being marked"], ["lg-done", "reachable - kept"], ["lg-out", "unreachable - freed"], ["lg-idle", "not visited"]],
    build() {
        const W = 640;
        const H = 260;
        const draw = (st, caption) => {
            let s = "";
            s += boxHTML(30, 100, 110, 44, "root", st.root || "n-done", "globals + stack");
            s += nodeHTML(230, 60, "user", st.user || "n-idle", 26);
            s += nodeHTML(230, 180, "cache", st.cache || "n-idle", 26);
            s += nodeHTML(390, 60, "prefs", st.prefs || "n-idle", 26);
            s += nodeHTML(390, 180, "blob", st.blob || "n-idle", 26);
            s += nodeHTML(540, 120, "orphan", st.orphan || "n-idle", 26);
            s += arrowHTML(142, 112, 204, 72, st.user && st.user !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(142, 130, 204, 172, st.cache && st.cache !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(256, 60, 364, 60, st.prefs && st.prefs !== "n-idle" ? "e-act" : "e-idle");
            s += arrowHTML(256, 180, 364, 180, st.blob && st.blob !== "n-idle" ? "e-act" : "e-idle");
            if (st.showOrphanEdge) s += arrowHTML(514, 132, 416, 172, "e-idle");
            if (caption) s += capHTML(320, 240, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({}, "the heap after your app has run a while"), note: "There is no <code>free()</code> in JavaScript. The collector's question is not 'is this still used?' but <b>'can this still be reached?'</b>" });
        f.push({ stage: draw({ root: "n-act" }, "start from the roots"), note: "Marking starts at the <b>roots</b>: the global object and every live stack frame - so every local variable of every function currently executing." });
        f.push({ stage: draw({ root: "n-done", user: "n-act", cache: "n-act" }, "follow every reference"), note: "Every reference from a root is followed and marked. This is a graph traversal, not reference counting - which is why <em>cycles are collected fine</em>." });
        f.push({ stage: draw({ root: "n-done", user: "n-done", cache: "n-done", prefs: "n-act", blob: "n-act" }, "and their references, transitively"), note: "The walk continues transitively. Anything a reachable object points to is also reachable." });
        f.push({ stage: draw({ root: "n-done", user: "n-done", cache: "n-done", prefs: "n-done", blob: "n-done", orphan: "n-out", showOrphanEdge: true }, "sweep: unmarked = garbage"), note: "<code>orphan</code> was never reached, so it is <b>freed</b> - along with everything only it pointed to. Note it still <em>has</em> an outgoing reference; that does not save it." });
        f.push({
            stage: draw({ root: "n-done", user: "n-done", cache: "n-out", blob: "n-out" }, "the fix: drop the reference"),
            note: "To free something, <b>make it unreachable</b>: null the field, remove it from the array, delete the map entry. That is the entire API.",
        });
        f.push({
            stage: codeHTML(["const cache = new Map();", "cache.set(user, heavyData);   // ⚠ Map holds user forever", "", "const cache = new WeakMap();", "cache.set(user, heavyData);   // ✓ dies with user"], { 1: "is-out", 4: "is-done" }) + draw({ root: "n-done", user: "n-done", cache: "n-done", blob: "n-out" }),
            note: "<b>Leak #1 - the cache that never forgets.</b> A <code>Map</code> key is a strong reference. <code>WeakMap</code>/<code>WeakSet</code> hold keys weakly, so an entry vanishes when nothing else references the key.",
        });
        f.push({
            stage: codeHTML(["el.addEventListener('scroll', onScroll);", "// el removed from the DOM, listener never removed", "// → the closure, and everything it captured, stays alive"], { 0: "is-out" }),
            note: "<b>Leak #2 - the forgotten listener.</b> The handler is referenced by the event target, and it captures its whole enclosing scope. Always pair <code>addEventListener</code> with removal (or pass an <code>AbortSignal</code>).",
        });
        f.push({
            stage: codeHTML(["setInterval(tick, 1000);   // never cleared → runs forever", "let rows = [];             // module-level array that only grows"], { 0: "is-out", 1: "is-out" }),
            note: "<b>Leaks #3 and #4:</b> uncleared timers and ever-growing module-level collections. Every leak is the same shape - a reference from a root that you forgot to drop.",
        });
        return f;
    },
};

/* ---- 18. Debounce and throttle ---- */

VIZ["debounce-throttle"] = {
    title: "Taming a burst of events",
    legend: [["lg-act", "event fired"], ["lg-done", "handler runs"], ["lg-out", "suppressed"], ["lg-idle", "quiet"]],
    options: [
        { value: "raw", label: "No control - one handler call per event" },
        { value: "debounce", label: "Debounce - wait until it goes quiet" },
        { value: "throttle", label: "Throttle - at most once per interval" },
    ],
    build(option) {
        const mode = option || "raw";
        const W = 640;
        const events = [0.05, 0.12, 0.18, 0.24, 0.55, 0.62, 0.9];
        const ticks = [{ at: 0, label: "0" }, { at: 0.25, label: "250ms" }, { at: 0.5, label: "500ms" }, { at: 0.75, label: "750ms" }, { at: 1, label: "1s" }];
        const frame = (now, calls, callState) =>
            timelineHTML(
                W,
                [
                    { label: "keystrokes", marks: events.map((e) => ({ at: e, label: "", state: e <= now ? "n-act" : "n-idle" })) },
                    { label: "handler runs", marks: calls.map((c) => ({ at: c, label: "", state: callState || "n-done" })) },
                ],
                ticks,
                now
            );
        const f = [];
        f.push({ stage: frame(0, []), note: "A user types seven characters in a second - a fast burst, then a pause, then two more, then one." });

        if (mode === "raw") {
            f.push({ stage: frame(0.25, events.filter((e) => e <= 0.25)), note: "With a naive listener, <b>every</b> keystroke fires the handler. Four network requests in 240 ms." });
            f.push({ stage: frame(1, events), note: "Seven events, seven handler calls. If the handler hits the network or lays out the page, this is where the jank comes from." });
            f.push({ stage: panesHTML([{ title: "Debounce it when", items: [{ text: "search-as-you-type", cls: "is-done" }, { text: "autosave a form", cls: "is-done" }, { text: "resize → recompute layout", cls: "is-done" }] }, { title: "Throttle it when", items: [{ text: "scroll position tracking", cls: "is-cmp" }, { text: "mousemove drawing", cls: "is-cmp" }, { text: "progress reporting", cls: "is-cmp" }] }]), note: "<b>The distinction:</b> debounce cares about the <em>end</em> of a burst; throttle cares about a <em>steady rate</em> during it." });
        }
        if (mode === "debounce") {
            f.push({ stage: frame(0.18, []), note: "Debounce restarts a timer on every event. Three keystrokes in, nothing has run - each one <b>cancelled</b> the pending call." });
            f.push({ stage: frame(0.44, [0.44]), note: "The last keystroke of the burst was at 240 ms; 200 ms of silence follow, so the timer finally fires. <b>One call for four events.</b>" });
            f.push({ stage: frame(0.82, [0.44, 0.82]), note: "The second burst behaves the same way - it collapses into a single trailing call." });
            f.push({ stage: frame(1, [0.44, 0.82, 1.0]), note: "Seven events → three calls, each with the <em>latest</em> input. The cost is latency: nothing happens until the user pauses." });
            f.push({
                stage: codeHTML(["const debounce = (fn, ms) => {", "  let t;", "  return (...args) => {", "    clearTimeout(t);                      // cancel the pending call", "    t = setTimeout(() => fn(...args), ms);", "  };", "};"], { 3: "is-act" }),
                note: "The whole implementation is one closure holding one timer id. <b>Create it once</b> - a debounced function rebuilt on every render debounces nothing.",
            });
        }
        if (mode === "throttle") {
            f.push({ stage: frame(0.05, [0.05]), note: "Throttle runs the handler <b>immediately</b> on the leading edge, then closes the gate for 250 ms." });
            f.push({ stage: frame(0.24, [0.05]), note: "The next three keystrokes arrive while the gate is shut and are <b>dropped</b>. No timer restarting here - the interval is fixed." });
            f.push({ stage: frame(0.55, [0.05, 0.55]), note: "The gate reopens and the next event passes straight through. Output is capped at one call per interval, evenly spread." });
            f.push({ stage: frame(1, [0.05, 0.55, 0.9]), note: "Seven events → three calls, but unlike debounce you get feedback <b>during</b> the burst. That is why scroll and drag handlers throttle rather than debounce." });
            f.push({
                stage: codeHTML(["const throttle = (fn, ms) => {", "  let last = 0;", "  return (...args) => {", "    const now = Date.now();", "    if (now - last < ms) return;   // gate is shut - drop it", "    last = now;", "    fn(...args);", "  };", "};", "", "// for anything visual, prefer:", "requestAnimationFrame(update);"], { 4: "is-act", 11: "is-done" }),
                note: "For rendering work, <code>requestAnimationFrame</code> beats any interval you pick - it throttles to the display's refresh rate and pauses in background tabs.",
            });
        }
        return f;
    },
};

/* ---- 19. DOM events ---- */

VIZ["dom-events"] = {
    title: "An event travelling through the DOM",
    legend: [["lg-act", "current phase"], ["lg-done", "handler fired"], ["lg-cmp", "passed through"], ["lg-idle", "idle"]],
    build() {
        const W = 620;
        const H = 300;
        const rows = [
            { y: 20, label: "window" },
            { y: 76, label: "document" },
            { y: 132, label: "ul#list  (delegated handler)" },
            { y: 188, label: "li" },
            { y: 244, label: "button  ← clicked" },
        ];
        const draw = (states, side) => {
            let s = "";
            rows.forEach((r, i) => {
                const w = 300 - i * 20;
                s += boxHTML(160 + i * 10, r.y, w, 40, r.label, states[i] || "n-idle");
            });
            if (side) s += capHTML(60, side.y, side.text, "start");
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw([]), note: "You click the button. The event does <b>not</b> start there - it starts at the top and travels down." });
        f.push({ stage: draw(["n-act"], { y: 45, text: "1. capture ↓" }), note: "<b>Capture phase.</b> The event descends from <code>window</code>. Only handlers registered with <code>{ capture: true }</code> fire here - which is why most people never see this phase." });
        f.push({ stage: draw(["n-cmp", "n-act"], { y: 101, text: "capture ↓" }), note: "Down through <code>document</code>. Capture is the phase to use when you want to see an event <em>before</em> the element that was clicked." });
        f.push({ stage: draw(["n-cmp", "n-cmp", "n-act"], { y: 157, text: "capture ↓" }), note: "Past the list. A capturing listener here could <code>stopPropagation()</code> and the button would never learn it was clicked." });
        f.push({ stage: draw(["n-cmp", "n-cmp", "n-cmp", "n-cmp", "n-done"], { y: 269, text: "2. target" }), note: "<b>Target phase.</b> The event reaches the deepest element. <code>event.target</code> is this button - and it stays this button for the whole journey." });
        f.push({ stage: draw(["n-cmp", "n-cmp", "n-cmp", "n-act", "n-done"], { y: 213, text: "3. bubble ↑" }), note: "<b>Bubble phase.</b> Now it climbs back up, firing ordinary listeners on each ancestor in turn." });
        f.push({ stage: draw(["n-cmp", "n-cmp", "n-done", "n-cmp", "n-done"], { y: 157, text: "bubble ↑ - handler fires" }), note: "The single listener on <code>ul#list</code> fires, even though nobody clicked the <code>ul</code>. <b>That is event delegation</b> - one listener for a thousand rows, and it keeps working for rows added later." });
        f.push({
            stage: draw(["n-cmp", "n-cmp", "n-done", "n-cmp", "n-done"]) + codeHTML(["list.addEventListener('click', (e) => {", "  const row = e.target.closest('li');   // where the click came from", "  if (!row) return;                     // clicked the padding", "  select(row.dataset.id);", "});"], { 1: "is-act" }),
            note: "<code>e.target</code> is what was clicked; <code>e.currentTarget</code> is the element holding the listener. <code>closest()</code> bridges the two.",
        });
        f.push({
            stage: panesHTML([{ title: "stopPropagation()", items: [{ text: "halts the journey", cls: "is-out" }, { text: "breaks delegation above you", cls: "is-out" }] }, { title: "preventDefault()", items: [{ text: "cancels the browser action", cls: "is-cmp" }, { text: "event keeps travelling", cls: "is-cmp" }] }, { title: "Not everything bubbles", items: [{ text: "focus, blur, scroll ✗", cls: "is-out" }, { text: "focusin, focusout ✓", cls: "is-done" }] }]),
            note: "<b>The two are unrelated</b> and constantly confused. <code>preventDefault</code> stops the <em>default behaviour</em> (following a link, submitting a form); <code>stopPropagation</code> stops <em>other handlers</em> from ever seeing the event.",
        });
        return f;
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
