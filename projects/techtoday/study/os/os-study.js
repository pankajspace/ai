/* ==========================================================================
   TechToday - Operating systems study guide
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
const C_KW = new Set(
    ("auto break case char const continue default do double else enum extern float for goto if inline " +
        "int long register restrict return short signed sizeof static struct switch typedef union unsigned " +
        "void volatile while _Atomic _Bool NULL").split(" ")
);
const C_BUILTIN = new Set(
    ("printf fprintf sprintf perror malloc calloc realloc free memcpy memset strcmp strlen strcpy exit " +
        "fork execvp execlp wait waitpid pipe read write open close mmap munmap getpid getppid kill signal " +
        "pthread_create pthread_join pthread_mutex_lock pthread_mutex_unlock pthread_cond_wait " +
        "pthread_cond_signal sem_wait sem_post sem_init size_t ssize_t pid_t off_t uint32_t uint64_t " +
        "pthread_t pthread_mutex_t pthread_cond_t sem_t FILE stdout stderr stdin").split(" ")
);
const SH_KW = new Set(
    ("case do done elif else esac fi for function if in select then time until while export local " +
        "readonly return set unset source").split(" ")
);
const SH_BUILTIN = new Set(
    ("echo cat grep awk sed cut sort uniq head tail wc ps top htop kill nice renice taskset strace ltrace " +
        "lsof vmstat iostat mpstat pidstat free df du mount umount dmesg sysctl perf chrt ulimit ipcs " +
        "nproc uname stat time trap").split(" ")
);
const LANG_SPEC = {
    python: [PY_KW, PY_BUILTIN],
    javascript: [JS_KW, JS_BUILTIN],
    c: [C_KW, C_BUILTIN],
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
            else if (previous === "class" || previous === "struct" || previous === "typedef") cls = "tok-typ";
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

const LANG_LABEL = { python: "Python", javascript: "JavaScript", c: "C", bash: "Shell", text: "Output" };
const LANG_KEY = "tt-os-lang";
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
   Operating-systems widgets
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

/* ---- 1. A system call ---- */

VIZ["syscall"] = {
    title: "read() crossing into the kernel",
    legend: [["lg-act", "executing now"], ["lg-done", "already done"], ["lg-idle", "idle"]],
    build() {
        const W = 680;
        const H = 330;
        const draw = (st) => {
            let s = bandHTML(14, 12, W - 28, 118, "USER MODE - ring 3, no privileged instructions");
            s += bandHTML(14, 182, W - 28, 132, "KERNEL MODE - ring 0, full hardware access");
            s += `<line x1="14" y1="158" x2="${W - 14}" y2="158" class="e-idle" stroke-dasharray="3 7"/>`;
            s += capHTML(W / 2, 152, "the privilege boundary");
            s += pathHTML("M453 106 V138 H32 V240 H50", st.down || "e-idle");
            s += pathHTML("M564 240 H650 V82 H518", st.up || "e-idle");
            s += edgeHTML(190, 82, 224, 82, st.e1 || "e-idle");
            s += edgeHTML(354, 82, 388, 82, st.e2 || "e-idle");
            s += edgeHTML(200, 240, 234, 240, st.e3 || "e-idle");
            s += edgeHTML(390, 240, 424, 240, st.e4 || "e-idle");
            s += boxHTML(50, 58, 140, 48, "your program", st.app || "n-idle");
            s += boxHTML(224, 58, 130, 48, "libc read()", st.libc || "n-idle");
            s += boxHTML(388, 58, 130, 48, "syscall", st.trap || "n-idle", "the trap instruction");
            s += boxHTML(50, 216, 150, 48, "trap handler", st.handler || "n-idle");
            s += boxHTML(234, 216, 156, 48, "sys_read()", st.sys || "n-idle");
            s += boxHTML(424, 216, 140, 48, "disk driver", st.drv || "n-idle");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ app: "n-act" }),
                note: "Your program calls <code>read(fd, buf, 4096)</code>. So far this is an ordinary function call — same stack, same privilege level, nothing special has happened.",
            },
            {
                stage: draw({ app: "n-done", libc: "n-act", e1: "e-act" }),
                note: "Control reaches the C library, which is <em>still user code</em>. Its entire job is plumbing: put the call number <code>__NR_read</code> in <code>rax</code> and the three arguments in <code>rdi, rsi, rdx</code>.",
            },
            {
                stage: draw({ app: "n-done", libc: "n-done", trap: "n-act", e1: "e-done", e2: "e-act" }),
                note: "Now the <code>syscall</code> instruction. This is the only way a user program can raise its own privilege — and crucially it does <em>not</em> get to choose where it lands.",
            },
            {
                stage: draw({ app: "n-done", libc: "n-done", trap: "n-done", down: "e-act", handler: "n-act", e1: "e-done", e2: "e-done" }),
                note: "The CPU flips to ring 0, switches to the kernel stack, and jumps to an address the kernel registered at boot. Picking the entry point is the kernel's privilege, not yours — that is the whole security model in one sentence.",
            },
            {
                stage: draw({ app: "n-done", libc: "n-done", trap: "n-done", down: "e-done", handler: "n-done", sys: "n-act", e3: "e-act" }),
                note: "The handler dispatches through the syscall table to <code>sys_read</code>, which then distrusts everything: is <code>fd</code> actually open? Does <code>buf</code> really live inside this process's address space?",
            },
            {
                stage: draw({ app: "n-done", libc: "n-done", trap: "n-done", down: "e-done", handler: "n-done", sys: "n-done", drv: "n-act", e3: "e-done", e4: "e-act" }),
                note: "The request reaches the block layer. A disk needs milliseconds, so the kernel marks your process <strong>blocked</strong> and runs somebody else. This is where the context switch usually happens.",
            },
            {
                stage: draw({ app: "n-idle", libc: "n-done", trap: "n-done", down: "e-done", handler: "n-done", sys: "n-done", drv: "n-done", up: "e-act", e3: "e-done", e4: "e-done" }),
                note: "The disk raises an interrupt when the data lands. The kernel copies it into your buffer and moves the process from <em>waiting</em> back to <em>ready</em>.",
            },
            {
                stage: draw({ app: "n-act", libc: "n-done", trap: "n-done", down: "e-done", handler: "n-done", sys: "n-done", drv: "n-done", up: "e-done", e1: "e-done", e2: "e-done", e3: "e-done", e4: "e-done" }),
                note: "<code>sysret</code> drops back to ring 3 at the instruction right after <code>syscall</code>, and <code>read()</code> returns a byte count. From the program's point of view nothing unusual occurred.",
            },
            {
                stage: draw({ app: "n-done", libc: "n-done", trap: "n-done", handler: "n-done", sys: "n-done", drv: "n-done", down: "e-done", up: "e-done", e1: "e-done", e2: "e-done", e3: "e-done", e4: "e-done" }),
                note: "Even when the data was already in the page cache, the boundary crossing alone costs roughly <code>1-2 µs</code>. That is why high-throughput software batches: <code>readv</code>, <code>sendmmsg</code>, <code>io_uring</code> — one crossing, many operations.",
            },
        ];
    },
};

/* ---- 2. Process state machine ---- */

VIZ["process-states"] = {
    title: "The five states of a process",
    legend: [["lg-act", "current state"], ["lg-done", "already visited"], ["lg-idle", "not yet reached"]],
    build() {
        const W = 680;
        const H = 300;
        const draw = (st, caption) => {
            let s = pathHTML("M152 108 H182 V78 H208", st.eNewReady || "e-idle");
            s += pathHTML("M330 74 Q374 34 418 74", st.eDispatch || "e-idle");
            s += pathHTML("M418 96 Q374 136 330 96", st.ePreempt || "e-idle");
            s += pathHTML("M480 110 V178 H372", st.eBlock || "e-idle");
            s += pathHTML("M300 202 H252 V110", st.eWake || "e-idle");
            s += pathHTML("M542 86 H600 V186", st.eExit || "e-idle");
            s += capHTML(374, 30, "dispatch");
            s += capHTML(374, 128, "preempt (timer)");
            s += capHTML(430, 172, "blocks on I/O");
            s += capHTML(232, 152, "wakes up", "end");
            s += capHTML(614, 130, "exit()", "start");
            s += boxHTML(40, 84, 112, 48, "new", st.sNew || "n-idle", "PCB created");
            s += boxHTML(208, 62, 122, 48, "ready", st.sReady || "n-idle", "has everything but a CPU");
            s += boxHTML(418, 62, 124, 48, "running", st.sRun || "n-idle", "owns a core right now");
            s += boxHTML(300, 178, 148, 48, "waiting", st.sWait || "n-idle", "blocked on an event");
            s += boxHTML(548, 186, 108, 48, "terminated", st.sTerm || "n-idle", "zombie until reaped");
            return svgHTML(W, H, s + capHTML(W / 2, H - 8, caption || ""));
        };
        const done = {};
        const at = (key, extra = {}) => {
            const st = { ...done, ...extra, [key]: "n-act" };
            done[key] = "n-done";
            return st;
        };

        return [
            {
                stage: draw(at("sNew"), "fork() has returned"),
                note: "<strong>New.</strong> The process exists — it has a PID, an address space and a PCB — but the scheduler has not considered it yet.",
            },
            {
                stage: draw(at("sReady", { eNewReady: "e-act" }), "admitted to the run queue"),
                note: "<strong>Ready.</strong> It has everything it needs except one thing: a CPU. On a busy server most processes spend most of their life here.",
            },
            {
                stage: draw(at("sRun", { eDispatch: "e-act" }), "the scheduler dispatched it"),
                note: "<strong>Running.</strong> On a 4-core machine exactly four processes are in this state at any instant. Everything else that <em>could</em> run is queued behind them.",
            },
            {
                stage: draw({ ...done, sReady: "n-act", ePreempt: "e-act" }, "time slice expired"),
                note: "A timer interrupt fires at the end of the slice and the kernel puts it back on the ready queue. It did nothing wrong — its turn simply ended. This is what <em>preemptive</em> means.",
            },
            {
                stage: draw({ ...done, sRun: "n-act", eDispatch: "e-act" }, "dispatched again"),
                note: "Dispatched again a few milliseconds later. Each round trip through ready→running→ready is one context switch.",
            },
            {
                stage: draw(at("sWait", { eBlock: "e-act" }), "read() found no data"),
                note: "<strong>Waiting.</strong> It asked for socket data that has not arrived. A waiting process burns no CPU at all and the scheduler skips it entirely — this is why 10,000 idle connections cost almost nothing.",
            },
            {
                stage: draw({ ...done, sReady: "n-act", eWake: "e-act" }, "the packet arrived"),
                note: "The NIC interrupt handler wakes it. Notice it goes back to <strong>ready</strong>, not straight to running: waking up does not let you jump the queue.",
            },
            {
                stage: draw({ ...done, sRun: "n-act", eDispatch: "e-act" }, "running again"),
                note: "Back on a core, resuming at the exact instruction after <code>read()</code>. It has no idea that four other processes ran in between.",
            },
            {
                stage: draw(at("sTerm", { eExit: "e-act" }), "exit status waiting to be collected"),
                note: "<strong>Terminated.</strong> Memory and file descriptors are released immediately, but the PCB survives as a <em>zombie</em> until the parent calls <code>wait()</code>. A parent that never reaps leaks PIDs.",
            },
            {
                stage: draw(done, "only two edges are the scheduler's decision"),
                note: "The whole diagram in one line: only <em>dispatch</em> and <em>preempt</em> are the scheduler's choice. Every other arrow is forced by the program itself or by hardware.",
            },
        ];
    },
};

