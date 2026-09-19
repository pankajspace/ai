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
        callApi({
            btn,
            result,
            endpoint: config.endpoint,
            body: { [config.field]: value },
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

function formatMarkdown(text) {
    if (!text) return "";
    let safe = escapeHtml(text);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
    return safe;
}

function renderBenchmarkResult(data, result) {
    const res = data.result || {};
    const strategies = res.strategies || [];
    let html = "";

    if (res.expected_answer && res.expected_answer !== "N/A") {
        html += `
        <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
            <span>Expected Answer:</span>
            <span class="badge badge-info" style="font-size: 0.85rem;">${escapeHtml(res.expected_answer)}</span>
        </div>`;
    }

    strategies.forEach((s) => {
        const accBadge =
            s.is_correct === true
                ? `<span class="badge badge-success">✓ Correct</span>`
                : s.is_correct === false
                    ? `<span class="badge badge-danger">✗ Incorrect</span>`
                    : "";

        html += `
        <div class="output-card">
            <div class="output-card-header">
                <div class="output-card-title">
                    <span>${escapeHtml(s.name)}</span>
                    ${accBadge}
                </div>
                <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span class="badge badge-neutral badge-mono">${s.total_tokens} tokens (${s.token_multiplier}x)</span>
                    <span class="badge badge-neutral badge-mono">⏱️ ${s.latency_seconds}s</span>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; margin-top: 0.1rem;">
                <span style="color: var(--text-muted); font-size: 0.8rem;">Stated Answer:</span>
                <span class="badge badge-neutral badge-mono" style="font-size: 0.85rem; color: #fff; background: var(--bg); border: 1px solid var(--border);">${escapeHtml(s.extracted_answer || "(none)")}</span>
            </div>
            <details class="reasoning-details">
                <summary>▶ View reasoning trace & raw output</summary>
                <div class="reasoning-content">${formatMarkdown(s.response)}</div>
            </details>
        </div>`;
    });

    result.innerHTML = html;
}

function formatModelResponse(raw) {
    if (!raw) return "";
    let safe = escapeHtml(raw);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    const verdictMatch = safe.match(/(?:<br>|\n|^)\s*(VERDICT:.*?)(?=$|<br>|\n)/i);
    if (verdictMatch) {
        const verdictText = verdictMatch[1].replace(/^VERDICT:\s*/i, "").trim();
        const mainText = safe.replace(verdictMatch[0], "").trim();
        return `<div>${mainText}</div><div class="verdict-callout">⚖️ <strong>Verdict:</strong> ${verdictText}</div>`;
    }
    return `<div>${safe}</div>`;
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
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text);">${escapeHtml(r.label)}</span>
                ${badgeHtml}
            </div>
            <div class="chat-round-body">
                <div class="chat-msg chat-msg-user">
                    <div class="chat-sender">👤 User</div>
                    <div style="color: var(--text);">${escapeHtml(r.user_prompt)}</div>
                </div>
                <div class="chat-msg chat-msg-model">
                    <div class="chat-sender">🤖 Model</div>
                    <div style="color: var(--text);">${formatModelResponse(r.model_response)}</div>
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
        <div class="kpi-card">
            <span class="kpi-label">Auto-Approved</span>
            <span class="kpi-value" style="color: #4caf50;">₹${Number(res.total_approved_refund || 0).toFixed(0)}</span>
            <span class="kpi-subtext">Immediate credit to original method</span>
        </div>
        <div class="kpi-card">
            <span class="kpi-label">Held For Review</span>
            <span class="kpi-value" style="color: #ff9800;">₹${Number(res.total_held_for_review || 0).toFixed(0)}</span>
            <span class="kpi-subtext">Escalated to restaurant / supervisor</span>
        </div>
        <div class="kpi-card">
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

            judgesHtml += `
            <div class="output-subcard">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text);">${escapeHtml(r.judge_name)}</span>
                        ${fallbackBadge}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span class="badge ${rBadgeClass}">${escapeHtml(r.ruling)}</span>
                        <span class="badge badge-neutral badge-mono">conf: ${r.confidence}</span>
                    </div>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; font-style: italic;">
                    ${escapeHtml(r.reasoning || r.evidence_cited)}
                </div>
            </div>`;
        });
        judgesHtml += `</div>`;

        html += `
        <div class="output-card">
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
            <div style="font-size: 0.875rem; color: var(--text); padding: 0.5rem 0.7rem; background: var(--bg); border-radius: 4px; border-left: 2px solid var(--border);">
                “${escapeHtml(g.text)}”
            </div>
            ${judgesHtml}
        </div>`;
    });

    html += `
    </div>

    <div class="customer-message-card">
        <div class="customer-message-header">✉️ Outbound Customer Message (Synthesized)</div>
        <div class="customer-message-body">“${escapeHtml(res.customer_message)}”</div>
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
