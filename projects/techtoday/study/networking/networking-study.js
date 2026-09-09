/* ==========================================================================
   TechToday - Computer networking study guide
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
        "NaN console parseInt parseFloat isNaN BigInt Int32Array Uint8Array structuredClone " +
        "require module process Buffer setTimeout setInterval fetch URL Headers Response Request").split(" ")
);
const SH_KW = new Set(
    ("case do done elif else esac fi for function if in select then time until while export local " +
        "readonly return set unset source sudo").split(" ")
);
const SH_BUILTIN = new Set(
    ("echo cat grep awk sed cut sort uniq head tail wc curl wget dig nslookup host ping traceroute " +
        "tracepath mtr ip ifconfig route arp ss netstat lsof tcpdump tshark wireshark nmap nc ncat " +
        "socat openssl iptables nft ethtool iperf3 telnet whois ipcalc sysctl systemd-resolve resolvectl " +
        "hostname nslookup5 wrk ab hey watch xargs jq").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    bash: [SH_KW, SH_BUILTIN],
};

const buildTokenizer = (lang) => {
    const hashComment = lang === "python" || lang === "bash";
    const comment = hashComment ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
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
    const [kw, builtin] = LANG_SPEC[lang] || LANG_SPEC.python;
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

const LANG_LABEL = { python: "Python", javascript: "JavaScript", bash: "Shell", text: "Output" };
const LANG_KEY = "tt-networking-lang";
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
   Networking widgets
   ========================================================================== */

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

/* ---- 1. Encapsulation ---- */

VIZ["encapsulation"] = {
    title: "Encapsulation - one click becomes a frame on the wire",
    legend: [["lg-act", "header being added"], ["lg-done", "already wrapped"], ["lg-out", "being stripped"], ["lg-idle", "other layers"]],
    build() {
        const W = 660;
        const H = 296;
        const LAYERS = [
            ["4. Application", "HTTP"],
            ["3. Transport", "TCP"],
            ["2. Network", "IP"],
            ["1. Link", "Ethernet"],
        ];
        const ROWS = [
            [["GET /index.html", 300, 250]],
            [["TCP", 246, 54], ["GET /index.html", 300, 250]],
            [["IP", 192, 54], ["TCP", 246, 54], ["GET /index.html", 300, 250]],
            [["Eth", 138, 54], ["IP", 192, 54], ["TCP", 246, 54], ["GET /index.html", 300, 250], ["FCS", 550, 40]],
        ];
        const isNew = (i, j) => j === 0 || (i === 3 && j === 4);

        const draw = ({ act, strip }) => {
            let s = "";
            LAYERS.forEach((layer, i) => {
                const y = 26 + i * 62;
                s += capHTML(14, y + 16, layer[0], "start");
                s += capHTML(14, y + 32, layer[1], "start");
                ROWS[i].forEach((seg, j) => {
                    let cls = "n-idle";
                    if (i === act) cls = isNew(i, j) ? (strip ? "n-out" : "n-act") : "n-done";
                    s += boxHTML(seg[1], y, seg[2], 40, seg[0], cls);
                });
            });
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ act: 0 }),
                note: "The browser has 250 bytes of text to send: <code>GET /index.html</code> plus headers. At this layer there is no network at all - just a message the two applications agree on.",
            },
            {
                stage: draw({ act: 1 }),
                note: "TCP prepends a <strong>20-byte header</strong>: source port, destination port, sequence number, ACK number, flags, window. It says <em>which conversation</em> the bytes belong to and <em>where in the stream</em> they sit.",
            },
            {
                stage: draw({ act: 2 }),
                note: "IP prepends its own 20-byte header: <code>src 10.0.0.7</code>, <code>dst 93.184.216.34</code>, TTL, protocol=6. IP knows nothing about ports or streams - only <em>which machine</em>, and only well enough to pick the next hop.",
            },
            {
                stage: draw({ act: 3 }),
                note: "Ethernet wraps the lot with the MAC addresses of <em>this hop only</em> - your NIC and your router's LAN port - plus a 4-byte checksum trailer. Total overhead so far: <code>54 bytes</code> around 250 bytes of payload.",
            },
            {
                stage: draw({ act: 3 }),
                note: "That frame goes onto the wire. Every router along the way rewrites the <strong>Ethernet</strong> layer and leaves the IP, TCP and HTTP layers untouched. The outermost wrapper is local; the inner ones are end to end.",
            },
            {
                stage: draw({ act: 3, strip: true }),
                note: "At the destination NIC the process runs in reverse. Ethernet checks the FCS, sees its own MAC in the destination field, strips the frame and hands the payload up because the type field says <code>0x0800 = IPv4</code>.",
            },
            {
                stage: draw({ act: 2, strip: true }),
                note: "IP checks that the destination address is really its own, strips its header, and looks at the protocol field - <code>6</code> means hand this to TCP.",
            },
            {
                stage: draw({ act: 1, strip: true }),
                note: "TCP finds the socket that matches the four-tuple <code>(src ip, src port, dst ip, dst port)</code>, puts the bytes in sequence order, and wakes whichever process is blocked in <code>recv()</code>.",
            },
            {
                stage: draw({ act: 0 }),
                note: "The server application reads exactly the 250 bytes the browser wrote. <strong>Each layer only ever talks to its opposite number</strong> - that is the whole point of layering, and why you can swap Wi-Fi for fibre without changing a line of HTTP.",
            },
        ];
    },
};

/* ---- 2. ARP ---- */

const LAN_W = 660;
const LAN_H = 292;

const lanHTML = (st, extra = "") => {
    let s = pathHTML("M156 48 H212 V132 H268", st.eA || "e-idle");
    s += pathHTML("M156 244 H212 V168 H268", st.eB || "e-idle");
    s += pathHTML("M504 48 H448 V132 H392", st.eC || "e-idle");
    s += pathHTML("M504 244 H448 V168 H392", st.eD || "e-idle");
    s += boxHTML(268, 118, 124, 64, "switch", st.sw || "n-idle");
    s += boxHTML(24, 26, 132, 44, "A", st.A || "n-idle", "10.0.0.7  aa:07");
    s += boxHTML(24, 222, 132, 44, "B", st.B || "n-idle", "10.0.0.8  bb:08");
    s += boxHTML(504, 26, 132, 44, "C", st.C || "n-idle", "10.0.0.9  cc:09");
    s += boxHTML(504, 222, 132, 44, "D", st.D || "n-idle", "10.0.0.10  dd:10");
    s += capHTML(214, 128, "port 1", "end");
    s += capHTML(214, 178, "port 2", "end");
    s += capHTML(446, 128, "port 3", "start");
    s += capHTML(446, 178, "port 4", "start");
    return svgHTML(LAN_W, LAN_H, s + extra);
};

