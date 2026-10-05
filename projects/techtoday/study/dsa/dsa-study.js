/* ==========================================================================
   TechToday - DSA study guide
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
        "deque defaultdict Counter heappush heappop heapify").split(" ")
);
const JS_KW = new Set(
    ("await break case catch class const continue debugger default delete do else export extends " +
        "finally for function if import in instanceof let new of return static super switch this " +
        "throw try typeof var void while yield async get set null undefined true false").split(" ")
);
const JS_BUILTIN = new Set(
    ("Array Object Map Set WeakMap WeakSet Math JSON Number String Boolean Symbol Promise Infinity " +
        "NaN console parseInt parseFloat isNaN BigInt Int32Array Uint8Array structuredClone").split(" ")
);

const buildTokenizer = (lang) => {
    const comment = lang === "python" ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
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
    const kw = lang === "python" ? PY_KW : JS_KW;
    const builtin = lang === "python" ? PY_BUILTIN : JS_BUILTIN;
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

/* ------------------------------------------------------ mermaid diagrams */
/* A small offline renderer for the `flowchart` subset used by the .md files:
   nodes A[..] A(..) A{..} A((..)), edges --> --- -.-> ==> with |labels|,
   chains, and :::good / :::bad / :::hl node classes. Layered layout. */

const renderMermaid = (source, uid) => {
    const lines = source.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("%%"));
    const header = (lines.shift() || "").match(/^(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)?/i);
    const horizontal = header && /LR|RL/i.test(header[1] || "");
    const nodes = new Map();
    const edges = [];

    const NODE_RE = /^([A-Za-z_]\w*)\s*(\(\("[^"]*"\)\)|\(\([^)]*\)\)|\(\["[^"]*"\]\)|\(\[[^\]]*\]\)|\["[^"]*"\]|\[[^\]]*\]|\("[^"]*"\)|\([^)]*\)|\{"[^"]*"\}|\{[^}]*\})?(?::::(\w+))?/;
    const EDGE_RE = /^(-->|---|-\.->|-\.-|==>)(?:\|([^|]*)\|)?|^--\s*([^>]+?)\s*-->|^-\.\s*([^.]+?)\s*\.->/;

    const addNode = (token) => {
        const m = token.match(NODE_RE);
        if (!m) return null;
        const [, id, shapeText, cls] = m;
        let shape = "rect";
        let label = id;
        if (shapeText) {
            const pairs = [["((", "))", "circle"], ["([", "])", "round"], ["[", "]", "rect"], ["(", ")", "round"], ["{", "}", "diamond"]];
            const [open, close, kind] = pairs.find(([o, c]) => shapeText.startsWith(o) && shapeText.endsWith(c));
            shape = kind;
            label = shapeText.slice(open.length, -close.length).replace(/^"(.*)"$/, "$1");
        }
        const node = nodes.get(id) || { id, shape: "rect", label: id, cls: "", order: nodes.size };
        if (shapeText) {
            node.shape = shape;
            node.label = label;
        }
        if (cls) node.cls = cls;
        nodes.set(id, node);
        return { node, rest: token.slice(m[0].length) };
    };

    lines.forEach((line) => {
        if (/^(classDef|class|style|linkStyle|subgraph|end|direction)\b/.test(line)) return;
        let parsed = addNode(line);
        while (parsed) {
            let rest = parsed.rest.trim();
            const em = rest.match(EDGE_RE);
            if (!em) break;
            rest = rest.slice(em[0].length).trim();
            const op = em[1] || (em[4] !== undefined ? "-.->" : "-->");
            const label = (em[2] ?? em[3] ?? em[4] ?? "").trim().replace(/^"(.*)"$/, "$1");
            const arrow = op !== "---" && op !== "-.-";
            const dashed = op.startsWith("-.");
            const thick = op === "==>";
            const parts = rest.split(/\s*&\s*/);
            let nextParsed = null;
            for (const part of parts) {
                const next = addNode(part.trim());
                if (next) {
                    edges.push({
                        from: parsed.node.id,
                        to: next.node.id,
                        label,
                        arrow,
                        dashed,
                        thick,
                    });
                    nextParsed = next;
                }
            }
            parsed = parts.length === 1 ? nextParsed : null;
        }
    });

    const list = [...nodes.values()];
    if (!list.length) return "";

    // Rank = longest path over forward edges; edges into a node already on the DFS stack are back edges.
    const out = new Map(list.map((n) => [n.id, []]));
    const state = new Map();
    const dfs = (id) => {
        state.set(id, 1);
        edges.forEach((e) => {
            if (e.from !== id) return;
            if (state.get(e.to) === 1) e.back = true;
            else {
                out.get(id).push(e.to);
                if (!state.has(e.to)) dfs(e.to);
            }
        });
        state.set(id, 2);
    };
    list.forEach((n) => !state.has(n.id) && dfs(n.id));
    const rank = new Map(list.map((n) => [n.id, 0]));
    for (let pass = 0; pass < list.length; pass += 1) {
        let changed = false;
        edges.forEach((e) => {
            if (!e.back && rank.get(e.to) < rank.get(e.from) + 1) {
                rank.set(e.to, rank.get(e.from) + 1);
                changed = true;
            }
        });
        if (!changed) break;
    }

    // Measure labels (wrap at ~24 chars, honour <br>).
    list.forEach((n) => {
        const words = n.label.split(/<br\s*\/?>/i);
        const wrapped = [];
        words.forEach((chunk) => {
            let current = "";
            chunk.split(/\s+/).forEach((w) => {
                if ((current + " " + w).trim().length > 24 && current) {
                    wrapped.push(current);
                    current = w;
                } else current = `${current} ${w}`.trim();
            });
            wrapped.push(current);
        });
        n.lines = wrapped;
        const textW = Math.max(...wrapped.map((l) => l.length)) * 7.2 + 26;
        const textH = wrapped.length * 16 + 16;
        if (n.shape === "diamond") {
            n.w = textW * 1.35;
            n.h = textH * 1.55;
        } else if (n.shape === "circle") {
            n.w = n.h = Math.max(textW, textH) * 0.95;
        } else {
            n.w = textW;
            n.h = textH;
        }
    });

    const layers = [];
    list.forEach((n) => {
        const r = rank.get(n.id);
        (layers[r] = layers[r] || []).push(n);
    });
    for (let sweep = 0; sweep < 2; sweep += 1) {
        layers.forEach((layer, r) => {
            if (!r) return;
            const posOf = new Map(layers[r - 1].map((n, i) => [n.id, i]));
            layer.forEach((n) => {
                const parents = edges.filter((e) => e.to === n.id && posOf.has(e.from)).map((e) => posOf.get(e.from));
                n.bary = parents.length ? parents.reduce((a, b) => a + b, 0) / parents.length : n.order;
            });
            layer.sort((a, b) => a.bary - b.bary || a.order - b.order);
        });
    }

    const measureEdgeLabel = (text) => {
        if (!text) return 0;
        let charUnits = 0;
        for (const ch of text) {
            charUnits += ch.codePointAt(0) > 0x2000 ? 2 : 1;
        }
        return Math.ceil(charUnits * 6.8 + 16);
    };

    const PAD = 16;
    const GAP_ACROSS = horizontal ? 18 : 28;
    const DEFAULT_GAP_ALONG = horizontal ? 64 : 56;
    const across = (n) => (horizontal ? n.h : n.w);
    const along = (n) => (horizontal ? n.w : n.h);
    const spans = layers.map((layer) => layer.reduce((s, n) => s + across(n), 0) + GAP_ACROSS * (layer.length - 1));
    const maxSpan = Math.max(...spans);

    // Dynamic layer gaps along flow direction based on edge labels between adjacent layers
    const layerGaps = [];
    for (let r = 0; r < layers.length - 1; r++) {
        let reqGap = DEFAULT_GAP_ALONG;
        edges.forEach((e) => {
            const rA = rank.get(e.from);
            const rB = rank.get(e.to);
            const minR = Math.min(rA, rB);
            const maxR = Math.max(rA, rB);
            if (minR === r && maxR === r + 1 && e.label) {
                if (horizontal) {
                    const lw = measureEdgeLabel(e.label);
                    reqGap = Math.max(reqGap, lw + 36);
                }
            }
        });
        layerGaps[r] = reqGap;
    }

    let cursor = PAD;
    layers.forEach((layer, r) => {
        const depth = Math.max(...layer.map(along));
        let offset = PAD + (maxSpan - spans[r]) / 2;
        layer.forEach((n) => {
            const a = offset + across(n) / 2;
            const b = cursor + depth / 2;
            n.x = horizontal ? b : a;
            n.y = horizontal ? a : b;
            offset += across(n) + GAP_ACROSS;
        });
        cursor += depth + (r < layers.length - 1 ? layerGaps[r] : 0);
    });

    const clip = (n, dx, dy) => {
        const hw = n.w / 2;
        const hh = n.h / 2;
        if (!dx && !dy) return 0;
        if (n.shape === "circle") return hw / Math.hypot(dx, dy);
        if (n.shape === "diamond") return 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
        return Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    };

    let body = `<defs><marker id="mm-arrow-${uid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="mm-arrowhead"/></marker></defs>`;
    let labelsSvg = "";

    const pairCounts = new Map();
    edges.forEach((e) => {
        const key = `${e.from}-->${e.to}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
    });
    const pairSeen = new Map();

    let minX = 0, minY = 0, maxX = cursor + PAD, maxY = maxSpan + PAD * 2;
    if (!horizontal) {
        maxX = maxSpan + PAD * 2;
        maxY = cursor + PAD;
    }

    edges.forEach((e) => {
        const a = nodes.get(e.from);
        const b = nodes.get(e.to);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const x1 = a.x + dx * clip(a, dx, dy);
        const y1 = a.y + dy * clip(a, dx, dy);
        const x2 = b.x - dx * clip(b, -dx, -dy);
        const y2 = b.y - dy * clip(b, -dx, -dy);
        const cls = `mm-edge${e.dashed ? " is-dashed" : ""}${e.thick ? " is-thick" : ""}`;
        const marker = e.arrow ? ` marker-end="url(#mm-arrow-${uid})"` : "";

        const key = `${e.from}-->${e.to}`;
        const totalThisDir = pairCounts.get(key) || 1;
        const seenIdx = pairSeen.get(key) || 0;
        pairSeen.set(key, seenIdx + 1);

        let mx = (x1 + x2) / 2;
        let my = (y1 + y2) / 2;
        const isBidiCollinear = edges.some((other) => other.from === e.to && other.to === e.from) && (horizontal ? Math.abs(dy) < 30 : Math.abs(dx) < 30);
        if (isBidiCollinear) {
            const shift = e.from < e.to ? -14 : 14;
            if (horizontal) mx += shift;
            else my += shift;
        }
        const isMulti = totalThisDir > 1;

        if (e.back || a === b || Math.abs(rank.get(e.to) - rank.get(e.from)) > 1 || isMulti) {
            const len = Math.hypot(dx, dy) || 1;
            let nx = -dy / len;
            let ny = dx / len;
            let curveOffset = 46;
            if (isMulti) {
                curveOffset = (seenIdx % 2 === 0 ? 1 : -1) * (40 + Math.floor(seenIdx / 2) * 30);
            } else {
                const centerVal = horizontal ? (maxSpan / 2) : (cursor / 2);
                const curVal = horizontal ? my : mx;
                const normVal = horizontal ? ny : nx;
                if ((curVal < centerVal && normVal > 0) || (curVal >= centerVal && normVal < 0)) {
                    curveOffset = -curveOffset;
                }
            }
            const cx = mx + nx * curveOffset;
            const cy = my + ny * curveOffset;
            body += `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" class="${cls}"${marker}/>`;
            mx = (mx + cx) / 2;
            my = (my + cy) / 2;
            minX = Math.min(minX, cx - 20, mx - 20);
            maxX = Math.max(maxX, cx + 20, mx + 20);
            minY = Math.min(minY, cy - 20, my - 20);
            maxY = Math.max(maxY, cy + 20, my + 20);
        } else {
            body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${marker}/>`;
        }

        if (e.label) {
            const w = measureEdgeLabel(e.label);
            labelsSvg += `<rect x="${mx - w / 2}" y="${my - 10}" width="${w}" height="20" rx="4" class="mm-edge-bg"/><text x="${mx}" y="${my}" class="mm-edge-label">${esc(e.label)}</text>`;
            minX = Math.min(minX, mx - w / 2 - 4);
            maxX = Math.max(maxX, mx + w / 2 + 4);
            minY = Math.min(minY, my - 14);
            maxY = Math.max(maxY, my + 14);
        }
    });

    list.forEach((n) => {
        const cls = `mm-node${n.cls ? ` mm-${n.cls}` : ""}`;
        const { x, y, w, h } = n;
        let shape;
        if (n.shape === "diamond") shape = `<polygon points="${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}"/>`;
        else if (n.shape === "circle") shape = `<circle cx="${x}" cy="${y}" r="${w / 2}"/>`;
        else shape = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${n.shape === "round" ? h / 2 : 6}"/>`;
        const top = y - ((n.lines.length - 1) * 16) / 2;
        const text = n.lines.map((l, i) => `<tspan x="${x}" y="${top + i * 16}">${esc(l)}</tspan>`).join("");
        body += `<g class="${cls}">${shape}<text class="mm-text">${text}</text></g>`;
    });

    body += labelsSvg;

    const padBox = PAD;
    const vbX = Math.floor(minX - (minX < 0 ? padBox : 0));
    const vbY = Math.floor(minY - (minY < 0 ? padBox : 0));
    const width = Math.ceil(maxX - vbX + padBox);
    const height = Math.ceil(maxY - vbY + padBox);

    return `<svg viewBox="${vbX} ${vbY} ${width} ${height}" width="${width}" class="mm-svg" role="img" aria-label="Diagram">${body}</svg>`;
};

document.querySelectorAll("pre.mermaid").forEach((block, i) => {
    const svg = renderMermaid(block.textContent, i);
    if (!svg) return;
    const wrap = document.createElement("div");
    wrap.className = "mm-wrap";
    wrap.innerHTML = svg;
    block.replaceWith(wrap);
});

