// Docker Quiz Lab — front-end behavior (no frameworks)
//
// The API base path is injected by the Flask server into the <body
// data-api-base="..."> attribute. Locally it is empty (relative URLs);
// in production it is the path prefix (e.g. "/docker").

const API = document.body.dataset.apiBase || "";

let score = 0;
let answered = 0;
let currentQuestion = null;

// ── Quiz ─────────────────────────────────────────────────────────────

async function loadQuestion() {
    const questionArea = document.getElementById("quizQuestion");
    const resultEl = document.getElementById("quizResult");
    const navEl = document.getElementById("quizNav");
    const startBtn = document.getElementById("quizStartBtn");

    resultEl.className = "result";
    resultEl.textContent = "";
    navEl.style.display = "none";
    startBtn.style.display = "none";
    questionArea.style.display = "block";

    try {
        const res = await fetch(`${API}/quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        currentQuestion = data;
        renderQuestion(data);
    } catch (e) {
        resultEl.className = "result visible";
        resultEl.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    }
}

function renderQuestion(q) {
    document.getElementById("questionText").textContent = q.question;
    const choicesArea = document.getElementById("choicesArea");
    choicesArea.innerHTML = "";

    q.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = choice;
        btn.addEventListener("click", () => submitAnswer(i));
        choicesArea.appendChild(btn);
    });
}

async function submitAnswer(answerIndex) {
    if (!currentQuestion) return;

    const buttons = document.querySelectorAll(".choice-btn");
    buttons.forEach((btn) => (btn.disabled = true));

    try {
        const res = await fetch(`${API}/quiz/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: currentQuestion.id,
                answer: answerIndex,
            }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        answered++;
        if (data.correct) score++;

        buttons.forEach((btn, i) => {
            if (i === data.correct_index) btn.classList.add("correct");
            if (i === answerIndex && !data.correct) btn.classList.add("wrong");
        });

        const resultEl = document.getElementById("quizResult");
        const icon = data.correct ? "✅" : "❌";
        const cssClass = data.correct ? "correct-result" : "wrong-result";
        resultEl.className = `result visible ${cssClass}`;
        resultEl.textContent = `${icon} ${data.explanation}`;

        const navEl = document.getElementById("quizNav");
        navEl.style.display = "flex";
        document.getElementById("quizScore").textContent =
            `Score: ${score}/${answered}`;
    } catch (e) {
        const resultEl = document.getElementById("quizResult");
        resultEl.className = "result visible";
        resultEl.innerHTML = `<span class="error">Error: ${e.message}</span>`;
    }
}

// ── QuickBite ETA (Level 1) ──────────────────────────────────────────

async function predictETA() {
    const btn = document.getElementById("qb-predict-btn");
    const resultEl = document.getElementById("quickbiteResult");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Predicting...';
    resultEl.className = "result";

    const body = {
        distance_km: parseFloat(document.getElementById("qb-distance").value),
        prep_time_min: parseFloat(document.getElementById("qb-prep").value),
        rider_available: parseInt(document.getElementById("qb-rider").value),
        is_raining: parseInt(document.getElementById("qb-rain").value),
    };

    try {
        const res = await fetch(`${API}/quickbite/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        resultEl.className = "result visible correct-result";
        resultEl.textContent = `🛵 ${data.message}  (${data.eta_minutes} min)`;
    } catch (e) {
        resultEl.className = "result visible wrong-result";
        resultEl.textContent = `Error: ${e.message}`;
    } finally {
        btn.disabled = false;
        btn.textContent = "Predict ETA 🛵";
    }
}

// ── ScalerGPT (Level 2) ─────────────────────────────────────────────

async function askScalerGPT() {
    const btn = document.getElementById("sg-ask-btn");
    const resultEl = document.getElementById("scalergptResult");
    const query = document.getElementById("sg-query").value.trim();
    if (!query) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Thinking...';
    resultEl.className = "result";

    try {
        const res = await fetch(`${API}/scalergpt/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.detail) throw new Error(data.detail);

        resultEl.className = "result visible correct-result";
        resultEl.textContent = `📚 ${data.answer}\n\n(${data.sources_used} source chunks used)`;
    } catch (e) {
        resultEl.className = "result visible wrong-result";
        resultEl.textContent = `Error: ${e.message}`;
    } finally {
        btn.disabled = false;
        btn.textContent = "Ask ScalerGPT 📚";
    }
}

// ── DeskBuddy (Level 3) ─────────────────────────────────────────────

async function chatDeskBuddy() {
    const btn = document.getElementById("db-chat-btn");
    const resultEl = document.getElementById("deskbuddyResult");
    const message = document.getElementById("db-message").value.trim();
    const sessionId = document.getElementById("db-session").value.trim() || "demo";
    if (!message) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Agent thinking...';

    // Append user message to existing result
    const prevContent = resultEl.classList.contains("visible")
        ? resultEl.textContent + "\n\n"
        : "";

    try {
        const res = await fetch(`${API}/deskbuddy/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, message }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        resultEl.className = "result visible correct-result";
        resultEl.textContent = prevContent + `You: ${message}\n🤖: ${data.answer}`;
        document.getElementById("db-message").value = "";
    } catch (e) {
        resultEl.className = "result visible wrong-result";
        resultEl.textContent = prevContent + `Error: ${e.message}`;
    } finally {
        btn.disabled = false;
        btn.textContent = "Send to Agent 🤖";
    }
}

// ── Toggle buttons (Yes/No for QuickBite) ────────────────────────────

function setupToggles() {
    document.querySelectorAll(".toggle-opt").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const field = btn.dataset.field;
            const val = btn.dataset.val;

            // Deactivate siblings, activate this one
            btn.parentElement.querySelectorAll(".toggle-opt").forEach((b) =>
                b.classList.remove("active")
            );
            btn.classList.add("active");
            document.getElementById(field).value = val;
        });
    });
}

// ── Range slider labels ──────────────────────────────────────────────

function setupRangeLabels() {
    document.querySelectorAll('input[type="range"]').forEach((range) => {
        const valSpan = document.getElementById(range.id + "-val");
        if (valSpan) {
            range.addEventListener("input", () => {
                valSpan.textContent = range.value;
            });
        }
    });
}

// ── Init ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("quizStartBtn").addEventListener("click", loadQuestion);
    document.getElementById("nextBtn").addEventListener("click", loadQuestion);
    setupToggles();
    setupRangeLabels();
});
