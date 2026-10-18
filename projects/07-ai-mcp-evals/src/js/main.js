// 07-ai-mcp-evals front-end logic
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
    // 1. MCP Client
    const mcpToolSelect = document.getElementById("mcpToolSelect");
    const mcpArgInput = document.getElementById("mcpArgInput");
    const mcpClientBtn = document.getElementById("mcpClientBtn");
    const mcpClientResult = document.getElementById("mcpClientResult");

    mcpToolSelect.addEventListener("change", () => {
        if (mcpToolSelect.value === "get_live_score") {
            mcpArgInput.value = "India vs West Indies";
        } else {
            mcpArgInput.value = "Shubman Gill";
        }
    });

    mcpClientBtn.addEventListener("click", () => {
        const tool_name = mcpToolSelect.value;
        const argVal = mcpArgInput.value.trim();
        const tool_args = tool_name === "get_live_score" ? { teams: argVal } : { player_name: argVal };

        callApi({
            btn: mcpClientBtn,
            result: mcpClientResult,
            endpoint: "/api/mcp-client",
            body: { tool_name, tool_args },
            render: (data, el) => {
                let out = `🔌 MCP Server Tool Output:\n${data.result}\n\n`;
                out += `Discovered Server Tools (${(data.server_tools || []).length}):\n`;
                (data.server_tools || []).forEach((t) => {
                    out += `  - ${t.name}: ${t.description}\n`;
                });
                el.textContent = out.trim();
            },
        });
    });

    // 2. MCP Agent
    const mcpAgentInput = document.getElementById("mcpAgentInput");
    const mcpAgentBtn = document.getElementById("mcpAgentBtn");
    const mcpAgentResult = document.getElementById("mcpAgentResult");
    const mcpAgentValidation = document.getElementById("mcpAgentValidation");

    document.querySelectorAll("#card-mcpAgent .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-mcpAgent .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            mcpAgentInput.value = chip.dataset.q;
            mcpAgentBtn.disabled = !mcpAgentInput.value.trim();
        });
    });

    mcpAgentInput.addEventListener("input", () => {
        mcpAgentBtn.disabled = !mcpAgentInput.value.trim();
        mcpAgentValidation.textContent = "";
    });

    mcpAgentBtn.addEventListener("click", () => {
        const question = mcpAgentInput.value.trim();
        if (!question) {
            mcpAgentValidation.textContent = "Please enter a question.";
            return;
        }
        callApi({
            btn: mcpAgentBtn,
            result: mcpAgentResult,
            endpoint: "/api/mcp-agent",
            body: { question },
            render: (data, el) => {
                let out = `🤖 MCP Agent Answer:\n${data.answer}\n\n`;
                if (data.trace && data.trace.length) {
                    out += `Execution Trace:\n`;
                    data.trace.forEach((step, i) => {
                        out += `  Step ${i + 1}: ${step.action || step.role} -> ${step.tool || step.content || ""}\n`;
                    });
                }
                el.textContent = out.trim();
            },
        });
    });

    // 3. MCP Evals
    const mcpEvalsBtn = document.getElementById("mcpEvalsBtn");
    const mcpEvalsResult = document.getElementById("mcpEvalsResult");

    mcpEvalsBtn.addEventListener("click", () => {
        callApi({
            btn: mcpEvalsBtn,
            result: mcpEvalsResult,
            endpoint: "/api/mcp-evals",
            body: {},
            render: (data, el) => {
                let out = `🧪 ${data.result}\n\n`;
                (data.results || []).forEach((tc, i) => {
                    const status = tc.overall_passed ? "✅ PASS" : "❌ FAIL";
                    out += `[Case ${i + 1}] "${tc.prompt}" [${status}]\n`;
                    out += `  - Routing check: ${tc.tool_routing_passed ? "Passed" : "Failed"} (Expected: ${tc.expected_tool}, Used: ${tc.tools_used.join(",") || "none"})\n`;
                    out += `  - Content tokens: ${tc.answer_verified ? "Verified" : "Missing expected tokens"}\n\n`;
                });
                el.textContent = out.trim();
            },
        });
    });
});