/* ---- 3. Context switch ---- */

VIZ["context-switch"] = {
    title: "What a context switch actually copies",
    legend: [["lg-act", "being written"], ["lg-done", "saved / restored"], ["lg-idle", "untouched"]],
    build() {
        const W = 680;
        const H = 320;
        const regRow = (x, y, name, value, state) =>
            `<text x="${x}" y="${y}" class="n-sub" style="text-anchor:start">${esc(name)}</text>` +
            `<text x="${x + 54}" y="${y}" class="n-sub" style="text-anchor:start;fill:${state === "act" ? "#e0af68" : "#94a0ad"}">${esc(value)}</text>`;
        const draw = (st) => {
            let s = boxHTML(24, 40, 170, 34, "PCB of process A", st.pcbA || "n-idle");
            s += `<rect x="24" y="82" width="170" height="98" rx="8" class="n-idle" stroke-width="1.5"/>`;
            s += regRow(40, 104, "pc", st.saveA ? "0x4011f0" : "-", st.saveA);
            s += regRow(40, 126, "sp", st.saveA ? "0x7ffd20" : "-", st.saveA);
            s += regRow(40, 148, "regs", st.saveA ? "saved" : "-", st.saveA);
            s += regRow(40, 170, "cr3", st.saveA ? "0x1a000" : "-", st.saveA);

            s += boxHTML(486, 40, 170, 34, "PCB of process B", st.pcbB || "n-idle");
            s += `<rect x="486" y="82" width="170" height="98" rx="8" class="n-idle" stroke-width="1.5"/>`;
            s += regRow(502, 104, "pc", "0x7f2a08", st.loadB);
            s += regRow(502, 126, "sp", "0x7ffc90", st.loadB);
            s += regRow(502, 148, "regs", "stored", st.loadB);
            s += regRow(502, 170, "cr3", "0x2c000", st.loadB);

            s += boxHTML(258, 40, 164, 34, "CPU", st.cpu || "n-idle");
            s += `<rect x="258" y="82" width="164" height="98" rx="8" class="n-idle" stroke-width="1.5"/>`;
            s += regRow(274, 104, "pc", st.regs ? st.regs[0] : "-", "act");
            s += regRow(274, 126, "sp", st.regs ? st.regs[1] : "-", "act");
            s += regRow(274, 148, "regs", st.regs ? st.regs[2] : "-", "act");
            s += regRow(274, 170, "cr3", st.regs ? st.regs[3] : "-", "act");

            s += pathHTML("M258 131 H198", st.arrowSave || "e-idle");
            s += pathHTML("M422 131 H482", st.arrowLoad || "e-idle");
            s += boxHTML(230, 224, 220, 44, st.phase || "process A is running", st.phaseState || "n-act");
            s += capHTML(W / 2, 296, st.cost || "");
            return svgHTML(W, H, s);
        };
        const aRegs = ["0x4011f0", "0x7ffd20", "live", "0x1a000"];
        const bRegs = ["0x7f2a08", "0x7ffc90", "live", "0x2c000"];

        return [
            {
                stage: draw({ cpu: "n-act", regs: aRegs, phase: "A is running" }),
                note: "Process A owns the core. Its entire visible state is the register file — program counter, stack pointer, general registers, and <code>cr3</code>, the pointer to its page tables.",
            },
            {
                stage: draw({ cpu: "n-act", regs: aRegs, phase: "timer interrupt", phaseState: "n-out" }),
                note: "The timer interrupt fires. Hardware alone pushes the program counter and flags, switches to the kernel stack and enters ring 0. Nothing has been scheduled yet.",
            },
            {
                stage: draw({ cpu: "n-act", regs: aRegs, pcbA: "n-act", saveA: "act", arrowSave: "e-act", phase: "saving A's context", phaseState: "n-act" }),
                note: "The kernel copies the rest of A's registers into A's PCB. This is the literal meaning of <em>saving context</em> — a struct copy of a few hundred bytes.",
            },
            {
                stage: draw({ pcbA: "n-done", saveA: "done", regs: ["-", "-", "-", "0x1a000"], phase: "scheduler picks the next task", phaseState: "n-cmp" }),
                note: "Now the scheduler runs. On Linux this is <code>pick_next_task()</code>, which walks the run queue and returns whichever task has fallen furthest behind its fair share.",
            },
            {
                stage: draw({ pcbA: "n-done", saveA: "done", pcbB: "n-act", regs: ["-", "-", "-", "0x2c000"], phase: "switch address space", phaseState: "n-act" }),
                note: "Loading B's <code>cr3</code> switches the whole address space. On older CPUs this flushed the entire TLB; with PCIDs the entries survive but the caches still cool down.",
            },
            {
                stage: draw({ pcbA: "n-done", saveA: "done", pcbB: "n-act", loadB: "act", arrowLoad: "e-act", regs: bRegs, phase: "restoring B's context", phaseState: "n-act" }),
                note: "B's saved registers are copied back into the CPU. The program counter is restored last, and it points at the instruction B was about to execute when it was preempted.",
            },
            {
                stage: draw({ pcbA: "n-done", saveA: "done", pcbB: "n-done", loadB: "done", cpu: "n-done", regs: bRegs, phase: "B is running", phaseState: "n-done" }),
                note: "<code>iret</code> returns to ring 3 and B continues, completely unaware that it was ever stopped. That illusion is the point of the whole mechanism.",
            },
            {
                stage: draw({ pcbA: "n-done", saveA: "done", pcbB: "n-done", loadB: "done", cpu: "n-done", regs: bRegs, phase: "B is running", phaseState: "n-done", cost: "direct cost ~1-3 µs   +   cold caches for far longer" }),
                note: "The register copy is cheap. The expensive part is invisible: B starts with A's data still in L1/L2, so it stalls on cache misses for thousands of cycles. That indirect cost is usually the bigger half.",
            },
        ];
    },
};

/* ---- 4. CPU scheduling ---- */

const SCHED_JOBS = [
    { id: "P1", at: 0, bt: 4, pr: 2 },
    { id: "P2", at: 1, bt: 3, pr: 1 },
    { id: "P3", at: 2, bt: 3, pr: 3 },
    { id: "P4", at: 3, bt: 2, pr: 1 },
];

const simulateSchedule = (mode) => {
    const jobs = SCHED_JOBS.map((j) => ({ ...j, left: j.bt, done: -1 }));
    const byId = Object.fromEntries(jobs.map((j) => [j.id, j]));
    const queue = [];
    const seen = new Set();
    const slices = [];
    let t = 0;
    let guard = 0;
    const admit = () => {
        jobs.forEach((j) => {
            if (j.at <= t && !seen.has(j.id)) {
                seen.add(j.id);
                queue.push(j);
            }
        });
    };
    while (jobs.some((j) => j.left > 0) && guard++ < 100) {
        admit();
        if (!queue.length) {
            slices.push({ id: "--", from: t, to: t + 1, why: "no job has arrived yet, so the CPU idles" });
            t += 1;
            continue;
        }
        let idx = 0;
        let why = `<code>${queue[0].id}</code> has waited longest, so it runs to completion`;
        if (mode === "sjf") {
            idx = queue.reduce((best, j, i) => (j.left < queue[best].left ? i : best), 0);
            why = `of the jobs that have arrived, <code>${queue[idx].id}</code> has the shortest burst (<code>${queue[idx].left}</code>)`;
        } else if (mode === "priority") {
            idx = queue.reduce((best, j, i) => (j.pr < queue[best].pr ? i : best), 0);
            why = `<code>${queue[idx].id}</code> holds the best priority (<code>${queue[idx].pr}</code>) among the arrived jobs`;
        } else if (mode === "rr") {
            why = `<code>${queue[0].id}</code> is at the head of the queue and gets one quantum`;
        }
        const job = queue.splice(idx, 1)[0];
        const run = mode === "rr" ? Math.min(2, job.left) : job.left;
        slices.push({ id: job.id, from: t, to: t + run, why, left: job.left - run });
        job.left -= run;
        t += run;
        admit();
        if (job.left > 0) queue.push(job);
        else job.done = t;
    }
    return { jobs, byId, slices, total: t };
};

