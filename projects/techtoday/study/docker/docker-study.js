/* ==========================================================================
   TechToday - Docker study guide
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
   Reused container widgets
   ========================================================================== */

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

/* ==========================================================================
   Docker widgets
   ========================================================================== */

/* ---- 1. The container lifecycle ---- */

VIZ["container-lifecycle"] = {
    title: "Image → container → gone: where your data actually lives",
    legend: [["lg-act", "current state"], ["lg-done", "persisted"], ["lg-out", "lost"], ["lg-idle", "not reached"]],
    build() {
        const W = 720;
        const H = 250;
        const STATES = [
            { label: "image", sub: "read-only, on disk" },
            { label: "created", sub: "docker create" },
            { label: "running", sub: "your process, PID 1" },
            { label: "exited", sub: "process returned" },
            { label: "removed", sub: "docker rm" },
        ];
        const draw = (states, note = "") => {
            let s = "";
            STATES.forEach((st, i) => {
                s += boxHTML(20 + i * 142, 40, 118, 44, st.label, states[i] || "n-idle", st.sub);
                if (i < STATES.length - 1) {
                    s += arrowHTML(140 + i * 142, 62, 158 + i * 142, 62, states[i] && states[i] !== "n-idle" ? "e-done" : "e-idle");
                }
            });
            if (note) s += capHTML(W / 2, 230, note);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw(["n-done"]),
            note: "An <b>image</b> is a stack of read-only layers on disk. It is inert &mdash; nothing about it runs, and a hundred containers can share the same layers without copying a byte.",
        });
        f.push({
            stage: draw(["n-done", "n-act"]),
            note: "<code>docker create</code> prepares a container: it stacks a thin <b>writable layer</b> on top of the image layers and reserves a name and an ID. Still nothing is running.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-act"]),
            note: "<code>docker start</code> launches your <code>ENTRYPOINT</code> as PID 1 inside new namespaces. <b>A container is that process.</b> When the process exits, the container exits &mdash; there is no daemon inside keeping it alive.",
        });
        f.push({
            stage: panesHTML([
                { title: "Image layers — shared, read-only", stack: true, items: [{ text: "COPY . .", cls: "is-done" }, { text: "RUN pip install", cls: "is-done" }, { text: "FROM python:3.12-slim", cls: "is-done" }] },
                { title: "Writable layer — this container only", items: [{ text: "/app/uploads/photo.png", cls: "is-act" }, { text: "/tmp/session-cache", cls: "is-act" }, { text: "/var/log/app.log", cls: "is-act" }] },
            ]),
            note: "Every write goes to the writable layer using <b>copy-on-write</b>: editing a file from an image layer copies it up first. This is why the image is never modified and why two containers from one image cannot see each other's changes.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-act"], "docker ps -a still lists it; the writable layer still exists"),
            note: "The process returns and the container is <b>exited</b>, not deleted. Its logs and its writable layer are still on disk, which is exactly why <code>docker logs</code> works on a container that crashed &mdash; and why exited containers quietly fill your disk.",
        });
        f.push({
            stage: panesHTML([
                { title: "After docker rm", items: [{ text: "/app/uploads/photo.png", cls: "is-out" }, { text: "/tmp/session-cache", cls: "is-out" }, { text: "/var/log/app.log", cls: "is-out" }] },
                { title: "In a named volume", items: [{ text: "/var/lib/postgresql/data", cls: "is-done" }] },
            ]),
            note: "<b>And here is the lesson.</b> Removing the container destroys the writable layer and everything in it. Anything you intend to keep must be in a <b>volume</b>, which lives outside the container's lifecycle entirely.",
        });
        f.push({
            stage: panesHTML([
                { title: "Belongs in the image", items: [{ text: "code", cls: "is-done" }, { text: "dependencies", cls: "is-done" }, { text: "runtime", cls: "is-done" }] },
                { title: "Belongs in a volume", items: [{ text: "database files", cls: "is-act" }, { text: "user uploads", cls: "is-act" }] },
                { title: "Belongs nowhere — send it out", items: [{ text: "logs → stdout", cls: "is-cmp" }, { text: "metrics → an endpoint", cls: "is-cmp" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Treat every container as if it will be deleted in the next five minutes, because in production it will be. Write logs to stdout rather than to a file, keep state in volumes or a database, and you get restarts, rollbacks and scaling for free.",
        });
        return f;
    },
};

/* ---- 2. Multi-stage builds ---- */

VIZ["multi-stage"] = {
    title: "Build fat, ship thin",
    legend: [["lg-act", "build only"], ["lg-done", "shipped"], ["lg-out", "removed"], ["lg-idle", "not yet"]],
    build() {
        const f = [];
        f.push({
            stage: codeHTML([
                "FROM node:20",
                "WORKDIR /app",
                "COPY package*.json ./",
                "RUN npm ci                 # includes devDependencies",
                "COPY . .",
                "RUN npm run build",
                "CMD [\"node\", \"dist/server.js\"]",
            ]),
            note: "The single-stage version. It works, and it ships everything used to <em>make</em> the application as well as the application itself.",
        });
        f.push({
            stage: panesHTML([
                { title: "What is in the 1.1 GB image", items: [{ text: "node:20 base — 380 MB", cls: "is-cmp" }, { text: "devDependencies — 410 MB", cls: "is-out" }, { text: "TypeScript compiler — 65 MB", cls: "is-out" }, { text: "source + tests — 40 MB", cls: "is-out" }, { text: "npm cache — 180 MB", cls: "is-out" }, { text: "your dist/ — 3 MB", cls: "is-done" }] },
            ]),
            note: "Three megabytes of application inside 1.1 gigabytes of image. Everything marked in red runs in production and is never used there &mdash; it is slow to pull, and every package in it is a line in your vulnerability report.",
        });
        f.push({
            stage: codeHTML([
                "FROM node:20 AS build",
                "WORKDIR /app",
                "COPY package*.json ./",
                "RUN npm ci",
                "COPY . .",
                "RUN npm run build",
                "",
                "FROM node:20-slim AS runtime",
                "WORKDIR /app",
                "COPY package*.json ./",
                "RUN npm ci --omit=dev",
                "COPY --from=build /app/dist ./dist",
                "USER node",
                "CMD [\"node\", \"dist/server.js\"]",
            ], { 0: "is-act", 7: "is-done" }),
            note: "<b>Two stages in one file.</b> The <code>build</code> stage compiles; the <code>runtime</code> stage starts from a clean base and copies <em>only</em> the output across with <code>COPY --from=build</code>. Everything else in the build stage is discarded.",
        });
        f.push({
            stage: panesHTML([
                { title: "Stage: build — discarded", items: [{ text: "node:20 — 380 MB", cls: "is-out" }, { text: "devDependencies", cls: "is-out" }, { text: "TypeScript, source, tests", cls: "is-out" }, { text: "npm cache", cls: "is-out" }] },
                { title: "Stage: runtime — shipped, 190 MB", items: [{ text: "node:20-slim — 120 MB", cls: "is-done" }, { text: "prod dependencies — 67 MB", cls: "is-done" }, { text: "dist/ — 3 MB", cls: "is-done" }] },
            ]),
            note: "1.1 GB becomes 190 MB. That is faster pulls on every deploy and every autoscaling event, and a far smaller surface for a scanner to complain about.",
        });
        f.push({
            stage: panesHTML([
                { title: "The security half, often missed", items: [{ text: "no compiler in production", cls: "is-done" }, { text: "no npm, no package manager", cls: "is-done" }, { text: "no source, no .git", cls: "is-done" }, { text: "build secrets left behind", cls: "is-done" }] },
                { title: "Base images, smallest last", items: [{ text: "node:20 — 380 MB", cls: "is-cmp" }, { text: "node:20-slim — 120 MB", cls: "is-act" }, { text: "distroless — 20 MB, no shell", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Multi-stage is not only an optimisation &mdash; it is the cleanest way to guarantee that build-time material never reaches production. Note the trade at the bottom: distroless is the smallest and safest, and it has no shell, so <code>docker exec &hellip; sh</code> stops working. Keep a debug variant for when you need a prompt.",
        });
        return f;
    },
};

/* ---- 3. Ports ---- */

VIZ["port-mapping"] = {
    title: "Why your app is not on localhost:5000",
    legend: [["lg-act", "the request"], ["lg-done", "reachable"], ["lg-out", "unreachable"], ["lg-idle", "idle"]],
    build() {
        const W = 720;
        const H = 260;
        const draw = (arrow, states, caption) => {
            const S = (k) => states[k] || "n-idle";
            let s = bandHTML(20, 20, 680, 210, "host machine");
            s += boxHTML(50, 100, 130, 46, "browser", S("client"));
            s += boxHTML(240, 100, 150, 46, "host :8080", S("host"), "published port");
            s += bandHTML(430, 60, 250, 140, "container — its own net namespace");
            s += boxHTML(460, 100, 190, 46, "app :5000", S("app"));
            s += arrowHTML(185, 122, 234, 122, arrow >= 1 ? "e-act" : "e-idle");
            s += arrowHTML(395, 122, 454, 122, arrow >= 2 ? "e-act" : "e-idle", "NAT");
            if (caption) s += capHTML(W / 2, 246, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw(0, { app: "n-done" }, "docker run myapp   — no -p flag"),
            note: "Your application is listening on port 5000 <em>inside its own network namespace</em>. That namespace has its own interfaces and its own port space, entirely separate from the host's.",
        });
        f.push({
            stage: draw(1, { client: "n-act", host: "n-out", app: "n-done" }, "connection refused"),
            note: "<b>So <code>localhost:5000</code> on your machine finds nothing.</b> The port is genuinely in use &mdash; just not on the host. This is the single most common first-day Docker confusion, and it is a namespace boundary, not a bug.",
        });
        f.push({
            stage: draw(2, { client: "n-done", host: "n-done", app: "n-act" }, "docker run -p 8080:5000 myapp"),
            note: "<code>-p 8080:5000</code> publishes the port: the runtime adds a NAT rule forwarding the <b>host's</b> 8080 to the <b>container's</b> 5000. Read it left to right as <em>outside:inside</em> &mdash; getting the order backwards is the second most common confusion.",
        });
        f.push({
            stage: panesHTML([
                { title: "Inside a container, localhost means…", items: [{ text: "the container itself", cls: "is-act" }, { text: "not your laptop", cls: "is-out" }, { text: "not another container", cls: "is-out" }] },
                { title: "So to reach…", items: [{ text: "a service on the host → host.docker.internal", cls: "is-done" }, { text: "another container → its service name", cls: "is-done" }, { text: "a sidecar in the same pod → localhost", cls: "is-done" }] },
            ]),
            note: "<b>The rule that resolves most connection errors.</b> <code>localhost</code> is per network namespace. A container that cannot reach your local database is usually pointing at <code>127.0.0.1</code>, which is the container's own empty loopback.",
        });
        f.push({
            stage: panesHTML([
                { title: "Two containers, same network", items: [{ text: "api  → http://db:5432", cls: "is-done" }, { text: "resolved by the embedded DNS", cls: "is-done" }, { text: "no -p flag needed at all", cls: "is-done" }] },
                { title: "Default bridge — avoid", items: [{ text: "no DNS between containers", cls: "is-out" }, { text: "IPs only, and they change", cls: "is-out" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Publishing ports is only for traffic entering from <em>outside</em>. Containers on the same user-defined network reach each other by name on the real port, with nothing published &mdash; which is why a Compose file exposes one port for the browser and none for the database.",
        });
        return f;
    },
};

/* ---- 4. Volumes ---- */

VIZ["volumes"] = {
    title: "Three kinds of storage, three lifetimes",
    legend: [["lg-done", "survives"], ["lg-act", "in use"], ["lg-out", "gone"], ["lg-idle", "empty"]],
    options: [
        { value: "none", label: "No volume" },
        { value: "named", label: "Named volume" },
        { value: "bind", label: "Bind mount" },
    ],
    build(option = "none") {
        const f = [];
        if (option === "bind") {
            f.push({
                stage: panesHTML([
                    { title: "Host  ./src", items: [{ text: "app.py", cls: "is-done" }, { text: "routes.py", cls: "is-done" }] },
                    { title: "Container  /app", items: [{ text: "app.py", cls: "is-act" }, { text: "routes.py", cls: "is-act" }] },
                ]),
                note: "<code>-v ./src:/app</code> mounts a host directory straight into the container. The same files, one copy, visible from both sides &mdash; which is what makes edit-and-reload development work inside a container.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Host  ./src", items: [{ text: "app.py  (edited)", cls: "is-act" }, { text: "routes.py", cls: "is-done" }] },
                    { title: "Container  /app", items: [{ text: "app.py  (edited)", cls: "is-act" }, { text: "routes.py", cls: "is-done" }] },
                ]),
                note: "You edit on the host; the running process sees it immediately. No rebuild, no restart if your framework reloads. This is the main reason to use Compose in development.",
            });
            f.push({
                stage: panesHTML([
                    { title: "The trap", items: [{ text: "host node_modules — macOS build", cls: "is-out" }, { text: "mounted over the image's Linux build", cls: "is-out" }, { text: "native modules fail at import", cls: "is-out" }] },
                    { title: "The fix", items: [{ text: "-v ./src:/app", cls: "is-done" }, { text: "-v /app/node_modules", cls: "is-done" }, { text: "an anonymous volume masks the host dir", cls: "is-done" }] },
                ]),
                note: "<b>A bind mount hides whatever was at that path in the image.</b> Mounting your project over <code>/app</code> also replaces the dependencies installed during the build with the ones on your laptop &mdash; compiled for the wrong platform. Mask the dependency directory with an anonymous volume.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Bind mounts are for", items: [{ text: "source code in development", cls: "is-done" }, { text: "a config file you edit", cls: "is-done" }] },
                    { title: "Not for", items: [{ text: "production data", cls: "is-out" }, { text: "anything on a remote host", cls: "is-out" }, { text: "database files (slow on macOS)", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion.</b> Bind mounts are a development convenience tied to one machine's filesystem layout. Production containers should have nothing bind-mounted, which is also why the image must be able to run without one.",
            });
            return f;
        }
        if (option === "named") {
            f.push({
                stage: panesHTML([
                    { title: "Container  /var/lib/postgresql/data", items: [{ text: "base/", cls: "is-act" }, { text: "pg_wal/", cls: "is-act" }] },
                    { title: "Volume  pgdata (managed by Docker)", items: [{ text: "base/", cls: "is-done" }, { text: "pg_wal/", cls: "is-done" }] },
                ]),
                note: "<code>-v pgdata:/var/lib/postgresql/data</code> mounts a volume that Docker manages. The path inside the container is normal; the bytes live outside the container's lifecycle.",
            });
            f.push({
                stage: panesHTML([
                    { title: "docker rm the container", items: [], empty: "container gone" },
                    { title: "Volume  pgdata", items: [{ text: "base/", cls: "is-done" }, { text: "pg_wal/", cls: "is-done" }] },
                ]),
                note: "Delete the container, upgrade the image, recreate it &mdash; the volume is untouched and the new container picks up the same data. <b>This is the only correct way to hold state in a container.</b>",
            });
            f.push({
                stage: panesHTML([
                    { title: "docker compose down", items: [{ text: "containers removed", cls: "is-cmp" }, { text: "volumes kept", cls: "is-done" }] },
                    { title: "docker compose down -v", items: [{ text: "containers removed", cls: "is-cmp" }, { text: "volumes DELETED", cls: "is-out" }] },
                ]),
                note: "<b>The one flag worth remembering.</b> <code>-v</code> on <code>compose down</code> deletes named volumes, which is how people lose their local database at 6 p.m. It is also how you get a clean one deliberately &mdash; just know which you are asking for.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Named volume", items: [{ text: "Docker manages the location", cls: "is-done" }, { text: "survives container replacement", cls: "is-done" }, { text: "fast on every platform", cls: "is-done" }, { text: "backed up with docker run --rm -v", cls: "is-cmp" }] },
                ]),
                note: "<b>The conclusion.</b> Named volumes are the default for anything stateful in local development. In production the equivalent is a managed database or a persistent volume claim &mdash; but the mental model is identical: the data outlives the container by design.",
            });
            return f;
        }
        f.push({
            stage: panesHTML([
                { title: "Container writable layer", items: [{ text: "/var/lib/postgresql/data", cls: "is-act" }, { text: "10 000 rows", cls: "is-act" }] },
            ]),
            note: "No volume. The database writes into the container's own writable layer, and everything works perfectly &mdash; for as long as this exact container exists.",
        });
        f.push({
            stage: panesHTML([
                { title: "docker compose up --build", items: [{ text: "new image", cls: "is-done" }, { text: "new container", cls: "is-done" }, { text: "new empty writable layer", cls: "is-act" }] },
                { title: "Old container", items: [{ text: "10 000 rows", cls: "is-out" }] },
            ]),
            note: "<b>Then you rebuild.</b> A new container means a new writable layer, and the old one is removed with the rows in it. Nothing failed and nothing warned you &mdash; a container was replaced, which is the normal thing for containers to do.",
        });
        f.push({
            stage: panesHTML([
                { title: "Symptoms you will recognise", items: [{ text: "\"my local data keeps disappearing\"", cls: "is-out" }, { text: "\"it works until I rebuild\"", cls: "is-out" }, { text: "\"the migration re-runs every time\"", cls: "is-out" }] },
            ]),
            note: "<b>The diagnosis.</b> All three are the same cause: state in the writable layer. Switch the picker to see the fix &mdash; and note that this is not only a local inconvenience, it is exactly what happens to a production container on every deploy.",
        });
        return f;
    },
};

/* ---- 5. Compose start-up ---- */

VIZ["compose-up"] = {
    title: "depends_on is not \"wait until it works\"",
    legend: [["lg-act", "starting"], ["lg-done", "healthy"], ["lg-out", "failing"], ["lg-idle", "not started"]],
    options: [
        { value: "naive", label: "depends_on alone" },
        { value: "healthcheck", label: "depends_on + healthcheck" },
    ],
    build(option = "naive") {
        const W = 700;
        const H = 210;
        const draw = (db, api, arrow, caption) => {
            let s = boxHTML(60, 70, 200, 50, "db  postgres:16", db.state, db.sub);
            s += boxHTML(420, 70, 200, 50, "api", api.state, api.sub);
            s += arrowHTML(265, 95, 414, 95, arrow, "connect");
            if (caption) s += capHTML(W / 2, 180, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        if (option === "healthcheck") {
            f.push({
                stage: draw({ state: "n-act", sub: "starting" }, { state: "n-idle", sub: "waiting" }, "e-idle", "condition: service_healthy"),
                note: "Same file with two additions: a <code>healthcheck</code> on the database and <code>condition: service_healthy</code> on the dependency. Compose now waits for a <em>signal from inside</em> the container.",
            });
            f.push({
                stage: draw({ state: "n-act", sub: "pg_isready → not ready" }, { state: "n-idle", sub: "waiting" }, "e-idle", "probe every 2s"),
                note: "The healthcheck runs <code>pg_isready</code> inside the database container on a short interval. Until it succeeds, the database is <em>starting</em>, not <em>healthy</em>, and the API is not launched at all.",
            });
            f.push({
                stage: draw({ state: "n-done", sub: "pg_isready → accepting" }, { state: "n-act", sub: "starting" }, "e-idle", "healthy → dependents start"),
                note: "The probe passes, the database is marked healthy, and only then does the API container start. The race is gone because the condition is about readiness rather than about process start.",
            });
            f.push({
                stage: draw({ state: "n-done", sub: "healthy" }, { state: "n-done", sub: "connected" }, "e-done"),
                note: "It connects on the first attempt. <b>Note what this cost:</b> four lines of YAML, and it removes a class of \"it works on the second try\" that otherwise follows you into CI.",
            });
            f.push({
                stage: panesHTML([
                    { title: "Still do this as well", items: [{ text: "retry with backoff at start-up", cls: "is-done" }, { text: "fail readiness until connected", cls: "is-done" }, { text: "reconnect if the DB restarts", cls: "is-done" }] },
                    { title: "Because", items: [{ text: "orchestrators have no depends_on", cls: "is-out" }, { text: "dependencies restart mid-life", cls: "is-out" }, { text: "networks blip", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Ordering start-up is a convenience; <em>tolerating an unavailable dependency</em> is a requirement. Kubernetes has no equivalent of <code>depends_on</code> at all, so an application that only works when started in the right order will not survive a real deployment.",
            });
            return f;
        }
        f.push({
            stage: draw({ state: "n-idle", sub: "not started" }, { state: "n-idle", sub: "not started" }, "e-idle", "depends_on: [db]"),
            note: "A two-service Compose file. The API declares <code>depends_on: [db]</code>, which reads like \"start the database first and wait for it\".",
        });
        f.push({
            stage: draw({ state: "n-act", sub: "container created" }, { state: "n-act", sub: "container created" }, "e-idle", "both started ~immediately"),
            note: "<b>What it actually means is \"start it first\".</b> Compose creates the database container, and as soon as the <em>container</em> is running it starts the API &mdash; roughly a hundred milliseconds later.",
        });
        f.push({
            stage: draw({ state: "n-act", sub: "initdb, ~4 s to accept" }, { state: "n-out", sub: "ECONNREFUSED" }, "e-act"),
            note: "But Postgres needs several seconds to initialise and open its socket. The API connects, is refused, and exits. <b>The container was running; the service was not ready</b> &mdash; and those are different things at every layer of this stack.",
        });
        f.push({
            stage: panesHTML([
                { title: "What you will see", items: [{ text: "api exited with code 1", cls: "is-out" }, { text: "works on the second up", cls: "is-out" }, { text: "flaky in CI, fine locally", cls: "is-out" }] },
                { title: "Cause", items: [{ text: "\"running\" ≠ \"ready\"", cls: "is-act" }] },
            ]),
            note: "The failure is timing-dependent, so it passes on a warm machine and fails on a cold CI runner &mdash; which is the most annoying kind of failure to diagnose. Switch the picker for the fix.",
        });
        return f;
    },
};

/* ---- 6. Signals and PID 1 ---- */

VIZ["signals-pid1"] = {
    title: "Why your container takes ten seconds to stop",
    legend: [["lg-act", "signal"], ["lg-done", "clean exit"], ["lg-out", "killed"], ["lg-idle", "idle"]],
    options: [
        { value: "shell", label: "CMD python app.py" },
        { value: "exec", label: "CMD [\"python\", \"app.py\"]" },
    ],
    build(option = "shell") {
        const W = 700;
        const H = 230;
        const draw = (sh, app, sig, caption) => {
            let s = boxHTML(60, 60, 240, 50, "PID 1  /bin/sh -c", sh.state, sh.sub);
            s += boxHTML(60, 140, 240, 50, "PID 7  python app.py", app.state, app.sub);
            s += arrowHTML(180, 115, 180, 135, sh.state === "n-idle" ? "e-idle" : "e-done");
            s += boxHTML(430, 95, 220, 50, sig.label, sig.state);
            s += arrowHTML(425, 120, 310, 90, sig.arrow || "e-idle");
            if (caption) s += capHTML(W / 2, 216, caption);
            return svgHTML(W, H, s);
        };
        const f = [];
        if (option === "exec") {
            const drawExec = (app, sig, caption) => {
                let s = boxHTML(60, 95, 240, 50, "PID 1  python app.py", app.state, app.sub);
                s += boxHTML(430, 95, 220, 50, sig.label, sig.state);
                s += arrowHTML(425, 120, 310, 120, sig.arrow || "e-idle");
                if (caption) s += capHTML(W / 2, 216, caption);
                return svgHTML(W, H, s);
            };
            f.push({
                stage: drawExec({ state: "n-done", sub: "serving" }, { label: "docker stop", state: "n-idle" }),
                note: "<b>Exec form.</b> <code>CMD [\"python\", \"app.py\"]</code> runs your process directly &mdash; no shell in between, so your application is PID 1.",
            });
            f.push({
                stage: drawExec({ state: "n-act", sub: "SIGTERM received" }, { label: "SIGTERM", state: "n-act", arrow: "e-act" }, "handler runs"),
                note: "<code>docker stop</code> sends <code>SIGTERM</code> and it arrives at your code. Your handler stops accepting new work, finishes in-flight requests and closes the database pool.",
            });
            f.push({
                stage: drawExec({ state: "n-done", sub: "exit 0 after 1.2 s" }, { label: "clean exit", state: "n-done", arrow: "e-done" }),
                note: "The process exits on its own in a second or so. No dropped requests, no ten-second wait, exit code 0 rather than 143 &mdash; and the same handler is what makes rolling deploys invisible to users later.",
            });
            f.push({
                stage: panesHTML([
                    { title: "If you need a shell wrapper", items: [{ text: "#!/bin/sh", cls: "is-cmp" }, { text: "run_migrations", cls: "is-cmp" }, { text: "exec python app.py", cls: "is-done" }] },
                    { title: "Why exec matters there", items: [{ text: "exec REPLACES the shell", cls: "is-done" }, { text: "same PID, signals arrive", cls: "is-done" }, { text: "without it, back to square one", cls: "is-out" }] },
                ]),
                note: "<b>The conclusion worth memorising.</b> Use exec form for <code>CMD</code> and <code>ENTRYPOINT</code>, and if you must wrap in a script, end it with <code>exec</code>. If your process spawns children, add an init (<code>--init</code>, or <code>tini</code>) so orphaned processes are reaped &mdash; PID 1 has no default handlers and no reaper.",
            });
            return f;
        }
        f.push({
            stage: draw({ state: "n-done", sub: "the shell" }, { state: "n-done", sub: "your app" }, { label: "docker stop", state: "n-idle" }),
            note: "<b>Shell form.</b> <code>CMD python app.py</code> is rewritten to <code>/bin/sh -c \"python app.py\"</code>. The shell becomes PID 1 and your application is its child &mdash; and almost nobody notices until a deploy drops requests.",
        });
        f.push({
            stage: draw({ state: "n-act", sub: "receives SIGTERM" }, { state: "n-idle", sub: "hears nothing" }, { label: "SIGTERM", state: "n-act", arrow: "e-act" }, "sh does not forward signals"),
            note: "<code>docker stop</code> sends <code>SIGTERM</code> to <b>PID 1</b> &mdash; the shell. A plain <code>sh</code> running a single command does not forward signals to its child, so your application never learns that it is being asked to stop.",
        });
        f.push({
            stage: draw({ state: "n-out", sub: "waiting" }, { state: "n-act", sub: "still serving" }, { label: "10 s grace period", state: "n-act", arrow: "e-idle" }, "nothing happens for ten seconds"),
            note: "Your handler never runs. The runtime waits out the grace period while the application carries on as though nothing happened.",
        });
        f.push({
            stage: draw({ state: "n-out", sub: "killed" }, { state: "n-out", sub: "killed mid-request" }, { label: "SIGKILL", state: "n-out", arrow: "e-act" }, "exit code 137"),
            note: "<b>Then <code>SIGKILL</code>, which cannot be caught.</b> In-flight requests are dropped, connections are not closed, buffers are not flushed. Every stop takes ten seconds and every deploy costs a few errors that nobody can explain.",
        });
        f.push({
            stage: panesHTML([
                { title: "Symptoms", items: [{ text: "docker stop always takes 10 s", cls: "is-out" }, { text: "exit code 137 on every stop", cls: "is-out" }, { text: "error spike at each deploy", cls: "is-out" }] },
                { title: "Cause", items: [{ text: "PID 1 is /bin/sh", cls: "is-act" }] },
            ]),
            note: "Check it with <code>docker exec &lt;c&gt; ps -o pid,cmd</code>: if PID 1 is a shell, this is you. Switch the picker for the one-line fix.",
        });
        return f;
    },
};

/* ---- 7. Registries ---- */

VIZ["registry-push"] = {
    title: "What a push actually uploads",
    legend: [["lg-act", "uploading"], ["lg-done", "already there"], ["lg-out", "mutable"], ["lg-idle", "local"]],
    build() {
        const f = [];
        f.push({
            stage: panesHTML([
                { title: "Local image  myapp:v1", stack: true, items: [{ text: "app source — 3 MB", cls: "is-act" }, { text: "dependencies — 180 MB", cls: "is-act" }, { text: "python:3.12-slim — 130 MB", cls: "is-act" }] },
                { title: "Registry", items: [], empty: "empty" },
            ]),
            note: "First push. Every layer is new to the registry, so all 313 MB is uploaded. This is the slow one, and it is the only slow one.",
        });
        f.push({
            stage: panesHTML([
                { title: "Local image  myapp:v2", stack: true, items: [{ text: "app source — 3 MB (changed)", cls: "is-act" }, { text: "dependencies — 180 MB", cls: "is-done" }, { text: "python:3.12-slim — 130 MB", cls: "is-done" }] },
                { title: "Registry", items: [{ text: "sha256:aa11… 130 MB", cls: "is-done" }, { text: "sha256:bb22… 180 MB", cls: "is-done" }] },
            ]),
            note: "<b>You change one file and push again: 3 MB moves.</b> Layers are content-addressed, so the client asks the registry which digests it already has and uploads only the rest. This is the practical reason layer ordering matters (see the layer-cache animation).",
        });
        f.push({
            stage: panesHTML([
                { title: "Manifest — the image itself", items: [{ text: "config blob", cls: "is-done" }, { text: "layer sha256:aa11…", cls: "is-done" }, { text: "layer sha256:bb22…", cls: "is-done" }, { text: "layer sha256:cc33…", cls: "is-done" }] },
                { title: "Digest = sha256(manifest)", items: [{ text: "myapp@sha256:9f2c1ab…", cls: "is-act" }] },
            ]),
            note: "The <b>manifest</b> is a small JSON document listing the layers. Its own hash is the <b>image digest</b>, and it cannot be changed without becoming a different digest. That is the only truly stable name an image has.",
        });
        f.push({
            stage: panesHTML([
                { title: "Tags — mutable pointers", items: [{ text: "myapp:latest → 9f2c1ab", cls: "is-out" }, { text: "myapp:v2 → 9f2c1ab", cls: "is-out" }, { text: "myapp:9f2c1ab → 9f2c1ab", cls: "is-cmp" }] },
                { title: "Digest — immutable", items: [{ text: "myapp@sha256:9f2c1ab", cls: "is-done" }] },
            ]),
            note: "<b>Anyone with push access can move a tag.</b> <code>latest</code> is not a version, it is simply the tag used when you give none &mdash; so two containers started an hour apart can be running different code with the same tag.",
        });
        f.push({
            stage: panesHTML([
                { title: "Deploying by tag", items: [{ text: "cannot say what is running", cls: "is-out" }, { text: "no stable name to roll back to", cls: "is-out" }, { text: "a restart may upgrade you", cls: "is-out" }] },
                { title: "Deploying by digest", items: [{ text: "exactly one possible artifact", cls: "is-done" }, { text: "rollback = previous digest", cls: "is-done" }, { text: "pull policy can be IfNotPresent", cls: "is-done" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Tag for humans, deploy by digest. Build once, push once, and let every environment reference the same <code>sha256:</code> &mdash; then \"it passed in staging\" is a statement about the identical bytes rather than about something that was rebuilt.",
        });
        return f;
    },
};

/* ---- 8. Debugging a container that will not start ---- */

VIZ["debug-container"] = {
    title: "A container will not start — the order to check",
    legend: [["lg-act", "checking"], ["lg-done", "ruled out"], ["lg-out", "the cause"], ["lg-idle", "not reached"]],
    build() {
        const W = 740;
        const H = 300;
        const STEPS = [
            ["docker ps -a", "what is the exit code?"],
            ["docker logs <c>", "did it print anything?"],
            ["exit 137?", "OOM — raise memory or fix the leak"],
            ["exit 127?", "command not found — wrong path or wrong arch"],
            ["exit 1 + traceback?", "your app — missing env var, unreachable dep"],
            ["no logs at all?", "entrypoint never ran — check ENTRYPOINT/CMD"],
        ];
        const draw = (states) => {
            let s = "";
            STEPS.forEach((st, i) => {
                s += boxHTML(30, 20 + i * 46, 260, 36, st[0], states[i] || "n-idle");
                s += capHTML(306, 42 + i * 46, st[1], "start");
            });
            return svgHTML(W, H, s);
        };
        const f = [];
        f.push({
            stage: draw([]),
            note: "The instinct is to change the Dockerfile and rebuild. Do this instead &mdash; it takes ninety seconds and the exit code alone usually names the problem.",
        });
        f.push({
            stage: draw(["n-act"]),
            note: "<b>Start with the exit code.</b> <code>docker ps -a</code> shows it for every stopped container. It is the single most informative number available and it is almost always skipped.",
        });
        f.push({
            stage: draw(["n-done", "n-act"]),
            note: "<b>Then the logs of the container that died.</b> Note that <code>docker logs</code> works on an exited container &mdash; and in Kubernetes the equivalent is <code>kubectl logs --previous</code>, without which you are reading the logs of the replacement rather than the failure.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-out"]),
            note: "<b>137</b> is 128 + 9: <code>SIGKILL</code>, and in practice always the memory limit. There is no traceback because <code>SIGKILL</code> cannot be caught. Confirm with <code>docker inspect --format='{{.State.OOMKilled}}'</code>.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-out"]),
            note: "<b>127</b> means the command was not found. Usually a typo in <code>CMD</code>, a binary that is not on <code>PATH</code> in the runtime stage, or &mdash; the one that wastes an afternoon &mdash; an <code>amd64</code> binary on an <code>arm64</code> machine.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-out"]),
            note: "<b>Exit 1 with a traceback</b> is the friendly case: it is your application. Overwhelmingly it is a missing environment variable or a dependency it cannot reach &mdash; which is a networking question, so check the service name and the port from inside the container.",
        });
        f.push({
            stage: draw(["n-done", "n-done", "n-done", "n-done", "n-done", "n-out"]),
            note: "<b>No logs at all</b> means your entrypoint never got as far as printing. Override it and look around: <code>docker run --rm -it --entrypoint sh myapp</code> gives you a shell inside the exact image, which answers \"is the file even there?\" immediately.",
        });
        f.push({
            stage: panesHTML([
                { title: "Inspect without running", items: [{ text: "docker run --rm -it --entrypoint sh img", cls: "is-done" }, { text: "docker history --no-trunc img", cls: "is-done" }, { text: "docker inspect img | jq .[0].Config", cls: "is-done" }] },
                { title: "Inspect while running", items: [{ text: "docker exec -it <c> sh", cls: "is-act" }, { text: "docker stats <c>", cls: "is-act" }, { text: "docker top <c>", cls: "is-act" }] },
            ]),
            note: "<b>The conclusion worth memorising.</b> Almost every container failure is one of: exit code says OOM, exit code says command-not-found, the app logged a real error, or the entrypoint never ran. Work down that list before you change a single line of the Dockerfile.",
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
