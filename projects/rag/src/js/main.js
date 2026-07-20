// RAG Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/rag").

const API = document.body.dataset.apiBase || "";
const TEXTAREA_MAX_CHARS = 1000;

function setupTextareaCounter(textarea) {
    const maxChars = textarea.maxLength > 0 ? textarea.maxLength : TEXTAREA_MAX_CHARS;
    const counter = document.getElementById(`${textarea.id}Count`);
    const updateCounter = () => {
        if (textarea.value.length > maxChars) {
            textarea.value = textarea.value.slice(0, maxChars);
        }
        if (counter) counter.textContent = `${textarea.value.length}/${maxChars}`;
    };

    textarea.addEventListener("input", updateCounter);
    updateCounter();
}

function isOverTextareaLimit(value) {
    return value.length > TEXTAREA_MAX_CHARS;
}

function showLimitError(validation, label) {
    validation.textContent = `${label} must be ${TEXTAREA_MAX_CHARS} characters or fewer.`;
}

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
        return true;
    } catch (e) {
        result.innerHTML = `<span class="error">Error: ${e.message}</span>`;
        return false;
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

    if (input.tagName === "TEXTAREA") setupTextareaCounter(input);

    input.addEventListener("input", () => {
        btn.disabled = !currentValue();
        if (validation) validation.textContent = "";
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && currentValue()) btn.click();
    });

    btn.addEventListener("click", () => {
        const value = currentValue();
        if (!value) {
            if (validation) validation.textContent = config.requiredMessage;
            input.focus();
            return;
        }
        if (validation && isOverTextareaLimit(input.value)) {
            showLimitError(validation, config.label || "Text");
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
 * Wire up the Embeddings card — two inputs, compare similarity.
 */
function setupEmbeddings() {
    const inputA = document.getElementById("embTextA");
    const inputB = document.getElementById("embTextB");
    const btn = document.getElementById("embBtn");
    const result = document.getElementById("embResult");
    const validation = document.getElementById("embValidation");

    const bothFilled = () => inputA.value.trim() && inputB.value.trim();

    [inputA, inputB].forEach((input) => {
        input.addEventListener("input", () => {
            btn.disabled = !bothFilled();
            validation.textContent = "";
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && bothFilled()) btn.click();
        });
    });

    btn.addEventListener("click", () => {
        const a = inputA.value.trim();
        const b = inputB.value.trim();
        if (!a || !b) {
            validation.textContent = "Both sentences are required.";
            return;
        }
        callApi({
            btn,
            result,
            endpoint: "/embeddings",
            body: { text_a: a, text_b: b },
            render: (data, el) => {
                const score = data.result.similarity;
                el.textContent = `Cosine similarity: ${score}`;
            },
        });
    });
}

/**
 * Wire up the PDF Chat card — pasted PDF text, then question input.
 */
function setupPdfChat() {
    const pdfText = document.getElementById("pdfText");
    const indexBtn = document.getElementById("pdfIndexBtn");
    const indexResult = document.getElementById("pdfIndexResult");
    const questionInput = document.getElementById("pdfQuestion");
    const chatBtn = document.getElementById("pdfChatBtn");
    const chatResult = document.getElementById("pdfChatResult");
    const validation = document.getElementById("pdfValidation");

    let pdfIndexed = false;

    setupTextareaCounter(pdfText);

    pdfText.addEventListener("input", () => {
        pdfIndexed = false;
        indexBtn.disabled = !pdfText.value.trim();
        chatBtn.disabled = true;
        validation.textContent = "";
        indexResult.className = "result";
        indexResult.textContent = "";
    });

    indexBtn.addEventListener("click", async () => {
        const text = pdfText.value.trim();
        if (!text) {
            validation.textContent = "Please paste PDF content.";
            pdfText.focus();
            return;
        }
        if (isOverTextareaLimit(pdfText.value)) {
            showLimitError(validation, "PDF text");
            pdfText.focus();
            return;
        }
        pdfIndexed = await callApi({
            btn: indexBtn,
            result: indexResult,
            endpoint: "/pdf-index",
            body: { pdf_text: text },
            render: renderText,
        });
        chatBtn.disabled = !pdfIndexed || !questionInput.value.trim();
    });

    questionInput.addEventListener("input", () => {
        chatBtn.disabled = !questionInput.value.trim() || !pdfIndexed;
        validation.textContent = "";
    });

    questionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && questionInput.value.trim() && pdfIndexed) {
            chatBtn.click();
        }
    });

    chatBtn.addEventListener("click", () => {
        const question = questionInput.value.trim();
        if (!question) {
            validation.textContent = "Please enter a question.";
            questionInput.focus();
            return;
        }
        if (!pdfIndexed) {
            validation.textContent = "Please index PDF text first.";
            return;
        }
        callApi({
            btn: chatBtn,
            result: chatResult,
            endpoint: "/pdf-chat",
            body: { question },
            render: renderText,
        });
    });
}