VIZ["scheduling"] = {
    title: "Four schedulers, same four jobs",
    legend: [["lg-act", "running now"], ["lg-done", "already executed"], ["lg-idle", "not scheduled yet"]],
    options: [
        { value: "fcfs", label: "First-come first-served" },
        { value: "sjf", label: "Shortest job first" },
        { value: "rr", label: "Round robin (q = 2)" },
        { value: "priority", label: "Priority (lower = better)" },
    ],
    build(option) {
        const mode = option || "fcfs";
        const { jobs, slices, total } = simulateSchedule(mode);
        const arr = new Array(total).fill("");
        slices.forEach((s) => {
            for (let i = s.from; i < s.to; i++) arr[i] = s.id;
        });
        const frames = [];
        const jobLine = SCHED_JOBS.map((j) => `${j.id}: arrives ${j.at}, needs ${j.bt}${mode === "priority" ? `, prio ${j.pr}` : ""}`).join("   ·   ");

        frames.push({
            stage: cellsHTML(arr.map(() => "?"), Object.fromEntries(arr.map((_, i) => [i, "is-ghost"]))),
            note: `Four jobs, one CPU, ${total} time units of work. <code>${esc(jobLine)}</code>. The cells below are <em>time</em>, not jobs — index <code>3</code> means "the fourth millisecond".`,
        });

        slices.forEach((slice, n) => {
            const marks = {};
            const tags = {};
            const view = arr.map((v, i) => (i < slice.to ? v : "?"));
            arr.forEach((_, i) => {
                if (i >= slice.to) marks[i] = "is-ghost";
                else if (i >= slice.from) marks[i] = "is-active";
                else marks[i] = "is-done";
            });
            tags[slice.from] = `t=${slice.from}`;
            const rest = slice.left > 0 ? ` It still has <code>${slice.left}</code> units left, so it goes to the back of the queue.` : " It finishes here.";
            frames.push({
                stage: cellsHTML(view, marks, tags),
                note: `Decision ${n + 1}: ${slice.why}. It holds the CPU from <code>${slice.from}</code> to <code>${slice.to}</code>.${slice.id === "--" ? "" : rest}`,
            });
        });

        const wait = jobs.map((j) => j.done - j.at - j.bt);
        const avgWait = (wait.reduce((a, b) => a + b, 0) / jobs.length).toFixed(2);
        const avgTurn = (jobs.reduce((a, j) => a + (j.done - j.at), 0) / jobs.length).toFixed(2);
        const detail = jobs.map((j, i) => `${j.id} waited ${wait[i]}`).join(", ");
        const verdict = {
            fcfs: "Simple and starvation-free, but one long job at the front delays everybody — the <em>convoy effect</em>.",
            sjf: "Provably the best average waiting time of any non-preemptive scheduler, and completely unusable in practice: it needs to know burst lengths in advance, and long jobs can starve forever.",
            rr: "Nobody waits more than <code>(n-1) × q</code> before their first slice, which is what makes a machine feel responsive. The price is more context switches and a worse average turnaround.",
            priority: "Responsive for what you care about, but a steady stream of high-priority work starves the low-priority jobs. Real systems fix this with <em>ageing</em>: raise a job's priority the longer it waits.",
        }[mode];

        frames.push({
            stage: cellsHTML(arr, Object.fromEntries(arr.map((_, i) => [i, "is-done"]))),
            note: `Done. ${detail}. Average waiting time <code>${avgWait}</code>, average turnaround <code>${avgTurn}</code>. ${verdict}`,
        });
        return frames;
    },
};

/* ---- 5. Address translation ---- */

VIZ["page-translation"] = {
    title: "Turning a virtual address into a physical one",
    legend: [["lg-act", "current step"], ["lg-done", "resolved"], ["lg-idle", "not touched"]],
    build() {
        const W = 680;
        const H = 330;
        const PTE = [
            { frame: "0x011", valid: 1 },
            { frame: "0x2f4", valid: 1 },
            { frame: "-----", valid: 0 },
            { frame: "0x009", valid: 1 },
            { frame: "0x0c2", valid: 1 },
            { frame: "-----", valid: 0 },
        ];
        const draw = (st) => {
            let s = capHTML(200, 30, "virtual address  0x00003ABC  (4 KB pages -> 12-bit offset)");
            s += boxHTML(60, 44, 150, 44, "0x00003", st.vpn || "n-idle", "page number");
            s += boxHTML(216, 44, 118, 44, "0xABC", st.off || "n-idle", "offset");

            s += boxHTML(60, 128, 274, 40, st.tlbText || "TLB", st.tlb || "n-idle");

            s += capHTML(510, 30, "page table of this process (cr3 = 0x1a000)");
            PTE.forEach((e, i) => {
                const y = 40 + i * 34;
                const state = st.row === i ? st.rowState || "n-act" : "n-idle";
                const dark = state !== "n-idle" ? " n-label-dark" : "";
                s += `<rect x="400" y="${y}" width="234" height="28" rx="5" class="${state}" stroke-width="1.5"/>`;
                s += `<text x="414" y="${y + 14}" class="n-label${dark}" style="text-anchor:start;font-size:12px">[${i}]  frame ${e.frame}   valid=${e.valid}</text>`;
            });

            s += pathHTML("M334 66 H370 V54 H396", st.toTable || "e-idle");
            s += pathHTML("M400 250 H360 V268 H334", st.toPhys || "e-idle");
            s += capHTML(200, 226, "physical address");
            s += boxHTML(60, 240, 150, 44, st.frameText || "?", st.pframe || "n-idle", "frame number");
            s += boxHTML(216, 240, 118, 44, st.offText || "?", st.poff || "n-idle", "same offset");
            s += capHTML(W / 2, 320, st.caption || "");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ vpn: "n-act", off: "n-act", caption: "the program only ever sees this number" }),
                note: "Your code dereferences a pointer holding <code>0x00003ABC</code>. This address is a <em>fiction</em> — no DRAM chip has a cell with that number. Every process gets its own private numbering.",
            },
            {
                stage: draw({ vpn: "n-act", off: "n-done", caption: "split by hardware, for free" }),
                note: "Because pages are <code>4096 = 2^12</code> bytes, the split is free: the bottom 12 bits are the <strong>offset</strong> within the page, everything above is the <strong>virtual page number</strong>. <code>0x00003ABC >> 12 = 3</code>.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-out", tlbText: "TLB lookup - MISS", caption: "the fast path did not fire" }),
                note: "First the MMU checks the <strong>TLB</strong>, a ~1500-entry cache of recent translations. A hit costs about one cycle. This time it misses, so we have to do it the slow way.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-out", tlbText: "TLB lookup - MISS", toTable: "e-act", row: 3, rowState: "n-act", caption: "index the table with the page number" }),
                note: "The MMU walks the page table whose base sits in <code>cr3</code> and indexes entry <code>[3]</code>. On real x86-64 this is four levels deep, so a miss costs <em>four</em> memory accesses, not one.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-out", tlbText: "TLB lookup - MISS", toTable: "e-done", row: 3, rowState: "n-done", caption: "valid=1, so the page is resident" }),
                note: "Entry 3 says frame <code>0x009</code>, <code>valid=1</code>. If that bit had been <code>0</code> — as it is for entries 2 and 5 — the hardware would raise a <strong>page fault</strong> and hand control to the kernel instead.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-out", tlbText: "TLB lookup - MISS", toTable: "e-done", row: 3, rowState: "n-done", toPhys: "e-act", pframe: "n-act", frameText: "0x009", poff: "n-done", offText: "0xABC", caption: "0x009 << 12 | 0xABC = 0x00009ABC" }),
                note: "The physical address is just the frame number with the <em>untouched</em> offset glued back on. The offset never gets translated — that is precisely why page sizes are powers of two.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-done", tlbText: "TLB: vpn 0x00003 -> frame 0x009", toTable: "e-done", row: 3, rowState: "n-done", toPhys: "e-done", pframe: "n-done", frameText: "0x009", poff: "n-done", offText: "0xABC", caption: "next access to this page costs one cycle" }),
                note: "The translation is cached in the TLB. The next 4095 bytes of this page — and every later visit — skip the walk entirely. Sequential access is fast partly for this reason.",
            },
            {
                stage: draw({ vpn: "n-done", off: "n-done", tlb: "n-done", tlbText: "TLB: vpn 0x00003 -> frame 0x009", row: 2, rowState: "n-out", toTable: "e-done", toPhys: "e-done", pframe: "n-done", frameText: "0x009", poff: "n-done", offText: "0xABC", caption: "what a page fault looks like" }),
                note: "Contrast entry <code>[2]</code>: <code>valid=0</code>. Touching that page traps into the kernel, which decides whether to load it from disk, allocate a zero page, or kill you with <code>SIGSEGV</code>. Same mechanism, three very different outcomes.",
            },
        ];
    },
};

/* ---- 6. Page replacement ---- */

const PR_REFS = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3];

VIZ["page-replacement"] = {
    title: "Which page do we throw out?",
    legend: [["lg-done", "hit"], ["lg-act", "page loaded"], ["lg-cmp", "reference"]],
    options: [
        { value: "fifo", label: "FIFO" },
        { value: "lru", label: "LRU" },
        { value: "optimal", label: "Optimal (Belady)" },
    ],
    build(option) {
        const policy = option || "lru";
        const slots = [null, null, null];
        const loadedAt = [-1, -1, -1];
        const usedAt = [-1, -1, -1];
        const snaps = [];
        const log = [];

        PR_REFS.forEach((page, t) => {
            const found = slots.indexOf(page);
            if (found >= 0) {
                usedAt[found] = t;
                log.push({ page, hit: true, slot: found, victim: null });
            } else {
                let slot = slots.indexOf(null);
                let victim = null;
                if (slot < 0) {
                    if (policy === "fifo") {
                        slot = loadedAt.indexOf(Math.min(...loadedAt));
                    } else if (policy === "lru") {
                        slot = usedAt.indexOf(Math.min(...usedAt));
                    } else {
                        let farthest = -1;
                        slot = 0;
                        slots.forEach((resident, i) => {
                            let next = PR_REFS.indexOf(resident, t + 1);
                            if (next === -1) next = Infinity;
                            if (next > farthest) {
                                farthest = next;
                                slot = i;
                            }
                        });
                    }
                    victim = slots[slot];
                }
                slots[slot] = page;
                loadedAt[slot] = t;
                usedAt[slot] = t;
                log.push({ page, hit: false, slot, victim });
            }
            snaps.push(slots.slice());
        });

        const render = (upto, mark) => {
            const rows = [["ref"].concat(PR_REFS.map(String))];
            for (let i = 0; i < 3; i++) {
                rows.push(
                    [`f${i}`].concat(
                        PR_REFS.map((_, c) => (c <= upto && snaps[c][i] !== null ? String(snaps[c][i]) : ""))
                    )
                );
            }
            const marks = {};
            PR_REFS.forEach((_, c) => (marks[`0,${c + 1}`] = "is-head"));
            marks["0,0"] = "is-head";
            for (let r = 1; r <= 3; r++) marks[`${r},0`] = "is-head";
            if (upto >= 0) marks[`0,${upto + 1}`] = "is-cmp";
            if (mark) marks[`${mark.slot + 1},${upto + 1}`] = mark.hit ? "is-done" : "is-act";
            return gridHTML(rows, marks);
        };

        const label = { fifo: "FIFO", lru: "LRU", optimal: "Optimal" }[policy];
        const frames = [
            {
                stage: render(-1, null),
                note: `Three page frames, twelve page references, policy <strong>${label}</strong>. Every column is one memory access; the three rows below are the physical frames. Empty means "nothing loaded yet".`,
            },
        ];

        let faults = 0;
        log.forEach((entry, t) => {
            if (!entry.hit) faults++;
            let why;
            if (entry.hit) {
                why = `Page <code>${entry.page}</code> is already in frame <code>f${entry.slot}</code> — a <strong>hit</strong>, costing one memory access and nothing else.`;
            } else if (entry.victim === null) {
                why = `Page <code>${entry.page}</code> is not resident, but frame <code>f${entry.slot}</code> is empty — a <strong>compulsory miss</strong>. Every page costs one of these exactly once.`;
            } else if (policy === "fifo") {
                why = `Miss on page <code>${entry.page}</code>, and all frames are full. FIFO evicts <code>${entry.victim}</code> purely because it arrived first — it does not care that it may be about to be used again.`;
            } else if (policy === "lru") {
                why = `Miss on page <code>${entry.page}</code>. LRU evicts <code>${entry.victim}</code>, the page untouched for the longest time, betting that the recent past predicts the near future.`;
            } else {
                why = `Miss on page <code>${entry.page}</code>. Optimal evicts <code>${entry.victim}</code> because it looks <em>forward</em> and sees that page is needed furthest away — or never again.`;
            }
            frames.push({
                stage: render(t, entry),
                note: `<code>t=${t}</code>, reference <code>${entry.page}</code>. ${why} Faults so far: <code>${faults}</code>.`,
            });
        });

        const verdict = {
            fifo: "FIFO is trivial to implement and genuinely bad: it can even fault <em>more</em> when you add frames, which is Belady's anomaly. Nothing in production uses plain FIFO.",
            lru: "LRU is what real systems approximate. Exact LRU needs a timestamp on every access, so Linux instead keeps two lists and a per-page reference bit — a cheap 'second chance' that behaves almost as well.",
            optimal: "Optimal needs to see the future, so it cannot be implemented. It exists as the lower bound you measure real policies against — LRU within 10-15% of this number is a good result.",
        }[policy];

        frames.push({
            stage: render(PR_REFS.length - 1, null),
            note: `Final tally: <code>${faults}</code> page faults out of <code>${PR_REFS.length}</code> references. ${verdict}`,
        });
        return frames;
    },
};

