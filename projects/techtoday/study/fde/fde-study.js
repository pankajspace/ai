/* ==========================================================================
   TechToday - Forward Deployed Engineer study guide
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
const LANG_KEY = "tt-fde-lang";
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

/* ---- extra render helpers ---- */

const boxHTML = (x, y, w, h, label, state = "n-idle", sub = "") => {
    const dark = state !== "n-idle" ? " n-label-dark" : "";
    return (
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="${state}" stroke-width="2"/>` +
        `<text x="${x + w / 2}" y="${y + h / 2}" class="n-label${dark}">${esc(label)}</text>` +
        (sub ? `<text x="${x + w / 2}" y="${y + h + 14}" class="n-sub">${esc(sub)}</text>` : "")
    );
};

const arrowHTML = (x1, y1, x2, y2, state = "e-idle") => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    const t = (n) => n.toFixed(1);
    const hx = (o) => t(x2 - 9 * Math.cos(a + o));
    const hy = (o) => t(y2 - 9 * Math.sin(a + o));
    return (
        edgeHTML(t(x1), t(y1), t(x2), t(y2), state) +
        edgeHTML(hx(-0.45), hy(-0.45), t(x2), t(y2), state) +
        edgeHTML(hx(0.45), hy(0.45), t(x2), t(y2), state)
    );
};

const captionHTML = (text) => `<div class="viz-caption">${text}</div>`;

/* A row of N evenly spaced labelled boxes across the 640-wide stage.
   Font size shrinks to fit, so word labels never clip the way .cell-box does. */
const laneHTML = (items, y, h = 46, pad = 10, gap = 8) => {
    const n = items.length;
    const w = Math.floor((640 - pad * 2 - gap * (n - 1)) / n);
    return items
        .map((it, i) => {
            const x = pad + i * (w + gap);
            const state = it.state || "n-idle";
            const dark = state !== "n-idle" ? " n-label-dark" : "";
            const size = Math.max(8, Math.min(13, Math.floor((w - 10) / (it.label.length * 0.62))));
            return (
                `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="${state}" stroke-width="2"/>` +
                `<text x="${x + w / 2}" y="${y + h / 2}" class="n-label${dark}" style="font-size:${size}px">${esc(it.label)}</text>` +
                (it.tag ? `<text x="${x + w / 2}" y="${y - 8}" class="n-sub">${esc(it.tag)}</text>` : "") +
                (it.sub ? `<text x="${x + w / 2}" y="${y + h + 14}" class="n-sub">${esc(it.sub)}</text>` : "")
            );
        })
        .join("");
};

const laneLabel = (text, x, y) => `<text x="${x}" y="${y}" class="n-sub">${esc(text)}</text>`;

/* ---- 1. Why pilots die ---- */

VIZ["pilot-gap"] = {
    title: "Eight enterprise AI pilots, six months later",
    legend: [["lg-cmp", "in flight"], ["lg-out", "no measurable impact"], ["lg-done", "in production"]],
    build() {
        const names = ["claims", "KYC", "support", "docs", "forecast", "routing", "intake", "triage"];
        const state = names.map(() => "n-idle");
        const tag = names.map(() => "");
        const frames = [];

        const snap = (note) =>
            frames.push({
                stage: svgHTML(640, 120, laneHTML(names.map((label, i) => ({ label, state: state[i], tag: tag[i] })), 40, 52)),
                note,
            });

        snap("Eight enterprise AI pilots start in the same quarter. Every one has a real sponsor, a real budget and a real problem.");

        names.forEach((_, i) => (state[i] = "n-cmp"));
        snap("Every single one demos beautifully. A model plus a curated slice of data always demos beautifully — <strong>the demo is not the hard part.</strong>");

        const kill = [
            [3, "no access", "The retrieval corpus sits behind a permissions model nobody will grant the vendor. Six weeks lost waiting on a ticket."],
            [7, "drift", "An upstream table gained two columns and quietly changed a unit. Output degrades and nothing alerts."],
            [1, "no evals", "Nobody can say whether this week's prompt is better than last week's, so nobody dares change it."],
            [6, "wrong step", "It automates the step the team liked doing, not the step that actually costs them Tuesday mornings."],
            [4, "security", "The architecture cannot pass review because logs leave the customer's region. Redesign, or die here."],
            [2, "latency", "Four seconds to first token. An agent in a live phone queue needs under one."],
            [0, "no owner", "The pilot team disbanded. There is no on-call rota, so the first outage ends it."],
        ];

        kill.forEach(([i, t, note]) => {
            state[i] = "n-out";
            tag[i] = t;
            snap(note);
        });

        state[5] = "n-done";
        tag[5] = "live";
        snap("One survives. MIT's 2025 enterprise study put the real ratio at roughly <strong>19 in 20 producing no measurable P&amp;L impact</strong> — and notice that <em>not one</em> of these seven died because the model was not smart enough.");

        return frames;
    },
};

/* ---- 2. The engagement loop ---- */

VIZ["engagement-loop"] = {
    title: "The four-stage engagement loop",
    legend: [["lg-act", "current stage"], ["lg-done", "complete"], ["lg-idle", "not started"]],
    build() {
        const stages = [
            ["Discover", 20, "wks 1–3"],
            ["Prototype", 180, "wks 2–8"],
            ["Harden", 340, "mo 3–6"],
            ["Hand off", 500, "mo 6+"],
        ];
        const frames = [];

        const view = (active, doneCount, feedback) => {
            let body = "";
            stages.forEach(([label, x, sub], i) => {
                const state = i === active ? "n-act" : i < doneCount ? "n-done" : "n-idle";
                body += boxHTML(x, 40, 120, 54, label, state, sub);
            });
            for (let i = 0; i < 3; i += 1) {
                const st = i < doneCount - 1 || (i === active - 1) ? "e-done" : "e-idle";
                body += arrowHTML(stages[i][1] + 120, 67, stages[i + 1][1] - 6, 67, st);
            }
            const fb = feedback ? "e-act" : "e-idle";
            body += boxHTML(380, 185, 200, 48, "Platform team", feedback ? "n-cmp" : "n-idle");
            // Hand off feeds patterns down into the platform...
            body += arrowHTML(600, 100, 572, 181, fb);
            // ...and the platform makes the next Discover start further along.
            body += edgeHTML(376, 209, 30, 209, fb);
            body += arrowHTML(30, 209, 30, 100, fb);
            body += `<text x="205" y="228" class="n-sub">extracted patterns ship with the platform</text>`;
            return svgHTML(640, 245, body);
        };

        const snap = (active, done, fb, note) => frames.push({ stage: view(active, done, fb), note });

        snap(-1, 0, false, "Four stages, run in order, then run again. The loop is the job — an FDE who only does one stage is a different role with a different title.");
        snap(0, 0, false, "<strong>Discover.</strong> Weeks one to three are mostly listening: sitting with operators, watching the work, mapping the gap between the documented process and the lived one.");
        snap(0, 0, false, "The output of discovery is <em>not</em> a requirements document. It is a <strong>problem hypothesis you can test with code inside a week</strong>.");
        snap(1, 1, false, "<strong>Prototype.</strong> Something running against real data in the customer's environment. Ugly, internal, and deliberately disposable.");
        snap(1, 1, false, "Its job is to surface the second-order problems that no kickoff meeting mentions: permissions, latency, schema drift, hallucination on the customer's real edge cases.");
        snap(2, 2, false, "<strong>Harden.</strong> Months three to six. Eval notebooks become CI gates, print statements become traces, and you start negotiating with a security team you have never met.");
        snap(2, 2, false, "This stage is where the role stops looking like consulting. Nobody writes a runbook for a system they are about to walk away from.");
        snap(3, 3, false, "<strong>Hand off.</strong> The test of whether the work was real: can the customer's own engineers change it, debug it and deploy it without you?");
        snap(3, 4, true, "The fifth arrow is the one that makes the model economic. Patterns discovered in the field get <strong>extracted into the platform</strong> so the next engagement starts further along.");
        snap(0, 4, true, "Then it starts again — new team, new workflow, same loop. Without the feedback arrow, an FDE org quietly degrades into a consultancy with a worse brand.");

        return frames;
    },
};

/* ---- 3. Documented process vs lived process ---- */

VIZ["discovery-gap"] = {
    title: "The process on the wiki vs the process in the room",
    legend: [["lg-cmp", "documented"], ["lg-act", "discovered"], ["lg-out", "where the pain is"], ["lg-idle", "not seen yet"]],
    build() {
        const doc = ["intake", "triage", "assign", "resolve", "close"];
        const real = [];
        const frames = [];

        const view = () =>
            svgHTML(
                640,
                real.length ? 205 : 100,
                laneLabel("WHAT THE WIKI SAYS", 90, 22) +
                laneHTML(doc.map((label) => ({ label, state: "n-cmp" })), 34, 46) +
                (real.length
                    ? laneLabel("WHAT ACTUALLY HAPPENS", 100, 118) + laneHTML(real, 142, 46)
                    : "")
            );

        const snap = (note) => frames.push({ stage: view(), note });

        snap("Day one. The customer hands you a five-box process diagram. Every enterprise has one, and it is always a summary of what management believes.");

        const steps = [
            ["intake", "n-cmp", "", "You sit with an operator for a morning. Step one matches: a request arrives."],
            ["sheet", "n-act", "hidden", "Then a spreadsheet appears. Sarah maintains it. It is not in the diagram, it is not backed up, and every routing decision depends on it."],
            ["phone Ops", "n-out", "45 min", "A phone call to Ops to check whether the site is actually staffed today. Forty-five minutes of the ninety-minute cycle, every single time."],
            ["triage", "n-cmp", "4 min", "Now the documented triage step — four minutes, and the step the sponsor asked you to automate."],
            ["assign", "n-cmp", "", "Assignment happens exactly as documented."],
            ["rework", "n-out", "1 in 3", "One in three come back, because the phone call caught the staffing problem too late. Nobody counts these; they reopen under a new id."],
            ["resolve", "n-cmp", "", "Resolution."],
            ["close", "n-cmp", "", "And close. The diagram was not wrong — it was just missing everything expensive."],
        ];

        steps.forEach(([label, state, tag, note]) => {
            real.push({ label, state, tag });
            snap(note);
        });

        real[1].state = "n-out";
        real[1].tag = "1 person";
        snap("Three of the eight steps are invisible to the wiki, and <strong>they are the three that cost money</strong>. The sponsor asked you to automate triage — four minutes out of ninety.");
        snap("This is why discovery is engineering work rather than a formality. Build the brief and you ship a 4% improvement nobody notices. Automate the staffing check and the rework loop and you take a third out of cycle time.");

        return frames;
    },
};

/* ---- 4. Ship on day one ---- */

VIZ["ship-day-one"] = {
    title: "What gets shipped in the first week",
    legend: [["lg-act", "today"], ["lg-done", "in the customer's hands"], ["lg-idle", "not yet"]],
    build() {
        const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];
        const state = days.map(() => "n-idle");
        const tag = days.map(() => "");
        const frames = [];

        const snap = (note) =>
            frames.push({
                stage: svgHTML(640, 110, laneHTML(days.map((label, i) => ({ label, state: state[i], tag: tag[i] })), 36, 52)),
                note,
            });

        snap("The consulting default is ninety days of discovery and a deck. The forward-deployed default is a working artefact in week one — even a small, embarrassing one.");

        const plan = [
            ["read-only view", "<strong>Day 1.</strong> Point a read-only connector at one real table and put a filterable list of live records on a screen. No model, no inference. It is worth more than the deck because it proves you can reach their data at all."],
            ["3 entities", "<strong>Day 2.</strong> Name the customer's nouns. Three entity types, their properties, and the two link types that matter. This is the ontology, and everything downstream hangs off it."],
            ["tools + 1 answer", "<strong>Day 3.</strong> Expose those entities as tool calls and ship one grounded answer for one real question an operator asks every day. End to end, ugly, running on their data."],
            ["20 eval cases", "<strong>Day 4.</strong> Sit with the operator and turn twenty of their real cases into an eval set with expected answers. You now have a definition of \"working\" the customer signed off on."],
            ["demo + re-scope", "<strong>Day 5.</strong> Show it to the people who do the work, not just the sponsor. Their reaction re-scopes week two better than any requirements workshop would have."],
        ];

        plan.forEach(([t, note], i) => {
            if (i > 0) state[i - 1] = "n-done";
            state[i] = "n-act";
            tag[i] = t;
            snap(note);
        });

        state[4] = "n-done";
        snap("Five days, five artefacts, and the customer has watched their own data move through your system every day. That is what buys you the right to spend month two on the hard part.");
        snap("The trap is the opposite failure: shipping something so flimsy the customer stops trusting you. <strong>Day one ships narrow, not shoddy</strong> — one workflow done properly beats six half-built ones.");

        return frames;
    },
};

/* ---- 5. Building the ontology ---- */

VIZ["ontology-build"] = {
    title: "From raw tables to a tool surface",
    legend: [["lg-act", "being built"], ["lg-done", "usable"], ["lg-idle", "raw"]],
    build() {
        const frames = [];

        const view = (step) => {
            let body = "";
            const tables = [
                ["ORD_HDR", 20],
                ["CUST_MSTR", 84],
                ["SHIP_EVT", 148],
            ];
            tables.forEach(([label, y]) => {
                body += boxHTML(10, y, 130, 46, label, step >= 1 ? "n-cmp" : "n-idle");
            });
            if (step >= 1) {
                body += `<text x="75" y="228" class="n-sub">3 source systems</text>`;
            }

            const ents = [
                ["Order", 40],
                ["Customer", 104],
                ["Shipment", 168],
            ];
            ents.forEach(([label, y], i) => {
                const st = step >= 2 ? (step >= 3 ? "n-done" : "n-act") : "n-idle";
                body += boxHTML(230, y, 130, 46, label, step >= 2 ? st : "n-idle");
                body += arrowHTML(142, tables[i][1] + 23, 226, y + 23, step >= 2 ? "e-done" : "e-idle");
            });
            if (step >= 2) {
                body += `<text x="295" y="228" class="n-sub">entities the business names out loud</text>`;
            }

            if (step >= 3) {
                body += edgeHTML(240, 86, 240, 104, "e-act");
                body += edgeHTML(240, 150, 240, 168, "e-act");
                body += `<text x="200" y="98" class="n-sub">placed_by</text>`;
                body += `<text x="196" y="162" class="n-sub">fulfilled_by</text>`;
            }

            if (step >= 4) {
                const tools = [
                    ["find_orders()", 40],
                    ["get_status()", 104],
                    ["reroute()", 168],
                ];
                tools.forEach(([label, y]) => {
                    body += boxHTML(440, y, 180, 46, label, step >= 5 ? "n-done" : "n-act");
                    body += arrowHTML(362, y + 23, 436, y + 23, "e-done");
                });
                body += `<text x="530" y="228" class="n-sub">the only surface the model can touch</text>`;
            }

            return svgHTML(640, 250, body);
        };

        const notes = [
            "You arrive to three source systems with names chosen in 1998 by someone who has left. This is the normal starting position, not a pathology.",
            "First move is not modelling — it is reading. <code>ORD_HDR</code> has 214 columns, four of which are populated, and one of which means something different in Germany.",
            "Now name the <strong>nouns the business says out loud</strong>: Order, Customer, Shipment. If an operator would not use the word in a sentence, it is not an entity.",
            "Then the <strong>verbs between them</strong> — the link types. <code>placed_by</code> and <code>fulfilled_by</code> encode joins that currently live in six different analysts' heads and three different spreadsheets.",
            "Only now expose functions over that model. The model never sees <code>ORD_HDR</code>; it sees <code>find_orders(customer, window)</code>.",
            "This is the whole trick. A generic model plus a customer-specific ontology beats a clever prompt over raw tables, every time — because the ontology is where you put the domain knowledge that is not in the training data.",
        ];

        notes.forEach((note, i) => frames.push({ stage: view(i), note }));

        frames.push({
            stage: view(5),
            note: "It also gives you a permissions boundary, an audit surface, and a vocabulary that survives you leaving. Everything an FDE builds after day two sits on this.",
        });

        return frames;
    },
};

/* ---- 6. Grounding pipeline ---- */

VIZ["grounding-pipeline"] = {
    title: "Grounding a model in the customer's documents",
    legend: [["lg-act", "running now"], ["lg-done", "done"], ["lg-idle", "waiting"]],
    build() {
        const ingest = [
            ["source", 50],
            ["chunk", 190],
            ["embed", 330],
            ["index", 470],
        ];
        const serve = [
            ["question", 12],
            ["embed", 116],
            ["search", 220],
            ["rerank", 324],
            ["prompt", 428],
            ["answer", 532],
        ];
        const frames = [];

        const view = (ing, srv, note) => {
            // .n-sub is centre-anchored, so x is the midpoint of the label.
            let body = `<text x="90" y="22" class="n-sub">INGEST — runs on a schedule</text>`;
            ingest.forEach(([label, x], i) => {
                body += boxHTML(x, 32, 120, 44, label, i < ing ? "n-done" : i === ing ? "n-act" : "n-idle");
                if (i < 3) body += arrowHTML(x + 120, 54, ingest[i + 1][1] - 6, 54, i < ing ? "e-done" : "e-idle");
            });
            body += `<text x="85" y="122" class="n-sub">SERVE — runs per question</text>`;
            serve.forEach(([label, x], i) => {
                body += boxHTML(x, 132, 86, 44, label, i < srv ? "n-done" : i === srv ? "n-act" : "n-idle");
                if (i < 5) body += arrowHTML(x + 86, 154, serve[i + 1][1] - 4, 154, i < srv ? "e-done" : "e-idle");
            });
            frames.push({ stage: svgHTML(640, 200, body), note });
        };

        view(-1, -1, "Two pipelines, not one. People conflate them and then wonder why a fix to retrieval requires a full reindex.");
        view(0, -1, "<strong>Source.</strong> 40,000 PDFs on a share drive. The first real question is not chunking — it is <em>which of these does anyone trust?</em> Half will be superseded drafts.");
        view(1, -1, "<strong>Chunk.</strong> Splitting on 800 characters destroys tables and severs a clause from its heading. Chunk on the document's own structure, and keep the heading path in every chunk.");
        view(2, -1, "<strong>Embed.</strong> The embedding model is a customer decision, not a default. If the corpus is German contract law, an English-tuned model quietly loses you ten points of recall.");
        view(3, -1, "<strong>Index.</strong> Store the permissions with the vector. If retrieval can surface a chunk the asking user could not open in SharePoint, you have built a data-leak machine.");
        view(4, 0, "Ingest is done. Now a real question arrives from a real user with a real role attached to it.");
        view(4, 1, "Embed the question with the <em>same</em> model used at ingest. Mixing versions is the single most common silent-failure bug in deployed RAG.");
        view(4, 2, "<strong>Search.</strong> Vector-only search misses exact identifiers — part numbers, policy codes, ticket IDs. Hybrid (vector + keyword) is the default in the field for a reason.");
        view(4, 3, "<strong>Rerank.</strong> Retrieve twenty, rerank, pass five. Cheap to add, and it is usually worth more than swapping the base model.");
        view(4, 4, "<strong>Prompt.</strong> The retrieved chunks go in with their citations. The instruction that matters most: <em>answer only from the passages; if they do not contain it, say so.</em>");
        view(4, 5, "<strong>Answer</strong> — with citations the operator can click. An answer the user cannot verify is an answer the compliance officer will delete.");
        view(4, 6, "Every arrow here is a place the system can be wrong while looking perfectly confident. That is why the next thing you build is not a better prompt — it is an eval harness.");

        return frames;
    },
};

/* ---- 7. Agent loop with a guardrail ---- */

VIZ["agent-loop"] = {
    title: "An agent rerouting a delayed shipment",
    legend: [["lg-act", "acting"], ["lg-cmp", "observing"], ["lg-done", "accepted"], ["lg-out", "blocked"]],
    build() {
        const tools = [
            ["get_shipment()", 30],
            ["get_weather()", 96],
            ["quote_carrier()", 162],
            ["book_reroute()", 228],
        ];
        const frames = [];

        const view = (modelState, activeTool, guard, note) => {
            let body = boxHTML(230, 110, 150, 56, "model", modelState, "plans the next step");
            tools.forEach(([label, y], i) => {
                const st = i === activeTool ? "n-act" : i < activeTool ? "n-done" : "n-idle";
                body += boxHTML(440, y, 180, 46, label, st);
                body += arrowHTML(384, 138, 436, y + 23, i === activeTool ? "e-act" : i < activeTool ? "e-done" : "e-idle");
            });
            const gs = guard === "block" ? "n-out" : guard === "pass" ? "n-done" : "n-idle";
            body += boxHTML(40, 110, 170, 56, "guardrails", gs, "cost cap · allowlist · sign-off");
            body += arrowHTML(226, 138, 214, 138, guard ? (guard === "block" ? "e-act" : "e-done") : "e-idle");
            frames.push({ stage: svgHTML(640, 290, body), note });
        };

        view("n-act", -1, null, "The agent loop is three lines of logic: the model proposes a tool call, you run it, you feed the result back. Everything hard is in the boundaries around it.");
        view("n-act", 0, null, "Turn 1. The model asks for the shipment record. Notice it does not get a database connection — it gets a <em>named function</em> you wrote and can audit.");
        view("n-cmp", 0, null, "You run the tool and append the result to the conversation. This is the observation step, and it is where token budgets die if you paste raw JSON blobs back in.");
        view("n-act", 1, null, "Turn 2. Weather at the destination hub. Each tool call is a chance for the run to diverge, which is why you cap the number of turns.");
        view("n-cmp", 1, null, "Observed: storm closure, 14 hours. The model now has enough to form a plan.");
        view("n-act", 2, null, "Turn 3. It quotes an alternative carrier — $4,180 for next-day air.");
        view("n-act", 2, "block", "<strong>Blocked.</strong> The guardrail, not the model, enforces the $2,000 per-shipment cap. Policy that lives in a prompt is a suggestion; policy that lives in code is a control.");
        view("n-cmp", 2, "block", "The rejection goes back to the model as an observation, with the reason. Told <em>why</em> it was blocked, a model will usually replan rather than loop.");
        view("n-act", 3, null, "Turn 4. Ground freight via the secondary hub, $860, arrives 11 hours late instead of 38.");
        view("n-done", 3, "pass", "Under the cap, carrier on the allowlist, route within policy. The guardrail passes and the booking tool executes.");
        view("n-done", 3, "pass", "One more control matters for anything that spends money or touches a customer: <strong>human sign-off above a threshold</strong>. Autonomy is a dial, and the customer sets it, not you.");
        view("n-done", 3, "pass", "Write down the whole run — prompts, tool calls, observations, decision — as a trace. In six months that trace is the only way anyone will explain this booking to an auditor.");

        return frames;
    },
};

/* ---- 8. Eval harness ---- */

VIZ["eval-harness"] = {
    title: "An eval suite catching a regression",
    legend: [["lg-done", "pass"], ["lg-out", "fail"], ["lg-act", "under change"], ["lg-idle", "not run"]],
    build() {
        const what = ["standard", "no policy no.", "expired cover", "duplicate", "umlauts", "over limit"];
        const tags = Object.fromEntries(what.map((_, i) => [i, `EV-${i + 1}`]));
        const key = captionHTML(what.map((w, i) => `<b>EV-${i + 1}</b> ${w}`).join(" &nbsp;·&nbsp; "));
        const frames = [];
        const blank = ["–", "–", "–", "–", "–", "–"];
        const dim = Object.fromEntries(what.map((_, i) => [i, "is-dim"]));

        const row = (label, values, marks) =>
            captionHTML(label) + cellsHTML(values, marks, tags);

        const snap = (stage, note) => frames.push({ stage: stage + key, note });

        snap(row("golden set — 6 of 340 cases", blank, dim),
            "The eval set is not invented at a desk. Every row came from a real case an operator walked you through, with the answer <em>they</em> said was right.");

        snap(row("golden set — 6 of 340 cases", blank, { ...dim, 2: "is-active" }),
            "<code>EV-3</code> exists because the model once approved an expired policy in front of the head of claims. Field failures become test cases, permanently.");

        const v1 = ["pass", "pass", "pass", "pass", "fail", "pass"];
        const v1m = { 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-out", 5: "is-done" };
        snap(row("v1 — 5 / 6", v1, v1m),
            "Run v1. It fails <code>EV-5</code>: German umlauts break a naive normalisation step. Useful — you now have a number instead of an opinion.");

        snap(row("v1 — 5 / 6", v1, { ...v1m, 4: "is-out", 1: "is-active" }),
            "You fix normalisation, and while you are in there you also tidy the system prompt. This is the moment that eats deployments.");

        const v2 = ["pass", "pass", "fail", "pass", "pass", "pass"];
        const v2m = { 0: "is-done", 1: "is-done", 2: "is-out", 3: "is-done", 4: "is-done", 5: "is-done" };
        snap(row("v1 — 5 / 6", v1, v1m) + row("v2 — 5 / 6", v2, v2m),
            "v2 fixes <code>EV-5</code> and <strong>breaks <code>EV-3</code></strong>. Same score, different failure. Without the suite you would have shipped this and heard about it from the head of claims again.");

        snap(row("v1 — 5 / 6", v1, v1m) + row("v2 — 5 / 6", v2, { ...v2m, 2: "is-out" }),
            "Aggregate scores hide this completely. Always diff <em>per case</em>, v1 against v2 — a cell that went green-to-red is a release blocker regardless of the total.");

        const v3 = ["pass", "pass", "pass", "pass", "pass", "pass"];
        const v3m = Object.fromEntries(what.map((_, i) => [i, "is-done"]));
        snap(row("v2 — 5 / 6", v2, v2m) + row("v3 — 6 / 6", v3, v3m),
            "v3 passes all six. Now wire the suite into CI so a prompt change cannot merge without it — the prompt is production code and deserves the same gate.");

        snap(row("v3 — 6 / 6", v3, { ...v3m, 5: "is-active" }),
            "Pick the grader per case. Exact match for <code>escalate</code>, a structured-field check for extraction, and a model-graded rubric only where the answer is genuinely open-ended.");

        snap(row("v3 — 6 / 6 · full suite 340 cases", v3, v3m),
            "Three hundred and forty cases sounds like a lot until you price one wrong decline letter. The suite is also the artefact you hand over — it is how the customer keeps the system honest after you leave.");

        return frames;
    },
};

/* ---- 9. The integration wall ---- */

VIZ["integration-wall"] = {
    title: "Getting a working prototype into production",
    legend: [["lg-act", "current blocker"], ["lg-done", "cleared"], ["lg-out", "blocked"]],
    build() {
        const gates = [
            ["identity", "identity — SSO / SCIM", "Your prototype has one API key. Production needs OIDC, group-based authorisation and de-provisioning when someone leaves."],
            ["network", "network — egress rules", "There is no route from the customer's subnet to your API. Getting one opened means a firewall change request with a named business owner."],
            ["residency", "data residency", "Prompts and completions are personal data. If the contract says EU-only, an inference endpoint in us-east-1 is a contract breach, not a latency problem."],
            ["security", "security review", "A questionnaire, a threat model, a pen-test window, and a sub-processor list. Start it in week two, not week twenty."],
            ["change", "change management", "A CAB that meets on Thursdays, a rollback plan, and a named on-call human. Miss Thursday and you miss a week."],
        ];
        const frames = [];

        const view = (cleared, active) => {
            let body = boxHTML(10, 90, 120, 56, "prototype", "n-done", "works on your laptop");
            gates.forEach(([short], i) => {
                const st = i < cleared ? "n-done" : i === active ? "n-out" : "n-idle";
                const x = 150 + i * 88;
                body += `<rect x="${x}" y="40" width="70" height="160" rx="6" class="${st}" stroke-width="2"/>`;
                body += `<text x="${x + 35}" y="215" class="n-sub">${esc(short)}</text>`;
            });
            body += boxHTML(596, 90, 34, 56, "prod", cleared >= 5 ? "n-done" : "n-idle");
            const tipX = 130 + Math.min(cleared, 5) * 88;
            body += arrowHTML(130, 118, Math.min(tipX + 14, 592), 118, cleared >= 5 ? "e-done" : "e-act");
            return svgHTML(640, 230, body);
        };

        frames.push({
            stage: view(0, -1),
            note: "The prototype works. Everyone is delighted. You are now roughly 20% of the way to production, and the remaining 80% has nothing to do with the model.",
        });

        gates.forEach(([, label, note], i) => {
            frames.push({ stage: view(i, i), note: `<strong>${esc(label)}.</strong> ${note}` });
            frames.push({ stage: view(i + 1, -1), note: `Cleared. Note what cleared it: a named person in the customer's org who owed you a favour, or a document you wrote. Neither is code.` });
        });

        frames.push({
            stage: view(5, -1),
            note: "Five gates, and the only one an engineer instinctively prepares for is the security review. <strong>Run them in parallel from week two</strong> — they are queues, and queues compose badly in series.",
        });
        frames.push({
            stage: view(5, -1),
            note: "This wall is also why FDE tooling choices look conservative. Every dependency you add is one more line on the sub-processor list and one more question you have to answer on a Thursday.",
        });

        return frames;
    },
};