VIZ["arp"] = {
    title: "ARP - turning an IP address into a MAC address",
    legend: [["lg-act", "sending / active link"], ["lg-done", "answered"], ["lg-out", "ignores the frame"], ["lg-idle", "quiet"]],
    build() {
        const cache = (rows, marks) =>
            dataGridHTML([["ARP cache", "IP", "MAC", "age"], ...rows], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const EMPTY = [["on A", "none yet", "-", "-"]];
        const RESOLVED = (age) => [["on A", "10.0.0.9", "cc:09", age]];

        return [
            {
                stage: lanHTML({ A: "n-act" }) + cache(EMPTY, head),
                note: "A wants to send an IP packet to <code>10.0.0.9</code>. Same subnet, so no router is involved - but the NIC cannot address anything by IP. It needs a <strong>MAC address</strong>, and it has none.",
            },
            {
                stage: lanHTML({ A: "n-act", eA: "e-act", sw: "n-act" }) + cache(EMPTY, head),
                note: "A builds an ARP request: <em>\"who has 10.0.0.9? tell 10.0.0.7\"</em>, and addresses the frame to <code>ff:ff:ff:ff:ff:ff</code> - the broadcast MAC. That is a question shouted at the entire segment.",
            },
            {
                stage: lanHTML({ A: "n-done", eA: "e-done", sw: "n-act", eB: "e-act", eC: "e-act", eD: "e-act", B: "n-act", C: "n-act", D: "n-act" }) + cache(EMPTY, head),
                note: "The switch has no choice with a broadcast: it floods the frame out of <em>every</em> port except the one it arrived on. Every machine on the segment is interrupted and has to look at it.",
            },
            {
                stage: lanHTML({ A: "n-done", eA: "e-done", sw: "n-done", eB: "e-done", eC: "e-done", eD: "e-done", B: "n-out", C: "n-act", D: "n-out" }) + cache(EMPTY, head),
                note: "B and D compare the target IP with their own, see no match and drop it. Only C matches - and while it is here it also records that <code>10.0.0.7</code> lives at <code>aa:07</code>. ARP is chatty but self-populating.",
            },
            {
                stage: lanHTML({ C: "n-act", eC: "e-act", sw: "n-act" }) + cache(EMPTY, head),
                note: "C replies - but as a <strong>unicast</strong>, straight back to <code>aa:07</code>. The answer does not need to be broadcast because C now knows exactly where A is.",
            },
            {
                stage: lanHTML({ C: "n-done", eC: "e-done", sw: "n-done", eA: "e-act", A: "n-act" }) + cache(RESOLVED("0s"), { ...head, "1,1": "is-act", "1,2": "is-act" }),
                note: "A caches the mapping. On Linux, <code>ip neigh</code> shows this table; entries live for minutes, not hours, so a machine that changes NIC is found again quickly.",
            },
            {
                stage: lanHTML({ A: "n-act", eA: "e-done", sw: "n-done", eC: "e-done", C: "n-done" }) + cache(RESOLVED("3s"), { ...head, "1,1": "is-done", "1,2": "is-done" }),
                note: "Only <em>now</em> does the real packet move, and every later packet skips all of this. <strong>ARP is the cost of the first packet to a new neighbour</strong> - one broadcast, one reply, then silence.",
            },
            {
                stage: lanHTML({ A: "n-done", eA: "e-done", sw: "n-done", eC: "e-done", C: "n-done" }) + cache([["on A", "10.0.0.9", "cc:09", "3s"], ["on A", "10.0.0.1", "ee:01", "12s"]], { ...head, "1,1": "is-done", "1,2": "is-done", "2,1": "is-done", "2,2": "is-done" }),
                note: "Two consequences worth remembering. ARP has <strong>no authentication</strong>, so anyone on the segment can claim any IP (ARP spoofing). And for an address <em>outside</em> the subnet, A ARPs for the <strong>router</strong>, not the destination - the second row here.",
            },
        ];
    },
};

/* ---- 3. Switch learning ---- */

VIZ["switching"] = {
    title: "How a switch learns where everyone is",
    legend: [["lg-act", "frame travelling here"], ["lg-done", "learned / delivered"], ["lg-out", "flooded needlessly"], ["lg-idle", "idle port"]],
    build() {
        const cam = (rows, marks) =>
            dataGridHTML([["MAC table", "MAC", "port"], ...rows], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head" };
        const EMPTY = [["entry", "none yet", "-"]];

        return [
            {
                stage: lanHTML({ sw: "n-idle" }) + cam(EMPTY, head),
                note: "A switch boots knowing nothing. Its <strong>MAC address table</strong> (the CAM table) is empty, so it cannot yet forward anything intelligently.",
            },
            {
                stage: lanHTML({ A: "n-act", eA: "e-act", sw: "n-act" }) + cam(EMPTY, head),
                note: "A sends a frame to C's MAC. It arrives on <strong>port 1</strong>. The switch does two independent things with it - learn, then forward.",
            },
            {
                stage: lanHTML({ A: "n-done", eA: "e-done", sw: "n-act" }) + cam([["learn", "aa:07", "1"]], { ...head, "1,1": "is-act", "1,2": "is-act" }),
                note: "<strong>Learning</strong> uses the <em>source</em> address: whoever sent this frame is reachable through port 1. The switch never needs to be configured - it deduces the topology from ordinary traffic.",
            },
            {
                stage: lanHTML({ A: "n-done", eA: "e-done", sw: "n-act", eB: "e-act", eC: "e-act", eD: "e-act", B: "n-out", C: "n-act", D: "n-out" }) + cam([["learn", "aa:07", "1"]], { ...head, "1,1": "is-done", "1,2": "is-done" }),
                note: "<strong>Forwarding</strong> uses the <em>destination</em> address - and <code>cc:09</code> is not in the table yet. An unknown unicast is <strong>flooded</strong> out of every other port, exactly like a broadcast. B and D drop it.",
            },
            {
                stage: lanHTML({ C: "n-act", eC: "e-act", sw: "n-act" }) + cam([["learn", "aa:07", "1"]], { ...head, "1,1": "is-done", "1,2": "is-done" }),
                note: "C replies. This frame arrives on <strong>port 3</strong>, so the switch learns the other half of the pair.",
            },
            {
                stage: lanHTML({ C: "n-done", eC: "e-done", sw: "n-done", eA: "e-act", A: "n-act" }) + cam([["entry", "aa:07", "1"], ["learn", "cc:09", "3"]], { ...head, "1,1": "is-done", "1,2": "is-done", "2,1": "is-act", "2,2": "is-act" }),
                note: "And because <code>aa:07</code> <em>is</em> now known, the reply is sent out of port 1 only. B and D never see it.",
            },
            {
                stage: lanHTML({ A: "n-act", eA: "e-act", sw: "n-done", eC: "e-act", C: "n-done", B: "n-idle", D: "n-idle" }) + cam([["entry", "aa:07", "1"], ["entry", "cc:09", "3"]], { ...head, "1,1": "is-done", "1,2": "is-done", "2,1": "is-done", "2,2": "is-done" }),
                note: "From here the conversation is <strong>switched</strong>, not flooded: a private path between ports 1 and 3 at full line rate, while B and D can talk to each other simultaneously. That is the difference between a switch and the old shared hub.",
            },
            {
                stage: lanHTML({ sw: "n-out", eA: "e-act", eB: "e-act", eC: "e-act", eD: "e-act", A: "n-out", B: "n-out", C: "n-out", D: "n-out" }) + cam([["entry", "aa:07", "1"], ["entry", "cc:09", "3"]], { ...head, "1,1": "is-done", "1,2": "is-done", "2,1": "is-done", "2,2": "is-done" }),
                note: "The failure mode: <strong>broadcasts are never learned away</strong>. ARP, DHCP and mDNS reach every port forever, which is why one flat LAN does not scale and why we cut it into VLANs and subnets. A loop between two switches turns this into a broadcast storm that melts the segment.",
            },
        ];
    },
};

/* ---- 4. Subnetting ---- */

const bits = (n, width = 8) => n.toString(2).padStart(width, "0");
const octets = (v) => [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
const dotted = (v) => octets(v).join(".");

VIZ["subnetting"] = {
    title: "Reading a CIDR prefix",
    legend: [["lg-cmp", "network bits"], ["lg-act", "host bits"], ["lg-done", "computed result"], ["lg-idle", "given"]],
    options: [
        { value: "26", label: "Reading a /26 prefix" },
        { value: "24", label: "Reading a /24 prefix" },
        { value: "20", label: "Reading a /20 prefix" },
    ],
    build(option) {
        const prefix = Number(option || "26");
        const ipVal = (192 << 24) | (168 << 16) | (10 << 8) | 130;
        const maskVal = prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
        const netVal = (ipVal & maskVal) >>> 0;
        const bcastVal = (netVal | (~maskVal >>> 0)) >>> 0;
        const hostBits = 32 - prefix;
        const usable = Math.pow(2, hostBits) - 2;

        const row = (label, value, note) => [label, ...octets(value).map((o) => bits(o)), note];
        const head = {};
        for (let c = 0; c < 6; c++) head[`0,${c}`] = "is-head";

        const table = (rows, marks) =>
            dataGridHTML(
                [["bits", "octet 1", "octet 2", "octet 3", "octet 4", "dotted"], ...rows],
                { ...head, ...marks }
            );
        const labelCol = (n) => {
            const m = {};
            for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head";
            return m;
        };

        const frames = [];
        frames.push({
            stage: table([row("address", ipVal, dotted(ipVal))], labelCol(1)),
            note: `The address <code>${dotted(ipVal)}/${prefix}</code> is just <strong>32 bits</strong>. The dots are a human convenience - the machine never sees them, it sees this row of bits.`,
        });
        frames.push({
            stage: table(
                [row("address", ipVal, dotted(ipVal)), row("mask /" + prefix, maskVal, dotted(maskVal))],
                { ...labelCol(2), "2,1": "is-cmp", "2,2": "is-cmp", "2,3": "is-cmp", "2,4": "is-cmp" }
            ),
            note: `The prefix <code>/${prefix}</code> means <strong>the first ${prefix} bits are the network</strong>. Written out as a mask that is <code>${dotted(maskVal)}</code>. The 1s and the 0s never interleave - a mask is always a run of 1s followed by a run of 0s.`,
        });
        frames.push({
            stage: table(
                [row("address", ipVal, dotted(ipVal)), row("mask /" + prefix, maskVal, dotted(maskVal)), row("network", netVal, dotted(netVal))],
                { ...labelCol(3), "3,1": "is-done", "3,2": "is-done", "3,3": "is-done", "3,4": "is-done" }
            ),
            note: `<strong>Network address = address AND mask</strong>: keep the network bits, zero every host bit. Result <code>${dotted(netVal)}</code>. This is the single test a router performs, millions of times a second.`,
        });
        frames.push({
            stage: table(
                [row("address", ipVal, dotted(ipVal)), row("mask /" + prefix, maskVal, dotted(maskVal)), row("network", netVal, dotted(netVal)), row("broadcast", bcastVal, dotted(bcastVal))],
                { ...labelCol(4), "3,4": "is-done", "4,4": "is-act" }
            ),
            note: `<strong>Broadcast = network OR inverted mask</strong>: set every host bit to 1, giving <code>${dotted(bcastVal)}</code>. A packet sent here reaches every host in the subnet, so it cannot be given to any single machine.`,
        });
        frames.push({
            stage: table(
                [row("network", netVal, dotted(netVal)), row("first host", (netVal + 1) >>> 0, dotted((netVal + 1) >>> 0)), row("last host", (bcastVal - 1) >>> 0, dotted((bcastVal - 1) >>> 0)), row("broadcast", bcastVal, dotted(bcastVal))],
                { ...labelCol(4), "1,5": "is-cmp", "2,5": "is-act", "3,5": "is-act", "4,5": "is-cmp" }
            ),
            note: `So the usable range is <code>${dotted((netVal + 1) >>> 0)} - ${dotted((bcastVal - 1) >>> 0)}</code>. Two addresses are burnt at each end: <strong>${hostBits} host bits give 2^${hostBits} = ${Math.pow(2, hostBits)} addresses, ${usable} of them usable</strong>.`,
        });
        frames.push({
            stage: table(
                [row("network", netVal, dotted(netVal)), row("mask /" + prefix, maskVal, dotted(maskVal))],
                { ...labelCol(2), "2,4": "is-cmp" }
            ),
            note: `The arithmetic that matters in interviews: <strong>every extra prefix bit halves the subnet</strong>. /24 = 254 hosts, /25 = 126, /26 = 62, /27 = 30, /28 = 14, /29 = 6, /30 = 2. Memorise that ladder and you never need a calculator.`,
        });
        frames.push({
            stage: table(
                [
                    row("subnet A /" + (prefix + 2), netVal, dotted(netVal) + "/" + (prefix + 2)),
                    row("subnet B /" + (prefix + 2), (netVal + Math.pow(2, hostBits - 2)) >>> 0, dotted((netVal + Math.pow(2, hostBits - 2)) >>> 0) + "/" + (prefix + 2)),
                    row("subnet C /" + (prefix + 2), (netVal + 2 * Math.pow(2, hostBits - 2)) >>> 0, dotted((netVal + 2 * Math.pow(2, hostBits - 2)) >>> 0) + "/" + (prefix + 2)),
                    row("subnet D /" + (prefix + 2), (netVal + 3 * Math.pow(2, hostBits - 2)) >>> 0, dotted((netVal + 3 * Math.pow(2, hostBits - 2)) >>> 0) + "/" + (prefix + 2)),
                ],
                { ...labelCol(4), "1,4": "is-act", "2,4": "is-act", "3,4": "is-act", "4,4": "is-act" }
            ),
            note: `Borrowing <strong>2 more bits</strong> splits <code>/${prefix}</code> into four <code>/${prefix + 2}</code> blocks - which is exactly what you do when you carve a VPC into public and private subnets per availability zone. Nothing else changes; you just moved the boundary right.`,
        });
        return frames;
    },
};

/* ---- 5. Routing ---- */

const NET_NODES = {
    A: { x: 56, y: 140, r: 28, label: "A", sub: "10.0.0.7" },
    R1: { x: 176, y: 140, r: 26, label: "R1", sub: "your router" },
    R2: { x: 300, y: 68, r: 26, label: "R2", sub: "ISP core" },
    R3: { x: 300, y: 212, r: 26, label: "R3", sub: "peer" },
    R4: { x: 424, y: 140, r: 26, label: "R4", sub: "edge" },
    S: { x: 566, y: 140, r: 28, label: "S", sub: "93.184.216.34" },
};
const NET_EDGES = [["A", "R1"], ["R1", "R2"], ["R1", "R3"], ["R2", "R4"], ["R3", "R4"], ["R4", "S"]];

const netHTML = (states = {}, edgeStates = {}, caption = "") => {
    let s = "";
    NET_EDGES.forEach(([a, b]) => {
        const na = NET_NODES[a];
        const nb = NET_NODES[b];
        s += edgeHTML(na.x, na.y, nb.x, nb.y, edgeStates[`${a}-${b}`] || "e-idle");
    });
    Object.entries(NET_NODES).forEach(([id, n]) => {
        s += nodeHTML(n.x, n.y, n.label, states[id] || "n-idle", n.r, n.sub);
    });
    if (caption) s += capHTML(330, 24, caption);
    return svgHTML(660, 276, s);
};

VIZ["routing"] = {
    title: "Hop by hop - how a packet finds a machine it has never met",
    legend: [["lg-act", "holding the packet"], ["lg-done", "already forwarded"], ["lg-idle", "not on the path"]],
    build() {
        const table = (rows, marks) =>
            dataGridHTML([["R1 routing table", "destination", "prefix", "next hop"], ...rows.map((r) => [r[0] || "route", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const rows = [
            ["", "10.0.0.0", "/24", "on-link (LAN)"],
            ["", "93.184.0.0", "/16", "R3"],
            ["", "93.184.216.0", "/24", "R2"],
            ["", "0.0.0.0", "/0", "R2 (default)"],
        ];
        const pick = (i) => {
            const m = { ...head };
            for (let r = 1; r <= 4; r++) m[`${r},0`] = "is-head";
            if (i !== undefined) { m[`${i},1`] = "is-act"; m[`${i},2`] = "is-act"; m[`${i},3`] = "is-act"; }
            return m;
        };

        return [
            {
                stage: netHTML({ A: "n-act" }, {}, "TTL 64") + table(rows, pick()),
                note: "A wants to reach <code>93.184.216.34</code>. It masks that against its own <code>/24</code>, sees a different network, and concludes: <strong>not local - send it to the default gateway</strong>. That is the only routing decision an ordinary host ever makes.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-act" }, { "A-R1": "e-act" }, "TTL 64") + table(rows, pick()),
                note: "The frame arrives at R1. R1 throws away the Ethernet header, looks at the IP destination, and consults its table. Note what it does <em>not</em> have: any knowledge of the route beyond the next hop.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-act" }, { "A-R1": "e-done" }, "TTL 64") + table(rows, pick(3)),
                note: "Three entries match. <code>0.0.0.0/0</code> matches everything, so it is always a candidate - which is why every host has a default route.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-act" }, { "A-R1": "e-done" }, "TTL 64") + table(rows, pick(2)),
                note: "<strong>Longest prefix match wins.</strong> <code>/24</code> beats <code>/16</code> beats <code>/0</code>, so the packet goes to R2 - regardless of the order the rows appear in. More specific always overrides more general.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-act" }, { "A-R1": "e-done", "R1-R2": "e-act" }, "TTL 63") + table(rows, pick(2)),
                note: "R1 decrements <strong>TTL to 63</strong>, recomputes the header checksum, wraps the packet in a <em>brand new</em> Ethernet frame for the R1-R2 link, and sends it. The IP and TCP headers are untouched.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R4: "n-act" }, { "A-R1": "e-done", "R1-R2": "e-done", "R2-R4": "e-act" }, "TTL 62") + table(rows, pick(2)),
                note: "R2 repeats the identical algorithm with its own table. Nobody plans the whole route; each hop only knows the next one. <strong>Routing is a distributed algorithm with no coordinator.</strong>",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R4: "n-done", S: "n-act" }, { "A-R1": "e-done", "R1-R2": "e-done", "R2-R4": "e-done", "R4-S": "e-act" }, "TTL 61") + table(rows, pick(2)),
                note: "R4 sees the destination on a directly connected network, ARPs for it, and delivers. Four hops, four Ethernet rewrites, one unchanged IP header.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-out", R3: "n-out" }, { "A-R1": "e-done", "R1-R3": "e-act" }, "TTL 1 - discarded") + table(rows, pick(1)),
                note: "The safety net: if two routers ever disagree and pass a packet back and forth, <strong>TTL hits zero</strong> and the packet is destroyed. The router sends back an ICMP <em>time exceeded</em> - which is precisely the mechanism <code>traceroute</code> abuses to map the path.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R3: "n-act", R4: "n-idle" }, { "A-R1": "e-done", "R1-R3": "e-act" }, "same packet, different day") + table(rows, pick(1)),
                note: "Last idea: the path is <strong>not fixed</strong>. If R2 goes down, the protocols withdraw the <code>/24</code> and the very next packet leaves via R3. Two packets of the same TCP connection can take different routes - which is exactly why reordering exists and why TCP must number its bytes.",
            },
        ];
    },
};

/* ---- 6. NAT ---- */