document.querySelectorAll("pre > code").forEach((block) => {
    const lang = block.dataset.lang || "text";
    const source = dedent(block.textContent);
    block.dataset.source = source;
    block.innerHTML = lang === "python" || lang === "javascript" ? highlight(source, lang) : esc(source);
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

const LANG_LABEL = { python: "Python", javascript: "JavaScript", text: "Output" };
const LANG_KEY = "tt-dsa-lang";
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

/* ---- 1. Binary search ---- */

VIZ["binary-search"] = {
    title: "Binary search for 72",
    legend: [["lg-cmp", "search window"], ["lg-act", "mid"], ["lg-idle", "discarded"]],
    build() {
        const arr = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
        const target = 72;
        const frames = [];
        let lo = 0;
        let hi = arr.length - 1;

        const snap = (mid, note) => {
            const marks = {};
            const tags = {};
            arr.forEach((_, i) => {
                marks[i] = i < lo || i > hi ? "is-dim" : "is-cmp";
            });
            if (mid !== null) {
                marks[mid] = "is-act";
                tags[mid] = "mid";
            }
            if (lo <= hi) {
                tags[lo] = tags[lo] ? `lo ${tags[lo]}` : "lo";
                tags[hi] = tags[hi] ? `${tags[hi]} hi` : "hi";
            }
            frames.push({ stage: cellsHTML(arr, marks, tags), note });
        };

        snap(null, `Start with the whole sorted array. <code>lo=0</code>, <code>hi=${hi}</code>. Looking for <code>${target}</code>.`);

        while (lo <= hi) {
            const mid = lo + ((hi - lo) >> 1);
            snap(mid, `<code>mid = lo + (hi - lo) // 2 = ${mid}</code>. Compare <code>arr[${mid}] = ${arr[mid]}</code> with <code>${target}</code>.`);
            if (arr[mid] === target) {
                const marks = {};
                arr.forEach((_, i) => (marks[i] = i === mid ? "is-done" : "is-dim"));
                frames.push({
                    stage: cellsHTML(arr, marks, { [mid]: "found" }),
                    note: `Hit. Found <code>${target}</code> at index <code>${mid}</code> after ${frames.length} comparisons instead of scanning all ${arr.length} items.`,
                });
                break;
            }
            if (arr[mid] < target) {
                lo = mid + 1;
                snap(null, `<code>${arr[mid]} &lt; ${target}</code>, so everything at or left of <code>mid</code> is useless. Move <code>lo</code> to <code>${lo}</code> — half the array is gone in one step.`);
            } else {
                hi = mid - 1;
                snap(null, `<code>${arr[mid]} &gt; ${target}</code>, so discard the right half. Move <code>hi</code> to <code>${hi}</code>.`);
            }
        }
        return frames;
    },
};

/* ---- 2. Two pointers ---- */

VIZ["two-pointers"] = {
    title: "Two pointers: pair summing to 26",
    legend: [["lg-act", "pointer"], ["lg-done", "answer"], ["lg-idle", "excluded"]],
    build() {
        const arr = [1, 4, 7, 11, 15, 19, 24];
        const target = 26;
        const frames = [];
        let l = 0;
        let r = arr.length - 1;

        const snap = (note, done = false) => {
            const marks = {};
            const tags = { [l]: "L", [r]: "R" };
            arr.forEach((_, i) => {
                if (i < l || i > r) marks[i] = "is-dim";
                else if (i === l || i === r) marks[i] = done ? "is-done" : "is-act";
                else marks[i] = "is-window";
            });
            frames.push({ stage: cellsHTML(arr, marks, tags), note });
        };

        snap(`Array is sorted, so put one pointer at each end. Each step throws away one candidate for good — that is why this is <code>O(n)</code> instead of <code>O(n²)</code>.`);

        while (l < r) {
            const sum = arr[l] + arr[r];
            if (sum === target) {
                snap(`<code>${arr[l]} + ${arr[r]} = ${target}</code>. Found the pair at indices <code>${l}</code> and <code>${r}</code>.`, true);
                break;
            }
            if (sum < target) {
                snap(`<code>${arr[l]} + ${arr[r]} = ${sum} &lt; ${target}</code>. The sum is too small and <code>arr[R]</code> is already the largest option, so <code>arr[L]</code> can never work. Move <code>L</code> right.`);
                l += 1;
            } else {
                snap(`<code>${arr[l]} + ${arr[r]} = ${sum} &gt; ${target}</code>. Too big — <code>arr[R]</code> is too large for any remaining <code>L</code>. Move <code>R</code> left.`);
                r -= 1;
            }
        }
        return frames;
    },
};

/* ---- 3. Sliding window ---- */

VIZ["sliding-window"] = {
    title: "Max sum of any 3 consecutive values",
    legend: [["lg-act", "entering / leaving"], ["lg-cmp", "window"], ["lg-done", "best so far"]],
    build() {
        const arr = [4, 2, 9, 1, 7, 3, 8, 2];
        const k = 3;
        const frames = [];
        let sum = 0;
        let best = -Infinity;
        let bestStart = 0;

        for (let i = 0; i < arr.length; i += 1) {
            sum += arr[i];
            if (i < k - 1) {
                const marks = {};
                arr.forEach((_, j) => (marks[j] = j <= i ? "is-cmp" : "is-dim"));
                marks[i] = "is-act";
                frames.push({
                    stage: cellsHTML(arr, marks, { [i]: "in" }),
                    note: `Filling the first window. Added <code>${arr[i]}</code>, running <code>sum = ${sum}</code>.`,
                });
                continue;
            }
            const start = i - k + 1;
            const marks = {};
            arr.forEach((_, j) => (marks[j] = j >= start && j <= i ? "is-cmp" : "is-dim"));
            marks[i] = "is-act";
            const tags = { [i]: "+in" };
            if (start > 0) tags[start - 1] = "-out";
            const better = sum > best;
            if (better) {
                best = sum;
                bestStart = start;
            }
            frames.push({
                stage: cellsHTML(arr, marks, tags),
                note:
                    `Window <code>[${start}..${i}]</code> sum = <code>${sum}</code>. ` +
                    (better ? `New best.` : `Best stays <code>${best}</code>.`) +
                    ` Notice we never re-add the whole window: one add, one subtract, <code>O(1)</code> per step.`,
            });
            sum -= arr[start];
        }

        const marks = {};
        arr.forEach((_, j) => (marks[j] = j >= bestStart && j < bestStart + k ? "is-done" : "is-dim"));
        frames.push({
            stage: cellsHTML(arr, marks),
            note: `Answer: window starting at index <code>${bestStart}</code> with sum <code>${best}</code>. Total work <code>O(n)</code>, not <code>O(n·k)</code>.`,
        });
        return frames;
    },
};

/* ---- 4. Hash table insertion with chaining ---- */

VIZ["hash-table"] = {
    title: "Hash table with separate chaining",
    legend: [["lg-act", "bucket being written"], ["lg-out", "collision"], ["lg-done", "stored"]],
    build() {
        const buckets = 5;
        const keys = ["cat", "dog", "owl", "bat", "fox", "elk"];
        const table = Array.from({ length: buckets }, () => []);
        const frames = [];
        const hash = (key) => [...key].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % buckets, 7) % buckets;

        const render = (activeBucket, activeKey) => {
            const rows = table
                .map((chain, i) => {
                    const active = i === activeBucket;
                    const cls = active ? "is-act" : "";
                    const items = chain
                        .map((key) => {
                            const isNew = active && key === activeKey;
                            return `<div class="gcell ${isNew ? "is-done" : ""}">${esc(key)}</div>`;
                        })
                        .join('<div class="gcell is-empty">&rarr;</div>');
                    return (
                        `<div class="gcell ${cls}">${i}</div>` +
                        `<div class="gcell is-empty" style="width:auto;justify-content:flex-start">` +
                        `<div style="display:flex;gap:3px">${items || '<span style="opacity:.4">empty</span>'}</div></div>`
                    );
                })
                .join("");
            return `<div class="gridviz" style="grid-template-columns:auto minmax(220px,auto)">${rows}</div>`;
        };

        frames.push({ stage: render(-1, null), note: `Five buckets, all empty. The hash function turns a key into a bucket index in <code>O(1)</code>.` });

        keys.forEach((key) => {
            const idx = hash(key);
            const collided = table[idx].length > 0;
            table[idx].push(key);
            frames.push({
                stage: render(idx, key),
                note:
                    `<code>hash("${key}") = ${idx}</code>. ` +
                    (collided
                        ? `Bucket ${idx} is already occupied — a <strong>collision</strong>. Append to that bucket's linked list; lookups now compare keys inside the chain.`
                        : `Bucket ${idx} was free, so the key lands directly. Average lookup stays <code>O(1)</code>.`),
            });
        });

        frames.push({
            stage: render(-1, null),
            note: `Final table. With a good hash and a load factor under ~0.75 the chains stay tiny, so get/put average <code>O(1)</code>. In the pathological case where every key collides, it degrades to <code>O(n)</code>.`,
        });
        return frames;
    },
};

/* ---- 5. Linked list operations ---- */

VIZ["linked-list"] = {
    title: "Singly linked list: traverse, insert, delete",
    legend: [["lg-act", "current"], ["lg-done", "new node"], ["lg-out", "removed"]],
    build() {
        const frames = [];
        const W = 620;
        const H = 130;

        const render = (values, opts = {}) => {
            const { active = -1, added = -1, removed = -1, skipFrom = -1 } = opts;
            let body = `<text x="18" y="60" class="n-sub">head</text>`;
            body += edgeHTML(40, 55, 62, 55, "e-act");
            const step = Math.min(110, (W - 120) / Math.max(values.length, 1));
            values.forEach((value, i) => {
                const x = 82 + i * step;
                let state = "n-idle";
                if (i === removed) state = "n-out";
                else if (i === added) state = "n-done";
                else if (i === active) state = "n-act";
                body += `<rect x="${x - 26}" y="36" width="52" height="38" rx="6" class="${state}" stroke-width="2"/>`;
                body += `<line x1="${x + 10}" y1="36" x2="${x + 10}" y2="74" class="e-idle"/>`;
                body += `<text x="${x - 8}" y="55" class="n-label${state !== "n-idle" ? " n-label-dark" : ""}">${esc(value)}</text>`;
                if (i < values.length - 1) {
                    const arrowState = skipFrom === i ? "e-done" : "e-idle";
                    if (skipFrom === i && i + 2 <= values.length - 1) {
                        body += `<path d="M ${x + 26} 45 Q ${x + step} 8 ${x + 2 * step - 26} 45" class="e-done"/>`;
                    }
                    body += edgeHTML(x + 26, 55, x + step - 26, 55, arrowState);
                    body += `<polygon points="${x + step - 26},55 ${x + step - 33},51 ${x + step - 33},59" fill="#28303a"/>`;
                } else {
                    body += `<text x="${x + 46}" y="60" class="n-sub">null</text>`;
                }
            });
            return svgHTML(W, H, body);
        };

        const list = [10, 20, 30, 40];
        frames.push({ stage: render(list), note: `A singly linked list. Each node holds a value and a pointer to the next node. Unlike an array these nodes can sit anywhere in memory.` });
        for (let i = 0; i < list.length; i += 1) {
            frames.push({
                stage: render(list, { active: i }),
                note: `Traversal step ${i + 1}: <code>cur = cur.next</code>. There is no index arithmetic here — reaching position <code>i</code> costs <code>O(i)</code>, which is the core trade-off versus an array.`,
            });
        }
        const inserted = [10, 20, 25, 30, 40];
        frames.push({
            stage: render(inserted, { added: 2, active: 1 }),
            note: `Insert <code>25</code> after the node holding <code>20</code>: create the node, point it at <code>30</code>, then repoint <code>20.next</code>. Two pointer writes, <code>O(1)</code> — no shifting of later elements.`,
        });
        frames.push({
            stage: render(inserted, { removed: 3, active: 2, skipFrom: 2 }),
            note: `Delete <code>30</code>: set <code>25.next = 30.next</code>. The node is now unreachable and gets garbage collected. Again <code>O(1)</code> once you hold the previous node.`,
        });
        frames.push({
            stage: render([10, 20, 25, 40]),
            note: `Result. Cheap structural edits, but no random access and poor cache locality — that is the whole personality of a linked list.`,
        });
        return frames;
    },
};

/* ---- 6. Stack and queue ---- */

VIZ["stack-queue"] = {
    title: "Stack (LIFO) vs Queue (FIFO)",
    legend: [["lg-act", "entering"], ["lg-out", "leaving"], ["lg-done", "resting"]],
    build() {
        const frames = [];
        const render = (stack, queue, note) => {
            const stackCells = stack.length
                ? stack
                    .map((s, i) => `<div class="cell ${i === stack.length - 1 ? "is-act" : "is-done"}"><div class="cell-box">${s}</div><div class="cell-idx">${i === stack.length - 1 ? "top" : ""}</div></div>`)
                    .join("")
                : '<div class="cell is-ghost"><div class="cell-box">–</div><div class="cell-idx"></div></div>';
            const queueCells = queue.length
                ? queue
                    .map((s, i) => `<div class="cell ${i === 0 ? "is-act" : "is-done"}"><div class="cell-box">${s}</div><div class="cell-idx">${i === 0 ? "front" : i === queue.length - 1 ? "back" : ""}</div></div>`)
                    .join("")
                : '<div class="cell is-ghost"><div class="cell-box">–</div><div class="cell-idx"></div></div>';
            return {
                stage:
                    `<div style="display:grid;gap:14px">` +
                    `<div><div class="viz-title" style="margin-left:10px">Stack — push/pop at the top</div><div class="cells">${stackCells}</div></div>` +
                    `<div><div class="viz-title" style="margin-left:10px">Queue — enqueue at back, dequeue at front</div><div class="cells">${queueCells}</div></div>` +
                    `</div>`,
                note,
            };
        };

        frames.push(render([], [], "Both start empty. They accept the same items — only the exit rule differs."));
        frames.push(render(["A"], ["A"], "Add <code>A</code>. Stack: <code>push</code>. Queue: <code>enqueue</code>."));
        frames.push(render(["A", "B"], ["A", "B"], "Add <code>B</code>."));
        frames.push(render(["A", "B", "C"], ["A", "B", "C"], "Add <code>C</code>. Contents are identical so far."));
        frames.push(render(["A", "B"], ["B", "C"], "Now remove one. The stack pops <strong>C</strong> (last in, first out). The queue dequeues <strong>A</strong> (first in, first out)."));
        frames.push(render(["A"], ["C"], "Remove again: stack gives <strong>B</strong>, queue gives <strong>B</strong>… but from opposite ends of history."));
        frames.push(render([], [], "Stack drained in order C, B, A — reversed. Queue drained A, B, C — preserved. That single difference is why stacks power undo/recursion and queues power schedulers and BFS."));
        return frames;
    },
};

/* ---- 7. Recursion call stack ---- */

VIZ["recursion"] = {
    title: "Call stack for fib(5)",
    legend: [["lg-act", "call in progress"], ["lg-done", "returned"], ["lg-cmp", "cache hit"]],
    build() {
        const frames = [];
        const stack = [];
        const memo = {};
        let hits = 0;

        const render = (note) => {
            const rows = stack.length
                ? stack
                    .slice()
                    .reverse()
                    .map((f, i) => `<div class="gcell ${i === 0 ? "is-act" : ""}" style="width:auto;padding:0 14px">${esc(f)}</div>`)
                    .join("")
                : '<div class="gcell is-empty" style="width:auto;padding:0 14px">empty stack</div>';
            const memoView = Object.keys(memo).length
                ? Object.entries(memo)
                    .map(([k, v]) => `<div class="gcell is-done" style="width:auto;padding:0 10px">fib(${k})=${v}</div>`)
                    .join("")
                : '<div class="gcell is-empty" style="width:auto;padding:0 10px">nothing memoised yet</div>';
            frames.push({
                stage:
                    `<div style="display:grid;gap:12px;justify-items:center">` +
                    `<div class="gridviz" style="grid-template-columns:auto">${rows}</div>` +
                    `<div class="gridviz" style="grid-template-columns:repeat(auto-fit,auto)">${memoView}</div>` +
                    `</div>`,
                note,
            });
        };

        const fib = (n) => {
            stack.push(`fib(${n})`);
            if (n in memo) {
                hits += 1;
                render(`<code>fib(${n})</code> is already in the cache → return <code>${memo[n]}</code> instantly. Without memoisation this whole subtree would be recomputed.`);
                stack.pop();
                return memo[n];
            }
            render(`Call <code>fib(${n})</code>. A new stack frame is pushed — this is real memory, which is why deep recursion can blow the stack.`);
            if (n <= 1) {
                memo[n] = n;
                render(`Base case reached: <code>fib(${n}) = ${n}</code>. Return and pop the frame.`);
                stack.pop();
                return n;
            }
            const value = fib(n - 1) + fib(n - 2);
            memo[n] = value;
            render(`Both children returned, so <code>fib(${n}) = ${value}</code>. Pop the frame and hand the value to the caller.`);
            stack.pop();
            return value;
        };

        const result = fib(5);
        render(`Done: <code>fib(5) = ${result}</code> with ${hits} cache hits. Plain recursion here is <code>O(2ⁿ)</code>; adding the cache makes it <code>O(n)</code> — that single change is the whole idea behind dynamic programming.`);
        return frames;
    },
};

/* ---- 8. Sorting algorithms ---- */

const SORT_INPUT = [38, 12, 47, 5, 29, 41, 18, 9, 33, 22];

const sortFrames = (algo) => {
    const a = clone(SORT_INPUT);
    const frames = [];
    const push = (marks, note) => frames.push({ stage: barsHTML(a, marks), note });
    const allDone = () => Object.fromEntries(a.map((_, i) => [i, "is-done"]));

    if (algo === "bubble") {
        push({}, "Bubble sort: repeatedly walk the array, swapping neighbours that are out of order. After pass <code>k</code> the largest <code>k</code> values are parked at the end.");
        let n = a.length;
        let swapped = true;
        let pass = 0;
        while (swapped) {
            swapped = false;
            pass += 1;
            for (let i = 0; i + 1 < n; i += 1) {
                const marks = {};
                for (let j = n; j < a.length; j += 1) marks[j] = "is-done";
                marks[i] = "is-cmp";
                marks[i + 1] = "is-cmp";
                push(marks, `Pass ${pass}: compare <code>${a[i]}</code> and <code>${a[i + 1]}</code>.`);
                if (a[i] > a[i + 1]) {
                    [a[i], a[i + 1]] = [a[i + 1], a[i]];
                    swapped = true;
                    const m2 = {};
                    for (let j = n; j < a.length; j += 1) m2[j] = "is-done";
                    m2[i] = "is-act";
                    m2[i + 1] = "is-act";
                    push(m2, `Out of order → swap. The bigger value keeps bubbling right.`);
                }
            }
            n -= 1;
            const m3 = {};
            for (let j = n; j < a.length; j += 1) m3[j] = "is-done";
            push(m3, `End of pass ${pass}. Position <code>${n}</code> is now final.${swapped ? "" : " No swaps happened, so the array is sorted and we can stop early."}`);
        }
        push(allDone(), "Sorted. Worst/average <code>O(n²)</code>, best <code>O(n)</code> on already-sorted input thanks to the early exit. Stable, in-place, and almost never the right choice in production.");
        return frames;
    }

    if (algo === "selection") {
        push({}, "Selection sort: find the minimum of the unsorted suffix, swap it into place. Exactly <code>n-1</code> swaps total — the fewest writes of any comparison sort.");
        for (let i = 0; i < a.length - 1; i += 1) {
            let min = i;
            for (let j = i + 1; j < a.length; j += 1) {
                const marks = {};
                for (let k = 0; k < i; k += 1) marks[k] = "is-done";
                marks[min] = "is-act";
                marks[j] = "is-cmp";
                push(marks, `Scanning for the minimum of <code>[${i}..]</code>. Current best is <code>${a[min]}</code>, testing <code>${a[j]}</code>.`);
                if (a[j] < a[min]) min = j;
            }
            if (min !== i) [a[i], a[min]] = [a[min], a[i]];
            const marks = {};
            for (let k = 0; k <= i; k += 1) marks[k] = "is-done";
            push(marks, `Minimum <code>${a[i]}</code> swapped into index <code>${i}</code>. That slot is finished forever.`);
        }
        push(allDone(), "Sorted. Always <code>O(n²)</code> comparisons regardless of input, but only <code>O(n)</code> swaps — useful when writes are expensive (e.g. flash memory).");
        return frames;
    }

    if (algo === "insertion") {
        push({ 0: "is-done" }, "Insertion sort: treat the left part as a sorted hand of cards and insert each new card into its right place.");
        for (let i = 1; i < a.length; i += 1) {
            const key = a[i];
            let j = i - 1;
            const marks = {};
            for (let k = 0; k < i; k += 1) marks[k] = "is-done";
            marks[i] = "is-act";
            push(marks, `Take <code>${key}</code> out of the array and shift larger sorted values right to make a gap.`);
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];
                const m = {};
                for (let k = 0; k <= i; k += 1) m[k] = "is-done";
                m[j] = "is-cmp";
                m[j + 1] = "is-act";
                push(m, `<code>${a[j]} &gt; ${key}</code> → shift it one slot right.`);
                j -= 1;
            }
            a[j + 1] = key;
            const m2 = {};
            for (let k = 0; k <= i; k += 1) m2[k] = "is-done";
            m2[j + 1] = "is-act";
            push(m2, `Drop <code>${key}</code> into the gap at index <code>${j + 1}</code>. The prefix is sorted again.`);
        }
        push(allDone(), "Sorted. <code>O(n²)</code> worst case but <code>O(n)</code> on nearly-sorted data and very low constants — this is why real sorts (Timsort, introsort) switch to insertion sort for small runs.");
        return frames;
    }

    if (algo === "merge") {
        push({}, "Merge sort: split until pieces are trivially sorted, then merge sorted runs pairwise. Classic divide and conquer.");
        const sort = (lo, hi, depth) => {
            if (lo >= hi) return;
            const mid = (lo + hi) >> 1;
            const marks = {};
            for (let i = lo; i <= hi; i += 1) marks[i] = "is-cmp";
            push(marks, `Split <code>[${lo}..${hi}]</code> into <code>[${lo}..${mid}]</code> and <code>[${mid + 1}..${hi}]</code>. Depth ${depth}; there are only <code>log n</code> levels of splitting.`);
            sort(lo, mid, depth + 1);
            sort(mid + 1, hi, depth + 1);
            const left = a.slice(lo, mid + 1);
            const right = a.slice(mid + 1, hi + 1);
            let i = 0;
            let j = 0;
            let k = lo;
            while (i < left.length || j < right.length) {
                const takeLeft = j >= right.length || (i < left.length && left[i] <= right[j]);
                a[k] = takeLeft ? left[i++] : right[j++];
                const m = {};
                for (let t = lo; t <= hi; t += 1) m[t] = "is-aux";
                m[k] = "is-act";
                push(m, `Merging: take <code>${a[k]}</code> from the ${takeLeft ? "left" : "right"} run. Ties take from the left, which is exactly what makes merge sort <strong>stable</strong>.`);
                k += 1;
            }
            const m2 = {};
            for (let t = lo; t <= hi; t += 1) m2[t] = "is-done";
            push(m2, `Range <code>[${lo}..${hi}]</code> is now a single sorted run.`);
        };
        sort(0, a.length - 1, 0);
        push(allDone(), "Sorted. Guaranteed <code>O(n log n)</code> in every case, stable, but needs <code>O(n)</code> extra space for the merge buffer.");
        return frames;
    }

    if (algo === "quick") {
        push({}, "Quicksort (Lomuto partition): pick a pivot, move everything smaller to its left, then recurse on both sides.");
        const sort = (lo, hi) => {
            if (lo >= hi) return;
            const pivot = a[hi];
            const marks = {};
            for (let i = lo; i <= hi; i += 1) marks[i] = "is-cmp";
            marks[hi] = "is-out";
            push(marks, `Partition <code>[${lo}..${hi}]</code> with pivot <code>${pivot}</code> (last element).`);
            let store = lo;
            for (let i = lo; i < hi; i += 1) {
                const m = {};
                for (let t = lo; t <= hi; t += 1) m[t] = "is-cmp";
                m[hi] = "is-out";
                m[i] = "is-act";
                push(m, `Is <code>${a[i]} &lt; ${pivot}</code>? ${a[i] < pivot ? "Yes → swap it into the &lsquo;smaller&rsquo; region." : "No → leave it in the &lsquo;larger&rsquo; region."}`);
                if (a[i] < pivot) {
                    [a[i], a[store]] = [a[store], a[i]];
                    store += 1;
                }
            }
            [a[store], a[hi]] = [a[hi], a[store]];
            const m2 = {};
            for (let t = lo; t <= hi; t += 1) m2[t] = "is-cmp";
            m2[store] = "is-done";
            push(m2, `Pivot <code>${pivot}</code> swapped to index <code>${store}</code> — its final resting place. Everything left is smaller, everything right is larger.`);
            sort(lo, store - 1);
            sort(store + 1, hi);
        };
        sort(0, a.length - 1);
        push(allDone(), "Sorted. Average <code>O(n log n)</code> with excellent cache behaviour and no extra array; worst case <code>O(n²)</code> if pivots are consistently terrible — fixed in practice by random or median-of-three pivots.");
        return frames;
    }

    // heap sort
    push({}, "Heapsort: turn the array into a max-heap in place, then repeatedly swap the root to the end.");
    const sift = (n, i, phase) => {
        while (true) {
            let largest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && a[l] > a[largest]) largest = l;
            if (r < n && a[r] > a[largest]) largest = r;
            const marks = {};
            for (let t = n; t < a.length; t += 1) marks[t] = "is-done";
            marks[i] = "is-act";
            if (l < n) marks[l] = "is-cmp";
            if (r < n) marks[r] = "is-cmp";
            push(marks, `${phase}: node at index <code>${i}</code> versus children <code>${l}</code>/<code>${r}</code>. ${largest === i ? "Heap property already holds here — stop." : `Child <code>${a[largest]}</code> is bigger → swap down.`}`);
            if (largest === i) return;
            [a[i], a[largest]] = [a[largest], a[i]];
            i = largest;
        }
    };
    for (let i = (a.length >> 1) - 1; i >= 0; i -= 1) sift(a.length, i, "Build heap");
    push({}, "The array is now a valid max-heap: <code>a[i] &ge; a[2i+1]</code> and <code>a[i] &ge; a[2i+2]</code>. Building it takes only <code>O(n)</code>.");
    for (let end = a.length - 1; end > 0; end -= 1) {
        [a[0], a[end]] = [a[end], a[0]];
        const marks = {};
        for (let t = end; t < a.length; t += 1) marks[t] = "is-done";
        marks[0] = "is-act";
        push(marks, `Swap the max <code>${a[end]}</code> to index <code>${end}</code> — it is final. Then sift the new root back down over the shrunken heap.`);
        sift(end, 0, "Restore heap");
    }
    push(allDone(), "Sorted. Guaranteed <code>O(n log n)</code>, <code>O(1)</code> extra space, but not stable and its jumpy memory access makes it slower than quicksort in practice.");
    return frames;
};

