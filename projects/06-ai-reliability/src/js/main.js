// 06-ai-reliability front-end logic
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
    // 1. CoT vs Direct
    const cotProblem = document.getElementById("cotProblem");
    const cotBtn = document.getElementById("cotBtn");
    const cotResult = document.getElementById("cotResult");

    cotBtn.addEventListener("click", () => {
        callApi({
            btn: cotBtn,
            result: cotResult,
            endpoint: "/api/cot-vs-direct",
            body: { problem_title: cotProblem.value },
            render: (data, el) => {
                let out = `🧠 Benchmark on: ${data.problem_title}\n\n`;
                const d = data.direct_result;
                out += `--- Direct Strategy [${d.is_correct ? "✅ CORRECT" : "❌ FAILED"}] ---\n`;
                out += `Answer: "${d.extracted_answer}" (${d.latency_seconds}s)\n`;
                out += `Raw: ${d.response.trim()}\n\n`;

                const c = data.cot_result;
                out += `--- Chain-of-Thought Strategy [${c.is_correct ? "✅ CORRECT" : "❌ FAILED"}] ---\n`;
                out += `Answer: "${c.extracted_answer}" (${c.latency_seconds}s)\n`;
                out += `Reasoning:\n${c.response.trim()}`;
                el.textContent = out;
            },
        });
    });

    // 2. Variance & Determinism
    const varianceInput = document.getElementById("varianceInput");
    const varianceBtn = document.getElementById("varianceBtn");
    const varianceResult = document.getElementById("varianceResult");
    const varianceValidation = document.getElementById("varianceValidation");

    varianceBtn.addEventListener("click", () => {
        const review = varianceInput.value.trim();
        if (!review) {
            varianceValidation.textContent = "Please enter review text.";
            return;
        }
        callApi({
            btn: varianceBtn,
            result: varianceResult,
            endpoint: "/api/variance-determinism",
            body: { review_text: review },
            render: (data, el) => {
                let out = `🎲 Extraction Determinism Across 3 Strategies:\n\n`;
                (data.strategies || []).forEach((s) => {
                    const status = s.is_valid_json ? "✅ VALID JSON" : `❌ PARSE ERROR: ${s.parse_error}`;
                    out += `--- ${s.strategy_name} [${status}] ---\n`;
                    out += `Raw:\n${s.raw_output.trim()}\n\n`;
                });
                el.textContent = out.trim();
            },
        });
    });

    // 3. Tool Calibration
    const calibInput = document.getElementById("calibInput");
    const calibBtn = document.getElementById("calibBtn");
    const calibResult = document.getElementById("calibResult");
    const calibValidation = document.getElementById("calibValidation");

    document.querySelectorAll("#card-calib .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-calib .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            calibInput.value = chip.dataset.q;
            calibBtn.disabled = !calibInput.value.trim();
        });
    });

    calibBtn.addEventListener("click", () => {
        const query = calibInput.value.trim();
        if (!query) {
            calibValidation.textContent = "Please enter a query.";
            return;
        }
        callApi({
            btn: calibBtn,
            result: calibResult,
            endpoint: "/api/tool-schema-calibration",
            body: { query },
            render: (data, el) => {
                let out = `🎯 Tool Schema Routing Matrix (Target: "${data.target_intent}"):\n\n`;
                (data.condition_results || []).forEach((cr) => {
                    const pass = cr.is_correct_routing ? "✅ Routed Correctly" : "❌ Misrouted";
                    out += `Condition ${cr.condition_code} (${cr.condition_label}):\n`;
                    out += `  Selected Tool: ${cr.selected_tool || "none"} [${pass}]\n\n`;
                });
                out += `Summary:\n${data.analysis_summary}`;
                el.textContent = out;
            },
        });
    });

    // 4. Error Injection
    const errInput = document.getElementById("errorInjInput");
    const errBtn = document.getElementById("errorInjBtn");
    const errResult = document.getElementById("errorInjResult");
    const errValidation = document.getElementById("errorInjValidation");

    errBtn.addEventListener("click", () => {
        const question = errInput.value.trim();
        if (!question) {
            errValidation.textContent = "Please enter a question.";
            return;
        }
        callApi({
            btn: errBtn,
            result: errResult,
            endpoint: "/api/tool-error-injection",
            body: { question },
            render: (data, el) => {
                let out = `🛡️ Upstream 503 Injection Evaluation:\n\n`;
                (data.scenarios || []).forEach((sc) => {
                    out += `--- Scenario: ${sc.scenario_name} ---\n`;
                    out += `- Acknowledged Error: ${sc.acknowledged_error ? "✅ Yes" : "❌ No"}\n`;
                    out += `- Mentioned HTTP 503 Detail: ${sc.gave_error_detail ? "✅ Yes" : "❌ No"}\n`;
                    out += `- Fabricated Fake Weather: ${sc.fabricated_data ? "⚠️ YES (Hallucinated)" : "✅ No (Honest)"}\n`;
                    out += `Response:\n${sc.response_text.trim()}\n\n`;
                });
                el.textContent = out.trim();
            },
        });
    });
});