/* ---- 10. Deployment topologies ---- */

VIZ["deploy-topology"] = {
    title: "Where the system actually runs",
    legend: [["lg-done", "customer-controlled"], ["lg-cmp", "vendor-controlled"], ["lg-out", "the risk"]],
    options: [
        { value: "saas", label: "Vendor SaaS" },
        { value: "vpc", label: "Customer VPC" },
        { value: "onprem", label: "On-premises" },
    ],
    build(option) {
        const mode = option || "saas";
        const frames = [];

        const view = (cfg, risk) => {
            let body = `<rect x="10" y="20" width="300" height="180" rx="10" class="n-idle" stroke-width="2"/>` +
                `<text x="160" y="40" class="n-sub">CUSTOMER BOUNDARY</text>` +
                `<rect x="330" y="20" width="300" height="180" rx="10" class="n-idle" stroke-width="2"/>` +
                `<text x="480" y="40" class="n-sub">VENDOR BOUNDARY</text>`;
            cfg.forEach(([label, side, state, row]) => {
                const x = side === "c" ? 30 : 350;
                body += boxHTML(x, 56 + row * 52, 260, 42, label, state);
            });
            if (risk) body += `<text x="320" y="222" class="n-sub">${esc(risk)}</text>`;
            return svgHTML(640, 236, body);
        };

        if (mode === "saas") {
            const steps = [
                [[["data", "c", "n-done", 0]], "", "The default and the fastest to stand up: the customer's data stays put, everything else is yours."],
                [[["data", "c", "n-done", 0], ["inference API", "v", "n-cmp", 0]], "", "Inference runs on your endpoint. You get the newest models, autoscaling and none of the GPU capacity planning."],
                [[["data", "c", "n-done", 0], ["inference API", "v", "n-cmp", 0], ["app + orchestration", "v", "n-cmp", 1]], "", "Orchestration and the app also sit vendor-side. One deploy pipeline, one on-call rota, one place to fix a bug for every customer."],
                [[["data", "c", "n-done", 0], ["inference API", "v", "n-cmp", 0], ["app + orchestration", "v", "n-cmp", 1], ["traces + evals", "v", "n-cmp", 2]], "prompts and completions cross the boundary", "But every prompt crosses the boundary, and prompts contain the data. That single sentence is what kills this topology in regulated accounts."],
                [[["data", "c", "n-done", 0], ["inference API", "v", "n-out", 0], ["app + orchestration", "v", "n-cmp", 1], ["traces + evals", "v", "n-out", 2]], "residency · retention · sub-processors", "Three questions decide it: where is data processed, how long are prompts retained, and is the model provider an approved sub-processor? Get these in writing in week one."],
                [[["data", "c", "n-done", 0], ["inference API", "v", "n-cmp", 0], ["app + orchestration", "v", "n-cmp", 1], ["traces + evals", "v", "n-cmp", 2]], "", "Pick it when the data is not regulated and speed matters more than control. Most successful deployments start here and only move when a specific rule forces them."],
            ];
            steps.forEach(([cfg, risk, note]) => frames.push({ stage: view(cfg, risk), note }));
        } else if (mode === "vpc") {
            const steps = [
                [[["data", "c", "n-done", 0]], "", "The regulated-industry compromise, and the most common shape an FDE actually ships in 2026."],
                [[["data", "c", "n-done", 0], ["app + orchestration", "c", "n-done", 1]], "", "Your application code runs <em>inside the customer's cloud account</em>. Their VPC, their IAM, their audit log. Data never leaves."],
                [[["data", "c", "n-done", 0], ["app + orchestration", "c", "n-done", 1], ["traces + evals", "c", "n-done", 2]], "", "Traces stay inside too, which matters more than teams expect — a trace contains the full prompt, and the full prompt contains the record."],
                [[["data", "c", "n-done", 0], ["app + orchestration", "c", "n-done", 1], ["traces + evals", "c", "n-done", 2], ["model weights / endpoint", "v", "n-cmp", 0]], "private link, no public egress", "Only the model call crosses, over a private link to a regional endpoint — or to the customer's own managed-model service, which is cleaner still."],
                [[["data", "c", "n-done", 0], ["app + orchestration", "c", "n-out", 1], ["traces + evals", "c", "n-done", 2], ["model weights / endpoint", "v", "n-cmp", 0]], "you cannot ssh into it", "The cost lands on you: you cannot log in and look. Debugging happens through whatever telemetry you had the foresight to emit, reviewed by someone else."],
                [[["data", "c", "n-done", 0], ["app + orchestration", "c", "n-done", 1], ["traces + evals", "c", "n-done", 2], ["model weights / endpoint", "v", "n-cmp", 0]], "one deploy per customer", "And upgrades fragment: eleven customers means eleven versions in the wild. Invest in a boring, scripted, identical deploy from the first account."],
            ];
            steps.forEach(([cfg, risk, note]) => frames.push({ stage: view(cfg, risk), note }));
        } else {
            const steps = [
                [[["data", "c", "n-done", 0]], "", "Air-gapped or fully on-premises. Defence, classified work, some hospital estates, some national infrastructure."],
                [[["data", "c", "n-done", 0], ["open-weight model", "c", "n-done", 1]], "", "The frontier API is simply unavailable. You run open weights on hardware the customer owns, served through vLLM or equivalent."],
                [[["data", "c", "n-done", 0], ["open-weight model", "c", "n-done", 1], ["app + evals + traces", "c", "n-done", 2]], "", "Everything is inside. Nothing crosses. There is no vendor side of this diagram at all."],
                [[["data", "c", "n-done", 0], ["open-weight model", "c", "n-out", 1], ["app + evals + traces", "c", "n-done", 2]], "smaller model · GPU capacity is finite", "So you design for a weaker model. More retrieval, tighter tools, narrower tasks, more human checkpoints — engineering compensating for capability."],
                [[["data", "c", "n-done", 0], ["open-weight model", "c", "n-done", 1], ["app + evals + traces", "c", "n-done", 2]], "updates arrive on a USB drive", "Releases ship as signed artefacts, installed by cleared staff on their schedule. Your feedback loop is measured in weeks, so the evals have to be right before the artefact leaves."],
                [[["data", "c", "n-done", 0], ["open-weight model", "c", "n-done", 1], ["app + evals + traces", "c", "n-done", 2]], "", "It is the hardest topology and the most defensible business. It is also where Palantir's two-decade head start still shows."],
            ];
            steps.forEach(([cfg, risk, note]) => frames.push({ stage: view(cfg, risk), note }));
        }

        return frames;
    },
};