/* ---- 7. External fragmentation ---- */

VIZ["fragmentation"] = {
    title: "Why contiguous allocation fails",
    legend: [["lg-done", "allocated"], ["lg-act", "just changed"], ["lg-out", "request refused"], ["lg-idle", "free"]],
    build() {
        const N = 16;
        const mem = new Array(N).fill(".");
        const frames = [];
        const snap = (note, act = [], bad = false) => {
            const marks = {};
            const tags = {};
            for (let i = 0; i < N; i++) {
                if (mem[i] === ".") marks[i] = "is-ghost";
                else marks[i] = act.includes(i) ? (bad ? "is-out" : "is-active") : "is-done";
                if (act.includes(i) && mem[i] === ".") marks[i] = bad ? "is-out" : "is-window";
            }
            frames.push({ stage: cellsHTML(clone(mem), marks, tags), note });
        };
        const place = (name, from, len) => {
            const at = [];
            for (let i = from; i < from + len; i++) {
                mem[i] = name;
                at.push(i);
            }
            return at;
        };
        const release = (name) => {
            const at = [];
            mem.forEach((v, i) => {
                if (v === name) {
                    mem[i] = ".";
                    at.push(i);
                }
            });
            return at;
        };

        snap("16 blocks of free physical memory and a rule we are about to regret: <strong>every allocation must be contiguous</strong>.");
        snap("Process <code>A</code> asks for 3 blocks and gets 0-2.", place("A", 0, 3));
        snap("<code>B</code> asks for 4 and gets 3-6. Allocation is trivial while memory is still one big run.", place("B", 3, 4));
        snap("<code>C</code> takes 7-9.", place("C", 7, 3));
        snap("<code>D</code> takes 10-13.", place("D", 10, 4));
        snap("<code>E</code> takes the last 2. Memory is now completely full and perfectly packed.", place("E", 14, 2));
        snap("<code>B</code> exits and its 4 blocks return to the free pool.", release("B"));
        snap("<code>D</code> exits too. There are now <code>8</code> free blocks — half of memory.", release("D"));
        snap("<code>F</code> requests <code>6</code> blocks. There is plenty of free memory, but the largest contiguous run is only <code>4</code>, so the allocation <strong>fails</strong>. This is <strong>external fragmentation</strong>: the memory exists, in the wrong shape.", [3, 4, 5, 6, 10, 11, 12, 13], true);
        release("C");
        release("E");
        place("C", 0, 3);
        place("E", 3, 2);
        snap("One fix is <strong>compaction</strong>: stop everybody, slide the live blocks down, rebuild one big hole. It works and it is brutally expensive — you copy live memory and freeze every process while you do it.", [0, 1, 2, 3, 4]);
        snap("Now <code>F</code> fits at 5-10.", place("F", 5, 6));
        snap("The real fix is not to compact but to <strong>drop the contiguity requirement altogether</strong>. Split memory into fixed-size pages, let a process's pages sit anywhere, and let the page table hide the scattering. External fragmentation disappears by construction — which is the single best argument for paging.");
        return frames;
    },
};

/* ---- 8. Copy-on-write fork ---- */

VIZ["copy-on-write"] = {
    title: "fork() without copying memory",
    legend: [["lg-act", "changing now"], ["lg-done", "settled"], ["lg-out", "faulting"]],
    build() {
        const W = 680;
        const H = 300;
        const draw = (st) => {
            let s = capHTML(96, 26, "parent page table");
            let out = "";
            for (let i = 0; i < 3; i++) {
                const y = 44 + i * 56;
                const state = (st.parent || {})[i] || "n-idle";
                const dark = state !== "n-idle" ? " n-label-dark" : "";
                out += `<rect x="24" y="${y}" width="150" height="40" rx="6" class="${state}" stroke-width="1.5"/>`;
                out += `<text x="36" y="${y + 20}" class="n-label${dark}" style="text-anchor:start;font-size:12px">page ${i}  ${(st.pflag || {})[i] || "rw"}</text>`;
            }
            s += out;
            s += capHTML(584, 26, "child page table");
            if (st.childExists) {
                for (let i = 0; i < 3; i++) {
                    const y = 44 + i * 56;
                    const state = (st.child || {})[i] || "n-idle";
                    const dark = state !== "n-idle" ? " n-label-dark" : "";
                    s += `<rect x="506" y="${y}" width="150" height="40" rx="6" class="${state}" stroke-width="1.5"/>`;
                    s += `<text x="518" y="${y + 20}" class="n-label${dark}" style="text-anchor:start;font-size:12px">page ${i}  ${(st.cflag || {})[i] || "rw"}</text>`;
                }
            } else {
                s += capHTML(584, 130, "(no child yet)");
            }
            s += capHTML(340, 26, "physical frames");
            for (let i = 0; i < 4; i++) {
                const y = 44 + i * 56;
                if (i === 3 && !st.newFrame) continue;
                const state = (st.frames || {})[i] || "n-idle";
                s += boxHTML(272, y, 136, 40, i === 3 ? "frame 0x77" : `frame 0x1${i}`, state);
            }
            for (let i = 0; i < 3; i++) {
                const y = 64 + i * 56;
                s += pathHTML(`M174 ${y} H272`, (st.pedge || {})[i] || "e-idle");
                if (st.childExists) {
                    const target = st.copied && i === 1 ? 240 : y;
                    s += pathHTML(`M506 ${y} H460 V${target} H408`, (st.cedge || {})[i] || "e-idle");
                }
            }
            s += capHTML(W / 2, 292, st.caption || "");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ parent: { 0: "n-done", 1: "n-done", 2: "n-done" }, frames: { 0: "n-done", 1: "n-done", 2: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, caption: "one process, three mapped pages" }),
                note: "A parent process with three pages of memory. Each page-table entry points at a physical frame and is writable.",
            },
            {
                stage: draw({ childExists: true, parent: { 0: "n-done", 1: "n-done", 2: "n-done" }, child: { 0: "n-act", 1: "n-act", 2: "n-act" }, frames: { 0: "n-done", 1: "n-done", 2: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 0: "e-act", 1: "e-act", 2: "e-act" }, caption: "fork() copied the table, not the data" }),
                note: "<code>fork()</code> runs. The kernel copies the <em>page table</em> — a few kilobytes — and points every child entry at the parent's existing frames. No user data has been copied at all.",
            },
            {
                stage: draw({ childExists: true, parent: { 0: "n-cmp", 1: "n-cmp", 2: "n-cmp" }, child: { 0: "n-cmp", 1: "n-cmp", 2: "n-cmp" }, pflag: { 0: "ro", 1: "ro", 2: "ro" }, cflag: { 0: "ro", 1: "ro", 2: "ro" }, frames: { 0: "n-done", 1: "n-done", 2: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, caption: "every shared page is marked read-only" }),
                note: "The trick: both tables mark every shared page <strong>read-only</strong>, even the ones that were writable. Reads work normally; a write will now trap.",
            },
            {
                stage: draw({ childExists: true, parent: { 0: "n-cmp", 1: "n-cmp", 2: "n-cmp" }, child: { 0: "n-done", 1: "n-cmp", 2: "n-cmp" }, pflag: { 0: "ro", 1: "ro", 2: "ro" }, cflag: { 0: "ro", 1: "ro", 2: "ro" }, frames: { 0: "n-act", 1: "n-done", 2: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 0: "e-act", 1: "e-done", 2: "e-done" }, caption: "child reads page 0 - nothing happens" }),
                note: "The child reads page 0. It is shared and read-only, which is exactly what a read wants. No fault, no copy, no cost.",
            },
            {
                stage: draw({ childExists: true, parent: { 0: "n-cmp", 1: "n-cmp", 2: "n-cmp" }, child: { 0: "n-done", 1: "n-out", 2: "n-cmp" }, pflag: { 0: "ro", 1: "ro", 2: "ro" }, cflag: { 0: "ro", 1: "ro", 2: "ro" }, frames: { 1: "n-out" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 1: "e-act" }, caption: "child writes page 1 -> protection fault" }),
                note: "Now the child <em>writes</em> page 1. The read-only bit turns that into a protection fault and the CPU traps into the kernel — which is the whole point of setting the bit.",
            },
            {
                stage: draw({ childExists: true, newFrame: true, copied: true, parent: { 0: "n-cmp", 1: "n-cmp", 2: "n-cmp" }, child: { 0: "n-done", 1: "n-act", 2: "n-cmp" }, pflag: { 0: "ro", 1: "rw", 2: "ro" }, cflag: { 0: "ro", 1: "rw", 2: "ro" }, frames: { 1: "n-done", 3: "n-act" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 1: "e-act" }, caption: "one 4 KB copy, only for the page actually written" }),
                note: "The kernel sees the page is copy-on-write, allocates a fresh frame, copies <strong>4 KB</strong>, repoints the child's entry, restores write permission and re-runs the faulting instruction.",
            },
            {
                stage: draw({ childExists: true, newFrame: true, copied: true, parent: { 0: "n-cmp", 1: "n-done", 2: "n-cmp" }, child: { 0: "n-done", 1: "n-done", 2: "n-cmp" }, pflag: { 0: "ro", 1: "rw", 2: "ro" }, cflag: { 0: "ro", 1: "rw", 2: "ro" }, frames: { 1: "n-done", 3: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 1: "e-done" }, caption: "pages 0 and 2 are still shared" }),
                note: "Pages 0 and 2 were never written, so they are still one physical copy serving two processes. Only the page that was actually modified got duplicated.",
            },
            {
                stage: draw({ childExists: true, newFrame: true, copied: true, parent: { 0: "n-done", 1: "n-done", 2: "n-done" }, child: { 0: "n-done", 1: "n-done", 2: "n-done" }, frames: { 0: "n-done", 1: "n-done", 2: "n-done", 3: "n-done" }, pedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, cedge: { 0: "e-done", 1: "e-done", 2: "e-done" }, caption: "forking a 4 GB process costs kilobytes" }),
                note: "This is why <code>fork()</code> on a 4 GB Redis is fast and why the usual <code>fork()</code>-then-<code>exec()</code> pair is not wasteful: <code>exec()</code> throws the address space away before most pages are ever touched.",
            },
        ];
    },
};