VIZ["nat"] = {
    title: "NAT - many private hosts behind one public address",
    legend: [["lg-act", "packet here now"], ["lg-done", "translated"], ["lg-idle", "waiting"]],
    build() {
        const W = 660;
        const H = 300;
        const draw = (st, hdr) => {
            let s = bandHTML(14, 40, 240, 224, "PRIVATE  10.0.0.0/24");
            s += bandHTML(410, 40, 236, 224, "PUBLIC INTERNET");
            s += boxHTML(36, 78, 190, 44, "laptop", st.A || "n-idle", "10.0.0.7:51514");
            s += boxHTML(36, 172, 190, 44, "phone", st.B || "n-idle", "10.0.0.8:51514");
            s += boxHTML(274, 118, 116, 66, "NAT", st.N || "n-idle", "203.0.113.5");
            s += boxHTML(436, 118, 190, 44, "web server", st.S || "n-idle", "93.184.216.34:443");
            s += pathHTML("M226 100 H250 V140 H274", st.eA || "e-idle");
            s += pathHTML("M226 194 H250 V162 H274", st.eB || "e-idle");
            s += pathHTML("M390 140 H436", st.eS || "e-idle");
            if (hdr) s += capHTML(330, 274, hdr);
            return svgHTML(W, H, s);
        };
        const table = (rows, marks) =>
            dataGridHTML([["NAT table", "inside", "outside", "destination"], ...rows.map((r) => [r[0] || "entry", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };

        return [
            {
                stage: draw({ A: "n-act" }, "src 10.0.0.7:51514  ->  dst 93.184.216.34:443") + table([["", "none yet", "-", "-"]], lab(1)),
                note: "The laptop sends a packet with its <strong>private</strong> source address. That address is not routable on the internet - every home network in the world reuses <code>10.0.0.0/8</code> or <code>192.168.0.0/16</code>, so no reply could ever find its way back.",
            },
            {
                stage: draw({ A: "n-done", eA: "e-act", N: "n-act" }, "src 10.0.0.7:51514  ->  dst 93.184.216.34:443") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"]], { ...lab(1), "1,1": "is-act", "1,2": "is-act" }),
                note: "The NAT router rewrites the source to <strong>its own public address and a spare port</strong>, and writes the swap into a table. This is really <em>NAPT</em> - port translation - which is why one public IP can serve a whole household.",
            },
            {
                stage: draw({ A: "n-done", eA: "e-done", N: "n-done", eS: "e-act", S: "n-act" }, "src 203.0.113.5:40001  ->  dst 93.184.216.34:443") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"]], { ...lab(1), "1,2": "is-done" }),
                note: "The server sees only <code>203.0.113.5:40001</code>. It has no idea a private network exists, and it replies to that address. <strong>NAT works because the reply is symmetric.</strong>",
            },
            {
                stage: draw({ N: "n-act", eS: "e-act", S: "n-done" }, "src 93.184.216.34:443  ->  dst 203.0.113.5:40001") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"]], { ...lab(1), "1,2": "is-act" }),
                note: "The reply arrives at the router. Port <code>40001</code> is the only clue about who asked - the router looks it up in the table.",
            },
            {
                stage: draw({ N: "n-done", eA: "e-act", A: "n-act" }, "src 93.184.216.34:443  ->  dst 10.0.0.7:51514") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"]], { ...lab(1), "1,1": "is-done" }),
                note: "Destination rewritten back to <code>10.0.0.7:51514</code>, delivered. The laptop never learns any of this happened.",
            },
            {
                stage: draw({ B: "n-act", eB: "e-act", N: "n-act" }, "src 10.0.0.8:51514  ->  dst 93.184.216.34:443") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"], ["", "10.0.0.8:51514", "203.0.113.5:40002", "93.184.216.34:443"]], { ...lab(2), "2,1": "is-act", "2,2": "is-act" }),
                note: "Now the phone dials the same server <em>from the same source port</em>. No conflict: the router simply picks a different outside port. The pair <code>(public ip, public port)</code> is what keeps the flows apart.",
            },
            {
                stage: draw({ S: "n-act", eS: "e-act", N: "n-out" }, "src 93.184.216.34  ->  dst 203.0.113.5:9999   DROPPED") + table([["", "10.0.0.7:51514", "203.0.113.5:40001", "93.184.216.34:443"], ["", "10.0.0.8:51514", "203.0.113.5:40002", "93.184.216.34:443"]], lab(2)),
                note: "The consequence people feel: an <strong>unsolicited inbound packet has no table entry</strong>, so it is dropped. That is a free firewall - and the reason you cannot run a server at home without port forwarding, and why peer-to-peer needs STUN, TURN and hole punching.",
            },
            {
                stage: draw({ A: "n-idle", B: "n-idle", N: "n-idle" }, "entries expire: TCP ~2h idle, UDP ~30s idle") + table([["", "expired", "-", "-"]], lab(1)),
                note: "Entries are <strong>soft state</strong> and time out. A long-idle TCP connection silently loses its mapping and then hangs - which is exactly why TCP keep-alives, and application-level pings on WebSockets, exist.",
            },
        ];
    },
};

/* ---- 7. DHCP ---- */

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

VIZ["dhcp"] = {
    title: "DHCP - how a machine gets an address before it has one",
    legend: [["lg-act", "this step"], ["lg-done", "completed"], ["lg-idle", "not yet"]],
    build() {
        const W = 660;
        const H = 300;
        const lanes = (c, s) => [
            { x: 130, label: "new laptop", sub: "0.0.0.0", state: c || "n-idle" },
            { x: 530, label: "DHCP server", sub: "10.0.0.1", state: s || "n-idle" },
        ];
        const M = [
            { from: 0, to: 1, y: 120, text: "DISCOVER  (broadcast)" },
            { from: 1, to: 0, y: 172, text: "OFFER  10.0.0.42" },
            { from: 0, to: 1, y: 224, text: "REQUEST  10.0.0.42" },
            { from: 1, to: 0, y: 272, text: "ACK  lease 24h" },
        ];
        const upTo = (n, actIdx) => M.slice(0, n).map((m, i) => ({ ...m, state: i === actIdx ? "e-act" : "e-done" }));

        return [
            {
                stage: seqHTML(W, H, lanes("n-act"), [], [{ x: 130, y: 104, text: "I have no address at all" }]),
                note: "A machine joining a network has a chicken-and-egg problem: it needs an IP address to talk, and it must talk to get one. DHCP solves it with <strong>broadcast</strong>.",
            },
            {
                stage: seqHTML(W, H, lanes("n-act"), upTo(1, 0), [{ x: 130, y: 104, text: "src 0.0.0.0  dst 255.255.255.255" }]),
                note: "<strong>DISCOVER</strong> - sent from <code>0.0.0.0</code> to the broadcast address on UDP port 67, so every machine on the segment sees it. Only a DHCP server is listening.",
            },
            {
                stage: seqHTML(W, H, lanes("n-done", "n-act"), upTo(2, 1), [{ x: 530, y: 104, text: "picks a free lease" }]),
                note: "<strong>OFFER</strong> - the server proposes an address plus everything else the client needs: subnet mask, default gateway, DNS servers, lease time. Most of what you think of as \"network settings\" arrives in this one message.",
            },
            {
                stage: seqHTML(W, H, lanes("n-act", "n-done"), upTo(3, 2), [{ x: 130, y: 104, text: "accepts one offer" }]),
                note: "<strong>REQUEST</strong> - also broadcast, and deliberately so: it tells any <em>other</em> DHCP server that its offer was declined, so it can return that address to the pool.",
            },
            {
                stage: seqHTML(W, H, lanes("n-done", "n-done"), upTo(4, 3), [{ x: 530, y: 104, text: "commits the lease" }]),
                note: "<strong>ACK</strong> - the lease is committed. D-O-R-A. The address is <em>borrowed</em>, not owned: at 50% of the lease the client quietly renews with a unicast REQUEST.",
            },
            {
                stage: seqHTML(W, H, lanes("n-done", "n-done"), upTo(4, -1), [{ x: 130, y: 104, text: "10.0.0.42/24  gw 10.0.0.1" }, { x: 530, y: 104, text: "lease table updated" }]),
                note: "Two practical consequences. First, an address can change between reboots - which is why servers get <strong>reservations</strong> or static addresses. Second, if you ever see a machine holding <code>169.254.x.x</code>, that is APIPA: <strong>nobody answered the DISCOVER</strong>, so the DHCP path is what you go and check.",
            },
        ];
    },
};

/* ---- 8. Ports and sockets ---- */

VIZ["sockets"] = {
    title: "One port, many connections - the four-tuple",
    legend: [["lg-act", "new connection"], ["lg-done", "established"], ["lg-idle", "listening"]],
    build() {
        const W = 660;
        const H = 268;
        const draw = (n, act) => {
            let s = boxHTML(252, 20, 156, 44, "server :443", n === 0 ? "n-act" : "n-done", "one listening socket");
            const ys = [110, 168, 226];
            const clients = [
                ["client A  1.2.3.4:51514", "e"],
                ["client B  5.6.7.8:44120", "e"],
                ["client A  1.2.3.4:51520", "e"],
            ];
            clients.forEach((c, i) => {
                const shown = i < n;
                const st = !shown ? "n-idle" : i === act ? "n-act" : "n-done";
                s += boxHTML(30, ys[i] - 20, 210, 40, c[0], st);
                s += pathHTML(`M240 ${ys[i]} H330 V64`, !shown ? "e-idle" : i === act ? "e-act" : "e-done");
                s += boxHTML(420, ys[i] - 20, 210, 40, shown ? `fd ${4 + i}` : "-", st, shown ? "ESTABLISHED" : "");
            });
            return svgHTML(W, H, s);
        };
        const table = (rows, marks) =>
            dataGridHTML([["socket table", "local", "remote", "state"], ...rows.map((r) => [r[0] || "socket", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };
        const R = [
            ["listen", "0.0.0.0:443", "*:*", "LISTEN"],
            ["", "9.9.9.9:443", "1.2.3.4:51514", "ESTABLISHED"],
            ["", "9.9.9.9:443", "5.6.7.8:44120", "ESTABLISHED"],
            ["", "9.9.9.9:443", "1.2.3.4:51520", "ESTABLISHED"],
        ];

        return [
            {
                stage: draw(0) + table([R[0]], lab(1)),
                note: "A server calls <code>bind()</code> then <code>listen()</code> on port 443. That creates <strong>one</strong> socket, and it is not a connection - it is a queue for arriving handshakes.",
            },
            {
                stage: draw(1, 0) + table([R[0], R[1]], { ...lab(2), "2,2": "is-act" }),
                note: "The first client connects. <code>accept()</code> returns a <em>new</em> file descriptor. The listening socket is untouched and still on port 443 - two sockets now share that port number.",
            },
            {
                stage: draw(2, 1) + table([R[0], R[1], R[2]], { ...lab(3), "3,2": "is-act" }),
                note: "A second client connects to the same port. No conflict: the kernel demultiplexes on the <strong>four-tuple</strong> <code>(src ip, src port, dst ip, dst port)</code>, and the remote address differs.",
            },
            {
                stage: draw(3, 2) + table(R, { ...lab(4), "4,2": "is-act" }),
                note: "Even the <em>same client</em> can open a second connection - it just picks a different ephemeral source port. Only one of the four fields has to differ for the tuple to be unique.",
            },
            {
                stage: draw(3, -1) + table(R, lab(4)),
                note: "So \"how many connections can a server take on port 443?\" has nothing to do with ports: it is bounded by memory and file descriptors, not by 65535. <strong>The client is the one that runs out of ports</strong> - roughly 28,000 ephemeral ports per destination pair on Linux.",
            },
            {
                stage: draw(3, -1) + table([["", "0.0.0.0:443", "*:*", "LISTEN"], ["", "9.9.9.9:443", "1.2.3.4:51514", "TIME_WAIT"], ["", "9.9.9.9:22", "*:*", "LISTEN"], ["", "0.0.0.0:53", "*:*", "UDP"]], lab(4)),
                note: "This table is literally what <code>ss -tulpn</code> prints. When you debug \"connection refused\", you are asking one question of it: <strong>is anything in LISTEN on that address and port?</strong> Note <code>0.0.0.0</code> means every interface, while <code>127.0.0.1</code> would mean localhost only - the single most common container networking mistake.",
            },
        ];
    },
};

/* ---- 9. UDP vs TCP ---- */

VIZ["udp-vs-tcp"] = {
    title: "The same five messages, two transports",
    legend: [["lg-act", "in flight"], ["lg-done", "delivered in order"], ["lg-out", "lost or discarded"], ["lg-idle", "not sent yet"]],
    options: [
        { value: "udp", label: "Five messages over UDP" },
        { value: "tcp", label: "Five messages over TCP" },
    ],
    build(option) {
        const mode = option || "udp";
        const W = 660;
        const H = 300;
        const lanes = [
            { x: 130, label: "sender", sub: mode === "udp" ? "sendto()" : "send()" },
            { x: 530, label: "receiver", sub: mode === "udp" ? "recvfrom()" : "recv()" },
        ];
        const app = (items, marks) => dataGridHTML([["what the app reads", ...items]], marks);
        const frames = [];

        if (mode === "udp") {
            const head = { "0,0": "is-head" };

            frames.push({
                stage: seqHTML(W, H, lanes, [{ from: 0, to: 1, y: 110, text: "datagram 1", state: "e-act" }]) + app(["1"], { ...head, "0,1": "is-act" }),
                note: "UDP has no setup. The first packet <em>is</em> the conversation: one <code>sendto()</code> becomes exactly one datagram on the wire, and it is delivered whole or not at all.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 110, text: "datagram 1", state: "e-done" },
                    { from: 0, to: 1, y: 150, text: "datagram 2", state: "e-act" },
                    { from: 0, to: 1, y: 190, text: "datagram 3", state: "e-act" },
                ]) + app(["1", "2", "3"], { ...head, "0,2": "is-act", "0,3": "is-act" }),
                note: "The sender does not wait for anything. It can push datagrams as fast as the NIC accepts them - there is no window, no ACK, no round trip to pay for.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 110, text: "datagram 1", state: "e-done" },
                    { from: 0, to: 1, y: 150, text: "datagram 2", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "datagram 3", state: "e-done" },
                ], [{ x: 330, y: 232, text: "datagram 4  ---  lost in a full router queue" }]) + app(["1", "2", "3", "-"], { ...head, "0,4": "is-empty" }),
                note: "A router queue fills and drops number 4. <strong>Nobody is told.</strong> Not the sender, not the receiver, not the application - the packet simply never existed as far as either end knows.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 110, text: "datagram 1", state: "e-done" },
                    { from: 0, to: 1, y: 150, text: "datagram 3", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "datagram 2", state: "e-done" },
                    { from: 0, to: 1, y: 230, text: "datagram 5", state: "e-act" },
                ]) + app(["1", "3", "2", "5"], { ...head, "0,2": "is-act", "0,3": "is-act" }),
                note: "Worse, 2 and 3 took different routes and arrive swapped. UDP hands them up <strong>in arrival order</strong>. If order matters to you, you must number them yourself.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 130, text: "5 sent", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "4 arrived, reordered", state: "e-done" },
                ]) + app(["1", "3", "2", "5"], { ...head, "0,1": "is-done", "0,2": "is-done", "0,3": "is-done", "0,4": "is-done" }),
                note: "That is the entire deal: <strong>UDP = IP plus ports plus a checksum</strong>, 8 bytes of header and no promises. You take it when late data is worthless (voice, video, games), when you have one small request and reply (DNS), or when you intend to build your own reliability (QUIC).",
            });
        } else {
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 106, text: "SYN", state: "e-act" },
                    { from: 1, to: 0, y: 142, text: "SYN + ACK", state: "e-idle" },
                    { from: 0, to: 1, y: 178, text: "ACK", state: "e-idle" },
                ]) + app(["nothing yet"], { "0,0": "is-head" }),
                note: "TCP will not carry a single byte until both ends agree to talk. You pay <strong>one full round trip</strong> before any data moves - the price of everything that follows.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 106, text: "SYN", state: "e-done" },
                    { from: 1, to: 0, y: 142, text: "SYN + ACK", state: "e-done" },
                    { from: 0, to: 1, y: 178, text: "ACK", state: "e-done" },
                    { from: 0, to: 1, y: 220, text: "seq 1  bytes 1-3", state: "e-act" },
                ]) + app(["1", "2", "3"], { "0,0": "is-head", "0,1": "is-act", "0,2": "is-act", "0,3": "is-act" }),
                note: "Now data flows - and it is a <strong>byte stream</strong>, not messages. Three application writes may arrive as one segment, or one write may be split across two. TCP preserves bytes, never boundaries.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 106, text: "seq 1-3", state: "e-done" },
                    { from: 1, to: 0, y: 146, text: "ACK 4", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "seq 4  ---  lost", state: "e-idle" },
                    { from: 0, to: 1, y: 232, text: "seq 5", state: "e-act" },
                ], [{ x: 330, y: 208, text: "segment 4 dropped by a full queue" }]) + app(["1", "2", "3", "blocked"], { "0,0": "is-head", "0,1": "is-done", "0,2": "is-done", "0,3": "is-done", "0,4": "is-empty" }),
                note: "Segment 4 is lost. Segment 5 <em>arrives</em> - but TCP will not hand it up, because the app must see bytes in order. This is <strong>head-of-line blocking</strong>, and it is the price of the ordering guarantee.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 1, to: 0, y: 120, text: "dup ACK 4", state: "e-act" },
                    { from: 1, to: 0, y: 156, text: "dup ACK 4", state: "e-act" },
                    { from: 0, to: 1, y: 210, text: "retransmit seq 4", state: "e-act" },
                ]) + app(["1", "2", "3", "blocked"], { "0,0": "is-head", "0,1": "is-done", "0,2": "is-done", "0,3": "is-done", "0,4": "is-empty" }),
                note: "The receiver keeps re-acknowledging 4 - \"still waiting for 4\". Three of those and the sender retransmits without waiting for a timer. The application knows nothing about any of it.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 140, text: "seq 4 arrives", state: "e-done" },
                    { from: 1, to: 0, y: 200, text: "ACK 6", state: "e-done" },
                ]) + app(["1", "2", "3", "4", "5"], { "0,0": "is-head", "0,1": "is-done", "0,2": "is-done", "0,3": "is-done", "0,4": "is-act", "0,5": "is-act" }),
                note: "4 arrives, and 4 <em>and</em> 5 are released together. <strong>The application saw a perfect, ordered stream</strong> and never learned there was loss - only that there was a pause.",
            });
            frames.push({
                stage: seqHTML(W, H, lanes, [
                    { from: 0, to: 1, y: 130, text: "FIN", state: "e-done" },
                    { from: 1, to: 0, y: 170, text: "ACK", state: "e-done" },
                    { from: 1, to: 0, y: 210, text: "FIN", state: "e-done" },
                    { from: 0, to: 1, y: 250, text: "ACK", state: "e-done" },
                ]) + app(["1", "2", "3", "4", "5"], { "0,0": "is-head", "0,1": "is-done", "0,2": "is-done", "0,3": "is-done", "0,4": "is-done", "0,5": "is-done" }),
                note: "And the connection is closed in both directions independently. Compare the two runs: <strong>UDP delivered 4 of 5 in the wrong order, instantly; TCP delivered 5 of 5 in order, with a stall.</strong> Neither is better - they are different trades against latency.",
            });
        }
        return frames;
    },
};