/* ---- 11. Trace waterfall ---- */

VIZ["trace-waterfall"] = {
    title: "One slow request, span by span",
    legend: [["lg-act", "under inspection"], ["lg-out", "the problem"], ["lg-done", "fixed"], ["lg-aux", "unchanged"]],
    build() {
        const labels = ["auth", "retrieve", "rerank", "llm", "tool", "render"];
        const frames = [];

        const snap = (values, marks, note) =>
            frames.push({
                stage: barsHTML(values, marks) + captionHTML(labels.map((l, i) => `${l} ${values[i]}ms`).join(" &nbsp;·&nbsp; ") + ` &nbsp;=&nbsp; <b>${values.reduce((a, b) => a + b, 0)}ms</b>`),
                note,
            });

        const base = [40, 180, 90, 1400, 320, 60];
        snap(base, {}, "The complaint is never \"p95 is 2.1 seconds\". It is \"it feels slow\" from a supervisor who has stopped using it. A trace turns that into a number you can act on.");
        snap(base, { 3: "is-act" }, "Six spans on one request. The instinct is to optimise retrieval because that is the part you wrote — but retrieval is 180ms of 2,090ms.");
        snap(base, { 3: "is-out" }, "<strong>The model call is 67% of the budget.</strong> Measure before you tune; the bottleneck is almost never where the last person to guess said it was.");
        snap(base, { 3: "is-out", 4: "is-act" }, "The tool call is second at 320ms — a synchronous call to a mainframe-backed API that nobody can make faster. Design around it rather than through it.");
        snap([40, 180, 90, 900, 320, 60], { 3: "is-cmp" }, "First change: stream the response. Total time is unchanged, but <em>time to first token</em> drops and the interface stops feeling dead. Perceived latency is the one users report.");
        snap([40, 180, 90, 620, 320, 60], { 3: "is-cmp" }, "Second: cache the static prefix of the prompt. The system prompt and the schema are identical on every call — caching them cuts both latency and spend.");
        snap([40, 180, 90, 620, 40, 60], { 4: "is-done" }, "Third: the tool result is stable for an hour. Cache it and the mainframe round-trip disappears from the hot path entirely.");
        snap([40, 180, 90, 380, 40, 60], { 3: "is-done", 4: "is-done" }, "Fourth: route the easy 70% of requests to a smaller model and reserve the frontier model for the hard 30%. Evals tell you where that line sits.");
        snap([40, 180, 90, 380, 40, 60], { 0: "is-aux", 1: "is-aux", 2: "is-aux", 3: "is-done", 4: "is-done", 5: "is-aux" }, "790ms, down from 2,090ms, and you touched nothing the customer's team maintains. Attach cost to the same trace and the same picture tells you the unit economics.");

        return frames;
    },
};

/* ---- 12. The decomposition interview ---- */

VIZ["decomposition"] = {
    title: "Decomposing an ambiguous brief",
    legend: [["lg-cmp", "the brief"], ["lg-act", "being explored"], ["lg-done", "the MVP"], ["lg-out", "deferred"]],
    build() {
        const frames = [];
        let items = [{ label: "reduce 999 response time", state: "n-cmp" }];

        const snap = (note) => frames.push({ stage: svgHTML(640, 120, laneHTML(items, 44, 52)), note });

        snap("Sixty minutes, a whiteboard, and one sentence. They have call data, traffic data and ambulance GPS. Most strong engineers fail here, and they fail in the first ninety seconds.");

        items = [{ label: "reduce 999 response time", state: "n-cmp", tag: "do NOT start building" }];
        snap("The failure is reaching for a solution — \"train a model to predict traffic\". You have just optimised something without knowing whether dispatch is even the bottleneck.");

        items = [
            { label: "which metric?", state: "n-act" },
            { label: "which user?", state: "n-act" },
            { label: "what data?", state: "n-act" },
            { label: "what constraint?", state: "n-act" },
        ];
        snap("Start by interviewing the interviewer. Four questions, and each answer can invalidate half your design.");

        items[0].tag = "call→on-scene";
        snap("<strong>Define the metric.</strong> Call-to-dispatch is 40 seconds and already good. Call-to-on-scene is 11 minutes. Optimise the first and you win nothing.");

        items[1].tag = "dispatcher";
        snap("<strong>Name the user.</strong> A dispatcher under load with two screens already open. Anything that adds a third screen will not be used, whatever it does.");

        items[2].tag = "8% dark";
        snap("<strong>Interrogate the data.</strong> GPS pings every 30 seconds with 8% of units dark at any moment. That kills any design assuming a live position for every vehicle.");

        items[3].tag = "12 wks, no kit";
        snap("<strong>Get the constraint.</strong> Twelve weeks and no new hardware in vehicles. Now you know which half of your ideas are fiction.");

        items = [
            { label: "ingest + join", state: "n-act" },
            { label: "live visibility", state: "n-act" },
            { label: "assignment", state: "n-act" },
            { label: "prediction", state: "n-act" },
        ];
        snap("Now decompose. Four sub-problems, ordered by dependency: nothing works without ingest, and prediction is worthless without the three before it.");

        items = [
            { label: "ingest + join", state: "n-done", tag: "v1" },
            { label: "live visibility", state: "n-done", tag: "v1" },
            { label: "assignment", state: "n-out", tag: "v2" },
            { label: "prediction", state: "n-out", tag: "v3" },
        ];
        snap("<strong>Propose the boring MVP.</strong> Ingest plus one map showing every unit and every open incident. No model at all. Dispatchers currently reconstruct that picture from two systems and a phone call.");
        snap("This is the answer that passes. It is shippable in twelve weeks, it is verifiable, and it produces the labelled data any future model would need.");

        items[2] = { label: "assignment", state: "n-act", tag: "rules first" };
        snap("Then take the push-back. \"What about assignment?\" — a nearest-available rule you can explain to a dispatcher, measured against their manual choices. If the rule wins, ship it; if it loses, you have learned why.");

        items[2] = { label: "assignment", state: "n-done" };
        items[3] = { label: "prediction", state: "n-act", tag: "only if 1–3 pay" };
        snap("Prediction goes last and may never be justified. Saying that out loud is a signal, not a weakness — it shows you optimise for the outcome rather than for the interesting problem.");

        items = items.map((it) => ({ label: it.label, state: "n-done" }));
        snap("Scored on: did you scope before solving, did you sequence by dependency, did you propose something shippable, and did you change your mind when given new information. Not on whether you said the word \"Kafka\".");

        return frames;
    },
};

