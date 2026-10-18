// 05-ai-aws-strands front-end logic
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
            let out = data.response || data.result || JSON.stringify(data, null, 2);
            if (data.tool_calls && data.tool_calls.length) {
                out += `\n\n[Tools Called: ${data.tool_calls.join(", ")}]`;
            }
            if (data.parallel_duration_seconds) {
                out += `\n[Duration: ${data.parallel_duration_seconds}s]`;
            }
            result.textContent = out;
        }
    } catch (e) {
        result.className = "result visible error";
        result.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    } finally {
        setLoading(btn, false);
    }
}

function wireCard(id, endpoint, field) {
    const input = document.getElementById(`${id}Input`);
    const btn = document.getElementById(`${id}Btn`);
    const result = document.getElementById(`${id}Result`);
    const validation = document.getElementById(`${id}Validation`);

    if (input && btn) {
        btn.disabled = !input.value.trim();
        input.addEventListener("input", () => {
            btn.disabled = !input.value.trim();
            if (validation) validation.textContent = "";
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && input.value.trim()) {
                e.preventDefault();
                btn.click();
            }
        });
        btn.addEventListener("click", () => {
            const val = input.value.trim();
            if (!val) {
                if (validation) validation.textContent = "Please enter a value.";
                return;
            }
            callApi({
                btn,
                result,
                endpoint,
                body: { [field]: val, message: val },
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    wireCard("hello", "/api/hello-world-agent", "prompt");
    wireCard("langgraph", "/api/langgraph-agent", "prompt");
    wireCard("fnTool", "/api/function-to-tool", "question");
    wireCard("tip", "/api/tip-calculator", "query");
    wireCard("sales", "/api/multi-tool-sales", "task");
    wireCard("inv", "/api/custom-inventory", "question");
    wireCard("calc", "/api/prebuilt-calculator", "query");
    wireCard("multiPre", "/api/multi-prebuilt-tools", "task");
    wireCard("aws", "/api/use-aws", "prompt");
    wireCard("clsTool", "/api/class-based-tools", "query");
    wireCard("asyncTool", "/api/async-tools", "query");
    wireCard("travel", "/api/travel-assistant", "query");
});