/* ---- 10. TCP handshake and teardown ---- */

VIZ["tcp-handshake"] = {
    title: "Three-way handshake, data, four-way close",
    legend: [["lg-act", "this segment"], ["lg-done", "already sent"], ["lg-idle", "not yet"]],
    build() {
        const W = 660;
        const H = 460;
        const M = [
            { from: 0, to: 1, y: 108, text: "SYN  seq=x" },
            { from: 1, to: 0, y: 152, text: "SYN+ACK  seq=y ack=x+1" },
            { from: 0, to: 1, y: 196, text: "ACK  ack=y+1" },
            { from: 0, to: 1, y: 250, text: "GET /  (data, seq=x+1)" },
            { from: 1, to: 0, y: 294, text: "200 OK  (data + ACK)" },
            { from: 0, to: 1, y: 344, text: "FIN" },
            { from: 1, to: 0, y: 378, text: "ACK" },
            { from: 1, to: 0, y: 412, text: "FIN" },
            { from: 0, to: 1, y: 446, text: "ACK" },
        ];
        const upTo = (n) => M.slice(0, n).map((m, i) => ({ ...m, state: i === n - 1 ? "e-act" : "e-done" }));
        const lanes = (c, s) => [
            { x: 130, label: "client", sub: c, state: "n-idle" },
            { x: 530, label: "server", sub: s, state: "n-idle" },
        ];

        return [
            {
                stage: seqHTML(W, H, lanes("CLOSED", "LISTEN"), []),
                note: "The server is in <strong>LISTEN</strong>; the client has nothing at all. A TCP connection is not a wire - it is <em>agreed state in two kernels</em>, and the handshake is how they agree.",
            },
            {
                stage: seqHTML(W, H, lanes("SYN_SENT", "LISTEN"), upTo(1)),
                note: "<strong>SYN</strong> carries the client's randomly chosen initial sequence number <code>x</code>. Random, not zero, so an old or forged segment cannot be injected into a new connection.",
            },
            {
                stage: seqHTML(W, H, lanes("SYN_SENT", "SYN_RCVD"), upTo(2)),
                note: "<strong>SYN+ACK</strong> does two jobs at once: it acknowledges <code>x+1</code> and announces the server's own <code>y</code>. Both directions are being set up, because TCP is full duplex - two independent byte streams in one connection.",
            },
            {
                stage: seqHTML(W, H, lanes("ESTABLISHED", "SYN_RCVD"), upTo(3)),
                note: "<strong>ACK</strong> completes it. The client is ESTABLISHED here; the server becomes ESTABLISHED when this arrives, and <em>only then</em> does <code>accept()</code> return.",
            },
            {
                stage: seqHTML(W, H, lanes("ESTABLISHED", "ESTABLISHED"), upTo(4), [{ x: 330, y: 228, text: "1 RTT already spent before this byte moved" }]),
                note: "Only now can data flow. That is the tax: <strong>one full round trip before the first byte</strong>, plus another one or two if TLS follows. On a 80 ms path, a request that transfers 2 KB still takes 240 ms.",
            },
            {
                stage: seqHTML(W, H, lanes("ESTABLISHED", "ESTABLISHED"), upTo(5)),
                note: "The response comes back, and its ACK rides along in the same segment - <strong>piggybacking</strong>. Pure ACKs are avoided when there is data to carry them.",
            },
            {
                stage: seqHTML(W, H, lanes("FIN_WAIT_1", "ESTABLISHED"), upTo(6)),
                note: "Closing takes four segments because each direction closes separately. The client's <strong>FIN</strong> means \"I have no more data\" - not \"stop talking\".",
            },
            {
                stage: seqHTML(W, H, lanes("FIN_WAIT_2", "CLOSE_WAIT"), upTo(7)),
                note: "The server ACKs and enters <strong>CLOSE_WAIT</strong>. It may keep sending for as long as it likes. A pile of sockets stuck in CLOSE_WAIT is a famous bug signature: <em>the application forgot to call close()</em>.",
            },
            {
                stage: seqHTML(W, H, lanes("TIME_WAIT", "LAST_ACK"), upTo(8)),
                note: "When the server is finished it sends its own <strong>FIN</strong>. Now both directions are shut.",
            },
            {
                stage: seqHTML(W, H, lanes("TIME_WAIT  (2 x MSL)", "CLOSED"), upTo(9), [{ x: 130, y: 92, text: "waits ~60s before releasing the tuple" }]),
                note: "The final ACK closes the server immediately, but the client sits in <strong>TIME_WAIT</strong> for about 60 seconds. It is holding the four-tuple hostage so a delayed duplicate cannot land in a brand-new connection reusing the same ports.",
            },
            {
                stage: seqHTML(W, H, lanes("CLOSED", "CLOSED"), M.map((m) => ({ ...m, state: "e-done" }))),
                note: "Whoever closes first pays the TIME_WAIT. That is why a load generator - or a proxy that opens a fresh connection per request - exhausts local ports long before the server breaks a sweat, and why <strong>connection reuse (keep-alive) is the single biggest easy win</strong> in client performance.",
            },
        ];
    },
};

/* ---- 11. Reliability and retransmission ---- */

VIZ["tcp-retransmission"] = {
    title: "How TCP notices a segment is missing",
    legend: [["lg-act", "this segment"], ["lg-done", "acknowledged"], ["lg-out", "lost"], ["lg-idle", "waiting"]],
    options: [
        { value: "fast", label: "Recovery by fast retransmit" },
        { value: "rto", label: "Recovery by timeout (RTO)" },
    ],
    build(option) {
        const mode = option || "fast";
        const W = 660;
        const H = 340;
        const lanes = (c, s) => [
            { x: 130, label: "sender", sub: c },
            { x: 530, label: "receiver", sub: s },
        ];
        const f = [];

        if (mode === "fast") {
            f.push({
                stage: seqHTML(W, H, lanes("cwnd 4 segments", "expects seq 1000"), [
                    { from: 0, to: 1, y: 110, text: "seq 1000", state: "e-act" },
                    { from: 0, to: 1, y: 150, text: "seq 2000", state: "e-act" },
                    { from: 0, to: 1, y: 190, text: "seq 3000", state: "e-act" },
                    { from: 0, to: 1, y: 230, text: "seq 4000", state: "e-act" },
                ]),
                note: "Four segments of 1000 bytes go out back to back. TCP numbers <strong>bytes, not packets</strong>: <code>seq 2000</code> means \"this segment starts at byte 2000 of the stream\".",
            });
            f.push({
                stage: seqHTML(W, H, lanes("4 in flight", "got 1000"), [
                    { from: 0, to: 1, y: 110, text: "seq 1000", state: "e-done" },
                    { from: 1, to: 0, y: 150, text: "ACK 2000", state: "e-act" },
                    { from: 0, to: 1, y: 190, text: "seq 2000  ---  lost", state: "e-idle" },
                    { from: 0, to: 1, y: 230, text: "seq 3000", state: "e-act" },
                ], [{ x: 330, y: 176, text: "queue overflow at a router - segment 2000 vanishes" }]),
                note: "<code>ACK 2000</code> is <strong>cumulative</strong>: it means \"I have everything below 2000, send me 2000 next\". Meanwhile 2000 is dropped somewhere in the middle of the network.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("still sending", "hole at 2000"), [
                    { from: 0, to: 1, y: 110, text: "seq 3000", state: "e-done" },
                    { from: 1, to: 0, y: 150, text: "dup ACK 2000", state: "e-act" },
                    { from: 0, to: 1, y: 190, text: "seq 4000", state: "e-done" },
                    { from: 1, to: 0, y: 230, text: "dup ACK 2000", state: "e-act" },
                ]),
                note: "3000 and 4000 arrive, but the receiver cannot acknowledge them - the cumulative ACK is stuck at the hole. It repeats <code>ACK 2000</code>. A <strong>duplicate ACK means \"something got through, but not the thing I need\"</strong>.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("dupACK count = 3", "hole at 2000"), [
                    { from: 1, to: 0, y: 120, text: "dup ACK 2000  (1)", state: "e-done" },
                    { from: 1, to: 0, y: 160, text: "dup ACK 2000  (2)", state: "e-done" },
                    { from: 1, to: 0, y: 200, text: "dup ACK 2000  (3)", state: "e-act" },
                ], [{ x: 330, y: 244, text: "three duplicates = strong evidence of loss, not reordering" }]),
                note: "Why three? One or two duplicates usually just mean <em>reordering</em>. Three is the compromise: sensitive enough to react in well under a timeout, conservative enough not to retransmit healthy data.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("fast retransmit", "hole at 2000"), [
                    { from: 0, to: 1, y: 150, text: "retransmit seq 2000", state: "e-act" },
                ], [{ x: 330, y: 196, text: "sent immediately - no timer involved" }]),
                note: "<strong>Fast retransmit</strong>: resend the missing segment at once, without waiting for the retransmission timer. The sender also halves its congestion window, because loss is treated as a signal that the path is full.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("recovered", "stream complete"), [
                    { from: 0, to: 1, y: 130, text: "seq 2000", state: "e-done" },
                    { from: 1, to: 0, y: 190, text: "ACK 5000", state: "e-act" },
                ]),
                note: "The hole is filled and the ACK jumps straight to <code>5000</code> - one ACK covering everything that was buffered. With <strong>SACK</strong> enabled (it always is today) the receiver had also been listing exactly which blocks it held, so the sender only ever resends the true gap.",
            });
        } else {
            f.push({
                stage: seqHTML(W, H, lanes("RTT ~ 50ms, RTO 250ms", "expects seq 1000"), [
                    { from: 0, to: 1, y: 130, text: "seq 1000  ---  lost", state: "e-idle" },
                ], [{ x: 330, y: 172, text: "nothing else in flight to trigger duplicate ACKs" }]),
                note: "Now the sender has only one segment outstanding - the last of a request, say. It is lost, so <strong>no duplicate ACKs can ever arrive</strong>. Fast retransmit is useless here; only a timer can save the connection.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("waiting... 250ms", "silent"), [], [{ x: 330, y: 150, text: "RTO = smoothed RTT + 4 x RTT variance" }, { x: 330, y: 176, text: "measured continuously from every ACK" }]),
                note: "The <strong>retransmission timeout</strong> is derived from measured round-trip time, not a constant: <code>RTO = SRTT + 4 x RTTVAR</code>. A jittery path gets a longer timer; a stable LAN gets a short one. Linux clamps the minimum at 200 ms.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("RTO fired", "silent"), [
                    { from: 0, to: 1, y: 140, text: "retransmit seq 1000", state: "e-act" },
                ], [{ x: 330, y: 186, text: "cwnd collapses to 1 segment, slow start restarts" }]),
                note: "When the timer fires the reaction is brutal: retransmit, and drop the congestion window <strong>all the way back to one segment</strong>. A timeout is treated as evidence that the sender's whole model of the path was wrong.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("RTO doubled -> 500ms", "silent"), [
                    { from: 0, to: 1, y: 120, text: "retransmit  ---  lost again", state: "e-idle" },
                ], [{ x: 330, y: 168, text: "backoff: 250ms, 500ms, 1s, 2s, 4s ..." }]),
                note: "If that is lost too, the timer <strong>doubles</strong>. Exponential backoff protects a network that is already in trouble from being hammered - but it is why a brief outage can leave a connection frozen for seconds after the network is healthy again.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("recovered", "got 1000"), [
                    { from: 0, to: 1, y: 130, text: "retransmit seq 1000", state: "e-done" },
                    { from: 1, to: 0, y: 190, text: "ACK 2000", state: "e-act" },
                ]),
                note: "This is the difference you feel in production. Fast retransmit costs about <strong>one RTT</strong>; an RTO costs <strong>hundreds of milliseconds</strong> and destroys throughput. It is the usual explanation for a p99 latency of exactly ~200 ms or ~1 s while p50 is 5 ms.",
            });
        }
        return f;
    },
};