VIZ.sorting = {
    title: "Sorting algorithms, step by step",
    legend: [
        ["lg-cmp", "comparing"],
        ["lg-act", "writing / swapping"],
        ["lg-done", "final position"],
        ["lg-out", "pivot"],
    ],
    options: [
        { value: "bubble", label: "Bubble sort" },
        { value: "selection", label: "Selection sort" },
        { value: "insertion", label: "Insertion sort" },
        { value: "merge", label: "Merge sort" },
        { value: "quick", label: "Quicksort" },
        { value: "heap", label: "Heapsort" },
    ],
    build: (option) => sortFrames(option || "bubble"),
};

/* ---- 9. Tree traversal ---- */

const TREE = [
    { v: 8, x: 300, y: 40, l: 1, r: 2 },
    { v: 3, x: 170, y: 115, l: 3, r: 4 },
    { v: 10, x: 430, y: 115, l: null, r: 5 },
    { v: 1, x: 105, y: 190, l: null, r: null },
    { v: 6, x: 235, y: 190, l: 6, r: 7 },
    { v: 14, x: 495, y: 190, l: 8, r: null },
    { v: 4, x: 195, y: 262, l: null, r: null },
    { v: 7, x: 285, y: 262, l: null, r: null },
    { v: 13, x: 445, y: 262, l: null, r: null },
];

const renderTree = (states, extra = "") => {
    let body = "";
    TREE.forEach((node, i) => {
        [node.l, node.r].forEach((child) => {
            if (child === null) return;
            const state = states[child] && states[child] !== "n-idle" && states[i] && states[i] !== "n-idle" ? "e-done" : "e-idle";
            body += edgeHTML(node.x, node.y + 20, TREE[child].x, TREE[child].y - 20, state);
        });
    });
    TREE.forEach((node, i) => {
        body += nodeHTML(node.x, node.y, node.v, states[i] || "n-idle");
    });
    return svgHTML(600, 310, body) + extra;
};

const visitedList = (order) =>
    `<div class="cells" style="margin-top:8px">${order.length
        ? order.map((v) => `<div class="cell is-done"><div class="cell-box">${v}</div><div class="cell-idx"></div></div>`).join("")
        : '<div class="cell is-ghost"><div class="cell-box">–</div><div class="cell-idx"></div></div>'
    }</div>`;

const traversalFrames = (mode) => {
    const frames = [];
    const states = {};
    const order = [];
    const snap = (note) => frames.push({ stage: renderTree({ ...states }, visitedList(order)), note });

    const explain = {
        preorder: "Pre-order (node → left → right). Use it to copy a tree or serialise its shape.",
        inorder: "In-order (left → node → right). On a BST this emits values in sorted order.",
        postorder: "Post-order (left → right → node). Children are finished before the parent — perfect for deleting a tree or evaluating an expression.",
        level: "Level-order / BFS (queue based). Visits the tree layer by layer, so the first match found is also the shallowest.",
    };
    snap(explain[mode]);

    if (mode === "level") {
        const queue = [0];
        while (queue.length) {
            const i = queue.shift();
            states[i] = "n-act";
            snap(`Dequeue <code>${TREE[i].v}</code>, visit it, then enqueue its children. The queue holds exactly the current frontier.`);
            order.push(TREE[i].v);
            states[i] = "n-done";
            if (TREE[i].l !== null) queue.push(TREE[i].l);
            if (TREE[i].r !== null) queue.push(TREE[i].r);
            snap(`Visited <code>${TREE[i].v}</code>. Queue now holds [${queue.map((q) => TREE[q].v).join(", ") || "empty"}].`);
        }
    } else {
        const walk = (i) => {
            if (i === null) return;
            states[i] = "n-cmp";
            snap(`Enter <code>${TREE[i].v}</code> (a new stack frame).`);
            if (mode === "preorder") {
                states[i] = "n-act";
                order.push(TREE[i].v);
                snap(`Pre-order: visit <code>${TREE[i].v}</code> <em>before</em> descending.`);
                states[i] = "n-done";
            }
            walk(TREE[i].l);
            if (mode === "inorder") {
                states[i] = "n-act";
                order.push(TREE[i].v);
                snap(`In-order: left subtree is done, so visit <code>${TREE[i].v}</code> now.`);
                states[i] = "n-done";
            }
            walk(TREE[i].r);
            if (mode === "postorder") {
                states[i] = "n-act";
                order.push(TREE[i].v);
                snap(`Post-order: both children finished, so visit <code>${TREE[i].v}</code> last.`);
            }
            states[i] = "n-done";
        };
        walk(0);
    }
    frames.push({
        stage: renderTree(Object.fromEntries(TREE.map((_, i) => [i, "n-done"])), visitedList(order)),
        note: `Complete. Order: <code>${order.join(" → ")}</code>. Every traversal touches each node exactly once, so all four are <code>O(n)</code> time; recursion costs <code>O(h)</code> stack space and BFS costs <code>O(w)</code> queue space.`,
    });
    return frames;
};

VIZ.traversal = {
    title: "Binary tree traversals",
    legend: [["lg-cmp", "on the stack"], ["lg-act", "visiting now"], ["lg-done", "finished"]],
    options: [
        { value: "inorder", label: "In-order" },
        { value: "preorder", label: "Pre-order" },
        { value: "postorder", label: "Post-order" },
        { value: "level", label: "Level-order (BFS)" },
    ],
    build: (option) => traversalFrames(option || "inorder"),
};

/* ---- 10. BST search ---- */

VIZ["bst-search"] = {
    title: "Searching a BST for 7",
    legend: [["lg-act", "current node"], ["lg-idle", "pruned subtree"], ["lg-done", "found"]],
    build() {
        const frames = [];
        const target = 7;
        const states = {};
        let i = 0;
        frames.push({ stage: renderTree({}), note: `Every node obeys the BST rule: everything in the left subtree is smaller, everything in the right subtree is larger. Searching for <code>${target}</code>.` });
        while (i !== null) {
            states[i] = "n-act";
            const node = TREE[i];
            if (node.v === target) {
                states[i] = "n-done";
                frames.push({ stage: renderTree({ ...states }), note: `Found <code>${target}</code>. Only ${Object.keys(states).length} nodes were ever examined out of ${TREE.length}.` });
                break;
            }
            const goLeft = target < node.v;
            frames.push({
                stage: renderTree({ ...states }),
                note: `At <code>${node.v}</code>: <code>${target} ${goLeft ? "&lt;" : "&gt;"} ${node.v}</code>, so the answer can only be in the ${goLeft ? "left" : "right"} subtree. The other side is discarded without looking at it.`,
            });
            states[i] = "n-cmp";
            i = goLeft ? node.l : node.r;
            if (i === null) {
                frames.push({ stage: renderTree({ ...states }), note: `Hit a null link — the value is not in the tree.` });
                break;
            }
        }
        frames.push({
            stage: renderTree({ ...states }),
            note: `Each step drops one level, so search is <code>O(h)</code>. On a balanced tree <code>h ≈ log n</code>; on a tree built from sorted inserts <code>h = n</code> and the BST degenerates into a linked list — which is exactly why AVL and red-black trees exist.`,
        });
        return frames;
    },
};

/* ---- 11. Heap push / pop ---- */

VIZ.heap = {
    title: "Binary min-heap: push and pop",
    legend: [["lg-act", "moving node"], ["lg-cmp", "compared with parent/child"], ["lg-done", "settled"]],
    build() {
        const frames = [];
        const heap = [];
        const positions = [
            [300, 40], [190, 115], [410, 115], [130, 190], [250, 190], [350, 190], [470, 190],
            [100, 260], [165, 260], [220, 260], [280, 260],
        ];

        const render = (marks, note) => {
            let body = "";
            heap.forEach((_, i) => {
                if (i === 0) return;
                const p = (i - 1) >> 1;
                body += edgeHTML(positions[p][0], positions[p][1] + 18, positions[i][0], positions[i][1] - 18, "e-idle");
            });
            heap.forEach((v, i) => {
                body += nodeHTML(positions[i][0], positions[i][1], v, marks[i] || "n-idle", 18, `[${i}]`);
            });
            const arrayView = cellsHTML(heap, Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, v === "n-act" ? "is-act" : v === "n-cmp" ? "is-cmp" : "is-done"])));
            frames.push({ stage: svgHTML(600, 300, body) + arrayView, note });
        };

        render({}, "A heap is a complete binary tree stored in a plain array: children of index <code>i</code> live at <code>2i+1</code> and <code>2i+2</code>, the parent at <code>(i-1)//2</code>. No pointers needed.");

        [15, 9, 20, 4, 11, 6].forEach((value) => {
            heap.push(value);
            let i = heap.length - 1;
            render({ [i]: "n-act" }, `Push <code>${value}</code> at the end of the array to keep the tree complete.`);
            while (i > 0) {
                const p = (i - 1) >> 1;
                render({ [i]: "n-act", [p]: "n-cmp" }, `Sift up: is <code>${heap[i]} &lt; ${heap[p]}</code>? ${heap[i] < heap[p] ? "Yes → swap with the parent." : "No → heap property restored, stop."}`);
                if (heap[i] >= heap[p]) break;
                [heap[i], heap[p]] = [heap[p], heap[i]];
                i = p;
            }
            render({}, `<code>${value}</code> settled. Each push touches at most <code>log n</code> levels.`);
        });

        const min = heap[0];
        const last = heap.pop();
        if (heap.length) heap[0] = last;
        render({ 0: "n-act" }, `Pop: the minimum <code>${min}</code> is always at the root. Move the last element <code>${last}</code> into the root so the tree stays complete.`);
        let i = 0;
        while (true) {
            let small = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < heap.length && heap[l] < heap[small]) small = l;
            if (r < heap.length && heap[r] < heap[small]) small = r;
            const marks = { [i]: "n-act" };
            if (l < heap.length) marks[l] = "n-cmp";
            if (r < heap.length) marks[r] = "n-cmp";
            render(marks, `Sift down: compare with children. ${small === i ? "Both children are larger — done." : `<code>${heap[small]}</code> is smaller → swap down.`}`);
            if (small === i) break;
            [heap[i], heap[small]] = [heap[small], heap[i]];
            i = small;
        }
        render({}, `Heap restored. Push and pop are both <code>O(log n)</code>, peeking at the minimum is <code>O(1)</code> — that is the contract a priority queue gives you.`);
        return frames;
    },
};

/* ---- 12. Trie ---- */

VIZ.trie = {
    title: "Trie: inserting and searching words",
    legend: [["lg-act", "current character"], ["lg-done", "end of a word"], ["lg-cmp", "path walked"]],
    build() {
        const frames = [];
        const root = { ch: "", kids: {}, end: false, x: 300, y: 30 };

        const layout = () => {
            let leaf = 0;
            const place = (node, depth) => {
                const kids = Object.values(node.kids);
                if (!kids.length) {
                    node.x = 60 + leaf * 68;
                    leaf += 1;
                } else {
                    kids.forEach((k) => place(k, depth + 1));
                    node.x = (kids[0].x + kids[kids.length - 1].x) / 2;
                }
                node.y = 32 + depth * 62;
            };
            place(root, 0);
        };

        const render = (marks, note) => {
            layout();
            let body = "";
            const edges = (node) => {
                Object.values(node.kids).forEach((k) => {
                    body += edgeHTML(node.x, node.y + 16, k.x, k.y - 16, marks[k.id] === "n-cmp" || marks[k.id] === "n-act" ? "e-act" : "e-idle");
                    edges(k);
                });
            };
            const circles = (node) => {
                const state = marks[node.id] || (node.end ? "n-done" : "n-idle");
                body += nodeHTML(node.x, node.y, node.ch || "•", state, 16);
                Object.values(node.kids).forEach(circles);
            };
            edges(root);
            circles(root);
            frames.push({ stage: svgHTML(600, 290, body), note });
        };

        let uid = 0;
        root.id = `n${uid++}`;
        render({}, "A trie stores keys along the <em>path</em>, not in the nodes. The root is the empty prefix; shared prefixes are stored exactly once.");

        ["cat", "car", "card", "dog"].forEach((word) => {
            let node = root;
            const marks = {};
            [...word].forEach((ch) => {
                const isNew = !node.kids[ch];
                if (isNew) node.kids[ch] = { ch, kids: {}, end: false, id: `n${uid++}` };
                node = node.kids[ch];
                marks[node.id] = "n-act";
                render({ ...marks }, `Insert "<code>${word}</code>": character <code>${ch}</code> — ${isNew ? "no edge existed, so create a node." : "an edge already exists, so we just reuse the shared prefix."}`);
                marks[node.id] = "n-cmp";
            });
            node.end = true;
            render({}, `Mark the last node as end-of-word. "<code>${word}</code>" is now stored in <code>O(len)</code> time, completely independent of how many words the trie holds.`);
        });

        let node = root;
        const marks = {};
        [..."car"].forEach((ch) => {
            node = node.kids[ch];
            marks[node.id] = "n-act";
            render({ ...marks }, `Search "<code>car</code>": follow edge <code>${ch}</code>.`);
            marks[node.id] = "n-cmp";
        });
        render({ ...marks }, `Reached a node flagged as end-of-word → "<code>car</code>" exists. Everything hanging below this node (<code>card</code>) is an autocomplete suggestion — that is the trie's killer feature.`);
        return frames;
    },
};

/* ---- 13. Union-Find ---- */

VIZ.dsu = {
    title: "Union-Find with path compression",
    legend: [["lg-act", "root"], ["lg-cmp", "being merged"], ["lg-done", "compressed"]],
    build() {
        const n = 7;
        const parent = Array.from({ length: n }, (_, i) => i);
        const rank = new Array(n).fill(0);
        const frames = [];
        const pos = Array.from({ length: n }, (_, i) => [55 + i * 82, 210]);

        const render = (marks, note) => {
            let body = "";
            for (let i = 0; i < n; i += 1) {
                if (parent[i] !== i) {
                    const [x1, y1] = pos[i];
                    const [x2, y2] = pos[parent[i]];
                    body += `<path d="M ${x1} ${y1 - 20} Q ${(x1 + x2) / 2} ${y1 - 110} ${x2} ${y2 - 20}" class="${marks[i] ? "e-act" : "e-idle"}"/>`;
                }
            }
            for (let i = 0; i < n; i += 1) {
                body += nodeHTML(pos[i][0], pos[i][1], i, marks[i] || (parent[i] === i ? "n-act" : "n-idle"), 20, `p=${parent[i]}`);
            }
            frames.push({ stage: svgHTML(620, 250, body), note });
        };

        const find = (x, trace = []) => {
            while (parent[x] !== x) {
                trace.push(x);
                x = parent[x];
            }
            return x;
        };

        render({}, "Seven elements, each its own set — every node points at itself, so every node is its own root.");

        const unions = [[0, 1], [2, 3], [1, 3], [4, 5], [5, 6]];
        unions.forEach(([a, b]) => {
            const ra = find(a);
            const rb = find(b);
            render({ [a]: "n-cmp", [b]: "n-cmp" }, `<code>union(${a}, ${b})</code>: first <code>find</code> the root of each — roots are <code>${ra}</code> and <code>${rb}</code>.`);
            if (ra === rb) {
                render({}, `Same root already — they were connected, nothing to do. (In Kruskal's algorithm this is exactly how you detect a cycle.)`);
                return;
            }
            if (rank[ra] < rank[rb]) parent[ra] = rb;
            else if (rank[rb] < rank[ra]) parent[rb] = ra;
            else {
                parent[rb] = ra;
                rank[ra] += 1;
            }
            render({ [ra]: "n-act", [rb]: "n-act" }, `Attach the shallower tree under the deeper one (<strong>union by rank</strong>). This keeps trees from growing tall.`);
        });

        const trace = [];
        const root = find(6, trace);
        render(Object.fromEntries(trace.map((t) => [t, "n-cmp"])), `<code>find(6)</code> walks the chain ${trace.join(" → ")} → ${root}.`);
        trace.forEach((t) => (parent[t] = root));
        render(Object.fromEntries(trace.map((t) => [t, "n-done"])), `<strong>Path compression</strong>: every node on that path is re-pointed straight at the root. The next <code>find</code> is one hop. Combined with union by rank, operations run in <code>O(α(n))</code> — effectively constant.`);
        return frames;
    },
};

/* ---- 14 & 15. Graph traversal and Dijkstra ---- */

const GRAPH_NODES = [
    { id: "A", x: 70, y: 150 },
    { id: "B", x: 200, y: 55 },
    { id: "C", x: 200, y: 245 },
    { id: "D", x: 340, y: 150 },
    { id: "E", x: 480, y: 55 },
    { id: "F", x: 480, y: 245 },
];
const GRAPH_EDGES = [
    ["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5],
    ["C", "D", 8], ["C", "F", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 3],
];
const ADJ = {};
GRAPH_NODES.forEach((n) => (ADJ[n.id] = []));
GRAPH_EDGES.forEach(([a, b, w]) => {
    ADJ[a].push([b, w]);
    ADJ[b].push([a, w]);
});
const NODE_AT = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n]));

const renderGraph = (states, edgeStates = {}, labels = {}, showWeights = true) => {
    let body = "";
    GRAPH_EDGES.forEach(([a, b, w]) => {
        const key = `${a}-${b}`;
        const na = NODE_AT[a];
        const nb = NODE_AT[b];
        body += edgeHTML(na.x, na.y, nb.x, nb.y, edgeStates[key] || "e-idle");
        if (showWeights) {
            body += `<circle cx="${(na.x + nb.x) / 2}" cy="${(na.y + nb.y) / 2}" r="11" fill="#11151a"/>`;
            body += `<text x="${(na.x + nb.x) / 2}" y="${(na.y + nb.y) / 2}" class="n-sub" dominant-baseline="central">${w}</text>`;
        }
    });
    GRAPH_NODES.forEach((n) => {
        body += nodeHTML(n.x, n.y, n.id, states[n.id] || "n-idle", 22, labels[n.id] ?? "");
    });
    return svgHTML(560, 310, body);
};

