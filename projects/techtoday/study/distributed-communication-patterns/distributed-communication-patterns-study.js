/* ==========================================================================
   TechToday - Distributed Communication Patterns study guide
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
        "requests httpx grpc aiokafka confluent_kafka pika boto3 redis psycopg sqlalchemy " +
        "tenacity uuid hashlib hmac threading contextlib " +
        "numpy np pytest asyncio json os time math random logging").split(" ")
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
        "python python3 pip uv node npm npx git docker docker-compose kubectl make " +
        "grpcurl protoc kafka-topics kafka-console-consumer kafka-consumer-groups redis-cli " +
        "nc dig openssl base64 watch date time hey wrk ab").split(" ")
);
/* Broker, gateway, mesh and retry-policy configuration. */
const YAML_KW = new Set("true false null yes no on off".split(" "));
const YAML_BUILTIN = new Set(
    ("apiVersion kind metadata name namespace labels spec selector ports port targetPort " +
        "replicas template containers image env args command resources limits requests " +
        "retries attempts perTryTimeout retryOn timeout backoff initialInterval maxInterval " +
        "multiplier jitter circuitBreaker maxConnections maxPendingRequests maxRequestsPerConnection " +
        "consecutive5xxErrors baseEjectionTime outlierDetection loadBalancer simple consistentHash " +
        "http route destination host subset weight trafficPolicy connectionPool tcp " +
        "topic partitions replicationFactor acks retention cleanup group consumer producer " +
        "queue exchange binding routingKey durable deadLetterExchange visibilityTimeout " +
        "maxReceiveCount redrivePolicy fifo contentBasedDeduplication").split(" ")
);
const JSON_KW = new Set("true false null".split(" "));
const JSON_BUILTIN = new Set(
    ("id type source time specversion subject data datacontenttype dataschema " +
        "eventId eventType eventVersion occurredAt producedAt aggregateId aggregateType " +
        "messageId correlationId causationId traceparent tracestate idempotencyKey " +
        "partitionKey orderId customerId amount currency status state payload headers " +
        "attempt deliveryCount offset partition topic key value timestamp " +
        "object string number integer boolean array properties required enum items").split(" ")
);
/* Protobuf service and message definitions for the gRPC sections. */
const PROTO_KW = new Set(
    ("syntax package option import service rpc message enum oneof repeated optional required " +
        "reserved returns stream extend map public weak").split(" ")
);
const PROTO_BUILTIN = new Set(
    ("double float int32 int64 uint32 uint64 sint32 sint64 fixed32 fixed64 sfixed32 sfixed64 " +
        "bool string bytes google protobuf Timestamp Duration Empty Any").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
    yaml: [YAML_KW, YAML_BUILTIN],
    json: [JSON_KW, JSON_BUILTIN],
    proto: [PROTO_KW, PROTO_BUILTIN],
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
    python: "Python",
    javascript: "TypeScript",
    json: "Wire format",
    yaml: "Config",
    proto: "Protobuf",
    bash: "Shell",
    text: "Output",
};
const LANG_KEY = "tt-distributed-communication-patterns-lang";
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
   Distributed communication widgets
   ========================================================================== */


/* ==========================================================================
   Distributed communication widgets
   ========================================================================== */

/* Most widgets here are sequence diagrams that reveal one message per frame,
   so the frame building is shared. A script entry is
   { from, to, y, text, note, state?, after? }. */
const seqFrames = (W, H, lanes, script, intro, outro) => {
    const settled = (m) => ({ from: m.from, to: m.to, y: m.y, text: m.text, state: m.after || "e-done" });
    const frames = [{ stage: seqHTML(W, H, lanes, []), note: intro }];
    script.forEach((step, i) => {
        const msgs = script
            .slice(0, i + 1)
            .map((m, k) => (k === i ? { from: m.from, to: m.to, y: m.y, text: m.text, state: m.state || "e-act" } : settled(m)));
        const lit = lanes.map((l, k) => ({
            ...l,
            state: k === step.from || k === step.to ? step.lane || "n-act" : "n-idle",
        }));
        frames.push({ stage: seqHTML(W, H, lit, msgs), note: `<b>Step ${i + 1}.</b> ${step.note}` });
    });
    if (outro) frames.push({ stage: seqHTML(W, H, lanes, script.map(settled)), note: outro });
    return frames;
};

/* ---- 1. Synchronous vs asynchronous ---- */

VIZ["sync-vs-async"] = {
    title: "Two ways to ask another service for something",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "idle"]],
    options: [
        { value: "sync", label: "Synchronous request/reply" },
        { value: "async", label: "Asynchronous messaging" },
    ],
    build(option = "sync") {
        const W = 900;
        const H = 380;

        if (option === "async") {
            const lanes = [
                { x: 110, label: "Client", sub: "free after 40 ms" },
                { x: 340, label: "Order API", sub: "records the fact" },
                { x: 570, label: "Broker", sub: "durable buffer" },
                { x: 800, label: "Workers", sub: "own schedule" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "POST /orders", note: "The same request from the same client. What changes is the <em>contract</em>: the API promises to remember the order, not to finish it." },
                { from: 1, to: 2, y: 150, text: "publish OrderPlaced", note: "The API writes the order row and publishes an <code>OrderPlaced</code> event. The only thing it waits for is the broker's durable acknowledgement \u2014 a few milliseconds." },
                { from: 1, to: 0, y: 190, text: "202 Accepted \u00b7 40 ms", note: "<b><code>202 Accepted</code>, not <code>200 OK</code>.</b> The client is released in <code>40 ms</code>, but notice what it does <em>not</em> get: a payment confirmation number, because none exists yet." },
                { from: 2, to: 3, y: 230, text: "deliver \u2192 billing", note: "Billing consumes the event and charges the card. It was never on the client's clock, so a slow card network costs the client nothing." },
                { from: 2, to: 3, y: 270, text: "deliver \u2192 email (retry \u00d73)", note: "The email service is still wedged. The broker simply <b>holds the message and retries</b>. The outage turns into a queue depth on a dashboard instead of a 504 on a customer's screen." },
                { from: 3, to: 2, y: 310, text: "ack", note: "Email recovers and acks. The work finished <em>later</em> than in the synchronous version \u2014 but nothing was dropped and no human saw the failure." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "Same business outcome, different promise. Press <b>Play</b> and watch how early the client is released.",
                "<b>Conclusion.</b> Asynchrony buys availability and absorbs spikes, and charges you in <b>eventual consistency</b>: for a while the order exists but is not paid for, and your UI has to say so. Reach for a queue when the caller does not need the answer \u2014 not because queues are fashionable."
            );
        }

        const lanes = [
            { x: 110, label: "Client", sub: "blocked" },
            { x: 340, label: "Order API", sub: "orchestrates" },
            { x: 570, label: "Payments", sub: "healthy" },
            { x: 800, label: "Email", sub: "wedged" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "POST /orders", note: "The client sends the request and <b>blocks</b>. A socket, a thread and a spinner are now hostage to everything that happens to the right of this line." },
            { from: 1, to: 2, y: 150, text: "POST /charge", note: "The Order API calls Payments inline. The client's clock is still running, even though the client has never heard of Payments." },
            { from: 2, to: 1, y: 190, text: "200 OK \u00b7 180 ms", note: "Payments answers in <code>180 ms</code>. Fine in isolation \u2014 but latencies <b>add</b>, and the caller's p99 is the sum of the chain's p99s, not the average of its averages." },
            { from: 1, to: 3, y: 230, text: "POST /email", note: "Now the receipt email. It is not needed to accept the order, yet it sits in the request path \u2014 so it is in the <b>critical path</b>." },
            { from: 3, to: 1, y: 270, text: "\u2026 3 s, no reply", note: "Email is wedged: no response, no error, nothing to act on. <b>Availability multiplies</b> \u2014 four dependencies at 99.9% each leave you at 99.6%." },
            { from: 1, to: 0, y: 310, text: "504 \u2014 order failed", note: "The client sees a <code>504</code> and cannot tell what happened. <b>The card was charged.</b> One slow non-essential dependency turned into a lost order and an inconsistent ledger." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "A synchronous call chain: the client holds a connection open while the Order API calls its dependencies one after another.",
            "<b>Conclusion.</b> Synchronous calls are right when the caller needs the answer to continue \u2014 a price, an auth decision, a seat. They buy simple code and immediate errors, and they charge you coupling: <b>latency is the sum of the chain, availability is the product of it</b>."
        );
    },
};

/* ---- 2. Partial failure ---- */

VIZ["partial-failure"] = {
    title: "The failure mode that does not exist in a monolith",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "lost"]],
    build() {
        const W = 860;
        const H = 400;
        const lanes = [
            { x: 130, label: "Client", sub: "2 s timeout" },
            { x: 430, label: "Payments API", sub: "" },
            { x: 730, label: "Ledger DB", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "POST /charge \u00a382.10", note: "A perfectly ordinary call. In a single process this would be a function call that either returns or throws \u2014 two outcomes." },
            { from: 1, to: 2, y: 150, text: "INSERT charge", note: "The API does the real work: it writes a row to the ledger." },
            { from: 2, to: 1, y: 190, text: "committed", note: "The write commits. <b>The money has moved.</b> Whatever happens next cannot un-happen this." },
            { from: 1, to: 0, y: 230, text: "200 OK \u2014 dropped", after: "e-idle", note: "The response is sent \u2026 and a load balancer recycles the connection underneath it. The reply never lands. <b>There is now no packet in the world that says the charge happened.</b>" },
            { from: 0, to: 1, y: 270, text: "timeout at 2 s \u2014 retry", note: "The client's timeout fires. A timeout is <em>not</em> an error code: it tells you nothing about the server. Never arrived, arrived and failed, or arrived and succeeded \u2014 all three look identical from here." },
            { from: 1, to: 2, y: 310, text: "INSERT charge (again)", note: "The retry runs the whole thing again. Without a deduplication key this is simply a second row." },
            { from: 2, to: 1, y: 350, text: "charged twice", note: "<b>\u00a3164.20.</b> The client did nothing wrong \u2014 it retried a call it had every reason to believe had failed." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "In one process a call returns or throws. Across a network it has a <b>third outcome</b>: you never find out. Press <b>Play</b>.",
            "<b>Conclusion.</b> Every remote call has three outcomes \u2014 success, failure, and <b>unknown</b>. Unknown is the common one under load, and it is why the rest of this course exists: idempotency keys, deadlines, circuit breakers and outboxes are all machinery for surviving the third outcome."
        );
    },
};

/* ---- 3. The four RPC shapes ---- */

VIZ["rpc-modes"] = {
    title: "Four call shapes, one connection",
    legend: [["lg-act", "current message"], ["lg-done", "delivered"], ["lg-idle", "idle"]],
    options: [
        { value: "unary", label: "Unary RPC" },
        { value: "server", label: "Server streaming" },
        { value: "client", label: "Client streaming" },
        { value: "bidi", label: "Bidirectional streaming" },
    ],
    build(option = "unary") {
        const W = 760;
        const H = 340;
        const lanes = [
            { x: 200, label: "Client stub", sub: "generated code" },
            { x: 560, label: "Server", sub: "generated stub" },
        ];
        const scripts = {
            unary: {
                intro: "<b>Unary</b> is the shape everyone knows: one request, one response, over a single HTTP/2 stream.",
                steps: [
                    { from: 0, to: 1, y: 130, text: "GetOrder(id: \"A-4471\")", note: "The client calls what looks like a local method. The generated stub serialises the arguments to protobuf and opens an HTTP/2 stream." },
                    { from: 1, to: 0, y: 190, text: "Order{\u2026} \u00b7 104 bytes", note: "The server answers once and the stream closes. Binary framing gives <code>104 bytes</code> where the equivalent JSON was <code>412</code>." },
                ],
                outro: "<b>Conclusion.</b> Use unary for everything that fits request/reply. It is the only shape that maps cleanly onto retries, caching and ordinary HTTP semantics.",
            },
            server: {
                intro: "<b>Server streaming</b>: one request, many responses. Think &ldquo;subscribe&rdquo;, or &ldquo;give me this large result in pieces&rdquo;.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "WatchShipment(id)", note: "One request opens the stream. The client will not send again." },
                    { from: 1, to: 0, y: 165, text: "status: PICKED", note: "The first message arrives the moment it exists \u2014 there is no polling interval to tune and no wasted empty responses." },
                    { from: 1, to: 0, y: 210, text: "status: IN_TRANSIT", note: "The stream stays open. Each message is a separate frame on the same TCP connection, so there is no per-message handshake." },
                    { from: 1, to: 0, y: 255, text: "status: DELIVERED", note: "The server half-closes with an explicit status. <b>A clean end-of-stream is part of the contract</b> \u2014 never make clients infer completion from silence." },
                ],
                outro: "<b>Conclusion.</b> Server streaming replaces polling loops and cursor pagination. The cost: a retry must know where it got to, so carry a resume token in every message.",
            },
            client: {
                intro: "<b>Client streaming</b>: many requests, one response. This is bulk upload \u2014 telemetry, log batches, a large file.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "chunk 1 of 3", note: "The client opens the stream and starts sending without waiting for anything." },
                    { from: 0, to: 1, y: 165, text: "chunk 2 of 3", note: "No round trip per chunk \u2014 that is the whole point. One RTT of setup is amortised across the entire upload." },
                    { from: 0, to: 1, y: 210, text: "chunk 3 of 3", note: "The client half-closes the stream to say &ldquo;that was everything&rdquo;." },
                    { from: 1, to: 0, y: 255, text: "UploadSummary{rows: 41209}", note: "Only now does the server answer, once, with a summary." },
                ],
                outro: "<b>Conclusion.</b> Client streaming is the shape people forget exists and then re-implement badly as <code>POST /batch</code> with a payload limit they keep raising.",
            },
            bidi: {
                intro: "<b>Bidirectional streaming</b>: both sides send whenever they like, on one stream, independently.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "subscribe(symbols)", note: "The client opens the stream with what it cares about right now." },
                    { from: 1, to: 0, y: 160, text: "tick AAPL 214.02", note: "The server pushes without being asked again." },
                    { from: 0, to: 1, y: 200, text: "add(symbol: MSFT)", note: "<b>The client sends mid-stream.</b> This is what separates bidi from server streaming \u2014 the subscription is editable in place, with no reconnect." },
                    { from: 1, to: 0, y: 240, text: "tick MSFT 501.77", note: "Neither direction blocks the other; HTTP/2 flow control meters each one separately." },
                    { from: 1, to: 0, y: 280, text: "tick AAPL 214.10", note: "Ordering is guaranteed <em>within</em> one direction of one stream \u2014 and guaranteed nowhere else." },
                ],
                outro: "<b>Conclusion.</b> Bidi is the closest thing to a WebSocket with a schema. It is also the hardest to operate: no HTTP caching, long-lived connections that defeat load balancers, and a reconnect story you have to design yourself.",
            },
        };
        const s = scripts[option] || scripts.unary;
        return seqFrames(W, H, lanes, s.steps, s.intro, s.outro);
    },
};

/* ---- 4. Wire formats ---- */

VIZ["wire-formats"] = {
    title: "The same order, five encodings",
    legend: [["lg-act", "under discussion"], ["lg-cmp", "compared"], ["lg-done", "recommended"]],
    build() {
        const rows = [
            ["Encoding", "Bytes", "Self-describing", "Schema needed", "Good for"],
            ["JSON", "412", "yes", "no", "public APIs, debugging"],
            ["JSON + gzip", "241", "yes", "no", "JSON you cannot replace"],
            ["MessagePack", "298", "yes", "no", "drop-in binary JSON"],
            ["Protobuf", "104", "no", "yes (.proto)", "internal RPC"],
            ["Avro", "82", "no", "yes (registry)", "event logs, analytics"],
        ];
        const HEAD = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head" };
        const row = (r, cls) => {
            const m = {};
            for (let c = 0; c < 5; c += 1) m[`${r},${c}`] = cls;
            return m;
        };
        const at = (...ms) => Object.assign({}, HEAD, ...ms);
        const frames = [];
        frames.push({
            stage: dataGridHTML(rows, HEAD),
            note: "One order \u2014 an id, a customer, an amount, a currency, a timestamp and three line items \u2014 encoded five ways. The interesting column is not <em>Bytes</em>.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(1, "is-act"))),
            note: "<b>JSON, 412 bytes.</b> Every field name is repeated in every message, as text. You pay for the string <code>\"customerId\"</code> a million times a day. In exchange anyone can read it with <code>curl</code> and nobody needs your schema file.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(1, "is-cmp"), row(2, "is-act"))),
            note: "<b>gzip gets you most of the way.</b> Repeated field names compress brilliantly \u2014 <code>241 bytes</code> for one line of config. Turn this on before you even consider changing format.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(1, "is-cmp"), row(2, "is-cmp"), row(3, "is-act"))),
            note: "<b>MessagePack, 298 bytes.</b> Binary, but still self-describing \u2014 it keeps the field names, just encodes them more tightly. A drop-in swap that buys 30%, not 4\u00d7.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(1, "is-cmp"), row(3, "is-cmp"), row(4, "is-act"))),
            note: "<b>Protobuf, 104 bytes.</b> Field <em>names</em> are replaced by <em>tag numbers</em> from the <code>.proto</code>, and integers are varint-encoded. That is where the 4\u00d7 comes from \u2014 and why a receiver without the schema sees only bytes.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(4, "is-cmp"), row(5, "is-act"))),
            note: "<b>Avro, 82 bytes.</b> Avro writes no field tags at all \u2014 just values in schema order, with the schema id carried once per <em>file or topic</em> rather than per message. Unbeatable for a billion identical records; useless for a one-off request.",
        });
        frames.push({
            stage: dataGridHTML(rows, at(row(1, "is-done"), row(4, "is-done"))),
            note: "<b>Conclusion.</b> Use <b>JSON at the edge</b>, where humans and browsers live, and <b>Protobuf or Avro inside</b>, where the same shape repeats billions of times. The decisive question is never bytes \u2014 it is whether both ends can be trusted to hold the same schema.",
        });
        return frames;
    },
};

/* ---- 5. Schema evolution ---- */

VIZ["schema-evolution"] = {
    title: "Changing a message without a flag day",
    legend: [["lg-act", "changed"], ["lg-done", "compatible"], ["lg-out", "breaks"], ["lg-idle", "unchanged"]],
    build() {
        const pane = (title, items) => ({ title, items, stack: true });
        const frames = [];
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v1", ["1 orderId: string", "2 amount: int64", "3 currency: string"]),
                pane("Consumer \u2014 v1", ["reads 1, 2, 3", "\u2713 agreed"]),
            ]),
            note: "The starting point: both sides hold the same schema. In a distributed system this state lasts exactly as long as it takes someone to open a pull request.",
        });
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v2", ["1 orderId: string", "2 amount: int64", "3 currency: string", { text: "4 couponCode: string", cls: "is-act" }]),
                pane("Consumer \u2014 v1", ["reads 1, 2, 3", { text: "skips unknown tag 4", cls: "is-done" }]),
            ]),
            note: "<b>Adding an optional field is safe.</b> The old consumer meets tag <code>4</code>, does not recognise it, and skips it using the length prefix. That is <b>backward compatibility</b>: new data, old reader.",
        });
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v1", ["1 orderId", "2 amount", "3 currency"]),
                pane("Consumer \u2014 v2", ["reads 1, 2, 3", { text: "4 couponCode \u2192 default \"\"", cls: "is-done" }]),
            ]),
            note: "The mirror case: a <b>new consumer reading old data</b> fills the missing field with its default. That is <b>forward compatibility</b> \u2014 and precisely why the new field must have a sensible default and must not be required.",
        });
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v3", ["1 orderId", "2 amount", { text: "3 currency \u2014 REMOVED", cls: "is-out" }]),
                pane("Consumer \u2014 v1", ["reads 1, 2", { text: "currency \u2192 \"\" \u2192 bills in \u00a3", cls: "is-out" }]),
            ]),
            note: "<b>Removing a field a consumer needs is a silent break.</b> Nothing throws. The consumer takes the default and cheerfully bills a Japanese customer in pounds. Deprecate, watch the usage metric fall to zero, delete months later.",
        });
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v4", ["1 orderId", { text: "2 amount \u2192 amountMinor", cls: "is-act" }, "3 currency"]),
                pane("Consumer \u2014 v1", [{ text: "reads tag 2 as amount", cls: "is-done" }, "\u2713 unaffected"]),
            ]),
            note: "<b>Renaming is free; renumbering is fatal.</b> The wire carries tag <code>2</code>, never the word <code>amount</code>. Rename in your IDE all you like \u2014 but write <code>reserved 2;</code> if you ever drop it, so nobody recycles the tag for a different type.",
        });
        frames.push({
            stage: panesHTML([
                pane("Producer \u2014 v5", ["1 orderId", "2 amountMinor", { text: "3 currency: string \u2192 enum", cls: "is-out" }]),
                pane("Consumer \u2014 v1", [{ text: "tag 3: expected string, got varint", cls: "is-out" }, "\u2717 parse error"]),
            ]),
            note: "<b>Changing a field's type on the same tag is the one thing you can never do.</b> The reader decodes by wire type; a string became a varint and the entire message is garbage. Add a new tag and migrate readers across.",
        });
        frames.push({
            stage: panesHTML([
                pane("Rules that always hold", [
                    { text: "add optional + default \u2192 safe", cls: "is-done" },
                    { text: "rename \u2192 safe, tags are the contract", cls: "is-done" },
                    { text: "remove \u2192 deprecate, then reserve", cls: "is-act" },
                    { text: "retype or renumber \u2192 never", cls: "is-out" },
                ]),
                pane("How you enforce it", [
                    "a schema registry rejects bad versions",
                    "buf breaking / avro compat check in CI",
                    "producers deploy first, consumers second",
                ]),
            ]),
            note: "<b>Conclusion.</b> You never get to upgrade both sides at once \u2014 during any rollout v1 and v2 are both live and talking to each other. Compatibility is a property you <b>enforce in CI with a registry</b>, not a convention you hope people remember.",
        });
        return frames;
    },
};

/* ---- 6. Service discovery ---- */