/* ---- 12. Flow control / sliding window ---- */

VIZ["tcp-window"] = {
    title: "Flow control - the receiver sets the pace",
    legend: [["lg-done", "acknowledged"], ["lg-act", "in flight"], ["lg-cmp", "may send now"], ["lg-idle", "blocked by the window"]],
    build() {
        const stream = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const paint = (acked, inflight, winEnd) => {
            const marks = {};
            const tags = {};
            stream.forEach((_, i) => {
                if (i < acked) marks[i] = "is-done";
                else if (i < acked + inflight) marks[i] = "is-active";
                else if (i < winEnd) marks[i] = "is-window";
                else marks[i] = "is-dim";
            });
            if (acked < stream.length) tags[acked] = "snd.una";
            if (acked + inflight < stream.length) tags[acked + inflight] = "snd.nxt";
            if (winEnd < stream.length) tags[winEnd] = "win end";
            return cellsHTML(stream, marks, tags);
        };
        const buf = (used, cap, label) =>
            dataGridHTML([[label, ...Array.from({ length: cap }, (_, i) => (i < used ? "data" : ""))]], {
                "0,0": "is-head",
                ...Object.fromEntries(Array.from({ length: cap }, (_, i) => [`0,${i + 1}`, i < used ? "is-act" : "is-empty"])),
            });

        return [
            {
                stage: paint(0, 0, 6) + buf(0, 6, "receive buffer  (rwnd = 6)"),
                note: "The receiver advertises a <strong>window</strong> in every ACK: \"I have room for 6 more segments\". This has nothing to do with the network - it is purely about the receiver's own buffer.",
            },
            {
                stage: paint(0, 4, 6) + buf(0, 6, "receive buffer  (rwnd = 6)"),
                note: "The sender may have up to 6 unacknowledged segments outstanding. It sends 4. Everything past the window end is <strong>blocked</strong> even though the application has already written it.",
            },
            {
                stage: paint(2, 2, 8) + buf(2, 6, "receive buffer  (rwnd = 4)"),
                note: "Two segments arrive and are acknowledged, so the window <strong>slides</strong> right - the sender may now use bytes further along the stream. But the application has not read them yet, so the receiver's free space has <em>shrunk</em> to 4.",
            },
            {
                stage: paint(4, 2, 8) + buf(4, 6, "receive buffer  (rwnd = 2)"),
                note: "The application is slow - a database write, a GC pause, a blocked thread. Data keeps arriving and piling up. Every ACK now carries a <strong>smaller</strong> window: the receiver is applying the brakes without any explicit \"slow down\" message.",
            },
            {
                stage: paint(6, 0, 6) + buf(6, 6, "receive buffer  (rwnd = 0)  FULL"),
                note: "<strong>Zero window.</strong> The sender must stop dead, even if the network is completely idle. On the sending side <code>send()</code> now blocks (or returns <code>EAGAIN</code>) - which is how backpressure reaches your application code.",
            },
            {
                stage: paint(6, 1, 6) + buf(6, 6, "receive buffer  (rwnd = 0)  FULL"),
                note: "The sender periodically transmits a <strong>window probe</strong> - one byte - because if the window-opening ACK were lost, both sides would wait forever. Reliability protocols are full of these anti-deadlock pokes.",
            },
            {
                stage: paint(6, 0, 12) + buf(2, 6, "receive buffer  (rwnd = 4)"),
                note: "The application finally reads. Space frees, the receiver sends a <strong>window update</strong>, and the sender resumes. In <code>ss -ti</code> this whole story is visible as a growing <code>Recv-Q</code> on one side and <code>Send-Q</code> on the other.",
            },
            {
                stage: paint(9, 3, 12) + buf(1, 6, "receive buffer  (rwnd = 5)"),
                note: "Two windows govern every TCP sender: <strong>rwnd</strong> (what the receiver can absorb) and <strong>cwnd</strong> (what the network can absorb). The sender may have <code>min(rwnd, cwnd)</code> bytes in flight - and knowing which one is the binding constraint is most of TCP performance work.",
            },
            {
                stage: paint(12, 0, 12) + buf(0, 6, "receive buffer  drained"),
                note: "Finally: throughput is <code>window / RTT</code>. On a 100 ms path a 64 KB window caps you at about <strong>5 Mbit/s no matter how fat the pipe is</strong>. That is why window scaling exists - and why a long-distance transfer that refuses to go faster is usually a window problem, not a bandwidth problem.",
            },
        ];
    },
};

/* ---- 13. Congestion control ---- */

VIZ["congestion-control"] = {
    title: "Congestion control - finding the edge without falling off",
    legend: [["lg-act", "this round trip"], ["lg-done", "history"], ["lg-out", "loss detected"], ["lg-cmp", "probing"]],
    options: [
        { value: "reno", label: "Loss-based control (Reno, CUBIC)" },
        { value: "bbr", label: "Model-based control (BBR)" },
    ],
    build(option) {
        const mode = option || "reno";
        const series =
            mode === "reno"
                ? [1, 2, 4, 8, 16, 32, 64, 32, 33, 34, 35, 36, 18, 19, 20, 21]
                : [1, 2, 4, 8, 16, 32, 42, 40, 40, 50, 40, 40, 40, 50];
        const lossAt = mode === "reno" ? [6, 11] : [];
        const notes =
            mode === "reno"
                ? [
                    "A new connection knows <strong>nothing</strong> about the path. It refuses to guess, and starts by sending a single segment.",
                    "Every acknowledged round trip <strong>doubles</strong> the window. This is <em>slow start</em> - a terrible name, because it is exponential growth.",
                    "Four segments. At this rate a fat pipe is filled in a handful of round trips, which is exactly the point: probing must be fast or short connections never reach full speed.",
                    "Eight. Notice the cost of an RTT here - on a 100 ms link, six round trips of probing is 600 ms before you are anywhere near line rate.",
                    "Sixteen. The sender is still climbing blind; nothing has pushed back yet.",
                    "Thirty-two. Somewhere ahead, a router queue is beginning to fill with the excess.",
                    "Sixty-four - and a segment is <strong>dropped</strong>. That drop is the network's only feedback signal. Loss is not a failure here; it is the measurement.",
                    "The sender <strong>halves</strong> the window and enters congestion avoidance. Multiplicative decrease: back off hard, because the cost of overshooting is a collapsed queue for everybody.",
                    "Now growth is <strong>additive</strong> - roughly one segment per round trip instead of doubling. This is AIMD, and it is what makes independent TCP flows converge on a fair share.",
                    "Still climbing, one at a time. The sender is cautiously feeling for the edge it just found.",
                    "Approaching the previous ceiling.",
                    "And loss again - the pattern repeats forever. Plot cwnd over time and you get the famous <strong>sawtooth</strong>.",
                    "Halved again. Note what the sawtooth means: a loss-based sender <em>deliberately</em> keeps the bottleneck queue full, because it only learns the limit by exceeding it.",
                    "Climbing again.",
                    "This is why one lost packet on a high-speed long-distance link is so expensive: recovering a large window one segment per RTT takes thousands of round trips.",
                    "<strong>CUBIC</strong> - the Linux default - keeps this shape but replaces the straight line with a cubic curve that races back toward the previous maximum, then flattens near it. Same idea, much better on fast, long paths.",
                ]
                : [
                    "BBR starts the same way - it must still discover the path from nothing.",
                    "Doubling while it measures two things on every ACK: the <strong>delivery rate</strong> and the <strong>minimum RTT</strong>.",
                    "Four. Delivery rate is still rising with the window, so the pipe is not full yet.",
                    "Eight. RTT is flat, which means no queue has formed anywhere.",
                    "Sixteen. Still no queueing delay - keep going.",
                    "Thirty-two, and now the delivery rate <strong>stops rising</strong> while RTT starts to climb. That is the bottleneck: extra packets are going into a queue, not into throughput.",
                    "BBR does not wait for loss. It sets the sending rate to the measured bandwidth and <strong>drains the queue it just built</strong>.",
                    "Cruising at <code>bandwidth x minRTT</code> - the bandwidth-delay product. Full utilisation with an almost <strong>empty</strong> bottleneck queue, so latency stays low.",
                    "Steady state. A loss-based sender would still be climbing until something broke.",
                    "Periodically it <strong>probes</strong>: send 25% faster for one round trip to see whether more bandwidth has appeared.",
                    "If the delivery rate did not improve, the extra was queued - so back off to the measured rate and drain again.",
                    "Cruise. The point of the whole design: <strong>loss and congestion are not the same thing</strong>. A wireless link loses packets when nothing is congested; a deep buffer congests badly while losing nothing.",
                    "That second case is <strong>bufferbloat</strong>: an over-large router buffer absorbs everything, so a loss-based sender keeps pushing and adds hundreds of milliseconds of pure queueing delay to every flow sharing that link.",
                    "The trade-off is real - BBR can be unfair to loss-based flows on a shared bottleneck. Choose it for long, lossy, high-bandwidth paths; measure before you switch.",
                ];

        return series.map((_, i) => {
            const shown = series.slice(0, i + 1);
            const marks = {};
            shown.forEach((__, j) => {
                if (lossAt.includes(j)) marks[j] = "is-out";
                else if (j === i) marks[j] = "is-act";
                else marks[j] = "is-done";
            });
            if (mode === "bbr" && (i === 9 || i === 13)) marks[i] = "is-cmp";
            return {
                stage: barsHTML(shown, marks) + `<div class="viz-caption">congestion window (segments) per round trip - RTT ${i + 1}</div>`,
                note: notes[i],
            };
        });
    },
};

/* ---- 14. MTU and fragmentation ---- */

