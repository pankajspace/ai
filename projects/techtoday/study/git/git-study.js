/* ==========================================================================
   TechToday - Git study guide
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
        "find diff less tree printf test exit ssh scp python pip node npm npx make docker " +
        "git add am annotate apply archive bisect blame branch bundle checkout cherry " +
        "cherry-pick clean clone commit config describe fetch filter-branch fsck gc grep init " +
        "log ls-files ls-remote ls-tree maintenance merge merge-base mergetool mv notes pull " +
        "push range-diff rebase reflog remote repack replace rerere reset restore revert rev-list " +
        "rev-parse shortlog show show-ref sparse-checkout stash status submodule switch symbolic-ref " +
        "tag update-index update-ref worktree cat-file hash-object write-tree commit-tree " +
        "count-objects verify-pack for-each-ref check-ignore").split(" ")
);
/* GitHub Actions workflows and pre-commit configuration. */
const YAML_KW = new Set("true false null yes no on off".split(" "));
const YAML_BUILTIN = new Set(
    ("name on jobs steps run uses with needs env if runs-on strategy matrix permissions " +
        "concurrency defaults outputs secrets branches tags paths pull_request push workflow_dispatch " +
        "schedule cron fetch-depth ref repository token repos rev hooks id args stages " +
        "container services timeout-minutes continue-on-error working-directory shell").split(" ")
);
/* git config files: .gitconfig, .git/config, .gitmodules. */
const INI_KW = new Set("true false on off yes no".split(" "));
const INI_BUILTIN = new Set(
    ("core user alias remote branch push pull fetch merge mergetool diff difftool init commit " +
        "tag color credential gpg log status submodule rerere maintenance safe http url include " +
        "includeIf rebase blame advice pack gc feature protocol transfer receive uploadpack " +
        "name email editor autocrlf ignorecase filemode hooksPath excludesfile pager " +
        "defaultBranch default autoSetupRemote followTags ff rebase conflictStyle " +
        "autoStash autoSquash enabled tool prompt signingkey gpgsign insteadOf pushInsteadOf " +
        "fsmonitor untrackedCache longpaths symlinks bigFileThreshold directory").split(" ")
);
const JSON_KW = new Set("true false null".split(" "));
const JSON_BUILTIN = new Set(
    ("name version scripts dependencies devDependencies husky hooks lint-staged config " +
        "repository type url private engines files main").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
    yaml: [YAML_KW, YAML_BUILTIN],
    ini: [INI_KW, INI_BUILTIN],
    json: [JSON_KW, JSON_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python" || lang === "bash" || lang === "yaml" || lang === "ini";
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
    bash: "Shell",
    ini: "git config",
    yaml: "YAML",
    json: "JSON",
    python: "Python",
    javascript: "JavaScript",
    text: "Output",
};
const LANG_KEY = "tt-git-lang";
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
    apply("bash");
});