VIZ["graph-traversal"] = {
    title: "Graph traversal from A",
    legend: [["lg-cmp", "discovered / in frontier"], ["lg-act", "processing"], ["lg-done", "visited"]],
    options: [
        { value: "bfs", label: "Breadth-first search" },
        { value: "dfs", label: "Depth-first search" },
    ],
    build(option) {
        const mode = option || "bfs";
        const frames = [];
        const states = {};
        const edges = {};
        const visited = new Set();
        const order = [];
        const frontier = ["A"];
        const dist = { A: 0 };

        const label = () => (mode === "bfs" ? Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, `depth ${v}`])) : {});
        const snap = (note) =>
            frames.push({ stage: renderGraph({ ...states }, { ...edges }, label(), false), note });

        states.A = "n-cmp";
        snap(
            mode === "bfs"
                ? "BFS uses a <strong>queue</strong>. Start at A: mark it discovered and enqueue it. Because we expand the closest nodes first, BFS finds the fewest-edges path in an unweighted graph."
                : "DFS uses a <strong>stack</strong> (or recursion). Start at A and commit to one branch as deep as it goes before backtracking."
        );

        while (frontier.length) {
            const node = mode === "bfs" ? frontier.shift() : frontier.pop();
            if (visited.has(node)) continue;
            visited.add(node);
            order.push(node);
            states[node] = "n-act";
            snap(`${mode === "bfs" ? "Dequeue" : "Pop"} <code>${node}</code> and process it. Frontier: [${frontier.join(", ") || "empty"}].`);

            const neighbours = ADJ[node].map(([to]) => to).filter((to) => !visited.has(to));
            neighbours.forEach((to) => {
                const key = GRAPH_EDGES.some(([a, b]) => a === node && b === to) ? `${node}-${to}` : `${to}-${node}`;
                edges[key] = "e-act";
                if (!(to in dist)) dist[to] = dist[node] + 1;
                if (states[to] !== "n-done") states[to] = "n-cmp";
                frontier.push(to);
            });
            states[node] = "n-done";
            snap(
                neighbours.length
                    ? `Discovered neighbours [${neighbours.join(", ")}] and ${mode === "bfs" ? "enqueued" : "pushed"} them. The <code>visited</code> set is what stops us looping forever around cycles.`
                    : `No unvisited neighbours — ${mode === "bfs" ? "move on to the next item in the queue" : "backtrack to the previous node on the stack"}.`
            );
        }

        frames.push({
            stage: renderGraph({ ...states }, { ...edges }, label(), false),
            note: `Visit order: <code>${order.join(" → ")}</code>. Both traversals are <code>O(V + E)</code>. ${mode === "bfs"
                ? "BFS also hands you shortest hop counts for free, at the cost of <code>O(V)</code> queue memory."
                : "DFS uses only <code>O(h)</code> memory and is the backbone of cycle detection, topological sort and connected components."
                }`,
        });
        return frames;
    },
};

VIZ.dijkstra = {
    title: "Dijkstra's shortest paths from A",
    legend: [["lg-act", "settling"], ["lg-cmp", "relaxing edge"], ["lg-done", "final distance"]],
    build() {
        const frames = [];
        const dist = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, Infinity]));
        const prev = {};
        const done = new Set();
        dist.A = 0;
        const states = {};
        const labels = () =>
            Object.fromEntries(GRAPH_NODES.map((n) => [n.id, dist[n.id] === Infinity ? "∞" : String(dist[n.id])]));
        const snap = (note, edgeStates = {}) => frames.push({ stage: renderGraph({ ...states }, edgeStates, labels()), note });

        snap("Every distance starts at ∞ except the source. Dijkstra always settles the closest unfinished node — that greedy choice is safe only because all weights are non-negative.");

        while (done.size < GRAPH_NODES.length) {
            let best = null;
            GRAPH_NODES.forEach((n) => {
                if (!done.has(n.id) && (best === null || dist[n.id] < dist[best])) best = n.id;
            });
            if (dist[best] === Infinity) break;
            states[best] = "n-act";
            snap(`Smallest tentative distance among unfinished nodes is <code>${best} = ${dist[best]}</code>. A priority queue gives us this in <code>O(log V)</code>.`);

            ADJ[best].forEach(([to, w]) => {
                if (done.has(to)) return;
                const key = GRAPH_EDGES.some(([a, b]) => a === best && b === to) ? `${best}-${to}` : `${to}-${best}`;
                const candidate = dist[best] + w;
                const improved = candidate < dist[to];
                if (improved) {
                    dist[to] = candidate;
                    prev[to] = best;
                }
                if (states[to] !== "n-done") states[to] = "n-cmp";
                snap(
                    `Relax edge <code>${best}→${to}</code> (weight ${w}): <code>${dist[best]} + ${w} = ${candidate}</code>. ` +
                    (improved ? `Better than the old value → update <code>dist[${to}] = ${candidate}</code>.` : `Not better than <code>${dist[to]}</code> → keep the old path.`),
                    { [key]: improved ? "e-done" : "e-act" }
                );
            });

            done.add(best);
            states[best] = "n-done";
            snap(`<code>${best}</code> is finalised at <code>${dist[best]}</code>. It can never improve again — no cheaper route can appear later when all weights are ≥ 0.`);
        }

        const treeEdges = {};
        Object.entries(prev).forEach(([to, from]) => {
            const key = GRAPH_EDGES.some(([a, b]) => a === from && b === to) ? `${from}-${to}` : `${to}-${from}`;
            treeEdges[key] = "e-done";
        });
        frames.push({
            stage: renderGraph(Object.fromEntries(GRAPH_NODES.map((n) => [n.id, "n-done"])), treeEdges, labels()),
            note: `Done. The highlighted edges form the shortest-path tree; follow <code>prev</code> backwards from any node to rebuild its route. With a binary heap the whole run is <code>O((V + E) log V)</code>.`,
        });
        return frames;
    },
};

/* ---- 16. DP table (LCS) ---- */

VIZ["dp-lcs"] = {
    title: "Longest common subsequence, bottom-up",
    legend: [["lg-act", "cell being filled"], ["lg-cmp", "cells it depends on"], ["lg-done", "traceback path"]],
    build() {
        const s1 = "ABCBDAB";
        const s2 = "BDCABA";
        const n = s1.length;
        const m = s2.length;
        const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
        const frames = [];

        const view = (marks, done = new Set(), upto = null) => {
            const shown = (i, j) => {
                if (upto === null || i === 0 || j === 0) return true;
                return i < upto[0] || (i === upto[0] && j <= upto[1]);
            };
            const rows = [];
            rows.push(["", "ε", ...[...s2]]);
            for (let i = 0; i <= n; i += 1) {
                rows.push([i === 0 ? "ε" : s1[i - 1], ...dp[i].map((v, j) => (shown(i, j) ? v : ""))]);
            }
            const gm = {};
            rows[0].forEach((_, c) => (gm[`0,${c}`] = "is-head"));
            rows.forEach((_, r) => (gm[`${r},0`] = "is-head"));
            Object.entries(marks).forEach(([k, v]) => {
                const [r, c] = k.split(",").map(Number);
                gm[`${r + 1},${c + 1}`] = v;
            });
            done.forEach((k) => {
                const [r, c] = k.split(",").map(Number);
                gm[`${r + 1},${c + 1}`] = "is-done";
            });
            return gridHTML(rows, gm);
        };

        frames.push({
            stage: view({}, new Set(), [0, 0]),
            note: `<code>dp[i][j]</code> = length of the LCS of the first <code>i</code> characters of "<code>${s1}</code>" and the first <code>j</code> of "<code>${s2}</code>". Row 0 and column 0 are 0 because an empty string shares nothing.`,
        });

        for (let i = 1; i <= n; i += 1) {
            for (let j = 1; j <= m; j += 1) {
                const match = s1[i - 1] === s2[j - 1];
                const marks = { [`${i},${j}`]: "is-act" };
                if (match) marks[`${i - 1},${j - 1}`] = "is-cmp";
                else {
                    marks[`${i - 1},${j}`] = "is-cmp";
                    marks[`${i},${j - 1}`] = "is-cmp";
                }
                dp[i][j] = match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
                if (i * m + j <= 14 || j === m || match) {
                    frames.push({
                        stage: view(marks, new Set(), [i, j]),
                        note: match
                            ? `<code>${s1[i - 1]} == ${s2[j - 1]}</code> → the characters pair up, so <code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}</code>.`
                            : `<code>${s1[i - 1]} ≠ ${s2[j - 1]}</code> → drop one character from either string and keep the better result: <code>max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}</code>.`,
                    });
                }
            }
        }

        const path = new Set();
        const chars = [];
        let i = n;
        let j = m;
        while (i > 0 && j > 0) {
            if (s1[i - 1] === s2[j - 1]) {
                path.add(`${i},${j}`);
                chars.unshift(s1[i - 1]);
                i -= 1;
                j -= 1;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) i -= 1;
            else j -= 1;
        }
        frames.push({
            stage: view({}, path),
            note: `The answer <code>dp[${n}][${m}] = ${dp[n][m]}</code> sits in the corner. Walking backwards through the choices rebuilds the actual subsequence "<code>${chars.join("")}</code>". Filling <code>n×m</code> cells at <code>O(1)</code> each gives <code>O(n·m)</code> time and space.`,
        });
        return frames;
    },
};

/* ---- 17. 0/1 Knapsack ---- */

VIZ.knapsack = {
    title: "0/1 knapsack DP table",
    legend: [["lg-act", "current cell"], ["lg-cmp", "skip vs take"], ["lg-done", "chosen items"]],
    build() {
        const items = [
            { name: "map", w: 1, v: 15 },
            { name: "rope", w: 3, v: 20 },
            { name: "tent", w: 4, v: 30 },
            { name: "stove", w: 2, v: 18 },
        ];
        const cap = 6;
        const dp = Array.from({ length: items.length + 1 }, () => new Array(cap + 1).fill(0));
        const frames = [];

        const view = (marks, done = new Set(), upto = null) => {
            const shown = (i, c) => {
                if (upto === null || i === 0) return true;
                return i < upto[0] || (i === upto[0] && c <= upto[1]);
            };
            const rows = [["item\\cap", ...Array.from({ length: cap + 1 }, (_, c) => c)]];
            for (let i = 0; i <= items.length; i += 1) {
                rows.push([i === 0 ? "none" : items[i - 1].name, ...dp[i].map((v, c) => (shown(i, c) ? v : ""))]);
            }
            const gm = {};
            rows[0].forEach((_, c) => (gm[`0,${c}`] = "is-head"));
            rows.forEach((_, r) => (gm[`${r},0`] = "is-head"));
            Object.entries(marks).forEach(([k, v]) => {
                const [r, c] = k.split(",").map(Number);
                gm[`${r + 1},${c + 1}`] = v;
            });
            done.forEach((k) => {
                const [r, c] = k.split(",").map(Number);
                gm[`${r + 1},${c + 1}`] = "is-done";
            });
            return gridHTML(rows, gm);
        };

        frames.push({
            stage: view({}, new Set(), [0, cap]),
            note: `Capacity ${cap}. <code>dp[i][c]</code> = best value using only the first <code>i</code> items with capacity <code>c</code>. Row "none" is all zeros: no items, no value.`,
        });

        for (let i = 1; i <= items.length; i += 1) {
            const it = items[i - 1];
            for (let c = 0; c <= cap; c += 1) {
                const skip = dp[i - 1][c];
                const take = it.w <= c ? dp[i - 1][c - it.w] + it.v : -1;
                dp[i][c] = Math.max(skip, take);
                const marks = { [`${i},${c}`]: "is-act", [`${i - 1},${c}`]: "is-cmp" };
                if (take >= 0) marks[`${i - 1},${c - it.w}`] = "is-cmp";
                if (c === cap || c === it.w || c === 0) {
                    frames.push({
                        stage: view(marks, new Set(), [i, c]),
                        note:
                            take < 0
                                ? `<code>${it.name}</code> weighs ${it.w} &gt; capacity ${c}, so we must skip it: <code>dp[${i}][${c}] = ${skip}</code>.`
                                : `Two options at capacity ${c}: <strong>skip</strong> <code>${it.name}</code> for ${skip}, or <strong>take</strong> it for <code>${it.v} + dp[${i - 1}][${c - it.w}] = ${take}</code>. Keep <code>${dp[i][c]}</code>.`,
                    });
                }
            }
            frames.push({ stage: view({}, new Set(), [i, cap]), note: `Row for <code>${it.name}</code> complete. Each row only ever reads the row above — which is why you can compress this to a single 1-D array iterated right-to-left.` });
        }

        const chosen = new Set();
        let c = cap;
        const picked = [];
        for (let i = items.length; i > 0; i -= 1) {
            if (dp[i][c] !== dp[i - 1][c]) {
                chosen.add(`${i},${c}`);
                picked.unshift(items[i - 1].name);
                c -= items[i - 1].w;
            }
        }
        frames.push({
            stage: view({}, chosen),
            note: `Best value <code>${dp[items.length][cap]}</code> using {${picked.join(", ")}}. Traceback: a cell that differs from the one above means that item was taken. Time and space <code>O(n·W)</code> — <em>pseudo</em>-polynomial, since <code>W</code> is a value not an input length.`,
        });
        return frames;
    },
};

/* ---- 18. Bit manipulation ---- */

VIZ.bits = {
    title: "Bit tricks on an 8-bit value",
    legend: [["lg-act", "changed bit"], ["lg-done", "set bit"], ["lg-idle", "clear bit"]],
    build() {
        const frames = [];
        const show = (value, prev, note, label) => {
            const bits = value.toString(2).padStart(8, "0").split("");
            const old = prev === null ? bits : prev.toString(2).padStart(8, "0").split("");
            const marks = {};
            const tags = {};
            bits.forEach((b, i) => {
                if (b !== old[i]) marks[i] = "is-act";
                else if (b === "1") marks[i] = "is-done";
                else marks[i] = "is-dim";
                tags[i] = String(7 - i);
            });
            frames.push({
                stage: cellsHTML(bits, marks, tags) + `<div class="viz-caption">${label} &nbsp;=&nbsp; ${value} &nbsp;=&nbsp; 0b${value.toString(2).padStart(8, "0")}</div>`,
                note,
            });
        };

        let x = 0b00101100;
        show(x, null, "Start with <code>x = 44</code>. The small numbers are bit positions; bit 0 is the least significant (rightmost).", "x");
        show(x | (1 << 4), x, "<strong>Set</strong> bit 4: <code>x | (1 &lt;&lt; 4)</code>. OR forces that position to 1 and leaves everything else alone.", "x | (1&lt;&lt;4)");
        x |= 1 << 4;
        show(x & ~(1 << 2), x, "<strong>Clear</strong> bit 2: <code>x &amp; ~(1 &lt;&lt; 2)</code>. The mask is all 1s except at position 2, so AND wipes exactly that bit.", "x &amp; ~(1&lt;&lt;2)");
        x &= ~(1 << 2);
        show(x ^ (1 << 0), x, "<strong>Toggle</strong> bit 0: <code>x ^ (1 &lt;&lt; 0)</code>. XOR flips a bit — applying it twice returns the original value.", "x ^ 1");
        x ^= 1 << 0;
        show(x >> 1, x, "<strong>Shift right</strong>: <code>x &gt;&gt; 1</code> divides by 2 (floor) and drops the lowest bit off the end.", "x &gt;&gt; 1");
        const y = 0b00110000;
        show(y & -y, null, "<strong>Lowest set bit</strong>: <code>y &amp; -y</code> isolates the rightmost 1. Two's complement makes <code>-y</code> flip everything above that bit, so AND leaves just it. Used by Fenwick trees.", "y &amp; -y");
        show(y & (y - 1), y, "<strong>Clear the lowest set bit</strong>: <code>y &amp; (y - 1)</code>. Loop this and count iterations to get a popcount in <code>O(set bits)</code> — Brian Kernighan's trick.", "y &amp; (y-1)");
        return frames;
    },
};

/* ==========================================================================
   Advanced course widgets
   ========================================================================== */

const rowHTML = (label, inner) => `<div class="vrow"><span class="vrow-label">${label}</span>${inner}</div>`;
const stackHTML = (...rows) => `<div class="vstack">${rows.join("")}</div>`;
const chipsHTML = (items, marks = {}) =>
    `<div class="chips">${items.length
        ? items.map((t, i) => `<span class="chip ${marks[i] || ""}">${esc(t)}</span>`).join("")
        : '<span class="chip is-ghost">empty</span>'
    }</div>`;
