// AI Systems Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/ai-systems").

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
        ? '<span class="spinner"></span> Processing…'
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
                    errMsg =
                        "Rate limit exceeded (10 requests per hour). Please wait an hour and try again.";
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
 * Wire up a single feature card.
 * @param {object} config
 */
function setupCard(config) {
    const input = document.getElementById(config.inputId);
    const btn = document.getElementById(config.buttonId);
    const result = document.getElementById(config.resultId);
    const validation = config.validationId
        ? document.getElementById(config.validationId)
        : null;
    const modelSelect = config.modelSelectId
        ? document.getElementById(config.modelSelectId)
        : null;

    const currentValue = () => input.value.trim();

    btn.disabled = !currentValue();

    input.addEventListener("input", () => {
        btn.disabled = !currentValue();
        if (validation) validation.textContent = "";
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && currentValue()) {
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
        const body = { [config.field]: value };
        if (modelSelect && modelSelect.value) {
            body.model = modelSelect.value;
        }
        callApi({
            btn,
            result,
            endpoint: config.endpoint,
            body,
            render: config.render,
        });
    });
}

const renderText = (data, result) => {
    result.textContent = typeof data.result === "string" ? data.result : JSON.stringify(data.result, null, 2);
};

// ---------------------------------------------------------------------------
// Custom Renderers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderLatex(latex, isDisplay) {
    let trimmed = latex.trim();
    // If inline math contains \frac, use \displaystyle so numerator/denominator aren't microscopic
    if (!isDisplay && trimmed.includes("\\frac")) {
        trimmed = `\\displaystyle ${trimmed}`;
    }
    if (window.katex) {
        try {
            return window.katex.renderToString(trimmed, {
                displayMode: isDisplay,
                throwOnError: false,
            });
        } catch (_) { }
    }
    // Fallback: clean up common LaTeX commands into crisp readable text
    let clean = trimmed
        .replace(/\\displaystyle/g, "")
        .replace(/\\text\{([^}]+)\}/g, "$1")
        .replace(/\\mathrm\{([^}]+)\}/g, "$1")
        .replace(/\\mathbf\{([^}]+)\}/g, "<strong>$1</strong>")
        .replace(/\\mathit\{([^}]+)\}/g, "<em>$1</em>")
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
        .replace(/\\times/g, " × ")
        .replace(/\\cdot/g, " · ")
        .replace(/\\div/g, " ÷ ")
        .replace(/\\approx/g, " ≈ ")
        .replace(/\\neq?/g, " ≠ ")
        .replace(/\\leq?/g, " ≤ ")
        .replace(/\\geq?/g, " ≥ ")
        .replace(/\\pm/g, " ± ")
        .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
        .replace(/\\,/g, " ")
        .replace(/\\;/g, " ")
        .replace(/\\quad/g, "   ")
        .replace(/\\qquad/g, "      ")
        .replace(/\\left|\\right/g, "");

    return isDisplay
        ? `<div class="math-display">${clean}</div>`
        : `<span class="math-inline">${clean}</span>`;
}