let storedLang = "bash";
try {
    storedLang = localStorage.getItem(LANG_KEY) || "bash";
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
   Git widgets
   ========================================================================== */

/* ---- git-specific render helper ----
   A commit graph. Arrows run from a commit to its parent, because that is the
   only direction Git can travel: a commit records where it came from and can
   never know what came after it.

   commits: [{ id, x, y, state, sub }]
   edges:   [[childId, parentId, state]]
   refs:    [{ at, label, state, dy }]   dy is the offset from the commit's y */
const dagHTML = (W, H, commits, edges, refs = [], extra = "") => {
    const pos = {};
    commits.forEach((c) => (pos[c.id] = c));
    let s = "";
    edges.forEach(([childId, parentId, state]) => {
        const child = pos[childId];
        const parent = pos[parentId];
        if (!child || !parent) return;
        const dx = parent.x - child.x;
        const dy = parent.y - child.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        s += arrowHTML(
            +(child.x + ux * 21).toFixed(1),
            +(child.y + uy * 21).toFixed(1),
            +(parent.x - ux * 21).toFixed(1),
            +(parent.y - uy * 21).toFixed(1),
            state || "e-idle"
        );
    });
    commits.forEach((c) => {
        s += nodeHTML(c.x, c.y, c.id, c.state || "n-idle", 20, c.sub || "");
    });
    refs.forEach((r) => {
        const c = pos[r.at];
        if (!c) return;
        const w = Math.max(54, r.label.length * 8 + 18);
        const y = c.y + (r.dy === undefined ? -58 : r.dy);
        const live = r.state && r.state !== "n-idle" ? "e-act" : "e-idle";
        const above = y + 24 <= c.y - 20;
        s += boxHTML(c.x - w / 2, y, w, 24, r.label, r.state || "n-idle");
        s += edgeHTML(c.x, above ? y + 24 : y, c.x, above ? c.y - 20 : c.y + 20, live);
    });
    return svgHTML(W, H, s + extra);
};

/* ---- 1. The three trees ---- */

VIZ["three-trees"] = {
    title: "The three trees: working tree, index, HEAD",
    legend: [["lg-act", "just changed"], ["lg-done", "recorded"], ["lg-out", "overwritten"], ["lg-idle", "unchanged"]],
    build() {
        const frames = [];
        const push = (w, i, h, note) =>
            frames.push({
                stage: panesHTML([
                    { title: "Working tree", items: w },
                    { title: "Index", items: i },
                    { title: "HEAD commit", items: h },
                ]),
                note,
            });

        const f = (name, v, cls) => ({ text: `${name} v${v}`, cls });

        push(
            [f("app.py", 1), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            "A clean repository. All three trees hold identical content, so <code>git status</code> has nothing to report."
        );
        push(
            [f("app.py", 2, "is-act"), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            "You edit <code>app.py</code> in your editor. Only the working tree moved &mdash; Git calls this <em>modified, not staged</em>."
        );
        push(
            [f("app.py", 2, "is-act"), f("README", 2, "is-act")],
            [f("app.py", 1), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            "A second edit. Git has still done nothing; it only notices differences when you ask."
        );
        push(
            [f("app.py", 2), f("README", 2, "is-act")],
            [f("app.py", 2, "is-act"), f("README", 1)],
            [f("app.py", 1), f("README", 1)],
            "<code>git add app.py</code> copies that file's current bytes into the index. The index is now a draft of your next commit."
        );
        push(
            [f("app.py", 2), f("README", 2, "is-act")],
            [f("app.py", 2, "is-done"), f("README", 1)],
            [f("app.py", 2, "is-done"), f("README", 1)],
            "<code>git commit</code> snapshots the <em>index</em>, never your working tree. <code>README</code> stayed out of the commit because you never staged it."
        );
        push(
            [f("app.py", 2), f("README", 2)],
            [f("app.py", 2), f("README", 2, "is-act")],
            [f("app.py", 2), f("README", 1)],
            "<code>git add README</code> &mdash; but suppose you change your mind before committing."
        );
        push(
            [f("app.py", 2), f("README", 2)],
            [f("app.py", 2), f("README", 1, "is-out")],
            [f("app.py", 2), f("README", 1)],
            "<code>git restore --staged README</code> copies HEAD's version back into the index. Your file on disk is untouched, so the edit is still safe."
        );
        push(
            [f("app.py", 2), f("README", 1, "is-out")],
            [f("app.py", 2), f("README", 1)],
            [f("app.py", 2), f("README", 1)],
            "<code>git restore README</code> copies the index over your file. That edit is now gone for good &mdash; there is no reflog for the working tree."
        );
        push(
            [f("app.py", 2), f("README", 1)],
            [f("app.py", 2), f("README", 1)],
            [f("app.py", 2), f("README", 1)],
            "Read every Git command as one question: <em>which of the three trees does it move?</em> That single habit removes most Git confusion."
        );
        return frames;
    },
};

/* ---- 2. Content addressing ---- */

VIZ["content-addressing"] = {
    title: "Content addressing: the hash is the filename",
    legend: [["lg-act", "being hashed"], ["lg-done", "stored"], ["lg-cmp", "reused"], ["lg-idle", "not yet"]],
    build() {
        const frames = [];
        const head = ["file", "contents", "object id (first 7)"];
        const push = (rows, marks, store, note) =>
            frames.push({
                stage:
                    dataGridHTML([head, ...rows], marks) +
                    panesHTML([{ title: ".git/objects", items: store, empty: "empty" }]),
                note,
            });
        const H = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head" };

        push(
            [["a.txt", "hello world", "?"]],
            { ...H, "1,0": "is-act", "1,1": "is-act" },
            [],
            "You write one file. Git has not looked at it yet &mdash; nothing lands in the object database until you stage or commit."
        );
        push(
            [["a.txt", "hello world", "3b18e51"]],
            { ...H, "1,2": "is-act" },
            [],
            "<code>git add</code> prefixes the bytes with <code>blob 12\\0</code>, runs SHA&#8209;1 over the result, and gets <code>3b18e51&hellip;</code>. The name <em>is</em> the content."
        );
        push(
            [["a.txt", "hello world", "3b18e51"]],
            { ...H, "1,2": "is-done" },
            [{ text: "3b18e51  blob", cls: "is-done" }],
            "The blob is written to <code>.git/objects/3b/18e51&hellip;</code>. Objects are immutable: nothing ever edits that file again."
        );
        push(
            [["a.txt", "hello world", "3b18e51"], ["docs/b.txt", "hello world", "?"]],
            { ...H, "2,0": "is-act", "2,1": "is-act" },
            [{ text: "3b18e51  blob", cls: "is-done" }],
            "Now a second file, in a different directory, with byte-identical contents."
        );
        push(
            [["a.txt", "hello world", "3b18e51"], ["docs/b.txt", "hello world", "3b18e51"]],
            { ...H, "1,2": "is-cmp", "2,2": "is-cmp" },
            [{ text: "3b18e51  blob", cls: "is-cmp" }],
            "Same bytes, same hash, <em>same object</em>. Git stores one blob and both paths point at it &mdash; deduplication falls out of the design for free."
        );
        push(
            [["a.txt", "Hello world", "?"], ["docs/b.txt", "hello world", "3b18e51"]],
            { ...H, "1,1": "is-act" },
            [{ text: "3b18e51  blob", cls: "is-done" }],
            "Change exactly one byte in <code>a.txt</code>: lowercase <code>h</code> becomes <code>H</code>."
        );
        push(
            [["a.txt", "Hello world", "802992c"], ["docs/b.txt", "hello world", "3b18e51"]],
            { ...H, "1,2": "is-act" },
            [{ text: "3b18e51  blob", cls: "is-done" }],
            "The new id is <code>802992c&hellip;</code>. One flipped bit scrambles every hash digit &mdash; that avalanche is why a hash can act as an integrity check."
        );
        push(
            [["a.txt", "Hello world", "802992c"], ["docs/b.txt", "hello world", "3b18e51"]],
            { ...H, "1,2": "is-done", "2,2": "is-done" },
            [{ text: "3b18e51  blob", cls: "is-done" }, { text: "802992c  blob", cls: "is-done" }],
            "Both blobs now exist. Git never overwrites &mdash; it appends. That is the whole reason old versions are recoverable."
        );
        push(
            [["a.txt", "Hello world", "802992c"], ["docs/b.txt", "hello world", "3b18e51"]],
            H,
            [{ text: "3b18e51  blob", cls: "is-done" }, { text: "802992c  blob", cls: "is-done" }],
            "Blobs hold contents only &mdash; no filename, no path, no timestamp. Filenames live in trees, which is the next object type."
        );
        return frames;
    },
};

/* ---- 3. The object graph ---- */

VIZ["object-graph"] = {
    title: "How a commit is built out of four object types",
    legend: [["lg-act", "being created"], ["lg-done", "already stored"], ["lg-idle", "not yet"]],
    build() {
        const W = 660;
        const H = 300;
        const frames = [];
        /* blobs, trees, commit */
        const build = (on, note) => {
            const st = (k) => (on.done.includes(k) ? "n-done" : on.act.includes(k) ? "n-act" : "n-idle");
            const ed = (k) => (on.act.includes(k) || on.done.includes(k) ? "e-done" : "e-idle");
            let s = "";
            s += capHTML(80, 22, "working files", "middle");
            s += capHTML(280, 22, "blobs", "middle");
            s += capHTML(450, 22, "trees", "middle");
            s += capHTML(590, 22, "commit", "middle");

            s += boxHTML(20, 40, 120, 34, "a.txt", st("fa"));
            s += boxHTML(20, 110, 120, 34, "docs/b.txt", st("fb"));
            s += boxHTML(20, 180, 120, 34, "app.py", st("fp"));

            s += boxHTML(210, 40, 140, 34, "3b18e51", st("ba"), "hello world");
            s += boxHTML(210, 180, 140, 34, "b80e322", st("bp"), "print(\"hi\")");

            s += boxHTML(390, 110, 130, 34, "eee380d", st("td"), "tree docs/");
            s += boxHTML(390, 190, 130, 34, "1a1ba4a", st("tr"), "root tree");

            s += boxHTML(540, 190, 110, 34, "fad3edc", st("c"), "commit");

            s += arrowHTML(140, 57, 210, 57, ed("ba"));
            s += arrowHTML(140, 127, 210, 70, ed("ba"));
            s += arrowHTML(140, 197, 210, 197, ed("bp"));
            s += arrowHTML(350, 57, 390, 120, ed("td"));
            s += arrowHTML(350, 197, 390, 205, ed("tr"));
            s += arrowHTML(455, 144, 455, 190, ed("tr"));
            s += arrowHTML(520, 207, 540, 207, ed("c"));
            frames.push({ stage: svgHTML(W, H, s), note });
        };

        build({ act: [], done: [] }, "Three files on disk. Git is about to turn them into four kinds of immutable object.");
        build({ act: ["fa", "fb", "fp"], done: [] }, "<code>git add .</code> reads every file's contents.");
        build({ act: ["ba"], done: ["fa", "fb", "fp"] }, "<code>a.txt</code> and <code>docs/b.txt</code> hold the same bytes, so they collapse into a single blob <code>3b18e51</code>.");
        build({ act: ["bp"], done: ["fa", "fb", "fp", "ba"] }, "<code>app.py</code> gets its own blob <code>b80e322</code>. Blobs know contents and nothing else.");
        build({ act: ["td"], done: ["fa", "fb", "fp", "ba", "bp"] }, "A <b>tree</b> for <code>docs/</code> lists one entry: mode <code>100644</code>, name <code>b.txt</code>, id <code>3b18e51</code>. Names live here, not in blobs.");
        build({ act: ["tr"], done: ["fa", "fb", "fp", "ba", "bp", "td"] }, "The root tree lists <code>a.txt</code>, <code>app.py</code> and the subtree <code>docs</code>. Trees reference trees, so one id names a whole directory structure.");
        build({ act: ["c"], done: ["fa", "fb", "fp", "ba", "bp", "td", "tr"] }, "The <b>commit</b> adds author, committer, message and parent ids on top of one root-tree id. That is the entire format.");
        build({ act: [], done: ["fa", "fb", "fp", "ba", "bp", "td", "tr", "c"] }, "Every id above is the hash of everything below it. Change one byte in <code>a.txt</code> and the blob, both trees and the commit id all change &mdash; history is tamper-evident by construction.");
        return frames;
    },
};

/* ---- 4. Branches are pointers ---- */

VIZ["branch-pointers"] = {
    title: "Branches are 41-byte files, not copies",
    legend: [["lg-act", "HEAD is here"], ["lg-done", "new commit"], ["lg-idle", "existing"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 320;
        const XS = [80, 200, 320, 440, 560];

        const draw = (spec, note) => {
            frames.push({ stage: dagHTML(W, H, spec.commits, spec.edges, spec.refs), note });
        };

        const base = (states = {}) => [
            { id: "a1", x: XS[0], y: 150, state: states.a1 || "n-idle" },
            { id: "b2", x: XS[1], y: 150, state: states.b2 || "n-idle" },
            { id: "c3", x: XS[2], y: 150, state: states.c3 || "n-idle" },
        ];

        draw(
            {
                commits: base(),
                edges: [["b2", "a1"], ["c3", "b2"]],
                refs: [
                    { at: "c3", label: "main", state: "n-act", dy: -58 },
                    { at: "c3", label: "HEAD", state: "n-act", dy: -98 },
                ],
            },
            "Three commits, oldest on the left; every arrow points at a <em>parent</em>, because that is the only direction Git can travel. <code>main</code> is a file holding one 40-character id, and <code>HEAD</code> is a file holding the text <code>ref: refs/heads/main</code>."
        );
        draw(
            {
                commits: base(),
                edges: [["b2", "a1"], ["c3", "b2"]],
                refs: [
                    { at: "c3", label: "main", dy: -58 },
                    { at: "c3", label: "feature", state: "n-done", dy: 40 },
                    { at: "c3", label: "HEAD", state: "n-act", dy: 80 },
                ],
            },
            "<code>git switch -c feature</code> writes 41 bytes and repoints HEAD. Nothing is copied, which is why branching in Git is instant no matter how large the repo is."
        );
        draw(
            {
                commits: [...base(), { id: "d4", x: XS[3], y: 150, state: "n-done" }],
                edges: [["b2", "a1"], ["c3", "b2"], ["d4", "c3", "e-done"]],
                refs: [
                    { at: "c3", label: "main", dy: -58 },
                    { at: "d4", label: "feature", state: "n-done", dy: 40 },
                    { at: "d4", label: "HEAD", state: "n-act", dy: 80 },
                ],
            },
            "You commit. Git writes <code>d4</code>, then advances <em>the branch HEAD points at</em>. <code>main</code> never moved because HEAD was not on it."
        );
        draw(
            {
                commits: [...base(), { id: "d4", x: XS[3], y: 150 }],
                edges: [["b2", "a1"], ["c3", "b2"], ["d4", "c3"]],
                refs: [
                    { at: "c3", label: "main", state: "n-act", dy: -58 },
                    { at: "c3", label: "HEAD", state: "n-act", dy: -98 },
                    { at: "d4", label: "feature", dy: 40 },
                ],
            },
            "<code>git switch main</code> moves HEAD back and rewrites your working tree to match <code>c3</code>. The commit <code>d4</code> is still there, just not checked out."
        );
        draw(
            {
                commits: [
                    ...base(),
                    { id: "d4", x: XS[3], y: 66 },
                    { id: "e5", x: XS[3], y: 200, state: "n-done" },
                ],
                edges: [["b2", "a1"], ["c3", "b2"], ["d4", "c3"], ["e5", "c3", "e-done"]],
                refs: [
                    { at: "e5", label: "main", state: "n-done", dy: 40 },
                    { at: "e5", label: "HEAD", state: "n-act", dy: 80 },
                    { at: "d4", label: "feature", dy: -50 },
                ],
            },
            "Commit again on <code>main</code> and the history <b>diverges</b>: two commits share the parent <code>c3</code>. This shape is exactly what merge and rebase exist to resolve."
        );
        draw(
            {
                commits: [
                    ...base(),
                    { id: "d4", x: XS[3], y: 66 },
                    { id: "e5", x: XS[3], y: 200 },
                ],
                edges: [["b2", "a1"], ["c3", "b2"], ["d4", "c3"], ["e5", "c3"]],
                refs: [
                    { at: "e5", label: "main", dy: 40 },
                    { at: "d4", label: "feature", dy: -50 },
                    { at: "c3", label: "merge base", state: "n-cmp", dy: 62 },
                ],
            },
            "<code>c3</code> is the <b>merge base</b>: the newest commit reachable from both tips. Every merge in Git starts by finding it."
        );
        return frames;
    },
};

/* ---- 5. Detached HEAD ---- */

VIZ["detached-head"] = {
    title: "Detached HEAD, and the commit you nearly lost",
    legend: [["lg-act", "HEAD"], ["lg-done", "new"], ["lg-out", "unreachable"], ["lg-idle", "existing"]],
    build() {
        const frames = [];
        const W = 640;
        const H = 250;
        const row = (states = {}) => [
            { id: "a1", x: 80, y: 150, state: states.a1 || "n-idle" },
            { id: "b2", x: 210, y: 150, state: states.b2 || "n-idle" },
            { id: "c3", x: 340, y: 150, state: states.c3 || "n-idle" },
            { id: "d4", x: 470, y: 150, state: states.d4 || "n-idle" },
        ];
        const spine = [["b2", "a1"], ["c3", "b2"], ["d4", "c3"]];

        frames.push({
            stage: dagHTML(W, H, row(), spine, [
                { at: "d4", label: "main", state: "n-act", dy: -58 },
                { at: "d4", label: "HEAD", state: "n-act", dy: -98 },
            ]),
            note: "Normal state: HEAD points at a <em>branch name</em>, and the branch points at a commit. Two levels of indirection.",
        });
        frames.push({
            stage: dagHTML(W, H, row({ b2: "n-act" }), spine, [
                { at: "d4", label: "main", dy: -58 },
                { at: "b2", label: "HEAD", state: "n-act", dy: -58 },
            ]),
            note: "<code>git checkout b2</code> points HEAD straight at a commit. HEAD is now <b>detached</b>: there is no branch under it to move.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...row({ b2: "n-idle" }), { id: "x9", x: 210, y: 62, state: "n-done" }],
                [...spine, ["x9", "b2", "e-done"]],
                [
                    { at: "d4", label: "main", dy: -58 },
                    { at: "x9", label: "HEAD", state: "n-act", dy: -46 },
                ]
            ),
            note: "You commit anyway. <code>x9</code> is a real commit with a real id &mdash; but only HEAD refers to it. No branch does.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...row(), { id: "x9", x: 210, y: 62, state: "n-out" }],
                [...spine, ["x9", "b2"]],
                [
                    { at: "d4", label: "main", state: "n-act", dy: -58 },
                    { at: "d4", label: "HEAD", state: "n-act", dy: -98 },
                ]
            ),
            note: "<code>git switch main</code> moves HEAD away and Git warns you are leaving a commit behind. <code>x9</code> is now <b>unreachable</b>: no ref can find it.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...row(), { id: "x9", x: 210, y: 62, state: "n-out" }],
                [...spine, ["x9", "b2"]],
                [{ at: "d4", label: "main", dy: -58 }]
            ),
            note: "Unreachable is not deleted. <code>git reflog</code> still lists <code>x9</code>, and the object survives until <code>git gc</code> prunes it &mdash; about two weeks by default.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...row(), { id: "x9", x: 210, y: 62, state: "n-done" }],
                [...spine, ["x9", "b2", "e-done"]],
                [
                    { at: "d4", label: "main", dy: -58 },
                    { at: "x9", label: "rescue", state: "n-done", dy: -46 },
                ]
            ),
            note: "<code>git branch rescue x9</code> gives the commit a name and it is reachable again. Detached HEAD is only dangerous if you never learn <code>reflog</code>.",
        });
        return frames;
    },
};

/* ---- 6. The four diffs ---- */

VIZ["four-diffs"] = {
    title: "Which diff command spans which gap",
    legend: [["lg-act", "compared"], ["lg-idle", "not involved"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 210;

        const draw = (a, b, cmd, note) => {
            const st = (k) => (k === a || k === b ? "n-act" : "n-idle");
            let s = "";
            s += boxHTML(30, 90, 150, 46, "Working tree", st("w"), "files on disk");
            s += boxHTML(250, 90, 150, 46, "Index", st("i"), "staged snapshot");
            s += boxHTML(470, 90, 150, 46, "HEAD", st("h"), "last commit");
            const lx = { w: 30, i: 250, h: 470 };
            if (a && b) {
                s += pathHTML(`M${lx[a] + 75} 86 C ${lx[a] + 75} 40, ${lx[b] + 75} 40, ${lx[b] + 75} 86`, "e-act");
                s += capHTML((lx[a] + lx[b]) / 2 + 75, 32, cmd);
            } else if (cmd) {
                s += capHTML(325, 32, cmd);
            }
            frames.push({ stage: svgHTML(W, H, s), note });
        };

        draw(null, null, "", "Three trees, three gaps. Every diff command you know is just a choice of two of these boxes.");
        draw("w", "i", "git diff", "<code>git diff</code> with no arguments compares the <b>working tree against the index</b>: what you changed but have not staged.");
        draw("i", "h", "git diff --staged", "<code>git diff --staged</code> (or <code>--cached</code>) compares the <b>index against HEAD</b>: exactly what your next commit will contain.");
        draw("w", "h", "git diff HEAD", "<code>git diff HEAD</code> compares the <b>working tree against HEAD</b>: everything you have changed, staged or not.");
        draw(null, null, "git diff main...feature", "A fourth form takes no working tree at all: <code>git diff A..B</code> compares two commits, and <code>A...B</code> compares B against the merge base &mdash; which is what a pull request shows you.");
        return frames;
    },
};
/* ---- 7. reset --soft / --mixed / --hard ---- */

VIZ["reset-modes"] = {
    title: "reset: one command, three stopping points",
    legend: [["lg-act", "moved"], ["lg-out", "lost"], ["lg-done", "kept"], ["lg-idle", "unchanged"]],
    options: [
        { value: "soft", label: "--soft" },
        { value: "mixed", label: "--mixed (default)" },
        { value: "hard", label: "--hard" },
    ],
    build(option) {
        const mode = option || "soft";
        const frames = [];
        const W = 620;
        const H = 220;

        const commits = [
            { id: "a1", x: 90, y: 130 },
            { id: "b2", x: 250, y: 130 },
            { id: "c3", x: 410, y: 130 },
        ];
        const edges = [["b2", "a1"], ["c3", "b2"]];

        const trees = (w, i, h) =>
            panesHTML([
                { title: "Working tree", items: [{ text: w[0], cls: w[1] }] },
                { title: "Index", items: [{ text: i[0], cls: i[1] }] },
                { title: "HEAD", items: [{ text: h[0], cls: h[1] }] },
            ]);

        const push = (refAt, refState, w, i, h, note) =>
            frames.push({
                stage:
                    dagHTML(W, H, commits.map((c) => ({ ...c, state: c.id === refAt ? "n-act" : "n-idle" })), edges, [
                        { at: refAt, label: "main", state: refState, dy: -58 },
                    ]) + trees(w, i, h),
                note,
            });

        push("c3", "n-act", ["v3", ""], ["v3", ""], ["v3", ""], "Three commits, clean tree. Every tree holds version 3 of the file. You decide the last two commits were a mistake.");
        push("c3", "n-act", ["v3", ""], ["v3", ""], ["v3", ""], `You run <code>git reset --${mode} a1</code>. Step one is the same for all three modes: move the branch that HEAD points at.`);
        push("a1", "n-act", ["v3", ""], ["v3", ""], ["v1", "is-act"], "The branch now points at <code>a1</code>, so HEAD's content is version 1. <code>b2</code> and <code>c3</code> still exist &mdash; they are just unreferenced.");

        if (mode === "soft") {
            push("a1", "n-act", ["v3", "is-done"], ["v3", "is-done"], ["v1", ""], "<code>--soft</code> stops there. Index and working tree keep version 3, so everything from the two discarded commits is now <b>staged</b>.");
            push("a1", "n-act", ["v3", "is-done"], ["v3", "is-done"], ["v1", ""], "That is the squash trick: <code>git reset --soft main~2 &amp;&amp; git commit</code> collapses two commits into one, losing nothing.");
        } else if (mode === "mixed") {
            push("a1", "n-act", ["v3", "is-done"], ["v1", "is-act"], ["v1", ""], "<code>--mixed</code> also rewrites the index to match HEAD. Your changes survive on disk but are now <b>unstaged</b>.");
            push("a1", "n-act", ["v3", "is-done"], ["v1", ""], ["v1", ""], "This is the default, and the safe one: files on disk are never touched, so nothing you typed can be lost.");
        } else {
            push("a1", "n-act", ["v3", ""], ["v1", "is-act"], ["v1", ""], "<code>--hard</code> rewrites the index&hellip;");
            push("a1", "n-act", ["v1", "is-out"], ["v1", ""], ["v1", ""], "&hellip;and then overwrites your <b>working tree</b>. Version 3 is gone from disk. If it was never committed or stashed, no reflog can bring it back.");
            push("a1", "n-act", ["v1", ""], ["v1", ""], ["v1", ""], "<code>--hard</code> is the only Git command that routinely destroys work. Commit or <code>git stash</code> first, every time.");
        }
        frames.push({
            stage:
                dagHTML(W, H, commits.map((c) => ({ ...c, state: c.id === "a1" ? "n-act" : "n-out" })), edges, [
                    { at: "a1", label: "main", state: "n-act", dy: -58 },
                ]) + trees(["v?", ""], ["v?", ""], ["v1", ""]),
            note: "In every mode the <em>commits</em> survive: <code>git reflog</code> shows <code>c3</code> and <code>git reset --hard c3</code> undoes the undo.",
        });
        return frames;
    },
};

/* ---- 8. revert ---- */

VIZ["revert-flow"] = {
    title: "revert: undo by adding, not by deleting",
    legend: [["lg-act", "the bad commit"], ["lg-done", "the fix"], ["lg-idle", "history"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 220;
        const base = [
            { id: "a1", x: 90, y: 130 },
            { id: "b2", x: 220, y: 130 },
            { id: "c3", x: 350, y: 130 },
            { id: "d4", x: 480, y: 130 },
        ];
        const edges = [["b2", "a1"], ["c3", "b2"], ["d4", "c3"]];

        const push = (commits, ed, refs, extra, note) =>
            frames.push({ stage: dagHTML(W, H, commits, ed, refs) + (extra || ""), note });

        push(base, edges, [{ at: "d4", label: "main", dy: -58 }], "", "Four commits, and <code>c3</code> shipped a bug. It has already been pushed, so rewriting history would break everyone who pulled it.");
        push(
            base.map((c) => ({ ...c, state: c.id === "c3" ? "n-out" : "n-idle" })),
            edges,
            [{ at: "d4", label: "main", dy: -58 }],
            codeHTML(["-  timeout = 30", "+  timeout = 0"], { 1: "is-out" }),
            "This is what <code>c3</code> changed. You want the opposite of that patch, applied on top."
        );
        push(
            base.map((c) => ({ ...c, state: c.id === "c3" ? "n-out" : "n-idle" })),
            edges,
            [{ at: "d4", label: "main", dy: -58 }],
            codeHTML(["-  timeout = 0", "+  timeout = 30"], { 1: "is-done" }),
            "<code>git revert c3</code> computes the inverse patch and applies it to your working tree and index."
        );
        push(
            [...base, { id: "e5", x: 590, y: 130, state: "n-done" }],
            [...edges, ["e5", "d4", "e-done"]],
            [{ at: "e5", label: "main", state: "n-done", dy: -58 }],
            "",
            "A <b>new</b> commit <code>e5</code> records the undo. <code>c3</code> is untouched, so anyone who already pulled it still has a valid history."
        );
        push(
            [...base, { id: "e5", x: 590, y: 130 }],
            [...edges, ["e5", "d4"]],
            [{ at: "e5", label: "main", dy: -58 }],
            "",
            "The rule: <b>revert</b> for anything other people have; <b>reset</b> only for commits that never left your machine."
        );
        push(
            [...base, { id: "e5", x: 590, y: 130 }],
            [...edges, ["e5", "d4"]],
            [{ at: "e5", label: "main", dy: -58 }],
            "",
            "Reverting a <em>merge</em> needs <code>-m 1</code> to say which parent is the mainline &mdash; and re-merging that branch later will silently skip the reverted changes until you revert the revert."
        );
        return frames;
    },
};

/* ---- 9. Merge shapes ---- */

VIZ["merge-types"] = {
    title: "Three things git merge can do",
    legend: [["lg-act", "HEAD"], ["lg-done", "result"], ["lg-cmp", "merge base"], ["lg-idle", "existing"]],
    options: [
        { value: "ff", label: "Fast-forward" },
        { value: "three", label: "Three-way merge" },
        { value: "noff", label: "--no-ff" },
    ],
    build(option) {
        const mode = option || "ff";
        const frames = [];
        const W = 660;
        const H = 250;

        if (mode === "ff") {
            const cs = [
                { id: "a1", x: 100, y: 150 },
                { id: "b2", x: 240, y: 150 },
                { id: "c3", x: 380, y: 150 },
                { id: "d4", x: 520, y: 150 },
            ];
            const ed = [["b2", "a1"], ["c3", "b2"], ["d4", "c3"]];
            frames.push({
                stage: dagHTML(W, H, cs, ed, [
                    { at: "b2", label: "main", state: "n-act", dy: -58 },
                    { at: "d4", label: "feature", dy: 40 },
                ]),
                note: "<code>main</code> has not moved since <code>feature</code> branched. The merge base <em>is</em> <code>main</code>'s tip, so there is nothing to reconcile.",
            });
            frames.push({
                stage: dagHTML(W, H, cs, ed, [
                    { at: "b2", label: "main", state: "n-cmp", dy: -58 },
                    { at: "d4", label: "feature", dy: 40 },
                ]),
                note: "<code>git merge feature</code> checks: is the merge base equal to HEAD? Yes &mdash; so a merge commit would add nothing.",
            });
            frames.push({
                stage: dagHTML(W, H, cs.map((c) => ({ ...c, state: c.id === "d4" ? "n-done" : "n-idle" })), ed, [
                    { at: "d4", label: "main", state: "n-done", dy: -58 },
                    { at: "d4", label: "feature", dy: 40 },
                ]),
                note: "Git just slides the <code>main</code> pointer forward. No new commit, no new object &mdash; a <b>fast-forward</b>.",
            });
            frames.push({
                stage: dagHTML(W, H, cs, ed, [
                    { at: "d4", label: "main", dy: -58 },
                    { at: "d4", label: "feature", dy: 40 },
                ]),
                note: "The history is now perfectly linear, and nothing records that a branch ever existed. Use <code>--no-ff</code> when that record matters.",
            });
            return frames;
        }

        const cs = [
            { id: "a1", x: 100, y: 150 },
            { id: "b2", x: 230, y: 150 },
            { id: "c3", x: 360, y: 150 },
            { id: "x4", x: 230, y: 60 },
            { id: "y5", x: 360, y: 60 },
        ];
        const ed = [["b2", "a1"], ["c3", "b2"], ["x4", "a1"], ["y5", "x4"]];

        if (mode === "three") {
            frames.push({
                stage: dagHTML(W, H, cs, ed, [
                    { at: "c3", label: "main", state: "n-act", dy: 40 },
                    { at: "y5", label: "feature", dy: -48 },
                ]),
                note: "Both branches moved since they split. There is no way to reach <code>y5</code> by sliding <code>main</code> forward.",
            });
            frames.push({
                stage: dagHTML(W, H, cs.map((c) => ({ ...c, state: c.id === "a1" ? "n-cmp" : "n-idle" })), ed, [
                    { at: "c3", label: "main", dy: 40 },
                    { at: "y5", label: "feature", dy: -48 },
                    { at: "a1", label: "merge base", state: "n-cmp", dy: -48 },
                ]),
                note: "Git finds the <b>merge base</b> <code>a1</code> &mdash; the newest commit reachable from both tips. Everything now hinges on it.",
            });
            frames.push({
                stage:
                    dagHTML(W, H, cs.map((c) => ({ ...c, state: ["a1", "c3", "y5"].includes(c.id) ? "n-cmp" : "n-idle" })), ed, [
                        { at: "c3", label: "main", dy: 40 },
                        { at: "y5", label: "feature", dy: -48 },
                    ]) +
                    panesHTML([
                        { title: "base a1", items: ["config.yml", "app.py"] },
                        { title: "ours c3", items: [{ text: "config.yml", cls: "is-act" }, "app.py"] },
                        { title: "theirs y5", items: ["config.yml", { text: "app.py", cls: "is-act" }] },
                    ]),
                note: "Three-way merge compares <em>base vs ours</em> and <em>base vs theirs</em>, file by file. Only one side changed each file, so both changes can be taken.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...cs, { id: "m6", x: 500, y: 105, state: "n-done" }],
                    [...ed, ["m6", "c3", "e-done"], ["m6", "y5", "e-done"]],
                    [
                        { at: "m6", label: "main", state: "n-done", dy: 48 },
                        { at: "y5", label: "feature", dy: -48 },
                    ]
                ),
                note: "The result is a <b>merge commit</b> with two parents. Its first parent is where you were; the second is what you merged in.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...cs, { id: "m6", x: 500, y: 105 }],
                    [...ed, ["m6", "c3"], ["m6", "y5"]],
                    [{ at: "m6", label: "main", dy: 48 }, { at: "y5", label: "feature", dy: -48 }]
                ),
                note: "Nothing was rewritten: every original commit keeps its id. That is why merging is always safe on shared branches.",
            });
            return frames;
        }

        /* --no-ff */
        const ff = [
            { id: "a1", x: 110, y: 150 },
            { id: "b2", x: 250, y: 150 },
            { id: "x4", x: 250, y: 60 },
            { id: "y5", x: 390, y: 60 },
        ];
        const ffEd = [["b2", "a1"], ["x4", "b2"], ["y5", "x4"]];
        frames.push({
            stage: dagHTML(W, H, ff, ffEd, [
                { at: "b2", label: "main", state: "n-act", dy: 40 },
                { at: "y5", label: "feature", dy: -48 },
            ]),
            note: "A fast-forwardable situation: <code>main</code> is an ancestor of <code>feature</code>, so Git would normally just slide the pointer.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...ff, { id: "m6", x: 530, y: 105, state: "n-done" }],
                [...ffEd, ["m6", "b2", "e-done"], ["m6", "y5", "e-done"]],
                [
                    { at: "m6", label: "main", state: "n-done", dy: 48 },
                    { at: "y5", label: "feature", dy: -48 },
                ]
            ),
            note: "<code>git merge --no-ff feature</code> forces a merge commit anyway. Its two parents preserve the shape of the branch.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...ff, { id: "m6", x: 530, y: 105 }],
                [...ffEd, ["m6", "b2"], ["m6", "y5"]],
                [{ at: "m6", label: "main", dy: 48 }]
            ),
            note: "Now <code>git log --first-parent</code> reads as one line per feature, and <code>git revert -m 1 m6</code> can back the whole feature out in one commit.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...ff, { id: "m6", x: 530, y: 105 }],
                [...ffEd, ["m6", "b2"], ["m6", "y5"]],
                [{ at: "m6", label: "main", dy: 48 }]
            ),
            note: "The cost is a noisier graph. Teams usually pick one policy repo-wide with <code>merge.ff</code> rather than deciding per merge.",
        });
        return frames;
    },
};