/* ---- 9. The memory hierarchy ---- */

VIZ["memory-hierarchy"] = {
    title: "Latency, drawn to scale",
    legend: [["lg-act", "current level"], ["lg-done", "already shown"], ["lg-idle", "not yet"]],
    build() {
        const LEVELS = [
            ["CPU register", 0.3, "0.3 seconds", "the value is already in your hand"],
            ["L1 cache", 1, "1 second", "the note is on your desk"],
            ["L2 cache", 4, "4 seconds", "the folder is in your drawer"],
            ["L3 cache", 20, "20 seconds", "walk to the shelf across the room"],
            ["Main memory (DRAM)", 100, "1.5 minutes", "walk to the filing room down the corridor"],
            ["NVMe SSD", 100000, "1 day", "order the file and wait until tomorrow"],
            ["Spinning disk seek", 10000000, "4 months", "request it from the national archive"],
            ["Cross-region network", 150000000, "5 years", "post a letter and wait for a reply by sea"],
        ];
        const W = 680;
        const H = 40 + LEVELS.length * 34;
        const draw = (upto) => {
            let s = "";
            LEVELS.forEach(([name, ns], i) => {
                const y = 24 + i * 34;
                const w = Math.round(24 + 38 * Math.log10(ns / 0.3));
                const state = i > upto ? "n-idle" : i === upto ? "n-act" : "n-done";
                s += `<text x="196" y="${y + 14}" class="n-sub" style="text-anchor:end">${esc(name)}</text>`;
                s += `<rect x="206" y="${y}" width="${w}" height="22" rx="4" class="${state}" stroke-width="1"/>`;
                if (i <= upto) {
                    s += `<text x="${216 + w}" y="${y + 15}" class="n-sub" style="text-anchor:start">${ns < 1000 ? ns + " ns" : ns / 1000000 >= 1 ? ns / 1000000 + " ms" : ns / 1000 + " µs"}</text>`;
                }
            });
            s += capHTML(W / 2, H - 6, "bar length is logarithmic - a linear chart would be unreadable");
            return svgHTML(W, H, s);
        };

        const frames = LEVELS.map(([name, ns, human, story], i) => ({
            stage: draw(i),
            note: `<strong>${name}</strong> — about <code>${ns < 1000 ? ns + " ns" : ns / 1000000 + " ms"}</code>. If an L1 hit took one second, this would take <strong>${human}</strong>: ${story}.`,
        }));
        frames.push({
            stage: draw(LEVELS.length - 1),
            note: "Nothing in this list is a small difference. Every OS mechanism you will meet — page cache, TLB, readahead, buffered writes, scheduling for cache locality — exists to keep work on the short bars and off the long ones.",
        });
        return frames;
    },
};

/* ---- 10. Threads: what is shared, what is private ---- */

VIZ["threads"] = {
    title: "One address space, three threads",
    legend: [["lg-done", "shared by every thread"], ["lg-act", "private to one thread"], ["lg-out", "the danger zone"]],
    build() {
        const W = 680;
        const H = 300;
        const draw = (st) => {
            let s = bandHTML(20, 16, 640, 268, "one process - one address space - one page table");
            s += boxHTML(48, 56, 250, 44, "code (text)", st.code || "n-idle", "the instructions - read-only, shared");
            s += boxHTML(48, 128, 250, 44, "globals / static data", st.data || "n-idle", "shared, and therefore dangerous");
            s += boxHTML(48, 200, 250, 44, "heap (malloc)", st.heap || "n-idle", "shared - one free list for all threads");
            s += boxHTML(360, 56, 128, 44, "thread 1 stack", (st.stacks || {})[0] || "n-idle");
            s += boxHTML(360, 128, 128, 44, "thread 2 stack", (st.stacks || {})[1] || "n-idle");
            s += boxHTML(360, 200, 128, 44, "thread 3 stack", (st.stacks || {})[2] || "n-idle");
            s += boxHTML(510, 56, 128, 44, "registers + pc", (st.regs || {})[0] || "n-idle");
            s += boxHTML(510, 128, 128, 44, "registers + pc", (st.regs || {})[1] || "n-idle");
            s += boxHTML(510, 200, 128, 44, "registers + pc", (st.regs || {})[2] || "n-idle");
            return svgHTML(W, H, s);
        };
        const all = { 0: "n-act", 1: "n-act", 2: "n-act" };

        return [
            {
                stage: draw({}),
                note: "A process is two things bundled together: a <strong>resource container</strong> (address space, file descriptors, permissions) and a <strong>schedulable thread of execution</strong>. Threads split those apart.",
            },
            {
                stage: draw({ code: "n-done" }),
                note: "The <strong>code</strong> is shared. All three threads execute the same binary, and often the same function at the same time.",
            },
            {
                stage: draw({ code: "n-done", data: "n-done", heap: "n-done" }),
                note: "Globals and the heap are shared too. A pointer that thread 1 obtains from <code>malloc</code> is a perfectly valid pointer inside thread 2 — which is exactly why threads are fast to communicate and easy to break.",
            },
            {
                stage: draw({ code: "n-done", data: "n-done", heap: "n-done", stacks: all }),
                note: "Each thread gets its <strong>own stack</strong>, because each is in the middle of its own chain of function calls. Local variables are therefore private by default — no synchronisation needed.",
            },
            {
                stage: draw({ code: "n-done", data: "n-done", heap: "n-done", stacks: all, regs: all }),
                note: "And its own <strong>registers and program counter</strong>, saved and restored on every switch. Stack + registers is essentially the whole per-thread cost: a few kilobytes against a few megabytes for a process.",
            },
            {
                stage: draw({ code: "n-done", data: "n-out", heap: "n-out", stacks: all, regs: all }),
                note: "The shared half is the entire subject of concurrency. Two threads writing one global need a lock; two threads writing their own locals never do. When you hunt a data race, this diagram is the map: <em>which side of it does this variable live on?</em>",
            },
            {
                stage: draw({ code: "n-done", data: "n-done", heap: "n-done", stacks: all, regs: all }),
                note: "One more consequence: there is no memory protection <em>between</em> threads. A wild pointer in thread 3 corrupts thread 1's stack and takes the whole process down. Processes give you isolation; threads trade it away for speed.",
            },
        ];
    },
};

/* ---- 11. The race condition, with and without a lock ---- */

VIZ["race-condition"] = {
    title: "counter++ from two threads",
    legend: [["lg-act", "this step"], ["lg-cmp", "shared memory"], ["lg-done", "completed"]],
    options: [
        { value: "racy", label: "No lock" },
        { value: "mutex", label: "With a mutex" },
    ],
    build(option) {
        const mode = option || "racy";
        const script =
            mode === "racy"
                ? {
                    a: ["ld", "+1", "", "", "st", ""],
                    b: ["", "", "ld", "+1", "", "st"],
                    mem: ["0", "0", "0", "0", "1", "1"],
                    notes: [
                        "Thread <b>A</b> loads <code>counter</code> into a register. It reads <code>0</code>. <code>counter++</code> was never one instruction — it is load, add, store.",
                        "A adds 1 <em>in its own register</em>. Memory still holds <code>0</code>; nothing is visible to anyone else yet.",
                        "The scheduler preempts A right here and runs <b>B</b>. B loads <code>counter</code> — and reads the stale <code>0</code>, because A never got to store.",
                        "B adds 1 in its register. Two threads now both believe the answer is <code>1</code>.",
                        "A is rescheduled and stores <code>1</code>. Correct, as far as A knows.",
                        "B stores <code>1</code> on top of it. Two increments happened; the counter went up by one. This is a <strong>lost update</strong>.",
                    ],
                    verdict:
                        "Final value <code>1</code>, expected <code>2</code>. Nothing here was a bug in either thread — each ran a perfectly correct sequence. The bug is the <em>interleaving</em>, which is why races are intermittent and why they hide from you in testing.",
                }
                : {
                    a: ["lock", "ld+1", "st", "unlk", "", ""],
                    b: ["", "wait", "wait", "wait", "lock", "ld+1"],
                    mem: ["0", "0", "1", "1", "1", "2"],
                    notes: [
                        "A acquires the mutex first. The lock is now held; the critical section belongs to A alone.",
                        "B reaches the same <code>lock()</code> call and finds it taken. It does not spin and burn CPU — the kernel moves it to the <em>waiting</em> state.",
                        "A loads, adds and stores under the lock. Nobody can observe the half-finished state.",
                        "B is still asleep. It costs nothing while it waits; the scheduler does not even consider it runnable.",
                        "A unlocks. The kernel wakes B, which acquires the lock and enters the critical section.",
                        "B loads <code>1</code> — the value it should have seen all along — adds 1 and stores <code>2</code>.",
                    ],
                    verdict:
                        "Final value <code>2</code>. The mutex did not make the code faster or smarter; it removed the interleavings that produce wrong answers, by making load-add-store <strong>atomic with respect to other threads</strong>.",
                };

        const render = (upto) => {
            const head = ["", "t1", "t2", "t3", "t4", "t5", "t6"];
            const rowA = ["A"].concat(script.a.map((v, i) => (i <= upto ? v : "")));
            const rowB = ["B"].concat(script.b.map((v, i) => (i <= upto ? v : "")));
            const rowM = ["mem"].concat(script.mem.map((v, i) => (i <= upto ? v : "")));
            const marks = {};
            for (let c = 0; c < head.length; c++) marks[`0,${c}`] = "is-head";
            for (let r = 1; r <= 3; r++) marks[`${r},0`] = "is-head";
            for (let c = 1; c <= upto + 1; c++) marks[`3,${c}`] = "is-cmp";
            if (upto >= 0) {
                if (script.a[upto]) marks[`1,${upto + 1}`] = "is-act";
                if (script.b[upto]) marks[`2,${upto + 1}`] = mode === "mutex" && script.b[upto] === "wait" ? "is-empty" : "is-act";
            }
            return gridHTML([head, rowA, rowB, rowM], marks);
        };

        const frames = [
            {
                stage: render(-1),
                note: `Two threads, one shared <code>counter</code> starting at <code>0</code>, and each thread runs <code>counter++</code> exactly once. The correct answer is <code>2</code>. Columns are time; the bottom row is what memory actually holds.`,
            },
        ];
        script.notes.forEach((note, i) => frames.push({ stage: render(i), note: `<code>t${i + 1}</code> — ${note}` }));
        frames.push({ stage: render(5), note: script.verdict });
        return frames;
    },
};

