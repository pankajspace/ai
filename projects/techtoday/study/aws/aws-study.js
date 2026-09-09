/* ==========================================================================
   TechToday - AWS study guide
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
    ("echo cat grep awk sed cut sort uniq head tail wc curl jq mkdir cd ls rm cp mv chmod xargs " +
        "aws sam cdk terraform docker kubectl eksctl helm ssh scp python pip node npm npx git " +
        "export watch base64 openssl date").split(" ")
);
/* CloudFormation / SAM templates and IAM policy documents. */
const YAML_KW = new Set("true false null yes no on off".split(" "));
const YAML_BUILTIN = new Set(
    ("AWSTemplateFormatVersion Transform Description Metadata Parameters Mappings Conditions " +
        "Resources Outputs Globals Type Properties DependsOn DeletionPolicy UpdateReplacePolicy " +
        "Ref Sub GetAtt ImportValue Join Select Split FindInMap If Equals Not And Or Fn Export " +
        "Value Default AllowedValues MinValue MaxValue Runtime Handler CodeUri MemorySize Timeout " +
        "Environment Variables Policies Events Api Path Method").split(" ")
);
const JSON_KW = new Set("true false null".split(" "));
const JSON_BUILTIN = new Set(
    ("Version Statement Sid Effect Action NotAction Principal NotPrincipal Resource NotResource " +
        "Condition Allow Deny Service AWS Federated StringEquals StringLike StringNotEquals Bool " +
        "ArnLike IpAddress DateLessThan Null ForAnyValue ForAllValues").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
    yaml: [YAML_KW, YAML_BUILTIN],
    json: [JSON_KW, JSON_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python" || lang === "bash" || lang === "yaml";
    /* JSON has no comment syntax - "(?!)" is a group that can never match. */
    const comment = lang === "json" ? "(?!)" : hashComment ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
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
    python: "Python (boto3)",
    javascript: "JavaScript (SDK v3)",
    bash: "AWS CLI",
    yaml: "CloudFormation",
    json: "JSON",
    logs: "Logs Insights",
    text: "Output",
};
const LANG_KEY = "tt-aws-lang";
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
   AWS widgets
   ========================================================================== */

/* ---- 1. Regions and Availability Zones ---- */

VIZ["regions-az"] = {
    title: "Regions, Availability Zones, and what survives a failure",
    legend: [["lg-act", "serving"], ["lg-done", "healthy"], ["lg-out", "failed"], ["lg-idle", "not yet"]],
    build() {
        const W = 660;
        const H = 280;
        const AZ = [
            { x: 60, label: "us-east-1a" },
            { x: 250, label: "us-east-1b" },
            { x: 440, label: "us-east-1c" },
        ];
        const draw = (az = [], inst = [], extra = "") => {
            let s = bandHTML(30, 26, 600, 226, "Region  us-east-1  \u2014 one geographic area, its own API endpoint");
            AZ.forEach((a, i) => {
                if (!az[i]) return;
                s += boxHTML(a.x, 70, 160, 44, a.label, az[i], "independent power, cooling, network");
                if (inst[i]) s += boxHTML(a.x + 20, 158, 120, 40, inst[i].label, inst[i].state);
            });
            return svgHTML(W, H, s + extra);
        };
        const f = [];
        f.push({
            stage: draw(),
            note: "Start with the outermost box. A <b>Region</b> is a geographic area \u2014 <code>us-east-1</code>, <code>eu-west-1</code>, <code>ap-south-1</code>. It has its own API endpoints, its own prices, and its own copy of your data. Nothing crosses a Region boundary unless you explicitly make it.",
        });
        f.push({
            stage: draw(["n-idle", "n-idle", "n-idle"]),
            note: "Inside a Region sit <b>Availability Zones</b>. Each AZ is one or more physically separate datacentres, far enough apart that a flood or a power failure hits only one, close enough that the link between them is single-digit milliseconds.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done"]),
            note: "That distance is the whole trick. Far enough to fail independently, near enough to replicate <em>synchronously</em>. This is why a Multi-AZ database can promise zero data loss on failover, and a cross-Region replica cannot.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done"], [{ label: "web-1", state: "n-act" }]),
            note: "Here is the mistake almost everyone makes first: one server, one AZ. It works, it is cheap, and it passes every test you write.",
        });
        f.push({
            stage: draw(["n-out", "n-done", "n-done"], [{ label: "web-1", state: "n-out" }]),
            note: "<b>us-east-1a goes dark.</b> Your instance goes with it. The other two AZs are perfectly healthy and completely useless to you \u2014 nothing of yours is running there.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done"], [
                { label: "web-1", state: "n-act" },
                { label: "web-2", state: "n-act" },
                { label: "web-3", state: "n-act" },
            ]),
            note: "The fix is not a better instance, it is a <em>spread</em>. Same code, three AZs, one load balancer in front. Availability on AWS is bought with placement, not with hardware.",
        });
        f.push({
            stage: draw(["n-out", "n-done", "n-done"], [
                { label: "web-1", state: "n-out" },
                { label: "web-2", state: "n-act" },
                { label: "web-3", state: "n-act" },
            ]),
            note: "Same AZ failure, different outcome. Health checks drop <code>web-1</code> out of rotation in seconds and the other two absorb the traffic. <b>Design for 1 AZ to be gone and you have designed for the failure AWS actually has.</b>",
        });
        f.push({
            stage: panesHTML([
                { title: "Zonal \u2014 you pick the AZ", items: [{ text: "EC2 instance", cls: "is-act" }, { text: "EBS volume", cls: "is-act" }, { text: "Subnet", cls: "is-act" }, { text: "RDS instance", cls: "is-act" }] },
                { title: "Regional \u2014 AWS spreads it", items: [{ text: "S3 bucket", cls: "is-done" }, { text: "DynamoDB table", cls: "is-done" }, { text: "SQS queue", cls: "is-done" }, { text: "Lambda function", cls: "is-done" }] },
                { title: "Global \u2014 one for the account", items: [{ text: "IAM", cls: "is-cmp" }, { text: "Route 53", cls: "is-cmp" }, { text: "CloudFront", cls: "is-cmp" }, { text: "Organizations", cls: "is-cmp" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Every service is zonal, regional or global, and that single fact tells you what can fail and what you must replicate. If it is zonal you must run more than one. If it is regional AWS already runs it in three AZs for you. If it is global it lives in <code>us-east-1</code> and you should notice that dependency.",
        });
        return f;
    },
};

/* ---- 2. IAM policy evaluation ---- */

VIZ["iam-evaluation"] = {
    title: "How IAM decides: the gates a request passes through",
    legend: [["lg-act", "being checked"], ["lg-done", "passed"], ["lg-out", "denied here"], ["lg-idle", "not reached"]],
    options: [
        { value: "allow", label: "An allowed request" },
        { value: "implicit", label: "An implicit deny" },
        { value: "explicit", label: "An explicit Deny" },
        { value: "scp", label: "A request blocked by an SCP" },
    ],
    build(option = "allow") {
        const W = 880;
        const H = 400;
        const GATES = [
            ["1. Authenticate the principal", "who is calling? role, user, service"],
            ["2. Any explicit Deny anywhere?", "SCP, identity, resource, boundary"],
            ["3. Service control policies", "the Organizations ceiling"],
            ["4. Resource-based policy", "bucket policy, KMS key policy"],
            ["5. Identity-based policy", "the policies on the role or user"],
            ["6. Permissions boundary", "the maximum this identity may have"],
        ];
        const draw = (states, verdict) => {
            let s = capHTML(240, 18, "s3:GetObject on arn:aws:s3:::reports/2026/q1.csv");
            GATES.forEach((g, i) => {
                s += boxHTML(40, 30 + i * 54, 380, 40, g[0], states[i] || "n-idle");
                s += capHTML(436, 54 + i * 54, g[1], "start");
            });
            if (verdict) {
                s += boxHTML(120, 356, 220, 36, verdict.text, verdict.state);
            }
            return svgHTML(W, H, s);
        };
        const pass = (n) => Array.from({ length: n }, () => "n-done");
        const f = [];
        f.push({
            stage: draw([]),
            note: "Every AWS API call runs this gauntlet, in this order. Nothing is allowed until something says <code>Allow</code>, and one <code>Deny</code> anywhere ends it.",
        });
        f.push({
            stage: draw(["n-act"]),
            note: "<b>Who is asking.</b> AWS resolves the credentials into a principal \u2014 an IAM role session, a user, or an AWS service. The signature on the request proves it; IAM never sees your secret key.",
        });
        f.push({
            stage: draw([...pass(1), "n-act"]),
            note: "<b>The deny sweep.</b> Before evaluating a single <code>Allow</code>, IAM scans <em>every</em> attached policy for a matching explicit <code>Deny</code>. Deny always wins, no matter where it came from or how specific the Allow is.",
        });

        if (option === "explicit") {
            f.push({
                stage: draw([...pass(1), "n-out"], { text: "DENIED", state: "n-out" }),
                note: "Here a policy says <code>\"Effect\": \"Deny\"</code> on <code>s3:GetObject</code> unless the request came through a VPC endpoint. The sweep finds it and stops. <b>The identity policy granting <code>s3:*</code> is never even read.</b>",
            });
            f.push({
                stage: codeHTML([
                    '{ "Effect": "Deny",',
                    '  "Action": "s3:*",',
                    '  "Resource": "arn:aws:s3:::reports/*",',
                    '  "Condition": {',
                    '    "StringNotEquals": { "aws:SourceVpce": "vpce-0abc123" }',
                    "  } }",
                ], { 0: "is-out", 4: "is-act" }),
                note: "<b>The debugging lesson.</b> When an <code>AccessDenied</code> survives adding <code>AdministratorAccess</code>, you are fighting an explicit Deny \u2014 look at SCPs, the resource policy, and permissions boundaries, in that order. Adding permissions can never help.",
            });
            return f;
        }

        f.push({
            stage: draw([...pass(2), "n-act"]),
            note: "<b>Service control policies.</b> If the account is in an AWS Organization, SCPs set a ceiling. An SCP never <em>grants</em> anything \u2014 it only decides what the account is permitted to grant.",
        });

        if (option === "scp") {
            f.push({
                stage: draw([...pass(2), "n-out"], { text: "DENIED", state: "n-out" }),
                note: "The SCP on this OU allows only <code>eu-*</code> Regions, and the call went to <code>us-east-1</code>. Account-level admin cannot override it \u2014 that is exactly the point of an SCP.",
            });
            f.push({
                stage: panesHTML([
                    { title: "What an SCP can do", items: [{ text: "shrink the maximum", cls: "is-cmp" }, { text: "fence off Regions", cls: "is-cmp" }, { text: "block root actions", cls: "is-cmp" }] },
                    { title: "What it cannot do", items: [{ text: "grant a permission", cls: "is-out" }, { text: "affect the management account", cls: "is-out" }, { text: "apply to service-linked roles", cls: "is-out" }] },
                ]),
                note: "<b>Remember the shape.</b> SCPs are a filter, not a faucet. The effective permission is always the <em>intersection</em> of the SCP, the identity policy and the boundary.",
            });
            return f;
        }

        f.push({
            stage: draw([...pass(3), "n-act"]),
            note: "<b>Resource policy.</b> Some resources carry their own policy \u2014 S3 buckets, KMS keys, SQS queues, Lambda functions. A resource policy can grant access to a principal in <em>another account</em> all by itself, which identity policies cannot do.",
        });
        f.push({
            stage: draw([...pass(4), "n-act"]),
            note: "<b>Identity policy.</b> Now the familiar part: the JSON attached to the role. It needs an <code>Allow</code> whose <code>Action</code> and <code>Resource</code> both match, and whose <code>Condition</code> block is satisfied.",
        });

        if (option === "implicit") {
            f.push({
                stage: draw([...pass(4), "n-out"], { text: "DENIED (implicit)", state: "n-out" }),
                note: "No policy said <code>Deny</code>. No policy said <code>Allow</code> either. <b>The default is deny</b> \u2014 which means most of your access errors are simply a missing statement, not a hostile one.",
            });
            f.push({
                stage: codeHTML([
                    '"Resource": "arn:aws:s3:::reports"        # the bucket',
                    '"Resource": "arn:aws:s3:::reports/*"      # the objects',
                ], { 0: "is-out", 1: "is-done" }),
                note: "<b>The classic near-miss.</b> Bucket-level actions (<code>ListBucket</code>) need the bucket ARN; object-level actions (<code>GetObject</code>) need the <code>/*</code> ARN. Grant one and forget the other and you get an implicit deny that looks like a bug.",
            });
            return f;
        }

        f.push({
            stage: draw([...pass(5), "n-act"]),
            note: "<b>Permissions boundary.</b> An optional second policy that caps what an identity can do, however generous its own policies are. Platform teams use it so developers can create roles without being able to create <em>privileged</em> roles.",
        });
        f.push({
            stage: draw(pass(6), { text: "ALLOWED", state: "n-done" }),
            note: "Six gates, all passed, and only now does S3 return the bytes. <b>The whole model in one line: deny by default, one explicit Deny beats every Allow, and the answer is the intersection of every policy in the path.</b>",
        });
        return f;
    },
};

/* ---- 3. Roles and temporary credentials ---- */

VIZ["assume-role"] = {
    title: "AssumeRole \u2014 where temporary credentials come from",
    legend: [["lg-act", "this hop"], ["lg-done", "completed"], ["lg-idle", "waiting"]],
    build() {
        const LANES = [
            { x: 110, label: "Your app", sub: "on EC2 / Lambda / laptop" },
            { x: 330, label: "STS", sub: "sts.amazonaws.com" },
            { x: 550, label: "S3", sub: "the resource" },
        ];
        const MSG = [
            { from: 0, to: 1, y: 110, text: "AssumeRole(role ARN)" },
            { from: 1, to: 1, y: 150, text: "" },
            { from: 1, to: 0, y: 190, text: "AccessKeyId + Secret + SessionToken" },
            { from: 0, to: 2, y: 240, text: "GetObject, SigV4-signed" },
            { from: 2, to: 0, y: 285, text: "200 OK + bytes" },
        ];
        const draw = (upto, laneStates = {}, marks = []) => {
            const lanes = LANES.map((l, i) => ({ ...l, state: laneStates[i] || "n-idle" }));
            const msgs = MSG.filter((m) => m.from !== m.to).map((m, i) => ({
                ...m,
                state: i < upto ? "e-done" : i === upto ? "e-act" : "e-idle",
            }));
            return seqHTML(660, 320, lanes, msgs, marks);
        };
        const f = [];
        f.push({
            stage: draw(-1),
            note: "The question this answers: how does code get credentials <em>without</em> anyone pasting an access key into a config file?",
        });
        f.push({
            stage: draw(0, { 0: "n-act" }),
            note: "Your code calls <code>sts:AssumeRole</code> naming the role it wants. It proves who it is with whatever identity it already has \u2014 an instance profile, a Lambda execution role, an SSO session, or an OIDC token from GitHub Actions.",
        });
        f.push({
            stage: draw(0, { 0: "n-done", 1: "n-act" }, [{ x: 330, y: 165, text: "checks the role's trust policy" }]),
            note: "<b>The gate people forget.</b> STS reads the role's <em>trust policy</em> \u2014 a resource policy listing who may assume it. Permissions on your side are not enough; the role has to say yes too. This is the source of most \"is not authorized to perform: sts:AssumeRole\" errors.",
        });
        f.push({
            stage: draw(1, { 0: "n-act", 1: "n-done" }, [{ x: 330, y: 210, text: "expires in 1h (15m\u201312h)" }]),
            note: "Back come <b>three</b> values, not two: key, secret, and a session token. All three must be sent, and they stop working when the session expires \u2014 so a leaked set is worth an hour, not forever.",
        });
        f.push({
            stage: draw(2, { 0: "n-act", 1: "n-done", 2: "n-act" }),
            note: "The SDK signs the request with those credentials using <b>SigV4</b>. The secret is never transmitted \u2014 it is the HMAC key over a canonical form of the request, which is also why a wrong clock breaks everything.",
        });
        f.push({
            stage: draw(3, { 0: "n-done", 1: "n-done", 2: "n-done" }),
            note: "S3 validates the signature, runs the six gates from the previous animation, and answers. <b>Nothing long-lived was stored anywhere.</b>",
        });
        f.push({
            stage: panesHTML([
                { title: "Never do this", items: [{ text: "IAM user + access key", cls: "is-out" }, { text: "key in .env or CI secret", cls: "is-out" }, { text: "key committed to git", cls: "is-out" }] },
                { title: "Do this instead", items: [{ text: "EC2 \u2192 instance profile", cls: "is-done" }, { text: "Lambda \u2192 execution role", cls: "is-done" }, { text: "EKS \u2192 IRSA / Pod Identity", cls: "is-done" }, { text: "CI \u2192 OIDC federation", cls: "is-done" }, { text: "humans \u2192 IAM Identity Center", cls: "is-done" }] },
            ]),
            note: "<b>The takeaway.</b> Every runtime on AWS has a way to receive a role automatically. If you are handling a static access key, there is nearly always a role-based option you have not found yet.",
        });
        return f;
    },
};

/* ---- 4. VPC anatomy and the path of a packet ---- */

VIZ["vpc-anatomy"] = {
    title: "Building a VPC, one piece at a time",
    legend: [["lg-act", "just added"], ["lg-done", "in place"], ["lg-out", "blocked"], ["lg-idle", "not yet"]],
    build() {
        const W = 680;
        const H = 340;
        const draw = (o) => {
            let s = bandHTML(150, 40, 470, 250, "VPC  10.0.0.0/16");
            if (o.subnets) {
                s += boxHTML(180, 84, 180, 44, "public 10.0.1.0/24", o.pub || "n-done", "AZ a");
                s += boxHTML(180, 190, 180, 44, "private 10.0.11.0/24", o.priv || "n-done", "AZ a");
                s += boxHTML(410, 84, 180, 44, "public 10.0.2.0/24", o.pub || "n-done", "AZ b");
                s += boxHTML(410, 190, 180, 44, "private 10.0.12.0/24", o.priv || "n-done", "AZ b");
            }
            if (o.igw) s += boxHTML(310, 8, 150, 26, "Internet Gateway", o.igw);
            if (o.nat) s += boxHTML(196, 152, 148, 26, "NAT Gateway", o.nat);
            if (o.internet) s += boxHTML(20, 8, 110, 26, "the internet", o.internet);
            (o.arrows || []).forEach((a) => {
                s += arrowHTML(a[0], a[1], a[2], a[3], a[4] || "e-act", a[5] || "");
            });
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw({}),
            note: "A <b>VPC</b> is a private slice of the AWS network with an address range you choose. <code>10.0.0.0/16</code> is the conventional starting point. Pick it once and mean it \u2014 you cannot shrink a VPC CIDR later, and overlapping ranges make future peering painful.",
        });
        f.push({
            stage: draw({ subnets: true, pub: "n-act", priv: "n-act" }),
            note: "Carve it into <b>subnets</b>. A subnet lives in exactly one AZ \u2014 that is how a VPC, which is regional, gets pinned to physical datacentres. Two per AZ is the standard shape: one public, one private.",
        });
        f.push({
            stage: draw({ subnets: true, igw: "n-act", internet: "n-idle" }),
            note: "Attach an <b>Internet Gateway</b> to the VPC. It is not a device you size or pay for by the hour; it is a horizontally scaled, highly available piece of the VPC itself.",
        });
        f.push({
            stage: draw({
                subnets: true, igw: "n-done", internet: "n-done", pub: "n-act",
                arrows: [[270, 84, 330, 34, "e-act", "0.0.0.0/0 \u2192 igw"], [310, 21, 130, 21, "e-act"]],
            }),
            note: "<b>Here is the only thing that makes a subnet \u201cpublic\u201d:</b> its route table has a default route to the IGW. There is no checkbox called public. Change the route and a public subnet becomes private, instantly and silently.",
        });
        f.push({
            stage: draw({
                subnets: true, igw: "n-done", internet: "n-done", priv: "n-out",
                arrows: [[270, 190, 270, 152, "e-idle"], [270, 150, 330, 40, "e-idle", "no route"]],
            }),
            note: "The private subnets have no such route, so nothing in them can reach the internet \u2014 and, just as importantly, nothing on the internet can start a conversation with them. This is where databases and application servers belong.",
        });
        f.push({
            stage: draw({
                subnets: true, igw: "n-done", internet: "n-done", nat: "n-act", priv: "n-done",
                arrows: [[270, 190, 270, 180, "e-act"], [270, 150, 270, 138, "e-act", "0.0.0.0/0 \u2192 nat"]],
            }),
            note: "But a private instance still needs to fetch OS patches. A <b>NAT Gateway</b> sits in a <em>public</em> subnet and translates outbound traffic to its own public address. Outbound works; inbound still does not.",
        });
        f.push({
            stage: draw({
                subnets: true, igw: "n-done", internet: "n-done", nat: "n-done", priv: "n-done", pub: "n-done",
                arrows: [[270, 190, 270, 180, "e-done"], [270, 150, 330, 34, "e-done"], [310, 21, 130, 21, "e-done", "yum update"]],
            }),
            note: "The finished path: instance \u2192 route table \u2192 NAT \u2192 IGW \u2192 internet, and the replies come back the same way because NAT keeps a translation table.",
        });
        f.push({
            stage: dataGridHTML([
                ["Destination", "Target", "Which table"],
                ["10.0.0.0/16", "local", "both \u2014 always there, cannot be removed"],
                ["0.0.0.0/0", "igw-\u2026", "public subnets only"],
                ["0.0.0.0/0", "nat-\u2026", "private subnets only"],
                ["s3 prefix list", "vpce-\u2026", "private subnets, gateway endpoint"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "2,1": "is-act", "3,1": "is-act" }),
            note: "<b>The whole VPC in one table.</b> The <code>local</code> route is why anything in the VPC can talk to anything else in the VPC by default. Everything else about connectivity is one line in a route table \u2014 which is also the first place to look when traffic will not flow.",
        });
        f.push({
            stage: panesHTML([
                { title: "NAT Gateway costs", items: [{ text: "~$0.045 / hour, per AZ", cls: "is-out" }, { text: "~$0.045 / GB processed", cls: "is-out" }, { text: "billed even when idle", cls: "is-out" }] },
                { title: "Gateway endpoint (S3, DynamoDB)", items: [{ text: "free", cls: "is-done" }, { text: "traffic never leaves AWS", cls: "is-done" }, { text: "just a route-table entry", cls: "is-done" }] },
            ]),
            note: "<b>The bill nobody predicts.</b> A NAT Gateway in three AZs pushing terabytes to S3 is a four-figure monthly line item, and a free gateway endpoint removes it entirely. Check this before anything else on a surprising VPC bill.",
        });
        return f;
    },
};

/* ---- 5. Security groups vs network ACLs ---- */

VIZ["sg-vs-nacl"] = {
    title: "Security groups and NACLs on the same packet",
    legend: [["lg-act", "packet here"], ["lg-done", "allowed"], ["lg-out", "dropped"], ["lg-idle", "idle"]],
    options: [
        { value: "sg", label: "A stateful security group" },
        { value: "nacl", label: "A stateless network ACL" },
    ],
    build(option = "sg") {
        const W = 660;
        const H = 260;
        const draw = (o) => {
            let s = boxHTML(20, 100, 110, 44, "client", o.client || "n-idle");
            s += boxHTML(210, 100, 150, 44, o.gate, o.gateState || "n-idle", o.gateSub || "");
            s += boxHTML(470, 100, 150, 44, "instance :443", o.inst || "n-idle");
            (o.arrows || []).forEach((a) => {
                s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || "");
            });
            if (o.cap) s += capHTML(330, 226, o.cap);
            return svgHTML(W, H, s);
        };
        const f = [];
        if (option === "sg") {
            const gate = "security group";
            f.push({ stage: draw({ gate, gateSub: "attached to the ENI" }), note: "A <b>security group</b> wraps the network interface of the instance itself, not the subnet. Two instances in the same subnet can have completely different rules." });
            f.push({
                stage: draw({ gate, client: "n-act", gateState: "n-act", arrows: [[130, 122, 205, 122, "e-act", "SYN \u2192 :443"]] }),
                note: "Inbound packet arrives. The security group checks its <b>allow</b> list \u2014 there are no deny rules in a security group at all. If nothing matches, the packet is silently dropped (which is why a hung connection so often means a missing rule).",
            });
            f.push({
                stage: draw({ gate, gateState: "n-done", inst: "n-act", arrows: [[130, 122, 205, 122, "e-done"], [365, 122, 465, 122, "e-act", "rule: 443 from 0.0.0.0/0"]], cap: "connection recorded in the state table" }),
                note: "A rule allows <code>tcp/443</code> from anywhere, so the packet passes \u2014 <b>and the connection is remembered</b>. That memory is what \u201cstateful\u201d means.",
            });
            f.push({
                stage: draw({ gate, gateState: "n-done", inst: "n-done", client: "n-done", arrows: [[465, 134, 365, 134, "e-done"], [205, 134, 130, 134, "e-done", "response \u2190 automatically allowed"]] }),
                note: "The reply goes back out with <b>no outbound rule needed</b>. This is the single most useful thing to know about security groups: you almost never write outbound rules, because responses to allowed inbound traffic are free.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Security group rule", items: [{ text: "allow 443 from 0.0.0.0/0", cls: "is-done" }, { text: "allow 5432 from sg-app", cls: "is-done" }, { text: "no deny rules exist", cls: "is-ghost" }] },
                    { title: "Why sg-app, not a CIDR", items: [{ text: "instances change IP", cls: "is-act" }, { text: "autoscaling adds hosts", cls: "is-act" }, { text: "the reference follows them", cls: "is-done" }] },
                ]),
                note: "<b>The idiom to copy.</b> Point one security group at another (<code>allow 5432 from sg-app</code>) instead of at an IP range. It keeps working through scaling, replacement and re-IPing, and it documents the architecture as it goes.",
            });
            return f;
        }
        const gate = "network ACL";
        f.push({ stage: draw({ gate, gateSub: "attached to the subnet" }), note: "A <b>network ACL</b> guards the subnet boundary. Every packet in or out of the subnet passes it, whatever the instance is." });
        f.push({
            stage: draw({ gate, client: "n-act", gateState: "n-act", arrows: [[130, 122, 205, 122, "e-act", "SYN \u2192 :443"]], cap: "rules evaluated in number order, first match wins" }),
            note: "Rules are <b>numbered and ordered</b>, and unlike security groups they can <code>DENY</code>. Rule 100 is checked before rule 200, and evaluation stops at the first match \u2014 so a broad allow at 100 makes a deny at 200 dead code.",
        });
        f.push({
            stage: draw({ gate, gateState: "n-done", inst: "n-act", arrows: [[130, 122, 205, 122, "e-done"], [365, 122, 465, 122, "e-act", "100 ALLOW tcp 443"]] }),
            note: "Inbound rule 100 allows it through. So far this looks exactly like a security group.",
        });
        f.push({
            stage: draw({ gate, gateState: "n-out", inst: "n-done", arrows: [[465, 134, 365, 134, "e-done"], [355, 134, 300, 134, "e-idle", "outbound: no match \u2192 DROP"]], cap: "the reply is a brand-new packet to the NACL" }),
            note: "<b>And here is the difference.</b> The NACL has no memory of the inbound packet. The response is evaluated fresh against the <em>outbound</em> rules \u2014 and there is no rule for it, so it dies. The client sees a timeout, the instance sees a completed request, and nobody sees an error.",
        });
        f.push({
            stage: dataGridHTML([
                ["#", "Type", "Port range", "Source", "Allow/Deny"],
                ["100", "inbound", "443", "0.0.0.0/0", "ALLOW"],
                ["100", "outbound", "1024-65535", "0.0.0.0/0", "ALLOW"],
                ["*", "both", "all", "0.0.0.0/0", "DENY"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head", "2,2": "is-act", "3,4": "is-out" }),
            note: "The fix is an outbound rule for the <b>ephemeral port range</b> \u2014 the arbitrary high port the client picked as its source. Every stateless firewall needs this, and forgetting it is the classic NACL outage.",
        });
        f.push({
            stage: panesHTML([
                { title: "Security group", items: [{ text: "on the instance ENI", cls: "is-done" }, { text: "stateful", cls: "is-done" }, { text: "allow only", cls: "is-done" }, { text: "all rules evaluated", cls: "is-done" }, { text: "your everyday tool", cls: "is-cmp" }] },
                { title: "Network ACL", items: [{ text: "on the subnet", cls: "is-act" }, { text: "stateless", cls: "is-out" }, { text: "allow and deny", cls: "is-act" }, { text: "first match by number", cls: "is-act" }, { text: "coarse, rarely needed", cls: "is-ghost" }] },
            ]),
            note: "<b>Practical advice:</b> do your work in security groups and leave the default \u201callow all\u201d NACL alone. Reach for a NACL only when you need a blunt subnet-wide deny \u2014 blocking an IP range, or quarantining a subnet during an incident.",
        });
        return f;
    },
};

/* ---- 6. S3 durability ---- */

VIZ["s3-durability"] = {
    title: "What happens to an object when you PUT it",
    legend: [["lg-act", "writing"], ["lg-done", "stored"], ["lg-out", "lost"], ["lg-idle", "idle"]],
    build() {
        const W = 660;
        const H = 260;
        const AZ = [110, 320, 530];
        const draw = (o) => {
            let s = boxHTML(20, 30, 130, 40, "your app", o.app || "n-idle");
            s += bandHTML(20, 96, 620, 140, "Region \u2014 S3 stores every object in \u2265 3 Availability Zones");
            AZ.forEach((x, i) => {
                s += boxHTML(x - 70, 140, 140, 44, o.copy && o.copy[i] ? "q1.csv" : "\u2014", (o.copy && o.copy[i]) || "n-idle", `AZ ${"abc"[i]}`);
            });
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            if (o.cap) s += capHTML(330, 90, o.cap);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({ app: "n-act", cap: "PUT /reports/q1.csv" }), note: "You <code>PUT</code> an object. S3 is not a filesystem \u2014 there are no directories, and the slashes in the key are just characters. <code>reports/q1.csv</code> is one flat key in one flat namespace." });
        f.push({
            stage: draw({ app: "n-act", copy: ["n-act", "n-act", "n-act"], arrows: [[150, 50, 110, 136, "e-act"], [150, 50, 320, 136, "e-act"], [150, 50, 530, 136, "e-act"]] }),
            note: "Before the API returns, S3 writes redundantly across at least three Availability Zones. <b>You are not waiting for a disk; you are waiting for a quorum in three datacentres.</b>",
        });
        f.push({
            stage: draw({ app: "n-done", copy: ["n-done", "n-done", "n-done"], cap: "200 OK \u2014 read-after-write consistent" }),
            note: "Only now does the <code>200</code> come back, and the object is immediately readable by every client \u2014 <b>strong read-after-write consistency</b>, since 2020. Advice you may still find online about \u201ceventual consistency in S3\u201d is out of date.",
        });
        f.push({
            stage: draw({ app: "n-done", copy: ["n-out", "n-done", "n-done"], cap: "AZ a is gone" }),
            note: "An entire AZ fails. Your object is still served, and S3 quietly rebuilds the missing copy. This is the mechanism behind <b>eleven nines</b> of durability: 99.999999999%, which for 10 million objects is one expected loss every ten thousand years.",
        });
        f.push({
            stage: panesHTML([
                { title: "Durability \u2014 will it survive?", items: [{ text: "11 nines", cls: "is-done" }, { text: "hardware, AZ loss", cls: "is-done" }, { text: "AWS handles it", cls: "is-done" }] },
                { title: "Availability \u2014 can you read it now?", items: [{ text: "99.99% (Standard)", cls: "is-act" }, { text: "~52 min / year", cls: "is-act" }] },
                { title: "Neither protects you from", items: [{ text: "you deleting it", cls: "is-out" }, { text: "a bad deploy overwriting it", cls: "is-out" }, { text: "ransomware", cls: "is-out" }] },
            ]),
            note: "<b>The distinction that matters in an interview and in an incident.</b> Durability is about loss, availability is about reach, and <em>neither is a backup</em>. Versioning plus MFA delete plus Object Lock is what protects you from yourself.",
        });
        return f;
    },
};

/* ---- 7. S3 storage classes and lifecycle ---- */

VIZ["s3-lifecycle"] = {
    title: "One object aging through the storage classes",
    legend: [["lg-act", "current class"], ["lg-done", "already passed"], ["lg-out", "deleted"], ["lg-idle", "future"]],
    build() {
        const TICKS = [
            { at: 0, label: "day 0" },
            { at: 0.09, label: "30" },
            { at: 0.25, label: "90" },
            { at: 0.49, label: "180" },
            { at: 1, label: "365" },
        ];
        const SEG = [
            { at: 0, width: 0.09, label: "Standard  $0.023/GB", state: "n-act" },
            { at: 0.09, width: 0.16, label: "Standard-IA  $0.0125", state: "n-act" },
            { at: 0.25, width: 0.24, label: "Glacier IR  $0.004", state: "n-act" },
            { at: 0.49, width: 0.51, label: "Deep Archive  $0.00099", state: "n-act" },
        ];
        const draw = (n, expired) => {
            const marks = SEG.slice(0, n).map((s, i) => ({ ...s, state: i === n - 1 ? "n-act" : "n-done" }));
            if (expired) marks.push({ at: 1, label: "\u2717", state: "n-out" });
            return timelineHTML(660, [{ label: "q1.csv", marks }], TICKS, n ? SEG[n - 1].at + SEG[n - 1].width : 0);
        };
        const f = [];
        f.push({ stage: draw(1), note: "Day 0. The object lands in <b>S3 Standard</b>: millisecond access, no retrieval fee, ~$0.023 per GB-month. For the first month it is read constantly, so this is exactly right." });
        f.push({ stage: draw(2), note: "Day 30. Reads have almost stopped. A lifecycle rule moves it to <b>Standard-IA</b> \u2014 same latency, same durability, roughly half the storage price, but now you pay a per-GB <em>retrieval</em> fee and there is a 30-day minimum charge." });
        f.push({ stage: draw(3), note: "Day 90. Nobody has opened it in two months. <b>Glacier Instant Retrieval</b> keeps the millisecond access but drops storage to a fifth of Standard, with a higher retrieval fee and a 90-day minimum." });
        f.push({ stage: draw(4), note: "Day 180. Now it is compliance ballast. <b>Deep Archive</b> costs about a dollar per terabyte per month \u2014 but retrieval takes <em>hours</em>, and the minimum commitment is 180 days." });
        f.push({ stage: draw(4, true), note: "Day 365. An expiration rule deletes it. <b>The whole sequence is a few lines of JSON on the bucket and runs forever without you.</b>" });
        f.push({
            stage: dataGridHTML([
                ["Class", "$/GB-mo", "Retrieval", "Min days", "Use it for"],
                ["Standard", "0.023", "free, ms", "\u2014", "active data"],
                ["Intelligent-Tiering", "0.023 \u2192 0.0025", "free, ms", "\u2014", "unpredictable access"],
                ["Standard-IA", "0.0125", "$0.01/GB, ms", "30", "monthly reads"],
                ["Glacier IR", "0.004", "$0.03/GB, ms", "90", "quarterly reads"],
                ["Glacier Flexible", "0.0036", "minutes\u2013hours", "90", "backups"],
                ["Deep Archive", "0.00099", "12 hours", "180", "compliance"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head", "2,0": "is-done", "2,1": "is-done" }),
            note: "<b>The one to reach for when you do not know the access pattern is Intelligent-Tiering.</b> It moves objects between tiers automatically for a small per-object monitoring fee and never charges a retrieval penalty \u2014 which removes the risk that makes IA a bad default.",
        });
        f.push({
            stage: panesHTML([
                { title: "Where lifecycle bites", items: [{ text: "IA minimum is 30 days", cls: "is-out" }, { text: "objects < 128 KB cost more in IA", cls: "is-out" }, { text: "transitions are billed per object", cls: "is-out" }] },
                { title: "Do not forget", items: [{ text: "expire old versions too", cls: "is-act" }, { text: "abort incomplete uploads", cls: "is-act" }, { text: "rules apply to prefixes and tags", cls: "is-done" }] },
            ]),
            note: "<b>The rule everyone should add on day one:</b> <code>AbortIncompleteMultipartUpload</code> after 7 days. Failed multipart uploads leave parts that you pay for and cannot see in the console object list. Plenty of mysterious S3 bills are exactly this.",
        });
        return f;
    },
};

/* ---- 8. Auto Scaling ---- */

VIZ["autoscaling"] = {
    title: "Target tracking \u2014 an Auto Scaling group reacting to load",
    legend: [["lg-cmp", "over target"], ["lg-act", "at target"], ["lg-done", "healthy"], ["lg-out", "terminating"]],
    build() {
        const draw = (cpu, states, caption) => {
            const marks = {};
            cpu.forEach((v, i) => {
                marks[i] = states[i] || (v > 65 ? "is-cmp" : "is-act");
            });
            return (
                barsHTML(cpu, marks) +
                `<div class="viz-caption">${caption} &nbsp;&middot;&nbsp; target CPU 50% &nbsp;&middot;&nbsp; min 2, max 8</div>`
            );
        };
        const f = [];
        f.push({ stage: draw([28, 31], {}, "2 instances, quiet morning"), note: "The group holds two instances. A <b>target tracking</b> policy is watching average CPU and trying to keep it at 50% \u2014 you state the outcome you want, not the steps to get there." });
        f.push({ stage: draw([74, 79], {}, "traffic doubles \u2014 average 76%"), note: "Traffic arrives. Average CPU is 76%, well over target. CloudWatch needs a couple of consecutive one-minute datapoints before it acts, which is why nothing happens in the first sixty seconds." });
        f.push({ stage: draw([74, 79, 0], { 2: "is-out" }, "alarm fires \u2192 launching 1"), note: "The alarm fires and the group launches an instance from its <b>launch template</b>. Note what it is not doing: it is not making the existing instances bigger. Horizontal, not vertical." });
        f.push({ stage: draw([70, 72, 12], { 2: "is-act" }, "new instance booting \u2014 not yet in service"), note: "The instance boots, but the load balancer will not send it traffic until it passes health checks. <b>This gap is why scaling is slow:</b> AMI boot + user data + application start can easily be three minutes." });
        f.push({ stage: draw([54, 56, 52], {}, "3 instances \u2014 average 54%"), note: "In service, and the average drops toward target. Target tracking now sits in a <em>cooldown</em> so it does not stack another scale-out on top of a change it has not yet measured." });
        f.push({ stage: draw([49, 51, 48, 50], {}, "another step \u2014 4 instances, 49%"), note: "One more step and CPU settles at target. The group will keep adding up to <code>max</code> and no further \u2014 which is your blast-radius limit and your budget limit at the same time." });
        f.push({ stage: draw([22, 24, 21, 20], { 3: "is-out" }, "evening \u2014 scaling in"), note: "Evening. CPU falls, and after a longer window the group scales <em>in</em>. Scale-out is aggressive and scale-in is cautious, deliberately \u2014 the cost of being briefly over-provisioned is small, and the cost of flapping is an outage." });
        f.push({
            stage: panesHTML([
                { title: "Makes scaling work", items: [{ text: "stateless instances", cls: "is-done" }, { text: "fast-booting AMI", cls: "is-done" }, { text: "health check = real readiness", cls: "is-done" }, { text: "spread across 3 AZs", cls: "is-done" }] },
                { title: "Breaks scaling", items: [{ text: "sessions on local disk", cls: "is-out" }, { text: "10-minute bootstrap", cls: "is-out" }, { text: "health check hits /", cls: "is-out" }, { text: "database is the bottleneck", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion.</b> Auto Scaling only helps if a new instance is interchangeable and arrives quickly. If your instances hold state or take ten minutes to bake, the group will still add capacity \u2014 just always five minutes after you needed it.",
        });
        return f;
    },
};

/* ---- 9. Load balancer routing ---- */

VIZ["alb-routing"] = {
    title: "A request through an Application Load Balancer",
    legend: [["lg-act", "in the path"], ["lg-done", "healthy"], ["lg-out", "failing health checks"], ["lg-idle", "idle"]],
    build() {
        const W = 680;
        const H = 300;
        const TG = [
            { y: 50, label: "tg-web", rule: "default" },
            { y: 130, label: "tg-api", rule: "/api/*" },
            { y: 210, label: "tg-static", rule: "Host: cdn.\u2026" },
        ];
        const draw = (o) => {
            let s = boxHTML(16, 130, 96, 40, "client", o.client || "n-idle");
            s += boxHTML(160, 110, 130, 80, "ALB :443", o.alb || "n-idle", "listener rules, in order");
            TG.forEach((t, i) => {
                s += boxHTML(360, t.y, 130, 40, t.label, (o.tg && o.tg[i]) || "n-idle", t.rule);
                [0, 1].forEach((k) => {
                    const st = (o.tgt && o.tgt[`${i}${k}`]) || "n-idle";
                    s += boxHTML(536, t.y - 6 + k * 26, 120, 22, `${t.label.slice(3)}-${k + 1}`, st);
                });
            });
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({}), note: "One <b>listener</b> on port 443, three <b>target groups</b>, and an ordered list of rules. An ALB understands HTTP, so it can route on path, host, header, method or source IP \u2014 a network load balancer, which only sees TCP, cannot." });
        f.push({
            stage: draw({ client: "n-act", alb: "n-act", arrows: [[112, 150, 155, 150, "e-act", "GET /api/orders"]] }),
            note: "The request arrives. TLS terminates here, at a certificate managed by <b>ACM</b> and renewed automatically \u2014 one of the quiet wins of using a managed load balancer.",
        });
        f.push({
            stage: draw({ client: "n-done", alb: "n-act", tg: ["n-idle", "n-act", "n-idle"], arrows: [[290, 150, 355, 150, "e-act", "rule 2 matches /api/*"]] }),
            note: "Rules are evaluated <b>in priority order, first match wins</b>. <code>/api/*</code> matches before the catch-all default, so the request goes to <code>tg-api</code>. Order matters more than specificity here \u2014 a broad rule at priority 1 shadows everything below it.",
        });
        f.push({
            stage: draw({ client: "n-done", alb: "n-done", tg: ["n-idle", "n-done", "n-idle"], tgt: { "10": "n-act", "11": "n-done" }, arrows: [[490, 145, 530, 132, "e-act", "round robin"]] }),
            note: "Within the target group the ALB picks a target \u2014 round-robin by default, or <em>least outstanding requests</em>, which is usually the better choice when request durations vary.",
        });
        f.push({
            stage: draw({ tg: ["n-idle", "n-done", "n-idle"], tgt: { "10": "n-out", "11": "n-done" }, arrows: [[490, 132, 530, 126, "e-idle", "2 failed checks"]] }),
            note: "<b>Health checks are the real control loop.</b> The ALB polls a path on every target every 30 seconds. Two failures and the target is drained out of rotation; two successes and it comes back. No human involved.",
        });
        f.push({
            stage: draw({ client: "n-act", alb: "n-act", tg: ["n-idle", "n-done", "n-idle"], tgt: { "10": "n-out", "11": "n-act" }, arrows: [[112, 150, 155, 150, "e-act"], [290, 150, 355, 150, "e-act"], [490, 150, 530, 152, "e-act", "all traffic to api-2"]] }),
            note: "Traffic shifts to the healthy target with no error returned to the client. This is why the health-check path must test what the request actually needs \u2014 a check that returns <code>200</code> from a static route will happily keep a broken app in rotation.",
        });
        f.push({
            stage: dataGridHTML([
                ["", "ALB", "NLB", "CloudFront"],
                ["Layer", "7 (HTTP)", "4 (TCP/UDP)", "7, at the edge"],
                ["Routes on", "path, host, header", "port only", "path, header, cookie"],
                ["Latency", "~ms", "~\u00b5s", "cache hit = 0 origin"],
                ["Static IP", "no (DNS name)", "yes, per AZ", "no"],
                ["Reach for it when", "web and API traffic", "TCP, extreme scale", "global users, caching"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "5,1": "is-done", "5,2": "is-act", "5,3": "is-cmp" }),
            note: "<b>Choosing between them takes one question:</b> do you need to make decisions based on the contents of the HTTP request? Yes \u2192 ALB. No, and you need raw throughput or a static IP \u2192 NLB. Users are far away and content is cacheable \u2192 CloudFront in front of either.",
        });
        return f;
    },
};

/* ---- 10. Lambda execution model ---- */

VIZ["lambda-lifecycle"] = {
    title: "Cold start, warm start, and where the time actually goes",
    legend: [["lg-cmp", "you pay for this"], ["lg-act", "running"], ["lg-done", "done"], ["lg-idle", "idle"]],
    build() {
        const TICKS = [{ at: 0, label: "0 ms" }, { at: 0.4, label: "400" }, { at: 0.7, label: "700" }, { at: 1, label: "1000" }];
        const lane = (label, marks) => ({ label, marks });
        const f = [];
        f.push({
            stage: timelineHTML(660, [lane("invoke #1", [])], TICKS, 0),
            note: "An event arrives \u2014 an API Gateway request, an S3 notification, an SQS batch. There is no server waiting for it. AWS has to build one.",
        });
        f.push({
            stage: timelineHTML(660, [lane("invoke #1", [{ at: 0, width: 0.14, label: "micro-VM", state: "n-act" }])], TICKS, 0.14),
            note: "<b>Firecracker</b> boots a micro-VM \u2014 a stripped-down virtual machine that starts in tens of milliseconds. You are not billed for this part.",
        });
        f.push({
            stage: timelineHTML(660, [lane("invoke #1", [
                { at: 0, width: 0.14, label: "micro-VM", state: "n-done" },
                { at: 0.14, width: 0.16, label: "download code", state: "n-act" },
            ])], TICKS, 0.3),
            note: "Your deployment package is pulled and unpacked. <b>Size matters here</b> \u2014 a 250 MB bundle of unused dependencies costs you real milliseconds on every cold start.",
        });
        f.push({
            stage: timelineHTML(660, [lane("invoke #1", [
                { at: 0, width: 0.14, label: "micro-VM", state: "n-done" },
                { at: 0.14, width: 0.16, label: "download", state: "n-done" },
                { at: 0.3, width: 0.4, label: "init: imports, SDK clients, DB pool", state: "n-cmp" },
            ])], TICKS, 0.7),
            note: "<b>The init phase \u2014 everything outside your handler function.</b> Imports, SDK client construction, secrets fetched at module scope, a database pool. This is nearly always the biggest slice, and it is the slice you control.",
        });
        f.push({
            stage: timelineHTML(660, [lane("invoke #1", [
                { at: 0, width: 0.14, label: "micro-VM", state: "n-done" },
                { at: 0.14, width: 0.16, label: "download", state: "n-done" },
                { at: 0.3, width: 0.4, label: "init", state: "n-done" },
                { at: 0.7, width: 0.3, label: "your handler", state: "n-act" },
            ])], TICKS, 1),
            note: "Finally the handler runs \u2014 300 ms of actual work after 700 ms of setup. <b>That whole 1000 ms is the cold start the client experienced.</b>",
        });
        f.push({
            stage: timelineHTML(660, [
                lane("invoke #1", [{ at: 0, width: 0.7, label: "cold: VM + code + init", state: "n-done" }, { at: 0.7, width: 0.3, label: "handler", state: "n-done" }]),
                lane("invoke #2", [{ at: 0, width: 0.3, label: "handler only \u2014 300 ms", state: "n-act" }]),
            ], TICKS, 0.3),
            note: "The second invocation reuses the same environment. Init does not run again, so the request costs 300 ms. <b>This is why globals are so valuable in Lambda</b> \u2014 an SDK client or DB connection created at module scope is shared by every subsequent invocation on that sandbox.",
        });
        f.push({
            stage: panesHTML([
                { title: "1 concurrent request", items: [{ text: "sandbox A", cls: "is-act" }] },
                { title: "3 concurrent", items: [{ text: "sandbox A (warm)", cls: "is-done" }, { text: "sandbox B (cold)", cls: "is-cmp" }, { text: "sandbox C (cold)", cls: "is-cmp" }] },
                { title: "Key rule", items: [{ text: "one sandbox = one request", cls: "is-act" }, { text: "concurrency = new sandboxes", cls: "is-act" }, { text: "so bursts = cold starts", cls: "is-out" }] },
            ]),
            note: "<b>The concurrency model in one line: a sandbox handles exactly one request at a time.</b> Ten simultaneous requests means ten environments, and nine of them are cold. Traffic spikes, not traffic volume, are what make cold starts visible.",
        });
        f.push({
            stage: panesHTML([
                { title: "Shrink the cold start", items: [{ text: "smaller package", cls: "is-done" }, { text: "lazy-import rare paths", cls: "is-done" }, { text: "more memory = more CPU", cls: "is-done" }, { text: "SnapStart (Java, .NET, Python)", cls: "is-done" }] },
                { title: "Remove it", items: [{ text: "provisioned concurrency", cls: "is-cmp" }, { text: "costs money while idle", cls: "is-out" }] },
                { title: "Do not bother", items: [{ text: "\u201cwarming\u201d pings", cls: "is-ghost" }, { text: "one ping warms one sandbox", cls: "is-ghost" }] },
            ]),
            note: "<b>The counter-intuitive lever is memory.</b> Lambda allocates CPU proportionally to memory, so raising 512 MB to 1024 MB can halve the duration \u2014 and cost you nothing, because you are billed for GB-seconds. Always measure before assuming the smallest setting is the cheapest.",
        });
        return f;
    },
};

/* ---- 11. DynamoDB partitions ---- */

VIZ["dynamodb-partition"] = {
    title: "Partition keys \u2014 why one bad key ruins a table",
    legend: [["lg-act", "receiving writes"], ["lg-cmp", "hot"], ["lg-out", "throttled"], ["lg-done", "balanced"]],
    build() {
        const p = (items, cls) => ({ title: `partition ${cls}`, items });
        const f = [];
        f.push({
            stage: dataGridHTML([
                ["PK (partition key)", "SK (sort key)", "attributes"],
                ["USER#42", "ORDER#2026-01-04", "total, status"],
                ["USER#42", "ORDER#2026-02-11", "total, status"],
                ["USER#77", "ORDER#2026-02-11", "total, status"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "1,0": "is-act", "2,0": "is-act" }),
            note: "A DynamoDB item is identified by a <b>partition key</b> and optionally a <b>sort key</b>. Everything about performance follows from those two choices, and unlike a relational schema you cannot fix a bad choice with an index later.",
        });
        f.push({
            stage: panesHTML([
                { title: "hash(PK)", items: [{ text: "USER#42 \u2192 0x3f\u2026", cls: "is-act" }, { text: "USER#77 \u2192 0xa1\u2026", cls: "is-act" }] },
                { title: "partition A", items: [{ text: "USER#42 items", cls: "is-done" }], empty: "\u2014" },
                { title: "partition B", items: [{ text: "USER#77 items", cls: "is-done" }], empty: "\u2014" },
            ]),
            note: "DynamoDB hashes the partition key and that hash picks a physical partition. <b>Items with the same PK live together, sorted by SK</b> \u2014 which is exactly why <code>Query</code> on a partition is fast and <code>Scan</code> across the table is not.",
        });
        f.push({
            stage: panesHTML([
                p([{ text: "USER#12", cls: "is-act" }, { text: "USER#31", cls: "is-act" }], "A"),
                p([{ text: "USER#42", cls: "is-act" }, { text: "USER#58", cls: "is-act" }], "B"),
                p([{ text: "USER#77", cls: "is-act" }, { text: "USER#91", cls: "is-act" }], "C"),
            ]),
            note: "With a high-cardinality key the load spreads evenly. Each partition serves up to <b>3,000 read units and 1,000 write units per second</b>, so more partitions means more throughput.",
        });
        f.push({
            stage: panesHTML([
                p([], "A"),
                { title: "partition B", items: [{ text: "DATE#2026-02-11", cls: "is-cmp" }, { text: "\u2026 every write today", cls: "is-cmp" }, { text: "1,000 WCU ceiling", cls: "is-out" }] },
                p([], "C"),
            ]),
            note: "<b>Now the classic mistake.</b> Someone picks today's date as the partition key because the query is \u201call of today's orders\u201d. Every write in the system lands on one partition, hits the per-partition ceiling, and returns <code>ProvisionedThroughputExceededException</code> \u2014 while the table as a whole is 95% idle.",
        });
        f.push({
            stage: panesHTML([
                { title: "partition A", items: [{ text: "DATE#2026-02-11#3", cls: "is-done" }] },
                { title: "partition B", items: [{ text: "DATE#2026-02-11#7", cls: "is-done" }] },
                { title: "partition C", items: [{ text: "DATE#2026-02-11#1", cls: "is-done" }] },
            ]),
            note: "<b>Write sharding</b> fixes it: append a suffix <code>0\u2013N</code> to the key so writes fan out, and read all N shards in parallel when you need the day. You have traded a simple read for a survivable write \u2014 which is the trade DynamoDB modelling always asks you to make.",
        });
        f.push({
            stage: panesHTML([
                { title: "Model around", items: [{ text: "your access patterns", cls: "is-done" }, { text: "written down first", cls: "is-done" }, { text: "then design the keys", cls: "is-done" }] },
                { title: "Not around", items: [{ text: "entities and relations", cls: "is-out" }, { text: "\u201cwe will query it later\u201d", cls: "is-out" }, { text: "normal forms", cls: "is-out" }] },
            ]),
            note: "<b>The whole discipline in one sentence:</b> in SQL you model the data and derive the queries; in DynamoDB you list the queries and derive the keys. If you cannot list your access patterns, you are not ready to create the table.",
        });
        return f;
    },
};

/* ---- 12. SQS visibility timeout ---- */

VIZ["sqs-visibility"] = {
    title: "A message through an SQS queue, including the failure",
    legend: [["lg-act", "in flight"], ["lg-done", "processed"], ["lg-out", "failed"], ["lg-idle", "waiting"]],
    build() {
        const draw = (q, flight, dlq, done, cap) =>
            panesHTML([
                { title: "queue", items: q, empty: "empty" },
                { title: "in flight (invisible)", items: flight, empty: "none" },
                { title: "consumer", items: done, empty: "idle" },
                { title: "dead-letter queue", items: dlq, empty: "empty" },
            ]) + `<div class="viz-caption">${cap}</div>`;
        const m = (t, cls) => ({ text: t, cls });
        const f = [];
        f.push({ stage: draw([m("msg-1", "is-act"), m("msg-2"), m("msg-3")], [], [], [], "visibility timeout 30s &middot; maxReceiveCount 3"), note: "Three messages waiting. SQS gives you <b>at-least-once</b> delivery and no ordering guarantee on a standard queue \u2014 both of those words will matter in a moment." });
        f.push({ stage: draw([m("msg-2"), m("msg-3")], [m("msg-1", "is-act")], [], [], "received &middot; receiveCount = 1 &middot; hidden for 30s"), note: "A consumer calls <code>ReceiveMessage</code>. The message is <b>not deleted</b> \u2014 it becomes invisible for the visibility timeout. Other consumers polling right now will not see it." });
        f.push({ stage: draw([m("msg-2"), m("msg-3")], [], [], [m("msg-1", "is-done")], "DeleteMessage &middot; gone for good"), note: "The consumer finishes and calls <code>DeleteMessage</code>. <b>Deleting is the acknowledgement.</b> Nothing is removed from an SQS queue by reading it." });
        f.push({ stage: draw([m("msg-3")], [m("msg-2", "is-out")], [], [], "consumer crashed at 12s"), note: "Now the failure. The consumer picks up <code>msg-2</code> and dies mid-work \u2014 an OOM kill, a deploy, a Lambda timeout. It never deletes the message." });
        f.push({ stage: draw([m("msg-2", "is-act"), m("msg-3")], [], [], [], "30s elapsed &middot; message reappears &middot; receiveCount = 2"), note: "The visibility timeout expires and the message returns to the queue. <b>Nothing was lost \u2014 but the work may have been half done.</b> This is precisely why consumers must be idempotent: write with a conditional put, key on the message ID, make a repeat harmless." });
        f.push({ stage: draw([m("msg-3")], [m("msg-2", "is-out")], [], [], "receiveCount = 3 &middot; poison message"), note: "It fails a third time. Some messages are simply un-processable \u2014 malformed JSON, a referenced row that no longer exists. Left alone, this one would cycle forever and block your metrics." });
        f.push({ stage: draw([m("msg-3", "is-act")], [], [m("msg-2", "is-out")], [], "moved to the DLQ after maxReceiveCount"), note: "The <b>redrive policy</b> moves it to a dead-letter queue after <code>maxReceiveCount</code> attempts. The queue keeps flowing, the bad message is preserved for inspection, and an alarm on <code>ApproximateNumberOfMessagesVisible</code> on the DLQ tells a human." });
        f.push({
            stage: panesHTML([
                { title: "Standard queue", items: [{ text: "at-least-once", cls: "is-act" }, { text: "best-effort order", cls: "is-act" }, { text: "nearly unlimited throughput", cls: "is-done" }] },
                { title: "FIFO queue", items: [{ text: "exactly-once processing", cls: "is-done" }, { text: "strict order per group", cls: "is-done" }, { text: "300\u20133,000 msg/s", cls: "is-out" }] },
                { title: "Set the timeout to", items: [{ text: "\u2265 6\u00d7 handler timeout", cls: "is-cmp" }, { text: "too short \u2192 duplicates", cls: "is-out" }, { text: "too long \u2192 slow retries", cls: "is-out" }] },
            ]),
            note: "<b>The setting people get wrong:</b> a visibility timeout shorter than the processing time guarantees duplicate work. If a Lambda consumes the queue, AWS recommends the queue timeout be at least six times the function timeout.",
        });
        return f;
    },
};

/* ---- 13. EventBridge fan-out ---- */

VIZ["eventbridge-fanout"] = {
    title: "One event, many independent consumers",
    legend: [["lg-act", "matched"], ["lg-done", "delivered"], ["lg-out", "no match"], ["lg-idle", "idle"]],
    build() {
        const W = 680;
        const H = 300;
        const TARGET = [
            { y: 40, label: "Lambda: send email", rule: "detail-type = OrderPlaced" },
            { y: 118, label: "Step Functions: fulfil", rule: "detail-type = OrderPlaced" },
            { y: 196, label: "Firehose \u2192 S3 lake", rule: "source = orders.*" },
            { y: 250, label: "Lambda: refund", rule: "detail-type = OrderRefunded" },
        ];
        const draw = (o) => {
            let s = boxHTML(16, 130, 110, 40, "order service", o.src || "n-idle");
            s += boxHTML(176, 110, 120, 80, "event bus", o.bus || "n-idle", "rules match on content");
            TARGET.forEach((t, i) => {
                const h = i === 3 ? 32 : 40;
                s += boxHTML(392, t.y, 200, h, t.label, (o.tg && o.tg[i]) || "n-idle", t.rule);
            });
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({}), note: "The order service is about to emit an event. <b>It does not know who is listening</b> \u2014 that is the entire point, and the reason event buses beat direct calls between services." });
        f.push({
            stage: codeHTML([
                "{",
                '  "source":      "orders.api",',
                '  "detail-type": "OrderPlaced",',
                '  "detail": { "orderId": "A-91", "total": 240, "tier": "gold" }',
                "}",
            ], { 1: "is-act", 2: "is-act" }),
            note: "An EventBridge event is JSON with an envelope. <code>source</code> and <code>detail-type</code> are the fields rules usually match on; <code>detail</code> is yours. Publishing is one <code>PutEvents</code> call and the service is done \u2014 it never waits for a consumer.",
        });
        f.push({
            stage: draw({ src: "n-act", bus: "n-act", arrows: [[126, 150, 172, 150, "e-act", "PutEvents"]] }),
            note: "The event lands on the bus. The publisher's job ends here, in single-digit milliseconds, whether there are zero consumers or fifty.",
        });
        f.push({
            stage: draw({ src: "n-done", bus: "n-act", tg: ["n-act", "n-act", "n-act", "n-out"], arrows: [[296, 140, 388, 60, "e-act"], [296, 148, 388, 138, "e-act"], [296, 158, 388, 216, "e-act"], [296, 168, 388, 266, "e-idle", "no match"]] }),
            note: "<b>Every rule is evaluated against every event, independently.</b> Three patterns match and one does not. The refund consumer is not skipped, not queued, not errored \u2014 it simply never learns the event happened.",
        });
        f.push({
            stage: draw({ src: "n-done", bus: "n-done", tg: ["n-done", "n-done", "n-done", "n-idle"], arrows: [[296, 140, 388, 60, "e-done"], [296, 148, 388, 138, "e-done"], [296, 158, 388, 216, "e-done"]] }),
            note: "Three deliveries, each retried independently with its own DLQ. If fulfilment is broken, email still goes out. <b>Compare that to the order service calling three APIs in a row, where the second failure strands you halfway.</b>",
        });
        f.push({
            stage: draw({ src: "n-done", bus: "n-done", tg: ["n-done", "n-done", "n-done", "n-act"], arrows: [[296, 168, 388, 266, "e-act", "add a rule \u2014 nothing else changes"]] }),
            note: "Adding a fifth consumer is a new rule. <b>No deployment of the order service, no code change, no coordination.</b> That decoupling is what you are buying, and it is worth more than the messaging itself.",
        });
        f.push({
            stage: dataGridHTML([
                ["", "SQS", "SNS", "EventBridge"],
                ["Shape", "one queue, one worker pool", "fan-out to subscribers", "fan-out with content rules"],
                ["Filtering", "none", "message attributes", "full JSON pattern matching"],
                ["Buffering", "yes, durable", "no", "no (target buffers)"],
                ["Latency", "ms", "ms", "~0.5s typical"],
                ["Reach for it", "smooth a spike, decouple work", "cheap high-volume fan-out", "route by event content, SaaS and AWS events"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "5,1": "is-done", "5,2": "is-act", "5,3": "is-cmp" }),
            note: "<b>The decision rule.</b> Do you need work to survive a slow consumer? SQS. Do you need one message copied to many places as cheaply as possible? SNS. Do you need to route on the <em>content</em> of the event, or consume AWS service events? EventBridge. The three compose \u2014 EventBridge target \u2192 SQS queue \u2192 Lambda is a very common shape.",
        });
        return f;
    },
};

/* ---- 14. CloudFront caching ---- */

VIZ["cloudfront-cache"] = {
    title: "A cache miss, a cache hit, and an invalidation",
    legend: [["lg-act", "this hop"], ["lg-done", "cached"], ["lg-out", "stale / purged"], ["lg-idle", "idle"]],
    build() {
        const W = 680;
        const H = 220;
        const draw = (o) => {
            let s = boxHTML(16, 84, 110, 44, "user in Delhi", o.user || "n-idle");
            s += boxHTML(210, 84, 150, 44, "edge \u2014 Mumbai", o.edge || "n-idle", o.edgeSub || "600+ points of presence");
            s += boxHTML(500, 84, 160, 44, "origin \u2014 S3 / ALB", o.origin || "n-idle", "us-east-1");
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            if (o.cap) s += capHTML(340, 196, o.cap);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({}), note: "The user is 12,000 km from the origin. Every round trip over that distance costs ~250 ms, and TLS needs several of them before a byte of content moves." });
        f.push({
            stage: draw({ user: "n-act", edge: "n-act", arrows: [[126, 100, 205, 100, "e-act", "GET /logo.png \u2014 ~8 ms"]] }),
            note: "DNS sends the user to the <b>nearest edge location</b>, not to the origin. The TLS handshake completes against a server a few milliseconds away \u2014 which is a real win even for content that is not cacheable at all.",
        });
        f.push({
            stage: draw({ user: "n-done", edge: "n-out", origin: "n-act", edgeSub: "MISS", arrows: [[360, 100, 495, 100, "e-act", "cache miss \u2192 fetch from origin"]] }),
            note: "<b>Cache miss.</b> The edge has never seen this object, so it fetches it over AWS's own backbone \u2014 already faster and more reliable than the public internet path the user would have taken.",
        });
        f.push({
            stage: draw({ user: "n-done", edge: "n-done", origin: "n-done", edgeSub: "stored, TTL 86400", arrows: [[495, 112, 360, 112, "e-done", "200 + Cache-Control: max-age=86400"], [205, 112, 126, 112, "e-done"]] }),
            note: "The object is stored at the edge and returned. <b>The origin's <code>Cache-Control</code> header decides how long</b> \u2014 CloudFront's own TTL settings are only a fallback for origins that send nothing.",
        });
        f.push({
            stage: draw({ user: "n-act", edge: "n-done", edgeSub: "HIT", arrows: [[126, 100, 205, 100, "e-act"], [205, 112, 126, 112, "e-done", "~8 ms, origin untouched"]] }),
            note: "The next user in the region gets a <b>hit</b>: 8 ms instead of 500 ms, and the origin never hears about the request. At a 95% hit ratio your origin fleet is doing a twentieth of the work.",
        });
        f.push({
            stage: draw({ edge: "n-out", origin: "n-act", edgeSub: "invalidation \u2014 /logo.png", arrows: [[495, 100, 360, 100, "e-act", "purge"]] }),
            note: "You deploy a new logo. An <b>invalidation</b> purges the path from every edge \u2014 but it takes minutes, costs money past the free tier, and is a manual step that will eventually be forgotten.",
        });
        f.push({
            stage: panesHTML([
                { title: "Invalidate", items: [{ text: "minutes to propagate", cls: "is-out" }, { text: "paid past 1,000 paths", cls: "is-out" }, { text: "easy to forget", cls: "is-out" }] },
                { title: "Versioned filenames", items: [{ text: "logo.a91f3c.png", cls: "is-done" }, { text: "new URL = guaranteed miss", cls: "is-done" }, { text: "max-age=31536000", cls: "is-done" }, { text: "instant, free, atomic", cls: "is-done" }] },
            ]),
            note: "<b>The professional answer to cache invalidation is to never invalidate.</b> Put a content hash in the filename, cache it for a year, and change the reference in the HTML \u2014 which is itself served with a short TTL. Every asset pipeline worth using does this for you.",
        });
        f.push({
            stage: dataGridHTML([
                ["Setting", "What it controls", "Get this wrong and\u2026"],
                ["Cache policy", "TTLs, which headers/query strings key the cache", "forwarding all headers \u2192 hit ratio near zero"],
                ["Origin request policy", "what is forwarded to the origin", "missing Host header \u2192 origin 404s"],
                ["OAC", "only CloudFront may read the bucket", "the S3 bucket is public"],
                ["Compression", "gzip/brotli at the edge", "you ship 4\u00d7 the bytes"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "1,2": "is-out", "3,2": "is-out" }),
            note: "<b>The single biggest CloudFront mistake is over-forwarding.</b> Every header, cookie or query string you include in the cache key multiplies the number of cached variants. Forward the minimum the origin genuinely needs and the hit ratio takes care of itself.",
        });
        return f;
    },
};

/* ---- 15. Route 53 routing policies ---- */

VIZ["route53-routing"] = {
    title: "Route 53 answering the same question four ways",
    legend: [["lg-act", "answer given"], ["lg-done", "healthy"], ["lg-out", "unhealthy"], ["lg-idle", "candidate"]],
    options: [
        { value: "simple", label: "Simple and weighted routing" },
        { value: "latency", label: "Latency-based routing" },
        { value: "failover", label: "Failover routing" },
        { value: "geo", label: "Geolocation routing" },
    ],
    build(option = "simple") {
        const W = 660;
        const H = 250;
        const draw = (o) => {
            let s = boxHTML(16, 96, 110, 44, o.client || "user", o.clientState || "n-idle");
            s += boxHTML(196, 96, 150, 44, "Route 53", o.dns || "n-idle", "app.example.com");
            (o.ends || []).forEach((e, i) => {
                s += boxHTML(456, 30 + i * 70, 180, 40, e.label, e.state || "n-idle", e.sub || "");
            });
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            return svgHTML(W, H, s);
        };
        const f = [];
        if (option === "simple") {
            const ends = [{ label: "v1 fleet", sub: "weight 90" }, { label: "v2 fleet", sub: "weight 10" }];
            f.push({ stage: draw({ ends }), note: "<b>Simple routing</b> is one record, one answer \u2014 the DNS you already know. It cannot react to anything: if the target is down, Route 53 keeps handing out its address." });
            f.push({ stage: draw({ ends, clientState: "n-act", dns: "n-act", arrows: [[126, 118, 192, 118, "e-act", "A? app.example.com"]] }), note: "<b>Weighted routing</b> is the first policy that does something interesting. Two records share a name and each carries a weight." });
            f.push({ stage: draw({ ends: [{ ...ends[0], state: "n-act" }, ends[1]], dns: "n-done", arrows: [[346, 110, 452, 60, "e-act", "90% of answers"]] }), note: "Nine times out of ten the answer is the v1 fleet. Weights are relative, not percentages \u2014 <code>90</code> and <code>10</code> behave the same as <code>9</code> and <code>1</code>." });
            f.push({ stage: draw({ ends: [ends[0], { ...ends[1], state: "n-act" }], dns: "n-done", arrows: [[346, 126, 452, 130, "e-act", "10% \u2014 the canary"]] }), note: "The tenth gets v2. <b>This is a canary release built out of DNS</b> \u2014 shift the weight to 50/50, then to 0/100, and roll back by editing a number." });
            f.push({
                stage: panesHTML([
                    { title: "Why DNS canaries are coarse", items: [{ text: "resolvers cache for the TTL", cls: "is-out" }, { text: "rollback is not instant", cls: "is-out" }, { text: "no per-request control", cls: "is-out" }] },
                    { title: "Use instead when you can", items: [{ text: "ALB weighted target groups", cls: "is-done" }, { text: "CodeDeploy canary", cls: "is-done" }, { text: "keep TTL 60s for DNS shifts", cls: "is-act" }] },
                ]),
                note: "<b>The gotcha.</b> A resolver that cached your record for an hour will keep sending users to the old fleet for an hour. Lower the TTL <em>before</em> you plan to move traffic, not when you start.",
            });
            return f;
        }
        if (option === "latency") {
            const ends = [{ label: "eu-west-1", sub: "42 ms" }, { label: "us-east-1", sub: "118 ms" }, { label: "ap-south-1", sub: "160 ms" }];
            f.push({ stage: draw({ client: "user in Paris", ends }), note: "Three Regions run the same stack. The question <b>latency-based routing</b> answers is not \u201cwhich is nearest on a map\u201d but \u201cwhich has historically been fastest from this resolver's network\u201d." });
            f.push({ stage: draw({ client: "user in Paris", clientState: "n-act", dns: "n-act", ends, arrows: [[126, 118, 192, 118, "e-act", "A?"]] }), note: "Route 53 looks up the resolver's location in AWS's own measured latency dataset \u2014 real network measurements, continuously updated, not a geographic guess." });
            f.push({ stage: draw({ client: "user in Paris", dns: "n-done", ends: [{ ...ends[0], state: "n-act" }, ends[1], ends[2]], arrows: [[346, 110, 452, 60, "e-act", "42 ms \u2014 wins"]] }), note: "Paris is routed to <code>eu-west-1</code>. A user in Sydney asking the same name gets a different answer a millisecond later, from the same record set." });
            f.push({ stage: draw({ client: "user in Paris", dns: "n-done", ends: [{ ...ends[0], state: "n-out", sub: "health check failing" }, { ...ends[1], state: "n-act" }, ends[2]], arrows: [[346, 118, 452, 130, "e-act", "next-best latency"]] }), note: "<b>Attach health checks or the policy is a liability.</b> With them, a failing Region drops out and traffic moves to the next-best latency automatically \u2014 which is multi-Region failover for the price of some DNS records." });
            f.push({
                stage: panesHTML([
                    { title: "Latency-based", items: [{ text: "measured network latency", cls: "is-done" }, { text: "changes as the internet does", cls: "is-done" }, { text: "best for performance", cls: "is-done" }] },
                    { title: "Geolocation", items: [{ text: "based on user location", cls: "is-act" }, { text: "fixed rules", cls: "is-act" }, { text: "best for compliance", cls: "is-act" }] },
                    { title: "Geoproximity", items: [{ text: "location + a bias dial", cls: "is-cmp" }, { text: "shift load between Regions", cls: "is-cmp" }] },
                ]),
                note: "<b>Do not confuse latency with geography.</b> Latency-based optimises speed and will happily route across a border; geolocation enforces where a user's traffic must go, which is what you want when the requirement is legal rather than technical.",
            });
            return f;
        }
        if (option === "failover") {
            const ends = [{ label: "primary \u2014 us-east-1", sub: "health check /healthz" }, { label: "secondary \u2014 static S3 site", sub: "always up" }];
            f.push({ stage: draw({ ends: [{ ...ends[0], state: "n-done" }, ends[1]] }), note: "<b>Failover routing</b> is two records: primary and secondary. Route 53 hands out the primary as long as its health check passes." });
            f.push({ stage: draw({ clientState: "n-act", dns: "n-act", ends: [{ ...ends[0], state: "n-done" }, ends[1]], arrows: [[126, 118, 192, 118, "e-act"], [346, 110, 452, 60, "e-act", "primary"]] }), note: "Health checkers in multiple Regions probe the endpoint every 30 seconds. <b>They must be able to reach it from the public internet</b> \u2014 a health check pointed at a private endpoint fails permanently, which surprises people once." });
            f.push({ stage: draw({ dns: "n-act", ends: [{ ...ends[0], state: "n-out", sub: "3 consecutive failures" }, { ...ends[1], state: "n-done" }] }), note: "Three failures and the primary is marked unhealthy. Notice the timing: 3 \u00d7 30 s of checking, plus the record's TTL of cached answers still in the wild." },);
            f.push({ stage: draw({ clientState: "n-act", dns: "n-done", ends: [{ ...ends[0], state: "n-out" }, { ...ends[1], state: "n-act" }], arrows: [[126, 118, 192, 118, "e-act"], [346, 126, 452, 130, "e-act", "secondary"]] }), note: "New lookups get the secondary \u2014 here a static S3 site saying \u201cwe are working on it\u201d, which is infinitely better than a connection timeout and costs almost nothing to keep." });
            f.push({
                stage: dataGridHTML([
                    ["Knob", "Typical", "Effect on failover time"],
                    ["Health check interval", "30 s (or 10 s, fast)", "the floor on detection"],
                    ["Failure threshold", "3", "\u00d7 interval = detection time"],
                    ["Record TTL", "60 s", "cached answers keep going to the dead endpoint"],
                    ["Total", "\u2014", "\u2248 90\u2013150 s realistically"],
                ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "4,2": "is-act" }),
                note: "<b>DNS failover is measured in minutes, not seconds.</b> If your RTO is tighter than that, you need a load balancer or a global accelerator making the decision in the data path, not a resolver making it in the control plane.",
            });
            return f;
        }
        const ends = [{ label: "eu-central-1", sub: "EU users \u2014 GDPR" }, { label: "us-east-1", sub: "everyone else" }, { label: "ap-south-1", sub: "IN users" }];
        f.push({ stage: draw({ client: "user in Munich", ends }), note: "<b>Geolocation routing</b> answers according to where the user is, full stop \u2014 continent, country, or US state. It is a compliance tool first and a performance tool second." });
        f.push({ stage: draw({ client: "user in Munich", clientState: "n-act", dns: "n-act", ends, arrows: [[126, 118, 192, 118, "e-act", "A?"]] }), note: "Route 53 maps the resolver's IP to a location. That is a guess about the <em>resolver</em>, not the user \u2014 which is why a corporate VPN or a public DNS service can land someone in the wrong bucket." });
        f.push({ stage: draw({ client: "user in Munich", dns: "n-done", ends: [{ ...ends[0], state: "n-act" }, ends[1], ends[2]], arrows: [[346, 110, 452, 60, "e-act", "EU \u2192 Frankfurt"]] }), note: "Germany matches the EU record, so the data stays in <code>eu-central-1</code>. Records can be as specific as a country and as broad as a continent, with the most specific match winning." });
        f.push({ stage: draw({ client: "user in Chile", clientState: "n-act", dns: "n-done", ends: [ends[0], { ...ends[1], state: "n-act" }, ends[2]], arrows: [[126, 118, 192, 118, "e-act"], [346, 118, 452, 130, "e-act", "default record"]] }), note: "<b>Always create a default record.</b> A location with no matching record gets <code>NXDOMAIN</code> \u2014 not a fallback, not an error page, just a name that does not resolve for an entire country." });
        return f;
    },
};

/* ---- 16. KMS envelope encryption ---- */

VIZ["kms-envelope"] = {
    title: "Envelope encryption \u2014 how KMS encrypts a 5 GB file",
    legend: [["lg-act", "this step"], ["lg-done", "complete"], ["lg-out", "discarded"], ["lg-idle", "waiting"]],
    build() {
        const W = 660;
        const H = 260;
        const draw = (o) => {
            let s = boxHTML(20, 100, 130, 44, "your app", o.app || "n-idle");
            s += boxHTML(250, 30, 160, 44, "KMS", o.kms || "n-idle", "holds the KMS key (CMK)");
            s += boxHTML(250, 150, 160, 44, o.dekLabel || "data key", o.dek || "n-idle", o.dekSub || "");
            s += boxHTML(490, 100, 150, 44, "S3 object", o.s3 || "n-idle", o.s3Sub || "");
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({ app: "n-act" }), note: "You have a 5 GB file to encrypt. The obvious idea \u2014 send it to KMS \u2014 is impossible: KMS only accepts payloads up to 4 KB, and you would not want 5 GB crossing the wire twice anyway." });
        f.push({ stage: draw({ app: "n-act", kms: "n-act", arrows: [[150, 110, 246, 60, "e-act", "GenerateDataKey"]] }), note: "Instead you ask KMS for a <b>data key</b>. The KMS key itself never leaves the service \u2014 it is generated inside a hardware security module and cannot be exported by anyone, including AWS." });
        f.push({ stage: draw({ app: "n-done", kms: "n-done", dek: "n-act", dekLabel: "plaintext key + encrypted key", dekSub: "two copies of the same key", arrows: [[300, 78, 300, 146, "e-done"]] }), note: "KMS returns <b>two things</b>: the data key in plaintext, and the same data key encrypted under the KMS key. This pair is the whole idea of envelope encryption." });
        f.push({ stage: draw({ app: "n-act", dek: "n-act", s3: "n-act", s3Sub: "AES-256-GCM, done locally", arrows: [[410, 172, 490, 130, "e-act", "encrypt the 5 GB locally"]] }), note: "Your process encrypts the file locally with the plaintext key \u2014 fast, no network, no size limit. KMS was involved for one small round trip and nothing more." });
        f.push({ stage: draw({ app: "n-done", dek: "n-out", dekLabel: "plaintext key wiped", s3: "n-done", s3Sub: "ciphertext + wrapped key", arrows: [[410, 160, 490, 118, "e-done", "store encrypted key with the object"]] }), note: "<b>Now throw the plaintext key away.</b> What remains on disk is the ciphertext plus the encrypted data key sitting next to it. Anyone who steals the bucket gets both, and neither is useful without KMS." });
        f.push({ stage: draw({ app: "n-act", kms: "n-act", s3: "n-done", arrows: [[490, 110, 415, 60, "e-act", "Decrypt(encrypted key)"], [246, 70, 155, 105, "e-done", "plaintext key, if IAM allows"]] }), note: "To read it back you send only the <em>encrypted key</em> to KMS. It checks the key policy and your IAM permissions, returns the plaintext key, and you decrypt locally. <b>Every one of those calls is logged in CloudTrail</b> \u2014 which turns \u201cwho read that data\u201d into a query." });
        f.push({
            stage: panesHTML([
                { title: "AWS managed key", items: [{ text: "aws/s3, aws/rds", cls: "is-act" }, { text: "free", cls: "is-done" }, { text: "no key policy control", cls: "is-out" }, { text: "cannot share cross-account", cls: "is-out" }] },
                { title: "Customer managed key", items: [{ text: "$1/month + per-request", cls: "is-act" }, { text: "your key policy", cls: "is-done" }, { text: "rotation, grants, aliases", cls: "is-done" }, { text: "can be disabled/deleted", cls: "is-done" }] },
            ]),
            note: "<b>When it matters, use a customer managed key.</b> The ability to write a key policy \u2014 and to disable the key, instantly revoking access to every object it protects \u2014 is the reason. That kill switch does not exist with an AWS managed key.",
        });
        return f;
    },
};

/* ---- 17. CloudFormation deployment ---- */

VIZ["cfn-deploy"] = {
    title: "A CloudFormation stack update, including the rollback",
    legend: [["lg-act", "in progress"], ["lg-done", "complete"], ["lg-out", "failed / rolled back"], ["lg-idle", "pending"]],
    build() {
        const RES = [
            { label: "VPC", y: 40 },
            { label: "Security group", y: 92 },
            { label: "RDS instance", y: 144 },
            { label: "ECS service", y: 196 },
        ];
        const draw = (states, banner, bannerState) => {
            let s = boxHTML(160, 6, 320, 26, banner, bannerState || "n-idle");
            RES.forEach((r, i) => {
                s += boxHTML(180, r.y, 200, 38, r.label, states[i] || "n-idle");
                if (states[i]) s += capHTML(392, r.y + 24, ({ "n-act": "CREATE_IN_PROGRESS", "n-done": "CREATE_COMPLETE", "n-out": "DELETE_COMPLETE (rollback)", "n-cmp": "UPDATE_IN_PROGRESS" }[states[i]]) || "", "start");
            });
            return svgHTML(660, 250, s);
        };
        const f = [];
        f.push({
            stage: codeHTML([
                "Resources:",
                "  Db:",
                "    Type: AWS::RDS::DBInstance",
                "    Properties:",
                "      DBInstanceClass: db.t3.medium",
                "      AllocatedStorage: 20",
            ], { 4: "is-act" }),
            note: "A template is a <b>declaration of the desired state</b>, not a script. You never say \u201ccreate\u201d or \u201cupdate\u201d; you describe what should exist and CloudFormation computes the difference.",
        });
        f.push({
            stage: draw([], "CHANGE SET \u2014 2 add, 1 modify, 0 delete", "n-act"),
            note: "<b>Always generate a change set first.</b> It lists exactly what will be added, modified and destroyed \u2014 and, crucially, whether a modification requires <em>replacement</em>. That word is the difference between a rename and losing a database.",
        });
        f.push({ stage: draw(["n-act"], "UPDATE_IN_PROGRESS", "n-act"), note: "Execution begins. CloudFormation walks the dependency graph it inferred from your <code>Ref</code> and <code>GetAtt</code> references, creating independent resources in parallel." });
        f.push({ stage: draw(["n-done", "n-act"], "UPDATE_IN_PROGRESS", "n-act"), note: "The security group depends on the VPC, so it waits. You almost never need <code>DependsOn</code> \u2014 referencing a resource is what creates the edge." });
        f.push({ stage: draw(["n-done", "n-done", "n-act"], "UPDATE_IN_PROGRESS", "n-act"), note: "The RDS instance starts. This one takes ten minutes, and the stack simply waits \u2014 CloudFormation is patient in a way that a shell script full of <code>sleep</code> is not." });
        f.push({ stage: draw(["n-done", "n-done", "n-done", "n-out"], "UPDATE_FAILED \u2014 ECS: no capacity", "n-out"), note: "<b>The ECS service fails.</b> A bad image tag, a missing subnet, an exhausted quota \u2014 it does not matter which. What matters is what happens next." });
        f.push({ stage: draw(["n-out", "n-out", "n-out", "n-out"], "ROLLBACK_IN_PROGRESS", "n-out"), note: "CloudFormation <b>automatically rolls back the whole stack</b> to its previous state. This is the property that makes it worth the YAML: a partial failure does not leave you with half an environment and no record of what got created." });
        f.push({ stage: draw(["n-done", "n-done", "n-done"], "UPDATE_ROLLBACK_COMPLETE \u2014 back to the last good state", "n-done"), note: "You are back where you started, exactly. Fix the tag, run the change set again. <b>The stack, not your memory, is the source of truth about what exists.</b>" });
        f.push({
            stage: panesHTML([
                { title: "Deletion policies worth setting", items: [{ text: "Retain on databases", cls: "is-done" }, { text: "Snapshot on RDS", cls: "is-done" }, { text: "Retain on S3 buckets", cls: "is-done" }] },
                { title: "Failure modes to know", items: [{ text: "drift: someone edited by hand", cls: "is-out" }, { text: "UPDATE_ROLLBACK_FAILED", cls: "is-out" }, { text: "replacement on a property change", cls: "is-out" }] },
                { title: "Layer your stacks", items: [{ text: "network (rarely changes)", cls: "is-act" }, { text: "data (rarely changes)", cls: "is-act" }, { text: "app (changes hourly)", cls: "is-act" }] },
            ]),
            note: "<b>The habit that prevents the worst day:</b> split stacks by rate of change and put a <code>DeletionPolicy: Retain</code> on anything holding data. A stack that can delete your production database on a failed deploy is a loaded gun, however good the rollback is.",
        });
        return f;
    },
};

/* ---- 18. RDS Multi-AZ failover ---- */

VIZ["rds-failover"] = {
    title: "Multi-AZ failover, and why it is not a read replica",
    legend: [["lg-act", "serving"], ["lg-done", "healthy"], ["lg-out", "failed"], ["lg-idle", "standby"]],
    build() {
        const W = 660;
        const H = 250;
        const draw = (o) => {
            let s = boxHTML(20, 96, 120, 44, "app", o.app || "n-idle");
            s += boxHTML(200, 96, 140, 30, "db.example \u2192", o.dns || "n-idle", "the CNAME endpoint");
            s += boxHTML(430, 30, 180, 46, "primary \u2014 AZ a", o.pri || "n-idle", o.priSub || "");
            s += boxHTML(430, 150, 180, 46, "standby \u2014 AZ b", o.std || "n-idle", o.stdSub || "");
            (o.arrows || []).forEach((a) => s += arrowHTML(a[0], a[1], a[2], a[3], a[4], a[5] || ""));
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({ stage: draw({ app: "n-act", dns: "n-done", pri: "n-act", std: "n-idle", stdSub: "accepts no connections", arrows: [[140, 118, 196, 118, "e-act"], [340, 108, 426, 60, "e-act", "reads + writes"]] }), note: "Multi-AZ gives you two instances, and only one of them does anything. <b>The standby serves no traffic at all</b> \u2014 it is insurance, not capacity, and this is the single most misunderstood thing about it." });
        f.push({ stage: draw({ app: "n-done", dns: "n-done", pri: "n-act", std: "n-done", stdSub: "synchronous replication", arrows: [[430, 76, 430, 146, "e-done", "every commit, both disks"]] }), note: "Replication is <b>synchronous</b>: a commit is not acknowledged until it is durable in both AZs. That costs you some write latency and buys you a zero-data-loss guarantee." });
        f.push({ stage: draw({ app: "n-out", dns: "n-act", pri: "n-out", priSub: "AZ a fails", std: "n-done", arrows: [[140, 118, 196, 118, "e-idle", "connections error"]] }), note: "The AZ fails. In-flight connections drop and your application starts throwing errors \u2014 <b>failover is not invisible</b>, and the app must reconnect and retry." });
        f.push({ stage: draw({ dns: "n-act", pri: "n-out", std: "n-act", stdSub: "promoted", arrows: [[340, 128, 426, 168, "e-act", "CNAME repointed"]] }), note: "RDS promotes the standby and repoints the DNS endpoint at it. <b>Your connection string never changes</b>, which is why you should always connect via the endpoint name and never cache the resolved IP." });
        f.push({ stage: draw({ app: "n-act", dns: "n-done", std: "n-act", stdSub: "now the primary", pri: "n-idle", priSub: "rebuilt as the new standby", arrows: [[140, 118, 196, 118, "e-act"], [340, 128, 426, 168, "e-done", "60\u2013120 s later, healthy"]] }), note: "Sixty to a hundred and twenty seconds, and you are running again in the other AZ. AWS rebuilds a fresh standby behind the scenes." });
        f.push({
            stage: dataGridHTML([
                ["", "Multi-AZ standby", "Read replica"],
                ["Serves traffic", "no", "yes, reads only"],
                ["Replication", "synchronous", "asynchronous"],
                ["Solves", "availability", "read scaling"],
                ["Failover", "automatic", "manual promotion"],
                ["Data loss on failover", "none", "possible (replica lag)"],
                ["Cross-Region", "no (Multi-AZ cluster: 3 AZs)", "yes"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "3,1": "is-done", "3,2": "is-act", "5,2": "is-out" }),
            note: "<b>They solve different problems and you often need both.</b> Multi-AZ keeps you up when a datacentre fails; read replicas keep you fast when reads outgrow one instance. Neither one is a backup \u2014 a <code>DELETE</code> with no <code>WHERE</code> replicates perfectly to all of them.",
        });
        return f;
    },
};

/* ---- 19. Retries and backoff ---- */

VIZ["retry-backoff"] = {
    title: "Retrying a throttled call \u2014 three strategies",
    legend: [["lg-out", "throttled"], ["lg-act", "retry attempt"], ["lg-done", "succeeded"], ["lg-idle", "waiting"]],
    options: [
        { value: "immediate", label: "Retrying immediately" },
        { value: "exponential", label: "Exponential backoff" },
        { value: "jitter", label: "Exponential backoff with jitter" },
    ],
    build(option = "immediate") {
        const TICKS = [{ at: 0, label: "0s" }, { at: 0.25, label: "1" }, { at: 0.5, label: "2" }, { at: 0.75, label: "3" }, { at: 1, label: "4" }];
        const lanes = (rows) => rows.map((r) => ({ label: r.label, marks: r.marks }));
        const f = [];
        if (option === "immediate") {
            f.push({ stage: timelineHTML(660, lanes([{ label: "client A", marks: [{ at: 0, label: "call", state: "n-act" }] }]), TICKS, 0), note: "A client calls a throttled API and gets <code>ThrottlingException</code>. The obvious reaction \u2014 try again right now \u2014 is the wrong one." });
            f.push({ stage: timelineHTML(660, lanes([{ label: "client A", marks: [0, 0.05, 0.1, 0.15, 0.2].map((at) => ({ at, label: "", state: "n-out" })) }]), TICKS, 0.2), note: "Five attempts in 200 ms, five throttles. <b>You have multiplied your load on a service that just told you it is overloaded.</b>" });
            f.push({
                stage: timelineHTML(660, lanes([
                    { label: "client A", marks: [0, 0.05, 0.1, 0.15, 0.2].map((at) => ({ at, label: "", state: "n-out" })) },
                    { label: "client B", marks: [0, 0.05, 0.1, 0.15, 0.2].map((at) => ({ at, label: "", state: "n-out" })) },
                    { label: "client C", marks: [0, 0.05, 0.1, 0.15, 0.2].map((at) => ({ at, label: "", state: "n-out" })) },
                ]), TICKS, 0.2),
                note: "<b>A retry storm.</b> Every client does the same thing at the same time, so the service never gets the quiet moment it needs to recover. This is how a brief blip becomes a sustained outage \u2014 the retries <em>are</em> the outage.",
            });
            return f;
        }
        if (option === "exponential") {
            f.push({ stage: timelineHTML(660, lanes([{ label: "client A", marks: [{ at: 0, label: "", state: "n-out" }] }]), TICKS, 0), note: "Same first failure. This time the client waits before trying again." });
            f.push({ stage: timelineHTML(660, lanes([{ label: "client A", marks: [{ at: 0, state: "n-out" }, { at: 0.05, label: "1", state: "n-out" }, { at: 0.15, label: "2", state: "n-out" }] }]), TICKS, 0.15), note: "The delay <b>doubles</b> each time: 200 ms, 400 ms, 800 ms, 1.6 s. Load falls off exponentially, giving the service room to drain its queue." });
            f.push({ stage: timelineHTML(660, lanes([{ label: "client A", marks: [{ at: 0, state: "n-out" }, { at: 0.05, state: "n-out" }, { at: 0.15, state: "n-out" }, { at: 0.35, label: "\u2713", state: "n-done" }] }]), TICKS, 0.35), note: "The fourth attempt succeeds. <b>Always cap the delay and cap the attempt count</b> \u2014 unbounded doubling turns a transient error into a request that hangs for an hour." });
            f.push({
                stage: timelineHTML(660, lanes([
                    { label: "client A", marks: [{ at: 0, state: "n-out" }, { at: 0.05, state: "n-out" }, { at: 0.15, state: "n-out" }, { at: 0.35, state: "n-out" }] },
                    { label: "client B", marks: [{ at: 0, state: "n-out" }, { at: 0.05, state: "n-out" }, { at: 0.15, state: "n-out" }, { at: 0.35, state: "n-out" }] },
                    { label: "client C", marks: [{ at: 0, state: "n-out" }, { at: 0.05, state: "n-out" }, { at: 0.15, state: "n-out" }, { at: 0.35, state: "n-out" }] },
                ]), TICKS, 0.35),
                note: "<b>But look at what three clients do.</b> They all failed at the same instant, so they all back off by the same amount and retry <em>in perfect lockstep</em>. The total load is lower, but it still arrives in synchronised spikes.",
            });
            return f;
        }
        f.push({
            stage: timelineHTML(660, lanes([
                { label: "client A", marks: [{ at: 0, state: "n-out" }, { at: 0.09, state: "n-act" }, { at: 0.31, state: "n-act" }] },
                { label: "client B", marks: [{ at: 0, state: "n-out" }, { at: 0.03, state: "n-act" }, { at: 0.22, state: "n-act" }] },
                { label: "client C", marks: [{ at: 0, state: "n-out" }, { at: 0.14, state: "n-act" }, { at: 0.4, state: "n-act" }] },
            ]), TICKS, 0.4),
            note: "<b>Jitter</b> means picking the delay at random from <code>[0, cap]</code> rather than using the cap itself. The same three clients now spread their retries across the window instead of colliding.",
        });
        f.push({
            stage: codeHTML([
                "delay = random(0, min(MAX, base * 2 ** attempt))",
                "",
                "# full jitter - the AWS Architecture Blog's recommendation",
                "# and what every AWS SDK does for you by default",
            ], { 0: "is-done" }),
            note: "That one line is the entire technique. <b>Every AWS SDK already implements it</b> \u2014 <code>retry_mode=\"adaptive\"</code> in boto3, the standard retry strategy in the JavaScript SDK. The reason to know it is so you write it correctly in the code that calls <em>your own</em> services.",
        });
        f.push({
            stage: panesHTML([
                { title: "Retry these", items: [{ text: "429 Throttling", cls: "is-done" }, { text: "500, 502, 503, 504", cls: "is-done" }, { text: "connection reset, timeout", cls: "is-done" }] },
                { title: "Never retry these", items: [{ text: "400 malformed request", cls: "is-out" }, { text: "403 AccessDenied", cls: "is-out" }, { text: "404 not found", cls: "is-out" }, { text: "409 conditional check failed", cls: "is-out" }] },
                { title: "Add on top", items: [{ text: "a circuit breaker", cls: "is-act" }, { text: "a total time budget", cls: "is-act" }, { text: "idempotency keys", cls: "is-act" }] },
            ]),
            note: "<b>The judgement call is which errors deserve a retry.</b> Retrying a <code>403</code> will never succeed and just burns your budget; retrying a <code>500</code> usually will. Get this wrong in the generous direction and you have built a denial-of-service tool aimed at yourself.",
        });
        return f;
    },
};

/* ---- 20. Purchase options ---- */

VIZ["pricing-models"] = {
    title: "The same workload bought four different ways",
    legend: [["lg-out", "most expensive"], ["lg-act", "committed"], ["lg-done", "cheapest"], ["lg-idle", "unused"]],
    build() {
        const f = [];
        f.push({
            stage: barsHTML([100, 100, 100, 100, 100, 100], { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp", 4: "is-cmp", 5: "is-cmp" }) +
                `<div class="viz-caption">On-Demand &middot; $100/mo baseline &middot; pay per second, walk away any time</div>`,
            note: "<b>On-Demand</b> is the list price. No commitment, no planning, billed per second. It is the right choice for anything you cannot predict \u2014 and the wrong choice for the steady baseline every real system has.",
        });
        f.push({
            stage: barsHTML([100, 100, 100, 100, 100, 100], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-cmp", 4: "is-cmp", 5: "is-cmp" }) +
                `<div class="viz-caption">Savings Plan &middot; commit $60/mo for 1 year &rarr; ~$72 effective &middot; 28% off</div>`,
            note: "A <b>Compute Savings Plan</b> is a commitment to spend $X per hour for one or three years, in exchange for a discount of up to 66%. It applies automatically across EC2, Fargate and Lambda, in any Region, any instance family \u2014 which makes it far more forgiving than the Reserved Instances it replaced.",
        });
        f.push({
            stage: barsHTML([100, 100, 100, 30, 28, 31], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-act", 4: "is-act", 5: "is-act" }) +
                `<div class="viz-caption">Spot for the burst &middot; up to 90% off &middot; 2-minute interruption notice</div>`,
            note: "<b>Spot</b> sells you spare capacity at up to a 90% discount, and takes it back with two minutes of warning. For anything that can be interrupted \u2014 batch jobs, CI runners, stateless web tiers behind a load balancer, EMR \u2014 this is free money.",
        });
        f.push({
            stage: barsHTML([100, 100, 100, 30, 28, 0], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-act", 4: "is-act", 5: "is-out" }) +
                `<div class="viz-caption">Turn it off &middot; the only 100% discount there is</div>`,
            note: "And the option people forget: <b>switch it off</b>. Dev environments that sleep at night and at weekends cost 70% less, and no purchase option comes close to that.",
        });
        f.push({
            stage: dataGridHTML([
                ["Option", "Discount", "Commitment", "Use for"],
                ["On-Demand", "0%", "none", "spiky, unknown, short-lived"],
                ["Savings Plan", "up to 66%", "1 or 3 years of $/hour", "the steady baseline"],
                ["Reserved Instance", "up to 72%", "1 or 3 years, specific family", "RDS, ElastiCache, Redshift"],
                ["Spot", "up to 90%", "none, interruptible", "batch, CI, stateless fleets"],
                ["Graviton", "~20% + better perf/$", "just change the AMI", "almost everything"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "2,1": "is-done", "4,1": "is-done", "5,1": "is-act" }),
            note: "<b>The shape of a well-bought bill:</b> Savings Plans covering the flat baseline, Spot absorbing the variable peak, On-Demand for the small unpredictable remainder \u2014 and Graviton underneath all of it, because an ARM instance is cheaper and faster for most workloads and the migration is usually one line of a Dockerfile.",
        });
        f.push({
            stage: panesHTML([
                { title: "Where the surprise bills come from", items: [{ text: "NAT Gateway data processing", cls: "is-out" }, { text: "cross-AZ traffic, $0.01/GB each way", cls: "is-out" }, { text: "data transfer out to the internet", cls: "is-out" }, { text: "unattached EBS volumes and EIPs", cls: "is-out" }, { text: "CloudWatch Logs ingestion", cls: "is-out" }] },
                { title: "Free or nearly free", items: [{ text: "data in", cls: "is-done" }, { text: "same-AZ traffic by private IP", cls: "is-done" }, { text: "S3/DynamoDB gateway endpoints", cls: "is-done" }, { text: "CloudFront \u2192 internet (cheaper)", cls: "is-done" }] },
            ]),
            note: "<b>Compute is the number people optimise; data transfer is the number that surprises them.</b> Before tuning instance sizes, open Cost Explorer grouped by <em>usage type</em> and look for <code>DataTransfer</code> and <code>NatGateway-Bytes</code>. That is where the unexplained thousand dollars usually lives.",
        });
        return f;
    },
};

/* ---- 21. Container rolling deployment ---- */

VIZ["ecs-deploy"] = {
    title: "A rolling deployment on ECS Fargate",
    legend: [["lg-act", "starting"], ["lg-done", "healthy, in service"], ["lg-out", "draining"], ["lg-idle", "slot"]],
    build() {
        const draw = (old, neu, cap) =>
            panesHTML([
                { title: "task definition v1", items: old, empty: "none" },
                { title: "task definition v2", items: neu, empty: "none" },
            ]) + `<div class="viz-caption">${cap}</div>`;
        const t = (n, v, cls) => ({ text: `task-${v}-${n}`, cls });
        const f = [];
        f.push({ stage: draw([t(1, "v1", "is-done"), t(2, "v1", "is-done"), t(3, "v1", "is-done")], [], "desired 3 &middot; min healthy 100% &middot; max 200%"), note: "Three tasks running revision 1 behind a load balancer. A <b>task definition</b> is an immutable revision: image, CPU, memory, environment, role. Deploying means pointing the service at a new revision number." });
        f.push({ stage: draw([t(1, "v1", "is-done"), t(2, "v1", "is-done"), t(3, "v1", "is-done")], [t(1, "v2", "is-act")], "v2 task starting \u2014 pulling image"), note: "You register revision 2 and update the service. Because <em>minimum healthy percent</em> is 100%, ECS must add before it removes \u2014 it starts a v2 task while all three v1 tasks keep serving." });
        f.push({ stage: draw([t(1, "v1", "is-done"), t(2, "v1", "is-done"), t(3, "v1", "is-done")], [t(1, "v2", "is-done")], "v2 passed the ALB health check \u2192 in service"), note: "<b>The health check is the gate.</b> Until the ALB target group reports the new task healthy, it receives no traffic and the deployment does not advance. A wrong health-check path here means a deploy that hangs and rolls back." });
        f.push({ stage: draw([t(1, "v1", "is-out"), t(2, "v1", "is-done"), t(3, "v1", "is-done")], [t(1, "v2", "is-done"), t(2, "v2", "is-act")], "v1-1 draining (30s) &middot; v2-2 starting"), note: "Now one v1 task is deregistered and <b>drains</b> \u2014 it finishes in-flight requests before stopping. Set the deregistration delay to just above your slowest request; leave it at 300 seconds and every deploy crawls." });
        f.push({ stage: draw([t(3, "v1", "is-out")], [t(1, "v2", "is-done"), t(2, "v2", "is-done"), t(3, "v2", "is-act")], "one to go"), note: "The pattern repeats, one task at a time. Throughout, capacity never dips below three healthy tasks, so users see nothing." });
        f.push({ stage: draw([], [t(1, "v2", "is-done"), t(2, "v2", "is-done"), t(3, "v2", "is-done")], "deployment complete"), note: "Done. <b>Because the old revision still exists, rollback is redeploying revision 1</b> \u2014 the same mechanism running backwards, no rebuild needed." });
        f.push({ stage: draw([t(1, "v1", "is-done"), t(2, "v1", "is-done"), t(3, "v1", "is-done")], [t(1, "v2", "is-out")], "circuit breaker: v2 failed health checks \u2192 rolled back"), note: "And when the new revision is broken, the <b>deployment circuit breaker</b> notices the failures, stops, and restores the last known-good revision automatically. Turn it on; the default of retrying forever is not what you want at 2am." });
        f.push({
            stage: dataGridHTML([
                ["", "Lambda", "Fargate", "ECS/EKS on EC2"],
                ["You manage", "nothing", "the container", "the container + the instances"],
                ["Billing", "per ms of execution", "per second of vCPU/GB", "per second of instance"],
                ["Start-up", "cold start ms", "~30\u201360 s", "instance already warm"],
                ["Max duration", "15 min", "unlimited", "unlimited"],
                ["Good for", "events, glue, spiky APIs", "steady services", "cost at scale, GPUs, daemons"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" }),
            note: "<b>The compute ladder.</b> Move down it only when something forces you: a 15-minute limit, a runtime Lambda does not support, a need for GPUs, or a bill where always-on containers are genuinely cheaper than per-request pricing. Starting at the bottom because it feels more \u201creal\u201d is how teams acquire an ops burden they never needed.",
        });
        return f;
    },
};

/* ---- 22. CloudWatch alarms ---- */

VIZ["cloudwatch-alarm"] = {
    title: "From a metric to a page \u2014 an alarm's three states",
    legend: [["lg-done", "OK"], ["lg-cmp", "breaching"], ["lg-out", "ALARM"], ["lg-idle", "no data"]],
    build() {
        const draw = (vals, marks, cap) =>
            barsHTML(vals, marks) + `<div class="viz-caption">${cap}</div>`;
        const f = [];
        f.push({ stage: draw([120, 140, 110, 130, 125, 118], {}, "p99 latency (ms) &middot; threshold 400 &middot; 3 of 3 datapoints"), note: "A <b>metric</b> is a time series: a name, a namespace, dimensions, and a value per period. Alarms watch a <em>statistic</em> of it \u2014 and choosing the statistic is most of the skill." });
        f.push({ stage: draw([120, 140, 110, 130, 460, 118], { 4: "is-cmp" }, "one datapoint over threshold \u2014 alarm stays OK"), note: "One spike crosses 400 ms. The alarm does not fire, because it requires <b>3 breaching datapoints out of 3</b>. This is what stops a single garbage-collection pause from waking someone up." });
        f.push({ stage: draw([120, 140, 110, 470, 460, 510], { 3: "is-cmp", 4: "is-cmp", 5: "is-cmp" }, "3 of 3 breaching &rarr; ALARM"), note: "Three consecutive periods over the line. The alarm transitions to <b>ALARM</b> and fires its action \u2014 an SNS topic that pages, an Auto Scaling policy, a Lambda that remediates." });
        f.push({ stage: draw([470, 460, 510, 180, 140, 130], { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-done", 4: "is-done", 5: "is-done" }, "recovered &rarr; OK, and the OK action fires too"), note: "Recovery moves it back to OK. <b>Subscribe to the OK transition as well</b> \u2014 an alert that never tells you it is over trains people to ignore the channel." });
        f.push({ stage: draw([470, 0, 0, 0, 0, 0], { 0: "is-cmp", 1: "is-ghost", 2: "is-ghost", 3: "is-ghost", 4: "is-ghost", 5: "is-ghost" }, "the instance died &rarr; INSUFFICIENT_DATA"), note: "<b>The third state is the dangerous one.</b> If the thing emitting the metric dies, there are no datapoints, and the default behaviour is <code>INSUFFICIENT_DATA</code> \u2014 which is not <code>ALARM</code>. Your service is completely down and the alarm is quietly grey. Set <code>treatMissingData</code> to <code>breaching</code> for anything whose absence is bad news." });
        f.push({
            stage: panesHTML([
                { title: "Alarm on this", items: [{ text: "p99 latency", cls: "is-done" }, { text: "5xx rate", cls: "is-done" }, { text: "queue age (oldest message)", cls: "is-done" }, { text: "error budget burn", cls: "is-done" }] },
                { title: "Not on this", items: [{ text: "average latency", cls: "is-out" }, { text: "CPU on its own", cls: "is-out" }, { text: "raw request count", cls: "is-out" }] },
                { title: "Because", items: [{ text: "averages hide the tail", cls: "is-act" }, { text: "users feel symptoms", cls: "is-act" }, { text: "causes belong in dashboards", cls: "is-act" }] },
            ]),
            note: "<b>Alarm on symptoms, dashboard on causes.</b> High CPU is not a problem if latency is fine; slow requests are a problem whatever the CPU says. And use percentiles \u2014 an average latency of 120 ms is perfectly consistent with 5% of your users waiting four seconds.",
        });
        f.push({
            stage: dataGridHTML([
                ["Signal", "Service", "Answers"],
                ["Logs", "CloudWatch Logs", "what happened inside one request"],
                ["Metrics", "CloudWatch Metrics", "how the system behaves over time"],
                ["Traces", "X-Ray", "where the latency went across services"],
                ["API audit", "CloudTrail", "who called what, when, from where"],
                ["Config history", "AWS Config", "what changed, and did it drift"],
            ], { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "4,2": "is-act" }),
            note: "<b>Five different questions, five different tools</b> \u2014 and the one people forget is CloudTrail. \u201cWhy did this break at 14:03?\u201d is almost always answerable by looking at what changed at 14:02, and CloudTrail is the only place that knows.",
        });
        return f;
    },
};

/* ---- 23. Shared responsibility ---- */

VIZ["shared-responsibility"] = {
    title: "Who is responsible for what, service by service",
    legend: [["lg-act", "your job"], ["lg-done", "AWS's job"], ["lg-idle", "not present"]],
    options: [
        { value: "ec2", label: "Responsibility on EC2" },
        { value: "rds", label: "Responsibility on RDS" },
        { value: "lambda", label: "Responsibility on Lambda" },
    ],
    build(option = "ec2") {
        const LAYERS = [
            "Your data and who may read it",
            "Application code",
            "IAM, network and firewall config",
            "Platform / runtime patching",
            "Guest operating system",
            "Hypervisor and virtualisation",
            "Physical servers, network, datacentre",
        ];
        const SPLIT = { ec2: 5, rds: 4, lambda: 3 };
        const NOTES = {
            ec2: [
                "Bottom of the stack: AWS owns the building, the power, the network fabric and the hypervisor. You will never see any of it, and you cannot be responsible for it.",
                "The hypervisor boundary is where the line sits for EC2. Above it, everything in the instance is yours.",
                "<b>The guest OS is yours.</b> Kernel patches, SSH configuration, antivirus if you need it, users. AWS will not patch your instance, and \u201cwe assumed AWS handled it\u201d is the most common finding in a first security review.",
                "The runtime \u2014 your JVM, your Python, your nginx \u2014 is also yours to patch on EC2.",
                "Security groups, subnets, route tables and IAM policies are configuration <em>you</em> write. AWS makes them available and correct; it does not make them <em>right for you</em>.",
                "Your application code and its dependencies, obviously.",
                "<b>And at the top, always yours no matter the service: your data, its classification, its encryption, and who is allowed to read it.</b> This layer never moves.",
            ],
            rds: [
                "Same foundation \u2014 datacentre, hardware, network, hypervisor. Unchanged for every service.",
                "The hypervisor is AWS's.",
                "<b>Now the line moves up.</b> On RDS the guest OS is AWS's problem: you have no SSH access, and you would not want it.",
                "Engine patching is AWS's too, applied in your maintenance window. You choose <em>when</em>, not <em>whether</em>.",
                "But network placement, security groups, encryption settings and IAM/database users are still yours. A publicly accessible RDS instance is a configuration you made.",
                "Your schema, your queries, your indexes.",
                "<b>And your data.</b> Managed does not mean backed up the way you need \u2014 check the retention period, and remember that a bad migration replicates perfectly to the standby.",
            ],
            lambda: [
                "Hardware, network, datacentre \u2014 AWS.",
                "Hypervisor and the Firecracker micro-VM \u2014 AWS.",
                "Operating system \u2014 AWS. There is no host for you to log into.",
                "<b>The managed runtime is AWS's as well.</b> They patch the Python or Node runtime underneath your handler; you just pick a version and eventually get told to move off it.",
                "The line stops here. <b>The execution role, the VPC config, the resource policy and the environment variables are yours</b> \u2014 and an over-broad execution role is the single most common Lambda security problem.",
                "Your function code, and every dependency you vendored into the package.",
                "<b>Your data.</b> The layer that never moves, whatever the service.",
            ],
        };
        /* The stack fills in from the bottom up as the notes climb. */
        const frames = NOTES[option].map((note, i) => ({
            stage: (() => {
                const cut = SPLIT[option];
                let s = "";
                LAYERS.forEach((l, j) => {
                    const revealed = j >= LAYERS.length - 1 - i;
                    const isCurrent = j === LAYERS.length - 1 - i;
                    const state = !revealed ? "n-idle" : j < cut ? (isCurrent ? "n-act" : "n-cmp") : "n-done";
                    s += boxHTML(140, 8 + j * 42, 360, 34, l, state);
                    if (revealed) s += capHTML(514, 30 + j * 42, j < cut ? "you" : "AWS", "start");
                });
                return svgHTML(640, 8 + LAYERS.length * 42, s);
            })(),
            note,
        }));
        frames.push({
            stage: panesHTML([
                { title: "AWS: security OF the cloud", items: [{ text: "datacentres", cls: "is-done" }, { text: "hardware", cls: "is-done" }, { text: "hypervisor", cls: "is-done" }, { text: "managed service internals", cls: "is-done" }] },
                { title: "You: security IN the cloud", items: [{ text: "IAM policies", cls: "is-act" }, { text: "network config", cls: "is-act" }, { text: "encryption choices", cls: "is-act" }, { text: "your code and data", cls: "is-act" }] },
            ]),
            note: "<b>The sentence to remember:</b> AWS is responsible for the security <em>of</em> the cloud; you are responsible for security <em>in</em> the cloud. And the more managed the service, the higher the line sits \u2014 which is a security argument for managed services, not just an operational one.",
        });
        return frames;
    },
};

/* ---- 24. Choosing compute ---- */

VIZ["compute-choice"] = {
    title: "Choosing compute by elimination",
    legend: [["lg-act", "current question"], ["lg-done", "chosen"], ["lg-out", "ruled out"], ["lg-idle", "still possible"]],
    build() {
        const OPTS = ["S3 + CloudFront", "Lambda", "App Runner", "ECS Fargate", "EKS", "EC2"];
        const draw = (states, question) =>
            panesHTML([
                { title: "candidates", items: OPTS.map((o, i) => ({ text: o, cls: states[i] || "is-ghost" })) },
            ]) + `<div class="viz-caption">${question}</div>`;
        const g = "is-ghost", a = "is-act", o = "is-out", d = "is-done";
        const f = [];
        f.push({ stage: draw([a, a, a, a, a, a], "Everything is on the table"), note: "Six ways to run code on AWS. Rather than comparing all six, eliminate: each question below removes options, and the last one standing is your answer." });
        f.push({ stage: draw([d, o, o, o, o, o], "Is it a static site or a single-page app?"), note: "<b>If there is no server-side work, stop here.</b> S3 plus CloudFront serves a React or Astro build for pennies, scales globally, and has nothing to patch. An enormous number of \u201cwe need a cluster\u201d conversations end at this line." });
        f.push({ stage: draw([o, a, a, a, a, a], "Is the work event-driven and under 15 minutes?"), note: "Not static, so we continue. The next question is about <em>shape</em>: is this reacting to events \u2014 an upload, a queue message, an HTTP request \u2014 rather than running continuously?" });
        f.push({ stage: draw([o, d, g, g, g, g], "Yes \u2192 Lambda"), note: "<b>Lambda wins on operational cost, not compute cost.</b> No servers, no scaling policy, no patching, and you pay nothing when idle. The limits that push you off it are real but specific: 15 minutes, 10 GB memory, no GPU, cold starts you cannot tolerate." });
        f.push({ stage: draw([o, o, a, a, a, a], "Long-running service. Do you already have a container?"), note: "Suppose it is a long-lived HTTP service. Now the question is packaging \u2014 and if the answer is \u201cjust a Dockerfile and a port\u201d, you have simpler options than a cluster." });
        f.push({ stage: draw([o, o, d, a, g, g], "Simple container, no custom networking \u2192 App Runner"), note: "<b>App Runner</b> takes a container or a repo and gives you a scaled HTTPS service with a URL. It is the option almost nobody evaluates, and it is right more often than people expect for internal tools and small services." });
        f.push({ stage: draw([o, o, o, d, a, g], "Need VPC control, sidecars, real orchestration \u2192 ECS Fargate"), note: "For most production services the answer is <b>ECS on Fargate</b>: full VPC control, IAM per task, rolling deploys, no instances to manage. It is the default that a team of any size can operate." });
        f.push({ stage: draw([o, o, o, o, d, g], "Do you genuinely need Kubernetes?"), note: "<b>EKS is worth it for a specific reason, not a general one</b> \u2014 an existing Kubernetes investment, portability across clouds, an operator ecosystem you depend on, or a platform team that already runs it. \u201cIt is the industry standard\u201d is not a reason; it is a headcount commitment." });
        f.push({ stage: draw([o, o, o, o, o, d], "Anything left \u2192 EC2"), note: "EC2 remains the answer for the awkward cases: licensed software, GPU training, a daemon that must own the host, a lift-and-shift you have not refactored yet. <b>Choosing it deliberately is fine; choosing it by default is how you acquire a decade of patching.</b>" });
        f.push({
            stage: dataGridHTML([
                ["Question", "If yes"],
                ["No server-side code?", "S3 + CloudFront"],
                ["Event-driven, < 15 min?", "Lambda"],
                ["Container, just needs a URL?", "App Runner"],
                ["Long-running service?", "ECS Fargate"],
                ["Kubernetes ecosystem needed?", "EKS"],
                ["Licences, GPUs, full host control?", "EC2"],
            ], { "0,0": "is-head", "0,1": "is-head", "2,1": "is-done", "4,1": "is-done" }),
            note: "<b>Work down the list and take the first yes.</b> The ordering is deliberate: it puts the least operational burden first, and every step down costs you something ongoing. Move down only when a concrete constraint makes you.",
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
