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

function renderBenchmarkResult(data, result) {
    const res = data.result || {};
    const strategies = res.strategies || [];
    let html = `<div style="display: flex; flex-direction: column; gap: 0.75rem;">`;

    if (res.expected_answer && res.expected_answer !== "N/A") {
        html += `<div style="font-size: 0.85rem; color: var(--text-muted);">
            Expected Answer: <strong style="color: var(--accent);">${escapeHtml(res.expected_answer)}</strong>
        </div>`;
    }

    strategies.forEach((s) => {
        const accBadge =
            s.is_correct === true
                ? `<span style="color: #4caf50; font-weight: bold; margin-left: 0.5rem;">✓ Correct</span>`
                : s.is_correct === false
                    ? `<span style="color: #f44336; font-weight: bold; margin-left: 0.5rem;">✗ Incorrect</span>`
                    : "";

        html += `
        <div style="background: var(--bg-elevated-2); padding: 0.75rem 1rem; border-radius: 4px; border-left: 3px solid var(--accent);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.4rem;">
                <strong>${escapeHtml(s.name)}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">
                    ${s.total_tokens} tokens (${s.token_multiplier}x baseline) · ${s.latency_seconds}s
                </span>
            </div>
            <div style="font-size: 0.85rem; margin-bottom: 0.3rem;">
                Stated Answer: <code>${escapeHtml(s.extracted_answer || "(empty)")}</code> ${accBadge}
            </div>
            <details style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">
                <summary style="cursor: pointer;">View full model output</summary>
                <pre style="margin-top: 0.4rem; white-space: pre-wrap; font-family: monospace; font-size: 0.8rem; background: var(--bg); padding: 0.5rem; border-radius: 3px;">${escapeHtml(s.response)}</pre>
            </details>
        </div>`;
    });

    html += `</div>`;
    result.innerHTML = html;
}

function renderSycophancyResult(data, result) {
    const res = data.result || {};
    const rounds = res.rounds || [];
    const verdictColor = res.first_cave_round !== null ? "#f44336" : "#4caf50";

    let html = `
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="padding: 0.5rem 0.8rem; background: var(--bg-elevated-2); border-radius: 4px; border-left: 3px solid ${verdictColor};">
            <div style="font-weight: 600; color: ${verdictColor};">${escapeHtml(res.summary)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
                Case: ${escapeHtml(res.case_label)} (${escapeHtml(res.case_type)}) · Correct: <strong>${escapeHtml(res.correct_answer)}</strong>
            </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">`;

    rounds.forEach((r) => {
        const badgeColor =
            r.verdict === "resists"
                ? "#4caf50"
                : r.verdict === "capitulates"
                    ? "#f44336"
                    : "#ff9800";
        const badgeIcon =
            r.verdict === "resists"
                ? "✓ resists"
                : r.verdict === "capitulates"
                    ? "✗ capitulates"
                    : "? unclear";

        html += `
        <div style="background: var(--bg-elevated); padding: 0.6rem 0.8rem; border-radius: 4px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent);">${escapeHtml(r.label)}</span>
                <span style="font-size: 0.75rem; font-weight: 600; color: ${badgeColor}; font-family: monospace; text-transform: uppercase;">${badgeIcon}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.2rem;">
                <strong>User:</strong> ${escapeHtml(r.user_prompt)}
            </div>
            <div style="font-size: 0.85rem; color: var(--text);">
                <strong>Model:</strong> ${escapeHtml(r.model_response)}
            </div>
        </div>`;
    });

    html += `</div></div>`;
    result.innerHTML = html;
}

function renderRefundResult(data, result) {
    const res = data.result || {};
    const grievances = res.grievances || [];

    let html = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; background: var(--bg-elevated-2); padding: 0.85rem 1rem; border-radius: 4px;">
            <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Auto-Approved</span>
                <strong style="font-size: 1.4rem; color: #4caf50;">₹${Number(res.total_approved_refund || 0).toFixed(0)}</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Held For Review</span>
                <strong style="font-size: 1.4rem; color: #ff9800;">₹${Number(res.total_held_for_review || 0).toFixed(0)}</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block;">Auto-Approve Cap</span>
                <span style="font-size: 1.1rem; color: var(--text); font-family: monospace;">₹${Number(res.auto_approval_cap || 2000).toFixed(0)}</span>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent);">Grievance Rulings (3 Distinct Model Judges: OpenAI · Gemini · Groq)</div>`;

    grievances.forEach((g) => {
        const verdictStyle =
            g.verdict === "UPHELD"
                ? "background: rgba(76, 175, 80, 0.15); color: #4caf50; border: 1px solid #4caf50;"
                : g.verdict === "REJECTED"
                    ? "background: rgba(244, 67, 54, 0.15); color: #f44336; border: 1px solid #f44336;"
                    : "background: rgba(255, 152, 0, 0.15); color: #ff9800; border: 1px solid #ff9800;";

        const amountStr =
            g.refund_amount > 0
                ? `<span style="color: #4caf50; font-weight: bold;">+₹${g.refund_amount.toFixed(0)}</span>`
                : g.held_amount > 0
                    ? `<span style="color: #ff9800; font-weight: bold;">₹${g.held_amount.toFixed(0)} (held)</span>`
                    : `<span style="color: var(--text-muted);">₹0</span>`;

        let individualHtml = `<div style="margin-top: 0.5rem; padding-top: 0.4rem; border-top: 1px dashed var(--border); display: flex; flex-direction: column; gap: 0.35rem;">`;
        (g.individual_rulings || []).forEach((r) => {
            const rColor =
                r.ruling === "UPHELD"
                    ? "#4caf50"
                    : r.ruling === "REJECTED"
                        ? "#f44336"
                        : "#ff9800";
            individualHtml += `
            <div style="font-size: 0.78rem; display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.3rem;">
                <span style="color: var(--text); font-weight: 500;">
                    ${escapeHtml(r.judge_name)}: <strong style="color: ${rColor};">${escapeHtml(r.ruling)}</strong> <span style="color: var(--text-muted); font-size: 0.72rem;">(conf: ${r.confidence})</span>
                </span>
                <span style="color: var(--text-muted); font-size: 0.75rem; font-style: italic;">${escapeHtml(r.reasoning || r.evidence_cited)}</span>
            </div>`;
        });
        individualHtml += `</div>`;

        html += `
        <div style="background: var(--bg-elevated); padding: 0.75rem 0.9rem; border-radius: 4px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span style="font-size: 0.75rem; font-weight: bold; color: var(--text-muted); font-family: monospace;">${escapeHtml(g.grievance_id)} · ${escapeHtml(g.category)}</span>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.75rem; font-family: monospace; color: var(--text-muted);">${escapeHtml(g.vote_split)} (conf: ${g.confidence})</span>
                    <span style="font-size: 0.75rem; font-weight: bold; padding: 2px 6px; border-radius: 3px; ${verdictStyle}">${escapeHtml(g.verdict)}</span>
                    ${amountStr}
                </div>
            </div>
            <div style="font-size: 0.85rem; color: var(--text);">${escapeHtml(g.text)}</div>
            ${individualHtml}
        </div>`;
    });

    html += `
        </div>

        <div style="background: var(--bg-elevated-2); padding: 0.85rem 1rem; border-radius: 4px; border-left: 3px solid #2196f3;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #2196f3; margin-bottom: 0.3rem;">Outbound Customer Response (Synthesized)</div>
            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--text); font-style: italic;">"${escapeHtml(res.customer_message)}"</div>
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
