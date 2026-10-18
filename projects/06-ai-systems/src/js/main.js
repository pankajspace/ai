// 06-ai-systems front-end logic
const API = document.body.dataset.apiBase || "";

function setLoading(btn, loading) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="spinner"></span> Running…'
        : btn.dataset.label;
}

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
                if (errData && (errData.error || errData.detail)) errMsg = errData.error || errData.detail;
            } catch (_) {
                if (res.status === 429) {
                    errMsg = "Rate limit exceeded (30 requests per hour). Please wait an hour and try again.";
                } else {
                    errMsg = `Server error (${res.status}). Please try again later.`;
                }
            }
            throw new Error(errMsg);
        }
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (render) {
            render(data, result);
        } else {
            result.textContent = data.result || JSON.stringify(data, null, 2);
        }
    } catch (e) {
        result.className = "result visible error";
        result.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    } finally {
        setLoading(btn, false);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Prompting Strategies
    const promptInput = document.getElementById("promptInput");
    const promptExpected = document.getElementById("promptExpected");
    const promptBtn = document.getElementById("promptBtn");
    const promptResult = document.getElementById("promptResult");
    const promptValidation = document.getElementById("promptValidation");

    promptBtn.addEventListener("click", () => {
        const question = promptInput.value.trim();
        if (!question) {
            promptValidation.textContent = "Please enter a question.";
            return;
        }
        callApi({
            btn: promptBtn,
            result: promptResult,
            endpoint: "/api/prompting-strategies",
            body: {
                question,
                expected_answer: promptExpected.value.trim(),
            },
            render: (data, el) => {
                let out = `📊 Benchmark Results (Expected: ${data.expected_answer}):\n\n`;
                data.strategies.forEach((s) => {
                    const status = s.is_correct ? "✅ Correct" : "❌ Incorrect";
                    out += `--- Strategy: ${s.name} [${status}] ---\n`;
                    out += `Latency: ${s.latency_seconds}s | Prompt Tokens: ${s.prompt_tokens} | Completion Tokens: ${s.completion_tokens}\n`;
                    out += `Extracted Answer: "${s.extracted_answer}"\n`;
                    out += `Response Snippet:\n${s.response_text.slice(0, 160)}…\n\n`;
                });
                el.textContent = out.trim();
            },
        });
    });

    // 2. Sycophancy Trap
    const sycoCase = document.getElementById("sycoCase");
    const sycoBtn = document.getElementById("sycoBtn");
    const sycoResult = document.getElementById("sycoResult");

    sycoBtn.addEventListener("click", () => {
        callApi({
            btn: sycoBtn,
            result: sycoResult,
            endpoint: "/api/sycophancy-trap",
            body: {
                case_type: sycoCase.value,
            },
            render: (data, el) => {
                let out = `🪤 Sycophancy Evaluation: ${data.final_verdict}\n\n`;
                data.rounds.forEach((r) => {
                    const caveTag = r.caved ? "⚠️ MODEL CAVED" : "🛡️ STOOD GROUND";
                    out += `[Round ${r.round_index} &middot; ${caveTag}]\n`;
                    out += `User: ${r.user_message}\n`;
                    out += `Model: ${r.model_response.slice(0, 150)}…\n\n`;
                });
                el.textContent = out.trim();
            },
        });
    });

    // 3. Refund Bench
    const refundInput = document.getElementById("refundInput");
    const refundBench = document.getElementById("refundBench");
    const refundCap = document.getElementById("refundCap");
    const refundBtn = document.getElementById("refundBtn");
    const refundResult = document.getElementById("refundResult");
    const refundValidation = document.getElementById("refundValidation");

    refundBtn.addEventListener("click", () => {
        const complaint = refundInput.value.trim();
        if (!complaint) {
            refundValidation.textContent = "Please enter complaint text.";
            return;
        }
        callApi({
            btn: refundBtn,
            result: refundResult,
            endpoint: "/api/refund-bench",
            body: {
                complaint_text: complaint,
                bench: refundBench.value,
                cap: parseFloat(refundCap.value),
            },
            render: (data, el) => {
                const disposition = data.cap_exceeded
                    ? "ESCALATED TO HUMAN REVIEW (Cap Exceeded)"
                    : "AUTO-APPROVED";
                let out = `⚖️ Adjudication Disposition: ${disposition}\n`;
                out += `Judge Bench: ${data.bench_label || data.bench}\n`;
                out += `Approved Refund: ₹${(data.total_approved_refund || 0).toFixed(0)} | Held for Review: ₹${(data.total_held_for_review || 0).toFixed(0)} (Auto-Approve Cap: ₹${(data.auto_approval_cap || 0).toFixed(0)})\n\n`;
                out += `Stage 2 & 3: Extracted Grievances & Bench Verdicts (${(data.grievances || []).length}):\n`;
                (data.grievances || []).forEach((g) => {
                    out += `  ${g.grievance_id}. [${g.category}] ${g.text}\n`;
                    out += `     Verdict: ${g.verdict} (${g.vote_split}) | Approved: ₹${(g.refund_amount || 0).toFixed(0)} | Held: ₹${(g.held_amount || 0).toFixed(0)}\n`;
                });
                out += `\nStage 4 Customer Notification Message:\n${data.customer_message || "Dispute processed."}`;
                el.textContent = out;
            },
        });
    });
});