function formatMarkdown(text) {
    if (!text) return "";

    const placeholders = [];
    const savePlaceholder = (html) => {
        const id = `%%PLACEHOLDER_${placeholders.length}%%`;
        placeholders.push(html);
        return id;
    };

    // 1. Code blocks ```...```
    let processed = text.replace(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_, code) => {
        return savePlaceholder(`<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`);
    });

    // 2. Display math \[ ... \] or $$ ... $$
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
        return savePlaceholder(renderLatex(math, true));
    });
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
        return savePlaceholder(renderLatex(math, true));
    });

    // 3. Inline math \( ... \) or $ ... $
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
        return savePlaceholder(renderLatex(math, false));
    });
    processed = processed.replace(/(^|[^\\])\$([^\$\n]+)\$/g, (_, prefix, math) => {
        return prefix + savePlaceholder(renderLatex(math, false));
    });

    // 4. Inline code `...`
    processed = processed.replace(/`([^`]+)`/g, (_, code) => {
        return savePlaceholder(`<code>${escapeHtml(code)}</code>`);
    });

    // 5. Escape remaining HTML
    processed = escapeHtml(processed);

    // 6. Bold & Italic (strict italic so '5 * 5' is not italicized)
    processed = processed.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/(^|[^\s*])\*([^\s*](?:[^*]*?[^\s*])?)\*(?=[^\s*]|$)/g, "$1<em>$2</em>");

    // 7. Parse lines into blocks (paragraphs, lists, steps)
    const rawLines = processed.split(/\r?\n/);
    const blocks = [];
    let currentList = null; // 'ul'
    let currentPara = [];

    const flushPara = () => {
        if (currentPara.length > 0) {
            blocks.push(`<p>${currentPara.join("<br>")}</p>`);
            currentPara = [];
        }
    };

    const flushList = () => {
        if (currentList) {
            blocks.push(`<ul class="reasoning-bullets">${currentList.items.join("")}</ul>`);
            currentList = null;
        }
    };

    for (let line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
            flushPara();
            flushList();
            continue;
        }

        // Check for placeholder-only lines
        if (/^%%PLACEHOLDER_\d+%%$/.test(trimmed)) {
            flushPara();
            flushList();
            blocks.push(trimmed);
            continue;
        }

        // Ordered step: 1. ... or 1) ...
        const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (olMatch) {
            flushPara();
            flushList();
            blocks.push(
                `<div class="reasoning-step"><span class="step-badge">${olMatch[1]}</span><span class="step-text">${olMatch[2]}</span></div>`
            );
            continue;
        }

        // Bullet item: - ... or * ... or • ...
        const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (ulMatch) {
            flushPara();
            if (!currentList) {
                currentList = { items: [] };
            }
            currentList.items.push(`<li>${ulMatch[1]}</li>`);
            continue;
        }

        flushList();
        currentPara.push(trimmed);
    }

    flushPara();
    flushList();

    let finalHtml = blocks.join("");

    // Restore placeholders
    placeholders.forEach((html, i) => {
        finalHtml = finalHtml.replaceAll(`%%PLACEHOLDER_${i}%%`, html);
    });

    return finalHtml;
}

function renderBenchmarkResult(data, result) {
    const res = data.result || {};
    const strategies = res.strategies || [];
    let html = "";

    if ((res.expected_answer && res.expected_answer !== "N/A") || res.model_used) {
        html += `
        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 0.35rem 0.6rem; background: rgba(144, 202, 249, 0.08); border-radius: 4px; border: 1px solid rgba(144, 202, 249, 0.2);">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="color: var(--text-muted);">Expected Answer:</span>
                <span class="badge badge-info" style="font-size: 0.85rem;">${escapeHtml(res.expected_answer || "N/A")}</span>
            </div>
            ${res.model_used ? `<span class="badge badge-neutral badge-mono" style="color: #90caf9;">🤖 ${escapeHtml(res.model_used)}</span>` : ""}
        </div>`;
    }

    strategies.forEach((s) => {
        const accBadge =
            s.is_correct === true
                ? `<span class="badge badge-success">✓ Correct</span>`
                : s.is_correct === false
                    ? `<span class="badge badge-danger">✗ Incorrect</span>`
                    : "";

        const borderAccent =
            s.name === "Direct"
                ? "border-left: 3px solid #78909c;"
                : s.name === "Zero-Shot CoT"
                    ? "border-left: 3px solid #ab47bc;"
                    : "border-left: 3px solid #29b6f6;";

        html += `
        <div class="output-card" style="${borderAccent}">
            <div class="output-card-header">
                <div class="output-card-title">
                    <span style="font-size: 0.95rem; font-weight: 700;">${escapeHtml(s.name)}</span>
                    ${accBadge}
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span class="badge badge-neutral badge-mono">${s.total_tokens} tokens (${s.token_multiplier}x)</span>
                    <span class="badge badge-neutral badge-mono">⏱️ ${s.latency_seconds}s</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 0.5rem 0.8rem; border-radius: 5px; border: 1px solid rgba(255,255,255,0.06); margin: 0.2rem 0;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Stated Answer:</span>
                <span style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: #fff;">${escapeHtml(s.extracted_answer || "(none)")}</span>
            </div>
            <details class="reasoning-details" style="margin-top: 0.4rem;">
                <summary>🔍 View Reasoning Trace (${s.completion_tokens} tokens)</summary>
                <div class="reasoning-content">${formatMarkdown(s.response)}</div>
            </details>
        </div>`;
    });

    result.innerHTML = html;
}

function formatModelResponse(raw, verdictType) {
    if (!raw) return "";

    const verdictMatch = raw.match(/(?:<br>|\n|^)\s*(VERDICT:.*?)(?=$|<br>|\n)/i);
    let mainText = raw;
    let verdictText = null;
    if (verdictMatch) {
        verdictText = verdictMatch[1].replace(/^VERDICT:\s*/i, "").trim();
        mainText = raw.replace(verdictMatch[0], "").trim();
    }

    let html = formatMarkdown(mainText);

    if (verdictText) {
        const vStyle =
            verdictType === "resists"
                ? "border-left: 3px solid #4caf50; background: rgba(76, 175, 80, 0.1); color: #81c784;"
                : verdictType === "capitulates"
                    ? "border-left: 3px solid #f44336; background: rgba(244, 67, 54, 0.1); color: #ef9a9a;"
                    : "border-left: 3px solid #ff9800; background: rgba(255, 152, 0, 0.1); color: #ffb74d;";

        html += `<div class="verdict-callout" style="${vStyle}">⚖️ <strong>Verdict:</strong> ${escapeHtml(verdictText)}</div>`;
    }

    return html;
}

function renderSycophancyResult(data, result) {
    const res = data.result || {};
    const rounds = res.rounds || [];
    const isCapitulated = res.first_cave_round !== null;

    const bannerClass = isCapitulated ? "status-banner status-banner-danger" : "status-banner status-banner-success";
    const bannerIcon = isCapitulated ? "⚠️" : "🛡️";

    let html = `
    <div class="${bannerClass}">
        <div class="status-banner-title">
            <span>${bannerIcon}</span>
            <span>${escapeHtml(res.summary)}</span>
        </div>
        <div class="status-banner-meta">
            ${res.model_used ? `<span class="badge badge-info badge-mono">🤖 ${escapeHtml(res.model_used)}</span>` : ""}
            <span class="badge badge-neutral">Case: ${escapeHtml(res.case_label)}</span>
            <span class="badge badge-neutral">Type: ${escapeHtml(res.case_type)}</span>
            <span class="badge badge-info">Ground Truth: ${escapeHtml(res.correct_answer)}</span>
        </div>
    </div>
    <div class="chat-thread">`;

    rounds.forEach((r) => {
        let badgeHtml = "";
        if (r.verdict === "resists") {
            badgeHtml = `<span class="badge badge-success">✓ Resisted</span>`;
        } else if (r.verdict === "capitulates") {
            badgeHtml = `<span class="badge badge-danger">✗ Capitulated</span>`;
        } else {
            badgeHtml = `<span class="badge badge-warning">? Unclear</span>`;
        }

        html += `
        <div class="chat-round">
            <div class="chat-round-header">
                <span style="font-size: 0.82rem; font-weight: 600; color: var(--text);">${escapeHtml(r.label)}</span>
                ${badgeHtml}
            </div>
            <div class="chat-round-body">
                <div class="chat-msg chat-msg-user">
                    <div class="chat-sender">👤 User</div>
                    <div style="color: var(--text);">${escapeHtml(r.user_prompt)}</div>
                </div>
                <div class="chat-msg chat-msg-model">
                    <div class="chat-sender">🤖 Model</div>
                    <div style="color: var(--text);">${formatModelResponse(r.model_response, r.verdict)}</div>
                </div>
            </div>
        </div>`;
    });

    html += `</div>`;
    result.innerHTML = html;
}

function renderRefundResult(data, result) {
    const res = data.result || {};
    const grievances = res.grievances || [];

    let html = `
    <div class="kpi-row">
        <div class="kpi-card" style="border-left: 3px solid #4caf50;">
            <span class="kpi-label">Auto-Approved</span>
            <span class="kpi-value" style="color: #4caf50;">₹${Number(res.total_approved_refund || 0).toFixed(0)}</span>
            <span class="kpi-subtext">Immediate credit to original method</span>
        </div>
        <div class="kpi-card" style="border-left: 3px solid #ff9800;">
            <span class="kpi-label">Held For Review</span>
            <span class="kpi-value" style="color: #ff9800;">₹${Number(res.total_held_for_review || 0).toFixed(0)}</span>
            <span class="kpi-subtext">Escalated to restaurant / supervisor</span>
        </div>
        <div class="kpi-card" style="border-left: 3px solid #90caf9;">
            <span class="kpi-label">Auto-Approve Cap</span>
            <span class="kpi-value badge-mono" style="color: var(--text);">₹${Number(res.auto_approval_cap || 2000).toFixed(0)}</span>
            <span class="kpi-subtext">Safe policy ceiling per dispute</span>
        </div>
    </div>

    <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent); margin-top: 0.4rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <span>⚖️ Grievance Rulings</span>
        <span class="badge badge-neutral badge-mono">3 Model Judges: OpenAI · Gemini · Groq</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 0.65rem;">`;

    grievances.forEach((g) => {
        const verdictBadgeClass =
            g.verdict === "UPHELD"
                ? "badge-success"
                : g.verdict === "REJECTED"
                    ? "badge-danger"
                    : "badge-warning";

        const borderAccent =
            g.verdict === "UPHELD"
                ? "border-left: 3px solid #4caf50;"
                : g.verdict === "REJECTED"
                    ? "border-left: 3px solid #f44336;"
                    : "border-left: 3px solid #ff9800;";

        const amountBadge =
            g.refund_amount > 0
                ? `<span class="badge badge-success">+₹${g.refund_amount.toFixed(0)}</span>`
                : g.held_amount > 0
                    ? `<span class="badge badge-warning">₹${g.held_amount.toFixed(0)} (held)</span>`
                    : `<span class="badge badge-neutral">₹0</span>`;

        let judgesHtml = `<div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.35rem;">`;
        (g.individual_rulings || []).forEach((r) => {
            const rBadgeClass =
                r.ruling === "UPHELD"
                    ? "badge-success"
                    : r.ruling === "REJECTED"
                        ? "badge-danger"
                        : "badge-warning";

            const fallbackBadge = r.is_fallback
                ? `<span class="badge badge-neutral badge-mono" style="font-size: 0.65rem;" title="Evaluated via fallback client">fallback</span>`
                : "";

            const judgeIcon =
                r.provider === "OpenAI"
                    ? "🟢"
                    : r.provider === "Gemini"
                        ? "🔷"
                        : "⚡";

            judgesHtml += `
            <div class="output-subcard" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); padding: 0.65rem 0.85rem; border-radius: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.82rem; font-weight: 600; color: var(--text);">${judgeIcon} ${escapeHtml(r.judge_name)}</span>
                        ${fallbackBadge}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span class="badge ${rBadgeClass}">${escapeHtml(r.ruling)}</span>
                        <span class="badge badge-neutral badge-mono">conf: ${r.confidence}</span>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #b0bec5; line-height: 1.5;">
                    ${escapeHtml(r.reasoning || r.evidence_cited)}
                </div>
            </div>`;
        });
        judgesHtml += `</div>`;

        html += `
        <div class="output-card" style="${borderAccent}">
            <div class="output-card-header">
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span class="badge badge-neutral badge-mono">${escapeHtml(g.grievance_id)}</span>
                    <span class="badge badge-info">${escapeHtml(g.category)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span class="badge badge-neutral badge-mono">${escapeHtml(g.vote_split)} (conf: ${g.confidence})</span>
                    <span class="badge ${verdictBadgeClass}">${escapeHtml(g.verdict)}</span>
                    ${amountBadge}
                </div>
            </div>
            <div style="font-size: 0.875rem; color: var(--text); padding: 0.6rem 0.85rem; background: rgba(0,0,0,0.3); border-radius: 5px; border: 1px solid rgba(255,255,255,0.06); line-height: 1.5;">
                <span style="color: var(--accent); font-size: 1rem; font-family: serif; margin-right: 4px;">“</span>${escapeHtml(g.text)}<span style="color: var(--accent); font-size: 1rem; font-family: serif; margin-left: 4px;">”</span>
            </div>
            ${judgesHtml}
        </div>`;
    });

    html += `
    </div>

    <div class="customer-message-card" style="background: rgba(33, 150, 243, 0.06); border: 1px solid rgba(33, 150, 243, 0.3); border-left: 4px solid #2196f3; border-radius: 6px; padding: 0.9rem 1.1rem;">
        <div class="customer-message-header" style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #90caf9; margin-bottom: 0.4rem;">
            ✉️ Outbound Customer Message (Synthesized)
        </div>
        <div class="customer-message-body" style="font-size: 0.875rem; line-height: 1.6; color: #e0e0e0;">
            “${escapeHtml(res.customer_message)}”
        </div>
    </div>`;

    result.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Card Registration
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    // Feature 1: Prompting Benchmark
    setupCard({
        inputId: "benchmarkInput",
        buttonId: "benchmarkBtn",
        resultId: "benchmarkResult",
        validationId: "benchmarkValidation",
        modelSelectId: "benchmarkModel",
        requiredMessage: "Please enter a question or preset name.",
        endpoint: "/benchmark",
        field: "message",
        render: renderBenchmarkResult,
    });

    // Feature 2: Sycophancy Trap
    setupCard({
        inputId: "sycophancyInput",
        buttonId: "sycophancyBtn",
        resultId: "sycophancyResult",
        validationId: "sycophancyValidation",
        modelSelectId: "sycophancyModel",
        requiredMessage: "Please enter a test case ID or question.",
        endpoint: "/sycophancy",
        field: "message",
        render: renderSycophancyResult,
    });

    // Feature 3: The Refund Bench
    setupCard({
        inputId: "refundInput",
        buttonId: "refundBtn",
        resultId: "refundResult",
        validationId: "refundValidation",
        requiredMessage: "Please enter a complaint description.",
        endpoint: "/refund",
        field: "message",
        render: renderRefundResult,
    });
});
