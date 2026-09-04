// AWS Strands — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/aws-strands").

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

    btn.disabled = !currentValue();

    input.addEventListener("input", () => {
        btn.disabled = !currentValue();
        if (validation) validation.textContent = "";
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && currentValue()) {
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
    result.textContent = data.result;
};

document.addEventListener("DOMContentLoaded", () => {
    // Module 1 — plain, tool-less agent.
    setupCard({
        inputId: "askInput",
        buttonId: "askBtn",
        resultId: "askResult",
        validationId: "askValidation",
        requiredMessage: "Please enter a prompt.",
        endpoint: "/ask",
        field: "message",
        render: renderText,
    });

    // Module 2 — tool-enabled tip calculator.
    setupCard({
        inputId: "tipInput",
        buttonId: "tipBtn",
        resultId: "tipResult",
        validationId: "tipValidation",
        requiredMessage: "Please enter a tip question.",
        endpoint: "/tip",
        field: "message",
        render: renderText,
    });

    // Module 2 — pre-built calculator tool.
    setupCard({
        inputId: "mathInput",
        buttonId: "mathBtn",
        resultId: "mathResult",
        validationId: "mathValidation",
        requiredMessage: "Please enter a math question.",
        endpoint: "/math",
        field: "message",
        render: renderText,
    });

    // Module 2 — custom inventory tool.
    setupCard({
        inputId: "inventoryInput",
        buttonId: "inventoryBtn",
        resultId: "inventoryResult",
        validationId: "inventoryValidation",
        requiredMessage: "Please enter a stock question.",
        endpoint: "/inventory",
        field: "message",
        render: renderText,
    });

    // Module 2 — multi-tool sales planning.
    setupCard({
        inputId: "salesInput",
        buttonId: "salesBtn",
        resultId: "salesResult",
        validationId: "salesValidation",
        requiredMessage: "Please enter a sales request.",
        endpoint: "/sales",
        field: "message",
        render: renderText,
    });

    // Module 2 — class-based, stateful inventory tools.
    setupCard({
        inputId: "stockInput",
        buttonId: "stockBtn",
        resultId: "stockResult",
        validationId: "stockValidation",
        requiredMessage: "Please enter a stock request.",
        endpoint: "/stock",
        field: "message",
        render: renderText,
    });

    // Module 2 — async tools running in parallel.
    setupCard({
        inputId: "warehouseInput",
        buttonId: "warehouseBtn",
        resultId: "warehouseResult",
        validationId: "warehouseValidation",
        requiredMessage: "Please enter a warehouse question.",
        endpoint: "/warehouse",
        field: "message",
        render: renderText,
    });

    // Module 3 — multi-tool travel assistant (capstone).
    setupCard({
        inputId: "travelInput",
        buttonId: "travelBtn",
        resultId: "travelResult",
        validationId: "travelValidation",
        requiredMessage: "Please describe your trip.",
        endpoint: "/travel",
        field: "message",
        render: renderText,
    });
});