VIZ["ip-fragmentation"] = {
    title: "MTU - what happens to a packet that does not fit",
    legend: [["lg-act", "being cut"], ["lg-done", "fits the link"], ["lg-out", "dropped"], ["lg-idle", "untouched"]],
    build() {
        const W = 660;
        const H = 250;
        const draw = (segs, note) => {
            let s = capHTML(20, 32, "sender  MTU 9000 (jumbo LAN)", "start");
            s += capHTML(640, 32, "next link  MTU 1500", "end");
            s += pathHTML("M20 60 H640", "e-idle");
            segs.forEach((sg) => {
                s += boxHTML(sg[0], sg[1], sg[2], 38, sg[3], sg[4] || "n-idle", sg[5] || "");
            });
            if (note) s += capHTML(330, 236, note);
            return svgHTML(W, H, s);
        };
        const table = (rows, marks) =>
            dataGridHTML([["fragments", "id", "offset", "more?", "payload"], ...rows.map((r) => [r[0] || "frag", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };

        return [
            {
                stage: draw([[60, 90, 540, "IP datagram - 4000 bytes", "n-act"]]) + table([["", "-", "-", "-", "3980 bytes"]], lab(1)),
                note: "Every link has a <strong>maximum transmission unit</strong> - the biggest frame it will carry. Ethernet's is 1500 bytes. Our 4000-byte datagram is legal for IP but far too big for the next hop.",
            },
            {
                stage: draw([[60, 90, 540, "4000 bytes", "n-out"]], "1500-byte limit ahead") + table([["", "-", "-", "-", "3980 bytes"]], lab(1)),
                note: "The router has two options and no third: <strong>fragment it, or drop it</strong>. Which one depends on a single bit in the IP header.",
            },
            {
                stage: draw([
                    [60, 78, 176, "frag 1", "n-done", "offset 0"],
                    [242, 78, 176, "frag 2", "n-done", "offset 185"],
                    [424, 78, 176, "frag 3", "n-done", "offset 370"],
                ]) + table([
                    ["", "0x1a2b", "0", "yes", "1480 bytes"],
                    ["", "0x1a2b", "185", "yes", "1480 bytes"],
                    ["", "0x1a2b", "370", "no", "1020 bytes"],
                ], { ...lab(3), "1,2": "is-act", "2,2": "is-act", "3,2": "is-act" }),
                note: "Fragmenting: three packets sharing one <strong>identification</strong> value, each carrying a byte <strong>offset</strong> (counted in 8-byte units - hence 185, not 1480), and the last one clearing the <em>more fragments</em> flag so the receiver knows where the datagram ends.",
            },
            {
                stage: draw([
                    [60, 78, 176, "frag 1", "n-done"],
                    [242, 78, 176, "frag 2", "n-out"],
                    [424, 78, 176, "frag 3", "n-done"],
                ], "one fragment lost = whole datagram lost") + table([
                    ["", "0x1a2b", "0", "yes", "arrived"],
                    ["", "0x1a2b", "185", "yes", "LOST"],
                    ["", "0x1a2b", "370", "no", "arrived"],
                ], { ...lab(3), "2,4": "is-act" }),
                note: "Why fragmentation is disliked: <strong>reassembly is all or nothing</strong>. Lose one fragment and the other two are discarded after a timer, so a 1% packet loss rate becomes a 3% datagram loss rate. Reassembly also happens only at the <em>final destination</em>, and it burns memory there.",
            },
            {
                stage: draw([[60, 90, 540, "4000 bytes   DF = 1", "n-out"]], "router drops it and reports back") + table([["ICMP", "type 3 code 4", "-", "-", "next-hop MTU = 1500"]], lab(1)),
                note: "So modern senders set the <strong>don't fragment</strong> bit. The router now drops the packet and returns ICMP <em>fragmentation needed</em>, helpfully naming the MTU it can handle. IPv6 removed router fragmentation entirely - this is the only mechanism there.",
            },
            {
                stage: draw([
                    [60, 78, 176, "1500", "n-done"],
                    [242, 78, 176, "1500", "n-done"],
                    [424, 78, 176, "1020", "n-done"],
                ], "sender re-segments at the transport layer") + table([["TCP", "MSS clamped", "-", "-", "1460-byte segments"]], lab(1)),
                note: "<strong>Path MTU discovery</strong>: the sender shrinks its segments and re-sends. TCP does this naturally because it can choose its own segment size - which is why TCP mostly avoids fragmentation altogether by negotiating an MSS during the handshake.",
            },
            {
                stage: draw([[60, 90, 540, "4000 bytes   DF = 1", "n-out"]], "ICMP blocked by a firewall - silence") + table([["", "no reply", "-", "-", "connection hangs"]], lab(1)),
                note: "And the classic failure: a firewall that blocks all ICMP. The packet is dropped, the notification never arrives, and the sender retries the same oversized packet forever. Symptom: <strong>the handshake succeeds and small requests work, but any large response hangs</strong> - an <em>MTU black hole</em>. Suspect it whenever a VPN or tunnel is involved, since each layer of encapsulation steals more bytes.",
            },
        ];
    },
};

/* ---- 15. Traceroute ---- */

VIZ["traceroute"] = {
    title: "Traceroute - mapping a path you cannot see",
    legend: [["lg-act", "probe reaches here"], ["lg-done", "already mapped"], ["lg-out", "TTL expired here"], ["lg-idle", "unknown"]],
    build() {
        const hops = (n, marks) =>
            dataGridHTML([["traceroute", "hop", "router", "rtt"], ...n.map((r) => [r[0] || "probe", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };
        const ROWS = [
            ["", "1", "R1  10.0.0.1", "0.9 ms"],
            ["", "2", "R2  62.115.4.1", "11 ms"],
            ["", "3", "R4  213.155.2.9", "84 ms"],
            ["", "4", "S   93.184.216.34", "86 ms"],
        ];

        return [
            {
                stage: netHTML({ A: "n-act" }, {}, "probe 1 - TTL = 1") + hops([["", "1", "?", "?"]], lab(1)),
                note: "Traceroute has no special protocol. It sends an ordinary packet with the <strong>TTL deliberately set to 1</strong> - engineered to die at the first hop.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-out" }, { "A-R1": "e-act" }, "TTL 1 -> 0 at R1") + hops([ROWS[0]], { ...lab(1), "1,2": "is-act", "1,3": "is-act" }),
                note: "R1 decrements TTL to zero, discards the packet, and - as the standard requires - sends back <strong>ICMP time exceeded</strong>. That reply reveals R1's address and the round-trip time to it.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-out" }, { "A-R1": "e-done", "R1-R2": "e-act" }, "probe 2 - TTL = 2") + hops([ROWS[0], ROWS[1]], { ...lab(2), "2,2": "is-act", "2,3": "is-act" }),
                note: "Now TTL = 2. It survives R1, dies at R2, and R2 identifies itself the same way. <strong>Increment and repeat</strong> - that is the entire algorithm.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R4: "n-out" }, { "A-R1": "e-done", "R1-R2": "e-done", "R2-R4": "e-act" }, "probe 3 - TTL = 3") + hops([ROWS[0], ROWS[1], ROWS[2]], { ...lab(3), "3,2": "is-act", "3,3": "is-act" }),
                note: "Hop 3 shows the jump from 11 ms to 84 ms. That step is the long-haul link - probably a submarine cable. <strong>Look for the step, not the absolute numbers.</strong>",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R4: "n-done", S: "n-act" }, { "A-R1": "e-done", "R1-R2": "e-done", "R2-R4": "e-done", "R4-S": "e-act" }, "probe 4 - reaches the destination") + hops(ROWS, { ...lab(4), "4,2": "is-done", "4,3": "is-done" }),
                note: "The destination is different: it does not report <em>time exceeded</em> but <em>port unreachable</em> (or an echo reply), and traceroute stops. Four hops mapped without any cooperation from the network.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R3: "n-idle", R4: "n-done", S: "n-done" }, { "A-R1": "e-done", "R1-R2": "e-done", "R2-R4": "e-done", "R4-S": "e-done" }, "read the output carefully") + hops([ROWS[0], ROWS[1], ["", "3", "* * *", "no reply"], ROWS[3]], { ...lab(4), "3,2": "is-empty", "3,3": "is-empty" }),
                note: "Two things people misread. <code>* * *</code> does <strong>not</strong> mean the packet was lost - most routers simply rate-limit or suppress ICMP, and traffic passes straight through them. And a high RTT at one hop does not mean that hop is slow: it means <em>the router was slow to answer a low-priority ICMP</em>. Only a rise that <strong>persists to the end</strong> is real latency.",
            },
            {
                stage: netHTML({ A: "n-done", R1: "n-done", R2: "n-done", R3: "n-act", R4: "n-done", S: "n-done" }, { "A-R1": "e-done", "R1-R2": "e-done", "R1-R3": "e-act", "R3-R4": "e-act", "R4-S": "e-done" }, "different probe, different path") + hops([ROWS[0], ROWS[1], ["", "3", "R3 (ECMP sibling)", "83 ms"], ROWS[3]], { ...lab(4), "3,2": "is-act" }),
                note: "Finally, <strong>the path is not a single path</strong>. With ECMP, each probe may be hashed onto a different parallel link, so consecutive hops can belong to different routes. Use <code>mtr</code> for a continuous view and <code>traceroute -T</code> to follow the same port your application actually uses - firewalls often treat UDP probes differently from real traffic.",
            },
        ];
    },
};

/* ---- 16. DNS resolution ---- */

VIZ["dns-resolution"] = {
    title: "Resolving www.example.com from nothing",
    legend: [["lg-act", "question in flight"], ["lg-done", "answered"], ["lg-idle", "not consulted"]],
    build() {
        const W = 660;
        const H = 274;
        const draw = (st) => {
            let s = boxHTML(16, 116, 150, 46, "browser", st.b || "n-idle", "stub resolver");
            s += boxHTML(216, 116, 160, 46, "resolver", st.r || "n-idle", "8.8.8.8 - recursive");
            s += boxHTML(462, 18, 182, 40, "root  .", st.root || "n-idle", "13 anycast clusters");
            s += boxHTML(462, 118, 182, 40, "TLD  .com", st.tld || "n-idle", "Verisign");
            s += boxHTML(462, 216, 182, 40, "ns1.example.com", st.auth || "n-idle", "authoritative");
            s += arrowHTML(166, 139, 212, 139, st.e0 || "e-idle");
            s += arrowHTML(376, 128, 458, 44, st.e1 || "e-idle");
            s += arrowHTML(376, 139, 458, 138, st.e2 || "e-idle");
            s += arrowHTML(376, 150, 458, 232, st.e3 || "e-idle");
            return svgHTML(W, H, s);
        };
        const cache = (rows, marks) => dataGridHTML([["resolver cache", "name", "type", "answer", "TTL"], ...rows.map((r) => [r[0] || "entry", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head", "0,4": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };

        return [
            {
                stage: draw({ b: "n-act" }) + cache([["", "cold", "-", "-", "-"]], lab(1)),
                note: "Nothing on the internet routes on names. Before a single packet can be sent, <code>www.example.com</code> must become an IP address - and the browser itself is not going to do the work.",
            },
            {
                stage: draw({ b: "n-done", e0: "e-act", r: "n-act" }) + cache([["", "cold", "-", "-", "-"]], lab(1)),
                note: "The <strong>stub resolver</strong> asks one question of one server and expects a complete answer. All the hard work is delegated to the <strong>recursive resolver</strong> - your ISP's, or 8.8.8.8, or 1.1.1.1. This is one UDP packet on port 53.",
            },
            {
                stage: draw({ r: "n-act", e1: "e-act", root: "n-act" }) + cache([["", "cold", "-", "-", "-"]], lab(1)),
                note: "The resolver starts at the <strong>root</strong>. The root does not know <code>www.example.com</code> and never will - it knows only who is responsible for <code>.com</code>. DNS is a <em>referral</em> system, not a directory.",
            },
            {
                stage: draw({ r: "n-act", root: "n-done", e1: "e-done", e2: "e-act", tld: "n-act" }) + cache([["", ".com", "NS", "a.gtld-servers.net", "172800"]], { ...lab(1), "1,3": "is-act" }),
                note: "Referral to the <code>.com</code> nameservers, cached for two days. The resolver asks again - and gets another referral, this time to the nameservers for <code>example.com</code> itself.",
            },
            {
                stage: draw({ r: "n-act", root: "n-done", tld: "n-done", e1: "e-done", e2: "e-done", e3: "e-act", auth: "n-act" }) + cache([["", ".com", "NS", "a.gtld-servers.net", "172800"], ["", "example.com", "NS", "ns1.example.com", "86400"]], { ...lab(2), "2,3": "is-act" }),
                note: "Third question, to the <strong>authoritative</strong> server - the only machine in the world that actually holds the record. Whoever controls this server controls the name.",
            },
            {
                stage: draw({ r: "n-done", auth: "n-done", e3: "e-done", e0: "e-act", b: "n-act" }) + cache([["", ".com", "NS", "a.gtld-servers.net", "172800"], ["", "example.com", "NS", "ns1.example.com", "86400"], ["", "www.example.com", "A", "93.184.216.34", "300"]], { ...lab(3), "3,3": "is-act", "3,4": "is-act" }),
                note: "<code>A 93.184.216.34</code>, TTL 300. Four queries, then the answer goes back to the browser. Only now does anything in the earlier animations - ARP, TCP, TLS - begin.",
            },
            {
                stage: draw({ b: "n-act", e0: "e-act", r: "n-done" }) + cache([["", "www.example.com", "A", "93.184.216.34", "241"]], { ...lab(1), "1,3": "is-done" }),
                note: "The next person to ask gets it from cache in <strong>under a millisecond</strong> - and there are caches at every level: the browser, the OS, the resolver. This is why DNS at internet scale works at all with so few authoritative servers.",
            },
            {
                stage: draw({ b: "n-act", e0: "e-act", r: "n-act" }) + cache([["", "www.example.com", "A", "93.184.216.34", "0  EXPIRED"]], { ...lab(1), "1,4": "is-empty" }),
                note: "<strong>TTL is a promise you cannot take back.</strong> Once handed out, a record lives in caches you do not control for its full TTL. That is why you lower TTL to 60 s <em>days before</em> a migration, not on the day.",
            },
            {
                stage: draw({ b: "n-done", r: "n-done", root: "n-done", tld: "n-done", auth: "n-done", e0: "e-done", e1: "e-done", e2: "e-done", e3: "e-done" }) + cache([
                    ["", "example.com", "A", "93.184.216.34", "300"],
                    ["", "example.com", "MX", "mail.example.com", "3600"],
                    ["", "www", "CNAME", "example.com", "300"],
                    ["", "example.com", "TXT", "v=spf1 ...", "3600"],
                ], lab(4)),
                note: "The record types you will actually meet: <strong>A</strong>/<strong>AAAA</strong> (address), <strong>CNAME</strong> (alias - and it cannot coexist with other records at the same name, which is why the apex of a domain needs ALIAS/ANAME instead), <strong>MX</strong> (mail), <strong>TXT</strong> (SPF, DKIM, domain verification), <strong>NS</strong> (delegation). And when something is broken, <code>dig +trace</code> replays exactly the walk you just watched.",
            },
        ];
    },
};

/* ---- 17. HTTP versions ---- */

VIZ["http-versions"] = {
    title: "Three requests, three generations of HTTP",
    legend: [["lg-act", "in flight"], ["lg-done", "delivered"], ["lg-out", "blocked / lost"], ["lg-idle", "queued"]],
    options: [
        { value: "h1", label: "Three requests over HTTP/1.1" },
        { value: "h2", label: "Three requests over HTTP/2" },
        { value: "h3", label: "Three requests over HTTP/3" },
    ],
    build(option) {
        const v = option || "h1";
        const W = 660;
        const H = 320;
        const lanes = (sub) => [
            { x: 130, label: "browser", sub },
            { x: 530, label: "server", sub: v === "h3" ? "QUIC over UDP" : "TCP" },
        ];
        const f = [];

        if (v === "h1") {
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 0, to: 1, y: 110, text: "GET /index.html", state: "e-act" },
                ], [{ x: 330, y: 150, text: "requests 2 and 3 cannot start yet" }]),
                note: "HTTP/1.1 allows exactly <strong>one request in flight per connection</strong>. The other two sit in a queue in the browser, doing nothing.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 0, to: 1, y: 110, text: "GET /index.html", state: "e-done" },
                    { from: 1, to: 0, y: 160, text: "200 OK  (14 KB)", state: "e-act" },
                ], [{ x: 330, y: 200, text: "still waiting..." }]),
                note: "The response must complete before anything else can be asked for. Messages are plain text, delimited by <code>Content-Length</code> or chunked encoding - there is no framing that would let two responses interleave.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 0, to: 1, y: 110, text: "GET /style.css", state: "e-act" },
                    { from: 1, to: 0, y: 160, text: "200 OK", state: "e-idle" },
                    { from: 0, to: 1, y: 220, text: "GET /app.js", state: "e-idle" },
                ], [{ x: 330, y: 262, text: "serialised: 3 round trips minimum" }]),
                note: "Only when the first response is finished does the second request go out. Three assets = three round trips, and a page with 80 assets is a disaster. This is <strong>head-of-line blocking at the HTTP layer</strong>.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("6 connections"), [
                    { from: 0, to: 1, y: 110, text: "GET /index.html   (conn 1)", state: "e-act" },
                    { from: 0, to: 1, y: 160, text: "GET /style.css    (conn 2)", state: "e-act" },
                    { from: 0, to: 1, y: 210, text: "GET /app.js       (conn 3)", state: "e-act" },
                ], [{ x: 330, y: 254, text: "6 handshakes, 6 congestion windows, 6 sets of buffers" }]),
                note: "The workaround browsers actually use: <strong>open six connections per host</strong>. It works, but every connection repeats the TCP and TLS handshake and starts its own slow start - and six flows compete with each other for the same bottleneck.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("6 connections"), [
                    { from: 0, to: 1, y: 130, text: "sharding: img1.cdn, img2.cdn ...", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "sprites, concatenated bundles, inlined CSS", state: "e-done" },
                ]),
                note: "Every HTTP/1.1 performance trick you have heard of - <strong>domain sharding, sprite sheets, giant bundles, inlining</strong> - exists to work around this one limitation. On HTTP/2 most of them are actively harmful.",
            });
        } else if (v === "h2") {
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 0, to: 1, y: 104, text: "HEADERS  stream 1  GET /index.html", state: "e-act" },
                    { from: 0, to: 1, y: 144, text: "HEADERS  stream 3  GET /style.css", state: "e-act" },
                    { from: 0, to: 1, y: 184, text: "HEADERS  stream 5  GET /app.js", state: "e-act" },
                ]),
                note: "HTTP/2 replaces text with <strong>binary frames</strong>, each stamped with a stream ID. All three requests leave immediately on <em>one</em> connection - this is <strong>multiplexing</strong>.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 1, to: 0, y: 104, text: "DATA  stream 3", state: "e-done" },
                    { from: 1, to: 0, y: 144, text: "DATA  stream 1", state: "e-done" },
                    { from: 1, to: 0, y: 184, text: "DATA  stream 5", state: "e-done" },
                    { from: 1, to: 0, y: 224, text: "DATA  stream 1", state: "e-act" },
                ]),
                note: "Responses come back <strong>interleaved</strong> and in any order. A slow API call no longer blocks a small CSS file behind it, and the browser can signal priorities.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("1 connection"), [
                    { from: 0, to: 1, y: 120, text: "HEADERS  (HPACK compressed)", state: "e-done" },
                    { from: 0, to: 1, y: 180, text: "~30 bytes instead of ~800", state: "e-done" },
                ]),
                note: "Headers are compressed with <strong>HPACK</strong>, which keeps a shared table of previously sent header fields. Repeated cookies and user-agent strings stop being resent on every request - a huge win on mobile uplinks.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("1 TCP connection"), [
                    { from: 1, to: 0, y: 110, text: "DATA stream 1  ---  packet lost", state: "e-idle" },
                    { from: 1, to: 0, y: 160, text: "DATA stream 3  (arrived, but held)", state: "e-done" },
                    { from: 1, to: 0, y: 210, text: "DATA stream 5  (arrived, but held)", state: "e-done" },
                ], [{ x: 330, y: 254, text: "TCP holds ALL streams until the gap is repaired" }]),
                note: "But one problem survived. All streams share <strong>one TCP connection</strong>, and TCP delivers bytes strictly in order. One lost packet stalls <em>every</em> stream, even the ones whose data already arrived - <strong>head-of-line blocking moved from HTTP down into TCP</strong>. On a lossy mobile link, HTTP/2 can be slower than six HTTP/1.1 connections.",
            });
        } else {
            f.push({
                stage: seqHTML(W, H, lanes("QUIC"), [
                    { from: 0, to: 1, y: 110, text: "Initial: QUIC + TLS 1.3 together", state: "e-act" },
                    { from: 1, to: 0, y: 160, text: "handshake complete", state: "e-act" },
                    { from: 0, to: 1, y: 210, text: "GET /index.html", state: "e-act" },
                ], [{ x: 330, y: 254, text: "1 RTT to first byte - or 0 RTT on a repeat visit" }]),
                note: "HTTP/3 runs over <strong>QUIC</strong>, which is a reliable, encrypted transport built on top of UDP - in user space, inside the browser and server. Transport setup and TLS are merged into <strong>one</strong> round trip instead of three.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("QUIC"), [
                    { from: 1, to: 0, y: 110, text: "stream 1  ---  packet lost", state: "e-idle" },
                    { from: 1, to: 0, y: 160, text: "stream 3  delivered", state: "e-done" },
                    { from: 1, to: 0, y: 210, text: "stream 5  delivered", state: "e-done" },
                ], [{ x: 330, y: 254, text: "only stream 1 waits for the retransmission" }]),
                note: "The headline fix: QUIC tracks loss and ordering <strong>per stream</strong>. A lost packet stalls only the stream it belonged to; the others are delivered to the application immediately. Head-of-line blocking is genuinely gone.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("connection ID 0x9f2a"), [
                    { from: 0, to: 1, y: 120, text: "Wi-Fi:  10.0.0.7:51514", state: "e-done" },
                    { from: 0, to: 1, y: 190, text: "LTE:    100.64.3.9:44120  - same connection", state: "e-act" },
                ], [{ x: 330, y: 240, text: "identified by connection ID, not by the four-tuple" }]),
                note: "<strong>Connection migration.</strong> A QUIC connection is identified by an ID inside the encrypted payload, not by IP and port - so walking out of Wi-Fi range does not kill the download. TCP could never do this.",
            });
            f.push({
                stage: seqHTML(W, H, lanes("QUIC"), [
                    { from: 0, to: 1, y: 130, text: "everything encrypted, including most of the header", state: "e-done" },
                    { from: 1, to: 0, y: 190, text: "middleboxes cannot inspect or 'optimise' it", state: "e-done" },
                ]),
                note: "The costs are real: UDP is sometimes blocked or throttled, per-packet CPU is higher than kernel TCP, and network operators lose the visibility they used to have. Deployment strategy in practice: <strong>advertise HTTP/3 via <code>Alt-Svc</code> and let clients fall back</strong> to HTTP/2 when UDP does not work.",
            });
        }
        return f;
    },
};