const rectSVG = (x, y, w, h, cls = "", rx = 4) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="vz-rect ${cls}"/>`;
const textSVG = (x, y, t, cls = "") => `<text x="${x}" y="${y}" class="vz-text ${cls}">${esc(t)}</text>`;

/* ---- A1. Contribution technique (1-D) ---- */

VIZ["contribution-subarray"] = {
    title: "Contribution of each element to the sum of all subarray sums",
    legend: [["lg-act", "element i"], ["lg-cmp", "possible starts"], ["lg-done", "possible ends"]],
    build() {
        const A = [6, 8, -1];
        const n = A.length;
        const frames = [];
        let total = 0;
        const containing = (i) => {
            const out = [];
            for (let s = 0; s <= i; s += 1) for (let e = i; e < n; e += 1) out.push(`[${s},${e}]`);
            return out;
        };
        const view = (marks, tags, subs) =>
            stackHTML(
                rowHTML("A", cellsHTML(A, marks, tags)),
                rowHTML("contain i", chipsHTML(subs)),
                rowHTML("total", chipsHTML([String(total)], { 0: "is-done" }))
            );

        frames.push({ stage: view({}, {}, []), note: `Brute force lists all <code>n(n+1)/2 = 6</code> subarrays and adds each one. Flip the question: <em>how many subarrays contain each element?</em>` });
        A.forEach((v, i) => {
            const marks = {};
            const tags = {};
            for (let s = 0; s <= i; s += 1) {
                marks[s] = "is-cmp";
                tags[s] = "start";
            }
            for (let e = i; e < n; e += 1) {
                marks[e] = "is-done";
                tags[e] = "end";
            }
            marks[i] = "is-active";
            tags[i] = "i";
            const count = (i + 1) * (n - i);
            frames.push({
                stage: view(marks, tags, containing(i)),
                note: `Index <code>${i}</code>: a subarray containing it starts in <code>[0, ${i}]</code> — ${i + 1} choice${i ? "s" : ""} — and ends in <code>[${i}, ${n - 1}]</code> — ${n - i} choice${n - i > 1 ? "s" : ""}. So it sits in <code>${i + 1} × ${n - i} = ${count}</code> subarrays.`,
            });
            total += v * count;
            frames.push({
                stage: view(marks, tags, containing(i)),
                note: `Contribution of <code>A[${i}] = ${v}</code> is <code>${v} × ${count} = ${v * count}</code>. Running total <code>${total}</code>.`,
            });
        });
        frames.push({
            stage: view(Object.fromEntries(A.map((_, i) => [i, "is-done"])), {}, []),
            note: `Total <code>${total}</code> — the same as <code>6 + 14 + 13 + 8 + 7 - 1</code>, but found in one <code>O(n)</code> pass without building a single subarray.`,
        });
        return frames;
    },
};

/* ---- A2. Contribution technique (2-D) ---- */

VIZ["contribution-matrix"] = {
    title: "Counting submatrices that contain a cell",
    legend: [["lg-act", "the cell"], ["lg-cmp", "top-left corner choices"], ["lg-done", "bottom-right corner choices"]],
    build() {
        const frames = [];
        const withHeaders = (n, m, value, cellMark) => {
            const rows = [["", ...Array.from({ length: m }, (_, c) => c)]];
            const gm = {};
            for (let c = 0; c <= m; c += 1) gm[`0,${c}`] = "is-head";
            for (let r = 0; r < n; r += 1) {
                rows.push([r, ...Array.from({ length: m }, (_, c) => value(r, c))]);
                gm[`${r + 1},0`] = "is-head";
                for (let c = 0; c < m; c += 1) {
                    const cls = cellMark(r, c);
                    if (cls) gm[`${r + 1},${c + 1}`] = cls;
                }
            }
            return gridHTML(rows, gm);
        };

        const [n, m, ci, cj] = [4, 5, 1, 2];
        const inTL = (r, c) => r <= ci && c <= cj;
        const inBR = (r, c) => r >= ci && c >= cj;
        frames.push({
            stage: withHeaders(n, m, (r, c) => (r === ci && c === cj ? "★" : "·"), (r, c) => (r === ci && c === cj ? "is-act" : "")),
            note: `A 4 × 5 matrix. In how many submatrices is cell <code>(1, 2)</code> present? A submatrix is fixed by its top-left and bottom-right corners.`,
        });
        frames.push({
            stage: withHeaders(n, m, (r, c) => (r === ci && c === cj ? "★" : inTL(r, c) ? "TL" : "·"), (r, c) => (r === ci && c === cj ? "is-act" : inTL(r, c) ? "is-cmp" : "")),
            note: `The top-left corner must be above and left of the cell: rows <code>0..1</code>, columns <code>0..2</code> → <code>(i+1)(j+1) = 2 × 3 = 6</code> choices.`,
        });
        frames.push({
            stage: withHeaders(n, m, (r, c) => (r === ci && c === cj ? "★" : inTL(r, c) ? "TL" : inBR(r, c) ? "BR" : "·"), (r, c) => (r === ci && c === cj ? "is-act" : inTL(r, c) ? "is-cmp" : inBR(r, c) ? "is-done" : "")),
            note: `The bottom-right corner must be below and right: rows <code>1..3</code>, columns <code>2..4</code> → <code>(n-i)(m-j) = 3 × 3 = 9</code> choices. Every pair works, so <code>6 × 9 = 54</code> submatrices.`,
        });

        const M = [[4, 9, 6], [5, -1, 2]];
        const R = M.length;
        const C = M[0].length;
        let total = 0;
        for (let i = 0; i < R; i += 1) {
            for (let j = 0; j < C; j += 1) {
                const tl = (i + 1) * (j + 1);
                const br = (R - i) * (C - j);
                total += tl * br * M[i][j];
                frames.push({
                    stage: withHeaders(R, C, (r, c) => M[r][c], (r, c) => (r === i && c === j ? "is-act" : r <= i && c <= j ? "is-cmp" : r >= i && c >= j ? "is-done" : "")),
                    note: `Cell <code>(${i}, ${j}) = ${M[i][j]}</code>: top-left choices <code>${tl}</code>, bottom-right choices <code>${br}</code>, frequency <code>${tl * br}</code>, contribution <code>${tl * br * M[i][j]}</code>. Running total <code>${total}</code>.`,
                });
            }
        }
        frames.push({
            stage: withHeaders(R, C, (r, c) => M[r][c], () => "is-done"),
            note: `Sum of all 18 submatrix sums = <code>${total}</code>, computed in <code>O(n·m)</code> with no submatrix ever enumerated.`,
        });
        return frames;
    },
};

/* ---- A3. Difference array ---- */

VIZ["difference-array"] = {
    title: "Range updates with a difference array",
    legend: [["lg-act", "+value where a range starts"], ["lg-out", "-value just after it ends"], ["lg-done", "settled"]],
    build() {
        const arr = [1, 2, 3, 4, 5];
        const queries = [[0, 2, 2], [1, 3, 3], [2, 4, 4]];
        const n = arr.length;
        const diff = new Array(n).fill(0);
        const running = new Array(n).fill("");
        const result = new Array(n).fill("");
        const frames = [];
        const view = (diffMarks = {}, doneUpTo = -1, note = "") => {
            const done = Object.fromEntries(Array.from({ length: doneUpTo + 1 }, (_, i) => [i, "is-done"]));
            frames.push({
                stage: stackHTML(
                    rowHTML("coins", cellsHTML(arr)),
                    rowHTML("diff", cellsHTML(diff, diffMarks)),
                    rowHTML("running +", cellsHTML(running, done)),
                    rowHTML("final", cellsHTML(result, done))
                ),
                note,
            });
        };

        view({}, -1, `Five beggars start with <code>[1, 2, 3, 4, 5]</code> coins. Three devotees each give <code>value</code> coins to a range. Applying each gift directly is <code>O(n)</code> per query.`);
        queries.forEach(([s, e, v]) => {
            diff[s] += v;
            const marks = { [s]: "is-active" };
            let extra = "";
            if (e + 1 < n) {
                diff[e + 1] -= v;
                marks[e + 1] = "is-out";
            } else extra = ` The matching <code>-${v}</code> would land at index ${e + 1}, past the end, so it is dropped.`;
            view(marks, -1, `Query <code>[${s}, ${e}, ${v}]</code>: <code>diff[${s}] += ${v}</code>${e + 1 < n ? ` and <code>diff[${e + 1}] -= ${v}</code>` : ""}. Only two cells change, whatever the range length.${extra}`);
        });
        let run = 0;
        for (let i = 0; i < n; i += 1) {
            run += diff[i];
            running[i] = run;
            result[i] = arr[i] + run;
            view({ [i]: "is-cmp" }, i, `Sweep: running sum of <code>diff</code> up to ${i} is <code>${run}</code> — the total gift for beggar ${i}. Final coins <code>${arr[i]} + ${run} = ${result[i]}</code>.`);
        }
        view({}, n - 1, `Done: <code>[${result.join(", ")}]</code> in <code>O(n + q)</code>. A difference array is a prefix sum run backwards — mark the edges of each change, then let one sweep spread them.`);
        return frames;
    },
};

/* ---- A4. Dynamic sliding window (count) ---- */

VIZ["window-count"] = {
    title: "Counting subarrays with sum < 6 using a dynamic window",
    legend: [["lg-act", "new right edge"], ["lg-cmp", "window"], ["lg-out", "evicted from the left"]],
    build() {
        const arr = [2, 1, 3, 1, 4, 2];
        const K = 6;
        const frames = [];
        let start = 0;
        let sum = 0;
        let count = 0;
        const snap = (end, note, evicted = null) => {
            const marks = {};
            arr.forEach((_, i) => {
                if (i >= start && i <= end) marks[i] = "is-window";
                else marks[i] = "is-dim";
            });
            if (end >= 0) marks[end] = "is-active";
            if (evicted !== null) marks[evicted] = "is-out";
            const tags = {};
            if (end >= 0) {
                tags[start] = "start";
                tags[end] = start === end ? "start end" : "end";
            }
            frames.push({
                stage: stackHTML(rowHTML("arr", cellsHTML(arr, marks, tags)), rowHTML("sum / count", chipsHTML([`sum = ${sum}`, `count = ${count}`], { 1: "is-done" }))),
                note,
            });
        };
        snap(-1, `All values are positive, so adding an element always raises the sum and removing one always lowers it. That is what makes a shrinking window safe.`);
        for (let end = 0; end < arr.length; end += 1) {
            sum += arr[end];
            snap(end, `Extend the right edge to index ${end}: <code>sum = ${sum}</code>.`);
            while (sum >= K && start <= end) {
                const out = start;
                sum -= arr[start];
                start += 1;
                snap(end, `<code>sum ≥ ${K}</code>, so evict <code>${arr[out]}</code> from the left. <code>sum = ${sum}</code>.`, out);
            }
            count += end - start + 1;
            snap(end, `Every subarray ending at ${end} and starting in <code>[${start}, ${end}]</code> is valid: add <code>${end} - ${start} + 1 = ${end - start + 1}</code>. Count <code>${count}</code>.`);
        }
        snap(arr.length - 1, `Answer <code>${count}</code>. Each index enters once and leaves once, so the nested <code>while</code> still totals <code>O(n)</code>.`);
        return frames;
    },
};

/* ---- A5. Kadane ---- */

VIZ.kadane = {
    title: "Kadane's algorithm: extend or restart",
    legend: [["lg-act", "current element"], ["lg-cmp", "current run"], ["lg-done", "best run so far"]],
    build() {
        const A = [-3, 2, 4, -1, 3, -4, 3];
        const frames = [];
        let curr = 0;
        let best = -Infinity;
        let runStart = 0;
        let bestRange = [0, 0];
        const snap = (i, note) => {
            const marks = {};
            for (let k = bestRange[0]; k <= bestRange[1]; k += 1) marks[k] = "is-done";
            if (i >= 0) for (let k = runStart; k <= i; k += 1) marks[k] = "is-window";
            if (i >= 0) marks[i] = "is-active";
            frames.push({
                stage: stackHTML(rowHTML("A", cellsHTML(A, marks)), rowHTML("state", chipsHTML([`current = ${i >= 0 ? curr : "-"}`, `best = ${best === -Infinity ? "-∞" : best}`], { 1: "is-done" }))),
                note,
            });
        };
        snap(-1, `At every index decide: does the best run ending here <em>extend</em> the previous run, or <em>restart</em> at this element? <code>current = max(A[i], current + A[i])</code>.`);
        A.forEach((x, i) => {
            const extend = curr + x;
            const restart = i === 0 || x > extend;
            const prev = curr;
            curr = restart ? x : extend;
            if (restart) runStart = i;
            let note = i === 0
                ? `Index 0: the only run ending here is <code>[${x}]</code>, so <code>current = ${x}</code>.`
                : restart
                    ? `<code>current + A[${i}] = ${prev} + ${x} = ${extend}</code> is worse than <code>${x}</code> alone — the old run is dead weight. <strong>Restart</strong> at index ${i}.`
                    : `<code>${prev} + ${x} = ${extend}</code> beats <code>${x}</code> alone — <strong>extend</strong> the run.`;
            if (curr > best) {
                best = curr;
                bestRange = [runStart, i];
                note += ` New best <code>${best}</code>.`;
            }
            snap(i, note);
        });
        snap(-1, `Maximum subarray sum <code>${best}</code> from <code>[${A.slice(bestRange[0], bestRange[1] + 1).join(", ")}]</code>. One pass, <code>O(1)</code> memory — and starting <code>best</code> at <code>-∞</code> keeps all-negative arrays correct.`);
        return frames;
    },
};

/* ---- A6. Merge intervals ---- */

VIZ["merge-intervals"] = {
    title: "Merging overlapping intervals",
    legend: [["lg-act", "open (being merged)"], ["lg-cmp", "compared"], ["lg-done", "closed output"]],
    build() {
        const input = [[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]];
        const unit = 28;
        const x0 = 40;
        const frames = [];
        const out = [];
        let open = null;
        const render = (states, note) => {
            let body = "";
            for (let t = 0; t <= 19; t += 1) {
                body += `<line x1="${x0 + t * unit}" y1="12" x2="${x0 + t * unit}" y2="222" class="e-idle" stroke-opacity="0.25"/>`;
                if (t % 2 === 0) body += textSVG(x0 + t * unit, 236, t, "is-muted");
            }
            input.forEach(([s, e], i) => {
                const y = 16 + i * 28;
                body += rectSVG(x0 + s * unit, y, (e - s) * unit, 20, states[i] || "");
                body += textSVG(x0 + ((s + e) / 2) * unit, y + 10, `[${s},${e}]`);
            });
            body += textSVG(18, 16 + 5 * 28 + 14, "out", "is-muted");
            out.forEach(([s, e]) => {
                body += rectSVG(x0 + s * unit, 16 + 5 * 28 + 4, (e - s) * unit, 20, "is-done");
                body += textSVG(x0 + ((s + e) / 2) * unit, 16 + 5 * 28 + 14, `[${s},${e}]`);
            });
            if (open) {
                body += rectSVG(x0 + open[0] * unit, 16 + 5 * 28 + 4, (open[1] - open[0]) * unit, 20, "is-act");
                body += textSVG(x0 + ((open[0] + open[1]) / 2) * unit, 16 + 5 * 28 + 14, `[${open[0]},${open[1]}]`);
            }
            frames.push({ stage: svgHTML(620, 246, body), note });
        };
        render({}, `Intervals already sorted by start. Sweep left to right keeping one <em>open</em> interval in the output row.`);
        open = [...input[0]];
        render({ 0: "is-act" }, `Open <code>[${open.join(", ")}]</code>.`);
        for (let i = 1; i < input.length; i += 1) {
            const [s, e] = input[i];
            render({ [i]: "is-cmp" }, `Next <code>[${s}, ${e}]</code>: does it start at or before the open end <code>${open[1]}</code>?`);
            if (s <= open[1]) {
                const prevEnd = open[1];
                open[1] = Math.max(open[1], e);
                render({ [i]: "is-act" }, `<code>${s} ≤ ${prevEnd}</code> — overlap. Stretch the open interval to <code>[${open.join(", ")}]</code> using <code>max(end)</code>.`);
            } else {
                out.push(open);
                open = [s, e];
                render({ [i]: "is-act" }, `Gap — close the open interval into the output and open <code>[${s}, ${e}]</code>.`);
            }
        }
        out.push(open);
        open = null;
        render({}, `Close the last one. Result <code>${out.map((iv) => `[${iv.join(",")}]`).join(" ")}</code>. Sorting costs <code>O(n log n)</code>; the sweep itself is <code>O(n)</code>.`);
        return frames;
    },
};

/* ---- A7. Boyer–Moore voting ---- */

VIZ["boyer-moore"] = {
    title: "Boyer–Moore majority vote",
    legend: [["lg-act", "current vote"], ["lg-cmp", "counted"], ["lg-done", "candidate's votes (verify)"]],
    build() {
        const A = [2, 2, 1, 1, 1, 2, 2];
        const frames = [];
        let candidate = null;
        let count = 0;
        const snap = (marks, note, extra = []) =>
            frames.push({
                stage: stackHTML(rowHTML("votes", cellsHTML(A, marks)), rowHTML("state", chipsHTML([`candidate = ${candidate ?? "none"}`, `count = ${count}`, ...extra], { 0: "is-act" }))),
                note,
            });
        snap({}, `Pass 1 keeps one candidate and a counter. A matching vote adds one; a different vote cancels one.`);
        A.forEach((x, i) => {
            const marks = {};
            for (let k = 0; k < i; k += 1) marks[k] = "is-cmp";
            marks[i] = "is-active";
            let note;
            if (count === 0) {
                candidate = x;
                count = 1;
                note = `Counter is 0, so <code>${x}</code> becomes the new candidate with count 1.`;
            } else if (x === candidate) {
                count += 1;
                note = `<code>${x}</code> matches the candidate — count up to ${count}.`;
            } else {
                count -= 1;
                note = `<code>${x}</code> differs — it cancels one of the candidate's votes. Count down to ${count}.`;
            }
            snap(marks, note);
        });
        const marks = {};
        let occ = 0;
        A.forEach((x, i) => {
            if (x === candidate) {
                marks[i] = "is-done";
                occ += 1;
            }
        });
        snap(marks, `Pass 2 verifies: <code>${candidate}</code> appears ${occ} times, and <code>${occ} &gt; ${A.length} / 2</code>, so it is the majority. Without this check an array with no majority would still leave a (wrong) candidate.`, [`occurrences = ${occ}`]);
        return frames;
    },
};

/* ---- A8. Trapping rain water ---- */

VIZ["rain-water"] = {
    title: "Trapping rain water with two pointers",
    legend: [["lg-act", "bar being settled"], ["lg-cmp", "other pointer"], ["lg-done", "settled"]],
    build() {
        const h = [3, 0, 2, 0, 4, 0, 2];
        const n = h.length;
        const unit = 34;
        const base = 176;
        const w = 50;
        const gap = 64;
        const water = new Array(n).fill(null);
        const settled = new Set();
        const frames = [];
        let L = 0;
        let R = n - 1;
        let lmax = 0;
        let rmax = 0;
        let total = 0;
        const render = (active, note) => {
            let body = `<line x1="16" y1="${base}" x2="${24 + n * gap}" y2="${base}" class="e-idle"/>`;
            h.forEach((v, i) => {
                const x = 24 + i * gap;
                if (water[i]) body += `<rect x="${x}" y="${base - (v + water[i]) * unit}" width="${w}" height="${water[i] * unit}" class="vz-water"/>`;
                const cls = i === active ? "is-act" : settled.has(i) ? "is-done" : i === L || i === R ? "is-cmp" : "";
                if (v) body += rectSVG(x, base - v * unit, w, v * unit, cls, 2);
                else body += rectSVG(x, base - 4, w, 4, cls, 1);
                body += textSVG(x + w / 2, base + 14, v, "is-muted");
                if (water[i]) body += textSVG(x + w / 2, base - (v + water[i] / 2) * unit, `+${water[i]}`);
                const tag = [i === L ? "L" : "", i === R ? "R" : ""].join(" ").trim();
                if (tag && L < R) body += textSVG(x + w / 2, base + 30, tag);
            });
            body += textSVG(24 + n * gap - 60, 18, `water = ${total}`);
            frames.push({ stage: svgHTML(24 + n * gap + 10, base + 42, body), note });
        };
        render(-1, `Water above bar <code>i</code> is <code>min(leftMax, rightMax) - h[i]</code>. Two pointers settle one bar per step from whichever side has the <em>shorter</em> wall.`);
        while (L < R) {
            if (h[L] <= h[R]) {
                const i = L;
                if (h[i] >= lmax) {
                    lmax = h[i];
                    settled.add(i);
                    L += 1;
                    render(i, `<code>h[L] = ${h[i]} ≤ h[R] = ${h[R]}</code>: the right side has a wall at least this tall, so only <code>leftMax</code> matters. Bar ${i} is a new <code>leftMax = ${lmax}</code> — no water on it.`);
                } else {
                    water[i] = lmax - h[i];
                    total += water[i];
                    settled.add(i);
                    L += 1;
                    render(i, `<code>h[L] = ${h[i]} ≤ h[R] = ${h[R]}</code>: settle the left. Water <code>leftMax - h = ${lmax} - ${h[i]} = ${water[i]}</code>. Total <code>${total}</code>.`);
                }
            } else {
                const i = R;
                if (h[i] >= rmax) {
                    rmax = h[i];
                    settled.add(i);
                    R -= 1;
                    render(i, `<code>h[L] = ${h[L]} &gt; h[R] = ${h[i]}</code>: settle the right. Bar ${i} is a new <code>rightMax = ${rmax}</code> — no water on it.`);
                } else {
                    water[i] = rmax - h[i];
                    total += water[i];
                    settled.add(i);
                    R -= 1;
                    render(i, `<code>h[L] = ${h[L]} &gt; h[R] = ${h[i]}</code>: settle the right. Water <code>rightMax - h = ${rmax} - ${h[i]} = ${water[i]}</code>. Total <code>${total}</code>.`);
                }
            }
        }
        settled.add(L);
        render(-1, `Pointers met at the tallest bar. Total trapped water <code>${total}</code> in one pass and <code>O(1)</code> extra space — no leftMax/rightMax arrays needed.`);
        return frames;
    },
};

/* ---- A9. Staircase search ---- */

VIZ.staircase = {
    title: "Staircase search for 14",
    legend: [["lg-act", "current cell"], ["lg-cmp", "path"], ["lg-done", "found"]],
    build() {
        const M = [
            [1, 4, 7, 11, 15],
            [2, 5, 8, 12, 19],
            [3, 6, 9, 16, 22],
            [10, 13, 14, 17, 24],
            [18, 21, 23, 26, 30],
        ];
        const target = 14;
        const frames = [];
        const gone = new Set();
        const path = [];
        let r = 0;
        let c = M[0].length - 1;
        const snap = (cls, note) => {
            const gm = {};
            gone.forEach((k) => (gm[k] = "is-empty"));
            path.forEach((k) => (gm[k] = "is-cmp"));
            gm[`${r},${c}`] = cls;
            frames.push({ stage: gridHTML(M, gm), note });
        };
        snap("is-act", `Rows and columns are both sorted. Start at the top-right corner <code>${M[r][c]}</code>: left is smaller, down is larger — like the root of a BST.`);
        while (r < M.length && c >= 0) {
            const v = M[r][c];
            if (v === target) {
                snap("is-done", `Found <code>${target}</code> at <code>(${r}, ${c})</code> after ${path.length + 1} cells out of ${M.length * M[0].length}. Worst case is <code>n + m</code> steps.`);
                break;
            }
            path.push(`${r},${c}`);
            if (v > target) {
                for (let k = r; k < M.length; k += 1) gone.add(`${k},${c}`);
                c -= 1;
                snap("is-act", `<code>${v} &gt; ${target}</code>: everything below it in column ${c + 1} is even bigger — discard the column, step left.`);
            } else {
                for (let k = 0; k <= c; k += 1) gone.add(`${r},${k}`);
                r += 1;
                snap("is-act", `<code>${v} &lt; ${target}</code>: everything left of it in row ${r - 1} is even smaller — discard the row, step down.`);
            }
        }
        return frames;
    },
};

/* ---- A10. Spiral traversal ---- */

VIZ.spiral = {
    title: "Spiral (lawn-mowing) traversal of a 4 × 4 matrix",
    legend: [["lg-act", "current cell"], ["lg-done", "mowed"]],
    build() {
        const M = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
        const frames = [];
        const seen = new Set();
        const out = [];
        let row = 0;
        let col = 0;
        let length = M.length - 1;
        let ring = 1;
        const visit = (dir) => {
            out.push(M[row][col]);
            const gm = {};
            seen.forEach((k) => (gm[k] = "is-done"));
            gm[`${row},${col}`] = "is-act";
            seen.add(`${row},${col}`);
            frames.push({
                stage: stackHTML(gridHTML(M, gm), rowHTML("output", chipsHTML(out.map(String)))),
                note: `Ring ${ring}, pass <strong>${dir}</strong> (${length} step${length === 1 ? "" : "s"} per side): take <code>${M[row][col]}</code>.`,
            });
        };
        frames.push({ stage: stackHTML(gridHTML(M), rowHTML("output", chipsHTML([]))), note: `Each ring is four straight passes of <code>length</code> steps — right, down, left, up. The first ring has <code>length = n - 1 = 3</code>.` });
        while (length >= 1) {
            for (let k = 0; k < length; k += 1) { visit("right"); col += 1; }
            for (let k = 0; k < length; k += 1) { visit("down"); row += 1; }
            for (let k = 0; k < length; k += 1) { visit("left"); col -= 1; }
            for (let k = 0; k < length; k += 1) { visit("up"); row -= 1; }
            row += 1;
            col += 1;
            length -= 2;
            ring += 1;
        }
        if (length === 0) visit("centre");
        const gm = {};
        seen.forEach((k) => (gm[k] = "is-done"));
        frames.push({ stage: stackHTML(gridHTML(M, gm), rowHTML("output", chipsHTML(out.map(String)))), note: `Done. Step into the next ring after each lap (<code>row++, col++, length -= 2</code>). An even side ends with <code>length = -1</code>; an odd side leaves one centre cell at <code>length = 0</code>.` });
        return frames;
    },
};