/* ---- 12. Bounded buffer ---- */

VIZ["producer-consumer"] = {
    title: "Producer and consumer over a bounded buffer",
    legend: [["lg-done", "item waiting"], ["lg-act", "just written"], ["lg-out", "blocked"], ["lg-idle", "empty slot"]],
    build() {
        const N = 5;
        const buf = new Array(N).fill("");
        let head = 0;
        let tail = 0;
        let count = 0;
        const frames = [];
        const snap = (note, act = -1, bad = false) => {
            const marks = {};
            const tags = { [tail % N]: "in", [head % N]: "out" };
            if (tail % N === head % N) tags[head % N] = count === 0 ? "in/out" : "in/out";
            for (let i = 0; i < N; i++) {
                if (i === act) marks[i] = bad ? "is-out" : "is-active";
                else marks[i] = buf[i] === "" ? "is-ghost" : "is-done";
            }
            frames.push({ stage: cellsHTML(buf.map((v) => (v === "" ? "." : v)), marks, tags), note });
        };
        const produce = (item) => {
            const at = tail % N;
            buf[at] = item;
            tail++;
            count++;
            return at;
        };
        const consume = () => {
            const at = head % N;
            const item = buf[at];
            buf[at] = "";
            head++;
            count--;
            return [at, item];
        };

        snap("Five slots shared by a producer thread and a consumer thread. <code>in</code> is where the next item is written, <code>out</code> is where the next item is read.");
        snap("Producer writes <code>a</code>. Before writing it does <code>sem_wait(empty)</code> — 'claim a free slot' — and afterwards <code>sem_post(full)</code> — 'announce an item'.", produce("a"));
        snap("Two more items. The producer is running ahead; the consumer has not been scheduled yet.", produce("b"));
        snap("Still room, so the producer never blocks.", produce("c"));
        {
            const [at, item] = consume();
            snap(`Consumer wakes and takes <code>${item}</code> from slot <code>${at}</code>. It does the mirror image: <code>sem_wait(full)</code>, read, <code>sem_post(empty)</code>.`, at);
        }
        snap("Producer adds <code>d</code>. Note <code>in</code> wraps around the end of the array — the buffer is a ring, so no data ever moves.", produce("d"));
        snap("And <code>e</code>. Four items are queued.", produce("e"));
        snap("<code>f</code> fills the last slot.", produce("f"));
        snap("The producer tries to write <code>g</code>. <code>sem_wait(empty)</code> finds the counter at zero, so the <strong>producer blocks</strong>. This is the whole point: a bounded buffer applies back-pressure instead of consuming all your memory.", tail % N, true);
        {
            const [at, item] = consume();
            snap(`The consumer takes <code>${item}</code> and calls <code>sem_post(empty)</code>, which wakes the sleeping producer.`, at);
        }
        snap("The producer's <code>sem_wait</code> returns and <code>g</code> lands in the freed slot.", produce("g"));
        snap("Two semaphores did all of it: <code>empty</code> counts free slots, <code>full</code> counts items, and a mutex (not drawn) protects the indices when there are several producers. Get the order wrong — mutex before the counting semaphore — and you deadlock.");
        return frames;
    },
};

/* ---- 13. Deadlock ---- */

VIZ["deadlock"] = {
    title: "A resource-allocation graph closing into a cycle",
    legend: [["lg-done", "held"], ["lg-act", "requested"], ["lg-out", "deadlocked"]],
    build() {
        const W = 660;
        const H = 300;
        const draw = (st) => {
            let s = "";
            s += pathHTML("M140 186 V106", (st.eR1P1 || "e-idle"));
            s += pathHTML("M420 186 V106", (st.eR2P2 || "e-idle"));
            s += pathHTML("M172 92 L392 186", (st.eP1R2 || "e-idle"));
            s += pathHTML("M388 92 L168 186", (st.eP2R1 || "e-idle"));
            s += pathHTML("M600 130 V186", (st.eR3P3 || "e-idle"));
            s += capHTML(280, 60, st.tag1 || "", "middle");
            s += nodeHTML(140, 78, "P1", st.p1 || "n-idle", 28);
            s += nodeHTML(420, 78, "P2", st.p2 || "n-idle", 28);
            s += nodeHTML(600, 210, "P3", st.p3 || "n-idle", 28);
            s += boxHTML(96, 186, 88, 44, "R1", st.r1 || "n-idle", "the mutex");
            s += boxHTML(376, 186, 88, 44, "R2", st.r2 || "n-idle", "the file lock");
            s += boxHTML(556, 86, 88, 44, "R3", st.r3 || "n-idle", "free");
            s += capHTML(W / 2, 288, st.caption || "arrow into a process = held    arrow out of a process = wanted");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({}),
                note: "Two processes and three resources. An arrow <em>from</em> a resource <em>to</em> a process means it is held; an arrow from a process to a resource means it is being requested.",
            },
            {
                stage: draw({ p1: "n-done", r1: "n-done", eR1P1: "e-done" }),
                note: "<code>P1</code> acquires <code>R1</code> — say, a mutex guarding an account balance. Completely normal so far.",
            },
            {
                stage: draw({ p1: "n-done", r1: "n-done", eR1P1: "e-done", p2: "n-done", r2: "n-done", eR2P2: "e-done" }),
                note: "<code>P2</code> acquires <code>R2</code>, a lock on a different account. Still fine — different resources, no interaction.",
            },
            {
                stage: draw({ p1: "n-act", r1: "n-done", eR1P1: "e-done", p2: "n-done", r2: "n-done", eR2P2: "e-done", eP1R2: "e-act" }),
                note: "<code>P1</code> now needs <code>R2</code> as well, to move money between the accounts. <code>R2</code> is taken, so <code>P1</code> blocks — <em>while still holding <code>R1</code></em>. That last clause is the dangerous part.",
            },
            {
                stage: draw({ p1: "n-act", r1: "n-done", eR1P1: "e-done", p2: "n-act", r2: "n-done", eR2P2: "e-done", eP1R2: "e-act", eP2R1: "e-act" }),
                note: "Symmetrically, <code>P2</code> asks for <code>R1</code>. It blocks too. Each holds exactly what the other is waiting for.",
            },
            {
                stage: draw({ p1: "n-out", r1: "n-out", eR1P1: "e-act", p2: "n-out", r2: "n-out", eR2P2: "e-act", eP1R2: "e-act", eP2R1: "e-act", caption: "P1 -> R2 -> P2 -> R1 -> P1  :  a cycle" }),
                note: "The graph now contains a <strong>cycle</strong>, and with one instance per resource a cycle <em>is</em> deadlock. Neither process will ever run again, and neither has crashed — they are simply both waiting forever.",
            },
            {
                stage: draw({ p1: "n-out", r1: "n-out", eR1P1: "e-act", p2: "n-out", r2: "n-out", eR2P2: "e-act", eP1R2: "e-act", eP2R1: "e-act", p3: "n-done", r3: "n-done", eR3P3: "e-done", caption: "P3 holds R3 and wants nothing - no cycle, no problem" }),
                note: "<code>P3</code> also holds a resource, but it is asking for nothing, so it never joins the cycle. Deadlock is a property of the <em>waiting graph</em>, not of how much is locked.",
            },
            {
                stage: draw({ p1: "n-done", r1: "n-done", eR1P1: "e-done", p2: "n-cmp", r2: "n-done", eR2P2: "e-idle", eP2R1: "e-act", p3: "n-done", r3: "n-done", eR3P3: "e-done", caption: "fix: everybody takes R1 before R2" }),
                note: "The practical fix is <strong>lock ordering</strong>. Number every resource and always acquire in increasing order. <code>P2</code> must now take <code>R1</code> first, so it waits <em>before</em> holding anything — and a process that holds nothing cannot be part of a cycle.",
            },
        ];
    },
};

/* ---- 14. Interrupt handling ---- */