/* ---- 13. Handover and the bus factor ---- */

VIZ["handover"] = {
    title: "Who can fix this at 2am?",
    legend: [["lg-act", "you alone"], ["lg-cmp", "shared"], ["lg-done", "customer owns it"], ["lg-out", "danger"]],
    build() {
        const frames = [];
        const snap = (values, marks, note) =>
            frames.push({
                stage: barsHTML(values, marks) + captionHTML("month 1 &nbsp;→&nbsp; month 8 &nbsp;·&nbsp; people who can diagnose and deploy a fix unaided"),
                note,
            });

        snap([1, 0, 0, 0, 0, 0, 0, 0], { 0: "is-act" }, "Month one. Exactly one person on earth understands the system, and it is you. That is normal and temporary — or it is normal and permanent, which is how FDE programmes fail.");
        snap([1, 1, 0, 0, 0, 0, 0, 0], { 0: "is-act", 1: "is-act" }, "Month two, still one. The customer's engineers are not in the repo because you have been moving too fast to let them in, and every hour spent explaining feels like an hour not shipping.");
        snap([1, 1, 1, 0, 0, 0, 0, 0], { 0: "is-out", 1: "is-out", 2: "is-out" }, "Month three and still one. <strong>This is the hero trap.</strong> The customer is now happy <em>with you</em> rather than with the system, and that feels like success right up until you get reassigned.");
        snap([1, 1, 1, 2, 0, 0, 0, 0], { 3: "is-cmp" }, "The fix starts with a runbook: the five things that break, the symptom of each, and the exact command that fixes it. Write it from your own incidents — you have had five by now.");
        snap([1, 1, 1, 2, 2, 0, 0, 0], { 3: "is-cmp", 4: "is-cmp" }, "Then pair on a real change, with their hands on the keyboard. Watching you deploy teaches nobody anything; doing the deploy while you watch teaches everything.");
        snap([1, 1, 1, 2, 2, 3, 0, 0], { 5: "is-cmp" }, "Give away the pager next. Let their engineer take primary on-call with you as secondary for two weeks. The first page they handle alone is the real handover.");
        snap([1, 1, 1, 2, 2, 3, 4, 0], { 6: "is-cmp" }, "Hand over the eval suite with it. Without evals the customer can keep the system running but cannot safely change it — which means it freezes and slowly rots.");
        snap([1, 1, 1, 2, 2, 3, 4, 5], { 7: "is-done" }, "Month eight: five people, and your name is not required. The measure of the engagement is not what you shipped — it is what still works, and still changes, ninety days after you leave.");

        return frames;
    },
};

/* ---- 14. Field pattern to platform feature ---- */

VIZ["platform-feedback"] = {
    title: "When a one-off becomes a product",
    legend: [["lg-act", "custom build"], ["lg-cmp", "extracted"], ["lg-done", "platform feature"], ["lg-out", "unpaid tax"]],
    build() {
        const names = ["bank A", "insurer B", "hospital C", "retailer D", "utility E"];
        const state = names.map(() => "n-idle");
        const tag = names.map(() => "");
        const frames = [];

        const snap = (note) =>
            frames.push({
                stage: svgHTML(640, 120, laneHTML(names.map((label, i) => ({ label, state: state[i], tag: tag[i] })), 42, 52)),
                note,
            });

        snap("Five accounts, five FDEs, five separate repositories. Nobody has read anybody else's.");

        state[0] = "n-act";
        tag[0] = "SAML mapper";
        snap("Bank A needed a SAML group-to-role mapper. You wrote one in two days. Entirely reasonable — it was a one-off.");

        state[1] = "n-act";
        tag[1] = "SAML mapper";
        snap("Insurer B needed the same thing. A different FDE wrote a second one, slightly differently, because they did not know the first existed.");

        state[2] = "n-act";
        tag[2] = "SAML mapper";
        snap("Hospital C: three now. <strong>Three is the signal.</strong> Once is a one-off, twice is a coincidence, three times is a missing platform feature.");

        state[0] = state[1] = state[2] = "n-out";
        snap("Left alone this compounds into unpaid tax: three implementations to patch when the IdP changes, three sets of bugs, and three FDEs who cannot be moved off their account.");

        state[3] = "n-cmp";
        tag[3] = "extract";
        snap("So extract it. Take the intersection, not the union — the 80% genuinely common, with hooks for the 20% that is not. Union-shaped abstractions are how platforms become unusable.");

        [0, 1, 2, 3].forEach((i) => {
            state[i] = "n-done";
            tag[i] = "platform";
        });
        snap("Migrate the three accounts onto it. Unglamorous, invisible to customers, and the single highest-leverage week in the quarter.");

        state[4] = "n-done";
        tag[4] = "day 1";
        snap("Utility E gets it on day one, and their FDE spends that fortnight on the customer's actual problem instead. <strong>That compounding is the entire economic case for forward deployment.</strong>");
        snap("Drop the feedback arrow and the maths inverts: cost per customer stays flat while contract sizes do not. That is a consultancy, and it is valued like one.");

        return frames;
    },
};

/* ==========================================================================
   Advanced course widgets
   ========================================================================== */

/* ---- A1. KV cache ---- */

VIZ["kv-cache"] = {
    title: "Decoding token by token, with and without a KV cache",
    legend: [["lg-done", "cached K/V"], ["lg-cmp", "recomputed this step"], ["lg-act", "token being produced"], ["lg-idle", "not generated yet"]],
    options: [
        { value: "cached", label: "With KV cache" },
        { value: "naive", label: "No cache" },
    ],
    build(option) {
        const cached = option !== "naive";
        const toks = ["Claim", "C-77001", "is", "overdue", "by", "three", "days"];
        const prompt = 3;
        const frames = [];
        let work = 0;

        const snap = (i, note) => {
            const marks = {};
            toks.forEach((_, j) => {
                if (j < i) marks[j] = cached ? "is-done" : "is-cmp";
                else if (j === i) marks[j] = "is-active";
                else marks[j] = "is-ghost";
            });
            frames.push({
                stage: cellsHTML(toks, marks) + captionHTML(`attention work so far: <b>${work}</b> token-positions`),
                note,
            });
        };

        work = prompt;
        snap(prompt, `Three prompt tokens are encoded in one pass. Now the model must emit token ${prompt + 1}, and to do that it needs a key and a value vector for <em>every</em> earlier position.`);

        for (let i = prompt + 1; i < toks.length; i++) {
            work += cached ? 1 : i;
            snap(
                i,
                cached
                    ? `Cached: the K/V for positions <code>0..${i - 1}</code> were computed once and kept in GPU memory. This step computes K/V for <strong>one</strong> new position and attends over the rest. Cost per token is flat.`
                    : `No cache: every earlier position is projected again from scratch — <code>${i}</code> of them this step. Cost per token grows linearly with what you have already written, so the answer gets slower as it gets longer.`
            );
        }

        frames.push({
            stage: cellsHTML(toks, Object.fromEntries(toks.map((_, j) => [j, cached ? "is-done" : "is-cmp"]))) +
                captionHTML(`total attention work: <b>${work}</b> token-positions`),
            note: cached
                ? "Total work is linear in the sequence. The price is memory: the cache is roughly <code>2 &times; layers &times; heads &times; head_dim &times; seq_len</code> bytes per request, which is why a self-hosted deployment runs out of VRAM long before it runs out of FLOPs, and why batch size and context length trade against each other."
                : "Total work is quadratic. Nobody serves this way — but the shape matters to you, because it is the same shape as a prompt you rebuild from scratch on every turn. <strong>Provider prompt caching is this optimisation exposed as an API</strong>: keep the long, stable prefix byte-identical and you get the cached price.",
        });

        return frames;
    },
};

/* ---- A2. Context budget ---- */

VIZ["context-budget"] = {
    title: "Packing a 32k context window",
    legend: [["lg-done", "fits and earns its place"], ["lg-act", "being changed"], ["lg-out", "overflow or waste"], ["lg-idle", "untouched"]],
    build() {
        const frames = [];
        const snap = (parts, note, total, cap = 32) =>
            frames.push({
                stage:
                    svgHTML(640, 120, laneHTML(parts.map((p) => ({ label: p[0], state: p[2], tag: p[1] })), 40, 54)) +
                    captionHTML(`total <b>${total.toFixed(1)}k</b> of ${cap}k &nbsp;·&nbsp; you pay for all of it, every turn`),
                note,
            });

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "2.4k", "n-done"], ["history", "6.0k", "n-done"], ["retrieved", "9.0k", "n-done"], ["question", "0.1k", "n-done"]],
            "A working layout. Note the order: stable content first, volatile content last — that is what makes prefix caching possible.",
            18.4
        );

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "2.4k", "n-done"], ["history", "6.0k", "n-done"], ["retrieved", "24.0k", "n-act"], ["question", "0.1k", "n-done"]],
            "Recall is poor, so somebody widens retrieval from 6 chunks to 20. This is the single most common reflex in a struggling RAG system.",
            33.4
        );

        snap(
            [["system", "0.9k", "n-out"], ["tool schemas", "2.4k", "n-done"], ["history", "6.0k", "n-done"], ["retrieved", "24.0k", "n-out"], ["question", "0.1k", "n-done"]],
            "It overflows. Whatever truncation your framework does silently now decides what the model sees — and frameworks usually drop from the <em>front</em>, which is exactly where your system prompt lives.",
            33.4
        );

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "2.4k", "n-done"], ["history", "6.0k", "n-done"], ["retrieved", "24.0k", "n-out"], ["question", "0.1k", "n-done"]],
            "Even when it fits, accuracy drops. Models attend well to the start and end of the window and weakly to the middle — <strong>lost in the middle</strong>. Chunks 8 to 15 are being paid for and not read.",
            33.4
        );

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "2.4k", "n-done"], ["history", "6.0k", "n-done"], ["reranked", "3.6k", "n-act"], ["question", "0.1k", "n-done"]],
            "The real fix is upstream: retrieve 40 candidates, rerank with a cross-encoder, keep 6. Precision comes from the reranker, not the window size.",
            13.0
        );

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "1.1k", "n-act"], ["history", "1.4k", "n-act"], ["reranked", "3.6k", "n-done"], ["question", "0.1k", "n-done"]],
            "Then prune the rest: only load the tool schemas this step can use, and replace turn-by-turn history with a rolling summary plus the last two turns verbatim.",
            7.1
        );

        snap(
            [["system", "0.9k", "n-done"], ["tool schemas", "1.1k", "n-done"], ["history", "1.4k", "n-done"], ["reranked", "3.6k", "n-done"], ["question", "0.1k", "n-done"]],
            "7.1k instead of 33.4k: about a fifth of the cost, a visibly faster first token, and <em>higher</em> accuracy. <strong>Context is a budget you spend, not a bucket you fill.</strong>",
            7.1
        );

        return frames;
    },
};

/* ---- A3. Chunking ---- */

