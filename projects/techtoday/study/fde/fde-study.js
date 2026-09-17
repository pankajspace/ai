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