/* ---- 10. Merge conflicts ---- */

VIZ["merge-conflict"] = {
    title: "What a conflict actually is, and how to end it",
    legend: [["lg-act", "ours"], ["lg-cmp", "theirs"], ["lg-out", "conflicted"], ["lg-done", "resolved"]],
    build() {
        const frames = [];
        const push = (stage, note) => frames.push({ stage, note });

        push(
            panesHTML([
                { title: "base", items: ["timeout: 30"] },
                { title: "ours (main)", items: [{ text: "timeout: 60", cls: "is-act" }] },
                { title: "theirs (feature)", items: [{ text: "timeout: 10", cls: "is-cmp" }] },
            ]),
            "Both branches edited the <em>same line</em> of the same file, and they disagree. Git has no rule for choosing, so it refuses to guess."
        );
        push(
            codeHTML(
                [
                    "server:",
                    "<<<<<<< HEAD",
                    "  timeout: 60",
                    "=======",
                    "  timeout: 10",
                    ">>>>>>> feature",
                    "  retries: 3",
                ],
                { 1: "is-out", 3: "is-out", 5: "is-out", 2: "is-act", 4: "is-cmp" }
            ),
            "Git writes both versions into the file with markers. Between <code>&lt;&lt;&lt;</code> and <code>===</code> is <b>yours</b>; between <code>===</code> and <code>&gt;&gt;&gt;</code> is <b>theirs</b>."
        );
        push(
            panesHTML([
                { title: "Working tree", items: [{ text: "config.yml (markers)", cls: "is-out" }] },
                { title: "Index", items: [{ text: "stage 1 base", cls: "is-cmp" }, { text: "stage 2 ours", cls: "is-act" }, { text: "stage 3 theirs", cls: "is-cmp" }] },
                { title: "HEAD", items: ["config.yml"] },
            ]),
            "Meanwhile the index holds <b>three</b> entries for that path instead of one. That is literally what &lsquo;unmerged&rsquo; means &mdash; see it with <code>git ls-files -u</code>."
        );
        push(
            codeHTML(["server:", "  timeout: 30", "  retries: 3"], { 1: "is-act" }),
            "You edit the file into the answer you actually want. Resolution is a human decision, not a command &mdash; often neither side verbatim."
        );
        push(
            panesHTML([
                { title: "Working tree", items: [{ text: "config.yml", cls: "is-done" }] },
                { title: "Index", items: [{ text: "config.yml", cls: "is-done" }] },
                { title: "HEAD", items: ["config.yml"] },
            ]),
            "<code>git add config.yml</code> collapses the three stages to one. <code>git add</code> during a merge means &lsquo;I have resolved this&rsquo; &mdash; nothing else."
        );
        push(
            panesHTML([
                { title: "Working tree", items: [{ text: "config.yml", cls: "is-done" }] },
                { title: "Index", items: [{ text: "config.yml", cls: "is-done" }] },
                { title: "HEAD", items: [{ text: "merge commit", cls: "is-done" }] },
            ]),
            "<code>git commit</code> finishes the merge. If you would rather walk away, <code>git merge --abort</code> restores the pre-merge state exactly."
        );
        push(
            codeHTML(
                [
                    "$ git checkout --ours   config.yml   # keep my whole file",
                    "$ git checkout --theirs config.yml   # keep their whole file",
                    "$ git checkout --merge  config.yml   # put the markers back",
                    "$ git rerere              # remember this resolution for next time",
                ],
                { 3: "is-done" }
            ),
            "Escape hatches worth knowing. <code>rerere</code> is the one people miss: enable it once and Git replays your resolution every time the same conflict reappears."
        );
        return frames;
    },
};
/* ---- 11. Rebase versus merge ---- */