VIZ["chunking"] = {
    title: "Where you cut the document decides what you can retrieve",
    legend: [["lg-cmp", "one chunk"], ["lg-act", "the sentence that answers the question"], ["lg-out", "fact split in half"], ["lg-done", "retrieved"]],
    options: [
        { value: "fixed", label: "Fixed size, no overlap" },
        { value: "overlap", label: "Fixed size + overlap" },
        { value: "semantic", label: "Structure-aware" },
    ],
    build(option) {
        const s = ["§4.1", "Late", "fees", "apply", "when", "a", "claim", "passes", "SLA.", "The", "fee", "is", "2%", "per", "day.", "§4.2", "Appeals"];
        const frames = [];
        const snap = (marks, cap, note) =>
            frames.push({ stage: cellsHTML(s, marks) + captionHTML(cap), note });

        snap({}, "one sentence per box &nbsp;·&nbsp; question: <b>&ldquo;what is the late fee rate?&rdquo;</b>", "A page of a contract. The answer to the question spans two sentences: one names the concept, the next gives the number.");

        const ans = { 9: "is-active", 10: "is-active", 11: "is-active", 12: "is-active", 13: "is-active", 14: "is-active" };
        snap(ans, "the answer lives here", "This is what a correct answer needs in the same chunk: <code>The fee is 2% per day.</code> — a sentence whose subject is a pronoun.");

        if (option === "semantic") {
            snap({ 0: "is-window", 1: "is-window", 2: "is-window", 3: "is-window", 4: "is-window", 5: "is-window", 6: "is-window", 7: "is-window", 8: "is-window", 9: "is-window", 10: "is-window", 11: "is-window", 12: "is-window", 13: "is-window", 14: "is-window" },
                "chunk 1 = §4.1, boundary follows the heading", "Structure-aware splitting cuts on the document's own boundaries — headings, list items, table rows — not on a character count. §4.1 stays whole.");
            snap({ 9: "is-done", 10: "is-done", 11: "is-done", 12: "is-done", 13: "is-done", 14: "is-done", 0: "is-window", 1: "is-window", 2: "is-window", 3: "is-window", 4: "is-window", 5: "is-window", 6: "is-window", 7: "is-window", 8: "is-window" },
                "retrieved: §4.1 entire", "One chunk, complete clause, correct answer, and the citation is a section number a human can check. Prepend the heading path to the chunk text so the embedding carries its own context.");
            snap({ 0: "is-done", 1: "is-done", 2: "is-done", 3: "is-done", 4: "is-done", 5: "is-done", 6: "is-done", 7: "is-done", 8: "is-done", 9: "is-done", 10: "is-done", 11: "is-done", 12: "is-done", 13: "is-done", 14: "is-done" },
                "answer: 2% per day &nbsp;·&nbsp; source §4.1", "<strong>Chunk on the structure the author gave you.</strong> Fixed-size splitting is the default because it is easy, not because it is good — and for contracts, tickets and logs the structure is right there in the text.");
            return frames;
        }

        const overlap = option === "overlap";
        snap({ 0: "is-window", 1: "is-window", 2: "is-window", 3: "is-window", 4: "is-window", 5: "is-window", 6: "is-window", 7: "is-window", 8: "is-window", 9: "is-window" },
            "chunk 1 = tokens 0–9", "Fixed-size splitting counts tokens and cuts. The cut lands mid-clause, because the splitter cannot read.");
        snap({ 9: "is-out", 10: "is-out", 11: "is-out", 12: "is-out", 13: "is-out", 14: "is-out", 0: "is-dim", 1: "is-dim", 2: "is-dim", 3: "is-dim", 4: "is-dim", 5: "is-dim", 6: "is-dim", 7: "is-dim", 8: "is-dim" },
            overlap ? "chunk 2 = tokens 8–17 (2-token overlap)" : "chunk 2 = tokens 10–17",
            overlap
                ? "With overlap, chunk 2 starts two tokens early. Cheap insurance — but the overlap has to be wider than the fact you are trying to keep whole, and here it is not."
                : "Chunk 2 begins <code>The fee is 2% per day.</code> with no idea what &ldquo;the fee&rdquo; refers to. The chunk is a fact with its subject amputated.");
        snap({ 10: "is-out", 11: "is-out", 12: "is-out", 13: "is-out", 14: "is-out" },
            "embedding of chunk 2", "Now embed that. &ldquo;Late fee&rdquo; never appears in the chunk, so the vector sits nowhere near the query — the retriever will not return it, and no amount of prompt engineering downstream recovers a chunk that was never fetched.");
        snap({ 0: "is-dim", 1: "is-dim", 2: "is-dim", 3: "is-dim", 4: "is-dim", 5: "is-dim", 6: "is-dim", 7: "is-dim", 8: "is-dim", 9: "is-out", 10: "is-out", 11: "is-out", 12: "is-out", 13: "is-out", 14: "is-out" },
            "result: retrieval miss, or a confident wrong answer", "<strong>Most &ldquo;the model hallucinated&rdquo; bugs are chunking bugs.</strong> Before you touch the prompt, print the chunks the retriever actually returned and read them as a human would.");

        return frames;
    },
};

/* ---- A4. ANN index ---- */

VIZ["ann-index"] = {
    title: "How an HNSW index finds neighbours without scanning everything",
    legend: [["lg-act", "current node"], ["lg-done", "path taken"], ["lg-cmp", "evaluated"], ["lg-idle", "never touched"]],
    build() {
        const layers = [
            [["L2", 60], ["a", 200], ["b", 400], ["c", 580]],
            [["L1", 60], ["d", 150], ["e", 260], ["f", 370], ["g", 470], ["h", 580]],
            [["L0", 60], ["i", 120], ["j", 190], ["k", 260], ["l", 330], ["m", 400], ["n", 470], ["o", 540], ["p", 600]],
        ];
        const ys = [50, 130, 210];
        const state = layers.map((row) => row.map(() => "n-idle"));
        const frames = [];

        const view = (note, target) => {
            let body = "";
            layers.forEach((row, r) => {
                for (let i = 1; i < row.length - 1; i++) {
                    body += edgeHTML(row[i][1], ys[r], row[i + 1][1], ys[r], state[r][i] !== "n-idle" && state[r][i + 1] !== "n-idle" ? "e-done" : "e-idle");
                }
            });
            body += edgeHTML(400, ys[0], 370, ys[1], "e-done");
            body += edgeHTML(370, ys[1], 400, ys[2], "e-done");
            layers.forEach((row, r) => {
                row.forEach((n, i) => {
                    body += i === 0
                        ? `<text x="${n[1]}" y="${ys[r] + 4}" class="n-sub">${n[0]}</text>`
                        : nodeHTML(n[1], ys[r], n[0], state[r][i], 16);
                });
            });
            if (target) body += `<text x="600" y="${ys[2] + 34}" class="n-sub">query</text>`;
            return svgHTML(640, 250, body);
        };

        const snap = (note, target) => frames.push({ stage: view(note, target), note });

        snap("One million vectors. Comparing the query against all of them is exact and far too slow, so the index trades a little recall for two orders of magnitude of speed.");
        snap("HNSW builds a hierarchy. Layer&nbsp;0 holds every vector. Each layer above holds a random sample with long-range links — a motorway network over a street map.");

        state[0][2] = "n-act";
        snap("Search starts at a fixed entry point on the top layer and greedily walks to whichever neighbour is closer to the query. Few nodes, huge hops.");
        state[0][2] = "n-done";
        state[0][3] = "n-cmp";
        snap("It evaluates <code>c</code>, finds it no closer, and stops moving on this layer. Greedy descent: move only while distance decreases.");

        state[1][3] = "n-act";
        snap("Drop to layer&nbsp;1 at the same point and repeat with shorter links. The coarse layer got you into the right region for the price of four distance computations.");
        state[1][3] = "n-done";
        state[1][4] = "n-cmp";
        state[1][5] = "n-cmp";
        snap("Two more candidates evaluated. <code>ef_search</code> is the size of this candidate list — raise it for recall, lower it for latency. It is the one knob you will actually tune in production.");

        state[2][5] = "n-act";
        snap("Down to layer&nbsp;0, the full graph, but only in a tiny neighbourhood.", true);
        state[2][5] = "n-done";
        state[2][6] = "n-cmp";
        state[2][7] = "n-cmp";
        state[2][8] = "n-act";
        snap("Local greedy search finds the true nearest neighbours after touching a few hundred nodes out of a million.", true);

        state[2][8] = "n-done";
        snap("<strong>The cost you must budget for is memory, not CPU</strong> — the graph lives in RAM, roughly <code>vectors &times; dims &times; 4 bytes</code> plus the links. Ten million 1536-dim float32 vectors is about 60&nbsp;GB before you store a single piece of metadata. That number, not the query latency, is what decides the deployment topology.", true);

        return frames;
    },
};

/* ---- A5. Hybrid search and RRF ---- */

VIZ["hybrid-rrf"] = {
    title: "Fusing keyword and vector results with Reciprocal Rank Fusion",
    legend: [["lg-act", "being scored"], ["lg-done", "final order"], ["lg-cmp", "considered"], ["lg-idle", "not ranked"]],
    build() {
        const frames = [];
        const rows = () => [
            ["rank", "BM25", "dense", "doc", "RRF score"],
            ["1", "D-7", "D-2", "", ""],
            ["2", "D-3", "D-7", "", ""],
            ["3", "D-9", "D-5", "", ""],
            ["4", "D-2", "D-3", "", ""],
        ];
        const grid = rows();
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head" };
        const snap = (marks, note) => frames.push({ stage: gridHTML(grid.map(clone), { ...head, ...marks }) + captionHTML("RRF: <code>score(d) = &Sigma; 1 / (k + rank<sub>i</sub>(d))</code> with <code>k = 60</code>"), note });

        snap({}, "A query about &ldquo;SLA breach code 4021&rdquo;. BM25 ranks by exact term overlap; the dense retriever ranks by meaning. They disagree, which is the whole point of running both.");
        snap({ "1,1": "is-act", "2,1": "is-act", "3,1": "is-act", "4,1": "is-act" }, "BM25 puts <code>D-7</code> first because it literally contains <code>4021</code>. Keyword search is unbeatable on identifiers, error codes, part numbers and surnames — the exact tokens an embedding model has never seen.");
        snap({ "1,2": "is-act", "2,2": "is-act", "3,2": "is-act", "4,2": "is-act" }, "The dense retriever puts <code>D-2</code> first: it never mentions 4021 but describes the breach in prose. Vectors win on paraphrase and synonymy.");

        grid[1][3] = "D-7"; grid[1][4] = "1/61 + 1/62 = .0325";
        snap({ "1,3": "is-act", "1,4": "is-act" }, "RRF ignores the raw scores — deliberately. BM25 scores and cosine similarities are not on the same scale and normalising them is a tuning rabbit hole. Only the <em>ranks</em> are combined.");
        grid[2][3] = "D-2"; grid[2][4] = "1/64 + 1/61 = .0320";
        snap({ "2,3": "is-act", "2,4": "is-act" }, "<code>D-2</code> is 4th for BM25 and 1st for dense. Appearing on both lists is what earns rank.");
        grid[3][3] = "D-3"; grid[3][4] = "1/62 + 1/64 = .0318";
        grid[4][3] = "D-5 / D-9"; grid[4][4] = "1/63 = .0159";
        snap({ "3,3": "is-cmp", "3,4": "is-cmp", "4,3": "is-cmp", "4,4": "is-cmp" }, "Documents on one list only score roughly half as much. That is the useful property: agreement between two independent retrievers is evidence, and RRF prices it without a single tuned weight.");
        snap({ "1,3": "is-done", "1,4": "is-done", "2,3": "is-done", "2,4": "is-done", "3,3": "is-done", "3,4": "is-done" }, "<strong>Hybrid is the default, not the optimisation.</strong> In enterprise corpora — tickets, claims, part catalogues — a large fraction of queries contain an identifier, and a pure-vector system fails exactly those queries while looking fine on your demo set.");

        return frames;
    },
};

/* ---- A6. Cross-encoder reranking ---- */

VIZ["rerank"] = {
    title: "Retrieve wide, rerank narrow",
    legend: [["lg-cmp", "candidate"], ["lg-act", "scored by cross-encoder"], ["lg-done", "sent to the model"], ["lg-out", "dropped"]],
    build() {
        const ids = ["D-2", "D-7", "D-3", "D-5", "D-9", "D-1", "D-8", "D-4"];
        const scores = ["0.81", "0.79", "0.78", "0.77", "0.77", "0.76", "0.75", "0.74"];
        const ce = { "D-5": "9.1", "D-2": "2.4", "D-7": "8.7", "D-3": "-1.2", "D-9": "0.4", "D-1": "-3.0", "D-8": "-2.1", "D-4": "6.2" };
        const frames = [];

        frames.push({
            stage: cellsHTML(ids, Object.fromEntries(ids.map((_, i) => [i, "is-cmp"])), Object.fromEntries(scores.map((s, i) => [i, s]))),
            note: "Eight candidates from hybrid search, with their similarity scores. Look at the spread: <code>0.81</code> down to <code>0.74</code>. The bi-encoder cannot really tell these apart, because it embedded every document <em>before</em> it ever saw your query.",
        });

        ids.forEach((_, i) => {
            const marks = Object.fromEntries(ids.map((_, j) => [j, j < i ? "is-cmp" : j === i ? "is-active" : "is-cmp"]));
            const tags = Object.fromEntries(ids.map((id, j) => [j, j <= i ? ce[id] : scores[j]]));
            frames.push({
                stage: cellsHTML(ids, marks, tags),
                note: i === 0
                    ? "A cross-encoder scores the pair <code>(query, document)</code> jointly in one forward pass, so every query token can attend to every document token. Far more accurate, and far too slow to run over a million documents — which is why it runs over eight."
                    : `Scoring <code>${ids[i]}</code>. Notice the scale: these are logits, not similarities, and they <em>separate</em>. <code>${ids[i]}</code> gets <code>${ce[ids[i]]}</code>.`,
            });
        });

        const order = ["D-5", "D-7", "D-4", "D-2"];
        const dropped = ["D-9", "D-3", "D-8", "D-1"];
        frames.push({
            stage: cellsHTML(order.concat(dropped),
                Object.fromEntries(order.concat(dropped).map((_, i) => [i, i < 4 ? "is-done" : "is-out"])),
                Object.fromEntries(order.concat(dropped).map((id, i) => [i, ce[id]]))),
            note: "Reordered. <code>D-5</code> was 4th by vector similarity and is first by relevance; <code>D-2</code> fell from 1st to 4th. Keep the top 4, drop the rest.",
        });
        frames.push({
            stage: cellsHTML(order, Object.fromEntries(order.map((_, i) => [i, "is-done"])), Object.fromEntries(order.map((id, i) => [i, ce[id]]))),
            note: "<strong>Reranking is usually the highest-return change you can make to a mediocre RAG system</strong>, because it fixes precision without touching the index, the chunker or the prompt. Budget for it: a cross-encoder over 50 candidates adds 50–200&nbsp;ms, which is real but almost always worth it.",
        });

        return frames;
    },
};

