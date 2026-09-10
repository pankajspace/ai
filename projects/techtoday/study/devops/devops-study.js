/* ==========================================================================
   TechToday - DevOps study guide
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
        "readonly return set unset source sudo trap exec").split(" ")
);
const SH_BUILTIN = new Set(
    ("echo cat grep awk sed cut sort uniq head tail wc curl jq mkdir cd ls rm cp mv chmod xargs " +
        "docker podman compose kubectl helm kustomize argocd flux terraform ansible packer vault " +
        "git gh make python pip node npm npx pytest ruff trivy cosign syft skopeo systemctl journalctl " +
        "aws gcloud az ssh scp rsync watch base64 openssl date env printenv trap kill nc dig").split(" ")
);
/* Kubernetes manifests, Compose files and GitHub Actions workflows. */
const YAML_KW = new Set("true false null yes no on off".split(" "));
const YAML_BUILTIN = new Set(
    ("apiVersion kind metadata spec status name namespace labels annotations selector matchLabels " +
        "template containers image ports containerPort env envFrom valueFrom configMapKeyRef " +
        "secretKeyRef resources requests limits cpu memory replicas strategy type rollingUpdate " +
        "maxSurge maxUnavailable livenessProbe readinessProbe startupProbe httpGet path port " +
        "initialDelaySeconds periodSeconds failureThreshold volumes volumeMounts mountPath " +
        "serviceAccountName securityContext runAsNonRoot imagePullPolicy nodeSelector tolerations " +
        "affinity data stringData rules host http backend service targetPort clusterIP " +
        "jobs steps uses with runs-on needs permissions concurrency strategy matrix " +
        "services build context dockerfile depends_on healthcheck restart networks").split(" ")
);
const JSON_KW = new Set("true false null".split(" "));
const JSON_BUILTIN = new Set(
    ("name version scripts dependencies devDependencies engines main type files " +
        "apiVersion kind metadata spec status resource provider module variable output locals " +
        "predicate subject digest sha256 builder buildType invocation materials").split(" ")
);
/* Terraform / HCL. */
const HCL_KW = new Set(
    ("resource data provider variable output module locals terraform backend true false null " +
        "for_each count depends_on lifecycle dynamic provisioner required_providers if else").split(" ")
);
const HCL_BUILTIN = new Set(
    ("var local each type default description sensitive value source version tags name " +
        "file templatefile jsonencode lookup merge concat length toset tolist coalesce try").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
    yaml: [YAML_KW, YAML_BUILTIN],
    json: [JSON_KW, JSON_BUILTIN],
    hcl: [HCL_KW, HCL_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python" || lang === "bash" || lang === "yaml" || lang === "hcl";
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
    yaml: "YAML",
    hcl: "Terraform",
    json: "JSON",
    python: "Python",
    javascript: "JavaScript",
    text: "Output",
};
const LANG_KEY = "tt-devops-lang";
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
   DevOps widgets
   ========================================================================== */

/* Repeat a state n times - most frames mark "everything up to here is done". */
const runOf = (n, state = "n-done") => Array.from({ length: n }, () => state);

/* ---- 1. The delivery loop ---- */

VIZ["feedback-loop"] = {
    title: "The delivery loop — and where the time actually goes",
    legend: [["lg-act", "working now"], ["lg-done", "finished"], ["lg-out", "stalled"], ["lg-idle", "not reached"]],
    build() {
        const W = 760;
        const H = 235;
        const STAGES = ["Plan", "Code", "Build", "Test", "Release", "Operate"];
        const xOf = (i) => 35 + i * 118;
        const draw = (states = [], feedback = "e-idle", extra = "") => {
            let s = "";
            STAGES.forEach((label, i) => {
                s += boxHTML(xOf(i), 58, 100, 44, label, states[i] || "n-idle");
                if (i < STAGES.length - 1) {
                    const on = states[i] && states[i] !== "n-idle" ? "e-done" : "e-idle";
                    s += arrowHTML(xOf(i) + 100, 80, xOf(i + 1) - 4, 80, on);
                }
            });
            s += pathHTML(`M ${xOf(5) + 50} 110 L ${xOf(5) + 50} 172 L ${xOf(0) + 50} 172 L ${xOf(0) + 50} 130`, feedback);
            s += arrowHTML(xOf(0) + 50, 150, xOf(0) + 50, 108, feedback);
            s += capHTML(W / 2, 194, "feedback — what production actually did with the change");
            return svgHTML(W, H, s + extra);
        };
        const f = [];
        f.push({
            stage: draw(),
            note: "DevOps is not a tool and not a job title. It is a claim about a <b>loop</b>: an idea becomes code, code becomes a running system, the running system tells you something, and that something changes the next idea. Every practice in this course exists to make one lap of this loop faster or safer.",
        });
        f.push({
            stage: draw(["n-act"]),
            note: "<b>Plan.</b> Someone decides what to build. The only DevOps question here is <em>how big is the piece</em> — because the size of the change you commit determines almost everything that follows.",
        });
        f.push({
            stage: draw([...runOf(1), "n-act"]),
            note: "<b>Code.</b> A change is written and pushed to version control. Nothing exists for the rest of the pipeline until it is in Git — this is why <em>the repository is the source of truth</em> is the first rule and not a slogan.",
        });
        f.push({
            stage: draw([...runOf(2), "n-act"]),
            note: "<b>Build.</b> Source becomes an <b>artifact</b>: a container image, a jar, a binary. It happens exactly once, and the thing it produces is immutable and addressable by digest. Everything downstream refers to that digest.",
        });
        f.push({
            stage: draw([...runOf(3), "n-act"]),
            note: "<b>Test.</b> Automated checks decide whether the artifact may proceed. Note that they test the artifact you will actually ship, not a rebuild of it — a distinction that quietly prevents a whole class of \"works in CI\" bugs.",
        });
        f.push({
            stage: draw([...runOf(4), "n-act"]),
            note: "<b>Release.</b> The artifact is placed in front of users. Rolling, blue-green, canary — the strategy differs, but all of them are answers to one question: <em>how do we limit the number of users who see this if it is wrong?</em>",
        });
        f.push({
            stage: draw([...runOf(5), "n-act"]),
            note: "<b>Operate.</b> The system runs, and it emits logs, metrics and traces. This is the stage most teams treat as an ending. It is not — it is where the data lives.",
        });
        f.push({
            stage: draw(runOf(6), "e-act"),
            note: "<b>And here is the loop closing.</b> What operations learns changes what gets planned. If this arrow is missing you do not have DevOps, you have a deployment script: you ship changes, and you find out whether they were good ideas from a support ticket six weeks later.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-out", "n-idle", "n-idle", "n-idle"], "e-idle"),
            note: "<b>Now the realistic picture.</b> The loop is only as fast as its slowest link. A build that takes forty minutes, a test suite nobody trusts, a release that needs a change-approval board on Tuesdays — any one of these sets the pace for the entire organisation, no matter how fast the other five stages are.",
        });
        f.push({
            stage: timelineHTML(700, [
                {
                    label: "Big batch", marks: [
                        { at: 0.0, width: 0.5, label: "12 weeks of unmerged work", state: "n-out" },
                        { at: 0.52, width: 0.14, label: "integrate", state: "n-cmp" },
                        { at: 0.68, width: 0.2, label: "test + fix", state: "n-cmp" },
                        { at: 0.9, width: 0.08, label: "ship", state: "n-act" },
                    ],
                },
                {
                    label: "Small batch", marks: [
                        { at: 0.0, width: 0.06, label: "", state: "n-done" },
                        { at: 0.08, width: 0.06, label: "", state: "n-done" },
                        { at: 0.16, width: 0.06, label: "", state: "n-done" },
                        { at: 0.24, width: 0.06, label: "", state: "n-done" },
                        { at: 0.32, width: 0.06, label: "", state: "n-done" },
                        { at: 0.4, width: 0.06, label: "", state: "n-done" },
                    ],
                },
            ], [{ at: 0, label: "day 0" }, { at: 0.5, label: "week 12" }, { at: 1, label: "week 24" }]),
            note: "<b>Batch size is the lever.</b> The same amount of work, shipped in one lump or in daily slices. The lump spends most of its life <em>not being verified</em>, and when it finally integrates, every problem arrives at once and none of them can be attributed to a single change. Small batches are not about being agile; they are about keeping the blast radius of a mistake equal to one change.",
        });
        f.push({
            stage: panesHTML([
                { title: "Throughput — how fast", items: [{ text: "Deployment frequency", cls: "is-act" }, { text: "elite: on demand", cls: "is-done" }, { text: "Lead time for change", cls: "is-act" }, { text: "elite: under one hour", cls: "is-done" }] },
                { title: "Stability — how safe", items: [{ text: "Change failure rate", cls: "is-act" }, { text: "elite: under 15%", cls: "is-done" }, { text: "Time to restore", cls: "is-act" }, { text: "elite: under one hour", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> These are the four DORA metrics, and the finding that made them famous is that speed and safety are <em>not</em> a trade-off: the teams that deploy most often also break production least often. That is only possible because both come from the same cause — small changes, verified automatically, released reversibly. Every section of this course is one of those three words.",
        });
        return f;
    },
};

/* ---- 2. Branching strategy ---- */

VIZ["branching"] = {
    title: "Where the merge pain comes from",
    legend: [["lg-act", "new commit"], ["lg-done", "on main"], ["lg-cmp", "on a branch"], ["lg-out", "conflict"]],
    options: [
        { value: "long-lived", label: "A long-lived feature branch" },
        { value: "trunk", label: "Trunk-based development" },
    ],
    build(option = "long-lived") {
        const W = 720;
        const H = 240;
        const x0 = 60;
        const dx = 62;
        const draw = (mainN, mainStates, branch, extra = "") => {
            let s = capHTML(24, 78, "main", "start");
            for (let i = 0; i < mainN; i += 1) {
                if (i > 0) s += edgeHTML(x0 + (i - 1) * dx, 100, x0 + i * dx, 100, "e-done");
                s += nodeHTML(x0 + i * dx, 100, String(i), mainStates[i] || "n-done", 15);
            }
            if (branch) {
                s += capHTML(24, 168, "feature", "start");
                s += edgeHTML(x0 + branch.from * dx, 108, x0 + (branch.from + 1) * dx - 8, 182, "e-act");
                for (let i = 0; i < branch.states.length; i += 1) {
                    const bx = x0 + (branch.from + 1 + i) * dx;
                    if (i > 0) s += edgeHTML(bx - dx, 190, bx, 190, "e-act");
                    s += nodeHTML(bx, 190, branch.labels ? branch.labels[i] : "f" + (i + 1), branch.states[i], 15);
                }
            }
            return svgHTML(W, H, s + extra);
        };
        const f = [];

        if (option === "trunk") {
            f.push({
                stage: draw(3, runOf(3), null),
                note: "Trunk-based development: there is one long-lived branch, <code>main</code>, and it is always releasable. Three commits are on it.",
            });
            f.push({
                stage: draw(3, runOf(3), { from: 2, states: ["n-act"], labels: ["a1"] }),
                note: "A developer branches off <code>main</code> to write a change. The branch is real — you still get review and CI on a pull request — but it is measured in <em>hours</em>, not weeks.",
            });
            f.push({
                stage: draw(4, [...runOf(3), "n-act"], null),
                note: "Merged the same day. Because the branch was one commit old, the merge is trivial: nothing else moved underneath it.",
            });
            f.push({
                stage: draw(7, [...runOf(4), "n-act", "n-act", "n-act"], null),
                note: "Repeat. Three developers, three small merges, all in one day. Each merge is a small, reviewable, revertible unit — and each one triggers the full pipeline, so <code>main</code> is <em>proven</em> releasable, not assumed to be.",
            });
            f.push({
                stage: codeHTML([
                    "if flags.enabled(\"new-pricing\", user):",
                    "    price = new_pricing(cart)      # merged, off for everyone",
                    "else:",
                    "    price = legacy_pricing(cart)   # what production still runs",
                ], { 0: "is-act", 1: "is-done" }),
                note: "<b>The obvious objection: what about a feature that takes six weeks?</b> You merge it incomplete, behind a <b>feature flag</b>. The code is on <code>main</code> and integrated continuously; the <em>behaviour</em> is switched on separately. This is the trade trunk-based development makes — you accept some dead code in production in exchange for never having a big-bang merge.",
            });
            f.push({
                stage: panesHTML([
                    { title: "You get", items: [{ text: "merges that take seconds", cls: "is-done" }, { text: "CI on the real integrated state", cls: "is-done" }, { text: "revert = one small commit", cls: "is-done" }, { text: "bisect actually works", cls: "is-done" }] },
                    { title: "You must have", items: [{ text: "a fast, trusted test suite", cls: "is-act" }, { text: "feature flags", cls: "is-act" }, { text: "backward-compatible DB changes", cls: "is-act" }, { text: "review within hours", cls: "is-act" }] },
                ]),
                note: "<b>The conclusion.</b> Trunk-based development is not \"skip the process\". It is moving the process from <em>after</em> integration to <em>before</em> it, which is only possible if the automated checks are fast enough to run on every commit. The branching strategy is a symptom; the test suite is the cause.",
            });
            return f;
        }

        f.push({
            stage: draw(3, runOf(3), null),
            note: "Same starting point: three commits on <code>main</code>.",
        });
        f.push({
            stage: draw(3, runOf(3), { from: 2, states: ["n-act"] }),
            note: "A team branches off to build a large feature. On day one the branch and <code>main</code> are identical, so nothing can conflict.",
        });
        f.push({
            stage: draw(4, [...runOf(3), "n-act"], { from: 2, states: ["n-cmp", "n-act"] }),
            note: "Week one. The branch has grown, and so has <code>main</code> — other people are still shipping. The two histories have started to <b>diverge</b>, and nobody has run the two sets of changes together even once.",
        });
        f.push({
            stage: draw(6, [...runOf(4), "n-act", "n-act"], { from: 2, states: ["n-cmp", "n-cmp", "n-cmp", "n-act"] }),
            note: "Week three. Divergence is now measured in dozens of commits on both sides. Notice what is <em>not</em> happening: no test run anywhere in the world is exercising this branch together with the current <code>main</code>. The integration risk is accumulating invisibly.",
        });
        f.push({
            stage: draw(8, [...runOf(6), "n-act", "n-act"], { from: 2, states: ["n-cmp", "n-cmp", "n-cmp", "n-cmp", "n-cmp", "n-out"] }),
            note: "<b>Merge day.</b> The conflicts are not really textual — Git can usually resolve those. The dangerous ones are <em>semantic</em>: a function someone renamed, a schema someone changed, an assumption someone inverted. Git merges them cleanly and the behaviour is wrong.",
        });
        f.push({
            stage: panesHTML([
                { title: "What went wrong", items: [{ text: "risk grew with branch age", cls: "is-out" }, { text: "one huge review", cls: "is-out" }, { text: "revert = revert everything", cls: "is-out" }, { text: "failure could be any of 60 commits", cls: "is-out" }] },
                { title: "The rule that fixes it", items: [{ text: "branch life < 1 day", cls: "is-done" }, { text: "merge to main continuously", cls: "is-done" }, { text: "hide incomplete work with flags", cls: "is-done" }, { text: "small PRs get real review", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion.</b> Merge pain is a function of <em>time</em>, not of tooling — it grows with how long two histories have been apart. The \"continuous\" in continuous integration means integrating into the shared trunk at least daily. Every branching strategy that keeps work apart for weeks is trading a small, known cost today for a large, unpredictable one later.",
        });
        return f;
    },
};

/* ---- 3. Build once, promote everywhere ---- */

VIZ["build-promote"] = {
    title: "Build once, promote everywhere",
    legend: [["lg-act", "building"], ["lg-done", "verified"], ["lg-out", "different artifact"], ["lg-idle", "not reached"]],
    options: [
        { value: "promote", label: "Build once and promote" },
        { value: "rebuild", label: "Rebuild per environment" },
    ],
    build(option = "promote") {
        const W = 760;
        const H = 250;
        const draw = (src, builds, envs, extra = "") => {
            let s = boxHTML(30, 96, 120, 44, "git 9f2c1ab", src);
            builds.forEach((b, i) => {
                s += boxHTML(200, 40 + i * 76, 130, 44, b.label, b.state);
            });
            envs.forEach((e, i) => {
                s += boxHTML(430, 40 + i * 76, 130, 44, e.label, e.state, e.sub || "");
                s += arrowHTML(345, 62 + i * 76, 424, 62 + i * 76, e.arrow || "e-idle");
            });
            s += arrowHTML(155, 118, 194, 118, src === "n-idle" ? "e-idle" : "e-done");
            return svgHTML(W, H, s + extra);
        };
        const f = [];

        if (option === "rebuild") {
            f.push({
                stage: draw("n-done", [{ label: "build for dev", state: "n-idle" }, { label: "build for staging", state: "n-idle" }, { label: "build for prod", state: "n-idle" }], [{ label: "dev" }, { label: "staging" }, { label: "prod" }].map((e) => ({ ...e, state: "n-idle" }))),
                note: "The pattern almost every team starts with: each environment has its own build job, run from the same commit. It feels equivalent. It is not.",
            });
            f.push({
                stage: draw("n-done", [{ label: "build for dev", state: "n-act" }, { label: "build for staging", state: "n-idle" }, { label: "build for prod", state: "n-idle" }], [{ label: "dev", state: "n-done", sub: "sha256:aa11…", arrow: "e-done" }, { label: "staging", state: "n-idle" }, { label: "prod", state: "n-idle" }]),
                note: "Monday: the dev build runs. <code>pip install</code> resolves a transitive dependency to <code>1.4.2</code>, the base image tag <code>python:3.12-slim</code> points at last week's rebuild. Digest <code>aa11…</code>. Tests pass.",
            });
            f.push({
                stage: draw("n-done", [{ label: "build for dev", state: "n-done" }, { label: "build for staging", state: "n-act" }, { label: "build for prod", state: "n-idle" }], [{ label: "dev", state: "n-done", sub: "sha256:aa11…", arrow: "e-done" }, { label: "staging", state: "n-done", sub: "sha256:bb22…", arrow: "e-done" }, { label: "prod", state: "n-idle" }]),
                note: "Wednesday: staging builds from the same commit. The base image tag has moved, and so has one dependency. Digest <code>bb22…</code>. <b>Same source, different bytes</b> — and the QA sign-off you are about to collect applies to bytes nobody will ever run again.",
            });
            f.push({
                stage: draw("n-done", [{ label: "build for dev", state: "n-done" }, { label: "build for staging", state: "n-done" }, { label: "build for prod", state: "n-act" }], [{ label: "dev", state: "n-done", sub: "sha256:aa11…", arrow: "e-done" }, { label: "staging", state: "n-done", sub: "sha256:bb22…", arrow: "e-done" }, { label: "prod", state: "n-out", sub: "sha256:cc33…", arrow: "e-act" }]),
                note: "Friday: production builds. Digest <code>cc33…</code> — an artifact that has been tested <em>nowhere</em>. When it fails, the honest description of what happened is \"we shipped something we never tested\", and the pipeline diagram will not show it because every box is green.",
            });
            f.push({
                stage: panesHTML([
                    { title: "What varies between builds", items: [{ text: "floating base image tags", cls: "is-out" }, { text: "unpinned transitive deps", cls: "is-out" }, { text: "build-time network fetches", cls: "is-out" }, { text: "timestamps and build IDs", cls: "is-out" }, { text: "the builder's own toolchain", cls: "is-out" }] },
                    { title: "What makes it stop varying", items: [{ text: "one build job, one artifact", cls: "is-done" }, { text: "reference images by digest", cls: "is-done" }, { text: "commit the lockfile", cls: "is-done" }, { text: "config from env, not from build", cls: "is-done" }] },
                ]),
                note: "<b>The conclusion.</b> \"Same commit\" is not the same as \"same artifact\". A build is a function of the source <em>and</em> everything the network happened to hand you at that moment. Rebuilding per environment turns your test results into an opinion about a different program.",
            });
            return f;
        }

        f.push({
            stage: draw("n-act", [{ label: "build", state: "n-idle" }], [{ label: "dev", state: "n-idle" }, { label: "staging", state: "n-idle" }, { label: "prod", state: "n-idle" }]),
            note: "One commit enters the pipeline. From here on, the rule is: <b>the artifact is built once and only once</b>.",
        });
        f.push({
            stage: draw("n-done", [{ label: "build", state: "n-act" }], [{ label: "dev", state: "n-idle" }, { label: "staging", state: "n-idle" }, { label: "prod", state: "n-idle" }]),
            note: "The build produces an image and pushes it. What identifies it is not the tag <code>v1.8.0</code> — tags can be moved — but the content digest <code>sha256:aa11…</code>, which cannot.",
        });
        f.push({
            stage: draw("n-done", [{ label: "sha256:aa11…", state: "n-done" }], [{ label: "dev", state: "n-done", arrow: "e-done", sub: "smoke tests pass" }, { label: "staging", state: "n-idle" }, { label: "prod", state: "n-idle" }]),
            note: "<b>Deploy to dev.</b> The environment differs — smaller machines, a seeded database, a test API key — but every one of those differences arrives as <em>configuration</em>, injected at start-up. The bytes are unchanged.",
        });
        f.push({
            stage: draw("n-done", [{ label: "sha256:aa11…", state: "n-done" }], [{ label: "dev", state: "n-done", arrow: "e-done", sub: "smoke tests pass" }, { label: "staging", state: "n-done", arrow: "e-done", sub: "integration + load pass" }, { label: "prod", state: "n-idle" }]),
            note: "<b>Promote to staging.</b> Promotion is not a rebuild — it is a pointer change plus a deploy. The evidence collected here therefore transfers: you tested <code>aa11…</code>, and <code>aa11…</code> is what will run.",
        });
        f.push({
            stage: draw("n-done", [{ label: "sha256:aa11…", state: "n-done" }], [{ label: "dev", state: "n-done", arrow: "e-done" }, { label: "staging", state: "n-done", arrow: "e-done" }, { label: "prod", state: "n-act", arrow: "e-act", sub: "same digest" }]),
            note: "<b>Promote to production.</b> Nothing new is compiled at the riskiest moment of the process. The change between staging and production is exactly one thing — the environment's configuration — which is also the only thing left to blame if it breaks.",
        });
        f.push({
            stage: panesHTML([
                { title: "Immutable — belongs in the artifact", items: [{ text: "application code", cls: "is-done" }, { text: "pinned dependencies", cls: "is-done" }, { text: "runtime and base image", cls: "is-done" }] },
                { title: "Per environment — inject at run time", items: [{ text: "database URL", cls: "is-act" }, { text: "credentials and tokens", cls: "is-act" }, { text: "feature flag defaults", cls: "is-act" }, { text: "replica count, limits", cls: "is-act" }] },
                { title: "Never", items: [{ text: "env-specific code branches", cls: "is-out" }, { text: "config baked into the image", cls: "is-out" }, { text: "a \"prod\" build flag", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Draw the line at the artifact boundary: <em>code is built, configuration is injected</em>. Once you hold that line, a rollback becomes \"deploy the previous digest\", a hotfix becomes \"promote a new digest\", and \"it worked in staging\" becomes a statement about the same program rather than a hopeful analogy.",
        });
        return f;
    },
};

/* ---- 4. Docker layer cache ---- */

VIZ["image-layers"] = {
    title: "Why your image rebuild takes four minutes",
    legend: [["lg-act", "rebuilding"], ["lg-done", "cache hit"], ["lg-out", "cache invalidated"], ["lg-idle", "not reached"]],
    options: [
        { value: "bad", label: "COPY . . before install" },
        { value: "good", label: "Dependencies copied first" },
    ],
    build(option = "bad") {
        const BAD = [
            "FROM python:3.12-slim",
            "WORKDIR /app",
            "COPY . .",
            "RUN pip install -r requirements.txt",
            "CMD [\"python\", \"app.py\"]",
        ];
        const GOOD = [
            "FROM python:3.12-slim",
            "WORKDIR /app",
            "COPY requirements.txt .",
            "RUN pip install -r requirements.txt",
            "COPY . .",
            "CMD [\"python\", \"app.py\"]",
        ];
        const f = [];

        if (option === "good") {
            f.push({
                stage: codeHTML(GOOD),
                note: "The same image, one line moved. <code>COPY requirements.txt</code> is now a separate, earlier layer from <code>COPY . .</code> — and that single reordering is the difference between a four-minute rebuild and a four-second one.",
            });
            f.push({
                stage: codeHTML(GOOD, { 0: "is-done", 1: "is-done" }),
                note: "You edit <code>app.py</code> and rebuild. Layers 1 and 2 depend on nothing you changed: <b>cache hit</b>.",
            });
            f.push({
                stage: codeHTML(GOOD, { 0: "is-done", 1: "is-done", 2: "is-done" }),
                note: "Layer 3 copies <em>only</em> <code>requirements.txt</code>. Its checksum is unchanged, so this is a cache hit too — and that is the whole trick.",
            });
            f.push({
                stage: codeHTML(GOOD, { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }),
                note: "<b>The expensive layer is reused.</b> <code>pip install</code> is keyed on the instruction text and the state of the layer below it. Neither moved, so the 300 MB of installed packages is taken straight from cache. No network, no compile.",
            });
            f.push({
                stage: codeHTML(GOOD, { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-act", 5: "is-act" }),
                note: "Only now does the source arrive, and only the last two thin layers are rebuilt. Same image contents as before, a fraction of the time — and a fraction of the bytes pushed to the registry, because the shared layers already exist there.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Order layers by rate of change", items: [{ text: "1. base image (monthly)", cls: "is-done" }, { text: "2. system packages (monthly)", cls: "is-done" }, { text: "3. dependency manifest (weekly)", cls: "is-cmp" }, { text: "4. install dependencies (weekly)", cls: "is-cmp" }, { text: "5. application source (hourly)", cls: "is-act" }] },
                    { title: "Also worth doing", items: [{ text: "multi-stage: build fat, ship thin", cls: "is-done" }, { text: ".dockerignore excludes .git, node_modules", cls: "is-done" }, { text: "one RUN for apt-get update && install", cls: "is-done" }, { text: "pin the base image by digest", cls: "is-done" }] },
                ]),
                note: "<b>The rule that generalises.</b> A Dockerfile is a cache key expressed as a list. Put what changes least at the top and what changes most at the bottom, because <em>invalidating a layer invalidates everything below it</em>. That one sentence explains almost every Dockerfile optimisation you will ever read.",
            });
            return f;
        }

        f.push({
            stage: codeHTML(BAD),
            note: "A perfectly ordinary Dockerfile. It works. The first build takes four minutes, which everyone accepts. The problem is that <em>every subsequent</em> build also takes four minutes.",
        });
        f.push({
            stage: panesHTML([
                { title: "Layers, bottom to top", stack: true, items: [{ text: "CMD python app.py — 0 B", cls: "is-cmp" }, { text: "RUN pip install — 312 MB", cls: "is-cmp" }, { text: "COPY . . — 8 MB", cls: "is-cmp" }, { text: "WORKDIR /app — 0 B", cls: "is-cmp" }, { text: "FROM python:3.12-slim — 130 MB", cls: "is-cmp" }] },
            ]),
            note: "An image is a stack of read-only layers, each one the filesystem diff produced by a single instruction. The container adds a thin writable layer on top at run time. Each layer's cache key is the instruction text plus the digest of everything beneath it.",
        });
        f.push({
            stage: codeHTML(BAD, { 0: "is-done", 1: "is-done" }),
            note: "You fix a typo in <code>app.py</code> and rebuild. The base image and <code>WORKDIR</code> are untouched: two cache hits, instant.",
        });
        f.push({
            stage: codeHTML(BAD, { 0: "is-done", 1: "is-done", 2: "is-out" }),
            note: "<b>Line 3 is the problem.</b> <code>COPY . .</code> hashes the whole build context. One changed byte in one file changes that hash, so the layer is invalidated — correctly, but expensively.",
        });
        f.push({
            stage: codeHTML(BAD, { 0: "is-done", 1: "is-done", 2: "is-out", 3: "is-act" }),
            note: "And because layers are a chain, <b>everything below an invalidated layer is invalidated too</b>. <code>pip install</code> re-runs: the network is hit, wheels are rebuilt, 312 MB is regenerated — all because a comment changed in a Python file.",
        });
        f.push({
            stage: codeHTML(BAD, { 0: "is-done", 1: "is-done", 2: "is-out", 3: "is-out", 4: "is-out" }),
            note: "Four minutes, on every commit, on every CI run, for every developer. Multiply by a team and this single line ordering is one of the largest, cheapest wins available in most pipelines. Switch the picker to see the fix.",
        });
        return f;
    },
};

/* ---- 5. What a container actually is ---- */

VIZ["container-isolation"] = {
    title: "A container is a process with a restricted view",
    legend: [["lg-act", "the container's process"], ["lg-done", "visible to it"], ["lg-out", "hidden or blocked"], ["lg-idle", "on the host"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "Host — ps aux", items: [{ text: "PID 1     systemd" }, { text: "PID 812   sshd" }, { text: "PID 1140  dockerd" }, { text: "PID 4471  postgres" }, { text: "PID 9203  python app.py" }] },
            ]),
            note: "Start from the truth: there is no such thing as \"inside a container\". Every process in a container is an ordinary Linux process on the host kernel — here, <code>PID 9203</code>. <code>ps</code> on the host sees it like any other.",
        });
        f.push({
            stage: panesHTML([
                { title: "Host — ps aux", items: [{ text: "PID 1     systemd" }, { text: "PID 812   sshd" }, { text: "PID 1140  dockerd" }, { text: "PID 4471  postgres" }, { text: "PID 9203  python app.py", cls: "is-act" }] },
                { title: "Container — ps aux", items: [{ text: "PID 1     python app.py", cls: "is-act" }] },
            ]),
            note: "<b>The PID namespace.</b> The same process, asked from inside, calls itself <code>PID 1</code> and can see nothing else. Nothing was copied or emulated — the kernel simply answers the question differently depending on which namespace asked.",
        });
        f.push({
            stage: panesHTML([
                { title: "Namespaces — what it can see", items: [{ text: "pid — only its own processes", cls: "is-done" }, { text: "mnt — its own filesystem tree", cls: "is-done" }, { text: "net — its own interfaces and ports", cls: "is-done" }, { text: "uts — its own hostname", cls: "is-done" }, { text: "ipc — its own shared memory", cls: "is-done" }, { text: "user — its own uid mapping", cls: "is-done" }] },
            ]),
            note: "There are several namespaces and each one virtualises a different global resource. The <code>net</code> namespace is the one that explains ports: a container listening on <code>:5000</code> is not on the host's <code>:5000</code> at all, which is why <code>-p 8080:5000</code> has to exist.",
        });
        f.push({
            stage: panesHTML([
                { title: "cgroups — what it may use", items: [{ text: "cpu.max  = 50 000 / 100 000", cls: "is-act" }, { text: "memory.max = 512 MiB", cls: "is-act" }, { text: "pids.max = 200", cls: "is-act" }, { text: "io.max = 10 MB/s", cls: "is-act" }] },
                { title: "Enforcement", items: [{ text: "CPU over limit → throttled", cls: "is-cmp" }, { text: "memory over limit → OOM-killed", cls: "is-out" }] },
            ]),
            note: "<b>cgroups</b> are the second half. Namespaces limit what a process can <em>see</em>; cgroups limit what it can <em>consume</em>. Note the asymmetry that bites people: exceeding the CPU limit slows you down, exceeding the memory limit kills you — instantly, with exit code 137 and no stack trace.",
        });
        f.push({
            stage: panesHTML([
                { title: "Shared with the host", items: [{ text: "the kernel itself", cls: "is-out" }, { text: "kernel modules", cls: "is-out" }, { text: "the system clock", cls: "is-out" }, { text: "CPU vulnerabilities", cls: "is-out" }] },
                { title: "Not shared", items: [{ text: "filesystem tree", cls: "is-done" }, { text: "process table", cls: "is-done" }, { text: "network stack", cls: "is-done" }, { text: "installed packages", cls: "is-done" }] },
            ]),
            note: "<b>The security consequence.</b> A VM has its own kernel; a container borrows the host's. That is why containers boot in milliseconds and why a kernel exploit inside one is a host compromise. It is also why a Linux container cannot run on a Windows kernel — the \"it runs anywhere\" claim is really \"it runs on any host with a compatible kernel\".",
        });
        f.push({
            stage: panesHTML([
                { title: "Image — build time, immutable", items: [{ text: "read-only layers", cls: "is-done" }, { text: "identified by digest", cls: "is-done" }, { text: "shared between containers", cls: "is-done" }] },
                { title: "Container — run time, disposable", items: [{ text: "one writable layer", cls: "is-act" }, { text: "namespaces + cgroups", cls: "is-act" }, { text: "dies with its process", cls: "is-act" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Image is to container as class is to object, and the writable layer is where the confusion lives: anything written there disappears when the container is replaced. Data you intend to keep goes in a <b>volume</b>; everything else should be treated as gone at every deploy. Containers make you honest about state.",
        });
        return f;
    },
};

/* ---- 6. The Kubernetes reconciliation loop ---- */

VIZ["k8s-reconcile"] = {
    title: "Kubernetes is one idea repeated: desired state vs actual state",
    legend: [["lg-act", "being acted on"], ["lg-done", "healthy"], ["lg-out", "gone"], ["lg-idle", "pending"]],
    build() {
        const W = 720;
        const H = 260;
        const draw = (desired, pods, ctrl = "n-idle", banner = "") => {
            let s = bandHTML(20, 20, 300, 210, "Desired state — what you declared, stored in etcd");
            s += boxHTML(50, 60, 240, 40, `replicas: ${desired}`, "n-cmp");
            s += boxHTML(50, 120, 240, 40, "image: api:v1.8.0", "n-cmp");
            s += boxHTML(50, 175, 240, 36, "selector: app=api", "n-cmp");
            s += boxHTML(350, 110, 60, 60, "loop", ctrl);
            s += arrowHTML(325, 128, 345, 128, ctrl === "n-idle" ? "e-idle" : "e-act");
            s += arrowHTML(415, 152, 435, 152, ctrl === "n-idle" ? "e-idle" : "e-act");
            s += bandHTML(440, 20, 260, 210, "Actual state — the cluster right now");
            pods.forEach((p, i) => {
                s += boxHTML(465, 55 + i * 52, 210, 40, p.label, p.state, p.sub || "");
            });
            if (banner) s += capHTML(360, 248, banner);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw(3, [], "n-idle"),
            note: "You do not tell Kubernetes to start containers. You write down what you want — three replicas of <code>api:v1.8.0</code> — and store it in the API server. Nothing is running yet; the desired state is just a record.",
        });
        f.push({
            stage: draw(3, [], "n-act"),
            note: "A <b>controller</b> wakes up. Its entire job, forever, is one comparison: <em>what did the user ask for, and what actually exists?</em> Right now that is 3 versus 0.",
        });
        f.push({
            stage: draw(3, [
                { label: "api-7d4-x9k", state: "n-act", sub: "Pending → ContainerCreating" },
                { label: "api-7d4-mq2", state: "n-act", sub: "Pending → ContainerCreating" },
                { label: "api-7d4-p8v", state: "n-act", sub: "Pending → ContainerCreating" },
            ], "n-act"),
            note: "It closes the gap by creating three Pods. The scheduler then picks a node for each, and the kubelet on that node pulls the image and starts the container. Notice that no single component does the whole job — each one watches, acts, and writes back.",
        });
        f.push({
            stage: draw(3, [
                { label: "api-7d4-x9k", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-mq2", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-p8v", state: "n-done", sub: "Running, ready" },
            ], "n-done"),
            note: "Desired equals actual. The loop does not stop — it keeps running, finds nothing to do, and sleeps. <b>A converged system and an idle system look identical from the outside.</b>",
        });
        f.push({
            stage: draw(3, [
                { label: "api-7d4-x9k", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-mq2", state: "n-out", sub: "node-2 lost" },
                { label: "api-7d4-p8v", state: "n-done", sub: "Running, ready" },
            ], "n-act"),
            note: "<b>A node dies.</b> Nobody paged anybody. The next pass of the loop sees 2 actual against 3 desired — the same comparison as on the very first frame, with a different answer.",
        });
        f.push({
            stage: draw(3, [
                { label: "api-7d4-x9k", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-t3c", state: "n-act", sub: "scheduled on node-4" },
                { label: "api-7d4-p8v", state: "n-done", sub: "Running, ready" },
            ], "n-act"),
            note: "A replacement Pod appears on a healthy node — a <em>new</em> Pod with a new name and a new IP, not a repaired one. Pods are cattle: Kubernetes never fixes one, it replaces it. This is why your application must be able to die at any instant without corrupting anything.",
        });
        f.push({
            stage: draw(3, [
                { label: "api-7d4-x9k", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-t3c", state: "n-done", sub: "Running, ready" },
                { label: "api-7d4-p8v", state: "n-done", sub: "Running, ready" },
            ], "n-done", "self-healing is not a feature — it is the loop having nothing else to do"),
            note: "Converged again, with no human involvement. \"Self-healing\" sounds like magic; it is just this comparison running every few seconds forever.",
        });
        f.push({
            stage: panesHTML([
                { title: "You declare", items: [{ text: "Deployment: 3 × api:v1.9.0", cls: "is-cmp" }, { text: "Service: route to app=api", cls: "is-cmp" }, { text: "HPA: 3–20 pods at 70% CPU", cls: "is-cmp" }, { text: "Ingress: /api → svc api", cls: "is-cmp" }] },
                { title: "A controller reconciles it", items: [{ text: "ReplicaSet controller", cls: "is-act" }, { text: "endpoints controller", cls: "is-act" }, { text: "HPA controller", cls: "is-act" }, { text: "ingress controller", cls: "is-act" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Every Kubernetes object works this way, including ones you write yourself with an operator. Learn the loop once and the API stops being a hundred unrelated resources — it becomes one pattern with a hundred instances. It also tells you how to debug: compare <code>spec</code> (desired) with <code>status</code> (actual), and read the events in between.",
        });
        return f;
    },
};

/* ---- 7. How traffic reaches a Pod ---- */

VIZ["k8s-networking"] = {
    title: "From a user's request to a Pod — and how readiness gates it",
    legend: [["lg-act", "handling the request"], ["lg-done", "ready"], ["lg-out", "removed from rotation"], ["lg-idle", "idle"]],
    build() {
        const W = 760;
        const H = 300;
        const draw = (states, endpoints, hop = -1, note = "") => {
            const S = (k) => states[k] || "n-idle";
            let s = boxHTML(20, 120, 110, 44, "user", S("user"));
            s += boxHTML(170, 120, 120, 44, "Ingress", S("ing"), "TLS, host + path rules");
            s += boxHTML(330, 120, 120, 44, "Service", S("svc"), "ClusterIP, stable DNS");
            const pods = [
                { y: 40, key: "p1", label: "api-x9k  10.1.4.7" },
                { y: 120, key: "p2", label: "api-mq2  10.1.5.2" },
                { y: 200, key: "p3", label: "api-p8v  10.1.6.9" },
            ];
            pods.forEach((p) => {
                s += boxHTML(560, p.y, 170, 44, p.label, S(p.key));
                const live = endpoints.includes(p.key);
                s += arrowHTML(455, 142, 554, p.y + 22, live ? (hop >= 3 && S(p.key) === "n-act" ? "e-act" : "e-done") : "e-idle");
            });
            s += arrowHTML(135, 142, 165, 142, hop >= 1 ? "e-act" : "e-idle");
            s += arrowHTML(295, 142, 325, 142, hop >= 2 ? "e-act" : "e-idle");
            s += capHTML(505, 270, `Endpoints: ${endpoints.length ? endpoints.length : "none"} ready`);
            if (note) s += capHTML(380, 290, note);
            return svgHTML(W, H, s);
        };
        const EP = ["p1", "p2", "p3"];
        const f = [];
        f.push({
            stage: draw({ p1: "n-done", p2: "n-done", p3: "n-done" }, EP),
            note: "Three Pods are running, each with its own IP on the cluster network. Those IPs are useless to a client: they change on every restart. Everything in this picture exists to hide that fact.",
        });
        f.push({
            stage: draw({ user: "n-act", p1: "n-done", p2: "n-done", p3: "n-done" }, EP, 0),
            note: "A user requests <code>https://api.example.com/orders</code>. DNS resolves to the cloud load balancer in front of the cluster's ingress controller.",
        });
        f.push({
            stage: draw({ user: "n-done", ing: "n-act", p1: "n-done", p2: "n-done", p3: "n-done" }, EP, 1),
            note: "<b>Ingress.</b> This is where TLS terminates and where host and path rules are applied — <code>api.example.com/orders</code> matches a rule pointing at the <code>api</code> Service. One load balancer, many services: that is the reason Ingress exists rather than giving every service its own.",
        });
        f.push({
            stage: draw({ user: "n-done", ing: "n-done", svc: "n-act", p1: "n-done", p2: "n-done", p3: "n-done" }, EP, 2),
            note: "<b>Service.</b> A stable virtual IP and a DNS name, <code>api.default.svc.cluster.local</code>, that never changes for the life of the Service. It is not a proxy process — it is a set of rules programmed into every node's kernel.",
        });
        f.push({
            stage: draw({ user: "n-done", ing: "n-done", svc: "n-done", p1: "n-done", p2: "n-act", p3: "n-done" }, EP, 3),
            note: "<b>The selector is the join.</b> The Service says <code>app=api</code>; the endpoints controller keeps a list of every <em>ready</em> Pod carrying that label, and one is chosen. Loose coupling by label rather than by address is what lets you replace all three Pods without touching the Service.",
        });
        f.push({
            stage: draw({ user: "n-done", ing: "n-done", svc: "n-done", p1: "n-done", p2: "n-done", p3: "n-out" }, ["p1", "p2"], 3, "readiness probe on api-p8v failed 3×"),
            note: "<b>Now the part people get wrong.</b> The third Pod's readiness probe starts failing — it is alive but cannot serve, say because its database pool is exhausted. The endpoints controller removes it from the list and traffic stops going there. The Pod is not restarted.",
        });
        f.push({
            stage: panesHTML([
                { title: "livenessProbe fails", items: [{ text: "the container is killed", cls: "is-out" }, { text: "and restarted in place", cls: "is-act" }, { text: "use for: deadlocked, unrecoverable", cls: "is-cmp" }] },
                { title: "readinessProbe fails", items: [{ text: "removed from Service endpoints", cls: "is-out" }, { text: "container keeps running", cls: "is-done" }, { text: "use for: warming up, dependency down", cls: "is-cmp" }] },
                { title: "startupProbe", items: [{ text: "holds the other two off", cls: "is-act" }, { text: "use for: slow JVM boots", cls: "is-cmp" }] },
            ]),
            note: "<b>The distinction that causes real outages.</b> Pointing <code>livenessProbe</code> at a check that touches your database means that when the database has a bad minute, Kubernetes restarts every Pod you own simultaneously and turns a slow dependency into a full outage. Liveness answers \"is this process broken?\"; readiness answers \"should I send it traffic right now?\".",
        });
        f.push({
            stage: draw({ user: "n-done", ing: "n-done", svc: "n-done", p1: "n-done", p2: "n-done", p3: "n-done" }, EP, 3),
            note: "<b>The conclusion worth memorising.</b> Pod IPs are ephemeral, labels are the contract, and the endpoint list is the only thing standing between a broken Pod and your users. When traffic goes somewhere it should not, check the labels and <code>kubectl get endpoints</code> before you suspect anything more exotic.",
        });
        return f;
    },
};

/* ---- 8. Infrastructure as code: plan and drift ---- */

VIZ["iac-plan"] = {
    title: "Plan, apply, and the state file in the middle",
    legend: [["lg-act", "changing"], ["lg-done", "matches"], ["lg-out", "differs"], ["lg-idle", "not evaluated"]],
    options: [
        { value: "create", label: "A first apply" },
        { value: "drift", label: "Drift — someone edited the console" },
    ],
    build(option = "create") {
        const f = [];
        const three = (code, state, real, marks = {}) =>
            panesHTML([
                { title: "Code — what you wrote", items: code },
                { title: "State — what IaC believes", items: state, empty: "empty" },
                { title: "Cloud — what exists", items: real, empty: "nothing" },
            ]) + (marks.extra || "");

        if (option === "drift") {
            f.push({
                stage: three(
                    [{ text: "instance_type = t3.small", cls: "is-done" }, { text: "count = 2", cls: "is-done" }],
                    [{ text: "instance_type = t3.small", cls: "is-done" }, { text: "count = 2", cls: "is-done" }],
                    [{ text: "i-0a1  t3.small", cls: "is-done" }, { text: "i-0b2  t3.small", cls: "is-done" }]
                ),
                note: "A converged system: code, state and reality agree. This is the only configuration in which an <code>apply</code> is boring, and boring is the goal.",
            });
            f.push({
                stage: three(
                    [{ text: "instance_type = t3.small", cls: "is-done" }, { text: "count = 2", cls: "is-done" }],
                    [{ text: "instance_type = t3.small", cls: "is-done" }, { text: "count = 2", cls: "is-done" }],
                    [{ text: "i-0a1  t3.large", cls: "is-out" }, { text: "i-0b2  t3.small", cls: "is-done" }]
                ),
                note: "<b>3 a.m.</b> An engineer resizes an instance in the console to end an incident. Entirely the right call at the time. But now reality has moved and the two records of intent have not — this is <b>drift</b>.",
            });
            f.push({
                stage: codeHTML([
                    "$ terraform plan",
                    "aws_instance.web[0]: Refreshing state... [id=i-0a1]",
                    "",
                    "  ~ resource \"aws_instance\" \"web\" {",
                    "      ~ instance_type = \"t3.large\" -> \"t3.small\"  # forces replacement",
                    "    }",
                    "",
                    "Plan: 0 to add, 1 to change, 0 to destroy.",
                ], { 1: "is-act", 4: "is-out", 7: "is-cmp" }),
                note: "<b>Plan refreshes first.</b> It reads the live resource, compares it to state, then compares state to code. It has found the drift and intends to undo it — <em>silently reverting the fix that ended your incident</em>, in the middle of a routine deploy of something unrelated.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Wrong reactions", items: [{ text: "apply and hope", cls: "is-out" }, { text: "delete the state file", cls: "is-out" }, { text: "stop using IaC for this", cls: "is-out" }] },
                    { title: "Right reactions", items: [{ text: "codify it: change the code to t3.large", cls: "is-done" }, { text: "or revert it deliberately, in hours", cls: "is-done" }, { text: "run plan on a schedule to detect drift", cls: "is-done" }, { text: "remove console write access", cls: "is-done" }] },
                ]),
                note: "<b>The lesson.</b> Drift is not a tooling failure, it is a process failure: two sources of truth were allowed to exist. The durable fix is to make the console read-only for humans, so that the only way to change infrastructure is the way that leaves a reviewable record.",
            });
            f.push({
                stage: panesHTML([
                    { title: "The state file is dangerous", items: [{ text: "contains secrets in plain text", cls: "is-out" }, { text: "concurrent applies corrupt it", cls: "is-out" }, { text: "losing it orphans every resource", cls: "is-out" }] },
                    { title: "So it must be", items: [{ text: "remote (S3, GCS, Terraform Cloud)", cls: "is-done" }, { text: "locked (DynamoDB, native locking)", cls: "is-done" }, { text: "versioned and encrypted", cls: "is-done" }, { text: "one state per environment", cls: "is-done" }] },
                ]),
                note: "<b>The conclusion.</b> The state file is the most valuable and least protected artifact in most infrastructure repositories. Never on a laptop, never in Git, always locked — two engineers running <code>apply</code> at once against unlocked state is a genuinely bad afternoon.",
            });
            return f;
        }

        f.push({
            stage: three(
                [{ text: "resource aws_s3_bucket reports", cls: "is-act" }, { text: "versioning = enabled", cls: "is-act" }],
                [],
                []
            ),
            note: "You write what you want to exist. Note the grammar: this is a <em>declaration</em>, not a script. There is no \"create the bucket\" instruction anywhere, and that is what makes running it twice safe.",
        });
        f.push({
            stage: codeHTML([
                "$ terraform plan",
                "",
                "  + resource \"aws_s3_bucket\" \"reports\" {",
                "      + bucket = \"acme-reports\"",
                "      + versioning { enabled = true }",
                "    }",
                "",
                "Plan: 1 to add, 0 to change, 0 to destroy.",
            ], { 0: "is-act", 7: "is-done" }),
            note: "<b>Plan</b> is a dry run, and it is the single most valuable habit in infrastructure work: a reviewable diff of what is about to happen to production, produced before anything happens. Read the last line first — <code>0 to destroy</code> is the number that ruins weekends.",
        });
        f.push({
            stage: three(
                [{ text: "resource aws_s3_bucket reports", cls: "is-done" }, { text: "versioning = enabled", cls: "is-done" }],
                [{ text: "aws_s3_bucket.reports", cls: "is-act" }, { text: "id = acme-reports", cls: "is-act" }],
                [{ text: "s3://acme-reports", cls: "is-done" }, { text: "versioning: enabled", cls: "is-done" }]
            ),
            note: "<b>Apply.</b> The resource is created and — critically — recorded in <b>state</b>. State is the map from your symbolic name <code>aws_s3_bucket.reports</code> to the real-world id. Without it, the tool cannot tell \"create a new bucket\" from \"this bucket is already mine\".",
        });
        f.push({
            stage: codeHTML([
                "$ terraform apply     # run again, unchanged",
                "",
                "No changes. Your infrastructure matches the configuration.",
            ], { 2: "is-done" }),
            note: "<b>Idempotence.</b> Running it again does nothing, because the tool computes a diff rather than replaying commands. This is the property that separates infrastructure as code from a folder of shell scripts: the code describes the destination, so it is safe to run from any starting point.",
        });
        f.push({
            stage: panesHTML([
                { title: "Declarative — what you want", items: [{ text: "Terraform, CloudFormation", cls: "is-done" }, { text: "Kubernetes manifests", cls: "is-done" }, { text: "safe to re-run", cls: "is-done" }, { text: "diffable before applying", cls: "is-done" }] },
                { title: "Imperative — how to get there", items: [{ text: "shell scripts, aws cli", cls: "is-act" }, { text: "must handle \"already exists\"", cls: "is-out" }, { text: "order-dependent", cls: "is-out" }, { text: "no diff, no dry run", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Declarative tools let you review a change before it happens and re-run it without fear; imperative ones force you to encode every possible starting state yourself. That is the whole argument, and it is why every serious infrastructure tool of the last decade is declarative. Switch the picker to see what happens when reality changes behind its back.",
        });
        return f;
    },
};

/* ---- 9. The CI pipeline ---- */

VIZ["ci-pipeline"] = {
    title: "A pipeline is a series of gates, ordered by cost",
    legend: [["lg-act", "running"], ["lg-done", "passed"], ["lg-out", "failed"], ["lg-idle", "not started"]],
    build() {
        const W = 760;
        const H = 250;
        const STAGES = [
            { label: "lint", sub: "8 s" },
            { label: "unit tests", sub: "45 s" },
            { label: "build image", sub: "70 s" },
            { label: "integration", sub: "4 min" },
            { label: "push + deploy", sub: "60 s" },
        ];
        const draw = (states, banner = "") => {
            let s = boxHTML(20, 100, 90, 44, "push", states.push || "n-idle");
            STAGES.forEach((st, i) => {
                s += boxHTML(140 + i * 122, 100, 106, 44, st.label, states[i] || "n-idle", st.sub);
                s += arrowHTML(120 + i * 122, 122, 136 + i * 122, 122, states[i] && states[i] !== "n-idle" ? "e-act" : "e-idle");
            });
            if (banner) s += capHTML(W / 2, 200, banner);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw({ push: "n-act" }),
            note: "A developer pushes a commit. Everything that follows is automatic, and the only decision the pipeline ever makes is binary: <em>may this change proceed?</em>",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-act" }),
            note: "<b>Lint and format first</b> — eight seconds. Cheap checks go at the front so that the common, trivial failures are reported before you have spent four minutes of compute discovering them.",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-done", 1: "n-act" }),
            note: "<b>Unit tests.</b> No network, no database, no clock. They are fast because they are isolated, and they are worth having because a red unit test names the broken function rather than the broken system.",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-done", 1: "n-out" }, "pipeline stops here — nothing downstream runs"),
            note: "<b>Fail fast.</b> A test fails and everything after it is cancelled. This is not merely tidy: the value of CI is the <em>latency</em> between making a mistake and being told about it. A pipeline that reports failure in 53 seconds changes behaviour; one that reports in 40 minutes gets ignored.",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-done", 1: "n-done", 2: "n-act" }),
            note: "The developer fixes it and pushes again. This time the tests pass and the image is built — <b>once</b>, tagged with the commit SHA, and pushed. Every later stage refers to this exact digest.",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-done", 1: "n-done", 2: "n-done", 3: "n-act" }),
            note: "<b>Integration tests</b> run against the real artifact with real dependencies started as containers. Slow and worth it — but only after the cheap gates have passed, which is why they sit fourth and not first.",
        });
        f.push({
            stage: draw({ push: "n-done", 0: "n-done", 1: "n-done", 2: "n-done", 3: "n-done", 4: "n-done" }, "green on main → deployable artifact"),
            note: "Green. The output of CI is not a passing badge, it is a <b>candidate artifact plus the evidence that it passed</b>. Continuous delivery is what happens next; continuous integration ends here.",
        });
        f.push({
            stage: panesHTML([
                { title: "Run on every push", items: [{ text: "lint, types, format", cls: "is-done" }, { text: "unit tests", cls: "is-done" }, { text: "secret scan", cls: "is-done" }, { text: "build", cls: "is-done" }] },
                { title: "Run on merge to main", items: [{ text: "integration + contract tests", cls: "is-act" }, { text: "image scan, SBOM, sign", cls: "is-act" }, { text: "deploy to staging", cls: "is-act" }] },
                { title: "Run nightly", items: [{ text: "full end-to-end suite", cls: "is-cmp" }, { text: "load and soak tests", cls: "is-cmp" }, { text: "dependency updates", cls: "is-cmp" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Not every check belongs on every push. Order the pipeline by <em>cost of running</em> divided by <em>probability of catching something</em>, and move anything slow and rarely-triggered to a schedule. The target most teams should aim at is under ten minutes from push to verdict — beyond that, developers context-switch, and a pipeline nobody waits for stops being a gate at all.",
        });
        return f;
    },
};

/* ---- 10. The test pyramid ---- */

VIZ["test-pyramid"] = {
    title: "Where tests should live, and what happens when they do not",
    legend: [["lg-done", "fast and cheap"], ["lg-cmp", "medium"], ["lg-out", "slow and flaky"], ["lg-act", "the shape you want"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "End-to-end — browser, full stack", items: [{ text: "12 tests · 14 min · flaky", cls: "is-out" }] },
                { title: "Integration — service + real deps", items: [{ text: "180 tests · 4 min", cls: "is-cmp" }] },
                { title: "Unit — one function, no I/O", items: [{ text: "3 400 tests · 40 s", cls: "is-done" }] },
            ]),
            note: "The shape you want: many cheap tests, few expensive ones. The reasoning is not aesthetic — it is that a failing unit test names one function, while a failing end-to-end test names <em>the system</em> and leaves you to find out which of forty components moved.",
        });
        f.push({
            stage: panesHTML([
                { title: "Unit — what it proves", items: [{ text: "this function is correct", cls: "is-done" }, { text: "runs in milliseconds", cls: "is-done" }, { text: "fails with a precise location", cls: "is-done" }, { text: "cannot catch wiring mistakes", cls: "is-out" }] },
            ]),
            note: "<b>Unit tests</b> are fast because they touch nothing outside the process. That is also their blind spot: every bug that lives in the space <em>between</em> two correct components is invisible to them. A suite of only unit tests can be 100% green on a system that cannot start.",
        });
        f.push({
            stage: panesHTML([
                { title: "Integration — what it proves", items: [{ text: "the SQL is valid", cls: "is-done" }, { text: "the migration applies", cls: "is-done" }, { text: "serialisation matches", cls: "is-done" }, { text: "needs real dependencies", cls: "is-cmp" }] },
            ]),
            note: "<b>Integration tests</b> start a real database and a real queue in containers and exercise the seams. This is where mocking stops helping: a mocked database happily accepts SQL that the real one rejects, so the mock proves your code matches your assumptions rather than reality.",
        });
        f.push({
            stage: panesHTML([
                { title: "End-to-end — what it proves", items: [{ text: "a user can actually check out", cls: "is-done" }, { text: "slow: minutes per run", cls: "is-out" }, { text: "flaky: timing, network, data", cls: "is-out" }, { text: "expensive to diagnose", cls: "is-out" }] },
            ]),
            note: "<b>End-to-end tests</b> are the only ones that answer the question the business asks. Keep a handful covering the paths that generate revenue, and resist the urge to grow them — every one you add is a small permanent tax on every deploy.",
        });
        f.push({
            stage: panesHTML([
                { title: "The ice-cream cone — how it actually ends up", items: [{ text: "E2E: 900 tests · 3 h · 8% flaky", cls: "is-out" }, { text: "Integration: 120 tests", cls: "is-cmp" }, { text: "Unit: 200 tests", cls: "is-act" }] },
                { title: "What it costs", items: [{ text: "nightly-only feedback", cls: "is-out" }, { text: "\"just re-run it\" culture", cls: "is-out" }, { text: "red main is normal", cls: "is-out" }, { text: "tests get disabled, not fixed", cls: "is-out" }] },
            ]),
            note: "<b>The failure mode has a name.</b> Teams that test through the UI because it is the easiest place to start invert the pyramid. The end state is predictable: the suite takes hours, a few percent of failures are noise, and once people learn to re-run rather than investigate, the suite has stopped being a signal — you are paying full price for it and getting nothing.",
        });
        f.push({
            stage: panesHTML([
                { title: "Diagnose your suite", items: [{ text: "how long to first red? ", cls: "is-act" }, { text: "what % of failures are real?", cls: "is-act" }, { text: "when did anyone last fix a flake?", cls: "is-act" }] },
                { title: "Fix in this order", items: [{ text: "1. delete or quarantine flakes", cls: "is-done" }, { text: "2. push assertions down a level", cls: "is-done" }, { text: "3. contract tests instead of E2E", cls: "is-done" }, { text: "4. parallelise what is left", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> A test suite has exactly one job: to be <em>believed</em>. Speed and precision are how it earns that, and a flaky test is worse than no test because it trains the team to ignore red. When the pipeline is slow, the fix is almost never more machines — it is moving assertions to the cheapest level that can still catch the bug.",
        });
        return f;
    },
};

/* ---- 11. Deployment strategies ---- */

VIZ["deploy-strategies"] = {
    title: "Four ways to replace v1 with v2",
    legend: [["lg-done", "v2 serving"], ["lg-act", "changing"], ["lg-out", "down or draining"], ["lg-idle", "v1 serving"]],
    options: [
        { value: "recreate", label: "Recreate" },
        { value: "rolling", label: "Rolling update" },
        { value: "blue-green", label: "Blue-green" },
        { value: "canary", label: "Canary" },
    ],
    build(option = "rolling") {
        const f = [];
        const fleet = (arr, marks, tags) => cellsHTML(arr, marks, tags);
        const traffic = (v1, v2, err = null) =>
            panesHTML([
                { title: "Traffic to v1", items: [{ text: `${v1}%`, cls: v1 ? "is-cmp" : "is-ghost" }] },
                { title: "Traffic to v2", items: [{ text: `${v2}%`, cls: v2 ? "is-done" : "is-ghost" }] },
                { title: "Error rate", items: [{ text: err === null ? "—" : err, cls: err && err !== "0.2%" ? "is-out" : "is-done" }] },
            ]);

        if (option === "recreate") {
            f.push({ stage: fleet(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(100, 0, "0.2%"), note: "Four instances of v1, serving all traffic. The starting point for every strategy on this page." });
            f.push({ stage: fleet(["—", "—", "—", "—"], { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-out" }) + traffic(0, 0, "100%"), note: "<b>Recreate:</b> stop everything first. The site is down. This is not a strawman — it is what a plain <code>docker compose up</code> or an in-place package upgrade does by default." });
            f.push({ stage: fleet(["v2", "v2", "v2", "v2"], { 0: "is-active", 1: "is-active", 2: "is-active", 3: "is-active" }) + traffic(0, 100, "—"), note: "v2 starts. Depending on your boot time, the outage lasted between twenty seconds and five minutes, and the whole user base experienced it." });
            f.push({ stage: fleet(["v2", "v2", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(0, 100, "0.2%"), note: "<b>When it is nonetheless the right answer:</b> a schema change the two versions cannot share, a licensing constraint on concurrent instances, a batch worker where a maintenance window is free. Simplicity has real value — just choose it deliberately rather than by default." });
            return f;
        }

        if (option === "blue-green") {
            f.push({ stage: fleet(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }, { 0: "blue", 1: "blue", 2: "blue", 3: "blue" }) + traffic(100, 0, "0.2%"), note: "<b>Blue-green.</b> Blue is production. Nothing about it will be touched during this deploy." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2", "v2", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-active", 5: "is-active", 6: "is-active", 7: "is-active" }, { 4: "green", 5: "green", 6: "green", 7: "green" }) + traffic(100, 0, "0.2%"), note: "A complete second fleet — green — is built alongside it. You are paying for double capacity for the length of the deploy, and that cost <em>is</em> the strategy." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2", "v2", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-cmp", 5: "is-cmp", 6: "is-cmp", 7: "is-cmp" }) + traffic(100, 0, "0.2%"), note: "Green is fully warmed and smoke-tested against production dependencies while still receiving no user traffic. This is the phase you cannot get any other way." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2", "v2", "v2", "v2"], { 0: "is-dim", 1: "is-dim", 2: "is-dim", 3: "is-dim", 4: "is-done", 5: "is-done", 6: "is-done", 7: "is-done" }) + traffic(0, 100, "0.2%"), note: "<b>The cutover is one atomic change</b> — a load balancer target group, a DNS weight, a service selector. Every user moves at the same instant, so there is never a moment when two versions are both live." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2", "v2", "v2", "v2"], { 0: "is-dim", 1: "is-dim", 2: "is-dim", 3: "is-dim", 4: "is-out", 5: "is-out", 6: "is-out", 7: "is-out" }) + traffic(100, 0, "4.1%"), note: "<b>Something is wrong.</b> Errors jump. The rollback is the same switch in the other direction and it takes seconds, because blue was never destroyed — it was sitting there, warm, the entire time." });
            f.push({ stage: panesHTML([{ title: "Blue-green gives you", items: [{ text: "instant, tested rollback", cls: "is-done" }, { text: "no mixed-version window", cls: "is-done" }, { text: "verify before any user sees it", cls: "is-done" }] }, { title: "Blue-green costs you", items: [{ text: "2× infrastructure during deploy", cls: "is-out" }, { text: "shared database still needs care", cls: "is-out" }, { text: "in-flight sessions cut over abruptly", cls: "is-out" }] }]), note: "<b>The conclusion.</b> Blue-green buys you a rollback measured in seconds, and pays for it in duplicated capacity. Note the asterisk that catches everyone: the two fleets usually share one database, so the <em>schema</em> must be compatible with both versions — blue-green does not roll back a migration." });
            return f;
        }

        if (option === "canary") {
            f.push({ stage: fleet(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(100, 0, "0.2%"), note: "<b>Canary.</b> The question this strategy answers is different from the others: not \"how do we avoid downtime\" but <em>\"how few users must see this change before we can tell whether it is good?\"</em>" });
            f.push({ stage: fleet(["v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-active" }) + traffic(95, 5, "0.2%"), note: "One instance runs v2 and takes 5% of traffic. Now you wait — and while you wait you watch error rate, latency percentiles and a business metric like checkout completions, compared against the v1 group." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(75, 25, "0.2%"), note: "Ten minutes of clean signal, so promote to 25%. Each step is a decision with evidence behind it, which is precisely what a big-bang deploy never gives you." });
            f.push({ stage: fleet(["v1", "v1", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-out" }) + traffic(50, 50, "3.8%"), note: "<b>At 50%, latency degrades and errors climb.</b> Half your users are affected — but only half, and you found out from a metric rather than from support tickets." });
            f.push({ stage: fleet(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(100, 0, "0.2%"), note: "Automatic rollback: the analysis step failed its threshold, so traffic returns to v1 with no human in the loop. The important word is <b>automatic</b> — a canary that needs someone to be watching a dashboard at 2 a.m. is just a slow deploy." });
            f.push({ stage: panesHTML([{ title: "You need for a real canary", items: [{ text: "traffic splitting (mesh or LB)", cls: "is-act" }, { text: "per-version metrics", cls: "is-act" }, { text: "an automated analysis step", cls: "is-act" }, { text: "enough traffic to be significant", cls: "is-act" }] }, { title: "Canary is weak when", items: [{ text: "traffic is low — no signal", cls: "is-out" }, { text: "the bug is data-dependent", cls: "is-out" }, { text: "versions cannot coexist", cls: "is-out" }] }]), note: "<b>The conclusion.</b> Canary is the only strategy that treats a deploy as an <em>experiment</em> rather than an event. It requires real observability to work — without per-version metrics you are not running a canary, you are running a rolling update with extra steps and more confidence than you have earned." });
            return f;
        }

        f.push({ stage: fleet(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(100, 0, "0.2%"), note: "<b>Rolling update</b> — the Kubernetes default, and the right default. Four Pods of v1 serving all traffic." });
        f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-active" }) + traffic(100, 0, "0.2%"), note: "<code>maxSurge: 1</code> permits one extra Pod above the desired count, so a v2 Pod starts <em>before</em> anything is removed. Capacity never dips below 100% — that is what surge buys." });
        f.push({ stage: fleet(["v1", "v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-out", 4: "is-done" }) + traffic(75, 25, "0.2%"), note: "The new Pod passes its readiness probe and joins the Service endpoints. Only now is an old Pod sent <code>SIGTERM</code> and drained. <b>Readiness is the gate</b>: without a correct probe the rollout advances into Pods that cannot serve, and you get an outage with a perfectly green deploy log." });
        f.push({ stage: fleet(["v1", "v1", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(50, 50, "0.2%"), note: "Repeat. Note that <b>both versions are serving simultaneously</b> for the whole rollout. Your v2 must therefore tolerate v1's messages, v1's cache entries and v1's database schema — this is the constraint people forget until a rollout half-fails." });
        f.push({ stage: fleet(["v2", "v2", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(0, 100, "0.2%"), note: "Rollout complete, no downtime, no extra fleet, one Pod of extra capacity at peak. Cheap and safe for the ordinary case." });
        f.push({ stage: fleet(["v2", "v1", "v1", "v1"], { 0: "is-out", 1: "is-done", 2: "is-done", 3: "is-done" }) + traffic(100, 0, "1.1%"), note: "<b>And the rollback:</b> Kubernetes keeps the previous ReplicaSet, so <code>kubectl rollout undo</code> is another rolling update in reverse. Safe, but <em>gradual</em> — minutes, not the seconds blue-green gives you. That difference is the entire reason the other strategies exist." });
        f.push({
            stage: panesHTML([
                { title: "Recreate", items: [{ text: "downtime: yes", cls: "is-out" }, { text: "cost: 1×", cls: "is-done" }, { text: "rollback: slow", cls: "is-out" }] },
                { title: "Rolling", items: [{ text: "downtime: no", cls: "is-done" }, { text: "cost: 1× + surge", cls: "is-done" }, { text: "rollback: minutes", cls: "is-cmp" }] },
                { title: "Blue-green", items: [{ text: "downtime: no", cls: "is-done" }, { text: "cost: 2×", cls: "is-out" }, { text: "rollback: seconds", cls: "is-done" }] },
                { title: "Canary", items: [{ text: "downtime: no", cls: "is-done" }, { text: "cost: 1× + analysis", cls: "is-cmp" }, { text: "rollback: automatic", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> You are choosing a position on one axis: <em>how much do you pay, up front and continuously, to shorten the time between shipping a mistake and undoing it?</em> Rolling is the sensible default; blue-green when a slow rollback is unacceptable; canary when you have the traffic and the metrics to make a statistical judgement. All four assume the database can serve both versions — none of them solve that for you.",
        });
        return f;
    },
};

/* ---- 12. GitOps ---- */

VIZ["gitops"] = {
    title: "Push deployment vs pull-based GitOps",
    legend: [["lg-act", "acting"], ["lg-done", "converged"], ["lg-out", "drift or risk"], ["lg-idle", "waiting"]],
    options: [
        { value: "push", label: "Push — CI deploys into the cluster" },
        { value: "pull", label: "Pull — an agent reconciles from Git" },
    ],
    build(option = "push") {
        const W = 740;
        const H = 240;
        const f = [];

        if (option === "pull") {
            const draw = (git, agent, cluster, arrows = {}, banner = "") => {
                let s = boxHTML(30, 100, 130, 46, "Git repo", git, "manifests, per env");
                s += boxHTML(250, 100, 150, 46, "CI", "n-cmp", "builds + writes the tag");
                s += bandHTML(470, 30, 250, 180, "cluster");
                s += boxHTML(500, 60, 190, 42, "agent (Argo / Flux)", agent);
                s += boxHTML(500, 140, 190, 42, "workloads", cluster);
                s += arrowHTML(405, 122, 496, 92, arrows.pull || "e-idle", "polls");
                s += arrowHTML(595, 108, 595, 134, arrows.apply || "e-idle");
                s += arrowHTML(165, 122, 245, 122, arrows.ci || "e-idle");
                if (banner) s += capHTML(370, 228, banner);
                return svgHTML(W, H, s);
            };
            f.push({ stage: draw("n-done", "n-done", "n-done", { apply: "e-done" }), note: "<b>GitOps inverts the direction.</b> An agent lives <em>inside</em> the cluster and continuously compares the manifests in Git with what is running. Nothing outside ever pushes." });
            f.push({ stage: draw("n-done", "n-act", "n-done", { pull: "e-act", apply: "e-done" }), note: "Every thirty seconds it pulls the repository and diffs. Git is not a trigger here — it is the <b>desired state</b>, in exactly the sense of the reconciliation loop you saw earlier, just with the source of truth outside the cluster." });
            f.push({ stage: draw("n-act", "n-idle", "n-done", { ci: "e-act" }), note: "A release now looks like this: CI builds the image and opens a pull request that changes one line — <code>image: api:v1.9.0</code>. <b>The deploy is a commit</b>, reviewed and merged like any other change." });
            f.push({ stage: draw("n-done", "n-act", "n-act", { pull: "e-act", apply: "e-act" }), note: "The agent notices the new commit and applies it. You did not give CI credentials to the cluster; the cluster reached out. That single reversal is why GitOps is a security story as much as a delivery one." });
            f.push({ stage: draw("n-done", "n-act", "n-out", { pull: "e-act", apply: "e-act" }, "someone ran kubectl scale --replicas=10"), note: "<b>Drift correction.</b> An engineer scales a Deployment by hand during an incident. Within a minute the agent sees actual ≠ Git and reverts it. Useful, and occasionally infuriating — which is the point: the only durable way to change the cluster is to change the repository." });
            f.push({ stage: draw("n-done", "n-done", "n-done", { pull: "e-done", apply: "e-done" }, "rollback = git revert"), note: "<b>Rollback is <code>git revert</code>.</b> The previous manifest is right there in history, the agent converges to it, and the audit trail of who changed production and when is the same log you already use for code." });
            f.push({
                stage: panesHTML([
                    { title: "You gain", items: [{ text: "no cluster creds in CI", cls: "is-done" }, { text: "git log = deploy history", cls: "is-done" }, { text: "drift detected and fixed", cls: "is-done" }, { text: "identical process per environment", cls: "is-done" }] },
                    { title: "You take on", items: [{ text: "an agent to run and upgrade", cls: "is-cmp" }, { text: "manifest repo sprawl", cls: "is-cmp" }, { text: "secrets need sealing or an operator", cls: "is-out" }, { text: "breaking glass is deliberately hard", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion.</b> GitOps is the reconciliation loop applied to delivery itself. Its real product is not automation — it is that the answer to \"what is running in production?\" becomes a file you can read, rather than an archaeology exercise across CI logs.",
            });
            return f;
        }

        const draw = (ci, cluster, arrow = "e-idle", banner = "") => {
            let s = boxHTML(30, 100, 130, 46, "Git repo", "n-done");
            s += boxHTML(230, 100, 170, 46, "CI runner", ci, "holds cluster credentials");
            s += bandHTML(470, 40, 250, 150, "cluster");
            s += boxHTML(500, 100, 190, 46, "workloads", cluster);
            s += arrowHTML(165, 122, 225, 122, ci === "n-idle" ? "e-idle" : "e-done");
            s += arrowHTML(405, 122, 494, 122, arrow, "kubectl apply");
            if (banner) s += capHTML(370, 224, banner);
            return svgHTML(W, H, s);
        };
        f.push({ stage: draw("n-idle", "n-done"), note: "The familiar arrangement: CI builds, tests, and then reaches into the cluster to deploy. It works, and it is where nearly every team starts." });
        f.push({ stage: draw("n-act", "n-done", "e-act"), note: "On merge, the runner authenticates to the cluster and applies the manifests. Note what this requires: <b>production credentials living in the CI system</b>, usable by any job that can be made to run there." });
        f.push({ stage: draw("n-done", "n-act", "e-done"), note: "The workloads update. The deploy succeeded — and the only record of what was applied is a CI log with a retention policy." });
        f.push({ stage: draw("n-done", "n-out", "e-idle", "someone ran kubectl edit; nothing notices"), note: "<b>The gap.</b> A manual change is made in the cluster. There is no continuous comparison against the repository, so the drift persists silently until the next deploy overwrites it — or does not, because the field was never in your manifests." });
        f.push({
            stage: panesHTML([
                { title: "Push model", items: [{ text: "simple, few moving parts", cls: "is-done" }, { text: "any tool can deploy", cls: "is-done" }, { text: "cluster creds in CI", cls: "is-out" }, { text: "drift undetected", cls: "is-out" }, { text: "history = CI logs", cls: "is-out" }] },
            ]),
            note: "<b>The trade-off.</b> Push is simpler and perfectly reasonable for a small number of environments. It becomes uncomfortable at scale for two reasons: the credential blast radius grows with every repository that can deploy, and nothing in the system can answer \"is the cluster still what we said it should be?\". Switch the picker for the alternative.",
        });
        return f;
    },
};

/* ---- 13. Secrets ---- */

VIZ["secrets-flow"] = {
    title: "Where a password lives between your laptop and production",
    legend: [["lg-act", "in transit"], ["lg-done", "safe"], ["lg-out", "exposed"], ["lg-idle", "not involved"]],
    options: [
        { value: "baked", label: "Baked into the image" },
        { value: "injected", label: "Injected at run time" },
    ],
    build(option = "baked") {
        const f = [];

        if (option === "injected") {
            f.push({
                stage: panesHTML([
                    { title: "Image", items: [{ text: "code", cls: "is-done" }, { text: "dependencies", cls: "is-done" }, { text: "no credentials", cls: "is-done" }] },
                    { title: "Secret store", items: [{ text: "DB_PASSWORD", cls: "is-cmp" }, { text: "versioned + audited", cls: "is-cmp" }, { text: "encrypted at rest", cls: "is-cmp" }] },
                    { title: "Running container", items: [], empty: "not started" },
                ]),
                note: "The artifact contains no secrets at all — which also means the same artifact is valid in every environment, exactly as the promotion model requires. The credential lives in a purpose-built store: Vault, AWS Secrets Manager, a Kubernetes Secret backed by an external operator.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Image", items: [{ text: "code", cls: "is-done" }, { text: "no credentials", cls: "is-done" }] },
                    { title: "Secret store", items: [{ text: "DB_PASSWORD", cls: "is-act" }, { text: "read by: api-role", cls: "is-act" }] },
                    { title: "Running container", items: [{ text: "identity: api-role", cls: "is-act" }] },
                ]),
                note: "At start-up the workload proves <em>who it is</em> — an IAM role from instance metadata, a Kubernetes service account token, a workload identity. Note there is no bootstrap password: the platform vouches for the process, which is the only way out of the \"secret to get the secret\" regress.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Image", items: [{ text: "code", cls: "is-done" }] },
                    { title: "Secret store", items: [{ text: "issued lease, TTL 1 h", cls: "is-done" }, { text: "audit: api-role, 09:14 UTC", cls: "is-done" }] },
                    { title: "Running container", items: [{ text: "DB_PASSWORD in memory", cls: "is-act" }, { text: "expires in 1 h", cls: "is-act" }] },
                ]),
                note: "The secret is handed over for a limited time and held in memory or a <code>tmpfs</code> mount. Two consequences worth noticing: every read is <b>attributable</b> in an audit log, and a leaked value is worth an hour rather than forever.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Rotation — the real test", items: [{ text: "change the value in the store", cls: "is-done" }, { text: "leases renew with the new value", cls: "is-done" }, { text: "no rebuild, no redeploy", cls: "is-done" }, { text: "old value invalid within the TTL", cls: "is-done" }] },
                ]),
                note: "<b>This is the property that matters.</b> Ask of any secrets design: <em>how long does it take to rotate a leaked credential?</em> Here it is minutes and touches nothing else. With secrets in images it is a rebuild and redeploy of every service that embedded it — which is why, in practice, those credentials are never rotated at all.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Good", items: [{ text: "secret manager + short TTL", cls: "is-done" }, { text: "workload identity, no static keys", cls: "is-done" }, { text: "injected as env or tmpfs file", cls: "is-done" }, { text: "scanned for in pre-commit and CI", cls: "is-done" }] },
                    { title: "Acceptable", items: [{ text: "sealed/encrypted secrets in Git", cls: "is-cmp" }, { text: "CI secret store → env var", cls: "is-cmp" }] },
                    { title: "Never", items: [{ text: "in the image", cls: "is-out" }, { text: "in Git, even in a private repo", cls: "is-out" }, { text: "in a build ARG", cls: "is-out" }, { text: "in a log line or an exception", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Secrets are the one thing that must <em>not</em> follow the rest of your configuration into the artifact. Treat them as a run-time input with an identity, a TTL and an audit trail — and assume every one of them will eventually appear in a log, because eventually one will.",
            });
            return f;
        }

        f.push({
            stage: codeHTML([
                "FROM python:3.12-slim",
                "ENV DB_PASSWORD=hunter2-prod",
                "COPY . .",
                "CMD [\"python\", \"app.py\"]",
            ], { 1: "is-out" }),
            note: "It works on the first try, which is precisely the problem — nothing about this fails until it fails badly. The password is now a <b>layer in the image</b>.",
        });
        f.push({
            stage: panesHTML([
                { title: "Image layers", stack: true, items: [{ text: "CMD python app.py", cls: "is-cmp" }, { text: "COPY . .", cls: "is-cmp" }, { text: "ENV DB_PASSWORD=hunter2-prod", cls: "is-out" }, { text: "FROM python:3.12-slim", cls: "is-cmp" }] },
                { title: "Who can read it", items: [{ text: "anyone with registry pull access", cls: "is-out" }, { text: "docker history — no pull needed", cls: "is-out" }, { text: "every CI job that builds it", cls: "is-out" }, { text: "every cached layer on every node", cls: "is-out" }] },
            ]),
            note: "<b>Layers are not private.</b> <code>docker history</code> prints build instructions, and a pull gets the raw filesystem. \"It is in a private registry\" is a statement about one perimeter, not about the secret.",
        });
        f.push({
            stage: codeHTML([
                "FROM python:3.12-slim",
                "COPY secrets.env /tmp/secrets.env",
                "RUN ./configure.sh && rm /tmp/secrets.env   # \"deleted\"",
                "COPY . .",
            ], { 1: "is-out", 2: "is-out" }),
            note: "<b>The clever fix that does not work.</b> Deleting a file in a later layer only adds a whiteout marker — the earlier layer still contains the bytes, and anyone can extract them. Layers are append-only; there is no delete.",
        });
        f.push({
            stage: panesHTML([
                { title: "Consequences", items: [{ text: "rotation = rebuild + redeploy all", cls: "is-out" }, { text: "one image cannot serve two envs", cls: "is-out" }, { text: "no audit of who read it", cls: "is-out" }, { text: "leak is permanent in the registry", cls: "is-out" }] },
            ]),
            note: "Beyond the exposure, this breaks the promotion model: if the image contains production credentials, the image you tested in staging is not the image you ship. <b>Secrets in the artifact and build-once-promote-everywhere are mutually exclusive.</b> Switch the picker for the alternative.",
        });
        return f;
    },
};

/* ---- 14. Deploy is not release ---- */

VIZ["feature-flag"] = {
    title: "Separating deploy from release",
    legend: [["lg-act", "seeing the new path"], ["lg-done", "shipped and healthy"], ["lg-out", "problem"], ["lg-idle", "old path"]],
    build() {
        const f = [];
        const state = (deployed, pct, err, note) =>
            panesHTML([
                { title: "Code in production", items: [{ text: deployed ? "v1.9.0 — new path present" : "v1.8.0", cls: deployed ? "is-done" : "is-cmp" }] },
                { title: "Flag: new-pricing", items: [{ text: `${pct}% of users`, cls: pct ? "is-act" : "is-ghost" }] },
                { title: "Error rate", items: [{ text: err, cls: err === "0.2%" ? "is-done" : "is-out" }] },
            ]) + (note || "");
        f.push({
            stage: state(false, 0, "0.2%"),
            note: "Two words that people use interchangeably and should not. <b>Deploy</b> means the code is running on the servers. <b>Release</b> means users experience it. Conflating them is what makes deploys frightening.",
        });
        f.push({
            stage: state(true, 0, "0.2%"),
            note: "<b>Deployed, not released.</b> The new pricing engine is in production, executing zero times, because the flag is off. Nothing about the user-visible system changed — so the deploy itself carries almost no risk, and can happen at 11 a.m. on a Tuesday.",
        });
        f.push({
            stage: state(true, 1, "0.2%"),
            note: "The flag opens to internal staff and 1% of users. This is where release risk actually lives, and it is now a <em>runtime</em> decision made by a product owner, not a deployment made by an engineer.",
        });
        f.push({
            stage: state(true, 25, "0.2%"),
            note: "25%. Metrics are compared between the two cohorts — not just errors and latency, but the business outcome the change was supposed to improve. A change that is technically healthy and commercially worse is still a failure, and only this comparison finds it.",
        });
        f.push({
            stage: state(true, 60, "2.9%"),
            note: "<b>At 60% something breaks.</b> The remedy is not a rollback, a rebuild or a pipeline run — it is setting a value to zero. Recovery time is however long your flag system takes to propagate, typically seconds.",
        });
        f.push({
            stage: state(true, 0, "0.2%"),
            note: "Back to baseline, with the fix now a normal piece of work rather than an emergency. <b>Note the asymmetry that makes this powerful:</b> turning a flag off is instant and safe, while rolling back a deploy is neither, especially once a database migration is involved.",
        });
        f.push({
            stage: panesHTML([
                { title: "Flags earn their keep for", items: [{ text: "risky refactors behind a switch", cls: "is-done" }, { text: "gradual rollout by cohort", cls: "is-done" }, { text: "kill switches for expensive paths", cls: "is-done" }, { text: "trunk-based dev of big features", cls: "is-done" }] },
                { title: "Flags cost you", items: [{ text: "every flag doubles the paths to test", cls: "is-out" }, { text: "stale flags rot into dead code", cls: "is-out" }, { text: "nested flags are unreasonable", cls: "is-out" }, { text: "a flag service is now a dependency", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> A flag is a branch that lives in production instead of in Git — cheaper to merge, but it does not disappear on its own. Give every flag an owner and an expiry date at the moment you create it, and delete it once the decision it existed to defer has been made. Teams that skip this end up with a configuration surface nobody can reason about, which is the same problem they were trying to escape.",
        });
        return f;
    },
};

/* ---- 15. Database migrations ---- */

VIZ["db-migration"] = {
    title: "Shipping a schema change without downtime",
    legend: [["lg-act", "in progress"], ["lg-done", "compatible"], ["lg-out", "broken"], ["lg-idle", "not yet"]],
    options: [
        { value: "naive", label: "Rename the column" },
        { value: "expand", label: "Expand and contract" },
    ],
    build(option = "naive") {
        const f = [];
        const world = (schema, v1, v2, err) =>
            panesHTML([
                { title: "Schema", items: schema },
                { title: "v1 pods", items: v1 },
                { title: "v2 pods", items: v2 },
                { title: "Errors", items: [{ text: err, cls: err === "none" ? "is-done" : "is-out" }] },
            ]);

        if (option === "expand") {
            f.push({
                stage: world([{ text: "email", cls: "is-done" }], [{ text: "reads email", cls: "is-done" }], [], "none"),
                note: "Same goal — rename <code>email</code> to <code>contact_email</code> — done in four deploys instead of one. It looks like more work because it is more work; it is also the only version that never has a broken minute.",
            });
            f.push({
                stage: world([{ text: "email", cls: "is-done" }, { text: "contact_email (new, nullable)", cls: "is-act" }], [{ text: "reads email", cls: "is-done" }], [], "none"),
                note: "<b>Expand.</b> Add the new column, nullable, with no other change. Old code does not know it exists, so this migration is safe to run at any time and safe to leave in place. <em>Additive changes are always deployable.</em>",
            });
            f.push({
                stage: world([{ text: "email", cls: "is-done" }, { text: "contact_email", cls: "is-done" }], [{ text: "reads email", cls: "is-cmp" }], [{ text: "writes both, reads new", cls: "is-act" }], "none"),
                note: "<b>Deploy code that writes both columns</b> and prefers the new one for reads. During the rolling update, v1 and v2 pods run side by side — and both work, because every row either version needs is present.",
            });
            f.push({
                stage: world([{ text: "email", cls: "is-cmp" }, { text: "contact_email (backfilled)", cls: "is-done" }], [], [{ text: "writes both, reads new", cls: "is-done" }], "none"),
                note: "<b>Backfill</b> the historical rows in batches, in the background, at a rate the database can absorb. Not one <code>UPDATE</code> over ten million rows — that locks the table and produces the outage you were avoiding.",
            });
            f.push({
                stage: world([{ text: "contact_email", cls: "is-done" }], [], [{ text: "reads and writes new only", cls: "is-done" }], "none"),
                note: "<b>Contract.</b> Deploy code that no longer mentions the old column, then — days later, once you are sure no rollback will need it — drop it. Dropping last is what preserves your ability to roll back the code at every earlier step.",
            });
            f.push({
                stage: panesHTML([
                    { title: "The invariant", items: [{ text: "each deploy is compatible", cls: "is-done" }, { text: "with the schema before it", cls: "is-done" }, { text: "and the schema after it", cls: "is-done" }] },
                    { title: "Which means", items: [{ text: "rolling updates are safe", cls: "is-done" }, { text: "code rollback is safe", cls: "is-done" }, { text: "migrations run independently", cls: "is-done" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Expand-and-contract is the general answer to every destructive schema change: adding a column, splitting a table, changing a type, moving a field into a new service. The rule underneath it is short — <em>never deploy a change that requires two things to happen at the same instant</em> — and it is what makes zero-downtime deployment possible at all.",
            });
            return f;
        }

        f.push({
            stage: world([{ text: "email", cls: "is-done" }], [{ text: "reads email", cls: "is-done" }], [], "none"),
            note: "Production today: one column, one version of the code, everything consistent.",
        });
        f.push({
            stage: world([{ text: "email", cls: "is-done" }], [{ text: "reads email", cls: "is-done" }], [{ text: "reads contact_email", cls: "is-act" }], "none"),
            note: "The change renames <code>email</code> to <code>contact_email</code>, code and migration in one deploy. The rollout begins and the first v2 Pod starts — <b>before</b> the migration has run, because the two are not atomic.",
        });
        f.push({
            stage: world([{ text: "email", cls: "is-done" }], [{ text: "reads email", cls: "is-done" }], [{ text: "reads contact_email", cls: "is-out" }], "v2: column does not exist"),
            note: "v2 queries a column that is not there yet. Every request it serves fails. If the migration runs as a separate job you may be here for minutes; if it runs in an init container you may be here forever, deadlocked.",
        });
        f.push({
            stage: world([{ text: "contact_email", cls: "is-act" }], [{ text: "reads email", cls: "is-out" }], [{ text: "reads contact_email", cls: "is-done" }], "v1: column does not exist"),
            note: "<b>The migration lands and the failure simply changes sides.</b> Now the old Pods — still serving most of your traffic during a rolling update — reference a column that no longer exists. There is no ordering of these two steps that avoids an outage.",
        });
        f.push({
            stage: world([{ text: "contact_email", cls: "is-act" }], [{ text: "rolled back: reads email", cls: "is-out" }], [], "still broken"),
            note: "<b>And now the genuinely bad part.</b> You roll the code back, and it does not help — the schema is already renamed, so v1 is broken against it. The deployment is reversible; the migration is not. This is how a five-minute incident becomes an hour.",
        });
        f.push({
            stage: panesHTML([
                { title: "Why it failed", items: [{ text: "code and schema coupled in one step", cls: "is-out" }, { text: "rolling update ⇒ both versions live", cls: "is-out" }, { text: "the destructive step came first", cls: "is-out" }, { text: "rollback did not restore the schema", cls: "is-out" }] },
            ]),
            note: "<b>The lesson.</b> Any deploy that requires the code and the database to change at the same instant will break, because in a modern deployment the two versions of your code <em>always</em> overlap. Switch the picker for the pattern that fixes it.",
        });
        return f;
    },
};

/* ---- 16. The three pillars ---- */

VIZ["observability-pillars"] = {
    title: "One request, three kinds of evidence",
    legend: [["lg-act", "the question you are asking"], ["lg-done", "answers it"], ["lg-out", "cannot answer it"], ["lg-idle", "idle"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "Metrics", items: [{ text: "http_requests_total", cls: "is-cmp" }, { text: "latency_seconds p99", cls: "is-cmp" }, { text: "cheap, numeric, aggregated", cls: "is-done" }] },
                { title: "Logs", items: [{ text: "one line per event", cls: "is-cmp" }, { text: "with full context", cls: "is-cmp" }, { text: "expensive at volume", cls: "is-out" }] },
                { title: "Traces", items: [{ text: "one request across services", cls: "is-cmp" }, { text: "parent/child spans", cls: "is-cmp" }, { text: "usually sampled", cls: "is-out" }] },
            ]),
            note: "Three signals, and the useful way to tell them apart is not by their format but by the <em>question</em> each one answers cheaply.",
        });
        f.push({
            stage: panesHTML([
                { title: "\"Is something wrong?\"", items: [{ text: "Metrics — yes", cls: "is-done" }, { text: "Logs — too slow to aggregate", cls: "is-out" }, { text: "Traces — sampled, not a count", cls: "is-out" }] },
            ]),
            note: "<b>Metrics detect.</b> They are pre-aggregated numbers over time, so a dashboard covering a year costs almost nothing to query. This is what alerts fire on — never on logs, because counting log lines to decide whether to page someone is both slow and expensive.",
        });
        f.push({
            stage: panesHTML([
                { title: "\"Where is it wrong?\"", items: [{ text: "Traces — yes", cls: "is-done" }, { text: "Metrics — per-service only", cls: "is-out" }, { text: "Logs — if you can correlate them", cls: "is-cmp" }] },
            ]),
            note: "<b>Traces localise.</b> When latency doubles across eight services, per-service metrics show eight graphs that all look slightly bad. A trace shows one request's path and where the time actually went — which is the difference between a hypothesis and a measurement.",
        });
        f.push({
            stage: panesHTML([
                { title: "\"Why is it wrong?\"", items: [{ text: "Logs — yes", cls: "is-done" }, { text: "Metrics — no detail", cls: "is-out" }, { text: "Traces — attributes help", cls: "is-cmp" }] },
            ]),
            note: "<b>Logs explain.</b> Once you know which service and which code path, you need the exception, the parameters and the identifiers. Structured JSON with a <code>trace_id</code> on every line is what makes this a query rather than a grep.",
        });
        f.push({
            stage: panesHTML([
                { title: "Golden signals — alert on these", items: [{ text: "Latency — how slow", cls: "is-act" }, { text: "Traffic — how much", cls: "is-act" }, { text: "Errors — how often failing", cls: "is-act" }, { text: "Saturation — how full", cls: "is-act" }] },
                { title: "Not these", items: [{ text: "CPU is at 80%", cls: "is-out" }, { text: "a pod restarted", cls: "is-out" }, { text: "disk 70% full", cls: "is-out" }] },
            ]),
            note: "<b>Alert on symptoms, not causes.</b> High CPU with happy users is not an incident; low CPU with failing checkouts is. Cause-based alerts are how pagers become noise, and a pager that cries wolf is worse than no pager because it trains people to wait before looking.",
        });
        f.push({
            stage: panesHTML([
                { title: "A metric's cost", items: [{ text: "http_requests{route,status}", cls: "is-done" }, { text: "≈ 40 series", cls: "is-done" }, { text: "http_requests{…,user_id}", cls: "is-out" }, { text: "≈ 40 × every user, forever", cls: "is-out" }] },
            ]),
            note: "<b>Cardinality is the bill.</b> A time-series database stores one series per unique label combination. Adding a high-cardinality label — user ID, request ID, full URL — multiplies storage and query cost without limit. High-cardinality context belongs on logs and traces, which are indexed differently.",
        });
        f.push({
            stage: panesHTML([
                { title: "Monitoring", items: [{ text: "known failure modes", cls: "is-cmp" }, { text: "dashboards you built", cls: "is-cmp" }, { text: "\"is X broken?\"", cls: "is-cmp" }] },
                { title: "Observability", items: [{ text: "unknown failure modes", cls: "is-done" }, { text: "questions you did not anticipate", cls: "is-done" }, { text: "\"why is this cohort slow?\"", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Monitoring answers questions you thought of in advance; observability is the property of being able to answer new ones without shipping code. The practical test is concrete: when something breaks in a way you have never seen, can you find out why using data that already exists? If the answer is \"we would need to add a log line and deploy\", you have monitoring.",
        });
        return f;
    },
};

/* ---- 17. Distributed tracing ---- */

VIZ["trace-spans"] = {
    title: "Reading a trace: where did 1.8 seconds go?",
    legend: [["lg-act", "the culprit"], ["lg-done", "fast"], ["lg-cmp", "waiting on a child"], ["lg-idle", "not yet observed"]],
    build() {
        const W = 700;
        const lane = (label, marks) => ({ label, marks });
        const ticks = [{ at: 0, label: "0 ms" }, { at: 0.5, label: "900 ms" }, { at: 1, label: "1 800 ms" }];
        const f = [];
        f.push({
            stage: timelineHTML(W, [lane("GET /checkout", [{ at: 0, width: 1, label: "1 800 ms", state: "n-cmp" }])], ticks),
            note: "The complaint is \"checkout is slow\". The metric confirms it — p99 is 1.8 seconds — and then stops being useful, because a single number cannot tell you which of eleven services caused it.",
        });
        f.push({
            stage: timelineHTML(W, [
                lane("GET /checkout", [{ at: 0, width: 1, label: "1 800 ms", state: "n-cmp" }]),
                lane("auth.verify", [{ at: 0.02, width: 0.04, label: "70 ms", state: "n-done" }]),
            ], ticks),
            note: "A <b>trace</b> is the tree of work done for one request. Each box is a <b>span</b> with a start, a duration and a parent. Authentication takes 70 ms — fine, and now permanently ruled out.",
        });
        f.push({
            stage: timelineHTML(W, [
                lane("GET /checkout", [{ at: 0, width: 1, label: "1 800 ms", state: "n-cmp" }]),
                lane("auth.verify", [{ at: 0.02, width: 0.04, label: "70 ms", state: "n-done" }]),
                lane("cart.get", [{ at: 0.07, width: 0.05, label: "90 ms", state: "n-done" }]),
                lane("pricing.quote", [{ at: 0.13, width: 0.75, label: "1 350 ms", state: "n-act" }]),
            ], ticks),
            note: "<b>There it is.</b> The pricing service holds 1 350 of the 1 800 ms. Everything else is noise. Note how quickly this narrows the search — no correlating timestamps across four log systems, no guessing.",
        });
        f.push({
            stage: timelineHTML(W, [
                lane("pricing.quote", [{ at: 0.13, width: 0.75, label: "1 350 ms", state: "n-act" }]),
                lane("db SELECT rules", [{ at: 0.15, width: 0.03, label: "22 ms", state: "n-done" }]),
                lane("db SELECT tier", [{ at: 0.19, width: 0.03, label: "19 ms", state: "n-done" }]),
                lane("db SELECT tier", [{ at: 0.23, width: 0.03, label: "21 ms", state: "n-done" }]),
                lane("… ×63 more", [{ at: 0.27, width: 0.6, label: "63 queries", state: "n-act" }]),
            ], ticks),
            note: "Expand the slow span and the shape gives the diagnosis away: 66 near-identical queries in sequence. This is the <b>N+1 query</b> — one query for the list, then one per row — and no individual query is slow enough for a slow-query log to notice.",
        });
        f.push({
            stage: timelineHTML(W, [
                lane("pricing.quote (after)", [{ at: 0.13, width: 0.06, label: "115 ms", state: "n-done" }]),
                lane("db SELECT … IN (…)", [{ at: 0.15, width: 0.03, label: "31 ms", state: "n-done" }]),
            ], ticks),
            note: "One batched query instead of 66 round trips. The fix was ten minutes; <em>finding</em> it without a trace is an afternoon of adding timing logs and redeploying.",
        });
        f.push({
            stage: panesHTML([
                { title: "What makes tracing work", items: [{ text: "trace_id propagated in headers", cls: "is-act" }, { text: "every service instrumented", cls: "is-act" }, { text: "context crosses queues too", cls: "is-act" }, { text: "trace_id on every log line", cls: "is-act" }] },
                { title: "Sampling", items: [{ text: "head: decide at the start, cheap", cls: "is-cmp" }, { text: "tail: keep the slow and failed ones", cls: "is-done" }, { text: "always keep errors", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> A trace is only as complete as its least-instrumented hop — one service that drops the <code>traceparent</code> header cuts the tree in half and hides everything beyond it. Instrument with OpenTelemetry at the boundaries, propagate context religiously including through message queues, and sample on the tail so that the traces you keep are the ones that were interesting.",
        });
        return f;
    },
};

/* ---- 18. SLOs and error budgets ---- */

VIZ["error-budget"] = {
    title: "An SLO turns reliability into a number you can spend",
    legend: [["lg-done", "budget remaining"], ["lg-act", "burning"], ["lg-out", "exhausted"], ["lg-idle", "unused"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "SLI — what you measure", items: [{ text: "successful requests ÷ total", cls: "is-cmp" }, { text: "measured at the load balancer", cls: "is-cmp" }] },
                { title: "SLO — the target", items: [{ text: "99.9% over 30 days", cls: "is-act" }] },
                { title: "Error budget — what is left", items: [{ text: "0.1% ≈ 43 min / month", cls: "is-done" }] },
            ]),
            note: "Start with the arithmetic, because it is the part that makes the rest concrete. An SLI is a measurement, an SLO is a target for it, and <b>the error budget is one minus the target</b> — 99.9% over thirty days permits 43 minutes of failure.",
        });
        f.push({
            stage: barsHTML([43, 43, 43, 43, 43], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-done" }),
            note: "Read that as permission rather than as a threat. Those 43 minutes are <em>budgeted</em>: you are expected to spend them on deploys, experiments and calculated risks. A month that ends at 100% is not a triumph — it means you were too cautious to ship.",
        });
        f.push({
            stage: barsHTML([43, 38, 31, 30, 29], { 0: "is-done", 1: "is-done", 2: "is-act", 3: "is-done", 4: "is-done" }),
            note: "Week one: a bad canary costs five minutes, a dependency wobbles for seven. Fourteen minutes spent, twenty-nine left, and nobody needs to be woken up — the budget absorbs exactly this kind of normal turbulence.",
        });
        f.push({
            stage: barsHTML([43, 38, 31, 12, 4], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-act", 4: "is-out" }),
            note: "<b>Then a real incident.</b> A memory leak causes 25 minutes of elevated errors before it is mitigated. Four minutes of budget remain with a week and a half of the window still to go.",
        });
        f.push({
            stage: panesHTML([
                { title: "Budget nearly gone ⇒", items: [{ text: "freeze feature releases", cls: "is-out" }, { text: "reliability work becomes priority", cls: "is-act" }, { text: "raise deploy scrutiny", cls: "is-act" }] },
                { title: "Budget healthy ⇒", items: [{ text: "ship faster", cls: "is-done" }, { text: "take on risk deliberately", cls: "is-done" }, { text: "run chaos experiments", cls: "is-done" }] },
            ]),
            note: "<b>This is what the budget is for.</b> It converts \"should we slow down?\" from an argument between engineering and product into a rule agreed in advance. The policy matters more than the number — an SLO with no consequence attached is a dashboard, not a decision.",
        });
        f.push({
            stage: panesHTML([
                { title: "Burn rate — page on this", items: [{ text: "14.4× for 1 h → page", cls: "is-out" }, { text: "6× for 6 h → page", cls: "is-act" }, { text: "1× for 3 d → ticket", cls: "is-cmp" }] },
                { title: "Why not a raw threshold", items: [{ text: "\"errors > 1%\" fires on blips", cls: "is-out" }, { text: "burn rate weighs severity × time", cls: "is-done" }] },
            ]),
            note: "<b>Alert on burn rate, not on instantaneous errors.</b> Burning budget 14× faster than sustainable exhausts a month in two days — that deserves a phone call at 3 a.m. A slow burn deserves a ticket. This single change is usually the largest reduction in pager noise a team can make.",
        });
        f.push({
            stage: panesHTML([
                { title: "99%", items: [{ text: "7.2 h / month", cls: "is-done" }, { text: "internal tools", cls: "is-cmp" }] },
                { title: "99.9%", items: [{ text: "43 min / month", cls: "is-done" }, { text: "most web services", cls: "is-cmp" }] },
                { title: "99.99%", items: [{ text: "4.3 min / month", cls: "is-act" }, { text: "multi-region, big team", cls: "is-out" }] },
                { title: "99.999%", items: [{ text: "26 s / month", cls: "is-out" }, { text: "almost nobody", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Each extra nine costs roughly ten times more and buys a benefit users often cannot perceive — especially when their own network is less reliable than your service. Choose the lowest target your users genuinely need, write down what happens when you miss it, and spend the difference on shipping.",
        });
        return f;
    },
};

/* ---- 19. Incident response ---- */

VIZ["incident-timeline"] = {
    title: "Anatomy of an incident — where the minutes go",
    legend: [["lg-out", "users affected"], ["lg-act", "responding"], ["lg-done", "recovered"], ["lg-idle", "normal"]],
    build() {
        const W = 700;
        const ticks = [{ at: 0, label: "00:00" }, { at: 0.5, label: "00:30" }, { at: 1, label: "01:00" }];
        const f = [];
        f.push({
            stage: timelineHTML(W, [{ label: "impact", marks: [{ at: 0.05, width: 0.75, label: "users failing", state: "n-out" }] }], ticks),
            note: "One incident, forty-five minutes of user-visible impact. Every improvement you can make to incident response is a reduction of one of the segments we are about to separate.",
        });
        f.push({
            stage: timelineHTML(W, [
                { label: "impact", marks: [{ at: 0.05, width: 0.75, label: "users failing", state: "n-out" }] },
                { label: "detect", marks: [{ at: 0.05, width: 0.2, label: "12 min undetected", state: "n-out" }] },
            ], ticks),
            note: "<b>Time to detect.</b> Twelve minutes passed before anyone knew, because the alert watched CPU rather than the user-facing error rate. This segment is bought back with symptom-based alerting, and it is usually the cheapest one to shorten.",
        });
        f.push({
            stage: timelineHTML(W, [
                { label: "impact", marks: [{ at: 0.05, width: 0.75, label: "users failing", state: "n-out" }] },
                { label: "detect", marks: [{ at: 0.05, width: 0.2, label: "12 min", state: "n-out" }] },
                { label: "acknowledge", marks: [{ at: 0.25, width: 0.08, label: "5 min", state: "n-act" }] },
            ], ticks),
            note: "<b>Time to acknowledge.</b> Five minutes for a human to be woken, orient, and take the incident. It shrinks with a clear rotation and a runbook link in the alert itself — and it grows without bound if the alert went to a channel rather than to a person.",
        });
        f.push({
            stage: timelineHTML(W, [
                { label: "impact", marks: [{ at: 0.05, width: 0.75, label: "users failing", state: "n-out" }] },
                { label: "detect", marks: [{ at: 0.05, width: 0.2, label: "12 min", state: "n-out" }] },
                { label: "acknowledge", marks: [{ at: 0.25, width: 0.08, label: "5 min", state: "n-act" }] },
                { label: "diagnose", marks: [{ at: 0.33, width: 0.35, label: "21 min", state: "n-act" }] },
            ], ticks),
            note: "<b>Time to diagnose</b> — almost always the longest segment, and the one observability exists to attack. Twenty-one minutes of \"what changed?\". Note that the answer is usually <em>a deploy</em>, which is why a deployment marker on every dashboard is worth more than most tooling.",
        });
        f.push({
            stage: timelineHTML(W, [
                { label: "impact", marks: [{ at: 0.05, width: 0.75, label: "users failing", state: "n-out" }] },
                { label: "detect", marks: [{ at: 0.05, width: 0.2, label: "12 min", state: "n-out" }] },
                { label: "acknowledge", marks: [{ at: 0.25, width: 0.08, label: "5 min", state: "n-act" }] },
                { label: "diagnose", marks: [{ at: 0.33, width: 0.35, label: "21 min", state: "n-act" }] },
                { label: "mitigate", marks: [{ at: 0.68, width: 0.12, label: "7 min", state: "n-done" }] },
            ], ticks),
            note: "<b>Mitigate, do not fix.</b> Roll back, flip the flag off, shed load, fail over. The instinct to find the root cause first is the single most expensive habit in incident response — <em>stop the bleeding, then investigate on a calm afternoon</em>.",
        });
        f.push({
            stage: timelineHTML(W, [
                { label: "impact (better)", marks: [{ at: 0.05, width: 0.16, label: "9 min", state: "n-out" }] },
                { label: "detect", marks: [{ at: 0.05, width: 0.03, label: "1", state: "n-done" }] },
                { label: "acknowledge", marks: [{ at: 0.08, width: 0.03, label: "2", state: "n-done" }] },
                { label: "diagnose", marks: [{ at: 0.11, width: 0.06, label: "4 min", state: "n-act" }] },
                { label: "mitigate", marks: [{ at: 0.17, width: 0.04, label: "2", state: "n-done" }] },
            ], ticks),
            note: "<b>The same incident, on a team that has done the work.</b> Burn-rate alert on the SLI fires in a minute, the pager reaches a named person, the deploy marker on the error graph makes the cause obvious, and the mitigation is a rollback that is practised and boring. Forty-five minutes became nine — and not one minute of that came from better code.",
        });
        f.push({
            stage: panesHTML([
                { title: "Roles, from the first minute", items: [{ text: "incident commander — decides", cls: "is-act" }, { text: "operations lead — types", cls: "is-act" }, { text: "communications — tells everyone", cls: "is-act" }] },
                { title: "Postmortem rules", items: [{ text: "blameless — systems, not people", cls: "is-done" }, { text: "timeline written from data", cls: "is-done" }, { text: "actions have owners and dates", cls: "is-done" }, { text: "published, not filed", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Reliability comes from shortening the segments, not from preventing every incident — MTTR is a variable you control, incident frequency largely is not. And the postmortem is blameless for a practical reason rather than a kind one: the moment naming an individual becomes a possible outcome, people stop telling you what actually happened, and you lose the only data that would have prevented a recurrence.",
        });
        return f;
    },
};

/* ---- 20. Autoscaling ---- */

VIZ["autoscaling"] = {
    title: "Autoscaling reacts — which is why it is always late",
    legend: [["lg-act", "scaling"], ["lg-done", "healthy"], ["lg-out", "overloaded"], ["lg-idle", "idle"]],
    build() {
        const f = [];
        const shot = (load, pods, marks, tail) =>
            barsHTML(load, marks) + cellsHTML(pods.map(() => "pod"), Object.fromEntries(pods.map((s, i) => [i, s]))) + (tail || "");
        f.push({
            stage: shot([30, 32, 31, 30, 33], ["is-done", "is-done", "is-done"], { 0: "is-aux", 1: "is-aux", 2: "is-aux", 3: "is-aux", 4: "is-aux" }),
            note: "Steady state: three Pods at about 30% CPU. The Horizontal Pod Autoscaler is configured for a target of 70%, so it has nothing to do.",
        });
        f.push({
            stage: shot([33, 55, 78, 95, 98], ["is-done", "is-done", "is-done"], { 0: "is-aux", 1: "is-aux", 2: "is-cmp", 3: "is-out", 4: "is-out" }),
            note: "<b>Traffic spikes.</b> CPU passes the target and requests begin queueing. Users are already seeing latency — and no scaling has happened yet, because the metric has not even been scraped.",
        });
        f.push({
            stage: shot([98, 98, 97, 98, 98], ["is-out", "is-out", "is-out"], { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-out", 4: "is-out" }, panesHTML([{ title: "The lag nobody budgets for", items: [{ text: "metric scrape: 15 s", cls: "is-cmp" }, { text: "HPA evaluation: 15 s", cls: "is-cmp" }, { text: "scheduling + image pull: 20 s", cls: "is-cmp" }, { text: "app start + warm-up: 45 s", cls: "is-out" }, { text: "readiness gate: 10 s", cls: "is-cmp" }] }])),
            note: "<b>Here is the part that surprises people.</b> Between \"the metric crossed the line\" and \"a Pod is serving traffic\" there is a minute and a half of unavoidable delay. Autoscaling is a control loop with dead time, and no amount of tuning removes it.",
        });
        f.push({
            stage: shot([98, 96, 80, 62, 55], ["is-done", "is-done", "is-done", "is-active", "is-active", "is-active"], { 0: "is-out", 1: "is-out", 2: "is-cmp", 3: "is-aux", 4: "is-aux" }),
            note: "Three more Pods become ready and load per Pod falls back under target. The spike was absorbed — roughly ninety seconds after it started, which is fine for a gradual ramp and useless for a flash sale.",
        });
        f.push({
            stage: shot([25, 24, 26, 25, 24], ["is-done", "is-done", "is-done", "is-dim", "is-dim", "is-dim"], { 0: "is-aux", 1: "is-aux", 2: "is-aux", 3: "is-aux", 4: "is-aux" }),
            note: "Traffic falls. Scale-down is deliberately slower than scale-up — a stabilisation window of several minutes — because the cost of being briefly over-provisioned is money, and the cost of flapping is user-visible errors. <b>Asymmetric response is a design choice, not a bug.</b>",
        });
        f.push({
            stage: panesHTML([
                { title: "Scale on the wrong signal", items: [{ text: "CPU on an I/O-bound service", cls: "is-out" }, { text: "— it waits, it does not compute", cls: "is-out" }, { text: "so it never scales, and queues", cls: "is-out" }] },
                { title: "Scale on the right one", items: [{ text: "queue depth for workers", cls: "is-done" }, { text: "in-flight requests for APIs", cls: "is-done" }, { text: "p95 latency, RPS per pod", cls: "is-done" }] },
            ]),
            note: "<b>The most common autoscaling mistake</b> is scaling a service on CPU when CPU is not its constraint. A service that spends its time waiting on a database sits at 20% CPU while its queue grows without bound. Scale on the resource that is actually saturating.",
        });
        f.push({
            stage: panesHTML([
                { title: "Three layers, three speeds", items: [{ text: "HPA — pods, ~1 min", cls: "is-act" }, { text: "cluster autoscaler — nodes, ~3 min", cls: "is-cmp" }, { text: "VPA — right-size requests, hours", cls: "is-cmp" }] },
                { title: "When reacting is not enough", items: [{ text: "pre-scale for known events", cls: "is-done" }, { text: "keep warm headroom", cls: "is-done" }, { text: "shed load and degrade gracefully", cls: "is-done" }, { text: "queue instead of dropping", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Autoscaling is a cost-optimisation tool that happens to help with load — not a defence against sudden traffic. If your spikes arrive faster than your scale-up latency, the answers are pre-scaling on a schedule, permanent headroom, and load shedding. And remember the second-order effect: scaling your stateless tier ten-fold also multiplies the connection count hitting a database that cannot scale at all.",
        });
        return f;
    },
};

/* ---- 21. Supply chain ---- */

VIZ["supply-chain"] = {
    title: "Everything between a dependency and production is attack surface",
    legend: [["lg-act", "checking"], ["lg-done", "verified"], ["lg-out", "attack point"], ["lg-idle", "not reached"]],
    build() {
        const W = 760;
        const H = 230;
        const STEPS = [
            { label: "dependencies", sub: "npm, PyPI, base images" },
            { label: "source", sub: "your repo" },
            { label: "build", sub: "CI runner" },
            { label: "registry", sub: "image storage" },
            { label: "cluster", sub: "production" },
        ];
        const draw = (states, badge = "") => {
            let s = "";
            STEPS.forEach((st, i) => {
                s += boxHTML(20 + i * 150, 90, 130, 46, st.label, states[i] || "n-idle", st.sub);
                if (i < STEPS.length - 1) s += arrowHTML(152 + i * 150, 113, 168 + i * 150, 113, states[i] && states[i] !== "n-idle" ? "e-done" : "e-idle");
            });
            if (badge) s += capHTML(W / 2, 190, badge);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-done"]),
            note: "The path a byte takes to production. Most security effort goes into the second box — reviewing your own code — and every other box is a way in that skips review entirely.",
        });
        f.push({
            stage: draw(["n-out", "n-idle", "n-idle", "n-idle", "n-idle"], "typosquatting, hijacked maintainer, malicious postinstall"),
            note: "<b>Dependencies.</b> A typical service has thousands of transitive packages, any of which can execute code at install time. You did not choose most of them, you cannot read them, and a single compromised maintainer account puts code on your build machine.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-out", "n-idle", "n-idle"], "the build runner sees every secret you own"),
            note: "<b>The build.</b> This is the highest-value target in the chain: the runner holds registry credentials, signing keys and often cloud access, and it executes arbitrary code from the repository by design. A pull request from a fork that triggers a privileged workflow is a complete compromise.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-out", "n-idle"], "mutable tags: :latest is not a version"),
            note: "<b>The registry.</b> Tags are pointers and anyone with push access can move them. If your deployment says <code>image: api:latest</code>, you have no idea what you are running and no way to prove what you ran yesterday. Deploy by digest.",
        });
        f.push({
            stage: panesHTML([
                { title: "Know what you ship", items: [{ text: "SBOM generated at build", cls: "is-done" }, { text: "answers \"are we affected?\" in minutes", cls: "is-done" }] },
                { title: "Prove where it came from", items: [{ text: "sign the image (cosign)", cls: "is-done" }, { text: "provenance attestation", cls: "is-done" }] },
                { title: "Refuse the rest", items: [{ text: "admission policy: signed only", cls: "is-act" }, { text: "block on critical CVEs", cls: "is-act" }, { text: "deploy by digest, not tag", cls: "is-act" }] },
            ]),
            note: "<b>The three controls, in order of value.</b> An SBOM turns \"is our estate affected by this CVE?\" from a week of archaeology into a query. Signing plus an admission policy means unsigned images simply cannot run. Digest pinning makes what you deployed a fact rather than a recollection.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-act", "n-act", "n-done"], "verify at every hand-off, not once at the end"),
            note: "<b>The conclusion worth memorising.</b> Supply-chain security is about <em>hand-offs</em>: each arrow in this diagram should carry a verifiable claim about what came before it. Pin and lock your inputs, keep build credentials scoped and short-lived, sign the output, and refuse to run anything unsigned. None of it requires reading your dependencies — which is fortunate, because nobody can.",
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
