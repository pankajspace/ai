/* ==========================================================================
   TechToday - Kubernetes study guide
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
const LANG_KEY = "tt-devops-lang";  // shared with the other DevOps guides
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
   Reused platform widgets
   ========================================================================== */

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

/* ==========================================================================
   Kubernetes widgets
   ========================================================================== */

/* ---- 1. Pod lifecycle ---- */

VIZ["pod-lifecycle"] = {
    title: "From `kubectl apply` to a Pod serving traffic",
    legend: [["lg-act", "current phase"], ["lg-done", "complete"], ["lg-out", "failed"], ["lg-idle", "not reached"]],
    options: [
        { value: "happy", label: "A Pod that starts normally" },
        { value: "crash", label: "CrashLoopBackOff" },
    ],
    build(option = "happy") {
        const W = 760;
        const H = 250;
        const PHASES = [
            ["Pending", "accepted, no node yet"],
            ["Scheduled", "bound to node-3"],
            ["ContainerCreating", "pulling image, mounting"],
            ["Running", "process started"],
            ["Ready", "readiness probe passed"],
        ];
        const draw = (states, banner = "") => {
            let s = "";
            PHASES.forEach((p, i) => {
                s += boxHTML(18 + i * 150, 70, 132, 44, p[0], states[i] || "n-idle", p[1]);
                if (i < PHASES.length - 1) {
                    s += arrowHTML(152 + i * 150, 92, 166 + i * 150, 92, states[i] && states[i] !== "n-idle" ? "e-done" : "e-idle");
                }
            });
            if (banner) s += capHTML(W / 2, 214, banner);
            return svgHTML(W, H, s);
        };
        const f = [];

        if (option === "crash") {
            f.push({
                stage: draw(["n-done", "n-done", "n-done", "n-act"], "container started"),
                note: "The Pod reaches <b>Running</b>: the image was pulled and the process started. Everything up to this point is the platform's job and it succeeded.",
            });
            f.push({
                stage: draw(["n-done", "n-done", "n-done", "n-out"], "exit 1 after 0.4 s"),
                note: "Then your process exits. <code>restartPolicy: Always</code> means the kubelet restarts it &mdash; and because the cause is in your code or your configuration, it will exit again.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Restart backoff", items: [{ text: "restart 1 — after 10 s", cls: "is-cmp" }, { text: "restart 2 — after 20 s", cls: "is-cmp" }, { text: "restart 3 — after 40 s", cls: "is-act" }, { text: "restart 4 — after 80 s", cls: "is-act" }, { text: "capped at 5 min", cls: "is-out" }] },
                ]),
                note: "<b><code>CrashLoopBackOff</code> is not an error, it is a waiting state.</b> The kubelet doubles the delay between restarts so a broken Pod cannot hammer the cluster. Once it reaches five minutes, your fix also takes up to five minutes to be tried &mdash; which is why the loop feels so slow at exactly the moment you are iterating.",
            });
            f.push({
                stage: codeHTML([
                    "$ kubectl logs api-7d4-x9k --previous",
                    "",
                    "Traceback (most recent call last):",
                    "  File \"/app/config.py\", line 14, in load",
                    "    return os.environ[\"DATABASE_URL\"]",
                    "KeyError: 'DATABASE_URL'",
                ], { 0: "is-act", 5: "is-out" }),
                note: "<b>The one flag that matters: <code>--previous</code>.</b> Without it you read the logs of the container that is <em>currently</em> starting, which usually has not printed anything yet. With it you read the one that died, and the cause is normally in the last three lines.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Crashes with a traceback", items: [{ text: "missing env var or secret", cls: "is-out" }, { text: "cannot reach a dependency", cls: "is-out" }, { text: "migration failed", cls: "is-out" }] },
                    { title: "Crashes with nothing", items: [{ text: "exit 137 — OOMKilled", cls: "is-out" }, { text: "exit 127 — bad command / wrong arch", cls: "is-out" }, { text: "liveness probe killing it", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion.</b> Split the diagnosis on whether there is output. A traceback means your application ran and objected to something &mdash; nearly always configuration. Silence means it never really ran, and the exit code names which of the three causes it was.",
            });
            return f;
        }

        f.push({
            stage: draw(["n-act"], "kubectl apply — the object exists in etcd"),
            note: "<code>kubectl apply</code> writes an object and returns. Nothing is running yet: <b>Pending</b> means the API server accepted the Pod and no node has been chosen.",
        });
        f.push({
            stage: draw(["n-done", "n-act"], "scheduler picked node-3"),
            note: "The <b>scheduler</b> filters out nodes that cannot fit the Pod &mdash; not enough free CPU or memory against your <code>requests</code>, an untolerated taint, a volume in the wrong zone &mdash; then scores the rest and binds the winner. If nothing survives filtering, the Pod stays <code>Pending</code> and the events say exactly why.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-act"], "pull image, attach network, mount volumes"),
            note: "The <b>kubelet</b> on that node takes over: pull the image, set up the network namespace, mount the volumes and Secrets, then start the containers. This is where <code>ImagePullBackOff</code> appears if the tag is wrong or the registry credentials are missing.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-act"], "process started — but is it usable?"),
            note: "<b>Running</b> means the process started. That is all it means. It says nothing about whether your application has connected to its database, warmed a cache or begun listening &mdash; which is exactly the gap the next phase closes.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-act"], "readiness probe passed → added to Service endpoints"),
            note: "<b>Ready</b> is the one that matters. The readiness probe succeeded, so the endpoints controller adds this Pod to its Service and traffic begins arriving. Without a readiness probe, Kubernetes treats <em>Running</em> as <em>Ready</em> &mdash; which is why a rollout can send users to a process that is not listening yet.",
        });
        f.push({
            stage: panesHTML([
                { title: "Pod phase — coarse", items: [{ text: "Pending", cls: "is-cmp" }, { text: "Running", cls: "is-act" }, { text: "Succeeded / Failed", cls: "is-done" }] },
                { title: "Conditions — what you read", items: [{ text: "PodScheduled", cls: "is-done" }, { text: "Initialized", cls: "is-done" }, { text: "ContainersReady", cls: "is-act" }, { text: "Ready", cls: "is-act" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> <code>kubectl get pods</code> shows the phase, and the phase is too coarse to debug with. <code>kubectl describe pod</code> shows the <em>conditions</em> and the events, and the false condition plus the last event almost always names the problem.",
        });
        return f;
    },
};

/* ---- 2. Rolling update ---- */

VIZ["rollout"] = {
    title: "What a rolling update does to your replicas",
    legend: [["lg-done", "v2 ready"], ["lg-act", "starting"], ["lg-out", "terminating"], ["lg-idle", "v1 serving"]],
    options: [
        { value: "healthy", label: "With a readiness probe" },
        { value: "noprobe", label: "Without a readiness probe" },
    ],
    build(option = "healthy") {
        const pods = (arr, marks) => cellsHTML(arr, marks);
        const rs = (oldN, newN, serving) =>
            panesHTML([
                { title: "ReplicaSet v1 (old)", items: [{ text: `${oldN} replicas`, cls: oldN ? "is-cmp" : "is-ghost" }] },
                { title: "ReplicaSet v2 (new)", items: [{ text: `${newN} replicas`, cls: newN ? "is-done" : "is-ghost" }] },
                { title: "Serving traffic", items: [{ text: serving, cls: serving.startsWith("4") ? "is-done" : "is-out" }] },
            ]);
        const f = [];

        if (option === "noprobe") {
            f.push({
                stage: pods(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + rs(4, 0, "4 pods"),
                note: "Four healthy Pods, no <code>readinessProbe</code> defined. Everything looks identical to the healthy case &mdash; which is the problem.",
            });
            f.push({
                stage: pods(["v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-active" }) + rs(3, 1, "4 pods"),
                note: "A v2 Pod starts. Its process is up but the application needs eight seconds to connect to the database and begin listening. <b>Kubernetes has no way to know that</b>, so it treats <em>Running</em> as <em>Ready</em> and adds the Pod to the Service endpoints immediately.",
            });
            f.push({
                stage: pods(["v1", "v1", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-active", 3: "is-active" }) + rs(2, 2, "2 good, 2 refusing"),
                note: "Because the new Pod counted as available, the controller terminated an old one and started another new one. <b>Half your traffic is now going to processes that are not listening</b> &mdash; connection refused, which the ingress turns into a 502.",
            });
            f.push({
                stage: pods(["v2", "v2", "v2", "v2"], { 0: "is-active", 1: "is-active", 2: "is-active", 3: "is-active" }) + rs(0, 4, "0 good, 4 refusing"),
                note: "The rollout completes in seconds and reports success. Every old Pod is gone and no new one is serving yet. For the next several seconds the service is entirely down &mdash; and <code>kubectl rollout status</code> said it worked.",
            });
            f.push({
                stage: panesHTML([
                    { title: "What you will see", items: [{ text: "502s for ~10 s after every deploy", cls: "is-out" }, { text: "rollout reported success", cls: "is-out" }, { text: "all pods Running the whole time", cls: "is-out" }] },
                    { title: "Cause", items: [{ text: "Running was treated as Ready", cls: "is-act" }] },
                ]),
                note: "<b>The lesson.</b> A readiness probe is not an optional refinement &mdash; it is the only signal the rollout has. Without it, every deploy is a gamble on your start-up being faster than the controller. Switch the picker to see the difference.",
            });
            return f;
        }

        f.push({
            stage: pods(["v1", "v1", "v1", "v1"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + rs(4, 0, "4 pods"),
            note: "Four Pods of v1, all Ready. You change the image in the Deployment, which changes the Pod template &mdash; and that is what triggers everything below.",
        });
        f.push({
            stage: pods(["v1", "v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-active" }) + rs(4, 1, "4 pods"),
            note: "A <b>new ReplicaSet</b> is created for v2 and scaled to 1. <code>maxSurge: 1</code> allows one Pod above the desired count, so this starts <em>before</em> anything is removed and capacity never dips.",
        });
        f.push({
            stage: pods(["v1", "v1", "v1", "v1", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-out", 4: "is-done" }) + rs(3, 1, "4 pods"),
            note: "The new Pod's readiness probe passes and it joins the Service endpoints. <b>Only then</b> is an old Pod removed from endpoints and sent <code>SIGTERM</code>. Readiness is the gate on every step of the rollout.",
        });
        f.push({
            stage: pods(["v1", "v1", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + rs(2, 2, "4 pods"),
            note: "Halfway. Note what is true here and for the whole rollout: <b>both versions are serving simultaneously</b>. Your v2 must tolerate v1's database schema, v1's cache entries and v1's messages &mdash; this is the constraint people forget until a rollout half-fails.",
        });
        f.push({
            stage: pods(["v2", "v2", "v2", "v2"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done" }) + rs(0, 4, "4 pods"),
            note: "Complete. No downtime, no lost requests, one Pod of extra capacity at the peak. The old ReplicaSet is kept at zero replicas rather than deleted.",
        });
        f.push({
            stage: pods(["v1", "v2", "v2", "v2"], { 0: "is-active", 1: "is-done", 2: "is-done", 3: "is-out" }) + rs(1, 3, "4 pods"),
            note: "<b>And that is why rollback is fast.</b> <code>kubectl rollout undo</code> scales the old ReplicaSet back up and the new one down &mdash; the same mechanism in reverse, with no rebuild and no registry pull, because the images are already on the nodes.",
        });
        f.push({
            stage: panesHTML([
                { title: "The four fields that control it", items: [{ text: "maxSurge — how far above desired", cls: "is-act" }, { text: "maxUnavailable — how far below", cls: "is-act" }, { text: "minReadySeconds — hold before counting", cls: "is-act" }, { text: "progressDeadlineSeconds — give up after", cls: "is-act" }] },
                { title: "Sensible defaults", items: [{ text: "maxSurge: 1", cls: "is-done" }, { text: "maxUnavailable: 0", cls: "is-done" }, { text: "minReadySeconds: 10", cls: "is-done" }, { text: "never set both surge and unavailable to 0", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> <code>maxUnavailable: 0</code> buys you full capacity throughout the rollout for the price of one extra Pod &mdash; almost always the right trade. Setting <em>both</em> to zero deadlocks: nothing may be added and nothing removed, so the rollout sits until the progress deadline expires.",
        });
        return f;
    },
};

/* ---- 3. Probes ---- */

VIZ["probes"] = {
    title: "Three probes, three different consequences",
    legend: [["lg-done", "healthy"], ["lg-act", "probing"], ["lg-out", "action taken"], ["lg-idle", "idle"]],
    options: [
        { value: "readiness", label: "Readiness fails" },
        { value: "liveness", label: "Liveness fails" },
        { value: "cascade", label: "Liveness checks the database" },
    ],
    build(option = "readiness") {
        const f = [];
        const fleet = (states, endpoints, note) =>
            cellsHTML(["pod-1", "pod-2", "pod-3"], states) +
            panesHTML([
                { title: "Service endpoints", items: endpoints.length ? endpoints.map((e) => ({ text: e, cls: "is-done" })) : [], empty: "none — every request fails" },
                { title: "Restarts", items: [{ text: note, cls: note === "0" ? "is-done" : "is-out" }] },
            ]);

        if (option === "liveness") {
            f.push({
                stage: fleet({ 0: "is-done", 1: "is-done", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
                note: "Three healthy Pods. <code>livenessProbe</code> asks one question: <em>is this process irrecoverably broken?</em> The consequence of a No is severe, so the threshold should be generous.",
            });
            f.push({
                stage: fleet({ 0: "is-done", 1: "is-cmp", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
                note: "Pod 2 deadlocks &mdash; the process is alive, the event loop is stuck, and it will never recover on its own. This is the case liveness exists for, and it is rarer than people assume.",
            });
            f.push({
                stage: fleet({ 0: "is-done", 1: "is-out", 2: "is-done" }, ["pod-1", "pod-3"], "1"),
                note: "The probe fails <code>failureThreshold</code> times in a row and the kubelet <b>kills the container and restarts it in place</b>. The Pod keeps its name and its IP; only the container is replaced.",
            });
            f.push({
                stage: fleet({ 0: "is-done", 1: "is-done", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "1"),
                note: "It comes back healthy and rejoins. Note the restart counter &mdash; <code>kubectl get pods</code> showing a non-zero <code>RESTARTS</code> column is often the first visible sign that something is wrong.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Liveness should be", items: [{ text: "local — no dependencies", cls: "is-done" }, { text: "cheap — no real work", cls: "is-done" }, { text: "tolerant — failureThreshold 6+", cls: "is-done" }, { text: "often just: return 200", cls: "is-done" }] },
                    { title: "Liveness must never", items: [{ text: "query the database", cls: "is-out" }, { text: "call another service", cls: "is-out" }, { text: "fail on high load", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion.</b> A restart only helps if the problem is <em>inside this process and permanent</em>. For most services that is almost never, which is why an honest liveness probe is usually a handler that returns 200 unconditionally &mdash; and why a too-aggressive one causes far more outages than it prevents.",
            });
            return f;
        }

        if (option === "cascade") {
            f.push({
                stage: fleet({ 0: "is-done", 1: "is-done", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
                note: "A well-intentioned configuration: <code>livenessProbe</code> points at <code>/health</code>, and <code>/health</code> runs <code>SELECT 1</code> to prove the service is \"really\" working.",
            });
            f.push({
                stage: fleet({ 0: "is-cmp", 1: "is-cmp", 2: "is-cmp" }, ["pod-1", "pod-2", "pod-3"], "0"),
                note: "The database has a bad thirty seconds &mdash; a long query, a failover, a network blip. Every Pod's health check starts timing out <b>at the same moment</b>, because they all depend on the same thing.",
            });
            f.push({
                stage: fleet({ 0: "is-out", 1: "is-out", 2: "is-out" }, [], "3"),
                note: "<b>Every replica is killed simultaneously.</b> A degraded dependency has become a total outage, and there is now nothing serving at all &mdash; not even the requests that did not need the database.",
            });
            f.push({
                stage: fleet({ 0: "is-active", 1: "is-active", 2: "is-active" }, [], "3"),
                note: "They all restart at once and all reconnect at once, hitting the recovering database with a <b>thundering herd</b> of new connections. That can push it back over, and the loop repeats.",
            });
            f.push({
                stage: panesHTML([
                    { title: "The rule", items: [{ text: "liveness = is THIS process broken?", cls: "is-done" }, { text: "readiness = should I get traffic now?", cls: "is-done" }] },
                    { title: "So a dependency check belongs", items: [{ text: "in readiness, never in liveness", cls: "is-act" }, { text: "and even then, think twice", cls: "is-cmp" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Any check shared by every replica turns a partial failure into a total one. Put dependency checks in <em>readiness</em> if anywhere &mdash; that sheds traffic without killing anything, and it recovers on its own the moment the dependency does.",
            });
            return f;
        }

        f.push({
            stage: fleet({ 0: "is-done", 1: "is-done", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
            note: "Three Pods, all Ready, all in the Service's endpoint list. <code>readinessProbe</code> asks: <em>should this Pod receive requests right now?</em>",
        });
        f.push({
            stage: fleet({ 0: "is-done", 1: "is-cmp", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
            note: "Pod 2's connection pool is exhausted. It is alive and it is temporarily unable to serve well &mdash; a distinction that matters, because the right response is to stop sending it work, not to destroy it.",
        });
        f.push({
            stage: fleet({ 0: "is-done", 1: "is-out", 2: "is-done" }, ["pod-1", "pod-3"], "0"),
            note: "The readiness probe fails and the endpoints controller <b>removes the Pod from the Service</b>. Traffic goes to the other two. The container is not restarted and the restart counter stays at zero.",
        });
        f.push({
            stage: fleet({ 0: "is-done", 1: "is-done", 2: "is-done" }, ["pod-1", "pod-2", "pod-3"], "0"),
            note: "The pool recovers, the probe passes, the Pod rejoins. <b>Self-healing with no restart, no lost state and no cold start</b> &mdash; which is exactly what you want for a transient condition.",
        });
        f.push({
            stage: panesHTML([
                { title: "readinessProbe", items: [{ text: "removed from endpoints", cls: "is-act" }, { text: "container keeps running", cls: "is-done" }, { text: "gates rollouts too", cls: "is-done" }] },
                { title: "livenessProbe", items: [{ text: "container is killed", cls: "is-out" }, { text: "restarted in place", cls: "is-act" }, { text: "use sparingly", cls: "is-cmp" }] },
                { title: "startupProbe", items: [{ text: "holds the other two off", cls: "is-act" }, { text: "for slow boots", cls: "is-cmp" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Readiness controls <em>traffic</em>; liveness controls <em>life</em>; startup buys <em>time</em>. Almost every service should have a readiness probe, most should have a trivial liveness probe, and anything that takes more than a few seconds to boot should have a startup probe instead of a long initial delay.",
        });
        return f;
    },
};

/* ---- 4. Requests, limits and QoS ---- */

VIZ["resources-qos"] = {
    title: "requests schedule you; limits kill you",
    legend: [["lg-act", "being placed"], ["lg-done", "running"], ["lg-out", "killed or rejected"], ["lg-idle", "free"]],
    build() {
        const W = 700;
        const H = 220;
        const nodeView = (used, req, label, state) => {
            let s = bandHTML(20, 20, 660, 160, `node-3 — 4000m CPU, 8 Gi memory`);
            const barW = 600;
            s += `<rect x="50" y="60" width="${barW}" height="34" rx="6" class="n-idle" stroke-width="2"/>`;
            s += `<rect x="50" y="60" width="${Math.round(barW * used)}" height="34" rx="6" class="n-done" stroke-width="2"/>`;
            if (req) s += `<rect x="${50 + Math.round(barW * used)}" y="60" width="${Math.round(barW * req)}" height="34" rx="6" class="${state}" stroke-width="2"/>`;
            s += capHTML(50, 118, label, "start");
            s += capHTML(50, 52, "requests already reserved on this node", "start");
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: nodeView(0.7, 0, "70% of the node's CPU is reserved by other Pods", ""),
            note: "The scheduler does arithmetic on <b>requests</b>, not on actual usage. It sums the requests of everything already on the node and compares the remainder with what your Pod asks for.",
        });
        f.push({
            stage: nodeView(0.7, 0.2, "your pod requests 800m — it fits", "n-act"),
            note: "Your Pod requests 800m of CPU and there is 1200m unreserved, so it fits and is scheduled. Note that this is true <em>even if the node is at 5% real utilisation</em> &mdash; reservations are a bookkeeping exercise.",
        });
        f.push({
            stage: nodeView(0.9, 0.25, "requests 1000m, only 400m unreserved — Pending", "n-out"),
            note: "<b>And the mirror image.</b> A Pod requesting more than the unreserved remainder cannot be placed, and stays <code>Pending</code> with <code>Insufficient cpu</code> in its events &mdash; even on a node that is almost idle. Over-large requests waste more cluster than any other single mistake.",
        });
        f.push({
            stage: panesHTML([
                { title: "CPU over the limit", items: [{ text: "throttled by the kernel", cls: "is-cmp" }, { text: "slow, survivable", cls: "is-cmp" }, { text: "shows up as p99 latency", cls: "is-act" }] },
                { title: "Memory over the limit", items: [{ text: "OOM-killed instantly", cls: "is-out" }, { text: "exit code 137", cls: "is-out" }, { text: "no stack trace, ever", cls: "is-out" }] },
            ]),
            note: "<b>The asymmetry that explains most mysterious failures.</b> CPU is compressible so you are merely slowed; memory is not, so the kernel terminates you with <code>SIGKILL</code>, which cannot be caught. \"It vanished and logged nothing\" is memory, essentially always.",
        });
        f.push({
            stage: codeHTML([
                "$ kubectl get pod api-7d4-x9k -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'",
                "",
                "{\"exitCode\":137,\"reason\":\"OOMKilled\",",
                " \"startedAt\":\"2026-09-10T08:14:02Z\",",
                " \"finishedAt\":\"2026-09-10T08:41:37Z\"}",
            ], { 0: "is-act", 2: "is-out" }),
            note: "Confirm rather than guess. <code>lastState.terminated</code> names the reason for the container that died. Twenty-seven minutes between start and finish points at a slow leak; twenty-seven seconds points at a limit set below the steady-state requirement.",
        });
        f.push({
            stage: panesHTML([
                { title: "Guaranteed — evicted last", items: [{ text: "requests == limits", cls: "is-done" }, { text: "for every resource", cls: "is-done" }] },
                { title: "Burstable — evicted next", items: [{ text: "requests < limits", cls: "is-act" }, { text: "the common case", cls: "is-act" }] },
                { title: "BestEffort — evicted first", items: [{ text: "nothing set at all", cls: "is-out" }, { text: "thrown overboard first", cls: "is-out" }] },
            ]),
            note: "<b>QoS class is derived, not declared.</b> When a node runs short of memory the kubelet evicts <code>BestEffort</code> Pods first &mdash; which means the Pod whose author thought \"no limits\" meant \"unlimited\" is the first one deleted. Setting requests is not bureaucracy; it is how you avoid being at the front of that queue.",
        });
        f.push({
            stage: panesHTML([
                { title: "Set requests from data", items: [{ text: "memory: observed p95 + headroom", cls: "is-done" }, { text: "cpu: observed p50", cls: "is-done" }] },
                { title: "Set limits deliberately", items: [{ text: "memory limit == request", cls: "is-done" }, { text: "CPU limit: often none", cls: "is-cmp" }, { text: "a CPU limit throttles even when the node is idle", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Requests are a promise the scheduler keeps; limits are a ceiling the kernel enforces. Set memory request and limit equal for predictability, base both on measured usage rather than on a number copied from another service, and think hard before adding a CPU limit to anything latency-sensitive.",
        });
        return f;
    },
};

/* ---- 5. Config and secret updates ---- */

VIZ["config-update"] = {
    title: "\"I changed the ConfigMap and nothing happened\"",
    legend: [["lg-act", "changed"], ["lg-done", "picked up"], ["lg-out", "stale"], ["lg-idle", "unchanged"]],
    options: [
        { value: "env", label: "Injected as env vars" },
        { value: "volume", label: "Mounted as a volume" },
    ],
    build(option = "env") {
        const f = [];
        if (option === "volume") {
            f.push({
                stage: panesHTML([
                    { title: "ConfigMap  app-config", items: [{ text: "log_level: info", cls: "is-done" }] },
                    { title: "Pod  /etc/config/log_level", items: [{ text: "info", cls: "is-done" }] },
                    { title: "Process", items: [{ text: "reads the file on each request", cls: "is-done" }] },
                ]),
                note: "Mounted as a <b>volume</b>, each key becomes a file. The kubelet keeps the mounted files in sync with the object.",
            });
            f.push({
                stage: panesHTML([
                    { title: "ConfigMap  app-config", items: [{ text: "log_level: debug", cls: "is-act" }] },
                    { title: "Pod  /etc/config/log_level", items: [{ text: "info", cls: "is-out" }] },
                    { title: "Process", items: [{ text: "still info", cls: "is-out" }] },
                ]),
                note: "You edit the ConfigMap. The mounted file is not updated instantly &mdash; the kubelet refreshes it on its sync period, so expect up to about a minute (longer if the kubelet's cache TTL is high).",
            });
            f.push({
                stage: panesHTML([
                    { title: "ConfigMap  app-config", items: [{ text: "log_level: debug", cls: "is-done" }] },
                    { title: "Pod  /etc/config/log_level", items: [{ text: "debug", cls: "is-done" }] },
                    { title: "Process", items: [{ text: "still info — read once at boot", cls: "is-out" }] },
                ]),
                note: "<b>The file updates and your application still does not care.</b> Almost every program reads its configuration once at start-up. The platform did its half; the missing half is code that re-reads the file, or watches it.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Works without a restart", items: [{ text: "TLS certificates", cls: "is-done" }, { text: "anything re-read per request", cls: "is-done" }, { text: "log level, if you watch the file", cls: "is-done" }] },
                    { title: "Needs a restart anyway", items: [{ text: "values read once at boot", cls: "is-out" }, { text: "subPath mounts — never update", cls: "is-out" }] },
                ]),
                note: "<b>The exception worth knowing:</b> a <code>subPath</code> mount is resolved once and never refreshed, which is why a single file mounted that way silently stops tracking the ConfigMap. If you need live updates, mount the whole directory.",
            });
            f.push({
                stage: panesHTML([
                    { title: "The robust pattern", items: [{ text: "hash the config into the pod template", cls: "is-done" }, { text: "changing config changes the template", cls: "is-done" }, { text: "which triggers a normal rollout", cls: "is-done" }, { text: "and is therefore rollback-able", cls: "is-done" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Rather than relying on live reload, make configuration part of the Pod template's identity &mdash; Kustomize appends a content hash to the generated name, Helm adds a checksum annotation. A config change then becomes an ordinary, observable, revertible deploy instead of an invisible mutation.",
            });
            return f;
        }
        f.push({
            stage: panesHTML([
                { title: "ConfigMap  app-config", items: [{ text: "log_level: info", cls: "is-done" }] },
                { title: "Pod env", items: [{ text: "LOG_LEVEL=info", cls: "is-done" }] },
                { title: "Process", items: [{ text: "log level: info", cls: "is-done" }] },
            ]),
            note: "The common setup: the ConfigMap is injected as environment variables with <code>envFrom</code> or <code>valueFrom</code>. Convenient, and it has one property people do not expect.",
        });
        f.push({
            stage: panesHTML([
                { title: "ConfigMap  app-config", items: [{ text: "log_level: debug", cls: "is-act" }] },
                { title: "Pod env", items: [{ text: "LOG_LEVEL=info", cls: "is-out" }] },
                { title: "Process", items: [{ text: "log level: info", cls: "is-out" }] },
            ]),
            note: "<b>You edit the ConfigMap and nothing changes &mdash; ever.</b> Environment is fixed when a process starts; there is no mechanism by which a running process's environment could be rewritten. The Pod will keep the old value for its entire life.",
        });
        f.push({
            stage: panesHTML([
                { title: "kubectl rollout restart", items: [{ text: "new pods created", cls: "is-act" }] },
                { title: "Pod env", items: [{ text: "LOG_LEVEL=debug", cls: "is-done" }] },
                { title: "Process", items: [{ text: "log level: debug", cls: "is-done" }] },
            ]),
            note: "Only new Pods pick it up. <code>kubectl rollout restart</code> patches an annotation on the template, which creates a new ReplicaSet and rolls the Pods &mdash; the same mechanism as any deploy.",
        });
        f.push({
            stage: panesHTML([
                { title: "The trap", items: [{ text: "config edited, pods not restarted", cls: "is-out" }, { text: "someone scales up next week", cls: "is-out" }, { text: "new pods get the NEW config", cls: "is-out" }, { text: "old pods keep the OLD config", cls: "is-out" }] },
            ]),
            note: "<b>And here is the failure that is genuinely hard to debug.</b> An edited-but-not-rolled ConfigMap leaves a time bomb: the next scale-up or node replacement produces Pods with different configuration from their siblings, and the resulting behaviour depends on which replica served the request.",
        });
        f.push({
            stage: panesHTML([
                { title: "Env vars", items: [{ text: "fixed at start", cls: "is-cmp" }, { text: "needs a rollout", cls: "is-act" }, { text: "simple, explicit", cls: "is-done" }] },
                { title: "Volume", items: [{ text: "refreshed by the kubelet", cls: "is-cmp" }, { text: "app must re-read", cls: "is-act" }, { text: "good for certificates", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion.</b> Neither option gives you live reload on its own. Choose env vars for simplicity and accept that a config change is a deploy &mdash; then make it one deliberately by hashing the config into the Pod template, so the rollout happens automatically and can be rolled back.",
        });
        return f;
    },
};

/* ---- 6. Debugging decision tree ---- */

VIZ["kubectl-debug"] = {
    title: "A Pod is not working — the order to check",
    legend: [["lg-act", "checking"], ["lg-done", "ruled out"], ["lg-out", "the cause"], ["lg-idle", "not reached"]],
    build() {
        const W = 760;
        const H = 320;
        const STEPS = [
            ["Pending", "no node fits — resources, taints, volumes"],
            ["ImagePullBackOff", "wrong tag, private registry, no pull secret"],
            ["CrashLoopBackOff", "your process exits — logs --previous"],
            ["Running, not Ready", "readiness failing — describe shows why"],
            ["Ready but 502s", "endpoints empty, or wrong port"],
            ["Ready and slow", "throttling, dependencies — go to traces"],
        ];
        const draw = (states) => {
            let s = capHTML(30, 20, "kubectl get pods  →  the STATUS column tells you which branch", "start");
            STEPS.forEach((st, i) => {
                s += boxHTML(30, 38 + i * 46, 240, 36, st[0], states[i] || "n-idle");
                s += capHTML(288, 60 + i * 46, st[1], "start");
            });
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw([]),
            note: "Six states cover almost everything you will meet. The <code>STATUS</code> column picks the branch, and each branch has one command that resolves it.",
        });
        f.push({
            stage: draw(["n-out"]),
            note: "<b><code>Pending</code></b> means no node was chosen. <code>kubectl describe pod</code> spells it out in the events: <code>Insufficient cpu</code>, <code>untolerated taint</code>, <code>didn't match node selector</code>, or a volume in the wrong zone. Nothing about your image or your code is involved yet.",
        });
        f.push({
            stage: draw(["n-done", "n-out"]),
            note: "<b><code>ImagePullBackOff</code></b> is the node failing to fetch the image: a tag that does not exist, a private registry with no <code>imagePullSecret</code>, or a typo in the repository. The events contain the registry's own error message, which is usually explicit.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-out"]),
            note: "<b><code>CrashLoopBackOff</code></b> means your process starts and exits. Go straight to <code>kubectl logs &lt;pod&gt; --previous</code> &mdash; without <code>--previous</code> you are reading the container that is currently starting, which has printed nothing yet.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-out"]),
            note: "<b><code>Running</code> but <code>0/1 READY</code></b> is a failing readiness probe. <code>describe</code> shows the probe's own error &mdash; connection refused (wrong port), 404 (wrong path), or a timeout (too slow, or the probe is doing real work).",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-out"]),
            note: "<b>Ready but users get 502s</b> is nearly always the Service. <code>kubectl get endpointslice</code> shows whether any Pod is actually behind it: an empty list means the label selector does not match, and a populated list means the port or the path is wrong.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-done", "n-out"]),
            note: "<b>Ready, serving, and slow</b> is the only case where Kubernetes is probably not the problem. Check CPU throttling first because it is cheap to rule out, then stop looking at the platform and look at a trace.",
        });
        f.push({
            stage: panesHTML([
                { title: "Always start here", items: [{ text: "kubectl describe pod <p>", cls: "is-act" }, { text: "kubectl get events --sort-by=.lastTimestamp", cls: "is-act" }, { text: "kubectl logs <p> --previous", cls: "is-act" }] },
                { title: "When you need a shell", items: [{ text: "kubectl exec -it <p> -- sh", cls: "is-done" }, { text: "kubectl debug -it <p> --image=netshoot", cls: "is-done" }, { text: "kubectl port-forward <p> 8080:8080", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> <code>describe</code> and <code>events</code> answer most questions before you reach for anything cleverer, because every controller that touched the Pod left a note there. And <code>kubectl debug</code> attaches a toolbox container to a running Pod &mdash; which is how you keep a distroless image in production and still get a shell when you need one.",
        });
        return f;
    },
};

/* ---- 7. Storage ---- */

VIZ["pvc-pending"] = {
    title: "Why your second replica is stuck Pending",
    legend: [["lg-done", "bound and running"], ["lg-act", "requesting"], ["lg-out", "cannot schedule"], ["lg-idle", "idle"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "PersistentVolumeClaim", items: [{ text: "storage: 20Gi", cls: "is-act" }, { text: "accessModes: ReadWriteOnce", cls: "is-act" }, { text: "storageClassName: gp3", cls: "is-act" }] },
                { title: "StorageClass gp3", items: [{ text: "provisioner: ebs.csi.aws.com", cls: "is-cmp" }, { text: "volumeBindingMode: WaitForFirstConsumer", cls: "is-cmp" }] },
            ]),
            note: "A <b>PVC</b> is a request for storage; a <b>StorageClass</b> says how to satisfy it. Nothing is created until a Pod actually needs it &mdash; that is what <code>WaitForFirstConsumer</code> means, and it exists so the disk is created in the same zone as the Pod.",
        });
        f.push({
            stage: panesHTML([
                { title: "pod-1  on node-a (zone 1a)", items: [{ text: "mounted /data", cls: "is-done" }] },
                { title: "PersistentVolume", items: [{ text: "vol-0abc — 20Gi, zone 1a", cls: "is-done" }] },
            ]),
            note: "The first Pod is scheduled, the volume is provisioned in that Pod's zone and bound. Everything works, and it will keep working as long as there is exactly one replica.",
        });
        f.push({
            stage: panesHTML([
                { title: "pod-1  on node-a", items: [{ text: "mounted /data", cls: "is-done" }] },
                { title: "pod-2  Pending", items: [{ text: "Multi-Attach error", cls: "is-out" }, { text: "volume already used by pod-1", cls: "is-out" }] },
            ]),
            note: "<b>You scale to two and the second Pod never starts.</b> <code>ReadWriteOnce</code> means the volume can be mounted by one <em>node</em> at a time, so a Deployment with several replicas sharing one PVC is a contradiction. This looks like a scheduling bug and it is a storage constraint.",
        });
        f.push({
            stage: panesHTML([
                { title: "ReadWriteOnce", items: [{ text: "one node at a time", cls: "is-act" }, { text: "EBS, GCE PD, Azure Disk", cls: "is-cmp" }, { text: "the default, and the trap", cls: "is-out" }] },
                { title: "ReadWriteMany", items: [{ text: "many nodes at once", cls: "is-done" }, { text: "NFS, EFS, Azure Files", cls: "is-cmp" }, { text: "slower, and often not offered", cls: "is-out" }] },
            ]),
            note: "There is a second consequence people meet later: a Pod using an RWO volume can only be scheduled in the volume's <b>zone</b>. If that zone is short of capacity, the Pod stays <code>Pending</code> while the rest of the cluster sits idle.",
        });
        f.push({
            stage: panesHTML([
                { title: "Deployment + PVC", items: [{ text: "all replicas share ONE claim", cls: "is-out" }, { text: "works only with 1 replica", cls: "is-out" }] },
                { title: "StatefulSet", items: [{ text: "volumeClaimTemplates", cls: "is-done" }, { text: "pod-0 → data-pod-0", cls: "is-done" }, { text: "pod-1 → data-pod-1", cls: "is-done" }, { text: "stable names and identity", cls: "is-done" }] },
            ]),
            note: "<b>If each replica needs its own disk, that is a StatefulSet.</b> Its <code>volumeClaimTemplates</code> create one PVC per Pod, with stable names that survive rescheduling &mdash; which is the whole reason databases are deployed that way.",
        });
        f.push({
            stage: panesHTML([
                { title: "Prefer, in this order", items: [{ text: "1. no state in the pod at all", cls: "is-done" }, { text: "2. a managed database / object store", cls: "is-done" }, { text: "3. StatefulSet + PVC per pod", cls: "is-cmp" }, { text: "4. Deployment sharing one PVC", cls: "is-out" }] },
                { title: "And check", items: [{ text: "reclaimPolicy: Retain for real data", cls: "is-act" }, { text: "or deleting the namespace deletes the disk", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> As an application developer, the best storage decision is usually to have none: put durable data in a managed database or object storage and keep your Pods disposable. When you genuinely need a disk per replica, use a StatefulSet &mdash; and set the reclaim policy to <code>Retain</code>, because the default deletes the underlying disk with the claim.",
        });
        return f;
    },
};
/* ---- 8. Cascading failure across services ---- */

VIZ["cascading-failure"] = {
    title: "How one slow service takes down all of them",
    legend: [["lg-done", "healthy"], ["lg-act", "degraded"], ["lg-out", "saturated"], ["lg-idle", "idle"]],
    options: [
        { value: "naive", label: "No timeouts" },
        { value: "timeout", label: "Timeouts and retries" },
        { value: "breaker", label: "Circuit breaker" },
    ],
    build(option = "naive") {
        const W = 720;
        const H = 240;
        const CHAIN = [
            { x: 40, label: "web", sub: "200 workers" },
            { x: 280, label: "orders", sub: "100 workers" },
            { x: 520, label: "payments", sub: "50 workers" },
        ];
        const draw = (states, edges, caption) => {
            let s = "";
            CHAIN.forEach((c, i) => {
                s += boxHTML(c.x, 80, 160, 46, c.label, states[i] || "n-idle", c.sub);
                if (i < CHAIN.length - 1) {
                    s += arrowHTML(c.x + 164, 103, CHAIN[i + 1].x - 6, 103, (edges && edges[i]) || "e-idle");
                }
            });
            if (caption) s += capHTML(W / 2, 216, caption);
            return svgHTML(W, H, s);
        };
        const f = [];

        if (option === "timeout") {
            f.push({
                stage: draw(["n-done", "n-done", "n-act"], ["e-done", "e-act"], "payments p99 = 8 s; orders has a 1 s timeout"),
                note: "Same failure, one change: <code>orders</code> gives up on <code>payments</code> after one second. A worker is now occupied for a second rather than for eight, which is an eight-fold increase in how much slowness the pool can absorb.",
            });
            f.push({
                stage: panesHTML([
                    { title: "orders", items: [{ text: "22 / 100 workers busy", cls: "is-done" }, { text: "checkout: degraded, not dead", cls: "is-act" }, { text: "browsing: unaffected", cls: "is-done" }] },
                    { title: "web", items: [{ text: "responding in 1.1 s", cls: "is-act" }, { text: "still accepting requests", cls: "is-done" }] },
                ]),
                note: "<b>The failure is now contained.</b> Checkout is broken, and everything that does not touch payments still works. That distinction &mdash; a degraded feature rather than a dead site &mdash; is worth more than almost any other reliability investment.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Retry naively", items: [{ text: "3 attempts, no delay", cls: "is-out" }, { text: "3× load on a struggling service", cls: "is-out" }, { text: "every caller does it at once", cls: "is-out" }, { text: "recovery becomes impossible", cls: "is-out" }] },
                    { title: "Retry properly", items: [{ text: "only idempotent operations", cls: "is-done" }, { text: "exponential backoff", cls: "is-done" }, { text: "plus jitter, to break the sync", cls: "is-done" }, { text: "a budget: cap total retries", cls: "is-done" }] },
                ]),
                note: "<b>Retries are the most dangerous fix in this list.</b> A service that is slow because it is overloaded gets three times the traffic the moment its callers start retrying &mdash; and because every caller retries on the same schedule, they arrive together. Backoff spreads them out; jitter stops them re-synchronising; a retry budget stops the whole thing amplifying.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Set a timeout for every call", items: [{ text: "HTTP client default = none", cls: "is-out" }, { text: "database client default = none", cls: "is-out" }, { text: "DNS, TLS, connect, read", cls: "is-act" }] },
                    { title: "And make it shorter inward", items: [{ text: "web → orders: 2 s", cls: "is-done" }, { text: "orders → payments: 1 s", cls: "is-done" }, { text: "caller outlives the callee", cls: "is-done" }] },
                ]),
                note: "<b>The conclusion.</b> The single most common cause of a cascading outage is a client with no timeout, because most libraries default to waiting forever. Set one on every network call, make the inner timeout shorter than the outer one, and remember that a retry without backoff is not a mitigation &mdash; it is an amplifier. Switch the picker for the pattern that stops calling altogether.",
            });
            return f;
        }

        if (option === "breaker") {
            f.push({
                stage: draw(["n-done", "n-done", "n-out"], ["e-done", "e-act"], "circuit CLOSED — calls flow, failures counted"),
                note: "A <b>circuit breaker</b> wraps the client. In the <b>closed</b> state everything is normal and it simply counts outcomes over a rolling window.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Rolling window", items: [{ text: "62 of 100 calls failed", cls: "is-out" }, { text: "threshold: 50%", cls: "is-act" }, { text: "→ trip", cls: "is-out" }] },
                ]),
                note: "The failure rate crosses the threshold and the breaker <b>trips</b>. Note that this is a decision made from evidence over a window rather than from a single failure &mdash; one timeout is noise, sixty in a hundred is a broken dependency.",
            });
            f.push({
                stage: draw(["n-done", "n-done", "n-out"], ["e-done", "e-idle"], "circuit OPEN — calls fail instantly, nothing is sent"),
                note: "<b>Open.</b> Calls to <code>payments</code> now fail <em>immediately</em> without a network request. Two things happen at once: <code>orders</code> stops occupying workers on a call that was going to fail anyway, and <code>payments</code> stops receiving traffic it cannot serve, which is what gives it room to recover.",
            });
            f.push({
                stage: panesHTML([
                    { title: "While open", items: [{ text: "return a cached price", cls: "is-done" }, { text: "queue the payment for later", cls: "is-done" }, { text: "show \"try again shortly\"", cls: "is-done" }, { text: "never: hang, or crash", cls: "is-out" }] },
                ]),
                note: "The breaker only buys you the <em>opportunity</em> to degrade well &mdash; you still have to decide what to do instead. A cached value, a queued action or an honest error are all fine; what is not fine is having no answer, because then the breaker just moves the failure one layer up.",
            });
            f.push({
                stage: draw(["n-done", "n-done", "n-act"], ["e-done", "e-act"], "HALF-OPEN — one trial call after 30 s"),
                note: "<b>Half-open.</b> After a cool-down the breaker lets a single request through. If it succeeds the circuit closes and normal traffic resumes; if it fails the circuit opens again and the timer restarts. One probe, not a flood &mdash; which is the difference between recovering and re-breaking.",
            });
            f.push({
                stage: panesHTML([
                    { title: "In the application", items: [{ text: "timeouts", cls: "is-done" }, { text: "retries with backoff + jitter", cls: "is-done" }, { text: "circuit breaker", cls: "is-done" }, { text: "bulkheads: separate pools", cls: "is-done" }] },
                    { title: "In a service mesh", items: [{ text: "the same four, as config", cls: "is-act" }, { text: "plus mTLS and traces for free", cls: "is-act" }, { text: "cost: a sidecar per pod", cls: "is-out" }, { text: "and a large thing to operate", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> These four patterns are what turns a set of services into a system that degrades instead of collapsing, and you can implement all of them in a library. A service mesh gives you the same behaviour as configuration plus mutual TLS and traces &mdash; genuinely useful at a few dozen services, and a large operational commitment before that.",
            });
            return f;
        }

        f.push({
            stage: draw(["n-done", "n-done", "n-done"], ["e-done", "e-done"], "checkout p99 = 40 ms"),
            note: "Three services. <code>web</code> calls <code>orders</code>, which calls <code>payments</code>. Everything is fast, every pool is nearly empty, and the system looks robust.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-act"], ["e-done", "e-act"], "payments p99 → 8 s (a slow query, not a crash)"),
            note: "<code>payments</code> degrades &mdash; a missing index, a locked table, a slow dependency of its own. Crucially it does <b>not</b> crash: it still answers, just eight seconds later. Every health check it has is passing.",
        });
        f.push({
            stage: draw(["n-done", "n-out", "n-act"], ["e-done", "e-act"], "orders: all 100 workers blocked waiting"),
            note: "<b>And here is the mechanism.</b> <code>orders</code> has no timeout, so each worker waits the full eight seconds. At 20 requests per second, all 100 workers are occupied within five seconds &mdash; and now <code>orders</code> cannot serve <em>any</em> request, including the ones that never touch payments.",
        });
        f.push({
            stage: draw(["n-out", "n-out", "n-act"], ["e-act", "e-act"], "web saturated too — the site is down"),
            note: "The same thing happens one layer up. <code>web</code>'s workers block waiting on <code>orders</code>, and the entire site stops responding. <b>One slow service, no crashes anywhere, and total unavailability</b> &mdash; and the graph that shows it is a rising queue depth, not an error rate.",
        });
        f.push({
            stage: panesHTML([
                { title: "What Kubernetes does now", items: [{ text: "liveness probes time out", cls: "is-out" }, { text: "it restarts every pod", cls: "is-out" }, { text: "reconnect storm on recovery", cls: "is-out" }, { text: "and it happens again", cls: "is-out" }] },
                { title: "Why the platform cannot help", items: [{ text: "no pod is unhealthy", cls: "is-act" }, { text: "no container crashed", cls: "is-act" }, { text: "the bug is in the CALLERS", cls: "is-act" }] },
            ]),
            note: "<b>This is the failure mode Kubernetes makes worse rather than better.</b> Restarting Pods does not fix a saturated call chain, and doing it to every replica at once adds a thundering herd on top. Resilience between services is an <em>application</em> concern &mdash; switch the picker to see the three patterns that fix it.",
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