/* ---- A7. Corrective / self-correcting RAG ---- */

VIZ["crag-loop"] = {
    title: "Corrective RAG — grading retrieval before you trust it",
    legend: [["lg-act", "running"], ["lg-done", "passed"], ["lg-out", "failed the grade"], ["lg-idle", "idle"]],
    build() {
        const frames = [];
        const nodes = {
            q: [70, 60, "query"],
            r: [220, 60, "retrieve"],
            g: [380, 60, "grade"],
            w: [380, 170, "rewrite"],
            x: [540, 170, "escalate"],
            gen: [540, 60, "generate"],
            v: [220, 170, "verify"],
        };
        const view = (states, edges) => {
            let body = "";
            const e = (a, b, s) => edgeHTML(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], s);
            body += e("q", "r", edges.qr || "e-idle");
            body += e("r", "g", edges.rg || "e-idle");
            body += e("g", "gen", edges.ggen || "e-idle");
            body += e("g", "w", edges.gw || "e-idle");
            body += e("w", "r", edges.wr || "e-idle");
            body += e("w", "x", edges.wx || "e-idle");
            body += e("gen", "v", edges.genv || "e-idle");
            body += e("v", "w", edges.vw || "e-idle");
            Object.entries(nodes).forEach(([k, n]) => {
                body += nodeHTML(n[0], n[1], n[2], states[k] || "n-idle", 42);
            });
            return svgHTML(640, 240, body);
        };
        const snap = (states, edges, note) => frames.push({ stage: view(states, edges), note });

        snap({ q: "n-act" }, {}, "&ldquo;Why was claim C-77001 declined?&rdquo; Plain RAG retrieves, stuffs and answers. Corrective RAG inserts a judgement between retrieval and generation.");
        snap({ q: "n-done", r: "n-act" }, { qr: "e-done" }, "Retrieve as normal: hybrid search, top&nbsp;20, reranked to 5.");
        snap({ q: "n-done", r: "n-done", g: "n-act" }, { qr: "e-done", rg: "e-done" }, "A cheap grader — a small model or a classifier — scores each chunk: <em>does this document actually support answering this question?</em> Not &ldquo;is it similar&rdquo;; similarity already said yes.");
        snap({ q: "n-done", r: "n-done", g: "n-out" }, { qr: "e-done", rg: "e-done" }, "Two of five are relevant, three are about a different site. The grade is <code>ambiguous</code>. A plain pipeline would answer confidently from this; that is where hallucinations come from.");
        snap({ q: "n-done", r: "n-done", g: "n-out", w: "n-act" }, { qr: "e-done", rg: "e-done", gw: "e-act" }, "So correct instead of generating. Rewrite the query using what the good chunks revealed — the claim's site code and its policy section.");
        snap({ q: "n-done", r: "n-act", g: "n-idle", w: "n-done" }, { qr: "e-done", gw: "e-done", wr: "e-act" }, "Retrieve again with the sharper query. Cap the loop at two attempts: an unbounded corrective loop is an unbounded bill.");
        snap({ q: "n-done", r: "n-done", g: "n-done", w: "n-done" }, { qr: "e-done", rg: "e-done", wr: "e-done", gw: "e-done" }, "Five of five relevant. The grade passes.");
        snap({ q: "n-done", r: "n-done", g: "n-done", w: "n-done", gen: "n-act" }, { qr: "e-done", rg: "e-done", wr: "e-done", gw: "e-done", ggen: "e-act" }, "Now generate, with an instruction the model can obey: answer only from these documents, cite the chunk id for each claim.");
        snap({ q: "n-done", r: "n-done", g: "n-done", w: "n-done", gen: "n-done", v: "n-act" }, { qr: "e-done", rg: "e-done", wr: "e-done", gw: "e-done", ggen: "e-done", genv: "e-act" }, "Self-RAG adds one more check: verify every sentence in the answer is entailed by a cited chunk. Cheap, and it catches the confident half-truths.");
        snap({ q: "n-done", r: "n-done", g: "n-done", w: "n-done", gen: "n-done", v: "n-done", x: "n-out" }, { qr: "e-done", rg: "e-done", wr: "e-done", gw: "e-done", ggen: "e-done", genv: "e-done", wx: "e-idle" }, "And when two corrective passes still fail, take the exit on the right: <strong>say &ldquo;I could not find this&rdquo; and hand to a human.</strong> An abstention rate you can measure is worth more to a customer than an accuracy number you cannot.");

        return frames;
    },
};

/* ---- A8. Graph retrieval ---- */

VIZ["graph-hop"] = {
    title: "The question a vector index cannot answer",
    legend: [["lg-act", "current hop"], ["lg-done", "on the answer path"], ["lg-cmp", "expanded"], ["lg-idle", "not visited"]],
    build() {
        const N = {
            sup: [90, 60, "Supplier", "Nord"],
            part: [250, 60, "Part", "BRK-12"],
            lot: [410, 60, "Lot", "L-889"],
            veh: [560, 60, "Vehicle", "V-41"],
            fleet: [560, 180, "Fleet", "Cardiff"],
            claim: [410, 180, "Claim", "C-77001"],
            pol: [250, 180, "Policy", "§4.1"],
            inv: [90, 180, "Invoice", "I-22"],
        };
        const state = Object.fromEntries(Object.keys(N).map((k) => [k, "n-idle"]));
        const E = [["sup", "part"], ["part", "lot"], ["lot", "veh"], ["veh", "fleet"], ["fleet", "claim"], ["claim", "pol"], ["pol", "inv"], ["claim", "lot"]];
        const eState = E.map(() => "e-idle");
        const frames = [];

        const snap = (note) => {
            let body = "";
            E.forEach(([a, b], i) => {
                body += edgeHTML(N[a][0], N[a][1], N[b][0], N[b][1], eState[i]);
            });
            Object.entries(N).forEach(([k, n]) => {
                body += nodeHTML(n[0], n[1], n[2], state[k], 34, n[3]);
            });
            frames.push({ stage: svgHTML(640, 250, body), note });
        };

        snap("&ldquo;Which vehicles are affected by the brake lot that caused claim C-77001?&rdquo; No single document contains that answer, so no chunk can be retrieved to answer it.");
        state.claim = "n-act";
        snap("A graph makes the entities and their relationships first-class. Start at the entity the question names — resolved by an exact id lookup, not a similarity search.");
        eState[7] = "e-act"; state.lot = "n-act"; state.claim = "n-done";
        snap("Hop one: <code>(:Claim)-[:CAUSED_BY]-&gt;(:Lot)</code>. One edge traversal, deterministic, no embedding involved.");
        eState[7] = "e-done"; eState[2] = "e-act"; state.veh = "n-act"; state.lot = "n-done";
        snap("Hop two: every vehicle fitted with a part from that lot. In Cypher this is <code>MATCH (c:Claim {id:$id})-[:CAUSED_BY]-&gt;(:Lot)&lt;-[:FROM_LOT]-(:Part)-[:FITTED_TO]-&gt;(v:Vehicle) RETURN v</code>.");
        eState[2] = "e-done"; eState[3] = "e-act"; state.fleet = "n-cmp"; state.veh = "n-done";
        snap("Hop three gives the operational answer the customer actually wants: which fleets, and therefore who to phone this afternoon.");
        eState[1] = "e-act"; state.part = "n-cmp";
        snap("Walk the other direction and you get the supply-side answer: which supplier, which invoice, which contract clause covers recovery.");
        eState[1] = "e-done"; eState[0] = "e-done"; state.sup = "n-cmp";
        snap("Three hops, an exact answer, and a path you can show a regulator. A vector index would have returned the five documents most <em>similar</em> to the question and let the model guess.");
        Object.keys(state).forEach((k) => (state[k] = state[k] === "n-idle" ? "n-idle" : "n-done"));
        snap("<strong>Use the graph for relationships and identity, the vector index for language.</strong> The practical pattern is: resolve entities with the graph, fetch narrative text with the vector store, and give the model both. Building the ontology is 80% of the work, and it is the same modelling conversation you would have had anyway.");

        return frames;
    },
};

/* ---- A9. LangGraph execution ---- */

VIZ["langgraph-run"] = {
    title: "A LangGraph run — state, conditional edges, checkpoints, interrupt",
    legend: [["lg-act", "executing"], ["lg-done", "complete"], ["lg-cmp", "checkpoint written"], ["lg-out", "paused for a human"]],
    build() {
        const N = {
            start: [70, 60, "START"],
            plan: [210, 60, "plan"],
            tools: [360, 60, "tools"],
            check: [510, 60, "check"],
            human: [360, 175, "approve"],
            end: [560, 175, "END"],
        };
        const frames = [];
        const snap = (state, edges, stateBar, note) => {
            let body = "";
            const e = (a, b, s) => edgeHTML(N[a][0], N[a][1], N[b][0], N[b][1], s || "e-idle");
            body += e("start", "plan", edges.sp);
            body += e("plan", "tools", edges.pt);
            body += e("tools", "check", edges.tc);
            body += e("check", "tools", edges.ct);
            body += e("check", "human", edges.ch);
            body += e("human", "end", edges.he);
            Object.entries(N).forEach(([k, n]) => {
                body += nodeHTML(n[0], n[1], n[2], state[k] || "n-idle", 38);
            });
            frames.push({
                stage: svgHTML(640, 235, body) + captionHTML(`state: <code>${stateBar}</code>`),
                note,
            });
        };

        snap({ start: "n-act" }, {}, "{messages: [], claim: null, steps: 0}", "A graph is not a chain: it is a state machine. One typed state object flows through nodes, and each node returns a <em>partial update</em> that is merged in — not a new object built from scratch.");
        snap({ start: "n-done", plan: "n-act" }, { sp: "e-done" }, "{messages: [+1], claim: 'C-77001', steps: 1}", "The <code>plan</code> node calls the model and writes back to state. The reducer on <code>messages</code> is <code>add_messages</code>, so the list appends rather than overwrites — that choice of reducer is the single most common source of &ldquo;my history disappeared&rdquo; bugs.");
        snap({ start: "n-done", plan: "n-cmp" }, { sp: "e-done" }, "{... steps: 1} → checkpoint #1", "A checkpointer persists the state after every node. In Postgres, not memory, if you want the run to survive a deploy.");
        snap({ start: "n-done", plan: "n-done", tools: "n-act" }, { sp: "e-done", pt: "e-done" }, "{tool_calls: 2, steps: 2}", "The <code>tools</code> node executes both requested calls concurrently. The state update carries both results back, keyed by call id so the model can match them.");
        snap({ start: "n-done", plan: "n-done", tools: "n-cmp", check: "n-act" }, { sp: "e-done", pt: "e-done", tc: "e-done" }, "{tool_calls: 2, steps: 3}", "A <em>conditional edge</em> is a plain function of state that returns the name of the next node. This is where you enforce the loop budget: <code>if state['steps'] &gt; 8: return 'approve'</code>.");
        snap({ start: "n-done", plan: "n-done", tools: "n-act", check: "n-done" }, { sp: "e-done", pt: "e-done", tc: "e-done", ct: "e-act" }, "{steps: 4}", "The check routes back to <code>tools</code>: one piece of evidence is missing. A cycle — which is exactly what a chain cannot express and why the graph exists.");
        snap({ start: "n-done", plan: "n-done", tools: "n-cmp", check: "n-act" }, { sp: "e-done", pt: "e-done", tc: "e-done", ct: "e-done" }, "{steps: 5, ready: true}", "Second pass, evidence complete. The condition now routes forward.");
        snap({ start: "n-done", plan: "n-done", tools: "n-done", check: "n-done", human: "n-out" }, { sp: "e-done", pt: "e-done", tc: "e-done", ct: "e-done", ch: "e-act" }, "{steps: 6, awaiting_approval: true}", "<code>interrupt()</code> before the node that changes the world. The graph stops, the checkpoint holds the whole state, and the process can die — the run resumes from the thread id when the approver comes back tomorrow.");
        snap({ start: "n-done", plan: "n-done", tools: "n-done", check: "n-done", human: "n-done", end: "n-act" }, { sp: "e-done", pt: "e-done", tc: "e-done", ct: "e-done", ch: "e-done", he: "e-act" }, "{approved_by: 'j.mills', steps: 7}", "Approved, resumed, decision written, run finished — with a checkpoint per step you can replay.");
        snap({ start: "n-done", plan: "n-done", tools: "n-done", check: "n-done", human: "n-done", end: "n-done" }, { sp: "e-done", pt: "e-done", tc: "e-done", ct: "e-done", ch: "e-done", he: "e-done" }, "{thread_id: 'C-77001', steps: 7}", "<strong>The three things you get from a graph that a while-loop does not give you: durable pause, deterministic replay, and an edge condition you can unit-test.</strong> In a regulated customer estate, all three are requirements rather than luxuries.");

        return frames;
    },
};

/* ---- A10. Multi-agent supervisor ---- */