VIZ["rebase-vs-merge"] = {
    title: "Merge keeps the shape; rebase rewrites it",
    legend: [["lg-done", "new commit"], ["lg-out", "abandoned original"], ["lg-cmp", "merge base"], ["lg-idle", "existing"]],
    options: [
        { value: "merge", label: "git merge main" },
        { value: "rebase", label: "git rebase main" },
    ],
    build(option) {
        const mode = option || "merge";
        const frames = [];
        const W = 680;
        const H = 250;

        const trunk = [
            { id: "a1", x: 100, y: 160 },
            { id: "b2", x: 230, y: 160 },
            { id: "c3", x: 360, y: 160 },
        ];
        const topo = [["b2", "a1"], ["c3", "b2"]];
        const feat = [
            { id: "x4", x: 230, y: 66 },
            { id: "y5", x: 360, y: 66 },
        ];
        const featEd = [["x4", "a1"], ["y5", "x4"]];

        frames.push({
            stage: dagHTML(W, H, [...trunk, ...feat], [...topo, ...featEd], [
                { at: "c3", label: "main", dy: 46 },
                { at: "y5", label: "feature", state: "n-act", dy: -50 },
            ]),
            note: "You branched at <code>a1</code> and wrote <code>x4</code>, <code>y5</code>. Meanwhile <code>main</code> gained <code>b2</code> and <code>c3</code>. Your work no longer sits on top of the trunk.",
        });

        if (mode === "merge") {
            frames.push({
                stage: dagHTML(W, H, [...trunk, ...feat].map((c) => ({ ...c, state: c.id === "a1" ? "n-cmp" : "n-idle" })), [...topo, ...featEd], [
                    { at: "c3", label: "main", dy: 46 },
                    { at: "y5", label: "feature", dy: -50 },
                    { at: "a1", label: "base", state: "n-cmp", dy: -50 },
                ]),
                note: "<code>git merge main</code> from <code>feature</code> finds the merge base <code>a1</code> and reconciles the two sides once.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...trunk, ...feat, { id: "m6", x: 510, y: 110, state: "n-done" }],
                    [...topo, ...featEd, ["m6", "y5", "e-done"], ["m6", "c3", "e-done"]],
                    [
                        { at: "c3", label: "main", dy: 46 },
                        { at: "m6", label: "feature", state: "n-done", dy: -50 },
                    ]
                ),
                note: "One new commit with two parents. <code>x4</code> and <code>y5</code> keep their original ids, so anyone who already pulled <code>feature</code> is unaffected.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...trunk, ...feat, { id: "m6", x: 510, y: 110 }],
                    [...topo, ...featEd, ["m6", "y5"], ["m6", "c3"]],
                    [{ at: "c3", label: "main", dy: 46 }, { at: "m6", label: "feature", dy: -50 }]
                ),
                note: "Cost: the graph now forks and rejoins, and a conflict has to be solved once for the whole branch. Benefit: the history is a true record of what happened.",
            });
            return frames;
        }

        frames.push({
            stage: dagHTML(W, H, [...trunk, ...feat].map((c) => ({ ...c, state: ["x4", "y5"].includes(c.id) ? "n-act" : "n-idle" })), [...topo, ...featEd], [
                { at: "c3", label: "main", dy: 46 },
                { at: "y5", label: "feature", dy: -50 },
            ]),
            note: "<code>git rebase main</code> first works out which commits are yours: everything reachable from <code>feature</code> but not from <code>main</code>, so <code>x4</code> and <code>y5</code>.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...trunk, ...feat.map((c) => ({ ...c, state: "n-out" })), { id: "x4'", x: 490, y: 160, state: "n-done" }],
                [...topo, ...featEd, ["x4'", "c3", "e-done"]],
                [{ at: "c3", label: "main", dy: 46 }, { at: "x4'", label: "HEAD", state: "n-act", dy: 46 }]
            ),
            note: "Git saves each one as a patch and replays the first onto <code>c3</code>. Different parent means a different hash: <code>x4'</code> is a <b>new commit</b>, not a moved one.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    ...trunk,
                    ...feat.map((c) => ({ ...c, state: "n-out" })),
                    { id: "x4'", x: 490, y: 160 },
                    { id: "y5'", x: 610, y: 160, state: "n-done" },
                ],
                [...topo, ...featEd, ["x4'", "c3"], ["y5'", "x4'", "e-done"]],
                [{ at: "c3", label: "main", dy: 46 }, { at: "y5'", label: "feature", state: "n-done", dy: 46 }]
            ),
            note: "The second patch replays too, and <code>feature</code> is repointed at the new tip. Conflicts here are resolved <em>per commit</em>, which is why a long rebase can ask the same question repeatedly.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    ...trunk,
                    ...feat.map((c) => ({ ...c, state: "n-out" })),
                    { id: "x4'", x: 490, y: 160 },
                    { id: "y5'", x: 610, y: 160 },
                ],
                [...topo, ...featEd, ["x4'", "c3"], ["y5'", "x4'"]],
                [{ at: "c3", label: "main", dy: 46 }, { at: "y5'", label: "feature", dy: 46 }]
            ),
            note: "The originals are now unreferenced (reflog still has them). History is a straight line &mdash; and this is exactly why you never rebase a branch other people have pulled.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...trunk, { id: "x4'", x: 490, y: 160 }, { id: "y5'", x: 610, y: 160 }],
                [...topo, ["x4'", "c3"], ["y5'", "x4'"]],
                [{ at: "c3", label: "main", dy: 46 }, { at: "y5'", label: "feature", dy: 46 }]
            ),
            note: "The golden rule in one line: <b>rebase your own unpushed work, merge everything else.</b>",
        });
        return frames;
    },
};