/* ---- 18. TLS ---- */

VIZ["tls-handshake"] = {
    title: "TLS 1.3 - what happens before the first byte of HTTP",
    legend: [["lg-act", "this step"], ["lg-done", "completed"], ["lg-idle", "not yet"]],
    build() {
        const W = 660;
        const H = 330;
        const lanes = (c, s) => [
            { x: 130, label: "client", sub: c },
            { x: 530, label: "server", sub: s },
        ];
        const M = [
            { from: 0, to: 1, y: 112, text: "ClientHello + key share" },
            { from: 1, to: 0, y: 164, text: "ServerHello + key share" },
            { from: 1, to: 0, y: 210, text: "Certificate + signature  (encrypted)" },
            { from: 0, to: 1, y: 258, text: "Finished" },
            { from: 0, to: 1, y: 304, text: "GET /  (encrypted)" },
        ];
        const upTo = (n) => M.slice(0, n).map((m, i) => ({ ...m, state: i === n - 1 ? "e-act" : "e-done" }));

        return [
            {
                stage: seqHTML(W, H, lanes("TCP established", "TCP established"), []),
                note: "TCP is connected, but everything so far is plain text on the wire. TLS provides three separate things - <strong>confidentiality</strong>, <strong>integrity</strong>, and <strong>identity</strong> - and the third is the one people forget.",
            },
            {
                stage: seqHTML(W, H, lanes("sends a key share", ""), upTo(1)),
                note: "<strong>ClientHello</strong>: supported versions and cipher suites, the SNI (which hostname it wants - sent in the clear, which is how one IP can host many sites), and a <strong>Diffie-Hellman key share</strong>. TLS 1.3 guesses the algorithm and sends the key material immediately to save a round trip.",
            },
            {
                stage: seqHTML(W, H, lanes("", "picks the cipher"), upTo(2)),
                note: "<strong>ServerHello</strong> returns the server's own key share. Both sides now independently compute the same shared secret. Crucially the secret <em>itself</em> never crosses the wire, and it is thrown away afterwards - that is <strong>forward secrecy</strong>: recording the traffic today and stealing the private key tomorrow does not decrypt it.",
            },
            {
                stage: seqHTML(W, H, lanes("verifies the chain", "proves identity"), upTo(3)),
                note: "The <strong>certificate</strong> arrives - already encrypted, in TLS 1.3. The client checks that the name matches, the dates are valid, the chain reaches a trusted root, and that the server has signed the handshake with the matching private key. <strong>Encryption without this step is worthless</strong> - you would have a private conversation with an attacker.",
            },
            {
                stage: seqHTML(W, H, lanes("Finished", "Finished"), upTo(4)),
                note: "<strong>Finished</strong> is a MAC over the entire transcript. If anyone tampered with a single byte of the handshake - stripping a cipher, downgrading a version - the two transcripts differ and the connection dies here.",
            },
            {
                stage: seqHTML(W, H, lanes("ESTABLISHED + encrypted", "ESTABLISHED + encrypted"), upTo(5), [{ x: 330, y: 88, text: "1 RTT of TLS on top of 1 RTT of TCP" }]),
                note: "Only now does HTTP begin. Budget: <strong>TLS 1.3 costs one round trip</strong> (TLS 1.2 cost two). On a 100 ms path that is the difference between 200 ms and 300 ms before the first request is even seen.",
            },
            {
                stage: seqHTML(W, H, lanes("resumption ticket", "accepts early data"), [
                    { from: 0, to: 1, y: 130, text: "ClientHello + PSK + GET /  (0-RTT)", state: "e-act" },
                    { from: 1, to: 0, y: 200, text: "200 OK", state: "e-act" },
                ]),
                note: "<strong>Session resumption</strong> uses a ticket from a previous visit to skip straight to data - <strong>0-RTT</strong>. The catch is that early data is <em>replayable</em> by an attacker, so it must only be used for idempotent requests. Never for a POST.",
            },
            {
                stage: seqHTML(W, H, lanes("mutual TLS", "verifies client cert"), [
                    { from: 1, to: 0, y: 120, text: "CertificateRequest", state: "e-done" },
                    { from: 0, to: 1, y: 180, text: "client Certificate + signature", state: "e-act" },
                    { from: 1, to: 0, y: 240, text: "Finished", state: "e-done" },
                ]),
                note: "Two extras worth knowing. <strong>mTLS</strong> makes the client prove identity too - the basis of service-to-service auth in a service mesh. And <strong>TLS termination</strong> at a load balancer means the traffic behind it is plaintext unless you re-encrypt: a padlock in the browser says nothing about your internal network.",
            },
        ];
    },
};

/* ---- 19. Load balancing ---- */

VIZ["load-balancing"] = {
    title: "Spreading requests across backends",
    legend: [["lg-act", "chosen backend"], ["lg-done", "healthy"], ["lg-out", "failing health checks"], ["lg-idle", "idle"]],
    options: [
        { value: "rr", label: "Balancing by round robin" },
        { value: "least", label: "Balancing by least connections" },
        { value: "hash", label: "Balancing by consistent hash" },
    ],
    build(option) {
        const mode = option || "rr";
        const W = 660;
        const H = 290;
        const draw = (pick, loads, down, reqLabel) => {
            let s = boxHTML(16, 118, 140, 46, "clients", "n-done", reqLabel);
            s += boxHTML(232, 118, 150, 46, "load balancer", "n-act", mode === "rr" ? "round robin" : mode === "least" ? "least connections" : "hash(client ip)");
            const ys = [26, 118, 210];
            ["backend 1", "backend 2", "backend 3"].forEach((b, i) => {
                const st = down === i ? "n-out" : pick === i ? "n-act" : "n-done";
                s += boxHTML(462, ys[i], 182, 46, b, st, `${loads[i]} active connections`);
                s += pathHTML(`M382 141 H422 V${ys[i] + 23} H462`, down === i ? "e-idle" : pick === i ? "e-act" : "e-done");
            });
            s += arrowHTML(156, 141, 228, 141, "e-act");
            return svgHTML(W, H, s);
        };
        const f = [];

        if (mode === "rr") {
            f.push({ stage: draw(0, [1, 0, 0], -1, "request 1"), note: "<strong>Round robin</strong> is the default everywhere: keep a counter, hand each new request to the next backend. No state about the backends is needed at all." });
            f.push({ stage: draw(1, [1, 1, 0], -1, "request 2"), note: "Request 2 goes to backend 2. Simple, stateless, and trivially correct when every request costs roughly the same." });
            f.push({ stage: draw(2, [1, 1, 1], -1, "request 3"), note: "Request 3 to backend 3, then the counter wraps. Distribution is perfectly even <em>by count</em>." });
            f.push({ stage: draw(0, [4, 1, 1], -1, "request 4 - a slow one"), note: "Here is the flaw: <strong>even by count is not even by load</strong>. If backend 1 happens to receive the expensive requests - a report export, a cold cache - it drowns while the others idle. Round robin is blind to that." });
            f.push({ stage: draw(1, [4, 2, 1], 2, "backend 3 stops answering"), note: "Backend 3 fails its <strong>health check</strong> and is pulled from the pool. Health checks are what make a load balancer more than a splitter - and checking a real endpoint that touches the database beats checking that a port is open." });
            f.push({ stage: draw(0, [5, 2, 0], 2, "traffic redistributed"), note: "Traffic redistributes automatically. But size for it: <strong>when one of three backends dies, the survivors each take 50% more load</strong>. A pool running at 70% has no headroom for a single failure." });
        } else if (mode === "least") {
            f.push({ stage: draw(0, [0, 0, 0], -1, "request 1"), note: "<strong>Least connections</strong> tracks how many requests each backend is currently handling and sends the next one to the smallest number. Ties go to the first." });
            f.push({ stage: draw(1, [3, 0, 0], -1, "backend 1 is stuck on 3 slow requests"), note: "Backend 1 picked up three slow requests. Round robin would keep feeding it anyway; least-connections routes around it immediately." });
            f.push({ stage: draw(2, [3, 1, 0], -1, "request 3"), note: "The count is a live proxy for how busy a backend really is, which is why this is the better default for <strong>variable-cost requests</strong> - APIs, uploads, anything backed by a query." });
            f.push({ stage: draw(1, [3, 1, 2], -1, "a fresh backend joins"), note: "The failure mode to know: a <strong>newly added backend has zero connections</strong>, so it attracts a flood of traffic at exactly the moment its caches and JIT are cold. Slow-start ramping in the load balancer exists for this." });
            f.push({ stage: draw(0, [1, 1, 1], -1, "steady state"), note: "In steady state it converges to the same distribution as round robin - the difference only shows up under skew, which is precisely when it matters." });
        } else {
            f.push({ stage: draw(1, [0, 1, 0], -1, "client 1.2.3.4"), note: "<strong>Consistent hashing</strong> maps a key - client IP, session cookie, cache key - onto a backend. The same key always lands on the same backend." });
            f.push({ stage: draw(1, [0, 2, 0], -1, "client 1.2.3.4 again"), note: "The same client returns and reaches the <em>same</em> backend, so an in-memory session or a warm local cache still applies. This is <strong>session affinity</strong>, and it is the only way sticky state survives without a shared store." });
            f.push({ stage: draw(2, [0, 2, 1], -1, "client 5.6.7.8"), note: "A different key hashes elsewhere. Distribution is even as long as the keys are diverse - and badly uneven if one client, or one NAT gateway, sends most of the traffic." });
            f.push({ stage: draw(0, [1, 2, 1], 1, "backend 2 dies"), note: "The reason for the word <em>consistent</em>: when a backend is removed, only the keys that pointed at <strong>that</strong> backend move. A naive <code>hash % n</code> would reshuffle everything and invalidate every cache in the fleet at once." });
            f.push({ stage: draw(0, [2, 0, 2], 1, "1/3 of keys remapped"), note: "That property is why consistent hashing runs distributed caches and shards - and the trade-off to accept: <strong>sticky sessions make deploys harder</strong>, because you cannot drain a backend without disturbing the users pinned to it. Prefer stateless backends with sessions in Redis when you can." });
        }
        return f;
    },
};