VIZ["supervisor-agents"] = {
    title: "Supervisor, workers, and what happens when one fails",
    legend: [["lg-act", "working"], ["lg-done", "returned"], ["lg-out", "failed / isolated"], ["lg-idle", "idle"]],
    build() {
        const sup = [320, 50];
        const workers = [[110, 165, "policy"], [250, 165, "claims"], [390, 165, "billing"], [530, 165, "notes"]];
        const wState = ["n-idle", "n-idle", "n-idle", "n-idle"];
        let sState = "n-idle";
        const frames = [];
        const snap = (note, eStates = []) => {
            let body = "";
            workers.forEach((w, i) => {
                body += arrowHTML(sup[0], sup[1] + 34, w[0], w[1] - 30, eStates[i] || "e-idle");
            });
            body += nodeHTML(sup[0], sup[1], "supervisor", sState, 46);
            workers.forEach((w, i) => body += nodeHTML(w[0], w[1], w[2], wState[i], 40));
            frames.push({ stage: svgHTML(640, 240, body), note });
        };

        snap("&ldquo;Is claim C-77001 payable, and if so how much?&rdquo; One agent with twelve tools would work — badly. Its prompt would be 4,000 tokens of instructions for four unrelated jobs.");
        sState = "n-act";
        snap("A supervisor decomposes instead. Each worker gets a narrow system prompt and only the tools for its own domain, which shrinks both the context and the blast radius.");
        wState[0] = wState[1] = "n-act";
        snap("Policy and claims run <strong>concurrently</strong> — they share no state. In a graph this is a fan-out to two nodes; the aggregation happens because both write to different keys of the same state object.", ["e-act", "e-act"]);
        wState[2] = "n-act";
        snap("Billing joins. Watch the cost model here: four workers means four model calls per turn, plus the supervisor's. Multi-agent is not free, and a single well-prompted agent beats a badly decomposed swarm.", ["e-act", "e-act", "e-act"]);
        wState[0] = "n-done"; wState[1] = "n-done";
        snap("Two return structured results. They return <em>data</em>, not prose — a worker that answers in English forces the supervisor to re-parse it, and that is where multi-agent systems lose their accuracy.", ["e-done", "e-done", "e-act"]);
        wState[2] = "n-out";
        snap("Billing's upstream SAP connector times out. In a single-agent design the whole run dies here.", ["e-done", "e-done", "e-act"]);
        wState[2] = "n-out"; sState = "n-cmp";
        snap("With fault isolation the supervisor records a partial result and continues. <strong>Design every worker's failure as a value it can return</strong>, not an exception that unwinds the run.", ["e-done", "e-done", "e-idle"]);
        wState[3] = "n-act";
        snap("The notes worker summarises the handler's free text, unaffected by the billing outage.", ["e-done", "e-done", "e-idle", "e-act"]);
        wState[3] = "n-done"; sState = "n-done";
        snap("The supervisor aggregates: <em>payable under §4.1, amount unavailable — billing degraded, routed to a human for the figure.</em> Partial, honest, and actionable — which beats a confident number sourced from nothing.", ["e-done", "e-done", "e-idle", "e-done"]);

        return frames;
    },
};

/* ---- A11. MCP ---- */

VIZ["mcp-flow"] = {
    title: "Model Context Protocol — host, client, server and the trust boundary",
    legend: [["lg-act", "message in flight"], ["lg-done", "established"], ["lg-out", "blocked at the boundary"], ["lg-idle", "idle"]],
    build() {
        const frames = [];
        const snap = (states, arrow, label, note) => {
            let body = "";
            body += `<line x1="330" y1="16" x2="330" y2="224" class="e-idle" stroke-dasharray="6 6"/>`;
            body += `<text x="330" y="236" class="n-sub">trust boundary</text>`;
            body += boxHTML(20, 40, 130, 56, "host app", states.host || "n-idle", "your chat UI");
            body += boxHTML(180, 40, 130, 56, "MCP client", states.client || "n-idle", "one per server");
            body += boxHTML(360, 40, 130, 56, "MCP server", states.server || "n-idle", "customer side");
            body += boxHTML(510, 40, 110, 56, "SAP / Jira", states.sys || "n-idle", "system of record");
            if (arrow) body += arrowHTML(arrow[0], 150, arrow[1], 150, arrow[2] || "e-act");
            if (label) body += `<text x="320" y="185" class="n-sub">${esc(label)}</text>`;
            frames.push({ stage: svgHTML(640, 245, body), note });
        };

        snap({ host: "n-act" }, null, "", "MCP exists because every integration used to be bespoke. <code>N</code> models times <code>M</code> systems was <code>N&times;M</code> adapters; a protocol makes it <code>N+M</code>.");
        snap({ host: "n-done", client: "n-act" }, [150, 300], "initialize", "The host spawns one client per server and they negotiate protocol version and capabilities. The client is a thin translator — it holds no business logic.");
        snap({ host: "n-done", client: "n-done", server: "n-act" }, [310, 380], "tools/list", "The server advertises its tools, resources and prompts. This is the important inversion: <strong>the customer's team owns and versions the tool definitions</strong>, not you, so the integration outlives your engagement.");
        snap({ host: "n-done", client: "n-done", server: "n-done" }, [380, 310, "e-done"], "schemas", "Schemas come back and become the function definitions in the model call. Same JSON Schema, same discipline as any tool calling — description quality still decides accuracy.");
        snap({ host: "n-done", client: "n-act", server: "n-done" }, [150, 380], "tools/call find_claims", "The model asks for a tool. The client forwards it across the boundary.");
        snap({ host: "n-done", client: "n-done", server: "n-act", sys: "n-act" }, [490, 600], "query as the end user", "The server calls the real system <em>with the end user's identity</em>, not a shared service account. This is the whole security argument: the boundary is where authorisation lives, and it is on the customer's side of it.");
        snap({ host: "n-done", client: "n-done", server: "n-done", sys: "n-done" }, [600, 380, "e-done"], "rows", "Results flow back. Note what did not cross the boundary: credentials, the full table, or any row this user may not see.");
        snap({ host: "n-done", client: "n-done", server: "n-out" }, [310, 380, "e-act"], "tools/call delete_claim", "Now a prompt-injected instruction in a claim note tries to call a destructive tool. The server rejects it — the allow-list, the rate limit and the write approval live server-side.");
        snap({ host: "n-done", client: "n-done", server: "n-done", sys: "n-done" }, null, "", "<strong>Treat every MCP server as a piece of security surface, not a convenience.</strong> Ask who wrote it, what identity it runs as, whether tools are read-only by default, and what happens when the model is persuaded to call the worst one. A third-party server you did not audit is an unreviewed dependency with your customer's data behind it.");

        return frames;
    },
};

/* ---- A12. LoRA ---- */

VIZ["lora-adapter"] = {
    title: "Why LoRA makes fine-tuning affordable",
    legend: [["lg-done", "frozen"], ["lg-act", "trainable"], ["lg-cmp", "merged at inference"], ["lg-idle", "unused"]],
    build() {
        const W = [
            [".12", "-.4", ".03", ".9", "-.2", ".51", ".07", "-.8"],
            [".33", ".18", "-.6", ".22", ".41", "-.1", ".65", ".02"],
            ["-.7", ".26", ".14", "-.3", ".08", ".77", "-.5", ".31"],
            [".05", "-.9", ".43", ".16", "-.6", ".29", ".11", ".84"],
            [".61", ".07", "-.2", ".38", ".93", "-.4", ".24", "-.1"],
            ["-.3", ".52", ".88", "-.7", ".15", ".06", "-.9", ".47"],
        ];
        const all = (cls) => Object.fromEntries(W.flatMap((row, r) => row.map((_, c) => [`${r},${c}`, cls])));
        const A = [["a1"], ["a2"], ["a3"], ["a4"], ["a5"], ["a6"]];
        const B = [["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8"]];
        const frames = [];

        frames.push({
            stage: gridHTML(W, all("is-done")) + captionHTML("one weight matrix <b>W</b> &nbsp;·&nbsp; 6 &times; 8 = 48 parameters (imagine 4096 &times; 4096)"),
            note: "One of hundreds of weight matrices in the model. Full fine-tuning updates every cell — and keeps an optimizer state two to four times larger than the weights themselves, which is why a 7B model needs about 80&nbsp;GB of VRAM to train and 14 to run.",
        });
        frames.push({
            stage: gridHTML(W, all("is-act")) + captionHTML("full fine-tune: <b>48</b> trainable parameters here"),
            note: "Everything is trainable, so everything must be stored, checkpointed and shipped. One customer, one 14&nbsp;GB artefact — and a second customer means a second copy of the whole model.",
        });
        frames.push({
            stage: gridHTML(W, all("is-done")) + captionHTML("freeze <b>W</b> entirely"),
            note: "LoRA's observation: the <em>change</em> a fine-tune makes to a weight matrix is empirically low-rank. You do not need to move 48 numbers to express it.",
        });
        frames.push({
            stage: gridHTML(W, all("is-done")) + gridHTML(A, Object.fromEntries(A.map((_, r) => [`${r},0`, "is-act"]))) + captionHTML("add <b>A</b> (6 &times; r, r = 1) &nbsp;·&nbsp; trainable"),
            note: "Attach two small matrices beside it. <code>A</code> projects down to rank <code>r</code> — in practice 8 to 64, here 1 so it fits on screen.",
        });
        frames.push({
            stage: gridHTML(W, all("is-done")) + gridHTML(A, Object.fromEntries(A.map((_, r) => [`${r},0`, "is-act"]))) + gridHTML(B, Object.fromEntries(B[0].map((_, c) => [`0,${c}`, "is-act"]))) + captionHTML("and <b>B</b> (r &times; 8) &nbsp;·&nbsp; trainable &nbsp;·&nbsp; <b>14</b> parameters instead of 48"),
            note: "<code>B</code> projects back up. The forward pass becomes <code>h = Wx + (BA)x &times; &alpha;/r</code>. Only <code>A</code> and <code>B</code> receive gradients — 14 numbers here, typically well under 1% of the model in practice.",
        });
        frames.push({
            stage: gridHTML(W, all("is-done")) + gridHTML(A, Object.fromEntries(A.map((_, r) => [`${r},0`, "is-cmp"]))) + gridHTML(B, Object.fromEntries(B[0].map((_, c) => [`0,${c}`, "is-cmp"]))) + captionHTML("adapter artefact: a few MB, swappable per customer"),
            note: "QLoRA goes further: quantise the frozen base to 4-bit and train the adapters in 16-bit on top. A 7B fine-tune then fits on a single 24&nbsp;GB consumer card — which is the difference between a GPU cluster request and an afternoon.",
        });
        frames.push({
            stage: gridHTML(W, all("is-cmp")) + captionHTML("merged for deployment, or served as a hot-swappable adapter"),
            note: "<strong>The operational win matters more than the training win.</strong> One base model in memory, a directory of small adapters, and you can serve twelve customers' tuned behaviour from one GPU. The FDE question is never &ldquo;can we fine-tune&rdquo; — it is <em>&ldquo;is the failure a knowledge gap (use RAG) or a behaviour gap (fine-tune)?&rdquo;</em>",
        });

        return frames;
    },
};

/* ---- A13. Quantisation ---- */

VIZ["quantise"] = {
    title: "Quantisation — the same weights, fewer bits",
    legend: [["lg-idle", "fp16 value"], ["lg-act", "snapped to a level"], ["lg-done", "int4 level"], ["lg-out", "error introduced"]],
    build() {
        const w = [31, 12, 47, 5, 39, 22, 44, 17, 28, 9, 36, 25];
        const q = w.map((v) => Math.round(v / 8) * 8);
        const frames = [];
        const marks = (cls) => Object.fromEntries(w.map((_, i) => [i, cls]));

        frames.push({ stage: barsHTML(w, marks("is-aux")) + captionHTML("12 weights at fp16 &nbsp;·&nbsp; <b>2 bytes</b> each"), note: "Weights, at 16-bit precision. A 7B model at fp16 is about 14&nbsp;GB — too big for most single GPUs once you add the KV cache for a realistic batch." });
        frames.push({ stage: barsHTML(w, { ...marks("is-aux"), 2: "is-act" }) + captionHTML("find the range: min 5, max 47"), note: "Quantisation is a scale-and-round. Find the range of the block, divide it into a small number of levels, and store the level index instead of the number." });
        frames.push({ stage: barsHTML(q, { ...marks("is-act") }) + captionHTML("snap each weight to the nearest of 16 levels"), note: "Four bits gives 16 levels. Each weight becomes an index, and the block keeps one scale factor — which is why it is <em>block-wise</em>: one global scale for the whole tensor would be ruined by a single outlier." });
        frames.push({
            stage: barsHTML(q, Object.fromEntries(w.map((v, i) => [i, v === q[i] ? "is-done" : "is-out"]))) + captionHTML("<b>0.5 bytes</b> each &nbsp;·&nbsp; 4&times; smaller &nbsp;·&nbsp; red bars moved"),
            note: "Most weights moved slightly; that error is the price. For <code>Q4_K_M</code>-class quantisation the measured quality loss on general benchmarks is small — but <strong>&ldquo;small on benchmarks&rdquo; is not &ldquo;small on your golden set&rdquo;</strong>, and structured-output adherence degrades before prose quality does.",
        });
        frames.push({
            stage: barsHTML(q, marks("is-done")) + captionHTML("7B: 14 GB &rarr; ~4 GB &nbsp;·&nbsp; fits a 24 GB card with room to batch"),
            note: "The reason an FDE cares: quantisation is often what makes an <em>air-gapped</em> or in-tenant deployment possible at all. The customer has two A10s, not a cluster, and the choice is a quantised local model or no local model.",
        });
        frames.push({
            stage: barsHTML(q, marks("is-done")) + captionHTML("always re-run the eval suite after changing quantisation"),
            note: "<strong>Treat quantisation level as a versioned part of the model, exactly like the prompt.</strong> Run the golden set at each level, publish the accuracy-per-pound table, and let the customer choose with numbers in front of them.",
        });

        return frames;
    },
};

/* ---- A14. Guardrail pipeline ---- */