VIZ["service-discovery"] = {
    title: "Finding an address that keeps changing",
    legend: [["lg-act", "current step"], ["lg-done", "healthy"], ["lg-out", "evicted"], ["lg-idle", "unknown"]],
    build() {
        const W = 820;
        const H = 320;
        const draw = (states, caption, client) => {
            let s = bandHTML(360, 26, 430, 266, "orders service \u2014 instances");
            s += boxHTML(30, 130, 150, 54, "checkout", client || "n-idle", "the caller");
            s += boxHTML(210, 136, 120, 44, "registry", "n-cmp", "");
            s += arrowHTML(180, 157, 208, 157, client ? "e-act" : "e-idle");
            states.forEach((st, i) => {
                s += boxHTML(400, 54 + i * 58, 180, 42, st.label, st.state, "");
                s += arrowHTML(332, 157, 396, 75 + i * 58, st.state === "n-out" ? "e-idle" : "e-done");
                if (st.tag) s += capHTML(600, 80 + i * 58, st.tag, "start");
            });
            if (caption) s += capHTML(410, 310, caption, "start");
            return svgHTML(W, H, s);
        };
        const insts = (a, b, c) => [
            { label: "10.0.1.7:8080", state: a },
            { label: "10.0.2.9:8080", state: b },
            { label: "10.0.3.4:8080", state: c },
        ];
        const frames = [];
        frames.push({
            stage: draw(insts("n-idle", "n-idle", "n-idle"), "nothing knows about anything yet"),
            note: "Three instances of the orders service exist. Their addresses were handed out by a scheduler thirty seconds ago and will change again at the next deploy. <b>Hard-coding them is not an option.</b>",
        });
        frames.push({
            stage: draw(insts("n-act", "n-act", "n-act"), "each instance registers itself on boot"),
            note: "On boot each instance <b>registers</b> its address \u2014 with Consul, etcd, Eureka, or in Kubernetes with the API server via Endpoints. Self-registration wins because only the instance knows when it is genuinely ready to serve.",
        });
        frames.push({
            stage: draw(insts("n-done", "n-done", "n-done"), "registry probes /healthz every 5 s"),
            note: "Registration alone is not enough \u2014 a crashed process cannot deregister itself. The registry <b>health-checks continuously</b> and entries carry a TTL, so a silent instance falls out on its own.",
        });
        frames.push({
            stage: draw(insts("n-done", "n-done", "n-done"), "resolve orders.internal \u2192 3 addresses", "n-act"),
            note: "Checkout asks for <code>orders.internal</code> and gets back the <b>whole healthy set</b>, not a single address. That matters: with the full list the caller can balance load itself instead of pinning to whatever DNS happened to answer first.",
        });
        frames.push({
            stage: draw(insts("n-done", "n-out", "n-done"), "10.0.2.9 failed 3 probes \u2014 evicted", "n-act"),
            note: "The middle instance stops answering and is <b>evicted</b>. The registry pushes the change, or the client re-resolves on a short TTL. The gap between &ldquo;dead&rdquo; and &ldquo;known dead&rdquo; is <em>probe interval \u00d7 failure threshold</em> \u2014 pick it deliberately, it is your blast radius.",
        });
        frames.push({
            stage: draw([...insts("n-done", "n-out", "n-done"), { label: "10.0.4.2:8080", state: "n-act", tag: "warming up" }], "the scheduler starts a replacement", "n-act"),
            note: "A replacement boots and registers. Nobody edited a config file and nobody restarted checkout. <b>Give new instances a warm-up</b> \u2014 a cache-cold, JIT-cold process that takes full traffic instantly looks exactly like an outage.",
        });
        frames.push({
            stage: draw([...insts("n-done", "n-out", "n-done"), { label: "10.0.4.2:8080", state: "n-done", tag: "serving" }], "steady state, no human involved"),
            note: "<b>Conclusion.</b> Discovery is a <em>freshness</em> problem, not a lookup problem. Every design \u2014 DNS with short TTLs, a sidecar watching the registry, a client library that subscribes \u2014 is trading how stale the caller's address list may be against how much load the registry can take.",
        });
        return frames;
    },
};

/* ---- 7. Load balancing ---- */

VIZ["load-balancing"] = {
    title: "Picking one of N, badly and well",
    legend: [["lg-act", "chosen"], ["lg-done", "busy"], ["lg-out", "gone"], ["lg-idle", "free"]],
    options: [
        { value: "rr", label: "Round robin" },
        { value: "least", label: "Least connections" },
        { value: "hash", label: "Consistent hashing" },
    ],
    build(option = "rr") {
        const frames = [];

        if (option === "hash") {
            const keys = ["user:14", "user:29", "user:31", "user:57", "user:62", "user:88"];
            const homes = ["A", "B", "C", "A", "B", "C"];
            const after = ["A", "C", "C", "A", "C", "C"];
            const rows = (map, title) => [["key", "node", title], ...keys.map((k, i) => [k, map[i], map[i] === homes[i] ? "unchanged" : "moved"])];
            const HEAD = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head" };
            frames.push({
                stage: dataGridHTML(rows(homes, "status"), HEAD),
                note: "Hashing routes by <em>key</em>, not by turn: every request for <code>user:29</code> lands on the same node, so that node's cache actually gets warm. The naive version is <code>hash(key) % N</code>.",
            });
            frames.push({
                stage: dataGridHTML(rows(homes, "status"), { ...HEAD, "2,1": "is-act", "5,1": "is-act" }),
                note: "Node <b>B</b> owns two of the six keys. A cache hit rate that only works while the node set is stable is not much of a cache \u2014 so what happens when B dies?",
            });
            frames.push({
                stage: dataGridHTML([["key", "node", "status"], ...keys.map((k, i) => [k, String(((i * 7 + 3) % 3) === 0 ? "A" : ((i * 7 + 3) % 3) === 1 ? "B" : "C"), "moved"])], { ...HEAD, "1,2": "is-out", "2,2": "is-out", "3,2": "is-out", "4,2": "is-out", "5,2": "is-out", "6,2": "is-out" }),
                note: "With <code>hash(key) % N</code>, dropping from 3 nodes to 2 changes the divisor and <b>almost every key moves</b>. Every cache is cold at once, and the stampede onto your database arrives at the worst possible moment.",
            });
            frames.push({
                stage: dataGridHTML(rows(after, "status"), { ...HEAD, "2,1": "is-act", "5,1": "is-act", "2,2": "is-act", "5,2": "is-act" }),
                note: "<b>Consistent hashing.</b> Nodes and keys are placed on the same ring; a key belongs to the next node clockwise. Losing B moves <b>only B's keys</b> \u2014 the other four never notice.",
            });
            frames.push({
                stage: dataGridHTML(rows(after, "status"), { ...HEAD, "1,1": "is-done", "2,1": "is-done", "3,1": "is-done", "4,1": "is-done", "5,1": "is-done", "6,1": "is-done" }),
                note: "<b>Conclusion.</b> Consistent hashing costs you <code>K/N</code> movement instead of <code>K</code>. In practice give each node <b>~150 virtual nodes</b> on the ring, otherwise three real nodes carve the ring into three wildly uneven arcs and one machine takes half your traffic.",
            });
            return frames;
        }

        const W = 720;
        const H = 300;
        const names = ["server 1", "server 2 (slow)", "server 3"];
        const draw = (load, active, caption) => {
            let s = boxHTML(20, 120, 110, 50, "clients", "n-idle", "");
            s += boxHTML(180, 120, 120, 50, "balancer", "n-cmp", "");
            s += arrowHTML(132, 145, 176, 145, "e-act");
            load.forEach((n, i) => {
                const st = active === i ? "n-act" : n > 2 ? "n-out" : n > 0 ? "n-done" : "n-idle";
                s += boxHTML(400, 30 + i * 90, 200, 52, names[i], st, `${n} in flight`);
                s += arrowHTML(302, 145, 396, 56 + i * 90, active === i ? "e-act" : "e-idle");
            });
            if (caption) s += capHTML(400, 292, caption, "start");
            return svgHTML(W, H, s);
        };

        if (option === "least") {
            const steps = [
                { load: [0, 0, 0], pick: null, note: "Same setup, same broken server 2 \u2014 but now the balancer keeps a counter of <b>outstanding requests per server</b> and sends each new request to the smallest one." },
                { load: [1, 0, 0], pick: 0, note: "First request goes to server 1; its counter rises to 1." },
                { load: [1, 1, 0], pick: 1, note: "Server 2 is still tied at 0, so it gets one too. <b>A least-connections balancer cannot avoid a slow server it has never tried.</b>" },
                { load: [1, 1, 1], pick: 2, note: "Server 3 takes the third." },
                { load: [0, 1, 0], pick: null, note: "Servers 1 and 3 finish in 40 ms and their counters drop back to zero. Server 2 is still holding its request \u2014 <b>and that is the signal</b>." },
                { load: [1, 1, 0], pick: 0, note: "Because server 2's counter never came down, it is never the minimum again. Traffic routes around it automatically." },
                { load: [1, 1, 1], pick: 2, note: "The next request goes to server 3, and so on. Slowness is now <em>self-limiting</em> instead of self-amplifying." },
                { load: [2, 1, 2], pick: 0, note: "Under load the healthy pair absorbs almost everything while the sick server holds exactly one request. No health check fired; no human intervened." },
            ];
            steps.forEach((st, i) => {
                frames.push({
                    stage: draw(st.load, st.pick, i === 0 ? "counters start at zero" : `queue: ${st.load.join(" / ")}`),
                    note: i === 0 ? st.note : `<b>Step ${i}.</b> ${st.note}`,
                });
            });
            frames.push({
                stage: draw([2, 1, 2], null, "the slow server is quietly starved"),
                note: "<b>Conclusion.</b> Least-connections (or its cousin, <b>least-request with two random choices</b>) is the best default for internal traffic because in-flight count is a live measure of capacity. Round robin only makes sense when every request costs the same and every server is identical \u2014 which is almost never true.",
            });
            return frames;
        }

        const steps = [
            { load: [0, 0, 0], pick: null, note: "Three servers behind one balancer. Server 2 has a sick disk and answers in 3 s instead of 40 ms \u2014 but it is still up, still passing its health check, still returning 200s." },
            { load: [1, 0, 0], pick: 0, note: "Round robin sends request 1 to server 1. Simple, stateless, fair by count." },
            { load: [1, 1, 0], pick: 1, note: "Request 2 goes to server 2. It will sit there for three seconds." },
            { load: [1, 1, 1], pick: 2, note: "Request 3 to server 3. So far this looks perfect." },
            { load: [1, 2, 1], pick: 1, note: "Requests 1 and 3 have already finished; server 2 is still busy \u2014 and round robin hands it another one anyway. <b>The algorithm counts turns, not work.</b>" },
            { load: [1, 3, 1], pick: 1, note: "And another. Server 2's queue is growing while the healthy servers idle between requests." },
            { load: [1, 5, 1], pick: 1, note: "<b>One third of your users are now queued behind a machine that everybody can see is broken.</b> Your p50 looks fine. Your p99 is on fire." },
        ];
        steps.forEach((st, i) => {
            frames.push({
                stage: draw(st.load, st.pick, i === 0 ? "health checks: all green" : `queue: ${st.load.join(" / ")}`),
                note: i === 0 ? st.note : `<b>Step ${i}.</b> ${st.note}`,
            });
        });
        frames.push({
            stage: draw([1, 5, 1], null, "equal shares, unequal service"),
            note: "<b>Conclusion.</b> Round robin distributes <em>requests</em> equally, which is only what you want if it also distributes <em>work</em> equally. A grey-failing server is the standard counter-example, and it is why production systems use least-connections, EWMA latency, or power-of-two-choices instead.",
        });
        return frames;
    },
};

/* ---- 8. API gateway ---- */

VIZ["api-gateway"] = {
    title: "Six round trips, or one",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "idle"]],
    options: [
        { value: "direct", label: "Client calls each service" },
        { value: "gateway", label: "Client calls a gateway" },
    ],
    build(option = "direct") {
        const W = 900;
        const H = 400;
        if (option === "gateway") {
            const lanes = [
                { x: 110, label: "Mobile app", sub: "one 4G round trip" },
                { x: 340, label: "Gateway / BFF", sub: "in the datacentre" },
                { x: 570, label: "orders + user", sub: "" },
                { x: 800, label: "reviews + stock", sub: "" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "GET /home", note: "<b>One</b> request over the slow, lossy link. The gateway now owns the fan-out, and it is sitting in the same datacentre as the services \u2014 sub-millisecond hops." },
                { from: 1, to: 2, y: 150, text: "auth: verify JWT", note: "Authentication, rate limiting and request logging happen <em>once</em>, at the edge, rather than being re-implemented in five services with five subtly different bugs." },
                { from: 1, to: 2, y: 190, text: "orders + user (parallel)", note: "The gateway fans out <b>in parallel</b>. The client could not do this reliably: mobile runtimes cap concurrent connections and 4G punishes each new TLS handshake." },
                { from: 1, to: 3, y: 230, text: "reviews + stock (parallel)", note: "Four internal calls, all concurrent. Total internal time is the <em>slowest</em> call, not the sum." },
                { from: 3, to: 1, y: 270, text: "reviews timed out \u2014 skip", note: "Reviews is slow, so the gateway drops it and returns the page without that section. <b>Partial responses are a product decision the gateway is well placed to make.</b>" },
                { from: 1, to: 0, y: 310, text: "one JSON page \u00b7 240 ms", note: "The client gets exactly the shape its screen needs \u2014 that tailoring is what makes it a <b>BFF</b> (backend for frontend) rather than a generic proxy." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "Now put a gateway in the datacentre and let it do the fan-out.",
                "<b>Conclusion.</b> A gateway is worth it for <b>edge concerns</b> \u2014 TLS, auth, rate limiting, aggregation, response shaping. The danger is that it becomes a place where business logic accumulates: the moment shipping a feature means editing the gateway <em>and</em> a service, you have rebuilt the ESB everyone spent the 2010s escaping."
            );
        }
        const lanes = [
            { x: 110, label: "Mobile app", sub: "180 ms RTT" },
            { x: 340, label: "orders", sub: "" },
            { x: 570, label: "user + reviews", sub: "" },
            { x: 800, label: "stock + shipping", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "GET /orders (TLS handshake)", note: "One screen needs data from five services. Call one: a DNS lookup, a TCP handshake and a TLS handshake before a single byte of payload moves." },
            { from: 1, to: 0, y: 150, text: "200 OK \u00b7 180 ms", note: "The response is fine. The <b>180 ms round trip</b> is the problem, and it is mostly the mobile network, not your code." },
            { from: 0, to: 2, y: 190, text: "GET /user, GET /reviews", note: "Two more, and the client must now know five hostnames, five auth schemes and five error formats. <b>Your internal topology has leaked into an app you cannot redeploy.</b>" },
            { from: 2, to: 0, y: 230, text: "200, 200", note: "Every one of these is a separate TLS session and a separate chance for the radio to drop." },
            { from: 0, to: 3, y: 270, text: "GET /stock, GET /shipping", note: "The last two. If any single call fails the screen is half-rendered, and the retry logic lives in a mobile binary that takes two weeks to ship." },
            { from: 3, to: 0, y: 310, text: "200, 503", note: "Shipping is down. The client has to decide what a half-loaded page means \u2014 a decision your backend team is far better placed to make." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "A mobile client talking to five services directly. Watch the round trips add up \u2014 and watch what leaks.",
            "<b>Conclusion.</b> Direct calls are fine between servers in the same datacentre. Across a phone network they are expensive and brittle: <b>six round trips, five auth integrations, and your service boundaries baked into an app store binary</b>."
        );
    },
};

/* ---- 9. Service mesh ---- */

VIZ["service-mesh"] = {
    title: "Moving reliability out of your code",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "idle"]],
    build() {
        const W = 920;
        const H = 400;
        const lanes = [
            { x: 120, label: "checkout", sub: "your code" },
            { x: 360, label: "sidecar (out)", sub: "Envoy" },
            { x: 620, label: "sidecar (in)", sub: "Envoy" },
            { x: 860, label: "orders", sub: "your code" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "GET orders.internal/v1/1 \u2014 plain HTTP", note: "Your code makes a plain, unencrypted call to <code>localhost</code>. It contains no retry logic, no TLS setup and no metrics code. <b>iptables rules redirect it into the sidecar</b>, which your process never knew was there." },
            { from: 1, to: 2, y: 150, text: "mTLS, both certs rotated hourly", note: "The sidecar upgrades the hop to <b>mutual TLS</b> using a workload identity certificate it rotates automatically. Encryption in transit and service-to-service authentication arrive without a line of application change." },
            { from: 2, to: 3, y: 190, text: "plain HTTP to the app", note: "The receiving sidecar terminates TLS, checks an authorization policy (&ldquo;may checkout call orders?&rdquo;) and hands a plain request to the app on localhost." },
            { from: 3, to: 2, y: 230, text: "503 \u2014 instance restarting", note: "This instance is mid-restart. Your application code would have to handle this; the sidecar handles it first." },
            { from: 2, to: 1, y: 270, text: "503 propagated", note: "The outbound sidecar sees the 503, and its policy says <code>retryOn: 5xx, attempts: 2</code>." },
            { from: 1, to: 2, y: 310, text: "retry \u2192 a different instance", note: "<b>The retry goes to a healthy instance</b>, chosen by the sidecar's own load balancer with outlier detection already excluding the bad one." },
            { from: 1, to: 0, y: 350, text: "200 OK \u00b7 + trace span", note: "Your code sees one successful call. The mesh emitted latency, error-rate and trace data for both hops \u2014 uniform across every language in the fleet." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "A service mesh puts a proxy next to every process and moves retries, mTLS, load balancing and telemetry into it.",
            "<b>Conclusion.</b> A mesh buys <b>uniform policy across polyglot services</b> with no library upgrades. It charges you two extra hops of latency, a control plane to operate, and a new place to look when something breaks. Below roughly a dozen services a shared client library is usually the better trade."
        );
    },
};

/* ---- 10. Timeouts and deadline propagation ---- */

VIZ["timeout-deadline"] = {
    title: "Whose clock is the caller actually on?",
    legend: [["lg-cmp", "working"], ["lg-act", "useful work"], ["lg-out", "wasted"], ["lg-done", "answered"]],
    options: [
        { value: "none", label: "Every hop times out alone" },
        { value: "deadline", label: "One deadline, propagated" },
    ],
    build(option = "none") {
        const W = 820;
        const ticks = [{ at: 0, label: "0 s" }, { at: 1 / 6, label: "1 s" }, { at: 2 / 6, label: "2 s" },
        { at: 3 / 6, label: "3 s" }, { at: 4 / 6, label: "4 s" }, { at: 5 / 6, label: "5 s" }, { at: 1, label: "6 s" }];
        const t = (sec) => sec / 6;
        const frames = [];

        if (option === "deadline") {
            const draw = (lanes, now) => timelineHTML(W, lanes, ticks, now);
            const base = [
                { label: "client", marks: [{ at: 0, width: t(3), label: "deadline 3 s", state: "n-act" }] },
                { label: "gateway", marks: [] },
                { label: "orders", marks: [] },
                { label: "pricing", marks: [] },
            ];
            frames.push({
                stage: draw(base, t(0)),
                note: "Same 3-second budget \u2014 but this time the client sends it. One header travels with the request: <code>grpc-timeout: 3S</code>, or in HTTP land <code>X-Request-Deadline: &lt;absolute time&gt;</code>.",
            });
            frames.push({
                stage: draw([
                    base[0],
                    { label: "gateway", marks: [{ at: t(0.1), width: t(2.9), label: "remaining 2.9 s", state: "n-cmp" }] },
                    base[2], base[3],
                ], t(0.4)),
                note: "The gateway does not invent its own timeout. It reads the deadline, <b>subtracts the time it has already used</b>, and passes the remainder down. Note it passes an <em>absolute</em> deadline, not a duration \u2014 durations quietly reset at every hop.",
            });
            frames.push({
                stage: draw([
                    base[0],
                    { label: "gateway", marks: [{ at: t(0.1), width: t(2.9), label: "remaining 2.9 s", state: "n-cmp" }] },
                    { label: "orders", marks: [{ at: t(0.2), width: t(2.8), label: "remaining 2.8 s", state: "n-cmp" }] },
                    base[3],
                ], t(1)),
                note: "Orders does the same. Every hop now agrees about <em>when the answer stops being useful</em>, which is the only fact that matters.",
            });
            frames.push({
                stage: draw([
                    base[0],
                    { label: "gateway", marks: [{ at: t(0.1), width: t(2.9), label: "", state: "n-cmp" }] },
                    { label: "orders", marks: [{ at: t(0.2), width: t(2.8), label: "", state: "n-cmp" }] },
                    { label: "pricing", marks: [{ at: t(0.3), width: t(2.6), label: "gives up at 2.9 s", state: "n-out" }] },
                ], t(2.9)),
                note: "Pricing is slow again. At <code>2.9 s</code> it can see it will miss the deadline, so it <b>abandons the work and frees the thread</b> instead of finishing a query nobody will read.",
            });
            frames.push({
                stage: draw([
                    { label: "client", marks: [{ at: 0, width: t(3), label: "fallback rendered", state: "n-done" }] },
                    { label: "gateway", marks: [{ at: t(0.1), width: t(2.85), label: "DEADLINE_EXCEEDED", state: "n-done" }] },
                    { label: "orders", marks: [{ at: t(0.2), width: t(2.75), label: "", state: "n-done" }] },
                    { label: "pricing", marks: [{ at: t(0.3), width: t(2.6), label: "cancelled", state: "n-out" }] },
                ], t(3)),
                note: "<b>Conclusion.</b> The client gets a real error at <code>3.0 s</code> \u2014 in time to show a cached price instead of a spinner \u2014 and, critically, <b>no capacity was spent on work that was already too late</b>. Deadline propagation is the single highest-value thing you can add to an RPC stack.",
            });
            return frames;
        }

        const draw = (lanes, now) => timelineHTML(W, lanes, ticks, now);
        frames.push({
            stage: draw([
                { label: "client", marks: [{ at: 0, width: t(3), label: "timeout 3 s", state: "n-act" }] },
                { label: "gateway", marks: [] },
                { label: "orders", marks: [] },
                { label: "pricing", marks: [] },
            ], t(0)),
            note: "The client will wait <b>3 seconds</b> and then give up. That number came from a product decision about how long a human will stare at a spinner.",
        });
        frames.push({
            stage: draw([
                { label: "client", marks: [{ at: 0, width: t(3), label: "timeout 3 s", state: "n-act" }] },
                { label: "gateway", marks: [{ at: t(0.1), width: t(5.8), label: "its own timeout: 10 s", state: "n-cmp" }] },
                { label: "orders", marks: [] },
                { label: "pricing", marks: [] },
            ], t(0.4)),
            note: "The gateway has its <em>own</em> timeout, set two years ago by someone who wanted to stop seeing errors: <b>10 seconds</b>. It has no idea the caller will be gone in three.",
        });
        frames.push({
            stage: draw([
                { label: "client", marks: [{ at: 0, width: t(3), label: "timeout 3 s", state: "n-act" }] },
                { label: "gateway", marks: [{ at: t(0.1), width: t(5.8), label: "", state: "n-cmp" }] },
                { label: "orders", marks: [{ at: t(0.2), width: t(5.6), label: "timeout 30 s (default)", state: "n-cmp" }] },
                { label: "pricing", marks: [{ at: t(0.3), width: t(5.2), label: "slow query", state: "n-cmp" }] },
            ], t(2)),
            note: "Orders never set a timeout at all, so it inherited the HTTP client default \u2014 <b>30 seconds</b>, or on some stacks, none. Pricing is grinding through a slow query.",
        });
        frames.push({
            stage: draw([
                { label: "client", marks: [{ at: 0, width: t(3), label: "gave up", state: "n-out" }] },
                { label: "gateway", marks: [{ at: t(0.1), width: t(5.8), label: "still waiting", state: "n-out" }] },
                { label: "orders", marks: [{ at: t(0.2), width: t(5.6), label: "still waiting", state: "n-out" }] },
                { label: "pricing", marks: [{ at: t(0.3), width: t(5.2), label: "still querying", state: "n-out" }] },
            ], t(3)),
            note: "At <code>3 s</code> the client disconnects. <b>Nothing downstream notices.</b> Three services keep a thread, a connection and a database cursor busy on behalf of a user who has already refreshed the page.",
        });
        frames.push({
            stage: draw([
                { label: "client", marks: [{ at: 0, width: t(3), label: "gave up", state: "n-out" }] },
                { label: "gateway", marks: [{ at: t(0.1), width: t(5.8), label: "returns to nobody", state: "n-out" }] },
                { label: "orders", marks: [{ at: t(0.2), width: t(5.6), label: "returns to nobody", state: "n-out" }] },
                { label: "pricing", marks: [{ at: t(0.3), width: t(5.2), label: "finished at 5.5 s", state: "n-out" }] },
            ], t(5.9)),
            note: "The answer arrives at <code>5.9 s</code> and is written to a closed socket. <b>Every bar after the 3 s line is capacity burned for nothing</b> \u2014 and it burns hardest exactly when you are overloaded, which is what turns a slowdown into an outage.",
        });
        return frames;
    },
};