/* ---- A11. Sieve of Eratosthenes ---- */

VIZ.sieve = {
    title: "Sieve of Eratosthenes up to 30",
    legend: [["lg-act", "current prime p"], ["lg-cmp", "multiples being crossed"], ["lg-done", "prime"]],
    build() {
        const N = 30;
        const cols = 6;
        const rows = Array.from({ length: N / cols }, (_, r) => Array.from({ length: cols }, (_, c) => r * cols + c + 1));
        const crossed = new Set([1]);
        const primes = new Set();
        const key = (v) => `${Math.floor((v - 1) / cols)},${(v - 1) % cols}`;
        const frames = [];
        const snap = (extra, note) => {
            const gm = {};
            crossed.forEach((v) => (gm[key(v)] = "is-empty"));
            primes.forEach((v) => (gm[key(v)] = "is-done"));
            Object.entries(extra).forEach(([v, cls]) => (gm[key(Number(v))] = cls));
            frames.push({ stage: gridHTML(rows, gm), note });
        };
        snap({}, `Every number starts as "maybe prime". <code>1</code> is neither prime nor composite, so it is crossed out from the start.`);
        for (let p = 2; p * p <= N; p += 1) {
            if (crossed.has(p)) {
                snap({ [p]: "is-cmp" }, `<code>${p}</code> is already crossed out — it is a multiple of a smaller prime, and so are all its multiples. Skip it.`);
                continue;
            }
            primes.add(p);
            const mult = {};
            for (let m = p * p; m <= N; m += p) mult[m] = "is-cmp";
            snap({ [p]: "is-act", ...mult }, `<code>${p}</code> survived, so it is prime. Cross out its multiples starting at <code>${p} × ${p} = ${p * p}</code>: ${Object.keys(mult).join(", ")}. Smaller multiples were already crossed by smaller primes.`);
            Object.keys(mult).forEach((m) => crossed.add(Number(m)));
            snap({ [p]: "is-act" }, `Multiples of ${p} are gone.`);
        }
        for (let v = 2; v <= N; v += 1) if (!crossed.has(v)) primes.add(v);
        snap({}, `The next prime would be 7, and <code>7 × 7 = 49 &gt; 30</code>, so stop. Everything still standing is prime: <code>${[...primes].sort((a, b) => a - b).join(", ")}</code>. Total work <code>O(n log log n)</code>.`);
        return frames;
    },
};

/* ---- B1. Backtracking recursion trees ---- */

const layoutTree = (root, width, levelGap = 64, top = 28) => {
    const count = (n) => (n.children.length ? n.children.reduce((s, c) => s + count(c), 0) : 1);
    const leaves = count(root);
    let leaf = 0;
    let depthMax = 0;
    const place = (node, depth) => {
        node.y = top + depth * levelGap;
        depthMax = Math.max(depthMax, depth);
        if (!node.children.length) {
            node.x = (leaf + 0.5) * (width / leaves);
            leaf += 1;
        } else {
            node.children.forEach((c) => place(c, depth + 1));
            node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
        }
    };
    place(root, 0);
    return top + depthMax * levelGap + 44;
};

const backtrackFrames = (mode) => {
    const nodes = [];
    const events = [];
    const make = (label, sub, parent) => {
        const node = { id: nodes.length, label, sub, children: [], parent };
        nodes.push(node);
        if (parent) parent.children.push(node);
        return node;
    };

    if (mode === "parens") {
        const N = 2;
        const rec = (s, open, close, parent) => {
            const node = make(s || "ε", "", parent);
            events.push(["enter", node, s ? `Try prefix <code>"${s}"</code> — ${open} open, ${close} close.` : `Start from the empty string. Each call tries <code>(</code> then <code>)</code>.`]);
            if (open > N || close > open) {
                events.push(["prune", node, open > N ? `<code>"${s}"</code> has more than ${N} <code>(</code> — dead branch, return at once.` : `<code>"${s}"</code> closes more than it opened — no suffix can fix it. Prune.`]);
                return;
            }
            if (s.length === 2 * N) {
                events.push(["result", node, `Length ${2 * N} and every rule held — record <code>"${s}"</code>.`]);
                return;
            }
            rec(`${s}(`, open + 1, close, node);
            rec(`${s})`, open, close + 1, node);
            events.push(["exit", node]);
        };
        rec("", 0, 0, null);
    } else {
        const arr = [1, 2, 3];
        const rec = (i, cur, label, parent) => {
            const node = make(label, `{${cur.join(",")}}`, parent);
            const set = `{${cur.join(", ")}}`;
            events.push(["enter", node, parent
                ? `${label.startsWith("+") ? `Took <code>${label.slice(1)}</code>` : `Skipped <code>${label.slice(1)}</code> (the <code>pop()</code> that undid it is the backtrack)`}. Current subset <code>${set}</code>. Next decide <code>${arr[i]}</code>.`
                : `Start with <code>{}</code>. Each level makes one take-or-leave decision, so there are <code>2³ = 8</code> leaves.`]);
            if (i === arr.length) {
                events.push(["result", node, `${label.startsWith("+") ? `Took <code>${label.slice(1)}</code>` : `Skipped <code>${label.slice(1)}</code>`}. All three decided — record <code>${set}</code>.`]);
                return;
            }
            cur.push(arr[i]);
            rec(i + 1, cur, `+${arr[i]}`, node);
            cur.pop();
            rec(i + 1, cur, `−${arr[i]}`, node);
            events.push(["exit", node]);
        };
        rec(0, [], "∅", null);
    }

    const width = 640;
    const height = layoutTree(nodes[0], width);
    const frames = [];
    const shown = new Set();
    const states = {};
    const results = [];
    let current = null;

    const render = (note) => {
        const onPath = new Set();
        for (let n = current; n; n = n.parent) onPath.add(n.id);
        let body = "";
        nodes.forEach((n) => {
            if (!shown.has(n.id) || !n.parent) return;
            const st = onPath.has(n.id) ? "e-act" : states[n.id] === "n-out" ? "e-idle" : "e-done";
            body += edgeHTML(n.parent.x, n.parent.y + 18, n.x, n.y - 18, st);
        });
        nodes.forEach((n) => {
            if (!shown.has(n.id)) return;
            body += nodeHTML(n.x, n.y, n.label, states[n.id] || "n-idle", 18, n.sub);
        });
        frames.push({ stage: stackHTML(svgHTML(width, height, body), rowHTML("recorded", chipsHTML(results))), note });
    };

    render(mode === "parens"
        ? `Generate all valid strings of 2 pairs of brackets. Each call branches on <code>(</code> and <code>)</code>; a check at the top of the call kills impossible prefixes.`
        : `Generate all subsets of <code>[1, 2, 3]</code>. Each node is one recursive call; the label is the decision that created it, the text below is the subset so far.`);
    events.forEach((ev, k) => {
        const [type, node, note] = ev;
        if (type === "enter") {
            shown.add(node.id);
            if (current && current !== node.parent) {
                for (let n = current; n && n !== node.parent; n = n.parent) if (states[n.id] === "n-cmp" || states[n.id] === "n-act") states[n.id] = "n-idle";
            }
            if (node.parent) states[node.parent.id] = "n-cmp";
            states[node.id] = "n-act";
            current = node;
            const next = events[k + 1];
            if (next && next[1] === node && (next[0] === "result" || next[0] === "prune")) return;
            render(note);
        } else if (type === "result") {
            states[node.id] = "n-done";
            results.push(mode === "parens" ? node.label : node.sub);
            render(note);
        } else if (type === "prune") {
            states[node.id] = "n-out";
            render(note);
        } else if (type === "exit") {
            states[node.id] = "n-idle";
            current = node.parent;
        }
    });
    current = null;
    render(mode === "parens"
        ? `Done: ${results.length} valid strings. Pruning at the top of each call means no complete invalid string is ever built — that is the "backtracking vs. plain recursion" difference.`
        : `Done: all ${results.length} subsets. Time <code>O(2ⁿ · n)</code> (each leaf copies a subset); the stack never holds more than <code>n + 1</code> calls.`);
    return frames;
};

VIZ.backtracking = {
    title: "Backtracking recursion tree",
    legend: [["lg-act", "current call"], ["lg-cmp", "on the call stack"], ["lg-done", "answer recorded"], ["lg-out", "pruned"]],
    options: [
        { value: "subsets", label: "Subsets of [1, 2, 3]" },
        { value: "parens", label: "Valid parentheses, n = 2" },
    ],
    build: (option) => backtrackFrames(option || "subsets"),
};

/* ---- B2. Hash map with chaining and rehashing ---- */

VIZ.rehash = {
    title: "Chaining, load factor and rehashing",
    legend: [["lg-act", "just inserted"], ["lg-out", "moving on rehash"], ["lg-done", "re-inserted"]],
    build() {
        const keys = [21, 42, 37, 45, 99, 30, 41, 62, 75];
        const threshold = 2.0;
        let buckets = Array.from({ length: 4 }, () => []);
        let size = 0;
        const frames = [];
        const render = (markFn, note) => {
            const rows = buckets.map((chain, b) =>
                rowHTML(`bucket ${b}`, chipsHTML(chain.map((k) => `${k}`), Object.fromEntries(chain.map((k, i) => [i, markFn(k)]))))
            );
            const lambda = (size / buckets.length).toFixed(2);
            frames.push({
                stage: stackHTML(...rows, rowHTML("λ", chipsHTML([`${size} / ${buckets.length} = ${lambda}`], { 0: Number(lambda) > threshold ? "is-out" : "is-cmp" }))),
                note,
            });
        };
        render(() => "", `Four buckets, hash function <code>key % 4</code>, rehash threshold <code>λ &gt; ${threshold}</code>. Colliding keys simply join the bucket's chain.`);
        for (const key of keys) {
            const b = key % buckets.length;
            buckets[b].push(key);
            size += 1;
            const lambda = size / buckets.length;
            if (lambda <= threshold) {
                render((k) => (k === key ? "is-act" : ""), `Insert <code>${key}</code>: <code>${key} % ${buckets.length} = ${b}</code>.${buckets[b].length > 1 ? ` Collision — append to bucket ${b}'s chain (length ${buckets[b].length}).` : ""} <code>λ = ${size}/${buckets.length} = ${lambda.toFixed(2)}</code>.`);
            } else {
                render(() => "is-out", `Insert <code>${key}</code> into bucket ${b}. Now <code>λ = ${size}/${buckets.length} = ${lambda.toFixed(2)} &gt; ${threshold}</code>: chains are getting long, so lookups are drifting away from <code>O(1)</code>. Rehash.`);
                const old = buckets.flat();
                buckets = Array.from({ length: buckets.length * 2 }, () => []);
                old.forEach((k) => buckets[k % buckets.length].push(k));
                render(() => "is-done", `Double to ${buckets.length} buckets and re-insert every key with <code>key % ${buckets.length}</code> — keys land in new places. <code>λ</code> halves to <code>${(size / buckets.length).toFixed(2)}</code>. This <code>O(n)</code> step is rare, so inserts stay <code>O(1)</code> amortised.`);
            }
        }
        return frames;
    },
};

/* ---- B3. Prefix sums + hash map ---- */

VIZ["prefix-hash"] = {
    title: "Counting subarrays with sum 11 using prefix sums and a map",
    legend: [["lg-act", "current index"], ["lg-done", "matching earlier prefix"], ["lg-cmp", "subarray found"]],
    build() {
        const A = [2, 3, 9, -4, 1, 5, 6, 2, 5];
        const K = 11;
        const frames = [];
        const freq = new Map([[0, 1]]);
        const prefix = new Array(A.length).fill("");
        const firstIndex = new Map([[0, -1]]);
        let sum = 0;
        let count = 0;
        const render = (i, hitSum, newSum, marks, note) => {
            const entries = [...freq.entries()];
            const chipMarks = {};
            entries.forEach(([s], idx) => {
                if (s === hitSum) chipMarks[idx] = "is-done";
                else if (s === newSum) chipMarks[idx] = "is-act";
            });
            frames.push({
                stage: stackHTML(
                    rowHTML("A", cellsHTML(A, marks)),
                    rowHTML("prefix", cellsHTML(prefix, i >= 0 ? { [i]: "is-active" } : {})),
                    rowHTML("seen sums", chipsHTML(entries.map(([s, c]) => `${s}:${c}`), chipMarks)),
                    rowHTML("count", chipsHTML([String(count)], { 0: "is-done" }))
                ),
                note,
            });
        };
        render(-1, null, null, {}, `Seed the map with prefix sum <code>0</code> seen once — the empty prefix before index 0. A subarray <code>A[j+1..i]</code> sums to ${K} exactly when <code>P[i] - P[j] = ${K}</code>.`);
        A.forEach((x, i) => {
            sum += x;
            prefix[i] = sum;
            const need = sum - K;
            const hits = freq.get(need) || 0;
            count += hits;
            const marks = { [i]: "is-active" };
            if (hits) for (let k = firstIndex.get(need) + 1; k <= i; k += 1) marks[k] = "is-cmp";
            const had = freq.has(sum);
            freq.set(sum, (freq.get(sum) || 0) + 1);
            if (!firstIndex.has(sum)) firstIndex.set(sum, i);
            render(i, hits ? need : null, sum, marks,
                `<code>P = ${sum}</code>. Look up <code>P - ${K} = ${need}</code>: ${hits ? `seen ${hits}× → ${hits} subarray${hits > 1 ? "s" : ""} ending here sum to ${K}` : "never seen"}. ${had ? "Increment" : "Record"} <code>${sum}</code> in the map. Count <code>${count}</code>.`);
        });
        render(-1, null, null, {}, `Answer <code>${count}</code> in one pass. Unlike a sliding window this works with negative numbers, because it never needs the sum to move in one direction.`);
        return frames;
    },
};

/* ---- B4. Count sort with negatives ---- */

VIZ["count-sort"] = {
    title: "Count sort with an offset for negative values",
    legend: [["lg-act", "current element"], ["lg-cmp", "its count slot"], ["lg-done", "written out"]],
    build() {
        const A = [-2, 1, 4, 2, -2, 6, 1, -3, 4, -1];
        const min = Math.min(...A);
        const max = Math.max(...A);
        const count = new Array(max - min + 1).fill(0);
        const tags = Object.fromEntries(count.map((_, i) => [i, `v=${i + min}`]));
        const out = [];
        const frames = [];
        const render = (aMarks, cMarks, note) =>
            frames.push({
                stage: stackHTML(
                    rowHTML("input", cellsHTML(A, aMarks)),
                    rowHTML("count", cellsHTML(count, cMarks, tags)),
                    rowHTML("output", chipsHTML(out.map(String), Object.fromEntries(out.map((_, i) => [i, "is-done"]))))
                ),
                note,
            });
        render({}, {}, `<code>min = ${min}</code>, <code>max = ${max}</code>, so the count array needs <code>max - min + 1 = ${count.length}</code> slots. Value <code>v</code> is counted at index <code>v - min</code>.`);
        A.forEach((v, i) => {
            count[v - min] += 1;
            render({ [i]: "is-active" }, { [v - min]: "is-cmp" }, `<code>${v}</code> goes to slot <code>${v} - (${min}) = ${v - min}</code>. No comparisons with other elements at all.`);
        });
        count.forEach((c, i) => {
            if (!c) return;
            for (let k = 0; k < c; k += 1) out.push(i + min);
            render({}, { [i]: "is-done" }, `Slot ${i} holds ${c} → write <code>${i + min}</code> ${c === 1 ? "once" : `${c} times`} (value = index + min).`);
        });
        render({}, {}, `Sorted in <code>O(n + k)</code> where <code>k = ${count.length}</code> is the value range. Writing values back left to right in slot order keeps it stable.`);
        return frames;
    },
};

/* ---- B5. Binary search: first occurrence ---- */

VIZ["first-occurrence"] = {
    title: "Binary search for the first occurrence of 9",
    legend: [["lg-cmp", "search range"], ["lg-act", "mid"], ["lg-done", "best answer so far"]],
    build() {
        const arr = [3, 6, 9, 9, 9, 19, 20, 23, 27, 27];
        const k = 9;
        const frames = [];
        let lo = 0;
        let hi = arr.length - 1;
        let ans = -1;
        const snap = (mid, note) => {
            const marks = {};
            const tags = {};
            arr.forEach((_, i) => (marks[i] = i < lo || i > hi ? "is-dim" : "is-window"));
            if (ans >= 0) marks[ans] = "is-done";
            if (mid !== null) {
                marks[mid] = "is-active";
                tags[mid] = "mid";
            }
            if (lo <= hi) {
                tags[lo] = tags[lo] ? `lo ${tags[lo]}` : "lo";
                tags[hi] = tags[hi] && hi !== lo ? `${tags[hi]} hi` : lo === hi ? `${tags[lo]} hi` : "hi";
            }
            frames.push({ stage: cellsHTML(arr, marks, tags), note });
        };
        snap(null, `Find the <em>first</em> <code>${k}</code>. <code>lo = 0</code>, <code>hi = ${hi}</code>, <code>ans = -1</code>.`);
        while (lo <= hi) {
            const mid = lo + Math.floor((hi - lo) / 2);
            snap(mid, `<code>mid = ${mid}</code>, <code>arr[mid] = ${arr[mid]}</code>.`);
            if (arr[mid] === k) {
                ans = mid;
                hi = mid - 1;
                snap(null, `A match — record <code>ans = ${ans}</code>, but an earlier <code>${k}</code> may exist, so keep searching <strong>left</strong>: <code>hi = ${hi}</code>.`);
            } else if (arr[mid] < k) {
                lo = mid + 1;
                snap(null, `<code>${arr[mid]} &lt; ${k}</code> → discard the left half: <code>lo = ${lo}</code>.`);
            } else {
                hi = mid - 1;
                snap(null, `<code>${arr[mid]} &gt; ${k}</code> → discard the right half: <code>hi = ${hi}</code>.`);
            }
        }
        snap(null, `<code>lo &gt; hi</code>, stop. First occurrence at index <code>${ans}</code> — still <code>O(log n)</code>, because a match only moves the boundary instead of ending the search.`);
        return frames;
    },
};

/* ---- B6. Binary search on the answer ---- */

const rangeBarSVG = (lo0, hi0, lo, hi, mid, ans, label) => {
    const x = (v) => 40 + ((v - lo0) / (hi0 - lo0)) * 520;
    let body = `<line x1="40" y1="36" x2="560" y2="36" class="e-idle"/>`;
    body += textSVG(24, 36, lo0, "is-muted") + textSVG(580, 36, hi0, "is-muted");
    if (lo <= hi) body += rectSVG(x(lo), 26, Math.max(x(hi) - x(lo), 4), 20, "is-cmp", 3);
    if (ans !== null) body += `<line x1="${x(ans)}" y1="20" x2="${x(ans)}" y2="54" class="e-done"/>` + textSVG(x(ans), 64, `ans ${ans}`);
    if (mid !== null) body += `<line x1="${x(mid)}" y1="18" x2="${x(mid)}" y2="54" class="e-act"/>` + textSVG(x(mid), 10, `mid ${mid}`);
    body += textSVG(300, 84, label, "is-muted");
    return svgHTML(600, 92, body);
};

VIZ["bs-answer"] = {
    title: "Binary search on the answer",
    legend: [["lg-cmp", "answer range still possible"], ["lg-act", "candidate mid"], ["lg-done", "best feasible answer"]],
    options: [
        { value: "painters", label: "Painter's partition" },
        { value: "cows", label: "Aggressive cows" },
    ],
    build(option) {
        const frames = [];
        if ((option || "painters") === "painters") {
            const boards = [12, 34, 67, 90];
            const k = 2;
            const lo0 = Math.max(...boards);
            const hi0 = boards.reduce((a, b) => a + b, 0);
            let lo = lo0;
            let hi = hi0;
            let ans = null;
            const assign = (limit) => {
                const who = [];
                let painters = 1;
                let cur = 0;
                boards.forEach((b) => {
                    if (cur + b > limit) {
                        painters += 1;
                        cur = b;
                    } else cur += b;
                    who.push(painters);
                });
                return who;
            };
            const cls = ["", "is-cmp", "is-window", "is-out", "is-out"];
            const render = (mid, who, note) => {
                const marks = who ? Object.fromEntries(who.map((p, i) => [i, cls[p]])) : {};
                const tags = who ? Object.fromEntries(who.map((p, i) => [i, `P${p}`])) : {};
                frames.push({ stage: stackHTML(rangeBarSVG(lo0, hi0, lo, hi, mid, ans, "time limit"), rowHTML("boards", cellsHTML(boards, marks, tags))), note });
            };
            render(null, null, `Answer range: at least <code>max = ${lo0}</code> (someone paints the longest board), at most <code>sum = ${hi0}</code> (one painter does all). Feasibility is monotonic: if T works, T + 1 works.`);
            while (lo <= hi) {
                const mid = lo + Math.floor((hi - lo) / 2);
                const who = assign(mid);
                const used = who[who.length - 1];
                const ok = used <= k;
                render(mid, who, `Try <code>T = ${mid}</code>: greedily give boards to a painter until the next would exceed ${mid}. Needs <code>${used}</code> painter${used > 1 ? "s" : ""} — ${ok ? `≤ ${k}, feasible.` : `more than ${k}, not feasible.`}`);
                if (ok) {
                    ans = mid;
                    hi = mid - 1;
                } else lo = mid + 1;
                render(mid, who, ok ? `Record <code>ans = ${mid}</code> and look for something smaller: <code>hi = ${hi}</code>.` : `Too tight — every smaller T fails too: <code>lo = ${lo}</code>.`);
            }
            render(null, assign(ans), `Range empty. Minimum finishing time <code>${ans}</code> — <code>[12, 34, 67] | [90]</code>. Cost: <code>O(n)</code> check × <code>log(sum - max)</code> iterations.`);
            return frames;
        }

        const stalls = [1, 2, 4, 8, 9];
        const cows = 3;
        const lo0 = 1;
        const hi0 = stalls[stalls.length - 1] - stalls[0];
        let lo = lo0;
        let hi = hi0;
        let ans = null;
        const place = (d) => {
            const at = [0];
            for (let i = 1; i < stalls.length; i += 1) if (stalls[i] - stalls[at[at.length - 1]] >= d) at.push(i);
            return at;
        };
        const render = (mid, at, note) => {
            const px = (v) => 60 + (v - 1) * 60;
            let body = `<line x1="40" y1="40" x2="${px(10)}" y2="40" class="e-idle"/>`;
            for (let v = 1; v <= 9; v += 1) body += textSVG(px(v), 70, v, "is-muted");
            stalls.forEach((s, i) => (body += nodeHTML(px(s), 40, at && at.includes(i) ? "C" : "", at && at.includes(i) ? "n-done" : "n-idle", 16)));
            frames.push({ stage: stackHTML(rangeBarSVG(lo0, hi0, lo, hi, mid, ans, "minimum gap"), svgHTML(640, 80, body)), note });
        };
        render(null, null, `Stalls at <code>[${stalls.join(", ")}]</code>, ${cows} cows. The smallest gap between any two cows should be as <em>large</em> as possible. Answer range <code>[1, ${hi0}]</code>.`);
        while (lo <= hi) {
            const mid = lo + Math.floor((hi - lo) / 2);
            const at = place(mid);
            const ok = at.length >= cows;
            render(mid, at, `Try gap <code>${mid}</code>: cow in the first stall, then each next cow in the first stall at least ${mid} further. Placed <code>${at.length}</code> — ${ok ? "enough, feasible." : `fewer than ${cows}, not feasible.`}`);
            if (ok) {
                ans = mid;
                lo = mid + 1;
            } else hi = mid - 1;
            render(mid, at, ok ? `Record <code>ans = ${mid}</code> and push the gap up: <code>lo = ${lo}</code>.` : `Too greedy — shrink: <code>hi = ${hi}</code>.`);
        }
        render(null, place(ans), `Largest minimum gap <code>${ans}</code> with cows at <code>${place(ans).map((i) => stalls[i]).join(", ")}</code>. Same template, but a success moves <code>lo</code> up instead of <code>hi</code> down.`);
        return frames;
    },
};

/* ---- C1. Floyd's cycle detection ---- */

VIZ["floyd-cycle"] = {
    title: "Floyd's cycle detection: detect, find the start, remove",
    legend: [["lg-cmp", "slow / pointer from head"], ["lg-act", "fast / pointer from meeting point"], ["lg-done", "pointers together"]],
    build() {
        const pos = { 1: [50, 150], 2: [145, 150], 3: [245, 150], 4: [345, 62], 5: [445, 150], 6: [345, 238] };
        const next = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 3 };
        const frames = [];
        let cut = false;
        const render = (a, b, labels, note, walk = null) => {
            let body = "";
            Object.entries(next).forEach(([u, v]) => {
                if (cut && Number(u) === 6) return;
                const [x1, y1] = pos[u];
                const [x2, y2] = pos[v];
                const len = Math.hypot(x2 - x1, y2 - y1);
                const ux = (x2 - x1) / len;
                const uy = (y2 - y1) / len;
                body += edgeHTML(x1 + ux * 20, y1 + uy * 20, x2 - ux * 24, y2 - uy * 24, Number(u) === 6 && walk === 6 ? "e-act" : "e-idle");
                body += `<circle cx="${x2 - ux * 24}" cy="${y2 - uy * 24}" r="3" class="n-cmp"/>`;
            });
            Object.entries(pos).forEach(([id, [x, y]]) => {
                const n = Number(id);
                const st = n === a && n === b ? "n-done" : n === a ? "n-cmp" : n === b ? "n-act" : n === walk ? "n-cmp" : "n-idle";
                body += nodeHTML(x, y, id, st, 20, labels[n] || "");
            });
            frames.push({ stage: svgHTML(500, 280, body), note });
        };
        let slow = 1;
        let fast = 1;
        render(slow, fast, { 1: "slow fast" }, `Phase 1: <code>slow</code> moves one node per step, <code>fast</code> moves two. Node 6 points back to node 3, closing a loop.`);
        do {
            slow = next[slow];
            fast = next[next[fast]];
            const labels = slow === fast ? { [slow]: "meet" } : { [slow]: "slow", [fast]: "fast" };
            render(slow, fast, labels, slow === fast
                ? `They meet at node <code>${slow}</code> — fast has lapped slow, which proves a cycle. On a list without a cycle, fast would hit <code>null</code> first.`
                : `<code>slow → ${slow}</code>, <code>fast → ${fast}</code>.`);
        } while (slow !== fast);
        let p1 = 1;
        let p2 = slow;
        render(p1, p2, { [p1]: "head ptr", [p2]: "meet ptr" }, `Phase 2: head → cycle start is <code>a = 2</code> steps, start → meeting point is <code>b = 2</code>, cycle length <code>c = 4</code>. Since <code>a + b = k·c</code>, walking <code>a</code> steps from the meeting point also lands on the start. Move both one step at a time.`);
        while (p1 !== p2) {
            p1 = next[p1];
            p2 = next[p2];
            render(p1, p2, p1 === p2 ? { [p1]: "start" } : { [p1]: "head ptr", [p2]: "meet ptr" }, p1 === p2
                ? `They collide at node <code>${p1}</code> — the first node of the cycle.`
                : `<code>${p1}</code> and <code>${p2}</code> — not yet.`);
        }
        const start = p1;
        let last = start;
        while (next[last] !== start) {
            last = next[last];
            render(null, null, { [start]: "start", [last]: "last?" }, `To remove the cycle, walk from the start until a node's <code>next</code> is the start: now at <code>${last}</code>.`, last);
        }
        cut = true;
        render(null, null, { [start]: "start", [last]: "tail" }, `<code>${last}.next</code> pointed at the start — set it to <code>null</code>. The list is a straight line again. All three phases are <code>O(n)</code> time and <code>O(1)</code> space.`, last);
        return frames;
    },
};

