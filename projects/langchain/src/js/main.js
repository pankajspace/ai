// LangChain Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/langchain").

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

    input.addEventListener("input", () => {
        btn.disabled = !currentValue();
        if (validation) validation.textContent = "";
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
    result.textContent = data.result;
};

/**
 * Wire up the memory chat: keep a running history, append bubbles, and send
 * the full history with every message so the bot "remembers" the conversation.
 */
function setupChat() {
    const input = document.getElementById("chatInput");
    const btn = document.getElementById("chatBtn");
    const window = document.getElementById("chatWindow");
    const resetBtn = document.getElementById("chatResetBtn");

    // The running conversation, sent to the server on every turn.
    const history = [];

    const addBubble = (text, role) => {
        const bubble = document.createElement("div");
        bubble.className = `bubble ${role}`;
        bubble.textContent = text;
        window.appendChild(bubble);
        window.scrollTop = window.scrollHeight;
        return bubble;
    };

    const send = async () => {
        const message = input.value.trim();
        if (!message) return;

        addBubble(message, "user");
        input.value = "";
        btn.disabled = true;
        setLoading(btn, true);

        try {
            const res = await fetch(`${API}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, history }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            addBubble(data.result, "bot");
            // Record both turns so the next request carries full context.
            history.push({ role: "user", content: message });
            history.push({ role: "assistant", content: data.result });
            resetBtn.hidden = false;
        } catch (e) {
            addBubble(`Error: ${e.message}`, "error");
        } finally {
            setLoading(btn, false);
            input.focus();
        }
    };

    input.addEventListener("input", () => {
        btn.disabled = !input.value.trim();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && input.value.trim()) send();
    });

    btn.addEventListener("click", send);

    resetBtn.addEventListener("click", () => {
        history.length = 0;
        window.innerHTML = "";
        resetBtn.hidden = true;
        input.focus();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupCard({
        inputId: "urlInput",
        buttonId: "summarizeBtn",
        resultId: "summarizeResult",
        validationId: "urlValidation",
        requiredMessage: "Please enter a website URL.",
        endpoint: "/summarize",
        field: "url",
        render: renderText,
    });

    setupCard({
        inputId: "agentInput",
        buttonId: "agentBtn",
        resultId: "agentResult",
        validationId: "agentValidation",
        requiredMessage: "Please enter a question.",
        endpoint: "/agent",
        field: "message",
        render: renderText,
    });

    setupChat();
});
