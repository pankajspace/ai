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

const renderArena = (data, result) => {
    const { model_a: a, model_b: b } = data.result;
    result.innerHTML = `
        <div class="arena-grid">
            <div class="arena-col">
                <div class="model-name">🤖 ${a.model}</div>${a.reply}
            </div>
            <div class="arena-col">
                <div class="model-name">🤖 ${b.model}</div>${b.reply}
            </div>
        </div>`;
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
        inputId: "promptInput",
        buttonId: "arenaBtn",
        resultId: "arenaResult",
        validationId: "promptValidation",
        requiredMessage: "Please enter a prompt.",
        endpoint: "/arena",
        field: "prompt",
        render: renderArena,
    });
});