VIZ["interrupt"] = {
    title: "A keypress interrupting your program",
    legend: [["lg-act", "active"], ["lg-done", "finished"], ["lg-idle", "idle"]],
    build() {
        const W = 660;
        const H = 300;
        const draw = (st) => {
            let s = boxHTML(30, 60, 130, 48, "keyboard", st.dev || "n-idle", "raises IRQ 1");
            s += boxHTML(210, 60, 150, 48, "interrupt ctrl", st.pic || "n-idle", "APIC");
            s += boxHTML(420, 60, 200, 48, "CPU - running your loop", st.cpu || "n-idle");
            s += boxHTML(420, 180, 200, 48, "interrupt handler", st.isr || "n-idle", "runs in kernel mode");
            s += boxHTML(210, 180, 150, 48, "IDT", st.idt || "n-idle", "vector -> handler");
            s += boxHTML(30, 180, 130, 48, "input queue", st.queue || "n-idle", "byte delivered");
            s += edgeHTML(160, 84, 206, 84, st.e1 || "e-idle");
            s += edgeHTML(360, 84, 416, 84, st.e2 || "e-idle");
            s += pathHTML("M520 108 V180", st.e3 || "e-idle");
            s += pathHTML("M416 204 H364", st.e4 || "e-idle");
            s += pathHTML("M210 204 H164", st.e5 || "e-idle");
            s += capHTML(W / 2, 268, st.caption || "");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ cpu: "n-act", caption: "your program is running normally" }),
                note: "Your program is in the middle of a loop. Nothing is polling the keyboard — polling would waste the entire CPU waiting for something that happens a few times a second.",
            },
            {
                stage: draw({ cpu: "n-act", dev: "n-act", e1: "e-act", caption: "the key is pressed" }),
                note: "A key goes down. The controller raises an electrical line: <strong>interrupt request 1</strong>. This is hardware asking for attention, entirely outside the instruction stream.",
            },
            {
                stage: draw({ cpu: "n-act", dev: "n-done", pic: "n-act", e1: "e-done", e2: "e-act", caption: "delivered as vector 33" }),
                note: "The interrupt controller prioritises the request against everything else pending and delivers it to a core as an interrupt <em>vector</em>.",
            },
            {
                stage: draw({ dev: "n-done", pic: "n-done", cpu: "n-cmp", e1: "e-done", e2: "e-done", caption: "current instruction finishes, then the CPU traps" }),
                note: "The CPU finishes the instruction it is on, pushes the program counter and flags, switches to ring 0 and the kernel stack. Your program is frozen mid-loop and does not know it.",
            },
            {
                stage: draw({ dev: "n-done", pic: "n-done", cpu: "n-cmp", idt: "n-act", e3: "e-act", caption: "look up the vector in the interrupt descriptor table" }),
                note: "The vector indexes the <strong>IDT</strong>, a table the kernel filled in at boot. Same idea as the syscall table: the hardware decides <em>when</em>, the kernel decides <em>what runs</em>.",
            },
            {
                stage: draw({ dev: "n-done", pic: "n-done", cpu: "n-cmp", idt: "n-done", isr: "n-act", e3: "e-done", e4: "e-done", caption: "handler runs - keep it short" }),
                note: "The handler runs with interrupts disabled on this core, so it must be brief: read the scan code, drop it in a queue, acknowledge the device. Anything slow is deferred to a softirq or a kernel thread.",
            },
            {
                stage: draw({ dev: "n-done", pic: "n-done", cpu: "n-cmp", idt: "n-done", isr: "n-done", queue: "n-act", e3: "e-done", e4: "e-done", e5: "e-act", caption: "the byte is queued for whoever is reading" }),
                note: "The byte goes into the terminal's input queue. If a process was blocked in <code>read()</code> on that terminal, it is moved from waiting to ready right here.",
            },
            {
                stage: draw({ dev: "n-done", pic: "n-done", cpu: "n-done", idt: "n-done", isr: "n-done", queue: "n-done", e1: "e-done", e2: "e-done", e3: "e-done", e4: "e-done", e5: "e-done", caption: "iret - your loop continues" }),
                note: "<code>iret</code> restores the saved state and your loop resumes at the exact next instruction. Interrupts are what let one CPU serve dozens of devices without ever asking any of them 'are you ready yet?'.",
            },
        ];
    },
};

/* ---- 15. Disk scheduling ---- */

const DISK_REQS = [98, 183, 37, 122, 124, 65, 67, 14];
const DISK_HEAD = 53;

VIZ["disk-scheduling"] = {
    title: "Ordering seeks on a spinning disk",
    legend: [["lg-act", "this seek"], ["lg-done", "already served"], ["lg-idle", "still pending"]],
    options: [
        { value: "fcfs", label: "FCFS" },
        { value: "sstf", label: "Shortest seek time first" },
        { value: "scan", label: "SCAN (elevator)" },
    ],
    build(option) {
        const mode = option || "fcfs";
        let order;
        if (mode === "fcfs") {
            order = DISK_REQS.slice();
        } else if (mode === "sstf") {
            const pend = DISK_REQS.slice();
            let cur = DISK_HEAD;
            order = [];
            while (pend.length) {
                let best = 0;
                pend.forEach((t, i) => {
                    if (Math.abs(t - cur) < Math.abs(pend[best] - cur)) best = i;
                });
                cur = pend.splice(best, 1)[0];
                order.push(cur);
            }
        } else {
            const up = DISK_REQS.filter((t) => t >= DISK_HEAD).sort((a, b) => a - b);
            const down = DISK_REQS.filter((t) => t < DISK_HEAD).sort((a, b) => b - a);
            order = up.concat([199]).concat(down);
        }
        const points = [DISK_HEAD].concat(order);
        const W = 660;
        const rowH = 24;
        const H = 86 + points.length * rowH;
        const px = (t) => 30 + (t / 199) * 600;
        const draw = (upto) => {
            let s = `<line x1="30" y1="36" x2="630" y2="36" class="e-idle"/>`;
            DISK_REQS.forEach((t, i) => {
                const served = order.slice(0, upto).includes(t);
                s += `<circle cx="${px(t)}" cy="36" r="4" class="${served ? "n-done" : "n-idle"}" stroke-width="1.5"/>`;
                s += `<text x="${px(t)}" y="${i % 2 ? 14 : 27}" class="n-sub">${t}</text>`;
            });
            for (let i = 0; i <= upto; i++) {
                const y = 58 + i * rowH;
                const state = i === upto ? "n-act" : "n-done";
                s += `<circle cx="${px(points[i])}" cy="${y}" r="5" class="${state}" stroke-width="1.5"/>`;
                if (i > 0) {
                    s += pathHTML(`M${px(points[i - 1])} ${58 + (i - 1) * rowH} L${px(points[i])} ${y}`, i === upto ? "e-act" : "e-done");
                }
                s += `<text x="${px(points[i]) + 12}" y="${y - 8}" class="n-sub" style="text-anchor:start">${points[i]}</text>`;
            }
            s += capHTML(W / 2, H - 10, "left edge = track 0 (outer)   ·   right edge = track 199 (inner)   ·   each row is one seek");
            return svgHTML(W, H, s);
        };

        const frames = [
            {
                stage: draw(0),
                note: `The head sits at track <code>${DISK_HEAD}</code> with eight requests queued: <code>${DISK_REQS.join(", ")}</code>. On a spinning disk the seek dominates everything — moving the arm costs milliseconds, reading the sector costs microseconds.`,
            },
        ];
        let moved = 0;
        for (let i = 1; i < points.length; i++) {
            const d = Math.abs(points[i] - points[i - 1]);
            moved += d;
            const boundary = points[i] === 199 && mode === "scan";
            frames.push({
                stage: draw(i),
                note: boundary
                    ? `The elevator continues to the end of the disk at track <code>199</code> before reversing — costing <code>${d}</code> tracks with nothing to serve. Total so far <code>${moved}</code>. (LOOK, the variant everyone actually implements, turns around at the last request instead.)`
                    : `Seek from <code>${points[i - 1]}</code> to <code>${points[i]}</code>: <code>${d}</code> tracks. Running total <code>${moved}</code>.`,
            });
        }
        const verdict = {
            fcfs: "FCFS is fair and terrible — the head ping-pongs across the platter because the queue order has nothing to do with geography.",
            sstf: "SSTF cuts the movement dramatically by always taking the nearest request, but it can starve the edges of the disk: a steady stream of nearby requests means a far one waits forever.",
            scan: "SCAN sweeps in one direction like a lift, so nothing starves and movement stays low. This is why the classic Linux elevator, and the deadline scheduler that replaced it, are built on this shape.",
        }[mode];
        frames.push({
            stage: draw(points.length - 1),
            note: `Total head movement: <strong>${moved} tracks</strong>. ${verdict} On an SSD none of this matters — there is no arm — which is why the sensible I/O scheduler for NVMe is usually <code>none</code>.`,
        });
        return frames;
    },
};

/* ---- 16. Inode block lookup ---- */