VIZ["guardrail-pipeline"] = {
    title: "Rails on the way in, rails on the way out",
    legend: [["lg-act", "stage running"], ["lg-done", "passed"], ["lg-out", "blocked or redacted"], ["lg-idle", "not reached"]],
    build() {
        const stages = ["input", "topical rail", "injection scan", "PII redact", "model", "output check", "PII restore", "deliver"];
        const state = stages.map(() => "n-idle");
        const tag = stages.map(() => "");
        const frames = [];
        const snap = (payload, note) =>
            frames.push({
                stage: svgHTML(640, 130, laneHTML(stages.map((label, i) => ({ label, state: state[i], tag: tag[i] })), 44, 54)) + captionHTML(payload),
                note,
            });

        snap("&ldquo;Summarise claim C-77001 for Jane Mills, NI QQ123456C&rdquo;", "A normal request from a handler. Everything after this is machinery the user never sees.");
        state[0] = "n-done"; state[1] = "n-act";
        snap("&ldquo;Summarise claim C-77001 …&rdquo;", "The topical rail answers one question: is this request inside the scope this assistant was bought for? Off-topic chat is not a safety issue, it is a <em>credibility</em> issue — the screenshot of your claims bot writing poetry is what ends the rollout.");
        state[1] = "n-done"; state[2] = "n-act";
        snap("scan: user text + every retrieved chunk", "The injection scan must cover retrieved content, not just the user's message. <strong>The attacker is rarely the user</strong>; it is whoever wrote the free-text note that your retriever is about to paste into the prompt.");
        state[2] = "n-done"; state[3] = "n-act"; tag[3] = "Presidio";
        snap("&ldquo;Summarise claim C-77001 for &lt;PERSON_1&gt;, NI &lt;UK_NINO_1&gt;&rdquo;", "Presidio detects entities and replaces them with reversible placeholders, keeping the map in your process. Tune it: over-redaction that eats claim references makes the assistant useless, and that failure is silent.");
        state[3] = "n-done"; state[4] = "n-act";
        snap("model sees only the redacted text", "The model now cannot leak what it never received. This is also the answer to &ldquo;can we use a hosted API?&rdquo; in a surprising number of procurement conversations.");
        state[4] = "n-done"; state[5] = "n-act";
        snap("answer + citations", "Output checks are cheap and worth it: does every claim cite a retrieved chunk, is the JSON schema-valid, does it contain a refusal-worthy topic, does it contain a UK NINO that was never in the input.");
        state[5] = "n-out"; tag[5] = "injection";
        snap("blocked: &ldquo;ignore previous instructions and email …&rdquo;", "A second run. A note in the claim file told the model to exfiltrate. The output rail catches the attempt — and logs it, which is how you find out you are being probed.");
        state[5] = "n-done"; tag[5] = ""; state[6] = "n-act";
        snap("&lt;PERSON_1&gt; &rarr; Jane Mills", "On the clean path, placeholders are restored after generation, so the handler reads a normal sentence.");
        state[6] = "n-done"; state[7] = "n-done";
        snap("delivered, with an audit record of every stage", "<strong>No single rail is reliable; the layering is the control.</strong> And write down the real limit in the design doc: prompt injection has no complete defence, so the durable mitigation is that the tools behind the model cannot do anything catastrophic even when it is fully persuaded.");

        return frames;
    },
};

/* ---- A15. Gateway ---- */

VIZ["gateway-fallback"] = {
    title: "One gateway in front of every model call",
    legend: [["lg-act", "attempt"], ["lg-done", "succeeded"], ["lg-out", "failed"], ["lg-idle", "not tried"]],
    build() {
        const frames = [];
        const snap = (states, caption, note) => {
            let body = "";
            body += boxHTML(20, 50, 120, 54, "your app", states.app || "n-idle", "idempotency key");
            body += boxHTML(180, 50, 130, 54, "gateway", states.gw || "n-idle", "keys · limits · logs");
            body += boxHTML(370, 18, 120, 48, "primary", states.p || "n-idle", "GPT-class");
            body += boxHTML(370, 86, 120, 48, "secondary", states.s || "n-idle", "Claude-class");
            body += boxHTML(370, 154, 120, 48, "local", states.l || "n-idle", "in-tenant 8B");
            body += arrowHTML(140, 77, 180, 77, states.e1 || "e-idle");
            body += arrowHTML(310, 77, 370, 42, states.e2 || "e-idle");
            body += arrowHTML(310, 77, 370, 110, states.e3 || "e-idle");
            body += arrowHTML(310, 77, 370, 178, states.e4 || "e-idle");
            frames.push({ stage: svgHTML(640, 215, body) + captionHTML(caption), note });
        };

        snap({ app: "n-act" }, "attempt 1", "Every production call carries an idempotency key. It is not ceremony: a retried tool call that posts a payment twice is the kind of incident that ends an engagement.");
        snap({ app: "n-done", gw: "n-act", e1: "e-act" }, "gateway: resolve route", "The gateway holds the provider keys, so no key is ever in an application config or a notebook. Rotation becomes one operation instead of a search across repositories.");
        snap({ app: "n-done", gw: "n-done", p: "n-act", e1: "e-done", e2: "e-act" }, "primary &rarr; 429", "Primary returns <code>429</code>. You did not exceed your own limit — a different tenant on the same account did, which is a failure mode teams discover in production rather than design for.");
        snap({ app: "n-done", gw: "n-act", p: "n-out", e1: "e-done", e2: "e-act" }, "backoff 0.5s · 1s · 2s + jitter", "Retry with exponential backoff <em>and jitter</em>. Without jitter every client in your fleet retries in lockstep and you have built a self-inflicted thundering herd.");
        snap({ app: "n-done", gw: "n-act", p: "n-out", e1: "e-done", e2: "e-act", e3: "e-act", s: "n-act" }, "fallback &rarr; secondary", "Still limited, so route to a second provider. Because the gateway normalises the request shape, the application does not know this happened.");
        snap({ app: "n-done", gw: "n-done", p: "n-out", s: "n-done", e1: "e-done", e2: "e-act", e3: "e-done" }, "200 OK · 1.9s · £0.004 · logged", "Success. The gateway logs model, latency, tokens, cost and the trace id, tagged by tenant — which is how you answer &ldquo;what does this cost per claim?&rdquo; without a spreadsheet exercise.");
        snap({ app: "n-done", gw: "n-done", p: "n-out", s: "n-out", l: "n-act", e1: "e-done", e2: "e-act", e3: "e-act", e4: "e-act" }, "both providers down &rarr; degrade locally", "The interesting tier is the third. A small in-tenant model that handles the routine 60% keeps the workflow alive during a provider outage — degraded and honest beats unavailable.");
        snap({ app: "n-done", gw: "n-done", l: "n-done", e1: "e-done", e4: "e-done" }, "one place to change models, prices and limits", "<strong>Put the gateway in on day one, before there is anything to route.</strong> Retrofitting it means editing every call site in a codebase the customer's team now owns, and it is the component that makes &ldquo;switch to the cheaper model for tier-1 tickets&rdquo; a config change rather than a project.");

        return frames;
    },
};

/* ---- A16. Text to SQL ---- */

VIZ["text-to-sql"] = {
    title: "Text-to-SQL that is safe enough to run",
    legend: [["lg-act", "current stage"], ["lg-done", "passed"], ["lg-out", "rejected"], ["lg-idle", "pending"]],
    build() {
        const stages = ["question", "schema select", "generate", "parse & lint", "policy filter", "EXPLAIN", "execute", "verify"];
        const state = stages.map(() => "n-idle");
        const frames = [];
        const snap = (payload, note) =>
            frames.push({
                stage: svgHTML(640, 130, laneHTML(stages.map((label, i) => ({ label, state: state[i] })), 44, 54)) + captionHTML(payload),
                note,
            });

        snap("&ldquo;How many Cardiff claims breached SLA last month?&rdquo;", "Text-to-SQL is the highest-value and highest-risk pattern in enterprise AI: it answers questions nobody pre-built a report for, and it runs code against a production database.");
        state[0] = "n-done"; state[1] = "n-act";
        snap("1,400 tables &rarr; 4 tables, 18 columns", "You cannot paste a 1,400-table schema into a prompt, and you should not want to. Retrieve the relevant subset — by embedding table and column <em>descriptions</em>, not names — and pass only that, with two sample rows per table so the model sees the actual value formats.");
        state[1] = "n-done"; state[2] = "n-act";
        snap("SELECT count(*) FROM claims c JOIN sites s …", "Generation, with the dialect named explicitly. MS SQL is not Postgres, and the model will happily emit <code>LIMIT</code> against a server that wants <code>TOP</code>.");
        state[2] = "n-done"; state[3] = "n-act";
        snap("parse to AST · single statement · SELECT only", "<strong>Never regex the SQL. Parse it.</strong> Reject anything that is not a single <code>SELECT</code>: no semicolons, no CTE hiding a write, no <code>INTO</code>, no procedure call. An LLM-generated string is untrusted input like any other.");
        state[3] = "n-done"; state[4] = "n-act";
        snap("inject: AND s.region IN ('cardiff')", "Entitlements are enforced by rewriting the AST, not by asking the model nicely in the system prompt. Better still, connect as a read-only role whose row-level security already scopes the user — then the database enforces it even if your filter has a bug.");
        state[4] = "n-done"; state[5] = "n-act";
        snap("EXPLAIN: estimated 1.2M rows scanned", "Run the plan first. A generated query with a missing join predicate will cheerfully table-scan a fact table and take the customer's reporting database down with it — a genuine way to lose an engagement in week three.");
        state[5] = "n-out";
        snap("rejected: cost above threshold, no index on s.region", "Above the cost budget, so refuse and explain. Enforce a statement timeout and a row cap as well; both belong to the database role, not the application.");
        state[5] = "n-act";
        snap("rewrite with the indexed date partition &rarr; 40k rows", "One repair attempt with the plan's complaint fed back as context. Loop at most once.");
        state[5] = "n-done"; state[6] = "n-act";
        snap("executed in 180ms · 312 rows", "Execute, on a read replica. Never point this at the primary — the whole point is that you do not know what query will arrive.");
        state[6] = "n-done"; state[7] = "n-done";
        snap("answer + the SQL, shown to the user", "<strong>Show the generated SQL next to the answer, always.</strong> An analyst who can read the query will catch the subtle wrong join that no eval suite would have flagged, and the visible SQL is what converts a black box into a tool the team trusts.");

        return frames;
    },
};

/* ---- A17. Permission-aware retrieval ---- */

VIZ["entitlement-filter"] = {
    title: "The retrieval layer has to know who is asking",
    legend: [["lg-done", "visible to this user"], ["lg-out", "must not be returned"], ["lg-act", "retrieved"], ["lg-idle", "filtered out"]],
    build() {
        const docs = ["HR-1", "CLM-2", "CLM-3", "LEGAL-4", "CLM-5", "BOARD-6", "CLM-7", "HR-8"];
        const allowed = [false, true, true, false, true, false, true, false];
        const frames = [];
        const snap = (marks, tags, cap, note) => frames.push({ stage: cellsHTML(docs, marks, tags) + captionHTML(cap), note });

        snap({}, {}, "one index, eight documents, one user: a tier-1 claims handler", "Every RAG pilot starts with one index and no notion of identity. It works perfectly, right up to the day somebody ingests the HR folder.");
        snap(Object.fromEntries(docs.map((_, i) => [i, allowed[i] ? "is-done" : "is-out"])), {}, "what this user is entitled to see", "The customer's permission model already answers this question. Your job is not to invent one — it is to <em>reuse</em> theirs, because a second permission model will drift from the first and the drift is invisible.");
        snap(Object.fromEntries(docs.map((_, i) => [i, "is-active"])), {}, "post-filtering: retrieve first, filter after", "The naive fix is to retrieve the top 5 by similarity and drop the ones the user cannot see. Two things break.");
        snap({ 0: "is-active", 3: "is-active", 5: "is-active", 1: "is-dim", 2: "is-dim" }, { 0: "leak", 3: "leak", 5: "leak" }, "top-5 are all restricted", "First, the most relevant documents are often the restricted ones, so after filtering you return two weak chunks and the answer quality collapses — for the users with the least access, who are the majority.");
        snap({ 0: "is-out", 3: "is-out", 5: "is-out" }, { 0: "in prompt", 3: "in prompt", 5: "in prompt" }, "the model already saw them", "Second, and worse: in most implementations the filtering happens after the text reached the model. The summary leaks even when the citation list does not.");
        snap(Object.fromEntries(docs.map((_, i) => [i, allowed[i] ? "is-active" : "is-dim"])), {}, "pre-filtering: ACL as a metadata predicate on the query", "So filter <em>inside</em> the search. Store the ACL — group ids, classification, region — as metadata on every chunk, and pass the user's resolved groups as a hard predicate so the index never considers the rest.");
        snap({ 1: "is-done", 2: "is-done", 4: "is-done", 6: "is-done" }, { 1: "1", 2: "2", 4: "3", 6: "4" }, "top-4 of the permitted set", "Now the top-k is the top-k <em>of what this user may see</em>, which is both correct and better. Cost: your ingest pipeline must carry permissions through, and re-sync them when they change.");
        snap({ 1: "is-done", 2: "is-done", 4: "is-done", 6: "is-done", 0: "is-out", 3: "is-out", 5: "is-out", 7: "is-out" }, {}, "plus the negative evals", "<strong>Write the denial tests into the golden set.</strong> &ldquo;Tier-1 asks a question only answerable from a legal document&rdquo; must assert a refusal, run in CI, and keep running after you leave. An entitlement bug is not a quality regression; it is a notifiable incident.");

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