/* ---- C2. LRU cache ---- */

VIZ["lru-cache"] = {
    title: "LRU cache (capacity 3): hash map + doubly linked list",
    legend: [["lg-act", "just used"], ["lg-out", "evicted"], ["lg-cmp", "sentinel"]],
    build() {
        const cap = 3;
        let list = [];
        const frames = [];
        const render = (marks, note) => {
            const boxW = 72;
            const gap = 26;
            const all = [{ label: "head", cls: "is-cmp" }, ...list.map((n, i) => ({ label: `${n.k}:${n.v}`, cls: marks[i] || "" })), { label: "tail", cls: "is-cmp" }];
            let body = textSVG(20 + boxW / 2, 14, "least recent", "is-muted");
            body += textSVG(20 + (all.length - 1) * (boxW + gap) + boxW / 2, 14, "most recent", "is-muted");
            all.forEach((b, i) => {
                const x = 20 + i * (boxW + gap);
                body += rectSVG(x, 26, boxW, 36, b.cls);
                body += textSVG(x + boxW / 2, 44, b.label);
                if (i < all.length - 1) {
                    body += edgeHTML(x + boxW, 38, x + boxW + gap, 38, "e-idle");
                    body += edgeHTML(x + boxW, 50, x + boxW + gap, 50, "e-idle");
                }
            });
            const width = 20 + all.length * (boxW + gap);
            frames.push({
                stage: stackHTML(svgHTML(Math.max(width, 420), 72, body), rowHTML("map keys", chipsHTML(list.map((n) => `${n.k} → node`)))),
                note,
            });
        };
        render({}, `Two sentinels, <code>head</code> and <code>tail</code>, bracket the list so insert and unlink never special-case an empty list. The map points each key straight at its node.`);
        const touch = (k) => {
            const i = list.findIndex((n) => n.k === k);
            const [node] = list.splice(i, 1);
            list.push(node);
        };
        const ops = [["put", 1, 10], ["put", 2, 20], ["put", 3, 30], ["get", 1], ["put", 4, 40], ["get", 2], ["get", 3], ["put", 5, 50]];
        ops.forEach(([op, k, v]) => {
            const has = list.some((n) => n.k === k);
            if (op === "get") {
                if (!has) {
                    render({}, `<code>get(${k})</code>: not in the map → <code>-1</code>. (It was evicted earlier.)`);
                    return;
                }
                touch(k);
                render({ [list.length - 1]: "is-act" }, `<code>get(${k})</code>: map lookup finds the node in <code>O(1)</code>; unlink it and re-insert before <code>tail</code>. It is now the most recently used.`);
                return;
            }
            if (has) {
                list.find((n) => n.k === k).v = v;
                touch(k);
                render({ [list.length - 1]: "is-act" }, `<code>put(${k}, ${v})</code>: key exists — update and move to the most-recent end.`);
                return;
            }
            if (list.length === cap) {
                render({ 0: "is-out" }, `<code>put(${k}, ${v})</code>: cache is full. The least recently used node is <code>head.next</code> = key <code>${list[0].k}</code>.`);
                const gone = list.shift();
                list.push({ k, v });
                render({ [list.length - 1]: "is-act" }, `Unlink key <code>${gone.k}</code> from the list <em>and</em> delete it from the map, then insert <code>${k}:${v}</code> before <code>tail</code>.`);
                return;
            }
            list.push({ k, v });
            render({ [list.length - 1]: "is-act" }, `<code>put(${k}, ${v})</code>: new key — create a node, insert before <code>tail</code>, add it to the map.`);
        });
        render({}, `Every operation is a map lookup plus a constant number of pointer changes — <code>O(1)</code>. Neither structure could do it alone: the map cannot order, the list cannot find.`);
        return frames;
    },
};

/* ---- C3. Monotonic stack ---- */

VIZ["monotonic-stack"] = {
    title: "Nearest smaller element on the left with a monotonic stack",
    legend: [["lg-act", "current index"], ["lg-out", "popped"], ["lg-done", "answer found"]],
    build() {
        const A = [4, 5, 2, 10, 8];
        const res = new Array(A.length).fill("");
        const stack = [];
        const frames = [];
        const render = (aMarks, stackMarks, note) =>
            frames.push({
                stage: stackHTML(
                    rowHTML("A", cellsHTML(A, aMarks)),
                    rowHTML("stack (i:val)", chipsHTML(stack.map((i) => `${i}:${A[i]}`), stackMarks)),
                    rowHTML("answer", cellsHTML(res, Object.fromEntries(res.map((r, i) => [i, r === "" ? "is-ghost" : "is-done"]))))
                ),
                note,
            });
        render({}, {}, `The stack holds indices whose values <em>increase</em> from bottom to top. Anything not smaller than the current value can never be the answer for later indices, so it gets popped.`);
        A.forEach((x, i) => {
            render({ [i]: "is-active" }, {}, `Index ${i}, value <code>${x}</code>.`);
            while (stack.length && A[stack[stack.length - 1]] >= x) {
                const top = stack[stack.length - 1];
                render({ [i]: "is-active", [top]: "is-out" }, { [stack.length - 1]: "is-out" }, `<code>A[${top}] = ${A[top]} ≥ ${x}</code>: ${x} is closer and smaller, so ${A[top]} is useless from now on. Pop.`);
                stack.pop();
            }
            res[i] = stack.length ? stack[stack.length - 1] : -1;
            stack.push(i);
            render({ [i]: "is-active" }, { [stack.length - 1]: "is-act" }, stack.length > 1
                ? `Top of stack is index <code>${res[i]}</code> (<code>${A[res[i]]} &lt; ${x}</code>) — that is the answer. Push ${i}.`
                : `Stack is empty — nothing smaller to the left, answer <code>-1</code>. Push ${i}.`);
        });
        render({}, {}, `Answers <code>[${res.join(", ")}]</code>. Each index is pushed once and popped at most once, so the whole scan is <code>O(n)</code>.`);
        return frames;
    },
};

/* ---- C4. Sliding window maximum ---- */

VIZ["window-max"] = {
    title: "Sliding window maximum with a monotonic deque (k = 3)",
    legend: [["lg-cmp", "window"], ["lg-act", "entering element"], ["lg-done", "window maximum (deque front)"]],
    build() {
        const A = [1, 3, -1, -3, 5, 3, 6, 7];
        const k = 3;
        const dq = [];
        const out = [];
        const frames = [];
        const render = (i, note, dqMarks = {}) => {
            const marks = {};
            for (let j = Math.max(0, i - k + 1); j <= i; j += 1) marks[j] = "is-window";
            if (dq.length && i >= 0) marks[dq[0]] = "is-done";
            if (i >= 0) marks[i] = marks[i] === "is-done" ? "is-done" : "is-active";
            frames.push({
                stage: stackHTML(
                    rowHTML("A", cellsHTML(A, marks)),
                    rowHTML("deque (i:val)", chipsHTML(dq.map((j) => `${j}:${A[j]}`), dqMarks)),
                    rowHTML("maxima", chipsHTML(out.map(String)))
                ),
                note,
            });
        };
        render(-1, `The deque keeps indices whose values are <em>decreasing</em> from front to back, so the front is always the window's maximum.`);
        A.forEach((x, i) => {
            const popped = [];
            while (dq.length && A[dq[dq.length - 1]] < x) popped.push(A[dq.pop()]);
            dq.push(i);
            let note = popped.length
                ? `<code>${x}</code> enters and evicts smaller values from the back (${popped.join(", ")}) — they can never be a maximum while ${x} is in the window.`
                : `<code>${x}</code> enters at the back.`;
            if (dq[0] <= i - k) {
                const gone = dq.shift();
                note += ` Front index ${gone} has slid out of the window — drop it.`;
            }
            if (i >= k - 1) {
                out.push(A[dq[0]]);
                note += ` Window <code>[${i - k + 1}..${i}]</code> max = front = <code>${A[dq[0]]}</code>.`;
            }
            render(i, note, { 0: "is-done", [dq.length - 1]: dq.length > 1 ? "is-act" : "is-done" });
        });
        render(-1, `Maxima <code>[${out.join(", ")}]</code>. Every index enters and leaves the deque once: <code>O(n)</code> total, versus <code>O(n·k)</code> for rescanning each window.`);
        return frames;
    },
};

/* ---- C5. Morris inorder traversal ---- */

VIZ.morris = {
    title: "Morris inorder traversal with temporary threads",
    legend: [["lg-act", "curr"], ["lg-cmp", "predecessor"], ["lg-done", "visited"]],
    build() {
        const T = {
            10: { x: 300, y: 36, l: 20, r: 30 },
            20: { x: 170, y: 106, l: 40, r: 50 },
            30: { x: 430, y: 106, l: null, r: 60 },
            40: { x: 100, y: 178, l: null, r: null },
            50: { x: 240, y: 178, l: 70, r: 80 },
            60: { x: 500, y: 178, l: 90, r: null },
            70: { x: 190, y: 250, l: null, r: null },
            80: { x: 290, y: 250, l: null, r: null },
            90: { x: 450, y: 250, l: null, r: null },
        };
        const right = Object.fromEntries(Object.entries(T).map(([k, n]) => [k, n.r]));
        const threads = new Set();
        const visited = new Set();
        const out = [];
        const frames = [];
        const render = (curr, pre, note) => {
            let body = "";
            Object.entries(T).forEach(([k, n]) => {
                [n.l, n.r].forEach((c) => {
                    if (c === null) return;
                    body += edgeHTML(n.x, n.y + 18, T[c].x, T[c].y - 18, "e-idle");
                });
            });
            threads.forEach((key) => {
                const [p, c] = key.split(">").map(Number);
                const a = T[p];
                const b = T[c];
                body += `<path d="M ${a.x + 14} ${a.y + 12} Q ${Math.max(a.x, b.x) + 70} ${(a.y + b.y) / 2 + 30} ${b.x + 16} ${b.y + 12}" class="e-thread"/>`;
            });
            Object.entries(T).forEach(([k, n]) => {
                const id = Number(k);
                const st = id === curr ? "n-act" : id === pre ? "n-cmp" : visited.has(id) ? "n-done" : "n-idle";
                body += nodeHTML(n.x, n.y, k, st, 18);
            });
            frames.push({ stage: stackHTML(svgHTML(600, 280, body), rowHTML("inorder", chipsHTML(out.map(String)))), note });
        };
        let curr = 10;
        render(curr, null, `No stack, no recursion. Before going left, Morris threads the left subtree's rightmost node back to <code>curr</code> so the walk can find its way home.`);
        while (curr !== null) {
            const node = T[curr];
            if (node.l === null) {
                visited.add(curr);
                out.push(curr);
                const nxt = right[curr];
                const viaThread = threads.has(`${curr}>${nxt}`);
                render(curr, null, `<code>${curr}</code> has no left child → visit it, then go right${nxt === null ? " (null — done)" : viaThread ? ` along the thread back to <code>${nxt}</code>` : ` to <code>${nxt}</code>`}.`);
                curr = nxt;
                continue;
            }
            let pre = node.l;
            while (right[pre] !== null && right[pre] !== curr) pre = right[pre];
            if (right[pre] === null) {
                right[pre] = curr;
                threads.add(`${pre}>${curr}`);
                render(curr, pre, `<code>${curr}</code> has a left subtree. Its rightmost node <code>${pre}</code> has an empty right pointer → create thread <code>${pre} ⇢ ${curr}</code>, then move left to <code>${node.l}</code>.`);
                curr = node.l;
            } else {
                right[pre] = null;
                threads.delete(`${pre}>${curr}`);
                visited.add(curr);
                out.push(curr);
                render(curr, pre, `Back at <code>${curr}</code> via the thread — its predecessor <code>${pre}</code> already points here, so the left subtree is finished. Remove the thread, visit <code>${curr}</code>, go right.`);
                curr = right[curr];
            }
        }
        render(null, null, `Inorder <code>${out.join(" ")}</code> with <code>O(1)</code> extra space. Every thread created was removed, so the tree is exactly as it started. Each edge is walked a constant number of times: <code>O(n)</code>.`);
        return frames;
    },
};