/* ---- 12. Interactive rebase ---- */

VIZ["interactive-rebase"] = {
    title: "Interactive rebase: editing your own history",
    legend: [["lg-act", "being edited"], ["lg-done", "result"], ["lg-out", "dropped"], ["lg-idle", "untouched"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 190;
        const row = (ids, states = {}) =>
            ids.map((id, i) => ({ id, x: 90 + i * 108, y: 110, state: states[id] || "n-idle" }));
        const edgesFor = (ids) => ids.slice(1).map((id, i) => [id, ids[i]]);

        const ids = ["a1", "b2", "c3", "d4", "e5"];
        const todo = [
            "pick b2  add parser",
            "pick c3  fix typo",
            "pick d4  wip",
            "pick e5  add tests",
        ];

        frames.push({
            stage: dagHTML(W, H, row(ids), edgesFor(ids), [{ at: "e5", label: "feature", dy: -50 }]),
            note: "Four commits on your branch, and they are honest but untidy: a typo fix, a &lsquo;wip&rsquo;, and tests that belong with the feature.",
        });
        frames.push({
            stage: dagHTML(W, H, row(ids, { b2: "n-act", c3: "n-act", d4: "n-act", e5: "n-act" }), edgesFor(ids), [{ at: "e5", label: "feature", dy: -50 }]) + codeHTML(todo),
            note: "<code>git rebase -i a1</code> opens a <b>todo list</b> &mdash; one line per commit, oldest first. Note the order is the opposite of <code>git log</code>.",
        });
        frames.push({
            stage: codeHTML(
                [
                    "pick   b2  add parser",
                    "squash c3  fix typo",
                    "drop   d4  wip",
                    "reword e5  add tests",
                    "",
                    "# p, pick   = keep as is",
                    "# r, reword = keep the change, edit the message",
                    "# s, squash = fold into the previous commit, merge messages",
                    "# f, fixup  = fold in and throw the message away",
                    "# e, edit   = stop here so you can amend",
                    "# d, drop   = delete the commit",
                ],
                { 1: "is-act", 2: "is-out", 3: "is-act" }
            ),
            note: "You edit the verbs. Deleting a line deletes the commit &mdash; that is the one surprise that catches people out.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    { id: "a1", x: 90, y: 110 },
                    { id: "b2'", x: 240, y: 110, state: "n-done" },
                ],
                [["b2'", "a1", "e-done"]],
                [{ at: "b2'", label: "HEAD", state: "n-act", dy: -50 }]
            ) + codeHTML(todo, { 0: "is-done" }),
            note: "Git rewinds to <code>a1</code> and replays. <code>b2</code> is applied first, producing the new commit <code>b2'</code>.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    { id: "a1", x: 90, y: 110 },
                    { id: "B", x: 240, y: 110, state: "n-done" },
                ],
                [["B", "a1", "e-done"]],
                [{ at: "B", label: "HEAD", state: "n-act", dy: -50 }]
            ) + codeHTML(todo, { 0: "is-done", 1: "is-done" }),
            note: "<code>squash c3</code> folds the typo fix into that same commit and opens an editor to combine the two messages. Two commits became one.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    { id: "a1", x: 90, y: 110 },
                    { id: "B", x: 240, y: 110 },
                ],
                [["B", "a1"]],
                [{ at: "B", label: "HEAD", state: "n-act", dy: -50 }]
            ) + codeHTML(todo, { 0: "is-done", 1: "is-done", 2: "is-out" }),
            note: "<code>drop d4</code> simply skips it. The &lsquo;wip&rsquo; commit never existed as far as the new history is concerned.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    { id: "a1", x: 90, y: 110 },
                    { id: "B", x: 240, y: 110 },
                    { id: "E", x: 390, y: 110, state: "n-done" },
                ],
                [["B", "a1"], ["E", "B", "e-done"]],
                [{ at: "E", label: "feature", state: "n-done", dy: -50 }]
            ) + codeHTML(todo, { 0: "is-done", 1: "is-done", 2: "is-out", 3: "is-done" }),
            note: "<code>reword e5</code> replays the change and stops for a better message. Four scrappy commits are now two reviewable ones.",
        });
        frames.push({
            stage: codeHTML(
                [
                    "$ git commit --fixup=b2        # marks a commit as a fix for b2",
                    "$ git rebase -i --autosquash a1  # orders and folds it automatically",
                    "$ git rebase --abort           # nothing happened, at any point",
                    "$ git reflog                    # the old commits are still listed",
                ],
                { 0: "is-act", 1: "is-act" }
            ),
            note: "In practice you rarely edit the list by hand: <code>--fixup</code> plus <code>--autosquash</code> does it for you. And an interactive rebase is abortable until the moment it finishes.",
        });
        return frames;
    },
};

/* ---- 13. rebase --onto ---- */

