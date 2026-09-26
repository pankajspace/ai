// AI Reliability Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix ("/ai-reliability").

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
        if (!res.ok) {
            let errMsg = `Request failed (${res.status})`;
            try {
                const errData = await res.json();
                if (errData && errData.error) errMsg = errData.error;
            } catch (_) {
                if (res.status === 429) {
                    errMsg = "Rate limit exceeded (10 requests per hour). Please wait an hour and try again.";
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
        const body = { [config.field]: value };
        // config.selects maps a JSON body key to the id of a <select> on the card.
        for (const [key, id] of Object.entries(config.selects || {})) {
            body[key] = document.getElementById(id).value;
        }
        callApi({
            btn,
            result,
            endpoint: config.endpoint,
            body,
            render: config.render,
        });
    });
}

const renderText = (data, result) => {
    result.textContent = data.result;
};

document.addEventListener("DOMContentLoaded", () => {
    setupCard({
        inputId: "varianceInput",
        buttonId: "varianceBtn",
        resultId: "varianceResult",
        validationId: "varianceValidation",
        requiredMessage: "Please enter a customer review.",
        endpoint: "/variance",
        field: "message",
        selects: { strategy: "varianceStrategy", temperature: "varianceTemperature" },
        render: renderText,
    });
    setupCard({
        inputId: "cotInput",
        buttonId: "cotBtn",
        resultId: "cotResult",
        validationId: "cotValidation",
        requiredMessage: "Please choose a problem.",
        endpoint: "/cot",
        field: "message",
        selects: { strategy: "cotStrategy", temperature: "cotTemperature" },
        render: renderText,
    });
    setupCard({
        inputId: "routingInput",
        buttonId: "routingBtn",
        resultId: "routingResult",
        validationId: "routingValidation",
        requiredMessage: "Please enter a weather question.",
        endpoint: "/routing",
        field: "message",
        selects: { names: "routingNames", descriptions: "routingDescriptions" },
        render: renderText,
    });
    setupCard({
        inputId: "errorsInput",
        buttonId: "errorsBtn",
        resultId: "errorsResult",
        validationId: "errorsValidation",
        requiredMessage: "Please enter a weather question.",
        endpoint: "/errors",
        field: "message",
        selects: { prompt: "errorsPrompt", fail_on_call: "errorsFailOnCall" },
        render: renderText,
    });
});