/* ---- 11. Retries and backoff ---- */

VIZ["retry-backoff"] = {
    title: "Three retry policies, three very different graphs",
    legend: [["lg-out", "failed attempt"], ["lg-act", "retry"], ["lg-done", "success"], ["lg-cmp", "waiting"]],
    options: [
        { value: "immediate", label: "Retry immediately" },
        { value: "backoff", label: "Exponential backoff" },
        { value: "jitter", label: "Backoff with jitter" },
    ],
    build(option = "immediate") {
        const W = 820;
        const ticks = [{ at: 0, label: "0 s" }, { at: 0.25, label: "2 s" }, { at: 0.5, label: "4 s" },
        { at: 0.75, label: "6 s" }, { at: 1, label: "8 s" }];
        const t = (sec) => sec / 8;
        /* Three clients that all saw the same 503 at t=0. */
        const plans = {
            immediate: [[0, 0.1, 0.2, 0.3, 0.4], [0, 0.1, 0.2, 0.3, 0.4], [0, 0.1, 0.2, 0.3, 0.4]],
            backoff: [[0, 0.5, 1.5, 3.5, 7.5], [0, 0.5, 1.5, 3.5, 7.5], [0, 0.5, 1.5, 3.5, 7.5]],
            jitter: [[0, 0.31, 1.12, 2.84, 5.9], [0, 0.44, 0.81, 4.02, 6.7], [0, 0.18, 1.93, 3.11, 7.2]],
        };
        const copy = {
            immediate: {
                intro: "A dependency has just returned <code>503</code> to three callers at the same instant. Policy: retry straight away, up to four times.",
                steps: [
                    "All three clients fail together. So far, so ordinary.",
                    "All three retry after <code>100 ms</code> \u2014 <b>at the same moment</b>, because they all failed at the same moment.",
                    "Attempt three. The struggling service is now receiving <b>three times its normal load</b> precisely while it is trying to recover.",
                    "Attempt four. Every retry consumes a connection, a thread and a little more of the database's remaining headroom.",
                    "Attempt five, then all three give up. The dependency never got a quiet moment in which to recover.",
                ],
                outro: "<b>Conclusion.</b> Immediate retries turn a blip into an outage. They are a <b>load amplifier pointed directly at the thing that is already failing</b>, and they are still the default in far too many HTTP clients.",
            },
            backoff: {
                intro: "Same failure, but each wait doubles: <code>0.5 s</code>, <code>1 s</code>, <code>2 s</code>, <code>4 s</code>. Watch the spacing.",
                steps: [
                    "The initial failure, again at the same instant for all three.",
                    "First retry after <code>500 ms</code>. The dependency gets half a second of peace.",
                    "Second retry a full second later. <b>Load falls off exponentially</b>, which is exactly the shape a recovering service needs.",
                    "Third retry at <code>3.5 s</code>. By now a restarting process has had time to come back and warm up.",
                    "Fourth and last at <code>7.5 s</code> \u2014 and notice the flaw: <b>all three clients are still perfectly synchronised</b>. Each retry wave is a spike.",
                ],
                outro: "<b>Conclusion.</b> Exponential backoff fixes the <em>volume</em> problem and leaves the <em>synchronisation</em> problem. With three clients the spikes are harmless; with thirty thousand, every wave is a self-inflicted DDoS.",
            },
            jitter: {
                intro: "Same doubling schedule, but each wait is randomised: <code>sleep(random(0, base * 2**attempt))</code>.",
                steps: [
                    "The same simultaneous failure \u2014 this part you cannot change.",
                    "The three retries are already scattered across the first second instead of landing together.",
                    "The spread widens with the backoff window, so the load a recovering service sees is <b>smooth, not spiky</b>.",
                    "Even at the fourth attempt no two clients collide. Ten thousand clients would arrive as a gentle ramp.",
                    "The last attempts trail off across seconds 6\u20138. The dependency recovers and the survivors succeed.",
                ],
                outro: "<b>Conclusion.</b> <b>Full jitter is the production default</b> \u2014 AWS measured it as the best of the common variants. Pair it with three rules: only retry <em>idempotent</em> or key-protected calls, only retry <em>retryable</em> errors (never a 400), and cap total retries with a <b>retry budget</b> so they can never exceed ~10% of traffic.",
            },
        };
        const plan = plans[option] || plans.immediate;
        const c = copy[option] || copy.immediate;
        const frames = [];
        const draw = (upto) =>
            timelineHTML(W, plan.map((atts, i) => ({
                label: `client ${String.fromCharCode(65 + i)}`,
                marks: atts.slice(0, upto).map((sec, k) => ({
                    at: t(sec),
                    label: String(k + 1),
                    state: k === upto - 1 ? (upto === 5 && option === "jitter" ? "n-done" : "n-act") : "n-out",
                })),
            })), ticks);
        frames.push({ stage: draw(0), note: c.intro });
        c.steps.forEach((note, i) => {
            frames.push({ stage: draw(i + 1), note: `<b>Attempt ${i + 1}.</b> ${note}` });
        });
        frames.push({ stage: draw(5), note: c.outro });
        return frames;
    },
};

/* ---- 12. Retry amplification ---- */

VIZ["retry-storm"] = {
    title: "How three retries become twenty-seven",
    legend: [["lg-cmp", "normal load"], ["lg-out", "amplified"], ["lg-done", "with a budget"]],
    build() {
        const W = 760;
        const H = 300;
        const tiers = ["edge", "gateway", "orders", "database"];
        const draw = (load, states, caption) => {
            const max = Math.max(...load, 1);
            let s = "";
            load.forEach((n, i) => {
                const w = Math.max(60, Math.round((n / max) * 520));
                s += capHTML(96, 66 + i * 62, tiers[i], "end");
                s += boxHTML(110, 46 + i * 62, w, 40, `${n} rps`, states[i], "");
                if (i < load.length - 1) s += arrowHTML(130, 88 + i * 62, 130, 104 + i * 62, "e-idle");
            });
            if (caption) s += capHTML(110, 292, caption, "start");
            return svgHTML(W, H, s);
        };
        const idle = ["n-idle", "n-idle", "n-idle", "n-idle"];
        const frames = [];
        frames.push({
            stage: draw([100, 100, 100, 100], ["n-cmp", "n-cmp", "n-cmp", "n-cmp"], "steady state"),
            note: "Four tiers, each calling the next. <code>100 rps</code> enters at the edge and <code>100 rps</code> reaches the database. Every tier is configured to retry <b>up to 3 times</b> \u2014 a setting nobody has thought about since it was copied from a tutorial.",
        });
        frames.push({
            stage: draw([100, 100, 100, 100], ["n-cmp", "n-cmp", "n-cmp", "n-out"], "the database slows down"),
            note: "The database hits a lock contention problem and starts timing out. Nothing has crashed \u2014 it is merely <b>slow</b>, which is the dangerous kind of broken.",
        });
        frames.push({
            stage: draw([100, 100, 300, 300], ["n-cmp", "n-cmp", "n-out", "n-out"], "orders retries \u00d73"),
            note: "Orders retries each failed call three times. The database now receives <code>300 rps</code> while it is already struggling. <b>Load went up because the system got slower</b> \u2014 that is the wrong direction.",
        });
        frames.push({
            stage: draw([100, 300, 900, 900], ["n-cmp", "n-out", "n-out", "n-out"], "the gateway retries the retries"),
            note: "Orders is now failing too, so the gateway retries <em>it</em>. Each of those retries triggers three more from orders: <code>900 rps</code>.",
        });
        frames.push({
            stage: draw([100, 900, 2700, 2700], ["n-out", "n-out", "n-out", "n-out"], "27\u00d7 amplification"),
            note: "Add the edge's retries and it is <code>3\u00d73\u00d73 = 27\u00d7</code>. <b>The users are still only sending 100 rps.</b> Your own infrastructure is now generating 96% of its own traffic, and no amount of database tuning will dig it out.",
        });
        frames.push({
            stage: draw([100, 110, 110, 110], ["n-done", "n-done", "n-done", "n-done"], "retries only at one layer, under a budget"),
            note: "<b>Conclusion.</b> Retries compose <em>multiplicatively</em>, so pick <b>one layer</b> to retry at \u2014 usually the one closest to the user that still understands the request \u2014 and cap it with a <b>retry budget</b> (retries \u2264 10% of requests) plus a circuit breaker. Every other layer fails fast and reports upward.",
        });
        return frames;
    },
};

/* ---- 13. Idempotency keys ---- */

VIZ["idempotency-key"] = {
    title: "Making the duplicate harmless",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "lost"]],
    build() {
        const W = 880;
        const H = 400;
        const lanes = [
            { x: 130, label: "Client", sub: "retries on timeout" },
            { x: 440, label: "Payments API", sub: "" },
            { x: 750, label: "Keys + ledger", sub: "one transaction" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "POST /charge  Idempotency-Key: 7f3a", note: "The client generates a <b>UUID per business intent</b> \u2014 one key for &ldquo;pay for cart 88&rdquo;. The key is created <em>before</em> the first attempt and reused for every retry, which is the whole trick." },
            { from: 1, to: 2, y: 150, text: "INSERT key 7f3a \u2014 wins the race", note: "The server inserts the key into a table with a <b>unique constraint</b>, in the same transaction as the charge. Uniqueness is enforced by the database, not by an <code>if not exists</code> check that two threads can both pass." },
            { from: 2, to: 1, y: 190, text: "charge written, response stored", note: "The charge and the stored response commit together. <b>Storing the response matters</b>: a retry has to get the original answer back, not just &ldquo;already done&rdquo;." },
            { from: 1, to: 0, y: 230, text: "200 OK \u2014 dropped", after: "e-idle", note: "The reply is lost in the network, exactly as before. The client is back in the dark." },
            { from: 0, to: 1, y: 270, text: "retry, same key 7f3a", note: "The client retries with the <b>same</b> key. This is the part clients get wrong: generating a fresh UUID per attempt makes the whole mechanism decorative." },
            { from: 1, to: 2, y: 310, text: "key exists \u2192 return stored response", note: "The insert hits the unique constraint. Instead of erroring, the server looks up the stored response and replays it \u2014 <b>no second charge</b>." },
            { from: 1, to: 0, y: 350, text: "200 OK \u00b7 same charge id", note: "The client receives the identical charge id it would have received the first time. It cannot tell, and does not need to, that this was a replay." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "Same lost response as before \u2014 but now the request carries a key. Press <b>Play</b>.",
            "<b>Conclusion.</b> Some operations are naturally idempotent (<code>PUT status=shipped</code>, <code>DELETE</code>); the ones that are not (<code>charge</code>, <code>send</code>, <code>append</code>) need an explicit key. Three rules: the <b>client</b> mints the key, the <b>database</b> enforces uniqueness in the same transaction as the effect, and the <b>response</b> is stored so retries are indistinguishable from the original."
        );
    },
};

/* ---- 14. Circuit breaker ---- */

VIZ["circuit-breaker"] = {
    title: "Failing fast on purpose",
    legend: [["lg-done", "closed \u2014 calls pass"], ["lg-out", "open \u2014 calls rejected"], ["lg-act", "half-open \u2014 probing"], ["lg-idle", "inactive"]],
    build() {
        const W = 760;
        const H = 320;
        const draw = (states, stats, caption) => {
            let s = "";
            s += boxHTML(60, 40, 180, 56, "CLOSED", states.closed, "calls pass through");
            s += boxHTML(520, 40, 180, 56, "OPEN", states.open, "reject instantly");
            s += boxHTML(290, 200, 180, 56, "HALF-OPEN", states.half, "one trial call");
            s += arrowHTML(240, 60, 518, 60, states.t1 || "e-idle", "failure rate > 50%");
            s += arrowHTML(608, 100, 470, 208, states.t2 || "e-idle", "after 30 s");
            s += arrowHTML(290, 226, 150, 100, states.t3 || "e-idle", "trial succeeds");
            s += capHTML(560, 250, "trial fails \u2192 open again", "middle");
            s += arrowHTML(470, 236, 600, 236, states.t4 || "e-idle");
            s += capHTML(30, 300, stats, "start");
            if (caption) s += capHTML(730, 300, caption, "end");
            return svgHTML(W, H, s);
        };
        const off = { closed: "n-idle", open: "n-idle", half: "n-idle" };
        const frames = [];
        frames.push({
            stage: draw({ ...off, closed: "n-done" }, "last 20 calls: 20 ok, 0 failed \u00b7 p99 40 ms"),
            note: "<b>CLOSED</b> is the normal state: calls go through and the breaker only counts outcomes in a rolling window. A breaker is a <em>counter with opinions</em>, nothing more.",
        });
        frames.push({
            stage: draw({ ...off, closed: "n-done" }, "last 20 calls: 14 ok, 6 timed out \u00b7 p99 3.0 s"),
            note: "The dependency starts timing out. Note that <b>timeouts are the expensive failure</b> \u2014 each one holds a thread for the full timeout duration, so 6 failures cost more capacity than 600 fast 500s.",
        });
        frames.push({
            stage: draw({ ...off, closed: "n-out", open: "n-act", t1: "e-act" }, "11 of 20 failed \u2192 threshold crossed"),
            note: "Failure rate passes the threshold (say 50% over a 20-call minimum) and the breaker <b>trips</b>. The minimum call count matters: without it, one failure out of one call opens the breaker at 3 a.m. on a quiet endpoint.",
        });
        frames.push({
            stage: draw({ ...off, open: "n-out" }, "rejecting in 0.1 ms \u00b7 fallback served"),
            note: "<b>OPEN</b>: calls are rejected <em>immediately</em>, without touching the network. This is the point \u2014 your threads stay free, your own callers get a fast answer, and the sick dependency gets zero traffic and a chance to recover.",
        });
        frames.push({
            stage: draw({ ...off, open: "n-out" }, "serving cached prices \u00b7 30 s cool-down"),
            note: "Fast failure is only useful if you have something to say. <b>Pair every breaker with a fallback</b>: a cached value, a degraded feature, a queued write, or a clear error \u2014 and make sure the fallback does not call the same broken thing.",
        });
        frames.push({
            stage: draw({ ...off, open: "n-cmp", half: "n-act", t2: "e-act" }, "cool-down elapsed \u2192 let one call through"),
            note: "<b>HALF-OPEN</b>: after the cool-down the breaker allows a <em>single</em> trial call. Everything else is still rejected, so a dependency that is still down is probed by one request, not by the whole fleet at once.",
        });
        frames.push({
            stage: draw({ ...off, half: "n-out", open: "n-act", t4: "e-act" }, "trial failed \u2192 open again, wait 60 s"),
            note: "The trial fails, so it is back to OPEN \u2014 ideally with the cool-down doubled. A breaker that flaps between states is worse than no breaker: it produces exactly the synchronised traffic wave it was meant to prevent.",
        });
        frames.push({
            stage: draw({ ...off, half: "n-cmp", closed: "n-done", t3: "e-act" }, "trial succeeded \u2192 CLOSED"),
            note: "<b>Conclusion.</b> The three states exist to answer one question cheaply: <em>is it worth trying?</em> Get the four numbers right \u2014 failure threshold, minimum calls, cool-down, and half-open concurrency \u2014 and scope the breaker <b>per dependency</b>, never globally, or one sick service will cut you off from a healthy one.",
        });
        return frames;
    },
};

/* ---- 15. Bulkheads ---- */