VIZ["rebase-onto"] = {
    title: "rebase --onto: moving a branch off the wrong base",
    legend: [["lg-act", "to move"], ["lg-done", "replayed"], ["lg-out", "left behind"], ["lg-idle", "existing"]],
    build() {
        const frames = [];
        const W = 680;
        const H = 380;
        const main = [
            { id: "a1", x: 90, y: 180 },
            { id: "b2", x: 210, y: 180 },
        ];
        const featA = [
            { id: "f3", x: 330, y: 180 },
            { id: "f4", x: 450, y: 180 },
        ];
        const featB = [
            { id: "g5", x: 330, y: 70 },
            { id: "g6", x: 450, y: 70 },
        ];
        const ed = [["b2", "a1"], ["f3", "b2"], ["f4", "f3"], ["g5", "f4"], ["g6", "g5"]];

        frames.push({
            stage: dagHTML(W, H, [...main, ...featA, ...featB], ed, [
                { at: "b2", label: "main", dy: 46 },
                { at: "f4", label: "feature-a", dy: 46 },
                { at: "g6", label: "feature-b", dy: -50 },
            ]),
            note: "You branched <code>feature-b</code> off <code>feature-a</code> by mistake. Now <code>feature-a</code> is going to be rejected, and <code>feature-b</code> must not carry its commits.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...main, ...featA, ...featB.map((c) => ({ ...c, state: "n-act" }))],
                ed,
                [
                    { at: "b2", label: "main", state: "n-cmp", dy: 46 },
                    { at: "f4", label: "feature-a", state: "n-out", dy: 46 },
                    { at: "g6", label: "feature-b", dy: -50 },
                ]
            ),
            note: "<code>git rebase --onto main feature-a feature-b</code> reads as three answers: <b>onto</b> where, <b>from</b> which exclusive point, <b>which</b> branch.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...main, ...featA, ...featB.map((c) => ({ ...c, state: "n-out" })), { id: "g5'", x: 330, y: 290, state: "n-done" }],
                [...ed, ["g5'", "b2", "e-done"]],
                [{ at: "b2", label: "main", dy: 46 }, { at: "g6", label: "feature-b", dy: -50 }]
            ),
            note: "Commits after <code>feature-a</code> &mdash; that is <code>g5</code> and <code>g6</code> &mdash; are replayed onto <code>main</code>. <code>g5'</code> is the first new commit.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [
                    ...main,
                    ...featA,
                    ...featB.map((c) => ({ ...c, state: "n-out" })),
                    { id: "g5'", x: 330, y: 290 },
                    { id: "g6'", x: 450, y: 290, state: "n-done" },
                ],
                [...ed, ["g5'", "b2"], ["g6'", "g5'", "e-done"]],
                [
                    { at: "b2", label: "main", dy: 46 },
                    { at: "f4", label: "feature-a", dy: 46 },
                    { at: "g6'", label: "feature-b", state: "n-done", dy: 46 },
                ]
            ),
            note: "<code>feature-b</code> now sits directly on <code>main</code> and contains none of <code>feature-a</code>'s work. <code>feature-a</code> is untouched and can be deleted at leisure.",
        });
        frames.push({
            stage: codeHTML([
                "# drop one commit from the middle of a branch",
                "git rebase --onto bad~1 bad feature",
                "",
                "# move the last 3 commits of this branch onto release",
                "git rebase --onto release HEAD~3 feature",
            ], { 1: "is-done", 4: "is-done" }),
            note: "The same three-argument shape solves &lsquo;drop a commit from the middle&rsquo; and &lsquo;move the last N commits elsewhere&rsquo;. Learn this form and you rarely need cherry-pick loops.",
        });
        return frames;
    },
};

/* ---- 14. Cherry-pick ---- */

VIZ["cherry-pick"] = {
    title: "cherry-pick: copy one commit's change somewhere else",
    legend: [["lg-act", "the commit"], ["lg-done", "the copy"], ["lg-idle", "existing"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 250;
        const trunk = [
            { id: "a1", x: 100, y: 170 },
            { id: "b2", x: 240, y: 170 },
        ];
        const feat = [
            { id: "x3", x: 240, y: 70 },
            { id: "y4", x: 380, y: 70 },
            { id: "z5", x: 520, y: 70 },
        ];
        const ed = [["b2", "a1"], ["x3", "a1"], ["y4", "x3"], ["z5", "y4"]];

        frames.push({
            stage: dagHTML(W, H, [...trunk, ...feat], ed, [
                { at: "b2", label: "main", dy: 46 },
                { at: "z5", label: "feature", dy: -50 },
            ]),
            note: "A long-running <code>feature</code> branch. Commit <code>y4</code> happens to fix a production bug, and you need that fix on <code>main</code> today.",
        });
        frames.push({
            stage: dagHTML(W, H, [...trunk, ...feat.map((c) => ({ ...c, state: c.id === "y4" ? "n-act" : "n-idle" }))], ed, [
                { at: "b2", label: "main", state: "n-act", dy: 46 },
                { at: "z5", label: "feature", dy: -50 },
            ]),
            note: "From <code>main</code>, run <code>git cherry-pick y4</code>. Git computes the diff between <code>y4</code> and its parent <code>x3</code>.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...trunk, ...feat, { id: "y4'", x: 380, y: 170, state: "n-done" }],
                [...ed, ["y4'", "b2", "e-done"]],
                [
                    { at: "y4'", label: "main", state: "n-done", dy: 46 },
                    { at: "z5", label: "feature", dy: -50 },
                ]
            ),
            note: "That patch is applied on top of <code>b2</code> as a <b>new commit with a new id</b>. Same change, different parent, different hash.",
        });
        frames.push({
            stage: dagHTML(
                W,
                H,
                [...trunk, ...feat, { id: "y4'", x: 380, y: 170 }],
                [...ed, ["y4'", "b2"]],
                [{ at: "y4'", label: "main", dy: 46 }, { at: "z5", label: "feature", dy: -50 }]
            ),
            note: "The change now exists twice. When <code>feature</code> is finally merged, Git usually notices the identical patch and merges cleanly &mdash; usually.",
        });
        frames.push({
            stage: codeHTML([
                "git cherry-pick y4              # one commit",
                "git cherry-pick x3..z5          # a range, exclusive of x3",
                "git cherry-pick -x y4           # record 'cherry picked from ...'",
                "git cherry-pick -n y4           # apply but do not commit",
                "git cherry                      # list commits not yet upstream",
            ], { 2: "is-done" }),
            note: "Use <code>-x</code> on release branches: the trailer it adds is how a future maintainer works out where a backport came from. Cherry-picking dozens of commits is a sign you wanted <code>rebase --onto</code>.",
        });
        return frames;
    },
};

/* ---- 15. Stash ---- */

VIZ["stash-flow"] = {
    title: "Stash: a stack of commits with no branch",
    legend: [["lg-act", "in flight"], ["lg-done", "restored"], ["lg-out", "cleared"], ["lg-idle", "idle"]],
    build() {
        const frames = [];
        const push = (w, stack, note) =>
            frames.push({
                stage: panesHTML([
                    { title: "Working tree", items: w, empty: "clean" },
                    { title: "refs/stash", items: stack, stack: true, empty: "empty" },
                ]),
                note,
            });

        push([{ text: "app.py edited", cls: "is-act" }, { text: "new.py untracked", cls: "is-ghost" }], [], "Half-finished work on disk, and an urgent bug arrives on another branch. Switching now would carry the mess with you.");
        push([{ text: "app.py edited", cls: "is-act" }, { text: "new.py untracked", cls: "is-ghost" }], [], "<code>git stash push -m \"wip parser\"</code>. Git makes real commit objects for the index and the working tree, then resets you to HEAD.");
        push([], [{ text: "stash@{0} wip parser", cls: "is-act" }], "Clean tree. The stash is a <b>stack</b> under <code>refs/stash</code>, and <code>stash@{0}</code> is the newest entry. Note <code>new.py</code> was <em>not</em> stashed &mdash; untracked files need <code>-u</code>.");
        push([{ text: "hotfix edit", cls: "is-cmp" }], [{ text: "stash@{0} wip parser" }], "You fix the bug, commit, and come back. A second <code>git stash</code> would push onto the same stack as <code>stash@{0}</code>, demoting this one to <code>stash@{1}</code>.");
        push([{ text: "app.py edited", cls: "is-done" }], [{ text: "stash@{0} wip parser" }], "<code>git stash apply</code> replays the change onto your working tree and <b>keeps</b> the entry &mdash; safe if the apply conflicts.");
        push([{ text: "app.py edited", cls: "is-done" }], [{ text: "stash@{0}", cls: "is-out" }], "<code>git stash pop</code> is apply plus drop. If it conflicts, the entry is kept, which surprises people who expect it gone.");
        push([{ text: "app.py edited", cls: "is-done" }], [], "Useful flags: <code>-u</code> includes untracked files, <code>-p</code> stashes hunks interactively, <code>git stash branch fix</code> creates a branch from the entry when the base has moved on.");
        push([{ text: "app.py edited" }], [], "Stashes are unreachable commits with no branch, so <code>git stash clear</code> throws away work that only <code>git fsck --unreachable</code> can find. Prefer a real throwaway branch for anything you care about.");
        return frames;
    },
};

/* ---- 16. Reflog rescue ---- */

VIZ["reflog-rescue"] = {
    title: "reflog: the undo history Git keeps for you",
    legend: [["lg-act", "HEAD now"], ["lg-out", "unreachable"], ["lg-done", "recovered"], ["lg-idle", "existing"]],
    build() {
        const frames = [];
        const W = 660;
        const H = 200;
        const ids = ["a1", "b2", "c3", "d4"];
        const row = (states = {}) => ids.map((id, i) => ({ id, x: 100 + i * 140, y: 120, state: states[id] || "n-idle" }));
        const ed = [["b2", "a1"], ["c3", "b2"], ["d4", "c3"]];

        frames.push({
            stage: dagHTML(W, H, row(), ed, [{ at: "d4", label: "main", state: "n-act", dy: -58 }]),
            note: "Four commits, two days of work. You mean to type <code>git reset --hard HEAD~1</code>.",
        });
        frames.push({
            stage: dagHTML(W, H, row({ c3: "n-out", d4: "n-out" }), ed, [{ at: "b2", label: "main", state: "n-act", dy: -58 }]),
            note: "You type <code>HEAD~3</code> instead. Two commits are now unreferenced, the working tree matches <code>b2</code>, and <code>git log</code> shows no sign of them.",
        });
        frames.push({
            stage: codeHTML([
                "$ git reflog",
                "b2  HEAD@{0}: reset: moving to HEAD~3",
                "d4  HEAD@{1}: commit: add retry logic",
                "c3  HEAD@{2}: commit: extract client",
                "b2  HEAD@{3}: commit: parse config",
            ], { 2: "is-act" }),
            note: "<code>git reflog</code> is a local journal of every value HEAD has held. It records moves, not commits &mdash; so a reset that &lsquo;lost&rsquo; work still leaves the old id here.",
        });
        frames.push({
            stage: dagHTML(W, H, row({ d4: "n-done" }), ed, [{ at: "d4", label: "main", state: "n-done", dy: -58 }]),
            note: "<code>git reset --hard HEAD@{1}</code> puts the branch back. Total elapsed time: about fifteen seconds.",
        });
        frames.push({
            stage: codeHTML([
                "git reflog show feature        # per-branch reflog, not just HEAD",
                "git reset --hard HEAD@{1}      # undo the last HEAD move",
                "git branch rescue d4           # give an orphan commit a name",
                "git fsck --lost-found          # objects even the reflog forgot",
            ], { 1: "is-done", 2: "is-done" }),
            note: "Caveats that matter: the reflog is <b>local only</b> (it is never cloned or pushed), entries expire after 90 days (30 for unreachable ones), and it cannot recover uncommitted, unstaged edits.",
        });
        return frames;
    },
};
/* ---- 17. The remote model ---- */