/* ---- 20. CDN ---- */

VIZ["cdn"] = {
    title: "Why a CDN is mostly about distance",
    legend: [["lg-act", "serving this request"], ["lg-done", "cached / warm"], ["lg-out", "cache miss"], ["lg-idle", "idle"]],
    build() {
        const W = 660;
        const H = 280;
        const draw = (st, caption) => {
            let s = boxHTML(16, 40, 140, 44, "user in Sydney", st.u1 || "n-idle");
            s += boxHTML(16, 180, 140, 44, "user in Berlin", st.u2 || "n-idle");
            s += boxHTML(224, 40, 160, 44, "edge  Sydney", st.e1 || "n-idle", "2 ms away");
            s += boxHTML(224, 180, 160, 44, "edge  Frankfurt", st.e2 || "n-idle", "5 ms away");
            s += boxHTML(462, 110, 176, 46, "origin  Virginia", st.o || "n-idle", "200 ms from Sydney");
            s += arrowHTML(156, 62, 220, 62, st.a1 || "e-idle");
            s += arrowHTML(156, 202, 220, 202, st.a2 || "e-idle");
            s += pathHTML("M384 62 H424 V128 H462", st.b1 || "e-idle");
            s += pathHTML("M384 202 H424 V140 H462", st.b2 || "e-idle");
            if (caption) s += capHTML(330, 264, caption);
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ u1: "n-act", o: "n-idle" }, "without a CDN: 200 ms each way"),
                note: "Light in fibre travels about 200 km per millisecond, and real paths are far from straight. Sydney to Virginia is roughly <strong>200 ms round trip</strong> - a hard physical floor no amount of server tuning can beat.",
            },
            {
                stage: draw({ u1: "n-act", a1: "e-act", e1: "n-out" }, "first request: cache MISS"),
                note: "With a CDN, DNS or anycast routes the user to the <strong>nearest edge</strong> - 2 ms away. The edge has never seen this object, so it is a <strong>miss</strong>.",
            },
            {
                stage: draw({ u1: "n-done", a1: "e-done", e1: "n-act", b1: "e-act", o: "n-act" }, "edge fetches once from origin"),
                note: "The edge fetches from origin over an already-warm, long-lived, tuned connection. The user pays the long trip <em>this once</em>.",
            },
            {
                stage: draw({ u1: "n-act", a1: "e-act", e1: "n-done", o: "n-done" }, "cached at the edge for its TTL"),
                note: "The response is stored according to <code>Cache-Control: public, max-age=31536000</code>. Now the object lives 2 ms from the user.",
            },
            {
                stage: draw({ u2: "n-act", a2: "e-act", e2: "n-out", b2: "e-act", o: "n-done" }, "Berlin: separate edge, separate cache"),
                note: "A user in Berlin hits a <em>different</em> edge with its own cache, so the first request there misses too. A CDN is many independent caches, not one - which is why cache hit ratio matters far more than raw edge count.",
            },
            {
                stage: draw({ u1: "n-act", u2: "n-act", a1: "e-act", a2: "e-act", e1: "n-done", e2: "n-done", o: "n-idle" }, "steady state: origin sees almost nothing"),
                note: "In steady state the origin serves a trickle. Two wins at once: <strong>latency</strong> collapses because TCP and TLS handshakes now terminate metres away, and <strong>origin load</strong> collapses because a 95% hit ratio means 20x fewer requests reach it.",
            },
            {
                stage: draw({ u1: "n-act", a1: "e-act", e1: "n-out", b1: "e-act", o: "n-act" }, "invalidation: the hard part"),
                note: "The hard problem is <strong>invalidation</strong>. A purge must reach every edge, and until it does some users see stale content. The standard escape is <strong>content hashing in the filename</strong> - <code>app.9f2a1c.js</code> - so a new deploy is a new URL and old objects can be cached forever without ever needing a purge.",
            },
            {
                stage: draw({ u1: "n-done", u2: "n-done", e1: "n-done", e2: "n-done", o: "n-done", a1: "e-done", a2: "e-done" }, "dynamic content benefits too"),
                note: "Even uncacheable, personalised responses gain: the client's TCP and TLS handshakes complete at the nearby edge, and the edge-to-origin leg reuses a persistent connection. <strong>You save the round trips, not the bytes</strong> - often the larger half of page load time.",
            },
        ];
    },
};

/* ---- 21. BGP ---- */

VIZ["bgp"] = {
    title: "BGP - how the internet learns where a prefix lives",
    legend: [["lg-act", "announcing now"], ["lg-done", "route installed"], ["lg-out", "route withdrawn"], ["lg-idle", "no route yet"]],
    build() {
        const W = 660;
        const H = 260;
        const AS = [
            { x: 74, y: 130, label: "AS 64500", sub: "your ISP" },
            { x: 250, y: 60, label: "AS 3356", sub: "transit" },
            { x: 250, y: 200, label: "AS 1299", sub: "transit" },
            { x: 430, y: 130, label: "AS 2914", sub: "transit" },
            { x: 590, y: 130, label: "AS 15133", sub: "holds 93.184.216.0/24" },
        ];
        const E = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
        const draw = (st, es, caption) => {
            let s = "";
            E.forEach(([a, b], i) => {
                s += edgeHTML(AS[a].x, AS[a].y, AS[b].x, AS[b].y, es[i] || "e-idle");
            });
            AS.forEach((n, i) => {
                s += nodeHTML(n.x, n.y, n.label, st[i] || "n-idle", 34, n.sub);
            });
            if (caption) s += capHTML(330, 22, caption);
            return svgHTML(W, H, s);
        };
        const table = (rows, marks) => dataGridHTML([["AS 64500 best path", "prefix", "AS path", "chosen"], ...rows.map((r) => [r[0] || "route", ...r.slice(1)])], marks);
        const head = { "0,0": "is-head", "0,1": "is-head", "0,2": "is-head", "0,3": "is-head" };
        const lab = (n) => { const m = { ...head }; for (let r = 1; r <= n; r++) m[`${r},0`] = "is-head"; return m; };

        return [
            {
                stage: draw({ 4: "n-act" }, {}, "AS 15133 announces its own prefix") + table([["", "-", "-", "-"]], lab(1)),
                note: "The internet is about 75,000 <strong>autonomous systems</strong> - independently run networks. Routing between them is not a shortest-path calculation; it is an <strong>announcement</strong>: \"I can reach <code>93.184.216.0/24</code>\".",
            },
            {
                stage: draw({ 4: "n-done", 3: "n-act" }, { 4: "e-act" }, "path: 15133") + table([["", "-", "-", "-"]], lab(1)),
                note: "AS 2914 receives it, and before passing it on it <strong>prepends its own AS number</strong>. The route now carries the list of networks it has traversed.",
            },
            {
                stage: draw({ 4: "n-done", 3: "n-done", 1: "n-act", 2: "n-act" }, { 4: "e-done", 2: "e-act", 3: "e-act" }, "path: 2914 15133") + table([["", "-", "-", "-"]], lab(1)),
                note: "Both transit providers learn it and propagate it further. That accumulating <strong>AS path</strong> is also the loop-prevention mechanism: an AS that sees its own number in the path discards the route immediately.",
            },
            {
                stage: draw({ 4: "n-done", 3: "n-done", 1: "n-done", 2: "n-done", 0: "n-act" }, { 4: "e-done", 2: "e-done", 3: "e-done", 0: "e-act", 1: "e-act" }, "two candidate paths arrive") + table([
                    ["", "93.184.216.0/24", "3356 2914 15133", "?"],
                    ["", "93.184.216.0/24", "1299 2914 15133", "?"],
                ], lab(2)),
                note: "Your ISP now has <strong>two</strong> ways to reach the prefix. It must pick one - and the choice is not about speed.",
            },
            {
                stage: draw({ 4: "n-done", 3: "n-done", 1: "n-act", 2: "n-idle", 0: "n-done" }, { 4: "e-done", 2: "e-done", 0: "e-done", 1: "e-idle", 3: "e-done" }, "best path installed via AS 3356") + table([
                    ["", "93.184.216.0/24", "3356 2914 15133", "yes"],
                    ["", "93.184.216.0/24", "1299 2914 15133", "backup"],
                ], { ...lab(2), "1,2": "is-act", "1,3": "is-act" }),
                note: "Selection order in practice: <strong>local preference</strong> first (a business decision - prefer the cheaper transit), then <strong>shortest AS path</strong>, then a chain of tie-breakers. <strong>BGP optimises for money and policy, not latency</strong> - which is why a packet from London to Paris can go via New York.",
            },
            {
                stage: draw({ 4: "n-done", 3: "n-done", 1: "n-out", 2: "n-act", 0: "n-act" }, { 4: "e-done", 2: "e-done", 0: "e-idle", 1: "e-act", 3: "e-done" }, "AS 3356 link fails - route withdrawn") + table([
                    ["", "93.184.216.0/24", "3356 2914 15133", "withdrawn"],
                    ["", "93.184.216.0/24", "1299 2914 15133", "yes"],
                ], { ...lab(2), "2,3": "is-act" }),
                note: "When the link fails, a <strong>withdrawal</strong> propagates and the backup path takes over. Convergence is measured in <em>tens of seconds to minutes</em>, not milliseconds - the internet heals slowly and visibly.",
            },
            {
                stage: draw({ 4: "n-out", 3: "n-out", 1: "n-out", 2: "n-out", 0: "n-out" }, { 0: "e-act", 1: "e-act", 2: "e-act", 3: "e-act", 4: "e-act" }, "a wrong announcement is believed") + table([
                    ["", "93.184.216.0/25", "64999", "MORE SPECIFIC - wins"],
                ], { ...lab(1), "1,2": "is-act" }),
                note: "The uncomfortable part: <strong>BGP is built on trust</strong>. Announce a more specific prefix than the real owner and, thanks to longest-prefix match, the internet sends you their traffic. That is a BGP hijack - and it has taken large services offline more than once. RPKI signing is the fix, and it is still only partially deployed.",
            },
        ];
    },
};

/* ---- 22. The whole journey ---- */

VIZ["packet-journey"] = {
    title: "Typing a URL - the whole stack in one timeline",
    legend: [["lg-act", "happening now"], ["lg-done", "finished"], ["lg-idle", "not started"]],
    build() {
        const W = 660;
        const H = 300;
        const STEPS = [
            ["DNS lookup", 40, "cache miss - 4 queries"],
            ["ARP for the gateway", 10, "first packet only"],
            ["TCP handshake", 80, "1 RTT"],
            ["TLS 1.3 handshake", 80, "1 RTT"],
            ["HTTP request sent", 40, "half an RTT"],
            ["server thinks", 60, "app + database"],
            ["response transfers", 90, "slow start limits it"],
            ["render + subresources", 120, "more connections, more RTTs"],
        ];
        const total = STEPS.reduce((a, s) => a + s[1], 0);
        const draw = (act) => {
            let s = capHTML(20, 24, "time ->", "start");
            let x = 20;
            STEPS.forEach((st, i) => {
                const w = Math.round((st[1] / total) * 600);
                const cls = i < act ? "n-done" : i === act ? "n-act" : "n-idle";
                s += `<rect x="${x}" y="36" width="${w - 3}" height="30" rx="5" class="${cls}" stroke-width="2"/>`;
                x += w;
            });
            if (act >= 0) {
                s += boxHTML(120, 110, 420, 48, STEPS[act][0], "n-act", STEPS[act][2]);
                s += capHTML(330, 200, `${STEPS[act][1]} ms of the ${total} ms budget`);
                s += capHTML(330, 226, `elapsed: ${STEPS.slice(0, act + 1).reduce((a, st) => a + st[1], 0)} ms`);
            }
            return svgHTML(W, H, s);
        };
        const NOTES = [
            "<strong>DNS.</strong> Before anything else, the name must become an address - possibly four queries up the delegation chain. On a cache hit this is free; on a miss it can be 100 ms, and it happens before a single byte of your site is requested.",
            "<strong>ARP.</strong> The IP address is outside our subnet, so the packet must go to the default gateway - and the machine needs the gateway's MAC address. One broadcast, one reply, then cached for minutes.",
            "<strong>TCP.</strong> SYN, SYN-ACK, ACK. A full round trip spent purely on agreeing that a connection exists. Every extra host you connect to pays this again.",
            "<strong>TLS.</strong> One more round trip to agree keys and verify the certificate. This is where 0-RTT resumption and connection reuse earn their keep.",
            "<strong>HTTP.</strong> Finally the request goes out - a few hundred bytes, after roughly 200 ms of pure setup. This is why <em>latency, not bandwidth, dominates</em> small requests.",
            "<strong>Server time.</strong> The only part your application code controls, and usually the only part anyone measures. Notice how small a share of the total it is.",
            "<strong>Transfer.</strong> The response cannot use the full pipe immediately - <strong>slow start</strong> means the first ~14 KB goes out in one round trip, the next ~28 KB in the second. Keeping the critical response under 14 KB is a real optimisation.",
            "<strong>Render.</strong> Parsing HTML uncovers CSS, JS and images - and each new host repeats DNS, TCP and TLS. This is why HTTP/2 multiplexing, connection reuse and a CDN change page load far more than making the server 20% faster.",
        ];
        return STEPS.map((_, i) => ({ stage: draw(i), note: NOTES[i] })).concat([
            {
                stage: draw(STEPS.length - 1),
                note: "Read the whole bar at once: <strong>server processing is a fraction of it</strong>. Setup round trips, DNS, and transfer ramp-up dominate. Every serious web performance technique - keep-alive, HTTP/2, TLS resumption, CDNs, preconnect, HTTP/3 - attacks the <em>round trips</em>, not the compute.",
            },
        ]);
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
