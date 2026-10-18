// 03-ai-rag-chroma front-end logic
const API = document.body.dataset.apiBase || "";

function setLoading(btn, loading) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = loading;
    btn.innerHTML = loading
        ? '<span class="spinner"></span> Processing…'
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
    // 1. Chunking
    const chunkInput = document.getElementById("chunkingInput");
    const chunkBtn = document.getElementById("chunkingBtn");
    const chunkResult = document.getElementById("chunkingResult");
    const chunkValidation = document.getElementById("chunkingValidation");
    const chunkSizeSelect = document.getElementById("chunkSize");
    const chunkOverlapSelect = document.getElementById("chunkOverlap");

    document.querySelectorAll("#card-chunking .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-chunking .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            chunkInput.value = chip.dataset.value;
            chunkBtn.disabled = !chunkInput.value.trim();
        });
    });

    chunkInput.addEventListener("input", () => {
        chunkBtn.disabled = !chunkInput.value.trim();
        chunkValidation.textContent = "";
    });

    chunkBtn.addEventListener("click", () => {
        const text = chunkInput.value.trim();
        if (!text) {
            chunkValidation.textContent = "Please enter text to split.";
            return;
        }
        callApi({
            btn: chunkBtn,
            result: chunkResult,
            endpoint: "/api/chunk",
            body: {
                text,
                chunk_size: parseInt(chunkSizeSelect.value, 10),
                chunk_overlap: parseInt(chunkOverlapSelect.value, 10),
            },
            render: (data, el) => {
                let html = `<strong>${data.result}</strong>

`;
                data.chunks.forEach((chunk, i) => {
                    html += `[Chunk ${i + 1} &middot; ${chunk.length} chars]
${chunk}

`;
                });
                el.textContent = html.trim();
            },
        });
    });

    // 2. Semantic Embeddings
    const t1Input = document.getElementById("embeddingText1");
    const t2Input = document.getElementById("embeddingText2");
    const embedBtn = document.getElementById("embeddingBtn");
    const embedResult = document.getElementById("embeddingResult");
    const embedValidation = document.getElementById("embeddingValidation");

    document.querySelectorAll("#card-embedding .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-embedding .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            t1Input.value = chip.dataset.t1;
            t2Input.value = chip.dataset.t2;
            embedBtn.disabled = !t1Input.value.trim() || !t2Input.value.trim();
        });
    });

    const checkEmbedInputs = () => {
        embedBtn.disabled = !t1Input.value.trim() || !t2Input.value.trim();
        embedValidation.textContent = "";
    };
    t1Input.addEventListener("input", checkEmbedInputs);
    t2Input.addEventListener("input", checkEmbedInputs);

    embedBtn.addEventListener("click", () => {
        const text1 = t1Input.value.trim();
        const text2 = t2Input.value.trim();
        if (!text1 || !text2) {
            embedValidation.textContent = "Please provide both text inputs.";
            return;
        }
        callApi({
            btn: embedBtn,
            result: embedResult,
            endpoint: "/api/embedding",
            body: { text1, text2 },
            render: (data, el) => {
                const score = (data.similarity * 100).toFixed(1);
                el.textContent = `📐 Similarity Score: ${score}% (Cosine: ${data.similarity})
Embedding Dimensions: ${data.dimensions}

Preview [${text1.slice(0, 30)}…]:
[${data.preview_text1.join(", ")}…]

Preview [${text2.slice(0, 30)}…]:
[${data.preview_text2.join(", ")}…]`;
            },
        });
    });

    // 3. RAG QA
    const ragPara = document.getElementById("ragParagraph");
    const ragQ = document.getElementById("ragQuestion");
    const ragBtn = document.getElementById("ragBtn");
    const ragResult = document.getElementById("ragResult");
    const ragValidation = document.getElementById("ragValidation");

    document.querySelectorAll("#card-rag .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-rag .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            ragQ.value = chip.dataset.q;
            ragBtn.disabled = !ragPara.value.trim() || !ragQ.value.trim();
        });
    });

    const checkRagInputs = () => {
        ragBtn.disabled = !ragPara.value.trim() || !ragQ.value.trim();
        ragValidation.textContent = "";
    };
    ragPara.addEventListener("input", checkRagInputs);
    ragQ.addEventListener("input", checkRagInputs);

    ragBtn.addEventListener("click", () => {
        const paragraph = ragPara.value.trim();
        const question = ragQ.value.trim();
        if (!paragraph || !question) {
            ragValidation.textContent = "Please provide both paragraph and question.";
            return;
        }
        callApi({
            btn: ragBtn,
            result: ragResult,
            endpoint: "/api/rag",
            body: { paragraph, question },
            render: (data, el) => {
                let out = `💬 Grounded Answer:
${data.answer}

`;
                out += `🔍 Retrieved Chroma Chunks (${data.sources.length}):
`;
                data.sources.forEach((src, idx) => {
                    out += `--- [Source ${idx + 1}] ---
${src}
`;
                });
                el.textContent = out.trim();
            },
        });
    });
});
