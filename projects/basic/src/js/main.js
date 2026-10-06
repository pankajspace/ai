// AI Playground — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/basic").

const API = document.body.dataset.apiBase || "";

/**
 * Toggle a button between its idle label and a loading spinner.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 */
function setLoading(btn, loading) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="spinner"></span> Loading…'
        : btn.dataset.label;
}

/**
 * POST a JSON body to an endpoint and render the result into a target element.
 * @param {object} opts
 * @param {HTMLButtonElement} opts.btn
 * @param {HTMLElement} opts.result
 * @param {string} opts.endpoint
 * @param {object} opts.body
 * @param {(data: object, result: HTMLElement) => void} opts.render
 */
async function callApi({ btn, result, endpoint, body, render }) {
    setLoading(btn, true);
    result.className = "result visible";
    result.textContent = "";
    try {
        const res = await fetch(`${API}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            let errMsg = `Request failed (${res.status})`;
            try {
                const errData = await res.json();
                if (errData && errData.error) errMsg = errData.error;
            } catch (_) {
                if (res.status === 429) {
                    errMsg = "Rate limit exceeded (10 requests per hour). Please wait an hour and try again.";
                } else {
                    errMsg = `Server error (${res.status}). Please try again later.`;
                }
            }
            throw new Error(errMsg);
        }
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        render(data, result);
    } catch (e) {
        result.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    } finally {
        setLoading(btn, false);
    }
}

/**
 * Wire up a single "feature card": enable the button when the input has a
 * value, clear validation on input, validate on submit, then call the API.
 * @param {object} config
 */
function setupCard(config) {
    const input = document.getElementById(config.inputId);
    const btn = document.getElementById(config.buttonId);
    const result = document.getElementById(config.resultId);
    const validation = config.validationId
        ? document.getElementById(config.validationId)
        : null;

    const currentValue = () => input.value.trim();

    btn.disabled = !currentValue();

    input.addEventListener("input", () => {
        btn.disabled = !currentValue();
        if (validation) validation.textContent = "";
    });

    input.addEventListener("keydown", (e) => {
        // In a textarea, plain Enter adds a newline; Cmd/Ctrl+Enter submits.
        const submit = input.tagName === "TEXTAREA"
            ? e.key === "Enter" && (e.metaKey || e.ctrlKey)
            : e.key === "Enter";
        if (submit && currentValue()) {
            e.preventDefault();
            btn.click();
        }
    });

    btn.addEventListener("click", () => {
        const value = currentValue();
        if (!value) {
            if (validation) validation.textContent = config.requiredMessage;
            input.focus();
            return;
        }
        callApi({
            btn,
            result,
            endpoint: config.endpoint,
            body: config.buildBody ? config.buildBody(value) : { [config.field]: value },
            render: config.render,
        });
    });
}

/** Create an element with an optional class and (safely escaped) text. */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

/** Put a value into an input and notify setupCard so the button enables. */
function fillInput(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input"));
    input.focus();
}

const renderText = (data, result) => {
    result.textContent = data.result;
};

// ---------------------------------------------------------------------------
// Website Summarizer — sample "websites" + personality (system prompt) picker
// ---------------------------------------------------------------------------

const SUMMARY_SAMPLES = {
    startup: "NimbusPay — Payments that just work. NimbusPay is a payments platform built for small Indian businesses who are tired of clunky tools and hidden fees. Accept UPI, cards, and wallets with a single integration that takes ten minutes to set up. Our flat 1% fee means no surprises at the end of the month. NimbusPay also gives you a real-time dashboard so you can see every transaction as it happens. Over 12,000 shops already use NimbusPay to get paid faster. We just launched instant settlements, so your money reaches your bank account the same day instead of waiting three days. Sign up today and your first month is completely free.",
    news: "Governments race to regulate AI as adoption surges. Lawmakers around the world are scrambling to write rules for artificial intelligence as the technology spreads into hospitals, banks, and classrooms. Supporters say clear regulation will build public trust and prevent harm. Critics worry that heavy rules could slow innovation and hand an advantage to larger companies who can afford compliance. A new draft framework focuses on transparency, requiring companies to disclose when content is AI-generated. It also demands that high-risk systems, such as those used in hiring or medicine, be tested for bias before launch. Industry groups have asked for more time to adapt. The debate is expected to continue for years as the technology keeps evolving.",
    blog: "My journey from teacher to AI engineer. Three years ago I had never written a line of Python. I was a high-school teacher who felt stuck and curious about the AI everyone kept talking about. I started small: one tiny project every weekend, even when they barely worked. The first thing I built was a tool that summarized news articles for my students. It was ugly, but it worked, and that little win changed everything. I kept shipping projects and sharing them online, and slowly people started noticing. Last month I started my first job as an AI engineer at a startup. The lesson I keep repeating to anyone who will listen: you do not need permission or a perfect plan, you just need to build small things often and share them.",
};

let personality = "friendly";

// A single token containing a dot (e.g. "example.com/page") is a URL; anything
// else is treated as pasted article text.
const looksLikeUrl = (value) => /^\S+\.\S+$/.test(value);

function setupSummarizerOptions() {
    const input = document.getElementById("summarizeInput");

    document.querySelectorAll("#sampleChips .chip").forEach((chip) => {
        chip.addEventListener("click", () => fillInput(input, SUMMARY_SAMPLES[chip.dataset.sample]));
    });

    const personalityChips = document.querySelectorAll("#personalityChips .chip");
    personalityChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            personality = chip.dataset.personality;
            personalityChips.forEach((c) => {
                const on = c === chip;
                c.classList.toggle("is-active", on);
                c.setAttribute("aria-checked", String(on));
            });
        });
    });
}

// ---------------------------------------------------------------------------
// LLM Arena — blind A/B: sides are shuffled, names revealed after a vote
// ---------------------------------------------------------------------------

const arenaScores = {};

function renderTally() {
    const tally = document.getElementById("arenaTally");
    tally.textContent = "";
    Object.entries(arenaScores).forEach(([model, score]) => {
        const item = el("div", "arena-tally-item");
        item.append(el("b", "", String(score)), el("span", "", `${model} score`));
        tally.append(item);
    });
    tally.hidden = false;
}

const renderArena = (data, result) => {
    const models = [data.result.model_a, data.result.model_b];
    if (Math.random() < 0.5) models.reverse();
    models.forEach((m) => {
        if (!(m.model in arenaScores)) arenaScores[m.model] = 0;
    });

    const grid = el("div", "arena-grid");
    const verdict = el("div", "arena-verdict");
    verdict.hidden = true;

    const sides = models.map((m, i) => {
        const label = i === 0 ? "A" : "B";
        const col = el("div", "arena-col");
        const who = el("div", "model-name", `🤖 Model ${label}`);
        const votes = el("div", "arena-votes");
        const up = el("button", "chip", "👍 Good");
        const down = el("button", "chip", "👎 Bad");
        up.type = down.type = "button";
        votes.append(up, down);
        col.append(who, el("div", "arena-reply", m.reply), votes);
        grid.append(col);

        const vote = (delta) => {
            up.disabled = down.disabled = true;
            col.classList.add(delta > 0 ? "is-up" : "is-down");
            sides.forEach((s) => {
                s.who.textContent = `🤖 Model ${s.label} `;
                s.who.append(el("span", "reveal-tag", s.model));
            });
            arenaScores[m.model] += delta;
            renderTally();
            verdict.textContent = `${delta > 0 ? "👍" : "👎"} You rated Model ${label} (${m.model}) `
                + `${delta > 0 ? "good" : "bad"}. In a real arena, votes like yours pile up across `
                + "thousands of people to build a public leaderboard.";
            verdict.hidden = false;
        };
        up.addEventListener("click", () => vote(1));
        down.addEventListener("click", () => vote(-1));

        return { label, who, model: m.model };
    });

    result.textContent = "";
    result.append(grid, verdict);
};

document.addEventListener("DOMContentLoaded", () => {
    setupCard({
        inputId: "jokeTopicInput",
        buttonId: "jokeBtn",
        resultId: "jokeResult",
        endpoint: "/joke",
        field: "topic",
        render: renderText,
    });

    setupCard({
        inputId: "cityInput",
        buttonId: "travelBtn",
        resultId: "travelResult",
        validationId: "cityValidation",
        requiredMessage: "Please enter a city name.",
        endpoint: "/travel",
        field: "city",
        render: renderText,
    });

    setupCard({
        inputId: "summarizeInput",
        buttonId: "summarizeBtn",
        resultId: "summarizeResult",
        validationId: "summarizeValidation",
        requiredMessage: "Pick a sample, or paste a URL or some article text.",
        endpoint: "/summarize",
        buildBody: (value) => (looksLikeUrl(value)
            ? { url: value, personality }
            : { text: value, personality }),
        render: renderText,
    });
    setupSummarizerOptions();

    setupCard({
        inputId: "promptInput",
        buttonId: "arenaBtn",
        resultId: "arenaResult",
        validationId: "promptValidation",
        requiredMessage: "Please enter a prompt.",
        endpoint: "/arena",
        field: "prompt",
        render: renderArena,
    });

    const promptInput = document.getElementById("promptInput");
    document.querySelectorAll("#arenaExamples .chip").forEach((chip) => {
        chip.addEventListener("click", () => fillInput(promptInput, chip.dataset.prompt));
    });
});