VIZ["remote-model"] = {
    title: "Remote-tracking branches: your cached copy of their state",
    legend: [["lg-act", "just moved"], ["lg-done", "in sync"], ["lg-cmp", "stale"], ["lg-idle", "idle"]],
    build() {
        const frames = [];
        const push = (local, tracking, remote, note) =>
            frames.push({
                stage: panesHTML([
                    { title: "main (yours)", items: local },
                    { title: "origin/main (cache)", items: tracking },
                    { title: "origin server", items: remote },
                ]),
                note,
            });

        push([{ text: "c3" }], [{ text: "c3" }], [{ text: "c3" }], "Just after a clone, all three agree. Three <em>different</em> things agree &mdash; that is the distinction most Git confusion hides in.");
        push([{ text: "c4", cls: "is-act" }], [{ text: "c3" }], [{ text: "c3" }], "You commit. Only your local branch moved; <code>git status</code> says <em>ahead by 1</em> by comparing it to the cache.");
        push([{ text: "c4" }], [{ text: "c3", cls: "is-cmp" }], [{ text: "c5", cls: "is-act" }], "A colleague pushes <code>c5</code>. Your machine has <b>no idea</b> &mdash; nothing about Git polls the server. <code>origin/main</code> is now stale and silently wrong.");
        push([{ text: "c4" }], [{ text: "c5", cls: "is-act" }], [{ text: "c5" }], "<code>git fetch</code> downloads the new objects and updates <code>origin/main</code>. It never touches your branch or your working tree &mdash; fetch is always safe.");
        push([{ text: "c4" }], [{ text: "c5" }], [{ text: "c5" }], "Now <code>git status</code> can tell the truth: <em>diverged, 1 and 1</em>. <code>git log --oneline main..origin/main</code> shows exactly what arrived.");
        push([{ text: "m6", cls: "is-done" }], [{ text: "c5" }], [{ text: "c5" }], "<code>git merge origin/main</code> (or <code>rebase</code>) reconciles locally. Still nothing has been sent anywhere.");
        push([{ text: "m6" }], [{ text: "m6", cls: "is-done" }], [{ text: "m6", cls: "is-done" }], "<code>git push</code> uploads and, if the server accepts, updates <code>origin/main</code> to match. <code>origin/main</code> only ever moves on fetch or a successful push.");
        push([{ text: "m6" }], [{ text: "m6" }], [{ text: "m6" }], "So <code>origin/main</code> is not the server &mdash; it is your last known photograph of it. Treat it as read-only and half of remote confusion disappears.");
        return frames;
    },
};

/* ---- 18. fetch / pull / push ---- */

VIZ["fetch-pull-push"] = {
    title: "What fetch, pull and push each move",
    legend: [["lg-act", "moved now"], ["lg-done", "result"], ["lg-cmp", "downloaded"], ["lg-idle", "unchanged"]],
    options: [
        { value: "fetch", label: "git fetch" },
        { value: "merge", label: "git pull" },
        { value: "rebase", label: "git pull --rebase" },
        { value: "push", label: "git push" },
    ],
    build(option) {
        const mode = option || "fetch";
        const frames = [];
        const W = 660;
        const H = 320;

        const shared = [
            { id: "a1", x: 100, y: 160 },
            { id: "b2", x: 230, y: 160 },
        ];
        const mine = { id: "c3", x: 360, y: 240 };
        const theirs = { id: "d4", x: 360, y: 70 };
        const ed = [["b2", "a1"], ["c3", "b2"], ["d4", "b2"]];

        const start = (refs, states = {}) =>
            dagHTML(
                W,
                H,
                [...shared, mine, theirs].map((c) => ({ ...c, state: states[c.id] || "n-idle" })),
                ed,
                refs
            );

        if (mode === "fetch") {
            frames.push({
                stage: start([{ at: "c3", label: "main", state: "n-act", dy: 40 }, { at: "b2", label: "origin/main", dy: -50 }], { d4: "n-out" }),
                note: "You have <code>c3</code>. The server has <code>d4</code>, but your <code>origin/main</code> still says <code>b2</code>, so your repo cannot even see it yet.",
            });
            frames.push({
                stage: start([{ at: "c3", label: "main", dy: 40 }, { at: "b2", label: "origin/main", state: "n-cmp", dy: -50 }], { d4: "n-cmp" }),
                note: "<code>git fetch</code> opens a connection, negotiates which objects you are missing, and downloads <code>d4</code> plus its trees and blobs.",
            });
            frames.push({
                stage: start([{ at: "c3", label: "main", dy: 40 }, { at: "d4", label: "origin/main", state: "n-act", dy: -50 }], {}),
                note: "Only the remote-tracking ref moves. Your branch, index and working tree are byte-for-byte unchanged &mdash; <code>fetch</code> cannot cause a conflict or lose work.",
            });
            frames.push({
                stage: start([{ at: "c3", label: "main", dy: 40 }, { at: "d4", label: "origin/main", dy: -50 }], {}),
                note: "This is why <code>git fetch &amp;&amp; git log --oneline HEAD..origin/main</code> is the right way to start the day: look before you integrate.",
            });
            return frames;
        }

        if (mode === "push") {
            frames.push({
                stage: start([{ at: "c3", label: "main", state: "n-act", dy: 40 }, { at: "b2", label: "origin/main", dy: -50 }], { d4: "n-out" }),
                note: "<code>git push</code> is the mirror image of fetch: you upload objects and ask the server to move <em>its</em> branch.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, { ...mine, state: "n-out" }],
                    [["b2", "a1"], ["c3", "b2"]],
                    [{ at: "c3", label: "main", state: "n-out", dy: 40 }, { at: "b2", label: "origin/main", dy: -50 }]
                ),
                note: "The server refuses: its tip <code>d4</code> is not an ancestor of your <code>c3</code>, so accepting would <b>lose</b> <code>d4</code>. That is the <em>non-fast-forward</em> rejection.",
            });
            frames.push({
                stage: start([{ at: "c3", label: "main", dy: 40 }, { at: "d4", label: "origin/main", state: "n-act", dy: -50 }], {}),
                note: "The fix is never <code>--force</code> on a shared branch. Fetch first, integrate, and try again.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, mine, theirs, { id: "m5", x: 520, y: 160, state: "n-done" }],
                    [...ed, ["m5", "c3", "e-done"], ["m5", "d4", "e-done"]],
                    [{ at: "m5", label: "main", state: "n-done", dy: 40 }, { at: "m5", label: "origin/main", state: "n-done", dy: -50 }]
                ),
                note: "Now your tip contains theirs, the push fast-forwards the server, and Git updates <code>origin/main</code> to match. If you truly must overwrite, <code>--force-with-lease</code> refuses unless the server is still where you last saw it.",
            });
            return frames;
        }

        /* pull = fetch + integrate */
        frames.push({
            stage: start([{ at: "c3", label: "main", state: "n-act", dy: 40 }, { at: "b2", label: "origin/main", dy: -50 }], { d4: "n-out" }),
            note: "<code>git pull</code> is not a primitive. It is <code>git fetch</code> followed by a second command, and the second command is configurable.",
        });
        frames.push({
            stage: start([{ at: "c3", label: "main", dy: 40 }, { at: "d4", label: "origin/main", state: "n-act", dy: -50 }], {}),
            note: "Step one is always the same fetch: download objects, move <code>origin/main</code>.",
        });
        if (mode === "merge") {
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, mine, theirs, { id: "m5", x: 520, y: 160, state: "n-done" }],
                    [...ed, ["m5", "c3", "e-done"], ["m5", "d4", "e-done"]],
                    [{ at: "m5", label: "main", state: "n-done", dy: 40 }, { at: "d4", label: "origin/main", dy: -50 }]
                ),
                note: "Step two, the default, is <code>git merge origin/main</code>: a merge commit with two parents. Your <code>c3</code> keeps its id.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, mine, theirs, { id: "m5", x: 520, y: 160 }],
                    [...ed, ["m5", "c3"], ["m5", "d4"]],
                    [{ at: "m5", label: "main", dy: 40 }, { at: "d4", label: "origin/main", dy: -50 }]
                ),
                note: "Safe, but on a busy branch it fills history with &lsquo;Merge branch main of&hellip;&rsquo; commits that record nothing anyone wants to read.",
            });
        } else {
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, { ...mine, state: "n-out" }, theirs, { id: "c3'", x: 500, y: 70, state: "n-done" }],
                    [...ed, ["c3'", "d4", "e-done"]],
                    [{ at: "c3'", label: "main", state: "n-done", dy: -50 }, { at: "d4", label: "origin/main", dy: 46 }]
                ),
                note: "Step two with <code>--rebase</code> replays <em>your</em> commits on top of theirs. <code>c3'</code> is a new commit; the original <code>c3</code> is abandoned.",
            });
            frames.push({
                stage: dagHTML(
                    W,
                    H,
                    [...shared, theirs, { id: "c3'", x: 500, y: 70 }],
                    [["b2", "a1"], ["d4", "b2"], ["c3'", "d4"]],
                    [{ at: "c3'", label: "main", dy: -50 }, { at: "d4", label: "origin/main", dy: 46 }]
                ),
                note: "Linear history, no merge noise. Safe here because <code>c3</code> had never been pushed. Set it once with <code>git config --global pull.rebase true</code>.",
            });
        }
        frames.push({
            stage: codeHTML([
                "git config --global pull.ff only     # refuse to guess; you decide",
                "git config --global pull.rebase true # rebase local work on pull",
                "git fetch && git log --oneline HEAD..@{u}   # look before you leap",
            ], { 2: "is-done" }),
            note: "Pick a policy explicitly. Modern Git refuses to run a bare <code>git pull</code> on diverged branches until you do &mdash; that warning is a feature.",
        });
        return frames;
    },
};

/* ---- 19. Bisect ---- */

