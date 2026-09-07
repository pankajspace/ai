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

/* ------------------------------------------------------------ viz player */

const mountViz = (root) => {
    const spec = VIZ[root.dataset.viz];
    if (!spec) return;

    const head = document.createElement("div");
    head.className = "viz-head";
    const title = document.createElement("span");
    title.className = "viz-title";
    title.textContent = root.dataset.title || spec.title;
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
    if (spec.options) {
        picker = document.createElement("select");
        picker.className = "viz-select";
        picker.setAttribute("aria-label", "Variant");
        spec.options.forEach(({ value, label }) => {
            const opt = document.createElement("option");
            opt.value = value;
            opt.textContent = label;
            picker.append(opt);
        });
        if (root.dataset.option) picker.value = root.dataset.option;
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
    picker?.addEventListener("change", load);

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