VIZ["inode"] = {
    title: "Finding byte 1,000,000 of a file",
    legend: [["lg-act", "current hop"], ["lg-done", "followed"], ["lg-idle", "not used"]],
    build() {
        const W = 660;
        const H = 310;
        const draw = (st) => {
            let s = capHTML(96, 26, "inode");
            s += `<rect x="24" y="36" width="156" height="240" rx="8" class="n-idle" stroke-width="1.5"/>`;
            const line = (i, text, state) => {
                const y = 58 + i * 26;
                const on = state && state !== "n-idle";
                return (
                    (on ? `<rect x="30" y="${y - 15}" width="144" height="22" rx="4" class="${state}" stroke-width="1"/>` : "") +
                    `<text x="38" y="${y}" class="n-label${on ? " n-label-dark" : ""}" style="text-anchor:start;font-size:11px">${esc(text)}</text>`
                );
            };
            s += line(0, "mode  0644", st.meta);
            s += line(1, "uid   1000", st.meta);
            s += line(2, "size  4194304", st.meta);
            s += line(3, "direct[0..11]", st.direct);
            s += line(4, "single indirect", st.single);
            s += line(5, "double indirect", st.dbl);
            s += line(6, "triple indirect", st.triple);

            s += boxHTML(250, 60, 150, 44, "indirect block", st.iblock || "n-idle", "1024 block numbers");
            s += boxHTML(250, 170, 150, 44, "data block 244", st.dblock || "n-idle", "4 KB of your file");
            s += boxHTML(470, 60, 160, 44, "page cache", st.cache || "n-idle", "checked first");
            s += boxHTML(470, 170, 160, 44, "byte 1,000,000", st.byte || "n-idle", "offset 2560 in the block");

            s += pathHTML("M180 136 H250 V104", st.eSingle || "e-idle");
            s += pathHTML("M325 104 V170", st.eData || "e-idle");
            s += pathHTML("M400 192 H470", st.eByte || "e-idle");
            s += pathHTML("M400 82 H470", st.eCache || "e-idle");
            s += capHTML(W / 2, 300, st.caption || "4 KB blocks, 4-byte block numbers -> 1024 pointers per indirect block");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ meta: "n-act" }),
                note: "Everything the file system knows about a file lives in its <strong>inode</strong>: permissions, owner, timestamps, size, link count — and the block pointers. Notice what is <em>not</em> there: the file name. Names live in directories.",
            },
            {
                stage: draw({ meta: "n-done", caption: "byte 1,000,000 / 4096 = block index 244" }),
                note: "We want byte <code>1,000,000</code>. With 4 KB blocks that is block index <code>244</code> of the file, at offset <code>2560</code> inside it. All file I/O reduces to this division.",
            },
            {
                stage: draw({ meta: "n-done", direct: "n-out", caption: "direct pointers only cover blocks 0-11" }),
                note: "The twelve <strong>direct</strong> pointers cover blocks 0-11, i.e. the first 48 KB. Block 244 is well past that, so they cannot help. Small files — the vast majority — never leave this row.",
            },
            {
                stage: draw({ meta: "n-done", direct: "n-done", single: "n-act", eSingle: "e-act", caption: "blocks 12-1035 live behind the single indirect" }),
                note: "The <strong>single indirect</strong> pointer covers blocks 12 to 1035. Block 244 is in range, so we read one extra block from disk to find out where our data is.",
            },
            {
                stage: draw({ meta: "n-done", direct: "n-done", single: "n-done", iblock: "n-act", eSingle: "e-done", caption: "index 244 - 12 = 232 of the indirect block" }),
                note: "The indirect block is 1024 block numbers. We want entry <code>244 - 12 = 232</code>, which holds the physical block address of the data we are after.",
            },
            {
                stage: draw({ meta: "n-done", direct: "n-done", single: "n-done", iblock: "n-done", dblock: "n-act", eSingle: "e-done", eData: "e-act", caption: "one more read for the data itself" }),
                note: "Now read the data block. Two disk reads for one byte — and the reason the <strong>page cache</strong> exists: keep the indirect block in RAM and the next hundred reads cost one access, not two.",
            },
            {
                stage: draw({ meta: "n-done", direct: "n-done", single: "n-done", iblock: "n-done", dblock: "n-done", cache: "n-done", byte: "n-done", eSingle: "e-done", eData: "e-done", eByte: "e-done", eCache: "e-done", caption: "small files stay cheap, huge files stay possible" }),
                note: "The design is deliberately asymmetric: direct pointers keep small files fast, while double and triple indirection push the maximum file size into terabytes. Modern file systems replace the pointer tree with <strong>extents</strong> — start block plus length — because contiguous files are the common case.",
            },
        ];
    },
};

/* ---- 17. fork and exec ---- */

VIZ["fork-exec"] = {
    title: "How a shell runs a command",
    legend: [["lg-act", "acting now"], ["lg-done", "done"], ["lg-out", "gone"]],
    build() {
        const W = 660;
        const H = 280;
        const draw = (st) => {
            let s = boxHTML(60, 50, 190, 52, st.parentLabel || "shell  pid 4021", st.parent || "n-idle", st.parentSub || "");
            if (st.childShown) {
                s += boxHTML(400, 50, 200, 52, st.childLabel || "child  pid 4092", st.child || "n-idle", st.childSub || "");
                s += pathHTML("M250 76 H400", st.edge || "e-idle");
            }
            s += boxHTML(60, 170, 190, 52, st.stateLabel || "", st.state || "n-idle");
            if (st.childShown) s += boxHTML(400, 170, 200, 52, st.cstateLabel || "", st.cstate || "n-idle");
            s += capHTML(W / 2, 264, st.caption || "");
            return svgHTML(W, H, s);
        };

        return [
            {
                stage: draw({ parent: "n-act", stateLabel: "running: read a command", state: "n-act", caption: "you typed: ls -l" }),
                note: "The shell has read your command line. It cannot simply become <code>ls</code> — it has to survive to print the next prompt. So it must create a second process.",
            },
            {
                stage: draw({ parent: "n-done", childShown: true, child: "n-act", edge: "e-act", stateLabel: "fork() returns 4092", state: "n-done", cstateLabel: "fork() returns 0", cstate: "n-act", childSub: "an exact copy of the shell", caption: "one call, two returns" }),
                note: "<code>fork()</code> is the strangest call in the API: it returns <em>twice</em>. The child gets <code>0</code>, the parent gets the child's PID. That difference is the only way each half knows who it is.",
            },
            {
                stage: draw({ parent: "n-done", childShown: true, child: "n-cmp", edge: "e-done", stateLabel: "waitpid(4092)  - blocked", state: "n-cmp", cstateLabel: "still running shell code", cstate: "n-cmp", childSub: "same code, same fds, own memory", caption: "the child is a duplicate, not a new program" }),
                note: "Right now the child is a copy of the <em>shell</em>: same instructions, same open file descriptors, a copy-on-write clone of the memory. Nothing about <code>ls</code> has happened yet. Meanwhile the parent blocks in <code>waitpid</code>.",
            },
            {
                stage: draw({ parent: "n-done", childShown: true, child: "n-act", edge: "e-done", childLabel: "child  pid 4092", childSub: "redirects stdout, sets signals", stateLabel: "waitpid(4092)  - blocked", state: "n-cmp", cstateLabel: "adjusting fds before exec", cstate: "n-act", caption: "the gap between fork and exec is where redirection happens" }),
                note: "This gap is the reason the API is split in two. The child is still the shell, so it can rearrange file descriptors — <code>ls &gt; out.txt</code> is just <code>open()</code> plus <code>dup2()</code> here — before becoming anything else.",
            },
            {
                stage: draw({ parent: "n-done", childShown: true, child: "n-act", edge: "e-done", childLabel: "/bin/ls  pid 4092", childSub: "same PID, brand-new address space", stateLabel: "waitpid(4092)  - blocked", state: "n-cmp", cstateLabel: "execvp(\"ls\", ...)", cstate: "n-act", caption: "exec replaces the program, not the process" }),
                note: "<code>execvp()</code> throws the entire address space away and loads <code>/bin/ls</code> in its place. Same PID, same descriptors, completely different program. On success it <strong>never returns</strong> — there is nothing left to return to.",
            },
            {
                stage: draw({ parent: "n-done", childShown: true, child: "n-done", edge: "e-done", childLabel: "/bin/ls  pid 4092", childSub: "printing the listing", stateLabel: "waitpid(4092)  - blocked", state: "n-cmp", cstateLabel: "writing to stdout", cstate: "n-done", caption: "the child does the work" }),
                note: "<code>ls</code> runs, writing to the descriptor it inherited — which is why redirection set up before <code>exec</code> still applies to a program that knows nothing about it.",
            },
            {
                stage: draw({ parent: "n-act", childShown: true, child: "n-out", edge: "e-done", childLabel: "zombie  pid 4092", childSub: "exit status 0 held for the parent", stateLabel: "waitpid returns 0", state: "n-act", cstateLabel: "exit(0)", cstate: "n-out", caption: "the exit status outlives the process" }),
                note: "<code>ls</code> calls <code>exit(0)</code>. Its memory is freed at once, but the PCB lingers as a <strong>zombie</strong> holding the exit status. <code>waitpid</code> collects it and the entry disappears — a parent that forgets to reap leaks process table slots.",
            },
            {
                stage: draw({ parent: "n-done", stateLabel: "print the next prompt", state: "n-done", caption: "fork + exec + wait = every command you have ever run" }),
                note: "The shell prints the next prompt. Pipelines are the same three calls with a <code>pipe()</code> in between; a web server accepting connections is the same shape; containers are this plus namespaces. It is the most reused pattern in the whole system.",
            },
        ];
    },
};

/* ---- 18. Boot sequence ---- */

VIZ["boot-sequence"] = {
    title: "From power-on to a login prompt",
    legend: [["lg-act", "current stage"], ["lg-done", "handed off"], ["lg-idle", "not reached"]],
    build() {
        const STAGES = [
            ["power on", "the CPU starts at a fixed reset address"],
            ["firmware (UEFI)", "self-test, enumerate hardware, find the boot device"],
            ["boot loader", "GRUB reads its config and loads a kernel image"],
            ["kernel init", "decompress, set up paging, start the scheduler"],
            ["mount root", "initramfs loads drivers, then pivots to the real root fs"],
            ["init  pid 1", "systemd starts services in dependency order"],
            ["login", "the machine is now doing your work, not its own"],
        ];
        const W = 660;
        const H = 300;
        const draw = (upto) => {
            let s = "";
            STAGES.forEach(([name, sub], i) => {
                const y = 20 + i * 38;
                const state = i > upto ? "n-idle" : i === upto ? "n-act" : "n-done";
                const dark = state !== "n-idle" ? " n-label-dark" : "";
                s += `<rect x="180" y="${y}" width="200" height="30" rx="6" class="${state}" stroke-width="1.5"/>`;
                s += `<text x="280" y="${y + 15}" class="n-label${dark}" style="font-size:12px">${esc(name)}</text>`;
                if (i <= upto) s += `<text x="394" y="${y + 19}" class="n-sub" style="text-anchor:start">${esc(sub)}</text>`;
                if (i > 0) s += pathHTML(`M280 ${y - 8} V${y}`, i <= upto ? "e-done" : "e-idle");
            });
            return svgHTML(W, H, s);
        };
        const notes = [
            "Power arrives and the CPU begins executing at a hard-wired address, in a primitive mode with no paging, no protection and no idea what a file is.",
            "Firmware runs from flash: it tests the hardware, initialises RAM, and looks for something bootable. On UEFI that means reading a file from a small FAT partition — the firmware understands one file system so the rest of the chain does not have to.",
            "The boot loader is the first thing that reads your configuration. It loads the kernel image and the initramfs into memory and jumps to the kernel's entry point.",
            "The kernel decompresses itself, builds its page tables, discovers CPUs and memory, initialises the scheduler and starts handling interrupts. From here on, every abstraction in this course exists.",
            "The initramfs is a tiny RAM file system holding just enough drivers to reach the real disk — which may need RAID, LVM or encryption. Once the real root is mounted, the kernel pivots to it.",
            "The kernel starts exactly one user process, <strong>PID 1</strong>. Everything else on the machine is descended from it by <code>fork()</code>. If PID 1 dies, the kernel panics.",
            "Services come up in dependency order and a login prompt appears. Note the shape of the whole sequence: each stage's only job is to load something more capable than itself and get out of the way.",
        ];
        return notes.map((note, i) => ({ stage: draw(i), note }));
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