VIZ["bulkhead"] = {
    title: "Stopping one dependency from sinking the ship",
    legend: [["lg-cmp", "serving reviews"], ["lg-out", "stuck on recommendations"], ["lg-done", "free"], ["lg-idle", "reserved"]],
    options: [
        { value: "shared", label: "One shared thread pool" },
        { value: "isolated", label: "A pool per dependency" },
    ],
    build(option = "shared") {
        const frames = [];
        const slots = (labels, marks, tags) => cellsHTML(labels, marks, tags);

        if (option === "isolated") {
            const base = ["rec", "rec", "rec", "rev", "rev", "rev", "rev", "chk", "chk", "chk"];
            frames.push({
                stage: slots(base, {}, { 0: "recs", 3: "reviews", 7: "checkout" }),
                note: "The same ten workers, but now <b>partitioned</b>: three may ever call recommendations, four reviews, three checkout. A caller that wants a busy pool is refused rather than queued.",
            });
            frames.push({
                stage: slots(base, { 0: "is-out", 1: "is-out", 2: "is-out" }, { 0: "recs \u2014 full", 3: "reviews", 7: "checkout" }),
                note: "Recommendations hangs again and immediately fills its three slots. <b>Slot four is not available to it at any price.</b> That is the entire idea: the blast radius was decided in advance, in configuration.",
            });
            frames.push({
                stage: slots(base, { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-done", 4: "is-done", 7: "is-done" }, { 0: "recs \u2014 full", 3: "reviews", 7: "checkout" }),
                note: "Reviews and checkout carry on at full speed in their own slots. The recommendations carousel is missing from the page; <b>the buy button still works</b>.",
            });
            frames.push({
                stage: slots(base, { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-done", 4: "is-done", 5: "is-done", 6: "is-done", 7: "is-done", 8: "is-done", 9: "is-done" }, { 0: "recs \u2014 shed", 3: "reviews", 7: "checkout" }),
                note: "New recommendation calls are <b>rejected in microseconds</b> rather than queued. Rejecting early is what keeps the queue from becoming the outage \u2014 and it gives your fallback something to react to.",
            });
            frames.push({
                stage: slots(base, { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-done", 5: "is-done", 6: "is-done", 7: "is-done", 8: "is-done", 9: "is-done" }, { 0: "recs", 3: "reviews", 7: "checkout" }),
                note: "<b>Conclusion.</b> A bulkhead is a ship's watertight compartment: flooding is survivable if it is contained. Partition by <b>dependency</b>, and separately by <b>tenant</b> and by <b>criticality</b> \u2014 the cost is some idle capacity, which is exactly what you are buying.",
            });
            return frames;
        }

        const base = ["\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7"];
        const mark = (n, cls, from = 0) => {
            const m = {};
            for (let i = from; i < from + n; i += 1) m[i] = cls;
            return m;
        };
        frames.push({
            stage: slots(base, {}, { 0: "shared pool: 10 workers" }),
            note: "One product page calls three dependencies: recommendations, reviews and checkout. All three borrow from the <b>same pool of ten worker threads</b> \u2014 the default in nearly every framework.",
        });
        frames.push({
            stage: slots(["rec", "rev", "chk", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7"], { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp" }, { 0: "in use" }),
            note: "Normal traffic uses three workers at a time. Everything returns in tens of milliseconds, so the pool never feels tight and nobody ever looks at this number.",
        });
        frames.push({
            stage: slots(["rec", "rec", "rec", "rev", "chk", "\u00b7", "\u00b7", "\u00b7", "\u00b7", "\u00b7"], { ...mark(3, "is-out"), 3: "is-cmp", 4: "is-cmp" }, { 0: "recommendations hanging" }),
            note: "The recommendations service stops responding. Because its calls have a <b>30-second timeout</b>, each request pins a worker for thirty seconds instead of forty milliseconds.",
        });
        frames.push({
            stage: slots(["rec", "rec", "rec", "rec", "rec", "rec", "rec", "rev", "chk", "\u00b7"], { ...mark(7, "is-out"), 7: "is-cmp", 8: "is-cmp" }, { 0: "7 of 10 stuck" }),
            note: "Requests keep arriving at the same rate \u2014 <b>and by Little's law, workers needed = arrival rate \u00d7 service time</b>. Service time just went up 750\u00d7.",
        });
        frames.push({
            stage: slots(["rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec"], mark(10, "is-out"), { 0: "pool exhausted" }),
            note: "<b>All ten workers are stuck on recommendations.</b> Checkout requests now queue behind them and time out. A carousel nobody scrolls to has taken down the buy button.",
        });
        frames.push({
            stage: slots(["rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec", "rec"], mark(10, "is-out"), { 0: "health check also queued \u2192 killed" }),
            note: "The final indignity: the health-check endpoint needs a worker too. It times out, the orchestrator declares the process unhealthy and restarts it \u2014 <b>spreading the load to the remaining replicas, which now fail the same way</b>.",
        });
        return frames;
    },
};

/* ---- 16. Rate limiting ---- */

VIZ["rate-limit"] = {
    title: "A token bucket, tick by tick",
    legend: [["lg-done", "token available"], ["lg-act", "spent"], ["lg-out", "rejected"], ["lg-idle", "empty"]],
    build() {
        const cap = 8;
        const cells = (n, note, extra = {}) => {
            const arr = [];
            const marks = {};
            for (let i = 0; i < cap; i += 1) {
                arr.push(i < n ? "\u25cf" : "\u25cb");
                marks[i] = i < n ? "is-done" : "is-dim";
            }
            Object.assign(marks, extra);
            return cellsHTML(arr, marks, { 0: note });
        };
        const frames = [];
        frames.push({
            stage: cells(8, "bucket: 8 / 8 \u00b7 refill 2 per second"),
            note: "A <b>token bucket</b> has two numbers: <em>capacity</em> (8, the burst you tolerate) and <em>refill rate</em> (2 per second, the sustained rate you actually allow). It starts full.",
        });
        frames.push({
            stage: cells(6, "burst of 2 \u2014 allowed", { 6: "is-act", 7: "is-act" }),
            note: "Two requests arrive together. Each takes a token and is allowed. <b>The bucket is what lets a well-behaved client burst</b> \u2014 a plain &ldquo;2 per second&rdquo; limiter would have rejected the second one.",
        });
        frames.push({
            stage: cells(2, "a script arrives \u00b7 4 more spent", { 2: "is-act", 3: "is-act", 4: "is-act", 5: "is-act" }),
            note: "A client loops. Four more tokens go instantly. Notice nothing has been rejected yet \u2014 the bucket is <em>absorbing</em> a burst, which is usually what you want from a paying customer.",
        });
        frames.push({
            stage: cells(0, "bucket empty"),
            note: "The last two tokens go. The bucket is empty, and the client has had 8 requests in well under a second.",
        });
        frames.push({
            stage: cells(0, "request rejected \u2192 429", { 0: "is-out" }),
            note: "The next request finds no token and gets <code>429 Too Many Requests</code>. <b>Always send <code>Retry-After</code> and <code>RateLimit-Remaining</code></b> \u2014 a limiter that does not say when to come back just converts one bad client into a retry storm.",
        });
        frames.push({
            stage: cells(2, "+2 tokens after 1 second", { 0: "is-act", 1: "is-act" }),
            note: "One second passes and two tokens refill. From here the client is metered at exactly the sustained rate, no matter how fast it loops.",
        });
        frames.push({
            stage: cells(4, "steady state: 2 per second"),
            note: "<b>Conclusion.</b> Token bucket allows bursts, leaky bucket smooths them to a constant rate, and a sliding window counts exactly. Whichever you pick, the hard part is <b>where the counter lives</b>: per-instance limits drift as you scale, so shared counters live in Redis \u2014 and then you must decide what happens when Redis is unreachable.",
        });
        return frames;
    },
};

/* ---- 17. Queues and competing consumers ---- */

VIZ["queue-consumers"] = {
    title: "A queue is a shock absorber",
    legend: [["lg-cmp", "queued"], ["lg-act", "being processed"], ["lg-done", "acked"], ["lg-out", "redelivered"]],
    build() {
        const W = 700;
        const H = 150;
        const workers = (states, caption) => {
            let s = "";
            states.forEach((st, i) => {
                s += boxHTML(40 + i * 220, 30, 180, 48, `consumer ${i + 1}`, st.state, st.sub);
            });
            if (caption) s += capHTML(40, 120, caption, "start");
            return svgHTML(W, H, s);
        };
        const q = (n, marks = {}, tag) => {
            const arr = [];
            for (let i = 0; i < n; i += 1) arr.push(`m${i + 1}`);
            return cellsHTML(arr, marks, tag ? { 0: tag } : {});
        };
        const frames = [];
        frames.push({
            stage: q(4, { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp" }, "queue depth 4") +
                workers([{ state: "n-idle", sub: "idle" }, { state: "n-idle", sub: "idle" }, { state: "n-idle", sub: "idle" }]),
            note: "A <b>point-to-point queue</b>: many producers write in, many consumers read out, and <em>each message goes to exactly one consumer</em>. That last clause is what makes it a work queue rather than a broadcast.",
        });
        frames.push({
            stage: q(4, { 0: "is-act", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp" }, "m1 leased to consumer 1") +
                workers([{ state: "n-act", sub: "m1 \u00b7 lease 30 s" }, { state: "n-idle", sub: "idle" }, { state: "n-idle", sub: "idle" }]),
            note: "Consumer 1 <b>leases</b> m1 \u2014 it is not deleted, just made invisible to others for 30 seconds (SQS calls this the visibility timeout; AMQP calls it an unacked delivery). <b>If the consumer dies, the lease expires and the message comes back.</b>",
        });
        frames.push({
            stage: q(4, { 0: "is-act", 1: "is-act", 2: "is-act", 3: "is-cmp" }, "three in flight") +
                workers([{ state: "n-act", sub: "m1" }, { state: "n-act", sub: "m2" }, { state: "n-act", sub: "m3" }]),
            note: "The other two consumers take m2 and m3. This is the <b>competing consumers</b> pattern: to go faster you add consumers, and nothing else changes. Throughput scales horizontally with no coordination.",
        });
        frames.push({
            stage: q(4, { 0: "is-done", 1: "is-out", 2: "is-act", 3: "is-cmp" }, "consumer 2 crashed") +
                workers([{ state: "n-done", sub: "acked m1" }, { state: "n-out", sub: "crashed" }, { state: "n-act", sub: "m3" }]),
            note: "Consumer 1 acks m1, which finally deletes it. Consumer 2 crashes mid-work \u2014 no ack \u2014 so after the lease expires <b>m2 becomes visible again</b> and someone else picks it up. This is why the delivery guarantee is <em>at least once</em>.",
        });
        frames.push({
            stage: q(4, { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-act" }, "m2 redelivered and completed") +
                workers([{ state: "n-act", sub: "m4" }, { state: "n-idle", sub: "restarted" }, { state: "n-done", sub: "acked m3" }]),
            note: "The backlog drains. Note what the queue absorbed: a crash, a restart, and a redelivery \u2014 <b>without the producer knowing any of it happened</b>.",
        });
        frames.push({
            stage: q(9, { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp", 4: "is-cmp", 5: "is-cmp", 6: "is-cmp", 7: "is-cmp", 8: "is-cmp" }, "flash sale: depth 9 and rising") +
                workers([{ state: "n-act", sub: "steady" }, { state: "n-act", sub: "steady" }, { state: "n-act", sub: "steady" }]),
            note: "A flash sale arrives. Producers are writing far faster than consumers drain \u2014 and the queue simply <b>gets deeper</b>. Nothing errors, nothing retries, nothing falls over; latency rises and that is all.",
        });
        frames.push({
            stage: q(3, { 0: "is-done", 1: "is-done", 2: "is-act" }, "drained after the spike") +
                workers([{ state: "n-done", sub: "" }, { state: "n-done", sub: "" }, { state: "n-act", sub: "" }]),
            note: "<b>Conclusion.</b> A queue converts a <em>capacity</em> problem into a <em>latency</em> problem, which is a far better problem. The two numbers to alarm on are <b>queue depth</b> (is it growing without bound?) and <b>oldest message age</b> (are we already late?) \u2014 depth alone will not tell you a consumer is stuck.",
        });
        return frames;
    },
};

/* ---- 18. Publish/subscribe ---- */

VIZ["pubsub-fanout"] = {
    title: "One event, three independent readers",
    legend: [["lg-act", "delivering"], ["lg-done", "processed"], ["lg-out", "failing"], ["lg-idle", "waiting"]],
    build() {
        const W = 800;
        const H = 320;
        const subs = ["billing", "analytics", "email"];
        const draw = (states, topicState, caption) => {
            let s = boxHTML(30, 130, 150, 54, "orders svc", "n-cmp", "publisher");
            s += boxHTML(240, 130, 160, 54, "OrderPlaced", topicState || "n-idle", "topic");
            s += arrowHTML(182, 157, 236, 157, "e-act");
            states.forEach((st, i) => {
                s += boxHTML(560, 30 + i * 96, 200, 50, subs[i], st.state, st.sub);
                s += arrowHTML(402, 157, 556, 55 + i * 96, st.edge || "e-idle");
            });
            if (caption) s += capHTML(560, 312, caption, "middle");
            return svgHTML(W, H, s);
        };
        const frames = [];
        frames.push({
            stage: draw([{ state: "n-idle", sub: "" }, { state: "n-idle", sub: "" }, { state: "n-idle", sub: "" }]),
            note: "A <b>topic</b>, not a queue. The orders service publishes one <code>OrderPlaced</code> event and does not know \u2014 or care \u2014 who is listening. That ignorance is the entire value of the pattern.",
        });
        frames.push({
            stage: draw([{ state: "n-act", sub: "own copy", edge: "e-act" }, { state: "n-act", sub: "own copy", edge: "e-act" }, { state: "n-act", sub: "own copy", edge: "e-act" }], "n-act", "each subscription gets its own copy"),
            note: "The broker delivers <b>a copy to every subscription</b>. Compare with a queue, where the three consumers would have split the messages between them. Same infrastructure, opposite semantics \u2014 get this wrong and two thirds of your orders never get billed.",
        });
        frames.push({
            stage: draw([{ state: "n-done", sub: "charged", edge: "e-done" }, { state: "n-done", sub: "row written", edge: "e-done" }, { state: "n-out", sub: "SMTP down", edge: "e-act" }], "n-cmp", "email is retrying, alone"),
            note: "Email's SMTP provider is down. It retries on <b>its own subscription cursor</b>, and billing and analytics are entirely unaffected. Independent failure is what you paid for.",
        });
        frames.push({
            stage: draw([{ state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "caught up", edge: "e-done" }], "n-cmp", "email drains its backlog"),
            note: "Email recovers and works through its backlog while the others are already up to date. <b>Each subscription has its own lag</b> \u2014 which is why &ldquo;how far behind is this consumer?&rdquo; is a per-subscription metric, and the one that pages you.",
        });
        frames.push({
            stage: draw([{ state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "", edge: "e-done" },
            { state: "n-act", sub: "added today", edge: "e-act" }].slice(0, 3), "n-cmp", "a fourth subscriber joins \u2014 no publisher change"),
            note: "Fraud detection wants these events too. It creates a subscription. <b>The orders service is not redeployed, not restarted, not even informed.</b>",
        });
        frames.push({
            stage: draw([{ state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "", edge: "e-done" }, { state: "n-done", sub: "", edge: "e-done" }], "n-done", "publisher decoupled from N consumers"),
            note: "<b>Conclusion.</b> Pub/sub decouples <em>who</em> as well as <em>when</em>, which makes adding capability cheap. The bill arrives later: with no request/response you cannot see the system by reading one service's code, so <b>the event schema becomes your most important contract</b> and tracing becomes mandatory.",
        });
        return frames;
    },
};

/* ---- 19. The log: partitions, offsets, consumer groups ---- */

VIZ["log-stream"] = {
    title: "Why a log is not a queue",
    legend: [["lg-done", "committed"], ["lg-act", "current offset"], ["lg-cmp", "assigned"], ["lg-out", "rebalanced"]],
    build() {
        const frames = [];
        const log = (marks, tags) => cellsHTML(["o0", "o1", "o2", "o3", "o4", "o5", "o6", "o7"], marks, tags);
        const done = (n) => {
            const m = {};
            for (let i = 0; i < n; i += 1) m[i] = "is-done";
            return m;
        };
        frames.push({
            stage: log(done(8), { 0: "partition 0 \u2014 append-only" }),
            note: "A partition is an <b>append-only file</b> with a monotonically increasing offset. Records are not deleted when they are read \u2014 they age out on a retention policy (7 days, or forever). Everything else follows from that one design choice.",
        });
        frames.push({
            stage: log({ ...done(8), 3: "is-act" }, { 0: "billing group \u00b7 committed offset 3" }),
            note: "A consumer group stores <b>one number per partition</b>: the offset it has committed. There is no per-message state in the broker at all, which is why a log scales to millions of messages a second while a queue does not.",
        });
        frames.push({
            stage: log({ ...done(8), 3: "is-cmp", 6: "is-act" }, { 0: "billing at 6" }) +
                log({ ...done(8), 1: "is-act" }, { 0: "analytics at 1 \u00b7 same data" }),
            note: "A second group reads the <b>same records</b> at its own pace, with its own offset. Analytics being five records behind has no effect on billing whatsoever \u2014 fan-out is free because nothing is copied.",
        });
        frames.push({
            stage: log({ ...done(8), 6: "is-act" }, { 0: "billing at 6" }) +
                log({ ...done(8), 1: "is-out" }, { 0: "analytics rewound to 1" }),
            note: "<b>Replay.</b> Analytics had a bug, so you reset its offset to 1 and it reprocesses three days of history. No producer is involved, and no other consumer notices. <em>This is the capability queues cannot give you</em>, and it is the usual reason to choose a log.",
        });
        frames.push({
            stage: log({ 0: "is-done", 1: "is-done", 2: "is-act", 3: "is-cmp", 4: "is-cmp" }, { 0: "P0 \u2192 consumer A" }) +
                log({ 0: "is-done", 1: "is-act", 2: "is-cmp" }, { 0: "P1 \u2192 consumer B" }) +
                log({ 0: "is-act", 1: "is-cmp" }, { 0: "P2 \u2192 consumer C" }),
            note: "Parallelism comes from <b>partitions</b>. Three partitions, three consumers, one each. Each partition is consumed strictly in order by exactly one member of the group.",
        });
        frames.push({
            stage: log({ 0: "is-done", 1: "is-done", 2: "is-act" }, { 0: "P0 \u2192 consumer A" }) +
                log({ 0: "is-done", 1: "is-act" }, { 0: "P1 \u2192 consumer B" }) +
                log({ 0: "is-cmp", 1: "is-cmp" }, { 0: "P2 \u2192 idle consumer D" }),
            note: "<b>Add a fourth consumer and it does nothing.</b> With three partitions the maximum useful parallelism is three. Partition count is a capacity decision you make up front and can only increase \u2014 and increasing it changes which key lands where.",
        });
        frames.push({
            stage: log({ 0: "is-done", 1: "is-done", 2: "is-act" }, { 0: "P0 \u2192 A" }) +
                log({ 0: "is-done", 1: "is-out" }, { 0: "P1 \u2192 reassigned to D" }) +
                log({ 0: "is-act", 1: "is-cmp" }, { 0: "P2 \u2192 C" }),
            note: "Consumer B dies. The group <b>rebalances</b> and D takes P1 from B's last committed offset \u2014 so anything B processed but did not commit is <b>processed again</b>. Rebalances are the number one source of duplicates in log-based systems.",
        });
        frames.push({
            stage: log(done(8), { 0: "steady state" }),
            note: "<b>Conclusion.</b> A log gives you <b>replay, multiple independent readers, and ordering within a partition</b>, in exchange for parallelism capped by partition count and duplicates around rebalances. Choose a queue when work is disposable once done; choose a log when the history itself is the product.",
        });
        return frames;
    },
};

/* ---- 20. Delivery semantics ---- */

VIZ["delivery-semantics"] = {
    title: "Ack before or ack after \u2014 that is the whole choice",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "lost"]],
    options: [
        { value: "most", label: "At most once" },
        { value: "least", label: "At least once" },
        { value: "effectively", label: "Effectively once" },
    ],
    build(option = "most") {
        const W = 860;
        const H = 340;
        const lanes = [
            { x: 140, label: "Broker", sub: "" },
            { x: 450, label: "Consumer", sub: "" },
            { x: 760, label: "Database", sub: "" },
        ];
        const scripts = {
            most: {
                intro: "<b>At most once</b>: acknowledge the message <em>before</em> doing the work.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "deliver ChargeCard", note: "The broker hands over the message." },
                    { from: 1, to: 0, y: 165, text: "ack (immediately)", note: "The consumer acks <b>first</b>. The broker deletes the message and forgets it ever existed. There is now exactly one copy of this work in the world, and it is in a process's memory." },
                    { from: 1, to: 2, y: 210, text: "process \u2026 crash", after: "e-idle", note: "The process is OOM-killed mid-work. Nothing was written, and <b>nothing will retry, because nothing knows</b>." },
                    { from: 0, to: 1, y: 255, text: "nothing to redeliver", after: "e-idle", note: "The message is gone. Zero deliveries. <b>Silent data loss</b> \u2014 no error, no alert, no log line saying a charge vanished." },
                ],
                outro: "<b>Conclusion.</b> At-most-once is correct only where a lost item is genuinely cheaper than a duplicate one \u2014 a metrics sample, a presence ping, a video frame. It is never correct for money, and it is the accidental default whenever someone enables auto-ack for throughput.",
            },
            least: {
                intro: "<b>At least once</b>: do the work first, acknowledge afterwards. This is what essentially every broker does by default.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "deliver ChargeCard", note: "Delivered, but the broker keeps a copy and starts a visibility timer." },
                    { from: 1, to: 2, y: 165, text: "INSERT charge \u2014 committed", note: "The work is done and committed. The money has moved." },
                    { from: 1, to: 0, y: 210, text: "ack \u2014 lost / process killed", after: "e-idle", note: "The process dies before the ack lands. From the broker's point of view this is indistinguishable from a consumer that never did the work." },
                    { from: 0, to: 1, y: 255, text: "lease expires \u2192 redeliver", note: "The visibility timeout expires and the message is <b>redelivered</b>. Nothing is lost \u2014 that is the guarantee." },
                    { from: 1, to: 2, y: 300, text: "INSERT charge \u2014 again", note: "And the card is charged twice. <b>At-least-once does not mean at-least-once-and-not-more</b>; duplicates are normal operation, not an incident." },
                ],
                outro: "<b>Conclusion.</b> At-least-once is the right default: losing data is usually worse than repeating work. It is only safe if <b>your handler is idempotent</b> \u2014 which means the guarantee you actually ship is a property of your code, not of your broker.",
            },
            effectively: {
                intro: "<b>Effectively once</b>: at-least-once delivery plus deduplication at the point of effect.",
                steps: [
                    { from: 0, to: 1, y: 120, text: "deliver ChargeCard (msg 9f21)", note: "Same at-least-once delivery. Nothing about the broker has changed \u2014 the fix lives in the consumer." },
                    { from: 1, to: 2, y: 165, text: "BEGIN; insert 9f21; charge; COMMIT", note: "The message id and the effect are written in <b>one transaction</b>. The id column has a unique constraint. Either both happen or neither does." },
                    { from: 1, to: 0, y: 210, text: "ack \u2014 lost again", after: "e-idle", note: "The ack is lost exactly as before. The failure did not go away; only its consequence does." },
                    { from: 0, to: 1, y: 255, text: "redeliver 9f21", note: "The broker redelivers, as it must." },
                    { from: 1, to: 2, y: 300, text: "9f21 exists \u2192 skip, ack", note: "The insert violates the unique constraint, the consumer treats that as &ldquo;already done&rdquo;, and acks. <b>One charge.</b>" },
                ],
                outro: "<b>Conclusion.</b> There is no exactly-once <em>delivery</em> \u2014 that is provably impossible over an unreliable network. There is exactly-once <b>effect</b>, and you build it with a dedupe key committed atomically with the side effect. Kafka transactions do this too, but only for effects inside Kafka; an external API call is still yours to protect.",
            },
        };
        const s = scripts[option] || scripts.most;
        return seqFrames(W, H, lanes, s.steps, s.intro, s.outro);
    },
};

/* ---- 21. Ordering and partition keys ---- */

VIZ["ordering-keys"] = {
    title: "Ordering is per key, or it is nothing",
    legend: [["lg-done", "processed in order"], ["lg-out", "out of order"], ["lg-act", "current"], ["lg-cmp", "queued"]],
    options: [
        { value: "roundrobin", label: "Round-robin partitioning" },
        { value: "keyed", label: "Partition by order id" },
    ],
    build(option = "roundrobin") {
        const frames = [];
        const events = ["A:created", "A:paid", "A:shipped", "B:created", "B:paid"];
        if (option === "keyed") {
            frames.push({
                stage: cellsHTML(events, { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp", 4: "is-cmp" }, { 0: "producer, key = order id" }),
                note: "Same five events, but the producer now sets a <b>partition key</b>: the order id. The broker computes <code>hash(key) % partitions</code> to choose a partition.",
            });
            frames.push({
                stage: cellsHTML(["A:created", "A:paid", "A:shipped"], { 0: "is-act", 1: "is-cmp", 2: "is-cmp" }, { 0: "partition 0 \u2014 all of A" }) +
                    cellsHTML(["B:created", "B:paid"], { 0: "is-act", 1: "is-cmp" }, { 0: "partition 1 \u2014 all of B" }),
                note: "All of order A lands on one partition, in publish order. All of B lands on another. <b>Same key \u2192 same partition \u2192 same consumer \u2192 guaranteed order.</b>",
            });
            frames.push({
                stage: cellsHTML(["A:created", "A:paid", "A:shipped"], { 0: "is-done", 1: "is-act", 2: "is-cmp" }, { 0: "consumer 1" }) +
                    cellsHTML(["B:created", "B:paid"], { 0: "is-done", 1: "is-act" }, { 0: "consumer 2" }),
                note: "The two partitions are processed <b>concurrently</b> \u2014 you keep your parallelism. You only gave up ordering <em>between</em> orders, and no business rule ever cared about that.",
            });
            frames.push({
                stage: cellsHTML(["A:created", "A:paid", "A:shipped"], { 0: "is-done", 1: "is-done", 2: "is-done" }, { 0: "consumer 1 \u00b7 correct" }) +
                    cellsHTML(["B:created", "B:paid"], { 0: "is-done", 1: "is-done" }, { 0: "consumer 2 \u00b7 correct" }),
                note: "Both orders reach the right final state. Parallelism is now bounded by <em>key</em> diversity rather than by message count \u2014 which is fine until one celebrity key gets 40% of the traffic and its partition becomes a <b>hot shard</b>.",
            });
            frames.push({
                stage: cellsHTML(["A:created", "A:paid", "A:shipped", "B:created", "B:paid"], { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-done" }, { 0: "the rule" }),
                note: "<b>Conclusion.</b> Never ask for global ordering \u2014 it means one partition and one consumer, which means no scale. Ask instead: <em>which entity's events must not overtake each other?</em> That entity's id is your partition key. And keep handlers order-insensitive anyway: a version number or a state-machine guard costs little and survives the day someone repartitions the topic.",
            });
            return frames;
        }
        frames.push({
            stage: cellsHTML(events, { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp", 3: "is-cmp", 4: "is-cmp" }, { 0: "producer \u00b7 published in this order" }),
            note: "Five events about two orders, published in a sensible order. The producer uses the default partitioner: spread them round-robin for maximum throughput.",
        });
        frames.push({
            stage: cellsHTML(["A:created", "A:shipped", "B:paid"], { 0: "is-cmp", 1: "is-cmp", 2: "is-cmp" }, { 0: "partition 0" }) +
                cellsHTML(["A:paid", "B:created"], { 0: "is-cmp", 1: "is-cmp" }, { 0: "partition 1" }),
            note: "Round robin scatters A's three events across two partitions. <b>Ordering is guaranteed within a partition and nowhere else</b> \u2014 and A's events are now in two different places.",
        });
        frames.push({
            stage: cellsHTML(["A:created", "A:shipped", "B:paid"], { 0: "is-done", 1: "is-act", 2: "is-cmp" }, { 0: "consumer 1 \u00b7 fast" }) +
                cellsHTML(["A:paid", "B:created"], { 0: "is-cmp", 1: "is-cmp" }, { 0: "consumer 2 \u00b7 slow GC pause" }),
            note: "Consumer 1 races ahead while consumer 2 pauses for garbage collection. Nothing is broken; the two partitions simply progress at different speeds, as they always will.",
        });
        frames.push({
            stage: cellsHTML(["A:created", "A:shipped", "B:paid"], { 0: "is-done", 1: "is-out", 2: "is-cmp" }, { 0: "consumer 1" }) +
                cellsHTML(["A:paid", "B:created"], { 0: "is-cmp", 1: "is-cmp" }, { 0: "consumer 2" }),
            note: "<b><code>A:shipped</code> is processed before <code>A:paid</code>.</b> The shipping service marks an unpaid order as dispatched. Every component behaved correctly and the business outcome is wrong.",
        });
        frames.push({
            stage: cellsHTML(["A:created", "A:shipped", "B:paid"], { 0: "is-done", 1: "is-out", 2: "is-out" }, { 0: "state machine now invalid" }) +
                cellsHTML(["A:paid", "B:created"], { 0: "is-out", 1: "is-out" }, { 0: "arrives too late to help" }),
            note: "<b>Conclusion.</b> The default partitioner optimises throughput and silently discards the only ordering guarantee you had. If any two events must not overtake each other, they must share a partition \u2014 which means they must share a <b>key</b>.",
        });
        return frames;
    },
};

/* ---- 22. Dead letter queues ---- */

VIZ["dlq"] = {
    title: "Where poison messages go",
    legend: [["lg-cmp", "queued"], ["lg-act", "attempt"], ["lg-out", "dead-lettered"], ["lg-done", "succeeded"]],
    build() {
        const W = 720;
        const H = 180;
        const draw = (main, dlq, worker, caption) => {
            let s = boxHTML(30, 30, 190, 50, "orders queue", main, "");
            s += boxHTML(270, 30, 170, 50, "consumer", worker, "");
            s += boxHTML(500, 30, 190, 50, "orders-dlq", dlq, "");
            s += arrowHTML(222, 55, 266, 55, main === "n-idle" ? "e-idle" : "e-act");
            s += arrowHTML(442, 55, 496, 55, dlq === "n-idle" ? "e-idle" : "e-act");
            if (caption) s += capHTML(30, 150, caption, "start");
            return svgHTML(W, H, s);
        };
        const frames = [];
        frames.push({
            stage: draw("n-cmp", "n-idle", "n-idle", "message m7: customerId is null"),
            note: "Message <code>m7</code> has a null <code>customerId</code> \u2014 a bug in a producer that shipped yesterday. The consumer will throw on it. Every time.",
        });
        frames.push({
            stage: draw("n-act", "n-idle", "n-out", "attempt 1 \u2192 NullPointerException, no ack"),
            note: "Attempt one throws. No ack, so the lease expires and the message becomes visible again. So far this is exactly the machinery that saves you from a crashed consumer.",
        });
        frames.push({
            stage: draw("n-act", "n-idle", "n-out", "attempt 2, 3, 4 \u2026 same exception"),
            note: "But this is not a transient failure. <b>No amount of retrying will fix a null field.</b> The message is a <em>poison pill</em>: it will fail forever, and while it is being retried it is burning consumer capacity.",
        });
        frames.push({
            stage: draw("n-out", "n-idle", "n-out", "FIFO queue: everything behind m7 is stuck"),
            note: "Worse: if this is an ordered partition, or a single-consumer queue, <b>every message behind m7 is now stuck behind it</b>. One malformed record has become a total outage for that stream. This is head-of-line blocking.",
        });
        frames.push({
            stage: draw("n-done", "n-out", "n-done", "maxReceiveCount 5 reached \u2192 move to DLQ"),
            note: "The <b>dead letter queue</b> breaks the loop. After <code>maxReceiveCount</code> deliveries the broker moves m7 to a separate queue. Processing resumes immediately for everything behind it.",
        });
        frames.push({
            stage: draw("n-done", "n-out", "n-done", "DLQ depth 1 \u2014 alarm at > 0"),
            note: "A DLQ is a <b>bug report with a payload attached</b>, not a graveyard. Alarm on <code>depth > 0</code>: nothing arrives there that a human should not look at. The single most common failure is a DLQ nobody has read in eight months.",
        });
        frames.push({
            stage: draw("n-done", "n-done", "n-done", "fix deployed \u2192 redrive m7 \u2192 succeeds"),
            note: "<b>Conclusion.</b> Fix the bug, then <b>redrive</b> the DLQ back into the main queue. Three things make this work in practice: keep the <em>original</em> message plus the exception and stack trace, put a one-click redrive in your runbook, and make handlers idempotent so redriving a message that half-succeeded is safe.",
        });
        return frames;
    },
};

/* ---- 23. Backpressure ---- */

VIZ["backpressure"] = {
    title: "What happens when the producer is faster",
    legend: [["lg-cmp", "buffered"], ["lg-act", "being served"], ["lg-out", "too old / shed"], ["lg-done", "healthy"]],
    options: [
        { value: "unbounded", label: "Unbounded buffer" },
        { value: "bounded", label: "Bounded queue, shed early" },
    ],
    build(option = "unbounded") {
        const frames = [];
        const buf = (n, cap, marks, tag) => {
            const arr = [];
            for (let i = 0; i < cap; i += 1) arr.push(i < n ? "\u25a0" : "\u00b7");
            const m = {};
            for (let i = 0; i < cap; i += 1) m[i] = i < n ? "is-cmp" : "is-dim";
            Object.assign(m, marks || {});
            return cellsHTML(arr, m, { 0: tag });
        };
        if (option === "bounded") {
            frames.push({
                stage: buf(2, 12, { 0: "is-act", 1: "is-act" }, "queue 2 / 12 \u00b7 arrivals 100/s \u00b7 service 100/s"),
                note: "Same service, but the queue has a <b>hard limit of 12</b> and the limit was chosen from a latency target: 12 items \u00d7 10 ms each = 120 ms of waiting, which is what the caller's SLO can afford.",
            });
            frames.push({
                stage: buf(8, 12, {}, "queue 8 / 12 \u00b7 arrivals 150/s"),
                note: "Arrivals rise. The buffer absorbs the burst \u2014 that is what buffers are for. Latency is now <code>80 ms</code> and still inside budget.",
            });
            frames.push({
                stage: buf(12, 12, { 11: "is-act" }, "queue 12 / 12 \u00b7 full"),
                note: "The queue hits its limit. The next arrival cannot be buffered, and now the system must make an <b>explicit choice</b> instead of an accidental one.",
            });
            frames.push({
                stage: buf(12, 12, { 11: "is-out" }, "reject with 503 + Retry-After"),
                note: "<b>Shed the load.</b> Reject with <code>503</code> and a <code>Retry-After</code>, in microseconds. One caller gets a fast, honest error \u2014 and can fall back \u2014 while everyone already in the queue is still served inside their SLO.",
            });
            frames.push({
                stage: buf(12, 12, { 0: "is-out", 11: "is-act" }, "drop the oldest instead of the newest"),
                note: "For a stream of live data the better choice is the opposite: <b>drop the oldest</b>. A stale price tick or position update has negative value \u2014 serving it costs capacity <em>and</em> gives a wrong answer.",
            });
            frames.push({
                stage: buf(6, 12, {}, "upstream slowed to 100/s \u00b7 queue draining"),
                note: "If the producer is one you control \u2014 a TCP peer, a reactive stream, a gRPC stream with flow control \u2014 the better move is to <b>stop reading</b>. The pressure propagates up the chain and the producer slows down at the source. That is backpressure proper; shedding is the fallback when you cannot reach the producer.",
            });
            frames.push({
                stage: buf(3, 12, {}, "stable \u00b7 p99 30 ms \u00b7 3% shed"),
                note: "<b>Conclusion.</b> Every queue must be bounded, and the bound must come from a <em>latency</em> target, not from available memory. The three levers are: bound the queue, drop by policy (oldest or newest), and push the pressure upstream whenever the protocol lets you.",
            });
            return frames;
        }
        frames.push({
            stage: buf(2, 12, { 0: "is-act", 1: "is-act" }, "queue 2 \u00b7 arrivals 100/s \u00b7 service 100/s"),
            note: "A consumer processing 100 items a second, receiving 100 a second. Balanced. The queue exists only to smooth out jitter.",
        });
        frames.push({
            stage: buf(6, 12, {}, "arrivals 150/s \u00b7 queue growing"),
            note: "Traffic rises to 150/s. The consumer is still doing 100/s. <b>The difference does not disappear \u2014 it accumulates.</b> There is no rate at which a slow consumer catches up with a fast producer.",
        });
        frames.push({
            stage: buf(12, 12, {}, "queue 12 and climbing \u00b7 latency 120 ms"),
            note: "The buffer is unbounded, so it just keeps growing. Notice nothing has failed: no error, no alert. <b>The only visible symptom is latency</b>, and it is climbing linearly with queue depth.",
        });
        frames.push({
            stage: buf(12, 12, { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-out" }, "oldest items are past their timeout"),
            note: "Now the items at the front are <b>older than the caller's timeout</b>. The consumer is working hard on requests whose clients hung up long ago \u2014 100% utilisation, 0% useful output. This is <b>queue collapse</b>.",
        });
        frames.push({
            stage: buf(12, 12, { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-out", 4: "is-out", 5: "is-out", 6: "is-out", 7: "is-out" }, "GC pressure \u2192 service rate falls to 60/s"),
            note: "The buffer is consuming memory, so garbage collection gets heavier and the service rate <em>falls</em>. <b>The queue is now making the problem worse</b>, which is the feedback loop that turns a slow hour into a dead service.",
        });
        frames.push({
            stage: buf(12, 12, { 0: "is-out", 1: "is-out", 2: "is-out", 3: "is-out", 4: "is-out", 5: "is-out", 6: "is-out", 7: "is-out", 8: "is-out", 9: "is-out", 10: "is-out", 11: "is-out" }, "OOM kill \u00b7 everything in memory is lost"),
            note: "<b>Conclusion.</b> An unbounded queue does not prevent overload \u2014 it <em>hides</em> overload until it converts into an out-of-memory kill and total data loss. &ldquo;Unbounded&rdquo; always means &ldquo;bounded by RAM, discovered at 3 a.m.&rdquo;",
        });
        return frames;
    },
};

/* ---- 24. Dual write and the transactional outbox ---- */

VIZ["outbox"] = {
    title: "You cannot commit to two systems at once",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "never happened"]],
    options: [
        { value: "dual", label: "Dual write \u2014 the bug" },
        { value: "outbox", label: "Transactional outbox" },
    ],
    build(option = "dual") {
        const W = 880;
        const H = 360;
        if (option === "outbox") {
            const lanes = [
                { x: 120, label: "Order API", sub: "" },
                { x: 400, label: "Database", sub: "orders + outbox" },
                { x: 660, label: "Relay", sub: "separate process" },
                { x: 850, label: "Broker", sub: "" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "BEGIN", note: "One transaction, one database. That is the whole idea \u2014 remove the second system from the critical path entirely." },
                { from: 0, to: 1, y: 150, text: "INSERT order; INSERT outbox row", note: "The order row and a row in an <code>outbox</code> table are written <b>in the same transaction</b>. The outbox row holds the event payload, its topic and its id." },
                { from: 0, to: 1, y: 190, text: "COMMIT \u2014 atomic", note: "One commit. Either both rows exist or neither does. <b>There is no interleaving where the order exists and the event does not</b> \u2014 the database's atomicity is doing all the work." },
                { from: 2, to: 1, y: 230, text: "poll unpublished outbox rows", note: "A separate relay \u2014 a poller, or a CDC connector reading the write-ahead log \u2014 picks up committed-but-unpublished rows. It can crash and restart as often as it likes." },
                { from: 2, to: 3, y: 270, text: "publish OrderPlaced", note: "The relay publishes to the broker. If publishing fails it simply tries again on the next pass; the row is still sitting there marked unpublished." },
                { from: 2, to: 1, y: 310, text: "mark published", note: "The row is marked published. A crash <em>between</em> publishing and marking means the event goes out <b>twice</b> \u2014 which is fine, because consumers dedupe on the event id you put in the row." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "The transactional outbox removes the dual write by making the event part of the database transaction.",
                "<b>Conclusion.</b> The outbox converts an impossible problem (atomicity across two systems) into a solved one (atomicity in one system) plus a tolerable one (at-least-once publishing). Costs: a table to prune, a relay to run, and a little extra latency. It is the standard answer, and <b>the alternative is silent data loss you will find weeks later in a reconciliation report</b>."
            );
        }
        const lanes = [
            { x: 140, label: "Order API", sub: "" },
            { x: 450, label: "Database", sub: "" },
            { x: 760, label: "Broker", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "INSERT order \u2014 committed", note: "The service writes the order and commits. So far so good: the order genuinely exists." },
            { from: 0, to: 2, y: 155, text: "publish OrderPlaced \u2026", note: "Now it publishes the event. <b>Two systems, two separate commits, and no way to make them one.</b> There is no transaction that spans a database and a broker." },
            { from: 2, to: 0, y: 200, text: "connection reset", after: "e-idle", note: "The broker is mid-failover. The publish fails. The order is committed and the event is not \u2014 and you now have a genuinely unsolvable choice." },
            { from: 0, to: 1, y: 245, text: "roll back? already committed", after: "e-idle", note: "You cannot roll back a committed transaction. You could delete the row \u2014 but a second request may already have read it, and the delete can fail too." },
            { from: 0, to: 2, y: 290, text: "retry publish \u2026 then crash", after: "e-idle", note: "You could retry in a loop, but the process can die at any point in that loop. There is always an instant where one side has happened and the other has not." },
            { from: 0, to: 1, y: 335, text: "order exists, nobody is told", after: "e-idle", note: "<b>The order is paid for and never ships.</b> No exception was swallowed and no code is wrong \u2014 the design is wrong. Reversing the order (publish first, then write) just swaps it for a phantom event about an order that does not exist." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "The most common bug in event-driven systems: writing to the database and publishing an event as two separate operations.",
            "<b>Conclusion.</b> A dual write has no correct implementation. Retries narrow the window; they never close it. The only real fixes are to make the event <em>part of</em> the database write \u2014 the <b>outbox</b> \u2014 or to derive events from the database's own log with <b>CDC</b>."
        );
    },
};

/* ---- 25. Change data capture ---- */

VIZ["cdc"] = {
    title: "Turning a database log into an event stream",
    legend: [["lg-act", "current step"], ["lg-done", "published"], ["lg-cmp", "durable"], ["lg-idle", "waiting"]],
    build() {
        const W = 800;
        const H = 260;
        const draw = (st, caption) => {
            let s = boxHTML(20, 40, 140, 52, "app", st.app, "plain SQL");
            s += boxHTML(210, 40, 150, 52, "Postgres", st.db, "");
            s += boxHTML(210, 140, 150, 48, "WAL", st.wal, "ordered, durable");
            s += boxHTML(430, 140, 160, 48, "connector", st.conn, "Debezium");
            s += boxHTML(640, 140, 140, 48, "topic", st.topic, "");
            s += arrowHTML(162, 66, 206, 66, st.e1 || "e-idle");
            s += arrowHTML(285, 94, 285, 136, st.e2 || "e-idle");
            s += arrowHTML(362, 164, 426, 164, st.e3 || "e-idle");
            s += arrowHTML(592, 164, 636, 164, st.e4 || "e-idle");
            if (caption) s += capHTML(20, 240, caption, "start");
            return svgHTML(W, H, s);
        };
        const base = { app: "n-idle", db: "n-idle", wal: "n-idle", conn: "n-idle", topic: "n-idle" };
        const frames = [];
        frames.push({
            stage: draw(base, "an ordinary transactional application"),
            note: "The application writes rows. <b>It publishes nothing and knows nothing about Kafka</b> \u2014 that is the selling point of CDC: you get events out of a service you are not allowed to change.",
        });
        frames.push({
            stage: draw({ ...base, app: "n-act", db: "n-act", e1: "e-act" }, "UPDATE orders SET status = 'paid'"),
            note: "A normal <code>UPDATE</code> inside a normal transaction.",
        });
        frames.push({
            stage: draw({ ...base, db: "n-cmp", wal: "n-act", e2: "e-act" }, "every commit is appended to the WAL"),
            note: "Every committed change is already written to the <b>write-ahead log</b> \u2014 the database does this for durability and replication whether you use it or not. It is ordered, durable, and reflects <em>exactly</em> what committed.",
        });
        frames.push({
            stage: draw({ ...base, wal: "n-cmp", conn: "n-act", e3: "e-act" }, "the connector reads the WAL as a replica would"),
            note: "The connector attaches like a replication client and streams changes, holding an <b>LSN</b> \u2014 its position in the log. Crash it and it resumes from that position; no polling, no <code>updated_at</code> column, no missed rows.",
        });
        frames.push({
            stage: draw({ ...base, conn: "n-cmp", topic: "n-act", e4: "e-act" }, "before/after images published"),
            note: "Each change becomes an event carrying <b>before and after images</b> plus the transaction id. That before-image is genuinely valuable \u2014 downstream consumers can see <em>what changed</em>, not just the new state.",
        });
        frames.push({
            stage: draw({ ...base, app: "n-done", db: "n-done", wal: "n-done", conn: "n-done", topic: "n-done", e1: "e-done", e2: "e-done", e3: "e-done", e4: "e-done" }, "no dual write anywhere in this picture"),
            note: "<b>Conclusion.</b> CDC solves the dual write with <em>zero</em> application changes, which makes it the standard way to unlock a legacy system, feed a search index or hydrate a cache. The catch is that your events are now <b>table-shaped, not domain-shaped</b>: every consumer is coupled to your schema, so a column rename becomes a breaking API change. Prefer an explicit outbox table read by CDC \u2014 you get the reliability and keep a designed contract.",
        });
        return frames;
    },
};

/* ---- 26. Sagas ---- */

VIZ["saga"] = {
    title: "A transaction that spans services",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "compensated"]],
    options: [
        { value: "orchestration", label: "Orchestrated saga" },
        { value: "choreography", label: "Choreographed saga" },
    ],
    build(option = "orchestration") {
        const W = 900;
        const H = 420;
        if (option === "choreography") {
            const lanes = [
                { x: 110, label: "Order svc", sub: "" },
                { x: 340, label: "Payment svc", sub: "" },
                { x: 570, label: "Inventory svc", sub: "" },
                { x: 800, label: "Shipping svc", sub: "" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "event: OrderPlaced", note: "No coordinator. The order service publishes a fact and stops. It does not know that payment exists." },
                { from: 1, to: 2, y: 150, text: "event: PaymentCaptured", note: "Payment reacts to <code>OrderPlaced</code>, charges the card, and publishes its own fact. Each service <b>listens for an event and emits the next one</b>." },
                { from: 2, to: 3, y: 190, text: "event: StockReserved", note: "Inventory reacts and reserves stock. Adding a fraud check here later means deploying one new subscriber \u2014 <b>nothing else changes</b>. That flexibility is the appeal." },
                { from: 3, to: 2, y: 230, text: "event: ShippingFailed", note: "Shipping cannot serve the address and publishes a failure event. Now the hard part: <b>who unwinds what?</b>" },
                { from: 2, to: 1, y: 270, text: "event: StockReleased", note: "Inventory listens for <code>ShippingFailed</code> and releases its reservation, then publishes that fact." },
                { from: 1, to: 0, y: 310, text: "event: PaymentRefunded", note: "Payment listens for <code>StockReleased</code> and refunds. The compensation chain runs backwards through the same subscriptions." },
                { from: 0, to: 0, y: 350, text: "order \u2192 CANCELLED", note: "The order service closes the order. <b>The flow is correct \u2014 and it exists nowhere as a readable artefact.</b> To understand it you must read four codebases and their subscription lists." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "<b>Choreography</b>: no central brain. Each service reacts to events and publishes its own.",
                "<b>Conclusion.</b> Choreography gives maximum decoupling and minimum visibility. It is a good fit for two or three steps; beyond that, debugging &ldquo;why did this order stall?&rdquo; means correlating logs across every participant, and <b>cyclic subscriptions become infinite loops nobody designed</b>. Use it when the flow is short and stable; orchestrate when it is long or business-critical."
            );
        }
        const lanes = [
            { x: 110, label: "Orchestrator", sub: "owns the state" },
            { x: 340, label: "Payment", sub: "" },
            { x: 570, label: "Inventory", sub: "" },
            { x: 800, label: "Shipping", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "capture payment", note: "One component owns the flow and its state machine. It persists <em>which step it is on</em> after every reply \u2014 so it can be killed at any instant and resume." },
            { from: 1, to: 0, y: 150, text: "captured (txn 88f1)", note: "Step one succeeded. This is a <b>local</b> transaction, committed and visible to the world \u2014 not a lock held open across services. Other customers can see the money moved." },
            { from: 0, to: 2, y: 190, text: "reserve stock", note: "Step two. Each step must be <b>idempotent</b>, because the orchestrator will retry on timeout and will occasionally send the same command twice." },
            { from: 2, to: 0, y: 230, text: "reserved (2 units)", note: "Two steps down, one to go. Notice the system is currently in a state that would be impossible inside a database transaction: paid and reserved but not shipped." },
            { from: 0, to: 3, y: 270, text: "schedule shipment", note: "Step three." },
            { from: 3, to: 0, y: 310, text: "FAILED \u2014 no courier for region", note: "It fails, and not transiently. <b>There is no rollback available</b> \u2014 the payment is captured and the stock is reserved, in other services' databases, already committed." },
            { from: 0, to: 2, y: 350, text: "compensate: release stock", note: "So the orchestrator runs <b>compensating transactions</b> in reverse order. Compensation is not an undo: it is a new, forward transaction that semantically offsets the old one." },
            { from: 0, to: 1, y: 390, text: "compensate: refund payment", note: "And a refund \u2014 which is emphatically not the same as un-charging. The customer's statement will show both lines, and that is the honest representation of what happened." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "<b>Orchestration</b>: one component owns the flow, calls each step, and knows how to unwind.",
            "<b>Conclusion.</b> A saga trades atomicity for availability: you give up &ldquo;all or nothing&rdquo; and accept &ldquo;all, or all-then-undone, and briefly visible in between&rdquo;. That visibility is a product question \u2014 someone has to decide what the customer sees while an order is half-done. Design the compensations <em>first</em>; the happy path is the easy half."
        );
    },
};

/* ---- 27. Two-phase commit ---- */

VIZ["two-phase-commit"] = {
    title: "Why nobody uses 2PC across services",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "blocked"]],
    build() {
        const W = 860;
        const H = 380;
        const lanes = [
            { x: 130, label: "Coordinator", sub: "" },
            { x: 430, label: "Payments DB", sub: "" },
            { x: 730, label: "Inventory DB", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "PREPARE", note: "<b>Phase one.</b> The coordinator asks every participant whether it <em>can</em> commit. Each one does the work, writes it durably, and holds locks \u2014 but does not commit." },
            { from: 1, to: 0, y: 150, text: "VOTE YES \u00b7 locks held", note: "Payments votes yes. It has now made a <b>binding promise</b>: it must be able to commit whenever it is told to, so the rows stay locked until it hears back." },
            { from: 0, to: 2, y: 190, text: "PREPARE", note: "Same question to inventory." },
            { from: 2, to: 0, y: 230, text: "VOTE YES \u00b7 locks held", note: "Both are prepared. Both are holding locks. Every other transaction touching those rows is queued behind them \u2014 and this is the <em>normal</em> path." },
            { from: 0, to: 1, y: 270, text: "COMMIT", state: "e-act", note: "<b>Phase two</b> begins: the coordinator records the decision and starts telling participants to commit. Payments commits and releases its locks." },
            { from: 0, to: 2, y: 310, text: "\u2717 coordinator dies here", after: "e-idle", note: "<b>And the coordinator crashes before telling inventory.</b> This is the window everything hinges on \u2014 microseconds wide, and unavoidable." },
            { from: 2, to: 2, y: 350, text: "blocked \u2014 locks held indefinitely", after: "e-idle", note: "Inventory voted yes, so it may not abort. It has not been told to commit, so it may not commit. It <b>blocks, holding locks, until the coordinator comes back</b> \u2014 and it cannot ask its peers, because they may be in the same state." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "Two-phase commit really does give atomicity across systems. Watch what it costs.",
            "<b>Conclusion.</b> 2PC is a <b>blocking protocol with a single point of failure</b>: availability is the product of every participant's availability, and one dead coordinator freezes rows across your estate. It is fine inside one database cluster on one network. Across services owned by different teams, it is the reason sagas exist."
        );
    },
};

/* ---- 28. Scatter-gather and tail latency ---- */

VIZ["scatter-gather"] = {
    title: "The slowest shard is your response time",
    legend: [["lg-done", "answered"], ["lg-act", "waiting"], ["lg-out", "tail"], ["lg-cmp", "hedge"]],
    build() {
        const W = 800;
        const ticks = [{ at: 0, label: "0 ms" }, { at: 0.25, label: "50" }, { at: 0.5, label: "100" },
        { at: 0.75, label: "150" }, { at: 1, label: "200 ms" }];
        const t = (ms) => ms / 200;
        const lane = (name, at, ms, state, label) => ({
            label: name,
            marks: [{ at: t(at), width: t(ms), label: label || "", state }],
        });
        const frames = [];
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", "18 ms"),
                lane("shard 2", 0, 25, "n-done", "22 ms"),
                lane("shard 3", 0, 22, "n-done", "20 ms"),
                lane("shard 4", 0, 24, "n-done", "21 ms"),
                { label: "client sees", marks: [] },
            ], ticks),
            note: "A search query is <b>scattered</b> to four shards in parallel and the results are <b>gathered</b>. Each shard is fast: around <code>20 ms</code>, a p99 of <code>120 ms</code>.",
        });
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", "18 ms"),
                lane("shard 2", 0, 25, "n-done", "22 ms"),
                lane("shard 3", 0, 120, "n-out", "120 ms \u2014 GC pause"),
                lane("shard 4", 0, 24, "n-done", "21 ms"),
                { label: "client sees", marks: [{ at: 0, width: t(120), label: "120 ms", state: "n-out" }] },
            ], ticks),
            note: "Shard 3 hits a garbage-collection pause. Three shards finished in 22 ms and the client waits <code>120 ms</code>, because <b>the response cannot be assembled until the last piece arrives</b>.",
        });
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", ""),
                lane("shard 2", 0, 25, "n-done", ""),
                lane("shard 3", 0, 120, "n-out", "one slow shard"),
                lane("shard 4", 0, 24, "n-done", ""),
                { label: "client sees", marks: [{ at: 0, width: t(120), label: "p99 of the fan-out \u2248 p63 of one shard", state: "n-out" }] },
            ], ticks),
            note: "<b>This is tail amplification.</b> With 4 shards the chance that none is in its p99 is <code>0.99\u2074 \u2248 96%</code> \u2014 so 4% of requests are slow. Fan out to 100 shards and <b>63% of requests hit at least one p99 shard</b>. Your median becomes your components' tail.",
        });
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", ""),
                lane("shard 2", 0, 25, "n-done", ""),
                lane("shard 3", 0, 120, "n-out", "original, abandoned"),
                lane("shard 3b", 30, 22, "n-cmp", "hedge \u2192 52 ms"),
                { label: "client sees", marks: [{ at: 0, width: t(52), label: "52 ms", state: "n-done" }] },
            ], ticks),
            note: "<b>Hedged requests.</b> At the p95 mark (<code>30 ms</code>) the client sends a <em>second</em> copy of the slow sub-request to another replica and takes whichever answers first. Cost: about <b>5% extra load</b> for a dramatically shorter tail. Only safe for idempotent reads.",
        });
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", ""),
                lane("shard 2", 0, 25, "n-done", ""),
                lane("shard 3", 0, 40, "n-out", "cut off at 40 ms"),
                lane("shard 4", 0, 24, "n-done", ""),
                { label: "client sees", marks: [{ at: 0, width: t(40), label: "40 ms \u00b7 3 of 4 shards", state: "n-done" }] },
            ], ticks),
            note: "<b>Or return partial results.</b> Cut every shard off at <code>40 ms</code> and answer with what you have, flagged as incomplete. For search this is almost always the right call \u2014 users prefer a fast answer that is 97% complete to a perfect one that arrives after they have given up.",
        });
        frames.push({
            stage: timelineHTML(W, [
                lane("shard 1", 0, 20, "n-done", ""),
                lane("shard 2", 0, 25, "n-done", ""),
                lane("shard 3", 0, 22, "n-done", ""),
                lane("shard 4", 0, 24, "n-done", ""),
                { label: "client sees", marks: [{ at: 0, width: t(28), label: "28 ms", state: "n-done" }] },
            ], ticks),
            note: "<b>Conclusion.</b> Any fan-out makes you hostage to the worst component, so design for the tail explicitly: <b>hedge</b> idempotent reads, allow <b>partial results</b>, keep the fan-out narrow, and measure the p99 of the <em>aggregate</em> \u2014 per-shard dashboards will look healthy the entire time users are complaining.",
        });
        return frames;
    },
};