/**
 * Wire up the Chunking card — textarea input, show split chunks.
 */
function setupChunking() {
    const input = document.getElementById("chunkInput");
    const btn = document.getElementById("chunkBtn");
    const result = document.getElementById("chunkResult");
    const validation = document.getElementById("chunkValidation");

    setupTextareaCounter(input);

    input.addEventListener("input", () => {
        btn.disabled = !input.value.trim();
        validation.textContent = "";
    });

    btn.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) {
            validation.textContent = "Please enter some text.";
            input.focus();
            return;
        }
        if (isOverTextareaLimit(input.value)) {
            showLimitError(validation, "Text");
            input.focus();
            return;
        }
        callApi({
            btn,
            result,
            endpoint: "/chunk",
            body: { text },
            render: (data, el) => {
                const { chunks, count } = data.result;
                const lines = [`${count} chunk(s):\n`];
                chunks.forEach((c, i) => {
                    lines.push(`--- Chunk ${i + 1} (${c.length} chars) ---`);
                    lines.push(c);
                    lines.push("");
                });
                el.textContent = lines.join("\n");
            },
        });
    });
}

/**
 * Wire up a card with a knowledge base textarea + question input.
 */
function setupKbCard({ kbId, inputId, buttonId, resultId, validationId, endpoint, render }) {
    const kb = document.getElementById(kbId);
    const input = document.getElementById(inputId);
    const btn = document.getElementById(buttonId);
    const result = document.getElementById(resultId);
    const validation = document.getElementById(validationId);

    const bothFilled = () => kb.value.trim() && input.value.trim();

    setupTextareaCounter(kb);

    [kb, input].forEach((el) => {
        el.addEventListener("input", () => {
            btn.disabled = !bothFilled();
            validation.textContent = "";
        });
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && bothFilled()) btn.click();
    });

    btn.addEventListener("click", () => {
        const knowledge = kb.value.trim();
        const question = input.value.trim();
        if (!knowledge) {
            validation.textContent = "Please enter a knowledge base.";
            kb.focus();
            return;
        }
        if (isOverTextareaLimit(kb.value)) {
            showLimitError(validation, "Knowledge base");
            kb.focus();
            return;
        }
        if (!question) {
            validation.textContent = "Please enter a question.";
            input.focus();
            return;
        }
        callApi({
            btn,
            result,
            endpoint,
            body: { knowledge_base: knowledge, question },
            render,
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupEmbeddings();

    setupChunking();

    setupKbCard({
        kbId: "ragKb",
        inputId: "ragInput",
        buttonId: "ragBtn",
        resultId: "ragResult",
        validationId: "ragValidation",
        endpoint: "/rag",
        render: renderText,
    });

    setupKbCard({
        kbId: "rerankKb",
        inputId: "rerankInput",
        buttonId: "rerankBtn",
        resultId: "rerankResult",
        validationId: "rerankValidation",
        endpoint: "/rerank",
        render: (data, el) => {
            const results = data.result.results;
            const lines = [`Top ${results.length} reranked result(s):\n`];
            results.forEach((r, i) => {
                lines.push(`${i + 1}. ${r}`);
            });
            el.textContent = lines.join("\n");
        },
    });

    setupPdfChat();
});
