// RAG Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/rag").

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
 * Wire up the PDF Chat card — file upload, then question input.
 */
function setupPdfChat() {
    const fileInput = document.getElementById("pdfFile");
    const fileLabel = document.getElementById("pdfFileLabel");
    const uploadBtn = document.getElementById("pdfUploadBtn");
    const uploadResult = document.getElementById("pdfUploadResult");
    const questionInput = document.getElementById("pdfQuestion");
    const chatBtn = document.getElementById("pdfChatBtn");
    const chatResult = document.getElementById("pdfChatResult");
    const validation = document.getElementById("pdfValidation");

    let pdfUploaded = false;

    // Show selected file name.
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            fileLabel.textContent = fileInput.files[0].name;
            fileLabel.classList.add("has-file");
            uploadBtn.disabled = false;
        } else {
            fileLabel.textContent = "Choose PDF…";
            fileLabel.classList.remove("has-file");
            uploadBtn.disabled = true;
        }
    });

    // Upload the PDF.
    uploadBtn.addEventListener("click", async () => {
        if (!fileInput.files.length) return;
        setLoading(uploadBtn, true);
        uploadResult.className = "result visible";
        uploadResult.textContent = "";
        try {
            const form = new FormData();
            form.append("pdf", fileInput.files[0]);
            const res = await fetch(`${API}/pdf-upload`, {
                method: "POST",
                body: form,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            uploadResult.textContent = data.result;
            pdfUploaded = true;
        } catch (e) {
            uploadResult.innerHTML = `<span class="error">Error: ${e.message}</span>`;
        } finally {
            setLoading(uploadBtn, false);
        }
    });

    // Enable chat button when question has text and PDF is uploaded.
    questionInput.addEventListener("input", () => {
        chatBtn.disabled = !questionInput.value.trim() || !pdfUploaded;
        validation.textContent = "";
    });

    questionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && questionInput.value.trim() && pdfUploaded) {
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
        if (!pdfUploaded) {
            validation.textContent = "Please upload a PDF first.";
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

document.addEventListener("DOMContentLoaded", () => {
    setupEmbeddings();

    setupChunking();

    setupCard({
        inputId: "ragInput",
        buttonId: "ragBtn",
        resultId: "ragResult",
        validationId: "ragValidation",
        requiredMessage: "Please enter a question.",
        endpoint: "/rag",
        field: "question",
        render: renderText,
    });

    setupCard({
        inputId: "rerankInput",
        buttonId: "rerankBtn",
        resultId: "rerankResult",
        validationId: "rerankValidation",
        requiredMessage: "Please enter a question.",
        endpoint: "/rerank",
        field: "question",
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
