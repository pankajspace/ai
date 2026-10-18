// 01-ai-basics front-end logic
const API = document.body.dataset.apiBase || "";

let memoryHistory = [];

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
            result.textContent = data.result || data.response || JSON.stringify(data, null, 2);
        }
    } catch (e) {
        result.className = "result visible error";
        result.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    } finally {
        setLoading(btn, false);
    }
}

function bindPresetChips(cardId, inputId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const input = document.getElementById(inputId);
    card.querySelectorAll(".preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            card.querySelectorAll(".preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            if (input) {
                input.value = chip.dataset.value || chip.textContent.trim();
                input.dispatchEvent(new Event("input"));
            }
        });
    });
}

function setupCard(config) {
    const input = document.getElementById(config.inputId);
    const btn = document.getElementById(config.buttonId);
    const result = document.getElementById(config.resultId);
    const validation = config.validationId ? document.getElementById(config.validationId) : null;

    const currentValue = () => (input ? input.value.trim() : "");
    if (btn) btn.disabled = !currentValue();

    if (input) {
        input.addEventListener("input", () => {
            if (btn) btn.disabled = !currentValue();
            if (validation) validation.textContent = "";
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && currentValue()) {
                e.preventDefault();
                btn.click();
            }
        });
    }

    if (btn) {
        btn.addEventListener("click", () => {
            const value = currentValue();
            if (!value) {
                if (validation) validation.textContent = config.requiredMessage || "Please enter a value.";
                if (input) input.focus();
                return;
            }
            const body = config.getBody ? config.getBody(value) : { [config.field || "message"]: value };
            callApi({
                btn,
                result,
                endpoint: config.endpoint,
                body,
                render: config.render,
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Travel Guide
    bindPresetChips("card-travel", "travelInput");
    setupCard({
        inputId: "travelInput",
        buttonId: "travelBtn",
        resultId: "travelResult",
        validationId: "travelValidation",
        endpoint: "/api/travel",
        field: "city",
        requiredMessage: "Please enter a city.",
        render: (data, el) => {
            el.textContent = `✈️ Activity suggestion for ${data.city}:

${data.suggestion}`;
        },
    });

    // 2. Joke Generator
    bindPresetChips("card-joke", "jokeInput");
    setupCard({
        inputId: "jokeInput",
        buttonId: "jokeBtn",
        resultId: "jokeResult",
        validationId: "jokeValidation",
        endpoint: "/api/joke",
        field: "topic",
        requiredMessage: "Please enter a topic.",
        render: (data, el) => {
            el.textContent = `😂 Joke about ${data.topic}:

${data.joke}`;
        },
    });

    // 3. Summarizer
    bindPresetChips("card-summarizer", "summarizerInput");
    setupCard({
        inputId: "summarizerInput",
        buttonId: "summarizerBtn",
        resultId: "summarizerResult",
        validationId: "summarizerValidation",
        endpoint: "/api/summarize",
        field: "text",
        requiredMessage: "Please enter text to summarize.",
        render: (data, el) => {
            el.textContent = `📝 Summary:

${data.summary}`;
        },
    });

    // 4. Memory Chat
    bindPresetChips("card-memoryChat", "memoryChatInput");
    setupCard({
        inputId: "memoryChatInput",
        buttonId: "memoryChatBtn",
        resultId: "memoryChatResult",
        validationId: "memoryChatValidation",
        endpoint: "/api/memory-chat",
        getBody: (msg) => ({ message: msg, history: memoryHistory }),
        requiredMessage: "Please enter a message.",
        render: (data, el) => {
            memoryHistory = data.history || [];
            el.textContent = `Assistant:
${data.response}

[Memory Buffer: ${memoryHistory.length} messages]`;
        },
    });

    // 5. OpenAI Tool Agent
    bindPresetChips("card-agentOneTool", "agentOneToolInput");
    setupCard({
        inputId: "agentOneToolInput",
        buttonId: "agentOneToolBtn",
        resultId: "agentOneToolResult",
        validationId: "agentOneToolValidation",
        endpoint: "/api/agent",
        field: "message",
        requiredMessage: "Please enter a query.",
        render: (data, el) => {
            el.textContent = `Agent Response:

${data.response}`;
        },
    });

    // 6. LangChain One-Tool Agent
    bindPresetChips("card-langchainOneTool", "langchainOneToolInput");
    setupCard({
        inputId: "langchainOneToolInput",
        buttonId: "langchainOneToolBtn",
        resultId: "langchainOneToolResult",
        validationId: "langchainOneToolValidation",
        endpoint: "/api/langchain-one-tool",
        field: "message",
        requiredMessage: "Please enter a query.",
        render: (data, el) => {
            const badge = data.tool_called ? "🔧 Tool Invoked: get_weather" : "💬 Direct Model Response (No Tool)";
            el.textContent = `[${badge}]

${data.response}`;
        },
    });

    // 7. LangChain Multi-Tool Agent
    bindPresetChips("card-multiToolAgent", "multiToolAgentInput");
    setupCard({
        inputId: "multiToolAgentInput",
        buttonId: "multiToolAgentBtn",
        resultId: "multiToolAgentResult",
        validationId: "multiToolAgentValidation",
        endpoint: "/api/multi-tool-agent",
        field: "message",
        requiredMessage: "Please enter a query.",
        render: (data, el) => {
            const badge = data.tool_called ? "🤖 Multi-Tool Orchestration Active" : "💬 Direct Model Response";
            el.textContent = `[${badge}]

${data.response}`;
        },
    });
});