/* ---- 29. Getting data to a browser ---- */

VIZ["push-channels"] = {
    title: "Four ways to tell a browser something changed",
    legend: [["lg-act", "current message"], ["lg-done", "delivered"], ["lg-idle", "wasted"]],
    options: [
        { value: "poll", label: "Short polling" },
        { value: "long", label: "Long polling" },
        { value: "sse", label: "Server-sent events" },
        { value: "ws", label: "WebSockets" },
    ],
    build(option = "poll") {
        const W = 740;
        const H = 380;
        const lanes = [
            { x: 180, label: "Browser", sub: "" },
            { x: 560, label: "Server", sub: "" },
        ];
        const scripts = {
            poll: {
                intro: "<b>Short polling</b>: ask again every few seconds. The dumbest thing that works \u2014 and sometimes the right answer.",
                steps: [
                    { from: 0, to: 1, y: 110, text: "GET /messages?since=41", note: "A normal request over a normal connection. Every proxy, CDN and corporate firewall on earth handles this correctly." },
                    { from: 1, to: 0, y: 150, text: "204 \u2014 nothing new", after: "e-idle", note: "Nothing has changed. That round trip cost a TLS session, a request header block and a database query, and delivered zero bytes of value." },
                    { from: 0, to: 1, y: 190, text: "GET /messages?since=41", note: "Five seconds later, again. <b>With 10,000 clients on a 5 s interval that is 2,000 requests per second of mostly-empty answers.</b>" },
                    { from: 1, to: 0, y: 230, text: "204 \u2014 nothing new", after: "e-idle", note: "Still nothing. Polling load scales with <em>client count</em>, not with how often data actually changes \u2014 which is exactly backwards." },
                    { from: 0, to: 1, y: 270, text: "GET /messages?since=41", note: "And again." },
                    { from: 1, to: 0, y: 310, text: "200 \u00b7 1 new message", note: "Finally something. Average delivery latency is <b>half the interval</b>, so a 5-second poll means a 2.5-second average delay." },
                ],
                outro: "<b>Conclusion.</b> Polling is stateless, trivially load-balanced, and survives every proxy. Use it when updates are rare and latency of seconds is acceptable \u2014 and always send <code>ETag</code>/<code>since</code> so the empty answer is cheap. It is not a bad design; it is a bad <em>default</em> for chat.",
            },
            long: {
                intro: "<b>Long polling</b>: the same request, but the server holds it open until there is something to say.",
                steps: [
                    { from: 0, to: 1, y: 110, text: "GET /messages?since=41", note: "The request looks identical. The difference is entirely in the server's behaviour." },
                    { from: 1, to: 1, y: 160, text: "hold \u2026 25 s, no polling", note: "The server <b>parks the request</b> instead of answering. On a thread-per-request server this is fatal at scale; on an async runtime it is a cheap suspended coroutine." },
                    { from: 1, to: 0, y: 210, text: "200 \u00b7 new message (as it happens)", note: "The moment data arrives, the response is sent. <b>Latency is near zero</b> and there were no wasted round trips in between." },
                    { from: 0, to: 1, y: 260, text: "immediately re-request", note: "The client reconnects at once. There is a real gap here \u2014 <b>messages produced between the response and the reconnect must be buffered server-side</b>, which is why the cursor (<code>since=42</code>) is mandatory." },
                    { from: 1, to: 0, y: 310, text: "504 at 30 s \u2014 proxy timeout", after: "e-idle", note: "And the classic operational surprise: an intermediary kills the idle connection. You must return empty before every proxy's timeout \u2014 typically 25 s \u2014 and reconnect." },
                ],
                outro: "<b>Conclusion.</b> Long polling gets you push latency over plain HTTP, which is why it was the web's answer for a decade. It costs you a held connection per client and a fiddly reconnect protocol. Today it is the <b>fallback</b>, not the plan.",
            },
            sse: {
                intro: "<b>Server-sent events</b>: one HTTP response that never ends, carrying a stream of text events.",
                steps: [
                    { from: 0, to: 1, y: 110, text: "GET /stream  Accept: text/event-stream", note: "An ordinary <code>GET</code>. It carries your cookies and auth headers automatically \u2014 no separate handshake to secure." },
                    { from: 1, to: 0, y: 150, text: "200 \u00b7 content-type: text/event-stream", note: "The server responds and <b>keeps the body open</b>. This is one long HTTP response, not a new protocol." },
                    { from: 1, to: 0, y: 190, text: "data: {\"price\": 214.02}\\n\\n", note: "Each event is a couple of lines of text ending in a blank line. Simple enough to produce from any language with a loop and a flush." },
                    { from: 1, to: 0, y: 230, text: "id: 4172", note: "Events carry ids. On reconnect the browser automatically sends <code>Last-Event-ID</code>, so <b>resumption is built into the protocol</b> rather than into your code." },
                    { from: 1, to: 0, y: 270, text: "connection drops \u2192 auto-reconnect", note: "<code>EventSource</code> reconnects on its own with backoff. This is the single biggest practical advantage over WebSockets, where reconnection is entirely your problem." },
                    { from: 1, to: 0, y: 310, text: "data: {\"price\": 214.10}", note: "Text only \u2014 no binary frames \u2014 and strictly <b>one direction</b>. The client still uses ordinary POSTs to send anything." },
                ],
                outro: "<b>Conclusion.</b> SSE is the best fit for the common case: server-to-client updates, text payloads, existing auth. Two gotchas: over HTTP/1.1 browsers cap you at <b>6 connections per origin</b> (HTTP/2 removes this), and any buffering proxy will hold your stream hostage until you disable it.",
            },
            ws: {
                intro: "<b>WebSockets</b>: upgrade the HTTP connection to a raw, symmetric, bidirectional message channel.",
                steps: [
                    { from: 0, to: 1, y: 110, text: "GET /ws  Upgrade: websocket", note: "It starts as HTTP so it can traverse proxies, then <b>upgrades</b> \u2014 after which it is no longer HTTP at all." },
                    { from: 1, to: 0, y: 150, text: "101 Switching Protocols", note: "From here there are no requests, no responses, no status codes and no caching. You have a socket, and you own everything that happens on it." },
                    { from: 0, to: 1, y: 190, text: "{\"type\":\"join\",\"room\":\"42\"}", note: "<b>The client can send at any time</b> \u2014 that symmetry is the whole reason to choose WebSockets over SSE. Chat, collaborative editing, multiplayer games." },
                    { from: 1, to: 0, y: 230, text: "{\"type\":\"presence\", \u2026}", note: "And the server pushes whenever it likes, with low per-message overhead: a couple of bytes of framing, not a header block." },
                    { from: 0, to: 1, y: 270, text: "ping / pong every 30 s", note: "You must implement <b>heartbeats yourself</b>. Without them a NAT or load balancer silently drops an idle connection and both sides believe they are still talking." },
                    { from: 1, to: 0, y: 310, text: "reconnect \u2192 resend state", note: "And <b>reconnection and state resync are yours too</b>. A dropped socket means replaying missed messages from a cursor you designed. This is where WebSocket projects actually spend their time." },
                ],
                outro: "<b>Conclusion.</b> Choose WebSockets when the <em>client</em> must push frequently; choose SSE when it does not. Either way the hard part is operational: <b>connections are state</b>, so deploys disconnect everyone, autoscaling is driven by connection count rather than CPU, and you need a pub/sub backplane so any server can reach any client.",
            },
        };
        const s = scripts[option] || scripts.poll;
        return seqFrames(W, H, lanes, s.steps, s.intro, s.outro);
    },
};