VIZ["bisect"] = {
    title: "bisect: binary search over history",
    legend: [["lg-done", "known good"], ["lg-out", "known bad"], ["lg-act", "testing now"], ["lg-idle", "unknown"]],
    build() {
        const frames = [];
        const ids = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13", "c14", "c15", "c16"];
        const push = (marks, tags, note) => frames.push({ stage: cellsHTML(ids, marks, tags), note });

        push({}, {}, "Sixteen commits since the last release, and the test suite passes on <code>c1</code> but fails on <code>c16</code>. Somewhere in between, something broke.");
        push({ 0: "is-done", 15: "is-out" }, { 0: "good", 15: "bad" }, "<code>git bisect start; git bisect good c1; git bisect bad c16</code>. Two known points define the search window.");
        push({ 0: "is-done", 15: "is-out", 7: "is-active" }, { 0: "good", 15: "bad", 7: "test" }, "Git checks out the middle commit, <code>c8</code>, and hands your working tree to you. One test now eliminates half the range.");
        push({ 0: "is-done", 7: "is-done", 15: "is-out" }, { 7: "good", 15: "bad" }, "It passes, so you run <code>git bisect good</code>. Everything at or before <code>c8</code> is cleared &mdash; eight candidates gone in one step.");
        push({ 7: "is-done", 15: "is-out", 11: "is-active" }, { 7: "good", 15: "bad", 11: "test" }, "Git jumps to <code>c12</code>. Note it never asks about commits it has already ruled out.");
        push({ 7: "is-done", 11: "is-out", 15: "is-out" }, { 7: "good", 11: "bad" }, "It fails: <code>git bisect bad</code>. The window is now <code>c9</code>&ndash;<code>c12</code>.");
        push({ 7: "is-done", 9: "is-active", 11: "is-out" }, { 9: "test", 11: "bad" }, "Two more rounds narrow it to a single commit. Sixteen candidates take <code>log2(16) = 4</code> tests; ten thousand take fourteen.");
        push({ 10: "is-out" }, { 10: "first bad" }, "<code>c11 is the first bad commit</code>. Git prints the full commit &mdash; author, message, diff &mdash; and <code>git bisect reset</code> returns you to where you started.");
        push({ 10: "is-out" }, { 10: "first bad" }, "The real win is automation: <code>git bisect run ./test.sh</code>. Exit 0 means good, 1&ndash;124 means bad, <b>125 means skip</b> this commit &mdash; use it when a commit will not build.");
        return frames;
    },
};

/* ---- 20. Branching strategies ---- */

VIZ["branching-strategies"] = {
    title: "Three ways teams arrange branches",
    legend: [["lg-act", "trunk"], ["lg-done", "release"], ["lg-cmp", "feature"], ["lg-out", "long-lived"]],
    options: [
        { value: "trunk", label: "Trunk-based" },
        { value: "github", label: "GitHub Flow" },
        { value: "gitflow", label: "Git Flow" },
    ],
    build(option) {
        const mode = option || "trunk";
        const W = 640;
        const ticks = [
            { at: 0, label: "Mon" },
            { at: 0.25, label: "Tue" },
            { at: 0.5, label: "Wed" },
            { at: 0.75, label: "Thu" },
            { at: 1, label: "Fri" },
        ];
        const frames = [];
        const push = (lanes, now, note) => frames.push({ stage: timelineHTML(W, lanes, ticks, now), note });

        if (mode === "trunk") {
            push([{ label: "main", marks: [{ at: 0, label: "", state: "n-act" }] }], 0, "<b>Trunk-based development.</b> One long-lived branch. Everyone integrates into it at least once a day.");
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }] },
                    { label: "short branch", marks: [{ at: 0.1, label: "a few hours", state: "n-cmp", width: 0.15 }] },
                ],
                0.25,
                "Branches exist, but they live hours, not weeks. A branch that never ages never diverges far enough to conflict badly."
            );
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }, { at: 0.28, label: "", state: "n-done" }] },
                    { label: "short branch", marks: [{ at: 0.1, label: "merged", state: "n-cmp", width: 0.15 }] },
                ],
                0.35,
                "Merged the same day, behind a feature flag if the work is incomplete. <b>Flags replace long branches.</b>"
            );
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }, { at: 0.28, label: "", state: "n-done" }, { at: 0.55, label: "", state: "n-done" }, { at: 0.8, label: "", state: "n-done" }] },
                    { label: "short branch", marks: [{ at: 0.45, label: "hours", state: "n-cmp", width: 0.09 }, { at: 0.7, label: "hours", state: "n-cmp", width: 0.09 }] },
                    { label: "releases", marks: [{ at: 0.3, label: "deploy", state: "n-done" }, { at: 0.6, label: "deploy", state: "n-done" }, { at: 0.9, label: "deploy", state: "n-done" }] },
                ],
                1,
                "Main is always releasable, so deploying is a routine event rather than an operation. This is the pattern the DORA research associates with the highest performers."
            );
            return frames;
        }

        if (mode === "github") {
            push([{ label: "main", marks: [{ at: 0, label: "", state: "n-act" }] }], 0, "<b>GitHub Flow.</b> One protected <code>main</code>, plus a branch per change &mdash; the default for most teams and every open-source project.");
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }] },
                    { label: "feature/x", marks: [{ at: 0.12, label: "branch", state: "n-cmp", width: 0.25 }] },
                ],
                0.3,
                "Branch from <code>main</code>, commit, push, open a pull request. The PR is where review and CI happen."
            );
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }, { at: 0.42, label: "merge", state: "n-done" }] },
                    { label: "feature/x", marks: [{ at: 0.12, label: "PR", state: "n-cmp", width: 0.25 }] },
                    { label: "feature/y", marks: [{ at: 0.35, label: "branch", state: "n-cmp", width: 0.3 }] },
                ],
                0.5,
                "Merge after approval, delete the branch, deploy from <code>main</code>. Squash-merge keeps <code>main</code> one commit per change; merge commits keep the detail."
            );
            push(
                [
                    { label: "main", marks: [{ at: 0, label: "", state: "n-act" }, { at: 0.42, label: "merge", state: "n-done" }, { at: 0.72, label: "merge", state: "n-done" }] },
                    { label: "feature/x", marks: [{ at: 0.12, label: "PR", state: "n-cmp", width: 0.25 }] },
                    { label: "feature/y", marks: [{ at: 0.35, label: "PR", state: "n-cmp", width: 0.3 }] },
                ],
                1,
                "The failure mode is branch age: a PR open for two weeks is a merge conflict with a countdown timer. Keep them small enough to review in one sitting."
            );
            return frames;
        }

        push(
            [
                { label: "main", marks: [{ at: 0, label: "v1.0", state: "n-done" }] },
                { label: "develop", marks: [{ at: 0, label: "", state: "n-act", width: 1 }] },
            ],
            0,
            "<b>Git Flow.</b> Two permanent branches: <code>main</code> holds releases only, <code>develop</code> holds integration."
        );
        push(
            [
                { label: "main", marks: [{ at: 0, label: "v1.0", state: "n-done" }] },
                { label: "develop", marks: [{ at: 0, label: "", state: "n-act", width: 1 }] },
                { label: "feature/*", marks: [{ at: 0.1, label: "weeks", state: "n-cmp", width: 0.4 }] },
            ],
            0.4,
            "Features branch off <code>develop</code> and merge back. They routinely live for weeks, which is where the conflicts come from."
        );
        push(
            [
                { label: "main", marks: [{ at: 0, label: "v1.0", state: "n-done" }] },
                { label: "develop", marks: [{ at: 0, label: "", state: "n-act", width: 1 }] },
                { label: "feature/*", marks: [{ at: 0.1, label: "weeks", state: "n-cmp", width: 0.4 }] },
                { label: "release/*", marks: [{ at: 0.55, label: "stabilise", state: "n-out", width: 0.2 }] },
            ],
            0.7,
            "A <code>release/*</code> branch freezes scope while bugs are fixed, then merges into <b>both</b> <code>main</code> and <code>develop</code> &mdash; every fix must be merged twice."
        );
        push(
            [
                { label: "main", marks: [{ at: 0, label: "v1.0", state: "n-done" }, { at: 0.78, label: "v1.1", state: "n-done" }] },
                { label: "develop", marks: [{ at: 0, label: "", state: "n-act", width: 1 }] },
                { label: "feature/*", marks: [{ at: 0.1, label: "weeks", state: "n-cmp", width: 0.4 }] },
                { label: "hotfix/*", marks: [{ at: 0.85, label: "hotfix", state: "n-out", width: 0.1 }] },
            ],
            1,
            "<code>hotfix/*</code> branches off <code>main</code> and also merges to both. Git Flow fits versioned software with supported releases; for a web service shipped daily it is mostly overhead."
        );
        return frames;
    },
};

/* ---- 21. Loose objects and packfiles ---- */

VIZ["packfile"] = {
    title: "Why a repo full of snapshots is not enormous",
    legend: [["lg-act", "being packed"], ["lg-done", "packed"], ["lg-cmp", "delta"], ["lg-idle", "loose"]],
    build() {
        const frames = [];
        const push = (loose, pack, note) =>
            frames.push({
                stage: panesHTML([
                    { title: ".git/objects (loose)", items: loose, empty: "none" },
                    { title: ".git/objects/pack", items: pack, empty: "none" },
                ]),
                note,
            });

        const loose4 = [
            { text: "3b18e51 blob 14 KB" },
            { text: "802992c blob 14 KB" },
            { text: "a042389 blob 14 KB" },
            { text: "1a1ba4a tree" },
        ];

        push(loose4, [], "Each commit stores a <em>complete</em> snapshot, so editing one line of a 14&nbsp;KB file writes another whole 14&nbsp;KB blob. Naively that is ruinous.");
        push(loose4, [], "First saving grace: every loose object is zlib-compressed on the way to disk. Text typically shrinks by two thirds before anything clever happens.");
        push(loose4.map((o) => ({ ...o, cls: "is-act" })), [], "<code>git gc</code> &mdash; run automatically after enough loose objects accumulate &mdash; collects them into a single packfile.");
        push([], [{ text: "pack-a1b2 (3 objects)", cls: "is-done" }, { text: "3b18e51 full", cls: "is-done" }, { text: "802992c delta", cls: "is-cmp" }, { text: "a042389 delta", cls: "is-cmp" }], "Inside the pack, similar objects are stored as <b>deltas</b> against each other: one full copy plus tiny difference records.");
        push([], [{ text: "pack-a1b2.pack", cls: "is-done" }, { text: "pack-a1b2.idx", cls: "is-done" }], "A sibling <code>.idx</code> file maps each object id to an offset, so lookup stays O(1) even though the data is a delta chain.");
        push([], [{ text: "pack-a1b2.pack", cls: "is-done" }, { text: "pack-a1b2.idx", cls: "is-done" }], "Crucially the delta pairing is chosen by <em>similarity and size</em>, not by commit order. A rename is cheap because the content matches, which is also how Git detects renames it never recorded.");
        push([{ text: "new commits", cls: "is-act" }], [{ text: "pack-a1b2.pack", cls: "is-done" }], "New work lands loose again and is repacked later. <code>git count-objects -vH</code> shows the split; <code>git gc --aggressive</code> repacks from scratch and is rarely worth the time.");
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