/* ---- D1. Build a heap bottom-up ---- */

VIZ["build-heap"] = {
    title: "Building a min-heap bottom-up in O(n)",
    legend: [["lg-act", "sifting down"], ["lg-cmp", "children compared"], ["lg-done", "valid sub-heap"]],
    build() {
        const a = [9, 4, 7, 1, 8, 2, 6, 3];
        const n = a.length;
        const P = [[300, 36], [190, 106], [410, 106], [130, 176], [250, 176], [350, 176], [470, 176], [100, 246]];
        const frames = [];
        const settled = new Set();
        const render = (marks, note) => {
            let body = "";
            for (let i = 1; i < n; i += 1) {
                const p = (i - 1) >> 1;
                body += edgeHTML(P[p][0], P[p][1] + 18, P[i][0], P[i][1] - 18, "e-idle");
            }
            a.forEach((v, i) => {
                const st = marks[i] || (settled.has(i) ? "n-done" : "n-idle");
                body += nodeHTML(P[i][0], P[i][1], v, st, 18, `[${i}]`);
            });
            const cellMarks = {};
            a.forEach((_, i) => {
                const st = marks[i] || (settled.has(i) ? "n-done" : "");
                cellMarks[i] = st === "n-act" ? "is-active" : st === "n-cmp" ? "is-cmp" : st === "n-done" ? "is-done" : "";
            });
            frames.push({ stage: svgHTML(600, 280, body) + cellsHTML(a, cellMarks), note });
        };
        for (let i = Math.floor(n / 2); i < n; i += 1) settled.add(i);
        render({}, `An arbitrary array viewed as a complete tree. Indices <code>${Math.floor(n / 2)}..${n - 1}</code> are leaves — each one is already a valid one-node heap, so half the work is free.`);
        for (let start = Math.floor(n / 2) - 1; start >= 0; start -= 1) {
            let i = start;
            render({ [i]: "n-act" }, `Sift down index <code>${i}</code> (value <code>${a[i]}</code>) — the last non-leaf not yet processed. Both of its subtrees are already heaps.`);
            while (true) {
                const l = 2 * i + 1;
                const r = l + 1;
                let s = i;
                if (l < n && a[l] < a[s]) s = l;
                if (r < n && a[r] < a[s]) s = r;
                const marks = { [i]: "n-act" };
                if (l < n) marks[l] = "n-cmp";
                if (r < n) marks[r] = "n-cmp";
                if (s === i) {
                    render(marks, l < n ? `<code>${a[i]}</code> is not larger than its children — this subtree is a heap now.` : `No children — stop.`);
                    break;
                }
                render(marks, `Smallest child is <code>${a[s]}</code> &lt; <code>${a[i]}</code> → swap and keep sinking.`);
                [a[i], a[s]] = [a[s], a[i]];
                i = s;
            }
            settled.add(start);
        }
        render({}, `Min-heap built: <code>[${a.join(", ")}]</code>. Most nodes sit near the bottom and sink only a level or two, so the total is <code>O(n)</code> — not the <code>O(n log n)</code> of pushing one at a time.`);
        return frames;
    },
};

/* ---- D2. Running median with two heaps ---- */

VIZ["median-stream"] = {
    title: "Running median with a max-heap and a min-heap",
    legend: [["lg-act", "max-heap top (low half)"], ["lg-cmp", "min-heap top (high half)"], ["lg-done", "median"]],
    build() {
        const stream = [5, 15, 1, 3, 8, 7];
        const low = [];
        const high = [];
        const seen = [];
        const frames = [];
        const median = () => (low.length > high.length ? low[0] : (low[0] + high[0]) / 2);
        const render = (note, med = null) => {
            low.sort((x, y) => y - x);
            high.sort((x, y) => x - y);
            frames.push({
                stage: stackHTML(
                    rowHTML("stream", chipsHTML(seen.map(String), { [seen.length - 1]: "is-act" })),
                    rowHTML("low (max-heap)", chipsHTML(low.map(String), { 0: "is-act" })),
                    rowHTML("high (min-heap)", chipsHTML(high.map(String), { 0: "is-cmp" })),
                    rowHTML("median", chipsHTML([med === null ? "-" : String(med)], { 0: med === null ? "" : "is-done" }))
                ),
                note,
            });
        };
        render(`The smaller half lives in a max-heap, the larger half in a min-heap, and the sizes never differ by more than one. The median is always at the tops.`);
        stream.forEach((x) => {
            seen.push(x);
            const toLow = !low.length || x <= Math.max(...low);
            (toLow ? low : high).push(x);
            let note = `<code>${x}</code> ${toLow ? `≤ low's top, so it joins the <strong>low</strong> heap` : `&gt; low's top, so it joins the <strong>high</strong> heap`}.`;
            if (low.length > high.length + 1) {
                const m = Math.max(...low);
                low.splice(low.indexOf(m), 1);
                high.push(m);
                note += ` Low is now two bigger — move its top <code>${m}</code> across.`;
            } else if (high.length > low.length) {
                const m = Math.min(...high);
                high.splice(high.indexOf(m), 1);
                low.push(m);
                note += ` High is bigger — move its top <code>${m}</code> across.`;
            }
            low.sort((p, q) => q - p);
            high.sort((p, q) => p - q);
            const med = median();
            note += low.length > high.length ? ` Odd count: median = low's top = <code>${med}</code>.` : ` Even count: median = <code>(${low[0]} + ${high[0]}) / 2 = ${med}</code>.`;
            render(note, med);
        });
        render(`Each insert is one push plus at most one move between heaps: <code>O(log n)</code>. Reading the median is <code>O(1)</code>.`, median());
        return frames;
    },
};

/* ---- D3. One-dimensional DP tables ---- */

const dp1dFrames = (mode) => {
    const frames = [];
    if (mode === "robber") {
        const houses = [2, 7, 9, 3, 1];
        const dp = new Array(houses.length).fill("");
        const push = (hm, dm, note) => frames.push({ stage: stackHTML(rowHTML("money", cellsHTML(houses, hm)), rowHTML("dp[i]", cellsHTML(dp, dm))), note });
        push({}, {}, `<code>dp[i]</code> = most money from houses <code>0..i</code> without robbing two neighbours. Choice at each house: <strong>skip</strong> it (<code>dp[i-1]</code>) or <strong>take</strong> it (<code>money[i] + dp[i-2]</code>).`);
        dp[0] = houses[0];
        push({ 0: "is-active" }, { 0: "is-done" }, `Base: <code>dp[0] = ${dp[0]}</code>.`);
        dp[1] = Math.max(houses[0], houses[1]);
        push({ 1: "is-active" }, { 0: "is-cmp", 1: "is-done" }, `Base: <code>dp[1] = max(${houses[0]}, ${houses[1]}) = ${dp[1]}</code>.`);
        for (let i = 2; i < houses.length; i += 1) {
            const skip = dp[i - 1];
            const take = houses[i] + dp[i - 2];
            dp[i] = Math.max(skip, take);
            push({ [i]: "is-active" }, { [i - 1]: "is-cmp", [i - 2]: "is-cmp", [i]: "is-done" }, `House ${i}: skip → <code>${skip}</code>, take → <code>${houses[i]} + ${dp[i - 2]} = ${take}</code>. <code>dp[${i}] = ${dp[i]}</code>.`);
        }
        push({}, Object.fromEntries(dp.map((_, i) => [i, "is-done"])), `Answer <code>${dp[dp.length - 1]}</code>. Each cell reads only the previous two, which is why two variables can replace the whole array.`);
        return frames;
    }
    if (mode === "squares") {
        const N = 12;
        const dp = new Array(N + 1).fill("");
        const push = (marks, note) => frames.push({ stage: cellsHTML(dp, marks), note });
        dp[0] = 0;
        push({ 0: "is-done" }, `<code>dp[i]</code> = fewest perfect squares summing to <code>i</code>. Base <code>dp[0] = 0</code>. For each <code>i</code>, try every square <code>j² ≤ i</code> as the last one: <code>dp[i] = 1 + min dp[i - j²]</code>.`);
        for (let i = 1; i <= N; i += 1) {
            let best = Infinity;
            let from = -1;
            const marks = {};
            for (let j = 1; j * j <= i; j += 1) {
                marks[i - j * j] = "is-cmp";
                if (dp[i - j * j] + 1 < best) {
                    best = dp[i - j * j] + 1;
                    from = i - j * j;
                }
            }
            dp[i] = best;
            marks[from] = "is-done";
            marks[i] = "is-active";
            const tries = [];
            for (let j = 1; j * j <= i; j += 1) tries.push(`dp[${i - j * j}]+1=${dp[i - j * j] + 1}`);
            push(marks, `<code>i = ${i}</code>: ${tries.join(", ")} → <code>dp[${i}] = ${best}</code> (last square <code>${i - from}</code>).`);
        }
        push({ [N]: "is-done" }, `<code>dp[12] = ${dp[N]}</code> (4 + 4 + 4). Greedy would take 9 first and need 9 + 1 + 1 + 1 — four squares. Time <code>O(n√n)</code>.`);
        return frames;
    }
    const N = 6;
    const dp = new Array(N + 1).fill("");
    const push = (marks, note) => frames.push({ stage: cellsHTML(dp, marks), note });
    push({}, `<code>dp[i]</code> = ways to reach step <code>i</code> taking 1 or 2 steps. The last move was a 1-step from <code>i-1</code> or a 2-step from <code>i-2</code>, so <code>dp[i] = dp[i-1] + dp[i-2]</code>.`);
    dp[0] = 1;
    dp[1] = 1;
    push({ 0: "is-done", 1: "is-done" }, `Base cases: one way to stand at step 0 (do nothing) and one way to reach step 1.`);
    for (let i = 2; i <= N; i += 1) {
        dp[i] = dp[i - 1] + dp[i - 2];
        push({ [i - 1]: "is-cmp", [i - 2]: "is-cmp", [i]: "is-active" }, `<code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}</code>.`);
    }
    push({ [N]: "is-done" }, `<code>${dp[N]}</code> ways to climb ${N} stairs — Fibonacci again. Plain recursion would recompute the same steps exponentially many times; the table computes each once.`);
    return frames;
};

VIZ["dp-1d"] = {
    title: "One-dimensional DP tables",
    legend: [["lg-act", "cell being filled"], ["lg-cmp", "cells it reads"], ["lg-done", "chosen / final"]],
    options: [
        { value: "stairs", label: "Climbing stairs (n = 6)" },
        { value: "robber", label: "House robber" },
        { value: "squares", label: "Fewest perfect squares" },
    ],
    build: (option) => dp1dFrames(option || "stairs"),
};

/* ---- D4. Unique paths ---- */

VIZ["unique-paths"] = {
    title: "Unique paths in a 4 × 5 grid",
    legend: [["lg-act", "cell being filled"], ["lg-cmp", "above and left"], ["lg-done", "filled"]],
    build() {
        const n = 4;
        const m = 5;
        const dp = Array.from({ length: n }, () => new Array(m).fill(""));
        const frames = [];
        const push = (marks, note) => {
            const gm = {};
            dp.forEach((row, r) => row.forEach((v, c) => { if (v !== "") gm[`${r},${c}`] = "is-done"; }));
            Object.assign(gm, marks);
            frames.push({ stage: gridHTML(dp, gm), note });
        };
        push({}, `A robot moves only right or down from the top-left to the bottom-right. <code>dp[i][j]</code> = number of routes into cell <code>(i, j)</code>.`);
        for (let c = 0; c < m; c += 1) dp[0][c] = 1;
        for (let r = 0; r < n; r += 1) dp[r][0] = 1;
        push({}, `First row and first column: only one route each — straight right, or straight down.`);
        for (let r = 1; r < n; r += 1) {
            for (let c = 1; c < m; c += 1) {
                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
                push({ [`${r - 1},${c}`]: "is-cmp", [`${r},${c - 1}`]: "is-cmp", [`${r},${c}`]: "is-act" }, `<code>dp[${r}][${c}] = above + left = ${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]}</code>.`);
            }
        }
        push({ [`${n - 1},${m - 1}`]: "is-act" }, `<code>${dp[n - 1][m - 1]}</code> routes, in <code>O(n·m)</code>. Each row reads only the row above, so one row of memory is enough.`);
        return frames;
    },
};

/* ---- D5. Rotten oranges (multi-source BFS) ---- */

VIZ["rotten-oranges"] = {
    title: "Rotten oranges: multi-source BFS in waves",
    legend: [["lg-cmp", "rotten at the start"], ["lg-act", "rotted this minute"], ["lg-done", "rotten earlier"]],
    build() {
        const grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]];
        const rows = grid.length;
        const cols = grid[0].length;
        const time = grid.map((row) => row.map((v) => (v === 2 ? 0 : null)));
        const frames = [];
        const view = (minute) => {
            const cells = grid.map((row, r) => row.map((v, c) => (v === 0 ? "" : time[r][c] === null || time[r][c] > minute ? "fresh" : `t${time[r][c]}`)));
            const gm = {};
            grid.forEach((row, r) => row.forEach((v, c) => {
                const t = time[r][c];
                if (t === null || t > minute) return;
                gm[`${r},${c}`] = t === 0 ? "is-cmp" : t === minute ? "is-act" : "is-done";
            }));
            return gridHTML(cells, gm);
        };
        let frontier = [];
        grid.forEach((row, r) => row.forEach((v, c) => { if (v === 2) frontier.push([r, c]); }));
        frames.push({ stage: view(0), note: `Every rotten orange goes into the queue at time 0 <em>before</em> the BFS starts — that is what "multi-source" means. Empty cells are blank.` });
        let minute = 0;
        while (frontier.length) {
            const nextWave = [];
            frontier.forEach(([r, c]) => {
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && time[nr][nc] === null) {
                        time[nr][nc] = minute + 1;
                        nextWave.push([nr, nc]);
                    }
                });
            });
            if (!nextWave.length) break;
            minute += 1;
            frames.push({ stage: view(minute), note: `Minute ${minute}: every orange rotted in minute ${minute - 1} infects its fresh neighbours — ${nextWave.length} new rotten orange${nextWave.length > 1 ? "s" : ""}. One BFS layer = one minute.` });
            frontier = nextWave;
        }
        const left = grid.flat().filter((v, i) => v === 1 && time[Math.floor(i / cols)][i % cols] === null).length;
        frames.push({ stage: view(minute), note: left ? `${left} fresh orange(s) can never be reached → answer <code>-1</code>.` : `No fresh oranges left. Answer <code>${minute}</code> minutes — the depth of the last BFS layer.` });
        return frames;
    },
};

/* ---- D6. Topological sort (Kahn) ---- */

VIZ["topo-sort"] = {
    title: "Topological sort with Kahn's algorithm",
    legend: [["lg-cmp", "in the queue (in-degree 0)"], ["lg-act", "being removed"], ["lg-done", "placed in order"]],
    build() {
        const pos = { 0: [60, 140], 1: [190, 60], 2: [190, 220], 3: [330, 60], 5: [330, 220], 4: [460, 140] };
        const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [2, 5], [5, 4]];
        const indeg = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        edges.forEach(([, v]) => (indeg[v] += 1));
        const frames = [];
        const queue = [];
        const order = [];
        const render = (active, note) => {
            let body = "";
            edges.forEach(([u, v]) => {
                const [x1, y1] = pos[u];
                const [x2, y2] = pos[v];
                const len = Math.hypot(x2 - x1, y2 - y1);
                const ux = (x2 - x1) / len;
                const uy = (y2 - y1) / len;
                const gone = order.includes(u);
                body += edgeHTML(x1 + ux * 22, y1 + uy * 22, x2 - ux * 26, y2 - uy * 26, gone ? "e-done" : u === active ? "e-act" : "e-idle");
                body += `<circle cx="${x2 - ux * 26}" cy="${y2 - uy * 26}" r="3" class="${gone ? "n-done" : "n-cmp"}"/>`;
            });
            Object.entries(pos).forEach(([id, [x, y]]) => {
                const n = Number(id);
                const st = n === active ? "n-act" : order.includes(n) ? "n-done" : queue.includes(n) ? "n-cmp" : "n-idle";
                body += nodeHTML(x, y, id, st, 22, `in=${indeg[n]}`);
            });
            frames.push({ stage: stackHTML(svgHTML(520, 280, body), rowHTML("queue", chipsHTML(queue.map(String))), rowHTML("order", chipsHTML(order.map(String)))), note });
        };
        render(null, `Six courses; an arrow <code>u → v</code> means <code>u</code> must come before <code>v</code>. The small number under each node is its in-degree — how many prerequisites are still pending.`);
        Object.keys(indeg).forEach((k) => { if (indeg[k] === 0) queue.push(Number(k)); });
        render(null, `Enqueue every node with in-degree 0: <code>[${queue.join(", ")}]</code>. These can be taken right now.`);
        while (queue.length) {
            const u = queue.shift();
            const freed = [];
            edges.forEach(([a, b]) => {
                if (a !== u) return;
                indeg[b] -= 1;
                if (indeg[b] === 0) {
                    queue.push(b);
                    freed.push(b);
                }
            });
            render(u, `Pop <code>${u}</code>. Removing it decrements its successors' in-degrees${freed.length ? `; <code>${freed.join(", ")}</code> just reached 0 and join the queue` : "; nobody new is ready yet"}.`);
            order.push(u);
        }
        render(null, `Order <code>${order.join(" → ")}</code>. All ${order.length} nodes came out, so the graph has no cycle. Had a cycle existed, its nodes would never reach in-degree 0 and the order would be short.`);
        return frames;
    },
};

/* ---- D7. Kruskal's MST ---- */

VIZ.kruskal = {
    title: "Kruskal's minimum spanning tree with union-find",
    legend: [["lg-act", "edge under consideration"], ["lg-done", "in the tree"], ["lg-out", "rejected: would form a cycle"]],
    build() {
        const parent = Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n.id]));
        const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
        const sorted = [...GRAPH_EDGES].sort((a, b) => a[2] - b[2]);
        const edgeStates = {};
        const frames = [];
        let cost = 0;
        let taken = 0;
        const labels = () => Object.fromEntries(GRAPH_NODES.map((n) => [n.id, `set ${find(n.id)}`]));
        const states = (a, b, cls = "n-act") => Object.fromEntries(GRAPH_NODES.map((n) => [n.id, n.id === a || n.id === b ? cls : "n-idle"]));
        frames.push({ stage: renderGraph({}, {}, labels()), note: `Sort all edges by weight and take them cheapest first, skipping any edge whose ends are already connected. Every vertex starts in its own set.` });
        for (const [a, b, w] of sorted) {
            if (taken === GRAPH_NODES.length - 1) break;
            const key = `${a}-${b}`;
            const ra = find(a);
            const rb = find(b);
            if (ra === rb) {
                edgeStates[key] = "e-idle";
                frames.push({ stage: renderGraph(states(a, b, "n-out"), { ...edgeStates, [key]: "e-act" }, labels()), note: `Edge <code>${a}–${b}</code> (${w}): both ends are in set <code>${ra}</code> already — adding it would close a cycle. Reject.` });
            } else {
                parent[rb] = ra;
                edgeStates[key] = "e-done";
                cost += w;
                taken += 1;
                frames.push({ stage: renderGraph(states(a, b), { ...edgeStates }, labels()), note: `Edge <code>${a}–${b}</code> (${w}): different sets <code>${ra}</code> and <code>${rb}</code> → take it and <code>union</code> the sets. Tree cost <code>${cost}</code>, ${taken} of ${GRAPH_NODES.length - 1} edges.` });
            }
        }
        frames.push({ stage: renderGraph(Object.fromEntries(GRAPH_NODES.map((n) => [n.id, "n-done"])), edgeStates, labels()), note: `Done after ${GRAPH_NODES.length - 1} edges: total weight <code>${cost}</code>. Sorting dominates at <code>O(E log E)</code>; each union-find check is nearly <code>O(1)</code>.` });
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