/* ---- 30. Webhooks ---- */

VIZ["webhook-retry"] = {
    title: "Delivering an event to someone else's server",
    legend: [["lg-act", "in flight"], ["lg-done", "settled"], ["lg-idle", "failed"]],
    build() {
        const W = 880;
        const H = 400;
        const lanes = [
            { x: 130, label: "Your platform", sub: "" },
            { x: 440, label: "Delivery worker", sub: "" },
            { x: 750, label: "Customer endpoint", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "enqueue payment.succeeded", note: "A webhook is a queue whose consumer you do not control. <b>Never send it inline from the request that caused it</b> \u2014 a customer's slow server would then be inside your own latency." },
            { from: 1, to: 2, y: 150, text: "POST + X-Signature: HMAC(body)", note: "Sign the <b>raw body</b> with a shared secret and include a timestamp in the signed payload. Without the timestamp, anyone who captures one delivery can replay it forever." },
            { from: 2, to: 1, y: 190, text: "500 \u2014 their database is down", after: "e-idle", note: "The receiver fails. Their problem, your retry: this is the deal you make when you offer webhooks." },
            { from: 1, to: 2, y: 230, text: "retry 1 min, 5 min, 30 min, 2 h \u2026", note: "Retry with <b>exponential backoff and jitter</b>, spread over hours or days \u2014 receivers are frequently down for a deploy window, not for 200 ms." },
            { from: 2, to: 1, y: 270, text: "200 OK (after 31 minutes)", note: "It works eventually. Send the <b>event id</b> in the body so the receiver can dedupe: your delivery is at-least-once and they will see repeats." },
            { from: 1, to: 2, y: 310, text: "deliveries can arrive out of order", note: "Because retries are per-event, <code>payment.succeeded</code> can land <em>after</em> <code>payment.refunded</code>. Include a sequence number or a timestamp and tell receivers to ignore stale state." },
            { from: 1, to: 0, y: 350, text: "48 h exhausted \u2192 disable + email", note: "After the retry window, <b>disable the endpoint and tell a human</b>, then offer a replay API. An endpoint that has been 500-ing for two days is a dead endpoint, and retrying it forever is a self-inflicted load problem." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "Webhooks are the public-internet version of pub/sub: HTTP callbacks to servers you do not own and cannot debug.",
            "<b>Conclusion.</b> A production webhook system needs six things: <b>sign the body</b>, <b>send an event id</b>, <b>retry with backoff over hours</b>, <b>expect out-of-order delivery</b>, <b>expose a delivery log with manual replay</b>, and <b>fetch-don't-trust for anything sensitive</b> \u2014 send only an id and let the receiver call your API for the data."
        );
    },
};

/* ---- Long polling: why the cursor is mandatory ---- */

VIZ["long-poll-cursor"] = {
    title: "Long polling: what happens to an event published between two polls",
    legend: [["lg-act", "current message"], ["lg-done", "delivered / stored"], ["lg-idle", "lost or empty"]],
    options: [
        { value: "cursor", label: "With a cursor" },
        { value: "none", label: "Without a cursor" },
    ],
    build(option = "cursor") {
        const W = 860;
        const H = 420;
        const lanes = [
            { x: 130, label: "Browser", sub: "" },
            { x: 430, label: "Server", sub: "" },
            { x: 730, label: option === "none" ? "Publisher" : "Event log", sub: option === "none" ? "fire and forget" : "ordered, durable" },
        ];
        if (option === "none") {
            const script = [
                { from: 0, to: 1, y: 110, text: "GET /updates  (parked)", note: "The browser asks for &ldquo;anything new&rdquo; and says nothing about what it has already seen. The server parks the request until the next event." },
                { from: 2, to: 1, y: 150, text: "publish m41", note: "An event is published. The server hands it to whichever requests are parked right now." },
                { from: 1, to: 0, y: 190, text: "200 [m41]", note: "Delivered, and the request is finished. Until the browser sends its next poll, <b>nobody is parked</b> for this user." },
                { from: 2, to: 1, y: 230, text: "publish m42 \u2014 nobody parked", after: "e-idle", note: "<code>m42</code> arrives in that gap \u2014 a few milliseconds on a desk, whole seconds on a phone. The server has no parked request and no record of what this client has seen, so <b>there is nowhere to put it</b>." },
                { from: 0, to: 1, y: 270, text: "GET /updates  (parked)", note: "The browser re-polls for &ldquo;anything new&rdquo;. From the server's point of view, <code>m42</code> is already old news." },
                { from: 2, to: 1, y: 310, text: "publish m43", note: "The next event wakes the new request." },
                { from: 1, to: 0, y: 350, text: "200 [m43]", note: "The client shows <code>m43</code> and never learns that <code>m42</code> existed. <b>No error was raised anywhere</b>: no exception, no log line, no metric." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "Long polling without a cursor: the server holds a request open and answers it with the next event.",
                "<b>Conclusion.</b> Without a cursor, long polling silently loses exactly the events published between two polls \u2014 rare in testing, routine on mobile networks. The real contract is not &ldquo;wait for the next event&rdquo;, it is <b>&ldquo;give me everything after N&rdquo;</b>, and that needs a durable, ordered log."
            );
        }
        const script = [
            { from: 0, to: 1, y: 110, text: "GET /updates?after=40", note: "The client says where it is: <code>after=40</code>. The server checks the log first, finds nothing newer, and only then parks the request." },
            { from: 2, to: 1, y: 150, text: "append m41 \u00b7 wake", note: "<code>m41</code> is appended to the per-user log, which wakes the parked request." },
            { from: 1, to: 0, y: 190, text: "200 [m41]  cursor=41", note: "The response carries the new cursor. The client stores <code>cursor=41</code> \u2014 in memory, and in <code>localStorage</code> if it should survive a reload." },
            { from: 2, to: 2, y: 230, text: "append m42", after: "e-done", note: "<code>m42</code> lands in the gap again. This time it is not handed to a parked request; it is <b>appended to the log</b>, where it waits for anyone who asks." },
            { from: 0, to: 1, y: 270, text: "GET /updates?after=41", note: "The browser re-polls from its cursor." },
            { from: 1, to: 2, y: 310, text: "read after 41", note: "Before parking, the server reads the log after 41 \u2014 and <code>m42</code> is already there." },
            { from: 1, to: 0, y: 350, text: "200 [m42]  cursor=42 (no wait)", note: "It answers <b>immediately</b>. The gap between polls is now harmless, however long it was." },
            { from: 0, to: 1, y: 390, text: "after=42 \u2192 204 at 25 s, re-poll", after: "e-idle", note: "With nothing new, the server returns an empty <code>204</code> after 25 s \u2014 under every proxy's idle timeout \u2014 and the client simply asks again." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "The same protocol with one extra number: the client sends the id of the last event it has seen.",
            "<b>Conclusion.</b> The cursor makes long polling correct: answer &ldquo;everything after N&rdquo; from a durable log, park only when there is nothing, and return empty before any proxy gives up. The price is a <b>per-user ordered backlog</b> \u2014 the same backlog SSE resumes from in section 37."
        );
    },
};

/* ---- SSE: resumption across a deploy ---- */

VIZ["sse-resume"] = {
    title: "SSE across a deploy: what Last-Event-ID buys you",
    legend: [["lg-act", "current message"], ["lg-done", "delivered"], ["lg-idle", "dropped or lost"]],
    options: [
        { value: "ids", label: "Events with ids + backlog" },
        { value: "noids", label: "Events without ids" },
    ],
    build(option = "ids") {
        const W = 900;
        const H = 440;
        if (option === "noids") {
            const lanes = [
                { x: 110, label: "Browser", sub: "EventSource" },
                { x: 340, label: "Server A", sub: "" },
                { x: 570, label: "Server B", sub: "" },
                { x: 800, label: "Pub/sub", sub: "no history" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "GET /orders/7/events", note: "The browser opens an <code>EventSource</code>; the load balancer sends it to server A." },
                { from: 1, to: 0, y: 150, text: "data: preparing", note: "Events go out with a <code>data:</code> line and nothing else \u2014 no <code>id:</code>." },
                { from: 1, to: 0, y: 190, text: "data: picked up", note: "The user sees the order move. So far, identical to the version with ids." },
                { from: 1, to: 0, y: 230, text: "deploy: A drains \u2014 stream closed", after: "e-idle", note: "A deploy restarts A and every stream on it drops at once. <code>EventSource</code> notices and will reconnect by itself." },
                { from: 3, to: 3, y: 270, text: "43 published: no listener", after: "e-idle", note: "While the browser is disconnected, the next status is published. Pub/sub delivers to <b>current</b> subscribers only, and this user has none. The event is gone." },
                { from: 0, to: 2, y: 310, text: "GET /orders/7/events (no Last-Event-ID)", note: "The browser reconnects and lands on B. It has no id to send, so B cannot know anything was missed." },
                { from: 3, to: 2, y: 350, text: "delivered", note: "The next live event reaches B through the backplane." },
                { from: 2, to: 0, y: 390, text: "data: delivered", note: "The user jumps from &ldquo;picked up&rdquo; to &ldquo;delivered&rdquo;. Annoying here; for a chat message or a trade confirmation it is <b>data loss with no error</b>." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "A stream of order updates with no event ids. Watch what a single deploy does to it.",
                "<b>Conclusion.</b> Without ids, an SSE stream is <b>at-most-once</b>: anything published while a client is reconnecting is silently lost, and every deploy creates such a window for every client at once. Put an <code>id:</code> on every event and keep a short backlog to replay from."
            );
        }
        const lanes = [
            { x: 110, label: "Browser", sub: "EventSource" },
            { x: 340, label: "Server A", sub: "" },
            { x: 570, label: "Server B", sub: "" },
            { x: 800, label: "Event backlog", sub: "per order, ordered" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "GET /orders/7/events", note: "The browser opens an <code>EventSource</code>; the load balancer sends it to server A." },
            { from: 1, to: 0, y: 144, text: "id: 41  data: preparing", note: "Every event carries an <code>id:</code>. The browser records it as <code>lastEventId</code> automatically \u2014 no application code." },
            { from: 1, to: 0, y: 178, text: "id: 42  data: picked up", note: "<code>lastEventId</code> is now <code>42</code>." },
            { from: 1, to: 0, y: 212, text: "deploy: A drains \u2014 stream closed", after: "e-idle", note: "A deploy restarts A and every stream on it drops at once. <code>EventSource</code> waits the <code>retry:</code> delay the server sent \u2014 jittered per connection, so two million clients do not return in the same second." },
            { from: 3, to: 3, y: 246, text: "append 43", after: "e-done", note: "While the browser is away, event 43 is published. It is appended to a durable, ordered backlog as well as fanned out live." },
            { from: 0, to: 2, y: 280, text: "GET /orders/7/events  Last-Event-ID: 42", note: "The browser reconnects, lands on B, and <b>sends <code>Last-Event-ID: 42</code> by itself</b>. This header is the whole resumption protocol." },
            { from: 2, to: 3, y: 314, text: "subscribe live, then read after 42", note: "B subscribes to the live feed <em>first</em>, then reads the backlog after 42. The other order loses anything published between the two calls." },
            { from: 3, to: 2, y: 348, text: "[43]", note: "The backlog returns the one event the browser missed." },
            { from: 2, to: 0, y: 382, text: "id: 43  (replayed)", note: "B replays 43. The user sees every step, in order, despite the deploy." },
            { from: 2, to: 0, y: 416, text: "id: 44  data: delivered  (live)", note: "Then live events continue. Anything that arrived during the replay is skipped by id, so nothing is shown twice." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "A stream of order updates with an id on every event and a short backlog behind the fleet.",
            "<b>Conclusion.</b> SSE resumption is three cheap things: an <b><code>id:</code> on every event</b>, a <b>backlog</b> any node can read &ldquo;after N&rdquo;, and <b>subscribe-before-replay</b> with dedupe by id. The browser does the rest. It costs a bounded per-stream history \u2014 minutes, not forever \u2014 and turns a deploy from data loss into a short pause."
        );
    },
};

/* ---- WebSockets: the backplane ---- */

VIZ["websocket-backplane"] = {
    title: "Two users, two servers: who can reach whom?",
    legend: [["lg-act", "message moving"], ["lg-done", "connected / delivered"], ["lg-cmp", "backplane"], ["lg-out", "missed / restarting"]],
    options: [
        { value: "backplane", label: "With a pub/sub backplane" },
        { value: "local", label: "Local broadcast only" },
    ],
    build(option = "backplane") {
        const W = 860;
        const H = 330;
        const withBp = option === "backplane";
        const draw = (st, caption) => {
            let s = "";
            const conn = (x1, y1, x2, y2, state) => edgeHTML(x1, y1, x2, y2, state || "e-idle");
            s += conn(180, 74, 340, 74, st.connA);
            s += conn(180, 254, 340, 254, st.connB);
            if (st.connBA) s += conn(180, 246, 340, 90, st.connBA);
            s += boxHTML(40, 50, 140, 48, "Alice", st.alice || "n-idle", st.aliceSub || "browser");
            s += boxHTML(40, 230, 140, 48, "Bob", st.bob || "n-idle", st.bobSub || "browser");
            s += boxHTML(340, 50, 170, 48, "WS node A", st.a || "n-idle", st.aSub || "");
            s += boxHTML(340, 230, 170, 48, "WS node B", st.b || "n-idle", st.bSub || "");
            if (withBp) s += boxHTML(660, 140, 170, 48, "Redis pub/sub", st.bp || "n-cmp", st.bpSub || "backplane");
            if (st.aliceToA) s += arrowHTML(182, 66, 336, 66, st.aliceToA, st.aliceToALabel || "");
            if (st.aToAlice) s += arrowHTML(338, 84, 184, 84, st.aToAlice, "");
            if (withBp && st.aToBp) s += arrowHTML(512, 76, 656, 152, st.aToBp, "PUBLISH room:42");
            if (withBp && st.bpToB) s += arrowHTML(656, 178, 512, 250, st.bpToB, "");
            if (st.bToBob) s += arrowHTML(338, 262, 184, 262, st.bToBob, "");
            if (st.bobToA) s += arrowHTML(184, 236, 336, 96, st.bobToA, "");
            if (caption) s += capHTML(430, 322, caption);
            return svgHTML(W, H, s);
        };
        const frames = [];
        if (!withBp) {
            frames.push({
                stage: draw({ connA: "e-done", connB: "e-done", aSub: "holds Alice's socket", bSub: "holds Bob's socket" }),
                note: "Alice and Bob are in chat room 42. The load balancer happened to put Alice's socket on node A and Bob's on node B, and <b>a socket lives on exactly one node</b> for its whole life.",
            });
            frames.push({
                stage: draw({ connA: "e-done", connB: "e-done", alice: "n-act", a: "n-act", aliceToA: "e-act", aSub: "room 42 \u2192 who is here?", bSub: "holds Bob's socket" }),
                note: "Alice sends a message. Node A looks up room 42 in <b>its own memory</b> to find the sockets it should forward to.",
            });
            frames.push({
                stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", aliceSub: "sees her message", a: "n-done", aToAlice: "e-done", aSub: "1 local member", bSub: "has no idea" }, "delivered: 1 of 2"),
                note: "A finds one member \u2014 Alice herself \u2014 and echoes the message to her. Her screen looks perfect.",
            });
            frames.push({
                stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", a: "n-done", bob: "n-out", bobSub: "never sees it", b: "n-idle", bSub: "has no idea" }, "delivered: 1 of 2"),
                note: "Bob never receives it. Nothing failed, so nothing is logged. This works flawlessly in development with one node and breaks the day you run two \u2014 and <b>sticky sessions do not help</b>, because Alice and Bob are different users.",
            });
            frames.push({
                stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", a: "n-done", bob: "n-out", bobSub: "never sees it", bSub: "has no idea" }, "delivered: 1 of 2"),
                note: "<b>Conclusion.</b> In-memory broadcast only reaches the sockets on the node that received the message. Any fleet larger than one needs every node to hear every relevant message \u2014 a <b>pub/sub backplane</b> \u2014 or a managed service that provides one.",
            });
            return frames;
        }
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-done", aSub: "subscribed: room:42", bSub: "subscribed: room:42" }),
            note: "Same layout, plus a backplane. Each node <b>subscribes to the channel of every room its sockets are in</b>, so both A and B listen on <code>room:42</code>.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-done", alice: "n-act", a: "n-act", aliceToA: "e-act", aSub: "subscribed: room:42", bSub: "subscribed: room:42" }),
            note: "Alice sends a message with a client-generated id, so a resend after a reconnect can be deduplicated.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", a: "n-act", aToBp: "e-act", bp: "n-act", aSub: "persist, then publish", bSub: "subscribed: room:42" }),
            note: "A stores the message (so it can be replayed later) and <b>publishes it to <code>room:42</code></b> instead of looking only at its own sockets.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", a: "n-done", aToBp: "e-done", bp: "n-cmp", bpToB: "e-act", b: "n-act", aToAlice: "e-done", aSub: "acked Alice", bSub: "room 42 \u2192 Bob" }),
            note: "The backplane fans the message out to every subscribed node. A acks Alice; B finds Bob in room 42.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-done", alice: "n-done", a: "n-done", aToBp: "e-done", bpToB: "e-done", b: "n-done", bToBob: "e-done", bob: "n-done", bobSub: "seq 121", aSub: "", bSub: "" }, "delivered: 2 of 2"),
            note: "Bob receives it, stamped with sequence number <code>121</code>. Any node can now reach any user, at the cost of one more hop and one more system to run.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-idle", alice: "n-done", a: "n-done", b: "n-out", bSub: "deploying", bob: "n-out", bobSub: "close 1012" }, "deploy: node B drains"),
            note: "A deploy restarts B. It closes Bob's socket with code <code>1012</code> (service restart) so the client knows to reconnect rather than give up.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connB: "e-idle", alice: "n-done", a: "n-act", aSub: "resume after 121", b: "n-idle", bSub: "new version", bob: "n-act", bobSub: "reconnecting", bobToA: "e-act" }, "reconnect after a jittered delay"),
            note: "After a <b>jittered</b> delay Bob reconnects \u2014 to A this time \u2014 and sends <code>resume after 121</code>. Without jitter, every client of B would arrive in the same instant.",
        });
        frames.push({
            stage: draw({ connA: "e-done", connBA: "e-done", alice: "n-done", a: "n-done", aSub: "replayed 122\u2013124", b: "n-idle", bSub: "new version", bob: "n-done", bobSub: "caught up" }, "delivered: 2 of 2, nothing lost"),
            note: "<b>Conclusion.</b> A replays what Bob missed from the message store, then streams live. A WebSocket fleet needs three things HTTP never asked of you: a <b>backplane</b> so any node can reach any user, <b>sequence numbers</b> so a reconnect can resume, and <b>jittered reconnects</b> so a deploy is not a stampede.",
        });
        return frames;
    },
};

