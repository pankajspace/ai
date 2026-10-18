// 04-ai-model-training-chromadb front-end logic
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
    // 1. Delivery ETA
    const mlBtn = document.getElementById("mlBtn");
    const mlResult = document.getElementById("mlResult");
    const mlDistance = document.getElementById("mlDistance");
    const mlPrep = document.getElementById("mlPrep");
    const mlRider = document.getElementById("mlRider");
    const mlRain = document.getElementById("mlRain");

    mlBtn.addEventListener("click", () => {
        callApi({
            btn: mlBtn,
            result: mlResult,
            endpoint: "/api/model-training",
            body: {
                distance_km: parseFloat(mlDistance.value),
                prep_time_min: parseFloat(mlPrep.value),
                rider_available: parseInt(mlRider.value, 10),
                is_raining: parseInt(mlRain.value, 10),
            },
            render: (data, el) => {
                el.textContent = `🍔 Delivery Prediction:
${data.message}

Inputs:
- Trip Distance: ${data.distance_km} km
- Kitchen Preparation: ${data.prep_time_min} min
- Rider Available: ${data.rider_available ? "Yes" : "No"}
- Rain/Storm: ${data.is_raining ? "Yes" : "No"}`;
            },
        });
    });

    // 2. ScalerGPT ChromaDB
    const chromaInput = document.getElementById("chromaInput");
    const chromaBtn = document.getElementById("chromaBtn");
    const chromaResult = document.getElementById("chromaResult");
    const chromaValidation = document.getElementById("chromaValidation");

    document.querySelectorAll("#card-chroma .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-chroma .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            chromaInput.value = chip.dataset.q;
            chromaBtn.disabled = !chromaInput.value.trim();
        });
    });

    chromaInput.addEventListener("input", () => {
        chromaBtn.disabled = !chromaInput.value.trim();
        chromaValidation.textContent = "";
    });

    chromaBtn.addEventListener("click", () => {
        const question = chromaInput.value.trim();
        if (!question) {
            chromaValidation.textContent = "Please enter a question.";
            return;
        }
        callApi({
            btn: chromaBtn,
            result: chromaResult,
            endpoint: "/api/chromadb",
            body: { question },
            render: (data, el) => {
                let out = `📚 ScalerGPT Answer:
${data.answer}

`;
                out += `Indexed Notes Chunks: ${data.docs_indexed}
`;
                out += `Sources:
`;
                data.sources.forEach((s) => {
                    out += `- ${s.source}: ${s.content.slice(0, 100)}…
`;
                });
                el.textContent = out.trim();
            },
        });
    });

    // 3. DeskBuddy Redis Agent
    const redisInput = document.getElementById("redisInput");
    const redisBtn = document.getElementById("redisBtn");
    const redisResetBtn = document.getElementById("redisResetBtn");
    const redisResult = document.getElementById("redisResult");
    const redisValidation = document.getElementById("redisValidation");

    document.querySelectorAll("#card-redis .preset-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("#card-redis .preset-chip").forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");
            redisInput.value = chip.dataset.msg;
            redisBtn.disabled = !redisInput.value.trim();
        });
    });

    redisInput.addEventListener("input", () => {
        redisBtn.disabled = !redisInput.value.trim();
        redisValidation.textContent = "";
    });

    redisBtn.addEventListener("click", () => {
        const message = redisInput.value.trim();
        if (!message) {
            redisValidation.textContent = "Please enter a query for DeskBuddy.";
            return;
        }
        callApi({
            btn: redisBtn,
            result: redisResult,
            endpoint: "/api/redis",
            body: { message, session_id: "demo", reset_session: false },
            render: (data, el) => {
                let out = `🤖 DeskBuddy:
${data.answer}

`;
                out += `[Memory backend: ${data.storage_backend} &middot; Stored turns: ${data.stored_messages_count}]
`;
                if (data.tool_calls && data.tool_calls.length) {
                    out += `Tools Executed:
`;
                    data.tool_calls.forEach((tc) => {
                        out += `  🔧 ${tc.tool}(${JSON.stringify(tc.args)}) -> ${JSON.stringify(tc.result)}
`;
                    });
                }
                el.textContent = out.trim();
            },
        });
    });

    redisResetBtn.addEventListener("click", () => {
        callApi({
            btn: redisResetBtn,
            result: redisResult,
            endpoint: "/api/redis",
            body: { message: "", session_id: "demo", reset_session: true },
            render: (data, el) => {
                el.textContent = `Session reset. Memory buffer cleared on ${data.storage_backend}.`;
            },
        });
    });
});