/* ---- Asynchronous request-reply ---- */

VIZ["async-request-reply"] = {
    title: "Asking now, answering later",
    legend: [["lg-act", "current message"], ["lg-done", "settled"], ["lg-idle", "timed out / discarded"]],
    options: [
        { value: "http", label: "HTTP: 202 + status URL" },
        { value: "queue", label: "Queues: reply_to + correlation id" },
    ],
    build(option = "http") {
        if (option === "queue") {
            const W = 900;
            const H = 420;
            const lanes = [
                { x: 110, label: "Pricing svc", sub: "instance i3" },
                { x: 340, label: "quote.requests", sub: "queue" },
                { x: 570, label: "Quote worker", sub: "" },
                { x: 800, label: "reply queue i3", sub: "exclusive to i3" },
            ];
            const script = [
                { from: 0, to: 1, y: 110, text: "corr=c91 reply_to=i3", note: "The requester sends a request with two extra properties: <code>reply_to</code> (its own private reply queue) and a fresh <code>correlation_id</code>, which it stores in a map of waiting calls." },
                { from: 1, to: 2, y: 146, text: "deliver c91", note: "Any worker can take it \u2014 the queue load-levels the work across however many workers are running." },
                { from: 2, to: 3, y: 182, text: "reply corr=c91", note: "The worker publishes the answer to <code>reply_to</code>, copying the <code>correlation_id</code>, and only then acks the request." },
                { from: 3, to: 0, y: 218, text: "c91 \u2192 resolve waiting call", note: "The requester looks up <code>c91</code>, finds the waiting call and completes it. The id is the only thing linking the answer to the question." },
                { from: 0, to: 1, y: 254, text: "corr=c92  expires in 2 s", note: "A second request, with a 2-second deadline \u2014 also set as the message expiry, so a stale request is not worth doing." },
                { from: 1, to: 2, y: 290, text: "deliver c92 (worker slow)", note: "This time the worker is slow: a GC pause, a cold cache, a noisy neighbour." },
                { from: 0, to: 0, y: 326, text: "c92 timed out", after: "e-idle", note: "The requester's 2-second timer fires. It removes <code>c92</code> from the map \u2014 <b>never leak waiting entries</b> \u2014 and fails the call." },
                { from: 2, to: 3, y: 362, text: "reply corr=c92 (late)", note: "The worker finishes anyway and replies. <b>The work happened</b>, even though the caller has given up." },
                { from: 3, to: 0, y: 398, text: "c92 unknown \u2192 dropped", after: "e-idle", note: "The late reply matches nothing and is logged and dropped. If the caller retries, the request must be idempotent, because the first attempt succeeded." },
            ];
            return seqFrames(
                W, H, lanes, script,
                "Request-reply over a broker: a request queue, a private reply queue per requester, and a correlation id joining them.",
                "<b>Conclusion.</b> Correlation ids give you load-levelled, location-transparent calls between services. They do not remove the third outcome: a timeout still means &ldquo;unknown&rdquo;, late replies are normal, and a caller that blocks for the answer is still synchronously coupled \u2014 just through more hops."
            );
        }
        const W = 860;
        const H = 420;
        const lanes = [
            { x: 130, label: "Client", sub: "" },
            { x: 430, label: "Reports API", sub: "" },
            { x: 730, label: "Worker", sub: "" },
        ];
        const script = [
            { from: 0, to: 1, y: 110, text: "POST /reports  Idempotency-Key: k7", note: "The client asks for a report that takes minutes to build. The idempotency key, minted once per <em>intent</em>, makes a double click or a retry return the same job." },
            { from: 1, to: 2, y: 146, text: "enqueue job 7 (via outbox)", note: "The API writes a job row and its <code>report.requested</code> event in one transaction. It does none of the work itself." },
            { from: 1, to: 0, y: 182, text: "202  Location: /jobs/7  Retry-After: 5", note: "<b><code>202 Accepted</code> in milliseconds.</b> <code>Location</code> is the handle; <code>Retry-After</code> lets the server, not the client, set the polling rate." },
            { from: 0, to: 1, y: 218, text: "GET /jobs/7", note: "Five seconds later, the client asks about the <em>job</em>, not the original request. No connection was held open in between." },
            { from: 1, to: 0, y: 254, text: "200 running 40%  Retry-After: 10", note: "Still running, with progress for the UI. The server asks for a longer interval \u2014 during an incident it could ask for 60." },
            { from: 2, to: 1, y: 290, text: "job 7 succeeded \u2192 /reports/7", note: "The worker finishes, stores the PDF as an ordinary resource, and marks the job done. A deploy during the build would only have delayed this." },
            { from: 0, to: 1, y: 326, text: "GET /jobs/7", note: "The next poll." },
            { from: 1, to: 0, y: 362, text: "303 See Other  Location: /reports/7", note: "<code>303</code> separates the transient job from the durable result. HTTP clients follow it automatically." },
            { from: 0, to: 1, y: 398, text: "GET /reports/7 \u2192 200 PDF", note: "The result is a normal resource: cacheable, linkable, authorised like anything else. A failed job would instead have returned <code>200</code> with <code>status: failed</code> \u2014 the status request itself succeeded." },
        ];
        return seqFrames(
            W, H, lanes, script,
            "One slow operation split into two fast ones: start the job, then ask about it.",
            "<b>Conclusion.</b> Async request-reply removes the long-held connection, so load balancer timeouts, retries and deploys stop killing (or duplicating) slow work. The price is a <b>job resource you must own</b>: durable, idempotent to create, with explicit expiry, and with a status URL that stays the source of truth even if you also push."
        );
    },
};

/* ---- 31. Leader election ---- */

VIZ["raft-election"] = {
    title: "Electing a leader without a referee",
    legend: [["lg-done", "leader"], ["lg-act", "candidate"], ["lg-cmp", "follower"], ["lg-out", "unreachable"]],
    build() {
        const W = 720;
        const H = 300;
        const pos = [[180, 80], [540, 80], [180, 220], [540, 220], [360, 150]];
        const draw = (nodes, term, caption) => {
            let s = "";
            for (let i = 0; i < 5; i += 1) {
                for (let j = i + 1; j < 5; j += 1) {
                    const st = nodes[i].state === "n-out" || nodes[j].state === "n-out" ? "e-idle" : nodes[i].edge || "e-idle";
                    s += edgeHTML(pos[i][0], pos[i][1], pos[j][0], pos[j][1], st);
                }
            }
            nodes.forEach((n, i) => {
                s += nodeHTML(pos[i][0], pos[i][1], n.label, n.state, 30, n.sub);
            });
            s += capHTML(20, 24, `term ${term}`, "start");
            if (caption) s += capHTML(20, 292, caption, "start");
            return svgHTML(W, H, s);
        };
        const n = (label, state, sub) => ({ label, state, sub });
        const frames = [];
        frames.push({
            stage: draw([n("A", "n-done", "leader"), n("B", "n-cmp"), n("C", "n-cmp"), n("D", "n-cmp"), n("E", "n-cmp")], 4, "steady state"),
            note: "Five nodes, one <b>leader</b>. All writes go through the leader, which is what makes the whole thing a consistent system rather than five systems.",
        });
        frames.push({
            stage: draw([n("A", "n-done", "leader"), n("B", "n-cmp", "\u2713"), n("C", "n-cmp", "\u2713"), n("D", "n-cmp", "\u2713"), n("E", "n-cmp", "\u2713")], 4, "heartbeat every 50 ms"),
            note: "The leader sends <b>heartbeats</b> every 50 ms. Each follower runs an <em>election timeout</em> \u2014 a randomised 150\u2013300 ms countdown that the heartbeat resets. That randomisation is doing real work; hold onto it.",
        });
        frames.push({
            stage: draw([n("A", "n-out", "crashed"), n("B", "n-cmp", "timer\u2026"), n("C", "n-cmp", "timer\u2026"), n("D", "n-cmp", "timer\u2026"), n("E", "n-cmp", "timer\u2026")], 4, "leader gone \u2014 no heartbeats"),
            note: "The leader dies. Nobody is told; the followers simply stop being reset. <b>Failure detection in a distributed system is always a timeout</b> \u2014 there is no such thing as a reliable &ldquo;it is dead&rdquo; signal.",
        });
        frames.push({
            stage: draw([n("A", "n-out"), n("B", "n-act", "candidate"), n("C", "n-cmp"), n("D", "n-cmp"), n("E", "n-cmp")], 5, "B timed out first \u2192 term 5"),
            note: "B's timer fires first (because the timeouts are random), so it becomes a <b>candidate</b>, increments the term to 5, votes for itself and asks the others for votes. The term number is a logical clock \u2014 it only ever goes up.",
        });
        frames.push({
            stage: draw([n("A", "n-out"), n("B", "n-act", "3 votes"), n("C", "n-cmp", "voted B"), n("D", "n-cmp", "voted B"), n("E", "n-cmp")], 5, "majority = 3 of 5"),
            note: "C and D grant their votes \u2014 each node votes at most once per term. With its own vote B has <b>3 of 5: a majority</b>. Majorities matter because any two majorities must overlap, so two leaders in the same term are impossible.",
        });
        frames.push({
            stage: draw([n("A", "n-out"), n("B", "n-done", "leader"), n("C", "n-cmp"), n("D", "n-cmp"), n("E", "n-cmp")], 5, "B leads term 5"),
            note: "B becomes leader and starts heartbeating. Total unavailability: <b>one election timeout plus one round trip</b> \u2014 typically a few hundred milliseconds, during which writes fail.",
        });
        frames.push({
            stage: draw([n("A", "n-act", "still thinks it leads"), n("B", "n-done", "leader, term 5"), n("C", "n-cmp"), n("D", "n-cmp"), n("E", "n-cmp")], 5, "A comes back as a zombie leader"),
            note: "A revives believing it is still the leader of term 4. <b>The term number saves you</b>: the first message it sends carries term 4, a peer replies &ldquo;we are on term 5&rdquo;, and A steps down immediately. Any write it attempted would be rejected for the same reason.",
        });
        frames.push({
            stage: draw([n("A", "n-cmp", "follower"), n("B", "n-done", "leader"), n("C", "n-cmp"), n("D", "n-cmp"), n("E", "n-cmp")], 5, "converged"),
            note: "<b>Conclusion.</b> Leader election is <b>majority voting plus randomised timeouts plus a monotonic term</b>. A 5-node cluster tolerates 2 failures; a 4-node cluster also tolerates only 1, which is why cluster sizes are odd. And you almost never implement this \u2014 you use etcd, ZooKeeper or Consul, because the interesting part is not the happy path, it is the zombie leader.",
        });
        return frames;
    },
};

/* ---- 32. Quorums ---- */

VIZ["quorum"] = {
    title: "Tuning consistency with three numbers",
    legend: [["lg-act", "written now"], ["lg-done", "read"], ["lg-out", "stale / down"], ["lg-idle", "replica"]],
    build() {
        const rows = (vals, marks) => dataGridHTML([["replica", "value", "version"], ...vals], marks);
        const HEAD = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head" };
        const frames = [];
        frames.push({
            stage: rows([["R1", "blue", "v1"], ["R2", "blue", "v1"], ["R3", "blue", "v1"]], HEAD),
            note: "Three replicas of one key, all agreed. <code>N = 3</code>. The question a quorum system answers is: <em>how many must I talk to before I am allowed to believe an answer?</em>",
        });
        frames.push({
            stage: rows([["R1", "green", "v2"], ["R2", "green", "v2"], ["R3", "blue", "v1"]], { ...HEAD, "1,1": "is-act", "1,2": "is-act", "2,1": "is-act", "2,2": "is-act", "3,1": "is-out" }),
            note: "A write with <code>W = 2</code>: the coordinator returns success once <b>two</b> replicas have it. R3 is slow or partitioned and is still on the old value \u2014 and the client has already been told the write succeeded.",
        });
        frames.push({
            stage: rows([["R1", "green", "v2"], ["R2", "green", "v2"], ["R3", "blue", "v1"]], { ...HEAD, "3,1": "is-done", "3,2": "is-done" }),
            note: "Now a read with <code>R = 1</code> that happens to hit R3: it returns <b>blue</b>. The client just read its own write as the old value. <code>W + R = 3</code>, which is <b>not</b> greater than <code>N = 3</code> \u2014 so there is no guaranteed overlap.",
        });
        frames.push({
            stage: rows([["R1", "green", "v2"], ["R2", "green", "v2"], ["R3", "blue", "v1"]], { ...HEAD, "1,1": "is-done", "3,1": "is-done", "1,2": "is-done", "3,2": "is-done" }),
            note: "Read with <code>R = 2</code> instead. Any two replicas must include at least one of the two that took the write \u2014 <b><code>W + R &gt; N</code> guarantees an overlap</b>. The client sees v1 and v2, takes the higher version, and returns <b>green</b>.",
        });
        frames.push({
            stage: rows([["R1", "green", "v2"], ["R2", "green", "v2"], ["R3", "green", "v2"]], { ...HEAD, "3,1": "is-act", "3,2": "is-act" }),
            note: "The coordinator also notices R3 is behind and repairs it \u2014 <b>read repair</b>. Anti-entropy processes do the same in the background for keys nobody happens to read.",
        });
        frames.push({
            stage: rows([["R1", "green", "v2"], ["R2", "down", "\u2014"], ["R3", "down", "\u2014"]], { ...HEAD, "2,1": "is-out", "2,2": "is-out", "3,1": "is-out", "3,2": "is-out" }),
            note: "Two replicas fail. With <code>W = 2</code> writes now fail \u2014 <b>you chose consistency over availability</b>, exactly as CAP describes. Drop to <code>W = 1</code> and writes continue, at the price of conflicts to reconcile later.",
        });
        frames.push({
            stage: rows([["N = 3", "W = 2", "R = 2"], ["strong-ish", "W+R > N", "quorum"], ["fast reads", "W = 3", "R = 1"], ["fast writes", "W = 1", "R = 3"]], { ...HEAD, "1,0": "is-done", "1,1": "is-done", "1,2": "is-done", "3,0": "is-cmp", "3,1": "is-cmp", "3,2": "is-cmp" }),
            note: "<b>Conclusion.</b> <code>W</code> and <code>R</code> are a dial, not a setting: push <code>W</code> up for read-heavy data, push <code>R</code> up for write-heavy data, and keep <code>W + R &gt; N</code> whenever you need the read to see the write. Even then it is not linearizability \u2014 concurrent writes still produce conflicts that need version vectors or last-write-wins to resolve.",
        });
        return frames;
    },
};

/* ---- 33. Distributed tracing ---- */

VIZ["trace-propagation"] = {
    title: "One id that survives every hop",
    legend: [["lg-cmp", "span"], ["lg-act", "the slow one"], ["lg-done", "fast"], ["lg-out", "error"]],
    build() {
        const W = 820;
        const ticks = [{ at: 0, label: "0" }, { at: 0.25, label: "200 ms" }, { at: 0.5, label: "400" },
        { at: 0.75, label: "600" }, { at: 1, label: "800 ms" }];
        const t = (ms) => ms / 800;
        const span = (name, at, ms, state, label) => ({ label: name, marks: [{ at: t(at), width: t(ms), label: label || "", state }] });
        const frames = [];
        frames.push({
            stage: timelineHTML(W, [span("gateway", 0, 760, "n-cmp", "trace 4bf9\u2026 span 01")], ticks),
            note: "A request enters the gateway, which mints a <b>trace id</b> and a root <b>span id</b>. That trace id is the only thing that will let you reassemble this request later.",
        });
        frames.push({
            stage: timelineHTML(W, [
                span("gateway", 0, 760, "n-cmp", "span 01"),
                span("orders", 20, 700, "n-cmp", "span 02, parent 01"),
            ], ticks),
            note: "The gateway calls orders and passes the context in a header \u2014 <code>traceparent: 00-4bf9\u2026-01-01</code>. Orders starts a child span pointing at its parent. <b>Propagating that header is the entire job</b>; miss it in one service and the trace splits into two useless halves.",
        });
        frames.push({
            stage: timelineHTML(W, [
                span("gateway", 0, 760, "n-cmp", ""),
                span("orders", 20, 700, "n-cmp", ""),
                span("pricing", 60, 90, "n-done", "88 ms"),
                span("inventory", 60, 120, "n-done", "115 ms"),
            ], ticks),
            note: "Orders fans out to pricing and inventory <b>in parallel</b> \u2014 and you can see that it is parallel, because the bars overlap. A log file would never have told you that.",
        });
        frames.push({
            stage: timelineHTML(W, [
                span("gateway", 0, 760, "n-cmp", ""),
                span("orders", 20, 700, "n-cmp", ""),
                span("pricing", 60, 90, "n-done", ""),
                span("inventory", 60, 120, "n-done", ""),
                span("db query", 200, 480, "n-act", "470 ms \u2014 here it is"),
            ], ticks),
            note: "And there is the answer: a single database query deep inside orders, taking <code>470 ms</code> of the 760. <b>The waterfall shape is the diagnosis</b> \u2014 a serial gap means a missing parallel call, a long leaf means a slow dependency.",
        });
        frames.push({
            stage: timelineHTML(W, [
                span("gateway", 0, 760, "n-cmp", ""),
                span("orders", 20, 700, "n-cmp", ""),
                span("pricing", 60, 90, "n-done", ""),
                span("inventory", 60, 120, "n-out", "error: stock unknown"),
                span("db query", 200, 480, "n-act", ""),
            ], ticks),
            note: "Attach attributes to spans \u2014 the order id, the customer tier, the SQL statement, the error \u2014 and put the <b>trace id in every log line</b>. One id then takes you from an alert, to a trace, to the exact log lines from five services.",
        });
        frames.push({
            stage: timelineHTML(W, [
                span("gateway", 0, 280, "n-done", "after the fix: 280 ms"),
                span("orders", 20, 230, "n-done", ""),
                span("pricing", 60, 90, "n-done", ""),
                span("inventory", 60, 120, "n-done", ""),
                span("db query", 200, 60, "n-done", "index added"),
            ], ticks),
            note: "<b>Conclusion.</b> Tracing is the only tool that answers &ldquo;where did the time go?&rdquo; across services. Three rules make it work: <b>propagate W3C <code>traceparent</code> everywhere</b> including through queues (put it in the message headers), <b>sample intelligently</b> \u2014 tail-based sampling keeps the slow and failed traces rather than a random 1% \u2014 and <b>correlate logs by trace id</b>, which costs nothing and saves hours.",
        });
        return frames;
    },
};

/* ---- 34. Cache stampede ---- */

VIZ["cache-stampede"] = {
    title: "A thousand requests, one expiry",
    legend: [["lg-done", "cache hit"], ["lg-act", "recomputing"], ["lg-out", "stampede"], ["lg-cmp", "waiting"]],
    options: [
        { value: "naive", label: "Plain TTL cache" },
        { value: "single", label: "Single-flight + refresh" },
    ],
    build(option = "naive") {
        const W = 780;
        const H = 220;
        const draw = (cache, inflight, db, caption) => {
            let s = boxHTML(20, 30, 150, 54, "1000 clients", "n-cmp", "");
            s += boxHTML(230, 30, 160, 54, cache.label, cache.state, "TTL 60 s");
            s += boxHTML(460, 30, 170, 54, "origin / database", db.state, db.sub);
            s += arrowHTML(172, 57, 226, 57, "e-act");
            s += arrowHTML(392, 57, 456, 57, inflight ? "e-act" : "e-idle", inflight);
            if (caption) s += capHTML(20, 190, caption, "start");
            return svgHTML(W, H, s);
        };
        const frames = [];
        if (option === "single") {
            frames.push({
                stage: draw({ label: "hit \u00b7 age 55 s", state: "n-done" }, "", { state: "n-idle", sub: "idle" }, "warm, and about to expire"),
                note: "Same cache, same 1,000 rps, same 60-second TTL. Two changes to the code fix this completely.",
            });
            frames.push({
                stage: draw({ label: "hit \u00b7 age 55 s", state: "n-done" }, "1 refresh", { state: "n-act", sub: "recomputing" }, "probabilistic early expiry"),
                note: "<b>Fix one: refresh early, at random.</b> As the entry ages, each request has a small and growing chance of triggering a refresh \u2014 <code>if rand() &lt; (age / ttl)**4</code>. Someone refreshes it <em>before</em> it expires, while everyone else is still being served the cached value.",
            });
            frames.push({
                stage: draw({ label: "hit \u00b7 fresh", state: "n-done" }, "", { state: "n-idle", sub: "idle" }, "value replaced with no gap"),
                note: "The refreshed value lands before expiry, so <b>the gap where there is nothing to serve never opens</b>. Randomising also desynchronises keys that were all populated at the same moment \u2014 which is what a cold start does to you.",
            });
            frames.push({
                stage: draw({ label: "miss \u00b7 999 waiting", state: "n-cmp" }, "1 call only", { state: "n-act", sub: "1 query" }, "single-flight lock"),
                note: "<b>Fix two: single-flight.</b> When there genuinely is a miss, the first request takes a short lock, and the other 999 <em>wait for its result</em> instead of each querying. <code>1</code> database call, not <code>1000</code>.",
            });
            frames.push({
                stage: draw({ label: "hit \u00b7 all served", state: "n-done" }, "", { state: "n-done", sub: "1 query total" }, "stale-while-revalidate as the safety net"),
                note: "<b>Conclusion.</b> Three cheap techniques cover every stampede: <b>jittered TTLs</b> so keys do not expire together, <b>single-flight</b> so one miss means one recomputation, and <b>stale-while-revalidate</b> so a slow origin degrades into slightly old data instead of an outage. The last one is the most valuable: <em>serving a 61-second-old price is almost always better than serving an error</em>.",
            });
            return frames;
        }
        frames.push({
            stage: draw({ label: "hit \u00b7 age 0 s", state: "n-done" }, "", { state: "n-idle", sub: "idle" }, "99.9% hit rate \u00b7 1000 rps"),
            note: "An expensive query \u2014 800 ms \u2014 cached for 60 seconds and requested 1,000 times a second. The cache absorbs essentially everything and the database is bored.",
        });
        frames.push({
            stage: draw({ label: "hit \u00b7 age 59 s", state: "n-done" }, "", { state: "n-idle", sub: "idle" }, "one second to go"),
            note: "The entry ages. Nothing is wrong yet. This is the state your dashboards show, and it looks perfect.",
        });
        frames.push({
            stage: draw({ label: "EXPIRED", state: "n-out" }, "1000 misses", { state: "n-out", sub: "1000 queries" }, "the TTL elapses"),
            note: "The TTL elapses. In the next millisecond <b>every one of the 1,000 concurrent requests misses</b>, and every one of them independently decides to recompute. The database receives 1,000 copies of an 800 ms query.",
        });
        frames.push({
            stage: draw({ label: "still empty", state: "n-out" }, "queries pile up", { state: "n-out", sub: "connection pool full" }, "800 ms of stampede"),
            note: "The recomputations take 800 ms, so for 800 ms <b>nothing repopulates the cache and new arrivals keep missing too</b>. The connection pool saturates. The cache is now amplifying load rather than absorbing it.",
        });
        frames.push({
            stage: draw({ label: "empty \u00b7 clients timing out", state: "n-out" }, "retries", { state: "n-out", sub: "overloaded" }, "clients time out and retry"),
            note: "Clients time out and retry, adding more load. <b>A 99.9% hit rate became 0% in one millisecond</b>, and your database was provisioned for the 0.1%. This is the classic cache stampede, also called dog-piling.",
        });
        return frames;
    },
};

/* ---- 35. CQRS ---- */

VIZ["cqrs"] = {
    title: "Separating the write model from the read models",
    legend: [["lg-act", "write path"], ["lg-done", "read path"], ["lg-cmp", "projection"], ["lg-out", "lagging"]],
    build() {
        const W = 820;
        const H = 300;
        const draw = (st, caption) => {
            let s = boxHTML(20, 40, 140, 50, "commands", st.cmd, "");
            s += boxHTML(210, 40, 170, 50, "write model", st.write, "normalised, validated");
            s += boxHTML(440, 40, 150, 50, "event log", st.log, "");
            s += boxHTML(660, 20, 140, 44, "search index", st.r1, "");
            s += boxHTML(660, 86, 140, 44, "order history", st.r2, "");
            s += boxHTML(660, 152, 140, 44, "analytics", st.r3, "");
            s += boxHTML(20, 190, 140, 50, "queries", st.query, "");
            s += arrowHTML(162, 65, 206, 65, st.e1 || "e-idle");
            s += arrowHTML(382, 65, 436, 65, st.e2 || "e-idle");
            s += arrowHTML(592, 65, 656, 42, st.e3 || "e-idle");
            s += arrowHTML(592, 70, 656, 108, st.e3 || "e-idle");
            s += arrowHTML(592, 78, 656, 174, st.e3 || "e-idle");
            s += arrowHTML(656, 200, 166, 215, st.e4 || "e-idle");
            if (caption) s += capHTML(20, 288, caption, "start");
            return svgHTML(W, H, s);
        };
        const base = { cmd: "n-idle", write: "n-idle", log: "n-idle", r1: "n-idle", r2: "n-idle", r3: "n-idle", query: "n-idle" };
        const frames = [];
        frames.push({
            stage: draw(base, "one model trying to serve both jobs"),
            note: "Writes and reads want opposite things. Writes want <b>normalisation and constraints</b>; reads want <b>denormalised, pre-joined, query-shaped</b> data. A single schema is a compromise that suits neither \u2014 which is what CQRS notices.",
        });
        frames.push({
            stage: draw({ ...base, cmd: "n-act", write: "n-act", e1: "e-act" }, "commands \u2192 write model"),
            note: "Commands go to the write model, which owns <b>invariants</b>: does this customer exist, is there stock, is the total non-negative. It is normalised because that is what makes constraints enforceable.",
        });
        frames.push({
            stage: draw({ ...base, write: "n-cmp", log: "n-act", e2: "e-act" }, "each change emits an event"),
            note: "Every accepted change emits an event \u2014 via an outbox or CDC, never a dual write. <b>The event log is the seam</b> between the two halves.",
        });
        frames.push({
            stage: draw({ ...base, log: "n-cmp", r1: "n-act", r2: "n-act", r3: "n-act", e3: "e-act" }, "projections build read models"),
            note: "Projections consume the events and maintain <b>purpose-built read models</b>: an Elasticsearch index for search, a flat denormalised table for order history, a columnar store for analytics. Each is disposable and rebuildable from the log.",
        });
        frames.push({
            stage: draw({ ...base, r1: "n-done", r2: "n-done", r3: "n-done", query: "n-done", e4: "e-done" }, "queries hit the shape they need"),
            note: "Queries never touch the write model. Each one hits a store already in the right shape, so the expensive join <b>happened once at write time</b> instead of on every read \u2014 and read load can be scaled entirely independently of write load.",
        });
        frames.push({
            stage: draw({ ...base, r1: "n-out", r2: "n-done", r3: "n-done", query: "n-act", e3: "e-act" }, "search index 400 ms behind"),
            note: "<b>And here is the bill.</b> The projection lags. A user saves an edit and their search results still show the old title. That is not a bug you can fix \u2014 it is the architecture. You handle it in the UI: optimistic updates, read-your-writes routed to the write model, or an honest &ldquo;updating\u2026&rdquo; state.",
        });
        frames.push({
            stage: draw({ ...base, write: "n-cmp", log: "n-cmp", r1: "n-done", r2: "n-done", r3: "n-done", query: "n-done", e1: "e-done", e2: "e-done", e3: "e-done", e4: "e-done" }, "steady state"),
            note: "<b>Conclusion.</b> CQRS pays off when read and write workloads genuinely differ in shape or scale \u2014 and costs you eventual consistency, projection code, and a rebuild story for every read model. <b>Apply it to one aggregate, not to a whole system.</b> &ldquo;We are doing CQRS&rdquo; as an architecture-wide decision is how teams end up with five times the code and no more capability.",
        });
        return frames;
    },
};

/* ---- 36. Three kinds of event ---- */

VIZ["event-flavours"] = {
    title: "What should actually be inside the event?",
    legend: [["lg-act", "the event"], ["lg-done", "consumer state"], ["lg-cmp", "call back"], ["lg-out", "coupling"]],
    build() {
        const pane = (title, items) => ({ title, items, stack: true });
        const frames = [];
        frames.push({
            stage: panesHTML([
                pane("Event notification", [{ text: "{ type: OrderPlaced,", cls: "is-act" }, { text: "  orderId: \"A-4471\" }", cls: "is-act" }, "34 bytes"]),
                pane("Consumer must", [{ text: "GET /orders/A-4471", cls: "is-cmp" }, "\u2192 a synchronous call back", "\u2192 producer must be up"]),
            ]),
            note: "<b>Event notification</b>: the event says only that something happened. Tiny, and it cannot go stale. But the consumer has to call back for details \u2014 so you have reintroduced the runtime coupling you built the event to remove.",
        });
        frames.push({
            stage: panesHTML([
                pane("Event notification", ["good: minimal, no stale data", "good: no schema of consequence"]),
                pane("Bad", [{ text: "N consumers \u2192 N callbacks per event", cls: "is-out" }, { text: "producer down \u2192 consumers stuck", cls: "is-out" }, { text: "&ldquo;what did it look like then?&rdquo; \u2014 unanswerable", cls: "is-out" }]),
            ]),
            note: "It also cannot answer questions about the past: by the time a consumer calls back, the order may have changed again. For auditing or analytics that is fatal.",
        });
        frames.push({
            stage: panesHTML([
                pane("Event-carried state", [{ text: "{ type: OrderPlaced,", cls: "is-act" }, { text: "  orderId, customer, items,", cls: "is-act" }, { text: "  total, currency, placedAt }", cls: "is-act" }, "412 bytes"]),
                pane("Consumer can", [{ text: "act with zero callbacks", cls: "is-done" }, { text: "keep its own local replica", cls: "is-done" }, "work while the producer is down"]),
            ]),
            note: "<b>Event-carried state transfer</b>: the event carries everything a consumer plausibly needs. Now consumers are genuinely autonomous \u2014 they can build a local read model and keep serving through a producer outage.",
        });
        frames.push({
            stage: panesHTML([
                pane("The cost", [{ text: "bigger messages", cls: "is-out" }, { text: "the payload is now a public contract", cls: "is-out" }, { text: "data duplicated into N services", cls: "is-out" }]),
                pane("Which means", ["schema versioning matters a lot", "a field you add is a field you own forever", "consumers see a point-in-time snapshot"]),
            ]),
            note: "The trade is real: <b>every field you publish becomes an API you cannot change carelessly</b>, and the same data now lives in five services. In exchange you get autonomy \u2014 usually the right trade for cross-team boundaries.",
        });
        frames.push({
            stage: panesHTML([
                pane("Event sourcing", [{ text: "OrderPlaced", cls: "is-done" }, { text: "ItemAdded", cls: "is-done" }, { text: "DiscountApplied", cls: "is-done" }, { text: "PaymentCaptured", cls: "is-act" }]),
                pane("Current state is", ["derived by replaying the events", "not stored as a row you overwrite", "auditable and time-travellable"]),
            ]),
            note: "<b>Event sourcing</b> is a different idea entirely: the event log <em>is</em> the database. You never update a row; you append a fact and fold the log to get current state. You get a perfect audit trail and the ability to ask &ldquo;what did this look like on Tuesday?&rdquo;",
        });
        frames.push({
            stage: panesHTML([
                pane("Use it when", [{ text: "history is the product (ledgers, audit)", cls: "is-done" }, { text: "&ldquo;why is it in this state?&rdquo; is asked often", cls: "is-done" }]),
                pane("Avoid when", [{ text: "you just want a queue", cls: "is-out" }, { text: "you cannot version events forever", cls: "is-out" }, { text: "GDPR erasure applies to the data", cls: "is-out" }]),
            ]),
            note: "<b>Conclusion.</b> Default to <b>event-carried state transfer</b> at team boundaries \u2014 autonomy is worth the bytes. Use <b>notification</b> when payloads are sensitive or huge (&ldquo;fetch, don't trust&rdquo;). Reach for <b>event sourcing</b> only where the history genuinely is the product; it is a data-model commitment, not a messaging style, and deleting a customer's data from an immutable log is a problem you inherit on day one.",
        });
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
